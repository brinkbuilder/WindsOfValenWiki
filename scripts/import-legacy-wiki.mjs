import { createHash } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const API_URL = 'https://windsofvalenwiki.com/api.php';
const ROOT = process.cwd();
const OUTPUT_JSON = path.join(ROOT, 'app', 'lib', 'legacy-wiki-data.json');
const IMAGE_DIR = path.join(ROOT, 'public', 'legacy-wiki');
const RETRIEVED_AT = new Date().toISOString().slice(0, 10);

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function requestJson(parameters, attempt = 1) {
  const url = `${API_URL}?${new URLSearchParams({ format: 'json', formatversion: '2', ...parameters })}`;
  const response = await fetch(url, { headers: { 'user-agent': 'WindsOfValenWikiImporter/1.0' } });
  if (!response.ok) {
    if (attempt < 4 && (response.status === 429 || response.status >= 500)) {
      await sleep(attempt * 1200);
      return requestJson(parameters, attempt + 1);
    }
    throw new Error(`Wiki request failed (${response.status}): ${url}`);
  }
  const data = await response.json();
  if (data.error) throw new Error(`Wiki API error: ${data.error.info ?? data.error.code}`);
  return data;
}

async function fetchCategory(category) {
  const pages = new Map();
  let continuation = {};
  do {
    const data = await requestJson({
      action: 'query',
      generator: 'categorymembers',
      gcmtitle: `Category:${category}`,
      gcmtype: 'page',
      gcmlimit: 'max',
      prop: 'revisions|categories',
      rvprop: 'ids|timestamp|content',
      rvslots: 'main',
      cllimit: 'max',
      ...continuation,
    });
    for (const page of data.query?.pages ?? []) {
      const previous = pages.get(page.pageid) ?? {};
      const revision = page.revisions?.[0];
      pages.set(page.pageid, {
        pageId: page.pageid,
        title: page.title ?? previous.title,
        revisionId: revision?.revid ?? previous.revisionId ?? 0,
        revisedAt: revision?.timestamp ?? previous.revisedAt ?? '',
        wikitext: revision?.slots?.main?.content ?? previous.wikitext ?? '',
        categories: page.categories
          ? page.categories.map((item) => item.title.replace(/^Category:/, ''))
          : previous.categories ?? [],
        sourceCategory: category,
      });
    }
    continuation = data.continue ?? null;
  } while (continuation);
  return [...pages.values()];
}

function slugify(value) {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function decodeEntities(value) {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)));
}

function stripTemplates(value) {
  let result = value;
  for (let index = 0; index < 5; index += 1) {
    const next = result.replace(/\{\{[^{}]*\}\}/g, '');
    if (next === result) break;
    result = next;
  }
  return result;
}

