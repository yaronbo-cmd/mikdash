// build 125 (rule 66): the right thumb in stages 01–04. world/look.js is the one look module (stage 05 keeps its own boxes through
// h120/look120.js, unchanged); stages 02–04 look over the Azarah's ring from the address book; h109/grips.js decides what of the
// right half is an act's own grip. Per act, wants() is checked in the browser by the gesture probes (every grip on the right half in
// each act's own debug points, a free point far from them); here the pure parts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BOOK } from '../src/game/world/grid.js';
import { LOOK_K, LOOK_RING_K, lookPose, makeLook, ringBoxes, segHits, camInBox } from '../src/game/world/look.js';
import { LOOK05, BOXES05, sightPose as sight05 } from '../src/game/h120/look120.js';
import { gripR, bigR, nearPts, nearSeg, pickGrip } from '../src/game/h109/grips.js';

const horizonY = (p, t, fov) => { const pitch = Math.atan2(p[1] - t[1], Math.hypot(t[0] - p[0], t[2] - p[2])); return 0.5 - Math.tan(pitch) / (2 * Math.tan((fov * Math.PI) / 360)); };
const RING = ringBoxes(BOOK.s02.side, BOOK.s02.ring.T, BOOK.s02.ring.top);

test('stage 05 keeps build 124\'s shape and boxes (the same constants, the same answers)', () => {
  assert.deepEqual({ ...LOOK05 }, { UG: 2.8, PW: 2.5, S0: 0.4, S1: 0.35, U1: 0.8, D1: 110, H1: 70, F: 120, FOV1: 58, EL_MAX: 1.45, EL_MIN: 0.06, STEP: 0.05 });
  assert.equal(LOOK05, LOOK_K);
  const b = { p: [68, 20, 48], t: [68, 12, 62.5], fov: 22 };
  const a = sight05(b, 0.7, 0.4), L = makeLook({ boxes: BOXES05 }), c = L.sightPose(b, 0.7, 0.4);
  assert.deepEqual(a, c);
});

test('the ring of the Azarah from the book: four walls on its sides, as thick as the model\'s', async () => {
  await import('../src/game/h111/acts.js');
  const { H111, SIDE } = await import('../src/game/h111/model.js');
  assert.equal(BOOK.s02.ring.T, H111.T);
  assert.equal(RING.length, 4);
  for (const k of ['N', 'S']) assert.ok(RING.some((b) => b[2] < SIDE[k].c && b[5] > SIDE[k].c && b[0] <= SIDE.W.c && b[3] >= SIDE.E.c));
  for (const k of ['W', 'E']) assert.ok(RING.some((b) => b[0] < SIDE[k].c && b[3] > SIDE[k].c));
});

/** an act's shot from its stand (the kohen's stand, 13 amot behind and 30° over the point between him and his work) */
function shotOf(s) {
  const fx = s.face[0] - s.x, fz = s.face[1] - s.z, L = Math.hypot(fx, fz) || 1, ux = fx / L, uz = fz / L, t = [s.x + fx * 0.62, 1.6, s.z + fz * 0.62];
  return { p: [t[0] - ux * 13 * Math.cos(0.52), t[1] + 13 * Math.sin(0.52), t[2] - uz * 13 * Math.cos(0.52)], t, fov: 40 };
}
async function stands() {
  const R = '../src/game/';
  await import(R + 'h111/acts.js'); await import(R + 'h112/acts.js'); await import(R + 'h113/acts.js');
  const out = [];
  for (const [st, dir, fresh] of [[2, 'h111', 'freshH111'], [3, 'h112', 'freshH112'], [4, 'h113', 'freshH113']]) {
    const M = await import(R + dir + '/model.js'), A = (await import(R + dir + '/acts.js')).ACTS;
    for (const m of M.PLAN) { const s = A[m.k].stand(m, { M: { st: M[fresh]() } }); out.push({ st, id: m.id, s }); }
  }
  return out;
}

test('the sight rule at every act stand of stages 02–04: never a wall-only frame at u 0.7, yaw 0 and ±0.8', async () => {
  const L = makeLook({ boxes: RING, K: LOOK_RING_K });
  const all = await stands(); assert.ok(all.length >= 50);
  for (const { st, id, s } of all) {
    const b = shotOf(s);
    for (const yaw of [0, 0.8, -0.8]) {
      const sp = L.sightPose(b, 0.7, yaw), q = L.pose(b, 0.7, yaw + sp.dyaw, sp.lift), h = horizonY(q.p, q.t, q.fov);
      assert.ok(!camInBox(q.p, RING), `stage ${st} ${id} yaw ${yaw}: the camera in the ring`);
      assert.ok(!segHits(q.p, b.t, RING), `stage ${st} ${id} yaw ${yaw}: a wall between the camera and the work`);
      assert.ok(h > 0.03 && h < 0.6, `stage ${st} ${id} yaw ${yaw}: the horizon at ${h.toFixed(3)}`);
    }
  }
});

test('the walk next to the ring: the horizon in the frame at u ≥ 0.6 for every yaw, the camera never in the wall', () => {
  const L = makeLook({ boxes: RING, K: LOOK_RING_K });
  const W = [[-60.6, -74.5], [-190, 0], [150, 0], [-95, 76], [3, 0]];   // (outside the north wall, at the west wall, the east gate, south, Nikanor)
  for (const [x, z] of W) {
    const t = [x, 7.6, z], b = { p: [x + 15, 26.8, z + 6.6], t, fov: 32 };
    for (const u of [0.6, 0.8, 1]) for (let yaw = -2.8; yaw <= 2.8; yaw += 0.4) {
      const s = L.sightPose(b, u, yaw, undefined, null, undefined, true), q = L.pose(b, u, yaw + s.dyaw, s.lift), h = horizonY(q.p, q.t, q.fov);
      assert.ok(!camInBox(q.p, RING), `(${x}, ${z}) u ${u} yaw ${yaw.toFixed(1)}: in the wall`);
      assert.ok(h > 0.03 && h < 0.5, `(${x}, ${z}) u ${u} yaw ${yaw.toFixed(1)}: horizon ${h.toFixed(3)}`);
    }
  }
});

