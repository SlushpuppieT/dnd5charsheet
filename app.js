// ====================================================================
// D&D 5e Character Sheet — local-first, SRD-aware, homebrew-friendly
// ====================================================================

const ABILITIES = [
  { key: 'str', name: 'Strength' },
  { key: 'dex', name: 'Dexterity' },
  { key: 'con', name: 'Constitution' },
  { key: 'int', name: 'Intelligence' },
  { key: 'wis', name: 'Wisdom' },
  { key: 'cha', name: 'Charisma' },
];

const SKILLS = [
  { key: 'acrobatics',      name: 'Acrobatics',       ability: 'dex' },
  { key: 'animalHandling',  name: 'Animal Handling',  ability: 'wis' },
  { key: 'arcana',          name: 'Arcana',           ability: 'int' },
  { key: 'athletics',       name: 'Athletics',        ability: 'str' },
  { key: 'deception',       name: 'Deception',        ability: 'cha' },
  { key: 'history',         name: 'History',          ability: 'int' },
  { key: 'insight',         name: 'Insight',          ability: 'wis' },
  { key: 'intimidation',    name: 'Intimidation',     ability: 'cha' },
  { key: 'investigation',   name: 'Investigation',    ability: 'int' },
  { key: 'medicine',        name: 'Medicine',         ability: 'wis' },
  { key: 'nature',          name: 'Nature',           ability: 'int' },
  { key: 'perception',      name: 'Perception',       ability: 'wis' },
  { key: 'performance',     name: 'Performance',      ability: 'cha' },
  { key: 'persuasion',      name: 'Persuasion',       ability: 'cha' },
  { key: 'religion',        name: 'Religion',         ability: 'int' },
  { key: 'sleightOfHand',   name: 'Sleight of Hand',  ability: 'dex' },
  { key: 'stealth',         name: 'Stealth',          ability: 'dex' },
  { key: 'survival',        name: 'Survival',         ability: 'wis' },
];

// ====================================================================
// State
// ====================================================================
function blankCharacter() {
  return {
    name: '',
    class: '',
    classSlug: '',
    subclass: '',
    subclassSlug: '',
    level: 1,
    race: '',
    raceSlug: '',
    background: '',
    backgroundSlug: '',
    alignment: '',
    experience: 0,
    inspiration: false,

    abilities: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    racialBonuses: {},       // { str: 1, dex: 1, ... } from race ASI
    asiChoices: [],          // [{ level:4, str:2 }, { level:8, dex:1, con:1 }]
    saves: {},               // { str: true, ... } — proficient saves
    skills: {},              // { acrobatics: { prof:false, exp:false, misc:0 } }
    expertiseOrder: [],      // skill keys in the order expertise was selected — used to flag *excess* picks correctly
    customSkills: [],        // [{ key, name, ability, source }] — extra skills beyond the standard 18 (e.g. A5E Culture)

    ac: 10,
    acOverride: 0,           // user's manual delta from the computed (armor + magic items + Dex) AC
    armorSlot: null,         // { kind: 'armor'|'magic-armor', slug, source, name, raw } | null
    armorEnhancement: 0,     // +N magic enhancement on the equipped armor (0–10, e.g. "Leather +1")
    shieldSlot: null,        // { kind: 'shield', slug, source, name, raw } | null  — flat AC bonus
    magicArmor1: null,       // { slug, source, name, acBonus, raw } | null  — flat-bonus AC item
    magicArmor2: null,       // same shape as magicArmor1
    speed: 30,
    baseSpeed: 0,            // race-granted walking speed; 0 = no race applied. Used to flag non-standard speed values.
    initiativeBonus: 0,      // user's manual delta from the computed (dexMod + auto-feat) initiative
    hpMax: 10,
    hpMaxOverride: 0,        // user delta on top of auto-calc max HP (parallels acOverride)
    hpCurrent: 10,
    hpTemp: 0,
    hitDiceTotal: '',
    hitDiceCurrent: '',
    hitDie: 'd8',
    autoHP: true,
    deathSuccesses: [false, false, false],
    deathFailures:  [false, false, false],

    attacks: [],             // [{ name, bonus, damage, notes }]

    spellAbility: '',
    cantripsKnown: 0,        // auto-populated for known classes, editable for custom
    cantripsBonus: 0,        // always editable
    spellsKnown: 0,          // auto-populated; means "Known" for Bard/Sorc/etc and "Prepared" for Cleric/Druid/etc
    spellsBonus: 0,          // always editable
    spellsArePrepared: false,// manual toggle used ONLY when class is Custom (recognized classes look up their style)
    spellSlots: {},          // { 1: { total, used }, ... }
    spells: [],              // [{ level, name, prepared, alwaysPrepared, notes }]

    skillSources: {},        // { acrobatics: 'class'|'subclass'|'subclass-pick'|'subclass-free'|'background'|'bg-pick'|'bg-free'|'race'|'race-pick'|'race-free' }
    classSkillCount: 0,      // how many class skill picks are allowed
    classSkillOptions: 'any',// 'any' or array of skill names
    bgSkillCount: 0,         // how many background CHOICE skill picks are allowed
    bgSkillOptions: 'any',   // 'any' or array of skill names
    bgFixedCount: 0,         // how many background skills are auto-granted (fixed, not chosen)
    subclassSkillCount: 0,   // how many subclass skill picks are allowed (the choice count)
    subclassSkillOptions: 'any',
    subclassSkillPicked: false, // whether the pick modal has been shown for current subclass
    subclassFixedSkills: [], // auto-granted subclass skill keys (e.g. ['stealth'])

    feats: [],              // [{ name, slug, source, custom, desc, prerequisite, asiChoice:{}, fixedAsi:{}, asiChoiceOptions:[], asiChoices:[], speedBonus:0, initiativeBonus:0 }]
    raceFeatSlot: false,    // Variant Human (or similar) grants one free feat
    raceSkillCount: 0,      // race-granted skill picks (modal-chosen)
    raceSkillOptions: 'any',
    raceFixedSkills: [],    // race-granted skill keys auto-applied from trait text
    autoBlocks: {           // text blocks added by class/race/background, for surgical cleanup
      class:      { features: [], proficiencies: [], equipment: [] },
      race:       { features: [], proficiencies: [], equipment: [] },
      background: { features: [], proficiencies: [], equipment: [] },
    },
    // Cached copies of the selected SRD data so the sheet still functions
    // when the user is offline or open5e is unreachable.
    cachedClass:      null,
    cachedRace:       null,
    cachedBackground: null,
    resourcePools: [],      // [{ key, name, max, used, classKey, resetOn, custom, unlimited }]

    traits: '', ideals: '', bonds: '', flaws: '',
    features: '',
    proficiencies: '',
    equipment: '',
    cp: 0, sp: 0, ep: 0, gp: 0, pp: 0,
    notes: '',
  };
}

let character = blankCharacter();

// ====================================================================
// Math
// ====================================================================
function abilityMod(score) {
  return Math.floor((Number(score) - 10) / 2);
}
function fmtMod(n) {
  return (n >= 0 ? '+' : '') + n;
}
function proficiencyBonus(level) {
  return 2 + Math.floor((Math.max(1, Math.min(20, Number(level))) - 1) / 4);
}

function totalAbility(key) {
  const base   = Number(character.abilities[key]) || 0;
  const racial = Number((character.racialBonuses || {})[key]) || 0;
  const asi    = (character.asiChoices || []).reduce((s, c) => s + (Number(c[key]) || 0), 0);
  const featAsi = (character.feats || []).reduce((s, f) => s + (Number((f.asiChoice || {})[key]) || 0), 0);
  return base + racial + asi + featAsi;
}
function findAbilityKey(name) {
  const m = { strength:'str', dexterity:'dex', constitution:'con',
               intelligence:'int', wisdom:'wis', charisma:'cha' };
  return m[String(name).toLowerCase().trim()] || null;
}

// PHB fixed/average values per level after 1st: ceil((max+1)/2)
const HD_MAX = { d6: 6, d8: 8, d10: 10, d12: 12 };
const HD_AVG = { d6: 4, d8: 5, d10: 6, d12: 7 };

function computeAutoMaxHP() {
  const die = HD_MAX[character.hitDie] ? character.hitDie : 'd8';
  const max = HD_MAX[die];
  const avg = HD_AVG[die];
  const lvl = Math.max(1, Math.min(20, Number(character.level) || 1));
  const con = abilityMod(totalAbility('con'));
  return Math.max(1, max + (lvl - 1) * avg + lvl * con);
}

function recalcHPIfAuto() {
  if (!character.autoHP) return;
  const newMax = computeAutoMaxHP() + (Number(character.hpMaxOverride) || 0);
  const wasFull = character.hpCurrent >= character.hpMax;
  character.hpMax = newMax;
  // If they were at full HP, keep them at full when max changes.
  // Otherwise just clamp current to the new max.
  if (wasFull) character.hpCurrent = newMax;
  else if (character.hpCurrent > newMax) character.hpCurrent = newMax;
}

// When a class is set, hit dice scale with level. User can still edit afterwards.
function recalcHitDiceForLevel() {
  if (!character.classSlug || !character.hitDie) return;
  const lvl = Math.max(1, Math.min(20, Number(character.level) || 1));
  const newTotal = `${lvl}${character.hitDie}`;
  // Bump "current" by the same delta if user hasn't fully overridden the format.
  const prevTotalMatch = String(character.hitDiceTotal).match(/^(\d+)d(\d+)/);
  const curMatch = String(character.hitDiceCurrent).match(/^(\d+)d(\d+)/);
  if (prevTotalMatch && curMatch && prevTotalMatch[2] === curMatch[2]) {
    const delta = lvl - Number(prevTotalMatch[1]);
    const newCur = Math.max(0, Number(curMatch[1]) + delta);
    character.hitDiceCurrent = `${newCur}d${curMatch[2]}`;
  } else {
    character.hitDiceCurrent = newTotal;
  }
  character.hitDiceTotal = newTotal;
}

// ====================================================================
// Rendering
// ====================================================================
function $(sel, root = document) { return root.querySelector(sel); }
function $$(sel, root = document) { return Array.from(root.querySelectorAll(sel)); }

function renderAbilities() {
  const grid = $('.ability-grid');
  grid.innerHTML = '';
  ABILITIES.forEach(a => {
    const base    = Number(character.abilities[a.key]) || 0;
    const racial  = Number((character.racialBonuses || {})[a.key]) || 0;
    const asi     = (character.asiChoices || []).reduce((s, c) => s + (Number(c[a.key]) || 0), 0);
    const featAsi = (character.feats || []).reduce((s, f) => s + (Number((f.asiChoice || {})[a.key]) || 0), 0);
    const total   = base + racial + asi + featAsi;
    const mod     = abilityMod(total);
    const hasBonus = racial !== 0 || asi !== 0 || featAsi !== 0;

    const asiLevels = (character.asiChoices || [])
      .filter(c => Number(c[a.key]) !== 0)
      .map(c => Number(c.level))
      .filter(n => n > 0)
      .sort((x, y) => x - y);
    const asiTitle = asiLevels.length === 0
      ? 'Level-up Improvement'
      : asiLevels.length === 1
        ? `Level ${asiLevels[0]} Improvement`
        : asiLevels.length === 2
          ? `Level ${asiLevels[0]} & ${asiLevels[1]} Improvements`
          : `Level ${asiLevels.slice(0, -1).join(', ')} & ${asiLevels[asiLevels.length - 1]} Improvements`;

    const raceCanRePick = getRaceChooseBonuses().length > 0;
    const tags = [];
    if (racial  !== 0) {
      const raceTitle = raceCanRePick ? 'Racial bonus — click to re-pick' : 'Racial bonus';
      const raceCls   = raceCanRePick ? 'ab-tag ab-race ab-tag-clickable' : 'ab-tag ab-race';
      tags.push(`<span class="${raceCls}" data-ab-tag="race" data-ab-key="${a.key}" title="${raceTitle}">${racial > 0 ? '+' : ''}${racial}R</span>`);
    }
    if (asi     !== 0) tags.push(`<span class="ab-tag ab-asi"  title="${asiTitle}">${asi > 0 ? '+' : ''}${asi}L</span>`);
    if (featAsi !== 0) tags.push(`<span class="ab-tag ab-feat" title="Feat bonus">${featAsi > 0 ? '+' : ''}${featAsi}F</span>`);
    const bonusHtml = tags.length ? `<div class="ab-bonus-row">${tags.join('')}</div>` : '';

    const titleParts = [`base ${base}`];
    if (racial  !== 0) titleParts.push(`${racial > 0 ? '+' : ''}${racial} racial`);
    if (asi     !== 0) titleParts.push(`${asi > 0 ? '+' : ''}${asi} level-up`);
    if (featAsi !== 0) titleParts.push(`${featAsi > 0 ? '+' : ''}${featAsi} feat`);
    const totalTitle = hasBonus ? `Final = ${titleParts.join(' ')}` : 'Final score';

    const cell = document.createElement('div');
    cell.className = 'ability' + (total > 20 ? ' ability--over-cap' : '');
    if (total > 20) cell.title = `${a.name} is ${total} — above the normal cap of 20`;
    cell.innerHTML = `
      <div class="name">${a.name}</div>
      <div class="mod">${fmtMod(mod)}</div>
      <div class="ab-total" title="${totalTitle}">${total}</div>
      <div class="ab-base-row" title="Base score">
        <button type="button" class="ab-step" data-ability="${a.key}" data-dir="-1" aria-label="Decrease">&minus;</button>
        <input type="number" min="1" max="30" value="${base}" data-ability="${a.key}">
        <button type="button" class="ab-step" data-ability="${a.key}" data-dir="1" aria-label="Increase">+</button>
      </div>
      ${bonusHtml}
    `;
    grid.appendChild(cell);
  });
  grid.querySelectorAll('input[data-ability]').forEach(inp => {
    inp.addEventListener('input', e => {
      const k = e.target.dataset.ability;
      character.abilities[k] = Number(e.target.value) || 0;
      if (k === 'con') recalcHPIfAuto();
      renderAll();
    });
  });
  grid.querySelectorAll('button.ab-step').forEach(btn => {
    btn.addEventListener('click', () => {
      const k = btn.dataset.ability;
      const dir = Number(btn.dataset.dir) || 0;
      const cur = Number(character.abilities[k]) || 0;
      character.abilities[k] = Math.max(1, Math.min(30, cur + dir));
      if (k === 'con') recalcHPIfAuto();
      renderAll();
      persist();
    });
  });
  // Click a clickable +NR tag to re-open the racial ASI modal
  grid.querySelectorAll('.ab-tag-clickable[data-ab-tag="race"]').forEach(tag => {
    tag.addEventListener('click', () => reopenRacialASIModal());
  });
}

function renderSaves() {
  const list = $('#save-list');
  list.innerHTML = '';
  const pb = proficiencyBonus(character.level);
  // Look up which saves the current class is proficient in (for deviation flag)
  let expectedSaves = null;
  if (character.classSlug) {
    const c = getClassData();
    if (c && c.prof_saving_throws) {
      expectedSaves = new Set(parseSavingThrows(c.prof_saving_throws));
    }
  }
  ABILITIES.forEach(a => {
    const prof = !!character.saves[a.key];
    const total = abilityMod(totalAbility(a.key)) + (prof ? pb : 0);
    const isExpected = expectedSaves ? expectedSaves.has(a.key) : null;
    const isDeviation = isExpected !== null && isExpected !== prof;
    const row = document.createElement('div');
    row.className = 'save-row' + (isDeviation ? ' hb-deviation' : '');
    if (isDeviation) row.title = isExpected ? 'Class normally has this save proficiency' : 'Class normally does not have this save proficiency';
    row.innerHTML = `
      <input type="checkbox" data-save="${a.key}" ${prof ? 'checked' : ''}>
      <span class="ability-tag">${a.key.toUpperCase()}</span>
      <span class="mod">${fmtMod(total)}</span>
      <label>${a.name}</label>
    `;
    list.appendChild(row);
  });
  list.querySelectorAll('input[data-save]').forEach(inp => {
    inp.addEventListener('change', e => {
      character.saves[e.target.dataset.save] = e.target.checked;
      renderSaves();
    });
  });
}

function skillSrcLabel(src) {
  return { class: 'CLASS', subclass: 'SUB', 'subclass-pick': 'SUB', 'subclass-free': 'SUB',
           background: 'BG', 'bg-pick': 'BG', 'bg-free': 'BG',
           race: 'RACE', 'race-pick': 'RACE', 'race-free': 'RACE' }[src] || src.toUpperCase();
}
function skillSrcCssClass(src) {
  if (src === 'bg-pick'       || src === 'bg-free')       return 'background';
  if (src === 'subclass-pick' || src === 'subclass-free') return 'subclass';
  if (src === 'race-pick'     || src === 'race-free')     return 'race';
  return src;
}

function renderSkills() {
  const list = $('#skill-list');
  list.innerHTML = '';
  const pb = proficiencyBonus(character.level);
  const sources = character.skillSources || {};

  function makeCounter(label, used, total, cssClass) {
    if (total <= 0) return;
    const remaining = total - used;
    const isOver = remaining < 0;
    const el = document.createElement('div');
    el.className = `skill-picks-counter ${cssClass}${isOver ? ' hb-deviation' : ''}`;
    el.innerHTML = `<span>${label}: <strong>${used}/${total}</strong></span>`
      + (remaining > 0
          ? `<span class="picks-remaining">${remaining} remaining</span>`
          : isOver
            ? `<span class="picks-over">${Math.abs(remaining)} over</span>`
            : `<span class="picks-done">&#10003; all used</span>`);
    list.appendChild(el);
  }
  const vals = Object.values(sources);
  const classCount         = character.classSkillCount || 0;
  const classUsed          = vals.filter(s => s === 'class').length;
  const bgChoiceCount      = character.bgSkillCount || 0;
  const bgFixedCount       = character.bgFixedCount  || 0;
  const bgTotalCount       = bgFixedCount + bgChoiceCount;
  const bgAutoUsed         = vals.filter(s => s === 'background').length;
  const bgChoiceUsed       = vals.filter(s => s === 'bg-pick').length;
  // Free picks are earned when a fixed grant is blocked by another fixed source.
  const bgFreePicksEarned  = Math.max(0, bgFixedCount - bgAutoUsed);
  const bgFreePicksUsed    = vals.filter(s => s === 'bg-free').length;
  const bgFreeRemaining    = Math.max(0, bgFreePicksEarned - bgFreePicksUsed);
  const bgTotalUsed        = bgAutoUsed + bgChoiceUsed + bgFreePicksUsed;

  const subFixedSkills     = character.subclassFixedSkills || [];
  const subFixedTotal      = subFixedSkills.length;
  const subAutoUsed        = vals.filter(s => s === 'subclass').length;
  const subFreePicksEarned = Math.max(0, subFixedTotal - subAutoUsed);
  const subFreePicksUsed   = vals.filter(s => s === 'subclass-free').length;
  const subFreeRemaining   = Math.max(0, subFreePicksEarned - subFreePicksUsed);
  const subFixedHave       = subFixedSkills.filter(k => character.skills[k] && character.skills[k].prof).length;
  const subChoiceCount     = character.subclassSkillCount || 0;
  const subChoiceUsed      = vals.filter(s => s === 'subclass-pick').length;
  const subTotalCount      = subFixedTotal + subChoiceCount;
  const subTotalUsed       = subAutoUsed + subChoiceUsed + subFreePicksUsed;
  const subMissingFixed    = subFixedSkills.filter(k => !(character.skills[k] && character.skills[k].prof));

  const raceFixedSkills    = character.raceFixedSkills || [];
  const raceFixedTotal     = raceFixedSkills.length;
  const raceAutoUsed       = vals.filter(s => s === 'race').length;
  const raceFreePicksEarned = Math.max(0, raceFixedTotal - raceAutoUsed);
  const raceFreePicksUsed  = vals.filter(s => s === 'race-free').length;
  const raceFreeRemaining  = Math.max(0, raceFreePicksEarned - raceFreePicksUsed);
  const raceFixedHave      = raceFixedSkills.filter(k => character.skills[k] && character.skills[k].prof).length;
  const raceChoiceCount    = character.raceSkillCount || 0;
  const raceChoiceUsed     = vals.filter(s => s === 'race-pick').length;
  const raceTotalCount     = raceFixedTotal + raceChoiceCount;
  const raceTotalUsed      = raceAutoUsed + raceChoiceUsed + raceFreePicksUsed;
  const raceMissingFixed   = raceFixedSkills.filter(k => !(character.skills[k] && character.skills[k].prof));

  const expAvail = expertiseSlots();
  const expUsed  = allSkills().filter(s => character.skills[s.key]?.exp).length;
  const expRemaining = Math.max(0, expAvail - expUsed);
  makeCounter('Class picks',       classUsed,   classCount,    'counter-class');
  if (bgTotalCount > 0)    makeCounter('Background skills', bgTotalUsed,  bgTotalCount,  'counter-bg');
  if (subTotalCount > 0)   makeCounter('Subclass picks',    subTotalUsed, subTotalCount, 'counter-sub');
  if (raceTotalCount > 0)  makeCounter('Race skills',       raceTotalUsed, raceTotalCount, 'counter-race');
  if (expAvail > 0)        makeCounter('Expertise (×2)',    expUsed,      expAvail,       'counter-exp');

  // Pre-compute eligibility and hint sources for skill tags
  const classRemaining  = classCount - classUsed;
  const bgRemaining     = bgChoiceCount - bgChoiceUsed;
  const subRemaining    = subTotalCount - subTotalUsed;
  const raceRemaining   = raceTotalCount - raceTotalUsed;

  // Which source type to embed in hints: regular pick when slots remain,
  // free pick (from a displaced fixed grant) when only those remain.
  const bgHintSrc       = bgRemaining > 0 ? 'bg-pick' : 'bg-free';
  const subChoiceRem    = subChoiceCount - subChoiceUsed;
  const subHintSrc      = (subMissingFixed.length > 0 || subChoiceRem > 0) ? 'subclass-pick' : 'subclass-free';
  const raceChoiceRem   = raceChoiceCount - raceChoiceUsed;
  const raceHintSrc     = (raceMissingFixed.length > 0 || raceChoiceRem > 0) ? 'race-pick' : 'race-free';

  function isClassEligible(key) {
    if (classRemaining <= 0) return false;
    const opts = character.classSkillOptions;
    return opts === 'any' || (Array.isArray(opts) && opts.some(n => findSkill(n)?.key === key));
  }
  function isBgEligible(key) {
    // Regular choice slots (e.g. "pick any 2") — respects the options list
    if (bgRemaining > 0) {
      const bgOpts = character.bgSkillOptions;
      if (bgOpts === 'any' || (Array.isArray(bgOpts) && bgOpts.some(n => findSkill(n)?.key === key))) return true;
    }
    // Free pick earned when a fixed grant was blocked by another fixed source — any skill qualifies
    if (bgFreeRemaining > 0) return true;
    return false;
  }
  function isSubEligible(key) {
    // Missing fixed grants take priority — must fill those specific slots first
    if (subMissingFixed.length > 0) return subMissingFixed.includes(key);
    // Choice slots
    if (subChoiceRem > 0) {
      const opts = character.subclassSkillOptions;
      return opts === 'any' || (Array.isArray(opts) && opts.some(n => findSkill(n)?.key === key));
    }
    // Free pick from a displaced fixed grant — any skill qualifies
    if (subFreeRemaining > 0) return true;
    return false;
  }
  function isRaceEligible(key) {
    if (raceMissingFixed.length > 0) return raceMissingFixed.includes(key);
    if (raceChoiceRem > 0) {
      const opts = character.raceSkillOptions;
      return opts === 'any' || (Array.isArray(opts) && opts.some(n => findSkill(n)?.key === key));
    }
    if (raceFreeRemaining > 0) return true;
    return false;
  }

  const srcTitle = { class: 'class', subclass: 'subclass', 'subclass-pick': 'subclass (chosen)', 'subclass-free': 'subclass (free pick)',
                     background: 'background', 'bg-pick': 'background (chosen)', 'bg-free': 'background (free pick)',
                     race: 'race', 'race-pick': 'race (chosen)', 'race-free': 'race (free pick)' };

  // Treat a checked skill as "non-standard" when it doesn't trace back to any
  // class / race / bg / sub source — but only flag if a class/race/bg actually
  // exists to compare against (pure-custom sheets get no flagging).
  const standardSystemActive = !!(character.classSlug || character.raceSlug || character.backgroundSlug || character.subclassSlug);

  const skillList = allSkills();
  const customByKey = new Map((character.customSkills || []).map(c => [c.key, c]));

  // Build the set of skill keys that are within the allowed expertise slots,
  // honouring selection order (most recently picked is the "excess" one).
  // expertiseOrder tracks keys in the order the user checked them; any exp-ed
  // skills not yet in the array (old saves) are appended in alphabetical order.
  const _expOrder = character.expertiseOrder || [];
  const _expOrderSet = new Set(_expOrder.filter(k => character.skills[k]?.exp));
  const _expUnordered = skillList
    .filter(s => character.skills[s.key]?.exp && !_expOrderSet.has(s.key))
    .map(s => s.key);
  // ordered first (user's real selections), then any untracked legacy ones
  const _allExpOrdered = [..._expOrder.filter(k => character.skills[k]?.exp), ..._expUnordered];
  const allowedExpSkills = new Set(_allExpOrdered.slice(0, expAvail));
  skillList.forEach(s => {
    const st = character.skills[s.key] || { prof: false, exp: false, misc: 0 };
    const mod = abilityMod(totalAbility(s.ability))
              + (st.prof ? pb : 0)
              + (st.exp ? pb : 0)
              + (Number(st.misc) || 0);
    const src = sources[s.key];
    const customDef = customByKey.get(s.key);   // undefined for standard skills
    // Deviation = proficient with no recognized source, OR an auto-grant source
    // is set but the user has unchecked the prof box (a fixed grant missing).
    const isFixedAutoGrant = src === 'background' || src === 'subclass' || src === 'race';
    const isDeviation = standardSystemActive && (
      (st.prof && !src) || (isFixedAutoGrant && !st.prof)
    );
    // Expertise deviation: flag only expertise picks that fall outside the
    // allowed slots, determined by selection order (not alphabetical order).
    const isExpDeviation = st.exp && standardSystemActive && !allowedExpSkills.has(s.key);
    let tagHtml = '';
    if (src) {
      // Fixed auto-grants from background are non-clickable — the source is
      // permanent until the background itself is changed. Use the proficiency
      // checkbox to manually override if needed. (Subclass and race fixed grants
      // have their own restoration arrays so they stay click-removable.)
      if (src === 'background') {
        tagHtml = `<span class="skill-src-tag skill-src-${skillSrcCssClass(src)}" title="Auto-granted by ${srcTitle[src] || src} — use the checkbox to manually override">${skillSrcLabel(src)}</span>`;
      } else {
        // Choice picks (bg-pick, class, subclass-pick, race-pick) and other fixed
        // grants remain click-removable to free pick slots / for correction.
        tagHtml = `<span class="skill-src-tag skill-src-${skillSrcCssClass(src)} clickable" data-skill-tag="${s.key}" data-tag-source="${src}" data-tag-action="remove" title="Click to remove (${srcTitle[src] || src} grant)">${skillSrcLabel(src)}</span>`;
      }
      // For user-chosen picks (not fixed grants like 'background'/'subclass'/'race'),
      // also show re-assign hints for OTHER sources that still have open slots.
      // This fixes the case where all bgSkillOptions entries are already class/race
      // proficient — the hollow hint appears alongside the existing tag so the user
      // can swap the source in one click (e.g. class→BG frees the class slot).
      // Free picks (bg-free/race-free/subclass-free) are also user-chosen and re-assignable.
      const isUserPick = src === 'class' || src === 'bg-pick' || src === 'bg-free'
                      || src === 'subclass-pick' || src === 'subclass-free'
                      || src === 'race-pick'     || src === 'race-free';
      if (isUserPick) {
        const reHints = [];
        if (src !== 'class'
            && isClassEligible(s.key))
          reHints.push({ label: 'CLASS', css: 'class',      src: 'class',      title: 'Reassign as a class pick (frees current slot)' });
        if (src !== 'bg-pick' && src !== 'bg-free'
            && isBgEligible(s.key))
          reHints.push({ label: 'BG',    css: 'background', src: bgHintSrc,    title: bgHintSrc === 'bg-free' ? 'Reassign as a background free pick (frees current slot)' : 'Reassign as a background pick (frees current slot)' });
        if (src !== 'subclass-pick' && src !== 'subclass-free'
            && isSubEligible(s.key))
          reHints.push({ label: 'SUB',   css: 'subclass',   src: subHintSrc,   title: subHintSrc === 'subclass-free' ? 'Reassign as a subclass free pick (frees current slot)' : 'Reassign as a subclass pick (frees current slot)' });
        if (src !== 'race-pick' && src !== 'race-free'
            && isRaceEligible(s.key))
          reHints.push({ label: 'RACE',  css: 'race',       src: raceHintSrc,  title: raceHintSrc === 'race-free' ? 'Reassign as a race free pick (frees current slot)' : 'Reassign as a race pick (frees current slot)' });
        tagHtml += reHints.map(h =>
          `<span class="skill-src-tag skill-src-${h.css} skill-src-hint clickable" data-skill-tag="${s.key}" data-tag-source="${h.src}" data-tag-action="assign" title="${h.title}">${h.label}</span>`
        ).join('');
      }
    } else if (!st.prof) {
      const hints = [];
      if (isClassEligible(s.key)) hints.push({ label: 'CLASS', css: 'class',      src: 'class',      title: 'Click to take as a class pick' });
      if (isBgEligible(s.key))    hints.push({ label: 'BG',    css: 'background', src: bgHintSrc,    title: bgHintSrc === 'bg-free' ? 'Click to take as a background free pick' : 'Click to take as a background pick' });
      if (isSubEligible(s.key))   hints.push({ label: 'SUB',   css: 'subclass',   src: subHintSrc,   title: subHintSrc === 'subclass-free' ? 'Click to take as a subclass free pick' : 'Click to take as a subclass pick' });
      if (isRaceEligible(s.key))  hints.push({ label: 'RACE',  css: 'race',       src: raceHintSrc,  title: raceHintSrc === 'race-free' ? 'Click to take as a race free pick' : 'Click to take as a race pick' });
      tagHtml = hints.map(h =>
        `<span class="skill-src-tag skill-src-${h.css} skill-src-hint clickable" data-skill-tag="${s.key}" data-tag-source="${h.src}" data-tag-action="assign" title="${h.title}">${h.label}</span>`
      ).join('');
    }
    // Expertise hint — proficient skill without expertise, when class grants more
    if (expRemaining > 0 && st.prof && !st.exp) {
      tagHtml += `<span class="skill-src-tag skill-src-exp skill-src-hint clickable" data-skill-tag="${s.key}" data-tag-source="exp" data-tag-action="assign" title="Click to take as Expertise (×2)">×2</span>`;
    }
    // Custom skills no longer carry a permanent visual chip — the faint row
    // background + ability dropdown + × button already make their origin obvious.
    // The hollow [CLASS]/[BG]/[SUB]/[RACE] hint tags above still appear when the
    // skill is eligible to be claimed as a pick (since `bgSkillOptions` is what
    // drives eligibility, not the row's stored source).
    const expTitle = !st.prof
      ? 'Proficiency required for Expertise'
      : isExpDeviation
        ? 'Non-standard: expertise beyond class-granted slots'
        : 'Expertise (×2 proficiency)';
    const row = document.createElement('div');
    row.className = 'skill-row' + (isDeviation ? ' hb-deviation' : '') + (isExpDeviation ? ' exp-deviation' : '') + (customDef ? ' skill-row-custom' : '');
    if (isDeviation) {
      row.title = (st.prof && !src)
        ? 'Non-standard: proficient without a class/race/background source'
        : 'Non-standard: this source normally grants this skill';
    }
    // Custom skills get a small ability <select> so the user can re-tag the ability,
    // and an × remove button. Standard skills keep the read-only ability badge.
    const abilCell = customDef
      ? `<select class="ability-mini" data-custom-ability="${s.key}" title="Ability for this custom skill">
           ${ABILITIES.map(a => `<option value="${a.key}" ${a.key === s.ability ? 'selected' : ''}>${a.key.toUpperCase()}</option>`).join('')}
         </select>`
      : `<span class="ability-tag">${s.ability.toUpperCase()}</span>`;
    const removeBtn = customDef
      ? `<button class="icon-btn skill-remove" data-skill-remove="${s.key}" title="Remove this custom skill">&times;</button>`
      : '';
    row.innerHTML = `
      <input type="checkbox" title="Proficiency" data-skill="${s.key}" data-field="prof" ${st.prof ? 'checked' : ''}>
      <input type="checkbox" title="${expTitle}" data-skill="${s.key}" data-field="exp"  ${st.exp ? 'checked' : ''} ${!st.prof ? 'disabled' : ''}>
      <span class="mod">${fmtMod(mod)}</span>
      <label>${s.name}${tagHtml}</label>
      ${abilCell}
      ${removeBtn}
    `;
    list.appendChild(row);
  });
  list.querySelectorAll('input[data-skill]').forEach(inp => {
    inp.addEventListener('change', e => {
      const key = e.target.dataset.skill;
      const field = e.target.dataset.field;
      if (!character.skills[key]) character.skills[key] = { prof: false, exp: false, misc: 0 };
      character.skills[key][field] = e.target.checked;
      if (field === 'exp') {
        // Maintain selection-order array so flagging targets the newest pick, not
        // whichever comes last alphabetically.
        character.expertiseOrder = character.expertiseOrder || [];
        if (e.target.checked) {
          if (!character.expertiseOrder.includes(key)) character.expertiseOrder.push(key);
        } else {
          character.expertiseOrder = character.expertiseOrder.filter(k => k !== key);
        }
      } else if (field === 'prof') {
        if (e.target.checked) {
          if (!character.skillSources[key]) {
            const src = character.skillSources;
            const srcVals = () => Object.values(src);
            // Auto-tag as class pick if options available
            const classCnt = character.classSkillCount || 0;
            const classUsed = srcVals().filter(s => s === 'class').length;
            if (classCnt > 0 && classUsed < classCnt) {
              const opts = character.classSkillOptions;
              if (opts === 'any' || (Array.isArray(opts) && opts.some(n => findSkill(n)?.key === key))) {
                src[key] = 'class';
              }
            }
            // Auto-tag as subclass pick if options available
            if (!src[key]) {
              const subCnt = character.subclassSkillCount || 0;
              const subUsed = srcVals().filter(s => s === 'subclass-pick').length;
              if (subCnt > 0 && subUsed < subCnt) {
                const subOpts = character.subclassSkillOptions;
                if (subOpts === 'any' || (Array.isArray(subOpts) && subOpts.some(n => findSkill(n)?.key === key))) {
                  src[key] = 'subclass-pick';
                }
              }
            }
            // Auto-tag as background pick if bg options available
            if (!src[key]) {
              const bgCnt = character.bgSkillCount || 0;
              const bgUsed = srcVals().filter(s => s === 'bg-pick').length;
              if (bgCnt > 0 && bgUsed < bgCnt) {
                const bgOpts = character.bgSkillOptions;
                if (bgOpts === 'any' || (Array.isArray(bgOpts) && bgOpts.some(n => findSkill(n)?.key === key))) {
                  src[key] = 'bg-pick';
                }
              }
            }
            // Auto-tag as race pick if race options available
            if (!src[key]) {
              const raceCnt = character.raceSkillCount || 0;
              const raceUsed = srcVals().filter(s => s === 'race-pick').length;
              if (raceCnt > 0 && raceUsed < raceCnt) {
                const raceOpts = character.raceSkillOptions;
                if (raceOpts === 'any' || (Array.isArray(raceOpts) && raceOpts.some(n => findSkill(n)?.key === key))) {
                  src[key] = 'race-pick';
                }
              }
            }
          }
        } else {
          // Unchecking proficiency also clears expertise (can't have ×2 without prof)
          character.skills[key].exp = false;
          character.expertiseOrder = (character.expertiseOrder || []).filter(k => k !== key);
          // Unchecking a user-pick frees it (auto-grants remain)
          const s = character.skillSources[key];
          if (s === 'class' || s === 'bg-pick' || s === 'bg-free' || s === 'subclass-pick' || s === 'subclass-free' || s === 'race-pick' || s === 'race-free') delete character.skillSources[key];
        }
      }
      renderSkills();
      renderPassive();
      persist();
    });
  });

  // Click a skill tag to assign / remove that source explicitly
  list.querySelectorAll('.skill-src-tag.clickable').forEach(tag => {
    tag.addEventListener('click', e => {
      e.stopPropagation();
      const key    = tag.dataset.skillTag;
      const src    = tag.dataset.tagSource;
      const action = tag.dataset.tagAction;
      if (!key || !src || !action) return;
      if (!character.skills[key]) character.skills[key] = { prof: false, exp: false, misc: 0 };

      if (action === 'assign') {
        if (src === 'exp') {
          // Expertise pick — only if proficient
          if (!character.skills[key].prof) { toast('Need proficiency first'); return; }
          character.skills[key].exp = true;
          character.expertiseOrder = character.expertiseOrder || [];
          if (!character.expertiseOrder.includes(key)) character.expertiseOrder.push(key);
        } else {
          character.skillSources = character.skillSources || {};
          character.skillSources[key] = src;
          character.skills[key].prof = true;
        }
      } else if (action === 'remove') {
        if (src === 'exp') {
          character.skills[key].exp = false;
          character.expertiseOrder = (character.expertiseOrder || []).filter(k => k !== key);
        } else {
          // Free this source. Auto-grant sources (class-locked, fixed bg, fixed
          // sub, fixed race) also lose their prof, mirroring an explicit uncheck.
          delete (character.skillSources || {})[key];
          character.skills[key].prof = false;
          character.skills[key].exp  = false;
          character.expertiseOrder = (character.expertiseOrder || []).filter(k => k !== key);
        }
      }
      renderSkills();
      renderPassive();
      persist();
    });
  });

  // Custom skill: change ability via dropdown
  list.querySelectorAll('select[data-custom-ability]').forEach(sel => {
    sel.addEventListener('change', e => {
      const key = e.target.dataset.customAbility;
      const cs = (character.customSkills || []).find(c => c.key === key);
      if (!cs) return;
      cs.ability = e.target.value;
      renderSkills();
      renderPassive();
      persist();
    });
  });

  // Custom skill: remove
  list.querySelectorAll('button[data-skill-remove]').forEach(btn => {
    btn.addEventListener('click', e => {
      const key = e.currentTarget.dataset.skillRemove;
      const cs  = (character.customSkills || []).find(c => c.key === key);
      if (!cs) return;
      if (!confirm(`Remove the custom skill "${cs.name}"? Any proficiency, expertise, or source tag attached to it will be cleared.`)) return;
      character.customSkills = character.customSkills.filter(c => c.key !== key);
      delete character.skills[key];
      delete character.skillSources[key];
      renderAll();
      persist();
    });
  });

  // "+ Skill" button at the bottom — opens a tiny modal for name + ability
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn btn-sm skill-add-btn';
  addBtn.textContent = '+ Skill';
  addBtn.title = 'Add a custom skill not in the standard 18';
  addBtn.addEventListener('click', openAddCustomSkillModal);
  list.appendChild(addBtn);
}

