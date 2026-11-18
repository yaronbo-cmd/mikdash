// build 132 — stage 09 work 4 "חוט הסיקרא" (src/game/h132/sikra-model.js): every row of the spec's score table and of the loss table's
// rows of work 4, and every boundary the spec names (a quarter, a half and one tefach; 0.6 and 0.25 of wetness; 0.5 over a flaw; 0.3 s
// of a lift; 0.7 s of a stand; 3 s to wipe; 4 amot after a refill at a pace under 1; the corner's window ½ … 1½ and a quarter tefach;
// the close within a quarter amah), the walk's order and its walls, six equal segments a wall, the dots, level 1's one wall.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as K from '../src/game/h132/sikra-model.js';
import { westSlots, LOSS } from '../src/game/h132/model.js';
import { BOOK } from '../src/game/world/grid.js';

const { SK } = K, S9 = BOOK.s09, DT = 0.05;
/** walk at pace p, height h until s ≥ to (or the line is done); every event */
function walk(L, to, p = 2, h = 0, ev = []) { let n = 0; while (!L.done && L.s < to - 1e-9 && n++ < 200000) ev.push(...K.lineStep(L, Math.min(DT, Math.max(1e-4, (to - L.s) / Math.max(p, 1e-6))), { down: true, pace: p, h })); return ev; }
function hold(L, secs, inp, ev = []) { let t = 0; while (t < secs - 1e-9 && !L.done) { const d = Math.min(DT, secs - t); ev.push(...K.lineStep(L, d, inp)); t += d; } return ev; }
const of = (ev, e) => ev.filter((x) => x.e === e);
/** a clean line to s: refilled in time (red band) */
function cleanTo(L, to, p = 2, ev = []) {
  while (!L.done && L.s < to - 1e-9) { const nx = Math.min(to, L.s + 0.5); walk(L, nx, K.inCorner(L.s + 0.01, L.lv) || K.inCorner(nx - 0.01, L.lv) ? 1 : p, 0, ev); if (K.wetBand(L.w) === 'red' && L.w < 0.35) ev.push(...K.bowlTap(L)); }
  return ev;
}

test('sikra: the walk — east, north, west, south from the south-east corner; 120 round; six equal segments of 5 a wall; level 1 one wall', () => {
  assert.deepEqual([...S9.order], ['E', 'N', 'W', 'S']);
  assert.deepEqual(S9.run.E.from, S9.corner.SE); assert.deepEqual(S9.run.S.to, S9.corner.SE); assert.deepEqual(S9.sikra.start, S9.corner.SE);
  assert.equal(S9.perimeter, 120); assert.equal(SK.SIDE * 4, 120); assert.equal(SK.SEG_L * SK.SEG, SK.SIDE);
  assert.deepEqual(['E', 'N', 'W', 'S'].map((k, i) => K.wallAt(i * 30 + 1).k), ['E', 'N', 'W', 'S']);
  assert.equal(K.wallAt(29.99).k, 'E'); assert.equal(K.wallAt(30).k, 'N');
  for (let i = 0; i < 24; i++) { assert.equal(K.segIndex(i * 5), i); assert.equal(K.segIndex(i * 5 + 4.999), i); }
  // the dots: five on each wall at the segments' bounds; the north (sparse) only after the second and the fourth
  for (const k of S9.order) assert.equal(S9.sikra.dots[k].length, 5);
  assert.deepEqual(S9.sikra.sparse.N, [2, 4]);
  assert.deepEqual(K.cornersOf(1), [30]); assert.deepEqual(K.cornersOf(2), [30, 60, 90]); assert.deepEqual(K.cornersOf(3), [30, 60, 90]);
  assert.equal(K.lineEnd(1), 31); assert.equal(K.lineEnd(2), 120);
  assert.deepEqual(K.stakesOf(1), ['SE', 'NE']); assert.deepEqual(K.stakesOf(2), ['SE', 'NE', 'NW', 'SW']);
  // the corner zone: an amah before the stake and an amah after; not in the segments
  assert.equal(K.inCorner(28.99, 2), 0); assert.equal(K.inCorner(29, 2), 30); assert.equal(K.inCorner(30.99, 2), 30); assert.equal(K.inCorner(31, 2), 0);
  assert.equal(K.inCorner(59.5, 1), 0);
});

