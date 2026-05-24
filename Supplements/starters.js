// Inline starter supplements.
// Loaded by index.html as a regular <script> so file:// users can still
// "Download starter file" without hitting CORS/fetch restrictions.
//
// To extend or amend a starter: edit the corresponding constant here. The
// matching .json file in this folder is a human-readable reference copy
// (kept in sync by hand — feel free to delete it if you prefer).
//
// Exposed as window.SUPPLEMENT_STARTERS.{subclasses,races}.

(function () {
  const SUBCLASSES_STARTER = {
    "$schema": "supplement-v1",
    "version": 1,
    "name": "PHB Subclasses Starter",
    "description": "Starter subclass list — names + levels only. Fill in `desc` from your own PHB (or use the in-app editor's paste-and-parse).",
    "subclasses": [
      { "classSlug": "barbarian", "slug": "path-of-the-totem-warrior", "name": "Path of the Totem Warrior", "sourceLabel": "PHB", "features": [
        { "level": 3,  "name": "Spirit Seeker",         "desc": "[Fill in from PHB]" },
        { "level": 3,  "name": "Totem Spirit",          "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Aspect of the Beast",   "desc": "[Fill in from PHB]" },
        { "level": 10, "name": "Spirit Walker",         "desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Totemic Attunement",    "desc": "[Fill in from PHB]" }
      ] },

      { "classSlug": "bard", "slug": "college-of-valor", "name": "College of Valor", "sourceLabel": "PHB", "features": [
        { "level": 3,  "name": "Bonus Proficiencies",   "desc": "[Fill in from PHB]" },
        { "level": 3,  "name": "Combat Inspiration",    "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Extra Attack",          "desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Battle Magic",          "desc": "[Fill in from PHB]" }
      ] },

      { "classSlug": "cleric", "slug": "knowledge-domain", "name": "Knowledge Domain", "sourceLabel": "PHB", "features": [
        { "level": 1,  "name": "Blessings of Knowledge", "desc": "At 1st level, you learn two languages of your choice. You also become proficient in your choice of two of the following skills: Arcana, History, Nature, or Religion. Your proficiency bonus is doubled for any ability check you make that uses either of those skills." },
        { "level": 1,  "name": "Knowledge Domain Spells", "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Channel Divinity: Knowledge of the Ages", "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Channel Divinity: Read Thoughts", "desc": "[Fill in from PHB]" },
        { "level": 8,  "name": "Potent Spellcasting",   "desc": "[Fill in from PHB]" },
        { "level": 17, "name": "Visions of the Past",   "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "cleric", "slug": "light-domain", "name": "Light Domain", "sourceLabel": "PHB", "features": [
        { "level": 1,  "name": "Bonus Cantrip",         "desc": "[Fill in from PHB]" },
        { "level": 1,  "name": "Warding Flare",         "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Channel Divinity: Radiance of the Dawn", "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Improved Flare",        "desc": "[Fill in from PHB]" },
        { "level": 8,  "name": "Potent Spellcasting",   "desc": "[Fill in from PHB]" },
        { "level": 17, "name": "Corona of Light",       "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "cleric", "slug": "nature-domain", "name": "Nature Domain", "sourceLabel": "PHB", "features": [
        { "level": 1,  "name": "Acolyte of Nature",    "desc": "[Fill in from PHB]" },
        { "level": 1,  "name": "Bonus Proficiency",    "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Channel Divinity: Charm Animals and Plants", "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Dampen Elements",      "desc": "[Fill in from PHB]" },
        { "level": 8,  "name": "Divine Strike",        "desc": "[Fill in from PHB]" },
        { "level": 17, "name": "Master of Nature",     "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "cleric", "slug": "tempest-domain", "name": "Tempest Domain", "sourceLabel": "PHB", "features": [
        { "level": 1,  "name": "Bonus Proficiencies",        "desc": "[Fill in from PHB]" },
        { "level": 1,  "name": "Wrath of the Storm",         "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Channel Divinity: Destructive Wrath", "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Thunderbolt Strike",         "desc": "[Fill in from PHB]" },
        { "level": 8,  "name": "Divine Strike",              "desc": "[Fill in from PHB]" },
        { "level": 17, "name": "Stormborn",                  "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "cleric", "slug": "trickery-domain", "name": "Trickery Domain", "sourceLabel": "PHB", "features": [
        { "level": 1,  "name": "Blessing of the Trickster", "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Channel Divinity: Invoke Duplicity", "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Channel Divinity: Cloak of Shadows", "desc": "[Fill in from PHB]" },
        { "level": 8,  "name": "Divine Strike",            "desc": "[Fill in from PHB]" },
        { "level": 17, "name": "Improved Duplicity",       "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "cleric", "slug": "war-domain", "name": "War Domain", "sourceLabel": "PHB", "features": [
        { "level": 1,  "name": "Bonus Proficiencies", "desc": "[Fill in from PHB]" },
        { "level": 1,  "name": "War Priest",          "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Channel Divinity: Guided Strike", "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Channel Divinity: War God's Blessing", "desc": "[Fill in from PHB]" },
        { "level": 8,  "name": "Divine Strike",       "desc": "[Fill in from PHB]" },
        { "level": 17, "name": "Avatar of Battle",    "desc": "[Fill in from PHB]" }
      ] },

      { "classSlug": "druid", "slug": "circle-of-the-moon", "name": "Circle of the Moon", "sourceLabel": "PHB", "features": [
        { "level": 2,  "name": "Combat Wild Shape",   "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Circle Forms",        "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Primal Strike",       "desc": "[Fill in from PHB]" },
        { "level": 10, "name": "Elemental Wild Shape","desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Thousand Forms",      "desc": "[Fill in from PHB]" }
      ] },

      { "classSlug": "fighter", "slug": "battle-master", "name": "Battle Master", "sourceLabel": "PHB",
        "features": [
          { "level": 3,  "name": "Combat Superiority",   "desc": "[Fill in from PHB]" },
          { "level": 3,  "name": "Student of War",       "desc": "[Fill in from PHB]" },
          { "level": 7,  "name": "Know Your Enemy",      "desc": "[Fill in from PHB]" },
          { "level": 10, "name": "Improved Combat Superiority", "desc": "[Fill in from PHB]" },
          { "level": 15, "name": "Relentless",           "desc": "[Fill in from PHB]" }
        ],
        "pools": [
          { "name": "Superiority Dice", "max": 4, "resetOn": "short", "appliesAtLevel": 3 }
        ]
      },
      { "classSlug": "fighter", "slug": "eldritch-knight", "name": "Eldritch Knight", "sourceLabel": "PHB", "features": [
        { "level": 3,  "name": "Spellcasting",     "desc": "[Fill in from PHB]" },
        { "level": 3,  "name": "Weapon Bond",      "desc": "[Fill in from PHB]" },
        { "level": 7,  "name": "War Magic",        "desc": "[Fill in from PHB]" },
        { "level": 10, "name": "Eldritch Strike",  "desc": "[Fill in from PHB]" },
        { "level": 15, "name": "Arcane Charge",    "desc": "[Fill in from PHB]" },
        { "level": 18, "name": "Improved War Magic","desc": "[Fill in from PHB]" }
      ] },

      { "classSlug": "monk", "slug": "way-of-shadow", "name": "Way of Shadow", "sourceLabel": "PHB", "features": [
        { "level": 3,  "name": "Shadow Arts",      "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Shadow Step",      "desc": "[Fill in from PHB]" },
        { "level": 11, "name": "Cloak of Shadows", "desc": "[Fill in from PHB]" },
        { "level": 17, "name": "Opportunist",      "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "monk", "slug": "way-of-the-four-elements", "name": "Way of the Four Elements", "sourceLabel": "PHB", "features": [
        { "level": 3,  "name": "Disciple of the Elements",  "desc": "[Fill in from PHB]" },
        { "level": 3,  "name": "Elemental Attunement",      "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Additional Disciplines",    "desc": "[Fill in from PHB]" }
      ] },

      { "classSlug": "paladin", "slug": "oath-of-the-ancients", "name": "Oath of the Ancients", "sourceLabel": "PHB", "features": [
        { "level": 3,  "name": "Channel Divinity: Nature's Wrath",      "desc": "[Fill in from PHB]" },
        { "level": 3,  "name": "Channel Divinity: Turn the Faithless",  "desc": "[Fill in from PHB]" },
        { "level": 7,  "name": "Aura of Warding",       "desc": "[Fill in from PHB]" },
        { "level": 15, "name": "Undying Sentinel",      "desc": "[Fill in from PHB]" },
        { "level": 20, "name": "Elder Champion",        "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "paladin", "slug": "oath-of-vengeance", "name": "Oath of Vengeance", "sourceLabel": "PHB", "features": [
        { "level": 3,  "name": "Channel Divinity: Abjure Enemy",   "desc": "[Fill in from PHB]" },
        { "level": 3,  "name": "Channel Divinity: Vow of Enmity",  "desc": "[Fill in from PHB]" },
        { "level": 7,  "name": "Relentless Avenger",     "desc": "[Fill in from PHB]" },
        { "level": 15, "name": "Soul of Vengeance",      "desc": "[Fill in from PHB]" },
        { "level": 20, "name": "Avenging Angel",         "desc": "[Fill in from PHB]" }
      ] },

      { "classSlug": "ranger", "slug": "beast-master", "name": "Beast Master", "sourceLabel": "PHB", "features": [
        { "level": 3,  "name": "Ranger's Companion",    "desc": "[Fill in from PHB]" },
        { "level": 7,  "name": "Exceptional Training",  "desc": "[Fill in from PHB]" },
        { "level": 11, "name": "Bestial Fury",          "desc": "[Fill in from PHB]" },
        { "level": 15, "name": "Share Spells",          "desc": "[Fill in from PHB]" }
      ] },

      { "classSlug": "rogue", "slug": "assassin", "name": "Assassin", "sourceLabel": "PHB", "features": [
        { "level": 3,  "name": "Bonus Proficiencies", "desc": "You gain proficiency with the disguise kit and the poisoner's kit." },
        { "level": 3,  "name": "Assassinate",         "desc": "[Fill in from PHB]" },
        { "level": 9,  "name": "Infiltration Expertise","desc": "[Fill in from PHB]" },
        { "level": 13, "name": "Impostor",            "desc": "[Fill in from PHB]" },
        { "level": 17, "name": "Death Strike",        "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "rogue", "slug": "arcane-trickster", "name": "Arcane Trickster", "sourceLabel": "PHB", "features": [
        { "level": 3,  "name": "Spellcasting",         "desc": "[Fill in from PHB]" },
        { "level": 3,  "name": "Mage Hand Legerdemain","desc": "[Fill in from PHB]" },
        { "level": 9,  "name": "Magical Ambush",       "desc": "[Fill in from PHB]" },
        { "level": 13, "name": "Versatile Trickster",  "desc": "[Fill in from PHB]" },
        { "level": 17, "name": "Spell Thief",          "desc": "[Fill in from PHB]" }
      ] },

      { "classSlug": "sorcerer", "slug": "wild-magic", "name": "Wild Magic", "sourceLabel": "PHB", "features": [
        { "level": 1,  "name": "Wild Magic Surge",       "desc": "[Fill in from PHB]" },
        { "level": 1,  "name": "Tides of Chaos",         "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Bend Luck",              "desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Controlled Chaos",       "desc": "[Fill in from PHB]" },
        { "level": 18, "name": "Spell Bombardment",      "desc": "[Fill in from PHB]" }
      ] },

      { "classSlug": "warlock", "slug": "the-archfey", "name": "The Archfey", "sourceLabel": "PHB", "features": [
        { "level": 1,  "name": "Expanded Spell List",    "desc": "[Fill in from PHB]" },
        { "level": 1,  "name": "Fey Presence",           "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Misty Escape",           "desc": "[Fill in from PHB]" },
        { "level": 10, "name": "Beguiling Defenses",     "desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Dark Delirium",          "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "warlock", "slug": "the-great-old-one", "name": "The Great Old One", "sourceLabel": "PHB", "features": [
        { "level": 1,  "name": "Expanded Spell List",    "desc": "[Fill in from PHB]" },
        { "level": 1,  "name": "Awakened Mind",          "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Entropic Ward",          "desc": "[Fill in from PHB]" },
        { "level": 10, "name": "Thought Shield",         "desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Create Thrall",          "desc": "[Fill in from PHB]" }
      ] },

      { "classSlug": "wizard", "slug": "school-of-abjuration", "name": "School of Abjuration", "sourceLabel": "PHB", "features": [
        { "level": 2,  "name": "Abjuration Savant",    "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Arcane Ward",          "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Projected Ward",       "desc": "[Fill in from PHB]" },
        { "level": 10, "name": "Improved Abjuration",  "desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Spell Resistance",     "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "wizard", "slug": "school-of-conjuration", "name": "School of Conjuration", "sourceLabel": "PHB", "features": [
        { "level": 2,  "name": "Conjuration Savant",   "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Minor Conjuration",    "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Benign Transposition", "desc": "[Fill in from PHB]" },
        { "level": 10, "name": "Focused Conjuration",  "desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Durable Summons",      "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "wizard", "slug": "school-of-divination", "name": "School of Divination", "sourceLabel": "PHB", "features": [
        { "level": 2,  "name": "Divination Savant",    "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Portent",              "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Expert Divination",    "desc": "[Fill in from PHB]" },
        { "level": 10, "name": "The Third Eye",        "desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Greater Portent",      "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "wizard", "slug": "school-of-enchantment", "name": "School of Enchantment", "sourceLabel": "PHB", "features": [
        { "level": 2,  "name": "Enchantment Savant",   "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Hypnotic Gaze",        "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Instinctive Charm",    "desc": "[Fill in from PHB]" },
        { "level": 10, "name": "Split Enchantment",    "desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Alter Memories",       "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "wizard", "slug": "school-of-illusion", "name": "School of Illusion", "sourceLabel": "PHB", "features": [
        { "level": 2,  "name": "Illusion Savant",      "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Improved Minor Illusion","desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Malleable Illusions",  "desc": "[Fill in from PHB]" },
        { "level": 10, "name": "Illusory Self",        "desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Illusory Reality",     "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "wizard", "slug": "school-of-necromancy", "name": "School of Necromancy", "sourceLabel": "PHB", "features": [
        { "level": 2,  "name": "Necromancy Savant",    "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Grim Harvest",         "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Undead Thralls",       "desc": "[Fill in from PHB]" },
        { "level": 10, "name": "Inured to Undeath",    "desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Command Undead",       "desc": "[Fill in from PHB]" }
      ] },
      { "classSlug": "wizard", "slug": "school-of-transmutation", "name": "School of Transmutation", "sourceLabel": "PHB", "features": [
        { "level": 2,  "name": "Transmutation Savant", "desc": "[Fill in from PHB]" },
        { "level": 2,  "name": "Minor Alchemy",        "desc": "[Fill in from PHB]" },
        { "level": 6,  "name": "Transmuter's Stone",   "desc": "[Fill in from PHB]" },
        { "level": 10, "name": "Shapechanger",         "desc": "[Fill in from PHB]" },
        { "level": 14, "name": "Master Transmuter",    "desc": "[Fill in from PHB]" }
      ] }
    ]
  };

  // -----------------------------------------------------------------
  // RACES STARTER
  // -----------------------------------------------------------------
  // Two kinds of entries:
  //   - Subraces  (parentSlug set)   — merged into the parent race's `subraces` list.
  //                                    The base race must exist in the SRD (Elf, Dwarf, etc.).
  //   - Standalone races (no parent) — pushed as a new race entry.
  //
  // Fields:
  //   slug:          unique within the race namespace
  //   name:          display name
  //   parentSlug:    optional; if set → subrace of that race
  //   sourceLabel:   short tag (e.g. "PHB", "Homebrew")
  //   asi:           array of { attribute, value } or shorthand { wis: 1 } / { dex: 2 }
  //   speed:         walking speed (overrides parent for subraces; e.g. Wood Elf = 35)
  //   size:          "Small" / "Medium" (mostly relevant for standalone races)
  //   languages:     comma-separated text
  //   darkvision:    optional, in feet
  //   traits:        [{ name, desc }] — feature entries
  //   skillGrants:   optional explicit skill keys (e.g. ["perception"])
  const RACES_STARTER = {
    "$schema": "race-supplement-v1",
    "version": 1,
    "name": "PHB Races Starter",
    "description": "Starter race/subrace list — names + structural data + placeholders. Fill in `desc` from your own PHB or use the in-app editor's paste-and-parse.",
    "races": [
      // ---- Elf subraces (Elf is in the SRD as High Elf — adds Wood, Drow) ----
      { "slug": "wood-elf", "name": "Wood Elf", "parentSlug": "elf", "sourceLabel": "PHB",
        "asi": { "wis": 1 }, "speed": 35,
        "traits": [
          { "name": "Elf Weapon Training", "desc": "You have proficiency with the longsword, shortsword, shortbow, and longbow." },
          { "name": "Fleet of Foot",       "desc": "Your base walking speed increases to 35 feet." },
          { "name": "Mask of the Wild",    "desc": "You can attempt to hide even when you are only lightly obscured by foliage, heavy rain, falling snow, mist, and other natural phenomena." }
        ]
      },
      { "slug": "dark-elf", "name": "Dark Elf (Drow)", "parentSlug": "elf", "sourceLabel": "PHB",
        "asi": { "cha": 1 }, "darkvision": 120,
        "traits": [
          { "name": "Superior Darkvision", "desc": "Your darkvision has a radius of 120 feet." },
          { "name": "Sunlight Sensitivity","desc": "You have disadvantage on attack rolls and on Wisdom (Perception) checks that rely on sight when you, the target of your attack, or whatever you are trying to perceive is in direct sunlight." },
          { "name": "Drow Magic",          "desc": "You know the dancing lights cantrip. When you reach 3rd level, you can cast the faerie fire spell once with this trait and regain the ability to do so when you finish a long rest. When you reach 5th level, you can also cast the darkness spell once with this trait and regain the ability to do so when you finish a long rest. Charisma is your spellcasting ability for these spells." },
          { "name": "Drow Weapon Training","desc": "You have proficiency with rapiers, shortswords, and hand crossbows." }
        ]
      },

      // ---- Dwarf subrace (Hill Dwarf is in SRD — adds Mountain) ----
      { "slug": "mountain-dwarf", "name": "Mountain Dwarf", "parentSlug": "dwarf", "sourceLabel": "PHB",
        "asi": { "str": 2 },
        "traits": [
          { "name": "Dwarven Armor Training", "desc": "You have proficiency with light and medium armor." }
        ]
      },

      // ---- Halfling subrace (Lightfoot in SRD — adds Stout) ----
      { "slug": "stout-halfling", "name": "Stout Halfling", "parentSlug": "halfling", "sourceLabel": "PHB",
        "asi": { "con": 1 },
        "traits": [
          { "name": "Stout Resilience", "desc": "You have advantage on saving throws against poison, and you have resistance against poison damage." }
        ]
      },

      // ---- Gnome subrace (Rock Gnome in SRD — adds Forest) ----
      { "slug": "forest-gnome", "name": "Forest Gnome", "parentSlug": "gnome", "sourceLabel": "PHB",
        "asi": { "dex": 1 },
        "traits": [
          { "name": "Natural Illusionist", "desc": "You know the minor illusion cantrip. Intelligence is your spellcasting ability for it." },
          { "name": "Speak with Small Beasts", "desc": "Through sounds and gestures, you can communicate simple ideas with Small or smaller beasts." }
        ]
      }
    ]
  };

  window.SUPPLEMENT_STARTERS = {
    subclasses: SUBCLASSES_STARTER,
    races:      RACES_STARTER,
  };
})();
