import type { Metadata } from 'next';
import { VerificationBadge } from '../components/VerificationBadge';
import { wikiBySlug } from '../lib/wiki-data';

export const metadata: Metadata = { title: 'Recent discoveries', description: 'The latest verified Winds of Valen findings added to The Valen Archives.' };

const recent = [
  { slug: 'cavern-mine', note: 'Added the live Cavern Mine actor survey.', time: '27 Aug 2026' },
  { slug: 'cavern-spider', note: 'Confirmed class identity and observed respawn delay.', time: '27 Aug 2026' },
  { slug: 'infused-coal', note: 'Verified the complete formula and 26-item batch.', time: '27 Aug 2026' },
  { slug: 'silver-mining', note: 'Documented the six-rock route and resource-container banking.', time: '27 Aug 2026' },
  { slug: 'potion-making', note: 'Imported 36 recipe asset identities across four station groups.', time: '27 Aug 2026' },
  { slug: 'banking', note: 'Documented four-tab slot geometry and hydration caveat.', time: '26 Aug 2026' },
];

export default function RecentPage() {
  return (
    <main className="inner-page recent-page">
      <header className="simple-page-heading">
        <p className="eyebrow">Field journal</p>
        <h1>Recent discoveries</h1>
        <p>A concise changelog of facts added from targeted engine exports, route recordings, and verified player workflows.</p>
      </header>
      <div className="timeline">
        {recent.map((item, index) => {
          const entry = wikiBySlug.get(item.slug);
          if (!entry) return null;
          return (
            <a href={`/wiki/${entry.slug}`} key={entry.slug}>
              <span className="timeline-number">0{index + 1}</span>
              <div><small>{item.time} · {entry.type}</small><h2>{entry.title}</h2><p>{item.note}</p></div>
              <VerificationBadge verification={entry.verification} compact />
            </a>
          );
        })}
      </div>
    </main>
  );
}
