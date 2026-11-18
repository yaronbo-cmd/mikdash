// build 132 — work 2 "fill" (src/game/h132/fill-model.js): every row of the spec's score and loss tables, the flow step by step with
// the fixed tie order, the collapse, the gauges exactly at 1 and 2, the quarter-unit layer rule, the weak pockets, level 1's lenient
// thresholds, level 3's caravan, the free trial, the result and the save.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as F from '../src/game/h132/fill-model.js';
import { LOSS as FLAWS } from '../src/game/h132/model.js';
import { BOOK } from '../src/game/world/grid.js';

const { FILL } = F;
const H = (o = {}) => ({ NE: 0, NW: 0, SE: 0, SW: 0, C: 0, ...o });
const close = (a, b, m = '') => assert.ok(Math.abs(a - b) < 1e-9, `${m} ${a} ≠ ${b}`);
/** a level-2 work past its free trial, with the heights given, and the next sled of the kind given */
function at(h, kind, o = {}) { const S = F.fresh(o.lv || 2); S.free = 0; S.h = H(h); if (o.inLayer != null) S.inLayer = o.inLayer; S.ramp = [{ kind, layer: S.layer, i: -1 }]; return S; }
const put = (S, kind) => { S.ramp.unshift({ kind, layer: S.layer, i: -1 }); };

test('the numbers: the units, the five zones in the tie order, the neighbours, the walls; the zones on the floor from the book', () => {
  assert.deepEqual({ ...FILL.UNITS }, { big: 2, small: 1, tub: 1 });
  assert.deepEqual([...F.ZONES], ['NE', 'NW', 'SE', 'SW', 'C']);
  assert.deepEqual(F.NB.C, ['NE', 'NW', 'SE', 'SW']);
  for (const z of ['NE', 'NW', 'SE', 'SW']) { assert.ok(F.NB[z].includes('C')); assert.equal(F.NB[z].length, 3); for (const n of F.NB[z]) assert.ok(F.NB[n].includes(z)); }
  assert.deepEqual(F.NB.NE, ['NW', 'SE', 'C']); assert.deepEqual(F.NB.SW, ['NW', 'SE', 'C']);
  assert.deepEqual({ ...F.WALLS }, { N: ['NE', 'NW'], S: ['SE', 'SW'], E: ['NE', 'SE'], W: ['NW', 'SW'] });
  assert.equal(FILL.LAYERS * FILL.PER_LAYER, 20);
  const Z = BOOK.s09.zone; for (const k of F.ZONES) assert.equal(F.zoneAt(Z[k][0], Z[k][1]), k, k);
  const B = BOOK.s09.block; assert.equal(F.zoneAt(B[0] - 0.1, Z.C[1]), null); assert.equal(F.zoneAt(Z.C[0], B[3] + 0.1), null);
  for (const lv of [1, 2, 3]) for (const L of F.ORDERS[lv]) assert.deepEqual([...L].sort(), ['big', 'small', 'tub', 'tub'], 'every layer 2+1+1+1');
  for (const L of F.ORDERS[1]) assert.deepEqual([...L], ['big', 'tub', 'small', 'tub']);
});

