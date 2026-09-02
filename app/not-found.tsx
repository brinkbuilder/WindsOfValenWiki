import Link from 'next/link';
import { SearchBox } from './components/SearchBox';
import { unifiedSearchEntries } from './lib/unified-search';

export default function NotFound() {
  return (
    <main className="inner-page not-found-page">
      <section className="not-found-card">
        <p className="eyebrow">That path leads nowhere</p>
        <h1>Page not found</h1>
        <p>The page may have moved, or the name may be slightly different. Search the complete player wiki or return to the encyclopedia.</p>
        <SearchBox entries={unifiedSearchEntries} mode="page" />
        <div className="not-found-actions">
          <Link className="classic-button" href="/wiki">Browse all pages</Link>
          <Link href="/">Return to the main page</Link>
        </div>
      </section>
    </main>
  );
}
