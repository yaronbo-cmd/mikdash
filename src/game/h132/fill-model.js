/* ── build 132 ── h132/fill-model.js — work 2 "מילוי הגוש באיזון" (spec docs/specs/shlav-09-he.md, עבודה 2), its rules. Pure: no
 * three.js, no DOM, nothing random (the levels' orders are fixed tables). The lead's file.
 *
 * Five zones on the block's floor (four corners and the middle, BOOK.s09.zone); heights in units (one layer = one unit in every zone =
 * 5 units). Loads: a big basket of stones +2 to one zone, a small one +1 (no flow), a tub of mix +1 to its zone, then the mix flows from
 * high to low neighbours (flow()). After each load: the middle collapses to the lowest corner when it stands more than 2 over it
 * (collapse()); the four gauges are read (gauges(): for each wall, the higher of its two corners less the mean of all five zones); the
 * load scores by the worst gauge (40 / 20 / 10; a collapse: 10 at most, the streak breaks). A gauge in danger two seconds running bulges
 * its board for good (−20; tick()). A basket on a zone whose last load was stones, with no mix since, is a weak pocket; a tub on that
 * zone before the layer closes mends it; else at the close a corner's pocket is a nest (−20), the middle's a dent in the top (−20). The
 * layer closes after its fourth load: every zone within a quarter unit of the layer's height → the crew rakes it level, +40; else a dent
 * or bump stays (0). Level 1: the fixed order big, tub, small, tub and lenient gauges; 2: the order mixed inside each layer (a fixed
 * table), the queue fixed; 3: mixed, and the caravan — a sled every five seconds (3 at the start + 17), the first two on the ramp to
 * choose from, a full ramp keeps the oxen waiting and ends the streak (no damage, no load lost).
 *
 *   FILL · ZONES · NB · WALLS · ORDERS · zoneAt(x, z) · flow(h, z) · collapse(h) · gauges(h) · band(g, lv) · bandPts(b)
 *   fresh(lv) · onRamp(S) · canTake(S, i) · take(S, i, zone) → ev · tick(S, dt) → evs · result(S) · save(S) / load(o)
 */
import { BOOK } from '../world/grid.js';
import { starsOf } from './model.js';

const S9 = BOOK.s09;
const EPS = 1e-9;

/* ───────── the numbers (spec, work 2; "לכיוונון" where marked) ───────── */
export const FILL = Object.freeze({
  UNITS: Object.freeze({ big: 2, small: 1, tub: 1 }),
  LAYERS: 5, PER_LAYER: 4,
  FLOW_OVER: 0.5,      // a pair is levelled while it differs by more than half a unit
  FLOW_VOL: 1,         // the flow stops once a tub's volume (one unit) has moved
  FLOW_MAX: 20,        // or after 20 steps
  COLLAPSE: 2,         // the middle more than 2 over the lowest corner: one unit slides to it
  GAUGE: Object.freeze({ good: 1, warn: 2 }),          // ≤ 1 good, ≤ 2 warn, > 2 danger
  GAUGE_L1: Object.freeze({ good: 1.5, warn: 2.5 }),   // level 1: "הספים סלחניים יותר" (לכיוונון)
  BULGE_S: 2,          // two seconds running in danger: the board bulges
  LAYER_TOL: 0.25,     // a layer is level when every zone is within a quarter unit of its height
  POCKET_MIX: 0.25,    // mix that flows in (a quarter unit at least) counts as mix arriving
  PTS: Object.freeze({ good: 40, warn: 20, danger: 10, collapse: 10, layer: 40, loss: 20 }),
  CARAVAN: Object.freeze({ every: 5, start: 3, ramp: 3 }),   // level 3 (85 s: 3 at the start + 17 more)
  C_HALF: 5,           // the middle zone: a square of 10 round the block's middle (its bounds the coder's; לכיוונון)
});
/** the zones in the fixed order that breaks every tie (spec: NE, NW, SE, SW, C) */
export const ZONES = Object.freeze(['NE', 'NW', 'SE', 'SW', 'C']);
/** neighbours: the middle touches the four corners; each corner the middle and the two corners beside it */
export const NB = Object.freeze({ NE: ['NW', 'SE', 'C'], NW: ['NE', 'SW', 'C'], SE: ['NE', 'SW', 'C'], SW: ['NW', 'SE', 'C'], C: ['NE', 'NW', 'SE', 'SW'] });
/** each wall and the two corner zones that touch it */
export const WALLS = Object.freeze({ N: ['NE', 'NW'], S: ['SE', 'SW'], E: ['NE', 'SE'], W: ['NW', 'SW'] });
const CORN = ['NE', 'NW', 'SE', 'SW'];
const ord = (z) => ZONES.indexOf(z);
/** the loads of each layer in order (level 1 fixed; 2 and 3 mixed inside each layer by this fixed table — rule 56: nothing drawn at play).
 *  Level 2's layers are each orders that can still close level from a level floor (a tub first never can: tested); level 3's begin
 *  with a tub three times, and the choice of the second sled is what lets them close level. */