test('flow, step by step: the biggest pair, half the excess over a half; ties broken NE, NW, SE, SW, C', () => {
  // a tub on NE on a bare floor: NE 1; pairs NE–NW, NE–SE, NE–C all 1 → NW first (.25), then SE (.75−.25… see below), then C
  const A = F.flow(H({ NE: 1 }));
  assert.deepEqual(A.moves.map((m) => [m.from, m.to]), [['NE', 'NW'], ['NE', 'SE'], ['NE', 'C']]);
  [0.25, 0.125, 0.0625].forEach((a, i) => close(A.moves[i].a, a, 'step ' + i));
  close(A.h.NE, 0.5625); close(A.h.NW, 0.25); close(A.h.SE, 0.125); close(A.h.C, 0.0625); close(A.h.SW, 0);
  close(A.moved, 0.4375);
  // two equal highs: the pair whose high zone comes first, then whose low zone comes first
  const T = F.flow(H({ NE: 1, SW: 1 }));
  assert.deepEqual(T.moves.slice(0, 2).map((m) => [m.from, m.to]), [['NE', 'NW'], ['SW', 'SE']]);
  // the stop at a half: nothing moves when no pair differs by more than 0.5 (exactly 0.5 stays)
  assert.equal(F.flow(H({ NE: 0.5 })).moves.length, 0);
  assert.equal(F.flow(H({ C: 0.5, NE: 0.5 })).moves.length, 0);
  // the stop at one unit in all: C 2 → NE .75, then C–NW 1.25 would move .375, clipped to the .25 left
  const V = F.flow(H({ C: 2 }));
  assert.deepEqual(V.moves.map((m) => [m.from, m.to]), [['C', 'NE'], ['C', 'NW']]);
  close(V.moves[0].a, 0.75); close(V.moves[1].a, 0.25); close(V.moved, FILL.FLOW_VOL);
  close(V.h.C, 1); close(V.h.NE, 0.75); close(V.h.NW, 0.25);
  // never more than 20 steps, never more than one unit; the input is not changed; the volume is kept
  for (const h of [H({ NE: 3, C: 1 }), H({ SW: 5 }), H({ NE: 0.7, NW: 0, SE: 1.4, SW: 0.2, C: 2.1 })]) {
    const h0 = { ...h }, R = F.flow(h);
    assert.ok(R.moves.length <= FILL.FLOW_MAX); assert.ok(R.moved <= 1 + 1e-9); assert.deepEqual(h, h0);
    close(Object.values(R.h).reduce((a, b) => a + b), Object.values(h).reduce((a, b) => a + b), 'volume');
  }
  assert.equal(FILL.FLOW_OVER, 0.5); assert.equal(FILL.FLOW_VOL, 1); assert.equal(FILL.FLOW_MAX, 20);
});

test('the collapse: the middle more than 2 over the lowest corner gives that corner one unit; exactly 2 holds; a tie by the fixed order', () => {
  assert.equal(F.collapse(H({ C: 2 })), null);
  const A = F.collapse(H({ C: 2.01 })); assert.equal(A.to, 'NE'); close(A.h.C, 1.01); close(A.h.NE, 1);
  const B = F.collapse(H({ C: 3, NE: 0.5 })); assert.equal(B.to, 'NW');
  const C = F.collapse(H({ C: 3, NE: 1, NW: 1, SE: 0.9, SW: 0.9 })); assert.equal(C.to, 'SE');
  // in a load: a small basket on the middle at 2 → 3, it slides to NE: the load gets 10 at most, the streak breaks, no damage
  const S = at({ C: 2 }, 'small'); const ev = F.take(S, 0, 'C');
  assert.equal(ev.collapse, 'NE'); close(S.h.C, 2); close(S.h.NE, 1);
  assert.equal(ev.band, 'good'); assert.equal(ev.pts, FILL.PTS.collapse); assert.equal(ev.pts, 10); assert.equal(ev.streak, 'break');
  assert.equal(S.dmg, 0); assert.equal(FLAWS['fill.collapse'][1], 0);
});

