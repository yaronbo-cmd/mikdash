// ── recovered (R9) ── build 18 (node): the temple's coins — C18 (a gold act 2, a good 1; the tamid's 5; the gift), the pilgrims' coins in
// the chests by the gate, the three pads to buy at (the laver's second spigot 40, the good axe 80, the big basket 120), own18, the
// switch (ENABLE_TEMPLE_COINS; court18/coins), fx18 as a quiet stub without a document.
import test from 'node:test';
import assert from 'node:assert/strict';
import { C18, K20, DAY33, ENABLE_TEMPLE_COINS } from '../src/avodah/shift/day33.js';
import { createFx18 } from '../src/avodah/shift/fx18.js';
import { rig, upTo } from './rig33.mjs';

const price = (id) => C18.pads.find((p) => p.id === id).price;
test('build 18: the pads\' prices — the laver\'s second spigot 40, the good axe 80, the big basket 120 (26c\'s prices — repriced after build 18)', () => {
  assert.equal(price('kiyor2'), 40); assert.equal(price('axe'), 80); assert.equal(price('basket10'), 120);
  assert.deepEqual(C18.pads.map((p) => p.id).sort(), ['axe', 'basket10', 'kiyor2']);
});
test('build 18: the coins — gold 2, good 1, ok 0; a streak of 3; the tamid 5; the gift 10 (p 0.3, or at 140 s); ENABLE_TEMPLE_COINS on', () => {
  assert.deepEqual({ ...C18.pay }, { gold: 2, good: 1, ok: 0 }); assert.equal(C18.streak, 3); assert.equal(C18.tamid, 5);
  assert.equal(C18.nedava, 10); assert.equal(C18.nedavaP, 0.3); assert.equal(C18.nedavaAt, 140); assert.equal(ENABLE_TEMPLE_COINS, true);
  assert.equal(C18.chests.max, 10); assert.equal(C18.chests.n, 13); assert.equal(C18.padS, 1.5); assert.equal(C18.kiyorK, 0.6);
});
test('build 18: each hit pays by its grade (E.on17 "coins": gold 2, good 1, ok nothing)', async () => {
  const R = rig(upTo('court18')); R.E.start(); await R.step(0.2); assert.equal(R.E.c18, true);
  const w = R.STATIONS.wood.stand; R.at(w.x, w.z); R.E.runAt('wood'); const o = R.acts.at(-1).opts;
  o.onHit('gold'); o.onHit('good'); o.onHit('ok');
  const hits = R.ev('coins').filter((e) => e.why === 'hit:wood'); assert.deepEqual(hits.map((e) => e.n), [2, 1]);
});
test('build 18: no coins without the switch (coins: false) — the court\'s look stays (l18), nothing paid', async () => {
  const R = rig({ ...upTo('court18'), coins: false }); R.E.start(); await R.step(0.2); assert.equal(R.E.c18, false); assert.equal(R.E.l18, true);
  const w = R.STATIONS.wood.stand; R.at(w.x, w.z); R.E.runAt('wood'); R.acts.at(-1).opts.onHit('gold');
  assert.equal(R.ev('coins').length, 0);
});
test('build 18: the dawn tamid on time pays C18.tamid (5)', async () => {
  const R = rig(upTo('court18')); R.E.start(); R.E.debug.lambOk(2); await R.step(45.5);
  assert.ok(R.ev('coins').some((e) => e.why === 'tamid' && e.n === C18.tamid));
});
test('build 18: the pilgrims — with the fire ≥ 60 one walks to the chests every 12 s, his coin drops in 4 s; at the chests he collects them', async () => {
  const R = rig(upTo('court18')); R.E.start(); await R.step(17);
  assert.equal(R.ev('pilgrim').length, 1); assert.equal(R.ev('drop').length, 1); assert.equal(R.E.focus17().c18.ch.n, 1);
  const p0 = R.E.state().perutot; R.at(C18.chests.x, C18.chests.z0 + 2); await R.step(0.2);
  assert.equal(R.ev('collect').length, 1); assert.equal(R.E.state().perutot, p0 + 1); assert.equal(R.E.focus17().c18.ch.n, 0);
});
test('build 18: under 40 the pilgrims stop coming (C18.chests.lo)', async () => {
  const R = rig(upTo('court18')); R.E.start(); await R.step(0.1); R.E.debug.setFuel(30); await R.step(30);
  assert.equal(R.ev('pilgrim').length, 0);
});
test('build 18: a pad — stand 1.5 s on it with the price: bought (save.day33, E.on17 "buy"), the axe: 2 taps and the wider window', async () => {
  const R = rig(upTo('court18')); R.E.start(); await R.step(0.2); R.E.st33.perutot = 100;
  const pad = C18.pads.find((p) => p.id === 'axe'); R.at(pad.x, pad.z); await R.step(0.5);
  assert.equal(R.E.focus17().c18.pad.id, 'axe'); await R.step(1.2);
  assert.equal(R.ev('buy').length, 1); assert.deepEqual(R.save.day33, { axe: 1 }); assert.equal(R.E.state().perutot, 100 - 80);
  assert.equal(R.E.st33.axeTaps, 2); assert.equal(R.E.st33.axeK, DAY33.axeK); assert.deepEqual(R.E.focus17().c18.own, [true, false, false]);
});
test('build 18: a pad he cannot pay for does nothing', async () => {
  const R = rig(upTo('court18')); R.E.start(); await R.step(0.2); R.E.st33.perutot = 30;
  const pad = C18.pads.find((p) => p.id === 'basket10'); R.at(pad.x, pad.z); await R.step(3);
  assert.equal(R.ev('buy').length, 0); assert.equal(R.E.focus17().c18.pad, null);
});
test('build 18: the laver\'s second spigot (kiyor2, 40) — the hold is K20.hold2 (2.5 s) instead of 3.5 s', async () => {
  const R = rig(upTo('g20'), { save: { day33: { kiyor2: 1 } } }); R.E.start(); await R.step(0.3);
  const k = R.STATIONS.kiyor.stand; R.at(k.x, k.z); await R.step(0.3);
  assert.equal(R.E.k20().T, K20.hold2); assert.equal(R.E.k20().two, true);
});
test('build 18: the gift (nedava) — at 140 s into the day, once a day: +10', async () => {
  const R = rig(upTo('court18')); R.E.start(); R.E.debug.lambOk(2); await R.step(141);
  const g = R.ev('coins').filter((e) => e.why === 'nedava'); assert.equal(g.length, 1); assert.equal(g[0].n, C18.nedava); assert.equal(R.ev('nedava').length, 1);
});
test('build 18: fx18 without a document is a quiet stub', () => {
  const fx = createFx18({ E: { on17: () => () => {} }, doc: null });
  assert.equal(typeof fx.destroy, 'function'); fx.destroy();
});