export const ORDERS = Object.freeze({
  1: Object.freeze([1, 2, 3, 4, 5].map(() => Object.freeze(['big', 'tub', 'small', 'tub']))),
  2: Object.freeze([['small', 'big', 'tub', 'tub'], ['big', 'tub', 'tub', 'small'], ['big', 'small', 'tub', 'tub'], ['small', 'tub', 'big', 'tub'], ['small', 'big', 'tub', 'tub']].map((a) => Object.freeze(a))),
  3: Object.freeze([['tub', 'big', 'small', 'tub'], ['small', 'tub', 'big', 'tub'], ['tub', 'small', 'big', 'tub'], ['big', 'tub', 'tub', 'small'], ['tub', 'big', 'tub', 'small']].map((a) => Object.freeze(a))),
});

/** the zone under a point of the block's floor (null off the block) */
export function zoneAt(x, z) {
  const B = S9.block, [mx, mz] = S9.mid;
  if (x < B[0] || x > B[2] || z < B[1] || z > B[3]) return null;
  if (Math.abs(x - mx) <= FILL.C_HALF && Math.abs(z - mz) <= FILL.C_HALF) return 'C';
  return (z < mz ? 'N' : 'S') + (x > mx ? 'E' : 'W');
}
const copy = (h) => ({ NE: h.NE, NW: h.NW, SE: h.SE, SW: h.SW, C: h.C });
const mean = (h) => (h.NE + h.NW + h.SE + h.SW + h.C) / 5;

/** the mix flows (spec, step by step): the neighbour pair with the largest difference; over half a unit → half the excess over half
 *  goes from the high one to the low one; again — until no pair differs by more than half, or one unit (the tub's volume) has moved in
 *  all, or 20 steps. A tie: the pair whose high zone comes first in NE, NW, SE, SW, C, then whose low zone comes first.
 *  → { h, moves: [{ from, to, a }], moved, reach: { zone: units flowed in } } (h a new object) */
export function flow(h0) {
  const h = copy(h0), moves = [], reach = {};
  let moved = 0;
  for (let step = 0; step < FILL.FLOW_MAX; step++) {
    let best = null;
    for (const a of ZONES) for (const b of NB[a]) {
      const d = h[a] - h[b]; if (d <= EPS) continue;   // (each pair once, from its high side)
      if (!best || d > best.d + EPS || (Math.abs(d - best.d) <= EPS && (ord(a) < ord(best.a) || (a === best.a && ord(b) < ord(best.b))))) best = { a, b, d };
    }
    if (!best || best.d <= FILL.FLOW_OVER + EPS) break;
    let amt = (best.d - FILL.FLOW_OVER) / 2;
    if (moved + amt > FILL.FLOW_VOL) amt = FILL.FLOW_VOL - moved;
    if (amt <= EPS) break;
    h[best.a] -= amt; h[best.b] += amt; moved += amt;
    moves.push({ from: best.a, to: best.b, a: amt }); reach[best.b] = (reach[best.b] || 0) + amt;
    if (moved >= FILL.FLOW_VOL - EPS) break;
  }
  return { h, moves, moved, reach };
}
/** the middle standing more than 2 over the lowest corner: one unit slides to that corner (a tie: the fixed order). → { h, to } | null */
export function collapse(h0) {
  let low = null; for (const z of CORN) if (low == null || h0[z] < h0[low] - EPS) low = z;
  if (h0.C - h0[low] <= FILL.COLLAPSE + EPS) return null;
  const h = copy(h0); h.C -= 1; h[low] += 1; return { h, to: low };
}
/** the four gauges: for each wall, the higher of the two corners touching it less the mean height of all five zones */
export function gauges(h) { const m = mean(h), g = {}; for (const [w, [a, b]] of Object.entries(WALLS)) g[w] = Math.max(h[a], h[b]) - m; return g; }
/** a gauge's band (level 1 lenient): 'good' up to 1 inclusive, 'warn' over 1 up to 2 inclusive, 'danger' over 2 */
export function band(g, lv = 2) { const T = lv === 1 ? FILL.GAUGE_L1 : FILL.GAUGE; return g <= T.good + EPS ? 'good' : g <= T.warn + EPS ? 'warn' : 'danger'; }
export const bandPts = (b) => FILL.PTS[b] || 0;
const worstOf = (g, lv) => { let w = null; for (const k of ['N', 'S', 'E', 'W']) if (!w || g[k] > g[w] + EPS) w = k; return { wall: w, g: g[w], band: band(g[w], lv) }; };

