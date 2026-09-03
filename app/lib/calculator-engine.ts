export const MAX_LEVEL = 100;

// Live LevelCalculationSettings values. GetTotalXPForLevel uses this curve
// for every skill, including Attack, Archery, Magic, Health, and Defence.
const XP_AT_INTERVAL = 500;
const XP_GROWTH_RATE = 2;
const XP_GROWTH_INTERVAL = 5;

function exactXpForLevel(level: number) {
  return XP_AT_INTERVAL * (XP_GROWTH_RATE ** ((level - 1) / XP_GROWTH_INTERVAL) - 1);
}

// XP is displayed and entered as a whole number. Ceiling the game's floating
// threshold prevents a player from being awarded the next level one XP early.
export const xpTable = Array.from({ length: MAX_LEVEL + 1 }, (_, level) => (
  level <= 1 ? 0 : Math.ceil(exactXpForLevel(level))
));

// Retained as a public alias for callers that used the old name. The game has
// one shared level curve; there is no separate combat XP table.
export const combatXpTable = xpTable;

function tableXpForLevel(table: readonly number[], level: number) {
  return table[Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)))] ?? 0;
}

function tableLevelForXp(table: readonly number[], xp: number) {
  let result = 1;
  for (let level = 2; level <= MAX_LEVEL; level += 1) {
    if (xp >= tableXpForLevel(table, level)) result = level;
  }
  return result;
}

export function xpForLevel(level: number) {
  return tableXpForLevel(xpTable, level);
}

export function levelForXp(xp: number) {
  return tableLevelForXp(xpTable, Math.max(0, xp));
}

export function combatXpForLevel(level: number) {
  return tableXpForLevel(combatXpTable, level);
}

export function combatLevelForXp(xp: number) {
  return tableLevelForXp(combatXpTable, Math.max(0, xp));
}

export function actionsRequired(xpNeeded: number, xpPerAction: number) {
  if (xpNeeded <= 0 || xpPerAction <= 0) return 0;
  return Math.ceil(xpNeeded / xpPerAction);
}

export function combatMultiplier(level: number) {
  const enemyLevel = Math.max(0, Math.floor(Number.isFinite(level) ? level : 0));
  const completeBands = Math.floor(enemyLevel / 100);
  let multiplier = 1;

  // The per-level increase starts at 0.01 and halves after each 100 levels.
  for (let band = 0; band < completeBands; band += 1) {
    multiplier += 100 * (0.01 / (2 ** band));
  }
  multiplier += (enemyLevel % 100) * (0.01 / (2 ** completeBands));
  return multiplier;
}

export function combatXpForEnemy(health: number, level: number) {
  const xp = Math.max(0, health) * combatMultiplier(level);
  return Math.round(xp * 1_000_000) / 1_000_000;
}

export function maximumAccuracyRoll(level: number, equipmentBonus: number) {
  return Math.max(0, level + 8) * Math.max(0, equipmentBonus + 32);
}

export function maximumDefenceRoll(level: number, equipmentBonus: number) {
  return Math.max(0, level + 8) * Math.max(0, equipmentBonus + 16);
}

export function exactHitChance(maxAccuracy: number, maxDefence: number) {
  const accuracy = Math.max(0, Math.floor(maxAccuracy));
  const defence = Math.max(0, Math.floor(maxDefence));
  if (accuracy > defence) return 1 - (defence + 2) / (2 * (accuracy + 1));
  return accuracy / (2 * (defence + 1));
}

export type MaxHitInput = {
  skillLevel: number;
  weaponDamage: number;
  attackSpeed: number;
  power: number;
};

export function calculateMaxHit({ skillLevel, weaponDamage, attackSpeed, power }: MaxHitInput) {
  const effectiveLevel = Math.max(0, skillLevel) + 8;
  const weaponDamageBonus = Math.max(0, weaponDamage) + 30;
  const flatDamageBonus = Math.max(0, power) * 0.33333298563957214 * Math.max(0, attackSpeed);
  const rawMaxHit = 5 + (effectiveLevel * 1.1 * (weaponDamageBonus + flatDamageBonus)) / 50;
  return { maxHit: Math.trunc(rawMaxHit), rawMaxHit, effectiveLevel, weaponDamageBonus, flatDamageBonus };
}

export type CombatLevelInput = {
  attack: number;
  archery: number;
  magic: number;
  defence: number;
  evasion: number;
  warding: number;
  health: number;
};

export function calculateOverallCombatLevel(stats: CombatLevelInput) {
  const highestOffence = Math.max(stats.attack, stats.archery, stats.magic);
  const highestDefence = Math.max(stats.defence, stats.evasion, stats.warding);
  const healthContribution = (stats.health - 1) * 0.25;
  const levelFull = (highestOffence * 0.5) + (highestDefence * 0.5) + healthContribution;
  return {
    level: Math.floor(levelFull),
    levelFull,
    highestOffence,
    highestDefence,
    healthContribution,
  };
}
