import type { Metadata } from 'next';
import Link from 'next/link';
import { CalculatorHub } from '../components/CalculatorHub';
import { skillTrainingData, type SkillName } from '../lib/calculator-data';

export const metadata: Metadata = {
  title: 'Calculators',
  description: 'Winds of Valen skill, Potion Making batch, Smithing material, combat experience, max hit, accuracy, and defence calculators.',
};

export default async function CalculatorsPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[]; skill?: string | string[] }> }) {
  const params = await searchParams;
  const rawTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const rawSkill = Array.isArray(params.skill) ? params.skill[0] : params.skill;
  const initialSkill = Object.keys(skillTrainingData).includes(rawSkill ?? '') ? rawSkill as SkillName : 'Mining';
  const initialTab = rawTab === 'combat' || rawTab === 'accuracy' || rawTab === 'max-hit' ? rawTab : 'skill';
  return (
    <main className="calculator-page classic-content-page">
      <div className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Calculators</span></div>
      <header className="classic-page-heading">
        <p>Player tools</p>
        <h1>Winds of Valen calculators</h1>
        <span>Plan level 100 goals, complete potion batches, Smithing materials, combat experience, maximum hits, and accuracy against defence.</span>
      </header>
      <Link className="standalone-calculator-link" href="/calculators/combat-level"><span>Separate combat tool</span><strong>Combat Level Calculator</strong><p>Combine your highest offensive, defensive, and Health levels into one overall combat level.</p><b>Open calculator →</b></Link>
      <CalculatorHub initialTab={initialTab} initialSkill={initialSkill} />
    </main>
  );
}
