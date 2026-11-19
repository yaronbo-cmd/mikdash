// build 117 (brief §G1, §G3): no light column over the work; the act plays on while the camera is a little out
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { lookZone, LOOK_PLAY, WHEEL_STEP, pinchU } from '../src/game/h109/look.js';

test('the play zone: a little out plays on, farther waits', () => {
  assert.equal(lookZone(0, 0), 'play');
  assert.equal(lookZone(0.4, 0.9), 'play');
  assert.equal(lookZone(LOOK_PLAY.u, -LOOK_PLAY.yaw), 'play');
  assert.equal(lookZone(0.5, 0), 'wait');
  assert.equal(lookZone(0.2, 1.3), 'wait');
  assert.equal(lookZone(1, 0), 'wait');
});

test('three notches of the wheel still play; four wait', () => {
  assert.equal(lookZone(3 * WHEEL_STEP, 0), 'play');
  assert.equal(lookZone(4 * WHEEL_STEP, 0), 'wait');
});

test('a pinch: closing lifts, opening lowers, past 1 asks for the overview', () => {
  assert.ok(pinchU(0, 400, 300) > 0);
  assert.ok(pinchU(0.5, 300, 400) < 0.5);
  assert.ok(pinchU(0, 400, 80) > 1);
});

test('no light column is left in the game (ירון 10.11: "הפס הצהוב שמגיע עד הרקיע")', () => {
  const dir = new URL('../src/game/h109/', import.meta.url);
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.js')) continue;
    const t = readFileSync(new URL(f, dir), 'utf8');
    assert.ok(!/h115-look-beam|lookBeam\(/.test(t), f);
  }
});
