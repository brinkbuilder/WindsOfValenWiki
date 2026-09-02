import {
  actionsRequired,
  levelForXp,
  skillTrainingData,
  xpForLevel,
  type SkillName,
} from './calculator-data';
import {
  potionBrewRecipes,
  potionCauldrons,
  potionOutputName,
  potionVials,
} from './potion-data';
import { gameDataBuild, gameDataExportedAt, gameDataRecords, type GameDataRecord } from './game-data';
import { wikiEntries, type WikiEntry } from './wiki-data';

const number = new Intl.NumberFormat('en-US');
const maxContextCharacters = 18000;

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'be', 'can', 'do', 'does', 'for', 'from', 'get', 'how', 'i', 'if',
  'in', 'is', 'it', 'long', 'me', 'my', 'of', 'on', 'or', 'the', 'take', 'that', 'to', 'what', 'where',
  'which', 'would', 'you', 'your',
]);

export type QaSource = {
  slug: string;
  title: string;
  type: string;
  verification: WikiEntry['verification'] | 'engine' | 'inferred';
  href: string;
};

export type QaContext = {
  context: string;
  sources: QaSource[];
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function tokens(value: string) {
  return normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token));
}

function entryText(entry: WikiEntry) {
  const lines = [entry.title, entry.summary, entry.intro, ...(entry.aliases ?? []), ...entry.categories];
  for (const fact of entry.facts) lines.push(fact.label, fact.value);
  for (const section of entry.sections) {
    lines.push(section.title, ...(section.paragraphs ?? []), ...(section.bullets ?? []), ...(section.steps ?? []));
    if (section.table) lines.push(...section.table.headers, ...section.table.rows.flat());
  }
  return lines.filter(Boolean).join(' ');
}

function formattedEntry(entry: WikiEntry) {
  const lines = [
    `## ${entry.title} [wiki:${entry.slug}]`,
    `Type: ${entry.type}`,
    `Verification: ${entry.verification}`,
    `Summary: ${entry.summary}`,
    `Introduction: ${entry.intro}`,
    `Source: ${entry.source.label}; observed ${entry.source.observed}`,
  ];

  if (entry.facts.length) {
    lines.push('Facts:');
    lines.push(...entry.facts.map((fact) => `- ${fact.label}: ${fact.value}`));
  }
  for (const section of entry.sections) {
    lines.push(`Section: ${section.title}`);
    lines.push(...(section.paragraphs ?? []).map((paragraph) => `- ${paragraph}`));
    lines.push(...(section.bullets ?? []).map((bullet) => `- ${bullet}`));
    lines.push(...(section.steps ?? []).map((step, index) => `- Step ${index + 1}: ${step}`));
    if (section.table) {
      lines.push(`Table columns: ${section.table.headers.join(' | ')}`);
      lines.push(...section.table.rows.map((row) => `- ${row.join(' | ')}`));
    }
  }
  return lines.join('\n');
}

const wikiSearchRecords = wikiEntries.map((entry) => ({
  entry,
  normalizedTitle: normalize(entry.title),
  titleTerms: new Set(tokens(`${entry.title} ${(entry.aliases ?? []).join(' ')}`)),
  searchableTerms: new Set(tokens(entryText(entry))),
}));

function gameDataText(record: GameDataRecord) {
  return [record.id, record.name, record.kind, ...Object.entries(record.fields).flat(), record.notes ?? ''].join(' ');
}

function formattedGameDataRecord(record: GameDataRecord) {
  const lines = [
    `## Game-file record: ${record.name} [game:${record.id}]`,
    `Kind: ${record.kind}`,
    `Confidence: ${record.source.confidence}`,
    `Source file: ${record.source.file}`,
  ];
  if (record.source.objectPath) lines.push(`Object path: ${record.source.objectPath}`);
  if (record.source.build) lines.push(`Build: ${record.source.build}`);
  if (record.source.extractedAt) lines.push(`Extracted at: ${record.source.extractedAt}`);
  if (Object.keys(record.fields).length) {
    lines.push('Fields:');
    lines.push(...Object.entries(record.fields).map(([key, value]) => `- ${key}: ${value}`));
  }
  if (record.notes) lines.push(`Notes: ${record.notes}`);
  return lines.join('\n');
}

const gameDataSearchRecords = gameDataRecords.map((record) => ({
  record,
  normalizedName: normalize(record.name),
  nameTerms: new Set(tokens(`${record.name} ${record.id}`)),
  searchableTerms: new Set(tokens(gameDataText(record))),
}));