/* ═════════════ the work ═════════════
 * S = { lv, h, last: { zone: 'stone' | 'mix' | null }, pockets: [{ zone, layer, mended }], layer (1…5), inLayer (0…3), queue: [{ kind,
 *       layer, i }], next (the queue's next index to come), ramp: [queue items on the ramp], t, arriveT, waiting, danger: { N…W: secs },
 *       bulged: { N…W }, free (the first load still to come), grace (the free load's standing: no clocks till the next), pts, dmg, flat (layers raked level), loads: [{ kind, zone, pts, band, wall,
 *       g, collapse, pocket, flow }], flaws: [{ f, zone?, wall?, n? }] (the act hands each to M.flaw), done, streakBreaks, n } */
export function fresh(lv = 2) {
  const L = Math.max(1, Math.min(3, lv | 0 || 2)), O = ORDERS[L], queue = [];
  O.forEach((layer, li) => layer.forEach((kind, i) => queue.push({ kind, layer: li + 1, i: queue.length })));
  const S = { lv: L, h: { NE: 0, NW: 0, SE: 0, SW: 0, C: 0 }, last: { NE: null, NW: null, SE: null, SW: null, C: null }, pockets: [], layer: 1, inLayer: 0,
    queue, next: 0, ramp: [], t: 0, arriveT: 0, waiting: 0, danger: { N: 0, S: 0, E: 0, W: 0 }, bulged: { N: 0, S: 0, E: 0, W: 0 }, free: 1, grace: 0, pts: 0, dmg: 0, flat: 0,
    loads: [], flaws: [], done: 0, streakBreaks: 0, n: 0 };
  const n0 = L === 3 ? FILL.CARAVAN.start : FILL.CARAVAN.ramp;
  for (let i = 0; i < n0 && S.next < queue.length; i++) S.ramp.push(queue[S.next++]);
  S.arriveT = FILL.CARAVAN.every;
  return S;
}
/** the sleds on the ramp now (their kinds, in order: the first is the one the oxen bring up next) */
export const onRamp = (S) => S.ramp.map((q) => q.kind);
/** may sled i be taken: the first always; level 3 the second too, when it is of the layer being laid (so every layer stays 2+1+1+1) */
export function canTake(S, i) {
  if (S.done || !S.ramp[i]) return false;
  if (i === 0) return true;
  return S.lv === 3 && i === 1 && S.ramp[1].layer === S.layer;
}
/** a sled's load set down on a zone (the act calls it when the load has landed). → the event: { kind, zone, pts, band, wall, g, collapse,
 *  pocket, mended, flow, layer: { n, flat, bonus, off: [{ zone, d }], lost: [{ zone, f }] } | null, flaws: [...new], streak: 'keep' |
 *  'break', free } */
