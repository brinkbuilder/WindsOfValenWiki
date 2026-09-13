import type { WikiEntry, WikiFact, WikiSection } from './wiki-data';

const currentGameSource = {
  label: 'Current game information',
  detail: 'Player-facing items, recipes, creatures, combat rules, and rewards reviewed against the current game build.',
  observed: '13 September 2026',
};

type CurrentItemSpec = {
  slug: string;
  title: string;
  summary: string;
  intro: string;
  categories: string[];
  facts: WikiFact[];
  sections: WikiSection[];
  related: string[];
  aliases?: string[];
};

function currentItem(spec: CurrentItemSpec): WikiEntry {
  return {
    ...spec,
    type: 'Item',
    verification: 'engine',
    source: currentGameSource,
  };
}

const currentItems: WikiEntry[] = [
  currentItem({
    slug: 'iron-dust', title: 'Iron Dust',
    summary: 'A mineable Iron resource that can replace Iron Ore in current smelting recipes.',
    intro: 'Iron Dust is gathered from Iron Dust Rocks and is interchangeable with Iron Ore when smelting Iron Bars or Steel Bars.',
    categories: ['Items', 'Mining', 'Smithing', 'Materials'],
    facts: [{ label: 'Mining requirement', value: '10' }, { label: 'Mining XP', value: '30' }, { label: 'Stack limit', value: '1,000' }],
    sections: [
      { title: 'Obtaining Iron Dust', bullets: ['Mine an Iron Dust Rock at level 10 Mining.', 'Each successful gather gives Iron Dust and also rolls on the normal gem table.', 'Every gather has a separate 10% chance to award an Iron Key.'] },
      { title: 'Uses', table: { headers: ['Recipe', 'Amount'], rows: [['Iron Bar', '2 Iron Dust instead of 2 Iron Ore'], ['Steel Bar', '1 Iron Dust instead of 1 Iron Ore']] } },
    ],
    related: ['mining', 'smithing', 'iron-key', 'iron-bar', 'steel-bar'],
  }),
  currentItem({
    slug: 'coal-dust', title: 'Coal Dust',
    summary: 'A mineable Coal resource accepted anywhere the current recipes allow Coal Ore.',
    intro: 'Coal Dust is gathered from Coal Dust Rocks. Use it for Steel Bars, Mithril Bars, or Infused Coal without first converting it into Coal Ore.',
    categories: ['Items', 'Mining', 'Smithing', 'Potion Making', 'Materials'],
    facts: [{ label: 'Mining requirement', value: '20' }, { label: 'Mining XP', value: '80' }, { label: 'Stack limit', value: '1,000' }],
    sections: [
      { title: 'Obtaining Coal Dust', bullets: ['Mine a Coal Dust Rock at level 20 Mining.', 'Each successful gather gives Coal Dust and also rolls on the strong gem table.', 'Every gather has a separate 5% chance to award a Mithril Key.'] },
      { title: 'Uses', table: { headers: ['Recipe', 'Amount'], rows: [['Steel Bar', '1 Coal Dust instead of 1 Coal Ore'], ['Mithril Bar', '2 Coal Dust instead of 2 Coal Ore'], ['Infused Coal', '1 Coal Dust instead of 1 Coal Ore, plus 2 Essence']] } },
    ],
    related: ['mining', 'smithing', 'potion-making', 'mithril-key', 'infused-coal'],
  }),
  currentItem({
    slug: 'iron-key', title: 'Iron Key',
    summary: 'A stackable Darklands key used with the first chest tier.',
    intro: 'Iron Keys come from early Darklands content and are used to open the matching Iron chest tier.',
    categories: ['Items', 'Darklands', 'Keys'],
    facts: [{ label: 'Stack limit', value: '1,000' }],
    sections: [{ title: 'How to obtain it', table: { headers: ['Source', 'Chance'], rows: [['Skeleton Footman', '20% separate key roll'], ['Iron Dust Rock', '10% separate key roll']] } }, { title: 'Use', paragraphs: ['Take an Iron Key to the matching Darklands chest for one supplies roll and one separate rare-equipment roll.'] }],
    related: ['skeleton-footman', 'iron-dust', 'darklands-chests'],
  }),
  currentItem({
    slug: 'mithril-key', title: 'Mithril Key',
    summary: 'A stackable Darklands key used with the second chest tier.',
    intro: 'Mithril Keys come from mid-tier Darklands content and are used to open the matching Mithril chest tier.',
    categories: ['Items', 'Darklands', 'Keys'],
    facts: [{ label: 'Stack limit', value: '1,000' }],
    sections: [{ title: 'How to obtain it', table: { headers: ['Source', 'Chance'], rows: [['Skeleton Soldier', '10% separate key roll'], ['Coal Dust Rock', '5% separate key roll']] } }, { title: 'Use', paragraphs: ['Take a Mithril Key to the matching Darklands chest for one supplies roll and one separate rare-equipment roll.'] }],
    related: ['skeleton-soldier', 'coal-dust', 'darklands-chests'],
  }),
  currentItem({
    slug: 'dark-key', title: 'Dark Key',
    summary: 'A members-only Darklands key used with the highest chest tier.',
    intro: 'Dark Keys are the high-tier keys for Darklands chest rewards. They stack in large quantities and have separate rolls from normal enemy or mining rewards.',
    categories: ['Items', 'Darklands', 'Keys', 'Members'],
    facts: [{ label: 'Members-only', value: 'Yes' }, { label: 'Stack limit', value: '5,000' }],
    sections: [{ title: 'How to obtain it', table: { headers: ['Source', 'Chance'], rows: [['Skeleton Knight (Darklands)', '3.3333% separate key roll — about 1 in 30'], ['Gold Dust Rock', '1% separate key roll — 1 in 100']] } }, { title: 'Use', paragraphs: ['Take a Dark Key to the highest Darklands chest tier. The supplies reward and rare-equipment reward are rolled separately.'] }],
    related: ['skeleton-knight-darklands', 'gold-dust', 'darklands-chests'],
  }),
  currentItem({
    slug: 'broken-sword', title: 'Broken Sword',
    summary: 'A level-1 quick-slashing weapon, now strengthened to sit close to an Iron Sword.',
    intro: 'The Broken Sword is a rare skeleton drop. Its current combat values were increased to 15 Slash and 25 Quick, making it a useful early weapon rather than a novelty drop.',
    categories: ['Items', 'Weapons', 'Darklands'],
    facts: [{ label: 'Attack requirement', value: '1' }, { label: 'Slash', value: '15' }, { label: 'Quick', value: '25' }, { label: 'Attack range', value: '120' }, { label: 'Attack speed', value: '2' }, { label: 'Swing time', value: '0.5 seconds' }],
    sections: [{ title: 'Drop sources', table: { headers: ['Enemy', 'Chance'], rows: [['Skeleton Footman', '0.0357% — about 1 in 2,801'], ['Skeleton Soldier', '0.0357% — about 1 in 2,801'], ['Graveyard Skeleton', '0.0461% — about 1 in 2,169']] } }, { title: 'Latest balance change', paragraphs: ['Slash increased from 8 to 15 and Quick increased from 10 to 25. The weapon now has a level-1 Attack requirement.'] }],
    related: ['skeleton-footman', 'skeleton-soldier', 'graveyard', 'darklands-chests'],
  }),
  currentItem({
    slug: 'copper-pickaxe', title: 'Copper Pickaxe',
    summary: 'The starter pickaxe, now also usable as a basic Pierce and Heavy weapon.',
    intro: 'The Copper Pickaxe is the first Mining tool. The current version also carries combat stats, so it can be swung as a weapon when necessary.',
    categories: ['Items', 'Mining', 'Tools', 'Weapons'],
    facts: [{ label: 'Mining requirement', value: '1' }, { label: 'Mining Power', value: '1' }, { label: 'Pierce', value: '6' }, { label: 'Heavy', value: '6' }, { label: 'Attack range', value: '120' }, { label: 'Attack speed', value: '2.5' }, { label: 'Combat scaling', value: '50% from Mining level' }],
    sections: [{ title: 'Use', paragraphs: ['Equip it to mine entry-level rocks. Its Pierce and Heavy values let it function as a simple combat weapon; half of its damage and accuracy level scaling now comes from Mining.'] }],
    related: ['mining', 'copper-ore'],
  }),
  currentItem({
    slug: 'bronze-pickaxe', title: 'Bronze Pickaxe',
    summary: 'An early pickaxe with improved Mining Power and light combat stats.',
    intro: 'The Bronze Pickaxe requires level 1 Mining and improves on the starter tool. The current version can also deal Pierce and Heavy damage.',
    categories: ['Items', 'Mining', 'Tools', 'Weapons'],
    facts: [{ label: 'Mining requirement', value: '1' }, { label: 'Mining Power', value: '4' }, { label: 'Pierce', value: '12' }, { label: 'Heavy', value: '9' }, { label: 'Attack range', value: '120' }, { label: 'Attack speed', value: '2.5' }, { label: 'Combat scaling', value: '50% from Mining level' }],
    sections: [{ title: 'Use', paragraphs: ['Equip it for early Mining progression or as a light hybrid combat tool. Half of its damage and accuracy level scaling now comes from Mining.'] }],
    related: ['mining', 'bronze-bar'],
  }),
  currentItem({
    slug: 'iron-pickaxe', title: 'Iron Pickaxe',
    summary: 'A level-10 Mining tool with added Pierce and Heavy combat stats.',
    intro: 'The Iron Pickaxe provides 12 Mining Power. Its current combat profile makes it a practical hybrid tool even outside a mining trip.',
    categories: ['Items', 'Mining', 'Tools', 'Weapons'],
    facts: [{ label: 'Mining requirement', value: '10' }, { label: 'Mining Power', value: '12' }, { label: 'Pierce', value: '24' }, { label: 'Heavy', value: '15' }, { label: 'Attack range', value: '120' }, { label: 'Attack speed', value: '2.5' }, { label: 'Combat scaling', value: '50% from Mining level' }],
    sections: [{ title: 'Use', paragraphs: ['Equip it to mine Iron-tier resources and to gain its Pierce and Heavy weapon values. Half of its damage and accuracy level scaling now comes from Mining.'] }],
    related: ['mining', 'iron-ore', 'iron-dust'],
  }),
  currentItem({
    slug: 'steel-pickaxe', title: 'Steel Pickaxe',
    summary: 'A level-20 Mining tool with 25 Mining Power and useful combat stats.',
    intro: 'The Steel Pickaxe is the standard level-20 progression tool and now doubles as a stronger Pierce/Heavy weapon.',
    categories: ['Items', 'Mining', 'Tools', 'Weapons'],
    facts: [{ label: 'Mining requirement', value: '20' }, { label: 'Mining Power', value: '25' }, { label: 'Pierce', value: '40' }, { label: 'Heavy', value: '25' }, { label: 'Attack range', value: '120' }, { label: 'Attack speed', value: '2.5' }, { label: 'Combat scaling', value: '50% from Mining level' }],
    sections: [{ title: 'Use', paragraphs: ['Equip it for Coal-tier Mining and as a mid-tier hybrid combat tool. Half of its damage and accuracy level scaling now comes from Mining.'] }],
    related: ['mining', 'coal', 'coal-dust'],
  }),
  currentItem({
    slug: 'dwarven-pickaxe', title: 'Dwarven Pickaxe',
    summary: 'A level-30 Mining tool with 50 Mining Power and strong Pierce and Heavy stats.',
    intro: 'The Dwarven Pickaxe is the strongest standard pickaxe in the current progression. It also has a capable combat profile.',
    categories: ['Items', 'Mining', 'Tools', 'Weapons'],
    facts: [{ label: 'Mining requirement', value: '30' }, { label: 'Mining Power', value: '50' }, { label: 'Pierce', value: '60' }, { label: 'Heavy', value: '38' }, { label: 'Attack range', value: '120' }, { label: 'Attack speed', value: '2.5' }, { label: 'Combat scaling', value: '50% from Mining level' }],
    sections: [{ title: 'Use', paragraphs: ['Equip it for Mithril-tier Mining or use its strong Pierce and Heavy values in combat. Half of its damage and accuracy level scaling now comes from Mining.'] }],
    related: ['mining', 'mithril-ore'],
  }),
  currentItem({
    slug: 'iron-scimitar', title: 'Iron Scimitar',
    summary: 'A level-10 scimitar from the Iron Darklands chest.',
    intro: 'The Iron Scimitar is a fast slashing weapon with a small damage bonus while fighting in the Darklands.',
    categories: ['Items', 'Weapons', 'Darklands'],
    facts: [{ label: 'Attack requirement', value: '10' }, { label: 'Slash', value: '30' }, { label: 'Quick', value: '18' }, { label: 'Attack range', value: '120' }, { label: 'Attack speed', value: '1.5' }, { label: 'Swing time', value: '0.5 seconds' }, { label: 'Darklands damage bonus', value: '10%' }],
    sections: [{ title: 'How to obtain it', paragraphs: ['Open the Iron Darklands chest. Its separate rare roll has a 10% chance to award an Iron Scimitar.'] }],
    related: ['iron-key', 'darklands-chests'],
  }),
  currentItem({
    slug: 'mithril-scimitar', title: 'Mithril Scimitar',
    summary: 'A level-30 scimitar from the Mithril Darklands chest.',
    intro: 'The Mithril Scimitar is a fast mid-tier slashing weapon with a substantial damage bonus in the Darklands.',
    categories: ['Items', 'Weapons', 'Darklands'],
    facts: [{ label: 'Attack requirement', value: '30' }, { label: 'Slash', value: '75' }, { label: 'Quick', value: '45' }, { label: 'Attack range', value: '120' }, { label: 'Attack speed', value: '1.5' }, { label: 'Swing time', value: '0.5 seconds' }, { label: 'Darklands damage bonus', value: '25%' }],
    sections: [{ title: 'How to obtain it', paragraphs: ['Open the Mithril Darklands chest. Its separate rare roll has a 5% chance to award a Mithril Scimitar.'] }],
    related: ['mithril-key', 'darklands-chests'],
  }),
  currentItem({
    slug: 'corrupted-dark-scimitar', title: 'Corrupted Dark Scimitar',
    summary: 'A members-only level-50 scimitar from the highest Darklands chest.',
    intro: 'The Corrupted Dark Scimitar is a powerful, fast slashing weapon built for Darklands combat.',
    categories: ['Items', 'Weapons', 'Darklands', 'Members'],
    facts: [{ label: 'Attack requirement', value: '50' }, { label: 'Members-only', value: 'Yes' }, { label: 'Slash', value: '120' }, { label: 'Quick', value: '90' }, { label: 'Attack range', value: '120' }, { label: 'Attack speed', value: '1.5' }, { label: 'Swing time', value: '0.5 seconds' }, { label: 'Darklands damage bonus', value: '50%' }],
    sections: [{ title: 'How to obtain it', paragraphs: ['Open the highest Darklands chest. Its separate rare roll has a 2% chance to award a Corrupted Dark Scimitar.'] }],
    related: ['dark-key', 'darklands-chests'],
  }),
  currentItem({
    slug: 'iron-battle-pickaxe', title: 'Iron Battle Pickaxe',
    summary: 'A level-10 combat pickaxe from the Iron Darklands chest.',
    intro: 'The Iron Battle Pickaxe works as both a mining tool and a Pierce/Heavy weapon, with a small gathering bonus inside the Darklands.',
    categories: ['Items', 'Mining', 'Weapons', 'Darklands'],
    facts: [{ label: 'Mining requirement', value: '10' }, { label: 'Attack requirement', value: '10' }, { label: 'Mining Power', value: '12' }, { label: 'Pierce', value: '30' }, { label: 'Heavy', value: '25' }, { label: 'Attack range', value: '120' }, { label: 'Attack speed', value: '2.5' }, { label: 'Combat scaling', value: '50% from Mining level' }, { label: 'Darklands gathering bonus', value: '15%' }],
    sections: [{ title: 'How to obtain it', paragraphs: ['Open the Iron Darklands chest. Its separate rare roll has a 10% chance to award an Iron Battle Pickaxe.'] }, { title: 'Combat scaling', paragraphs: ['Half of this pickaxe’s damage and accuracy level scaling comes from Mining.'] }],
    related: ['mining', 'iron-key', 'darklands-chests'],
  }),
  currentItem({
    slug: 'mithril-battle-pickaxe', title: 'Mithril Battle Pickaxe',
    summary: 'A level-30 combat pickaxe from the Mithril Darklands chest.',
    intro: 'The Mithril Battle Pickaxe replaces the older Mithril Pickaxe in the current equipment set and combines strong mining power with Pierce and Heavy combat stats.',
    aliases: ['Mithril Pickaxe'],
    categories: ['Items', 'Mining', 'Weapons', 'Darklands'],
    facts: [{ label: 'Mining requirement', value: '30' }, { label: 'Attack requirement', value: '30' }, { label: 'Mining Power', value: '50' }, { label: 'Pierce', value: '75' }, { label: 'Heavy', value: '60' }, { label: 'Attack range', value: '120' }, { label: 'Attack speed', value: '2.5' }, { label: 'Combat scaling', value: '50% from Mining level' }, { label: 'Darklands gathering bonus', value: '30%' }],
    sections: [{ title: 'How to obtain it', paragraphs: ['Open the Mithril Darklands chest. Its separate rare roll has a 5% chance to award a Mithril Battle Pickaxe.'] }, { title: 'Combat scaling', paragraphs: ['Half of this pickaxe’s damage and accuracy level scaling comes from Mining.'] }],
    related: ['mining', 'mithril-key', 'darklands-chests'],
  }),
  currentItem({
    slug: 'corrupted-dark-battle-pickaxe', title: 'Corrupted Dark Battle Pickaxe',
    summary: 'A members-only level-50 combat pickaxe from the highest Darklands chest.',
    intro: 'The Corrupted Dark Battle Pickaxe is the strongest current battle pickaxe, combining high Mining Power, strong combat stats, and a large Darklands gathering bonus.',
    categories: ['Items', 'Mining', 'Weapons', 'Darklands', 'Members'],
    facts: [{ label: 'Mining requirement', value: '50' }, { label: 'Attack requirement', value: '50' }, { label: 'Members-only', value: 'Yes' }, { label: 'Mining Power', value: '80' }, { label: 'Pierce', value: '120' }, { label: 'Heavy', value: '120' }, { label: 'Attack range', value: '120' }, { label: 'Attack speed', value: '2.5' }, { label: 'Combat scaling', value: '50% from Mining level' }, { label: 'Darklands gathering bonus', value: '60%' }],
    sections: [{ title: 'How to obtain it', paragraphs: ['Open the highest Darklands chest. Its separate rare roll has a 2% chance to award a Corrupted Dark Battle Pickaxe.'] }, { title: 'Combat scaling', paragraphs: ['Half of this pickaxe’s damage and accuracy level scaling comes from Mining.'] }],
    related: ['mining', 'dark-key', 'darklands-chests'],
  }),
  currentItem({
    slug: 'dark-cape', title: 'Dark Cape',
    summary: 'A rare members-only, untradeable cape from the highest Darklands chest.',
    intro: 'The Dark Cape provides balanced protection, Agility, and bonuses to combat and gathering inside the Darklands.',
    categories: ['Items', 'Armour', 'Darklands', 'Members'],
    facts: [{ label: 'Members-only', value: 'Yes' }, { label: 'Tradeable', value: 'No' }, { label: 'Pierce armour', value: '10' }, { label: 'Slash armour', value: '10' }, { label: 'Ice armour', value: '10' }, { label: 'Agility', value: '5' }, { label: 'Darklands player damage bonus', value: '10%' }, { label: 'Darklands monster damage bonus', value: '10%' }, { label: 'Darklands gathering bonus', value: '10%' }],
    sections: [{ title: 'How to obtain it', paragraphs: ['Open the highest Darklands chest. Its separate rare roll has a 1% chance to award a Dark Cape.'] }],
    related: ['dark-key', 'darklands-chests'],
  }),
  currentItem({
    slug: 'dark-necklace', title: 'Dark Necklace',
    summary: 'An exceptionally rare members-only necklace from the highest Darklands chest.',
    intro: 'The Dark Necklace adds power to all three offensive styles and provides the strongest Darklands-specific bonuses in the current chest rewards.',
    aliases: ['Dark Amulet'],
    categories: ['Items', 'Jewellery', 'Darklands', 'Members'],
    facts: [{ label: 'Members-only', value: 'Yes' }, { label: 'Melee power', value: '32' }, { label: 'Ranged power', value: '32' }, { label: 'Magic power', value: '32' }, { label: 'Darklands player damage bonus', value: '50%' }, { label: 'Darklands monster damage bonus', value: '50%' }, { label: 'Darklands gathering bonus', value: '50%' }],
    sections: [{ title: 'How to obtain it', paragraphs: ['Open the highest Darklands chest. Its separate rare roll has a 0.1% chance to award a Dark Necklace — about 1 in 1,000 chest openings.'] }],
    related: ['dark-key', 'darklands-chests'],
  }),
  currentItem({
    slug: 'guard-cape', title: 'Guard Cape', aliases: ['Guard Cloak'],
    summary: 'A back-slot reward from the Open The Gates main quest.',
    intro: 'The Guard Cape is awarded during Open The Gates and marks the player’s access to Valen City. Older guides call it the Guard Cloak.',
    categories: ['Items', 'Armour', 'Quest rewards'],
    facts: [{ label: 'Quest', value: 'Open The Gates' }, { label: 'Equipment slot', value: 'Back' }],
    sections: [{ title: 'How to obtain it', paragraphs: ['Complete the relevant Open The Gates objective and claim the Valen Guard reward.'] }],
    related: ['open-the-gates', 'valen-city'],
  }),
  currentItem({
    slug: 'elven-cloth', title: 'Elven Cloth',
    summary: 'An armour-making material whose drop chance was substantially increased in the current build.',
    intro: 'Elven Cloth is dropped by Elves, Elf Scholars, and the Elf Warden. It is used for advanced armour linings.',
    categories: ['Items', 'Smithing', 'Materials'],
    facts: [{ label: 'Regular Elf drop chance', value: '12.2807% per normal roll' }, { label: 'Elf Warden drop chance', value: '21.0526% per normal roll' }],
    sections: [{ title: 'Drop sources', table: { headers: ['Source', 'Rolls', 'Chance per roll'], rows: [['Elf', '1 normal roll', '12.2807%'], ['Elf Scholar', '1 normal roll', '12.2807%'], ['Elf Warden', '1–2 normal rolls', '21.0526%']] } }, { title: 'Uses', paragraphs: ['Take Elven Cloth to the appropriate tailoring service to make linings for Mithril armour.'] }],
    related: ['elf', 'elf-scholar', 'elf-warden', 'smithing', 'mithril-platelegs', 'mithril-platebody'],
  }),
];

