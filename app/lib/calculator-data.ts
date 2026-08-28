import type { SearchEntry } from './wiki-data';
import { smithingRecipes } from './smithing-data';

export const xpTable = [
  0, 0, 74, 160, 258, 371, 500, 649, 820, 1016, 1241, 1500, 1797, 2139, 2531, 2982, 3500, 4095, 4778, 5563,
  6464, 7500, 8690, 10056, 11626, 13429, 15500, 17879, 20612, 23751, 27358, 31500, 36258, 41724, 48003, 55215,
  63500, 73017, 83949, 96506, 110930, 127500, 146533, 168397, 193512, 222361, 255500, 293567, 337294, 387523,
  445222, 511500, 587634, 675088, 775547, 890944, 1023500, 1175767, 1350676, 1551594, 1782388, 2047500, 2352034,
  2701852, 3103688, 3565275, 4095500, 4704568, 5404204, 6207875, 7131050, 8191500, 9409637, 10808909, 12416250,
  14262600, 16383500, 18819774, 21618318, 24833000, 28525701, 32767500, 37640048, 43237135, 49666500, 57051902,
  65535500, 75280595, 86474770, 99333501, 114104303, 131071500, 150561691, 172950041, 198667502, 228209107,
  262143500, 301123982, 345900582, 397335504,
];

export type SkillName = 'Mining' | 'Fishing' | 'Smithing' | 'Potion Making' | 'Custom skill';

export type TrainingAction = {
  name: string;
  level: number;
  xp: number;
  note?: string;
};

export const skillTrainingData: Record<SkillName, TrainingAction[]> = {
  Mining: [
    { name: 'Copper Rock', level: 1, xp: 15 },
    { name: 'Tin Rock', level: 1, xp: 15 },
    { name: 'Iron Rock', level: 10, xp: 30 },
    { name: 'Coal Rock', level: 20, xp: 80 },
    { name: 'Mithril Rock', level: 30, xp: 150 },
    { name: 'Silver Rock', level: 40, xp: 300 },
    { name: 'Gold Rock', level: 40, xp: 350, note: 'Ore or dust' },
    { name: 'Essence Rock', level: 50, xp: 550 },
    { name: 'Ebony Rock', level: 60, xp: 500, note: 'Ore or dust' },
  ],
  Fishing: [
    { name: 'Minnow', level: 1, xp: 8 },
    { name: 'Common Trout', level: 5, xp: 75 },
    { name: 'Perch', level: 10, xp: 225 },
    { name: 'Bass', level: 20, xp: 200 },
    { name: 'Blue Gill', level: 30, xp: 75 },
    { name: 'Elder Trout', level: 40, xp: 500 },
    { name: 'Carp', level: 50, xp: 1250 },
  ],
  Smithing: smithingRecipes.map((recipe) => ({
    name: recipe.output,
    level: recipe.level,
    xp: recipe.xp,
    note: `${recipe.station} · ${recipe.outputQuantity} per craft`,
  })),
  'Potion Making': [
    { name: 'Weak Health Potion', level: 1, xp: 500 },
    { name: 'Fishing Potion', level: 5, xp: 500 },
    { name: 'Shields Potion', level: 10, xp: 1500 },
    { name: 'Mining Potion', level: 15, xp: 1500 },
    { name: 'Health Potion', level: 20, xp: 1500 },
    { name: 'Attack Potion', level: 25, xp: 1500 },
    { name: 'Archery Potion', level: 30, xp: 1750 },
    { name: 'Magic Potion', level: 35, xp: 2000 },
    { name: 'Strong Health Potion', level: 40, xp: 3250 },
    { name: 'Strong Shields Potion', level: 50, xp: 6000 },
  ],
  'Custom skill': [
    { name: 'Your training action', level: 1, xp: 1, note: 'Enter the XP earned per action' },
  ],
};

export type Enemy = {
  name: string;
  aliases?: string[];
  level: number;
  health: number;
  location: string;
  totalXp?: number;
};

