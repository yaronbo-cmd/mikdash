/* ─────────────────────────────────────────────────────────────────────────────
 * games/index.js — (GAMES10, wave 10) "משחקי ביניים": classic in-between games dressed in the Temple's world, each one also a
 * duel for two on one phone (the owner, 28.9: "עוד כמה משחקוני ביניים קלאסיים שישאירו את השחקן עוד כמה דקות במשחק" · "2 3 4
 * player games … שאפשר ל'הלביש' על העולם שלנו, כמו שעשינו בקנדי קראש").
 *   ארבע בנדבך (four.js) · זיכרון הכלים (memory.js) · מרוץ הכבש (race.js) · נדבך על נדבך (stack.js) · שיר הלויים
 *   (levites.js); the frame, the how-to, the duel and the result:
 *   shell.js.
 *
 *   bindHost({ game: () => api, pause(on) })   main.js `// ── games10 ──`: the game's api (state · save · ui · sfx) and the
 *                                               3D loop's hold while a game is open
 *   openGames({ root, game?, sfx? }) → Promise<{ played, paid }>   the hub (or one game) until the player goes back
 *   open(id)                                     the menu's buttons (ui.js `// ── games10 ──`, data-g10="hub|four|memory|race")
 *   menuHTML(G)                                  the menu's section
 *   invite(G, stage?) → Promise<boolean>         FLOW10's optional between-stages hook: at most once a day, never in the FTUE;
 *                                                (FUN11) it names ONE game, the one that fits the stage just built
 *   table() → Promise   · tableInfo() → {title, sub}   (FUN11, wave 11) the game table in the world (SITE11's pick target): the
 *                                                hub with the game of the stage in focus first ("מתאים למה שאתה בונה")
 *   (FUN11) a finished board leaves a small chip for one game (at most every 10 minutes, never in the FTUE or the demo)
 *
 * Pay: a finished game (any result, solo or duel) adds a small fixed amount of its material through the game's own path
 * (state.js gain → save → the HUD's flash), like the board; the first PAID_PER_DAY games of a day pay (⚑ owner). Nothing is
 * random, nothing is bought, nothing is lost; leaving mid-game costs nothing. Facts: drafts (טיוטה) with their sources, in
 * rotation per game (G.games.fx).
 * ──────────────────────────────────────────────────────────────────────────── */
import { createShell, factHTML, esc, PLAYERS, reducedMotion, injectCSS } from './shell.js';
import * as FOUR from './four.js';
import * as MEM from './memory.js';
import * as RACE from './race.js';
import * as STACK from './stack.js';
import * as LEVITES from './levites.js';
import * as SLING from './sling.js';
import * as KNUCKLE from './knuckle.js';   // ── games13 ── (wave 13) the games a boy of that time played: חמש אבנים · שמונה אבוקות · מגדל האגוזים
import * as TORCHES from './torches.js';
import * as NUTS from './nuts.js';   // ── /games13 ──
import { plan as cyclePlan, pill as cyclePill, ahead as cycleAhead, cycleOf } from './cycle.js';
import { gain, focusOf } from '../game/state.js';
import { ICON } from '../match3/art.js';

export { cyclePlan, cyclePill, cycleAhead, cycleOf };   // (FUN12, wave 12) the quarry's cycle: index.js playLevel `// ── fun12 ──`
export const GAMES = [SLING.GAME, FOUR.GAME, MEM.GAME, RACE.GAME, STACK.GAME, LEVITES.GAME, KNUCKLE.GAME, TORCHES.GAME, NUTS.GAME];   // (games13: the last three)
export const PAID_PER_DAY = 6;
/* ── FUN11 (wave 11): which game fits which stage — variety with a reason. The first is the stage's own; the next ones take its
   turn when it was the last offered. The line is the invitation's (the true fact with its source comes at the game's end). ── */
