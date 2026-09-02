'use client';

import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase-browser';

type ApprovedContribution = {
  id: string;
  kind: string;
  page_title: string;
  summary: string;
  details: string;
  source_url: string | null;
  created_at: string;
  author_name: string;
};

function contributionLabel(kind: string) {
  return ({
    new_page: 'New page',
    page_update: 'Page update',
    correction: 'Correction',
    source: 'Source or evidence',
  } as Record<string, string>)[kind] ?? 'Community note';
}

function safeSourceUrl(value: string | null) {
  return value && /^https?:\/\//i.test(value) ? value : null;
}

export function ApprovedContributions({ pageTitle }: { pageTitle?: string }) {
  const [rows, setRows] = useState<ApprovedContribution[]>([]);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;
    const request = pageTitle
      ? client.from('approved_contributions').select('id, kind, page_title, summary, details, source_url, created_at, author_name').eq('page_title', pageTitle).order('created_at', { ascending: false }).limit(20)
      : client.from('approved_contributions').select('id, kind, page_title, summary, details, source_url, created_at, author_name').order('created_at', { ascending: false }).limit(12);

    request.then(({ data, error }) => {
      if (!active) return;
      if (error) {
        setFailed(true);
      } else {
        setRows((data ?? []) as ApprovedContribution[]);
      }
      setLoading(false);
    });

    return () => { active = false; };
  }, [pageTitle]);

  if (!supabaseConfigured) return null;
  if (pageTitle && (loading || failed || rows.length === 0)) return null;
  if (loading) return <p className="contributor-empty">Loading approved community notes...</p>;
  if (failed) return <p className="contribution-status">Approved community notes are temporarily unavailable.</p>;

  return (
    <section className={`approved-contributions${pageTitle ? ' article-community-notes' : ''}`} aria-labelledby={pageTitle ? 'article-community-notes-heading' : 'approved-contributions-heading'}>
      <div className="approved-contributions-heading"><div><p className="panel-kicker">Verified community work</p><h2 id={pageTitle ? 'article-community-notes-heading' : 'approved-contributions-heading'}>{pageTitle ? `Community notes for ${pageTitle}` : 'Recently approved contributions'}</h2></div><span>{rows.length} {rows.length === 1 ? 'note' : 'notes'}</span></div>
      <div className="approved-contribution-list">
        {rows.map((row) => {
          const sourceUrl = safeSourceUrl(row.source_url);
          return (
            <article className="approved-contribution-item" key={row.id}>
              <div className="approved-contribution-meta"><span>{contributionLabel(row.kind)}</span><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time></div>
              {!pageTitle && <h3>{row.page_title}</h3>}
              <p className="approved-contribution-summary">{row.summary}</p>
              <p className="approved-contribution-details">{row.details}</p>
              <p className="approved-contribution-author">Added by <strong>{row.author_name}</strong>{sourceUrl && <> · <a href={sourceUrl} target="_blank" rel="noreferrer">View source</a></>}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
