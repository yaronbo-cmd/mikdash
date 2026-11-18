// build 132 — stage 09's core model (src/game/h132/model.js): the plan, the stage's flow (one table), the save, the flaw registry and
// the west wall's slots exactly per the spec's table, the results per work, and stage(kind, lv, save) — the world each work begins from.
import test from 'node:test';
import assert from 'node:assert/strict';
import { PLAN, KINDS, NEEDS, STAGE_FLOW, LOSS, lossPts, applyLoss, starsOf, qOf, grade, freshH132, createH132, fromOld, stage, westSlots, blockOf, blockAfter, WORDS, NEXT_STAGE } from '../src/game/h132/model.js';
import { BOOK } from '../src/game/world/grid.js';

const S9 = BOOK.s09;

test('plan: four kinds, three levels each, the ids form1..sikra3; the flow is one table, level 2 of each kind in order', () => {
  assert.deepEqual([...KINDS], ['form', 'fill', 'strip', 'sikra']);
  assert.deepEqual(PLAN.map((m) => m.id), ['form1', 'form2', 'form3', 'fill1', 'fill2', 'fill3', 'strip1', 'strip2', 'strip3', 'sikra1', 'sikra2', 'sikra3']);
  for (const m of PLAN) { assert.equal(m.id, m.k + m.lv); assert.ok(Object.isFrozen(m)); }
  assert.deepEqual([...STAGE_FLOW], ['form2', 'fill2', 'strip2', 'sikra2']);
  assert.deepEqual({ ...NEEDS }, { form: [], fill: ['form'], strip: ['form', 'fill'], sikra: ['form', 'fill', 'strip'] });
  assert.deepEqual({ ...WORDS }, { form: 'נסגר!', fill: 'גוש שלם!', strip: 'נחשף!', sikra: 'הקפה אחת!', quick: 'מושלם!' });
  assert.equal(NEXT_STAGE, 'גוף המזבח');
});

test('the stage: only the flow\'s next is open; it ends after the flow; levels 1 and 3 never open in the walk', () => {
  const M = createH132(null);
  const seen = [];
  while (!M.finished()) { const O = M.open(); assert.equal(O.length, 1); seen.push(O[0].id); assert.ok(M.pick(O[0].id)); M.done({ stars: 3, pts: 40, q: 1 }); }
  assert.deepEqual(seen, [...STAGE_FLOW]);
  assert.deepEqual(M.count(), [4, 4]); assert.equal(M.progress(), 1);
  assert.equal(M.open().length, 0);
  assert.equal(M.resultOf('fill2').pts, 40); assert.equal(M.st.plays.fill2, 1);
  // off the flow: a level 1 or 3 is not offered in the walk, but can be picked (a link, the station) once its kind's flow-before is done
  const N = createH132(null);
  assert.equal(N.pick('fill1'), null); assert.equal(N.pick('fill2'), null);
  assert.ok(N.pick('form3')); assert.equal(N.mission().id, 'form3');
});

test('autoTo: a work link stands the flow before it as the crews\' and opens that work; a kind\'s page plays levels 1, 2, 3', () => {
  for (const m of PLAN) {
    const M = createH132(null);
    const got = M.autoTo((x) => x.id === m.id);
    assert.equal(got && got.id, m.id, m.id);
    for (const id of STAGE_FLOW) { const f = PLAN.find((x) => x.id === id); if (KINDS.indexOf(f.k) < KINDS.indexOf(m.k)) assert.ok(M.isDone(id), m.id + ' needs ' + id); }
    assert.ok(!M.isDone(m.id));
    assert.equal(M.flaws().length, 0);   // (the crews' works leave no flaw)
  }
  for (const k of KINDS) {
    const M = createH132(null), seen = [];
    for (let g = 0; g < 5; g++) { const m = M.autoTo((x) => x.k === k); if (!m) break; seen.push(m.id); M.done({ stars: 2 }); }
    assert.deepEqual(seen, [k + 1, k + 2, k + 3], k);
  }
});