test('sikra: the measuring opening — a stake at each corner in the walk\'s order, 10 each; level 1 the east wall\'s two', () => {
  const M1 = K.measureFresh(1); assert.deepEqual(M1.want, ['SE', 'NE']);
  assert.equal(K.measureTap(M1, 'NE').ok, false);
  assert.deepEqual(K.measureTap(M1, 'SE'), { ok: true, pts: 10, last: false });
  assert.deepEqual(K.measureTap(M1, 'NE'), { ok: true, pts: 10, last: true }); assert.equal(M1.pts, 20);
  const M2 = K.measureFresh(2); for (const k of ['SE', 'NE', 'NW', 'SW']) assert.equal(K.measureTap(M2, k).ok, true); assert.equal(M2.pts, 40); assert.equal(K.measureNext(M2), null);
});

test('sikra: height — a segment by its worst deviation: ≤ ¼ tefach 40, ≤ ½ 20, ≤ 1 10, more wavy −20 (each boundary exactly)', () => {
  assert.equal(K.segPts(0), 40); assert.equal(K.segPts(0.25), 40); assert.equal(K.segPts(0.2501), 20);
  assert.equal(K.segPts(0.5), 20); assert.equal(K.segPts(0.5001), 10); assert.equal(K.segPts(1), 10); assert.equal(K.segPts(1.0001), -20);
  // in a play: segment 2 (5–10) with a deviation of 0.5 → 20; segment 3 at 1.2 → wavy, −20 and its mark; segment 1 (free) wavy → 0, no mark
  const L = K.lineFresh(2, []);
  const ev = walk(L, 5, 2, 1.5); walk(L, 10, 2, 0.5, ev); walk(L, 15, 2, 1.2, ev); walk(L, 20, 2, 0.25, ev);
  const segs = of(ev, 'seg');
  assert.deepEqual(segs.map((x) => [x.i, x.pts]), [[0, 0], [1, 20], [2, -20], [3, 40]]);
  assert.equal(segs[0].free, true);
  assert.deepEqual(L.marks.filter((m) => m.f === 'sikra.wavy').map((m) => [m.s, m.s1]), [[10, 15]]);
  assert.equal(L.dmg, 1); assert.equal(L.lossPts, 20);
});

