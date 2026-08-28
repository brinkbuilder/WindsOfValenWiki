import type { Metadata } from 'next';
import { WikiIndexClient } from '../components/WikiIndexClient';
import { unifiedSearchEntries } from '../lib/unified-search';

export const metadata: Metadata = {
  title: 'Wiki index',
  description: `Browse ${unifiedSearchEntries.length} Winds of Valen items, recipes, guides, creatures, quests, and locations.`,
};

export default async function WikiIndexPage({ searchParams }: { searchParams: Promise<{ type?: string | string[] }> }) {
  const params = await searchParams;
  const initialType = Array.isArray(params.type) ? params.type[0] : params.type;
  return (
    <main className="inner-page">
      <section className="index-hero">
        <div>
          <p className="eyebrow">Complete A–Z index</p>
          <h1>Browse the wiki</h1>
          <p>Everything is organized in one index. Filter by topic or type a name to jump directly to the page you need.</p>
        </div>
        <p className="unified-page-total"><strong>{unifiedSearchEntries.length}</strong> player pages</p>
      </section>
      <WikiIndexClient entries={unifiedSearchEntries} initialType={initialType ?? 'all'} />
    </main>
  );
}
