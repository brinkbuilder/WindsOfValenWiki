import Link from 'next/link';
import { ASK_AGENT_NAME } from '../lib/ask-agent';

export function SiteFooter() {
  return (
    <footer>
      <div>
        <span className="brand-seal small valen-mark" aria-hidden="true" />
        <p><strong>Winds of Valen Wiki</strong><br />One practical encyclopedia for the whole community.</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link href="/wiki">All pages</Link>
        <Link href="/ask">{ASK_AGENT_NAME}</Link>
        <Link href="/calculators">Calculators</Link>
        <Link href="/calculators/combat-level">Combat level</Link>
        <Link href="/contribute">Contribute</Link>
        <Link href="/sources">Sources</Link>
        <Link href="/about/data">About</Link>
      </nav>
      <p>Game information, guides, and tools collected in one place for players.</p>
    </footer>
  );
}
