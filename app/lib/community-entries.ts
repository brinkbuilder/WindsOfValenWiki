import type { ExternalSource, WikiEntry, WikiFact, WikiSection } from './wiki-data';
import { communityPermalink, communityWikiPages, communityWikiSnapshot } from './community-wiki';

type CommunityEntrySpec = {
  slug: string;
  title: string;
  type: WikiEntry['type'];
  questKind?: WikiEntry['questKind'];
  summary: string;
  intro: string;
  aliases?: string[];
  categories: string[];
  facts: WikiFact[];
  sections: WikiSection[];
  related?: string[];
  relation?: ExternalSource['relation'];
  note?: string;
};

function sourceFor(pageTitle: string, scope: string[], relation: ExternalSource['relation'] = 'supplements', note?: string): ExternalSource {
  const page = communityWikiPages.find((candidate) => candidate.title === pageTitle);
  if (!page) throw new Error(`Community snapshot is missing ${pageTitle}`);
  return {
    id: `community-${page.pageId}`,
    site: 'Winds Of Valen Wiki',
    pageTitle,
    permalink: communityPermalink(page),
    revisionId: page.revisionId,
    revisedAt: page.revisedAt,
    retrievedAt: communityWikiSnapshot.retrievedAt,
    relation,
    scope,
    note,
  };
}

function communityEntry(pageTitle: string, spec: CommunityEntrySpec): WikiEntry {
  const reference = sourceFor(pageTitle, spec.facts.map((fact) => fact.label), spec.relation, spec.note);
  return {
    ...spec,
    verification: 'community',
    facts: spec.facts.map((fact) => ({ ...fact, sourceRef: reference.id })),
    source: {
      label: 'Attributed community documentation',
      detail: 'Paraphrased factual claims from the linked community-maintained article. These claims remain separate from ValenBridge evidence.',
      observed: reference.revisedAt.slice(0, 10),
    },
    externalSources: [reference],
  };
}

