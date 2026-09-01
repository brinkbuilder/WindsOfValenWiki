'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { playerEntryTypeLabel, type SearchEntry } from '../lib/wiki-data';

function scoreEntry(entry: SearchEntry, query: string) {
  const title = entry.title.toLowerCase();
  if (title === query) return 100;
  if (title.startsWith(query)) return 70;
  if (title.includes(query)) return 50;
  if (entry.terms.includes(query)) return 20;
  return 0;
}

export function SearchBox({ entries, mode = 'hero', defaultValue = '' }: { entries: SearchEntry[]; mode?: 'hero' | 'page'; defaultValue?: string }) {
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return entries
      .map((entry) => ({ entry, score: scoreEntry(entry, needle) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
      .slice(0, 6)
      .map(({ entry }) => entry);
  }, [entries, query]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const editing = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable;
      if (event.key === '/' && !editing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const hrefFor = (entry: SearchEntry) => entry.href ?? `/wiki/${entry.slug}`;

  const navigateTo = (entry: SearchEntry) => {
    window.location.assign(hrefFor(entry));
  };

  return (
    <div className={`search-combobox search-combobox-${mode}`}>
      <form className={mode === 'hero' ? 'hero-search' : 'page-search'} action="/search" role="search">
        <span className="search-mark" aria-hidden="true" />
        <label className="sr-only" htmlFor={`${mode}-wiki-search`}>Search the wiki</label>
        <input
          ref={inputRef}
          role="combobox"
          id={`${mode}-wiki-search`}
          name="q"
          value={query}
          autoComplete="off"
          aria-autocomplete="list"
          aria-controls={`${mode}-suggestions`}
          aria-expanded={open && query.trim().length > 0}
          placeholder="Search items, creatures, places and guides…"
          onChange={(event) => { setQuery(event.target.value); setOpen(true); setActive(0); }}
          onFocus={() => setOpen(true)}
          onBlur={() => window.setTimeout(() => setOpen(false), 120)}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' && matches.length) {
              event.preventDefault();
              setOpen(true);
              setActive((value) => (value + 1) % matches.length);
            } else if (event.key === 'ArrowUp' && matches.length) {
              event.preventDefault();
              setOpen(true);
              setActive((value) => (value - 1 + matches.length) % matches.length);
            } else if (event.key === 'Enter' && open && matches[active]) {
              event.preventDefault();
              navigateTo(matches[active]);
            } else if (event.key === 'Escape') {
              setOpen(false);
            }
          }}
        />
        {mode === 'hero' && <kbd>/</kbd>}
        <button type="submit">Search</button>
      </form>

      {open && query.trim() && (
        <div className="search-suggestions" id={`${mode}-suggestions`} role="listbox">
          {matches.length > 0 ? matches.map((entry, index) => (
            <a
              key={entry.slug}
              href={hrefFor(entry)}
              target={entry.href?.startsWith('http') ? '_blank' : undefined}
              rel={entry.href?.startsWith('http') ? 'noreferrer' : undefined}
              className={index === active ? 'active' : ''}
              role="option"
              aria-selected={index === active}
              onMouseEnter={() => setActive(index)}
            >
              <span className="suggestion-letter" aria-hidden="true">{playerEntryTypeLabel(entry).slice(0, 1)}</span>
              <span className="suggestion-copy">
                <strong>{entry.title}</strong>
                <small>{playerEntryTypeLabel(entry)} · {entry.summary}</small>
              </span>
            </a>
          )) : (
            <p className="no-suggestions">No direct title match. Search the full article text instead.</p>
          )}
          <a className="all-results" href={`/search?q=${encodeURIComponent(query.trim())}`}>
            Search all pages for “{query.trim()}” <span>→</span>
          </a>
        </div>
      )}
    </div>
  );
}
