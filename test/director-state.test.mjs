// DIRECTOR13 (wave 13) — the state's side of the course end and the demo's payment:
//   node test/director-state.test.mjs
// N79: a course the crews close is in the settle report (rep.courses), as his own stroke's out.course.
// #11: in the demo one payment buys every segment the stock may hold (STOCK_MAX), and the pill / the sheet say so (buyOf).
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/game/state.js';
import { STOCK_MAX, PROJ } from '../src/game/content.js';

const T0 = Date.UTC(2026, 8, 30, 9, 0, 0);
function wallAt(G, set) {
  S.startBuild(G, 'wall');
  for (let k = 0; k < 40; k++) { const j = S.jobOf(G, 'wall'); if (j.kind === 'pay') S.payStep(G, 'wall'); else if (j.kind === 'stone' || j.kind === 'key') break; else S.stroke(G, 'wall', true); }
  const s = G.st.wall; Object.assign(s, { paid: s.n, set, k: 0, chk: 0 });
  for (let i = 0; i < PROJ.wall.P * 3; i++) if (s.keys[i] == null) s.keys[i] = 0.9;
  return s;
}

test('N79: the crews close a course → rep.courses carries it (the last course number), once', () => {
  const G = S.demoAt(S.fresh(T0, { demo: true }), 'wall', T0);
  wallAt(G, PROJ.wall.P - 2);
  assert.ok(S.crewsAt(G, 'wall') >= 1, 'a crew at the wall');
  let t = G.clock, seen = [];
  for (let k = 0; k < 30 && G.st.wall.set < PROJ.wall.P + 2; k++) { t += 1000; const rep = S.settle(G, t); if (rep.courses && rep.courses.wall) seen.push(rep.courses.wall); }
  assert.deepEqual(seen, [1], `course 1 reported once (${seen})`);
});

test('N79: the partner\'s stone (coStone) that closes a course reports it too', () => {
  const G = S.demoAt(S.fresh(T0, { demo: true }), 'wall', T0);
  wallAt(G, PROJ.wall.P - 1);
  const r = S.coStone(G, 'wall');
  assert.ok(r && r.stones.wall === 1 && r.courses.wall === 1, JSON.stringify(r && r.courses));
});

test('#11: in the demo one payment buys the stock\'s segments; the pill and the sheet name them; the regular game one', () => {
  const G = S.demoAt(S.fresh(T0, { demo: true }), 'wall', T0);
  S.startBuild(G, 'wall');
  for (let k = 0; k < 40 && !(S.jobOf(G, 'wall').kind === 'pay' && S.jobOf(G, 'wall').step === 'seg'); k++) { const j = S.jobOf(G, 'wall'); if (j.kind === 'pay') S.payStep(G, 'wall'); else S.stroke(G, 'wall', true); }
  const a = S.nextAction(G), v = S.siteView(G, 'wall');
  assert.equal(a.kind, 'build'); assert.equal(a.stones, 8 * STOCK_MAX, 'the pill: "הביאו 24 אבנים"');
  assert.equal(v.step.stones, 8 * STOCK_MAX); assert.equal(v.step.segs, STOCK_MAX);
  const st0 = G.res.stone, r = S.payStep(G, 'wall');
  assert.ok(r.ok && r.step.segs === STOCK_MAX && G.st.wall.paid === 8 * STOCK_MAX, JSON.stringify(r.step));
  assert.equal(st0 - G.res.stone, PROJ.wall.seg.stone * STOCK_MAX, 'paid for three');
  // the regular game: one segment a payment
  const R = S.fresh(T0, {}); R.ftue = 99; R.res.stone = 900; R.res.silver = 900;
  for (const id of ['har']) { R.st[id] = { done: true }; }
  S.completeStage && S.completeStage(R, 'har');
  if (S.statusOf(R, 'wall') === 'avail') {
    S.startBuild(R, 'wall');
    for (let k = 0; k < 40 && !(S.jobOf(R, 'wall').kind === 'pay' && S.jobOf(R, 'wall').step === 'seg'); k++) { const j = S.jobOf(R, 'wall'); if (j.kind === 'pay') S.payStep(R, 'wall'); else S.stroke(R, 'wall', true); }
    const r2 = S.payStep(R, 'wall');
    assert.ok(r2.ok && !r2.step.segs && R.st.wall.paid === 8, JSON.stringify(r2.step));
  }
});

test('#11: the demo\'s tutorial keeps one segment a payment (its board comes when the mentor\'s segment is spent)', () => {
  const G = S.fresh(T0, { demo: true });
  assert.ok(G.ftue < 99);
  const st = { step: 'seg', cost: { stone: 12 }, stones: 8 };
  assert.equal(S.buyOf(G, 'har', st), st);
});
