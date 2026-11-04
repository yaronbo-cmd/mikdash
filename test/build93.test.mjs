// build 93: stage 05 rebuilt as physical acts (the owner, 3.11 22:12: "תמשיך ל 4-6"; the task doc stage 05: the log on the trestle, the
// flaw on the log itself, peeling along the grain; the beam carried by two, the far end steered into the socket, a knock on the wall; the
// peg by the mallet in a macro, one blow too many splits it; the review §3: each act more than once, each time harder). Never a Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/gallery93.js';
import { WOOD48 } from '../src/game/fam42.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const seq = (...v) => { let i = 0; return () => v[i++ % v.length]; };

/** a careful hand on the beam: aims while the far end is off (the carriers stand), lets them walk when it is on; near the wall, short walks */
function carefulBeam(i, rush = false) {
  const J = F.createBeam93(i), dt = 1 / 30; let walkT = 0;
  for (let t = 0; t < 300 && !J.state().done; t += dt) {
    const k = J.state(), e = J.end();
    if (rush) J.hold(t < 0.2, 0, 0);
    else {
      const calm = Math.abs(e.x - k.rx) < 0.035 && Math.abs(e.x) < 0.07 && Math.abs(e.y) < 0.07;
      let aim = !calm || t < 0.1; if (!aim) { walkT += dt; if (k.d < 2.5 && walkT > 0.4) { aim = true; walkT = 0; } }
      J.hold(aim, k.fx - (e.x - k.bx), k.fy - (e.y - k.by));
    }
    J.step(dt);
  }
  return J.state();
}

test('build 93: the log — the flaw under the bark is seen only where the bark was peeled, along the grain', () => {
  const J = F.createLog93('gallery', seq(0.5, 0.5, 0.5, 0.5, 0.5), 1), k = J.state();
  assert.equal(k.at.face, 2); assert.ok(!J.visible(2), 'under the bark: not seen');
  const s = J.seg(k.at.u), other = s === 0 ? 7 : 0;
  assert.equal(J.peel(2, other / 8 + 0.01, other / 8 + 0.02, 3, 60), 'peel'); assert.ok(!J.visible(2), 'peeled elsewhere: still hidden');
  assert.equal(J.peel(2, k.at.u, k.at.u, 40, 60), 'stuck', 'against the grain: the hand sticks'); assert.equal(k.sticks, 1); assert.ok(!J.visible(2));
  assert.equal(J.peel(2, k.at.u, k.at.u, 85, 60), 'across', 'across the log: a roll, not a peel');
  assert.equal(J.peel(2, k.at.u - 0.05, k.at.u + 0.05, 178, 60), 'peel'); assert.ok(J.visible(2), 'peeled there: the worm\'s galleries');
  assert.equal(J.peel(2, k.at.u, k.at.u, 0, 5), 'tap', 'a tap peels nothing');
  assert.equal(J.decide(false, 80), 'ok'); assert.equal(F.logQ93('ok'), 1);
});

test('build 93: the log — a dropping is peeled off; a good log to the heap is כשר, a bad log to the altar is none of his', () => {
  const D = F.createLog93('drop', seq(0.1, 0.5, 0.5, 0.5, 0.5), 2), k = D.state();
  assert.ok(D.visible(k.at.face)); D.peel(k.at.face, k.at.u, k.at.u, 0, 40); assert.ok(!D.visible(k.at.face), 'peeled off: clean wood');
  assert.equal(F.createLog93('knot', Math.random, 1).decide(false, 50), 'waste'); assert.equal(F.logQ93('waste'), 0.5);
  assert.equal(F.createLog93('olive', Math.random, 1).decide(true, 50), 'bad'); assert.equal(F.logQ93('bad'), 0);
  const R = F.createLog93('holes', Math.random, 1); R.roll(1); R.roll(-1); R.roll(-1); assert.equal(R.state().face, 3); assert.equal(R.state().rolls, 3);
  assert.ok(F.LOG93.n[3] > F.LOG93.n[1], 'more logs as he gets better');
  for (const t of Object.keys(WOOD48)) assert.equal(F.createLog93(t).state().bad, !!WOOD48[t].bad);
});

