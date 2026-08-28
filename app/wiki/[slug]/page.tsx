import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { wikiBySlug, wikiEntries } from '../../lib/wiki-data';

/* Native images keep this static Vinext build compatible and let quest screenshots open at full size. */
/* eslint-disable @next/next/no-img-element */

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
  const skillCalculator = entry.slug === 'mining' ? '/calculators?skill=Mining'
    : entry.slug === 'fishing' ? '/calculators?skill=Fishing'
      : entry.slug === 'potion-making' ? '/calculators?skill=Potion%20Making'
        : ['attack', 'archery', 'defence', 'evasion', 'health', 'magic', 'warding', 'combat', 'combat-mechanics'].includes(entry.slug) ? '/calculators?tab=combat'
          : null;

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
            {entry.categories.slice(0, 2).map((category) => <span className="topic-pill" key={category}>{category}</span>)}
            {skillCalculator && <Link className="article-tool-button" href={skillCalculator}>Open calculator</Link>}
          </div>
        </div>
      </header>

      <nav className="article-tabs" aria-label="Article views">
        <a className="active" href="#article">Article</a>
        {related.length > 0 && <a href="#related">Related pages</a>}
        {skillCalculator && <Link href={skillCalculator}>Calculator</Link>}
        <a href="/contribute">Suggest an edit</a>
      </nav>

      <div className="article-layout" id="article">
        <article className="article-copy">
          <aside className="table-of-contents" aria-label="Table of contents">
            <strong>Contents</strong>
            <ol>
              {entry.sections.map((section, index) => <li key={section.title}><a href={`#section-${index + 1}`}>{section.title}</a></li>)}
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
              {section.images && (
                <div className="article-image-grid">
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
          </div>
          <dl>
            {entry.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value}</dd></div>)}
          </dl>
          <a href="/contribute">Suggest a correction <span>→</span></a>
        </aside>
      </div>
    </main>
  );
}
