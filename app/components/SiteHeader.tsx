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
        <nav className="primary-nav rail-navigation" aria-label="Primary navigation">
          <Link href="/wiki">Encyclopedia</Link>
          <Link href="/wiki?type=guides">Skills</Link>
          <Link href="/wiki?type=quests">Quests</Link>
          <Link href="/wiki?type=items">Items</Link>
          <Link href="/wiki/world-map">World map</Link>
          <Link href="/calculators">Calculators</Link>
        </nav>
        <form className="header-search" action="/search" role="search">
          <label className="sr-only" htmlFor="header-wiki-search">Search the wiki</label>
          <input id="header-wiki-search" name="q" placeholder="Search the wiki…" />
          <button type="submit" aria-label="Search">Search</button>
        </form>
        <details className="mobile-menu">
          <summary aria-label="Open navigation">More</summary>
          <nav aria-label="Mobile navigation">
            <Link href="/">Main page</Link>
            <Link href="/wiki">All pages</Link>
            <Link href="/calculators">Calculators</Link>
            <Link href="/calculators/combat-level">Combat level</Link>
            <Link href="/sources">Source library</Link>
            <Link href="/wiki?type=items">Items</Link>
            <Link href="/wiki?type=guides">Skills &amp; guides</Link>
            <Link href="/wiki?type=quests">Quests</Link>
            <Link href="/wiki/world-map">Interactive world map</Link>
            <Link href="/wiki?type=world">Creatures & places</Link>
            <Link href="/recent">Recent changes</Link>
            <Link href="/about/data">About the wiki</Link>
            <Link href="/contribute">Contribute</Link>
          </nav>
        </details>
      </header>
  );
}
