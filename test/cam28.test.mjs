// CAM28: the camera guard (src/avodah/day/cam28.js) on a fake world — a wall the line may cross, the smoke cone, the rate of its change
import test from 'node:test';
import assert from 'node:assert/strict';
import { createCamGuard } from '../src/avodah/day/cam28.js';

// a wall east of him: x 8…10, up to y 30 (the line from his head to a camera beyond it, under its top, is blocked)
const segWall = (px, py, pz, tx, ty, tz) => {
  for (let i = 1; i < 40; i++) { const t = i / 40, x = tx + (px - tx) * t, y = ty + (py - ty) * t; if (x > 8 && x < 10 && y < 30) return true; }
  return false;
};
function rig(cam, hero = { x: 0, y: 16, z: 0 }, fb = segWall) {
  const st = { cam: { ...cam }, set: null };
  const view = { camNow: (o) => Object.assign(o, st.cam), camSet: (px, py, pz, tx, ty, tz) => { st.set = { px, py, pz, tx, ty, tz }; st.cam = { px, py, pz, tx, ty, tz }; }, closeCam: () => 35 };
  const G = createCamGuard({ S: { frameBlocked: fb }, gy: () => 16, heroP: () => hero, view, look: () => 'hero' });
  G.on(true);
  return { G, st };
}

test('a clear line: the camera is untouched', () => {
  const { G, st } = rig({ px: -20, py: 40, pz: 5, tx: 0, ty: 17.6, tz: 0 });
  G.step(0.016);
  assert.equal(st.set, null); assert.equal(G.state().mode, 'free');
});

test('a wall between: the elevation rises until he is seen (first frame snaps)', () => {
  const { G, st } = rig({ px: 25, py: 30, pz: 0, tx: 0, ty: 17.6, tz: 0 });
  G.step(0.016);
  const s = G.state(); assert.equal(s.mode, 'rise'); assert.ok(s.rise > 0);
  assert.ok(st.set); assert.equal(segWall(st.set.px, st.set.py, st.set.pz, 0, 17.6, 0), false);
  const d0 = Math.hypot(25, 30 - 17.6), d1 = Math.hypot(st.set.px, st.set.py - 17.6, st.set.pz);
  assert.ok(Math.abs(d1 - d0) < 0.01, 'the same distance, higher');
});

test('never a cut: after the snap the change moves ≤ 2.5 amot per 50 ms (7.5 while his line is cut)', () => {
  const { G, st } = rig({ px: -25, py: 30, pz: 0, tx: 0, ty: 17.6, tz: 0 });
  G.step(0.05);   // (clear: the snap is used up on the free pose)
  st.cam = { px: 25, py: 30, pz: 0, tx: 0, ty: 17.6, tz: 0 }; st.set = null;
  let prev = { px: 25, py: 30, pz: 0 }, maxStep = 0;
  for (let i = 0; i < 40; i++) {
    st.cam = { px: 25, py: 30, pz: 0, tx: 0, ty: 17.6, tz: 0 };   // (the follow camera asks the same pose each frame)
    G.step(0.05);
    const p = st.set || st.cam; maxStep = Math.max(maxStep, Math.hypot(p.px - prev.px, p.py - prev.py, p.pz - prev.pz)); prev = p;
  }
  assert.ok(maxStep <= 7.5 + 1e-6, `max step ${maxStep} (≤ 2.5 per 50 ms while clear, ≤ 7.5 while the line is cut)`);
  assert.equal(segWall(prev.px, prev.py, prev.pz, 0, 17.6, 0), false, 'it arrives clear');
});

test('the altar\'s smoke column stands in the line; at the pyre itself it does not', () => {
  const { G } = rig({ px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0 }, { x: -29.5, y: 16, z: 30 }, () => false);
  const S = G.smoke;
  assert.equal(G.seg(-29.5, 17.6, 30, -29.5, 60, -40), true, 'through the column above the altar');
  assert.equal(G.seg(-29.5, 17.6, 30, 0, 50, 30), false, 'beside it');
  assert.equal(G.seg(S.x, S.y + 2, S.z, S.x + 20, S.y + 25, S.z + 10), false, 'from the pyre');
});

