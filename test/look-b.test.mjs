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
