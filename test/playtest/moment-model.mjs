// Key moments, round 3 (HOOKS agent): what each of the fifteen Phase A moments costs a player, first time and again.
// Input: the probe's measurements of the real moments played by the suites' solvers (test/playtest/probe-preload.cjs on
// test/moments.cjs --harness and test/game-harness.cjs): the floor (animations + the solver's machine-speed input), the
// inputs, the steps (every new hint), and the words shown (hints, the end card). On top of the floor, the Keystroke-Level
// Model (Card, Moran & Newell 1980: M = 1.35 s to prepare a step, K ≈ 0.2 s a key) with touch pointing ~0.6 s a target,
// and reading at the persona's speed. A model on measured data (docs/PLAYTEST.md round 3), not a claim about people.
//   node test/playtest/moment-model.mjs      → a table + test/out/playtest/moments-model.json
import fs from 'node:fs';
const OUT = new URL('../out/playtest/', import.meta.url);
const read = (f) => { try { return JSON.parse(fs.readFileSync(new URL(f, OUT), 'utf8')); } catch (e) { return []; } };
const recs = [...read('harness-probe.json'), ...read('moments-probe.json')].filter((r) => r.tEnd != null && r.skipped === false);
const byTitle = {};
for (const r of recs) if (!byTitle[r.title]) byTitle[r.title] = r;
const STAGE = { 'האבן הגדולה': 'har', 'הנדבך הראשון': 'wall', 'שלוש עשרה הפרצות': 'sorag', 'שבעת השערים': 'gates', 'לשכת העצים': 'nashim', 'הסערה והמעלות': 'nikanor', 'אבן גזית': 'lishka', 'בלי ברזל': 'yesod', 'חוט הסיקרא': 'sovev', 'הכבש והסיד': 'guf', 'הקרנות והאש הראשונה': 'karnot', 'שנים עשר הדדים': 'kiyor', 'המלתראות וגפן הזהב': 'ulam', 'הבית בזהב': 'heichal', 'האומנים בתיבות': 'kodesh' };
const ORDER = Object.keys(STAGE);
const P = {
  first: { wpm: 160, M: 1.35, point: 0.6, endCap: 20 },       // a curious adult, first time: reads each hint, prepares each step
  child: { wpm: 90, M: 1.8, point: 0.45, miss: 1.3, hintCap: 2.5, endCap: 2 },   // reads a little of each hint, misses some
  again: { M: 0.4, point: 0.3, end: 1.5 },                    // the second play: knows what to do, glances at the card
};
const rows = [];
for (const title of ORDER) {
  const r = byTitle[title]; if (!r) { rows.push({ title, stage: STAGE[title], missing: true }); continue; }
  const floor = r.tEnd / 1000, inputs = r.taps + r.keys, steps = r.hints.length;
  const hintW = r.hints.reduce((a, h) => a + h.w, 0), endW = r.srcWords + r.doneWords;
  const first = floor + steps * P.first.M + inputs * P.first.point + (hintW / P.first.wpm) * 60 + Math.min(P.first.endCap, (endW / P.first.wpm) * 60) + 1;
  const child = floor + steps * P.child.M + inputs * P.child.point * P.child.miss + r.hints.reduce((a, h) => a + Math.min(P.child.hintCap, (h.w / P.child.wpm) * 60), 0) + P.child.endCap;
  const again = floor + steps * P.again.M + inputs * P.again.point + P.again.end;
  const readShare = ((hintW / P.first.wpm) * 60 + Math.min(P.first.endCap, (endW / P.first.wpm) * 60)) / first;
  rows.push({ title, stage: STAGE[title], floor: +floor.toFixed(1), inputs, steps, hintW, endW, first: Math.round(first), child: Math.round(child), again: Math.round(again), readPct: Math.round(100 * readShare), chore: again >= 12 && (inputs >= 10 || steps >= 7) });
}
const ok = rows.filter((x) => !x.missing);
const sum = (k) => ok.reduce((a, x) => a + x[k], 0);
const res = { rows, total: { first: sum('first'), child: sum('child'), again: sum('again'), inputs: sum('inputs'), words: sum('hintW') + sum('endW') }, n: ok.length };
fs.writeFileSync(new URL('moments-model.json', OUT), JSON.stringify(res, null, 1));
console.log('moment                 stage    floor  inputs steps  words(hint/end)  first  child  again  read%  chore-on-replay');
for (const x of rows) {
  if (x.missing) { console.log(`${x.title.padEnd(22)} ${x.stage.padEnd(8)}  (not measured)`); continue; }
  console.log(`${x.title.padEnd(22)} ${x.stage.padEnd(8)} ${String(x.floor).padStart(5)}s ${String(x.inputs).padStart(6)} ${String(x.steps).padStart(5)}  ${String(x.hintW).padStart(6)}/${String(x.endW).padEnd(6)}  ${String(x.first).padStart(5)}s ${String(x.child).padStart(5)}s ${String(x.again).padStart(5)}s ${String(x.readPct).padStart(5)}%  ${x.chore ? 'yes' : ''}`);
}
console.log(`\n${res.n}/15 measured · all first plays ${Math.round(res.total.first / 60 * 10) / 10} min (child ${Math.round(res.total.child / 60 * 10) / 10} min) · all again ${Math.round(res.total.again / 60 * 10) / 10} min · ${res.total.inputs} inputs · ${res.total.words} words`);
