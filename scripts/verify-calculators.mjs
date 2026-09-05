import assert from 'node:assert/strict';
import {
  MAX_LEVEL,
  actionsRequired,
  calculateMaxHit,
  calculateOverallCombatLevel,
  combatLevelForXp,
  combatMultiplier,
  combatXpForEnemy,
  combatXpForLevel,
  exactHitChance,
  levelForXp,
  maximumAccuracyRoll,
  maximumDefenceRoll,
  xpForLevel,
} from '../app/lib/calculator-engine.ts';
import {
  potionBrewRecipes,
  potionCauldrons,
  potionCrushRecipes,
  potionOutputName,
  potionReductionRecipes,
  potionTimePlan,
  potionVials,
  potionsPerBatch,
} from '../app/lib/potion-data.ts';
import { normalizePlayerQuery } from '../app/lib/query-normalization.ts';
import {
  defaultSmithingMaterialOptions,
  duskKnightSetRequirements,
  smithingDirectCraftTime,
  smithingMaterialTotals,
  smithingMaterialTotalsForItems,
  smithingProductionTimePlan,
  smithingRecipes,
} from '../app/lib/smithing-data.ts';

assert.equal(MAX_LEVEL, 100);
for (let level = 1; level <= MAX_LEVEL; level += 1) {
  const exactGameThreshold = 500 * (2 ** ((level - 1) / 5) - 1);
  const integerThreshold = Math.ceil(exactGameThreshold);
  assert.equal(xpForLevel(level), integerThreshold, `incorrect XP threshold for level ${level}`);
  assert.equal(combatXpForLevel(level), integerThreshold, `combat must use the shared curve at level ${level}`);
  assert.equal(levelForXp(integerThreshold), level, `threshold must award level ${level}`);
  assert.equal(combatLevelForXp(integerThreshold), level, `combat threshold must award level ${level}`);
  if (level > 1) {
    assert.equal(levelForXp(integerThreshold - 1), level - 1, `level ${level} awarded one XP early`);
    assert.equal(combatLevelForXp(integerThreshold - 1), level - 1, `combat level ${level} awarded one XP early`);
  }
}
assert.equal(xpForLevel(64), 3_103_688);
assert.equal(xpForLevel(65), 3_565_276);
assert.equal(levelForXp(3_565_275), 64);
assert.equal(levelForXp(3_565_276), 65);
assert.equal(xpForLevel(100), 456_418_714);
assert.equal(actionsRequired(1_241, 500), 3);
assert.equal(actionsRequired(0, 500), 0);
assert.equal(actionsRequired(xpForLevel(30) - xpForLevel(20), 80), 262);

const ashenRangerTotalXp = 2_925;
const attackXpFrom60To90 = combatXpForLevel(90) - combatXpForLevel(60);
assert.equal(attackXpFrom60To90, 112_321_916);
assert.equal(ashenRangerTotalXp * 0.75, 2_193.75);
assert.equal(actionsRequired(attackXpFrom60To90, ashenRangerTotalXp * 0.75), 51_201);
assert.equal(
  normalizePlayerQuery('if im 60 atk hwo many ashan rengers to levl 90'),
  'if im 60 attack how many ashen rangers to level 90',
);
assert.equal(normalizePlayerQuery('atatck with a 2h swodr'), 'attack with a two-handed sword');

assert.equal(combatMultiplier(0), 1);
assert.equal(combatMultiplier(100), 2);
assert.equal(combatMultiplier(101), 2.005);
assert.equal(combatMultiplier(200), 2.5);
assert.equal(combatMultiplier(201), 2.5025);
assert.equal(combatMultiplier(300), 2.75);
assert.ok(Math.abs(combatMultiplier(307) - 2.75875) < 1e-12);
assert.equal(combatMultiplier(400), 2.875);

const equalRoll = maximumAccuracyRoll(20, 25);
assert.equal(exactHitChance(equalRoll, equalRoll), equalRoll / (2 * (equalRoll + 1)));
assert.equal(maximumAccuracyRoll(20, 25), 1_596);
assert.equal(maximumDefenceRoll(20, 25), 1_148);
assert.ok(exactHitChance(2_000, 1_000) > 0.5);

const maxHit = calculateMaxHit({ skillLevel: 50, weaponDamage: 60, attackSpeed: 2.4, power: 25 });
assert.equal(maxHit.maxHit, 145);
assert.ok(Math.abs(maxHit.rawMaxHit - 145.36) < 0.01);

assert.deepEqual(calculateOverallCombatLevel({
  attack: 55,
  archery: 1,
  magic: 1,
  defence: 30,
  evasion: 30,
  warding: 30,
  health: 48,
}), {
  level: 54,
  levelFull: 54.25,
  highestOffence: 55,
  highestDefence: 30,
  healthContribution: 11.75,
});

assert.equal(combatXpForEnemy(1_500, 95), 2_925);
assert.equal(combatXpForEnemy(10_000, 307), 27_587.5);

