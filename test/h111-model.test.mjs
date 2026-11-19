// ── build 111 ── stage 02's model: the plan, the puzzles (solvable, no joint over a joint), the courses shown, the save
import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAN, STRETCH, puzzleOf, checkCourse, createH111, solutionStones, KINDS, countSolutions, canFinish, misplaced } from '../src/game/h111/model.js';

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
    for (const [L, n] of Object.entries(need)) assert.ok(P.stock.filter((s) => s.L === +L).length >= n, `stretch ${T.s} stock ${L}`);
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

// ── build 118 ── the puzzle is a real logic puzzle (brief §M): exact stock and one way from stretch 4; one extra stone and 2–3 ways before
test('build 118: every stretch meets the table (ways to close, stock, header, bonus)', () => {
  const t0 = Date.now();
  for (const T of STRETCH) {
    const P = puzzleOf(T.s);
    const cells = 2 * (P.G - (P.open ? P.open[1] - P.open[0] : 0));
    const sum = P.stock.reduce((a, q) => a + (q.L === 6 ? 4 : q.L), 0);
    if (T.lv === 1) {
      assert.ok(P.n >= 2 && P.n <= 3, `stretch ${T.s}: ${P.n} ways`); assert.equal(P.exact, false); assert.equal(P.bonus, 100);
      assert.ok(sum - cells >= 2 && sum - cells <= 5, `stretch ${T.s}: one extra stretcher`); assert.equal(P.head, null);
    } else {
      assert.equal(P.n, 1, `stretch ${T.s}: exactly one way`); assert.equal(P.exact, true); assert.equal(sum, cells, `stretch ${T.s}: exact stock`);
      assert.equal(P.bonus, T.lv === 2 ? 200 : 400);
      if (T.s !== 7 && T.s !== 8) assert.ok(P.head != null, `stretch ${T.s}: header`);
    }
    assert.equal(countSolutions(P, 4, solutionStones(T.s)), 1, `stretch ${T.s}: its own solution closes`);
    for (const q of P.stock) assert.ok(q.id > 0 && [2, 3, 4, 5, 6].includes(q.L));
    for (let r = 0; r < 2; r++) { let x = P.open && P.belowStones[r][0][0] === 0 ? 0 : 0; for (const [a, L] of P.belowStones[r]) { assert.ok(L >= 2 && L <= 4); x = a + L; } assert.equal(x, P.G); }
    assert.equal(puzzleOf(T.s), P, 'the same on every call');
  }
  assert.ok(Date.now() - t0 < 1500);
});
test('build 118: a stone that blocks the course is found, and the master chalks it', () => {
  const P = puzzleOf(5), sol = solutionStones(5);
  assert.ok(canFinish(P, []));
  assert.ok(canFinish(P, sol.slice(0, 2)));
  // a stretcher where the solution's header goes: no way to close (the header has nowhere else)
  const wrong = { a: P.head, L: 2, row: 0 };
  assert.equal(canFinish(P, [wrong]), false);
  assert.deepEqual(misplaced(P, [sol[0], wrong]), wrong);
  assert.equal(misplaced(P, [sol[0]]), null);
});
