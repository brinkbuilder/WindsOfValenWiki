const localOllamaUrl = 'http://localhost:11434/api/chat';
const loopbackHosts = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]']);

export type OllamaConfiguration = {
  ready: boolean;
  url: string;
  issue?: string;
};

export function getOllamaConfiguration(): OllamaConfiguration {
  const configuredUrl = process.env.OLLAMA_BASE_URL?.trim();
  const url = configuredUrl || localOllamaUrl;

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
  } catch {
    return {
      ready: false,
      url,
      issue: 'OLLAMA_BASE_URL is not a valid URL.',
    };
  }

  if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
    return {
      ready: false,
      url,
      issue: 'OLLAMA_BASE_URL must use HTTP or HTTPS.',
    };
  }

  if (process.env.VERCEL && loopbackHosts.has(parsedUrl.hostname)) {
    return {
      ready: false,
      url,
      issue: 'This deployment cannot reach Ollama at localhost. Set OLLAMA_BASE_URL to your secured public HTTPS Ollama proxy or tunnel.',
    };
  }

  if (process.env.VERCEL && parsedUrl.protocol !== 'https:') {
    return {
      ready: false,
      url,
      issue: 'A Vercel deployment requires an HTTPS OLLAMA_BASE_URL.',
    };
  }

  return { ready: true, url: parsedUrl.toString() };
}
