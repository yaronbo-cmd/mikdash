// build 132, lane A: work 3 "שליפת התבנית" — the pure rules (src/game/h132/strip-model.js) against the spec (docs/specs/shlav-09-he.md,
// עבודה 3): the dependency list 1–6 exactly, the tap test (free wobbles, loaded creaks; level 3 a creak whose pitch rises with the parts
// still resting on it), every row of the score table, both damages, the wedge and the one-amah slide west, the three levels.
import test from 'node:test';
import assert from 'node:assert/strict';
import { SK, PARTS, fresh, load, save, deps, resting, isFree, tap, pull, slide, pitchOf, done, result, maxPts } from '../src/game/h132/strip-model.js';
import { stage } from '../src/game/h132/model.js';

const GOOD2 = ['brace:N', 'brace:S', 'brace:E', 'brace:W', 'belt:E', 'belt:W', 'belt:N', 'belt:S', 'wall:N', 'wall:S', 'wall:E', 'wall:W'];

test('the parts of each level: 1 the four walls; 2 all twelve; 3 the twelve and the wedge (and the core\'s stage() agrees)', () => {
  assert.equal(PARTS[1].length, 4); assert.equal(PARTS[2].length, 12); assert.equal(PARTS[3].length, 13);
  for (const lv of [1, 2, 3]) assert.deepEqual([...PARTS[lv]].sort(), [...stage('strip', lv, null).parts].sort(), 'level ' + lv);
  assert.ok(PARTS[3].includes('wedge')); assert.ok(!PARTS[2].includes('wedge'));
});

test('the dependency list, exactly as the spec\'s 1–6', () => {
  const S = fresh(2), S3 = fresh(3);
  for (const k of ['N', 'S', 'E', 'W']) assert.deepEqual(deps(S, 'brace:' + k), { hard: [], soft: [] }, '1: a brace is always free');
  assert.deepEqual(deps(S, 'belt:E').hard, ['brace:E']); assert.deepEqual(deps(S, 'belt:W').hard, ['brace:W']);
  assert.deepEqual(deps(S, 'belt:N').hard.sort(), ['belt:E', 'belt:W', 'brace:N']); assert.deepEqual(deps(S, 'belt:S').hard.sort(), ['belt:E', 'belt:W', 'brace:S']);
  assert.deepEqual(deps(S, 'wall:N').hard, ['belt:N']); assert.deepEqual(deps(S, 'wall:S').hard, ['belt:S']);
  assert.deepEqual(deps(S, 'wall:E'), { hard: ['belt:E'], soft: ['wall:N', 'wall:S'] }); assert.deepEqual(deps(S, 'wall:W'), { hard: ['belt:W'], soft: ['wall:N', 'wall:S'] });
  assert.deepEqual(deps(S3, 'wedge').hard, ['belt:S'], '6: the wedge is free once the south belt is gone');
  assert.deepEqual(deps(S3, 'wall:S'), { hard: ['belt:S', 'wedge'], soft: [], slide: true }, '6: the south wall needs its belt, the wedge and the slide');
  // the spec's sample order is clean at level 2
  for (const p of GOOD2) { assert.ok(isFree(S, p), p + ' free in the sample order'); assert.equal(pull(S, p).kind, p.startsWith('wall:') ? 'wall' : 'free'); }
  assert.ok(done(S));
});

test('the tap: a test only — free wobbles, loaded creaks; it never moves or costs anything; the first is the free trial', () => {
  const S = fresh(2);
  const t0 = tap(S, 'brace:N'); assert.equal(t0.sound, 'wobble'); assert.equal(t0.n, 0); assert.equal(t0.first, 1);
  const t1 = tap(S, 'belt:N'); assert.equal(t1.sound, 'creak'); assert.equal(t1.n, 3); assert.equal(t1.first, 0);
  assert.equal(tap(S, 'wall:E').sound, 'creak'); assert.equal(tap(S, 'wall:E').n, 3, 'its belt and the two tongue walls');
  assert.equal(S.pts, 0); assert.equal(S.breaks, 0); assert.equal(S.gone.length, 0);
});

test('level 3: the tap only creaks, its pitch rising with the number of parts still resting on it', () => {
  const S = fresh(3);
  const a = tap(S, 'brace:N'), b = tap(S, 'belt:E'), c = tap(S, 'belt:N'), d = tap(S, 'wall:S');
  for (const t of [a, b, c, d]) assert.equal(t.sound, 'creak');
  assert.deepEqual([a.n, b.n, c.n, d.n], [0, 1, 3, 3], 'wall:S: its belt, the wedge, the slide');
  assert.ok(a.pitch < b.pitch && b.pitch < c.pitch); assert.equal(c.pitch, d.pitch);
  assert.equal(pitchOf(0), SK.PITCH.base); assert.equal(pitchOf(2) - pitchOf(1), SK.PITCH.step);
  pull(S, 'brace:S'); assert.equal(tap(S, 'belt:S').n, 2, 'one gone: lower');
});