test('build 93: the beam — a careful hand aims while they stand and lets them walk when it is on: in the socket, no knock, at every level', () => {
  for (let i = 0; i < 3; i++) { const s = carefulBeam(i); assert.ok(s.done, `beam ${i}`); assert.equal(s.knocks, 0, `beam ${i}: ${JSON.stringify(s.last)}`); assert.equal(s.q, 1); }
});

test('build 93: the beam — let go and never aimed, the carriers\' steps carry it off: it knocks on the wall, they step back; three knocks and the crews set it', () => {
  for (let i = 0; i < 3; i++) { const s = carefulBeam(i, true); assert.ok(s.done); assert.ok(s.knocks >= 1 && s.q < 1, `beam ${i} rushed`); }
  const J = F.createBeam93(1); J.step(2); assert.equal(J.state().d, F.BEAM93.d0, 'before his first touch they wait');
  J.hold(true, 0, 0); J.step(1); const d1 = J.state().d; assert.equal(d1, F.BEAM93.d0, 'his finger on it: they stand');
  J.hold(false); J.step(0.5); const w1 = J.state().w; J.step(1.5); assert.ok(J.state().w > w1, 'the longer they walk, the faster');
  assert.ok(F.BEAM93.L[2].lag > F.BEAM93.L[0].lag && F.BEAM93.L[2].tolX < F.BEAM93.L[0].tolX && F.BEAM93.L[2].wander > F.BEAM93.L[0].wander, 'each beam harder');
});

test('build 93: the peg — the mallet\'s height is the blow; a measured hand takes it flush; full blows split it; three split, the crews\' peg', () => {
  for (let i = 0; i < 3; i++) {
    const P = F.createPeg93(i); let n = 0;
    while (!P.state().locked && n++ < 40) P.blow(Math.max(0.08, Math.min(1, P.need() * 0.95)));
    for (let j = 0; j < 10; j++) P.step(0.2);
    assert.ok(P.state().done && P.state().q === 1 && P.state().splits === 0, `peg ${i}`);
  }
  const R = F.createPeg93(2); for (let n = 0; n < 40 && !R.state().done; n++) R.blow(1);
  assert.ok(R.state().done && R.state().crew && R.state().q === 0);
  const T = F.createPeg93(0); assert.equal(T.blow(0.02), 'tap'); T.blow(1); T.blow(1); while (!T.state().locked) T.blow(0.2);
  assert.equal(T.blow(0.3), 'split', 'a blow after it is flush splits it'); assert.equal(T.state().depth, 0, 'a new peg');
  const p0 = T.pitch(); T.blow(0.5); assert.ok(T.pitch() > p0, 'the note rises as it goes in');
});

test('build 93: wiring — the parts, the order, the acts in the world; lines sourced and short', async () => {
  const { GAME_BUILD } = await import('../src/avodah/shift/lobby35.js');
  assert.equal(GAME_BUILD, 94);
  const { LINE42, PARTS93 } = await import('../src/game/har42.js');
  const { DEP63, open63 } = await import('../src/game/site63.js');
  assert.deepEqual([...PARTS93], ['open', 'wood', 'beams', 'beams2', 'beams3', 'pegs', 'pegs2', 'corner', 'walk', 'reveal']);
  assert.deepEqual(open63('nashim93', PARTS93, []), ['wood', 'beams']);
  assert.deepEqual(open63('nashim93', PARTS93, ['beams']), ['wood', 'beams2', 'pegs']);
  assert.ok(DEP63.nashim, 'the old order kept for ?h93=0');
  const h = read('src/game/har42.js');
  assert.match(h, /const ON93 = MODE === 'stage' && STG === 'nashim' && qs\('h93'\) !== '0'/);
  for (const f of ['props93', 'mkWood93', 'mkBeam93', 'mkPeg93', 'mkCorner93']) assert.match(h, new RegExp(`function ${f}\\(`), f);
  for (const k of ['wood93', 'beam93', 'beam93b', 'peg93', 'peg93b', 'corner93']) { const t = LINE42[k]; assert.ok(t, k); assert.ok(/המחשה|מדות|תמיד|טיוטה/.test(t), k); assert.ok(t.split(' · ')[0].length <= 50, `${k} head ${t.split(' · ')[0].length}`); }
});
