import type { Metadata } from 'next';
import { CommunitySourceClient } from '../../components/CommunitySourceClient';
import { communityWikiPages, communityWikiSnapshot } from '../../lib/community-wiki';

export const metadata: Metadata = {
  title: 'Outdated Winds Of Valen Wiki archive',
  description: 'Browse the outdated external Winds of Valen community wiki archive.',
};

const categoryCount = (category: string) => communityWikiPages.filter((page) => page.categories.includes(category)).length;

export default function CommunitySourcePage() {
  return (
    <main className="inner-page community-source-page">
      <header className="source-hero">
        <div>
          <p className="eyebrow">Outdated external archive</p>
          <h1>Winds Of Valen Wiki</h1>
          <p>Browse this historical reference archive for skills, items, monsters, regions, quests, bosses, and other game topics. This is not the current source of truth.</p>
        </div>
        <dl>
          <div><dt>Substantive articles</dt><dd>{communityWikiSnapshot.articleCount}</dd></div>
          <div><dt>Non-redirect pages</dt><dd>{communityWikiSnapshot.pageCount}</dd></div>
          <div><dt>Guide categories</dt><dd>Items · Skills · World</dd></div>
        </dl>
      </header>

      <section className="source-policy-note">
        <strong>Historical reference only</strong>
        <p>This external wiki is outdated. Use the Winds of Valen Player Wiki for the most up-to-date maintained information.</p>
        <a href="https://windsofvalenwiki.com/w/Main_Page" target="_blank" rel="noreferrer">Visit the community wiki <span>↗</span></a>
      </section>

      <div className="source-category-summary" aria-label="Major source categories">
        {['Items', 'NPCs', 'Monsters', 'Skills', 'Regions', 'Quests'].map((category) => <div key={category}><span>{category}</span><strong>{categoryCount(category)}</strong></div>)}
      </div>

      <CommunitySourceClient pages={communityWikiPages} sourceId="community" sourceName="Outdated community archive" />
    </main>
  );
}