type CreatureSpec = {
  slug: string;
  title: string;
  aliases?: string[];
  summary: string;
  intro: string;
  facts: WikiFact[];
  sections: WikiSection[];
  related: string[];
  categories?: string[];
};

function currentCreature(spec: CreatureSpec): WikiEntry {
  return {
    ...spec,
    type: 'Creature',
    verification: 'engine',
    categories: spec.categories ?? ['Creatures', 'Darklands', 'Combat'],
    source: currentGameSource,
  };
}

const darklandsCreatures: WikiEntry[] = [
  currentCreature({
    slug: 'skeleton-footman', title: 'Skeleton Footman',
    summary: 'The first Darklands skeleton tier and the most common combat source of Iron Keys.',
    intro: 'Skeleton Footmen are early Darklands enemies with 200 Health. Every defeat gives one normal loot roll and a separate 20% Iron Key roll.',
    facts: [{ label: 'Health', value: '200' }, { label: 'Attack', value: '10' }, { label: 'Defence', value: '10' }, { label: 'Heavy', value: '25' }, { label: 'Slash', value: '15' }, { label: 'Attack speed', value: '3' }, { label: 'Key chance', value: 'Iron Key — 20%' }],
    sections: [
      { title: 'Defences', table: { headers: ['Slash', 'Pierce', 'Fire', 'Lightning', 'Ice'], rows: [['5', '20', '10', '5', '30']] } },
      { title: 'Normal loot roll', table: { headers: ['Reward', 'Quantity', 'Chance'], rows: [['Coins', '5–10', '35.7015%'], ['Small Weak Health Potion', '1', '21.4209%'], ['Coins', '20', '7.1403%'], ['Small Shields Potion', '1', '7.1403%'], ['Small Health Potion', '1', '7.1403%'], ['Iron Dust', '3–6', '7.1403%'], ['Small Worm Bait', '5–15', '7.1403%'], ['Tiny Worm Bait', '5–15', '7.1403%'], ['Broken Sword', '1', '0.0357%']] } },
      { title: 'Separate key roll', paragraphs: ['After the normal reward, there is a separate 20% chance to receive an Iron Key. The key does not replace the normal drop.'] },
    ],
    related: ['iron-key', 'iron-dust', 'broken-sword', 'darklands-chests'],
  }),
  currentCreature({
    slug: 'skeleton-soldier', title: 'Skeleton Soldier', aliases: ['Skeleton Solider'],
    summary: 'The second Darklands skeleton tier and a combat source of Mithril Keys.',
    intro: 'Skeleton Soldiers have 600 Health and carry a shield. Every defeat gives one normal loot roll and a separate 10% Mithril Key roll.',
    facts: [{ label: 'Health', value: '600' }, { label: 'Attack', value: '30' }, { label: 'Defence', value: '30' }, { label: 'Evasion', value: '15' }, { label: 'Warding', value: '15' }, { label: 'Heavy', value: '75' }, { label: 'Slash', value: '45' }, { label: 'Block Power', value: '25' }, { label: 'Attack speed', value: '3' }, { label: 'Key chance', value: 'Mithril Key — 10%' }],
    sections: [
      { title: 'Defences', table: { headers: ['Slash', 'Pierce', 'Fire', 'Lightning', 'Ice'], rows: [['21', '60', '30', '15', '90']] } },
      { title: 'Normal loot roll', table: { headers: ['Reward', 'Quantity', 'Chance'], rows: [['Coins', '20–40', '35.6888%'], ['Small Weak Health Potion', '1', '21.4133%'], ['Coins', '50', '7.1378%'], ['Large Shields Potion', '1', '7.1378%'], ['Large Health Potion', '1', '7.1378%'], ['Coal Dust', '5–10', '7.1378%'], ['Small Worm Bait', '5–15', '7.1378%'], ['Medium Worm Bait', '5–15', '7.1378%'], ['Broken Sword', '1', '0.0357%'], ['Skeleton Shield', '1', '0.0357%']] } },
      { title: 'Separate key roll', paragraphs: ['After the normal reward, there is a separate 10% chance to receive a Mithril Key. The key does not replace the normal drop.'] },
    ],
    related: ['mithril-key', 'coal-dust', 'broken-sword', 'skeleton-shield', 'darklands-chests'],
  }),
  currentCreature({
    slug: 'skeleton-knight-darklands', title: 'Skeleton Knight (Darklands)',
    summary: 'The strongest regular Darklands skeleton and the combat source of Dark Keys.',
    intro: 'Darklands Skeleton Knights have 1,000 Health, high Heavy and Slash offence, and very strong Pierce and Ice protection. Every defeat gives one normal loot roll and a separate Dark Key roll.',
    facts: [{ label: 'Health', value: '1,000' }, { label: 'Attack', value: '50' }, { label: 'Defence', value: '50' }, { label: 'Evasion', value: '35' }, { label: 'Warding', value: '35' }, { label: 'Heavy', value: '125' }, { label: 'Slash', value: '75' }, { label: 'Attack speed', value: '3' }, { label: 'Attack range', value: '220' }, { label: 'Key chance', value: 'Dark Key — 3.3333% (about 1 in 30)' }],
    sections: [
      { title: 'Defences', table: { headers: ['Slash', 'Pierce', 'Fire', 'Lightning', 'Ice'], rows: [['35', '100', '50', '25', '150']] } },
      { title: 'Normal loot roll', table: { headers: ['Reward', 'Quantity', 'Chance'], rows: [['Coins', '25–100', '34.2114%'], ['Small Weak Health Potion', '1', '20.5269%'], ['Coins', '150', '6.8423%'], ['Large Shields Potion', '1', '6.8423%'], ['Large Health Potion', '1', '6.8423%'], ['Gold Dust', '5–10', '6.8423%'], ['Small Worm Bait', '15–30', '6.8423%'], ['Medium Worm Bait', '15–30', '6.8423%'], ['Large Strong Shields Potion', '1', '1.7106%'], ['Large Strong Health Potion', '1', '1.7106%'], ['Gold Bar', '1', '0.6842%'], ['Titanium Ring', '1', '0.0684%'], ['Skeleton Greatsword', '1', '0.0342%']] } },
      { title: 'Separate key roll', paragraphs: ['After the normal reward, there is a separate 3.3333% chance to receive a Dark Key. The key does not replace the normal drop.'] },
    ],
    related: ['dark-key', 'gold-dust', 'titanium-ring', 'skeleton-greatsword', 'darklands-chests'],
  }),
];