export function take(S, i, zone) {
  if (!canTake(S, i) || !ZONES.includes(zone)) return null;
  const item = S.ramp.splice(i, 1)[0], kind = item.kind, free = !!S.free, nf0 = S.flaws.length;
  S.free = 0; S.grace = free ? 1 : 0; S.n++;
  const ev = { kind, zone, pts: 0, band: 'good', wall: null, g: 0, collapse: null, pocket: false, mended: false, flow: null, layer: null, flaws: [], streak: 'keep', free };
  // the weak pocket: a basket on a zone whose last load was stones, with no mix since
  if (kind !== 'tub') {
    if (S.last[zone] === 'stone') { S.pockets.push({ zone, layer: S.layer, mended: 0 }); ev.pocket = true; }
    S.last[zone] = 'stone';
    S.h[zone] += FILL.UNITS[kind];
  } else {
    S.h[zone] += FILL.UNITS.tub; S.last[zone] = 'mix';
    for (const p of S.pockets) if (p.zone === zone && !p.mended && p.layer === S.layer) { p.mended = 1; ev.mended = true; }
    const F = flow(S.h); S.h = F.h; ev.flow = F;
    for (const [z, a] of Object.entries(F.reach)) if (a >= FILL.POCKET_MIX - EPS) S.last[z] = 'mix';
  }
  // the middle's collapse (after the flow), then the gauges read again
  const C = collapse(S.h); if (C) { S.h = C.h; ev.collapse = C.to; }
  const W = worstOf(gauges(S.h), S.lv); ev.wall = W.wall; ev.g = W.g; ev.band = W.band;
  let pts = bandPts(W.band);
  if (ev.collapse) { pts = Math.min(pts, FILL.PTS.collapse); ev.streak = 'break'; }
  else if (W.band !== 'good') ev.streak = 'break';
  // the free trial: the first load is never counted against (no bulge from it, the streak kept, at least the warn band's points)
  if (free) { pts = Math.max(pts, FILL.PTS.warn); ev.streak = 'keep'; for (const k of Object.keys(S.danger)) S.danger[k] = 0; }
  ev.pts = pts; S.pts += pts;
  S.loads.push({ kind, zone, pts, band: W.band, wall: W.wall, g: +W.g.toFixed(3), collapse: ev.collapse, pocket: ev.pocket, free });
  // the layer closes after its fourth load, always
  S.inLayer++;
  if (S.inLayer >= FILL.PER_LAYER) ev.layer = closeLayer(S);
  if (S.layer > FILL.LAYERS) S.done = 1;
  // (levels 1 and 2: the ramp is never empty — the next sled comes up at once; level 3 keeps its caravan's clock)
  if (S.lv !== 3) while (S.ramp.length < FILL.CARAVAN.ramp && S.next < S.queue.length) S.ramp.push(S.queue[S.next++]);
  ev.flaws = S.flaws.slice(nf0);
  return ev;
}
function closeLayer(S) {
  const L = S.layer, out = { n: L, flat: false, bonus: 0, off: [], lost: [] };
  // the pockets of this layer not mended: a corner's a nest, the middle's a dent in the top (−20 each)
  for (const p of S.pockets) if (p.layer === L && !p.mended) {
    const f = p.zone === 'C' ? 'fill.dent' : 'fill.nest';
    S.flaws.push({ f, zone: p.zone }); S.dmg++; S.pts -= FILL.PTS.loss; out.lost.push({ zone: p.zone, f });
  }
  // level within a quarter unit → the rakes, +40; else a dent or a bump stays (its biggest one is kept, 0 points)
  for (const z of ZONES) { const d = S.h[z] - L; if (Math.abs(d) > FILL.LAYER_TOL + EPS) out.off.push({ zone: z, d: +d.toFixed(4) }); }
  if (!out.off.length) { out.flat = true; out.bonus = FILL.PTS.layer; S.pts += out.bonus; S.flat++; for (const z of ZONES) S.h[z] = L; }
  else { const w = out.off.slice().sort((a, b) => Math.abs(b.d) - Math.abs(a.d) || ord(a.zone) - ord(b.zone))[0]; S.flaws.push({ f: 'fill.uneven', zone: w.zone, n: w.d > 0 ? 1 : 0, layer: L }); }
  S.layer++; S.inLayer = 0;
  return out;
}
/** time passes: the danger clocks of the gauges (a board bulges after two seconds running in danger, once, for good: −20), and level
 *  3's caravan (a sled every five seconds; a full ramp keeps the oxen waiting: the streak breaks once a wait, no damage). → events */
export function tick(S, dt) {
  const out = []; if (S.done) return out;
  S.t += dt;
  if (!S.free && !S.grace) {   // (not before the first load, nor while what the free trial left stands: the next load starts the clocks)
    const g = gauges(S.h);
    for (const w of ['N', 'S', 'E', 'W']) {
      if (S.bulged[w]) continue;
      if (band(g[w], S.lv) === 'danger') { S.danger[w] += dt; if (S.danger[w] >= FILL.BULGE_S - EPS) { S.bulged[w] = 1; S.dmg++; S.pts -= FILL.PTS.loss; const fl = { f: 'fill.bulge', wall: w }; S.flaws.push(fl); out.push({ bulge: w, flaw: fl }); } }
      else S.danger[w] = 0;
    }
  }
  if (S.lv === 3 && S.next < S.queue.length) {
    S.arriveT -= dt;
    while (S.arriveT <= EPS && S.next < S.queue.length) {
      if (S.ramp.length >= FILL.CARAVAN.ramp) { if (!S.waiting) { S.waiting = 1; S.streakBreaks++; out.push({ wait: true }); } S.arriveT = 0; break; }
      S.ramp.push(S.queue[S.next++]); S.waiting = 0; S.arriveT += FILL.CARAVAN.every; out.push({ arrive: S.ramp[S.ramp.length - 1].kind });
    }
  }
  return out;
}
/** the most the work can make: 20 loads at 40 and five layers' bonus */
export const MAX_PTS = 20 * FILL.PTS.good + FILL.LAYERS * FILL.PTS.layer;
/** the work's result: its points (never below zero), q of the most, stars; perfect: five layers raked level and no damage */
export function result(S) {
  const pts = Math.max(0, S.pts), q = Math.min(1, pts / MAX_PTS), perfect = S.flat === FILL.LAYERS && !S.dmg;
  return { pts, q: +q.toFixed(3), stars: perfect ? 3 : starsOf(q), perfect,
    flags: { loads: S.loads.length, flat: S.flat, dmg: S.dmg, bulge: Object.values(S.bulged).filter(Boolean).length, nest: S.flaws.filter((f) => f.f === 'fill.nest').length, dent: S.flaws.filter((f) => f.f === 'fill.dent').length, collapse: S.loads.filter((l) => l.collapse).length } };
}
/** the work's blob for the save (a reload begins it again where it was) */
export const save = (S) => JSON.parse(JSON.stringify(S));
export function load(o) { if (!o || !o.h || !Array.isArray(o.queue)) return null; return JSON.parse(JSON.stringify(o)); }

