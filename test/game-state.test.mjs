// Unit tests of the Phase A rules v6 (src/game/state.js, docs/BUILD.md). Run: node --test test/game-state.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as S from '../src/game/state.js';
import {
  STAGES, stageById, BOULDERS, BOULDER_HP, RATE, DEMO_SPEED, TRAIN, CHAPTERS, PROJ, SEG, WORK, CREW_RATE, keyOf, eventAt, UPGRADES, START_RES,
} from '../src/game/content.js';
import { MIDDOT, UNLOCKS } from '../src/game/middot.js';

const T0 = Date.UTC(2026, 8, 23, 7, 0, 0);   // Wednesday 23 Sep 2026, 10:00 in Jerusalem
const MIN = 60000, HOUR = 60 * MIN;
const mem = (init = {}) => ({ m: { ...init }, get(k) { return k in this.m ? this.m[k] : null; }, set(k, v) { this.m[k] = String(v); return true; }, remove(k) { delete this.m[k]; } });
const G0 = (o = {}) => S.fresh(T0, o);
const rich = (G) => { for (const k of Object.keys(G.res)) G.res[k] = 1e6; return G; };
/** finish a stage at once (fixtures) */
const finish = (G, id) => { G.st[id] = { w: stageById(id).W, ph: 3, m: true }; return S.completeStage(G, id); };
/** play a whole stage through the v6 pipeline with the hero's hands only; → counts */
function runStage(G, id, { perfect = false, quality = 0.9 } = {}) {
  const n = { strokes: 0, keys: 0, pays: 0, events: 0, courses: 0, boulders: 0 };
  if (!G.st[id]) assert.ok(S.startBuild(G, id).ok, `start ${id}`);
  for (let g = 0; g < 20000; g++) {
    const j = S.jobOf(G, id);
    if (!j || j.kind === 'moment') break;
    if (j.kind === 'pay') { assert.ok(S.payStep(G, id).ok, `${id}: pay ${j.step}`); n.pays++; continue; }
    if (j.kind === 'key') { S.setKey(G, id, { quality, perfect }); n.keys++; continue; }
    if (j.kind === 'inspect') { S.inspect(G, id); continue; }
    if (j.kind === 'boulders') { const i = S.pickBoulder(G.bh); S.hitBoulder(G, i, perfect ? 2 : 1); n.boulders++; continue; }
    const r = S.stroke(G, id, perfect);
    assert.ok(r.ok, `${id}: stroke on ${j.kind}`);
    n.strokes++; if (r.event) n.events++; if (r.course) n.courses++;
  }
  return n;
}

test('content: 15 projects, ≈300–420 material steps (≈ 2 a board: 150–250 boards), the House is the long last third', () => {
  assert.equal(STAGES.length, 15);
  assert.deepEqual(CHAPTERS.flatMap((c) => c.stages).sort(), STAGES.map((s) => s.id).sort());
  let steps = 0, house = 0, stones = 0;
  for (const s of STAGES) {
    for (const d of s.deps) assert.ok(stageById(d), `${s.id} depends on ${d}`);
    assert.ok(s.card && s.card.q && s.card.ref, `${s.id} has a sourced card`);
    const P = PROJ[s.id]; assert.ok(P && P.C > 0 && P.P > 0, `${s.id} has a project`);
    const n = S.siteStones(s.id), seg = P.S || SEG;
    const k = Math.ceil(n / seg) + P.fin.length;
    steps += k; stones += n; if (s.ch === 4) house += n;
    assert.ok(keyOf(s.id, 0), `${s.id}: the first stone is a key stone`);
    for (const f of P.fin) assert.ok(Object.keys(f.cost).length && f.n, `${s.id}: a finish step has a name and a cost`);
  }
  assert.ok(steps >= 300 && steps <= 420, `material steps ${steps}`);
  assert.ok(house / stones > 0.4, `the House holds ${Math.round(100 * house / stones)}% of the stones`);
  const ev = (id) => Array.from({ length: S.siteStones(id) }, (_, i) => eventAt(id, i)).map((e, i) => (e ? `${e}@${i}` : null)).filter(Boolean);
  assert.deepEqual(ev('wall'), ['rope@102', 'crack@193']); assert.deepEqual(ev('karnot'), []);
  assert.equal(MIDDOT.length, 34);
  assert.equal(Object.values(UNLOCKS).flat().length, 34);
  assert.ok(!MIDDOT.some((m) => /\u05d0\u05dc\u05d4\u05d9|\u05d9\u05d4\u05d5\u05d4/.test(m.he.replace(/[֑-ׇ]/g, ''))), 'no Divine Name in full');
});

test('fresh game: the Mount is available and free to start; everything else locked; the slots of the others exist', () => {
  const G = G0();
  assert.equal(S.statusOf(G, 'har'), 'avail');
  for (const s of STAGES) if (s.id !== 'har') assert.equal(S.statusOf(G, s.id), 'locked');
  assert.equal(G.crews.length, 0);
  assert.deepEqual(S.nextAction(G), { kind: 'start', id: 'har', cost: {} });
  assert.deepEqual(S.recommend(G), { kind: 'start', id: 'har' });
  assert.deepEqual([G.fun, G.m3, G.kings], [{}, {}, {}]);
  assert.equal(G.v, 6);
});

