/* ─────────────────────────────────────────────────────────────────────────────
 * index.js: the Phase A game controller: rules (state.js) + HUD (ui.js) + key moments (moments.js) +
 * sound (audio.js) + the 3D world (stages.js, driven only through the guarded interface below).
 *
 *   const game = createGame({ world, root, view, hooks, onEvent, options });
 *   game.start();                                   // after the loader is gone
 *   picking → game.onSiteTap(id) · game.onBoulderTap(i) · game.onQuarryTap()
 *   main loop → game.frame(nowMs)                   // world-anchored HUD (ring, floats, coach)
 *
 * world: the stages.js API, plus setTimeOfDay(k) from main.js. Every call is feature-detected and guarded
 *   (a missing method is a no-op, a throw is logged, a promise that never settles times out). The GDD §12
 *   world API (stages.js v2), exactly as called here:
 *     hotspot(id|null) (the goal site) · setCraneSite(id) · screenPos(target, out) → {x, y, on} CSS px, target
 *     stageId | {boulder:i} | 'quarry' (the ring, the floats, the coach) · showPlan(ms) (the opening vision) ·
 *     orbit(id, 3) (a site done) · showcase() (a chapter done) · shine() (the Heichal done) ·
 *     redLine(0.5) (sovev: half the altar's height) · boxes(t 0..1) (kodesh) · setVine(size) · rain(bool) (night) ·
 *     hero.setTool('wood'|'iron') (no iron on the altar) · hitBoulder(i, hp) ·
 *     strikeFX(target, 'normal'|'perfect'|'combo', combo) (includes workFX) · setComboLevel(n) (0 when the ring stops) ·
 *     playTimelapse([{id, a, b}], 4000) (the offline return) · setQuarryStock(blocks, crews) ·
 *     quarry {x, z} + hasQuarry → hero.walkTo('quarry'); pick() → {kind:'quarry'}.
 *   Night braziers, lamps and the lantern follow setTimeOfDay by themselves. Crews in the world: setCrews/setQuarry/caravan/trainees (src/crews.js).
 * view: from main.js: project(x, y, z) → {x, y, on} (CSS px; the fallback HUD anchors) · lookAt(x, y, z, dist, az, el, ms)
 *   (a camera flight) · dist(x, y, z) (camera distance, for "too far to work on").
 * hooks: { enterWhole(), exitWhole(), setAutoRotate(bool) } whole-Temple view (main.js owns the camera UI).
 * ──────────────────────────────────────────────────────────────────────────── */
import {
  STAGES, SIDX, stageById, RES, T, RHYTHM, MOMENTS, STORY, ROUTES, RIDX, TRAIN, BOULDERS, RATE, DEMO_SPEED,
  PROJ, EVENTS, PH_N, FIELD_N, UPGRADES, DEMO_LEVEL, SEG, FIELD_OF, m3Pay, keyWords, keyOf,
} from './content.js';
import { MIDDOT, MIDX } from './middot.js';
// ── middot10 ── (MIDDOT10, wave 10) the book's place links: showPlace(key) flies to a place named in the Mishnah
import { placeFlight, openDaily, openPlaceQuiz } from './middot-ui.js';
// ── /middot10 ──
import * as S from './state.js';
import * as TL from './tools.js';   // ── tools21 ── the kohen's tools: tiers, the job's tool ── /tools21 ──
import * as SHOP from './shop.js';   // ── econ14 ── אוצר המלאכה ── /econ14 ──
import { PAY } from './content.js';   // ── econ14 ── ── /econ14 ──
import { createUI, isoNum, isoFrac, srcHTML, countTxt, digWords, segWords } from './ui.js';
import { playMoment } from './moments.js';
import { createAudio } from './audio.js';
import { dayInfo } from '../calendar.js';
import { createHooks } from './hooks/index.js';
import { createFacts } from './facts.js';   // ── flow8 ── the facts' rotation (FACTS8B's content/facts.json via main.js)
import * as HR from './hooks/rhythm.js';
import * as HD from './hooks/demo.js';
import { nightOf } from '../weather.js';   // ── world12 ── the rain by the Hebrew date (src/weather.js) ── /world12 ──
// ── fun14 ── the course loop (src/game/jobs.js): "מה נעשה עכשיו?" — the deal, the jobs, their share, their coins
import * as JB from './jobs.js';
import { SIDX as SIDX_T } from './content.js';   // ── tools21 ──
const ALTAR_T = new Set(['yesod', 'sovev', 'guf', 'karnot']);   // ── tools21 ── (wood: no iron)
import { DECKS, boardPar } from './content.js';   // ── flow16 ── (boardPar: the extra card's minutes) ── /flow16 ──
import { GAMES as MG_GAMES } from './minigames/index.js';
// ── /fun14 ──
import { createTwin } from './twin.js';
import { beatQ as caBeatQ } from './minigames/acts.js';   // ── crafta19 ── the act's grade on the music's beat (FUN19 §2) ── /crafta19 ──
import { createNudges, lineOf } from './nudge.js';   // ── hook19 ── the tabs that call ── /hook19 ──
import { READ, isRead, readKey } from './learn.js';   // ── hook19 ── reading pays ── /hook19 ──
import { createScore, JOB_END, BONUS } from './score.js';   // ── hook19 ── the master score and its 10,000 coin ── /hook19 ──
// ── hook20 ── ("המסביב": the seen marks, the end chain, the slots; src/game/hooks/around*.js, endchain.js, riddle.js)
import * as AR20 from './hooks/around.js';
import { createEndChain } from './hooks/endchain.js';
import * as RD20 from './hooks/riddle.js';
import { MISHMAROT } from '../calendar.js';
// ── /hook20 ──
import { createJuice18 } from './juice.js';
import { createHar42, wanted42, H42KEY, load42, save42, wallStones45, migrate45 } from './har42.js';   // ── fable32 (build 44) ── (load42: the test's record) ── /fable32 ──
   // ── fable32 (build 42) ── the new stage 01, "שיטוח ההר" ── /fable32 ──   // ── juice18 ── every visual answer to a touch and to a result; the craft points (craftxp.js) ── /juice18 ──   // ── twin17 ── two thumbs at the Mount in landscape (PRINCIPLES §2–§4) ── /twin17 ──

const DEFAULTS = {
  autosaveMs: 10000,
  timeouts: { walk: 20000, swing: 5000 },     // (awaited world promises; the others play on by themselves)
  settingsKey: 'bh_settings',
};
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
/* Mirrors stages.js BOULDERS (x, z, r): used only when world.screenPos is missing, to point at a boulder. ── flow9 ── a world with
   SITE9's boulder field (`boulderSpots()`) overwrites it index by index at start (readBoulderSpots), so G.bh and old saves hold. */
const BOULDER_XZ = [[-172, -122], [-96, -132], [-24, -118], [60, -110], [128, -84], [178, -30], [186, 40], [124, 112], [34, 124], [-58, 118], [-142, 124], [-240, -30]];
let FIRST_BOULDER = 4;
const ALTAR = new Set(['yesod', 'sovev', 'guf', 'karnot']);
const REST_HOLIDAYS = new Set(['rosh-hashana', 'yom-kippur', 'shemini-atzeret', 'shavuot']);
/** Shabbat and Yom Tov (Jerusalem calendar): they never break the streak. */
function isRestDay(key) {
  try {
    const i = dayInfo(new Date(key + 'T12:00:00+03:00'));
    if (i.isShabbat) return true;
    const h = i.holiday;
    if (!h) return false;
    return REST_HOLIDAYS.has(h.id) || ((h.id === 'sukkot' || h.id === 'pesach') && (h.day === 1 || (h.id === 'pesach' && h.day === 7)));
  } catch (e) { return false; }
}

export function createGame({ world, root, view, hooks = {}, onEvent, options = {}, parts: given } = {}) {
  const opt = { ...DEFAULTS, ...options, timeouts: { ...DEFAULTS.timeouts, ...(options.timeouts || {}) } };
  // build6: main.js hands the parts at the top level (createGame({ parts })); options.parts and __BH_PARTS still work
  if (given && typeof given === 'object') opt.parts = { ...(options.parts || {}), ...given };
  const now = typeof opt.now === 'function' ? opt.now : () => Date.now();
  const store = opt.storage || S.storage;
  const W = guardWorld(world, opt.timeouts);
  let bOrder = null;                                   // ── flow9 ── the boulder field's strike path (readBoulderSpots)
  const reduced = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const F = opt.fast ? 0.1 : 1;           // tests: tutorial pauses ×0.1
  const touch = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;

  /* ── settings (per device) ── */
  // ── land17 ── wave 17: `cam` 'follow' (the Brawl-Stars camera, the default) | 'director' (v29's frames) and `popups` 'show' | 'book'
  // (an info pop-up opens | only a small "נוסף לספר" float, the fact saved to the book); both saved in bh_settings like `rhythm`
  let settings = { rhythm: true, haptics: true, demo: false, cam: 'follow', popups: 'show' };
  try { const s = JSON.parse(store.get(opt.settingsKey) || '{}'); if (s && typeof s === 'object') settings = { ...settings, ...s }; } catch (e) { /* defaults */ }
  if (settings.cam !== 'director') settings.cam = 'follow';
  if (settings.popups !== 'book') settings.popups = 'show';
  // ── /land17 ──
  // ── flow8 ── (the owner, 28.9: "רץ בספיד") demo mode is never persisted: v16 wrote `demo` into bh_settings, so a phone that
  // once opened #demo stayed in the ×60 demo for good. A stored `demo` is dropped here (a trapped phone heals on its next
  // open); demo comes only from the link ('#demo' — artifact links pass a plain #anchor — or ?demo=1) or the menu, per session.
  settings.demo = false;
  if (typeof location !== 'undefined' && (/[?&]demo=1/.test(location.search) || /^#demo$/.test(location.hash))) settings.demo = true;
  const saveSettings = () => { const { demo, ...keep } = settings; store.set(opt.settingsKey, JSON.stringify(keep)); };
  if (!settings.demo) { try { const s = JSON.parse(store.get(opt.settingsKey) || '{}'); if (s && s.demo) saveSettings(); } catch (e) { /* storage */ } }   // (heal the stored flag)
  const sfx = opt.audio || createAudio({ storage: store });

  const keyOf = () => (settings.demo ? S.DEMO_KEY : (() => { try { return AR20.slotKey(AR20.slotCur(store)); } catch (e) { return S.SAVE_KEY; } })());   // ── hook20 ── (the kohen of this phone: the first keeps today's key)
  // ── supervisor (30.9) ── the demo is the owner's way to test every stage: it plays like the real game (the work frames, the
  // course beats, the crane's quick lifts, the plumb's course checks, the plan cards), only with plenty of materials and ×60
  // time. The investor reel's curated behavior is on only once its "הרגע הבא ✦" was pressed in this demo save (G.story.reel);
  // a stage picked from "שלבים ▾" starts a fresh demo save without it.
  const reelOn = () => !!(G && G.demo && G.story && G.story.reel);
  let { G, isNew } = S.load(store, keyOf(), now());
  let started = false, whole = false, dayOpen = '', tod = null;
  let opening = false;                     // ── build7 ── the opening vision is on screen (the world shows the finished House)
  let JU = null;   // ── juice18 ── (juice.js: made with the thumbs, registered at __BH_PARTS.juice) ── /juice18 ──
  let H42 = null;   // ── fable32 (build 42) ── ── /fable32 ──
  let TW = null, twinMarks = [], twinMarkN = 0, twinWas = false, twinCamWas = false, twinSheet = false, twinPerfect = false, twinModeWas = 'follow', twinDir = false, twinSiteT = 0, twinDealRef = null;   // ── twin17 ── (twinSiteT: twin18) (declared before emit can run) ── /twin17 ──
  const intervals = [];
  const log = [];
  // ── land17 ── the game's bus can be listened to: game.on(type, fn) → off() (type '*' hears everything); 'settings' {key, value, all}
  const busFn = new Map();
  const busOn = (type, fn) => { if (typeof fn !== 'function') return () => {}; const a = busFn.get(type) || []; a.push(fn); busFn.set(type, a); return () => { const b = busFn.get(type) || []; const i = b.indexOf(fn); if (i >= 0) b.splice(i, 1); }; };
  const busTell = (type, detail) => { for (const k of [type, '*']) for (const f of (busFn.get(k) || []).slice()) { try { f(detail, type); } catch (e) { console.warn('[game] listener failed', e); } } };
  // ── /land17 ──
  const emit = (type, detail) => {
    log.push({ t: now(), type, detail });
    busTell(type, detail);   // ── land17 ──
    if (log.length > 400) log.shift();
    if (typeof onEvent === 'function') { try { onEvent(type, detail); } catch (e) { console.warn('[game] onEvent failed', e); } }
    try { scoreEvent(type, detail); nudgeEvent(type, detail); } catch (e) { console.warn('[score]', e); }   // ── hook19 ──
    try { around20(type, detail); } catch (e) { console.warn('[hook20]', e); }   // ── hook20 ── (the seen marks' counters, the end chain's request) (the fixed points of the table; the capsule; the tabs that call)
    if (JU && TW && TW.on) { try { juiceEvent(type, detail); } catch (e) { /* juice's */ } }   // ── juice18 ── (the celebrations, under two thumbs) ── /juice18 ──
    if (TW && TW.on) { try { TW.event(type, detail); twinBanner(type, detail); } catch (e) { /* twin's */ } }   // ── twin17 ── (the gold flash, the craftsman's hand, the banners) ── /twin17 ──
    // ── twin18 ── (the thumb has him: a placement the load or a sync still owed — keepAtWork's, or the landing's follow-up when the world
    // poses the site (relanded) — never takes him back to his banker: twin-touch's job 1 found him there and started the key stone)
    if (type === 'twinStick') { placeNext = false; landAt = null; }
    if (type === 'twinWork' && !(detail && detail.craft)) CA.td = performance.now();   // ── crafta19 ── (the touch that strikes: its time, for the act's lag) ── /crafta19 ──
    // ── /twin18 ──
    if (type === 'strike') jobStrike(detail);   // ── fun14 ── "סתת בקצב" counts the ring's strikes; after a board or a check the deal comes back ── /fun14 ──
    else if (type === 'm3Won' || type === 'm3Lost' || type === 'check' || (type === 'ftue' && detail >= 5)) dealWant = 1;   // ── fun14 ── (the first deal comes as the first-time flow reaches its strokes) ── /fun14 ──
    funBeats(type, detail);
  };
  /* ── build6 ── FUN's loop hooks (hooks/loop.js, registered as __BH_PARTS.fun): every event → beats (a find, an order done,
     a personal best, a crew level) shown as a toast with its sound */
  function funBeats(type, detail) {
    const L = (globalThis.__BH_PARTS || {}).fun || (opt.parts || {}).fun;
    if (!L || typeof L.onEvent !== 'function' || !G) return;
    let beats = null;
    try { beats = L.onEvent(G, type, detail || {}, now()); } catch (e) { return; }
    if (!Array.isArray(beats)) return;
    for (const b of beats.slice(0, 2)) {
      if (!b || !b.he) continue;
      try { if (b.sfx) sfx.play(b.sfx); } catch (e) { /* a sound we lack */ }
      try { if (ui && ui.root) ui.toast({ icon: b.kind === 'crew' ? 'crew' : 'star', title: b.he, body: b.sub || '', kind: 'mini', ms: 3200 }); } catch (e) { /* the HUD is not up yet */ }
    }
  }
  const persist = () => S.save(G, store, keyOf(), now());
  // ── hook19 ── (wave 19, note 6; docs/FUN19.md §4.1) the master score G.score: score.js makes the points and the coins; this block shows them
  // (ui.score / scoreGain), pays the fixed bonuses from the game's events (scoreEvent, in emit) and celebrates a coin at the next pause.
  // The API for the crafts: game.score.add(n, why) · J.hit(kind, { pts | act }) — see bus/HOOK19.md. Registered at __BH_PARTS.score.
  const SCR = createScore({ G: () => G, persist: () => persist(), emit: (t, d) => emit(t, d), stage: () => { try { return twinStage() || (G && G.focus) || ''; } catch (e) { return ''; } }, now });
  try { const P = globalThis.__BH_PARTS || (globalThis.__BH_PARTS = {}); P.score = SCR; } catch (e) { /* a frozen global */ }
  let dinarT = 0, dinarBusy = false, pauseT = 0;
  /** a fixed bonus: added once (or each time), held and shown as a note by the capsule, its number ticks up */
  function scoreBonus(n, why, label, once) {
    const r = SCR.add(n, why, once ? { once } : {});
    if (r.n > 0) { try { ui.hold('score', r.n); ui.scoreGain(r.n, label); } catch (e) { /* the HUD's */ } }
    return r.n;
  }
  /** the game's events → the fixed points of FUN19 §4.1's table (a job's end, a craft's first time at a stage, a course, a stage, the first stone) */
  function scoreEvent(type, d) {
    if (!d) d = {};
    if (type === 'stoneSet') { if (d.by !== 'crew') scoreBonus(BONUS.welcome, 'welcome', 'ברוך הבא לבית', 'welcome'); }
    else if (type === 'jobDone') {
      const st = Math.max(0, Math.min(3, d.stars | 0)), site = d.site || d.id || '', job = d.job || '';
      if (st > 0) scoreBonus(JOB_END[st], 'job' + st, `${'★'.repeat(st)} סוף העבודה`);
      if (site && job) scoreBonus(BONUS.fresh, 'fresh', 'חדש!', `fresh:${site}:${job}`);
      pauseT = performance.now();
    } else if (type === 'course') { if (d.by !== 'crew' && !d.away) { scoreBonus(BONUS.course, 'course', 'נדבך'); pauseT = performance.now(); } }
    else if (type === 'stageDone') { if (!d.skipped && d.id) { scoreBonus(BONUS.stage, 'stage', 'שלב הושלם', `stage:${d.id}`); pauseT = performance.now(); } }
    else if (type === 'score') { try { ui.score(); } catch (e) { /* the HUD's */ } }
    else if (type === 'strike' && !(JU && TW && TW.on)) {   // (portrait / no thumbs: the old strike pays its grade at once; the capsule ticks)
      const n = SCR.grade(d.perfect ? 'gold' : 'good'), r = SCR.add(n, 'strike');
      if (r.n) { try { ui.bump('score', r.n); } catch (e) { /* the HUD's */ } }
    }
  }
  /** the builders' account: stages built before this version earn 500 each, once, in one note (docs/FUN19.md ⚑ — the default) */
  function scoreLegacy() {
    if (G.demo) return;
    let n = 0;
    for (const id of Object.keys(G.st || {})) { if (G.st[id] && G.st[id].done && !(G.scf && G.scf['stage:' + id]) && !(G.scf && G.scf['legacy:' + id])) { if (!G.scf) G.scf = {}; G.scf['legacy:' + id] = 1; G.scf['stage:' + id] = 1; n++; } }
    if (n) scoreBonus(500 * n, 'legacy', 'חשבון הבונה');
  }
  /** a coin whose celebration is waiting: at the next natural pause (≥ 1.8 s without an act, nothing open, nothing playing), at most 30 s after it was won */
  function dinarTick() {
    if (dinarBusy || !started) return;
    const u = SCR.unseen(); if (!u.length) { dinarT = 0; return; }
    const t = performance.now(); if (!dinarT) dinarT = t;
    const js = JU ? JU.stats() : null, quiet = !ui.busy && !momentBusy && !overlay && !whole && !opening && !(js && (js.big || js.busy)) && !(ui.root && ui.root.querySelector('.gm-modal.on,.gm-mo,.fx-mg.on,.m3'));
    const idle = SCR.idle(), pause = idle > 1800 && !jobBusy, late = t - dinarT > 30000 && idle > 500;
    if (quiet && (pause || late || (pauseT && t - pauseT > 2300 && idle > 800))) dinarRun(u[0]);
  }
  function dinarRun(c) {
    dinarBusy = true; dinarT = 0; pauseT = 0;
    const i = SCR.list().findIndex((x) => x.n === c.n);
    emit('dinar', { n: c.n, stage: c.stage });
    return ui.dinar({ n: c.n, stage: c.stage, onLand:   /* ── hook20 ── (returned: the end chain waits for the coin) */ () => { try { sfx.play('dinar'); haptic([20, 40, 30]); const M = globalThis.__BH_MUSIC; if (M && typeof M.lift === 'function') M.lift(2, 8); } catch (e) { /* the sound's */ } } })
      .then(() => { if (i >= 0) SCR.seen(i); try { ui.score(); ui.bump('score', 0); } catch (e) { /* the HUD's */ } }, () => { if (i >= 0) SCR.seen(i); })
      .finally(() => { dinarBusy = false; });
  }
  // ── hook19 ── (docs/FUN19.md §4.2) the tabs that call: nudge.js has the rules; here: when a natural pause is (a job's result, a course's end,
  // a stage's end, the survey's number), what waits behind each tab, and the one line. The badge is the dock's own and stays until the tab is opened.
  const NG = createNudges({ now: () => performance.now() });
  try { const P = globalThis.__BH_PARTS || (globalThis.__BH_PARTS = {}); P.nudge = NG; } catch (e) { /* a frozen global */ }
  let ngT = 0, ngNews = '', ngIdle = 0, ngDay = 0, ngTickT = 0;
  const ngQuiet = () => !!(started && !G.demo && G.ftue >= 99 && !whole && !opening && !momentBusy && !overlay && !jobBusy && !SC && !ui.busy && SCR.idle() > 1800
    && !(ui.root && ui.root.querySelector('.gm-modal.on,.gm-mo,.fx-mg.on,.m3,.gm-dn,.gm.sheet-open,.gm-cine.on')) && !(JU && JU.stats().busy) && !(globalThis.__HANDS && globalThis.__HANDS.twin));   // (supervisor, RESEARCH19's round 1: never while a craft runs in the world)
  /** one nudge at most: the first tab, by priority, that has something waiting and may call now (the rules: nudge.js) */
  function nudgeTry(kind, tries = 0) {
    clearTimeout(ngT); ngT = 0;
    if (!started || G.demo || G.ftue < 99) return false;
    if (!ngQuiet()) { if (tries < 4) ngT = setTimeout(() => nudgeTry(kind, tries + 1), 2200); return false; }
    const O = [];
    if (ngNews) O.push(['store', lineOf('store', ngNews)]);
    const un = MIDDOT.filter((m) => G.book.un[m.id] && !isRead(G, m.id));
    if (un.length) {
      const k = (m) => STAGES.findIndex((x) => x.id === m.at), m = un.slice().sort((a, b) => k(b) - k(a))[0];
      O.push(['book', kind === 'survey' ? lineOf('survey') : lineOf('book', (stageById(m.at) || {}).n || 'המקדש')]);
    }
    if (ngIdle && performance.now() - ngIdle > 60000) O.push(['crews', lineOf('crews')]);
    try { const K = parts().kings, st = K && typeof K.status === 'function' ? K.status(G, now()) : null; if (st && st.arrived > 0) O.push(['kings', lineOf('kings')]); } catch (e) { /* the kings' */ }
    const dn = (G.daily && G.daily.tasks ? G.daily.tasks : []).filter((t) => t.done).length;
    if (dn > ngDay) O.push(['daily', lineOf(dn >= 3 ? 'grape' : 'daily')]);
    for (const [tab, line] of O) { const r = NG.offer(tab, line); if (r.ok) { try { AR20.recall(G, tab); ui.refresh(); } catch (e) { /* hook20 */ } if (ui.nudge({ tab, line })) emit('nudge', { tab, line }); return true; } /* ── hook20 ── (the call makes its tab's waiting things new again: the badge) */ }
    return false;
  }
  NG.try = (kind) => nudgeTry(kind || 'test');   // (tests: after N.warp(), a nudge at once, if the rules allow)
  function nudgeEvent(type, d) {
    if (!d) d = {};
    if (type === 'jobDone') { clearTimeout(ngT); ngT = setTimeout(() => nudgeTry('job'), 3400); }
    else if (type === 'course') { if (d.by !== 'crew' && !d.away) { clearTimeout(ngT); ngT = setTimeout(() => nudgeTry('course'), 3600); } }
    else if (type === 'phase') { if (d.ph === 'dig' && G.ftue >= 99) { clearTimeout(ngT); ngT = setTimeout(() => nudgeTry('survey'), 3000); } }
    else if (type === 'stageDone') {
      if (d.skipped || !d.id) return;
      const nx = STAGES.filter((x) => x.deps.includes(d.id) && S.statusOf(G, x.id) === 'avail').map((x) => x.n);
      if (nx.length) { ngNews = nx.join(' · '); try { ui.refresh(); } catch (e) { /* the HUD's */ } }
      NG.stage(d.id); clearTimeout(ngT); ngT = setTimeout(() => nudgeTry('stage'), 9000);
    } else if (type === 'sheet') {
      NG.opened(d);
      if (d === 'store') { ngNews = ''; try { ui.refresh(); } catch (e) { /* the HUD's */ } }
      if (d === 'daily') ngDay = (G.daily && G.daily.tasks ? G.daily.tasks : []).filter((t) => t.done).length;
    }
  }
  /** a second's watch: how long a crew has stood idle */
  function nudgeWatch() {
    const t = performance.now(); if (t - ngTickT < 2000) return; ngTickT = t;
    const idle = (G.crews || []).some((c) => !c.at);
    if (idle && !ngIdle) ngIdle = t; else if (!idle) ngIdle = 0;
  }
  // ── hook20 ── ("המסביב", docs/WAVE20-BRIEF.md) the tabs' real badges (G.seen), today's work and the days, the end chain after a course / a stage,
  // the daily riddle's payment, the slots' key. The rules: hooks/around.js · riddle.js · endchain.js; the DOM: around-ui.js · riddle-ui.js.
  let EC = null;
  const dayNow20 = () => AR20.dayOf(now());
  const doneN20 = () => STAGES.filter((x) => S.isDone(G, x.id)).length;
  function around20(type, d) {
    if (!G || G.demo) return;
    AR20.ensure(G);
    if (type === 'sheet') { if (d === 'daily' || d === 'crews' || d === 'book' || d === 'store') { AR20.opened(G, d, { riddleDay: dayNow20() }); persist(); try { ui.refresh(); } catch (e) { /* the HUD's */ } } return; }
    let craft = 'סתתים'; try { craft = (JU && JU.xp && JU.xp.cur().craft) || craft; } catch (e) { /* juice's */ }
    AR20.event(G, type, d || {}, { day: dayNow20(), craft });
    if (type === 'jobDone' || type === 'course' || type === 'dinar' || type === 'riddleSolved') { try { ui.refresh(); } catch (e) { /* the HUD's */ } }
    if (!EC || G.ftue < 99) return;
    if (type === 'course' && d && d.by !== 'crew' && !d.away) {
      const P = PROJ[d.id], sv = S.siteView(G, d.id);
      EC.request({ kind: 'course', id: d.id, stones: P ? P.P : 0, noStamp: !!(JU && TW && TW.on), name: sv ? sv.name : '' });
    } else if (type === 'stageDone' && d && !d.skipped && d.id) {
      const P = PROJ[d.id];
      EC.request({ kind: 'stage', id: d.id, stones: P ? P.C * P.P : 0, noStamp: !!(JU && TW && TW.on) });
    }
  }
  /** the daily riddle was solved: one dinar's worth of points, once a day, and the fact kept in the book */
  function riddleSolved20(id, day) {
    const r = SCR.add(RD20.RIDDLE_PTS, 'riddle', { once: 'riddle:' + day });
    RD20.keep(G, day);
    emit('riddleSolved', { id, day, coins: r.coins.length });
    persist(); try { ui.score(); } catch (e) { /* the HUD's */ }
    return r;
  }
  function chainMake20() {
    EC = createEndChain({
      root: ui.root, ui, sfx, G: () => G, now,
      score: () => SCR.get(), golds: () => SCR.stats().gold, act,
      music: () => globalThis.__BH_MUSIC,
      mishmar: () => (G.mishmar ? MISHMAROT[G.mishmar - 1] : ''),
      tomorrow: () => { const rs = RD20.tomorrow(dayNow20(), doneN20()); return AR20.tomorrowLine(G, rs); },
      tomorrowTitle: () => RD20.tomorrow(dayNow20(), doneN20()),   // ── board21 ── (the locked silhouette's title)
      emit: (t, d) => emit(t, d),
      // (the world's own craft may stand armed and waiting for the first touch — a key stone, a job — so a running job is not a reason to wait;
      //  a modal, a card, a coin, the course's camera beat and a touch in the last 1.2 s are. A stage waits 6 s for its own cards to open first)
      quiet: (p) => !!(started && !G.demo && !whole && !opening && !ui.busy && tNow() >= camHold && SCR.idle() > 1200 && !(JU && JU.stats().busy)
        && !(ui.root && ui.root.querySelector('.gm-modal.on,.gm-mo,.fx-mg.on,.m3,.gm-dn,.gm-cine.on')) && (p ? performance.now() - p.at > (p.kind === 'stage' ? 6000 : 2600) : true)),
    });
    EC.reset();
  }
  // ── /hook20 ──
  // ── /hook19 ──
  // ── /hook19 ──
  /* ── flow8 ── (the owner, 28.9: "כל פעם חוזר על אותו דבר") true facts in rotation: the current stage first, no repeats
     across sessions (G.fx in the save); the precision games get one (ctx.fact, ctx.nextFact) and so does anyone via
     globalThis.__BH_FACTS.nextFact(topic) (GAMES8B's boards; posted on bus/FLOW8B.md) */
  const facts = createFacts({ G: () => G, stage: () => { try { return S.focusOf(G) || S.recommend(G).id || 'har'; } catch (e) { return 'har'; } }, store });
  const nextFact = (topic) => { try { return facts.next(topic); } catch (e) { return null; } };
  globalThis.__BH_FACTS = { nextFact };
  const MG_TOPIC = { crane: 'stone', great: 'stone', dress: 'stone', quarry: 'stone', plumb: 'herod', whole: 'yesod' };   // (FACTS8B's topic ids)
  /** a precision game's facts: ctx.fact (picked once) and ctx.nextFact(topic) — its first call hands the same fact */
  function mgFacts(kind) {
    const topic = MG_TOPIC[kind] || '';
    let memo = null, handed = false;
    const first = () => memo || (memo = nextFact(topic));
    return { fact: first() || undefined, nextFact: (t) => { if (!handed && (!t || t === topic)) { handed = true; return first(); } return nextFact(t || topic); } };
  }
  const haptic = (ms) => { if (settings.haptics !== false && typeof navigator !== 'undefined' && navigator.vibrate) { try { navigator.vibrate(ms); } catch (e) { /* unsupported */ } } };

  /* ───────── actions (called by the HUD) ───────── */
  const act = {
    /** the ONE prominent action (state.js nextAction): a stroke, a key stone, a level, a step, a moment */
    goal() { return opening || tNow() < holdUntil ? false : doAction(S.nextAction(G, dealOpt)); },   // (flow8: not under the delivery beat)
    pillHold: () => (tNow() < holdUntil ? holdTxt : ''),   // ── flow8 ── the pill while a segment's stones arrive
    strikeRun: () => started && (hero.busy || tNow() - hero.lastImpact < 2.2 * F),   // ── flow8 ── toasts wait for the pause after a run
    dealOpt: () => dealOpt,   // ── build7 ── the pill's nextAction resolver (a king for a bronze need)
    startBuild, focus: (id) => { if (S.isWorkable(G, id)) G.focus = id; W.focus(id); ui.refresh(); },
    moment: (id) => runMoment(id),
    // ── build6 ── the site panel's buttons
    build: (id) => buildStep(id),
    play: (id) => { const a = playFor(id); if (a) playLevel(a); },
    playField: (field) => playLevel({ kind: 'play', id: S.focusOf(G), field, need: {} }),
    // build6 (KINGS 21:36, FUN P1 'silver has no sink'): beside a board for cedar / gold / bronze, the king's offer that brings it now
    kingsBest: (a) => kingsBest(a),
    boardPays: (a) => boardPays(a),   // ── build7 ── the pill's "כ־40 אבנים"
    kingsOffer: (partner, offer) => openKings(null, { partner, offer }),
    key: (id) => keyStone(id),
    inspect: (id) => runInspect(id),
    work: (id) => workAt(id),
    buy: (k) => econBuy(k), shopCtx: () => econShopCtx(),   // ── econ14 ── אוצר המלאכה ── /econ14 ──
    upgrade(k) {
      const r = S.upgrade(G, k);
      if (!r.ok) { if (r.lack) ui.toast({ icon: 'silver', title: T.lacking, body: `כסף ${isoNum(r.lack.silver)}`, kind: 'mini' }); return; }
      persist(); sfx.play('coin'); ui.flashRes(['silver']);
      ui.toast({ icon: 'crew', title: `${UPGRADES[k].n} · דרגה ${r.lvl}`, body: UPGRADES[k].d, kind: 'mini' });
      emit('upgrade', { k, lvl: r.lvl }); ui.refresh();
    },
    kings: () => { try { NG.opened('kings'); } catch (e) { /* hook19 */ } return openKings(); },
    /** FUN's sheet buttons (hooks/loop.js onTap): claim an order's reward, or play the daily challenge */
    funTap(el) {
      const L = parts().fun; if (!L || typeof L.onTap !== 'function') return;
      let r = null; try { r = L.onTap(G, el, now()); } catch (e) { return; }
      if (r && r.claim) { S.gain(G, r.claim); persist(); ui.flashRes(Object.keys(r.claim)); try { sfx.play(r.sfx || 'coin'); } catch (e) { /* sound */ } ui.refresh(); }
      if (r && r.play) { const mg = parts().minigames; if (mg && typeof mg.runMinigame === 'function') { ui.closeSheet(); guarded(mg.runMinigame(r.play.mg, { root: ui.root || document.body, world, level: r.play.level, seed: r.play.seed, daily: true, demo: reelOn(), onEvent: (t, d) => emit(t, d), sfx, haptic, reduced, ...mgFacts(r.play.mg) }), 'minigames.daily').then(() => { persist(); ui.refresh(); }); } }
    },
    assignCrew(i, at) { if (S.assignCrew(G, i, at)) { persist(); ui.refresh(); syncCrane(); syncQuarry(); syncCrews(); } },   // ── crews ──
    crewHere(id, dir) {
      if (dir > 0) { const c = G.crews.find((x) => !x.at) || G.crews.find((x) => x.at === 'quarry') || G.crews.find((x) => x.at !== id); if (c) c.at = id; }
      else { const c = G.crews.find((x) => x.at === id); if (c) c.at = S.isDone(G, 'har') ? 'quarry' : null; }
      persist(); ui.refresh(); syncQuarry();
      syncCrews();                                      // ── crews ──
    },
    startCaravan() {}, collectCaravan() {},            // (v5 caravans: KINGS owns the sea routes now; old callers get a no-op)
    train() { const r = S.startTraining(G, now()); if (r.ok) { persist(); sfx.play('coin'); ui.refresh(); syncCrews(); } },   // ── crews ──
    async quizOpen() {
      const q = S.quizToday(G, now());
      const choice = await ui.quizCard(q);
      if (!q || choice < 0) return;
      const r = S.answerQuiz(G, q.id, choice, now());
      if (!r.ok) return;
      persist();
      if (r.correct) { sfx.play('chime', { combo: 5 }); taskHit('quiz'); ui.toast({ icon: 'book', title: T.quizRight, body: `${isoNum(TRAIN.quizSilver, true)} כסף${r.cut ? ` · ההכשרה קוצרה ב-${fmtSpan(r.cut)}` : ''}` }); }
      else ui.toast({ icon: 'book', title: T.quizWrong, body: `התשובה: ${q.a[q.ok]} (${q.ref})` });
      ui.refresh();
    },
    /** ── hook19 ── "קראתי ✓" at the end of an entry: ★500 and 5 craft points, once per entry (the entry must be open) */
    bookRead(id) {
      if (!G.book.un[id] || isRead(G, id)) return;
      const r = SCR.add(READ.pts, 'read', { once: readKey(id) });
      if (!(r.n > 0)) return;
      try { const X = JU && JU.xp; if (X) { const c = X.cur().craft; X.add(c, READ.xp); } else { const c = 'סתתים'; G.xp = G.xp || {}; G.xp[c] = (G.xp[c] | 0) + READ.xp; } } catch (e) { /* the craft's */ }
      taskHit('learn'); persist();
      try { sfx.play('chime'); haptic(12); ui.refresh(); ui.toast({ icon: 'book', title: 'קראתי ✓', body: `★ ${READ.pts} נוספו לאוצר · ${READ.xp} נקודות מלאכה`, kind: 'mini', ms: 3000 }); } catch (e) { /* the HUD's */ }
    },
    readMishnah(id) {
      const r = S.readMishnah(G, id);
      if (!r.ok) return;
      if (r.first) { taskHit('learn'); persist(); }
      if (r.siyum) { sfx.play('fanfare'); ui.storyCard({ t: 'סיום מסכת מידות', d: 'קראת את כל 34 המשניות של מסכת מידות. הדרן עלך!' }, 'ספר מידות'); emit('siyum'); }
    },
    volunteers(id) { if (S.callVolunteers(G, id, now())) { persist(); ui.toast({ icon: 'crew', title: T.volunteers, body: 'עבודת הצוותים באתר כפולה לרבע שעה' }); } },
    skipChapter,
    skipStage: () => skipStage(), pickStage: () => pickStage(),   // ── supervisor (30.9) ── the demo's stages
    demoNext: () => demoNext(),
    /** (hooks) play a finished key moment again: the overlay only, the world and the save are not touched */
    async replayMoment(kind) {
      if (momentBusy || !MOMENTS[kind]) return;
      momentBusy = true; stopRing(); ui.coach(null, '');
      emit('replay', kind);
      try { await playMoment(kind, { root: ui.root, text: MOMENTS[kind], sfx, haptic, reduced, T, world: {}, fmtSrc: srcHTML, repeat: true }); } finally { momentBusy = false; }   // ── hooks ── (round 3) repeat: a flag for moments.js (a shorter replay; ignored until it reads it)
    },
    setSetting(k, v) {
      if (k === 'mute') { sfx.muted = v; if (!v) sfx.unlock(); }
      else {
        // ── land17 ── the two choices are words, not booleans; anything else falls back to the default
        if (k === 'cam') v = v === 'director' ? 'director' : 'follow';
        else if (k === 'popups') v = v === 'book' ? 'book' : 'show';
        // ── /land17 ──
        settings[k] = v; saveSettings();
      }
      if (k === 'rhythm' && !v) stopRing();
      emit('settings', { key: k, value: v, all: { ...settings, mute: sfx.muted } });   // ── land17 ──
    },
    // ── land17 ── "רק בספר": an info pop-up that did not open is kept in the book (G.notes: { k, t, q, d, ref }, newest last, ≤ 60)
    bookNote(e) {
      if (!e || !G) return false;
      const t = String(e.t || '').slice(0, 120), key = `${e.k || ''}|${t}|${String(e.d || e.q || '').slice(0, 40)}`;
      const L = G.notes || (G.notes = []);
      if (!L.some((x) => x.key === key)) {
        L.push({ key, k: String(e.k || ''), t, q: e.q ? String(e.q).slice(0, 400) : '', d: e.d ? String(e.d).slice(0, 600) : '', ref: e.ref ? String(e.ref).slice(0, 160) : '' });
        while (L.length > 60) L.shift();
        persist();
      }
      emit('bookNote', { k: e.k, t });
      return true;
    },
    // ── /land17 ──
    toggleDemo() { switchMode(!settings.demo); },
    exitDemo() { if (settings.demo || (G && G.demo)) switchMode(false); },   // ── flow8 ── the exit chip
    enterWhole, exitWhole,
    /** Phase B, "העבודה בבית": main.js swaps the game (the save is kept; coming back resumes the building) */
    enterAvodah() { if (hooks.enterAvodah) { persist(); hooks.enterAvodah(); } },
    openYard() { if (!(H42 && H42.on)) startH44('yard'); },   // ── fable32 (build 44) ── חצר האומנים from the menu ── /fable32 ──
    get canYard() { return !!(G && S.isDone(G, 'har') && !G.demo); },   // ── fable32 (build 44) ── ── /fable32 ──
    get canAvodah() { return !!hooks.enterAvodah; },
    newGame,
    heroQuarry: () => onQuarryTap(),
    sheetChanged(kind, arg) {
      emit('sheet', kind);
      if (kind === 'caravans' && G.ftue === 6) coachAt('dock', 'בחר "5 דק׳" בעגלות המחצבה');
      if (kind === 'caravans' && HK.hint) HK.clearHint();
      if (kind === 'stage' && arg === 'wall' && G.ftue === 7) ui.coach(null, '');
      if (hooks.setAutoRotate && kind) hooks.setAutoRotate(false);
    },
  };

  let HK = null;                          // the engagement layer (./hooks/index.js); `hooks` is main.js's whole-view hooks
  const ui = createUI({
    root: root || document.body,
    ctx: { G: () => G, now, act, sfx, settings: () => ({ ...settings, mute: sfx.muted }), hooks: () => HK, score: () => SCR.get() /* ── hook19 ── */ },
  });
  // the engagement layer (docs/HOOKS.md): the appointment strip, the rest card, honest rhythm, the highlight reel
  act.persistNow = () => persist(); act.riddleSolved = (id, day) => riddleSolved20(id, day);   // ── hook20 ──
  act.dinarNow = () => { const u = SCR.unseen(); return u.length && !dinarBusy ? dinarRun(u[0]) : Promise.resolve(); };   // ── hook20 ── (the end chain plays the coin's own card)
  HK = createHooks({ G: () => G, now, ui, emit, sfx, act, coach: (where, text) => coachAt(where, byName(text)), busy: () => momentBusy || hero.busy || whole || opening, restAfterS: opt.fast ? 2 : 20 });

  /* ───────── lifecycle ───────── */
  function start() {
    if (started) return api;
    started = true;
    ui.mount();
    try { chainMake20(); } catch (e) { console.warn('[hook20]', e); }   // ── hook20 ──
    HK.mount();
    const t = now();
    SCR.sync(true);   // ── hook19 ── (a total that passed a multiple without its coin: the coin is kept, quietly)
    const before = isNew ? null : S.snapshot(G);
    // ── build7 ── a new game opens on the vision: the boot's finished House stays on screen until the opening's swap
    opening = openingDue() && !wanted42(G, S.isDone);   // ── fable32 (build 42) ── (the new stage 01 opens on its own flyover) ── /fable32 ──
    // ── flow11 ── (N34) a player coming back sees the world as it is NOW from the first frame, and lands on his kohen at his work
    // (what the crews built while he was away is told by the welcome card: v20's 4-s tour of it began on an empty frame)
    const rep = settleNow(t);
    if (!opening) syncWorld(null);
    const landed = !opening && !isNew ? landWork() : null;
    // build6 (FUN 20:56 P2): the sound at contact from the first stroke (the survey's), if FUN's kit exports its once-per-kit
    // binding; otherwise FUN's first precision game binds it
    try { const mg = parts().minigames; if (mg && typeof mg.bindSound === 'function') mg.bindSound({ sfx, world }, world && (world.stages || world)); } catch (e) { /* optional */ }
    econSync();   // ── econ14 ── what אוצר המלאכה sold, in 3D and in the music ── /econ14 ──
    const daily = S.dailyCheck(G, t, isRestDay);
    dayOpen = S.dayKey(t);
    persist();
    ui.refresh();
    scoreLegacy();   // ── hook19 ── (the builders' account)
    namePlate();                             // ── flow8 ── the name over the hero (a named player coming back)
    syncTime();
    intervals.push(setInterval(tick, 1000), setInterval(persist, opt.autosaveMs), setInterval(ftueWatch, 700));
    document.addEventListener('visibilitychange', onVisibility);
    addEventListener('pagehide', persist);
    emit('start', { isNew, demo: G.demo });
    // ── fable32 (build 45) ── the developers' fixture ?h45go=1: straight to stage 02 (the Mount done, the vision seen, the test passed) ── /fable32 ──
    try { if (/[?&]h45go=1(&|$)/.test(location.search || '') && !S.isDone(G, 'wall')) { if (!S.isDone(G, 'har')) { S.completeStage(G, 'har'); G.ftue = Math.max(G.ftue | 0, 99); G.op = 1; } G.vision44 = 1; try { localStorage.setItem('bh_vision44', '1'); } catch (e) { /* */ } const S4 = load42(); S4.test44 = Object.assign(S4.test44 || { jobs: {} }, { passed: true }); save42(S4); persist(); syncWorld(null); } } catch (e) { /* */ }
    // ── fable32 (build 46) ── the developers' fixture ?h46go=1: straight to stage 03 (the Mount and the court wall done — the wall's stretch of his
    // stones only if a stage 02 was played in this browser) ── /fable32 ──
    try { if (/[?&]h46go=1(&|$)/.test(location.search || '') && !S.isDone(G, 'sorag')) { if (!S.isDone(G, 'har')) { S.completeStage(G, 'har'); G.ftue = Math.max(G.ftue | 0, 99); G.op = 1; } if (!S.isDone(G, 'wall')) { S.completeStage(G, 'wall'); G.st.wall.h45 = 1; } G.vision44 = 1; try { localStorage.setItem('bh_vision44', '1'); } catch (e) { /* */ } const S4 = load42(); S4.test44 = Object.assign(S4.test44 || { jobs: {} }, { passed: true }); save42(S4); persist(); syncWorld(null); } } catch (e) { /* */ }
    // ── fable32 (build 47) ── the developers' fixture ?h47go=1: straight to stage 04 (the Mount, the court wall and the soreg done) ── /fable32 ──
    try { if (/[?&]h47go=1(&|$)/.test(location.search || '') && !S.isDone(G, 'gates')) { for (const id of ['har', 'wall', 'sorag']) if (!S.isDone(G, id)) S.completeStage(G, id); G.ftue = Math.max(G.ftue | 0, 99); G.op = 1; if (G.st.wall) G.st.wall.h45 = 1; G.vision44 = 1; try { localStorage.setItem('bh_vision44', '1'); } catch (e) { /* */ } const S4 = load42(); S4.test44 = Object.assign(S4.test44 || { jobs: {} }, { passed: true }); save42(S4); persist(); syncWorld(null); } } catch (e) { /* */ }
    // ── fable32 (build 48) ── the developers' fixture ?h48go=1: straight to stage 05 (the Mount, the wall, the soreg and the gates done) ── /fable32 ──
    try { if (/[?&]h48go=1(&|$)/.test(location.search || '') && !S.isDone(G, 'nashim')) { for (const id of ['har', 'wall', 'sorag', 'gates']) if (!S.isDone(G, id)) S.completeStage(G, id); G.ftue = Math.max(G.ftue | 0, 99); G.op = 1; if (G.st.wall) G.st.wall.h45 = 1; G.vision44 = 1; try { localStorage.setItem('bh_vision44', '1'); } catch (e) { /* */ } const S4 = load42(); S4.test44 = Object.assign(S4.test44 || { jobs: {} }, { passed: true }); save42(S4); persist(); syncWorld(null); } } catch (e) { /* */ }
    ensureWall45();   // ── fable32 (build 46) ── his stones in the court wall, from the save ── /fable32 ──
    if (wanted42(G, S.isDone)) startHar42();   // ── fable32 (build 42) ── the Mount not done: the new stage 01 ── /fable32 ──
    else if (wantedTest44()) startH44('test');   // ── fable32 (build 44) ── the craftsman's test before chapter ב׳ ── /fable32 ──
    else if (wanted45()) startHar45();   // ── fable32 (build 45) ── stage 02, the court wall, the new way ── /fable32 ──
    else if (wanted46()) startHar46();   // ── fable32 (build 46) ── stage 03, the soreg and the chel, the new way ── /fable32 ──
    else if (wanted47()) startHar47();   // ── fable32 (build 47) ── stage 04, the court's gates, the new way ── /fable32 ──
    else if (wanted48()) startHar48();   // ── fable32 (build 48) ── stage 05, the women's court, the new way ── /fable32 ──
    else if (isNew || G.ftue < 99) runFtue();
    else welcomeBack(before, rep, daily, { landed, synced: true });
    return api;
  }
  function destroy() {
    intervals.forEach(clearInterval); intervals.length = 0;
    clearTimeout(ftueTimer);   // the tutorial's timers must not fire into a destroyed HUD (UI-S5)
    document.removeEventListener('visibilitychange', onVisibility);
    removeEventListener('pagehide', persist);
    hero.gen++;
    if (started) persist();
    if (JU) { try { JU.destroy(); const P = globalThis.__BH_PARTS; if (P && P.juice === JU) delete P.juice; } catch (e) { /* juice's */ } JU = null; }   // ── juice18 ── ── /juice18 ──
    if (TW) { try { TW.destroy(); } catch (e) { /* twin's */ } TW = null; }   // ── twin18 ── (Phase B, the tour: the follow camera lets go, the thumbs leave) ── /twin18 ──
    ui.destroy();
    started = false;
  }

  /* Push the whole state to the world. snap: an earlier snapshot to show (for the offline timelapse). */
  function syncWorld(snap) {
    for (const s of STAGES) {
      const o = snap ? snap.st[s.id] : { status: S.statusOf(G, s.id), p: S.progressOf(G, s.id) };
      W.setStage(s.id, o.status, o.p, { instant: true });
      // ── build6 ── the site as it stands: phase, stones, stock — ── flow11 ── at once (the count landed: no eased ripple that
      // moves the next slot, its crane and his banker for seconds after a load, a resync or the whole view's return)
      // (the landing call only where the world frames a working front — stages.js's wallView — and eases the count behind it)
      if (!snap && o.status === 'building') { siteInfo(s.id); syncSite(s.id, true, true); if (W.has('setWork') && W.has('wallView')) W.setStage(s.id, 'building', undefined, { instant: true }); }
    }
    W.setBoulders(snap ? snap.bh : G.bh);
    if (!bOrder) readBoulderSpots();                    // ── flow9 ── the boulder field (SITE9), once the world stands
    if (S.isDone(G, 'har')) {
      // the builder waits at the site the goal points to
      const b = S.buildingSites(G), r = S.recommend(G), f = S.focusOf(G);
      const at = f || (r.id && b.includes(r.id) ? r.id : b[0] || (r.id && S.statusOf(G, r.id) !== 'locked' ? r.id : null));
      // ── flow11 ── at his work spot there (his banker by the next slot), else the site's own spot
      const sp = at && at === workSite() ? workSpotAt(at) : null;
      if (at) W.heroPlace(sp || at);
      hero.at = null;
    }
    placeNext = true;   // ── flow10 ── (N11) the Mount's courses: at his banker once the world has posed its crane (keepAtWork) — ── flow11 ── every stage
    lastWorkId = null;  // ── flow11 ── (a full sync: his work is the state's work site again — curWork)
    W.heroShow(true);
    syncCrane();
    syncQuarry(true);
    W.setVine(S.isDone(G, 'ulam') ? S.vineSize(G) : 0);
    hotspot();
    syncCrews(true);                                    // ── crews ── everything, at once
  }
  /* Animate the world from a snapshot to now: the "while you were away" timelapse (GDD §4.2). */
  async function timelapse(snap) {
    const changed = [];
    for (const s of STAGES) {
      const a = snap.st[s.id], b = { status: S.statusOf(G, s.id), p: S.progressOf(G, s.id) };
      if (a.status === b.status && Math.abs(a.p - b.p) < 0.005) continue;
      changed.push({ id: s.id, a, b });
    }
    const gen = hero.gen;
    // the world replays each changed site fast, one after another, with the camera (stages.js playTimelapse)
    const tl = W.playTimelapse(changed, 4000);
    if (tl) {
      await tl;
      if (gen !== hero.gen || whole) return;
      syncWorld(null);
      const r = S.recommend(G);
      if (r.id) W.focus(r.id);
      return;
    }
    for (const c of changed.slice(0, 4)) {
      if (gen !== hero.gen || whole) return;
      W.focus(c.id, 1400);
      await sleep(900);
      if (c.b.status === 'building' || c.b.status === 'done') {
        const steps = 12, p0 = c.a.status === 'building' ? c.a.p : 0, p1 = c.b.status === 'done' ? 1 : c.b.p;
        if (c.a.status !== 'building') W.setStage(c.id, 'building', p0, { instant: true });
        for (let k = 1; k <= steps; k++) { W.setStage(c.id, 'building', p0 + (p1 - p0) * (k / steps)); await sleep(110); }
        if (c.b.status === 'done') { W.setStage(c.id, 'done', 1); W.celebrate(c.id); sfx.play('fanfare'); }
      } else W.setStage(c.id, c.b.status, c.b.p);
      await sleep(500);
    }
    syncWorld(null);
    const r = S.recommend(G);
    if (r.id) W.focus(r.id);
  }

  /* Shabbat and Yom Tov: the site rests (Yevamot 6a ⚑); a day's answer is cached */
  const restMemo = new Map();
  const restAt = (t) => { const k = S.dayKey(t); if (!restMemo.has(k)) { if (restMemo.size > 64) restMemo.clear(); restMemo.set(k, isRestDay(k)); } return restMemo.get(k); };
  const settleNow = (t) => S.settle(G, t, { rest: G.demo ? null : restAt });
  /* Every second: crews, the quarry, timers, the kings' ships, the real-clock time of day, the day change. */
  let kingsT = 0;
  function tick() {
    if (!started) return;
    const t = now();
    const rep = settleNow(t);
    applyReport(rep, true);
    const day = S.dayKey(t);
    if (day !== dayOpen) { dayOpen = day; const d = S.dailyCheck(G, t, isRestDay); if (d) { persist(); wageToast(d); } }
    if (t - kingsT > 5000) { kingsT = t; kingsTick(t); shortageBeat(); }
    ui.tick(t);
    HK.tick(t);
    dinarTick(); nudgeWatch();   // ── hook19 ──
    syncQuarry();
    syncCrews();                                        // ── crews ── (settle moves crews and ends training)
    syncTime();
    calmStory();
    idleFact(t);                                        // ── flow8 ──
    markSync();                                         // ── flow8 ──
  }
  /* ── flow8 ── the idle tips are true facts in rotation: a calm minute (no stroke for 25 s, nothing open) brings one, at most
     every 2.5 minutes, never under the tutorial's coach (G.ftue < 99) */
  let factAt = 0;
  function idleFact(t) {
    if (!factAt) { factAt = t; return; }
    if (G.ftue < 99 || whole || momentBusy || opening || overlay || ui.busy || hero.busy || tNow() < camHold || t - factAt < 150000 * F || tNow() - hero.lastImpact < 25 * F) return;   // ── flow10 ── (camHold: never over the corner stone's delivery or a course's beat)
    factAt = t;
    const f = nextFact(''); if (!f) return;
    emit('fact', { id: f.id, at: 'idle' });
    ui.toast({ icon: 'book', title: 'פרט אמיתי', body: `${esc(f.he)}<small class="gm-fact-ref">${esc(f.ref)} · ${T.draft}</small>`, kind: 'fact', ms: 9000 });
  }
  /* Show what the simulation did: boulder cracks, stones the crews set, phases, finished sites. */
  function applyReport(rep, live) {
    let any = false;
    for (const i of rep.hits) { if (live && !whole) W.hitBoulder(i, G.bh[i]); any = true; }
    // (build7: the crews now set stones while a board holds the 3D loop: those are placed, not lifted — a lift needs frames)
    for (const id of Object.keys(rep.work)) { if (S.statusOf(G, id) === 'building') { if (live && rep.stones[id] && focusInView(id) && !held) stoneLift(id, false); else syncSite(id); } any = true; }
    for (const [id, n] of Object.entries(rep.stones)) emit('stoneSet', { id, n, set: G.st[id] && G.st[id].set, by: 'crew' });
    // ── director13 ── (N79) a course the crews closed: its moment, as his own stroke's (courseEnd)
    if (rep.courses) for (const [id, c] of Object.entries(rep.courses)) { if (!(c > 0)) continue; if (live && !whole) courseEnd(id, c, 'crew'); else emit('course', { id, c, by: 'crew', away: true }); }
    for (const ph of rep.phases) { if (live) phaseReached(ph.id, ph.p); else emit('phase', { id: ph.id, ph: ph.p }); }
    if (rep.stone >= 1) ui.flashRes(['stone']);
    if (rep.priests) ui.toast({ icon: 'priest', title: `${isoNum(rep.priests)} ${rep.priests > 1 ? 'כהנים סיימו' : 'כהן סיים'} את ההכשרה`, kind: 'mini' });
    for (const id of rep.ready) {
      syncSite(id, true);
      if (live && !ui.busy && !whole && !momentBusy) runMoment(id);
      else ui.toast({ icon: 'star', title: `${stageById(id).n}: ${T.momentReady}`, kind: 'mini' });
    }
    for (const c of rep.done) completeFlow(c, live);
    if (any || rep.ready.length || rep.done.length || rep.priests || rep.stone >= 1) { ui.refresh(); if (rep.done.length || rep.ready.length) persist(); }
    if (Object.keys(rep.work).length) hotspot();
  }
  const focusInView = (id) => id === S.focusOf(G) && !whole && !overlay;

  function onVisibility() {
    if (document.hidden) { persist(); HK.sessionEnd(); return; }
    const t = now();
    if (t - G.clock < S.WELCOME_MIN_S * 1000) return;
    const snap = S.snapshot(G);
    const rep = settleNow(t);
    const d = S.dailyCheck(G, t, isRestDay);
    persist();
    welcomeBack(snap, rep, d);
  }

  async function welcomeBack(snap, rep, daily, how = {}) {
    const lines = [];
    const set = Object.entries(rep.stones).filter(([, n]) => n > 0);
    if (set.length) lines.push(`הצוותים הניחו ${set.map(([id, n]) => `${isoNum(n)} אבנים ב${stageById(id).n}`).join(', ')}`);
    if (rep.hits.length) lines.push(`הצוות פינה סלעים מן ההר (${isoNum(rep.hits.length)} מכות)`);
    for (const c of rep.done) lines.push(`${T.stageDone}: ${stageById(c.id).n}`);
    for (const id of rep.ready) lines.push(`${stageById(id).n}: ${T.momentReady}`);
    if (rep.stone >= 1) lines.push(`צוות המחצבה חצב ${countTxt('stone', rep.stone)}`);
    const wait = Object.entries(rep.waiting).filter(([id]) => S.isWorkable(G, id));
    if (wait.length) lines.push(`${wait.map(([id]) => stageById(id).n).join(', ')}: הצוות מחכה לך (${wait.map(([, k]) => ({ pay: 'חומרים למקטע הבא', key: 'אבן מיוחדת בידיים שלך', inspect: 'הבדיקה' }[k] || 'לך')).join(', ')})`);   // ── flow9 ── (a hewn key stone is not "set" by him)
    if (rep.priests) lines.push(rep.priests > 1 ? `${isoNum(rep.priests)} כהנים סיימו את ההכשרה` : 'כהן אחד סיים את ההכשרה');
    if (rep.rest) lines.push('בשבת ובחג האתר נח. שום דבר לא הלך לאיבוד');
    if (rep.capped) lines.push('הצוותים עבדו 12 שעות, ועכשיו הם נחים ומחכים לך');
    const a = S.nextAction(G), next = nextLabel(a);
    if (next) lines.push(`<b>${esc(next)}</b>`);
    syncCrews(true);                                // ── crews ── the crews and the trainees as they are now
    ui.refresh();                                   // the HUD shows the state after the absence at once
    const show = rep.ms >= S.WELCOME_MIN_S * 1000 && (lines.length || daily);
    // ── flow11 ── (N34: "every reopen started on an empty frame") no tour of the crews' work (timelapse): the world as it is now,
    // and he lands on his kohen at his work — the load has done both already (start); a tab that comes back does them here
    if (!how.synced) { syncWorld(null); if (!hero.busy && !momentBusy && !overlay) how.landed = landWork(); }
    if (!how.landed) { const f = S.focusOf(G); if (f) W.focus(f, 1300); }
    emit('welcome', { lines: lines.length, ms: rep.ms });
    kingsTick(now());
    // ── flow8 ── a true fact on every visit (the rotation: the stage in focus first, never one already seen)
    const wf = show ? nextFact('') : null;
    const factHTML = wf ? `<div class="gm-note" style="margin-top:12px"><b>פרט אמיתי</b> · ${esc(wf.he)}<small class="gm-fact-ref" style="display:block;margin-top:4px">${esc(wf.ref)} · ${T.draft}</small></div>` : '';
    if (show) await ui.welcomeCard(lines, (daily ? wageHTML(daily) : '') + factHTML);
    else if (daily) wageToast(daily);
    for (const c of rep.done) await cardsFor(c);
    ui.refresh();
  }
  /** one line for the next action (the welcome card, the pill's sub-line) */
  function nextLabel(a) {
    if (!a || !a.id) return '';
    const n = stageById(a.id) ? stageById(a.id).n : '';
    switch (a.kind) {
      case 'moment': return `${n}: ${T.momentReady}`;
      case 'key': return `${n}: אבן שמחכה לידיים שלך`;
      case 'inspect': return `${n}: הבדיקה`;
      case 'check': return `${n}: בדיקת הנדבכים`;
      case 'event': return `${n}: ${EVENTS[a.ev].n}`;
      case 'work': return `${n}: הקש על האתר כדי לעבוד`;
      case 'build': return `${n}: יש לך הכול למקטע הבא`;
      case 'play': return `${n}: ${FIELD_N[a.field]} · ${resLine(a.need)} למקטע הבא`;
      case 'start': return `${n}: התחל לבנות`;
      default: return '';
    }
  }
  const wageHTML = (d) => `<div class="gm-note" style="margin-top:12px"><b>${T.wage}</b> · ${T.streak(d.streak)}<div class="gm-rew">${Object.entries(d.wage).map(([k, v]) => `<span>${isoNum(v, true)} ${RES[k].n}</span>`).join('')}</div><small class="gm-muted">${T.shabbatGrace}</small></div>`;
  function wageToast(d) { ui.toast({ icon: 'silver', title: `${T.wage} · ${T.streak(d.streak)}`, body: Object.entries(d.wage).map(([k, v]) => `${isoNum(v, true)} ${RES[k].n}`).join(' · '), ms: 5200 }); ui.flashRes(Object.keys(d.wage)); }

  /* ───────── the real clock: time of day, rain at night (Ta'anit 23a) ───────── */
  function syncTime() {
    const h = new Date(now()).getHours();
    // options.fixedTime: a time-of-day key the host pinned (tests, screenshots); the world is not changed then
    let k = typeof opt.fixedTime === 'string' ? opt.fixedTime : h >= 5 && h < 9 ? 'dawn' : h >= 9 && h < 16 ? 'noon' : h >= 16 && h < 19 ? 'dusk' : 'night';
    if (k === 'night' && (G.ftue < 99 || (H42 && H42.on) || (G.demo && typeof opt.fixedTime !== 'string'))) k = 'dusk';   /* ── fable32 (build 42) ── (the new stage 01's reveal and card stay in its dusk light; the real night after it) ── /fable32 ── */   // the first minutes, and the investor demo on the real clock, stay readable (dusk light, no rain); the real night comes after (a host-pinned time is kept)
    if (k === tod || whole || opening) return;   // (build7: the opening keeps its golden hour until its swap)
    tod = k;
    if (!opt.fixedTime) W.setTimeOfDay(k);
    const night = k === 'night' && !S.allDone(G);
    // ── world12 ── (the owner, 29.9: "ותמיד גשום בערב… לא כל לילה ירד גשם") it rains on SOME nights, by the real Hebrew date: none
    // from Pesach to after Shemini Atzeret, about a third of winter's nights; each night decided by its date (src/weather.js), the
    // same for every player and every reload. A dry night: the moon at its phase and the stars (main.js world12), a quiet bed
    const nt = night ? nightOf(now()) : null, wet = !!(nt && nt.rain);
    W.rain(wet);
    sfx.ambience(S.allDone(G) ? 'crowd' : wet ? 'rain' : night ? 'night' : null);
    if (wet && !G.story.rain) storyWait = 'rain';   // told once, on the first rainy night, at the next calm moment
    // ── /world12 ──
    emit('timeOfDay', k);
  }
  /* A story that is not urgent waits until nothing is open and the player has not struck for a few seconds. */
  let storyWait = null;
  function calmStory() {
    if (!storyWait || G.ftue < 99 || whole || momentBusy || ui.busy || tNow() - hero.lastImpact < 6 * F) return;
    const k = storyWait; storyWait = null;
    if (k === 'rain' && !G.story.rain) { G.story.rain = 1; persist(); ui.storyCard(STORY.rain, 'פרט אמיתי'); }
    if (k && k.plan) { const d = stageById(k.plan), P = PROJ[k.plan]; ui.storyCard({ t: `התוכנית · ${d.n}`, q: d.card.q, ref: d.card.ref, d: `${d.card.d} בתוכנית: ${P.C} נדבכים, ${P.C * P.P} אבנים${P.fin.length ? `, ואחריהם ${P.fin.map((f) => f.n).join(', ')}` : ''}.` }, 'המידות הן התוכנית'); }
  }

  /* ───────── taps from the world ───────── */
  const hero = { busy: false, pending: null, cur: null, gen: 0, at: null, beat: 0, lastImpact: 0, anchor: { x: 0, y: 0, z: 0 }, anchorT: null, ringOn: false };
  const tNow = () => performance.now() / 1000;
  function onSiteTap(id) {
    if (!started || whole || momentBusy || opening || !stageById(id)) return false;   // (build7: not under the opening)
    const st = S.statusOf(G, id);
    if (st === 'building') {
      if (G.st[id].ready) { runMoment(id); return true; }
      if (ui.sheet && ui.sheet !== 'stage') ui.closeSheet();
      G.focus = id; lastWorkId = id;   // (── flow11 ── curWork)
      const j = S.jobOf(G, id);
      if ((j.kind === 'key' || j.kind === 'pay') && loopTurn(S.nextAction(G))) { loopGo(id, j.kind === 'key'); return true; }   // ── fun14 ── (a free tap cannot strike a key stone: its card, or the deal) ── /fun14 ──
      if (j.kind === 'key') { keyStone(id); return true; }
      if (j.kind === 'inspect') { runInspect(id); return true; }
      if (j.kind === 'pay') { noStock(id); return true; }
      return workAt(id);
    }
    // ── flow11 ── (PRODUCER11 N45: a tap beside his work — on the next stage's wall — opened ITS sheet, and its big "התחל לבנות" started
    // a second site one tap away; the camera flew off to it) while he works at a site, a tap on another stage that waits says so in
    // a toast and keeps the frame; its sheet stays one deliberate tap away in "הפרויקט"
    const cur = workSite();
    if (cur && cur !== id && st === 'avail') {
      ui.toast({ icon: 'crew', title: `${stageById(id).n}: נבנה אחר כך`, body: `עכשיו בונים את ${stageById(cur).n}. הקש על הכהן`, kind: 'mini', ms: 2600 });
      emit('otherSite', { id, cur });
      return true;
    }
    ui.openSheet('stage', id);
    if (!cur) W.focus(id);   // (a locked or finished stage's sheet over his work: the camera stays on him)
    return true;
  }
  function onBoulderTap(index) {
    const bi = Number(index);
    if (!started || whole || momentBusy || opening || !(bi >= 0 && bi < BOULDERS)) return false;
    const st = S.statusOf(G, 'har');
    if (st === 'done') return false;
    if (st !== 'building') { ui.openSheet('stage', 'har'); return true; }
    const j = S.jobOf(G, 'har');
    if (!j || j.kind !== 'boulders') return onSiteTap('har');
    if (G.bh[bi] - (pendingHits()[bi] || 0) <= 0) return false;
    return tap({ boulder: bi });
  }
  /* (v6: the quarry's stone comes from its level and its crew; a tap there opens the quarry's level) */
  function onQuarryTap() {
    if (!started || whole || opening || !S.isDone(G, 'har')) return false;
    const a = S.nextAction(G);
    playLevel(a.kind === 'play' && a.field === 'quarry' ? a : { kind: 'play', id: S.focusOf(G), field: 'quarry', need: {} });
    return true;
  }
  /** ── flow9 ── (DESIGN8B §4 "bring the work to the hero"; BRIEF9 FLOW9-2) SITE9's boulder field: `W.boulderSpots()` → 12 spots
      in G.bh's index order ([x, z, r] or {x, z}; an optional `.order` of indices = the strike path). The game's BOULDER_XZ
      follows it; the pointer walks the path: SITE9's order, else the nearest-neighbour path from the first rock (on DESIGN8B's
      zigzag that is ORDER = [4, 5, …, 11, 0, 1, 2, 3]). Without the call (an older world), v17: nearest to the builder first. */
  function readBoulderSpots() {
    let sp = null; try { sp = W.boulderSpots(); } catch (e) { sp = null; }
    if (!Array.isArray(sp) || sp.length !== BOULDERS) return false;
    const xz = sp.map((b) => (Array.isArray(b) ? [+b[0], +b[1]] : b && typeof b === 'object' ? [+b.x, +b.z] : null));
    if (!xz.every((p) => p && Number.isFinite(p[0]) && Number.isFinite(p[1]))) return false;
    xz.forEach((p, i) => { BOULDER_XZ[i][0] = p[0]; BOULDER_XZ[i][1] = p[1]; });
    const o = Array.isArray(sp.order) ? sp.order.map(Number) : null;
    if (o && o.length === BOULDERS && new Set(o).size === BOULDERS && o.every((i) => i >= 0 && i < BOULDERS)) bOrder = o;
    else {   // the nearest-neighbour path from the first rock
      const left = new Set(xz.map((_, i) => i)); let at = FIRST_BOULDER; bOrder = [];
      while (left.size) {
        bOrder.push(at); left.delete(at);
        let best = -1, bd = Infinity;
        for (const i of left) { const d = Math.hypot(xz[i][0] - xz[at][0], xz[i][1] - xz[at][1]); if (d < bd) { bd = d; best = i; } }
        if (best < 0) break; at = best;
      }
    }
    FIRST_BOULDER = bOrder[0];
    emit('boulderField', { order: bOrder.slice() });
    return true;
  }
  /** the next boulder: a cracked one first, then the field's path (bOrder), else the one nearest the builder */
  function nextBoulder() {
    if (!bOrder && W.has('boulderSpots')) readBoulderSpots();
    if (!bOrder) return nearestBoulder();
    const pend = pendingHits(); let best = -1, bh = Infinity;
    for (const i of bOrder) { const hp = G.bh[i] - (pend[i] || 0); if (hp > 0 && hp < bh) { bh = hp; best = i; } }
    return best;
  }
  /** the standing boulder closest to the builder (a cracked one if it is just as close) */
  function nearestBoulder() {
    const p = W.heroPos(), pend = pendingHits();
    let best = -1, bd = Infinity;
    for (let i = 0; i < BOULDERS; i++) {
      if (G.bh[i] - (pend[i] || 0) <= 0) continue;
      const [x, z] = BOULDER_XZ[i];
      const d = p ? Math.hypot(p.x - x, p.z - z) - (G.bh[i] === 1 ? 20 : 0) : i;
      if (d < bd) { bd = d; best = i; }
    }
    return best;
  }
  /* ── flow8 ── (BRIEF8B · DESIGN8B R2/R3) THE target of the Mount's work, marked in the world by a pointer and a ring until the
     step is done: the survey → the builder; the rough hill → the boulder the next tap strikes; the first stones → the banker.
     Key stones, payments and boards live on the pill (the coach's hand points there). → 'hero' | 'har' | {boulder} | null */
  function markTarget() {
    if (!started || opening || whole || momentBusy || overlay) return null;
    // ── flow11 ── every later stage too: the ring under his banker while a stone (an event, a reset) waits for him there
    if (S.isDone(G, 'har')) {
      const id = curWork(), s = id && G.st[id], j = s && !s.ready && S.jobOf(G, id);
      if (!j) return null;
      if (s.p === 'courses' && (j.kind === 'stone' || j.kind === 'event' || j.kind === 'reset')) return bankerT(id) || null;
      // (the survey, the dig, a finish: the ring on him once he stands at his work — "הקש על הכהן" and a tap on him works it)
      if (j.kind === 'survey' || j.kind === 'dig' || j.kind === 'finish' || j.kind === 'reset' || j.kind === 'event') { const sp = workSpotAt(id), hp = W.heroPos(); return sp && hp && Math.hypot(hp.x - sp.x, hp.z - sp.z) <= 4 ? 'hero' : null; }
      return null;
    }
    if (S.statusOf(G, 'har') !== 'building' || !G.st.har || G.st.har.ready) return null;
    const j = S.jobOf(G, 'har'); if (!j) return null;
    if (j.kind === 'boulders') {
      const c = hero.cur && hero.cur.boulder != null && G.bh[hero.cur.boulder] - (pendingHits()[hero.cur.boulder] || 0) > 0 ? hero.cur.boulder : nextBoulder();
      return c >= 0 ? BOULDER_T[c] : null;
    }
    // ── flow10 ── (PRODUCER10 N10: "after the first-time flow nothing says what to tap … a child reads 'wait'") in the Mount's
    // courses the ring stays under his banker while a stone waits for him
    // (── flow11 ── bankerT: null = a world without SITE's workSpot → the site; false = he is not at his banker yet → no ring, N15)
    const bk = () => { const b = bankerT(); return b === null ? 'har' : b || null; };
    if (G.ftue >= 99) return (j.kind === 'stone' || j.kind === 'event' || j.kind === 'reset') && G.st.har.p === 'courses' ? bk() : null;
    if (j.kind === 'survey' || j.kind === 'dig') return 'hero';
    if (j.kind === 'stone' && G.ftue >= 5) return bk();
    return null;
  }
  /** ── flow9 ── (the courses shot: the pointer sat on the site's hotspot, bare ground away from the builder) the pointer goes ON
      the block on the builder's banker — SITE's workSpot('har', 'dress').stone (else the face point he dresses at). One shared
      object, moved in place: the mark follows the banker when the world moves it. The `mark` event still says at: 'har'. */
  const BANKER_T = { x: 0, y: 0, z: 0 };
  let bankerId = 'har';
  function bankerT(id = 'har') {
    const w = W.workSpot(id, 'dress');
    if (!w || typeof w.x !== 'number') return null;
    // ── flow11 ── (PRODUCER10 N15: after the corner stone "the pointer's ring sits on an empty floor, the kohen out of frame") the
    // ring waits for him: it marks his banker once he stands at it (a walk there, a lift's frame elsewhere: no ring on a bare floor)
    const hp = W.heroPos(), arrived = hero.atXZ && Math.hypot(hero.atXZ[0] - w.x, hero.atXZ[1] - w.z) < 1.5;   // (or the world said he arrived there)
    if (!arrived && hp && Number.isFinite(hp.x) && Math.hypot(hp.x - w.x, hp.z - w.z) > 4) return false;
    bankerId = id;
    const b = w.stone && typeof w.stone.x === 'number' ? w.stone : null;
    const fx = b ? b.x : Array.isArray(w.face) ? w.face[0] : w.x, fz = b ? b.z : Array.isArray(w.face) ? w.face[1] : w.z;
    BANKER_T.x = fx; BANKER_T.z = fz; BANKER_T.y = b && typeof b.y === 'number' ? b.y + (b.h || 0.9) * 0.5 : W.groundAt(fx, fz) + 1.6;
    return BANKER_T;
  }
  const markAt = { x: 0, y: 0, on: false };
  let markT = null;
  const markPos = () => {
    if (!markT) return null;
    const p = W.screenPos(markT, markAt);
    if (p && typeof p.x === 'number') { if (p !== markAt) { markAt.x = p.x; markAt.y = p.y; markAt.on = p.on !== false; } return markAt; }
    if (markT.boulder != null) return boulderScreen(markT.boulder);
    if (markT === 'hero' || markT === 'har' || markT === BANKER_T) return ringPos();
    return null;
  };
  function markSync() {
    if (whole) return;
    const t = markTarget();
    if (t === markT) return;
    markT = t;
    ui.mark(t ? markPos : null, t && t.boulder != null ? 44 : 38, t === 'hero');   // ── flow10 ── (N7: one ring on the builder)
    if (t) emit('mark', t.boulder != null ? { boulder: t.boulder } : t === BANKER_T ? { at: bankerId, banker: true } : { at: t });
    // the next boulder is shown before the player has to look for it (R2: never an off-screen target)
    if (t && t.boulder != null && !hero.busy) followTarget({ boulder: t.boulder });
  }
  /** a tap on the world that hit nothing (main.js pickAt): during the Mount's work it strikes the marked target (R3: no
      "misses" from tapping beside a rock); during a rhythm run it strikes the current job again */
  let quietUntil = 0;   // ── flow11 ── (N67) a moment or a stage just ended: its cards are coming
  function onMissTap() {
    if (!started || whole || opening) return false;
    // ── flow11 ── (PRODUCER11 N67, P1: after the Kodesh's moment a tap in the 1.3-s gap before its card opened "חומת העזרה ושעריה"'s
    // place card over the card's gold button) a tap under a card, a sheet, a moment, a game — or while a finished site's cards are
    // coming — is the game's, never a place card; a tap on the world with a sheet open closes it
    if (momentBusy || overlay || ui.busy || tNow() < quietUntil) { if (ui.sheet && !momentBusy && !overlay) ui.closeSheet(); return true; }
    const t = markTarget();
    if (t && t.boulder != null) return onBoulderTap(t.boulder);
    if (t === BANKER_T) return onSiteTap(bankerId);
    if (t === 'hero' || t === 'har') return onSiteTap(S.isDone(G, 'har') ? workSite() || 'har' : 'har');
    if (hero.ringOn && hero.cur && jobValid({ ...hero.cur, gen: hero.gen })) return tap({ ...hero.cur });
    // ── flow11 ── (PRODUCER11 N48: a tap that missed the kohen opened the place's info card over the work; DESIGN8B R3 "a tap anywhere
    // strikes the target") at every later stage a tap on the world works his site's tap job (a stroke: he walks there first)
    // (PRODUCER11 N48 re-seen: the survey's third tap arrived as it ended — the job was now the dig's payment — and fell through to
    //  the place card) while he works at a site, a tap on the world is never a place card: those are the book's and the map's
    const id = curWork();
    if (id) {
      const j = !G.st[id].ready ? S.jobOf(G, id) : null;
      if (j && ['stone', 'survey', 'dig', 'finish', 'reset', 'event'].includes(j.kind)) return workAt(id);
      return true;
    }
    return false;
  }
  /** keep the work in view: fly the camera when the next target is off screen */
  function followTarget(job) {
    if (!view || !view.project) return;
    let x, y, z, spot = null;
    // ── flow8 ── the Mount's survey and dig are framed at the builder's own spot (DESIGN8B CAM.SURVEY), never the whole Mount
    if (job.id === 'har' && G.st.har && (G.st.har.p === 'survey' || G.st.har.p === 'dig')) {
      const sp = spotOf(job);
      if (sp && sp.boulder != null) job = { boulder: sp.boulder };
      else if (sp && typeof sp.x === 'number') spot = sp;
    }
    if (job.boulder != null) { x = BOULDER_XZ[job.boulder][0]; z = BOULDER_XZ[job.boulder][1]; y = W.groundAt(x, z) + 4; }
    else if (spot) { x = spot.x; z = spot.z; y = W.groundAt(x, z) + 2; }
    else { const c = W.siteTop(job.id); if (!c) return; x = c.x; y = c.y; z = c.z; }
    const p = view.project(x, y, z);
    const m = 60;
    // ── flow8 ── (the owner: "זום אאוט מאוד גדול") the camera stays at working distance: farther than ~150 amot re-aims too
    const far = (!job.id || spot) && typeof view.dist === 'function' && view.dist(x, y, z) > 150;
    if (!far && p.on && p.x > m && p.x < innerWidth - m && p.y > 130 && p.y < innerHeight - 150) return;
    if (job.boulder != null) boulderCam(job.boulder, 1300);
    else if (spot && view.lookAt) { const hp = W.heroPos(); const az = hp && Math.hypot(hp.x - x, hp.z - z) > 3 ? (Math.atan2(hp.z - z, hp.x - x) * 180) / Math.PI + 25 : 25; view.lookAt(x, y, z, 36, az, 28, 1300); }
    else W.focus(job.id, 1300);
  }
  /** ── flow8 ── (QA8B N4a: focus('har') framed the whole Mount from ~2 km) while the Mount is being built, the game's own calls to
      focus it frame the work instead: the builder's rock in the survey and the dig, the banker and the next slot in the
      courses (DESIGN8B CAM.WALL: ~64 amot on a phone, 22° up, from outside the face). A world with SITE8B's close focus
      (boulderView marks it) keeps its own. */
  const wFocus = W.focus;
  W.focus = (id, dur) => {
    if (id === 'har' && started && !whole && !W.has('boulderView') && S.statusOf(G, 'har') === 'building' && G.st.har && !G.st.har.ready && view && view.lookAt) return siteCam(dur);
    // ── director13 ── (C1 at the Mount, PRODUCER13 m1: after a demo pick its survey and rocks were framed from far — him 43–54 px) the
    // Mount's survey and rocks after the tutorial: his own frame (the survey where he stands, a rock from his side)
    if (id === 'har' && started && !whole && !opening && !reelOn() && G.ftue >= 99 && G.st.har && !G.st.har.done && (G.st.har.p === 'survey' || G.st.har.p === 'dig') && view && view.lookAt) { if (G.st.har.p === 'survey') workCam(dur || 1300); else siteCam(dur || 1300); return undefined; }
    // ── flow11 ── (K80; PRODUCER11 N44: at the gates' dig the pill's sheet flew the camera to the six gatehouses' whole footprint,
    // ~1,000 amot, and every stroke after it was played on a 4-px kohen) the game's own focus on the site he works at is always
    // his work frame (the world's working frame fitted to him, else close on him) — never the whole site
    if (started && !whole && !opening && !reelOn() && G.st[id] && !G.st[id].done && id === curWork()) { workFrame(id, dur || 1900); return undefined; }   // (the investor reel keeps its curated shots)
    return wFocus(id, dur);
  };
  function siteCam(dur = 1300) {
    const s = G.st.har;
    if (!s || s.p === 'survey' || s.p === 'dig') { const i = nextBoulder(); boulderCam(i >= 0 ? i : FIRST_BOULDER, dur); return; }
    const b = W.workSpot('har', 'dress'), sl = W.nextSlot('har'), c = W.siteTop('har');
    if (!b || typeof b.x !== 'number') return wFocus('har', dur);
    let x = b.x, z = b.z; const slot = sl && typeof sl.x === 'number' && typeof sl.z === 'number';
    if (slot) { x = (b.x + sl.x) / 2; z = (b.z + sl.z) / 2; }
    const az = slot && Array.isArray(sl.n) ? (Math.atan2(sl.n[1], sl.n[0]) * 180) / Math.PI + 35 : c ? (Math.atan2(z - c.z, x - c.x) * 180) / Math.PI + 35 : 25;
    view.lookAt(x, W.groundAt(x, z) + 3, z, 47, az, 22, dur);
  }
  /** ── flow8 ── a boulder in frame, close: SITE8B's boulderView(i) (a clear line of sight, the hero and the crew in frame) when
      the world has it, else DESIGN8B's CAM.STRIKE — 72 amot on a phone, 24° up, from over the hero's shoulder */
  function boulderCam(i, dur) {
    if (!view || !view.lookAt) { W.focus('har', dur); return; }
    const [x, z] = BOULDER_XZ[i];
    const v = W.has('boulderView') ? W.boulderView(i) : null;
    // ── director13 ── (K80 at the rocks, PRODUCER13 b1: "43–54 px from the steep top view") the rock's frame fitted to him where he
    // strikes it (boulderView's hero spot): pulled in along its own clear ray until he is ≥ 84 px, the rock's top (the pointer) kept in
    // (after the tutorial — a demo pick: game-touch's first-time flow keeps its rock frames, its pointer never pushed to the top bar;
    //  the pointer's tip, ~8 amot over the rock's middle, stays in)
    if (G.ftue >= 99 && v && Array.isArray(v.p) && Array.isArray(v.t) && Array.isArray(v.hero) && v.hero.every(Number.isFinite) && W.has('flyTo')) {
      const f = fitHero(v.p, v.t, { x: v.hero[0], y: v.hero[1], z: v.hero[2] }, [{ x: v.t[0], y: v.t[1] + 8, z: v.t[2] }]);
      W.flyTo(f.p, f.t, dur); emit('rockFrame', { i, px: f.px, pulled: f.k < 1 });
      return;
    }
    // ── /director13 ──
    if (v && Array.isArray(v.p) && Array.isArray(v.t)) {
      const dx = v.p[0] - v.t[0], dy = v.p[1] - v.t[1], dz = v.p[2] - v.t[2], h = Math.hypot(dx, dz), d = Math.hypot(h, dy);
      const port = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8 ? 1.35 : 1;   // (view.lookAt adds it back)
      if (d > 1) { view.lookAt(v.t[0], v.t[1], v.t[2], d / port, (Math.atan2(dz, dx) * 180) / Math.PI, (Math.atan2(dy, h) * 180) / Math.PI, dur); return; }
    }
    const hp = W.heroPos();
    const az = hp && Number.isFinite(hp.x) && Math.hypot(hp.x - x, hp.z - z) > 3 ? (Math.atan2(hp.z - z, hp.x - x) * 180) / Math.PI + 28 : 25;
    view.lookAt(x, W.groundAt(x, z) + 3, z, 53, az, 24, dur);
  }
  /** what the ring, the floats and the strike juice anchor on (screenPos / strikeFX targets; shared objects) */
  const targetOf = (job) => (job.boulder != null ? BOULDER_T[job.boulder] : job.id);
  function stopRing() { ui.ring.stop(); hero.ringOn = false; W.setComboLevel(0); }
  const jobKey = (j) => (j.boulder != null ? 'b' + j.boulder : j.id + ':' + spotKind(j));
  function pendingHits() { const p = {}; if (hero.pending && hero.pending.job.boulder != null) p[hero.pending.job.boulder] = 1; if (hero.cur && hero.cur.boulder != null) p[hero.cur.boulder] = (p[hero.cur.boulder] || 0) + 1; return p; }
  /** One tap = one stroke. While the hero strikes, one tap is buffered (the latest wins): a fast tap is never lost. */
  function tap(job) {
    job.gen = hero.gen;
    const t = tNow();
    HK.tapMeter.tap();
    if (hero.busy) { hero.pending = { job, t }; return true; }
    runJob(job, t);
    return true;
  }
  function jobValid(job) {
    if (job.gen !== hero.gen || whole) return false;
    if (job.boulder != null) { const j = S.jobOf(G, 'har'); return !!j && j.kind === 'boulders' && G.bh[job.boulder] > 0; }
    const j = S.isWorkable(G, job.id) ? S.jobOf(G, job.id) : null;
    return !!j && !!j.need;
  }
  /* the hero's place for a job (SITE's workSpot): at the banker for a stone, at the pegs for the survey, at the wall else */
  function spotKind(job) {
    const j = job.id ? S.jobOf(G, job.id) : null;
    // ── flow10 ── (the owner, 28.9: "נדבך 5 השחקן נעלם") the Mount's courses: a site event and a stone's reset (after the course
    // check) are worked from his banker in the bay too — the wall's 'set' spot lies outside the face, on the outer bank 15 amot
    // above the bay, out of every frame of the courses
    if (job.id === 'har' && j && (j.kind === 'reset' || j.kind === 'event') && G.st.har && G.st.har.p === 'courses') return 'dress';
    return !j ? 'set' : j.kind === 'survey' ? 'survey' : j.kind === 'stone' ? 'dress' : 'set';
  }
  function spotOf(job) {
    if (job.boulder != null) return targetOf(job);
    const w = houseSpot(job.id, W.workSpot(job.id, spotKind(job)));   // ── director13 ── (houseSpot)
    if (w && typeof w.x === 'number') return { x: w.x, z: w.z, faceX: w.face ? w.face[0] : w.x, faceZ: w.face ? w.face[1] : w.z };
    // (no SITE workSpot) the Mount's survey and dig happen among the boulders, where the builder already stands
    if (job.id === 'har' && G.st.har && (G.st.har.p === 'survey' || G.st.har.p === 'dig')) return targetOf({ boulder: FIRST_BOULDER });
    return job.id;
  }
  const xzOf = (sp) => (sp && typeof sp.x === 'number' && typeof sp.z === 'number' ? [sp.x, sp.z] : null);
  /** ── flow10 ── his banker in the Mount's working bay as a spot (the key stones' wait: the 'set' spot lies outside the face) */
  function bankerSpot() { const w = W.workSpot('har', 'dress'); return w && typeof w.x === 'number' ? { x: w.x, y: w.y, z: w.z, faceX: w.face ? w.face[0] : w.x, faceZ: w.face ? w.face[1] : w.z } : null; }
  /** the spot of the job he stands at has moved away from where he arrived (the banker went on with the bay) */
  function movedSpot(sp) { const a = hero.atXZ, b = xzOf(sp); return !!(a && b && Math.hypot(a[0] - b[0], a[1] - b[1]) > 3); }
  /** ── the owner, 28.9 21:42–21:57 ── ("in course 1 and 5 the builder vanishes", "in course 2 he is far from the site, stuck")
      the camera frames the working bay, but the builder stayed where his last job ended (the great stone's place, the bay
      before it moved on, the course check): while he is idle in the Mount's courses he goes back to his work by himself —
      checked twice a second, a walk only when he is away from it */
  // ── flow10 ── (PRODUCER10 N1, N11: "the kohen is not there when course 1 starts", "on reopening the page the kohen is not in the
  // first frames") he also walks behind a card (the great stone's story, the name, the greeting: ~40 s he stood at his last rock),
  // and a player who comes back (a load, a resync) finds him AT his banker: placed there once, not a 150-amah walk from the rocks
  /* ── flow11 ── (the owner, 29.9 09:13: "זה שהכהן עכשיו זז מנקודה לנקודה זה מאוד יפה. שימשיכו ככה"; PRODUCER-S10 N34) the
     builder's work at EVERY stage — one answer for the load (landWork), keepAtWork (he walks back to it) and keepInFrame (the
     camera goes back to him): the site he works at, his spot for the job waiting there, and the frame that holds him. The Mount's
     courses keep FLOW10's rules (his banker in the bay for the stones, the key stones, the check and the next segment). */
  const WAITS = ['key', 'check', 'pay'];
  /** the site he works at: the Mount's courses while the Mount is built (its survey and rocks are the first-time flow's boulder
      path), then the building site in focus (the player's last tap, else the one that most needs him) */
  function workSite() {
    // (── flow11 ── PRODUCER11 N39: a reopen at the Mount's finish, "ריצוף הרחבה", found him 355 amot off the frame — its finish too)
    // (── flow11 ── N39 more: a reopen at the Mount's key moment landed 553 amot over the plaza — its inspection and moment too)
    if (!S.isDone(G, 'har')) { const s = G.st.har; return s && !s.done && (s.ready || s.p === 'courses' || s.p === 'finish' || s.p === 'inspect') ? 'har' : null; }
    const f = S.focusOf(G); return f && G.st[f] && !G.st[f].done ? f : null;
  }
  /** the site he is working at now: the work site, unless the player's last work was another site (a site just finished, the
      focus moved on by itself: he stays for its cards and its orbit; the next site is his once the player taps it) */
  let lastWorkId = null;
  const curWork = () => { const id = workSite(); return id && (!lastWorkId || lastWorkId === id) ? id : null; };
  const asSpot = (w) => (w && typeof w.x === 'number' ? { x: w.x, y: w.y, z: w.z, faceX: w.face ? w.face[0] : w.x, faceZ: w.face ? w.face[1] : w.z } : null);
  /** his spot for the job waiting at site `id` | null (nothing to stand at: a key moment, the inspection). A stone at his banker
      (SITE's workSpot 'dress': the Mount's in the bay, the wall's at the course's next slot); a key stone, the course check or the
      next segment → he waits at that banker; the survey at its pegs; the dig, an event, a reset, a finish where runJob works it */
  function workSpotAt(id) {
    const s = G.st[id]; if (!s || s.done) return null;
    // (the work done, the inspection or the key moment waiting: in front of the finished work — SITE's 'set' spot; the Mount's is
    //  its paving's front)
    // (── flow11 ── N66: a reopen at the Kodesh's waiting moment framed him behind a wall from the 'set' spot — the moment's own spot,
    //  in front of the site on the camera's side, when the world declares one)
    if (s.ready) { const m = W.workSpot(id, 'moment'); if (m && m.kind === 'moment' && typeof m.x === 'number') return asSpot(m); }
    if (s.ready || s.p === 'inspect') return asSpot(W.workSpot(id, 'set'));
    const j = S.jobOf(G, id); if (!j) return null;
    if (id === 'har') {
      // (── flow10 ── a key stone too — the great stone, the corner stones: he waits at his banker while the crane or the quarry
      //  game sets it, not at his last rock 150 amot off the frame; N1 — and while the course check or the next segment waits:
      //  PRODUCER10's c5 run, a player back at the check found him out of the frame)
      if (s.p === 'finish') return asSpot(W.workSpot('har', 'set'));   // (── flow11 ── N39: where he paves)
      if (s.p !== 'courses' || !['stone', 'reset', 'event', ...WAITS].includes(j.kind)) return null;
      return WAITS.includes(j.kind) ? bankerSpot() : spotOf({ id });
    }
    if (j.kind === 'moment' || j.kind === 'inspect') return asSpot(W.workSpot(id, 'set'));
    if (WAITS.includes(j.kind) && s.p === 'courses') return asSpot(houseSpot(id, W.workSpot(id, 'dress')));   // ── director13 ── (houseSpot)
    const sp = spotOf({ id }); return sp && typeof sp.x === 'number' ? sp : null;
  }
  /** ── director13 ── (PRODUCER13's K80 gate on peekG: at the Heichal's and the Kodesh's courses he stood HIDDEN inside the Ulam / the
      Heichal — the next slot on the face that abuts the finished building, his banker 4 amot out from it, inside that building) a
      House's work spot under a roof (the line from high above down to him is blocked) is traded for the site's dressing yard */
  function houseSpot(id, w) {
    if (!w || typeof w.x !== 'number' || !HOUSE.has(id) || !W.has('frameBlocked') || !G.st[id] || G.st[id].p !== 'courses') return w;
    const roofed = (q) => { const y = typeof q.y === 'number' ? q.y : W.groundAt(q.x, q.z); return W.frameBlocked(q.x, y + 140, q.z, q.x, y + 1.8, q.z, id); };
    if (!roofed(w)) return w;
    const yd = W.workSpot(id, 'yard');
    return yd && typeof yd.x === 'number' && !roofed(yd) ? yd : w;
  }
  /** the frame of his work at site `id`: the Mount's is FLOW10's workCam (the world's CAM.WALL over the bay); another site in its
      courses: SITE's own working frame (wallView: the builder at his banker and the next slot, at working distance); else close on
      his spot from outside the site */
  function workFrame(id, dur = 1300) {
    if (!id) return;
    const s = G.st[id];
    if (id === 'har' && s && s.p === 'courses') { workCam(dur); return; }
    // ── director13 ── (C8, PRODUCER-S13a r1-10/11, probe df3: at the altar the world's frames looked across its plastered tiers, him
    // hidden behind the sovev — "from the corner he works at, 30° up, the altar's face beside him, not between") the altar's work
    // is framed close on him from outside it, its centre behind him
    // (PRODUCER13 m4 on peekE: the altar's courses in the world's frame ✓ 100 px on the sovev by the red line — kept; its dig, survey
    //  and finish close on him. N89: the kiyor's first casting framed the crews' wheel, him below the frame's bottom — close on him)
    if (((ALTAR.has(id) && s && s.p !== 'courses') || id === 'kiyor') && s && !s.ready) { closeFrame(id, dur); return; }
    // (C9, PRODUCER-S13a u1-05…07, probe df3: at the House's upper courses the world's frame stood in the scaffold — a grey close-up
    //  of its poles, him hidden or 59–68 px) once the course is high above his banker the House's work is framed close on him from
    //  outside, the facade and its scaffold behind him; the course at its height is the course end's beat
    if (HOUSE.has(id) && s && !s.ready && (s.p === 'finish' || (s.p === 'courses' && (() => { const sl = W.nextSlot(id), hp = W.heroPos(); return !!(sl && hp && Number.isFinite(hp.y) && sl.y - hp.y > 12); })()))) { closeFrame(id, dur); return; }
    if (id !== 'har' && wallFrame(id, dur)) return;
    closeFrame(id, dur);
  }
  /** the world's own working frame of site `id` → {p, t} | null: the Mount's and the wall's courses CAM.WALL (wallView); every
      other site's survey, dig and courses SITE11's siteWorkView (CAM.SURVEY · CAM.TRENCH · CAM.WALL-A), else wallView's */
  function workView(id) {
    const s = G.st[id]; if (!s || s.done) return null;
    if ((id === 'har' || id === 'wall') && s.p === 'courses') return W.has('wallView') ? W.wallView(id) : null;
    if (id === 'har') return W.has('siteWorkView') ? W.siteWorkView(id) : null;
    const v = W.has('siteWorkView') ? W.siteWorkView(id) : null;
    return v || (s.p === 'courses' && W.has('wallView') ? W.wallView(id) : null);
  }
  /** ── flow11 ── close on him at his spot, from outside the site (its centre behind him): 50 amot, 26° up — ≥ 84 px (K80) — for
      the phases with no course to frame (the Mount's paving, a finish, a survey, a dig) */
  function closeFrame(id, dur) {
    const sp = workSpotAt(id), hp = W.heroPos();
    const at = restSpot(hp) || (sp && typeof sp.x === 'number' ? { x: sp.x, y: spotY(sp, hp), z: sp.z } : hp && Number.isFinite(hp.x) ? { x: hp.x, y: hp.y, z: hp.z } : null);   // ── director13 ── (restSpot, spotY)
    if (!at || !view) { W.focus(id, dur); return; }
    // (the Mount's paving from the plaza's side, west, turned 25° — SITE11's CAM.PAVE bearing, the east wall behind it — but at 48
    //  amot, 30° up: K80; elsewhere from outside the site, its centre behind him)
    const c = W.siteTop(id), a0 = id === 'har' ? 205 : (c && Math.hypot(at.x - c.x, at.z - c.z) > 3 ? (Math.atan2(at.z - c.z, at.x - c.x) * 180) / Math.PI : 0) + 30;
    const e0 = id === 'har' ? 30 : 26, d = id === 'har' ? 48 : 50, t = [at.x, at.y + 1.8, at.z];
    const pose = (az, el) => { const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180; return [at.x + Math.cos(e) * Math.cos(a) * d, at.y + 1.8 + Math.sin(e) * d, at.z + Math.cos(e) * Math.sin(a) * d]; };
    // (── flow11 ── PRODUCER11 N66: 5 amot behind a wall at the Kodesh — the first clear bearing when the world can test a line)
    let p = pose(a0, e0);
    // (── director13 ── more bearings, and the line to his head too: the altar's tiers and the House hide a chest a head can clear)
    if (W.has('frameBlocked')) for (const [da, de] of [[0, 0], [20, 0], [-20, 0], [40, 0], [-40, 0], [0, 12], [60, 4], [-60, 4], [80, 0], [-80, 0], [40, 12], [-40, 12], [120, 8], [-120, 8], [150, 8], [-150, 8], [180, 0], [0, 26], [0, 36]]) { const q = pose(a0 + da, e0 + de); if (!W.frameBlocked(q[0], q[1], q[2], t[0], t[1], t[2], id) && !W.frameBlocked(q[0], q[1], q[2], t[0], t[1] + 1.6, t[2], id)) { p = q; break; } }
    const f = fitHero(p, t, at);
    if (W.has('flyTo')) W.flyTo(f.p, f.t, dur); else if (view.lookAt) view.lookAt(at.x, at.y + 1.8, at.z, d / (innerWidth / innerHeight < 0.8 ? 1.35 : 1), a0, e0, dur);
    emit('workFrame', { id, px: f.px, close: true });
  }
  /** a player who looks around (a drag or a pinch on the world) is not fought: the camera's safety nets wait 6 s after it */
  let lookedT = -1e9;
  if (typeof addEventListener === 'function') {
    let dn = null;
    addEventListener('pointerdown', (e) => { dn = { x: e.clientX, y: e.clientY }; }, { passive: true });
    const world3d = (e) => !!(e.target && e.target.tagName === 'CANVAS' && !(e.target.closest && e.target.closest('.gm')));   // (not a game's own canvas)
    addEventListener('pointermove', (e) => { if (dn && e.buttons && Math.hypot(e.clientX - dn.x, e.clientY - dn.y) >= 7 && world3d(e)) lookedT = tNow(); }, { passive: true });
    addEventListener('pointerup', () => { dn = null; }, { passive: true });
    addEventListener('wheel', (e) => { if (world3d(e)) lookedT = tNow(); }, { passive: true });
  }
  const looking = () => tNow() - lookedT < 6;
  /** ── flow11 ── (N34, PRODUCER-S10 top 10 #1: "every reopen started on an empty frame" — at course 5 the plaza with no crane,
      banker or crew, the kohen walking in ≈ 6 s later) a player who comes back lands ON his kohen at his work, on the load's
      first frame: the site's count landed at once (no eased ripple that moves the next slot, the crane and the banker for
      seconds), the kohen placed at his spot, the camera CUT to his work frame (not the boot's flight from the olives). When the
      world poses the site after that (SITE11's posed/onPosed: its crane at the next slot, the Mount's bay dug) he and the frame
      follow at once. → the site landed at, or null */
  let landT = -1e9, landAt = null;
  function landWork() {
    const id = workSite();
    if (!id) {   // (between stages: on him at the site the goal points to, where syncWorld placed him; the finished House keeps its view)
      const r = S.recommend(G), hp = W.heroPos();
      if (!S.isDone(G, 'har') || S.allDone(G) || !r.id || !hp || !Number.isFinite(hp.x)) return null;
      closeFrame(r.id, 1); emit('loadLand', { id: r.id, hero: true });
      return r.id;
    }
    if (W.has('setWork') && W.has('wallView')) { syncSite(id, true, true); W.setStage(id, 'building', undefined, { instant: true }); }
    lastWorkId = id;
    const sp = workSpotAt(id), xz = xzOf(sp);
    if (!xz) { W.focus(id, 1); return id; }
    placeAtWork(id, sp);
    workFrame(id, 1);
    landT = tNow(); landAt = { id, x: xz[0], z: xz[1], y: W.heroPos() ? W.heroPos().y : 0 };
    emit('loadLand', { id, at: xz.map(Math.round) });
    if (W.has('onPosed')) W.onPosed(id, (ok) => { if (ok) relanded(id, 400); }, 6000);
    return id;
  }
  /** the landing's follow-up while the world poses the site (≤ 3 s after the load, or SITE11's onPosed): his spot moved (the
      crane's pose, the bay dug under him) → there at once, and the frame again (a cut on the posed signal, a short glide else) */
  function relanded(id, dur = 500) {
    if (!landAt || landAt.id !== id || hero.busy || hero.pending || momentBusy || overlay || whole || curWork() !== id) return false;
    const sp = workSpotAt(id), xz = xzOf(sp), hp = W.heroPos(); if (!xz || !hp) return false;
    const moved = Math.hypot(xz[0] - landAt.x, xz[1] - landAt.z) > 1 || Math.abs(hp.y - landAt.y) > 1.2;
    if (!moved && dur > 1) return false;
    if (Math.hypot(hp.x - xz[0], hp.z - xz[1]) > 1) placeAtWork(id, sp);
    landAt = { id, x: xz[0], z: xz[1], y: hp.y };
    if (!looking()) workFrame(id, dur);
    emit('loadLand', { id, at: xz.map(Math.round), again: true });
    return true;
  }
  function placeAtWork(id, sp) {
    const job = { id, gen: hero.gen }, j = S.jobOf(G, id), xz = xzOf(sp);
    W.heroPlace(sp); W.heroShow(true); hero.at = jobKey(job); hero.atXZ = xz; hero.atC = `${id}:${courseOf(id)}`;   // ── director13 ── (the course he arrived in: keepAtWork)
    W.heroTool(ALTAR.has(id) ? 'wood' : 'iron');   // (the altar's stones are never touched by iron: Middot 3:4)
    if (j && (j.kind === 'stone' || j.kind === 'key')) W.workpiece(workpieceOf(id), W.workSpot(id, 'dress') || undefined);   // (── flow10 ── the key stone's block waits on his banker too)
    captureAnchor(); hero.anchorT = targetOf(job);
  }
  let keepT = 0, placeNext = false;
  /** ── director13 ── where he rests (keepAtWork let him stay at an earlier banker of this course): the frames are fitted to him
      there, not to the banker the crews' last stone moved on | null */
  const restSpot = (hp) => (hero.rest && !hero.busy && hp && Number.isFinite(hp.x) ? { x: hp.x, y: hp.y, z: hp.z } : null);
  /** ── director13 ── (C2, PRODUCER-S13a d1-13/14: "the rock with the gold arrow fills the frame; the kohen off-frame through a whole
      idle window") the Mount's rocks after the tutorial (a demo pick): once a rock is split and the next one marked, he walks to it
      by himself — from point to point — and the rock's frame, built from his side, holds him there; one walk per rock, never while
      the player strikes (1.5 s after his last stroke). → true when he set off */
  function rockWalk() {
    if (!markT || markT.boulder == null || !(G.ftue >= 99) || reelOn()) return false;
    if (twinOn()) return false;   // ── nav19 ── (the walk audit: under two thumbs the next rock is his to walk to — the arrow, the compass) ── /nav19 ──
    const j = S.jobOf(G, 'har'); if (!j || j.kind !== 'boulders') return false;
    const i = markT.boulder; if (!(G.bh[i] > 0) || hero.rockTo === i || tNow() - (hero.lastImpact || 0) < 1.5) return false;
    const key = jobKey({ boulder: i }); hero.rockTo = i;
    if (hero.at === key) return false;
    const run = hero.run = (hero.run || 0) + 1, hp = W.heroPos();
    hero.busy = true; hero.cur = null;
    emit('heroReturn', { id: 'har', rock: i, from: hp && Number.isFinite(hp.x) ? [Math.round(hp.x), Math.round(hp.z)] : null });
    Promise.resolve(W.walkTo(BOULDER_T[i])).then((ok) => { if (hero.run !== run) return; hero.at = ok ? key : null; if (ok) { captureAnchor(); hero.anchorT = BOULDER_T[i]; } }, () => {}).finally(() => {
      if (hero.run !== run) return;
      hero.busy = false;
      const p = hero.pending; hero.pending = null;
      if (p && p.job.gen === hero.gen) runJob(p.job, p.t);
    });
    return true;
  }
  /** ── director13 ── (probe df3: at the Ulam's finish the fit said 81 px and he stood at 59 — its 'set' spot lies at the course's
      height on the scaffold, he on the ground under it) the height he stands at: his own when he is at the spot, else the ground */
  function spotY(sp, hp) {
    if (hp && Number.isFinite(hp.x) && Math.hypot(hp.x - sp.x, hp.z - sp.z) < 2.5) return hp.y;
    const g = W.groundAt(sp.x, sp.z);
    return typeof sp.y === 'number' && Number.isFinite(g) ? Math.min(sp.y, g + 2) : Number.isFinite(g) ? g : sp.y;
  }
  const HOUSE = new Set(['ulam', 'heichal', 'kodesh']);   // ── director13 ──
  /** ── director13 ── the course being laid at site `id` (0-based) while it is in its courses, else −1 */
  const courseOf = (id) => { const s = G.st[id]; return s && !s.done && s.p === 'courses' && PROJ[id] ? Math.floor(s.set / PROJ[id].P) : -1; };
  function keepAtWork(dt) {
    if ((keepT -= dt) > 0) return; keepT = 0.5;
    if (!started || whole || opening || momentBusy || overlay || hero.busy || hero.pending || tNow() < camHold) return;
    if (rockWalk()) return;   // ── director13 ── (C2)
    const id = curWork(); if (!id) { placeNext = false; return; }
    if (tNow() - landT < 3 && relanded(id)) return;   // (the load: the world still posing the site — the Mount's bay digs for 2.2 s)
    const job = { id, gen: hero.gen }, sp = workSpotAt(id), xz = xzOf(sp), hp = W.heroPos();
    if (!xz || !hp || !Number.isFinite(hp.x)) return;
    // (away: more than 3 amot from his spot, or 3.5 above or below it — the banker went on with the bay, or up onto the fill)
    const gy = typeof sp.y === 'number' ? sp.y : W.groundAt(xz[0], xz[1]);
    const far = Math.hypot(hp.x - xz[0], hp.z - xz[1]);
    // (── flow10 ── 3 amot, as movedSpot: by touch, after the corner stone's lift moved his banker 4 amot on, he stood at the old
    //  one at the frame's edge — the bay's frame is built on the new one)
    if (far < 3 && !(Number.isFinite(gy) && Math.abs(hp.y - gy) > 3.5)) { placeNext = false; return; }
    // (── flow11 ── the world said he arrived at this very spot: trust it — a world whose hero does not move (the harness's) would
    //  otherwise be walked there again every half second)
    if (hero.at === jobKey(job) && hero.atXZ && Math.hypot(hero.atXZ[0] - xz[0], hero.atXZ[1] - xz[1]) < 1 && !(Number.isFinite(gy) && Math.abs(hp.y - gy) > 3.5)) { placeNext = false; return; }
    if (placeNext) {
      const now = placeNext === 'now';
      placeNext = false;
      if (far > 30 || (now && far > 3)) {
        placeAtWork(id, sp);
        emit('heroPlace', { id, from: [Math.round(hp.x), Math.round(hp.z)], to: xz.map(Math.round) });
        if (!looking()) workFrame(id, 900);
        // (── flow11 ── a resync's placement, like a load's: the frame follows the world's pose for 3 s — by touch, after a resync
        //  into the Mount's courses the bay dug itself under him and he sank out of the frame's bottom)
        const hq = W.heroPos(); landT = tNow(); landAt = { id, x: xz[0], z: xz[1], y: hq ? hq.y : 0 };
        return;
      }
    }
    if (twinOn()) return;   // ── twin17 ── (a load still finds him at his work; after it the left thumb walks him — never walked back by himself) ── /twin17 ──
    // ── director13 ── (PRODUCER-S13a #4, the owner's "עמד וזז מצד לצד בלי סיבה נראית לעין") while he rests at a banker he walked to
    // in this course, the crews' stones move the next slot on (×60 in the demo: every ~3 s) — he stays where he is until the
    // player taps (runJob walks him to his work: "from point to point") or the course changes (then one walk), whatever the distance
    // the crews carried the slot (N83: at ×60, 60+ amot along the wall in 15 s). Not when he is above or below it (the Mount's bay
    // dug under him), nor outside the courses.
    // (while the player works — a stroke in the last 6 s — his own stone moved the slot: he goes on to the next one at once)
    // (PRODUCER13 N85: at the gates' corner stone the pill asked for his hands while he rested at the last banker, out of the frame:
    //  a key stone or the course check waits for HIM — he goes there, one walk, and the frame goes with him)
    { const c = courseOf(id), yOff = Number.isFinite(gy) && Math.abs(hp.y - gy) > 3.5, idle = tNow() - (hero.lastImpact || 0) > 6;
      const jw = S.jobOf(G, id), his = !!jw && (jw.kind === 'key' || jw.kind === 'check');
      if (idle && !his && c >= 0 && hero.at && hero.atXZ && hero.atC === `${id}:${c}` && far < 400 && !yOff) { if (!hero.rest) emit('heroRest', { id, c, far: Math.round(far) }); hero.rest = true; placeNext = false; return; } }
    hero.rest = false;
    // ── /director13 ──
    // (supervisor, 30.9 · PRODUCER13a) while the player rests, the crews move his banker's slot every few seconds (×60 in the demo):
    // he follows it at most once in 8 s when it is near, instead of stepping to and fro with every stone they set
    if (far < 12 && tNow() - (hero.lastImpact || 0) > 6 && tNow() - (hero.lastChase || 0) < 8) return;
    hero.lastChase = tNow();
    const run = hero.run = (hero.run || 0) + 1, key = jobKey(job);
    hero.busy = true; hero.cur = null; stopRing();
    emit('heroReturn', { id, from: [Math.round(hp.x), Math.round(hp.z)], to: xz.map(Math.round) });
    // ── director13 ── (PRODUCER13 N83, C6: "if he must walk, the frame goes with him") a long walk (a new course's slot at the far end,
    // his banker after a check) is a tracking shot: the camera travels with him, then his work frame when he arrives; a short one
    // flies to the work frame at once (he walks into it), as before
    const follow = far > 24 && !looking();
    if (follow) walkFollow = { run, id, az: followAz(id, hp, xz), t: 0 };
    else if (!looking()) workFrame(id, 1500);   // (the frame goes with him to his banker: the walls' frame is built on it)
    Promise.resolve(W.walkTo(sp)).then((ok) => {
      if (hero.run !== run) return;
      hero.at = ok ? key : null; hero.atXZ = ok ? xz : null; hero.atC = ok ? `${id}:${courseOf(id)}` : null;   // ── director13 ──
      if (ok) { W.heroTool(ALTAR.has(id) ? 'wood' : 'iron'); const jk = S.jobOf(G, id); if (jk && (jk.kind === 'stone' || jk.kind === 'key')) W.workpiece(workpieceOf(id), W.workSpot(id, 'dress') || undefined); captureAnchor(); hero.anchorT = targetOf(job); }
    }, () => {}).finally(() => {
      if (walkFollow && walkFollow.run === run) { walkFollow = null; if (hero.run === run && !whole && !momentBusy && !overlay && !looking() && tNow() >= camHold) workFrame(id, 1100); }   // ── director13 ──
      if (hero.run !== run) return;
      hero.busy = false;
      const p = hero.pending; hero.pending = null;
      if (p && p.job.gen === hero.gen) runJob(p.job, p.t);
    });
  }
  // ── director13 ── the tracking shot of a long walk: every 0.7 s a short glide that keeps him at the frame's centre, 46 amot away,
  // 24° up, from the side of his path (the bearing chosen at the walk's start, away from the site's centre); never over a game,
  // a card or a held shot, never while the player looks around
  let walkFollow = null;
  function followAz(id, hp, xz) {
    const dx = xz[0] - hp.x, dz = xz[1] - hp.z, L = Math.hypot(dx, dz) || 1, c = W.siteTop(id);
    const n1 = [-dz / L, dx / L], n2 = [dz / L, -dx / L], mx = (hp.x + xz[0]) / 2, mz = (hp.z + xz[1]) / 2;
    // (the side of his path away from the site's centre: the building is behind him, not between)
    const out = c && (n1[0] * (mx - c.x) + n1[1] * (mz - c.z)) < 0 ? n2 : n1;
    // (a little behind him along the path, so he walks into the frame's depth)
    return (Math.atan2(out[1] * 0.85 - (dz / L) * 0.5, out[0] * 0.85 - (dx / L) * 0.5) * 180) / Math.PI;
  }
  function stepFollow(ms) {
    const f = walkFollow; if (!f) return;
    if (hero.run !== f.run || !hero.busy) { walkFollow = null; return; }
    if (whole || momentBusy || overlay || looking() || tNow() < camHold || !view || !view.lookAt) return;
    if (ms - f.t < 350) return;
    const hp = W.heroPos(); if (!hp || !Number.isFinite(hp.x)) return;
    // (PRODUCER13 N88: at the karnot he ran 147 amot down the kevesh in ~4 s — a 0.7-s step lost him) every 0.35 s, aimed ahead of
    //  him by the way he went since the last step
    const dt = f.t ? (ms - f.t) / 1000 : 0, lead = f.last && dt > 0 && dt < 1.5 ? 0.45 / dt : 0;
    const lx = f.last ? (hp.x - f.last[0]) * lead : 0, lz = f.last ? (hp.z - f.last[1]) * lead : 0;
    f.t = ms; f.last = [hp.x, hp.z];
    // (a clear line to him: the chosen side, else turned, else no glide this time)
    const d = 46, t = [hp.x + lx, hp.y + 1.8, hp.z + lz];
    const pose = (az, el) => { const a = (az * Math.PI) / 180, e = (el * Math.PI) / 180; return [t[0] + Math.cos(e) * Math.cos(a) * d, t[1] + Math.sin(e) * d, t[2] + Math.cos(e) * Math.sin(a) * d]; };
    // (PRODUCER13 N90: in the Azara, round the House, every low bearing was "blocked" and the shot stood still while he ran 230 amot
    //  out of it — higher then, and at the last from above: from above the walls hide him least)
    let az = f.az + 0, el = 62;
    for (const [da, de] of [[0, 24], [40, 24], [-40, 24], [80, 24], [-80, 24], [0, 42], [40, 42], [-40, 42], [0, 62]]) { const q = pose(f.az + da, de); if (!W.has('frameBlocked') || !W.frameBlocked(q[0], q[1], q[2], t[0], t[1], t[2], f.id)) { az = f.az + da; el = de; break; } }
    f.az = az;
    view.lookAt(t[0], t[1], t[2], d / (innerWidth / innerHeight < 0.8 ? 1.35 : 1), az, el, 450);
  }
  // ── /director13 ──
  /* PEOPLE's act kind for this stroke: a stone is dressed on the banker (the crane sets it); survey measure, dig pick… */
  function strokeKind(job) {
    if (job.boulder != null) return 'pick';
    const j = S.jobOf(G, job.id);
    return !j ? 'tamp' : j.kind === 'stone' ? 'dress' : j.act || 'tamp';
  }
  // ── econ14 ── (D3, her choice: the ring) the teach, once a save: the first RING_TEACH.n judged taps beat slowly (2.0 s, then 1.4,
  // then 0.86; a perfect steps it on) with a hand that presses on the gold at the beat and the mentor's line; then the game's beat.
  // The words under the gold: early / late for the first 8 misses, "מדויק! מכה כפולה" for the first 8 perfects.
  const RING_TEACH = { beats: [2.0, 1.4, 0.86], n: 5, win: 0.3, words: 8, line: 'הקש כשהטבעת נוגעת בזהב' };
  /** the stone on his banker (stages.js wpFront: 2.05 × HERO_S ahead of his feet, 0.25 × HERO_S to his right; HERO_S 1.6), its
   *  top: where the gold sits. From his spot's face, else from where he stands and faces (the dbg probe: a site without a 'dress'
   *  workSpot gave spotOf a bare id, and the ring fell back to the crane). Then every contact on the workpiece moves the ring to
   *  where his tool met the stone (PEOPLE's onImpact). A boulder keeps its own point. */
  const econRaw = () => { try { return world && (world.hero || (world.stages && world.stages.hero)) || null; } catch (e) { return null; } };
  function econAnchor(job, sp) {
    if (job.boulder != null) return null;
    const h = econRaw(), hp = W.heroPos(); if (!hp || !Number.isFinite(hp.x)) return null;
    const own = sp && typeof sp === 'object' && typeof sp.x === 'number' && typeof sp.faceX === 'number';
    const yaw = own ? Math.atan2(sp.faceX - sp.x, sp.faceZ - sp.z) : h && Number.isFinite(h.yaw) ? h.yaw : null;
    if (yaw == null) return null;
    const x0 = own ? sp.x : hp.x, z0 = own ? sp.z : hp.z, c = Math.cos(yaw), s = Math.sin(yaw), mx = -0.4, mz = 3.28;
    // (the height from his feet, where he stands at his banker: groundAt may not know the Mount's rough rock, which a shader raises)
    return Number.isFinite(hp.y) ? { x: x0 + mx * c + mz * s, y: hp.y + 2.1, z: z0 - mx * s + mz * c } : null;
  }
  let econBound = false;
  const econStone = { x: 0, y: 0, z: 0 };
  function econBindImpact() {
    if (econBound) return; econBound = true;
    const h = econRaw();
    try { if (h && typeof h.onImpact === 'function') h.onImpact((e) => { try { if (!e || !e.workpiece || !Number.isFinite(e.x) || !hero.cur || hero.cur.boulder != null) return; econStone.x = e.x; econStone.y = e.y + 0.15; econStone.z = e.z; hero.anchorT = econStone; } catch (err) { /* never in the stroke's way */ } }); } catch (e) { /* PEOPLE's */ }
  }
  const econ = () => (G.econ && typeof G.econ === 'object' ? G.econ : (G.econ = {}));   // (5652588 dropped this line by mistake: every strike threw — restored)
  const teachOn = () => settings.rhythm !== false && (econ().tt || 0) < RING_TEACH.n;
  function ringCycle() {
    if (!teachOn()) return RHYTHM.cycle;
    const e = econ(), k = Math.min(RING_TEACH.beats.length - 1, Math.max(e.tp || 0, Math.floor((e.tt || 0) / 2)));
    return RING_TEACH.beats[k];
  }
  const ringWin = () => (teachOn() && ringCycle() > RHYTHM.cycle ? RING_TEACH.win : touch ? RHYTHM.windowTouch : RHYTHM.windowMouse);
  /** a judged tap: dt = tap − beat (s). Only while the ring is live (an idle restart is no "late"); a mash gets no words */
  function ringJudge(dt, win, perfect, mash) {
    if (!hero.ringOn || dt > RHYTHM.idle) return;
    hero.dt = dt;
    const e = econ(), teach = teachOn();
    if (teach) { e.tt = (e.tt || 0) + 1; if (perfect) e.tp = (e.tp || 0) + 1; }
    emit('ringTry', { dt: Math.round(dt * 1000) / 1000, perfect, early: !perfect && dt < -win, late: !perfect && dt > win, teach, n: e.tt || 0 });
    if (mash) return;
    if (perfect) { if ((e.pw || 0) < RING_TEACH.words) { e.pw = (e.pw || 0) + 1; ui.ring.say('מדויק! מכה כפולה', 'ok'); } }
    else if ((e.rw || 0) < RING_TEACH.words && Math.abs(dt) > win) { e.rw = (e.rw || 0) + 1; ui.ring.say(dt < 0 ? 'מוקדם, חכה עוד רגע' : 'מאוחר, הקש קצת קודם', 'warn'); }
    if (teach && !teachOn()) { if (ui.coachText.endsWith(RING_TEACH.line)) ui.coach(null, ''); emit('ringTaught', { tries: e.tt, perfect: e.tp || 0 }); persist(); }
  }
  /** the mentor's line while the teach runs (the hand is the ring's own) */
  // (PRODUCER14 N93: the mentor's bubble set .coach-on, which slid the demo's strip onto the rock's pointer — a tap there left the
  //  demo) the teach's words are the ring's own caption, under the gold, while the teach runs (ui.css.js .gm-ring small)
  function teachLine() { if (teachOn() && ui.coachText.endsWith(RING_TEACH.line)) ui.coach(null, ''); }
  /** the ear (D3): while the teach's beat is slow, two soft ticks as the ring closes and a wooden dum on the beat; at the game's
   *  beat, one tick at the window's edge (the music's groove already beats one swing: music.js SWING) */
  let ringSnd = [];
  function ringSound(t0, beat) {
    for (const h of ringSnd) clearTimeout(h); ringSnd.length = 0;
    const at = (t, name, o) => { const ms = (t - tNow()) * 1000; if (ms > 0) ringSnd.push(setTimeout(() => { if (hero.ringOn && !whole) sfx.play(name, o); }, ms)); };
    if (beat - t0 > RHYTHM.cycle + 0.05) { at(beat - (beat - t0) * 0.5, 'ui'); at(beat - (beat - t0) * 0.25, 'ui'); at(beat, 'wheel'); }
    else at(beat - RHYTHM.windowTouch, 'ui');
  }
  // ── /econ14 ──
  // ── crafta19 ── (FUN19 §2, binding; the owner's notes 2, 8, 9, 13, 14) the strike under two thumbs: one touch → his fall (≤ 50 ms: the
  // tool was held up, armed) → the impact ≈ 90 ms after the touch-down → on THAT frame the "+N" (juice.hit with the act's grade), the
  // world's answer (the rock cracks, splits; the stone is dressed), the sound and the buzz. No act without a touch — the first strike is
  // the player's too (8א): a touch away from his work only brings him there and arms him. The grade is the impact's on the music's beat
  // (acts.js beatQ: gold |impact − beat − 40 ms| ≤ 90, ±120 at L1; good ≤ 180); the ring round the button and its mirror on the work
  // close on beat − 90 ms, every 2nd beat (≈ 1 act a second at 124 BPM).
  const CA = { td: 0, gold: 0, cyc: 0, ringT: 0, pos: { x: 0, y: 0, on: false }, at: { x: 0, y: 0, z: 0 }, armK: null, chk: 0, acts: 0, mkJob: null };
  const caHero = () => { try { const h = world && (world.hero || (world.stages && world.stages.hero)); return h && typeof h.arm === 'function' ? h : null; } catch (e) { return null; } };
  const caTarget = (job, kind) => (job.boulder != null ? targetOf(job) : kind === 'dress' ? undefined : job.id);
  /** the strike's level for the gold window: the rocks are L1 (±120 ms); the banker's strokes follow the job's level */
  const caLevel = (job) => (job.boulder != null ? 0 : Math.max(0, Math.min(2, mgLevel('dress') | 0)));
  function caArm(job) { const h = caHero(); if (!h) return false; const k = strokeKind(job); let ok = false; try { ok = h.arm(k, caTarget(job, k)); } catch (e) { ok = false; } CA.armK = ok ? jobKey(job) : null; if (ok) TL.use(TL.strokeTool(k, ALTAR_T.has(job.id)), { job: 'arm:' + jobKey(job) }); return ok; }   // ── tools21 ──
  function caDisarm() { TL.release(); if (!CA.armK) return; CA.armK = null; const h = caHero(); try { if (h) h.arm(null); } catch (e) { /* the world's */ } }
  /** where the act lands, in the world (the "+N" rises there): the rock's shoulder, else the stone on his banker, else his hands */
  function caAt(job) {
    const o = CA.at;
    if (job.boulder != null) { const [x, z] = BOULDER_XZ[job.boulder]; o.x = x; o.z = z; o.y = W.groundAt(x, z) + 3; return o; }
    const b = bankerT(job.id); if (b) { o.x = b.x; o.y = b.y; o.z = b.z; return o; }
    const p = W.heroPos(); if (p) { o.x = p.x; o.y = p.y + 2.2; o.z = p.z; } return o;
  }
  /** the impact frame: the grade, the "+N" and its flight to the score (HOOK19's points), the button's own flash → q 0 | 1 | 2 */
  function caImpact(job, hand) {
    const q = hand ? 2 : caBeatQ(settings.rhythm === false ? -1 : caLevel(job)), t = performance.now();
    const rhythmOff = settings.rhythm === false, g = rhythmOff ? 1 : q;   // (the rhythm setting off: every act good)
    const J = JU || (globalThis.__BH_PARTS && globalThis.__BH_PARTS.juice), at = caAt(job), trade = job.boulder != null ? 'חוצבים' : twinTrade('strike');
    try { if (J && typeof J.hit === 'function') J.hit(job.boulder != null ? 'rock' : 'strike', { at, text: g === 2 ? 'מושלם!' : '+1', perfect: g === 2, combo: G.stats.combo || 0, craft: trade, grade: g === 2 ? 'perfect' : g === 1 ? 'good' : 'soft', quality: g === 2 ? 1 : g === 1 ? 0.82 : 0.6, act: g === 2 ? 'gold' : g === 1 ? 'good' : 'ok' }); } catch (e) { console.warn('[crafta19] hit', e && e.message); }
    try { if (TW && typeof TW.graded === 'function') TW.graded(g); } catch (e) { /* twin's */ }
    CA.acts++;
    emit('craftAct', { kind: job.boulder != null ? 'rock' : 'strike', q: g, td: Math.round(CA.td), t: Math.round(t), lag: CA.td ? Math.round(t - CA.td) : null, n: CA.acts, p: (() => { const w = globalThis.__TW_POWER; return w && w.until > performance.now() ? w.p : 1; })() /* twin20 */ });
    return g;
  }
  /** the ring's beat for the twin button and its mirror on the work (one object, filled): the gold touch moment = an even beat − 90 ms */
  function caRing(o) {
    o.on = false;
    if (settings.rhythm === false) return o;
    let b = null; try { const M = globalThis.__BH_MUSIC; b = M && typeof M.beat === 'function' ? M.beat() : null; } catch (e) { b = null; }
    if (!b || !(b.period > 0.2) || !Number.isFinite(+b.toNext)) return o;
    const p = +b.period, now = tNow(), nb = now + (((+b.toNext % p) + p) % p), even = Math.round(nb / p) % 2 === 0;
    let gold = (even ? nb : nb + p) - 0.09;
    while (gold - now < -0.16) gold += 2 * p;
    if (gold - now > 2 * p - 0.16) gold -= 2 * p;
    o.on = true; o.to = gold - now; o.cyc = 2 * p; o.win = 0.12; CA.gold = gold; CA.cyc = 2 * p;
    return o;
  }
  /** ten times a second under two thumbs: armed at a strike he stands at (the first touch strikes), lowered when the work is gone; the
   *  world's ring mirrors the button's on the work */
  const caRingO = { on: false, to: 0, cyc: 1, win: 0.12 };
  function caTick() {
    if (!TW || !TW.on) { if (CA.armK) caDisarm(); if (CA.ringT) { CA.ringT = 0; stopRing(); } return; }
    if (globalThis.__HANDS && globalThis.__HANDS.twin) { CA.armK = null; if (CA.ringT) { CA.ringT = 0; stopRing(); } return; }   // (a craft in the world holds his hands: its own pose and ring)
    const s = typeof TW.spec === 'function' ? TW.spec() : null, job = s && s.strike && s.ca ? s.ca : null;
    if (job && !hero.busy && !TW.walking && !(globalThis.__HANDS && globalThis.__HANDS.twin)) {
      job.gen = hero.gen; const key = jobKey(job), h = caHero(), hp = W.heroPos();
      let sp = null; try { sp = job.boulder != null ? (h && typeof h.standOf === 'function' ? h.standOf({ boulder: job.boulder }) : null) : spotOf(job); } catch (e) { sp = null; }
      const d = sp && hp && typeof sp.x === 'number' ? Math.hypot(hp.x - sp.x, hp.z - sp.z) : -1;
      if (d >= 0 && (d <= 2.5 || (hero.at === key && job.boulder == null))) {   // (he stands at it: the tool up — the first touch strikes)
        if (hero.at !== key) { emit('caArm', { key, d: Math.round(d * 10) / 10 }); hero.at = key; hero.atXZ = [sp.x, sp.z]; if (job.boulder != null) { captureAnchor(); hero.anchorT = BOULDER_T[job.boulder]; } }
        if (CA.armK !== key || (h && !h.armed)) caArm(job);
      } else if (d > 3.5 && job.boulder != null) {   // (away from the rock — a placement, a load: no stale "at" that would strike from afar; his banker keeps NAV19's rule: the crews moving the slot never walk him)
        if (hero.at === key) { hero.at = null; hero.atXZ = null; }
        if (CA.armK) caDisarm();
      }
    } else if (!job && CA.armK && !hero.busy) caDisarm();
    // the mirror: the world ring on the work, closing with the button's
    if (job && caRing(caRingO).on) {
      const at = caAt(job), pos = () => { const q = view && view.project ? view.project(at.x, at.y, at.z) : null; if (q) { CA.pos.x = q.x; CA.pos.y = q.y; CA.pos.on = q.on !== false; } return CA.pos; };
      if (Math.abs(CA.ringT - CA.gold) > 0.05) { CA.ringT = CA.gold; ui.ring.start(pos, CA.gold - CA.cyc, CA.gold, caRingO.win, {}); hero.ringOn = true; }
    } else if (CA.ringT) { CA.ringT = 0; stopRing(); }
  }
  // the Mount's survey under two thumbs (note 7; FUN19 §3): a craft in the world — hold and drag: the measuring cord pays out, a counter
  // climbs in amot to the Mishnah's 500; the release is the act; then the measure is stamped ("500 אמה · מדות ב, א") and its strokes
  // are the game's (the survey done → the dig; the book's tab calls: HOOK19's nudge on the phase)
  const CA_SV = { icon: '📏', label: 'מדידה', job: 'survey', at: null, go: () => caSurveyRun() }, caSvO = {};
  let caSvBusy = false, caSvEl = null;
  async function caSurveyRun() {
    const run = fnOf(parts().minigames, 'runMinigame'), j = S.jobOf(G, 'har');
    if (caSvBusy || !run || !j || j.kind !== 'survey' || momentBusy || overlay || hero.busy) return false;
    caSvBusy = true; jobBusy = true; stopRing(); caDisarm();
    let r = null;
    try { r = await guarded(run('survey', { root: ui.root || document.body, world, site: 'har', level: 0, demo: reelOn(), onEvent: (t, d) => emit(t, d), sfx, haptic, reduced, ...twinCtx('survey') }), 'minigames.survey'); }
    finally { caSvBusy = false; jobBusy = false; if (caSvEl) caSvEl.style.opacity = '0'; }
    if (!r || r.skipped) return false;
    const perfect = !!r.perfect || (r.quality || 0) >= 0.9;
    for (let k = 0; k < 8; k++) {   // the survey's strokes, the game's: its phase moves on to the dig
      const jj = S.jobOf(G, 'har'); if (!jj || jj.kind !== 'survey') break;
      const o = S.stroke(G, 'har', perfect); if (!o.ok) break;
      emit('stroke', { id: 'har', job: 'survey', perfect, craft: true });
      strokeOutcome('har', jj, o, null, perfect);
    }
    try { if (ui && typeof ui.stamp === 'function') ui.stamp('500 אמה · מדות ב, א'); } catch (e) { /* the HUD's */ }
    emit('surveyed', { id: 'har', q: r.quality, amot: 500, ref: 'מדות ב, א' });
    return true;
  }
  /** each frame while the survey runs: the counter in amot over the cord's running end (one element, made once) */
  function caSvFrame() {
    if (!caSvBusy) return;
    const S0 = world && (world.stages || world); if (!S0 || typeof S0.caSurvey !== 'function' || !view || !view.project) return;
    const c = S0.caSurvey(caSvO); if (!c.on) return;
    if (!caSvEl) { caSvEl = document.createElement('div'); caSvEl.className = 'ca-sv'; caSvEl.setAttribute('aria-live', 'polite'); caSvEl.style.cssText = 'position:absolute;left:0;top:0;z-index:6;pointer-events:none;padding:6px 12px;border-radius:14px;background:rgba(28,20,10,.86);border:2px solid #FFD66E;color:#FFF6DA;font:900 20px/1 Heebo,system-ui,sans-serif;direction:rtl;white-space:nowrap;transition:opacity .2s;box-shadow:0 2px 10px rgba(0,0,0,.45)'; (ui.root || document.body).appendChild(caSvEl); }
    const q = view.project(c.ex, c.ey + 2.2, c.ez), x = q.x, y = q.y, am = Math.round(Math.min(1.2, c.u) * 500), near = Math.abs(am - 500) <= 15;
    const txt = c.phase === 'stamp' || c.phase === 'done' ? '500 אמה ✓' : `${am} אמה`;
    if (caSvEl.textContent !== txt) caSvEl.textContent = txt;
    caSvEl.style.borderColor = near || c.phase === 'stamp' ? '#7CE0A0' : '#FFD66E';
    caSvEl.style.opacity = c.u > 0.01 || c.phase === 'stamp' ? '1' : '0.75';
    caSvEl.style.transform = `translate(${Math.round(Math.max(60, Math.min(innerWidth - 60, x)) - 40)}px,${Math.round(Math.max(118, Math.min(innerHeight - 60, y)) - 30)}px)`;   // (under the top bar's pill)
  }
  /** the survey's spec under two thumbs: the craft, not the old measuring strokes (one object, its `at` refreshed) */
  const caSvAt = { x: 0, y: 0, z: 0 };
  function caSpec(s) {
    const hs = G.st.har;
    if (globalThis.__HANDS && globalThis.__HANDS.twin) { const k = globalThis.__HANDS.kind; if (s && s.craft && (k === 'dress' || k === 'pull' || globalThis.__HANDS.generic)) s.beatRing = true; else if (s && s.craft && (k === 'tread' || k === 'snap' || k === 'survey' || k === 'crane')) s.noRing = true; return s; }   // (the craft running: its own spec, craft: true — the touch-down reaches it; a rhythm craft's ring on the music)
    if (!hs || hs.p !== 'survey' || hs.ready || S.isDone(G, 'har') || S.statusOf(G, 'har') !== 'building' || (s && s.job !== 'survey' && s.job !== 'back')) return s;
    if (s && s.at) CA_SV.at = s.at; else { const hp = W.heroPos(); if (hp && Number.isFinite(hp.x)) { caSvAt.x = hp.x; caSvAt.y = hp.y + 1; caSvAt.z = hp.z; } CA_SV.at = caSvAt; }
    return CA_SV;   // (the Mount's survey: where he stands is its first stake — after the tutorial too)
  }
  // ── /crafta19 ──
  async function runJob(job, tapT) {
    try { econBindImpact(); } catch (e) { /* never in the stroke's way */ }   // ── econ14 ── ── /econ14 ──
    const run = hero.run = (hero.run || 0) + 1;   // (a job left over from before a resync never clears a newer job's flags)
    hero.busy = true; hero.cur = job; hero.rest = false;   // ── director13 ── (he works: no longer resting at an old banker)
    if (job.id) lastWorkId = job.id;   // ── flow11 ── (curWork)
    let perfect = false;
    hero.dt = null;   // ── econ14 ── (set by ringJudge) ── /econ14 ──
    const taps = HK.tapMeter.take();                  // the taps that led to this strike (hooks/rhythm.js)
    const TWA = twinOn() && !!caHero();   // ── crafta19 ── the rule under two thumbs (FUN19 §2) ── /crafta19 ──
    try {
      if (!jobValid(job)) return;
      const key = jobKey(job), sp = spotOf(job);
      // (the owner, 28.9 21:42–21:57: "the builder is far from the site, stuck; the dressed stone hangs in the air") the banker moves
      // with the working bay along the front (a new course, a segment set by the crews): at the same job key he walks to it again
      // ── nav19 ── (note 16: "two acts at one place stay at one place") under two thumbs the crews moving his slot on does not walk him
      // after it between two strokes: the stone stays on his banker where he works; the stick or the compass takes him on
      if (TWA) emit('caRun', { at: hero.at, key, walk: hero.at !== key });   // ── crafta19 ── (tests: the touch's way — a walk and arm, or a strike) ── /crafta19 ──
      if (hero.at !== key || (movedSpot(sp) && !twinOn())) {   // ── /nav19 ──
        stopRing();
        followTarget(job);
        const ok = await navGo(sp);   // ── stages21 ── (was W.walkTo: the same ≤ 1.5 s rule under two thumbs) ── /stages21 ──
        if (!jobValid(job)) return;
        hero.at = ok ? key : null; hero.atXZ = ok ? xzOf(sp) : null; hero.atC = ok && job.id ? `${job.id}:${courseOf(job.id)}` : null;   // ── director13 ──
        if (job.id) { W.hotspot(job.id); syncCrane(); }
        // the altar's stones are never touched by iron (Middot 3:4): a wooden mallet there
        W.heroTool(job.id && ALTAR.has(job.id) ? 'wood' : 'iron');
        // (the stone on his banker goes WITH him: without `at` it stayed on the first banker he used — every dressing stroke
        //  then stepped him back there, out of the bay's frame, and the old block hung where the ground had changed; the
        //  owner, 28.9 21:57 "האבן המסותתת נמצאת באוויר")
        if (job.id && S.jobOf(G, job.id).kind === 'stone') W.workpiece(workpieceOf(job.id), W.workSpot(job.id, 'dress') || undefined);
        captureAnchor();
        { let a = null; try { a = econAnchor(job, sp); } catch (e) { a = null; } hero.anchorT = a || targetOf(job); }   // ── econ14 ── (D3) the ring on the stone he strikes, not the site's crane ── /econ14 ──
        // ── crafta19 ── (8א: "מכה ראשונה הדמות נותנת לבד") under two thumbs the walk only brings him to his work and arms him — the
        // strike is the next touch's, never the walk's end; a touch that came during the walk is not kept
        if (TWA) { if (ok) caArm(job); hero.pending = null; return; }
        // ── /crafta19 ──
      } else if (TWA) { /* ── crafta19 ── (graded at the impact, below) ── /crafta19 ── */
      } else if (settings.rhythm !== false && hero.beat) {
        // ── econ14 ── (D3) the window is the ring's: wider while the teach's beat is slow
        const win = ringWin();
        // (hooks/rhythm.js) a burst of taps is not an aimed tap: it still strikes, without the gold
        const onBeat = Math.abs(tapT - hero.beat) <= win, mash = HR.isMash(taps);
        perfect = onBeat && !mash;
        if (onBeat && mash) HK.onMash();
        ringJudge(tapT - hero.beat, win, perfect, mash);
        // ── /econ14 ──
      }
      let caHand = false;   // ── crafta19 ── ── /crafta19 ──
      if (twinPerfect) { twinPerfect = false; if (twinOn()) { perfect = true; caHand = true; } }   // ── twin17 ── ("יד של אומן": a guaranteed perfect strike) ── /twin17 ── ── crafta19 ── (caHand) ── /crafta19 ──
      const swingAt = tNow();
      // ── econ14 ── (D3) the ring closes over the whole swing, from the tap to the next beat (the vote page's demo: one cycle), not
      // over the follow-through alone (0.46 s: "the player doesn't know when"); the save's first tries beat slowly (the teach)
      hero.beat = swingAt + ringCycle();
      if (settings.rhythm !== false && !whole && !TWA) { ui.ring.start(ringPos, swingAt, hero.beat, ringWin(), { teach: teachOn() }); hero.ringOn = true; ringSound(swingAt, hero.beat); teachLine(); }   // ── crafta19 ── (!TWA: the music's ring, caTick) ── /crafta19 ──
      // ── /econ14 ──
      const kind = strokeKind(job);
      const hit = W.heroHas('act')
        ? await W.act(kind, job.boulder != null ? targetOf(job) : kind === 'dress' ? undefined : job.id, { quality: perfect ? 'perfect' : 'normal', shake: !reduced, snap: TWA })   // ── crafta19 ── (snap: the fall alone, from the armed pose) ── /crafta19 ──
        : await W.swing({ shake: !reduced });
      if (!hit || !jobValid(job)) return;
      if (TWA) { perfect = caImpact(job, caHand) === 2; CA.armK = jobKey(job); }   // ── crafta19 ── the impact frame: the grade, the "+N" ── /crafta19 ──
      impact(job, perfect);
      hero.cur = null;                     // the hit has landed: the next tap may target the same boulder
      hero.lastImpact = tNow();
      if (TWA) return;   // ── crafta19 ── (the next touch is the player's at once: no wait for the old ring's beat — that wait buffered the touch and struck late) ── /crafta19 ──
      if (settings.rhythm !== false) { ui.ring.hit(perfect); hero.ringOn = true; }   // ── econ14 ── (the ring started at the swing)
      const wait = hero.beat - tNow();
      if (wait > 0) await sleep(wait * 1000);
    } catch (e) { console.warn('[game] hero job failed', e); } finally {
      if (hero.run === run) {
        hero.busy = false; hero.cur = null;
        const p = hero.pending; hero.pending = null;
        if (p && p.job.gen === hero.gen) runJob(p.job, p.t);
        else {
          if (hero.ringOn) setTimeout(() => { if (!hero.busy && hero.ringOn && tNow() - hero.beat > RHYTHM.idle) stopRing(); }, RHYTHM.idle * 1000 + 50);
          // ── flow9 ── (game-touch 11/12: the pointer went dark at every new boulder) a split marks the next rock while the hero is
          // still busy, so markSync could not move the camera; the stroke is over now: frame the marked rock before he walks (M5)
          if (markT && markT.boulder != null && markT.boulder !== (job && job.boulder)) followTarget({ boulder: markT.boulder });
        }
      }
    }
  }
  function captureAnchor() {
    const p = W.heroPos();
    if (p) { hero.anchor.x = p.x; hero.anchor.y = p.y + 2.2; hero.anchor.z = p.z; }
  }
  /* The ring and the floats sit on what is struck: world.screenPos(site | {boulder}); an older world: the projected
     point above the builder. Every frame: one shared object, no allocation. */
  const scr = { x: 0, y: 0, on: false };
  const ringPos = () => {
    if (hero.anchorT != null) {
      const p = W.screenPos(hero.anchorT, scr);
      if (p && typeof p.x === 'number') { if (p !== scr) { scr.x = p.x; scr.y = p.y; scr.on = p.on !== false; } return scr; }
    }
    if (!view || !view.project) return null;
    const p = view.project(hero.anchor.x, hero.anchor.y, hero.anchor.z);
    scr.x = p.x; scr.y = p.y; scr.on = p.on;
    return scr;
  };
  function anchorScreen() { const p = ringPos(); return p && p.on ? p : null; }
  const workpieceOf = (id) => { const s = G.st[id]; const k = s ? s.k || 0 : 0; return k >= 2 ? 'dressed' : k >= 1 ? 'drafted' : 'rough'; };

  /* The stroke lands. */
  function impact(job, perfect) {
    const prevCombo = G.stats.combo || 0;
    const combo = S.noteStrike(G, perfect);
    HK.onStrike();
    W.setComboLevel(combo);                             // the builder's aura and the site's build edge
    const pos = anchorScreen();
    const mk = HR.milestone(prevCombo, combo);
    if (mk) { if (pos && mk >= 3) ui.float('יד של אומן!' /* ── econ14 ── (D3: the combo reads "N ברצף!" on the ring; no ×) */, pos.x, pos.y - 78, 'gold'); sfx.play('chime', { combo: 6 + 2 * mk }); haptic([12, 30, 12]); emit('comboMilestone', { k: mk, combo }); }
    const fxT = targetOf(job), quality = perfect ? (combo > 1 ? 'combo' : 'perfect') : 'normal';
    if (twinOn() && caHero()) { sfx.play('strike', { combo: 0 }); if (perfect) taskHit('perfect'); }   // ── crafta19 ── (the material's own thud; the grade's bell and the buzz are juice.hit's, on this same frame) ── /crafta19 ──
    else if (perfect) { sfx.play('perfect', { combo }); haptic(15); taskHit('perfect'); } else { sfx.play('strike', { combo: 0 }); haptic(10); }
    taskHit('strikes');
    ui.combo(perfect ? combo : 0);
    emit('strike', { perfect, combo, job: jobKey(job), dt: hero.dt == null ? null : Math.round(hero.dt * 1000) / 1000 });   // ── econ14 ── dt = tap − beat (s; null: not judged), for FUN14's "סתת בקצב" ── /econ14 ──
    if (job.boulder != null) {
      // ── crafta19 ── (FUN19 §2: "the rock shows a crack at each HP and splits" — under two thumbs every blow is one blow, gold or not: the
      // gold pays in points, never by skipping the crack; a gold first blow split the rock and left the next touches with no work)
      const caTw = twinOn() && !!caHero();
      const r = S.hitBoulder(G, job.boulder, perfect && !caTw ? 2 : 1);
      // ── /crafta19 ──
      if (!r.ok) return;
      emit('stroke', { id: 'har', job: 'dig', perfect });
      W.strikeFX(fxT, quality, combo);
      W.hitBoulder(job.boulder, r.hp);
      if (r.hp > 0) sfx.play('crack');
      if (r.shattered) {
        if (caTw) { try { const J = JU || (globalThis.__BH_PARTS && globalThis.__BH_PARTS.juice); if (J && typeof J.hit === 'function') { const at = caAt(job); J.hit('rock', { at: { x: at.x, y: at.y + 1.5, z: at.z }, text: '+60 הסלע נבקע!', perfect: false, combo: 0, craft: 'חוצבים', grade: 'good', quality: 0.82, pts: 60 }); } } catch (e) { /* juice's */ } }   // ── crafta19 ── (FUN19: "Split +60") ── /crafta19 ──
        hero.at = null;
        sfx.play('shatter'); haptic(35);
        if (pos) ui.float(S.bouldersLeft(G) ? `עוד ${isoNum(S.bouldersLeft(G))} סלעים` : 'ההר פונה!', pos.x, pos.y - 40, 'gold');
        emit('boulder', { i: job.boulder, left: S.bouldersLeft(G) });
        ftueBoulder();
      }
      if (r.phase) phaseReached('har', r.phase);
      syncSite('har');
      ui.refresh();
      return;
    }
    const id = job.id, j0 = S.jobOf(G, id);
    const r = S.stroke(G, id, perfect);
    if (!r.ok) return;
    emit('stroke', { id, job: j0.kind, perfect });
    W.strikeFX(fxT, quality, combo);
    if (j0.kind === 'stone') W.workpiece(r.stones.length ? 'rough' : workpieceOf(id));
    strokeOutcome(id, j0, r, pos, perfect);
  }
  /* what a stroke (or a key stone) did: a stone set, a course, a phase, an event cleared, the stage's end */
  function strokeOutcome(id, j0, r, pos, perfect, by = 'hero') {
    const v = S.siteView(G, id);
    for (const i of r.stones) {
      emit('stoneSet', { id, i, n: 1, set: i + 1, of: v.n, course: Math.floor(i / v.per) + 1, by, key: j0.kind === 'key', q: r.q });
      taskHit('stones');
    }
    if (r.stones.length) {
      sfx.play('settle'); haptic(18);
      if (pos) ui.float(`אבן ${isoFrac(Math.min(v.per, (r.stones[r.stones.length - 1] % v.per) + 1), v.per)}`, pos.x, pos.y - 36, perfect ? 'gold' : '');
      stoneLift(id, j0.kind === 'key' && (j0.what === 'great' || j0.what === 'lintel'));
    } else if (pos && j0.need) ui.float(`${'•'.repeat(Math.min(3, Math.round(G.st[id] ? G.st[id].k : 0)))}${'◦'.repeat(Math.max(0, Math.min(3, j0.need) - Math.round(G.st[id] ? G.st[id].k : 0)))}`, pos.x, pos.y - 30, perfect ? 'gold' : '');
    if (r.course) courseEnd(id, r.course, by);   // ── director13 ── (N79: one moment for every course end, his stone or a crew's)
    if (r.reset != null && r.reset >= 0) { ui.toast({ icon: 'check', title: 'האבן הונחה מחדש', body: 'ישרה עכשיו', kind: 'mini', ms: 1800 }); emit('reset', { id, i: r.reset }); }
    if (r.event) { ui.toast({ icon: 'crew', title: EVENTS[r.event].n + ': טופל', body: 'העבודה ממשיכה', kind: 'mini', ms: 2200 }); emit('event', { kind: r.event, id, done: true }); }
    if (r.phase) phaseReached(id, r.phase);
    if (r.reached === 'ready') { persist(); syncSite(id, true); runMoment(id); }
    else if (r.reached === 'done') completeFlow(S.completeStage(G, id), true);
    else syncSite(id);
    if (G.ftue < 99) ftueStone(id, r);
    persist(); ui.refresh();
    markSync();                                         // ── flow8 ──
  }
  /** ── flow10 ── (PRODUCER10 N13: "where do my stones go? No course is ever seen … the end of course 1 has no moment") a course
      completed at the Mount gets a beat: the camera rises over the bay to the course along the face (2.6 s), he looks up at his
      work, then the frame is his again */
  function courseBeat(id) {
    if (whole || !view || !view.lookAt || reelOn()) return false;
    const sl = W.nextSlot(id), b = W.workSpot(id, 'dress');
    if (!sl || !Array.isArray(sl.n) || !b || typeof b.x !== 'number') return false;
    const x = b.x * 0.4 + sl.face[0] * 0.6, z = b.z * 0.4 + sl.face[2] * 0.6, y = Math.max(W.groundAt(x, z), sl.y) + 2;
    const aIn = (Math.atan2(-sl.n[1], -sl.n[0]) * 180) / Math.PI;
    camHold = Math.max(camHold, tNow() + 2.8);
    // (wave 12 integration, SITE12's request: the owner, 29.9, "כשעשים זום אאוט רואים את ההתקדמות של החציבה") at the Mount the
    // beat shows the whole Mount for its 2.6 s, so each course's progress is seen without a pinch
    // ── director13 ── (C7, PRODUCER-S13a #9: from 70 amot 44° down over the next slot the crane's jib filled the frame, the course a
    // strip at the bottom, the gates' 3rd course framed the empty paving) every other site: the world's course frame — along the
    // new course from outside, 25–30° up, the course in the frame's middle third, the crane behind it (stages.js courseView)
    const cv = W.has('courseView') ? W.courseView(id) : null;
    if (cv && id !== 'har' && Array.isArray(cv.p) && Array.isArray(cv.t) && W.has('flyTo')) W.flyTo(cv.p, cv.t, 1500);
    else if (cv && typeof cv.x === 'number') view.lookAt(cv.x, cv.y, cv.z, cv.dist, cv.az, cv.el, 1500);
    else view.lookAt(x, y, z, 70, aIn + 34, 44, 1500);
    emit('courseBeat', { id, view: cv ? (id === 'har' ? 'mount' : 'course') : 'slot', ...(cv && cv.el != null ? { el: Math.round(cv.el), dist: Math.round(cv.dist || 0) } : {}), ...(cv && Array.isArray(cv.t) ? { t: cv.t.map((v) => Math.round(v * 10) / 10) } : {}) });
    if (!hero.busy) W.gesture('proud');
    setTimeout(() => { if (!whole && !momentBusy && !overlay && !hero.busy) workFrame(id, 1300); }, 2600 * F);
    return true;
  }
  // ── director13 ── (N79, PRODUCER-S13a #3: "at ×60 the crews end almost every course, so the owner never saw one") every course
  // end gets its moment — the toast "נדבך N מתוך M", the beat's frame and the check's call every CHECK_EVERY — whoever set the
  // last stone: at most one per course; never over a game, a card, a sheet or a key moment (it waits, and the latest course end
  // replaces an older one still waiting); never two beats stacked (a beat or a delivery holding the camera: it waits too). A
  // crew's course end at a site he does not work at is a toast only (the camera stays where he is).
  const beatDone = {};   // site → the last course whose moment was shown
  let beatWait = null, checkWait = null;
  const beatClear = () => started && !whole && !opening && !overlay && !momentBusy && !ui.busy && tNow() >= camHold;
  function courseEnd(id, c, by = 'hero') {
    const v = S.siteView(G, id), s = G.st[id]; if (!v || !s || !(c > 0)) return;
    emit('course', { id, c, of: v.C, by });
    const P = PROJ[id], d = beatDone[id];
    if (d != null && d >= c && Math.floor(s.set / P.P) >= d) return;   // (this course had its moment; a site restarted by a demo pick counts again)
    beatWait = { id, c, by };
    courseMoment();
  }
  function courseMoment() {
    if (checkWait && !beatWait && beatClear() && !(twinOn() && (jobBusy || SC || (globalThis.__HANDS && globalThis.__HANDS.twin)))) { const id = checkWait; checkWait = null; if (S.checkDue(G, id) && !reelOn()) courseCheck(id); return; }   // ── twin17 ── (never over a job the thumb plays) ── /twin17 ──
    const w = beatWait; if (!w) return;
    const s = G.st[w.id]; if (!s || s.done) { beatWait = null; return; }
    if (!beatClear()) return;   // (the frame loop tries again)
    beatWait = null; beatDone[w.id] = w.c;
    const v = S.siteView(G, w.id);
    sfx.play('chime', { combo: 8 }); haptic([20, 40, 20]);
    ui.toast({ icon: 'crew', title: `${stageById(w.id).n}: נדבך ${isoNum(w.c)} מתוך ${isoNum(v.C)}`, body: w.c < v.C ? (w.by === 'hero' ? 'עוד נדבך עומד. הבא בתור!' : 'הצוותים סגרו את הנדבך. הבא בתור!') : 'כל הנדבכים עומדים', kind: 'mini', ms: 2600, pause: true });
    // (the last course moves the site to its finish: its own toast and frame; the kiyor is cast in one piece)
    const mine = w.id === curWork() || (w.by === 'hero' && w.id === S.focusOf(G));
    const beat = mine && w.c < v.C && w.id !== 'kiyor' && courseBeat(w.id);
    emit('courseMoment', { id: w.id, c: w.c, by: w.by, beat: !!beat });
    // (the check after the beat, not over it: the beat holds the camera 2.8 s and courseMoment waits for it)
    if (mine && S.checkDue(G, w.id)) checkWait = w.id;
  }
  // ── /director13 ──
  function phaseReached(id, ph) {
    emit('phase', { id, ph });
    if (ph === 'moment') return;
    if (id === 'har' && ph === 'courses') setTimeout(() => { if (!whole && !momentBusy && !overlay) W.focus('har', 1300); }, 900 * F);   // ── flow9 ── (DESIGN9 16:27) M6 → M7: the walls' frame once the rocks are gone
    // ── director13 ── (PRODUCER13 N82: "in a picked demo the Mount has 0 crews: 150 s → 1 stone", so its course end, the beat and the
    // level never came) a demo stage picked at the Mount gets two crews once its rocks are cleared (the rocks stay the player's)
    if (id === 'har' && ph === 'courses' && G.demo && G.ftue >= 99 && !reelOn() && G.story && G.story.demoJump && S.crewsAt(G, 'har') < 2) {
      while (S.crewsAt(G, 'har') < 2) G.crews.push({ at: 'har' });
      syncCrews(true); emit('demoCrews', { id: 'har', n: S.crewsAt(G, 'har') });
    }
    // ── director13 ── (C3, PRODUCER-S13a d1-17: the first frame of the Mount's courses had the treadwheel in the foreground and him cut
    // at the bottom — it was built while the world still dug the bay and moved the crane; "the frame 10 s later is right") once the
    // world has posed the bay, the frame again (the bay from the plaza side, the crane behind him)
    // (registered after the world has the new phase: a site posed before its bay is dug answers at once)
    if (id === 'har' && ph === 'courses' && W.has('onPosed')) setTimeout(() => W.onPosed('har', (ok) => { if (ok && !whole && !momentBusy && !overlay && !hero.busy && !looking() && tNow() >= camHold && curWork() === 'har') { emit('reframe', { id: 'har', why: 'posed' }); workFrame('har', 900); } }, 8000), 1400 * F);
    sfx.play('creak');
    const say = { dig: `המדידה הושלמה: ${digWords(id).say}`, courses: 'היסוד מוכן: מתחילים את הנדבכים', finish: 'כל הנדבכים עומדים: עכשיו הגימור', inspect: 'הבנייה הושלמה: עכשיו הבדיקה' }[ph];
    // (FUN P1: at the Mount's first stone the pill and the pointing hand speak alone — no toast over them in the tutorial)
    if (say && !(id === 'har' && ph === 'courses' && G.ftue < 99)) ui.toast({ icon: 'crew', title: `${stageById(id).n} · ${PH_N[ph]}`, body: say, kind: 'mini', ms: 2600 });
    if (ph === 'dig' && !G.story['plan_' + id]) { G.story['plan_' + id] = 1; planCard(id); }
    // the storm around Nikanor's doors (Yoma 38a), told when his gate's bronze doors are next (KINGS sails the voyage itself)
    if (id === 'nikanor' && ph === 'finish' && !G.story.nikanor && !G.demo) { G.story.nikanor = 1; persist(); setTimeout(() => storyPages(STORY.nikanor), 1200 * F); }
    syncSite(id, true);
  }
  /* a stone was set: the crane lifts it into its slot while the player watches (SITE liftStone, ≤ 1 in flight per site) */
  const lifting = {}, liftDirty = {};
  function stoneLift(id, great) {
    if (whole) return;   // (the world is the finished House until exitWhole resyncs)
    if (!W.has('liftStone')) { syncSite(id); return; }
    if (lifting[id]) { liftDirty[id] = true; return; }
    lifting[id] = true;
    W.liftStone(id, { great: !!great }).then(() => { lifting[id] = false; liftDirty[id] = false; syncSite(id, true); });
  }
  /* The site in the world: SITE's setWork (phase, stones, stock, the finish), or setStage(fraction) on an older world. */
  const infoCache = {}, sentW = {};
  function siteInfo(id) {
    if (!(id in infoCache)) { const i = W.siteInfo(id); infoCache[id] = i && i.stones > 0 ? i : null; }
    return infoCache[id];
  }
  function syncSite(id, force, instant) {
    const s = G.st[id];
    if (!s || s.done) return;
    if (whole) return;   // (the whole-Temple view shows the finished House: a site's sync would strip the Mount's plaza under it — the owner, 28.9; exitWhole resyncs)
    if (!W.has('setWork')) {
      const p = S.progressOf(G, id);
      if (force || sentW[id] == null || Math.abs(sentW[id] - p) >= 0.004) { sentW[id] = p; W.setStage(id, 'building', p); }
      return;
    }
    if (lifting[id]) { liftDirty[id] = true; return; }
    const v = S.siteView(G, id), info = siteInfo(id), real = info ? info.stones : v.n;
    const phase = v.ph === 'survey' || v.ph === 'dig' ? v.ph : v.ph === 'courses' ? (v.set ? 'courses' : 'foundation') : 'finish';
    const o = { phase, stones: Math.round((v.set / v.n) * real), stock: Math.min(24, v.stock), ghost: 3, finish: v.ph === 'finish' ? v.fd / Math.max(1, v.fin) : v.ph === 'inspect' || v.ph === 'moment' ? 1 : 0 };
    const k = `${o.phase}|${o.stones}|${o.stock}|${o.finish.toFixed(2)}`;
    if (!force && sentW[id] === k) return;
    sentW[id] = k;
    if (instant) o.instant = true;   // ── flow11 ── (N34) a load: the site as it stands at once (SITE11: the count landed, the crane posed)
    W.setWork(id, o);
  }
  /* no stones in the stock: a tap says what the next step needs and where to get it (never a swallowed tap) */
  function noStock(id) {
    const a = S.nextAction(G), s = G.st[id];
    // ── flow11 ── (N36) the line goes into the sheet, under its bar — the float was drawn over the sheet it opened; (N58) only when
    // the stones' stock is what is empty: in the courses (the dig's and a finish's steps are paid in silver, cedar…, not stones)
    ui.openSheet('stage', id, s && s.p === 'courses' ? (a.kind === 'build' ? 'המלאי ריק: שלם על המקטע הבא' : 'המלאי ריק') : '');
  }
  function workAt(id) {
    if (!S.isWorkable(G, id)) return false;
    G.focus = id;
    const j = S.jobOf(G, id);
    if (j && j.kind === 'boulders') { const bi = nextBoulder(); return bi >= 0 ? tap({ boulder: bi }) : false; }
    if (!j || !j.need) return onSiteTap(id);
    // FUN P0-1: a segment's first stone goes up by the player's own crane (a quick lift, ~5 s) — skill, not a 25th tap
    if (j.kind === 'stone' && j.i % SEG === 0 && !(G.st[id].k > 0) && !hero.busy && fnOf(parts().minigames, 'runMinigame') && !reelOn() && !JB.loopOn(G, id)) { quickLift(id); return true; }   // ── fun14 ── (in the loop a free tap strikes: no quick lift)
    return tap({ id });
  }
  /** the precision games' level: FUN's mgLevel follows the player's recent quality (FUN P0-2); a mild ramp without it */
  function mgLevel(kind) { const L = parts().fun; try { if (L && typeof L.mgLevel === 'function') return Math.max(0, Math.min(4, L.mgLevel(G, kind) | 0)); } catch (e) { /* FUN's */ } return Math.min(2, Math.floor(G.stats.keys / 16)); }
  async function quickLift(id) {
    const j = S.jobOf(G, id), run = fnOf(parts().minigames, 'runMinigame');
    if (!j || j.kind !== 'stone' || momentBusy || overlay || !run) return;
    momentBusy = true; overlayOn(true); stopRing();
    let r = null;
    try { r = await guarded(run('crane', { root: ui.root || document.body, world, site: id, slot: W.nextSlot(id) || null, stones: 1, quick: true, level: mgLevel('crane'), seed: (SIDX[id] + 1) * 3331 + j.i, demo: reelOn(), onEvent: (t, d) => emit(t, d), sfx, haptic, reduced, ...twinCtx('key') }), 'minigames.quick'); }   // ── twin17 ── (twinCtx: the quick lift in the world too) ── /twin17 ──
    finally { momentBusy = false; overlayOn(false); }
    const out = S.quickSet(G, id);
    if (!out.ok) return;
    emit('stroke', { id, job: 'lift', perfect: !!(r && r.perfect) });
    strokeOutcome(id, j, out, anchorScreen(), !!(r && r.perfect));
  }
  /** ── flow10 ── (the owner, 28.9 21:42: "בשלב שיטוח ההר נדבך 5 השחקן נעלם") the Mount's course check: the builder walks to
      the course with his plumb and the camera frames him there over his shoulder, above the check's sheet (stages.checkView).
      The check's own frame looked from outside the face — into the outer bank, 15 amot over the Mount's first courses. */
  function checkStand(id) {
    // ── flow11 ── (the owner: "הכהן זז מנקודה לנקודה … שימשיכו ככה") every stage's course check: from his banker to the course
    // with his plumb and back — not the altar (whole stones, a wooden mallet; its "course" is the altar's own mass) nor the cast kiyor
    if (ALTAR.has(id) || id === 'kiyor' || !W.has('checkView') || !W.has('flyTo')) return null;
    const cv = W.checkView(id); if (!cv || !cv.spot || !Array.isArray(cv.p) || !Array.isArray(cv.t)) return null;
    if (id !== 'har') {   // (a stand that makes sense: near the course, on the ground at its foot — not on a roof, not in a pit)
      const sl = W.nextSlot(id), gy = W.groundAt(cv.spot.x, cv.spot.z);
      if (!sl || !Array.isArray(sl.face) || Math.hypot(cv.spot.x - sl.face[0], cv.spot.z - sl.face[2]) > 16 || Math.abs(gy - (sl.y - (sl.h || 1) / 2)) > 6) return null;
    }
    const run = hero.run = (hero.run || 0) + 1;
    hero.busy = true; hero.cur = null; hero.at = null; hero.atXZ = null;
    emit('checkStand', { x: Math.round(cv.spot.x), z: Math.round(cv.spot.z) });
    W.flyTo(cv.p, cv.t, 1100);
    // (he walks there while the check's sheet opens; his plumb strokes start once he stands)
    Promise.resolve(navGo({ x: cv.spot.x, z: cv.spot.z, face: [cv.target.x, cv.target.z] })).catch(() => {}).finally(() => { if (hero.run === run) hero.busy = false; });
    return cv;
  }
  /* the engineer's course check every two courses (FUN's plumb, ~10 s): a crooked key stone is found early */
  async function courseCheck(id) {
    if (!S.checkDue(G, id) || overlay) return;
    const run = fnOf(parts().minigames, 'runMinigame');
    if (run && !reelOn() && !momentBusy) {
      momentBusy = true; overlayOn(true); stopRing();
      let cv = null, beat = 0;
      try {
        cv = checkStand(id);
        // (the builder measures with his plumb while the player checks: a stroke every ~2 s)
        if (cv) beat = setInterval(() => { W.act('measure', cv.target, { shake: false }); }, 2100);
        await guarded(run('plumb', { root: ui.root || document.body, world, site: id, level: mgLevel('plumb'), seed: (SIDX[id] + 1) * 5557 + G.st[id].set, demo: reelOn(), onEvent: (t, d) => emit(t, d), sfx, haptic, reduced, check: 'courses', course: G.st[id] && PROJ[id] ? Math.floor(G.st[id].set / PROJ[id].P) : 0, ...(cv ? { look: () => {} } : {}), ...mgFacts('plumb'), ...twinCtx('check') }), 'minigames.check');   // ── twin17 ── (twinCtx: the check in the world under two thumbs) ── /twin17 ──   // ── director13 ── (+ course: the course just closed, for GAMES13's rounds)
      }
      finally { clearInterval(beat); momentBusy = false; overlayOn(false); }
      if (cv) { hero.at = null; hero.atXZ = null; W.heroTool('iron'); workFrame(id, 1300); }   // (back to his banker: keepAtWork walks him there)
    }
    const r = S.courseCheck(G, id);
    if (!r.ok) return;
    emit('check', { id, bad: r.bad.length, courses: true });
    persist();
    if (r.bad.length) { sfx.play('crack'); ui.toast({ icon: 'crew', title: 'בדיקת הנדבכים: אבן לא ישרה', body: 'מפרקים ומניחים אותה מחדש לפני האבן הבאה. זמן, לא חומר', ms: 3800 }); }
    else ui.toast({ icon: 'check', title: 'בדיקת הנדבכים: הכול ישר', body: 'המהנדס עבר עם האנך והפלס', kind: 'mini', ms: 2000 });
    syncSite(id, true); ui.refresh();
  }
  function doAction(a) {
    if (!a || !started || whole) return;
    if (loopTurn(a) && twinOn()) twinSheet = true;   // ── twin17 ── (the pill, tapped under two thumbs: the cards as the list, by choice) ── /twin17 ──
    if (loopTurn(a)) return loopGo(a.id, true);   // ── fun14 ── the course loop: the pill opens "מה נעשה עכשיו?" (the key stone's words on it: its card at once) ── /fun14 ──
    switch (a.kind) {
      case 'moment': return runMoment(a.id);
      case 'key': return keyStone(a.id);
      case 'inspect': return runInspect(a.id);
      case 'check': return courseCheck(a.id);
      case 'event': case 'work': return workAt(a.id);
      case 'build': return buildStep(a.id);
      case 'play': return playLevel(a);
      case 'deal': return openKings(null, { partner: a.partner, offer: a.offer });   // ── build7 ── (FUN7 P0) the king's contract
      case 'start': { const ok = startBuild(a.id); if (!ok) { W.focus(a.id); ui.openSheet('stage', a.id); } return; }
      case 'priests': ui.openSheet('crews'); return;
      default: if (a.id) { W.focus(a.id); ui.openSheet('stage', a.id); }
    }
  }
  /** the level that pays site id's next step (its shortfall only), or null when it is paid already */
  function playFor(id) {
    const st = S.statusOf(G, id);
    const step = st === 'avail' ? { cost: PROJ[id].sv ? { silver: PROJ[id].sv } : {} } : S.stepOf(G, id);
    if (!step) return null;
    const lack = S.lacking(G.res, step.cost), field = S.fieldFor(lack);
    return { kind: 'play', id, step: step.step, cost: step.cost, lack, field, need: S.needFor(lack, field) };
  }

  /* ───────── building ───────── */
  function startBuild(id) {
    const r = S.startBuild(G, id);
    if (!r.ok) {
      if (r.lack) ui.toast({ icon: 'silver', title: T.lacking, body: Object.entries(r.lack).map(([k, v]) => `${RES[k].n} ${isoNum(v)}`).join(', ') });
      return false;
    }
    persist();
    siteInfo(id);
    syncSite(id, true);
    lastWorkId = id;   // ── flow11 ── (curWork: a new site is his work — he walks to its survey)
    placeNext = 'now'; // ── flow11 ── (PRODUCER11 s3-10, N61: at the survey's start he was still on his way from the last site, off the new
                       //  site's frame, the camera over the plot) a new project is a new scene: he is at its survey at once
    if (id === 'har') W.setBoulders(G.bh);
    sfx.play('settle'); haptic(20);
    ui.closeSheet();
    ui.toast({ icon: 'crew', title: `${stageById(id).n}: פרויקט חדש`, body: 'ראשית מודדים. הקש על האתר', kind: 'mini' });
    syncCrews();                                        // ── crews ──
    ui.refresh();
    syncCrane(); hotspot();
    W.focus(id);
    emit('stageStart', { id });
    toolsReach(id);   // ── tools21 ──
    return true;
  }
  /** pay the site's next step from the meter: its stones fly onto the site's pile */
  function buildStep(id, quiet = false) {
    const r = S.payStep(G, id);
    if (!r.ok) {
      if (r.lack) { const a = playFor(id); if (a) playLevel(a); }
      return false;
    }
    G.focus = id;
    persist();
    const st = r.step;
    ui.flashRes(Object.keys(st.cost));
    sfx.play('coin'); sfx.play('creak'); haptic(15);
    const what = st.step === 'seg' ? (st.stones === 1 ? `${segWords(id, 1).n} הגיעה לאתר` : `${id === 'kiyor' ? segWords(id, st.stones).n : countTxt('stone', st.stones)} הגיעו לאתר`) : st.step === 'finish' ? `${st.n || 'שלב הגימור'}: החומרים באתר` : 'החפירה מתחילה';   // ── director13 ── (the kiyor: castings)
    if (!quiet) ui.toast({ icon: 'stone', title: stageById(id).n, body: what, kind: 'mini', ms: 2200 });
    emit('step', { id, step: st.step, cost: st.cost });
    syncSite(id, true);
    W.focus(id, 900);
    // ── flow8 ── (the owner, 28.9: "אחרי לחיצה אחת כבר כתבו הנח את אבן הפינה") the next step comes only after this one is seen
    // done: the stones arrive on the site (the pill says so, ~1.8 s), then the next prompt; a key stone is told once
    if (!quiet && st.step === 'seg') {
      holdUntil = tNow() + 1.8 * F; holdTxt = what;
      const gen = hero.gen;
      setTimeout(() => { if (gen !== hero.gen) return; ui.refresh(); keyTell(id); }, 1850 * F);
    }
    ui.refresh();
    if (G.ftue < 99) ftueStep(id, st);
    return true;
  }
  let holdUntil = 0, holdTxt = '';
  /** a key stone's first time: one line on the pill, never over the tutorial's own coach. ── flow9 ── in its game's verb
      (content.js keyWords): "אבן הפינה: אתה חוצב אותה" for the quarry, "האבן הגדולה: אתה מניח אותה במנוף" for the crane */
  function keyTell(id) {
    const a = S.nextAction(G);
    if (!a || a.kind !== 'key' || a.id !== id || G.ftue < 5) return;
    const k = 'key_' + (a.what || 'x') + (a.game && a.game !== 'crane' ? '_' + a.game : '');
    if (G.story[k]) return;
    if (/טיוטה/.test(ui.coachText || '')) { setTimeout(() => keyTell(id), 6000 * F); return; }   // ── flow16 ── (the mentor's line after a craft is read first) ── /flow16 ──
    G.story[k] = 1; persist();
    const text = keyWords(a).tell;
    coachAt('pill', text);
    setTimeout(() => { const b = ui.root && ui.root.querySelector('.gm-bub'); if (b && b.textContent.includes(text)) ui.coach(null, ''); }, 6000 * F);
  }
  function afterGain() { ui.refresh(); }

  /* ───────── the other agents' parts: MATCH3, KINGS, FUN (registered on globalThis.__BH_PARTS, or options.parts) ───────── */
  const parts = () => ({ ...(globalThis.__BH_PARTS || {}), ...(opt.parts || {}) });
  // ── econ14 ── (D2) the coins and אוצר המלאכה, in the game: the pay's flight to the purse, the first pay's card, the treasurer's
  // note, the mentor's word about the first purchase (once), the shop's purchases in 3D (SITE14's setOwned / stoneMark, guarded)
  // and in the music (music.js instruments). FUN14's playJob calls __BH_PARTS.econ.pay(out, {x, y}) after S.payJob.
  const wcall = (k, ...a) => { try { const w = world && typeof world[k] === 'function' ? world : world && world.stages && typeof world.stages[k] === 'function' ? world.stages : null; return w ? w[k](...a) : null; } catch (e) { console.warn('[econ14]', k, e); return null; } };
  const econRest = () => !G.demo && restAt(now());
  /** the site her stone goes to: the one being built in its courses (the focus first) */
  function econSite() { const f = S.focusOf(G); const ok = (id) => id && G.st[id] && !G.st[id].done && G.st[id].p === 'courses'; return ok(f) ? f : S.buildingSites(G).find(ok) || null; }
  function econShopCtx() { const site = econSite(); return { rest: econRest(), site, siteN: site ? `ב${stageById(site).n}` : '' }; }
  // ── tools21 ── the tools' tiers to the hero's model (look), the save's old stages earn silently, the float says the ×
  const toolSay = (text) => { try { ui.toast({ icon: 'star', title: text, kind: 'mini', ms: 2200 }); } catch (e) { /* the HUD's */ } };
  const stageIdxMax = () => { let m = -1; for (const k of Object.keys(G.st || {})) { const i = SIDX_T[k]; if (i != null && i > m) m = i; } return m; };
  function toolsSync() {
    try { TL.attach(G, toolSay); TL.earn(G, stageIdxMax()); wcall('setTools', Object.fromEntries(TL.IDS.map((id) => [id, TL.tierOf(G, id)]))); } catch (e) { console.warn('[tools21]', e && e.message); }
  }
  /** reaching stage `id`: the tools at tier 1 of its group get better, free, with a card */
  function toolsReach(id) {
    try {
      const up = TL.earn(G, SIDX_T[id] == null ? -1 : SIDX_T[id]); if (!up.length) return;
      persist(); toolsSync();
      ui.toast({ icon: 'star', title: 'הכלי שלך השתבח', body: up.map((k) => TL.nameOf(G, k)).join(' · ') + ' (ללא תשלום: על ההגעה לשלב)', ms: 6500 });
      emit('toolEarned', { id, tools: up });
    } catch (e) { console.warn('[tools21]', e && e.message); }
  }
  // ── /tools21 ──
  function econSync() {
    toolsSync();   // ── tools21 ──
    wcall('setOwned', SHOP.owned(G));
    try { const M = globalThis.__BH_MUSIC; if (M && typeof M.instruments === 'function') M.instruments(SHOP.instruments(G)); } catch (e) { /* the music's */ }
  }
  async function econPay(out, from) {
    if (!out || !(out.coins > 0) || !ui.root) return;
    const p = from && Number.isFinite(from.x) ? from : anchorScreen() || { x: innerWidth / 2, y: innerHeight * 0.55 };
    emit('coins', { n: out.coins, stars: out.stars | 0, id: out.id || null, first: !!out.first });
    if (out.course) { try { const M = globalThis.__BH_MUSIC; if (M && typeof M.course === 'function') M.course(); } catch (e) { /* the music's */ } }   // (her trumpets at a course's end)
    await ui.coins(out.coins, p.x, p.y);
    ui.refresh();
    if (out.first && !G.econ.card1) {
      G.econ.card1 = 1; persist();
      await ui.storyCard({ t: `השכר הראשון: ${out.coins} מטבעות`, q: PAY.first.q, ref: PAY.first.ref, d: `${PAY.first.d} ${PAY.first.more}. הקש על הארנק כדי לראות מה אפשר לקנות באוצר המלאכה.` }, PAY.shop.n);
    }
    econHint();
  }
  /** the mentor says it once (minutes 5–8): enough coins for something in אוצר המלאכה */
  function econHint() {
    if (G.econ.hint || econRest() || G.ftue < 99 || ui.busy) return;
    const site = econSite(), m = SHOP.canBuy(G, 'mark', { site }), c = m.ok ? { k: 'mark', price: m.price } : SHOP.cheapest(G, { site });   // (her stone first: the brainstorm's "יש לך מספיק לאבן עם הסימן שלך")
    if (!c || (G.res.silver || 0) < c.price) return;
    G.econ.hint = 1; persist();
    const it = SHOP.ITEMS[c.k];
    // (a toast in the mentor's name, not his bubble: the bubble's .coach-on moves the demo's strip — N93)
    ui.toast({ icon: 'star', title: `יש לך מספיק מטבעות ל${it.n === 'האבן שלי' ? 'אבן עם הסימן שלך' : it.n}!`, body: 'רב האומנים: הקש על הארנק למעלה, אוצר המלאכה', ms: 7000 });
    emit('shopHint', { k: c.k });
  }
  async function econBuy(k) {
    const site = econSite(), c = SHOP.canBuy(G, k, { rest: econRest(), site });
    if (!c.ok) { if (c.closed) ui.toast({ icon: 'star', title: 'שבת שלום', body: 'אוצר המלאכה סגור בשבת ובחג. שום דבר לא הולך לאיבוד', kind: 'mini' }); else if (c.locked) ui.toast({ icon: 'silver', title: 'אחרי השכר הראשון', body: 'בחר עבודה, ושכרך ישולם מיד', kind: 'mini' }); else if (c.lack) ui.toast({ icon: 'silver', title: `עוד ${isoNum(c.lack)} מטבעות`, body: SHOP.ITEMS[k].n, kind: 'mini' }); return; }
    let mark = null;
    if (k === 'mark') {   // she draws first; nothing is paid unless she keeps her mark
      const mg = parts().minigames; if (!mg || typeof mg.runFrame !== 'function' || !mg.drawMark) return;
      ui.closeSheet();
      const out = {};
      const r = await guarded(mg.runFrame(mg.drawMark, { root: ui.root || document.body, setup: { out }, quick: true, demo: reelOn(), sfx, haptic, reduced, onEvent: (t, d) => emit(t, d) }), 'econ.mark');   // (quick: no tiers' card for her mark)
      if (!r || r.skipped || !out.strokes || !out.strokes.length) return;
      mark = { strokes: out.strokes };
    }
    const r = SHOP.buy(G, k, { rest: econRest(), site, now: now() });
    if (!r.ok) return;
    persist(); sfx.play('coin'); ui.refresh();
    emit('buy', { k, n: r.n, price: r.price, first: G.shop.n === 1 });
    if (mark) { const at = wcall('stoneMark', site, mark); G.shop.markAt = G.shop.markAt || {}; G.shop.markAt[site] = at || 1; persist(); ui.toast({ icon: 'star', title: 'האבן שלך בדרך לנדבך', body: 'המנוף יניח אותה בנדבך הזה. תוכל למצוא אותה כשתחזור', kind: 'mini' }); }
    else ui.toast({ icon: 'star', title: `${SHOP.ITEMS[k].n}${r.n > 1 ? ` · ${r.n}` : ''}`, body: SHOP.ITEMS[k].d || 'הצטרף ללויים על הדוכן', kind: 'mini' });
    econSync();
    try { const M = globalThis.__BH_MUSIC; if (M && SHOP.LEVITES.includes(k) && typeof M.joined === 'function') M.joined(k); } catch (e) { /* the music's */ }
    if (SHOP.ITEMS[k].vine) { if (S.isDone(G, 'ulam')) W.setVine(S.vineSize(G)); else ui.toast({ icon: 'vine', title: 'הנדבה שמורה לגפן', body: 'כשהאולם ייבנה, היא תיתלה על הגפן שעל פתח ההיכל', kind: 'mini' }); }
    if (r.duchan) { try { const M = globalThis.__BH_MUSIC; if (M && typeof M.duchan === 'function') M.duchan(); } catch (e) { /* the music's */ } await ui.storyCard({ t: 'הדוכן שלם!', q: SHOP.DUCHAN.q, ref: SHOP.DUCHAN.ref, d: 'כל כלי הלויים שהמשנה מונה עומדים עכשיו על הדוכן.' }, PAY.shop.n); }
    if (ui.sheet === null && k !== 'mark') ui.openSheet('shop');
  }
  /** the treasurer's note, once per payment (state.js treasurer: a survey or a dig short only of coins) */
  setInterval(() => { const t = G && G.econ && G.econ.treLast; if (!t || !ui.root) return; G.econ.treLast = null; ui.toast({ icon: 'silver', title: PAY.treasurer.line, body: `${isoNum(t.n)} מטבעות · ${PAY.treasurer.ref}`, kind: 'mini' }); }, 1000);
  try { const P = globalThis.__BH_PARTS || (globalThis.__BH_PARTS = {}); P.econ = { pay: (out, from) => econPay(out, from), course: (from) => { const o = S.payCourse(G); persist(); econPay(o, from); return o; }, sync: econSync, shop: () => ui.openSheet('shop') }; } catch (e) { /* a frozen global */ }
  // ── /econ14 ──
  const fnOf = (o, name) => (o && typeof o[name] === 'function' ? o[name].bind(o) : null);
  async function guarded(p, name) {
    try { return await p; } catch (e) { console.warn(`[game] ${name} failed`, e); return null; }
  }
  const cardBody = (t, d, extra = '') => `<div class="gm-kick">${esc(t.kick || '')} <span class="gm-draft">${T.draft}</span></div><h2>${esc(t.title || '')}</h2><p>${d}</p>${extra}`;
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  const resLine = (o) => Object.entries(o || {}).filter(([, v]) => v > 0).map(([k, v]) => countTxt(k, v, true)).join(' · ');   // (build7: "+40 אבנים")
  let overlay = false;                     // a full-screen part is open (a level, a key stone's game, the kings)
  let held = false;                        // ── build7 ── the 3D loop is held under a board or a court (no lift can play then)
  function overlayOn(on, hold = false) {
    overlay = on;
    held = !!(on && hold);
    // build6: only a full-screen board (MATCH3) or court (KINGS) holds the 3D loop; FUN's precision games are bottom sheets
    // over the live site (the world keeps rendering under them)
    if (on && !hold) return;
    if (hooks.pauseWorld) { try { hooks.pauseWorld(on); } catch (e) { /* host */ } } else W.pauseRender(on);
  }

  /* The pre-step level (MATCH3's runLevel): its goal is the step's shortfall; everything gathered goes to the meter,
     and a step it made affordable is paid at once (its stones go onto the site's pile). */
  async function playLevel(a) {
    if (!started || whole || momentBusy || overlay) return;
    const field = a.field || 'quarry', need = a.need || {};
    // ── fun12 ── the quarry's cycle (src/games/cycle.js): the board, then other games that fit the work, then the board again,
    // longer and harder. Every game answers in the board's shape through the one path below (m3collect → the live meter,
    // grantLevel, starBonus, m3Won/m3Lost); its place is saved in G.games.cycle. Without the games part: the board, as before.
    const M = parts().match3, run0 = fnOf(M, 'runLevel');
    const CY = null;   // ── flow16 ── fun12's cycle retired from the big button (the owner, 4.10: "משחקי ביניים די דביליים"): the board alone; the period games stay at their table and in the menu ── /flow16 ──
    const pay = (boardPays(a) || boardPays({ ...a, need: { stone: 1 } }) || {}).n || 0;   // (the meter's "▶ שחק" has no need: the quarry's stone pay)
    const run = CY ? (c) => CY.run(c, { board: run0, pay, runMinigame: fnOf(parts().minigames, 'runMinigame'), save: persist }) : run0;
    // ── /fun12 ──
    momentBusy = true; overlayOn(true, true);
    ui.closeSheet(); ui.coach(null, ''); stopRing(); ui.clearFloats();
    emit('m3ask', { field, need, id: a.id || null });
    const setBefore = S.buildingSites(G).reduce((n, x) => n + ((G.st[x] && G.st[x].set) || 0), 0);
    // ── build7 ── the crews keep setting stones while the board is open (PLAYTEST-S6 #4, owner ⚑1): the board's material reaches
    // the meter as it is gathered (MATCH3's m3collect), the segment it was played for is paid the moment it is covered, and the
    // crews set its stones while you play. What was credited live is not granted twice at the close.
    const live = { raw: {}, paid: 0, stones: 0, on: !!(a.id && S.isWorkable(G, a.id)) };
    const onCollect = (d) => {
      if (!live.on || !d || !(+d.n > 0) || !RES[d.res]) return;
      const n = +d.n, k = need.wstone && d.res === 'stone' ? 'wstone' : d.res;
      live.raw[d.res] = (live.raw[d.res] || 0) + n;
      S.gain(G, { [k]: n * (G.demo ? DEMO_LEVEL : 1) });
      const j = S.jobOf(G, a.id);
      if (!live.paid && j && j.kind === 'pay' && j.step === 'seg' && S.canAfford(G.res, j.cost)) {
        const pr = S.payStep(G, a.id);
        if (pr.ok) { live.paid = 1; live.stones += pr.step.stones || 0; G.focus = a.id; emit('step', { id: a.id, step: 'seg', cost: pr.step.cost, live: true }); }
      }
    };
    let r = null;
    try {
      if (run) {
        r = await guarded(run({
          root: ui.root || document.body, field, need, demo: reelOn() || !!globalThis.__M3_AUTO, sfx, haptic, map: false,   // (__M3_AUTO: test runs, the board plays itself)
          onEvent: (type, data) => { if (type === 'm3collect') { try { onCollect(data); } catch (e) { /* the board goes on */ } } emit(type, data); },
          save: { get: () => G.m3, set: (m3) => { G.m3 = m3 && typeof m3 === 'object' ? m3 : {}; persist(); } },
          ...(need.wstone ? { place: 'beitkerem' } : {}),
          ...(() => { const L = parts().fun; try { const d = L && typeof L.m3Daily === 'function' ? L.m3Daily(now(), G) : null; return d ? { daily: d } : {}; } catch (e) { return {}; } })(),
        }), 'match3.runLevel');
      }
      if (!r || typeof r !== 'object') r = await levelCard(field, need);
    } finally { momentBusy = false; overlayOn(false); }
    // ── fun12 ── the cycle moves on (a declined start does not)
    if (CY) { try { CY.done(r); } catch (e) { /* the cycle is never load-bearing */ } }   // ── flow16 ── (never: CY is null) ── /flow16 ──
    // ── /fun12 ──
    // (build7) what the board brought = what it reports; the part already credited live is taken off (never below zero)
    const liveAdd = {};
    for (const [k, v] of Object.entries(live.raw)) liveAdd[need.wstone && k === 'stone' ? 'wstone' : k] = v * (G.demo ? DEMO_LEVEL : 1);
    if (r && r.collected && Object.keys(live.raw).length) { const c = { ...r.collected }; for (const [k, v] of Object.entries(live.raw)) c[k] = Math.max(0, (+c[k] || 0) - v); r = { ...r, collected: c }; }
    if (G.demo && r && r.collected) { const c = {}; for (const [k, v] of Object.entries(r.collected)) c[k] = (+v || 0) * DEMO_LEVEL; r = { ...r, collected: c }; }   // (#demo: a level pays ×5, the arc fits 15 minutes)
    live.on = false;
    const add = S.grantLevel(G, r, need, a.id, { bonus: false });
    for (const [k, v] of Object.entries(liveAdd)) add[k] = (add[k] || 0) + v;   // (the toast and FUN's beats see the whole board)
    const bonus = S.starBonus(G, r, a.id, add);   // a 3★ board pays a third segment (on top of what it brought)
    if (bonus) { S.gain(G, bonus); for (const [k, v] of Object.entries(bonus)) add[k] = (add[k] || 0) + v; }
    persist();
    ui.flashRes(Object.keys(add));
    if (Object.keys(add).length) { sfx.play('coin'); ui.toast({ icon: Object.keys(add)[0], title: `${FIELD_N[field] || ''}: ${bonus ? 'שלושה כוכבים!' : r.won ? 'ניצחת!' : 'נאסף'}`, body: resLine(add) + (bonus ? ' · כולל מקטע שלישי' : ''), kind: 'mini', ms: 2600 }); }
    // (MATCH3 P2: declined at the start card — "חזרה לבנייה" — is no loss for FUN's beats)
    if (r.quit && !(r.attempts > 0)) emit('m3Declined', { field, level: r.level || 0 });
    else emit(r.won ? 'm3Won' : 'm3Lost', { field, level: r.level || 0, stars: r.stars || 0, collected: add });
    if (r.won) taskHit('level');
    // FUN P0-1 (c): the site grew while you played (build7: in words, one toast in the queue)
    const setAfter = S.buildingSites(G).reduce((n, x) => n + ((G.st[x] && G.st[x].set) || 0), 0), grew = setAfter - setBefore;
    if (grew > 0) ui.toast({ icon: 'crew', title: `בזמן שחצבת: הצוותים הניחו ${grew === 1 ? 'אבן אחת' : countTxt('stone', grew)}`, kind: 'mini', ms: 3000 });
    // the step it was played for (paid already if the board covered it while open); a 3★ board: up to a third segment (build7)
    const id = a.id;
    if (id && S.isWorkable(G, id)) {
      let segs = live.paid, stones = live.stones;
      const want = bonus ? 3 : 1;
      for (let k = 0; k < 3; k++) {
        const st = S.stepOf(G, id);
        if (!st || !S.canAfford(G.res, st.cost)) break;
        if (k > 0 || live.paid) { if (st.step !== 'seg' || segs >= want) break; }
        if (!buildStep(id, true)) break;
        if (st.step === 'seg') { segs++; stones += st.stones || 0; } else { stones = -1; break; }
      }
      if (stones > 0) ui.toast({ icon: 'stone', title: stageById(id).n, body: stones === 1 ? `${segWords(id, 1).n} הגיעה לאתר` : `${id === 'kiyor' ? segWords(id, stones).n : countTxt('stone', stones)} הגיעו לאתר`, kind: 'mini', ms: 2200 });   // ── director13 ── (the kiyor: castings)
      else if (stones < 0) { const j = S.jobOf(G, id); ui.toast({ icon: 'stone', title: stageById(id).n, body: j && j.kind === 'finish' ? `${j.n || 'שלב הגימור'}: החומרים באתר` : 'החפירה מתחילה', kind: 'mini', ms: 2200 }); }
      if (live.paid) syncSite(id, true);
    } else if (id && S.statusOf(G, id) === 'avail' && S.canAfford(G.res, PROJ[id].sv ? { silver: PROJ[id].sv } : {})) startBuild(id);
    if (G.ftue < 99) ftueLevel();
    ui.refresh();
    return r;
  }
  /* no match-3 in this build: a short card that grants the step's need (and a little over) */
  async function levelCard(field, need) {
    const got = {};
    for (const [k, v] of Object.entries(need)) got[k] = Math.ceil(v * 1.2);
    if (!Object.keys(got).length) got[field === 'forest' ? 'cedar' : field === 'gold' ? 'gold' : 'stone'] = 20;
    if (G.demo) await sleep(700 * F);
    else await ui.modal(cardBody({ kick: 'משחק האוצר', title: FIELD_N[field] || '' }, `הצוות אסף: <b>${resLine(got)}</b>`), { buttons: [{ label: 'אסוף', value: true, gold: true }] });
    return { won: true, stars: 1, collected: got, level: 0, field };
  }

  /* A key stone: the player's own hands (FUN's precision game). The course waits for it. */
  async function keyStone(id) {
    const j = S.jobOf(G, id);
    if (!j || j.kind !== 'key' || momentBusy || overlay || whole) return;
    G.focus = id;
    const mg = parts().minigames, run = fnOf(mg, 'runMinigame');
    momentBusy = true;
    ui.closeSheet(); ui.coach(null, ''); stopRing(); ui.clearFloats();
    W.focus(id, 900);
    // ── flow9 ── (DESIGN8B 11:03 · M8/M11) the words are the game's: the crane sets "האבן הגדולה"; the quarry hews "אבן הפינה"
    const kw = keyWords(j, j.i === 0), what = kw.def, hewn = j.game === 'quarry';
    emit('keyAsk', { id, game: j.game, what: j.what });
    let r = null;
    try {
      if (run) {
        overlayOn(true);
        r = await guarded(run(j.game, { root: ui.root || document.body, world, site: id, slot: W.nextSlot(id) || null, level: mgLevel(j.game), seed: (SIDX[id] + 1) * 1000 + j.i, demo: reelOn(), onEvent: (t, d) => emit(t, d), sfx, haptic, reduced, what: j.what, ...(kw.kicker ? { kicker: kw.kicker } : {}), ...mgFacts(j.game), ...twinCtx('key') }), 'minigames.runMinigame');   // ── twin17 ── (twinCtx, fix round: the first-time flow's key stones in the world under two thumbs) ── /twin17 ──
        overlayOn(false);
      }
      if (!r || typeof r !== 'object') {
        if (G.demo) await sleep(500 * F);
        else await ui.modal(cardBody({ kick: stageById(id).n, title: what }, ALTAR.has(id) ? 'אבני המזבח באות שלמות מבקעת בית כרם, שלא הונף עליהן ברזל. בחר רק שלמות; פגומה — הצידה.' : hewn ? 'את האבן הזאת חוצב הבנאי בעצמו מן הסלע, ישרה ושלמה. אחר כך העגלה מביאה אותה והמנוף מניח אותה.' : j.game === 'dress' ? 'את האבן הזאת מסתת הבנאי בעצמו: שוליים ישרים, בדיוק על הקו.' : 'את האבן הזאת מניח הבנאי בעצמו: ישרה, בדיוק על הקו.', `<small class="gm-muted">${ALTAR.has(id) ? 'משנה מדות ג, ד' : 'פרשנות של המשחק'}</small>`), { buttons: [{ label: kw.act, value: true, gold: true }] });
        r = { ok: true, quality: 0.8, perfect: false };
      }
    } finally { momentBusy = false; if (overlay) overlayOn(false); }
    const out = S.setKey(G, id, r);
    if (!out.ok) return;
    emit('keyStone', { id, kind: j.game, what: j.what, quality: out.q, perfect: !!r.perfect });
    if (r.perfect) { sfx.play('perfect', { combo: 6 }); HK.onWeek && HK.onWeek('perfect'); }
    const how = uxHow(out.q);   // ── ux24 ── ── /ux24 ──
    if (hewn) deliverKey(id, j, kw, how);   // M11: hewn → the cart brings it → the crane sets it
    else ui.toast({ icon: 'star', title: `${what}: במקומה`, body: how, kind: 'mini', ms: 2600 });
    strokeOutcome(id, j, out, anchorScreen(), !!r.perfect);
  }
  /** ── flow9 ── (STAGING M11) a key stone the player hewed in the quarry: the ox cart brings it down the quarry road and the
      crane sets it (SITE9's `deliverKeyStone(id, {what})`, guarded, ≤ 45 s). The next prompt waits on the pill; the site's
      drawing waits for the landing (the lift lock), so the stone is seen arriving, not popping in. Without it: v17's lift. */
  function deliverKey(id, j, kw, how) {
    const gen = hero.gen;
    ui.toast({ icon: 'stone', title: `${kw.def} נחצבה`, body: W.has('deliverKeyStone') ? 'העגלה מביאה אותה, והמנוף יניח אותה' : how, kind: 'mini', ms: 2600 });
    if (!W.has('deliverKeyStone')) return;
    lifting[id] = true; liftDirty[id] = true;
    holdUntil = tNow() + 46; holdTxt = `${kw.def} בדרך לאתר`;   // (the settle resolves ≤ 45 s; done() lifts it)
    camHold = tNow() + 46;                              // (DESIGN9 16:27) the world holds the shot: the cart's lane, the pile, the crane
    emit('keyDeliver', { id, what: j.what, at: 'start' });
    const done = (ok) => {
      if (holdTxt === `${kw.def} בדרך לאתר`) holdUntil = 0;
      camHold = tNow() + 1;                             // (+ 1 s: the world's shot ends on the bay)
      lifting[id] = false; liftDirty[id] = false;
      emit('keyDeliver', { id, what: j.what, at: 'end', ok });
      if (gen !== hero.gen) return;
      syncSite(id, true); ui.refresh(); markSync();
      ui.toast({ icon: 'star', title: `${kw.def}: במקומה`, body: how, kind: 'mini', ms: 2600 });
      // ── flow11 ── (K80, by touch: after the corner stone's delivery the world's shot stayed on the bay, he 62 px at 67 amot) his
      // work frame again once the world's hold ends
      setTimeout(() => { if (gen === hero.gen && !whole && !momentBusy && !overlay && !looking() && curWork() === id) workFrame(id, 900); }, 1100);
    };
    W.deliverKeyStone(id, { what: j.what }).then(() => done(true), () => done(false));
  }

  /* The stage's inspection (FUN's plumb): a key stone set badly is found and reset — time, never material. */
  async function runInspect(id) {
    const j = S.jobOf(G, id);
    if (!j || j.kind !== 'inspect' || momentBusy || overlay || whole) return;
    const mg = parts().minigames, run = fnOf(mg, 'runMinigame');
    momentBusy = true; ui.closeSheet(); stopRing();
    W.focus(id, 900);
    try {
      let r = null;
      if (run) { overlayOn(true); r = await guarded(run('plumb', { root: ui.root || document.body, world, site: id, level: mgLevel('plumb'), seed: (SIDX[id] + 1) * 7777, demo: reelOn(), onEvent: (t, d) => emit(t, d), sfx, haptic, reduced, ...mgFacts('plumb') }), 'minigames.runMinigame'); overlayOn(false); }
      if (!r && !reelOn()) await ui.modal(cardBody({ kick: stageById(id).n, title: 'הבדיקה' }, 'הבודק עובר עם האנך והפלס על כל אבן מיוחדת שהנחת.'), { buttons: [{ label: 'בדוק', value: true, gold: true }] });
    } finally { momentBusy = false; if (overlay) overlayOn(false); }
    const r = S.inspect(G, id);
    if (!r.ok) return;
    emit('check', { id, bad: r.bad.length });
    persist();
    if (r.bad.length) {
      sfx.play('crack');
      ui.toast({ icon: 'crew', title: `נמצאו ${isoNum(r.bad.length)} אבנים לא ישרות`, body: 'מפרקים ומניחים מחדש. זה עולה זמן, לא חומר. הקש על האתר', ms: 4200 });
      syncSite(id, true); ui.refresh();
      return;
    }
    sfx.play('chime', { combo: 10 });
    ui.toast({ icon: 'star', title: `${stageById(id).n}: הבדיקה עברה`, body: 'הכול ישר ועומד', kind: 'mini' });
    if (r.reached === 'ready') { syncSite(id, true); runMoment(id); }
    else if (r.reached === 'done') completeFlow(S.completeStage(G, id), true);
    ui.refresh();
  }

  /* The kings of the nations (KINGS): the map and the courts; deliveries arrive by settle(). */
  async function openKings(arrivals, pick) {
    if (!started || whole || momentBusy || overlay) return;
    const K = parts().kings, run = fnOf(K, 'openCourt');
    if (!run) {
      ui.modal(cardBody({ kick: 'מלכי האומות', title: 'עסקים עם המלכים' }, 'סוחרי צור מביאים ארזים לים יפו, מקפריסין באה נחושת, ומלכים ומלכות תרמו זהב. בקרוב: הצי והשיירות.', '<small class="gm-muted">עזרא ג, ז · משנה יומא ג, י</small>'));
      return;
    }
    momentBusy = true; overlayOn(true, true); ui.closeSheet(); stopRing();
    const need = (() => { const a = S.nextAction(G); return a.lack || {}; })();
    try {
      await guarded(run({
        root: ui.root || document.body, G, now, demo: !!G.demo, sfx, needs: need, rest: G.demo ? false : (t) => restAt(t), ...(arrivals ? { arrivals } : {}), ...(pick && pick.partner ? { partner: pick.partner, offer: pick.offer } : {}),
        apply: (delta) => {
          const d = delta || {};
          if (!Object.entries(d).every(([k, v]) => v >= 0 || (G.res[k] || 0) + v >= -1e-6)) return false;
          for (const [k, v] of Object.entries(d)) if (k in G.res) G.res[k] = Math.max(0, (G.res[k] || 0) + v);
          persist(); ui.flashRes(Object.keys(d)); ui.refresh();
          return true;
        },
        onEvent: (t, d) => { emit(t, d); if (t === 'kingsDeal') emit('deal', d); if (t === 'kingsUnload') emit('delivery', d); },
      }), 'kings.openCourt');
    } finally { momentBusy = false; overlayOn(false); }
    persist(); ui.refresh();
  }
  /* a site event of the supply: the first cedar shortage (a finish step waits for cedar) says where cedar comes from, once */
  function shortageBeat() {
    if (G.story.cedar || G.ftue < 99 || ui.busy || momentBusy) return;
    const a = S.nextAction(G);
    if (a.kind !== 'play' || !(a.lack && a.lack.cedar)) return;
    G.story.cedar = 1; persist();
    ui.toast({ icon: 'cedar', title: 'מחסור בארז', body: 'ארזים באים מיער הלבנון (משחק האוצר) או ברפסודות מצור אל ים יפו (המלכים)', ms: 6000 });
    emit('event', { kind: 'cedar', id: a.id });
  }
  let kingsSeen = 0;
  function kingsTick(t) {
    const K = parts().kings, st = fnOf(K, 'settle');
    if (!st) return;
    let due = null;
    try { due = st(G, t); } catch (e) { return; }
    const n = Array.isArray(due) ? due.length : 0;
    if (n > 0) {
      persist(); sfx.play('coin');
      ui.toast({ icon: 'caravan', title: n > 1 ? `${isoNum(n)} משלוחים הגיעו` : 'משלוח הגיע מן המלכים', body: 'פתח את "מלכים" למטה כדי לפרוק אותם', kind: 'mini', ms: 5200 });
      emit('kingsArrived', { n });
    }
    kingsSeen += n;
  }

  /* The survey is done: the plan of the stage (Middot as the blueprint), once per stage. */
  function planCard(id) {
    if (reelOn() || opt.fast || G.ftue < 99) return;
    const d = stageById(id);
    if (d.card) storyWait = { plan: id };
  }

  /** A stage completed (by a strike, by a crew, by a moment, or offline). */
  function completeFlow(c, live) {
    if (!c) return;
    const d = stageById(c.id), gen = hero.gen;
    persist();
    W.setStage(c.id, 'done', 1);
    if (!d.quiet) { W.celebrate(c.id); if (!(JU && TW && TW.on)) sfx.play('fanfare'); haptic([30, 40, 60]); } else sfx.play('solemn');   // (the supervisor, wave 18: under two thumbs juice.big's 'big' says it — the two together passed the +10 dB ceiling)
    W.crewsCheer(c.id); syncCrews();                    // ── crews ── they cheer, then go to their next site
    W.hotspot(null);
    if (hero.at === c.id) hero.at = null;
    stopRing();
    for (const s of STAGES) if (s.deps.includes(c.id) && S.statusOf(G, s.id) === 'avail') W.setStage(s.id, 'avail', 0);
    if (c.id === 'har') setTimeout(() => { if (gen === hero.gen) W.setBoulders(G.bh); }, 1500);
    if (c.id === 'ulam') W.setVine(S.vineSize(G));
    if (c.id === 'heichal') W.shine();
    syncCrane();
    HK.onWeek('site');
    emit('stageDone', { id: c.id, chapter: c.chapter });
    quietUntil = Math.max(quietUntil, tNow() + (d.quiet ? 1.4 : 1.8));   // ── flow11 ── (N67) its cards are coming
    if (live) setTimeout(() => { if (gen === hero.gen) { if (!d.quiet) W.orbit(c.id, 3); cardsFor(c); } }, d.quiet ? 900 : 1300);
    ui.refresh();
  }
  const cardsShown = new Set();
  async function cardsFor(c) {
    if (cardsShown.has(c.id)) return;
    cardsShown.add(c.id);
    await ui.stageDoneCard(c, HK.stageDoneExtra(c));      // (hooks: the finds, what opens now and the chapter ladder are inside it)
    if (c.donor) await ui.donorCard(c.donor);
    if (c.chapter) {
      W.showcase();
      await ui.chapterCard(c.chapter);
      G.story['ch' + (c.chapter + 1)] = 1;
      emit('chapter', c.chapter);
    }
    if (c.id === 'karnot' && !c.all && !G.demo && await HK.avodahInvite('altar')) return;   // (QA P0-1: never in the investor demo — the reel continues)   // ── hooks ── the altar complete: the first service (Ezra 3:6); Phase B took over
    if (c.id === 'nashim' && !G.demo && await HK.mysteryInvite(persist)) return;   // ── hooks ── (round 3) the wood chamber built: the Ark's tradition as a mystery found in place (Shekalim 6:1–2)
    if (c.all && !G.celeb) await finale();
    if (c.id === 'har' && G.ftue < 99) ftueTo(6);
    // ── flow10 ── (GAMES10's hook) an in-between game's invitation after a stage's cards: at most once a day, never in the
    // first-time flow or the demo; it shows nothing when not due (resolves when its card closes)
    { const P = parts().games; if (P && typeof P.invite === 'function' && !reelOn() && G.ftue >= 99 && !whole) { try { await P.invite(G); } catch (e) { /* GAMES10's */ } } }
    const r = S.recommend(G);
    if (r.id && !whole && !(G.demo && HD.HIGHLIGHTS.some((h) => h.id === c.id))) W.focus(r.id);   // ── hooks ── (QA P2-20) the demo keeps a highlight's own shot until the next press
  }
  async function finale() {
    G.celeb = true; persist();
    sfx.play('fanfare'); sfx.ambience('crowd');
    await ui.storyCard(STORY.finale, T.finale);
    emit('finale');
    // ── world12 ── (requested on the bus, WORLD12.md: the supervisor decides) the night of light — main.js hooks.celebrate, the moment
    // 'chanukat' — before the invitation to Phase B, so the card does not cover the celebration
    if (typeof hooks.celebrate === 'function') { try { await hooks.celebrate(); } catch (e) { console.warn('[game] celebrate', e); } }
    // ── /world12 ──
    if (!G.demo) await HK.avodahInvite('finale');   // ── hooks ── Chanukat HaBayit: the service begins (Phase B); the demo ends on the finale itself
    else await HK.demoOutro();                       // ── hooks ── (round 3) …and then the outro: the two doors (the service, the tour)
  }

  /* ───────── key moments ───────── */
  let momentBusy = false;
  async function runMoment(id) {
    const d = stageById(id);
    if (momentBusy || !d || !G.st[id] || !G.st[id].ready) return;
    momentBusy = true;
    ui.closeSheet(); ui.coach(null, ''); stopRing(); ui.clearFloats();
    ui.momentOn(true);   // ── flow11 ── (PRODUCER11 N41: the dock over the card's hint, the pill "הרגע המיוחד מחכה לך" over the open moment)
    hooks.setAutoRotate && hooks.setAutoRotate(false);
    // ── flow11 ── the moment's own spot (SITE's workSpot(id, 'moment') → {x, z, face, kind: 'moment'}, when the world has one — v20's
    // answers any unknown kind with the survey spot, hence the kind): he walks to it — the key moment
    // in the world has its kohen in it (hero.run: a walk of keepAtWork's is cut)
    { const ms = W.workSpot(id, 'moment'); if (ms && ms.kind === 'moment' && typeof ms.x === 'number' && !hero.busy) { hero.run = (hero.run || 0) + 1; hero.at = null; hero.atXZ = null; navGo(asSpot(ms)); } }
    if (!W.momentFX('frame', id)) W.focus(id, 1200);   // ── moments ── the site framed above (or beside) the moment's card
    await sleep(900);
    emit('momentStart', { id });
    let r = { skipped: true };
    try { r = await playMoment(d.moment, {
      root: ui.root, text: MOMENTS[d.moment], sfx, haptic, reduced, T,
      world: { redLine: (y) => W.redLine(y), boxes: (t) => W.boxes(t), fx: (q, n) => W.strikeFX(id, q || 'normal', n || 0), tool: (k) => W.heroTool(k), momentFX: (k, a) => W.momentFX(k, a), vineN: S.vineSize(G) },   // ── moments ── the world beats of the key moments (moments.js)
      fmtSrc: srcHTML,
      bookNote: (M) => ui.noteMoment(M),   // ── land17 ── popups 'book': the end card's source goes to the book
      repeat: HK.momentRepeat(d.moment),   // ── hooks ── (round 3) the presenter's second demo on this device: a shorter replay once moments.js reads it
    }); } finally { momentBusy = false; ui.momentOn(false); quietUntil = tNow() + 2.5; }   // (── flow11 ── a moment that throws never leaves the HUD hidden; N67)
    HK.momentSeen(d.moment);               // ── hooks ──
    // the 3D side of the moment, in full view once the overlay is gone
    if (d.moment === 'redLine') W.redLine(0.5);        // the red cord round the altar, half its height (Middot 3:1)
    if (d.moment === 'boxes' && r.skipped) W.boxes(null);
    // ── build6 ── the kiyor's twelve spigots pour for the first time (WATER); the altar's channel runs once it is whole
    if (id === 'kiyor') kiyorFlow();
    if (id === 'karnot') { const wa = W.water(); if (wa && typeof wa.channel === 'function') { try { wa.channel(true); } catch (e) { /* optional */ } } }
    emit('moment', { id, skipped: r.skipped });
    if (!r.skipped && W.heroHas('gesture')) W.gesture('proud');   // ── build7 ── (PEOPLE7) the hero stands proud at a key moment's end
    const m = MOMENTS[d.moment];
    const fresh = m.find && !G.finds[m.find];
    if (fresh) G.finds[m.find] = 1;
    const c = S.momentDone(G, id);
    if (c) { const mp = S.payMoment(G, typeof r.quality === 'number' ? r.quality : r.skipped ? 0 : 0.8); c.coins = mp.coins; econPay(mp, null); }   // ── econ14 ── (D2) the moment ×2 ── /econ14 ──
    if (c && fresh) c.momentFind = m.find;
    if (c && r.skipped) c.momentSkipped = d.moment;   // ── hooks ── (round 3) a skipped moment keeps its fact: the stage card shows it
    persist();
    completeFlow(c, true);
  }

  /* ───────── crane / hotspot / time helpers ───────── */
  function syncCrane() { const r = S.recommend(G); const b = S.buildingSites(G); const id = hero.at && b.includes(hero.at) ? hero.at : (r.id && b.includes(r.id) ? r.id : b[0]); if (id) W.setCraneSite(id); }
  /* The quarry's piles show the stone in stock (one block per STONE_PER_BLOCK, up to 36), and its crews.
     Sent only when a number changes: each call rebuilds the world's props. */
  const STONE_PER_BLOCK = 25;
  let qBlocks = -1, qCrews = -1;
  function syncQuarry(force) {
    if (whole) return;
    const blocks = Math.min(36, Math.ceil(Math.max(0, G.res.stone) / STONE_PER_BLOCK)), crews = S.crewsAt(G, 'quarry');
    if (!force && blocks === qBlocks && crews === qCrews) return;
    qBlocks = blocks; qCrews = crews;
    W.setQuarryStock(blocks, crews);
  }
  function hotspot() { if (whole) return; const r = S.recommend(G); W.hotspot(r.kind === 'build' && r.id !== 'har' ? r.id : null); }
  // ── crews ── the crews, the caravans and the trainees, made visible (src/crews.js through the world): each number is
  // sent when it changes; force (load, a mode switch, after an absence) sends them all. A caravan goes to the site the
  // goal points to.
  const crewSent = {};
  function syncCrews(force) {
    if (whole) return;
    const t = now();
    // (each crew by its number in G.crews, so it keeps its colour wherever it works)
    const ids = (at) => { const a = []; G.crews.forEach((c, i) => { if (c.at === at) a.push(i); }); return a; };
    for (const s of STAGES) {
      const b = S.statusOf(G, s.id) === 'building', a = b ? ids(s.id) : [], j = b && a.length ? S.jobOf(G, s.id) : null;
      const waiting = !!j && !j.crew && j.kind !== 'boulders', v = a.join(',') + (waiting ? 'w' : ''), k = 's:' + s.id;
      if (force || crewSent[k] !== v) { crewSent[k] = v; W.heroSit(s.id, a.length, a, waiting ? { waiting: true } : null); }   // ── build6 ── crews at a site that waits for you sit and wait (PEOPLE)
    }
    const q = S.isDone(G, 'har') && !S.allDone(G) ? ids('quarry') : [], qv = q.join(',');
    if (force || crewSent.q !== qv) { crewSent.q = qv; W.setQuarry(q.length, q); }
    let site;
    for (const R of ROUTES) {
      const c = G.car.find((x) => x.r === R.id), st = !c ? 'none' : t >= c.t1 ? 'back' : 'out', key = st === 'out' ? 'out:' + c.t1 : st, k = 'c:' + R.id;
      if (!force && crewSent[k] === key) continue;
      crewSent[k] = key;
      if (site === undefined) { const r = S.recommend(G), b = S.buildingSites(G); site = r.id && b.includes(r.id) ? r.id : b[0] || null; }
      W.caravan(R.id, st === 'out' ? { status: 'out', left: c.t1 - t, total: c.t1 - c.t0, site } : { status: st, site });
    }
    const n = G.train.length;
    if (force || crewSent.t !== n) { crewSent.t = n; W.trainees(n); }
  }
  function fmtSpan(ms) { const s = Math.round(ms / 1000); if (s < 90) return `${s} שנ׳`; const m = Math.round(s / 60); if (m < 90) return `${m} דק׳`; return `${Math.round(m / 6) / 10} שע׳`; }

  /* ───────── daily tasks → the golden vine ───────── */
  function taskHit(kind, n = 1) {
    const r = S.taskProgress(G, kind, n);
    if (r.leaf) { sfx.play('leaf'); ui.toast({ icon: 'vine', title: `${T.leaf} ל${T.vine}`, body: r.grape ? 'וגם גרגיר: כל משימות היום הושלמו!' : 'משימה של היום הושלמה', kind: 'mini', ms: 2600 }); emit('leaf', r); }
    if (r.cluster) ui.toast({ icon: 'vine', title: 'אשכול לגפן הזהב!', body: 'שבעה ימים של משימות' });
    if (r.leaf && S.isDone(G, 'ulam')) W.setVine(S.vineSize(G));
  }

  /* ───────── FTUE: the first five minutes (GDD §3) ───────── */
  let ftueTimer = 0;
  function coachAt(where, text, who) {
    fixedPt.t = -1e9;
    // ── flow8 ── on the Mount the world target has its own pointer and ring (markSync): the coach keeps only its words there
    if ((where === 'boulder' || where === 'hero') && text) { markSync(); if (markT) { ui.coach(null, text, who); return; } }
    if (where === 'boulder') ui.coach(() => boulderScreen(FIRST_BOULDER), text, who);
    else if (where === 'hero') { if (hero.anchorT == null) captureAnchor(); ui.coach(() => { const p = ringPos(); return p; }, text, who); }   // (before the first stroke: the hand on the builder, not on the world's origin)
    else if (where === 'dock') ui.coach(() => { const t = performance.now(); if (t - fixedPt.t > 500) { fixedPt.t = t; fixedPt.x = dockX(1); fixedPt.y = dockY(); } return fixedPt; }, text, who);
    else if (where === 'pill') ui.coach(() => { fixedPt.x = innerWidth / 2; fixedPt.y = 118; return fixedPt; }, text, who);
    else ui.coach(null, text, who);
  }
  const dockY = () => { const n = ui.root && ui.root.querySelector('.gm-db'); const r = n && n.getBoundingClientRect(); return r && r.top < innerHeight / 2 ? r.bottom + 12 : innerHeight - 96; };   // ── hud18 ── (the dock is at the top in landscape: the hand points up at it from below) ── /hud18 ──
  const dockX = (i) => { const n = ui.root && ui.root.querySelectorAll('.gm-db')[i]; if (!n) return innerWidth / 2; const r = n.getBoundingClientRect(); return r.left + r.width / 2; };
  // per-frame anchors reuse these objects (no allocation while the coach follows a target)
  const fixedPt = { x: 0, y: 0, on: true, t: -1e9 };
  const bsc = { x: 0, y: 0, on: false };
  const BOULDER_T = BOULDER_XZ.map((_, i) => ({ boulder: i }));
  function boulderScreen(i) {
    const sp = W.screenPos(BOULDER_T[i], bsc);
    if (sp && typeof sp.x === 'number') { if (sp !== bsc) { bsc.x = sp.x; bsc.y = sp.y; bsc.on = sp.on !== false; } return bsc; }
    if (!view || !view.project) return null;
    const x = BOULDER_XZ[i][0], z = BOULDER_XZ[i][1];
    const p = view.project(x, W.groundAt(x, z) + 9, z);
    bsc.x = p.x; bsc.y = p.y; bsc.on = p.on;
    return bsc;
  }
  /* The first minutes (v6): the vision → measure the Mount → clear the rough hill → the first stone in your own hands
     (< 60 s) → the crew and your name → set the mentor's stones → the first level in the quarry. */
  async function runFtue() {
    const gen = hero.gen;
    if (G.ftue === 0) {
      if (S.statusOf(G, 'har') === 'avail') S.startBuild(G, 'har');
      persist();
      ui.refresh();
      // ── build7 ── the opening (once per new game): the finished House over the Old City at the golden hour, then the
      // flight down to the rough Mount; the Mount is set up at its swap. Without it (or on a reload) the Mount is set up now.
      const landed = opening ? await runOpening(gen) : (mountSetup(), false);
      if (gen !== hero.gen) return;
      emit('ftue', 0);
      if (landed) await openTitle;          // (the title and the plan came at the opening's swap, over the bare Mount)
      else {
        const plan = W.showPlan(2600 * F);
        await ui.vision(T.vision, 2200 * F);
        if (gen !== hero.gen) return;
        if (!plan) await sleep(200 * F);
        lookAtBoulder(FIRST_BOULDER, 1800);
      }
      ui.refresh();
      await sleep(900 * F);
      await heroInView(2500 * F);   // ── flow11 ── (PRODUCER10 N6: "the coach says 'measure' over the vision") after the camera lands on him
      if (gen !== hero.gen) return;
      ftueTo(1);
    } else resumeFtue();
  }
  /** ── flow11 ── resolves once the builder stands in the safe frame (the camera has come down to him), or after `ms` */
  function heroInView(ms) {
    const t0 = tNow();
    return new Promise((res) => {
      const chk = () => {
        const hp = W.heroPos(), q = hp && Number.isFinite(hp.x) && view && view.project ? view.project(hp.x, hp.y + 2, hp.z) : null;
        const p = q && { x: q.x, y: q.y, on: q.on }, f = p && view.project(hp.x, hp.y, hp.z);   // (one shared object: copied)
        const big = !!f && Math.abs(f.y - p.y) * 1.8 >= 30;   // (the vision's far frame has him on screen too, a few px tall)
        if (!p || (p.on && big && p.x > 24 && p.x < innerWidth - 24 && p.y > 110 && p.y < innerHeight - 130) || tNow() - t0 > ms / 1000) { res(); return; }
        setTimeout(chk, 120);
      };
      chk();
    });
  }
  function resumeFtue() {
    if (!S.isDone(G, 'har') && S.statusOf(G, 'har') !== 'building') { S.startBuild(G, 'har'); syncSite('har', true); W.setBoulders(G.bh); }
    const i = S.pickBoulder(G.bh, {}, bOrder);   // ── flow9 ── the field's path
    if (i >= 0 && G.ftue <= 2) { W.heroPlace({ boulder: i }); lookAtBoulder(i, 2400); }
    W.heroShow(true);
    ui.refresh();
    ftueTo(G.ftue, true);
  }
  /** the FTUE camera: close on one boulder with the builder beside it */
  function lookAtBoulder(i, dur) { boulderCam(i, dur); }   // ── flow8 ── (close, clear: boulderCam)
  /* ── build7 ── the opening (PLAYTEST-S6 #5, owner ⚑3): the first frame is the vision — the finished House over the Old City at
     the golden hour (WORLD7's BEAUTY.vision) — then a flight down to the rough Mount where the player starts ("כאן ייבנה הבית").
     6–8 s, a tap skips it, once per new game (G.op), #demo the same. WORLD7's world.vision({ms, restore, to}) when present,
     else the host's hooks.opening (main.js `// ── build7 ──`); with neither, the Mount is set up at once (the v15 start). */
  function openingDue() {
    if (G.op || G.ftue !== 0 || opt.noOpening || globalThis.__NO_OPENING) return false;
    return W.has('vision') || typeof hooks.opening === 'function';
  }
  function mountSetup() {
    syncSite('har', true);
    W.setBoulders(G.bh);
    W.heroPlace({ boulder: FIRST_BOULDER });
    W.heroShow(true);
  }
  /** the opening's last frame (FUN7 P1: "איפה אני?"): on the hero beside the first boulder, close enough that he stands ≥ 40 px
      tall on a phone (60 amot; ×1.35 portrait). Before the swap the hero has no spot yet (the boulders are not up): the boulder
      itself; the swap sets `to` again, in place, on the hero (the flight down starts after the swap). */
  function openingView(to = { p: [0, 0, 0], t: [0, 0, 0] }) {
    const [bx, bz] = BOULDER_XZ[FIRST_BOULDER], hp = swappedHero();
    // (PEOPLE7's hero.view frames him from his front-left — at a boulder that is through the rock he faces (merge shot 06:32):
    //  the opening keeps its own bearing, from over his shoulder with the boulder beside him)
    const x = hp ? hp.x : bx, z = hp ? hp.z : bz, y = W.groundAt(x, z) + 2.2, a = (25 * Math.PI) / 180, e = (26 * Math.PI) / 180;
    const d = typeof innerWidth === 'number' && innerHeight > 0 && innerWidth / innerHeight < 0.8 ? 60 * 1.35 : 60;
    to.p[0] = x + Math.cos(e) * Math.cos(a) * d; to.p[1] = y + Math.sin(e) * d; to.p[2] = z + Math.cos(e) * Math.sin(a) * d;
    to.t[0] = x; to.t[1] = y; to.t[2] = z;
    return to;
  }
  /** the hero's spot once he stands at the first boulder (null before: he is somewhere else, or the world has no hero) */
  function swappedHero() {
    const hp = W.heroPos(), [bx, bz] = BOULDER_XZ[FIRST_BOULDER];
    return hp && Number.isFinite(hp.x) && Number.isFinite(hp.z) && Math.hypot(hp.x - bx, hp.z - bz) < 14 ? hp : null;
  }
  let openSkip = null, openTitle = null;
  /** → true: the camera has landed at the first boulder (or was cut there by a skip) */
  async function runOpening(gen) {
    let swapped = false, skipped = false;
    const to = openingView();
    const restore = () => {                // the swap, exactly once: the rough Mount, the boulders, the hero, the real-clock light
      if (swapped) return; swapped = true;
      opening = false;
      if (gen !== hero.gen) return;
      syncWorld(null); W.heroPlace({ boulder: FIRST_BOULDER });   // (syncWorld: the stages, the Mount's site, its boulders, the hero)
      openingView(to);                    // the flight down ends on the hero, now that he stands at the boulder
      tod = null; syncTime();
      // "כאן ייבנה הבית." over the bare Mount among the city, with the plan in gold, while the camera comes down
      W.showPlan(2600 * F);
      openTitle = ui.vision(T.vision, 2000 * F, true);   // (in the sky, above the Mount)
      emit('openingSwap', { skipped });
    };
    const ms = Math.round(6500 * (F < 1 ? 0.25 : 1));
    openSkip = () => {
      if (skipped) return; skipped = true;
      if (W.has('visionSkip')) W.visionSkip(); else if (typeof hooks.openingSkip === 'function') { try { hooks.openingSkip(); } catch (e) { /* host */ } }
      restore();
    };
    emit('opening', { at: 'start' });
    ui.cinema(true, () => { if (openSkip) openSkip(); }, 'בית המקדש השני');
    try {
      const p = W.has('vision') ? W.vision({ ms, restore, to }) : (() => { try { return hooks.opening({ ms, restore, to }); } catch (e) { return null; } })();
      if (p && typeof p.then === 'function') {
        // (a skip resolves at once; a world that never answers is given the opening's length and a margin)
        await new Promise((res) => {
          const tm = setTimeout(res, ms + 4000);
          const done = () => { clearTimeout(tm); res(); };
          p.then(done, done);
          const was = openSkip; openSkip = () => { was(); setTimeout(done, 450); };
        });
      }
    } finally {
      openSkip = null;
      ui.cinema(false);
      restore();
      G.op = 1; persist();
    }
    emit('opening', { at: 'end', skipped });
    return gen === hero.gen;
  }
  /** ── flow10 ── (BRIEF10) the survey's coach line never outlives the survey: a step skipped or set by a resume left "הקש כדי
      למדוד את ההר" over the builder into the courses */
  const SURVEY_LINE = 'הקש כדי למדוד את ההר';
  function staleCoach() {
    const s = G && G.st && G.st.har;
    // (── flow11 ── PRODUCER11 N62: "הקש כדי למדוד את ההר" stayed over the kiyor, the Ulam, the Heichal — the Mount done has no `p`)
    if (s && (s.done || (s.p && s.p !== 'survey')) && ui.coachText && ui.coachText.includes(SURVEY_LINE)) ui.coach(null, '');
  }
  function ftueTo(step, resume = false) {
    if (!resume && step <= G.ftue && step !== 99) return;
    G.ftue = step; persist();
    emit('ftue', step);
    clearTimeout(ftueTimer);
    const har = G.st.har && !G.st.har.done ? G.st.har : null;
    switch (step) {
      case 1: coachAt('hero', SURVEY_LINE); break;   // ── flow8 ── (R6: ≤ 5 words; "500 על 500" is the survey's fact)
      case 2: coachAt('boulder', T.tapBoulder); break;
      case 3:
        // the mentor's gift: the first segment's stones are paid (START_RES) — the first stone is yours
        if (har && har.p === 'courses' && har.paid <= har.set) S.payStep(G, 'har');
        syncSite('har', true); ui.refresh();
        // the hand on the pill (FUN P1, 11:47). ── flow9 ── (BRIEF9 FLOW9-1, DESIGN8B 11:03) and who sets what, in the crane's words:
        // "את האבן הראשונה, האבן הגדולה, תניח אתה במנוף" (the game that opens is the crane's "האבן הגדולה")
        { const k0 = keyOf('har', 0); coachAt('pill', k0 ? keyWords(k0, true).line : ''); }
        break;
      // ── flow10 ── (PRODUCER10 N8: the crew's toast and the story card covered the great stone's landing) the crew comes once the
      // crane has set the stone, and a beat after
      case 4: ui.coach(null, ''); { const t0 = tNow(), go = () => { if (G.ftue !== 4) return; if (lifting.har && tNow() - t0 < 12) { ftueTimer = setTimeout(go, 300); return; } ftueTimer = setTimeout(() => { if (G.ftue === 4) crewArrives(); }, 1200 * F); }; go(); } break;
      case 5: coachAt('hero', byName('סיתות, סיתות, הנחה', 1)); ftueTimer = setTimeout(() => { if (G.ftue === 5) ui.coach(null, ''); }, 9000); break;   // (the pointer stays on the banker)
      case 6: coachAt('pill', byName('נגמרו האבנים: שחק במחצבה', 1)); break;
      case 99: ui.coach(null, ''); ftueDone(); break;
      default: break;
    }
  }
  function ftueBoulder() {
    if (G.ftue === 2 && S.bouldersLeft(G) === BOULDERS - 1) { coachAt('hero', T.tapRing); ftueTimer = setTimeout(() => { if (G.ftue === 2) ui.coach(null, ''); }, 5000); }
    markSync();                                         // ── flow8 ── the pointer moves to the next boulder at once
  }
  function ftueStone() { ftueWatch(); }
  function ftueStep() { ftueWatch(); }
  function ftueLevel() { if (G.ftue >= 5 && G.ftue < 99) ftueTo(99); }
  function crewArrives() {
    if (!G.crews.length) {
      G.crews.push({ at: 'har' });
      persist();
      syncCrews();                                        // ── crews ── the first crew walks in
      sfx.play('settle');
      coachAt(null, T.crewIntro, `${T.mentor} · ${T.mentorNote}`);
      ui.toast({ icon: 'crew', title: 'צוות בנאים הגיע', body: 'הוא מניח אבנים גם בלי הקשות, גם כשאינך כאן' });
      emit('crew', { n: G.crews.length });
      ui.refresh();
    }
    ftueTimer = setTimeout(() => { if (G.ftue === 4) meetPriests(); }, 2600 * F);
  }
  async function meetPriests() {
    if (!G.story.priests) {
      G.story.priests = 1; persist();
      await ui.storyCard(STORY.priests, 'הסיפור');   // ── flow8 ── (the story of the name, the same in every new game; the rotating facts are the "פרט אמיתי")
      const r = await ui.namePrompt();
      if (r) { G.name = r.name; G.mishmar = r.mishmar; }
      persist();
      emit('name', { mishmar: G.mishmar });
      // ── flow8 ── (the owner, 28.9: "לא רואים אותה בשום מקום") the name is seen at once: a greeting, the HUD chip, the plate
      ui.refresh(); namePlate();
      emit('greet', { named: !!G.name });
      await ui.greetCard(G);
    }
    if (G.ftue === 4) ftueTo(5);
  }
  /** ── flow8 ── "הכהן <שם>" over the hero (world.screenPos('hero'); a world without it: no plate) */
  const plateAt = { x: 0, y: 0, on: false };
  // ── flow10 ── (PRODUCER10 N4: "a name plate with no kohen" — over the cut's edge while he stood below it) the plate shows only
  // where he is seen: view.project says `on: false` for a point the rough Mount hides (main.js)
  const platePos = () => {
    const p = W.screenPos('hero', plateAt); if (p && p !== plateAt && typeof p.x === 'number') { plateAt.x = p.x; plateAt.y = p.y; plateAt.on = p.on !== false; }
    if (p && plateAt.on && view && view.project && (plateChk = (plateChk + 1) % 6) === 0) { const hp = W.heroPos(); plateHid = !!(hp && Number.isFinite(hp.x) && !view.project(hp.x, hp.y + 1.6, hp.z).on); }
    if (p && plateHid) plateAt.on = false;
    return p ? plateAt : null;
  };
  let plateChk = 0, plateHid = false;
  function namePlate() { const n = G.name ? String(G.name).trim() : ''; ui.plate(n && !whole ? platePos : null, n ? T.kohen(n) : ''); }
  /** ── flow8 ── the coach says the name now and then: "<שם>, " before a line (never twice in a row) */
  let calledAt = -1e9;
  function byName(text, every = 3) { const n = G.name ? String(G.name).trim().split(/\s+/)[0] : ''; if (!n || !text) return text; const k = (G.stats.strikes || 0) + (G.ftue || 0); if (now() - calledAt < 20000 || (every > 1 && k % every)) return text; calledAt = now(); return `${n}, ${text}`; }
  function ftueDone() {
    ui.toast({ icon: 'star', title: G.name ? `התחלה טובה, ${T.kohen(String(G.name).trim())}!` : 'התחלה טובה!', body: HK.ftueEndText(), ms: 7000 });
    emit('ftueDone');
  }
  // FTUE milestones that are easier to poll than to hook
  function ftueWatch() {
    markSync();                                         // ── flow8 ── (the next boulder as soon as one splits)
    staleCoach();
    if (!started || G.ftue >= 99 || momentBusy) return;
    const s = G.st.har;
    if (!s || s.done) { if (S.isDone(G, 'har') || S.buildingSites(G).some((id) => id !== 'har')) ftueTo(99); return; }
    if (G.ftue === 1 && s.p && s.p !== 'survey') ftueTo(2);
    if (G.ftue === 2 && (s.p === 'courses' || s.set > 0)) ftueTo(3);
    if (G.ftue === 3 && s.set >= 1) ftueTo(4);
    // (the Mount's segment costs 12: the mentor's stones buy three; the quarry's coach comes when the meter is spent, never over a "בנה")
    if (G.ftue === 5 && s.set >= 2 && s.paid <= s.set && S.nextAction(G).kind === 'play') ftueTo(6);
  }

  /* ───────── stories ───────── */
  async function storyPages(pages) { for (const p of pages) await ui.storyCard(p, 'סיפור'); }

  /* ───────── demo mode ───────── */
  function switchMode(demo) {
    persist();
    settings.demo = !!demo; saveSettings();
    // ── flow8 ── leaving the demo drops '#demo' / '?demo=1' from the address, so a reload opens the regular game
    if (!demo && typeof location !== 'undefined' && typeof history !== 'undefined' && history.replaceState && (/^#demo$/.test(location.hash) || /[?&]demo=1/.test(location.search))) {
      try { const q = location.search.replace(/([?&])demo=1(&|$)/, (m, a, b) => (b ? a : '')).replace(/[?&]$/, ''); history.replaceState(history.state, '', location.pathname + q + (/^#demo$/.test(location.hash) ? '' : location.hash)); } catch (e) { /* a sandboxed frame */ }
    }
    hero.gen++; hero.busy = false; hero.pending = null; hero.at = null;
    const L = S.load(store, keyOf(), now());
    G = L.G; isNew = L.isNew;
    cardsShown.clear();
    ui.closeSheet(); stopRing(); ui.coach(null, '');
    opening = openingDue();                  // ── build7 ── a new #demo opens on the vision like a new game
    if (opening) W.demoMode(); else syncWorld(null);
    const d = S.dailyCheck(G, now(), isRestDay);
    persist();
    ui.refresh(); namePlate();               // ── flow8 ── (the demo's save has its own name)
    ui.toast({ icon: 'star', title: demo ? T.demoBadge : 'חזרה למשחק הרגיל', body: demo ? 'שמירה נפרדת. המשחק הרגיל לא נפגע.' : '' });
    emit('mode', { demo: G.demo });
    if (isNew || G.ftue < 99) runFtue(); else if (d) wageToast(d);
    const r = S.recommend(G); if (r.id && !opening) W.focus(r.id);
    if (demo && S.allDone(G)) setTimeout(() => { if (G.demo && S.allDone(G)) pickStage(T.demoPickDone); }, 900);   // ── supervisor (30.9) ── a demo that reached its end: choose where to play from
  }
  // ── supervisor (30.9) ── the demo for testing every stage by hand: jump to any stage's start, or on to the next one. The owner:
  // "מצב הדגמה לא עובד בשלב א. הוא עובר ישר לשלב ב. סדר את זה כי כדי לבחון בעצמי את כל השלבים אני צריך את זה כדי להתקדם".
  // (The chapter skip built up to six stages at a tap, and a finished demo save left only Phase B.) Only the demo's own save.
  function jumpTo(id) {
    if (!G.demo || whole || momentBusy || overlay || opening || !stageById(id)) return false;   // (never under the opening: its swap re-poses the Mount)
    const G2 = S.demoAt(G, id, now()); if (!G2) return false;
    hero.gen++; hero.busy = false; hero.pending = null; hero.at = null;
    G = G2; persist();
    cardsShown.clear();
    ui.closeSheet(); stopRing(); ui.coach(null, ''); if (ui.clearFloats) ui.clearFloats();
    syncWorld(null);
    ui.refresh(); namePlate();
    emit('demoJump', { id });
    ui.toast({ icon: 'star', title: `${T.demoPickTo} ${stageById(id).n}`, body: T.demoPickBody, ms: 3200 });
    // ── director13 ── (C1, PRODUCER-S13a #10: "the first frame after a pick: the whole site from 425–1,200 amot, the kohen 4–12 px,
    // twice HIDDEN") a pick lands on him where he waits for his first tap, as a reopen does (landWork: close on him, 50 amot,
    // 26°, from outside the site) — not W.focus's flight over the whole site. (The Mount keeps its own first frame: its rocks.)
    for (const k of Object.keys(beatDone)) delete beatDone[k];
    beatWait = null; checkWait = null; hero.rockTo = null; hero.rest = false; hero.atC = null;
    // (PRODUCER13 N84, N87: after a pick he started where the last stage left him — on the altar's ramp, on the Mount's plaza — and ran
    //  44–217 amot to the new stage) a pick puts him at the new stage's survey stake, where its first tap is
    if (id !== 'har') { const sv = W.workSpot(id, 'survey'); if (sv && typeof sv.x === 'number') { W.heroPlace(asSpot(sv)); W.heroShow(true); emit('heroPlace', { id, pick: true, to: [Math.round(sv.x), Math.round(sv.z)] }); } }
    if (id === 'har' || !landWork()) W.focus(id, 900);
    return true;
  }
  /** the stage after the one in focus (the first not built when nothing is in focus), or null after the last */
  function nextStageId() {
    const cur = S.focusOf(G) || (STAGES.find((s) => !S.isDone(G, s.id)) || {}).id;
    const i = STAGES.findIndex((s) => s.id === cur);
    return i >= 0 && i + 1 < STAGES.length ? STAGES[i + 1].id : null;
  }
  async function skipStage() {
    if (!G.demo) return;
    const nx = nextStageId();
    if (nx) jumpTo(nx); else await skipChapter();   // the last stage: the regular end (the finale, then the demo's outro)
  }
  async function pickStage(note = '') {
    if (opening && openSkip) { openSkip(); await sleep(900); }   // (a tap on "שלבים ▾" during the opening ends the opening first)
    if (!G.demo || whole || momentBusy || overlay || opening) return null;
    const cur = S.focusOf(G) || (STAGES.find((s) => !S.isDone(G, s.id)) || {}).id, nx = nextStageId();
    const buttons = [];
    if (nx) buttons.push({ label: `⏭ ${T.demoPickNext}: ${esc(stageById(nx).n)}`, value: nx, gold: true });
    STAGES.forEach((s, i) => buttons.push({ label: `${i + 1}. ${esc(s.n)}${S.isDone(G, s.id) ? ' ✓' : s.id === cur ? ' ◀' : ''}`, value: s.id }));
    buttons.push({ label: T.close, value: null });
    const v = await ui.modal(`<div class="gm-kick">${T.demoBadge}</div><h2>${T.demoPickTitle}</h2><p>${note ? `${note} ` : ''}${T.demoPickLead}</p>`, { cls: 'gm-pick', buttons });
    if (v) jumpTo(v);
    return v || null;
  }
  async function skipChapter() {
    if (!G.demo) return;
    const done = S.skipChapter(G);
    persist();
    if (G.ftue < 99) { G.ftue = 99; ui.coach(null, ''); }
    for (const c of done) {
      W.setStage(c.id, 'building', 0.6, { instant: true });
      W.setStage(c.id, 'done', 1);
      emit('stageDone', { id: c.id, chapter: c.chapter, skipped: true });
    }
    syncWorld(null);
    const last = done[done.length - 1];
    if (last) { if (!stageById(last.id).quiet) W.celebrate(last.id); sfx.play('fanfare'); W.showcase(); }
    ui.refresh();
    const ch = done.find((c) => c.chapter);
    if (ch) { await ui.chapterCard(ch.chapter); emit('chapter', ch.chapter); }
    if (done.some((c) => c.all)) await finale();
    const r = S.recommend(G); if (r.id) W.focus(r.id);
  }

  /* The investor's highlight reel (hooks/demo.js): complete what the next highlight needs, then play it live. */
  /* ── build6 ── the investor's reel of the new loop first (FUN's DEMO6 beats: a board, a segment built, the hands, the kings,
     the whole stones, the album), then the key moments' highlight reel (hooks/demo.js) up to Chanukat HaBayit */
  const DEMO_BEATS = [{ at: 'm3', field: 'quarry' }, { at: 'build' }, { at: 'mg', kind: 'crane' }, { at: 'mg', kind: 'dress' }, { at: 'kings' }, { at: 'mg', kind: 'whole' }, { at: 'album' }];
  async function demoBeat(b) {
    const id = S.focusOf(G) || (S.isWorkable(G, 'har') ? 'har' : null);
    emit('demoBeat', { at: b.at, kind: b.kind || b.field || null });
    if (b.at === 'm3') { const a = playFor(id || 'har') || { kind: 'play', id, field: b.field || 'quarry', need: { stone: 40 } }; return playLevel({ ...a, field: a.field || b.field }); }
    if (b.at === 'build' && id) {
      if (G.st[id].p !== 'courses') { const s = G.st[id]; s.p = 'courses'; s.dp = 1; if (id === 'har') G.bh = G.bh.map(() => 0); }
      S.payStep(G, id); syncSite(id, true); W.focus(id, 900);
      for (let k = 0; k < 8; k++) {
        const j = S.jobOf(G, id); if (!j) break;
        const r = j.kind === 'key' ? S.setKey(G, id, { quality: 0.9 }) : j.kind === 'stone' ? S.quickSet(G, id) : j.kind === 'pay' ? (S.payStep(G, id), null) : S.stroke(G, id, true);
        if (r && r.stones && r.stones.length) { sfx.play('settle'); stoneLift(id, j.kind === 'key'); }
        await sleep(420);
      }
      persist(); syncSite(id, true); ui.refresh();
      return;
    }
    if (b.at === 'mg') { const run = fnOf(parts().minigames, 'runMinigame'); if (!run) { ui.toast({ icon: 'star', title: 'משחקי הדיוק', body: 'המנוף, הסיתות, האנך והאבנים השלמות', kind: 'mini' }); return; } momentBusy = true; overlayOn(true); try { await guarded(run(b.kind, { root: ui.root || document.body, world, site: id, slot: id ? W.nextSlot(id) : null, level: 1, seed: 7, demo: true, onEvent: (t, d) => emit(t, d), sfx, haptic, reduced, ...mgFacts(b.kind) }), 'minigames.demo'); } finally { momentBusy = false; overlayOn(false); } return; }
    if (b.at === 'kings') return openKings();
    if (b.at === 'album') { ui.openSheet('daily'); }
  }
  async function demoNext() {
    if (!G.demo || momentBusy || whole || overlay) return;
    if (!G.story.reel) { G.story.reel = 1; persist(); }   // ── supervisor (30.9) ── from now on this demo save is the investor reel
    const beats = (parts().fun && Array.isArray(parts().fun.DEMO6) && parts().fun.DEMO6.length) ? parts().fun.DEMO6 : DEMO_BEATS;
    const k = G.story.demo6 || 0;
    if (k < beats.length) {
      if (G.ftue < 99) { G.ftue = 99; ui.coach(null, ''); if (!G.crews.length) G.crews.push({ at: S.focusOf(G) }); }
      G.story.demo6 = k + 1; persist();
      ui.closeSheet(); stopRing();
      await demoBeat(beats[k]);
      return;
    }
    const p = HD.prepareHighlight(G);
    if (!p) {   // (QA P1-4) the reel is over: say so, and point to what comes next, instead of a button that does nothing
      if (!G.celeb) return;                           // ── hooks ── (round 3) the last highlight's cards and Chanukat HaBayit are still on their way: the outro follows them (a press in that gap opened it too early on the desktop run)
      if (!ui.busy && await HK.demoOutro()) return;   // ── hooks ── (round 3) a proper outro: what was shown, and the two doors (the service, the tour)
      ui.toast({ icon: 'star', title: 'כל הרגעים הוצגו', body: 'הבית בנוי. מהתפריט: "העבודה בבית" או "סיור בבית המקדש".', ms: 4200 });
      return;
    }
    if (G.ftue < 99) { G.ftue = 99; ui.coach(null, ''); }
    hero.gen++; hero.busy = false; hero.pending = null; hero.at = null;
    ui.closeSheet(); stopRing();
    for (const c of p.done) { W.setStage(c.id, 'building', 0.6, { instant: true }); W.setStage(c.id, 'done', 1); emit('stageDone', { id: c.id, chapter: c.chapter, skipped: true }); }
    persist();
    syncWorld(null);
    if (p.done.some((c) => c.id === 'kiyor')) kiyorFlow();   // build6: the reel shows the kiyor's water
    ui.refresh();
    emit('highlight', { id: p.h.id, how: p.h.how });
    ui.toast({ icon: 'star', title: p.h.what, kind: 'mini', ms: 2400 });
    if (p.h.how === 'moment') { await runMoment(p.h.id); return; }
    W.focus(p.h.id, 900);
    await sleep(700 * F);
    completeFlow(S.completeStage(G, p.h.id), true);
  }

  // ── build6 ── the kiyor's twelve spigots open (WATER's world.water.kiyor; firstFlow only if kiyor is missing): at the end of the
  // kiyor's key moment, and in the investor's reel when it passes the kiyor
  function kiyorFlow() {
    const wa = W.water(); if (!wa) return;
    try { if (typeof wa.kiyor === 'function') wa.kiyor({ spigots: 12, flow: 1 }); else if (typeof wa.firstFlow === 'function') wa.firstFlow(); } catch (e) { /* water is optional */ }
  }
  /** the king's offer that brings the shortage of a 'play' action now (KINGS' bestFor), for the chip beside the pill; null if none */
  /** ── build7 ── what the board of a 'play' action pays, as the pill says it ("▶ המחצבה · כ־40 אבנים"): {res, n} rounded to 5
      (content.js M3_PAY: MATCH3's yields by level), or null without MATCH3 or for silver alone (the pill then says the shortfall) */
  function boardPays(a) {
    if (!a || a.kind !== 'play' || !fnOf(parts().match3, 'runLevel')) return null;
    const f = a.field || 'quarry', need = a.need || {}, wst = need.wstone > 0;
    const res = wst ? 'wstone' : Object.keys(need).find((k) => FIELD_OF[k] === f && k !== 'silver' && need[k] > 0);
    if (!res) return null;
    const lvl = (G.m3 && G.m3.level && G.m3.level[f]) || 1;
    const n = m3Pay(f, lvl, wst) * (G.demo ? DEMO_LEVEL : 1);
    // ── fun12 ── the pill names the cycle's next game ("▶ הקלע של דוד · כ־45 אבנים"); the board back in a longer round pays more
    const cy = null;   // ── flow16 ── (fun12's cyclePill retired: the pill never names a period game) ── /flow16 ──
    return n > 0 ? { res, n: Math.max(5, Math.round((n * (cy ? cy.mult : 1)) / 5) * 5), ...(cy ? { game: cy.game, name: cy.name } : {}) } : null;
    // ── /fun12 ──
  }
  /** ── build7 ── (FUN7 P0) the king who brings a bronze shortfall now, as the pill's main action; none while a ship is at sea
      (it may be bringing it), in the tutorial, or without KINGS. → {partner, offer, who, n, cost} | null */
  const dealOpt = { deal: (res, need, a) => {
    try {
      if (res !== 'bronze' || G.ftue < 99) return null;
      const K = parts().kings, st = fnOf(K, 'status');
      if (st) { const s = st(G, now()); if (s && s.sea > 0) return null; }
      const kb = kingsBest(a);
      return kb && kb.res === 'bronze' ? kb : null;
    } catch (e) { return null; }
  } };
  function kingsBest(a) {
    try {
      if (!a || a.kind !== 'play' || !a.lack || G.ftue < 99) return null;
      const K = parts().kings, bf = fnOf(K, 'bestFor'); if (!bf) return null;
      const r = ['bronze', 'cedar', 'gold'].find((k) => (a.lack[k] || 0) > 0); if (!r) return null;   // (build7: bronze first)
      const t = now(), o = bf(G, r, a.lack[r], t, { needs: a.lack, rest: G.demo ? false : restAt(t) });
      if (!o || !o.gives || !o.gives[r]) return null;
      const P = (Array.isArray(K.PARTNERS) ? K.PARTNERS : []).find((p) => p.id === o.partner);
      return { partner: o.partner, offer: o.id, who: (P && (P.short || P.n)) || '', res: r, n: o.gives[r], cost: o.gift ? 0 : o.cost || 0 };
    } catch (e) { return null; }
  }

  /* ───────── the whole-Temple view (visual only) ───────── */
  function enterWhole() {
    if (whole) return;
    whole = true;
    hero.gen++; hero.busy = false; hero.pending = null; hero.at = null;
    stopRing();
    ui.setWhole(true);
    if (hooks.enterWhole) hooks.enterWhole();
    emit('whole', true);
  }
  function exitWhole() {
    if (!whole) return;
    whole = false;
    if (hooks.exitWhole) hooks.exitWhole();
    ui.setWhole(false);
    tod = null; syncTime();
    syncWorld(null);
    syncQuarry(true); syncCrews(true); hotspot();   // (nothing of the game reached the world while the whole House was shown)
    W.heroShow(true);
    const r = S.recommend(G); if (r.id) W.focus(r.id);
    emit('whole', false);
  }

  function newGame() {
    hero.gen++; hero.busy = false; hero.pending = null; hero.at = null;
    G = S.fresh(now(), { demo: settings.demo }); isNew = true;
    cardsShown.clear();
    S.dailyCheck(G, now(), isRestDay);
    persist();
    try { localStorage.removeItem(H42KEY); } catch (e) { /* */ }   // ── fable32 (build 42) ── (a new game: the new stage 01 from its start) ── /fable32 ──
    if (H42 && H42.on) H42.stop(false);
    opening = openingDue() && !wanted42(G, S.isDone);                  // ── build7 ── a new game opens on the vision too (the finished House first)
    if (opening) W.demoMode(); else syncWorld(null);
    ui.refresh(); namePlate();               // ── flow8 ── (a new game has no name yet: the plate goes)
    emit('newGame');
    if (wanted42(G, S.isDone)) startHar42(); else if (wantedTest44()) startH44('test'); else if (wanted45()) startHar45(); else runFtue();   // ── fable32 (build 42) ── ── /fable32 ── ── fable32 (build 44) ── ── /fable32 ──
  }

  /* ───────── per frame (from main.js) ───────── */
  // ── flow9 ── (QA9 15:46, P0: in the courses the banker's pointer sat off screen at op 0 and nothing re-aimed; DESIGN8B R2 "the
  // target is never off screen") the marked target is kept in view: hidden ≥ 1.2 s while the builder is idle and nothing is
  // open → the camera re-aims once (a rock: boulderCam; the banker: the site's working frame, W.focus), then waits 4 s before it
  // tries again, so a player's own look around is not fought every frame
  let markHidT = 0, markAimT = -1e9, camHold = 0;   // camHold: the world holds the shot (deliverKeyStone) until then
  // ── twin17 ── two thumbs at the Mount (src/game/twin.js; docs/WAVE17-BRIEF.md): the left thumb walks him, the right one works;
  // the deal's cards become markers in the world over their work; the follow camera (cam: 'follow') or today's frames ('director')
  /** one line at the top at a phase change (LAND17's ui.banner, guarded) */
  function twinBanner(type, d) {
    if (!ui || typeof ui.banner !== 'function') return;
    if (JU && type === 'course' && d && d.id === twinStage()) return;   // ── juice18 ── (juice.big says it, in the middle) ── /juice18 ──
    if (type === 'boulder') ui.banner('סלע אחד פחות!');   // ── ux24 ── ("הסלע מוכן!" read as "the rock is ready" over a rock just split) ── /ux24 ──
    else if (type === 'course' && d && d.id === twinStage()) ui.banner('הנדבך הושלם!');   // ── twin18 ── (every stage) ── /twin18 ──
    else if (type === 'phase' && d && d.id === twinStage() && d.ph === 'courses') ui.banner('בונים את הנדבכים!');
  }
  // ── juice18 ── (docs/WAVE18-BRIEF.md contracts 1 and 3) juice.js answers every touch on material (twin.js calls juice.hit) and every
  // result; its "+1" flies to the craft's points (craftxp.js, G.xp) at the top
  function juiceMake() {
    JU = createJuice18({
      ui, sfx, haptic, view, stages: () => world && (world.stages || world), G: () => G, persist: () => persist(), emit: (t, d) => emit(t, d), twin: () => TW, score: () => SCR /* ── hook19 ── */,
    });
    try { const P = globalThis.__BH_PARTS || (globalThis.__BH_PARTS = {}); P.juice = JU; } catch (e) { /* a frozen global */ }
    if (G && G.xp && Object.keys(G.xp).length) JU.show();   // (the points so far, at once)
  }
  /** the celebrations: a course closed at his stage (3.2 s), a stage done (4.2 s, yields to its card) */
  function juiceEvent(type, d) {
    if (type === 'course' && d && d.id === twinStage()) {
      const P = PROJ[d.id], cur = JB.curOf(G, d.id), C = P && P.C, c = Math.min(C || 0, (cur && cur.c) || 0);
      JU.event('course', { sub: C ? `נדבך ${isoNum(c)} מתוך ${isoNum(C)} · +${isoNum(PAY.course)} מטבעות` : `+${isoNum(PAY.course)} מטבעות`, cheer: () => W.crewsCheer && W.crewsCheer(d.id) });
    } else if (type === 'stageDone' && d && !d.skipped && !stageById(d.id).quiet) JU.event('stageDone', { title: `${stageById(d.id).n} נבנה!` });   // (a quiet stage keeps its solemn sound, no celebration)
  }
  // ── /juice18 ──
  const TW_ICON = { strike: '⚒', key: '⭐', arch: '◠', tread: '⚙', column: '▮', F1: '▦', letters: '✎', line: '〰', saw: '⇋', gold: '✦', plaster: '▤', bronze: '◉', wheel: '◎', waves: '≈', rafts: '⛵', aqueduct: '⌇' };
  const twinOn = () => !!(TW && TW.on);
  const twinHP = { x: 0, y: 0, z: 0 };
  const twinBeatO = { on: false, to: 0, cyc: 1, win: 0.1 };   // ── twin18 ── (one object, filled each frame) ── /twin18 ──
  function twinTick(ms) {
    if (!TW) {
      if (!ui.root) return;
      TW = createTwin({
        ui, view, stages: world && (world.stages || world), root: ui.root, emit: (t, d) => emit(t, d), sfx, haptic, settings: () => settings,
        live: () => started && !whole && !opening && !reelOn() && !(H42 && H42.on),   // ── fable32 (build 42) ── (the new stage 01 walks and touches by its own) ── /fable32 ──
        stage: () => twinStage(),   // ── twin18 ── (every stage of the building site) ── /twin18 ──
        moment: () => !!(ui.busy || opening || whole || (ui.root && ui.root.querySelector('.gm-modal.on'))),   // (second fix round: only a card that asks something holds the thumbs) ── twin18 ── (+ any card on screen: the arrow and the markers never over it) ── /twin18 ──
        film: () => !!(!(globalThis.__HANDS && globalThis.__HANDS.twin) && !jobBusy && !SC && (momentBusy || overlay)),   // (a key moment's or a check's own shots take the camera)
        work: (h) => caSpec(navWork(twinWork(h))), marks: () => twinMarks, goal: () => twinGoal(),   // ── nav19 ── (navWork: "↩ לעבודה" goes as the compass does) ── /nav19 ── ── crafta19 ── (caSpec: the survey's craft) ── /crafta19 ──
        pickMark: (m) => { CA.mkJob = m.job; return { icon: m.icon, label: m.label, job: m.job, at: m, go: () => jobPick(m.site, m.job) }; },   // ── twin20 ── (the right stick chose this marker) ── /twin20 ──
        goTo: () => twinGoTo(),   // ── nav19 ── (the compass's tap) ── /nav19 ──
        camEl: () => (Number.isFinite(s21El) ? s21El : null),   // ── stages21 ── ── /stages21 ──
        camSide: (d, el, az) => twinCamSide(d, el, az),   // ── nav19 ── (note 11: the wall's outer side while he works a high course from its foot) ── /nav19 ──
        juice: () => { const P = globalThis.__BH_PARTS; return (P && P.juice) || parts().juice || null; },   // ── twin18 ── (JUICE18's juice.hit, contract 3) ── /twin18 ──
        rhythm: () => settings.rhythm !== false,   // ── twin18 ── (the ring on the button: off → every touch is good)
        beat: () => caRing(twinBeatO),   // ── crafta19 ── (the music's beat, every 2nd: the gold touch moment = beat − 90 ms) ── /crafta19 ──
        why: () => { const S0 = world && (world.stages || world), hs = S0 && S0.hero && typeof S0.hero.twinState === 'function' ? S0.hero.twinState() : ''; return `${momentBusy ? 'M' : ''}${overlay ? 'O' : ''}${ui.busy ? 'U' : ''}${jobBusy ? 'J' : ''}${SC ? 'S' : ''}${hero.busy ? 'B' : ''}${checkWait ? 'C' : ''}|${hs}`; },   // (debug)
      });
    }
    if (!JU && ui.root) juiceMake();   // ── juice18 ── ── /juice18 ──
    TW.update(ms);
    if ((CA.chk -= 1) <= 0) { CA.chk = 3; try { caTick(); } catch (e) { console.warn('[crafta19] tick', e && e.message); } }   // ── crafta19 ── (armed at his strike; the world's ring) ── /crafta19 ──
    try { caSvFrame(); } catch (e) { /* crafta19: the counter's */ }
    // ── twin18 ── the world learns the stage he works at (its stock, its solids) and lights the see-through while twin is ON
    if ((twinSiteT -= 1) <= 0) { twinSiteT = 15;
      // (the deal under the markers changed — a load, a re-deal: the markers are dealt again, never stale)
      if (TW.on && dealOpen && !jobBusy && twinMarks.length) { const cd = JB.curOf(G, dealOpen).deal; if (cd && twinDealRef && cd !== twinDealRef) { dealClose(); dealWant = 1; } } const S0 = world && (world.stages || world); try { if (S0 && S0.hero && typeof S0.hero.twinSite === 'function') S0.hero.twinSite(TW.on ? twinStage() : null); if (S0 && typeof S0.xray === 'function') S0.xray(!!(TW.on && TW.cam)); } catch (e) { /* the world's */ } }
    // ── /twin18 ──
    if (!api._.twin) api._.twin = () => ({ momentBusy, overlay, marks: twinMarks.length, mk: twinMarks.map((m) => [m.job, +(+m.x).toFixed(1), +(+m.z).toFixed(1), typeof m.x]), heroBusy: hero.busy, dealOpen, sheet: twinSheet, SC: !!SC, jobBusy, hands: !!globalThis.__HANDS, s21: { hold: Math.round((camHold - tNow()) * 10) / 10, bw: !!beatWait, cw: !!checkWait, dw: dealWant, ub: !!ui.busy, clear: beatClear(), cur: curWork() } /* ── stages21 ── (why no deal yet: the kid run's dead-time snapshots) ── /stages21 ── */ });   // (tests)
    if (TW.on !== twinWas) { twinWas = TW.on; if (dealOpen && !jobBusy) { dealClose(); dealWant = 1; } }   // (the deal re-dealt as a sheet or as markers)
    if (TW.on && TW.walking) { hero.at = null; hero.atXZ = null; hero.rest = false; hero.pending = null; walkFollow = null; }
    // (cam 'director' chosen while he works: today's frame of his work comes back at once)
    if (TW.on && TW.cam !== twinCamWas) { twinCamWas = TW.cam; emit('twinCam', { on: TW.cam }); }
    if (TW.on && TW.mode !== twinModeWas) { twinModeWas = TW.mode; if (twinModeWas === 'director') twinDir = true; }
    if (twinDir && TW.on && !TW.hold && !momentBusy && !overlay && !ui.busy) { twinDir = false; const wid = curWork(); if (wid) workFrame(wid, 900); }
    // (under two thumbs the markers are always out while the course loop runs: no pill to tap first)
    if (TW.on && !dealOpen && !dealWant && !jobBusy && !SC && coachChk === 0.5) { const ws = twinStage(); if (ws && JB.loopOn(G, ws)) dealWant = 1; }   // ── twin18 ── (every stage) ── /twin18 ──
  }
  const nearXZ = (h, x, z, r) => Math.hypot(h.x - x, h.z - z) <= r;
  // ── twin18 ── the stage he works at, for two thumbs: the Mount while it is built (its survey and rocks too), then the building
  // site in focus (workSite: never null for a moment while a later stage is built, unlike curWork's last-tap rule)
  function twinStage() { try { if (!S.isDone(G, 'har')) return S.statusOf(G, 'har') === 'building' ? 'har' : null; return workSite() || null; } catch (e) { return null; } }
  // ── /twin18 ──
  /** (fix round) a precision game the game opens by itself (the first-time flow's key stones, a segment's quick lift) under two thumbs:
      played in the world by the work button, as the deal's jobs are (hands.js input 'twin'; no sheet) */
  const twinCtx = (job) => (twinOn() ? { twin: TW, ui, view, heroPos: () => W.heroPos(), job } : {});
  /** (fix round) the coach's tap-words name the work button in landscape at the Mount */
  const TW_LINES = { 'הקש כדי למדוד את ההר': "לכו אל הסימן והקישו על 'עבודה'", 'הקש על הסלע': "לכו לסלע והקישו על 'עבודה'", 'הקש כשהטבעת נוגעת בזהב': "הקישו על 'עבודה' כשהטבעת נוגעת בזהב" };
  const twinLand = () => typeof innerWidth === 'number' && innerWidth > innerHeight && innerWidth >= 640 && !(typeof location !== 'undefined' && /[?&]twin=0\b/.test(location.search || '')) && !globalThis.__MG_AUTO && !!twinStage();   // ── twin18 ── (every stage) ── /twin18 ──
  { const coach0 = ui.coach; ui.coach = function (pos, text, who) { if (typeof text === 'string' && TW_LINES[text] && (twinOn() || twinLand())) text = TW_LINES[text]; return coach0.call(this, pos, text, who); }; }
  // ── ux24 ── (docs/UX24.md #3, "the words") a 7-year-old reads ≤ 7 words while his thumbs work: the crafts' teach lines are cut to
  // one short line, and in the first-time flow a long fact (the mentor's line with its source, after a craft) is not put over the
  // work — the kid is still learning the buttons (the fact stays the job's: it comes again after the flow)
  const UX_LINES = {
    "לכו אל הסימן והקישו על 'עבודה'": "לחצו על 'עבודה'",
    "לכו לסלע והקישו על 'עבודה'": "לכו לסלע ולחצו 'עבודה'",
    'החזיקו את הכפתור וגררו: החבל נפרש מן היתד — שחררו כשהמונה מגיע ל־500 אמה': 'החזיקו וגררו. עזבו ב־500!',
    "החזיקו את 'עבודה' — האבן יורדת; גררו ימינה ושמאלה ליישר. הצל נח על המקום — שם היא נוחתת": 'החזיקו — האבן יורדת. גררו ליישר.',
    'החליקו מטה מהר על הכפתור — כל החלקה: צעד בגלגל. שתי החלקות בשנייה מסובבות אותו': 'החליקו למטה, מהר מהר!',
    'הקש על הכהן: עשר מכות, כל אחת כשהטבעת נוגעת בזהב': 'עשר מכות. הקש כשהטבעת בזהב',
  };
  const uxLine = (text) => {
    if (typeof text !== 'string' || !text) return text;
    if (TW_LINES[text] && (twinOn() || twinLand())) text = TW_LINES[text];   // (the two-thumb words first, then shortened)
    if (UX_LINES[text]) return UX_LINES[text];
    { const m = /^([^,]{1,24}), (.+)$/.exec(text); if (m && UX_LINES[m[2]]) return `${m[1]}, ${UX_LINES[m[2]]}`; }   // (byName's "נועם, …")
    if (G && !(G.ftue >= 99) && text.length > 90 && /טיוטה/.test(text)) return '';
    return text;
  };
  { const coach1 = ui.coach; ui.coach = function (pos, text, who) { return coach1.call(this, pos, uxLine(text), who); }; }
  // (docs/UX24.md #15) the stone's toast in a kid's words — no "the inspector will find it at the end" (a worry, not a fact he can use)
  function uxHow(q) { return q >= 0.9 ? 'מושלם! ישרה כמו חוט' : q >= 0.45 ? 'טוב!' : 'קצת עקומה — זה בסדר!'; }
  // ── /ux24 ──
  /** what the right thumb does where he stands (ten times a second): a craft's input is hands.js's (T.onWork); else the strike card's
      strike, a deal's marker, a standing rock within reach, his banker */
  let twinPayT = 0;   // ── twin18 ── (when the button's pay / board / check first showed: a tap within 0.7 s of it is a tap meant for the job that just ended) ── /twin18 ──
  function twinWork(h) {
    const payWas = twinPayT; twinPayT = 0;   // ── twin18 ── ── /twin18 ──
    if (globalThis.__HANDS && globalThis.__HANDS.twin) { const k = globalThis.__HANDS.kind; return { icon: TW_ICON[globalThis.__HANDS.job] || TW_ICON[k] || '✋', label: 'עבודה', job: globalThis.__HANDS.job || k, craft: true, trade: twinTrade(globalThis.__HANDS.job || k), at: globalThis.__HANDS.atW ? globalThis.__HANDS.atW() : null }; }
    if (SC) { const b = bankerT(SC.id); const at = b ? { x: b.x, y: b.y, z: b.z } : { x: h.x, y: h.y + 1.5, z: h.z }; return { icon: '⚒', label: 'מכה', job: 'strike', strike: true, trade: twinTrade('strike'), at, ca: { id: SC.id } /* ── crafta19 ── */, go: () => onSiteTap(SC ? SC.id : 'har'), special: () => { twinPerfect = true; /* ── crafta19 ── (no number at the touch: the perfect strike's "מושלם!" comes at its impact) ── /crafta19 ── */ onSiteTap(SC ? SC.id : 'har'); } }; }
    if (jobBusy) return null;   // (a moment or a card holds twin.js itself: it asks nothing then)
    // a marker within reach: its card, picked by the thumb (he walks the last step to the work and it begins)
    { let m = null, md = 49; for (let i = 0; i < twinMarks.length; i++) { const k = twinMarks[i], d = (h.x - k.x) * (h.x - k.x) + (h.z - k.z) * (h.z - k.z); if (d < md) { md = d; m = k; } }   // ── twin18 ── (the nearest within 7: two markers side by side — the one he stands at) ── /twin18 ──
      // ── crafta19 ── (two markers side by side, he between them: the job the button shows stays its job while he is within reach of it —
      // the work never flips under the thumb between the touch and the release; twin-touch [refused craft]: the tread became the strike)
      if (m && CA.mkJob && m.job !== CA.mkJob) { for (let i = 0; i < twinMarks.length; i++) { const k = twinMarks[i]; const dk = (h.x - k.x) * (h.x - k.x) + (h.z - k.z) * (h.z - k.z); if (k.job === CA.mkJob && dk < 49 && Math.sqrt(dk) - Math.sqrt(md) < 2) { m = k; break; } } }   // ── fable23 ── (it sticks only while he is about as near to it: walked onto the other marker, the button follows him — twin-touch [job 2] stood on the strike with the arch's button) ── /fable23 ──
      CA.mkJob = m ? m.job : null;
      // ── /crafta19 ──
      if (m) return { icon: m.icon, label: m.label, job: m.job, at: m, go: () => jobPick(m.site, m.job) }; }
    if (momentBusy || overlay) return null;   // ── twin18 ── (not hero.busy: a touch during his swing or a walk is buffered by tap(), as a tap on him is) ── /twin18 ──
    if (!S.isDone(G, 'har') && S.statusOf(G, 'har') === 'building' && G.st.har && !G.st.har.ready) {
      const j = S.jobOf(G, 'har');
      if (j && j.kind === 'boulders') {
        let best = -1, bd = 1e9; for (let i = 0; i < BOULDERS; i++) { if (!(G.bh[i] > 0)) continue; const d = Math.hypot(h.x - BOULDER_XZ[i][0], h.z - BOULDER_XZ[i][1]); if (d < bd) { bd = d; best = i; } }
        if (best >= 0 && bd <= 16) { const i = best, at = { x: BOULDER_XZ[i][0], y: W.groundAt(BOULDER_XZ[i][0], BOULDER_XZ[i][1]) + 3, z: BOULDER_XZ[i][1] }; return { icon: '⛏', label: 'מכה בסלע', job: 'rock', strike: true, trade: 'חוצבים', at, ca: { boulder: i } /* ── crafta19 ── */, go: () => onBoulderTap(i), special: () => { twinPerfect = true; /* ── crafta19 ── (no number at the touch: the perfect strike's "מושלם!" comes at its impact) ── /crafta19 ── */ onBoulderTap(i); } }; }
        return null;
      }
      // (the first-time flow's survey: at his stake the button measures, as a tap on him does)
      if (j && j.kind === 'survey') { const sp = workSpotAt('har'); if (sp && typeof sp.x === 'number' && nearXZ(h, sp.x, sp.z, 10)) { const at = { x: sp.x, y: W.groundAt(sp.x, sp.z) + 1, z: sp.z }; return { icon: '📏', label: 'מדידה', job: 'survey', strike: true, at, go: () => onSiteTap('har') }; } }   // ── twin18 ── (far from it: on, below) ── /twin18 ──
      // ── twin18 ── (kid17, a fresh game: the survey's stake is where he stands — the ring on him, "הקש על הכהן" — so the button measures
      // there, as a tap on him does; the dig likewise. It slept 30 amot from a far work spot and the arrow led him into a rock)
      if (j && (j.kind === 'survey' || j.kind === 'dig') && markT === 'hero') { const at = { x: h.x, y: (Number.isFinite(h.y) ? h.y : W.groundAt(h.x, h.z)) + 1, z: h.z }; return { icon: j.kind === 'survey' ? '📏' : '⛏', label: j.kind === 'survey' ? 'מדידה' : 'חפירה', job: j.kind, strike: true, trade: j.kind === 'survey' ? 'מודדים' : 'חוצבים', at, go: () => onSiteTap('har') }; }
      // ── /twin18 ──
    }
    // his banker (a stone, an event, a reset waits there): a free strike helps the crews (the survey, the dig: at his spot)
    const id = twinStage(); if (!id || !G.st[id] || G.st[id].ready) return null;   // ── twin18 ── (twinStage) ── /twin18 ──
    const j = S.jobOf(G, id);
    // (fix round) the first-time flow's key stone (the loop not yet on): the button by his banker sets it — in the world, by the thumb
    if (j && j.kind === 'key' && !JB.loopOn(G, id)) { const sk = workSpotAt(id); if (sk && typeof sk.x === 'number' && nearXZ(h, sk.x, sk.z, 8)) { const kw = keyWords(j, j.i === 0), at = { x: sk.x, y: W.groundAt(sk.x, sk.z) + 1.5, z: sk.z }; return { icon: '⭐', label: kw.act || kw.def || 'האבן המיוחדת', job: 'key', at, go: () => keyStone(id) }; }
      if (sk && typeof sk.x === 'number') return { icon: '↩', label: 'לעבודה', job: 'back', at: null, go: () => { W.walkTo({ x: sk.x, z: sk.z, ...(Array.isArray(sk.face) ? { face: sk.face } : {}) }); emit('twinBack', { id }); } }; }
    // ── twin18 ── (every stage) far from his work with nothing marked — whatever waits there (a key stone, a check): "↩ לעבודה"
    { const sb = workSpotAt(id) || W.workSpot(id, 'dress'); if (sb && typeof sb.x === 'number' && !nearXZ(h, sb.x, sb.z, 22) && !twinMarks.length) return { icon: '↩', label: 'לעבודה', job: 'back', at: null, go: () => { W.walkTo({ x: sb.x, z: sb.z, ...(Array.isArray(sb.face) ? { face: sb.face } : {}) }); emit('twinBack', { id }); } }; }
    // (kid17: the stones ran out — the coach says "שחק במחצבה" at the pill and the button slept) the button does what the pill does:
    // the next segment paid, or its field's board (a sheet: by the player's choice, never over a running job)
    // (and the course check the loop does not hold: the plumb in the world, as the pill's)
    if (j && (j.kind === 'pay' || j.kind === 'check') && !twinMarks.length) { const a = S.nextAction(G, dealOpt); if (a && a.id === id && !loopTurn(a) && (a.kind === 'build' || a.kind === 'play' || a.kind === 'check')) { const f = a.kind === 'play' ? TW_FIELD[a.field] || TW_FIELD.quarry : a.kind === 'check' ? ['📐', 'בדיקה'] : ['🪙', 'לשלם']; twinPayT = payWas || tNow(); return { icon: f[0], label: f[1], job: a.kind === 'play' ? a.field : a.kind === 'check' ? 'check' : 'pay', at: null, go: () => { if (tNow() - twinPayT < 0.7) return; doAction(S.nextAction(G, dealOpt)); } }; } }
    // ── /twin18 ──
    if (!j || !['stone', 'survey', 'dig', 'finish', 'reset', 'event'].includes(j.kind)) return null;
    const sp = workSpotAt(id); if (!sp || typeof sp.x !== 'number') return null;
    if (!nearXZ(h, sp.x, sp.z, 22 /* ── stages21 ── (was 6: from 6 to 22 amot off his banker the button slept, the arrow hid itself (the banker is on the screen) and nothing was marked — the kid's kiyor and kodesh stood 14–17 s with nothing to follow: now the strike button is awake within 22, and he walks the rest ≤ 1.5 s) */)) { if (nearXZ(h, sp.x, sp.z, 22) || twinMarks.length) return null; return { icon: '↩', label: 'לעבודה', job: 'back', at: null, go: () => { W.walkTo({ x: sp.x, z: sp.z, ...(Array.isArray(sp.face) ? { face: sp.face } : {}) }); emit('twinBack', { id }); } }; }
    const b = bankerT(id) || { x: sp.x, y: W.groundAt(sp.x, sp.z) + 1.5, z: sp.z }; const at = { x: b.x, y: b.y, z: b.z };
    return { icon: '⚒', label: j.kind === 'survey' ? 'מדידה' : 'מכה', job: 'banker', strike: true, trade: j.kind === 'survey' ? 'מודדים' : twinTrade('strike'), at, ca: j.kind === 'stone' || j.kind === 'event' || j.kind === 'reset' || j.kind === 'dig' || j.kind === 'finish' ? { id } : null /* ── crafta19 ── */, go: () => onSiteTap(id), special: () => { twinPerfect = true; /* ── crafta19 ── (no number at the touch: the perfect strike's "מושלם!" comes at its impact) ── /crafta19 ── */ onSiteTap(id); } };
  }
  // (twinPerfect — "יד של אומן": the next strike is a perfect one — is declared at the top with TW)
  const TW_FIELD = { quarry: ['⛏', 'מחצבה'], forest: ['🌲', 'יער'], gold: ['⛰', 'מכרות'], beitkerem: ['⛏', 'בית כרם'] };   // ── twin18 ── ── /twin18 ──
  const twinTrade = (job) => { const R = JB.JOBS[job]; return (R && R.trade) || (job === 'key' ? 'סתתים' : null); };   // ── twin18 ── (the craft's name for juice.hit) ── /twin18 ──
  /** where the next work is (the edge arrow when it is off the screen): the nearest marker, else the marked rock or his banker */
  const twinG = { x: 0, y: 0, z: 0, icon: '★' };
  const twinWs = { t: -1e9, ok: false, x: 0, y: 0, z: 0 };   // ── twin18 ── (his work spot, read twice a second) ── /twin18 ──
  function twinGoal() {
    if (jobBusy || SC || (globalThis.__HANDS && globalThis.__HANDS.twin)) return null;
    const S0 = world && (world.stages || world), h = S0 && typeof S0.heroXYZ === 'function' ? S0.heroXYZ(twinHP) : null; if (!h || !Number.isFinite(h.x)) return null;
    let best = null, bd = 1e9;
    for (let i = 0; i < twinMarks.length; i++) { const m = twinMarks[i], d = Math.hypot(h.x - m.x, h.z - m.z); if (d < bd) { bd = d; best = m; } }
    if (best) { twinG.x = best.x; twinG.y = best.y; twinG.z = best.z; twinG.icon = best.icon; return twinG; }
    const t = markT;   // ── twin18 ── (no ring at a later stage — he is away from his banker: the arrow below still shows the way) ── /twin18 ──
    if (!t && !S.isDone(G, 'har')) return null;
    if (t && t.boulder != null) { const [x, z] = BOULDER_XZ[t.boulder]; twinG.x = x; twinG.z = z; twinG.y = W.groundAt(x, z); twinG.icon = '⛏'; return twinG; }
    if (t === BANKER_T) { twinG.x = t.x; twinG.y = t.y; twinG.z = t.z; twinG.icon = '⚒'; return twinG; }
    if (t === 'hero') return null;   // ── twin18 ── (the ring on him: his work is where he stands — no arrow away from it; kid17) ── /twin18 ──
    // ── twin18 ── (every stage) nothing marked: his work spot at the stage he works at (a survey's stake, a dig, his banker), when he is away
    // (asked every frame: the spot is read twice a second — workSpot allocates)
    { const tn = tNow(); if (Math.abs(tn - twinWs.t) > 0.5) { twinWs.t = tn; const ws = twinStage(), sp = ws ? workSpotAt(ws) || W.workSpot(ws, 'dress') : null; twinWs.ok = !!(sp && typeof sp.x === 'number'); if (twinWs.ok) { twinWs.x = sp.x; twinWs.z = sp.z; twinWs.y = W.groundAt(sp.x, sp.z); } } }
    if (twinWs.ok && Math.hypot(h.x - twinWs.x, h.z - twinWs.z) > 8) { twinG.x = twinWs.x; twinG.z = twinWs.z; twinG.y = twinWs.y; twinG.icon = '⚒'; return twinG; }
    // ── /twin18 ──
    return null;
  }
  // ── nav19 ── (note 3) the compass is a button: where the arrow points — the nearest marker, the marked rock, his banker / work spot —
  // he is brought there in ≤ 1.5 s (stages hero.dash: a quick walk with a dust trail, or a fade-and-appear when the way is long)
  function twinGoTo() {
    const g = twinGoal(), S0 = world && (world.stages || world), H0 = S0 && S0.hero;
    if (!g || !H0 || typeof H0.dash !== 'function') return { ok: false, why: g ? 'world' : 'none' };
    const h = S0.heroXYZ(twinHP);
    let target = null;
    const m = twinMarks.find((k) => k.x === g.x && k.z === g.z);
    if (m) { let js = null; try { js = W.has('jobSpot') ? W.jobSpot(m.job, { site: m.site }) : null; } catch (e) { js = null; } const fx = js && typeof js.x === 'number' && Math.hypot(js.x - m.x, js.z - m.z) > 1 ? js.x : m.x + (m.x - h.x), fz = js && typeof js.x === 'number' && Math.hypot(js.x - m.x, js.z - m.z) > 1 ? js.z : m.z + (m.z - h.z); target = { x: m.x, z: m.z, face: [fx, fz] }; }
    else if (markT && markT.boulder != null) target = BOULDER_T[markT.boulder];
    else { const ws = twinStage(), sp = ws ? workSpotAt(ws) || W.workSpot(ws, 'dress') : null; target = sp && typeof sp.x === 'number' ? { x: sp.x, z: sp.z, ...(Array.isArray(sp.face) ? { face: sp.face } : {}), ...(sp.stone ? { stone: sp.stone } : {}) } : { x: g.x, z: g.z }; }
    hero.run = (hero.run || 0) + 1; hero.at = null; hero.atXZ = null; hero.rest = false; hero.pending = null; walkFollow = null; placeNext = false;
    const from = [Math.round(h.x), Math.round(h.z)], t0 = tNow();
    let p = null; try { p = H0.dash(target); } catch (e) { p = null; }
    const how = H0.dashing === 2 ? 'fade' : H0.dashing === 1 ? 'walk' : 'none';
    emit('twinGoTo', { from, to: [Math.round(g.x), Math.round(g.z)], how, marker: m ? m.job : null });
    Promise.resolve(p).then((ok) => { const q = S0.heroXYZ(twinHP); emit('twinGoToEnd', { ok: !!ok, s: Math.round((tNow() - t0) * 100) / 100, at: [Math.round(q.x), Math.round(q.z)] }); }, () => {});
    return { ok: !!p, how };
  }
  /** (note 11, "בהסתת רמה 4 הדמות נבלעת בתוך הקיר") at the wall his banker is at the face's foot, outside it, while the course rises
      over him; the follow camera looks from inside the courts, so the wall stood between it and him. While he works a course more than
      3 amot over his feet from outside its face (within 16 amot of it, 30 along it), the follow camera looks from the outer side,
      half a radian round. Read 2.5 times a second (nextSlot allocates) → a bearing | null */
  const navSide = { t: -1e9, az: null };
  function twinCamSide(d, el, az0) {
    const tn = tNow(); if (Math.abs(tn - navSide.t) < 0.4) return navSide.az; navSide.t = tn; navSide.az = null;
    if (twinStage() !== 'wall') return s21CamClear(d, el, az0);
    s21El = NaN; s21Prev = NaN; s21PrevE = NaN;   // ── stages21 ── (the wall keeps SITE20's own bearing and the default elevation)   // ── stages21 ── (every other stage: the first bearing from which no built mass stands between the camera and him) ── /stages21 ──
    if (!W.has('nextSlot')) return null;
    const S0 = world && (world.stages || world), h = S0 && typeof S0.heroXYZ === 'function' ? S0.heroXYZ(twinHP) : null; if (!h || !Number.isFinite(h.x)) return null;
    let s = null; try { s = W.nextSlot('wall'); } catch (e) { s = null; }
    if (!s || !Array.isArray(s.n) || !Array.isArray(s.face) || !Number.isFinite(s.y)) return null;
    const nx = s.n[0], nz = s.n[1], side = (h.x - s.face[0]) * nx + (h.z - s.face[2]) * nz, along = Math.abs(-(h.x - s.face[0]) * nz + (h.z - s.face[2]) * nx);
    if (side > 0.5 && side < 16 && along < 30 && s.y - h.y > 3) navSide.az = Math.atan2(nz, nx) + 0.5;
    return navSide.az;
  }
  // ── stages21 ── (the owner, 8.10: "בשלב העזרת נשים השחקן בתוך הקיר"; the kid run: from the court's inside the follow camera looked through the built
  // wall at his banker on its outer foot, so he was hidden behind it) the follow camera's bearing at every stage but the wall: its default when no
  // built mass (a court's wall, a gatehouse, a chamber, the altar's tiers — the stages' own frameBlocked) stands between it and his chest or his
  // head; else the nearest turn from which none does (kept while it stays clear — no flicker). Read 2.5 times a second → a bearing | null
  function s21CamClear(d, el, az0) {
    s21El = NaN;
    const id = twinStage(), S0 = world && (world.stages || world), h = S0 && typeof S0.heroXYZ === 'function' ? S0.heroXYZ(twinHP) : null;
    if (!id || id === 'har' || !h || !Number.isFinite(h.x) || !Number.isFinite(d) || !W.has('frameBlocked')) return null;
    const y1 = h.y + 1.6, y2 = h.y + 3.4;
    const at = (az, e) => { const ce = Math.cos(e), se = Math.sin(e); return [h.x + ce * Math.cos(az) * d, y1 + se * d, h.z + ce * Math.sin(az) * d]; };
    const blk = (az, e) => { const q = at(az, e); return W.frameBlocked(q[0], q[1], q[2], h.x, y1, h.z, id) || W.frameBlocked(q[0], q[1], q[2], h.x, y2, h.z, id); };
    if (!blk(az0, el)) { s21Prev = NaN; s21PrevE = NaN; return null; }
    const blk1 = (az, e) => { const q = at(az, e); return W.frameBlocked(q[0], q[1], q[2], h.x, y1, h.z, id); };   // (the search: his chest only — half the rays)
    if (Number.isFinite(s21Prev) && !blk1(s21Prev, s21PrevE)) { if (s21PrevE !== el) s21El = s21PrevE; return s21Prev; }
    // the nearest turn first at the default elevation, then the same turns from higher up (a steeper look over the walls: up to 1.45 rad)
    for (const de of [0, 0.3, 0.5]) { const e = Math.min(1.45, el + de); for (const off of [0.5, -0.5, 1.0, -1.0, 1.6, -1.6, 2.2, -2.2, Math.PI]) { if (!blk1(az0 + off, e)) { s21Prev = az0 + off; s21PrevE = e; if (e !== el) s21El = e; return s21Prev; } } }
    return null;
  }
  let s21Prev = NaN, s21PrevE = NaN, s21El = NaN;
  // ── /stages21 ──
  /** a walk the game itself needs (the course check's stand, the key moment's spot): under two thumbs a way over 14 amot is the
      compass's (≤ 1.5 s, a dust trail or a fade) — never a long walk the player watches; else the walk as before → Promise */
  function navGo(t) {
    const S0 = world && (world.stages || world), H0 = S0 && S0.hero;
    if (twinOn() && H0 && typeof H0.dash === 'function' && t && typeof t.x === 'number') { const h = S0.heroXYZ(twinHP); if (Math.hypot(h.x - t.x, h.z - t.z) > 14) { emit('navGo', { to: [Math.round(t.x), Math.round(t.z)], how: 'dash' }); try { return H0.dash(t); } catch (e) { /* the walk below */ } } }
    return W.walkTo(t);
  }
  /** the button's "↩ לעבודה" (far from his work, nothing marked): the compass's way — ≤ 1.5 s — instead of a long walk; the old walk
      when the compass has nowhere to point (no allocation: the spec is the one twinWork made, its go swapped) */
  let navBackGo = null;
  const navBack = () => { const r = twinGoTo(); if (!(r && r.ok) && navBackGo) navBackGo(); else emit('twinBack', { id: twinStage(), how: r.how }); };
  function navWork(w) { if (w && w.job === 'back' && w.go !== navBack) { navBackGo = w.go; w.go = navBack; } return w; }
  // ── /nav19 ──
  /** the deal at site id as markers in the world (no sheet): each card over its work — SITE14's jobSpot, else his banker */
  function twinDeal(id, d) {
    const bank = spotOf({ id }), bankY = bank && typeof bank.x === 'number' ? W.groundAt(bank.x, bank.z) : null, out = [];
    (d.cards || []).forEach((job, k) => {
      let js = W.has('jobSpot') ? W.jobSpot(job, { site: id }) : null;
      if (js && typeof js.x === 'number' && bank && typeof bank.x === 'number' && (Math.hypot(js.x - bank.x, js.z - bank.z) > 45 || (bankY != null && Math.abs(W.groundAt(js.x, js.z) - bankY) > 4))) js = null;
      let x = js && typeof js.x === 'number' ? js.x : bank && typeof bank.x === 'number' ? bank.x : null, z = js && typeof js.x === 'number' ? js.z : bank && typeof bank.z === 'number' ? bank.z : null;
      if (x == null) return;
      if (out.some((m) => Math.hypot(m.x - x, m.z - z) < 5)) { x += 6; z += 3 * (k ? 1 : -1); }   // (two cards at one banker: side by side)
      // (fix round, kid17: a marker he could not walk to) the marker stands where his feet can reach — the nearest such place to its work
      // (the job's own walk takes him the rest of the way)
      try { const S0 = world && (world.stages || world), hh = S0 && S0.heroXYZ ? S0.heroXYZ({}) : null, top20 = !!(S0 && S0.hero && typeof S0.hero.s20 === 'function' && S0.hero.s20().act && S0.hero.s20().topAt(x, z) > -1e8) /* ── site20 ── (a marker on the wall's laid top stays there: the ramp is his way up) ── /site20 ── */, rr = top20 ? null : hh && S0.hero && typeof S0.hero.line === 'function' ? S0.hero.line(hh.x, hh.z, x, z) : hh && S0.hero && typeof S0.hero.reach === 'function' ? S0.hero.reach(hh.x, hh.z, x, z) : null; if (rr && rr.d > 2) { x = rr.x; z = rr.z; } } catch (e) { /* the world's */ }   // ── twin18 ── (line: where a straight drag gets him) ── /twin18 ──
      const R = JB.JOBS[job] || {}, key = job === 'key' ? d.key : null, kw = key ? keyWords(key, key.i === 0) : null;
      out.push({ job, site: id, icon: TW_ICON[job] || '★', label: kw ? kw.act : JB.jobName(job, id), x, y: W.groundAt(x, z), z, kind: R.kind });
    });
    twinMarks = out; twinMarkN++; twinDealRef = d;   // ── twin18 ── (twinDealRef: the deal the markers show) ── /twin18 ──
    emit('twinDeal', { id, marks: out.map((m) => ({ job: m.job, x: Math.round(m.x), z: Math.round(m.z) })) });
    if (out.length && ui && typeof ui.banner === 'function' && twinMarkN === 1) { try { ui.banner('לכו לסימן!');   /* ── ux24 ── (was "לכו לסימון ועבדו!") ── /ux24 ── */ } catch (e) { /* LAND17's */ } }
  }
  // ── /twin17 ──
  let lastFrameMs = 0, coachChk = 0;
  // ── fable32 (build 42) ── the new stage 01 (har42.js): the old Mount's site not worked (no crews on it), the old opening and the old
  // first-time flow not played; its end completes the Mount (S.completeStage) and the stages after it play as before ── /fable32 ──
  function startHar42() {
    for (const c of G.crews || []) if (c.at === 'har') c.at = null;
    H42 = createHar42({
      stages: world && (world.stages || world), view,
      spot: () => { try { return W.workSpot('har', 'dress'); } catch (e) { return null; } },
      emit: (t, d) => emit(t, d),
      keepAwake: () => { try { if (hooks.setAutoRotate) hooks.setAutoRotate(false); } catch (e) { /* */ } },
      snapshot: () => { try { const T = globalThis.__T; T.render(); return T.renderer.domElement.toDataURL('image/jpeg', 0.55); } catch (e) { return null; } },
      timeOfDay: (k) => { try { if (W.setTimeOfDay) W.setTimeOfDay(k); } catch (e) { /* */ } },   // ── fable32 (build 43) ── (the reveal's late sun; the real clock again after the card) ── /fable32 ──
      complete: () => { const out = S.completeStage(G, 'har'); G.ftue = Math.max(G.ftue | 0, 99); G.op = 1; persist(); syncWorld(null); hideNext44(); return out; },
      onExit: (done) => { H42 = null; tod = null; try { syncTime(); } catch (e) { /* */ } if (done) { try { syncWorld(null); } catch (e) { /* */ } } try { ui.refresh(); } catch (e) { /* */ } if (done) after01(); },
    });
    H42.start();
  }
  // ── fable32 (build 44) ── between stage 01 and stage 02 (docs/specs/shlav-alef-v2-he.md §8, §12; shlav-alef-hard-fun-he.md §5):
  // the reveal shows no next target (its gold beam and outline wait for the card); after the card, once, THE VISION (Phase B's finished
  // House at sunrise, one act — main.js enterVision → the shift's runVision; a saved flag, never again); then the craftsman's test before
  // chapter ב׳ (har42.js test44: three jobs at level 2) — and חצר האומנים (yard44) from the menu or the test's card
  const VISION_KEY = 'bh_vision44';
  const visionSeen = () => { try { return !!(G.vision44 || (globalThis.localStorage && localStorage.getItem(VISION_KEY))); } catch (e) { return !!G.vision44; } };
  function hideNext44() { try { for (const s of STAGES) if (S.statusOf(G, s.id) === 'avail') W.setStage(s.id, 'locked', 0, { instant: true }); } catch (e) { /* */ } }
  function wantedTest44() {
    if (!G || G.demo || !S.isDone(G, 'har') || (G.st && G.st.wall) || globalThis.__H44_OFF) return false;
    try { if (/[?&]test44=0(&|$)/.test(location.search || '')) return false; } catch (e) { /* */ }
    const t = load42().test44; return !(t && t.passed);
  }
  function after01() {
    if (!visionSeen() && !G.demo && hooks.enterVision) {
      G.vision44 = 1; try { localStorage.setItem(VISION_KEY, '1'); } catch (e) { /* the save's flag */ } persist(); emit('vision44', {});
      try { hooks.enterVision(); return; } catch (e) { /* the test, then */ }
    }
    if (wantedTest44()) startH44('test');
  }
  function startH44(mode, back = '') {
    if (H42 && H42.on) return;
    H42 = createHar42({
      mode, from: back, stages: world && (world.stages || world), view,
      spot: () => { try { return W.workSpot('har', 'dress'); } catch (e) { return null; } },
      emit: (t, d) => emit(t, d),
      keepAwake: () => { try { if (hooks.setAutoRotate) hooks.setAutoRotate(false); } catch (e) { /* */ } },
      onExit: (done, next) => {
        H42 = null; try { syncWorld(null); } catch (e) { /* */ } try { ui.refresh(); } catch (e) { /* */ }
        if (next === 'yard') { startH44('yard', 'test'); return; }
        if (mode === 'yard' && (back === 'test' || wantedTest44())) { if (wantedTest44()) startH44('test'); return; }
        if (mode === 'test' && done) { try { ui.toast && ui.toast('פרק ב׳ נפתח — חומת העזרה'); } catch (e) { /* */ } if (wanted45()) startHar45(); }   // ── fable32 (build 45) ── (the test passed: the wall, at once) ── /fable32 ──
      },
    });
    H42.start();
  }
  // ── /fable32 ──
  // ── fable32 (build 45) ── stage 02, חומת העזרה, the new way (docs/specs/shlav-alef-v2-he.md §7, §10 "02"): it takes the wall over as the
  // new stage 01 took the Mount — when the Mount is done and the craftsman's test passed (or not wanted), and the wall not done; the old
  // wall's flow behind the same switches (?wall45=0, ?stick=1, the demo); its end completes the wall, the stages after it play as before
  function wanted45() {
    if (!G || G.demo || !S.isDone(G, 'har') || S.isDone(G, 'wall') || globalThis.__H45_OFF) return false;
    try { if (/[?&](wall45=0|stick=1|har42=0)(&|$)/.test(location.search || '')) return false; } catch (e) { /* */ }
    if (wantedTest44()) return false;
    const w = G.st && G.st.wall; return !(w && !w.h45 && (w.p > 0 || w.c > 0));   // (a wall the old way already begun stays the old way's)
  }
  // ── fable32 (build 46) ── his stretch of the court wall stands in it for good (har42 wallStones45; the stage's save: bh_har42.wall.stones)
  function ensureWall45() {
    try { if (!G || !S.isDone(G, 'wall')) return; const H = load42(), w = H && H.wall; if (!w || !Array.isArray(w.stones) || !w.stones.length) return; if (migrate45(w)) save42(H);   // (build 47: a build-46 stretch moved out of שער הקרבן)
      wallStones45({ list: w.stones, hole: w.hole, scene: world && world.scene, center: w.hole ? [(w.hole[0] + w.hole[1]) / 2, -73] : null }); } catch (e) { /* */ }
  }
  function startHar45() {
    if (H42 && H42.on) return;
    for (const c of G.crews || []) if (c.at === 'wall') c.at = null;
    const nx = wanted46(true) ? STAGES.find((x) => x.id === 'sorag') : STAGES.find((x) => x.deps && x.deps.includes('wall'));   // (build 46: in the new order, v2 §10 — 03 the soreg)
    H42 = createHar42({
      stage: 'wall', stages: world && (world.stages || world), view, nextName: nx ? nx.n : '',
      spot: () => { try { return W.workSpot('wall', 'dress'); } catch (e) { return null; } },
      emit: (t, d) => emit(t, d),
      keepAwake: () => { try { if (hooks.setAutoRotate) hooks.setAutoRotate(false); } catch (e) { /* */ } },
      timeOfDay: (k) => { try { if (W.setTimeOfDay) W.setTimeOfDay(k); } catch (e) { /* */ } },
      complete: () => { const out = S.completeStage(G, 'wall'); persist(); syncWorld(null); hideNext44(); return out; },
      onExit: (done) => { H42 = null; tod = null; try { syncTime(); } catch (e) { /* */ } try { syncWorld(null); } catch (e) { /* */ } try { ui.refresh(); } catch (e) { /* */ } if (done && wanted46()) setTimeout(() => { if (!H42) startHar46(); }, 400); },   // (build 46: on to stage 03)
    });
    H42.start();
  }
  // ── fable32 (build 46) ── stage 03, הסורג והחיל, the new way (har42 STG 'soreg'): after the court wall, before the gates (v2 §10's order); the
  // old flow behind the same switches (?soreg46=0, ?stick=1, ?har42=0, the demo, a soreg begun the old way); the stages after it as before
  function wanted46(ignoreWall) {
    if (!G || G.demo || !S.isDone(G, 'har') || S.isDone(G, 'sorag') || globalThis.__H46_OFF) return false;
    if (!ignoreWall && !S.isDone(G, 'wall')) return false;
    try { if (/[?&](soreg46=0|stick=1|har42=0)(&|$)/.test(location.search || '')) return false; } catch (e) { /* */ }
    if (wantedTest44()) return false;
    const w = G.st && G.st.sorag; return !(w && (w.p > 0 || w.c > 0));
  }
  // ── fable32 (build 47) ── stage 04, שערי העזרה, the new way (har42 STG 'gates'): after the soreg; the old flow behind ?gates47=0, ?stick=1,
  // ?har42=0, the demo, gates begun the old way; the stages after it as before
  function wanted47() {
    if (!G || G.demo || !S.isDone(G, 'har') || !S.isDone(G, 'wall') || !S.isDone(G, 'sorag') || S.isDone(G, 'gates') || globalThis.__H47_OFF) return false;
    try { if (/[?&](gates47=0|stick=1|har42=0)(&|$)/.test(location.search || '')) return false; } catch (e) { /* */ }
    if (wantedTest44()) return false;
    const w = G.st && G.st.gates; return !(w && (w.p > 0 || w.c > 0));
  }
  // ── fable32 (build 48) ── stage 05, עזרת הנשים, the new way (har42 STG 'nashim'): after the gates; the old flow behind ?nashim48=0, ?stick=1,
  // ?har42=0, the demo, the court begun the old way. No glimpse of שמחת בית השואבה here (the owner: it opens on its date in Phase B)
  function wanted48() {
    if (!G || G.demo || !['har', 'wall', 'sorag', 'gates'].every((id) => S.isDone(G, id)) || S.isDone(G, 'nashim') || globalThis.__H48_OFF) return false;
    try { if (/[?&](nashim48=0|stick=1|har42=0)(&|$)/.test(location.search || '')) return false; } catch (e) { /* */ }
    if (wantedTest44()) return false;
    const w = G.st && G.st.nashim; return !(w && (w.p > 0 || w.c > 0));
  }
  function startHar48() {
    if (H42 && H42.on) return;
    for (const c of G.crews || []) if (c.at === 'nashim') c.at = null;
    const nx = STAGES.find((x) => x.id === 'nikanor');
    H42 = createHar42({
      stage: 'nashim', stages: world && (world.stages || world), view, nextName: nx ? nx.n : '',
      emit: (t, d) => emit(t, d), sound: (k) => { try { sfx.play(k); } catch (e) { /* a sound we lack */ } },
      keepAwake: () => { try { if (hooks.setAutoRotate) hooks.setAutoRotate(false); } catch (e) { /* */ } },
      timeOfDay: (k) => { try { if (W.setTimeOfDay) W.setTimeOfDay(k); } catch (e) { /* */ } },
      complete: () => { const out = S.completeStage(G, 'nashim'); persist(); syncWorld(null); hideNext44(); return out; },
      onExit: () => { H42 = null; tod = null; try { syncTime(); } catch (e) { /* */ } try { syncWorld(null); } catch (e) { /* */ } try { ui.refresh(); } catch (e) { /* */ } },
    });
    H42.start();
  }
  function startHar47() {
    if (H42 && H42.on) return;
    for (const c of G.crews || []) if (c.at === 'gates') c.at = null;
    const nx = STAGES.find((x) => x.id === 'nashim');
    H42 = createHar42({
      stage: 'gates', stages: world && (world.stages || world), view, nextName: nx ? nx.n : '',
      emit: (t, d) => emit(t, d), sound: (k) => { try { sfx.play(k); } catch (e) { /* a sound we lack */ } },
      keepAwake: () => { try { if (hooks.setAutoRotate) hooks.setAutoRotate(false); } catch (e) { /* */ } },
      timeOfDay: (k) => { try { if (W.setTimeOfDay) W.setTimeOfDay(k); } catch (e) { /* */ } },
      complete: () => { const out = S.completeStage(G, 'gates'); persist(); syncWorld(null); hideNext44(); return out; },
      onExit: (done) => { H42 = null; tod = null; try { syncTime(); } catch (e) { /* */ } try { syncWorld(null); } catch (e) { /* */ } try { ui.refresh(); } catch (e) { /* */ } if (done && wanted48()) setTimeout(() => { if (!H42) startHar48(); }, 400); },   // (build 48: on to stage 05)
    });
    H42.start();
  }
  function startHar46() {
    if (H42 && H42.on) return;
    for (const c of G.crews || []) if (c.at === 'sorag') c.at = null;
    const nx = STAGES.find((x) => x.id === 'gates');
    H42 = createHar42({
      stage: 'soreg', stages: world && (world.stages || world), view, nextName: nx ? nx.n : '',
      emit: (t, d) => emit(t, d),
      keepAwake: () => { try { if (hooks.setAutoRotate) hooks.setAutoRotate(false); } catch (e) { /* */ } },
      timeOfDay: (k) => { try { if (W.setTimeOfDay) W.setTimeOfDay(k); } catch (e) { /* */ } },
      complete: () => { const out = S.completeStage(G, 'sorag'); persist(); syncWorld(null); hideNext44(); return out; },
      onExit: (done) => { H42 = null; tod = null; try { syncTime(); } catch (e) { /* */ } try { syncWorld(null); } catch (e) { /* */ } try { ui.refresh(); } catch (e) { /* */ } if (done && wanted47()) setTimeout(() => { if (!H42) startHar47(); }, 400); },   // (build 47: on to stage 04 — never the old HUD's "התחל לבנות")
    });
    H42.start();
  }
  // ── /fable32 ──
  function frame(ms) {
    if (H42 && H42.on) { H42.frame(ms); return; }   // ── fable32 (build 42) ── ── /fable32 ──
    ui.frame(ms);
    twinTick(ms);   // ── twin17 ── ── /twin17 ──
    { const dt = lastFrameMs ? Math.min(0.5, Math.max(0, (ms - lastFrameMs) / 1000)) : 0; lastFrameMs = ms; keepAtWork(dt); keepInFrame(ms); stepFollow(ms); if ((coachChk -= dt) <= 0) { coachChk = 0.5; staleCoach(); if (beatWait || checkWait) courseMoment(); } }   // ── director13 ── (a course end's moment that waited)
    if ((dealWant || dealOpen) && coachChk === 0.5) dealTry();   // ── fun14 ── (twice a second: a deal that waits opens once the scene is clear; a stale one closes) ── /fun14 ──
    if (!markT || hero.busy || overlay || momentBusy || opening || whole || ui.busy || ui.markOn || tNow() < camHold) { markHidT = 0; return; }
    if (!markHidT) { markHidT = ms; return; }
    if (ms - markHidT < 1200 || ms - markAimT < 4000) return;
    markAimT = ms; markHidT = 0;
    emit('markAim', markT.boulder != null ? { boulder: markT.boulder } : { at: markT === BANKER_T ? 'banker' : markT });
    // ── director13 ── (the frames that lose him at every later stage: probe df2 found the camera 350 amot off over the Mount at the
    // Ezrat Nashim's dig) workCam is the Mount's own frame — at a later stage, whose ring marks his banker or him, it framed the
    // finished Mount (W.focus('har') → the world's far focus); there the safety net is his work frame
    if (markT.boulder != null) boulderCam(markT.boulder, 1300);
    else { const wid = curWork(); if (wid && wid !== 'har') workFrame(wid, 1300); else workCam(1300); }
  }
  /** ── the owner, 28.9 21:42–21:57 ── after the first-time flow nothing is marked, so the pointer's safety net above never runs in
      the Mount's courses: when the builder himself is out of the frame for 1.5 s while he is idle there (after the corner
      stone's delivery, the course check, a bay that moved on), the camera goes back to his work — at most every 4 s */
  let heroHidT = 0, heroAimT = -1e9;
  function keepInFrame(ms) {
    if (twinOn() && TW.cam) { heroHidT = 0; return; }   // ── twin17 ── (the follow camera holds him) ── /twin17 ──
    // (── flow10 ── the ring now marks his banker after the first-time flow too: the builder himself is checked either way)
    if ((markT && markT.boulder != null) || hero.busy || overlay || momentBusy || opening || whole || ui.busy || tNow() < camHold || !view || !view.project) { heroHidT = 0; return; }
    // (── flow11 ── at every stage's work, not only the Mount's courses; never while the player looks around by himself)
    const id = curWork(); if (!id || looking()) { heroHidT = 0; return; }
    const hp = W.heroPos(); if (!hp || !Number.isFinite(hp.x)) return;
    const q = view.project(hp.x, hp.y + 2, hp.z), p = { x: q.x, y: q.y, on: q.on };   // (view.project fills one shared object)
    // (── flow11 ── "זום אאוט" never again, PRODUCER11's K80: in the frame but tiny — a flight that framed a whole site from ~1000
    //  amot (the gates' dig, s1-06…09: 4 px) — is not "in view"; a player's own zoom out is left alone for 15 s)
    let tiny = false;
    if (p.on && tNow() - lookedT > 15) { const f = view.project(hp.x, hp.y, hp.z); tiny = !!f.on && Math.abs(f.y - p.y) * 1.8 < 40; }
    // (── flow11 ── PRODUCER11 N56: his centre 24 px from the side is half of him cut: 48)
    if (!tiny && p.on && p.x > 48 && p.x < innerWidth - 48 && p.y > (G.demo ? 140 : 110) && p.y < innerHeight - 130) { heroHidT = 0; return; }   // ── director13 ── (the demo's chips)
    if (!heroHidT) { heroHidT = ms; return; }
    if (ms - heroHidT < 1500 || ms - heroAimT < 4000) return;
    heroAimT = ms; heroHidT = 0;
    emit('heroAim', { id, x: Math.round(hp.x), z: Math.round(hp.z) });
    workFrame(id, 1300);
  }
  /** ── flow9 ── the safety net's frame for the builder's own work (the survey's stake, the banker): close on his spot (SITE's
      workSpot), over the slot when it is near (≤ 40 amot), from outside the face — the builder and his block in frame even when
      the world's own frame of the site misses them (QA9 15:46: "bare ground") */
  function workCam(dur = 1300) {
    const j = S.jobOf(G, 'har'), kind = j && (j.kind === 'survey' || j.kind === 'dig') ? 'survey' : 'dress';
    // (DESIGN9 16:27, one owner per shot) the stones' frame is the world's focus (SITE9's bay from the hill's side = CAM.WALL);
    // a lookAt from outside the face ends in the earth at the Mount. Our own frame is only for the survey's stake.
    if (kind === 'dress' && W.has('boulderView')) { if (!wallFrame('har', dur)) W.focus('har', dur); return; }
    const b = W.workSpot('har', kind), hp = W.heroPos();
    const at = b && typeof b.x === 'number' ? b : hp && Number.isFinite(hp.x) ? hp : null;
    if (!at || !view || !view.lookAt) { W.focus('har', dur); return; }
    const sl = kind === 'dress' ? W.nextSlot('har') : null, near = sl && typeof sl.x === 'number' && Math.hypot(sl.x - at.x, sl.z - at.z) <= 40;
    const x = near ? (at.x + sl.x) / 2 : at.x, z = near ? (at.z + sl.z) / 2 : at.z, c = W.siteTop('har');
    const az = near && Array.isArray(sl.n) ? (Math.atan2(sl.n[1], sl.n[0]) * 180) / Math.PI + 35 : c ? (Math.atan2(z - c.z, x - c.x) * 180) / Math.PI + 35 : 25;
    view.lookAt(x, W.groundAt(x, z) + 2.5, z, kind === 'survey' ? 36 : 42, az, 24, dur);
  }

  /** ── flow11 ── the world's working frame of a site (SITE's wallView = the site's own focus in its courses: CAM.WALL), fitted to
      STAGING rule 1 / PRODUCER11's K80 ("the kohen ≥ 80 px and in frame") → flown; false when the world has none */
  function wallFrame(id, dur) {
    if (!W.has('flyTo')) return false;
    const v = workView(id); if (!v || !Array.isArray(v.p) || !Array.isArray(v.t)) return false;
    const hp = W.heroPos(), sp = workSpotAt(id), at = restSpot(hp) || (sp && typeof sp.x === 'number' ? { x: sp.x, y: spotY(sp, hp), z: sp.z } : hp && Number.isFinite(hp.x) ? hp : null);   // ── director13 ── (restSpot, spotY)
    // (── flow11 ── the work around him stays in: the next slot, and the crane at this site — its hook's x/z, 6 amot up)
    const also = [], sl = G.st[id] && G.st[id].p === 'courses' ? W.nextSlot(id) : null, cr = W.craneAt();
    if (sl && Array.isArray(sl.face)) also.push({ x: sl.face[0], y: sl.y + (sl.h || 1) / 2 + 0.3, z: sl.face[2] });
    if (sl && cr && cr.site === id && Number.isFinite(cr.x)) also.push({ x: cr.x, y: W.groundAt(cr.x, cr.z) + 6, z: cr.z });   // (the courses only: PRODUCER11 N56, at the survey the crane's side pushed him to the edge)
    const f = fitHero(v.p, v.t, at, also);
    // ── director13 ── (C8 at the altar, C9 at the House, probe df3: the world's frame kept even when its line to HIM is blocked — the
    // altar's tiers, the crane beside his banker, the Ulam when he rests behind it) a working frame that cannot see him is not
    // flown: his close frame instead (from outside the site, its centre behind him, the first clear bearing)
    // (integration v26: not at the Mount — its bay is a pit in the hill, every low bearing reads blocked, and the close frame went
    //  up to 66°, a top-down 25-px kohen at s52 of game-courses-touch part 2; the bay's own frame from the hill's side, as in v25)
    if (id !== 'har' && at && W.has('frameBlocked') && W.frameBlocked(f.p[0], f.p[1], f.p[2], at.x, at.y + 1.8, at.z, id) && W.frameBlocked(f.p[0], f.p[1], f.p[2], at.x, at.y + 3.2, at.z, id)) { emit('workFrame', { id, blocked: true }); closeFrame(id, dur); return true; }
    // ── /director13 ──
    W.flyTo(f.p, f.t, dur);
    emit('workFrame', { id, px: f.px, pulled: f.k < 1, panned: f.pan > 0, side: f.side });
    return true;
  }
  /** his on-screen height and place from a camera at p looking at t (the host's 32° lens, portrait or not) — no camera moved */
  const LENS = Math.tan((16 * Math.PI) / 180);
  function heroOnScreen(p, t, at) {
    const W0 = typeof innerWidth === 'number' && innerWidth > 0 ? innerWidth : 390, H0 = typeof innerHeight === 'number' && innerHeight > 0 ? innerHeight : 844;
    let fx = t[0] - p[0], fy = t[1] - p[1], fz = t[2] - p[2]; const fl = Math.hypot(fx, fy, fz) || 1; fx /= fl; fy /= fl; fz /= fl;
    let rx = -fz, rz = fx; const rl = Math.hypot(rx, rz) || 1; rx /= rl; rz /= rl;   // right = forward × up
    const ux = -rz * fy, uy = rz * fx - rx * fz, uz = rx * fy;                          // up' = right × forward
    const proj = (x, y, z) => { const qx = x - p[0], qy = y - p[1], qz = z - p[2], cz = qx * fx + qy * fy + qz * fz; if (cz <= 0.5) return null;
      return { x: (0.5 + (qx * rx + qz * rz) / (cz * LENS * (W0 / H0)) / 2) * W0, y: (0.5 - (qx * ux + qy * uy + qz * uz) / (cz * LENS) / 2) * H0 }; };
    const a = proj(at.x, at.y, at.z), b = proj(at.x, at.y + 3.6, at.z);
    if (!a || !b) return null;
    return { px: Math.abs(a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, ok: (y) => y > (G && G.demo ? 158 : 118) && y < H0 - 150, W0, H0, proj, r: [rx, rz] };   // ── director13 ── (in the demo its chips cover y 100–144: his middle below them)
  }
  /** ── flow11 ── a frame {p, t} fitted to him: pulled in along its own line of sight until he stands ≥ 84 px tall (never nearer
      than 24 amot to its target — a nearer point on the same ray sees less in between, so a clear line of sight stays clear), then
      panned toward him while he stands outside the safe frame (the top bar, the bottom HUD) */
  function fitHero(p, t, at, also = []) {
    const out = { p: p.slice(), t: t.slice(), px: 0, k: 1, pan: 0, side: 0 };
    if (!at || !Number.isFinite(at.x) || !Number.isFinite(at.y)) return out;
    const d0 = Math.hypot(p[0] - t[0], p[1] - t[1], p[2] - t[2]);
    const cam = (k, u, w = 0) => { const s0 = heroOnScreen(p, t, at), rx = s0 ? s0.r[0] : 0, rz = s0 ? s0.r[1] : 0;
      const tt = [t[0] + (at.x - t[0]) * u + rx * w, t[1] + (at.y + 1.8 - t[1]) * u, t[2] + (at.z - t[2]) * u + rz * w]; return { p: [tt[0] + (p[0] - t[0]) * k, tt[1] + (p[1] - t[1]) * k, tt[2] + (p[2] - t[2]) * k], t: tt }; };
    const inX = (q, m) => !!q && q.x > m && q.x < (typeof innerWidth === 'number' ? innerWidth : 390) - m;
    const alsoIn = (c, s) => also.every((a) => { const q = s.proj(a.x, a.y, a.z); return !q || (inX(q, 14) && q.y > 90 && q.y < s.H0 - 130); });
    // 1. in along the frame's own ray until he is ≥ 84 px — but once he is ≥ 80, not so far that the slot or the crane leaves it
    // ── director13 ── (K80 read by touch at 76–77 px where this fit said ≥ 80: where he stands is not exactly his spot) a margin:
    // ≥ 90 px, and the slot or the crane may stop the pull only from 86
    let k = 1, s = heroOnScreen(p, t, at);
    while (s && s.px < 90 && d0 * k * 0.95 >= 24) {
      const c2 = cam(k * 0.95, 0), s2 = heroOnScreen(c2.p, c2.t, at);
      if (!s2 || (s.px >= 86 && !alsoIn(c2, s2))) break;
      k *= 0.95; s = s2;
    }
    // 2. toward him while he stands outside the safe frame (the top bar, the bottom HUD)
    let u = 0;
    while (s && (!s.ok(s.y) || s.x < 64 || s.x > s.W0 - 64) && u < 1) { u = Math.min(1, u + 0.2); const c = cam(k, u); s = heroOnScreen(c.p, c.t, at); }   // (his centre ≥ 64 px from a side: all of him, and the pointer over his head)
    // 3. sideways (along the frame's right) to centre him, the slot and the crane when one of them is cut at a side — he stays in
    let w = 0;
    if (s && also.length) {
      const xs = [s.x, ...also.map((a) => s.proj(a.x, a.y, a.z)).filter(Boolean).map((q) => q.x)], lo = Math.min(...xs), hi = Math.max(...xs), W0 = s.W0;
      if (lo < 30 || hi > W0 - 30) {
        const dist = d0 * k, perPx = (2 * dist * LENS * (W0 / s.H0)) / W0, want = ((lo + hi) / 2 - W0 / 2) * perPx;
        for (const f of [1, 0.75, 0.5, 0.25]) { const c = cam(k, u, want * f), s3 = heroOnScreen(c.p, c.t, at); if (s3 && s3.x > 72 && s3.x < W0 - 72 && s3.ok(s3.y)) { w = want * f; s = s3; break; } }
      }
    }
    // 4. (── flow11 ── PRODUCER11 s3-05/06: at the chambers the frame's camera stood just behind a built wall) a pan or a shift leaves the
    //  world's own clear ray: when the world can test a line (SITE11's frameBlocked) and the new one is blocked, back to the ray
    let c = cam(k, u, w);
    if ((u || w) && W.has('frameBlocked') && G.focus && W.frameBlocked(c.p[0], c.p[1], c.p[2], at.x, at.y + 1.8, at.z, G.focus)) {
      const c0 = cam(k, 0, 0); if (!W.frameBlocked(c0.p[0], c0.p[1], c0.p[2], at.x, at.y + 1.8, at.z, G.focus)) { c = c0; u = 0; w = 0; s = heroOnScreen(c.p, c.t, at); }
    }
    out.p = c.p; out.t = c.t; out.k = k; out.pan = u; out.side = Math.round(w * 10) / 10; out.px = s ? Math.round(s.px) : 0;
    return out;
  }

  act.hideInfo = () => { try { if (typeof hooks.hideInfo === 'function') hooks.hideInfo(); } catch (e) { /* the host's */ } };   // ── flow11 ── (N67)
  const api = {
    start, destroy, onSiteTap, onBoulderTap, onQuarryTap, frame,
    get state() { return G; },
    get busy() { return ui.busy || momentBusy || opening; },
    get juice() { return JU; },   // ── juice18 ── ── /juice18 ──
    get hook20() { return { chain: EC, ar: AR20, rd: RD20, solve: riddleSolved20, emit: (t, d) => emit(t, d), why: () => ({ started, demo: G.demo, whole, opening, momentBusy, overlay: !!overlay, jobBusy, SC: !!SC, busy: ui.busy, cam: tNow() - camHold, js: !!(JU && JU.stats().busy), dom: !!(ui.root && ui.root.querySelector('.gm-modal.on,.gm-mo,.fx-mg.on,.m3,.gm-dn,.gm-cine.on')), hands: !!(globalThis.__HANDS && globalThis.__HANDS.twin), pend: EC && EC.pending }) }; },   // ── hook20 ── (tests)
    get score() { return SCR; },   // ── hook19 ── (add(n, why) · grade(g) · get() · list() · unseen())
    get whole() { return whole; },
    enterWhole, exitWhole, newGame, save: persist, switchMode, skipChapter, demoNext, jumpTo, skipStage, pickStage,
    hold: (on) => overlayOn(!!on, true),   // (wave 10, GAMES10: an in-between game holds the loop; the crews' stones are placed, not lifted)
    onMissTap,                                          // ── flow8 ── (main.js pickAt: a tap on the world that hit nothing)
    /** ── flow10 ── (NET10's request) the partner's stone on the other device: one stone of crew-like work at site `id`, applied
        live like the crews' (never a key stone, the check or an unpaid segment) → true when a stone was set */
    coStone(id) { if (!started || whole || !G.st[id]) return false; const rep = S.coStone(G, id); if (!rep || !rep.stones[id]) return false; applyReport(rep, true); persist(); return true; },
    log, ui, sfx, settings: () => settings, get engagement() { return HK; },
    // ── land17 ── the settings' API and the bus (docs: bus/LAND17.md): game.setSetting('cam' | 'popups' | 'rhythm' | 'haptics' | 'mute', v) · game.on(type, fn) → off()
    setSetting: (k, v) => act.setSetting(k, v), on: busOn,
    /** a world place card tapped while popups is 'book': true = handled (nothing opens; a float and the book's note) */
    noteInfo(id, I) {
      if (!settings || settings.popups !== 'book' || !I) return false;
      act.bookNote({ k: 'place', t: I.t, d: I.d, ref: String(I.s || '').replace(/\s*·\s*טיוטה$/, '') });
      try { ui.float('נוסף לספר', innerWidth * 0.62, innerHeight * 0.36, 'gold'); } catch (e) { /* the HUD's */ }
      return true;
    },
    // ── /land17 ──
    /** test hooks */
    _: {
      toolsReach, toolsSync,   // ── tools21 ── (test/tools21-touch.cjs)
      hero, runMoment, ftueTo, tick, applyReport, settle: () => settleNow(now()), playLevel, playFor, keyStone, runInspect, openKings, buildStep, doAction,   // ── flow16 ── (playFor: the board's action for a site — the harness opens the board as the extra card does) ── /flow16 ──
      parts: () => Object.keys(parts()).filter((k) => parts()[k]),   // build6: which parts this build runs with (test/game-flow.cjs)
      stageIds: () => STAGES.map((s) => s.id), siteStones: (id) => S.siteStones(id),   // ── flow11 ── (test/game-reload-touch.cjs's saves)
      hk: () => HK,   // ── hooks ── (round 3: the hooks' own test entry points, test/playtest/r3-checks.cjs)
      /** after editing game.state directly (fixtures): push it to the world and the HUD */
      resync() { hero.gen++; hero.run = (hero.run || 0) + 1; hero.busy = false; hero.pending = null; hero.cur = null; hero.at = null; syncWorld(null); ui.refresh(); },
      /** pin the time of day (tests, screenshots): the world follows, with its rain and night lights */
      setTime(k) { opt.fixedTime = k; W.setTimeOfDay(k); tod = null; syncTime(); },
      /** pretend the player was away for ms: timers move back, the welcome-back flow runs */
      simulateAbsence(ms) {
        G.clock -= ms; G.lastSeen -= ms;
        for (const c of G.car) { c.t0 -= ms; c.t1 -= ms; }
        for (const t of G.train) { t.t0 -= ms; t.t1 -= ms; }
        const snap = S.snapshot(G), rep = settleNow(now());
        persist();
        return welcomeBack(snap, rep, null);
      },
    },
  };
  // ── middot10 ── the book's place links (middot-ui.js placeFlight): the HUD's act.showPlace and the api's showPlace(key, from);
  // while a place is shown the camera's safety nets wait (camHold), and act.bookSave keeps the quizzes' points
  const holdCam = (s) => { const until = tNow() + s; camHold = Math.max(camHold, until); return () => { if (camHold === until) camHold = tNow(); }; };
  act.showPlace = api.showPlace = (key, from) => placeFlight(key, { from, view, W, G: () => G, S, whole: () => whole, enterWhole, exitWhole, hooks, ui, hold: holdCam });
  api.holdCam = holdCam;   // (FUN11, N31) "כהנים יחד": the look at the other kohen holds the nets too, until the next tap or 10 s
  act.bookSave = () => persist();
  // (FUN11, wave 11) "שאלה ממסכת מידות" is today's question inside the learning points (one system, wave 10's ⚑ default): every
  // door to it (the book, the daily tasks, the training yard, the rest card) opens middot-ui's card; a right answer is the book's
  // points and silver, the daily task and the training's cut as before
  act.quizOpen = () => openDaily({ G, day: S.dayKey(now()), perDay: TRAIN.quizPerDay, ctx: { act, sfx }, ui, save: persist,
    onRight: () => {
      taskHit('quiz');
      scoreBonus(BONUS.quiz, 'quiz', 'תשובה נכונה');   // ── hook19 ── (a daily question answered right: ★200; the day's three questions are the cap)
      const t = Array.isArray(G.train) ? G.train.slice().sort((a, b) => a.t1 - b.t1)[0] : null;
      if (!t) return '';
      const cut = Math.min(S.gmMs(G, TRAIN.quizCutMin), Math.max(0, t.t1 - now()));
      t.t1 -= cut;
      return cut > 0 ? `ההכשרה קוצרה ב־${fmtSpan(cut)}` : '';
    } });
  // (FUN11) "איפה זה?": the camera flies to a place of the Temple and he names it (the book's points box)
  act.placeQuiz = () => openPlaceQuiz({ G, view, S, whole: () => whole, enterWhole, exitWhole, ui, hold: holdCam, ctx: { act, sfx }, save: persist });
  // ── /middot10 ──
  // ── fun14 ── (wave 14, the owner's daughter: "זה ארוך ומשעמם, היא רק בורחת למשחקי הביניים") the course loop (src/game/jobs.js).
  // In the courses, after the first-time flow, the pill and a tap on a waiting key stone open "מה נעשה עכשיו?": two cards (one
  // stone card, one craft card), one ↻. A card is a job: he walks to his work while its sheet rises, she plays it (20–30 s), and
  // it sets its share of the course (⌈left ÷ jobs left⌉, the crews' stones count in), pays coins by its stars (ECON14's
  // S.payJob, guarded) and stays in the building (SITE14's jobReveal, guarded). A free tap on him still strikes: it helps the
  // crews and pays nothing. Every walled course opens with "החוט הצבוע" (snap.js). The checks still close the course.
  var SC = null;          // "סתת בקצב" running: { id, n, of, perf, near, t0, timer, resolve }
  var dealWant = 0;       // a deal waits to open (after a job, a course's check, a load) — the frame loop opens it when clear
  var jobBusy = false;    // a job's turn is running
  var dealOpen = null;    // the site whose deal is on screen
  var lastStrike = null;  // the strike card's last count (its toast)
  const jobHas = (g) => !!(g && MG_GAMES && MG_GAMES[g]);
  const JOB_ACT = { line: 'measure', arch: 'tamp', F1: 'tamp', column: 'pull', tread: 'pull', saw: 'pull', wheel: 'pull', rafts: 'pull', gold: 'dress', plaster: 'tamp', bronze: 'dress', letters: 'dress' };   // (PEOPLE's act kinds)
  /** is action `a` the course loop's turn (a stone, a key stone, an event, a reset, a segment to pay — at a site with a deck) */
  function loopTurn(a) {
    if (!a || !a.id || reelOn() || whole || !JB.loopOn(G, a.id)) return false;
    if (a.kind === 'key' || a.kind === 'event') return true;
    if (a.kind === 'work') return a.job === 'stone' || a.job === 'event' || a.job === 'reset';
    if (a.kind === 'build') return a.step === 'seg';   // (paid on the way by the job)
    // ── flow16 ── the balance: with no stone to pay the deal is still dealt (his hands never wait; the crews do) — after the first-time
    // flow, whose board is the lesson ("▶ המחצבה" stays its pill)
    if (a.kind === 'play') return a.step === 'seg' && JB.freeHands(G);
    // ── /flow16 ──
    return false;
  }
  /** the pill, or a tap on him, while the course's key stone is due: its own card at once (its words were on the pill) */
  /** the key stone that waits for her hands at site id: due, or its card on the table → {i, game, what} | null */
  function keyNow(id) {
    const k = JB.keyDue(G, id, jobHas); if (k) return k;
    const d = JB.curOf(G, id).deal;
    return d && d.key && d.cards && d.cards.includes('key') && G.st[id] && G.st[id].keys[d.key.i] == null ? d.key : null;
  }
  function loopGo(id, viaKey) {
    const k = viaKey ? keyNow(id) : null;
    if (!k || jobBusy || SC || momentBusy || overlay) return openDeal(id);
    const cur = JB.curOf(G, id); cur.key = 1; cur.deal = { cards: ['key'], key: k, quarry: false, set: G.st[id].set };
    dealOpen = id;
    jobPick(id, 'key');
    return true;
  }
  const loopSite = () => { const a = S.nextAction(G, dealOpt); return loopTurn(a) ? a.id : null; };
  /** the deal's view for the HUD: { site, title, course, pips, cards: [{job, n, trade, hand, coins, isNew, src}], quarry } */
  function dealView(id, d) {
    const P = PROJ[id], cur = JB.curOf(G, id), Jn = JB.J(G, id, jobHas);
    const pips = Array.from({ length: Jn }, (_, k) => (k < cur.n ? 1 : 0));
    const card = (job) => {
      const R = JB.JOBS[job], key = job === 'key' ? d.key : null, lv = JB.levelOf(G, job);
      const kw = key ? keyWords(key, key.i === 0) : null;
      const art = key ? ({ crane: 'key', quarry: 'quarry', dress: 'strike', whole: 'plaster' }[key.game] || 'key') : job;
      return { job, art, n: kw ? kw.act : JB.jobName(job, id), trade: R.trade || '', hand: key && key.game === 'whole' ? 'tap' : R.hand || 'tap', coins: JB.coinsFor(3, lv), isNew: JB.isNew(G, id, job), src: JB.jobSrc(job, id), lv, kind: R.kind };
    };
    const bp = d.quarry ? boardPays(playFor(id) || { field: 'quarry', need: { stone: 1 } }) : null;
    // ── flow16 ── the extra card when the stock is out: what the crews need for the course and the board's par
    const xq = d.quarry && JB.freeHands(G) ? { label: '▶ הביאו אבנים', sub: `כ־${countTxt('stone', JB.crewsNeed(G, id, jobHas))} · לוח של ≈ ${isoNum(boardPar((G.m3 && G.m3.level && G.m3.level.quarry) || 1))} דק׳` } : null;
    // ── /flow16 ──
    const tip = (JB.jobsOf(G).tips | 0) < 3 ? 'כל עבודה בונה חלק מהנדבך, ומשלמת מטבעות לפי הכוכבים' : '';
    return { site: id, title: 'מה נעשה עכשיו?', tip, place: stageById(id).n, course: `נדבך ${isoNum(Math.min(P.C, cur.c + 1))} מתוך ${isoNum(P.C)}`, pips, cards: d.cards.map(card), quarry: xq || (d.quarry ? { label: '▶ הביאו אבנים', sub: bp ? `${bp.name || 'המחצבה'} · כ־${countTxt(bp.res, bp.n)}` : 'המלאי ריק: למחצבה' } : null), re: !(d.quarry && !xq) && (JB.curOf(G, id).re | 0) < 1 && d.cards.length > 1 };   // ── flow16 ── (xq: the cards stay beside the extra card)
  }
  /** open the deal at site id (the course's line first, when it opens a course) */
  async function openDeal(id) {
    if (!started || whole || opening || momentBusy || overlay || jobBusy || SC || !JB.loopOn(G, id)) return false;
    dealWant = 0;
    if (lineDue(id)) { await playLine(id); if (!JB.loopOn(G, id) || loopSite() !== id) return true; }
    const d = JB.dealNow(G, id, jobHas);
    if (!d.cards.length && !d.quarry) { emit('dealEmpty', { id }); return workAt(id); }   // (no card here: a tap strikes, as before)
    const J0 = JB.jobsOf(G); J0.tips = (J0.tips | 0) + 1;   // (the first three deals say what a card does)
    persist();
    dealOpen = id;
    // ── twin17 ── (two thumbs) the cards become markers over their work in the world: no sheet, no frame — he walks there
    const asList = twinSheet; twinSheet = false;
    if (twinOn() && !asList) { twinDeal(id, d); emit('dealShown', { id, cards: d.cards.slice(), key: d.key ? d.key.game : null, quarry: !!d.quarry, c: JB.curOf(G, id).c, twin: true }); return true; }
    // ── /twin17 ──
    ui.closeSheet(); if (G.ftue >= 99) ui.coach(null, '');   // (the first-time flow's own line stays: "סיתות, סיתות, הנחה")
    // (his work in the frame again — a job's game framed the site from its front — with him above the deal's cards)
    if (tNow() >= camHold && !looking() && !reelOn()) dealFrame(id);
    ui.deal(dealView(id, d));
    // (a job set many stones at once: the world re-poses the crane, its stock and his banker after the lift — frame them then)
    if (W.has('onPosed')) W.onPosed(id, (ok) => { if (ok && dealOpen === id && !hero.busy && !momentBusy && tNow() >= camHold && !looking() && !reelOn()) dealFrame(id); }, 8000);
    emit('dealShown', { id, cards: d.cards.slice(), key: d.key ? d.key.game : null, quarry: !!d.quarry, c: JB.curOf(G, id).c });
    return true;
  }
  function dealClose() { twinMarks = []; if (dealOpen) { dealOpen = null; ui.deal(null); } }   // ── twin17 ── (twinMarks) ── /twin17 ──
  /** his work's frame (the Mount's and the wall's courses: the world's wall frame, fitted to him) with the look tilted down toward
      the camera until his feet stand above the deal's cards (≤ 58% of the screen) — the camera itself does not move (K80 kept) */
  function dealFrame(id) {
    const v = (id === 'har' || id === 'wall') && W.has('flyTo') ? workView(id) : null;
    const hp = W.heroPos(), sp = workSpotAt(id), at = restSpot(hp) || (sp && typeof sp.x === 'number' ? { x: sp.x, y: spotY(sp, hp), z: sp.z } : hp && Number.isFinite(hp.x) ? hp : null);
    if (!v || !Array.isArray(v.p) || !Array.isArray(v.t) || !at) { workFrame(id, 900); return; }
    const also = [], sl = G.st[id] && G.st[id].p === 'courses' ? W.nextSlot(id) : null, cr = W.craneAt();   // (as wallFrame: the next slot and the crane stay in)
    if (sl && Array.isArray(sl.face)) also.push({ x: sl.face[0], y: sl.y + (sl.h || 1) / 2 + 0.3, z: sl.face[2] });
    if (sl && cr && cr.site === id && Number.isFinite(cr.x)) also.push({ x: cr.x, y: W.groundAt(cr.x, cr.z) + 6, z: cr.z });
    const f = fitHero(v.p, v.t, at, also), p = f.p;
    let t = f.t.slice();
    const hx = t[0] - p[0], hz = t[2] - p[2], hl = Math.hypot(hx, hz) || 1, ux = hx / hl, uz = hz / hl;
    let moved = 0;
    for (let k = 0; k < 16 && moved < hl * 0.45; k++) {
      const s0 = heroOnScreen(p, t, at), q = s0 && s0.proj(at.x, at.y, at.z);
      if (!q || q.y <= s0.H0 * 0.58) break;
      // (never so far that the next slot or the crane's hook leaves the top of the screen, under the pill)
      const t2 = [t[0] - ux * 1.2, t[1], t[2] - uz * 1.2], s1 = heroOnScreen(p, t2, at);
      if (!s1 || also.some((a) => { const r = s1.proj(a.x, a.y, a.z); return !r || r.y < 120; })) break;
      t = t2; moved += 1.2;
    }
    W.flyTo(p, t, 900);
    emit('dealFrame', { id, tilt: Math.round(moved * 10) / 10 });
  }
  /** twice a second: a deal that waits opens once nothing else is on screen */
  function dealTry() {
    // (PRODUCER14 N98: a deal whose site left the loop — a demo jump, the crews closing the course or the stage while it waited —
    //  is a dead sheet: it closes, and a fresh deal comes for the work that waits now)
    if (dealOpen && !jobBusy && (!JB.loopOn(G, dealOpen) || !JB.curOf(G, dealOpen).deal)) { dealClose(); dealWant = 1; emit('dealStale', {}); }
    if (!dealWant || !started || whole || opening || momentBusy || overlay || jobBusy || SC || ui.busy || dealOpen || tNow() < camHold || !beatClear()) return;
    if (beatWait || checkWait) return;
    const id = loopSite();
    if (!id) { if (++dealWant > 40) dealWant = 0; return; }   // (≈ 20 s: the loop is not due — a board, a check, the moment)
    openDeal(id);
  }
  act.jobPick = (job) => jobPick(dealOpen, job);
  act.key = (id) => (JB.loopOn(G, id) && !reelOn() ? loopGo(id, true) : keyStone(id));   // (the site panel's key-stone button: its card, paid)
  act.jobRedeal = () => { const id = dealOpen; if (!id) return; const d = JB.dealNow(G, id, jobHas, { re: true }); persist(); sfx.play('ui'); ui.deal(dealView(id, d)); emit('dealRe', { id, cards: d.cards.slice() }); };
  act.dealClose = () => { dealClose(); emit('dealClosed', {}); };
  /** the pill in the loop: "מה נעשה עכשיו? · נדבך 2 מתוך 6 · ●●○" — or the strike card's count */
  act.jobPill = (a) => {
    if (SC) return `<span class="gm-k">${esc(JB.jobName('strike', SC.id))}</span><b class="gm-sc-n">${isoNum(Math.min(SC.n, SC.of))} מתוך ${isoNum(SC.of)}</b><span><span class="gm-sub">${twinOn() ? "הקישו על 'עבודה' כשהטבעת נסגרת על הזהב" /* ── crafta19 ── (the button's name under two thumbs) ── /crafta19 ── */ : 'הקש על הכהן כשהטבעת נוגעת בזהב'}</span></span>`;
    if (!loopTurn(a)) return '';
    const id = a.id, P = PROJ[id], cur = JB.curOf(G, id), Jn = JB.J(G, id, jobHas);
    const pips = `<span class="gm-pips" aria-label="עבודות בנדבך: ${cur.n} מתוך ${Jn}">${Array.from({ length: Jn }, (_, k) => `<i class="${k < cur.n ? 'on' : ''}"></i>`).join('')}</span>`;
    const k = keyNow(id);
    if (k) return `<span class="gm-k">בידיים שלך</span>${pips}<span><b>${esc(stageById(id).n)}</b> <span class="gm-sub">· ${esc(keyWords(k, k.i === 0).sub)}</span></span>`;   // (the key stone's words, as before the loop)
    // ── flow16 ── the stock paces the crews, said plainly (the owner's words: the sub-line)
    if (JB.freeHands(G) && JB.stockOf(G, id) <= 0) return `<span class="gm-k">העבודה</span>${pips}<span><b>מה נעשה עכשיו?</b> <span class="gm-sub">· המלאי: 0 אבנים · הצוותים ממתינים · הכהן ממשיך</span></span>`;
    // ── /flow16 ──
    return `<span class="gm-k">העבודה</span>${pips}<span><b>מה נעשה עכשיו?</b> <span class="gm-sub">· נדבך ${isoNum(Math.min(P.C, cur.c + 1))} מתוך ${isoNum(P.C)}</span></span>`;
  };
  /** a card was picked */
  async function jobPick(id, job) {
    if (!id || jobBusy) return;
    if (!JB.loopOn(G, id)) { dealClose(); dealWant = 1; return; }   // (N98: never a dead sheet)
    const d = JB.curOf(G, id).deal;
    dealClose();
    if (job === 'quarry' || (d && d.quarry && !(d.cards && d.cards.length))) { emit('jobPick', { id, job: 'quarry' }); const a = playFor(id); dealWant = 1; if (a) return playLevel(a); return; }   // ── flow16 ── (the extra card beside his cards: only its own tap opens the board) ── /flow16 ──
    if (!d || !d.cards.includes(job)) { dealWant = 1; return; }   // (a stale card: a fresh deal comes — N98)
    emit('jobPick', { id, job, cards: d.cards.slice() });
    jobBusy = true;
    let r = null;
    try { r = await JB.playJob(JH, id, job); } catch (e) { console.warn('[fun14] job failed', e); } finally { jobBusy = false; }
    if (r) {
      const st = '★'.repeat(r.stars) + '☆'.repeat(3 - r.stars);
      const acc = job === 'strike' && lastStrike ? `${isoNum(lastStrike.perf)} מדויקות מתוך ${isoNum(lastStrike.of)} · ` : '';
      // ── flow16 ── a craft played in the world (hands.js): a float over the work, no card, no toast (the mentor's line is his bubble)
      if (r.world && Number.isFinite(+r.world.x) && JU && TW && TW.on) JU.result({ craft: JB.JOBS[job] ? JB.JOBS[job].trade : null, stars: r.stars, coins: r.coins, at: { x: +r.world.x, y: +r.world.y } });   // ── juice18 ── the stars one by one ── /juice18 ──
      else if (r.world && Number.isFinite(+r.world.x)) ui.float(`${st}${r.q >= 0.97 ? ' מושלם' : ''} · +${isoNum(r.coins)} מטבעות`, +r.world.x, +r.world.y, 'gold');
      else   // ── /flow16 ──
      ui.toast({ icon: 'star', title: `${JB.jobName(job, id)} ${st}`, body: `${acc}${r.stones ? (r.stones === 1 ? 'אבן אחת הונחה' : `${isoNum(r.stones)} אבנים הונחו`) + ' · ' : ''}${isoNum(r.coins)} מטבעות${r.up ? ` · רמה ${isoNum(r.up)}!` : ''}`, kind: 'mini', ms: 2600 });
    }
    ui.refresh(); markSync();
    // ── flow16 ── a craft played in the world: the mentor's line (his bubble) is read before the next deal covers the work — 7 s, or
    // her tap on the pill (loopGo opens the deal at once)
    if (r && r.world) { dealWant = 0; setTimeout(() => { if (!dealOpen && !dealWant) dealWant = 1; }, 7000 * F); return; }
    // ── /flow16 ──
    dealWant = 1;
  }
  /* the host jobs.js plays a turn with */
  const JH = {
    G: () => G, has: jobHas, emit: (t, d) => emit(t, d), persist: () => persist(),
    walk: (id, job) => jobWalk(id, job),
    run: (game, o) => jobGame(game, o),
    key: (id, k) => keyCardGame(id, k),
    strike: (id, o) => strikeCard(id, o),
    pay: (id, job, info) => jobPay(id, job, info),
    outcome: (id, out, perfect, key) => jobOutcome(id, out, perfect, key),
    reveal: (id, job, q, o) => jobRevealAt(id, job, q, o),
  };
  /** he walks to his work (SITE14's jobSpot when the world has one, else his banker) while the sheet rises */
  function jobWalk(id, job) {
    let js = W.has('jobSpot') ? W.jobSpot(job, { site: id }) : null;
    const bank = spotOf({ id });
    // (a job spot far from his work — Robinson's pier from the bay — would walk him out of every frame while she plays: there he
    //  works at his banker, and the job's reveal shows the place)
    // (nor up out of the Mount's bay onto its outer bank: a spot 4 amot above or below his banker)
    const bankY = bank && typeof bank.x === 'number' ? W.groundAt(bank.x, bank.z) : null;
    if (js && typeof js.x === 'number' && bank && typeof bank.x === 'number' && (Math.hypot(js.x - bank.x, js.z - bank.z) > 45 || (bankY != null && Math.abs(W.groundAt(js.x, js.z) - bankY) > 4))) js = null;
    const sp = js && typeof js.x === 'number' ? { x: js.x, z: js.z, ...(Array.isArray(js.face) ? { face: js.face } : {}) } : bank;
    if (!sp || typeof sp.x !== 'number') return Promise.resolve(false);
    const hp = W.heroPos();
    if (hp && Number.isFinite(hp.x) && Math.hypot(hp.x - sp.x, hp.z - sp.z) < 1.5) return Promise.resolve(true);
    const run = hero.run = (hero.run || 0) + 1;
    hero.busy = true; hero.cur = null; hero.at = null; hero.atXZ = null; stopRing();
    emit('jobWalk', { id, job, x: Math.round(sp.x), z: Math.round(sp.z), spot: !!js });
    return Promise.resolve(navGo(sp)).catch(() => false).then((ok) => { if (hero.run === run) { hero.busy = false; if (!js)   /* ── stages21 ── (navGo: under two thumbs a way over 14 amot is the compass's ≤ 1.5 s, never a long walk by himself; kid run, sovev: the job's walk ran 2 s) ── /stages21 ── */ { hero.at = ok ? jobKey({ id }) : null; hero.atXZ = ok ? xzOf(sp) : null; } } return ok; });
  }
  const jobCtx = (id, extra) => ({ root: ui.root || document.body, world, site: id, slot: W.nextSlot(id) || null, demo: reelOn(), onEvent: (t, d) => emit(t, d), sfx, haptic, reduced, ui, view, heroPos: () => W.heroPos(), ...(twinOn() ? { twin: TW } : {}), ...extra });   // ── flow16 ── (ui, view, heroPos: hands.js, the craft in the world) ── /flow16 ── ── twin17 ── (twin: the right thumb drives the job's model) ── /twin17 ──
  /** a job's own game (a frame game of minigames/index.js GAMES): the sheet over the live site */
  async function jobGame(game, o) {
    const run = fnOf(parts().minigames, 'runMinigame');
    if (!run) return null;
    const id = o.site, seed = ((SIDX[id] | 0) + 1) * 4243 + (G.st[id] ? G.st[id].set : 0) + (o.n | 0) * 17;
    momentBusy = true; overlayOn(true); stopRing(); ui.clearFloats();
    // (the owner loves the kohen at his work: while she plays, he works at his spot too — a stroke of the job's kind every ~2 s)
    const actK = JOB_ACT[o.job] || 'tamp', beat = setInterval(() => { if (!hero.busy && !whole && !globalThis.__HANDS) W.act(actK, actK === 'dress' ? undefined : id, { shake: false }); }, 2200);   // ── craftb19 ── (!__HANDS: a craft played in the world is HIS act, by the touch only — FUN19 §2 "no act starts without a touch"; the owner's note 15: the hammer swung by itself while he held the plumb) ── /craftb19 ──
    // (the result card shows the job's own sourced line first — the arch's Robinson's Arch, the gold's Middot — then the rotation)
    // (a skinned game — the gold, the plaster, the bronze — picks its own variant's fact in runMinigame: not overridden here)
    const own = !o.skin || o.skin === 'arch' || o.skin === 'course' ? MG_GAMES[game] && MG_GAMES[game].fact : null;
    const sf = (JB.SITE_FACT[o.job] && JB.SITE_FACT[o.job][id]) || own || null;
    try { return await guarded(run(game, jobCtx(id, { level: Math.max(0, Math.min(2, o.level | 0)), seed, skin: o.skin, n: o.n | 0, job: o.job, kicker: `${stageById(id).n} · ${JB.JOBS[o.job] ? JB.JOBS[o.job].trade : ''}`, ...(sf ? { fact: sf } : {}) })), 'jobs.' + game); }
    finally { clearInterval(beat); momentBusy = false; overlayOn(false); }
  }
  /** the key card: the key stone's own game (its words: content.js keyWords) — the stone is set by the share (jobs.js setShare) */
  async function keyCardGame(id, k) {
    const run = fnOf(parts().minigames, 'runMinigame');
    const kw = keyWords(k, k.i === 0);
    if (!run) return null;
    momentBusy = true; overlayOn(true); stopRing(); ui.clearFloats();
    W.focus(id, 900);
    emit('keyAsk', { id, game: k.game, what: k.what, card: true });
    try { return await guarded(run(k.game, jobCtx(id, { level: mgLevel(k.game), seed: ((SIDX[id] | 0) + 1) * 1000 + k.i, what: k.what, ...(kw.kicker ? { kicker: kw.kicker } : {}), ...mgFacts(k.game) })), 'minigames.runMinigame'); }
    finally { momentBusy = false; overlayOn(false); }
  }
  /** "סתת בקצב": 10 strikes on the ring (ECON14's), in the world — his own stone on his banker. Paid by accuracy:
      a perfect strike 1, a near one ½, over the 9 strikes after the first (the first starts the ring) */
  function strikeCard(id, o = {}) {
    // (the way to his stone: a key stone she let go is set by the crane at 0.8, an event cleared — her strikes dress stones)
    const s = G.st[id];
    if (s && S.jobOf(G, id).kind !== 'stone') { const out = JB.setShare(G, id, s.set + 1); if (out.ok) jobOutcome(id, out, false, null); }
    if (W.has('onPosed')) W.onPosed(id, (ok) => { if (ok && SC && SC.id === id && !hero.busy && tNow() >= camHold && !looking()) workFrame(id, 900); }, 8000);   // (the bay posed: his work in the frame)
    if (!s || !S.jobOf(G, id) || S.jobOf(G, id).kind !== 'stone') return Promise.resolve({ quality: 0.8, perfect: false, skipped: true });
    if (globalThis.__MG_AUTO) return Promise.resolve({ quality: 0.85, perfect: false });   // (test harnesses: the games play themselves)
    return new Promise((resolve) => {
      SC = { id, n: 0, of: 10, perf: 0, near: 0, t0: tNow(), resolve, timer: 0 };
      SC.timer = setTimeout(() => strikeEnd('time'), 32000 * (opt.fast ? 0.2 : 1));
      emit('strikeCard', { id, at: 'start', of: SC.of });
      ui.refresh();
      if (!G.story.sc1) { G.story.sc1 = 1; coachAt('hero', 'הקש על הכהן: עשר מכות, כל אחת כשהטבעת נוגעת בזהב'); setTimeout(() => ui.coach(null, ''), 6000 * F); }
      markSync();
    });
  }
  function jobStrike(d) {
    const c = SC; if (!c || !d) return;
    c.n++;
    if (d.perfect) c.perf++; else if (typeof d.dt === 'number' && Math.abs(d.dt) < 0.32) c.near++;
    const id = c.id, j = S.jobOf(G, id);
    // (her strikes reached a key stone or an event: the crane sets it at 0.8 and she strikes on; a closed course ends the card)
    if (j && j.kind !== 'stone' && j.kind !== 'check' && G.st[id] && G.st[id].p === 'courses') { const out = JB.setShare(G, id, G.st[id].set + 1); if (out.ok) setTimeout(() => jobOutcome(id, out, false, null), 0); }
    try { ui.refreshPill(); } catch (e) { /* the HUD */ }
    const j2 = S.jobOf(G, id);
    if (c.n >= c.of || !j2 || j2.kind === 'check' || !JB.loopOn(G, id)) setTimeout(() => strikeEnd('done'), 650);
  }
  function strikeEnd(why) {
    const c = SC; if (!c) return;
    SC = null; clearTimeout(c.timer);
    const timed = Math.max(1, Math.min(c.n, c.of) - 1);
    lastStrike = { perf: c.perf, near: c.near, of: timed };
    const q = c.n ? Math.min(1, (c.perf + 0.5 * c.near) / timed) : 0.8;
    emit('strikeCard', { id: c.id, at: 'end', why, n: c.n, perf: c.perf, near: c.near, q: Math.round(q * 100) / 100 });
    ui.refresh();
    c.resolve({ quality: q, perfect: c.n >= c.of && c.perf >= c.of - 1, skipped: !c.n });
  }
  /** the pay (ECON14's S.payJob and the purse's flight, guarded) */
  function jobPay(id, job, info) {
    let out = null;
    if (typeof S.payJob === 'function') { try { out = S.payJob(G, { id: job, site: id, level: info.level, q: info.q, skipped: info.skipped }); } catch (e) { out = null; } }
    if (!out || typeof out !== 'object') { const coins = JB.coinsFor(info.stars, info.level, info.skipped); S.gain(G, { silver: coins }); out = { coins, stars: info.stars }; }
    const E = parts().econ, pos = anchorScreen();
    if (E && typeof E.pay === 'function') { try { E.pay(out, pos ? { x: pos.x, y: pos.y } : null); } catch (e) { /* ECON14's */ } }
    else { ui.flashRes(['silver']); sfx.play('coin'); }
    return out.coins | 0;
  }
  /** what the share did in the world: the stones, the course, a key stone she hewed (the cart), the phase, the stage's end */
  function jobOutcome(id, out, perfect, key) {
    if (!out || !out.ok) { syncSite(id, true); ui.refresh(); return; }
    if (key && out.keyQ != null) {
      const kw = keyWords(key, key.i === 0), how = uxHow(out.keyQ);   // ── ux24 ── ── /ux24 ──
      emit('keyStone', { id, kind: key.game, what: key.what, quality: out.keyQ, perfect: !!perfect, card: true });
      if (key.game === 'quarry') deliverKey(id, key, kw, how);
      else ui.toast({ icon: 'star', title: `${kw.def}: במקומה`, body: how, kind: 'mini', ms: 2400 });
    }
    // (a course closed by a job: +5 — ECON14's econ.course pays, flies the coins and blows her trumpets; else S.payCourse alone)
    if (out.course) { try { const E = parts().econ, pos = anchorScreen(); if (E && typeof E.course === 'function') E.course(pos ? { x: pos.x, y: pos.y } : null); else if (typeof S.payCourse === 'function') S.payCourse(G); } catch (e) { /* ECON14's */ } }
    strokeOutcome(id, out.first || { kind: 'stone' }, out, anchorScreen(), !!perfect);
  }
  /** the job stays in the building (SITE14's jobReveal); its frame for a short beat when the world gives one */
  function jobRevealAt(id, job, q, o) {
    if (!W.has('jobReveal')) return;
    const R = JB.JOBS[job] || {};
    const v = W.jobReveal(job, R.kind || 'stone', q, o);
    emit('jobReveal', { id, job, q: Math.round(q * 100) / 100, frame: !!(v && v.p) });
    if (v && Array.isArray(v.p) && Array.isArray(v.t) && W.has('flyTo') && !reelOn()) {
      const dur = Math.max(0.8, Math.min(2.4, +v.dur || 1.6));
      camHold = Math.max(camHold, tNow() + dur + 0.4);
      W.flyTo(v.p, v.t, 1000);
      setTimeout(() => { if (!whole && !momentBusy && !overlay && curWork() === id) workFrame(id, 1100); }, (dur + 0.4) * 1000 * F);
    }
  }
  /* "החוט הצבוע" opens every walled course (snap.js): pull the dyed cord taut, lift it, let go — snap. Not a card: like the plumb
     that closes the course, the line opens it. Paid as a job; the line stays on the course (SITE14's reveal 'line') */
  function lineDue(id) {
    const D = DECKS[id], P = PROJ[id], s = G.st[id];
    if (!D || !D.line || !jobHas('snap') || !s || s.p !== 'courses' || reelOn()) return false;
    const cur = JB.curOf(G, id);
    return !cur.line && cur.n === 0 && s.set % P.P === 0 && cur.c === 0;   // ── flow16 ── (once a stage: its first course — the owner: "קופץ כל רגע") ── /flow16 ──
  }
  async function playLine(id) {
    const cur = JB.curOf(G, id); cur.line = 1;
    const lv = JB.levelOf(G, 'line'), n = JB.playsAt(G, id, 'line');
    emit('jobStart', { job: 'line', site: id, c: cur.c, share: 0, level: lv, n });
    jobBusy = true;
    let r = null;
    try { jobWalk(id, 'line'); r = await jobGame('snap', { site: id, level: lv - 1, n, job: 'line' }); } finally { jobBusy = false; }
    if (!r || typeof r !== 'object') r = { quality: 0.8, skipped: true };
    const q = Math.max(0, Math.min(1, +r.quality || 0)), stars = JB.starsOf(q, !!r.skipped);
    const prevLast = JB.jobsOf(G).last[id];
    const note = JB.noteJob(G, id, 'line', stars, q);
    JB.jobsOf(G).last[id] = prevLast;   // (the opener is not the job "just played": the course's last job still is)
    const coins = jobPay(id, 'line', { level: lv, q, stars, skipped: !!r.skipped });
    jobRevealAt(id, 'line', q, { site: id, n: n + 1, course: cur.c });
    emit('jobDone', { job: 'line', site: id, kind: 'stone', q, stars, coins, stones: 0, c: cur.c, n: n + 1, up: note.up });
    persist(); ui.refresh();
  }
  /* a load or a mode switch: the deal comes back by itself once the scene is clear */
  dealWant = 1;
  /** tests and bots read what a player sees: the deal on screen, the strike card's count, a job running */
  api.loop = { deal: () => dealOpen, strike: () => (SC ? { n: SC.n, of: SC.of, perf: SC.perf } : null), busy: () => jobBusy, on: (id) => JB.loopOn(G, id || curWork() || 'har'), J: (id) => JB.J(G, id, jobHas), has: jobHas, want: () => dealWant };
  // ── /fun14 ──
  return api;
}

/* ───────── world guard ─────────
 * Wraps every world call: a missing method is a no-op, a throw is logged, and promises are raced
 * against a timeout so a stuck animation can never deadlock the hero. */
function guardWorld(world, t) {
  const warned = new Set();
  const warn = (name, e) => { if (warned.has(name + e)) return; warned.add(name + e); console.warn(`[game] world.${name} failed:`, e); };
  const w = () => world || {};
  const has = (name) => typeof w()[name] === 'function';
  const call = (target, name, args) => {
    try {
      const f = target && target[name];
      return typeof f === 'function' ? f.apply(target, args) : undefined;
    } catch (e) { warn(name, e); return undefined; }
  };
  // fire and forget: a world promise nobody waits for (its rejection is logged, it never needs a timer)
  const fire = (target, name, args) => { const p = call(target, name, args); if (p && typeof p.catch === 'function') p.catch((e) => warn(name, e)); return p; };
  const settle = (p, ms, name) => new Promise((resolve) => {
    if (!p || typeof p.then !== 'function') { resolve(p !== false); return; }
    const timer = setTimeout(() => { warn(name, `no answer after ${ms} ms`); resolve(false); }, ms);
    p.then((v) => { clearTimeout(timer); resolve(v !== false); }, (e) => { clearTimeout(timer); warn(name, e); resolve(false); });
  });
  return {
    has: (name) => (name === 'quarrySpot' ? !!(w().quarry || w().hasQuarry) : has(name)),
    setStage: (id, status, progress, opts) => call(w(), 'setStage', opts ? [id, status, progress, opts] : [id, status, progress]),
    setBoulders: (states) => call(w(), 'setBoulders', [states]),
    hitBoulder: (i, hp) => { fire(w(), 'hitBoulder', [i, hp]); },     // (the crack plays on; nobody waits for it)
    walkTo: (target) => settle(call(w().hero, 'walkTo', [target]), t.walk, 'hero.walkTo'),
    swing: (o) => settle(call(w().hero, 'swing', [o]), t.swing, 'hero.swing'),
    heroPlace: (target) => call(w().hero, 'place', [target]),
    heroShow: (v) => call(w().hero, 'show', [v]),
    heroPos: () => { try { const h = w().hero; return h ? h.position : null; } catch (e) { return null; } },
    siteTop: (id) => call(w(), 'siteTop', [id]),
    // called every frame by the HUD anchors: direct calls, no argument arrays
    groundAt: (x, z) => { const o = w(), f = o.groundAt; if (typeof f !== 'function') return 0; try { const v = f.call(o, x, z); return typeof v === 'number' ? v : 0; } catch (e) { warn('groundAt', e); return 0; } },
    workFX: (id) => call(w(), 'workFX', [id]),
    celebrate: (id) => call(w(), 'celebrate', [id]),
    focus: (id, dur) => call(w(), 'focus', dur ? [id, dur] : [id]),
    setTimeOfDay: (k) => call(w(), 'setTimeOfDay', [k]),
    // GDD §12 world API (stages.js v2). Each one has a fallback, so the game also runs against an older world.
    hotspot: (id) => call(w(), 'hotspot', [id]),
    // (per frame, for the HUD anchors: a direct call that fills `out`, no argument array)
    screenPos: (target, out) => { const o = w(), f = o.screenPos; if (typeof f !== 'function') return null; try { return f.call(o, target, out); } catch (e) { warn('screenPos', e); return null; } },
    setCraneSite: (id) => call(w(), 'setCraneSite', [id]),
    boulderView: (i) => call(w(), 'boulderView', [i]),   // ── flow8 ── SITE8B (wave 8B): a clear, close pose per boulder
    // ── flow9 ── SITE9 (wave 9): the boulder field's spots (the game's BOULDER_XZ follows them), and the corner stone's cart +
    // crane (M11): resolves once the stone is set; a stuck animation resolves false after 45 s (the game goes on)
    boulderSpots: () => call(w(), 'boulderSpots', []),
    deliverKeyStone: (id, o) => settle(call(w(), 'deliverKeyStone', [id, o]), 45000, 'deliverKeyStone'),   // (SITE9: ≈ 12–15 s; ≤ 40 s real time)
    // the camera and light shows play on by themselves (null: not provided)
    showPlan: (ms) => (has('showPlan') ? fire(w(), 'showPlan', [ms]) || true : null),
    orbit: (id, s) => (has('orbit') ? fire(w(), 'orbit', [id, s]) || true : null),
    showcase: () => (has('showcase') ? fire(w(), 'showcase', []) || true : null),
    shine: () => (has('shine') ? fire(w(), 'shine', []) || true : null),
    // awaited (the offline return): resolves false after a timeout if the world never answers. The world gives each
    // site at least 0.9 s, so the timeout grows with the number of sites.
    playTimelapse: (changes, ms) => (has('playTimelapse') ? settle(call(w(), 'playTimelapse', [changes, ms]), Math.max(ms, 900 * changes.length) + 3000, 'playTimelapse') : null),
    redLine: (f) => call(w(), 'redLine', [f]),
    momentFX: (k, a) => call(w(), 'momentFX', [k, a]),   // ── moments ── a key moment's beat in the world (stages.js momentFX)
    // (every frame while the kodesh moment runs: a direct call)
    boxes: (u) => { const o = w(), f = o.boxes; if (typeof f !== 'function') return; try { f.call(o, u); } catch (e) { warn('boxes', e); } },
    setVine: (n) => call(w(), 'setVine', [n]),
    rain: (on) => call(w(), 'rain', [on]),
    heroTool: (k) => call(w().hero, 'setTool', [k]),
    // strike juice: strikeFX includes workFX; an older world gets workFX for a site strike
    strikeFX: (target, quality, level) => (has('strikeFX') ? call(w(), 'strikeFX', [target, quality, level])
      : typeof target === 'string' && target !== 'quarry' ? call(w(), 'workFX', [target]) : undefined),
    setComboLevel: (n) => call(w(), 'setComboLevel', [n]),
    setQuarryStock: (n, crews) => call(w(), 'setQuarryStock', [n, crews]),
    // ── crews ── the building crews (src/crews.js, set on the world by main.js); missing → nothing is shown
    setCrews: (id, n, ids) => call(w(), 'setCrews', [id, n, ids]), setQuarry: (n, ids) => call(w(), 'setQuarry', [n, ids]),
    caravan: (rid, st) => call(w(), 'caravan', [rid, st]), trainees: (n) => call(w(), 'trainees', [n]), crewsCheer: (id) => call(w(), 'crewsCheer', [id]),
    quarryPos: () => { try { const q = w().quarry; return q && typeof q.x === 'number' && typeof q.z === 'number' ? q : null; } catch (e) { return null; } },
    // ── build6 ── the v6 site (SITE, bus/SITE.md), the hero's strokes (PEOPLE) and the water (WATER); each has a fallback
    siteInfo: (id) => call(w(), 'siteInfo', [id]),
    setWork: (id, o) => call(w(), 'setWork', [id, o]),
    liftStone: (id, o) => settle(call(w(), 'liftStone', [id, o]), 20000, 'liftStone'),
    nextSlot: (id) => call(w(), 'nextSlot', [id]),
    workSpot: (id, kind) => call(w(), 'workSpot', [id, kind]),
    frontView: (id) => call(w(), 'frontView', [id]),
    heroHas: (name) => { try { const h = w().hero; return !!h && typeof h[name] === 'function'; } catch (e) { return false; } },
    act: (kind, target, o) => settle(call(w().hero, 'act', [kind, target, o]), 3000, 'hero.act'),
    workpiece: (state, at) => call(w().hero, 'workpiece', at === undefined ? [state] : [state, at]),   // (at: where the banker is now)
    heroSit: (id, n, ids, o) => call(w(), 'setCrews', o ? [id, n, ids, o] : [id, n, ids]),
    water: () => { try { return w().water || null; } catch (e) { return null; } },
    pauseRender: (on) => call(w(), 'pauseRender', [on]),
    // ── build7 ── WORLD7's opening vision (main.js `// ── world7 ──`): vision({ms, restore, to}) → Promise, visionSkip()
    vision: (o) => call(w(), 'vision', [o]),
    visionSkip: () => call(w(), 'visionSkip', []),
    demoMode: () => call(w(), 'demoMode', []),
    gesture: (k, o) => settle(call(w().hero, 'gesture', o ? [k, o] : [k]), 8000, 'hero.gesture'),   // (PEOPLE7: 'proud' · 'gotit' · 'wipe' · 'look')
    heroView: (d, el) => call(w().hero, 'view', [d, el]),   // (PEOPLE7: {p, t}, a camera that frames him from his front-left)
    // ── flow10 ── the course check's stand and frame at the Mount (stages.checkView), and a flight to a {p, t} frame
    checkView: (id) => call(w(), 'checkView', [id]),
    flyTo: (p, t, ms) => call(w(), 'flyTo', [p, t, ms]),
    // ── flow11 ── SITE's working frame at a site (CAM.WALL: the builder at his banker and the next slot) · the load's pose (SITE11)
    wallView: (id) => call(w(), 'wallView', [id]),
    craneAt: () => { try { const f = w().crane; return typeof f === 'function' ? f.call(w()) : null; } catch (e) { return null; } },   // (the crane's hook: {site, x, y, z, carry})
    frameBlocked: (px, py, pz, tx, ty, tz, id) => call(w(), 'frameBlocked', [px, py, pz, tx, ty, tz, id]) === true,   // (SITE11: a built wall on the line)
    posed: (id) => call(w(), 'posed', [id]),
    onPosed: (id, fn, ms) => call(w(), 'onPosed', ms ? [id, fn, ms] : [id, fn]),
    siteWorkView: (id) => call(w(), 'siteWorkView', [id]),
    courseView: (id) => call(w(), 'courseView', [id]),   // (wave 12 integration: SITE12's whole-Mount view at a course's end)
    // ── fun14 ── SITE14's jobs in the building (bus/SITE14.md): a job's reveal and where he stands for it; her mark; the shop's things
    jobReveal: (id, kind, q, o) => call(w(), 'jobReveal', [id, kind, q, o]), jobSpot: (id, o) => call(w(), 'jobSpot', [id, o]),
    stoneMark: (site, m) => call(w(), 'stoneMark', [site, m]), setOwned: (o) => call(w(), 'setOwned', [o]),
    // ── /fun14 ──
  };
}