function ashenCreature(slug: string, title: string, rarePiece: string, aliases: string[] = []): WikiEntry {
  return currentCreature({
    slug, title, aliases,
    summary: `A level-95 Ashen enemy whose current rewards include Coal Dust, Gold Dust, and ${rarePiece}.`,
    intro: `${title}s have 1,500 Health and award 2,925 total combat XP at full credit. Their common reward and rare ring-piece chance are rolled separately.`,
    categories: ['Creatures', 'Caverns', 'Combat'],
    facts: [{ label: 'Level', value: '95' }, { label: 'Health', value: '1,500' }, { label: 'Total combat XP', value: '2,925' }, { label: 'Rare drop', value: `${rarePiece} — 0.2% (1 in 500)` }],
    sections: [
      { title: 'Common loot roll', table: { headers: ['Reward', 'Quantity', 'Chance'], rows: [['Coins', '100–250', '62.5%'], ['Coins', '400', '12.5%'], ['Gold Dust', '1', '12.5%'], ['Coal Dust', '1', '12.5%']] } },
      { title: 'Separate rare roll', paragraphs: [`Every defeat also has a separate 0.2% chance — 1 in 500 — to award ${rarePiece}.`] },
    ],
    related: ['coal-dust', 'gold-dust', 'volcanic-ring', 'the-burning-king'],
  });
}