test('the save: fresh, filled on load, an unknown cur dropped; the old stage done → the crews\'', () => {
  const F = freshH132();
  assert.deepEqual(Object.keys(F).sort(), ['best', 'crews', 'cur', 'done', 'fill', 'film', 'flaws', 'form', 'i', 'intro', 'plays', 'res', 'sikra', 'strip', 'v'].sort());
  const M = createH132({ v: 1, done: ['form2'], cur: 'nope9' });
  assert.equal(M.st.cur, null); assert.ok(Array.isArray(M.st.flaws)); assert.deepEqual(M.st.fill, { work: null });
  M.pick('fill2'); M.keep('fill', { layer: 2 }); assert.deepEqual(M.workOf('fill'), { layer: 2 }); M.done({ stars: 2 }); assert.equal(M.workOf('fill'), null);
  assert.equal(fromOld(true).crews, 1); assert.equal(fromOld(false).crews, 0);
  assert.ok(createH132(fromOld(true)).finished());
});

test('the loss table: −20 for every damage of the spec\'s table, 0 for the marks that only stay; never below zero; the grades', () => {
  const D20 = ['form.crack', 'fill.bulge', 'fill.nest', 'fill.dent', 'strip.torn', 'strip.patch', 'sikra.wavy', 'sikra.gap', 'sikra.drip', 'sikra.blot', 'sikra.blot2', 'sikra.smear'];
  const D0 = ['fill.collapse', 'fill.uneven', 'sikra.seam', 'sikra.pink', 'sikra.pale'];
  for (const f of D20) assert.equal(lossPts(f), 20, f);
  for (const f of D0) assert.equal(lossPts(f), 0, f);
  assert.deepEqual(Object.keys(LOSS).sort(), [...D20, ...D0].sort());
  assert.equal(applyLoss(10, 20), 0); assert.equal(applyLoss(50, 20), 30);
  assert.equal(grade(0, true), 40); assert.equal(grade(0, false), 20); assert.equal(grade(1, true), 10);
  assert.equal(qOf(40), 1); assert.equal(qOf(20), 0.75); assert.equal(qOf(10), 0.5);
  assert.equal(starsOf(1), 3); assert.equal(starsOf(0.75), 2); assert.equal(starsOf(0.5), 1);
});

test('the flaw registry: kept with its work and level; points returned; the world keeps every one', () => {
  const M = createH132(null); M.autoTo((m) => m.id === 'fill2');
  assert.equal(M.flaw('fill.bulge', { wall: 'N' }), 20); assert.equal(M.flaw('fill.uneven', { zone: 'C' }), 0); assert.equal(M.flaw('nope'), 0);
  assert.equal(M.flaws().length, 2); assert.deepEqual(M.flaws('fill.bulge')[0], { f: 'fill.bulge', work: 'fill2', lv: 2, n: 0, at: null, wall: 'N', zone: null });
  M.clearFlaws('fill2'); assert.equal(M.flaws().length, 0);
});