export const STAGE_GAMES = {
  har: ['sling', 'knuckle'], wall: ['stack', 'four'], gates: ['four', 'memory'], nashim: ['torches', 'levites'], sorag: ['knuckle', 'four'],
  nikanor: ['levites', 'torches'], lishka: ['levites', 'nuts'], yesod: ['nuts', 'race'], sovev: ['race', 'four'], guf: ['race', 'memory'],
  karnot: ['race', 'levites'], kiyor: ['memory', 'race'], ulam: ['stack', 'memory'], heichal: ['memory', 'levites'], kodesh: ['memory', 'stack'],
};   // (games13: נשים — the lamps of שמחת בית השואבה stood in עזרת הנשים, סוכה ה, ב · הסורג — the Mount's plaza, where the bones were found · היסוד — the Pesach's blood at the altar's base, the children's nuts that night)
export const WHY = {
  sling: 'על ההר הזה קנה דוד את גורן ארוונה (שמואל ב כד, כד). עכשיו הקלע שלו: חמש אבנים מן הנחל.',
  stack: 'בנית נדבכים — עכשיו נדבך על נדבך: כמה נדבכים ישרים תניח זה על זה?',
  four: 'ארבע אבנים בשורה — בנאי מול בנאי, על אבני החומה.',
  race: 'בתחילה רצו הכהנים במעלה הכבש, והראשון לארבע האמות זכה (משנה יומא ב, א). עכשיו תורך לרוץ.',
  levites: 'על חמש עשרה המעלות שרו הלויים (משנה מדות ב, ה). תזכור את השיר ותחזור עליו?',
  memory: 'כלי הבית, שניים שניים — מי יזכור איפה כל זוג?',
  knuckle: 'בעפר שהוצא מהר הבית נמצא אסטרגל — עצם משחק מימים קדומים (tmsifting.org, 2017). זרוק, אסוף ותפוס!',
  torches: 'בשמחת בית השואבה נטל רבן שמעון בן גמליאל שמונה אבוקות, "וזורק אחת ונוטל אחת ואין נוגעות זו בזו" (סוכה נג, א).',
  nuts: 'בערב פסח חילק רבי עקיבא קליות ואגוזים לילדים, כדי שלא יישנו וישאלו (פסחים קט, א). עכשיו — מגדל אגוזים.',
};
const CHIP_GAP_MS = 10 * 60000;   // the chip after a board: at most once every 10 minutes
/** the game that fits stage `id` now (its own first; the next when that one was just offered; else the least played) */
export function pickFor(G, id) {
  const s = slot(G), list = (STAGE_GAMES[id] || []).filter((g) => GAMES.some((x) => x.id === g));
  const pool = list.length ? list : GAMES.map((g) => g.id).sort((a, b) => ((s.played[a] | 0) - (s.played[b] | 0)));
  return pool.find((g) => g !== s.lastOffer) || pool[0];
}
const stageNow = (G) => { try { return focusOf(G) || (G && G.focus) || ''; } catch (e) { return (G && G.focus) || ''; } };
const titleOf = (id) => { const g = GAMES.find((x) => x.id === id); return g ? g.title : ''; };
/** (SITE11's game table) its plate: the game of the stage in focus */
export function tableInfo(G) {
  const A = api(), g = G || (A ? A.state : null), id = pickFor(g, stageNow(g));
  return { title: 'שולחן המשחקים', sub: `היום: ${titleOf(id)}`, game: id };
}
/** (SITE11's game table) the hub, the game of the stage first — the same frame, hold and pay as the menu's */
export function table() {
  const A = api(), G = A ? A.state : null, id = pickFor(G, stageNow(G));
  if (G) { slot(G).lastOffer = id; save(A); }
  return openGames({ featured: id, why: WHY[id] || '' });
}
const RES_HE = { stone: ['אבן', 'אבנים'], gold: ['זהב', 'זהב'], silver: ['כסף', 'כסף'], cedar: ['ארז', 'ארז'], bronze: ['נחושת', 'נחושת'] };

let HOST = null, running = null;
const local = {};   // no game (a lab page): the part keeps its own day's count
export function bindHost(hst) { HOST = hst || null; watch(); tagLoop(); }
/* the between-stages invitation without touching the flow: the game's own log (api.log) is read every 1.5 s; after a stage
   completes (stageDone, not skipped) and the game has been idle for 4 s (no card, sheet, board or moment), invite() runs —
   at most once a day, never in the FTUE or the demo (FLOW10 may call invite(G) itself instead; the day's guard is shared) */
