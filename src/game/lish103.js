/* ── build 103 ── lish103.js — stage 08, היסוד, rebuilt on build 101's world (the design doc "שלבים 07–10: החלטות לפני בנייה", 4.11; the
 *  owner 5.11 07:41: "אל תחכה. תתקדם"). Two deep acts, each done again at a rising level:
 *  - THE STONE ON THE BENCH: one stone at a time comes off the cart from בית כרם; every tool at hand at once. He turns it (a heavy stone:
 *    it keeps turning after the finger and slows on its own), wipes the mud with the wet cloth, runs his nail slowly along the edge in
 *    front (it catches at a nick — חולין יח ע"א), and catches the thin glint of an iron scratch that shows only when the face is turned to
 *    the light at its angle. Then ➡ למזבח or ⬅ לא למזבח. A flawed stone sent to the altar: רב האומנים stops it and shows the flaw.
 *  - THE YESOD'S FIELD STONES: unhewn stones, each end at its own slant. A stretch of the yesod between the crews' stones: each stone
 *    he chooses from the pile, turns end for end, twists a little, and lays against the last; its end must meet the last one's slant
 *    (a wedge left open is chinked with slivers and a wooden mallet — the right thickness for the gap). The stretch's last stone must
 *    fit both ends and the length. Then the ends: the yesod runs all the north and all the west, and eats one amah into the south and one
 *    into the east (מדות ג, א) — a stone laid where there is no yesod: "כאן אין יסוד".
 * Pure: no THREE, no DOM. har42.js plays it. The slants, the slivers' sizes, the cloth, the master's stop: המחשה. Never a Divine Name. */

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const wrap103 = (a) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
const Q4 = Math.PI / 2;

/* ───────── THE STONE ON THE BENCH ───────── */
/** the stones in order: each brings one tool in (the line says so the first time); the last ones mix at a higher level.
 *  type: crack | mud (a stain only) | mudcrack | nick | iron | whole. decoy: a mud stain on another face too */
export const BENCH103 = Object.freeze({
  stones: Object.freeze([
    Object.freeze({ type: 'crack', L: 1, tool: 'turn' }),
    Object.freeze({ type: 'mud', L: 1, tool: 'cloth' }),
    Object.freeze({ type: 'mudcrack', L: 2, tool: 'cloth' }),
    Object.freeze({ type: 'nick', L: 1, tool: 'nail' }),
    Object.freeze({ type: 'iron', L: 1, tool: 'glint' }),
    Object.freeze({ type: 'whole', L: 2, decoy: true }),
    Object.freeze({ type: 'mix', L: 3, decoy: true }),
  ]),
  mix: Object.freeze(['nick', 'iron', 'whole', 'mudcrack']),
  bad: Object.freeze({ crack: true, mudcrack: true, nick: true, iron: true, mud: false, whole: false }),
  /** the turn: drag px → radians, its friction (1/s), the most it spins */
  turnK: 0.011, fric: 2.4, wMax: 9,
  /** the glint: the face turned off the camera toward the light by g0 (rad), within ±win[L] (narrower each level), held seen (s) */
  g0: 0.62, win: Object.freeze([null, 0.2, 0.13, 0.085]), seeT: 0.18,
  /** a flaw is seen when its face is within this of the camera, uncovered, this long */
  faceWin: 0.55, crackT: 0.3,
  /** the nail: the edge (0…1) at most vmax[L] per second; the nick's half-width; the edge counts as felt at this share */
  vmax: Object.freeze([null, 0.9, 0.75, 0.62]), nickW: 0.05, bins: 20, feltAt: 0.8, edgeWin: 0.35,
  /** the cloth: a scrub's path (amot of the face) to wipe the stain */
  wipeLen: 2.4,
});
/** a stone. rnd: the stone's randomness. → turn(dpx) while dragged; spin(dt) every frame; wipe(len) with the cloth on the face in front;
 *  slide(u0, u1, dt) the nail on the front edge; decide('altar'|'out') */
