'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  defaultSmithingMaterialOptions,
  smithingItemSlug,
  smithingQueuePlan,
  smithingRecipes,
  type SmithingMaterialOptions,
  type SmithingQueueTarget,
  type SmithingStation,
} from '../lib/smithing-data';

const number = new Intl.NumberFormat('en-US');
const storageKey = 'valen-crafting-queue-v1';

const gearPresets: Record<string, SmithingQueueTarget[]> = {
  Bronze: ['bronze-sword', 'bronze-platelegs', 'bronze-platebody', 'bronze-helmet'].map((slug) => ({ slug, quantity: 1 })),
  Iron: ['iron-sword', 'iron-platelegs', 'iron-platebody', 'iron-helmet'].map((slug) => ({ slug, quantity: 1 })),
  Steel: ['steel-sword', 'steel-platelegs', 'steel-platebody', 'steel-helmet'].map((slug) => ({ slug, quantity: 1 })),
  Mithril: ['mithril-sword', 'mithril-platelegs', 'mithril-platebody', 'mithril-helmet'].map((slug) => ({ slug, quantity: 1 })),
  'Dusk Knight': ['dusk-knight-boots', 'dusk-knight-platelegs', 'dusk-knight-platebody', 'dusk-knight-helmet'].map((slug) => ({ slug, quantity: 1 })),
};

const stationMarks: Record<SmithingStation, string> = {
  Furnace: '◆',
  Anvil: '⚒',
  Workbench: '✦',
};

function formatTime(totalSeconds: number) {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) return '0s';
  const roundedSeconds = Math.ceil(totalSeconds);
  const hours = Math.floor(roundedSeconds / 3600);
  const minutes = Math.floor((roundedSeconds % 3600) / 60);
  const seconds = roundedSeconds % 60;
  return [hours ? `${hours}h` : '', minutes ? `${minutes}m` : '', seconds ? `${seconds}s` : ''].filter(Boolean).join(' ');
}

function recipeForSlug(slug: string) {
  return smithingRecipes.find((recipe) => recipe.slug === slug);
}

function safeTargets(value: unknown): SmithingQueueTarget[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') return [];
    const slug = 'slug' in entry && typeof entry.slug === 'string' ? entry.slug : '';
    const quantity = 'quantity' in entry && typeof entry.quantity === 'number' ? Math.max(1, Math.floor(entry.quantity)) : 1;
    return recipeForSlug(slug) ? [{ slug, quantity }] : [];
  });
}

