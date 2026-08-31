export type SmithingStation = 'Furnace' | 'Anvil' | 'Workbench';

export type SmithingIngredient = {
  item: string;
  quantity: number;
};

export type SmithingRecipe = {
  slug: string;
  output: string;
  outputQuantity: number;
  station: SmithingStation;
  level: number;
  seconds: number;
  ingredients: SmithingIngredient[];
  xp: number | null;
  xpBasis: 'confirmed' | 'unconfirmed';
};

const ingredient = (item: string, quantity: number): SmithingIngredient => ({ item, quantity });

const confirmedSmithingXp: Record<string, number> = {
  'bronze-bar': 15,
  'iron-bar': 30,
  'steel-bar': 55,
  'mithril-bar': 155,
  'gold-bar-from-ore': 800,
  'gold-bar-from-dust': 800,
  'silver-bar': 675,
  'ebony-bar-from-ore': 1800,
  'ebony-bar-from-dust': 1800,
  'iron-plate': 30,
  'iron-rod': 10,
  'steel-plate': 60,
  'steel-rod': 30,
  'large-steel-plate': 70,
  'large-steel-rod': 40,
  'mithril-plate': 500,
  'mithril-rod': 250,
  'large-mithril-plate': 550,
  'large-mithril-rod': 275,
  'silver-plate': 400,
  'silver-foil': 400,
  'gold-plate': 400,
  'golden-shield-frame': 1000,
  'small-ebony-plate': 6000,
  'small-ebony-rod': 3000,
  'ebony-plate': 6500,
  'ebony-rod': 3250,
  'large-ebony-plate': 7000,
  'large-ebony-rod': 3500,
  'dusk-knight-boot-left-sabaton': 10000,
  'dusk-knight-boot-right-sabaton': 10000,
  'dusk-knight-boot-greave': 15000,
  'dusk-knight-leg-cuisses': 15000,
  'dusk-knight-leg-tuille': 10000,
  'dusk-knight-leg-poleyn': 10000,
  'dusk-knight-leg-tasset': 14000,
  'dusk-knight-body-breastplate': 18000,
  'dusk-knight-body-pauldron': 10000,
  'dusk-knight-body-couter': 10000,
  'dusk-knight-body-rerebrace': 12000,
  'dusk-knight-body-vambrace': 12000,
  'dusk-knight-helmet-face-plate': 15000,
  'dusk-knight-helmet-head-plate': 15000,
  'dusk-knight-helmet-spike': 15000,
  'bronze-sword': 90,
  'bronze-platelegs': 120,
  'bronze-platebody': 60,
  'bronze-helmet': 60,
  'iron-sword': 180,
  'iron-platelegs': 240,
  'iron-platebody': 300,
  'iron-helmet': 120,
  'mining-gloves': 165,
  'steel-sword': 330,
  'steel-platelegs': 440,
  'steel-platebody': 550,
  'steel-helmet': 220,
  'mithril-sword': 930,
  'mithril-platelegs': 1240,
  'mithril-platebody': 1550,
  'mithril-helmet': 620,
};

