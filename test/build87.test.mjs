// build 87: the owner, 3.11 — "האריח לא מסתובב 360, רק ימינה ושמאלה": his finger turns the slab directly, all the way round; let go, it
// keeps its spin. Never a Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F84 from '../src/game/soreg84.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

test('build 87: GAME_BUILD', () => { assert.equal(GAME_BUILD, 95); });

test('build 87: the finger turns it round — past the half, the dressed face out; let go, it spins on', () => {
  const H = F84.createHoist84({ tol: 0.1, tolZ: 0.1, tolR: 0.1, damp: 3, sway0: 0, swayZ0: 0, twist0: 0, r0: Math.PI, vChip: 1, vBreak: 1.8, wind: 0 });
  assert.equal(H.sq().back, true, 'its back out');
  // (build 90: the finger sets where it is turned to; the slab follows with its weight, a step behind)
  for (let n = 0; n < 20; n++) { H.twistBy(Math.PI / 20, 1 / 60); H.step(1 / 60, 0, 0, false); }
  assert.ok(H.state().vr > 1, 'spinning after the finger'); for (let n = 0; n < 30; n++) H.step(1 / 60, 0, 0, false);
  assert.equal(H.sq().back, false, 'turned a half: the face out');
  const rB = H.state().r; for (let n = 0; n < 60; n++) { H.twistBy(-Math.PI / 20, 1 / 60); H.step(1 / 60, 0, 0, false); } for (let n = 0; n < 30; n++) H.step(1 / 60, 0, 0, false);
  assert.ok(H.state().r < rB - 2.5 * Math.PI, 'and the other way, as far as he likes');
  for (let n = 0; n < 10; n++) { H.twistBy(Math.PI / 10, 1 / 60); H.step(1 / 60, 0, 0, false); } H.twistEnd();
  const v0 = H.state().vr; H.step(1 / 60, 0, 0, false); assert.ok(Math.abs(H.state().vr) > 0 && Math.abs(H.state().vr) < Math.abs(v0), 'let go: it spins on, slowing');
  assert.match(fs.readFileSync(new URL('../src/game/har42.js', import.meta.url), 'utf8'), /st84\.J\.twistBy\(/);
});
