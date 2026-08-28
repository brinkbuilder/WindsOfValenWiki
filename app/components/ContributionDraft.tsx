'use client';

import { useEffect, useState } from 'react';

const emptyDraft = { page: '', finding: '', details: '', name: '' };

export function ContributionDraft() {
  const [draft, setDraft] = useState(emptyDraft);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let restoreTimer: number | undefined;
    try {
      const saved = window.localStorage.getItem('valen-wiki-contribution');
      if (saved) {
        const restoredDraft = { ...emptyDraft, ...JSON.parse(saved) };
        restoreTimer = window.setTimeout(() => setDraft(restoredDraft), 0);
      }
    } catch {
      // A blocked storage API should never prevent someone drafting a note.
    }
    return () => {
      if (restoreTimer !== undefined) window.clearTimeout(restoreTimer);
    };
  }, []);

  useEffect(() => {
    try { window.localStorage.setItem('valen-wiki-contribution', JSON.stringify(draft)); } catch { /* local saving is optional */ }
  }, [draft]);

  const text = [
    `Page: ${draft.page || '[page or new article]'}`,
    `Suggested finding: ${draft.finding || '[what should change]'}`,
    `Helpful details: ${draft.details || '[requirements, steps, drops, or screenshot notes]'}`,
    `Credit: ${draft.name || '[anonymous]'}`,
    '',
    'Please keep private character and account information out of the submission.',
  ].join('\n');

  return (
    <div className="contribution-draft">
      <label><span>Page or article name</span><input value={draft.page} onChange={(event) => setDraft({ ...draft, page: event.target.value })} placeholder="e.g. Infused Coal" /></label>
      <label><span>What did you discover or correct?</span><textarea rows={5} value={draft.finding} onChange={(event) => setDraft({ ...draft, finding: event.target.value })} placeholder="State the smallest clear factual change…" /></label>
      <label><span>Helpful details</span><textarea rows={4} value={draft.details} onChange={(event) => setDraft({ ...draft, details: event.target.value })} placeholder="Requirements, steps, ingredients, drops, directions, or screenshot notes…" /></label>
      <label><span>Credit name (optional)</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Anonymous is fine" /></label>
      <div className="draft-actions">
        <button type="button" onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1800); }}>{copied ? 'Copied to clipboard' : 'Copy contribution proposal'}</button>
        <button className="secondary" type="button" onClick={() => setDraft(emptyDraft)}>Clear draft</button>
      </div>
      <p className="draft-note">This first version saves the draft only on this device and copies a moderation-ready proposal. It does not publish or send anything automatically.</p>
    </div>
  );
}
