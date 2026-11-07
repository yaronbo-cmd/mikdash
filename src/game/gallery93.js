/* ── build 93 ── gallery93.js — stage 05, עזרת הנשים, rebuilt as physical acts in the world (the owner, 3.11 22:12: "תמשיך ל 4-6"; the
 * task doc, stage 05: the logs on the trestle in the chamber of wood, the flaw on the log itself, the peeling a drag along the grain; the
 * gallery's beams carried by two of the crew, the child steering the far end into its socket, a beam that hits the wall stops with a
 * knock; the peg driven by the mallet in a macro on the real joint, one blow too many splits it; the review §3 stage 05: each act more than
 * once, each time harder). Pure: no THREE, no DOM. har42.js plays it. Never a Divine Name. */
import { WOOD48 } from './fam42.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const DRAG93 = 14;

/* ───────── THE LOG (לשכת דיר העצים, מדות ב, ה): its bark in strips; the flaw on the log itself ───────── */
/** segs: strips along the log on each of its four faces · along/across: the drag's angle off the log's line (degrees) — under `along` it
 *  peels, over `across` it rolls the log, between them the bark tears and the hand sticks ("against the grain") */
export const LOG93 = Object.freeze({ segs: 8, along: 22, across: 58, n: Object.freeze([null, 5, 6, 7]) });
const SPECIES93 = ['fig', 'walnut', 'shemen'];
/** a log on the trestle (type: a WOOD48 key). peel(face, u0, u1, ang, px) strips the bark of `face` between u0 and u1 (0…1 along the log)
 *  when the drag runs with the grain; roll(dir) turns it a face; decide(toAltar, px) sends it to the altar's pile (true) or the heap (false) */
export function createLog93(type, rnd = Math.random, L = 1) {
  const T = WOOD48[type] || WOOD48.knot, sp = T.species ? type : SPECIES93[Math.floor(rnd() * 3)], lv = clamp(L | 0, 1, 3);
  const k = {
    type, species: sp, bad: !!T.bad, L: lv, face: 0, rolls: 0, sticks: 0,
    at: { face: Math.floor(rnd() * 4), u: 0.15 + rnd() * 0.7, v: 0.3 + rnd() * 0.4, size: (lv >= 3 ? 0.55 : 0.75) + rnd() * 0.4, turn: rnd() * 6.28 },
    strips: [0, 1, 2, 3].map(() => new Array(LOG93.segs).fill(false)), decided: null, right: null,
  };
  if (T.species) k.at.face = -1;   // (the species: its bark and leaf on every face)
  const seg = (u) => clamp(Math.floor(u * LOG93.segs), 0, LOG93.segs - 1);
  const peeledAt = () => k.at.face >= 0 && k.strips[k.at.face][seg(k.at.u)];
  /** is the flaw seen on the face in view: under the bark only where it was peeled; a dropping until it is peeled off */
  const visible = (face = k.face) => { if (k.at.face < 0) return true; if (k.at.face !== face) return false; if (T.under) return peeledAt(); if (T.wipe) return !peeledAt(); return true; };
  function peel(face, u0, u1, ang, px) {
    if (k.decided) return 'done'; if (!(px >= DRAG93)) return 'tap';
    const a = Math.abs(ang) % 180, off = Math.min(a, 180 - a);
    if (off > LOG93.across) return 'across';   // (across the log: the caller rolls it)
    if (off > LOG93.along) { k.sticks++; return 'stuck'; }
    const f = clamp(face | 0, 0, 3), s0 = seg(Math.min(u0, u1)), s1 = seg(Math.max(u0, u1)); let fresh = 0;
    for (let s = s0; s <= s1; s++) if (!k.strips[f][s]) { k.strips[f][s] = true; fresh++; }
    return fresh ? 'peel' : 'again';
  }
  function roll(dir) { if (k.decided) return 'done'; k.face = (k.face + (dir < 0 ? 3 : 1)) % 4; k.rolls++; return 'roll'; }
  /** → 'tap' | 'ok' | 'waste' (a good log to the heap) | 'bad' (a bad log to the altar) | 'done' */
  function decide(toAltar, px) {
    if (k.decided) return 'done'; if (!(px >= DRAG93)) return 'tap';
    k.decided = toAltar ? 'altar' : 'out'; k.right = toAltar ? !k.bad : k.bad;
    return k.right ? 'ok' : toAltar ? 'bad' : 'waste';
  }
  const peeledShare = () => k.strips.reduce((a, r) => a + r.filter(Boolean).length, 0) / (4 * LOG93.segs);
  return { peel, roll, decide, visible, peeledShare, seg, state: () => k, T };
}
/** the chamber's grade over its logs — each log a stone of his: right מהודר (1); a good log to the heap כשר (½); a bad log to the altar 0 */
export const logQ93 = (r) => (r === 'ok' ? 1 : r === 'waste' ? 0.5 : 0);

