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
            <Link href="/">Home</Link>
            <Link href="/wiki">Browse all pages</Link>
            <Link href="/calculators">Calculators</Link>
            <Link href="/calculators/combat-level">Combat level</Link>
            <Link href="/sources">Source library</Link>
            <Link href="/recent">Recent updates</Link>
          </div>
          <div className="rail-section">
            <strong>Player guides</strong>
            <Link href="/wiki/controls">New player basics</Link>
            <Link href="/wiki?type=guides">Skills &amp; training</Link>
            <Link href="/wiki?type=quests">Quest guides</Link>
            <Link href="/wiki?type=items">Items &amp; equipment</Link>
            <Link href="/wiki?type=world">Creatures &amp; places</Link>
          </div>
          <div className="rail-section">
            <strong>Popular pages</strong>
            <Link href="/wiki/mining">Mining</Link>
            <Link href="/wiki/smithing">Smithing</Link>
            <Link href="/wiki/combat-mechanics">Combat guide</Link>
            <Link href="/wiki/open-the-gates">Open The Gates</Link>
            <Link href="/wiki/crystal-caverns-bank-unlock">Crystal Caverns bank</Link>
          </div>
        </nav>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">Menu</summary>
          <nav aria-label="Mobile navigation">
            <Link href="/">Main page</Link>
            <Link href="/wiki">All pages</Link>
            <Link href="/calculators">Calculators</Link>
            <Link href="/calculators/combat-level">Combat level</Link>
            <Link href="/sources">Source library</Link>
            <Link href="/wiki?type=items">Items</Link>
            <Link href="/wiki?type=guides">Skills &amp; guides</Link>
            <Link href="/wiki?type=quests">Quests</Link>
            <Link href="/wiki?type=world">Creatures & places</Link>
            <Link href="/recent">Recent changes</Link>
            <Link href="/about/data">About the wiki</Link>
            <Link href="/contribute">Contribute</Link>
          </nav>
        </details>
      </header>
  );
}
