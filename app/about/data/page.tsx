import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'About the wiki',
  description: 'How The Valen Archives helps Winds of Valen players find clear, useful game information.',
};

export default function AboutWikiPage() {
  return (
    <main className="inner-page policy-page">
      <header className="simple-page-heading">
        <p className="eyebrow">Made for the community</p>
        <h1>A player guide first</h1>
        <p>The Valen Archives brings together practical Winds of Valen knowledge so players can quickly find what they need and return to the game.</p>
      </header>

      <section className="pipeline" aria-label="How to use the wiki">
        <div><span>01</span><strong>Find a topic</strong><p>Search by the name shown in game.</p></div>
        <i aria-hidden="true">→</i>
        <div><span>02</span><strong>Follow the guide</strong><p>Check requirements, steps, drops, and tips.</p></div>
        <i aria-hidden="true">→</i>
        <div><span>03</span><strong>Check source dates</strong><p>Use the maintained local wiki when older references disagree.</p></div>
      </section>

      <section className="policy-grid">
        <article>
          <p className="eyebrow">What belongs here</p>
          <h2>Information players can use</h2>
          <ul>
            <li>Item uses, equipment, shops, prices, and drops</li>
            <li>Skill requirements, training methods, and recipes</li>
            <li>Quest steps, locations, and unlocks</li>
            <li>Creature attacks, weaknesses, rewards, and strategies</li>
            <li>Landmarks, banks, shops, and useful shortcuts</li>
          </ul>
        </article>
        <article>
          <p className="eyebrow">Clear writing</p>
          <h2>Use names players recognize</h2>
          <p>Articles use the names and terms shown in the game, with every section focused on information players can act on.</p>
        </article>
        <article>
          <p className="eyebrow">When details are missing</p>
          <h2>Say what still needs an answer</h2>
          <p>If a requirement, drop rate, effect, or reward is not known yet, the guide states that plainly. It does not fill the space with developer-only information.</p>
        </article>
        <article id="game-file-data">
          <p className="eyebrow">Game-file evidence</p>
          <h2>Static exports can be checked too</h2>
          <p>Authorized game-file or bridge exports can be normalized into public records and used by Valen Buddy alongside wiki pages. Private player state, command files, credentials, and coordinates are filtered out before import.</p>
        </article>
        <article>
          <p className="eyebrow">One encyclopedia</p>
          <h2>Everything belongs in one index</h2>
          <p>Useful details from older guides are folded into clean local articles, so players can search one consistent encyclopedia instead of sorting through duplicate or outdated pages.</p>
          <Link href="/wiki">Browse every page <span>→</span></Link>
        </article>
      </section>
    </main>
  );
}
