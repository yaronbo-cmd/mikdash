/* ── build 131 ── h131/pit-model.js — the rules of part 1, "הבור בבקעת בית כרם" (spec docs/specs/shlav-08-he.md, part 1). THE PIT
 * LANE'S FILE. Pure: no three.js, no DOM, nothing random. Places are the book's (BOOK.s08.pit); every number here is the work's own
 * (illustration: the lever, the layers and how a stone is held are not in the sources — the spec's "מה מסומן המחשה").
 *
 * A work is a blob (JSON, kept in the save while it is open: M.keep('pit', W)):
 *   { lv, stones: [{ id, at: [lx, lz], r, yaw, tilt, deep, cover: [N, E, S, W], block: [..], lean, rise, slide, out, knock, gone, chip, repl }],
 *     mis, dmg, check, nOut, strokes }
 *  · cover: how much earth still holds each side (1 deep in it … 0 bare). A side's lip shows (the lever may go under it) at SEEN; the
 *    stone comes free only when no side holds it over FREE — until then the lever lifts it a little and it stops (rise ≤ capOf).
 *  · level 1: one stone, almost bare. Level 2: one stone lying on a slant, its deep side (deep) under more earth: a lever under any other
 *    side presses its deep edge into the rock — it grinds at GRIND, and at CHIP it is knocked (spec: "לוחץ אותה אל הסלע, והיא נפגמת").
 *    Level 3: three stones leaning one on the next (lean: the index it rests on): lift one another rests on, and that one slides (SLIDE)
 *    and at KNOCK knocks. Let go in time (the warning) and nothing breaks: the stone sinks back, a slip (mis) but no damage.
 *  · a knocked stone goes to the nail check on the cradle (check: its index): the thumb stops at the chip (nailChip) — it stays in the
 *    rejects' heap ('pit.chip', −20) and the crew bares another in its place (repl).
 *   PIT · SIDES · sideDir · lipOf · pitFresh(lv, book) · scrape(W, a, b) · seenSide · capOf · seat(W, i, side) · wrongSide ·
 *   pitStep(W, dt, press) · nailChip · chipOut(W, i) · leftOf · doneOf · pitPts · pitClean
 */
import { grade } from './model.js';

/** the work's numbers (amot, seconds; cover 0…1) */
export const PIT = Object.freeze({
  SEEN: 0.36,      // a side's cover at which its lip shows: the lever goes under it
  FREE: 0.14,      // no side holds the stone over this: it comes out whole
  HOLD_K: 2.6,     // how much a side still held caps the rise: cap = 1 − (most cover − FREE) × HOLD_K
  SCRAPE: 0.15,    // the cover a stroke takes off a side, per amah of the stroke near its lip
  REACH: 1.35,     // how near a stroke must pass a lip (× the stone's size) to take earth off that side
  LAG: 0.32,       // a press waits this long before the heavy stone moves (rule 21)
  RISE: 0.55,      // its rise per second while pressed (eased to its cap)
  SINK: 0.3,       // its sink per second once let go ("שוקעת חזרה לאט")
  GRIND: 0.1, CHIP: 0.34,     // level 2, the wrong side: the grinding starts, the knock
  SLIDE: 0.14, KNOCK: 0.38,   // level 3, a holder lifted: its neighbour starts to slide, knocks
  NAIL: 0.62,      // where on the rim (0…1 round from the thumb's start) the chip of a knocked stone is
});
/** the four sides of a stone in its own frame: N, E, S, W (the sheet's north is −z) */
export const SIDES = Object.freeze(['N', 'E', 'S', 'W']);
const ANG = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
/** a side's outward direction on the sheet [dx, dz] for a stone turned by yaw (a turn toward +z from +x) */
export function sideDir(side, yaw = 0) { const a = ANG[side] + yaw; return [Math.cos(a), Math.sin(a)]; }
/** the stone's half sizes: along its own x (E–W) and z (N–S) */
export const halfOf = (s) => [s.r * 1.25, s.r];
/** the lip of a side: the point on the floor just out from the stone's edge there, [lx, lz] */
export function lipOf(s, side) { const d = sideDir(side, s.yaw), h = halfOf(s)[side % 2 ? 0 : 1]; return [s.at[0] + d[0] * h, s.at[1] + d[1] * h]; }