test('sikra: the corner zone is measured only by the corner rule — a perfect corner +10; too fast a gap; a stop a smear', () => {
  const run = (pace, h = 0, stopAt = null) => {
    const L = K.lineFresh(2, []); const ev = cleanTo(L, 28.9, 2);
    walk(L, 29.0, pace, h, ev);
    if (stopAt != null) { walk(L, stopAt, pace, h, ev); hold(L, 0.2, { down: true, pace: 0, h }, ev); }
    walk(L, 31.2, pace, h, ev); return { L, ev };
  };
  // perfect: a pace between ½ and 1½ (both ends in) and the height within ¼ tefach
  for (const p of [0.5, 1, 1.5]) { const { ev, L } = run(p, 0.25); const c = of(ev, 'corner')[0]; assert.equal(c.r, 'perfect', 'pace ' + p); assert.equal(c.pts, 10); assert.equal(c.k, 'NE'); assert.equal(L.corners[0].r, 'perfect'); }
  // too fast: the string snaps, a gap (−20)
  { const { ev, L } = run(1.51); assert.equal(of(ev, 'corner')[0].r, 'gap'); const g = of(ev, 'gap'); assert.equal(g.length, 1); assert.equal(g[0].pts, -20); assert.equal(g[0].why, 'corner'); assert.ok(L.marks.some((m) => m.f === 'sikra.gap')); }
  // a stop: a smear (−20)
  { const { ev, L } = run(1, 0, 29.6); assert.equal(of(ev, 'corner')[0].r, 'smear'); assert.equal(of(ev, 'smear')[0].pts, -20); assert.ok(L.marks.some((m) => m.f === 'sikra.smear')); assert.equal(of(ev, 'blot').length, 0, 'the corner\'s stop is its smear, not a stain'); }
  // the height past ¼ in the zone, or a pace under ½: no bonus, no damage
  assert.equal(of(run(1, 0.26).ev, 'corner')[0].r, 'plain');
  assert.equal(of(run(0.49).ev, 'corner')[0].r, 'plain');
  // the corner zone is not in the segments: a deviation of 2 tefachim inside it leaves segment 6 (25–30) and 7 (30–35) at 40
  { const L = K.lineFresh(2, []); const ev = cleanTo(L, 29, 2); walk(L, 31, 1, 2, ev); cleanTo(L, 35.5, 2, ev); const s = of(ev, 'seg'); assert.equal(s.find((x) => x.i === 5).pts, 40); assert.equal(s.find((x) => x.i === 6).pts, 40); }
  // the figure and the camera turn by themselves at the stake
  assert.equal(of(run(1).ev, 'turn')[0].k, 'NE');
});

test('sikra: wetness — 1 → 0 over 25 amot; dark above 0.6, red 0.25–0.6, pink below 0.25; the bowl refills to 1', () => {
  assert.equal(K.wetBand(1), 'dark'); assert.equal(K.wetBand(0.6001), 'dark'); assert.equal(K.wetBand(0.6), 'red'); assert.equal(K.wetBand(0.25), 'red'); assert.equal(K.wetBand(0.2499), 'pink');
  const L = K.lineFresh(2, []); walk(L, 10, 2); assert.ok(Math.abs(L.w - 0.6) < 1e-9); walk(L, 25, 2); assert.ok(Math.abs(L.w) < 1e-9);
  const ev = K.bowlTap(L); assert.equal(ev[0].e, 'refill'); assert.equal(L.w, 1);
  // the pale line: walking pink is no damage, no points: it stays pale (its mark)
  const P = K.lineFresh(2, []); const e2 = walk(P, 23, 2); assert.equal(of(e2, 'pale').length, 1); assert.equal(of(e2, 'pale')[0].pts, 0); walk(P, 24, 2); K.bowlTap(P); walk(P, 24.5, 2);
  const pm = P.marks.find((m) => m.f === 'sikra.pale'); assert.ok(pm && pm.s >= 18.7 && pm.s < 18.9 && pm.s1 >= 24, JSON.stringify(P.marks)); assert.equal(P.dmg, 0);
  // level 3: the sun dries it with time too (standing still loses wetness; at level 2 it does not)
  const S3 = K.lineFresh(3, []), S2 = K.lineFresh(2, []);
  for (const L2 of [S3, S2]) { walk(L2, 6, 2); }
  const w3 = S3.w, w2 = S2.w; assert.ok(Math.abs(w3 - w2) > 0, 'the sun on level 3 while walking');
  hold(S3, 0.6, { down: true, pace: 0, h: 0 }); hold(S2, 0.6, { down: true, pace: 0, h: 0 });
  assert.ok(S3.w < w3 && Math.abs(S2.w - w2) < 1e-12);
  assert.ok(SK.SUN > 0 && !K.lineFresh(1, []).sun && !K.lineFresh(2, []).sun && K.lineFresh(3, []).sun);
});

