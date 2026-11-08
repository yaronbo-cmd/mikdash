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
test('levels rise by thirds and on a replay', () => {
  const M = createH109();
  assert.equal(M.levelOf(PLAN.find((m) => m.id === 'rocks0')), 1);
  assert.equal(M.levelOf(PLAN.find((m) => m.id === 'rocks4')), 2);
  assert.equal(M.levelOf(PLAN.find((m) => m.id === 'rocks8')), 3);
});
test('grades: the gold window narrows with the level', () => {
  const M = createH109();
  assert.equal(M.grade(0.11, 1), 'gold');
  assert.equal(M.grade(0.11, 3), 'good');
  assert.equal(M.grade(0.3, 1), 'ok');
});
test('progress climbs and an empty waste mission is skipped', () => {
  const M = createH109();
  let p0 = M.progress();
  while (M.mission() && M.mission().k !== 'waste') { M.done({ stars: 3, q: 1 }); assert.ok(M.progress() >= p0); p0 = M.progress(); }
  // nothing went to the pile: the first waste mission was skipped already
  assert.notEqual(M.mission() && M.mission().id, 'waste1');
});
test('waste goes to the pile and the waste mission clears it', () => {
  const M = createH109();
  while (M.mission().id !== 'read0') M.done({ stars: 3 });
  M.done({ stars: 1, waste: 2 });
  while (M.mission().k !== 'waste') M.done({ stars: 3 });
  assert.equal(M.mission().id, 'waste1'); assert.equal(M.st.waste, 2);
  M.done({ stars: 3 }); assert.equal(M.st.waste, 0); assert.equal(M.st.wasteIn, 2);
});
test('a sector is מהודר only when all three works were three stars', () => {
  const M = createH109();
  M.done({ stars: 3 });
  M.done({ stars: 3 }); M.done({ stars: 3 }); M.done({ stars: 3 });
  assert.equal(M.sectorGrade(0), 'מהודר');
  M.done({ stars: 3 }); M.done({ stars: 2 }); M.done({ stars: 3 });
  assert.equal(M.sectorGrade(1), 'כשר');
  M.done({ stars: 3 }); M.done({ stars: 0, lost: true }); M.done({ stars: 3 });
  assert.equal(M.sectorGrade(2), 'נכשל');
});
test('the whole stage ends', () => {
  const M = createH109();
  let n = 0; while (M.mission() && n++ < 200) M.done({ stars: 2 });
  assert.ok(M.finished()); assert.equal(M.progress(), 1);
  assert.equal(starsOf(0.95), 3);
});
