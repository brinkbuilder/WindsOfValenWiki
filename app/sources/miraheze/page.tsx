import type { Metadata } from 'next';
import { CommunitySourceClient } from '../../components/CommunitySourceClient';
import { mirahezeWikiPages, mirahezeWikiSnapshot } from '../../lib/miraheze-wiki';

export const metadata: Metadata = {
  title: 'Outdated Miraheze wiki archive',
  description: 'Browse the outdated external Winds of Valen Miraheze wiki archive.',
};

export default function MirahezeSourcePage() {
  return (
    <main className="inner-page community-source-page">
      <header className="source-hero">
        <div>
          <p className="eyebrow">Outdated external archive</p>
          <h1>Winds of Valen Miraheze archive</h1>
          <p>This external wiki is outdated but retains historical guides, mechanics, calculators, maps, and a large image library. Some values may have changed in newer game versions.</p>
        </div>
        <dl>
          <div><dt>Articles</dt><dd>{mirahezeWikiSnapshot.articleCount}</dd></div>
          <div><dt>Uploaded files</dt><dd>{mirahezeWikiSnapshot.fileCount}</dd></div>
          <div><dt>Licence</dt><dd>{mirahezeWikiSnapshot.licenseName}</dd></div>
        </dl>
      </header>

      <section className="source-policy-note">
        <strong>Historical reference only</strong>
        <p>Both external wikis are outdated. Use this archive for historical context, then check the current Winds of Valen Player Wiki before relying on any detail.</p>
        <a href="https://windsofvalen.miraheze.org/wiki/Main_Page" target="_blank" rel="noreferrer">Visit the Miraheze wiki <span>↗</span></a>
      </section>

      <div className="source-category-summary" aria-label="Legacy source statistics">
        <div><span>Non-redirect pages</span><strong>{mirahezeWikiSnapshot.pageCount}</strong></div>
        <div><span>Uploaded files</span><strong>{mirahezeWikiSnapshot.fileCount}</strong></div>
        <div><span>Best for</span><strong>Historical maps</strong></div>
        <div><span>Guide status</span><strong>Outdated archive</strong></div>
      </div>

      <CommunitySourceClient pages={mirahezeWikiPages} sourceId="miraheze" sourceName="Outdated Miraheze archive" />
    </main>
  );
}