function openAddCustomSkillModal() {
  const abilOpts = ABILITIES.map(a => `<option value="${a.key}">${a.name}</option>`).join('');
  showModal({
    title: 'Add custom skill',
    bodyHTML: `
      <div class="modal-summary">A new skill row will be added to the bottom of the list. You can change the ability later.</div>
      <label style="display:block;font-size:0.8rem;margin:8px 0 2px">Skill name</label>
      <input type="text" id="custom-skill-name" placeholder="e.g. Engineering" autofocus
             style="width:100%;font-family:inherit;padding:6px">
      <label style="display:block;font-size:0.8rem;margin:8px 0 2px">Ability</label>
      <select id="custom-skill-ability" style="width:100%;font-family:inherit;padding:6px">${abilOpts}</select>
    `,
    confirmText: 'Add',
    onConfirm: () => {
      const name = ($('#custom-skill-name')?.value || '').trim();
      const ability = $('#custom-skill-ability')?.value || 'int';
      if (!name) { toast('Enter a skill name'); return false; }
      if (findSkill(name)) { toast('A skill named "' + name + '" already exists'); return false; }
      const key = makeCustomSkillKey(name);
      if (!character.customSkills) character.customSkills = [];
      character.customSkills.push({ key, name, ability, source: 'manual' });
      renderAll();
      persist();
      return true;
    },
  });
}

function renderPassive() {
  const pb = proficiencyBonus(character.level);
  ['perception', 'investigation', 'insight'].forEach(key => {
    const ability = SKILLS.find(s => s.key === key).ability;
    const st = character.skills[key] || { prof: false, exp: false, misc: 0 };
    const bonus = abilityMod(totalAbility(ability))
                + (st.prof ? pb : 0)
                + (st.exp ? pb : 0)
                + (Number(st.misc) || 0);
    $(`#passive-${key}`).textContent = 10 + bonus;
  });
}

// Sum auto initiative bonuses granted by feats the character has.
// New feats store f.initiativeBonus from parseFeatEffects; legacy feats fall
// back to a name-based lookup for the two most common PHB feats.
function autoInitiativeBonus() {
  let bonus = 0;
  (character.feats || []).forEach(f => {
    if (f.initiativeBonus) { bonus += Number(f.initiativeBonus); return; }
    // Legacy fallback
    const n = (f.name || '').toLowerCase().trim();
    if (n === 'alert')               bonus += 5;
    if (n === 'improved initiative') bonus += 5;
  });
  return bonus;
}

// ─── Armor / Magic Armor — AC computation ──────────────────────────────
// `armorSlot`           → mundane armor OR magic armor-replacement
// `shieldSlot`          → mundane shield (flat bonus)
// `magicArmor1/2`       → wondrous items granting a flat AC bonus
// `acOverride`          → user delta on top of the computed total
//
// Magic items are parsed lazily from open5e desc text — see parseMagicItemAC().

/** Bonus contributed by a shield slot.
 *  Open5e encodes SRD-style shields as `base_ac=0, plus_flat_mod=+N`.
 *  Tome of Heroes shields (Kite, Manica) are encoded armor-style with
 *  `base_ac=11, plus_dex_mod=true, plus_flat_mod=+N` — meaning the shield
 *  is treated as if you wore it as light armor (11 + Dex). For a normal
 *  shield-style bonus we treat the base_ac above the unarmored 10 as
 *  contributing to the bonus, so Kite (11 + 2) → +3 and Manica (11 + 1) → +2.
 *  A safety clamp keeps things sane regardless of API quirks. */
function shieldBonus(slot) {
  if (!slot) return 0;
  const r = slot.raw || {};
  const flat = Number(r.plus_flat_mod) || 0;
  const base = Number(r.base_ac)        || 0;
  // Armor-like encoding: base_ac includes the unarmored 10. Subtract it.
  const rawBonus = r.plus_dex_mod ? Math.max(0, base - 10) + flat : base + flat;
  return Math.max(0, Math.min(10, rawBonus));
}

/** Compute the AC contribution of an armor or armor-replacement slot. */
function armorSlotAC(slot, dex) {
  if (!slot) return 10 + dex;
  if (slot.kind === 'magic-armor') {
    // Parsed magic-armor formula: { base, addDex, maxDex }
    const f = slot.formula || {};
    const base = Number(f.base) || 10;
    if (!f.addDex) return base;
    const cap = (f.maxDex == null) ? Infinity : Number(f.maxDex);
    return base + Math.min(dex, cap);
  }
  // Mundane armor — use open5e v1 fields (base_ac, plus_dex_mod, plus_max, plus_flat_mod).
  const raw  = slot.raw || {};
  const base = (Number(raw.base_ac) || 10) + (Number(raw.plus_flat_mod) || 0);
  if (!raw.plus_dex_mod) return base;
  const rawCap = Number(raw.plus_max) || 0;
  const cap    = rawCap > 0 ? rawCap : Infinity;   // 0 in open5e means "no cap"
  return base + Math.min(dex, cap);
}

/** Total computed AC from armor + shield + magic items + Dex (excludes acOverride). */
function computeArmorAC() {
  const dex = abilityMod(totalAbility('dex'));
  let total = armorSlotAC(character.armorSlot, dex);
  // Magic armor enhancement (e.g. "Leather +1") applies only when armor is equipped.
  if (character.armorSlot) total += clampArmorEnhancement(character.armorEnhancement);
  total += shieldBonus(character.shieldSlot);
  for (const slot of [character.magicArmor1, character.magicArmor2]) {
    if (slot && slot.acBonus) total += Number(slot.acBonus) || 0;
  }
  return total;
}

/** Clamp the magic armor enhancement to its allowed range (0–10). */
function clampArmorEnhancement(n) {
  return Math.max(0, Math.min(10, Number(n) || 0));
}

/** Refresh character.ac from the computed base + override and sync the input + deviation flag. */
function applyArmorAC() {
  const computed = computeArmorAC();
  character.ac = computed + (Number(character.acOverride) || 0);
  const inp = $('input[data-bind="ac"]');
  if (inp && document.activeElement !== inp) inp.value = character.ac;
  applyACDeviation();
}

/** Highlight the AC input when the override (user delta) ≠ 0, like initiative/speed do. */
function applyACDeviation() {
  const inp = $('input[data-bind="ac"]');
  if (!inp) return;
  const ovr = Number(character.acOverride) || 0;
  const computed = computeArmorAC();
  inp.classList.toggle('hb-deviation', ovr !== 0);
  const parts = [];
  if (character.armorSlot) {
    const enh = clampArmorEnhancement(character.armorEnhancement);
    parts.push(character.armorSlot.name + (enh > 0 ? ` +${enh}` : ''));
  } else {
    parts.push('Unarmored');
  }
  if (character.shieldSlot) parts.push(`${character.shieldSlot.name} (${fmtMod(shieldBonus(character.shieldSlot))})`);
  for (const s of [character.magicArmor1, character.magicArmor2]) {
    if (s) parts.push(`${s.name} (${fmtMod(Number(s.acBonus) || 0)})`);
  }
  const breakdown = `Computed ${computed} — ${parts.join(', ')}`;
  inp.title = ovr === 0
    ? breakdown
    : `${breakdown}. Manual ${fmtMod(ovr)}. Right-click to reset.`;
}

/**
 * Parse a magic-item desc looking for AC effects.
 * Returns one of:
 *   { kind: 'magic-armor', formula: { base, addDex, maxDex } }  → goes in Armor slot
 *   { kind: 'flat',        acBonus: N }                          → goes in Magic Item slot
 *   null                                                          → not an AC item
 *
 * `formula.maxDex == null` means "no cap" (full Dex applies).
 */
function parseMagicItemAC(item) {
  const desc = String(item && item.desc || '');
  if (!desc) return null;

  // 1. Replacement formula: "AC of 13 + Dex" / "AC equals 15 + Dex" / "AC becomes N"
  let m = desc.match(/\bAC(?:\s+(?:of|is|equals?|becomes))\s+(\d+)(?:\s*\+\s*(?:your\s+)?Dex(?:terity)?(?:\s+modifier)?)?/i);
  if (m) {
    const hasDex = /\+\s*(?:your\s+)?Dex/i.test(m[0]);
    return { kind: 'magic-armor', formula: { base: Number(m[1]), addDex: hasDex, maxDex: null } };
  }

  // 2. Flat bonus to AC
  m = desc.match(/\+(\d+)\s+(?:bonus\s+)?to\s+(?:your\s+)?(?:AC|Armor\s+Class)\b/i);
  if (!m) return null;
  const bonus = Number(m[1]);

  // Items that grant a bonus only WHEN NOT WEARING ARMOR (e.g. Bracers of Defense)
  // function as armor replacements (10 + bonus + Dex). Per user spec, surface them
  // in the Armor slot so they don't stack with mundane armor.
  if (/(?:no armor|aren'?t wearing armor|wearing no armor|without armor|not wearing armor)/i.test(desc)) {
    return { kind: 'magic-armor', formula: { base: 10 + bonus, addDex: true, maxDex: null } };
  }

  return { kind: 'flat', acBonus: bonus };
}

/** True if the item is a wondrous / ring / cloak etc. that grants AC. */
function isMagicACItem(item) {
  return !!parseMagicItemAC(item);
}

function renderCombat() {
  const dex      = abilityMod(totalAbility('dex'));
  const auto     = autoInitiativeBonus();
  const computed = dex + auto;
  const override = Number(character.initiativeBonus) || 0;
  const total    = computed + override;
  const initInp  = $('#initiative');
  if (initInp && document.activeElement !== initInp) {
    initInp.value = fmtMod(total);
  }
  if (initInp) {
    initInp.classList.toggle('hb-deviation', override !== 0);
    const parts = [`DEX mod ${fmtMod(dex)}`];
    if (auto) parts.push(`feats ${fmtMod(auto)}`);
    if (override) parts.push(`manual ${fmtMod(override)}`);
    initInp.title = `Initiative ${fmtMod(total)} — ${parts.join(' + ')}` +
      (override ? '. Right-click to reset to computed.' : '');
  }
  $('#prof-bonus').textContent = fmtMod(proficiencyBonus(character.level));

  // HP bar
  const pct = character.hpMax > 0 ? Math.max(0, Math.min(100, (character.hpCurrent / character.hpMax) * 100)) : 0;
  $('#hp-bar-fill').style.width = pct + '%';
  // Color the HP bar based on percent
  const fill = $('#hp-bar-fill');
  if (pct < 25) fill.style.background = 'linear-gradient(90deg, #c45a4a, #d97562)';
  else if (pct < 50) fill.style.background = 'linear-gradient(90deg, #c8a25c, #e4b96d)';
  else fill.style.background = 'linear-gradient(90deg, #6fb27a, #8ed29a)';

  // Death saves
  $$('.ds-box').forEach(box => {
    const which = box.dataset.death === 'success' ? 'deathSuccesses' : 'deathFailures';
    const idx = Number(box.dataset.idx);
    box.classList.toggle('active', !!character[which][idx]);
  });
}

function renderSpellcasting() {
  const pb = proficiencyBonus(character.level);
  const abilKey = character.spellAbility;
  const mod = abilKey ? abilityMod(totalAbility(abilKey)) : 0;
  $('#spell-dc').textContent     = abilKey ? (8 + pb + mod) : '—';
  $('#spell-attack').textContent = abilKey ? fmtMod(pb + mod)  : '—';

  // Cantrips / Spells Known|Prepared: auto-fill from class table (Known casters)
  // or formula (Prepared casters); lock the input when auto-computed.
  const lvl   = Math.max(1, Math.min(20, Number(character.level) || 1));
  const slug  = character.classSlug;
  const cAuto = autoCantripsKnown(slug, lvl);
  const prepared = isPreparedCaster();
  const sAuto = prepared ? autoPreparedCount() : autoSpellsKnown(slug, lvl);
  const cInput = $('#cantrips-known-input');
  const sInput = $('#spells-known-input');
  const sLabel = $('#spells-known-label');
  const toggle = $('#spells-mode-toggle');

  if (cInput) {
    if (cAuto > 0) {
      character.cantripsKnown = cAuto;
      cInput.value = cAuto;
      cInput.disabled = true;
      cInput.classList.add('locked');
      cInput.title = 'Set automatically from class & level';
    } else {
      cInput.disabled = false;
      cInput.classList.remove('locked');
      cInput.title = '';
    }
  }
  if (sInput) {
    if (sAuto > 0) {
      character.spellsKnown = sAuto;
      sInput.value = sAuto;
      sInput.disabled = true;
      sInput.classList.add('locked');
      const info = preparedCasterInfo(slug);
      sInput.title = prepared
        ? (info
            ? `Prepared = ${info.ability.toUpperCase()} mod ${info.halfLevel ? '+ ½ class level' : '+ class level'} (min 1)`
            : 'Prepared = spell ability mod + class level (min 1)')
        : 'Set automatically from class & level';
    } else {
      sInput.disabled = false;
      sInput.classList.remove('locked');
      sInput.title = '';
    }
  }
  if (sLabel) sLabel.textContent = prepared ? 'Prepared' : 'Known';
  if (toggle) {
    // Toggle is meaningful only when the class is Custom/unrecognized; otherwise
    // the class slug determines the style and the toggle would mislead.
    const isCustomClass = !slug;
    toggle.classList.toggle('hidden', !isCustomClass);
    toggle.textContent = prepared ? 'Prepared ⇆' : 'Known ⇆';
  }

  // Pad spell list with blank entries to match the allowed totals
  syncCantripCount();
  syncSpellCount();

  renderSpellSlots();
  renderSpellPicksCounters();
}

function renderSpellPicksCounters() {
  const wrap = $('#spell-picks-counters');
  if (!wrap) return;
  wrap.innerHTML = '';
  const spells = character.spells || [];

  function makeCounter(label, used, total, cssClass) {
    if (total <= 0 && used <= 0) return;
    const remaining = Math.max(0, total - used);
    const isOver = total > 0 && used > total;
    const el = document.createElement('div');
    el.className = `skill-picks-counter ${cssClass}${isOver ? ' hb-deviation' : ''}`;
    if (isOver) el.title = `${used - total} beyond Known + Bonus`;
    const tail = total <= 0 ? '' :
      (isOver
        ? `<span class="picks-remaining">+${used - total} extra</span>`
        : (remaining > 0
            ? `<span class="picks-remaining">${remaining} remaining</span>`
            : `<span class="picks-done">&#10003; all used</span>`));
    el.innerHTML = `<span>${label}: <strong>${used}/${total || used}</strong></span>${tail}`;
    wrap.appendChild(el);
  }

  const cTotal = cantripsTotalAllowed();
  const cUsed  = spells.filter(s => Number(s.level) === 0 && (s.name || '').trim()).length;
  const sTotal = spellsTotalAllowed();
  // Always-prepared/known spells (Domain, Oath, Circle, racial, etc.) never count against the cap.
  // Prepared casters count `prepared` checkboxes; known casters count every listed spell.
  const prepared = isPreparedCaster();
  const sUsed = spells.filter(s => {
    if (Number(s.level) < 1) return false;
    if (!(s.name || '').trim()) return false;
    if (s.alwaysPrepared) return false;
    return prepared ? !!s.prepared : true;
  }).length;
  if (cTotal > 0 || cUsed > 0) makeCounter('Cantrips picked', cUsed, cTotal, 'counter-cantrips');
  if (sTotal > 0 || sUsed > 0) {
    const spellLabel = prepared ? 'Spells prepared' : 'Spells picked';
    makeCounter(spellLabel, sUsed, sTotal, 'counter-spells');
  }
}

const SLOT_LEVEL_COLS = ['1st','2nd','3rd','4th','5th','6th','7th','8th','9th'];

// Returns the base SRD-table count of slots a character has at the given spell level.
// Handles both standard casters (Bard/Cleric/Wizard/etc.) and Warlock pact magic.
function autoSpellSlots(classSlug, charLevel, spellLevel) {
  if (!classSlug) return 0;
  let c = (presetCache.class || []).find(x => x.slug === classSlug);
  if (!c && character.cachedClass && character.cachedClass.slug === classSlug) c = character.cachedClass;
  if (!c || !c.table) return 0;
  const lines = c.table.split('\n').filter(l => l.includes('|'));
  if (lines.length < 2) return 0;
  const header = lines[0].split('|').map(s => s.trim());
  const levelCol = header.findIndex(h => /^level$/i.test(h));
  if (levelCol < 0) return 0;

  // Warlock-style pact magic: "Spell Slots" + "Slot Level"
  const pactSlotsCol = header.findIndex(h => /^spell\s*slots$/i.test(h));
  const pactSlotLvlCol = header.findIndex(h => /^slot\s*level$/i.test(h));
  const isPact = pactSlotsCol >= 0 && pactSlotLvlCol >= 0;

  let colIdx = -1;
  if (!isPact) {
    const colName = SLOT_LEVEL_COLS[spellLevel - 1];
    if (!colName) return 0;
    colIdx = header.findIndex(h => h.toLowerCase() === colName);
    if (colIdx < 0) return 0;
  }

  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split('|').map(s => s.trim());
    if (cells.every(x => /^-+$|^$/.test(x))) continue;
    const lvlMatch = cells[levelCol] && cells[levelCol].match(/\d+/);
    if (!lvlMatch || Number(lvlMatch[0]) !== charLevel) continue;
    if (isPact) {
      const slotLvlMatch = (cells[pactSlotLvlCol] || '').match(/\d+/);
      if (!slotLvlMatch) return 0;
      const slotLvl = Number(slotLvlMatch[0]);
      if (slotLvl !== spellLevel) return 0;
      return Number(cells[pactSlotsCol]) || 0;
    }
    const v = cells[colIdx];
    if (!v || v === '-' || v === '—') return 0;
    return Number(v) || 0;
  }
  return 0;
}

function cantripsTotalAllowed() {
  return Math.max(0, Number(character.cantripsKnown) || 0) + Math.max(0, Number(character.cantripsBonus) || 0);
}
function spellsTotalAllowed() {
  return Math.max(0, Number(character.spellsKnown) || 0) + Math.max(0, Number(character.spellsBonus) || 0);
}

function syncCantripCount() {
  const target = cantripsTotalAllowed();
  character.spells = character.spells || [];
  const cur = character.spells.filter(s => s.level === 0).length;
  for (let i = cur; i < target; i++) {
    character.spells.push({ level: 0, name: '', prepared: false, alwaysPrepared: false, notes: '' });
  }
}

function syncSpellCount() {
  // Prepared casters list as many spells as they like (the cap counts only
  // the ones they prepare today, not every entry), so we never pad in that mode.
  if (isPreparedCaster()) return;
  const target = spellsTotalAllowed();
  character.spells = character.spells || [];
  const cur = character.spells.filter(s => s.level >= 1).length;
  const lvl = highestAvailableSpellLevel() || 1;
  for (let i = cur; i < target; i++) {
    character.spells.push({ level: lvl, name: '', prepared: false, alwaysPrepared: false, notes: '' });
  }
}

// Parse one numeric column from a class's level table at a given character level.
function autoFromClassTable(classSlug, charLevel, columnRegex) {
  if (!classSlug) return 0;
  let c = (presetCache.class || []).find(x => x.slug === classSlug);
  if (!c && character.cachedClass && character.cachedClass.slug === classSlug) c = character.cachedClass;
  if (!c || !c.table) return 0;
  const lines = c.table.split('\n').filter(l => l.includes('|'));
  if (lines.length < 2) return 0;
  const header = lines[0].split('|').map(s => s.trim());
  const levelCol  = header.findIndex(h => /^level$/i.test(h));
  const targetCol = header.findIndex(h => columnRegex.test(h));
  if (levelCol < 0 || targetCol < 0) return 0;
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split('|').map(s => s.trim());
    if (cells.every(x => /^-+$|^$/.test(x))) continue;
    const lvlMatch = cells[levelCol] && cells[levelCol].match(/\d+/);
    if (!lvlMatch || Number(lvlMatch[0]) !== charLevel) continue;
    const v = cells[targetCol];
    if (!v || v === '-' || v === '—') return 0;
    return Number(v) || 0;
  }
  return 0;
}
function autoCantripsKnown(classSlug, charLevel) {
  return autoFromClassTable(classSlug, charLevel, /^cantrips known$/i);
}
function autoSpellsKnown(classSlug, charLevel) {
  return autoFromClassTable(classSlug, charLevel, /^spells known$/i);
}

// Classes that PREPARE spells (vs. classes that "know" a fixed list).
// `halfLevel` → only counts half the character level (Paladin, Artificer).
// Wizards prepare too; their spellbook isn't tracked here.
const PREPARED_CASTERS = {
  cleric:    { ability: 'wis', halfLevel: false },
  druid:     { ability: 'wis', halfLevel: false },
  wizard:    { ability: 'int', halfLevel: false },
  paladin:   { ability: 'cha', halfLevel: true  },
  artificer: { ability: 'int', halfLevel: true  },
};

function preparedCasterInfo(classSlug) {
  return classSlug ? (PREPARED_CASTERS[classSlug] || null) : null;
}

/** True if the active class uses the "prepare each day" model. Falls back to
 *  the manual toggle when the class is Custom / unrecognized. */
function isPreparedCaster() {
  if (character.classSlug) return !!preparedCasterInfo(character.classSlug);
  return !!character.spellsArePrepared;
}

/** Prepared-spell count: ability mod + (½ level or full level), minimum 1.
 *  Returns 0 if no ability is selected (so the field stays unlocked). */
function autoPreparedCount() {
  const info = preparedCasterInfo(character.classSlug);
  const ability = info ? info.ability : character.spellAbility;
  if (!ability) return 0;
  const halfLevel = info ? info.halfLevel : false;
  const mod = abilityMod(totalAbility(ability));
  const lvl = Math.max(1, Math.min(20, Number(character.level) || 1));
  const effLvl = halfLevel ? Math.floor(lvl / 2) : lvl;
  return Math.max(1, mod + effLvl);
}

function highestAvailableSpellLevel() {
  if (!character.classSlug) return 0;
  const charLevel = Math.max(1, Math.min(20, Number(character.level) || 1));
  for (let lvl = 9; lvl >= 1; lvl--) {
    const auto = autoSpellSlots(character.classSlug, charLevel, lvl);
    const bonus = (character.spellSlots?.[lvl]?.bonus) || 0;
    if (auto + bonus > 0) return lvl;
  }
  return 0;
}

function getSlotData(lvl) {
  const slots = character.spellSlots;
  let s = slots[lvl];
  if (!s) {
    s = slots[lvl] = { used: 0, bonus: 0 };
    return s;
  }
  if (typeof s.used !== 'number') s.used = 0;
  if (typeof s.bonus !== 'number') {
    // Migrate from old { total, used } format
    if (typeof s.total === 'number') {
      const auto = autoSpellSlots(character.classSlug, Number(character.level) || 1, lvl);
      s.bonus = s.total - auto;
      delete s.total;
    } else {
      s.bonus = 0;
    }
  }
  return s;
}

function renderSpellSlots() {
  const wrap = $('#spell-slots');
  if (!wrap) return;
  wrap.innerHTML = '';
  const charLevel = Math.max(1, Math.min(20, Number(character.level) || 1));
  for (let lvl = 1; lvl <= 9; lvl++) {
    const s = getSlotData(lvl);
    const auto = autoSpellSlots(character.classSlug, charLevel, lvl);
    const total = Math.max(0, auto + (s.bonus || 0));
    if (s.used > total) s.used = total;
    const used = s.used;
    const bonusLabel = s.bonus !== 0
      ? `<span class="slot-bonus">${s.bonus > 0 ? '+' : ''}${s.bonus}</span>`
      : '';
    const row = document.createElement('div');
    row.className = 'slot-row' + (total === 0 ? ' empty' : '');
    row.innerHTML = `
      <span class="slot-label">Lvl ${lvl}</span>
      <div class="slot-bubbles" data-level="${lvl}"></div>
      <div class="slot-controls">
        <span class="slot-auto" title="Base: ${auto} • Bonus: ${s.bonus >= 0 ? '+' : ''}${s.bonus}">${auto}${bonusLabel}</span>
        <button class="btn btn-sm slot-stepper" data-level="${lvl}" data-dir="-1" title="Remove a bonus slot (homebrew)">−</button>
        <button class="btn btn-sm slot-stepper" data-level="${lvl}" data-dir="1" title="Add a bonus slot (homebrew)">+</button>
      </div>
    `;
    const bubblesEl = row.querySelector('.slot-bubbles');
    for (let i = 0; i < total; i++) {
      const bub = document.createElement('span');
      // Filled (available) bubbles first; hollow (used) bubbles after.
      // Bonus bubbles (beyond the class-table auto amount) come last and are styled blue.
      const isUsed  = i >= (total - used);
      const isBonus = s.bonus > 0 && i >= auto;
      bub.className = 'slot-bubble' + (isUsed ? ' used' : '') + (isBonus ? ' bonus' : '');
      bub.dataset.level = lvl;
      bub.title = isUsed ? 'Used — click to recover' : 'Available — click to spend';
      bubblesEl.appendChild(bub);
    }
    wrap.appendChild(row);
  }
  // Wire bubble clicks
  wrap.querySelectorAll('.slot-bubble').forEach(b => {
    b.addEventListener('click', () => {
      const lvl = Number(b.dataset.level);
      const s = getSlotData(lvl);
      const auto = autoSpellSlots(character.classSlug, charLevel, lvl);
      const total = Math.max(0, auto + s.bonus);
      if (b.classList.contains('used')) s.used = Math.max(0, s.used - 1);
      else s.used = Math.min(total, s.used + 1);
      renderSpellSlots();
      persist();
    });
  });
  // Wire steppers — adjust bonus (homebrew)
  wrap.querySelectorAll('.slot-stepper').forEach(btn => {
    btn.addEventListener('click', () => {
      const lvl = Number(btn.dataset.level);
      const dir = Number(btn.dataset.dir);
      const s = getSlotData(lvl);
      const auto = autoSpellSlots(character.classSlug, charLevel, lvl);
      // Bonus can go negative (homebrew penalty), but total stays >= 0
      const minBonus = -auto;
      s.bonus = Math.max(minBonus, Math.min(20, s.bonus + dir));
      const total = Math.max(0, auto + s.bonus);
      if (s.used > total) s.used = total;
      renderSpellSlots();
      persist();
    });
  });
}

function renderAttacks() {
  const tbody = $('#attacks-tbody');
  tbody.innerHTML = '';
  character.attacks.forEach((a, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><input type="text" value="${escapeAttr(a.name || '')}" data-atk="${i}" data-field="name"></td>
      <td><input type="text" value="${escapeAttr(a.bonus || '')}" data-atk="${i}" data-field="bonus" style="width:60px"></td>
      <td><input type="text" value="${escapeAttr(a.damage || '')}" data-atk="${i}" data-field="damage"></td>
      <td><button class="icon-btn" data-atk-del="${i}" title="Remove">&times;</button></td>
    `;
    tbody.appendChild(tr);
  });
  tbody.querySelectorAll('input[data-atk]').forEach(inp => {
    inp.addEventListener('input', e => {
      const i = Number(e.target.dataset.atk);
      character.attacks[i][e.target.dataset.field] = e.target.value;
    });
  });
  tbody.querySelectorAll('button[data-atk-del]').forEach(btn => {
    btn.addEventListener('click', e => {
      character.attacks.splice(Number(e.target.dataset.atkDel), 1);
      renderAttacks();
    });
  });
}

function spellDocKey(p) {
  return (p && p.document && p.document.key) || '';
}

function findCachedSpells(name) {
  if (!name) return [];
  const norm = String(name).toLowerCase().trim();
  if (!norm) return [];
  const cached = presetCache.spells || [];
  // Edition ordering: 2014 SRD first, 2024 SRD second, then alphabetical by source
  const order = { 'srd-2014': 0, 'srd-2024': 1 };
  return cached
    .filter(p => p.name && p.name.toLowerCase().trim() === norm)
    .sort((a, b) => {
      const ad = spellDocKey(a), bd = spellDocKey(b);
      const ao = order[ad] ?? 99;
      const bo = order[bd] ?? 99;
      if (ao !== bo) return ao - bo;
      return ad.localeCompare(bd);
    });
}

const SPELL_DOC_LABELS = {
  'srd-2014': '2014',
  'srd-2024': '2024',
  'a5e-ag':   'A5E',
  'toh':      'ToH',
  'taldorei': "Tal'Dorei",
  'kp':       'Kobold',
};
function editionLabelForDoc(key) {
  if (!key) return 'Other';
  return SPELL_DOC_LABELS[key] || key;
}

/** Normalise a casting-time string from the API (e.g. "1minute" → "1 minute"). */
function normalizeCastingTime(ct) {
  if (!ct) return ct;
  // Insert a space between a run of digits and the immediately-following letter
  // when no space is already present (Open5e v2 sometimes omits it).
  return ct.replace(/(\d)([a-zA-Z])/g, '$1 $2');
}

/** Returns the casting time for a ritual (original time + 10 minutes). */
function ritualCastTime(castingTime) {
  const ct = normalizeCastingTime((castingTime || '').trim()).toLowerCase();
  const hourMatch = ct.match(/^(\d+)\s*hour/);
  if (hourMatch) {
    const h = parseInt(hourMatch[1]);
    return `${h} hour${h !== 1 ? 's' : ''} 10 minutes`;
  }
  const minMatch = ct.match(/^(\d+)\s*minute/);
  if (minMatch) {
    const mins = parseInt(minMatch[1]) + 10;
    return `${mins} minutes`;
  }
  return '10 minutes'; // 1 action, bonus action, reaction, etc.
}

/** Copy level + meta from a cached spell into a spell row (no-op when no match).
 *  Used both when adding from the SRD search and when the user types a name
 *  manually. The selected edition is remembered on the row so the popup can
 *  open to it later. */
function applySpellAutofill(spell, preferredKey) {
  if (!spell) return;
  const matches = findCachedSpells(spell.name);
  if (!matches.length) return;
  const m = (preferredKey && matches.find(x => x.key === preferredKey)) || matches[0];
  if (m.level != null)      spell.level    = Number(m.level) || 0;
  if (m.school?.name || m.casting_time) {
    const castTime = normalizeCastingTime(m.casting_time);
    const parts = [m.school?.name, castTime].filter(Boolean);
    if (m.ritual) {
      parts.push('Ritual');
      parts.push(ritualCastTime(castTime));
    }
    spell.notes = parts.join(' • ');
  }
  spell.sourceKey = m.key;  // pin the chosen edition so the popup can default to it
}

// ------------ Spell rules popup ------------
const _spellDetailCache = {}; // slug → fetched detail object (or null on fail)

async function openSpellPopup(spellName, spellIdx) {
  const matches = findCachedSpells(spellName);
  if (!matches.length) return;

  const titleEl   = $('#spell-popup-title');
  const tabsEl    = $('#spell-popup-tabs');
  const contentEl = $('#spell-popup-content');
  const overlay   = $('#spell-popup-overlay');

  titleEl.textContent = matches[0].name;
  tabsEl.innerHTML    = '';
  contentEl.innerHTML = '<p class="srd-hint">Loading…</p>';
  overlay.classList.remove('hidden');

  // Default to the edition currently pinned on this spell row (if any), else first.
  const row = (spellIdx != null) ? character.spells?.[spellIdx] : null;
  const pinnedKey = row?.sourceKey;
  const startIdx = Math.max(0, matches.findIndex(m => m.key === pinnedKey));

  matches.forEach((m, i) => {
    const btn = document.createElement('button');
    btn.type  = 'button';
    btn.className = 'spell-popup-tab' + (i === startIdx ? ' active' : '');
    btn.textContent = editionLabelForDoc(spellDocKey(m));
    btn.dataset.tabIdx = i;
    tabsEl.appendChild(btn);
  });

  // Fetch each matching spell's full data via v2 (key is also the open5e.com URL slug)
  const details = await Promise.all(matches.map(async (m) => {
    if (m.key in _spellDetailCache) return _spellDetailCache[m.key];
    try {
      const r = await fetch(`${SRD_BASE_V2}/spells/${m.key}/`);
      const data = r.ok ? await r.json() : null;
      _spellDetailCache[m.key] = data;
      return data;
    } catch (e) {
      _spellDetailCache[m.key] = null;
      return null;
    }
  }));

  let currentIdx = startIdx;
  const showTab = (idx) => {
    currentIdx = idx;
    $$('.spell-popup-tab', tabsEl).forEach((t, i) => t.classList.toggle('active', i === idx));
    contentEl.innerHTML = renderSpellPopupDetail(details[idx], matches[idx], row != null);
    const applyBtn = contentEl.querySelector('.spell-popup-apply');
    if (applyBtn) {
      applyBtn.addEventListener('click', () => {
        if (!row) return;
        applySpellAutofill(row, matches[idx].key);
        overlay.classList.add('hidden');
        renderSpells();
        renderSpellPicksCounters();
        persist();
        toast(`Updated to ${editionLabelForDoc(spellDocKey(matches[idx]))} edition`);
      });
    }
  };
  $$('.spell-popup-tab', tabsEl).forEach(t => {
    t.addEventListener('click', () => showTab(Number(t.dataset.tabIdx)));
  });
  showTab(startIdx);
}

function renderSpellPopupDetail(detail, ref, includeApply = false) {
  // v2 key is already the open5e.com URL slug (e.g. `srd_see-invisibility`, `srd-2024_see-invisibility`).
  const url = `https://open5e.com/spells/${escapeAttr(ref.key)}`;
  const applyBtn = includeApply
    ? `<div style="margin-top:10px"><button class="btn btn-sm spell-popup-apply">Apply this edition to spell row</button></div>`
    : '';
  if (!detail) {
    return `<p class="srd-hint">Could not load full details for this edition.</p>
            <div class="spell-detail-link"><a href="${url}" target="_blank" rel="noopener">View on open5e &#x2197;</a></div>
            ${applyBtn}`;
  }

  const lvl    = Number(detail.level) || 0;
  const school = (detail.school && detail.school.name) || '';
  const lvlText = lvl === 0
    ? `Cantrip${school ? ' • ' + escapeHTML(school) : ''}`
    : `Level ${lvl}${school ? ' ' + escapeHTML(school) : ''}`;

  // Components (v2 has booleans + material_specified)
  const comps = [];
  if (detail.verbal)  comps.push('V');
  if (detail.somatic) comps.push('S');
  if (detail.material) comps.push('M');
  const compsStr = comps.join(', ');

  // Range — prefer human-readable range_text, fall back to range + unit
  let rangeStr = detail.range_text || '';
  if (!rangeStr && Number(detail.range) && detail.range_unit) {
    rangeStr = `${detail.range} ${detail.range_unit}`;
  }

  const castStr = detail.casting_time || '';
  const ritual  = detail.ritual ? ' (ritual)' : '';
  const conc    = detail.concentration ? ' Concentration,' : '';
  const durStr  = detail.duration || '';

  return `
    <div class="spell-detail-line spell-detail-lvl">${lvlText}${ritual}</div>
    ${castStr  ? `<div class="spell-detail-line"><b>Casting Time:</b> ${escapeHTML(castStr)}</div>` : ''}
    ${rangeStr ? `<div class="spell-detail-line"><b>Range:</b> ${escapeHTML(rangeStr)}</div>` : ''}
    ${compsStr ? `<div class="spell-detail-line"><b>Components:</b> ${compsStr}${detail.material_specified ? ' (' + escapeHTML(detail.material_specified) + ')' : ''}</div>` : ''}
    ${durStr   ? `<div class="spell-detail-line"><b>Duration:</b>${conc} ${escapeHTML(durStr)}</div>` : ''}
    ${detail.desc         ? `<div class="spell-detail-desc">${escapeHTML(detail.desc)}</div>` : ''}
    ${detail.higher_level ? `<div class="spell-detail-higher"><b>At Higher Levels:</b> ${escapeHTML(detail.higher_level)}</div>` : ''}
    <div class="spell-detail-link"><a href="${url}" target="_blank" rel="noopener">View on open5e &#x2197;</a></div>
    ${applyBtn}
  `;
}

function wireSpellPopup() {
  $('#spell-popup-close')?.addEventListener('click', () => $('#spell-popup-overlay').classList.add('hidden'));
  $('#spell-popup-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'spell-popup-overlay') $('#spell-popup-overlay').classList.add('hidden');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#spell-popup-overlay').classList.contains('hidden')) {
      $('#spell-popup-overlay').classList.add('hidden');
    }
  });
}

// Toggle that flips Known ↔ Prepared for Custom classes. The toggle is
// hidden for recognized classes (their slug determines the style).
function wireSpellsModeToggle() {
  const btn = $('#spells-mode-toggle');
  if (!btn) return;
  btn.addEventListener('click', () => {
    character.spellsArePrepared = !character.spellsArePrepared;
    renderSpellcasting();
    renderSpells();
    persist();
  });
}

// ============================================================
// Class / Race / Background  — link arrows, hover card, popup
// ============================================================

/** Resolve a preset slug to its cached data object. */
function getPresetItem(preset, slug) {
  if (!slug || slug === '__custom__') return null;
  if (preset === 'class')      return (presetCache.class      || []).find(i => i.slug === slug) || null;
  if (preset === 'background') return (presetCache.background || []).find(i => i.slug === slug) || null;
  if (preset === 'race') {
    const [baseSlug, subSlug] = slug.split(':');
    const race = (presetCache.race || []).find(r => r.slug === baseSlug);
    if (!race) return null;
    if (subSlug) {
      const sub = (race.subraces || []).find(s => s.slug === subSlug);
      if (sub) return { ...race, ...sub, name: `${race.name} (${sub.name})`, _baseSlug: baseSlug, slug };
    }
    return { ...race, _baseSlug: baseSlug, slug };
  }
  return null;
}

