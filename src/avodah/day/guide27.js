/* ── guide27 ── guide27.js — "never lost, never idle, one world" (WAVE27 GUIDE27; docs/WAVE27-BRIEF.md, docs/PLAY27.md §א).
 *   const G = createGuide({ S, view, scene, root, tasks, clock, placeAt, gy, heroP, WORKS, GAMES, memunName, teleport, say(k, text),
 *                           pulse(id, ms), busy() → bool (a work, its epilogue, a card, the list: the ladder is off), twin: () => T, emit, sfx, save })
 *   G.primary() · G.meanwhile() · G.nextPrimary() · G.hud() → { h2, h3 } · G.goal() · G.goTo() · G.ensure() · G.frame(ms, dt)
 *   G.enter() · G.exit() · G.practice(id) · G.toWork(what) · G.walkTo(k) · G.state()
 * (1) the guide: the PRIMARY task (the next step by the clock), its marker by the arrow chip (twin.js tw-goal) and a soft path of discs
 *     on the floor (A* over the Temple's free floors, world22.free; the discs fade out after 12 amot); a tap on the arrow walks him there
 *     (S.hero.drive along the path — the stick takes over at any touch); the HUD line "עכשיו: לך ל<place> — <task>".
 * (2) the idle ladder (no text nags, every step an invitation): 3 s → he turns toward the marker, it pulses; 8 s → its ממונה says
 *     "אמרכל — לכאן" once; 20 s → he walks there himself and waits. Any input cancels; during a work it is off.
 * (3) never empty: ≥ 2 open whenever the day runs — a done (or passed) work re-opens as PRACTICE ("לתרגל", half points, task.practice).
 * (4) the skip card: only meanwhile tasks open and he stands still 6 s → "המנוחה בלשכה — קפוץ אל <next> (<hour>)"; once per gap.
 * No timers that press, no guilt: nothing here takes anything away. Texts are drafts. */
import { InstancedMesh, CircleGeometry, MeshBasicMaterial, Object3D, AdditiveBlending, Color } from 'three';
import { free } from './world22.js';
import { labelHe } from './clock.js';

const tOf = (h) => (((h - 18) % 24) + 24) % 24;
const dueT = (k) => (k.dueH === 18 ? 24 : tOf(k.dueH));
/** the meanwhile kinds: the private-offering queue and its rings, the gardeners, the restocks, a practice */
const MW_IDS = { queue: 1, yachid: 1, ganan: 1 };
export const isMeanwhile = (k) => !!(k && (k.practice || k.restock || MW_IDS[k.id]));
/** the six works of the slice (PLAY27 §ד): a passed one is offered for practice first */
const SIX = { fire: 1, deshen: 1, maaracha: 1, kiyor: 1, evarim: 1, payis: 1 };
const PATH_LEN = 12, DISC_GAP = 1.5, NDISC = 8;
export const IDLE = { turn: 3, call: 8, walk: 20, skip: 6 };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/** "לך ל" + the place: the article folds into the ל (לַמזבח, לַכיור, לַדיר) */
export const toPlace = (he) => 'ל' + String(he || '').replace(/^ה(?=[א-ת])/, '');