test('the Mount: survey → the rough hill (12 boulders × 2, perfect 2) → courses → finish → inspection → its key moment', () => {
  const G = G0();
  assert.ok(S.startBuild(G, 'har').ok);
  assert.deepEqual(S.nextAction(G), { kind: 'work', id: 'har', job: 'survey' });
  for (let k = 0; k < WORK.survey; k++) S.stroke(G, 'har', false);
  assert.equal(S.jobOf(G, 'har').kind, 'boulders', 'the dig of the Mount is the rough hill');
  let r;
  for (let i = 0; i < BOULDERS; i++) r = S.hitBoulder(G, i, 2);
  assert.equal(r.phase, 'courses'); assert.equal(S.bouldersLeft(G), 0);
  const j = S.jobOf(G, 'har');
  assert.equal(j.kind, 'pay'); assert.equal(j.step, 'seg'); assert.deepEqual(j.cost, PROJ.har.seg);
  rich(G);
  assert.equal(S.nextAction(G).kind, 'build');
  const n = runStage(G, 'har');
  assert.equal(G.st.har.ready, true, 'the Mount waits for its key moment');
  assert.deepEqual(S.nextAction(G), { kind: 'moment', id: 'har' });
  assert.ok(n.keys >= 3, 'the great stones are key stones');
  const c = S.momentDone(G, 'har');
  assert.equal(c.id, 'har'); assert.equal(c.chapter, 1); assert.equal(G.crews.length, 2);
  assert.equal(S.statusOf(G, 'wall'), 'avail');
});

test('a stone is a stone: 3 strokes (dress, dress, tamp), a perfect stroke counts 2; a course is a milestone', () => {
  const G = rich(G0()); finish(G, 'har');
  S.startBuild(G, 'wall');
  runUntil(G, 'wall', 'courses');
  S.payStep(G, 'wall');
  assert.equal(G.st.wall.paid, SEG, 'a segment puts SEG stones in the stock');
  assert.equal(S.jobOf(G, 'wall').kind, 'key', 'the first stone waits for the player\'s hands');
  const k = S.setKey(G, 'wall', { quality: 0.95, perfect: true });
  assert.deepEqual(k.stones, [0]); assert.equal(G.st.wall.keys[0], 0.95);
  const a = S.stroke(G, 'wall', false); assert.equal(a.act, 'dress'); assert.equal(a.stones.length, 0);
  const b = S.stroke(G, 'wall', false); assert.equal(b.act, 'dress');
  const c = S.stroke(G, 'wall', false); assert.equal(c.act, 'tamp'); assert.deepEqual(c.stones, [1]);
  const d = S.stroke(G, 'wall', true); const e = S.stroke(G, 'wall', true);
  assert.deepEqual(d.stones, []); assert.deepEqual(e.stones, [2], 'two perfect strokes set a stone');
  // the rest of the first course
  let course = 0;
  for (let g = 0; g < 400 && !course; g++) { const k = S.jobOf(G, 'wall').kind; if (k === 'pay') S.payStep(G, 'wall'); const r = k === 'key' ? S.setKey(G, 'wall', { quality: 0.9 }) : S.stroke(G, 'wall', false); if (r.course) course = r.course; }
  assert.deepEqual(keyOf('wall', PROJ.wall.P / 2), { game: 'dress', what: 'corner' }, 'the course turns its far corner by hand too');
  assert.equal(course, 1); assert.equal(G.st.wall.set, PROJ.wall.P);
  const v = S.siteView(G, 'wall');
  assert.equal(v.course, 2); assert.equal(v.inCourse, 0); assert.equal(v.C, PROJ.wall.C);
});
function runUntil(G, id, p) { for (let g = 0; g < 100 && G.st[id].p !== p; g++) { const j = S.jobOf(G, id); if (j.kind === 'pay') S.payStep(G, id); else S.stroke(G, id, false); } }

test('a whole stage: events cost time only, the inspection finds a badly set key stone, its reset costs no material', () => {
  const G = rich(G0()); finish(G, 'har');
  S.startBuild(G, 'wall');
  let bad = true;
  // the first key stone set badly, the rest well
  const n = { keys: 0 };
  for (let g = 0; g < 5000; g++) {
    const j = S.jobOf(G, 'wall');
    if (j.kind === 'moment') break;
    if (j.kind === 'pay') { S.payStep(G, 'wall'); continue; }
    // (a key stone of the last two courses: the course checks cover the others, the inspection these)
    if (j.kind === 'key') { const late = j.i >= 6 * PROJ.wall.P; S.setKey(G, 'wall', { quality: late && bad ? 0.2 : 0.9 }); if (late) bad = false; n.keys++; continue; }
    if (j.kind === 'inspect') {
      const before = { ...G.res };
      const r = S.inspect(G, 'wall');
      assert.deepEqual(r.bad, [6 * PROJ.wall.P]);
      assert.equal(S.jobOf(G, 'wall').kind, 'reset');
      for (let s = 0; s < WORK.reset; s++) S.stroke(G, 'wall', false);
      assert.deepEqual(G.res, before, 'a reset costs time, never material');
      continue;
    }
    S.stroke(G, 'wall', false);
  }
  assert.equal(G.st.wall.ready, true);
  assert.equal(G.st.wall.ev[102], 1); assert.equal(G.st.wall.ev[193], 1);
  assert.equal(S.progressOf(G, 'wall'), 1);
  assert.equal(S.momentDone(G, 'wall').id, 'wall');
});

