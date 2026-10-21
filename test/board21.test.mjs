// BOARD21: the demo kohanim (deterministic, paced to the player's day-start snapshot), the board's order, the toggle's default, the rank-up.
// Run: node --test test/board21.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/game/state.js';
import * as A from '../src/game/hooks/around.js';

const mem = () => { const m = new Map(); return { get: (k) => (m.has(k) ? m.get(k) : null), set: (k, v) => { m.set(k, v); return true; }, remove: (k) => m.delete(k), m }; };
const DAY = '2026-10-08';
const mk = (d = 0, s = 0) => { const G = S.fresh(1e12); G.name = 'דרור'; G.dinars = Array.from({ length: d }, (_, i) => ({ n: i + 1 })); G.stats.stones = s; A.rollDay(G, DAY); return G; };

test('a fresh player: exactly 3 demo rows, marked, and himself; one ahead, one level, one behind', () => {
  const G = mk(), st = mem(), B = A.boardRows(G, DAY, st);
  assert.equal(B.rows.length, 4); assert.equal(B.rows.filter((r) => r.demo).length, 3); assert.equal(B.rows.filter((r) => r.cur).length, 1);
  assert.deepEqual(B.rows.filter((r) => r.demo).map((r) => r.name), [...A.DEMO_NAMES]);
  const me = B.rows.find((r) => r.cur), idx = (n) => B.rows.findIndex((r) => r.name === n);
  assert.ok(idx(A.DEMO_NAMES[0]) < B.rows.indexOf(me), 'one is ahead of him');
  assert.ok(idx(A.DEMO_NAMES[2]) > B.rows.indexOf(me), 'one is behind');
});
test('the demos are paced to the day-start snapshot: x1.2 ahead, level, x0.8 behind, +1 / 0 / -1 day', () => {
  const G = mk(10, 100), d = A.demoRows(G, DAY);
  assert.equal(d[0].d, 12); assert.ok(d[0].s >= 123 && d[0].s <= 125); assert.equal(d[0].t, A.streak(G, DAY).n + 1);
  assert.equal(d[1].d, 10); assert.ok(d[1].s >= 101 && d[1].s <= 102);
  assert.equal(d[2].d, 8); assert.equal(d[2].s, 80);
  // playing today does not move them (he can pass them), tomorrow they pace to where he ended
  G.dinars.push({ n: 11 }, { n: 12 }, { n: 13 }); G.stats.stones = 140;
  assert.deepEqual(A.demoRows(G, DAY).map((r) => [r.d, r.s]), d.map((r) => [r.d, r.s]));
  A.rollDay(G, '2026-10-09'); assert.equal(A.demoRows(G, '2026-10-09')[1].d, 13);
});
test('deterministic: the same date and numbers give the same rows; no Math.random', () => {
  const a = A.demoRows(mk(3, 40), DAY), b = A.demoRows(mk(3, 40), DAY);
  assert.deepEqual(a, b);
});
test('a real family row pushes the demos to the bottom; two real rows hide them by default; the toggle wins', () => {
  const G = mk(2, 20), st = mem();
  assert.ok(A.addKin(G, 'אחי', A.codeOf({ d: 9, s: 300, t: 4 })));
  let B = A.boardRows(G, DAY, st);
  assert.equal(B.fam, 1); assert.equal(B.rows[0].name, 'אחי'); assert.ok(B.rows.slice(-3).every((r) => r.demo), 'demos last');
  assert.ok(A.addKin(G, 'בן דוד', A.codeOf({ d: 1, s: 5, t: 1 })));
  B = A.boardRows(G, DAY, st); assert.equal(B.shown, false); assert.equal(B.rows.some((r) => r.demo), false);
  G.around.demo = 'show'; B = A.boardRows(G, DAY, st); assert.equal(B.rows.filter((r) => r.demo).length, 3);
  G.around.demo = 'hide'; G.around.kin.pop(); B = A.boardRows(G, DAY, st); assert.equal(B.rows.some((r) => r.demo), false, 'hidden by his choice at one row too');
});
test('the rank-up shows once: only a better place on the same board, then it is the new baseline', () => {
  const G = mk();
  assert.equal(A.rankSeen(G, 4, '0|3').up, false, 'the first open: nothing to compare');
  assert.equal(A.rankSeen(G, 4, '0|3').up, false);
  const r = A.rankSeen(G, 2, '0|3'); assert.deepEqual([r.up, r.place], [true, 2]);
  assert.equal(A.rankSeen(G, 2, '0|3').up, false, 'once');
  assert.equal(A.rankSeen(G, 1, '1|0').up, false, 'the board changed (a brother came): not a climb');
  assert.equal(A.rankSeen(G, 3, '1|0').up, false);
});