test('the score rows: a free brace, belt or wedge 20; a wall that falls free 40; a loaded part 0 and the streak broken', () => {
  assert.deepEqual(SK.PTS, { part: 20, slide: 20, wall: 40, loaded: 0, torn: -20, patch: -20 });
  const S = fresh(2); S.streak = 3;
  let r = pull(S, 'belt:E'); assert.deepEqual([r.out, r.kind, r.pts], [0, 'loaded', 0]); assert.equal(S.streak, 0); assert.equal(S.breaks, 1); assert.ok(S.left['belt:E'], 'it did not move');
  r = pull(S, 'brace:E'); assert.deepEqual([r.out, r.kind, r.pts], [1, 'free', 20]);
  r = pull(S, 'wall:N'); assert.deepEqual([r.out, r.kind], [0, 'loaded'], 'a wall whose belt is still on does not move');
  assert.equal(S.dmg, 0, 'no damage for a loaded pull');
  for (const p of ['brace:N', 'brace:S', 'brace:W', 'belt:E', 'belt:W', 'belt:N', 'belt:S']) pull(S, p);
  r = pull(S, 'wall:N'); assert.deepEqual([r.out, r.kind, r.pts], [1, 'wall', 40]);
  r = pull(S, 'wall:S'); assert.equal(r.pts, 40); pull(S, 'wall:E'); pull(S, 'wall:W');
  const R = result(S); assert.equal(R.pts, 8 * 20 + 4 * 40); assert.equal(R.perfect, false, 'the streak was broken twice'); assert.equal(R.flags.breaks, 2);
});

test('damage: an east or west wall before north and south tears a piece of the corner (−20, kept); the wall comes out', () => {
  const S = fresh(1);
  let r = pull(S, 'wall:E'); assert.deepEqual([r.out, r.kind, r.pts, r.corner], [1, 'torn', -20, 'NE']);
  assert.equal(S.dmg, 1); assert.deepEqual(S.torn, ['NE']);
  pull(S, 'wall:N');
  r = pull(S, 'wall:W'); assert.deepEqual([r.kind, r.corner], ['torn', 'SW'], 'north gone: the south corner');
  pull(S, 'wall:S'); assert.ok(done(S));
  const R = result(S); assert.equal(R.flags['strip.torn'], 2); assert.equal(R.pts, 40);
  assert.deepEqual(load(save(S, 'strip1')).torn, ['NE', 'SW']);
});

test('level 1 played right: north and south first, then east and west → 160, perfect', () => {
  const S = fresh(1);
  for (const p of ['wall:N', 'wall:S', 'wall:W', 'wall:E']) assert.equal(pull(S, p).kind, 'wall');
  const R = result(S); assert.equal(R.pts, 160); assert.equal(R.max, 160); assert.equal(R.stars, 3); assert.equal(R.perfect, true);
});

test('level 3: the wedge (after the south belt), the slide one amah west (20), then the stuck wall falls (40)', () => {
  const S = fresh(3);
  assert.equal(pull(S, 'wedge').kind, 'loaded', 'the wedge waits for the south belt');
  for (const p of ['brace:N', 'brace:S', 'brace:E', 'brace:W', 'belt:E', 'belt:W', 'belt:N']) pull(S, p);
  assert.equal(slide(S).ok, false, 'no slide while the belt and the wedge are in');
  const bk = S.breaks;
  pull(S, 'belt:S'); assert.equal(pull(S, 'wedge').kind, 'free');
  assert.equal(SK.SLIDE, 1);
  assert.deepEqual(slide(S), { ok: true, pts: 20 }); assert.equal(slide(S).ok, false, 'once');
  pull(S, 'wall:N'); assert.equal(pull(S, 'wall:S').kind, 'wall');
  pull(S, 'wall:E'); pull(S, 'wall:W'); assert.ok(done(S));
  const R = result(S); assert.equal(R.max, 9 * 20 + 20 + 4 * 40); assert.equal(R.pts, R.max); assert.equal(bk, 2, 'the early wedge and the early slide broke the streak'); assert.equal(S.breaks, bk);
  // a clean level 3 is perfect
  const P = fresh(3);
  for (const p of ['brace:N', 'brace:S', 'brace:E', 'brace:W', 'belt:E', 'belt:W', 'belt:N', 'belt:S', 'wedge']) assert.notEqual(pull(P, p).kind, 'loaded', p);
  slide(P); for (const p of ['wall:N', 'wall:S', 'wall:E', 'wall:W']) pull(P, p);
  assert.equal(result(P).perfect, true); assert.equal(result(P).pts, 360); assert.equal(maxPts(3), 360);
});

test('level 3: the stuck wall pulled out without the slide — the first time it shakes and creaks (0), the second it tears a patch (−20)', () => {
  const S = fresh(3);
  for (const p of ['brace:N', 'brace:S', 'brace:E', 'brace:W', 'belt:E', 'belt:W', 'belt:N', 'belt:S', 'wedge']) pull(S, p);
  let r = pull(S, 'wall:S'); assert.deepEqual([r.out, r.kind, r.pts], [0, 'shake', 0]); assert.equal(S.dmg, 0); assert.ok(S.left['wall:S']);
  r = pull(S, 'wall:S'); assert.deepEqual([r.out, r.kind, r.pts], [1, 'patch', -20]); assert.equal(S.dmg, 1); assert.equal(S.patch, 1);
  assert.equal(result(S).flags['strip.patch'], 1);
  // the stuck wall with its wedge still in: loaded (not a "first time")
  const T = fresh(3); for (const p of ['brace:S', 'brace:E', 'brace:W', 'belt:E', 'belt:W', 'brace:N', 'belt:S']) pull(T, p);
  assert.equal(pull(T, 'wall:S').kind, 'loaded'); assert.equal(T.stuckN, 0);
});

test('levels 2 and 3 max, never below zero', () => {
  assert.equal(maxPts(1), 160); assert.equal(maxPts(2), 320); assert.equal(maxPts(3), 360);
  const S = fresh(1); pull(S, 'wall:E'); pull(S, 'wall:W'); assert.equal(result(S).pts, 0);
  assert.equal(resting(S, 'wall:N'), 0);
});
