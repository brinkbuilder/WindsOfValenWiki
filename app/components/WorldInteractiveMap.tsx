'use client';

/* The atlas keeps every marker on the coordinate grid captured from the in-game world map. */
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type WheelEvent as ReactWheelEvent } from 'react';

type MarkerType = 'area' | 'location' | 'boss' | 'enemy' | 'ore' | 'fishing';

type WorldMarker = {
  id: string;
  x: number;
  y: number;
  label: string;
  type: MarkerType;
  wikiTitle?: string;
};

type MapView = { scale: number; x: number; y: number };

type TravelRoute = {
  id: string;
  name: string;
  focus: string;
  description: string;
  markerIds: string[];
};

const MAP_WIDTH = 4992;
const MAP_HEIGHT = 5376;
const markerTypes: MarkerType[] = ['area', 'location', 'ore', 'fishing', 'enemy', 'boss'];

function exactMarkerPosition(marker: Pick<WorldMarker, 'x' | 'y'>) {
  return {
    x: Math.min(MAP_WIDTH - 80, Math.max(80, marker.x)),
    y: Math.min(MAP_HEIGHT - 80, Math.max(80, marker.y)),
  };
}

const typeDetails: Record<MarkerType, { label: string; symbol: string }> = {
  area: { label: 'Cities & areas', symbol: '◆' },
  location: { label: 'Banks, shops & stations', symbol: '●' },
  ore: { label: 'Mining', symbol: '⬟' },
  fishing: { label: 'Fishing', symbol: '◉' },
  enemy: { label: 'Enemies', symbol: '▲' },
  boss: { label: 'Bosses', symbol: '✦' },
};

const areaDescriptions: Record<string, string> = {
  'Valen Gate': 'The central starting settlement and the best landmark for learning the world. Early shops, crafting stations, a bank, respawn, fishing, and the road network are close together.',
  'Valen City': 'A large members city north of Valen Gate. Complete Open The Gates for permanent access to its bank, shops, advanced crafting stations, and Large Cauldron.',
  'Valen Port': 'The south-eastern harbour settlement. It has a bank, respawn point, shops, Smithing facilities, Potion Making stations, pirates, and the Pirate Captain encounter.',
  'Grave Town': 'The western settlement beside the graveyard and the road into the Darklands. It has a bank, respawn, mining and potion shops, a forge, and nearby undead encounters.',
  Darklands: 'The dangerous south-west wilderness. Full-loot PvP may occur here, so bank valuables before crossing into the region.',
  'Alcott Forest': 'The broad eastern woodland containing bandit camps, forest routes, fishing spots, a bank, and the approach to Elven Haven.',
  'Elven Haven': 'A high-level eastern area with Elves, Elf Scholars, the Elf Warden boss, Mithril mining, and nearby Carp fishing.',
  'West Cavern': 'The western mining network with Iron, Coal, Mithril and Gold, plus Skeleton Knights, Highwaymen, the Skeleton Pioneer, and deeper cavern routes.',
  'Goblin Village': 'A goblin-held area west of Valen Gate containing Goblin Villagers and the Goblin Chieftain encounter.',
  Farmlands: 'The open country south-east of Valen Gate, home to early animals, roads to Valen Port, and the Goblin Watcher encounter.',
};

const directGuideSlugs: Record<string, string> = {
  'Armour and Shields': 'defence',
  Archery: 'archery',
  Combat: 'combat-mechanics',
  'Getting Started': 'controls',
  Locations: 'world-map',
  Magic: 'magic',
  Mining: 'mining',
  'Open The Gates': 'open-the-gates',
  'Potion Making': 'potion-making',
  Smithing: 'smithing',
  'Gold Rock (Ore)': 'gold-rock',
  'Goblin Chieftain': 'goblin-chieftain',
  'Goblin Watcher': 'goblin-watcher',
  'Skeleton Pioneer': 'skeleton-pioneer',
  'Valen City': 'valen-city',
  Darklands: 'the-darklands',
};

const fishingLevels: Record<string, number> = {
  Minnow: 1,
  'Common Trout': 5,
  Perch: 10,
  Bass: 20,
  'Blue Gill': 30,
  'Elder Trout': 40,
  Carp: 50,
};

