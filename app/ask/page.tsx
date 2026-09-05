import type { Metadata } from 'next';
import Link from 'next/link';
import { AiQaClient } from '../components/AiQaClient';
import { ASK_AGENT_NAME } from '../lib/ask-agent';
import { gameDataRecords } from '../lib/game-data';
import { getOllamaConfiguration } from '../lib/ollama-config';

export const metadata: Metadata = {
  title: ASK_AGENT_NAME,
  description: `Ask questions with ${ASK_AGENT_NAME} about Winds of Valen and get answers grounded in the player wiki and its calculators.`,
};

export const dynamic = 'force-dynamic';

export default async function AskPage({ searchParams }: { searchParams: Promise<{ q?: string | string[] }> }) {
  const params = await searchParams;
  const query = Array.isArray(params.q) ? params.q[0] ?? '' : params.q ?? '';
  const ollama = getOllamaConfiguration();
  return (
    <main className="inner-page ask-page">
      <div className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>{ASK_AGENT_NAME}</span></div>
      <header className="ask-page-heading">
        <div>
          <p className="eyebrow">Player assistant</p>
          <h1>{ASK_AGENT_NAME}.</h1>
          <p>Ask about recipes, quests, locations, mechanics, or training goals. {ASK_AGENT_NAME} grounds answers in the pages and calculators collected here, not a general-purpose guess.</p>
        </div>
        <div className="ask-page-sigil" aria-hidden="true"><span>?</span><small>WIKI<br />QUERY</small></div>
      </header>

      <AiQaClient initialQuestion={query.slice(0, 600)} configured={ollama.ready} />

      <section className="ask-boundary" aria-labelledby="ask-boundary-heading">
        <div><p className="panel-kicker">How it works</p><h2 id="ask-boundary-heading">A shortcut into the archive</h2><p>{ASK_AGENT_NAME} retrieves the most relevant player pages, then passes those details to the model. Level and timing questions also receive values from the same calculation code used by the calculator tools.</p></div>
        <ul>
          <li><strong>Wiki pages</strong><span>Recipes, resources, quests, creatures, locations, and systems.</span></li>
          <li><strong>Game information</strong><span>{gameDataRecords.length ? `${gameDataRecords.length} current game records are included.` : 'The player guide is ready for the next game update.'}</span></li>
          <li><strong>Calculator data</strong><span>XP tables, action counts, batch yields, and active crafting time.</span></li>
          <li><strong>Honest limits</strong><span>Unknown or unverified details are called out rather than filled in.</span></li>
        </ul>
      </section>
    </main>
  );
}

