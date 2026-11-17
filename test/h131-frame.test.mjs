// build 131 — stage 08 part 2, "המלבן" (src/game/h131/frame-model.js, frame.js): the frame's linkage on the book's stakes; level 1 stiff
// (seated on one stake, turned about it), level 2 four loose boards joined corner by corner (a board pulled past its length drags a
// joined corner off: a mistake), level 3 pegged at three corners with one off its stake (stuck until that peg is pulled; a right peg
// pulled is a mistake); the diagonal falls in only when square, sticks otherwise, and pushed by force cracks a board (frame.crack −20,
// kept in the save, its side in another shade); the save's blob (a reload resumes); the one grading; the act's words and places.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as FM from '../src/game/h131/frame-model.js';
import { FRAME_ACT, FLINES, FK } from '../src/game/h131/frame.js';
import { createH131, LOSS } from '../src/game/h131/model.js';
import { BOOK } from '../src/game/world/grid.js';

const S8 = BOOK.s08;
const play = (S, i, to, secs = 3, beam) => { const p = S.P[i]; FM.grab(S, i, p.x, p.z, beam); FM.dragTo(S, to[0], to[1]); const out = []; for (let t = 0; t < secs; t += 1 / 30) { const r = FM.step(S, 1 / 30); if (r.pop || r.stuck) out.push(r); } return { out, rel: FM.release(S) }; };
const at = (k) => FM.STAKE[k];

test('frame: the stakes are the book\'s, the boards 32 (רש"י), the corners in their order', () => {
  assert.deepEqual([...FM.CORNERS], ['NW', 'NE', 'SE', 'SW']);
  for (const k of FM.CORNERS) assert.deepEqual([...FM.STAKE[k]], S8.stakes[k]);
  for (const [s, [a, b]] of Object.entries(FM.SIDES)) assert.equal(Math.hypot(at(a)[0] - at(b)[0], at(a)[1] - at(b)[1]), S8.frame.L, s);
  for (const lv of [1, 2, 3]) { const S = FM.fresh(lv); for (const e of S.E.filter((q) => q.beam)) assert.ok(Math.abs(Math.hypot(S.P[e.a].x - S.P[e.b].x, S.P[e.a].z - S.P[e.b].z) - 32) < 1e-6, lv + e.beam); assert.ok(!FM.square(S), 'not square at the start ' + lv); }
});

test('frame level 1: the stiff frame slides whole, sits on one stake, turns about it onto the rest; then the diagonal falls in (40)', () => {
  const S = FM.fresh(1);
  const before = FM.fresh(1);
  play(S, 0, at('NW'));
  assert.equal(S.P[0].seat, 1);
  assert.ok(Math.abs(Math.hypot(S.P[2].x - S.P[0].x, S.P[2].z - S.P[0].z) - 32 * Math.SQRT2) < 1e-6, 'still stiff');
  assert.ok(FM.offBy(S, 'SE') > 3, 'not yet turned');
  void before;
  const r = play(S, 2, at('SE'));
  assert.ok(FM.square(S)); assert.deepEqual(r.rel.seated.sort(), ['NE', 'SE', 'SW'].sort());
  assert.deepEqual(FM.diagDrop(S), { fit: true });
  assert.deepEqual(FM.result(S), { pts: 40, q: 1, stars: 3, perfect: true, clean: true, flags: { 'frame.crack': 0, wrong: 0, stuck: 0 } });
});

