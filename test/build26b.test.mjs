// ── recovered (R9) ── build 26b (node): the Heichal morning within its time — the second lot where he stands (circle26/free26: the circle
// forms round him; on the altar's top "רדו מן המזבח" and the lot at the ramp's foot), lamps 2–5 in three gestures (one swipe up removes the
// wick and wipes the lamp), the faster pour (1.5 a second to the knee), the menorah's time scale 13→39 s, any pause releasing the held pour
// or key (nothing judged; no new hold while paused), the camera at the lamp.
import test from 'node:test';
import assert from 'node:assert/strict';
import { P26, P23 } from '../src/avodah/shift/day33.js';
import { rig, FLAGS } from './rig33.mjs';

async function morning() { const R = rig(FLAGS); R.E.start(); await R.step(0.2); R.E.debug.wash20(); R.E.debug.skip23('m22'); R.E.debug.skip22(); return R; }
async function toMenorah() {
  const R = await morning(); R.E.debug.skip26('menorah'); await R.step(0.1);
  R.at(P26.gate.x + 2, P26.gate.z); await R.step(0.8); R.E.r26swipe(0.5, 0, 100); R.E.r26hold(true); await R.step(1.0); R.E.r26hold(false); await R.step(1.2);
  R.at(P26.walkM.x + 1, P26.walkM.z); await R.step(1.0); return R;
}

test('build 26b: the second lot where he stands — the circle forms round him (seat 0 at his place), the kohanim walk in', async () => {
  const R = await morning(); R.at(-60, 30); await R.step(0.3);
  const K = R.E.p23(); assert.ok(K && K.k26, 'the second lot began'); const s0 = R.E.seat23(0, K.C);
  assert.ok(Math.hypot(s0.x - -60, s0.z - 30) <= 1.7, `seat 0 ${s0.x.toFixed(1)},${s0.z.toFixed(1)}`);
  for (let i = 0; i < P23.seats; i++) { const s = R.E.seat23(i, K.C); assert.ok(Math.abs(Math.hypot(s.x - K.C.x, s.z - K.C.z) - P23.r) < 1e-9); }
});
test('build 26b: on the altar\'s top the second lot waits — "הפיס השני — רדו מן המזבח", the way to the ramp\'s foot (lot26)', async () => {
  const R = await morning(); R.at(-34, 0, 25); await R.step(0.3);
  assert.ok(!R.E.p23(), 'no lot on the altar'); assert.match(R.E.step17().text, /רדו מן המזבח/);
  const f = R.E.flowNext(); assert.equal(f.id, 'lot26'); assert.deepEqual([f.at.x, f.at.z], [P26.foot.x, P26.foot.z]);
  const w = R.E.work(R.H); assert.match(w.label, /רגל הכבש/); assert.equal(w.job, 'sh:go:r26');
});
test('build 26b: lamps 2–5 in three gestures — one swipe up takes the wick and wipes the lamp ("both"), then pour, then light', async () => {
  const R = await toMenorah(); R.E.r26swipe(0, -0.5, 100); R.E.r26swipe(0.5, 0, 100);
  R.E.r26hold(true); for (let i = 0; i < 40 && R.E.r26().fill < 0.95; i++) await R.step(0.05); R.E.r26hold(false); await R.step(0.05); R.E.r26tap(); await R.step(P26.lit + 0.1);
  assert.equal(R.E.r26().ph, 'wick'); assert.equal(R.E.r26().li, 1);
  assert.equal(R.E.r26swipe(0, -0.5, 100), true); assert.equal(R.E.r26().ph, 'pour', 'no wipe for lamp 2');
  assert.equal(R.ev('r26swipe').at(-1).both, true);
});
test('build 26b: the first lamp keeps its four gestures (the wick, then the wipe)', async () => {
  const R = await toMenorah(); R.E.r26swipe(0, -0.5, 100); assert.equal(R.E.r26().ph, 'wipe'); assert.equal(R.ev('r26swipe').at(-1).both, false);
});
test('build 26b: the faster pour — 1.5 a second to the knee (0.7), so the band (0.9–1.0) comes at ≈ 1.06–1.35 s', () => {
  const P = P26.pour; assert.equal(P.r0, 1.5); assert.equal(P.knee, 0.7);
  const tLo = P.knee / P.r0 + (P.lo - P.knee) / P.r1, tHi = P.knee / P.r0 + (P.hi - P.knee) / P.r1;
  assert.ok(Math.abs(tLo - 1.055) < 0.01 && Math.abs(tHi - 1.349) < 0.01, `${tLo} ${tHi}`); assert.ok(Math.abs(tHi - tLo - 0.29) < 0.01, 'the band 0.29 s wide');
});
test('build 26b: the menorah\'s time scale 13 → 39 s (P26.tT) — the mastery\'s time part', () => {
  assert.deepEqual([...P26.tT.menorah], [13, 39]); assert.deepEqual([...P26.tT.inner], [4, 12]);
});
test('build 26b: a pause releases the held pour — nothing judged ("r26hold" off, why pause), and no new hold while paused', async () => {
  const R = await toMenorah(); R.E.r26swipe(0, -0.5, 100); R.E.r26swipe(0.5, 0, 100);
  R.E.r26hold(true); await R.step(0.3); const fill = R.E.r26().fill; const n = R.ev('r26pour').length;
  R.E.pause(true); assert.equal(R.E.r26().held, false); assert.equal(R.ev('r26hold').at(-1).why, 'pause'); assert.equal(R.ev('r26pour').length, n, 'not judged');
  assert.equal(R.E.r26hold(true), false, 'no hold while paused'); R.E.pause(false); await R.step(0.2);
  assert.equal(R.E.r26().fill, fill, 'the oil stays'); assert.equal(R.E.r26hold(true), true);
});
test('build 26b: a pause releases the gate\'s key too (it turns back after)', async () => {
  const R = await morning(); R.E.debug.skip26('menorah'); await R.step(0.1); R.at(P26.gate.x + 2, P26.gate.z); await R.step(0.8);
  R.E.r26swipe(0.5, 0, 100); R.E.r26hold(true); await R.step(0.3); R.E.pause(true); assert.equal(R.E.r26().held, false); R.E.pause(false);
  const kp = R.E.r26().kp; await R.step(0.2); assert.ok(R.E.r26().kp < kp);
});
test('build 26b: the camera at the lamp — from his side, about 3.2 amot off the lamp, and it follows the active lamp', async () => {
  const R = await toMenorah(); R.E.r26swipe(0, -0.5, 100); const a = R.E.camWork26();
  const d = Math.hypot(a.view.p[0] - a.view.t[0], a.view.p[2] - a.view.t[2]); assert.ok(d > 2.6 && d < 4.2, String(d));
  R.E.r26swipe(0.5, 0, 100); R.E.r26hold(true); for (let i = 0; i < 40 && R.E.r26().fill < 0.95; i++) await R.step(0.05); R.E.r26hold(false); await R.step(0.05); R.E.r26tap(); await R.step(P26.lit + 0.1);
  const b = R.E.camWork26(); assert.notDeepEqual(a.view.t, b.view.t, 'the next lamp');
});
