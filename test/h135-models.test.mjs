// build 135 — stage 12 "הכיור" (spec docs/specs/shlav-12-he.md v7; kinematics docs/specs/shlav-12-kinematika-he.md): the book's places,
// the machine's kinematics (v8: axle, drum, chains, vertical wheel) and load test, the channel's gravity and flow, the spigots' arcs, the stage's flow.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOK } from '../src/game/world/grid.js';
import * as K from '../src/game/h135/mukhni-model.js';
import * as H from '../src/game/h135/hamshacha-model.js';
import * as D from '../src/game/h135/dadim-model.js';
import { createH135, PLAN, STAGE_FLOW, KINDS, fromOld, lossPts } from '../src/game/h135/model.js';

const S12 = BOOK.s12;
const inBox = ([x, z], b) => x >= b[0] && x <= b[2] && z >= b[1] && z <= b[3];

test('book: the kiyor, its pit, 12 seats in two rows, 6 stations, the machine on the pit\'s rim', () => {
  assert.equal(S12.seats.length, 12);
  assert.equal(S12.seats.filter((s) => s.row === 'up').length, 6);
  assert.equal(S12.stations.length, 6);
  const P = S12.pit.box, M = S12.mukhni;
  for (const z of M.posts) assert.ok(z < P[1] || z > P[3], 'post on the rim, outside the pit ' + z);
  assert.ok(M.wheel.z > P[3] && M.wheel.z < M.axle.z1, 'the wheel south of the pit, on the axle');
  assert.ok(M.axle.y - M.wheel.r > 16, 'the wheel clears the floor');
  // (spec v8 §13b: the platform and its stairs cut nothing: the pit with its rim, the basin, the spill, the strip of earth)
  const ov = (a, b) => a[0] < b[2] && b[0] < a[2] && a[1] < b[3] && b[1] < a[3], t = S12.pit.rimT, rim = [P[0] - t, P[1] - t, P[2] + t, P[3] + t];
  const sp = S12.spill, spB = [sp.from[0] - 0.3, Math.min(sp.from[1], sp.to[1]), sp.from[0] + 0.3, Math.max(sp.from[1], sp.to[1])];
  for (const b of [M.platform.box, M.stairs.box]) { assert.ok(!ov(b, rim) && !ov(b, S12.basin.box) && !ov(b, spB), 'platform clear ' + b); assert.ok(b[3] <= S12.field.z0, 'before the strip'); }
  assert.ok(M.wheel.y - M.wheel.r - M.platform.y > 0.8 && M.wheel.y - M.wheel.r - M.platform.y < 2, 'the rim\'s lower handles at his hands');
  assert.ok(M.stand[0] > M.platform.box[0] && M.stand[0] < M.platform.box[2] && M.stand[1] > M.platform.box[1] && M.stand[1] < M.platform.box[3], 'he stands on the platform');
  assert.ok(inBox([M.x, M.z], P));
  assert.ok(S12.pit.floor <= S12.kiyor.stop - 2, 'the pit is deep enough for the stop');
  // the stations stand outside the pit
  for (const st of S12.stations) assert.ok(!inBox([st.x, st.z], P), 'station outside the pit');
});

test('kinematics: the chains are long enough over the whole descent; one turn = one amah', () => {
  const M = S12.mukhni, KI = S12.kiyor;
  for (let d = 0; d <= 9; d += 0.25) {
    const lugY = K.MK.Y0 - d + KI.h + 0.18;
    for (const cz of M.chains.z) { const need = M.axle.y - M.drum.rDraw - lugY; assert.ok(need <= M.chains.len + 1e-6, `chain short ${need} at d=${d}`); assert.ok(Math.abs(cz - M.drum.z) < M.drum.L / 2 && Math.abs(cz - S12.kiyor.z) < S12.kiyor.r1, 'the groove on the drum, the lug on the rim, plumb'); }
    assert.ok(lugY < M.axle.y - M.drum.r, 'the kiyor under the drum');
  }
  const S = K.fresh(2); let t = 0;
  while (!S.done && t < 60) { K.step(S, 1 / 60, { hold: true, fw: 0.4, brake: Math.max(0, Math.min(1, (S.load - K.MK.F_K) / K.MK.BR + (S.w - 0.4) * 3)) }); t += 1 / 60; }
  assert.ok(Math.abs(S.ang / (Math.PI * 2) - S.d) < 1e-6);
  assert.equal(K.bottom(S), K.MK.Y0 - 9);
});

function runMk(lv, pol) { const S = K.fresh(lv); let t = 0; while (!S.done && t < 120) { K.step(S, 1 / 60, pol(S, t)); t += 1 / 60; } return { S, r: K.result(S), t }; }
const ramp = (S, t) => { const tg = Math.min(0.4, t * 0.25); return { hold: true, fw: tg, brake: Math.max(0, Math.min(1, (S.load - K.MK.F_K) / K.MK.BR + (S.w - tg) * 3)) }; };
test('load test: two hands (finger + brake) bring every level down all gold; one hand alone dents; a fixed brake sticks', () => {
  for (const lv of [1, 2, 3]) { const { r, S } = runMk(lv, ramp); assert.equal(r.stars, 3, 'lv' + lv); assert.equal(S.steps.length, K.REVS[lv]); }
  for (const lv of [2, 3]) { const { r } = runMk(lv, () => ({ hold: true, fw: 0.35, brake: 0 })); assert.ok(r.stars < 3 && r.flags.dents > 0, 'one hand lv' + lv); }
  const stuck = K.fresh(2); const ev = []; for (let i = 0; i < 240; i++) ev.push(...K.step(stuck, 1 / 60, { hold: true, fw: 0.4, brake: 1 }));
  assert.ok(ev.some((e) => e.k === 'stuck'));
  // level 1: the shoe is automatic, any gentle finger is gold
  assert.equal(runMk(1, () => ({ hold: true, fw: 1, brake: 0 })).r.stars, 3);
});
test('load: the water lifts the kiyor (the pull falls as it sinks); a reload resumes at the last whole turn', () => {
  const S = K.fresh(2); const g0 = K.pull(S); S.d = 8; assert.ok(K.pull(S) < g0);
  const S3 = K.fresh(3); assert.ok(K.pull(S3) > g0, 'level 3 full is heavier');
  const { S: done } = runMk(2, ramp); const b = K.save(done, 'mukhni2'); b.steps = b.steps.slice(0, 5);
  const L = K.load(b); assert.equal(L.d, 5); assert.equal(L.crossed.rim, 1);
});