let watchT = 0, logSeen = -1, due = 0, idleSince = 0, lastCycle = '', jumpAt = 0, jumpId = '';
const BUSY_SEL = '.gm-modal,.gm-mo,.gm-sheet.on,div.m3,.fx-mg,.kg,.g10,.av-modal,body.sc-on';
function watch() {
  if (watchT || typeof setInterval !== 'function') return;
  watchT = setInterval(() => {
    try {
      const A = api(); if (!A || !Array.isArray(A.log)) return;
      const L = A.log, last = L.length ? L[L.length - 1] : null;
      if (logSeen < 0) { logSeen = last ? last.t : 0; return; }
      let i0 = L.length; while (i0 > 0 && L[i0 - 1].t > logSeen) i0--;
      for (let i = i0; i < L.length; i++) {   // (the new entries in their order: a cycle's game comes before its m3Won)
        if (L[i].type === 'stageDone' && !(L[i].detail && L[i].detail.skipped)) due = Date.now();
        if (L[i].type === 'cycle') lastCycle = (L[i].detail && L[i].detail.game) || '';   // (FUN12) the quarry's cycle just gave another game: no chip
        if ((L[i].type === 'm3Won' || L[i].type === 'm3Lost') && (!lastCycle || lastCycle === 'board')) chipDue = Date.now();   // (FUN11) a board finished → the chip, once calm
        if (L[i].type === 'demoJump') { jumpAt = Date.now(); jumpId = (L[i].detail && L[i].detail.id) || ''; }   // ── games13 ── (the owner's testing mode: a picked stage's game, once)
      }
      if (last) logSeen = Math.max(logSeen, last.t);
      if (chipEl && (A.busy || A.whole || (globalThis.document && document.querySelector(BUSY_SEL)))) chipOff();   // (a card, a sheet or a board: the chip steps aside)
      if (chipDue && !due) {
        const G = A.state, s = G ? slot(G) : null;
        if (!G || reelOf(G) || (G.ftue | 0) < 99 || running || Date.now() - chipDue > 25000 || (s && s.chipAt && Date.now() - s.chipAt < CHIP_GAP_MS)) chipDue = 0;
        else if (!A.busy && !A.whole && !(globalThis.document && document.querySelector(BUSY_SEL))) { if (Date.now() - chipDue > 2500) { chipDue = 0; chip(); } }
      }
      // ── games13 ── in the demo a picked stage's own game is offered by the chip, once per stage, after 25 s of calm (never over a
      // card, a sheet, a board or a game; it fades by itself) — so the owner meets the games of the period where they belong
      if (jumpAt && !due && !chipDue) {
        const G = A.state, calm = !A.busy && !A.whole && !(globalThis.document && document.querySelector(BUSY_SEL));
        if (!G || !G.demo || reelOf(G) || running || chipEl || Date.now() - jumpAt > 150000) { if (!G || !G.demo || reelOf(G) || Date.now() - jumpAt > 150000) jumpAt = 0; }
        else if (Date.now() - jumpAt > 25000 && calm) {
          const s = slot(G); if (!s.jumped || typeof s.jumped !== 'object') s.jumped = {};
          if (!s.jumped[jumpId] && jumpId) { s.jumped[jumpId] = 1; save(A); chip(pickFor(G, jumpId)); }
          jumpAt = 0;
        }
      }
      // ── /games13 ──
      if (!due) return;
      if (Date.now() - due > 90000) { due = 0; return; }
      const G = A.state, s = G ? slot(G) : null;
      if (!G || reelOf(G) || (G.ftue | 0) < 99 || !s || s.inv === invKey(G, lastStage(A))) { due = 0; return; }
      const idle = !A.busy && !A.whole && !(globalThis.document && document.querySelector(BUSY_SEL));
      if (!idle) { idleSince = 0; return; }
      if (!idleSince) { idleSince = Date.now(); return; }
      if (Date.now() - idleSince < 4000) return;
      due = 0; idleSince = 0;
      invite(G);
    } catch (e) { /* the invitation is never load-bearing */ }
  }, 1500);
}
// ── games13 ── the demo is the owner's testing mode (supervisor 30.9, as cycle.js applies()): the invitation, the chip and the table's
// sign come there too — only the investor reel keeps none; in the demo the invitation may come once per stage (he jumps stages)
const reelOf = (G) => !!(G && G.demo && G.story && G.story.reel);
const invKey = (G, st) => (G && G.demo ? `${dayKey()}:${st || ''}` : dayKey());
// ── /games13 ──
const api = () => { try { const g = HOST && typeof HOST.game === 'function' ? HOST.game() : null; return g && g.state ? g : null; } catch (e) { return null; } };
const dayKey = (t = Date.now()) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };
function slot(G) {
  const o = G || local;
  if (!o.games || typeof o.games !== 'object' || Array.isArray(o.games)) o.games = {};
  const s = o.games;
  for (const k of ['fx', 'played', 'wins']) if (!s[k] || typeof s[k] !== 'object') s[k] = {};
  if (s.day !== dayKey()) { s.day = dayKey(); s.paid = 0; }
  return s;
}
const sfxOf = (o) => (name, p) => {
  try {
    const k = o || (api() && api().sfx);
    if (!k) return;
    if (typeof k.play === 'function') { if (typeof k.has === 'function' && !k.has(name)) return; k.play(name, p); } else if (typeof k === 'function') k(name, p);
  } catch (e) { /* sound is never load-bearing */ }
};

/** pay a finished game through the game's own path; returns what was added (or null past the day's count) */
function pay(gm) {
  const A = api(), G = A ? A.state : null, s = slot(G);
  s.played[gm.id] = (s.played[gm.id] || 0) + 1;
  if ((s.paid | 0) >= PAID_PER_DAY) { save(A); return null; }
  s.paid = (s.paid | 0) + 1;
  const add = { ...gm.pay };
  if (G && G.res) {
    try { gain(G, add); } catch (e) { for (const [k, v] of Object.entries(add)) G.res[k] = (G.res[k] || 0) + v; }
    save(A);
    try { A.ui.flashRes(Object.keys(add)); A.ui.refresh(); } catch (e) { /* the HUD may be hidden */ }
  }
  return add;
}
function save(A) { try { if (A && typeof A.save === 'function') A.save(); } catch (e) { /* the game keeps running in memory */ } }
function nextFact(gm) {
  const A = api(), s = slot(A ? A.state : null), list = gm.facts || [];
  if (!list.length) return null;
  const i = (s.fx[gm.id] | 0) % list.length;
  s.fx[gm.id] = i + 1;
  return list[i];
}
function payHTML(add) {
  if (!add) return '';
  const [k, v] = Object.entries(add)[0];
  return `<div class="g10-pay" data-pay="${k}:${v}"><span class="g10-ic" data-ic="${k}"></span>+${v} ${esc((RES_HE[k] || [k, k])[v === 1 ? 0 : 1])} למלאי</div>`;
}
function paintIcons(root) {
  for (const s of root.querySelectorAll('.g10-ic[data-ic]')) { try { const c = ICON(s.dataset.ic, 24); const im = document.createElement('canvas'); im.width = c.width; im.height = c.height; im.style.cssText = 'width:24px;height:24px'; im.getContext('2d').drawImage(c, 0, 0); s.replaceWith(im); } catch (e) { s.remove(); } }
}