const ashenCreatures: WikiEntry[] = [
  ashenCreature('ashen-mage', 'Ashen Mage', 'Charred Ring Piece 3'),
  ashenCreature('ashen-archer', 'Ashen Archer', 'Charred Ring Piece 2', ['Ashen Ranger', 'Ashen Rangers']),
  ashenCreature('ashen-warrior', 'Ashen Warrior', 'Charred Ring Piece 1'),
];

const elvenCreatures: WikiEntry[] = [
  currentCreature({
    slug: 'elf', title: 'Elf',
    summary: 'A level-37 melee fighter in Elven Haven with a newly improved Elven Cloth drop rate.',
    intro: 'Elves are armoured melee fighters found in Elven Haven. Each defeat gives one normal loot roll and a separate 1% Elven Ring roll.',
    categories: ['Creatures', 'Elven Haven', 'Combat'],
    facts: [{ label: 'Level', value: '37' }, { label: 'Health', value: '400' }, { label: 'Total combat XP', value: '548' }, { label: 'Location', value: 'Elven Haven' }],
    sections: [
      { title: 'Normal loot roll', table: { headers: ['Reward', 'Quantity', 'Chance'], rows: [['Coins', '10–30', '52.6316%'], ['Coins', '50', '17.5439%'], ['Essence', '30–50', '17.5439%'], ['Elven Cloth', '1', '12.2807%']] } },
      { title: 'Separate rare roll', paragraphs: ['Every defeat also has a separate 1% chance to award an Elven Ring.'] },
    ],
    related: ['elven-haven', 'elven-cloth', 'elven-ring', 'elf-scholar', 'elf-warden'],
  }),
  currentCreature({
    slug: 'elf-scholar', title: 'Elf Scholar',
    summary: 'A level-37 magical fighter in Elven Haven with a newly improved Elven Cloth drop rate.',
    intro: 'Elf Scholars are ranged magical enemies found in Elven Haven. Each defeat gives one normal loot roll and a separate 1% Artisan Gloves roll.',
    categories: ['Creatures', 'Elven Haven', 'Combat'],
    facts: [{ label: 'Level', value: '37' }, { label: 'Health', value: '400' }, { label: 'Total combat XP', value: '548' }, { label: 'Location', value: 'Elven Haven' }],
    sections: [
      { title: 'Normal loot roll', table: { headers: ['Reward', 'Quantity', 'Chance'], rows: [['Coins', '10–30', '52.6316%'], ['Coins', '50', '17.5439%'], ['Essence', '30–50', '17.5439%'], ['Elven Cloth', '1', '12.2807%']] } },
      { title: 'Separate rare roll', paragraphs: ['Every defeat also has a separate 1% chance to award Artisan Gloves.'] },
    ],
    related: ['elven-haven', 'elven-cloth', 'artisan-gloves', 'elf', 'elf-warden'],
  }),
  currentCreature({
    slug: 'elf-warden', title: 'Elf Warden',
    summary: 'A level-120 Elven Haven boss whose Elven Cloth chance has increased to 21.0526% per normal roll.',
    intro: 'The Elf Warden is a high-level boss in Elven Haven. Each defeat makes one or two normal loot rolls and a separate 1% Elven Greatsword roll.',
    categories: ['Creatures', 'Bosses', 'Elven Haven', 'Combat'],
    facts: [{ label: 'Level', value: '120' }, { label: 'Health', value: '3,500' }, { label: 'Total combat XP', value: '7,350' }, { label: 'Location', value: 'Elven Haven' }],
    sections: [
      { title: 'Normal loot roll', paragraphs: ['The Warden rolls this table one or two times per defeat.'], table: { headers: ['Reward', 'Quantity', 'Chance per roll'], rows: [['Coins', '250–500', '52.6316%'], ['Coins', '1,000', '5.2632%'], ['Essence', '150–200', '21.0526%'], ['Elven Cloth', '1', '21.0526%']] } },
      { title: 'Separate rare roll', paragraphs: ['Every defeat also has a separate 1% chance to award an Elven Greatsword.'] },
      { title: 'Boss mechanics', bullets: ['Below 55% Health, the Warden enrages and deals more damage.', 'Run around the Warden during the rotating fire beam.', 'Avoid the falling fireballs and moving fire tornado areas.', 'Sidestep the whirlwind cone when its charge indicator appears.', 'Defeat summoned Elves and Elf Scholars quickly to reduce incoming damage.'] },
    ],
    related: ['elven-haven', 'elven-cloth', 'elven-greatsword', 'elf', 'elf-scholar'],
  }),
  currentCreature({
    slug: 'mining-skeleton', title: 'Mining Skeleton',
    summary: 'A mine-area skeleton whose combat profile now emphasizes Heavy and Pierce damage.',
    intro: 'Mining Skeletons were rebalanced in the current build. Their previous Quick and Slash values were removed in favour of Heavy and Pierce attacks.',
    categories: ['Creatures', 'Mines', 'Combat'],
    facts: [{ label: 'Heavy', value: '30' }, { label: 'Pierce', value: '10' }, { label: 'Quick', value: '0' }, { label: 'Slash', value: '0' }, { label: 'Attack speed', value: '2.5' }],
    sections: [{ title: 'Combat change', paragraphs: ['Prepare for Heavy and Pierce damage rather than the older Quick and Slash profile. The attack speed is now 2.5.'] }],
    related: ['mining', 'cavern-mine', 'combat-mechanics'],
  }),
];

