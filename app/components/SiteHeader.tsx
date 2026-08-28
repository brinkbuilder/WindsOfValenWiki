import Link from 'next/link';

export function SiteHeader() {
  return (
      <header className="topbar unified-topbar wiki-rail">
        <Link className="brand rail-brand" href="/" aria-label="Winds of Valen Wiki home">
          <span className="brand-seal valen-mark" aria-hidden="true" />
          <span>
            <strong>Winds of Valen</strong>
            <small>Player Wiki</small>
          </span>
        </Link>
        <form className="header-search" action="/search" role="search">
          <label className="sr-only" htmlFor="header-wiki-search">Search the wiki</label>
          <input id="header-wiki-search" name="q" placeholder="Search the wiki…" />
          <button type="submit" aria-label="Search">Search</button>
        </form>
        <nav className="primary-nav rail-navigation" aria-label="Primary navigation">
          <div className="rail-section">
            <strong>Navigation</strong>
            <Link href="/">Main page</Link>
            <Link href="/wiki">All pages</Link>
            <Link href="/calculators">Calculators</Link>
            <Link href="/recent">Recent updates</Link>
          </div>
          <div className="rail-section">
            <strong>Player guides</strong>
            <Link href="/wiki?type=guides">Getting started</Link>
            <Link href="/wiki?type=guides">All skills</Link>
            <Link href="/wiki?type=quests">All quests</Link>
            <Link href="/wiki?type=items">Item database</Link>
            <Link href="/wiki?type=world">Creatures &amp; regions</Link>
            <Link href="/wiki/combat-mechanics">Combat guide</Link>
          </div>
          <div className="rail-section">
            <strong>Popular pages</strong>
            <Link href="/wiki/attack">Attack</Link>
            <Link href="/wiki/mining">Mining</Link>
            <Link href="/wiki/fishing">Fishing</Link>
            <Link href="/wiki/potion-making">Potion Making</Link>
            <Link href="/wiki/open-the-gates">Open The Gates</Link>
          </div>
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            <Link href="/">Main page</Link>
            <Link href="/wiki">All pages</Link>
            <Link href="/calculators">Calculators</Link>
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
