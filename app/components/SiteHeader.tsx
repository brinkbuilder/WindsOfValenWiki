import Link from 'next/link';

export function SiteHeader() {
  return (
    <>
      <div className="announcement">
        <span className="announcement-dot" />
        Bridge evidence and attributed community sources stay clearly separated.
        <Link href="/about/data">How verification works</Link>
      </div>
      <header className="topbar">
        <Link className="brand" href="/" aria-label="The Valen Archives home">
          <span className="brand-seal" aria-hidden="true">VA</span>
          <span>
            <strong>The Valen Archives</strong>
            <small>A Winds of Valen player wiki</small>
          </span>
        </Link>
        <nav className="primary-nav" aria-label="Primary navigation">
          <Link href="/wiki">Explore</Link>
          <Link href="/wiki?type=items">Database</Link>
          <Link href="/wiki?type=guides">Guides</Link>
          <Link href="/sources">Sources</Link>
          <Link href="/recent">Recent changes</Link>
        </nav>
        <Link className="contribute-button" href="/contribute">Contribute</Link>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            <Link href="/wiki">Explore the wiki</Link>
            <Link href="/wiki?type=items">Items & database</Link>
            <Link href="/wiki?type=guides">Guides</Link>
            <Link href="/recent">Recent changes</Link>
            <Link href="/sources">Source library</Link>
            <Link href="/about/data">Verification</Link>
            <Link href="/contribute">Contribute</Link>
          </nav>
        </details>
      </header>
    </>
  );
}
