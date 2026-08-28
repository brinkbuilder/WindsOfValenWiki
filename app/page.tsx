import Link from 'next/link';
import { SearchBox } from './components/SearchBox';
import { wikiSources, wikiSourceSearchEntries } from './lib/wiki-source-registry';
import { searchEntries, wikiStats } from './lib/wiki-data';

const allSearchEntries = [...searchEntries, ...wikiSourceSearchEntries];
const indexedSourcePages = wikiSources.reduce((total, source) => total + source.pageCount, 0);
const indexedSourceArticles = wikiSources.reduce((total, source) => total + source.articleCount, 0);

const categories = [
  {
    eyebrow: 'Database',
    title: 'Items & equipment',
    description: 'Uses, crafting inputs, equipment, and where to find them.',
    count: `${wikiStats.items} item guides`,
    mark: 'I',
    href: '/wiki?type=items',
  },
  {
    eyebrow: 'Bestiary',
    title: 'Creatures',
    description: 'Enemy locations, attacks, drops, weaknesses, and combat tips.',
    count: `${wikiStats.creatures} creature guides`,
    mark: 'B',
    href: '/wiki?type=world',
  },
  {
    eyebrow: 'Training',
    title: 'Skills & activities',
    description: 'Fishing, mining, combat, smelting, and potion-making guides.',
    count: 'Player-tested guides',
    mark: 'S',
    href: '/wiki?type=guides',
  },
  {
    eyebrow: 'World',
    title: 'Routes & locations',
    description: 'Resource circuits, banks, crafting stations, landmarks, and hazards.',
    count: `${wikiStats.routes} mapped routes`,
    mark: 'R',
    href: '/wiki?type=world',
  },
];

const discoveries = [
  {
    type: 'Item',
    title: 'Infused Coal',
    detail: '1 Coal + 2 Essence · Reduction Station',
    status: 'Crafting material',
    slug: 'infused-coal',
  },
  {
    type: 'Location',
    title: 'Cavern Mine',
    detail: 'Ebony, silver, coal, spiders, and hazard rooms',
    status: 'Mining location',
    slug: 'cavern-mine',
  },
  {
    type: 'Guide',
    title: 'Silver mining circuit',
    detail: 'Six-rock route with resource-crate banking',
    status: 'Training guide',
    slug: 'silver-mining',
  },
];

export default function Home() {
  return (
    <main id="top">
      <section className="hero">
        <div className="hero-glow hero-glow-one" />
        <div className="hero-glow hero-glow-two" />
        <div className="hero-copy">
          <p className="kicker"><span /> The player-made field guide</p>
          <h1>Every trail has a story.<br />Let’s map them all.</h1>
          <p className="hero-intro">
            Search a growing encyclopedia of items, creatures, recipes, locations, quests, and practical guides made for Winds of Valen players.
          </p>

          <SearchBox entries={allSearchEntries} />

          <div className="popular-searches" aria-label="Popular searches">
            <span>Popular:</span>
            <Link href="/wiki/infused-coal">Infused Coal</Link>
            <Link href="/wiki/silver-mining">Silver mining</Link>
            <Link href="/wiki/cavern-mine">Cavern Mine</Link>
          </div>
        </div>

        <aside className="field-note" id="data-notice">
          <div className="field-note-heading">
            <span className="field-note-icon" aria-hidden="true">⌁</span>
            <div>
              <p>Quick guide</p>
              <h2>Make Infused Coal</h2>
            </div>
            <span className="live-pill"><i /> Player tip</span>
          </div>
          <div className="field-stat featured-stat">
            <span>Reduction Station recipe</span>
            <strong>Infused Coal</strong>
            <p>1 Coal + 2 Essence → 1 Infused Coal</p>
          </div>
          <div className="field-stat-grid">
            <div className="field-stat">
              <span>Travel guides</span>
              <strong>{wikiStats.routes}</strong>
              <p>Mining, banking, and combat</p>
            </div>
            <div className="field-stat">
              <span>Potion recipes</span>
              <strong>{wikiStats.recipes}</strong>
              <p>Across four station groups</p>
            </div>
          </div>
          <div className="provenance">
            <span className="provenance-line" />
            <p><strong>Made for players.</strong> Follow the steps, check what you need, and get back into the game.</p>
          </div>
        </aside>
      </section>

      <section className="community-source-strip" aria-labelledby="community-source-heading">
        <div>
          <p className="eyebrow">More community knowledge</p>
          <h2 id="community-source-heading">Guides from both Winds of Valen wikis</h2>
          <p>Search current guides and useful older pages in one place, including items, quests, maps, calculators, bosses, and skill information.</p>
        </div>
        <dl>
          <div><dt>Community articles</dt><dd>{indexedSourceArticles}</dd></div>
          <div><dt>Searchable pages</dt><dd>{indexedSourcePages}</dd></div>
          <div><dt>Player guides</dt><dd>{wikiStats.articles}</dd></div>
        </dl>
        <Link href="/sources">Browse community guides <span>→</span></Link>
      </section>

      <section className="content-section" id="explore">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Start exploring</p>
            <h2>What are you looking for?</h2>
          </div>
          <Link className="text-link" href="/wiki">Browse all {wikiStats.articles} pages <span>→</span></Link>
        </div>

        <div className="category-grid">
          {categories.map((category) => (
            <Link className="category-card" href={category.href} key={category.title}>
              <div className="category-mark" aria-hidden="true">{category.mark}</div>
              <p className="eyebrow">{category.eyebrow}</p>
              <h3>{category.title}</h3>
              <p className="category-description">{category.description}</p>
              <span className="category-count">{category.count}</span>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="split-section" id="discoveries">
        <div className="discoveries-panel">
          <div className="section-heading compact">
            <div>
              <p className="eyebrow">From the field</p>
              <h2>Recent discoveries</h2>
            </div>
            <Link className="text-link" href="/recent">View recent changes <span>→</span></Link>
          </div>
          <div className="discovery-list">
            {discoveries.map((item, index) => (
              <Link className="discovery-row" href={`/wiki/${item.slug}`} key={item.title}>
                <span className="discovery-number">0{index + 1}</span>
                <div>
                  <p><span>{item.type}</span> {item.status}</p>
                  <h3>{item.title}</h3>
                  <small>{item.detail}</small>
                </div>
                <span className="row-arrow" aria-hidden="true">→</span>
              </Link>
            ))}
          </div>
        </div>

        <aside className="guide-card" id="guides">
          <p className="eyebrow">Featured guide</p>
          <span className="guide-route" aria-hidden="true">
            <i /><i /><i /><i /><i /><i />
          </span>
          <h2>Mine silver without losing the trail</h2>
          <p>A six-rock circuit, resource-container banking, and a simple return loop that keeps your mining session moving.</p>
          <Link href="/wiki/silver-mining">Read the silver guide <span>→</span></Link>
        </aside>
      </section>
    </main>
  );
}