/* ───────── the words at the end: kind, never shaming ───────── */
function words(gm, duel, r) {
  if (typeof gm.words === 'function') return gm.words(duel, r, PLAYERS);   // (games13: the new games carry their own kind words)
  const w = r.winner;
  if (gm.id === 'four') {
    if (!duel) return w === 0 ? ['נדבך שלם!', 'ארבע אבנים לבנות בשורה — בנית נדבך.'] : w === 1 ? ['הבנאי השלים נדבך', 'הפעם הוא הקדים. בנדבך הבא — אתה שוב מתחיל.'] : ['החומה מלאה!', 'אף אחד לא השלים ארבע — חומה יפה ששניכם בניתם.'];
    if (w < 0) return [['החומה מלאה!', 'חומה יפה ששניכם בניתם — תיקו של בונים.'], ['החומה מלאה!', 'חומה יפה ששניכם בניתם — תיקו של בונים.']];
    return [0, 1].map((i) => (i === w ? ['נדבך שלם!', 'ארבע בשורה — שני בנאים טובים, והפעם שלך.'] : ['כמעט!', `${PLAYERS[w].name} השלים נדבך הפעם. שני בנאים טובים!`]));
  }
  if (gm.id === 'memory') {
    const p = r.pairs || [0, 0];
    if (!duel) return ['כל הכלים נמצאו!', `מצאת את ששת הזוגות ב־${r.tries} ניסיונות.`];
    if (w < 0) return [['תיקו של זיכרון!', 'שלושה זוגות לכל אחד — שני כהנים זוכרים.'], ['תיקו של זיכרון!', 'שלושה זוגות לכל אחד — שני כהנים זוכרים.']];
    return [0, 1].map((i) => (i === w ? ['זיכרון של כהן!', `מצאת ${p[i]} זוגות.`] : p[i] ? ['זיכרון טוב!', `מצאת ${p[i] === 1 ? 'זוג אחד' : `${p[i]} זוגות`}; ${PLAYERS[w].name} מצא ${p[w]}.`] : ['הפעם הזוגות הלכו לחבר', `${PLAYERS[w].name} זכר את כולם. בסיבוב הבא — אתה מתחיל.`]));
  }
  if (gm.id === 'stack') {
    const c = r.courses || [0, 0], pf = r.perfect || [0, 0];
    const nd = (n) => (n === 1 ? 'נדבך אחד' : `${n} נדבכים`);   // (PRODUCER10 N38: "בנית נדבך אחד", not "1 נדבכים")
    if (!duel) return !c[0] ? ['כמעט!', 'האבן הראשונה החטיאה את היסוד — עוד פעם?'] : [r.best ? 'שיא חדש!' : `בנית ${nd(c[0])}!`, `${nd(c[0])}${pf[0] ? `, ${pf[0] === 1 ? 'אחד מדויק' : `${pf[0]} מהם מדויקים`}` : ''}.${r.prev ? ` השיא שלך: ${Math.max(r.prev, c[0])}.` : ''}`];
    if (w < 0) return [0, 1].map((i) => ['שני קירות באותו גובה!', `${nd(c[i])} לכל אחד — שני בנאים טובים.`]);
    return [0, 1].map((i) => (i === w ? ['הקיר שלך גבוה יותר!', `${nd(c[i])} מול ${c[1 - i]} — שני בנאים טובים.`] : ['קיר יפה!', `בנית ${nd(c[i])}; ${PLAYERS[w].name} בנה ${c[w]}.`]));
  }
  if (gm.id === 'sling') {
    const lv = r.level | 0;
    if (duel) {   // (FUN12) the duel in turns: who felled more (then: in fewer stones)
      const d = r.down || [0, 0], u = r.used || [0, 0];
      if (w < 0) return [0, 1].map(() => ['תיקו של קלעים!', `${d[0]} מתוך ${r.targets} לכל אחד — שני קלעים טובים.`]);
      return [0, 1].map((i) => (i === w ? ['קלע מדויק!', `הפלת ${d[i]} מתוך ${r.targets}${d[i] === d[1 - i] ? ` ב־${u[i]} אבנים` : ''}.`] : ['זריקות יפות!', `הפלת ${d[i]} מתוך ${r.targets}; ${PLAYERS[w].name} הפיל ${d[w]}${d[i] === d[w] ? ` ב־${u[w]} אבנים` : ''}.`]));
    }
    return r.won ? [SLING.winTitle(lv), r.goliath ? '״וַתִּטְבַּע הָאֶבֶן בְּמִצְחוֹ וַיִּפֹּל עַל פָּנָיו אָרְצָה״ (שמואל א יז, מט; טיוטה).' : `שלב ${lv}: ${r.used === 1 ? 'באבן אחת' : `ב־${r.used} אבנים`}.`]
      : [r.down ? 'כמעט!' : 'עוד ניסיון?', r.down ? `נפלו ${r.down} מתוך ${r.targets}. באבנים הבאות — עוד קצת.` : 'חמש האבנים עפו. נסה למשוך יותר או פחות.'];
  }
  if (gm.id === 'levites') {
    const n = r.len | 0;
    if (!duel) return r.whole ? ['השיר שלם!', `חזרת על לחן של ${n} צלילים — כמו לוי על הדוכן.`] : [n ? `לחן של ${n} ${n === 1 ? 'צליל' : 'צלילים'}!` : 'התחלה טובה!', n ? `חזרת עליו בלי טעות. בפעם הבאה — עוד צליל.` : 'הלחן הראשון תמיד הכי קשה. עוד פעם?'];
    if (w < 0) return [0, 1].map(() => ['שיר שלם!', `${n} צלילים — שניכם שרתם יפה.`]);
    return [0, 1].map((i) => (i === w ? ['זיכרון של לוי!', `השיר הגיע ל־${n} צלילים — שניכם שרתם יפה.`] : ['שרתם יפה!', `הפעם התחלף צליל. השיר הגיע ל־${n} צלילים.`]));
  }
  const rd = r.rounds || [0, 0];
  if (!duel) return w === 0 ? ['ראשון לארבע האמות!', `ניצחת ${rd[0]}:${rd[1]} בסיבובים. כהן זריז!`] : ['הכהן השני הקדים', `הפעם ${rd[1]}:${rd[0]} לו — רצת יפה. עוד מרוץ?`];
  return [0, 1].map((i) => (i === w ? ['שני הכהנים זריזים!', `הגעת ראשון לארבע האמות (${rd[i]}:${rd[1 - i]}).`] : ['שני הכהנים זריזים!', `רצת יפה — ${PLAYERS[w].name} הקדים מעט (${rd[i]}:${rd[1 - i]}).`]));
}

