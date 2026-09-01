'use client';

import { useMemo, useState } from 'react';
import { playerEntryTypeLabel, questKindForEntry, type SearchEntry } from '../lib/wiki-data';

const groups = [
  { key: 'all', label: 'All pages', types: [] },
  { key: 'calculators', label: 'Calculators', types: ['Calculator'] },
  { key: 'items', label: 'Items', types: ['Item', 'Resource'] },
  { key: 'recipes', label: 'Recipes', types: ['Recipe'] },
  { key: 'guides', label: 'Skills & guides', types: ['Guide', 'Activity'] },
  { key: 'quests', label: 'Quests', types: ['Quest'] },
  { key: 'world', label: 'Creatures & places', types: ['Creature', 'Location'] },
  { key: 'systems', label: 'Systems', types: ['System'] },
];

export function WikiIndexClient({ entries, initialType = 'all' }: { entries: SearchEntry[]; initialType?: string }) {
  const validInitial = groups.some((group) => group.key === initialType) ? initialType : 'all';
  const [group, setGroup] = useState(validInitial);
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const selected = groups.find((item) => item.key === group) ?? groups[0];
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      const typeMatch = selected.types.length === 0 || selected.types.includes(entry.type);
      const textMatch = !needle || entry.terms.includes(needle);
      return typeMatch && textMatch;
    });
  }, [entries, group, query]);

  const countFor = (types: string[]) => types.length === 0
    ? entries.length
    : entries.filter((entry) => types.includes(entry.type)).length;

  function indexCard(entry: SearchEntry) {
    const entryLabel = playerEntryTypeLabel(entry);
    return (
      <a className="index-card" href={entry.href ?? `/wiki/${entry.slug}`} key={`${entry.href ?? 'wiki'}-${entry.slug}`}>
        <div className="index-card-top">
          <span className="index-letter" aria-hidden="true">{entryLabel.slice(0, 1)}</span>
          {entry.type === 'Quest' && <span className={`quest-kind-badge quest-kind-${questKindForEntry(entry)}`}>{entryLabel}</span>}
        </div>
        <p>{entryLabel}</p>
        <h2>{entry.title}</h2>
        <span>{entry.summary}</span>
        <i aria-hidden="true">→</i>
      </a>
    );
  }

  const mainQuests = filtered.filter((entry) => questKindForEntry(entry) === 'main');
  const miniquests = filtered.filter((entry) => questKindForEntry(entry) === 'miniquest');

  return (
    <div className="wiki-index-tool">
      <div className="index-controls">
        <div className="index-tabs" role="tablist" aria-label="Wiki page type">
          {groups.map((item) => (
            <button key={item.key} type="button" role="tab" aria-selected={group === item.key} onClick={() => setGroup(item.key)}>
              <span>{item.label}</span><b>{countFor(item.types)}</b>
            </button>
          ))}
        </div>
        <div className="index-filter">
          <span className="search-mark" aria-hidden="true" />
          <label className="sr-only" htmlFor="wiki-index-filter">Filter wiki pages</label>
          <input id="wiki-index-filter" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter this list…" />
          {query && <button className="index-filter-clear" type="button" onClick={() => setQuery('')} aria-label="Clear page filter">Clear</button>}
        </div>
      </div>

      <p className="result-count" aria-live="polite">Showing {filtered.length} {filtered.length === 1 ? 'page' : 'pages'}</p>
      {group === 'quests' ? (
        <div className="quest-index-sections">
          {mainQuests.length > 0 && (
            <section className="quest-index-section quest-index-main" aria-labelledby="main-quest-heading">
              <header><div><span>Story progression</span><h2 id="main-quest-heading">Main Quest</h2><p>The game’s primary questline and major progression unlock.</p></div><b>{mainQuests.length}</b></header>
              <div className="index-grid quest-index-grid">{mainQuests.map(indexCard)}</div>
            </section>
          )}
          {miniquests.length > 0 && (
            <section className="quest-index-section quest-index-mini" aria-labelledby="miniquest-heading">
              <header><div><span>Optional adventures</span><h2 id="miniquest-heading">Miniquests</h2><p>Shorter objectives, unlocks, and specialist rewards.</p></div><b>{miniquests.length}</b></header>
              <div className="index-grid quest-index-grid">{miniquests.map(indexCard)}</div>
            </section>
          )}
        </div>
      ) : <div className="index-grid">{filtered.map(indexCard)}</div>}
      {filtered.length === 0 && <div className="empty-results"><strong>No pages found.</strong><p>Try a shorter term or a different page type.</p></div>}
    </div>
  );
}
