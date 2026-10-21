// TWIN17 (wave 17): "every job is playable by taps alone" (docs/WAVE17-BRIEF.md P2). Run: node --test test/twin-taps.test.mjs
// Each game the Mount deals (its deck's jobs, the line that opens a course, the key stones' games) is played as the work button
// plays it under two thumbs (hands.js, input 'twin'): a tap every 0.45 s starts one act of the model's own autopilot, fed until it
// lands (hands.js feedM: a stroke, a step, a haul) or 1.6 s pass. The model must finish, and a finished job is never below ★.
import test from 'node:test';
import assert from 'node:assert/strict';
import { GAMES, rng, starsOf } from '../src/game/minigames/index.js';
import { twinBurst } from '../src/game/hands.js';
import { DECKS } from '../src/game/content.js';
import * as JB from '../src/game/jobs.js';

/** the twin tap loop of hands.js, headless: → { done, taps, s, q } */
function playByTaps(game, level = 0, seed = 7, every = 0.45, maxS = 240) {
  const M = game.model({ level, rng: rng(seed), setup: {} });
  const dt = 1 / 60, drag = typeof M.drag === 'function', hold = (game.buttons || []).filter((b) => b && b.hold).length >= 2;
  let t = 0, next = 0.2, burst = null, taps = 0;
  while (!M.done && t < maxS) {
    if (!burst && t >= next) { burst = { t: 0, p0: M.progress | 0 }; taps++; next = t + every; }
    if (burst) burst = twinBurst(M, burst, dt, drag, hold, () => { const c = typeof M.cue === 'function' ? M.cue() : null; return [c && c.x != null ? c.x : 0.5, c && c.y != null ? c.y : 0.5]; });
    M.patient = true; M.step(dt); M.fx.length = 0; t += dt;
  }
  const r = M.result();
  return { done: !!M.done, taps, s: Math.round(t), q: +r.quality.toFixed(2) };
}
const MOUNT = new Set([...DECKS.har.stone, ...DECKS.har.craft, 'line']);
const GAME_OF = (job) => (JB.JOBS[job] || {}).game;
const KEYS = ['crane', 'quarry', 'dress', 'whole'];
const games = [...new Set([...[...MOUNT].map(GAME_OF).filter(Boolean), ...KEYS])];

for (const g of games) {
  test(`taps alone finish "${g}" (levels 0 and 2)`, () => {
    assert.ok(GAMES[g], `GAMES.${g}`);
    for (const level of [0, 2]) {
      const r = playByTaps(GAMES[g], level);
      assert.ok(r.done, `${g} L${level}: not finished after ${r.taps} taps in ${r.s} s`);
      assert.ok(starsOf(r.q) >= 1, `${g} L${level}: q ${r.q}`);
      console.log(`   ${g} L${level}: ${r.taps} taps · ${r.s} s · q ${r.q}`);
    }
  });
}
