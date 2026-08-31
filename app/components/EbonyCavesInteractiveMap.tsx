'use client';

/* The supplied map is the authoritative visual layer; controls add navigation without replacing its labels. */
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

type ResourceKey = 'ebonyOre' | 'ebonyDust' | 'silverOre';
type MapFilter = 'all' | ResourceKey | 'spiders';

type CaveRoom = {
  id: string;
  name: string;
  shortName: string;
  region: string;
  x: number;
  y: number;
  resources: Partial<Record<ResourceKey, number>>;
  spiders: boolean;
  direction: string;
  landmark: string;
  advice: string;
};

type CaveRoute = {
  id: string;
  name: string;
  focus: string;
  description: string;
  rooms: string[];
};

const resourceLabels: Record<ResourceKey, string> = {
  ebonyOre: 'Ebony Ore',
  ebonyDust: 'Ebony Dust',
  silverOre: 'Silver Ore',
};

const rooms: CaveRoom[] = [
  {
    id: 'entrance', name: 'Southern Entrance', shortName: 'Entrance', region: 'South', x: 48.3, y: 94,
    resources: {}, spiders: false,
    direction: 'The stairway at the very bottom of the map. Every route begins here.',
    landmark: 'Lit stone stairs and a straight northbound corridor.',
    advice: 'Face north when you enter. The first major chamber is the large webbed spider room.',
  },
  {
    id: 'south-central-spiders', name: 'South Central Spider Chamber', shortName: 'Central spiders', region: 'South central', x: 46.5, y: 63,
    resources: {}, spiders: true,
    direction: 'Travel straight north from the entrance into the first large circular chamber.',
    landmark: 'A broad circular floor covered in heavy webbing with several exits.',
    advice: 'Treat this as the cave’s first navigation hub. Clear or avoid the spiders before choosing a branch.',
  },
  {
    id: 'south-west-spiders', name: 'South-west Spider Nest', shortName: 'SW spider nest', region: 'South-west', x: 32.5, y: 77,
    resources: {}, spiders: true,
    direction: 'From the main south-central chamber, take the lower western loop.',
    landmark: 'Large round dead-end room with dense webbing and two spider markings.',
    advice: 'This is a danger room rather than a mining stop. Use it to recognise the western edge of the lower loop.',
  },
  {
    id: 'west-silver', name: 'West Silver Pocket', shortName: 'West silver', region: 'West', x: 21.1, y: 57,
    resources: { silverOre: 1 }, spiders: false,
    direction: 'Take the western route from the central junction and follow it to the small lower-west chamber.',
    landmark: 'A compact room with a single marked Silver Ore rock.',
    advice: 'Useful as a quick landmark, but the northern and eastern Silver rooms have much larger groups.',
  },
  {
    id: 'west-dust', name: 'West Dust and Ore Chamber', shortName: 'West dust', region: 'West', x: 21.4, y: 40,
    resources: { ebonyDust: 2, ebonyOre: 1 }, spiders: true,
    direction: 'Continue north-west beyond the West Silver Pocket into the next round chamber.',
    landmark: 'Two Ebony Dust rocks, one Ebony Ore rock, webbing, and spider markings.',
    advice: 'A compact mixed Ebony stop. Keep an escape route open because the room is small and spiders are close.',
  },
  {
    id: 'north-west-ore', name: 'North-west Ebony Chamber', shortName: 'NW ebony', region: 'North-west outer cavern', x: 32.7, y: 24,
    resources: { ebonyOre: 5 }, spiders: true,
    direction: 'From the west mixed chamber, follow the rising passage north-east into the large outer room.',
    landmark: 'Five marked Ebony Ore rocks arranged around a wide spider chamber.',
    advice: 'One of the two richest Ebony Ore rooms. Mine the outer rocks while watching the centre for spiders.',
  },
  {
    id: 'north-end', name: 'North End Dust Chamber', shortName: 'North dust', region: 'North end', x: 48.6, y: 11.4,
    resources: { ebonyDust: 3, ebonyOre: 1 }, spiders: true,
    direction: 'From the six-rock Silver junction, take the narrow passage due north to the cave’s highest room.',
    landmark: 'Three Ebony Dust rocks, one Ebony Ore rock, and a large spider nest.',
    advice: 'The room is a dead end, making it easy to learn but dangerous if spiders block the only exit.',
  },
  {
    id: 'north-silver', name: 'North Central Silver Junction', shortName: 'North silver', region: 'North central', x: 49, y: 27.5,
    resources: { silverOre: 6 }, spiders: true,
    direction: 'Continue north from the central upper mixed room to the cross-shaped junction.',
    landmark: 'Six Silver Ore rocks at the meeting point of the western, northern, eastern, and southern passages.',
    advice: 'The largest marked Silver group and the best navigation landmark in the northern half of the cave.',
  },
  {
    id: 'central-upper', name: 'Central Upper Mixed Chamber', shortName: 'Central mixed', region: 'Upper centre', x: 49.2, y: 42.5,
    resources: { ebonyOre: 5, silverOre: 2 }, spiders: true,
    direction: 'From the first large spider chamber, take the central path north through the inner passages.',
    landmark: 'Five Ebony Ore and two Silver Ore rocks in the chamber directly below the six-rock Silver junction.',
    advice: 'The other richest Ebony Ore room. Its central position makes it the easiest high-value stop to revisit.',
  },
  {
    id: 'north-east', name: 'North-east Dust Chamber', shortName: 'NE dust', region: 'North-east outer cavern', x: 65.6, y: 25.3,
    resources: { ebonyDust: 4, silverOre: 2 }, spiders: false,
    direction: 'From the North Central Silver Junction, take the eastern passage into the wide outer chamber.',
    landmark: 'Four Ebony Dust rocks and two Silver Ore rocks beside a heavily webbed floor.',
    advice: 'The richest marked Ebony Dust room. Webbing suggests danger even though the map has no written spider warning here.',
  },
  {
    id: 'east-loop-junction', name: 'East Loop Junction', shortName: 'East junction', region: 'East', x: 76.6, y: 48.7,
    resources: {}, spiders: false,
    direction: 'Follow the long eastern corridor until it meets the tall north-south loop.',
    landmark: 'A broad four-way meeting point connecting the north-east, far-east, east-middle, and central routes.',
    advice: 'Use this junction to avoid becoming turned around. North-east leads to Dust; south-west leads toward Silver.',
  },
  {
    id: 'far-east-mixed', name: 'Far-east Mixed Pocket', shortName: 'Far-east mixed', region: 'Far east', x: 84.1, y: 54.2,
    resources: { ebonyOre: 2, silverOre: 2 }, spiders: false,
    direction: 'At the East Loop Junction, take the short passage directly east into the small dead-end room.',
    landmark: 'Two Ebony Ore and two Silver Ore rocks in a compact circular pocket.',
    advice: 'A convenient mixed stop with a single exit. Return west to the loop junction when finished.',
  },
  {
    id: 'east-silver', name: 'East Silver Chamber', shortName: 'East silver', region: 'East middle', x: 68.7, y: 61.5,
    resources: { silverOre: 5 }, spiders: true,
    direction: 'From the East Loop Junction, follow the lower-left passage toward the centre of the cave.',
    landmark: 'Five Silver Ore rocks with a spider warning in a rounded chamber.',
    advice: 'The second-largest Silver room. Approach carefully because spiders occupy the same mining space.',
  },
  {
    id: 'south-east-silver', name: 'South-east Silver Pocket', shortName: 'SE silver', region: 'South-east', x: 62.5, y: 76.2,
    resources: { silverOre: 3 }, spiders: false,
    direction: 'Take the south-west branch from the East Silver Chamber toward the entrance loop.',
    landmark: 'Three Silver Ore rocks in the lowest eastern mining room.',
    advice: 'A useful final stop on the return journey to the southern entrance.',
  },
];