/* ───────── the floor's grid and A* (pure; tests) ───────── */
const GX0 = -188, GX1 = 144, GZ0 = -84, GZ1 = 84, GC = 2;
const NX = Math.round((GX1 - GX0) / GC) + 1, NZ = Math.round((GZ1 - GZ0) / GC) + 1;
let GRID = null;
const RISE = 1.0;   // (stages.js twinFree: never up more than 1.05 amot in one stride; down off a ledge he hops)
function grid(isFree, gy) {
  if (GRID && GRID.f === isFree && GRID.gy === gy) return GRID;
  const g = new Uint8Array(NX * NZ);
  for (let j = 0; j < NZ; j++) for (let i = 0; i < NX; i++) g[j * NX + i] = isFree(GX0 + i * GC, GZ0 + j * GC) ? 1 : 0;
  GRID = { f: isFree, gy, g, e: new Uint8Array(NX * NZ * 8) }; return GRID;
}
const cellOf = (x, z) => [Math.round((x - GX0) / GC), Math.round((z - GZ0) / GC)];
function nearestFree(g, x, z, R = 5) {
  const [ci, cj] = cellOf(x, z); let best = -1, bd = 1e9;
  for (let dj = -R; dj <= R; dj++) for (let di = -R; di <= R; di++) {
    const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= NX || j >= NZ || !g[j * NX + i]) continue;
    const d = Math.hypot(GX0 + i * GC - x, GZ0 + j * GC - z); if (d < bd) { bd = d; best = j * NX + i; }
  }
  return best;
}
/** a stride from (x0, z0) to (x1, z1) by his feet's rule: free floor every half amah, never a rise of more than RISE in one half amah */
export function clear(isFree, x0, z0, x1, z1, gy, stepOk) {
  const L = Math.hypot(x1 - x0, z1 - z0), n = Math.max(1, Math.ceil(L / 0.45));
  let hp = gy ? gy(x0, z0) : 0, px = x0, pz = z0;
  for (let k = 1; k <= n; k++) {
    const u = k / n, x = x0 + (x1 - x0) * u, z = z0 + (z1 - z0) * u;
    if (k < n && !isFree(x, z)) return false;
    if (gy) { const h = gy(x, z); if (!(h - hp <= RISE)) return false; hp = h; }
    if (stepOk && !stepOk(x, z, px, pz)) return false;
    px = x; pz = z;
  }
  return true;
}
/** the way from (x0, z0) to (x1, z1) over the free floors he can climb → [{ x, z }…] (smoothed; the last point is the goal's free cell) | null */
export function planPath(x0, z0, x1, z1, isFree = free, gy = null, stepOk = null) {
  // (the feet's own rule — stages.js twinFree: Phase A's footprints, the Kodesh — is checked on the way found; a cell it stops is shut and the way found again)
  for (let tries = 0; tries < 10; tries++) {
    const r = plan1(x0, z0, x1, z1, isFree, gy);
    if (!r || !stepOk) return r ? r.out : null;
    let bad = -1, px = r.cells[0].x, pz = r.cells[0].z;
    for (let i = 1; i < r.cells.length && bad < 0; i++) { const c = r.cells[i]; if (!clear(isFree, px, pz, c.x, c.z, null, stepOk)) bad = i; px = c.x; pz = c.z; }
    if (bad < 0) return smooth(r.cells, x0, z0, isFree, gy, stepOk);
    const c = r.cells[bad], GR = grid(isFree, gy); const [ci, cj] = cellOf(c.x, c.z);
    GR.g[cj * NX + ci] = 0;   // (a cell the feet cannot enter from the way: shut, for good — the world's solids do not move)
  }
  return null;
}
function smooth(cells, x0, z0, isFree, gy, stepOk) {
  const out = []; let cx = x0, cz = z0, i = -1;
  while (i < cells.length - 1) {
    let j = cells.length - 1; while (j > i + 1 && !clear(isFree, cx, cz, cells[j].x, cells[j].z, gy, stepOk)) j--;
    out.push(cells[j]); cx = cells[j].x; cz = cells[j].z; i = j;
  }
  if (!out.length) out.push(cells[cells.length - 1]);
  return out;
}
function plan1(x0, z0, x1, z1, isFree, gy) {
  const GR = grid(isFree, gy), g = GR.g, EC = GR.e;
  const s = nearestFree(g, x0, z0, 3), e = nearestFree(g, x1, z1, 5);
  if (s < 0 || e < 0) return null;
  const N = NX * NZ, G = new Float32Array(N).fill(1e9), from = new Int32Array(N).fill(-1), shut = new Uint8Array(N);
  const ei = e % NX, ej = (e / NX) | 0, H = (c) => { const di = Math.abs(c % NX - ei), dj = Math.abs(((c / NX) | 0) - ej); return (Math.max(di, dj) + 0.414 * Math.min(di, dj)) * GC; };
  const heap = [], hf = [];
  const push = (c, f) => { heap.push(c); hf.push(f); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (hf[p] <= hf[i]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; [hf[p], hf[i]] = [hf[i], hf[p]]; i = p; } };
  const pop = () => { const top = heap[0], lc = heap.pop(), lf = hf.pop(); if (heap.length) { heap[0] = lc; hf[0] = lf; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < heap.length && hf[l] < hf[m]) m = l; if (r < heap.length && hf[r] < hf[m]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; [hf[m], hf[i]] = [hf[i], hf[m]]; i = m; } } return top; };
  // (an edge's stride rule, cached: 0 unknown · 1 ok · 2 no)
  const edge = (c, n, d) => { const k = c * 8 + d; let v = EC[k]; if (!v) { v = !gy || clear(isFree, GX0 + (c % NX) * GC, GZ0 + ((c / NX) | 0) * GC, GX0 + (n % NX) * GC, GZ0 + ((n / NX) | 0) * GC, gy) ? 1 : 2; EC[k] = v; } return v === 1; };
  G[s] = 0; push(s, H(s));
  let found = false, it = 0;
  while (heap.length && it++ < N) {
    const c = pop(); if (shut[c]) continue; shut[c] = 1;
    if (c === e) { found = true; break; }
    const ci = c % NX, cj = (c / NX) | 0; let d = -1;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue; d++; const i = ci + di, j = cj + dj; if (i < 0 || j < 0 || i >= NX || j >= NZ) continue;
      const n = j * NX + i; if (!g[n] || shut[n]) continue;
      if (di && dj && (!g[cj * NX + i] || !g[j * NX + ci])) continue;   // (no corner cutting)
      const ng = G[c] + (di && dj ? 1.414 : 1) * GC; if (ng >= G[n]) continue;
      if (!edge(c, n, d)) continue;
      G[n] = ng; from[n] = c; push(n, ng + H(n));
    }
  }
  if (!found) return null;
  const cells = []; for (let c = e; c >= 0; c = from[c]) { cells.push({ x: GX0 + (c % NX) * GC, z: GZ0 + ((c / NX) | 0) * GC }); if (c === s) break; }
  cells.reverse();
  return { cells, out: smooth(cells, x0, z0, isFree, gy, null) };
}