test('the gauges: the higher corner of each wall less the mean of all five; the bands exactly at 1 and 2', () => {
  const g = F.gauges(H({ NE: 1.25 }));   // mean .25
  close(g.N, 1); close(g.E, 1); close(g.S, -0.25); close(g.W, -0.25);
  assert.equal(F.band(1), 'good'); assert.equal(F.band(1 + 1e-6), 'warn');
  assert.equal(F.band(2), 'warn'); assert.equal(F.band(2 + 1e-6), 'danger');
  assert.equal(F.band(F.gauges(H({ NE: 1.25 })).N), 'good');
  assert.equal(F.band(F.gauges(H({ NE: 2.5 })).N), 'warn');   // 2.5 − .5 = 2 exactly
  // the middle alone never presses a wall
  for (const v of Object.values(F.gauges(H({ C: 2 })))) assert.ok(v < 0);
  // level 1: the lenient thresholds, named constants
  assert.deepEqual({ ...FILL.GAUGE }, { good: 1, warn: 2 });
  assert.deepEqual({ ...FILL.GAUGE_L1 }, { good: 1.5, warn: 2.5 });
  assert.equal(F.band(1.5, 1), 'good'); assert.equal(F.band(1.51, 1), 'warn'); assert.equal(F.band(2.5, 1), 'warn'); assert.equal(F.band(2.51, 1), 'danger');
  assert.equal(F.band(1.5, 2), 'warn'); assert.equal(F.band(1.5, 3), 'warn');
});

test('the score table, row by row: 40 / 20 / 10 by the worst gauge; a collapse 10 at most; a level layer +40', () => {
  // all gauges ≤ 1: a small basket on the middle of a bare floor → 40
  let S = at({}, 'small'); let ev = F.take(S, 0, 'C'); assert.equal(ev.band, 'good'); assert.equal(ev.pts, 40); assert.equal(ev.streak, 'keep');
  // the worst exactly 2: NE .5 + a big basket → 2.5, mean .5 → 20 (warn), the streak breaks
  S = at({ NE: 0.5 }, 'big'); ev = F.take(S, 0, 'NE'); close(ev.g, 2); assert.equal(ev.band, 'warn'); assert.equal(ev.wall, 'N'); assert.equal(ev.pts, 20); assert.equal(ev.streak, 'break');
  // over 2: NE 2 + a small one → 3, mean .6 → 2.4 → 10
  S = at({ NE: 2 }, 'small'); ev = F.take(S, 0, 'NE'); assert.equal(ev.band, 'danger'); assert.equal(ev.pts, 10);
  // a collapse in the danger band still 10; in the good band cut to 10 (above)
  S = at({ C: 2, NE: 3, NW: 3 }, 'small'); ev = F.take(S, 0, 'C'); assert.ok(ev.collapse); assert.equal(ev.pts, 10);
  // the layer bonus, added to the load's own points
  S = at({ NE: 1.25, NW: 0.75, SE: 1, SW: 1, C: 0 }, 'small', { inLayer: 3 }); const p0 = S.pts; ev = F.take(S, 0, 'C');
  assert.equal(ev.pts, 40); assert.equal(ev.layer.flat, true); assert.equal(ev.layer.bonus, 40); assert.equal(S.pts - p0, 80);
  assert.deepEqual({ ...FILL.PTS }, { good: 40, warn: 20, danger: 10, collapse: 10, layer: 40, loss: 20 });
  assert.equal(F.MAX_PTS, 20 * 40 + 5 * 40);
});

test('the loss table, row by row: a bulge −20, an unmended pocket (corner or middle) −20, a layer not level 0', () => {
  for (const f of ['fill.bulge', 'fill.nest', 'fill.dent']) assert.equal(FLAWS[f][1], FILL.PTS.loss, f);
  assert.equal(FLAWS['fill.uneven'][1], 0);
  // the bulge: two seconds running in danger
  let S = at({ NE: 2 }, 'small'); F.take(S, 0, 'NE'); const p = S.pts;
  assert.deepEqual(F.tick(S, 1.9), []); assert.equal(S.dmg, 0);
  const b = F.tick(S, 0.1); assert.equal(b[0].bulge, 'N'); assert.equal(S.pts, p - 20 * 2);   // N and E both over 2 → two boards
  assert.deepEqual(S.flaws.map((x) => [x.f, x.wall]), [['fill.bulge', 'N'], ['fill.bulge', 'E']]);
  assert.deepEqual(F.tick(S, 5), []); assert.equal(S.dmg, 2, 'once each, for good');
  // out of danger, the clock starts again
  S = at({ NE: 2 }, 'small'); F.take(S, 0, 'NE'); F.tick(S, 1.5); S.h = H(); F.tick(S, 0.1); S.h = H({ NE: 3 }); F.tick(S, 1.5); assert.equal(S.dmg, 0);
  // a layer closed not level: 0 points, a dent or bump stays (the biggest), no damage
  S = at({ NE: 1.5, NW: 0.75, SE: 1, SW: 1, C: 0 }, 'small', { inLayer: 3 }); const p1 = S.pts; const ev = F.take(S, 0, 'C');
  assert.equal(ev.layer.flat, false); assert.equal(ev.layer.bonus, 0); assert.equal(S.pts - p1, ev.pts); assert.equal(S.dmg, 0);
  assert.deepEqual(S.flaws.at(-1), { f: 'fill.uneven', zone: 'NE', n: 1, layer: 1 });
  close(S.h.NE, 1.5, 'not raked');
});