/**
 * Map a v1 document__slug to the prefix used in open5e.com v2-style URL keys.
 * The site uses slugs like "srd_bard" (2014 SRD) or "srd-2024_bard" (2024 SRD).
 * v1 calls the 2014 SRD "wotc-srd"; open5e.com calls it just "srd".
 */
function docSlugToUrlPrefix(docSlug) {
  if (!docSlug || docSlug === 'wotc-srd') return 'srd';
  return docSlug; // 'srd-2024', 'a5e', 'toh', 'kp', 'blackflag', etc. map as-is
}

/** open5e.com URL for a preset item (uses v2-style "{prefix}_{slug}" format). */
function presetOpen5eUrl(preset, item) {
  const paths  = { class: 'classes', race: 'races', background: 'backgrounds' };
  const prefix = docSlugToUrlPrefix(item.document__slug);
  const baseSl = item._baseSlug || (item.slug || '').split(':')[0];
  return `https://open5e.com/${paths[preset] || preset}/${encodeURIComponent(prefix + '_' + baseSl)}`;
}

/** HTML for the small hover-card (key facts only). */
function renderPresetHoverContent(preset, item) {
  const lines = [];
  if (preset === 'class') {
    const hd = String(item.hit_dice || '').match(/d\d+/);
    if (hd) lines.push(`Hit die: <b>${hd[0]}</b>`);
    if (item.prof_saving_throws) lines.push(`Saves: ${escapeHTML(item.prof_saving_throws)}`);
    if (item.prof_skills)        lines.push(`Skills: ${escapeHTML(item.prof_skills)}`);
  } else if (preset === 'race') {
    if (item.asi_desc)  lines.push(`ASI: ${escapeHTML(item.asi_desc)}`);
    const spd = item.speed && (typeof item.speed === 'object' ? item.speed.walk : item.speed);
    if (spd)            lines.push(`Speed: <b>${spd} ft</b>`);
    if (item.languages) lines.push(`Languages: ${escapeHTML(item.languages)}`);
  } else if (preset === 'background') {
    if (item.skill_proficiencies) lines.push(`Skills: ${escapeHTML(item.skill_proficiencies)}`);
    if (item.tool_proficiencies)  lines.push(`Tools: ${escapeHTML(item.tool_proficiencies)}`);
    if (item.languages)           lines.push(`Languages: ${escapeHTML(item.languages)}`);
  }
  if (!lines.length) return '';
  return `<div class="phc-name">${escapeHTML(item.name)}</div>` +
    lines.map(l => `<div class="phc-line">${l}</div>`).join('');
}

/** HTML for the full detail popup content. */
function renderPresetPopupContent(preset, item) {
  let html = '';
  if (preset === 'class') {
    const hd = String(item.hit_dice || '').match(/d\d+/);
    html += `<div class="spell-detail-line"><b>Hit die:</b> ${hd ? hd[0] : escapeHTML(item.hit_dice || '?')}</div>`;
    if (item.prof_armor)         html += `<div class="spell-detail-line"><b>Armor:</b> ${escapeHTML(item.prof_armor)}</div>`;
    if (item.prof_weapons)       html += `<div class="spell-detail-line"><b>Weapons:</b> ${escapeHTML(item.prof_weapons)}</div>`;
    if (item.prof_tools)         html += `<div class="spell-detail-line"><b>Tools:</b> ${escapeHTML(item.prof_tools)}</div>`;
    if (item.prof_saving_throws) html += `<div class="spell-detail-line"><b>Saves:</b> ${escapeHTML(item.prof_saving_throws)}</div>`;
    if (item.prof_skills)        html += `<div class="spell-detail-line"><b>Skills:</b> ${escapeHTML(item.prof_skills)}</div>`;
    if (item.desc)               html += `<div class="spell-detail-desc">${escapeHTML(item.desc)}</div>`;
  } else if (preset === 'race') {
    const spd = item.speed && (typeof item.speed === 'object' ? item.speed.walk : item.speed);
    html += `<div class="spell-detail-line">${item.size ? escapeHTML(item.size) + ' &bull; ' : ''}${spd ? 'Speed ' + spd + ' ft' : ''}</div>`;
    if (item.asi_desc)  html += `<div class="spell-detail-line"><b>ASI:</b> ${escapeHTML(item.asi_desc)}</div>`;
    if (item.languages) html += `<div class="spell-detail-line"><b>Languages:</b> ${escapeHTML(item.languages)}</div>`;
    if (item.desc)      html += `<div class="spell-detail-desc">${escapeHTML(item.desc)}</div>`;
  } else if (preset === 'background') {
    if (item.skill_proficiencies) html += `<div class="spell-detail-line"><b>Skills:</b> ${escapeHTML(item.skill_proficiencies)}</div>`;
    if (item.tool_proficiencies)  html += `<div class="spell-detail-line"><b>Tools:</b> ${escapeHTML(item.tool_proficiencies)}</div>`;
    if (item.languages)           html += `<div class="spell-detail-line"><b>Languages:</b> ${escapeHTML(item.languages)}</div>`;
    if (item.feature)             html += `<div class="spell-detail-line"><b>Feature:</b> ${escapeHTML(item.feature)}</div>`;
    if (item.feature_desc)        html += `<div class="spell-detail-desc">${escapeHTML(item.feature_desc)}</div>`;
    if (item.equipment)           html += `<div class="spell-detail-line"><b>Equipment:</b> ${escapeHTML(item.equipment)}</div>`;
  }
  const url = presetOpen5eUrl(preset, item);
  const applyLabel = { class: 'Set Class', race: 'Set Race', background: 'Apply Background' }[preset] || 'Apply';
  html += `
    <div class="spell-detail-link"><a href="${url}" target="_blank" rel="noopener">View on open5e &#x2197;</a></div>
    <div style="margin-top:10px"><button class="btn btn-sm preset-popup-apply">${applyLabel}</button></div>
  `;
  return html;
}

/** Open the preset detail popup for a given preset + slug. */
function openPresetPopup(preset, slug) {
  const item = getPresetItem(preset, slug);
  if (!item) { toast('SRD data not loaded yet — connect to load presets'); return; }
  $('#preset-popup-title').textContent = item.name;
  const content = $('#preset-popup-content');
  content.innerHTML = renderPresetPopupContent(preset, item);
  $('#preset-popup-overlay').classList.remove('hidden');
  content.querySelector('.preset-popup-apply')?.addEventListener('click', () => {
    $('#preset-popup-overlay').classList.add('hidden');
    // Sync the select element then apply
    const sel = $(`select[data-preset="${preset}"]`);
    if (sel) sel.value = slug;
    if (preset === 'class')           applyClass(slug);
    else if (preset === 'race')       applyRace(slug);
    else if (preset === 'background') applyBackground(slug);
  });
}

/**
 * Update the ↗ link arrows next to Class / Race / Background labels.
 * Called from renderAll() so it stays in sync with character state.
 */
function syncPresetLinks() {
  [
    { id: 'preset-link-class',      slug: character.classSlug,      preset: 'class' },
    { id: 'preset-link-race',       slug: character.raceSlug,       preset: 'race' },
    { id: 'preset-link-background', slug: character.backgroundSlug, preset: 'background' },
  ].forEach(({ id, slug, preset }) => {
    const wrap = $(`#${id}`);
    if (!wrap) return;
    if (!slug || slug === '__custom__') { wrap.innerHTML = ''; return; }
    // Look up the cached item to get document__slug for correct URL prefix
    const item = getPresetItem(preset, slug);
    if (!item) { wrap.innerHTML = ''; return; }
    const url = presetOpen5eUrl(preset, item);
    wrap.innerHTML = `<a class="preset-link" href="${url}" target="_blank" rel="noopener" title="View on open5e">&#x2197;</a>`;
  });
}

/** Wire only the preset popup close handlers.
 *  Hover cards and right-click are now handled per-item in buildCustomDropdowns(). */
function wirePresetPreview() {
  $('#preset-popup-close')?.addEventListener('click', () => $('#preset-popup-overlay').classList.add('hidden'));
  $('#preset-popup-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'preset-popup-overlay') $('#preset-popup-overlay').classList.add('hidden');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#preset-popup-overlay').classList.contains('hidden')) {
      $('#preset-popup-overlay').classList.add('hidden');
    }
  });
}

// ============================================================
// Custom Class / Race / Background dropdowns
// ──────────────────────────────────────────
// The native <select> elements are kept hidden in the DOM so all
// existing code (setCustomMode, clearClass, syncPresetSelections …)
// that navigates via select[data-preset] / .srd-field keeps working.
// pickPreset() mirrors the onPresetChange() logic directly.
// ============================================================

let _openDdPreset = null; // 'class' | 'race' | 'background' | null

/**
 * Create trigger buttons + body-level panels for all three dropdowns.
 * Called once at boot (before API data loads). populatePresetDropdowns()
 * fills the list items once the cache is ready.
 */
function buildCustomDropdowns() {
  ['class', 'race', 'background'].forEach(preset => {
    const sel = $(`select[data-preset="${preset}"]`);
    if (!sel || $(`#preset-dd-${preset}`)) return;
    sel.style.display = 'none';   // hide native select; keep in DOM for existing code

    // ── Trigger button ──────────────────────────────────────────────
    const dd = document.createElement('div');
    dd.className      = 'preset-dropdown';
    dd.id             = `preset-dd-${preset}`;
    dd.dataset.preset = preset;

    const btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'preset-dd-trigger';
    btn.innerHTML = `<span class="preset-dd-value">${PRESET_PLACEHOLDER[preset]}</span><span class="preset-dd-caret">▾</span>`;
    dd.appendChild(btn);
    sel.insertAdjacentElement('afterend', dd);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      _openDdPreset === preset ? closePresetDropdown() : openPresetDropdown(preset);
    });

    // Trigger hover → summary card for currently selected item
    btn.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;   // no hover card on touch/stylus
      const slug = character[preset + 'Slug'] || '';
      if (!slug || slug === '__custom__') return;
      const item = getPresetItem(preset, slug);
      if (!item) return;
      const html = renderPresetHoverContent(preset, item);
      if (html) showPresetHoverCard(html, btn.getBoundingClientRect(), 'below');
    });
    btn.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hidePresetHoverCard(); });

    // ── Panel (appended to <body> so position:fixed has no clipping) ─
    const panel = document.createElement('div');
    panel.className      = 'preset-dd-panel hidden';
    panel.id             = `preset-ddp-${preset}`;
    panel.dataset.preset = preset;
    panel.setAttribute('role', 'listbox');

    const search = document.createElement('input');
    search.type        = 'text';
    search.className   = 'preset-dd-search';
    search.placeholder = 'Search…';

    const list = document.createElement('div');
    list.className = 'preset-dd-list';

    panel.appendChild(search);
    panel.appendChild(list);
    document.body.appendChild(panel);

    search.addEventListener('input', () => filterPresetDropdown(preset));
    search.addEventListener('keydown', e => {
      if (e.key === 'Escape')    { e.preventDefault(); closePresetDropdown(); btn.focus(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); focusDdItem(preset, null, 1); }
    });
  });

  // Close panel on outside click. For scroll, reposition rather than close
  // (and ignore scrolls originating from inside the panel itself — the list
  // is scrollable and would otherwise close itself every wheel tick).
  document.addEventListener('click',  () => closePresetDropdown());
  document.addEventListener('scroll', e => {
    if (!_openDdPreset) return;
    const panel = $(`#preset-ddp-${_openDdPreset}`);
    if (panel && e.target instanceof Node && panel.contains(e.target)) return;
    positionPresetPanel(_openDdPreset);
  }, { passive: true, capture: true });
  window.addEventListener('resize', () => {
    if (_openDdPreset) positionPresetPanel(_openDdPreset);
  });
}

/** Position the panel relative to its trigger (called on open + on page scroll). */
function positionPresetPanel(preset) {
  const dd    = $(`#preset-dd-${preset}`);
  const panel = $(`#preset-ddp-${preset}`);
  if (!dd || !panel) return;
  const rect = dd.getBoundingClientRect();
  // If trigger has scrolled fully out of view, close — no anchor left.
  if (rect.bottom < 0 || rect.top > window.innerHeight) { closePresetDropdown(); return; }
  panel.style.minWidth = Math.max(rect.width, 220) + 'px';
  panel.style.left     = rect.left + 'px';
  const spaceBelow = window.innerHeight - rect.bottom - 8;
  if (spaceBelow >= 120) {
    panel.style.top    = (rect.bottom + 2) + 'px';
    panel.style.bottom = 'auto';
  } else {
    panel.style.bottom = (window.innerHeight - rect.top + 2) + 'px';
    panel.style.top    = 'auto';
  }
}

function openPresetDropdown(preset) {
  hidePresetHoverCard();   // dismiss any lingering hover card before the panel opens
  if (_openDdPreset && _openDdPreset !== preset) closePresetDropdown();
  _openDdPreset = preset;

  const dd    = $(`#preset-dd-${preset}`);
  const panel = $(`#preset-ddp-${preset}`);
  if (!dd || !panel) return;

  positionPresetPanel(preset);
  panel.classList.remove('hidden');
  if (dd.querySelector('.preset-dd-caret')) dd.querySelector('.preset-dd-caret').textContent = '▴';

  const searchEl = panel.querySelector('.preset-dd-search');
  if (searchEl) { searchEl.value = ''; filterPresetDropdown(preset); }

  setTimeout(() => {
    panel.querySelector('.preset-dd-option.active')?.scrollIntoView({ block: 'nearest' });
    searchEl?.focus();
  }, 0);
}

function closePresetDropdown() {
  if (!_openDdPreset) return;
  const panel = $(`#preset-ddp-${_openDdPreset}`);
  const dd    = $(`#preset-dd-${_openDdPreset}`);
  if (panel) panel.classList.add('hidden');
  const caret = dd?.querySelector('.preset-dd-caret');
  if (caret) caret.textContent = '▾';
  _openDdPreset = null;
  hidePresetHoverCard();
}

function filterPresetDropdown(preset) {
  const panel = $(`#preset-ddp-${preset}`);
  if (!panel) return;
  const q = (panel.querySelector('.preset-dd-search')?.value || '').toLowerCase().trim();
  panel.querySelectorAll('.preset-dd-option').forEach(opt => {
    const hit = !q || (opt.dataset.label || '').toLowerCase().includes(q);
    opt.classList.toggle('dd-hidden', !hit);
  });
  // Hide group separators whose entire group is hidden
  panel.querySelectorAll('.preset-dd-sep').forEach(sep => {
    let el  = sep.nextElementSibling;
    let any = false;
    while (el && !el.classList.contains('preset-dd-sep')) {
      if (el.classList.contains('preset-dd-option') && !el.classList.contains('dd-hidden')) { any = true; break; }
      el = el.nextElementSibling;
    }
    sep.classList.toggle('dd-hidden', !any);
  });
}

function focusDdItem(preset, fromEl, dir) {
  const panel = $(`#preset-ddp-${preset}`);
  if (!panel) return;
  const items = [...panel.querySelectorAll('.preset-dd-option:not(.dd-hidden)')];
  if (!items.length) return;
  const idx  = fromEl ? items.indexOf(fromEl) : (dir > 0 ? -1 : items.length);
  items[Math.max(0, Math.min(items.length - 1, idx + dir))]?.focus();
}

/** Populate a preset panel's list — called after cache is loaded. */
function populatePresetDropdown(preset) {
  const panel = $(`#preset-ddp-${preset}`);
  if (!panel) return;
  const list = panel.querySelector('.preset-dd-list');
  if (!list) return;
  list.innerHTML = '';

  // Blank placeholder row
  list.appendChild(makeDdOption(preset, '', PRESET_PLACEHOLDER[preset], null));

  const raw = (preset === 'class' ? presetCache.class
             : preset === 'race'  ? presetCache.race
             :                      presetCache.background) || [];

  const grouped = {};
  raw.forEach(i => { const k = i.document__slug || 'other'; (grouped[k] ||= []).push(i); });
  const keys = Object.keys(grouped).sort((a, b) => {
    const ai = SOURCE_ORDER.indexOf(a), bi = SOURCE_ORDER.indexOf(b);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });

  keys.forEach((k, idx) => {
    if (idx > 0) {
      const sep = document.createElement('div');
      sep.className   = 'preset-dd-sep';
      sep.textContent = `── ${sourceTag(k) || k} ──`;
      list.appendChild(sep);
    }
    grouped[k].sort((a, b) => a.name.localeCompare(b.name)).forEach(item => {
      const tag   = sourceTag(item.document__slug);
      const label = item.name + (tag ? ` [${tag}]` : '');
      list.appendChild(makeDdOption(preset, item.slug, label, item));
      if (preset === 'race') {
        (item.subraces || []).forEach(sr => {
          const srSlug = `${item.slug}:${sr.slug}`;
          const srItem = { ...item, ...sr, name: `${item.name} (${sr.name})`,
                           _baseSlug: item.slug, slug: srSlug };
          list.appendChild(makeDdOption(preset, srSlug,
            `↳ ${sr.name}` + (tag ? ` [${tag}]` : ''), srItem, true));
        });
      }
    });
  });

  list.appendChild(makeDdOption(preset, '__custom__', 'Custom…', null));
  syncPresetDropdown(preset);
}

function populatePresetDropdowns() {
  ['class', 'race', 'background'].forEach(populatePresetDropdown);
}

function makeDdOption(preset, slug, label, item, isSubrace = false) {
  const opt = document.createElement('div');
  opt.className     = 'preset-dd-option' + (isSubrace ? ' preset-dd-sub' : '');
  opt.dataset.slug  = slug;
  opt.dataset.label = item ? item.name : '';  // clean name used for search
  opt.textContent   = label;
  opt.tabIndex      = -1;
  opt.setAttribute('role', 'option');

  if (slug === '__custom__') opt.classList.add('preset-dd-custom');

  // Click → select
  opt.addEventListener('click', e => {
    e.stopPropagation();
    closePresetDropdown();
    pickPreset(preset, slug);
  });

  // Keyboard navigation
  opt.addEventListener('keydown', e => {
    if (e.key === 'Enter')     { e.preventDefault(); opt.click(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); focusDdItem(preset, opt,  1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); focusDdItem(preset, opt, -1); }
    if (e.key === 'Escape') {
      e.preventDefault();
      closePresetDropdown();
      $(`#preset-dd-${preset} .preset-dd-trigger`)?.focus();
    }
  });

  if (!slug || slug === '__custom__' || !item) return opt;

  // Hover → quick-summary card to the right of the row (mouse only — not touch)
  opt.addEventListener('pointerenter', e => {
    if (e.pointerType !== 'mouse') return;
    const html = renderPresetHoverContent(preset, item);
    if (html) showPresetHoverCard(html, opt.getBoundingClientRect(), 'right');
  });
  opt.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hidePresetHoverCard(); });

  // Right-click → close dropdown and open the detail popup
  opt.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
    closePresetDropdown();
    openPresetPopup(preset, slug);
  });

  return opt;
}

function showPresetHoverCard(html, rect, anchor) {
  const card = $('#preset-hover-card');
  card.innerHTML = html;
  card.classList.remove('hidden');
  const cw = card.offsetWidth  || 240;
  const ch = card.offsetHeight || 100;
  if (anchor === 'right') {
    const left = rect.right + 8;
    card.style.left = (left + cw > window.innerWidth  ? rect.left - cw - 4 : left) + 'px';
    const top  = rect.top;
    card.style.top  = (top  + ch > window.innerHeight ? window.innerHeight - ch - 8 : Math.max(4, top)) + 'px';
  } else {  // 'below'
    card.style.left = rect.left + 'px';
    const top = rect.bottom + 6;
    card.style.top  = (top + ch > window.innerHeight ? rect.top - ch - 4 : top) + 'px';
  }
}
function hidePresetHoverCard() { $('#preset-hover-card').classList.add('hidden'); }

/**
 * Handle a pick from the custom dropdown.
 * Mirrors onPresetChange() but called directly without a native <select> event.
 */
function pickPreset(preset, slug) {
  // Keep hidden select value in sync (used by setCustomMode via .closest('.srd-field'))
  const sel = $(`select[data-preset="${preset}"]`);
  if (sel) sel.value = slug || '';

  setCustomMode(preset, slug === '__custom__');

  if (!slug) {
    if (preset === 'class')           clearClass();
    else if (preset === 'race')       clearRace();
    else if (preset === 'background') clearBackground();
  } else if (slug === '__custom__') {
    character[preset + 'Slug'] = '';
    if (preset === 'class') {
      character.subclassSlug = '';
      character.subclass     = '';
      renderClassFeatures();
    }
    if (preset === 'background') applyCustomBackground();
    const input = $(`input[data-bind="${preset}"]`);
    if (input) { input.focus(); input.select?.(); }
    persist();
  } else {
    if (preset === 'class')           applyClass(slug);
    else if (preset === 'race')       applyRace(slug);
    else if (preset === 'background') applyBackground(slug);
  }
}

/** Update the trigger button text + active highlight for one dropdown. */
function syncPresetDropdown(preset) {
  const dd    = $(`#preset-dd-${preset}`);
  const panel = $(`#preset-ddp-${preset}`);
  if (!dd) return;

  const slug    = character[preset + 'Slug'] || '';
  const valueEl = dd.querySelector('.preset-dd-value');

  panel?.querySelectorAll('.preset-dd-option')
        .forEach(o => o.classList.toggle('active', !!slug && o.dataset.slug === slug));

  if (!slug || slug === '__custom__') {
    if (valueEl) valueEl.textContent = PRESET_PLACEHOLDER[preset];
    return;
  }
  const escapedSlug = slug.replace(/:/g, '\\:');   // CSS.escape colon for querySelector
  const opt = panel?.querySelector(`.preset-dd-option[data-slug="${escapedSlug}"]`);
  // Fallback chain: matched panel option → live cache name → saved display name → slug
  const NAME_FIELD = { class: 'class', race: 'race', background: 'background' };
  const savedName  = String(character[NAME_FIELD[preset]] || '').trim();
  if (valueEl) {
    valueEl.textContent = opt ? (opt.dataset.label || opt.textContent.trim())
                              : (getPresetItem(preset, slug)?.name || savedName || slug);
  }
}

function syncPresetDropdowns() {
  ['class', 'race', 'background'].forEach(syncPresetDropdown);
}

// =====================================================================
// Armor / Magic Armor slot dropdowns — share styling with preset-dropdown
// =====================================================================
const ARMOR_SLOTS = ['armorSlot', 'shieldSlot', 'magicArmor1', 'magicArmor2'];
const ARMOR_SLOT_PLACEHOLDER = {
  armorSlot:   'Pick Armor…',
  shieldSlot:  'Pick Shield…',
  magicArmor1: 'Pick Magic Item…',
  magicArmor2: 'Pick Magic Item…',
};
let _openArmorSlot = null;

function buildArmorDropdowns() {
  ARMOR_SLOTS.forEach(slotKey => {
    const host = $(`.armor-slot-field[data-slot="${slotKey}"]`);
    if (!host || host.dataset.built) return;
    host.dataset.built = '1';

    const dd = document.createElement('div');
    dd.className = 'preset-dropdown armor-dd';
    dd.dataset.slot = slotKey;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'preset-dd-trigger';
    btn.innerHTML = `<span class="preset-dd-value">${ARMOR_SLOT_PLACEHOLDER[slotKey]}</span><span class="preset-dd-caret">▾</span>`;
    dd.appendChild(btn);

    const clr = document.createElement('button');
    clr.type = 'button';
    clr.className = 'armor-dd-clear icon-btn';
    clr.title = 'Clear';
    clr.innerHTML = '&times;';
    clr.style.display = 'none';
    dd.appendChild(clr);

    host.appendChild(dd);

    btn.addEventListener('click', e => {
      e.stopPropagation();
      _openArmorSlot === slotKey ? closeArmorDropdown() : openArmorDropdown(slotKey);
    });
    btn.addEventListener('pointerenter', e => {
      if (e.pointerType !== 'mouse') return;   // no hover card on touch/stylus
      const cur = character[slotKey];
      if (!cur) return;
      const html = renderArmorHoverContent(cur);
      if (html) showPresetHoverCard(html, btn.getBoundingClientRect(), 'below');
    });
    btn.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hidePresetHoverCard(); });
    btn.addEventListener('contextmenu', e => {
      e.preventDefault();
      const cur = character[slotKey];
      if (!cur) return;
      closeArmorDropdown();
      openArmorPopup(slotKey, cur);
    });

    clr.addEventListener('click', e => {
      e.stopPropagation();
      pickArmorSlot(slotKey, null);
    });

    const panel = document.createElement('div');
    panel.className = 'preset-dd-panel armor-dd-panel hidden';
    panel.id = `armor-ddp-${slotKey}`;
    panel.dataset.slot = slotKey;
    panel.setAttribute('role', 'listbox');

    const search = document.createElement('input');
    search.type = 'text';
    search.className = 'preset-dd-search';
    search.placeholder = 'Search…';

    const list = document.createElement('div');
    list.className = 'preset-dd-list';

    panel.appendChild(search);
    panel.appendChild(list);
    document.body.appendChild(panel);

    search.addEventListener('input', () => filterArmorDropdown(slotKey));
    search.addEventListener('keydown', e => {
      if (e.key === 'Escape')    { e.preventDefault(); closeArmorDropdown(); btn.focus(); }
      if (e.key === 'ArrowDown') { e.preventDefault(); focusArmorDdItem(slotKey, null, 1); }
    });
  });

  document.addEventListener('click', () => closeArmorDropdown());
  document.addEventListener('scroll', e => {
    if (!_openArmorSlot) return;
    const panel = $(`#armor-ddp-${_openArmorSlot}`);
    if (panel && e.target instanceof Node && panel.contains(e.target)) return;
    positionArmorPanel(_openArmorSlot);
  }, { passive: true, capture: true });
  window.addEventListener('resize', () => {
    if (_openArmorSlot) positionArmorPanel(_openArmorSlot);
  });
}

function positionArmorPanel(slotKey) {
  const dd    = $(`.armor-dd[data-slot="${slotKey}"]`);
  const panel = $(`#armor-ddp-${slotKey}`);
  if (!dd || !panel) return;
  const rect = dd.getBoundingClientRect();
  if (rect.bottom < 0 || rect.top > window.innerHeight) { closeArmorDropdown(); return; }
  panel.style.minWidth = Math.max(rect.width, 280) + 'px';
  panel.style.left     = rect.left + 'px';
  const spaceBelow = window.innerHeight - rect.bottom - 8;
  if (spaceBelow >= 160) {
    panel.style.top    = (rect.bottom + 2) + 'px';
    panel.style.bottom = 'auto';
  } else {
    panel.style.bottom = (window.innerHeight - rect.top + 2) + 'px';
    panel.style.top    = 'auto';
  }
}

function openArmorDropdown(slotKey) {
  if (_openArmorSlot && _openArmorSlot !== slotKey) closeArmorDropdown();
  _openArmorSlot = slotKey;
  const dd    = $(`.armor-dd[data-slot="${slotKey}"]`);
  const panel = $(`#armor-ddp-${slotKey}`);
  if (!dd || !panel) return;
  positionArmorPanel(slotKey);
  panel.classList.remove('hidden');
  const caret = dd.querySelector('.preset-dd-caret');
  if (caret) caret.textContent = '▴';
  const searchEl = panel.querySelector('.preset-dd-search');
  if (searchEl) { searchEl.value = ''; filterArmorDropdown(slotKey); }
  setTimeout(() => {
    panel.querySelector('.preset-dd-option.active')?.scrollIntoView({ block: 'nearest' });
    searchEl?.focus();
  }, 0);
}

function closeArmorDropdown() {
  if (!_openArmorSlot) return;
  const panel = $(`#armor-ddp-${_openArmorSlot}`);
  const dd    = $(`.armor-dd[data-slot="${_openArmorSlot}"]`);
  if (panel) panel.classList.add('hidden');
  const caret = dd?.querySelector('.preset-dd-caret');
  if (caret) caret.textContent = '▾';
  _openArmorSlot = null;
  hidePresetHoverCard();
}

function filterArmorDropdown(slotKey) {
  const panel = $(`#armor-ddp-${slotKey}`);
  if (!panel) return;
  const q = (panel.querySelector('.preset-dd-search')?.value || '').toLowerCase().trim();
  panel.querySelectorAll('.preset-dd-option').forEach(opt => {
    const hit = !q || (opt.dataset.label || '').toLowerCase().includes(q);
    opt.classList.toggle('dd-hidden', !hit);
  });
  panel.querySelectorAll('.preset-dd-sep').forEach(sep => {
    let el  = sep.nextElementSibling;
    let any = false;
    while (el && !el.classList.contains('preset-dd-sep')) {
      if (el.classList.contains('preset-dd-option') && !el.classList.contains('dd-hidden')) { any = true; break; }
      el = el.nextElementSibling;
    }
    sep.classList.toggle('dd-hidden', !any);
  });
}

function focusArmorDdItem(slotKey, fromEl, dir) {
  const panel = $(`#armor-ddp-${slotKey}`);
  if (!panel) return;
  const items = [...panel.querySelectorAll('.preset-dd-option:not(.dd-hidden)')];
  if (!items.length) return;
  const idx = fromEl ? items.indexOf(fromEl) : (dir > 0 ? -1 : items.length);
  items[Math.max(0, Math.min(items.length - 1, idx + dir))]?.focus();
}

function populateArmorDropdown(slotKey) {
  const panel = $(`#armor-ddp-${slotKey}`);
  if (!panel) return;
  const list = panel.querySelector('.preset-dd-list');
  if (!list) return;
  list.innerHTML = '';

  list.appendChild(makeArmorDdOption(slotKey, null, ARMOR_SLOT_PLACEHOLDER[slotKey]));

  const isShieldCat = c => /shield/i.test(String(c || ''));

  if (slotKey === 'armorSlot') {
    // Group mundane armor by category (Light / Medium / Heavy) — shields handled in their own slot.
    const groups = {};
    (presetCache.armor || []).forEach(a => {
      if (isShieldCat(a.category)) return;
      const cat = a.category || 'Armor';
      (groups[cat] ||= []).push(a);
    });
    const norm = s => s.toLowerCase().replace(/\s+armor$/, '').trim();
    const order = ['light', 'medium', 'heavy'];
    const keys  = Object.keys(groups).sort((a, b) => {
      const ai = order.indexOf(norm(a));
      const bi = order.indexOf(norm(b));
      return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
    });
    keys.forEach(k => {
      const sep = document.createElement('div');
      sep.className = 'preset-dd-sep';
      sep.textContent = `── ${k} ──`;
      list.appendChild(sep);
      groups[k].sort((a, b) => a.name.localeCompare(b.name)).forEach(a => {
        const item = { kind: 'armor', slug: a.slug, source: a.document__slug, name: a.name, raw: a };
        list.appendChild(makeArmorDdOption(slotKey, item, a.name));
      });
    });

    // Magic-armor replacements (Bracers of Defense, Robe of Archmagi, etc.)
    const repl = (presetCache.magicitems || [])
      .map(mi => ({ mi, p: parseMagicItemAC(mi) }))
      .filter(x => x.p && x.p.kind === 'magic-armor');
    if (repl.length) {
      const sep = document.createElement('div');
      sep.className = 'preset-dd-sep';
      sep.textContent = `── Magic Armor ──`;
      list.appendChild(sep);
      repl.sort((a, b) => a.mi.name.localeCompare(b.mi.name)).forEach(({ mi, p }) => {
        const item = { kind: 'magic-armor', slug: mi.slug, source: mi.document__slug, name: mi.name, formula: p.formula, raw: mi };
        list.appendChild(makeArmorDdOption(slotKey, item, mi.name));
      });
    }
  } else if (slotKey === 'shieldSlot') {
    // Mundane shields from open5e armor endpoint
    (presetCache.armor || [])
      .filter(a => isShieldCat(a.category))
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(a => {
        const item = { kind: 'shield', slug: a.slug, source: a.document__slug, name: a.name, raw: a };
        const bonus = shieldBonus(item);
        list.appendChild(makeArmorDdOption(slotKey, item, `${a.name} (${fmtMod(bonus)} AC)`));
      });
  } else {
    // Magic item slots — flat AC bonus items only
    const flats = (presetCache.magicitems || [])
      .map(mi => ({ mi, p: parseMagicItemAC(mi) }))
      .filter(x => x.p && x.p.kind === 'flat');
    flats.sort((a, b) => a.mi.name.localeCompare(b.mi.name)).forEach(({ mi, p }) => {
      const item = { kind: 'magic-flat', slug: mi.slug, source: mi.document__slug, name: mi.name, acBonus: p.acBonus, raw: mi };
      list.appendChild(makeArmorDdOption(slotKey, item, `${mi.name} (${fmtMod(p.acBonus)} AC)`));
    });
  }

  syncArmorDropdown(slotKey);
}

function populateArmorDropdowns() {
  ARMOR_SLOTS.forEach(populateArmorDropdown);
}

function makeArmorDdOption(slotKey, item, label) {
  const opt = document.createElement('div');
  opt.className = 'preset-dd-option';
  opt.dataset.slug  = item ? item.slug : '';
  opt.dataset.label = item ? item.name : '';
  opt.textContent   = label;
  opt.tabIndex      = -1;
  opt.setAttribute('role', 'option');

  opt.addEventListener('click', e => {
    e.stopPropagation();
    closeArmorDropdown();
    pickArmorSlot(slotKey, item);
  });
  opt.addEventListener('keydown', e => {
    if (e.key === 'Enter')     { e.preventDefault(); opt.click(); }
    if (e.key === 'ArrowDown') { e.preventDefault(); focusArmorDdItem(slotKey, opt,  1); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); focusArmorDdItem(slotKey, opt, -1); }
    if (e.key === 'Escape') {
      e.preventDefault();
      closeArmorDropdown();
      $(`.armor-dd[data-slot="${slotKey}"] .preset-dd-trigger`)?.focus();
    }
  });

  if (!item) return opt;

  opt.addEventListener('pointerenter', e => {
    if (e.pointerType !== 'mouse') return;
    const html = renderArmorHoverContent(item);
    if (html) showPresetHoverCard(html, opt.getBoundingClientRect(), 'right');
  });
  opt.addEventListener('pointerleave', e => { if (e.pointerType === 'mouse') hidePresetHoverCard(); });

  opt.addEventListener('contextmenu', e => {
    e.preventDefault();
    e.stopPropagation();
    closeArmorDropdown();
    openArmorPopup(slotKey, item);
  });

  return opt;
}

function pickArmorSlot(slotKey, item) {
  character[slotKey] = item;
  // Note: we intentionally preserve `acOverride` across armor changes so that
  // any homebrew/class-feature bonus (e.g. Monk unarmored defense) persists.
  // Right-click the AC input to reset the override.
  syncArmorDropdown(slotKey);
  applyArmorAC();
  persist();
}

function syncArmorDropdown(slotKey) {
  const dd = $(`.armor-dd[data-slot="${slotKey}"]`);
  if (!dd) return;
  const panel   = $(`#armor-ddp-${slotKey}`);
  const valueEl = dd.querySelector('.preset-dd-value');
  const clearEl = dd.querySelector('.armor-dd-clear');
  const cur = character[slotKey];

  panel?.querySelectorAll('.preset-dd-option').forEach(o => {
    o.classList.toggle('active', !!cur && o.dataset.slug === cur.slug);
  });

  if (!cur) {
    if (valueEl) valueEl.textContent = ARMOR_SLOT_PLACEHOLDER[slotKey];
    if (clearEl) clearEl.style.display = 'none';
  } else {
    let label = cur.name;
    if (slotKey === 'armorSlot') {
      const enh = clampArmorEnhancement(character.armorEnhancement);
      if (enh > 0) label += ` +${enh}`;
    }
    if (valueEl) valueEl.textContent = label;
    if (clearEl) clearEl.style.display = '';
  }
}

function syncArmorDropdowns() {
  ARMOR_SLOTS.forEach(syncArmorDropdown);
}

function renderArmorHoverContent(item) {
  if (!item) return '';
  const r = item.raw || {};
  const lines = [];
  if (item.kind === 'armor') {
    if (r.category) lines.push(`<b>${escapeHTML(r.category)}</b>`);
    if (r.ac_string || r.base_ac) lines.push(`AC: <b>${escapeHTML(r.ac_string || String(r.base_ac))}</b>`);
    if (r.strength_requirement) lines.push(`Str req: ${r.strength_requirement}`);
    if (r.stealth_disadvantage) lines.push(`Disadvantage on Stealth`);
    if (r.cost)   lines.push(`Cost: ${escapeHTML(r.cost)}`);
    if (r.weight) lines.push(`Weight: ${escapeHTML(String(r.weight))}`);
  } else if (item.kind === 'shield') {
    lines.push(`<b>Shield</b>`);
    lines.push(`AC bonus: <b>${fmtMod(shieldBonus(item))}</b>`);
    if (r.cost)   lines.push(`Cost: ${escapeHTML(r.cost)}`);
    if (r.weight) lines.push(`Weight: ${escapeHTML(String(r.weight))}`);
  } else if (item.kind === 'magic-armor') {
    const head = (r.type || 'Magic Armor') + (r.rarity ? ' • ' + r.rarity : '');
    lines.push(`<b>${escapeHTML(head)}</b>`);
    const f = item.formula || {};
    const cap = (f.maxDex == null) ? null : Number(f.maxDex);
    const dexBit = f.addDex ? ` + Dex${cap != null ? ` (max ${cap})` : ''}` : '';
    lines.push(`AC: <b>${f.base}${dexBit}</b> (replaces armor)`);
    if (r.requires_attunement) lines.push(`Attunement: ${escapeHTML(r.requires_attunement)}`);
  } else if (item.kind === 'magic-flat') {
    const head = (r.type || 'Wondrous Item') + (r.rarity ? ' • ' + r.rarity : '');
    lines.push(`<b>${escapeHTML(head)}</b>`);
    lines.push(`AC bonus: <b>${fmtMod(item.acBonus)}</b>`);
    if (r.requires_attunement) lines.push(`Attunement: ${escapeHTML(r.requires_attunement)}`);
  }
  if (!lines.length) return '';
  return `<div class="phc-name">${escapeHTML(item.name)}</div>` +
    lines.map(l => `<div class="phc-line">${l}</div>`).join('');
}

