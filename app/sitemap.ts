import type { MetadataRoute } from 'next';
import { wikiEntries } from './lib/wiki-data';

const siteUrl = 'https://valen-wiki-pi.vercel.app';

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages = ['/', '/wiki', '/ask', '/calculators', '/calculators/combat-level', '/recent', '/sources', '/about/data', '/contribute'];
  return [
    ...staticPages.map((path) => ({
      url: `${siteUrl}${path}`,
      changeFrequency: path === '/' ? 'weekly' as const : 'monthly' as const,
      priority: path === '/' ? 1 : path === '/wiki' ? 0.9 : 0.7,
    })),
    ...wikiEntries.map((entry) => ({
      url: `${siteUrl}/wiki/${entry.slug}`,
      changeFrequency: 'monthly' as const,
      priority: entry.type === 'Guide' || entry.type === 'Quest' ? 0.8 : 0.65,
    })),
  ];
}
