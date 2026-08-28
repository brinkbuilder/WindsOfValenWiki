import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getWikiSourcePage } from '../../../lib/wiki-source-registry';
import { readWikiSourcePage } from '../../../lib/wiki-source-reader';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ source: string; pageId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { source, pageId } = await params;
  const record = getWikiSourcePage(source, Number(pageId));
  if (!record) return { title: 'Wiki page not found' };
  const description = `Winds of Valen guide to ${record.page.title}.`;
  return {
    title: record.page.title,
    description,
    openGraph: { title: record.page.title, description, images: [] },
    twitter: { card: 'summary', title: record.page.title, description, images: [] },
  };
}

export default async function ConsolidatedWikiPage({ params }: PageProps) {
  const { source: sourceId, pageId } = await params;
  const wikiPage = await readWikiSourcePage(sourceId, Number(pageId));
  if (!wikiPage) notFound();
  const { source, page, html, error } = wikiPage;
  const topic = page.categories[0] ?? 'Wiki';
  const isCalculator = /calculator/i.test(page.title);

  if (isCalculator) {
    if (/mining/i.test(page.title)) redirect('/calculators?skill=Mining');
    if (/fishing/i.test(page.title)) redirect('/calculators?skill=Fishing');
    if (/potion/i.test(page.title)) redirect('/calculators?skill=Potion%20Making');
    redirect('/calculators?tab=combat');
  }

  return (
    <main className="source-reader-page unified-imported-page">
      <div className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/wiki">Wiki</Link><span>/</span><span>{page.title}</span>
      </div>

      <header className="imported-article-header">
        <p className="eyebrow">{topic}</p>
        <h1>{page.title}</h1>
      </header>

      {error ? (
        <section className="source-reader-error">
          <h2>This page is temporarily unavailable.</h2>
          <p>Please return to the wiki index and try another page.</p>
          <Link href="/wiki">Browse the wiki</Link>
        </section>
      ) : (
        <article className="source-reader-content unified-imported-content" dangerouslySetInnerHTML={{ __html: html }} />
      )}

      {source.id === 'miraheze' && <p className="wiki-licence-note">Legacy community material is adapted under CC BY-SA 4.0.</p>}
    </main>
  );
}