/* ───────── THE BEAM (קורות הגזוזטרא, מדות ב, ה): carried by two, its far end steered into the socket ───────── */
/** per level: lag (s) of the far end after the hand · rear (s) the rear carrier's lag after it (the beam's angle) · bob (amot) the
 *  carriers' gait at full pace · wander (amot) how far the two carriers' uneven steps carry the far end off, slowly, as they walk ·
 *  v (amot/s) the pace · tolX/tolY (amot) the socket's play · tolA (rad) the beam's angle allowed */
export const BEAM93 = Object.freeze({
  L: Object.freeze([
    Object.freeze({ lag: 0.45, rear: 0.9, bob: 0.22, wander: 0.7, v: 1.3, tolX: 0.34, tolY: 0.3, tolA: 0.09 }),
    Object.freeze({ lag: 0.65, rear: 1.3, bob: 0.3, wander: 1.0, v: 1.6, tolX: 0.27, tolY: 0.24, tolA: 0.07 }),
    Object.freeze({ lag: 0.85, rear: 1.7, bob: 0.38, wander: 1.3, v: 1.9, tolX: 0.21, tolY: 0.19, tolA: 0.055 }),
  ]),
  len: 6, d0: 5, back: 1.4, ramp: 1.4, stop: 0.35, knockT: 0.6, slideT: 0.7, crewAfter: 3,
  start: Object.freeze([Object.freeze([2.2, -1.1]), Object.freeze([-2.4, -0.9]), Object.freeze([1.8, 1.0])]),
});
/** the beam at its socket (level i 0…2). hold(on, tx, ty): while his finger is on the beam the carriers STAND and the far end goes after
 *  (tx, ty) — the hand's place against the socket, in amot; let go, they WALK to the wall (the longer they walk, the faster) and the far
 *  end wanders with their steps. Touched again, they stop. At the wall: within the play, straight — it slides in; else it KNOCKS on the
 *  stone and they step back (three knocks: the crews set it, no stone of his). Before his first touch they wait. */
export function createBeam93(i = 0) {
  const P = BEAM93.L[clamp(i | 0, 0, 2)], s0 = BEAM93.start[clamp(i | 0, 0, 2)];
  const k = { ph: 'carry', d: BEAM93.d0, w: 0, held: 0, gait: 0, walked: 0, wx: 0, wy: 0, fx: s0[0], fy: s0[1], rx: s0[0], tx: s0[0], ty: s0[1], bx: 0, by: 0, a: 0,
    knocks: 0, t: 0, done: false, crew: false, q: null, last: null };
  let on = false, started = false;
  const settle = () => { k.ph = 'in'; k.t = 0; };
  function hold(h, tx, ty) { if (h) started = true; on = !!h; if (Number.isFinite(tx)) k.tx = clamp(tx, -4, 4); if (Number.isFinite(ty)) k.ty = clamp(ty, -3, 3); }
  function step1(dt) {
    if (k.done) return;
    if (k.ph === 'knock') { k.t += dt; k.w = 0; k.d = Math.min(BEAM93.back, k.d + dt * BEAM93.back / BEAM93.knockT); if (k.t >= BEAM93.knockT) { k.ph = 'carry'; k.t = 0; } return; }
    if (k.ph === 'in') { k.t += dt; k.d = -1.5 * Math.min(1, k.t / BEAM93.slideT); if (k.t >= BEAM93.slideT) { k.done = true; k.q = k.crew ? 0 : k.knocks === 0 ? 1 : k.knocks === 1 ? 0.5 : 0; } return; }
    const walk = started && !on; k.held = walk ? k.held + dt : 0;
    const want = walk ? P.v * Math.min(1, 0.25 + k.held / BEAM93.ramp) : 0;
    k.w += (want - k.w) * Math.min(1, dt / (walk ? 0.35 : BEAM93.stop * 0.5));
    if (k.w < 1e-3) k.w = 0;
    if (on) { k.fx += (k.tx - k.fx) * Math.min(1, dt / P.lag); k.fy += (k.ty - k.fy) * Math.min(1, dt / P.lag); }
    k.rx += (k.fx + k.wx - k.rx) * Math.min(1, dt / P.rear);
    k.gait += k.w * dt * 2.4; k.walked += k.w * dt;
    k.wx = P.wander * Math.sin(k.walked * 1.4 + 0.7 + i * 1.9); k.wy = P.wander * 0.45 * Math.sin(k.walked * 1.05 + 2.1 + i);   // (the carriers never quite even: the far end wanders as they go, and stays where it went when they stop)
    const g = P.bob * (k.w / P.v); k.bx = g * 0.55 * Math.sin(k.gait * Math.PI * 0.5); k.by = g * Math.sin(k.gait * Math.PI);
    k.a = ((k.fx + k.wx + k.bx) - k.rx) / BEAM93.len;
    k.d -= k.w * dt;
    if (k.d <= 0) {
      const x = k.fx + k.wx + k.bx, y = k.fy + k.wy + k.by, ok = Math.abs(x) <= P.tolX && Math.abs(y) <= P.tolY && Math.abs(k.a) <= P.tolA;
      k.last = { x, y, a: k.a, ok };
      if (ok) { k.d = 0; k.w = 0; settle(); return; }
      k.knocks++; k.ph = 'knock'; k.t = 0; k.w = 0; k.d = 0;
      if (k.knocks >= BEAM93.crewAfter) { k.crew = true; k.fx = k.rx = k.tx = 0; k.fy = k.ty = 0; k.bx = k.by = k.wx = k.wy = 0; k.a = 0; settle(); }
    }
  }
  /** sub-stepped: steady at any frame rate */
  function step(dt) { let r = Math.min(0.5, Math.max(0, dt)); while (r > 1e-9) { const h = Math.min(0.05, r); step1(h); r -= h; } return k; }
  const end = () => ({ x: k.fx + k.wx + k.bx, y: k.fy + k.wy + k.by });
  return { hold, step, end, state: () => k, P };
}

