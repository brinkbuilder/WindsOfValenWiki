import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getWikiSourcePage } from '../../../lib/wiki-source-registry';
import { readWikiSourcePage } from '../../../lib/wiki-source-reader';

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ source: string; pageId: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { source, pageId } = await params;
  const record = getWikiSourcePage(source, Number(pageId));
  if (!record) return { title: 'Source page not found' };
  const description = `Read the ${record.page.title} player guide from ${record.source.name}.`;
  return { title: `${record.page.title} — ${record.source.shortName}`, description, openGraph: { title: record.page.title, description, images: [] }, twitter: { card: 'summary', title: record.page.title, description, images: [] } };
}

export default async function WikiSourceReaderPage({ params }: PageProps) {
  const { source: sourceId, pageId } = await params;
  const sourcePage = await readWikiSourcePage(sourceId, Number(pageId));
  if (!sourcePage) notFound();
  const { source, page, html, images, error } = sourcePage;
  const directoryHref = `/sources/${source.slug}`;
  const requiresOriginalInteraction = /calculator/i.test(page.title);

  return (
    <main className="source-reader-page">
      <div className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/sources">Sources</Link><span>/</span><Link href={directoryHref}>{source.shortName}</Link><span>/</span><span>{page.title}</span>
      </div>

      <header className="source-reader-header">
        <div>
          <p className="eyebrow">Community player guide</p>
          <h1>{page.title}</h1>
          <p>{source.role}</p>
        </div>
        <dl>
          <div><dt>Source</dt><dd>{source.name}</dd></div>
          <div><dt>Licence</dt><dd>{source.licenseName}</dd></div>
        </dl>
      </header>

      <nav className="source-reader-actions" aria-label="Source page actions">
        <Link href={directoryHref}>Back to directory</Link>
        <a href={source.permalink(page)} target="_blank" rel="noreferrer">Visit original wiki ↗</a>
      </nav>

      {requiresOriginalInteraction && !error && (
        <aside className="source-reader-notice">
          <div><strong>Interactive calculator</strong><p>Open this guide on the original wiki to use its calculator.</p></div>
          <a href={source.permalink(page)} target="_blank" rel="noreferrer">Use the original calculator ↗</a>
        </aside>
      )}

      {error ? (
        <section className="source-reader-error">
          <h2>This guide is temporarily unavailable here.</h2>
          <p>You can still read it on the original community wiki.</p>
          <a href={source.permalink(page)} target="_blank" rel="noreferrer">Read it on {source.name} ↗</a>
        </section>
      ) : (
        <article className="source-reader-content" dangerouslySetInnerHTML={{ __html: html }} />
      )}

      <footer className="source-attribution">
        <div>
          <strong>Community guide</strong>
          <p>Originally published on <a href={source.permalink(page)} target="_blank" rel="noreferrer">{source.name}</a>. {source.id === 'miraheze' ? 'Miraheze material is licensed CC BY-SA 4.0.' : 'Reproduced with permission from the Winds of Valen team.'}</p>
        </div>
        {source.licenseUrl && <a href={source.licenseUrl} target="_blank" rel="noreferrer">View licence ↗</a>}
        {images.length > 0 && <span>{images.length} referenced {images.length === 1 ? 'image' : 'images'}</span>}
      </footer>
    </main>
  );
}
