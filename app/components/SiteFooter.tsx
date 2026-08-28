import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer>
      <div>
        <span className="brand-seal small" aria-hidden="true">VA</span>
        <p><strong>The Valen Archives</strong><br />Independent, player-maintained knowledge for Winds of Valen.</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <Link href="/wiki">All pages</Link>
        <Link href="/sources">Source library</Link>
        <Link href="/about/data">Data policy</Link>
        <Link href="/contribute">Contribute</Link>
      </nav>
      <p>Game data and community notes stay clearly labelled. No private character data is published.</p>
    </footer>
  );
}
