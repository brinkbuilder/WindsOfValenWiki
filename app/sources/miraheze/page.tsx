import type { Metadata } from 'next';
import { CommunitySourceClient } from '../../components/CommunitySourceClient';
import { mirahezeWikiPages, mirahezeWikiSnapshot } from '../../lib/miraheze-wiki';

export const metadata: Metadata = {
  title: 'Miraheze legacy wiki directory',
  description: 'Browse older Winds of Valen guides, calculators, maps, and images from the Miraheze archive.',
};

export default function MirahezeSourcePage() {
  return (
    <main className="inner-page community-source-page">
      <header className="source-hero">
        <div>
          <p className="eyebrow">Older community guides</p>
          <h1>Winds of Valen Miraheze archive</h1>
          <p>This older wiki retains useful guides, historical mechanics, calculators, maps, and a large image library. Some values may have changed in newer game versions.</p>
        </div>
        <dl>
          <div><dt>Articles</dt><dd>{mirahezeWikiSnapshot.articleCount}</dd></div>
          <div><dt>Uploaded files</dt><dd>{mirahezeWikiSnapshot.fileCount}</dd></div>
          <div><dt>Licence</dt><dd>{mirahezeWikiSnapshot.licenseName}</dd></div>
        </dl>
      </header>

      <section className="source-policy-note">
        <strong>Older information</strong>
        <p>Use the current community wiki when two pages disagree. This archive is especially useful for guides, maps, calculators, and images that have not yet been moved.</p>
        <a href="https://windsofvalen.miraheze.org/wiki/Main_Page" target="_blank" rel="noreferrer">Visit the Miraheze wiki <span>↗</span></a>
      </section>

      <div className="source-category-summary" aria-label="Legacy source statistics">
        <div><span>Non-redirect pages</span><strong>{mirahezeWikiSnapshot.pageCount}</strong></div>
        <div><span>Uploaded files</span><strong>{mirahezeWikiSnapshot.fileCount}</strong></div>
        <div><span>Best for</span><strong>Maps and calculators</strong></div>
        <div><span>Guide age</span><strong>Older archive</strong></div>
      </div>

      <CommunitySourceClient pages={mirahezeWikiPages} sourceId="miraheze" sourceName="Miraheze legacy" />
    </main>
  );
}
