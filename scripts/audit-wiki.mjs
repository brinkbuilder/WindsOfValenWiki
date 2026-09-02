const baseUrl = new URL(process.env.WIKI_BASE_URL ?? 'http://127.0.0.1:3100/');
const concurrency = Math.max(1, Number(process.env.WIKI_AUDIT_CONCURRENCY ?? 18));

const checkedPages = new Map();
const checkedAssets = new Map();
const queuedPages = new Set(['/']);
const articlePaths = new Set();
const archiveReaderPaths = new Set();
const forbiddenMatches = [];

const forbiddenPlayerText = [
  /\bValenBridge\b/i,
  /\bItemDataKey\b/i,
  /\bRecipe_[A-Za-z0-9_]+\b/i,
  /\b(?:BP|B|W|DA)_[A-Za-z0-9_]+(?:_C)?\b/i,
  /\/Script\/[A-Za-z0-9_.]+/i,
  /\bbackend\b/i,
  /\bLua\b/i,
  /\bverification\b/i,
  /\bevidence\b/i,
  /\bclass names?\b/i,
  /\bscan (?:results?|evidence)\b/i,
  /\{\{|\[\[/,
];

function decodeHtml(value) {
  return value
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>');
}

function localPath(value) {
  if (!value || value.startsWith('#') || /^(?:mailto|tel|javascript):/i.test(value)) return null;
  const resolved = new URL(decodeHtml(value), baseUrl);
  if (resolved.origin !== baseUrl.origin) return null;
  return `${resolved.pathname}${resolved.search}`;
}

function pagePath(value) {
  const resolved = new URL(value, baseUrl);
  return resolved.pathname;
}

function extractAttributes(html, attribute) {
  const values = [];
  const pattern = new RegExp(`\\b${attribute}=["']([^"']+)["']`, 'gi');
  for (const match of html.matchAll(pattern)) values.push(match[1]);
  return values;
}

function visibleText(html) {
  return decodeHtml(html)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function fetchPage(path) {
  let response;
  try {
    response = await fetch(new URL(path, baseUrl), { redirect: 'follow', signal: AbortSignal.timeout(20_000) });
  } catch (error) {
    checkedPages.set(pagePath(path), `request failed: ${error instanceof Error ? error.message : String(error)}`);
    return;
  }
  const html = await response.text();
  checkedPages.set(pagePath(path), response.status);
  if (!response.ok) return;

  const text = visibleText(html);
  for (const pattern of forbiddenPlayerText) {
    const match = text.match(pattern);
    if (match) forbiddenMatches.push({ path: pagePath(path), text: match[0] });
  }

  for (const href of extractAttributes(html, 'href')) {
    const local = localPath(href);
    if (!local) continue;
    const pathname = pagePath(local);
    if (/^\/sources\/(?:community|miraheze|winds-of-valen-wiki)\/\d+$/.test(pathname)) {
      archiveReaderPaths.add(pathname);
      continue;
    }
    if (pathname.startsWith('/wiki/')) articlePaths.add(pathname);
    if (!/\.[a-z0-9]{2,5}$/i.test(pathname)) queuedPages.add(local);
  }

  for (const src of extractAttributes(html, 'src')) {
    const local = localPath(src);
    if (local) checkedAssets.set(pagePath(local), null);
  }
}

async function runPool(items, worker) {
  let nextIndex = 0;
  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (nextIndex < items.length) {
      const item = items[nextIndex++];
      await worker(item);
    }
  }));
}

await fetchPage('/wiki');
await runPool([...articlePaths], fetchPage);

for (const path of ['/calculators', '/calculators/combat-level', '/search?q=coal', '/recent', '/sources', '/about/data']) {
  queuedPages.add(path);
}
while ([...queuedPages].some((path) => !checkedPages.has(pagePath(path)))) {
  await runPool([...queuedPages].filter((path) => !checkedPages.has(pagePath(path))), fetchPage);
}

await runPool([...checkedAssets.keys()], async (path) => {
  try {
    const response = await fetch(new URL(path, baseUrl), { redirect: 'follow', signal: AbortSignal.timeout(20_000) });
    checkedAssets.set(path, response.status);
  } catch (error) {
    checkedAssets.set(path, `request failed: ${error instanceof Error ? error.message : String(error)}`);
  }
});

const isBroken = (status) => typeof status !== 'number' || status < 200 || status >= 400;
const brokenPages = [...checkedPages].filter(([, status]) => isBroken(status));
const brokenAssets = [...checkedAssets].filter(([, status]) => isBroken(status));
const report = {
  baseUrl: baseUrl.origin,
  pagesChecked: checkedPages.size,
  articlesChecked: articlePaths.size,
  archiveReaderLinksCheckedAtIndexLevel: archiveReaderPaths.size,
  assetsChecked: checkedAssets.size,
  brokenPages,
  brokenAssets,
  forbiddenPlayerText: forbiddenMatches,
};

console.log(JSON.stringify(report, null, 2));
if (brokenPages.length || brokenAssets.length || forbiddenMatches.length) process.exitCode = 1;