function armorOpen5eUrl(item) {
  const r = item.raw || {};
  const prefix = docSlugToUrlPrefix(r.document__slug || item.source);
  const slug   = item.slug || r.slug || '';
  const path   = (item.kind === 'armor') ? 'armor' : 'magicitems';
  return `https://open5e.com/${path}/${encodeURIComponent(prefix + '_' + slug)}`;
}

function openArmorPopup(slotKey, item) {
  if (!item) return;
  $('#preset-popup-title').textContent = item.name;
  const content = $('#preset-popup-content');
  content.innerHTML = renderArmorPopupContent(slotKey, item);
  $('#preset-popup-overlay').classList.remove('hidden');
  content.querySelector('.armor-popup-apply')?.addEventListener('click', () => {
    $('#preset-popup-overlay').classList.add('hidden');
    pickArmorSlot(slotKey, item);
  });
}

function renderArmorPopupContent(slotKey, item) {
  const r = item.raw || {};
  let html = '';
  if (item.kind === 'armor' || item.kind === 'shield') {
    if (r.category) html += `<div class="spell-detail-line"><b>Category:</b> ${escapeHTML(r.category)}</div>`;
    if (item.kind === 'shield') {
      html += `<div class="spell-detail-line"><b>AC bonus:</b> ${fmtMod(shieldBonus(item))}</div>`;
    } else if (r.ac_string || r.base_ac) {
      html += `<div class="spell-detail-line"><b>AC:</b> ${escapeHTML(r.ac_string || String(r.base_ac))}</div>`;
    }
    if (r.strength_requirement) html += `<div class="spell-detail-line"><b>Strength req:</b> ${r.strength_requirement}</div>`;
    if (r.stealth_disadvantage) html += `<div class="spell-detail-line"><b>Stealth:</b> Disadvantage</div>`;
    if (r.cost)   html += `<div class="spell-detail-line"><b>Cost:</b> ${escapeHTML(r.cost)}</div>`;
    if (r.weight) html += `<div class="spell-detail-line"><b>Weight:</b> ${escapeHTML(String(r.weight))}</div>`;
    if (r.desc)   html += `<div class="spell-detail-desc">${escapeHTML(r.desc)}</div>`;
  } else {
    if (r.type)   html += `<div class="spell-detail-line"><b>Type:</b> ${escapeHTML(r.type)}</div>`;
    if (r.rarity) html += `<div class="spell-detail-line"><b>Rarity:</b> ${escapeHTML(r.rarity)}</div>`;
    if (r.requires_attunement) html += `<div class="spell-detail-line"><b>Attunement:</b> ${escapeHTML(r.requires_attunement)}</div>`;
    if (item.kind === 'magic-armor') {
      const f = item.formula || {};
      const cap = (f.maxDex == null) ? null : Number(f.maxDex);
      const dexBit = f.addDex ? ` + Dex${cap != null ? ` (max ${cap})` : ''}` : '';
      html += `<div class="spell-detail-line"><b>AC:</b> ${f.base}${dexBit} <span style="color:var(--text-dim)">(replaces armor)</span></div>`;
    } else {
      html += `<div class="spell-detail-line"><b>AC bonus:</b> ${fmtMod(item.acBonus)}</div>`;
    }
    if (r.desc) html += `<div class="spell-detail-desc">${escapeHTML(r.desc)}</div>`;
  }
  const url = armorOpen5eUrl(item);
  const equipped = character[slotKey]?.slug === item.slug;
  html += `
    <div class="spell-detail-link"><a href="${url}" target="_blank" rel="noopener">View on open5e &#x2197;</a></div>
    <div style="margin-top:10px"><button class="btn btn-sm armor-popup-apply"${equipped ? ' disabled' : ''}>${equipped ? 'Already Equipped' : 'Equip'}</button></div>
  `;
  return html;
}

function renderSpells() {
  const tbody = $('#spells-tbody');
  tbody.innerHTML = '';
  // Sort by level then name (empty-name entries — i.e. newly added rows — go to the bottom of their level group)
  const order = character.spells
    .map((s, i) => ({ s, i }))
    .sort((a, b) => {
      if (a.s.level !== b.s.level) return a.s.level - b.s.level;
      const aEmpty = !(a.s.name && a.s.name.trim());
      const bEmpty = !(b.s.name && b.s.name.trim());
      if (aEmpty && !bEmpty) return 1;
      if (!aEmpty && bEmpty) return -1;
      return (a.s.name || '').localeCompare(b.s.name || '');
    });

  order.forEach(({ s, i }) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <select data-spell="${i}" data-field="level" style="width:50px">
          ${[0,1,2,3,4,5,6,7,8,9].map(l => `<option value="${l}" ${s.level===l?'selected':''}>${l===0?'C':l}</option>`).join('')}
        </select>
      </td>
      <td>
        <div class="spell-name-cell">
          <input type="text" value="${escapeAttr(s.name || '')}" data-spell="${i}" data-field="name">
          ${(() => {
            const matches = findCachedSpells(s.name);
            if (!matches.length) return '';
            const tip = matches.length > 1
              ? `${matches[0].name} — ${matches.length} editions (${matches.map(m => editionLabelForDoc(spellDocKey(m))).join(', ')})`
              : `${matches[0].name} rules`;
            return `<button type="button" class="spell-link" data-spell-name="${escapeAttr(s.name)}" data-spell-idx="${i}" title="${escapeAttr(tip)}">&#x2197;${matches.length > 1 ? `<span class="spell-link-count">${matches.length}</span>` : ''}</button>`;
          })()}
        </div>
        ${s.notes ? `<div style="font-size:0.75rem;color:var(--text-dim);margin-top:2px">${escapeHTML(s.notes)}</div>` : ''}
      </td>
      <td style="text-align:center" class="spell-prep-cell">
        <input type="checkbox" data-spell="${i}" data-field="prepared" ${(s.prepared || s.alwaysPrepared)?'checked':''} ${s.alwaysPrepared?'disabled':''} title="${s.alwaysPrepared?'Always prepared — toggle the star to change':'Mark as prepared today'}">
        <button type="button" class="spell-always-toggle ${s.alwaysPrepared?'active':''}" data-spell-always="${i}" title="Always prepared (e.g., Domain/Oath/Circle spell). Doesn't count toward the prepared cap.">${s.alwaysPrepared?'★':'☆'}</button>
      </td>
      <td><button class="icon-btn" data-spell-del="${i}" title="Remove">&times;</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('[data-spell]').forEach(inp => {
    inp.addEventListener('change', e => {
      const i = Number(e.target.dataset.spell);
      const field = e.target.dataset.field;
      let val = e.target.value;
      if (e.target.type === 'checkbox') val = e.target.checked;
      else if (field === 'level') val = Number(val);
      character.spells[i][field] = val;
      // When the user manually types a spell name that matches an SRD-cached
      // spell, auto-fill level + notes from the highest-priority edition. The
      // user can still override the level after by changing the dropdown.
      if (field === 'name') {
        applySpellAutofill(character.spells[i]);
      }
      if (field === 'level' || field === 'name') {
        renderSpells();
        renderSpellPicksCounters();
      } else if (field === 'prepared') {
        // Prepared toggle affects the counter for prepared-casters.
        renderSpellPicksCounters();
      }
    });
  });
  tbody.querySelectorAll('button[data-spell-del]').forEach(btn => {
    btn.addEventListener('click', e => {
      character.spells.splice(Number(e.target.dataset.spellDel), 1);
      renderSpells();
      renderSpellPicksCounters();
    });
  });
  tbody.querySelectorAll('button[data-spell-always]').forEach(btn => {
    btn.addEventListener('click', e => {
      const i = Number(e.currentTarget.dataset.spellAlways);
      const s = character.spells[i];
      if (!s) return;
      s.alwaysPrepared = !s.alwaysPrepared;
      if (s.alwaysPrepared) s.prepared = true;   // always-prepared implies prepared
      renderSpells();
      renderSpellPicksCounters();
      persist();
    });
  });
  tbody.querySelectorAll('button.spell-link').forEach(btn => {
    btn.addEventListener('click', () => openSpellPopup(btn.dataset.spellName, Number(btn.dataset.spellIdx)));
  });
}

function escapeAttr(s) { return String(s).replace(/"/g, '&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escapeHTML(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

// Sync inputs (data-bind) <-> character
// Normalize old full-name alignment values to abbreviations
const ALIGN_NORM = {
  'Lawful Good':'LG','Lawful Neutral':'LN','Lawful Evil':'LE',
  'Neutral Good':'NG','True Neutral':'TN','Neutral Evil':'NE',
  'Chaotic Good':'CG','Chaotic Neutral':'CN','Chaotic Evil':'CE',
};
const ALIGN_LABELS = {
  LG:'Lawful Good',LN:'Lawful Neutral',LE:'Lawful Evil',
  NG:'Neutral Good',TN:'True Neutral',NE:'Neutral Evil',
  CG:'Chaotic Good',CN:'Chaotic Neutral',CE:'Chaotic Evil',
};
function syncAlignmentGrid() {
  if (ALIGN_NORM[character.alignment]) character.alignment = ALIGN_NORM[character.alignment];
  const val = character.alignment || '';
  $$('#alignment-grid .ag-btn').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.align === val);
  });
  const display = $('#align-display');
  if (display) display.textContent = val ? `${val} — ${ALIGN_LABELS[val] || val}` : '—';
}

function autoResizeTextarea(el) {
  if (!el || el.tagName !== 'TEXTAREA') return;
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}

function applyBindingsToInputs() {
  $$('[data-bind]').forEach(el => {
    const key = el.dataset.bind;
    if (!(key in character)) return;
    const val = character[key];
    if (el.type === 'checkbox') el.checked = !!val;
    else el.value = val ?? '';
    if (el.tagName === 'TEXTAREA') {
      autoResizeTextarea(el);
      // Keep the adjacent Markup preview in sync (if one exists yet)
      const preview = el.nextElementSibling;
      if (preview && preview.classList && preview.classList.contains('markup-preview')) {
        preview.innerHTML = renderMarkdown(el.value);
      }
    }
  });
  syncAlignmentGrid();
}
function attachBindings() {
  $$('[data-bind]').forEach(el => {
    const evt = (el.tagName === 'SELECT' || el.type === 'checkbox') ? 'change' : 'input';
    if (el.tagName === 'TEXTAREA') {
      el.addEventListener('input', () => autoResizeTextarea(el));
    }
    el.addEventListener(evt, () => {
      const key = el.dataset.bind;
      let val = el.value;
      if (el.type === 'checkbox') val = el.checked;
      else if (el.type === 'number') val = Number(val);
      character[key] = val;

      if (key === 'level' || key === 'hitDie' || key === 'autoHP') {
        if (key === 'level') {
          // Auto-apply any subclass skill grants that just unlocked.
          const granted = applyUnlockedSubclassGrants();
          if (granted.length) {
            const names = granted.map(k => allSkills().find(s => s.key === k)?.name || k).join(', ');
            toast(`Level up — auto-set ${names}`);
          }
        }
        // Just turned autoHP ON → infer override from the current hpMax so the
        // user's chosen value is preserved when the computed value differs.
        if (key === 'autoHP' && character.autoHP) {
          character.hpMaxOverride = (Number(character.hpMax) || 0) - computeAutoMaxHP();
        }
        if (key === 'level' || key === 'hitDie') recalcHitDiceForLevel();
        if (key === 'level') applySubclassPools(); // level may unlock new subclass pools
        recalcHPIfAuto();
        applyBindingsToInputs();
        renderAll();
      } else if (key === 'spellAbility') {
        renderSpellcasting();
      } else if (key === 'cantripsKnown' || key === 'cantripsBonus' ||
                 key === 'spellsKnown'   || key === 'spellsBonus') {
        // Known might be locked, but bonus always editable — either triggers a refresh
        renderSpellcasting();
        renderSpells();
      } else if (key === 'hpMax') {
        // With autoHP on, an entered value back-computes the override (parallel to AC).
        // With autoHP off, the value IS the user's chosen max HP.
        if (character.autoHP) {
          const entered  = Number(val) || 0;
          const computed = computeAutoMaxHP();
          character.hpMaxOverride = entered - computed;
        } else {
          character.hpMaxOverride = 0;
        }
        applyHPMaxDeviation();
        renderCombat();
      } else if (key === 'hpCurrent') {
        renderCombat();
      } else if (key === 'speed') {
        applySpeedDeviation();
      } else if (key === 'ac') {
        // User typed/stepped a new final AC value. Back-compute the override
        // so picking new armor later re-derives the total cleanly.
        const entered  = Number(val) || 0;
        const computed = computeArmorAC();
        character.acOverride = entered - computed;
        applyACDeviation();
      }
    });
  });
}

// Wire the +/− buttons that step character.armorEnhancement (0–10).
function wireArmorEnhancement() {
  const valEl = $('#armor-enhance-val');
  const dn    = $('#armor-enhance-dn');
  const up    = $('#armor-enhance-up');
  if (!valEl || !dn || !up) return;
  const stepBy = delta => {
    const next = clampArmorEnhancement((Number(character.armorEnhancement) || 0) + delta);
    if (next === character.armorEnhancement) return;
    character.armorEnhancement = next;
    applyArmorEnhancementDisplay();
    syncArmorDropdown('armorSlot');
    applyArmorAC();
    persist();
  };
  dn.addEventListener('click', () => stepBy(-1));
  up.addEventListener('click', () => stepBy( 1));
}

/** Refresh the "+N" readout next to the armor slot from character state. */
function applyArmorEnhancementDisplay() {
  const valEl = $('#armor-enhance-val');
  if (!valEl) return;
  const n = clampArmorEnhancement(character.armorEnhancement);
  valEl.textContent = `+${n}`;
}

// Wire the AC input's right-click reset (override → 0). The +/- buttons and
// typed values are handled by the generic stepper + the data-bind handler.
function wireAC() {
  const inp = $('input[data-bind="ac"]');
  if (!inp) return;
  inp.addEventListener('contextmenu', e => {
    e.preventDefault();
    if ((Number(character.acOverride) || 0) === 0) return;
    character.acOverride = 0;
    applyArmorAC();
    persist();
  });
}

// Right-click on HP Max resets the override (only meaningful when autoHP is on).
function wireHPMax() {
  const inp = $('#hp-max-input');
  if (!inp) return;
  inp.addEventListener('contextmenu', e => {
    e.preventDefault();
    if (!character.autoHP) return;
    if ((Number(character.hpMaxOverride) || 0) === 0) return;
    character.hpMaxOverride = 0;
    recalcHPIfAuto();
    applyBindingsToInputs();
    renderCombat();
    applyHPMaxDeviation();
    persist();
  });
}

// Wire the Initiative input + −/+ buttons.
// The user edits a final value; we back-compute the override = entered − computed.
// Right-click on the input resets the override to 0 (= "use computed value").
function wireInitiative() {
  const inp = $('#initiative');
  const dn  = $('#init-down');
  const up  = $('#init-up');
  if (!inp) return;

  const stepBy = (delta) => {
    character.initiativeBonus = (Number(character.initiativeBonus) || 0) + delta;
    renderCombat();
    persist();
  };
  dn?.addEventListener('click', () => stepBy(-1));
  up?.addEventListener('click', () => stepBy( 1));

  // Treat the value the user types as the desired final total; derive the override.
  const commit = () => {
    const raw = (inp.value || '').trim().replace(/^\+/, '');
    if (raw === '' || raw === '-' || isNaN(Number(raw))) {
      renderCombat();    // restore previous value
      return;
    }
    const entered  = Number(raw);
    const dex      = abilityMod(totalAbility('dex'));
    const computed = dex + autoInitiativeBonus();
    character.initiativeBonus = entered - computed;
    renderCombat();
    persist();
  };
  inp.addEventListener('blur',    commit);
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); inp.blur(); }
    if (e.key === 'Escape') { renderCombat(); inp.blur(); }
  });
  // Right-click → reset override
  inp.addEventListener('contextmenu', e => {
    e.preventDefault();
    if ((Number(character.initiativeBonus) || 0) === 0) return;
    character.initiativeBonus = 0;
    renderCombat();
    persist();
  });
}

// Wire the +/- buttons that step a [data-bind] number input by data-dir.
// The buttons dispatch a synthetic 'input' event so the existing data-bind
// handler updates state, persists, and refreshes deviation flags.
function wireGenericSteppers() {
  $$('.stepper-btn[data-step-target], .stepper-btn[data-step-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = Number(btn.dataset.dir) || 0;
      const inp = btn.dataset.stepTarget
        ? $(`input[data-bind="${btn.dataset.stepTarget}"]`)
        : $(`#${btn.dataset.stepId}`);
      if (!inp) return;
      const cur  = Number(inp.value) || 0;
      const min  = inp.dataset.stepMin != null ? Number(inp.dataset.stepMin) : 0;
      const max  = inp.dataset.stepMax != null ? Number(inp.dataset.stepMax) : Infinity;
      const next = Math.max(min, Math.min(max, cur + dir));
      if (next === cur) return;
      inp.value = next;
      inp.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
}

function applyAutoHPLock() {
  const inp = $('#hp-max-input');
  if (!inp) return;
  // Always editable. When autoHP is on, the input shows computed + override;
  // edits (typed or +/−) feed back as override delta. Highlight when deviating.
  inp.readOnly = false;
  inp.classList.remove('locked');
  applyHPMaxDeviation();
}

/** Highlight HP Max input when override ≠ 0 and autoHP is on, like AC's deviation. */
function applyHPMaxDeviation() {
  const inp = $('#hp-max-input');
  if (!inp) return;
  const ovr = Number(character.hpMaxOverride) || 0;
  if (character.autoHP) {
    const computed = computeAutoMaxHP();
    inp.classList.toggle('hb-deviation', ovr !== 0);
    inp.title = ovr === 0
      ? `Auto: ${computed} (from level, hit die, CON)`
      : `Auto ${computed} ${fmtMod(ovr)} manual = ${computed + ovr}. Right-click to reset.`;
  } else {
    inp.classList.remove('hb-deviation');
    inp.title = '';
  }
}

// Returns the hit-die slug ("d8", "d10", …) the API expects for the current class.
function classExpectedHitDie() {
  if (!character.classSlug) return null;
  const c = getClassData();
  if (!c || !c.hit_dice) return null;
  const m = String(c.hit_dice).match(/d\d+/);
  return m ? m[0] : null;
}

// Flag the Speed input when the current speed doesn't match the race's default.
function applySpeedDeviation() {
  const inp = $('input[data-bind="speed"]');
  if (!inp) return;
  const base = Number(character.baseSpeed) || 0;
  const cur  = Number(character.speed)     || 0;
  if (base && cur !== base) {
    inp.classList.add('hb-deviation');
    inp.title = `Non-standard speed (race default: ${base} ft)`;
  } else {
    inp.classList.remove('hb-deviation');
    inp.title = '';
  }
}

// Apply / remove the homebrew-deviation flag on the hit-die selector
function applyHitDieDeviation() {
  const sel = $('#hit-die-select');
  if (!sel) return;
  const expected = classExpectedHitDie();
  if (expected && expected !== character.hitDie) {
    sel.classList.add('hb-deviation');
    const c = getClassData();
    sel.title = `Non-standard for ${c?.name || 'this class'} (class hit die: ${expected})`;
  } else {
    sel.classList.remove('hb-deviation');
    sel.title = '';
  }
}

function renderAll() {
  recalcHPIfAuto();
  renderAbilities();
  renderSaves();
  renderSkills();
  renderPassive();
  renderCombat();
  renderSpellcasting();
  renderAttacks();
  renderSpells();
  renderClassFeatures();
  renderFeats();
  renderResourcePools();
  applyBindingsToInputs();
  applyAutoHPLock();
  applyHitDieDeviation();
  applySpeedDeviation();
  applyArmorEnhancementDisplay();
  applyArmorAC();
  syncArmorDropdowns();
  syncPresetSelections();
  syncPresetDropdowns();
  syncPresetLinks();
  refreshCustomModes();
}

// ====================================================================
// Class features — parsed from the SRD `table` + `desc` fields
// ====================================================================
function parseFeatureTable(tableMd) {
  if (!tableMd) return {};
  const lines = tableMd.split('\n').filter(l => l.includes('|'));
  if (lines.length < 2) return {};
  const header = lines[0].split('|').map(s => s.trim());
  const featuresCol = header.findIndex(h => /features?/i.test(h));
  const levelCol    = header.findIndex(h => /^level$/i.test(h));
  if (featuresCol < 0 || levelCol < 0) return {};
  const out = {};
  for (let i = 1; i < lines.length; i++) {
    const cells = lines[i].split('|').map(s => s.trim());
    // skip separator rows like |---|---|
    if (cells.every(c => /^-+$|^$/.test(c))) continue;
    const lvlText = cells[levelCol] || '';
    const m = lvlText.match(/\d+/);
    if (!m) continue;
    const lvl = Number(m[0]);
    if (lvl < 1 || lvl > 20) continue;
    const cell = cells[featuresCol] || '';
    const features = cell.split(',')
      .map(s => s.trim())
      .filter(s => s && s !== '-' && s !== '—');
    if (features.length) out[lvl] = features;
  }
  return out;
}

function parseFeatureDescs(descMd) {
  if (!descMd) return {};
  const out = {};
  // Split on lines beginning with "### " (level-3 headers) only.
  const parts = descMd.split(/\r?\n###\s+/);
  // The first part may have leading "### " on its first line.
  parts.forEach((part, i) => {
    let chunk = part;
    if (i === 0 && chunk.startsWith('### ')) chunk = chunk.slice(4);
    const nl = chunk.indexOf('\n');
    if (nl < 0) return;
    const name = chunk.slice(0, nl).trim();
    const body = chunk.slice(nl + 1).trim();
    if (!name) return;
    // Strip basic markdown: ####, **, _, leading >
    const cleaned = body
      .replace(/^####\s+(.+)$/gm, '— $1 —')
      .replace(/\*\*/g, '')
      .replace(/\\_/g, '_')
      .replace(/\\\./g, '.');
    if (!out[name]) out[name] = cleaned;
  });
  return out;
}

function parseSubclassFeatures(descMd) {
  // Subclass descs use ##### headers per feature. Returns [{name, body, level}].
  if (!descMd) return [];
  const parts = descMd.split(/\r?\n#####\s+/);
  const out = [];
  for (let i = 0; i < parts.length; i++) {
    if (i === 0) continue; // intro/lore before first header
    const chunk = parts[i];
    const nl = chunk.indexOf('\n');
    if (nl < 0) continue;
    const name = chunk.slice(0, nl).trim();
    const body = chunk.slice(nl + 1).trim();
    if (!name) continue;
    const lvl = extractFeatureLevel(body) || 3;
    out.push({ name, body: stripMarkdown(body), level: lvl });
  }
  return out;
}

function extractSubclassSkillChoiceCount(text) {
  if (!text) return 0;
  const m = text.match(/(one|two|three|four|five|six)\s+(?:other\s+)?skills?\s+of\s+your\s+choice/i);
  return m ? (NUM_WORD[m[1].toLowerCase()] || 0) : 0;
}

function applyUnlockedSubclassGrants() {
  // Auto-apply skill proficiencies from any subclass feature whose level
  // is <= the current character level. Safe to call repeatedly.
  if (!character.subclassSlug || !character.classSlug) return [];
  const c = getClassData();
  if (!c) return [];
  const sub = (c.archetypes || []).find(a => a.slug === character.subclassSlug);
  if (!sub) return [];
  const charLevel = Math.max(1, Math.min(20, Number(character.level) || 1));
  const granted = new Set();
  const fixedSkills = new Set();
  let choiceCount = 0;
  parseSubclassFeatures(sub.desc).forEach(f => {
    if (f.level > charLevel) return;
    extractSkillGrants(f.body).forEach(k => {
      fixedSkills.add(k);
      const had = character.skills[k] && character.skills[k].prof;
      ensureSkillProf(k, 'subclass');
      if (!had) granted.add(k);
    });
    choiceCount += extractSubclassSkillChoiceCount(f.body);
  });
  character.subclassFixedSkills = Array.from(fixedSkills);
  // Handle skill picks (e.g. "two other skills of your choice") — open modal once
  if (choiceCount > 0 && !character.subclassSkillPicked) {
    character.subclassSkillCount   = choiceCount;
    character.subclassSkillOptions = 'any';
    character.subclassSkillPicked  = true;
    const subName = sub.name;
    openSkillChoiceModal({
      title: `${subName}: choose ${choiceCount} skill${choiceCount > 1 ? 's' : ''}`,
      summary: `${subName} grants proficiency in ${choiceCount} skill${choiceCount > 1 ? 's' : ''} of your choice.`,
      count: choiceCount,
      options: SKILLS.map(s => s.name),
      onApply: chosen => {
        chosen.forEach(n => { const sk = findSkill(n); if (sk) ensureSkillProf(sk.key, 'subclass-pick'); });
        renderAll();
        persist();
      }
    });
  }
  return Array.from(granted);
}

function extractFeatureLevel(text) {
  if (!text) return null;
  // Match phrases like "at 3rd level", "Starting at 6th level", "When you reach 14th level"
  const m = text.match(/(\d+)\s*(?:st|nd|rd|th)\s+level/i);
  return m ? Math.max(1, Math.min(20, Number(m[1]))) : null;
}

function findFeatureDesc(featureName, descs) {
  if (descs[featureName]) return descs[featureName];
  // Try without parenthetical suffix, e.g. "Bardic Inspiration (d6)" -> "Bardic Inspiration"
  const base = featureName.replace(/\s*\([^)]*\)\s*$/, '').trim();
  if (descs[base]) return descs[base];
  // Try case-insensitive
  const lower = base.toLowerCase();
  for (const k of Object.keys(descs)) {
    if (k.toLowerCase() === lower) return descs[k];
  }
  return '';
}

function renderClassFeatures() {
  const wrap = $('#class-features-wrap');
  if (!wrap) return;
  const slug = character.classSlug;
  if (!slug) {
    wrap.innerHTML = '<p class="srd-hint">Pick a class to see its features (Custom classes show no auto features).</p>';
    return;
  }
  const c = getClassData();
  if (!c) {
    wrap.innerHTML = `<p class="srd-hint">Class data for "${escapeHTML(character.class)}" not yet loaded.</p>`;
    return;
  }
  const byLevel = parseFeatureTable(c.table);
  const descs = parseFeatureDescs(c.desc);
  const charLevel = Math.max(1, Math.min(20, Number(character.level) || 1));

  // Subclass picker
  const archetypes = c.archetypes || [];
  const subtypeLabel = c.subtypes_name || 'Subclass';
  let subclassHtml = '';
  if (archetypes.length) {
    const opts = archetypes
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map(a => {
        // Supplement entries prefer the user-provided sourceLabel (e.g. "PHB").
        const tag = a._fromSupplement
          ? (a._supplementMeta?.sourceLabel || 'Custom')
          : sourceTag(a.document__slug);
        const tagStr = tag ? ` [${tag}]` : '';
        return `<option value="${escapeAttr(a.slug)}" ${a.slug === character.subclassSlug ? 'selected' : ''}>${escapeHTML(a.name)}${tagStr}</option>`;
      })
      .join('');
    subclassHtml = `
      <div class="subclass-row">
        <label>${escapeHTML(subtypeLabel)}:</label>
        <select id="subclass-select">
          <option value="">— none —</option>
          <option value="__custom__">Custom…</option>
          ${opts}
        </select>
      </div>
    `;
  }

  // Subclass features (if any chosen)
  const sub = character.subclassSlug ? archetypes.find(a => a.slug === character.subclassSlug) : null;
  const subFeatures = sub ? parseSubclassFeatures(sub.desc) : [];

  // Build merged rows: { level, name, locked, desc, isSub }
  const rows = [];
  for (let lvl = 1; lvl <= 20; lvl++) {
    (byLevel[lvl] || []).forEach(f => {
      rows.push({
        level: lvl,
        name: f,
        desc: findFeatureDesc(f, descs),
        isSub: false,
      });
    });
  }
  subFeatures.forEach(sf => {
    rows.push({ level: sf.level, name: sf.name, desc: sf.body, isSub: true });
  });
  rows.sort((a, b) => a.level - b.level || (a.isSub - b.isSub) || a.name.localeCompare(b.name));

  const abilOpts = ABILITIES.map(a => `<option value="${a.key}">${a.name}</option>`).join('');

  let tableHtml = '<table class="features-table"><thead><tr><th>Lvl</th><th>Feature</th></tr></thead><tbody>';
  rows.forEach((r, idx) => {
    const locked = r.level > charLevel;
    const rowId = `feat-row-${idx}`;
    const subTag = r.isSub ? `<span class="feature-sub-tag">${escapeHTML(subtypeLabel.split(' ')[0])}</span>` : '';
    const isASI = !r.isSub && /ability score improv/i.test(r.name);

    let nameCell;
    if (isASI && !locked) {
      // Find existing choice for this level
      const ch = (character.asiChoices || []).find(c => c.level === r.level) || {};
      const isFeat = ch.feat === true;
      const assigned = Object.keys(ch).filter(k => k !== 'level' && k !== 'feat' && ch[k] > 0);
      const mode = isFeat ? 'feat' : (assigned.length > 1 ? '1' : '2');

      const sel1Style = mode === 'feat' ? 'style="display:none"' : '';
      const sel2Style = mode === '1' ? '' : 'style="display:none"';
      const sel1 = `<select class="asi-ab1" data-asi-level="${r.level}" ${sel1Style}><option value="">pick…</option>${abilOpts}</select>`;
      const selMode = `<select class="asi-mode" data-asi-level="${r.level}">
        <option value="2"    ${mode==='2'   ?'selected':''}>+2</option>
        <option value="1"    ${mode==='1'   ?'selected':''}>+1/+1</option>
        <option value="feat" ${mode==='feat'?'selected':''}>Feat</option>
      </select>`;
      const sel2 = `<select class="asi-ab2" data-asi-level="${r.level}" ${sel2Style}><option value="">pick…</option>${abilOpts}</select>`;
      nameCell = `${escapeHTML(r.name)}<span class="asi-inline" data-asi-level="${r.level}">${sel1}${selMode}${sel2}</span>`;
    } else {
      nameCell = `${escapeHTML(r.name)}${subTag}${locked ? `<span class="feature-lock-tag">Lvl ${r.level}</span>` : ''}`;
    }

    tableHtml += `<tr class="feature-row ${locked ? 'locked' : ''}" data-target="${isASI && !locked ? '' : rowId}">
      <td class="level-cell">${r.level}</td>
      <td class="feature-name">${nameCell}</td>
    </tr>`;
    if (r.desc && !(isASI && !locked)) {
      tableHtml += `<tr id="${rowId}" class="feature-desc-row" style="display:none">
        <td colspan="2"><div class="feature-desc">${escapeHTML(r.desc)}</div></td>
      </tr>`;
    }
  });
  tableHtml += '</tbody></table>';

  wrap.innerHTML = subclassHtml + tableHtml;

  wrap.querySelectorAll('tr.feature-row').forEach(row => {
    row.addEventListener('click', () => {
      const id = row.dataset.target;
      if (!id) return;
      const detail = wrap.querySelector('#' + id);
      if (!detail) return;
      detail.style.display = detail.style.display === 'none' ? '' : 'none';
    });
  });

  // Wire ASI inline selectors
  $$('.asi-inline', wrap).forEach(inline => {
    inline.addEventListener('click', e => e.stopPropagation());
    const level = Number(inline.dataset.asiLevel);
    const ab1Sel  = inline.querySelector('.asi-ab1');
    const modeSel = inline.querySelector('.asi-mode');
    const ab2Sel  = inline.querySelector('.asi-ab2');

    // Restore saved values into the selects
    const saved = (character.asiChoices || []).find(c => c.level === level) || {};
    const savedKeys = Object.keys(saved).filter(k => k !== 'level' && k !== 'feat' && saved[k] > 0);
    if (savedKeys.length) {
      ab1Sel.value = savedKeys[0] || '';
      if (savedKeys.length > 1 || (savedKeys.length === 1 && saved[savedKeys[0]] === 1)) {
        modeSel.value = savedKeys.length > 1 ? '1' : '2';
        if (savedKeys.length > 1) { ab2Sel.value = savedKeys[1]; ab2Sel.style.display = ''; }
      }
    }

    function saveASI() {
      const ab1 = ab1Sel.value;
      const mode = modeSel.value;
      const ab2 = mode === '1' ? ab2Sel.value : '';
      ab1Sel.style.display = mode === 'feat' ? 'none' : '';
      ab2Sel.style.display = mode === '1'    ? ''     : 'none';
      character.asiChoices = (character.asiChoices || []).filter(c => c.level !== level);
      if (mode === 'feat') {
        character.asiChoices.push({ level, feat: true });
      } else if (ab1) {
        const entry = { level };
        if (mode === '2') { entry[ab1] = 2; }
        else {
          entry[ab1] = (entry[ab1] || 0) + 1;
          if (ab2) entry[ab2] = (entry[ab2] || 0) + 1;
        }
        character.asiChoices.push(entry);
      }
      renderAbilities(); renderSaves(); renderSkills(); renderPassive();
      renderCombat(); renderSpellcasting(); renderFeats(); persist();
    }
    ab1Sel.addEventListener('change', saveASI);
    modeSel.addEventListener('change', saveASI);
    ab2Sel.addEventListener('change', saveASI);
  });

  const subSel = $('#subclass-select');
  if (subSel) {
    subSel.addEventListener('change', e => {
      const val = e.target.value;
      clearSubclassSkillGrants(); // always strip old college's auto-granted skills first
      if (val === '__custom__') {
        character.subclassSlug = '';
        const name = prompt('Custom subclass name:', character.subclass || '');
        character.subclass = name || '';
      } else if (val === '') {
        character.subclassSlug = '';
        character.subclass = '';
      } else {
        const a = archetypes.find(x => x.slug === val);
        if (a) {
          character.subclassSlug = a.slug;
          character.subclass = a.name;
          const granted = applyUnlockedSubclassGrants();
          if (granted.length) {
            const names = granted.map(k => allSkills().find(s => s.key === k)?.name || k).join(', ');
            toast(`${a.name} applied — ${names} auto-set`);
          } else {
            toast(`${a.name} applied`);
          }
        }
      }
      applySubclassPools();   // add/remove pools from supplement (e.g. Battle Master Superiority Dice)
      renderAll();
      persist();
    });
  }
}

// ====================================================================
// Persistence
// ====================================================================
const STORAGE_KEY = 'dnd5e-character-current';

function persist() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(character)); } catch (e) {}
}
function restore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const obj = JSON.parse(raw);
      const isLegacyAC      = !('acOverride' in obj);
      const isLegacyHPMax   = !('hpMaxOverride' in obj);
      character = Object.assign(blankCharacter(), obj);
      if (isLegacyAC)    inferLegacyACOverride();
      if (isLegacyHPMax) inferLegacyHPMaxOverride();
    }
  } catch (e) {}
}

// Pre-armor-feature characters stored a hand-edited `ac`. Treat the difference
// from the unarmored computed AC as their manual override so the loaded value
// survives the first applyArmorAC().
function inferLegacyACOverride() {
  character.acOverride = (Number(character.ac) || 10) - computeArmorAC();
}

// Pre-override characters with autoHP=true stored their adjusted Max in `hpMax`.
// Without an inferred override, the next recalc would overwrite it with the
// raw computed value. Capture the delta so the loaded value persists.
function inferLegacyHPMaxOverride() {
  if (!character.autoHP) { character.hpMaxOverride = 0; return; }
  character.hpMaxOverride = (Number(character.hpMax) || 0) - computeAutoMaxHP();
}

// Autosave on any change
function watchAutosave() {
  document.addEventListener('input', persist);
  document.addEventListener('change', persist);
  document.addEventListener('click', () => setTimeout(persist, 0));
}

function exportJSON() {
  const blob = new Blob([JSON.stringify(character, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeName = (character.name || 'character').replace(/[^a-z0-9_-]+/gi, '_');
  a.href = url;
  a.download = `${safeName}.json`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
  toast('Exported ' + a.download);
}

function importJSON(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(reader.result);
      const isLegacyAC    = !('acOverride' in obj);
      const isLegacyHPMax = !('hpMaxOverride' in obj);
      character = Object.assign(blankCharacter(), obj);
      if (isLegacyAC)    inferLegacyACOverride();
      if (isLegacyHPMax) inferLegacyHPMaxOverride();
      renderAll();
      persist();
      toast('Loaded ' + (character.name || 'character'));
    } catch (e) {
      toast('Failed to load — invalid JSON');
    }
  };
  reader.readAsText(file);
}

// ====================================================================
// Toast
// ====================================================================
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.add('hidden'), 2200);
}

// ====================================================================
// Wire up controls
// ====================================================================
function wireToolbar() {
  $('#btn-new').addEventListener('click', () => {
    if (confirm('Start a new character? Current sheet will be discarded (autosave will be overwritten).')) {
      character = blankCharacter();
      renderAll();
      persist();
    }
  });
  $('#btn-save').addEventListener('click', exportJSON);
  $('#btn-load').addEventListener('click', () => $('#file-load').click());
  $('#file-load').addEventListener('change', e => {
    if (e.target.files[0]) importJSON(e.target.files[0]);
    e.target.value = '';
  });
  // Alignment dropdown
  const alignDisplay = $('#align-display');
  const alignDropdown = $('#align-dropdown');
  alignDisplay.addEventListener('click', e => {
    e.stopPropagation();
    alignDropdown.classList.toggle('hidden');
  });
  $$('#alignment-grid .ag-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      character.alignment = btn.dataset.align;
      syncAlignmentGrid();
      alignDropdown.classList.add('hidden');
      persist();
    });
  });
  document.addEventListener('click', e => {
    if (!$('#align-picker').contains(e.target)) {
      alignDropdown.classList.add('hidden');
    }
  });

  $('#btn-rest').addEventListener('click', () => openRestModal('short'));
  $('#btn-srd').addEventListener('click', () => {
    $('#srd-panel').classList.toggle('hidden');
  });
  $('#srd-close').addEventListener('click', () => $('#srd-panel').classList.add('hidden'));

  // HP buttons
  $$('[data-hp]').forEach(btn => {
    btn.addEventListener('click', () => {
      const amt = Math.max(0, Number($('#hp-delta').value) || 0);
      if (!amt) return;
      if (btn.dataset.hp === 'damage') {
        // Apply to temp first, then current
        let remaining = amt;
        if (character.hpTemp > 0) {
          const used = Math.min(character.hpTemp, remaining);
          character.hpTemp -= used;
          remaining -= used;
        }
        character.hpCurrent = Math.max(0, character.hpCurrent - remaining);
      } else {
        character.hpCurrent = Math.min(character.hpMax, character.hpCurrent + amt);
      }
      $('#hp-delta').value = '';
      applyBindingsToInputs();
      renderCombat();
      persist();
    });
  });

  // Death save toggles — fill cumulatively; clicking the first filled clears all.
  $$('.ds-box').forEach(box => {
    box.addEventListener('click', () => {
      const which = box.dataset.death === 'success' ? 'deathSuccesses' : 'deathFailures';
      const idx = Number(box.dataset.idx);
      const arr = character[which];
      const firstFilled = arr.indexOf(true);
      if (firstFilled === idx) {
        // Clicked the leftmost filled circle — empty all
        for (let i = 0; i < arr.length; i++) arr[i] = false;
      } else {
        // Fill 0..idx (and clear any beyond)
        for (let i = 0; i < arr.length; i++) arr[i] = i <= idx;
      }
      renderCombat();
      persist();
    });
  });

  $('#btn-add-attack').addEventListener('click', () => {
    character.attacks.push({ name: '', bonus: '', damage: '', notes: '' });
    renderAttacks();
  });
  $('#btn-add-spell').addEventListener('click', () => {
    character.spells.push({ level: highestAvailableSpellLevel(), name: '', prepared: false, alwaysPrepared: false, notes: '' });
    renderSpells();
  });
}

