export function SiteFooter() {
  return (
    <footer>
      <div>
        <span className="brand-seal small" aria-hidden="true">VA</span>
        <p><strong>The Valen Archives</strong><br />Independent, player-maintained knowledge for Winds of Valen.</p>
      </div>
      <nav className="footer-links" aria-label="Footer navigation">
        <a href="/wiki">All pages</a>
        <a href="/about/data">Data policy</a>
        <a href="/contribute">Contribute</a>
      </nav>
      <p>Game data and community notes stay clearly labelled. No private character data is published.</p>
    </footer>
  );
}
