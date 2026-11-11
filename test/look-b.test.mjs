// look B (docs/specs/look/B-mount-and-ground.md): the ground's pure parts
import test from 'node:test';
import assert from 'node:assert/strict';
import { groundDetailData } from '../src/look/ground.js';

test('look B: the ground detail is tileable, deterministic and uses its range', () => {
  const n = 64, a = groundDetailData(n), b = groundDetailData(n);
  assert.equal(a.length, n * n * 4);
  assert.deepEqual(a, b);
  for (let c = 0; c < 4; c++) {
    let lo = 255, hi = 0, s = 0;
    for (let k = c; k < a.length; k += 4) { lo = Math.min(lo, a[k]); hi = Math.max(hi, a[k]); s += a[k]; }
    assert.ok(hi - lo > 80, `channel ${c} has contrast (${lo}..${hi})`);
    const m = s / (n * n); assert.ok(m > 40 && m < 215, `channel ${c} mean ${m}`);
  }
  // (tileable: the first and last columns are neighbours — no step across the seam beyond the texture's own steps)
  let seam = 0, inner = 0;
  for (let j = 0; j < n; j++) for (let c = 0; c < 4; c++) { seam += Math.abs(a[(j * n) * 4 + c] - a[(j * n + n - 1) * 4 + c]); inner += Math.abs(a[(j * n + 31) * 4 + c] - a[(j * n + 32) * 4 + c]); }
  assert.ok(seam < inner * 2.5, `seam ${seam} vs inner ${inner}`);
});

test('look B: the works mark the ground from the address book, in order, with paths between them', async () => {
  const { workMarks } = await import('../src/look/ground.js');
  const { BOOK } = await import('../src/game/world/grid.js');
  assert.deepEqual(workMarks([]), { spots: [], paths: [], ruts: [] });
  const M = workMarks(['rope', 'rocks0', 'read0', 'waste1', 'corner', 'course0', 'great', 'unknown', 'rocks0']);
  const S0 = BOOK.sectors[0];
  assert.ok(M.spots.some(([x, z]) => x === S0.rect.cx && z === S0.rect.cz), 'the sector\'s cell');
  assert.ok(M.spots.some(([x, z]) => x === S0.big.x && z === S0.big.z), 'the big rock read');
  assert.ok(M.spots.some(([x, z]) => x === BOOK.pile.x && z === BOOK.pile.z), 'the pile');
  assert.ok(M.ruts.length >= 3 && M.ruts.length <= 8, 'the carts\' routes');
  assert.ok(M.paths.length >= 5, 'the paths between the works');
  for (const [x, z, r] of M.spots) { assert.ok(x > -360 && x < 340 && z > -540 && z < 460, 'inside the mask'); assert.ok(r >= 6 && r <= 14); }
  assert.deepEqual(workMarks(['rocks0']).spots.length, 1);
});
