import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { playerEntryTypeLabel, wikiBySlug, wikiEntries } from '../../lib/wiki-data';
import { EbonyCavesInteractiveMap } from '../../components/EbonyCavesInteractiveMap';
import { WorldInteractiveMap } from '../../components/WorldInteractiveMap';

/* Native images keep this static Vinext build compatible and let quest screenshots open at full size. */
/* eslint-disable @next/next/no-img-element */

export function generateStaticParams() {
  return wikiEntries.map((entry) => ({ slug: entry.slug }));
}

const itemPageByTerm = new Map<string, { href: string; slug: string }>();
wikiEntries.forEach((entry) => {
  if (entry.type !== 'Item' && entry.type !== 'Resource') return;
  [entry.title, ...(entry.aliases ?? [])].forEach((term) => {
    const normalized = term.trim().toLowerCase();
    if (normalized.length > 2) itemPageByTerm.set(normalized, { href: `/wiki/${entry.slug}`, slug: entry.slug });
  });
});

const itemMentionPattern = [...itemPageByTerm.keys()]
  .sort((a, b) => b.length - a.length)
  .map((term) => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');
const itemMentionRegex = itemMentionPattern ? new RegExp(`(${itemMentionPattern})`, 'gi') : null;

function linkItems(value: string, currentSlug: string) {
  if (!itemMentionRegex) return value;
  return value.split(itemMentionRegex).map((part, index) => {
    const page = itemPageByTerm.get(part.toLowerCase());
    return page && page.slug !== currentSlug
      ? <Link className="wiki-item-link" href={page.href} key={`${part}-${index}`}>{part}</Link>
      : part;
  });
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
  const typeLabel = playerEntryTypeLabel(entry);
  const skillCalculator = entry.slug === 'mining' ? '/calculators?skill=Mining'
    : entry.slug === 'fishing' ? '/calculators?skill=Fishing'
      : entry.slug === 'smithing' ? '/calculators?skill=Smithing'
      : entry.slug === 'potion-making' ? '/calculators?skill=Potion%20Making'
        : ['attack', 'archery', 'defence', 'evasion', 'health', 'magic', 'warding', 'combat', 'combat-mechanics'].includes(entry.slug) ? '/calculators?tab=combat'
          : null;

  return (
    <main className={`article-page${entry.slug === 'world-map' ? ' world-map-article' : ''}`} id="top">
      <div className="breadcrumbs" aria-label="Breadcrumb">
        <Link href="/">Home</Link><span>/</span><Link href="/wiki">Wiki</Link><span>/</span><span>{entry.title}</span>
      </div>

      <header className="article-title-block">
        <div>
          <p className="eyebrow">{typeLabel}</p>
          <h1>{entry.title}</h1>
          <p>{linkItems(entry.intro, entry.slug)}</p>
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
              {section.paragraphs?.map((paragraph) => <p key={paragraph}>{linkItems(paragraph, entry.slug)}</p>)}
              {section.bullets && <ul>{section.bullets.map((bullet) => <li key={bullet}>{linkItems(bullet, entry.slug)}</li>)}</ul>}
              {section.steps && <ol className="quest-steps">{section.steps.map((step) => <li key={step}>{linkItems(step, entry.slug)}</li>)}</ol>}
              {section.table && (
                <div className="wiki-table-wrap">
                  <table className="wiki-table">
                    <thead><tr>{section.table.headers.map((header) => <th key={header}>{linkItems(header, entry.slug)}</th>)}</tr></thead>
                    <tbody>{section.table.rows.map((row, rowIndex) => <tr key={`${row.join('-')}-${rowIndex}`}>{row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{linkItems(cell, entry.slug)}</td>)}</tr>)}</tbody>
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
                      {image.caption && <figcaption>{linkItems(image.caption, entry.slug)}</figcaption>}
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
                    <span>{playerEntryTypeLabel(item)}</span>
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
            {entry.facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{linkItems(fact.value, entry.slug)}</dd></div>)}
          </dl>
        </aside>
      </div>
    </main>
  );
}
