import type { Metadata } from 'next';
import { wikiBySlug } from '../lib/wiki-data';

export const metadata: Metadata = { title: 'Recent discoveries', description: 'The latest Winds of Valen guides and findings added to The Valen Archives.' };

const recent = [
  { slug: 'world-map', note: 'Added the complete interactive world atlas with 157 searchable markers, six filters, four numbered routes, full-screen exploration, and local player guides.', time: '31 Aug 2026' },
  { slug: 'cavern-mine', note: 'Added an interactive Ebony Caves map with zooming, room filters, numbered routes, resource counts, navigation directions, and mining advice.', time: '31 Aug 2026' },
  { slug: 'open-the-gates', note: 'Rebuilt the complete quest walkthrough with requirements, all three scout locations, boss directions, rewards, and five images.', time: '28 Aug 2026' },
  { slug: 'crystal-caverns-bank-unlock', note: 'Added the complete bank-unlock miniquest, dialogue choice, reward details, and five images.', time: '28 Aug 2026' },
  { slug: 'smithing', note: 'Added all current Smithing recipes and a no-shortfall Dusk Knight full-set material checklist.', time: '28 Aug 2026' },
  { slug: 'cavern-spider', note: 'Added its location and current respawn timing.', time: '27 Aug 2026' },
  { slug: 'infused-coal', note: 'Added the complete formula and a 26-item batch example.', time: '27 Aug 2026' },
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
