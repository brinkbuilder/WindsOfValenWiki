'use client';

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ASK_AGENT_NAME } from '../lib/ask-agent';
import { askAgent } from '../lib/ask-client';
import { createConversationMessage, useAskConversation } from '../lib/use-ask-conversation';

const exampleQuestions = [
  'What is the best way to train Potion Making from 70-80, and how long will it take?',
  'What do I need to make Strong Shields Potions?',
  'Where can I find Coal?',
  'How do I unlock the Crystal Caverns bank?',
];

export function AiQaClient({ initialQuestion = '', configured }: { initialQuestion?: string; configured: boolean }) {
  const [question, setQuestion] = useState(initialQuestion);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const endOfChat = useRef<HTMLDivElement>(null);
  const { messages, replaceMessages, clearConversation, apiHistory } = useAskConversation();

  useEffect(() => {
    endOfChat.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, busy]);

  const askQuestion = async (event: FormEvent<HTMLFormElement>) => {
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

  const handleComposerKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      event.currentTarget.form?.requestSubmit();
    }
  };

  return (
    <div className="ask-workspace">
      {!configured && (
        <aside className="ask-setup-note">
          <strong>{ASK_AGENT_NAME} is not connected on this deployment yet.</strong>
          <span>Connect this deployment to a secured Ollama HTTPS endpoint with <code>OLLAMA_BASE_URL</code>.</span>
        </aside>
      )}

      <section className="ask-card ask-chat-card" aria-labelledby="ask-form-heading">
        <div className="ask-card-heading">
          <div>
            <p className="panel-kicker">Conversation with {ASK_AGENT_NAME}</p>
            <h2 id="ask-form-heading">What do you want to know?</h2>
          </div>
          <div className="ask-chat-heading-actions">
            {messages.length > 0 && <button type="button" className="ask-clear-button" onClick={clearConversation} disabled={busy}>Clear chat</button>}
            <span className="ask-card-mark" aria-hidden="true">?</span>
          </div>
        </div>
        <p className="ask-card-intro">Ask naturally, then keep talking. {ASK_AGENT_NAME} remembers this conversation and uses the wiki plus exact calculators for training questions.</p>

        <div className="ask-chat-log" aria-live="polite" aria-label={`Conversation with ${ASK_AGENT_NAME}`}>
          {messages.length === 0 && (
            <div className="ask-chat-empty">
              <strong>Start a conversation</strong>
              <span>Ask for a recommendation, calculation, guide, or location. You can ask follow-up questions without repeating yourself.</span>
            </div>
          )}
          {messages.map((message) => (
            <article className={`ask-message is-${message.role}`} key={message.id}>
              <span className="ask-message-meta">{message.role === 'user' ? 'You' : ASK_AGENT_NAME}</span>
              {message.role === 'assistant' && message.interpretedQuestion && <span className="ask-message-interpretation">Understood as: “{message.interpretedQuestion}”</span>}
              <div className="ask-message-copy">{message.content}</div>
              {message.role === 'assistant' && message.sources && message.sources.length > 0 && (
                <details className="ask-message-sources">
                  <summary>Sources checked ({message.sources.length})</summary>
                  <ul>{message.sources.map((source) => <li key={source.slug}><a href={source.href}>{source.title}</a><span>{source.type} · {source.verification}</span></li>)}</ul>
                </details>
              )}
            </article>
          ))}
          {busy && (
            <div className="ask-message is-assistant ask-thinking" role="status">
              <span className="ask-message-meta">{ASK_AGENT_NAME}</span>
              <div className="ask-message-copy">Thinking through your question…</div>
            </div>
          )}
          <div ref={endOfChat} />
        </div>

        <form className="ask-form ask-chat-composer" onSubmit={askQuestion}>
          <label htmlFor="wiki-question" className="sr-only">Your question</label>
          <textarea
            id="wiki-question"
            value={question}
            maxLength={600}
            onChange={(event) => setQuestion(event.target.value)}
            onKeyDown={handleComposerKeyDown}
            placeholder={messages.length ? 'Ask a follow-up…' : 'What is the best way to train Potion Making from 70-80?'}
            rows={2}
          />
          <div className="ask-form-footer">
            <span>{question.length}/600 · Enter to send · Shift+Enter for a new line</span>
            <button className="ask-submit-button" type="submit" disabled={busy}>{busy ? 'Thinking…' : 'Send'}</button>
          </div>
        </form>
        {messages.length === 0 && (
          <div className="ask-examples" aria-label="Example questions">
            <span>Try asking</span>
            {exampleQuestions.map((example) => <button type="button" key={example} onClick={() => { setQuestion(example); setError(''); }}>{example}</button>)}
          </div>
        )}
        {error && <p className="ask-error" role="alert">{error} Your question is ready to send again.</p>}
      </section>
    </div>
  );
}
