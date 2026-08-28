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
  const description = `${record.source.name} revision ${record.page.revisionId}, presented with attribution in The Valen Archives.`;
  return { title: `${record.page.title} — ${record.source.shortName}`, description, openGraph: { title: record.page.title, description, images: [] }, twitter: { card: 'summary', title: record.page.title, description, images: [] } };
}

export default async function WikiSourceReaderPage({ params }: PageProps) {
  const { source: sourceId, pageId } = await params;
  const sourcePage = await readWikiSourcePage(sourceId, Number(pageId));
  if (!sourcePage) notFound();
  const { source, page, html, images, error } = sourcePage;
  const directoryHref = `/sources/${source.slug}`;

  return (
    <main className="source-reader-page">
      <div className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/sources">Sources</Link><span>/</span><Link href={directoryHref}>{source.shortName}</Link><span>/</span><span>{page.title}</span>
      </div>

      <header className="source-reader-header">
        <div>
          <p className="eyebrow">Copied with developer permission · revision preserved</p>
          <h1>{page.title}</h1>
          <p>{source.role}</p>
        </div>
        <dl>
          <div><dt>Source</dt><dd>{source.name}</dd></div>
          <div><dt>Revision</dt><dd>{page.revisionId}</dd></div>
          <div><dt>Revised</dt><dd><time dateTime={page.revisedAt}>{new Date(page.revisedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time></dd></div>
          <div><dt>Licence</dt><dd>{source.licenseName}</dd></div>
        </dl>
      </header>

      <nav className="source-reader-actions" aria-label="Source page actions">
        <Link href={directoryHref}>Back to directory</Link>
        <a href={source.permalink(page)} target="_blank" rel="noreferrer">Open permanent source revision ↗</a>
      </nav>

      {error ? (
        <section className="source-reader-error">
          <h2>This revision could not be loaded inside the archive.</h2>
          <p>{error}</p>
          <a href={source.permalink(page)} target="_blank" rel="noreferrer">Read it on {source.name} ↗</a>
        </section>
      ) : (
        <article className="source-reader-content" dangerouslySetInnerHTML={{ __html: html }} />
      )}

      <footer className="source-attribution">
        <div>
          <strong>Source and reuse</strong>
          <p>Copied from <a href={source.permalink(page)} target="_blank" rel="noreferrer">{source.name}, revision {page.revisionId}</a>. {source.id === 'miraheze' ? 'Miraheze material is licensed CC BY-SA 4.0; adaptations on this page retain that attribution and licence.' : 'The game-development team has authorized reuse of this material.'}</p>
        </div>
        {source.licenseUrl && <a href={source.licenseUrl} target="_blank" rel="noreferrer">View licence ↗</a>}
        {images.length > 0 && <span>{images.length} referenced {images.length === 1 ? 'image' : 'images'}</span>}
      </footer>
    </main>
  );
}
