// HOOK20: the rules of "המסביב" without a browser. Run: node --test test/hook20-around.test.mjs
// badges only for what is new and gone on open · the seen marks live in the save · streak (Shabbat keeps it, a break is "day 1 again") ·
// slots' save keys · the family code (numbers only, a check) · the ranking.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/game/state.js';
import * as A from '../src/game/hooks/around.js';

const mem = () => { const m = new Map(); return { get: (k) => (m.has(k) ? m.get(k) : null), set: (k, v) => { m.set(k, v); return true; }, remove: (k) => m.delete(k), m }; };

test('a fresh or old save shows no badge; only new things do, and opening clears', () => {
  const G = S.fresh(1e12);
  assert.deepEqual(A.counts(G, 0), [0, 0, 0, 0, 0]);
  G.book.un['1.1'] = 1;                                     // a fact unlocked
  assert.equal(A.counts(G, 0)[2], 1);
  A.opened(G, 'book'); assert.equal(A.counts(G, 0)[2], 0);
  A.event(G, 'jobDone', { stars: 2 }, { day: '2026-10-07', craft: 'סתתים' }); A.event(G, 'course', { id: 'har', c: 1 }, { day: '2026-10-07' });
  assert.equal(A.counts(G, 0)[3], 2);
  A.opened(G, 'daily'); assert.equal(A.counts(G, 0)[3], 0);
  assert.equal(G.around.best['סתתים'], 2);
  A.event(G, 'course', { id: 'har', c: 2, away: true }, { day: '2026-10-07' }); assert.equal(A.counts(G, 0)[3], 0, 'an away course is not new');
  assert.equal(A.counts(G, 3)[1], 3, 'kings: the game\'s own count');
  const idle = G.crews.length; G.crews.push({ at: null }); assert.equal(A.counts(G, 0)[0], 1); A.opened(G, 'crews'); assert.equal(A.counts(G, 0)[0], 0); assert.ok(idle >= 0);
  const J = JSON.parse(JSON.stringify(G)); assert.deepEqual(A.counts(J, 0), [0, 0, 0, 0, 0], 'the marks survive a save');
});
test('the riddle is a book badge until the book opens', () => {
  const G = S.fresh(1e12);
  assert.equal(A.counts(G, 0, { riddleDay: '2026-10-07' })[2], 1);
  assert.equal(A.counts(G, 0, { riddleDay: '2026-10-07', riddleSolved: true })[2], 0);
  A.opened(G, 'book', { riddleDay: '2026-10-07' });
  assert.equal(A.counts(G, 0, { riddleDay: '2026-10-07' })[2], 0);
  assert.equal(A.counts(G, 0, { riddleDay: '2026-10-08' })[2], 1, 'tomorrow: a new riddle');
});
test('streak: consecutive days, Shabbat keeps it, a break is day 1 again', () => {
  const G = S.fresh(1e12); A.ensure(G);
  G.around.days = ['2026-10-01', '2026-10-02', '2026-10-04'];                  // 3.10.2026 is Saturday
  assert.equal(A.streak(G, '2026-10-04').n, 3);
  assert.equal(A.streak(G, '2026-10-05').n, 3, 'today not yet played: yesterday\'s run stands');
  assert.equal(A.streak(G, '2026-10-07').n, 0);
  A.rollDay(G, '2026-10-07'); assert.deepEqual([A.streak(G, '2026-10-07').n, A.streak(G, '2026-10-07').fresh], [1, true]);
});
test('today\'s work counts from the day\'s start', () => {
  const G = S.fresh(1e12); G.score = 500; G.stats.stones = 10; A.rollDay(G, '2026-10-07');
  G.score = 1300; G.stats.stones = 25; A.event(G, 'course', { id: 'x' }, { day: '2026-10-07' });
  assert.deepEqual(A.today(G, '2026-10-07'), { courses: 1, jobs: 0, stones: 15, pts: 800 });
  A.rollDay(G, '2026-10-08'); assert.equal(A.today(G, '2026-10-08').pts, 0);
});
test('slots: the first keeps today\'s key, others get their own; the board ranks by dinars, stones, streak', () => {
  const st = mem();
  assert.equal(A.slotKey('main'), S.SAVE_KEY);
  const id = A.slotAdd(st); assert.equal(id, 'k2'); assert.equal(A.slotKey(id), 'bh_save_k2');
  assert.deepEqual(A.slotsList(st), ['main', 'k2']);
  const a = S.fresh(1e12), b = S.fresh(1e12); a.name = 'דרור'; b.name = 'נועה'; a.dinars = [{ n: 1 }]; b.dinars = [{ n: 1 }, { n: 2 }]; a.stats.stones = 99;
  S.save(a, st, S.SAVE_KEY); S.save(b, st, A.slotKey(id));
  const rows = A.rank(A.slotRows(st, '2026-10-07'));
  assert.deepEqual(rows.map((r) => r.name), ['נועה', 'דרור']);
  assert.ok(A.slotSwitch('k2', st) && A.slotCur(st) === 'k2'); assert.equal(A.slotSwitch('zzz', st), false);
});
test('the family code: 6 symbols, numbers only, a typo is caught, a kin row is added by label', () => {
  const c = A.codeOf({ d: 5, s: 1234, t: 9 }); assert.match(c, /^[A-Z2-9]{6}$/);
  assert.deepEqual(A.parseCode(c), { d: 5, s: 1234, t: 9 });
  assert.deepEqual(A.parseCode(c.toLowerCase()), { d: 5, s: 1234, t: 9 });
  const bad = (c[0] === 'A' ? 'B' : 'A') + c.slice(1); assert.notDeepEqual(A.parseCode(bad), { d: 5, s: 1234, t: 9 });
  assert.equal(A.parseCode('ABC'), null);
  const G = S.fresh(1e12);
  assert.ok(A.addKin(G, 'בן דוד', c)); assert.ok(A.addKin(G, 'בן דוד', A.codeOf({ d: 6, s: 1300, t: 10 })));
  assert.equal(G.around.kin.length, 1); assert.equal(A.kinRows(G)[0].d, 6);
  assert.equal(A.addKin(G, '', c), false); assert.equal(A.addKin(G, 'x', 'ZZZZZZ'), false);
  assert.deepEqual(A.parseCode(A.codeOf({ d: 999, s: 99999, t: 999 })), { d: 127, s: 8191, t: 127 });
});
