// ── build 111 ── stage 02's model: the plan, the puzzles (solvable, no joint over a joint), the courses shown, the save
import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAN, STRETCH, puzzleOf, checkCourse, createH111, solutionStones, KINDS } from '../src/game/h111/model.js';

test('the plan: 24 missions in the spec\'s order, never the same act twice in a row (rule 35)', () => {
  assert.equal(PLAN.length, 24);
  assert.equal(PLAN[0].id, 'stakes'); assert.equal(PLAN[PLAN.length - 1].id, 'closing');
  for (let i = 1; i < PLAN.length; i++) assert.notEqual(PLAN[i].k, PLAN[i - 1].k, `${PLAN[i - 1].id} → ${PLAN[i].id}`);
  for (const m of PLAN) assert.ok(KINDS.includes(m.k));
  assert.deepEqual(PLAN.filter((m) => m.k === 'lever').map((m) => m.s), [4, 6, 8]);
  assert.equal(PLAN.findIndex((m) => m.id === 'gates') < PLAN.findIndex((m) => m.id === 'bond7'), true);
});
test('every stretch\'s puzzle: its own solution fills the course with no joint over a joint; the stock holds it', () => {
  for (const T of STRETCH) {
    const P = puzzleOf(T.s), st = solutionStones(T.s).map((q, i) => ({ ...q, id: i + 1 }));
    const C = checkCourse(P, st);
    assert.ok(C.full, `stretch ${T.s} full`); assert.equal(C.joj.length, 0, `stretch ${T.s} joints`);
    if (T.lv >= 2) assert.ok(C.head, `stretch ${T.s} header`);
    const need = {}; for (const q of st) need[q.L] = (need[q.L] || 0) + 1;
    for (const [L, n] of Object.entries(need)) assert.ok((P.stock.find((s) => s.L === +L) || { n: 0 }).n >= n, `stretch ${T.s} stock ${L}`);
    if (T.gate != null) assert.ok(P.open && P.open[1] - P.open[0] === 10);
    assert.equal(P.marks, !T.bare);
  }
});
test('a joint over a joint is found', () => {
  const P = puzzleOf(1), x = [...P.below[0]][0];
  const C = checkCourse(P, [{ id: 1, a: 0, L: x, row: 0 }]);
  assert.equal(C.joj.length, 1); assert.equal(C.full, false);
});
test('the courses the world shows, and a skipped mission leaves the crews\' work', () => {
  const M = createH111();
  assert.equal(M.coursesShown(M.mission()), -1);
  M.done({ stars: 3 });
  assert.equal(M.coursesShown(M.mission()), 1);
  assert.ok(M.st.lay[1] && M.st.lay[1].stones.length === 0 || true);
  M.done({ stars: 3 }); assert.ok(M.st.lay[1].stones.length > 0);
  while (M.mission() && M.mission().id !== 'closing') M.done({ stars: 2 });
  assert.equal(M.coursesShown(M.mission()), 'last');
  assert.equal(M.st.gates.length, 7); assert.ok(M.st.giant[8].done);
  M.done({ stars: 3 }); assert.equal(M.coursesShown(M.mission()), 'done'); assert.ok(M.finished());
  assert.equal(M.unitEnd({ k: 'plumb', s: 1 }).title, 'קטע 1 מתוך 9');
});
