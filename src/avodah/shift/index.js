// ── shift29 ── index.js — the shift's entry (docs/WAVE29-BRIEF.md SHIFT29A (6)): Phase B's entry card ("משמרת" big and gold, "סיור"
// small — the old day), the `#shift` / `#shift=N` links, and A.shift = { best:{lvl:score}, lvl, stars } in Phase B's own save.
// The shift runs in the day's world (day/index.js: D entered, its clock, guide and HUD held — D.shiftMode), the sky at 7:00.
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
import { createWalk } from './walk.js';
import { createFlow31 } from './flow31.js';   // ── flow31 ── ── /flow31 ──
import { createDay33, SHOP33, BADGES33 } from './day33.js';   // ── fable32 (build 6) ── "יום במקדש" ── /fable32 ──
import { createLobby } from './lobby35.js';   // ── fable32 (build 13) ── the 3D home screen ── /fable32 ──
import { runTiles } from '../../tiles/index.js';   // ── fable32 (build 13) ── the night's interlude ── /fable32 ──
import { runPen } from '../../pen/index.js';   // ── fable32 (build 14) ── the sliding pen ── /fable32 ──
import * as M3 from '../../match3/index.js';
import { openScore } from './score35.js';   // ── fable32 (build 14) ── the one score ── /fable32 ──
import { createHero35 } from './hero35.js';   // ── fable32 (build 15) ── the real kohen ── /fable32 ──
import { onTick } from './draw.js';
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
  let E = null, hud = null, mods = null, cardCtl = null, lvlNow = 1, runs = 0, startT = 0;
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
    if (E) { try { E.stop(); } catch (e) { console.warn('[shift] stop', e && e.message); } E = null; }
    if (mods) {
      try { mods.stations && mods.stations.clear && mods.stations.clear(); } catch (e) { /* */ }
      try { mods.pilgrims && mods.pilgrims.clear && mods.pilgrims.clear(); } catch (e) { /* */ }
      try { mods.camera && mods.camera.off && mods.camera.off(); } catch (e) { /* */ }
      try { mods.walk && mods.walk.stop && mods.walk.stop(); mods.walk && mods.walk.run && mods.walk.run(false); } catch (e) { /* */ }
      try { mods.flow31 && mods.flow31.destroy(); } catch (e) { /* */ }   // ── flow31 ── ── /flow31 ──
      try { mods.stations && mods.stations.destroy && mods.stations.destroy(); mods.pilgrims && mods.pilgrims.destroy && mods.pilgrims.destroy(); } catch (e) { /* */ }
      mods = null;
    }
    if (hud) { hud.destroy(); hud = null; }
    try { const T = rig().twin; if (T && T.noStick) T.noStick(false); } catch (e) { /* */ }   // ── fable32 (build 4) ── (the day's stick back) ── /fable32 ──
  }
  /** a round of level n: ≤ 2 s from the tap to the clock */
  function run(n) {
    if (!D) return false;
    hero35();
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
    hero35();
    if (cardCtl) { cardCtl.close(); cardCtl = null; }
    if (!D.active && !(D.canEnter() && D.enter())) return false;
    teardown();
    try { const c = doc.getElementById('card'); if (c && c.classList.contains('on')) { c.classList.remove('on'); c.setAttribute('aria-hidden', 'true'); } } catch (e) { /* */ }
    runs++;
    hud = createShiftHud(doc.body);
    mods = makeWorld();
    const hook = { work: (h) => (E ? E.work(h) : null), marks: () => [], tick: (dt) => { if (E) E.tick(dt); } };
    D.shiftMode(hook);
    try { S() && S().hero && S().hero.setPos(-34, 50, Math.PI); } catch (e) { /* */ }   // (he starts between the ramp's foot and the wood store, facing the altar)
    try { const T = rig().twin; if (T && T.noStick) T.noStick(globalThis.__SH_NOSTICK === true); } catch (e) { /* */ }
    try { if (globalThis.__SH_AUTOWALK === undefined) globalThis.__SH_AUTOWALK = true; } catch (e) { /* */ }
    E = createDay33({ world: o.rig && o.rig.stages, twin: mods.twin, view: mods.view, hud, stations: mods.stations, camera: mods.camera, walk: mods.walk, sfx: o.sfx, save, persist, raf: false,
      score: scoreOf(), games: games() });   // ── fable32 (build 13–14) ── (the interludes, the one score) ── /fable32 ──
    const me = E;
    try { mods.flow31 = createFlow31({ E, view: mods.view, world: o.rig && o.rig.stages, twin: mods.twin, root: doc.body, kit: WORLD.kit, stations: mods.stations }); } catch (e) { console.warn('[shift] flow31', e && e.message); }
    try { hud.onPause(() => { if (E !== me || !hud) return; E.pause(true); hud.pauseCard({ resume: () => { if (E === me) E.pause(false); }, restart: () => runDay(), tour: () => tour() }); }); } catch (e) { /* */ }
    startT = Date.now();
    hud.set(E.state());
    hud.intro('יום במקדש', 'בקעו עצים, העלו אותם בכבש — שהאש לא תרד לגחלת', 1100);
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
  // ── fable32 (build 8) ── the shop over the entry card: פרוטות for tools and the sash (MIKDASH99 §5); kept in save.day33
  function openShop() {
    if (!doc) return;
    const own = save.day33 && typeof save.day33 === 'object' ? save.day33 : (save.day33 = {});
    const h = createShiftHud(doc.body);
    const items = SHOP33.map((it) => ({ icon: it.icon, label: it.label, sub: own[it.id] ? `${it.sub} — יש לכם` : it.sub, price: own[it.id] ? null : it.price, disabled: !!own[it.id] || (it.needs && !own[it.needs]) || (+save.perutot || 0) < it.price,
      go: () => { if ((+save.perutot || 0) < it.price || own[it.id]) return false; save.perutot = (+save.perutot || 0) - it.price; own[it.id] = 1; persist(); try { o.sfx && o.sfx.play && o.sfx.play('coin'); } catch (e) { /* */ } return false; } }));
    h.choice({ title: `חנות · ${+save.perutot || 0} פרוטות`, text: 'פרוטות באות ממשימות הממונה, מהסוחר וממשחקי הביניים — לא מימים. (טיוטה)', items, closeLabel: 'סגור', refresh: () => { h.destroy(); openShop(); }, onClose: () => { h.destroy(); if (cardCtl && cardCtl.refresh) cardCtl.refresh(); else if (cardCtl) { cardCtl.close(); cardCtl = null; card(); } } });   // ── fable32 (build 13) ── (the lobby refreshes in place) ── /fable32 ──
  }
  // ── /fable32 ──
  // ── fable32 (build 13) ── ספר הזכרונות from the home screen: what was claimed, what waits (read-only; the claim itself is at night in בית המוקד)
  function openBook() {
    if (!doc) return;
    const cl = save.badges33 && typeof save.badges33 === 'object' ? save.badges33 : {};
    const h = createShiftHud(doc.body);
    const items = BADGES33.map((b) => ({ icon: cl[b.id] ? '✅' : '📜', label: b.text, sub: cl[b.id] ? 'שלכם' : `+${b.pay} פרוטות — נרשם בעזרה, נגבה בלילה בבית המוקד`, disabled: !cl[b.id] }));
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
    hero35();
    if (globalThis.__SH_OLDCARD) { cardCtl = entryCard(doc.body, { lvl: save.lvl, best: save.best[save.lvl] | 0, bestDay: +save.bestDay || 0, perutot: +save.perutot || 0, shop: () => openShop(), shift: (n) => { cardCtl = null; run(n); }, day: () => { cardCtl = null; runDay(); }, tour: () => { cardCtl = null; tour(); } }); return; }   // ── fable32 (build 6) ── (+ day) ── /fable32 ──   // (build 13: the old card for a test)
    // ── fable32 (build 13) ── the 3D home screen (lobby35.js): the kohen live in the court, the doors round him
    const st = o.rig && o.rig.stages, view = o.rig && o.rig.view;
    cardCtl = createLobby({ D, world: st, view, twin: rig().twin || null, save, persist, sfx: o.sfx, kit: WORLD.kit, camera: WORLD.camera, games: games(), score: scoreOf(), on: {
      day: () => { cardCtl = null; runDay(); }, shift: () => { cardCtl = null; run(save.lvl); }, tour: () => { cardCtl = null; tour(); },
      shop: () => openShop(), book: () => openBook(), merchant: () => openMerchant(), event: (g, t, d) => emit(`${g}:${t}`, d) } });
    // ── /fable32 ──
  }
  const SH = {
    run, runDay, card, tour, get active() { return !!E; }, get save() { return save; },   // ── fable32 (build 6) ── (+ runDay) ── /fable32 ──
    destroy() { teardown(); if (cardCtl) { cardCtl.close(); cardCtl = null; } try { D && D.shiftMode && D.shiftMode(null); } catch (e) { /* */ } },
  };
  globalThis.__SHIFT = {
    SH, run, runDay, card, tour, get E() { return E; }, set E(v) { /* */ }, mods: null, save,
    state: () => (E ? E.state() : null), startT: () => startT,
    debug: { stars: (n) => (E ? E.debug.stars(n) : null), end: () => (E ? E.debug.end() : null), log: () => (E ? E.debug.log() : []), goal: () => (E ? E.debug.goal() : null), spawnNow: () => E && E.debug.spawnNow(), patience: (v) => { if (!E || !mods) return 0; let k = 0; for (const P of mods.pilgrims.list()) if (P.state === 'wait') { P.patience = v; k++; } return k; } },
  };
  return SH;
}
// ── /shift29 ──
