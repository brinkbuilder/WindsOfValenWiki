import type { Metadata } from 'next';
import { SearchBox } from '../components/SearchBox';
import { VerificationBadge } from '../components/VerificationBadge';
import { searchEntries, searchWiki } from '../lib/wiki-data';

export const metadata: Metadata = { title: 'Search' };

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] ?? '' : params.q ?? '';
  const results = searchWiki(query);
  return (
    <main className="inner-page search-page">
      <header className="simple-page-heading">
        <p className="eyebrow">Search the archives</p>
        <h1>{query ? `Results for “${query}”` : 'Find a page'}</h1>
        <p>Exact names, aliases, technical IDs, categories, and article summaries are indexed.</p>
      </header>
      <SearchBox entries={searchEntries} mode="page" defaultValue={query} />
      <p className="result-count">{results.length} {results.length === 1 ? 'result' : 'results'}</p>
      <div className="search-results">
        {results.map((entry) => (
          <a href={`/wiki/${entry.slug}`} key={entry.slug}>
            <span className="result-type">{entry.type}</span>
            <div><h2>{entry.title}</h2><p>{entry.summary}</p></div>
            <VerificationBadge verification={entry.verification} compact />
            <i aria-hidden="true">→</i>
          </a>
        ))}
      </div>
      {results.length === 0 && <div className="empty-results"><strong>No pages matched “{query}”.</strong><p>Try the engine class, item name, route, or a broader activity.</p><a href="/wiki">Browse the complete index</a></div>}
    </main>
  );
}
