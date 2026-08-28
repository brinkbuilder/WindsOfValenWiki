import type { Metadata } from 'next';
import Link from 'next/link';
import { SearchBox } from '../components/SearchBox';
import { wikiSourceSearchEntries } from '../lib/wiki-source-registry';
import { searchEntries, searchIndex } from '../lib/wiki-data';

export const metadata: Metadata = { title: 'Search' };

const allSearchEntries = [...searchEntries, ...wikiSourceSearchEntries];

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] ?? '' : params.q ?? '';
  const results = searchIndex(allSearchEntries, query);
  return (
    <main className="inner-page search-page">
      <header className="simple-page-heading">
        <p className="eyebrow">Search the archives</p>
        <h1>{query ? `Results for “${query}”` : 'Find a page'}</h1>
        <p>Search articles and guides from across the Winds of Valen community.</p>
      </header>
      <SearchBox entries={allSearchEntries} mode="page" defaultValue={query} />
      <p className="result-count">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
      <div className="search-results">
        {results.map((entry) => (
          <a href={entry.href ?? `/wiki/${entry.slug}`} key={entry.slug} target={entry.href?.startsWith('http') ? '_blank' : undefined} rel={entry.href?.startsWith('http') ? 'noreferrer' : undefined}>
            <span className="result-type">{entry.type}</span>
            <div><h2>{entry.title}</h2><p>{entry.summary}</p></div>
            <i aria-hidden="true">→</i>
          </a>
        ))}
      </div>
      {results.length === 0 && <div className="empty-results"><strong>No pages matched “{query}”.</strong><p>Try an item name, creature, location, skill, or activity.</p><Link href="/wiki">Browse the complete index</Link></div>}
    </main>
  );
}