// ====================================================================
// SRD (open5e.com) — read-only lookup that COPIES into editable items
// ====================================================================
const SRD_BASE    = 'https://api.open5e.com/v1';
const SRD_BASE_V2 = 'https://api.open5e.com/v2';
let srdType = 'spells';

function wireSRD() {
  $$('.srd-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      $$('.srd-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      srdType = tab.dataset.type;
      $('#srd-results').innerHTML = `<p class="srd-hint">Search ${srdType}.</p>`;
      $('#srd-detail').innerHTML = '';
    });
  });
  $('#srd-go').addEventListener('click', srdSearch);
  $('#srd-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') srdSearch();
  });
}

async function srdSearch() {
  const q = $('#srd-input').value.trim();
  const results = $('#srd-results');
  if (!q) { results.innerHTML = `<p class="srd-hint">Enter a search term.</p>`; return; }
  results.innerHTML = `<p class="srd-hint">Loading…</p>`;
  try {
    // Primary: name-only filter (far more relevant than full-text). "Light"
    // returns ~20 spells with "light" in the name instead of ~170 that just
    // mention light anywhere.
    const nameUrl = `${SRD_BASE}/${srdType}/?name__icontains=${encodeURIComponent(q)}&limit=100`;
    const nameRes = await fetch(nameUrl);
    if (!nameRes.ok) throw new Error('HTTP ' + nameRes.status);
    const nameData = await nameRes.json();
    let items = (nameData.results || []).slice();

    // Fallback: if name hits are sparse (<10), supplement with description matches
    // so the user can still find spells like "Faerie Fire" when searching "fire".
    if (items.length < 10) {
      try {
        const descRes = await fetch(`${SRD_BASE}/${srdType}/?search=${encodeURIComponent(q)}&limit=40`);
        if (descRes.ok) {
          const descData = await descRes.json();
          const seen = new Set(items.map(x => x.slug));
          for (const it of (descData.results || [])) {
            if (!seen.has(it.slug)) items.push(it);
          }
        }
      } catch (_) { /* ignore — primary results are enough */ }
    }

    if (!items.length) { results.innerHTML = `<p class="srd-hint">No results.</p>`; return; }

    // Rank-aware sort. For spells: by level, then exact > starts-with > contains, then alphabetical.
    // For other types: exact > starts-with > contains > alphabetical.
    const qLower = q.toLowerCase();
    const matchRank = (name) => {
      const n = (name || '').toLowerCase();
      if (n === qLower) return 0;
      if (n.startsWith(qLower)) return 1;
      if (n.includes(qLower)) return 2;
      return 3; // description-only hit
    };
    items.sort((a, b) => {
      if (srdType === 'spells') {
        const la = Number(a.level_int ?? 99);
        const lb = Number(b.level_int ?? 99);
        if (la !== lb) return la - lb;
      }
      const ra = matchRank(a.name), rb = matchRank(b.name);
      if (ra !== rb) return ra - rb;
      return (a.name || '').localeCompare(b.name || '');
    });

    results.innerHTML = '';
    let lastLevel = null;
    items.forEach(item => {
      // Insert a level header when the level changes (spells only).
      if (srdType === 'spells') {
        const lvl = Number(item.level_int ?? 99);
        if (lvl !== lastLevel) {
          lastLevel = lvl;
          const header = document.createElement('div');
          header.className = 'srd-result-group';
          header.textContent = lvl === 0 ? 'Cantrip' : `${ordinal(lvl)}-level`;
          results.appendChild(header);
        }
      }
      const div = document.createElement('div');
      div.className = 'srd-result-item';
      div.innerHTML = `
        <div class="name">${escapeHTML(item.name)}</div>
        <div class="meta">${srdMetaLine(srdType, item)}</div>
      `;
      div.addEventListener('click', () => showSrdDetail(item));
      results.appendChild(div);
    });
  } catch (e) {
    results.innerHTML = `<p class="srd-hint">Error fetching SRD: ${escapeHTML(e.message)}</p>`;
  }
}

function ordinal(n) {
  const s = ['th','st','nd','rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function srdMetaLine(type, item) {
  switch (type) {
    case 'spells': {
      const head = `${item.level || ''} ${item.school || ''} • ${item.casting_time || ''}`.trim();
      const tag  = spellSourceLabel(item.document__slug);
      return tag ? `${head} <span class="srd-source-tag">${escapeHTML(tag)}</span>` : head;
    }
    case 'monsters': return `CR ${item.challenge_rating ?? '?'} • ${item.type || ''} • ${item.size || ''}`;
    case 'magicitems': return `${item.type || ''} • ${item.rarity || ''}`;
    case 'weapons': return `${item.category || ''} • ${item.damage_dice || ''} ${item.damage_type || ''}`;
    case 'armor': return `${item.category || ''} • AC ${item.ac_string || item.ac_base || ''}`;
    case 'classes': { const hd = String(item.hit_dice || '').match(/d\d+/); return `Hit die: ${hd ? hd[0] : '?'}`; }
    case 'races': return item.size || '';
    case 'backgrounds': return item.skill_proficiencies ? `Skills: ${item.skill_proficiencies}` : '';
    case 'conditions': return '';
    default: return '';
  }
}

function showSrdDetail(item) {
  const detail = $('#srd-detail');
  let html = `<h3>${escapeHTML(item.name)}</h3>`;
  let addBtn = '';

  switch (srdType) {
    case 'spells':
      html += `<div class="stat-line">${escapeHTML(item.level || '')} ${escapeHTML(item.school || '')} • ${escapeHTML(item.casting_time || '')}</div>`;
      html += `<div class="stat-line">Range: ${escapeHTML(item.range || '')} • Duration: ${escapeHTML(item.duration || '')}</div>`;
      html += `<div class="stat-line">Components: ${escapeHTML(item.components || '')} ${item.material ? '('+escapeHTML(item.material)+')' : ''}</div>`;
      html += `<div class="desc">${escapeHTML(item.desc || '')}</div>`;
      if (item.higher_level) html += `<div class="higher"><b>At higher levels:</b> ${escapeHTML(item.higher_level)}</div>`;
      addBtn = `<button class="btn btn-accent btn-sm" id="srd-add">+ Add to Spells</button>`;
      break;
    case 'monsters':
      html += `<div class="stat-line">${escapeHTML(item.size || '')} ${escapeHTML(item.type || '')} • CR ${item.challenge_rating ?? '?'}</div>`;
      html += `<div class="stat-line">AC ${item.armor_class ?? ''} • HP ${item.hit_points ?? ''} (${escapeHTML(item.hit_dice || '')})</div>`;
      html += `<div class="stat-line">STR ${item.strength} DEX ${item.dexterity} CON ${item.constitution} INT ${item.intelligence} WIS ${item.wisdom} CHA ${item.charisma}</div>`;
      if (item.special_abilities && item.special_abilities.length) {
        html += '<div class="desc"><b>Special abilities:</b><br>' +
          item.special_abilities.map(s => `<i>${escapeHTML(s.name)}.</i> ${escapeHTML(s.desc)}`).join('<br>') + '</div>';
      }
      if (item.actions && item.actions.length) {
        html += '<div class="desc"><b>Actions:</b><br>' +
          item.actions.map(a => `<i>${escapeHTML(a.name)}.</i> ${escapeHTML(a.desc)}`).join('<br>') + '</div>';
      }
      addBtn = `<button class="btn btn-sm" id="srd-add">Copy to Notes</button>`;
      break;
    case 'magicitems':
      html += `<div class="stat-line">${escapeHTML(item.type || '')} • ${escapeHTML(item.rarity || '')}</div>`;
      if (item.requires_attunement) html += `<div class="stat-line">Requires attunement: ${escapeHTML(item.requires_attunement)}</div>`;
      html += `<div class="desc">${escapeHTML(item.desc || '')}</div>`;
      addBtn = `<button class="btn btn-accent btn-sm" id="srd-add">+ Add to Equipment</button>`;
      break;
    case 'weapons':
      html += `<div class="stat-line">${escapeHTML(item.category || '')} • Cost ${escapeHTML(item.cost || '')}</div>`;
      html += `<div class="stat-line">Damage: ${escapeHTML(item.damage_dice || '')} ${escapeHTML(item.damage_type || '')}</div>`;
      if (item.properties && item.properties.length) html += `<div class="stat-line">Properties: ${item.properties.map(escapeHTML).join(', ')}</div>`;
      addBtn = `<button class="btn btn-accent btn-sm" id="srd-add">+ Add as Attack</button>`;
      break;
    case 'armor':
      html += `<div class="stat-line">${escapeHTML(item.category || '')} • Cost ${escapeHTML(item.cost || '')}</div>`;
      html += `<div class="stat-line">AC: ${escapeHTML(item.ac_string || String(item.ac_base || ''))}</div>`;
      if (item.strength_requirement) html += `<div class="stat-line">Str req: ${item.strength_requirement}</div>`;
      if (item.stealth_disadvantage) html += `<div class="stat-line">Disadvantage on Stealth</div>`;
      addBtn = `<button class="btn btn-accent btn-sm" id="srd-add">+ Add to Equipment</button>`;
      break;
    case 'classes': {
      const hd = String(item.hit_dice || '').match(/d\d+/);
      html += `<div class="stat-line">Hit die: ${hd ? hd[0] : item.hit_dice || '?'}</div>`;
      if (item.prof_armor) html += `<div class="stat-line">Armor: ${escapeHTML(item.prof_armor)}</div>`;
      if (item.prof_weapons) html += `<div class="stat-line">Weapons: ${escapeHTML(item.prof_weapons)}</div>`;
      if (item.prof_tools) html += `<div class="stat-line">Tools: ${escapeHTML(item.prof_tools)}</div>`;
      if (item.prof_saving_throws) html += `<div class="stat-line">Saves: ${escapeHTML(item.prof_saving_throws)}</div>`;
      if (item.prof_skills) html += `<div class="stat-line">Skills: ${escapeHTML(item.prof_skills)}</div>`;
      html += `<div class="desc">${escapeHTML(item.desc || '')}</div>`;
      addBtn = `<button class="btn btn-sm" id="srd-add">Set Class</button>`;
      break;
    }
    case 'races':
      html += `<div class="stat-line">${escapeHTML(item.size || '')} • Speed ${escapeHTML(String(item.speed?.walk || item.speed || ''))}</div>`;
      if (item.asi_desc) html += `<div class="stat-line">ASI: ${escapeHTML(item.asi_desc)}</div>`;
      if (item.languages) html += `<div class="stat-line">Languages: ${escapeHTML(item.languages)}</div>`;
      html += `<div class="desc">${escapeHTML(item.desc || '')}</div>`;
      addBtn = `<button class="btn btn-sm" id="srd-add">Set Race</button>`;
      break;
    case 'backgrounds':
      if (item.skill_proficiencies) html += `<div class="stat-line">Skills: ${escapeHTML(item.skill_proficiencies)}</div>`;
      if (item.tool_proficiencies)  html += `<div class="stat-line">Tools: ${escapeHTML(item.tool_proficiencies)}</div>`;
      if (item.languages)           html += `<div class="stat-line">Languages: ${escapeHTML(item.languages)}</div>`;
      if (item.feature)             html += `<div class="stat-line"><b>Feature:</b> ${escapeHTML(item.feature)}</div>`;
      if (item.feature_desc)        html += `<div class="desc">${escapeHTML(item.feature_desc)}</div>`;
      if (item.equipment)           html += `<div class="stat-line">Equipment: ${escapeHTML(item.equipment)}</div>`;
      addBtn = `<button class="btn btn-sm" id="srd-add">Apply Background</button>`;
      break;
    case 'conditions':
      html += `<div class="desc">${escapeHTML(item.desc || '')}</div>`;
      break;
  }

  detail.innerHTML = html + (addBtn ? `<div style="margin-top:10px">${addBtn}</div>` : '');
  const ab = $('#srd-add');
  if (ab) ab.addEventListener('click', () => addSrdToCharacter(item));
}

function addSrdToCharacter(item) {
  switch (srdType) {
    case 'spells': {
      character.spells.push({
        level: parseSpellLevel(item.level),
        name: item.name,
        prepared: false,
        alwaysPrepared: false,
        notes: (item.school ? item.school + ' • ' : '') + (normalizeCastingTime(item.casting_time) || '') + (item.ritual ? ' • Ritual • ' + ritualCastTime(item.casting_time) : ''),
      });
      renderSpells();
      toast('Added spell: ' + item.name);
      break;
    }
    case 'weapons': {
      // Build a sensible default attack line; user is free to edit anything.
      const abil = item.properties && /finesse/i.test(item.properties.join(' ')) ? 'dex' : 'str';
      const mod = abilityMod(totalAbility(abil));
      const pb = proficiencyBonus(character.level);
      const bonus = fmtMod(mod + pb); // assumes proficient — user can edit
      const dmg = `${item.damage_dice || ''}${mod >= 0 ? '+' : ''}${mod} ${item.damage_type || ''}`.trim();
      character.attacks.push({ name: item.name, bonus, damage: dmg, notes: '' });
      renderAttacks();
      toast('Added attack: ' + item.name);
      break;
    }
    case 'magicitems':
    case 'armor': {
      const line = `${item.name}${item.rarity ? ' (' + item.rarity + ')' : ''}: ${item.desc || item.ac_string || ''}`;
      character.equipment = (character.equipment ? character.equipment + '\n' : '') + line;
      applyBindingsToInputs();
      toast('Added to equipment: ' + item.name);
      break;
    }
    case 'classes': {
      character.class = item.name;
      applyBindingsToInputs();
      toast('Set class: ' + item.name);
      break;
    }
    case 'races': {
      character.race = item.name;
      applyBindingsToInputs();
      toast('Set race: ' + item.name);
      break;
    }
    case 'monsters': {
      const summary = `${item.name} (CR ${item.challenge_rating}) — AC ${item.armor_class}, HP ${item.hit_points}`;
      character.notes = (character.notes ? character.notes + '\n' : '') + summary;
      applyBindingsToInputs();
      toast('Added monster to notes');
      break;
    }
    case 'backgrounds': {
      applyBackground(item.slug);
      // sync the preset select
      const bgSel = document.querySelector('select.srd-preset[data-preset="background"]');
      if (bgSel) {
        const opt = Array.from(bgSel.options).find(o => o.value === item.slug);
        if (opt) bgSel.value = item.slug;
      }
      break;
    }
  }
  persist();
}

// ====================================================================
// Modal helper
// ====================================================================
let _modalConfirm   = null;
let _pendingRestData = null;
function showModal({ title, bodyHTML, onConfirm, confirmText = 'Apply' }) {
  $('#modal-title').textContent = title;
  $('#modal-body').innerHTML = bodyHTML;
  $('#modal-confirm').textContent = confirmText;
  _modalConfirm = onConfirm;
  $('#modal-overlay').classList.remove('hidden');
}
function hideModal() {
  $('#modal-overlay').classList.add('hidden');
  _modalConfirm = null;
  $('#modal-body').innerHTML = '';
}
function wireModal() {
  $('#modal-close').addEventListener('click', hideModal);
  $('#modal-cancel').addEventListener('click', hideModal);
  $('#modal-confirm').addEventListener('click', () => {
    if (_modalConfirm) {
      const ok = _modalConfirm();
      if (ok !== false) hideModal();
    } else {
      hideModal();
    }
  });
  $('#modal-overlay').addEventListener('click', e => {
    if (e.target.id === 'modal-overlay') hideModal();
  });
}

// ====================================================================
// Subclass Supplement — user-curated JSON of subclasses absent from
// open5e (PHB-only, homebrew, etc.). The starter is bundled inline via
// Supplements/starters.js (window.SUPPLEMENT_STARTERS.subclasses).
// ====================================================================
const SUPPLEMENT_KEY = 'dnd5char_subclass_supplement_v1';
let _subclassSupplement = null;

function loadSubclassSupplement() {
  try {
    const raw = localStorage.getItem(SUPPLEMENT_KEY);
    if (raw) {
      _subclassSupplement = JSON.parse(raw);
    } else {
      // No user upload yet → fall back to the bundled starter so the dropdown
      // is useful out of the box. Marked _isDefault so we can show that in the
      // status line and avoid pretending the user uploaded it.
      const starter = window.SUPPLEMENT_STARTERS?.subclasses;
      _subclassSupplement = starter
        ? { ...starter, _isDefault: true }
        : null;
    }
  } catch (e) { _subclassSupplement = null; }
}

function saveSubclassSupplement(data) {
  if (data == null) {
    localStorage.removeItem(SUPPLEMENT_KEY);
    _subclassSupplement = null;
  } else {
    // Strip the in-memory _isDefault flag so persisted JSON stays clean.
    // Editing a default starter → on save, it becomes "yours" (no _isDefault).
    const { _isDefault, ...persisted } = data;
    localStorage.setItem(SUPPLEMENT_KEY, JSON.stringify(persisted));
    _subclassSupplement = persisted;
  }
}

/** Merge supplement subclasses into presetCache.class[*].archetypes. Idempotent. */
function mergeSupplementIntoCache() {
  if (!_subclassSupplement || !Array.isArray(_subclassSupplement.subclasses)) return;
  for (const sub of _subclassSupplement.subclasses) {
    if (!sub || !sub.classSlug || !sub.slug || !sub.name) continue;
    const cls = (presetCache.class || []).find(c => c.slug === sub.classSlug);
    if (!cls) continue;
    cls.archetypes = cls.archetypes || [];
    // Replace if a supplement entry with this slug already merged (idempotent re-load).
    const existingIdx = cls.archetypes.findIndex(a => a.slug === sub.slug && a._fromSupplement);
    const archetype = buildSupplementArchetype(sub);
    if (existingIdx >= 0) cls.archetypes[existingIdx] = archetype;
    else cls.archetypes.push(archetype);
  }
}

/** Build an open5e-compatible archetype object from a supplement entry. */
function buildSupplementArchetype(sub) {
  const lines = [];
  if (sub.description) lines.push(sub.description, '');
  for (const f of (sub.features || [])) {
    lines.push(`##### ${f.name || 'Feature'}`);
    const lvlPrefix = f.level ? `At ${ordinal(f.level)} level, ` : '';
    lines.push((lvlPrefix + (f.desc || '')).trim());
    lines.push('');
  }
  // If the supplement explicitly lists skill grants, embed them as a tail
  // section so the existing extractSkillGrants() picks them up.
  if (Array.isArray(sub.skillGrants) && sub.skillGrants.length) {
    const names = sub.skillGrants
      .map(k => (allSkills().find(s => s.key === k) || {}).name)
      .filter(Boolean);
    if (names.length) {
      lines.push('##### Bonus Proficiencies');
      lines.push(`You gain proficiency in ${names.join(', ')}.`);
      lines.push('');
    }
  }
  return {
    slug: sub.slug,
    name: sub.name,
    desc: lines.join('\n'),
    document__slug: 'supplement',
    _fromSupplement: true,
    _supplementMeta: sub,
  };
}

/** Strip supplement-injected archetypes (used when clearing the supplement). */
function clearSupplementFromCache() {
  for (const cls of (presetCache.class || [])) {
    if (!cls.archetypes) continue;
    cls.archetypes = cls.archetypes.filter(a => !a._fromSupplement);
  }
}

/** Clear the character's subclass slug if it no longer exists in the cache
 *  (e.g. after the user removed or replaced the supplement that defined it). */
function dropStaleSubclassSelection() {
  if (!character.subclassSlug) return;
  const cls = (presetCache.class || []).find(c => c.slug === character.classSlug);
  const stillThere = cls?.archetypes?.some(a => a.slug === character.subclassSlug);
  if (!stillThere) {
    character.subclassSlug = '';
    character.subclass = '';
  }
}

/** Refresh the status line + button states in the Info modal. */
function refreshSupplementStatus() {
  const el = $('#supplement-status');
  if (!el) return;
  el.classList.remove('has-supplement', 'error');
  if (!_subclassSupplement || !Array.isArray(_subclassSupplement.subclasses)) {
    el.textContent = 'No supplement loaded.';
    return;
  }
  const n = _subclassSupplement.subclasses.length;
  el.classList.add('has-supplement');
  const prefix = _subclassSupplement._isDefault ? 'Using bundled starter' : 'Loaded';
  el.textContent = `${prefix}: "${_subclassSupplement.name || 'Custom'}" — ${n} subclass${n === 1 ? '' : 'es'}.`;
}

function downloadFile(filename, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 200);
}

// ====================================================================
// Race Supplement — same shape as subclass supplement but for races/subraces.
// Entries with `parentSlug` merge into the parent race's `subraces` array
// (used for Wood Elf, Drow, Mountain Dwarf, etc.). Entries without one
// become standalone race entries in the dropdown.
// ====================================================================
const RACE_SUPPLEMENT_KEY = 'dnd5char_race_supplement_v1';
let _raceSupplement = null;

function loadRaceSupplement() {
  try {
    const raw = localStorage.getItem(RACE_SUPPLEMENT_KEY);
    if (raw) {
      _raceSupplement = JSON.parse(raw);
    } else {
      const starter = window.SUPPLEMENT_STARTERS?.races;
      _raceSupplement = starter
        ? { ...starter, _isDefault: true }
        : null;
    }
  } catch (e) { _raceSupplement = null; }
}

function saveRaceSupplement(data) {
  if (data == null) {
    localStorage.removeItem(RACE_SUPPLEMENT_KEY);
    _raceSupplement = null;
  } else {
    const { _isDefault, ...persisted } = data;
    localStorage.setItem(RACE_SUPPLEMENT_KEY, JSON.stringify(persisted));
    _raceSupplement = persisted;
  }
}

/** Normalize a supplement race entry's ASI into the array shape that applyRace expects:
 *    [{ attributes: ['Strength'], value: 2 }, ...]
 *  Accepts either that shape or a shorthand like { wis: 1, dex: 1 }. */
function normalizeSupplementAsi(asi) {
  if (!asi) return [];
  // Shorthand object: { wis: 1, dex: 1, choose: 1 }
  if (!Array.isArray(asi) && typeof asi === 'object') {
    const out = [];
    Object.entries(asi).forEach(([k, v]) => {
      const ab = ABILITIES.find(a => a.key === k.toLowerCase() || a.name.toLowerCase() === k.toLowerCase());
      const attr = ab ? ab.name : (k.toLowerCase() === 'choose' || k.toLowerCase() === 'other' ? 'Other' : k);
      out.push({ attributes: [attr], value: Number(v) || 0 });
    });
    return out;
  }
  // Already array — pass through but coerce shape
  return asi.map(item => {
    if (item && typeof item === 'object' && 'attributes' in item) return item;
    if (item && typeof item === 'object') {
      // single-key object inside an array
      const [k, v] = Object.entries(item)[0] || [];
      if (k) {
        const ab = ABILITIES.find(a => a.key === k.toLowerCase());
        return { attributes: [ab ? ab.name : k], value: Number(v) || 0 };
      }
    }
    return null;
  }).filter(Boolean);
}

/** Build the trait blob (free text) consumed by applyRace's extractSkillGrants + appendAutoText. */
function buildSupplementRaceTraits(race) {
  const lines = [];
  (race.traits || []).forEach(t => {
    lines.push(`***${t.name || 'Trait'}.*** ${t.desc || ''}`);
  });
  if (Array.isArray(race.skillGrants) && race.skillGrants.length) {
    const names = race.skillGrants
      .map(k => (allSkills().find(s => s.key === k) || {}).name)
      .filter(Boolean);
    if (names.length) {
      lines.push(`***Bonus Proficiencies.*** You gain proficiency in ${names.join(', ')}.`);
    }
  }
  if (race.darkvision) {
    lines.push(`***Darkvision.*** Accustomed to twilit forests and the night sky, you have superior vision in dark and dim conditions. You can see in dim light within ${race.darkvision} feet of you as if it were bright light, and in darkness as if it were dim light.`);
  }
  return lines.join('\n\n');
}

/** Build an open5e-compatible race object from a supplement entry. */
function buildSupplementRace(race) {
  return {
    slug: race.slug,
    name: race.name,
    document__slug: 'supplement',
    asi: normalizeSupplementAsi(race.asi),
    asi_desc: race.asi_desc || '',
    size: race.size || 'Medium',
    speed: { walk: Number(race.speed) || 30 },
    languages: race.languages || '',
    traits: buildSupplementRaceTraits(race),
    subraces: [],
    _fromSupplement: true,
    _supplementMeta: race,
  };
}

/** Build a subrace entry to be pushed into a parent race's `subraces` array. */
function buildSupplementSubrace(race) {
  return {
    slug: race.slug,
    name: race.name,
    document__slug: 'supplement',
    asi: normalizeSupplementAsi(race.asi),
    asi_desc: race.asi_desc || '',
    traits: buildSupplementRaceTraits(race),
    ...(race.speed ? { speed: { walk: Number(race.speed) } } : {}),
    _fromSupplement: true,
    _supplementMeta: race,
  };
}

/** Merge supplement races into presetCache.race. Idempotent. */
function mergeRaceSupplementIntoCache() {
  if (!_raceSupplement || !Array.isArray(_raceSupplement.races)) return;
  for (const race of _raceSupplement.races) {
    if (!race || !race.slug || !race.name) continue;
    if (race.parentSlug) {
      // Subrace — find parent and add/replace
      const parent = (presetCache.race || []).find(r => r.slug === race.parentSlug);
      if (!parent) continue;
      parent.subraces = parent.subraces || [];
      const idx = parent.subraces.findIndex(s => s.slug === race.slug && s._fromSupplement);
      const built = buildSupplementSubrace(race);
      if (idx >= 0) parent.subraces[idx] = built;
      else parent.subraces.push(built);
    } else {
      // Standalone race
      presetCache.race = presetCache.race || [];
      const idx = presetCache.race.findIndex(r => r.slug === race.slug && r._fromSupplement);
      const built = buildSupplementRace(race);
      if (idx >= 0) presetCache.race[idx] = built;
      else presetCache.race.push(built);
    }
  }
}

/** Strip supplement-injected races + subraces from cache. */
function clearRaceSupplementFromCache() {
  for (const r of (presetCache.race || [])) {
    if (r.subraces) r.subraces = r.subraces.filter(s => !s._fromSupplement);
  }
  if (presetCache.race) {
    presetCache.race = presetCache.race.filter(r => !r._fromSupplement);
  }
}

/** Clear character.raceSlug if it points to a race/subrace no longer present. */
function dropStaleRaceSelection() {
  if (!character.raceSlug) return;
  const [baseSlug, subSlug] = String(character.raceSlug).split(':');
  const base = (presetCache.race || []).find(r => r.slug === baseSlug);
  if (!base) { character.raceSlug = ''; character.race = ''; return; }
  if (subSlug) {
    const sub = (base.subraces || []).find(s => s.slug === subSlug);
    if (!sub) { character.raceSlug = ''; character.race = ''; }
  }
}

function refreshRaceSupplementStatus() {
  const el = $('#race-supplement-status');
  if (!el) return;
  el.classList.remove('has-supplement', 'error');
  if (!_raceSupplement || !Array.isArray(_raceSupplement.races)) {
    el.textContent = 'No race supplement loaded.';
    return;
  }
  const n = _raceSupplement.races.length;
  el.classList.add('has-supplement');
  const prefix = _raceSupplement._isDefault ? 'Using bundled starter' : 'Loaded';
  el.textContent = `${prefix}: "${_raceSupplement.name || 'Custom'}" — ${n} race${n === 1 ? '' : 's'}.`;
}

/** Render the list of loaded supplement races with Edit buttons. */
function renderSupplementRaceList() {
  const wrap = $('#supplement-race-list');
  if (!wrap) return;
  wrap.innerHTML = '';
  const races = _raceSupplement?.races || [];
  if (!races.length) {
    wrap.innerHTML = '<div class="ss-empty">No supplement races loaded. Upload a file or download the starter to get started.</div>';
    return;
  }
  races.forEach(race => {
    const row = document.createElement('div');
    row.className = 'ss-row';
    const parent = race.parentSlug ? `subrace of ${race.parentSlug}` : 'standalone race';
    row.innerHTML = `
      <div>
        <div class="ss-name">${escapeHTML(race.name || '(unnamed)')}</div>
        <div class="ss-class">${escapeHTML(parent)}</div>
      </div>
      <button type="button" class="btn btn-sm ss-edit-race" data-slug="${escapeAttr(race.slug || '')}">Edit</button>
    `;
    wrap.appendChild(row);
  });
  wrap.querySelectorAll('.ss-edit-race').forEach(btn => {
    btn.addEventListener('click', () => openRaceEditor(btn.dataset.slug));
  });
}

/** Render the list of loaded supplement subclasses with Edit buttons. */
function renderSupplementSubclassList() {
  const wrap = $('#supplement-subclass-list');
  if (!wrap) return;
  wrap.innerHTML = '';
  const subs = _subclassSupplement?.subclasses || [];
  if (!subs.length) {
    wrap.innerHTML = '<div class="ss-empty">No supplement subclasses loaded. Upload a file or download the starter to get started.</div>';
    return;
  }
  subs.forEach(sub => {
    const row = document.createElement('div');
    row.className = 'ss-row';
    row.innerHTML = `
      <div>
        <div class="ss-name">${escapeHTML(sub.name || '(unnamed)')}</div>
        <div class="ss-class">${escapeHTML(sub.classSlug || '?')}</div>
      </div>
      <button type="button" class="btn btn-sm ss-edit" data-slug="${escapeAttr(sub.slug || '')}" data-class="${escapeAttr(sub.classSlug || '')}">Edit</button>
    `;
    wrap.appendChild(row);
  });
  wrap.querySelectorAll('.ss-edit').forEach(btn => {
    btn.addEventListener('click', () => openSubclassEditor(btn.dataset.slug, btn.dataset.class));
  });
}

/** Open the per-subclass editor modal. Edits are kept in a draft until Save. */
function openSubclassEditor(slug, classSlug) {
  const orig = (_subclassSupplement?.subclasses || []).find(s => s.slug === slug && s.classSlug === classSlug);
  if (!orig) { toast('Subclass not found in supplement'); return; }
  const draft = JSON.parse(JSON.stringify(orig));   // isolated copy for edits

  const overlay = $('#subclass-editor-overlay');
  const title   = $('#subclass-editor-title');
  const body    = $('#subclass-editor-body');
  if (!overlay || !body) return;

  title.textContent = `Edit: ${draft.name}`;
  body.innerHTML = renderSubclassEditorHTML(draft);
  overlay.classList.remove('hidden');

  // Wire feature textareas → draft only
  body.querySelectorAll('textarea[data-feature-idx]').forEach(ta => {
    ta.addEventListener('input', () => {
      const i = Number(ta.dataset.featureIdx);
      if (draft.features?.[i]) draft.features[i].desc = ta.value;
    });
  });

  // Paste-text auto-fill → draft
  const pasteEl  = body.querySelector('#se-paste-text');
  const parseBtn = body.querySelector('#se-paste-parse');
  const resultEl = body.querySelector('#se-paste-result');
  parseBtn?.addEventListener('click', () => {
    const raw = pasteEl.value || '';
    if (!raw.trim()) { resultEl.textContent = 'Paste some text first.'; return; }
    const { filled, unmatched } = parsePastedFeatureText(raw, draft);
    body.querySelectorAll('textarea[data-feature-idx]').forEach(ta => {
      const i = Number(ta.dataset.featureIdx);
      if (draft.features?.[i]) ta.value = draft.features[i].desc || '';
    });
    let msg = `Filled ${filled.length} feature${filled.length === 1 ? '' : 's'}`;
    if (filled.length)    msg += ': ' + filled.join(', ');
    if (unmatched.length) msg += `. Unmatched headings: ${unmatched.join(', ')}`;
    resultEl.textContent = msg;
  });

  body.querySelector('#se-save')?.addEventListener('click', () => {
    Object.assign(orig, draft);   // commit draft → original entry
    saveSubclassSupplement(_subclassSupplement);
    clearSupplementFromCache();
    mergeSupplementIntoCache();
    if (character.classSlug === classSlug && character.subclassSlug === slug) {
      applySubclassPools();
      renderResourcePools();
    }
    renderClassFeatures();
    renderSupplementSubclassList();
    refreshSupplementStatus();
    overlay.classList.add('hidden');
    toast('Saved');
  });
  body.querySelector('#se-cancel')?.addEventListener('click', () => {
    overlay.classList.add('hidden');   // draft discarded, no need to touch localStorage
  });
}

function renderSubclassEditorHTML(sub) {
  const features = (sub.features || []).map((f, i) => {
    const lvl = f.level ? `Level ${f.level}` : 'no level';
    return `
      <div class="se-feature">
        <div class="se-feature-head">
          <span class="se-feature-name">${escapeHTML(f.name || 'Feature')}</span>
          <span class="se-feature-level">${lvl}</span>
        </div>
        <textarea data-feature-idx="${i}" placeholder="Feature description (from your PHB or wiki)">${escapeHTML(f.desc || '')}</textarea>
      </div>
    `;
  }).join('');

  return `
    <div class="se-meta">
      <div><b>${escapeHTML(sub.name)}</b></div>
      <div>Class: <b>${escapeHTML(sub.classSlug)}</b></div>
      <div>Source: <b>${escapeHTML(sub.sourceLabel || 'Custom')}</b></div>
    </div>
    ${features || '<p class="srd-hint">This subclass has no features defined.</p>'}
    <div class="se-paste-row">
      <label style="display:block;font-size:0.78rem;color:var(--text-dim);margin-bottom:4px">
        <b>Paste raw text</b> (from a wiki page, your PHB, etc.) — the parser splits on feature headings and matches against the names above.
      </label>
      <textarea id="se-paste-text" placeholder="Paste the subclass description here, then click Parse…" style="min-height:120px"></textarea>
      <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
        <button type="button" id="se-paste-parse" class="btn btn-sm">Parse &amp; Fill</button>
        <span id="se-paste-result" class="se-paste-result"></span>
      </div>
    </div>
    <div class="se-actions">
      <button type="button" id="se-cancel" class="btn">Cancel</button>
      <button type="button" id="se-save"   class="btn btn-accent">Save</button>
    </div>
  `;
}

/** Heuristic parser: split pasted text into feature blocks and fill matching desc fields.
 *  Returns { filled: [name,...], unmatched: [heading,...] }. */
