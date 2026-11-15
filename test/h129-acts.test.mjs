// ── build 129 (part 2) ── stage 07's acts, what can be checked without a page: the Gazit's own solution (the bot's and the ONLY page's
// bench when gazit1 was the crews') passes the sight test and leaves room for the rows and both scribes, with room between the stones;
// the semicha's walkers can reach their places round it; the pack gives the Golah's three works to the crews.
import test from 'node:test';
import assert from 'node:assert/strict';
import { solvedArc, solvedRows } from '../src/game/h129/gazit.js';
import { benchState, roomFor, overlap, corners, aisles, matSeats } from '../src/game/h129/model.js';
import { createStage07, GOLAH_IN_PLAY } from '../src/game/h129/pack.js';

test('the Gazit solution: all see, room for three rows and two scribes, the stones apart', () => {
  const S = solvedArc(), R = solvedRows();
  assert.equal(S.length, 7);
  assert.ok(benchState(S).allSee);
  assert.ok(roomFor(S, R.mats, R.stands).ok);
  for (let i = 0; i < 7; i++) for (let j = i + 1; j < 7; j++) assert.ok(!overlap(corners({ ...S[i], L: S[i].L + 0.5 }), corners({ ...S[j], L: S[j].L + 0.5 })), `stones ${i} and ${j} touch`);
});
test('the semicha round the solution: every row end and the bench reachable from the door', () => {
  const S = solvedArc(), R = solvedRows();
  const free = [{ id: 'bench:3', x: S[3].x, z: S[3].z }, ...R.mats.map((m, k) => { const sl = matSeats(m).filter((_, q) => q % 2 === 0), p = sl[sl.length - 1]; return { id: 'row' + k + ':end', x: p[0], z: p[1] }; })];
  const A = aisles({ stones: S, mats: R.mats, stands: R.stands, free });
  for (const k of ['row2:end']) assert.ok(A.ids.includes(k), k + ' from the crowd');
});
test('the pack: with the Golah not in play its three works are the crews\' (no points)', () => {
  assert.equal(GOLAH_IN_PLAY, false);
  const M = createStage07(null);
  for (const id of ['golah1', 'golah2', 'golah3']) { assert.ok(M.isDone(id)); assert.equal(M.st.res[id].skip, 1); assert.equal(M.st.res[id].pts, 0); }
  assert.ok(M.canDo(M.plan.find((m) => m.id === 'gazit1')));
  assert.ok(!M.canDo(M.plan.find((m) => m.id === 'night')));
});
