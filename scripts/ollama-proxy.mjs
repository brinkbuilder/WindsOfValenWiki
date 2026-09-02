import { timingSafeEqual } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';

function loadLocalEnvironment() {
  try {
    const contents = readFileSync(new URL('../.env', import.meta.url), 'utf8');
    for (const line of contents.split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/);
      if (!match || match[2] === '' || process.env[match[1]] !== undefined) continue;

      const value = match[2].replace(/^(['"])(.*)\1$/, '$2');
      process.env[match[1]] = value;
    }
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error;
  }
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(value ?? '', 10);
  return Number.isSafeInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function tokenMatches(header, expectedToken) {
  const prefix = 'Bearer ';
  if (!header?.startsWith(prefix)) return false;

  const received = Buffer.from(header.slice(prefix.length), 'utf8');
  const expected = Buffer.from(expectedToken, 'utf8');
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function sendJson(response, status, payload) {
  response.writeHead(status, {
    'cache-control': 'no-store',
    'content-type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload));
}

async function readJson(request, maxBytes) {
  const chunks = [];
  let size = 0;

  for await (const chunk of request) {
    size += chunk.length;
    if (size > maxBytes) throw new Error('REQUEST_TOO_LARGE');
    chunks.push(chunk);
  }

  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

loadLocalEnvironment();

const token = process.env.OLLAMA_API_KEY?.trim();
if (!token) {
  throw new Error('OLLAMA_API_KEY must be set in .env before starting the Ollama gateway.');
}

const port = positiveInteger(process.env.OLLAMA_PROXY_PORT, 11435);
const maxConcurrent = positiveInteger(process.env.OLLAMA_PROXY_MAX_CONCURRENT, 2);
const maxBodyBytes = 256 * 1024;
const model = process.env.OLLAMA_MODEL?.trim() || 'llama3.1:8b';
const keepAlive = process.env.OLLAMA_KEEP_ALIVE?.trim() || '-1m';
const localChatUrl = 'http://127.0.0.1:11434/api/chat';
let activeRequests = 0;

const server = createServer(async (request, response) => {
  const url = new URL(request.url ?? '/', 'http://127.0.0.1');

  if (request.method === 'GET' && url.pathname === '/health') {
    return sendJson(response, 200, { status: 'ok' });
  }

  if (request.method !== 'POST' || url.pathname !== '/api/chat') {
    return sendJson(response, 404, { error: 'Not found.' });
  }

  if (!tokenMatches(request.headers.authorization, token)) {
    return sendJson(response, 401, { error: 'Unauthorized.' });
  }

  if (activeRequests >= maxConcurrent) {
    return sendJson(response, 429, { error: 'Ask Alice is busy. Try again shortly.' });
  }

  activeRequests += 1;
  try {
    const body = await readJson(request, maxBodyBytes);
    if (!Array.isArray(body.messages) || body.messages.length < 1) {
      return sendJson(response, 400, { error: 'A messages array is required.' });
    }

    const messages = body.messages.map((message) => ({
      role: ['system', 'user', 'assistant'].includes(message?.role) ? message.role : 'user',
      content: typeof message?.content === 'string' ? message.content.slice(0, 80_000) : '',
    }));
    const upstream = await fetch(localChatUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        think: false,
        keep_alive: keepAlive,
        options: {
          temperature: 0.1,
          num_predict: Math.min(500, positiveInteger(body.options?.num_predict, 500)),
        },
      }),
      signal: AbortSignal.timeout(55_000),
    });
    const responseBody = await upstream.text();

    response.writeHead(upstream.status, {
      'cache-control': 'no-store',
      'content-type': upstream.headers.get('content-type') ?? 'application/json; charset=utf-8',
    });
    response.end(responseBody);
  } catch (error) {
    if (error?.message === 'REQUEST_TOO_LARGE') {
      return sendJson(response, 413, { error: 'Request body is too large.' });
    }
    if (error instanceof SyntaxError) {
      return sendJson(response, 400, { error: 'Send valid JSON.' });
    }

    console.error('Ollama gateway request failed.', error);
    return sendJson(response, 502, { error: 'Local Ollama is unavailable.' });
  } finally {
    activeRequests -= 1;
  }
});

server.listen(port, '127.0.0.1', () => {
  console.log(`Ask Alice Ollama gateway listening on http://127.0.0.1:${port}`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}
