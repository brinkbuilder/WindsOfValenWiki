export type PotionIngredient = {
  item: string;
  quantity: number;
};

export type PotionRecipeDetail = {
  slug: string;
  input: string;
  level: number;
  output: string;
  secondaryOutput?: string;
  duration?: number;
  xp: number;
  notes: string;
};

export type PotionBrewRecipe = PotionRecipeDetail & {
  duration: number;
  ingredients: PotionIngredient[];
};

export type CauldronOption = {
  id: 'small' | 'large';
  name: string;
  capacityMl: number;
  location: string;
};

export type VialOption = {
  id: 'small' | 'large' | 'gilded';
  name: string;
  volumeMl: number;
  level: number;
  bottlingXp: number;
};

export const potionCauldrons: CauldronOption[] = [
  { id: 'small', name: 'Small cauldron', capacityMl: 1000, location: 'Standard cauldrons' },
  { id: 'large', name: 'Large cauldron', capacityMl: 1500, location: 'Valen City' },
];

export const potionVials: VialOption[] = [
  { id: 'small', name: 'Small Vial', volumeMl: 50, level: 1, bottlingXp: 10 },
  { id: 'large', name: 'Large Vial', volumeMl: 100, level: 25, bottlingXp: 20 },
  { id: 'gilded', name: 'Gilded Vial', volumeMl: 150, level: 50, bottlingXp: 30 },
];

export function potionsPerBatch(cauldron: CauldronOption, vial: VialOption) {
  return Math.floor(cauldron.capacityMl / vial.volumeMl);
}

export const potionReductionRecipes: PotionRecipeDetail[] = [
  { slug: 'recipe-reduce-small-essence-gland', input: 'Small Essence Gland', level: 1, output: '2 x Essence', duration: 0.5, xp: 4, notes: 'Basic essence breakdown' },
  { slug: 'recipe-reduce-essence-gland', input: 'Essence Gland', level: 30, output: '10 x Essence', duration: 0.5, xp: 10, notes: 'Mid-tier essence breakdown' },
  { slug: 'recipe-reduce-large-essence-gland', input: 'Large Essence Gland', level: 60, output: '20 x Essence', duration: 0.5, xp: 16, notes: 'Endgame essence breakdown' },
  { slug: 'recipe-reduce-rare-minnow', input: 'Rare Minnow', level: 1, output: '5 x Fish Oil', duration: 5, xp: 50, notes: 'Used for Fishing Potions' },
  { slug: 'recipe-reduce-rare-blue-gill', input: 'Rare Blue Gill', level: 25, output: '15 x Fish Oil', duration: 5, xp: 300, notes: 'High-efficiency fish oil' },
  { slug: 'recipe-reduce-spider-eye', input: 'Spider Eye', level: 25, output: '2 x Distilled Spider Eye', xp: 50, notes: 'Used for Archery Potions' },
  { slug: 'recipe-reduce-minced-hearty-fish-flesh', input: 'Hearty Fish Mash', level: 35, output: 'Hearty Extract', duration: 3, xp: 90, notes: 'Used for Strong Health Potions' },
  { slug: 'recipe-reduce-hardened-scales', input: 'Hardened Fish Scales', level: 45, output: 'Polished Fish Scales', duration: 4, xp: 110, notes: 'Take to the Crush Station next for Fine Fish Scales' },
  { slug: 'recipe-reduce-essence-geode', input: 'Essence Geode', level: 45, output: '50 x Essence', duration: 1, xp: 30, notes: 'High-yield Essence source that also requires Mining level 50' },
  { slug: 'recipe-infused-coal', input: 'Coal Ore + 2 Essence', level: 45, output: 'Essence Infused Coal', xp: 50, notes: 'Endgame crafting fuel' },
];

export const potionCrushRecipes: PotionRecipeDetail[] = [
  { slug: 'recipe-crush-scales', input: 'Fish Scales (Perch)', level: 5, output: 'Crushed Fish Scales', duration: 2, xp: 30, notes: 'Chop Perch at the Cutting Table first' },
  { slug: 'recipe-crush-mud-root', input: 'Mud Root', level: 10, output: 'Root Paste', duration: 3, xp: 35, notes: 'Buy at the Potion Stall or obtain from Bandits' },
  { slug: 'recipe-crush-plain-fish-flesh', input: 'Plain Fish Flesh (Bass)', level: 15, output: 'Fish Mash', duration: 2, xp: 40, notes: 'Chop Bass at the Cutting Table first' },
  { slug: 'recipe-crush-small-fang', input: 'Small Fang', level: 20, output: '2 x Fang Dust', duration: 3, xp: 45, notes: 'Buy at the Potion Stall or obtain from Goblins' },
  { slug: 'recipe-crush-glowing-mushroom', input: 'Glowing Mushroom', level: 30, output: '2 x Crushed Mushroom', xp: 60, notes: 'Buy at the Potion Stall or obtain from Fire Liches and Noble Skeletons' },
  { slug: 'recipe-crush-hearty-fish-flesh', input: 'Hearty Fish Flesh (Elder Trout)', level: 35, output: 'Hearty Fish Mash', duration: 3, xp: 80, notes: 'Chop Elder Trout at the Cutting Table first' },
  { slug: 'recipe-crush-refined-hardened-scales', input: 'Polished Fish Scales', level: 45, output: 'Fine Fish Scales', duration: 4, xp: 120, notes: 'Reduce Hardened Fish Scales first' },
];

