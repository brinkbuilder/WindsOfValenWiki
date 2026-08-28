import { calculatorSearchEntries } from './calculator-data';
import { searchEntries } from './wiki-data';
import { wikiSourceSearchEntries } from './wiki-source-registry';

const seenTitles = new Set<string>();

export const unifiedSearchEntries = [...calculatorSearchEntries, ...wikiSourceSearchEntries, ...searchEntries]
  .filter((entry) => !/^Calculator:/i.test(entry.title) && !/^Fighting Leveling Calculator(?:\/Data)?$/i.test(entry.title))
  .filter((entry) => {
    const title = entry.title.trim().toLowerCase();
    if (seenTitles.has(title)) return false;
    seenTitles.add(title);
    return true;
  })
  .sort((a, b) => a.title.localeCompare(b.title));
