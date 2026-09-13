import Link from 'next/link';
import { ASK_AGENT_NAME } from './lib/ask-agent';
import { ContributorLeaderboard } from './components/ContributorLeaderboard';
import { SearchBox } from './components/SearchBox';
import { unifiedSearchEntries } from './lib/unified-search';

/* Native images keep the static Vinext build compatible with the existing game artwork. */
/* eslint-disable @next/next/no-img-element */

const categories = [
  { title: 'Items', description: 'Weapons, armour, tools, resources, potions, prices, and uses.', image: '/wiki-assets/bronze-sword.png', href: '/wiki?type=items' },
  { title: 'Skills', description: 'Training methods, level requirements, experience rates, and unlocks.', image: '/wiki-assets/skills.png', href: '/wiki?type=guides' },
  { title: 'Quests', description: 'The main quest, optional miniquests, requirements, walkthroughs, and rewards.', image: '/wiki-assets/quest.png', href: '/wiki?type=quests' },
  { title: 'World', description: 'Explore 157 searchable locations, mines, banks, shops, enemies, bosses, and fishing spots.', image: '/wiki-assets/world-map-original.png', href: '/wiki/world-map' },
];

const skills = [
  { name: 'Combat', mark: '⚔', href: '/wiki/combat-mechanics' },
  { name: 'Mining', mark: '⛏', href: '/wiki/mining' },
  { name: 'Smithing', mark: '⚒', href: '/wiki/smithing' },
  { name: 'Archery', mark: '➶', href: '/wiki/archery' },
  { name: 'Fishing', mark: '◉', href: '/wiki/fishing' },
  { name: 'Potion Making', mark: '⚗', href: '/wiki/potion-making' },
];

const popular = [
  { title: 'Open The Gates', description: 'Quest requirements, steps, boss fight, and rewards.', href: '/wiki/open-the-gates' },
  { title: 'Crystal Caverns bank', description: 'Unlock the cavern bank with a Resonant Essence Geode.', href: '/wiki/crystal-caverns-bank-unlock' },
  { title: 'Smithing', description: 'Every current recipe plus the full Dusk Knight armour plan.', href: '/wiki/smithing' },
  { title: 'Dusk Knight Schematics', description: 'Known miniquest reward and the complete crafting path.', href: '/wiki/dusk-knight-schematics-miniquest' },
  { title: 'Mining', description: 'Every ore tier, base experience, and training progression.', href: '/wiki/mining' },
  { title: 'Combat', description: 'Damage types, shield matching, experience, and training.', href: '/wiki/combat-mechanics' },
];

const recentUpdates = [
  {
    mark: '◆',
    title: 'Solo Darklands',
    description: 'Server 1 now uses 1v1 PvP, with slower enemy and rock recovery and 20% fewer key drops.',
    href: '/wiki/the-darklands',
    tone: 'violet',
  },
  {
    mark: '⌑',
    title: 'Chest supplies changed',
    description: 'Rough Leather, Rough Cloth, Thick Leather, and Elven Cloth now appear in Darklands chest supplies.',
    href: '/wiki/darklands-chests',
    tone: 'blue',
  },
  {
    mark: '⛏',
    title: 'Pickaxes scale with Mining',
    description: 'Pickaxe damage and accuracy now receive 50% of their level scaling from your Mining level.',
    href: '/wiki/mining',
    tone: 'cyan',
  },
  {
    mark: '⚗',
    title: 'Earlier fish processing',
    description: 'Perch, Bass, Elder Trout, and Carp Knife Station requirements are now levels 5, 15, 35, and 45.',
    href: '/wiki/potion-making',
    tone: 'gold',
  },
  {
    mark: '☠',
    title: 'Broken Sword buffed',
    description: 'The rare skeleton drop now has 15 Slash and 25 Quick, bringing it close to an Iron Sword.',
    href: '/wiki/broken-sword',
    tone: 'red',
  },
  {
    mark: '↟',
    title: 'Combat and interface polish',
    description: 'A 15% hit slow, clearer PvP engagements, right-click action lists, remembered quantities, and performance fixes.',
    href: '/wiki/september-2026-game-update',
    tone: 'green',
  },
];

