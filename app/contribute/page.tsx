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
          <h2>What makes useful evidence?</h2>
          <ol>
            <li><span>01</span><div><strong>Name the page or entity.</strong><p>Use the visible name and technical ID when available.</p></div></li>
            <li><span>02</span><div><strong>Describe the exact observation.</strong><p>Separate what happened from what you think it means.</p></div></li>
            <li><span>03</span><div><strong>Include repeatable evidence.</strong><p>Recipe inputs, outputs, item deltas, class names, or route behaviour are ideal.</p></div></li>
            <li><span>04</span><div><strong>Protect player privacy.</strong><p>Remove character names, balances, exact coordinates, and command data.</p></div></li>
          </ol>
          <a href="/about/data">Read the full data policy <span>→</span></a>
        </aside>
      </div>
    </main>
  );
}
