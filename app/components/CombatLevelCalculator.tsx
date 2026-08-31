'use client';

import { useState } from 'react';

type CombatStats = {
  attack: number;
  archery: number;
  magic: number;
  defence: number;
  evasion: number;
  warding: number;
  health: number;
};

const defaultStats: CombatStats = {
  attack: 1,
  archery: 1,
  magic: 1,
  defence: 1,
  evasion: 1,
  warding: 1,
  health: 1,
};

function levelValue(value: string) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Math.max(1, Math.min(100, Math.floor(parsed))) : 1;
}

export function CombatLevelCalculator() {
  const [stats, setStats] = useState<CombatStats>(defaultStats);
  const highestOffense = Math.max(stats.attack, stats.archery, stats.magic);
  const highestDefense = Math.max(stats.defence, stats.evasion, stats.warding);
  const healthContribution = (stats.health - 1) * 0.25;
  const combatLevel = (highestOffense * 0.5) + (highestDefense * 0.5) + healthContribution;

  const updateStat = (stat: keyof CombatStats, value: string) => {
    setStats((current) => ({ ...current, [stat]: levelValue(value) }));
  };

  return (
    <section className="calculator-card combat-level-calculator" aria-labelledby="combat-level-calculator-heading">
      <div className="calculator-heading">
        <div>
          <p>Combat level tool</p>
          <h2 id="combat-level-calculator-heading">Calculate your combat level</h2>
          <span className="calculator-heading-help">Enter your current skill levels. The highest offensive and defensive skills determine the core level.</span>
        </div>
        <button className="calculator-reset-button" type="button" onClick={() => setStats(defaultStats)}>Reset levels</button>
      </div>

      <div className="combat-level-layout">
        <div className="combat-level-inputs">
          <fieldset>
            <legend>Offensive skills</legend>
            <label htmlFor="combat-level-attack"><span>Attack</span><input id="combat-level-attack" type="number" min="1" max="100" value={stats.attack} onChange={(event) => updateStat('attack', event.target.value)} /></label>
            <label htmlFor="combat-level-archery"><span>Archery / range</span><input id="combat-level-archery" type="number" min="1" max="100" value={stats.archery} onChange={(event) => updateStat('archery', event.target.value)} /></label>
            <label htmlFor="combat-level-magic"><span>Magic</span><input id="combat-level-magic" type="number" min="1" max="100" value={stats.magic} onChange={(event) => updateStat('magic', event.target.value)} /></label>
          </fieldset>
          <fieldset>
            <legend>Defensive skills</legend>
            <label htmlFor="combat-level-defence"><span>Defence</span><input id="combat-level-defence" type="number" min="1" max="100" value={stats.defence} onChange={(event) => updateStat('defence', event.target.value)} /></label>
            <label htmlFor="combat-level-evasion"><span>Evasion</span><input id="combat-level-evasion" type="number" min="1" max="100" value={stats.evasion} onChange={(event) => updateStat('evasion', event.target.value)} /></label>
            <label htmlFor="combat-level-warding"><span>Warding</span><input id="combat-level-warding" type="number" min="1" max="100" value={stats.warding} onChange={(event) => updateStat('warding', event.target.value)} /></label>
          </fieldset>
          <fieldset className="combat-level-health-fieldset">
            <legend>Health</legend>
            <label htmlFor="combat-level-health"><span>Health level</span><input id="combat-level-health" type="number" min="1" max="100" value={stats.health} onChange={(event) => updateStat('health', event.target.value)} /></label>
            <p>Each Health level above 1 adds 0.25 to the result.</p>
          </fieldset>
        </div>

        <div className="combat-level-result" aria-live="polite">
          <span>Formula result</span>
          <strong>{combatLevel.toFixed(2)}</strong>
          <p>Based on the highest offensive level of <b>{highestOffense}</b> and defensive level of <b>{highestDefense}</b>.</p>
          <dl className="combat-level-breakdown">
            <div><dt>Offensive contribution</dt><dd>{(highestOffense * 0.5).toFixed(2)}</dd></div>
            <div><dt>Defensive contribution</dt><dd>{(highestDefense * 0.5).toFixed(2)}</dd></div>
            <div><dt>Health contribution</dt><dd>{healthContribution.toFixed(2)}</dd></div>
          </dl>
        </div>
      </div>

      <p className="calculator-note">This follows the supplied formula: highest offense × 0.5 + highest defence × 0.5 + (Health − 1) × 0.25. The exact formula result is displayed to two decimal places; the game&apos;s displayed rounding convention has not been separately confirmed.</p>
      <p className="calculator-credit">Combat Level Calculator by <strong>Simpuhl</strong>.</p>
    </section>
  );
}