test('the layer: within a quarter unit of its height (exactly .25 counts), else not; it always closes after the fourth load', () => {
  let S = at({ NE: 1.25, NW: 0.75, SE: 1, SW: 1, C: 0 }, 'small', { inLayer: 3 }); let ev = F.take(S, 0, 'C');
  assert.equal(ev.layer.n, 1); assert.equal(ev.layer.flat, true); for (const z of F.ZONES) assert.equal(S.h[z], 1, 'raked level');
  assert.equal(S.layer, 2); assert.equal(S.inLayer, 0); assert.equal(S.flat, 1);
  S = at({ NE: 1.26, NW: 0.74, SE: 1, SW: 1, C: 0 }, 'small', { inLayer: 3 }); ev = F.take(S, 0, 'C');
  assert.equal(ev.layer.flat, false); assert.deepEqual(ev.layer.off.map((o) => o.zone), ['NE', 'NW']); assert.equal(S.layer, 2);
  S = at({}, 'small', { inLayer: 2 }); assert.equal(F.take(S, 0, 'C').layer, null);
  assert.equal(FILL.LAYER_TOL, 0.25);
});

test('weak pockets: stones on stones; a tub on the zone mends; mix flowed in (a quarter at least) counts; unmended: a nest or a dent', () => {
  // big then small on NE: a pocket
  let S = at({}, 'big'); F.take(S, 0, 'NE'); put(S, 'small'); let ev = F.take(S, 0, 'NE');
  assert.equal(ev.pocket, true); assert.equal(S.pockets.length, 1);
  // a tub on NE before the layer closes mends it
  put(S, 'tub'); ev = F.take(S, 0, 'NE'); assert.equal(ev.mended, true);
  put(S, 'small'); ev = F.take(S, 0, 'C'); assert.ok(ev.layer); assert.deepEqual(ev.layer.lost, []); assert.equal(S.dmg, 0);
  // stones, then a tub on that zone: no pocket after
  S = at({}, 'big'); F.take(S, 0, 'SW'); put(S, 'tub'); F.take(S, 0, 'SW'); put(S, 'small'); assert.equal(F.take(S, 0, 'SW').pocket, false);
  // mix that flows in, .75 of a unit: counts as mix arriving
  S = at({ NE: 1, SE: 1, SW: 1, C: 1 }, 'tub'); S.last.NW = 'stone'; ev = F.take(S, 0, 'NE');
  assert.ok(ev.flow.reach.NW >= FILL.POCKET_MIX); assert.equal(S.last.NW, 'mix');
  put(S, 'small'); assert.equal(F.take(S, 0, 'NW').pocket, false);
  // less than a quarter does not: a tub on NE of a bare floor sends SE .125
  S = at({}, 'tub'); S.last.SE = 'stone'; ev = F.take(S, 0, 'NE'); close(ev.flow.reach.SE, 0.125); assert.equal(S.last.SE, 'stone');
  put(S, 'small'); assert.equal(F.take(S, 0, 'SE').pocket, true);
  // unmended at the close: a corner's pocket is a nest, the middle's a dent; −20 each, damage
  S = at({}, 'small'); F.take(S, 0, 'NW'); put(S, 'small'); F.take(S, 0, 'NW'); put(S, 'small'); F.take(S, 0, 'C'); put(S, 'small');
  const p = S.pts; ev = F.take(S, 0, 'C');
  assert.deepEqual(ev.layer.lost, [{ zone: 'NW', f: 'fill.nest' }, { zone: 'C', f: 'fill.dent' }]);
  assert.equal(S.dmg, 2); assert.equal(S.pts, p + ev.pts - 40);
  assert.deepEqual(ev.flaws.filter((x) => x.f !== 'fill.uneven').map((x) => x.f), ['fill.nest', 'fill.dent']);
  // a tub in the next layer does not mend the last layer's pocket (it was closed)
  put(S, 'tub'); assert.equal(F.take(S, 0, 'NW').mended, false);
});