function parsePastedFeatureText(raw, sub) {
  const features = sub.features || [];
  if (!features.length) return { filled: [], unmatched: [] };

  // Build a name → index map (case-insensitive, whitespace-normalized)
  const norm = s => String(s || '').toLowerCase().replace(/\s+/g, ' ').trim();
  const byName = new Map();
  features.forEach((f, i) => byName.set(norm(f.name), i));

  // Locate each known feature name in the raw text and slice the text between them.
  // Cheap and forgiving — works for wiki pages where each feature has a heading.
  const lower = raw.toLowerCase();
  const hits = [];
  features.forEach((f, i) => {
    const needle = norm(f.name);
    if (!needle) return;
    // Look for the name at the start of a line OR preceded by '#' (markdown heading)
    const re = new RegExp(`(^|\\n)\\s*#{0,6}\\s*${needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*(\\n|$)`, 'i');
    const m = re.exec(lower);
    if (m) hits.push({ idx: i, name: f.name, start: m.index + m[1].length });
  });
  hits.sort((a, b) => a.start - b.start);

  const filled = [];
  for (let k = 0; k < hits.length; k++) {
    const h = hits[k];
    // Body = text after this heading up to the next hit or end
    const headingLineEnd = raw.indexOf('\n', h.start);
    const bodyStart = headingLineEnd >= 0 ? headingLineEnd + 1 : h.start;
    const bodyEnd   = (k + 1 < hits.length) ? hits[k + 1].start : raw.length;
    const body = raw.slice(bodyStart, bodyEnd).trim();
    if (body && features[h.idx]) {
      features[h.idx].desc = body;
      filled.push(h.name);
    }
  }

  // Detect any apparent headings in the raw text that didn't match a known feature.
  // We look for short lines (likely headings) followed by a blank line.
  const unmatched = [];
  const lines = raw.split(/\r?\n/);
  for (let i = 0; i < lines.length - 1; i++) {
    const l = lines[i].trim();
    if (!l) continue;
    if (l.length > 80) continue;          // not a heading
    if (/[.!?]$/.test(l)) continue;       // ends in punctuation → likely a sentence
    if (lines[i + 1].trim() !== '' && !/^[#=-]/.test(lines[i + 1])) continue;
    const n = norm(l.replace(/^#+\s*/, ''));
    if (!byName.has(n) && !unmatched.includes(l)) unmatched.push(l);
  }

  return { filled, unmatched };
}

function wireSubclassEditor() {
  $('#subclass-editor-close')?.addEventListener('click', () => $('#subclass-editor-overlay').classList.add('hidden'));
  $('#subclass-editor-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'subclass-editor-overlay') $('#subclass-editor-overlay').classList.add('hidden');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#subclass-editor-overlay').classList.contains('hidden')) {
      $('#subclass-editor-overlay').classList.add('hidden');
    }
  });
}

/** Open the per-race editor modal. Edits are kept in a draft until Save. */
function openRaceEditor(slug) {
  const orig = (_raceSupplement?.races || []).find(r => r.slug === slug);
  if (!orig) { toast('Race not found in supplement'); return; }
  const draft = JSON.parse(JSON.stringify(orig));

  const overlay = $('#race-editor-overlay');
  const title   = $('#race-editor-title');
  const body    = $('#race-editor-body');
  if (!overlay || !body) return;

  title.textContent = `Edit: ${draft.name}`;
  body.innerHTML = renderRaceEditorHTML(draft);
  overlay.classList.remove('hidden');

  // Wire trait textareas → draft only
  body.querySelectorAll('textarea[data-trait-idx]').forEach(ta => {
    ta.addEventListener('input', () => {
      const i = Number(ta.dataset.traitIdx);
      if (draft.traits?.[i]) draft.traits[i].desc = ta.value;
    });
  });
  body.querySelectorAll('input[data-trait-name]').forEach(inp => {
    inp.addEventListener('input', () => {
      const i = Number(inp.dataset.traitName);
      if (draft.traits?.[i]) draft.traits[i].name = inp.value;
    });
  });
  // Top-level meta inputs
  body.querySelector('#re-speed')?.addEventListener('input', e => { draft.speed = Number(e.target.value) || 0; });
  body.querySelector('#re-size')?.addEventListener('change', e => { draft.size = e.target.value; });
  body.querySelector('#re-languages')?.addEventListener('input', e => { draft.languages = e.target.value; });
  body.querySelector('#re-darkvision')?.addEventListener('input', e => { draft.darkvision = Number(e.target.value) || 0; });
  // ASI inputs — each ability + a "choose" row
  body.querySelectorAll('input[data-asi-ability]').forEach(inp => {
    inp.addEventListener('input', () => {
      const key = inp.dataset.asiAbility;
      const v = Number(inp.value) || 0;
      // Normalize draft.asi to shorthand object for ergonomics
      if (!draft.asi || Array.isArray(draft.asi)) draft.asi = {};
      if (v) draft.asi[key] = v; else delete draft.asi[key];
    });
  });

  // Add trait button
  body.querySelector('#re-add-trait')?.addEventListener('click', () => {
    draft.traits = draft.traits || [];
    draft.traits.push({ name: 'New Trait', desc: '' });
    body.innerHTML = renderRaceEditorHTML(draft);
    // Re-bind by recursing (simpler than re-wiring inline)
    openRaceEditorRebind(body, draft);
  });

  // Paste-text auto-fill — same parser as subclasses (it operates on a sub.features
  // shape, so wrap traits to look like features temporarily)
  const pasteEl  = body.querySelector('#re-paste-text');
  const parseBtn = body.querySelector('#re-paste-parse');
  const resultEl = body.querySelector('#re-paste-result');
  parseBtn?.addEventListener('click', () => {
    const raw = pasteEl.value || '';
    if (!raw.trim()) { resultEl.textContent = 'Paste some text first.'; return; }
    // Shim the parser by passing { features: traits }
    const shim = { features: draft.traits || [] };
    const { filled, unmatched } = parsePastedFeatureText(raw, shim);
    body.querySelectorAll('textarea[data-trait-idx]').forEach(ta => {
      const i = Number(ta.dataset.traitIdx);
      if (draft.traits?.[i]) ta.value = draft.traits[i].desc || '';
    });
    let msg = `Filled ${filled.length} trait${filled.length === 1 ? '' : 's'}`;
    if (filled.length)    msg += ': ' + filled.join(', ');
    if (unmatched.length) msg += `. Unmatched headings: ${unmatched.join(', ')}`;
    resultEl.textContent = msg;
  });

  body.querySelector('#re-save')?.addEventListener('click', () => {
    Object.assign(orig, draft);
    saveRaceSupplement(_raceSupplement);
    clearRaceSupplementFromCache();
    mergeRaceSupplementIntoCache();
    populatePresetDropdown('race');
    // If this race is the current selection, re-apply (refreshes traits text, ASI, etc.)
    if (character.raceSlug && character.raceSlug.startsWith(slug)) {
      applyRace(character.raceSlug);
    }
    renderSupplementRaceList();
    refreshRaceSupplementStatus();
    overlay.classList.add('hidden');
    toast('Saved');
  });
  body.querySelector('#re-cancel')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });
}

// Re-bind handlers after the editor's HTML is regenerated (e.g. after adding a trait).
// Same logic as the trait/asi/meta bindings in openRaceEditor — extracted to reuse.
function openRaceEditorRebind(body, draft) {
  body.querySelectorAll('textarea[data-trait-idx]').forEach(ta => {
    ta.addEventListener('input', () => {
      const i = Number(ta.dataset.traitIdx);
      if (draft.traits?.[i]) draft.traits[i].desc = ta.value;
    });
  });
  body.querySelectorAll('input[data-trait-name]').forEach(inp => {
    inp.addEventListener('input', () => {
      const i = Number(inp.dataset.traitName);
      if (draft.traits?.[i]) draft.traits[i].name = inp.value;
    });
  });
  body.querySelectorAll('button[data-trait-remove]').forEach(btn => {
    btn.addEventListener('click', () => {
      const i = Number(btn.dataset.traitRemove);
      draft.traits.splice(i, 1);
      body.innerHTML = renderRaceEditorHTML(draft);
      openRaceEditorRebind(body, draft);
    });
  });
  body.querySelector('#re-speed')?.addEventListener('input', e => { draft.speed = Number(e.target.value) || 0; });
  body.querySelector('#re-size')?.addEventListener('change', e => { draft.size = e.target.value; });
  body.querySelector('#re-languages')?.addEventListener('input', e => { draft.languages = e.target.value; });
  body.querySelector('#re-darkvision')?.addEventListener('input', e => { draft.darkvision = Number(e.target.value) || 0; });
  body.querySelectorAll('input[data-asi-ability]').forEach(inp => {
    inp.addEventListener('input', () => {
      const key = inp.dataset.asiAbility;
      const v = Number(inp.value) || 0;
      if (!draft.asi || Array.isArray(draft.asi)) draft.asi = {};
      if (v) draft.asi[key] = v; else delete draft.asi[key];
    });
  });
  body.querySelector('#re-add-trait')?.addEventListener('click', () => {
    draft.traits = draft.traits || [];
    draft.traits.push({ name: 'New Trait', desc: '' });
    body.innerHTML = renderRaceEditorHTML(draft);
    openRaceEditorRebind(body, draft);
  });
  // Save/cancel are static — find them again on the parent overlay
  const overlay = $('#race-editor-overlay');
  const slug = draft.slug;
  const orig = (_raceSupplement?.races || []).find(r => r.slug === slug);
  body.querySelector('#re-save')?.addEventListener('click', () => {
    Object.assign(orig, draft);
    saveRaceSupplement(_raceSupplement);
    clearRaceSupplementFromCache();
    mergeRaceSupplementIntoCache();
    populatePresetDropdown('race');
    if (character.raceSlug && character.raceSlug.startsWith(slug)) applyRace(character.raceSlug);
    renderSupplementRaceList();
    refreshRaceSupplementStatus();
    overlay.classList.add('hidden');
    toast('Saved');
  });
  body.querySelector('#re-cancel')?.addEventListener('click', () => {
    overlay.classList.add('hidden');
  });
  const pasteEl  = body.querySelector('#re-paste-text');
  const parseBtn = body.querySelector('#re-paste-parse');
  const resultEl = body.querySelector('#re-paste-result');
  parseBtn?.addEventListener('click', () => {
    const raw = pasteEl.value || '';
    if (!raw.trim()) { resultEl.textContent = 'Paste some text first.'; return; }
    const shim = { features: draft.traits || [] };
    const { filled, unmatched } = parsePastedFeatureText(raw, shim);
    body.querySelectorAll('textarea[data-trait-idx]').forEach(ta => {
      const i = Number(ta.dataset.traitIdx);
      if (draft.traits?.[i]) ta.value = draft.traits[i].desc || '';
    });
    let msg = `Filled ${filled.length} trait${filled.length === 1 ? '' : 's'}`;
    if (filled.length)    msg += ': ' + filled.join(', ');
    if (unmatched.length) msg += `. Unmatched headings: ${unmatched.join(', ')}`;
    resultEl.textContent = msg;
  });
}

function renderRaceEditorHTML(race) {
  // Normalize asi to shorthand object for the structured input.
  let asiObj = {};
  if (race.asi && !Array.isArray(race.asi)) asiObj = race.asi;
  else if (Array.isArray(race.asi)) {
    race.asi.forEach(item => {
      const k = (item.attributes && item.attributes[0]) || '';
      const ab = ABILITIES.find(a => a.name.toLowerCase() === String(k).toLowerCase() || a.key === String(k).toLowerCase());
      if (ab) asiObj[ab.key] = (asiObj[ab.key] || 0) + (Number(item.value) || 0);
    });
  }

  const asiRow = ABILITIES.map(a => `
    <div class="re-asi-cell">
      <label>${a.key.toUpperCase()}</label>
      <input type="number" value="${asiObj[a.key] || 0}" data-asi-ability="${a.key}" min="-3" max="5" step="1">
    </div>
  `).join('');

  const traits = (race.traits || []).map((t, i) => `
    <div class="se-feature">
      <div class="se-feature-head">
        <input type="text" class="re-trait-name" data-trait-name="${i}" value="${escapeAttr(t.name || '')}" placeholder="Trait name">
        <button type="button" class="icon-btn re-trait-remove" data-trait-remove="${i}" title="Remove this trait">&times;</button>
      </div>
      <textarea data-trait-idx="${i}" placeholder="Trait description">${escapeHTML(t.desc || '')}</textarea>
    </div>
  `).join('');

  return `
    <div class="se-meta">
      <div><b>${escapeHTML(race.name)}</b></div>
      <div>${race.parentSlug ? `Subrace of <b>${escapeHTML(race.parentSlug)}</b>` : 'Standalone race'}</div>
      <div>Source: <b>${escapeHTML(race.sourceLabel || 'Custom')}</b></div>
    </div>

    <div class="re-meta-grid">
      <div>
        <label>Speed (ft)</label>
        <input type="number" id="re-speed" value="${Number(race.speed) || 30}" min="0" max="120">
      </div>
      <div>
        <label>Size</label>
        <select id="re-size">
          ${['Tiny','Small','Medium','Large'].map(sz => `<option value="${sz}" ${race.size === sz ? 'selected' : ''}>${sz}</option>`).join('')}
        </select>
      </div>
      <div>
        <label>Darkvision (ft)</label>
        <input type="number" id="re-darkvision" value="${Number(race.darkvision) || 0}" min="0" max="240" step="30">
      </div>
      <div class="re-languages-cell">
        <label>Languages</label>
        <input type="text" id="re-languages" value="${escapeAttr(race.languages || '')}" placeholder="Common, Elvish">
      </div>
    </div>

    <div class="re-asi-row">
      <label class="re-section-label">Ability Score Increases</label>
      <div class="re-asi-grid">${asiRow}</div>
    </div>

    <label class="re-section-label">Traits</label>
    ${traits || '<p class="srd-hint">No traits yet. Click + Add Trait below.</p>'}
    <div style="margin-top:8px"><button type="button" id="re-add-trait" class="btn btn-sm">+ Add Trait</button></div>

    <div class="se-paste-row">
      <label style="display:block;font-size:0.78rem;color:var(--text-dim);margin-bottom:4px">
        <b>Paste raw text</b> from a wiki page or your PHB — the parser splits on trait names above.
      </label>
      <textarea id="re-paste-text" placeholder="Paste the race description here, then click Parse…" style="min-height:120px"></textarea>
      <div style="display:flex;gap:8px;align-items:center;margin-top:6px">
        <button type="button" id="re-paste-parse" class="btn btn-sm">Parse &amp; Fill</button>
        <span id="re-paste-result" class="se-paste-result"></span>
      </div>
    </div>

    <div class="se-actions">
      <button type="button" id="re-cancel" class="btn">Cancel</button>
      <button type="button" id="re-save"   class="btn btn-accent">Save</button>
    </div>
  `;
}

function wireRaceEditor() {
  $('#race-editor-close')?.addEventListener('click', () => $('#race-editor-overlay').classList.add('hidden'));
  $('#race-editor-overlay')?.addEventListener('click', e => {
    if (e.target.id === 'race-editor-overlay') $('#race-editor-overlay').classList.add('hidden');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !$('#race-editor-overlay').classList.contains('hidden')) {
      $('#race-editor-overlay').classList.add('hidden');
    }
  });
}

function wireSupplement() {
  const dlSampleBtn  = $('#btn-download-supplement-sample');
  const dlCurrentBtn = $('#btn-download-supplement-current');
  const uploadBtn    = $('#btn-upload-supplement');
  const clearBtn     = $('#btn-clear-supplement');
  const fileInput    = $('#supplement-file-input');

  dlSampleBtn?.addEventListener('click', () => {
    const data = window.SUPPLEMENT_STARTERS?.subclasses;
    if (!data) { toast('Starter data not loaded (Supplements/starters.js missing?)'); return; }
    downloadFile('subclass-supplement-starter.json', JSON.stringify(data, null, 2));
    toast('Downloaded starter file');
  });

  dlCurrentBtn?.addEventListener('click', () => {
    if (!_subclassSupplement) { toast('Nothing to download — no supplement loaded'); return; }
    downloadFile('subclass-supplement.json', JSON.stringify(_subclassSupplement, null, 2));
  });

  uploadBtn?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        if (!obj || !Array.isArray(obj.subclasses)) {
          throw new Error('Missing or invalid "subclasses" array.');
        }
        // Strip any prior supplement first so re-uploads replace cleanly.
        clearSupplementFromCache();
        saveSubclassSupplement(obj);
        mergeSupplementIntoCache();
        dropStaleSubclassSelection();      // forget subclass slug if no longer in the supplement
        // Refresh the subclass dropdown for the current class, if any.
        renderClassFeatures();
        applySubclassPools();
        renderResourcePools();
        refreshSupplementStatus();
        renderSupplementSubclassList();
        toast(`Loaded ${obj.subclasses.length} supplement subclass${obj.subclasses.length === 1 ? '' : 'es'}`);
      } catch (err) {
        const el = $('#supplement-status');
        if (el) { el.textContent = 'Upload failed: ' + err.message; el.classList.add('error'); }
        toast('Supplement upload failed: ' + err.message);
      }
    };
    reader.readAsText(file);
    fileInput.value = '';   // allow re-selecting the same file
  });

  clearBtn?.addEventListener('click', () => {
    const hasUserUpload = !!localStorage.getItem(SUPPLEMENT_KEY);
    if (!hasUserUpload) { toast('Already on the bundled starter'); return; }
    if (!confirm('Discard your uploaded supplement and revert to the bundled starter?')) return;
    clearSupplementFromCache();
    saveSubclassSupplement(null);          // removes from localStorage
    loadSubclassSupplement();              // re-loads starter into memory
    mergeSupplementIntoCache();
    dropStaleSubclassSelection();
    applySubclassPools();
    renderClassFeatures();
    renderResourcePools();
    refreshSupplementStatus();
    renderSupplementSubclassList();
    persist();
    toast('Reverted to bundled starter');
  });

  refreshSupplementStatus();
  renderSupplementSubclassList();
}

function wireRaceSupplement() {
  const dlSampleBtn  = $('#btn-download-race-sample');
  const dlCurrentBtn = $('#btn-download-race-current');
  const uploadBtn    = $('#btn-upload-race');
  const clearBtn     = $('#btn-clear-race');
  const fileInput    = $('#race-supplement-file-input');

  dlSampleBtn?.addEventListener('click', () => {
    const data = window.SUPPLEMENT_STARTERS?.races;
    if (!data) { toast('Starter data not loaded (Supplements/starters.js missing?)'); return; }
    downloadFile('race-supplement-starter.json', JSON.stringify(data, null, 2));
    toast('Downloaded race starter file');
  });

  dlCurrentBtn?.addEventListener('click', () => {
    if (!_raceSupplement) { toast('Nothing to download — no race supplement loaded'); return; }
    downloadFile('race-supplement.json', JSON.stringify(_raceSupplement, null, 2));
  });

  uploadBtn?.addEventListener('click', () => fileInput?.click());
  fileInput?.addEventListener('change', e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const obj = JSON.parse(reader.result);
        if (!obj || !Array.isArray(obj.races)) {
          throw new Error('Missing or invalid "races" array.');
        }
        clearRaceSupplementFromCache();
        saveRaceSupplement(obj);
        mergeRaceSupplementIntoCache();
        dropStaleRaceSelection();
        populatePresetDropdown('race');     // rebuild dropdown so new entries show
        refreshRaceSupplementStatus();
        renderSupplementRaceList();
        toast(`Loaded ${obj.races.length} supplement race${obj.races.length === 1 ? '' : 's'}`);
      } catch (err) {
        const el = $('#race-supplement-status');
        if (el) { el.textContent = 'Upload failed: ' + err.message; el.classList.add('error'); }
        toast('Race supplement upload failed: ' + err.message);
      }
    };
    reader.readAsText(file);
    fileInput.value = '';
  });

  clearBtn?.addEventListener('click', () => {
    const hasUserUpload = !!localStorage.getItem(RACE_SUPPLEMENT_KEY);
    if (!hasUserUpload) { toast('Already on the bundled starter'); return; }
    if (!confirm('Discard your uploaded race supplement and revert to the bundled starter?')) return;
    clearRaceSupplementFromCache();
    saveRaceSupplement(null);
    loadRaceSupplement();                   // re-loads starter into memory
    mergeRaceSupplementIntoCache();
    dropStaleRaceSelection();
    populatePresetDropdown('race');
    refreshRaceSupplementStatus();
    renderSupplementRaceList();
    persist();
    toast('Reverted to bundled starter');
  });

  refreshRaceSupplementStatus();
  renderSupplementRaceList();
}

/** Add resource pools defined by the active supplement subclass to the character.
 *  Idempotent — strips any existing subclass pools first. */
function applySubclassPools() {
  if (!character.resourcePools) character.resourcePools = [];
  character.resourcePools = character.resourcePools.filter(p => !p.subclassPool);
  if (!character.classSlug || !character.subclassSlug) return;
  const cls = (presetCache.class || []).find(c => c.slug === character.classSlug);
  if (!cls) return;
  const sub = (cls.archetypes || []).find(a => a.slug === character.subclassSlug);
  if (!sub || !sub._supplementMeta) return;
  const charLevel = Math.max(1, Math.min(20, Number(character.level) || 1));
  const resetMap = { short: 'Short Rest', long: 'Long Rest', none: 'None' };
  for (const pool of (sub._supplementMeta.pools || [])) {
    if (!pool || !pool.name) continue;
    const appliesAt = Number(pool.appliesAtLevel) || 1;
    if (charLevel < appliesAt) continue;
    const max = Math.max(1, Number(pool.max) || 1);
    character.resourcePools.push({
      key:      `subclass:${character.classSlug}:${character.subclassSlug}:${pool.name}`,
      name:     pool.name,
      max,
      baseMax:  max,
      bonus:    0,
      used:     0,
      unlimited: false,
      classKey: character.classSlug,
      resetOn:  resetMap[pool.resetOn] || 'Long Rest',
      custom:   false,
      subclassPool: true,
    });
  }
}

// ====================================================================
// SRD presets (Class / Race / Background dropdowns)
// ====================================================================
const presetCache = { class: [], race: [], background: [], feats: [], spells: [], armor: [], magicitems: [] };

// SRD getters: prefer fresh API data, fall back to whatever's been cached on
// the character (lets the sheet keep rendering when offline / API unreachable).
function getClassData() {
  if (!character.classSlug) return null;
  return (presetCache.class || []).find(x => x.slug === character.classSlug)
      || character.cachedClass
      || null;
}
function getRaceData() {
  if (!character.raceSlug) return null;
  const baseSlug = String(character.raceSlug).split(':')[0];
  return (presetCache.race || []).find(x => x.slug === baseSlug)
      || character.cachedRace
      || null;
}
function getBackgroundData() {
  if (!character.backgroundSlug) return null;
  return (presetCache.background || []).find(x => x.slug === character.backgroundSlug)
      || character.cachedBackground
      || null;
}

/**
 * Immediately populate each of the three preset <select> elements with a
 * synthetic option for the currently-saved slug/name, so the player can see
 * their Class / Race / Background the moment the page loads — before any API
 * data arrives.  Only runs for presets where a slug is saved; custom / unset
 * characters are left alone (their text-input already shows the saved name).
 *
 * Pass an optional array to limit which presets are touched, e.g. after a
 * partial API failure where some dropdowns were successfully populated.
 */
function preFillPresetDropdowns(presets = ['class', 'race', 'background']) {
  const SLUG_KEY = { class: 'classSlug', race: 'raceSlug', background: 'backgroundSlug' };
  const NAME_KEY = { class: 'class',     race: 'race',     background: 'background'     };
  presets.forEach(preset => {
    const slug = character[SLUG_KEY[preset]];
    const name = String(character[NAME_KEY[preset]] || '').trim();
    if (!slug) return;   // no slug → custom or unset; leave existing option alone
    const sel = $(`select[data-preset="${preset}"]`);
    if (!sel) return;
    sel.innerHTML = '';
    const saved = document.createElement('option');
    saved.value   = slug;
    saved.textContent = name || slug;
    sel.appendChild(saved);
    // Provide an escape hatch to Custom mode when running in fallback state
    // (full option list won't be available)
    sel.appendChild(customOption());
    sel.value = slug;
  });
}

function setApiLoading(on) {
  const el = $('#api-loading');
  if (el) el.classList.toggle('hidden', !on);
  // Lock the custom dropdown trigger buttons while the API is in-flight so
  // the player can't interact with an incomplete list.  The native <select>
  // elements are hidden but also disabled for consistency.
  ['class', 'race', 'background'].forEach(preset => {
    const btn = $(`#preset-dd-${preset} .preset-dd-trigger`);
    if (btn) {
      btn.disabled = !!on;
      btn.classList.toggle('api-locked', !!on);
    }
    const sel = $(`select[data-preset="${preset}"]`);
    if (sel) sel.disabled = !!on;
  });
}

function setApiFailedBanner(failedPresets) {
  const banner = $('#api-failed-banner');
  const msg    = $('#api-failed-msg');
  if (!banner) return;
  if (!failedPresets || failedPresets.length === 0) {
    banner.classList.add('hidden');
    return;
  }
  const names = failedPresets.map(p => p[0].toUpperCase() + p.slice(1)).join(', ');
  msg.innerHTML = `SRD data for <strong>${names}</strong> could not be loaded — those dropdowns are in
    <strong>manual mode</strong>. Use the text field below each one to enter names manually.
    All existing character data is intact and the sheet is fully functional.`;
  banner.classList.remove('hidden');
}

async function loadPresets() {
  setApiLoading(true);
  // Hide any previous failure banner while we retry
  setApiFailedBanner([]);
  const headers = { 'Accept': 'application/json' };

  // Kick off all fetches in parallel — but await classes FIRST so the
  // "Class Features" section can render as soon as that one arrives, rather
  // than waiting for the (much larger) spells payload.
  const clsP    = fetch(`${SRD_BASE}/classes/?limit=50`,        { headers }).then(r => r.json()).catch(() => null);
  const racP    = fetch(`${SRD_BASE}/races/?limit=100`,         { headers }).then(r => r.json()).catch(() => null);
  const bgP     = fetch(`${SRD_BASE}/backgrounds/?limit=100`,   { headers }).then(r => r.json()).catch(() => null);
  const featsP  = fetch(`${SRD_BASE}/feats/?limit=200`,         { headers }).then(r => r.json()).catch(() => null);
  const spellsP = fetch(`${SRD_BASE_V2}/spells/?limit=2000&fields=key,name,document,level,school,casting_time,ritual`, { headers }).then(r => r.json()).catch(() => null);
  const armorP  = fetch(`${SRD_BASE}/armor/?limit=100`,         { headers }).then(r => r.json()).catch(() => null);
  const miP     = fetch(`${SRD_BASE}/magicitems/?limit=2000`,   { headers }).then(r => r.json()).catch(() => null);

  // Phase 1: classes — render Class Features immediately when ready.
  const cls = await clsP;
  if (cls && cls.results) {
    presetCache.class = cls.results;
    if (character.classSlug) {
      renderClassFeatures();
      renderSpellcasting();   // spell slot table needs class data; refresh bubbles
    }
  }

  // Phase 2: everything else.
  const [rac, bg, feats, spells, armor, mi] = await Promise.all([racP, bgP, featsP, spellsP, armorP, miP]);
  if (rac    && rac.results)    presetCache.race       = rac.results;
  if (bg     && bg.results)     presetCache.background = bg.results;
  if (feats  && feats.results)  presetCache.feats      = feats.results;
  if (spells && spells.results) presetCache.spells     = spells.results;
  if (armor  && armor.results)  presetCache.armor      = armor.results;
  if (mi     && mi.results)     presetCache.magicitems = mi.results.filter(isMagicACItem);

  // Determine which of the three critical presets failed to load.
  const failedPresets = [
    ...(!cls || !cls.results ? ['class']      : []),
    ...(!rac || !rac.results ? ['race']       : []),
    ...(!bg  || !bg.results  ? ['background'] : []),
  ];

  // Inject synthetic Variant Human subrace (PHB content absent from wotc-srd)
  const human = presetCache.race.find(r => r.slug === 'human');
  if (human && !(human.subraces || []).some(s => s.slug === 'variant')) {
    human.subraces = human.subraces || [];
    human.subraces.unshift({
      slug: 'variant',
      name: 'Variant',
      document__slug: 'wotc-srd',
      replacesBaseAsi: true,
      asi: [
        { attributes: ['Other'], value: 1 },
        { attributes: ['Other'], value: 1 },
      ],
      asi_desc: '+1 to two different ability scores of your choice.',
      variantSkillChoice: { count: 1, options: 'any' },
      grantsFeat: true,
      traits: '',
    });
  }

  mergeSupplementIntoCache();   // inject user-curated subclasses (idempotent)
  mergeRaceSupplementIntoCache(); // inject user-curated races/subraces
  applySubclassPools();         // rebuild subclass pools now that the supplement is available
  populatePresetSelects();
  populatePresetDropdowns();  // fill custom dropdown lists now that cache is ready
  populateArmorDropdowns();   // now that armor + magicitems caches are populated
  populateFeatPicker();
  syncPresetSelections();
  syncPresetLinks();      // show ↗ arrows now that cache is populated
  renderClassFeatures();

  // For any preset whose API call failed, populatePresetSelects() leaves only
  // the "Pick a …" placeholder. Re-inject the saved selection so the player
  // always sees their character's info — API or not.
  if (failedPresets.length > 0) {
    preFillPresetDropdowns(failedPresets);
    setApiFailedBanner(failedPresets);
  }

  // Retroactively repair existing character feats:
  //   1. If their desc only contains the short blurb (saved before we combined
  //      `effects_desc` into the stored description), refresh it from SRD.
  //   2. If their fixedAsi/asiChoiceOptions/speedBonus/initiativeBonus fields are
  //      absent (saved before the inline-select update), re-parse and back-fill them.
  //   3. Legacy: if asiChoice is empty (older parser missed A5E wording), apply fixed.
  let repaired = 0;
  (character.feats || []).forEach(cf => {
    if (cf.custom || !cf.slug) return;
    const srd = (presetCache.feats || []).find(f => f.slug === cf.slug);
    if (!srd) return;

    // Refresh desc to include the full effects_desc body
    const fullDesc = buildFeatDesc(srd);
    if (fullDesc && cf.desc !== fullDesc) cf.desc = fullDesc;

    // Back-fill new fields added by the inline-select update
    if (cf.fixedAsi === undefined) {
      const { fixed, choices, speedBonus, initiativeBonus } = parseFeatEffects(srd);
      cf.fixedAsi          = { ...fixed };
      cf.asiChoiceOptions  = choices;
      // Preserve any existing user choices encoded in the old asiChoice
      if (!cf.asiChoices) {
        // Map old asiChoice minus fixedAsi into per-slot choices array
        const oldExtra = { ...(cf.asiChoice || {}) };
        Object.keys(fixed).forEach(k => {
          oldExtra[k] = Math.max(0, (oldExtra[k] || 0) - (fixed[k] || 0));
          if (oldExtra[k] === 0) delete oldExtra[k];
        });
        // Distribute leftover old values across choice slots
        const leftover = Object.entries(oldExtra).flatMap(([k, v]) => Array(v).fill(k));
        cf.asiChoices = choices.map((_, i) => leftover[i] || '');
      }
      if (!cf.speedBonus)       cf.speedBonus       = speedBonus;
      if (!cf.initiativeBonus)  cf.initiativeBonus  = initiativeBonus;
      // Recompute asiChoice from fixedAsi + asiChoices
      recomputeFeatAsiChoice(cf);
      repaired++;
    }

    // Legacy repair: asiChoice empty and no fixedAsi (pre-parseFeatEffects era)
    if (!repaired && Object.keys(cf.asiChoice || {}).length === 0) {
      const { fixed } = parseFeatEffects(srd);
      if (Object.keys(fixed).length) {
        cf.asiChoice = { ...fixed };
        repaired++;
      }
    }
  });
  if (repaired > 0) {
    persist();
    renderAll();
    toast(`Applied missing ASI on ${repaired} feat${repaired > 1 ? 's' : ''}`);
  } else {
    // Re-run a full render so freshly-loaded data (spell link cache,
    // spell-slot tables, cantrips/spells-known inputs) is reflected.
    renderAll();
  }
  setApiLoading(false);
}

// Friendly source tags for non-SRD content.
const SOURCE_TAGS = {
  'wotc-srd':   '',
  'toh':        'ToH',         // Tome of Heroes (Kobold Press)
  'a5e':        'A5E',         // Level Up: Advanced 5e
  'taldorei':   'Tal’Dorei',
  'o5e':        'Open5e',
  'kp':         'Kobold',
  'blackflag':  'BlackFlag',
  'supplement': 'Custom',
};
function sourceTag(slug) {
  if (slug in SOURCE_TAGS) return SOURCE_TAGS[slug];
  return slug ? slug.toUpperCase() : '';
}

// Verbose label for the spell search results — disambiguates rows like the
// multiple "Light" spells from different sources. Always shows a tag (unlike
// `sourceTag` which returns empty for SRD content).
const SPELL_SOURCE_LABELS = {
  'wotc-srd': 'SRD 2014',
  'a5e':      'A5E',
  'toh':      'ToH',
  'kp':       'Kobold',
  'blackflag': 'BlackFlag',
  'taldorei': "Tal'Dorei",
  'o5e':      'Open5e',
  'dmag':     'Deep Magic',
  'warlock':  'Warlock',
};
function spellSourceLabel(slug) {
  if (!slug) return '';
  return SPELL_SOURCE_LABELS[slug] || slug.toUpperCase();
}

function populatePresetSelects() {
  populateSourced('class', presetCache.class, (sel, c) => {
    const o = document.createElement('option');
    o.value = c.slug;
    const tag = sourceTag(c.document__slug);
    o.textContent = c.name + (tag ? ` [${tag}]` : '');
    sel.appendChild(o);
  });

  populateSourced('race', presetCache.race, (sel, r) => {
    const tag = sourceTag(r.document__slug);
    const suffix = tag ? ` [${tag}]` : '';
    const base = document.createElement('option');
    base.value = r.slug;
    base.textContent = r.name + suffix;
    sel.appendChild(base);
    (r.subraces || []).forEach(sr => {
      const o = document.createElement('option');
      o.value = `${r.slug}:${sr.slug}`;
      o.textContent = `${r.name} — ${sr.name}` + suffix;
      sel.appendChild(o);
    });
  });

  populateSourced('background', presetCache.background, (sel, b) => {
    const o = document.createElement('option');
    o.value = b.slug;
    const tag = sourceTag(b.document__slug);
    o.textContent = b.name + (tag ? ` [${tag}]` : '');
    sel.appendChild(o);
  });

  $$('.srd-preset').forEach(sel => sel.addEventListener('change', onPresetChange));
}

const SOURCE_ORDER = ['wotc-srd', 'blackflag', 'o5e', 'a5e', 'toh', 'kp', 'taldorei'];

const PRESET_PLACEHOLDER = { class: 'Pick a Class…', race: 'Pick a Race…', background: 'Pick a Background…' };

function populateSourced(preset, items, addOptionFn) {
  const sel = $(`select[data-preset="${preset}"]`);
  sel.innerHTML = `<option value="">${PRESET_PLACEHOLDER[preset] || '— pick or type custom —'}</option>`;
  const grouped = {};
  items.forEach(i => {
    const k = i.document__slug || 'other';
    (grouped[k] ||= []).push(i);
  });
  const keys = Object.keys(grouped).sort((a, b) => {
    const ai = SOURCE_ORDER.indexOf(a); const bi = SOURCE_ORDER.indexOf(b);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });
  keys.forEach((k, idx) => {
    if (idx > 0) {
      const sep = document.createElement('option');
      sep.disabled = true;
      sep.textContent = `──── ${sourceTag(k) || k} ────`;
      sel.appendChild(sep);
    }
    grouped[k].sort((a, b) => a.name.localeCompare(b.name)).forEach(it => addOptionFn(sel, it));
  });
  sel.appendChild(customOption());
}

function customOption() {
  const o = document.createElement('option');
  o.value = '__custom__';
  o.textContent = 'Custom…';
  return o;
}

function setCustomMode(which, on) {
  const sel = $(`select[data-preset="${which}"]`);
  if (!sel) return;
  const field = sel.closest('.srd-field');
  if (field) field.classList.toggle('custom-mode', !!on);
}

function refreshCustomModes() {
  // Show the manual text input for any source where the user has a name but
  // no slug (i.e. they typed a Custom value in a previous session).
  ['class', 'race', 'background'].forEach(which => {
    const hasName = !!String(character[which] || '').trim();
    const hasSlug = !!String(character[which + 'Slug'] || '').trim();
    setCustomMode(which, hasName && !hasSlug);
  });
}

function onPresetChange(e) {
  const sel = e.target;
  const val = sel.value;
  const which = sel.dataset.preset;
  if (!val) {
    // "Pick a …" placeholder: wipe auto-fills, leave user edits alone.
    setCustomMode(which, false);
    if      (which === 'class')      clearClass();
    else if (which === 'race')       clearRace();
    else if (which === 'background') clearBackground();
    return;
  }
  if (val === '__custom__') {
    setCustomMode(which, true);
    character[which + 'Slug'] = '';
    if (which === 'class') {
      character.subclassSlug = '';
      character.subclass = '';
      renderClassFeatures();
    }
    if (which === 'background') applyCustomBackground();
    const input = sel.parentElement.querySelector('input[type="text"]');
    if (input) { input.focus(); input.select?.(); }
    persist();
    return;
  }
  setCustomMode(which, false);
  if (which === 'class') applyClass(val);
  else if (which === 'race') applyRace(val);
  else if (which === 'background') applyBackground(val);
}

function syncPresetSelections() {
  const setSel = (preset, slug) => {
    const sel = $(`select[data-preset="${preset}"]`);
    if (!sel) return;
    if (slug && Array.from(sel.options).some(o => o.value === slug)) {
      sel.value = slug;
    } else {
      sel.value = '';
    }
  };
  setSel('class', character.classSlug);
  setSel('race', character.raceSlug);
  setSel('background', character.backgroundSlug);
}

// ====================================================================
// Parsers
// ====================================================================
// Combined skill list — standard 5e SKILLS plus any user/background-added entries.
// Custom skills live on the character so they survive saves/loads automatically.
function allSkills() {
  return [...SKILLS, ...(character.customSkills || [])];
}
function findSkill(name) {
  if (!name) return null;
  const lower = name.toLowerCase().replace(/[^a-z\s]/g, '').trim();
  return allSkills().find(s => s.name.toLowerCase() === lower) || null;
}
/** Generate a stable key for a new custom skill, ensuring uniqueness against
 *  the standard list and any existing customs. */
function makeCustomSkillKey(name) {
  let base = String(name).toLowerCase().replace(/[^a-z0-9]+/g, '');
  if (!base) base = 'custom';
  // Custom prefix so we never collide with future SRD additions.
  let key = 'custom_' + base;
  const taken = new Set([...SKILLS.map(s => s.key), ...(character.customSkills || []).map(s => s.key)]);
  if (!taken.has(key)) return key;
  let i = 2;
  while (taken.has(`${key}${i}`)) i++;
  return `${key}${i}`;
}
function findAbility(name) {
  if (!name) return null;
  const lower = name.toLowerCase().trim();
  return ABILITIES.find(a => a.name.toLowerCase() === lower || a.key === lower) || null;
}

const NUM_WORD = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7 };