export function CraftingQueuePlanner() {
  const [queue, setQueue] = useState<SmithingQueueTarget[]>([{ slug: 'dusk-knight-helmet', quantity: 1 }]);
  const [selectedSlug, setSelectedSlug] = useState('dusk-knight-helmet');
  const [addQuantity, setAddQuantity] = useState(1);
  const [materialOptions, setMaterialOptions] = useState<SmithingMaterialOptions>(defaultSmithingMaterialOptions);
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [restored, setRestored] = useState(false);
  const [copyLabel, setCopyLabel] = useState('Copy plan');

  useEffect(() => {
    const restoreTimer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved) as { queue?: unknown; materialOptions?: Partial<SmithingMaterialOptions>; completed?: unknown };
          const savedQueue = safeTargets(parsed.queue);
          if (savedQueue.length) setQueue(savedQueue);
          if (parsed.materialOptions) {
            setMaterialOptions({
              ironSource: parsed.materialOptions.ironSource === 'dust' ? 'dust' : 'ore',
              coalSource: parsed.materialOptions.coalSource === 'dust' ? 'dust' : 'ore',
              goldSource: parsed.materialOptions.goldSource === 'dust' ? 'dust' : 'ore',
              ebonySource: parsed.materialOptions.ebonySource === 'ore' ? 'ore' : 'dust',
            });
          }
          if (Array.isArray(parsed.completed)) setCompleted(new Set(parsed.completed.filter((item): item is string => typeof item === 'string')));
        }
      } catch {
        localStorage.removeItem(storageKey);
      } finally {
        setRestored(true);
      }
    }, 0);
    return () => window.clearTimeout(restoreTimer);
  }, []);

  useEffect(() => {
    if (!restored) return;
    localStorage.setItem(storageKey, JSON.stringify({ queue, materialOptions, completed: [...completed] }));
  }, [completed, materialOptions, queue, restored]);

  const plan = useMemo(() => smithingQueuePlan(queue, materialOptions), [materialOptions, queue]);
  const queueItems = queue.flatMap((target) => {
    const recipe = recipeForSlug(target.slug);
    return recipe ? [{ ...target, recipe }] : [];
  });
  const checklistKeys = [
    ...plan.rawMaterials.map((item) => `material:${item.item}`),
    ...plan.reusableRequirements.map((item) => `reusable:${item.item}`),
    ...plan.steps.map((step) => `step:${step.slug}`),
  ];
  const completedCount = checklistKeys.filter((key) => completed.has(key)).length;
  const progress = checklistKeys.length ? Math.round((completedCount / checklistKeys.length) * 100) : 0;
  const plannedItems = queue.reduce((total, item) => total + item.quantity, 0);

  const setSource = <K extends keyof SmithingMaterialOptions>(key: K, value: SmithingMaterialOptions[K]) => {
    setMaterialOptions((current) => ({ ...current, [key]: value }));
  };

  const addToQueue = () => {
    setQueue((current) => {
      const existing = current.find((item) => item.slug === selectedSlug);
      if (existing) return current.map((item) => item.slug === selectedSlug ? { ...item, quantity: item.quantity + addQuantity } : item);
      return [...current, { slug: selectedSlug, quantity: addQuantity }];
    });
  };

  const updateQuantity = (slug: string, quantity: number) => {
    setQueue((current) => current.map((item) => item.slug === slug ? { ...item, quantity: Math.max(1, Math.floor(quantity || 1)) } : item));
  };

  const toggleComplete = (key: string) => {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const planText = () => {
    const lines = ['WINDS OF VALEN CRAFTING PLAN', '', 'TARGETS'];
    queueItems.forEach(({ quantity, recipe }) => lines.push(`- ${quantity} × ${recipe.output}`));
    lines.push('', 'RAW MATERIALS');
    plan.rawMaterials.forEach((item) => lines.push(`- ${number.format(item.quantity)} × ${item.item}`));
    if (plan.reusableRequirements.length) {
      lines.push('', 'REUSABLE REQUIREMENTS');
      plan.reusableRequirements.forEach((item) => lines.push(`- ${item.item}`));
    }
    lines.push('', 'CRAFTING ORDER');
    plan.steps.forEach((step, index) => lines.push(`${index + 1}. ${step.station}: ${number.format(step.crafts)} craft${step.crafts === 1 ? '' : 's'} → ${number.format(step.crafts * step.outputQuantity)} × ${step.output} (${formatTime(step.totalSeconds)})`));
    lines.push('', `TOTAL ACTIVE CRAFTING TIME: ${formatTime(plan.totalSeconds)}`, `CONFIRMED CRAFTING XP: ${number.format(plan.confirmedXp)}${plan.hasUnconfirmedXp ? ' + unconfirmed recipe XP' : ''}`);
    return lines.join('\n');
  };

  const copyPlan = async () => {
    await navigator.clipboard.writeText(planText());
    setCopyLabel('Copied!');
    window.setTimeout(() => setCopyLabel('Copy plan'), 1600);
  };

  const downloadPlan = () => {
    const url = URL.createObjectURL(new Blob([planText()], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'winds-of-valen-crafting-plan.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="crafting-queue-planner" aria-labelledby="crafting-queue-heading">
      <header className="crafting-queue-heading">
        <div>
          <p>Multi-item Smithing calculator</p>
          <h2 id="crafting-queue-heading">Build one complete crafting list</h2>
          <span>Queue several items or load an armour preset. The planner combines shared components before rounding, then works back to raw ore, dust, cloth, leather, and special drops.</span>
        </div>
        <div className="crafting-progress-orb" aria-label={`${progress}% of checklist complete`}><strong>{progress}%</strong><span>ready</span></div>
      </header>

      <div className="crafting-progress-track" aria-hidden="true"><span style={{ width: `${progress}%` }} /></div>

      <div className="crafting-control-deck">
        <div className="crafting-add-row">
          <label><span>Item or component</span><select value={selectedSlug} onChange={(event) => setSelectedSlug(event.target.value)}>{[...smithingRecipes].sort((a, b) => a.output.localeCompare(b.output)).map((recipe) => <option value={recipe.slug} key={recipe.slug}>{recipe.output} · level {recipe.level}</option>)}</select></label>
          <label className="crafting-add-quantity"><span>Quantity</span><input type="number" min="1" value={addQuantity} onChange={(event) => setAddQuantity(Math.max(1, Math.floor(Number(event.target.value) || 1)))} /></label>
          <button className="crafting-primary-button" type="button" onClick={addToQueue}>Add to list</button>
        </div>
        <div className="crafting-presets"><span>Quick sets</span>{Object.entries(gearPresets).map(([name, items]) => <button type="button" key={name} onClick={() => { setQueue(items); setCompleted(new Set()); }}>{name}</button>)}</div>
      </div>

      <div className="crafting-workspace">
        <aside className="crafting-queue-panel">
          <div className="crafting-panel-title"><div><span>Your list</span><strong>{plannedItems} finished item{plannedItems === 1 ? '' : 's'}</strong></div>{queue.length > 0 && <button type="button" onClick={() => { setQueue([]); setCompleted(new Set()); }}>Clear</button>}</div>
          <div className="crafting-queue-list">
            {queueItems.length ? queueItems.map(({ slug, quantity, recipe }) => (
              <div className="crafting-queue-item" key={slug}>
                <div><Link href={`/wiki/${smithingItemSlug(recipe.output)}`}>{recipe.output}</Link><span>{recipe.station} · level {recipe.level}</span></div>
                <label><span className="sr-only">Quantity of {recipe.output}</span><input type="number" min="1" value={quantity} onChange={(event) => updateQuantity(slug, Number(event.target.value))} /></label>
                <button type="button" aria-label={`Remove ${recipe.output}`} onClick={() => setQueue((current) => current.filter((item) => item.slug !== slug))}>×</button>
              </div>
            )) : <div className="crafting-empty-state"><strong>Your list is empty</strong><span>Add an item above or choose a quick set.</span></div>}
          </div>

          <div className="crafting-source-options">
            <strong>Choose raw sources</strong>
            <label><span>Iron bars</span><select value={materialOptions.ironSource} onChange={(event) => setSource('ironSource', event.target.value as SmithingMaterialOptions['ironSource'])}><option value="ore">Iron Ore</option><option value="dust">Iron Dust</option></select></label>
            <label><span>Coal</span><select value={materialOptions.coalSource} onChange={(event) => setSource('coalSource', event.target.value as SmithingMaterialOptions['coalSource'])}><option value="ore">Coal Ore</option><option value="dust">Coal Dust</option></select></label>
            <label><span>Gold bars</span><select value={materialOptions.goldSource} onChange={(event) => setSource('goldSource', event.target.value as SmithingMaterialOptions['goldSource'])}><option value="ore">Gold Ore</option><option value="dust">Gold Dust</option></select></label>
            <label><span>Ebony bars</span><select value={materialOptions.ebonySource} onChange={(event) => setSource('ebonySource', event.target.value as SmithingMaterialOptions['ebonySource'])}><option value="dust">Ebony Dust</option><option value="ore">Ebony Ore</option></select></label>
          </div>

          <div className="crafting-plan-actions"><button type="button" onClick={copyPlan} disabled={!queue.length}>{copyLabel}</button><button type="button" onClick={downloadPlan} disabled={!queue.length}>Download</button></div>
        </aside>

        <div className="crafting-results" aria-live="polite">
          <div className="crafting-result-ribbon">
            <div><span>Raw resources</span><strong>{number.format(plan.rawMaterials.reduce((total, item) => total + item.quantity, 0))}</strong></div>
            <div><span>Crafting steps</span><strong>{number.format(plan.steps.length)}</strong></div>
            <div><span>Active time</span><strong>{formatTime(plan.totalSeconds)}</strong></div>
            <div><span>Confirmed XP</span><strong>{number.format(plan.confirmedXp)}</strong>{plan.hasUnconfirmedXp && <small>plus unconfirmed XP</small>}</div>
          </div>

          <section className="crafting-material-section">
            <div className="crafting-section-heading"><div><span>Gather first</span><h3>Raw-material checklist</h3></div><b>{plan.rawMaterials.length + plan.reusableRequirements.length} types</b></div>
            <div className="crafting-material-grid">
              {plan.rawMaterials.map((item) => {
                const key = `material:${item.item}`;
                return <div className={`crafting-material-item${completed.has(key) ? ' complete' : ''}`} key={item.item}><button className="crafting-material-check" type="button" aria-label={`Mark ${item.item} ${completed.has(key) ? 'not ready' : 'ready'}`} onClick={() => toggleComplete(key)}>{completed.has(key) ? '✓' : ''}</button><span><Link href={`/wiki/${smithingItemSlug(item.item)}`}>{item.item}</Link><small>Raw resource</small></span><strong>{number.format(item.quantity)}</strong></div>;
              })}
              {plan.reusableRequirements.map((item) => {
                const key = `reusable:${item.item}`;
                return <div className={`crafting-material-item reusable${completed.has(key) ? ' complete' : ''}`} key={item.item}><button className="crafting-material-check" type="button" aria-label={`Mark ${item.item} ${completed.has(key) ? 'not ready' : 'ready'}`} onClick={() => toggleComplete(key)}>{completed.has(key) ? '✓' : ''}</button><span><Link href={`/wiki/${smithingItemSlug(item.item)}`}>{item.item}</Link><small>Reusable — only one needed</small></span><strong>{item.quantity}</strong></div>;
              })}
              {!plan.rawMaterials.length && !plan.reusableRequirements.length && <div className="crafting-empty-state"><strong>No materials yet</strong><span>Add something to your crafting list to calculate its requirements.</span></div>}
            </div>
          </section>

          <section className="crafting-roadmap-section">
            <div className="crafting-section-heading"><div><span>Build in this order</span><h3>Station roadmap</h3></div><b>{formatTime(plan.totalSeconds)}</b></div>
            <ol className="crafting-roadmap">
              {plan.steps.map((step, index) => {
                const key = `step:${step.slug}`;
                return (
                  <li className={completed.has(key) ? 'complete' : ''} key={step.slug}>
                    <button type="button" className="crafting-step-check" aria-label={`Mark ${step.output} ${completed.has(key) ? 'not complete' : 'complete'}`} onClick={() => toggleComplete(key)}>{completed.has(key) ? '✓' : index + 1}</button>
                    <div className="crafting-station-mark" aria-hidden="true">{stationMarks[step.station]}</div>
                    <div className="crafting-step-copy"><span>{step.station} · level {step.level}</span><Link href={`/wiki/${smithingItemSlug(step.output)}`}>{number.format(step.crafts * step.outputQuantity)} × {step.output}</Link><small>{step.inputs.map((input) => `${number.format(input.quantity)} ${input.item}`).join(' + ')}</small></div>
                    <div className="crafting-step-total"><strong>{step.crafts}</strong><span>craft{step.crafts === 1 ? '' : 's'}</span><small>{formatTime(step.totalSeconds)}</small></div>
                  </li>
                );
              })}
              {!plan.steps.length && <li className="crafting-empty-state"><strong>No roadmap yet</strong><span>Your ordered station plan will appear here.</span></li>}
            </ol>
          </section>
        </div>
      </div>

      <p className="crafting-planner-note">Times use current base crafting durations and assume sequential actions with no travel, menu delay, failures, or speed bonuses. Your list and checklist are saved only in this browser.</p>
      <p className="crafting-planner-credit">Planner concept adapted for The Valen Archives from <a href="https://sullear68.github.io/wovcalc/" target="_blank" rel="noreferrer">Sullear68’s community crafting calculator</a>; calculations use the wiki’s current Smithing data.</p>
    </section>
  );
}
