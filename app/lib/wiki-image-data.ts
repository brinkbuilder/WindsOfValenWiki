export type WikiImageData = {
  src: string;
  alt: string;
  caption?: string;
};

function gameSkillImage(skill: string): WikiImageData {
  return {
    src: `/game-assets/skills/${skill.toLowerCase().replaceAll(' ', '-')}.png`,
    alt: `${skill} skill icon`,
    caption: `${skill} icon used by the current game build.`,
  };
}

function archivedItemImage(filename: string, item: string, caption = `${item} inventory icon from the game files.`): WikiImageData {
  return {
    src: `/legacy-wiki/${filename}`,
    alt: `${item} inventory icon`,
    caption,
  };
}

function currentItemImage(filename: string, item: string): WikiImageData {
  return {
    src: `/game-assets/items/${filename}`,
    alt: `${item} inventory icon`,
    caption: `${item} inventory icon used by the current game build.`,
  };
}

/**
 * Exact, player-facing matches recovered from the installed game build. Existing
 * article artwork still wins; these entries fill pages that did not have a
 * primary image after the current and archived wiki records were merged.
 */
export const gameWikiImages: Record<string, WikiImageData> = {
  archery: gameSkillImage('Archery'),
  attack: gameSkillImage('Attack'),
  combat: gameSkillImage('Combat'),
  defence: gameSkillImage('Defence'),
  evasion: gameSkillImage('Evasion'),
  fishing: gameSkillImage('Fishing'),
  health: gameSkillImage('Health'),
  magic: gameSkillImage('Magic'),
  mining: gameSkillImage('Mining'),
  'potion-making': gameSkillImage('Potion Making'),
  smithing: gameSkillImage('Smithing'),
  warding: gameSkillImage('Warding'),

  banking: {
    src: '/game-assets/banking.png',
    alt: 'Bank map icon',
    caption: 'Bank marker icon used by the current game build.',
  },
  inventory: {
    src: '/game-assets/inventory.png',
    alt: 'Inventory backpack icon',
    caption: 'Inventory icon from the current game build.',
  },

  'crystal-cavern': {
    src: '/game-assets/locations/crystal-cavern.webp',
    alt: 'Crystal Cavern interior',
    caption: 'Cavern screenshot included in the current game files.',
  },
  'valen-city': {
    src: '/game-assets/locations/valen-city.webp',
    alt: 'Valen City square',
    caption: 'Town screenshot included in the current game files.',
  },
  'world-map': {
    src: '/wiki-assets/world-map-original.png',
    alt: 'World map of Valen',
    caption: 'The interactive atlas artwork used by this wiki.',
  },

  'archery-potion': {
    src: '/game-assets/status-effects/archery-potion.png',
    alt: 'Archery Potion effect icon',
    caption: 'Archery Potion status-effect icon used by the current game build.',
  },
  'attack-potion': {
    src: '/game-assets/status-effects/attack-potion.png',
    alt: 'Attack Potion effect icon',
    caption: 'Attack Potion status-effect icon used by the current game build.',
  },
  'fishing-potion': {
    src: '/game-assets/status-effects/fishing-potion.png',
    alt: 'Fishing Potion effect icon',
    caption: 'Fishing Potion status-effect icon used by the current game build.',
  },
  'magic-potion': {
    src: '/game-assets/status-effects/magic-potion.png',
    alt: 'Magic Potion effect icon',
    caption: 'Magic Potion status-effect icon used by the current game build.',
  },
  'mining-potion': {
    src: '/game-assets/skills/mining.png',
    alt: 'Mining Potion effect icon',
    caption: 'Mining Potion status-effect icon used by the current game build.',
  },

  bass: archivedItemImage('t-smallbass-icon.png', 'Bass'),
  carp: archivedItemImage('t-carp-icon.png', 'Carp'),
  'common-trout': archivedItemImage('t-commontrout-icon.png', 'Common Trout'),
  'elder-trout': archivedItemImage('t-bigtrout-icon.png', 'Elder Trout'),
  'essence-geode': {
    src: '/game-assets/items/essence-geode.png',
    alt: 'Essence Geode inventory icon',
    caption: 'Essence Geode inventory icon extracted from the current game build.',
  },
  'broken-sword': currentItemImage('broken-sword.png', 'Broken Sword'),
  'coal-dust': currentItemImage('coal-dust.png', 'Coal Dust'),
  'corrupted-dark-battle-pickaxe': currentItemImage('corrupted-dark-battle-pickaxe.png', 'Corrupted Dark Battle Pickaxe'),
  'corrupted-dark-scimitar': currentItemImage('corrupted-dark-scimitar.png', 'Corrupted Dark Scimitar'),
  'dark-cape': currentItemImage('dark-cape.png', 'Dark Cape'),
  'dark-key': currentItemImage('dark-key.png', 'Dark Key'),
  'dark-necklace': currentItemImage('dark-necklace.png', 'Dark Necklace'),
  'guard-cape': archivedItemImage('t-guardcloak-icon2.png', 'Guard Cape'),
  'iron-battle-pickaxe': currentItemImage('iron-battle-pickaxe.png', 'Iron Battle Pickaxe'),
  'iron-dust': currentItemImage('iron-dust.png', 'Iron Dust'),
  'iron-key': currentItemImage('iron-key.png', 'Iron Key'),
  'iron-scimitar': currentItemImage('iron-scimitar.png', 'Iron Scimitar'),
  'mithril-battle-pickaxe': currentItemImage('mithril-battle-pickaxe.png', 'Mithril Battle Pickaxe'),
  'mithril-key': currentItemImage('mithril-key.png', 'Mithril Key'),
  'mithril-scimitar': currentItemImage('mithril-scimitar.png', 'Mithril Scimitar'),
  'infused-coal': archivedItemImage('t-essenceinfusedcoal-icon.png', 'Infused Coal'),
  minnow: archivedItemImage('t-minnow-icon.png', 'Minnow'),
  'ore-crate': archivedItemImage('t-mithrilorecrate-icon.png', 'Ore Crate'),
  perch: archivedItemImage('t-perch-icon.png', 'Perch'),
  'power-gems': archivedItemImage(
    't-powergem-icon.png',
    'Power Gem',
    'The in-game Power Gem icon represents this item family.',
  ),

  'carp-processing': archivedItemImage(
    't-carp-icon.png',
    'Carp',
    'The in-game Carp icon represents the material processed in this guide.',
  ),
  'combat-mechanics': gameSkillImage('Combat'),
  'essence-gland-processing': archivedItemImage(
    't-essencegland-icon.png',
    'Essence Gland',
    'The in-game Essence Gland icon represents the material processed in this guide.',
  ),
  'potion-families': gameSkillImage('Potion Making'),
};

export const recipeStationImages: Record<string, WikiImageData> = {
  Cauldron: {
    src: '/game-assets/stations/cauldron.png',
    alt: 'Cauldron icon',
    caption: 'Cauldron icon used by the current game build.',
  },
  'Crush Station': {
    src: '/game-assets/stations/crush-station.png',
    alt: 'Crush Station icon',
    caption: 'Crush Station icon used by the current game build.',
  },
  'Knife Station': {
    src: '/game-assets/stations/cutting-table.png',
    alt: 'Cutting Table icon',
    caption: 'Cutting Table icon used by the current game build.',
  },
  'Reduction Station': {
    src: '/game-assets/stations/reduction-station.png',
    alt: 'Reduction Station icon',
    caption: 'Reduction Station icon used by the current game build.',
  },
  Furnace: {
    src: '/game-assets/stations/furnace.png',
    alt: 'Furnace icon',
    caption: 'Furnace icon used by the current game build.',
  },
};