const burningKing = currentCreature({
  slug: 'the-burning-king', title: 'The Burning King',
  summary: 'The Lava Cavern boss that drops Volcanic materials and the Sword of the Burning King.',
  intro: 'The Burning King is a level-307 boss with 10,000 Health. Its common reward and each unique-item chance are rolled separately.',
  categories: ['Creatures', 'Bosses', 'Lava Cavern', 'Combat'],
  facts: [{ label: 'Level', value: '307' }, { label: 'Health', value: '10,000' }, { label: 'Total combat XP', value: '27,587.5' }],
  sections: [
    { title: 'Common loot roll', table: { headers: ['Reward', 'Quantity', 'Chance'], rows: [['Coins', '2,000–4,000', '58.8235%'], ['Coins', '5,000', '11.7647%'], ['Essence', '600–800', '11.7647%'], ['Coal Dust', '40–80', '11.7647%'], ['Gold Dust', '50–60', '5.8824%']] } },
    { title: 'Separate unique rolls', table: { headers: ['Reward', 'Chance', 'Average rate'], rows: [['Volcanic Shard', '1%', '1 in 100'], ['Volcanic Core', '0.2%', '1 in 500'], ['Sword of the Burning King', '0.1%', '1 in 1,000']] } },
  ],
  related: ['lava-cavern', 'coal-dust', 'gold-dust', 'volcanic-shard', 'volcanic-core', 'sword-of-the-burning-king'],
});