export const enemies: Enemy[] = [
  { name: 'Goblin', level: 1, health: 50, location: 'Broken Village' },
  { name: 'Skeleton', level: 6, health: 75, location: 'Graveyard' },
  { name: 'Goblin Berserker', level: 9, health: 250, location: 'Broken Village' },
  { name: 'Goblin Watcher', level: 9, health: 250, location: 'Goblin Cave', totalXp: 273 },
  { name: 'Bandit', level: 10, health: 120, location: 'Forest Alcove' },
  { name: 'Skeleton Miner', level: 13, health: 125, location: 'Town Mine' },
  { name: 'Goblin Villager', level: 15, health: 200, location: 'Goblin Village' },
  { name: 'Bandit Leader', level: 25, health: 500, location: 'Forest Alcove' },
  { name: 'Skeleton Knight', level: 26, health: 350, location: 'West Mine' },
  { name: 'Highwayman', level: 28, health: 300, location: 'West Mine path' },
  { name: 'Bandit Mercenary', level: 30, health: 300, location: 'Mercenary Camp' },
  { name: 'Elf', level: 37, health: 400, location: 'Elven Haven' },
  { name: 'Cavern Goblin', level: 37, health: 400, location: 'West Mine Deep Cavern', totalXp: 548 },
  { name: 'Goblin Chieftain', level: 40, health: 1000, location: 'Goblin Village', totalXp: 1400 },
  { name: 'Goblin General', level: 55, health: 1500, location: 'General Cave' },
  { name: 'Skeleton Knight (Darklands)', level: 67, health: 1000, location: 'The Darklands', totalXp: 1670 },
  { name: 'Bandit Mercenary Boss', level: 74, health: 2000, location: 'Mercenary Camp', totalXp: 3480 },
  { name: 'Skeleton Pioneer', level: 90, health: 2500, location: 'West Mine', totalXp: 4750 },
  { name: 'Ashen Mage', level: 95, health: 1500, location: 'Crystal Caverns' },
  { name: 'Ashen Archer', aliases: ['Ashen Ranger', 'Ashen Rangers'], level: 95, health: 1500, location: 'West Mine Ashen Cavern', totalXp: 2925 },
  { name: 'Ashen Warrior', level: 95, health: 1500, location: 'West Mine Ashen Cavern' },
  { name: 'Cavern Goblin Hunter', level: 107, health: 3000, location: 'West Mine Deep Cavern', totalXp: 6105 },
  { name: 'Elf Warden', level: 120, health: 3500, location: 'Elven Haven' },
  { name: 'The Burning King', level: 307, health: 10000, location: 'West Mine Ashen Cavern', totalXp: 30260 },
];

export const calculatorSearchEntries: SearchEntry[] = [
  { slug: 'mining-calculator', title: 'Mining calculator', type: 'Calculator', summary: 'Levels, experience, and rocks required for any Mining goal.', terms: 'mining calculator xp experience rocks levels actions', href: '/calculators?skill=Mining', source: 'archive' },
  { slug: 'fishing-calculator', title: 'Fishing calculator', type: 'Calculator', summary: 'Levels, experience, and catches required for any Fishing goal.', terms: 'fishing calculator xp experience fish catches levels actions', href: '/calculators?skill=Fishing', source: 'archive' },
  { slug: 'smithing-calculator', title: 'Smithing calculator', type: 'Calculator', summary: 'See XP per smithable item and plan the crafts needed for any target level.', terms: 'smithing calculator xp experience bars armour weapons recipes crafts levels actions', href: '/calculators?skill=Smithing', source: 'archive' },
  { slug: 'potion-making-calculator', title: 'Potion Making calculator', type: 'Calculator', summary: 'Levels, experience, and brews required for any Potion Making goal.', terms: 'potion making calculator xp experience recipes brews levels actions', href: '/calculators?skill=Potion%20Making', source: 'archive' },
  { slug: 'combat-xp-calculator', title: 'Combat XP calculator', type: 'Calculator', summary: 'Estimate training experience, kills, Health XP, and time.', terms: 'combat xp calculator enemies kills health attack archery defence evasion warding', href: '/calculators?tab=combat', source: 'archive' },
  { slug: 'accuracy-calculator', title: 'Accuracy and defence calculator', type: 'Calculator', summary: 'Compare maximum accuracy and defence rolls.', terms: 'combat accuracy defence chance hit roll equipment calculator', href: '/calculators?tab=accuracy', source: 'archive' },
  { slug: 'custom-skill-calculator', title: 'Custom skill calculator', type: 'Calculator', summary: 'Use any XP-per-action value with the Winds of Valen level table.', terms: 'custom skill calculator xp experience level actions smithing', href: '/calculators?skill=Custom%20skill', source: 'archive' },
];

export function xpForLevel(level: number) {
  return xpTable[Math.max(1, Math.min(99, Math.floor(level)))] ?? 0;
}

export function levelForXp(xp: number) {
  let result = 1;
  for (let level = 2; level <= 99; level += 1) if (xp >= xpForLevel(level)) result = level;
  return result;
}

export function combatMultiplier(level: number) {
  if (level <= 100) return 1 + Math.max(0, level) * 0.01;
  return 2 + (Math.min(200, level) - 100) * 0.005;
}
