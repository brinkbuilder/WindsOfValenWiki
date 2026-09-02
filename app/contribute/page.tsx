import type { Metadata } from 'next';
import Link from 'next/link';
import { ApprovedContributions } from '../components/ApprovedContributions';
import { ContributionClient } from '../components/ContributionClient';

export const metadata: Metadata = {
  title: 'Contribute',
  description: 'Submit verified Winds of Valen discoveries, corrections, sources, and new wiki pages for review.',
};

export default function ContributePage() {
  return (
    <main className="inner-page contribution-page">
      <header className="simple-page-heading">
        <p className="eyebrow">Community workshop</p>
        <h1>Help build the guide</h1>
        <p>Share the details you have tested in game. Every useful submission is checked by a wiki editor before it becomes part of the public encyclopedia.</p>
      </header>

      <div className="contribution-layout">
        <section className="contribution-guide" aria-labelledby="contribution-guide-heading">
          <p className="panel-kicker">What makes a strong edit</p>
          <h2 id="contribution-guide-heading">Turn a discovery into a useful page</h2>
          <ol className="contribution-step-list">
            <li><span>01</span><div><strong>Name the page or topic</strong><p>Use the name players see in game, or describe the new page you think is missing.</p></div></li>
            <li><span>02</span><div><strong>Explain what you observed</strong><p>Include requirements, quantities, locations, steps, timings, drops, or a clear correction.</p></div></li>
            <li><span>03</span><div><strong>Share how you checked it</strong><p>Add a source link when one exists and say whether the detail came from testing, a screenshot, or a player report.</p></div></li>
          </ol>
          <div className="contribution-guidelines"><strong>Review standard</strong><p>Approved contributions are credited to the submitting account. Unsupported guesses stay out of the live wiki until someone can verify them.</p></div>
          <Link className="contribution-inline-link" href="/about/data">Read how the wiki handles sources <span aria-hidden="true">-&gt;</span></Link>
        </section>

        <ContributionClient />
      </div>
      <ApprovedContributions />
      <p className="contribution-editor-link">Wiki editors can review the queue at <Link href="/contribute/review">/contribute/review</Link>.</p>
    </main>
  );
}