export default function Home() {
  return (
    <main className="classic-home" id="top">
      <section className="wiki-front-page">
        <header className="front-welcome">
          <div>
            <p>Welcome to the</p>
            <h1>Winds of Valen Wiki</h1>
            <span>The complete community guide to the fantasy sandbox MMORPG.</span>
          </div>
        </header>

        <div className="front-search-row">
          <div>
            <strong>What are you looking for?</strong>
            <span>Search every guide, item, creature, quest, recipe, and location.</span>
          </div>
          <SearchBox entries={unifiedSearchEntries} mode="page" />
          <p><b>{unifiedSearchEntries.length}</b> player pages</p>
        </div>

        <section className="ask-home-panel" aria-labelledby="ask-home-heading">
          <div className="ask-home-mark" aria-hidden="true">?</div>
          <div className="ask-home-copy"><p className="panel-kicker">{ASK_AGENT_NAME}</p><h2 id="ask-home-heading">Ask a question, not just a keyword.</h2><p>Need a route, recipe, or training estimate? Ask in plain language and get a sourced answer from the wiki.</p></div>
          <div className="ask-home-example"><span>Try: “How long to level 80 Potion Making?”</span><Link href={`/ask?q=${encodeURIComponent('How long would it take me to get to level 80 Potion Making?')}`}>{ASK_AGENT_NAME} <b>→</b></Link></div>
        </section>

        <section className="recent-updates-panel" aria-labelledby="recent-updates-heading">
          <div className="classic-section-title recent-updates-title">
            <div>
              <p className="panel-kicker">11 September 2026 game update</p>
              <h2 id="recent-updates-heading">Recent updates</h2>
            </div>
            <Link href="/wiki/september-2026-game-update">Read the full update</Link>
          </div>
          <p className="recent-updates-intro">The latest Solo Darklands, balance, recipe, loot, and quality-of-life changes—checked against the current game build.</p>
          <div className="recent-update-grid">
            {recentUpdates.map((update) => (
              <Link className={`recent-update-card recent-update-${update.tone}`} href={update.href} key={update.title}>
                <span className="recent-update-mark" aria-hidden="true">{update.mark}</span>
                <span>
                  <strong>{update.title}</strong>
                  <small>{update.description}</small>
                </span>
                <b aria-hidden="true">›</b>
              </Link>
            ))}
          </div>
        </section>

        <section className="front-section" aria-labelledby="categories-heading">
          <div className="classic-section-title"><h2 id="categories-heading">Browse the encyclopedia</h2><Link href="/wiki">View the A–Z index</Link></div>
          <div className="portal-category-grid">
            {categories.map((category) => (
              <Link className="portal-category" href={category.href} key={category.title}>
                <span className="portal-category-image">
                  <img src={category.image} alt="" width={96} height={96} loading="lazy" decoding="async" />
                </span>
                <span><strong>{category.title}</strong><small>{category.description}</small></span>
              </Link>
            ))}
          </div>
        </section>

        <div className="front-columns">
          <section className="front-section portal-panel" aria-labelledby="popular-heading">
            <div className="classic-section-title"><h2 id="popular-heading">Popular player guides</h2></div>
            <div className="popular-guide-list">
              {popular.map((page) => <Link href={page.href} key={page.title}><strong>{page.title}</strong><span>{page.description}</span><b>›</b></Link>)}
            </div>
          </section>

          <aside className="front-section portal-panel calculator-promo">
            <p className="panel-kicker">Player tools</p>
            <h2>Plan your next level</h2>
            <p>Calculate experience, actions, enemy kills, training time, accuracy, and defence rolls without leaving the wiki.</p>
            <div>
              <Link href="/calculators?skill=Mining">Mining calculator</Link>
              <Link href="/calculators?skill=Smithing">Smithing calculator</Link>
              <Link href="/calculators?skill=Fishing">Fishing calculator</Link>
              <Link href="/calculators?tab=combat">Combat XP calculator</Link>
            </div>
            <Link className="combat-level-link" href="/calculators/combat-level"><strong>Combat Level Calculator</strong><span>Combine your combat skills into one overall level.</span><b>Open tool →</b></Link>
            <Link className="classic-button" href="/calculators">Open all calculators</Link>
          </aside>
        </div>

        <section className="front-section contributor-home-panel" aria-labelledby="contributors-heading">
          <div className="classic-section-title"><h2 id="contributors-heading">Top contributors</h2><Link href="/contribute">Join the editors</Link></div>
          <div className="contributor-home-grid">
            <div className="contributor-home-copy"><p className="panel-kicker">Built together</p><h3>Every tested detail helps the next player.</h3><p>Approved pages, corrections, sources, and maps are credited to the people who contributed them.</p><Link className="classic-button" href="/contribute">Add information</Link></div>
            <ContributorLeaderboard />
          </div>
        </section>

        <section className="front-section" aria-labelledby="skills-heading">
          <div className="classic-section-title"><h2 id="skills-heading">Skill training</h2><Link href="/calculators">Experience calculators</Link></div>
          <div className="skill-portal-grid">
            {skills.map((skill) => <Link href={skill.href} key={skill.name}><span>{skill.mark}</span><strong>{skill.name}</strong><small>Training guide</small></Link>)}
          </div>
        </section>

        <section className="front-start-panel">
          <div><span>New player guide</span><h2>Start here</h2><p>Learn the controls, understand combat stances, train your first skills, and prepare to unlock Valen City.</p></div>
          <nav><Link href="/wiki/controls">Controls &amp; commands</Link><Link href="/wiki/combat-mechanics">Combat basics</Link><Link href="/wiki/open-the-gates">Open The Gates walkthrough</Link></nav>
        </section>
      </section>
    </main>
  );
}
