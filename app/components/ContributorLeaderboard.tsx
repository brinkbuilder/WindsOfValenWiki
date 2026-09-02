'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { supabase, supabaseConfigured } from '../lib/supabase-browser';

type Contributor = {
  id: string;
  display_name: string;
  pages_added: number;
  edits_approved: number;
  contribution_score: number;
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

export function ContributorLeaderboard() {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(supabaseConfigured);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let active = true;
    const client = supabase;
    if (!client) return () => { active = false; };

    client
      .from('contributor_leaderboard')
      .select('id, display_name, pages_added, edits_approved, contribution_score')
      .order('contribution_score', { ascending: false })
      .order('display_name', { ascending: true })
      .limit(5)
      .then(({ data, error }) => {
        if (!active) return;
        if (error) {
          setFailed(true);
        } else {
          setContributors((data ?? []).map((row) => ({
            id: String(row.id),
            display_name: String(row.display_name),
            pages_added: Number(row.pages_added),
            edits_approved: Number(row.edits_approved),
            contribution_score: Number(row.contribution_score),
          })));
        }
        setLoading(false);
      });

    return () => { active = false; };
  }, []);

  if (loading) return <p className="contributor-empty">Loading the editor board...</p>;

  if (failed) {
    return <p className="contributor-empty">The editor board is temporarily unavailable. You can still submit a contribution.</p>;
  }

  if (!supabaseConfigured || contributors.length === 0) {
    return (
      <div className="contributor-empty">
        <strong>No approved contributions yet.</strong>
        <p>Be one of the first editors to add a verified item, guide, map, or correction.</p>
        <Link href="/contribute">Start contributing <span aria-hidden="true">-&gt;</span></Link>
      </div>
    );
  }

  return (
    <ol className="contributor-list" aria-label="Top wiki contributors">
      {contributors.map((contributor, index) => (
        <li className="contributor-row" key={contributor.id}>
          <span className="contributor-rank">{String(index + 1).padStart(2, '0')}</span>
          <span className="contributor-avatar" aria-hidden="true">{initials(contributor.display_name)}</span>
          <span className="contributor-name"><strong>{contributor.display_name}</strong><small>{contributor.pages_added} {contributor.pages_added === 1 ? 'page' : 'pages'} added</small></span>
          <span className="contributor-score"><strong>{contributor.contribution_score}</strong><small>{contributor.edits_approved} approved</small></span>
        </li>
      ))}
    </ol>
  );
}