const routes: CaveRoute[] = [
  {
    id: 'first-visit', name: 'First-visit route', focus: 'Learn the spine',
    description: 'Memorise the entrance, first hub, central mixed room, northern junction, and north dead end.',
    rooms: ['entrance', 'south-central-spiders', 'central-upper', 'north-silver', 'north-end'],
  },
  {
    id: 'ebony-ore', name: 'Ebony Ore route', focus: '14 rocks marked',
    description: 'Prioritises both five-rock rooms, then collects the smaller mixed pockets.',
    rooms: ['entrance', 'south-central-spiders', 'central-upper', 'north-silver', 'north-end', 'north-west-ore', 'west-dust', 'far-east-mixed'],
  },
  {
    id: 'ebony-dust', name: 'Ebony Dust route', focus: '9 rocks marked',
    description: 'Connects the west pair, north trio, and north-east four-rock chamber.',
    rooms: ['entrance', 'south-central-spiders', 'west-dust', 'north-west-ore', 'north-silver', 'north-end', 'north-east'],
  },
  {
    id: 'silver', name: 'Silver Ore route', focus: '21 rocks marked',
    description: 'Runs through every labelled Silver pocket, with the six-rock north junction as the main stop.',
    rooms: ['entrance', 'south-east-silver', 'east-silver', 'east-loop-junction', 'far-east-mixed', 'north-east', 'north-silver', 'central-upper', 'west-silver'],
  },
];