async function result(S, gm, duel, r, add, fact) {
  const wd = words(gm, duel, r);
  if (!duel) {
    const html = `<h2>${esc(wd[0])}</h2><p>${esc(wd[1])}</p>${payHTML(add)}${factHTML(fact)}`;
    const p = S.card(html, [{ value: 'again', label: 'עוד פעם', gold: true }, { value: 'other', label: 'משחק אחר' }, { value: 'close', label: 'חזרה לבנייה' }], { cls: 'g10-result' });
    paintIcons(S.el);
    return p;
  }
  // a duel: each end gets its own card, turned to its player; either one's tap decides
  const L = S.overlaySplit();
  L.root.classList.add('g10-result');
  const ps = L.halves.map((half, i) => S.halfCard(half, `<h2>${esc(wd[i][0])}</h2><p>${esc(wd[i][1])}</p>${i === 0 ? payHTML(add) : ''}${factHTML(fact)}`,
    [{ value: 'again', label: 'עוד סיבוב', gold: true }, { value: 'other', label: 'סיום' }]));
  paintIcons(S.el);
  const v = await Promise.race(ps);
  ps.forEach((p) => p.close());
  L.root.remove();
  return v;
}

/** the hub (or one game) until the player goes back to the building */
export function openGames(ctx = {}) {
  if (running) return running;
  chipOff();
  running = (async () => {
    const A = api();
    const out = { played: 0, paid: {} };
    const hold = (on) => {   // the game's own hold when it offers one (FLOW10: api.hold → overlayOn(on, true): the crews' stones are placed, not lifted), else main.js's
      try { if (A && typeof A.hold === 'function') A.hold(on); else if (HOST && typeof HOST.pause === 'function') HOST.pause(on); } catch (e) { /* */ }
    };
    hold(true);
    const sfx = sfxOf(ctx.sfx);
    const root = ctx.root || (A && A.ui && A.ui.root) || document.body;
    const S = createShell(root, { sfx, gesture: LEVITES.unlock });   // (a card's tap starts the Levites' audio: iOS wants it inside a tap)
    const reduced = reducedMotion();
    try {
      const hubList = () => (ctx.featured ? [GAMES.find((g) => g.id === ctx.featured), ...GAMES.filter((g) => g.id !== ctx.featured)].filter(Boolean) : GAMES);
      const hubOpt = () => (ctx.featured ? { featured: ctx.featured, why: ctx.why || '' } : undefined);
      let pick = ctx.game && GAMES.some((g) => g.id === ctx.game) ? { id: ctx.game } : await S.hub(hubList(), undefined, hubOpt());
      while (pick) {
        const gm = GAMES.find((g) => g.id === pick.id);
        const mode = gm ? await S.howto(gm) : null;
        if (!mode) { pick = await S.hub(hubList(), undefined, hubOpt()); continue; }
        const duel = mode === 'duel';
        let first = 0, next = 'again';
        const score = [0, 0];
        while (next === 'again') {
          const muted = () => { try { const k = ctx.sfx || (api() && api().sfx); return !!(k && k.muted); } catch (e) { return false; } };
          const r = await gm.run(S, { duel, first, score, sfx, reduced, muted, rnd: ctx.rnd || Math.random, G: A ? A.state : local });
          if (!r || r.quit) { next = 'other'; break; }
          if (gm.id === 'sling' && !duel) SLING.record(A ? A.state : local, r.level, r);   // (FUN12) the valley's levels, shared with the quarry's cycle
          if (r.winner === 0 || r.winner === 1) score[r.winner]++;
          out.played++;
          const add = pay(gm);
          if (add) for (const [k, v] of Object.entries(add)) out.paid[k] = (out.paid[k] || 0) + v;
          { const s = slot(A ? A.state : null); if (r.winner === 0) s.wins[gm.id] = (s.wins[gm.id] | 0) + 1;
            if (gm.id === 'stack' && !duel) { if (!s.best || typeof s.best !== 'object') s.best = {}; const b = s.best.stack | 0; r.prev = b; r.best = b > 0 && r.courses[0] > b; if (r.courses[0] > b) s.best.stack = r.courses[0]; }
            save(A); }
          next = await result(S, gm, duel, r, add, nextFact(gm));
          first = duel ? 1 - first : 0;   // a duel alternates who starts; alone, you always start
        }
        if (next === 'close') break;
        pick = await S.hub(hubList(), undefined, hubOpt());
      }
    } catch (e) {
      try { console.warn('[games10]', e); } catch (x) { /* */ }
    } finally {
      S.destroy();
      hold(false);
      try { if (A && Object.keys(out.paid).length && A.ui) A.ui.toast({ icon: Object.keys(out.paid)[0], title: 'משחקי ביניים', body: Object.entries(out.paid).map(([k, v]) => `+${v} ${(RES_HE[k] || [k, k])[1]}`).join(' · '), kind: 'mini', ms: 2400 }); } catch (e) { /* */ }
      running = null;
    }
    return out;
  })();
  return running;
}
export function open(id) { return openGames(id && id !== 'hub' ? { game: id } : {}); }

