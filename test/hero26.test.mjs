// HERO26: the player's figure (h26Fig), the epilogues, the hero's way back (freeNear) — node, no browser.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { h26Fig, H, ACTOR, EPILOGUE, epiMs, freeNear, HERO_ROBE, heroBegin, heroBack } from '../src/avodah/works/hero26.js';

const KOHEN = '#EFE9DA';
function kit() {
  const F = { x: -45, y: 16, z: 38, fx: 1, fz: 0, K: 1.5, anchor: 'ramp' };
  return { F, begin() {}, loc(x, y, z) { const K = F.K, dx = (x - F.x) / K, dz = (z - F.z) / K; return [F.fx * dx + F.fz * dz, -F.fz * dx + F.fx * dz, (y - F.y) / K]; }, ring() {} };
}
const frame = (k, list) => { if (!k.__h26) h26Fig(k, 0, 0, { hero: false }); k.begin(); return list.map((o, i) => h26Fig(k, i, 0, o)); };

test('the first plain kohen of the frame is the player; the ממונה (a cap) never; one per frame', () => {
  const k = kit(); h26Fig(k, 0, 0, {}); H.on = true; H.work = 'deshen'; H.ep = -1;
  const r = frame(k, [{ robe: KOHEN, cap: '#B59B62' }, { robe: '#7C8AA3' }, { robe: KOHEN }, { robe: KOHEN }]);
  assert.equal(r[0], null); assert.equal(r[1], null);
  assert.equal(r[2].robe, HERO_ROBE); assert.equal(r[2].hero, true); assert.equal(r[2].avnet, true);
  assert.equal(r[3], null);
});
test('hero:true wins, hero:false is never picked; off a work nothing is picked', () => {
  const k = kit(); H.on = true; H.work = 'deshen';
  let r = frame(k, [{ robe: KOHEN, hero: false }, { robe: KOHEN }]); assert.equal(r[0], null); assert.equal(r[1].hero, true);
  r = frame(k, [{ robe: '#7C8AA3', hero: true }, { robe: KOHEN }]); assert.equal(r[0].robe, HERO_ROBE); assert.equal(r[1], null);
  H.on = false; r = frame(k, [{ robe: KOHEN }]); assert.equal(r[0], null);
});
test('the lots: seat 0 is his, even bare-headed (his own skin for the cap)', () => {
  const k = kit(); H.on = true; H.work = 'payis'; H.ep = -1;
  const r = frame(k, [{ robe: KOHEN, cap: '#E0B58C', skin: '#E0B58C' }, { robe: KOHEN }]);
  assert.equal(r[0].hero, true); assert.equal(r[0].cap, H.skin); assert.equal(r[1], null);
  assert.equal(typeof ACTOR.payis, 'function');
});
test('the epilogue of the limbs: the row walks off toward the לשכת הגזית, one after another', () => {
  const k = kit(); H.on = true; H.work = 'evarim'; H.ep = 2.0;
  const r = frame(k, [{ robe: KOHEN, pose: 'stand' }, { robe: KOHEN, pose: 'stand' }]);
  assert.ok(r[0] && r[0].__a < 0 && r[0].__s > 0, 'he moves west and north (the gazit)');
  assert.equal(r[0].hero, true);
  H.ep = 0.1; const r2 = frame(k, [{ robe: KOHEN }, { robe: KOHEN }]); assert.ok(!r2[1] || r2[1].__a === 1, 'not yet');
  H.ep = -1; H.on = false;
});
test('every epilogue holds ≥ 1.2 s; the default 1.5 s', () => {
  for (const id in EPILOGUE) assert.ok(epiMs(id) >= 1200, id);
  assert.equal(epiMs('no-such-work'), 1500);
  assert.equal(epiMs('x', { afterMs: 2600 }), 2600);
});
test('the way back: the actor spot when free, else the nearest free floor ≤ 3 amot; inside the Heichal — where he stood', () => {
  const free = (x, z) => !(x > -40 && x < -20 && z > -10 && z < 10);
  assert.deepEqual(freeNear(0, 0, free), { x: 0, z: 0, d: 0 });
  const p = freeNear(-21, 0, free); assert.ok(p && p.d <= 3 && free(p.x, p.z));
  const calls = []; const S = { hero: { look: () => ({ skin: 2 }), drive: (x, z) => calls.push(['drive', x, z]), show: (v) => calls.push(['show', v]), setPos: (x, z, y) => calls.push(['setPos', x, z, y]) } };
  heroBegin(S, 'neirot'); assert.deepEqual(calls.find((c) => c[0] === 'show'), ['show', false]);
  H.at = { x: -110, z: 0, yaw: 0, work: 'neirot' };
  const r = heroBack(S, { hp: { x: -70, z: 2, yaw: 1 }, free, to: { x: -50, z: 2 } });
  assert.equal(r.x, -70); assert.equal(r.from, null);
  heroBegin(S, 'deshen'); H.at = { x: 5, z: 5, yaw: 0, work: 'deshen' };
  const r2 = heroBack(S, { hp: { x: 0, z: 0 }, free, to: { x: 5, z: 20 } });
  assert.equal(r2.d, 0); assert.ok(Math.abs(r2.yaw) < 0.01);
});
test('no Divine Name in hero26.js', () => {
  const src = fs.readFileSync(new URL('../src/avodah/works/hero26.js', import.meta.url), 'utf8');
  const bad = [String.fromCharCode(0x5d9, 0x5d4, 0x5d5, 0x5d4), String.fromCharCode(0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5dd)];
  for (const b of bad) assert.ok(!src.includes(b));
});
