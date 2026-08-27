export type Verification = 'engine' | 'observed' | 'route' | 'player' | 'documented';

export type WikiFact = {
  label: string;
  value: string;
};

export type WikiTable = {
  headers: string[];
  rows: string[][];
};

export type WikiSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  table?: WikiTable;
};

export type WikiEntry = {
  slug: string;
  title: string;
  type: 'Item' | 'Recipe' | 'Guide' | 'Activity' | 'Creature' | 'Location' | 'Route' | 'System' | 'Resource';
  verification: Verification;
  summary: string;
  intro: string;
  aliases?: string[];
  categories: string[];
  technicalId?: string;
  facts: WikiFact[];
  sections: WikiSection[];
  related?: string[];
  source: {
    label: string;
    detail: string;
    observed: string;
  };
};

const bridgeSource = {
  label: 'ValenBridge engine export',
  detail: 'Read directly from loaded Unreal objects through the project’s read-only Lua bridge.',
  observed: '27 August 2026',
};

const routeSource = {
  label: 'Recorded world route',
  detail: 'Derived from route JSON recorded against live world-space positions. Exact coordinates remain private.',
  observed: '25–27 August 2026',
};

const documentedSource = {
  label: 'Verified project behaviour',
  detail: 'Documented in the working bot, tests, and bridge implementation after live validation.',
  observed: '25–27 August 2026',
};

const playerSource = {
  label: 'Player-confirmed workflow',
  detail: 'Confirmed through a repeatable player demonstration and post-action inventory checks.',
  observed: 'August 2026',
};

