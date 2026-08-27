export function SiteHeader() {
  return (
    <>
      <div className="announcement">
        <span className="announcement-dot" />
        Built from direct game observations. Facts marked “engine verified” come from the ValenBridge.
        <a href="/about/data">How verification works</a>
      </div>
      <header className="topbar">
        <a className="brand" href="/" aria-label="The Valen Archives home">
          <span className="brand-seal" aria-hidden="true">VA</span>
          <span>
            <strong>The Valen Archives</strong>
            <small>A Winds of Valen player wiki</small>
          </span>
        </a>
        <nav className="primary-nav" aria-label="Primary navigation">
          <a href="/wiki">Explore</a>
          <a href="/wiki?type=items">Database</a>
          <a href="/wiki?type=guides">Guides</a>
          <a href="/recent">Recent changes</a>
        </nav>
        <a className="contribute-button" href="/contribute">Contribute</a>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            <a href="/wiki">Explore the wiki</a>
            <a href="/wiki?type=items">Items & database</a>
            <a href="/wiki?type=guides">Guides</a>
            <a href="/recent">Recent changes</a>
            <a href="/about/data">Verification</a>
            <a href="/contribute">Contribute</a>
          </nav>
        </details>
      </header>
    </>
  );
}
