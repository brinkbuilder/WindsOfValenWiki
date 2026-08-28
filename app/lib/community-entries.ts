import type { ExternalSource, WikiEntry, WikiFact, WikiSection } from './wiki-data';
import { communityPermalink, communityWikiPages, communityWikiSnapshot } from './community-wiki';

type CommunityEntrySpec = {
  slug: string;
  title: string;
  type: WikiEntry['type'];
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
    intro: 'Community documentation distinguishes three elemental weapon behaviours. Their exact values should be treated as reported mechanics, not engine-confirmed data.',
    facts: [{ label: 'Fire', value: 'Decaying burn; reported total 15% of initial hit' }, { label: 'Ice', value: 'Movement slow' }, { label: 'Lightning', value: 'Static Charges; reported 50% bonus hit at maximum' }],
    sections: [
      { title: 'Elemental effects', bullets: ['Fire is reported to apply a diminishing damage-over-time effect.', 'Ice is reported to slow movement, with stronger tiers applying stronger slows.', 'Lightning is reported to build Static Charges and trigger an extra hit at maximum charges.'] },
      { title: 'Verification needed', paragraphs: ['The archive still needs weapon-specific observations, proc thresholds, duration measurements, and resistance interactions before publishing these values as verified.'] },
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
    ], related: ['mining', 'bank-to-furnace-route'], relation: 'conflicts', note: 'This revision predates the August 2026 smithing rework and may contain obsolete formulas.',
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
    summary: 'Community-documented shortcuts and chat commands that still need in-game verification.',
    intro: 'The community controls page lists useful shortcuts and chat commands. They are presented as a testing checklist because bindings and cooldowns can change.',
    facts: [{ label: 'Quest log', value: 'J' }, { label: 'Change stance', value: 'V' }, { label: 'Split stack', value: 'Ctrl + middle-mouse drag' }, { label: 'Command help', value: '/commands' }],
    sections: [
      { title: 'Reported shortcuts', bullets: ['J opens the quest log.', 'V changes combat stance.', 'Ctrl plus middle-mouse drag splits a stack.', 'Ctrl plus Drop is reported to discard matching items together.'] },
      { title: 'Reported commands', bullets: ['/commands lists available commands.', '/unstuck is reported to have a 30-minute cooldown.', '/block and /unblock manage player blocking.', '/kd displays a kill/death statistic.'] },
      { title: 'Safety note', paragraphs: ['Test commands deliberately and confirm their current effect before relying on them. The archive does not execute any of these commands.'] },
    ], related: ['combat', 'inventory', 'valenbridge'],
  }),
  communityEntry('Open The Gates', {
    slug: 'open-the-gates', title: 'Open The Gates', type: 'Quest', categories: ['Quests', 'Guides', 'Community documented'],
    summary: 'A novice members quest that unlocks Valen City.',
    intro: 'The community walkthrough describes a mining-gated quest involving three scouts, Goblin Villagers, rubble clearing, and the Goblin General.',
    facts: [{ label: 'Membership', value: 'Required' }, { label: 'Mining', value: 'Level 15 reported' }, { label: 'Boss', value: 'Goblin General, level 55 reported' }, { label: 'Reward', value: 'Valen City access · Guard Cloak · 5,000 Mining XP' }],
    sections: [
      { title: 'Requirements', bullets: ['Membership access', 'Mining level 15', 'A pickaxe'] },
      { title: 'Community walkthrough', bullets: ['Locate scouts Harry, Thomas, and Walter.', 'Obtain a Guard Helmet from level-15 Goblin Villagers.', 'Clear the blocking rubble.', 'Defeat the Goblin General to complete the gate sequence.'] },
      { title: 'Reported rewards', paragraphs: ['The page lists access to Valen City, a Guard Cloak, and 5,000 Mining experience.'] },
    ], related: ['valen-city', 'goblin-general', 'mining'],
  }),
  communityEntry('Crystal Caverns Miniquest (Bank unlock)', {
    slug: 'crystal-caverns-bank-unlock', title: 'Crystal Caverns bank unlock', type: 'Quest', categories: ['Quests', 'Guides', 'Banking', 'Community documented'],
    summary: 'A miniquest that reportedly unlocks permanent Crystal Caverns bank access.',
    intro: 'The community guide says a rare Resonant Essence Geode can be exchanged with Clara Vance for permanent access to the cavern bank.',
    facts: [{ label: 'Required item', value: 'Resonant Essence Geode' }, { label: 'Source', value: 'Essence Rocks, rare community-reported drop' }, { label: 'Reward', value: 'Permanent bank access' }, { label: 'Extra geodes', value: '1,000 coins reported' }],
    sections: [
      { title: 'Walkthrough', bullets: ['Mine Essence Rocks until a Resonant Essence Geode is obtained.', 'Bring the geode to Clara Vance.', 'Complete the exchange to unlock the bank permanently.'] },
      { title: 'Drop-rate caution', paragraphs: ['One community anecdote reports 323 rocks before a geode. That is a single observation, not a published drop rate.'] },
    ], related: ['crystal-cavern', 'essence-rock', 'banking'],
  }),
];

