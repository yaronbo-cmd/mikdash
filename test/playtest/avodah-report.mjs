// Phase B playtest report: markdown tables from test/out/playtest/avodah-<label>.json (avodah-bots.cjs).
//   node test/playtest/avodah-report.mjs [before] [after]
import fs from 'node:fs';
import path from 'node:path';
const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const [A = 'before', B = 'after'] = process.argv.slice(2);
const load = (l) => { const f = path.join(ROOT, `test/out/playtest/avodah-${l}.json`); return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf8')) : {}; };
const a = load(A), b = load(B);
const { RANKS } = await import('../../src/avodah/state.js');
const OLD_RANKS = [20, 60, 120, 200, 300, 420, 560, 720, 900, 1100, 1320, 1560, 1820, 2100, 2400];   // master 2be68cf
const rankOf = (R, p) => R.filter((x) => p >= x).length;
// a human is slower than the solver: ~1.1 s per decision in a game (0.6 s for the child), on top of the game's own pace
const REACT = { child: 0.6 };
const human = (k, m) => +((m.gameMin * 60 + m.decisions * (REACT[k] || 1.1) + m.readMin * 60) / 60).toFixed(1);
const cell = (x, y) => (x === undefined ? `${y}` : y === undefined ? `${x}` : x === y ? `${x}` : `${x} → ${y}`);

const single = ['newLink', 'newMenu', 'newRitual', 'child', 'investor', 'binger'];
console.log(`| persona | session (floor / human est.) | time to first tap in a game | cards (memuneh) | words per source card | words/min | reading share | in-game waits | decisions (/game) | points | ממונים met |`);
console.log('|---|---|---|---|---|---|---|---|---|---|---|');
for (const k of single) {
  const x = a[k] && a[k].metrics, y = b[k] && b[k].metrics;
  if (!x && !y) continue;
  const g = (m, f) => (m ? f(m) : undefined);
  // the ממונים met: the rank of the points on each side's ladder (the old one before, state.js's RANKS after)
  const rankA = (m) => rankOf(OLD_RANKS, m.points), rankB = (m) => rankOf(RANKS, m.points);
  console.log(`| ${k} | ${cell(g(x, (m) => `${m.endMin} / ${human(k, m)} min`), g(y, (m) => `${m.endMin} / ${human(k, m)} min`))} | ${cell(g(x, (m) => m.ttffS + ' s'), g(y, (m) => m.ttffS + ' s'))} | ${cell(g(x, (m) => `${m.cards} (${m.memunehCards})`), g(y, (m) => `${m.cards} (${m.memunehCards})`))} | ${cell(g(x, (m) => m.wordsPerCard), g(y, (m) => m.wordsPerCard))} | ${cell(g(x, (m) => m.wordsPerMin), g(y, (m) => m.wordsPerMin))} | ${cell(g(x, (m) => m.readShare + '%'), g(y, (m) => m.readShare + '%'))} | ${cell(g(x, (m) => m.inGameWaitMin + ' min'), g(y, (m) => m.inGameWaitMin + ' min'))} | ${cell(g(x, (m) => `${m.decisions} (${m.inputsPerGame})`), g(y, (m) => `${m.decisions} (${m.inputsPerGame})`))} | ${cell(g(x, (m) => m.points), g(y, (m) => m.points))} | ${cell(g(x, rankA), g(y, rankB))} |`);
}
for (const k of ['regular', 'ritual']) {
  for (const [lab, D] of [[A, a], [B, b]]) {
    const R = D[k];
    if (!R || !R.days) continue;
    console.log(`\n**${k} · ${lab}** (${R.label})\n`);
    console.log('| day | minutes | games | new source cards / all | for real | points (total) | ממונים | streak | roles done | "מחר:" in the summary |');
    console.log('|---|---|---|---|---|---|---|---|---|---|');
    for (const d of R.days) {
      if (d.skip) { console.log(`| ${d.at.slice(5, 16)} | Shabbat/Yom Tov: not played | | | | | | | | |`); continue; }
      const tm = (d.summaryLines || []).some((l) => /^מחר:/.test(l));
      console.log(`| ${d.at.slice(5, 16)} | ${d.endMin} | ${d.gamesPlayed.join(', ')} | ${d.newCards}/${d.newCards + d.repeatCards} | ${d.forReal} | ${d.rank} | ${rankOf(lab === A ? OLD_RANKS : RANKS, d.rank)} | ${d.streak ? d.streak.n : ''} | ${d.roles} | ${d.summaryLines && d.summaryLines.length ? (tm ? 'yes' : 'no') : '(no summary)'} |`);
    }
  }
}

// per-game pacing (the first time, newLink's morning; the repeat, the binger's third morning): the game's own floor time,
// the decisions, the waits between decisions (the game's own choreography), the wait before the first decision
{
  const first = b.newLink && b.newLink.games, rep = b.binger && b.binger.games;
  if (first) {
    const third = rep ? rep.filter((g) => g.id !== 'korbanot' && g.id !== 'musaf' && g.id !== 'aravot' && g.id !== 'shoevah') : [];
    const lastOf = (id) => { const xs = third.filter((g) => g.id === id); return xs.length >= 3 ? xs[xs.length - 1] : null; };
    console.log('\n**Per-game pacing** (floor seconds · decisions · waits between decisions, s; first time = newLink after, repeat = the binger\'s third morning)\n');
    console.log('| game | first: floor s | decisions | waits s | repeat: floor s | repeat: waits s |');
    console.log('|---|---|---|---|---|---|');
    for (const g of first) {
      if (g.id === 'korbanot') continue;
      const r = lastOf(g.id);
      console.log(`| ${g.id} | ${g.floor} | ${g.inputs} | ${g.waits} | ${r ? r.floor : ''} | ${r ? r.waits : ''} |`);
    }
  }
}
