'use client';

import { usePathname } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { ASK_AGENT_NAME } from '../lib/ask-agent';
import { askAgent, type AskSource } from '../lib/ask-client';

export function AskZhiznFloatingChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<AskSource[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (pathname === '/ask') return null;

  const submitQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 3) {
      setError('Ask a question with at least 3 characters.');
      return;
    }

    setBusy(true);
    setError('');
    setAnswer('');
    setSources([]);
    try {
      const result = await askAgent(trimmedQuestion);
      setAnswer(result.answer);
      setSources(result.sources);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : `${ASK_AGENT_NAME} could not answer right now.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`ask-floating-root${open ? ' is-open' : ''}`}>
      {open && (
        <section id="ask-floating-panel" className="ask-floating-panel" role="dialog" aria-labelledby="ask-floating-title">
          <header className="ask-floating-header">
            <div className="ask-floating-identity"><span className="ask-floating-avatar" aria-hidden="true">?</span><div><strong id="ask-floating-title">{ASK_AGENT_NAME}</strong><small>Wiki and game-data guide</small></div></div>
            <div className="ask-floating-actions"><a href="/ask">Full page</a><button type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button></div>
          </header>
          <div className="ask-floating-body" aria-live="polite">
            {!answer && !error && <p className="ask-floating-welcome">Ask about recipes, quests, locations, mechanics, or training goals. I will check the wiki, imported game data, and calculators.</p>}
            {answer && <div className="ask-floating-answer"><span>Answer</span><p>{answer}</p>{sources.length > 0 && <ul>{sources.slice(0, 4).map((source) => <li key={source.slug}><a href={source.href}>{source.title}</a><small>{source.type} · {source.verification}</small></li>)}</ul>}</div>}
            {error && <p className="ask-floating-error" role="alert">{error}</p>}
          </div>
          <form className="ask-floating-form" onSubmit={submitQuestion}>
            <label className="sr-only" htmlFor="ask-floating-question">Ask {ASK_AGENT_NAME}</label>
            <input id="ask-floating-question" value={question} maxLength={600} onChange={(event) => setQuestion(event.target.value)} placeholder="Ask a question..." autoComplete="off" />
            <button type="submit" disabled={busy} aria-label={busy ? 'Sending question' : 'Send question'}>{busy ? '...' : '→'}</button>
          </form>
        </section>
      )}
      <button className="ask-floating-launcher" type="button" aria-controls="ask-floating-panel" aria-expanded={open} aria-label={open ? `Close ${ASK_AGENT_NAME}` : `Open ${ASK_AGENT_NAME}`} onClick={() => setOpen((value) => !value)}>
        <span className="ask-floating-launcher-mark" aria-hidden="true">?</span>
        <span className="ask-floating-launcher-label">{ASK_AGENT_NAME}</span>
      </button>
    </div>
  );
}
