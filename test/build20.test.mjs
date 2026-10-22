// ── recovered (R9) ── build 20 (node): the laver's act (kiyor20) — the morning's first gate (gate20: no other station before it), the walk up
// to the spigots, the two-thumb hold (L and R under the water: the ring fills in K20.hold s, falls back at K20.back while one is lifted),
// the unlock, the walk down (or the lot next, build 23), the authored view (camWork20).
import test from 'node:test';
import assert from 'node:assert/strict';
import { K20 } from '../src/avodah/shift/day33.js';
import { rig, upTo } from './rig33.mjs';

async function atLaver(flags = upTo('g20'), o) { const R = rig(flags, o); R.E.start(); await R.step(0.2); const k = R.STATIONS.kiyor.stand; R.at(k.x, k.z); await R.step(0.2); return R; }
const untilPose = async (R) => { for (let i = 0; i < 40 && R.E.k20() && R.E.k20().ph !== 'pose'; i++) await R.step(0.1); };

test('build 20: K20 — the hold 3.5 s (2.5 with the second spigot), back 0.3 a second, the walk up ≥ 1.2 s at ≤ 7 amot/s, the rise 0.35 s', () => {
  assert.equal(K20.hold, 3.5); assert.equal(K20.hold2, 2.5); assert.equal(K20.back, 0.3); assert.equal(K20.up, 1.2); assert.equal(K20.upMax, 7); assert.equal(K20.rise, 0.35);
  assert.deepEqual([K20.act.x, K20.act.z], [-60.2, 20]);
});
test('build 20: the laver first — gate20 holds every other station ("gate" with the station\'s id) and the bar\'s first slot is the laver', async () => {
  const R = rig(upTo('g20')); R.E.start(); await R.step(0.2);
  assert.equal(R.E.gate20(), true); assert.equal(R.E.step17().id, 'kiyor'); assert.equal(R.E.bar17()[0].id, 'kiyor');
  const w = R.STATIONS.wood.stand; R.at(w.x, w.z); assert.equal(await R.E.runAt('wood'), false);
  assert.deepEqual(R.ev('gate').map((e) => e.id), ['wood']); assert.equal(R.acts.length, 0);
});
test('build 20: at the laver\'s foot the act begins — he walks up to the spigots ("up"), then stands under them ("pose")', async () => {
  const R = await atLaver(); const K = R.E.k20(); assert.ok(K); assert.equal(K.ph, 'up'); assert.equal(K.T, K20.hold); assert.equal(K.first, true);
  assert.ok(K.dur >= K20.up); await untilPose(R); assert.equal(R.E.k20().ph, 'pose');
  assert.ok(Math.hypot(R.H.x - K20.act.x, R.H.z - K20.act.z) < 0.01, 'at the spigots');
  assert.deepEqual(R.ev('k20').map((e) => e.ph).slice(0, 2), ['up', 'pose']);
});
test('build 20: both thumbs fill the ring at 1/hold a second; one alone does nothing', async () => {
  const R = await atLaver(); await untilPose(R);
  R.E.k20in('L', true); await R.step(1); assert.equal(R.E.k20().p, 0, 'one hand');
  R.E.k20in('R', true); await R.step(1); assert.ok(Math.abs(R.E.k20().p - 1 / K20.hold) < 0.04, String(R.E.k20().p));
});
test('build 20: a lifted hand lets the ring fall back at K20.back a second and counts a lift', async () => {
  const R = await atLaver(); await untilPose(R);
  R.E.k20in('L', true); R.E.k20in('R', true); await R.step(1.5); const p = R.E.k20().p;
  R.E.k20in('R', false); await R.step(1); assert.ok(Math.abs(R.E.k20().p - (p - K20.back)) < 0.04); assert.equal(R.E.k20().lifts, 1);
});
test('build 20: k20in answers only L and R while the act runs', async () => {
  const R = rig(upTo('g20')); R.E.start(); await R.step(0.2); assert.equal(R.E.k20in('L', true), false, 'no act');
  const R2 = await atLaver(); assert.equal(R2.E.k20in('X', true), false); assert.equal(R2.E.k20in('L', true), true);
});
test('build 20: the full ring — washed, the unlock (its seconds, the hold, the lifts), save.k20seen, gate20 off; the next time is not "first"', async () => {
  const R = await atLaver(upTo('g20')); await untilPose(R);
  R.E.k20in('L', true); R.E.k20in('R', true); await R.step(K20.hold + 0.3);
  assert.equal(R.E.state().washed, true); assert.equal(R.E.gate20(), false); assert.equal(R.save.k20seen, 1);
  const u = R.ev('unlock'); assert.equal(u.length, 1); assert.equal(u[0].first, true); assert.ok(u[0].s > 0); assert.ok(Math.abs(u[0].held - K20.hold) < 0.25); assert.equal(u[0].lifts, 0);
  const R2 = await atLaver(upTo('g20'), { save: { k20seen: 1 } }); assert.equal(R2.E.k20().first, false);
});
test('build 20: after the rise he walks down to the laver\'s foot and the act ends (no lot before build 23)', async () => {
  const R = await atLaver(upTo('g20')); await untilPose(R); R.E.k20in('L', true); R.E.k20in('R', true); await R.step(K20.hold + 0.5);
  assert.equal(R.E.k20().ph, 'down'); await R.step(3); assert.equal(R.E.k20(), null);
  const k = R.STATIONS.kiyor.stand; assert.ok(Math.hypot(R.H.x - k.x, R.H.z - k.z) < 0.5);
});
test('build 20 + 23: with the lot on, the rise goes straight to the lot\'s circle', async () => {
  const R = await atLaver(upTo('p23')); await untilPose(R); R.E.k20in('L', true); R.E.k20in('R', true); await R.step(K20.hold + 0.6);
  assert.equal(R.E.k20(), null); assert.ok(R.E.p23(), 'the lot began');
});
test('build 20: the authored view while he washes (camWork20: the laver\'s centre and a view), none after', async () => {
  const R = await atLaver(); const c = R.E.camWork20(); assert.ok(c && c.view && c.view.t.length === 3 && c.view.p.length === 3);
  assert.deepEqual([c.x, c.z], [K20.act.x, K20.act.z]);
  const R0 = rig(upTo('g20')); R0.E.start(); await R0.step(0.1); assert.equal(R0.E.camWork20(), null);
});
test('build 20: during the act the card is the two rings ("שתי הטבעות — החזיקו") and there is no path', async () => {
  const R = await atLaver(); const w = R.E.work(R.H); assert.equal(w.job, 'sh:k20'); assert.match(w.label, /שתי הטבעות/); assert.equal(R.E.flowNext(), null);
});