const curatedEntries: WikiEntry[] = [
  {
    slug: 'infused-coal',
    title: 'Infused Coal',
    type: 'Item',
    verification: 'engine',
    summary: 'A Potion Making material produced by reducing Coal with Essence.',
    intro: 'Infused Coal is a stackable processed material. The complete input and output relationship was verified against live inventory changes rather than inferred from the crafting interface.',
    aliases: ['item 274', 'Recipe_Infused_Coal'],
    categories: ['Items', 'Potion Making', 'Materials'],
    technicalId: 'ItemDataKey 274',
    facts: [
      { label: 'Item key', value: '274' },
      { label: 'Recipe', value: 'Recipe_Infused_Coal' },
      { label: 'Station', value: 'Reduction Station' },
      { label: 'Input', value: '1 Coal + 2 Essence' },
      { label: 'Output', value: '1 Infused Coal' },
      { label: 'Verification', value: 'Engine verified' },
    ],
    sections: [
      {
        title: 'Making Infused Coal',
        paragraphs: ['Open the crafting selection at a dressed Reduction Station and select the Infused Coal recipe. The recipe processes the available batch continuously after selection.'],
        table: {
          headers: ['Input', 'Quantity', 'Technical key'],
          rows: [['Coal', '1', '27'], ['Essence', '2', '117'], ['Infused Coal', '+1', '274']],
        },
      },
      {
        title: 'Verified batch',
        bullets: [
          'A 26-item batch uses 26 Coal and 52 Essence.',
          'The verified output is 26 Infused Coal.',
          'Coal occupies the remaining 26 slots when Essence and finished Infused Coal are kept as two stackable inventory slots.',
        ],
      },
      {
        title: 'Technical notes',
        paragraphs: ['The recipe asset is stored under the Potion Making Reduction Station group. The wiki treats the item key, recipe identity, station, and measured inventory deltas as system-owned facts.'],
      },
    ],
    related: ['coal', 'essence', 'potion-making', 'recipe-infused-coal', 'bank-to-potion-stations-route'],
    source: playerSource,
  },
  {
    slug: 'coal',
    title: 'Coal',
    type: 'Item',
    verification: 'engine',
    summary: 'A raw resource used in the verified Infused Coal recipe.',
    intro: 'Coal is identified in live inventory and bank data by item key 27. One Coal is consumed for every Infused Coal produced.',
    aliases: ['Coal Ore', 'item 27'],
    categories: ['Items', 'Mining', 'Materials'],
    technicalId: 'ItemDataKey 27',
    facts: [{ label: 'Item key', value: '27' }, { label: 'Known use', value: 'Infused Coal' }, { label: 'Recipe cost', value: '1 per craft' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [
      { title: 'Uses', paragraphs: ['Coal is a direct input to Recipe_Infused_Coal at a Reduction Station. The verified recipe also consumes two Essence.'] },
      { title: 'Sources', paragraphs: ['Coal-bearing mining rocks have been observed in the Cavern Mine. Exact drop rates and mining requirements have not yet been verified.'] },
    ],
    related: ['infused-coal', 'essence', 'cavern-mine', 'mining'],
    source: documentedSource,
  },
  {
    slug: 'essence',
    title: 'Essence',
    type: 'Item',
    verification: 'engine',
    summary: 'A stackable crafting material used throughout Potion Making.',
    intro: 'Essence is identified by item key 117. The verified Infused Coal recipe consumes two Essence per Coal.',
    aliases: ['item 117'],
    categories: ['Items', 'Potion Making', 'Materials'],
    technicalId: 'ItemDataKey 117',
    facts: [{ label: 'Item key', value: '117' }, { label: 'Known use', value: 'Infused Coal' }, { label: 'Recipe cost', value: '2 per craft' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [
      { title: 'Uses', paragraphs: ['Two Essence are consumed alongside one Coal to make one Infused Coal.'] },
      { title: 'Processing sources', paragraphs: ['Large, small, and regular Essence Gland reduction recipes were found in the engine catalogue. Their exact yields remain research tasks unless stated on a verified workflow.'] },
    ],
    related: ['infused-coal', 'recipe-reduce-essence-gland', 'recipe-reduce-large-essence-gland', 'essence-rock'],
    source: documentedSource,
  },
  {
    slug: 'coins',
    title: 'Coins',
    type: 'Item',
    verification: 'engine',
    summary: 'The game’s currency item, identified by item key 1.',
    intro: 'Coins are represented as an ordinary inventory item with key 1. Holdings should be counted only from authoritative inventory, hydrated bank, and collection-box records.',
    aliases: ['currency', 'item 1'],
    categories: ['Items', 'Currency'],
    technicalId: 'ItemDataKey 1',
    facts: [{ label: 'Item key', value: '1' }, { label: 'Type', value: 'Currency' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [
      { title: 'Storage', paragraphs: ['Coins can appear in the player inventory, bank, and collection box. Bank records are not authoritative until the bank has been opened and its inventory target has hydrated.'] },
      { title: 'Display caution', paragraphs: ['Repeated collection-box display entries were observed to reference the same underlying stack. The wiki does not describe that UI desynchronisation as a duplication method.'] },
    ],
    related: ['banking', 'inventory'],
    source: documentedSource,
  },
  {
    slug: 'carp',
    title: 'Carp',
    type: 'Item',
    verification: 'engine',
    summary: 'A fish used in a confirmed multi-station Potion Making workflow.',
    intro: 'Carp is identified by item key 104. Ten Carp can be processed into Fine Fish Scales while also producing Large Essence Glands for reduction.',
    aliases: ['item 104'],
    categories: ['Items', 'Fishing', 'Potion Making'],
    technicalId: 'ItemDataKey 104',
    facts: [{ label: 'Item key', value: '104' }, { label: 'Batch size', value: '10 Carp' }, { label: 'First station', value: 'Cutting Station' }, { label: 'Verification', value: 'Player confirmed' }],
    sections: [
      { title: 'Processing', bullets: ['Cut 10 Carp into 10 Hardened Fish Scales and 10 Large Essence Glands.', 'Reduce the scales into 10 Polished Fish Scales.', 'Crush those scales into 10 Fine Fish Scales.', 'Reduce the Large Essence Glands separately; the exact Essence yield is not yet verified.'] },
      { title: 'Fishing', paragraphs: ['Carp spots were observed around a dedicated pier. Fishing continues automatically after one successful spot interaction, and the spot eventually depletes and respawns.'] },
    ],
    related: ['fishing', 'carp-processing', 'recipe-harvest-carp', 'carp-to-bank-route'],
    source: playerSource,
  },
  {
    slug: 'mithril-sword',
    title: 'Mithril Sword',
    type: 'Item',
    verification: 'engine',
    summary: 'A sword whose item identity was read from a live inventory object.',
    intro: 'The Mithril Sword appears as DA_mithril_sword and uses item key 59. Combat statistics and requirements have not yet been exported.',
    categories: ['Items', 'Equipment', 'Weapons'],
    technicalId: 'ItemDataKey 59',
    facts: [{ label: 'Item key', value: '59' }, { label: 'Asset', value: 'DA_mithril_sword' }, { label: 'Type', value: 'Weapon' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [{ title: 'Known data', paragraphs: ['Name, asset identity, and item key were read from a loaded item instance. Stats, equip requirements, trade value, and sources remain unverified.'] }],
    related: ['combat'],
    source: bridgeSource,
  },
  {
    slug: 'berserker-gloves',
    title: 'Berserker Gloves',
    type: 'Item',
    verification: 'engine',
    summary: 'A pair of gloves identified from a live item object.',
    intro: 'Berserker Gloves use item key 60 and the asset DA_berserker_gloves. Their combat bonuses and acquisition source are not yet verified.',
    categories: ['Items', 'Equipment', 'Armour'],
    technicalId: 'ItemDataKey 60',
    facts: [{ label: 'Item key', value: '60' }, { label: 'Asset', value: 'DA_berserker_gloves' }, { label: 'Slot', value: 'Gloves' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [{ title: 'Known data', paragraphs: ['The readable name, item key, and data asset were exported from a held item. Other fields await targeted inspection.'] }],
    related: ['berserker-boots', 'combat'],
    source: bridgeSource,
  },
  {
    slug: 'berserker-boots',
    title: 'Berserker Boots',
    type: 'Item',
    verification: 'engine',
    summary: 'A pair of boots identified from a live item object.',
    intro: 'Berserker Boots use item key 61 and the asset DA_berserker_boots. Their combat bonuses and acquisition source are not yet verified.',
    categories: ['Items', 'Equipment', 'Armour'],
    technicalId: 'ItemDataKey 61',
    facts: [{ label: 'Item key', value: '61' }, { label: 'Asset', value: 'DA_berserker_boots' }, { label: 'Slot', value: 'Boots' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [{ title: 'Known data', paragraphs: ['The readable name, item key, and data asset were exported from a held item. Other fields await targeted inspection.'] }],
    related: ['berserker-gloves', 'combat'],
    source: bridgeSource,
  },
  {
    slug: 'advanced-parry-shield',
    title: 'Advanced Parry Shield',
    type: 'Item',
    verification: 'engine',
    summary: 'A shield identified from a live item object.',
    intro: 'The Advanced Parry Shield uses item key 67 and the asset DA_advanced_parry_shield.',
    categories: ['Items', 'Equipment', 'Shields'],
    technicalId: 'ItemDataKey 67',
    facts: [{ label: 'Item key', value: '67' }, { label: 'Asset', value: 'DA_advanced_parry_shield' }, { label: 'Type', value: 'Shield' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [{ title: 'Known data', paragraphs: ['Name, item key, and asset identity are confirmed. Parry behaviour, stats, and source remain research tasks.'] }],
    related: ['combat'],
    source: bridgeSource,
  },
  {
    slug: 'gilded-potion',
    title: 'Gilded Potion',
    type: 'Item',
    verification: 'engine',
    summary: 'A potion identified from a loaded item instance.',
    intro: 'Gilded Potion uses item key 112 and the data asset DA_gilded_potion. A matching bottle recipe is present in the Potion Making catalogue.',
    categories: ['Items', 'Potions', 'Potion Making'],
    technicalId: 'ItemDataKey 112',
    facts: [{ label: 'Item key', value: '112' }, { label: 'Asset', value: 'DA_gilded_potion' }, { label: 'Recipe asset', value: 'Recipe_Bottle_GildedPotion' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [{ title: 'Known data', paragraphs: ['The item identity and matching recipe identity are confirmed. Effect, duration, ingredients, and level requirements remain unverified.'] }],
    related: ['recipe-bottle-gilded-potion', 'potion-making'],
    source: bridgeSource,
  },
  {
    slug: 'fishing',
    title: 'Fishing',
    type: 'Activity',
    verification: 'player',
    summary: 'A gathering activity based on interacting with renewable ripple spots.',
    intro: 'Fishing begins with a single successful spot interaction and continues automatically. The current observations show no timing minigame.',
    categories: ['Activities', 'Skills', 'Fishing'],
    facts: [{ label: 'Interaction', value: 'Click once' }, { label: 'Loop', value: 'Automatic' }, { label: 'Resource', value: 'Depleting ripple spot' }, { label: 'Known fish', value: 'Carp, Blue Gill' }],
    sections: [
      { title: 'How fishing works', bullets: ['Equip the correct rod and bait for the chosen spot.', 'Interact with a visible ripple once.', 'Fishing continues automatically while the spot remains available.', 'Move to another spot when the ripple depletes; spots later respawn.', 'Bank or process the catch when the inventory is full.'] },
      { title: 'Bait', paragraphs: ['The observed Carp workflow uses Small Fish Bait. Bait can be made by using a knife on caught fish through the appropriate harvest recipe.'] },
      { title: 'Spot identification', paragraphs: ['Ripple graphics do not reliably identify the fish species. The working system uses the spot’s class identity or a verified hover tooltip rather than visual ripple shape alone.'] },
    ],
    related: ['carp', 'carp-processing', 'carp-to-bank-route', 'potion-making'],
    source: playerSource,
  },
  {
    slug: 'mining',
    title: 'Mining',
    type: 'Activity',
    verification: 'documented',
    summary: 'A gathering activity using charge-based ore rocks and equipped resource containers.',
    intro: 'Mining rocks expose remaining and maximum charges. A rock is considered available while its charge count is above zero, giving a direct depletion signal.',
    categories: ['Activities', 'Skills', 'Mining'],
    facts: [{ label: 'Availability', value: 'Charges > 0' }, { label: 'Known ores', value: 'Silver, gold, essence, coal, ebony' }, { label: 'Resource crate', value: 'Up to 500 observed' }, { label: 'Verification', value: 'Live state + tests' }],
    sections: [
      { title: 'Rock state', paragraphs: ['Mining rocks do not use the same lifetime field as fishing spots. The bridge derives availability from charges and confirms progress when that value falls.'] },
      { title: 'Resource containers', paragraphs: ['Equipped ore containers are separate from the normal 28-slot inventory. The observed silver workflow used a 500-capacity resource container and deposited it through the bank’s native resource action.'] },
      { title: 'Mapped patches', bullets: ['Silver: six-rock patch.', 'Gold: six-rock volcanic patch.', 'Essence: three-rock patch.', 'Cavern Mine: multiple ebony, silver, coal, and ebony-dust rock classes observed.'] },
    ],
    related: ['silver-mining', 'silver-rock', 'gold-rock', 'essence-rock', 'cavern-mine'],
    source: documentedSource,
  },
  {
    slug: 'silver-mining',
    title: 'Silver mining circuit',
    type: 'Guide',
    verification: 'route',
    summary: 'A verified six-rock loop with resource-container banking.',
    intro: 'The silver circuit visits six recorded B_MiningRock_Silver_C rocks, fills the equipped resource container, then follows a recorded return route to a bank.',
    aliases: ['silver route', 'silver mine loop'],
    categories: ['Guides', 'Mining', 'Routes'],
    technicalId: 'B_MiningRock_Silver_C',
    facts: [{ label: 'Rocks', value: '6' }, { label: 'Rock class', value: 'B_MiningRock_Silver_C' }, { label: 'Return route', value: '38 points' }, { label: 'Route length', value: '~16,242 uu' }, { label: 'Observed capacity', value: '500 ore' }],
    sections: [
      { title: 'Quick guide', bullets: ['Equip the silver resource container and a suitable pickaxe.', 'Start at the recorded patch and mine the nearest charged rock.', 'Continue through the six-rock set, skipping any rock with zero charges.', 'When the resource container is full, follow the Silver Mine to Bank route.', 'Open the bank and deposit the equipped resource container.', 'Return to the patch and resume from the nearest useful rock.'] },
      { title: 'Why the route is reliable', paragraphs: ['Each step is based on world position rather than a fixed screen pixel. The walker re-evaluates the character’s real position after every click and resumes interrupted routes from the nearest appropriate waypoint.'] },
      { title: 'Known limits', bullets: ['Rock respawn timing is not yet published.', 'Mining requirements and experience rates have not been verified.', 'The 500 capacity belongs to the observed equipped container and should not be assumed for every backpack tier.'] },
    ],
    related: ['mining', 'silver-rock', 'silver-mine-to-bank-route', 'banking'],
    source: routeSource,
  },
  {
    slug: 'potion-making',
    title: 'Potion Making',
    type: 'Activity',
    verification: 'engine',
    summary: 'A multi-station crafting system with 36 discovered recipe assets.',
    intro: 'Potion Making uses dedicated cutting, crushing, reduction, and cauldron recipe groups. The bridge catalogue currently contains 36 engine identities, while only player-confirmed quantities are presented as complete formulas.',
    categories: ['Activities', 'Skills', 'Crafting'],
    facts: [{ label: 'Discovered recipes', value: '36' }, { label: 'Groups', value: 'Cauldron, Crush, Knife, Reduction' }, { label: 'Verified workflow', value: 'Infused Coal' }, { label: 'Verification', value: 'Engine catalogue' }],
    sections: [
      { title: 'Stations', table: { headers: ['Group', 'Purpose', 'Recipes found'], rows: [['Cauldron', 'Bottles and potions', '13'], ['Crush Station', 'Crushing ingredients', '7'], ['Knife Station', 'Harvesting fish', '7'], ['Reduction Station', 'Reducing ingredients', '9']] } },
      { title: 'Evidence policy', paragraphs: ['A recipe appearing in the engine catalogue confirms its identity and group, but not its ingredients, level requirement, effect, or yield. Those fields remain explicitly unknown until a player-confirmed workflow measures them.'] },
      { title: 'Known workflows', bullets: ['Infused Coal: 1 Coal + 2 Essence → 1 Infused Coal.', 'Carp processing: 10 Carp → 10 Fine Fish Scales plus Essence derived from 10 Large Essence Glands; the exact Essence yield remains unknown.'] },
    ],
    related: ['infused-coal', 'carp-processing', 'bank-to-potion-stations-route'],
    source: bridgeSource,
  },
  {
    slug: 'carp-processing',
    title: 'Carp processing',
    type: 'Guide',
    verification: 'player',
    summary: 'A verified station sequence that turns Carp into Fine Fish Scales.',
    intro: 'This workflow processes ten Carp across the Cutting, Reduction, and Crush stations. It verifies each stage from inventory changes.',
    categories: ['Guides', 'Potion Making', 'Fishing'],
    facts: [{ label: 'Input', value: '10 Carp' }, { label: 'Output', value: '10 Fine Fish Scales' }, { label: 'By-product', value: '10 Large Essence Glands' }, { label: 'Stations', value: 'Cut, reduce, crush' }],
    sections: [
      { title: 'Quick guide', table: { headers: ['Step', 'Recipe', 'Result'], rows: [['1', 'Recipe_Harvest_Carp', '10 Hardened Fish Scales + 10 Large Essence Glands'], ['2', 'Recipe_Reduce_HardenedScales', '10 Polished Fish Scales'], ['3', 'Recipe_Reduce_LargeEssenceGland', 'Essence; exact yield unknown'], ['4', 'Recipe_Crush_RefinedHardenedScales', '10 Fine Fish Scales']] } },
      { title: 'Verification', paragraphs: ['The working process targets recipe UObject identities and checks that each input disappears and expected output appears. It does not rely on menu-cell positions.'] },
    ],
    related: ['carp', 'fishing', 'potion-making', 'recipe-harvest-carp', 'recipe-crush-refined-hardened-scales'],
    source: playerSource,
  },
  {
    slug: 'banking',
    title: 'Banking',
    type: 'System',
    verification: 'engine',
    summary: 'A four-tab, 400-slot storage system exposed through the live bank widget.',
    intro: 'The bank inventory is reached through the open W_BankInventory_C widget. It uses global slots 0–399, arranged as four tabs of 100.',
    categories: ['Systems', 'Storage'],
    technicalId: 'W_Bank_C / B_BankComponent_C',
    facts: [{ label: 'Capacity', value: '400 slots' }, { label: 'Tabs', value: '4' }, { label: 'Slots per tab', value: '100' }, { label: 'Visible widget', value: 'W_Bank_C' }, { label: 'Backend', value: 'B_BankComponent_C' }],
    sections: [
      { title: 'Opening and hydration', paragraphs: ['The bank must be open before its CurrentInventoryTarget is available. Immediately after reconnect, a 400-slot bank can report no readable entries until the panel hydrates; that state must not be interpreted as an empty bank.'] },
      { title: 'Slots and identity', paragraphs: ['A bank slot is a location, not an item identity. Reliable tools match ItemDataKey and then translate the selected global slot to a tab and position.'] },
      { title: 'Resource deposits', paragraphs: ['Equipped resource containers use a native RequestDepositResources action. A successful request is followed by a count check because a full bank can still reject the transfer.'] },
    ],
    related: ['inventory', 'silver-mining', 'coins', 'carp-to-bank-route'],
    source: documentedSource,
  },
  {
    slug: 'inventory',
    title: 'Inventory',
    type: 'System',
    verification: 'engine',
    summary: 'The player’s main 28-slot item inventory.',
    intro: 'The normal player inventory exposes 28 slots, each with an item key and count when occupied. Equipped resource containers are separate and must be read independently.',
    categories: ['Systems', 'Storage'],
    technicalId: 'PlayerInventoryComponent',
    facts: [{ label: 'Main capacity', value: '28 slots' }, { label: 'Identity field', value: 'ItemDataKey' }, { label: 'Quantity field', value: 'Count' }, { label: 'Resource container', value: 'Separate equipment inventory' }],
    sections: [
      { title: 'Occupied slots', paragraphs: ['Only occupied slots appear in compact bridge state. A missing slot number means empty; the item key identifies its type and Count identifies stack quantity.'] },
      { title: 'Resource containers', paragraphs: ['Ore crates and similar equipped bags live in EquipmentInventory. A normal inventory reading can therefore show free space while a separate resource container is nearly full.'] },
    ],
    related: ['banking', 'mining', 'coins'],
    source: documentedSource,
  },
  {
    slug: 'combat',
    title: 'Combat',
    type: 'Activity',
    verification: 'documented',
    summary: 'Target-based combat with engine-readable health, death, and identity state.',
    intro: 'Combatants expose current and maximum health, death state, an aim point, and a stable Unreal object identity. Stable IDs prevent a routine from switching between identical enemies.',
    categories: ['Activities', 'Combat'],
    facts: [{ label: 'Target identity', value: 'Stable actor ID' }, { label: 'Progress signal', value: 'Health falling' }, { label: 'Completion', value: 'Death state' }, { label: 'Known enemy', value: 'Cavern Spider' }],
    sections: [
      { title: 'Target locking', paragraphs: ['Class names are shared by every enemy of a type. Exact combat follows one actor ID across state updates, so movement or nearby identical enemies do not silently change the target.'] },
      { title: 'Verification', bullets: ['A successful attack is confirmed by the selected target’s health falling.', 'Death is confirmed from the target’s death component.', 'Ground loot uses a separate stable item-pile identity so collection can be confirmed by that exact pile disappearing.'] },
    ],
    related: ['cavern-spider', 'cavern-mine'],
    source: documentedSource,
  },
  {
    slug: 'cavern-mine',
    title: 'Cavern Mine',
    type: 'Location',
    verification: 'observed',
    summary: 'An underground mining area with ebony, silver, coal, spiders, and environmental hazards.',
    intro: 'A live actor snapshot in the Cavern Mine showed multiple ore classes, Cavern Spiders, spider eggs, passage actors, and hazard-room telegraphs.',
    categories: ['Locations', 'Mining', 'Bestiary'],
    technicalId: 'B_CavernMine_Zone_C',
    facts: [{ label: 'Zone class', value: 'B_CavernMine_Zone_C' }, { label: 'Observed enemies', value: 'Cavern Spiders' }, { label: 'Observed ores', value: 'Ebony, silver, coal, ebony dust' }, { label: 'Hazards', value: 'Circle and box rooms' }],
    sections: [
      { title: 'Resources', bullets: ['Ebony cavern rocks', 'Silver cavern rocks', 'Coal cavern rocks', 'Ebony Dust cavern rocks'] },
      { title: 'Creatures', paragraphs: ['Two live B_Spider_Cavern_C actors were observed near the player snapshot, along with spider eggs elsewhere in the loaded area. The observed spider respawn delay was 15 seconds.'] },
      { title: 'Hazards', paragraphs: ['The loaded world contained circle telegraphs and box/circle hazard-room actors. Their exact damage, timing, and safe routes are not yet published.'] },
    ],
    related: ['cavern-spider', 'mining', 'ebony-cave-clean-route'],
    source: bridgeSource,
  },
  {
    slug: 'cavern-spider',
    title: 'Cavern Spider',
    type: 'Creature',
    verification: 'engine',
    summary: 'A hostile spider found in the Cavern Mine.',
    intro: 'Cavern Spiders use the class B_Spider_Cavern_C. Two live examples were observed in a bridge spawn-state export.',
    aliases: ['B_Spider_Cavern_C'],
    categories: ['Creatures', 'Bestiary', 'Cavern Mine'],
    technicalId: 'B_Spider_Cavern_C',
    facts: [{ label: 'Class', value: 'B_Spider_Cavern_C' }, { label: 'Location', value: 'Cavern Mine' }, { label: 'Observed respawn', value: '15 seconds' }, { label: 'Verification', value: 'Live observation' }],
    sections: [
      { title: 'Location', paragraphs: ['Cavern Spiders were observed among ebony, silver, and coal rocks in the Cavern Mine.'] },
      { title: 'Combat data', paragraphs: ['The class and respawn delay are confirmed. Health, attacks, drops, weaknesses, and experience remain unverified.'] },
    ],
    related: ['cavern-mine', 'combat'],
    source: bridgeSource,
  },
  {
    slug: 'volcano-skeleton-archer',
    title: 'Volcano Skeleton Archer',
    type: 'Creature',
    verification: 'observed',
    summary: 'A ranged skeleton enemy observed around the volcanic combat routes.',
    intro: 'The observed class B_VolcanoSkeleton_Archer_C was used to validate stable combat target locking. Detailed drops and combat statistics remain unknown.',
    categories: ['Creatures', 'Bestiary', 'Volcano'],
    technicalId: 'B_VolcanoSkeleton_Archer_C',
    facts: [{ label: 'Class', value: 'B_VolcanoSkeleton_Archer_C' }, { label: 'Combat style', value: 'Ranged (name-derived)' }, { label: 'Location', value: 'Volcano route area' }, { label: 'Verification', value: 'Live observation' }],
    sections: [{ title: 'Known data', paragraphs: ['Class identity and combat presence are confirmed. The ranged designation follows the authored class name; health, accuracy, damage, drops, and respawn time require targeted observation.'] }],
    related: ['combat', 'volcano-mages-route', 'volcano-respawn-route'],
    source: documentedSource,
  },
  {
    slug: 'silver-rock',
    title: 'Silver rock',
    type: 'Resource',
    verification: 'route',
    summary: 'A charge-based mining rock represented by B_MiningRock_Silver_C.',
    intro: 'Six Silver rocks were recorded in the verified silver patch. Availability is derived from remaining charges rather than screen appearance.',
    categories: ['Resources', 'Mining'],
    technicalId: 'B_MiningRock_Silver_C',
    facts: [{ label: 'Class', value: 'B_MiningRock_Silver_C' }, { label: 'Recorded patch', value: '6 rocks' }, { label: 'Availability', value: 'Charges > 0' }, { label: 'Verification', value: 'Route verified' }],
    sections: [{ title: 'Mining', paragraphs: ['The silver loop selects a charged rock, confirms activity through the target and charge state, and moves on when the rock depletes.'] }],
    related: ['silver-mining', 'mining', 'silver-mine-to-bank-route'],
    source: routeSource,
  },
  {
    slug: 'gold-rock',
    title: 'Gold rock',
    type: 'Resource',
    verification: 'route',
    summary: 'A volcanic gold mining rock with a recorded six-rock patch.',
    intro: 'Gold rocks use class B_MiningRock_Gold_Volcanic_C. Two route snapshots describe overlapping six-rock arrangements.',
    categories: ['Resources', 'Mining', 'Volcano'],
    technicalId: 'B_MiningRock_Gold_Volcanic_C',
    facts: [{ label: 'Class', value: 'B_MiningRock_Gold_Volcanic_C' }, { label: 'Recorded patch', value: '6 rocks' }, { label: 'Area', value: 'Volcanic' }, { label: 'Verification', value: 'Route verified' }],
    sections: [{ title: 'Known data', paragraphs: ['The class and recorded patch size are confirmed. Requirements, experience, respawn timing, and yield remain unverified.'] }],
    related: ['mining', 'gold-dust-mine-to-bank-route'],
    source: routeSource,
  },
  {
    slug: 'essence-rock',
    title: 'Essence rock',
    type: 'Resource',
    verification: 'route',
    summary: 'A mining rock represented by B_MiningRock_Essence_C.',
    intro: 'Three Essence rocks were recorded in one patch, with a dedicated route from the mining area to a bank.',
    categories: ['Resources', 'Mining', 'Potion Making'],
    technicalId: 'B_MiningRock_Essence_C',
    facts: [{ label: 'Class', value: 'B_MiningRock_Essence_C' }, { label: 'Recorded patch', value: '3 rocks' }, { label: 'Bank route', value: '8 points' }, { label: 'Verification', value: 'Route verified' }],
    sections: [{ title: 'Known data', paragraphs: ['The rock class, patch size, and bank route are confirmed. The connection between this rock and item key 117 is plausible but not yet asserted as an engine-verified yield.'] }],
    related: ['essence', 'mining', 'essence-mining-to-bank-route'],
    source: routeSource,
  },
  {
    slug: 'valenbridge',
    title: 'ValenBridge verification',
    type: 'System',
    verification: 'documented',
    summary: 'The evidence pipeline that supplies technical facts to this wiki.',
    intro: 'ValenBridge is a character-scoped Lua bridge that reads live Unreal objects and exchanges atomic JSON files with local tools. The public wiki imports only game knowledge, never private character state.',
    aliases: ['Lua bridge', 'wiki importer'],
    categories: ['Systems', 'Wiki', 'Methodology'],
    technicalId: 'UE4SS ValenBridge',
    facts: [{ label: 'Transport', value: 'Atomic JSON files' }, { label: 'State cadence', value: 'About 2 seconds when idle' }, { label: 'Scope', value: 'Character-scoped' }, { label: 'Public policy', value: 'No private player data' }],
    sections: [
      { title: 'Evidence flow', paragraphs: ['The bridge observes engine state, exports bounded records, and the wiki normalises those records into stable article fields, search terms, generated indexes, and evidence labels. Editorial prose remains separate from system-owned facts.'] },
      { title: 'Verification labels', table: { headers: ['Label', 'Meaning'], rows: [['Engine verified', 'Read from a targeted engine object or item instance.'], ['Live observation', 'Seen in a timestamped world snapshot.'], ['Route verified', 'Supported by a recorded world-space route or patch.'], ['Player confirmed', 'Measured through a repeatable workflow and inventory checks.'], ['Project documented', 'Confirmed by implementation notes and passing tests.']] } },
      { title: 'Privacy and safety', bullets: ['Character names, holdings, exact coordinates, and command files are excluded.', 'Bank totals are not treated as durable until the bank is hydrated after reconnect.', 'Broad UObject sweeps are not part of the importer; targeted, cached exports are required.', 'Actions that alter inventory or movement are never run by the public wiki importer.'] },
      { title: 'What still needs research', paragraphs: ['Many engine identities are known before their player-facing effects, requirements, or yields. Those fields stay visibly unknown instead of being guessed.'] },
    ],
    related: ['potion-making', 'inventory', 'banking'],
    source: documentedSource,
  },
];

type RecipeSpec = {
  slug: string;
  title: string;
  id: string;
  group: 'Cauldron' | 'Crush Station' | 'Knife Station' | 'Reduction Station';
};

const recipeSpecs: RecipeSpec[] = [
  { slug: 'recipe-bottle-gilded-potion', title: 'Gilded Potion bottle recipe', id: 'Recipe_Bottle_GildedPotion', group: 'Cauldron' },
  { slug: 'recipe-bottle-small-potion', title: 'Small Potion bottle recipe', id: 'Recipe_Bottle_SmallPotion', group: 'Cauldron' },
  { slug: 'recipe-bottle-strong-potion', title: 'Strong Potion bottle recipe', id: 'Recipe_Bottle_StrongPotion', group: 'Cauldron' },
  { slug: 'recipe-cauldron-archery', title: 'Archery potion recipe', id: 'Recipe_Cauldron_Archery', group: 'Cauldron' },
  { slug: 'recipe-cauldron-attack', title: 'Attack potion recipe', id: 'Recipe_Cauldron_Attack', group: 'Cauldron' },
  { slug: 'recipe-cauldron-fishing', title: 'Fishing potion recipe', id: 'Recipe_Cauldron_Fishing', group: 'Cauldron' },
  { slug: 'recipe-cauldron-magic', title: 'Magic potion recipe', id: 'Recipe_Cauldron_Magic', group: 'Cauldron' },
  { slug: 'recipe-cauldron-mining', title: 'Mining potion recipe', id: 'Recipe_Cauldron_Mining', group: 'Cauldron' },
  { slug: 'recipe-cauldron-normal-health', title: 'Health potion recipe', id: 'Recipe_Cauldron_NormalHealth', group: 'Cauldron' },
  { slug: 'recipe-cauldron-shields', title: 'Shields potion recipe', id: 'Recipe_Cauldron_Shields', group: 'Cauldron' },
  { slug: 'recipe-cauldron-strong-health', title: 'Strong Health potion recipe', id: 'Recipe_Cauldron_StrongHealth', group: 'Cauldron' },
  { slug: 'recipe-cauldron-strong-shields', title: 'Strong Shields potion recipe', id: 'Recipe_Cauldron_StrongShields', group: 'Cauldron' },
  { slug: 'recipe-cauldron-weak-health', title: 'Weak Health potion recipe', id: 'Recipe_Cauldron_WeakHealth', group: 'Cauldron' },
  { slug: 'recipe-crush-glowing-mushroom', title: 'Crush Glowing Mushroom', id: 'Recipe_Crush_GlowingMushroom', group: 'Crush Station' },
  { slug: 'recipe-crush-hearty-fish-flesh', title: 'Crush Hearty Fish Flesh', id: 'Recipe_Crush_HeartyFishFlesh', group: 'Crush Station' },
  { slug: 'recipe-crush-mud-root', title: 'Crush Mud Root', id: 'Recipe_Crush_MudRoot', group: 'Crush Station' },
  { slug: 'recipe-crush-plain-fish-flesh', title: 'Crush Plain Fish Flesh', id: 'Recipe_Crush_PlainFishFlesh', group: 'Crush Station' },
  { slug: 'recipe-crush-refined-hardened-scales', title: 'Crush Refined Hardened Scales', id: 'Recipe_Crush_RefinedHardenedScales', group: 'Crush Station' },
  { slug: 'recipe-crush-scales', title: 'Crush Scales', id: 'Recipe_Crush_Scales', group: 'Crush Station' },
  { slug: 'recipe-crush-small-fang', title: 'Crush Small Fang', id: 'Recipe_Crush_SmallFang', group: 'Crush Station' },
  { slug: 'recipe-harvest-big-trout', title: 'Harvest Big Trout', id: 'Recipe_Harvest_BigTrout', group: 'Knife Station' },
  { slug: 'recipe-harvest-blue-gill', title: 'Harvest Blue Gill', id: 'Recipe_Harvest_BlueGill', group: 'Knife Station' },
  { slug: 'recipe-harvest-carp', title: 'Harvest Carp', id: 'Recipe_Harvest_Carp', group: 'Knife Station' },
  { slug: 'recipe-harvest-minnow', title: 'Harvest Minnow', id: 'Recipe_Harvest_Minnow', group: 'Knife Station' },
  { slug: 'recipe-harvest-perch', title: 'Harvest Perch', id: 'Recipe_Harvest_Perch', group: 'Knife Station' },
  { slug: 'recipe-harvest-small-bass', title: 'Harvest Small Bass', id: 'Recipe_Harvest_SmallBass', group: 'Knife Station' },
  { slug: 'recipe-harvest-small-trout', title: 'Harvest Small Trout', id: 'Recipe_Harvest_SmallTrout', group: 'Knife Station' },
  { slug: 'recipe-infused-coal', title: 'Infused Coal recipe', id: 'Recipe_Infused_Coal', group: 'Reduction Station' },
  { slug: 'recipe-reduce-essence-gland', title: 'Reduce Essence Gland', id: 'Recipe_Reduce_EssenceGland', group: 'Reduction Station' },
  { slug: 'recipe-reduce-hardened-scales', title: 'Reduce Hardened Scales', id: 'Recipe_Reduce_HardenedScales', group: 'Reduction Station' },
  { slug: 'recipe-reduce-large-essence-gland', title: 'Reduce Large Essence Gland', id: 'Recipe_Reduce_LargeEssenceGland', group: 'Reduction Station' },
  { slug: 'recipe-reduce-minced-hearty-fish-flesh', title: 'Reduce Minced Hearty Fish Flesh', id: 'Recipe_Reduce_MincedHeartyFishFlesh', group: 'Reduction Station' },
  { slug: 'recipe-reduce-rare-blue-gill', title: 'Reduce Rare Blue Gill', id: 'Recipe_Reduce_RareBlueGill', group: 'Reduction Station' },
  { slug: 'recipe-reduce-rare-minnow', title: 'Reduce Rare Minnow', id: 'Recipe_Reduce_RareMinnow', group: 'Reduction Station' },
  { slug: 'recipe-reduce-small-essence-gland', title: 'Reduce Small Essence Gland', id: 'Recipe_Reduce_SmallEssenceGland', group: 'Reduction Station' },
  { slug: 'recipe-reduce-spider-eye', title: 'Reduce Spider Eye', id: 'Recipe_Reduce_SpiderEye', group: 'Reduction Station' },
];

const verifiedRecipeNotes: Record<string, { summary: string; bullets: string[]; related: string[] }> = {
  'recipe-infused-coal': {
    summary: 'The verified Reduction Station recipe that makes Infused Coal.',
    bullets: ['Consumes 1 Coal and 2 Essence per craft.', 'Produces 1 Infused Coal.', 'Selecting it once can process the complete available batch continuously.'],
    related: ['infused-coal', 'coal', 'essence'],
  },
  'recipe-harvest-carp': {
    summary: 'A verified Knife Station recipe that processes Carp.',
    bullets: ['Each Carp produces Hardened Fish Scales and a Large Essence Gland in the confirmed workflow.', 'Ten Carp produced ten of each observed output.'],
    related: ['carp', 'carp-processing'],
  },
  'recipe-reduce-hardened-scales': {
    summary: 'A verified Reduction Station stage in the Carp processing workflow.',
    bullets: ['Ten Hardened Fish Scales produced ten Polished Fish Scales in the confirmed batch.'],
    related: ['carp-processing', 'recipe-crush-refined-hardened-scales'],
  },
  'recipe-reduce-large-essence-gland': {
    summary: 'A confirmed recipe identity used to reduce Large Essence Glands.',
    bullets: ['The recipe consumed ten Large Essence Glands in the confirmed batch.', 'The exact Essence yield has not yet been supplied and remains unknown.'],
    related: ['carp-processing', 'essence'],
  },
  'recipe-crush-refined-hardened-scales': {
    summary: 'A verified Crush Station stage that produces Fine Fish Scales.',
    bullets: ['Ten Polished Fish Scales produced ten Fine Fish Scales in the confirmed batch.'],
    related: ['carp-processing', 'carp'],
  },
};

const recipeEntries: WikiEntry[] = recipeSpecs.map((recipe) => {
  const verified = verifiedRecipeNotes[recipe.slug];
  return {
    slug: recipe.slug,
    title: recipe.title,
    type: 'Recipe',
    verification: verified ? 'player' : 'engine',
    summary: verified?.summary ?? `An engine-discovered Potion Making recipe in the ${recipe.group} group.`,
    intro: verified?.summary ?? `${recipe.title} is present in the loaded CraftingRecipe catalogue. Its engine identity and station group are known, while ingredients, quantities, requirements, and output remain unverified.`,
    aliases: [recipe.id],
    categories: ['Recipes', 'Potion Making', recipe.group],
    technicalId: recipe.id,
    facts: [
      { label: 'Recipe asset', value: recipe.id },
      { label: 'Group', value: recipe.group },
      { label: 'Knowledge status', value: verified ? 'Player-confirmed details' : 'Identity only' },
      { label: 'Verification', value: verified ? 'Player confirmed' : 'Engine verified' },
    ],
    sections: verified
      ? [
          { title: 'Confirmed behaviour', bullets: verified.bullets },
          { title: 'Technical identity', paragraphs: [`The recipe was resolved as ${recipe.id} in the live Potion Making catalogue and used through its matching station context.`] },
        ]
      : [
          { title: 'Known data', paragraphs: [`ValenBridge found ${recipe.id} under the ${recipe.group} recipe group. That confirms the recipe object exists and identifies its station family.`] },
          { title: 'Research needed', bullets: ['Input items and quantities', 'Output item and quantity', 'Skill or level requirement', 'Experience reward', 'Potion effect or ingredient use'] },
        ],
    related: verified?.related ?? ['potion-making'],
    source: verified ? playerSource : bridgeSource,
  };
});

type RouteSpec = {
  slug: string;
  title: string;
  points: number;
  distance: number;
  purpose: string;
  related: string[];
};

const routeSpecs: RouteSpec[] = [
  { slug: 'ashen-mages-return-route', title: 'Ashen Mages return route', points: 38, distance: 16465, purpose: 'Return path for the Ashen Mages combat area.', related: ['combat'] },
  { slug: 'bank-to-furnace-route', title: 'Bank to Furnace route', points: 11, distance: 4488, purpose: 'Connects a bank with a furnace station.', related: ['banking'] },
  { slug: 'bank-to-potion-stations-route', title: 'Bank to Potion Stations route', points: 8, distance: 3718, purpose: 'Connects the bank with the Potion Making station cluster.', related: ['banking', 'potion-making', 'infused-coal'] },
  { slug: 'carp-to-bank-route', title: 'Carp to Bank route', points: 34, distance: 17717, purpose: 'Carries a full Carp inventory from the fishing pier to a bank.', related: ['carp', 'fishing', 'banking'] },
  { slug: 'cavern-goblins-return-route', title: 'Cavern Goblins return route', points: 37, distance: 14927, purpose: 'Return path for the Cavern Goblins combat area.', related: ['combat', 'cavern-mine'] },
  { slug: 'ebony-cave-clean-route', title: 'Ebony Cave survey route', points: 92, distance: 40322, purpose: 'A long-form recorded survey through the Ebony Cave area.', related: ['cavern-mine', 'mining'] },
  { slug: 'ebony-cave-demo-route', title: 'Ebony Cave demo route', points: 2, distance: 791, purpose: 'A short two-point route captured during Ebony Cave testing.', related: ['cavern-mine'] },
  { slug: 'ebony-cave-demo-b-route', title: 'Ebony Cave demo route B', points: 6, distance: 1966, purpose: 'A second short route captured during Ebony Cave testing.', related: ['cavern-mine'] },
  { slug: 'essence-mining-to-bank-route', title: 'Essence Mine to Bank route', points: 8, distance: 2496, purpose: 'Connects the recorded Essence rock patch with a bank.', related: ['essence-rock', 'mining', 'banking'] },
  { slug: 'gold-dust-mine-to-bank-route', title: 'Gold Dust Mine to Bank route', points: 75, distance: 47195, purpose: 'A long route from the Gold Dust mining area to a bank.', related: ['gold-rock', 'mining', 'banking'] },
  { slug: 'lich-return-route', title: 'Lich return route', points: 18, distance: 10680, purpose: 'Return path for a Lich combat area.', related: ['combat'] },
  { slug: 'mine-to-bank-route', title: 'Mine to Bank route', points: 76, distance: 46259, purpose: 'A long general mining return route.', related: ['mining', 'banking'] },
  { slug: 'silver-mine-to-bank-route', title: 'Silver Mine to Bank route', points: 38, distance: 16242, purpose: 'The bank leg of the verified six-rock silver circuit.', related: ['silver-mining', 'silver-rock', 'banking'] },
  { slug: 'skeleton-warriors-return-route', title: 'Skeleton Warriors return route', points: 32, distance: 13187, purpose: 'Return path for the Skeleton Warriors combat area.', related: ['combat'] },
  { slug: 'volcano-mages-route', title: 'Volcano Mages route', points: 29, distance: 18998, purpose: 'A recorded path through the Volcano Mages area.', related: ['combat', 'volcano-skeleton-archer'] },
  { slug: 'volcano-respawn-route', title: 'Volcano respawn route', points: 20, distance: 14536, purpose: 'A return path from the observed volcano respawn area.', related: ['combat', 'volcano-skeleton-archer'] },
];

const routeEntries: WikiEntry[] = routeSpecs.map((route) => ({
  slug: route.slug,
  title: route.title,
  type: 'Route',
  verification: 'route',
  summary: route.purpose,
  intro: `${route.purpose} The stored path contains ${route.points} world-space points over an approximate recorded length of ${route.distance.toLocaleString('en-US')} Unreal units.`,
  categories: ['Routes', 'World'],
  facts: [
    { label: 'Waypoints', value: String(route.points) },
    { label: 'Recorded length', value: `~${route.distance.toLocaleString('en-US')} uu` },
    { label: 'Coordinate model', value: 'World space' },
    { label: 'Verification', value: 'Route verified' },
  ],
  sections: [
    { title: 'Purpose', paragraphs: [route.purpose] },
    { title: 'Route behaviour', paragraphs: ['The working walker selects progress from the character’s current world position, recalculates after every movement, and can resume an interrupted trip from the nearest appropriate waypoint.'] },
    { title: 'Privacy note', paragraphs: ['Exact coordinates are intentionally not published. Point count and approximate path length are sufficient for documenting coverage without exposing live player locations.'] },
  ],
  related: route.related,
  source: routeSource,
}));

export const wikiEntries: WikiEntry[] = [...curatedEntries, ...recipeEntries, ...routeEntries]
  .sort((a, b) => a.title.localeCompare(b.title));

export const wikiBySlug = new Map(wikiEntries.map((entry) => [entry.slug, entry]));

export const verificationLabels: Record<Verification, { label: string; description: string }> = {
  engine: { label: 'Engine verified', description: 'Read from a targeted game object or item instance.' },
  observed: { label: 'Live observation', description: 'Seen in a timestamped world snapshot.' },
  route: { label: 'Route verified', description: 'Supported by a recorded world route or resource patch.' },
  player: { label: 'Player confirmed', description: 'Measured through a repeatable player workflow.' },
  documented: { label: 'Project documented', description: 'Confirmed in the working implementation and tests.' },
};

export type SearchEntry = Pick<WikiEntry, 'slug' | 'title' | 'type' | 'summary' | 'verification'> & { terms: string };

export const searchEntries: SearchEntry[] = wikiEntries.map((entry) => ({
  slug: entry.slug,
  title: entry.title,
  type: entry.type,
  summary: entry.summary,
  verification: entry.verification,
  terms: [entry.title, entry.type, entry.summary, entry.technicalId, ...(entry.aliases ?? []), ...entry.categories]
    .filter(Boolean)
    .join(' ')
    .toLowerCase(),
}));

export function searchWiki(query: string): WikiEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return wikiEntries;
  return wikiEntries
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const terms = [title, entry.type, entry.summary, entry.technicalId, ...(entry.aliases ?? []), ...entry.categories]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      let score = 0;
      if (title === normalized) score = 100;
      else if (title.startsWith(normalized)) score = 70;
      else if (title.includes(normalized)) score = 50;
      else if (terms.includes(normalized)) score = 20;
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title))
    .map(({ entry }) => entry);
}

export const wikiStats = {
  articles: wikiEntries.length,
  recipes: recipeEntries.length,
  routes: routeEntries.length,
  verifiedItems: curatedEntries.filter((entry) => entry.type === 'Item' && entry.verification === 'engine').length,
};
