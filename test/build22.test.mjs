// ── recovered (R9) ── build 22 (node): סידור המערכה in the world — gate22 after the ashes, the logs dealt at the wood store (fig, walnut, pine
// by size; olive, vine and the wormy unfit), sorted by swipes (right: take, left: back), six fit ones carried up, stacked in three layers
// (L, M, S) with the air between the pair (AirGap = (gap − 2r)/(gap + 2r) in the band: 25–45 % the first time, then 30–40 %), the fire.
import test from 'node:test';
import assert from 'node:assert/strict';
import { M22 } from '../src/avodah/shift/day33.js';
import { rig, upTo } from './rig33.mjs';

async function atWood(flags = upTo('m22')) { const R = rig(flags); R.E.start(); await R.step(0.2); R.E.debug.wash20(); R.E.debug.skip21(); await R.step(0.2); const w = R.STATIONS.wood.stand; R.at(w.x, w.z); await R.step(0.3); return R; }
async function sortAll(R, pick = (K) => (K.cur.ok ? 0.5 : -0.5)) { for (let i = 0; i < 300 && R.E.m22() && ['in', 'sort'].includes(R.E.m22().ph); i++) { const K = R.E.m22(); if (K.ph === 'sort' && K.ls === 'on') R.E.m22swipe(pick(K), 0, 100); await R.step(0.1); } }
async function toStack(R) { await sortAll(R); await R.step(1.2); R.at(M22.stand.x, M22.stand.z, 25); await R.step(1.0); }
const dFor = (air, r) => (2 * r * (1 + air)) / (1 - air);   // (the gap whose AirGap is `air`)
async function stackAll(R, air = 0.35) {
  const K = R.E.m22();
  for (const size of 'LMS') {
    const r = M22.r[size], i1 = K.got.findIndex((g) => g.size === size && !g.at); R.E.m22place(i1, -0.6);
    const i2 = K.got.findIndex((g) => g.size === size && !g.at); R.E.m22place(i2, size === 'S' ? 0 : -0.6 + dFor(air, r));
  }
}