const smallCauldron = potionCauldrons.find((entry) => entry.id === 'small');
const largeCauldron = potionCauldrons.find((entry) => entry.id === 'large');
const largeVial = potionVials.find((entry) => entry.id === 'large');
const gildedVial = potionVials.find((entry) => entry.id === 'gilded');
assert.ok(smallCauldron && largeCauldron && largeVial && gildedVial);
assert.equal(potionsPerBatch(smallCauldron, largeVial), 10);
assert.equal(potionsPerBatch(largeCauldron, largeVial), 15);
assert.equal(potionsPerBatch(largeCauldron, gildedVial), 10);
const miningPotion = potionBrewRecipes.find((recipe) => recipe.output === 'Mining Potion');
assert.ok(miningPotion);
assert.equal(potionOutputName(miningPotion, gildedVial), 'Gilded Mining Potion');
assert.deepEqual(potionTimePlan(miningPotion, largeCauldron, gildedVial, 25), {
  requestedPotions: 25,
  batches: 3,
  batchYield: 10,
  availablePotions: 30,
  leftoverCapacity: 5,
  brewSeconds: 75,
  bottlingSeconds: 20,
  totalSeconds: 95,
});
assert.equal(potionBrewRecipes.find((recipe) => recipe.output === 'Mining Potion')?.xp, 1_000);
assert.equal(potionBrewRecipes.find((recipe) => recipe.output === 'Mining Potion')?.duration, 25);
assert.equal(potionReductionRecipes.find((recipe) => recipe.slug === 'recipe-reduce-spider-eye')?.duration, 3);
assert.equal(potionReductionRecipes.find((recipe) => recipe.slug === 'recipe-infused-coal')?.duration, 0.5);
assert.equal(potionCrushRecipes.find((recipe) => recipe.slug === 'recipe-crush-glowing-mushroom')?.duration, 3);

const confirmedSmithingXp = new Map(smithingRecipes.map((recipe) => [recipe.slug, recipe.xp]));
assert.equal(confirmedSmithingXp.get('silver-bar'), 675);
assert.equal(confirmedSmithingXp.get('ebony-bar-from-ore'), 1_800);
assert.equal(confirmedSmithingXp.get('large-ebony-plate'), 7_000);
assert.equal(confirmedSmithingXp.get('dusk-knight-body-breastplate'), 18_000);
assert.equal(confirmedSmithingXp.get('bronze-platebody'), 180);
assert.equal(confirmedSmithingXp.get('iron-sword'), 120);
assert.equal(confirmedSmithingXp.get('mithril-platebody'), 3_296);
assert.equal(confirmedSmithingXp.get('dusk-knight-platebody'), 20_000);

const ironBar = smithingRecipes.find((recipe) => recipe.slug === 'iron-bar');
const steelBar = smithingRecipes.find((recipe) => recipe.slug === 'steel-bar');
assert.ok(ironBar && steelBar);
assert.deepEqual(smithingMaterialTotals(ironBar, 3), [{ item: 'Iron Ore', quantity: 6 }]);
assert.deepEqual(smithingMaterialTotals(ironBar, 3, { ...defaultSmithingMaterialOptions, ironSource: 'dust' }), [{ item: 'Iron Dust', quantity: 6 }]);
assert.deepEqual(smithingMaterialTotals(steelBar, 2, { ...defaultSmithingMaterialOptions, ironSource: 'dust', coalSource: 'dust' }), [
  { item: 'Coal Dust', quantity: 2 },
  { item: 'Iron Dust', quantity: 2 },
]);

const duskMaterials = new Map(
  smithingMaterialTotalsForItems(duskKnightSetRequirements, defaultSmithingMaterialOptions)
    .map(({ item, quantity }) => [item, quantity]),
);
assert.deepEqual(Object.fromEntries(duskMaterials), {
  'Ebony Dust': 8_939,
  'Exquisite Silk': 15,
  'Silver Ore': 1_078,
});
assert.equal(duskMaterials.has('Dusk Knight Schematics'), false);

const duskHelmet = smithingRecipes.find((recipe) => recipe.output === 'Dusk Knight Helmet');
assert.ok(duskHelmet);
assert.equal(smithingDirectCraftTime(duskHelmet, 1), 120);
assert.equal(smithingDirectCraftTime(duskHelmet, 25), 3_000);
assert.equal(smithingProductionTimePlan(duskHelmet, 1, defaultSmithingMaterialOptions, 'bars').totalSeconds, 3_930);
assert.equal(smithingProductionTimePlan(duskHelmet, 25, defaultSmithingMaterialOptions, 'bars').totalSeconds, 97_890);
assert.equal(smithingProductionTimePlan(duskHelmet, 1, defaultSmithingMaterialOptions, 'raw').totalSeconds, 8_260);

for (const recipe of smithingRecipes) {
  assert.ok(recipe.level >= 1 && recipe.level <= MAX_LEVEL, `${recipe.output} has an invalid level`);
  assert.ok(recipe.seconds > 0, `${recipe.output} has an invalid duration`);
  assert.ok(recipe.xp !== null && recipe.xp > 0, `${recipe.output} does not have confirmed live XP`);
}

console.log('Calculator verification passed.');