function parseSkillChoice(text) {
  // Returns: { fixed?: string[], count?: number, options?: string[]|'any' }
  // fixed = auto-granted skills; count+options = modal choice (can coexist)
  if (!text || typeof text !== 'string') return null;

  // Extract skill names from a fragment.
  //   keepUnknown=false (default) → only standard 5e skills (strict; used for fixed lists).
  //   keepUnknown=true            → also keep capitalized names like "Culture" or "Engineering"
  //                                  so A5E-style choices ("X, or Y, or Z") don't silently drop
  //                                  homebrew options. The modal renders them with a CUSTOM tag
  //                                  and the applier writes them to the Proficiencies textarea.
  function pickSkills(fragment, keepUnknown = false) {
    const cleaned = fragment
      .replace(/[.!?]/g, '')
      .replace(/\b(?:and|or)\b/gi, ',')
      .replace(/\bskills?\b/gi, '')
      .replace(/\s+/g, ' ').trim();
    const tokens = cleaned.split(/,\s*/).map(s => s.trim()).filter(Boolean);
    const out = [];
    for (let i = 0; i < tokens.length; i++) {
      const s = findSkill(tokens[i]);
      if (s) { out.push(s.name); continue; }
      // Repair "Animal, Handling" typo split
      if (i + 1 < tokens.length) {
        const joined = findSkill(tokens[i] + ' ' + tokens[i + 1]);
        if (joined) { out.push(joined.name); i++; continue; }
      }
      // Preserve non-standard names verbatim when asked. Must look like a skill
      // label (Capitalized, letters/spaces/hyphens) so we don't pick up stray words.
      if (keepUnknown && /^[A-Z][A-Za-z' \-]*$/.test(tokens[i])) {
        out.push(tokens[i]);
      }
    }
    return out;
  }

  const t = text.trim();

  // Pure "Two of your choice" / "one skill of your choice"
  let m = t.match(/^(one|two|three|four|five)\s+(?:skills?\s+)?of\s+your\s+choice/i);
  if (m) return { count: NUM_WORD[m[1].toLowerCase()], options: 'any' };

  // "any N skills"
  m = t.match(/(?:choose\s+)?any\s+(one|two|three|four|five)/i);
  if (m) return { count: NUM_WORD[m[1].toLowerCase()], options: 'any' };

  // "Your choice of N from among A, B[, and C]"
  m = t.match(/your\s+choice\s+of\s+(one|two|three|four|five)\s+from\s+among\s+(.+)/i);
  if (m) {
    const count = NUM_WORD[m[1].toLowerCase()];
    const opts = pickSkills(m[2], true);
    return { count, options: opts.length ? opts : 'any' };
  }

  // "choose N from <list>"
  m = t.match(/choose\s+(one|two|three|four|five)\s+from\s+(.+)/i);
  if (m) {
    const count = NUM_WORD[m[1].toLowerCase()];
    const opts = pickSkills(m[2], true);
    return { count, options: opts.length ? opts : 'any' };
  }

  // Mixed patterns: "[fixed], and either [A, B, or C]"
  //                 "[fixed], plus your choice of one between/from among [A or B]"
  //                 "[fixed] plus one of your choice from among [A or B]"
  const MIXED_SEPS = [
    /,\s*and\s+either\s+/i,
    /,\s*plus\s+your\s+choice\s+of\s+one\s+(?:between|from\s+among)\s+/i,
    /,\s*plus\s+one\s+of\s+your\s+choice\s+from\s+(?:among\s+)?/i,
    /\s+plus\s+one\s+of\s+your\s+choice\s+from\s+(?:among\s+)?/i,
    /,\s*plus\s+your\s+choice\s+of\s+one\s+/i,
  ];
  for (const sep of MIXED_SEPS) {
    const parts = t.split(sep);
    if (parts.length === 2) {
      const fixed = pickSkills(parts[0]);             // fixed stays strict
      const opts  = pickSkills(parts[1], true);       // keep homebrew options
      if (fixed.length || opts.length) {
        const result = {};
        if (fixed.length) result.fixed = fixed;
        result.count = 1;
        result.options = opts.length ? opts : 'any';
        return result;
      }
    }
  }

  // "SkillA, and SkillB or SkillC" — fixed SkillA, choose 1 from {SkillB, SkillC}.
  // Catches backgrounds that use "or" to signal a choice but omit "either".
  // Requires: a comma before "and", AND "or" inside the second part (≥2 options).
  // Safe guards: "SkillA, and SkillB" (no "or") falls through to allFixed below.
  m = t.match(/^(.+?),\s+and\s+(.+?\s+or\s+.+)$/i);
  if (m) {
    const fixed = pickSkills(m[1]);
    const opts  = pickSkills(m[2], true);
    if (fixed.length && opts.length >= 2) {
      return { fixed, count: 1, options: opts };
    }
  }

  // Plain comma / "and"-separated fixed list: "Insight, Religion" or "Religion and Deception"
  const allFixed = pickSkills(t);
  if (allFixed.length) return { fixed: allFixed };
  return null;
}

function parseSavingThrows(text) {
  if (!text) return [];
  return text.split(/,\s*/).map(s => findAbility(s)).filter(Boolean).map(a => a.key);
}

// Scan sentence-by-sentence: any sentence mentioning "proficiency"/"proficient"
// causes every named skill in that sentence to be granted. Handles phrasings
// like "proficiency with the Acrobatics and Stealth skills" and
// "proficiency in the Perception skill".
function extractSkillGrants(text) {
  if (!text) return [];
  const found = new Set();
  const sentences = String(text).split(/(?<=[.!?])\s+/);
  sentences.forEach(sent => {
    if (!/proficien(?:cy|t)/i.test(sent)) return;
    allSkills().forEach(s => {
      const escaped = s.name.replace(/ /g, '\\s+');
      const re = new RegExp(`\\b${escaped}\\b`);
      if (re.test(sent)) found.add(s.key);
    });
  });
  return Array.from(found);
}

// ====================================================================
// Appliers
// ====================================================================
function appendText(field, line) {
  if (!line) return;
  const cur = character[field] || '';
  if (cur.split('\n').some(l => l.trim() === line.trim())) return; // no dupes
  character[field] = cur ? (cur.replace(/\s+$/, '') + '\n' + line) : line;
}

// Auto-text bookkeeping — track exactly which text blocks each source added,
// so we can surgically remove them when the user switches class / race / background.
function ensureAutoBlocks() {
  if (!character.autoBlocks) {
    character.autoBlocks = {
      class:      { features: [], proficiencies: [], equipment: [] },
      race:       { features: [], proficiencies: [], equipment: [] },
      background: { features: [], proficiencies: [], equipment: [] },
    };
  }
  ['class','race','background'].forEach(src => {
    if (!character.autoBlocks[src]) {
      character.autoBlocks[src] = { features: [], proficiencies: [], equipment: [] };
    }
    ['features','proficiencies','equipment'].forEach(f => {
      if (!Array.isArray(character.autoBlocks[src][f])) character.autoBlocks[src][f] = [];
    });
  });
}

function appendAutoText(field, source, text) {
  if (!text) return;
  ensureAutoBlocks();
  appendText(field, text);
  // Only record if appendText actually added the line (it dedupes)
  if (String(character[field] || '').includes(text)) {
    character.autoBlocks[source][field].push(text);
  }
}

function clearAutoSource(source) {
  ensureAutoBlocks();
  const blocks = character.autoBlocks[source];
  ['features','proficiencies','equipment'].forEach(field => {
    (blocks[field] || []).forEach(block => {
      if (!block) return;
      let cur = String(character[field] || '');
      const idx = cur.indexOf(block);
      if (idx >= 0) {
        cur = cur.slice(0, idx) + cur.slice(idx + block.length);
        // Tidy up extra newlines and trim stray separators left behind
        cur = cur.replace(/\n{3,}/g, '\n\n').replace(/^\s+/, '').replace(/\s+$/, '');
        character[field] = cur;
      }
    });
    blocks[field] = [];
  });
}

// Strip everything that was auto-applied for a source, restoring user-added
// content untouched. Called when the user picks "Pick a Class/Race/Background…"
// (the empty placeholder) to wipe auto-fills without resetting manual edits.
function clearClass() {
  clearAutoSource('class');
  clearSubclassSkillGrants();
  const src = character.skillSources || {};
  Object.keys(src).forEach(key => {
    if (src[key] === 'class') {
      if (character.skills[key]) character.skills[key].prof = false;
      delete src[key];
    }
  });
  character.class = '';
  character.classSlug = '';
  character.subclass = '';
  character.subclassSlug = '';
  character.classSkillCount = 0;
  character.classSkillOptions = 'any';
  character.cachedClass = null;
  applyClassPools('');
  renderAll();
  persist();
  toast('Class cleared');
}

function clearRace() {
  clearAutoSource('race');
  const src = character.skillSources || {};
  Object.keys(src).forEach(key => {
    if (src[key] === 'race' || src[key] === 'race-pick' || src[key] === 'race-free') {
      if (character.skills[key]) character.skills[key].prof = false;
      delete src[key];
    }
  });
  character.race = '';
  character.raceSlug = '';
  character.racialBonuses = {};
  character.raceFeatSlot = false;
  character.raceSkillCount = 0;
  character.raceSkillOptions = 'any';
  character.raceFixedSkills = [];
  character.baseSpeed       = 0;
  character.cachedRace      = null;
  // Re-apply other fixed grants so they can reclaim any slots the race was holding.
  reapplyOtherFixedGrants('race');
  renderAll();
  persist();
  toast('Race cleared');
}

function clearBackground() {
  clearAutoSource('background');
  const src = character.skillSources || {};
  Object.keys(src).forEach(key => {
    if (src[key] === 'background' || src[key] === 'bg-pick' || src[key] === 'bg-free') {
      if (character.skills[key]) character.skills[key].prof = false;
      delete src[key];
    }
  });
  character.background = '';
  character.backgroundSlug = '';
  character.bgSkillCount = 0;
  character.bgFixedCount = 0;
  character.bgSkillOptions = 'any';
  character.cachedBackground = null;
  // Re-apply other fixed grants so they can reclaim any slots the background was holding.
  reapplyOtherFixedGrants('background');
  renderAll();
  persist();
  toast('Background cleared');
}

function applyClass(slug) {
  const c = presetCache.class.find(x => x.slug === slug);
  if (!c) { toast('SRD class data not loaded — connect to apply a new class'); return; }

  // Reset stale subclass, skill sources, and previously-auto-added text when switching classes
  if (character.classSlug !== c.slug) {
    clearAutoSource('class');
    clearSubclassSkillGrants();
    const src = character.skillSources || {};
    Object.keys(src).forEach(key => {
      if (src[key] === 'class') {
        if (character.skills[key]) character.skills[key].prof = false;
        delete src[key];
      }
    });
    character.classSkillCount = 0;
    character.classSkillOptions = 'any';
    character.subclassSlug = '';
    character.subclass = '';
  }
  character.class = c.name;
  character.classSlug = c.slug;
  character.cachedClass = c;   // store the class data so the sheet works offline
  applyClassPools(c.slug);
  if (CLASS_SPELL_ABILITY[c.slug]) character.spellAbility = CLASS_SPELL_ABILITY[c.slug];

  // Hit dice
  if (c.hit_dice) {
    const dieMatch = String(c.hit_dice).match(/d(4|6|8|10|12)/);
    if (dieMatch) character.hitDie = 'd' + dieMatch[1];
    character.hitDiceTotal = `${character.level}${c.hit_dice.replace(/^1/, '')}`;
    character.hitDiceCurrent = character.hitDiceTotal;
  }

  // Saving throws — set proficient
  parseSavingThrows(c.prof_saving_throws).forEach(k => { character.saves[k] = true; });

  // Append profs to "Proficiencies & Languages" text — bundled as one section with trailing separator
  const classProfs = [];
  if (c.prof_armor)   classProfs.push(`Armor: ${c.prof_armor}`);
  if (c.prof_weapons) classProfs.push(`Weapons: ${c.prof_weapons}`);
  if (c.prof_tools)   classProfs.push(`Tools: ${c.prof_tools}`);
  if (classProfs.length) appendAutoText('proficiencies', 'class', classProfs.join('\n') + '\n---');

  // Skills — choice flow
  const skillChoice = parseSkillChoice(c.prof_skills);
  if (skillChoice && skillChoice.fixed) {
    character.classSkillCount = skillChoice.fixed.length;
    character.classSkillOptions = skillChoice.fixed;
    skillChoice.fixed.forEach(n => {
      const s = findSkill(n);
      if (s) ensureSkillProf(s.key, 'class');
    });
    toast(`${c.name} applied — skills auto-set`);
    renderAll();
    persist();
  } else if (skillChoice && skillChoice.count) {
    character.classSkillCount = skillChoice.count;
    character.classSkillOptions = skillChoice.options; // 'any' or array of names
    const optionList = skillChoice.options === 'any'
      ? SKILLS.map(s => s.name)
      : skillChoice.options;
    openSkillChoiceModal({
      title: `${c.name}: choose ${skillChoice.count} skills`,
      summary: c.prof_skills,
      count: skillChoice.count,
      options: optionList,
      onApply: chosen => {
        chosen.forEach(n => { const s = findSkill(n); if (s) ensureSkillProf(s.key, 'class'); });
        renderAll();
        persist();
      }
    });
    renderAll(); // reflect non-skill changes immediately
    persist();
  } else {
    if (c.prof_skills) appendAutoText('proficiencies', 'class', `Skills: ${c.prof_skills}`);
    toast(`${c.name} applied`);
    renderAll();
    persist();
  }
}

function ensureSkillProf(key, source) {
  if (!character.skillSources) character.skillSources = {};
  if (!character.skills[key]) character.skills[key] = { prof: false, exp: false, misc: 0 };
  character.skills[key].prof = true;
  if (!source) return;
  const existing   = character.skillSources[key];
  // Fixed grants (background/subclass/race) beat user picks (class/bg-pick/subclass-pick/race-pick).
  // User picks don't overwrite fixed grants. Same-tier stays first-wins.
  const isFixed    = source === 'background' || source === 'subclass' || source === 'race';
  const isUserPick = existing === 'class' || existing === 'bg-pick' || existing === 'subclass-pick' || existing === 'race-pick';
  if (!existing || (isFixed && isUserPick)) {
    character.skillSources[key] = source;
  }
}

/**
 * After clearing or re-applying one source's fixed grants, re-run the other
 * sources' fixed grants so they can claim any newly-freed slots (or so the
 * free-pick counts re-compute correctly). `exceptSource` is the source that
 * just ran — we skip it to avoid double-processing.
 */
function reapplyOtherFixedGrants(exceptSource) {
  if (exceptSource !== 'background' && character.cachedBackground) {
    const sc = parseSkillChoice(character.cachedBackground.skill_proficiencies);
    (sc ? sc.fixed || [] : []).forEach(n => {
      const s = findSkill(n);
      if (s) ensureSkillProf(s.key, 'background');
    });
  }
  if (exceptSource !== 'race') {
    (character.raceFixedSkills || []).forEach(k => ensureSkillProf(k, 'race'));
  }
  if (exceptSource !== 'subclass') {
    (character.subclassFixedSkills || []).forEach(k => ensureSkillProf(k, 'subclass'));
  }
}

function clearSubclassSkillGrants() {
  const src = character.skillSources || {};
  Object.keys(src).forEach(key => {
    if (src[key] === 'subclass' || src[key] === 'subclass-pick' || src[key] === 'subclass-free') {
      if (character.skills[key]) character.skills[key].prof = false;
      delete src[key];
    }
  });
  character.subclassSkillCount   = 0;
  character.subclassSkillOptions = 'any';
  character.subclassSkillPicked  = false;
  character.subclassFixedSkills  = [];
}

function applyRace(value) {
  // value may be "elf" or "elf:high-elf"
  const [baseSlug, subSlug] = value.split(':');
  const r = presetCache.race.find(x => x.slug === baseSlug);
  if (!r) { toast('SRD race data not loaded — connect to apply a new race'); return; }
  const sub = subSlug ? (r.subraces || []).find(s => s.slug === subSlug) : null;

  // Clear previous race's auto-added text and skill sources before applying the new one
  if (character.raceSlug !== value) {
    clearAutoSource('race');
    const src = character.skillSources || {};
    Object.keys(src).forEach(key => {
      if (src[key] === 'race' || src[key] === 'race-pick' || src[key] === 'race-free') {
        if (character.skills[key]) character.skills[key].prof = false;
        delete src[key];
      }
    });
    character.raceSkillCount   = 0;
    character.raceSkillOptions = 'any';
    character.raceFixedSkills  = [];
  }

  character.race = sub ? `${r.name} (${sub.name})` : r.name;
  character.raceSlug = value;
  character.cachedRace = r;     // cache for offline rendering / re-pick
  // Subrace speed (e.g. Wood Elf 35) overrides parent race speed (Elf 30).
  const speedWalk = (sub && sub.speed && sub.speed.walk) || (r.speed && r.speed.walk) || 0;
  if (speedWalk) {
    character.baseSpeed = speedWalk;
    character.speed     = speedWalk + sumFeatSpeedBonuses();
  }

  // Parse and apply racial ASI bonuses
  character.racialBonuses = {};
  // Reset and re-evaluate any free-feat grant (Variant Human, etc.)
  character.raceFeatSlot = !!(sub && sub.grantsFeat);
  // Variant Human (replacesBaseAsi) skips the base race's fixed ASIs entirely
  const baseAsi = (sub && sub.replacesBaseAsi) ? [] : (r.asi || []);
  const allAsi = [...baseAsi, ...(sub ? (sub.asi || []) : [])];
  const chooseBonuses = []; // values for "Other"/"choose" entries
  allAsi.forEach(item => {
    (item.attributes || []).forEach(attr => {
      const lower = String(attr).toLowerCase().trim();
      if (lower === 'other' || lower === 'choose') {
        chooseBonuses.push(Number(item.value) || 1);
      } else {
        const key = findAbilityKey(attr);
        if (key) character.racialBonuses[key] = (character.racialBonuses[key] || 0) + (Number(item.value) || 0);
      }
    });
  });

  // Auto-grant any unambiguous skill profs found in trait text
  const grants = new Set([
    ...extractSkillGrants(r.traits),
    ...(sub ? extractSkillGrants(sub.traits) : []),
  ]);
  grants.forEach(k => ensureSkillProf(k, 'race'));
  character.raceFixedSkills = Array.from(grants);
  // Re-apply background/subclass fixed grants in case any slots were freed or contested
  reapplyOtherFixedGrants('race');

  // Append traits & languages to readable fields. Each generated block ends
  // with `---` so Markup view shows a visible separator between sections.
  if (r.traits) appendAutoText('features', 'race', `--- ${r.name} traits ---\n${stripMarkdown(r.traits)}\n---`);
  if (sub && sub.traits) appendAutoText('features', 'race', `--- ${sub.name} traits ---\n${stripMarkdown(sub.traits)}\n---`);
  if (r.languages) appendAutoText('proficiencies', 'race', stripMarkdown(r.languages));
  // Skip the base race's ASI description when the subrace replaces it entirely
  // (e.g. Variant Human replaces "+1 to all six scores" with its own wording).
  if (r.asi_desc && !(sub && sub.replacesBaseAsi)) appendAutoText('features', 'race', `${stripMarkdown(r.asi_desc)}\n---`);
  if (sub && sub.asi_desc) appendAutoText('features', 'race', `${stripMarkdown(sub.asi_desc)}\n---`);

  renderAll();
  persist();
  toast(`${character.race} applied${grants.size ? ' — auto-set ' + Array.from(grants).join(', ') : ''}`);

  // Chain: racial ASI modal → variant skill choice → feat reminder
  const needsSkillChoice = sub && sub.variantSkillChoice;
  const needsFeat        = sub && sub.grantsFeat;

  function afterASI() {
    if (needsSkillChoice) {
      const vc = sub.variantSkillChoice;
      character.raceSkillCount   = vc.count || 1;
      character.raceSkillOptions = vc.options || 'any';
      openSkillChoiceModal({
        title: `${character.race}: choose ${vc.count} skill`,
        summary: 'Variant Humans gain proficiency in one skill of their choice.',
        count: vc.count,
        options: vc.options === 'any' ? SKILLS.map(s => s.name) : vc.options,
        onApply: chosen => {
          chosen.forEach(n => { const sk = findSkill(n); if (sk) ensureSkillProf(sk.key, 'race-pick'); });
          renderAll();
          persist();
          if (needsFeat) toast('Variant Human: choose a feat in the Feats section!');
        }
      });
    } else if (needsFeat) {
      toast('Variant Human: choose a feat in the Feats section!');
    }
  }

  if (chooseBonuses.length) openRacialASIModal(chooseBonuses, afterASI);
  else afterASI();
}

// Detect whether the current race has any "choose" ASI entries that can be
// re-allocated (Variant Human, Half-Elf, etc.). Returns the list of values
// (e.g. [1,1]) or [] if there's nothing to re-pick.
function getRaceChooseBonuses() {
  if (!character.raceSlug) return [];
  const [baseSlug, subSlug] = String(character.raceSlug).split(':');
  const r = getRaceData();
  if (!r) return [];
  const sub = subSlug ? (r.subraces || []).find(s => s.slug === subSlug) : null;
  const baseAsi = (sub && sub.replacesBaseAsi) ? [] : (r.asi || []);
  const allAsi = [...baseAsi, ...(sub ? (sub.asi || []) : [])];
  const out = [];
  allAsi.forEach(item => {
    (item.attributes || []).forEach(attr => {
      const lower = String(attr).toLowerCase().trim();
      if (lower === 'other' || lower === 'choose') out.push(Number(item.value) || 1);
    });
  });
  return out;
}

// Re-derive racial bonuses from the race's fixed ASIs only, then re-open the
// modal so the user can re-allocate their choose-style bonuses.
function reopenRacialASIModal() {
  const chooseBonuses = getRaceChooseBonuses();
  if (chooseBonuses.length === 0) { toast('No re-pickable racial bonuses on this race'); return; }
  const [baseSlug, subSlug] = String(character.raceSlug).split(':');
  const r = getRaceData();
  if (!r) return;
  const sub = subSlug ? (r.subraces || []).find(s => s.slug === subSlug) : null;
  // Re-derive fixed-only bonuses, clearing any prior chosen ones
  character.racialBonuses = {};
  const baseAsi = (sub && sub.replacesBaseAsi) ? [] : (r.asi || []);
  const allAsi = [...baseAsi, ...(sub ? (sub.asi || []) : [])];
  allAsi.forEach(item => {
    (item.attributes || []).forEach(attr => {
      const lower = String(attr).toLowerCase().trim();
      if (lower === 'other' || lower === 'choose') return;
      const key = findAbilityKey(attr);
      if (key) character.racialBonuses[key] = (character.racialBonuses[key] || 0) + (Number(item.value) || 0);
    });
  });
  renderAll();
  openRacialASIModal(chooseBonuses);
}

function openRacialASIModal(chooseBonuses, onAfter) {
  const rows = chooseBonuses.map((val, i) => {
    const opts = ABILITIES.map(a => `<option value="${a.key}">${a.name}</option>`).join('');
    return `<div class="racial-asi-row">
      <label>+${val} to:</label>
      <select class="racial-asi-sel" data-idx="${i}" data-val="${val}">
        <option value="">— pick —</option>${opts}
      </select>
    </div>`;
  }).join('');

  showModal({
    title: `${character.race}: choose ability increases`,
    bodyHTML: `<div class="racial-asi-wrap">${rows}</div>`,
    confirmText: 'Apply',
    onConfirm: () => {
      const picks = $$('#modal-body .racial-asi-sel');
      if (picks.some(s => !s.value)) { toast('Pick all ability scores'); return false; }
      picks.forEach(s => {
        const k = s.value;
        const v = Number(s.dataset.val) || 1;
        character.racialBonuses[k] = (character.racialBonuses[k] || 0) + v;
      });
      renderAll();
      persist();
      if (onAfter) setTimeout(onAfter, 50);
      return true;
    }
  });
}

function applyBackground(slug) {
  const b = presetCache.background.find(x => x.slug === slug);
  if (!b) { toast('SRD background data not loaded — connect to apply a new background'); return; }

  // Clear old background skill grants and auto-text when switching backgrounds
  if (character.backgroundSlug !== b.slug) {
    clearAutoSource('background');
    const src = character.skillSources || {};
    Object.keys(src).forEach(key => {
      if (src[key] === 'background' || src[key] === 'bg-pick' || src[key] === 'bg-free') {
        if (character.skills[key]) character.skills[key].prof = false;
        delete src[key];
      }
    });
    character.bgSkillCount = 0;
    character.bgFixedCount = 0;
    character.bgSkillOptions = 'any';
  }

  character.background = b.name;
  character.backgroundSlug = b.slug;
  character.cachedBackground = b;

  const sc = parseSkillChoice(b.skill_proficiencies);
  let openedModal = false;

  if (sc) {
    const fixedSkills = sc.fixed || [];
    character.bgFixedCount = fixedSkills.length;
    // Auto-grant any fixed skills (e.g. "Deception" in "Deception, and either Insight or SoH")
    fixedSkills.forEach(n => { const s = findSkill(n); if (s) ensureSkillProf(s.key, 'background'); });
    // Re-apply race/subclass fixed grants in case any slots were freed or contested
    reapplyOtherFixedGrants('background');
    // Open a choice modal for the pick portion (if any)
    if (sc.count) {
      character.bgSkillCount = sc.count;
      character.bgSkillOptions = sc.options;
      const optionList = sc.options === 'any' ? SKILLS.map(s => s.name) : sc.options;

      // Auto-add any non-standard option names (e.g. A5E "Culture", "Engineering")
      // as custom skills so the modal lists them as real choices and the user
      // can check the proficiency box like any other skill. They're tagged [BG]
      // and remain in the skill list (the user can remove them with × later).
      optionList.forEach(name => {
        if (findSkill(name)) return;                                       // already exists
        if (!/^[A-Z][A-Za-z' \-]*$/.test(name)) return;                    // not a skill-looking label
        const key = makeCustomSkillKey(name);
        if (!character.customSkills) character.customSkills = [];
        character.customSkills.push({ key, name, ability: 'int', source: 'background' });
      });

      openedModal = true;
      openSkillChoiceModal({
        title: `${b.name}: choose ${sc.count} skill${sc.count > 1 ? 's' : ''}`,
        summary: b.skill_proficiencies,
        count: sc.count,
        options: optionList,
        onApply: chosen => {
          chosen.forEach(n => { const s = findSkill(n); if (s) ensureSkillProf(s.key, 'bg-pick'); });
          renderAll();
          persist();
        }
      });
    }
  } else if (b.skill_proficiencies) {
    appendAutoText('proficiencies', 'background', `Skills: ${b.skill_proficiencies}`);
  }

  if (b.tool_proficiencies) appendAutoText('proficiencies', 'background', `Tools: ${b.tool_proficiencies}`);
  if (b.languages)          appendAutoText('proficiencies', 'background', `Languages: ${b.languages}`);
  if (b.equipment)          appendAutoText('equipment',     'background', `${b.name} starting equipment: ${b.equipment}\n---`);
  if (b.feature)            appendAutoText('features',      'background', `--- ${b.feature} (${b.name}) ---\n${b.feature_desc || ''}\n---`);

  renderAll();
  persist();
  if (!openedModal) toast(`${b.name} applied`);
}

/**
 * Custom backgrounds: open the same "pick 2 skills" modal that real backgrounds use.
 * Idempotent — re-entering Custom while already configured does NOT re-open the modal
 * (avoids wiping a user's existing picks on an accidental re-click).
 */
function applyCustomBackground() {
  const alreadyCustom = !character.backgroundSlug
                     && character.bgSkillCount === 2
                     && character.bgFixedCount === 0
                     && character.bgSkillOptions === 'any';
  if (alreadyCustom) return;

  // Wipe any leftover skill grants from a prior (real) background.
  clearAutoSource('background');
  const src = character.skillSources || {};
  Object.keys(src).forEach(key => {
    if (src[key] === 'background' || src[key] === 'bg-pick' || src[key] === 'bg-free') {
      if (character.skills[key]) character.skills[key].prof = false;
      delete src[key];
    }
  });

  character.bgSkillCount   = 2;
  character.bgFixedCount   = 0;
  character.bgSkillOptions = 'any';
  character.cachedBackground = null;

  openSkillChoiceModal({
    title:   'Custom Background: choose 2 skills',
    summary: 'Pick any two skills as background proficiencies.',
    count:   2,
    options: SKILLS.map(s => s.name),
    onApply: chosen => {
      chosen.forEach(n => { const s = findSkill(n); if (s) ensureSkillProf(s.key, 'bg-pick'); });
      renderAll();
      persist();
    },
  });
}

function stripMarkdown(s) {
  return String(s).replace(/\*\*/g, '').replace(/_/g, '').replace(/\\\./g, '.');
}

function parseSpellLevel(v) {
  if (typeof v === 'number') return v;
  if (!v) return 0;
  const s = String(v).toLowerCase();
  if (s.includes('cantrip')) return 0;
  const m = s.match(/(\d+)/);
  return m ? Math.min(9, Number(m[1])) : 0;
}

// ====================================================================
// Skill-choice modal
// ====================================================================
function openSkillChoiceModal({ title, summary, count, options, onApply }) {
  const opts = options.map(name => {
    const s = findSkill(name);
    // Resolve whether this is a freshly-added bg/manual custom skill so we can
    // show a small chip clarifying that it's not in the standard 18.
    const customDef = s && (character.customSkills || []).find(c => c.key === s.key);
    const ability = s ? s.ability.toUpperCase() : '';
    const customChip = customDef
      ? ` <span class="skill-src-tag skill-src-${customDef.source === 'background' ? 'background' : 'custom'}" title="${customDef.source === 'background' ? 'Added by this background' : 'Custom skill'}">${customDef.source === 'background' ? 'BG' : 'CUSTOM'}</span>`
      : '';
    return `<div class="choice-row" data-name="${escapeAttr(name)}">
      <input type="checkbox" class="choice-cb">
      <label>${escapeHTML(name)}${customChip}</label>
      <span class="ability-tag" style="margin-left:auto;color:var(--text-faint);font-size:0.7rem">${ability}</span>
    </div>`;
  }).join('');

  const body = `
    ${summary ? `<div class="modal-summary">${escapeHTML(summary)}</div>` : ''}
    <div class="choice-counter" id="choice-counter">0 / ${count} selected</div>
    <div class="choice-list">${opts}</div>
  `;
  showModal({
    title,
    bodyHTML: body,
    confirmText: 'Apply',
    onConfirm: () => {
      const chosen = $$('#modal-body .choice-row input:checked').map(cb =>
        cb.closest('.choice-row').dataset.name
      );
      if (chosen.length !== count) {
        toast(`Pick exactly ${count}`);
        return false;
      }
      onApply(chosen);
      return true;
    }
  });

  const counter = $('#choice-counter');
  const rows = $$('#modal-body .choice-row');
  function refresh() {
    const checked = rows.filter(r => r.querySelector('input').checked);
    counter.textContent = `${checked.length} / ${count} selected`;
    counter.classList.toggle('full', checked.length === count);
    rows.forEach(r => {
      const cb = r.querySelector('input');
      const atLimit = checked.length >= count && !cb.checked;
      r.classList.toggle('disabled', atLimit);
      cb.disabled = atLimit;
    });
  }
  rows.forEach(r => {
    r.addEventListener('click', e => {
      if (r.classList.contains('disabled')) return;
      if (e.target.tagName !== 'INPUT') {
        const cb = r.querySelector('input');
        cb.checked = !cb.checked;
      }
      refresh();
    });
  });
  refresh();
}

// ====================================================================
// Rest modal
// ====================================================================
function buildRestModalBody(type) {
  const hdRemain = Math.max(0, parseInt(character.hitDiceCurrent) || 0);
  const hdMax    = Math.max(1, parseInt(character.hitDiceTotal)   || 0);
  const die      = character.hitDie || 'd8';
  const dieSize  = parseInt(die.replace('d', '')) || 8;
  const conMod   = abilityMod(totalAbility('con'));
  const pools    = character.resourcePools || [];

  const tabBar = `
    <div class="rest-tabs">
      <button class="rest-tab${type === 'short' ? ' active' : ''}" data-rest-type="short">Short Rest</button>
      <button class="rest-tab${type === 'long'  ? ' active' : ''}" data-rest-type="long">Long Rest</button>
    </div>`;

  if (type === 'short') {
    const shortPools = pools.filter(p => p.resetOn === 'Short Rest' && !p.unlimited && p.used > 0);
    const restoreList = shortPools.length
      ? `<div class="rest-restore-list"><strong>Will also restore:</strong> ${shortPools.map(p => escapeHTML(p.name)).join(', ')}</div>`
      : '';
    return `${tabBar}
      <div class="rest-stat-row">
        <span>Hit Die: <strong>${die}</strong></span>
        <span>CON: <strong>${fmtMod(conMod)}</strong> per die</span>
        <span>HP: <strong>${character.hpCurrent}/${character.hpMax}</strong></span>
        <span>HD Remaining: <strong>${hdRemain}/${hdMax}</strong></span>
      </div>
      ${character.hpCurrent >= character.hpMax ? '<div class="rest-at-full">HP already at maximum.</div>' : ''}
      ${hdRemain <= 0 ? '<div class="rest-at-full">No Hit Dice remaining to spend.</div>' : `
      <div class="rest-hd-row">
        <label for="rest-hd-count">Spend</label>
        <input type="number" id="rest-hd-count" value="1" min="1" max="${hdRemain}">
        <span>Hit ${hdRemain === 1 ? 'Die' : 'Dice'} (${die} + ${fmtMod(conMod)} each)</span>
      </div>
      <button class="btn" id="rest-roll-btn">Roll!</button>`}
      <div id="rest-results"></div>
      ${restoreList}`;
  } else {
    const regained  = Math.max(1, Math.floor(hdMax / 2));
    const newHD     = Math.min(hdMax, hdRemain + regained);
    const hpGain    = character.hpMax - character.hpCurrent;
    const allPools  = pools.filter(p => p.used > 0 || p.unlimited);
    const slotCount = Object.values(character.spellSlots || {}).filter(s => s.used > 0).length;
    return `${tabBar}
      <div class="rest-long-list">
        <div class="rest-long-item">✦ HP restored to full${hpGain > 0 ? ` (+${hpGain})` : ' (already full)'}</div>
        ${slotCount > 0 ? `<div class="rest-long-item">✦ All spell slots restored</div>` : ''}
        ${allPools.length > 0 ? `<div class="rest-long-item">✦ All resources restored (${allPools.map(p=>escapeHTML(p.name)).join(', ')})</div>` : ''}
        <div class="rest-long-item">✦ Regain ${regained} Hit ${regained===1?'Die':'Dice'} &nbsp;<span class="rest-dim">(${hdRemain}/${hdMax} → ${newHD}/${hdMax})</span></div>
      </div>`;
  }
}

function wireRestModalEvents() {
  $$('#modal-body .rest-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const type = tab.dataset.restType;
      $('#modal-body').innerHTML = buildRestModalBody(type);
      const confirmBtn = $('#modal-confirm');
      if (confirmBtn) confirmBtn.textContent = type === 'long' ? 'Take Long Rest' : 'Confirm Short Rest';
      _pendingRestData = type === 'long' ? { type: 'long' } : null;
      wireRestModalEvents();
    });
  });

  const rollBtn = $('#rest-roll-btn');
  if (rollBtn) {
    rollBtn.addEventListener('click', () => {
      const countEl = $('#rest-hd-count');
      const count   = Math.max(1, Math.min(parseInt(countEl?.value) || 1, parseInt(character.hitDiceCurrent) || 0));
      if (count <= 0) return;
      const dieSize = parseInt((character.hitDie || 'd8').replace('d', '')) || 8;
      const conMod  = abilityMod(totalAbility('con'));
      const rolls   = Array.from({ length: count }, () => Math.floor(Math.random() * dieSize) + 1);
      const raw     = rolls.reduce((s, r) => s + r, 0);
      const conBonus = conMod * count;
      const total   = Math.max(0, raw + conBonus);
      const actual  = Math.min(total, character.hpMax - character.hpCurrent);

      _pendingRestData = { type: 'short', hdSpent: count, hpHealed: actual, rolls };

      const el = $('#rest-results');
      if (!el) return;
      const dieHtml = rolls.map(r => `<span class="rest-die">${r}</span>`).join(' ');
      el.innerHTML = `
        <div class="rest-roll-line">Rolls: ${dieHtml}</div>
        ${conBonus !== 0 ? `<div class="rest-roll-line">CON ${fmtMod(conMod)} × ${count} = <strong>${conBonus >= 0 ? '+' : ''}${conBonus}</strong></div>` : ''}
        <div class="rest-roll-total">
          Heal <strong>${total} HP</strong>${actual < total ? ` <span class="rest-dim">(${actual} applied, HP already near max)</span>` : ''}
        </div>`;
    });
  }
}

function applyRest({ type, hdSpent, hpHealed, rolls }) {
  const die = (character.hitDie || 'd8').replace(/^d/, '');
  if (type === 'short') {
    character.hpCurrent = Math.min(character.hpMax, character.hpCurrent + (hpHealed || 0));
    const rem = Math.max(0, (parseInt(character.hitDiceCurrent) || 0) - hdSpent);
    character.hitDiceCurrent = `${rem}d${die}`;
    (character.resourcePools || []).forEach(p => { if (p.resetOn === 'Short Rest') p.used = 0; });
    toast(`Short rest: +${hpHealed} HP, ${hdSpent} HD spent`);
  } else {
    character.hpCurrent = character.hpMax;
    const hdMax   = parseInt(character.hitDiceTotal) || 0;
    const hdRem   = parseInt(character.hitDiceCurrent) || 0;
    const regained = Math.max(1, Math.floor(hdMax / 2));
    character.hitDiceCurrent = `${Math.min(hdMax, hdRem + regained)}d${die}`;
    (character.resourcePools || []).forEach(p => { p.used = 0; });
    Object.values(character.spellSlots || {}).forEach(s => { if (s) s.used = 0; });
    toast('Long rest complete — HP, HD, and all resources restored');
  }
  renderAll();
  persist();
}

function openRestModal(defaultType = 'short') {
  _pendingRestData = defaultType === 'long' ? { type: 'long' } : null;
  showModal({
    title: '⛺ Take a Rest',
    bodyHTML: buildRestModalBody(defaultType),
    confirmText: defaultType === 'long' ? 'Take Long Rest' : 'Confirm Short Rest',
    onConfirm: () => {
      if (!_pendingRestData) { toast('Roll your Hit Dice first'); return false; }
      applyRest(_pendingRestData);
      _pendingRestData = null;
      return true;
    }
  });
  wireRestModalEvents();
}

// ====================================================================
// Resource Pools
// ====================================================================
// Default spellcasting ability for each base SRD class
const CLASS_SPELL_ABILITY = {
  bard: 'cha', cleric: 'wis', druid: 'wis', paladin: 'cha',
  ranger: 'wis', sorcerer: 'cha', warlock: 'cha', wizard: 'int',
};

// Class-granted Expertise (double proficiency bonus) — unlocks at given level
const CLASS_EXPERTISE = {
  bard:  [{ level: 3, count: 2 }, { level: 10, count: 2 }],
  rogue: [{ level: 1, count: 2 }, { level: 6,  count: 2 }],
};

function expertiseSlots() {
  const slug = character.classSlug;
  const lvl  = Math.max(1, Math.min(20, Number(character.level) || 1));
  const defs = CLASS_EXPERTISE[slug] || [];
  return defs.reduce((s, d) => s + (d.level <= lvl ? d.count : 0), 0);
}

