import { communityEntries } from './community-entries';
import { itemCatalogueSpecs, itemStoreInfo } from './item-data';
import legacyWikiData from './legacy-wiki-data.json';
import { fishProcessingRecipes, potionBrewRecipes, potionCrushRecipes, potionRecipeDetails, potionReductionRecipes } from './potion-data';
import { formatSmithingIngredients, smithingItemDescriptions, smithingItemSlug, smithingRecipes, type SmithingRecipe } from './smithing-data';

export type Verification = 'engine' | 'observed' | 'player' | 'documented' | 'community';

export type WikiFact = {
  label: string;
  value: string;
  sourceRef?: string;
};

export type ExternalSource = {
  id: string;
  site: string;
  pageTitle: string;
  permalink: string;
  revisionId: number;
  revisedAt: string;
  retrievedAt: string;
  relation: 'corroborates' | 'supplements' | 'conflicts';
  scope: string[];
  note?: string;
  readerPath?: string;
};

export type WikiTable = {
  headers: string[];
  rows: string[][];
};

export type WikiImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type WikiSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
  steps?: string[];
  table?: WikiTable;
  images?: WikiImage[];
};

export type QuestKind = 'main' | 'miniquest';

export type WikiEntry = {
  slug: string;
  title: string;
  type: 'Item' | 'Recipe' | 'Guide' | 'Activity' | 'Creature' | 'NPC' | 'Location' | 'System' | 'Resource' | 'Quest';
  questKind?: QuestKind;
  verification: Verification;
  summary: string;
  intro: string;
  aliases?: string[];
  categories: string[];
  technicalId?: string;
  facts: WikiFact[];
  sections: WikiSection[];
  image?: WikiImage;
  related?: string[];
  externalSources?: ExternalSource[];
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

function potionOutput(detail: (typeof potionRecipeDetails)[string]) {
  return detail.secondaryOutput ? `${detail.output} + ${detail.secondaryOutput}` : detail.output;
}

function potionDetailRow(detail: (typeof potionRecipeDetails)[string]) {
  return [detail.input, `LVL ${detail.level}`, potionOutput(detail), detail.duration ? `${detail.duration} seconds` : 'Not listed', detail.notes];
}

const curatedEntries: WikiEntry[] = [
  {
    slug: 'infused-coal',
    title: 'Infused Coal',
    type: 'Item',
    verification: 'engine',
    summary: 'A Potion Making material produced by reducing Coal with Essence.',
    intro: 'Infused Coal is a stackable Potion Making material produced at a Reduction Station from Coal and Essence.',
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
        title: 'Batch example',
        bullets: [
          'A 26-item batch uses 26 Coal and 52 Essence.',
          'The output is 26 Infused Coal.',
          'Coal occupies the remaining 26 slots when Essence and finished Infused Coal are kept as two stackable inventory slots.',
        ],
      },
      {
        title: 'How it works',
        paragraphs: ['Choose Infused Coal at a Reduction Station. If enough ingredients are available, the station can continue processing the batch after the first selection.'],
      },
    ],
    related: ['coal', 'essence', 'potion-making', 'recipe-infused-coal'],
    source: playerSource,
  },
  {
    slug: 'coal',
    title: 'Coal',
    type: 'Item',
    verification: 'engine',
    summary: 'A raw mining resource used to make Infused Coal.',
    intro: 'Coal is a mining and crafting resource. One Coal is consumed for every Infused Coal produced.',
    aliases: ['Coal Ore', 'item 27'],
    categories: ['Items', 'Mining', 'Materials'],
    technicalId: 'ItemDataKey 27',
    facts: [{ label: 'Item key', value: '27' }, { label: 'Known use', value: 'Infused Coal' }, { label: 'Recipe cost', value: '1 per craft' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [
      { title: 'Uses', paragraphs: ['At a Reduction Station, combine one Coal with two Essence to make one Infused Coal.'] },
      { title: 'Where to find it', paragraphs: ['Coal rocks can be found in the Ebony Caves. Mining requirements and respawn timing still need to be added to this guide.'] },
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
    intro: 'Essence is a stackable Potion Making material. Making one Infused Coal consumes two Essence and one Coal.',
    aliases: ['item 117'],
    categories: ['Items', 'Potion Making', 'Materials'],
    technicalId: 'ItemDataKey 117',
    facts: [{ label: 'Item key', value: '117' }, { label: 'Known use', value: 'Infused Coal' }, { label: 'Recipe cost', value: '2 per craft' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [
      { title: 'Uses', paragraphs: ['Two Essence are consumed alongside one Coal to make one Infused Coal.'] },
      { title: 'How to obtain it', paragraphs: ['Essence can be processed from small, regular, and large Essence Glands at a Reduction Station. See the gland-processing guide for current yield information.'] },
    ],
    related: ['infused-coal', 'recipe-reduce-essence-gland', 'recipe-reduce-large-essence-gland', 'recipe-reduce-essence-geode', 'essence-rock'],
    source: documentedSource,
  },
  {
    slug: 'coins',
    title: 'Coins',
    type: 'Item',
    verification: 'engine',
    summary: 'The main currency used throughout Winds of Valen.',
    intro: 'Coins are used for shops, services, and other purchases. They can be carried in the inventory or stored in the bank and collection box.',
    aliases: ['currency', 'item 1'],
    categories: ['Items', 'Currency'],
    technicalId: 'ItemDataKey 1',
    facts: [{ label: 'Item key', value: '1' }, { label: 'Type', value: 'Currency' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [
      { title: 'Storage', paragraphs: ['Coins can appear in the player inventory, bank, and collection box. Open the bank to check the amount currently stored there.'] },
      { title: 'Collection box', paragraphs: ['If the collection box display appears out of date, close and reopen it before relying on the shown balance.'] },
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
    intro: 'Carp is a fish that can be processed into Fine Fish Scales while also producing Large Essence Glands for reduction.',
    aliases: ['item 104'],
    categories: ['Items', 'Fishing', 'Potion Making'],
    technicalId: 'ItemDataKey 104',
    facts: [{ label: 'Item key', value: '104' }, { label: 'Batch size', value: '10 Carp' }, { label: 'First station', value: 'Cutting Station' }, { label: 'Verification', value: 'Player confirmed' }],
    sections: [
      { title: 'Processing', bullets: ['Cut 10 Carp into 10 Hardened Fish Scales and 10 Large Essence Glands.', 'Reduce the scales into 10 Polished Fish Scales.', 'Crush those scales into 10 Fine Fish Scales.', 'Reduce the Large Essence Glands separately; see the gland-processing guide for current yields.'] },
      { title: 'Fishing', paragraphs: ['Carp spots were observed around a dedicated pier. Fishing continues automatically after one successful spot interaction, and the spot eventually depletes and respawns.'] },
    ],
    related: ['fishing', 'carp-processing', 'recipe-harvest-carp'],
    source: playerSource,
  },
  {
    slug: 'mithril-sword',
    title: 'Mithril Sword',
    type: 'Item',
    verification: 'engine',
    summary: 'A mithril-tier melee weapon.',
    intro: 'The Mithril Sword is a melee weapon. Its combat bonuses, requirements, value, and acquisition method still need to be added.',
    categories: ['Items', 'Equipment', 'Weapons'],
    technicalId: 'ItemDataKey 59',
    facts: [{ label: 'Item key', value: '59' }, { label: 'Asset', value: 'DA_mithril_sword' }, { label: 'Type', value: 'Weapon' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [{ title: 'Details still needed', bullets: ['Combat bonuses', 'Equip requirements', 'Trade value', 'Where to obtain it'] }],
    related: ['combat'],
    source: bridgeSource,
  },
  {
    slug: 'berserker-gloves',
    title: 'Berserker Gloves',
    type: 'Item',
    verification: 'engine',
    summary: 'Berserker armour worn in the gloves slot.',
    intro: 'Berserker Gloves are worn in the gloves slot. Their bonuses, requirements, value, and acquisition method still need to be added.',
    categories: ['Items', 'Equipment', 'Armour'],
    technicalId: 'ItemDataKey 60',
    facts: [{ label: 'Item key', value: '60' }, { label: 'Asset', value: 'DA_berserker_gloves' }, { label: 'Slot', value: 'Gloves' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [{ title: 'Details still needed', bullets: ['Combat bonuses', 'Equip requirements', 'Trade value', 'Where to obtain them'] }],
    related: ['berserker-boots', 'combat'],
    source: bridgeSource,
  },
  {
    slug: 'berserker-boots',
    title: 'Berserker Boots',
    type: 'Item',
    verification: 'engine',
    summary: 'Berserker armour worn in the boots slot.',
    intro: 'Berserker Boots are worn in the boots slot. Their bonuses, requirements, value, and acquisition method still need to be added.',
    categories: ['Items', 'Equipment', 'Armour'],
    technicalId: 'ItemDataKey 61',
    facts: [{ label: 'Item key', value: '61' }, { label: 'Asset', value: 'DA_berserker_boots' }, { label: 'Slot', value: 'Boots' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [{ title: 'Details still needed', bullets: ['Combat bonuses', 'Equip requirements', 'Trade value', 'Where to obtain them'] }],
    related: ['berserker-gloves', 'combat'],
    source: bridgeSource,
  },
  {
    slug: 'advanced-parry-shield',
    title: 'Advanced Parry Shield',
    type: 'Item',
    verification: 'engine',
    summary: 'An advanced shield used for parrying attacks.',
    intro: 'The Advanced Parry Shield is defensive equipment built around parrying. Its exact bonuses, requirements, and acquisition method still need to be added.',
    categories: ['Items', 'Equipment', 'Shields'],
    technicalId: 'ItemDataKey 67',
    facts: [{ label: 'Item key', value: '67' }, { label: 'Asset', value: 'DA_advanced_parry_shield' }, { label: 'Type', value: 'Shield' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [{ title: 'Details still needed', bullets: ['Parry behaviour', 'Defensive bonuses', 'Equip requirements', 'Where to obtain it'] }],
    related: ['combat'],
    source: bridgeSource,
  },
  {
    slug: 'gilded-potion',
    title: 'Gilded Potion',
    type: 'Item',
    verification: 'engine',
    summary: 'A gilded-tier potion item made through Potion Making.',
    intro: 'Gilded Potion is a Potion Making item. Its effect, duration, ingredients, and level requirement still need to be added.',
    categories: ['Items', 'Potions', 'Potion Making'],
    technicalId: 'ItemDataKey 112',
    facts: [{ label: 'Item key', value: '112' }, { label: 'Asset', value: 'DA_gilded_potion' }, { label: 'Recipe asset', value: 'Recipe_Bottle_GildedPotion' }, { label: 'Verification', value: 'Engine verified' }],
    sections: [{ title: 'Details still needed', bullets: ['Potion effect', 'Duration', 'Ingredients', 'Level requirement'] }],
    related: ['recipe-bottle-gilded-potion', 'potion-making'],
    source: bridgeSource,
  },
  {
    slug: 'fishing',
    title: 'Fishing',
    type: 'Activity',
    verification: 'player',
    summary: 'A gathering skill for catching fish used as food, bait, and potion ingredients.',
    intro: 'Fishing is a gathering profession. Equip a fishing rod, bring the required bait, and interact with a fishing spot to begin catching fish automatically.',
    categories: ['Activities', 'Skills', 'Fishing'],
    facts: [{ label: 'Interaction', value: 'Click once' }, { label: 'Loop', value: 'Automatic' }, { label: 'Resource', value: 'Depleting ripple spot' }, { label: 'Known fish', value: 'Carp, Blue Gill' }],
    sections: [
      { title: 'How fishing works', bullets: ['Equip the correct rod and bait for the chosen spot.', 'Interact with a visible ripple once.', 'Fishing continues automatically while the spot remains available.', 'Move to another spot when the ripple depletes; spots later respawn.', 'Bank or process the catch when the inventory is full.'] },
      { title: 'Fishing progression', table: { headers: ['Level', 'Fish', 'Bait', 'Location', 'Base XP'], rows: [['1', 'Minnow', 'Tiny Fish Bait or Tiny Worm Bait', 'South of Valen Gate, beside the Broken Village bridge', '8'], ['5', 'Common Trout', 'Small Fish Bait or Small Worm Bait', 'East of Valen Gate, along the river', '75'], ['10', 'Perch', 'Small Fish Bait or Small Worm Bait', 'Across the Broken Village bridge', '225'], ['20', 'Bass', 'Small Fish Bait or Small Worm Bait', 'Forest Alcove near the bandit camps', '200'], ['30', 'Blue Gill', 'Small Fish Bait or Small Worm Bait', 'Beside the Mercenary Camp bank', '75'], ['40', 'Elder Trout', 'Medium Fish Bait or Medium Worm Bait', 'Town Mine west of Valen Gate', '500'], ['50', 'Carp', 'Small Fish Bait (observed)', 'Location guide in progress', '1,250']] } },
      { title: 'Bait', paragraphs: ['The observed Carp workflow uses Small Fish Bait. Bait can be made by using a knife on caught fish through the appropriate harvest recipe.'] },
      { title: 'Choosing a spot', paragraphs: ['Ripple graphics do not always make the fish species obvious. Check the hover name before starting so you bring the correct rod and bait.'] },
    ],
    related: ['carp', 'carp-processing', 'potion-making'],
    source: playerSource,
  },
  {
    slug: 'mining',
    title: 'Mining',
    type: 'Activity',
    verification: 'documented',
    summary: 'A gathering skill for extracting ores, dust, geodes, and rare gems from rocks.',
    intro: 'Mining is trained by equipping a pickaxe and mining rocks. Higher levels unlock better resources, while ore containers extend trips before banking.',
    categories: ['Activities', 'Skills', 'Mining'],
    facts: [{ label: 'Availability', value: 'Charges > 0' }, { label: 'Known ores', value: 'Silver, gold, essence, coal, ebony' }, { label: 'Resource crate', value: 'Up to 500 observed' }, { label: 'Verification', value: 'Live state + tests' }],
    sections: [
      { title: 'Rock depletion', paragraphs: ['Move to the next rock when the current one depletes. Continue around the patch while waiting for earlier rocks to return.'] },
      { title: 'Mining progression', table: { headers: ['Level', 'Rock', 'Resource', 'Rare item', 'Base XP'], rows: [['1', 'Copper Rock', 'Copper Ore', 'Weak Power Gem', '15'], ['1', 'Tin Rock', 'Tin Ore', 'Weak Power Gem', '15'], ['10', 'Iron Rock', 'Iron Ore', 'Power Gem', '30'], ['20', 'Coal Rock', 'Coal Ore', 'Strong Power Gem', '80'], ['30', 'Mithril Rock', 'Mithril Ore', 'Fishing Gem', '150'], ['40', 'Silver Rock', 'Silver Ore', 'Strange Gem', '300'], ['40', 'Gold Rock', 'Gold Ore or Gold Dust', 'Mining Gem', '350'], ['50', 'Essence Rock', 'Essence Geode', 'Essence rare drop', '550'], ['60', 'Ebony Rock', 'Ebony Ore or Ebony Dust', 'Strong Mining Gem', '500']] } },
      { title: 'Resource containers', paragraphs: ['Ore containers are equipped separately from the normal 28-slot inventory. Deposit their contents through the resource action in the bank.'] },
      { title: 'Known patches', bullets: ['Silver: six-rock patch.', 'Gold: six-rock volcanic patch.', 'Essence: three-rock patch.', 'Ebony Caves: ebony, silver, coal, and ebony-dust rocks.'] },
    ],
    related: ['silver-rock', 'gold-rock', 'essence-rock', 'cavern-mine'],
    source: documentedSource,
  },
  {
    slug: 'potion-making',
    title: 'Potion Making',
    type: 'Activity',
    verification: 'engine',
    summary: 'A crafting skill that turns fish, monster drops, plants, and Essence into useful potions.',
    intro: 'Potion Making uses cutting, crushing, reduction, brewing, and bottling stations. Process ingredients, brew them with Essence, then use a vial to collect the finished potion.',
    aliases: [
      'Weak Health potion recipe', 'Health potion recipe', 'Strong Health potion recipe', 'Shields potion recipe', 'Strong Shields potion recipe',
      'Fishing potion recipe', 'Mining potion recipe', 'Attack potion recipe', 'Archery potion recipe', 'Magic potion recipe',
      'Gilded Potion bottle recipe', 'Small Potion bottle recipe', 'Strong Potion bottle recipe',
      'Crush Glowing Mushroom', 'Crush Hearty Fish Flesh', 'Crush Mud Root', 'Crush Plain Fish Flesh', 'Crush Scales', 'Crush Small Fang',
      'Harvest Big Trout', 'Harvest Blue Gill', 'Harvest Minnow', 'Harvest Perch', 'Harvest Small Bass', 'Harvest Small Trout',
      'Reduce Essence Gland', 'Reduce Essence Geode', 'Reduce Minced Hearty Fish Flesh', 'Reduce Rare Blue Gill', 'Reduce Rare Minnow', 'Reduce Small Essence Gland', 'Reduce Spider Eye',
    ],
    categories: ['Activities', 'Skills', 'Crafting'],
    facts: [{ label: 'Discovered recipes', value: '37' }, { label: 'Groups', value: 'Cauldron, Crush, Knife, Reduction' }, { label: 'Verified workflow', value: 'Infused Coal' }, { label: 'Verification', value: 'Engine catalogue' }],
    sections: [
      { title: 'Stations', table: { headers: ['Group', 'Purpose', 'Recipes found'], rows: [['Cauldron', 'Bottles and potions', '13'], ['Crush Station', 'Crushing ingredients', '7'], ['Knife Station', 'Harvesting fish', '7'], ['Reduction Station', 'Reducing ingredients and fuel', '10']] } },
      { title: 'Fish processing', table: { headers: ['Fish name', 'Level required', 'Primary material output', 'Essence material output'], rows: fishProcessingRecipes.map((recipe) => [recipe.input, `LVL ${recipe.level}`, recipe.output, recipe.secondaryOutput ?? '(None)']) } },
      { title: 'Reduction and processing', table: { headers: ['Input material', 'Level required', 'Output material / resource', 'Purpose / notes'], rows: potionReductionRecipes.map((recipe) => [recipe.input, `LVL ${recipe.level}`, recipe.output, recipe.notes]) } },
      { title: 'Crush recipes', table: { headers: ['Raw material ingredient', 'Level required', 'Processed material output', 'Ingredient sourcing / notes'], rows: potionCrushRecipes.map((recipe) => [recipe.input, `LVL ${recipe.level}`, recipe.output, recipe.notes]) } },
      { title: 'Potion recipes', table: { headers: ['Potion name', 'Level required', 'Recipe cost', 'Duration (seconds)', 'Primary ingredient source'], rows: potionBrewRecipes.map((recipe) => [recipe.output, `LVL ${recipe.level}`, recipe.input, String(recipe.duration), recipe.notes.replace(/^Primary ingredient source: /, '')]) } },
      { title: 'Using this guide', paragraphs: ['Start with fish processing when you need a primary potion ingredient. Follow the reduction or crush table for the next preparation step, then use the potion table to check the level, cost, duration, and source. Small, Strong, and Gilded bottle pages remain in the recipe index; their supplied costs were not included in these tables.'] },
      { title: 'Known workflows', bullets: ['Infused Coal: 1 Coal + 2 Essence → 1 Infused Coal.', 'Carp processing: 10 Carp → 10 Fine Fish Scales plus Essence from 10 Large Essence Glands. The current reduction table lists 20 Essence per gland.'] },
    ],
    related: ['infused-coal', 'carp-processing'],
    source: bridgeSource,
  },
  {
    slug: 'carp-processing',
    title: 'Carp processing',
    type: 'Guide',
    verification: 'player',
    summary: 'A station sequence that turns Carp into Fine Fish Scales.',
    intro: 'This workflow processes ten Carp across the Knife, Reduction, and Crush stations.',
    categories: ['Guides', 'Potion Making', 'Fishing'],
    facts: [{ label: 'Input', value: '10 Carp' }, { label: 'Output', value: '10 Fine Fish Scales' }, { label: 'By-product', value: '10 Large Essence Glands' }, { label: 'Stations', value: 'Cut, reduce, crush' }],
    sections: [
      { title: 'Quick guide', table: { headers: ['Step', 'Recipe', 'Result'], rows: [['1', 'Recipe_Harvest_Carp', '10 Hardened Fish Scales + 10 Large Essence Glands'], ['2', 'Recipe_Reduce_HardenedScales', '10 Polished Fish Scales'], ['3', 'Recipe_Reduce_LargeEssenceGland', '200 Essence from 10 Large Essence Glands'], ['4', 'Recipe_Crush_RefinedHardenedScales', '10 Fine Fish Scales']] } },
      { title: 'Useful tip', paragraphs: ['Complete each stage before moving to the next station so the intermediate materials remain easy to track in your inventory.'] },
    ],
    related: ['carp', 'fishing', 'potion-making', 'recipe-harvest-carp', 'recipe-crush-refined-hardened-scales'],
    source: playerSource,
  },
  {
    slug: 'banking',
    title: 'Banking',
    type: 'System',
    verification: 'engine',
    summary: 'A four-tab storage system with 400 total slots.',
    intro: 'The bank stores up to 400 item slots across four tabs of 100. Open the bank to view stored items and deposit resources.',
    categories: ['Systems', 'Storage'],
    technicalId: 'W_Bank_C / B_BankComponent_C',
    facts: [{ label: 'Capacity', value: '400 slots' }, { label: 'Tabs', value: '4' }, { label: 'Slots per tab', value: '100' }, { label: 'Visible widget', value: 'W_Bank_C' }, { label: 'Backend', value: 'B_BankComponent_C' }],
    sections: [
      { title: 'Opening the bank', paragraphs: ['After reconnecting, open the bank and give the item list a moment to load before assuming a tab is empty.'] },
      { title: 'Tabs and slots', paragraphs: ['The four tabs contain 100 slots each. Organize commonly used supplies near the front to reduce banking time.'] },
      { title: 'Resource deposits', paragraphs: ['Use the bank’s resource-deposit action to empty an equipped ore or fish container. Make sure the bank has enough room for the transfer.'] },
    ],
    related: ['inventory', 'coins'],
    source: documentedSource,
  },
  {
    slug: 'inventory',
    title: 'Inventory',
    type: 'System',
    verification: 'engine',
    summary: 'The player’s main 28-slot item inventory.',
    intro: 'The main player inventory has 28 slots. Equipped ore and fish containers use separate storage and can hold resources without filling those slots.',
    categories: ['Systems', 'Storage'],
    technicalId: 'PlayerInventoryComponent',
    facts: [{ label: 'Main capacity', value: '28 slots' }, { label: 'Identity field', value: 'ItemDataKey' }, { label: 'Quantity field', value: 'Count' }, { label: 'Resource container', value: 'Separate equipment inventory' }],
    sections: [
      { title: 'Managing space', paragraphs: ['Stackable items share a slot, while unstackable items use one slot each. Bank extra supplies before a long gathering or combat trip.'] },
      { title: 'Resource containers', paragraphs: ['Ore crates and similar equipped bags are separate from the 28-slot inventory. Check both before deciding whether to continue gathering or return to a bank.'] },
    ],
    related: ['banking', 'mining', 'coins'],
    source: documentedSource,
  },
  {
    slug: 'combat',
    title: 'Combat',
    type: 'Activity',
    verification: 'documented',
    summary: 'Target-based combat using weapons, stances, health, shields, and enemy mechanics.',
    intro: 'Choose a target, watch its attacks, and use movement, equipment, and combat stances to survive. Boss guides list important mechanics and recommended responses where known.',
    categories: ['Activities', 'Combat'],
    facts: [{ label: 'Target identity', value: 'Stable actor ID' }, { label: 'Progress signal', value: 'Health falling' }, { label: 'Completion', value: 'Death state' }, { label: 'Known enemy', value: 'Cavern Spider' }],
    sections: [
      { title: 'Choosing targets', paragraphs: ['Keep the intended enemy selected when several creatures of the same type are nearby. Reposition if terrain or another enemy blocks attacks.'] },
      { title: 'Combat basics', bullets: ['Watch the target’s health to judge progress.', 'Move away from telegraphed attacks and dangerous ground effects.', 'Collect drops after the fight and check that there is enough inventory space.'] },
    ],
    related: ['cavern-spider', 'cavern-mine'],
    source: documentedSource,
  },
  {
    slug: 'world-map',
    title: 'Interactive World Map (Still In Maintenance)',
    type: 'Location',
    verification: 'player',
    summary: 'A complete searchable atlas with 157 markers for areas, banks, shops, crafting stations, ores, fishing spots, enemies, and bosses.',
    intro: 'Use the interactive world map to plan trips across Valen. Search for any destination, filter marker categories, zoom into crowded towns, or follow a numbered route designed for new players.',
    aliases: ['World Map', 'Map', 'Atlas'],
    categories: ['Locations', 'World', 'Travel', 'Guides'],
    facts: [
      { label: 'Marker count', value: '157' },
      { label: 'Major areas', value: '10' },
      { label: 'Mining markers', value: '40' },
      { label: 'Fishing spots', value: '8' },
      { label: 'Enemy and boss markers', value: '24' },
    ],
    sections: [
      {
        title: 'Interactive world atlas',
        paragraphs: ['The map includes 157 player-facing world markers on original, watermark-free atlas artwork recreated from the in-game world layout. Area markers remain visible at the overview scale; zoom in, search, choose a filter, or start a route to reveal detailed points without covering the map in overlapping labels.'],
      },
      {
        title: 'How to use the map',
        steps: [
          'Begin with Valen Gate selected to learn the central starting area.',
          'Drag the map to pan and use the mouse wheel, plus and minus buttons, or touch controls to zoom.',
          'Search by a specific name such as Bank, Mithril, Carp, or Elf Warden.',
          'Toggle areas, services, mining, fishing, enemies, and bosses to show only what you need.',
          'Select a marker to read its purpose, centre it, and open the most relevant guide inside this wiki.',
          'Choose a numbered route to move through its stops in order. Use Fit world whenever you want to return to the full overview.',
        ],
      },
      {
        title: 'World orientation',
        table: {
          headers: ['Region', 'Direction from Valen Gate', 'What players use it for'],
          rows: [
            ['Valen City', 'North', 'Members city, bank, shops, advanced crafting, Large Cauldron'],
            ['Alcott Forest and Elven Haven', 'East and north-east', 'Bandits, elves, bosses, Mithril, Bass, Blue Gill, and Carp'],
            ['Farmlands and Valen Port', 'South-east', 'Early animals, fishing, pirates, bank, shops, and crafting'],
            ['Goblin Village and West Cavern', 'West', 'Goblin combat, ore progression, underground enemies, and bosses'],
            ['Grave Town', 'South-west', 'Banking, Smithing, undead combat, and the road into the Darklands'],
            ['Darklands', 'Far south-west', 'High-risk PvP travel, volcanic mining, and stronger enemies'],
          ],
        },
      },
      {
        title: 'Marker guide',
        table: {
          headers: ['Marker', 'Count', 'Use'],
          rows: [
            ['Cities and areas', '10', 'Orient yourself and understand the surrounding region'],
            ['Banks, shops, and stations', '75', 'Store items, respawn, heal, buy supplies, and craft'],
            ['Mining', '40', 'Find named ore rocks and additional mining areas'],
            ['Fishing', '8', 'Find Minnow, Common Trout, Perch, Bass, Blue Gill, Elder Trout, and Carp waters'],
            ['Enemies', '15', 'Locate combat training spawns'],
            ['Bosses', '9', 'Plan supplies and nearby banking before major encounters'],
          ],
        },
      },
      {
        title: 'Recommended first route',
        paragraphs: ['Choose New player circuit above the map. It begins at Valen Gate, follows the early Minnow, Common Trout, and Perch waters, crosses the Farmlands, and finishes at Valen Port. This teaches the central river, the south-eastern roads, and two important settlements without sending a new player into the Darklands.'],
      },
    ],
    related: ['valen-city', 'the-darklands', 'cavern-mine', 'mining', 'fishing', 'banking', 'open-the-gates'],
    source: { label: 'Winds of Valen world guide', detail: 'Original wiki artwork based on the in-game world layout, paired with a player-facing marker set.', observed: '31 August 2026' },
  },
  {
    slug: 'cavern-mine',
    title: 'Ebony Caves',
    type: 'Location',
    verification: 'player',
    summary: 'A mapped Darklands cave network containing Ebony Ore, Ebony Dust, Silver Ore, and spider-filled chambers.',
    intro: 'The Ebony Caves form a branching mining network in the Darklands. Enter from the southern stairs, use the central chambers as landmarks, and follow the outer branches to reach the richest ebony and silver rooms.',
    aliases: ['Cavern Mine', 'Ebony Cave', 'Ebony Cavern', 'Ebony Caves map'],
    categories: ['Locations', 'Mining', 'Darklands', 'Bestiary'],
    facts: [{ label: 'Entrance', value: 'Southern stairs' }, { label: 'Resources', value: 'Ebony Ore, Ebony Dust, Silver Ore' }, { label: 'Main enemy', value: 'Cavern Spiders' }, { label: 'Mapped resource minimum', value: '14 Ebony Ore · 9 Ebony Dust · 21 Silver Ore' }],
    sections: [
      {
        title: 'Cave map',
        paragraphs: ['The entrance is at the bottom of the map, with north pointing upward. Use the interactive filters, room selector, and numbered routes to learn the cave; the original full-resolution layout remains available beneath the map.'],
        images: [{ src: '/wiki-assets/ebony-caves-map.png', alt: 'Detailed map of the Ebony Caves showing the southern entrance, connecting tunnels, resource rooms, and spider chambers', caption: 'Map layout by Ichigo. Purple clusters mark Ebony Ore or Ebony Dust, white clusters mark Silver Ore, and spider symbols mark dangerous chambers.' }],
      },
      {
        title: 'Resource rooms',
        paragraphs: ['The labelled rooms contain at least 14 Ebony Ore rocks, 9 Ebony Dust rocks, and 21 Silver Ore rocks. Counts describe the marked map layout and may change if the cave is rebalanced.'],
        table: {
          headers: ['Map area', 'Marked resources', 'Spider warning'],
          rows: [
            ['North-west outer chamber', '5 Ebony Ore', 'Spiders'],
            ['West dust chamber', '2 Ebony Dust · 1 Ebony Ore', 'Spiders shown'],
            ['West lower chamber', '1 Silver Ore', 'No warning marked'],
            ['North end chamber', '3 Ebony Dust · 1 Ebony Ore', 'Spiders'],
            ['North central junction', '6 Silver Ore', 'Spiders'],
            ['Central upper chamber', '5 Ebony Ore · 2 Silver Ore', 'Spiders'],
            ['North-east chamber', '4 Ebony Dust · 2 Silver Ore', 'No warning marked'],
            ['Far-east side chamber', '2 Ebony Ore · 2 Silver Ore', 'No warning marked'],
            ['East middle chamber', '5 Silver Ore', 'Spiders'],
            ['South-east chamber', '3 Silver Ore', 'No warning marked'],
          ],
        },
      },
      {
        title: 'Finding your way',
        steps: [
          'Enter from the southern stairs and travel north to the first large spider chamber.',
          'Use the central four-way junction above that chamber as your main landmark.',
          'Take the western branch for the west Silver room, the two western Ebony rooms, and the north-west five-rock Ebony room.',
          'Continue north through the central route for the six-rock Silver junction and the northern Ebony Dust chamber.',
          'Take the eastern branch for the mixed Ebony and Silver rooms, then follow the lower loop back toward the entrance.',
        ],
      },
      {
        title: 'Mining route suggestions',
        bullets: [
          'For Ebony Ore, prioritise the north-west five-rock room and the central upper five-rock room, then continue to the far-east two-rock chamber.',
          'For Ebony Dust, visit the west two-rock chamber, north three-rock chamber, and north-east four-rock chamber.',
          'For Silver Ore, the north central six-rock junction and east middle five-rock chamber are the largest marked groups.',
          'A full mixed-resource circuit can follow the outer loop and return to the southern entrance without retracing every corridor.',
        ],
      },
      { title: 'Creatures and hazards', paragraphs: ['Spider chambers are marked throughout the central, western, northern, and eastern routes. Cavern Spiders currently return about 15 seconds after defeat, so do not rely on a cleared room staying safe for long. Webbed floors help identify rooms where spiders may be nearby, even when the map does not show a written warning.'] },
    ],
    related: ['cavern-spider', 'cavern-goblin', 'cavern-goblin-hunter', 'mining'],
    source: { label: 'Player-supplied cave map', detail: 'Room layout and marked resource counts transcribed from the supplied Ebony Caves map.', observed: '31 August 2026' },
  },
  {
    slug: 'cavern-spider',
    title: 'Cavern Spider',
    type: 'Creature',
    verification: 'engine',
    summary: 'A hostile spider found throughout the Ebony Caves.',
    intro: 'Cavern Spiders are hostile creatures found among the ore rocks, webbed rooms, and passages of the Ebony Caves.',
    categories: ['Creatures', 'Bestiary', 'Ebony Caves'],
    facts: [{ label: 'Location', value: 'Ebony Caves' }, { label: 'Observed respawn', value: 'About 15 seconds' }, { label: 'Common terrain', value: 'Webbed chambers and mining rooms' }],
    sections: [
      { title: 'Location', paragraphs: ['Look for Cavern Spiders among the ebony, silver, and coal rocks in the Ebony Caves. The cave map marks spider rooms along the central route and several outer resource branches.'] },
      { title: 'Combat information', paragraphs: ['Cavern Spiders currently return about 15 seconds after defeat. Health, attacks, drops, weaknesses, and experience still need to be added.'] },
    ],
    related: ['cavern-mine', 'combat'],
    source: bridgeSource,
  },
  {
    slug: 'volcano-skeleton-archer',
    title: 'Volcano Skeleton Archer',
    type: 'Creature',
    verification: 'observed',
    summary: 'A ranged skeleton enemy found around the volcanic combat area.',
    intro: 'The Volcano Skeleton Archer attacks from range in the volcanic combat area. Drops, health, accuracy, damage, and respawn time still need to be added.',
    categories: ['Creatures', 'Bestiary', 'Volcano'],
    technicalId: 'B_VolcanoSkeleton_Archer_C',
    facts: [{ label: 'Class', value: 'B_VolcanoSkeleton_Archer_C' }, { label: 'Combat style', value: 'Ranged (name-derived)' }, { label: 'Location', value: 'Volcano area' }, { label: 'Verification', value: 'Live observation' }],
    sections: [{ title: 'Combat tips', paragraphs: ['Close the distance quickly or use ranged cover where available. Bring enough food or potions until its damage and attack timing are fully documented.'] }],
    related: ['combat'],
    source: documentedSource,
  },
  {
    slug: 'silver-rock',
    title: 'Silver rock',
    type: 'Resource',
    verification: 'observed',
    summary: 'A mining rock used to gather Silver.',
    intro: 'A six-rock Silver patch supports a repeatable mining loop. Move to the next rock when the current one depletes.',
    categories: ['Resources', 'Mining'],
    technicalId: 'B_MiningRock_Silver_C',
    facts: [{ label: 'Class', value: 'B_MiningRock_Silver_C' }, { label: 'Recorded patch', value: '6 rocks' }, { label: 'Availability', value: 'Charges > 0' }, { label: 'Verification', value: 'Live observation' }],
    sections: [{ title: 'Mining', paragraphs: ['Mine around the six-rock loop and move on whenever a rock depletes. Use a resource container to extend the trip before banking.'] }],
    related: ['mining'],
    source: documentedSource,
  },
  {
    slug: 'gold-rock',
    title: 'Gold rock',
    type: 'Resource',
    verification: 'observed',
    summary: 'A volcanic gold mining rock with a recorded six-rock patch.',
    intro: 'A six-rock Gold patch can be found in the volcanic area. Its requirements, experience, respawn timing, and yield still need to be added.',
    categories: ['Resources', 'Mining', 'Volcano'],
    technicalId: 'B_MiningRock_Gold_Volcanic_C',
    facts: [{ label: 'Class', value: 'B_MiningRock_Gold_Volcanic_C' }, { label: 'Recorded patch', value: '6 rocks' }, { label: 'Area', value: 'Volcanic' }, { label: 'Verification', value: 'Live observation' }],
    sections: [{ title: 'Mining', paragraphs: ['Continue around the six-rock patch as rocks deplete. Prepare for volcanic-area hazards and nearby enemies.'] }],
    related: ['mining'],
    source: documentedSource,
  },
  {
    slug: 'essence-rock',
    title: 'Essence rock',
    type: 'Resource',
    verification: 'observed',
    summary: 'A mining rock used to gather Essence-related resources.',
    intro: 'Three Essence rocks were recorded in one patch near a bank.',
    categories: ['Resources', 'Mining', 'Potion Making'],
    technicalId: 'B_MiningRock_Essence_C',
    facts: [{ label: 'Class', value: 'B_MiningRock_Essence_C' }, { label: 'Recorded patch', value: '3 rocks' }, { label: 'Availability', value: 'Charges > 0' }, { label: 'Verification', value: 'Live observation' }],
    sections: [{ title: 'Mining', paragraphs: ['Mine around the three-rock patch. The exact yield and requirements still need to be added.'] }],
    related: ['essence', 'mining'],
    source: documentedSource,
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
      { title: 'Verification labels', table: { headers: ['Label', 'Meaning'], rows: [['Engine verified', 'Read from a targeted engine object or item instance.'], ['Live observation', 'Seen in a timestamped world snapshot.'], ['Player confirmed', 'Measured through a repeatable workflow and inventory checks.'], ['Project documented', 'Confirmed by implementation notes and passing tests.']] } },
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
  { slug: 'recipe-reduce-essence-geode', title: 'Reduce Essence Geode', id: 'Recipe_Reduce_EssenceGeode', group: 'Reduction Station' },
  { slug: 'recipe-reduce-essence-gland', title: 'Reduce Essence Gland', id: 'Recipe_Reduce_EssenceGland', group: 'Reduction Station' },
  { slug: 'recipe-reduce-hardened-scales', title: 'Reduce Hardened Scales', id: 'Recipe_Reduce_HardenedScales', group: 'Reduction Station' },
  { slug: 'recipe-reduce-large-essence-gland', title: 'Reduce Large Essence Gland', id: 'Recipe_Reduce_LargeEssenceGland', group: 'Reduction Station' },
  { slug: 'recipe-reduce-minced-hearty-fish-flesh', title: 'Reduce Minced Hearty Fish Flesh', id: 'Recipe_Reduce_MincedHeartyFishFlesh', group: 'Reduction Station' },
  { slug: 'recipe-reduce-rare-blue-gill', title: 'Reduce Rare Blue Gill', id: 'Recipe_Reduce_RareBlueGill', group: 'Reduction Station' },
  { slug: 'recipe-reduce-rare-minnow', title: 'Reduce Rare Minnow', id: 'Recipe_Reduce_RareMinnow', group: 'Reduction Station' },
  { slug: 'recipe-reduce-small-essence-gland', title: 'Reduce Small Essence Gland', id: 'Recipe_Reduce_SmallEssenceGland', group: 'Reduction Station' },
  { slug: 'recipe-reduce-spider-eye', title: 'Reduce Spider Eye', id: 'Recipe_Reduce_SpiderEye', group: 'Reduction Station' },
];

const knownRecipeNotes: Record<string, { summary: string; bullets: string[]; related: string[] }> = {
  'recipe-infused-coal': {
    summary: 'The Reduction Station recipe that makes Infused Coal.',
    bullets: ['Consumes 1 Coal and 2 Essence per craft.', 'Produces 1 Infused Coal.', 'Selecting it once can process the complete available batch continuously.'],
    related: ['infused-coal', 'coal', 'essence'],
  },
  'recipe-harvest-carp': {
    summary: 'A Knife Station recipe that processes Carp.',
    bullets: ['Each Carp produces Hardened Fish Scales and a Large Essence Gland in the confirmed workflow.', 'Ten Carp produced ten of each observed output.'],
    related: ['carp', 'carp-processing'],
  },
  'recipe-reduce-hardened-scales': {
    summary: 'A Reduction Station stage in the Carp processing workflow.',
    bullets: ['Ten Hardened Fish Scales produced ten Polished Fish Scales in the confirmed batch.'],
    related: ['carp-processing', 'recipe-crush-refined-hardened-scales'],
  },
  'recipe-reduce-large-essence-gland': {
    summary: 'A confirmed recipe identity used to reduce Large Essence Glands.',
    bullets: ['The recipe consumed ten Large Essence Glands in the confirmed batch.', 'The current reduction table lists 20 Essence per Large Essence Gland.'],
    related: ['carp-processing', 'essence'],
  },
  'recipe-crush-refined-hardened-scales': {
    summary: 'A Crush Station stage that produces Fine Fish Scales.',
    bullets: ['Ten Polished Fish Scales produced ten Fine Fish Scales in the confirmed batch.'],
    related: ['carp-processing', 'carp'],
  },
};

const potionDataSource = {
  label: 'Potion Making reference tables',
  detail: 'Supplied processing, fish, and potion recipe tables consolidated into player-facing recipe pages.',
  observed: 'August 2026',
};

function potionDetailSection(detail: (typeof potionRecipeDetails)[string]) {
  return {
    title: 'Recipe details',
    table: {
      headers: ['Input', 'Level required', 'Output', 'Duration', 'Purpose / notes'],
      rows: [potionDetailRow(detail)],
    },
  };
}

const recipeEntries: WikiEntry[] = recipeSpecs.map((recipe) => {
  const known = knownRecipeNotes[recipe.slug];
  const detail = potionRecipeDetails[recipe.slug];
  return {
    slug: recipe.slug,
    title: recipe.title,
    type: 'Recipe',
    verification: known ? 'player' : detail ? 'documented' : 'engine',
    summary: known?.summary ?? (detail ? `${detail.input} produces ${potionOutput(detail)} at the ${recipe.group}.` : `A Potion Making recipe used at the ${recipe.group}; details still need to be added.`),
    intro: known?.summary ?? (detail ? `${recipe.title} uses ${detail.input} at the ${recipe.group}. It requires ${detail.level} Potion Making and produces ${potionOutput(detail)}.` : `${recipe.title} belongs to the ${recipe.group}. Its ingredients, quantities, requirements, and output have not yet been added to this guide.`),
    aliases: [],
    categories: ['Recipes', 'Potion Making', recipe.group],
    facts: [
      { label: 'Station', value: recipe.group },
      ...(detail ? [
        { label: 'Required level', value: `LVL ${detail.level}` },
        { label: 'Output', value: potionOutput(detail) },
        ...(detail.duration ? [{ label: 'Duration', value: `${detail.duration} seconds` }] : []),
      ] : [{ label: 'Guide status', value: known ? 'Ingredients and outputs listed' : 'More details needed' }]),
    ],
    sections: detail
      ? [potionDetailSection(detail), ...(known ? [{ title: 'Workflow notes', bullets: known.bullets }] : [])]
      : known
      ? [
          { title: 'Recipe details', bullets: known.bullets },
        ]
      : [
          { title: 'What we know', paragraphs: [`This recipe is used at the ${recipe.group}. More player-facing details are still needed.`] },
          { title: 'Details still needed', bullets: ['Input items and quantities', 'Output item and quantity', 'Skill or level requirement', 'Experience reward', 'Potion effect or ingredient use'] },
        ],
    related: known?.related ?? ['potion-making'],
    source: detail ? potionDataSource : known ? playerSource : bridgeSource,
  };
});

const smithingSource = {
  label: 'Current Smithing catalogue',
  detail: 'Read from the furnace, anvil, and workbench available to a player in the current game build.',
  observed: '28 August 2026',
};

function smithingRecipeTitle(recipe: SmithingRecipe) {
  if (recipe.slug === 'gold-bar-from-ore') return 'Gold Bar from Gold Ore recipe';
  if (recipe.slug === 'gold-bar-from-dust') return 'Gold Bar from Gold Dust recipe';
  if (recipe.slug === 'ebony-bar-from-ore') return 'Ebony Bar from Ebony Ore recipe';
  if (recipe.slug === 'ebony-bar-from-dust') return 'Ebony Bar from Ebony Dust recipe';
  return `${recipe.output} recipe`;
}

function formatSmithingXp(recipe: SmithingRecipe) {
  return recipe.xp === null ? 'Not confirmed' : String(recipe.xp);
}

const smithingRecipeEntries: WikiEntry[] = smithingRecipes.map((recipe) => ({
  slug: `recipe-smithing-${recipe.slug}`,
  title: smithingRecipeTitle(recipe),
  type: 'Recipe',
  verification: 'engine',
  summary: `Make ${recipe.outputQuantity} ${recipe.output} at the ${recipe.station} with level ${recipe.level} Smithing.`,
  intro: `${recipe.output} is made at the ${recipe.station}. You need level ${recipe.level} Smithing and the ingredients listed below.`,
  aliases: recipe.output.startsWith('Dusk Knight') ? [recipe.output.replace('Dusk Knight', 'DuskKnight')] : [],
  categories: ['Recipes', 'Smithing', recipe.station],
  facts: [
    { label: 'Station', value: recipe.station },
    { label: 'Smithing level', value: String(recipe.level) },
    { label: 'Smithing XP', value: formatSmithingXp(recipe) },
    { label: 'Craft time', value: `${recipe.seconds} seconds` },
    { label: 'Output', value: `${recipe.outputQuantity} ${recipe.output}` },
  ],
  sections: [
    {
      title: 'Ingredients',
      table: {
        headers: ['Ingredient', 'Quantity'],
        rows: recipe.ingredients.map(({ item, quantity }) => [item, String(quantity)]),
      },
    },
    {
      title: 'How to craft it',
      bullets: [
        `Reach level ${recipe.level} Smithing.`,
        `Bring ${formatSmithingIngredients(recipe)}.`,
        recipe.station === 'Furnace'
          ? 'Open a furnace and choose this bar from the available recipes.'
          : recipe.station === 'Anvil'
            ? 'Bring a Smithing Hammer, open an anvil, and choose this component.'
            : 'Open a workbench and choose this item to assemble it.',
        `One craft produces ${recipe.outputQuantity} ${recipe.output} and takes about ${recipe.seconds} seconds.`,
      ],
    },
  ],
  related: ['smithing', smithingItemSlug(recipe.output)],
  source: smithingSource,
}));

const recipesByOutput = new Map<string, SmithingRecipe[]>();
for (const recipe of smithingRecipes) {
  const group = recipesByOutput.get(recipe.output) ?? [];
  group.push(recipe);
  recipesByOutput.set(recipe.output, group);
}

const smithingItemEntries: WikiEntry[] = [...recipesByOutput.entries()].map(([item, methods]) => {
  const uses = smithingRecipes.filter((recipe) => recipe.ingredients.some((ingredient) => ingredient.item === item));
  const isEquipment = /(?:Sword|Platelegs|Platebody|Helmet|Gloves|Ring|Ward|Boots)$/.test(item) || item === 'Ore Crate';
  const isComponent = item.startsWith('Dusk Knight') && !isEquipment;
  const description = smithingItemDescriptions[item]
    ?? (isComponent
      ? `${item} is a forged component used in Dusk Knight armour assembly.`
      : isEquipment
        ? `${item} is equipment assembled through Smithing.`
        : `${item} is a Smithing material used in later recipes.`);

  return {
    slug: smithingItemSlug(item),
    title: item,
    type: 'Item',
    verification: 'engine',
    summary: description,
    intro: `${description} The current crafting methods are listed below.`,
    aliases: item.startsWith('Dusk Knight') ? [item.replace('Dusk Knight', 'DuskKnight')] : [],
    categories: ['Items', 'Smithing', isEquipment ? 'Equipment' : 'Materials'],
    facts: [
      { label: 'Crafted at', value: [...new Set(methods.map((recipe) => recipe.station))].join(' or ') },
      { label: 'Smithing level', value: [...new Set(methods.map((recipe) => String(recipe.level)))].join(' or ') },
      { label: 'Craft time', value: [...new Set(methods.map((recipe) => `${recipe.seconds} seconds`))].join(' or ') },
    ],
    sections: [
      {
        title: methods.length === 1 ? 'Crafting method' : 'Crafting methods',
        table: {
          headers: ['Station', 'Level', 'Ingredients', 'Output', 'XP', 'Time'],
          rows: methods.map((recipe) => [
            recipe.station,
            String(recipe.level),
            formatSmithingIngredients(recipe),
            `${recipe.outputQuantity} ${recipe.output}`,
            formatSmithingXp(recipe),
            `${recipe.seconds}s`,
          ]),
        },
      },
      uses.length > 0
        ? {
            title: 'Used in Smithing',
            table: {
              headers: ['Result', 'Station', 'Level', 'Amount needed'],
              rows: uses.map((recipe) => [
                recipe.output,
                recipe.station,
                String(recipe.level),
                String(recipe.ingredients.find((ingredient) => ingredient.item === item)?.quantity ?? 0),
              ]),
            },
          }
        : {
            title: 'Using the item',
            paragraphs: [isEquipment
              ? 'This is a finished piece of equipment rather than an intermediate Smithing material.'
              : 'No later Smithing recipe currently consumes this item.'],
          },
    ],
    related: ['smithing', ...methods.map((recipe) => `recipe-smithing-${recipe.slug}`)],
    source: smithingSource,
  };
});

const existingItemSlugs = new Set([
  ...curatedEntries.filter((entry) => entry.type === 'Item').map((entry) => entry.slug),
  ...communityEntries.filter((entry) => entry.type === 'Item').map((entry) => entry.slug),
  ...smithingItemEntries.map((entry) => entry.slug),
]);

const itemCatalogueEntries: WikiEntry[] = itemCatalogueSpecs
  .filter((item) => item.title !== 'Coal Ore' && !existingItemSlugs.has(item.slug))
  .map((item) => {
    const store = itemStoreInfo[item.title];
    return {
      slug: item.slug,
      title: item.title,
      type: 'Item',
      verification: 'documented',
      summary: item.summary,
      intro: `${item.summary} This page collects its current uses, requirements, and availability information.`,
      aliases: item.aliases,
      categories: item.categories,
      facts: [{ label: 'Item type', value: item.categories.at(-1) ?? 'Material' }],
      sections: [
        { title: 'Overview', paragraphs: [item.summary] },
        {
          title: 'Availability',
          paragraphs: [store
            ? `Buy this item for ${store.price}g at ${store.stores.join(' or ')}.`
            : 'No current store listing is recorded for this item. Check the related recipe, creature, or skill page for how to obtain it.'],
        },
      ],
      related: ['potion-making', 'smithing', 'mining'].filter((relatedSlug) => item.categories.some((category) => relatedSlug.replaceAll('-', ' ') === category.toLowerCase())),
      source: documentedSource,
    };
  });

const smithingGuide: WikiEntry = {
  slug: 'smithing',
  title: 'Smithing',
  type: 'Activity',
  verification: 'engine',
  summary: 'The complete current Smithing guide, covering every furnace, anvil, and workbench recipe.',
  intro: 'Smithing turns ore into bars, bars into shaped components, and those components into weapons, armour, equipment, and specialist items.',
  aliases: ['smithing guide', 'smelting', 'blacksmithing'],
  categories: ['Activities', 'Skills', 'Crafting', 'Smithing'],
  facts: [
    { label: 'Total recipes', value: String(smithingRecipes.length) },
    { label: 'Furnace recipes', value: String(smithingRecipes.filter((recipe) => recipe.station === 'Furnace').length) },
    { label: 'Anvil recipes', value: String(smithingRecipes.filter((recipe) => recipe.station === 'Anvil').length) },
    { label: 'Workbench recipes', value: String(smithingRecipes.filter((recipe) => recipe.station === 'Workbench').length) },
  ],
  sections: [
    {
      title: 'How Smithing works',
      bullets: [
        'Mine or obtain the ore and secondary materials required by the item you want.',
        'Smelt ores into bars at a furnace.',
        'Use a Smithing Hammer at an anvil to shape bars into plates, rods, foil, frames, and armour components.',
        'Use a workbench to assemble weapons, armour, an ore crate, the Volcanic Ring, the Volcanic Ward, and Dusk Knight equipment.',
        'Keep intermediate plates and rods until you have checked the complete final-item recipe; advanced equipment uses several stages.',
      ],
    },
    {
      title: 'Furnace recipes',
      table: {
        headers: ['Level', 'Output', 'Ingredients', 'XP', 'Time'],
        rows: smithingRecipes.filter((recipe) => recipe.station === 'Furnace').map((recipe) => [String(recipe.level), `${recipe.outputQuantity} ${recipe.output}`, formatSmithingIngredients(recipe), formatSmithingXp(recipe), `${recipe.seconds}s`]),
      },
    },
    {
      title: 'Anvil recipes',
      table: {
        headers: ['Level', 'Output', 'Ingredients', 'XP', 'Time'],
        rows: smithingRecipes.filter((recipe) => recipe.station === 'Anvil').map((recipe) => [String(recipe.level), `${recipe.outputQuantity} ${recipe.output}`, formatSmithingIngredients(recipe), formatSmithingXp(recipe), `${recipe.seconds}s`]),
      },
    },
    {
      title: 'Workbench recipes',
      table: {
        headers: ['Level', 'Output', 'Ingredients', 'XP', 'Time'],
        rows: smithingRecipes.filter((recipe) => recipe.station === 'Workbench').map((recipe) => [String(recipe.level), `${recipe.outputQuantity} ${recipe.output}`, formatSmithingIngredients(recipe), formatSmithingXp(recipe), `${recipe.seconds}s`]),
      },
    },
    {
      title: 'Dusk Knight armour path',
      paragraphs: ['Dusk Knight armour is a two-stage process. Forge each named metal component at an anvil, then combine the required components with an Exquisite Silk lining and the schematics at a workbench. The current recipes list Dusk Knight Schematics as a requirement for every component and final-assembly step.'],
      table: {
        headers: ['Final item', 'Level', 'Workbench assembly', 'XP'],
        rows: smithingRecipes.filter((recipe) => recipe.station === 'Workbench' && recipe.output.startsWith('Dusk Knight')).map((recipe) => [recipe.output, String(recipe.level), formatSmithingIngredients(recipe), formatSmithingXp(recipe)]),
      },
    },
    {
      title: 'Full Dusk Knight set — raw material totals',
      paragraphs: ['This shopping list makes the boots, platelegs, platebody, and helmet. It uses the Ebony Dust smelting plan and includes every intermediate plate, rod, foil, silk lining, and loose bar needed for the full set. Dusk Knight Schematics are recipe requirements but are not counted as a consumable raw material here.', 'The supplied 8,932-Dust plan makes 1,276 Ebony Bars. The current recipes also require one loose Ebony Bar when the helmet is assembled, so the complete no-shortfall total is 1,277 bars, or 8,939 Ebony Dust.'],
      table: {
        headers: ['Raw material', 'Total', 'Processing plan'],
        rows: [
          ['Ebony Dust', '8,939', 'Smelt 1,277 Ebony Bars (1,276 supplied subtotal + 1 helmet bar)'],
          ['Silver Ore', '1,078', 'Smelt 154 Silver Bars'],
          ['Exquisite Silk', '15', '5 for the pant lining · 6 for the vest lining · 4 for the boot lining'],
        ],
      },
    },
    {
      title: 'Full-set component checklist',
      steps: [
        'From the 1,277 Ebony Bars, use 1,008 to make 252 Small Ebony Plates.',
        'Turn the 252 Small Ebony Plates into 63 Ebony Plates.',
        'Use 40 of the Ebony Plates to make 10 Large Ebony Plates. Keep the other 23 Ebony Plates for the armour components.',
        'Make 16 Small Ebony Rods, turn them into 4 Ebony Rods, then make 1 Large Ebony Rod.',
        'Turn the 154 Silver Bars into 22 Silver Plates, then turn those plates into 44 Silver Foil.',
        'Use 5 Exquisite Silk for the pant lining, 6 for the vest lining, and 4 for the boot lining.',
        'Keep 3 loose Ebony Bars for final assembly: 2 for the boots and 1 for the helmet.',
        'Forge the named Dusk Knight components at an anvil, then assemble the four finished pieces at a workbench using the recipe tables above.',
      ],
    },
    {
      title: 'Planning a crafting session',
      bullets: [
        'Start from the final workbench recipe and work backwards through every plate and rod it requires.',
        'Leave room for unstackable bars and components before starting a long chain.',
        'Silver Foil is produced two at a time from one Silver Plate.',
        'Gold Bars and Ebony Bars each have two furnace methods, using either ore or dust where listed.',
        'Craft times shown in the tables are the base recipe durations currently presented by the game.',
      ],
    },
  ],
  related: ['mining', 'ore-crate', 'dusk-knight-boots', 'dusk-knight-platelegs', 'dusk-knight-platebody', 'dusk-knight-helmet'],
  source: smithingSource,
};

const internalToken = /\b(?:B|W|DA|Recipe)_[A-Za-z0-9_]+(?:_C)?\b|\b(?:ItemDataKey|CurrentInventoryTarget|RequestDepositResources|EquipmentInventory|PlayerInventoryComponent|UObject|UE4SS)\b/gi;
const internalValue = /\b(?:B|W|DA|Recipe)_[A-Za-z0-9_]+(?:_C)?\b|\b(?:ItemDataKey|CurrentInventoryTarget|RequestDepositResources|EquipmentInventory|PlayerInventoryComponent|UObject|UE4SS)\b/i;
const internalAlias = /^(?:item\s+\d+|(?:B|W|DA|Recipe)_[A-Za-z0-9_]+(?:_C)?|lua bridge|wiki importer)$/i;
const hiddenFactLabel = /^(?:verification|guide status|status|caution|item key|asset|recipe asset|class|rock class|zone class|backend|visible widget|identity field|quantity field|target identity|progress signal|completion|transport|state cadence|scope|public policy|coordinate model)$/i;

function friendlyToken(value: string) {
  return value
    .replace(/^Recipe_/, '')
    .replace(/^(?:B|W|DA)_/, '')
    .replace(/_C$/, '')
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2');
}

function playerText(value: string) {
  return value
    .replace(/\bitem key\s*\d+\b/gi, '')
    .replace(internalToken, (token) => friendlyToken(token))
    .replace(/\bValenBridge\b/gi, 'the game guide')
    .replace(/\bbridge-backed\b/gi, 'player-focused')
    .replace(/\bengine-discovered\b/gi, 'known')
    .replace(/\bengine-confirmed\b/gi, 'documented')
    .replace(/\bengine-readable\b/gi, 'visible')
    .replace(/\bengine\b/gi, 'game')
    .replace(/\bunverified\b/gi, 'not yet documented')
    .replace(/\bverified\b/gi, 'documented')
    .replace(/\bverification\b/gi, 'guide status')
    .replace(/\bevidence\b/gi, 'information')
    .replace(/\btechnical identity\b/gi, 'game details')
    .replace(/\bclass identity\b/gi, 'creature type')
    .replace(/\bclass names?\b/gi, 'creature names')
    .replace(/\bclasses\b/gi, 'types')
    .replace(/\bclass\b/gi, 'type')
    .replace(/\bactor(?:s)?\b/gi, 'creatures')
    .replace(/\btechnical\b/gi, 'game')
    .replace(/\bbackend\b/gi, 'game')
    .replace(/\bscan(?:s|ned|ning)?\b/gi, 'field notes')
    .replace(/\bexports?\b/gi, 'game information')
    .replace(/\brecipe assets?\b/gi, 'recipes')
    .replace(/\basset identities?\b/gi, 'game details')
    .replace(/\bdata assets?\b/gi, 'game items')
    .replace(/\bassets?\b/gi, 'game details')
    .replace(/\bworld-space\b/gi, 'travel')
    .replace(/\bUnreal units?\b/gi, 'distance units')
    .replace(/\bcommunity[- ]documented\b/gi, '')
    .replace(/\bcommunity-reported\b/gi, '')
    .replace(/\breported\b/gi, '')
    .replace(/\bcommunity documentation\b/gi, 'the guide')
    .replace(/\bcommunity (?:wiki|page|guide)\b/gi, 'guide')
    .replace(/\bsource directory\b/gi, 'wiki')
    .replace(/\bthe source\b/gi, 'the guide')
    .replace(/\bthe archive\b/gi, 'this guide')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function storeInfoForItem(entry: Pick<WikiEntry, 'title' | 'aliases'>) {
  return itemStoreInfo[entry.title] ?? (entry.aliases ?? []).map((alias) => itemStoreInfo[alias]).find(Boolean);
}

function playerFacingEntry(entry: WikiEntry): WikiEntry {
  const sections = entry.sections
    .filter((section) => !/^(?:technical identity|evidence flow|verification labels|privacy and safety)$/i.test(section.title))
    .map((section) => ({
      ...section,
      title: playerText(section.title)
        .replace(/^Guide status needed$/i, 'Details still needed')
        .replace(/^Information status$/i, 'Current information')
        .replace(/^Information policy$/i, 'What this guide covers')
        .replace(/^Game notes$/i, 'How it works'),
      paragraphs: section.paragraphs?.map(playerText),
      bullets: section.bullets?.map(playerText),
      steps: section.steps?.map(playerText),
      images: section.images?.map((image) => ({
        ...image,
        alt: playerText(image.alt),
        caption: image.caption ? playerText(image.caption) : undefined,
      })),
      table: section.table ? {
        headers: section.table.headers
          .filter((header) => !/technical key/i.test(header))
          .map(playerText),
        rows: section.table.rows.map((row) => row
          .filter((_, index) => !/technical key/i.test(section.table?.headers[index] ?? ''))
          .map(playerText)),
      } : undefined,
    }));

  const facts = entry.facts
    .filter((fact) => !hiddenFactLabel.test(fact.label) && !internalValue.test(fact.value))
    .map((fact) => {
      const label = playerText(fact.label).replace(/^Community /, '');
      const value = playerText(fact.value);
      return { ...fact, label, value: /^store price$/i.test(label) && /^\d+$/.test(value) ? `${Number(value).toLocaleString('en-US')} Coins` : value };
    })
    .filter((fact) => fact.label && fact.value);
  const store = entry.type === 'Item' ? storeInfoForItem(entry) : undefined;
  const factsWithoutStoreDuplicates = store
    ? facts.filter((fact) => !/^(?:reported )?(?:shop|store) price$|^purchasable at$/i.test(fact.label))
    : facts;

  return {
    ...entry,
    summary: playerText(entry.summary),
    intro: playerText(entry.intro),
    aliases: entry.aliases?.filter((alias) => !internalAlias.test(alias)).map(playerText),
    categories: entry.categories.filter((category) => !/^community documented$/i.test(category)).map(playerText),
    technicalId: undefined,
    image: entry.image ? { ...entry.image, alt: playerText(entry.image.alt), caption: entry.image.caption ? playerText(entry.image.caption) : undefined } : undefined,
    facts: store
      ? [...factsWithoutStoreDuplicates, { label: 'Store price', value: `${store.price.toLocaleString('en-US')} Coins` }, { label: 'Purchasable at', value: store.stores.join(' · ') }]
      : factsWithoutStoreDuplicates,
    sections,
    externalSources: entry.externalSources,
  };
}

function normalizedLegacyLabel(value: string) {
  return value.toLowerCase().replace(/^reported\s+/, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

function mergeLegacyEntry(current: WikiEntry, legacy: WikiEntry): WikiEntry {
  const knownFactLabels = new Set(current.facts.map((fact) => normalizedLegacyLabel(fact.label)));
  const facts = [...current.facts, ...legacy.facts.filter((fact) => !knownFactLabels.has(normalizedLegacyLabel(fact.label)))];
  const sections = current.sections.map((section) => ({ ...section }));
  const sectionIndexes = new Map(sections.map((section, index) => [section.title.toLowerCase(), index]));
  legacy.sections.forEach((section) => {
    const existingIndex = sectionIndexes.get(section.title.toLowerCase());
    if (existingIndex === undefined) {
      sectionIndexes.set(section.title.toLowerCase(), sections.length);
      sections.push(section);
      return;
    }
    const existing = sections[existingIndex];
    sections[existingIndex] = {
      ...existing,
      table: existing.table ?? section.table,
      images: existing.images?.length ? existing.images : section.images,
    };
  });
  return {
    ...current,
    categories: [...new Set([...current.categories, ...legacy.categories])],
    facts,
    sections,
    image: current.image ?? legacy.image,
    related: [...new Set([...(current.related ?? []), ...(legacy.related ?? [])])],
  };
}

function mergeLegacyEntries(currentEntries: WikiEntry[], legacyEntries: WikiEntry[]) {
  const merged = [...currentEntries];
  const termToIndex = new Map<string, number>();
  merged.forEach((entry, index) => {
    [entry.slug, entry.title, ...(entry.aliases ?? [])].forEach((term) => termToIndex.set(normalizedLegacyLabel(term), index));
  });
  legacyEntries.forEach((legacy) => {
    const existingIndex = termToIndex.get(normalizedLegacyLabel(legacy.slug)) ?? termToIndex.get(normalizedLegacyLabel(legacy.title));
    if (existingIndex === undefined) {
      const nextIndex = merged.length;
      merged.push(legacy);
      [legacy.slug, legacy.title, ...(legacy.aliases ?? [])].forEach((term) => termToIndex.set(normalizedLegacyLabel(term), nextIndex));
    } else {
      merged[existingIndex] = mergeLegacyEntry(merged[existingIndex], legacy);
    }
  });
  return merged;
}

const smithingReplacementSlugs = new Set(['smithing', ...smithingItemEntries.map((entry) => entry.slug)]);
const currentWikiEntries = [
  ...[...curatedEntries, ...recipeEntries, ...communityEntries]
    .filter((entry) => entry.slug !== 'valenbridge' && !smithingReplacementSlugs.has(entry.slug)),
  smithingGuide,
  ...smithingItemEntries,
  ...itemCatalogueEntries,
  ...smithingRecipeEntries,
];
const allWikiEntries = mergeLegacyEntries(currentWikiEntries, legacyWikiData as WikiEntry[]).map(playerFacingEntry);
const duplicateSlugs = allWikiEntries
  .map((entry) => entry.slug)
  .filter((slug, index, slugs) => slugs.indexOf(slug) !== index);
if (duplicateSlugs.length) throw new Error(`Duplicate wiki slugs: ${[...new Set(duplicateSlugs)].join(', ')}`);

export const wikiEntries: WikiEntry[] = allWikiEntries.sort((a, b) => a.title.localeCompare(b.title));

export const wikiBySlug = new Map(wikiEntries.map((entry) => [entry.slug, entry]));

export type SearchEntry = {
  slug: string;
  title: string;
  type: WikiEntry['type'] | 'Community page' | 'Calculator';
  summary: string;
  terms: string;
  href?: string;
  source?: 'archive' | 'community';
  questKind?: QuestKind;
};

export function questKindForEntry(entry: Pick<SearchEntry, 'slug' | 'type' | 'questKind'>): QuestKind | null {
  if (entry.type !== 'Quest') return null;
  return entry.questKind ?? (entry.slug === 'open-the-gates' ? 'main' : 'miniquest');
}

export function playerEntryTypeLabel(entry: Pick<SearchEntry, 'slug' | 'type' | 'questKind'>) {
  const questKind = questKindForEntry(entry);
  if (questKind === 'main') return 'Main Quest';
  if (questKind === 'miniquest') return 'Miniquest';
  if (entry.type === 'Activity') return 'Skill';
  if (entry.type === 'System') return 'Game system';
  return entry.type;
}

function searchableText(entry: WikiEntry) {
  const sections = entry.sections.flatMap((section) => [
    section.title,
    ...(section.paragraphs ?? []),
    ...(section.bullets ?? []),
    ...(section.steps ?? []),
    ...(section.table?.headers ?? []),
    ...(section.table?.rows.flat() ?? []),
    ...(section.images?.flatMap((image) => [image.alt, image.caption ?? '']) ?? []),
  ]);
  return [
    entry.title,
    entry.type,
    entry.summary,
    entry.intro,
    ...(entry.aliases ?? []),
    ...entry.categories,
    ...entry.facts.flatMap((fact) => [fact.label, fact.value]),
    ...sections,
  ].filter(Boolean).join(' ').toLowerCase();
}

export const searchEntries: SearchEntry[] = wikiEntries.map((entry) => ({
  slug: entry.slug,
  title: entry.title,
  type: entry.type,
  summary: entry.summary,
  source: 'archive',
  questKind: entry.questKind,
  terms: searchableText(entry),
}));

export function searchIndex(entries: SearchEntry[], query: string): SearchEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return entries;
  return entries
    .map((entry) => {
      const title = entry.title.toLowerCase();
      let score = 0;
      if (title === normalized) score = 100;
      else if (title.startsWith(normalized)) score = 70;
      else if (title.includes(normalized)) score = 50;
      else if (entry.terms.includes(normalized)) score = 20;
      return { entry, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || (a.entry.source === b.entry.source ? 0 : a.entry.source === 'archive' ? -1 : 1) || a.entry.title.localeCompare(b.entry.title))
    .map(({ entry }) => entry);
}

export function searchWiki(query: string): WikiEntry[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return wikiEntries;
  return wikiEntries
    .map((entry) => {
      const title = entry.title.toLowerCase();
      const terms = searchableText(entry);
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
  recipes: wikiEntries.filter((entry) => entry.type === 'Recipe').length,
  communityArticles: communityEntries.length,
  items: wikiEntries.filter((entry) => entry.type === 'Item').length,
  creatures: wikiEntries.filter((entry) => entry.type === 'Creature').length,
};