const routes: TravelRoute[] = [
  {
    id: 'first-journey',
    name: 'New player circuit',
    focus: 'Start here',
    description: 'Learn the starting town, three early fishing waters, the Farmlands, and Valen Port.',
    markerIds: ['game-22-marker-valengate', 'fish-5-minnow', 'fish-7-commontrout', 'fish-6-perch', 'area-5-farmlands', 'game-28-marker-valenport'],
  },
  {
    id: 'western-mining',
    name: 'Western mining route',
    focus: 'Ore progression',
    description: 'Travel from starter rocks through West Cavern and Gold Rock, then finish at Grave Town.',
    markerIds: ['game-22-marker-valengate', 'poi-v-tin-and-copper', 'area-3-west-cavern', 'poi-o-iron-rock', 'poi-n-mithril-rock', 'poi-f-coal-rock', 'poi-12-gold-rock', 'game-44-marker-gravetown'],
  },
  {
    id: 'eastern-forest',
    name: 'Eastern forest route',
    focus: 'Forest & elves',
    description: 'Follow the river east toward bandits, Alcott Forest, its bank, and Elven Haven.',
    markerIds: ['game-22-marker-valengate', 'poi-p-iron-and-coal', 'poi-q-bandit-leader', 'area-1-alcott-forest', 'game-35-marker-bank', 'area-2-elven-haven'],
  },
  {
    id: 'boss-tour',
    name: 'Boss atlas',
    focus: '9 encounters',
    description: 'Shows every boss marker so you can compare where each encounter sits in the world.',
    markerIds: ['poi-d-goblin-berserker', 'm-mth9in80rq67', 'poi-m-goblin-chieftain', 'poi-q-bandit-leader', 'poi-r-bandit-mercenary-boss', 'poi-j-elf-warden', 'm-mth9i4r182hh', 'boss-fire-lich', 'poi-13-skeleton-pioneer'],
  },
];

function guideHref(marker: WorldMarker) {
  const rawTitle = marker.wikiTitle?.startsWith('http') ? marker.label : marker.wikiTitle;
  const title = rawTitle || marker.label.replace(/^Fishing Spot:\s*/, '');
  const directSlug = directGuideSlugs[title];
  return directSlug ? `/wiki/${directSlug}` : `/search?q=${encodeURIComponent(title)}`;
}

function markerDescription(marker: WorldMarker) {
  if (areaDescriptions[marker.label]) return areaDescriptions[marker.label];
  if (marker.type === 'boss') return `${marker.label} is a boss encounter. Check its guide, bring food and potions, and leave valuables in a bank before travelling into an unfamiliar or dangerous region.`;
  if (marker.type === 'enemy') return `${marker.label} enemies are found around this point. Use the combat guide and enemy calculator to check the documented level, health, defence, and experience before training here.`;
  if (marker.type === 'ore') return marker.label === 'Mining Spot'
    ? 'A mining area marked on the world map. Zoom in and compare nearby named ore markers to identify the local progression route.'
    : `${marker.label} can be mined around this point. Open the linked guide for requirements, experience, and uses.`;
  if (marker.type === 'fishing') {
    const fish = marker.label.replace(/^Fishing Spot:\s*/, '');
    const level = fishingLevels[fish];
    return `${fish} can be caught at this water.${level ? ` Fishing level ${level} is required.` : ''} Check the Fishing guide for bait, experience, and the next training step.`;
  }
  if (/bank/i.test(marker.label)) return 'A bank location for storing equipment and supplies. Use it before bosses, long gathering routes, or entering the Darklands.';
  if (/respawn|heal/i.test(marker.label)) return 'A recovery point used to regroup before travelling, skilling, or returning to combat.';
  if (/anvil|forge|furnace|smithing/i.test(marker.label)) return 'A Smithing facility. Furnaces process bars, anvils form metal components, and work areas support equipment production.';
  if (/cauldron|potion|cutting|crushing|reduction/i.test(marker.label)) return 'A Potion Making facility. The exact station determines whether you brew, cut, crush, or reduce ingredients.';
  if (/shop|jewelry|jewellery|swords|armor|armour|shield|mining|fishing/i.test(marker.label)) return `A ${marker.label.toLowerCase()} location where players can buy supplies or use the related service.`;
  if (/voting/i.test(marker.label)) return 'A voting booth location.';
  return `${marker.label} is a marked point of interest. Select nearby pins to understand the services, resources, enemies, and travel options around it.`;
}