/** the menu's section (ui.js menuHTML, inside `// ── games10 ──`) */
export function menuHTML(G) {
  // (FUN11) the game that fits the stage he is building is marked (gold), so the menu too says which one to try now
  let fit = '';
  try { const g = G || (api() && api().state); fit = g && (g.ftue | 0) >= 99 ? ((STAGE_GAMES[stageNow(g)] || [])[0] || '') : ''; } catch (e) { fit = ''; }
  const b = (id, t) => `<button class="gm-btn${id === fit ? ' gm-btn-gold' : ''}" data-g10="${id}" style="flex:1 1 40%;padding:8px 6px;min-width:0"${id === fit ? ' aria-label="' + esc(t) + ' — מתאים למה שאתה בונה"' : ''}>${esc(t)}${id === fit ? ' ✦' : ''}</button>`;
  return `<div class="gm-sec">משחקי ביניים</div><div class="gm-btn-row" style="margin-top:4px">${GAMES.map((g) => b(g.id, g.title)).join('')}</div>`
    + '<p class="gm-muted" style="margin:6px 0 0;font-size:12.5px">משחקים קלאסיים מעולם המקדש — לבד, או שניים על טלפון אחד (כל אחד בקצה שלו).</p>';
}

/** FLOW10's optional hook between stages: a small invitation at most once a day, never during the first-time flow.
 *  (FUN11, wave 11) it names the ONE game that fits the stage just built, with its reason; "משחק אחר" opens the hub. */
export async function invite(G, stage) {
  try {
    if (running || !G || typeof G !== 'object' || reelOf(G) || (G.ftue | 0) < 99) return false;
    const s = slot(G);
    const A = api();
    if (!A || !A.ui || typeof A.ui.modal !== 'function') return false;
    const st = stage || lastStage(A) || stageNow(G), id = pickFor(G, st), gm = GAMES.find((g) => g.id === id);
    if (s.inv === invKey(G, st)) return false;
    // (PRODUCER11 N43) after a chapter's end the player has just read two cards (the stage, the chapter): a third card is one
    // too many — the invitation is then the small chip that fades by itself
    if (!stage && lastChapter(A)) { s.inv = invKey(G, st); save(A); chip(id); return false; }
    s.inv = invKey(G, st); s.lastOffer = id; save(A);
    const v = await A.ui.modal(`<div style="text-align:center" class="g10-inv" data-game="${esc(id)}"><b style="font:900 20px 'Frank Ruhl Libre',serif">הפסקה קצרה?</b><p style="margin:6px 0 2px;font-weight:700">${esc(gm ? gm.title : '')}</p><p style="margin:2px 0 6px">${esc(WHY[id] || '')}</p><p class="gm-muted" style="margin:0;font-size:12.5px">לבד, או שניים על טלפון אחד · עוד ${GAMES.length - 1} משחקים בפנים</p></div>`,
      { buttons: [{ label: `לשחק: ${gm ? gm.title : ''}`, value: 'one', gold: true }, { label: 'משחק אחר', value: 'hub' }, { label: 'אחר כך', value: false }] });
    if (v === 'one') { await openGames({ game: id }); return true; }
    if (v === 'hub') { await openGames({ featured: id, why: WHY[id] || '' }); return true; }
    return false;
  } catch (e) { return false; }
}
function lastChapter(A) {
  try { const L = A.log || []; for (let i = L.length - 1; i >= 0; i--) if (L[i].type === 'stageDone') return !!(L[i].detail && L[i].detail.chapter); } catch (e) { /* */ }
  return false;
}
function lastStage(A) {
  try { const L = A.log || []; for (let i = L.length - 1; i >= 0; i--) if (L[i].type === 'stageDone' && L[i].detail && L[i].detail.id) return L[i].detail.id; } catch (e) { /* */ }
  return '';
}

