'use client';

import { useMemo, useState } from 'react';
import type { WikiSourceId, WikiSourcePage } from '../lib/wiki-source-registry';

const groups = ['All', 'Items', 'NPCs', 'Monsters', 'Skills', 'Fishing', 'Regions', 'Caverns', 'Quests', 'Bosses'];
const maintenanceCategories = new Set(['Pages with broken file links', 'Pages with ignored display titles']);

export function CommunitySourceClient({ pages, sourceId, sourceName }: { pages: WikiSourcePage[]; sourceId: WikiSourceId; sourceName: string }) {
  const [group, setGroup] = useState('All');
  const [query, setQuery] = useState('');
  const [visible, setVisible] = useState(72);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return pages.filter((page) => {
      const categoryMatch = group === 'All' || page.categories.includes(group);
      const textMatch = !needle || page.title.toLowerCase().includes(needle) || page.categories.some((category) => category.toLowerCase().includes(needle));
      return categoryMatch && textMatch;
    });
  }, [group, pages, query]);

  const availableGroups = useMemo(() => groups.filter((item) => item === 'All' || pages.some((page) => page.categories.includes(item))), [pages]);

  return (
    <section className="community-browser" aria-label="Winds Of Valen Wiki source directory">
      <div className="community-controls">
        <div className="index-tabs" role="tablist" aria-label="Community page category">
          {availableGroups.map((item) => (
            <button key={item} type="button" role="tab" aria-selected={group === item} onClick={() => { setGroup(item); setVisible(72); }}>
              {item}
            </button>
          ))}
        </div>
        <label className="index-filter">
          <span className="search-mark" aria-hidden="true" />
          <span className="sr-only">Filter community source pages</span>
          <input value={query} onChange={(event) => { setQuery(event.target.value); setVisible(72); }} placeholder="Filter source pages…" />
        </label>
      </div>

      <p className="result-count">{filtered.length} {filtered.length === 1 ? 'source page' : 'source pages'}</p>
      <div className="community-page-grid">
        {filtered.slice(0, visible).map((page) => {
          const categories = page.categories.filter((category) => !maintenanceCategories.has(category)).slice(0, 3);
          return (
            <a href={`/sources/${sourceId}/${page.pageId}`} key={page.pageId}>
              <span className="community-source-label">{sourceName}</span>
              <h2>{page.title}</h2>
              <div className="community-category-row">
                {categories.length ? categories.map((category) => <span key={category}>{category}</span>) : <span>Uncategorised</span>}
              </div>
              <p>Revision {page.revisionId} · <time dateTime={page.revisedAt}>{new Date(page.revisedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time></p>
              <i aria-hidden="true">↗</i>
            </a>
          );
        })}
      </div>
      {visible < filtered.length && <button className="show-more-button" type="button" onClick={() => setVisible((count) => count + 72)}>Show more source pages</button>}
      {filtered.length === 0 && <div className="empty-results"><strong>No source pages found.</strong><p>Try a shorter term or another category.</p></div>}
    </section>
  );
}