const skillEntries: WikiEntry[] = [
  communityEntry('Archery', {
    slug: 'archery', title: 'Archery', type: 'Activity', categories: ['Skills', 'Combat', 'Community documented'],
    summary: 'The ranged combat skill used with bows and arrows.',
    intro: 'Archery is a combat skill trained by dealing damage with bows while using the Offensive stance.',
    facts: [{ label: 'Training stance', value: 'Offensive' }, { label: 'Experience split', value: '75% Archery · 25% Health' }, { label: 'Change stance', value: 'V' }],
    sections: [
      { title: 'How to train Archery', bullets: ['Equip a bow that requires the Archery skill.', 'Carry the arrows required by the bow.', 'Use the Offensive stance. Press V to change stance.', 'Attack enemies; stronger enemies award more experience.'] },
      { title: 'Benefits of training', bullets: ['Improves accuracy and damage with ranged weapons.', 'Unlocks stronger bows and arrows.'] },
      { title: 'Experience', paragraphs: ['Combat experience is split between the skill being trained and Health. Archery receives 75% of the total and Health receives 25%.'] },
    ], related: ['combat', 'combat-mechanics', 'health', 'potion-families'],
  }),
  communityEntry('Attack', {
    slug: 'attack', title: 'Attack', type: 'Activity', categories: ['Skills', 'Combat', 'Community documented'],
    summary: 'The melee combat skill that improves accuracy and damage.',
    intro: 'Attack is a skill in Winds of Valen. Train it by fighting with an Attack weapon while using the Offensive stance.',
    facts: [{ label: 'Training stance', value: 'Offensive' }, { label: 'Experience split', value: '75% Attack · 25% Health' }, { label: 'Change stance', value: 'V' }],
    sections: [
      { title: 'How to train Attack', bullets: ['Equip a weapon that requires the Attack skill.', 'Use the Offensive stance. Press V to change stance.', 'Deal damage to enemies. Higher-level enemies give more experience.'] },
      { title: 'Benefits of training', bullets: ['Improves accuracy with Attack weapons.', 'Increases the damage dealt by Attack weapons.', 'Unlocks stronger weaponry.'] },
      { title: 'Experience', paragraphs: ['Combat experience is split between the active combat skill and Health. Attack receives 75% of the total and Health receives 25%.'] },
    ], related: ['combat', 'combat-mechanics', 'health', 'potion-families'],
  }),
  communityEntry('Defence', {
    slug: 'defence', title: 'Defence', type: 'Activity', categories: ['Skills', 'Combat', 'Community documented'],
    summary: 'A defensive combat skill that improves protection against heavy attacks.',
    intro: 'Defence is trained in combat while using the Defensive stance and an appropriate Block shield.',
    facts: [{ label: 'Training stance', value: 'Defensive' }, { label: 'Experience split', value: '75% Defence · 25% Health' }, { label: 'Best against', value: 'Heavy / red damage' }],
    sections: [
      { title: 'How to train Defence', bullets: ['Equip a Block shield.', 'Use the Defensive stance.', 'Fight enemies that use heavy or red damage so the shield matches their primary attack type.'] },
      { title: 'Benefits of training', bullets: ['Improves the defence roll used against incoming attacks.', 'Makes matching shields more effective.', 'Unlocks stronger defensive equipment.'] },
    ], related: ['combat', 'combat-mechanics', 'health', 'advanced-parry-shield'],
  }),
  communityEntry('Evasion', {
    slug: 'evasion', title: 'Evasion', type: 'Activity', categories: ['Skills', 'Combat', 'Community documented'],
    summary: 'A defensive combat skill used with Parry shields against quick attacks.',
    intro: 'Evasion is trained in combat while using the Defensive stance and a Parry shield.',
    facts: [{ label: 'Training stance', value: 'Defensive' }, { label: 'Experience split', value: '75% Evasion · 25% Health' }, { label: 'Best against', value: 'Quick / green damage' }],
    sections: [
      { title: 'How to train Evasion', bullets: ['Equip a Parry shield.', 'Use the Defensive stance.', 'Fight enemies that use quick or green damage so the shield matches their primary attack type.'] },
      { title: 'Benefits of training', bullets: ['Improves the defence roll against incoming attacks.', 'Makes Parry shields more effective.', 'Unlocks stronger shields.'] },
    ], related: ['combat', 'combat-mechanics', 'health', 'archery'],
  }),
  communityEntry('Health', {
    slug: 'health', title: 'Health', type: 'Activity', categories: ['Skills', 'Combat', 'Community documented'],
    summary: 'The survivability skill that receives a share of combat experience.',
    intro: 'Health is the survivability skill. It receives part of the experience from every combat style and increases maximum hit points.',
    facts: [{ label: 'Experience share', value: '25% of combat XP' }, { label: 'Hit points', value: '+10 HP per level' }, { label: 'Level 1 health', value: '100 HP' }],
    sections: [
      { title: 'Training Health', paragraphs: ['Health trains automatically while fighting. One quarter of combat experience goes to Health and the remaining three quarters go to the active combat skill.'] },
      { title: 'Maximum health', paragraphs: ['A character begins with 100 hit points at level 1. Each additional Health level adds 10 hit points.'] },
      { title: 'Recovery', paragraphs: ['Health potions restore hit points. Stronger potion families and larger vial sizes provide more recovery.'] },
    ], related: ['combat', 'combat-mechanics', 'potion-families'],
  }),
  communityEntry('Magic', {
    slug: 'magic', title: 'Magic', type: 'Activity', categories: ['Skills', 'Combat', 'Community documented'],
    summary: 'A combat skill with fire, ice, and lightning weapon effects.',
    intro: 'Magic weapons use fire, ice, and lightning effects. Each element changes how damage or control is applied during combat.',
    facts: [{ label: 'Fire', value: 'Decaying burn; about 15% of the initial hit in total' }, { label: 'Ice', value: 'Movement slow' }, { label: 'Lightning', value: 'Static Charges; 50% bonus hit at maximum charges' }],
    sections: [
      { title: 'Elemental effects', bullets: ['Fire applies a diminishing damage-over-time effect.', 'Ice slows movement, with stronger tiers applying stronger slows.', 'Lightning builds Static Charges and triggers an extra hit at maximum charges.'] },
      { title: 'What can vary', paragraphs: ['Exact durations, charge thresholds, and resistance interactions can vary by weapon tier and game update. Use the values above as a practical starting point.'] },
    ], related: ['combat', 'combat-mechanics', 'warding', 'potion-families'],
  }),
  communityEntry('Smithing', {
    slug: 'smithing', title: 'Smithing', type: 'Activity', categories: ['Skills', 'Crafting', 'Community documented'],
    summary: 'A metalworking skill whose older community guide predates the August 2026 rework.',
    intro: 'Smithing received a major rework after the cited community skill page was written. The archive therefore keeps the page as a discovery lead, not a current recipe authority.',
    facts: [{ label: 'Status', value: 'Rework verification needed' }, { label: 'Known facilities', value: 'Furnace, anvil, workbench' }, { label: 'Caution', value: 'Old recipes and values may be obsolete' }],
    sections: [
      { title: 'Rework boundary', paragraphs: ['The August 2026 update changed recipes, equipment values, facility use, material inputs, and hammer behaviour. Numeric tables from older guides should not be imported as current facts.'] },
      { title: 'Research priorities', bullets: ['Current ore-to-bar formulas', 'Workbench equipment recipes', 'Cloth and leather inputs', 'Smithing Power behaviour', 'Anvil hammer requirements'] },
    ], related: ['mining'], relation: 'conflicts', note: 'This revision predates the August 2026 smithing rework and may contain obsolete formulas.',
  }),
  communityEntry('Warding', {
    slug: 'warding', title: 'Warding', type: 'Activity', categories: ['Skills', 'Combat', 'Community documented'],
    summary: 'A defensive combat skill used with Ward shields against mystical attacks.',
    intro: 'Warding is trained in combat while using the Defensive stance and a Ward shield.',
    facts: [{ label: 'Training stance', value: 'Defensive' }, { label: 'Experience split', value: '75% Warding · 25% Health' }, { label: 'Best against', value: 'Mystical / blue damage' }],
    sections: [
      { title: 'How to train Warding', bullets: ['Equip a Ward shield.', 'Use the Defensive stance.', 'Fight enemies that use mystical or blue damage so the shield matches their primary attack type.'] },
      { title: 'Benefits of training', bullets: ['Improves the defence roll against mystical attacks.', 'Makes Ward shields more effective.', 'Unlocks stronger wards.'] },
    ], related: ['combat', 'combat-mechanics', 'health', 'magic'],
  }),
];

