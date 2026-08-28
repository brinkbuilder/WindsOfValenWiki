import type { Metadata } from 'next';
import Link from 'next/link';
import { CalculatorHub } from '../components/CalculatorHub';
import { skillTrainingData, type SkillName } from '../lib/calculator-data';

export const metadata: Metadata = {
  title: 'Calculators',
  description: 'Winds of Valen skill, combat experience, accuracy, and defence calculators.',
};

export default async function CalculatorsPage({ searchParams }: { searchParams: Promise<{ tab?: string | string[]; skill?: string | string[] }> }) {
  const params = await searchParams;
  const rawTab = Array.isArray(params.tab) ? params.tab[0] : params.tab;
  const rawSkill = Array.isArray(params.skill) ? params.skill[0] : params.skill;
  const initialSkill = Object.keys(skillTrainingData).includes(rawSkill ?? '') ? rawSkill as SkillName : 'Mining';
  const initialTab = rawTab === 'combat' || rawTab === 'accuracy' ? rawTab : 'skill';
  return (
    <main className="calculator-page classic-content-page">
      <div className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Calculators</span></div>
      <header className="classic-page-heading">
        <p>Player tools</p>
        <h1>Winds of Valen calculators</h1>
        <span>Plan skill levels, compare training methods, estimate combat experience, and check accuracy against defence.</span>
      </header>
      <CalculatorHub initialTab={initialTab} initialSkill={initialSkill} />
    </main>
  );
}