/* ───────── THE PEG (שגם ויתד): the mallet raised and let fall — the higher, the harder; flush and it holds; past it, it splits ───────── */
/** per level: gain — how far a full blow drives it · slack — how far past flush before it splits · stiff — the bite growing as it goes in */
export const PEG93 = Object.freeze({
  L: Object.freeze([Object.freeze({ gain: 0.42, slack: 0.22, stiff: 0.45 }), Object.freeze({ gain: 0.36, slack: 0.14, stiff: 0.55 }), Object.freeze({ gain: 0.32, slack: 0.09, stiff: 0.62 })]),
  idle: 1.1, crewAfter: 3, min: 0.06,
});
/** blow(s): s 0…1, the mallet's height. → 'tap' | 'in' | 'flush' (locked) | 'split' (a new peg, free) | 'done' */
export function createPeg93(i = 0) {
  const P = PEG93.L[clamp(i | 0, 0, 2)];
  const k = { depth: 0, locked: false, splits: 0, blows: 0, idle: 0, done: false, crew: false, q: null, lastGain: 0 };
  const drive = (s) => P.gain * s * (1 - P.stiff * k.depth);
  function blow(s) {
    if (k.done) return 'done'; if (!(s >= PEG93.min)) return 'tap'; s = clamp(s, 0, 1); k.blows++; k.idle = 0;
    if (k.locked) return split();
    const g = drive(s); k.lastGain = g; const d = k.depth + g;
    if (d > 1 + P.slack) return split();
    if (d >= 1) { k.depth = 1; k.locked = true; return 'flush'; }
    k.depth = d; return 'in';
  }
  function split() {
    k.splits++; k.depth = 0; k.locked = false;
    if (k.splits >= PEG93.crewAfter) { k.crew = true; k.depth = 1; k.locked = true; k.done = true; k.q = 0; }
    return 'split';
  }
  function step(dt) { if (k.done || !k.locked) return k; k.idle += dt; if (k.idle >= PEG93.idle) { k.done = true; k.q = k.splits === 0 ? 1 : k.splits === 1 ? 0.5 : 0; } return k; }
  /** the strength that would take it flush from here (for the hint at level 1 and the tests) */
  const need = () => (1 - k.depth) / Math.max(1e-6, P.gain * (1 - P.stiff * k.depth));
  return { blow, step, need, state: () => k, P, pitch: () => 260 + k.depth * 420 };
}

export const rate93 = (q) => (q >= 1 ? 'mehudar' : q >= 0.5 ? 'kasher' : 'tikkun');
