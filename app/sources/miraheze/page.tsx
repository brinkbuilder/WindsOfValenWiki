import type { Metadata } from 'next';
import { CommunitySourceClient } from '../../components/CommunitySourceClient';
import { mirahezeWikiPages, mirahezeWikiSnapshot } from '../../lib/miraheze-wiki';

export const metadata: Metadata = {
  title: 'Miraheze legacy wiki directory',
  description: 'The authorized legacy Winds of Valen Miraheze wiki, including revision-pinned articles, guides, and media references.',
};

export default function MirahezeSourcePage() {
  return (
    <main className="inner-page community-source-page">
      <header className="source-hero">
        <div>
          <p className="eyebrow">Authorized legacy source</p>
          <h1>Winds of Valen Miraheze archive</h1>
          <p>This older developer wiki retains unique guides, historical mechanics, calculators, maps, and the larger media library. Its pages are copied through fixed revisions and labelled as legacy when newer information exists.</p>
        </div>
        <dl>
          <div><dt>Articles</dt><dd>{mirahezeWikiSnapshot.articleCount}</dd></div>
          <div><dt>Uploaded files</dt><dd>{mirahezeWikiSnapshot.fileCount}</dd></div>
          <div><dt>Licence</dt><dd>{mirahezeWikiSnapshot.licenseName}</dd></div>
        </dl>
      </header>

      <section className="source-policy-note">
        <strong>Legacy-source policy</strong>
        <p>The active community wiki wins when equivalent pages disagree. Miraheze remains valuable for legacy-only guides and images; every copied page retains its source revision and CC BY-SA attribution.</p>
        <a href="https://windsofvalen.miraheze.org/wiki/Main_Page" target="_blank" rel="noreferrer">Visit the Miraheze wiki <span>↗</span></a>
      </section>

      <div className="source-category-summary" aria-label="Legacy source statistics">
        <div><span>Non-redirect pages</span><strong>{mirahezeWikiSnapshot.pageCount}</strong></div>
        <div><span>Uploaded files</span><strong>{mirahezeWikiSnapshot.fileCount}</strong></div>
        <div><span>Snapshot</span><strong>{mirahezeWikiSnapshot.retrievedAt}</strong></div>
        <div><span>Source role</span><strong>Legacy</strong></div>
      </div>

      <CommunitySourceClient pages={mirahezeWikiPages} sourceId="miraheze" sourceName="Miraheze legacy" />
    </main>
  );
}
