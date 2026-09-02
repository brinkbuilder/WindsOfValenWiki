'use client';

import { useCallback, useEffect, useState } from 'react';
import type { AskHistoryMessage, AskSource } from './ask-client';

const storageKey = 'valen-buddy-conversation-v1';
const conversationEvent = 'valen-buddy-conversation-change';
const maximumStoredMessages = 24;
const maximumApiMessages = 10;

export type AskConversationMessage = AskHistoryMessage & {
  id: string;
  sources?: AskSource[];
  interpretedQuestion?: string;
};

function validSources(value: unknown): AskSource[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const sources = value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object') return [];
    const source = candidate as Partial<AskSource>;
    if (
      typeof source.slug !== 'string'
      || typeof source.title !== 'string'
      || typeof source.type !== 'string'
      || typeof source.verification !== 'string'
      || typeof source.href !== 'string'
      || !source.href.startsWith('/')
    ) return [];
    return [{
      slug: source.slug.slice(0, 160),
      title: source.title.slice(0, 200),
      type: source.type.slice(0, 80),
      verification: source.verification.slice(0, 80),
      href: source.href.slice(0, 500),
    }];
  });
  return sources.length ? sources.slice(0, 8) : undefined;
}

function validMessages(value: unknown): AskConversationMessage[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((candidate) => {
    if (!candidate || typeof candidate !== 'object') return [];
    const message = candidate as Partial<AskConversationMessage>;
    if (
      (message.role !== 'user' && message.role !== 'assistant')
      || typeof message.content !== 'string'
      || !message.content.trim()
    ) return [];
    return [{
      id: typeof message.id === 'string' ? message.id.slice(0, 100) : makeMessageId(),
      role: message.role,
      content: message.content.slice(0, 2400),
      sources: validSources(message.sources),
      interpretedQuestion: typeof message.interpretedQuestion === 'string'
        ? message.interpretedQuestion.slice(0, 600)
        : undefined,
    }];
  }).slice(-maximumStoredMessages);
}

function makeMessageId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function createConversationMessage(
  role: AskConversationMessage['role'],
  content: string,
  sources?: AskSource[],
  interpretedQuestion?: string,
): AskConversationMessage {
  return { id: makeMessageId(), role, content, sources, interpretedQuestion };
}

export function useAskConversation() {
  const [messages, setMessages] = useState<AskConversationMessage[]>([]);

  useEffect(() => {
    const loadStoredMessages = () => {
      try {
        setMessages(validMessages(JSON.parse(localStorage.getItem(storageKey) ?? '[]')));
      } catch {
        setMessages([]);
      }
    };
    loadStoredMessages();
    window.addEventListener(conversationEvent, loadStoredMessages);
    window.addEventListener('storage', loadStoredMessages);
    return () => {
      window.removeEventListener(conversationEvent, loadStoredMessages);
      window.removeEventListener('storage', loadStoredMessages);
    };
  }, []);

  const replaceMessages = useCallback((nextMessages: AskConversationMessage[]) => {
    const safeMessages = validMessages(nextMessages).slice(-maximumStoredMessages);
    setMessages(safeMessages);
    try {
      localStorage.setItem(storageKey, JSON.stringify(safeMessages));
      window.dispatchEvent(new Event(conversationEvent));
    } catch {
      // Chat remains usable when storage is unavailable or full.
    }
  }, []);

  const clearConversation = useCallback(() => replaceMessages([]), [replaceMessages]);
  const apiHistory = messages.slice(-maximumApiMessages).map(({ role, content }) => ({ role, content }));

  return { messages, replaceMessages, clearConversation, apiHistory };
}
