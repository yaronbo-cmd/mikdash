// ── recovered (R9) ── build 24 (node): the protocol stick (twin's STICK24: 56 px, a dead zone of 0.15 of the radius, the velocity eased over
// 0.05 s), the day's paced walk and soft stick (walk.js PACE, STICK), no auto-walk — a tap shows the way (peek24: the tapped slot's way for
// 3 s, the chip's pulse) and he walks by the stick —, the day's view (camera.js VIEW24), the strong path while the lot holds (strong24).
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { STICK24 } from '../src/game/twin.js';
import { PACE, STICK } from '../src/avodah/shift/walk.js';
import { VIEW24 } from '../src/avodah/shift/camera.js';
import { SHARED } from '../src/avodah/shift/draw.js';
import { rig, upTo } from './rig33.mjs';

test('build 24: STICK24 — the protocol stick: radius 56 px, dead zone 0.15 of it, the velocity eased over 0.05 s', () => {
  assert.deepEqual({ ...STICK24 }, { R: 56, dead: 0.15, tau: 0.05 }); assert.ok(Object.isFrozen(STICK24));
});
test('build 24: the protocol stick in twin.js — inside the dead zone nothing, past it the reach (0…1), the velocity a first-order ease', () => {
  const src = fs.readFileSync(new URL('../src/game/twin.js', import.meta.url), 'utf8');
  const stick24 = new Function('STICK24', /const stick24 = (\(L, r\) => \{[^\n]*\});/.exec(src)[1].replace(/^/, 'return ').replace(/;$/, ''))(STICK24);
  assert.equal(stick24(0.1 * 56, 56), 0); assert.equal(stick24(0.149 * 56, 56), 0); assert.ok(Math.abs(stick24(0.5 * 56, 56) - 0.5) < 1e-9); assert.equal(stick24(200, 56), 1);
  assert.match(src, /function stickVel\(v, x, z, k, dt, tau = STICK24\.tau\) \{\n  const a = dt > 0 \? 1 - Math\.exp\(-dt \/ tau\) : 0;/);
});
test('build 24: the day\'s pace and the soft stick (walk.js) — the rim 0.95 after 0.6 s, the sprint ×1.5; the soft stick 64 px, dead 3 px', () => {
  assert.equal(PACE.rim, 0.95); assert.equal(PACE.rimAfter, 0.6); assert.equal(PACE.sprint, 1.5); assert.equal(PACE.laver, 3.2);
  assert.equal(STICK.R, 64); assert.equal(STICK.dead, 3); assert.equal(STICK.ease, 1.85);
});
test('build 24: the day\'s view — VIEW24: lifted 0.28, fov 50, 17 amot (11 at an act)', () => {
  assert.deepEqual({ ...VIEW24 }, { el0: 0.28, fov: 50, d: 17, dAct: 11 });
});
test('build 24: no auto-walk — a station out of reach is not walked to: the tap shows the way (pk24, 3 s) and the chip pulses', async () => {
  const R = rig(upTo('b19')); R.E.start(); await R.step(0.2); R.at(-20, 50); const H0 = { ...R.H };
  assert.equal(R.E.tapStation('wood'), true); await R.step(0.2);
  assert.equal(R.H.vx, 0); assert.equal(R.H.vz, 0); assert.equal(R.H.x, H0.x); assert.equal(R.H.z, H0.z);
  assert.equal(R.E.st33.pk24, null, 'the next place already: no extra way'); assert.ok(R.ev('pulse').some((e) => e.id === 'wood'));
});
test('build 24: a tapped slot that is not the next — its way for 3 s (flowNext shows it), then the day\'s own way again', async () => {
  const R = rig(upTo('b19')); R.E.start(); await R.step(0.2); R.E.debug.fed(20); await R.step(0.2); R.at(-20, 50);
  const nx = R.E.flowNext().id; const other = ['salt', 'kevesh', 'oil'].find((id) => id !== nx);
  R.E.tapStation(other); assert.equal(R.E.flowNext().id, other); assert.ok(R.E.st33.pk24 && R.E.st33.pk24.id === other);
  await R.step(3.2); assert.equal(R.E.flowNext().id, nx);
});
test('build 24: the bar\'s tap (E.tap17) on a slot only shows the way — he still walks by the stick', async () => {
  const R = rig(upTo('b19')); R.E.start(); await R.step(0.2); R.at(-20, 50);
  R.E.tap17('salt'); await R.step(0.2); assert.equal(R.H.vx, 0); assert.ok(R.ev('pulse').length >= 1);
});
test('build 24: the strong path while the morning\'s lot holds and the day\'s next is there (SHARED.strong24)', async () => {
  const R = rig(upTo('p23')); R.E.start(); await R.step(0.2); R.E.debug.wash20(); await R.step(0.3);
  for (let i = 0; i < 80 && R.E.p23(); i++) { const K = R.E.p23(); if (K.ph === 'in' || K.ph === 'raise') R.E.p23raise(); await R.step(0.2); }
  R.at(-20, 50); await R.step(0.2); assert.equal(R.E.gate21(), true); assert.equal(SHARED.strong24, true);
});
