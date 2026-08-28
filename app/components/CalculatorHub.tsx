'use client';

import { useMemo, useState } from 'react';
import { combatMultiplier, enemies, levelForXp, skillTrainingData, xpForLevel, type SkillName } from '../lib/calculator-data';
import { formatSmithingIngredients, smithingMaterialTotals, smithingRecipes, type SmithingStation } from '../lib/smithing-data';

type CalculatorTab = 'skill' | 'combat' | 'accuracy';
type SmithingStationFilter = 'All' | SmithingStation;

const number = new Intl.NumberFormat('en-US');

function clampLevel(value: number) {
  return Math.max(1, Math.min(99, Math.floor(value || 1)));
}

function clampTargetLevel(value: number) {
  return Math.max(2, Math.min(99, Math.floor(value || 2)));
}

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0s';
  const roundedSeconds = Math.ceil(totalSeconds);
  const days = Math.floor(roundedSeconds / 86400);
  const remainderAfterDays = roundedSeconds % 86400;
  const hours = Math.floor(remainderAfterDays / 3600);
  const remainderAfterHours = remainderAfterDays % 3600;
  const minutes = Math.floor(remainderAfterHours / 60);
  const seconds = remainderAfterHours % 60;
  return [days ? `${days}d` : '', hours ? `${hours}h` : '', minutes ? `${minutes}m` : '', seconds ? `${seconds}s` : ''].filter(Boolean).join(' ');
}

const smithingStations: SmithingStationFilter[] = ['All', 'Furnace', 'Anvil', 'Workbench'];

function smithingRecipeLabel(recipe: (typeof smithingRecipes)[number]) {
  const hasVariants = smithingRecipes.some((item) => item.slug !== recipe.slug && item.output === recipe.output);
  const variant = hasVariants ? ` (${recipe.ingredients.map((ingredient) => ingredient.item).join(' + ')})` : '';
  return `${recipe.output}${variant} · level ${recipe.level}`;
}

