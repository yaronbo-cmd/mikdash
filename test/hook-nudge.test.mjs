// HOOK19: the rules of "the tabs that call" (docs/FUN19.md §4.2) — pure, the clock is injected.
import test from 'node:test';
import assert from 'node:assert/strict';
import { createNudges, GAP, LINES, TABS, lineOf } from '../src/game/nudge.js';

const MIN = 60000;
const make = () => { let t = 1e9; const N = createNudges({ now: () => t }); return { N, adv: (ms) => { t += ms; } }; };

test('never in the first two minutes', () => {
  const { N, adv } = make();
  assert.equal(N.offer('book', 'x').why, 'early');
  adv(GAP.first - 1000); assert.equal(N.offer('book', 'x').why, 'early');
  adv(1500); assert.equal(N.offer('book', 'x').ok, true);
});

test('one nudge at a time: at most one every four minutes, whatever the tab', () => {
  const { N, adv } = make();
  adv(2 * MIN + 1); assert.equal(N.offer('book', 'a').ok, true);
  adv(3 * MIN); assert.equal(N.offer('crews', 'b').why, 'gap');
  adv(MIN + 1); assert.equal(N.offer('crews', 'b').ok, true);
  adv(MIN); assert.equal(N.offer('kings', 'c').why, 'gap');
});

test('each tab at most once in fifteen minutes', () => {
  const { N, adv } = make();
  adv(2 * MIN + 1); assert.equal(N.offer('book', 'a').ok, true);
  adv(5 * MIN); assert.equal(N.offer('book', 'a').why, 'tab');
  adv(9 * MIN); assert.equal(N.offer('book', 'a').why, 'tab');   // 14 min
  adv(1.5 * MIN); assert.equal(N.offer('book', 'a').ok, true);   // 15.5 min
});

test('two ignored nudges silence a tab until the next stage; opening it, or a new stage, lets it call again', () => {
  const { N, adv } = make();
  adv(2 * MIN + 1); assert.equal(N.offer('book', 'a').ok, true);          // #1, not opened
  adv(16 * MIN); assert.equal(N.offer('book', 'a').ok, true);              // #1 ignored → #2 may come
  adv(16 * MIN); const r = N.offer('book', 'a');                           // #2 ignored → silent
  assert.deepEqual([r.ok, r.why], [false, 'silent']);
  adv(60 * MIN); assert.equal(N.offer('book', 'a').why, 'silent');
  assert.equal(N.offer('crews', 'b').ok, true);                             // the other tabs are not silenced
  N.stage('wall'); adv(16 * MIN); assert.equal(N.offer('book', 'a').ok, true);
  // opened: the count restarts
  const q = make(); q.adv(2 * MIN + 1); q.N.offer('daily', 'a'); q.N.opened('daily');
  q.adv(16 * MIN); assert.equal(q.N.offer('daily', 'a').ok, true); q.adv(16 * MIN); assert.equal(q.N.offer('daily', 'a').ok, true);
  assert.equal(q.N.state().ign.daily || 0, 1);
});

test('warp moves the clock for the tests; the lines are fixed texts for every tab', () => {
  const { N } = make();
  assert.equal(N.offer('store', 'x').why, 'early'); N.warp(2 * MIN + 1); assert.equal(N.offer('store', 'x').ok, true);
  assert.equal(N.offer('nope', 'x').ok, false);
  for (const t of TABS) assert.ok(LINES[t] && LINES[t].length > 8, t);
  assert.equal(lineOf('store', 'החומה'), 'נפתח שלב חדש: החומה');
  assert.equal(lineOf('book', 'שערי העזרה'), 'בספר מידות מחכה לך משנה על שערי העזרה');
  assert.match(LINES.survey, /★500/);
});