const guideEntries: WikiEntry[] = [
  communityEntry('Combat Mechanics', {
    slug: 'combat-mechanics', title: 'Combat mechanics', type: 'Guide', categories: ['Guides', 'Combat', 'Community documented'],
    summary: 'Combat experience, damage types, accuracy, defence, and shield matching.',
    intro: 'Combat in Winds of Valen rewards matching the right weapon and shield to an enemy while training offensive, defensive, and Health skills together.',
    facts: [{ label: 'Combat XP', value: 'Damage × enemy level multiplier' }, { label: 'Experience split', value: '75% active skill · 25% Health' }, { label: 'Shield matching', value: 'Block/heavy · Parry/quick · Warding/mystical' }],
    sections: [
      { title: 'Combat experience', paragraphs: ['Experience is gained by dealing damage. The total is multiplied by the enemy level multiplier, then split: 75% goes to the active combat skill and 25% goes to Health. Enemies from level 1 to 100 scale by roughly 0.01 per level; enemies above level 100 scale more slowly.'] },
      { title: 'Choose the right shield', bullets: ['Use a Block shield against heavy or red attacks.', 'Use a Parry shield against quick or green attacks.', 'Use a Ward shield against mystical or blue attacks.', 'If two damage types are tied, either matching shield can be used.'] },
      { title: 'Choose the right weapon', bullets: ['Target the enemy’s lowest defence stat.', 'Piercing weapons work best against low Pierce Defence.', 'Slashing weapons work best against low Slash Defence.', 'The correct weapon improves damage output and makes training faster.'] },
      { title: 'Accuracy and defence', paragraphs: ['Attacks compare an accuracy roll with a defence roll. The maximum accuracy roll is (Attack level + 8) × (equipped accuracy + 32). Defence uses the same level-based structure with the relevant defensive skill and equipment.'] },
      { title: 'Plan your training', paragraphs: ['Use the combat calculator to estimate experience per kill, kills to a target level, the Health experience gained along the way, and expected training time.'], bullets: ['Match your shield before starting.', 'Use the enemy’s full health for a simple per-kill estimate.', 'Add travel or respawn time for a more realistic training estimate.'] },
    ], related: ['combat', 'attack', 'archery', 'defence', 'evasion', 'magic', 'warding', 'health'],
  }),
  communityEntry('Controls', {
    slug: 'controls', title: 'Controls and commands', type: 'Guide', categories: ['Guides', 'Systems', 'Community documented'],
    summary: 'Useful keyboard shortcuts and chat commands for everyday play.',
    intro: 'These shortcuts cover the quest log, combat stance, inventory stacks, recovery commands, and player blocking.',
    facts: [{ label: 'Quest log', value: 'J' }, { label: 'Change stance', value: 'V' }, { label: 'Split stack', value: 'Ctrl + middle-mouse drag' }, { label: 'Command help', value: '/commands' }],
    sections: [
      { title: 'Keyboard shortcuts', bullets: ['J opens the quest log.', 'V changes combat stance.', 'Ctrl plus middle-mouse drag splits a stack.', 'Ctrl plus Drop discards matching items together.'] },
      { title: 'Chat commands', bullets: ['/commands lists available commands.', '/unstuck has a 30-minute cooldown.', '/block and /unblock manage player blocking.', '/kd displays your kill/death statistic.'] },
      { title: 'Quick tip', paragraphs: ['Use /commands after a game update to check whether any command names or cooldowns have changed.'] },
    ], related: ['combat', 'inventory'],
  }),
  communityEntry('Open The Gates', {
    slug: 'open-the-gates', title: 'Open The Gates', type: 'Quest', questKind: 'main', categories: ['Main Quest', 'Quests', 'Guides', 'Community documented'],
    summary: 'A complete novice quest walkthrough for unlocking Valen City.',
    intro: 'Help the guards outside Valen City, locate three missing scouts, and recover the Goblin Goods from the Goblin General to open the city gates.',
    facts: [
      { label: 'Classification', value: 'Main Quest' },
      { label: 'Start', value: 'Gate Guard at the Valen City gates' },
      { label: 'Difficulty', value: 'Novice' },
      { label: 'Membership', value: 'Required' },
      { label: 'Mining', value: 'Level 15' },
      { label: 'Enemies', value: 'Goblin Villagers (15) · Goblin General (55)' },
      { label: 'Rewards', value: 'Valen City access · Guard Cloak · 5,000 Mining XP' },
    ],
    sections: [
      {
        title: 'Before you begin',
        bullets: ['An active membership is required.', 'You need Mining level 15 and a pickaxe to clear the cave rubble.', 'Bring high-healing food or potions for the level-55 Goblin General.'],
      },
      {
        title: 'Start the quest',
        steps: [
          'Talk to the Gate Guard beside the closed Valen City gates.',
          'Cross the bridge toward Broken Village and speak to Guard Captain Miller.',
          'Miller asks you to find the missing scouts Harry, Thomas, and Walter.',
        ],
      },
      {
        title: 'Find the three scouts',
        steps: [
          'Find Harry in the purple wooden fort near the Goblin Villager camp west of the gate.',
          'Defeat the level-15 Goblin Villagers until one drops a Guard Helmet. Keep it for the quest.',
          'Continue west toward the cliffs and talk to Thomas.',
          'Head back downhill toward Captain Miller. At the fork, enter the wooded area and find Walter sitting behind a rock.',
          'Return to Captain Miller with the Guard Helmet and news of all three scouts.',
        ],
        images: [
          { src: '/quest-assets/open-gates-scout-map.png', alt: 'Map showing the locations of Harry, Thomas, and Walter', caption: 'The three scout locations.' },
          { src: '/quest-assets/open-gates-harry.png', alt: 'Harry at the purple wooden fort', caption: 'Harry is near the Goblin Villager camp.' },
          { src: '/quest-assets/open-gates-thomas.png', alt: 'Thomas standing near the western cliffs', caption: 'Thomas is farther west near the cliffs.' },
          { src: '/quest-assets/open-gates-walter.png', alt: 'Walter sitting behind a rock in the wooded area', caption: 'Walter is behind a rock near the wooded fork.' },
        ],
      },
      {
        title: 'Clear the cave and defeat the General',
        steps: [
          'Return to Thomas after reporting to Captain Miller.',
          'Use your pickaxe to mine the rubble blocking the cave. This requires Mining level 15.',
          'Enter the cave and defeat the level-55 Goblin General.',
          'Collect the Goblin Goods to finish the final objective and complete the gate sequence.',
        ],
        images: [{ src: '/quest-assets/open-gates-general-cave.png', alt: 'Entrance and location of the Goblin General cave', caption: 'The cave containing the Goblin General.' }],
      },
      {
        title: 'Rewards',
        bullets: ['Permanent access to Valen City', 'Guard Cloak, your first back-slot item', '5,000 Mining experience'],
      },
    ], related: ['valen-city', 'goblin-general', 'mining'],
  }),
  communityEntry('Crystal Caverns Miniquest (Bank unlock)', {
    slug: 'crystal-caverns-bank-unlock', title: 'Crystal Caverns bank unlock', type: 'Quest', questKind: 'miniquest', categories: ['Miniquests', 'Quests', 'Guides', 'Banking', 'Community documented'],
    summary: 'A complete miniquest guide for permanently unlocking the Crystal Caverns bank.',
    intro: 'Find Clara Vance inside Crystal Caverns and bring her a Resonant Essence Geode to unlock the cavern bank permanently.',
    facts: [
      { label: 'Classification', value: 'Miniquest' },
      { label: 'Start', value: 'Clara Vance in the Crystal Caverns mines' },
      { label: 'Difficulty', value: 'Novice' },
      { label: 'Membership', value: 'Required' },
      { label: 'Requirement', value: 'Ability to mine Essence Rocks' },
      { label: 'Required item', value: '1 Resonant Essence Geode' },
      { label: 'Reward', value: 'Permanent Crystal Caverns bank access' },
    ],
    sections: [
      {
        title: 'Start the miniquest',
        steps: ['Enter the Crystal Caverns mines.', 'Locate Clara Vance and speak to her to begin the bank-unlock miniquest.'],
        images: [{ src: '/quest-assets/crystal-clara.png', alt: 'Clara Vance inside the Crystal Caverns mines', caption: 'Speak to Clara Vance inside the mines.' }],
      },
      {
        title: 'Obtain a Resonant Essence Geode',
        steps: ['Mine Essence Rocks until you receive a Resonant Essence Geode, or obtain one from another player.', 'Keep the geode in your inventory and return to Clara Vance.'],
        paragraphs: ['The geode is a rare drop. One player reported mining 323 Essence Rocks before receiving one; this is a single player result, not a confirmed drop rate.'],
        images: [
          { src: '/quest-assets/crystal-essence-rock.png', alt: 'An Essence Rock in Crystal Caverns', caption: 'Mine Essence Rocks for a chance to receive the geode.' },
          { src: '/quest-assets/crystal-resonant-geode.png', alt: 'Resonant Essence Geode collection-log notification', caption: 'The Resonant Essence Geode.' },
          { src: '/quest-assets/crystal-geode-323-rocks.png', alt: 'Player inventory after mining 323 Essence Rocks for a geode', caption: 'A player-reported 323-rock attempt; this is not a drop-rate estimate.' },
        ],
      },
      {
        title: 'Unlock the bank',
        steps: ['Talk to Clara Vance while carrying the geode.', 'Choose the dialogue option “I found this weird crystal geode”.', 'The Crystal Caverns bank is now permanently available to your character.'],
        images: [{ src: '/quest-assets/crystal-bank.png', alt: 'The unlocked Crystal Caverns bank', caption: 'The bank unlocked by completing the miniquest.' }],
      },
      {
        title: 'Extra geodes',
        paragraphs: ['After the unlock, extra Resonant Essence Geodes can be sold to Clara Vance for 1,000 coins each.'],
      },
    ], related: ['crystal-cavern', 'essence-rock', 'banking'],
  }),
  communityEntry('Dusk Knight Shcematics Miniquest', {
    slug: 'dusk-knight-schematics-miniquest', title: 'Dusk Knight Schematics miniquest', type: 'Quest', questKind: 'miniquest', categories: ['Miniquests', 'Quests', 'Guides', 'Smithing', 'Community documented'],
    summary: 'The miniquest that awards the Dusk Knight Schematics used throughout the Dusk Knight armour crafting chain.',
    intro: 'Complete this miniquest to obtain the Dusk Knight Schematics required for the new armour components and final set assembly.',
    facts: [
      { label: 'Classification', value: 'Miniquest' },
      { label: 'Reward', value: 'Dusk Knight Schematics' },
      { label: 'Used for', value: 'Dusk Knight boots, platelegs, platebody, helmet, and their components' },
      { label: 'Detailed path', value: 'Not yet documented' },
    ],
    sections: [
      {
        title: 'What is confirmed',
        paragraphs: ['The miniquest awards Dusk Knight Schematics. The current Smithing recipes require the schematics when forging every named Dusk Knight component and when assembling each finished armour piece.'],
      },
      {
        title: 'Walkthrough status',
        paragraphs: ['The starting NPC, location, requirements, dialogue choices, and objective sequence are not yet known. This guide leaves those fields open instead of sending players in the wrong direction.'],
      },
      {
        title: 'After obtaining the schematics',
        steps: ['Open the Smithing guide and gather the complete full-set material list.', 'Forge the Dusk Knight metal components at an anvil.', 'Make the three Exquisite Silk linings.', 'Assemble the boots, platelegs, platebody, and helmet at a workbench.'],
      },
    ], related: ['smithing', 'dusk-knight-boots', 'dusk-knight-platelegs', 'dusk-knight-platebody', 'dusk-knight-helmet'],
  }),
];

