// ── shift29 ── index.js — the shift's entry (docs/WAVE29-BRIEF.md SHIFT29A (6)): Phase B's entry card ("משמרת" big and gold, "סיור"
// small — the old day), the `#shift` / `#shift=N` links, and A.shift = { best:{lvl:score}, lvl, stars } in Phase B's own save.
// The shift runs in the day's world (day/index.js: D entered, its clock, guide and HUD held — D.shiftMode), the sky at 7:00.
// ── fable32 (build 28) ── (the owner's decisions, 22.10 09:19) the shipped game is the day alone: the lobby's mode pill and the pause card's
// "לסיור" are gone (run — the 90 s "משמרת" — and tour — the old day, the player as the אמרכל — stay in the code, reached by no door);
// once the lobby or the day is up (SH.live) the old Phase B top bar is off (prefs28's cover28) and a turn to portrait shows the "turn the
// phone" card over the paused day (avodah/index.js's tick → SH.turn28); the buzz's guard over navigator.vibrate, once (prefs28). ── /fable32 ──
// ── fable32 (build 29) ── the Shabbat and Yom Tov lock (HANDOFF rule 16; time29.js, lock29.js): a watch every 2 s once the shift is up —
// 15 minutes before the lock a calm line (the lobby, over the day, the pause card); at the lock the day is saved as it is (day33's own
// saveState), stopped, the interludes leave, and the lobby's court at rest shows the lock screen; the lobby and the day open only through
// the gate (gate29), so a page opened during the lock shows that screen alone; at צאת הכוכבים the lobby again ("המשך יום N"). ── /fable32 ──
//   const SH = mountShift({ D, A, persist, sfx, emit })
//   SH.card() · SH.run(lvl) · SH.stop() · SH.active · SH.destroy()      tests: globalThis.__SHIFT
import { createShift } from './engine.js';
import { createShiftHud, entryCard } from './hud.js';
import { levelOf, MAX_LEVEL } from './levels.js';
import { stubPilgrims, stubStations, stubCam } from './stub29.js';
// ── shift29-world ── SHIFT29B's modules (s29-world): the pilgrims' figures and chips, the stations' short acts, the high camera, the run
import { createPilgrims, GATE_SPOT } from './pilgrims.js';
import { createStations, STATIONS } from './stations.js';
import { createShiftCam } from './camera.js';
import { createWalk, PACE, STICK } from './walk.js';   // ── recovered (17–24) ── (the day's paced walk and soft stick: PACE, STICK)
import { createFlow31 } from './flow31.js';   // ── flow31 ── ── /flow31 ──
import { createDay33, SHOP33, BADGES33, ENABLE_TEMPLE_COINS } from './day33.js';   // ── fable32 (build 6) ── "יום במקדש" ── /fable32 ── ── recovered (build 18) ── (the coins) ──
import { createFocus17 } from './focus17.js';   // ── recovered (build 17) ── the focused day: the top, the bar, the stamps (and the day's own modules)
import { rolesBook23 } from './pis23.js';   // ── recovered (build 23) ── the roles' book
import { createLobby } from './lobby35.js';   // ── fable32 (build 13) ── the 3D home screen ── /fable32 ──
import { runTiles } from '../../tiles/index.js';   // ── fable32 (build 13) ── the night's interlude ── /fable32 ──
import { runPen } from '../../pen/index.js';   // ── fable32 (build 14) ── the sliding pen ── /fable32 ──
import * as M3 from '../../match3/index.js';
import { openScore } from './score35.js';   // ── fable32 (build 14) ── the one score ── /fable32 ──
import { createHero35 } from './hero35.js';   // ── fable32 (build 15) ── the real kohen ── /fable32 ──
import { evlog } from './evlog16.js';   // ── recovered (build 16) ── the event log
import { onTick } from './draw.js';
import { STICK24 } from '../../game/twin.js';   // ── recovered (build 24) ── the stick of build 24 (twin's)
import { VIEW24 } from './camera.js';   // ── recovered (build 24) ── the day's view
import { installHaptics28, cover28, createTurn28 } from './prefs28.js';   // ── fable32 (build 28) ── ── /fable32 ──
import { clock29, where29, status29 } from './time29.js';   // ── fable32 (build 29) ── ── /fable32 ──
import { createWatch29, softDay29, dropGames29 } from './lock29.js';   // ── fable32 (build 29) ── ── /fable32 ──
import { served30, servedHe30, ACT30 } from './rate30.js';   // ── fable32 (build 30) ── ── /fable32 ── ── fable32 (build 31) ── (ACT30: the practice's act name) ── /fable32 ──
import { canPractice31, practiceSave31, merge31, createPractice31 } from './practice31.js';   // ── fable32 (build 31) ── the roles book's practice ── /fable32 ──
import { resumeDay33 } from './day33.js';   // ── fable32 (build 31) ── (the practice's court: the day he goes on with) ── /fable32 ──
import { openJournal32 } from './book32.js';   // ── fable32 (build 32) ── "יומן הכהן": one journal (the roles book, the Mishnah pages, the mornings, the badges) ── /fable32 ──
import { jr32 } from './journal32.js';
import { migrate36 } from './lvl36.js';   // ── fable32 (build 36) ── the four mastery levels (the roles book's choice; an older save made level-aware) ── /fable32 ──
// ── fable32 (build 33) ── "הטלה המבוקר" (time-gating-hooks-he.md hook 1): the "מכאן" card's door to לשכת הטלאים — the chamber's run ── /fable32 ──
import { L33, lb33, day33n, canInspect33, inspect33, stock33, settle33 } from './lamb33.js';
import { createChamber33 } from './chamber33.js';
import { sky29 } from './time29.js';
import { LOBBY29 } from './lobby35.js';
import { hebDate32 } from './journal32.js';
// ── fable32 (build 30) ── one rating for every act (rate30.js): the day and its lobby no longer add to Phase A's score (★, the gold dinars, the
// builder's titles — Phase A keeps its own; the shift shows "שימשת N בקרים" and the roles' titles instead). SCORE30 = true: the shift's
// score object is not passed (the code stays — score35.js, day33's score() — reached by no door); the coins stay (קופת המקדש). ── /fable32 ──
const SCORE30 = true;
const WORLD = { pilgrims: createPilgrims, stations: createStations, STATIONS, camera: createShiftCam, walk: createWalk, gate: GATE_SPOT, kit: null /* (draw.js: the day's shared kit) */ };
if (typeof location !== 'undefined' && /[?&]shiftstub=1\b/.test(location.search || '')) { WORLD.pilgrims = WORLD.stations = WORLD.camera = WORLD.walk = WORLD.gate = null; }   // (tests: the engine alone on the stubs)
// ── /shift29-world ──