export function createBench103(i = 0, rnd = Math.random) {
  const D = BENCH103.stones[clamp(i | 0, 0, BENCH103.stones.length - 1)], L = D.L;
  const type = D.type === 'mix' ? BENCH103.mix[Math.floor(rnd() * BENCH103.mix.length) % BENCH103.mix.length] : D.type;
  // the flaw's face: the first stones show it near the front (the crack one turn away; the nail's on the front edge); later anywhere
  const fFlaw = type === 'nick' ? (L <= 1 ? 0 : Math.floor(rnd() * 4)) : type === 'mud' || type === 'whole' ? -1 : L <= 1 ? (type === 'iron' ? 1 + 2 * Math.floor(rnd() * 2) : 1 + Math.floor(rnd() * 3)) : Math.floor(rnd() * 4);
  const mud = type === 'mud' ? 0 : type === 'mudcrack' ? fFlaw : D.decoy ? (fFlaw >= 0 ? (fFlaw + 2) % 4 : Math.floor(rnd() * 4)) : -1;
  const k = { i, type, L, tool: D.tool || null, bad: !!BENCH103.bad[type], yaw: 0, w: 0, held: false,
    flaw: { face: fFlaw, u: 0.25 + rnd() * 0.5, v: 0.3 + rnd() * 0.4, len: 0.45 + rnd() * 0.3, seed: Math.floor(rnd() * 1e6), side: rnd() < 0.5 ? -1 : 1 },
    nick: type === 'nick' ? 0.2 + rnd() * 0.6 : null, mud, mudLeft: mud >= 0 ? 1 : 0,
    seen: { crack: 0, glint: 0 }, glintNow: 0, felt: [0, 1, 2, 3].map(() => new Array(BENCH103.bins).fill(0)), caught: false, fast: 0, turned: 0,
    decided: null, right: null, stops: 0, waste: 0, ev: [] };
  /** how far face f is turned off the camera (0: square to it) */
  const off = (f) => wrap103(k.yaw + f * Q4);
  const front = () => { let b = 0; for (let f = 1; f < 4; f++) if (Math.abs(off(f)) < Math.abs(off(b))) b = f; return b; };
  function turn(dpx) { if (k.decided) return; k.held = true; const da = dpx * BENCH103.turnK; k.yaw = wrap103(k.yaw + da); k.turned += Math.abs(da); k.w = clamp(k.w * 0.5 + da * 30, -BENCH103.wMax, BENCH103.wMax); }
  function release() { k.held = false; }
  function spin(dt) {
    k.ev = []; dt = clamp(+dt || 0, 0, 0.1);
    if (!k.held && Math.abs(k.w) > 1e-3) { k.yaw = wrap103(k.yaw + k.w * dt); k.turned += Math.abs(k.w * dt); k.w *= Math.exp(-BENCH103.fric * dt); if (Math.abs(k.w) < 0.05) k.w = 0; }
    // what shows now: the crack on its face (uncovered), the glint at its angle
    const f = k.flaw.face;
    if ((type === 'crack' || type === 'mudcrack') && f >= 0 && Math.abs(off(f)) < BENCH103.faceWin && !(k.mud === f && k.mudLeft > 0.15)) { k.seen.crack += dt; if (k.seen.crack >= BENCH103.crackT && k.seen.crack - dt < BENCH103.crackT) k.ev.push('crack'); }
    const g = glint(); k.glintNow = g;
    if (g > 0.5) { k.seen.glint += dt; if (k.seen.glint >= BENCH103.seeT && k.seen.glint - dt < BENCH103.seeT) k.ev.push('glint'); }
    return k;
  }
  /** the iron scratch's glint now, 0…1 (its face turned toward the light — to the camera's left — by g0, within the level's window) */
  function glint() { if (type !== 'iron' || k.flaw.face < 0) return 0; const d = Math.abs(off(k.flaw.face) - BENCH103.g0 * k.flaw.side), w = BENCH103.win[clamp(L, 1, 3)]; return d >= w ? 0 : 1 - (d / w) * (d / w); }
  /** the wet cloth rubbed on the face in front, a path of len (amot of the face) */
  function wipe(len) {
    if (k.decided || k.mud < 0 || k.mudLeft <= 0) return 'clean'; if (front() !== k.mud || Math.abs(off(k.mud)) > 0.6) return 'other';
    k.mudLeft = Math.max(0, k.mudLeft - Math.max(0, +len || 0) / BENCH103.wipeLen); if (k.mudLeft <= 0) { k.ev.push('wiped'); return 'wiped'; } return 'wiping';
  }
  /** the nail along the front face's top edge from u0 to u1 (0…1, the camera's left to right) in dt → 'fast' | 'caught' | 'ok' | 'off' */
  function slide(u0, u1, dt) {
    if (k.decided) return 'off'; const f = front(); if (Math.abs(off(f)) > BENCH103.edgeWin) return 'off';
    const a = clamp(Math.min(u0, u1), 0, 1), b = clamp(Math.max(u0, u1), 0, 1), v = (b - a) / Math.max(1e-3, dt);
    if (v > BENCH103.vmax[clamp(L, 1, 3)]) { k.fast++; return 'fast'; }
    const bins = k.felt[f]; for (let q = Math.floor(a * BENCH103.bins); q <= Math.min(BENCH103.bins - 1, Math.floor(b * BENCH103.bins)); q++) bins[q] = 1;
    if (type === 'nick' && f === k.flaw.face && b >= k.nick - BENCH103.nickW && a <= k.nick + BENCH103.nickW) { if (!k.caught) k.ev.push('caught'); k.caught = true; return 'caught'; }
    return 'ok';
  }
  const feltEdge = (f) => k.felt[f].reduce((s, x) => s + x, 0) / BENCH103.bins;
  /** ➡ 'altar' or ⬅ 'out' → 'ok' (right), 'stop' (a flawed stone to the altar: the master stops it — it stays on the bench), 'waste' (a
   *  sound stone out: it goes, a stone lost) */
  function decide(to) {
    if (k.decided) return 'done';
    if (to === 'altar' && k.bad) { k.stops++; return 'stop'; }
    k.decided = to; k.right = to === 'altar' ? !k.bad : k.bad; if (!k.right) k.waste++; return k.right ? 'ok' : 'waste';
  }
  /** what the master shows when he stops it: the face to turn to and the flaw's word */
  const flawShown = () => ({ face: type === 'nick' ? k.flaw.face : k.flaw.face, what: type });
  return { turn, release, spin, glint, wipe, slide, feltEdge, decide, off, front, flawShown, state: () => k, D };
}
/** the act's grade: every stone right first time מהודר; one or two wrong כשר; more טעון תיקון (a stop or a stone lost counts) */
export const benchQ103 = (faults) => (faults <= 0 ? 1 : faults <= 2 ? 0.5 : 0);