const CSS27 = `
.gm.tw-on .tw-goal:not(.go){animation:g27-pl 1.6s ease-in-out infinite}
@keyframes g27-pl{0%,100%{box-shadow:0 0 0 4px rgba(255,214,110,.25),0 2px 8px rgba(0,0,0,.4)}50%{box-shadow:0 0 0 11px rgba(255,214,110,.08),0 2px 8px rgba(0,0,0,.4)}}
@media (prefers-reduced-motion:reduce){.gm.tw-on .tw-goal{animation:none}}
.dy-gm .dy-h2.g27-now{color:#FFE7A8;font:800 13px/1.25 "Heebo",sans-serif;padding:3px 12px 3px}
.dy-gm .dy-h3{padding:1px 12px 4px;border-radius:4px 4px 14px 14px;background:rgba(27,22,17,.62);color:#CDBE9E;font:500 11.5px/1.2 "Heebo",sans-serif;text-align:center}
.dy-gm .dy-h3:empty{display:none}
.dy-gm .dy-say{top:calc(env(safe-area-inset-top,0px) + 100px)}
.dy-gm .dy-hud.g27-3 .dy-h2{border-radius:4px}
.g27-skip{position:absolute;bottom:calc(env(safe-area-inset-bottom,0px) + 84px);right:50%;transform:translate(50%,12px);width:min(380px,60vw);padding:10px 12px;border-radius:16px;background:rgba(29,24,19,.95);color:#F6EBD6;box-shadow:0 8px 24px rgba(0,0,0,.5);display:none;flex-direction:column;gap:8px;pointer-events:auto;z-index:33;direction:rtl;text-align:center;font:600 13.5px/1.35 "Heebo",sans-serif;opacity:0;transition:opacity .25s,transform .25s}
.g27-skip.on{display:flex;opacity:1;transform:translate(50%,0)}
.g27-skip p{margin:0}.g27-skip small{color:#9CC4EE;font:500 11px/1.2 "Heebo",sans-serif}
.g27-skip div{display:flex;gap:10px;justify-content:center}
.g27-skip button{min-width:96px;min-height:44px;border-radius:12px;border:0;font:800 14px/1 "Heebo",sans-serif}
.g27-skip [data-g27="jump"]{background:#E4B656;color:#1D1406}.g27-skip [data-g27="later"]{background:rgba(255,255,255,.12);color:#F6EBD6}
`;

