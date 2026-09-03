import { build } from 'esbuild';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const result = await build({
  stdin: {
    contents: "export { wikiEntries } from './app/lib/wiki-data.ts';",
    resolveDir: process.cwd(),
    sourcefile: 'wiki-image-audit.ts',
  },
  bundle: true,
  platform: 'node',
  format: 'esm',
  write: false,
});

const moduleUrl = `data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`;
const { wikiEntries } = await import(moduleUrl);
const imageReferences = [];

for (const entry of wikiEntries) {
  if (entry.image) imageReferences.push({ slug: entry.slug, section: 'Primary image', src: entry.image.src });
  for (const section of entry.sections) {
    for (const image of section.images ?? []) {
      imageReferences.push({ slug: entry.slug, section: section.title, src: image.src });
    }
  }
}

const brokenFiles = imageReferences.filter(({ src }) => (
  src.startsWith('/') && !existsSync(join(process.cwd(), 'public', src))
));
const entriesWithoutImages = wikiEntries.filter((entry) => !entry.image);
const missingByType = {};

for (const entry of entriesWithoutImages) {
  missingByType[entry.type] ??= [];
  missingByType[entry.type].push({ slug: entry.slug, title: entry.title });
}

console.log(JSON.stringify({
  entries: wikiEntries.length,
  entriesWithPrimaryImages: wikiEntries.length - entriesWithoutImages.length,
  entriesWithoutPrimaryImages: entriesWithoutImages.length,
  imageReferences: imageReferences.length,
  uniqueImageFiles: new Set(imageReferences.map(({ src }) => src)).size,
  brokenFiles,
  missingByType,
}, null, 2));

if (brokenFiles.length) process.exitCode = 1;