const locationEntries: WikiEntry[] = [
  communityEntry('Valen City', {
    slug: 'valen-city', title: 'Valen City', type: 'Location', categories: ['Locations', 'Regions', 'Community documented'],
    summary: 'A members-only city unlocked through Open The Gates.',
    intro: 'Valen City is a members area unlocked by completing Open The Gates.',
    facts: [{ label: 'Membership', value: 'Required' }, { label: 'Unlock', value: 'Open The Gates' }, { label: 'Status', value: 'Community documented' }],
    sections: [{ title: 'Access', paragraphs: ['Complete Open The Gates to gain permanent access. The quest begins at the Gate Guard outside the closed city gates.'] }, { title: 'Before you go', paragraphs: ['Bring a pickaxe, level 15 Mining, and enough food or potions to defeat the level-55 Goblin General.'] }],
    related: ['open-the-gates'],
  }),
  communityEntry('The Darklands', {
    slug: 'the-darklands', title: 'The Darklands', type: 'Location', categories: ['Locations', 'Regions', 'PvP', 'Community documented'],
    summary: 'A full-loot player-versus-player region.',
    intro: 'The Darklands is a high-risk, full-loot player-versus-player region. Do not enter with equipment you are unwilling to lose.',
    facts: [{ label: 'Combat rule', value: 'Full-loot PvP reported' }, { label: 'Risk', value: 'Equipment and inventory loss possible' }, { label: 'Verification', value: 'Community documented' }],
    sections: [{ title: 'Risk notice', paragraphs: ['Treat the region as high risk until the current death and item-loss rules are confirmed in-game. The exact PvP boundary is not yet documented.'] }],
    related: ['combat', 'skeleton-knight-darklands'],
  }),
  communityEntry('Lava Cavern', {
    slug: 'lava-cavern', title: 'Lava Cavern', type: 'Location', categories: ['Locations', 'Caverns', 'Combat', 'Community documented'],
    summary: 'A high-level cavern documented with level-60 enemies and a boss.',
    intro: 'Lava Cavern is a high-level combat area containing level-60 enemies and a boss encounter.',
    facts: [{ label: 'Reported enemy level', value: '60' }, { label: 'Boss', value: 'Present' }, { label: 'Verification', value: 'Community documented' }],
    sections: [{ title: 'Preparation', paragraphs: ['Enemy composition, resistances, area hazards, and safe-banking paths still need direct observation. Enter prepared for a high-level combat area.'] }],
    related: ['combat', 'ashen-mage', 'ashen-archer', 'ashen-warrior', 'the-burning-king'],
  }),
  communityEntry('Crystal Cavern', {
    slug: 'crystal-cavern', title: 'Crystal Cavern', type: 'Location', categories: ['Locations', 'Caverns', 'Mining', 'Community documented'],
    summary: 'A cavern with community-reported level-50 mining resources.',
    intro: 'Crystal Cavern contains level-50 mining resources and a miniquest that permanently unlocks its bank.',
    facts: [{ label: 'Reported mining tier', value: 'Level 50' }, { label: 'Bank', value: 'Miniquest unlock reported' }, { label: 'Verification', value: 'Community documented' }],
    sections: [{ title: 'Known leads', paragraphs: ['Essence Rocks and the Resonant Essence Geode miniquest are the strongest documented leads. Exact resource types, requirements, and travel paths still need in-game confirmation.'] }],
    related: ['crystal-caverns-bank-unlock', 'essence-rock', 'ashen-mage', 'banking'],
  }),
];

