// build 132 — the act's own turn of the look (h109/look.js lookYawOf, lookClampOf, lookEndOf; director.js uses them): absent, every
// act looks as before (LOOK_PLAY.yaw 1.0, the clamp ±2.8); act.lookYaw widens the play zone and the clamp; act.lookEnd settles the turn.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lookZone, LOOK_PLAY, LOOK_YAW, lookYawOf, lookClampOf, lookEndOf } from '../src/game/h109/look.js';

test('no hooks: as before', () => {
  for (const a of [null, {}, { lookYaw: 'x' }, { lookYaw: -1 }, { lookYaw: NaN }]) { assert.equal(lookYawOf(a), LOOK_PLAY.yaw); assert.equal(lookClampOf(a), LOOK_YAW); assert.equal(lookEndOf(a, 0.4), null); }
  assert.equal(LOOK_YAW, 2.8); assert.equal(lookZone(0.2, 1.2), 'wait'); assert.equal(lookZone(0.2, 1.2, lookYawOf({})), 'wait');
});
test('act.lookYaw: the play zone and the clamp', () => {
  const a = { lookYaw: Math.PI };
  assert.equal(lookYawOf(a), Math.PI); assert.equal(lookClampOf(a), Math.PI);
  assert.equal(lookZone(0.2, 3, lookYawOf(a)), 'play'); assert.equal(lookZone(0.5, 3, lookYawOf(a)), 'wait');
  assert.equal(lookClampOf({ lookYaw: 1.5 }), 2.8); assert.equal(lookZone(0.1, 1.4, lookYawOf({ lookYaw: 1.5 })), 'play');
});
test('act.lookEnd: a finite number settles the turn (clamped); anything else, or a throw, leaves it', () => {
  const q = { lookYaw: Math.PI, lookEnd: (y) => Math.round(y / (Math.PI / 2)) * (Math.PI / 2) };
  assert.equal(lookEndOf(q, 1.2), Math.PI / 2); assert.equal(lookEndOf(q, -0.3), -0);
  assert.equal(lookEndOf({ lookEnd: () => 9 }, 0), 2.8);
  assert.equal(lookEndOf({ lookEnd: () => undefined }, 1), null); assert.equal(lookEndOf({ lookEnd: () => NaN }, 1), null);
  assert.equal(lookEndOf({ lookEnd: () => { throw new Error('x'); } }, 1), null);
});
test('the director reads them: the play zone, the drag\'s clamp, the end of a look drag, the tests\' _look', () => {
  const D = readFileSync(new URL('../src/game/h109/director.js', import.meta.url), 'utf8');
  assert.match(D, /lookZone\(u, yaw, lookYawOf\(act\)\)/);
  assert.match(D, /const YL = lookClampOf\(act\); LOOK\.yaw = clamp\(LOOK\.yaw0 - \(\(e\.clientX - LOOK\.x0\) \/ innerWidth\) \* 3\.2, -YL, YL\)/);
  assert.match(D, /LOOK\.drag = false; lookSet\(\); const ye = lookEndOf\(act, LOOK\.yaw\); if \(ye != null\) \{ LOOK\.yaw = LOOK\.yaw0 = ye; lookSet\(\); \}/);
});
