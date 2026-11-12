// build 124: the right thumb's look in stage 05's walled court (h120/look120.js): its shape (pulls back and rises; the work in the
// frame's lower half, the horizon near its top) and its sight rule (nothing between the camera and the work, never in a wall)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lookPose, sightPose, sightLift, segHits, camInBox, BOXES05, LOOK05 } from '../src/game/h120/look120.js';

/** a world point's place on the screen (fractions from the top-left) for a camera at p looking at t with a vertical lens fov (deg) */
function screenOf(p, t, fov, q, aspect = 1.6) {
  const f = [t[0] - p[0], t[1] - p[1], t[2] - p[2]], L = Math.hypot(...f); f.forEach((v, i) => { f[i] = v / L; });
  let r = [-f[2], 0, f[0]]; const rl = Math.hypot(r[0], r[2]); r = [r[0] / rl, 0, r[2] / rl];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const v = [q[0] - p[0], q[1] - p[1], q[2] - p[2]], d = v[0] * f[0] + v[1] * f[1] + v[2] * f[2];
  const tv = Math.tan((fov * Math.PI) / 360), x = (v[0] * r[0] + v[1] * r[1] + v[2] * r[2]) / d, y = (v[0] * u[0] + v[1] * u[1] + v[2] * u[2]) / d;
  return { x: 0.5 + x / (2 * tv * aspect), y: 0.5 - y / (2 * tv), front: d > 0 };
}
const horizonY = (p, t, fov) => { const pitch = Math.atan2(p[1] - t[1], Math.hypot(t[0] - p[0], t[2] - p[2])); return 0.5 - Math.tan(pitch) / (2 * Math.tan((fov * Math.PI) / 360)); };

// three acts' shots: a column at S2 (from the court), the east wing's column EN, the mikveh in the lepers' chamber
const SHOTS = [
  { p: [68, 20, 48], t: [68, 12, 62.5], fov: 22 },
  { p: [120, 20, -16], t: [136, 12, -16.25], fov: 22 },
  { p: [20, 14, -50], t: [13, 6.5, -48], fov: 22 },
  { p: [62.5, 30.4, 51.5], t: [62.5, 17, 65.1], fov: 22 },   // the planks' bay, on the gallery
];

test('u = 0 is the act\'s own shot', () => {
  for (const b of SHOTS) { const q = lookPose(b, 0, 0, 0); q.p.forEach((v, i) => assert.ok(Math.abs(v - b.p[i]) < 1e-6)); q.t.forEach((v, i) => assert.ok(Math.abs(v - b.t[i]) < 1e-6)); assert.equal(q.fov, b.fov); }
});

test('the far look (u 0.7 … 1, straight back): the work in the lower half, the horizon between 12 % and 35 % from the top', () => {
  for (const b of SHOTS) for (const u of [0.7, 0.85, 1]) {
    const q = lookPose(b, u, 0, 0), w = screenOf(q.p, q.t, q.fov, b.t), h = horizonY(q.p, q.t, q.fov);
    assert.ok(w.front && w.y > 0.5 && w.y < 0.95 && w.x > 0.05 && w.x < 0.95, `work at ${JSON.stringify(w)} (u ${u}, aim ${b.t})`);
    if (u === 1) assert.ok(h > 0.12 && h < 0.35, `horizon at ${h.toFixed(3)} (aim ${b.t})`);
    assert.ok(q.p[1] > b.p[1], 'it rises');
  }
});

test('the small look (u ≤ 0.15, |yaw| ≤ 0.5) keeps the work in the frame', () => {
  for (const b of SHOTS) for (const u of [0.05, 0.15]) for (const yaw of [-0.5, 0, 0.5]) {
    const q = lookPose(b, u, yaw, 0), w = screenOf(q.p, q.t, q.fov, b.t);
    assert.ok(w.front && w.x > 0.1 && w.x < 0.9 && w.y > 0.1 && w.y < 0.9, `work at ${JSON.stringify(w)}`);
  }
});

test('the sight rule: at any u and yaw (±2.8) nothing stands between the camera and the work, never in or just behind a wall', () => {
  for (const b of SHOTS) for (const u of [0, 0.15, 0.3, 0.6, 1]) for (let yaw = -2.8; yaw <= 2.8 + 1e-9; yaw += 0.4) {
    const s = sightPose(b, u, yaw), q = lookPose(b, u, yaw + s.dyaw, s.lift);
    assert.ok(!camInBox(q.p, BOXES05), `camera in a wall at ${q.p} (u ${u}, yaw ${yaw.toFixed(1)})`);
    assert.ok(!segHits(q.p, b.t, BOXES05), `the line to the work is cut (u ${u}, yaw ${yaw.toFixed(1)}, aim ${b.t})`);
    assert.ok(q.p[1] > b.t[1] + 1.4, 'above the work');
  }
});

test('the sight rule lifts the camera over a wall (the act\'s yaw turned to the wall side of a column under the gallery)', () => {
  const b = SHOTS[0];
  assert.equal(sightLift(b, 1, 0), 0);
  const behind = sightPose(b, 1, Math.PI);   // (straight behind the south wall: 44 high, the gallery over the work)
  assert.ok(behind.dyaw !== 0 || behind.lift !== 0);
  const s = sightPose(b, 1, Math.PI), q = lookPose(b, 1, Math.PI + s.dyaw, s.lift);
  assert.ok(!segHits(q.p, b.t) && !camInBox(q.p));
});

test('the boxes: the court\'s walls, the chambers and the gallery', () => {
  assert.ok(BOXES05.length >= 18);
  assert.ok(camInBox([70, 30, 70]), 'in the south wall');
  assert.ok(!camInBox([70, 30, 0]), 'over the court');
  assert.ok(segHits([70, 30, 100], [70, 8, 0]), 'through the south wall');
  assert.ok(LOOK05.FOV1 >= 40);
});
