import { searchEntries } from './wiki-data';
import { wikiSourceSearchEntries } from './wiki-source-registry';

const seenTitles = new Set<string>();

export const unifiedSearchEntries = [...searchEntries, ...wikiSourceSearchEntries]
  .filter((entry) => {
    const title = entry.title.trim().toLowerCase();
    if (seenTitles.has(title)) return false;
    seenTitles.add(title);
    return true;
  })
  .sort((a, b) => a.title.localeCompare(b.title));