test('the free trial: the first load is never counted against — at least 20, the streak kept, no bulge from what it left', () => {
  const S = F.fresh(2); S.ramp[0] = { kind: 'big', layer: 1, i: 0 }; S.h = H({ NE: 1 });
  const ev = F.take(S, 0, 'NE'); assert.equal(ev.free, true); assert.equal(ev.band, 'danger'); assert.equal(ev.pts, 20); assert.equal(ev.streak, 'keep');
  assert.deepEqual(F.tick(S, 10), []); assert.equal(S.dmg, 0);
  put(S, 'small'); F.take(S, 0, 'NE'); F.tick(S, 2.5); assert.ok(S.dmg > 0, 'the next load starts the clocks');
  const T = F.fresh(2); assert.deepEqual(F.tick(T, 10), []);
});

test('levels: 1 the fixed order and the lenient gauges; 2 mixed, the queue fixed, three sleds always; only the first may be taken', () => {
  const A = F.fresh(1); assert.deepEqual(F.onRamp(A), ['big', 'tub', 'small']);
  const B = F.fresh(2); assert.equal(B.ramp.length, 3); assert.equal(F.canTake(B, 1), false); assert.equal(F.canTake(B, 0), true);
  // level 1: a gauge of 1.6 is 'warn' (lenient), not the 20 of level 2's danger … and 1.4 is good there
  const L1 = at({ NE: 0 }, 'big', { lv: 1 }); const e1 = F.take(L1, 0, 'NE'); close(e1.g, 1.6); assert.equal(e1.band, 'warn');
  const L2 = at({ NE: 0 }, 'small', { lv: 1 }); assert.equal(F.take(L2, 0, 'NE').band, 'good');
  // twenty loads always come: the ramp is never empty till the last
  let n = 0; while (!B.done) { assert.ok(B.ramp.length >= 1); F.take(B, 0, F.ZONES[n % 5]); n++; } assert.equal(n, 20); assert.equal(B.ramp.length, 0);
  assert.equal(F.take(B, 0, 'C'), null);
});