const locationEntries: WikiEntry[] = [
  communityEntry('Valen City', {
    slug: 'valen-city', title: 'Valen City', type: 'Location', categories: ['Locations', 'Regions', 'Community documented'],
    summary: 'A members-only city unlocked through Open The Gates.',
    intro: 'Community documentation identifies Valen City as a members area gated behind the Open The Gates quest.',
    facts: [{ label: 'Membership', value: 'Required' }, { label: 'Unlock', value: 'Open The Gates' }, { label: 'Status', value: 'Community documented' }],
    sections: [{ title: 'Access', paragraphs: ['Complete Open The Gates to gain access according to the community page. Shops and services are indexed separately in the source directory.'] }],
    related: ['open-the-gates'],
  }),
  communityEntry('The Darklands', {
    slug: 'the-darklands', title: 'The Darklands', type: 'Location', categories: ['Locations', 'Regions', 'PvP', 'Community documented'],
    summary: 'A full-loot player-versus-player region.',
    intro: 'The community page describes The Darklands as a full-loot PvP zone. Players should verify current loss rules before entering with valuable equipment.',
    facts: [{ label: 'Combat rule', value: 'Full-loot PvP reported' }, { label: 'Risk', value: 'Equipment and inventory loss possible' }, { label: 'Verification', value: 'Community documented' }],
    sections: [{ title: 'Risk notice', paragraphs: ['Treat the region as high risk until the current death and item-loss rules are confirmed in-game. The archive does not yet have a bridge export for its PvP boundary.'] }],
    related: ['combat', 'skeleton-knight-darklands'],
  }),
  communityEntry('Lava Cavern', {
    slug: 'lava-cavern', title: 'Lava Cavern', type: 'Location', categories: ['Locations', 'Caverns', 'Combat', 'Community documented'],
    summary: 'A high-level cavern documented with level-60 enemies and a boss.',
    intro: 'Community documentation describes the Lava Cavern as a combat area containing level-60 enemies and a boss encounter.',
    facts: [{ label: 'Reported enemy level', value: '60' }, { label: 'Boss', value: 'Present' }, { label: 'Verification', value: 'Community documented' }],
    sections: [{ title: 'Preparation', paragraphs: ['Enemy composition, resistances, route hazards, and safe-banking paths still need direct observation. Enter prepared for a high-level combat area.'] }],
    related: ['combat', 'the-burning-king', 'volcano-mages-route'],
  }),
  communityEntry('Crystal Cavern', {
    slug: 'crystal-cavern', title: 'Crystal Cavern', type: 'Location', categories: ['Locations', 'Caverns', 'Mining', 'Community documented'],
    summary: 'A cavern with community-reported level-50 mining resources.',
    intro: 'The community page associates Crystal Cavern with level-50 mining resources and a bank unlock miniquest.',
    facts: [{ label: 'Reported mining tier', value: 'Level 50' }, { label: 'Bank', value: 'Miniquest unlock reported' }, { label: 'Verification', value: 'Community documented' }],
    sections: [{ title: 'Known leads', paragraphs: ['Essence Rocks and the Resonant Essence Geode miniquest are the strongest documented leads. Exact node classes, requirements, and routes await bridge verification.'] }],
    related: ['crystal-caverns-bank-unlock', 'essence-rock', 'banking'],
  }),
];

const creatureEntries: WikiEntry[] = [
  communityEntry('Goblin Watcher', {
    slug: 'goblin-watcher', title: 'Goblin Watcher', type: 'Creature', categories: ['Creatures', 'Bosses', 'Community documented'],
    summary: 'A low-level ranged boss reported in Goblin Cave.',
    intro: 'The community page documents a ranged boss whose three-arrow Rapid Fire attack can reportedly be sidestepped.',
    facts: [{ label: 'Reported level', value: '9' }, { label: 'Reported health', value: '250' }, { label: 'Style', value: 'Ranged' }, { label: 'Reported drops', value: 'Goblin Bow · Small Fang · Coins' }],
    sections: [{ title: 'Encounter', paragraphs: ['Rapid Fire is described as a three-arrow sequence. Movement to the side is the community-recommended response.'] }],
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
    intro: 'Community pages describe the Goblin General as the final encounter of Open The Gates, with blade, stomp, fireball, and whirlwind mechanics.',
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
    related: ['combat', 'combat-mechanics', 'skeleton-warriors-return-route'],
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
    related: ['combat', 'cavern-mine', 'cavern-goblins-return-route'],
  }),
  communityEntry('The Burning King', {
    slug: 'the-burning-king', title: 'The Burning King', type: 'Creature', categories: ['Creatures', 'Bosses', 'Lava Cavern', 'Community documented'],
    summary: 'A boss whose current community page safely supports only its listed drops.',
    intro: 'Recent rich revisions for several monsters were reverted after an accidental overwrite. This entry therefore preserves only the current Burning King page’s drop list.',
    facts: [{ label: 'Reported drops', value: 'Volcanic Shard · Volcanic Core · Sword of the Burning King' }, { label: 'Mechanics', value: 'Not imported' }, { label: 'Verification', value: 'Current community revision only' }],
    sections: [{ title: 'Revision caution', paragraphs: ['Older or reverted stat blocks are intentionally excluded. The current page supports the listed drops but not a full boss-stat profile.'] }],
    related: ['lava-cavern', 'combat', 'volcano-mages-route'],
  }),
];

