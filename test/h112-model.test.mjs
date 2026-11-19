// ── build 112 ── stage 03's model: the plan, the runs, the drift the closing bay inherits, the steps, the 13, the save
import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAN, KINDS, RUNS, H112, STEPS, stepOf, STEPS_OF, runPosts, closingOf, warnOf, driftOf, bayWidth, createH112, freshH112 } from '../src/game/h112/model.js';

test('the plan: 15 missions, five stations × three levels, never the same station twice in a row (rule 35)', () => {
  assert.equal(PLAN.length, 15);
  for (let i = 1; i < PLAN.length; i++) assert.notEqual(PLAN[i].k, PLAN[i - 1].k);
  for (const m of PLAN) assert.ok(KINDS.includes(m.k));
  assert.deepEqual(PLAN.slice(0, 5).map((m) => m.k), ['posts', 'slab', 'warn', 'steps', 'close']);
});
test('the 13: ten lattice slabs and three closings (spec "המספר שלוש עשרה")', () => {
  const slabs = [1, 2, 3].reduce((a, lv) => a + RUNS[lv].bays.length, 0);
  assert.equal(slabs + 3, 13);
  const M = createH112();
  while (!M.finished()) M.done({ stars: 3, q: 1 });
  assert.equal(M.slabsLaid(), 13);
  assert.equal(M.progress(), 1);
});
test('every bay of a run: its slab fits between the posts as they stand; the kohen\'s posts are his', () => {
  for (const lv of [1, 2, 3]) {
    const R = RUNS[lv], ps = runPosts(lv, null);
    for (const pi of R.kposts) assert.ok(R.posts[pi].k, `run ${lv} post ${pi}`);
    for (const [a, b] of [...R.bays, ...R.crewBays, R.close]) { const w = bayWidth(ps[a], ps[b]); assert.ok(w > 1.0 && w < 3.4, `run ${lv} bay ${a}-${b}: ${w}`); }
    assert.ok(R.posts[R.warnAt].tall, `run ${lv} warn post tall`);
  }
});
test('the drift: a careful row leaves the closing bay nearly regular; a careless one moves it; the cart has a fit for a careful row', () => {
  for (const lv of [1, 2, 3]) {
    const n = RUNS[lv].kposts.length;
    const careful = { posts: { [lv]: { done: 1, e: Array(n).fill(0), ez: 0, drift: driftOf(lv, []) } } };
    const C = closingOf(lv, careful);
    assert.ok(C.cart.some((w) => w - C.need <= 0.03 && w - C.need >= -0.05), `level ${lv}: a fit for ${C.need} in ${C.cart}`);
    const careless = { posts: { [lv]: { done: 1, e: Array(n).fill(0.3), ez: 0, drift: driftOf(lv, Array(n).fill(0.3)) } } };
    assert.ok(Math.abs(closingOf(lv, careless).need - C.need) > 0.1, `level ${lv}: the careless drift shows`);
  }
});
test('the warning slab: every 3rd post at level 1, every 4th from level 2; level 3 comes upside down too', () => {
  for (const lv of [1, 2, 3]) {
    const W = warnOf(lv), R = RUNS[lv];
    assert.equal(W.at - W.from, W.every, `level ${lv}`);
    assert.equal(W.every, lv === 1 ? 3 : 4);
    assert.ok(H112.TEXT.join(' ').includes(W.word));
  }
  assert.equal(warnOf(3).flips, 2); assert.equal(warnOf(2).talls.length >= 2, true);
});
test('the steps: twelve of half an amah, the twelfth meets the Chel\'s floor at 6; each level lays four', () => {
  for (let k = 1; k <= 12; k++) { const s = stepOf(k); assert.equal(s.top, 0.5 * k); if (k > 1) assert.ok(Math.abs(stepOf(k - 1).face - s.face - 0.5) < 1e-9, `tread ${k - 1}`); }
  assert.equal(stepOf(12).top, 6); assert.ok(stepOf(12).face - stepOf(12).D >= STEPS.x0 - 1e-9);
  assert.deepEqual([...STEPS_OF[1], ...STEPS_OF[2], ...STEPS_OF[3]], [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
});
test('the save: a fresh one, and a mission skipped leaves the world as the crews would have', () => {
  const st = freshH112(); assert.equal(st.v, 1);
  const M = createH112(st);
  for (let i = 0; i < 5; i++) M.done({ stars: 2 });
  assert.equal(st.posts[1].done, 1); assert.equal(st.slabs[1].laid.every(Boolean), true); assert.equal(st.steps.n, 4); assert.equal(st.close[1].done, 1);
  assert.equal(M.mission().id, 'posts2');
  assert.ok(M.unitEnd(PLAN[4]));
});