const creatureEntries: WikiEntry[] = [
  communityEntry('Ashen Mage', {
    slug: 'ashen-mage', title: 'Ashen Mage', type: 'Creature', categories: ['Creatures', 'Caverns', 'Combat', 'Community documented'],
    summary: 'A level-95 undead caster found deep inside the Crystal Caverns.',
    intro: 'Ashen Mages wield charred fire staffs and attack with mystical and fire magic. Their full-health combat estimate is 2,925 total XP per defeat before the 75/25 split.',
    facts: [{ label: 'Reported level', value: '95' }, { label: 'Reported health', value: '1,500' }, { label: 'Location', value: 'Crystal Caverns' }, { label: 'Style', value: 'Mystical and fire' }, { label: 'Reported drops', value: 'Coins · Dirt/Ash · Coal · Gold Dust · Charred Ring Piece 3' }],
    sections: [
      { title: 'Combat profile', bullets: ['Uses mystical and fire attacks.', 'Full-health XP estimate: 2,925 total XP before the combat split.', 'Watch the attack animation and keep fire resistance in mind.'] },
      { title: 'Known drops', paragraphs: ['The current guide lists Coins, Dirt/Ash, Coal, Gold Dust, and Charred Ring Piece 3. Drop rates are not provided.'] },
    ],
    related: ['combat', 'cavern-mine', 'the-burning-king'],
  }),
  communityEntry('Ashen Archer', {
    slug: 'ashen-archer', title: 'Ashen Archer', type: 'Creature', aliases: ['Ashen Ranger', 'Ashen Rangers'], categories: ['Creatures', 'Caverns', 'Combat', 'Community documented'],
    summary: 'A level-95 undead ranged attacker found in the West Mine Ashen Cavern.',
    intro: 'Ashen Archers wield charred large bows and pressure players with quick ranged attacks from a distance. They are also commonly referred to as Ashen Rangers.',
    facts: [{ label: 'Reported level', value: '95' }, { label: 'Reported health', value: '1,500' }, { label: 'Reported total XP', value: '2,925' }, { label: 'Location', value: 'West Mine Ashen Cavern' }, { label: 'Style', value: 'Ranged' }, { label: 'Reported drops', value: 'Coins · Gold Dust · Coal Ore · Charred Ring Piece 2' }],
    sections: [
      { title: 'Combat profile', bullets: ['Uses quick ranged attacks with a charred large bow.', 'Keep moving and use suitable protection against Pierce attacks.', 'A defeat awards 2,925 total XP before the combat split.'] },
      { title: 'Known drops', paragraphs: ['The current guide lists Coins, Gold Dust, Coal Ore, and Charred Ring Piece 2. Drop rates are not provided.'] },
    ],
    related: ['combat', 'the-burning-king', 'ashen-mage'],
  }),
  communityEntry('Ashen Warrior', {
    slug: 'ashen-warrior', title: 'Ashen Warrior', type: 'Creature', categories: ['Creatures', 'Caverns', 'Combat', 'Community documented'],
    summary: 'A level-95 undead melee attacker found in the West Mine Ashen Cavern.',
    intro: 'Ashen Warriors wield charred large swords and rely on heavy melee attacks. Their full-health combat estimate is 2,925 total XP per defeat before the 75/25 split.',
    facts: [{ label: 'Reported level', value: '95' }, { label: 'Reported health', value: '1,500' }, { label: 'Location', value: 'West Mine Ashen Cavern' }, { label: 'Style', value: 'Heavy melee' }, { label: 'Reported drops', value: 'Coins · Gold Dust · Coal Ore · Charred Ring Piece 1' }],
    sections: [
      { title: 'Combat profile', bullets: ['Uses heavy melee attacks with a charred large sword.', 'Use Heavy protection and keep enough room to reposition.', 'Full-health XP estimate: 2,925 total XP before the combat split.'] },
      { title: 'Known drops', paragraphs: ['The current guide lists Coins, Gold Dust, Coal Ore, and Charred Ring Piece 1. Drop rates are not provided.'] },
    ],
    related: ['combat', 'the-burning-king', 'ashen-archer'],
  }),
  communityEntry('Cavern Goblin', {
    slug: 'cavern-goblin', title: 'Cavern Goblin', type: 'Creature', categories: ['Creatures', 'Caverns', 'Combat', 'Community documented'],
    summary: 'A level-37 goblin found in the West Mine Deep Cavern.',
    intro: 'Cavern Goblins are pale, deep-cavern enemies that use quick attacks and can be found around the West Mine Deep Cavern.',
    facts: [{ label: 'Reported level', value: '37' }, { label: 'Reported health', value: '400' }, { label: 'Reported total XP', value: '548' }, { label: 'Location', value: 'West Mine Deep Cavern' }, { label: 'Style', value: 'Quick ranged' }, { label: 'Reported drops', value: 'Bone Ring · Small Fang · Spider Eye · Coins' }],
    sections: [
      { title: 'Combat profile', bullets: ['Uses quick attacks from the deep cavern.', 'A defeat awards 548 total XP before the combat split.', 'Watch the surrounding cavern hazards while moving between targets.'] },
      { title: 'Known drops', paragraphs: ['The current guide lists Bone Ring, Small Fang, Spider Eye, and Coins. Drop rates are not provided.'] },
    ],
    related: ['combat', 'cavern-mine', 'cavern-goblin-hunter'],
  }),
  communityEntry('Goblin Watcher', {
    slug: 'goblin-watcher', title: 'Goblin Watcher', type: 'Creature', categories: ['Creatures', 'Bosses', 'Community documented'],
    summary: 'A low-level ranged boss reported in Goblin Cave.',
    intro: 'The community page documents a ranged boss whose three-arrow Rapid Fire attack can reportedly be sidestepped.',
    facts: [{ label: 'Reported level', value: '9' }, { label: 'Reported health', value: '250' }, { label: 'Style', value: 'Ranged' }, { label: 'Reported drops', value: 'Goblin Bow · Small Fang · Coins' }],
    sections: [{ title: 'Encounter', paragraphs: ['Rapid Fire launches a three-arrow sequence. Move sideways as the attack begins to avoid the barrage.'] }],
    related: ['combat', 'goblin-chieftain'],
  }),
  communityEntry('Goblin Chieftain', {
    slug: 'goblin-chieftain', title: 'Goblin Chieftain', type: 'Creature', categories: ['Creatures', 'Bosses', 'Community documented'],
    summary: 'A level-40 community-documented boss with mixed hammer and fire mechanics.',
    intro: 'The current community page reports hammer attacks, a rotating fire beam, fireball areas, and a quick projectile cone.',
    facts: [{ label: 'Reported level', value: '40' }, { label: 'Reported health', value: '1,000' }, { label: 'Reported total XP', value: '1,400' }, { label: 'Reported drops', value: 'Dwarven Hammer · Steel/Iron Bars · Small Fang · Coins' }],
    sections: [{ title: 'Mechanics', bullets: ['Heavy and mystical hammer attacks', 'Rotating fire beam', 'Fireball areas of effect', 'Quick projectile cone'] }],
    related: ['combat', 'goblin-watcher', 'goblin-general'],
  }),
  communityEntry('Goblin General', {
    slug: 'goblin-general', title: 'Goblin General', type: 'Creature', categories: ['Creatures', 'Bosses', 'Quests', 'Community documented'],
    summary: 'The level-55 boss reported at the end of Open The Gates.',
    intro: 'The Goblin General is the final encounter of Open The Gates and uses blade, stomp, fireball, and whirlwind attacks.',
    facts: [{ label: 'Reported level', value: '55' }, { label: 'Reported health', value: '1,500' }, { label: 'Quest', value: 'Open The Gates' }, { label: 'Guaranteed reward reported', value: '3,000 Coins' }],
    sections: [{ title: 'Mechanics', bullets: ['Blade attacks', 'Knockback stomp', 'Fireballs', 'Whirlwind'] }, { title: 'Quest role', paragraphs: ['Defeating the boss is reported to complete the final combat step of Open The Gates.'] }],
    related: ['open-the-gates', 'valen-city', 'combat'],
  }),
  communityEntry('Skeleton Pioneer', {
    slug: 'skeleton-pioneer', title: 'Skeleton Pioneer', type: 'Creature', categories: ['Creatures', 'Bosses', 'Community documented'],
    summary: 'A high-level skeleton boss that swaps weapons and shield styles.',
    intro: 'The community page reports a weapon-and-shield swap encounter with stomp, charge, and falling-stalactite mechanics.',
    facts: [{ label: 'Reported level', value: '90' }, { label: 'Reported health', value: '2,500' }, { label: 'Reported XP', value: '4,750' }, { label: 'Reported drops', value: 'Skeleton Rapier · Small Worm Bait · Coins' }],
    sections: [{ title: 'Mechanics', bullets: ['Switches between mace and sword', 'Switches between Parry and Wooden shields', 'Uses stomp and charge attacks', 'Triggers falling stalactites'] }],
    related: ['combat', 'combat-mechanics'],
  }),
  communityEntry('Skeleton Knight (Darklands)', {
    slug: 'skeleton-knight-darklands', title: 'Skeleton Knight (Darklands)', type: 'Creature', categories: ['Creatures', 'Darklands', 'Community documented'],
    summary: 'An armoured level-67 skeleton reported in the Darklands caves.',
    intro: 'The current community page describes a slow, heavy-damage skeleton wielding a large black sword. All numeric values remain community-reported until checked in the live build.',
    facts: [{ label: 'Reported level', value: '67' }, { label: 'Reported health', value: '1,000' }, { label: 'Reported XP', value: '1,670' }, { label: 'Reported attack', value: '125 heavy · 3 attack speed' }],
    sections: [
      { title: 'Combat profile', bullets: ['75 Slash Accuracy reported', '35 Slash, 100 Pierce, 50 Fire, 150 Ice, and 25 Lightning resistance reported', 'No Block or Deflect Power reported'] },
      { title: 'Reported drops', paragraphs: ['The page lists health and shield potions, a Titanium Ring, Gold Dust, a Gold Bar, worm bait, and coins. Drop rates are not provided.'] },
    ],
    related: ['the-darklands', 'combat', 'combat-mechanics'],
  }),
  communityEntry('Cavern Goblin Hunter', {
    slug: 'cavern-goblin-hunter', title: 'Cavern Goblin Hunter', type: 'Creature', categories: ['Creatures', 'Bosses', 'Caverns', 'Community documented'],
    summary: 'A level-107 ranged boss documented in the cavern enemy set.',
    intro: 'The community page describes a high-level encounter built around randomized arrow barrages, platform movement, and falling stalactites.',
    facts: [{ label: 'Reported level', value: '107' }, { label: 'Reported health', value: '3,000' }, { label: 'Reported XP', value: '6,105' }, { label: 'Reported drops', value: 'Bone Mask · Bone Bow · Small Fang · Spider Eye · Coins' }],
    sections: [{ title: 'Mechanics', bullets: ['Three-arrow randomized barrage', 'Leaps between platforms', 'Falling-stalactite hazard'] }],
    related: ['combat', 'cavern-mine'],
  }),
  communityEntry('The Burning King', {
    slug: 'the-burning-king', title: 'The Burning King', type: 'Creature', categories: ['Creatures', 'Bosses', 'Lava Cavern', 'Community documented'],
    summary: 'A Lava Cavern boss that drops Volcanic materials and a unique sword.',
    intro: 'The Burning King is a boss in Lava Cavern. Its known rewards include Volcanic materials and the Sword of the Burning King.',
    facts: [{ label: 'Reported level', value: '307' }, { label: 'Reported health', value: '10,000' }, { label: 'Reported total XP', value: '30,260' }, { label: 'Drops', value: 'Volcanic Shard · Volcanic Core · Sword of the Burning King' }],
    sections: [{ title: 'Known rewards', bullets: ['Volcanic Shard', 'Volcanic Core', 'Sword of the Burning King'] }, { title: 'Fight preparation', paragraphs: ['A complete attack rotation and resistance profile are still being added. Prepare for a high-level boss encounter before entering Lava Cavern.'] }],
    related: ['lava-cavern', 'combat'],
  }),
];