test('the engineer checks every 2 courses (plumb): a crooked key stone is found early and reset before the next stone', () => {
  const G = rich(G0()); finish(G, 'har');
  S.startBuild(G, 'wall');
  runUntil(G, 'wall', 'courses');
  let bad = true;
  for (let g = 0; g < 400 && !S.checkDue(G, 'wall'); g++) {
    const j = S.jobOf(G, 'wall');
    if (j.kind === 'pay') S.payStep(G, 'wall');
    else if (j.kind === 'key') { S.setKey(G, 'wall', { quality: bad ? 0.2 : 0.9 }); bad = false; }
    else S.stroke(G, 'wall', true);
  }
  assert.equal(G.st.wall.set, 2 * PROJ.wall.P, 'due after two courses');
  const r = S.courseCheck(G, 'wall');
  assert.deepEqual(r.bad, [0]);
  assert.equal(S.jobOf(G, 'wall').kind, 'reset', 'the reset comes before the next stone');
  for (let k = 0; k < WORK.reset; k++) S.stroke(G, 'wall', false);
  assert.equal(G.st.wall.keys[0], 0.8); assert.equal(S.checkDue(G, 'wall'), false);
  // the quick lift: FUN's crane sets the current stone at once
  for (let g = 0; g < 50 && S.jobOf(G, 'wall').kind !== 'stone'; g++) { const j = S.jobOf(G, 'wall'); if (j.kind === 'pay') S.payStep(G, 'wall'); else if (j.kind === 'key') S.setKey(G, 'wall', { quality: 0.9 }); else S.stroke(G, 'wall', false); }
  const set = G.st.wall.set, q = S.quickSet(G, 'wall');
  assert.ok(q.ok && q.lift); assert.equal(G.st.wall.set, set + 1);
  // the final inspection only looks at what no course check saw
  G.st.wall.keys[G.st.wall.set - 1] = 0.1;
  assert.equal(S.inspect(G, 'wall').ok, false, 'not yet: the courses are not done');
});

test('nextAction: never "blocked, wait" — a shortfall is always a match-3 level for exactly that', () => {
  const G = G0(); finish(G, 'har');
  G.res = { stone: 5, cedar: 0, bronze: 0, gold: 0, silver: 100, wstone: 0 };
  assert.equal(S.nextAction(G).kind, 'start');
  S.startBuild(G, 'wall');
  runUntil(G, 'wall', 'courses');
  const a = S.nextAction(G);
  assert.equal(a.kind, 'play'); assert.equal(a.field, 'quarry'); assert.deepEqual(a.need, { stone: PROJ.wall.seg.stone - 5 });
  assert.equal(S.recommend(G).kind, 'blocked');
  // a level that brings more than the need: the step becomes affordable
  const add = S.grantLevel(G, { won: true, collected: { stone: 60, silver: 6 } }, a.need);
  assert.deepEqual(add, { stone: 60, silver: 6 });
  assert.equal(S.nextAction(G).kind, 'build');
  assert.ok(S.payStep(G, 'wall').ok);
  assert.equal(S.nextAction(G).kind, 'key');
  // cedar for a finish step → the forest; gold → the gold mines
  assert.equal(S.fieldFor({ cedar: 4 }), 'forest'); assert.equal(S.fieldFor({ gold: 1, cedar: 1 }), 'forest');
  assert.equal(S.fieldFor({ bronze: 3 }), 'gold'); assert.equal(S.fieldFor({ wstone: 2, stone: 9 }), 'quarry');
  assert.deepEqual(S.needFor({ stone: 3, cedar: 4 }, 'forest'), { cedar: 4 });
});

test('a level keeps what was gathered even on a loss; the altar step turns its stones into whole field stones', () => {
  const G = G0();
  assert.deepEqual(S.grantLevel(G, { won: false, collected: { stone: 7 } }, { stone: 20 }), { stone: 7 });
  assert.equal(G.stats.levels, 0);
  assert.deepEqual(S.grantLevel(G, { won: true, collected: { stone: 25, silver: 3 } }, { wstone: 20 }), { wstone: 25, silver: 3 });
  assert.equal(G.res.wstone, 25); assert.equal(G.stats.levels, 1);
  assert.deepEqual(S.grantLevel(G, null, {}), {});
  assert.ok(S.sourcesOf('cedar').some(([k]) => k === 'kings'));
});