/* ── (FUN11, wave 11) the game table's sign: SITE11's table by the quarry (stages.gameTable() → {x, y, z, on}) gets a small tappable
   sign over it — "🎲 משחקים" — whenever it is in the frame and near enough to read (≤ 320 amot), so a child finds the door by
   himself; a tap = the table's own tap (table()). Hidden under any card, sheet, board, moment or the whole-Temple view, in the FTUE
   and the demo; nothing at all when the world has no table (a branch without SITE11's). One projection a frame. ── */
const TAG_CSS = `.g10-tag-w{position:fixed;left:0;top:0;z-index:57;pointer-events:auto;min-width:44px;min-height:44px;padding:0 12px 0 8px;border-radius:999px;
 display:flex;align-items:center;gap:6px;direction:rtl;border:0;cursor:pointer;background:linear-gradient(#FFF8E8,#F0DBB0);color:#4A2A0A;
 box-shadow:0 4px 14px rgba(40,24,6,.35),inset 0 0 0 2px #D8AB58;font:800 14px/1 "Heebo",sans-serif;white-space:nowrap;opacity:0;transition:opacity .25s;
 -webkit-tap-highlight-color:transparent}
.g10-tag-w.on{opacity:1}
.g10-tag-w canvas{width:28px;height:28px;border-radius:7px}
.g10-tag-w::after{content:"";position:absolute;left:50%;bottom:-7px;margin-left:-7px;border:7px solid transparent;border-bottom:0;border-top-color:#E6C98E}`;
let tagEl = null, tagRaf = 0, tagVis = false, tagX = -1e9, tagY = -1e9;
function tagLoop() {
  if (tagRaf || typeof requestAnimationFrame !== 'function' || typeof document === 'undefined') return;
  const step = () => {
    tagRaf = requestAnimationFrame(step);
    try { tagFrame(); } catch (e) { tagShow(false); }
  };
  tagRaf = requestAnimationFrame(step);
}
function tagShow(on) {
  if (!tagEl) return;
  if (on !== tagVis) { tagVis = on; tagEl.classList.toggle('on', on); tagEl.style.visibility = on ? 'visible' : 'hidden'; }
}
function tagFrame() {
  if (document.hidden) return;
  const W = HOST && typeof HOST.world === 'function' ? HOST.world() : null;
  if (!W || typeof W.gameTable !== 'function' || typeof HOST.project !== 'function') { tagShow(false); return; }
  const A = api(), G = A ? A.state : null;
  const T = W.gameTable();
  if (!G || reelOf(G) || (G.ftue | 0) < 99 || !T || !T.on || running || A.busy || A.whole) { tagShow(false); return; }
  const cam = typeof HOST.camPos === 'function' ? HOST.camPos() : null;
  if (cam && Math.hypot(cam.x - T.x, cam.y - T.y, cam.z - T.z) > 320) { tagShow(false); return; }
  const p = HOST.project(T.x, T.y + 3, T.z);
  if (!p || !p.on || p.x < 40 || p.x > innerWidth - 40 || p.y < 120 || p.y > innerHeight - 150) { tagShow(false); return; }
  if (document.querySelector(BUSY_SEL) || document.querySelector('.gm-sheet.on,.md-pq,.md-back')) { tagShow(false); return; }   // (the DOM is asked last: only when the table is on screen)
  if (!tagEl) {
    injectCSS('g10-tag-css', TAG_CSS);
    tagEl = document.createElement('button');
    tagEl.type = 'button'; tagEl.className = 'g10-tag-w'; tagEl.setAttribute('aria-label', 'שולחן המשחקים: משחקי ביניים');
    tagEl.innerHTML = '<canvas width="56" height="56" aria-hidden="true"></canvas><span>משחקים</span>';
    try { const g = tagEl.querySelector('canvas').getContext('2d'); g.scale(56 / 76, 56 / 76); FOUR.GAME.icon(g, 76); } catch (e) { /* decoration */ }
    tagEl.addEventListener('click', (e) => { e.stopPropagation(); tagShow(false); try { const k = api() && api().sfx; if (k && k.play) k.play('ui'); } catch (x) { /* */ } table(); });
    tagEl.style.visibility = 'hidden';
    (((A.ui && A.ui.root) || document.body)).appendChild(tagEl);
  }
  const w = tagEl.offsetWidth || 110, h = tagEl.offsetHeight || 44;
  const x = Math.round(p.x - w / 2), y = Math.round(p.y - h - 10);
  if (Math.abs(x - tagX) >= 1 || Math.abs(y - tagY) >= 1) { tagX = x; tagY = y; tagEl.style.transform = `translate(${x}px,${y}px)`; }
  tagShow(true);
}