const itemEntries: WikiEntry[] = [
  communityEntry('Ore Sack', {
    slug: 'ore-sack', title: 'Ore Sack', type: 'Item', categories: ['Items', 'Mining', 'Containers', 'Community documented'],
    summary: 'A Mining container that automatically stores up to 50 gathered items.',
    intro: 'Equip an Ore Sack to store mined resources separately from the main inventory, then empty it through a bank.',
    facts: [{ label: 'Reported capacity', value: '50 items' }, { label: 'Reported Mining requirement', value: '15' }, { label: 'Reported shop price', value: '350 coins' }, { label: 'Reported sale value', value: '175 coins' }],
    sections: [{ title: 'How to use it', steps: ['Reach level 15 Mining and equip the Ore Sack.', 'Mine normally; gathered resources are stored automatically while space remains.', 'Open a bank and use the resource-deposit action to empty it.'] }, { title: 'Container tiers', paragraphs: ['The 50-item Ore Sack is an early container. Larger resource containers can hold considerably more, so check the capacity shown on the item you have equipped.'] }],
    related: ['mining', 'inventory', 'banking'], note: 'Do not equate this reported 50-item container with the separately observed 500-capacity equipped resource container.',
  }),
  communityEntry('Fish Crate', {
    slug: 'fish-crate', title: 'Fish Crate', type: 'Item', categories: ['Items', 'Fishing', 'Containers', 'Community documented'],
    summary: 'A Fishing container that automatically stores up to 50 catches.',
    intro: 'Equip a Fish Crate to store catches separately from the main inventory, then empty it through a bank.',
    facts: [{ label: 'Reported capacity', value: '50 items' }, { label: 'Reported Fishing requirement', value: '15' }, { label: 'Reported shop price', value: '350 coins' }, { label: 'Reported sale value', value: '175 coins' }],
    sections: [{ title: 'How to use it', steps: ['Reach level 15 Fishing and equip the Fish Crate.', 'Fish normally; catches are stored automatically while space remains.', 'Open a bank and use the resource-deposit action to empty it.'] }, { title: 'Capacity', paragraphs: ['This crate holds 50 items. Check the capacity shown on other fishing-container tiers before planning a long trip.'] }],
    related: ['fishing', 'inventory', 'banking'],
  }),
];

