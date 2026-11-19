// build 132 — stage 09's ending (h132/ending.js), spec "סיום השלב": half a second quiet; the line lights, runs round and pulses; a bright
// wave above the line and a dark one below it stop at their edges; red and gold fireworks over the whole screen; then the world again.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ENDING, endingAt, faces, roundAt, burstsPlan } from '../src/game/h132/ending.js';
import { BOOK } from '../src/game/world/grid.js';

test('the ending\'s timeline is the spec\'s order', () => {
  const q = endingAt(0.3); assert.equal(q.glow, 0); assert.equal(q.head, null); assert.equal(q.light, 0); assert.equal(q.fire, false);   // (quiet)
  assert.ok(endingAt(1.1).glow > 0.99, 'the line lit');
  assert.ok(endingAt(2.3).head > 0.4 && endingAt(2.3).head < 0.6, 'the head runs round');
  assert.ok(endingAt(4).glow < 1 && endingAt(4).glow >= 0.4, 'then it pulses');
  assert.equal(endingAt(2.8).light, 0); assert.equal(endingAt(4.4).light, 1); assert.equal(endingAt(4.4).dark, 1); assert.equal(endingAt(7).light, 1, 'the waves stop at their edges and hold');
  assert.equal(endingAt(4.3).fire, false); assert.equal(endingAt(4.4).fire, true); assert.equal(endingAt(7.6).fire, false);
  assert.equal(endingAt(9.6).done, true); assert.equal(endingAt(9.6).glow, 0);
  assert.ok(ENDING.QUIET === 0.5 && ENDING.LIGHT[0] === ENDING.QUIET);
  const F = ENDING.FIRE[1] - ENDING.FIRE[0]; assert.ok(F >= 2.8 && F <= 3.6, 'about three seconds of fireworks');
});
test('the fireworks fill the screen: many large bursts, the closing three together and largest', () => {
  const P = burstsPlan(); assert.ok(P.length >= 14);
  assert.ok(P.every((b) => b.at >= 0 && b.at < ENDING.FIRE[1] - ENDING.FIRE[0] - 0.4), 'every burst inside the fireworks\' time');
  const xs = P.map((b) => b.x), ys = P.map((b) => b.y); assert.ok(Math.min(...xs) < 0.25 && Math.max(...xs) > 0.75, 'from side to side'); assert.ok(Math.min(...ys) < 0.2 && Math.max(...ys) <= 0.5, 'over the upper half');
  assert.ok(P.every((b) => b.r >= 0.26 && b.n >= 90), 'each large');
  const L = P.slice(-3); assert.ok(L.every((b) => b.big && b.r > 0.4) && L[2].at - L[0].at < 0.1, 'the closing triple');
  for (const b of P) for (const c of [b.col, b.col2]) assert.ok(ENDING.COLORS.fire.includes(c));
});
test('the ending\'s peak shot is the book\'s, low at the south-east; then the round', () => {
  const P = readFileSync(new URL('../src/game/h132/pack.js', import.meta.url), 'utf8');
  assert.match(P, /PEAK = CAM\.peak/); assert.match(P, /film: \[\[PEAK\[0\], PEAK\[1\], ENDING\.FIRE\[1\] \+ 0\.2\], \.\.\.endRound\(3\)\]/);
  const [eye, aim] = BOOK.s09.cam.peak, S9 = BOOK.s09; assert.ok(eye[1] < S9.top && eye[1] > S9.floor, 'below the top: the faces, not the top, fill it'); assert.ok(eye[0] > S9.corner.SE[0] && eye[2] > S9.corner.SE[1], 'south-east of the corner'); assert.deepEqual(aim, [S9.mid[0], 24, S9.mid[1]]);
  const E = readFileSync(new URL('../src/game/h132/ending.js', import.meta.url), 'utf8');
  assert.match(E, /X\.shake\(/); assert.match(E, /X\.haptic\(/);
});
test('red and gold only; no blood: the waves are light and shade', () => {
  for (const c of ENDING.COLORS.fire) { const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16); assert.ok(r >= 0xe0 && b <= 0xc8, c + ' red or gold'); void g; }
  const lum = (c) => ((c >> 16) & 255) + ((c >> 8) & 255) + (c & 255);
  assert.ok(lum(ENDING.COLORS.light) > 560, 'the wave above: light (gold)'); assert.ok(lum(ENDING.COLORS.dark) < 120, 'the wave below: shade');
});
test('the run round the block is the line\'s 120 amot, from the south-east corner the walk\'s way (east, north, west, south)', () => {
  const F = faces(), S9 = BOOK.s09; assert.deepEqual(F.map((f) => f.k), [...S9.order]);
  const P = F.reduce((a, f) => a + Math.hypot(f.b[0] - f.a[0], f.b[1] - f.a[1]), 0); assert.equal(P, S9.perimeter);
  const p0 = roundAt(0, 0); assert.deepEqual([p0.x, p0.z], S9.corner.SE);
  assert.equal(roundAt(0.1).k, 'E'); assert.equal(roundAt(0.3).k, 'N'); assert.equal(roundAt(0.6).k, 'W'); assert.equal(roundAt(0.9).k, 'S');
});
test('the pack\'s finale starts it over the round, not awaited', () => {
  const P = readFileSync(new URL('../src/game/h132/pack.js', import.meta.url), 'utf8');
  assert.match(P, /const fx = endingFx\(X\); SH9\.ending = fx;[^\n]*fx\.run\(\)\.then/);
});
