import type { Metadata } from 'next';
import Link from 'next/link';
import { CombatLevelCalculator } from '../../components/CombatLevelCalculator';

export const metadata: Metadata = {
  title: 'Combat Level Calculator',
  description: 'Calculate an estimated Winds of Valen combat level from your offensive, defensive, and Health levels.',
};

export default function CombatLevelCalculatorPage() {
  return (
    <main className="calculator-page classic-content-page combat-level-page">
      <div className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href="/calculators">Calculators</Link><span>/</span><span>Combat level</span></div>
      <header className="classic-page-heading">
        <p>Combat tools</p>
        <h1>Combat Level Calculator</h1>
        <span>Calculate your overall combat level separately from skill training, combat XP, and accuracy planning.</span>
      </header>
      <CombatLevelCalculator />
    </main>
  );
}