const CLASS_POOL_DEFS = {
  'barbarian': [
    { id: 'rages', name: 'Rages', resetOn: 'Long Rest',
      computeMax() {
        const l = Math.max(1, Math.min(20, Number(character.level) || 1));
        if (l >= 20) return -1; // unlimited
        return [2,2,3,3,3,4,4,4,4,4,4,5,5,5,5,5,6,6,6,0][l - 1];
      }},
  ],
  'bard': [
    { id: 'bardic-inspiration', name: 'Bardic Inspiration', resetOn: 'Long Rest',
      computeMax() { return Math.max(1, abilityMod(totalAbility('cha'))); }},
  ],
  'cleric': [
    { id: 'channel-divinity', name: 'Channel Divinity', resetOn: 'Short Rest',
      computeMax() {
        const l = Number(character.level) || 1;
        return l >= 18 ? 3 : l >= 6 ? 2 : 1;
      }},
  ],
  'druid': [
    { id: 'wild-shape', name: 'Wild Shape', resetOn: 'Short Rest',
      computeMax() { return 2; }},
  ],
  'fighter': [
    { id: 'second-wind', name: 'Second Wind', resetOn: 'Short Rest',
      computeMax() { return 1; }},
    { id: 'action-surge', name: 'Action Surge', resetOn: 'Short Rest',
      computeMax() { return (Number(character.level) || 1) >= 17 ? 2 : 1; }},
  ],
  'monk': [
    { id: 'ki-points', name: 'Ki Points', resetOn: 'Short Rest',
      computeMax() { return Math.max(1, Math.min(20, Number(character.level) || 1)); }},
  ],
  'paladin': [
    { id: 'channel-divinity', name: 'Channel Divinity', resetOn: 'Short Rest',
      computeMax() { return 1; }},
    { id: 'lay-on-hands', name: 'Lay on Hands (HP)', resetOn: 'Long Rest',
      computeMax() { return Math.max(1, Math.min(20, Number(character.level) || 1)) * 5; }},
  ],
  'ranger': [
    { id: 'hunters-mark', name: "Hunter's Mark (slots)", resetOn: 'Long Rest',
      computeMax() {
        const l = Number(character.level) || 1;
        return l >= 17 ? 3 : l >= 9 ? 2 : 1;
      }},
  ],
  'sorcerer': [
    { id: 'sorcery-points', name: 'Sorcery Points', resetOn: 'Long Rest',
      computeMax() { const l = Number(character.level) || 1; return l < 2 ? 0 : l; }},
  ],
  'wizard': [
    { id: 'arcane-recovery', name: 'Arcane Recovery', resetOn: 'Long Rest',
      computeMax() { return 1; }},
  ],
};

function applyClassPools(classSlug) {
  if (!character.resourcePools) character.resourcePools = [];
  // Remove all non-custom pools (they'll be rebuilt for the new class)
  character.resourcePools = character.resourcePools.filter(p => p.custom);
  const defs = CLASS_POOL_DEFS[classSlug] || [];
  defs.forEach(def => {
    const max = def.computeMax();
    if (max === 0) return; // level gate (e.g. sorcery points before lvl 2)
    character.resourcePools.push({
      key:      classSlug + ':' + def.id,
      name:     def.name,
      max,
      baseMax:  max < 0 ? max : max,  // base count from class table (or -1 unlimited)
      bonus:    0,                    // user-added extras beyond what the class grants
      used:     0,
      unlimited: max < 0,
      classKey: classSlug,
      resetOn:  def.resetOn,
      custom:   false,
    });
  });
}

function renderResourcePools() {
  const wrap = $('#resource-pools');
  if (!wrap) return;
  const pools = character.resourcePools || [];

  // Recompute max for class-defined pools; clamp used.
  // For class pools: max = baseMax + bonus. For custom pools: max stays as user-set.
  pools.forEach(p => {
    if (p.custom) return;
    if (!p.classKey || !p.key) return;
    const defId = p.key.slice(p.classKey.length + 1);
    const def = (CLASS_POOL_DEFS[p.classKey] || []).find(d => d.id === defId);
    if (!def) return;
    const auto = def.computeMax();
    p.baseMax  = auto;
    p.bonus    = Number(p.bonus) || 0;
    p.unlimited = auto < 0;
    if (p.unlimited) { p.max = -1; p.used = 0; return; }
    p.max = Math.max(1, auto + p.bonus);
    if (p.used > p.max) p.used = p.max;
  });

  wrap.innerHTML = '';
  const visible = pools.filter(p => p.unlimited || p.max > 0);
  if (!visible.length) {
    wrap.innerHTML = '<p class="srd-hint" style="margin:4px 0">No resources tracked. Pick a class or add a custom pool.</p>';
    return;
  }

  visible.forEach(pool => {
    const idx = pools.indexOf(pool);
    const isNumeric = !pool.unlimited && pool.max > 20;
    const baseMax = pool.custom ? pool.max : Math.max(0, Number(pool.baseMax) || 0);
    const el = document.createElement('div');
    el.className = 'rp-entry';

    let bodyHtml = '';
    if (pool.unlimited) {
      bodyHtml = '<span class="rp-unlimited" title="Unlimited">∞</span>';
    } else if (isNumeric) {
      const cur = pool.max - pool.used;
      bodyHtml = `<div class="rp-numeric">
        <input type="number" class="rp-cur-input" data-rp="${idx}" value="${cur}" min="0" max="${pool.max}">
        <span class="rp-num-sep">/ ${pool.max}</span>
      </div>`;
    } else {
      let bubbles = '';
      for (let i = 0; i < pool.max; i++) {
        const isUsed  = i >= (pool.max - pool.used);
        const isBonus = !pool.custom && i >= baseMax;
        const cls = ['rp-bubble'];
        if (isUsed)  cls.push('used');
        if (isBonus) cls.push('bonus');
        const title = isBonus
          ? (isUsed ? 'Bonus slot — spent — click to restore' : 'Bonus slot — click to spend')
          : (isUsed ? 'Spent — click to restore' : 'Available — click to spend');
        bubbles += `<span class="${cls.join(' ')}" data-rp="${idx}" title="${title}"></span>`;
      }
      bodyHtml = `<div class="rp-bubbles">${bubbles}</div>`;
    }

    // Step buttons: shown for non-unlimited pools so the user can add/remove a slot.
    const steppers = pool.unlimited ? '' : `
      <button class="rp-step" data-rp="${idx}" data-dir="-1" title="Remove a slot">&minus;</button>
      <button class="rp-step" data-rp="${idx}" data-dir="1"  title="Add a bonus slot">+</button>`;

    el.innerHTML = `
      <div class="rp-top">
        <span class="rp-name">${escapeHTML(pool.name)}</span>
        ${steppers}
        <span class="rp-reset-tag rp-reset-cycle" data-rp="${idx}" title="Click to cycle reset (Long Rest → Short Rest → Turn)">${escapeHTML(pool.resetOn)}</span>
        <button class="icon-btn rp-restore" data-rp="${idx}" title="Restore all">↺</button>
        ${pool.custom ? `<button class="icon-btn rp-del" data-rp="${idx}" title="Remove">×</button>` : ''}
      </div>
      ${bodyHtml}
    `;
    wrap.appendChild(el);
  });

  wrap.querySelectorAll('.rp-bubble').forEach(bub => {
    bub.addEventListener('click', () => {
      const pool = character.resourcePools[Number(bub.dataset.rp)];
      if (!pool) return;
      if (bub.classList.contains('used')) pool.used = Math.max(0, pool.used - 1);
      else pool.used = Math.min(pool.max, pool.used + 1);
      renderResourcePools(); persist();
    });
  });
  wrap.querySelectorAll('.rp-cur-input').forEach(inp => {
    inp.addEventListener('change', () => {
      const pool = character.resourcePools[Number(inp.dataset.rp)];
      if (!pool) return;
      const cur = Math.max(0, Math.min(pool.max, Number(inp.value) || 0));
      pool.used = pool.max - cur;
      renderResourcePools(); persist();
    });
  });
  wrap.querySelectorAll('.rp-restore').forEach(btn => {
    btn.addEventListener('click', () => {
      const pool = character.resourcePools[Number(btn.dataset.rp)];
      if (pool) { pool.used = 0; renderResourcePools(); persist(); }
    });
  });
  wrap.querySelectorAll('.rp-del').forEach(btn => {
    btn.addEventListener('click', () => {
      character.resourcePools.splice(Number(btn.dataset.rp), 1);
      renderResourcePools(); persist();
    });
  });
  // Click the reset tag to cycle through Long Rest → Short Rest → Turn
  wrap.querySelectorAll('.rp-reset-cycle').forEach(tag => {
    tag.addEventListener('click', () => {
      const pool = character.resourcePools[Number(tag.dataset.rp)];
      if (!pool) return;
      const cycle = ['Long Rest', 'Short Rest', 'Turn'];
      const i = cycle.indexOf(pool.resetOn);
      pool.resetOn = cycle[(i + 1) % cycle.length];
      renderResourcePools(); persist();
    });
  });
  // +/- to resize the pool. Class pools store the delta as `bonus` so level-ups
  // still update the base count correctly. Custom pools just change max directly.
  wrap.querySelectorAll('.rp-step').forEach(btn => {
    btn.addEventListener('click', () => {
      const pool = character.resourcePools[Number(btn.dataset.rp)];
      if (!pool || pool.unlimited) return;
      const dir = Number(btn.dataset.dir) || 0;
      if (pool.custom) {
        pool.max = Math.max(1, Math.min(999, pool.max + dir));
        if (pool.used > pool.max) pool.used = pool.max;
      } else {
        const base = Math.max(0, Number(pool.baseMax) || 0);
        // Total = base + bonus, must be at least 1
        pool.bonus = Number(pool.bonus) || 0;
        const newBonus = pool.bonus + dir;
        if (base + newBonus < 1) return;     // can't go below 1 total
        if (base + newBonus > 99) return;    // sanity cap
        pool.bonus = newBonus;
      }
      renderResourcePools(); persist();
    });
  });
}

function wireResourcePools() {
  $('#btn-add-pool')?.addEventListener('click', () => {
    const nameInp = $('#rp-new-name');
    const name    = (nameInp?.value || '').trim();
    if (!name) { toast('Enter a pool name'); return; }
    character.resourcePools = character.resourcePools || [];
    character.resourcePools.push({
      key: 'custom:' + Date.now(),
      name,
      max: 1,             // start at one slot; use +/- to grow
      used: 0,
      unlimited: false,
      classKey: null,
      resetOn: 'Long Rest', // click the tag on the pool to cycle
      custom: true,
    });
    if (nameInp) nameInp.value = '';
    renderResourcePools(); persist();
  });
}

// ====================================================================
// Feats
// ====================================================================

/** Recompute f.asiChoice from f.fixedAsi plus any inline user picks (f.asiChoices). */
function recomputeFeatAsiChoice(f) {
  const result = { ...(f.fixedAsi || {}) };
  (f.asiChoices || []).forEach(k => {
    if (k) result[k] = (result[k] || 0) + 1;
  });
  f.asiChoice = result;
}

function parseFeatEffects(feat) {
  const fixed = {};
  const choices = [];   // array of option arrays, one per choice slot
  let speedBonus = 0;
  let initiativeBonus = 0;

  // Match: "(Increase|Raise|Boost) your X (score|attribute) by N"
  //        Open5e SRD uses "Increase ... score", A5E uses "Raise ... attribute".
  const VERB = '(?:increase|raise|boost)';
  const NOUN = '(?:score|attribute)';
  const ANY_ABILITY = ['str','dex','con','int','wis','cha'];

  function scanLine(rawLine) {
    // Strip A5E markdown bullets (* at line start) and emphasis markers
    const l = String(rawLine).replace(/^\s*\*\s*/, '').replace(/\*/g, '');

    // ── Speed bonus: constrain to single sentence (no greedy span) ──────────
    // "Your Speed increases by N feet" / "speed is increased by N"
    let m = l.match(/\bspeed\b[^.!?]*?\bincreases?\s+by\s+(\d+)\s*feet/i)
           || l.match(/\bspeed\b[^.!?]*?\bincreased?\s+by\s+(\d+)\s*feet/i);
    if (m) { speedBonus += Number(m[1]); return true; }
    // "movement … increased by N feet"
    m = l.match(/\bmovement\b[^.!?]*?\bincreased?\s+by\s+(\d+)\s*feet/i);
    if (m) { speedBonus += Number(m[1]); return true; }

    // ── Initiative bonus ─────────────────────────────────────────────────────
    if (/\binitiative\b/i.test(l)) {
      const im = l.match(/\+(\d+)\s+bonus/i) || l.match(/gain\s+(?:a\s+)?\+(\d+)/i);
      if (im) { initiativeBonus += Number(im[1]); return true; }
    }

    // ── ASI: Choice (X or Y) ──────────────────────────────────────────────────
    m = l.match(new RegExp(`${VERB}\\s+your\\s+(\\w+)\\s+or\\s+(\\w+)\\s+${NOUN}\\s+by\\s+(\\d+)`, 'i'));
    if (m) {
      const k1 = findAbilityKey(m[1]);
      const k2 = findAbilityKey(m[2]);
      // Each +1 from a "by N" that is an X-or-Y counts as one choice slot
      const count = Number(m[3]) || 1;
      const opts = (k1 && k2) ? [k1, k2] : ANY_ABILITY;
      for (let i = 0; i < count; i++) choices.push(opts);
      return true;
    }

    // ── ASI: Fixed named ability ──────────────────────────────────────────────
    m = l.match(new RegExp(`${VERB}\\s+your\\s+(\\w+(?:\\s+\\w+)?)\\s+${NOUN}\\s+by\\s+(\\d+)`, 'i'));
    if (m) {
      const key = findAbilityKey(m[1]);
      const val = Number(m[2]) || 1;
      if (key) {
        fixed[key] = (fixed[key] || 0) + val;
      } else {
        // Couldn't resolve the ability name → treat as free choice
        for (let i = 0; i < val; i++) choices.push(ANY_ABILITY);
      }
      return true;
    }

    // ── ASI: Passive choice ("Your X or Y score increases by N") ────────────────
    // e.g. Athletic: "Your Strength or Dexterity score increases by 1"
    m = l.match(new RegExp(`your\\s+(\\w+)\\s+or\\s+(\\w+)\\s+${NOUN}\\s+increases?\\s+by\\s+(\\d+)`, 'i'));
    if (m) {
      const k1 = findAbilityKey(m[1]);
      const k2 = findAbilityKey(m[2]);
      const count = Number(m[3]) || 1;
      const opts = (k1 && k2) ? [k1, k2] : ANY_ABILITY;
      for (let i = 0; i < count; i++) choices.push(opts);
      return true;
    }

    // ── ASI: Passive ("Your X score increases by N") ─────────────────────────
    m = l.match(new RegExp(`your\\s+(\\w+(?:\\s+\\w+)?)\\s+${NOUN}\\s+increases?\\s+by\\s+(\\d+)`, 'i'));
    if (m) {
      const key = findAbilityKey(m[1]);
      const val = Number(m[2]) || 1;
      if (key) fixed[key] = (fixed[key] || 0) + val;
      return true;
    }

    // ── ASI: "Increase one ability score of your choice by N" ────────────────
    m = l.match(/(?:increase|raise) one ability (?:score|attribute)[^.]*?by (\d+)/i);
    if (m) {
      const count = Number(m[1]) || 1;
      for (let i = 0; i < count; i++) choices.push(ANY_ABILITY);
      return true;
    }

    // ── ASI: Generic choice pattern ───────────────────────────────────────────
    if (/(?:increase|raise)[^.]*(?:ability score|attribute)[^.]*choice/i.test(l)) {
      const n = l.match(/by (\d+)/i);
      const count = n ? Number(n[1]) : 1;
      for (let i = 0; i < count; i++) choices.push(ANY_ABILITY);
      return true;
    }

    return false;
  }

  (feat.effects_desc || []).forEach(scanLine);

  // Fall back to scanning desc ONLY for ASI patterns (not speed/init — too many
  // false positives in prose). Only scan if effects_desc yielded nothing at all.
  if (Object.keys(fixed).length === 0 && choices.length === 0 && feat.desc) {
    String(feat.desc).split(/(?<=[.!?])\s+/).forEach(line => {
      const l = line.replace(/^\s*\*\s*/, '').replace(/\*/g, '');
      // Active-verb X-or-Y: "Raise your X or Y attribute by N"
      let m = l.match(new RegExp(`${VERB}\\s+your\\s+(\\w+)\\s+or\\s+(\\w+)\\s+${NOUN}\\s+by\\s+(\\d+)`, 'i'));
      if (m) {
        const k1 = findAbilityKey(m[1]); const k2 = findAbilityKey(m[2]);
        const count = Number(m[3]) || 1;
        for (let i = 0; i < count; i++) choices.push((k1 && k2) ? [k1, k2] : ANY_ABILITY);
        return;
      }
      // Passive X-or-Y: "Your X or Y score increases by N"
      m = l.match(new RegExp(`your\\s+(\\w+)\\s+or\\s+(\\w+)\\s+${NOUN}\\s+increases?\\s+by\\s+(\\d+)`, 'i'));
      if (m) {
        const k1 = findAbilityKey(m[1]); const k2 = findAbilityKey(m[2]);
        const count = Number(m[3]) || 1;
        for (let i = 0; i < count; i++) choices.push((k1 && k2) ? [k1, k2] : ANY_ABILITY);
        return;
      }
      // Active-verb fixed: "Increase your X attribute by N"
      m = l.match(new RegExp(`${VERB}\\s+your\\s+(\\w+(?:\\s+\\w+)?)\\s+${NOUN}\\s+by\\s+(\\d+)`, 'i'));
      if (m) {
        const key = findAbilityKey(m[1]);
        const val = Number(m[2]) || 1;
        if (key) fixed[key] = (fixed[key] || 0) + val;
        else for (let i = 0; i < val; i++) choices.push(ANY_ABILITY);
      }
    });
  }

  return { fixed, choices, speedBonus, initiativeBonus };
}

/** Sum of walking speed bonuses granted by all currently-equipped feats. */
function sumFeatSpeedBonuses() {
  return (character.feats || []).reduce((sum, f) => sum + (Number(f.speedBonus) || 0), 0);
}

function buildFeatDesc(feat) {
  // Combine the short blurb (`desc`) with each line of `effects_desc`
  // so the expanded feat entry shows the full rules text, not just the intro.
  const intro   = String(feat.desc || '').trim();
  const effects = (feat.effects_desc || []).map(e => String(e).trim()).filter(Boolean);
  const parts = [];
  if (intro)         parts.push(intro);
  if (effects.length) parts.push(effects.join('\n\n'));
  return parts.join('\n\n');
}

function addFeatToCharacter(feat) {
  character.feats = character.feats || [];
  const { fixed, choices, speedBonus, initiativeBonus } = parseFeatEffects(feat);
  const newFeat = {
    name:            feat.name,
    slug:            feat.slug || '',
    source:          feat.document__slug || '',
    custom:          false,
    desc:            buildFeatDesc(feat),
    prerequisite:    feat.prerequisite || '',
    // New: separate fixed vs user-chosen ASI
    fixedAsi:        { ...fixed },
    asiChoiceOptions: choices,            // [['str','dex'], ...] one array per slot
    asiChoices:      choices.map(() => ''), // user selections, initially blank
    asiChoice:       { ...fixed },        // combined total; updated as user picks
    speedBonus,
    initiativeBonus,
  };
  character.feats.push(newFeat);

  // Apply speed bonus immediately (before renderFeats calls renderCombat)
  if (speedBonus) character.speed = (character.speed || 0) + speedBonus;

  renderAbilities(); renderSaves(); renderSkills(); renderPassive(); renderCombat(); renderSpellcasting();
  renderFeats();
  persist();

  const fixedText  = Object.entries(fixed).filter(([,v])=>v>0).map(([k,v])=>`+${v} ${k.toUpperCase()}`).join(', ');
  const extraNotes = [
    fixedText,
    choices.length > 0 ? `${choices.length} choice${choices.length > 1 ? 's' : ''} to pick` : '',
    speedBonus       ? `speed +${speedBonus}ft` : '',
    initiativeBonus  ? `initiative +${initiativeBonus}` : '',
  ].filter(Boolean).join(', ');
  toast(`Added feat: ${feat.name}${extraNotes ? ' (' + extraNotes + ')' : ''}`);
}

function renderFeats() {
  const list = $('#feats-list');
  if (!list) return;
  list.innerHTML = '';
  const feats = character.feats || [];

  // ---- Feat slot counter ----
  const fromLevel = (character.asiChoices || []).filter(c => c.feat === true).length;
  const fromRace  = character.raceFeatSlot ? 1 : 0;
  const totalSlots = fromLevel + fromRace;
  if (totalSlots > 0 || feats.length > 0) {
    const used = feats.length;
    const remaining = Math.max(0, totalSlots - used);
    const isOver = totalSlots > 0 && used > totalSlots;
    const sources = [];
    if (fromLevel > 0) sources.push(`${fromLevel} from ASI`);
    if (fromRace  > 0) sources.push(`${fromRace} from Race`);
    const srcStr = sources.length ? ` <span class="counter-sub-text">(${sources.join(' + ')})</span>` : '';
    const tail = totalSlots === 0
      ? ''
      : (isOver
          ? `<span class="picks-remaining">+${used - totalSlots} extra</span>`
          : (remaining > 0
              ? `<span class="picks-remaining">${remaining} remaining</span>`
              : (used === totalSlots ? `<span class="picks-done">&#10003; all used</span>` : '')));
    const counter = document.createElement('div');
    counter.className = 'skill-picks-counter counter-feat' + (isOver ? ' hb-deviation' : '');
    if (isOver) counter.title = `${used - totalSlots} feat${used - totalSlots > 1 ? 's' : ''} beyond available slots`;
    counter.innerHTML = `<span>Feats: <strong>${used}/${totalSlots}</strong>${srcStr}</span>${tail}`;
    list.appendChild(counter);
  }

  if (!feats.length) {
    const empty = document.createElement('p');
    empty.className = 'srd-hint';
    empty.style.margin = '2px 0 6px';
    empty.textContent = totalSlots > 0 ? 'No feats selected yet.' : 'No feats selected.';
    list.appendChild(empty);
    return;
  }
  feats.forEach((f, i) => {
    const srcTag = f.custom
      ? '<span class="feature-sub-tag">Custom</span>'
      : (f.source && f.source !== 'wotc-srd' ? `<span class="feature-sub-tag">${escapeHTML(sourceTag(f.source))}</span>` : '');

    // ── Fixed ASI badge (from parseFeatEffects, or legacy asiChoice fallback) ───
    // fixedAsi is set by migration when SRD data loads. For feats loaded offline
    // before migration can run, fall back to the combined asiChoice for display.
    const fixedAsi   = f.fixedAsi !== undefined ? f.fixedAsi : (f.asiChoice || {});
    const fixedText  = Object.entries(fixedAsi).filter(([,v])=>v>0)
                         .map(([k,v])=>`+${v} ${k.toUpperCase()}`).join(', ');

    // ── Inline choice selects (one per undecided slot) ────────────────────────
    const choiceOpts = f.asiChoiceOptions || [];   // [['str','dex'], ...]
    const choiceVals = f.asiChoices        || [];   // ['str', '']
    // Build a <select> for each choice slot
    const selects = choiceOpts.map((opts, si) => {
      const curVal = choiceVals[si] || '';
      const optHTML = ABILITIES
        .filter(a => opts.length === 0 || opts.includes(a.key))
        .map(a => `<option value="${a.key}"${a.key === curVal ? ' selected' : ''}>${a.name.slice(0,3).toUpperCase()}</option>`)
        .join('');
      return `<span class="feat-asi-inline">+1 <select class="feat-asi-sel" data-feat="${i}" data-slot="${si}"><option value="">—</option>${optHTML}</select></span>`;
    });

    const el = document.createElement('div');
    el.className = 'feat-entry';
    el.innerHTML = `
      <div class="feat-row">
        <span class="feat-name">${escapeHTML(f.name)}${srcTag}</span>
        ${fixedText ? `<span class="feat-asi">${fixedText}</span>` : ''}
        ${selects.join('')}
        <button class="icon-btn" data-feat-del="${i}" title="Remove feat">&times;</button>
      </div>
      ${f.prerequisite ? `<div class="feat-prereq">Req: ${escapeHTML(f.prerequisite)}</div>` : ''}
      ${f.desc ? `<div class="feat-desc">${escapeHTML(f.desc)}</div>` : ''}
    `;
    el.querySelector('.feat-name').addEventListener('click', () => el.classList.toggle('expanded'));

    // Wire inline ASI selects
    el.querySelectorAll('.feat-asi-sel').forEach(sel => {
      sel.addEventListener('change', e => {
        e.stopPropagation();
        const fi   = Number(sel.dataset.feat);
        const slot = Number(sel.dataset.slot);
        const feat = character.feats[fi];
        if (!feat) return;
        feat.asiChoices        = feat.asiChoices || (feat.asiChoiceOptions || []).map(() => '');
        feat.asiChoices[slot]  = sel.value;
        recomputeFeatAsiChoice(feat);
        // Recompute ability scores, combat, etc.
        renderAbilities(); renderSaves(); renderSkills(); renderPassive(); renderCombat(); renderSpellcasting();
        persist();
      });
    });

    list.appendChild(el);
  });

  list.querySelectorAll('[data-feat-del]').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const idx = Number(btn.dataset.featDel);
      const removed = character.feats[idx];
      // Subtract feat's speed bonus before removing
      if (removed && removed.speedBonus) {
        character.speed = Math.max(0, (character.speed || 0) - Number(removed.speedBonus));
      }
      character.feats.splice(idx, 1);
      renderAbilities(); renderSaves(); renderSkills(); renderPassive(); renderCombat(); renderSpellcasting();
      renderFeats(); persist();
    });
  });
}

function populateFeatPicker() {
  const sel = $('#feat-picker');
  if (!sel) return;
  while (sel.options.length > 1) sel.remove(1);
  const grouped = {};
  (presetCache.feats || []).forEach(f => {
    const k = f.document__slug || 'other';
    (grouped[k] ||= []).push(f);
  });
  const keys = Object.keys(grouped).sort((a, b) => {
    const ai = SOURCE_ORDER.indexOf(a); const bi = SOURCE_ORDER.indexOf(b);
    return (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi);
  });
  keys.forEach((k, idx) => {
    if (idx > 0) {
      const sep = document.createElement('option');
      sep.disabled = true;
      sep.textContent = `──── ${sourceTag(k) || k} ────`;
      sel.appendChild(sep);
    }
    grouped[k].sort((a, b) => a.name.localeCompare(b.name)).forEach(f => {
      const o = document.createElement('option');
      o.value = f.slug;
      o.textContent = f.name + (f.prerequisite ? ' *' : '');
      if (f.prerequisite) o.title = `Prerequisite: ${f.prerequisite}`;
      sel.appendChild(o);
    });
  });
}

function wireFeatPicker() {
  const addBtn = $('#btn-add-feat');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      const sel = $('#feat-picker');
      if (!sel || !sel.value) return;
      const feat = (presetCache.feats || []).find(f => f.slug === sel.value);
      if (!feat) return;
      if ((character.feats || []).some(f => f.slug === feat.slug && !f.custom)) {
        toast(`${feat.name} already added`);
        return;
      }
      addFeatToCharacter(feat);
      sel.value = '';
    });
  }
  const customBtn = $('#btn-add-custom-feat');
  if (customBtn) {
    customBtn.addEventListener('click', () => {
      const name = prompt('Custom feat name:');
      if (!name || !name.trim()) return;
      character.feats = character.feats || [];
      character.feats.push({ name: name.trim(), slug: '', source: '', custom: true, desc: '', prerequisite: '', asiChoice: {} });
      renderFeats(); persist();
    });
  }
}

// ====================================================================
// Markdown rendering for expandable text fields
// ====================================================================
function renderMarkdown(text) {
  if (!text || !String(text).trim()) {
    return '<p class="markup-empty">— empty —</p>';
  }

  // 1. Escape HTML so user input can't inject markup
  let s = String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // 2. Block-level transformations (process line-by-line)
  const lines = s.split('\n');
  const out = [];
  let inList = false;
  const closeList = () => { if (inList) { out.push('</ul>'); inList = false; } };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const trimmed = line.trim();

    if (!trimmed) { closeList(); out.push(''); continue; }

    let m;
    // Legacy app format: "--- text ---" (used by SRD auto-fill); also matches plain markdown headers
    if ((m = trimmed.match(/^---+\s+(.+?)\s+---+$/))) { closeList(); out.push(`<h3>${m[1]}</h3>`); continue; }
    if ((m = trimmed.match(/^###\s+(.+)$/)))          { closeList(); out.push(`<h3>${m[1]}</h3>`); continue; }
    if ((m = trimmed.match(/^##\s+(.+)$/)))           { closeList(); out.push(`<h2>${m[1]}</h2>`); continue; }
    if ((m = trimmed.match(/^#\s+(.+)$/)))            { closeList(); out.push(`<h1>${m[1]}</h1>`); continue; }
    if (/^---+\s*$/.test(trimmed))                    { closeList(); out.push('<hr>'); continue; }
    if ((m = trimmed.match(/^[-*]\s+(.+)$/))) {
      if (!inList) { out.push('<ul>'); inList = true; }
      out.push(`<li>${m[1]}</li>`);
      continue;
    }
    closeList();
    out.push(line);
  }
  closeList();

  // 3. Group consecutive non-block lines into <p> with <br> for inner breaks
  const blocks = [];
  let para = [];
  const flush = () => {
    if (para.length) { blocks.push('<p>' + para.join('<br>') + '</p>'); para = []; }
  };
  for (const ln of out) {
    if (ln === '') { flush(); continue; }
    if (/^<(h[1-6]|hr|ul|\/ul|li)/.test(ln.trim())) { flush(); blocks.push(ln); }
    else para.push(ln);
  }
  flush();
  s = blocks.join('\n');

  // 4. Inline transformations
  s = s.replace(/\*\*([^\n*]+?)\*\*/g, '<strong>$1</strong>');
  s = s.replace(/__([^\n_]+?)__/g, '<strong>$1</strong>');
  s = s.replace(/(?<![\w*])\*([^\n*]+?)\*(?![\w*])/g, '<em>$1</em>');
  s = s.replace(/(?<![\w_])_([^\n_]+?)_(?![\w_])/g, '<em>$1</em>');
  s = s.replace(/`([^`\n]+?)`/g, '<code>$1</code>');
  s = s.replace(/\[([^\]\n]+?)\]\(([^)\n\s]+?)\)/g, (m, t, u) =>
    /^https?:\/\//i.test(u) ? `<a href="${u}" target="_blank" rel="noopener">${t}</a>` : m);

  return s;
}

function wireMarkupToggles() {
  document.querySelectorAll('.card').forEach(card => {
    const textareas = card.querySelectorAll('textarea[data-bind]');
    if (!textareas.length) return;
    const heading = card.querySelector('h2');
    if (!heading) return;

    // Wrap h2 + toggle in a header row (if not already)
    let header = heading.parentElement.classList.contains('card-header')
      ? heading.parentElement : null;
    if (!header) {
      header = document.createElement('div');
      header.className = 'card-header';
      heading.parentNode.insertBefore(header, heading);
      header.appendChild(heading);
    }

    // Default to rendered/markup view on page load
    card.classList.add('markup-view');

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'markup-toggle';
    toggle.textContent = 'Edit';
    toggle.title = 'Edit raw text';
    header.appendChild(toggle);

    // Insert a preview div after each textarea, pre-populated from current value
    textareas.forEach(ta => {
      const preview = document.createElement('div');
      preview.className = 'markup-preview';
      preview.innerHTML = renderMarkdown(ta.value);
      ta.parentNode.insertBefore(preview, ta.nextSibling);
    });

    toggle.addEventListener('click', () => {
      const isPreview = card.classList.toggle('markup-view');
      toggle.textContent = isPreview ? 'Edit' : 'Done';
      toggle.title       = isPreview ? 'Edit raw text' : 'Finish editing';
      if (isPreview) {
        // Edit → markup: re-render previews from the now-current text
        textareas.forEach(ta => {
          const preview = ta.nextElementSibling;
          if (preview && preview.classList.contains('markup-preview')) {
            preview.innerHTML = renderMarkdown(ta.value);
          }
        });
      } else {
        // Markup → edit: refresh auto-resize
        textareas.forEach(autoResizeTextarea);
      }
    });
  });
}

// ====================================================================
// Theme switcher
// ====================================================================
const THEME_KEY = 'dnd5e-theme';
const THEMES = ['dark', 'light', 'contrast', 'retro', 'terminal'];

function applyTheme(theme) {
  if (!THEMES.includes(theme)) theme = 'dark';
  document.documentElement.setAttribute('data-theme', theme);
  try { localStorage.setItem(THEME_KEY, theme); } catch (e) {}
}

function wireThemeSelector() {
  const sel = $('#theme-select');
  if (!sel) return;
  let saved;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  const theme = THEMES.includes(saved) ? saved : 'dark';
  sel.value = theme;
  applyTheme(theme);
  sel.addEventListener('change', () => applyTheme(sel.value));
}

function wireInfoButton() {
  const overlay = $('#info-overlay');
  $('#btn-info')?.addEventListener('click', () => {
    overlay.classList.remove('hidden');
    // Refresh dynamic content when opening — supplement list might've changed
    // via uploads in another tab, or character changes.
    refreshSupplementStatus();
    renderSupplementSubclassList();
    refreshRaceSupplementStatus();
    renderSupplementRaceList();
  });
  $('#info-close')?.addEventListener('click', () => overlay.classList.add('hidden'));
  overlay?.addEventListener('click', e => {
    if (e.target.id === 'info-overlay') overlay.classList.add('hidden');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && overlay && !overlay.classList.contains('hidden')) {
      overlay.classList.add('hidden');
    }
  });
}

// ====================================================================
// Boot
// ====================================================================
function boot() {
  restore();
  preFillPresetDropdowns();   // show saved Class/Race/Background immediately, before API arrives
  renderAll();
  attachBindings();
  wireToolbar();
  wireSRD();
  wireModal();
  wireFeatPicker();
  wireResourcePools();
  wireSpellPopup();
  wireSpellsModeToggle();
  wirePresetPreview();
  buildCustomDropdowns();
  syncPresetDropdowns();    // populate button labels from saved character before API arrives
  buildArmorDropdowns();
  wireGenericSteppers();
  wireInitiative();
  wireAC();
  wireHPMax();
  wireArmorEnhancement();
  wireMarkupToggles();
  wireInfoButton();
  wireThemeSelector();
  loadSubclassSupplement();   // localStorage → _subclassSupplement (merged after loadPresets)
  loadRaceSupplement();       // localStorage → _raceSupplement     (merged after loadPresets)
  wireSupplement();           // reads _subclassSupplement for initial status text
  wireRaceSupplement();
  wireSubclassEditor();
  wireRaceEditor();
  watchAutosave();
  // Wire the Retry button in the API failure banner
  $('#api-retry-btn')?.addEventListener('click', () => loadPresets());
  loadPresets();
}
boot();

/* ================================================================
   MOBILE UI — Tab navigation · Hamburger menu · Mini-header
   ================================================================ */
(function initMobileUI() {
  'use strict';

  // ── Tab navigation ─────────────────────────────────────────────
  const TAB_KEY   = 'dnd5e_active_tab';
  const tabBtns   = Array.from(document.querySelectorAll('.tab-btn'));
  const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));

  function switchTab(name) {
    tabBtns.forEach(b => {
      const on = b.dataset.tab === name;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    tabPanels.forEach(p => p.classList.toggle('active', p.dataset.tab === name));
    document.body.dataset.activeTab = name;
    try { localStorage.setItem(TAB_KEY, name); } catch (_) {}
  }

  tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

  // Restore saved tab (or default to 'stats')
  const saved = (() => { try { return localStorage.getItem(TAB_KEY); } catch(_) { return null; } })();
  if (saved && tabBtns.some(b => b.dataset.tab === saved)) {
    switchTab(saved);
  } else {
    // HTML default: stats panel already has class="active"; mirror to body attribute
    document.body.dataset.activeTab = 'stats';
  }

  // ── Hamburger menu ─────────────────────────────────────────────
  const hamburger = document.getElementById('btn-hamburger');
  const menu      = document.getElementById('mobile-menu');

  function openMenu()  {
    menu.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close menu');
  }
  function closeMenu() {
    menu.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open menu');
  }

  hamburger.addEventListener('click', e => {
    e.stopPropagation();
    menu.classList.contains('open') ? closeMenu() : openMenu();
  });

  // Close when clicking outside
  document.addEventListener('click', e => {
    if (menu.classList.contains('open') && !menu.contains(e.target)) closeMenu();
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });

  // Close after action buttons (not theme select) are clicked
  menu.querySelectorAll('.btn, .btn-rest, .btn-accent').forEach(btn => {
    btn.addEventListener('click', () => setTimeout(closeMenu, 100));
  });

  // ── Mini-header (name · class L# · HP) ────────────────────────
  const miniName     = document.getElementById('mini-name');
  const miniClassLvl = document.getElementById('mini-class-level');
  const miniHP       = document.getElementById('mini-hp');

  function updateMini() {
    const nameEl  = document.querySelector('[data-bind="name"]');
    const classEl = document.querySelector('[data-bind="class"]');
    const levelEl = document.querySelector('[data-bind="level"]');
    const hpCurEl = document.querySelector('[data-bind="hpCurrent"]');
    const hpMaxEl = document.querySelector('[data-bind="hpMax"]');

    const name  = (nameEl?.value  || '').trim() || 'Unnamed Adventurer';
    const cls   = (classEl?.value || '').trim() || '—';
    const lvl   = (levelEl?.value || '').trim();
    const hpCur = hpCurEl?.value ?? '—';
    const hpMax = hpMaxEl?.value ?? '—';

    miniName.textContent     = name;
    miniClassLvl.textContent = lvl ? `${cls} L${lvl}` : cls;
    miniHP.textContent       = `HP ${hpCur}/${hpMax}`;
  }

  updateMini();
  document.addEventListener('input',  updateMini);
  document.addEventListener('change', updateMini);
  // Catch programmatic updates (load, REST, stepper buttons, etc.)
  setInterval(updateMini, 1500);

  // ── Topbar height → CSS custom property ───────────────────────
  // Lets the mini-header sticky-top track the actual topbar height.
  function measureTopbar() {
    const h = document.querySelector('.topbar')?.offsetHeight || 45;
    document.documentElement.style.setProperty('--topbar-h', h + 'px');
  }
  measureTopbar();
  window.addEventListener('resize', measureTopbar);

})();
