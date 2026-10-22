// ── recovered (R9) ── build 21 (node): תרומת הדשן in the world — gate21 after the laver, the sweep of the coals (four straight, quick swipes:
// short / crooked / slow refused), the walk down the ramp with the pan and its balance (B moves by the wind, the step's shake and his
// correction; |B| > 0.8 spills the coals — at most one spill a second), the turn, the gold ring at the foot, the pour, the record.
import test from 'node:test';
import assert from 'node:assert/strict';
import { D21 } from '../src/avodah/shift/day33.js';
import { rig, upTo } from './rig33.mjs';

async function washed(flags = upTo('d21')) { const R = rig(flags); R.E.start(); await R.step(0.2); R.E.debug.wash20(); await R.step(0.2); return R; }
async function swept(R) { R.at(D21.stand.x, D21.stand.z, 25); await R.step(0.8); for (let i = 0; i < D21.layers; i++) R.E.d21swipe(0.6, 0.05, 100); await R.step(1.0); }
async function walkDown(R, ctl) { R.E.d21stick(1); for (let i = 0; i < 300 && R.E.d21().ph !== 'foot'; i++) { if (ctl) R.E.d21bal(Math.max(-1, Math.min(1, -R.E.d21().b * 4))); await R.step(0.05); } }
async function pour(R) { const g = D21.go[2]; R.at(g[0], g[1]); await R.step(0.2); assert.equal(R.E.d21tap(), true); await R.step(D21.pour + 0.6 + D21.end); }

