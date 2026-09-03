import type { SearchEntry } from './wiki-data';
import { combatXpForEnemy } from './calculator-engine';
import { fishProcessingRecipes, potionBrewRecipes, potionCrushRecipes, potionReductionRecipes, potionVials } from './potion-data';
import { smithingRecipes } from './smithing-data';

export {
  MAX_LEVEL,
  actionsRequired,
  calculateMaxHit,
  calculateOverallCombatLevel,
  combatLevelForXp,
  combatMultiplier,
  combatXpForEnemy,
  combatXpForLevel,
  combatXpTable,
  exactHitChance,
  levelForXp,
  maximumAccuracyRoll,
  maximumDefenceRoll,
  xpForLevel,
  xpTable,
} from './calculator-engine';

export type SkillName = 'Mining' | 'Fishing' | 'Smithing' | 'Potion Making' | 'Custom skill';

export type TrainingAction = {
  name: string;
  level: number;
  xp: number;
  note?: string;
  group?: string;
};

export const skillTrainingData: Record<SkillName, TrainingAction[]> = {
  Mining: [
    { name: 'Copper Rock', level: 1, xp: 15 },
    { name: 'Tin Rock', level: 1, xp: 15 },
    { name: 'Iron Rock', level: 10, xp: 30 },
    { name: 'Coal Rock', level: 20, xp: 80 },
    { name: 'Mithril Rock', level: 30, xp: 150 },
    { name: 'Silver Rock', level: 40, xp: 300 },
    { name: 'Gold Rock (Ore)', level: 40, xp: 350 },
    { name: 'Gold Rock (Dust)', level: 40, xp: 350 },
    { name: 'Essence Rock', level: 50, xp: 550 },
    { name: 'Ebony Rock (Ore)', level: 60, xp: 550 },
    { name: 'Ebony Rock (Dust)', level: 60, xp: 825 },
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
  Smithing: smithingRecipes.flatMap((recipe) => recipe.xp === null ? [] : [{
    name: recipe.output,
    level: recipe.level,
    xp: recipe.xp,
    note: `${recipe.station} · ${recipe.outputQuantity} per craft`,
  }]),
  'Potion Making': [
    ...potionBrewRecipes.map((recipe) => ({ name: recipe.output, level: recipe.level, xp: recipe.xp, note: 'Cauldron · brew XP per batch', group: 'Brewing' })),
    ...potionVials.map((vial) => ({ name: `Bottle with ${vial.name}`, level: vial.level, xp: vial.bottlingXp, note: 'Bottling XP per finished potion', group: 'Bottling' })),
    ...fishProcessingRecipes.map((recipe) => ({ name: `Cut ${recipe.input}`, level: recipe.level, xp: recipe.xp, note: 'Cutting Table', group: 'Cutting' })),
    ...potionCrushRecipes.map((recipe) => ({ name: `Crush ${recipe.input}`, level: recipe.level, xp: recipe.xp, note: 'Crush Station', group: 'Crushing' })),
    ...potionReductionRecipes.map((recipe) => ({ name: `Reduce ${recipe.input}`, level: recipe.level, xp: recipe.xp, note: 'Reduction Station', group: 'Reduction' })),
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
  defence: number;
  location: string;
  totalXp: number;
};

const enemyData: Omit<Enemy, 'totalXp'>[] = [
  { name: 'Goblin', level: 1, location: 'Broken Village', health: 50, defence: 1 },
  { name: 'Hen', level: 1, location: 'Farmlands', health: 40, defence: 1 },
  { name: 'Rooster', level: 1, location: 'Farmlands', health: 40, defence: 1 },
  { name: 'Cow', level: 5, location: 'Farmlands', health: 100, defence: 5 },
  { name: 'Skeleton', level: 6, location: 'Wheat Fields', health: 75, defence: 6 },
  { name: 'Goblin Berserker (Boss)', level: 9, location: 'Broken Village', health: 250, defence: 6 },
  { name: 'Goblin Watcher (Boss)', level: 9, location: 'Broken Village', health: 250, defence: 3 },
  { name: 'Bandit', level: 10, location: 'Forest', health: 120, defence: 10 },
  { name: 'Pirate Corsair', level: 10, location: 'Valen Port', health: 120, defence: 5 },
  { name: 'Pirate Rigger', level: 10, location: 'Valen Port', health: 120, defence: 5 },
  { name: 'Pirate Deckhand', level: 10, location: 'Valen Port', health: 120, defence: 5 },
  { name: 'Skeleton Miner', level: 13, location: 'Valen Gate / Grave Town', health: 125, defence: 13 },
  { name: 'Goblin Villager', level: 15, location: 'Goblin Village', health: 200, defence: 13 },
  { name: 'Pirate Captain (Boss)', level: 25, location: 'Valen Port', health: 500, defence: 10 },
  { name: 'Bandit Leader (Boss)', level: 25, location: 'Forest Alcove', health: 500, defence: 15 },
  { name: 'Skeleton Knight', level: 26, location: 'West Mine', health: 350, defence: 20 },
  { name: 'Highwayman', level: 28, location: 'West Mine', health: 300, defence: 23 },
  { name: 'Bandit Mercenary', level: 30, location: 'Mercenary Camp', health: 300, defence: 25 },
  { name: 'Slum Bandit', level: 30, location: 'Valen City', health: 300, defence: 20 },
  { name: 'Elf', level: 37, location: 'Elven Haven', health: 400, defence: 30 },
  { name: 'Elf Scholar', level: 37, location: 'Elven Haven', health: 400, defence: 20 },
  { name: 'Noble Skeleton', level: 37, location: 'Valen City', health: 400, defence: 20 },
  { name: 'Cavern Goblin', level: 37, location: 'West Mine Deep Cavern', health: 400, defence: 20 },
  { name: 'Goblin Chieftain (Boss)', level: 40, location: 'Goblin Village', health: 1000, defence: 18 },
  { name: 'Goblin General (Boss)', level: 55, location: 'General Cave', health: 1500, defence: 20 },
  { name: 'Skeleton Knight (Darklands)', level: 67, location: 'Darklands', health: 1000, defence: 40 },
  { name: 'Bandit Mercenary Boss', level: 74, location: 'Mercenary Camp', health: 2000, defence: 27 },
  { name: 'Skeleton Pioneer (Boss)', level: 90, location: 'West Mine', health: 2500, defence: 30 },
  { name: 'Ashen Warrior', level: 95, location: 'West Mine Ashen Cavern', health: 1500, defence: 60 },
  { name: 'Ashen Archer', aliases: ['Ashen Ranger', 'Ashen Rangers'], level: 95, location: 'West Mine Ashen Cavern', health: 1500, defence: 50 },
  { name: 'Ashen Mage', level: 95, location: 'West Mine Ashen Cavern', health: 1500, defence: 50 },
  { name: 'Cavern Goblin Hunter (Boss)', level: 107, location: 'West Mine Deep Cavern', health: 3000, defence: 35 },
  { name: 'Fire Lich (Boss)', level: 120, location: 'Grave Town', health: 3500, defence: 35 },
  { name: 'Elf Warden (Boss)', level: 120, location: 'Elven Haven', health: 3500, defence: 35 },
  { name: 'The Burning King (Boss)', level: 307, location: 'West Mine Ashen Cavern', health: 10000, defence: 60 },
];

export const enemies: Enemy[] = enemyData.map((enemy) => ({
  ...enemy,
  totalXp: combatXpForEnemy(enemy.health, enemy.level),
}));

export const calculatorSearchEntries: SearchEntry[] = [
  { slug: 'mining-calculator', title: 'Mining calculator', type: 'Calculator', summary: 'Levels, experience, and rocks required for any Mining goal.', terms: 'mining calculator xp experience rocks levels actions', href: '/calculators?skill=Mining', source: 'archive' },
  { slug: 'fishing-calculator', title: 'Fishing calculator', type: 'Calculator', summary: 'Levels, experience, and catches required for any Fishing goal.', terms: 'fishing calculator xp experience fish catches levels actions', href: '/calculators?skill=Fishing', source: 'archive' },
  { slug: 'smithing-calculator', title: 'Smithing calculator', type: 'Calculator', summary: 'Plan XP, materials, quantities, and crafting time from ready components, bars, or raw ore.', terms: 'smithing calculator xp experience time bars armour weapons recipes crafts levels actions dusk knight', href: '/calculators?skill=Smithing', source: 'archive' },
  { slug: 'potion-making-calculator', title: 'Potion Making calculator', type: 'Calculator', summary: 'Plan Small, Large, or Gilded potion batches, ingredients, XP, quantities, and brewing time.', terms: 'potion making calculator xp experience time gilded recipes brews batches cauldron vial levels actions', href: '/calculators?skill=Potion%20Making', source: 'archive' },
  { slug: 'combat-xp-calculator', title: 'Combat XP calculator', type: 'Calculator', summary: 'Estimate training experience, kills, Health XP, and time.', terms: 'combat xp calculator enemies kills health attack archery defence evasion warding', href: '/calculators?tab=combat', source: 'archive' },
  { slug: 'max-hit-calculator', title: 'Max hit calculator', type: 'Calculator', summary: 'Calculate a maximum melee, archery, or magic hit from in-game equipment values.', terms: 'max hit calculator melee archery magic power weapon damage attack speed', href: '/calculators?tab=max-hit', source: 'archive' },
  { slug: 'combat-level-calculator', title: 'Combat Level Calculator', type: 'Calculator', summary: 'Calculate your overall combat level from offensive, defensive, and Health levels.', terms: 'combat level calculator attack archery range magic defence defense evasion warding health', href: '/calculators/combat-level', source: 'archive' },
  { slug: 'accuracy-calculator', title: 'Accuracy and defence calculator', type: 'Calculator', summary: 'Compare maximum accuracy and defence rolls.', terms: 'combat accuracy defence chance hit roll equipment calculator', href: '/calculators?tab=accuracy', source: 'archive' },
  { slug: 'custom-skill-calculator', title: 'Custom skill calculator', type: 'Calculator', summary: 'Use any XP-per-action value with the Winds of Valen level table.', terms: 'custom skill calculator xp experience level actions smithing', href: '/calculators?skill=Custom%20skill', source: 'archive' },
];