export const fishProcessingRecipes: PotionRecipeDetail[] = [
  { slug: 'recipe-harvest-minnow', input: 'Minnow', level: 1, output: '(None)', secondaryOutput: '2 x Small Essence Gland', duration: 2, xp: 10, notes: 'Cutting Table' },
  { slug: 'recipe-harvest-small-trout', input: 'Common Trout', level: 1, output: 'Scrap Fish Flesh', secondaryOutput: '1 x Small Essence Gland', duration: 2, xp: 10, notes: 'Cutting Table' },
  { slug: 'recipe-harvest-perch', input: 'Perch', level: 10, output: 'Fish Scales', secondaryOutput: '1 x Small Essence Gland', duration: 2, xp: 30, notes: 'Cutting Table' },
  { slug: 'recipe-harvest-small-bass', input: 'Bass', level: 20, output: 'Plain Fish Flesh', secondaryOutput: '1 x Small Essence Gland', duration: 2, xp: 20, notes: 'Cutting Table' },
  { slug: 'recipe-harvest-blue-gill', input: 'Blue Gill', level: 30, output: '(None)', secondaryOutput: '2 x Essence Gland', duration: 2, xp: 40, notes: 'Cutting Table' },
  { slug: 'recipe-harvest-big-trout', input: 'Elder Trout', level: 40, output: 'Hearty Fish Flesh', secondaryOutput: '1 x Essence Gland', duration: 2, xp: 70, notes: 'Cutting Table' },
  { slug: 'recipe-harvest-carp', input: 'Carp', level: 50, output: 'Hardened Fish Scales', secondaryOutput: '1 x Large Essence Gland', duration: 2, xp: 100, notes: 'Cutting Table' },
];

export const potionBrewRecipes: PotionBrewRecipe[] = [
  { slug: 'recipe-cauldron-weak-health', input: '10 Scrap Fish Flesh + 25 Essence', ingredients: [{ item: 'Scrap Fish Flesh', quantity: 10 }, { item: 'Essence', quantity: 25 }], level: 1, output: 'Weak Health Potion', duration: 20, xp: 500, notes: 'Primary ingredient source: chop Common Trout' },
  { slug: 'recipe-cauldron-fishing', input: '10 Fish Oil + 25 Essence', ingredients: [{ item: 'Fish Oil', quantity: 10 }, { item: 'Essence', quantity: 25 }], level: 5, output: 'Fishing Potion', duration: 20, xp: 500, notes: 'Primary ingredient source: reduce Rare Minnow or Rare Blue Gill' },
  { slug: 'recipe-cauldron-shields', input: '10 Crushed Fish Scales + 50 Essence', ingredients: [{ item: 'Crushed Fish Scales', quantity: 10 }, { item: 'Essence', quantity: 50 }], level: 10, output: 'Shields Potion', duration: 25, xp: 1500, notes: 'Primary ingredient source: crush Perch scales' },
  { slug: 'recipe-cauldron-mining', input: '10 Root Paste + 50 Essence', ingredients: [{ item: 'Root Paste', quantity: 10 }, { item: 'Essence', quantity: 50 }], level: 15, output: 'Mining Potion', duration: 25, xp: 1000, notes: 'Primary ingredient source: crush Mud Root' },
  { slug: 'recipe-cauldron-normal-health', input: '10 Fish Mash + 50 Essence', ingredients: [{ item: 'Fish Mash', quantity: 10 }, { item: 'Essence', quantity: 50 }], level: 20, output: 'Health Potion', duration: 30, xp: 1500, notes: 'Primary ingredient source: crush Bass flesh' },
  { slug: 'recipe-cauldron-attack', input: '10 Fang Dust + 200 Essence', ingredients: [{ item: 'Fang Dust', quantity: 10 }, { item: 'Essence', quantity: 200 }], level: 25, output: 'Attack Potion', duration: 30, xp: 1500, notes: 'Primary ingredient source: crush Small Fangs' },
  { slug: 'recipe-cauldron-archery', input: '10 Distilled Spider Eye + 250 Essence', ingredients: [{ item: 'Distilled Spider Eye', quantity: 10 }, { item: 'Essence', quantity: 250 }], level: 30, output: 'Archery Potion', duration: 30, xp: 1750, notes: 'Primary ingredient source: reduce Spider Eyes' },
  { slug: 'recipe-cauldron-magic', input: '10 Crushed Mushroom + 300 Essence', ingredients: [{ item: 'Crushed Mushroom', quantity: 10 }, { item: 'Essence', quantity: 300 }], level: 35, output: 'Magic Potion', duration: 30, xp: 2000, notes: 'Primary ingredient source: crush Glowing Mushrooms' },
  { slug: 'recipe-cauldron-strong-health', input: '10 Hearty Extract + 200 Essence', ingredients: [{ item: 'Hearty Extract', quantity: 10 }, { item: 'Essence', quantity: 200 }], level: 40, output: 'Strong Health Potion', duration: 40, xp: 3250, notes: 'Primary ingredient source: reduce Hearty Fish Mash' },
  { slug: 'recipe-cauldron-strong-shields', input: '10 Fine Fish Scales + 500 Essence', ingredients: [{ item: 'Fine Fish Scales', quantity: 10 }, { item: 'Essence', quantity: 500 }], level: 50, output: 'Strong Shields Potion', duration: 50, xp: 6000, notes: 'Primary ingredient source: crush Polished Fish Scales' },
];

export const potionRecipeDetails: Record<string, PotionRecipeDetail> = Object.fromEntries([
  ...potionReductionRecipes,
  ...potionCrushRecipes,
  ...fishProcessingRecipes,
  ...potionBrewRecipes,
].map((recipe) => [recipe.slug, recipe]));
