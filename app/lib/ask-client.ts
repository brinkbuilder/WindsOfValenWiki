import { ASK_AGENT_NAME } from './ask-agent';

export type AskSource = {
  slug: string;
  title: string;
  type: string;
  verification: string;
  href: string;
};

export type AskHistoryMessage = {
  role: 'user' | 'assistant';
  content: string;
};

type AskResponse = {
  answer?: string;
  sources?: AskSource[];
  interpretedQuestion?: string;
  error?: string;
};

export async function askAgent(question: string, history: AskHistoryMessage[] = []) {
  const response = await fetch('/api/ask', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ question, history }),
  });
  const payload = await response.json() as AskResponse;
  if (!response.ok) throw new Error(payload.error ?? `${ASK_AGENT_NAME} could not answer right now.`);
  return {
    answer: payload.answer ?? '',
    sources: payload.sources ?? [],
    interpretedQuestion: payload.interpretedQuestion,
  };
}
