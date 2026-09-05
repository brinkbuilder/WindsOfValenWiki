import {
  actionsRequired,
  combatLevelForXp,
  combatXpForLevel,
  enemies,
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
import {
  defaultSmithingMaterialOptions,
  smithingMaterialTotals,
  smithingRecipes,
  type SmithingRecipe,
} from './smithing-data';
import { gameDataBuild, gameDataExportedAt, gameDataRecords, type GameDataRecord } from './game-data';
import { SHOP_BUY_BACK_RATE, itemCommerceInfoFor, potionVariantCommerceFor, type ItemCommerceInfo } from './item-commerce';
import { wikiEntries, type WikiEntry } from './wiki-data';

const number = new Intl.NumberFormat('en-US');
const decimal = new Intl.NumberFormat('en-US', { maximumFractionDigits: 3 });
const maxContextCharacters = 6500;

const stopWords = new Set([
  'a', 'an', 'and', 'are', 'be', 'can', 'do', 'does', 'for', 'from', 'get', 'how', 'i', 'if',
  'in', 'is', 'it', 'long', 'me', 'my', 'of', 'on', 'or', 'the', 'take', 'that', 'to', 'what', 'where',
  'which', 'who', 'would', 'you', 'your', 'tell', 'about', 'please', 'just', 'any', 'all',
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
  directAnswer?: string;
};

function normalize(value: string) {
  return value.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function singularToken(token: string) {
  const irregular: Record<string, string> = {
    axes: 'axe',
    bosses: 'boss',
    enemies: 'enemy',
    knives: 'knife',
  };
  if (irregular[token]) return irregular[token];
  if (token.endsWith('ies') && token.length > 4) return `${token.slice(0, -3)}y`;
  if (token.endsWith('s') && token.length > 3 && !token.endsWith('ss')) return token.slice(0, -1);
  return token;
}

function canonicalPhrase(value: string) {
  return normalize(value).split(/\s+/).map(singularToken).join(' ');
}

function tokens(value: string) {
  return normalize(value)
    .split(/\s+/)
    .filter((token) => token.length > 1 && !stopWords.has(token))
    .map(singularToken);
}

function editDistance(left: string, right: string) {
  if (left === right) return 0;
  if (Math.abs(left.length - right.length) > 1 || left.length < 4 || right.length < 4) return 2;
  const previous = Array.from({ length: right.length + 1 }, (_, index) => index);
  for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
    const current = [leftIndex];
    let rowMinimum = current[0];
    for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
      const substitution = previous[rightIndex - 1] + (left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1);
      current[rightIndex] = Math.min(previous[rightIndex] + 1, current[rightIndex - 1] + 1, substitution);
      rowMinimum = Math.min(rowMinimum, current[rightIndex]);
    }
    if (rowMinimum > 1) return 2;
    previous.splice(0, previous.length, ...current);
  }
  return previous[right.length];
}

function fuzzyHas(terms: Set<string>, token: string) {
  if (token.length < 4) return false;
  return [...terms].some((term) => editDistance(term, token) <= 1);
}

function expandedQueryTokens(value: string) {
  const synonyms: Record<string, string[]> = {
    blacksmith: ['smithing'],
    smithing: ['blacksmith'],
    shop: ['stall', 'store', 'vendor'],
    stall: ['shop', 'store', 'vendor'],
    store: ['shop', 'stall', 'vendor'],
    buy: ['shop', 'stall', 'store', 'vendor'],
    sell: ['shop', 'stall', 'store', 'vendor'],
  };
  const base = tokens(value);
  return [...new Set(base.flatMap((token) => [token, ...(synonyms[token] ?? [])]))];
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
  const queryTokens = expandedQueryTokens(question);
  return gameDataSearchRecords
    .map(({ record, normalizedName, nameTerms, searchableTerms }) => {
      let score = query && query.length > 4 && normalizedName.includes(query) ? 100 : 0;
      if ((query.includes('two handed') && normalizedName.includes('one handed'))
        || (query.includes('one handed') && normalizedName.includes('two handed'))) return { record, score: 0 };
      for (let index = 0; index < queryTokens.length - 1; index += 1) {
        const phrase = queryTokens.slice(index, index + 2).join(' ');
        if (normalizedName === phrase) score += 55;
        else if (normalizedName.includes(phrase)) score += 12;
      }
      for (const token of queryTokens) {
        if (nameTerms.has(token)) score += 30;
        else if (fuzzyHas(nameTerms, token)) score += 18;
        else if (searchableTerms.has(token)) score += 4;
      }
      return { record, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.record.name.localeCompare(b.record.name));
}

function rankEntries(question: string) {
  const query = normalize(question);
  const queryTokens = expandedQueryTokens(question);
  return wikiSearchRecords
    .map(({ entry, normalizedTitle, titleTerms, searchableTerms }) => {
      let score = query && query.length > 4 && normalizedTitle.includes(query) ? 100 : 0;
      if ((query.includes('two handed') && normalizedTitle.includes('one handed'))
        || (query.includes('one handed') && normalizedTitle.includes('two handed'))) return { entry, score: 0 };
      for (let index = 0; index < queryTokens.length - 1; index += 1) {
        const phrase = queryTokens.slice(index, index + 2).join(' ');
        if (normalizedTitle === phrase) score += 55;
        else if (normalizedTitle.includes(phrase)) score += 12;
      }
      for (const token of queryTokens) {
        if (titleTerms.has(token)) score += 30;
        else if (fuzzyHas(titleTerms, token)) score += 18;
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

function coinAmount(value: number) {
  return `${number.format(value)} ${value === 1 ? 'Coin' : 'Coins'}`;
}

function mentionedItemEntry(value: string) {
  const haystack = ` ${canonicalPhrase(value)} `;
  return wikiEntries
    .filter((entry) => entry.type === 'Item')
    .flatMap((entry) => [entry.title, ...(entry.aliases ?? [])].map((name) => ({
      entry,
      phrase: canonicalPhrase(name),
    })))
    .filter(({ phrase }) => phrase.length > 2 && haystack.includes(` ${phrase} `))
    .sort((left, right) => right.phrase.length - left.phrase.length)[0]?.entry;
}

function purchaseDescription(commerce: ItemCommerceInfo) {
  return commerce.listings.map((listing) => {
    const quantity = listing.quantity === 1 ? '' : `${listing.quantity} for `;
    const price = listing.purchasePrice === undefined ? 'price not set in the current game data' : coinAmount(listing.purchasePrice);
    const additionalCosts = listing.additionalCosts?.length
      ? ` + ${listing.additionalCosts.map((cost) => `${number.format(cost.count)} ${cost.name}`).join(' + ')}`
      : '';
    return `${listing.shop} (${quantity}${price}${additionalCosts})`;
  }).join(' or ');
}

function commerceDirectAnswer(question: string, priorQuestions: string[], sources: QaSource[]) {
  if (!/\b(?:shop|store|stall|vendor|merchant|buy|sell|sold|price|cost|value|worth|purchasable|stocked)\b/i.test(question)) return undefined;

  const entry = mentionedItemEntry(question)
    ?? [...priorQuestions].reverse().map(mentionedItemEntry).find(Boolean);
  if (!entry) return undefined;
  addSource(sources, sourceFor(entry));

  const names = [entry.title, ...(entry.aliases ?? [])];
  const variants = potionVariantCommerceFor(names);
  if (variants.length) {
    const stocked = variants.filter((variant) => variant.listings.length);
    const availability = stocked.length
      ? `Only ${stocked.map((variant) => `${variant.name} at ${purchaseDescription(variant)}`).join('; ')} is currently sold to players.`
      : `No current merchant inventory sells any ${entry.title} size to players.`;
    const buyBacks = variants.map((variant) => (
      `${variant.name}: ${variant.shopBuyBack === undefined ? 'no standard value' : coinAmount(variant.shopBuyBack)}`
    )).join('; ');
    return `${availability}\n\nStandard shops buy bottled versions from players at the game's ${Math.round(SHOP_BUY_BACK_RATE * 100)}% buy-back rate: ${buyBacks}.`;
  }

  const commerce = itemCommerceInfoFor(names);
  if (!commerce) {
    return `No exact current item-value or merchant-inventory record matches ${entry.title}, so I cannot reliably claim that a shop buys or sells it under that name.`;
  }

  const availability = commerce.listings.length
    ? `Yes. ${commerce.name} is currently sold by ${purchaseDescription(commerce)}.`
    : `No current merchant inventory sells ${commerce.name} to players.`;
  const buyBack = commerce.shopBuyBack === undefined
    ? 'The current item data does not provide a standard shop buy-back value.'
    : `Standard shops buy one from players for ${coinAmount(commerce.shopBuyBack)}, which is ${Math.round(SHOP_BUY_BACK_RATE * 100)}% of its ${coinAmount(commerce.baseValue ?? 0)} base value.`;
  return `${availability}\n\n${buyBack}`;
}

function levelMention(question: string, pattern: RegExp) {
  const match = question.match(pattern);
  return match ? Math.max(1, Math.min(100, Math.floor(Number(match[1])))) : null;
}

type LevelGoal = {
  currentLevel: number;
  targetLevel: number | null;
  currentWasInferred: boolean;
};

function parsedLevelGoal(question: string) {
  const range = question.match(/\b(?:from\s+)?(?:level|lvl|lv)?\s*(\d{1,3})\s*(?:-|–|—|to)\s*(?:level|lvl|lv)?\s*(\d{1,3})\b/i);
  const rangeCurrent = range ? Math.max(1, Math.min(100, Math.floor(Number(range[1])))) : null;
  const rangeTarget = range ? Math.max(1, Math.min(100, Math.floor(Number(range[2])))) : null;
  const explicitCurrentLevel = rangeCurrent ?? levelMention(
    question,
    /\b(?:from|starting(?:\s+at)?|currently(?:\s+at)?|current(?:\s+level)?)\s*(?:level|lvl|lv)?\s*(\d{1,3})\b/i,
  ) ?? levelMention(question, /\b(?:i'm|im|i am)\s+(?:currently\s+)?(?:(?:level|lvl|lv)\s*)?(\d{1,3})\b/i);
  const explicitTargetLevel = rangeTarget ?? levelMention(
    question,
    /\b(?:get\s+to|reach(?:ing)?|up\s+to|to|target(?:\s+level)?|goal(?:\s+level)?)\s*(?:level|lvl|lv)?\s*(\d{1,3})\b/i,
  );
  const mentionedLevels = [...question.matchAll(/\b(?:level|lvl|lv)\s*(\d{1,3})\b/gi)]
    .map((match) => Math.max(1, Math.min(100, Math.floor(Number(match[1])))));
  return {
    explicitCurrentLevel: explicitCurrentLevel ?? (mentionedLevels.length > 1 ? mentionedLevels[0] : null),
    targetLevel: explicitTargetLevel ?? mentionedLevels.at(-1) ?? null,
  };
}

export function levelsForGoal(question: string, priorQuestions: string[] = []): LevelGoal {
  const currentGoal = parsedLevelGoal(question);
  const priorGoal = [...priorQuestions]
    .reverse()
    .map(parsedLevelGoal)
    .find((goal) => goal.explicitCurrentLevel !== null || goal.targetLevel !== null);
  const explicitCurrentLevel = currentGoal.explicitCurrentLevel ?? priorGoal?.explicitCurrentLevel ?? null;
  return {
    currentLevel: explicitCurrentLevel ?? 1,
    targetLevel: currentGoal.targetLevel ?? priorGoal?.targetLevel ?? null,
    currentWasInferred: explicitCurrentLevel === null,
  };
}

function detectedSkill(question: string, priorQuestions: string[] = []): SkillName | null {
  const normalizedQuestion = normalize([question, ...priorQuestions.slice(-3).reverse()].join(' '));
  if (/potion|brew|bottl|cauldron|essence gland/.test(normalizedQuestion)) return 'Potion Making';
  if (/smith|anvil|furnace|workbench/.test(normalizedQuestion)) return 'Smithing';
  if (/fish|fishing|catch/.test(normalizedQuestion)) return 'Fishing';
  if (/mine|mining|ore|rock/.test(normalizedQuestion)) return 'Mining';
  return null;
}

type CombatSkill = 'Attack' | 'Archery' | 'Magic' | 'Defence' | 'Evasion' | 'Warding';

function detectedCombatSkill(question: string, priorQuestions: string[] = []): CombatSkill | null {
  const normalizedQuestion = normalize([question, ...priorQuestions.slice(-3).reverse()].join(' '));
  if (/\battack\b/.test(normalizedQuestion)) return 'Attack';
  if (/\b(?:archery|ranged?)\b/.test(normalizedQuestion)) return 'Archery';
  if (/\bmagic\b/.test(normalizedQuestion)) return 'Magic';
  if (/\bdefence\b/.test(normalizedQuestion)) return 'Defence';
  if (/\bevasion\b/.test(normalizedQuestion)) return 'Evasion';
  if (/\bwarding\b/.test(normalizedQuestion)) return 'Warding';
  return null;
}

function detectedEnemy(question: string, priorQuestions: string[] = []) {
  const combined = [question, ...priorQuestions.slice(-3).reverse()].join(' ');
  const query = ` ${normalize(combined)} `;
  const queryTerms = new Set(tokens(combined));
  return enemies
    .flatMap((enemy) => [enemy.name, ...(enemy.aliases ?? [])].map((name) => {
      const normalizedName = normalize(name);
      const nameTerms = tokens(name);
      const matchedTerms = nameTerms.filter((term) => (
        queryTerms.has(term) || [...queryTerms].some((queryTerm) => editDistance(term, queryTerm) <= 1)
      )).length;
      const exactPhrase = query.includes(` ${normalizedName} `);
      const score = exactPhrase ? 1000 + normalizedName.length : matchedTerms === nameTerms.length ? 100 + matchedTerms * 10 : 0;
      return { enemy, score, nameLength: normalizedName.length };
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.nameLength - a.nameLength)[0]?.enemy ?? null;
}

function isCombatTrainingQuestion(question: string) {
  return /\b(how\s+many|kill(?:s|ing)?|defeat|slay|train(?:ing)?|level|experience|xp|reach)\b/i.test(question);
}

function combatCalculatorContext(question: string, sources: QaSource[], priorQuestions: string[]) {
  const skill = detectedCombatSkill(question, priorQuestions);
  const enemy = detectedEnemy(question, priorQuestions);
  if (!skill && !enemy) return { text: '', directAnswer: undefined };

  addSource(sources, {
    slug: 'combat-xp-calculator',
    title: 'Combat XP calculator',
    type: 'Calculator',
    verification: 'engine',
    href: '/calculators?tab=combat',
  });
  const { currentLevel, targetLevel, currentWasInferred } = levelsForGoal(question, priorQuestions);
  const lines = [
    '## Deterministic combat calculator data',
    `Combat skill detected: ${skill ?? 'not specified'}`,
    `Starting level used: ${currentLevel}${currentWasInferred ? ' (assumed because the question did not include one)' : ''}`,
  ];
  if (targetLevel !== null) lines.push(`Target level: ${targetLevel}`);
  if (enemy) {
    lines.push(`Enemy: ${enemy.name}; aliases: ${(enemy.aliases ?? []).join(', ') || 'none'}; level ${enemy.level}; ${number.format(enemy.health)} health; ${enemy.defence} defence; location ${enemy.location}.`);
    lines.push(`Calculated full-credit kill XP (health × the game's level multiplier): ${number.format(enemy.totalXp)}. Active combat skill share: ${decimal.format(enemy.totalXp * 0.75)} XP (75%). Health share: ${decimal.format(enemy.totalXp * 0.25)} XP (25%).`);
  }

  if (!skill || !enemy || targetLevel === null || !isCombatTrainingQuestion(question)) {
    return { text: lines.join('\n'), directAnswer: undefined };
  }

  const currentXp = combatXpForLevel(currentLevel);
  const targetXp = combatXpForLevel(targetLevel);
  const xpNeeded = Math.max(0, targetXp - currentXp);
  const skillXpPerKill = enemy.totalXp * 0.75;
  const healthXpPerKill = enemy.totalXp * 0.25;
  const kills = actionsRequired(xpNeeded, skillXpPerKill);
  lines.push(`Combat XP at level ${currentLevel}: ${number.format(currentXp)}. Combat XP at level ${targetLevel}: ${number.format(targetXp)}. XP needed: ${number.format(xpNeeded)}.`);
  lines.push(`Required full-credit kills: ${number.format(kills)}. Resulting active-skill XP: ${decimal.format(kills * skillXpPerKill)}. Resulting Health XP: ${decimal.format(kills * healthXpPerKill)}.`);

  if (xpNeeded === 0) {
    return {
      text: lines.join('\n'),
      directAnswer: `You are already at or above level ${targetLevel} ${skill}, so you do not need any ${enemy.name} kills for that target.`,
    };
  }

  const displayEnemy = enemy.name === 'Ashen Archer' && /\bashen\s+rangers?\b/i.test(question)
    ? 'Ashen Archer (also called Ashen Ranger)'
    : enemy.name;
  const stance = skill === 'Defence' || skill === 'Evasion' || skill === 'Warding'
    ? `while training ${skill} in the matching defensive stance`
    : `while training ${skill} in the Offensive stance`;
  const directAnswer = [
    `You need ${number.format(kills)} full-credit ${displayEnemy} kills to go from exact level ${currentLevel} ${skill} XP to level ${targetLevel}.`,
    `The shared skill XP curve requires ${number.format(xpNeeded)} ${skill} XP (${number.format(currentXp)} → ${number.format(targetXp)}). Each kill awards ${decimal.format(skillXpPerKill)} ${skill} XP ${stance}: 75% of its calculated ${number.format(enemy.totalXp)} total XP. The other ${decimal.format(healthXpPerKill)} XP goes to Health.`,
    `This rounds up to a whole kill and assumes solo/full kill credit with no XP modifiers. It does not estimate time because no kill time or respawn/travel time was supplied.`,
  ].join('\n\n');
  return { text: lines.join('\n'), directAnswer };
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

type PotionTrainingSegment = {
  fromLevel: number;
  toLevel: number;
  batches: number;
  method: PotionMethod;
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
  const segments: PotionTrainingSegment[] = [];

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
    segments.push({ fromLevel: beforeLevel, toLevel: level, batches, method });
  }

  return {
    targetXp,
    totalBatches,
    totalSeconds,
    segments,
  };
}

function isTrainingQuestion(question: string) {
  return /\b(best|fast(?:est)?|efficient|train(?:ing)?|grind|xp|experience|how\s+long|time|take|level\s+up|get\s+to|reach|from)\b/i.test(question)
    || /\b\d{1,3}\s*(?:-|–|—|to)\s*(?:level|lvl|lv)?\s*\d{1,3}\b/i.test(question);
}

function isSupplyQuestion(question: string) {
  return /\b(ingredient|material|suppl(?:y|ies)|prepare|prep|gather|need)\b/i.test(question);
}

function bestTrainingAction(question: string, skill: SkillName) {
  const query = normalize(question);
  const queryTerms = new Set(tokens(question));
  return skillTrainingData[skill]
    .map((action) => {
      const actionName = normalize(action.name);
      const actionTerms = tokens(action.name);
      let score = query.includes(actionName) ? 1000 + actionName.length : 0;
      for (const term of actionTerms) {
        if (queryTerms.has(term)) score += 40;
        else if ([...queryTerms].some((queryTerm) => editDistance(term, queryTerm) <= 1)) score += 20;
      }
      return { action, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || b.action.name.length - a.action.name.length)[0]?.action ?? null;
}

function smithingRecipeChoice(question: string): { recipe?: SmithingRecipe; ambiguity?: string } {
  const query = ` ${canonicalPhrase(question)} `;
  const outputMatches = smithingRecipes
    .filter((recipe) => query.includes(` ${canonicalPhrase(recipe.output)} `))
    .sort((a, b) => b.output.length - a.output.length);
  if (outputMatches.length) {
    const longestOutput = outputMatches[0].output;
    const sameOutput = outputMatches.filter((recipe) => recipe.output === longestOutput);
    if (sameOutput.length === 1) return { recipe: sameOutput[0] };
    const sourceMatch = sameOutput.find((recipe) => recipe.ingredients.some(({ item }) => query.includes(` ${canonicalPhrase(item)} `)));
    if (!sourceMatch && /\b(using|with|ore|dust|raw|material|ingredient)\b/i.test(question)) {
      const sources = sameOutput.flatMap((recipe) => recipe.ingredients.map(({ item }) => item));
      return { ambiguity: `${longestOutput} has alternative material recipes: ${[...new Set(sources)].join(' or ')}. Tell me which source you want to use.` };
    }
    return { recipe: sourceMatch ?? sameOutput[0] };
  }

  const furnaceUses = smithingRecipes.filter((recipe) => (
    recipe.station === 'Furnace'
    && recipe.ingredients.some(({ item }) => query.includes(` ${canonicalPhrase(item)} `))
  ));
  if (furnaceUses.length === 1) return { recipe: furnaceUses[0] };
  if (furnaceUses.length > 1) {
    const outputs = [...new Set(furnaceUses.map((recipe) => recipe.output))].join(' or ');
    return { ambiguity: `That material can be smelted into more than one product: ${outputs}. Tell me which one you want to make so I can calculate it accurately.` };
  }
  return {};
}

function directSkillTrainingAnswer(skill: SkillName, question: string, currentLevel: number, targetLevel: number) {
  const currentXp = xpForLevel(currentLevel);
  const targetXp = xpForLevel(targetLevel);
  const xpNeeded = Math.max(0, targetXp - currentXp);
  if (xpNeeded === 0) return `You are already at or above level ${targetLevel} ${skill}, so no additional XP is needed.`;

  if (skill === 'Smithing') {
    const choice = smithingRecipeChoice(question);
    if (choice.ambiguity) return choice.ambiguity;
    const recipe = choice.recipe;
    const recipeXp = recipe?.xp;
    if (recipe && recipeXp !== null && recipeXp !== undefined) {
      if (recipe.level > currentLevel) {
        return `${recipe.output} unlocks at Smithing level ${recipe.level}, so it cannot be used for the entire level ${currentLevel}-${targetLevel} range. Train to level ${recipe.level} first, then ask me to calculate the remaining section with ${recipe.output}.`;
      }
      const crafts = actionsRequired(xpNeeded, recipeXp);
      const outputCount = crafts * recipe.outputQuantity;
      const lines = [
        `You need ${number.format(crafts)} ${recipe.output} crafts to go from exact level ${currentLevel} to level ${targetLevel} Smithing. Those crafts produce ${number.format(outputCount)} ${recipe.output}${outputCount === 1 ? '' : 's'}.`,
        `The level range requires ${number.format(xpNeeded)} XP, and each craft gives ${number.format(recipeXp)} XP. This rounds up to a whole craft.`,
      ];
      if (/\b(ore|dust|raw|material|ingredient|smelt|smith|craft|make|need)\b/i.test(question)) {
        const materials = smithingMaterialTotals(recipe, crafts, {
          ...defaultSmithingMaterialOptions,
          ironSource: /\biron\s+dust\b/i.test(question) ? 'dust' : defaultSmithingMaterialOptions.ironSource,
          coalSource: /\bcoal\s+dust\b/i.test(question) ? 'dust' : defaultSmithingMaterialOptions.coalSource,
          goldSource: /\bgold\s+dust\b/i.test(question) ? 'dust' : defaultSmithingMaterialOptions.goldSource,
          ebonySource: /\bebony\s+ore\b/i.test(question) ? 'ore' : defaultSmithingMaterialOptions.ebonySource,
        });
        if (materials.length) lines.push(`From raw materials, prepare ${materials.map(({ item, quantity }) => `${number.format(quantity)} ${item}`).join(', ')}.`);
      }
      if (/\b(time|long|take)\b/i.test(question)) {
        lines.push(`The direct ${recipe.station} crafting step takes about ${formatDuration(crafts * recipe.seconds)}, excluding prerequisite processing, travel, and menus.`);
      }
      return lines.join('\n\n');
    }
  }

  const action = bestTrainingAction(question, skill);
  if (!action) {
    if (/\b(xp|experience)\b/i.test(question)) {
      return `Going from exact level ${currentLevel} to level ${targetLevel} ${skill} requires ${number.format(xpNeeded)} XP (${number.format(currentXp)} → ${number.format(targetXp)}).`;
    }
    return undefined;
  }
  if (action.level > currentLevel) {
    return `${action.name} unlocks at ${skill} level ${action.level}, so it cannot be used for the entire level ${currentLevel}-${targetLevel} range. Train to level ${action.level} first, then I can calculate the remaining actions.`;
  }
  const actions = actionsRequired(xpNeeded, action.xp);
  return [
    `You need ${number.format(actions)} ${action.name} actions to go from exact level ${currentLevel} to level ${targetLevel} ${skill}.`,
    `That range requires ${number.format(xpNeeded)} XP (${number.format(currentXp)} → ${number.format(targetXp)}), and each action gives ${number.format(action.xp)} XP. This rounds up to a whole action and assumes no XP modifiers.`,
  ].join('\n\n');
}

function parsedXpAmount(question: string) {
  const shorthand = question.match(/\b(\d+(?:\.\d+)?)\s*([kmb])\b/i);
  const match = shorthand ?? question.match(/\b([\d,]+)\s+(?:[a-z]+\s+){0,3}(?:xp|experience)\b/i);
  if (!match) return null;
  const multiplier = match[2]?.toLowerCase() === 'k' ? 1_000
    : match[2]?.toLowerCase() === 'm' ? 1_000_000
      : match[2]?.toLowerCase() === 'b' ? 1_000_000_000 : 1;
  return Math.max(0, Math.floor(Number(match[1].replace(/,/g, '')) * multiplier));
}

function experienceLookupContext(question: string, sources: QaSource[], priorQuestions: string[]) {
  if (!/\b(what|which)\s+level|\blevel\s+(?:am\s+i|is|at|with)\b/i.test(question)) return { text: '', directAnswer: undefined };
  const xp = parsedXpAmount(question);
  if (xp === null) return { text: '', directAnswer: undefined };
  const combatSkill = detectedCombatSkill(question, priorQuestions);
  const skill = combatSkill ?? detectedSkill(question, priorQuestions);
  const isCombat = combatSkill !== null;
  const level = isCombat ? combatLevelForXp(xp) : levelForXp(xp);
  const nextLevel = Math.min(100, level + 1);
  const nextXp = isCombat ? combatXpForLevel(nextLevel) : xpForLevel(nextLevel);
  const label = skill ?? (isCombat ? 'combat skill' : 'skill');
  addSource(sources, {
    slug: isCombat ? 'combat-xp-calculator' : 'skill-xp-calculator',
    title: isCombat ? 'Combat XP calculator' : 'Skill XP calculator',
    type: 'Calculator',
    verification: 'engine',
    href: isCombat ? '/calculators?tab=combat' : '/calculators',
  });
  const nextText = level >= 100 ? 'The current calculator is capped at level 100.' : `You need ${number.format(Math.max(0, nextXp - xp))} more XP for level ${nextLevel}.`;
  const directAnswer = `${number.format(xp)} XP is level ${level} ${label}. ${nextText}`;
  return {
    text: `## Deterministic XP lookup\nXP supplied: ${xp}. Curve: ${isCombat ? 'combat' : 'standard skill'}. Resulting level: ${level}. Next-level XP threshold: ${nextXp}.`,
    directAnswer,
  };
}

function conversationalAnswer(question: string) {
  const clean = normalize(question);
  if (/^(?:hi|hello|hey|heya|hiya)(?:\s+valen\s+buddy)?$/.test(clean)) {
    return 'Hello! I’m Ask Alice. What would you like to know about Winds of Valen?';
  }
  if (/^(?:who|what)\s+(?:are|r)\s+you$|^what(?:s|\s+is)\s+your\s+name$/.test(clean)) {
    return 'I’m Ask Alice, the community assistant for the Winds of Valen wiki. I can help with game information, training plans, XP calculations, recipes, materials, creatures, and locations.';
  }
  if (/^(?:thanks|thank\s+you|cheers)(?:\s+valen\s+buddy)?$/.test(clean)) {
    return 'You’re welcome! Ask me anything else about Winds of Valen.';
  }
  return undefined;
}

function directPotionAnswer(currentLevel: number, targetLevel: number, currentXp: number) {
  const xpNeeded = Math.max(0, xpForLevel(targetLevel) - currentXp);
  if (xpNeeded === 0) {
    return `You are already at or above level ${targetLevel} Potion Making, so no additional XP or batches are needed for that goal.`;
  }

  const estimate = potionTrainingEstimate(currentLevel, targetLevel, currentXp);
  if (!estimate.segments.length) return undefined;
  const first = estimate.segments[0];
  const methodName = potionOutputName(first.method.recipe, first.method.vial);
  const lines = estimate.segments.length === 1
    ? [`Best documented route: brew ${first.method.recipe.output} in the Large Cauldron and bottle it with ${first.method.vial.name}s to make ${methodName}.`]
    : ['Best documented route: use the highest active-XP-per-second brew-and-bottle method available at each level:'];

  if (estimate.segments.length > 1) {
    lines.push(...estimate.segments.map(({ fromLevel, toLevel, batches, method }) => (
      `- Levels ${fromLevel}-${toLevel}: ${number.format(batches)} batches of ${potionOutputName(method.recipe, method.vial)}.`
    )));
  }

  lines.push(
    `From exact level ${currentLevel} XP to exact level ${targetLevel} XP, you need ${number.format(xpNeeded)} XP. That is ${number.format(estimate.totalBatches)} full batches and about ${formatDuration(estimate.totalSeconds)} of active brewing and bottling.`,
  );

  if (estimate.segments.length === 1) {
    const { method, batches } = first;
    lines.push(`Each batch gives ${number.format(method.xp)} XP, yields ${number.format(method.batchYield)} potions, and takes ${formatDuration(method.seconds)}.`);
    const ingredientTotals = method.recipe.ingredients
      .map(({ item, quantity }) => `${number.format(quantity * batches)} ${item}`)
      .join(' and ');
    lines.push(`For all ${number.format(batches)} batches, have ${ingredientTotals} and ${number.format(method.batchYield * batches)} empty ${method.vial.name}s ready.`);
  }

  lines.push('This is active crafting time only. It assumes the ingredients and vials are ready and excludes gathering, ingredient processing, travel, menus, failures, and speed bonuses.');
  return lines.join('\n\n');
}

function directPotionSupplyAnswer(currentLevel: number, targetLevel: number, currentXp: number) {
  const estimate = potionTrainingEstimate(currentLevel, targetLevel, currentXp);
  if (estimate.segments.length !== 1) return undefined;
  const { method, batches } = estimate.segments[0];
  if (method.recipe.slug !== 'recipe-cauldron-strong-shields') return undefined;

  const scales = 10 * batches;
  const essence = 500 * batches;
  const vialCount = method.batchYield * batches;
  const essenceFromGlands = scales * 20;
  const remainingEssence = Math.max(0, essence - essenceFromGlands);
  const essenceGeodes = Math.ceil(remainingEssence / 50);
  return [
    `For the level ${currentLevel}-${targetLevel} plan, prepare ${number.format(scales)} Fine Fish Scales, ${number.format(essence)} Essence, and ${number.format(vialCount)} empty ${method.vial.name}s for ${number.format(batches)} batches.`,
    `Start with ${number.format(scales)} Carp: process them at the Knife/Cutting Station into Hardened Fish Scales and Large Essence Glands, reduce the Hardened Scales into Polished Fish Scales, then crush those into Fine Fish Scales.`,
    `Reduce the ${number.format(scales)} Large Essence Glands at the Reduction Station for ${number.format(essenceFromGlands)} Essence. You will still need ${number.format(remainingEssence)} Essence; one documented option is ${number.format(essenceGeodes)} Essence Geodes at 50 Essence each. Essence Geodes require Mining level 50 and Potion Making level 45.`,
    'The Carp workflow is available by Potion Making level 60. Finish the ingredient stages first, then brew with the Large Cauldron and bottle with Gilded Vials.',
  ].join('\n\n');
}

function calculatorContext(question: string, sources: QaSource[], priorQuestions: string[]) {
  const skill = detectedSkill(question, priorQuestions);
  if (!skill) return { text: '', directAnswer: undefined };

  const { currentLevel, targetLevel, currentWasInferred } = levelsForGoal(question, priorQuestions);
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
      lines.push(...estimate.segments.map(({ fromLevel, toLevel, batches, method }) => (
        `- Levels ${fromLevel}-${toLevel}: ${batches} batches of ${potionOutputName(method.recipe, method.vial)} (${number.format(method.xp)} XP and ${formatDuration(method.seconds)} active time per batch)`
      )));
      if (estimate.segments.some(({ method }) => method.recipe.slug === 'recipe-cauldron-strong-shields')) {
        lines.push('Strong Shields preparation workflow: process Carp at the Knife/Cutting Station into Hardened Fish Scales plus Large Essence Glands; reduce Hardened Fish Scales into Polished Fish Scales at the Reduction Station; crush Polished Fish Scales into Fine Fish Scales at the Crush Station. Each Carp yields one scale through this workflow and one Large Essence Gland. At Potion Making level 60, reduce each Large Essence Gland at the Reduction Station for 20 Essence. An Essence Geode gives 50 Essence at the Reduction Station and requires Potion Making level 45 plus Mining level 50.');
      }
    }
  }

  lines.push('Relevant training actions in the calculator:');
  const actions = [...skillTrainingData[skill]]
    .sort((a, b) => {
      const aAvailable = a.level <= currentLevel ? 1 : 0;
      const bAvailable = b.level <= currentLevel ? 1 : 0;
      return bAvailable - aAvailable || b.xp - a.xp;
    })
    .slice(0, 10);
  for (const action of actions) {
    const actionCount = targetLevel === null
      ? 'not calculated'
      : number.format(actionsRequired(Math.max(0, xpForLevel(targetLevel) - xpForLevel(currentLevel)), action.xp));
    const availability = currentLevel >= action.level ? 'available at the starting level' : `unlocks at level ${action.level}`;
    lines.push(`- ${action.name}: ${availability}; ${number.format(action.xp)} XP per action; ${actionCount} actions from the stated starting XP; ${action.note ?? ''}`);
  }
  const directAnswer = skill === 'Potion Making' && targetLevel !== null
    ? isTrainingQuestion(question)
      ? directPotionAnswer(currentLevel, targetLevel, xpForLevel(currentLevel))
      : priorQuestions.length > 0 && isSupplyQuestion(question)
        ? directPotionSupplyAnswer(currentLevel, targetLevel, xpForLevel(currentLevel))
        : undefined
    : targetLevel !== null && isTrainingQuestion(question)
      ? directSkillTrainingAnswer(skill, question, currentLevel, targetLevel)
      : undefined;
  return {
    text: lines.join('\n'),
    directAnswer,
  };
}

export function buildQaContext(question: string, priorQuestions: string[] = []): QaContext {
  const smallTalk = conversationalAnswer(question);
  const retrievalQuery = [...priorQuestions.slice(-3), question].join(' ');
  const ranked = rankEntries(retrievalQuery);
  const selected = ranked.slice(0, 4).map(({ entry }) => entry);
  const selectedGameData = rankGameData(retrievalQuery).slice(0, 3).map(({ record }) => record);
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
  const experienceLookup = experienceLookupContext(question, sources, priorQuestions);
  const calculator = calculatorContext(question, sources, priorQuestions);
  const combatCalculator = combatCalculatorContext(question, sources, priorQuestions);
  const commerceAnswer = commerceDirectAnswer(question, priorQuestions, sources);
  const gameDataSection = selectedGameData.length
    ? [`Game-file export build: ${gameDataBuild}${gameDataExportedAt ? `; exported ${gameDataExportedAt}` : ''}`, ...selectedGameData.map(formattedGameDataRecord)].join('\n\n')
    : gameDataRecords.length ? '' : '## Game-file data status\nNo authorized game-file export is loaded into this deployment yet. Do not claim raw game-file facts that are not present in the wiki context.';
  const sections = [experienceLookup.text, combatCalculator.text, calculator.text, gameDataSection, ...selected.map(formattedEntry)].filter(Boolean);
  const context = sections.join('\n\n').slice(0, maxContextCharacters);
  return {
    context,
    sources,
    directAnswer: smallTalk ?? experienceLookup.directAnswer ?? combatCalculator.directAnswer ?? calculator.directAnswer ?? commerceAnswer,
  };
}
