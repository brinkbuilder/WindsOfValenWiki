import type { Metadata } from 'next';
import { wikiSources } from '../lib/wiki-source-registry';

export const metadata: Metadata = {
  title: 'Source library',
  description: 'Browse player guides from the current and legacy Winds of Valen community wikis.',
};

const distinctTitles = new Set(wikiSources.flatMap((source) => source.pages.map((page) => page.title.trim().toLowerCase()))).size;

export default function SourcesPage() {
  return (
    <main className="inner-page sources-landing-page">
      <header className="simple-page-heading">
        <p className="eyebrow">From the community</p>
        <h1>More player guides</h1>
        <p>Browse the current Winds Of Valen Wiki and the older Miraheze archive for additional items, quests, bosses, maps, calculators, and skill guides.</p>
      </header>

      <dl className="source-library-stats" aria-label="Combined source statistics">
        <div><dt>Community wikis</dt><dd>{wikiSources.length}</dd></div>
        <div><dt>Searchable pages</dt><dd>{wikiSources.reduce((total, source) => total + source.pageCount, 0)}</dd></div>
        <div><dt>Guide topics</dt><dd>{distinctTitles}</dd></div>
        <div><dt>Images and media</dt><dd>{wikiSources.reduce((total, source) => total + source.fileCount, 0)}</dd></div>
      </dl>

      <section className="source-library-grid">
        {wikiSources.map((source) => (
          <a href={`/sources/${source.slug}`} key={source.id}>
            <span>{source.id === 'community' ? 'Current community wiki' : 'Older guide archive'}</span>
            <h2>{source.name}</h2>
            <p>{source.role}</p>
            <dl><div><dt>Articles</dt><dd>{source.articleCount}</dd></div><div><dt>Files</dt><dd>{source.fileCount}</dd></div></dl>
            <strong>Browse guides <i>→</i></strong>
          </a>
        ))}
      </section>

      <section className="source-precedence">
        <p className="eyebrow">Choosing a guide</p>
        <h2>Start with current information</h2>
        <ol>
          <li><span>01</span><div><strong>Read the current community wiki first</strong><p>It is the best place to start for recent updates and active community guides.</p></div></li>
          <li><span>02</span><div><strong>Use the Miraheze archive for older material</strong><p>It contains useful maps, calculators, historical guides, and images that have not all been moved.</p></div></li>
          <li><span>03</span><div><strong>Expect older details to change</strong><p>Requirements, rewards, prices, and combat values may differ after a game update.</p></div></li>
        </ol>
      </section>
    </main>
  );
}
