import Link from 'next/link';

export function SiteHeader() {
  return (
      <header className="topbar unified-topbar">
        <Link className="brand" href="/" aria-label="The Valen Archives home">
          <span className="brand-seal" aria-hidden="true">VA</span>
          <span>
            <strong>The Valen Archives</strong>
            <small>Winds of Valen Wiki</small>
          </span>
        </Link>
        <form className="header-search" action="/search" role="search">
          <label className="sr-only" htmlFor="header-wiki-search">Search the wiki</label>
          <input id="header-wiki-search" name="q" placeholder="Search the wiki…" />
          <button type="submit" aria-label="Search">Search</button>
        </form>
        <nav className="primary-nav" aria-label="Primary navigation">
          <Link href="/wiki">All pages</Link>
          <Link href="/wiki?type=items">Items</Link>
          <Link href="/wiki?type=guides">Guides</Link>
          <Link href="/wiki?type=world">World</Link>
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            <Link href="/wiki">All pages</Link>
            <Link href="/wiki?type=items">Items</Link>
            <Link href="/wiki?type=guides">Guides</Link>
            <Link href="/wiki?type=world">Creatures & places</Link>
            <Link href="/recent">Recent changes</Link>
            <Link href="/about/data">About the wiki</Link>
            <Link href="/contribute">Contribute</Link>
          </nav>
        </details>
      </header>
  );
}