const darklandsGuide: WikiEntry = {
  slug: 'the-darklands', title: 'The Darklands', type: 'Location', verification: 'engine',
  summary: 'A full-loot PvP region with standard and solo server rules, danger brackets, dust rocks, skeletons, keys, and reward chests.',
  intro: 'The Darklands is a high-risk PvP region. Standard servers allow multiple attackers within the engagement limit, while Server 1 uses Solo Darklands rules that limit player fights to one-versus-one in exchange for slower resources and fewer keys.',
  categories: ['Locations', 'Regions', 'PvP', 'Darklands'],
  facts: [{ label: 'Standard PvP limit', value: 'Up to 3 concurrent attackers' }, { label: 'Solo Darklands', value: 'Server 1 · 1v1 player combat' }, { label: 'Danger brackets', value: '10 combat levels' }, { label: 'Anti-pile-jump timer', value: '15 seconds' }, { label: 'Solo key rate', value: '20% below standard servers' }],
  sections: [
    {
      title: 'Choose the rule set',
      table: {
        headers: ['Rule', 'Standard Darklands', 'Solo Darklands — Server 1'],
        rows: [
          ['Player combat', 'Up to 3 concurrent attackers', 'Limited to 1v1'],
          ['Enemy respawns', 'Normal rate', 'Twice as slow'],
          ['Rock refresh', 'Normal rate', 'Twice as slow'],
          ['Darklands key drops', 'Standard rate', '20% less common'],
        ],
      },
    },
    {
      title: 'PvP engagements',
      bullets: [
        'A white circle marks players who are currently engaged with you.',
        'After defeating another player, you gain a grace period that occupies an engagement slot and can help prevent another immediate attack.',
        'Grace effects can stack, but attacking a new player consumes that protection.',
        'An attacker must deal enough damage to remain engaged; token hits are not enough to reserve a target slot.',
        'The danger system uses 10-level brackets, and the anti-pile-jump protection timer is 15 seconds.',
      ],
    },
    {
      title: 'Death, logout, and recovery',
      bullets: [
        'Treat the Darklands as full-loot PvP: bank anything you are not prepared to lose before crossing into the region.',
        'Force-quitting does not bypass the Darklands logout timer.',
        'Untradeable items lost in PvP can be bought back from the recovery NPC and chest in Grave Town.',
        'Non-potion drops appear almost immediately in the Darklands, so do not rely on hidden ground loot.',
      ],
    },
    {
      title: 'Gathering and rewards',
      paragraphs: ['Iron Dust and Coal Dust rocks appear in lower-danger areas. Darklands skeletons and rocks can award Iron, Mithril, or Dark Keys, which open the three matching chests. Solo Darklands keeps the same activities but slows enemy and rock recovery and reduces key drops by 20%.'],
    },
  ],
  related: ['darklands-chests', 'iron-dust', 'coal-dust', 'iron-key', 'mithril-key', 'dark-key', 'skeleton-footman', 'skeleton-soldier', 'skeleton-knight-darklands', 'combat-mechanics'],
  source: currentGameSource,
};

