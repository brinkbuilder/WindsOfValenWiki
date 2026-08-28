import type { Metadata } from 'next';
import { CommunitySourceClient } from '../../components/CommunitySourceClient';
import { communityWikiPages, communityWikiSnapshot } from '../../lib/community-wiki';

export const metadata: Metadata = {
  title: 'Winds Of Valen Wiki source directory',
  description: 'An attributed revision-level directory of community Winds of Valen pages cross-referenced by The Valen Archives.',
};

const categoryCount = (category: string) => communityWikiPages.filter((page) => page.categories.includes(category)).length;

export default function CommunitySourcePage() {
  return (
    <main className="inner-page community-source-page">
      <header className="source-hero">
        <div>
          <p className="eyebrow">Attributed community source</p>
          <h1>Winds Of Valen Wiki directory</h1>
          <p>The development team authorized reuse of this current community wiki. Pages open inside the archive with copied information and images while retaining their source revision and a clear “Community documented” boundary.</p>
        </div>
        <dl>
          <div><dt>Substantive articles</dt><dd>{communityWikiSnapshot.articleCount}</dd></div>
          <div><dt>Non-redirect pages</dt><dd>{communityWikiSnapshot.pageCount}</dd></div>
          <div><dt>Snapshot</dt><dd>{communityWikiSnapshot.retrievedAt}</dd></div>
        </dl>
      </header>

      <section className="source-policy-note">
        <strong>Evidence boundary</strong>
        <p>Developer permission allows direct reuse of text and images. Attribution and stable revision links are still preserved, and a community claim never silently replaces a bridge-confirmed value.</p>
        <a href="https://windsofvalenwiki.com/w/Main_Page" target="_blank" rel="noreferrer">Visit the community wiki <span>↗</span></a>
      </section>

      <div className="source-category-summary" aria-label="Major source categories">
        {['Items', 'NPCs', 'Monsters', 'Skills', 'Regions', 'Quests'].map((category) => <div key={category}><span>{category}</span><strong>{categoryCount(category)}</strong></div>)}
      </div>

      <CommunitySourceClient pages={communityWikiPages} sourceId="community" sourceName="Current community wiki" />
    </main>
  );
}
