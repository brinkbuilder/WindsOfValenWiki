import assert from 'node:assert/strict';
import {
  MAX_LEVEL,
  actionsRequired,
  calculateMaxHit,
  combatLevelForXp,
  combatXpForLevel,
  exactHitChance,
  levelForXp,
  maximumCombatRoll,
  xpForLevel,
} from '../app/lib/calculator-engine.ts';
import { potionBrewRecipes, potionCauldrons, potionVials, potionsPerBatch } from '../app/lib/potion-data.ts';
import {
  defaultSmithingMaterialOptions,
  duskKnightSetRequirements,
  smithingMaterialTotalsForItems,
  smithingRecipes,
} from '../app/lib/smithing-data.ts';

assert.equal(MAX_LEVEL, 100);
assert.equal(xpForLevel(100), 456_418_714);
assert.equal(levelForXp(456_418_714), 100);
assert.equal(combatXpForLevel(50), 417_159);
assert.equal(combatLevelForXp(417_159), 50);
assert.equal(actionsRequired(1_241, 500), 3);
assert.equal(actionsRequired(0, 500), 0);

const equalRoll = maximumCombatRoll(20, 25);
assert.equal(exactHitChance(equalRoll, equalRoll), equalRoll / (2 * (equalRoll + 1)));
assert.ok(exactHitChance(2_000, 1_000) > 0.5);

const maxHit = calculateMaxHit({ skillLevel: 50, weaponDamage: 60, attackSpeed: 2.4, power: 25 });
assert.ok(Math.abs(maxHit.maxHit - 145.36) < 0.01);

const smallCauldron = potionCauldrons.find((entry) => entry.id === 'small');
const largeCauldron = potionCauldrons.find((entry) => entry.id === 'large');
const largeVial = potionVials.find((entry) => entry.id === 'large');
const gildedVial = potionVials.find((entry) => entry.id === 'gilded');
assert.ok(smallCauldron && largeCauldron && largeVial && gildedVial);
assert.equal(potionsPerBatch(smallCauldron, largeVial), 10);
assert.equal(potionsPerBatch(largeCauldron, largeVial), 15);
assert.equal(potionsPerBatch(largeCauldron, gildedVial), 10);
assert.equal(potionBrewRecipes.find((recipe) => recipe.output === 'Mining Potion')?.xp, 1_000);
assert.equal(potionBrewRecipes.find((recipe) => recipe.output === 'Mining Potion')?.duration, 25);

const confirmedSmithingXp = new Map(smithingRecipes.map((recipe) => [recipe.slug, recipe.xp]));
assert.equal(confirmedSmithingXp.get('silver-bar'), 675);
assert.equal(confirmedSmithingXp.get('ebony-bar-from-dust'), 1_800);
assert.equal(confirmedSmithingXp.get('large-ebony-plate'), 7_000);
assert.equal(confirmedSmithingXp.get('dusk-knight-body-breastplate'), 18_000);
assert.equal(confirmedSmithingXp.get('dusk-knight-platebody'), null);

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

for (const recipe of smithingRecipes) {
  assert.ok(recipe.level >= 1 && recipe.level <= MAX_LEVEL, `${recipe.output} has an invalid level`);
  assert.ok(recipe.seconds > 0, `${recipe.output} has an invalid duration`);
  assert.ok(recipe.xp === null || recipe.xp > 0, `${recipe.output} has an invalid XP value`);
}

console.log('Calculator verification passed.');
