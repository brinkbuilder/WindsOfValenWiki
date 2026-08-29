export type PotionRecipeDetail = {
  slug: string;
  input: string;
  level: number;
  output: string;
  secondaryOutput?: string;
  duration?: number;
  notes: string;
};

export const potionReductionRecipes: PotionRecipeDetail[] = [
  { slug: 'recipe-reduce-small-essence-gland', input: 'Small Essence Gland', level: 1, output: '2 x Essence', notes: 'Basic essence breakdown' },
  { slug: 'recipe-reduce-essence-gland', input: 'Essence Gland', level: 30, output: '10 x Essence', notes: 'Mid-tier essence breakdown' },
  { slug: 'recipe-reduce-large-essence-gland', input: 'Large Essence Gland', level: 60, output: '20 x Essence', notes: 'Endgame essence breakdown' },
  { slug: 'recipe-reduce-rare-minnow', input: 'Rare Minnow', level: 1, output: '5 x Fish Oil', notes: 'Used for Fishing Potions' },
  { slug: 'recipe-reduce-rare-blue-gill', input: 'Rare Blue Gill', level: 25, output: '15 x Fish Oil', notes: 'High-efficiency fish oil' },
  { slug: 'recipe-reduce-spider-eye', input: 'Spider Eye', level: 25, output: '2 x Distilled Spider Eye', notes: 'Used for Archery Potions' },
  { slug: 'recipe-reduce-minced-hearty-fish-flesh', input: 'Hearty Fish Mash', level: 35, output: 'Hearty Extract', notes: 'Used for Strong Health Potions' },
  { slug: 'recipe-reduce-hardened-scales', input: 'Hardened Fish Scales', level: 45, output: 'Polished Fish Scales', notes: 'Take to Mortar next for Fine Fish Scales' },
  { slug: 'recipe-reduce-essence-geode', input: 'Essence Geode', level: 45, output: '50 x Essence', notes: 'Massive mining payoff (requires level 50 Mining)' },
  { slug: 'recipe-infused-coal', input: 'Coal Ore + 2 Essence', level: 45, output: 'Essence Infused Coal', notes: 'Endgame crafting fuel' },
];

export const potionCrushRecipes: PotionRecipeDetail[] = [
  { slug: 'recipe-crush-scales', input: 'Fish Scales (Perch)', level: 5, output: 'Crushed Fish Scales', notes: 'Chop Perch at Cutting Table' },
  { slug: 'recipe-crush-mud-root', input: 'Mud Root', level: 10, output: 'Root Paste', notes: 'Buy at Potion Stall or dropped by Bandits / Bandit Leader' },
  { slug: 'recipe-crush-plain-fish-flesh', input: 'Plain Fish Flesh (Bass)', level: 15, output: 'Fish Mash', notes: 'Chop Bass at Cutting Table' },
  { slug: 'recipe-crush-small-fang', input: 'Small Fang', level: 20, output: '2 x Fang Dust', notes: 'Buy at Potion Stall or dropped by Goblins / Goblin Chieftain' },
  { slug: 'recipe-crush-glowing-mushroom', input: 'Glowing Mushroom', level: 30, output: '2 x Crushed Mushroom', notes: 'Buy at Potion Stall or dropped by Fire Lich / Noble Skeletons' },
  { slug: 'recipe-crush-hearty-fish-flesh', input: 'Hearty Fish Flesh (Elder Trout)', level: 35, output: 'Hearty Fish Mash', notes: 'Chop Elder Trout at Cutting Table' },
  { slug: 'recipe-crush-refined-hardened-scales', input: 'Polished Fish Scales', level: 45, output: 'Fine Fish Scales', notes: 'Obtained from reducing Hardened Fish Scales at the Reduction Station' },
];

