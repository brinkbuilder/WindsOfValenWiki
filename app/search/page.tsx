import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchBox } from '../components/SearchBox';
import { playerEntryTypeLabel, searchIndex } from '../lib/wiki-data';
import { unifiedSearchEntries } from '../lib/unified-search';

/* Native thumbnails keep search results compatible with the existing static artwork pipeline. */
/* eslint-disable @next/next/no-img-element */

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] ?? '' : params.q ?? '';
  const results = searchIndex(unifiedSearchEntries, query);
  return (
    <main className="inner-page search-page">
      <header className="simple-page-heading">
        <p className="eyebrow">Search the wiki</p>
        <h1>{query ? `Results for “${query}”` : 'Find a page'}</h1>
        <p>Search every consolidated article by item, creature, quest, skill, recipe, or place.</p>
      </header>
      <SearchBox entries={unifiedSearchEntries} mode="page" defaultValue={query} />
      <p className="result-count">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
      <div className="search-results">
        {results.map((entry) => (
          <a href={entry.href ?? `/wiki/${entry.slug}`} key={entry.slug} target={entry.href?.startsWith('http') ? '_blank' : undefined} rel={entry.href?.startsWith('http') ? 'noreferrer' : undefined}>
            <span className="result-type">{playerEntryTypeLabel(entry)}</span>
            <span className={`search-result-art${entry.image ? ' has-image' : ''}`} aria-hidden="true">
              {entry.image
                ? <img src={entry.image.src} alt="" loading="lazy" decoding="async" />
                : <span>{playerEntryTypeLabel(entry).slice(0, 1)}</span>}
            </span>
            <div><h2>{entry.title}</h2><p>{entry.summary}</p></div>
            <i aria-hidden="true">→</i>
          </a>
        ))}
      </div>
      {results.length === 0 && <div className="empty-results"><strong>No pages matched “{query}”.</strong><p>Try an item name, creature, location, skill, or activity.</p><Link href="/wiki">Browse the complete index</Link></div>}
    </main>
  );
}