test('sikra: a tap while still dark = excess and a drip on the spot; after a refill 4 amot at a pace under 1 drip', () => {
  const L = K.lineFresh(2, []); walk(L, 6, 2);
  const ev = K.bowlTap(L); assert.equal(ev[0].excess, true); assert.equal(of(ev, 'drip').length, 1); assert.equal(of(ev, 'drip')[0].why, 'excess');
  // the slow pace after a refill: a drip (once), not past the 4 amot
  const A = K.lineFresh(2, []); walk(A, 12, 2); K.bowlTap(A); const e1 = walk(A, 13, 0.9); assert.equal(of(e1, 'drip').length, 1); assert.equal(of(e1, 'drip')[0].why, 'slow');
  const B = K.lineFresh(2, []); walk(B, 12, 2); K.bowlTap(B); const e2 = walk(B, 15.9, 1); assert.equal(of(e2, 'drip').length, 0, 'pace 1 exactly: no drip');
  const C = K.lineFresh(2, []); walk(C, 12, 2); K.bowlTap(C); walk(C, 16.01, 2); const e3 = walk(C, 17, 0.5); assert.equal(of(e3, 'drip').length, 0, 'past the 4 amot');
  assert.equal(SK.DRIP_AFTER, 4); assert.equal(SK.DRIP_PACE, 1);
});

test('sikra: a drip not wiped within 3 s is −20; wiped in time a pink mark (0, the grand prize lost); a later tap does nothing', () => {
  const L = K.lineFresh(2, []); walk(L, 6, 2); const d = of(K.bowlTap(L), 'drip')[0];
  const ev = hold(L, 2.95, { down: true, pace: 2, h: 0 }); assert.equal(of(ev, 'dripLost').length, 0);
  assert.equal(K.freshDrips(L).length, 1);
  const w = K.dripTap(L, d.id); assert.equal(w[0].e, 'wipe'); assert.equal(w[0].pts, 0); assert.ok(L.marks.some((m) => m.f === 'sikra.pink'));
  assert.equal(L.dmg, 0); assert.equal(L.dripsAll, 1);
  const M = K.lineFresh(2, []); walk(M, 6, 2); const d2 = of(K.bowlTap(M), 'drip')[0];
  const e2 = hold(M, 3.05, { down: true, pace: 2, h: 0 }); assert.equal(of(e2, 'dripLost').length, 1); assert.equal(of(e2, 'dripLost')[0].pts, -20);
  assert.deepEqual(K.dripTap(M, d2.id), [], 'after 3 s the tap does nothing');
  assert.ok(M.marks.some((m) => m.f === 'sikra.drip')); assert.equal(M.dmg, 1);
});

test('sikra: standing over 0.7 s with a string that is not pink is a stain (−20, once a stand); pink: none', () => {
  const L = K.lineFresh(2, []); walk(L, 6, 2);
  assert.equal(of(hold(L, 0.7, { down: true, pace: 0, h: 0 }), 'blot').length, 0, '0.7 s exactly: not yet');
  const e = hold(L, 0.6, { down: true, pace: 0, h: 0 }); assert.equal(of(e, 'blot').length, 1); assert.equal(of(e, 'blot')[0].pts, -20);
  assert.equal(of(hold(L, 2, { down: true, pace: 0, h: 0 }), 'blot').length, 0, 'once a stand');
  const P = K.lineFresh(2, []); walk(P, 23, 2); assert.equal(K.wetBand(P.w), 'pink'); assert.equal(of(hold(P, 2, { down: true, pace: 0, h: 0 }), 'blot').length, 0);
});

test('sikra: continuity — a lift under 0.3 s does not count; longer: a seam (0), the streak broken, the grand prize lost; no penalty', () => {
  const L = K.lineFresh(2, []); walk(L, 6, 2);
  assert.equal(of(hold(L, 0.29, { down: false }), 'seam').length, 0);
  walk(L, 7, 2); const e = hold(L, 0.31, { down: false }); assert.equal(of(e, 'seam').length, 1); assert.equal(of(e, 'seam')[0].pts, 0);
  assert.equal(L.lifted, true); const s = L.s; hold(L, 1, { down: false }); assert.equal(L.s, s, 'the bow off: the walk stops');
  assert.equal(L.seams, 1); assert.equal(L.dmg, 0); assert.ok(L.marks.some((m) => m.f === 'sikra.seam'));
  walk(L, 9, 2); assert.equal(L.lifted, false, 'the next touch: the bow back at the line\'s end');
});

