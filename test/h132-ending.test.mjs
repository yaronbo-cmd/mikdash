// build 132 — stage 09's ending (h132/ending.js), spec "סיום השלב": half a second quiet; the line lights, runs round and pulses; a bright
// wave above the line and a dark one below it stop at their edges; red and gold fireworks over the whole screen; then the world again.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { ENDING, endingAt, faces, roundAt } from '../src/game/h132/ending.js';
import { BOOK } from '../src/game/world/grid.js';

test('the ending\'s timeline is the spec\'s order', () => {
  const q = endingAt(0.3); assert.equal(q.glow, 0); assert.equal(q.head, null); assert.equal(q.light, 0); assert.equal(q.fire, false);   // (quiet)
  assert.ok(endingAt(1.2).glow > 0.99, 'the line lit');
  assert.ok(endingAt(2.7).head > 0.4 && endingAt(2.7).head < 0.6, 'the head runs round');
  assert.ok(endingAt(4.5).glow < 1 && endingAt(4.5).glow >= 0.4, 'then it pulses');
  assert.equal(endingAt(2.9).light, 0); assert.equal(endingAt(5).light, 1); assert.equal(endingAt(5).dark, 1); assert.equal(endingAt(8).light, 1, 'the waves stop at their edges and hold');
  assert.equal(endingAt(4.9).fire, false); assert.equal(endingAt(5).fire, true); assert.equal(endingAt(9).fire, false);
  assert.equal(endingAt(11).done, true); assert.equal(endingAt(11).glow, 0);
  assert.ok(ENDING.QUIET === 0.5 && ENDING.LIGHT[0] === ENDING.QUIET);
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