function stripWiki(value) {
  return decodeEntities(stripTemplates(value)
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/\[\[(?:File|Image):[^\]]+\]\]/gi, '')
    .replace(/\[\[([^\]|#]+)(?:#[^\]|]+)?\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]|#]+)(?:#[^\]]+)?\]\]/g, '$1')
    .replace(/\[(?:https?:\/\/)[^\s\]]+\s+([^\]]+)\]/g, '$1')
    .replace(/\[(?:https?:\/\/)[^\]]+\]/g, '')
    .replace(/<br\s*\/?\s*>/gi, ' · ')
    .replace(/<[^>]+>/g, '')
    .replace(/'''+/g, '')
    .replace(/^[:;]+/gm, '')
    .replace(/\s+/g, ' ')
    .trim());
}

function parseInfobox(wikitext) {
  const match = wikitext.match(/^\s*\{\{(Infobox(?:_|\s+)[^\n|}]+)([\s\S]*?)\n\}\}/i);
  if (!match) return { template: '', fields: {}, end: 0 };
  const fields = {};
  for (const line of match[2].split(/\r?\n/)) {
    const field = line.match(/^\s*\|\s*([^=]+?)\s*=\s*(.*)$/);
    if (field) fields[field[1].trim()] = field[2].trim();
  }
  return { template: match[1], fields, end: match.index + match[0].length };
}

function normalizedFileName(value) {
  const direct = value.match(/\[\[(?:File|Image):([^\]|]+)/i)?.[1] ?? value;
  return direct.replace(/^(?:File|Image):/i, '').split('|')[0].trim().replace(/_/g, ' ');
}

function fileKey(value) {
  return normalizedFileName(value).toLowerCase();
}

function localImageName(fileName) {
  const normalized = normalizedFileName(fileName);
  const extension = path.extname(normalized).toLowerCase() || '.png';
  const base = slugify(path.basename(normalized, path.extname(normalized))) || createHash('sha1').update(normalized).digest('hex').slice(0, 12);
  return `${base}${extension}`;
}

function explicitImages(wikitext, infobox) {
  const names = [];
  if (infobox.fields.image) names.push(normalizedFileName(infobox.fields.image));
  for (const match of wikitext.matchAll(/\[\[(?:File|Image):([^\]|]+)(?:\|[^\]]*)?\]\]/gi)) names.push(normalizedFileName(match[1]));
  return [...new Set(names.filter(Boolean))];
}

async function resolveImages(fileNames) {
  const infoByKey = new Map();
  for (let start = 0; start < fileNames.length; start += 25) {
    const batch = fileNames.slice(start, start + 25);
    const data = await requestJson({
      action: 'query',
      titles: batch.map((name) => `File:${name}`).join('|'),
      prop: 'imageinfo',
      iiprop: 'url|mime|size',
      iiurlwidth: '900',
    });
    for (const page of data.query?.pages ?? []) {
      const imageInfo = page.imageinfo?.[0];
      if (!imageInfo) continue;
      const name = page.title.replace(/^File:/, '');
      infoByKey.set(fileKey(name), {
        name,
        url: imageInfo.thumburl ?? imageInfo.url,
        originalUrl: imageInfo.url,
        width: imageInfo.thumbwidth ?? imageInfo.width,
        height: imageInfo.thumbheight ?? imageInfo.height,
        localName: localImageName(name),
      });
    }
  }
  return infoByKey;
}

async function downloadImages(infoByKey) {
  await mkdir(IMAGE_DIR, { recursive: true });
  const images = [...infoByKey.values()];
  let cursor = 0;
  async function worker() {
    while (cursor < images.length) {
      const image = images[cursor];
      cursor += 1;
      const response = await fetch(image.url, { headers: { 'user-agent': 'WindsOfValenWikiImporter/1.0' } });
      if (!response.ok) throw new Error(`Image download failed (${response.status}): ${image.name}`);
      await writeFile(path.join(IMAGE_DIR, image.localName), Buffer.from(await response.arrayBuffer()));
    }
  }
  await Promise.all(Array.from({ length: Math.min(8, images.length) }, worker));
}

const fieldLabels = {
  value: 'Store price',
  level: 'Level',
  health: 'Health',
  total_xp: 'Total XP',
  attack: 'Attack',
  defence: 'Defence',
  magic: 'Magic',
  archery: 'Archery',
  warding: 'Warding',
  evasion: 'Evasion',
  quick_damage: 'Quick damage',
  heavy_damage: 'Heavy damage',
  mystical_damage: 'Mystical damage',
  attack_speed: 'Attack speed',
  attack_range: 'Attack range',
  slash_accuracy: 'Slash accuracy',
  pierce_accuracy: 'Pierce accuracy',
  fire_accuracy: 'Fire accuracy',
  ice_accuracy: 'Ice accuracy',
  lightning_accuracy: 'Lightning accuracy',
  res_slash: 'Slash resistance',
  res_pierce: 'Pierce resistance',
  res_fire: 'Fire resistance',
  res_ice: 'Ice resistance',
  res_lightning: 'Lightning resistance',
  block_power: 'Block power',
  deflect_power: 'Deflect power',
  AttackRange: 'Attack range',
  AttackSpeed: 'Attack speed',
  AttackSwingSpeed: 'Swing speed',
  SlashWep: 'Slash damage',
  PierceWep: 'Pierce damage',
  FireWep: 'Fire damage',
  IceWep: 'Ice damage',
  LightningWep: 'Lightning damage',
  QuickDamage: 'Quick damage',
  HeavyDamage: 'Heavy damage',
  MysticalDamage: 'Mystical damage',
  location: 'Location',
};

function friendlyFieldName(key) {
  return fieldLabels[key] ?? key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/^\w/, (letter) => letter.toUpperCase());
}

function parseTable(block) {
  const headers = [];
  const rows = [];
  for (const line of block.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.startsWith('!')) headers.push(...trimmed.slice(1).split('!!').map((value) => {
      const header = stripWiki(value);
      return header === '%' ? 'Drop rate' : header;
    }));
  }
  const chunks = block.split(/^\|-\s*$/m).slice(1);
  for (const chunk of chunks) {
    const cellLines = chunk.split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line.startsWith('|') && line !== '|}');
    const cells = cellLines.flatMap((line) => line.slice(1).split('||')).map(stripWiki);
    if (cells.some(Boolean)) rows.push(cells);
  }
  const width = Math.max(headers.length, ...rows.map((row) => row.length), 0);
  return width ? {
    headers: Array.from({ length: width }, (_, index) => headers[index] || `Detail ${index + 1}`),
    rows: rows.map((row) => Array.from({ length: width }, (_, index) => row[index] ?? '')),
  } : null;
}

function imageCaption(options, fallback) {
  const parts = (options ?? '').split('|').map((part) => part.trim()).filter(Boolean);
  const caption = [...parts].reverse().find((part) => !/^(?:thumb|thumbnail|left|right|center|none|frameless|frame|border|upright(?:=[\d.]+)?|\d+px)$/i.test(part));
  return stripWiki(caption || fallback);
}

function sectionFromWikitext(title, body, imageInfoByKey) {
  const tableBlock = body.match(/\{\|[\s\S]*?\|\}/)?.[0];
  const bodyWithoutTable = body.replace(/\{\|[\s\S]*?\|\}/g, '');
  const images = [...bodyWithoutTable.matchAll(/\[\[(?:File|Image):([^\]|]+)(?:\|([^\]]*))?\]\]/gi)]
    .map((match) => {
      const name = normalizedFileName(match[1]);
      const info = imageInfoByKey.get(fileKey(name));
      return info ? { src: `/legacy-wiki/${info.localName}`, alt: imageCaption(match[2], name), caption: imageCaption(match[2], '') || undefined } : null;
    })
    .filter(Boolean);
  const table = tableBlock ? parseTable(tableBlock) : null;
  const withoutTablesAndImages = bodyWithoutTable
    .replace(/\[\[(?:File|Image):[^\]]+\]\]/gi, '');
  const bullets = withoutTablesAndImages.split(/\r?\n/).filter((line) => /^\*+\s+/.test(line)).map((line) => stripWiki(line.replace(/^\*+\s+/, ''))).filter(Boolean);
  const steps = withoutTablesAndImages.split(/\r?\n/).filter((line) => /^#+\s+/.test(line)).map((line) => stripWiki(line.replace(/^#+\s+/, ''))).filter(Boolean);
  const paragraphs = withoutTablesAndImages
    .replace(/^\*+\s+.*$/gm, '')
    .replace(/^#+\s+.*$/gm, '')
    .replace(/^===+\s*(.*?)\s*===+$/gm, '$1.')
    .split(/\n\s*\n/)
    .map(stripWiki)
    .filter((value) => value && !/^Category:/i.test(value));
  if (!paragraphs.length && !bullets.length && !steps.length && !table && !images.length) return null;
  return {
    title: stripWiki(title),
    ...(paragraphs.length ? { paragraphs } : {}),
    ...(bullets.length ? { bullets } : {}),
    ...(steps.length ? { steps } : {}),
    ...(table ? { table } : {}),
    ...(images.length ? { images } : {}),
  };
}

function parseSections(page, infobox, imageInfoByKey, summary) {
  const content = page.wikitext.slice(infobox.end).replace(/\[\[Category:[^\]]+\]\]/gi, '').trim();
  const headings = [...content.matchAll(/^==\s*([^=]+?)\s*==\s*$/gm)];
  const sections = [{ title: 'Overview', paragraphs: [summary] }];
  for (let index = 0; index < headings.length; index += 1) {
    const start = headings[index].index + headings[index][0].length;
    const end = headings[index + 1]?.index ?? content.length;
    const section = sectionFromWikitext(headings[index][1], content.slice(start, end), imageInfoByKey);
    if (section) sections.push(section);
  }
  return sections;
}

function pageLinks(wikitext) {
  return [...wikitext.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]+)?(?:\|[^\]]+)?\]\]/g)]
    .map((match) => match[1].trim())
    .filter((title) => title && !/^(?:File|Image|Category|Template):/i.test(title))
    .map(slugify);
}

function importedEntry(page, imageInfoByKey) {
  const infobox = parseInfobox(page.wikitext);
  const fields = infobox.fields;
  const isItem = page.sourceCategory === 'Items';
  const hasCombatStats = /monster/i.test(infobox.template) || ['health', 'level', 'quick_damage', 'heavy_damage', 'mystical_damage'].some((key) => fields[key]);
  const type = isItem ? 'Item' : hasCombatStats ? 'Creature' : 'NPC';
  const fallbackSummary = isItem
    ? `${page.title} is an item available in Winds of Valen.`
    : `${page.title} is an NPC found in Winds of Valen.`;
  const summary = stripWiki(fields.description || '') || fallbackSummary;
  const facts = Object.entries(fields)
    .filter(([key, value]) => value && !['name', 'image', 'description'].includes(key))
    .map(([key, value]) => ({ label: friendlyFieldName(key), value: stripWiki(value) }))
    .filter((fact) => fact.value);
  const fieldImage = fields.image ? normalizedFileName(fields.image) : '';
  const pageImages = explicitImages(page.wikitext, infobox);
  const locationImage = isItem ? '' : pageImages.find((name) => /(?:location|picture|portrait)/i.test(name));
  const mainImageInfo = [fieldImage, locationImage].filter(Boolean).map((name) => imageInfoByKey.get(fileKey(name))).find(Boolean) ?? null;
  const potionFallback = /^(?:Small|Large|Gilded) .+ Potion$/i.test(page.title)
    ? `/legacy-wiki/${/^Small /i.test(page.title) ? 't-smallvial-icon.png' : /^Large /i.test(page.title) ? 't-strongvial-icon.png' : 't-gildedvial-icon.png'}`
    : null;
  const knownFallback = page.title === 'Bronze Parry Shield' ? '/legacy-wiki/t-bronzeparryshield-icon.png' : potionFallback;
  const categories = page.categories.filter((category) => !/^Pages with /i.test(category));
  if (!categories.includes(isItem ? 'Items' : 'NPCs')) categories.unshift(isItem ? 'Items' : 'NPCs');
  if (type === 'Creature' && !categories.includes('Creatures')) categories.push('Creatures');
  return {
    slug: slugify(page.title),
    title: page.title,
    type,
    verification: 'documented',
    summary,
    intro: summary,
    categories,
    facts,
    sections: parseSections(page, infobox, imageInfoByKey, summary),
    related: [...new Set(pageLinks(page.wikitext))],
    ...(mainImageInfo || knownFallback ? { image: { src: mainImageInfo ? `/legacy-wiki/${mainImageInfo.localName}` : knownFallback, alt: page.title } } : {}),
    source: {
      label: 'Winds of Valen player guide',
      detail: 'Player-facing item and NPC information consolidated into this wiki.',
      observed: page.revisedAt ? page.revisedAt.slice(0, 10) : RETRIEVED_AT,
    },
  };
}

const pages = [...await fetchCategory('NPCs'), ...await fetchCategory('Items')];
const infoboxes = new Map(pages.map((page) => [page.pageId, parseInfobox(page.wikitext)]));
const fileNames = [...new Set(pages.flatMap((page) => explicitImages(page.wikitext, infoboxes.get(page.pageId))))];
const imageInfoByKey = await resolveImages(fileNames);
await downloadImages(imageInfoByKey);

const entries = pages.map((page) => importedEntry(page, imageInfoByKey)).sort((a, b) => a.title.localeCompare(b.title));
await writeFile(OUTPUT_JSON, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');

const itemCount = entries.filter((entry) => entry.type === 'Item').length;
const creatureCount = entries.filter((entry) => entry.type === 'Creature').length;
const npcCount = entries.filter((entry) => entry.type === 'NPC').length;
const mainImageCount = entries.filter((entry) => entry.image).length;
console.log(JSON.stringify({ pages: entries.length, items: itemCount, creatures: creatureCount, npcs: npcCount, downloadedImages: imageInfoByKey.size, pagesWithMainImage: mainImageCount, unresolvedImages: fileNames.length - imageInfoByKey.size }, null, 2));
