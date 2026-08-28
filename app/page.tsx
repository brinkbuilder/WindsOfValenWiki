import Link from 'next/link';
import { SearchBox } from './components/SearchBox';
import { unifiedSearchEntries } from './lib/unified-search';

const categories = [
  { title: 'Items & equipment', description: 'Weapons, armour, materials, containers, prices, uses, and where to find them.', mark: 'I', href: '/wiki?type=items' },
  { title: 'Skills & training', description: 'Fishing, mining, combat, potion making, smithing, and practical training methods.', mark: 'S', href: '/wiki?type=guides' },
  { title: 'Creatures & bosses', description: 'Locations, attacks, weaknesses, drops, respawn times, and encounter strategies.', mark: 'C', href: '/wiki?type=world' },
  { title: 'Quests', description: 'Requirements, step-by-step walkthroughs, choices, unlocks, and rewards.', mark: 'Q', href: '/wiki?type=quests' },
  { title: 'Recipes', description: 'Ingredients, station requirements, outputs, experience, and processing chains.', mark: 'R', href: '/wiki?type=recipes' },
  { title: 'Places & travel', description: 'Regions, caverns, banks, resource areas, hazards, landmarks, and routes.', mark: 'W', href: '/wiki?type=world' },
];

const featured = [
  { type: 'Crafting', title: 'Infused Coal', detail: '1 Coal + 2 Essence at a Reduction Station', href: '/wiki/infused-coal' },
  { type: 'Mining', title: 'Silver mining circuit', detail: 'Six rocks, resource-container banking, and a repeatable loop', href: '/wiki/silver-mining' },
  { type: 'Boss', title: 'Skeleton Knight (Darklands)', detail: 'Combat profile, resistances, attacks, and reported drops', href: '/wiki/skeleton-knight-darklands' },
  { type: 'Quest', title: 'Open The Gates', detail: 'Follow the quest and prepare for the Goblin General', href: '/wiki/open-the-gates' },
];

export default function Home() {
  return (
    <main className="wiki-home" id="top">
      <section className="wiki-home-hero">
        <div className="wiki-home-hero-copy">
          <p className="kicker"><span /> The community encyclopedia</p>
          <h1>Winds of Valen Wiki</h1>
          <p>One clear, searchable guide to items, skills, quests, creatures, recipes, and the world of Valen.</p>
          <SearchBox entries={unifiedSearchEntries} />
          <div className="popular-searches" aria-label="Popular searches">
            <span>Popular:</span>
            <Link href="/wiki/infused-coal">Infused Coal</Link>
            <Link href="/wiki/silver-mining">Silver mining</Link>
            <Link href="/wiki/potion-families">Potion families</Link>
            <Link href="/wiki/the-darklands">The Darklands</Link>
          </div>
        </div>
        <aside className="wiki-home-start">
          <span>New player?</span>
          <h2>Start your adventure</h2>
          <p>Find the basics first, then explore skills, equipment, regions, and bosses at your own pace.</p>
          <nav>
            <Link href="/wiki?type=guides">Getting started <b>→</b></Link>
            <Link href="/wiki/combat-mechanics">Combat basics <b>→</b></Link>
            <Link href="/wiki?type=guides">Training guides <b>→</b></Link>
          </nav>
        </aside>
      </section>

      <section className="wiki-home-section" aria-labelledby="browse-heading">
        <div className="wiki-section-heading">
          <div><span>Browse by topic</span><h2 id="browse-heading">Find what you need</h2></div>
          <Link href="/wiki">View all {unifiedSearchEntries.length} pages →</Link>
        </div>
        <div className="wiki-category-grid">
          {categories.map((category) => (
            <Link href={category.href} className="wiki-category-card" key={category.title}>
              <span className="wiki-category-mark" aria-hidden="true">{category.mark}</span>
              <div><h3>{category.title}</h3><p>{category.description}</p></div>
              <b aria-hidden="true">→</b>
            </Link>
          ))}
        </div>
      </section>

      <section className="wiki-home-section wiki-home-featured" aria-labelledby="featured-heading">
        <div className="wiki-section-heading">
          <div><span>Useful right now</span><h2 id="featured-heading">Popular player guides</h2></div>
          <Link href="/recent">Recent updates →</Link>
        </div>
        <div className="wiki-featured-grid">
          {featured.map((entry) => (
            <Link href={entry.href} key={entry.title}>
              <span>{entry.type}</span>
              <h3>{entry.title}</h3>
              <p>{entry.detail}</p>
              <b aria-hidden="true">Read guide →</b>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
