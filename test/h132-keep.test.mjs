// build 132, review R8: what stays at each work's station — one more for each level done, read from the save's done list, at the
// book's own place (BOOK.s09.keep), off the block, the lying walls, the ramp and the oxen's lane
import test from 'node:test';
import assert from 'node:assert/strict';
import { BOOK } from '../src/game/world/grid.js';
import { keepCount } from '../src/game/h132/world.js';

test('keep: one per level done of that kind, none for another kind', () => {
  assert.equal(keepCount([], 'form'), 0);
  assert.equal(keepCount(['form1', 'fill1', 'strip1', 'sikra1'], 'fill'), 1);
  assert.equal(keepCount(['form1', 'form2', 'form3', 'fill1'], 'form'), 3);
  assert.equal(keepCount(['sikra2', 'sikra1'], 'sikra'), 2);
  assert.equal(keepCount(['strip1'], 'sikra'), 0);
});
test('keep: each place in the book, on the floor, clear of the block, the ramp, the oxen, the pile and the lying walls', () => {
  const S = BOOK.s09, B = S.block;
  for (const k of ['form', 'fill', 'strip', 'sikra']) {
    const [x, z] = S.keep[k], e = S.entries.find((q) => q.id === 'keep:' + k);
    assert.ok(e, k); assert.equal(e.x, x); assert.equal(e.z, z); assert.equal(e.src, 'המחשה');
    const inBox = (x0, z0, x1, z1, m = 1) => x > x0 - m && x < x1 + m && z > z0 - m && z < z1 + m;
    assert.ok(!inBox(B[0] - 6, B[1] - 6, B[2] + 6, B[3] + 6, 0), k + ': off the block and its lying walls');
    assert.ok(!inBox(S.ramp.foot[0] - 3, S.ramp.foot[1], S.ramp.foot[0] + 3, S.ramp.head[1]), k + ': off the ramp');
    assert.ok(!inBox(S.oxen.to[0], S.oxen.from[1] - 1, S.oxen.from[0], S.oxen.from[1] + 1, 2), k + ': off the oxen');
    assert.ok(!inBox(S.pile[0] - 4, S.pile[1] - 1.8, S.pile[0] + 4, S.pile[1] + 1.8), k + ': off the pile');
    assert.ok(Math.hypot(x - S.wallRest.W[0], z - S.wallRest.W[1]) > 3 && !inBox(-47.2, -32.5, -14.8, -27.5), k + ': off the west wall at rest');
  }
});
