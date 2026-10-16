// (wave 6, FUN) Calibrates the precision games with human timing: Noam (reaction jitter sd 50 ms) and Maya (90 ms), 40 tries per
// game and level → mean quality, mean length and the tier spread [שוליה/אומן/רב אומן/מופת]. Run: node test/playtest/minigames-calib.mjs
import { GAMES, simulate, rng, tierOf } from '../../src/game/minigames/index.js';
// a human: sees the right moment (the autopilot's cue) and taps after a reaction delay ~ N(mu, sd), sometimes early
function human(sd, mu, R) {
  let due = -1;
  return (M, t) => {
    const a = M.auto();
    if (due < 0 && a) { const g = Math.sqrt(-2 * Math.log(R() + 1e-9)) * Math.cos(6.283 * R()); due = t + Math.max(-0.08, mu + sd * g); if (due <= t) { due = -1; return a; } return false; }
    if (due >= 0 && t >= due) { due = -1; return M.phase === 'look' || M.phase === 'swing' || M.phase === 'margins' || M.phase === 'boss' ? (typeof a === 'string' ? a : (M.kind === undefined && M.stones ? (M.cur() && M.cur().kind === 'whole' ? 'ok' : 'no') : true)) : false; }
    return false;
  };
}
for (const [who, sd, mu] of [['נועם', 0.05, 0.02], ['מאיה', 0.09, 0.05]]) {
  for (const k of Object.keys(GAMES)) {
    const row = [];
    for (const lv of [0, 2, 4]) {
      const tiers = [0, 0, 0, 0]; let q = 0, s = 0; const N = 40;
      for (let i = 0; i < N; i++) { const R = rng(1000 + i); const r = simulate(GAMES[k], { level: lv, rng: rng(i + 1) }, human(sd, mu, R)); tiers[tierOf(r.quality)]++; q += r.quality; s += r.s; }
      row.push(`L${lv} q${(q / N).toFixed(2)} ${(s / N).toFixed(0)}s [${tiers.join('/')}]`);
    }
    console.log(who, k.padEnd(6), row.join(' · '));
  }
}