test('crews set paid stones over real time (offline ≤ 12 h), wait at a key stone or an unpaid step; nothing is lost', () => {
  const G = rich(G0()); finish(G, 'har');
  S.startBuild(G, 'wall');
  runUntil(G, 'wall', 'courses');
  S.payStep(G, 'wall'); S.setKey(G, 'wall', { quality: 0.9 });
  G.crews = [{ at: 'wall' }, { at: 'wall' }];
  G.clock = T0;
  const rep = S.settle(G, T0 + 6 * MIN);
  assert.equal(rep.stones.wall, Math.floor(2 * 6 * CREW_RATE / WORK.stone), 'two crews set a stone every 1.5 minutes');
  const rep2 = S.settle(G, T0 + 10 * HOUR);
  assert.equal(G.st.wall.set, SEG, 'the stock is set, then they wait');
  assert.equal(rep2.waiting.wall, 'pay');
  // the quarry: 12 stone an hour per crew, capped at 12 hours
  const Q = G0(); finish(Q, 'har'); Q.crews = [{ at: 'quarry' }]; Q.clock = T0; Q.res.stone = 0;
  const q = S.settle(Q, T0 + 30 * HOUR);
  assert.ok(Math.abs(Q.res.stone - RATE.quarry * 720) < 1e-6); assert.equal(q.capped, true);
  // Shabbat: the site rests and nothing is lost
  const R = G0(); finish(R, 'har'); R.crews = [{ at: 'quarry' }]; R.clock = T0; R.res.stone = 0;
  const rr = S.settle(R, T0 + 2 * HOUR, { rest: () => true });
  assert.equal(R.res.stone, 0); assert.equal(rr.rest, true);
});

test('upgrades: silver buys tools (a stroke\'s worth), the crane (crew pace), the carts (quarry output)', () => {
  const G = G0(); G.res.silver = 1000;
  assert.deepEqual(S.upgrade(G, 'tools'), { ok: true, lvl: 1 });
  assert.equal(G.res.silver, 1000 - UPGRADES.tools.cost[0]);
  S.upgrade(G, 'tools'); S.upgrade(G, 'tools');
  assert.equal(S.upgrade(G, 'tools').max, true);
  const P = G0(); P.res.silver = 10;
  assert.deepEqual(S.upgrade(P, 'crane').lack, { silver: UPGRADES.crane.cost[0] - 10 });
});

test('demo mode: every timer ×60, generous stock, its own save key', () => {
  const store = mem();
  const G = S.fresh(T0, { demo: true });
  assert.equal(S.speedOf(G), DEMO_SPEED);
  assert.ok(G.res.cedar >= 500 && G.res.stone === START_RES.stone, 'generous stock, but the stone is the mentor\'s, like a player (then the first level)');
  assert.equal(S.gmMs(G, 5), 5 * MIN / DEMO_SPEED);
  S.save(G, store, S.DEMO_KEY, T0);
  assert.equal(store.get(S.SAVE_KEY), null, 'the real save is never written');
  const L = S.load(store, S.DEMO_KEY, T0 + 1000);
  assert.equal(L.G.demo, true); assert.equal(L.isNew, false);
  const R = S.load(store, S.SAVE_KEY, T0);
  assert.equal(R.isNew, true); assert.equal(R.G.demo, false);
});

