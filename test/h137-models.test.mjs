// build 137 — stage 14 "ההיכל": the three works' models and the finale's (src/game/h137/*-model.js), driven by their bots; and the
// book's section (BOOK.s14): the maze's rooms join where they should, no room overlaps another on its floor, every route reachable.
import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOK } from '../src/game/world/grid.js';
import * as T from '../src/game/h137/taim-model.js';
import * as H from '../src/game/h137/hakzaa-model.js';
import * as Z from '../src/game/h137/zahav-model.js';
import * as V from '../src/game/h137/havraka-model.js';

const run = (K, S, o, n = 60 * 400) => { const ev = []; for (let i = 0; i < n && !S.done; i++) { const inp = K.bot(S, o); for (const e of K.step(S, 1 / 60, inp)) ev.push(e); } return ev; };

test('s14: rooms do not overlap on one floor; the routes are reachable; hatches only on floors 1–2', () => {
  const R = BOOK.s14.taim.rooms, yOf = (r) => (typeof r.y === 'number' ? r.y : r.y.x0);
  for (let i = 0; i < R.length; i++) for (let j = i + 1; j < R.length; j++) {
    const a = R[i].r, b = R[j].r, ov = Math.min(a[2], b[2]) - Math.max(a[0], b[0]) > 1e-6 && Math.min(a[3], b[3]) - Math.max(a[1], b[1]) > 1e-6;
    if (ov) assert.ok(Math.abs(yOf(R[i]) - yOf(R[j])) >= 4.9 || typeof R[i].y !== 'number' || typeof R[j].y !== 'number', `${R[i].id} overlaps ${R[j].id}`);
  }
  for (const r of R) if (r.hatch) assert.ok(r.f < 2, r.id);
  for (const lv of [1, 2, 3]) for (const s of BOOK.s14.taim.routes[lv].steps) assert.ok(T.roomOf(typeof s === 'string' ? s : s.room), `${lv} ${JSON.stringify(s)}`);
  // the stage's places stay off stage 13's (the Ulam's east wall x −98 … −92 holds only the pishpash's passage) and off stage 15's amah traksin
  for (const r of R) if (r.kind === 'cell') assert.ok(r.r[2] <= -98 && !(r.r[0] < -138 && r.r[2] > -139 && Math.abs(r.r[1]) < 10), r.id);
});
test('taim: every level to its end by the bot, all clean; a jamb struck hard costs (after the free try)', () => {
  for (const lv of [1, 2, 3]) { const S = T.fresh(lv); run(T, S, { two: lv > 1 }); assert.ok(S.done, `lv ${lv}`); assert.equal(S.steps.length, T.fresh(lv).route.filter((s) => !s.cut).length); assert.equal(S.flaws.length, 0); }
  // a hard hit: full speed at 60° into the junction's west door's jamb
  const S = T.fresh(2); S.room = 'n0c0'; S.x = -106.5; S.z = -21.2; S.yaw = Math.PI * 0.82; S.halt = false; S.first = false;
  for (let i = 0; i < 120; i++) T.step(S, 1 / 60, { fwd: 1 });
  assert.ok(S.flaws.length >= 1 || S.touched, 'a hit');
});
test('taim: a detour into the Heichal marks the step 10', () => {
  const S = T.fresh(1); S.room = 'n0c0'; S.x = -103; S.z = -19.5; S.k = 1; S.halt = false; S.yaw = Math.PI / 2;
  for (let i = 0; i < 400 && S.room !== 'heichal'; i++) T.step(S, 1 / 60, { fwd: 1, steer: Math.PI / 2 });
  assert.equal(S.room, 'heichal'); assert.ok(S.detour);
});
test('hakzaa: the bot planes every level flat within its passes; deep and fast tears', () => {
  for (const lv of [1, 2, 3]) { const S = H.fresh(lv); run(H, S, {}); assert.ok(S.done, `lv ${lv}`); assert.ok(S.steps.every((s) => s.grade === 'gold'), `lv ${lv} ${JSON.stringify(S.steps)}`); }
  const S = H.fresh(1); const ev = run(H, S, { rough: true }, 600); assert.ok(ev.some((e) => e.k === 'free'), 'the first is free'); assert.ok(ev.some((e) => e.k === 'tear'), 'then tears');
});
test('zahav: every level gilded by the bot; off the slot = a hole; pulled back = a tear; no mask = gold behind the doors', () => {
  for (const lv of [1, 2, 3]) { const S = Z.fresh(lv); run(Z, S, {}); assert.ok(S.done); assert.equal(Z.result(S).stars, 3, `lv ${lv}`); }
  for (const o of [{ err: 20 }, { pull: true }]) { const S = Z.fresh(1); run(Z, S, o); assert.ok(S.flaws.length > 0, JSON.stringify(o)); }
  const S = Z.fresh(2); run(Z, S, { noMask: true }); assert.ok(S.flaws.some((f) => f.f === 'zahav.border'));
});
test('havraka: one clean stroke = 40; a stray or a wrong turn = 20', () => {
  const g = (o) => { const S = V.fresh(); for (let i = 0; i < 2000 && !S.done; i++) V.step(S, 1 / 60, V.bot(S, o)); return S.grade; };
  assert.equal(g({}), 'gold'); assert.equal(g({ dev: 10 }), 'good'); assert.equal(g({ angErr: 9 }), 'good');
});