/** the three levels (the stones' places are the book's; their size, turn, slant and earth the work's own) */
const LEVELS = {
  1: (P) => [{ at: P[0], r: 1.3, yaw: 0.28, cover: [0.42, 0.42, 0.42, 0.42] }],
  2: (P) => [{ at: P[0], r: 1.35, yaw: -0.4, tilt: 0.3, deep: 1, cover: [0.62, 1, 0.62, 0.3] }],
  // (three leaning like fallen slabs: the left on the middle, the middle on the right; only the left is free at first)
  3: (P) => [
    { at: P[0], r: 0.95, yaw: 0, lean: 1, block: [1], cover: [0.58, 0, 0.58, 0.5] },
    { at: P[1], r: 1.0, yaw: 0, lean: 2, block: [1, 3], cover: [0.62, 0, 0.62, 0] },
    { at: P[2], r: 0.95, yaw: 0, block: [3], cover: [0.6, 0.55, 0.6, 0] },
  ],
};
/** a fresh work of level lv; book: BOOK.s08.pit.stones */
export function pitFresh(lv, book) {
  const L = LEVELS[lv] || LEVELS[1], P = (book && book[lv]) || [[0, 0], [0, 0], [0, 0]];
  const stones = L(P).map((s, i) => mk(s, i));
  return { lv: lv | 0 || 1, stones, mis: 0, dmg: 0, check: null, nOut: 0, strokes: 0 };
}
function mk(s, i) {
  return { id: i, at: [s.at[0], s.at[1]], r: s.r, yaw: s.yaw || 0, tilt: s.tilt || 0, deep: s.deep == null ? null : s.deep, cover: s.cover.slice(),
    block: (s.block || []).slice(), lean: s.lean == null ? null : s.lean, rise: 0, slide: 0, out: 0, knock: 0, gone: 0, chip: 0, repl: s.repl | 0 };
}
const live = (s) => s && !s.out && !s.gone && !s.knock;
const blocked = (s, side) => s.block.includes(side) && (s.lean == null || true);
/** a side bare enough for the lever (and not against a neighbour) */
export const seenSide = (s, side) => live(s) && !blocked(s, side) && s.cover[side] <= PIT.SEEN + 1e-9;
/** how high the lever can lift the stone now: earth still holding it caps the rise (1: nothing holds it) */
export function capOf(s) { const c = Math.max(...s.cover.map((v, k) => (blocked(s, k) ? 0 : v))); return Math.max(0.06, Math.min(1, 1 - (c - PIT.FREE) * PIT.HOLD_K)); }
/** level 2: any side but the deep one presses the deep edge into the rock */
export const wrongSide = (W, s, side) => W.lv === 2 && s.deep != null && side !== s.deep;

/** a stroke of the left hand over the floor from a to b ([lx, lz]): earth off every side whose lip it passes near.
 *  → { took, sides: [[i, side, before, after]], bared: [[i, side]] (a lip that showed now), freed: [i] (no side holds now) } */