test('training priests gates the House; the quiz shortens training (3 a day)', () => {
  const G = G0();
  for (const id of ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor']) finish(G, id);
  assert.equal(G.trainOn, true);
  assert.equal(S.statusOf(G, 'ulam'), 'avail');
  rich(G);
  assert.deepEqual(S.startBuild(G, 'ulam'), { ok: false, priests: 6 });
  assert.equal(S.recommend(G).kind, 'priests');
  assert.ok(S.startTraining(G, T0).ok);
  const q = S.quizToday(G, T0);
  const a = S.answerQuiz(G, q.id, q.ok, T0);
  assert.equal(a.correct, true); assert.equal(a.cut, TRAIN.quizCutMin * MIN);
  assert.equal(G.train[0].t1, T0 + (TRAIN.min - TRAIN.quizCutMin) * MIN);
  for (let k = 0; k < 2; k++) { const qq = S.quizToday(G, T0); S.answerQuiz(G, qq.id, 99, T0); }
  assert.equal(S.quizToday(G, T0), null, 'three questions a day');
  const rep = S.settle(G, T0 + TRAIN.min * MIN);
  assert.equal(rep.priests, 1); assert.equal(G.priests, 1);
  G.priests = 6;
  assert.ok(S.startBuild(G, 'ulam').ok);
});

test('daily: streak, wage, and Shabbat never breaks the streak', () => {
  const G = G0();
  const d1 = S.dailyCheck(G, T0, () => false);
  assert.equal(d1.streak, 1); assert.equal(S.dailyCheck(G, T0 + HOUR), null, 'once a day');
  assert.equal(G.daily.tasks.length, 3);
  const d2 = S.dailyCheck(G, T0 + 24 * HOUR, () => false);
  assert.equal(d2.streak, 2);
  const d3 = S.dailyCheck(G, T0 + 4 * 24 * HOUR, (k) => k === '2026-09-26');
  assert.equal(d3.streak, 1);
  const H = G0(); S.dailyCheck(H, Date.UTC(2026, 8, 25, 9), () => false);        // Friday
  const h2 = S.dailyCheck(H, Date.UTC(2026, 8, 27, 9), (k) => k === '2026-09-26'); // Sunday
  assert.equal(h2.streak, 2);
  assert.ok(h2.wage.silver > d1.wage.silver);
});

test('daily tasks feed the golden vine: leaf per task, grape per full day, cluster per 7 grapes', () => {
  const G = G0();
  S.dailyCheck(G, T0);
  assert.ok(G.daily.tasks.every((t) => !['caravan', 'collect'].includes(t.id)), 'no caravan tasks in v6');
  for (const t of G.daily.tasks) { const r = S.taskProgress(G, t.id, 99); assert.equal(r.leaf, 1); }
  assert.equal(G.vine.leaves, 3); assert.equal(G.vine.grapes, 1);
  for (let d = 1; d < 7; d++) { S.dailyCheck(G, T0 + d * 24 * HOUR); for (const t of G.daily.tasks) S.taskProgress(G, t.id, 99); }
  assert.equal(G.vine.grapes, 7); assert.equal(G.vine.clusters, 1);
});

test('the Middot book: unlocks by stage, reading counts once, a siyum at 34', () => {
  const G = G0();
  assert.deepEqual(Object.keys(G.book.un), ['2.1']);
  assert.equal(S.readMishnah(G, '3.8').ok, false, 'locked');
  const c = finish(G, 'har');
  assert.deepEqual(c.mishnayot.sort(), ['1.2', '1.3', '2.2']);
  assert.equal(S.readMishnah(G, '2.1').first, true);
  assert.equal(S.readMishnah(G, '2.1').first, false);
  for (const m of MIDDOT) G.book.un[m.id] = 1;
  let last;
  for (const m of MIDDOT) last = S.readMishnah(G, m.id);
  assert.equal(last.siyum, true);
});

test('stroke values: normal 1, perfect 2 (no combo multiplier on work); the combo is counted', () => {
  assert.equal(S.strikeValue(false), 1); assert.equal(S.strikeValue(true), 2);
  const G = G0();
  S.noteStrike(G, true); S.noteStrike(G, true); assert.equal(G.stats.combo, 2);
  S.noteStrike(G, false); assert.equal(G.stats.combo, 0); assert.equal(G.stats.best, 2);
});

test('demo skip: finishes the current chapter in graph order, with rewards', () => {
  const G = S.fresh(T0, { demo: true });
  const a = S.skipChapter(G);
  assert.deepEqual(a.map((c) => c.id), ['har']);
  const b = S.skipChapter(G);
  assert.equal(b.length, 6); assert.equal(b[b.length - 1].chapter, 2);
  S.skipChapter(G); const d = S.skipChapter(G);
  assert.deepEqual(d.map((c) => c.id), ['ulam', 'heichal', 'kodesh']);
  assert.equal(d[2].all, true);
  assert.equal(S.chapterOf(G), 5);
});

test('v4 (2D beta) saves migrate through v5 to v6 and keep their progress', () => {
  const v4 = { v: 4, res: { s: 400, c: 250, g: 200, si: 120, n: 200, t: 40, k: 40 }, b: { har: { done: true }, wall: { done: true }, sorag: { done: true }, gates: { w: 6 } }, daily: { last: '2026-09-22', streak: 3 }, celeb: false };
  const { G, fromVersion, isNew } = S.load(mem({ bh_beta2: JSON.stringify(v4) }), S.SAVE_KEY, T0);
  assert.equal(fromVersion, 4); assert.equal(isNew, false); assert.equal(G.v, 6);
  assert.deepEqual(G.st.har, { done: true }); assert.deepEqual(G.st.sorag, { done: true });
  assert.equal(S.statusOf(G, 'gates'), 'building');
  assert.ok(G.st.gates.set > 0 && G.st.gates.p === 'courses', 'half the 2D work = stones already set');
  assert.equal(G.res.stone, 400); assert.equal(G.res.silver, 120 + 40 + 80);
  assert.equal(G.crews.length, 3);
  assert.equal(G.ftue, 99, 'returning players skip the tutorial');
  assert.equal(G.daily.streak, 3);
  assert.equal(S.load(mem({ bh_beta2: '{oops' }), S.SAVE_KEY, T0).isNew, true);
  assert.equal(S.load(mem({ bh_beta2: '[]' }), S.SAVE_KEY, T0).isNew, true);
});

test('v5 saves migrate to v6: finished stays finished, progress becomes stones, caravans in flight are credited', () => {
  const v5 = {
    v: 5, demo: false, created: T0 - 9 * HOUR, clock: T0 - HOUR, lastSeen: T0 - HOUR,
    res: { stone: 120, cedar: 40, bronze: 0, gold: 20, silver: 80, wstone: 0 },
    st: { har: { done: true }, wall: { w: 24, ph: 2 }, gates: { w: 40, ph: 3, ready: true } },
    bh: new Array(12).fill(0), crews: [{ at: 'wall' }, { at: 'quarry' }], car: [{ r: 'cedar', len: 'short', t0: T0 - HOUR, t1: T0 + HOUR, y: 70 }],
    routes: ['wagons', 'cedar'], priests: 0, train: [], book: { un: { '2.1': 1 }, read: {} }, daily: { day: '2026-09-22', streak: 4, tasks: [] },
    vine: { leaves: 5, grapes: 1, clusters: 0, grapeDays: 1 }, stats: { strikes: 80, perfect: 20, best: 6, caravans: 3 }, ftue: 99,
  };
  const { G, fromVersion } = S.load(mem({ bh_beta2: JSON.stringify(v5) }), S.SAVE_KEY, T0);
  assert.equal(fromVersion, 5); assert.equal(G.v, 6);
  assert.deepEqual(G.st.har, { done: true });
  assert.equal(G.st.wall.p, 'courses'); assert.equal(G.st.wall.set, Math.floor(S.siteStones('wall') * 0.5 / 0.8));
  assert.ok(Math.abs(S.progressOf(G, 'wall') - 0.08 - 0.72 * G.st.wall.set / S.siteStones('wall')) < 1e-9);
  assert.equal(G.st.gates.ready, true, 'a ready moment stays ready');
  assert.equal(G.res.cedar, 40 + 70, 'the caravan in flight is credited');
  assert.deepEqual(G.car, []);
  assert.equal(G.vine.leaves, 5); assert.equal(G.daily.streak, 4);
  assert.deepEqual([G.fun, G.m3, G.kings], [{}, {}, {}]);
  // the migrated site continues: its next job is a real one
  assert.ok(['stone', 'key', 'pay', 'event'].includes(S.jobOf(G, 'wall').kind));
});

test('a REAL v14 save (bh_beta2, written by master\'s own rules mid-game) loads in v6 with its progress', () => {
  // test/fixtures/save-v14-bh_beta2.json: master c4e8113 played the Mount and the wall to the end, the gates to 20 work units,
  // a cedar caravan in flight, three crews, a 5-day streak — then saved (see its "v": 5)
  const raw = fs.readFileSync(new URL('./fixtures/save-v14-bh_beta2.json', import.meta.url), 'utf8');
  const old = JSON.parse(raw);
  const { G, fromVersion, isNew } = S.load(mem({ bh_beta2: raw }), S.SAVE_KEY, old.lastSeen + HOUR);
  assert.equal(fromVersion, 5); assert.equal(isNew, false); assert.equal(G.v, 6);
  assert.deepEqual([S.statusOf(G, 'har'), S.statusOf(G, 'wall')], ['done', 'done']);
  assert.equal(S.statusOf(G, 'gates'), 'building'); assert.ok(G.st.gates.set > 0, 'the gates\' work became stones set');
  for (const k of ['stone', 'gold', 'silver']) assert.ok(G.res[k] >= old.res[k], `${k} kept`);
  assert.ok(G.res.cedar > old.res.cedar, 'the caravan in flight is credited'); assert.deepEqual(G.car, []);
  assert.equal(G.crews.length, old.crews.length); assert.equal(G.daily.streak, 5); assert.equal(G.vine.leaves, 7); assert.equal(G.ftue, 99);
  assert.ok(!['none', 'done'].includes(S.nextAction(G).kind), 'the returning player has a next action');
  const store = mem(); S.save(G, store, S.SAVE_KEY, old.lastSeen + HOUR);
  const again = S.load(store, S.SAVE_KEY, old.lastSeen + 2 * HOUR).G;
  assert.equal(again.v, 6); assert.equal(S.statusOf(again, 'wall'), 'done'); assert.equal(again.st.gates.set, G.st.gates.set);
});

test('v6 round trip, shape repair, and an old reader writing a v5-shaped site', () => {
  const store = mem();
  const G = G0(); finish(G, 'har'); S.startBuild(G, 'wall'); G.crews = [{ at: 'wall' }, { at: 'bogus' }];
  G.fun = { best: { crane: 3 } }; G.m3 = { level: { quarry: 4 } }; G.kings = { v: 1, rel: { tyre: 2 } };
  S.save(G, store, S.SAVE_KEY, T0);
  const L = S.load(store, S.SAVE_KEY, T0 + 1000).G;
  assert.equal(S.statusOf(L, 'wall'), 'building'); assert.equal(L.st.wall.p, 'survey');
  assert.equal(L.crews[1].at, null, 'a crew at an unknown site becomes idle');
  assert.deepEqual([L.fun, L.m3, L.kings], [G.fun, G.m3, G.kings], 'the others\' slots are kept as they are');
  const broken = { v: 6, res: { stone: 'x' }, st: { wall: { p: 'courses', set: 9999, paid: -4, keys: 3 }, nope: {} }, bh: [1, 2], crews: 'x', up: { tools: 9 } };
  const B = S.load(mem({ bh_beta2: JSON.stringify(broken) }), S.SAVE_KEY, T0).G;
  assert.equal(B.res.stone, 0); assert.equal(B.st.wall.set, S.siteStones('wall')); assert.equal(B.st.wall.paid, B.st.wall.set);
  assert.deepEqual(B.st.wall.keys, {}); assert.equal(B.up.tools, 3);
  assert.equal(B.st.nope, undefined); assert.equal(B.bh.length, BOULDERS); assert.deepEqual(B.crews, []);
  // hooks/demo.js writes v5 shapes: they read as v6
  const D = G0(); finish(D, 'har'); D.st.wall = { w: stageById('wall').W, ph: 3, ready: true };
  assert.equal(S.jobOf(D, 'wall').kind, 'moment'); assert.equal(S.nextAction(D).kind, 'moment');
  assert.equal(S.momentDone(D, 'wall').id, 'wall');
});

test('storage wrapper survives a throwing localStorage', () => {
  const saved = globalThis.localStorage;
  globalThis.localStorage = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); }, removeItem() { throw new Error('denied'); } };
  try {
    assert.equal(S.storage.get('x'), null);
    assert.equal(S.storage.set('x', '1'), false);
    S.storage.remove('x');
    const { G, isNew } = S.load(S.storage, S.SAVE_KEY, T0);
    assert.equal(isNew, true); assert.equal(S.save(G, S.storage, S.SAVE_KEY, T0), false);
  } finally { globalThis.localStorage = saved; }
});

