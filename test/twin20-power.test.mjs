// TWIN20: the right stick's power reaches the act (acts.js reads globalThis.__TW_POWER while armed; a tap alone = 1)
import test from 'node:test';
import assert from 'node:assert/strict';
import { act } from '../src/game/minigames/acts.js';
test('power is 1 without the stick, the stick\'s while armed, 1 after it lapses', () => {
  delete globalThis.__TW_POWER;
  assert.equal(act({ fx: [] }, 1, {}).power, 1);
  globalThis.__TW_POWER = { p: 1.6, until: performance.now() + 5000 };
  assert.equal(act({ fx: [] }, 1, {}).power, 1.6);
  assert.equal(Math.round(act({ fx: [] }, 1, { power: 0.5 }).power * 100) / 100, 0.8);
  globalThis.__TW_POWER = { p: 1.6, until: performance.now() - 1 };
  assert.equal(act({ fx: [] }, 1, {}).power, 1);
  delete globalThis.__TW_POWER;
});