function LevelFields({ currentLevel, currentXp, targetLevel, onCurrentLevel, onCurrentXp, onTargetLevel }: {
  currentLevel: number;
  currentXp: number;
  targetLevel: number;
  onCurrentLevel: (value: number) => void;
  onCurrentXp: (value: number) => void;
  onTargetLevel: (value: number) => void;
}) {
  return (
    <div className="calculator-fields level-fields">
      <label><span>Current level</span><input type="number" min="1" max="99" value={currentLevel} onChange={(event) => { const level = clampLevel(Number(event.target.value)); onCurrentLevel(level); onCurrentXp(xpForLevel(level)); }} /></label>
      <label><span>Current total XP</span><input type="number" min="0" value={currentXp} onChange={(event) => { const xp = Math.max(0, Number(event.target.value) || 0); onCurrentXp(xp); onCurrentLevel(levelForXp(xp)); }} /></label>
      <label><span>Target level</span><input type="number" min="2" max="99" value={targetLevel} onChange={(event) => onTargetLevel(clampTargetLevel(Number(event.target.value)))} /></label>
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
  const skillResults = useMemo(() => skillTrainingData[skill].map((action) => ({
    ...action,
    xp: skill === 'Custom skill' ? customActionXp : action.xp,
    actions: (skill === 'Custom skill' ? customActionXp : action.xp) > 0 ? Math.ceil(xpNeeded / (skill === 'Custom skill' ? customActionXp : action.xp)) : 0,
    available: currentLevel >= action.level,
  })), [currentLevel, customActionXp, skill, xpNeeded]);

  const [smithingStation, setSmithingStation] = useState<SmithingStationFilter>('All');
  const [smithingQuery, setSmithingQuery] = useState('');
  const [selectedSmithingSlug, setSelectedSmithingSlug] = useState(smithingRecipes[0].slug);
  const smithingResults = useMemo(() => {
    const needle = smithingQuery.trim().toLowerCase();
    return smithingRecipes
      .filter((recipe) => smithingStation === 'All' || recipe.station === smithingStation)
      .filter((recipe) => !needle || recipe.output.toLowerCase().includes(needle) || recipe.station.toLowerCase().includes(needle))
      .map((recipe) => ({
        ...recipe,
        crafts: recipe.xp > 0 ? Math.ceil(xpNeeded / recipe.xp) : 0,
        available: currentLevel >= recipe.level,
      }));
  }, [currentLevel, smithingQuery, smithingStation, xpNeeded]);
  const selectedSmithingRecipe = smithingRecipes.find((recipe) => recipe.slug === selectedSmithingSlug) ?? smithingRecipes[0];
  const selectedSmithingCrafts = selectedSmithingRecipe.xp > 0 ? Math.ceil(xpNeeded / selectedSmithingRecipe.xp) : 0;
  const selectedSmithingOutput = selectedSmithingCrafts * selectedSmithingRecipe.outputQuantity;
  const selectedSmithingMaterials = smithingMaterialTotals(selectedSmithingRecipe, selectedSmithingCrafts);

  const [combatLevel, setCombatLevel] = useState(1);
  const [combatXp, setCombatXp] = useState(0);
  const [combatTarget, setCombatTarget] = useState(20);
  const [enemyName, setEnemyName] = useState(enemies[2].name);
  const [killTime, setKillTime] = useState(12);
  const [travelTime, setTravelTime] = useState(3);
  const [healthXp, setHealthXp] = useState(0);
  const selectedEnemy = enemies.find((enemy) => enemy.name === enemyName) ?? enemies[0];
  const combatXpNeeded = Math.max(0, xpForLevel(combatTarget) - combatXp);
  const totalXpPerKill = selectedEnemy.totalXp ?? Math.round(selectedEnemy.health * combatMultiplier(selectedEnemy.level));
  const trainingXpPerKill = totalXpPerKill * 0.75;
  const healthXpPerKill = totalXpPerKill * 0.25;
  const killsNeeded = trainingXpPerKill > 0 ? Math.ceil(combatXpNeeded / trainingXpPerKill) : 0;
  const totalTrainingSeconds = killsNeeded * Math.max(0, killTime) + Math.max(0, killsNeeded - 1) * Math.max(0, travelTime);
  const resultingHealthXp = healthXp + killsNeeded * healthXpPerKill;
  const effectiveXpMultiplier = selectedEnemy.health > 0 ? totalXpPerKill / selectedEnemy.health : 0;

  const [attackLevel, setAttackLevel] = useState(20);
  const [accuracyBonus, setAccuracyBonus] = useState(25);
  const [defenceLevel, setDefenceLevel] = useState(20);
  const [defenceBonus, setDefenceBonus] = useState(25);
  const maxAccuracy = Math.max(0, attackLevel + 8) * Math.max(0, accuracyBonus + 32);
  const maxDefence = Math.max(0, defenceLevel + 8) * Math.max(0, defenceBonus + 32);
  const hitChance = maxAccuracy > maxDefence
    ? 1 - (maxDefence + 2) / (2 * (maxAccuracy + 1))
    : maxAccuracy / (2 * (maxDefence + 1));

  return (
    <div className="calculator-hub">
      <div className="calculator-tabs" role="tablist" aria-label="Calculator type">
        <button type="button" role="tab" aria-selected={tab === 'skill'} onClick={() => setTab('skill')}>Skill planner</button>
        <button type="button" role="tab" aria-selected={tab === 'combat'} onClick={() => setTab('combat')}>Combat XP</button>
        <button type="button" role="tab" aria-selected={tab === 'accuracy'} onClick={() => setTab('accuracy')}>Accuracy &amp; defence</button>
      </div>

      {tab === 'skill' && (
        <section className="calculator-card" aria-labelledby="skill-calculator-heading">
          <div className="calculator-heading">
            <div><p>Skill calculator</p><h2 id="skill-calculator-heading">Plan a training goal</h2><span className="calculator-heading-help">Set your current XP and target level. Results update as you type.</span></div>
            <label className="skill-select"><span>Choose a skill</span><select value={skill} onChange={(event) => setSkill(event.target.value as SkillName)}>{Object.keys(skillTrainingData).map((name) => <option key={name}>{name}</option>)}</select></label>
          </div>
          <LevelFields currentLevel={currentLevel} currentXp={currentXp} targetLevel={targetLevel} onCurrentLevel={setCurrentLevel} onCurrentXp={setCurrentXp} onTargetLevel={setTargetLevel} />
          {skill === 'Custom skill' && <div className="custom-xp-field"><label><span>XP earned per action</span><input type="number" min="1" value={customActionXp} onChange={(event) => setCustomActionXp(Math.max(1, Number(event.target.value) || 1))} /></label><p>Use this for an activity whose XP per action you already know.</p></div>}
          <div className="calculator-summary">
            <div><span>Experience required</span><strong>{number.format(xpNeeded)}</strong></div>
            <p>Level {currentLevel} ({number.format(currentXp)} XP) → level {targetLevel} ({number.format(xpForLevel(targetLevel))} XP)</p>
          </div>

          {skill === 'Smithing' ? (
            <>
              <div className="smithing-plan-box">
                <div className="smithing-plan-heading"><div><p>Smithing planner</p><h3>Choose an item to make</h3></div><span className="smithing-plan-status">{selectedSmithingRecipe.station} · level {selectedSmithingRecipe.level}</span></div>
                <div className="smithing-plan-controls">
                  <label><span>Item</span><select value={selectedSmithingSlug} onChange={(event) => setSelectedSmithingSlug(event.target.value)}>{smithingRecipes.map((recipe) => <option value={recipe.slug} key={recipe.slug}>{smithingRecipeLabel(recipe)}</option>)}</select></label>
                  <div className="smithing-materials"><span>Materials per craft</span><strong>{formatSmithingIngredients(selectedSmithingRecipe)}</strong></div>
                </div>
                <div className="smithing-result-grid" aria-live="polite">
                  <div><span>XP per craft</span><strong>{number.format(selectedSmithingRecipe.xp)}</strong>{selectedSmithingRecipe.xpBasis === 'derived' && <small className="smithing-estimate-label">Estimated from ingredients</small>}</div>
                  <div><span>Crafts needed</span><strong>{number.format(selectedSmithingCrafts)}</strong></div>
                  <div><span>Items produced</span><strong>{number.format(selectedSmithingOutput)}</strong></div>
                  <div><span>Base time</span><strong>{formatTime(selectedSmithingCrafts * selectedSmithingRecipe.seconds)}</strong></div>
                </div>
                <div className="smithing-total-materials"><div><span>Total materials for this plan</span><small>Intermediate items are rolled up; inputs without a catalogue recipe stay listed as supplied.</small></div><ul>{selectedSmithingMaterials.length ? selectedSmithingMaterials.map((material) => <li key={material.item}><b>{number.format(material.quantity)}</b> {material.item}</li>) : <li>No crafts needed for this target.</li>}</ul></div>
                {currentLevel < selectedSmithingRecipe.level && <p className="smithing-lock-note">You need Smithing level {selectedSmithingRecipe.level} to make this item. It is shown so you can plan ahead.</p>}
              </div>

              <div className="smithing-list-heading"><div><h3>All smithable items</h3><p>XP shown is awarded per craft, not per ingredient.</p></div><strong>{smithingResults.length} of {smithingRecipes.length} recipes</strong></div>
              <div className="smithing-list-controls">
                <label className="smithing-filter-search"><span className="sr-only">Filter Smithing items</span><input value={smithingQuery} onChange={(event) => setSmithingQuery(event.target.value)} placeholder="Filter items…" /></label>
                <div className="smithing-station-tabs" role="tablist" aria-label="Smithing station"><span>Station</span>{smithingStations.map((station) => <button type="button" role="tab" aria-selected={smithingStation === station} onClick={() => setSmithingStation(station)} key={station}>{station}</button>)}</div>
              </div>
              <div className="calculator-table-wrap smithing-table-wrap"><table className="calculator-table smithing-table"><thead><tr><th>Item</th><th>Station</th><th>Level</th><th>XP / craft</th><th>Crafts needed</th><th>Materials</th></tr></thead><tbody>{smithingResults.map((recipe) => <tr className={`${recipe.available ? '' : 'locked'}${recipe.slug === selectedSmithingSlug ? ' selected' : ''}`} key={recipe.slug}><td><button type="button" className="smithing-item-button" onClick={() => setSelectedSmithingSlug(recipe.slug)} aria-label={`Plan ${recipe.output}`}><strong>{recipe.output}</strong><small>{recipe.outputQuantity > 1 ? `${recipe.outputQuantity} produced per craft` : '1 produced per craft'}</small></button></td><td>{recipe.station}</td><td>{recipe.level}</td><td><b>{number.format(recipe.xp)}</b>{recipe.xpBasis === 'derived' && <small>Estimated</small>}</td><td><b>{number.format(recipe.crafts)}</b>{!recipe.available && <small>Unlock at {recipe.level}</small>}</td><td>{formatSmithingIngredients(recipe)}</td></tr>)}</tbody></table></div>
              <p className="calculator-note">Core bar, armour, weapon, and glove XP comes from the published Smithing tables. Newer multi-stage recipes use the current ingredient chain and are marked <b>Estimated</b> until a direct in-game XP read is recorded.</p>
            </>
          ) : (
            <div className="calculator-table-wrap"><table className="calculator-table"><thead><tr><th>Training method</th><th>Level</th><th>XP each</th><th>Actions needed</th></tr></thead><tbody>{skillResults.map((action) => <tr className={action.available ? '' : 'locked'} key={action.name}><td><strong>{action.name}</strong>{action.note && <small>{action.note}</small>}</td><td>{action.level}</td><td>{number.format(action.xp)}</td><td><b>{number.format(action.actions)}</b>{!action.available && <small>Unlock at {action.level}</small>}</td></tr>)}</tbody></table></div>
          )}
        </section>
      )}

      {tab === 'combat' && (
        <section className="calculator-card" aria-labelledby="combat-calculator-heading">
          <div className="calculator-heading"><div><p>Combat calculator</p><h2 id="combat-calculator-heading">Estimate kills and training time</h2></div></div>
          <LevelFields currentLevel={combatLevel} currentXp={combatXp} targetLevel={combatTarget} onCurrentLevel={setCombatLevel} onCurrentXp={setCombatXp} onTargetLevel={setCombatTarget} />
          <div className="calculator-fields combat-fields">
            <label><span>Enemy</span><select value={enemyName} onChange={(event) => setEnemyName(event.target.value)}>{enemies.map((enemy) => <option value={enemy.name} key={enemy.name}>{enemy.name}{enemy.aliases?.[0] ? ` (${enemy.aliases[0]})` : ''} — level {enemy.level}</option>)}</select></label>
            <label><span>Seconds per kill</span><input type="number" min="1" value={killTime} onChange={(event) => setKillTime(Math.max(1, Number(event.target.value) || 1))} /></label>
            <label><span>Travel / respawn seconds</span><input type="number" min="0" value={travelTime} onChange={(event) => setTravelTime(Math.max(0, Number(event.target.value) || 0))} /></label>
            <label><span>Current Health XP</span><input type="number" min="0" value={healthXp} onChange={(event) => setHealthXp(Math.max(0, Number(event.target.value) || 0))} /></label>
          </div>
          <div className="combat-result-grid">
            <div><span>Training XP needed</span><strong>{number.format(combatXpNeeded)}</strong></div>
            <div><span>Estimated kills</span><strong>{number.format(killsNeeded)}</strong></div>
            <div><span>Estimated time</span><strong>{formatTime(totalTrainingSeconds)}</strong></div>
            <div><span>Health level after</span><strong>{levelForXp(resultingHealthXp)}</strong></div>
          </div>
          <div className="combat-breakdown">
            <div><strong>{selectedEnemy.name}</strong><span>Level {selectedEnemy.level} · {number.format(selectedEnemy.health)} health · {selectedEnemy.location}</span><small>{selectedEnemy.totalXp ? 'Documented XP total' : 'Full-health XP estimate'}</small></div>
            <dl><div><dt>Total XP per kill</dt><dd>{number.format(totalXpPerKill)}</dd></div><div><dt>Training share (75%)</dt><dd>{number.format(Math.round(trainingXpPerKill))}</dd></div><div><dt>Health share (25%)</dt><dd>{number.format(Math.round(healthXpPerKill))}</dd></div><div><dt>Effective XP multiplier</dt><dd>{effectiveXpMultiplier.toFixed(2)}×</dd></div></dl>
          </div>
          <p className="calculator-note">This estimate uses documented total XP per kill where available; otherwise it assumes damage equal to the enemy&apos;s full health and applies the level multiplier. XP is split 75% to the active combat skill and 25% to Health. Actual results can vary with overkill, group scaling, or encounter mechanics.</p>
        </section>
      )}

      {tab === 'accuracy' && (
        <section className="calculator-card" aria-labelledby="accuracy-calculator-heading">
          <div className="calculator-heading"><div><p>Combat calculator</p><h2 id="accuracy-calculator-heading">Compare accuracy and defence rolls</h2></div></div>
          <div className="roll-columns">
            <fieldset><legend>Attacker</legend><label><span>Attack level</span><input type="number" min="1" max="200" value={attackLevel} onChange={(event) => setAttackLevel(Math.max(1, Number(event.target.value) || 1))} /></label><label><span>Equipped accuracy</span><input type="number" min="0" value={accuracyBonus} onChange={(event) => setAccuracyBonus(Math.max(0, Number(event.target.value) || 0))} /></label></fieldset>
            <fieldset><legend>Defender</legend><label><span>Defence level</span><input type="number" min="1" max="200" value={defenceLevel} onChange={(event) => setDefenceLevel(Math.max(1, Number(event.target.value) || 1))} /></label><label><span>Equipped defence</span><input type="number" min="0" value={defenceBonus} onChange={(event) => setDefenceBonus(Math.max(0, Number(event.target.value) || 0))} /></label></fieldset>
          </div>
          <div className="accuracy-result"><span>Estimated chance to hit</span><strong>{(Math.max(0, Math.min(1, hitChance)) * 100).toFixed(1)}%</strong><div><p>Maximum accuracy roll <b>{number.format(maxAccuracy)}</b></p><p>Maximum defence roll <b>{number.format(maxDefence)}</b></p></div></div>
          <div className="formula-box"><h3>Formulas used</h3><p><code>Max accuracy = (Attack level + 8) × (Equipped accuracy + 32)</code></p><p><code>Max defence = (Defence level + 8) × (Equipped defence + 32)</code></p></div>
          <p className="calculator-note">This tool compares the documented roll model. It does not include every potion, temporary effect, enemy-specific modifier, or special attack.</p>
        </section>
      )}
    </div>
  );
}