export const fishProcessingRecipes: PotionRecipeDetail[] = [
  { slug: 'recipe-harvest-minnow', input: 'Minnow', level: 1, output: '(None)', secondaryOutput: '2 x Small Essence Gland', notes: 'Fish processing output' },
  { slug: 'recipe-harvest-small-trout', input: 'Common Trout', level: 1, output: 'Scrap Fish Flesh', secondaryOutput: '1 x Small Essence Gland', notes: 'Fish processing output' },
  { slug: 'recipe-harvest-perch', input: 'Perch', level: 10, output: 'Fish Scales', secondaryOutput: '1 x Small Essence Gland', notes: 'Fish processing output' },
  { slug: 'recipe-harvest-small-bass', input: 'Bass', level: 15, output: 'Plain Fish Flesh', secondaryOutput: '1 x Small Essence Gland', notes: 'Fish processing output' },
  { slug: 'recipe-harvest-blue-gill', input: 'Blue Gill', level: 30, output: '(None)', secondaryOutput: '2 x Essence Gland', notes: 'Fish processing output' },
  { slug: 'recipe-harvest-big-trout', input: 'Elder Trout', level: 40, output: 'Hearty Fish Flesh', secondaryOutput: '1 x Essence Gland', notes: 'Fish processing output' },
  { slug: 'recipe-harvest-carp', input: 'Carp', level: 50, output: 'Hardened Fish Scales', secondaryOutput: '1 x Large Essence Gland', notes: 'Fish processing output' },
];

export const potionBrewRecipes: PotionRecipeDetail[] = [
  { slug: 'recipe-cauldron-weak-health', input: '10 Scrap Fish Flesh + 25 Essence', level: 1, output: 'Weak Health Potion', duration: 20, notes: 'Primary ingredient source: chop Common Trout' },
  { slug: 'recipe-cauldron-fishing', input: '10 Fish Oil + 25 Essence', level: 5, output: 'Fishing Potion', duration: 20, notes: 'Primary ingredient source: reduce Rare Minnow / Rare Blue Gill' },
  { slug: 'recipe-cauldron-shields', input: '10 Crushed Fish Scales + 50 Essence', level: 10, output: 'Shields Potion', duration: 25, notes: 'Primary ingredient source: Mortar-grind Perch Scales' },
  { slug: 'recipe-cauldron-mining', input: '10 Root Paste + 50 Essence', level: 15, output: 'Mining Potion', duration: 30, notes: 'Primary ingredient source: Mortar-grind Mud Root (shop / Bandits)' },
  { slug: 'recipe-cauldron-normal-health', input: '10 Fish Mash + 50 Essence', level: 20, output: 'Health Potion', duration: 30, notes: 'Primary ingredient source: Mortar-grind Bass Flesh' },
  { slug: 'recipe-cauldron-attack', input: '10 Fang Dust + 200 Essence', level: 25, output: 'Attack Potion', duration: 30, notes: 'Primary ingredient source: Mortar-grind Small Fangs (shop / Goblins)' },
  { slug: 'recipe-cauldron-archery', input: '10 Distilled Spider Eye + 250 Essence', level: 30, output: 'Archery Potion', duration: 30, notes: 'Primary ingredient source: reduce Spider Eyes (Crimson Weavers)' },
  { slug: 'recipe-cauldron-magic', input: '10 Crushed Mushroom + 300 Essence', level: 35, output: 'Magic Potion', duration: 30, notes: 'Primary ingredient source: Mortar-grind Glowing Mushrooms (shop / Lich / Skeletons)' },
  { slug: 'recipe-cauldron-strong-health', input: '10 Hearty Extract + 200 Essence', level: 40, output: 'Strong Health Potion', duration: 40, notes: 'Primary ingredient source: reduce Hearty Fish Mash (Elder Trout)' },
  { slug: 'recipe-cauldron-strong-shields', input: '10 Fine Fish Scales + 500 Essence', level: 50, output: 'Strong Shields Potion', duration: 50, notes: 'Primary ingredient source: Mortar-grind Polished Fish Scales (Carp)' },
];

export const potionRecipeDetails: Record<string, PotionRecipeDetail> = Object.fromEntries([
  ...potionReductionRecipes,
  ...potionCrushRecipes,
  ...fishProcessingRecipes,
  ...potionBrewRecipes,
].map((recipe) => [recipe.slug, recipe]));