test('frame: the diagonal on a frame not square sticks at the corner that lacks; a tap lifts it; pushed by force a board cracks (−20)', () => {
  const S = FM.fresh(1);
  const r = FM.diagDrop(S); assert.equal(r.fit, false); assert.ok(FM.CORNERS.includes(r.at)); assert.equal(S.stuck, 1);
  assert.ok(FM.diagLift(S)); assert.equal(S.diag, 0); assert.equal(S.dmg, 0);
  FM.diagDrop(S); const side = FM.crackBeam(S); assert.ok(FM.SIDE_K.includes(side)); assert.equal(S.dmg, 1); assert.equal(S.diag, 0);
  assert.deepEqual(S.cracks, [side]);
  const R = FM.result(S); assert.equal(R.pts, 10); assert.equal(R.stars, 1); assert.equal(R.perfect, false);
  // the loss: the spec's row, kept in the save where it happened, its side for the board in another shade
  assert.deepEqual(LOSS['frame.crack'], ['קרש מסגרת שנסדק והוחלף בקרש בגוון אחר', 20]);
  const M = createH131(null); M.pick('frame1'); assert.equal(M.mark('frame.crack', 'frame1', [-38, -19.75], FM.SIDE_K.indexOf(side)), 20);
  assert.equal(FM.crackSide(M.marksOf('frame.crack')[0].n), side);
  const st = JSON.parse(JSON.stringify(M.st)); assert.equal(createH131(st).marksOf('frame.crack').length, 1);
});

test('frame level 2: four loose boards, each end to its stake, two ends on a stake join; a board pulled past its length drags a joined corner off (a mistake)', () => {
  const S = FM.fresh(2); assert.equal(S.P.length, 8); assert.equal(S.J.length, 0);
  const order = [[0, 'NW'], [1, 'NE'], [2, 'NE'], [3, 'SE'], [4, 'SE'], [5, 'SW'], [6, 'SW'], [7, 'NW']];
  for (const [i, k] of order) { assert.equal(S.P[i].k, k); play(S, i, at(k)); assert.equal(S.P[i].seat, 1, k + i); }
  assert.equal(S.J.length, 4); assert.ok(FM.square(S)); assert.equal(FM.result(S).pts, 40);
  // the same, but the south board's end pulled far past its length once two corners are joined
  const T = FM.fresh(2); for (const [i, k] of order.slice(0, 4)) play(T, i, at(k));
  assert.equal(T.J.length, 1);
  const r = play(T, 3, [-22, 30], 4); // (the east board's south end pulled 18 amot past its stake: NE is dragged off)
  assert.ok(r.out.some((q) => q.pop && q.joined), 'a joined corner gave way'); assert.equal(T.wrong, 1, 'one pull, one mistake');
  assert.ok(FM.offBy(T, 'NE') > 0.5, 'the joined corner is off its stake (seen)');
  assert.equal(FM.result(T).pts, 20);
});

test('frame level 3: three pegged, one off its stake; the crooked corner is stuck until that peg is pulled; a right peg pulled is a mistake', () => {
  const S = FM.fresh(3), W = S8.work.frame3;
  assert.deepEqual(S.P.filter((p) => p.peg).map((p) => p.k).sort(), [...W.pegs].sort());
  assert.ok(FM.offBy(S, W.wrong) > 1.5); assert.ok(FM.offBy(S, 'SE') > 1.5); assert.equal(FM.offBy(S, 'NW'), 0);
  const r = play(S, 2, at('SE')); assert.ok(r.out.some((q) => q.stuck)); assert.ok(FM.offBy(S, 'SE') > 1.5, 'it did not move');
  // a right peg pulled: a mistake
  const T = FM.fresh(3); assert.deepEqual(FM.pegTap(T, 'NW'), { pulled: 'NW', right: false }); assert.equal(T.wrong, 1);
  // the wrong peg pulled, the crooked corner home: the pulled corner comes onto its stake, its peg driven again; square, clean
  assert.deepEqual(FM.pegTap(S, W.wrong), { pulled: W.wrong, right: true }); assert.equal(S.wrong, 0);
  play(S, 2, at('SE'));
  assert.ok(FM.square(S)); assert.equal(S.P[FM.CORNERS.indexOf(W.wrong)].peg, 1);
  assert.equal(FM.diagDrop(S).fit, true); assert.equal(FM.result(S).pts, 40);
});