const START = { x: -19, z: 6 };
export function shiftSave(A) {
  if (!A.shift || typeof A.shift !== 'object') A.shift = {};
  const s = A.shift;
  if (!s.best || typeof s.best !== 'object') s.best = {};
  if (!s.stars || typeof s.stars !== 'object') s.stars = {};
  s.lvl = Math.min(MAX_LEVEL, Math.max(1, Math.round(+s.lvl || 1)));
  return s;
}

export function mountShift(o = {}) {
  const D = o.D, A = o.A;
  const doc = typeof document !== 'undefined' ? document : null;
  const save = shiftSave(A);
  try { jr32(save); } catch (e) { /* */ }   // ── fable32 (build 32) ── (the journal made once: an older save's roles count as met — the lobby's door shows them) ── /fable32 ──
  try { migrate36(save); } catch (e) { /* */ }   // ── fable32 (build 36) ── (the levels: an older save's roles made level-aware once — the roles book shows them) ── /fable32 ──
  let E = null, hud = null, mods = null, cardCtl = null, lvlNow = 1, runs = 0, startT = 0;
  evlog('app_open', { day: (save.day33state && save.day33state.day) || 0 });   // ── recovered (build 16) ──
  // ── fable32 (build 28) ── the shift is up (the lobby or the day): the old top bar off; the buzz's switch guards every vibrate ── /fable32 ──
  let live = false;
  const goLive = () => { live = true; cover28(doc, true); };
  const T28 = createTurn28({ doc, E: () => E, log: (t, d) => evlog(t, d) });   // (the "turn the phone" card over the paused day)
  installHaptics28();
  const emit = (t, d) => { try { o.emit && o.emit(t, d); } catch (e) { /* the host's */ } };
  const persist = () => { try { o.persist && o.persist(); } catch (e) { /* */ } };
  const rig = () => (globalThis.__DAY ? globalThis.__DAY : {});
  const S = () => (D && D.world) || (o.rig && o.rig.stages) || null;
  // ── fable32 (build 15) ── the real kohen over the world's hero, once, for every mode (the lobby, the day, the shift); __SH_NOHERO35 keeps the box-figure (tests)
  let H35 = null, offH35 = null;
  function hero35() {
    if (H35 || globalThis.__SH_NOHERO35 || !(o.rig && o.rig.scene)) return H35;
    try { H35 = createHero35({ scene: o.rig.scene, S: S() }); offH35 = onTick((ms, dt) => { try { H35.update(dt); } catch (e) { /* */ } }); } catch (e) { console.warn('[shift] hero35', e && e.message); H35 = null; }
    return H35;
  }
  // ── /fable32 ──

  function makeWorld() {
    const st = o.rig && o.rig.stages, view = o.rig && o.rig.view, twin = rig().twin || null;
    let ctx = null; try { ctx = D.shiftCtx ? D.shiftCtx() : null; } catch (e) { ctx = null; }
    const m = { twin, view, st };
    const onTapP = (P) => { if (E) E.tapPilgrim(P); };
    const onLeave = (P) => { if (E) E.leave(P); };
    if (WORLD.pilgrims) { m.pilgrims = WORLD.pilgrims({ world: st, kit: WORLD.kit, gateSpot: WORLD.gate || undefined, root: doc.body, view, patienceS: levelOf(lvlNow).patienceS, onTap: onTapP, onLeave }); m.pilgrims.drains = true; m.own = true; }
    else m.pilgrims = stubPilgrims({ world: st, view, root: doc.body, onTap: onTapP });
    m.stations = WORLD.stations ? WORLD.stations({ world: st, kit: WORLD.kit, twin, ctx, root: doc.body /* ── shift30 ── (the pilgrims' layer: one stacking order for all the court's chips) ── /shift30 ── */, onTap: (id) => { if (E) E.tapStation(id); } }) : stubStations();
    if (WORLD.STATIONS && !m.stations.STATIONS) m.stations.STATIONS = WORLD.STATIONS;
    m.walk = WORLD.walk ? WORLD.walk({ world: st, twin }) : null;
    m.camera = WORLD.camera ? WORLD.camera(view, twin, { world: st, walk: m.walk }) : stubCam();   // ── shift30 ── (the follow camera looks along the walk) ── /shift30 ──
    if (m.walk && m.walk.run) { try { m.walk.run(true); } catch (e) { /* */ } }
    m.gate = WORLD.gate || (m.pilgrims && m.pilgrims.gateSpot) || { x: -6, y: 16, z: 0 };
    return m;
  }
  function teardown() {
    try { if (doc) doc.querySelectorAll('.j32').forEach((x) => (x.__j32 ? x.__j32.close(true) : x.remove())); } catch (e) { /* */ }   // ── fable32 (build 32) ── (a journal left open over the day — the summary's — goes with it; the lock's stop too) ── /fable32 ──
    if (E) { try { E.stop(); } catch (e) { console.warn('[shift] stop', e && e.message); } E = null; }
    if (mods) {
      try { mods.stations && mods.stations.clear && mods.stations.clear(); } catch (e) { /* */ }
      try { mods.pilgrims && mods.pilgrims.clear && mods.pilgrims.clear(); } catch (e) { /* */ }
      try { mods.camera && mods.camera.off && mods.camera.off(); } catch (e) { /* */ }
      try { mods.walk && mods.walk.stop && mods.walk.stop(); mods.walk && mods.walk.run && mods.walk.run(false); } catch (e) { /* */ }
      try { mods.flow31 && mods.flow31.destroy(); } catch (e) { /* */ }   // ── flow31 ── ── /flow31 ──
      try { mods.focus17 && mods.focus17.destroy(); } catch (e) { /* */ }   // ── recovered (build 17) ──
      try { mods.p31 && mods.p31.destroy(); } catch (e) { /* */ }   // ── fable32 (build 31) ── (the practice's tag and end card) ── /fable32 ──
      try { mods.ch33 && mods.ch33.destroy(); } catch (e) { /* */ }   // ── fable32 (build 33) ── (the chamber's tag and card) ── /fable32 ──
      try { mods.stations && mods.stations.destroy && mods.stations.destroy(); mods.pilgrims && mods.pilgrims.destroy && mods.pilgrims.destroy(); } catch (e) { /* */ }
      mods = null;
    }
    if (hud) { hud.destroy(); hud = null; }
    try { const T = rig().twin; if (T && T.noStick) T.noStick(false); } catch (e) { /* */ }   // ── fable32 (build 4) ── (the day's stick back) ── /fable32 ──
    try { const T = rig().twin; if (T) T.pace = null; } catch (e) { /* */ }   // ── recovered (build 17) ── (the day's pace off)
  }
  /** a round of level n: ≤ 2 s from the tap to the clock */
  function run(n) {
    if (!D) return false;
    hero35(); goLive();   // ── fable32 (build 28) ── ── /fable32 ──
    if (cardCtl) { cardCtl.close(); cardCtl = null; }
    if (!D.active && !(D.canEnter() && D.enter())) return false;
    teardown();
    try { const c = doc.getElementById('card'); if (c && c.classList.contains('on')) { c.classList.remove('on'); c.setAttribute('aria-hidden', 'true'); } } catch (e) { /* */ }   // (a world card left open: off)
    lvlNow = levelOf(n || save.lvl).n; runs++;
    const L = levelOf(lvlNow);
    hud = createShiftHud(doc.body);
    mods = makeWorld();
    const hook = { work: (h) => (E ? E.work(h) : null), marks: () => [], tick: (dt) => { if (E) E.tick(dt); } };
    D.shiftMode(hook);
    // the kohen in the court, between the דוכן and the altar, facing the gate (the pilgrims come to him when he calls)
    try { S() && S().hero && S().hero.setPos(START.x, START.z, WORLD.camera ? 0 : Math.PI / 2); } catch (e) { /* */ }   // ── shift30 ── (facing south, along the court toward the basin: the camera behind him stands in the court, not over the altar's smoke or in the east wall) ── /shift30 ──
    // ── fable32 (build 4) ── the genre's controls: no stick (tap the place, the pilgrim or the button — he walks), the button away from the place walks him; no start glide (the camera is fixed)
    try { const T = rig().twin; if (T && T.noStick) T.noStick(globalThis.__SH_NOSTICK === true); } catch (e) { /* */ }   // ── fable32 (build 5) ── the floating stick is BACK (the owner 13.10 21:22, Dror's video: "הילד הולך בעצמו עם יד שמאל די בקלות"); __SH_NOSTICK for a test ── /fable32 ──
    try { if (globalThis.__SH_AUTOWALK === undefined) globalThis.__SH_AUTOWALK = true; } catch (e) { /* */ }
    // ── /fable32 ──
    E = createShift({ level: L, world: o.rig && o.rig.stages, twin: mods.twin, view: mods.view, hud, stations: mods.stations, pilgrims: mods.pilgrims, camera: mods.camera, walk: mods.walk, gateSpot: mods.gate,
      sfx: o.sfx, save, persist, own: A.mishmar | 0, bindChips: !mods.own });
    const me = E;
    if (WORLD.stations) { try { mods.flow31 = createFlow31({ E, view: mods.view, world: o.rig && o.rig.stages, twin: mods.twin, root: doc.body, kit: WORLD.kit, stations: mods.stations }); } catch (e) { console.warn('[shift] flow31', e && e.message); } }   // ── flow31 ── ── /flow31 ──
    E.onEnd((r) => {
      emit('shiftEnd', r);
      setTimeout(() => { if (!hud || E !== me) return; hud.end(r, { again: () => run(lvlNow), next: r.next ? () => run(r.next) : null, tour: () => tour() }); }, 700);
    });
    // ── fable32 (build 3) ── the pause: the card stops the clock; "מהתחלה" runs the same level again; "לסיור" leaves
    try { hud.onPause(() => { if (E !== me || !hud) return; E.pause(true); hud.pauseCard({ resume: () => { if (E === me) E.pause(false); }, restart: () => run(lvlNow), tour: () => tour() }); }); } catch (e) { /* */ }
    // ── /fable32 ──
    const ag = E; startT = Date.now();
    hud.set(E.state());
    hud.intro(`משמרת ${L.n}`, `היריב: משמר ${E.state().rivalName}`, 950);
    setTimeout(() => { if (E === ag) { E.start(); emit('shiftStart', { lvl: L.n, run: runs }); } }, 900);
    globalThis.__SHIFT.mods = mods;
    return true;
  }
  // ── fable32 (build 6) ── "יום במקדש": the fire-and-day loop (day33.js) in the shift's rig — the same mods, hud, flow31 and twin
  function runDay() {
    if (!D) return false;
    hero35(); goLive();   // ── fable32 (build 28) ── ── /fable32 ──
    if (gate29()) return false;   // ── fable32 (build 29) ── (the lock: its screen, not the day) ── /fable32 ──
    if (cardCtl) { cardCtl.close(); cardCtl = null; }
    if (!D.active && !(D.canEnter() && D.enter())) return false;
    teardown();
    try { const c = doc.getElementById('card'); if (c && c.classList.contains('on')) { c.classList.remove('on'); c.setAttribute('aria-hidden', 'true'); } } catch (e) { /* */ }
    runs++;
    hud = createShiftHud(doc.body);
    mods = makeWorld();
    // ── recovered (17–24) ── the day's pace (walk.js PACE; on the twin: the rim, the sprint, the soft stick — __SH_HARDSTICK keeps the hard
    // one — and build 24's stick, __SH24_OFF without it), the day's view (VIEW24), the authored views of the morning's acts (camWork)
    try { mods.walk && mods.walk.pace && mods.walk.pace(PACE); const T = mods.twin; if (T) T.pace = { rim: PACE.rim, after: PACE.rimAfter, mul: PACE.sprint, soft: globalThis.__SH_HARDSTICK ? null : STICK, p24: globalThis.__SH_HARDSTICK || globalThis.__SH24_OFF ? null : STICK24 }; } catch (e) { /* */ }
    try { mods.camera && mods.camera.dayView && mods.camera.dayView(VIEW24); } catch (e) { /* */ }
    const hook = { work: (h) => (E ? E.work(h) : null), marks: () => [], tick: (dt) => { if (E) E.tick(dt); },
      camWork: () => (E && E.camWork20 ? (E.camWork35 && E.camWork35()) /* ── fable32 (build 35) ── (the morning's close: the altar's view, first) ── */ || E.camWork20() || (E.camWork23 && E.camWork23()) || (E.camWork25 && E.camWork25()) || (E.camWork26 && E.camWork26()) || (E.camWork27 && E.camWork27()) /* ── fable32 (build 27) ── */ || (E.camWork21 && E.camWork21()) || (E.camWork22 && E.camWork22()) : null) };
    D.shiftMode(hook);
    try { S() && S().hero && S().hero.setPos(-34, 50, Math.PI); } catch (e) { /* */ }   // (he starts between the ramp's foot and the wood store, facing the altar)
    try { const T = rig().twin; if (T && T.noStick) T.noStick(globalThis.__SH_NOSTICK === true); } catch (e) { /* */ }
    try { if (globalThis.__SH_AUTOWALK === undefined) globalThis.__SH_AUTOWALK = true; } catch (e) { /* */ }
    E = createDay33({ world: o.rig && o.rig.stages, twin: mods.twin, view: mods.view, hud, stations: mods.stations, camera: mods.camera, walk: mods.walk, sfx: o.sfx, save, persist, raf: false,
      score: SCORE30 ? null : scoreOf(), games: games(),   // ── fable32 (build 13–14) ── (the interludes, the one score) ── /fable32 ── ── fable32 (build 30) ── (no Phase A score from the day) ── /fable32 ──
      ...flags33() });   // ── fable32 (build 31) ── (the builds' flags: flags33, shared with the practice run) ── /fable32 ──
    const me = E;
    try { mods.flow31 = createFlow31({ E, view: mods.view, world: o.rig && o.rig.stages, twin: mods.twin, root: doc.body, kit: WORLD.kit, stations: mods.stations }); } catch (e) { console.warn('[shift] flow31', e && e.message); }
    if (E.b17) try { mods.focus17 = createFocus17({ E, view: mods.view, sfx: o.sfx }); } catch (e) { console.warn('[shift] focus17', e && e.message); }   // ── recovered (build 17) ──
    // ── fable32 (build 28) ── the pause card: "המשך" / "מהתחלה" and the two switches (צליל, רטט) — no "לסיור" ── /fable32 ──
    try { hud.onPause(() => { if (E !== me || !hud) return; E.pause(true); T28.release(); hud.pauseCard({ resume: () => { if (E === me) E.pause(false); }, note: W29.softLine /* ── fable32 (build 29) ── (the calm line) ── /fable32 ── */, sub: servedHe30(served30(save)) /* ── fable32 (build 30) ── */, restart: () => runDay(), back: { label: 'חזרה למסך הפתיחה', fn: () => { teardown(); card(); } } /* ── fable32 (build 34) ── (the day had no way back to the opening screen — the journal, the chamber, משחק קצר — but a reload; E.stop() saves the day as it is: "המשך יום N") ── /fable32 ── */, prefs: { sfx: o.sfx } }); }); } catch (e) { /* */ }
    startT = Date.now();
    hud.set(E.state());
    hud.intro('יום במקדש', 'הכיור, הפיס — וכל העבודה חשובה', 1100);   // ── fable32 (build 35) ── (was the fire loop's: "בקעו עצים, העלו אותם בכבש…" — svivat-avoda-he.md §1: "כל העבודה חשובה") ── /fable32 ──
    setTimeout(() => { if (E === me) { E.start(); emit('dayStart', { run: runs }); } }, 1000);
    globalThis.__SHIFT.mods = mods;
    return true;
  }
  // ── /fable32 ──
  /** back to the day ("סיור"): the shift off, the day's clock and guide on again */
  function tour() {
    teardown();
    try { D.shiftMode(null); } catch (e) { /* */ }
    emit('shiftTour', {});
  }
  // ── recovered (17–26) ── the builds' flags: each on unless its __SH*_OFF (b17: __SH_B17OFF); the coins by ENABLE_TEMPLE_COINS
  // ── fable32 (build 31) ── (one place for the day and the practice run) ── /fable32 ──
  function flags33() {
    const g = globalThis;
    return { b17: !g.__SH_B17OFF, court18: !g.__SH18_OFF, coins: coins18(), b19: !g.__SH18_OFF && !g.__SH19_OFF, g20: !g.__SH20_OFF,
      d21: !g.__SH20_OFF && !g.__SH21_OFF, m22: !g.__SH20_OFF && !g.__SH21_OFF && !g.__SH22_OFF,
      p23: !g.__SH20_OFF && !g.__SH21_OFF && !g.__SH22_OFF && !g.__SH23_OFF, p25: !g.__SH25_OFF, p26: !g.__SH26_OFF, p27: !g.__SH27_OFF /* ── fable32 (build 27) ── */, e35: !g.__SH35_OFF /* ── fable32 (build 35) ── (the morning measured by the work: day33.js E35) ── */ };
  }
  // ── fable32 (build 31) ── practice any role you have had, from the roles book (hachraot-he.md "עולם ומבנה", 21.10 23:46: "ספר התפקידים —
  // אימון בכל תפקיד בנוי, לשיא"; build 30's טעון תיקון end: "אפשר לנסות שוב בספר התפקידים"). From the lobby only: its roles book (the titles'
  // card, ספר הזכרונות › תפקידים) has "לתרגל" on every role he has had; the run is the day's engine with o.practice on a COPY of his save
  // (practiceSave31: no saved day in it) — his act at once, in its place, the court round it, the same controls and rating, no tamid clock
  // and no day timer — and only the role's record comes back (merge31: its rating, מהודר count, title); never the coins, the day ("המשך יום
  // N" stays where it was), the lot, the mornings served, the tasks or the badges. Its end: the rating, the source line, "עוד פעם" / "חזרה"
  // (back to the lobby it came from, the roles book open). Mid-day the book is read-only (the day's summary). ── /fable32 ──
  const on31 = () => {
    const f = flags33(), base = f.b17 && f.b19 && f.g20 && f.d21 && f.m22 && f.p23;
    return { kiyor: base, deshen: base, m22: base, lamb: base && f.p25, inner: base && f.p26, menorah: base && f.p26, shochet: base && f.p26 && f.p27, zorek: base && f.p26 && f.p27 };
  };
  let back31 = null;   // (the lobby to come back to after a practice run: { full, roles })
  // ── fable32 (build 32) ── the journal (book32.js) from the lobby: its tabs; the roles tab with the practice doors (from either lobby
  // screen — "חזרה" brings him back to the same one, the journal open there); the lobby's door redrawn as it closes (the new pages) ── /fable32 ──
  function openJournal(tab = 'roles', from = 'full', x = {}) {
    if (!doc) return null;
    return openJournal32({ doc, save, tab, sfx: o.sfx, persist, practice: (id) => runPractice(id, from), can: (id) => canPractice31(save, id, on31()), onClose: () => { if (cardCtl && cardCtl.refresh) cardCtl.refresh(); }, ...x });
  }
  function openRoles31(from = 'full') {
    return openJournal('roles', from);   // ── fable32 (build 32) ── (was its own sheet, rolesBook23: now the journal's first tab) ── /fable32 ──
  }
  function backFrom31(from) {
    teardown();
    back31 = { full: from !== 'start', roles: true };
    card();
  }
  function runPractice(role, from = 'full') {
    if (!D || !doc || !canPractice31(save, role, on31())) return false;
    hero35(); goLive();
    if (gate29()) return false;   // (the lock: its screen, not a practice run)
    if (cardCtl) { cardCtl.close(); cardCtl = null; }
    try { doc.querySelectorAll('.p23-bk, .j32').forEach((b) => b.remove()); } catch (e) { /* */ }   // ── fable32 (build 32) ── (+ the journal) ── /fable32 ──
    if (!D.active && !(D.canEnter() && D.enter())) return false;
    teardown();
    try { const c = doc.getElementById('card'); if (c && c.classList.contains('on')) { c.classList.remove('on'); c.setAttribute('aria-hidden', 'true'); } } catch (e) { /* */ }
    runs++;
    hud = createShiftHud(doc.body);
    mods = makeWorld();
    // (the day's rig, as runDay's: the pace, the stick, the view, the acts' authored views)
    try { mods.walk && mods.walk.pace && mods.walk.pace(PACE); const T = mods.twin; if (T) T.pace = { rim: PACE.rim, after: PACE.rimAfter, mul: PACE.sprint, soft: globalThis.__SH_HARDSTICK ? null : STICK, p24: globalThis.__SH_HARDSTICK || globalThis.__SH24_OFF ? null : STICK24 }; } catch (e) { /* */ }
    try { mods.camera && mods.camera.dayView && mods.camera.dayView(VIEW24); } catch (e) { /* */ }
    const hook = { work: (h) => (E ? E.work(h) : null), marks: () => [], tick: (dt) => { if (E) E.tick(dt); },
      camWork: () => (E && E.camWork20 ? (E.camWork35 && E.camWork35()) /* ── fable32 (build 35) ── (the morning's close: the altar's view, first) ── */ || E.camWork20() || (E.camWork23 && E.camWork23()) || (E.camWork25 && E.camWork25()) || (E.camWork26 && E.camWork26()) || (E.camWork27 && E.camWork27()) || (E.camWork21 && E.camWork21()) || (E.camWork22 && E.camWork22()) : null) };
    D.shiftMode(hook);
    try { const T = rig().twin; if (T && T.noStick) T.noStick(globalThis.__SH_NOSTICK === true); } catch (e) { /* */ }
    try { if (globalThis.__SH_AUTOWALK === undefined) globalThis.__SH_AUTOWALK = true; } catch (e) { /* */ }
    const A = ACT30[role] || { he: role, icon: '•' }, sd = save.day33state && typeof save.day33state === 'object' ? save.day33state : null;
    E = createDay33({ world: o.rig && o.rig.stages, twin: mods.twin, view: mods.view, hud, stations: mods.stations, camera: mods.camera, walk: mods.walk, sfx: o.sfx, save: practiceSave31(save), persist: () => {}, raf: false,
      score: null, games: null, practice: { role, day: resumeDay33(save) || 1, fed: (sd && +sd.fed) || 0, seed: 100 + Math.floor(Math.random() * 9000) }, ...flags33() });
    const me = E;
    E.on17((ev) => { if (ev.type === 'p31rec' && E === me && merge31(save, ev.id, ev.rec)) { save.prac35 = resumeDay33(save) || 1; /* ── fable32 (build 35) ── (the task "תרגלת תפקיד בספר": the game day it belongs to) ── */ persist(); evlog('practice31_rec', { id: ev.id, rating: ev.rating, q: ev.q }); } });   // (his record of the role — only it — into his save)
    try { mods.flow31 = createFlow31({ E, view: mods.view, world: o.rig && o.rig.stages, twin: mods.twin, root: doc.body, kit: WORLD.kit, stations: mods.stations }); } catch (e) { console.warn('[shift] flow31', e && e.message); }
    if (E.b17) try { mods.focus17 = createFocus17({ E, view: mods.view, sfx: o.sfx }); } catch (e) { console.warn('[shift] focus17', e && e.message); }
    try { mods.p31 = createPractice31({ E, doc, sfx: o.sfx, save: () => save, onAgain: () => runPractice(role, from), onBack: () => backFrom31(from) }); } catch (e) { console.warn('[shift] p31', e && e.message); }
    try { hud.onPause(() => { if (E !== me || !hud) return; E.pause(true); T28.release(); hud.pauseCard({ resume: () => { if (E === me) E.pause(false); }, note: W29.softLine, sub: `אימון — ${A.he}`, restart: () => runPractice(role, from), back: { label: 'חזרה לספר התפקידים', fn: () => backFrom31(from) }, prefs: { sfx: o.sfx } }); }); } catch (e) { /* */ }
    startT = Date.now();
    hud.set(E.state());
    hud.intro('אימון', `${A.icon} ${A.he} — המחשה`, 900);
    setTimeout(() => { if (E === me) { E.start(); emit('practiceStart', { role, run: runs }); } }, 800);
    evlog('practice31_open', { id: role, from });
    globalThis.__SHIFT.mods = mods;
    return true;
  }
  // ── /fable32 ──
  // ── fable32 (build 33) ── לשכת הטלאים (the opening screen's "מכאן — המקדש עכשיו" card): the day's engine on a COPY of his save (as a
  // practice run of the lamb — practiceSave31; the saved day untouched), its places the chamber's (Beit HaMoked's south-west corner,
  // lamb33's CH33), the sky of the real hour where the phone is; he walks in from the azara (the left thumb), the inspection is the pen's
  // (the right thumb) on the day's one lamb at an easy level. Its outcome comes back to his own save (inspect33: the lamb with its tag in
  // the chamber, or a בעל מום that did not enter; the coins by the rating, as any act — nothing else); today's done: the stock only. ── /fable32 ──
  function runChamber33() {
    if (!D || !doc || !on31().lamb) return false;
    hero35(); goLive();
    if (gate29()) return false;   // (the lock: its screen)
    if (cardCtl) { cardCtl.close(); cardCtl = null; }
    try { doc.querySelectorAll('.p23-bk, .j32').forEach((b) => b.remove()); } catch (e) { /* */ }
    if (!D.active && !(D.canEnter() && D.enter())) return false;
    teardown();
    try { const c = doc.getElementById('card'); if (c && c.classList.contains('on')) { c.classList.remove('on'); c.setAttribute('aria-hidden', 'true'); } } catch (e) { /* */ }
    runs++;
    const now = clock29(), w = where29(), dn = day33n(now, w);
    if (settle33(save, dn)) persist();   // (the chamber's kohanim's offerings of the days he was away: recorded)
    const S0 = stock33(save, dn), done = !canInspect33(save, dn), b = lb33(save);
    let skyK = 'noon';
    try { skyK = sky29(now, w); } catch (e) { /* */ }
    hud = createShiftHud(doc.body);
    mods = makeWorld();
    try { mods.walk && mods.walk.pace && mods.walk.pace(PACE); const T = mods.twin; if (T) T.pace = { rim: PACE.rim, after: PACE.rimAfter, mul: PACE.sprint, soft: globalThis.__SH_HARDSTICK ? null : STICK, p24: globalThis.__SH_HARDSTICK || globalThis.__SH24_OFF ? null : STICK24 }; } catch (e) { /* */ }
    try { mods.camera && mods.camera.dayView && mods.camera.dayView(VIEW24); } catch (e) { /* */ }
    const hook = { work: (h) => (E ? E.work(h) : null), marks: () => [], tick: (dt) => { if (E) E.tick(dt); },
      camWork: () => (E && E.camWork20 ? (E.camWork35 && E.camWork35()) /* ── fable32 (build 35) ── (the morning's close: the altar's view, first) ── */ || E.camWork20() || (E.camWork23 && E.camWork23()) || (E.camWork25 && E.camWork25()) || (E.camWork26 && E.camWork26()) || (E.camWork27 && E.camWork27()) || (E.camWork21 && E.camWork21()) || (E.camWork22 && E.camWork22()) : null) };
    D.shiftMode(hook);
    try { const T = rig().twin; if (T && T.noStick) T.noStick(globalThis.__SH_NOSTICK === true); } catch (e) { /* */ }
    try { if (globalThis.__SH_AUTOWALK === undefined) globalThis.__SH_AUTOWALK = true; } catch (e) { /* */ }
    const sd = save.day33state && typeof save.day33state === 'object' ? save.day33state : null;
    E = createDay33({ world: o.rig && o.rig.stages, twin: mods.twin, view: mods.view, hud, stations: mods.stations, camera: mods.camera, walk: mods.walk, sfx: o.sfx, save: practiceSave31(save), persist: () => {}, raf: false,
      score: null, games: null, now: () => clock29(), where: () => where29(),
      practice: { role: 'lamb', day: resumeDay33(save) || 1, fed: (sd && +sd.fed) || 0, seed: dn,
        ch33: { dn, done, sky: LOBBY29.sky[skyK] || 'noon', lit: skyK === 'night' ? 'night' : 'day', mine: S0.mine.length, court: S0.court, tags: S0.mine.map((L) => L.c), next: (b ? b.list.length : 0) % L33.tags.length } },
      ...flags33() });
    const me = E;
    // the outcome into HIS save, at once (the end card comes as the rating's word ends — "ch33end")
    E.on17((ev) => {
      if (ev.type !== 'ch33rec' || E !== me) return;
      const t = clock29(), r = inspect33(save, { dn: ev.dn, t, h: hebDate32(t, where29()), out: ev.out, r: ev.rating, q: ev.q, k: ev.blem ? ev.blem.c : null, g: ev.blem ? ev.blem.r : null });
      if (r && ev.coins > 0) save.perutot = (+save.perutot || 0) + (ev.coins | 0);
      if (r) save.ch35 = resumeDay33(save) || 1;   // ── fable32 (build 35) ── (the task "בדקת טלה בלשכה": the game day it belongs to) ── /fable32 ──
      persist();
      evlog('lamb33_rec', { out: ev.out, rating: ev.rating, q: ev.q, coins: ev.coins, dn: ev.dn, ok: !!r });
    });
    try { mods.flow31 = createFlow31({ E, view: mods.view, world: o.rig && o.rig.stages, twin: mods.twin, root: doc.body, kit: WORLD.kit, stations: mods.stations }); } catch (e) { console.warn('[shift] flow31', e && e.message); }
    if (E.b17) try { mods.focus17 = createFocus17({ E, view: mods.view, sfx: o.sfx }); } catch (e) { console.warn('[shift] focus17', e && e.message); }
    try { mods.ch33 = createChamber33({ E, doc, sfx: o.sfx, save: () => save, dn, onBack: () => backFrom33(), onJournal: () => backFrom33('taleh') }); } catch (e) { console.warn('[shift] ch33', e && e.message); }
    try { hud.onPause(() => { if (E !== me || !hud) return; E.pause(true); T28.release(); hud.pauseCard({ resume: () => { if (E === me) E.pause(false); }, note: W29.softLine, sub: 'לשכת הטלאים', restart: () => runChamber33(), back: { label: 'חזרה למסך הפתיחה', fn: () => backFrom33() }, prefs: { sfx: o.sfx } }); }); } catch (e) { /* */ }
    startT = Date.now();
    hud.set(E.state());
    hud.intro('לשכת הטלאים', done ? 'את הטלה של היום כבר בדקת — הטלאים בלשכה' : 'מערבית דרומית בבית המוקד — טלה אחד לבדוק היום', 900);
    setTimeout(() => { if (E === me) { E.start(); emit('chamberStart', { dn, done, run: runs }); } }, 800);
    evlog('lamb33_open', { dn, done, mine: S0.mine.length });
    globalThis.__SHIFT.mods = mods;
    return true;
  }
  let back33 = null;
  function backFrom33(tab) {
    teardown();
    back33 = tab || null;
    card();
  }
  // ── /fable32 ──
  // ── recovered (build 18) ── the temple's coins on: ENABLE_TEMPLE_COINS, unless __SH18_OFF, __SH18_NOCOINS or ?coins=0 (then the shop
  // keeps the good axe and the big basket, which the coins' pads sell in the court)
  function coins18() {
    try { return ENABLE_TEMPLE_COINS && !globalThis.__SH18_OFF && !globalThis.__SH18_NOCOINS && !/[?&]coins=0\b/.test(location.search || ''); } catch (e) { return ENABLE_TEMPLE_COINS; }
  }
  // ── fable32 (build 8) ── the shop over the entry card: פרוטות for tools and the sash (MIKDASH99 §5); kept in save.day33
  function openShop() {
    if (!doc) return;
    const own = save.day33 && typeof save.day33 === 'object' ? save.day33 : (save.day33 = {});
    const h = createShiftHud(doc.body);
    const items = SHOP33.filter((it) => !(coins18() && (it.id === 'axe' || it.id === 'basket10'))).map((it) => ({ icon: it.icon, label: it.label, sub: own[it.id] ? `${it.sub} — יש לכם` : it.sub, price: own[it.id] ? null : it.price, disabled: !!own[it.id] || (it.needs && !own[it.needs]) || (+save.perutot || 0) < it.price,
      go: () => { if ((+save.perutot || 0) < it.price || own[it.id]) return false; save.perutot = (+save.perutot || 0) - it.price; own[it.id] = 1; persist(); try { o.sfx && o.sfx.play && o.sfx.play('coin'); } catch (e) { /* */ } return false; } }));
    h.choice({ title: `חנות · ${+save.perutot || 0} פרוטות`, text: 'פרוטות באות ממשימות הממונה, מהסוחר וממשחקי הביניים — לא מימים. (טיוטה)', items, closeLabel: 'סגור', refresh: () => { h.destroy(); openShop(); }, onClose: () => { h.destroy(); if (cardCtl && cardCtl.refresh) cardCtl.refresh(); else if (cardCtl) { cardCtl.close(); cardCtl = null; card(); } } });   // ── fable32 (build 13) ── (the lobby refreshes in place) ── /fable32 ──
  }
  // ── /fable32 ──
  // ── fable32 (build 13) ── ספר הזכרונות from the home screen: what was claimed, what waits (read-only; the claim itself is at night in בית המוקד)
  // ── fable32 (build 32) ── now the journal's "אותות" tab (the same list); the old sheet stays below for __SH_OLDBOOK ── /fable32 ──
  function openBook() {
    if (!doc) return;
    if (!globalThis.__SH_OLDBOOK) { openJournal('badges', 'full'); return; }
    const cl = save.badges33 && typeof save.badges33 === 'object' ? save.badges33 : {};
    const h = createShiftHud(doc.body);
    const items = [{ icon: '🎭', label: 'תפקידים — ספר התפקידים', sub: 'כל תפקיד בוקר: הדירוג, התואר, הפעמים, ולתרגל מה שכבר יצא לכם' /* ── fable32 (build 30) ── ── fable32 (build 31) ── (+ the practice doors) ── /fable32 ── */, go: () => { rolesBook23({ doc, save, practice: (id) => runPractice(id, 'full'), can: (id) => canPractice31(save, id, on31()), onClose: () => openBook() }); return true; } },   // ── recovered (build 23) ── (the roles' book first)
      ...BADGES33.map((b) => ({ icon: cl[b.id] ? '✅' : '📜', label: b.text, sub: cl[b.id] ? 'שלכם' : `+${b.pay} פרוטות — נרשם בעזרה, נגבה בלילה בבית המוקד`, disabled: !cl[b.id] }))];
    h.choice({ title: 'ספר הזכרונות', text: 'מה שעשיתם בעזרה נרשם; את הפרוטות גובים בלילה, בבית המוקד (המחשה: לוח המתגים)', items, closeLabel: 'סגור', onClose: () => { h.destroy(); if (cardCtl && cardCtl.refresh) cardCtl.refresh(); } });
  }
  function openMerchant() {
    if (!doc) return;
    const h = createShiftHud(doc.body);
    h.choice({ title: 'הסוחר', text: 'מגיע לעזרה ביום השני של השירות: סחר בעודפים — גזרים, לחם, שמן — בפרוטות. (טיוטה; המחשה)', items: [{ icon: '🧺', label: 'ביום 2 — ליד פינת בית המוקד', sub: 'שחקו "יום במקדש" עד היום השני', disabled: true }], closeLabel: 'סגור', onClose: () => { h.destroy(); } });
  }
  // ── /fable32 ──
  // ── fable32 (build 14) ── the interludes, one way for the court and the lobby: each returns the game's own result; its פרוטות and score are added by the caller
  const subSave = (k, d) => (save[k] && typeof save[k] === 'object' ? save[k] : (save[k] = d));
  function games() {
    return {
      tiles: () => { const tl = subSave('tiles', { level: 1, best: {}, perutot: 0 }); return runTiles({ root: doc.body, level: Math.max(1, tl.level | 0 || 1), save: tl, sfx: o.sfx, onEvent: (t, d) => emit('tiles:' + t, d) }); },
      pen: () => { const pn = subSave('pen', { level: 1, best: {}, perutot: 0 }); return runPen({ root: doc.body, level: Math.max(1, pn.level | 0 || 1), save: pn, sfx: o.sfx, onEvent: (t, d) => emit('pen:' + t, d) }); },
      m3: () => { const m3 = subSave('m3', { level: { quarry: 1, forest: 1, gold: 1 }, best: {}, album: {}, seen: {} }); if (typeof M3.runLevel !== 'function') return Promise.resolve(null); return M3.runLevel({ root: doc.body, save: m3, sfx: o.sfx, map: true, onEvent: (t, d) => emit('m3:' + t, d) }).then((r) => (r ? { ...r, perutot: r.quit ? 0 : r.won ? 4 + 2 * (r.stars | 0) : 1 } : null)); },
    };
  }
  let scoreObj = null; const scoreOf = () => (scoreObj || (scoreObj = openScore({ emit: (t, d) => emit(t, d) })));
  // ── /fable32 ──
  function card() {
    if (cardCtl || !doc) return;
    hero35(); goLive();   // ── fable32 (build 28) ── ── /fable32 ──
    if (gate29()) return;   // ── fable32 (build 29) ── (the lock: only its screen) ── /fable32 ──
    if (globalThis.__SH_OLDCARD) { cardCtl = entryCard(doc.body, { lvl: save.lvl, best: save.best[save.lvl] | 0, bestDay: +save.bestDay || 0, perutot: +save.perutot || 0, shop: () => openShop(), shift: (n) => { cardCtl = null; run(n); }, day: () => { cardCtl = null; runDay(); }, tour: () => { cardCtl = null; tour(); } }); return; }   // ── fable32 (build 6) ── (+ day) ── /fable32 ──   // (build 13: the old card for a test)
    // ── fable32 (build 13) ── the 3D home screen (lobby35.js): the kohen live in the court, the doors round him
    const st = o.rig && o.rig.stages, view = o.rig && o.rig.view;
    const b31 = back31; back31 = null;   // ── fable32 (build 31) ── (back from a practice run: the lobby it came from, its roles book open) ── /fable32 ──
    cardCtl = createLobby({ D, world: st, view, twin: rig().twin || null, save, persist, sfx: o.sfx, kit: WORLD.kit, camera: WORLD.camera, games: games(), score: SCORE30 ? null : scoreOf() /* ── fable32 (build 30) ── */, start: !(b31 && b31.full) && save.lobbyOff !== false && !globalThis.__SH_LOBBYFULL /* ── recovered (build 16) ── the start screen (save.lobbyOff; __SH_LOBBYFULL the full one) */, on: {
      day: () => { cardCtl = null; runDay(); },   // ── fable32 (build 28) ── (no shift, no tour: the day only) ── /fable32 ──
      chamber: () => { cardCtl = null; runChamber33(); } /* ── fable32 (build 33) ── לשכת הטלאים ── /fable32 ── */, shop: () => openShop(), book: () => openBook(), roles: () => openRoles31('full') /* ── fable32 (build 30) ── (the titles' card) ── /fable32 ── ── fable32 (build 31) ── (with the practice doors) ── /fable32 ── */, journal: (from) => openJournal('roles', from === 'start' ? 'start' : 'full') /* ── fable32 (build 32) ── the journal's one door ── /fable32 ── */, merchant: () => openMerchant(), event: (g, t, d) => emit(`${g}:${t}`, d) } });
    try { if (cardCtl && cardCtl.soft29) cardCtl.soft29(W29.softLine); } catch (e) { /* */ }   // ── fable32 (build 29) ── (the calm line, if it is that time) ── /fable32 ──
    if (b31 && b31.roles) try { openRoles31(b31.full ? 'full' : 'start'); } catch (e) { /* */ }   // ── fable32 (build 31) ── ── /fable32 ──
    { const b33 = back33; back33 = null; if (b33) try { openJournal(b33, 'start'); } catch (e) { /* */ } }   // ── fable32 (build 33) ── (back from the chamber with "📖 ביומן": the journal's lambs tab) ── /fable32 ──
    // ── /fable32 ──
  }
  // ── fable32 (build 28) ── the phone turned to portrait while the shift is up: the "turn the phone" card over the paused day (prefs28's
  // createTurn28); avodah/index.js's tick calls SH.turn28(port) every second with port = !D.canEnter() — the old way (D.exit + the old home)
  // never runs once the shift is up ── /fable32 ──
  const turn28 = (port) => T28.set(port);
  // ── fable32 (build 29) ── the lock: the watch, the gate, its screen (the lobby's court at rest), the calm line over the day ── /fable32 ──
  let after29 = null, timer29 = 0;
  const W29 = createWatch29({ now: () => clock29(), where: () => where29(), active: () => live, E: () => E, persist,
    stop: () => { teardown(); dropGames29(doc); if (cardCtl) { try { cardCtl.close(); } catch (e) { /* */ } cardCtl = null; } T28.set(false); },
    show: (s) => openLock29(s), refresh: (s) => { if (cardCtl && cardCtl.lock29) cardCtl.lock29(s); },
    hide: () => { if (cardCtl) { try { cardCtl.close(); } catch (e) { /* */ } cardCtl = null; } },
    reopen: () => { const f = after29; after29 = null; try { (f || card)(); } catch (e) { console.warn('[shift] reopen29', e && e.message); } },
    soft: (line) => { if (cardCtl && cardCtl.soft29) cardCtl.soft29(line); softDay29(doc, E ? line : ''); },
    log: (t, d) => evlog(t, d) });
  /** true when locked: the lock screen is (now) up; after() runs at its end (default: the lobby) */
  function gate29(after) { W29.check(true); if (!W29.locked) return false; if (after) after29 = after; return true; }
  function openLock29(s) {
    if (!doc) return;
    hero35(); goLive();
    const L = createLobby({ D, world: o.rig && o.rig.stages, view: o.rig && o.rig.view, twin: rig().twin || null, twinOf: () => rig().twin || null /* (a page opened in the lock: the world is entered by the lobby itself) */, save, persist, sfx: o.sfx, kit: WORLD.kit, camera: WORLD.camera, lock: s, on: {} });
    cardCtl = L;
  }
  function tick29() {
    W29.check();
    try { if (cardCtl && cardCtl.soft29 && !W29.locked) cardCtl.soft29(W29.softLine); if (cardCtl && cardCtl.tick29) cardCtl.tick29(); } catch (e) { /* */ }
    if (E && W29.softLine) softDay29(doc, W29.softLine);   // (its place under the day's top bar, which changes)
    else if (!E) softDay29(doc, '');
  }
  if (typeof setInterval === 'function' && doc) timer29 = setInterval(() => { try { tick29(); } catch (e) { /* */ } }, 2000);
  // ── /fable32 ──
  const SH = {
    run, runDay, card, tour, get active() { return !!E; }, get save() { return save; },   // ── fable32 (build 6) ── (+ runDay) ── /fable32 ──
    get live() { return live; }, turn28: (port) => turn28(port && !W29.locked) /* ── fable32 (build 29) ── (the lock's screen also in portrait: no "turn the phone" over it) ── /fable32 ── */, get turned() { return T28.on; },   // ── fable32 (build 28) ── ── /fable32 ──
    gate29, get locked() { return W29.locked; }, check29: () => W29.check(true),   // ── fable32 (build 29) ── ── /fable32 ──
    destroy() { teardown(); if (cardCtl) { cardCtl.close(); cardCtl = null; } T28.set(false); if (live) { live = false; cover28(doc, false); } try { D && D.shiftMode && D.shiftMode(null); } catch (e) { /* */ } if (timer29) { clearInterval(timer29); timer29 = 0; } softDay29(doc, ''); },
  };
  globalThis.__SHIFT = {
    SH, run, runDay, card, tour, get E() { return E; }, set E(v) { /* */ }, mods: null, save,
    state: () => (E ? E.state() : null), startT: () => startT,
    book: () => openBook(), roles: () => openJournal('roles', 'full', { practice: null, note31: false }),   // ── recovered (build 23) ── ── fable32 (build 32) ── (the journal's roles tab, no doors) ── /fable32 ──
    journal: (tab, from, x) => openJournal(tab || 'roles', from || 'full', x || {}),   // ── fable32 (build 32) ── (the autoplayer and the probes) ── /fable32 ──
    book31: (from) => openRoles31(from || 'full'), practice: (id, from) => runPractice(id, from || 'full'), back31: (from) => backFrom31(from || 'full'),
    chamber33: () => runChamber33(), back33: (tab) => backFrom33(tab),   // ── fable32 (build 33) ── (the probes) ── /fable32 ──   // ── fable32 (build 31) ── (the book with its doors, a run, back: the autoplayer and the probes) ── /fable32 ──
    w29: W29, tick29: () => tick29(), status29: () => status29(clock29(), where29()), where29: () => where29(),   // ── fable32 (build 29) ── (the browser checks: the watch now, not in 2 s) ── /fable32 ──
    debug: { stars: (n) => (E ? E.debug.stars(n) : null), end: () => (E ? E.debug.end() : null), log: () => (E ? E.debug.log() : []), goal: () => (E ? E.debug.goal() : null), spawnNow: () => E && E.debug.spawnNow(), patience: (v) => { if (!E || !mods) return 0; let k = 0; for (const P of mods.pilgrims.list()) if (P.state === 'wait') { P.patience = v; k++; } return k; } },
  };
  return SH;
}
// ── /shift29 ──
