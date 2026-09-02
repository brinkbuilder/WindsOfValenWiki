import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const defaultOutput = path.resolve('app/lib/game-data.json');
const allowedKinds = new Set(['item', 'recipe', 'skill', 'creature', 'location', 'npc', 'system', 'other']);
const allowedConfidence = new Set(['engine', 'observed', 'inferred']);
const privateFieldNames = /^(?:player|character|account|auth|token|secret|password|inventory|bank|coordinates?|position|command(?:file)?|session)/i;

function usage() {
  console.log('Usage: node scripts/import-game-data.mjs (--input <export.json> | --bridge-root <ValenBridge>) [--output <game-data.json>]');
  console.log('The input must be an authorized export. A bridge root reads only static potion and smithing catalogs.');
  console.log('Raw Unreal .pak/.uasset files need an extractor first.');
}

function argument(name) {
  const index = process.argv.indexOf(name);
  return index === -1 ? '' : process.argv[index + 1] ?? '';
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function safeFields(fields) {
  if (!isObject(fields)) return {};
  return Object.fromEntries(Object.entries(fields)
    .filter(([key, value]) => !privateFieldNames.test(key) && (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean'))
    .filter(([, value]) => typeof value !== 'number' || Number.isFinite(value))
    .map(([key, value]) => [key.slice(0, 80), typeof value === 'string' ? value.slice(0, 1000) : value]));
}

function sourceFor(file, objectPath, build = 'local ValenBridge export') {
  return {
    file: path.basename(file),
    ...(objectPath ? { objectPath: objectPath.slice(0, 300) } : {}),
    build,
    extractedAt: new Date().toISOString(),
    confidence: 'engine',
  };
}

function humanize(value) {
  const isPotion = /^Recipe_Cauldron_/.test(value);
  const result = value
    .replace(/^Recipe_/, '')
    .replace(/^(?:Cauldron|Bottle|Crush|Harvest|Reduce)_/, '')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/_/g, ' ')
    .replace(/DuskKnight/g, 'Dusk Knight')
    .replace(/\s+/g, ' ')
    .trim();
  return isPotion ? `${result} Potion` : result;
}

function potionCatalogRecords(text, file) {
  return text.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('CraftingRecipe '))
    .map((line) => {
      const objectPath = line.slice('CraftingRecipe '.length).trim();
      const objectName = objectPath.split('/').at(-1)?.split('.')[0] ?? objectPath;
      const station = objectPath.split('/').at(-2) ?? 'Unknown';
      return {
        id: objectName,
        name: humanize(objectName),
        kind: 'recipe',
        fields: safeFields({ station, assetPath: objectPath }),
        source: sourceFor(file, objectPath),
      };
    });
}

function itemLines(text) {
  return [...text.matchAll(/^\s*-\s+(.+?)\s+x(\d+)\s*$/gm)].map((match) => `${match[1].trim()} x${match[2]}`);
}

function smithingCatalogRecords(text, file) {
  const sectionPattern = /(?:^|\r?\n)(Furnace|Anvil|Workbench)\r?\n=+\r?\nrecipes:.*?(?=\r?\n(?:Furnace|Anvil|Workbench)\r?\n=+|$)/gs;
  const records = [];
  for (const sectionMatch of text.matchAll(sectionPattern)) {
    const station = sectionMatch[1];
    const section = sectionMatch[0];
    const recipeBlocks = section.split(/(?=^\[\d+\]\s)/m).filter((block) => /^\[\d+\]\s/.test(block.trim()));
    for (const block of recipeBlocks) {
      const header = block.trim().match(/^\[(\d+)\]\s+([^\r\n]+)/);
      if (!header) continue;
      const id = header[2].trim();
      const assetPath = block.match(/^\s*asset:\s*CraftingRecipe\s+([^\r\n]+)/m)?.[1]?.trim() ?? '';
      const duration = Number(block.match(/^\s*duration:\s*([\d.]+)/m)?.[1] ?? 0);
      const level = Number(block.match(/Smithing LVL\s+(\d+)/)?.[1] ?? 0);
      const outputText = block.match(/^\s*output text:\s*([^\r\n]+)/m)?.[1]?.trim() ?? id;
      const outputMatch = outputText.match(/^(\d+)\s+(.+)$/);
      const outputName = (outputMatch?.[2] ?? outputText).replace(/DuskKnight/g, 'Dusk Knight');
      const inputSection = block.split(/input items:\s*\d+/)[1]?.split(/output items:\s*\d+/)[0] ?? '';
      const outputSection = block.split(/output items:\s*\d+/)[1]?.split(/input descriptions:/)[0] ?? '';
      const inputs = itemLines(inputSection);
      const outputs = itemLines(outputSection);
      records.push({
        id,
        name: outputName,
        kind: 'recipe',
        fields: safeFields({
          station,
          requiredLevel: level,
          durationSeconds: duration,
          inputItems: inputs.join('; '),
          outputItems: outputs.join('; ') || outputText,
          assetPath,
        }),
        source: sourceFor(file, assetPath),
      });
    }
  }
  return records;
}

async function bridgeExport(root) {
  const records = [];
  const entries = await readdir(path.resolve(root), { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const directory = path.join(root, entry.name);
    const potionFile = path.join(directory, 'potion_recipe_catalog.txt');
    const smithingFile = path.join(directory, 'smithing_recipe_catalog.txt');
    try {
      records.push(...potionCatalogRecords(await readFile(potionFile, 'utf8'), potionFile));
    } catch {
      // This bridge instance has no potion catalog; another instance may have it.
    }
    try {
      records.push(...smithingCatalogRecords(await readFile(smithingFile, 'utf8'), smithingFile));
    } catch {
      // This bridge instance has no smithing catalog; another instance may have it.
    }
  }
  return {
    build: 'local ValenBridge export',
    exportedAt: new Date().toISOString(),
    records,
  };
}

function normalizeRecord(record, index, input) {
  if (!isObject(record)) return null;
  const source = isObject(record.source) ? record.source : {};
  const id = typeof record.id === 'string' ? record.id : '';
  const name = typeof record.name === 'string' ? record.name : typeof record.title === 'string' ? record.title : '';
  const kind = typeof record.kind === 'string' && allowedKinds.has(record.kind) ? record.kind : 'other';
  const file = typeof source.file === 'string' && source.file ? path.basename(source.file) : path.basename(input);
  if (!id || !name || !file) {
    console.warn(`Skipping game record ${index + 1}: id, name, and source file are required.`);
    return null;
  }
  const confidence = typeof source.confidence === 'string' && allowedConfidence.has(source.confidence) ? source.confidence : 'engine';
  return {
    id: id.slice(0, 200),
    name: name.slice(0, 200),
    kind,
    fields: safeFields(record.fields),
    ...(typeof record.notes === 'string' ? { notes: record.notes.slice(0, 2000) } : {}),
    source: {
      file: file.slice(0, 200),
      ...(typeof source.objectPath === 'string' ? { objectPath: source.objectPath.slice(0, 300) } : {}),
      build: typeof source.build === 'string' ? source.build.slice(0, 100) : typeof record.build === 'string' ? record.build.slice(0, 100) : undefined,
      extractedAt: typeof source.extractedAt === 'string' ? source.extractedAt.slice(0, 80) : undefined,
      confidence,
    },
  };
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  usage();
  process.exit(0);
}

const input = argument('--input');
const bridgeRoot = argument('--bridge-root');
if (!input && !bridgeRoot) {
  usage();
  process.exit(1);
}

const output = argument('--output') || defaultOutput;
const raw = bridgeRoot
  ? await bridgeExport(bridgeRoot)
  : JSON.parse(await readFile(path.resolve(input), 'utf8'));
const rawRecords = isObject(raw) && Array.isArray(raw.records)
  ? raw.records
  : isObject(raw) && Array.isArray(raw.data)
    ? raw.data
    : [];
const recordsById = new Map(rawRecords.map((record, index) => [
  typeof record?.id === 'string' ? record.id : `invalid-${index}`,
  normalizeRecord(record, index, input || bridgeRoot),
]));
const records = [...recordsById.values()].filter(Boolean).slice(0, 10000);
const result = {
  version: 1,
  build: isObject(raw) && typeof raw.build === 'string' ? raw.build.slice(0, 100) : 'unknown build',
  exportedAt: isObject(raw) && typeof raw.exportedAt === 'string' ? raw.exportedAt : new Date().toISOString(),
  records,
};

await writeFile(path.resolve(output), `${JSON.stringify(result, null, 2)}\n`, 'utf8');
console.log(`Imported ${records.length} public game records into ${path.resolve(output)}.`);
