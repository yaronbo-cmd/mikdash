// The match-3 bot report: plays levels 1–60 of each field with typical players (skill 0.55 ≈ FUN's Maya, 30 hands each, out of the
// calibration's sample) and reports the first-try win rate, the moves used and the minutes a level takes.
//   node test/match3-bot.mjs            the table by tens of levels
//   node test/match3-bot.mjs --check    exit 1 unless levels 1–10 win ≥ 90 % and 16+ win 55–85 % on average per field
//   node test/match3-bot.mjs --levels   one line per level
import { levelSpec } from '../src/match3/levels.js';
import { playBot } from '../src/match3/engine.js';

const HANDS = 30, SKILL = 0.55, SEC_PER_MOVE = 6.5, TO = +(process.argv.find((a) => /^--to=/.test(a)) || '=60').split('=')[1];
const perLevel = process.argv.includes('--levels');
const out = {};
const t0 = Date.now();
for (const f of ['quarry', 'forest', 'gold']) {
  out[f] = [];
  for (let L = 1; L <= TO; L++) {
    const sp = levelSpec(f, L);
    let w = 0, used = 0, all = 0;
    for (let h = 0; h < HANDS; h++) {
      const r = playBot(sp, sp.seed, SKILL, 1000 + h);
      all += r.used;
      if (r.won) { w++; used += r.used; }
    }
    const row = { L, win: w / HANDS, used: w ? used / w : 0, moves: sp.moves, min: (all / HANDS) * SEC_PER_MOVE / 60, goal: sp.goals.map((g) => g.t + ' ' + g.n).join(' + '), hard: sp.hard };
    out[f].push(row);
    if (perLevel) console.log(f.padEnd(7), String(L).padStart(3), (row.win * 100).toFixed(0).padStart(4) + '%', 'used', row.used.toFixed(1).padStart(5), '/', sp.moves, ' ', row.min.toFixed(1), 'min ', row.goal, row.hard ? '(hard)' : '');
  }
}
const avg = (a, k) => a.reduce((s, x) => s + x[k], 0) / Math.max(1, a.length);
console.log('field    levels   win%   used/moves   minutes');
let bad = 0;
for (const f of Object.keys(out)) {
  for (const [a, b] of [[1, 10], [11, 15], [16, 30], [31, 45], [46, 60]]) {
    const rows = out[f].filter((r) => r.L >= a && r.L <= b);
    if (!rows.length) continue;
    const win = avg(rows, 'win');
    console.log(f.padEnd(8), `${a}–${b}`.padEnd(8), (win * 100).toFixed(0).padStart(4), '  ', avg(rows, 'used').toFixed(1).padStart(5), '/', avg(rows, 'moves').toFixed(0), '   ', avg(rows, 'min').toFixed(1));
    if (a === 1 && win < 0.9) bad++;
    if (a >= 16 && (win < 0.55 || win > 0.85)) bad++;
  }
  const hard = out[f].filter((r) => r.hard);
  if (hard.length) console.log(f.padEnd(8), 'hard    ', (avg(hard, 'win') * 100).toFixed(0).padStart(4), `  (${hard.length} levels)`);
}
console.log(`${Math.round((Date.now() - t0) / 1000)} s`);
if (process.argv.includes('--check')) { console.log(bad ? `FAIL (${bad} bands out of range)` : 'PASS'); process.exit(bad ? 1 : 0); }