test('level 3: a sled every 5 s (3 at the start + 17), the first two to choose from (the second of the same layer); a full ramp waits', () => {
  const S = F.fresh(3); assert.equal(S.ramp.length, 3); assert.equal(S.queue.length, 20);
  assert.deepEqual({ ...FILL.CARAVAN }, { every: 5, start: 3, ramp: 3 });
  assert.equal(F.canTake(S, 0), true); assert.equal(F.canTake(S, 1), true); assert.equal(F.canTake(S, 2), false);
  // the ramp full at 5 s: the oxen wait, the streak breaks once, no damage, nothing lost
  let e = F.tick(S, 5); assert.deepEqual(e, [{ wait: true }]); assert.equal(S.streakBreaks, 1);
  assert.deepEqual(F.tick(S, 3), []); assert.equal(S.streakBreaks, 1); assert.equal(S.dmg, 0);
  // the second sled taken: the next arrives at once
  const k1 = S.ramp[1].kind, ev = F.take(S, 1, 'C'); assert.equal(ev.kind, k1); assert.equal(S.ramp.length, 2);
  e = F.tick(S, 0.016); assert.equal(e.length, 1); assert.ok(e[0].arrive); assert.equal(S.ramp.length, 3); assert.equal(S.waiting, 0);
  // then every five seconds
  F.take(S, 0, 'NE'); assert.deepEqual(F.tick(S, 4.9).filter((x) => x.arrive), []); assert.equal(F.tick(S, 0.1).filter((x) => x.arrive).length, 1);
  // the second sled of the next layer may not be taken (every layer stays 2+1+1+1)
  const T = F.fresh(3); F.take(T, 0, 'C'); F.take(T, 0, 'NE'); F.take(T, 0, 'SE'); F.tick(T, 5); F.tick(T, 5); F.tick(T, 5);
  assert.equal(T.inLayer, 3); assert.equal(T.ramp[0].layer, 1); assert.equal(T.ramp[1].layer, 2); assert.equal(F.canTake(T, 1), false);
  // 3 + 17 every 5 s = 85 s when the player keeps pace
  const U = F.fresh(3); let t = 0, z = 0; while (U.next < U.queue.length) { if (U.ramp.length) F.take(U, 0, F.ZONES[z++ % 5]); F.tick(U, 0.5); t += 0.5; }
  close(t, 85);
});

test('every level can be played to five level layers with no damage (a search of each layer), and the result is 3 stars, perfect', () => {
  const fill = (T) => { if (T.lv === 3) while (T.ramp.length < 3 && T.next < T.queue.length) T.ramp.push(T.queue[T.next++]); };
  for (const lv of [1, 2, 3]) {
    const S = F.fresh(lv);
    while (!S.done) {
      let best = null;
      const rec = (T, d, path) => {
        if (d === 0 || (T.inLayer === 0 && path.length)) { const sc = T.pts - T.dmg * 100 - (T.flat < (path.length ? T.layer - 1 : 0) ? 50 : 0); if (!best || sc > best.sc) best = { sc, path }; return; }
        for (const i of [0, 1]) for (const z of F.ZONES) { const U = F.load(F.save(T)); fill(U); if (!F.canTake(U, i)) continue; F.take(U, i, z); rec(U, d - 1, [...path, [i, z]]); }
      };
      rec(S, 4, []);
      for (const [i, z] of best.path) { fill(S); F.take(S, i, z); }
    }
    const R = F.result(S);
    assert.equal(R.flags.flat, 5, 'level ' + lv); assert.equal(R.flags.dmg, 0); assert.equal(R.perfect, true); assert.equal(R.stars, 3); assert.ok(R.q >= 0.95);
  }
  const Z = F.fresh(2); Z.pts = -50; assert.equal(F.result(Z).pts, 0);
  const W = F.fresh(2); F.take(W, 0, 'NE'); const R2 = F.load(F.save(W)); assert.deepEqual(R2, W); assert.equal(F.load({}), null);
});

test('the hint: the best first step of the layer\'s line; played by it alone, every level ends five level layers and no damage', () => {
  for (const lv of [1, 2, 3]) {
    const S = F.fresh(lv); let n = 0;
    while (!S.done) {
      if (lv === 3) while (S.ramp.length < 3 && S.next < S.queue.length) S.ramp.push(S.queue[S.next++]);
      const a = F.advise(S); assert.ok(a && F.canTake(S, a.i) && F.ZONES.includes(a.zone)); assert.equal(a.kind, S.ramp[a.i].kind);
      const h0 = JSON.stringify(S.h); F.advise(S); assert.equal(JSON.stringify(S.h), h0, 'the search leaves the work as it was');
      F.take(S, a.i, a.zone); n++;
    }
    assert.equal(n, 20); const R = F.result(S); assert.equal(R.flags.flat, 5, 'level ' + lv); assert.equal(R.flags.dmg, 0); assert.equal(R.perfect, true);
  }
  const D = F.fresh(2); D.done = 1; assert.equal(F.advise(D), null);
});
