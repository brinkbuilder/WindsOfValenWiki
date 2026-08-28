import type { Metadata } from 'next';
import { ContributionDraft } from '../components/ContributionDraft';

export const metadata: Metadata = { title: 'Contribute', description: 'Draft a sourced correction or discovery for The Valen Archives.' };

export default function ContributePage() {
  return (
    <main className="inner-page contribute-page">
      <header className="simple-page-heading">
        <p className="eyebrow">Built by players</p>
        <h1>Add a field note</h1>
        <p>Good wiki contributions are specific, repeatable, and honest about what remains unknown.</p>
      </header>
      <div className="contribute-layout">
        <section>
          <p className="eyebrow">Draft a proposal</p>
          <h2>Share one clear finding</h2>
          <ContributionDraft />
        </section>
        <aside>
          <p className="eyebrow">Contribution checklist</p>
          <h2>What makes a useful edit?</h2>
          <ol>
            <li><span>01</span><div><strong>Use the in-game name.</strong><p>Name the item, creature, place, quest, or skill exactly as players see it.</p></div></li>
            <li><span>02</span><div><strong>Explain what should change.</strong><p>Keep the correction short and include the useful player-facing detail.</p></div></li>
            <li><span>03</span><div><strong>Add helpful context.</strong><p>Recipe ingredients, requirements, drops, directions, screenshots, or combat tips are ideal.</p></div></li>
            <li><span>04</span><div><strong>Protect player privacy.</strong><p>Remove character names and private account information from screenshots.</p></div></li>
          </ol>
          <a href="/about/data">Read about the wiki <span>→</span></a>
        </aside>
      </div>
    </main>
  );
}
