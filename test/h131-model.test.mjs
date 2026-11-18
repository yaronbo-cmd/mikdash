// build 131 — stage 08's core model (src/game/h131/model.js): the plan (the pit and the frame free between them, each in order; the
// pour after both; the finale after the pour), the save's round trip with a work's own blob (a reload in the middle of a work), the loss
// table of the spec (never below zero), the one grading, an old save, and the pack's wiring in the game.
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PLAN, KINDS, NEEDS, LOSS, lossPts, applyLoss, grade, createH131, freshH131, fromOld, NEXT_STAGE, LINES } from '../src/game/h131/model.js';

test('the plan: ten works of four kinds, the pit and the frame free, the pour after both, the finale last', () => {
  assert.deepEqual(PLAN.map((m) => m.id), ['pit1', 'pit2', 'pit3', 'frame1', 'frame2', 'frame3', 'pour1', 'pour2', 'pour3', 'finale']);
  assert.deepEqual([...KINDS], ['pit', 'frame', 'pour', 'finale']);
  const M = createH131(null);
  assert.deepEqual(M.open().map((m) => m.id), ['pit1', 'frame1']);
  assert.equal(M.pick('pour1'), null); assert.equal(M.pick('pit2'), null);
  M.pick('frame1'); M.done({ stars: 3 }); M.pick('pit1'); M.done({ stars: 2 });
  assert.deepEqual(M.open().map((m) => m.id), ['pit2', 'frame2']);
  for (const id of ['pit2', 'pit3', 'frame2']) { M.pick(id); M.done({ stars: 2 }); }
  assert.ok(!M.canDo(PLAN.find((m) => m.id === 'pour1')), 'the pour waits for the frame');
  M.pick('frame3'); M.done({ stars: 2 });
  assert.deepEqual(M.open().map((m) => m.id), ['pour1']);
  for (const id of ['pour1', 'pour2', 'pour3']) { assert.ok(M.pick(id), id); M.done({ stars: 2 }); }
  assert.deepEqual(M.open().map((m) => m.id), ['finale']); assert.ok(!M.finished());
  M.pick('finale'); M.done({ stars: 3 }); assert.ok(M.finished()); assert.deepEqual(M.count(), [10, 10]);
  for (const [id, L] of Object.entries(NEEDS)) for (const n of L) assert.ok(PLAN.findIndex((m) => m.id === n) < PLAN.findIndex((m) => m.id === id));
});

test('the save: a work\'s own blob kept while it is open, cleared when it ends; the round trip; damage marks stay', () => {
  const M = createH131(null);
  M.pick('pit1'); M.keep('pit', { step: 3, out: [1] });
  const st = JSON.parse(JSON.stringify(M.st));
  const M2 = createH131(st);
  assert.equal(M2.mission().id, 'pit1'); assert.deepEqual(M2.workOf('pit'), { step: 3, out: [1] }); assert.equal(M2.workOf('frame'), null);
  assert.equal(M2.mark('pit.chip', 'pit1', [3, -1]), 20); assert.equal(M2.mark('nothing', 'pit1'), 0);
  M2.done({ stars: 1, pts: 10 });
  assert.equal(M2.workOf('pit'), null); assert.equal(M2.marksOf('pit.chip').length, 1);
  const M3 = createH131(JSON.parse(JSON.stringify(M2.st)));
  assert.deepEqual(M3.marksOf().map((q) => [q.f, q.work, q.at]), [['pit.chip', 'pit1', [3, -1]]]);
  assert.ok(M3.isDone('pit1')); assert.equal(M3.st.res.pit1.pts, 10);
  // an older save without a part's object, or with a stale current work, is mended
  const old = freshH131(); delete old.pour; old.cur = 'nowhere';
  const M4 = createH131(old); assert.equal(M4.mission(), null); assert.deepEqual(M4.st.pour, { work: null, sections: {}, prep: 0 });
});

test('the loss table of the spec: −20, −20, −20, −20, −40; never below zero; the one grading 10 / 20 / 40', () => {
  assert.deepEqual(Object.keys(LOSS), ['pit.chip', 'frame.crack', 'pour.hollow', 'pour.spill', 'pour.reed']);
  assert.deepEqual(Object.keys(LOSS).map(lossPts), [20, 20, 20, 20, 40]);
  for (const [, [label]] of Object.entries(LOSS)) assert.ok(/[֐-׿]/.test(label));
  assert.equal(applyLoss(30, 40), 0); assert.equal(applyLoss(100, 20), 80);
  assert.equal(grade(0, true), 40); assert.equal(grade(0, false), 20); assert.equal(grade(1, true), 10);
});

