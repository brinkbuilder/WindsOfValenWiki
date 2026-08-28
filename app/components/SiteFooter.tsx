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
        <Link href="/sources">Community guides</Link>
        <Link href="/about/data">About</Link>
        <Link href="/contribute">Contribute</Link>
      </nav>
      <p>Built by the Winds of Valen community to help players spend less time searching and more time adventuring.</p>
    </footer>
  );
}