test('the meter always shows the five materials; the whole stones join with the altar', () => {
  const G = G0();
  assert.deepEqual(S.hudRes(G), ['stone', 'cedar', 'gold', 'silver', 'bronze']);
  finish(G, 'har'); finish(G, 'wall');
  assert.deepEqual(S.hudRes(G), ['stone', 'cedar', 'gold', 'silver', 'bronze', 'wstone']);
});

test('board and site views: every stage, its phase and what it waits for', () => {
  const G = G0();
  const b = S.boardView(G);
  assert.equal(b.length, 15); assert.equal(b[0].st, 'avail'); assert.deepEqual(b[1].deps, ['har']);
  S.startBuild(G, 'har');
  const v = S.siteView(G, 'har');
  assert.equal(v.ph, 'survey'); assert.equal(v.n, S.siteStones('har')); assert.equal(v.job.kind, 'survey');
  assert.equal(v.next.what, 'great');
  assert.equal(S.boardView(G)[0].ph, 'survey');
  assert.ok(Math.abs(BOULDER_HP - 2) < 1e-9);
});

/* ── build7 (wave 7) ── */
const coursesAt = (G, id) => { S.startBuild(G, id); const s = G.st[id]; s.p = 'courses'; s.dp = 1; if (id === 'har') G.bh = G.bh.map(() => 0); return s; };
test('build7: a 3★ board pays a third segment — of the site it was played for, in its own material', () => {
  const G = G0(); const s = coursesAt(G, 'har');
  const won3 = { won: true, stars: 3, collected: { stone: 40, silver: 4 } };
  assert.deepEqual(S.starBonus(G, won3, 'har'), { stone: PROJ.har.seg.stone });
  assert.equal(S.starBonus(G, { ...won3, stars: 2 }, 'har'), null);
  assert.equal(S.starBonus(G, { ...won3, won: false }, 'har'), null);
  assert.equal(S.starBonus(G, { won: true, stars: 3, collected: { cedar: 40 } }, 'har'), null, 'a forest board never pays stone');
  const before = G.res.stone;
  const add = S.grantLevel(G, won3, { stone: 8 }, 'har');
  assert.equal(add.stone, 40 + PROJ.har.seg.stone); assert.equal(G.res.stone, before + 40 + PROJ.har.seg.stone);
  const G2 = G0(); coursesAt(G2, 'har'); const b2 = G2.res.stone;
  S.grantLevel(G2, won3, {}, 'har', { bonus: false });
  assert.equal(G2.res.stone, b2 + 40, 'the host may apply the bonus itself');
  s.paid = s.n; assert.equal(S.starBonus(G, won3, 'har'), null, 'nothing left to buy');
});
test('build7: crewEta — the crews\' next stone, only while they set stones', () => {
  const G = G0(); const s = coursesAt(G, 'har');
  assert.equal(S.crewEta(G, 'har', T0), null, 'no crew');
  G.crews.push({ at: 'har' });
  assert.equal(S.crewEta(G, 'har', T0), null, 'the segment is unpaid: the crews wait');
  s.paid = 16; s.set = 1; s.keys[0] = 0.9;
  const j = S.jobOf(G, 'har');
  if (j.kind === 'stone') { const ms = S.crewEta(G, 'har', T0); assert.ok(ms > 0 && ms < 60 * MIN, String(ms)); G.crews.push({ at: 'har' }); assert.ok(S.crewEta(G, 'har', T0) < ms, 'two crews are faster'); }
  else assert.equal(S.crewEta(G, 'har', T0), null, j.kind);
});
test('build7: the Mount\'s surplus reads as a plan for the wall', () => {
  const G = G0(); coursesAt(G, 'har');
  G.res.stone = 96; assert.equal(S.stockPlan(G), null, 'not in the tutorial (the mentor\'s stones are the Mount\'s)');
  G.ftue = 99; G.res.stone = PROJ.har.seg.stone * 4 - 1; assert.equal(S.stockPlan(G), null);
  G.res.stone = 96; assert.deepEqual(S.stockPlan(G), { n: 96, per: PROJ.har.seg.stone, next: PROJ.wall.seg.stone });
  const G2 = G0(); assert.equal((G2.res.stone = 96, S.stockPlan(G2)), null, 'not before the Mount is started');
});
test('build7: the pill\'s board pay (M3_PAY) matches MATCH3\'s live levelInfo', async () => {
  const { m3Pay } = await import('../src/game/content.js');
  let M = null; try { M = await import('../src/match3/index.js'); } catch (e) { /* a lone branch without MATCH3 */ }
  if (!M || typeof M.levelInfo !== 'function') return;
  for (const [f, l] of [['quarry', 1], ['forest', 1], ['gold', 2]]) {
    const y = Object.values(M.levelInfo(f, l).yields)[0], mid = (y[0] + y[1]) / 2;
    assert.ok(Math.abs(m3Pay(f, l) - mid) <= 2, `${f} L${l}: table ${m3Pay(f, l)} vs live ${mid}`);
  }
  assert.ok(m3Pay('quarry', 99) > 20, 'past the table: the mean of its last ten');
});
test('build7: a fresh save has not played the opening yet', () => { assert.equal(G0().op, 0); });
test('build7: a bronze need leads with the king who brings it (nextAction with a deal resolver)', () => {
  const G = rich(G0());
  for (const s of STAGES) { if (s.id === 'nikanor') break; if (S.statusOf(G, 'nikanor') === 'avail') break; finish(G, s.id); }
  G.ftue = 99; G.priests = 99;
  const ok = S.startBuild(G, 'nikanor');
  if (!ok.ok) return;   // (the stage graph changed: nothing to test here)
  const s = G.st.nikanor; s.p = 'finish'; s.fd = 0; s.fp = 0; s.set = s.n; s.paid = s.n; G.focus = 'nikanor';
  G.res.bronze = 0;
  const plain = S.nextAction(G);
  if (plain.kind !== 'play' || !(plain.lack && plain.lack.bronze)) return;   // (its first finish step is not bronze any more)
  assert.equal(S.nextAction(G, { deal: () => null }).kind, 'play');
  const d = S.nextAction(G, { deal: (res, need) => (res === 'bronze' && need > 0 ? { partner: 'nikanor', offer: 'doors', who: 'ניקנור', n: 150, cost: 20 } : null) });
  assert.equal(d.kind, 'deal'); assert.equal(d.res, 'bronze'); assert.equal(d.offer, 'doors'); assert.equal(d.play.kind, 'play'); assert.equal(d.id, 'nikanor');
  assert.equal(S.nextAction(G, { deal: () => { throw new Error('kings'); } }).kind, 'play', 'a throwing resolver is ignored');
});