test('an old save whose old stage 08 was done: built by the crews; the lines; the next stage as the spec names it', () => {
  assert.equal(fromOld(true).crews, 1); assert.equal(fromOld(false).crews, 0);
  assert.ok(createH131(fromOld(true)).finished());
  assert.equal(NEXT_STAGE, 'הסובב וחוט הסיקרא');   // ── h132 ── (build 132: stage 09 follows stage 08; its brief: the end card of stage 08 names it) ── /h132 ──
  const spec = readFileSync(new URL('../docs/specs/shlav-08-he.md', import.meta.url), 'utf8');
  for (const k of ['betula']) assert.ok(spec.includes(LINES[k]), k);
  for (const q of ['חופרין למטה מהבתולה', 'אטום כמין עמוד ואין עושין בו חלל כלל', 'שהברזל נברא לקצר ימיו של אדם, והמזבח נברא להאריך', 'כדי שתחגור בה צפורן', 'דפוס מרובע עשוי מארבע קרשים, וכל אחת ארוכה ל"ב']) assert.ok(spec.includes(q) && Object.values(LINES).some((l) => l.includes(q)), q);
  for (const l of Object.values(LINES)) assert.ok(!/יהוה|אדני/.test(l));
});

test('the game: stage 08 is a pack after stage 07, its page flags and kinds, its rest, the old stage\'s card out', () => {
  const src = readFileSync(new URL('../src/game/index.js', import.meta.url), 'utf8');
  assert.match(src, /import \{ makePack08, migrate08 \} from '\.\/h131\/pack\.js'/);
  assert.match(src, /const H131_ONLY = \['pit', 'frame', 'pour', 'finale'\]\.includes\(H9_ONLY\)/);
  assert.match(src, /__H131_FULL/); assert.match(src, /stage=8/);
  assert.match(src, /function h31Begin\(\) \{\n    if \(!H109_ON \|\| !S\.isDone\(G, 'lishka'\) \|\| S\.isDone\(G, 'yesod'\)\) return false;/);
  assert.match(src, /else \{ h9Quiet = true; setTimeout\(\(\) => h31Begin\(\), 1600\); \}/);
  assert.match(src, /S\.isDone\(G, 'lishka'\) && !S\.isDone\(G, 'yesod'\)\) setTimeout\(\(\) => \{ h20Rest\(\); h28Rest\(\); h29Rest\(\); if \(!h31Begin\(\)\)/);
  assert.match(src, /if \(h31Begin\(\)\) return;/);
  // the kinds are no other stage's
  const kinds = [...src.matchAll(/const H\w+_ONLY = \[([^\]]*)\]/g)].filter((m) => !/H131/.test(m[0])).flatMap((m) => m[1].match(/'(\w+)'/g) || []);
  for (const k of ['pit', 'frame', 'pour', 'finale']) assert.ok(!kinds.includes(`'${k}'`), k);
});

test('stage 08: the end chain counts the stones he raised from the pit, not the old stage\'s', async () => {
  const { stonesOf } = await import('../src/game/h131/model.js');
  assert.equal(stonesOf({ done: [] }), 0);
  assert.equal(stonesOf({ done: ['pit1', 'pit2', 'pit3', 'frame1'] }), 5);
  assert.equal(stonesOf(null), 0);
});

test('the pour\'s marks: their place as [x, z] (the finale reads it so), a save that kept {x, z, r} is read the same', async () => {
  const st = freshH131(); st.marks.push({ f: 'pour.hollow', work: 'pour2', at: { x: -40.5, z: -8.25, r: 1.3 }, n: 0 }, { f: 'frame.crack', work: 'frame2', at: null, n: 2 });
  const M = createH131(st), h = M.marksOf('pour.hollow')[0];
  assert.deepEqual(h.at, [-40.5, -8.25]); assert.equal(h.n, 13); assert.equal(M.marksOf('frame.crack')[0].n, 2);
  const src = readFileSync(new URL('../src/game/h131/pour.js', import.meta.url), 'utf8');
  assert.match(src, /Mo\.mark\(flag, m\.id, \[\+atM\.x\.toFixed\(2\), \+atM\.z\.toFixed\(2\)\]/, 'the pour marks its place as [x, z]');
});

test('the works\' order as the spec: the pit (part 1) and the frame (part 2) free between them, the compass naming the pit first', async () => {
  assert.deepEqual(PLAN.slice(0, 6).map((m) => m.id), ['pit1', 'pit2', 'pit3', 'frame1', 'frame2', 'frame3']);
  const M = createH131(freshH131()); assert.deepEqual(M.open().map((m) => m.id), ['pit1', 'frame1']);
  const { makePack08 } = await import('../src/game/h131/pack.js'); assert.equal(makePack08().byPlan, true);
  const dir = readFileSync(new URL('../src/game/h109/director.js', import.meta.url), 'utf8');
  assert.match(dir, /if \(planOnly && PK\.byPlan\)/); assert.match(dir, /PK\.byPlan && !a\.q\.m\.free && !b\.q\.m\.free \? \(a\.q\.m\.n \| 0\) - \(b\.q\.m\.n \| 0\)/);
});
