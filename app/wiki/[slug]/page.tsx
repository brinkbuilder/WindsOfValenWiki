import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { VerificationBadge } from '../../components/VerificationBadge';
import { findWikiSourceMatches, wikiSources, wikiSourceReaderPath } from '../../lib/wiki-source-registry';
import { verificationLabels, wikiBySlug, wikiEntries, type ExternalSource } from '../../lib/wiki-data';

export function generateStaticParams() {
  return wikiEntries.map((entry) => ({ slug: entry.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const entry = wikiBySlug.get(slug);
  if (!entry) return { title: 'Page not found' };
  return {
    title: entry.title,
    description: entry.summary,
    openGraph: { title: entry.title, description: entry.summary, type: 'article', images: [] },
    twitter: { card: 'summary', title: entry.title, description: entry.summary, images: [] },
  };
}

export default async function WikiArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const entry = wikiBySlug.get(slug);
  if (!entry) notFound();
  const related = (entry.related ?? []).map((relatedSlug) => wikiBySlug.get(relatedSlug)).filter(Boolean);
  const verification = verificationLabels[entry.verification];
  const automaticSources: ExternalSource[] = findWikiSourceMatches(entry.title, entry.aliases).map(({ source, page }) => ({
    id: `${source.id}-${page.pageId}`,
    site: source.name,
    pageTitle: page.title,
    permalink: source.permalink(page),
    revisionId: page.revisionId,
    revisedAt: page.revisedAt,
    retrievedAt: source.retrievedAt,
    relation: 'supplements',
    scope: ['Matching source article'],
    note: source.id === 'miraheze' ? 'Legacy cross-reference; prefer newer evidence when values differ.' : 'Current community cross-reference.',
    readerPath: wikiSourceReaderPath(source.id, page.pageId),
  }));
  const externalSources = [...(entry.externalSources ?? []), ...automaticSources]
    .filter((source, index, sources) => sources.findIndex((candidate) => candidate.permalink === source.permalink) === index)
    .map((source) => {
      if (source.readerPath) return source;
      const matchedSource = wikiSources.find((candidate) => candidate.name === source.site);
      const matchedPage = matchedSource?.pages.find((candidate) => candidate.revisionId === source.revisionId);
      return matchedSource && matchedPage ? { ...source, readerPath: wikiSourceReaderPath(matchedSource.id, matchedPage.pageId) } : source;
    });

  return (
    <main className="article-page">
      <div className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/wiki">Wiki</Link><span>/</span><span>{entry.title}</span>
      </div>

      <header className="article-title-block">
        <div>
          <p className="eyebrow">{entry.type} article</p>
          <h1>{entry.title}</h1>
          <p>{entry.intro}</p>
          <div className="article-badges">
            <VerificationBadge verification={entry.verification} />
            {entry.categories.slice(0, 2).map((category) => <span className="topic-pill" key={category}>{category}</span>)}
          </div>
        </div>
        <div className="article-monogram" aria-hidden="true">{entry.title.slice(0, 1)}</div>
      </header>

      <nav className="article-tabs" aria-label="Article views">
        <a className="active" href="#article">Article</a>
        <a href="#evidence">Evidence</a>
        {externalSources.length > 0 && <a href="#source-references">Sources</a>}
        <a href="#related">Related pages</a>
        <a href="/contribute">Suggest an edit</a>
      </nav>

      <div className="article-layout" id="article">
        <article className="article-copy">
          <aside className="table-of-contents" aria-label="Table of contents">
            <strong>Contents</strong>
            <ol>
              {entry.sections.map((section, index) => <li key={section.title}><a href={`#section-${index + 1}`}>{section.title}</a></li>)}
              <li><a href="#evidence">Evidence and source</a></li>
              {externalSources.length > 0 && <li><a href="#source-references">External source revisions</a></li>}
            </ol>
          </aside>

          {entry.sections.map((section, index) => (
            <section className="article-section" id={`section-${index + 1}`} key={section.title}>
              <h2><span>{index + 1}</span>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
              {section.table && (
                <div className="wiki-table-wrap">
                  <table className="wiki-table">
                    <thead><tr>{section.table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                    <tbody>{section.table.rows.map((row, rowIndex) => <tr key={`${row.join('-')}-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
            </section>
          ))}

          <section className="evidence-panel" id="evidence">
            <div className="evidence-mark" aria-hidden="true">✓</div>
            <div>
              <p className="eyebrow">Evidence record</p>
              <h2>{entry.source.label}</h2>
              <p>{entry.source.detail}</p>
              <dl>
                <div><dt>Observed</dt><dd>{entry.source.observed}</dd></div>
                <div><dt>Confidence</dt><dd>{verification.label}</dd></div>
                {entry.technicalId && <div><dt>Technical identity</dt><dd><code>{entry.technicalId}</code></dd></div>}
              </dl>
            </div>
          </section>

          {externalSources.length > 0 && (
            <section className="external-sources" id="source-references">
              <p className="eyebrow">Revision-level attribution</p>
              <h2>External source revisions</h2>
              <p className="external-sources-intro">These records remain distinct from the page’s primary verification. Open the copied version inside the archive or inspect the permanent source revision.</p>
              <div className="external-source-list">
                {externalSources.map((source) => (
                  <article className={`external-source-card source-relation-${source.relation}`} id={`source-${source.id}`} key={`${source.site}-${source.revisionId}`}>
                    <div>
                      <span>{source.relation}</span>
                      <h3>{source.pageTitle}</h3>
                      <p>{source.note ?? `Supports: ${source.scope.join(', ')}`}</p>
                    </div>
                    <dl>
                      <div><dt>Site</dt><dd>{source.site}</dd></div>
                      <div><dt>Revision</dt><dd>{source.revisionId}</dd></div>
                      <div><dt>Revised</dt><dd><time dateTime={source.revisedAt}>{new Date(source.revisedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time></dd></div>
                    </dl>
                    <div className="external-source-actions">
                      {source.readerPath && <a href={source.readerPath}>Read copied page</a>}
                      <a href={source.permalink} target="_blank" rel="noreferrer">Original revision ↗</a>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {related.length > 0 && (
            <section className="related-section" id="related">
              <p className="eyebrow">Keep exploring</p>
              <h2>Related pages</h2>
              <div className="related-grid">
                {related.map((item) => item && (
                  <a href={`/wiki/${item.slug}`} key={item.slug}>
                    <span>{item.type}</span>
                    <strong>{item.title}</strong>
                    <p>{item.summary}</p>
                    <i aria-hidden="true">→</i>
                  </a>
                ))}
              </div>
            </section>
          )}

          <div className="article-categories">
            <strong>Categories</strong>
            {entry.categories.map((category) => <a href={`/search?q=${encodeURIComponent(category)}`} key={category}>{category}</a>)}
          </div>
        </article>

        <aside className="infobox">
          <div className="infobox-heading">
            <span>{entry.type}</span>
            <h2>{entry.title}</h2>
            {entry.technicalId && <code>{entry.technicalId}</code>}
          </div>
          <dl>
            {entry.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}{fact.sourceRef && <a className="fact-source-ref" href={`#source-${fact.sourceRef}`} aria-label={`Source for ${fact.label}`}>source</a>}</dd></div>)}
          </dl>
          <div className="infobox-status"><VerificationBadge verification={entry.verification} compact /><p>{verification.description}</p></div>
          <a href="/contribute">Report missing or incorrect data <span>→</span></a>
        </aside>
      </div>
    </main>
  );
}