test('gravity: Bor HaGolah\'s water stands above both mouths, the bed falls from the mouths to the basin, the basin\'s line under the water', () => {
  assert.ok(H.gravityOk(S12));
  const G = S12.golah, F = S12.field;
  assert.ok(G.level > G.mouthY);
  assert.ok(F.bed0 <= G.mouthY && F.bed1 < F.bed0);
  assert.ok(S12.basin.line < G.level);
});
function playH(lv, paths, opts = {}) {
  const S = H.fresh(lv, S12);
  const hands = () => (opts.pack ? S.bends.filter((b) => b.state === 'ok' || b.state === 'breach').map((b) => ({ x: b.x, z: b.z })) : []);
  for (const path of paths) {
    H.touch(S, ...path[0]);
    for (let k = 1; k < path.length; k++) {
      const [ax, az] = path[k - 1], [bx, bz] = path[k], n = Math.ceil(Math.hypot(bx - ax, bz - az) / 0.15);
      for (let s = 1; s <= n; s++) { H.dig(S, ax + ((bx - ax) * s) / n, az + ((bz - az) * s) / n); H.step(S, 1 / 60, hands()); }
    }
    H.lift(S);
  }
  let t = 0; while (!S.done && t < 90) { H.step(S, 1 / 30, hands()); t += 1 / 30; }
  return { S, r: H.result(S) };
}
const L2 = [[[-69, 56.8], [-69, 44], [-63, 44], [-63, 38]], [[-60, 56.8], [-60, 50.5], [-66, 50.5], [-66, 44.6]], [[-63, 38], [-63, 32.5], [-60.5, 32.5], [-60.5, 28.1]]];
const L3 = [[[-69, 56.8], [-69, 44], [-64, 44], [-64, 39.5], [-66, 39.5], [-66, 32.8], [-60.5, 32.8], [-60.5, 28.1]], L2[1]];
test('channel: the dug paths carry the water to the basin; packed bends hold → 3 stars; unpacked bends breach and the work waits', () => {
  for (const [lv, P] of [[2, L2], [3, L3]]) {
    const ok = playH(lv, P, { pack: true }); assert.ok(ok.S.done, 'lv' + lv); assert.equal(ok.r.stars, 3, 'lv' + lv);
    const bad = playH(lv, P); assert.ok(!bad.S.done || bad.r.stars < 3, 'unpacked lv' + lv);
  }
  const t = H.trace(playH(2, L2, { pack: true }).S); assert.ok(t.cells.length > 50);
});

test('spigots: every level solvable — each seat has an aim that lands its stream in its station\'s hands; 3 stars with the ideal aims', () => {
  for (const lv of [1, 2, 3]) {
    const S = D.fresh(lv, S12);
    for (const n of S.seats) {
      const s = D.seatOf(S, n), target = S.stations.includes(s.i) ? s.i : S.stations[0];
      D.place(S, n);
      const sol = D.solve(S, n, target, D.whenOf(S, n)) || D.solve(S, n, target, 'morning');
      assert.ok(sol, `lv${lv} seat ${n}`);
      D.aim(S, n, sol.yaw, sol.pitch); D.lock(S, n);
    }
    assert.ok(D.allLocked(S));
    assert.equal(D.result(S).stars, 3, 'lv' + lv);
  }
});

test('stage: round 1 = each work\'s level 1; the press waits for the water; stage built after round 1; links seed what they need', () => {
  assert.equal(PLAN.length, 9); assert.deepEqual(STAGE_FLOW, ['dadim1', 'mukhni1', 'hamshacha1']);
  const M = createH135(null);
  assert.deepEqual(M.open().map((m) => m.id), STAGE_FLOW);
  assert.equal(M.pick('mukhni2'), null);
  M.pick('dadim1'); M.done({ stars: 3, pts: 240 });
  M.pick('mukhni1'); M.done({ stars: 2, pts: 100 });
  assert.ok(!M.water());
  M.pick('hamshacha1'); M.done({ stars: 3, pts: 200 });
  assert.ok(M.finished() && M.water());
  assert.deepEqual(M.open().map((m) => m.id).sort(), ['dadim2', 'hamshacha2', 'mukhni2']);
  const L = createH135(null); L.autoTo((m) => m.id === 'mukhni3');
  assert.equal(L.mission().id, 'mukhni3'); assert.ok(L.isDone('hamshacha1') && L.isDone('mukhni2') && L.water());
  assert.equal(lossPts('mukhni.dent', 3), 80);
  const O = fromOld(true); assert.equal(createH135(O).finished(), true);
  assert.deepEqual(KINDS, ['dadim', 'mukhni', 'hamshacha']);
});
