import type { Metadata } from 'next';
import { CommunitySourceClient } from '../../components/CommunitySourceClient';
import { communityWikiPages, communityWikiSnapshot } from '../../lib/community-wiki';

export const metadata: Metadata = {
  title: 'Winds Of Valen Wiki source directory',
  description: 'Browse current community Winds of Valen player guides.',
};

const categoryCount = (category: string) => communityWikiPages.filter((page) => page.categories.includes(category)).length;

export default function CommunitySourcePage() {
  return (
    <main className="inner-page community-source-page">
      <header className="source-hero">
        <div>
          <p className="eyebrow">Current community guides</p>
          <h1>Winds Of Valen Wiki</h1>
          <p>Browse current player guides for skills, items, monsters, regions, quests, bosses, and other useful game topics.</p>
        </div>
        <dl>
          <div><dt>Substantive articles</dt><dd>{communityWikiSnapshot.articleCount}</dd></div>
          <div><dt>Non-redirect pages</dt><dd>{communityWikiSnapshot.pageCount}</dd></div>
          <div><dt>Guide categories</dt><dd>Items · Skills · World</dd></div>
        </dl>
      </header>

      <section className="source-policy-note">
        <strong>Best place to start</strong>
        <p>This is the current community-maintained wiki. Use it first when both community wikis have a guide for the same topic.</p>
        <a href="https://windsofvalenwiki.com/w/Main_Page" target="_blank" rel="noreferrer">Visit the community wiki <span>↗</span></a>
      </section>

      <div className="source-category-summary" aria-label="Major source categories">
        {['Items', 'NPCs', 'Monsters', 'Skills', 'Regions', 'Quests'].map((category) => <div key={category}><span>{category}</span><strong>{categoryCount(category)}</strong></div>)}
      </div>

      <CommunitySourceClient pages={communityWikiPages} sourceId="community" sourceName="Current community wiki" />
    </main>
  );
}