/* ───────── THE YESOD'S FIELD STONES ───────── */
/** a stretch: its length (amot along the course, between the crews' stones), how many stones he lays, the decoys in the pile; the slant
 *  tolerance: tight (a joint closed) and the most a sliver can close; the twist free of fault and the most. ghost: the good fit shows */
export const YESOD103 = Object.freeze({
  stretches: Object.freeze([
    Object.freeze({ side: 'north', at: 19, n: 3, decoys: 1, ghost: true }),
    Object.freeze({ side: 'west', at: 14, n: 4, decoys: 2, ghost: false }),
  ]),
  lmin: 1.3, lmax: 2.1, slant: 0.42, tight: 0.075, chink: 0.3, twistOk: 0.07, twistMax: 0.2, longBy: 0.1,
  /** the slivers: their thickness (amot); one fits a wedge from its own thickness to this much over it */
  slivers: Object.freeze([0.08, 0.16, 0.26]), over: 0.06,
  /** the mallet: taps to drive a sliver home */
  taps: 3,
  /** the ends (מדות ג, א): in the altar's frame (x from its west, z from its north, 0…32): the south one beside the south-west corner, the
   *  east one beside the north-east; near: a stone let go within this of the rim is on it */
  ends: Object.freeze([Object.freeze({ id: 'south', x: 1.5, z: 31.5 }), Object.freeze({ id: 'east', x: 31.5, z: 1.5 })]), side: 32, near: 2.6, snap: 1.4,
});
/** one stretch. Joints are lines across the course; a slant is the angle off square (rad, + leans the line's outer end east/along).
 *  stones: { l, a, b } length and the two ends' slants as they lie in the pile (a the left end, b the right). A stone turned end for end
 *  shows b on the left; twisted by θ both ends lean θ more and its face stands θ off the line.
 *  → lay(s, flip, twist) against the last joint; chink(j, size), tap(j); back() the last one up again */
