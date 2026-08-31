'use client';

import { useMemo, useState } from 'react';
import {
  MAX_LEVEL,
  actionsRequired,
  calculateMaxHit,
  combatLevelForXp,
  combatXpForLevel,
  enemies,
  exactHitChance,
  levelForXp,
  maximumCombatRoll,
  skillTrainingData,
  xpForLevel,
  type SkillName,
} from '../lib/calculator-data';
import { potionBrewRecipes, potionCauldrons, potionVials, potionsPerBatch } from '../lib/potion-data';
import {
  defaultSmithingMaterialOptions,
  duskKnightSetRequirements,
  formatSmithingIngredients,
  smithingMaterialTotals,
  smithingMaterialTotalsForItems,
  smithingRecipes,
  type SmithingMaterialOptions,
  type SmithingStation,
} from '../lib/smithing-data';

type CalculatorTab = 'skill' | 'combat' | 'accuracy' | 'max-hit';
type SmithingStationFilter = 'All' | SmithingStation;
type CombatStyle = 'Melee' | 'Archery' | 'Magic';

const number = new Intl.NumberFormat('en-US');
const smithingStations: SmithingStationFilter[] = ['All', 'Furnace', 'Anvil', 'Workbench'];

function clampLevel(value: number) {
  return Math.max(1, Math.min(MAX_LEVEL, Math.floor(value || 1)));
}

function clampTargetLevel(value: number) {
  return Math.max(2, Math.min(MAX_LEVEL, Math.floor(value || 2)));
}

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0s';
  const roundedSeconds = Math.ceil(totalSeconds);
  const days = Math.floor(roundedSeconds / 86400);
  const hours = Math.floor((roundedSeconds % 86400) / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const seconds = roundedSeconds % 60;
  return [days ? `${days}d` : '', hours ? `${hours}h` : '', minutes ? `${minutes}m` : '', seconds ? `${seconds}s` : ''].filter(Boolean).join(' ');
}

function smithingRecipeLabel(recipe: (typeof smithingRecipes)[number]) {
  const hasVariants = smithingRecipes.some((item) => item.slug !== recipe.slug && item.output === recipe.output);
  const variant = hasVariants ? ` (${recipe.ingredients.map((ingredient) => ingredient.item).join(' + ')})` : '';
  return `${recipe.output}${variant} · level ${recipe.level}`;
}

function LevelFields({ currentLevel, currentXp, targetLevel, onCurrentLevel, onCurrentXp, onTargetLevel, xpAtLevel = xpForLevel, levelAtXp = levelForXp }: {
  currentLevel: number;
  currentXp: number;
  targetLevel: number;
  onCurrentLevel: (value: number) => void;
  onCurrentXp: (value: number) => void;
  onTargetLevel: (value: number) => void;
  xpAtLevel?: (level: number) => number;
  levelAtXp?: (xp: number) => number;
}) {
  return (
    <div className="calculator-fields level-fields">
      <label><span>Current level</span><input type="number" min="1" max={MAX_LEVEL} value={currentLevel} onChange={(event) => { const level = clampLevel(Number(event.target.value)); onCurrentLevel(level); onCurrentXp(xpAtLevel(level)); }} /></label>
      <label><span>Current total XP</span><input type="number" min="0" value={currentXp} onChange={(event) => { const xp = Math.max(0, Number(event.target.value) || 0); onCurrentXp(xp); onCurrentLevel(levelAtXp(xp)); }} /></label>
      <label><span>Target level</span><input type="number" min="2" max={MAX_LEVEL} value={targetLevel} onChange={(event) => onTargetLevel(clampTargetLevel(Number(event.target.value)))} /></label>
    </div>
  );
}