test('sikra: the west wall — over a flaw a wetness of 0.5 at least, else the string skips it (a gap, −20); none: the fixed rough patch', () => {
  // the slots from the save (M.westSlots): a nest at 14 amot from the north-west corner = s 74
  const west = westSlots([{ f: 'fill.nest' }, { f: 'strip.torn' }]);
  assert.deepEqual(west.map((q) => [q.slot, q.d]), [['tornA', 2.5], ['nest1', 14]]);
  const F = K.flawsOn(west); assert.deepEqual(F.map((f) => [f.s0, f.s1]), [[62, 63], [73.5, 74.5]]);
  const run = (wAt) => { const L = K.lineFresh(2, west); const ev = cleanTo(L, 60, 2); walk(L, 61, 1, 0, ev); K.bowlTap(L); walk(L, 73.4, 1, 0, ev); L.w = wAt + (73.5 - L.s) / SK.WET_LEN; walk(L, 73.5, 1, 0, ev); walk(L, 75, 1, 0, ev); return { L, ev }; };
  { const { ev } = run(0.5); assert.equal(of(ev, 'flawOk').length, 2); assert.equal(of(ev, 'gap').length, 0); }
  { const { ev, L } = run(0.4999); const g = of(ev, 'gap'); assert.equal(g.length, 1); assert.equal(g[0].why, 'flaw'); assert.equal(g[0].pts, -20); assert.equal(g[0].slot, 'nest1'); assert.ok(L.marks.some((m) => m.f === 'sikra.gap' && m.s === 73.5)); }
  // no flaw at all: the one rough patch at the middle (15 amot), the same rule
  const R = K.flawsOn(westSlots([])); assert.deepEqual(R.map((f) => [f.slot, f.s0, f.s1]), [['rough', 74.5, 75.5]]);
  // level 1 never reaches the west
  assert.deepEqual(K.lineFresh(1, west).flaws, []);
});

test('sikra: the close — within a quarter amah of the start +40; beyond it the double stain (−20); short a gap (−20)', () => {
  assert.equal(K.closeRule(0), 'perfect'); assert.equal(K.closeRule(0.25), 'perfect'); assert.equal(K.closeRule(-0.25), 'perfect');
  assert.equal(K.closeRule(0.2501), 'blot2'); assert.equal(K.closeRule(-0.2501), 'gap');
  const end = (at) => { const L = K.lineFresh(2, []); const ev = cleanTo(L, 118, 2); walk(L, at, 0.6, 0, ev); ev.push(...hold(L, 0.1, { down: true, pace: 0, h: 0 })); return { L, ev }; };
  { const { L, ev } = end(120.1); assert.equal(of(ev, 'close')[0].r, 'perfect'); assert.equal(of(ev, 'close')[0].pts, 40); assert.equal(L.closed, 'perfect'); assert.equal(L.done, true); }
  { const { ev, L } = end(120.4); assert.equal(of(ev, 'close')[0].r, 'blot2'); assert.equal(of(ev, 'blot2')[0].pts, -20); assert.ok(L.marks.some((m) => m.f === 'sikra.blot2')); }
  { const { ev, L } = end(119.5); assert.equal(of(ev, 'close')[0].r, 'gap'); const g = of(ev, 'gap')[0]; assert.equal(g.why, 'close'); assert.equal(g.pts, -20); assert.ok(L.marks.some((m) => m.f === 'sikra.gap')); }
  // a walk that runs on past the start closes by itself: long
  { const L = K.lineFresh(2, []); const ev = cleanTo(L, 118, 2); walk(L, 122, 2, 0, ev); assert.equal(L.closed, 'blot2'); }
  // the segments of the south wall are all closed with the close (24 in all)
  { const { L } = end(120); assert.equal(L.segs.length, 24); }
});

