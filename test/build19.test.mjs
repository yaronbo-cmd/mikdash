// ── recovered (R9) ── build 19 (node): the ramp run — R19 (the bag 480/340 grains, 33 a second, the goal 80 % of the ramp, the par 6 s),
// the ramp's rectangle and height (onRamp19, rampY19), the climb by the stick (no act at the ramp: the way goes on up), the run's time,
// grade and ghost (save.gh19, E.gh19), the salt station's bag and the salting (held: the grains fly onto the ramp's cells).
import test from 'node:test';
import assert from 'node:assert/strict';
import { R19, onRamp19, rampY19 } from '../src/avodah/shift/day33.js';
import { rig, upTo } from './rig33.mjs';

const twinStub = (held = false) => ({ held, held19() { return this.held; }, stick: () => ({ on: true }), pace: {} });
async function climb(R, x = -38, from = 46, to = 11, dz = 1.2) { for (let z = from; z >= to; z -= dz) { R.at(x, z, rampY19(z)); R.H.yaw = Math.PI; await R.step(0.1); } }
async function saltPass(R, x, up) { const [a, b] = up ? [42, 12] : [12, 42]; for (let z = a; up ? z >= b : z <= b; z += up ? -0.5 : 0.5) { R.at(x, z, rampY19(z)); R.H.yaw = up ? Math.PI : 0; await R.step(0.1); } }

test('build 19: R19 — the bag 480 grains on day 1, 340 after; 33 a second; the goal 80 %; the par 6 s; the head at z 12', () => {
  assert.deepEqual([...R19.bag], [480, 340]); assert.equal(R19.rate, 33); assert.equal(R19.goal, 0.8); assert.equal(R19.par, 6); assert.equal(R19.head, 12);
  assert.equal(R19.after, 5); assert.equal(R19.v1, 7.5); assert.equal(R19.swayMax, 0.5);
});
test('build 19: the ramp — x −46…−30, z 10.5…42.5; its height 16 at the foot to 25 at the top, clamped', () => {
  assert.ok(onRamp19(-38, 20)); assert.ok(!onRamp19(-47, 20)); assert.ok(!onRamp19(-38, 43)); assert.ok(!onRamp19(-38, 10));
  assert.equal(rampY19(42.5), 16); assert.equal(rampY19(10.5), 25); assert.equal(rampY19(60), 16); assert.equal(rampY19(0), 25);
  assert.ok(Math.abs(rampY19(26.5) - 20.5) < 1e-9);
});
test('build 19: the salt station is open from the first level (b19), and the ramp is no act any more — the way goes on up', async () => {
  const R = rig(upTo('b19'), { twin: twinStub() }); R.E.start(); await R.step(0.2);
  assert.deepEqual(R.E.state().open, ['wood', 'kevesh', 'salt']); assert.equal(R.E.b19, true);
  R.E.debug.logs(2); const k = R.STATIONS.kevesh.stand; R.at(k.x, k.z); await R.E.runAt('kevesh');
  assert.equal(R.acts.filter((a) => a.id === 'kevesh').length, 0, 'no kevesh act');
});
test('build 19: a run up the ramp with logs — its time from z 40 to the head, gold within the par, the ghost kept (save.gh19)', async () => {
  const R = rig(upTo('b19'), { twin: twinStub() }); R.E.start(); await R.step(0.2); R.E.debug.logs(3); R.at(-38, 46); await R.step(0.2);
  await climb(R);
  const top = R.ev('top'); assert.equal(top.length, 1); assert.equal(top[0].g, 'gold'); assert.ok(top[0].dur > 0 && top[0].dur <= R19.par);
  const gh = R.E.gh19(); assert.ok(gh && gh.t === top[0].dur && gh.p.length > 4); assert.equal(R.save.gh19, gh); assert.equal(R.E.state().rampBest, top[0].dur);
});
test('build 19: a slow run is good, not gold — and does not replace a better ghost', async () => {
  const R = rig(upTo('b19'), { twin: twinStub() }); R.E.start(); await R.step(0.2); R.E.debug.logs(3); R.at(-38, 46); await R.step(0.2);
  await climb(R); const best = R.E.gh19().t;
  R.E.debug.logs(3); R.at(-38, 46, 16); await R.step(0.3); await climb(R, -38, 46, 11, 0.25);
  const t2 = R.ev('top').at(-1); assert.equal(t2.g, 'good'); assert.ok(t2.dur > R19.par); assert.equal(R.E.gh19().t, best);
});
test('build 19: the salt station fills the bag (480 on day 1) — "שק מלח על החגורה"', async () => {
  const R = rig(upTo('b19'), { twin: twinStub() }); R.E.start(); await R.step(0.2);
  const s = R.STATIONS.salt.stand; R.at(s.x, s.z); assert.equal(await R.E.runAt('salt'), true);
  assert.equal(R.E.st33.r19.bag, R19.bag[0]); assert.equal(R.E.st33.r19.bags, 1); assert.ok(R.ev('done').some((e) => /מלח/.test(e.text)));
});
test('build 19: salting — held on the ramp with the bag, the grains land on its cells; three lanes reach the goal: "salted" and a gold coin', async () => {
  const R = rig(upTo('b19'), { twin: twinStub(true) }); R.E.start(); await R.step(0.2);
  const s = R.STATIONS.salt.stand; R.at(s.x, s.z); await R.E.runAt('salt');
  await saltPass(R, -35.5, false); const c1 = R.E.st33.r19.cov; assert.ok(c1 > 0.3, 'one lane ' + c1); assert.ok(R.E.st33.r19.bag < R19.bag[0]);
  await saltPass(R, -31.5, true); await saltPass(R, -35.5, false); await R.step(0.5);
  assert.ok(R.E.st33.r19.cov >= R19.goal); assert.equal(R.ev('salted').length, 1);
});
test('build 19: without holding nothing is thrown', async () => {
  const R = rig(upTo('b19'), { twin: twinStub(false) }); R.E.start(); await R.step(0.2);
  const s = R.STATIONS.salt.stand; R.at(s.x, s.z); await R.E.runAt('salt'); await saltPass(R, -35.5, false);
  assert.equal(R.E.st33.r19.bag, R19.bag[0]); assert.equal(R.E.st33.r19.cov, 0);
});
test('build 19: the climb\'s camera — on the ramp above its head the shared camera is the ramp\'s (SHARED.cam17.id "ramp")', async () => {
  const { SHARED } = await import('../src/avodah/shift/draw.js');
  const R = rig(upTo('b19'), { twin: twinStub() }); R.E.start(); await R.step(0.2); R.E.debug.logs(2);
  R.at(-38, 30, rampY19(30)); await R.step(0.2); assert.equal(SHARED.cam17 && SHARED.cam17.id, 'ramp');
  R.at(-20, 50, 16); await R.step(0.2); assert.ok(!SHARED.cam17 || SHARED.cam17.id !== 'ramp');
});
