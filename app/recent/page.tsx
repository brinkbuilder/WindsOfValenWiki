import type { Metadata } from 'next';
import { wikiBySlug } from '../lib/wiki-data';

export const metadata: Metadata = { title: 'Recent discoveries', description: 'The latest Winds of Valen guides and findings added to The Valen Archives.' };

const recent = [
  { slug: 'smithing', note: 'Added every current furnace, anvil, and workbench recipe, including the complete Dusk Knight armour chain.', time: '28 Aug 2026' },
  { slug: 'cavern-mine', note: 'Added resources, creatures, and hazards found in the Cavern Mine.', time: '27 Aug 2026' },
  { slug: 'cavern-spider', note: 'Added its location and current respawn timing.', time: '27 Aug 2026' },
  { slug: 'infused-coal', note: 'Added the complete formula and a 26-item batch example.', time: '27 Aug 2026' },
  { slug: 'silver-mining', note: 'Documented the six-rock route and resource-container banking.', time: '27 Aug 2026' },
  { slug: 'potion-making', note: 'Added the current recipes across four crafting stations.', time: '27 Aug 2026' },
  { slug: 'banking', note: 'Added bank capacity, tabs, and resource-container tips.', time: '26 Aug 2026' },
];

export default function RecentPage() {
  return (
    <main className="inner-page recent-page">
      <header className="simple-page-heading">
        <p className="eyebrow">Field journal</p>
        <h1>Recent discoveries</h1>
        <p>A concise changelog of new player guides, useful discoveries, and corrected game information.</p>
      </header>
      <div className="timeline">
        {recent.map((item, index) => {
          const entry = wikiBySlug.get(item.slug);
          if (!entry) return null;
          return (
            <a href={`/wiki/${entry.slug}`} key={entry.slug}>
              <span className="timeline-number">{String(index + 1).padStart(2, '0')}</span>
              <div><small>{item.time} · {entry.type}</small><h2>{entry.title}</h2><p>{item.note}</p></div>
            </a>
          );
        })}
      </div>
    </main>
  );
}