test('a quarter-screen drag is the far look in every stage (the same gain: u 0.7)', async () => {
  for (const dir of ['h111', 'h112', 'h113']) {
    const P = await import(`../src/game/${dir}/pack.js`), mk = Object.values(P).find((f) => typeof f === 'function');
    const pk = mk({}); assert.ok(pk.look && pk.look.walk, dir); assert.equal(+(0.25 * pk.look.ug).toFixed(2), 0.7, dir);
  }
  const L = makeLook({ act: false }); assert.equal(L.act, false); assert.equal(L.ug, 2.8); assert.ok(L.walk);
  void lookPose;
});

test('grips: the radii are of the screen; near a point, near a segment, far is the look\'s', () => {
  globalThis.innerHeight = 600;
  assert.equal(gripR(), 90); assert.ok(Math.abs(bigR() - 192) < 1e-9);
  globalThis.innerHeight = 1200; assert.equal(gripR(), 180);
  globalThis.innerHeight = 600;
  const X = { scr: (x, y) => ({ x, y, on: true }) };   // (the world point is its own screen point)
  assert.ok(nearPts(X, { x: 700, y: 300 }, [{ x: 760, y: 320, z: 0 }]));
  assert.ok(!nearPts(X, { x: 900, y: 100 }, [{ x: 760, y: 320, z: 0 }]));
  assert.ok(nearSeg(X, { x: 800, y: 330 }, { x: 600, y: 300, z: 0 }, { x: 900, y: 300, z: 0 }, 90));
  assert.ok(!nearSeg(X, { x: 800, y: 500 }, { x: 600, y: 300, z: 0 }, { x: 900, y: 300, z: 0 }, 90));
  assert.ok(nearPts(X, null, []), 'no point: the act asks for itself');
});

// ── round 3: the crane's grips. The guide rope's end lies on the stone and the stone hangs under the jib's head, so their zones overlap
// on the screen; at some rope angles the rope crossed the jib's beam and its grip went to the jib (a drag on the rope moved the crane).
// The nearest grip takes the touch: swept over the full turn of the rope, a range of stone places and jib heights, both halves.
const ring = (c, r, th) => ({ x: c.x + Math.cos(th) * r, y: c.y + Math.sin(th) * r });
const lerp2 = (a, b, u) => ({ x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u });
test('crane grips (corner): over every rope angle the rope, the stone and the jib\'s head each take their own touch', () => {
  let n = 0;
  for (const S of [{ x: 300, y: 260 }, { x: 540, y: 250 }, { x: 760, y: 300 }])   // (the stone on the left half, the middle, the right half)
    for (const up of [40, 56, 84, 140])   // (the jib's head above it: close in the play zone's wider lens, far in the work's own shot)
      for (let deg = 0; deg < 360; deg += 5)
        for (const w of [45, 80]) {
          const tip = { x: S.x - 8, y: S.y - up }, hands = { x: 337, y: 492 }, end = ring(S, w, (deg * Math.PI) / 180);
          const C = [{ k: 'jib', at: tip, R: 70 }, { k: 'hold', at: S, R: 55 }, { k: 'rope', seg: [hands, end], u1: 0.8, R: 34 }, { k: 'rope', at: hands, R: 60 }];
          const rp = lerp2(hands, end, 1 / 3);   // (where the hand takes the rope: the bot's and the ring's point)
          assert.equal(pickGrip(rp, C), 'rope', `rope at ${deg}° stone ${S.x} up ${up}`);
          assert.equal(pickGrip(S, C), 'hold'); assert.equal(pickGrip(tip, C), 'jib');
          n++;
        }
  assert.equal(n, 3 * 4 * 72 * 2);
});
test('crane grips (course): the guide rope under the jib\'s beam is still the rope, at every angle', () => {
  for (let deg = 0; deg < 360; deg += 5) {
    const tip = { x: 470, y: 200 }, mid = { x: 250, y: 120 }, S = { x: 472, y: 280 }, stake = { x: 330, y: 470 }, end = ring(S, 60, (deg * Math.PI) / 180);
    const C = [{ k: 'jib', at: tip, R: 70 }, { k: 'jib', seg: [mid, tip], R: 36 }, { k: 'hold', at: S, R: 50 }, { k: 'rope', seg: [stake, end], u1: 0.85, R: 36 }];
    assert.equal(pickGrip(lerp2(stake, end, 0.35), C), 'rope', `rope at ${deg}°`);
    assert.equal(pickGrip(S, C), 'hold'); assert.equal(pickGrip(tip, C), 'jib'); assert.equal(pickGrip(lerp2(mid, tip, 0.5), C), 'jib');
  }
  assert.equal(pickGrip({ x: 900, y: 80 }, [{ k: 'jib', at: { x: 470, y: 200 }, R: 70 }]), null, 'far from every grip: the look\'s');
  assert.equal(pickGrip({ x: 470, y: 200 }, [{ k: 'jib', at: { x: 470, y: 200 }, R: 70, on: false }]), null, 'a grip behind the camera takes nothing');
});
