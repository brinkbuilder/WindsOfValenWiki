import type { Metadata } from 'next';
import { wikiSources } from '../lib/wiki-source-registry';

export const metadata: Metadata = {
  title: 'Source library',
  description: 'Browse the current and legacy Winds of Valen developer wikis integrated into The Valen Archives.',
};

const distinctTitles = new Set(wikiSources.flatMap((source) => source.pages.map((page) => page.title.trim().toLowerCase()))).size;

export default function SourcesPage() {
  return (
    <main className="inner-page sources-landing-page">
      <header className="simple-page-heading">
        <p className="eyebrow">Developer-authorized knowledge</p>
        <h1>Source library</h1>
        <p>Two established developer wikis now feed the archive alongside ValenBridge observations. Pages, images, revisions, and licensing remain traceable to their origin.</p>
      </header>

      <dl className="source-library-stats" aria-label="Combined source statistics">
        <div><dt>Source wikis</dt><dd>{wikiSources.length}</dd></div>
        <div><dt>Indexed pages</dt><dd>{wikiSources.reduce((total, source) => total + source.pageCount, 0)}</dd></div>
        <div><dt>Distinct titles</dt><dd>{distinctTitles}</dd></div>
        <div><dt>Media files</dt><dd>{wikiSources.reduce((total, source) => total + source.fileCount, 0)}</dd></div>
      </dl>

      <section className="source-library-grid">
        {wikiSources.map((source) => (
          <a href={`/sources/${source.slug}`} key={source.id}>
            <span>{source.id === 'community' ? 'Preferred current source' : 'Legacy source'}</span>
            <h2>{source.name}</h2>
            <p>{source.role}</p>
            <dl><div><dt>Articles</dt><dd>{source.articleCount}</dd></div><div><dt>Files</dt><dd>{source.fileCount}</dd></div></dl>
            <strong>Browse directory <i>→</i></strong>
          </a>
        ))}
      </section>

      <section className="source-precedence">
        <p className="eyebrow">Merge order</p>
        <h2>How conflicting information is handled</h2>
        <ol>
          <li><span>01</span><div><strong>ValenBridge and measured workflows</strong><p>Direct game evidence remains authoritative for the exact build observed.</p></div></li>
          <li><span>02</span><div><strong>Current community wiki</strong><p>Preferred for current community-maintained pages and recent updates.</p></div></li>
          <li><span>03</span><div><strong>Miraheze legacy archive</strong><p>Used for unique guides, history, calculators, maps, and media not yet migrated.</p></div></li>
        </ol>
      </section>
    </main>
  );
}