test('the west wall\'s slots exactly per the spec\'s table (2.5; 5, 7, 9, 11; 14, 16, 18, 20; 24; 27.8 from the NW corner); none: the rough patch at 15', () => {
  const x = S9.block[0], z0 = S9.block[1], at = (d) => [x, +(z0 + d).toFixed(3)];
  assert.deepEqual(westSlots([]).map((s) => [s.f, s.slot, s.d, s.at, s.y]), [['rough', 'rough', 15, [-53, -3.5], 21]]);
  const L = [
    { f: 'fill.bulge' }, { f: 'fill.nest' }, { f: 'fill.bulge' }, { f: 'strip.torn' }, { f: 'fill.nest' }, { f: 'fill.bulge' }, { f: 'fill.bulge' }, { f: 'fill.bulge' },
    { f: 'fill.nest' }, { f: 'fill.nest' }, { f: 'fill.nest' }, { f: 'strip.patch' }, { f: 'strip.torn' }, { f: 'strip.torn' },
    { f: 'form.crack' }, { f: 'fill.dent' }, { f: 'fill.uneven' }, { f: 'sikra.gap' },
  ];
  const W = westSlots(L);
  assert.deepEqual(W.map((s) => s.slot), ['tornA', 'bulge1', 'bulge2', 'bulge3', 'bulge4', 'nest1', 'nest2', 'nest3', 'nest4', 'patch', 'tornB']);
  assert.deepEqual(W.map((s) => s.d), [2.5, 5, 7, 9, 11, 14, 16, 18, 20, 24, 27.8]);
  for (const s of W) { assert.deepEqual(s.at, at(s.d)); assert.equal(s.y, 21); }
  // (one torn corner: only the first slot; a dent, a crack, an uneven layer never pass to the face)
  assert.deepEqual(westSlots([{ f: 'strip.torn' }, { f: 'form.crack' }, { f: 'fill.dent' }]).map((s) => s.slot), ['tornA']);
  assert.deepEqual(westSlots([{ f: 'fill.nest' }]).map((s) => [s.slot, s.d]), [['nest1', 14]]);
});

test('stage(kind, lv, save): every work begins from its own world, whatever was played; the levels differ', () => {
  const S = freshH132();
  assert.equal(stage('form', 2, S).block, 'formLying'); assert.equal(stage('fill', 2, S).block, 'formUp'); assert.equal(stage('strip', 2, S).block, 'filled'); assert.equal(stage('sikra', 2, S).block, 'bare');
  assert.deepEqual(stage('form', 1, S).walls, { E: 'up', W: 'up', N: 'lie', S: 'lie' });
  assert.deepEqual(stage('form', 2, S).walls, { E: 'lie', W: 'lie', N: 'lie', S: 'lie' });
  assert.equal(stage('form', 3, S).wind, true); assert.equal(stage('form', 2, S).wind, false);
  assert.equal(stage('fill', 1, S).order, 'fixed'); assert.equal(stage('fill', 2, S).order, 'mixed'); assert.equal(stage('fill', 3, S).caravan, true); assert.equal(stage('fill', 2, S).caravan, false);
  assert.equal(stage('fill', 2, S).layers * stage('fill', 2, S).loadsPerLayer, 20);
  assert.equal(stage('strip', 1, S).parts.length, 4); assert.equal(stage('strip', 2, S).parts.length, 12); assert.equal(stage('strip', 3, S).parts.length, 13); assert.ok(stage('strip', 3, S).parts.includes('wedge'));
  assert.deepEqual(stage('sikra', 1, S).walls4, ['E']); assert.deepEqual(stage('sikra', 1, S).corners, ['SE', 'NE']); assert.equal(stage('sikra', 2, S).corners.length, 4); assert.equal(stage('sikra', 3, S).sun, true); assert.equal(stage('sikra', 2, S).sun, false);
  // the west wall read from the save (a link page with no flaws: the rough patch)
  assert.deepEqual(stage('sikra', 2, S).west.map((s) => s.slot), ['rough']);
  const M = createH132(null); M.autoTo((m) => m.id === 'strip2'); M.flaw('strip.torn'); M.done({ stars: 1 });
  assert.deepEqual(stage('sikra', 2, M.st).west.map((s) => s.slot), ['tornA']);
  // the block's state with no work open
  assert.equal(blockOf(freshH132()), 'site'); assert.equal(blockOf({ done: ['form1'] }), 'formUp'); assert.equal(blockOf({ done: ['form2', 'fill2', 'strip2', 'sikra2'] }), 'lined');
  assert.equal(blockAfter('strip'), 'bare');
  M.pick('sikra2'); assert.equal(M.block(), 'bare');
});