const potionFamilySources = [
  ['Small Weak Health Potion', 'Weak Health'],
  ['Small Health Potion', 'Health'],
  ['Small Strong Health Potion', 'Strong Health'],
  ['Small Shields Potion', 'Shields'],
  ['Small Strong Shields Potion', 'Strong Shields'],
  ['Small Fishing Potion', 'Fishing'],
  ['Small Mining Potion', 'Mining'],
  ['Small Attack Potion', 'Attack'],
  ['Small Archery Potion', 'Archery'],
  ['Small Magic Potion', 'Magic'],
] as const;

const potionReferences = potionFamilySources.map(([title, family]) => sourceFor(title, [`${family} family`], 'supplements'));

const potionFamilies: WikiEntry = {
  slug: 'potion-families', title: 'Potion families', type: 'Guide', verification: 'community',
  summary: 'Brewing batches, effects, and bottling tiers for ten potion families.',
  intro: 'This guide brings the ten main potion families into one brewing table, including ingredients, level requirements, experience, and vial effects.',
  aliases: ['potion recipes', 'alchemy potions'], categories: ['Guides', 'Potion Making', 'Community documented'],
  facts: [
    { label: 'Families documented', value: '10', sourceRef: potionReferences[0].id },
    { label: 'Reported bottling time', value: '0.8 seconds', sourceRef: potionReferences[0].id },
    { label: 'Reported bottling XP', value: '10 / 20 / 30', sourceRef: potionReferences[0].id },
    { label: 'Gilded access', value: 'Members-only reported', sourceRef: potionReferences[0].id },
  ],
  sections: [
    { title: 'Brewing table', table: { headers: ['Family', 'Brew', 'Small / large / gilded effect'], rows: [
      ['Weak Health', 'Level 1 · 10 Scrap Fish Flesh + 25 Essence · 20s · 500 XP', 'Restore 30 / 60 / 90'],
      ['Health', 'Level 20 · 10 Fish Mash + 50 Essence · 30s · 1,500 XP', 'Restore 50 / 100 / 150'],
      ['Strong Health', 'Level 40 · 10 Hearty Extract + 200 Essence · 40s · 3,250 XP', 'Restore 80 / 160 / 240'],
      ['Shields', 'Level 10 · 10 Crushed Fish Scales + 50 Essence · 25s · 1,500 XP', '60 / 120 / 180 seconds'],
      ['Strong Shields', 'Level 50 · 10 Fine Fish Scales + 500 Essence · 50s · 6,000 XP reported', '180 / 360 / 540 seconds'],
      ['Fishing', 'Level 5 · 10 Fish Oil + 25 Essence · 20s · 500 XP', '+5 levels for 300 / 600 / 900 seconds'],
      ['Mining', 'Level 15 · 10 Root Paste + 50 Essence · 25s · 1,500 XP', '+5 levels for 300 / 600 / 900 seconds'],
      ['Attack', 'Level 25 · 10 Fang Dust + 200 Essence · 30s · 1,500 XP', '+5 levels for 300 / 600 / 900 seconds'],
      ['Archery', 'Level 30 · 10 Distilled Spider Eye + 250 Essence · 30s · 1,750 XP', '+5 levels for 300 / 600 / 900 seconds'],
      ['Magic', 'Level 35 · 10 Crushed Mushroom + 300 Essence · 30s · 2,000 XP', '+5 levels for 300 / 600 / 900 seconds'],
    ] } },
    { title: 'Bottling tiers', paragraphs: ['Bottling takes about 0.8 seconds and awards 10, 20, or 30 experience for small, large, and gilded vials. Gilded variants require membership.'] },
    { title: 'Recipe notes', bullets: ['Strong Shields is currently listed as awarding 6,000 brewing experience.', 'Some older gilded descriptions say Large Vial where the recipe itself says Gilded Vial; use a Gilded Vial for the gilded recipe.', 'Potion values can change with balance updates.'] },
  ],
  related: ['potion-making', 'recipe-cauldron-weak-health', 'recipe-cauldron-strong-shields', 'recipe-cauldron-magic'],
  source: { label: 'Attributed community recipe set', detail: 'Paraphrased from current potion-family pages and retained as community documentation pending direct verification.', observed: 'August 2026' },
  externalSources: potionReferences,
};

