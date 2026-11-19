// build 117 (brief §R2): the wedges struck in rounds
import test from 'node:test';
import assert from 'node:assert/strict';
import { newRound, blow, tick, isDone, NEED } from '../src/game/h109/wedges.js';

test('even rounds: no crooked crack, done after three blows each', () => {
  const R = newRound(4); let t = 0;
  for (let r = 0; r < NEED; r++) for (let i = 0; i < 4; i++) { const b = blow(R, i, (t += 0.5)); assert.equal(b.crooked, false); }
  assert.ok(isDone(R)); assert.equal(R.crooked, 0);
  assert.equal(blow(R, 0, t + 1).ok, false);
});

test('a wedge two blows ahead of its neighbour pulls the crack aside, once per wedge', () => {
  const R = newRound(3);
  blow(R, 1, 0); const b = blow(R, 1, 0.4); assert.equal(b.crooked, true); assert.equal(R.crooked, 1);
  blow(R, 1, 0.8); assert.equal(R.crooked, 1);
  blow(R, 0, 1); blow(R, 0, 1.1); blow(R, 0, 1.2); assert.equal(R.crooked, 1);   // (0 never got 2 ahead of 1)
});

test('loosening: none at level 1; from level 2 after 6 s (level 3: 4 s) it trembles, then backs out one blow; never under 0', () => {
  for (const lv of [1, 2, 3]) {
    const R = newRound(2); blow(R, 0, 0);
    const lim = lv === 3 ? 4 : 6;
    assert.deepEqual(tick(R, 3, lv), []);
    if (lv === 1) { assert.deepEqual(tick(R, 30, lv), []); continue; }
    assert.ok(tick(R, lim + 0.1, lv).some((e) => e.i === 0 && e.tremble));
    assert.ok(tick(R, lim + 1.3, lv).some((e) => e.i === 0 && e.out));
    assert.equal(R.blows[0], 0); assert.equal(R.loose, 1);
    assert.deepEqual(tick(R, 100, lv), []);   // (an empty wedge does not back out)
  }
});