/* ── (FUN11, wave 11) the chip after a board: a finished match-3 board (won or not) leaves, once the screen is calm, a small chip
   for ONE game (the stage's, not the last one offered) for 12 s; a tap opens it. At most every 10 minutes; never in the FTUE, the
   demo or over a card. It asks for nothing and costs nothing: it just fades. ── */
let chipEl = null, chipT = 0, chipDue = 0;
const CHIP_CSS = `.g10-chip{position:fixed;z-index:58;left:50%;bottom:calc(env(safe-area-inset-bottom,0px) + 92px);transform:translate(-50%,12px);opacity:0;
 display:flex;align-items:center;gap:6px;direction:rtl;width:max-content;max-width:calc(100vw - 32px);box-sizing:border-box;padding:0;border-radius:999px;pointer-events:auto;
 background:linear-gradient(#FFF8E8,#F0DBB0);box-shadow:0 6px 18px rgba(40,24,6,.35),inset 0 0 0 2px #D8AB58;transition:opacity .3s,transform .3s;font-family:"Heebo",sans-serif}
.g10-chip.on{opacity:1;transform:translate(-50%,0)}
.g10-chip button{border:0;background:none;color:#4A2A0A;min-height:48px;cursor:pointer;font:inherit;-webkit-tap-highlight-color:transparent}
.g10-chip .go{flex:0 1 auto;min-width:0;display:flex;align-items:center;gap:8px;padding:0 6px 0 14px;font:800 15px/1.2 "Heebo",sans-serif;white-space:nowrap}
.g10-chip .go small{display:block;font:600 11.5px/1.2 "Heebo",sans-serif;opacity:.8}
.g10-chip canvas{width:34px;height:34px;border-radius:9px;flex:none}
.g10-chip .x{flex:0 0 auto;min-width:44px;padding:0 12px 0 8px;font:700 16px/1 "Heebo",sans-serif;opacity:.7}
@media (prefers-reduced-motion:reduce){.g10-chip{transition:none}}`;
function chipOff() { if (!chipEl) return; const e = chipEl; chipEl = null; clearTimeout(chipT); e.classList.remove('on'); setTimeout(() => e.remove(), 320); }
/** show the chip now for game id (tests and the watcher) → true when shown */
export function chip(id) {
  try {
    const A = api(), G = A ? A.state : null;
    if (running || chipEl || !G || reelOf(G) || (G.ftue | 0) < 99) return false;
    const gm = GAMES.find((g) => g.id === (id || pickFor(G, stageNow(G))));
    if (!gm || typeof document === 'undefined') return false;
    injectCSS('g10-chip-css', CHIP_CSS);
    const s = slot(G); s.lastOffer = gm.id; s.chipAt = Date.now(); save(A);
    const e = document.createElement('div');
    e.className = 'g10-chip'; e.setAttribute('role', 'status'); e.dataset.game = gm.id;
    e.innerHTML = `<button type="button" class="go" data-v="go"><canvas width="68" height="68" aria-hidden="true"></canvas><span>${esc(gm.title)}<small>משחק ביניים · לבד או בשניים</small></span></button><button type="button" class="x" data-v="x" aria-label="לא עכשיו">✕</button>`;
    try { const g = e.querySelector('canvas').getContext('2d'); g.scale(68 / 76, 68 / 76); gm.icon(g, 76); } catch (x) { /* decoration */ }
    e.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-v]'); if (!b) return;
      ev.stopPropagation();
      const go = b.dataset.v === 'go';
      chipOff();
      try { const k = A.sfx; if (k && typeof k.play === 'function') k.play('ui'); } catch (x) { /* */ }
      if (go) openGames({ game: gm.id });
    });
    ((A.ui && A.ui.root) || document.body).appendChild(e);
    requestAnimationFrame(() => e.classList.add('on'));
    chipEl = e;
    chipT = setTimeout(chipOff, 12000);
    return true;
  } catch (e) { return false; }
}

try { const P = globalThis.__BH_PARTS || (globalThis.__BH_PARTS = {}); P.games = { openGames, open, menuHTML, invite, GAMES, table, tableInfo, chip, pickFor, cyclePlan, cyclePill, cycleAhead, cycleOf }; } catch (e) { /* a frozen global: main.js passes the part */ }