test('the laver is a solid; under the floor is blocked', () => {
  const { G } = rig({ px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0 }, undefined, () => false);
  assert.equal(G.seg(-70, 17.6, 20, -55, 25, 20), true, 'through the laver');
  assert.equal(G.seg(-70, 17.6, 30, -55, 25, 30), false, 'beside it');
  assert.equal(G.seg(0, 17.6, 0, 10, 16.5, 0), true, 'a camera under 1 amah over the floor');
});

test('off: no change; the snap after a teleport', () => {
  const st = { cam: { px: 25, py: 30, pz: 0, tx: 0, ty: 17.6, tz: 0 } }; let set = 0;
  const view = { camNow: (o) => Object.assign(o, st.cam), camSet: () => { set++; }, closeCam: () => 35 };
  const G = createCamGuard({ S: { frameBlocked: segWall }, gy: () => 16, heroP: () => ({ x: 0, y: 16, z: 0 }), view, look: () => 'off' });
  G.on(true); G.step(0.016); assert.equal(set, 0); assert.equal(G.state().mode, 'off');
});

test('a wall that appears under a still camera: a glide, never a jump', () => {
  // (the wall rises in front of the camera's way only later: the guard begins from a clear pose)
  let wallOn = false; const fb = (px, py, pz, tx, ty, tz) => wallOn && segWall(px, py, pz, tx, ty, tz);
  const { G, st } = rig({ px: 25, py: 30, pz: 0, tx: 0, ty: 17.6, tz: 0 }, undefined, fb);
  G.step(0.05); wallOn = true;
  // (each frame's step stays within the cut line's 7.5 amot per 50 ms)
  let prev = { px: 25, py: 30, pz: 0 };
  for (let i = 0; i < 5; i++) { st.cam = { px: 25, py: 30, pz: 0, tx: 0, ty: 17.6, tz: 0 }; G.step(0.05); const p = st.set || st.cam; assert.ok(Math.hypot(p.px - prev.px, p.py - prev.py, p.pz - prev.pz) <= 7.5 + 1e-6); prev = p; }
});

// ── fable32 (build 12) ── the shift's orbit camera: the guard never turns or lifts the thumb's bearing — blocked, it comes in to the wall (pull only) ── /fable32 ──
test('pull-only (__CAM28_PULL): a wall between — the bearing is kept, the camera comes in before the wall, a little risen when very near', () => {
  globalThis.__CAM28_PULL = true;
  try {
    const { G, st } = rig({ px: 25, py: 24, pz: 0, tx: 0, ty: 17.6, tz: 0 });
    G.step(0.016);
    // (build 41: before the old pull the guard takes a readable pose about his head — WALL41, 'rise41': here 9.5 amot at 0.65 rad, still
    //  before the wall, on his bearing, not top-down)
    const s = G.state(); assert.ok(s.mode === 'rise41' || s.mode === 'pull', s.mode); assert.equal(s.turn || 0, 0);
    assert.ok(st.set); assert.equal(segWall(st.set.px, st.set.py, st.set.pz, 0, 17.6, 0), false, 'seen');
    assert.ok(st.set.px < 8 && st.set.px > 3, `before the wall, on his side: x ${st.set.px.toFixed(1)}`);
    assert.ok(Math.abs(st.set.pz) < 0.5, 'the bearing kept (no turn)');
    const d = Math.hypot(st.set.px, st.set.py - 17.6, st.set.pz); assert.ok(d >= 5 && d <= 11, `near: ${d.toFixed(1)}`);
    const el = Math.atan2(st.set.py - 17.6, Math.hypot(st.set.px, st.set.pz)); assert.ok(el < 0.9, `not top-down: ${el.toFixed(2)}`);
  } finally { delete globalThis.__CAM28_PULL; }
});