test('frame: the save\'s blob — a reload resumes the corners as they lay, seated, pegged, joined, the mistakes and cracks', () => {
  const S = FM.fresh(2); play(S, 0, at('NW')); play(S, 1, at('NE')); play(S, 2, at('NE')); FM.diagDrop(S); FM.crackBeam(S);
  const b = JSON.parse(JSON.stringify(FM.save(S, 'frame2'))); assert.equal(b.id, 'frame2');
  const R = FM.load(b);
  assert.deepEqual(R.P.map((p) => [+p.x.toFixed(3), +p.z.toFixed(3), p.seat, p.peg]), S.P.map((p) => [+p.x.toFixed(3), +p.z.toFixed(3), p.seat, p.peg]));
  assert.deepEqual(R.J, S.J); assert.equal(R.dmg, 1); assert.deepEqual(R.cracks, S.cracks); assert.equal(R.stuck, 1);
  // the work goes on from there
  for (const [i, k] of [[3, 'SE'], [4, 'SE'], [5, 'SW'], [6, 'SW'], [7, 'NW']]) play(R, i, at(k));
  assert.ok(FM.square(R)); assert.equal(FM.result(R).pts, 10);
  assert.equal(FM.load(null), null); assert.equal(FM.load({ P: [[0, 0, 0, 0]], lv: 1 }), null);
  // the director's save: M.keep / M.workOf
  const M = createH131(null); M.pick('frame2'); M.keep('frame', b); assert.deepEqual(createH131(JSON.parse(JSON.stringify(M.st))).workOf('frame'), b);
});

test('frame: the starts and the rest are the book\'s rows (BOOK.s08.work), inside the court, off the Ulam\'s steps', () => {
  const W = S8.work; for (const k of ['frame1', 'frame2', 'frame3', 'diag', 'men']) assert.ok(W[k] != null, k);
  for (const lv of [1, 2, 3]) for (const p of FM.fresh(lv).P) assert.ok(p.x > -55 && p.x < -10 && p.z > -30 && p.z < 20, lv + ' ' + p.k);
  assert.ok(W.diag[1] < S8.altar[1] && W.diag[1] > S8.stand.frame[1], 'the diagonal rests between the stand and the frame');
  for (const id of ['diag', 'lime', 'jar', 'water', 'logs']) assert.ok(S8.entries.some((e) => e.id === id), id);
});

test('frame act: the stand is the book\'s, facing the altar; the words short, no quotation of its own; no iron in its sounds', async () => {
  const s = FRAME_ACT.stand(); assert.deepEqual([s.x, s.z], S8.stand.frame.slice(0, 2)); assert.deepEqual(s.face, S8.mid);
  for (const lv of [1, 2, 3]) assert.match(FRAME_ACT.walkLine({ lv }), /^המלבן/);
  for (const [k, t] of Object.entries(FLINES)) { assert.ok(t.replace(/\(המחשה\)/, '').trim().split(/\s+/).length <= 6, k + ': ' + t); assert.doesNotMatch(t, /["״]/, k); }
  // (b131 look round: the whole frame's beat low and oblique from the stand's side, not from high above; the close shot low behind)
  const out = FK.EYE[0] < S8.altar[0] || FK.EYE[0] > S8.altar[2] || FK.EYE[2] < S8.altar[1] || FK.EYE[2] > S8.altar[3];
  assert.ok(out && FK.EYE[1] > S8.floor + 8 && FK.EYE[1] < S8.floor + 16, 'the whole frame from outside it, low and oblique');
  assert.ok(FK.NEAR[0] < FK.NEAR[1], 'the close shot lower than it is far back');
  const src = (await import('node:fs')).readFileSync(new URL('../src/game/h131/frame.js', import.meta.url), 'utf8');
  assert.doesNotMatch(src, /\.play\('(strike|chisel|tool|wedge|clang|anvil)'/, 'no iron sound'); assert.doesNotMatch(src, /item: '(hammer|pick|saw|chisel)'/, 'no iron tool in a hand');
  // (the peg is knocked loose with the wooden mallet: the swing's role, and the mallet in his hand)
  for (const m of src.matchAll(/'hammer'[^)]*\)/g)) assert.match(m[0], /item: 'mallet'/, 'a swing is the wooden mallet\'s');
});