export function createStretch103(i = 0, rnd = Math.random) {
  const T = YESOD103.stretches[clamp(i | 0, 0, YESOD103.stretches.length - 1)], Y = YESOD103;
  const sl = () => (rnd() * 2 - 1) * Y.slant;
  // the chain he should find: joints j0 (the crews' stone's end) … jn (the crews' stone at the far end), the lengths between
  const J0 = sl(), ls = [], js = [J0];
  for (let q = 0; q < T.n; q++) { ls.push(Y.lmin + rnd() * (Y.lmax - Y.lmin)); let j = sl(); for (let t = 0; t < 6 && Math.abs(j - js[q]) < 0.2; t++) j = sl(); js.push(j); }
  const len = ls.reduce((s, x) => s + x, 0);
  const pile = ls.map((l, q) => { const flip = rnd() < 0.5; return { id: q, l, a: flip ? js[q + 1] : js[q], b: flip ? js[q] : js[q + 1], used: false, good: q }; });
  for (let d = 0; d < T.decoys; d++) { const q = Math.floor(rnd() * T.n); let a = sl(); for (let t = 0; t < 8 && Math.min(Math.abs(a - js[q]), Math.abs(a - js[q + 1])) < 0.2; t++) a = sl(); pile.push({ id: pile.length, l: ls[q] + (rnd() < 0.5 ? -1 : 1) * (0.25 + rnd() * 0.2), a, b: sl(), used: false, good: -1 }); }
  for (let q = pile.length - 1; q > 0; q--) { const r = Math.floor(rnd() * (q + 1)); [pile[q], pile[r]] = [pile[r], pile[q]]; }
  pile.forEach((s, q) => { s.id = q; });
  const k = { i, side: T.side, at: T.at, ghost: T.ghost, len, n: T.n, j0: J0, jEnd: js[T.n], pile, laid: [], gaps: [], fills: 0, extra: 0, faceFaults: 0, nofit: 0, long: 0,
    ph: 'lay', done: false, q: null, chain: { ls, js }, supplied: 0 };
  const x0 = () => k.laid.reduce((s, L) => s + L.l, 0);
  const lastSlant = () => (k.laid.length ? k.laid[k.laid.length - 1].right : J0);
  /** the stone s laid against the last joint, turned (flip) and twisted (θ): → { r, gapL, gapR, out }
   *  r: 'tight' | 'wedge' (a sliver will close it) | 'open' (too wide: it does not sit — back) | 'long' (it does not go in) | 'none' */
  function trial(s, flip, twist) {
    const S = k.pile[s]; if (!S || S.used || k.ph !== 'lay') return { r: 'none' };
    const tw = clamp(+twist || 0, -Y.twistMax, Y.twistMax), left = (flip ? S.b : S.a) + tw, right = (flip ? S.a : S.b) + tw;
    const gapL = Math.abs(left - lastSlant()), rest = k.len - x0(), last = rest - S.l < Y.lmin * 0.8;   // (the last: what it leaves is less than any stone)
    let gapR = 0;
    if (last) { if (S.l > rest + Y.longBy) return { r: 'long', gapL, left, right, rest }; gapR = Math.abs(right - k.jEnd) + Math.max(0, rest - S.l); }
    const worst = Math.max(gapL, gapR);
    return { r: worst > Y.chink ? 'open' : worst > Y.tight ? 'wedge' : 'tight', gapL, gapR, left, right, last, rest, out: Math.abs(tw) > Y.twistOk };
  }
  function lay(s, flip, twist) {
    const t = trial(s, flip, twist); if (t.r === 'none') return t;
    if (t.r === 'long') { k.long++; return t; }
    if (t.r === 'open') { k.nofit++; return t; }
    const S = k.pile[s]; S.used = true; const tw = clamp(+twist || 0, -Y.twistMax, Y.twistMax);
    const L = { s, l: S.l, x: x0(), flip: !!flip, twist: tw, left: t.left, right: t.right, out: t.out };
    k.laid.push(L); if (t.out) k.faceFaults++;
    if (t.gapL > Y.tight) k.gaps.push({ j: k.laid.length - 1, w: t.gapL, left: t.gapL, fill: [], taps: 0, shut: false });
    if (t.last) { if (t.gapR > Y.tight) k.gaps.push({ j: k.laid.length, w: t.gapR, left: t.gapR, fill: [], taps: 0, shut: false }); k.ph = k.gaps.length ? 'chink' : 'set'; if (!k.gaps.length) finish(); }
    else ensure();
    return t;
  }
  /** no stone left in the pile that sits (after a stone from another place in the chain, or one twisted): the porters bring one that does
   *  — from the heap of stones he passed on the bench (המחשה) */
  function ensure() {
    if (k.ph !== 'lay') return false;
    const works = k.pile.some((S, s) => !S.used && [false, true].some((f) => { const L0 = f ? S.b : S.a, r = trial(s, f, clamp(lastSlant() - L0, -Y.twistOk, Y.twistOk)).r; return r === 'tight' || r === 'wedge'; }));
    if (works) return false;
    const rest = k.len - x0(), close = rest <= Y.lmax + Y.lmin * 0.8, l = close ? rest - 0.02 : Y.lmin + rnd() * (Math.min(Y.lmax, rest - Y.lmin) - Y.lmin), b = close ? k.jEnd : sl(), flip = rnd() < 0.5;
    k.pile.push({ id: k.pile.length, l, a: flip ? b : lastSlant(), b: flip ? lastSlant() : b, used: false, good: 99, brought: true }); k.supplied++; return true;
  }
  /** the last laid stone back to the pile (before the stretch is closed) */
  function back() { if (k.ph !== 'lay' || !k.laid.length) return null; const L = k.laid.pop(); k.pile[L.s].used = false; if (L.out) k.faceFaults = Math.max(0, k.faceFaults - 1); k.gaps = k.gaps.filter((g) => g.j < k.laid.length); return L; }
  /** a sliver of size (amot) into gap g → 'thick' (it does not go in) | 'in' (it goes in; taps drive it) | 'deep' (too thin: it drops in, the
   *  gap narrower but open) | 'shut' | 'none' */
  function chink(g, size) {
    const G = k.gaps[g]; if (!G || k.ph !== 'chink' || G.shut) return G && G.shut ? 'shut' : 'none';
    if (G.fill.length && G.taps < Y.taps && G.fill[G.fill.length - 1].home === false) return 'busy';
    size = +size; if (!(size > 0)) return 'none';
    if (size > G.left + Y.over) return 'thick';
    k.fills++; G.fill.push({ size, home: false });
    if (size < G.left - Y.tight - 0.02) { G.left -= size; G.fill[G.fill.length - 1].home = true; k.extra++; return 'deep'; }
    G.taps = 0; return 'in';
  }
  /** a tap of the wooden mallet on gap g's sliver → 'tap' | 'home' (driven: the gap shut) | 'none' */
  function tap(g) {
    const G = k.gaps[g]; if (!G || k.ph !== 'chink' || G.shut || !G.fill.length) return 'none'; const f = G.fill[G.fill.length - 1]; if (f.home) return 'none';
    G.taps++; if (G.taps < Y.taps) return 'tap';
    f.home = true; G.left = 0; G.shut = true; if (k.gaps.every((q) => q.shut)) finish(); return 'home';
  }
  function finish() { k.ph = 'set'; k.done = true; const p = k.fills + k.extra + 2 * k.faceFaults; k.q = p <= 0 ? 1 : p <= 2 ? 0.5 : 0; k.pen = p; }
  /** where stone j's left joint lies along the stretch (amot from its start) */
  const jointAt = (j) => (j <= 0 ? 0 : j >= k.laid.length ? x0() : k.laid[j].x);
  /** the good choice now (for the ghost at level 1 and the test's hand): { s, flip, twist } */
  function hint() {
    if (k.ph !== 'lay') return null; let best = null;
    k.pile.forEach((S, s) => { if (S.used) return; for (const flip of [false, true]) { const L0 = flip ? S.b : S.a, tw = clamp(lastSlant() - L0, -Y.twistOk, Y.twistOk), t = trial(s, flip, tw); if (t.r === 'none' || t.r === 'long' || t.r === 'open') continue; const sc = Math.max(t.gapL, t.gapR || 0) + Math.abs(tw) * 0.2 + (S.good < 0 ? 0.05 : 0); if (!best || sc < best.sc) best = { s, flip, twist: tw, sc }; } });
    return best;
  }
  /** the right sliver for gap g (the thickest that goes in) */
  const sliverFor = (g) => { const G = k.gaps[g]; if (!G) return null; let b = null; for (const z of Y.slivers) if (z <= G.left + Y.over && (b == null || z > b)) b = z; return b; };
  return { trial, lay, back, chink, tap, hint, sliverFor, jointAt, lastSlant, x0, ensure, state: () => k, T };
}
export const yesodQ103 = (qs) => { if (!qs.length) return 0; const s = qs.reduce((a, b) => a + b, 0) / qs.length; return s >= 0.88 ? 1 : s >= 0.45 ? 0.5 : 0; };
/** THE ENDS (מדות ג, א): a stone let go at (x, z) in the altar's frame → 'set' (at an end not yet laid) | 'noyesod' (on the rim, where
 *  there is no yesod) | 'taken' | 'away'. Two ends; strays count (one or none מהודר) */