const darklandsChests: WikiEntry = {
  slug: 'darklands-chests', title: 'Darklands chests', type: 'Guide', verification: 'engine',
  summary: 'Complete supplies and rare-equipment chances for all three Darklands chest tiers.',
  intro: 'Each Darklands chest opening makes two independent rolls: one guaranteed supplies-table roll and one rare-equipment roll. Receiving supplies does not reduce the rare-item chance.',
  categories: ['Guides', 'Darklands', 'Loot'],
  facts: [{ label: 'Chest tiers', value: 'Iron · Mithril · Dark' }, { label: 'Rolls per key', value: '1 supplies roll + 1 rare roll' }],
  sections: [
    { title: 'Iron chest — supplies roll', table: { headers: ['Reward', 'Quantity', 'Chance'], rows: [['Small Health Potion', '3–6, noted', '16.6667%'], ['Coins', '50–100', '16.6667%'], ['Small Shields Potion', '1–2, noted', '16.6667%'], ['Iron Arrows', '25–50', '16.6667%'], ['Essence', '25–50', '16.6667%'], ['Rough Leather', '2–4, noted', '8.3333%'], ['Rough Cloth', '2–4, noted', '8.3333%']] } },
    { title: 'Iron chest — rare roll', table: { headers: ['Reward', 'Chance'], rows: [['Iron Scimitar', '10%'], ['Iron Battle Pickaxe', '10%'], ['No rare item', '80%']] } },
    { title: 'Mithril chest — supplies roll', table: { headers: ['Reward', 'Quantity', 'Chance'], rows: [['Large Health Potion', '10–20, noted', '16.6667%'], ['Coins', '500–1,000', '16.6667%'], ['Large Shields Potion', '5–10, noted', '16.6667%'], ['Mithril Arrows', '50–100', '16.6667%'], ['Essence', '150–300', '16.6667%'], ['Thick Leather', '3–6, noted', '16.6667%']] } },
    { title: 'Mithril chest — rare roll', table: { headers: ['Reward', 'Chance'], rows: [['Mithril Battle Pickaxe', '5%'], ['Mithril Scimitar', '5%'], ['No rare item', '90%']] } },
    { title: 'Dark chest — supplies roll', table: { headers: ['Reward', 'Quantity', 'Chance'], rows: [['Gilded Strong Health Potion', '10–20, noted', '16.6667%'], ['Coins', '8,000–10,000', '16.6667%'], ['Gilded Strong Shields Potion', '5–10, noted', '16.6667%'], ['Mithril Arrows', '250–500', '16.6667%'], ['Essence', '500–1,000', '16.6667%'], ['Elven Cloth', '3–6, noted', '16.6667%']] } },
    { title: 'Dark chest — rare roll', table: { headers: ['Reward', 'Chance', 'Average rate'], rows: [['Corrupted Dark Battle Pickaxe', '2%', '1 in 50'], ['Corrupted Dark Scimitar', '2%', '1 in 50'], ['Dark Cape', '1%', '1 in 100'], ['Dark Necklace', '0.1%', '1 in 1,000'], ['No rare item', '94.9%', '—']] } },
  ],
  related: ['iron-key', 'mithril-key', 'dark-key', 'the-darklands', 'iron-scimitar', 'mithril-scimitar', 'corrupted-dark-scimitar', 'dark-cape', 'dark-necklace'],
  source: currentGameSource,
};