const glandSources = [
  sourceFor('Small Essence Gland', ['Small gland yield']),
  sourceFor('Essence Gland', ['Regular gland yield']),
  sourceFor('Large Essence Gland', ['Large gland yield']),
];

const essenceGlandProcessing: WikiEntry = {
  slug: 'essence-gland-processing', title: 'Essence gland processing', type: 'Guide', verification: 'community',
  summary: 'Reduction levels, experience, and Essence yields for three gland sizes.',
  intro: 'Reduce Small, regular, and Large Essence Glands at the Reduction Station to turn them into stackable Essence.',
  categories: ['Guides', 'Potion Making', 'Community documented'],
  facts: [{ label: 'Sizes', value: 'Small · regular · large', sourceRef: glandSources[0].id }, { label: 'Station family', value: 'Reduction', sourceRef: glandSources[0].id }, { label: 'Verification', value: 'Community quantities; engine recipe identities', sourceRef: glandSources[0].id }],
  sections: [
    { title: 'Reduction table', table: { headers: ['Input', 'Level', 'Output', 'XP'], rows: [['Small Essence Gland', '1', '2 Essence', '4'], ['Essence Gland', '30', '10 Essence', '10'], ['Large Essence Gland', '60', '20 Essence', '16']] } },
    { title: 'How to process glands', steps: ['Bring the glands to a Reduction Station.', 'Choose the matching Small, regular, or Large Essence Gland recipe.', 'Keep enough inventory space for the resulting Essence stack.'] },
  ],
  related: ['essence', 'potion-making', 'recipe-reduce-small-essence-gland', 'recipe-reduce-essence-gland', 'recipe-reduce-large-essence-gland'],
  source: { label: 'Engine identities plus attributed community quantities', detail: 'The bridge confirms recipe presence; the linked community revisions supply the unverified numeric claims.', observed: 'August 2026' },
  externalSources: glandSources,
};

export const communityEntries: WikiEntry[] = [
  ...skillEntries,
  ...guideEntries,
  ...locationEntries,
  ...creatureEntries,
  ...itemEntries,
  potionFamilies,
  essenceGlandProcessing,
];
