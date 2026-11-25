// build 133, the rule-67 review's fixes (docs/brainstorm/shlav-10/16-bikoret-bniya-133.md): the nima's face before its seat, a touched
// stone stays, the works kept whole across a reload (nima, kevesh's slab on its way, nail's stone in hand), no flaw cleared by a replay
// but the kevesh's good seat mends its lip, the world's key sees a flaw's content.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as NI from '../src/game/h133/nima-model.js';
import * as KV from '../src/game/h133/kevesh-model.js';
import * as NA from '../src/game/h133/nail-model.js';
import { createH133 } from '../src/game/h133/model.js';
import { makePack10 } from '../src/game/h133/pack.js';

test('nima: reaching the face in the step the brake is let go is a scratch, never a clean seat at gap 0', () => {
  const S = NI.fresh(2); S.free = false;
  S.mo.pulled = true; S.mo.s = S.way.len - 0.001; S.mo.v = 0.5; S.mo.held = true; S.mo.brake = 1;
  const ev = NI.step(S, { brake: false }, 1 / 60);
  assert.ok(ev.some((e) => e.k === 'touch' && e.loss), JSON.stringify(ev));
  assert.equal(S.dmg, 1); assert.ok(S.seated); assert.equal(S.seated.touched, true);
});
test('nima: a touched stone stays against the face (no slide back)', () => {
  const S = NI.fresh(1); S.free = false; S.mo.pulled = true; S.mo.s = S.way.len - 0.01; S.mo.v = 1;
  NI.step(S, {}, 1 / 60); assert.equal(S.touched, true);
  for (let i = 0; i < 180; i++) NI.step(S, {}, 1 / 60);
  assert.equal(S.mo.s, S.way.len);
});
test('nima: save/load keep damage, points, turn and where the stone stands', () => {
  const S = NI.fresh(3); S.free = false; S.dmg = 1; S.touched = true; S.turn = 'clean'; S.mo.s = 6.5; S.mo.pulled = true;
  const L = NI.load(JSON.parse(JSON.stringify(NI.save(S, 'nima3'))));
  assert.deepEqual([L.dmg, L.touched, L.turn, L.mo.s, L.mo.pulled], [1, true, 'clean', 6.5, true]);
});
test('kevesh: the slab on its way survives a reload, held two seconds', () => {
  const S = KV.fresh(2); S.mo.pulled = true; S.mo.s = 3.2; S.mo.x = 0.2; S.tSlab = 4;
  const L = KV.load(JSON.parse(JSON.stringify(KV.save(S, 'kevesh2'))));
  assert.equal(L.mo.s, 3.2); assert.equal(L.mo.x, 0.2); assert.equal(L.tSlab, 4);
  for (let i = 0; i < 60; i++) KV.step(L, {}, 1 / 60);
  assert.ok(L.mo.s > 3.1, 'held: ' + L.mo.s);
});
test('nail: the stone in hand keeps its checks and marks across a reload', () => {
  const S = NA.fresh(2); const s = NA.cur(S); s.ck[0] = true; s.marked[0] = 0.6; s.e = 1; s.cov[1][3] = 1;
  const L = NA.load(JSON.parse(JSON.stringify(NA.save(S, 'nail2')))), t = NA.cur(L);
  assert.deepEqual([t.e, t.ck[0], t.marked[0], t.cov[1][3]], [1, true, 0.6, 1]);
});
test('flaws: a replay clears none; only a smooth kevesh seat mends that slab\'s lip', () => {
  const M = createH133(null); M.autoTo((m) => m.id === 'kevesh1');
  M.flaw('kevesh.lip', { slab: 2 }); M.flaw('nail.bad', {}); const n = M.flaws().length;
  makePack10({}).workSeed(M, 'kevesh1'); assert.equal(M.flaws().length, n);
  assert.equal(M.mendLip(2), 1); assert.equal(M.flaws('kevesh.lip').length, 0); assert.equal(M.flaws().length, n - 1);
});
test('links: every level of every work opens its work and leaves the stage open (nima2, nima3 too)', () => {
  for (const k of ['nail', 'malben', 'kevesh', 'nima']) for (const lv of [1, 2, 3]) {
    const M = createH133(null), id = k + lv, got = M.autoTo((m) => m.id === id);
    assert.equal(got && got.id, id); assert.equal(M.mission().id, id);
    if (lv > 1) assert.equal(M.finished(), false, id);
  }
});
