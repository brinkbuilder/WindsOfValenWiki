export const MAX_LEVEL = 100;

export const xpTable = [
  0, 0, 74, 160, 258, 371, 500, 649, 820, 1016, 1241, 1500, 1797, 2139, 2531, 2982, 3500, 4095, 4778, 5563,
  6464, 7500, 8690, 10056, 11626, 13429, 15500, 17879, 20612, 23751, 27358, 31500, 36258, 41724, 48003, 55215,
  63500, 73017, 83949, 96506, 110930, 127500, 146533, 168397, 193512, 222361, 255500, 293567, 337294, 387523,
  445222, 511500, 587634, 675088, 775547, 890944, 1023500, 1175767, 1350676, 1551594, 1782388, 2047500, 2352034,
  2701852, 3103688, 3565275, 4095500, 4704568, 5404204, 6207875, 7131050, 8191500, 9409637, 10808909, 12416250,
  14262600, 16383500, 18819774, 21618318, 24833000, 28525701, 32767500, 37640048, 43237135, 49666500, 57051902,
  65535500, 75280595, 86474770, 99333501, 114104303, 131071500, 150561691, 172950041, 198667502, 228209107,
  262143500, 301123882, 345900582, 397335504, 456418714,
];

export const combatXpTable = [
  0, 0, 74, 160, 258, 371, 500, 649, 820, 1016, 1241, 1500, 1797, 2139, 2531, 2982, 3500, 4095, 4778, 5563,
  6464, 7500, 8690, 10056, 11626, 13429, 15500, 17879, 20612, 23751, 27363, 31500, 36259, 41720, 47981, 55151,
  63354, 72736, 83461, 95721, 109735, 125750, 144039, 164906, 188691, 215772, 246571, 281556, 321250, 366236,
  417159, 474747, 539822, 613313, 696249, 789780, 895184, 1013881, 1147444, 1297613, 1466305, 1655628, 1867892,
  2105628, 2371611, 2668884, 4095500, 4704568, 5404204, 6207875, 7131050, 8191500, 9409637, 10808909, 12416250,
  14262600, 16383500, 18819774, 21618318, 24833000, 28525701, 32767500, 37640048, 43237135, 49666500, 57051902,
  65535500, 75280595, 86474770, 99333501, 114104303, 131071500, 150561691, 172950041, 198667502, 228209107,
  262143500, 301123982, 345900582, 397335504, 456418846,
];

function tableXpForLevel(table: number[], level: number) {
  return table[Math.max(1, Math.min(MAX_LEVEL, Math.floor(level)))] ?? 0;
}

function tableLevelForXp(table: number[], xp: number) {
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
  if (level <= 100) return 1 + Math.max(0, level) * 0.01;
  return 2 + (Math.min(200, level) - 100) * 0.005;
}

export function maximumCombatRoll(level: number, equipmentBonus: number) {
  return Math.max(0, level + 8) * Math.max(0, equipmentBonus + 32);
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
  const flatDamageBonus = Math.max(0, power) * 0.333333 * Math.max(0, attackSpeed);
  const maxHit = 5 + (effectiveLevel * 1.1 * (weaponDamageBonus + flatDamageBonus)) / 50;
  return { maxHit, effectiveLevel, weaponDamageBonus, flatDamageBonus };
}
