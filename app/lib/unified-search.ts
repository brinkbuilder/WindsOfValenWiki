import { calculatorSearchEntries } from './calculator-data';
import { searchEntries } from './wiki-data';

const seenTitles = new Set<string>();

// The player index contains only polished local articles and tools. Legacy wiki
// snapshots remain available to the import layer, but their raw page names and
// maintenance categories do not belong in community-facing search results.
export const unifiedSearchEntries = [...calculatorSearchEntries, ...searchEntries]
  .filter((entry) => !/^Calculator:/i.test(entry.title) && !/^Fighting Leveling Calculator(?:\/Data)?$/i.test(entry.title))
  .filter((entry) => {
    const title = entry.title.trim().toLowerCase();
    if (seenTitles.has(title)) return false;
    seenTitles.add(title);
    return true;
  })
  .sort((a, b) => a.title.localeCompare(b.title));
