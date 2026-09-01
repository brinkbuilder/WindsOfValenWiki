import type { Metadata } from 'next';
import { wikiSources } from '../lib/wiki-source-registry';

export const metadata: Metadata = {
  title: 'Source library',
  description: 'Browse the two outdated external Winds of Valen wiki archives and use this wiki for current information.',
};

const distinctTitles = new Set(wikiSources.flatMap((source) => source.pages.map((page) => page.title.trim().toLowerCase()))).size;

export default function SourcesPage() {
  return (
    <main className="inner-page sources-landing-page">
      <header className="simple-page-heading">
        <p className="eyebrow">Historical references</p>
        <h1>Outdated wiki archives</h1>
        <p>Both external wikis below are outdated reference archives. This Winds of Valen Player Wiki is the most up-to-date maintained source for current items, quests, bosses, maps, calculators, and skill guides.</p>
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
            <span>Outdated reference archive</span>
            <h2>{source.name}</h2>
            <p>{source.role}</p>
            <dl><div><dt>Articles</dt><dd>{source.articleCount}</dd></div><div><dt>Files</dt><dd>{source.fileCount}</dd></div></dl>
            <strong>Browse guides <i>→</i></strong>
          </a>
        ))}
      </section>

      <section className="source-precedence">
        <p className="eyebrow">Source status</p>
        <h2>Use this wiki for current information</h2>
        <ol>
          <li><span>01</span><div><strong>This Player Wiki is the current reference</strong><p>Use the local articles, calculators, and maps here first because they are maintained for the current game.</p></div></li>
          <li><span>02</span><div><strong>Both external wikis are outdated</strong><p>The archives can provide historical context, but their requirements, rewards, prices, and combat values may be stale.</p></div></li>
          <li><span>03</span><div><strong>Check local pages before relying on an archive</strong><p>When information differs, the current local wiki takes precedence over either external source.</p></div></li>
        </ol>
      </section>
    </main>
  );
}
