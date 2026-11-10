// build 116 — the paving of a quarter in seven slab sizes (h109/paving.js)
import test from 'node:test';
import assert from 'node:assert/strict';
import { layout, newBoard, canPlace, why, place, lift, done, stuck, legal, fits, SIZES, N } from '../src/game/h109/paving.js';

const key = (w, h) => Math.min(w, h) + 'x' + Math.max(w, h);
const SZ = new Set(SIZES.map(([w, h]) => key(w, h)));

test('the rule: four corners never meet inside the quarter', () => {
  const b = newBoard();
  place(b, 1, 2, 2, 0, 0); place(b, 2, 2, 2, 2, 0); place(b, 3, 2, 2, 0, 2);
  const w = why(b, 2, 2, 2, 2); assert.deepEqual(w, { cross: [2, 2] });
  assert.equal(canPlace(b, 3, 3, 2, 2), false);
  assert.equal(canPlace(b, 1, 3, 2, 2), false);   // (still a cross at (2, 2))
  assert.equal(why(b, 2, 2, 4, 0), 'out'); assert.equal(why(b, 1, 1, 0, 0), 'taken');
  lift(b, 3); assert.equal(canPlace(b, 1, 1, 0, 2), true);
});

test('every layout at every level: full cover, no cross, only the seven sizes, the pile holds the tiling', () => {
  for (const lv of [1, 2, 3]) for (let seed = 0; seed <= 300; seed++) {
    const L = layout(seed, lv), b = newBoard();
    L.tiles.forEach((t, i) => { assert.ok(canPlace(b, t.w, t.h, t.x, t.y), `lv ${lv} seed ${seed} tile ${i}`); place(b, i + 1, t.w, t.h, t.x, t.y); });
    assert.ok(done(b) && legal(b), `lv ${lv} seed ${seed}`);
    for (const t of L.tiles) assert.ok(SZ.has(key(t.w, t.h)));
    const n = L.tiles.length;
    if (lv === 1) { assert.ok(n >= 6 && n <= 7, 'n ' + n); assert.ok(new Set(L.tiles.map((t) => key(t.w, t.h))).size >= 4); assert.ok(L.tiles.some((t) => t.w * t.h >= 6)); }
    else assert.ok(n >= 9 && n <= 11, 'n ' + n);
    const plain = L.pile.filter((p) => !p.extra && !p.cracked).map((p) => key(p.w, p.h)).sort(), want = L.tiles.map((t) => key(t.w, t.h)).sort();
    assert.deepEqual(plain, want);
    assert.equal(L.pile.filter((p) => p.extra).length, lv >= 3 ? 2 : 0);
    assert.equal(L.pile.filter((p) => p.cracked).length, lv >= 3 ? 1 : 0);
    assert.deepEqual(L.pile.map((p) => p.id), L.pile.map((_, i) => i + 1));
  }
});

test('the same seed lays the same quarter', () => {
  assert.deepEqual(layout(42, 2), layout(42, 2));
  assert.notDeepEqual(layout(42, 2).tiles, layout(43, 2).tiles);
});

test('stuck: nothing of the pile fits anywhere', () => {
  const b = newBoard();
  // a full quarter but one cell; the pile holds only a 2×2: stuck
  for (let y = 0; y < N; y++) place(b, y + 1, y === N - 1 ? 4 : 5, 1, 0, y);
  assert.equal(stuck(b, [{ w: 2, h: 2 }]), true);
  assert.equal(stuck(b, [{ w: 2, h: 2 }, { w: 1, h: 1 }]), !fits(b, 1, 1));
  assert.equal(done(b), false);
});

// ── build 117: five steps of difficulty (ירון 10.11: "רמות הקושי צריכות לעלות בצורה הדרגתית") ──
import { layoutStep, stepOf, chalkOf, STEPS } from '../src/game/h109/paving.js';
test('five steps: 4, 5, 6–7, 8–9, 9–11 slabs; the first has a 3×3; extras only at the last', () => {
  for (let st = 1; st <= 5; st++) for (let seed = 0; seed <= 200; seed++) {
    const L = layoutStep(seed, st), b = newBoard();
    L.tiles.forEach((t, i) => { assert.ok(canPlace(b, t.w, t.h, t.x, t.y), `step ${st} seed ${seed}`); place(b, i + 1, t.w, t.h, t.x, t.y); });
    assert.ok(done(b) && legal(b));
    const [a, c] = STEPS[st].want; assert.ok(L.tiles.length >= a && L.tiles.length <= c, `step ${st} seed ${seed} n ${L.tiles.length}`);
    if (st === 1) assert.ok(L.tiles.some((t) => t.w === 3 && t.h === 3));
    if (st === 2) assert.ok(L.tiles.some((t) => t.w * t.h >= 6));
    assert.equal(L.pile.filter((p) => p.extra).length, st === 5 ? 2 : 0);
    assert.equal(L.pile.filter((p) => p.cracked).length, st === 5 ? 1 : 0);
    assert.equal(chalkOf(L).length, st === 1 ? L.tiles.length : st === 2 ? 2 : 0);
  }
});
test('the step follows the paving works done', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 9].map(stepOf), [1, 2, 3, 3, 4, 4, 5, 5]);
});