export function createEnds103() {
  const Y = YESOD103, k = { set: {}, strays: 0, done: false, q: null };
  function drop(x, z) {
    if (k.done) return { r: 'away' };
    let best = null; for (const e of Y.ends) { const d = Math.hypot(x - e.x, z - e.z); if (!best || d < best.d) best = { e, d }; }
    const S = Y.side, rim = x > -Y.near && z > -Y.near && x < S + Y.near && z < S + Y.near && Math.min(Math.abs(x), Math.abs(z), Math.abs(S - x), Math.abs(S - z)) <= Y.near;
    if (best && best.d <= Y.snap) { if (k.set[best.e.id]) return { r: 'taken', end: best.e }; k.set[best.e.id] = true; if (Y.ends.every((e) => k.set[e.id])) { k.done = true; k.q = k.strays <= 1 ? 1 : k.strays <= 3 ? 0.5 : 0; } return { r: 'set', end: best.e }; }
    if (rim) { k.strays++; return { r: 'noyesod' }; }
    return { r: 'away' };
  }
  return { drop, open: () => Y.ends.filter((e) => !k.set[e.id]), state: () => k };
}

/* ───────── the stage ───────── */
/** stage 08's parts: the bench first (the stones the altar may have), then the yesod from them */
export const PARTS103 = Object.freeze(['open', 'bench', 'course', 'reveal']);
export const DEP103 = Object.freeze({ bench: Object.freeze([]), course: Object.freeze(['bench']) });
/** the lines (one short instruction; after " · " the source) */
export const L103 = Object.freeze({
  turn: 'סובבו את האבן ↔ — בדקו כל פאה · "אבנים שלמות" — מדות ג, ד · טיוטה',
  crack: 'סדק! אבן פגומה — ⬅ לא למזבח · "ובפגימה לכל דבר" — מדות ג, ד · טיוטה',
  cloth: 'בוץ על האבן — קחו את המטלית הרטובה ונגבו · המחשה',
  wiped: 'נוגב — עכשיו רואים מה מתחת · המחשה',
  nail: 'העבירו ציפורן לאט לאורך השפה שלפניכם ↔ · "כדי שתחגור בה צפורן" — חולין יח ע"א · טיוטה',
  fast: 'לאט — כדי להרגיש · המחשה',
  caught: 'הציפורן נתפסה — פגימה בשפה · "כדי שתחגור בה צפורן" — חולין יח ע"א · טיוטה',
  glint: 'סובבו לאט אל האור — לפעמים רק נצנוץ דק מגלה · המחשה',
  iron: 'נצנוץ של ברזל! האבן שלמה, אבל ברזל נגע בה · "שהברזל פוסל בנגיעה" — מדות ג, ד · טיוטה',
  decide: 'כשרה ➡ למזבח · פסולה ⬅ לא למזבח · המחשה',
  stop: 'רב האומנים עוצר: "רגע — ראו כאן" · המחשה',
  waste: 'חבל — האבן הזאת היתה כשרה · המחשה',
  ok: 'נכון · המחשה',
  bench: 'אבני המזבח — "מבקעת בית כרם … ומביאין משם אבנים שלמות" — מדות ג, ד · טיוטה',
  lay: 'בחרו אבן מהערימה וגררו אל הנדבך — הקצה שלה צריך לפגוש את הקצה של האחרונה · המחשה',
  turnEnd: 'הקישו על האבן — היא מתהפכת קצה לקצה · גררו את הקצה שלה — היא מתעקמת מעט · המחשה',
  wedge: 'נשאר רווח — יסתמו אותו בשבב · המחשה',
  open: 'הרווח רחב מדי — האבן לא יושבת. נסו אבן אחרת או הפכו אותה · המחשה',
  long: 'ארוכה מדי — לא נכנסת. חפשו אבן קצרה יותר · המחשה',
  out: 'האבן עקומה — הפנים שלה בורחות מהקו · המחשה',
  chink: 'גררו שבב בעובי הרווח, והקישו בפטיש העץ · "לא תניף עליהם ברזל" — דברים כז, ה · טיוטה',
  thick: 'עבה מדי — לא נכנס · המחשה',
  deep: 'דק מדי — נפל פנימה, והרווח עוד פתוח · המחשה',
  home: 'סגור · המחשה',
  ends: 'עכשיו הקצוות — היסוד "אוכל בדרום אמה אחת ובמזרח אמה אחת" — מדות ג, א · טיוטה',
  noYesod: 'כאן אין יסוד — "היה מהלך על פני כל הצפון ועל פני כל המערב" — מדות ג, א · טיוטה',
  crews: 'הפועלים מניחים את שאר היסוד · המחשה',
  done: '"עלה אמה וכנס אמה, זה היסוד" — מדות ג, א · טיוטה',
});
export const SRC103 = Object.freeze([
  'אבני המזבח — "אחד אבני הכבש ואחד אבני המזבח, מבקעת בית כרם, וחופרין למטה מבתולה, ומביאין משם אבנים שלמות, שלא הונף עליהן ברזל" — מדות ג, ד · טיוטה',
  '"שהברזל פוסל בנגיעה, ובפגימה לכל דבר" — מדות ג, ד; "וכמה פגימת המזבח — כדי שתחגור בה צפורן" — חולין יח ע"א · טיוטה',
  'היסוד — "היה מהלך על פני כל הצפון ועל פני כל המערב, ואוכל בדרום אמה אחת ובמזרח אמה אחת"; "עלה אמה וכנס אמה, זה היסוד" — מדות ג, א · טיוטה',
  'המטלית, השבבים, פטיש העץ, השיפוע של קצות האבנים, ורב האומנים העוצר — המחשה',
]);
