'use client';

import { useEffect, useState, type FormEvent } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase, supabaseConfigured } from '../lib/supabase-browser';

type AuthMode = 'sign-in' | 'sign-up';
type ContributionKind = 'new_page' | 'page_update' | 'correction' | 'source';

type ContributionForm = {
  kind: ContributionKind;
  pageTitle: string;
  summary: string;
  details: string;
  sourceUrl: string;
};

const emptyForm: ContributionForm = {
  kind: 'page_update',
  pageTitle: '',
  summary: '',
  details: '',
  sourceUrl: '',
};

function userLabel(session: Session) {
  return String(session.user.user_metadata?.display_name ?? session.user.email?.split('@')[0] ?? 'Contributor');
}

export function ContributionClient() {
  const [session, setSession] = useState<Session | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('sign-in');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const [authMessage, setAuthMessage] = useState('');
  const [form, setForm] = useState<ContributionForm>(emptyForm);
  const [submitBusy, setSubmitBusy] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  useEffect(() => {
    if (!supabase) return;
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (active) setSession(nextSession);
    });
    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase) return;
    setAuthBusy(true);
    setAuthMessage('');

    if (authMode === 'sign-up' && displayName.trim().length < 2) {
      setAuthMessage('Choose a display name with at least 2 characters.');
      setAuthBusy(false);
      return;
    }
    if (authPassword.length < 8) {
      setAuthMessage('Use a password with at least 8 characters.');
      setAuthBusy(false);
      return;
    }

    const result = authMode === 'sign-up'
      ? await supabase.auth.signUp({
          email: authEmail.trim(),
          password: authPassword,
          options: { data: { display_name: displayName.trim() } },
        })
      : await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword });

    setAuthBusy(false);
    if (result.error) {
      setAuthMessage(result.error.message);
      return;
    }
    setAuthPassword('');
    setAuthMessage(authMode === 'sign-up' && !result.data.session
      ? 'Account created. Check your email before signing in.'
      : 'Signed in.');
  };

  const handleContribution = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!supabase || !session) return;
    setSubmitMessage('');
    if (form.pageTitle.trim().length < 2 || form.summary.trim().length < 10 || form.details.trim().length < 30) {
      setSubmitMessage('Add a page title, a useful summary, and at least 30 characters of detail.');
      return;
    }
    if (form.sourceUrl.trim() && !/^https?:\/\//i.test(form.sourceUrl.trim())) {
      setSubmitMessage('Source links must begin with http:// or https://.');
      return;
    }

    setSubmitBusy(true);
    const { error } = await supabase.from('contributions').insert({
      author_id: session.user.id,
      kind: form.kind,
      page_title: form.pageTitle.trim(),
      summary: form.summary.trim(),
      details: form.details.trim(),
      source_url: form.sourceUrl.trim() || null,
    });
    setSubmitBusy(false);
    if (error) {
      setSubmitMessage(error.message);
      return;
    }
    setForm(emptyForm);
    setSubmitMessage('Submitted for review. An editor will verify it before it appears in the wiki or contributor board.');
  };

  if (!supabaseConfigured) {
    return (
      <section className="contribution-card contribution-setup-card" aria-labelledby="contribution-setup-heading">
        <p className="panel-kicker">Community workspace</p>
        <h2 id="contribution-setup-heading">Contributions are being prepared</h2>
        <p>The hosted contribution service is not connected yet. Once Supabase is configured, visitors can create an account and submit edits here.</p>
        <p className="contribution-setup-note">Editors: run <code>supabase/schema.sql</code>, then add the two <code>NEXT_PUBLIC_SUPABASE_*</code> variables to the deployment.</p>
      </section>
    );
  }

  if (!session) {
    return (
      <section className="contribution-card" aria-labelledby="contribution-auth-heading">
        <div className="contribution-card-heading">
          <div><p className="panel-kicker">Join the editors</p><h2 id="contribution-auth-heading">Sign in to contribute</h2></div>
          <span className="contribution-card-mark" aria-hidden="true">+</span>
        </div>
        <p className="contribution-card-intro">Create an editor account so approved pages and corrections can be credited to you.</p>
        <div className="auth-mode-switch" role="tablist" aria-label="Account action">
          <button type="button" role="tab" aria-selected={authMode === 'sign-in'} onClick={() => { setAuthMode('sign-in'); setAuthMessage(''); }}>Sign in</button>
          <button type="button" role="tab" aria-selected={authMode === 'sign-up'} onClick={() => { setAuthMode('sign-up'); setAuthMessage(''); }}>Create account</button>
        </div>
        <form className="contribution-form" onSubmit={handleAuth}>
          {authMode === 'sign-up' && <label><span>Display name</span><input value={displayName} onChange={(event) => setDisplayName(event.target.value)} placeholder="How the community should credit you" autoComplete="nickname" required /></label>}
          <label><span>Email</span><input type="email" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required /></label>
          <label><span>Password</span><input type="password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={authMode === 'sign-up' ? 'new-password' : 'current-password'} required /></label>
          <button className="contribution-primary-button" type="submit" disabled={authBusy}>{authBusy ? 'Working...' : authMode === 'sign-up' ? 'Create editor account' : 'Sign in to contribute'}</button>
        </form>
        {authMessage && <p className="contribution-status" aria-live="polite">{authMessage}</p>}
      </section>
    );
  }

  return (
    <section className="contribution-card" aria-labelledby="contribution-form-heading">
      <div className="contribution-card-heading">
        <div><p className="panel-kicker">Editor account</p><h2 id="contribution-form-heading">Add a useful discovery</h2></div>
        <button className="contribution-text-button" type="button" onClick={() => supabase?.auth.signOut()}>Sign out</button>
      </div>
      <p className="contribution-signed-in">Contributing as <strong>{userLabel(session)}</strong>. Every submission enters review before publication.</p>
      <form className="contribution-form" onSubmit={handleContribution}>
        <label><span>Contribution type</span><select value={form.kind} onChange={(event) => setForm((current) => ({ ...current, kind: event.target.value as ContributionKind }))}><option value="page_update">Improve an existing page</option><option value="new_page">Suggest a new page</option><option value="correction">Correct an existing detail</option><option value="source">Add a source or evidence</option></select></label>
        <label><span>Page or topic</span><input value={form.pageTitle} onChange={(event) => setForm((current) => ({ ...current, pageTitle: event.target.value }))} placeholder="For example: Silver Ore" required /></label>
        <label><span>Short summary</span><input value={form.summary} onChange={(event) => setForm((current) => ({ ...current, summary: event.target.value }))} placeholder="What should players learn?" required /></label>
        <label><span>Details and evidence</span><textarea value={form.details} onChange={(event) => setForm((current) => ({ ...current, details: event.target.value }))} placeholder="Explain the steps, values, location, or correction. Include how you checked it." rows={7} required /></label>
        <label><span>Source link <small>optional</small></span><input type="url" value={form.sourceUrl} onChange={(event) => setForm((current) => ({ ...current, sourceUrl: event.target.value }))} placeholder="https://..." /></label>
        <button className="contribution-primary-button" type="submit" disabled={submitBusy}>{submitBusy ? 'Submitting...' : 'Submit for review'}</button>
      </form>
      {submitMessage && <p className="contribution-status" aria-live="polite">{submitMessage}</p>}
    </section>
  );
}
