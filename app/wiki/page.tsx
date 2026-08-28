import type { Metadata } from 'next';
import { WikiIndexClient } from '../components/WikiIndexClient';
import { searchEntries, wikiStats } from '../lib/wiki-data';

export const metadata: Metadata = {
  title: 'Wiki index',
  description: `Browse ${wikiStats.articles} Winds of Valen items, recipes, guides, creatures, routes, and systems.`,
};

export default async function WikiIndexPage({ searchParams }: { searchParams: Promise<{ type?: string | string[] }> }) {
  const params = await searchParams;
  const initialType = Array.isArray(params.type) ? params.type[0] : params.type;
  return (
    <main className="inner-page">
      <section className="index-hero">
        <div>
          <p className="eyebrow">The complete field index</p>
          <h1>Explore the archives</h1>
          <p>Browse items, recipes, skills, quests, creatures, locations, and practical routes for every stage of your adventure.</p>
        </div>
        <dl className="index-stats">
          <div><dt>Pages</dt><dd>{wikiStats.articles}</dd></div>
          <div><dt>Recipes</dt><dd>{wikiStats.recipes}</dd></div>
          <div><dt>Routes</dt><dd>{wikiStats.routes}</dd></div>
          <div><dt>Community</dt><dd>{wikiStats.communityArticles}</dd></div>
        </dl>
      </section>
      <WikiIndexClient entries={searchEntries} initialType={initialType ?? 'all'} />
    </main>
  );
}
