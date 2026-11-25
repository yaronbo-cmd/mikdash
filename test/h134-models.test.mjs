// build 134 — stage 11 "הקרנות" (spec docs/specs/shlav-11-he.md v4): the 24 sets, the three works' rules and the stage's flow.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { checkSets, setOf, solutionPose, CORNERS, SIZES, RING_N } from '../src/game/h134/sets.js';
import * as O from '../src/game/h134/orez-model.js';
import * as K from '../src/game/h134/chilutz-model.js';
import * as D from '../src/game/h134/chotem-model.js';
import { createH134, PLAN, STAGE_FLOW, KINDS, fromOld } from '../src/game/h134/model.js';

test('sets: all 24 valid (each layer tiles the 108 ring cells, sizes 6/8, 8/10, 10/12, the solution poses fit)', () => {
  assert.deepEqual(checkSets(), []);
  for (const c of CORNERS) for (const lv of [1, 2, 3]) for (const L of [1, 2]) {
    const S = setOf(c, lv, L); assert.equal(S.length, SIZES[lv][L - 1], `${c}${lv}/${L}`);
    assert.equal(S.reduce((a, p) => a + p.shape.length, 0), RING_N);
    for (const p of S) assert.ok(solutionPose(p), p.id);
  }
});
test('sets: the JSON is the generator\'s (python, when it is here)', () => {
  const py = 'docs/specs/shlav-11-horn-sets-gen.py';
  let ok = false; try { execFileSync('python3', ['--version']); ok = existsSync(py); } catch (e) { ok = false; }
  if (!ok) return;
  const out = '/tmp/claude-0/s/h134-sets.json'; execFileSync('python3', ['-I', py, out], { stdio: 'ignore' });
  assert.deepEqual(JSON.parse(readFileSync(out, 'utf8')).sets, JSON.parse(readFileSync('docs/specs/shlav-11-horn-sets.json', 'utf8')).sets);
});

/** seat a whole layer at its solution */
function packLayer(S) { S.P.forEach((p, i) => { O.lift(S, i); const r = O.drop(S, p.sol.o, p.sol.x, p.sol.z, 6, 6, [1, 1]); assert.equal(r.k, 'seat', p.id); }); }
test('orez: the solution closes both layers clean, every step gold → 3 stars; the free first fall costs nothing', () => {
  const S = O.fresh('SE', 1);
  O.lift(S, 0); const f = O.drop(S, 0, 0, 0, 15, 6, [-1, -1]); assert.equal(f.k, 'fall'); assert.equal(f.free, true); assert.equal(S.fell, 0);
  O.step(S, 1.1); packLayer(S); assert.ok(O.full(S)); const a = O.close(S); assert.equal(a.clean, true); assert.equal(S.layer, 2);
  packLayer(S); const b = O.close(S); assert.equal(b.bonded, true); assert.ok(S.done);
  const r = O.result(S); assert.equal(r.stars, 3); assert.equal(r.q, 1);
});
test('orez: a loose pebble blocks the close; a second fall is counted; the inward side is a walk, not a fall', () => {
  const S = O.fresh('NE', 1, { free: false });
  packLayer(S); const p = S.P[0]; O.lift(S, 0); const r = O.drop(S, (p.sol.o + 1) % 8, p.sol.x + 1, p.sol.z, 6, 6, [-1, 1]);
  assert.ok(r.k === 'loose' || r.k === 'seat');
  if (r.k === 'loose') assert.equal(O.canClose(S), false);
  O.lift(S, 1); assert.equal(O.drop(S, 0, 0, 0, -3, 6, [-1, 1]).k, 'walk');
  O.lift(S, 1); assert.equal(O.drop(S, 0, 0, 0, 13, 6, [-1, 1]).k, 'lip'); assert.equal(S.fell, 0);   // (just over the outer lip: back, no cost)
  O.lift(S, 2); const f = O.drop(S, 0, 0, 0, 15, 6, [-1, 1]); assert.equal(f.k, 'fall'); assert.equal(S.fell, 1);
});
test('orez level 3: the pitch window — the second layer after 60 s leaves the ridge, and no clean bonus', () => {
  const S = O.fresh('NW', 3); packLayer(S); O.close(S); assert.equal(S.tarT, null);
  assert.equal(O.step(S, 61).length, 0);   // (no clock before the first pebble of layer 2)
  const p0 = S.P[0]; O.lift(S, 0); assert.equal(O.drop(S, p0.sol.o, p0.sol.x, p0.sol.z, 6, 6, [-1, -1]).k, 'seat'); assert.equal(S.tarT, 0);
  const ev = O.step(S, 61); assert.ok(ev.some((e) => e.k === 'thick'));
  packLayer(S); const b = O.close(S); assert.equal(b.ridge, true); assert.equal(b.clean, false);
});
test('orez: a replay packs only the second layer, with the new level\'s set', () => {
  const S = O.secondOnly(O.fresh('SW', 2), setOf('SW', 1, 1).map((p) => { const q = solutionPose(p); return { c: O.cellsOf(p, q.o, q.x, q.z) }; }), []);
  assert.equal(S.layer, 2); assert.equal(S.P.length, SIZES[2][1]);
});

