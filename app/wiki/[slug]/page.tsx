import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { findWikiSourceMatches, wikiSources, wikiSourceReaderPath } from '../../lib/wiki-source-registry';
import { wikiBySlug, wikiEntries } from '../../lib/wiki-data';
import type { ExternalSource } from '../../lib/wiki-data';
import { EbonyCavesInteractiveMap } from '../../components/EbonyCavesInteractiveMap';
import { WorldInteractiveMap } from '../../components/WorldInteractiveMap';

/* Native images keep this static Vinext build compatible and let quest screenshots open at full size. */
/* eslint-disable @next/next/no-img-element */

export function generateStaticParams() {
  return wikiEntries.map((entry) => ({ slug: entry.slug }));
}

function playerTypeLabel(type: (typeof wikiEntries)[number]['type']) {
  if (type === 'Activity') return 'Skill';
  if (type === 'System') return 'Game system';
  return type;
}

function verificationLabel(verification: (typeof wikiEntries)[number]['verification']) {
  if (verification === 'engine') return 'Game documented';
  if (verification === 'player') return 'Player confirmed';
  if (verification === 'community') return 'Community source';
  return 'Documented';
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
  const typeLabel = playerTypeLabel(entry.type);
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
    note: source.id === 'miraheze' ? 'Older guide; details may differ from the current game.' : 'Current community guide.',
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
  const skillCalculator = entry.slug === 'mining' ? '/calculators?skill=Mining'
    : entry.slug === 'fishing' ? '/calculators?skill=Fishing'
      : entry.slug === 'smithing' ? '/calculators?skill=Smithing'
      : entry.slug === 'potion-making' ? '/calculators?skill=Potion%20Making'
        : ['attack', 'archery', 'defence', 'evasion', 'health', 'magic', 'warding', 'combat', 'combat-mechanics'].includes(entry.slug) ? '/calculators?tab=combat'
          : null;

  return (
    <main className="article-page" id="top">
      <div className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/wiki">Wiki</Link><span>/</span><span>{entry.title}</span>
      </div>

      <header className="article-title-block">
        <div>
          <p className="eyebrow">{typeLabel}</p>
          <h1>{entry.title}</h1>
          <p>{entry.intro}</p>
          <div className="article-badges">
            <span className={`verification-badge verification-${entry.verification}`}><i />{verificationLabel(entry.verification)}</span>
            {entry.categories.slice(0, 2).map((category) => <span className="topic-pill" key={category}>{category}</span>)}
            {skillCalculator && <Link className="article-tool-button" href={skillCalculator}>Open calculator</Link>}
          </div>
        </div>
      </header>

      <nav className="article-tabs" aria-label="Article views">
        <a className="active" href="#article">Article</a>
        {related.length > 0 && <a href="#related">Related pages</a>}
        {externalSources.length > 0 && <a href="#source-references">Sources</a>}
        {skillCalculator && <Link href={skillCalculator}>Calculator</Link>}
        <a href="/contribute">Suggest an edit</a>
      </nav>

      <div className="article-layout" id="article">
        <article className="article-copy">
          <aside className="table-of-contents" aria-label="Table of contents">
            <strong>Contents</strong>
            <ol>
              {entry.sections.map((section, index) => <li key={section.title}><a href={`#section-${index + 1}`}>{section.title}</a></li>)}
              {externalSources.length > 0 && <li><a href="#source-references">Source notes</a></li>}
            </ol>
          </aside>

          {entry.sections.map((section, index) => (
            <section className="article-section" id={`section-${index + 1}`} key={section.title}>
              <h2><span>{index + 1}</span>{section.title}</h2>
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
              {section.steps && <ol className="quest-steps">{section.steps.map((step) => <li key={step}>{step}</li>)}</ol>}
              {section.table && (
                <div className="wiki-table-wrap">
                  <table className="wiki-table">
                    <thead><tr>{section.table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                    <tbody>{section.table.rows.map((row, rowIndex) => <tr key={`${row.join('-')}-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cell}</td>)}</tr>)}</tbody>
                  </table>
                </div>
              )}
              {entry.slug === 'world-map' && index === 0 ? <WorldInteractiveMap /> : entry.slug === 'cavern-mine' && index === 0 ? <EbonyCavesInteractiveMap /> : section.images && (
                <div className={`article-image-grid${section.images.length === 1 ? ' single-image' : ''}`}>
                  {section.images.map((image) => (
                    <figure className="article-figure" key={image.src}>
                      <a href={image.src} aria-label={`Open full-size image: ${image.alt}`}>
                        <img src={image.src} alt={image.alt} loading="lazy" decoding="async" />
                      </a>
                      {image.caption && <figcaption>{image.caption}</figcaption>}
                    </figure>
                  ))}
                </div>
              )}
            </section>
          ))}

          {externalSources.length > 0 && (
            <section className="external-sources" id="source-references">
              <p className="eyebrow">Keep reading</p>
              <h2>Source notes</h2>
              <p className="external-sources-intro">Use these community pages for additional context. Older sources may differ from the current game.</p>
              <div className="external-source-list">
                {externalSources.map((source) => (
                  <article className={`external-source-card source-relation-${source.relation}`} id={`source-${source.id}`} key={`${source.site}-${source.revisionId}`}>
                    <div>
                      <span>{source.site}</span>
                      <h3>{source.pageTitle}</h3>
                      <p>{source.note ?? 'Open the source guide for additional player details.'}</p>
                    </div>
                    <dl><div><dt>Revision</dt><dd>{source.revisionId}</dd></div><div><dt>Updated</dt><dd>{source.revisedAt.slice(0, 10)}</dd></div></dl>
                    <div className="external-source-actions">
                      {source.readerPath && <Link href={source.readerPath}>Read guide</Link>}
                      <a href={source.permalink} target="_blank" rel="noreferrer">Visit original wiki ↗</a>
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
                    <span>{playerTypeLabel(item.type)}</span>
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
            {entry.categories.map((category) => <Link href={`/search?q=${encodeURIComponent(category)}`} key={category}>{category}</Link>)}
            <a className="back-to-top" href="#top">Back to top ↑</a>
          </div>
        </article>

        <aside className="infobox">
          <div className="infobox-heading">
            <span>{typeLabel}</span>
            <h2>{entry.title}</h2>
          </div>
          <dl>
            {entry.facts.map((fact) => {
              const source = fact.sourceRef ? externalSources.find((candidate) => candidate.id === fact.sourceRef) : undefined;
              return <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}{source && <a className="fact-source-ref" href={`#source-${source.id}`}>Source note</a>}</dd></div>;
            })}
          </dl>
          <a href="/contribute">Suggest a correction <span>→</span></a>
        </aside>
      </div>
    </main>
  );
}
