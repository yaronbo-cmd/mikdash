/* day/index.js — "יום במקדש": the Temple day in game time, the horizon HUD, the ממונים' errands, and the two thumbs in Phase B's world
 * (ENGINE22, wave 22; docs/PHASEB-DAY-DESIGN.md; bus/ENGINE22.md "CONTRACT").
 *   const D = createDay({ A, persist, emit, rig: { stages, view, camera, scene }, root, sfx, world, runGame(id), busy(), homeOpen(),
 *                         showHome(on), tomorrow() → [hebrew lines], addPoints(n), now() })
 *   D.enter() · D.exit() · D.frame(ms) · D.active · D.onAvodah(type, d) · D.clock · D.tasks · D.stock · D.startWork(id)
 * The left thumb walks the אמרכל (the builder's model, stages.hero) on the finished Temple's floors: its solids are walls to the stick
 * and the פרוכת is never reachable. The right button wakes at an errand's marker. The clock runs in game time (3 real minutes a temple
 * hour by day, the night 5 minutes in all) and PAUSES whenever the page is hidden or he leaves: the Temple waits for him.
 * No timer presses: a request past its hour simply leaves the list, with no penalty. Every text here is a draft ("טיוטה") or "המחשה". */
import { createDayClock, labelHe, APPOINTMENTS } from './clock.js';
import { createStock } from './stock.js';
import { createTasks } from './tasks.js';
import { WORKS, warmers } from './works.js';
import { PLACE22, placeAt } from './places.js';
import { blocked, skyFor, free } from './world22.js';
import { createTwin } from '../../game/twin.js';
import { runInWorld } from '../../game/hands.js';
import { MEMUNIM, GAMES } from '../data.js';
import { CSS } from './css.js';
import { createBridge, fmt, SCALE } from './bridge.js';   // ── polish23 ── (the day's points → Phase A's score / the dinar)
import { PointLight } from 'three';
import { getKit } from '../works/craft.js';   // ── polish23 ── (the kit's refit under the settled camera)   // ── polish23 ── (the אמרכל's torch at night)
import { closeup as f24Closeup, release as f24Release, closeTick as f24Tick } from '../works/closeup.js';   // ── figures24 ── (the precision camera of a work's key act) ── /figures24 ──
import { heroBegin as h26Begin, heroBack as h26Back, heroAbort as h26Abort, epiMs as h26Ms, sleep as h26Sleep, h26Css, H as H26 } from '../works/hero26.js';   // ── hero26 ── ── /hero26 ──
import { bind27, record27, stamp27 } from '../works/slice27.js';   // ── slice27 ── (the level counter, the stamp after the source line) ── /slice27 ──
import { createGuide } from './guide27.js';   // ── guide27 ── (never lost, never idle: the primary, the path, the idle ladder, practice, the skip card) ── /guide27 ──
import { nearDim, pinTops, claim as claim28, reg as reg28, zone as zone28, hold as hold28 } from '../../light28.js';   // ── light28 ── ── /light28 ──
import { BIRKAT_VERSES, BIRKAT_SRC } from '../works/birkat28.js';   // ── light28 ── ── /light28 ──
import { ANCHORS as ANCHORS28 } from '../works/anchors.js';   // ── light28 ── ── /light28 ──
const L28T = { base: 38, y: 4.6, floor: 0.22, cap: 16, col: '#FFC690', max: 14 };   // (max: a wall at 2 amot from the flame lit to warm stone, never white, from any camera)   // ── light28 ── his torch at the dark night: base candela, the height over him, the floor of k², the reach (amot) ── /light28 ──
if (typeof globalThis !== 'undefined') globalThis.__L28T = L28T;   // ── light28 ── (tests tune it) ── /light28 ──
import { createCamGuard } from './cam28.js';   // ── cam28 ── (the camera never inside a solid) ── /cam28 ──
// ── works-imports ── (the registrations live in ../works/all.js — one place, two lines to uncomment at the merge)
import '../works/all.js';
// ── /works-imports ──

const BONUS_DAY = 250;   // ── polish23 ── (the master score's BONUS.course: a completed day)
const WORK_EL = 0.72;   // ── polish23 ── (41°; the follow camera is 57° otherwise)
// ── fix26 ── the lots' circle stands inside the לשכת הגזית: at 41° its roof filled the lower half of the frame — the lots are seen from higher (60°)
const f26El = (r) => (r && r.W && /^payis/.test(r.W.id || '') ? 1.05 : 0);
// ── /fix26 ──
const ZOOM_K = 0.62;   // ── polish23 ── (the follow camera's distance share during a work: the same as Phase A's craft zoom)
const START_SPOT = { x: -15, z: 0, yaw: Math.PI / 2 };
const isLand = () => typeof innerWidth === 'number' && innerWidth > innerHeight && innerWidth >= 640;
const noTwin = () => { try { return /[?&]twin=0\b/.test(location.search || ''); } catch (e) { return false; } };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BLOCK_HE = { night: 'הלילה — שמירה, מדורה וטלאים', dawn: 'השחר — ההשכמה והפיס', day: 'היום — הקרבנות והמחסנים', evening: 'בין הערביים', close: 'סוף היום — ספירה ונעילה' };
const hoursHe = (min) => (min >= 105 ? `${Math.round(min / 60)} שעות` : min >= 75 ? 'שעה וחצי' : min >= 50 ? 'שעה' : min >= 35 ? 'שלושת רבעי שעה' : min >= 20 ? 'חצי שעה' : 'רבע שעה');
const memunName = (id) => { const m = MEMUNIM && MEMUNIM.find ? MEMUNIM.find((x) => x.id === id) : null; return m ? (m.name_he || m.name || '').replace(/ \(.*\)$/, '') : ''; };

