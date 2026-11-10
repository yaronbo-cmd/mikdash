import test from 'node:test';
import assert from 'node:assert/strict';
import { createH109, PLAN, H109, starsOf } from '../src/game/h109/model.js';

test('the plan: 9 sectors of rocks · read · pave, the rope first and the letters last', () => {
  assert.equal(PLAN[0].k, 'rope');
  assert.equal(PLAN[PLAN.length - 1].k, 'letters');
  for (let s = 0; s < H109.SECTORS; s++) for (const k of ['rocks', 'read', 'pave']) assert.ok(PLAN.find((m) => m.k === k && m.s === s), `${k}${s}`);
  assert.equal(PLAN.filter((m) => m.k === 'course').length, 2);
  assert.ok(PLAN.findIndex((m) => m.k === 'great') > PLAN.findIndex((m) => m.id === 'pave7'));
  assert.ok(PLAN.findIndex((m) => m.k === 'great') < PLAN.findIndex((m) => m.id === 'rocks8'));
});
// (build 114: the works are a free choice — a work is picked, then done; its level follows how many of its kind are finished)
const doId = (M, id, res = { stars: 3, q: 1 }) => { assert.ok(M.pick(id), 'open: ' + id); M.done(res); };
test('levels follow how many of a kind are finished, and rise on a replay', () => {
  const M = createH109(); doId(M, 'rope');
  const rk = (s) => PLAN.find((m) => m.id === 'rocks' + s);
  assert.equal(M.levelOf(rk(7)), 1);
  for (const s of [7, 2, 5]) doId(M, 'rocks' + s);
  assert.equal(M.levelOf(rk(0)), 2);
  for (const s of [0, 1, 3]) doId(M, 'rocks' + s);
  assert.equal(M.levelOf(rk(8)), 3);
});
test('free choice: only the building\'s own order binds', () => {
  const M = createH109();
  assert.deepEqual(M.open().map((m) => m.id), ['rope']);
  doId(M, 'rope');
  const open = M.open().map((m) => m.id);
  for (let s = 0; s < 9; s++) assert.ok(open.includes('rocks' + s));
  assert.ok(open.includes('corner')); assert.ok(!open.includes('course0')); assert.ok(!open.includes('read0'));
  assert.equal(M.pick('course0'), null);
  doId(M, 'corner'); doId(M, 'course0'); doId(M, 'course1');
  assert.ok(!M.wallsDone()); doId(M, 'great'); assert.ok(M.wallsDone());
  // the inscription goes on the corner's top: only once every sector is levelled and paved
  assert.ok(!M.open().some((m) => m.id === 'letters'));
  for (let s = 0; s < 9; s++) for (const k of ['rocks', 'read', 'pave']) doId(M, k + s);
  assert.ok(M.open().some((m) => m.id === 'letters'));
});
test('grades: the gold window narrows with the level', () => {
  const M = createH109();
  assert.equal(M.grade(0.11, 1), 'gold');
  assert.equal(M.grade(0.11, 3), 'good');
  assert.equal(M.grade(0.3, 1), 'ok');
});
test('progress climbs and the empty waste works are swept at the end', () => {
  const M = createH109();
  let p0 = M.progress(), n = 0;
  while (!M.finished() && n++ < 200) { const m = M.open()[0]; assert.ok(m, 'something is open'); assert.notEqual(m.k, 'waste'); doId(M, m.id); assert.ok(M.progress() >= p0); p0 = M.progress(); }
  assert.ok(M.finished()); assert.equal(M.progress(), 1); assert.ok(M.st.res.waste1.skipped);
  assert.equal(starsOf(0.95), 3);
});
test('waste goes to the pile and the waste work clears it', () => {
  const M = createH109(); doId(M, 'rope'); doId(M, 'rocks0');
  assert.ok(!M.open().some((m) => m.k === 'waste'));
  doId(M, 'read0', { stars: 1, waste: 3 });
  assert.equal(M.st.waste, 3); assert.ok(M.open().some((m) => m.id === 'waste1'));
  doId(M, 'waste1'); assert.equal(M.st.waste, 0); assert.equal(M.st.wasteIn, 3);
});
test('a sector is מהודר only when all three works were three stars', () => {
  const M = createH109(); doId(M, 'rope');
  for (const k of ['rocks', 'read', 'pave']) doId(M, k + 0);
  assert.equal(M.sectorGrade(0), 'מהודר');
  doId(M, 'rocks1'); doId(M, 'read1', { stars: 2 }); doId(M, 'pave1');
  assert.equal(M.sectorGrade(1), 'כשר');
  doId(M, 'rocks2'); doId(M, 'read2', { stars: 0, lost: true }); doId(M, 'pave2');
  assert.equal(M.sectorGrade(2), 'נכשל');
});
test('autoTo: the crews do the open works in the plan\'s order until the wanted one is open', () => {
  const M = createH109();
  const m = M.autoTo((x) => x.k === 'great'); assert.equal(m && m.id, 'great'); assert.ok(!M.wallsDone());
  const M2 = createH109(); const l = M2.autoTo((x) => x.k === 'letters'); assert.equal(l && l.id, 'letters'); assert.ok(M2.wallsDone());
});
