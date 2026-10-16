// Before/after tables for docs/HOOKS.md and docs/PLAYTEST.md, from the playtest outputs:
//   node test/playtest/report.mjs [--before=baseline] [--after=after]
// reads test/out/playtest/sim-<label>.json and dom-<label>.json (run sim.mjs and dom-bots.cjs with those labels first)
import fs from 'node:fs';
const args = process.argv.slice(2);
const B = (args.find((a) => a.startsWith('--before=')) || '--before=baseline').slice(9);
const A = (args.find((a) => a.startsWith('--after=')) || '--after=after').slice(8);
const rd = (f) => { try { return JSON.parse(fs.readFileSync(new URL(`../out/playtest/${f}`, import.meta.url), 'utf8')); } catch (e) { return null; } };
const sb = rd(`sim-${B}.json`), sa = rd(`sim-${A}.json`), db = rd(`dom-${B}.json`), da = rd(`dom-${A}.json`);
const f = (v, u = '') => (v == null ? '–' : `${v}${u}`);
const mmss = (s) => (s == null ? 'never' : `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}`);

if (sb && sa) {
  console.log('\n### Simulator (the real rules, persona bots, virtual clock)\n');
  console.log('| persona | meaningful play | dead | hollow taps | longest dull stretch | decisions/min | wall finished at | sessions ending with a timer |');
  console.log('|---|---|---|---|---|---|---|---|');
  for (const k of Object.keys(sb.personas)) {
    const b = sb.personas[k].metrics, a = sa.personas[k] && sa.personas[k].metrics;
    if (!a) continue;
    console.log(`| ${k} | ${b.meaningfulPct}% → **${a.meaningfulPct}%** | ${b.deadPct}% → **${a.deadPct}%** | ${b.hollowPct}% → **${a.hollowPct}%** | ${b.longestDeadS} s → **${a.longestDeadS} s** | ${b.decisionsPerMin} → **${a.decisionsPerMin}** | ${mmss(b.wallDoneS)} → **${mmss(a.wallDoneS)}** | ${b.exitWithTimerPct}% → **${a.exitWithTimerPct}%** |`);
  }
  console.log('\nBoredom maps (one glyph a minute: █ build · ★ key moment · ▤ card · ◆ decision · ◎ collect · ✎ learn · ◉ watch · ░ hollow taps · · dead)\n');
  for (const k of Object.keys(sb.personas)) {
    const b = sb.personas[k], a = sa.personas[k];
    console.log(`- **${b.label}**`);
    b.sessions.slice(0, 6).forEach((s, i) => console.log(`  - before s${i + 1} d${s.day}: \`${s.map}\``));
    if (a) a.sessions.slice(0, 6).forEach((s, i) => console.log(`  - after  s${i + 1} d${s.day}: \`${s.map}\``));
  }
}
if (db && da) {
  console.log('\n### DOM bots (the real HUD, persona bots, virtual clock)\n');
  console.log('| persona | first strike | first boulder | crew | Mount done | wall started → done | strikes (perfect) | pill says "waiting" | dead | rest card | hooks events |');
  console.log('|---|---|---|---|---|---|---|---|---|---|---|');
  for (const k of ['firstTimer', 'child', 'investor', 'returner', 'binger']) {
    const b = db[k] && db[k].metrics, a = da[k] && da[k].metrics;
    if (!a && !b) continue;
    const cell = (fn) => `${b ? fn(b) : '–'} → **${a ? fn(a) : '–'}**`;
    console.log(`| ${k} | ${cell((m) => f(m.firstStrikeS, ' s'))} | ${cell((m) => f(m.firstBoulderS, ' s'))} | ${cell((m) => f(m.crewS, ' s'))} | ${cell((m) => mmss(m.harDoneS))} | ${cell((m) => `${mmss(m.wallStartS)}→${mmss(m.wallDoneS)}`)} | ${cell((m) => `${m.strikes} (${m.perfectPct}%)`)} | ${cell((m) => `${m.blockedPillPct}%`)} | ${cell((m) => `${m.deadS} s`)} | ${a ? mmss(a.firstRestCardS) : '–'} | ${a ? JSON.stringify(a.hooks || {}) : '–'} |`);
  }
  for (const k of ['investor']) {
    const b = db[k], a = da[k];
    if (!b || !a) continue;
    console.log(`\nInvestor, 5 minutes. Before: sites done ${b.metrics.stagesDone.length}, moments ${b.metrics.moments.map((m) => m.kind).join(', ')}, shows ${b.metrics.wows.join(' ')}.`);
    console.log(`After: sites done ${a.metrics.stagesDone.length}, moments ${a.metrics.moments.map((m) => m.kind).join(', ')}, shows ${a.metrics.wows.join(' ')}.`);
  }
}

/* --logs: the raw per-persona logs for docs/PLAYTEST.md (key events with virtual timestamps, pill samples, shots) */
if (args.includes('--logs')) {
  const KEY = new Set(['start', 'ftue', 'crew', 'name', 'boulder', 'momentStart', 'moment', 'stageStart', 'stageDone', 'chapter', 'caravanStart', 'caravanBack', 'collect', 'ftueDone', 'welcome', 'restCard', 'hint', 'highlight', 'finale', 'festival', 'quarryEnough', 'leaf']);
  const fmtT = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;
  for (const [lab, d] of [[B, db], [A, da]]) {
    if (!d) continue;
    for (const k of ['firstTimer', 'child', 'investor', 'returner', 'binger']) {
      const r = d[k]; if (!r) continue;
      console.log(`\n#### ${r.label} · ${lab}\n`);
      const shots = fs.readdirSync(new URL('../out/playtest/', import.meta.url)).filter((f) => f.startsWith(`${lab}-${k}-`) && f.endsWith('.png'));
      if (shots.length) console.log(`Screenshots: ${shots.map((f) => '`test/out/playtest/' + f + '`').join(', ')}\n`);
      console.log('Events (virtual time m:ss):');
      console.log('```');
      let boulders = 0;
      for (const e of r.log) {
        if (!KEY.has(e.type)) continue;
        if (e.type === 'boulder') { boulders++; if (boulders > 2 && e.d && e.d.left > 0) continue; }
        if (e.type === 'leaf') continue;
        console.log(`${fmtT(e.t).padStart(7)}  ${e.type}${e.d !== undefined && e.d !== null ? ' ' + JSON.stringify(e.d).slice(0, 90) : ''}`);
      }
      console.log('```');
      console.log('Goal pill (and strip), sampled:');
      console.log('```');
      let last = '';
      for (const s of r.bot.samples) {
        const line = `${s.pill}${s.strip ? '   ‖ strip: ' + s.strip : ''}${s.modal ? '   ‖ card: ' + s.modal : ''}${s.coach ? '   ‖ coach: ' + s.coach.slice(0, 60) : ''}`;
        const shape = line.replace(/\d+:\d\d(:\d\d)?/g, '#').replace(/\d+%/g, '%');   // a moving countdown or % is one line
        if (shape === last) continue;
        last = shape;
        console.log(`${fmtT(s.t).padStart(7)}  ${line.replace(/[⁦⁩]/g, '')}`);
      }
      console.log('```');
      const m = r.metrics;
      console.log(`Summary: strikes ${m.strikes} (${m.perfectPct}% perfect), taps ${m.taps}, idle ${m.idleS} s, dead ${m.deadS} s, hollow ${m.hollowS} s, pill "waiting" ${m.blockedPillPct}% of samples, moments ${JSON.stringify(m.moments)}${m.hooks ? ', hooks ' + JSON.stringify(m.hooks) : ''}.`);
    }
  }
}
