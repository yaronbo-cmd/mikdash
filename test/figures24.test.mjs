// FIGURES24: the kohen figure's pose library (the hands where the pose says — the blessing above the head, palms out, the hands
// together at the middle), the old calls still answer, no red colour, no Name; the close-up camera blends in, holds, and lets go.
//   node --test test/figures24.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { man, POSES, POSE, ROBE, SKIN, crowd } from '../src/avodah/works/figures.js';
import { closeup, closeAt, release, closeTick, closeState, closeReset } from '../src/avodah/works/closeup.js';
import { isRed } from '../src/avodah/works/kit.js';

const NAME = new RegExp(['ה׳', 'אלקים', 'א-ל', 'הֳ'].join('|'));
// a kit without a scene: the figure's math runs, nothing is drawn
const fakeKit = () => ({ F: { on: true, x: 0, y: 0, z: 0, fx: 1, fz: 0, K: 1.5, Ca: 1, a0: 0 }, world(a, s, y, o) { o.x = a * 1.5; o.y = y * 1.5; o.z = s * 1.5; return o; }, c() {}, s() {}, b() {} });

test('the pose library has every pose the works need', () => {
  for (const p of ['stand', 'walk', 'carry', 'scoop', 'pour', 'bow', 'bless']) assert.ok(POSES.includes(p) && POSE[p], p);
});
test('the blessing: both hands above the head, at the middle, in front of the face (yaw 0)', () => {
  const k = fakeKit(), h = man(k, 0, 0, 0, { pose: 'bless', u: 1 });
  assert.ok(h.R[2] > h.head[2] - 0.05 && h.L[2] > h.head[2] - 0.05, `hands ${h.R[2].toFixed(2)} / ${h.L[2].toFixed(2)} over the head ${h.head[2].toFixed(2)}`);
  assert.ok(Math.abs(h.R[1]) < 0.16 && Math.abs(h.L[1]) < 0.16, 'the hands together at the middle');
  assert.ok(h.R[1] * h.L[1] < 0, 'one hand on each side');
  assert.ok(h.R[0] > -0.05, 'not behind the head');
  const d = man(k, 0, 0, 0, { pose: 'bless', u: 0 });
  assert.ok(d.R[2] < 0.9, 'u 0: the hands down');
});
test('carry: the hands in front at the waist; scoop: the hands low and forward; bow: the head comes down', () => {
  const k = fakeKit();
  const c = man(k, 0, 0, 0, { pose: 'carry' }); assert.ok(c.R[0] > 0.2 && c.R[2] > 0.7 && c.R[2] < 1.15, JSON.stringify(c.R));
  const s = man(k, 0, 0, 0, { pose: 'scoop' }); assert.ok(s.R[2] < 0.75 && s.R[0] > 0.3, JSON.stringify(s.R));
  const st = man(k, 0, 0, 0, { pose: 'stand' }), b = man(k, 0, 0, 0, { pose: 'bow' });
  assert.ok(b.head[2] < st.head[2] - 0.2 && b.head[0] > st.head[0] + 0.3, 'the bow');
});
test('the old calls still answer (arms, torch, sit, lying, lean, scale)', () => {
  const k = fakeKit();
  for (const o of [{}, { arms: 0.5 }, { arms: 2.3 }, { torch: 1, t: 1 }, { sit: true }, { lying: true }, { lean: 0.8 }, { scale: 0.9, robe: ROBE.levi, skin: SKIN[2] }]) {
    const h = man(k, 1, 2, 0, o); for (const v of [h.L, h.R, h.head]) assert.ok(v.every(Number.isFinite), JSON.stringify(o));
  }
  const up = man(k, 0, 0, 0, { arms: 2.3 }); assert.ok(up.R[2] > 1.4, 'arms 2.3: the hands up');
  crowd(k, [[0, 0, 0, { pose: 'walk', t: 1 }], [1, 1, 0]]);
});
test('no red colour and no Name in the figure or the camera', () => {
  for (const f of ['src/avodah/works/figures.js', 'src/avodah/works/closeup.js']) {
    const src = fs.readFileSync(f, 'utf8');
    assert.ok(!NAME.test(src), f + ' carries a Name');
    for (const m of src.match(/'#[0-9A-Fa-f]{6}'/g) || []) assert.ok(!isRed(m.slice(1, -1)), f + ' red ' + m);
  }
  for (const c of [...SKIN, ...Object.values(ROBE)]) assert.ok(!isRed(c), c);
});
test('the close-up: in over ms, the point in the middle, held while asked, then back to the follow camera', () => {
  closeReset();
  const cam = { px: 0, py: 20, pz: -20, tx: 0, ty: 0, tz: 0 };
  const view = { camNow(o) { Object.assign(o, cam); return o; }, set: null, camSet(px, py, pz, tx, ty, tz) { this.set = [px, py, pz, tx, ty, tz]; } };
  assert.equal(closeTick(view, 0.016), false, 'idle: the follow camera untouched');
  closeup({ x: 10, y: 2, z: 5 }, { dist: 6, el: 0.44, ms: 1200, hold: 2 });
  for (let i = 0; i < 80; i++) closeTick(view, 0.016);   // 1.28 s
  const s = view.set, d = Math.hypot(s[0] - 10, s[1] - 2, s[2] - 5);
  assert.ok(Math.abs(d - 6) < 0.05, 'at its distance ' + d.toFixed(2));
  assert.deepEqual(s.slice(3).map((v) => +v.toFixed(2)), [10, 2, 5], 'the act in the middle');
  const el = Math.asin((s[1] - 2) / d); assert.ok(el > 0.34 && el < 0.53, 'el ' + el.toFixed(2));
  release(); for (let i = 0; i < 80; i++) closeTick(view, 0.016);
  assert.equal(closeState().on, false, 'released'); assert.equal(closeTick(view, 0.016), false);
  // a single call holds `hold` s, then lets go by itself
  const k = fakeKit(); assert.ok(closeAt(k, 2, 0, 1, { hold: 0.01 }));
  assert.equal(closeState().goal, 1);
});
test('after a release, the same work\'s lingering frames do not take the camera back', () => {
  closeReset();
  assert.ok(closeup({ x: 0, y: 0, z: 0 }, { key: 'w1' })); release();
  assert.equal(closeup({ x: 0, y: 0, z: 0 }, { key: 'w1' }), false);
  assert.ok(closeup({ x: 0, y: 0, z: 0 }, { key: 'w2' }));
  closeReset();
});
test('a new point while the close-up holds: a glide, never a cut', () => {
  closeReset();
  const cam = { px: 0, py: 20, pz: -20, tx: 0, ty: 0, tz: 0 };
  const view = { camNow(o) { Object.assign(o, cam); return o; }, camSet(px, py, pz, tx, ty, tz) { this.set = [px, py, pz, tx, ty, tz]; } };
  closeup({ x: 0, y: 0, z: 0 }, { key: 'a', hold: 9 }); for (let i = 0; i < 90; i++) closeTick(view, 0.016);
  closeup({ x: 4, y: 0, z: 0 }, { key: 'b', hold: 9 }); closeTick(view, 0.016);
  assert.ok(view.set[3] < 0.3, 'one frame later the target has moved only a little: ' + view.set[3].toFixed(2));
  for (let i = 0; i < 120; i++) closeTick(view, 0.016);
  assert.ok(Math.abs(view.set[3] - 4) < 0.05, 'then it is there');
  closeReset();
});
test('a blocked line: the close-up turns, rises or comes nearer, and keeps it while the work asks again', () => {
  closeReset();
  const cam = { px: -30, py: 20, pz: 0, tx: 0, ty: 0, tz: 0 };
  const view = { camNow(o) { Object.assign(o, cam); return o; }, camSet(px, py, pz, tx, ty, tz) { this.set = [px, py, pz, tx, ty, tz]; } };
  const wall = (px) => px < -3.5;   // (a wall 3.5 west of the act: the asked side is the west)
  for (let i = 0; i < 100; i++) { closeup({ x: 0, y: 0, z: 0 }, { dist: 6, az: Math.PI, key: 'k' }); closeTick(view, 0.016, (px) => wall(px)); }
  assert.ok(view.set[0] >= -3.5, 'the camera is clear of the wall: x ' + view.set[0].toFixed(2));
  closeReset();
});
test('no clear pose anywhere: no close-up (the follow camera keeps the frame), and the same key waits', () => {
  closeReset();
  const cam = { px: -30, py: 20, pz: 0, tx: 0, ty: 0, tz: 0 };
  const view = { set: null, camNow(o) { Object.assign(o, cam); return o; }, camSet(...a) { this.set = a; } };
  closeup({ x: 0, y: 0, z: 0 }, { key: 'walled' });
  assert.equal(closeTick(view, 0.016, () => true), false);
  assert.equal(view.set, null, 'the camera untouched');
  assert.equal(closeState().on, false);
  assert.equal(closeup({ x: 0, y: 0, z: 0 }, { key: 'walled' }), false, 'not retried at once');
  closeReset();
});
