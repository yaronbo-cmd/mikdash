// build 116 (brief §D): the world's free works. They open beside his work, never count for progress or the plan's end,
// and the address book's first nine sectors stay the kohen's.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createH109, PLAN, freeOf } from '../src/game/h109/model.js';
import { BOOK } from '../src/game/world/grid.js';

const doId = (M, id, res = { stars: 3, q: 1 }) => { assert.ok(M.pick(id), 'open: ' + id); M.done(res); };

test('the address book: 113 rock cells, none twice, the kohen nine first', () => {
  assert.equal(BOOK.sectors.length, 113);
  const seen = new Set(BOOK.sectors.map((s) => s.k + ',' + s.r));
  assert.equal(seen.size, BOOK.sectors.length);
  assert.deepEqual(BOOK.kohen, BOOK.sectors.slice(0, 9));
  assert.ok(BOOK.pits.length >= 6);
  const names = new Set(BOOK.sectors.map((s) => s.name)); for (const p of BOOK.pits) assert.ok(!names.has(p.name), 'a pit on rock: ' + p.name);
});

test('free ids parse; plan ids are not free', () => {
  assert.deepEqual(freeOf('rocks9'), { k: 'rocks', id: 'rocks9', s: 9, lv: 3, free: true });
  assert.equal(freeOf('rocks3'), null);
  assert.equal(freeOf('pave3'), null);
  assert.equal(freeOf('pave3q2').q, 2);
  assert.equal(freeOf('pave12').s, 12);
  assert.equal(freeOf('course2').c, 2);
  assert.equal(freeOf('course1'), null);
  assert.equal(freeOf('waste4').k, 'waste');
  assert.equal(freeOf('waste3'), null);
  for (const m of PLAN) assert.equal(freeOf(m.id), null, m.id);
});

test('free works open beside his, never count for progress, and the plan still ends', () => {
  const M = createH109(); doId(M, 'rope');
  const p0 = M.progress();
  const F = M.free(); assert.ok(F.length > 0, 'something free after the rope');
  for (const m of F) assert.ok(m.free && !PLAN.some((p) => p.id === m.id), m.id);
  // a free rock cell: done, and progress does not move
  const r = F.find((m) => m.k === 'rocks'); assert.ok(r, 'a free rock cell');
  doId(M, r.id);
  assert.equal(M.progress(), p0);
  assert.ok(M.free().some((m) => m.id === 'read' + r.s), 'its reading opens');
  doId(M, 'read' + r.s);
  assert.equal(M.progress(), p0);
  assert.ok(M.free().some((m) => m.id === 'pave' + r.s), 'its first quarter opens');
  // the plan to its end with the auto player: free works never block it
  for (let g = 0; g < PLAN.length * 3 && !M.finished(); g++) { const m = M.open().find((x) => !x.free); if (!m) break; doId(M, m.id); }
  assert.ok(M.finished(), 'the plan ends');
  assert.equal(M.progress(), 1);
});

test('a free course opens only after the one before it', () => {
  const M = createH109(); doId(M, 'rope');
  assert.ok(!M.free().some((m) => m.k === 'course'));
  for (let g = 0; g < PLAN.length * 3 && !M.finished(); g++) { const m = M.open().find((x) => !x.free); if (!m) break; doId(M, m.id); }
  const c = M.free().filter((m) => m.k === 'course'); assert.deepEqual(c.map((m) => m.id), ['course2']);
  doId(M, 'course2');
  assert.deepEqual(M.free().filter((m) => m.k === 'course').map((m) => m.id), ['course3']);
});

test('the crews never cut a cell he took', () => {
  const M = createH109(); doId(M, 'rope');
  const r = M.free().find((m) => m.k === 'rocks'); M.pick(r.id);
  assert.ok(!M.crewCut().includes(r.s));
});