export function CalculatorHub({ initialTab = 'skill', initialSkill = 'Mining' }: { initialTab?: CalculatorTab; initialSkill?: SkillName }) {
  const [tab, setTab] = useState<CalculatorTab>(initialTab);
  const [skill, setSkill] = useState<SkillName>(initialSkill);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [currentXp, setCurrentXp] = useState(0);
  const [targetLevel, setTargetLevel] = useState(10);
  const [customActionXp, setCustomActionXp] = useState(100);
  const xpNeeded = Math.max(0, xpForLevel(targetLevel) - currentXp);
  const skillResults = useMemo(() => skillTrainingData[skill].map((action) => {
    const actionXp = skill === 'Custom skill' ? customActionXp : action.xp;
    return { ...action, xp: actionXp, actions: actionsRequired(xpNeeded, actionXp), available: currentLevel >= action.level };
  }), [currentLevel, customActionXp, skill, xpNeeded]);

  const [selectedPotionSlug, setSelectedPotionSlug] = useState(potionBrewRecipes[0].slug);
  const [cauldronId, setCauldronId] = useState<(typeof potionCauldrons)[number]['id']>('small');
  const [vialId, setVialId] = useState<(typeof potionVials)[number]['id']>('large');
  const selectedPotion = potionBrewRecipes.find((recipe) => recipe.slug === selectedPotionSlug) ?? potionBrewRecipes[0];
  const selectedCauldron = potionCauldrons.find((cauldron) => cauldron.id === cauldronId) ?? potionCauldrons[0];
  const selectedVial = potionVials.find((vial) => vial.id === vialId) ?? potionVials[0];
  const batchYield = potionsPerBatch(selectedCauldron, selectedVial);
  const bottlingXpPerBatch = batchYield * selectedVial.bottlingXp;
  const completeBatchXp = selectedPotion.xp + bottlingXpPerBatch;
  const potionBatchesNeeded = actionsRequired(xpNeeded, completeBatchXp);
  const totalFinishedPotions = potionBatchesNeeded * batchYield;
  const potionRequiredLevel = Math.max(selectedPotion.level, selectedVial.level);

  const [smithingStation, setSmithingStation] = useState<SmithingStationFilter>('All');
  const [smithingQuery, setSmithingQuery] = useState('');
  const [selectedSmithingSlug, setSelectedSmithingSlug] = useState(smithingRecipes[0].slug);
  const [unconfirmedCraftQuantity, setUnconfirmedCraftQuantity] = useState(1);
  const [goldSource, setGoldSource] = useState<SmithingMaterialOptions['goldSource']>(defaultSmithingMaterialOptions.goldSource);
  const [ebonySource, setEbonySource] = useState<SmithingMaterialOptions['ebonySource']>(defaultSmithingMaterialOptions.ebonySource);
  const materialOptions = useMemo(() => ({ goldSource, ebonySource }), [ebonySource, goldSource]);
  const smithingResults = useMemo(() => {
    const needle = smithingQuery.trim().toLowerCase();
    return smithingRecipes
      .filter((recipe) => smithingStation === 'All' || recipe.station === smithingStation)
      .filter((recipe) => !needle || recipe.output.toLowerCase().includes(needle) || recipe.station.toLowerCase().includes(needle))
      .map((recipe) => ({ ...recipe, crafts: recipe.xp === null ? null : actionsRequired(xpNeeded, recipe.xp), available: currentLevel >= recipe.level }));
  }, [currentLevel, smithingQuery, smithingStation, xpNeeded]);
  const selectedSmithingRecipe = smithingRecipes.find((recipe) => recipe.slug === selectedSmithingSlug) ?? smithingRecipes[0];
  const selectedSmithingCrafts = selectedSmithingRecipe.xp === null ? null : actionsRequired(xpNeeded, selectedSmithingRecipe.xp);
  const plannedSmithingCrafts = selectedSmithingCrafts ?? unconfirmedCraftQuantity;
  const selectedSmithingOutput = plannedSmithingCrafts * selectedSmithingRecipe.outputQuantity;
  const selectedSmithingMaterials = useMemo(() => smithingMaterialTotals(selectedSmithingRecipe, plannedSmithingCrafts, materialOptions), [materialOptions, plannedSmithingCrafts, selectedSmithingRecipe]);
  const duskSetMaterials = useMemo(() => smithingMaterialTotalsForItems(duskKnightSetRequirements, materialOptions), [materialOptions]);

  const [combatLevel, setCombatLevel] = useState(1);
  const [combatXp, setCombatXp] = useState(0);
  const [combatTarget, setCombatTarget] = useState(20);
  const [enemyName, setEnemyName] = useState('Goblin Berserker (Boss)');
  const [killTime, setKillTime] = useState(12);
  const [travelTime, setTravelTime] = useState(3);
  const [healthXp, setHealthXp] = useState(0);
  const selectedEnemy = enemies.find((enemy) => enemy.name === enemyName) ?? enemies[0];
  const combatXpNeeded = Math.max(0, combatXpForLevel(combatTarget) - combatXp);
  const trainingXpPerKill = selectedEnemy.totalXp * 0.75;
  const healthXpPerKill = selectedEnemy.totalXp * 0.25;
  const killsNeeded = actionsRequired(combatXpNeeded, trainingXpPerKill);
  const totalTrainingSeconds = killsNeeded * Math.max(0, killTime) + Math.max(0, killsNeeded - 1) * Math.max(0, travelTime);
  const resultingHealthXp = healthXp + killsNeeded * healthXpPerKill;

  const [attackLevel, setAttackLevel] = useState(20);
  const [accuracyBonus, setAccuracyBonus] = useState(25);
  const [defenceLevel, setDefenceLevel] = useState(20);
  const [defenceBonus, setDefenceBonus] = useState(25);
  const maxAccuracy = maximumCombatRoll(attackLevel, accuracyBonus);
  const maxDefence = maximumCombatRoll(defenceLevel, defenceBonus);
  const hitChance = exactHitChance(maxAccuracy, maxDefence);

  const [combatStyle, setCombatStyle] = useState<CombatStyle>('Melee');
  const [damageLevel, setDamageLevel] = useState(50);
  const [weaponDamage, setWeaponDamage] = useState(60);
  const [attackSpeed, setAttackSpeed] = useState(2.4);
  const [power, setPower] = useState(25);
  const maxHit = calculateMaxHit({ skillLevel: damageLevel, weaponDamage, attackSpeed, power });

  return (
    <div className="calculator-hub">
      <div className="calculator-tabs" role="tablist" aria-label="Calculator type">
        <button type="button" role="tab" aria-selected={tab === 'skill'} onClick={() => setTab('skill')}>Skill planner</button>
        <button type="button" role="tab" aria-selected={tab === 'combat'} onClick={() => setTab('combat')}>Combat XP</button>
        <button type="button" role="tab" aria-selected={tab === 'max-hit'} onClick={() => setTab('max-hit')}>Max hit</button>
        <button type="button" role="tab" aria-selected={tab === 'accuracy'} onClick={() => setTab('accuracy')}>Accuracy &amp; defence</button>
      </div>

      {tab === 'skill' && (
        <section className="calculator-card" aria-labelledby="skill-calculator-heading">
          <div className="calculator-heading">
            <div><p>Skill calculator</p><h2 id="skill-calculator-heading">Plan a training goal</h2><span className="calculator-heading-help">Set your current XP and target level. Every planner supports the level 100 cap.</span></div>
            <label className="skill-select"><span>Choose a skill</span><select value={skill} onChange={(event) => setSkill(event.target.value as SkillName)}>{Object.keys(skillTrainingData).map((name) => <option key={name}>{name}</option>)}</select></label>
          </div>
          <LevelFields currentLevel={currentLevel} currentXp={currentXp} targetLevel={targetLevel} onCurrentLevel={setCurrentLevel} onCurrentXp={setCurrentXp} onTargetLevel={setTargetLevel} />
          {skill === 'Custom skill' && <div className="custom-xp-field"><label><span>XP earned per action</span><input type="number" min="1" value={customActionXp} onChange={(event) => setCustomActionXp(Math.max(1, Number(event.target.value) || 1))} /></label><p>Use this for an activity whose XP per action you already know.</p></div>}
          <div className="calculator-summary"><div><span>Experience required</span><strong>{number.format(xpNeeded)}</strong></div><p>Level {currentLevel} ({number.format(currentXp)} XP) → level {targetLevel} ({number.format(xpForLevel(targetLevel))} XP)</p></div>

          {skill === 'Potion Making' && (
            <div className="potion-batch-planner">
              <div className="smithing-plan-heading"><div><p>Potion batch planner</p><h3>Plan brewing and bottling together</h3></div><span className="smithing-plan-status">{batchYield} potions per batch</span></div>
              <div className="potion-batch-controls">
                <label><span>Potion</span><select value={selectedPotionSlug} onChange={(event) => setSelectedPotionSlug(event.target.value)}>{potionBrewRecipes.map((recipe) => <option value={recipe.slug} key={recipe.slug}>{recipe.output} · level {recipe.level}</option>)}</select></label>
                <label><span>Cauldron</span><select value={cauldronId} onChange={(event) => setCauldronId(event.target.value as typeof cauldronId)}>{potionCauldrons.map((cauldron) => <option value={cauldron.id} key={cauldron.id}>{cauldron.name} · {number.format(cauldron.capacityMl)} ml</option>)}</select></label>
                <label><span>Vial</span><select value={vialId} onChange={(event) => setVialId(event.target.value as typeof vialId)}>{potionVials.map((vial) => <option value={vial.id} key={vial.id}>{vial.name} · {vial.volumeMl} ml</option>)}</select></label>
              </div>
              <div className="potion-result-grid" aria-live="polite">
                <div><span>Potions per batch</span><strong>{number.format(batchYield)}</strong></div>
                <div><span>Brew XP</span><strong>{number.format(selectedPotion.xp)}</strong></div>
                <div><span>Bottling XP</span><strong>{number.format(bottlingXpPerBatch)}</strong></div>
                <div><span>Complete batch XP</span><strong>{number.format(completeBatchXp)}</strong></div>
                <div><span>Batches needed</span><strong>{number.format(potionBatchesNeeded)}</strong></div>
                <div><span>Finished potions</span><strong>{number.format(totalFinishedPotions)}</strong></div>
              </div>
              <div className="potion-material-summary"><strong>Total supplies</strong><span>{selectedPotion.ingredients.map((item) => `${number.format(item.quantity * potionBatchesNeeded)} ${item.item}`).join(' · ')} · {number.format(totalFinishedPotions)} {selectedVial.name}s</span></div>
              <p className="calculator-note">One batch means one full cauldron. With Large Vials, the small cauldron makes <b>10 potions</b> and the large cauldron makes <b>15 potions</b>. Complete-batch XP includes brewing and bottling; preparation XP from cutting, crushing, or reducing is listed below but is not added because it depends on how you source each ingredient.</p>
              {currentLevel < potionRequiredLevel && <p className="smithing-lock-note">This setup requires Potion Making level {potionRequiredLevel}: level {selectedPotion.level} for the brew and level {selectedVial.level} for the vial.</p>}
            </div>
          )}

          {skill === 'Smithing' ? (
            <>
              <div className="smithing-plan-box">
                <div className="smithing-plan-heading"><div><p>Smithing planner</p><h3>Choose an item to make</h3></div><span className="smithing-plan-status">{selectedSmithingRecipe.station} · level {selectedSmithingRecipe.level}</span></div>
                <div className="smithing-plan-controls">
                  <label><span>Item</span><select value={selectedSmithingSlug} onChange={(event) => setSelectedSmithingSlug(event.target.value)}>{smithingRecipes.map((recipe) => <option value={recipe.slug} key={recipe.slug}>{smithingRecipeLabel(recipe)}</option>)}</select></label>
                  <div className="smithing-materials"><span>Materials per craft</span><strong>{formatSmithingIngredients(selectedSmithingRecipe)}</strong></div>
                  <label><span>Gold bars from</span><select value={goldSource} onChange={(event) => setGoldSource(event.target.value as SmithingMaterialOptions['goldSource'])}><option value="ore">Gold Ore</option><option value="dust">Gold Dust</option></select></label>
                  <label><span>Ebony bars from</span><select value={ebonySource} onChange={(event) => setEbonySource(event.target.value as SmithingMaterialOptions['ebonySource'])}><option value="dust">Ebony Dust</option><option value="ore">Ebony Ore</option></select></label>
                </div>
                {selectedSmithingRecipe.xp === null && <div className="custom-xp-field smithing-quantity-field"><label><span>Craft quantity</span><input type="number" min="1" value={unconfirmedCraftQuantity} onChange={(event) => setUnconfirmedCraftQuantity(Math.max(1, Math.floor(Number(event.target.value) || 1)))} /></label><p>This recipe&apos;s direct XP has not been confirmed, so the calculator will plan materials and time without inventing an XP rate.</p></div>}
                <div className="smithing-result-grid" aria-live="polite">
                  <div><span>XP per craft</span><strong>{selectedSmithingRecipe.xp === null ? 'Unconfirmed' : number.format(selectedSmithingRecipe.xp)}</strong></div>
                  <div><span>{selectedSmithingRecipe.xp === null ? 'Planned crafts' : 'Crafts needed'}</span><strong>{number.format(plannedSmithingCrafts)}</strong></div>
                  <div><span>Items produced</span><strong>{number.format(selectedSmithingOutput)}</strong></div>
                  <div><span>Base time</span><strong>{formatTime(plannedSmithingCrafts * selectedSmithingRecipe.seconds)}</strong></div>
                </div>
                <div className="smithing-total-materials"><div><span>Total raw materials for this plan</span><small>Shared outputs such as Silver Foil are pooled before rounding.</small></div><ul>{selectedSmithingMaterials.length ? selectedSmithingMaterials.map((material) => <li key={material.item}><b>{number.format(material.quantity)}</b> {material.item}</li>) : <li>No crafts are needed for this target.</li>}</ul></div>
                {selectedSmithingRecipe.output.startsWith('Dusk Knight') && <p className="calculator-note">Dusk Knight Schematics are required as a reusable recipe catalyst and are not multiplied into the raw-material total.</p>}
                {currentLevel < selectedSmithingRecipe.level && <p className="smithing-lock-note">You need Smithing level {selectedSmithingRecipe.level} to make this item. It is shown so you can plan ahead.</p>}
              </div>

              <div className="dusk-set-plan">
                <div><p>Full armour preset</p><h3>Dusk Knight full set</h3><span>Boots, platelegs, platebody, and helmet with every intermediate pooled.</span></div>
                <ul>{duskSetMaterials.map((material) => <li key={material.item}><b>{number.format(material.quantity)}</b><span>{material.item}</span></li>)}</ul>
                <small>Also requires the reusable Dusk Knight Schematics. The default Ebony source is Dust; change the source above to plan with Ore.</small>
              </div>

              <div className="smithing-list-heading"><div><h3>All smithable items</h3><p>Only confirmed direct XP is used. Unknown values are never estimated from ingredients.</p></div><strong>{smithingResults.length} of {smithingRecipes.length} recipes</strong></div>
              <div className="smithing-list-controls">
                <label className="smithing-filter-search"><span className="sr-only">Filter Smithing items</span><input value={smithingQuery} onChange={(event) => setSmithingQuery(event.target.value)} placeholder="Filter items…" /></label>
                <div className="smithing-station-tabs" role="tablist" aria-label="Smithing station"><span>Station</span>{smithingStations.map((station) => <button type="button" role="tab" aria-selected={smithingStation === station} onClick={() => setSmithingStation(station)} key={station}>{station}</button>)}</div>
              </div>
              <div className="calculator-table-wrap smithing-table-wrap"><table className="calculator-table smithing-table"><thead><tr><th>Item</th><th>Station</th><th>Level</th><th>XP / craft</th><th>Crafts needed</th><th>Materials</th></tr></thead><tbody>{smithingResults.map((recipe) => <tr className={`${recipe.available ? '' : 'locked'}${recipe.slug === selectedSmithingSlug ? ' selected' : ''}`} key={recipe.slug}><td><button type="button" className="smithing-item-button" onClick={() => setSelectedSmithingSlug(recipe.slug)} aria-label={`Plan ${recipe.output}`}><strong>{recipe.output}</strong><small>{recipe.outputQuantity > 1 ? `${recipe.outputQuantity} produced per craft` : '1 produced per craft'}</small></button></td><td>{recipe.station}</td><td>{recipe.level}</td><td><b>{recipe.xp === null ? '—' : number.format(recipe.xp)}</b>{recipe.xp === null && <small>Not confirmed</small>}</td><td><b>{recipe.crafts === null ? '—' : number.format(recipe.crafts)}</b>{!recipe.available && <small>Unlock at {recipe.level}</small>}</td><td>{formatSmithingIngredients(recipe)}</td></tr>)}</tbody></table></div>
            </>
          ) : (
            <div className="calculator-table-wrap"><table className="calculator-table"><thead><tr><th>Training method</th><th>Level</th><th>XP per action</th><th>Actions needed</th></tr></thead><tbody>{skillResults.map((action) => <tr className={action.available ? '' : 'locked'} key={`${action.group ?? 'method'}-${action.name}`}><td><strong>{action.name}</strong>{action.note && <small>{action.note}</small>}</td><td>{action.level}</td><td>{number.format(action.xp)}</td><td><b>{number.format(action.actions)}</b>{!action.available && <small>Unlock at {action.level}</small>}</td></tr>)}</tbody></table></div>
          )}
        </section>
      )}

      {tab === 'combat' && (
        <section className="calculator-card" aria-labelledby="combat-calculator-heading">
          <div className="calculator-heading"><div><p>Combat calculator</p><h2 id="combat-calculator-heading">Estimate kills and training time</h2><span className="calculator-heading-help">Uses the combat-specific level curve and documented XP totals for every listed enemy.</span></div></div>
          <LevelFields currentLevel={combatLevel} currentXp={combatXp} targetLevel={combatTarget} onCurrentLevel={setCombatLevel} onCurrentXp={setCombatXp} onTargetLevel={setCombatTarget} xpAtLevel={combatXpForLevel} levelAtXp={combatLevelForXp} />
          <div className="calculator-fields combat-fields">
            <label><span>Enemy</span><select value={enemyName} onChange={(event) => setEnemyName(event.target.value)}>{enemies.map((enemy) => <option value={enemy.name} key={enemy.name}>{enemy.name} — level {enemy.level}</option>)}</select></label>
            <label><span>Seconds per kill</span><input type="number" min="1" value={killTime} onChange={(event) => setKillTime(Math.max(1, Number(event.target.value) || 1))} /></label>
            <label><span>Travel / respawn seconds</span><input type="number" min="0" value={travelTime} onChange={(event) => setTravelTime(Math.max(0, Number(event.target.value) || 0))} /></label>
            <label><span>Current Health XP</span><input type="number" min="0" value={healthXp} onChange={(event) => setHealthXp(Math.max(0, Number(event.target.value) || 0))} /></label>
          </div>
          <div className="combat-result-grid">
            <div><span>Training XP needed</span><strong>{number.format(combatXpNeeded)}</strong></div>
            <div><span>Kills needed</span><strong>{number.format(killsNeeded)}</strong></div>
            <div><span>Training time</span><strong>{formatTime(totalTrainingSeconds)}</strong></div>
            <div><span>Health level after</span><strong>{combatLevelForXp(resultingHealthXp)}</strong></div>
          </div>
          <div className="combat-breakdown">
            <div><strong>{selectedEnemy.name}</strong><span>Level {selectedEnemy.level} · {number.format(selectedEnemy.health)} health · defence {selectedEnemy.defence} · {selectedEnemy.location}</span><small>Documented total: {number.format(selectedEnemy.totalXp)} XP per kill</small></div>
            <dl><div><dt>Total XP per kill</dt><dd>{number.format(selectedEnemy.totalXp)}</dd></div><div><dt>Active skill (75%)</dt><dd>{number.format(Math.round(trainingXpPerKill))}</dd></div><div><dt>Health (25%)</dt><dd>{number.format(Math.round(healthXpPerKill))}</dd></div><div><dt>XP multiplier</dt><dd>{(selectedEnemy.totalXp / selectedEnemy.health).toFixed(2)}×</dd></div></dl>
          </div>
          <p className="calculator-note">The kill calculation uses exact 75% active-skill and 25% Health shares. Time includes the entered kill time plus travel or respawn time between kills; overkill, group scaling, and encounter-specific mechanics can still change live results.</p>
        </section>
      )}

      {tab === 'max-hit' && (
        <section className="calculator-card" aria-labelledby="max-hit-calculator-heading">
          <div className="calculator-heading"><div><p>Combat calculator</p><h2 id="max-hit-calculator-heading">Calculate your maximum hit</h2><span className="calculator-heading-help">Enter the four values shown on your character and weapon tooltips.</span></div></div>
          <div className="calculator-fields max-hit-fields">
            <label><span>Combat style</span><select value={combatStyle} onChange={(event) => setCombatStyle(event.target.value as CombatStyle)}><option>Melee</option><option>Archery</option><option>Magic</option></select></label>
            <label><span>{combatStyle} level</span><input type="number" min="1" max={MAX_LEVEL} value={damageLevel} onChange={(event) => setDamageLevel(clampLevel(Number(event.target.value)))} /></label>
            <label><span>Weapon damage</span><input type="number" min="0" value={weaponDamage} onChange={(event) => setWeaponDamage(Math.max(0, Number(event.target.value) || 0))} /></label>
            <label><span>Attack speed</span><input type="number" min="0.1" step="0.1" value={attackSpeed} onChange={(event) => setAttackSpeed(Math.max(0.1, Number(event.target.value) || 0.1))} /></label>
            <label><span>{combatStyle} power</span><input type="number" min="0" value={power} onChange={(event) => setPower(Math.max(0, Number(event.target.value) || 0))} /></label>
          </div>
          <div className="accuracy-result max-hit-result"><span>Maximum {combatStyle.toLowerCase()} hit</span><strong>{maxHit.maxHit.toFixed(1)}</strong><div><p>Effective level <b>{maxHit.effectiveLevel.toFixed(1)}</b></p><p>Weapon bonus <b>{maxHit.weaponDamageBonus.toFixed(1)}</b></p><p>Power bonus <b>{maxHit.flatDamageBonus.toFixed(1)}</b></p></div></div>
          <div className="formula-box"><h3>Formula used</h3><p><code>5 + ((level + 8) × 1.1 × (weapon damage + 30 + power ÷ 3 × attack speed)) ÷ 50</code></p></div>
          <p className="calculator-note">This formula is shared by melee, archery, and magic. Use the matching skill level and power stat for the selected combat style.</p>
        </section>
      )}

      {tab === 'accuracy' && (
        <section className="calculator-card" aria-labelledby="accuracy-calculator-heading">
          <div className="calculator-heading"><div><p>Combat calculator</p><h2 id="accuracy-calculator-heading">Compare accuracy and defence rolls</h2></div></div>
          <div className="roll-columns">
            <fieldset><legend>Attacker</legend><label><span>Attack level</span><input type="number" min="1" max={MAX_LEVEL} value={attackLevel} onChange={(event) => setAttackLevel(clampLevel(Number(event.target.value)))} /></label><label><span>Equipped accuracy</span><input type="number" min="0" value={accuracyBonus} onChange={(event) => setAccuracyBonus(Math.max(0, Number(event.target.value) || 0))} /></label></fieldset>
            <fieldset><legend>Defender</legend><label><span>Defence level</span><input type="number" min="1" max={MAX_LEVEL} value={defenceLevel} onChange={(event) => setDefenceLevel(clampLevel(Number(event.target.value)))} /></label><label><span>Equipped defence</span><input type="number" min="0" value={defenceBonus} onChange={(event) => setDefenceBonus(Math.max(0, Number(event.target.value) || 0))} /></label></fieldset>
          </div>
          <div className="accuracy-result"><span>Exact chance to hit</span><strong>{(hitChance * 100).toFixed(1)}%</strong><div><p>Maximum accuracy roll <b>{number.format(maxAccuracy)}</b></p><p>Maximum defence roll <b>{number.format(maxDefence)}</b></p></div></div>
          <div className="formula-box"><h3>Formulas used</h3><p><code>Max accuracy = (Attack level + 8) × (Equipped accuracy + 32)</code></p><p><code>Max defence = (Defence level + 8) × (Equipped defence + 32)</code></p><p><code>A &gt; D: 1 − (D + 2) ÷ (2 × (A + 1)); otherwise A ÷ (2 × (D + 1))</code></p></div>
          <p className="calculator-note">This is the exact probability for independent integer rolls from 0 through each displayed maximum, with a hit only when the accuracy roll is strictly greater. Potions, temporary effects, and special-attack modifiers must be included in the equipment values you enter.</p>
        </section>
      )}
    </div>
  );
}
