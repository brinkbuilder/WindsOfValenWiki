import type { Metadata } from 'next';
import Link from 'next/link';
import { verificationLabels } from '../../lib/wiki-data';

export const metadata: Metadata = { title: 'Data and verification', description: 'How The Valen Archives separates bridge-confirmed facts, observations, routes, and community notes.' };

export default function DataPolicyPage() {
  return (
    <main className="inner-page policy-page">
      <header className="simple-page-heading">
        <p className="eyebrow">Trust the trail</p>
        <h1>How verification works</h1>
        <p>The wiki is designed to say what is known, how it is known, and what remains uncertain—without publishing private player data.</p>
      </header>

      <section className="pipeline" aria-label="Data pipeline">
        <div><span>01</span><strong>Targeted bridge export</strong><p>Read bounded game objects and recipe identities.</p></div>
        <i aria-hidden="true">→</i>
        <div><span>02</span><strong>Normalised record</strong><p>Attach stable IDs, sources, dates, and confidence.</p></div>
        <i aria-hidden="true">→</i>
        <div><span>03</span><strong>Wiki templates</strong><p>Generate articles, indexes, search, and related links.</p></div>
      </section>

      <section className="policy-grid">
        <article>
          <p className="eyebrow">Evidence labels</p>
          <h2>Six levels of evidence</h2>
          <div className="label-list">
            {Object.entries(verificationLabels).map(([key, item]) => (
              <div key={key}><i className={`verification-${key}`} /><span><strong>{item.label}</strong><p>{item.description}</p></span></div>
            ))}
          </div>
        </article>
        <article>
          <p className="eyebrow">System-owned facts</p>
          <h2>Facts stay attached to provenance</h2>
          <ul>
            <li>Item keys, recipe assets, actor classes, and route metrics retain their technical identity.</li>
            <li>Unknown ingredients, effects, requirements, and drop rates remain visibly unknown.</li>
            <li>Bank totals are not historical facts until the bank is hydrated after reconnect.</li>
            <li>Community writing can explain a fact but does not silently replace a bridge-confirmed value.</li>
            <li>Community claims link to a fixed revision and remain visible when they conflict with newer or stronger evidence.</li>
          </ul>
        </article>
        <article>
          <p className="eyebrow">Privacy boundary</p>
          <h2>What never becomes public</h2>
          <ul>
            <li>Character and account names</li>
            <li>Personal holdings and progression</li>
            <li>Exact live world coordinates</li>
            <li>Command files or automation controls</li>
            <li>Local paths, credentials, and session identifiers</li>
          </ul>
        </article>
        <article>
          <p className="eyebrow">Safe importer</p>
          <h2>Targeted and cached by design</h2>
          <p>Broad UObject enumeration is excluded because it is unstable on this game build. A production importer should request small, explicit datasets, cache results, and never invoke movement, crafting, inventory, or combat actions.</p>
          <Link href="/wiki/valenbridge">Read the ValenBridge methodology <span>→</span></Link>
        </article>
        <article>
          <p className="eyebrow">External provenance</p>
          <h2>Community pages are references, not silent truth</h2>
          <p>Both developer wikis contribute page discovery, revision metadata, copied articles, images, and factual leads under explicit project permission. Attribution remains visible, and Miraheze material retains its CC BY-SA 4.0 notice.</p>
          <Link href="/sources">Browse attributed source revisions <span>→</span></Link>
        </article>
      </section>
    </main>
  );
}