test('build 21: D21 — four layers, a swipe ≥ 0.3 of the screen within 200 ms; the balance spills past 0.8 (one a second), −20 % of the ash each', () => {
  assert.equal(D21.layers, 4); assert.equal(D21.sw, 0.3); assert.equal(D21.ms, 200);
  assert.equal(D21.bal.spill, 0.8); assert.equal(D21.bal.gap, 1); assert.equal(D21.loss, 20); assert.equal(D21.coins, undefined);   // ── fable32 (build 30) ── (D21.coins [3, 1, 0] gone: the coins by the rating) ── /fable32 ──
  assert.deepEqual([...D21.bal.wind], [0.12, 0.35]); assert.deepEqual([...D21.bal.shake], [0.5, 1.4]); assert.equal(D21.bal.fix, 2.4);
});
test('build 21: gate21 opens when he has washed (the laver first) and holds the other stations', async () => {
  const R = rig(upTo('d21')); R.E.start(); await R.step(0.2); assert.equal(R.E.gate21(), false);
  R.E.debug.wash20(); await R.step(0.2); assert.equal(R.E.gate21(), true); assert.equal(R.E.flowNext().id, 'deshen');
  const w = R.STATIONS.wood.stand; R.at(w.x, w.z); assert.equal(await R.E.runAt('wood'), false); assert.ok(R.ev('gate').some((e) => e.id === 'wood' && e.d21));
});
test('build 21: at the coals\' stand on the altar\'s top the act begins and turns to the sweep', async () => {
  const R = await washed(); R.at(D21.stand.x, D21.stand.z, 25); await R.step(0.2); assert.equal(R.E.d21().ph, 'in');
  await R.step(0.6); assert.equal(R.E.d21().ph, 'sweep'); assert.equal(R.E.d21().cov, 100);
});
test('build 21: a swipe too short, crooked (|dy| > ½|dx|) or slow (> 200 ms) is refused with its why', async () => {
  const R = await washed(); R.at(D21.stand.x, D21.stand.z, 25); await R.step(0.8);
  assert.equal(R.E.d21swipe(0.2, 0, 100), false); assert.equal(R.E.d21swipe(0.6, 0.4, 100), false); assert.equal(R.E.d21swipe(0.6, 0, 300), false);
  assert.deepEqual(R.ev('d21swipe').map((e) => e.why), ['short', 'crooked', 'slow']); assert.equal(R.E.d21().n, 0);
});
test('build 21: four good swipes — the coals 100 → 0 %, the pan 0 → 100 %; full', async () => {
  const R = await washed(); R.at(D21.stand.x, D21.stand.z, 25); await R.step(0.8);
  const cov = []; for (let i = 0; i < 4; i++) { assert.equal(R.E.d21swipe(0.6, 0.05, 100), true); cov.push(R.E.d21().cov); }
  assert.deepEqual(cov, [75, 50, 25, 0]); assert.equal(R.E.d21().fill, 100); assert.equal(R.E.d21().ph, 'full');
});
test('build 21: d21stick (0…1) and d21bal (−1…1, or none) clamp; without an act they refuse', async () => {
  const R0 = rig(upTo('d21')); R0.E.start(); assert.equal(R0.E.d21stick(1), false); assert.equal(R0.E.d21bal(1), false);
  const R = await washed(); R.at(D21.stand.x, D21.stand.z, 25); await R.step(0.3);
  R.E.d21stick(3); assert.equal(R.E.d21().sy, 1); R.E.d21stick(-2); assert.equal(R.E.d21().sy, 0);
  R.E.d21bal(-5); assert.equal(R.E.d21().in, -1); R.E.d21bal(null); assert.equal(R.E.d21().in, null);
});
test('build 21: the balance — pushed one way |B| passes 0.8: a spill (−20 %, B ×0.4, "d21spill"), the next not within the second', async () => {
  const R = await washed(); await swept(R); assert.equal(R.E.d21().ph, 'walk'); R.E.d21stick(1); R.E.d21bal(1);
  for (let i = 0; i < 10; i++) await R.step(0.05);
  assert.equal(R.E.d21().spills, 1); assert.equal(R.E.d21().fill, 80); assert.equal(R.ev('d21spill')[0].pts, D21.pts);
  const t1 = R.ev('d21spill')[0].t; for (let i = 0; i < 25; i++) await R.step(0.05);
  const s = R.ev('d21spill'); assert.ok(s.length >= 2 && s[1].t - t1 >= D21.bal.gap - 1e-6);
});
test('build 21: held steady (B corrected) the walk down spills nothing and ends at the foot with the pan full', async () => {
  const R = await washed(); await swept(R); await walkDown(R, true);
  assert.equal(R.E.d21().ph, 'foot'); assert.equal(R.E.d21().spills, 0); assert.equal(R.E.d21().fill, 100);
});
test('build 21: at the foot — the gold ring within 2.6 amot, a tap: the pour; the record (no spill: 3 coins, 150 points) and E.d21r', async () => {
  const R = await washed(); await swept(R); await walkDown(R, true); await pour(R);
  const r = R.E.d21r(); assert.ok(r); assert.equal(r.embersSpilledCount, 0); assert.equal(r.coins, 3);   // ── fable32 (build 30) ── (מהודר: 3) ── /fable32 ──
  assert.equal(r.rating, 'mehudar'); assert.equal(r.scoreEarned, D21.score); assert.equal(r.ashCollectedPercent, 100);
  assert.equal(R.E.d21(), null); assert.equal(R.ev('d21done').length, 1); assert.equal(R.E.gate21(), false);
});
// ── fable32 (build 30) ── the coins by the rating (rate30: two spills → q 0.35 → טעון תיקון → 1 coin; were D21.coins [3, 1, 0] by the spills) ── /fable32 ──
test('build 21: two spills — טעון תיקון, one coin (build 30), 150 − 2×50 points', async () => {
  const R = await washed(); await swept(R); R.E.d21stick(1); R.E.d21bal(1); for (let i = 0; i < 60 && R.E.d21().spills < 2; i++) await R.step(0.05);
  assert.equal(R.E.d21().spills, 2); R.E.d21bal(null); await walkDown(R, true); await pour(R);
  const r = R.E.d21r(); assert.equal(r.embersSpilledCount, 2); assert.equal(r.rating, 'tikkun'); assert.equal(r.coins, 1); assert.equal(r.scoreEarned, D21.score - 2 * D21.pts);
});
test('build 21: the tap at the foot needs the ring (d21tap refused away from it)', async () => {
  const R = await washed(); await swept(R); await walkDown(R, true); R.at(-20, 30); await R.step(0.2);
  assert.equal(R.E.d21().near, false); assert.equal(R.E.d21tap(), false);
});
test('build 21: the authored views — the coals while he sweeps, following him on the ramp, the heap at the pour', async () => {
  const R = await washed(); R.at(D21.stand.x, D21.stand.z, 25); await R.step(0.8);
  const a = R.E.camWork21(); assert.ok(a && a.view && a.view.t.length === 3);
  await R.step(0.01); for (let i = 0; i < 4; i++) R.E.d21swipe(0.6, 0.05, 100); await R.step(1); R.E.d21stick(1); await R.step(0.5);
  const b = R.E.camWork21(); assert.ok(b && b.view && b.view.t[1] > 16, 'a follow view over the ramp');
});