const recentUpdateGuide: WikiEntry = {
  slug: 'september-2026-game-update', title: 'September 2026 game updates', type: 'Guide', verification: 'engine',
  summary: 'The current September changes, including Solo Darklands, revised chest supplies, pickaxe scaling, fish-processing levels, and the earlier Darklands content release.',
  intro: 'The latest September update adds a one-versus-one Darklands option and rebalances several activities. This page also retains the new items, enemies, mining resources, and chests introduced earlier in the month.',
  categories: ['Guides', 'Updates'],
  facts: [{ label: 'Latest update', value: '11 September 2026' }, { label: 'Current data review', value: '13 September 2026' }, { label: 'Solo Darklands', value: 'Server 1' }],
  sections: [
    { title: 'Solo Darklands', bullets: ['Server 1 now limits Darklands player combat to 1v1.', 'Enemy respawns and rock refreshes are twice as slow on the solo rule set.', 'Darklands key drops are 20% less common on the solo rule set.', 'Current engagements are shown with a white circle, and post-kill grace periods occupy engagement slots until consumed.', 'Danger brackets now span 10 combat levels, and the anti-pile-jump protection timer is 15 seconds.'] },
    { title: 'Chest supply changes', bullets: ['Iron chests can now give 2–4 noted Rough Leather or 2–4 noted Rough Cloth.', 'Mithril chests can now give 3–6 noted Thick Leather.', 'Dark chests can now give 3–6 noted Elven Cloth.', 'Because the supplies pools are larger, the exact chances on the Darklands chests page have been recalculated from the current tables. Rare-equipment rolls remain separate.'] },
    { title: 'Combat and boss balance', bullets: ['Pickaxe damage and accuracy now receive 50% of their level scaling from Mining.', 'The Broken Sword now has 15 Slash and 25 Quick, up from 8 and 10.', 'An unnegated hit now applies a 15% movement slow, increased from 10%.', 'The Cavern Goblin Hunter has one fewer health-based special trigger and waits longer between a special and its next normal attack.', 'Large scenery around the Cavern Goblin Hunter can now hide automatically when it blocks the camera.'] },
    { title: 'Potion Making level changes', table: { headers: ['Knife Station recipe', 'Old level', 'Current level'], rows: [['Harvest Perch', '10', '5'], ['Harvest Bass', '20', '15'], ['Harvest Elder Trout', '40', '35'], ['Harvest Carp', '50', '45']] } },
    { title: 'Interface and performance', bullets: ['Right-click Inspect now opens a list of every available action under the cursor, which is especially useful on crowded loot piles.', 'The new Winds of Valen main theme by Open Sky Studios now plays on the main menu.', 'Health bars disappear when their target dies.', 'Shop purchase quantities and bank withdrawal quantities are remembered between sessions.', 'The in-game map now shows the new Darklands content.', 'Networking, saving, memory use, item visual resyncing, and cavern event range received fixes or performance improvements.'] },
    { title: 'Earlier September additions', bullets: ['Iron, Mithril, and Dark Keys connect Darklands enemies and dust rocks to three chest tiers.', 'The new equipment includes three Scimitars, three Battle Pickaxes, the Dark Cape, and the Dark Necklace.', 'Iron Dust and Coal Dust are mineable resources; matching ore or dust can be used in the current bar recipes.', 'Ashen and Burning King reward tables now use Coal Dust, and Elven Cloth is more common from Elven enemies.', 'An enchanted cavern bank area was added to the current cavern content.'] },
  ],
  related: ['the-darklands', 'darklands-chests', 'broken-sword', 'mining', 'potion-making', 'cavern-goblin-hunter'],
  source: currentGameSource,
};

export const currentGameUpdateEntries: WikiEntry[] = [
  ...currentItems,
  ...darklandsCreatures,
  ...ashenCreatures,
  ...elvenCreatures,
  burningKing,
  darklandsGuide,
  darklandsChests,
  recentUpdateGuide,
];
