'use client';

import { useState, type FormEvent } from 'react';
import { ASK_AGENT_NAME } from '../lib/ask-agent';
import { askAgent, type AskSource } from '../lib/ask-client';

const exampleQuestions = [
  'How long would it take me to get to level 80 Potion Making?',
  'What do I need to make Strong Shields Potions?',
  'Where can I find Coal?',
  'How do I unlock the Crystal Caverns bank?',
];

export function AiQaClient({ initialQuestion = '', configured }: { initialQuestion?: string; configured: boolean }) {
  const [question, setQuestion] = useState(initialQuestion);
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<AskSource[]>([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const askQuestion = async (event: FormEvent<HTMLFormElement>) => {
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
    <div className="ask-workspace">
      {!configured && (
        <aside className="ask-setup-note">
          <strong>{ASK_AGENT_NAME} is not connected on this deployment yet.</strong>
          <span>Add the server-only <code>OLLAMA_API_KEY</code> environment variable to enable answers.</span>
        </aside>
      )}

      <section className="ask-card" aria-labelledby="ask-form-heading">
        <div className="ask-card-heading">
          <div><p className="panel-kicker">{ASK_AGENT_NAME}</p><h2 id="ask-form-heading">What do you want to know?</h2></div>
          <span className="ask-card-mark" aria-hidden="true">?</span>
        </div>
        <p className="ask-card-intro">Ask naturally. {ASK_AGENT_NAME} searches the player wiki and uses its calculators for XP, batch, and time questions.</p>
        <form className="ask-form" onSubmit={askQuestion}>
          <label htmlFor="wiki-question" className="sr-only">Your question</label>
          <textarea
            id="wiki-question"
            value={question}
            maxLength={600}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="How long would it take me to get to level 80 Potion Making?"
            rows={3}
          />
          <div className="ask-form-footer">
            <span>{question.length}/600</span>
            <button className="ask-submit-button" type="submit" disabled={busy}>{busy ? `Searching with ${ASK_AGENT_NAME}...` : ASK_AGENT_NAME}</button>
          </div>
        </form>
        <div className="ask-examples" aria-label="Example questions">
          <span>Try asking</span>
          {exampleQuestions.map((example) => <button type="button" key={example} onClick={() => { setQuestion(example); setAnswer(''); setError(''); }}>{example}</button>)}
        </div>
        {error && <p className="ask-error" role="alert">{error}</p>}
      </section>

      {answer && (
        <section className="ask-answer" aria-labelledby="ask-answer-heading" aria-live="polite">
          <div className="ask-answer-heading">
            <div><p className="panel-kicker">{ASK_AGENT_NAME} answer</p><h2 id="ask-answer-heading">Here is what the archive says</h2></div>
            <span className="ask-answer-status">Grounded answer</span>
          </div>
          <div className="ask-answer-copy">{answer}</div>
          {sources.length > 0 && (
            <div className="ask-sources">
              <p>Sources used</p>
              <ul>{sources.map((source) => <li key={source.slug}><a href={source.href}>{source.title}</a><span>{source.type} Â· {source.verification}</span></li>)}</ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