const itemEntries: WikiEntry[] = [
  communityEntry('Ore Sack', {
    slug: 'ore-sack', title: 'Ore Sack', type: 'Item', categories: ['Items', 'Mining', 'Containers', 'Community documented'],
    summary: 'A community-documented ore container with a reported 50-item capacity.',
    intro: 'The community page describes a mining container that automatically stores resources and is emptied through a bank.',
    facts: [{ label: 'Reported capacity', value: '50 items' }, { label: 'Reported Mining requirement', value: '15' }, { label: 'Reported shop price', value: '350 coins' }, { label: 'Reported sale value', value: '175 coins' }],
    sections: [{ title: 'Container behaviour', paragraphs: ['The source implies automatic resource storage and bank-only removal. This may describe a different tier from the 500-capacity resource container observed through the bridge.'] }],
    related: ['mining', 'inventory', 'banking'], note: 'Do not equate this reported 50-item container with the separately observed 500-capacity equipped resource container.',
  }),
  communityEntry('Fish Crate', {
    slug: 'fish-crate', title: 'Fish Crate', type: 'Item', categories: ['Items', 'Fishing', 'Containers', 'Community documented'],
    summary: 'A community-documented fish container with a reported 50-item capacity.',
    intro: 'The community page describes a fishing container that automatically stores catches and is emptied through a bank.',
    facts: [{ label: 'Reported capacity', value: '50 items' }, { label: 'Reported Fishing requirement', value: '15' }, { label: 'Reported shop price', value: '350 coins' }, { label: 'Reported sale value', value: '175 coins' }],
    sections: [{ title: 'Container behaviour', paragraphs: ['The reported automatic storage and bank-only removal should be checked against the current game build and specific container tier.'] }],
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
  summary: 'Community-reported brewing batches, effects, and bottling tiers for ten potion families.',
  intro: 'The community wiki documents ten current potion families. These formulas are useful research leads, but they remain separate from the bridge-confirmed recipe identities.',
  aliases: ['potion recipes', 'alchemy potions'], categories: ['Guides', 'Potion Making', 'Community documented'],
  facts: [
    { label: 'Families documented', value: '10', sourceRef: potionReferences[0].id },
    { label: 'Reported bottling time', value: '0.8 seconds', sourceRef: potionReferences[0].id },
    { label: 'Reported bottling XP', value: '10 / 20 / 30', sourceRef: potionReferences[0].id },
    { label: 'Gilded access', value: 'Members-only reported', sourceRef: potionReferences[0].id },
  ],
  sections: [
    { title: 'Community brewing table', table: { headers: ['Family', 'Reported brew', 'Reported small / large / gilded effect'], rows: [
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
    { title: 'Bottling tiers', paragraphs: ['The current community pages consistently report 0.8-second bottling and 10, 20, and 30 experience for small, large, and gilded vials. Gilded variants are reported as members-only.'] },
    { title: 'Known conflicts', bullets: ['Strong Shields brew experience is inconsistent across older pages; 6,000 is shown as a community consensus, not a verified value.', 'Some gilded descriptions say Large Vial while the recipe field says Gilded Vial; the description appears to be a typo.', 'Every quantity and effect still needs bridge or player-workflow confirmation.'] },
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
  summary: 'Community-reported reduction levels, experience, and Essence yields for three gland sizes.',
  intro: 'ValenBridge confirms that gland-reduction recipes exist. The quantities below come from attributed community pages and are not yet confirmed by measured inventory deltas.',
  categories: ['Guides', 'Potion Making', 'Community documented'],
  facts: [{ label: 'Sizes', value: 'Small · regular · large', sourceRef: glandSources[0].id }, { label: 'Station family', value: 'Reduction', sourceRef: glandSources[0].id }, { label: 'Verification', value: 'Community quantities; engine recipe identities', sourceRef: glandSources[0].id }],
  sections: [
    { title: 'Community reduction table', table: { headers: ['Input', 'Reported level', 'Reported output', 'Reported XP'], rows: [['Small Essence Gland', '1', '2 Essence', '4'], ['Essence Gland', '30', '10 Essence', '10'], ['Large Essence Gland', '60', '20 Essence', '16']] } },
    { title: 'Evidence boundary', paragraphs: ['Recipe identities for the three gland sizes were found in the engine catalogue. Levels, yields, timing, and experience remain community-reported until a controlled batch confirms them.'] },
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
