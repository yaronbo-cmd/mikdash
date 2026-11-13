import test from 'node:test';
import assert from 'node:assert/strict';
import { cellOf, rectOf, nameOf, parse, addr, heb, BOOK, ROCK_CELLS, KOHEN_CELLS, SQ_N } from '../src/game/world/grid.js';

test('grid: Hebrew numerals and names round-trip', () => {
  assert.equal(heb(1), 'א'); assert.equal(heb(10), 'י'); assert.equal(heb(12), 'יב'); assert.equal(heb(15), 'טו'); assert.equal(heb(16), 'טז'); assert.equal(heb(20), 'כ'); assert.equal(heb(24), 'כד');
  for (let k = 0; k < 24; k++) for (let r = -12; r < 24; r++) assert.deepEqual(parse(nameOf(k, r)), { k, r }, nameOf(k, r));
  assert.equal(nameOf(11, 5), 'יב־6'); assert.equal(nameOf(0, 20), 'א־ד1'); assert.equal(nameOf(3, -1), 'ד־צ1');
});
test('grid: the square is 20 × 20 cells, its corners in the right cells', () => {
  assert.deepEqual(cellOf(276.9, -183.4), { k: 0, r: 0 });
  assert.deepEqual(cellOf(-222.9, 316.4), { k: SQ_N - 1, r: SQ_N - 1 });
  assert.deepEqual(cellOf(-223.1, 316.6), { k: SQ_N, r: SQ_N });
  const R = rectOf(11, 5); assert.equal(R.x1 - R.x0, 25); assert.equal(R.cx, 277 - 11 * 25 - 12.5); assert.equal(R.cz, -183.5 + 5 * 25 + 12.5);
  const a = addr(271, -177.5); assert.equal(a.cell, 'א־1'); assert.equal(a.west, 6); assert.equal(a.south, 6);
});
test('grid: the rock cells are the 113 of the square, the kohen\'s nine among them', () => {
  assert.equal(ROCK_CELLS.length, 113);
  for (const [k, r, h] of ROCK_CELLS) { assert.ok(k >= 0 && k < SQ_N && r >= 0 && r < SQ_N); assert.ok(h >= 3); }
  for (const [k, r] of KOHEN_CELLS) assert.ok(ROCK_CELLS.some((c) => c[0] === k && c[1] === r), nameOf(k, r));
  assert.deepEqual(BOOK.kohen.map((c) => c.name), ['יב־6', 'יב־7', 'יב־8', 'יג־6', 'יג־7', 'יג־8', 'יד־6', 'יד־7', 'יד־8']);
});
test('grid: the book is the same on every load, every rock inside its cell, none touching, every stand clear', async () => {
  const again = await import('../src/game/world/grid.js?again');
  assert.deepEqual(JSON.parse(JSON.stringify(again.BOOK)), JSON.parse(JSON.stringify(BOOK)));
  const rocks = [];
  for (const C of BOOK.kohen) {
    const R = C.rect, b = C.big;
    assert.ok(b.x - b.r > R.x0 && b.x + b.r < R.x1 && b.z - b.r > R.z0 && b.z + b.r < R.z1, C.name + ' big');
    assert.equal(C.small.length, 5, C.name + ' five small rocks');
    rocks.push(b);
    for (const o of C.small) { assert.ok(o.x - o.r >= R.x0 && o.x + o.r <= R.x1 && o.z - o.r >= R.z0 && o.z + o.r <= R.z1, C.name + ' small inside'); rocks.push(o); }
  }
  for (let i = 0; i < rocks.length; i++) for (let j = i + 1; j < rocks.length; j++) { const p = rocks[i], q = rocks[j]; assert.ok(Math.hypot(p.x - q.x, p.z - q.z) > p.r + q.r + 1, 'apart ' + i + ' ' + j); }
  for (const C of BOOK.kohen) for (const o of C.small) for (const q of rocks) assert.ok(Math.hypot(o.sx - q.x, o.sz - q.z) > q.r + 0.9, C.name + ' stand clear');
  assert.ok(Object.isFrozen(BOOK) && Object.isFrozen(BOOK.kohen[0].small[0]));
});
