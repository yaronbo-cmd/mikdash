// ── build 113 ── stage 04's model: the plan, the measures, the widths puzzle's solutions, the precision that runs on, the keys, the save
import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAN, KINDS, H113, GATES, SOUTH, LV, SOCKETS, PILES, PISH_PILE, solutions, inherit, lockGap, lockOf, createH113, freshH113, qOf, starsOf } from '../src/game/h113/model.js';

test('the plan: 15 missions, five stations × three levels, never the same station twice in a row (rule 35)', () => {
  assert.equal(PLAN.length, 15);
  for (let i = 1; i < PLAN.length; i++) assert.notEqual(PLAN[i].k, PLAN[i - 1].k);
  for (const m of PLAN) assert.ok(KINDS.includes(m.k));
  assert.deepEqual(PLAN.slice(0, 5).map((m) => m.k), ['socket', 'lintel', 'leaf', 'hang', 'lock']);
});
test('the measures (Middot 2:3): openings ten amot wide and twenty high; a leaf is half the opening; the socket three fingers', () => {
  assert.equal(H113.OPEN_W, 10); assert.equal(H113.OPEN_H, 20); assert.equal(H113.TOP - H113.FLOOR, 20);
  assert.equal(H113.LEAF_W * 2, H113.OPEN_W);
  assert.equal(Math.round(H113.SOCKET_D * 24), 3);
  assert.equal(Object.keys(GATES).length + SOUTH.length, 6);   // (the seventh, Nikanor, is a later stage)
});
test('the widths puzzle: level 1 one way, level 2 exactly two (one through the knot), level 3 only with the wicket board', () => {
  assert.deepEqual(solutions(1), [[0, 1]]);
  const s2 = solutions(2); assert.equal(s2.length, 2);
  assert.equal(s2.filter((ix) => ix.some((i) => PILES[2][i].knot)).length, 1);
  for (const ix of solutions(3)) assert.ok(ix.some((i) => PILES[3][i].hole), 'level 3 needs the wicket board');
  // (the wicket's door: two narrow boards to exactly one amah)
  const w = PISH_PILE.map((p) => p.w); let pairs = 0;
  for (let i = 0; i < w.length; i++) for (let j = i + 1; j < w.length; j++) if (Math.abs(w[i] + w[j] - 1) < 1e-9) pairs++;
  assert.ok(pairs >= 1);
});
test('the precision runs on: a deep socket lowers the leaf, an off place leaves a gap at the lock; a careful gate none', () => {
  const st = freshH113();
  st.sock[1] = { done: 1, list: SOCKETS[1].map((s) => ({ id: s.id, ex: 0, dd: 0, shift: 0 })) };
  st.leaf[1] = { done: 1, gap: 0 }; st.hang[1] = { done: 1, gap: 0 };
  assert.equal(lockGap(st, 1), 0);
  const I0 = inherit(st, 1); assert.ok(Math.abs(I0.low) < 0.5 && Math.abs(I0.lean) < 1);
  Object.assign(st.sock[1].list[0], { dd: 1.5, deep: 1 });   // (1.5 fingers too deep: lead poured)
  assert.ok(inherit(st, 1).low >= 1);
});
test('the keys: level 1 one right key; level 2 the first lacks a peg; level 3 a long key with a peg under every pin', () => {
  for (const lv of [1, 2, 3]) {
    const L = lockOf(lv); assert.equal(L.pins.length, LV[lv].pins);
    const ok = L.keys.filter((k) => k.ok); assert.equal(ok.length, 1);
    for (const p of L.pins) assert.ok(ok[0].pegs.includes(p));
  }
  assert.equal(lockOf(2).keys[0].ok, 0);
  assert.ok(lockOf(3).keys.find((k) => k.ok).long);
});
test('the save: done() runs the plan to the end; the six gates; a lock closes a unit; quality to stars', () => {
  const M = createH113();
  while (!M.finished()) M.done({ stars: 3, q: 1 });
  assert.equal(M.gatesDone(), 6);
  assert.equal(M.progress(), 1);
  const M2 = createH113(JSON.parse(JSON.stringify(M.st)));
  assert.ok(M2.finished());
  assert.equal(qOf(40), 1); assert.equal(starsOf(qOf(10)), 1);
  const u = createH113(); for (let i = 0; i < 5; i++) u.done({ stars: 3, q: 1 });
  const unit = u.unitEnd(PLAN[4]); assert.ok(unit && /נעול/.test(unit.title));
});