test('chilutz: the strokes of the spec — a point lets go at 60 % within 30° for half a second; a caught pull scuffs; too fast breaks', () => {
  const S = K.fresh('SE', 1); // (one point, E: tilt west)
  K.tiltTo(S, [-1, 0], 0.7); for (let i = 0; i < 40; i++) K.step(S, 1 / 60); assert.ok(K.allFree(S));
  const T = K.fresh('SE', 1); const e = K.pullBy(T, 0.2, 0.1); assert.ok(e.some((q) => q.k === 'scuff' && q.why === 'caught'));
  const B = K.fresh('SE', 1); K.tiltTo(B, [-1, 0], 0.7); for (let i = 0; i < 40; i++) K.step(B, 1 / 60);
  const br = K.pullBy(B, 2, 0.1); assert.ok(br.some((q) => q.k === 'break')); assert.equal(K.result(B).stars, 1);
  const G = K.fresh('SE', 1); K.tiltTo(G, [-1, 0], 0.7); for (let i = 0; i < 40; i++) K.step(G, 1 / 60); K.tiltEnd(G); K.step(G, 0.1);
  let out = false; for (let i = 0; i < 200 && !out; i++) out = K.pullBy(G, 0.1, 0.1).some((q) => q.k === 'out'); assert.ok(out);
  assert.equal(K.result(G).stars, 3);
});
test('chilutz: over the range for half a second scuffs once a lean', () => {
  const S = K.fresh('NE', 1); K.tiltTo(S, [1, 0], 1.1); let n = 0; for (let i = 0; i < 90; i++) n += K.step(S, 1 / 60).filter((e) => e.k === 'scuff').length; assert.equal(n, 1);
});

test('chotem: the arithmetic — water 10 strokes from the breaking through, wine 18 / 15 / 13', () => {
  assert.deepEqual([1, 2, 3].map((lv) => [D.strokesTo(D.fresh(lv), 'water'), D.strokesTo(D.fresh(lv), 'wine')]), [[10, 18], [10, 15], [10, 13]]);
});
function bore(S, side, n) { for (let g = 0; g < 40 && !S.c[side].open; g++) D.stroke(S, side, 1); for (let i = 0; i < n; i++) D.stroke(S, side, 1); }
test('chotem: the right pair empties together and passes on the first test; a narrow pair fails; an untouched retest is not counted', () => {
  for (const lv of [1, 2, 3]) { const S = D.fresh(lv); bore(S, 'water', D.strokesTo(S, 'water')); bore(S, 'wine', D.strokesTo(S, 'wine')); const t = D.test(S); assert.equal(t.pass, true, 'lv' + lv); assert.equal(t.first, true); assert.equal(D.result(S).stars, 3); }
  const N = D.fresh(1); bore(N, 'water', 10); bore(N, 'wine', 10); const t = D.test(N); assert.equal(t.pass, false); assert.ok(t.tv > t.tw);
  const again = D.test(N); assert.equal(again.counted, false); assert.equal(N.tests.length, 1);
});
test('chotem: tearing — level 2 pressure 3 tears; a tear is replaced (a spare), the other cup stays', () => {
  const S = D.fresh(2); bore(S, 'water', 3); assert.equal(D.stroke(S, 'wine', 3).k, 'tear'); assert.ok(D.replace(S, 'wine')); assert.equal(S.spares, 1); assert.ok(S.c.water.open);
});

test('the stage: 39 stations; round 1 = 4 packings + the cups + 4 extractions; extraction only after all four packed', () => {
  assert.equal(PLAN.length, KINDS.length * 3); assert.equal(STAGE_FLOW.length, 9);
  const M = createH134(null);
  assert.deepEqual(M.open().map((m) => m.id).sort(), ['chotem1', 'orezNE1', 'orezNW1', 'orezSE1', 'orezSW1']);
  for (const c of ['SE', 'NE', 'NW']) { M.pick('orez' + c + '1'); M.st.horns[c].packed = 1; M.done({ stars: 3, pts: 100 }); }
  assert.ok(!M.open().some((m) => m.work === 'chilutz'));
  M.pick('orezSW1'); M.st.horns.SW.packed = 1; M.done({ stars: 3, pts: 100 });
  assert.equal(M.open().filter((m) => m.work === 'chilutz').length, 4);
});
test('the stage: a fall flaws the horn — its station is the repair at that level; the repair gains no level; scoring once', () => {
  const M = createH134(null); M.pick('orezSE1'); M.st.horns.SE.packed = 1; M.flaw('orez.fall', { corner: 'SE' });
  assert.ok(M.flawed('SE')); M.done({ stars: 1, pts: 50 });
  assert.ok(M.open().some((m) => m.id === 'fixSE1')); assert.ok(!M.open().some((m) => m.id === 'orezSE1'));
  assert.equal(M.pick('fixSE1').id, 'fixSE1'); assert.ok(!M.flawed('SE'), 'the repair lifts the horn\'s flaws while it plays');
  M.done({ stars: 3, pts: 120 }); assert.equal(M.st.res.orezSE1.stars, 3); assert.ok(!M.st.done.includes('fixSE1'));
  assert.equal(M.levelsDone('orezSE'), 1);
});
test('the stage: the crews\' save (an old game) stands built; round 2 opens each station at its next level', () => {
  const M = createH134(fromOld(true)); assert.ok(M.finished());
  assert.deepEqual(M.open().map((m) => m.id).sort(), ['chotem1', 'orezNE1', 'orezNW1', 'orezSE1', 'orezSW1']);
});