const rawSmithingRecipes: Omit<SmithingRecipe, 'xp' | 'xpBasis'>[] = [
  { slug: 'bronze-bar', output: 'Bronze Bar', outputQuantity: 1, station: 'Furnace', level: 1, seconds: 3, ingredients: [ingredient('Copper Ore', 1), ingredient('Tin Ore', 1)] },
  { slug: 'iron-bar', output: 'Iron Bar', outputQuantity: 1, station: 'Furnace', level: 10, seconds: 4, ingredients: [ingredient('Iron Ore', 2)] },
  { slug: 'steel-bar', output: 'Steel Bar', outputQuantity: 1, station: 'Furnace', level: 20, seconds: 6, ingredients: [ingredient('Iron Ore', 1), ingredient('Coal Ore', 1)] },
  { slug: 'mithril-bar', output: 'Mithril Bar', outputQuantity: 1, station: 'Furnace', level: 30, seconds: 8, ingredients: [ingredient('Mithril Ore', 1), ingredient('Coal Ore', 2)] },
  { slug: 'gold-bar-from-ore', output: 'Gold Bar', outputQuantity: 1, station: 'Furnace', level: 40, seconds: 20, ingredients: [ingredient('Gold Ore', 8)] },
  { slug: 'gold-bar-from-dust', output: 'Gold Bar', outputQuantity: 1, station: 'Furnace', level: 40, seconds: 20, ingredients: [ingredient('Gold Dust', 8)] },
  { slug: 'silver-bar', output: 'Silver Bar', outputQuantity: 1, station: 'Furnace', level: 40, seconds: 10, ingredients: [ingredient('Silver Ore', 7)] },
  { slug: 'ebony-bar-from-ore', output: 'Ebony Bar', outputQuantity: 1, station: 'Furnace', level: 60, seconds: 20, ingredients: [ingredient('Ebony Ore', 7)] },
  { slug: 'ebony-bar-from-dust', output: 'Ebony Bar', outputQuantity: 1, station: 'Furnace', level: 60, seconds: 20, ingredients: [ingredient('Ebony Dust', 7)] },

  { slug: 'iron-plate', output: 'Iron Plate', outputQuantity: 1, station: 'Anvil', level: 10, seconds: 4, ingredients: [ingredient('Iron Bar', 2)] },
  { slug: 'iron-rod', output: 'Iron Rod', outputQuantity: 1, station: 'Anvil', level: 11, seconds: 15, ingredients: [ingredient('Iron Bar', 1)] },
  { slug: 'steel-plate', output: 'Steel Plate', outputQuantity: 1, station: 'Anvil', level: 20, seconds: 5, ingredients: [ingredient('Steel Bar', 2)] },
  { slug: 'steel-rod', output: 'Steel Rod', outputQuantity: 1, station: 'Anvil', level: 21, seconds: 3, ingredients: [ingredient('Steel Bar', 1)] },
  { slug: 'large-steel-plate', output: 'Large Steel Plate', outputQuantity: 1, station: 'Anvil', level: 21, seconds: 5, ingredients: [ingredient('Steel Plate', 2)] },
  { slug: 'large-steel-rod', output: 'Large Steel Rod', outputQuantity: 1, station: 'Anvil', level: 23, seconds: 3, ingredients: [ingredient('Steel Rod', 2)] },
  { slug: 'mithril-plate', output: 'Mithril Plate', outputQuantity: 1, station: 'Anvil', level: 30, seconds: 22, ingredients: [ingredient('Mithril Bar', 4)] },
  { slug: 'mithril-rod', output: 'Mithril Rod', outputQuantity: 1, station: 'Anvil', level: 31, seconds: 13, ingredients: [ingredient('Mithril Bar', 2)] },
  { slug: 'large-mithril-plate', output: 'Large Mithril Plate', outputQuantity: 1, station: 'Anvil', level: 31, seconds: 22, ingredients: [ingredient('Mithril Plate', 4)] },
  { slug: 'large-mithril-rod', output: 'Large Mithril Rod', outputQuantity: 1, station: 'Anvil', level: 33, seconds: 13, ingredients: [ingredient('Mithril Rod', 2)] },
  { slug: 'silver-plate', output: 'Silver Plate', outputQuantity: 1, station: 'Anvil', level: 40, seconds: 15, ingredients: [ingredient('Silver Bar', 7)] },
  { slug: 'silver-foil', output: 'Silver Foil', outputQuantity: 2, station: 'Anvil', level: 45, seconds: 15, ingredients: [ingredient('Silver Plate', 1)] },
  { slug: 'gold-plate', output: 'Gold Plate', outputQuantity: 1, station: 'Anvil', level: 40, seconds: 15, ingredients: [ingredient('Gold Bar', 8)] },
  { slug: 'golden-shield-frame', output: 'Golden Shield Frame', outputQuantity: 1, station: 'Anvil', level: 50, seconds: 60, ingredients: [ingredient('Gold Plate', 5), ingredient('Gold Bar', 3), ingredient('Steel Rod', 2), ingredient('Steel Bar', 2)] },
  { slug: 'small-ebony-plate', output: 'Small Ebony Plate', outputQuantity: 1, station: 'Anvil', level: 60, seconds: 60, ingredients: [ingredient('Ebony Bar', 4)] },
  { slug: 'small-ebony-rod', output: 'Small Ebony Rod', outputQuantity: 1, station: 'Anvil', level: 60, seconds: 40, ingredients: [ingredient('Ebony Bar', 2)] },
  { slug: 'ebony-plate', output: 'Ebony Plate', outputQuantity: 1, station: 'Anvil', level: 60, seconds: 60, ingredients: [ingredient('Small Ebony Plate', 4), ingredient('Ebony Bar', 3)] },
  { slug: 'ebony-rod', output: 'Ebony Rod', outputQuantity: 1, station: 'Anvil', level: 60, seconds: 40, ingredients: [ingredient('Small Ebony Rod', 4), ingredient('Ebony Bar', 3)] },
  { slug: 'large-ebony-plate', output: 'Large Ebony Plate', outputQuantity: 1, station: 'Anvil', level: 60, seconds: 60, ingredients: [ingredient('Ebony Plate', 4), ingredient('Ebony Bar', 3)] },
  { slug: 'large-ebony-rod', output: 'Large Ebony Rod', outputQuantity: 1, station: 'Anvil', level: 60, seconds: 40, ingredients: [ingredient('Ebony Rod', 4), ingredient('Ebony Bar', 3)] },
  { slug: 'dusk-knight-boot-left-sabaton', output: 'Dusk Knight Boot Left Sabaton', outputQuantity: 1, station: 'Anvil', level: 60, seconds: 120, ingredients: [ingredient('Ebony Plate', 1), ingredient('Silver Foil', 2), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-boot-right-sabaton', output: 'Dusk Knight Boot Right Sabaton', outputQuantity: 1, station: 'Anvil', level: 60, seconds: 120, ingredients: [ingredient('Ebony Plate', 1), ingredient('Silver Foil', 2), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-boot-greave', output: 'Dusk Knight Boot Greave', outputQuantity: 1, station: 'Anvil', level: 60, seconds: 120, ingredients: [ingredient('Large Ebony Plate', 1), ingredient('Silver Foil', 2), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-leg-cuisses', output: 'Dusk Knight Leg Cuisses', outputQuantity: 1, station: 'Anvil', level: 62, seconds: 120, ingredients: [ingredient('Large Ebony Plate', 2), ingredient('Silver Foil', 2), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-leg-tuille', output: 'Dusk Knight Leg Tuille', outputQuantity: 1, station: 'Anvil', level: 62, seconds: 120, ingredients: [ingredient('Ebony Plate', 1), ingredient('Silver Foil', 1), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-leg-poleyn', output: 'Dusk Knight Leg Poleyn', outputQuantity: 1, station: 'Anvil', level: 62, seconds: 120, ingredients: [ingredient('Ebony Plate', 1), ingredient('Silver Foil', 1), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-leg-tasset', output: 'Dusk Knight Leg Tasset', outputQuantity: 1, station: 'Anvil', level: 62, seconds: 120, ingredients: [ingredient('Ebony Plate', 3), ingredient('Silver Foil', 3), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-body-breastplate', output: 'Dusk Knight Body Breastplate', outputQuantity: 1, station: 'Anvil', level: 66, seconds: 120, ingredients: [ingredient('Large Ebony Plate', 4), ingredient('Silver Foil', 8), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-body-pauldron', output: 'Dusk Knight Body Pauldron', outputQuantity: 1, station: 'Anvil', level: 66, seconds: 120, ingredients: [ingredient('Ebony Plate', 1), ingredient('Silver Foil', 1), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-body-couter', output: 'Dusk Knight Body Couter', outputQuantity: 1, station: 'Anvil', level: 66, seconds: 120, ingredients: [ingredient('Ebony Plate', 1), ingredient('Silver Foil', 1), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-body-rerebrace', output: 'Dusk Knight Body Rerebrace', outputQuantity: 1, station: 'Anvil', level: 66, seconds: 120, ingredients: [ingredient('Ebony Plate', 2), ingredient('Silver Foil', 2), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-body-vambrace', output: 'Dusk Knight Body Vambrace', outputQuantity: 1, station: 'Anvil', level: 66, seconds: 120, ingredients: [ingredient('Ebony Plate', 2), ingredient('Silver Foil', 2), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-helmet-face-plate', output: 'Dusk Knight Helmet Face Plate', outputQuantity: 1, station: 'Anvil', level: 68, seconds: 120, ingredients: [ingredient('Large Ebony Plate', 1), ingredient('Silver Foil', 2), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-helmet-head-plate', output: 'Dusk Knight Helmet Head Plate', outputQuantity: 1, station: 'Anvil', level: 68, seconds: 120, ingredients: [ingredient('Large Ebony Plate', 1), ingredient('Silver Foil', 2), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-helmet-spike', output: 'Dusk Knight Helmet Spike', outputQuantity: 1, station: 'Anvil', level: 68, seconds: 120, ingredients: [ingredient('Large Ebony Rod', 1), ingredient('Silver Foil', 1), ingredient('Dusk Knight Schematics', 1)] },

  { slug: 'bronze-sword', output: 'Bronze Sword', outputQuantity: 1, station: 'Workbench', level: 2, seconds: 10, ingredients: [ingredient('Bronze Bar', 6)] },
  { slug: 'bronze-platelegs', output: 'Bronze Platelegs', outputQuantity: 1, station: 'Workbench', level: 4, seconds: 16, ingredients: [ingredient('Bronze Bar', 8), ingredient('Rough Leather', 2)] },
  { slug: 'bronze-platebody', output: 'Bronze Platebody', outputQuantity: 1, station: 'Workbench', level: 6, seconds: 18, ingredients: [ingredient('Bronze Bar', 10), ingredient('Rough Leather', 3)] },
  { slug: 'bronze-helmet', output: 'Bronze Helmet', outputQuantity: 1, station: 'Workbench', level: 8, seconds: 6, ingredients: [ingredient('Bronze Bar', 4)] },
  { slug: 'iron-sword', output: 'Iron Sword', outputQuantity: 1, station: 'Workbench', level: 12, seconds: 8.5, ingredients: [ingredient('Iron Rod', 4), ingredient('Iron Bar', 2)] },
  { slug: 'iron-platelegs', output: 'Iron Platelegs', outputQuantity: 1, station: 'Workbench', level: 14, seconds: 12, ingredients: [ingredient('Iron Plate', 4), ingredient('Rough Cloth', 3)] },
  { slug: 'iron-platebody', output: 'Iron Platebody', outputQuantity: 1, station: 'Workbench', level: 16, seconds: 14, ingredients: [ingredient('Iron Plate', 5), ingredient('Rough Cloth', 4)] },
  { slug: 'iron-helmet', output: 'Iron Helmet', outputQuantity: 1, station: 'Workbench', level: 18, seconds: 5, ingredients: [ingredient('Iron Plate', 2)] },
  { slug: 'mining-gloves', output: 'Mining Gloves', outputQuantity: 1, station: 'Workbench', level: 21, seconds: 14, ingredients: [ingredient('Steel Plate', 2), ingredient('Steel Bar', 2), ingredient('Rough Leather', 2)] },
  { slug: 'steel-sword', output: 'Steel Sword', outputQuantity: 1, station: 'Workbench', level: 22, seconds: 16, ingredients: [ingredient('Large Steel Rod', 6), ingredient('Steel Rod', 4)] },
  { slug: 'steel-platelegs', output: 'Steel Platelegs', outputQuantity: 1, station: 'Workbench', level: 24, seconds: 18, ingredients: [ingredient('Large Steel Plate', 3), ingredient('Steel Plate', 2), ingredient('Thick Leather Pant Line', 1)] },
  { slug: 'steel-platebody', output: 'Steel Platebody', outputQuantity: 1, station: 'Workbench', level: 26, seconds: 20, ingredients: [ingredient('Large Steel Plate', 4), ingredient('Steel Plate', 3), ingredient('Thick Leather Vest Line', 1)] },
  { slug: 'steel-helmet', output: 'Steel Helmet', outputQuantity: 1, station: 'Workbench', level: 28, seconds: 10, ingredients: [ingredient('Large Steel Plate', 2), ingredient('Steel Rod', 2)] },
  { slug: 'mithril-sword', output: 'Mithril Sword', outputQuantity: 1, station: 'Workbench', level: 32, seconds: 35, ingredients: [ingredient('Large Mithril Rod', 2), ingredient('Mithril Rod', 8), ingredient('Mithril Bar', 3), ingredient('Essence', 1000)] },
  { slug: 'mithril-platelegs', output: 'Mithril Platelegs', outputQuantity: 1, station: 'Workbench', level: 34, seconds: 75, ingredients: [ingredient('Large Mithril Plate', 3), ingredient('Mithril Plate', 4), ingredient('Mithril Bar', 3), ingredient('Elven Cloth Pant Line', 1)] },
  { slug: 'mithril-platebody', output: 'Mithril Platebody', outputQuantity: 1, station: 'Workbench', level: 36, seconds: 85, ingredients: [ingredient('Large Mithril Plate', 4), ingredient('Mithril Plate', 4), ingredient('Mithril Bar', 5), ingredient('Elven Cloth Vest Line', 1)] },
  { slug: 'mithril-helmet', output: 'Mithril Helmet', outputQuantity: 1, station: 'Workbench', level: 38, seconds: 45, ingredients: [ingredient('Large Mithril Plate', 2), ingredient('Mithril Rod', 4), ingredient('Mithril Bar', 1)] },
  { slug: 'ore-crate', output: 'Ore Crate', outputQuantity: 1, station: 'Workbench', level: 45, seconds: 60, ingredients: [ingredient('Large Mithril Plate', 6), ingredient('Gold Bar', 12), ingredient('Steel Bar', 4)] },
  { slug: 'volcanic-ring', output: 'Volcanic Ring', outputQuantity: 1, station: 'Workbench', level: 50, seconds: 30, ingredients: [ingredient('Charred Ring Piece 1', 1), ingredient('Charred Ring Piece 2', 1), ingredient('Charred Ring Piece 3', 1), ingredient('Gold Bar', 1)] },
  { slug: 'volcanic-ward', output: 'Volcanic Ward', outputQuantity: 1, station: 'Workbench', level: 60, seconds: 45, ingredients: [ingredient('Volcanic Core', 1), ingredient('Golden Shield Frame', 1), ingredient('Gold Bar', 2)] },
  { slug: 'dusk-knight-boots', output: 'Dusk Knight Boots', outputQuantity: 1, station: 'Workbench', level: 60, seconds: 120, ingredients: [ingredient('Exquisite Silk Boot Line', 1), ingredient('Dusk Knight Boot Left Sabaton', 1), ingredient('Dusk Knight Boot Right Sabaton', 1), ingredient('Dusk Knight Boot Greave', 2), ingredient('Ebony Bar', 2), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-platelegs', output: 'Dusk Knight Platelegs', outputQuantity: 1, station: 'Workbench', level: 62, seconds: 120, ingredients: [ingredient('Exquisite Silk Pant Line', 1), ingredient('Dusk Knight Leg Cuisses', 1), ingredient('Dusk Knight Leg Tuille', 1), ingredient('Dusk Knight Leg Tasset', 2), ingredient('Dusk Knight Leg Poleyn', 2), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-platebody', output: 'Dusk Knight Platebody', outputQuantity: 1, station: 'Workbench', level: 66, seconds: 120, ingredients: [ingredient('Exquisite Silk Vest Line', 1), ingredient('Dusk Knight Body Breastplate', 1), ingredient('Dusk Knight Body Pauldron', 2), ingredient('Dusk Knight Body Rerebrace', 2), ingredient('Dusk Knight Body Couter', 2), ingredient('Dusk Knight Body Vambrace', 2), ingredient('Dusk Knight Schematics', 1)] },
  { slug: 'dusk-knight-helmet', output: 'Dusk Knight Helmet', outputQuantity: 1, station: 'Workbench', level: 68, seconds: 120, ingredients: [ingredient('Dusk Knight Helmet Face Plate', 1), ingredient('Dusk Knight Helmet Head Plate', 1), ingredient('Dusk Knight Helmet Spike', 1), ingredient('Ebony Bar', 1), ingredient('Dusk Knight Schematics', 1)] },
];

export const smithingRecipes: SmithingRecipe[] = rawSmithingRecipes.map((recipe) => {
  const xp = confirmedSmithingXp[recipe.slug] ?? null;
  return {
    ...recipe,
    xp,
    xpBasis: xp === null ? 'unconfirmed' : 'confirmed',
  };
});

export type SmithingMaterialTotal = {
  item: string;
  quantity: number;
};

export type SmithingTimeMode = 'bars' | 'raw';

export type SmithingTimeStep = {
  slug: string;
  output: string;
  station: SmithingStation;
  crafts: number;
  secondsPerCraft: number;
  totalSeconds: number;
};

export type SmithingTimePlan = {
  requestedOutput: number;
  totalSeconds: number;
  steps: SmithingTimeStep[];
  suppliedMaterials: SmithingMaterialTotal[];
};

export type SmithingMaterialOptions = {
  goldSource: 'ore' | 'dust';
  ebonySource: 'ore' | 'dust';
};

export const defaultSmithingMaterialOptions: SmithingMaterialOptions = {
  goldSource: 'ore',
  ebonySource: 'dust',
};

export const duskKnightSetRequirements: SmithingIngredient[] = [
  ingredient('Dusk Knight Boots', 1),
  ingredient('Dusk Knight Platelegs', 1),
  ingredient('Dusk Knight Platebody', 1),
  ingredient('Dusk Knight Helmet', 1),
];

const reusableRequirements = new Set(['Dusk Knight Schematics']);
const suppliedMaterialRecipes: Record<string, SmithingIngredient[]> = {
  'Exquisite Silk Boot Line': [ingredient('Exquisite Silk', 4)],
  'Exquisite Silk Pant Line': [ingredient('Exquisite Silk', 5)],
  'Exquisite Silk Vest Line': [ingredient('Exquisite Silk', 6)],
};

function recipeForItem(item: string, options: SmithingMaterialOptions) {
  if (item === 'Gold Bar') return smithingRecipes.find((recipe) => recipe.slug === `gold-bar-from-${options.goldSource}`);
  if (item === 'Ebony Bar') return smithingRecipes.find((recipe) => recipe.slug === `ebony-bar-from-${options.ebonySource}`);
  return smithingRecipes.find((recipe) => recipe.output === item);
}

function materialDepth(item: string, options: SmithingMaterialOptions, stack = new Set<string>()): number {
  if (stack.has(item) || reusableRequirements.has(item)) return 0;
  const supplied = suppliedMaterialRecipes[item];
  const producer = recipeForItem(item, options);
  const inputs = supplied ?? producer?.ingredients;
  if (!inputs?.length) return 0;
  const nextStack = new Set(stack);
  nextStack.add(item);
  return 1 + Math.max(...inputs.map((input) => materialDepth(input.item, options, nextStack)));
}

export function smithingMaterialTotalsForItems(
  requirements: SmithingIngredient[],
  options: SmithingMaterialOptions = defaultSmithingMaterialOptions,
): SmithingMaterialTotal[] {
  const pending = new Map<string, number>();
  const totals = new Map<string, number>();
  requirements.forEach(({ item, quantity }) => pending.set(item, (pending.get(item) ?? 0) + quantity));

  while (pending.size) {
    const [item, quantity] = [...pending.entries()].sort((a, b) => materialDepth(b[0], options) - materialDepth(a[0], options))[0];
    pending.delete(item);
    if (reusableRequirements.has(item)) continue;

    const supplied = suppliedMaterialRecipes[item];
    const producer = recipeForItem(item, options);
    if (supplied) {
      supplied.forEach((input) => pending.set(input.item, (pending.get(input.item) ?? 0) + input.quantity * quantity));
    } else if (producer) {
      const producerCrafts = Math.ceil(quantity / producer.outputQuantity);
      producer.ingredients.forEach((input) => pending.set(input.item, (pending.get(input.item) ?? 0) + input.quantity * producerCrafts));
    } else {
      totals.set(item, (totals.get(item) ?? 0) + quantity);
    }
  }

  return [...totals.entries()]
    .map(([item, quantity]) => ({ item, quantity }))
    .sort((a, b) => a.item.localeCompare(b.item));
}

export function smithingMaterialTotals(
  recipe: SmithingRecipe,
  crafts: number,
  options: SmithingMaterialOptions = defaultSmithingMaterialOptions,
): SmithingMaterialTotal[] {
  const requirements = crafts > 0
    ? recipe.ingredients.map(({ item, quantity }) => ingredient(item, quantity * crafts))
    : [];
  return smithingMaterialTotalsForItems(requirements, options);
}

export function smithingDirectCraftTime(recipe: SmithingRecipe, requestedOutput: number) {
  const quantity = Math.max(1, Math.floor(requestedOutput || 1));
  return Math.ceil(quantity / recipe.outputQuantity) * recipe.seconds;
}

export function smithingProductionTimePlan(
  recipe: SmithingRecipe,
  requestedOutput: number,
  options: SmithingMaterialOptions = defaultSmithingMaterialOptions,
  mode: SmithingTimeMode = 'bars',
): SmithingTimePlan {
  const quantity = Math.max(1, Math.floor(requestedOutput || 1));
  const pending = new Map<string, number>();
  const suppliedMaterials = new Map<string, number>();
  const steps = new Map<string, SmithingTimeStep>();

  const addStep = (producer: SmithingRecipe, crafts: number) => {
    const existing = steps.get(producer.slug);
    const nextCrafts = (existing?.crafts ?? 0) + crafts;
    steps.set(producer.slug, {
      slug: producer.slug,
      output: producer.output,
      station: producer.station,
      crafts: nextCrafts,
      secondsPerCraft: producer.seconds,
      totalSeconds: nextCrafts * producer.seconds,
    });
  };

  const rootCrafts = Math.ceil(quantity / recipe.outputQuantity);
  addStep(recipe, rootCrafts);
  recipe.ingredients.forEach(({ item, quantity: ingredientQuantity }) => {
    pending.set(item, (pending.get(item) ?? 0) + ingredientQuantity * rootCrafts);
  });

  while (pending.size) {
    const [item, itemQuantity] = [...pending.entries()]
      .sort((a, b) => materialDepth(b[0], options) - materialDepth(a[0], options))[0];
    pending.delete(item);

    if (reusableRequirements.has(item)) continue;

    const supplied = suppliedMaterialRecipes[item];
    if (supplied) {
      supplied.forEach((input) => pending.set(input.item, (pending.get(input.item) ?? 0) + input.quantity * itemQuantity));
      continue;
    }

    if (mode === 'bars' && /\bBar$/.test(item)) {
      suppliedMaterials.set(item, (suppliedMaterials.get(item) ?? 0) + itemQuantity);
      continue;
    }

    const producer = recipeForItem(item, options);
    if (!producer) {
      suppliedMaterials.set(item, (suppliedMaterials.get(item) ?? 0) + itemQuantity);
      continue;
    }

    const crafts = Math.ceil(itemQuantity / producer.outputQuantity);
    addStep(producer, crafts);
    producer.ingredients.forEach((input) => {
      pending.set(input.item, (pending.get(input.item) ?? 0) + input.quantity * crafts);
    });
  }

  const timeSteps = [...steps.values()];
  return {
    requestedOutput: quantity,
    totalSeconds: timeSteps.reduce((total, step) => total + step.totalSeconds, 0),
    steps: timeSteps,
    suppliedMaterials: [...suppliedMaterials.entries()]
      .map(([item, suppliedQuantity]) => ({ item, quantity: suppliedQuantity }))
      .sort((a, b) => a.item.localeCompare(b.item)),
  };
}

export const smithingItemDescriptions: Record<string, string> = {
  'Bronze Bar': 'A bronze bar used to make early Smithing equipment.',
  'Iron Bar': 'An iron bar that can be shaped into plates and rods.',
  'Steel Bar': 'A steel bar that can be shaped into plates and rods.',
  'Mithril Bar': 'A mithril bar used for advanced equipment and an ore crate.',
  'Gold Bar': 'A valuable, heavy bar used in jewellery and specialist Smithing recipes.',
  'Silver Bar': 'A valuable bar used to make silver plate and foil.',
  'Ebony Bar': 'A high-level bar used throughout the Dusk Knight armour chain.',
  'Silver Plate': 'A plate of silver that can be hammered into Silver Foil.',
  'Silver Foil': 'A thin sheet of silver used in Dusk Knight armour components.',
  'Gold Plate': 'A valuable plate used to build a Golden Shield Frame.',
  'Golden Shield Frame': 'A solid-gold shield frame used to make the Volcanic Ward.',
  'Mining Gloves': 'Smithing equipment made for mining.',
  'Ore Crate': 'A wearable mithril crate that holds up to 500 ore and is emptied at a bank.',
  'Volcanic Ring': 'A powerful ring reforged from three charred ring pieces.',
  'Volcanic Ward': 'A warding shield infused with a Volcanic Core and effective against fire attacks.',
  'Dusk Knight Boots': 'Boots of the Dusk Knight order.',
  'Dusk Knight Platelegs': 'Platelegs of the Dusk Knight order.',
  'Dusk Knight Platebody': 'A platebody of the Dusk Knight order.',
  'Dusk Knight Helmet': 'A helmet of the Dusk Knight order.',
};

export function smithingItemSlug(item: string) {
  return item.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function formatSmithingIngredients(recipe: SmithingRecipe) {
  return recipe.ingredients.map(({ item, quantity }) => `${quantity} ${item}`).join(' + ');
}
