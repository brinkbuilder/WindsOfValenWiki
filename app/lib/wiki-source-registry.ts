import { communityPermalink, communitySearchEntries, communityWikiPages, communityWikiSnapshot } from './community-wiki';
import { mirahezePermalink, mirahezeSearchEntries, mirahezeWikiPages, mirahezeWikiSnapshot } from './miraheze-wiki';

export type WikiSourceId = 'community' | 'miraheze';

export type WikiSourcePage = {
  pageId: number;
  title: string;
  revisionId: number;
  revisedAt: string;
  categories: string[];
};

export type WikiSourceDefinition = {
  id: WikiSourceId;
  slug: string;
  name: string;
  shortName: string;
  role: string;
  baseUrl: string;
  apiUrl: string;
  articlePathPrefix: string;
  retrievedAt: string;
  articleCount: number;
  pageCount: number;
  fileCount: number;
  licenseName: string;
  licenseUrl?: string;
  pages: WikiSourcePage[];
  permalink: (page: WikiSourcePage) => string;
};

export const wikiSources: WikiSourceDefinition[] = [
  {
    id: 'community',
    slug: 'winds-of-valen-wiki',
    name: 'Winds Of Valen Wiki',
    shortName: 'Outdated community archive',
    role: 'Outdated community guides and historical game information.',
    baseUrl: communityWikiSnapshot.baseUrl,
    apiUrl: communityWikiSnapshot.apiUrl,
    articlePathPrefix: '/w/',
    retrievedAt: communityWikiSnapshot.retrievedAt,
    articleCount: communityWikiSnapshot.articleCount,
    pageCount: communityWikiSnapshot.pageCount,
    fileCount: 250,
    licenseName: 'Used with permission',
    pages: communityWikiPages,
    permalink: communityPermalink,
  },
  {
    id: 'miraheze',
    slug: 'miraheze',
    name: 'Winds of Valen Miraheze Wiki',
    shortName: 'Outdated Miraheze archive',
    role: 'Outdated guides, historical mechanics, maps, calculators, and images.',
    baseUrl: mirahezeWikiSnapshot.baseUrl,
    apiUrl: mirahezeWikiSnapshot.apiUrl,
    articlePathPrefix: '/wiki/',
    retrievedAt: mirahezeWikiSnapshot.retrievedAt,
    articleCount: mirahezeWikiSnapshot.articleCount,
    pageCount: mirahezeWikiSnapshot.pageCount,
    fileCount: mirahezeWikiSnapshot.fileCount,
    licenseName: mirahezeWikiSnapshot.licenseName,
    licenseUrl: mirahezeWikiSnapshot.licenseUrl,
    pages: mirahezeWikiPages,
    permalink: mirahezePermalink,
  },
];

export const wikiSourceSearchEntries = [...communitySearchEntries, ...mirahezeSearchEntries];

export function getWikiSource(sourceId: string) {
  return wikiSources.find((source) => source.id === sourceId);
}

export function getWikiSourcePage(sourceId: string, pageId: number) {
  const source = getWikiSource(sourceId);
  if (!source) return undefined;
  const page = source.pages.find((candidate) => candidate.pageId === pageId);
  return page ? { source, page } : undefined;
}

const normalizeTitle = (value: string) => value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
const preserveTitleCase = (value: string) => value.trim().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');

export function findWikiSourceMatches(title: string, aliases: string[] = []) {
  const exactTitle = preserveTitleCase(title);
  const exactAliases = new Set(aliases.map(preserveTitleCase));
  const normalizedCandidates = new Set([title, ...aliases].map(normalizeTitle));
  return wikiSources.flatMap((source) => {
    const primaryMatches = source.pages.filter((page) => preserveTitleCase(page.title) === exactTitle);
    const aliasMatches = primaryMatches.length === 0
      ? source.pages.filter((page) => exactAliases.has(preserveTitleCase(page.title)))
      : [];
    const normalizedMatches = primaryMatches.length === 0 && aliasMatches.length === 0
      ? source.pages.filter((page) => normalizedCandidates.has(normalizeTitle(page.title)))
      : [];
    return [...primaryMatches, ...aliasMatches, ...normalizedMatches].map((page) => ({ source, page }));
  });
}

export function wikiSourceReaderPath(sourceId: WikiSourceId, pageId: number) {
  return `/sources/${sourceId}/${pageId}`;
}