export function scrape(W, a, b) {
  const L = Math.hypot(b[0] - a[0], b[1] - a[1]); const R = { took: 0, sides: [], bared: [], freed: [] };
  if (!(L > 1e-3)) return R;
  W.stones.forEach((s, i) => {
    if (!live(s)) return;
    const was = capOf(s) >= 1;
    for (let k = 0; k < 4; k++) {
      if (blocked(s, k) || s.cover[k] <= 0) continue;
      const p = lipOf(s, k), d = segDist(p, a, b), reach = PIT.REACH * s.r;
      if (d >= reach) continue;
      const before = s.cover[k], take = PIT.SCRAPE * Math.min(L, 2.4) * (1 - d / reach);
      s.cover[k] = Math.max(0, +(before - take).toFixed(4));
      R.took += before - s.cover[k]; R.sides.push([i, k, before, s.cover[k]]);
      if (before > PIT.SEEN && s.cover[k] <= PIT.SEEN) R.bared.push([i, k]);
    }
    if (!was && capOf(s) >= 1) R.freed.push(i);
  });
  if (R.took > 0) W.strokes++;
  return R;
}
function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], L2 = vx * vx + vz * vz; let u = L2 ? ((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / L2 : 0; u = Math.max(0, Math.min(1, u));
  return Math.hypot(p[0] - (a[0] + vx * u), p[1] - (a[1] + vz * u));
}

/** the lever's tip let go at a side's lip: { ok, why: 'seen' | 'earth' | 'block' | 'gone' } (only a seen side takes it) */
export function seat(W, i, side) {
  const s = W.stones[i]; if (!live(s)) return { ok: false, why: 'gone' };
  if (blocked(s, side)) return { ok: false, why: 'block' };
  if (s.cover[side] > PIT.SEEN + 1e-9) return { ok: false, why: 'earth' };
  return { ok: true, why: 'seen', wrong: wrongSide(W, s, side) };
}

/** one step of the lever under stone i at side `side` (lever null: nothing seated), pressed or not. Every stone not under the lever
 *  sinks back. → events: [{ e: 'move'|'held'|'free'|'grind'|'chip'|'slide'|'knock'|'spared', i, j? }] */
export function pitStep(W, dt, lever, press) {
  const ev = [];
  const L = lever && lever.i != null ? lever : null;
  for (let i = 0; i < W.stones.length; i++) {
    const s = W.stones[i]; if (!live(s)) continue;
    const under = L && L.i === i;
    if (!under || !press) {
      if (s.rise > 0) { s.rise = Math.max(0, s.rise - PIT.SINK * dt); }
      if (under) L.pt = 0;
      continue;
    }
    L.pt = (L.pt || 0) + dt;
    if (L.pt < PIT.LAG) continue;
    const wrong = wrongSide(W, s, L.side), cap = wrong ? 1 : capOf(s), r0 = s.rise;
    s.rise = Math.min(cap, s.rise + PIT.RISE * dt * (0.35 + 0.65 * Math.max(0, 1 - s.rise / Math.max(cap, 1e-3)) + (cap >= 1 ? 0.5 : 0)));
    if (s.rise > r0) ev.push({ e: 'move', i });
    if (!wrong && cap < 1 && s.rise >= cap - 1e-4) ev.push({ e: 'held', i });
    if (wrong) {
      if (r0 < PIT.GRIND && s.rise >= PIT.GRIND) { L.warn = 1; ev.push({ e: 'grind', i }); }
      if (s.rise >= PIT.CHIP) { s.rise = 0; s.knock = 1; L.warn = 0; W.check = i; ev.push({ e: 'chip', i }); }
      continue;
    }
    // level 3: a stone that rests on this one slides as it rises, and knocks
    for (let j = 0; j < W.stones.length; j++) {
      const q = W.stones[j]; if (j === i || !live(q) || q.lean !== i) continue;
      q.slide = Math.max(0, Math.min(1, (s.rise - PIT.SLIDE) / (PIT.KNOCK - PIT.SLIDE)));
      if (r0 < PIT.SLIDE && s.rise >= PIT.SLIDE) { L.warn = 1; ev.push({ e: 'slide', i, j }); }
      if (s.rise >= PIT.KNOCK) { q.knock = 1; q.slide = 1; q.lean = null; L.warn = 0; if (W.check == null) W.check = j; ev.push({ e: 'knock', i, j }); }
    }
    if (s.rise >= 1 - 1e-6 && cap >= 1) { s.rise = 1; s.out = 1; W.nOut++; ev.push({ e: 'free', i }); }
  }
  // the slides of stones whose holder is not lifted ease back
  for (const q of W.stones) if (live(q) && q.slide > 0 && !(L && press && W.stones[L.i] && q.lean === L.i)) q.slide = Math.max(0, q.slide - dt * 1.5);
  return ev;
}
/** the lever let go: a warning that did not end in a knock is a slip (no damage) */
export function release(W, lever) {
  if (lever && lever.warn) { lever.warn = 0; W.mis++; return { e: 'spared', i: lever.i }; }
  return null;
}
/** where on the rim (0…1 round from the thumb's start) the nail stops: a knocked stone's chip */
export const nailChip = () => PIT.NAIL;
/** the nail found the chip: the stone stays in the rejects' heap, the crew bares another in its place (no lean, a little earth) */
export function chipOut(W, i) {
  const s = W.stones[i]; if (!s) return null;
  s.chip = 1; s.gone = 1; s.knock = 0; W.dmg++; if (W.check === i) W.check = null;
  for (const q of W.stones) if (q.lean === i) q.lean = null;
  const n = mk({ at: s.at, r: s.r, yaw: s.yaw + 0.35, tilt: W.lv === 2 ? s.tilt : 0, deep: W.lv === 2 ? s.deep : null, cover: W.lv === 2 ? [0.6, 0.9, 0.6, 0.3] : [0.5, 0.5, 0.5, 0.5], repl: 1 }, W.stones.length);
  W.stones.push(n);
  return n;
}
/** the stones still in the ground (not out, not gone) */
export const leftOf = (W) => W.stones.filter((s) => !s.out && !s.gone);
export const doneOf = (W) => W.check == null && leftOf(W).length === 0;
/** a clean work: no slip, no damage */
export const pitClean = (W) => !W.mis && !W.dmg;
/** the work's points (the one system: 40 clean, 20 with a slip, 10 with damage) */
export const pitPts = (W) => grade(W.dmg, pitClean(W));
/** the next stone to work on: the one the hand is on, else the first left (level 3: in the book's order) */
export const nextOf = (W) => W.stones.findIndex((s) => live(s));
/** a blob from the save, mended (an older or broken one gives null: the work starts fresh) */
export function pitRead(b, lv) {
  if (!b || typeof b !== 'object' || (b.lv | 0) !== (lv | 0) || !Array.isArray(b.stones) || !b.stones.length) return null;
  for (const s of b.stones) { if (!Array.isArray(s.cover) || s.cover.length !== 4 || !Array.isArray(s.at)) return null; s.rise = 0; s.slide = 0; if (!Array.isArray(s.block)) s.block = []; }
  b.mis = b.mis | 0; b.dmg = b.dmg | 0; b.nOut = b.stones.filter((s) => s.out).length; b.strokes = b.strokes | 0;
  if (b.check != null && !(b.stones[b.check] && b.stones[b.check].knock)) b.check = null;
  return b;
}
