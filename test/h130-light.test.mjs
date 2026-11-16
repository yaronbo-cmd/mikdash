// build 130 (L1): the light station's ladder is playable by a hand — the jar's pendulum (h130/model.js CLIMB) forgives a late lift,
// punishes feeding the swing, and the act's other boys (h130/light.js) climb by the same model
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as M from '../src/game/h130/model.js';

/** a player: 'mid' lifts the next hand `lat` s after the jar passes the middle going away from it (or at once when the jar is still);
 *  'pump' lifts it as the jar passes the middle going TOWARD it (feeding the swing); the drag to the next rung takes dragT s */
function climb(pol, lat, top = 50, dragT = 0.35) {
  const S = M.climbFresh(top, 30), dt = 1 / 120; let t = 0, next = 'L', pend = null, trig = null, prev = 0; const ev = {};
  while (t < 400 && !S.dropped && S.rung < top) {
    let hand = null;
    if (pend && t >= pend.at) { hand = { h: pend.h, a: 'place' }; pend = null; }
    else if (!S.up && !pend) {
      const sg = next === 'R' ? 1 : -1, still = Math.abs(S.phi) < 0.02 && Math.abs(S.w) < 0.1;
      const cross = prev * S.phi <= 0 && (pol === 'pump' ? sg * S.w > 0 : -sg * S.w > 0);
      if (trig == null && (cross || still)) trig = t + (still ? 0 : lat);
      if (trig != null && t >= trig) { hand = { h: next, a: 'lift' }; pend = { h: next, at: t + dragT }; next = next === 'L' ? 'R' : 'L'; trig = null; }
    }
    prev = S.phi;
    for (const e of M.climbStep(S, hand, dt)) ev[e] = (ev[e] | 0) + 1;
    t += dt;
  }
  return { S, ev, t };
}

test('light: a careful player late by up to half a second climbs the whole fifty without dropping the jar', () => {
  for (const lat of [0, 0.1, 0.2, 0.3, 0.5]) { const { S } = climb('mid', lat); assert.equal(S.dropped, 0, 'late ' + lat); assert.equal(S.rung, 50); assert.ok(S.oil > 29, 'late ' + lat + ' oil ' + S.oil); }
  const { ev } = climb('mid', 0); assert.ok((ev.perfect | 0) > 80, 'on time: the perfect steps');
});
test('light: feeding the swing drops the jar within a few rungs (light.jar)', () => {
  const { S } = climb('pump', 0); assert.equal(S.dropped, 1); assert.ok(S.rung <= 5, 'rung ' + S.rung);
});