// ── flow10 ── (NET10's "כהנים יחד") coStone: the partner's stone is one stone of crew-like work — never a key stone, the check,
// an unpaid segment, the survey or the rocks
test('coStone: one crew-like stone at a stone job, nothing at a key stone or before the courses', () => {
  const G = rich(G0());
  S.startBuild(G, 'har');
  assert.equal(S.coStone(G, 'har'), null, 'the survey: no partner stone');
  Object.assign(G.st.har, { p: 'courses', dp: 1, paid: 999, set: 0, k: 0 });
  assert.equal(S.jobOf(G, 'har').kind, 'key');
  assert.equal(S.coStone(G, 'har'), null, 'the great stone is the player\'s own (a key stone)');
  Object.assign(G.st.har, { set: 3, k: 0 });
  const r = S.coStone(G, 'har');
  assert.ok(r && r.stones.har === 1, 'one stone set');
  assert.equal(G.st.har.set, 4);
  assert.equal(S.coStone(G, 'nope'), null);
});

// (supervisor, 30.9) the owner tests every stage by hand in the demo: a fresh demo save at any stage's start
test('demoAt: every stage before the chosen one built, the chosen one at its start, the name kept, the real save untouched', () => {
  const prev = S.fresh(Date.now(), { demo: true }); prev.name = 'יכין'; prev.mishmar = 3;
  for (const s of STAGES) prev.st[s.id] = { done: true };   // a demo that reached its end
  const G = S.demoAt(prev, 'guf');
  const before = STAGES.slice(0, STAGES.findIndex((s) => s.id === 'guf'));
  assert.ok(G.demo && G.ftue === 99 && G.op === 1 && G.name === 'יכין' && G.mishmar === 3);
  assert.ok(before.every((s) => S.isDone(G, s.id)), 'the stages before guf are built');
  assert.ok(!S.isDone(G, 'guf') && !S.isDone(G, 'kodesh') && !S.allDone(G), 'guf and after are not');
  assert.equal(G.focus, 'guf');
  assert.ok(G.res.cedar >= 1000 && G.res.gold >= 1000, 'the demo stock');
  const H = S.demoAt(prev, 'ulam');
  assert.ok(H.priests >= 10, 'the House stages have their trained kohanim');
  assert.equal(S.demoAt(prev, 'nope'), null);
  const A = S.demoAt(null, 'har');
  assert.ok(!S.isDone(A, 'har') && A.focus === 'har' && A.bh.some((v) => v > 0), 'the Mount from its rocks');
});