function roomResources(room: CaveRoom) {
  return (Object.entries(room.resources) as [ResourceKey, number][]);
}

function roomKind(room: CaveRoom) {
  const keys = Object.keys(room.resources) as ResourceKey[];
  if (room.id === 'entrance') return 'entrance';
  if (keys.length > 1) return 'mixed';
  if (keys[0]) return keys[0];
  return room.spiders ? 'spiders' : 'junction';
}

export function EbonyCavesInteractiveMap() {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [selectedId, setSelectedId] = useState('entrance');
  const [filter, setFilter] = useState<MapFilter>('all');
  const [activeRouteId, setActiveRouteId] = useState('first-visit');
  const [zoom, setZoom] = useState(1);
  const [expanded, setExpanded] = useState(false);
  const [dragging, setDragging] = useState(false);

  const selectedRoom = rooms.find((room) => room.id === selectedId) ?? rooms[0];
  const activeRoute = routes.find((route) => route.id === activeRouteId) ?? null;
  const routeOrder = useMemo(() => new Map(activeRoute?.rooms.map((id, index) => [id, index + 1]) ?? []), [activeRoute]);

  useEffect(() => {
    if (!expanded) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setExpanded(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [expanded]);

  const centerRoom = (room: CaveRoom) => {
    window.requestAnimationFrame(() => {
      const viewport = viewportRef.current;
      if (!viewport) return;
      viewport.scrollTo({
        left: Math.max(0, (room.x / 100) * viewport.scrollWidth - viewport.clientWidth / 2),
        top: Math.max(0, (room.y / 100) * viewport.scrollHeight - viewport.clientHeight / 2),
        behavior: 'smooth',
      });
    });
  };

  const chooseRoom = (id: string) => {
    const room = rooms.find((candidate) => candidate.id === id);
    if (!room) return;
    setSelectedId(id);
    if (zoom === 1) setZoom(1.55);
    window.setTimeout(() => centerRoom(room), 40);
  };

  const changeZoom = (nextZoom: number) => {
    setZoom(Math.max(1, Math.min(3, Number(nextZoom.toFixed(2)))));
    window.setTimeout(() => centerRoom(selectedRoom), 40);
  };

  const chooseRoute = (route: CaveRoute) => {
    setActiveRouteId(route.id);
    setFilter('all');
    chooseRoom(route.rooms[0]);
  };

  const chooseFilter = (nextFilter: MapFilter) => {
    setFilter(nextFilter);
    setActiveRouteId('');
    if (nextFilter === 'all') return;
    const firstMatch = rooms.find((room) => nextFilter === 'spiders' ? room.spiders : Boolean(room.resources[nextFilter]));
    if (firstMatch) chooseRoom(firstMatch.id);
  };

  const isVisible = (room: CaveRoom) => filter === 'all'
    || (filter === 'spiders' ? room.spiders : Boolean(room.resources[filter]));

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || (event.target as HTMLElement).closest('button')) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    dragRef.current = { x: event.clientX, y: event.clientY, left: viewport.scrollLeft, top: viewport.scrollTop };
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const viewport = viewportRef.current;
    const drag = dragRef.current;
    if (!viewport || !drag) return;
    viewport.scrollLeft = drag.left - (event.clientX - drag.x);
    viewport.scrollTop = drag.top - (event.clientY - drag.y);
  };

  const endDrag = () => {
    dragRef.current = null;
    setDragging(false);
  };

  return (
    <section className={`ebony-interactive-map${expanded ? ' is-expanded' : ''}`} aria-labelledby="ebony-map-title">
      <header className="ebony-map-header">
        <div>
          <span className="ebony-map-kicker">Interactive field map</span>
          <h3 id="ebony-map-title">Explore the Ebony Caves</h3>
          <p>Select a marked room to learn what is there and exactly how to reach it. Choose a route to number its stops on the map.</p>
        </div>
        <dl className="ebony-map-totals" aria-label="Mapped resource totals">
          <div><dt>Ebony Ore</dt><dd>14</dd></div>
          <div><dt>Ebony Dust</dt><dd>9</dd></div>
          <div><dt>Silver Ore</dt><dd>21</dd></div>
          <div><dt>Spider rooms</dt><dd>8</dd></div>
        </dl>
      </header>

      <div className="ebony-map-routes" aria-label="Suggested routes">
        {routes.map((route) => (
          <button type="button" className={activeRouteId === route.id ? 'active' : ''} onClick={() => chooseRoute(route)} key={route.id}>
            <span>{route.focus}</span><strong>{route.name}</strong><small>{route.description}</small>
          </button>
        ))}
      </div>

      <div className="ebony-map-toolbar">
        <div className="ebony-map-filters" role="group" aria-label="Show map markers">
          {([
            ['all', 'All rooms'],
            ['ebonyOre', 'Ebony Ore'],
            ['ebonyDust', 'Ebony Dust'],
            ['silverOre', 'Silver Ore'],
            ['spiders', 'Spider danger'],
          ] as [MapFilter, string][]).map(([value, label]) => <button type="button" aria-pressed={filter === value} onClick={() => chooseFilter(value)} key={value}>{label}</button>)}
        </div>
        <label className="ebony-room-select"><span>Jump to a room</span><select value={selectedId} onChange={(event) => { setFilter('all'); setActiveRouteId(''); chooseRoom(event.target.value); }}>{rooms.map((room) => <option value={room.id} key={room.id}>{room.name}</option>)}</select></label>
      </div>

      <div className="ebony-map-workspace">
        <div className="ebony-map-board">
          <div className="ebony-map-controls" aria-label="Map controls">
            <button type="button" onClick={() => changeZoom(zoom - .25)} disabled={zoom <= 1} aria-label="Zoom out">−</button>
            <output aria-label="Current zoom">{Math.round(zoom * 100)}%</output>
            <button type="button" onClick={() => changeZoom(zoom + .25)} disabled={zoom >= 3} aria-label="Zoom in">+</button>
            <button type="button" onClick={() => { setZoom(1); viewportRef.current?.scrollTo({ left: 0, top: 0, behavior: 'smooth' }); }}>Reset</button>
            <button type="button" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Close full screen' : 'Full screen'}</button>
          </div>

          <div
            className={`ebony-map-viewport${dragging ? ' is-dragging' : ''}`}
            ref={viewportRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
          >
            <div className="ebony-map-canvas" style={{ width: `${zoom * 100}%` }}>
              <img src="/wiki-assets/ebony-caves-map.png" alt="Ebony Caves map by Ichigo" draggable="false" />
              {rooms.map((room) => {
                const order = routeOrder.get(room.id);
                return (
                  <button
                    type="button"
                    className={`ebony-map-pin pin-${roomKind(room)}${selectedId === room.id ? ' selected' : ''}${order ? ' route-stop' : ''}${isVisible(room) ? '' : ' filtered'}`}
                    style={{ left: `${room.x}%`, top: `${room.y}%` }}
                    onClick={() => chooseRoom(room.id)}
                    aria-label={`${room.name}${room.spiders ? ', spiders present' : ''}`}
                    aria-pressed={selectedId === room.id}
                    key={room.id}
                  >
                    {order ? <b>{order}</b> : <span aria-hidden="true">{room.id === 'entrance' ? 'E' : room.spiders && !Object.keys(room.resources).length ? '!' : '●'}</span>}
                    <em>{room.shortName}</em>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="ebony-map-caption"><strong>Map layout by Ichigo.</strong><span>Drag to pan after zooming. Select any marker for room directions and mining advice.</span><a href="/wiki-assets/ebony-caves-map.png">Open original full-resolution map</a></div>
          <div className="ebony-map-legend" aria-label="Map marker legend">
            <span><i className="legend-ore" />Ebony Ore</span><span><i className="legend-dust" />Ebony Dust</span><span><i className="legend-silver" />Silver Ore</span><span><i className="legend-mixed" />Mixed resources</span><span><i className="legend-danger" />Spiders</span><span><i className="legend-route" />Numbered route stop</span>
          </div>
        </div>

        <aside className="ebony-room-guide" aria-live="polite">
          <div className="ebony-room-heading"><span>{selectedRoom.region}</span><h4>{selectedRoom.name}</h4>{selectedRoom.spiders && <b>Spider danger</b>}</div>
          <div className="ebony-room-resources">
            <strong>Marked resources</strong>
            {roomResources(selectedRoom).length ? <ul>{roomResources(selectedRoom).map(([key, quantity]) => <li className={`resource-${key}`} key={key}><b>{quantity}</b><span>{resourceLabels[key]}</span></li>)}</ul> : <p>No resource rocks are marked in this room.</p>}
          </div>
          <dl className="ebony-room-details">
            <div><dt>How to reach it</dt><dd>{selectedRoom.direction}</dd></div>
            <div><dt>What to look for</dt><dd>{selectedRoom.landmark}</dd></div>
            <div><dt>Player advice</dt><dd>{selectedRoom.advice}</dd></div>
          </dl>
          <button type="button" className="center-room-button" onClick={() => { if (zoom === 1) setZoom(1.55); window.setTimeout(() => centerRoom(selectedRoom), 40); }}>Centre this room on the map</button>
          {activeRoute && (
            <div className="active-route-steps">
              <span>Active route · {activeRoute.focus}</span>
              <h5>{activeRoute.name}</h5>
              <ol>{activeRoute.rooms.map((id) => {
                const room = rooms.find((candidate) => candidate.id === id);
                return room ? <li className={room.id === selectedId ? 'current' : ''} key={id}><button type="button" onClick={() => chooseRoom(id)}>{room.name}</button></li> : null;
              })}</ol>
            </div>
          )}
        </aside>
      </div>

      <div className="ebony-map-learning-notes">
        <article><span>Orientation</span><h4>North is at the top</h4><p>The only mapped entrance is the southern staircase. The central spider chamber and six-rock Silver junction are the easiest landmarks.</p></article>
        <article><span>Resource pattern</span><h4>Ebony sits on the outer branches</h4><p>The largest Ebony Ore rooms lie north-west and above the centre. Ebony Dust gathers in the west, north, and north-east webbed chambers.</p></article>
        <article><span>Safety</span><h4>Webbing means caution</h4><p>Written spider warnings and spider symbols mark confirmed danger rooms. Webbed floors are a useful warning even where no text label appears.</p></article>
      </div>
    </section>
  );
}