// ── fable32 (build 30) ── M22.fast (+25 for a quick sort) is gone — the rating is accuracy, not speed ── /fable32 ──
test('build 22: M22 — six logs (L L M M S S), the air band 25–45 % then 30–40 %, the radii, 100 points (+25 the air ≥ 85; no "fast" — build 30)', () => {
  assert.equal(M22.need, 6); assert.equal(M22.sizes, 'LLMMSS'); assert.deepEqual(M22.band.map((b) => [...b]), [[0.25, 0.45], [0.3, 0.4]]);
  assert.deepEqual({ ...M22.r }, { L: 0.3, M: 0.21, S: 0.11 }); assert.equal(M22.score, 100); assert.equal(M22.fast, undefined); assert.equal(M22.airB, 25); assert.equal(M22.good, 85);
});
test('build 22: AirGap — gap24(gap, r) = (gap − 2r)/(gap + 2r), never below 0', async () => {
  const R = rig(upTo('m22')); R.E.start();
  assert.equal(R.E.gap24(1, 0.3), 0.25); assert.equal(R.E.gap24(0.5, 0.3), 0); assert.ok(Math.abs(R.E.gap24(dFor(0.35, 0.3), 0.3) - 0.35) < 1e-12);
});
test('build 22: gate22 opens after the ashes (תרומת הדשן done) and the way is the wood store', async () => {
  const R = rig(upTo('m22')); R.E.start(); await R.step(0.2); R.E.debug.wash20(); await R.step(0.1); assert.equal(R.E.gate22(), false);
  R.E.debug.skip21(); await R.step(0.2); assert.equal(R.E.gate22(), true); assert.equal(R.E.flowNext().id, 'm22');
});
test('build 22: at the wood store the logs are dealt — fit ones of the sizes and unfit ones (olive, vine, the wormy)', async () => {
  const R = await atWood(); const K = R.E.m22(); assert.ok(K);
  const fit = K.q.filter((x) => x.ok), bad = K.q.filter((x) => !x.ok);
  assert.equal(fit.map((x) => x.size).sort().join(''), 'LLMMSS'); assert.ok(bad.length >= 2 && bad.every((x) => ['olive', 'vine'].includes(x.sp) || x.worm));
  assert.ok(fit.every((x) => ['fig', 'walnut', 'pine'].includes(x.sp)));
});
test('build 22: sorting — a fit log swiped right is his, an unfit one swiped right is the error (the first a warning), left puts it back', async () => {
  const R = await atWood(); let first = true;
  await sortAll(R, (K) => { if (!K.cur.ok && first) { first = false; return 0.5; } return K.cur.ok ? 0.5 : -0.5; });
  const K = R.E.m22(); assert.equal(K.got.length, 6); assert.equal(K.bad, 1); assert.equal(K.pts, 0, 'the first unfit one is a warning');
  const sw = R.ev('m22sw').filter((e) => e.ok); assert.ok(sw.some((e) => e.take && !e.fit && e.warn));
});
test('build 22: a swipe too short or crooked is refused ("m22sw" not ok)', async () => {
  const R = await atWood(); for (let i = 0; i < 30 && !(R.E.m22().ph === 'sort' && R.E.m22().ls === 'on'); i++) await R.step(0.1);
  assert.equal(R.E.m22swipe(0.1, 0, 100), null); assert.equal(R.E.m22swipe(0.5, 0.4, 100), null);
  assert.deepEqual(R.ev('m22sw').map((e) => e.why), ['short', 'crooked']);
});
test('build 22: six fit logs — "sorted" with the sorting time, then he carries them (the basket 6) up to the pyre', async () => {
  const R = await atWood(); await sortAll(R); assert.equal(R.E.m22().ph, 'sorted'); assert.ok(R.E.m22().sortT > 0);
  await R.step(1.2); assert.equal(R.E.m22().ph, 'carry'); assert.equal(R.E.state().logs, 6);
  R.at(M22.stand.x, M22.stand.z, 25); await R.step(1.0); assert.equal(R.E.m22().ph, 'stack'); assert.equal(R.E.m22().layer, 1);
});
test('build 22: stacking — the layer\'s size only ("m22no"); the pair too close or too far is refused (tight / wide); in the band it holds', async () => {
  const R = await atWood(); await toStack(R); const K = R.E.m22();
  assert.deepEqual(R.E.m22place(K.got.findIndex((g) => g.size === 'S'), 0), { ok: false, why: 'L' }); assert.equal(K.mis, 1);
  assert.equal(R.E.m22place(K.got.findIndex((g) => g.size === 'L'), -0.6).ok, true);
  const i2 = K.got.findIndex((g) => g.size === 'L' && !g.at);
  assert.equal(R.E.m22place(i2, 0).why, 'tight'); assert.equal(R.E.m22place(i2, 1.2).why, 'wide');
  const r = R.E.m22place(i2, -0.6 + dFor(0.35, M22.r.L)); assert.equal(r.ok, true); assert.equal(K.layer, 2);
});
test('build 22: the air in the band\'s middle is 100; the three layers stacked → ready, a tap lights it → the record (coins 3, the fire)', async () => {
  const R = await atWood(); await toStack(R); await stackAll(R, 0.35);
  const K = R.E.m22(); assert.equal(K.ph, 'ready'); assert.equal(K.air, 100);
  assert.equal(R.E.m22tap(), true); await R.step(M22.ign + 0.3); await R.step(M22.end + 0.3);
  const rec = R.E.m22r(); assert.ok(rec); assert.equal(rec.coins, 3); assert.equal(rec.invalidWoodSelectedCount, 0); assert.equal(rec.airflowQualityScore, 100); assert.equal(rec.airGap, 35);
  assert.equal(rec.fire, Math.round(M22.fire[0] + M22.fire[1] * 100)); assert.ok(R.E.state().fuel >= rec.fire - 1);
});
test('build 22: the band narrows after the first time (25–45 % → 30–40 %)', async () => {
  const R = rig(upTo('m22')); R.E.start(); await R.step(0.1); assert.deepEqual([...R.E.band22()], [0.25, 0.45]);
  R.E.debug.day(2); assert.deepEqual([...R.E.band22()], [0.3, 0.4]);
});
test('build 22: the cracks — each wrong-size try costs 20 of the structure; the air at the band\'s edge costs points', async () => {
  const R = await atWood(); await toStack(R); const K = R.E.m22();
  R.E.m22place(K.got.findIndex((g) => g.size === 'M'), 0); await stackAll(R, 0.26);
  assert.ok(K.air < 100 && K.air >= 0); R.E.m22tap(); await R.step(M22.ign + 0.3);
  const rec = R.E.m22r(); assert.equal(rec.cracks, 1); assert.equal(rec.structuralIntegrityScore, 100 - M22.mis);
});
