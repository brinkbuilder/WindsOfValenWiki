'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ASK_AGENT_NAME } from '../lib/ask-agent';
import { askAgent } from '../lib/ask-client';
import { createConversationMessage, useAskConversation } from '../lib/use-ask-conversation';

export function AskZhiznFloatingChat() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const endOfChat = useRef<HTMLDivElement>(null);
  const { messages, replaceMessages, clearConversation, apiHistory } = useAskConversation();

  useEffect(() => {
    if (open) endOfChat.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, busy, open]);

  if (pathname === '/ask') return null;

  const submitQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedQuestion = question.trim();
    if (trimmedQuestion.length < 3) {
      setError('Ask a question with at least 3 characters.');
      return;
    }

    const conversationWithQuestion = [
      ...messages,
      createConversationMessage('user', trimmedQuestion),
    ];
    replaceMessages(conversationWithQuestion);
    setQuestion('');
    setBusy(true);
    setError('');
    try {
      const result = await askAgent(trimmedQuestion, apiHistory);
      replaceMessages([
        ...conversationWithQuestion,
        createConversationMessage('assistant', result.answer, result.sources, result.interpretedQuestion),
      ]);
    } catch (requestError) {
      replaceMessages(messages);
      setQuestion(trimmedQuestion);
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
            <div className="ask-floating-identity"><span className="ask-floating-avatar" aria-hidden="true">?</span><div><strong id="ask-floating-title">{ASK_AGENT_NAME}</strong><small>Conversation saved on this device</small></div></div>
            <div className="ask-floating-actions">
              {messages.length > 0 && <button type="button" className="ask-floating-clear" onClick={clearConversation} disabled={busy}>Clear</button>}
              <a href="/ask">Full page</a>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
            </div>
          </header>
          <div className="ask-floating-body" aria-live="polite">
            {messages.length === 0 && !error && <p className="ask-floating-welcome">Ask a question, then keep talking. I remember your recent messages and use the wiki and calculators to answer directly.</p>}
            {messages.map((message) => (
              <article className={`ask-floating-message is-${message.role}`} key={message.id}>
                <span>{message.role === 'user' ? 'You' : ASK_AGENT_NAME}</span>
                {message.role === 'assistant' && message.interpretedQuestion && <small className="ask-floating-interpretation">Understood as: “{message.interpretedQuestion}”</small>}
                <p>{message.content}</p>
                {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                  <details>
                    <summary>Sources checked ({message.sources.length})</summary>
                    <ul>{message.sources.slice(0, 4).map((source) => <li key={source.slug}><a href={source.href}>{source.title}</a><small>{source.type} · {source.verification}</small></li>)}</ul>
                  </details>
                )}
              </article>
            ))}
            {busy && <div className="ask-floating-message is-assistant ask-thinking" role="status"><span>{ASK_AGENT_NAME}</span><p>Thinking…</p></div>}
            {error && <p className="ask-floating-error" role="alert">{error}</p>}
            <div ref={endOfChat} />
          </div>
          <form className="ask-floating-form" onSubmit={submitQuestion}>
            <label className="sr-only" htmlFor="ask-floating-question">Ask {ASK_AGENT_NAME}</label>
            <input id="ask-floating-question" value={question} maxLength={600} onChange={(event) => setQuestion(event.target.value)} placeholder={messages.length ? 'Ask a follow-up…' : 'Ask a question…'} autoComplete="off" />
            <button type="submit" disabled={busy} aria-label={busy ? 'Sending question' : 'Send question'}>{busy ? '…' : '→'}</button>
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