export function createGuide(o = {}) {
  const doc = typeof document !== 'undefined' ? document : null;
  const S = o.S, tasks = o.tasks, clock = o.clock, placeAt = o.placeAt, gy = o.gy || (() => 16), heroP = o.heroP;
  const save = o.save || {};
  const emit = (t, d) => { try { o.emit && o.emit(t, d); } catch (e) { /* the host's */ } };
  const sfx = (n) => { try { o.sfx && o.sfx.play && o.sfx.play(n); } catch (e) { /* none */ } };
  const twin = () => (o.twin ? o.twin() : null);
  let on = false, skipEl = null;
  const heroFree = (x, z, x0, z0) => { try { return !S.hero.free || S.hero.free(x, z, x0, z0) !== false; } catch (e) { return true; } };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  /* ───────── the list: primary, meanwhile, never empty ───────── */
  const nameOf = (k) => {
    if (!k) return '';
    const W = o.WORKS && k.work ? o.WORKS[k.work] : null, Gm = o.GAMES && (k.sheet || k.game) ? o.GAMES[k.sheet || k.game] : null;
    if (k.restock) return String(k.he || '').split(/ — |\. |: /)[0];
    return String((W && W.he) || (Gm && Gm.he) || String(k.he || '').split(/\. |: /)[0]).split(' — ')[0];
  };
  const placeHe = (k) => (placeAt(k.place) || {}).he || '';
  function primary() {
    let best = null;
    for (const k of tasks.open()) { if (isMeanwhile(k)) continue; if (!best || tOf(k.openH) < tOf(best.openH) - 1e-9 || (Math.abs(tOf(k.openH) - tOf(best.openH)) < 1e-9 && dueT(k) < dueT(best))) best = k; }
    return best;
  }
  function meanwhile(p = primary()) {
    const h = heroP(); let best = null, bs = 1e9;
    for (const k of tasks.open()) {
      if (p && k.id === p.id) continue;
      const q = placeAt(k.place), d = Math.hypot(q.x - h.x, q.z - h.z), s = (isMeanwhile(k) ? 0 : 1000) + (k.practice ? 500 : 0) + d;   // (a real meanwhile first, then a second step, a practice last; the nearest)
      if (s < bs) { bs = s; best = k; }
    }
    return best;
  }
  /** the next primary to open (a template still waiting) → { k, h } | null */
  function nextPrimary() {
    const t = clock.now().t; let best = null;
    for (const k of tasks.list()) { if (k.state !== 'wait' || isMeanwhile(k) || k.game) continue; const a = tOf(k.openH); if (a > t && (!best || a < tOf(best.openH))) best = k; }
    return best ? { k: best, h: best.openH } : null;
  }
  const canPractice = (k) => !!(k && k.work && !k.restock && !k.game && o.WORKS && o.WORKS[k.work] && (k.state === 'done' || k.state === 'passed'));
  /** a done (or passed) work opens again as practice: the same task, `practice` set, half its points */
  function practice(id) {
    const k = tasks.get(id); if (!canPractice(k)) return null;
    if (!Number.isFinite(k.pts0)) k.pts0 = k.pts;
    k.practice = true; k.pts = Math.max(1, Math.round(k.pts0 / 2)); k.state = 'open'; k.openedAt = clock.now().t;
    emit('taskOpen', { id: k.id, he: k.he, from: k.from, fromHe: k.fromHe || '', place: k.place, due: k.dueH, practice: true, forced: true });
    return k;
  }
  const DONE = {}, LAST = { id: '', t: 0 };
  function onDone(id) { DONE[id] = LAST.t = now(); LAST.id = id; }
  /** ≥ 2 open whenever the day runs: a practice fills the gap (done today first, then the six works the priests finished, the nearest) */
  function ensure() {
    if (!on || clock.ended) return 0;
    let n = tasks.open().length, added = 0;
    if (n >= 2) return 0;
    const h = heroP(), cand = tasks.list().filter(canPractice);
    // (the work he has just finished is never offered back at once: a practice is "another one", the last done waits 90 s; the recent ones last)
    const tn = now(), recent = (k) => DONE[k.id] && tn - DONE[k.id] < 90000;
    const score = (k) => (recent(k) ? 5000 : 0) + (k.state === 'done' ? 0 : SIX[k.work] ? 1000 : 2000) + Math.hypot(placeAt(k.place).x - h.x, placeAt(k.place).z - h.z);
    cand.sort((a, b) => score(a) - score(b));
    // (never at a place where an errand is open: a practice never stands in the way of the day's own work at its marker)
    const busyAt = (k) => tasks.open().some((x) => !x.practice && Math.hypot(placeAt(x.place).x - placeAt(k.place).x, placeAt(x.place).z - placeAt(k.place).z) < 6);
    for (const k of cand) { if (n >= 2) break; if (busyAt(k) || (k.id === LAST.id && tn - LAST.t < 90000)) continue; if (practice(k.id)) { n++; added++; } }
    return added;
  }

  /* ───────── the HUD lines ───────── */
  // ── cam28 ── the open task at his feet that is not the primary (the primary's own marker within 5 amot keeps "עכשיו: … — כאן"): the
  // nearest within 6 amot; at one place the one the work button does (the day's own errands before a restock, a practice last)
  function hereTask(h, p) {
    if (p) { const q = placeAt(p.place); if (Math.hypot(q.x - h.x, q.z - h.z) <= 5) return null; }
    let best = null, bd = 1e9;
    for (const k of tasks.open()) {
      if (p && k.id === p.id) continue;
      const q = placeAt(k.place), d = Math.hypot(q.x - h.x, q.z - h.z) + (k.restock ? 0.02 : 0) + (k.practice ? 0.04 : 0);
      if (d <= 6.06 && d < bd) { bd = d; best = k; }
    }
    return best;
  }
  // ── /cam28 ──
  function hud() {
    const p = primary(), m = meanwhile(p), h = heroP();
    let h2 = '', h3 = '';
    // ── cam28 ── (shot 2: at the pen's marker the HUD said "לך ללשכת הגזית — הפיס" while the button offered the lambs) the HUD says what is
    // HERE: within 6 amot of an open marker that is not the primary, "כאן: <this task> · אחר כך: <the primary>"; the arrow still points
    // to the primary
    const here = hereTask(h, p);
    if (p && here) h2 = `כאן: ${nameOf(here)} · אחר כך: ${nameOf(p)}`;
    else
    // ── /cam28 ──
    if (p) {
      const q = placeAt(p.place), near = Math.hypot(q.x - h.x, q.z - h.z) <= 5;
      h2 = near ? `עכשיו: ${nameOf(p)} — כאן` : `עכשיו: לך ${toPlace(placeHe(p))} — ${nameOf(p)}`;
    } else {
      const nx = nextPrimary();
      h2 = nx ? `הבא: ${nameOf(nx.k)} (${labelHe(nx.h)})` : '';
    }
    if (m) h3 = `בינתיים: ${nameOf(m)}${m.practice ? ' — לתרגל' : ''} · ${placeHe(m)}`;
    return { h2, h3, primary: p ? p.id : null, meanwhile: m ? m.id : null };
  }

  /* ───────── the arrow chip (twin.js goal / goTo) and the walk ───────── */
  const goalTask = () => primary() || meanwhile(null);
  function goal() { const k = goalTask(); if (!k) return null; const p = placeAt(k.place); return { x: p.x, y: gy(p.x, p.z), z: p.z, icon: k.icon || '★' }; }
  const AW = { on: false, id: null, pts: null, i: 0, speed: 12, t0: 0, chk: 0, cx: 0, cz: 0, replans: 0, why: '', arrived: null };
  function stopWalk(why) { if (!AW.on) return; AW.on = false; AW.why = why || ''; try { if (!(twin() && twin().stick && twin().stick().on)) S.hero.drive(0, 0); } catch (e) { /* */ } emit('g27Walk', { on: false, id: AW.id, why }); }
  function walkTo(k, why = 'tap') {
    if (!k) return { ok: false };
    const h = heroP(), q = placeAt(k.place);
    if (Math.hypot(q.x - h.x, q.z - h.z) <= 3) { face(q); return { ok: true, how: 'here' }; }
    const pts = planPath(h.x, h.z, q.x, q.z, free, gy, heroFree);
    if (!pts) { o.teleport && o.teleport(q); AW.id = k.id; AW.why = 'fade'; AW.arrived = { id: k.id, t: Math.round(now()), fade: true }; emit('g27Walk', { on: false, id: k.id, why: 'fade' }); return { ok: true, how: 'fade' }; }   // (no way by the feet — the pens, up the Nikanor ledge: as through a gate)
    let L = 0, px = h.x, pz = h.z; for (const p of pts) { L += Math.hypot(p.x - px, p.z - pz); px = p.x; pz = p.z; }
    AW.on = true; AW.id = k.id; AW.pts = pts; AW.i = 0; AW.speed = Math.min(26, Math.max(11, L / 7)); AW.t0 = now(); AW.chk = now(); AW.cx = h.x; AW.cz = h.z; AW.replans = 0; AW.why = why; AW.L = L;
    emit('g27Walk', { on: true, id: k.id, why, L: Math.round(L), n: pts.length });
    return { ok: true, how: 'walk', L: Math.round(L) };
  }
  function goTo() { const k = goalTask(); if (!k) return { ok: false }; L27.input = now(); return walkTo(k, 'tap'); }
  function face(q) { try { const h = heroP(); S.hero.setPos(h.x, h.z, Math.atan2(q.x - h.x, q.z - h.z)); } catch (e) { /* */ } }
  function walkStep(dt) {
    if (!AW.on) return;
    const T = twin();
    if (T && T.stick && T.stick().on) { AW.on = false; AW.why = 'stick'; emit('g27Walk', { on: false, id: AW.id, why: 'stick' }); return; }   // (the stick takes over: it drives him)
    if (o.busy && o.busy()) { stopWalk('busy'); return; }
    const k = tasks.get(AW.id), q = k ? placeAt(k.place) : null, h = heroP();
    if (!k || k.state !== 'open' || !q) { stopWalk('gone'); return; }
    if (Math.hypot(q.x - h.x, q.z - h.z) <= 2.8) { stopWalk('arrived'); face(q); AW.arrived = { id: k.id, t: Math.round(now()) }; emit('g27Arrive', { id: k.id }); sfx('ui'); return; }
    let p = AW.pts[AW.i];
    // (a waypoint is passed when he is near it — or nearer the next one than it is: a slide along a wall may carry him past it)
    while (p && AW.i < AW.pts.length - 1) { const nx = AW.pts[AW.i + 1]; if (Math.hypot(p.x - h.x, p.z - h.z) < 0.8 || Math.hypot(nx.x - h.x, nx.z - h.z) < Math.hypot(nx.x - p.x, nx.z - p.z)) p = AW.pts[++AW.i]; else break; }
    if (!p) { stopWalk('end'); return; }
    const dx = p.x - h.x, dz = p.z - h.z, d = Math.hypot(dx, dz) || 1, left = Math.hypot(q.x - h.x, q.z - h.z), sp = Math.max(5, Math.min(AW.speed, left * 2.2));
    try { S.hero.drive(dx / d * sp, dz / d * sp); } catch (e) { /* */ }
    // stuck (a solid the floor's grid did not know): plan again once, then the gate's fade
    if (now() - AW.chk > 1200) {
      const moved = Math.hypot(h.x - AW.cx, h.z - AW.cz); AW.chk = now(); AW.cx = h.x; AW.cz = h.z;
      if (moved < 0.6) { if (AW.replans++ < 1) { const pts = planPath(h.x, h.z, q.x, q.z, free, gy, heroFree); if (pts) { AW.pts = pts; AW.i = 0; } } else { stopWalk('fade'); o.teleport && o.teleport(q); } }
    }
  }

  /* ───────── the soft path on the floor ───────── */
  let discs = null; const dm = new Object3D(), dc = new Color();
  const PP = { pts: null, id: null, t: 0, hx: 1e9, hz: 1e9, vis: false };
  function makeDiscs() {
    if (discs || !o.scene) return;
    try {
      const geo = new CircleGeometry(0.34, 18); geo.rotateX(-Math.PI / 2);
      const mat = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9, blending: AdditiveBlending, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
      discs = new InstancedMesh(geo, mat, NDISC); discs.name = 'g27-path'; discs.frustumCulled = false; discs.renderOrder = 3;
      for (let i = 0; i < NDISC; i++) { dm.position.set(0, -999, 0); dm.updateMatrix(); discs.setMatrixAt(i, dm.matrix); discs.setColorAt(i, dc.setRGB(0, 0, 0)); }
      discs.visible = false; o.scene.add(discs);
    } catch (e) { discs = null; }
  }
  function pathStep(ms, dt) {
    if (!discs) return;
    const k = goalTask(), h = heroP(), busy = !!(o.busy && o.busy());
    const q = k ? placeAt(k.place) : null, far = q && Math.hypot(q.x - h.x, q.z - h.z) > 6;
    const want = !!(on && k && far && !busy);
    if (!want) { if (PP.vis) { discs.visible = false; PP.vis = false; } return; }
    if ((PP.t -= dt) <= 0 || PP.id !== k.id || Math.hypot(h.x - PP.hx, h.z - PP.hz) > 2.5) {
      PP.t = 0.8; PP.id = k.id; PP.hx = h.x; PP.hz = h.z;
      PP.pts = AW.on && AW.id === k.id ? AW.pts.slice(AW.i) : planPath(h.x, h.z, q.x, q.z, free, gy, heroFree);
    }
    if (!PP.pts || !PP.pts.length) { discs.visible = false; PP.vis = false; return; }
    // walk the polyline from his feet: a disc every 1.5 amot, drifting toward the marker, fading out by 12 amot
    const drift = ((ms / 1000) * 1.6) % DISC_GAP;
    let i = 0, px = h.x, pz = h.z, seg = 0, acc = 0, nextAt = 1.2 + drift;
    const P = PP.pts;
    while (i < NDISC && seg < P.length) {
      const sx = P[seg].x - px, sz = P[seg].z - pz, L = Math.hypot(sx, sz);
      if (acc + L >= nextAt) { const u = (nextAt - acc) / (L || 1), x = px + sx * u, z = pz + sz * u;
        const f = Math.max(0, 1 - nextAt / PATH_LEN), b = f * f * 0.95;
        dm.position.set(x, gy(x, z) + 0.07, z); dm.scale.setScalar(0.75 + 0.35 * f); dm.updateMatrix(); discs.setMatrixAt(i, dm.matrix); discs.setColorAt(i, dc.setRGB(b * 1.0, b * 0.84, b * 0.42)); i++; nextAt += DISC_GAP;
        if (nextAt > PATH_LEN) break; continue; }
      acc += L; px = P[seg].x; pz = P[seg].z; seg++;
    }
    for (; i < NDISC; i++) { dm.position.set(0, -999, 0); dm.scale.setScalar(1); dm.updateMatrix(); discs.setMatrixAt(i, dm.matrix); }
    discs.instanceMatrix.needsUpdate = true; if (discs.instanceColor) discs.instanceColor.needsUpdate = true;
    if (!PP.vis) { discs.visible = true; PP.vis = true; }
  }

  /* ───────── the idle ladder and the skip card ───────── */
  const L27 = { input: now(), turned: '', called: {}, walked: '', turnT: 0, turnYaw: 0, skipKey: '', skipNo: {}, log: [] };
  const mark = () => { L27.input = now(); L27.turned = ''; L27.walked = ''; L27.called = {}; };   // (a touch ends the episode: the next stillness may call once more)
  const onInput = (e) => { if (e && e.target && e.target.closest && e.target.closest('.tw-goal')) { L27.input = now(); return; } mark(); };
  function skipCard(show, nx) {
    if (!skipEl && root()) {
      skipEl = doc.createElement('div'); skipEl.className = 'g27-skip'; skipEl.setAttribute('role', 'dialog'); root().appendChild(skipEl);
      skipEl.addEventListener('click', (e) => {
        const b = e.target.closest && e.target.closest('[data-g27]'); if (!b) return;
        const key = L27.skipKey; L27.skipNo[key] = 1; skipCard(false); mark();
        if (b.dataset.g27 === 'jump') { const k = tasks.get(key); if (k) jump(k); }
        emit('g27Skip', { id: key, jump: b.dataset.g27 === 'jump' });
      });
    }
    if (!skipEl) return;
    if (show && nx) {
      L27.skipKey = nx.k.id;
      skipEl.innerHTML = `<p>המנוחה בלשכה — קפוץ אל ${esc(nameOf(nx.k))} (${esc(labelHe(nx.h))})</p><small>הזמן ירוץ קדימה עד רגע לפני. טיוטה</small><div><button data-g27="jump">קפוץ</button><button data-g27="later">עוד לא</button></div>`;
      skipEl.classList.add('on'); sfx('ui'); emit('g27SkipCard', { id: nx.k.id });
    } else skipEl.classList.remove('on');
  }
  const skipOn = () => !!(skipEl && skipEl.classList.contains('on'));
  /** the clock runs forward to 10 minutes before that step's hour */
  function jump(k) {
    const h = k.openH - 10 / 60, t = clock.now().t;
    if (tOf(h) > t) { clock.skipTo(h); try { tasks.sync(); } catch (e) { /* */ } }
    emit('g27Jump', { id: k.id, h });
  }
  function root() { return o.root ? (typeof o.root === 'function' ? o.root() : o.root) : null; }
  function ladder(ms, dt) {
    const T = twin(), t = now();
    if ((T && T.stick && T.stick().on) || AW.on) { L27.input = t; return; }
    const busy = !!(o.busy && o.busy());
    if (busy || clock.ended) { L27.input = t; if (skipOn()) skipCard(false); return; }
    const idle = (t - L27.input) / 1000;
    const p = primary(), k = p || meanwhile(null);
    if (skipOn()) { const nx0 = nextPrimary(); if (p || !nx0 || nx0.k.id !== L27.skipKey) skipCard(false); }   // (the gap closed or moved: the card goes, unasked)
    // (4) the skip card: only meanwhile open, he stands still
    if (!p && k && idle >= IDLE.skip && !skipOn()) { const nx = nextPrimary(); if (nx && !L27.skipNo[nx.k.id] && tOf(nx.h - 10 / 60) > clock.now().t + 0.02) skipCard(true, nx); }
    if (!k) return;
    const q = placeAt(k.place), h = heroP(), far = Math.hypot(q.x - h.x, q.z - h.z) > 5;
    if (!far) return;
    // 3 s: he looks round — turns toward the marker — and the marker pulses
    if (idle >= IDLE.turn && L27.turned !== k.id) {
      L27.turned = k.id; L27.turnT = 0.55; L27.turnYaw = Math.atan2(q.x - h.x, q.z - h.z);
      o.pulse && o.pulse(k.id, 6000); L27.log.push(['turn', k.id, Math.round(t)]); emit('g27Idle', { step: 'turn', id: k.id });
    }
    if (L27.turnT > 0) {
      L27.turnT -= dt; let dy = L27.turnYaw - (h.yaw || 0); dy = Math.atan2(Math.sin(dy), Math.cos(dy));
      try { S.hero.setPos(h.x, h.z, (h.yaw || 0) + dy * Math.min(1, dt * 9)); } catch (e) { /* */ }
      if (L27.turnT <= 0) { try { S.hero.gesture && S.hero.gesture('think'); } catch (e) { /* */ } }
    }
    // 8 s: the ממונה there calls, once for this task
    if (idle >= IDLE.call && !L27.called[k.id]) {
      L27.called[k.id] = 1; o.say && o.say(k, 'אמרכל — לכאן!'); L27.log.push(['call', k.id, Math.round(t)]); emit('g27Idle', { step: 'call', id: k.id });
    }
    // 20 s: he walks there by himself and waits at the marker (not while the skip card asks)
    if (idle >= IDLE.walk && L27.walked !== k.id && !skipOn()) {
      L27.walked = k.id; L27.log.push(['walk', k.id, Math.round(t)]); emit('g27Idle', { step: 'walk', id: k.id }); walkTo(k, 'idle');
    }
  }

  /* ───────── the lifecycle ───────── */
  let ensT = 0;
  function frame(ms, dt) {
    if (!on) return;
    walkStep(dt);
    ladder(ms, dt);
    try { pathStep(ms, dt); } catch (e) { /* the floor's */ }
    if ((ensT -= dt) <= 0) { ensT = 1; ensure(); }
  }
  function enter() {
    if (on) return; on = true; makeDiscs(); mark();
    if (doc && !doc.getElementById('g27-css')) { const s = doc.createElement('style'); s.id = 'g27-css'; s.textContent = CSS27; doc.head.appendChild(s); }
    if (typeof window !== 'undefined') { window.addEventListener('pointerdown', onInput, true); window.addEventListener('keydown', onInput, true); }
    ensure();
  }
  function exit() {
    if (!on) return; stopWalk('exit'); on = false;
    if (discs) { discs.visible = false; PP.vis = false; }
    skipCard(false);
    if (typeof window !== 'undefined') { window.removeEventListener('pointerdown', onInput, true); window.removeEventListener('keydown', onInput, true); }
  }
  /** the home's practice / Phase A's invitation in landscape: the work's place in the day (practice when it is done or passed) */
  const ALIAS = { shachar: 'g-payis1', mine: null, erev: 'g-erev', erevchain: 'g-erev', dir: 'pen', pitum: 'pitum', korbanot: 'queue' };
  function toWork(what) {
    let k = null;
    if (what && ALIAS[what] !== undefined) k = ALIAS[what] ? tasks.get(ALIAS[what]) : null;
    if (!k && what) k = tasks.list().find((x) => x.id === what || x.id === 'g-' + what || x.sheet === what || x.work === what) || null;
    if (!k) k = primary() || meanwhile(null);
    if (!k) return null;
    if (k.state === 'done' || k.state === 'passed') practice(k.id);
    try { o.teleport && o.teleport(placeAt(k.place)); } catch (e) { /* */ }
    emit('g27ToWork', { what, id: k.id, state: k.state });
    return k.id;
  }
  function state() {
    const p = primary(), m = meanwhile(p), nx = nextPrimary();
    return { on, primary: p && p.id, meanwhile: m && m.id, next: nx && nx.k.id, open: tasks.open().map((k) => k.id + (k.practice ? '*' : '')), walk: { on: AW.on, id: AW.id, why: AW.why, i: AW.i, n: AW.pts ? AW.pts.length : 0, L: AW.L | 0, arrived: AW.arrived }, idle: Math.round((now() - L27.input) / 100) / 10, log: L27.log.slice(-12), skip: skipOn() ? L27.skipKey : null, path: { vis: PP.vis, n: PP.pts ? PP.pts.length : 0 }, discs: !!discs };
  }
  void save;
  /** after a sync's burst of events: fill on the next frame (a pass and an open come in one sync — never fill between them) */
  const soon = () => { ensT = Math.min(ensT, 0.05); };
  return { onDone, dbgPts: () => (AW.pts || []).map((p) => [p.x, p.z]), soon, primary, meanwhile, nextPrimary, hud, goal, goTo, walkTo, ensure, practice, frame, enter, exit, toWork, state, nameOf, isMeanwhile, input: mark, get walking() { return AW.on; }, idle: (s) => { L27.input = now() - s * 1000; } };
}
// ── /guide27 ──
