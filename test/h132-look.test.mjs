// build 132 — the act's own turn of the look (h109/look.js lookYawOf, lookClampOf, lookEndOf; director.js uses them): absent, every
// act looks as before (LOOK_PLAY.yaw 1.0, the clamp ±2.8); act.lookYaw widens the play zone and the clamp; act.lookEnd settles the turn.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { lookZone, LOOK_PLAY, lookYawOf, lookClampOf, lookEndOf, actLens } from '../src/game/h109/look.js';

test('no hooks: as before', () => {
  for (const a of [null, {}, { lookYaw: 'x' }, { lookYaw: -1 }, { lookYaw: NaN }]) { assert.equal(lookYawOf(a), LOOK_PLAY.yaw); assert.equal(lookClampOf(a), 2.8); assert.equal(lookEndOf(a, 0.4), null); }
  assert.equal(lookClampOf(null), 2.8); assert.equal(lookZone(0.2, 1.2), 'wait'); assert.equal(lookZone(0.2, 1.2, lookYawOf({})), 'wait');
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

test('the perfect screen takes the work\'s own word (X.perfect(word) in the act, or res.word), "מושלם!" when none', () => {
  const D = readFileSync(new URL('../src/game/h109/director.js', import.meta.url), 'utf8');
  assert.match(D, /function perfectScreen\(sub, word\)/);
  assert.match(D, /<b>\$\{word \|\| 'מושלם!'\}<\/b>/);
  assert.match(D, /perfect\(text, at\) \{\n\s*if \(text\) actWord = text;/);
  assert.match(D, /perfectScreen\(\(\(A0 && A0\.title\) \|\| 'המשחקון'\) \+ ' · בלי טעות אחת', res\.word \|\| \(PK && PK\.wordScreen \? actWord : null\)\)/);
  assert.match(readFileSync(new URL('../src/game/h132/pack.js', import.meta.url), 'utf8'), /wordScreen: true/);
  assert.match(D, /lossNow = 0; actWord = null;/);
});
test('the look\'s lens: a lens the act set while the look was on is kept — the base from then on, and not undone when the look ends', () => {
  assert.equal(actLens(null, 50), false); assert.equal(actLens(52.4, 52.4), false); assert.equal(actLens(52.4, 50), true); assert.equal(actLens(52.4, NaN), false);
  const D = readFileSync(new URL('../src/game/h109/director.js', import.meta.url), 'utf8');
  assert.match(D, /if \(LK5\.on && actLens\(LK5\.fovSet, camera\.fov\)\) \{ LK5\.fov0 = camera\.fov; LK5\.fovSet = null; \}/);
  assert.match(D, /LK5\.fovSet = camera\.fov;/);
  assert.match(D, /function lk5Off\(\) \{[^\n]*if \(LK5\.fov0 != null && !actLens\(LK5\.fovSet, camera\.fov\)/);
  // (a model of the two: the look widens 50 → 56; the act sets 44 in the middle; the look's base is 44 then; at its end 44 stays)
  const L = { on: true, fov0: 50, fovSet: 56 }; let fov = 44;
  if (L.on && actLens(L.fovSet, fov)) { L.fov0 = fov; L.fovSet = null; } assert.equal(L.fov0, 44);
  fov = 47; L.fovSet = 47; if (L.fov0 != null && !actLens(L.fovSet, fov)) fov = L.fov0; assert.equal(fov, 44);
});
