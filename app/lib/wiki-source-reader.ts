import sanitizeHtml from 'sanitize-html';
import { getWikiSourcePage, wikiSourceReaderPath, type WikiSourceDefinition } from './wiki-source-registry';

type ParsedResponse = {
  parse?: {
    title: string;
    pageid: number;
    revid: number;
    text: string;
    images?: string[];
    categories?: Array<{ sortkey: string; '*': string }>;
  };
  error?: { info?: string };
};

const normalizeTitle = (value: string) => value.trim().replace(/_/g, ' ').toLowerCase();
const preserveTitleCase = (value: string) => value.trim().replace(/_/g, ' ');

function sourceTitleFromUrl(url: URL, source: WikiSourceDefinition) {
  if (url.origin !== new URL(source.baseUrl).origin) return undefined;
  if (url.pathname.startsWith(source.articlePathPrefix)) {
    return decodeURIComponent(url.pathname.slice(source.articlePathPrefix.length)).replace(/_/g, ' ');
  }
  if (url.pathname.endsWith('/index.php') || url.pathname.endsWith('/w/index.php')) {
    return url.searchParams.get('title')?.replace(/_/g, ' ');
  }
  return undefined;
}

function rewriteLink(value: string | undefined, source: WikiSourceDefinition) {
  if (!value || value.startsWith('#')) return value ?? '';
  try {
    const url = new URL(value, source.baseUrl);
    const linkedTitle = sourceTitleFromUrl(url, source);
    if (linkedTitle) {
      const match = source.pages.find((page) => preserveTitleCase(page.title) === preserveTitleCase(linkedTitle))
        ?? source.pages.find((page) => normalizeTitle(page.title) === normalizeTitle(linkedTitle));
      if (match) return wikiSourceReaderPath(source.id, match.pageId);
    }
    return '';
  } catch {
    return '';
  }
}

function rewriteImage(value: string | undefined, source: WikiSourceDefinition) {
  if (!value) return '';
  try {
    const url = new URL(value, source.baseUrl);
    return ['http:', 'https:'].includes(url.protocol) ? url.toString() : '';
  } catch {
    return '';
  }
}

function cleanAttributes(attributes: Record<string, string>) {
  const cleaned = { ...attributes };
  delete cleaned.class;
  delete cleaned.style;
  delete cleaned.srcset;
  delete cleaned.onclick;
  return cleaned;
}

function playerFacingSourceText(value: string) {
  return value
    .replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '$2')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/\{\{[^{}]*\}\}/g, '')
    .replace(/\b(?:B|W|DA|Recipe)_[A-Za-z0-9_]+(?:_C)?\b/gi, '')
    .replace(/\b(?:ItemDataKey|CurrentInventoryTarget|RequestDepositResources|EquipmentInventory|PlayerInventoryComponent|UObject|UE4SS)\b/gi, '')
    .replace(/\b(?:backend|technical class|class name)\b/gi, 'game')
    .replace(/\s{2,}/g, ' ');
}

function sanitizeWikiHtml(html: string, source: WikiSourceDefinition) {
  return sanitizeHtml(html, {
    allowedTags: ['div', 'section', 'article', 'aside', 'header', 'footer', 'nav', 'span', 'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'small', 'mark', 'abbr', 'sub', 'sup', 'code', 'pre', 'blockquote', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'dl', 'dt', 'dd', 'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'figure', 'figcaption', 'picture', 'img', 'a'],
    allowedAttributes: {
      '*': ['id', 'title', 'aria-label'],
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
      th: ['colspan', 'rowspan', 'scope'],
      td: ['colspan', 'rowspan'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    disallowedTagsMode: 'discard',
    textFilter: playerFacingSourceText,
    exclusiveFilter: (frame) => {
      const className = frame.attribs?.class ?? '';
      return /display\s*:\s*none/i.test(frame.attribs?.style ?? '')
        || /mw-editsection|navbox|vertical-navbox|metadata|ambox|sistersitebox|noprint|hatnote|mw-empty-elt/i.test(className);
    },
    transformTags: {
      '*': (tagName, attribs) => ({ tagName, attribs: cleanAttributes(attribs) }),
      a: (tagName, attribs) => {
        const href = rewriteLink(attribs.href, source);
        if (!href) return { tagName: 'span', attribs: cleanAttributes(attribs) };
        const internal = href.startsWith('/sources/');
        return { tagName, attribs: { ...cleanAttributes(attribs), href, ...(internal || href.startsWith('#') ? {} : { target: '_blank', rel: 'noreferrer' }) } };
      },
      img: (tagName, attribs) => ({ tagName, attribs: { ...cleanAttributes(attribs), src: rewriteImage(attribs.src, source), loading: 'lazy', decoding: 'async' } }),
      table: (tagName, attribs) => ({ tagName, attribs: { ...cleanAttributes(attribs), 'aria-label': attribs['aria-label'] ?? 'Source data table' } }),
    },
  });
}

export async function readWikiSourcePage(sourceId: string, pageId: number) {
  const record = getWikiSourcePage(sourceId, pageId);
  if (!record) return undefined;
  const { source, page } = record;
  const params = new URLSearchParams({
    action: 'parse',
    oldid: String(page.revisionId),
    prop: 'text|images|categories|revid',
    disableeditsection: '1',
    disabletoc: '1',
    format: 'json',
    formatversion: '2',
  });
  try {
    const signal = AbortSignal.timeout(12_000);
    // Miraheze's edge currently blocks `oldid` in a query string, but accepts the
    // same MediaWiki API request as form data. Keep the current wiki on GET so its
    // response remains cacheable, and use POST only for the legacy mirror.
    const response = source.id === 'miraheze'
      ? await fetch(source.apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
            'User-Agent': 'ValenArchives/1.0 (developer-authorized wiki integration)',
          },
          body: params.toString(),
          signal,
        })
      : await fetch(`${source.apiUrl}?${params.toString()}`, {
          headers: { 'User-Agent': 'ValenArchives/1.0 (developer-authorized wiki integration)' },
          next: { revalidate: 3600 },
          signal,
        });
    if (!response.ok) throw new Error(`Source returned ${response.status}`);
    const payload = await response.json() as ParsedResponse;
    if (!payload.parse?.text) throw new Error(payload.error?.info ?? 'The source revision did not return rendered content.');
    return {
      source,
      page,
      html: sanitizeWikiHtml(payload.parse.text, source),
      images: payload.parse.images ?? [],
      error: null,
    };
  } catch (error) {
    return {
      source,
      page,
      html: '',
      images: [],
      error: error instanceof Error ? error.message : 'The source page could not be loaded.',
    };
  }
}
