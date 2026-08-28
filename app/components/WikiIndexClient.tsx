'use client';

import { useMemo, useState } from 'react';
import type { SearchEntry } from '../lib/wiki-data';
import { VerificationBadge } from './VerificationBadge';

const groups = [
  { key: 'all', label: 'All pages', types: [] },
  { key: 'items', label: 'Items', types: ['Item', 'Resource'] },
  { key: 'recipes', label: 'Recipes', types: ['Recipe'] },
  { key: 'guides', label: 'Guides, quests & activities', types: ['Guide', 'Activity', 'Quest'] },
  { key: 'world', label: 'World', types: ['Creature', 'Location', 'Route'] },
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

  return (
    <div className="wiki-index-tool">
      <div className="index-controls">
        <div className="index-tabs" role="tablist" aria-label="Wiki page type">
          {groups.map((item) => (
            <button key={item.key} type="button" role="tab" aria-selected={group === item.key} onClick={() => setGroup(item.key)}>
              {item.label}
            </button>
          ))}
        </div>
        <label className="index-filter">
          <span className="search-mark" aria-hidden="true" />
          <span className="sr-only">Filter wiki pages</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter this index…" />
        </label>
      </div>

      <p className="result-count">{filtered.length} {filtered.length === 1 ? 'page' : 'pages'}</p>
      <div className="index-grid">
        {filtered.map((entry) => (
          <a className="index-card" href={`/wiki/${entry.slug}`} key={entry.slug}>
            <div className="index-card-top">
              <span className="index-letter" aria-hidden="true">{entry.type.slice(0, 1)}</span>
              <VerificationBadge verification={entry.verification} compact />
            </div>
            <p>{entry.type}</p>
            <h2>{entry.title}</h2>
            <span>{entry.summary}</span>
            <i aria-hidden="true">→</i>
          </a>
        ))}
      </div>
      {filtered.length === 0 && <div className="empty-results"><strong>No pages found.</strong><p>Try a shorter term or a different page type.</p></div>}
    </div>
  );
}