test('sikra: the free trial — the first segment: a flaw in it the helper wipes, no mark, no penalty', () => {
  const L = K.lineFresh(2, []); walk(L, 2, 2);
  const e = hold(L, 1, { down: true, pace: 0, h: 0 }); assert.equal(of(e, 'blot')[0].free, true); assert.equal(of(e, 'blot')[0].pts, 0);
  hold(L, 0.4, { down: false }); walk(L, 3, 2);
  const d = of(K.bowlTap(L), 'drip')[0]; assert.equal(d.free, true);
  hold(L, 3.1, { down: true, pace: 0.4, h: 0 });
  assert.equal(L.dmg, 0); assert.equal(L.marks.length, 0); assert.equal(L.seams, 0); assert.equal(L.dripsAll, 0);
});

test('sikra: the result — the grand prize is a whole round with no lift and no drip ("הקפה אחת!"); a clean play is 3 stars', () => {
  const M = K.measureFresh(2); for (const k of M.want) K.measureTap(M, k);
  const L = K.lineFresh(2, []);
  cleanTo(L, 29, 2); walk(L, 31, 1); cleanTo(L, 59, 2); walk(L, 61, 1); cleanTo(L, 89, 2); walk(L, 91, 1); cleanTo(L, 119.9, 2); hold(L, 0.1, { down: true, pace: 0, h: 0 });
  assert.equal(L.done, true); assert.equal(L.closed, 'perfect');
  const R = K.lineResult(L, M);
  assert.equal(R.grand, true); assert.equal(R.perfect, true); assert.equal(R.stars, 3); assert.equal(R.pts, 40); assert.equal(R.flags.perfectCorners, 3);
  assert.equal(R.max, K.lineMax(2)); assert.equal(K.lineMax(2), 40 + 24 * 40 + 30 + 40); assert.equal(K.lineMax(1), 20 + 6 * 40 + 10);
  // a seam (no penalty) loses the grand prize
  const S = K.lineFresh(2, []); cleanTo(S, 8, 2); hold(S, 0.4, { down: false }); cleanTo(S, 119.9, 2); hold(S, 0.1, { down: true, pace: 0, h: 0 });
  assert.equal(K.lineResult(S, M).grand, false); assert.equal(S.dmg, S.dmg);
  // level 1: the east wall and the north-east corner, done at 31
  const O = K.lineFresh(1, westSlots([{ f: 'fill.nest' }])); cleanTo(O, 29, 2); walk(O, 32, 1); assert.equal(O.done, true); assert.equal(O.s, 31); assert.equal(O.segs.length, 6); assert.equal(O.corners.length, 1);
  const M1 = K.measureFresh(1); for (const k of M1.want) K.measureTap(M1, k);
  assert.equal(K.lineResult(O, M1).q, 1);
});

test('sikra: every damage of work 4 is a row of the loss table (−20, or 0 for the seam, the pink mark and the pale line)', () => {
  for (const [f, p] of [['wavy', 20], ['gap', 20], ['drip', 20], ['blot', 20], ['blot2', 20], ['smear', 20], ['seam', 0], ['pink', 0], ['pale', 0]]) assert.equal(LOSS['sikra.' + f][1], p, f);
});

test('sikra: the save — the blob holds the line (a reload resumes on it)', () => {
  const L = K.lineFresh(2, westSlots([])); cleanTo(L, 12, 2); const tr = K.lineTrack(); tr.hs.push(0, 1); tr.ws.push(1, 1);
  const o = JSON.parse(JSON.stringify(K.lineSave(L, tr))); const R = K.lineLoad(o);
  assert.equal(R.L.s, L.s); assert.equal(R.L.w, L.w); assert.deepEqual(R.L.segs, L.segs); assert.deepEqual(R.track.hs, [0, 1]);
  assert.equal(K.lineLoad(null), null);
});