export function WorldInteractiveMap() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; viewX: number; viewY: number } | null>(null);
  const [markers, setMarkers] = useState<WorldMarker[]>([]);
  const [loadError, setLoadError] = useState(false);
  const [selectedId, setSelectedId] = useState('game-22-marker-valengate');
  const [query, setQuery] = useState('');
  const [activeTypes, setActiveTypes] = useState<Set<MarkerType>>(() => new Set(markerTypes));
  const [activeRouteId, setActiveRouteId] = useState('');
  const [showAllAtOverview, setShowAllAtOverview] = useState(false);
  const [fitScale, setFitScale] = useState(.12);
  const [view, setView] = useState<MapView>({ scale: .12, x: 0, y: 0 });
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);

  const selectedMarker = markers.find((marker) => marker.id === selectedId) ?? markers[0];
  const activeRoute = routes.find((route) => route.id === activeRouteId) ?? null;
  const routeOrder = useMemo(() => new Map(activeRoute?.markerIds.map((id, index) => [id, index + 1]) ?? []), [activeRoute]);
  const relativeZoom = fitScale ? view.scale / fitScale : 1;

  const typeCounts = useMemo(() => markerTypes.reduce<Record<MarkerType, number>>((counts, type) => {
    counts[type] = markers.filter((marker) => marker.type === type).length;
    return counts;
  }, { area: 0, location: 0, boss: 0, enemy: 0, ore: 0, fishing: 0 }), [markers]);

  const matchingMarkers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return markers.filter((marker) => activeTypes.has(marker.type)
      && (!normalizedQuery || `${marker.label} ${marker.wikiTitle ?? ''}`.toLowerCase().includes(normalizedQuery)));
  }, [activeTypes, markers, query]);

  const fitMap = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const padding = expanded ? 22 : 14;
    const nextScale = Math.min((viewport.clientWidth - padding * 2) / MAP_WIDTH, (viewport.clientHeight - padding * 2) / MAP_HEIGHT);
    const safeScale = Math.max(.04, nextScale);
    setFitScale(safeScale);
    setView({
      scale: safeScale,
      x: (viewport.clientWidth - MAP_WIDTH * safeScale) / 2,
      y: (viewport.clientHeight - MAP_HEIGHT * safeScale) / 2,
    });
  }, [expanded]);

  useEffect(() => {
    let cancelled = false;
    fetch('/wiki-assets/world-map-markers.json')
      .then((response) => {
        if (!response.ok) throw new Error('Map marker data could not be loaded.');
        return response.json() as Promise<WorldMarker[]>;
      })
      .then((data) => { if (!cancelled) setMarkers(data); })
      .catch(() => { if (!cancelled) setLoadError(true); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(fitMap, 60);
    const onResize = () => fitMap();
    window.addEventListener('resize', onResize);
    return () => { window.clearTimeout(timer); window.removeEventListener('resize', onResize); };
  }, [fitMap]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', onKeyDown);
    window.setTimeout(fitMap, 80);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded, fitMap]);

  const focusMarker = (marker: WorldMarker, requestedZoom = 3.2) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const position = exactMarkerPosition(marker);
    const nextScale = Math.min(fitScale * 8, Math.max(view.scale, fitScale * requestedZoom));
    setSelectedId(marker.id);
    setView({
      scale: nextScale,
      x: viewport.clientWidth / 2 - position.x * nextScale,
      y: viewport.clientHeight / 2 - position.y * nextScale,
    });
  };

  const zoomAt = (clientX: number, clientY: number, factor: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const bounds = viewport.getBoundingClientRect();
    const localX = clientX - bounds.left;
    const localY = clientY - bounds.top;
    setView((current) => {
      const mapX = (localX - current.x) / current.scale;
      const mapY = (localY - current.y) / current.scale;
      const nextScale = Math.max(fitScale, Math.min(fitScale * 8, current.scale * factor));
      return { scale: nextScale, x: localX - mapX * nextScale, y: localY - mapY * nextScale };
    });
  };

  const zoomFromCenter = (factor: number) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const bounds = viewport.getBoundingClientRect();
    zoomAt(bounds.left + bounds.width / 2, bounds.top + bounds.height / 2, factor);
  };

  const onWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
    event.preventDefault();
    zoomAt(event.clientX, event.clientY, event.deltaY < 0 ? 1.16 : 1 / 1.16);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, a, input')) return;
    dragRef.current = { pointerId: event.pointerId, x: event.clientX, y: event.clientY, viewX: view.x, viewY: view.y };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    setView((current) => ({ ...current, x: drag.viewX + event.clientX - drag.x, y: drag.viewY + event.clientY - drag.y }));
  };

  const stopDragging = () => { dragRef.current = null; setDragging(false); };

  const toggleType = (type: MarkerType) => {
    setActiveRouteId('');
    setShowAllAtOverview(false);
    setActiveTypes((current) => {
      const next = new Set(current);
      if (next.has(type)) next.delete(type); else next.add(type);
      return next;
    });
  };

  const chooseRoute = (route: TravelRoute) => {
    setActiveRouteId(route.id);
    setShowAllAtOverview(false);
    setQuery('');
    setActiveTypes(new Set(markerTypes));
    const firstMarker = markers.find((marker) => marker.id === route.markerIds[0]);
    if (firstMarker) focusMarker(firstMarker, 2.1);
  };

  const denseMarkersVisible = showAllAtOverview || relativeZoom >= 1.65 || activeTypes.size <= 2 || Boolean(query.trim());

  return (
    <section className={`world-interactive-map${expanded ? ' is-expanded' : ''}`} aria-labelledby="world-map-heading">
      <header className="world-map-heading">
        <div>
          <span>Interactive player atlas</span>
          <h3 id="world-map-heading">Explore the world of Valen</h3>
          <p>Search, filter, zoom, and select any marker. Use a numbered route for your first trip, mining progression, eastern travel, or boss hunting.</p>
        </div>
        <dl aria-label="World map coverage">
          <div><dt>Map markers</dt><dd>{markers.length || 157}</dd></div>
          <div><dt>Areas</dt><dd>{typeCounts.area || 10}</dd></div>
          <div><dt>Resources</dt><dd>{(typeCounts.ore || 40) + (typeCounts.fishing || 8)}</dd></div>
          <div><dt>Combat points</dt><dd>{(typeCounts.enemy || 15) + (typeCounts.boss || 9)}</dd></div>
        </dl>
      </header>

      <div className="world-map-routes" aria-label="Suggested routes">
        {routes.map((route) => (
          <button type="button" className={activeRouteId === route.id ? 'active' : ''} onClick={() => chooseRoute(route)} key={route.id}>
            <span>{route.focus}</span><strong>{route.name}</strong><small>{route.description}</small>
          </button>
        ))}
      </div>

      <div className="world-map-toolbar">
        <label className="world-map-search">
          <span>Find a place, enemy, shop, ore, or fish</span>
          <input value={query} onChange={(event) => { setQuery(event.target.value); setActiveRouteId(''); }} placeholder="Try “bank”, “Mithril”, or “Elf Warden”…" />
        </label>
        <div className="world-map-filter-actions">
          <button type="button" onClick={() => { setActiveTypes(new Set(markerTypes)); setQuery(''); setActiveRouteId(''); setShowAllAtOverview(true); }}>Show all markers</button>
          <button type="button" onClick={() => { setActiveTypes(new Set()); setActiveRouteId(''); setShowAllAtOverview(false); }}>Hide all</button>
        </div>
      </div>

      <div className="world-map-filters" role="group" aria-label="Map marker categories">
        {markerTypes.map((type) => (
          <button type="button" className={`filter-${type}`} aria-pressed={activeTypes.has(type)} onClick={() => toggleType(type)} key={type}>
            <i aria-hidden="true">{typeDetails[type].symbol}</i><span>{typeDetails[type].label}</span><b>{typeCounts[type]}</b>
          </button>
        ))}
      </div>

      <div className="world-map-workspace">
        <div className="world-map-board">
          <div className="world-map-controls" aria-label="Map controls">
            <button type="button" onClick={() => zoomFromCenter(1 / 1.25)} disabled={relativeZoom <= 1.01} aria-label="Zoom out">−</button>
            <output>{Math.round(relativeZoom * 100)}%</output>
            <button type="button" onClick={() => zoomFromCenter(1.25)} disabled={relativeZoom >= 7.99} aria-label="Zoom in">+</button>
            <button type="button" onClick={fitMap}>Fit world</button>
            <button type="button" onClick={() => setExpanded((current) => !current)}>{expanded ? 'Close full screen' : 'Full screen'}</button>
          </div>

          <div
            className={`world-map-viewport${dragging ? ' is-dragging' : ''}`}
            ref={viewportRef}
            onWheel={onWheel}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={stopDragging}
            onPointerCancel={stopDragging}
          >
            <div
              className="world-map-image-layer"
              style={{ width: MAP_WIDTH, height: MAP_HEIGHT, transform: `translate(${view.x}px, ${view.y}px) scale(${view.scale})` }}
            >
              <img src="/wiki-assets/world-map-original.png" alt="Original overhead atlas of the world of Valen" draggable="false" />
            </div>

            <div className={`world-map-marker-layer${relativeZoom >= 2.6 ? ' show-labels' : ''}`}>
              {markers.map((marker) => {
                const typeVisible = activeTypes.has(marker.type);
                const queryMatch = !query.trim() || `${marker.label} ${marker.wikiTitle ?? ''}`.toLowerCase().includes(query.trim().toLowerCase());
                const routeNumber = routeOrder.get(marker.id);
                const visible = typeVisible && queryMatch && (marker.type === 'area' || denseMarkersVisible || selectedId === marker.id || Boolean(routeNumber));
                const position = exactMarkerPosition(marker);
                return (
                  <button
                    type="button"
                    className={`world-map-marker marker-${marker.type}${selectedId === marker.id ? ' selected' : ''}${routeNumber ? ' route-stop' : ''}${visible ? '' : ' hidden'}`}
                    style={{ left: view.x + position.x * view.scale, top: view.y + position.y * view.scale }}
                    onClick={() => focusMarker(marker)}
                    aria-label={`${typeDetails[marker.type].label}: ${marker.label}`}
                    aria-pressed={selectedId === marker.id}
                    key={marker.id}
                  >
                    <i aria-hidden="true">{routeNumber || typeDetails[marker.type].symbol}</i><span>{marker.label}</span>
                  </button>
                );
              })}
            </div>

            {!markers.length && !loadError && <div className="world-map-loading">Loading 157 map markers…</div>}
            {loadError && <div className="world-map-loading is-error">The marker list could not be loaded. The world artwork is still available below.</div>}
          </div>

          <div className="world-map-caption">
            <span><strong>How to explore:</strong> drag to pan, use the mouse wheel or controls to zoom, and select a marker for details.</span>
            <a href="/wiki-assets/world-map-original.png">Open the full-resolution recreated world map</a>
          </div>
        </div>

        <aside className="world-map-detail" aria-live="polite">
          {selectedMarker ? (
            <>
              <div className={`world-marker-title marker-${selectedMarker.type}`}>
                <span>{typeDetails[selectedMarker.type].symbol} {typeDetails[selectedMarker.type].label}</span>
                <h4>{selectedMarker.label}</h4>
              </div>
              <p>{markerDescription(selectedMarker)}</p>
              <dl>
                <div><dt>Map position</dt><dd>{exactMarkerPosition(selectedMarker).x < MAP_WIDTH / 2 ? 'West' : 'East'} · {exactMarkerPosition(selectedMarker).y < MAP_HEIGHT / 2 ? 'North' : 'South'}</dd></div>
                <div><dt>Nearby planning</dt><dd>Select the closest area, bank, resource, or enemy markers before you travel.</dd></div>
              </dl>
              <div className="world-marker-actions">
                <button type="button" onClick={() => focusMarker(selectedMarker, 4.2)}>Centre and zoom</button>
                <a href={guideHref(selectedMarker)}>Open related guide</a>
              </div>
              {activeRoute && (
                <div className="world-route-steps">
                  <span>{activeRoute.focus}</span>
                  <h5>{activeRoute.name}</h5>
                  <ol>{activeRoute.markerIds.map((id) => {
                    const marker = markers.find((candidate) => candidate.id === id);
                    return marker ? <li className={marker.id === selectedMarker.id ? 'current' : ''} key={id}><button type="button" onClick={() => focusMarker(marker, 2.8)}>{marker.label}</button></li> : null;
                  })}</ol>
                </div>
              )}
            </>
          ) : <p>Select a marker to see player guidance.</p>}
        </aside>
      </div>

      {query.trim() && (
        <div className="world-map-results" aria-live="polite">
          <div><strong>{matchingMarkers.length} matching markers</strong><span>Select a result to centre it on the map.</span></div>
          <ul>{matchingMarkers.slice(0, 12).map((marker) => <li key={marker.id}><button type="button" onClick={() => focusMarker(marker)}><i className={`marker-${marker.type}`} aria-hidden="true">{typeDetails[marker.type].symbol}</i><span>{marker.label}</span><small>{typeDetails[marker.type].label}</small></button></li>)}</ul>
          {matchingMarkers.length > 12 && <p>Showing the first 12 results. Add another word to narrow the search.</p>}
        </div>
      )}

      <div className="world-map-learning">
        <article><span>Orientation</span><h4>Start at Valen Gate</h4><p>Valen City is north, Valen Port is south-east, Grave Town and West Cavern are west, and the Darklands are south-west.</p></article>
        <article><span>Map clarity</span><h4>Zoom for local services</h4><p>At the world overview, area markers stay visible. Zoom in or choose a filter to reveal dense shop, station, enemy, and resource markers.</p></article>
        <article><span>Safety</span><h4>Bank before danger</h4><p>Use the bank filter before boss routes or Darklands travel. Bosses use star markers, ordinary enemies use triangles, and areas use diamonds.</p></article>
      </div>
      <p className="world-map-credit">Original atlas artwork recreated for the Winds of Valen player wiki from the in-game world layout.</p>
    </section>
  );
}