function rankGameData(question: string) {
  const query = normalize(question);
  const queryTokens = tokens(question);
  return gameDataSearchRecords
    .map(({ record, normalizedName, nameTerms, searchableTerms }) => {
      let score = query && query.length > 4 && normalizedName.includes(query) ? 100 : 0;
      for (let index = 0; index < queryTokens.length - 1; index += 1) {
        const phrase = queryTokens.slice(index, index + 2).join(' ');
        if (normalizedName === phrase) score += 55;
        else if (normalizedName.includes(phrase)) score += 12;
      }
      for (const token of queryTokens) {
        if (nameTerms.has(token)) score += 30;
        else if (searchableTerms.has(token)) score += 4;
      }
      return { record, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.record.name.localeCompare(b.record.name));
}

function rankEntries(question: string) {
  const query = normalize(question);
  const queryTokens = tokens(question);
  return wikiSearchRecords
    .map(({ entry, normalizedTitle, titleTerms, searchableTerms }) => {
      let score = query && query.length > 4 && normalizedTitle.includes(query) ? 100 : 0;
      for (let index = 0; index < queryTokens.length - 1; index += 1) {
        const phrase = queryTokens.slice(index, index + 2).join(' ');
        if (normalizedTitle === phrase) score += 55;
        else if (normalizedTitle.includes(phrase)) score += 12;
      }
      for (const token of queryTokens) {
        if (titleTerms.has(token)) score += 30;
        else if (searchableTerms.has(token)) score += 4;
      }
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
}

function sourceFor(entry: WikiEntry): QaSource {
  return {
    slug: entry.slug,
    title: entry.title,
    type: entry.type,
    verification: entry.verification,
    href: `/wiki/${entry.slug}`,
  };
}

function addSource(sources: QaSource[], source: QaSource) {
  if (!sources.some((item) => item.slug === source.slug)) sources.push(source);
}

function levelMention(question: string, pattern: RegExp) {
  const match = question.match(pattern);
  return match ? Math.max(1, Math.min(100, Math.floor(Number(match[1])))) : null;
}

function levelsForGoal(question: string) {
  const explicitCurrentLevel = levelMention(
    question,
    /\b(?:from|starting(?:\s+at)?|currently(?:\s+at)?|current(?:\s+level)?)\s*(?:level|lvl|lv)?\s*(\d{1,3})\b/i,
  ) ?? levelMention(question, /\b(?:i'm|im|i am)\s+(?:currently\s+)?(?:level|lvl|lv)\s*(\d{1,3})\b/i);
  const targetLevel = levelMention(
    question,
    /\b(?:get\s+to|reach(?:ing)?|up\s+to|to|target(?:\s+level)?|goal(?:\s+level)?)\s*(?:level|lvl|lv)?\s*(\d{1,3})\b/i,
  );
  const mentionedLevels = [...question.matchAll(/\b(?:level|lvl|lv)\s*(\d{1,3})\b/gi)]
    .map((match) => Math.max(1, Math.min(100, Math.floor(Number(match[1])))));
  const currentLevel = explicitCurrentLevel ?? (mentionedLevels.length > 1 ? mentionedLevels[0] : 1);
  return {
    currentLevel,
    targetLevel: targetLevel ?? mentionedLevels.at(-1) ?? null,
    currentWasInferred: explicitCurrentLevel === null,
  };
}

function detectedSkill(question: string): SkillName | null {
  const normalizedQuestion = normalize(question);
  if (/potion|brew|bottl|cauldron|essence gland/.test(normalizedQuestion)) return 'Potion Making';
  if (/smith|anvil|furnace|workbench/.test(normalizedQuestion)) return 'Smithing';
  if (/fish|fishing|catch/.test(normalizedQuestion)) return 'Fishing';
  if (/mine|mining|ore|rock/.test(normalizedQuestion)) return 'Mining';
  return null;
}

function formatDuration(seconds: number) {
  const roundedSeconds = Math.ceil(seconds);
  const hours = Math.floor(roundedSeconds / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const remainingSeconds = roundedSeconds % 60;
  return [hours ? `${hours}h` : '', minutes ? `${minutes}m` : '', remainingSeconds ? `${remainingSeconds}s` : '']
    .filter(Boolean)
    .join(' ') || '0s';
}

type PotionMethod = {
  recipe: (typeof potionBrewRecipes)[number];
  vial: (typeof potionVials)[number];
  batchYield: number;
  xp: number;
  seconds: number;
};

function potionMethodsAtLevel(level: number): PotionMethod[] {
  const cauldron = potionCauldrons.find((item) => item.id === 'large') ?? potionCauldrons[0];
  return potionBrewRecipes
    .filter((recipe) => recipe.level <= level)
    .flatMap((recipe) => potionVials
      .filter((vial) => vial.level <= level)
      .map((vial) => {
        const batchYield = Math.floor(cauldron.capacityMl / vial.volumeMl);
        return {
          recipe,
          vial,
          batchYield,
          xp: recipe.xp + batchYield * vial.bottlingXp,
          seconds: recipe.duration + batchYield * vial.bottlingSeconds,
        };
      }))
    .sort((a, b) => b.xp / b.seconds - a.xp / a.seconds || b.xp - a.xp);
}

function potionTrainingEstimate(currentLevel: number, targetLevel: number, currentXp: number) {
  const targetXp = xpForLevel(targetLevel);
  let xp = currentXp;
  let level = currentLevel;
  let totalBatches = 0;
  let totalSeconds = 0;
  const segments: string[] = [];

  while (xp < targetXp && level < 100 && segments.length < 20) {
    const method = potionMethodsAtLevel(level)[0];
    if (!method) break;
    const nextUnlock = [
      ...potionBrewRecipes.map((recipe) => recipe.level),
      ...potionVials.map((vial) => vial.level),
      targetLevel,
    ]
      .filter((unlockLevel) => unlockLevel > level && unlockLevel <= targetLevel)
      .sort((a, b) => a - b)[0] ?? targetLevel;
    const boundaryXp = xpForLevel(nextUnlock);
    const batches = Math.max(1, actionsRequired(Math.max(0, boundaryXp - xp), method.xp));
    const beforeLevel = level;
    xp += batches * method.xp;
    totalBatches += batches;
    totalSeconds += batches * method.seconds;
    level = Math.min(targetLevel, levelForXp(xp));
    segments.push(`- Levels ${beforeLevel}-${level}: ${batches} batches of ${potionOutputName(method.recipe, method.vial)} (${number.format(method.xp)} XP and ${formatDuration(method.seconds)} active time per batch)`);
  }

  return {
    targetXp,
    totalBatches,
    totalSeconds,
    segments,
  };
}

function calculatorContext(question: string, sources: QaSource[]) {
  const skill = detectedSkill(question);
  if (!skill) return '';

  const { currentLevel, targetLevel, currentWasInferred } = levelsForGoal(question);
  const lines = [
    '## Deterministic calculator data',
    `Skill detected: ${skill}`,
    `Starting level used: ${currentLevel}${currentWasInferred ? ' (assumed because the question did not include one)' : ''}`,
  ];
  addSource(sources, {
    slug: `${skill.toLowerCase().replace(/ /g, '-')}-calculator`,
    title: `${skill} calculator`,
    type: 'Calculator',
    verification: 'engine',
    href: `/calculators?skill=${encodeURIComponent(skill)}`,
  });

  if (targetLevel !== null) {
    const currentXp = xpForLevel(currentLevel);
    const targetXp = xpForLevel(targetLevel);
    const xpNeeded = Math.max(0, targetXp - currentXp);
    lines.push(`Target level: ${targetLevel}`);
    lines.push(`XP at starting level: ${number.format(currentXp)}`);
    lines.push(`XP at target level: ${number.format(targetXp)}`);
    lines.push(`XP still needed: ${number.format(xpNeeded)}`);

    if (skill === 'Potion Making') {
      const estimate = potionTrainingEstimate(currentLevel, targetLevel, currentXp);
      lines.push('Potion time estimate assumptions: use the large cauldron in Valen City, use the best listed Potion Making brew-and-bottle method by active XP per second as each level unlocks it, and start with ingredients and empty vials ready.');
      lines.push(`Estimated active time: ${formatDuration(estimate.totalSeconds)} across ${number.format(estimate.totalBatches)} full batches.`);
      lines.push('The estimate includes brewing and bottling only. It excludes gathering ingredients, preparing ingredients at other stations, travel, menus, failures, and speed bonuses.');
      lines.push(...estimate.segments);
    }
  }

  lines.push('Training actions available in the calculator:');
  for (const action of skillTrainingData[skill]) {
    const actionCount = targetLevel === null
      ? 'not calculated'
      : number.format(actionsRequired(Math.max(0, xpForLevel(targetLevel) - xpForLevel(currentLevel)), action.xp));
    const availability = currentLevel >= action.level ? 'available at the starting level' : `unlocks at level ${action.level}`;
    lines.push(`- ${action.name}: ${availability}; ${number.format(action.xp)} XP per action; ${actionCount} actions from the stated starting XP; ${action.note ?? ''}`);
  }
  return lines.join('\n');
}

export function buildQaContext(question: string): QaContext {
  const ranked = rankEntries(question);
  const selected = ranked.slice(0, 6).map(({ entry }) => entry);
  const selectedGameData = rankGameData(question).slice(0, 6).map(({ record }) => record);
  const sources = selected.map(sourceFor);
  if (selectedGameData.length) {
    addSource(sources, {
      slug: 'game-data',
      title: `Game-file data (${gameDataBuild})`,
      type: 'Game data',
      verification: selectedGameData.some((record) => record.source.confidence === 'inferred')
        ? 'inferred'
        : selectedGameData.some((record) => record.source.confidence === 'observed') ? 'observed' : 'engine',
      href: '/about/data#game-file-data',
    });
  }
  const calculator = calculatorContext(question, sources);
  const gameDataSection = selectedGameData.length
    ? [`Game-file export build: ${gameDataBuild}${gameDataExportedAt ? `; exported ${gameDataExportedAt}` : ''}`, ...selectedGameData.map(formattedGameDataRecord)].join('\n\n')
    : gameDataRecords.length ? '' : '## Game-file data status\nNo authorized game-file export is loaded into this deployment yet. Do not claim raw game-file facts that are not present in the wiki context.';
  const sections = [calculator, gameDataSection, ...selected.map(formattedEntry)].filter(Boolean);
  const context = sections.join('\n\n').slice(0, maxContextCharacters);
  return { context, sources };
}