export function createDay(o = {}) {
  const doc = typeof document !== 'undefined' ? document : null;
  const A = o.A, rig = o.rig || {}, S = rig.stages, view = rig.view;
  if (!A.day || typeof A.day !== 'object') A.day = {};
  const D0 = A.day;
  if (!D0.stock || typeof D0.stock !== 'object') D0.stock = {};
  if (!D0.tasks || typeof D0.tasks !== 'object') D0.tasks = {};
  if (!Number.isFinite(D0.pts)) D0.pts = 0;
  if (!Number.isFinite(D0.total)) D0.total = 0;
  const emit = (t, d) => { try { o.emit && o.emit(t, d); } catch (e) { /* the host's */ } };
  const clock = createDayClock({ save: D0 });
  bind27(D0, () => save());   // ── slice27 ── (A.day.lv27: the per-work gold runs and level) ── /slice27 ──
  const bridge = createBridge({ box: D0, store: o.store, now: o.nowMs, emit: (t, d) => { emit(t, d); if (t === 'dayDinar') { try { banner('🪙 דינר זהב — נוסף לאוצר'); sfxPlay('fanfare'); } catch (e) { /* not yet */ } } }, persist: () => save() });   // ── polish23 ──
  const stock = createStock({ save: D0.stock, emit: (t, d) => { emit(t, d); if (t === 'stockLow') { try { tasks.sync(); } catch (e) { /* not yet built */ } } } });   // (a store that runs low opens its errand at once)
  const tasks = createTasks({ clock, stock, emit: (t, d) => taskEvent(t, d), save: D0.tasks });
  const D = { clock, stock, tasks, WORKS, PLACE: PLACE22, active: false };
  let passMsg = '', passUntil = 0, lastAppt = '', sheetOn = false, warmed = false, T = null, root = null, hudEl = null, E = {}, entered = false, running = null, lastMs = 0, hudT = 0, sayT = 0, lineT = 0, endRun = false, wasHidden = false, curBlock = '', skyKey = '';
  const hp = { x: 0, y: 0, z: 0, yaw: 0 };
  let G27 = null;   // ── guide27 ── ── /guide27 ──
  let C28 = null, c28Fn = null, f24Hold = false;   // ── cam28 ── ── /cam28 ──
  const sfxPlay = (n) => { try { o.sfx && o.sfx.play && o.sfx.play(n); } catch (e) { /* none */ } };
  const gy = (x, z) => { try { const g = S.groundAt(x, z); return Number.isFinite(g) ? g : 16; } catch (e) { return 16; } };
  const heroP = () => { try { S.heroXYZ(hp); } catch (e) { /* no hero */ } return hp; };

  /* ───────── the errands: events, markers, the work at hand ───────── */
  const mk = [];            // the markers (open errands), refilled twice a second
  let mkT = 0;
  const h26 = { closing: false /* ── fix26 ── */, hold: false, held: null, sayQ: null, pulse: null, pulseUntil: 0 };   // ── hero26 ── (the mentor line and the next bubble wait for the epilogue; the marker that pulses) ── /hero26 ──
  function refreshMarks() {
    const L = tasks.open(); mk.length = 0;
    for (const k of L) { const p = placeAt(k.place); mk.push({ job: k.id, icon: k.icon || '★', label: k.practice ? 'לתרגל' /* ── guide27 ── ── /guide27 ── */ : k.game ? ((GAMES[k.game] && GAMES[k.game].he) || 'עבודה') : (memunName(k.from) || k.fromHe || ''), x: p.x, y: gy(p.x, p.z), z: p.z, pulse: k.id === h26.pulse && performance.now() < h26.pulseUntil && !(Math.hypot(p.x - heroP().x, p.z - heroP().z) < 6), lvl: k.work === 'kiyor' ? 0.12 : undefined /* ── fix26 ── (the kiyor's level on its chip: low — that is why it is asked) ── /fix26 ── */ }); }   // ── hero26 ── (pulse) ── /hero26 ──
  }
  function taskEvent(type, d) {
    emit(type, d);
    if (type === 'taskOpen') {
      const k = tasks.get(d.id); if (!k) return;
      if (entered && (!d.forced || d.say) /* ── fix26 ── ── /fix26 ── */ && o.settleOk !== false) { if (running || h26.hold) h26.sayQ = k; else say(k); }   // ── hero26 ── (a bubble during a work waits for its epilogue) ── /hero26 ──
      refreshMarks(); hudT = 0;
    } else if (type === 'taskPassed') {
      refreshMarks(); hudT = 0;
      // (no penalty: the priests finished it — one quiet line, for the day's own errands only, never for the sheets he did not play)
      const k = tasks.get(d.id);
      if (entered && k && !k.game && !endRun) { passMsg = `הכהנים סיימו: ${k.restock ? 'מחסן' : (memunName(k.from) || k.fromHe || 'בקשה')} — ${placeAt(k.place).he}`; passUntil = performance.now() + 3500; }
    }
    else if (type === 'taskDone') { refreshMarks(); hudT = 0; }
    if (G27 && type !== 'taskOpen') { if (type === 'taskDone') G27.onDone(d.id); G27.soon(); }   // ── guide27 ── (never empty) ── /guide27 ──
    save();
  }
  function say(k) {
    if (!E.say) return;
    const who = memunName(k.from) || k.fromHe || 'הממונה';
    E.say.innerHTML = `<b>${esc(who)}</b><span>${esc(k.he)}</span><i>${esc(placeAt(k.place).he)}</i>`;
    E.say.classList.add('on'); clearTimeout(sayT); sayT = setTimeout(() => E.say && E.say.classList.remove('on'), 6500);
    sfxPlay('ui');
  }
  // ── guide27 ── the ממונה at that place calls him (the idle ladder's 8 s): his name, the call, the place — once
  function sayLine(k, text) {
    if (!E.say) return;
    const who = memunName(k.from) || k.fromHe || 'הממונה';
    E.say.innerHTML = `<b>👋 ${esc(who)}</b><span>${esc(text)}</span><i>${esc(placeAt(k.place).he)}</i>`;
    E.say.classList.add('on'); clearTimeout(sayT); sayT = setTimeout(() => E.say && E.say.classList.remove('on'), 5000);
    sfxPlay('ui');
  }
  // ── /guide27 ──
  const near = (k, p, r = 5) => { const q = placeAt(k.place); return Math.hypot(q.x - p.x, q.z - p.z) <= r; };
  /** the right thumb's work here, now (twin.js `work`): the nearest open errand within 5 amot of his feet */
  function workAt(h) {
    if (D.shift) return D.shift.work ? D.shift.work(h) : null;   // ── shift29 ── (the shift's own button: a station, a pilgrim) ── /shift29 ──
    if (!entered || h26.closing) return null;   // ── fix26 ── (a work in its epilogue/return is not over: its errand is still 'open' until finish — no second start) ── /fix26 ──
    let best = null, bd = 1e9;
    const dueT = (k) => (k.restock ? 100 : 0) + (k.practice ? 200 : 0 /* ── guide27 ── (a practice yields at one place) ── /guide27 ── */) + (k.dueH === 18 ? 24 : (((k.dueH - 18) % 24) + 24) % 24);   // (a restock errand yields to the day's own errands at one place)
    for (const k of tasks.open()) { const q = placeAt(k.place), d = Math.hypot(q.x - h.x, q.z - h.z); if (d <= 5 && (d < bd - 0.01 || (d <= bd + 0.01 && best && dueT(k) < dueT(best)))) { bd = d; best = k; } }   // (the nearest; at one place, the soonest due)
    if (!best) return null;
    const q = placeAt(best.place), W = WORKS[best.work];
    return { icon: best.icon || (W && W.icon) || '✋', label: best.game ? 'להתחיל' : (G27 && G27.nameOf ? G27.nameOf(best) : '') || (W && W.he) || 'לעבוד' /* ── cam28 ── (the button's label: this task's name, as the HUD's "כאן:") ── /cam28 ── */, job: best.id, craft: !!(W && (W.model || W.run)), noRing: true, at: { x: q.x, y: gy(q.x, q.z) + 1, z: q.z }, go: () => { startWork(best.id); } };
  }

  /* ───────── a work: the registry's, a sheet game, or the generic three taps ───────── */
  const ui22 = {   // the shim runInWorld wants (coach: the mentor's line; float: the "+N")
    get root() { return root; }, coachText: '',
    coach(anchor, line) { ui22.coachText = line || ''; if (line) mentor(line); },
    float(text, x, y, cls) { floatAt(text, x, y, cls); },
    get busy() { return false; },
  };
  function ctxFor(k) {
    const p = placeAt(k.place), at = { x: p.x, y: gy(p.x, p.z) + 1, z: p.z };
    return {
      id: k.id, task: k, at, hero: () => heroP(), view, camera: rig.camera, scene: rig.scene, root, twin: T, sfx: o.sfx, haptic: (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* */ } },
      clock, stock, tasks, emit, world: S, PLACE: PLACE22, float: (a, text, kind) => { if (T) T.feedback(a || at, text, kind || ''); }, mentor: (text, src) => mentor(text, src),
      // (WORKSA22 / WORKSB22 asked) the 3D service layer, the ground, a free-floor test, a projector, the DOM host for tap targets, a one-line say
      closeup: (at2, o2) => f24Closeup(at2, o2), release: () => f24Release(),   // ── figures24 ── ── /figures24 ──
      THREE: rig.THREE || null, av: S && S.avodah || null, ground: gy, free, project: (x, y, z) => view.project(x, y, z), layer: root, say: (text, o2) => mentor(text, o2 && o2.src), water: (rig.water) || null,
    };
  }
  function genericRun(ctx) {
    return new Promise((res) => {
      let n = 1; const N = 3; ctx.mentor(''); ctx.float(ctx.at, '+4', '');   // (the tap that starts it is its first)
      const off = T.onWork((ev) => {
        if (ev.t !== 'tap' && ev.t !== 'up') return true;
        n++; ctx.float(ctx.at, `+${4}`, n === N ? 'good' : ''); sfxPlay(n === N ? 'good' : 'tap');
        if (n >= N) { off(); res({ ok: true, quality: 1, perfect: false, score: 12 }); }
        return true;
      });
    });
  }
  async function startWork(id) {
    const k = tasks.get(id);
    if (!k || k.state !== 'open' || running || h26.closing) return false;   // ── fix26 ── ── /fix26 ──
    if (k.game) {   // the morning / evening sheets, played as today
      if (o.busy && o.busy()) return false;
      running = { id, game: true };
      emit('dayWork', { id, game: k.game });
      try { await o.runGame(k.game); } catch (e) { console.warn('[day] game', e && e.message); }
      running = null; return true;
    }
    let W = WORKS[k.work]; const ctx = ctxFor(k);
    if (W && typeof W.create === 'function' && !W.__made) { try { const made = W.create(ctx); if (made) { made.__made = true; WORKS[k.work] = W = Object.assign(made, { id: W.id }); } } catch (e) { console.warn('[day] create', e && e.message); } }
    running = { id, W, zoom: false, at: ctx.at };
    emit('dayWork', { id, work: k.work || 'generic' });
    let r = null;
    try {
      // ── polish23 ── the camera comes closer first (0.62 of its distance, twin.js cbCam via camWork), then the work's props are placed — so the stage fits the frame
      // as the closer camera sees it (kit.place measures through the camera): a short glide in, ~0.6 s, never a cut
      if (W && (W.model || W.run) && !o.fast && globalThis.__P23_ZOOM !== 0) { running.zoom = true;   // (__P23_ZOOM = 0: a test hook, the work without the closer camera)
        await new Promise((res) => setTimeout(res, 800)); if (!running || running.id !== id) return false; }
      // ── /polish23 ──
      const tBegin = performance.now();
      if (W && W.begin) { const b = W.begin(ctx); if (b && b.ok !== false) h26Begin(S, k.work);   // ── hero26 ── (the hero mesh steps out: the stage's acting kohen is he) ── /hero26 ──
         if (running && running.zoom && b && b.ok !== false) setTimeout(() => { try { if (running && running.id === id) { const kt = getKit(); if (kt && kt.refit && kt.placedAt >= tBegin) { kt.refit(); globalThis.__P23_REFIT = (globalThis.__P23_REFIT | 0) + 1; } else globalThis.__P23_REFIT_SKIP = [!!kt, kt && kt.placedAt, tBegin]; } else globalThis.__P23_REFIT_SKIP = ['gone']; } catch (e) { console.warn('[day] refit', e && e.message); } }, 1100);   // ── polish23 ──
         if (b && b.ok === false) { running = null; return false; } if (b && b.at) { ctx.at = b.at; if (running) running.at = b.at; } }
      try { view.workRes && view.workRes(true); } catch (e) { /* */ }   // ── figures24 ── (the works' render scale: pixel ratio up to 2 while the work is on) ── /figures24 ──
      if (W && typeof W.run === 'function') { globalThis.__S27RUN = { id, work: k.work, M: null }; r = await W.run(ctx); }   // ── slice27 ── ── /slice27 ──
      else if (W && typeof W.model === 'function') {
        const M = W.model(ctx); if (running) running.M = M;   // ── hero26 ── ── /hero26 ──
        globalThis.__S27RUN = { id, work: k.work, M };   // ── slice27 ── (tests: the model at work) ── /slice27 ──
        r = await runInWorld(M, { kind: W.id || k.work, site: k.place, world: S, view, ui: ui22, heroPos: () => heroP(), canvas: doc.getElementById('c') || undefined, root, sfx: o.sfx, haptic: ctx.haptic, input: 'twin', twin: T, job: k.id,
          hooks: { begin: () => ({ ok: true, at: ctx.at }), update: (m) => { try { W.update && W.update(m, ctx); } catch (e) { /* the work's */ } }, end: (res) => { try { W.end && W.end(res, ctx); } catch (e) { /* */ } }, box: () => (W.box ? W.box() : null), touch: (down, m) => { try { return W.touch ? W.touch(down, m, ctx) : undefined; } catch (e) { /* */ } } } });
      } else r = await genericRun(ctx);
    } catch (e) { console.warn('[day] work', k.work, e && e.message); r = null; }
    // ── hero26 ── the epilogue: the stage stays (the camera on it) while the figures complete; then the camera glides back, the hero mesh
    // is back AT the actor's last spot facing the next errand (one step), and only then the points, the mentor line and the next bubble
    if (r && typeof r === 'object' && k.practice) r.practice = true;   // ── guide27 ── (the result carries the practice flag: SLICE27's level counter) ── /guide27 ──
    const ok26 = !!(r && r.ok !== false && !r.skipped), on26 = !!(W && H26.on);
    globalThis.__H26T = { id: k.id, work: k.work, end: Math.round(performance.now()), ok: ok26 };
    if (ok26) { h26.hold = true; try { if (on26 || W) await (W && typeof W.after === 'function' ? W.after(ctx, r) : h26Sleep(o.fast ? 50 : h26Ms(k.work, W))); } catch (e) { /* */ } }
    // ── /hero26 ──
    running = null; if (ok26) h26.closing = true;   // ── fix26 ── (until finish: the errand is still 'open' — a tap on the still-awake button started it AGAIN, a phantom run that blocked the next one) ── /fix26 ──
    f24Release(); try { view.workRes && view.workRes(false); } catch (e) { /* */ }   // ── figures24 ── ── /figures24 ──
    // ── hero26 ──
    if (on26) { if (ok26) { const nx = g27Next(), q = nx && nx.k && nx.k.id !== k.id ? placeAt(nx.k.place) : null; globalThis.__H26BACK = h26Back(S, { hp: heroP(), free, to: q ? { x: q.x, z: q.z } : null }); globalThis.__H26T.back = Math.round(performance.now()); } else h26Abort(S); }
    if (ok26) { await h26Sleep(o.fast ? 30 : Math.max(700, ((globalThis.__H26BACK && on26 && globalThis.__H26BACK.slideMs) || 0) + 250)); h26.hold = false; if (h26.held) { const [t, s2] = h26.held; h26.held = null; mentor(t, s2); } }
    // ── /hero26 ──
    if (ok26) { try { finish(k, r, ctx); } finally { h26.closing = false; } globalThis.__H26T.fin = Math.round(performance.now()); }   // ── fix26 ── ── /fix26 ──
    h26After(k, ok26);   // ── hero26 ── ── /hero26 ──
    return true;
  }
  // ── hero26 ── after a work: the held mentor line, the held bubble — and never "standing in shock": no marker within 6 amot of him → the next
  // task's marker pulses, he turns toward it, and its ממונה says his line
  function h26After(k, ok) {
    h26.hold = false;
    if (h26.held) { const [t, s2] = h26.held; h26.held = null; mentor(t, s2); }
    let spoke = false;
    if (h26.sayQ) { const q = h26.sayQ; h26.sayQ = null; if (q.state === 'open') { say(q); spoke = true; } }
    if (!ok || !entered) return;
    refreshMarks(); const h = heroP();
    if (mk.some((m) => Math.hypot(m.x - h.x, m.z - h.z) <= 6)) return;
    const nx = g27Next(); if (!nx || !nx.k) return;
    const p = placeAt(nx.k.place);
    h26.pulse = nx.k.id; h26.pulseUntil = performance.now() + 9000; refreshMarks();
    try { S.hero.setPos(h.x, h.z, Math.atan2(p.x - h.x, p.z - h.z)); } catch (e) { /* */ }
    if (!spoke) setTimeout(() => { if (entered && nx.k.state === 'open' && !running) say(nx.k); }, 900);
    globalThis.__H26SHOCK = { job: nx.k.id, t: Math.round(performance.now()) };
  }
  // ── /hero26 ──
  // ── guide27 ── the next errand everywhere is the guide's primary (the next step by the clock), else the nearest due
  function g27Next() { try { const k = G27 && (G27.primary() || G27.meanwhile(null)); if (k) return { k }; } catch (e) { /* */ } return tasks.nextDue(); }
  // ── /guide27 ──
  function finish(k, r, ctx) {
    const q = Number.isFinite(r.quality) ? r.quality : 1, pts = tasks.done(k.id, q);
    if (pts > 0) { D0.pts += pts; D0.total += pts; try { o.addPoints && o.addPoints(pts); } catch (e) { /* */ } if (T) T.feedback({ ...heroP(), y: heroP().y + 1 }, `+${pts}`, 'gold'); toScore(pts, 'd' + clock.now().n + ':' + k.id, k.id); }   // ── polish23 ── (+ the master score)
    sfxPlay('good');
    // the source line comes AFTER the work, never before (FUN19)
    if (!(ctx && ctx.mentored)) mentor(`${k.he}`, `${k.src || ''} · טיוטה`);   // (a work that shows its own source sets ctx.mentored)
    // ── slice27 ── the stamp with a name, after the source line (the end was seen in the epilogue); the gold run counted toward level 2
    try { const m27 = globalThis.__S27RUN && globalThis.__S27RUN.id === k.id ? globalThis.__S27RUN.M : null; if (m27 && m27.stamp && r && typeof r === 'object') r.guessed = true;   // (the lots: a right guess — the model's, the world run's result does not carry it)
      const info = record27(k.work, r); if (info) { const st = stamp27(root, k.work, info, r); if (st && T) sfxPlay(info.up ? 'fanfare' : 'chime'); globalThis.__S27LAST = { id: k.id, work: k.work, q: r.quality, info, line: E.line ? E.line.textContent : '', lineOn: !!(E.line && E.line.classList.contains('on')), t: Math.round(performance.now()) }; } } catch (e) { console.warn('[slice27] stamp', e && e.message); }
    // ── /slice27 ──
    save();
  }

  // ── places24 ── the camera a work on a real place asks for (kit.F.view, set by the anchored draw each frame), while that work runs
  function camView() { try { const kt = getKit(); return kt && kt.F && kt.F.on && kt.F.anchor && kt.F.view ? kt.F.view : null; } catch (e) { return null; } }
  // ── /places24 ──
  /* ───────── the follow camera clear of the walls (the same search as Phase A's stages21 s21CamClear, on stages.frameBlocked) ───────── */
  const cs = { t: 0, az: null, el: NaN, prev: NaN, prevE: NaN };
  function camClear(d, el, az0) {
    const tn = performance.now(); if (tn - cs.t < 400) return cs.az; cs.t = tn; cs.az = null; cs.el = NaN;
    if (!S || typeof S.frameBlocked !== 'function' || !Number.isFinite(d)) return null;
    const h0 = heroP(), y1 = h0.y + 1.6, y2 = h0.y + 3.4;
    // ── polish23 ── (during a work the camera looks half-way to the stage — twin.js camWork's gaze —: the wall search is made from that point)
    const w = running && running.zoom && !running.game && running.at && Number.isFinite(running.at.x) && Math.hypot(running.at.x - h0.x, running.at.z - h0.z) < 14 ? running.at : null;
    const h = w ? { x: h0.x + (w.x - h0.x) * 0.5, y: h0.y, z: h0.z + (w.z - h0.z) * 0.5 } : h0;
    // ── /polish23 ──
    const at = (az, e) => { const ce = Math.cos(e), se = Math.sin(e); return [h.x + ce * Math.cos(az) * d, y1 + se * d, h.z + ce * Math.sin(az) * d]; };
    const blk1 = (az, e) => { const q = at(az, e); return S.frameBlocked(q[0], q[1], q[2], h.x, y1, h.z, 'x') || (w && S.frameBlocked(q[0], q[1], q[2], h0.x, y1, h0.z, 'x')); };   // ── polish23 ── (|| the line to him: he is seen as well as the stage)
    const blk = (az, e) => { const q = at(az, e); return blk1(az, e) || S.frameBlocked(q[0], q[1], q[2], h.x, y2, h.z, 'x'); };
    if (!blk(az0, el)) { cs.prev = NaN; cs.prevE = NaN; return null; }
    if (Number.isFinite(cs.prev) && !blk1(cs.prev, cs.prevE)) { if (cs.prevE !== el) cs.el = cs.prevE; return (cs.az = cs.prev); }
    for (const de of [0, 0.3, 0.5]) { const e = Math.min(1.45, el + de); for (const off of [0.5, -0.5, 1.0, -1.0, 1.6, -1.6, 2.2, -2.2, Math.PI]) { if (!blk1(az0 + off, e)) { cs.prev = az0 + off; cs.prevE = e; if (e !== el) cs.el = e; return (cs.az = cs.prev); } } }
    return null;
  }

  /* ───────── the two thumbs (twin.js with Phase B's source) ───────── */
  function makeTwin() {
    root = doc.createElement('div'); root.className = 'gm dy-gm'; doc.body.appendChild(root);
    h26Css(doc);   // ── hero26 ── ── /hero26 ──
    if (!doc.getElementById('dy-css')) { const s = doc.createElement('style'); s.id = 'dy-css'; s.textContent = CSS; doc.head.appendChild(s); }
    root.innerHTML = `<div class="dy-hud" role="button" tabindex="0" aria-label="בקשות הממונים" data-dy="list"><div class="dy-h1"></div><div class="dy-h2"></div><div class="dy-h3"></div><div class="dy-bar" aria-hidden="true"><b></b></div></div>
      <div class="dy-coin" aria-label="דינר זהב"><i class="dy-cc" aria-hidden="true"></i><b class="dy-cn"></b><u class="dy-cb-w"><s class="dy-cb"></s></u><em class="dy-cp"></em></div>
      <div class="dy-say" role="status"></div><div class="dy-line" role="status"></div><div class="dy-banner" role="status"></div>
      <section class="dy-list" role="dialog" aria-label="משימות היום"><div class="dy-lh"><b>בקשות הממונים</b><button data-dy="close" aria-label="סגירה">✕</button></div><div class="dy-lb"></div></section>
      <div class="dy-fade"></div><div class="dy-end"></div>`;
    E = { hud: root.querySelector('.dy-hud'), h1: root.querySelector('.dy-h1'), h2: root.querySelector('.dy-h2'), h3: root.querySelector('.dy-h3'), bar: root.querySelector('.dy-bar b'), say: root.querySelector('.dy-say'), line: root.querySelector('.dy-line'), banner: root.querySelector('.dy-banner'), list: root.querySelector('.dy-list'), lb: root.querySelector('.dy-lb'), fade: root.querySelector('.dy-fade'), end: root.querySelector('.dy-end'), coin: root.querySelector('.dy-coin'), cn: root.querySelector('.dy-cn'), cb: root.querySelector('.dy-cb'), cp: root.querySelector('.dy-cp') };
    root.addEventListener('click', (e) => {
      const b = e.target.closest && e.target.closest('[data-dy]'); if (!b) return;
      const a = b.dataset.dy;
      if (a === 'list') { renderList(); E.list.classList.toggle('on'); E.say.classList.remove('on'); }
      else if (a === 'close') E.list.classList.remove('on');
      else if (a === 'go') { E.list.classList.remove('on'); teleport(placeAt(tasks.get(b.dataset.id).place)); }
    });
    T = createTwin({
      view, stages: S, root, emit: (t, d) => emit(t, d), sfx: o.sfx, haptic: (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* */ } }, settings: () => ({ cam: 'follow', rhythm: false }),
      live: () => entered && !!D.active,
      lift: true,   // ── cam28 ── ("lift me up" on the right half: the day's) ── /cam28 ──
      stage: () => 'azara',
      moment: () => !!(!entered || (o.busy && o.busy()) || (o.homeOpen && o.homeOpen()) || endRun || E.list.classList.contains('on')),
      film: () => false,
      work: (h) => workAt(h),
      marks: () => (D.shift ? D.shift.marks() : mk),   // ── shift29 ── ── /shift29 ──
      goal: () => (D.shift ? null : G27 ? G27.goal() : null),   // ── shift29 ── ── /shift29 ──   // ── guide27 ── (the primary's marker; a tap walks him there) ── /guide27 ──
      goTo: () => (G27 ? G27.goTo() : { ok: false }),
      camCut: () => { if (C28) C28.snap(); },   // ── cam28 ── ── /cam28 ──
      clear: (p, q) => !(C28 && C28.seg(q[0], q[1], q[2], p[0], p[1], p[2])),   // ── cam28 ── (the start frame's bearing) ── /cam28 ──
      occl: (x, y, z) => !!(C28 && C28.occluded(x, y, z, `${Math.round(x)},${Math.round(z)}`)),   // ── cam28 ── (a marker chip behind a wall) ── /cam28 ──
      camWork: () => (running && running.zoom && !running.game ? { x: (running.at || {}).x, z: (running.at || {}).z, k: f26El(running) ? 0.9 : ZOOM_K, share: f26El(running) ? 0.9 : undefined /* ── fix26 ── (the whole circle in the frame, the gaze on it) ── /fix26 ── */, view: camView() } : null),   // ── polish23 ── (── places24 ── view: the real place's camera)
      camEl: () => (Number.isFinite(cs.el) && globalThis.__CAM28_SIDE !== 0 ? cs.el : (running && running.zoom && !running.game ? (Number.isFinite(globalThis.__P23_EL) ? globalThis.__P23_EL : f26El(running) || WORK_EL) : null)),   // ── fix26 ── (f26El) ── /fix26 ──   // ── polish23 ── (a flatter camera during a work: the stage's depth takes less of the frame, so its width can fill it)
 camSide: (d, el, az) => globalThis.__CAM28_SIDE === 0 ? null : camClear(d, running && running.zoom && !running.game ? (Number.isFinite(globalThis.__P23_EL) ? globalThis.__P23_EL : WORK_EL) : el, az),   // ── polish23 ── (the wall search at the work's own elevation) why: () => '',   // (the follow camera never looks through a built wall at him)
    });
    T.onWork(() => false);
    // ── cam28 ── the guard on every rendered frame (main.js view.guard): the look point is his head; under a work's closer camera and FIGURES24's close-up the
    // close-up's own target; off while a sheet, a card or a place's authored view (places24: inside the Heichal's door) holds the camera
    C28 = createCamGuard({ S, gy, heroP, view, look: () => (!T || !T.cam || sheetOn || !entered ? 'off' : (T.viewK && T.viewK() > 0.001) ? 'off' : (f24Hold || (running && running.zoom && !running.game)) ? 'target' : 'hero') });   // (a work's camera looks at its stage: the line to the stage is the one kept — the lots under the Gazit's roof light)
    c28Fn = (dt) => { try { C28.step(dt); } catch (e) { /* the world's */ } };
    // ── /cam28 ──
    // ── guide27 ──
    G27 = createGuide({ S, view, scene: rig.scene, root: () => root, tasks, clock, placeAt, gy, heroP, WORKS, GAMES, memunName, teleport, sfx: o.sfx,
      emit: (t, d) => (t === 'taskOpen' ? taskEvent(t, d) : emit(t, d)),
      say: (k, text) => sayLine(k, text), pulse: (id, ms) => { h26.pulse = id; h26.pulseUntil = performance.now() + (ms || 6000); refreshMarks(); },
      busy: () => !!(running || h26.hold || h26.closing || endRun || (o.busy && o.busy()) || (o.homeOpen && o.homeOpen()) || (E.list && E.list.classList.contains('on'))),
      twin: () => T });
    // ── /guide27 ──
    globalThis.__DAY = Object.assign(globalThis.__DAY || {}, { clock, tasks, stock, WORKS, startWork, teleport, ctxFor: (id) => ctxFor(tasks.get(id)), twin: T, hud: () => ({ h1: E.h1.textContent, h2: E.h2.textContent, h3: E.h3 ? E.h3.textContent : '' }), D, cam28: C28 /* ── cam28 ── */, g27: G27 /* ── guide27 ── ── /guide27 ── */ });
  }
  function teleport(p) {
    if (!p) return;
    const h = heroP(), pl = typeof p === 'string' ? placeAt(p) : p;
    // ── cam28 ── (the Ulam's door: 2.6 amot west of its place lay in the 0.3-amah slot between the steps and the Ulam, on the floor 6 amot
    // under the top step — a pit no camera sees into) the spot beside the place is a free floor at the place's own level, else another side
    let nx = pl.x - 2.6, nz = pl.z + 0.6;
    { const g0 = gy(pl.x, pl.z); for (const [dx, dz] of [[-2.6, 0.6], [2.6, 0.6], [0.6, 2.6], [0.6, -2.6], [-1.6, 0.6], [1.6, 0.6]]) { const x = pl.x + dx, z = pl.z + dz; if (free(x, z) && Math.abs(gy(x, z) - g0) < 1.5) { nx = x; nz = z; break; } } }
    // ── /cam28 ──
    if (E.fade) { E.fade.classList.add('on'); }
    setTimeout(() => {
      try {
        const c = view.camNow({}); const dx = nx - h.x, dz = nz - h.z;
        S.hero.setPos(nx, nz, Math.atan2(pl.x - nx, pl.z - nz));
        if (view.camSet) view.camSet(c.px + dx, c.py + (gy(nx, nz) - h.y), c.pz + dz, c.tx + dx, c.ty + (gy(nx, nz) - h.y), c.tz + dz);
        if (T && T.intro) T.intro('teleport'); if (C28) C28.snap();   // ── cam28 ── (after every fade: him from behind, then the follow camera) ── /cam28 ──
      } catch (e) { /* the world's */ }
      if (E.fade) setTimeout(() => E.fade.classList.remove('on'), 120);
    }, 260);
    sfxPlay('whoosh');
  }

  // ── polish23 ── the day's points → Phase A's score (once per task per day), the coin in the HUD
  let scoreDay = 0;   // the master-score points this day paid (the end card's line)
  function toScore(pts, once, why) {
    let r = null; try { r = bridge.add(pts * SCALE, 'day', once); } catch (e) { console.warn('[day] bridge', e && e.message); }
    if (r && r.n > 0) { scoreDay += r.n; coinPulse(r.n); }
    renderCoin(); return r;
  }
  function renderCoin() {
    if (!E.coin) return;
    let g = null; try { g = bridge.get(); } catch (e) { g = null; } if (!g) return;
    const t = `${fmt(g.total)}`, w = `${(g.frac * 100).toFixed(1)}%`;
    if (E.cn.textContent !== t) E.cn.textContent = t;
    if (E.cb.style.width !== w) E.cb.style.width = w;
    E.coin.title = `דינר זהב — ${fmt(g.left)} נקודות לדינר הבא`;
  }
  function coinPulse(n) { if (!E.coin) return; E.coin.classList.remove('pl'); void E.coin.offsetWidth; E.coin.classList.add('pl'); E.cp.textContent = `+${fmt(n)}`; }
  // ── /polish23 ──
  /* ───────── the HUD ───────── */
  function mentor(text, src) {
    if (!E.line) return;
    if (text && (h26.hold || (running && running.W && !running.game && (src || /טיוטה/.test(text) || (running.M && running.M.phase !== 'work'))))) { h26.held = [text, src]; return; }   // ── hero26 ── (the source line waits for the epilogue) ── /hero26 ──
    if (!text) { E.line.classList.remove('on'); return; }
    E.line.innerHTML = `<span>${esc(text)}</span>${src ? `<small>${esc(src)}</small>` : ''}`;
    E.line.classList.add('on'); clearTimeout(lineT); lineT = setTimeout(() => E.line && E.line.classList.remove('on'), globalThis.__S27_STAMP_HOLD ? 40000 : 7000);   // ── slice27 ── (tests: the line stays while a slow shot is taken) ── /slice27 ──
  }
  function floatAt(text, x, y, cls) {
    if (!root) return; const f = doc.createElement('div'); f.className = 'dy-fl ' + (cls || ''); f.textContent = text; f.style.left = `${Math.round(x)}px`; f.style.top = `${Math.round(y)}px`; root.appendChild(f); setTimeout(() => f.remove(), 1200);
  }
  function banner(text) { if (!E.banner) return; E.banner.textContent = text; E.banner.classList.remove('on'); void E.banner.offsetWidth; E.banner.classList.add('on'); setTimeout(() => E.banner && E.banner.classList.remove('on'), 3200); }
  function renderHud() {
    const n = clock.now(), nx = n.toNext, low = stock.lowHe();
    const h1 = `השעה: ${n.label} · ${n.period}` + (nx ? ` · בעוד ${hoursHe(nx.minGame)} (${nx.minReal} דק׳) — ${nx.he}` : '');
    if (E.h1.textContent !== h1) E.h1.textContent = h1;
    const c = tasks.counts();
    // ── guide27 ── the line under the hour: "עכשיו: לך ל<place> — <task>" when one task is primary; the second: "בינתיים: ___" (+ what the stores lack)
    const g = G27 ? G27.hud() : null, lowT = low.length ? ` · חסר: ${low.slice(0, 3).join(', ')}` : '';
    const pass = performance.now() < passUntil;
    const h2 = g && g.h2 ? g.h2 : pass ? passMsg : `${c.open ? `${c.open} בקשות פתוחות` : 'אין בקשות כרגע'}${lowT} · יום ${n.n}`;
    if (E.h2.textContent !== h2) E.h2.textContent = h2;
    E.h2.classList.toggle('g27-now', !!(g && g.primary && h2 === g.h2));
    const h3 = g && g.h2 ? (pass ? passMsg : `${g.h3 || ''}${lowT}`.replace(/^ · /, '')) : '';   // (the quiet "הכהנים סיימו" line takes the second line: the primary stays)
    if (E.h3 && E.h3.textContent !== h3) E.h3.textContent = h3;
    // ── /guide27 ──
    renderCoin();   // ── polish23 ──
    { const pc = `${(Math.min(24, n.t) / 24 * 100).toFixed(1)}%`; if (E.bar.style.right !== pc) E.bar.style.right = pc; }   // (the day's whole width, right to left like the text: night · dawn · day · evening · close)
  }
  function renderList() {
    const rows = tasks.open().sort((a, b) => a.dueH - b.dueH).map((k) => `<div class="dy-row"><span class="dy-ic">${esc(k.icon || '★')}</span><div><b>${esc(memunName(k.from) || k.fromHe || 'הממונה')}</b><p>${esc(k.he)}</p><small>${esc(placeAt(k.place).he)} · עד ${esc(clockLabel(k.dueH))}</small></div><button data-dy="go" data-id="${esc(k.id)}">לשם</button></div>`).join('');
    E.lb.innerHTML = rows || '<p class="dy-none">אין בקשות פתוחות. הממונים יבואו.</p>';
  }
  const clockLabel = labelHe;

  /* ───────── the day's end → the chain ───────── */
  async function dayEnd() {
    if (endRun) return; endRun = true;
    const c = tasks.counts(), pts = D0.pts, n = clock.now().n;
    if (c.done > 0) toScore(BONUS_DAY / SCALE, 'd' + n + ':end');   // ── polish23 ── (the day completed: one fixed bonus, once)
    const sc = scoreDay, gg = bridge.get();
    emit('dayEnd', { n, pts, tasks: c.done, passed: c.passed });
    let tm = []; try { tm = (o.tomorrow && o.tomorrow()) || []; } catch (e) { tm = []; }
    let rk = ''; try { rk = (o.rankLine && o.rankLine()) || ''; } catch (e) { rk = ''; }
    sfxPlay('fanfare');
    E.end.innerHTML = `<div class="dy-stamp"><i></i><b>נעילת שערים</b></div>`; E.end.classList.add('on');
    await new Promise((r) => setTimeout(r, o.fast ? 80 : 1500));
    E.end.innerHTML = `<div class="dy-card" role="dialog"><h2>יום ${n} במקדש הסתיים</h2>
      <p class="dy-big">+${pts} זכויות</p>
      <p class="dy-coinrow"><i class="dy-cc" aria-hidden="true"></i> הנקודות נכנסות לדינר: <b>+${fmt(sc)}</b> · ${fmt(gg.total)} (עוד ${fmt(gg.left)} לדינר הבא)</p><div class="dy-ceb"><s style="width:${(gg.frac * 100).toFixed(1)}%"></s></div>
      <p>${c.done === 1 ? 'בקשה אחת הושלמה' : `${c.done} בקשות הושלמו`}${c.passed ? ` · ${c.passed} — "הכהנים סיימו" (בלי עונש)` : ''}</p>
      <p>${stock.low().length ? `מחר יחסר: ${esc(stock.lowHe().slice(0, 3).join(', '))}` : 'המחסנים מלאים למחר'}</p>
      ${rk ? `<p>${esc(rk)}</p>` : ''}
      ${tm.filter(Boolean).length ? `<p class="dy-tm">מחר: ${esc(tm.filter(Boolean).join(' · '))}</p>` : ''}
      <small>טיוטה — התוכן להמחשה</small><button class="dy-go" data-dyend="1">ללילה הבא</button></div>`;
    await new Promise((res) => { const b = E.end.querySelector('[data-dyend]'); const f = () => res(); b.addEventListener('click', f, { once: true }); if (o.fast) setTimeout(f, 60); });
    E.end.classList.remove('on'); E.end.innerHTML = '';
    // the clock resets to the night of the next day; the stores are topped up to a working minimum (the Temple's reserve)
    D0.pts = 0; scoreDay = 0; clock.nextDay(); tasks.newDay();
    for (const k of stock.KINDS) { const want = { wood: 10, oil: 6, wine: 6, flour: 6, salt: 4, lambs: 6, doves: 6, ketoret: 3 }[k]; if (stock.get(k) < want) stock.add(k, want - stock.get(k)); }
    endRun = false; curBlock = ''; save(); banner(BLOCK_HE.night);
    if (T && T.intro) T.intro('day'); if (C28) C28.snap();   // ── cam28 ── (a new day's first frame) ── /cam28 ──
  }

  /* ───────── the lifecycle ───────── */
  function save() { try { o.persist && o.persist(); } catch (e) { /* */ } }
  clock.on((type, d) => {
    if (type === 'quarter') {
      stock.drain(0.25, clock.now().block); tasks.sync(); emit('dayTick', clock.now()); save();
      // an appointment of the Temple's day arrives (the Tamid, the incense, the gates): one line, once
      if (entered && !endRun) for (const a of APPOINTMENTS) { const df = Math.abs(d.h - a.h), cd = Math.min(df, 24 - df), key = a.id + clock.now().n; if (a.id !== 'neilah' && cd < 0.13 && lastAppt !== key) { lastAppt = key; banner(`עכשיו: ${a.he}`); sfxPlay('chime'); break; } }
    }
    else if (type === 'block') { emit('blockStart', { block: d.block }); if (entered) banner(BLOCK_HE[d.block] || ''); tasks.sync(); }
    else if (type === 'end') { tasks.sync(); if (entered) dayEnd(); }
  });
  D.enter = function enter() {
    if (!doc || !S || !view || !isLand() || noTwin()) return false;
    if (!root) makeTwin();
    if (!torch && rig.scene) { try { torch = new PointLight('#FFB066', 0, 30, 2); torch.name = 'p23-torch'; rig.scene.add(torch); reg28('heroTorch', torch); torch.color.set(L28T.col); /* ── light28 ── (a softer warm: stone reads as stone, not orange) ── /light28 ── */ } catch (e) { torch = null; } }   // ── polish23 ──
    root.style.display = '';
    doc.body.classList.add('dy-on');
    entered = true; D.active = true;
    try { const h = heroP(); if (!(Math.abs(h.x) + Math.abs(h.z) > 0.1) || !h.vis) S.hero.setPos(START_SPOT.x, START_SPOT.z, START_SPOT.yaw); S.hero.show(true); if (S.hero.twinSite) S.hero.twinSite('azara'); if (S.hero.twinExtra) S.hero.twinExtra(blocked); } catch (e) { console.warn('[day] hero', e && e.message); }
    if (!warmed) { warmed = true; for (const f of warmers) { try { f(ctxFor({ place: 'court', id: 'warm', src: '' })); } catch (e) { console.warn('[day] warm', e && e.message); } } }   // (the works' shared lights and props, once, before play: a light made mid-play recompiles every material)
    if (G27) G27.enter();   // ── guide27 ── ── /guide27 ──
    if (C28) { C28.on(true); view.guard = c28Fn; if (T && T.intro) T.intro('enter'); }   // ── cam28 ── (the first frame: him from behind) ── /cam28 ──
    tasks.sync(); refreshMarks(); renderHud(); applySky(true);
    clock.resume(); lastMs = 0;
    const away = D0.left && Date.now() - D0.left > 45000; delete D0.left;
    if (clock.ended) dayEnd(); else { banner(away ? 'המקדש חיכה לך — השעון עצר' : (BLOCK_HE[clock.now().block] || '')); const f = tasks.nextDue(); if (f) setTimeout(() => { if (entered && f.k.state === 'open') say(f.k); }, 1500); }   // (the first request speaks as he arrives)
    emit('dayEnter', clock.now());
    return true;
  };
  D.exit = function exit() {
    if (!entered) return;
    if (G27) G27.exit();   // ── guide27 ── ── /guide27 ──
    if (C28) { C28.on(false); if (view.guard === c28Fn) view.guard = null; }   // ── cam28 ── ── /cam28 ──
    entered = false; D.active = false; clock.pause(); D0.left = Date.now(); if (torch) torch.intensity = 0;   // ── polish23 ──
    if (root) root.style.display = 'none';
    doc.body.classList.remove('dy-on');
    try { S.hero.drive(0, 0); S.hero.show(false); S.hero.twinExtra && S.hero.twinExtra(null); } catch (e) { /* */ }
    if (T) { try { T.update(performance.now()); } catch (e) { /* */ } }
    save();
  };
  D.destroy = function destroy() { D.exit(); if (T) { try { T.destroy(); } catch (e) { /* */ } } if (root) root.remove(); root = null; T = null; if (globalThis.__DAY && globalThis.__DAY.D === D) delete globalThis.__DAY; };
  // ── light28 ── text that never hides; the blessing in full; the תפוח's name
  // (a) the DOM lines at the zone's top, one under the other: the work's say line, the verse … the ממונה's bubble; the work's count at the zone's top
  // (b) ברכת כהנים: at each verse (M.verse, one per tap) the verse IN FULL as a siddur prints it (birkat28.js), large, over the kohanim's raised hands
  //     (M.l28at), in the zone; the crowd's "אמן" (the crowd's murmur) a moment after it
  // (c) the תפוח: walking on the altar's top near the ash heap (no work on), its name over it, in the zone
  let vEl = null, vN = 0, vSz = null, tapEl = null, tapSz = null;
  const TAP28 = (ANCHORS28.altar && ANCHORS28.altar.pts && ANCHORS28.altar.pts.tapuach) || null;
  function l28Frame() {
    if (!root || !E.say) return;
    const lay = root.querySelector('.wb-layer'), ws = lay && lay.querySelector('.wb-say'), cnt = lay && lay.querySelector('.wb-count');
    pinTops([ws, E.say]);
    // (the source line at the foot rises over a work's bar of buttons instead of lying under it — shot 3's "סובבו את הגלגל" over the mentor's words)
    if (E.line) { const bar = lay && lay.querySelector('.wb-bar'), br = bar && bar.children.length ? bar.getBoundingClientRect() : null, want = br && br.height > 2 ? Math.round((innerHeight || 390) - br.top + 6) + 'px' : ''; if (E.line.style.bottom !== want) E.line.style.bottom = want; }
    if (cnt) { const z = zone28(), want = z.top + 'px'; if (cnt.style.top !== want) cnt.style.top = want; const r = cnt.getBoundingClientRect(); if (r.width > 2) hold28({ x0: r.left, y0: r.top, x1: r.right, y1: r.bottom }, 'count'); }
    // (b) the verse
    const M = running && running.M, n = M && M.kind === 'birkat' && M.verse > 0 ? Math.min(3, M.verse) : 0;
    if (!vEl) { vEl = doc.createElement('div'); vEl.className = 'l28-verse'; vEl.setAttribute('role', 'status'); vEl.innerHTML = '<span class="l28-vt"></span><small></small>'; root.appendChild(vEl); }
    if (n !== vN) {
      vN = n; vEl.dataset.n = String(n); vEl.classList.toggle('on', n > 0); vSz = null;
      if (n) {
        vEl.firstChild.textContent = BIRKAT_VERSES[n - 1]; vEl.lastChild.textContent = (n === 3 ? 'ברכה אחת — הידיים על גבי הראש · ' : '') + BIRKAT_SRC + (n === 1 ? ' — פסוק ראשון' : n === 2 ? ' — פסוק שני' : ' — פסוק שלישי');
        setTimeout(() => { globalThis.__L28AMEN = (globalThis.__L28AMEN | 0) + 1; sfxPlay('crowd'); }, 1300);   // (the people's "אמן")
      }
    }
    if (n) {
      if (!vSz) vSz = { w: vEl.offsetWidth || 400, h: vEl.offsetHeight || 60 };
      const p = M.l28at ? view.project(M.l28at[0], M.l28at[1], M.l28at[2]) : null;
      const x = p && p.on ? p.x : (innerWidth || 844) / 2, y = p && p.on ? p.y - vSz.h / 2 - 6 : 0;
      const q = claim28(x, y, vSz.w, vSz.h, 'verse');
      vEl.style.transform = `translate(${(q.x - vSz.w / 2).toFixed(0)}px,${(q.y - vSz.h / 2).toFixed(0)}px)`;
    }
    // (c) the תפוח
    if (!tapEl) { tapEl = doc.createElement('div'); tapEl.className = 'l28-tap'; tapEl.textContent = 'התפוח'; root.appendChild(tapEl); }
    let tOn = false;
    if (TAP28 && !running) {
      const h = heroP(); const d = Math.hypot(h.x - TAP28[0], h.z - TAP28[2]);
      if (d < 11 && (h.y == null || h.y > TAP28[1] - 3)) {
        const p = view.project(TAP28[0], TAP28[1] + 2.6, TAP28[2]);
        if (p && p.on && p.x > -40 && p.x < (innerWidth || 844) + 40) {
          if (!tapSz) tapSz = { w: tapEl.offsetWidth || 70, h: tapEl.offsetHeight || 30 };
          const q = claim28(p.x, p.y, tapSz.w, tapSz.h, 'tapuach'); tapEl.style.transform = `translate(${(q.x - tapSz.w / 2).toFixed(0)}px,${(q.y - tapSz.h / 2).toFixed(0)}px)`; tOn = true;
        }
      }
    }
    if (tOn !== tapEl.classList.contains('on')) { tapEl.classList.toggle('on', tOn); tapSz = null; }
  }
  /** tests: onto the altar's top, by the תפוח */
  D.l28GoTapuach = () => { if (!TAP28) return false; teleport({ x: TAP28[0] + 2.6 + 4.2, z: TAP28[2] - 0.6 + 2.2, he: 'התפוח' }); return true; };
  // ── /light28 ──
  // ── polish23 ── the dark night: the אמרכל carries a torch (one warm light; made at the first entry, 0 by day, so no material recompiles later)
  let torch = null, tBase = 0;   // ── light28 ── (tBase) ── /light28 ──
  function torchTick(ms, dt) {
    if (!torch) return;
    const want = skyKey === 'nightd' && entered ? (Number.isFinite(globalThis.__P23_TORCH) ? globalThis.__P23_TORCH : L28T.base /* ── light28 ── (38 → L28T.base) ── /light28 ── */) * (0.93 + 0.07 * Math.sin(ms / 85) * Math.sin(ms / 230)) : 0;
    // ── light28 ── the smoothed base, then × k² by the camera's distance to the flame (nearDim; a floor, so the night still has his light) and the
    // reach capped: the corner of shot 1 (the bench, the wall at 2 amot) is no longer burnt white
    tBase += (want - tBase) * Math.min(1, dt * 3 + 0.02);
    if (tBase < 0.5 && !want) tBase = 0;
    if (tBase > 0) { const h = heroP(); torch.position.set(h.x, h.y + L28T.y, h.z); const k = nearDim(torch.position); torch.userData.l28 = +k.toFixed(3); torch.distance = L28T.cap; torch.decay = 2; torch.intensity = Math.min(L28T.max, tBase * Math.max(L28T.floor, k * k)); }
    else torch.intensity = 0;
    // ── /light28 ──
  }
  // ── /polish23 ──
  function applySky(force) { const k = skyFor(clock.now().h); if (force || k !== skyKey) { skyKey = k; try { o.world && o.world.time && o.world.time(k); } catch (e) { /* */ } } }
  // ── figures24 ── the close-up's clear line: no wall or solid of the court (WALLS22) between it and the act, never off the floor; and the built masses
  // (stages.frameBlocked counts any camera under 3 amot over the ground as blocked — a close-up stands lower: it is judged 3 amot up, its own floor at 1.2)
  const f24Blocked = (px, py, pz, tx, ty, tz) => {
    for (const f of [0.3, 0.55, 0.8, 1]) { if (blocked(tx + (px - tx) * f, tz + (pz - tz) * f, tx, tz)) return true; }
    const g = gy(px, pz); if (py < g + 1.2) return true;
    return !!(S && typeof S.frameBlocked === 'function' && S.frameBlocked(px, Math.max(py, g + 3.05), pz, tx, ty, tz, 'x'));
  };
  // ── /figures24 ──
  D.frame = function frame(ms) {
    if (!entered) return;
    const hidden = !!(doc && doc.hidden);
    if (hidden && !wasHidden) clock.pause(); else if (!hidden && wasHidden) clock.resume();
    wasHidden = hidden;
    const dt = lastMs ? Math.min(0.25, (ms - lastMs) / 1000) : 0; lastMs = ms;
    if (!hidden && !endRun && !D.shift) clock.tick(dt);   // ── shift29 ── (the day's clock holds during a shift) ── /shift29 ──
    { const b = !!(o.busy && o.busy()); if (b !== sheetOn) { sheetOn = b; try { S.hero.show(!b); } catch (e) { /* no hero */ } } }   // (a sheet's own scene: the builder steps out of it)
    if (T) T.update(ms);
    // ── shift29 ── a shift owns the court: its own clock, no guide, no errands, no day HUD (body.sh-on)
    if (D.shift) {
      try { f24Hold = !!f24Tick(view, dt, f24Blocked, gy); } catch (e) { /* */ }
      torchTick(ms, dt);
      try { D.shift.tick(hidden ? 0 : dt); } catch (e) { console.warn('[shift]', e && e.message); }
      return;
    }
    // ── /shift29 ──
    if (G27) G27.frame(ms, dt);   // ── guide27 ── ── /guide27 ──
    if (root) { const b27 = !!(running && !running.game); if (b27 !== !!root.__s27b) { root.__s27b = b27; root.classList.toggle('s27-busy', b27); } }   // ── slice27 ── (during a work the HUD lets a touch through to the world: a kohen under it is a target, not the list) ── /slice27 ──
    try { f24Hold = !!f24Tick(view, dt, f24Blocked, gy); } catch (e) { /* */ }   // ── cam28 ── (f24Hold: the guard's look point is the close-up's) ── /cam28 ──   // ── figures24 ── the close-up over the follow camera ── /figures24 ──
    torchTick(ms, dt);   // ── polish23 ──
    try { l28Frame(ms); } catch (e) { /* */ }   // ── light28 ── ── /light28 ──
    if ((mkT -= dt) <= 0) { mkT = 0.5; refreshMarks(); }
    if ((hudT -= dt) <= 0) { hudT = 0.5; renderHud(); applySky(false); }
  };
  /** Phase B's own events (the sheets finishing): a sheet game he plays — from a marker or from the home — settles its errand */
  D.onAvodah = function onAvodah(type, d) {
    if (type === 'done' && d && d.id && !d.skipped) {
      if (d.points > 0) { D0.pts += d.points; D0.total += d.points; toScore(d.points, 'd' + clock.now().n + ':g:' + d.id, d.id); }   // (the sheet's own זכויות count in the day's card too) ── polish23 ── (+ the master score)
      for (const k of tasks.open()) if (k.game === d.id) { tasks.done(k.id, 1); break; }
    }
  };
  // ── guide27 ── one world: a live join sets the day's clock to the real Temple hour (forward only); the home's practice and Phase A's
  // invitation in landscape go to the work's place in the day (a practice when it is done or passed) — no sheet opens
  D.joinLive = (h) => { if (!Number.isFinite(h)) return false; const t0 = clock.now().t; clock.skipTo(h); tasks.sync(); refreshMarks(); renderHud(); emit('g27Live', { h, moved: clock.now().t > t0 }); return clock.now().t > t0; };
  D.toWork = (what) => (G27 ? G27.toWork(what) : null);
  D.guide = () => G27;
  // ── /guide27 ──
  // ── shift29 ── the shift (src/avodah/shift) borrows the day's world: hook = { work(h), marks(), tick(dt) } | null; the sky at 7:00
  D.shift = null;
  D.shiftMode = (hook) => {
    D.shift = hook || null;
    if (doc) doc.body.classList.toggle('sh-on', !!D.shift);
    if (D.shift) { try { if (G27) G27.exit(); } catch (e) { /* */ } try { E.say && E.say.classList.remove('on'); E.list && E.list.classList.remove('on'); } catch (e) { /* */ } const k = skyFor(7); if (k !== skyKey) { skyKey = k; try { o.world && o.world.time && o.world.time(k); } catch (e) { /* */ } } }
    else { lastMs = 0; applySky(true); hudT = 0; mkT = 0; try { if (G27 && entered) G27.enter(); } catch (e) { /* */ } }
  };
  D.shiftCtx = () => ctxFor({ place: 'court', id: 'shift', src: '' });
  // ── /shift29 ──
  D.startWork = startWork; D.teleport = teleport; D.banner = banner; D.dayEnd = dayEnd;
  D.l28Busy = () => !!(running || h26.hold || h26.closing);   // ── light28 ── (tests: a work, its epilogue) ── /light28 ──
  D.canEnter = () => !!(doc && S && view && isLand() && !noTwin());
  D.refresh = () => { tasks.sync(); refreshMarks(); renderHud(); };
  tasks.sync();
  return D;
}
