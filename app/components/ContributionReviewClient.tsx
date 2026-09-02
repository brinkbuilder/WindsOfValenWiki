'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabase-browser';

type ReviewState = 'loading' | 'signed-out' | 'not-moderator' | 'ready' | 'error';
type ReviewStatus = 'approved' | 'rejected';

type ReviewContribution = {
  id: string;
  author_id: string;
  kind: string;
  page_title: string;
  summary: string;
  details: string;
  source_url: string | null;
  created_at: string;
  author_name: string;
};

type RawReviewContribution = Omit<ReviewContribution, 'author_name'> & {
  profiles: { display_name: string } | { display_name: string }[] | null;
};

function contributionLabel(kind: string) {
  return ({
    new_page: 'New page',
    page_update: 'Page update',
    correction: 'Correction',
    source: 'Source or evidence',
  } as Record<string, string>)[kind] ?? 'Contribution';
}

export function ContributionReviewClient() {
  const [state, setState] = useState<ReviewState>(supabaseConfigured ? 'loading' : 'error');
  const [rows, setRows] = useState<ReviewContribution[]>([]);
  const [message, setMessage] = useState('');
  const [busyId, setBusyId] = useState('');
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const client = supabase;
    if (!client) return;
    let active = true;

    const load = async (nextSession: Session | null) => {
      if (!active) return;
      setSession(nextSession);
      if (!nextSession) {
        setState('signed-out');
        return;
      }

      const { data: profile, error: profileError } = await client
        .from('profiles')
        .select('role')
        .eq('id', nextSession.user.id)
        .maybeSingle();
      if (!active) return;
      if (profileError) {
        setState('error');
        setMessage(profileError.message);
        return;
      }
      if (profile?.role !== 'moderator') {
        setState('not-moderator');
        return;
      }

      const { data, error } = await client
        .from('contributions')
        .select('id, author_id, kind, page_title, summary, details, source_url, created_at, profiles!contributions_author_id_fkey(display_name)')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });
      if (!active) return;
      if (error) {
        setState('error');
        setMessage(error.message);
        return;
      }

      const reviewRows = ((data ?? []) as unknown as RawReviewContribution[]).map((row) => ({
        ...row,
        author_name: Array.isArray(row.profiles) ? row.profiles[0]?.display_name ?? 'Contributor' : row.profiles?.display_name ?? 'Contributor',
      }));
      setRows(reviewRows);
      setState('ready');
    };

    client.auth.getSession().then(({ data }) => load(data.session));
    const { data: authListener } = client.auth.onAuthStateChange((_event, nextSession) => load(nextSession));
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateContribution = async (id: string, status: ReviewStatus) => {
    if (!supabase || !session) return;
    setBusyId(id);
    setMessage('');
    const { error } = await supabase.from('contributions').update({
      status,
      reviewed_by: session.user.id,
      reviewed_at: new Date().toISOString(),
    }).eq('id', id);
    setBusyId('');
    if (error) {
      setMessage(error.message);
      return;
    }
    setRows((current) => current.filter((row) => row.id !== id));
  };

  if (state === 'error') {
    return <p className="contribution-status">{supabaseConfigured ? message || 'The review queue could not be loaded.' : 'Connect Supabase before using the review queue.'}</p>;
  }
  if (state === 'loading') return <p className="contributor-empty">Checking editor permissions...</p>;
  if (state === 'signed-out') return <p className="contributor-empty">Sign in on the <Link href="/contribute">contribution page</Link> first.</p>;
  if (state === 'not-moderator') return <p className="contributor-empty">This page is limited to wiki moderators.</p>;

  return (
    <section className="review-queue" aria-labelledby="review-queue-heading">
      <div className="review-queue-heading"><div><p className="panel-kicker">Moderator tools</p><h2 id="review-queue-heading">Pending contributions</h2></div><span>{rows.length} waiting</span></div>
      {message && <p className="contribution-status" aria-live="polite">{message}</p>}
      {rows.length === 0 ? <p className="contributor-empty">The queue is clear. New community discoveries will appear here.</p> : (
        <div className="review-list">
          {rows.map((row) => (
            <article className="review-item" key={row.id}>
              <div className="review-item-meta"><span>{contributionLabel(row.kind)}</span><time dateTime={row.created_at}>{new Date(row.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })}</time></div>
              <h3>{row.page_title}</h3>
              <p className="review-item-summary">{row.summary}</p>
              <p className="review-item-details">{row.details}</p>
              <p className="review-item-author">Submitted by <strong>{row.author_name}</strong>{row.source_url && <> · <a href={row.source_url} target="_blank" rel="noreferrer">Open source</a></>}</p>
              <div className="review-item-actions"><button className="contribution-primary-button" type="button" disabled={busyId === row.id} onClick={() => updateContribution(row.id, 'approved')}>Approve</button><button className="contribution-secondary-button" type="button" disabled={busyId === row.id} onClick={() => updateContribution(row.id, 'rejected')}>Reject</button></div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