/** what the screen does with a load, so the screen and the rules agree on the streak (as stage 08 and the one scoring system have it: a
 *  20-point step is not gold and ends the gold run, silently): a load in the good band is the director's gold hit (the run goes on); a
 *  20 or a 10 is a 'good' / 'ok' hit (the run ends, as the rules' streak 'break'); the free trial's load that is not gold is no hit at
 *  all but its points as a bonus with its word — the run neither grows nor ends, as the rules' 'keep'. → { grade | null, bonus } */
export function screenOf(ev) {
  const grade = ev.pts >= FILL.PTS.good ? 'gold' : ev.pts >= FILL.PTS.warn ? 'good' : 'ok';
  if (ev.free && grade !== 'gold') return { grade: null, bonus: ev.pts };
  return { grade, bonus: 0 };
}

/* ───────── the hint: the best next sled and zone (the hint hand of the free trial and of level 1; the bot reads it too) ───────── */
const slim = (S) => ({ lv: S.lv, h: { ...S.h }, last: { ...S.last }, pockets: S.pockets.map((p) => ({ ...p })), layer: S.layer, inLayer: S.inLayer, queue: S.queue,
  next: S.next, ramp: S.ramp.slice(), t: 0, arriveT: 0, waiting: 0, danger: { N: 0, S: 0, E: 0, W: 0 }, bulged: { ...S.bulged }, free: S.free, grace: 0, pts: S.pts,
  dmg: S.dmg, flat: S.flat, loads: [], flaws: [], done: S.done, streakBreaks: 0, n: S.n });
/** a search of the loads left in this layer (every sled that may be taken, every zone): the first step of the best line — points less a
 *  hundred for each damage — or null when nothing may be taken. → { i, zone, kind, pts } | { wait: true }
 *  Level 3 searches the ramp as it is, with one more move: wait for the caravan's next sled (while the ramp has room and no gauge is in
 *  danger). (Build 132, integration round: the search had refilled the ramp as if the caravan kept pace, so its line counted on a second
 *  sled that a quick player did not have yet — live, the layers did not close level. Now, when the level line needs the next sled, the
 *  hint says wait; a line that needs no wait is taken first.) */
export function advise(S) {
  if (S.done || !S.ramp.length) return null;
  let best = null;
  const canWait = (T) => T.lv === 3 && T.ramp.length < FILL.CARAVAN.ramp && T.next < T.queue.length && !Object.values(gauges(T.h)).some((g) => band(g, T.lv) === 'danger');
  const rec = (T, d, first, waits) => {
    if (d === 0 || T.done || (first && T.inLayer === 0 && d < FILL.PER_LAYER - S.inLayer)) { const sc = T.pts - T.dmg * 100 - waits * 1e-3; if (!best || sc > best.sc + EPS) best = { sc, ...first }; return; }
    for (const i of [0, 1]) for (const z of ZONES) {
      if (!canTake(T, i)) continue;
      const U = slim(T); const kind = U.ramp[i].kind, ev = take(U, i, z);
      rec(U, d - 1, first || { i, zone: z, kind, pts: ev.pts }, waits);
    }
    if (canWait(T) && waits < FILL.CARAVAN.ramp) { const U = slim(T); U.ramp.push(U.queue[U.next++]); rec(U, d, first || { wait: true }, waits + 1); }
  };
  rec(S, FILL.PER_LAYER - S.inLayer, null, 0);
  if (!best) return null;
  return best.wait ? { wait: true } : { i: best.i, zone: best.zone, kind: best.kind, pts: best.pts };
}
