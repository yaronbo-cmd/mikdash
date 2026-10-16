// Economy simulator v6 (docs/BUILD.md §3): headless players run the real rules (src/game/state.js) session by session:
// the pre-step match-3 (modelled: ~3.5 minutes, a yield of about one step), strokes on the site, key stones, inspections,
// the key moments, crews over real time. It reports the pacing against the owner's target (the whole Temple in weeks,
// ≈150–250 levels; the first session sets the Mount's first course).
//   node test/game-sim.mjs            → table + a JSON summary in test/out/game-sim.json
//   node test/game-sim.mjs --check    → exit 1 if the regular player misses 20–45 days or 150–250 levels, or the first session
//                                       sets no course
import * as S from '../src/game/state.js';
import { CHAPTERS, PROJ } from '../src/game/content.js';
import * as SHOP from '../src/game/shop.js';   // ── econ14 ── ── /econ14 ──
import fs from 'node:fs';

const MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const START = Date.UTC(2026, 9, 4, 5, 0);      // a Sunday, 08:00 in Jerusalem

/* sessions: local hours of the visits · mins: minutes of play per visit · perfect: share of perfect strokes ·
 * win: share of levels won · levelMin: minutes per level · keyQ: [min, max] quality of a key stone by hand */
const PLAYERS = {
  regular: { sessions: [8, 13, 20], mins: 10, perfect: 0.35, win: 0.8, levelMin: 3.5, keyQ: [0.35, 1] },
  heavy: { sessions: [7, 9, 11, 13, 15, 17, 19, 21], mins: 15, perfect: 0.5, win: 0.9, levelMin: 3.2, keyQ: [0.5, 1] },
  light: { sessions: [20], mins: 10, perfect: 0.2, win: 0.7, levelMin: 4, keyQ: [0.3, 1] },
};
const T = { stroke: 0.9 / 60, walk: 3 / 60, key: 20 / 60, lift: 6 / 60, check: 10 / 60, inspect: 15 / 60, moment: 1.5, pay: 2 / 60 };   // minutes

/* a match-3 level's result, as MATCH3's levels measured it (bus/FUN.md 11:18: level 1 → 52 / 90 at 3★, level 10 → 86 / 116,
   level 21 → 104 / 136): about two segments; three stars leave a surplus; a loss keeps 60 % of it */
const fieldLv = {};
function level(need, P, stats) {
  const won = Math.random() < P.win, stars = won ? (Math.random() < 0.3 ? 3 : 1 + Math.floor(Math.random() * 2)) : 0;
  const keys = Object.keys(need).filter((k) => k !== 'silver'), main = keys[0] || 'stone';
  const f = { stone: 'quarry', wstone: 'quarry', cedar: 'forest', gold: 'gold', bronze: 'gold' }[main] || 'quarry';
  const lv = (fieldLv[f] = fieldLv[f] || 1);
  const y = Math.min(110, 52 + 3.5 * (lv - 1)) * (stars === 3 ? 1.3 : 1) * (won ? 1 : 0.6);
  const out = {};
  for (const k of keys.length ? keys : ['stone']) out[k] = Math.round(y);
  out.silver = (need.silver ? need.silver : 0) + 3 + stars * 2;
  stats.levels++; if (won) { stats.wins++; fieldLv[f] = lv + 1; }
  return { won, stars, collected: out };
}

// ── econ14 ── (D2) the coins: FUN14's J jobs a course (J = clamp(round(10 / C), 1, 3)), each paid stars × (level + 2) at the
// player's hand (keyQ), a course end +5, the moment ×2; she buys the cheapest thing she can once the mentor has said so
// (after her first pay). Reported: coins a stage, the minute of her first purchase, and the waits (the match-3's share).
const Jof = (id) => Math.max(1, Math.min(3, Math.round(10 / PROJ[id].C)));
let eSeed = 7; const eRand = () => { eSeed = (eSeed * 48271) % 2147483647; return (eSeed - 1) / 2147483646; };   // (its own stream: the pay never shifts the levels' draws)
function econCourse(G, id, P, stats, m) {
  const lv = Math.min(3, 1 + Math.floor((stats.econ.jobs || 0) / 30));            // three ★★★ raise a job: about a level an act
  for (let k = 0; k < Jof(id); k++) { const q = P.keyQ[0] + eRand() * (P.keyQ[1] - P.keyQ[0]); stats.econ.coins += S.payJob(G, { id, level: lv, q }).coins; stats.econ.jobs = (stats.econ.jobs || 0) + 1; }
  stats.econ.coins += S.payCourse(G).coins;
  econShop(G, stats, m);
}
const econDone = (c, stats) => { if (c && c.rewards && c.rewards.silver) stats.econ.coins += c.rewards.silver; };   // a stage's REWARD (and its chapter's bonus) in coins
function econShop(G, stats, m) {
  if (!stats.econ.shop) return;
  for (let g = 0; g < 4; g++) {
    const site = S.buildingSites(G).find((id) => G.st[id].p === 'courses') || null, c = SHOP.cheapest(G, { site });
    if (!c || (G.res.silver || 0) < c.price + 20) return;                         // (she keeps a little for the next survey)
    const r = SHOP.buy(G, c.k, { site }); if (!r.ok) return;
    stats.econ.bought++; stats.econ.spent += r.price;
    if (stats.econ.first == null) stats.econ.first = stats.min.total + m;
  }
}
// ── /econ14 ──
function session(G, t, P, stats, first) {
  S.settle(G, t);
  if (S.dailyCheck(G, t, () => false)) S.gain(G, { silver: 50, gold: 10, cedar: 10 });   // FUN's orders: ≤ 5 a day, ≈ 90 silver's worth
  // crews: sites whose job crews can do first, the rest to the quarry
  const b = S.buildingSites(G);
  const work = b.filter((id) => { const j = S.jobOf(G, id); return j && (j.crew || j.kind === 'boulders'); });
  G.crews.forEach((c, i) => { c.at = work.length ? work[i % work.length] : (S.isDone(G, 'har') ? 'quarry' : null); });
  if (S.isDone(G, 'har') && G.crews.length > work.length + 1) G.crews[G.crews.length - 1].at = 'quarry';
  // priests for the House
  while (G.trainOn && G.train.length < G.trainSlots && G.priests + G.train.length < 10 && S.startTraining(G, t).ok) stats.trained++;
  for (let k = 0; k < 3; k++) { const q = S.quizToday(G, t); if (!q) break; S.answerQuiz(G, q.id, Math.random() < 0.75 ? q.ok : (q.ok + 1) % 3, t); }
  let m = 0, courses0 = stats.courses;
  for (let guard = 0; guard < 5000 && m < P.mins; guard++) {
    const a = S.nextAction(G);
    const tt = t + m * MIN;
    if (a.kind === 'done' || a.kind === 'none') break;
    if (a.kind === 'moment') { const c = S.momentDone(G, a.id); if (c) { stats.done[c.id] = tt; econDone(c, stats); stats.econ.coins += S.payMoment(G, P.keyQ[1] * 0.85).coins; } m += T.moment; stats.min.moment += T.moment; continue; }
    if (a.kind === 'key') { const q = P.keyQ[0] + Math.random() * (P.keyQ[1] - P.keyQ[0]); const r = S.setKey(G, a.id, { quality: q, perfect: q > 0.9 }); stats.keys++; if (r.course) { stats.courses++; econCourse(G, a.id, P, stats, m); } m += T.key; stats.min.build += T.key; if (r.course && S.checkDue(G, a.id)) { const c = S.courseCheck(G, a.id); stats.resets += c.bad.length; m += T.check; stats.min.build += T.check; } continue; }
    if (a.kind === 'inspect') { const r = S.inspect(G, a.id); stats.resets += r.bad.length; if (r.reached === 'done') { const c = S.completeStage(G, a.id); if (c) { stats.done[c.id] = tt; econDone(c, stats); } } m += T.inspect; stats.min.build += T.inspect; continue; }
    if (a.kind === 'build') { S.payStep(G, a.id); m += T.pay; stats.min.manage += T.pay; continue; }
    if (a.kind === 'start') { S.startBuild(G, a.id); m += T.pay; stats.min.manage += T.pay; continue; }
    if (a.kind === 'play') { const r = level(a.need, P, stats); S.grantLevel(G, r, a.need); m += P.levelMin; stats.min.m3 += P.levelMin; continue; }
    if (a.kind === 'priests') { const need = { silver: 20 }; const r = level(need, P, stats); S.grantLevel(G, r, need); m += P.levelMin; stats.min.m3 += P.levelMin; continue; }
    // a stroke (work / event)
    const j = S.jobOf(G, a.id);
    if (j && j.kind === 'boulders') { const i = S.pickBoulder(G.bh); S.hitBoulder(G, i, Math.random() < P.perfect ? 2 : 1); m += T.stroke; stats.min.build += T.stroke; stats.strokes++; continue; }
    // a segment's first stone: the player's quick crane lift (FUN, ~6 s)
    const r = j && j.kind === 'stone' && j.i % 8 === 0 && !(G.st[a.id].k > 0) ? S.quickSet(G, a.id) : S.stroke(G, a.id, Math.random() < P.perfect);
    if (!r.ok) break;
    if (r.lift) { m += T.lift; stats.min.build += T.lift; stats.lifts++; if (r.course) { stats.courses++; econCourse(G, a.id, P, stats, m); } if (r.course && S.checkDue(G, a.id)) { const c = S.courseCheck(G, a.id); stats.resets += c.bad.length; m += T.check; stats.min.build += T.check; } if (r.reached === 'done') { const c = S.completeStage(G, a.id); if (c) { stats.done[c.id] = tt; econDone(c, stats); } } else if (r.reached === 'ready') { const c = S.momentDone(G, a.id); if (c) { stats.done[c.id] = tt; econDone(c, stats); } } continue; }
    if (r.course && S.checkDue(G, a.id)) { const c = S.courseCheck(G, a.id); stats.resets += c.bad.length; m += T.check; stats.min.build += T.check; }
    stats.strokes++; if (r.course) { stats.courses++; econCourse(G, a.id, P, stats, m); }
    m += T.stroke + (r.stones.length ? T.walk / 4 : 0); stats.min.build += T.stroke;
    if (r.reached === 'done') { const c = S.completeStage(G, a.id); if (c) { stats.done[c.id] = tt; econDone(c, stats); } }
    else if (r.reached === 'ready') { const c = S.momentDone(G, a.id); if (c) { stats.done[c.id] = tt; econDone(c, stats); stats.econ.coins += S.payMoment(G, P.keyQ[1] * 0.85).coins; } m += T.moment; stats.min.moment += T.moment; }
  }
  if (first) stats.firstCourses = stats.courses - courses0;
  S.settle(G, t + m * MIN);
  stats.min.total += m;
}

function run(name, P, seed = 1, shop = false) {
  eSeed = 7;   // ── econ14 ──
  let s = seed; Math.random = () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  const G = S.fresh(START);
  G.ftue = 99;
  S.startBuild(G, 'har'); G.crews.push({ at: 'har' });                     // the tutorial: the Mount started, the first crew
  for (const k of Object.keys(fieldLv)) delete fieldLv[k];
  const stats = { done: {}, trained: 0, strokes: 0, lifts: 0, keys: 0, resets: 0, courses: 0, levels: 0, wins: 0, firstCourses: 0, min: { m3: 0, build: 0, manage: 0, moment: 0, total: 0 }, econ: { coins: 0, jobs: 0, bought: 0, spent: 0, first: null, shop } };   // (── econ14 ── econ)
  let day = 0;
  for (; day < 80 && !S.allDone(G); day++) {
    for (let k = 0; k < P.sessions.length; k++) {
      const t = START + day * DAY + (P.sessions[k] - 8) * HOUR;          // START is 08:00 local
      session(G, t, P, stats, day === 0 && k === 0);
      if (S.allDone(G)) break;
    }
  }
  const ch = {};
  for (const c of CHAPTERS) { const ts = c.stages.map((id) => stats.done[id]).filter(Boolean); ch[c.id] = ts.length === c.stages.length ? +((Math.max(...ts) - START) / DAY + 1).toFixed(1) : null; }
  const pctOf = (k) => Math.round((100 * stats.min[k]) / Math.max(1, stats.min.total));
  return {
    name, days: S.allDone(G) ? +(((Math.max(...Object.values(stats.done)) - START) / DAY) + 1).toFixed(1) : null, chapters: ch,
    levels: stats.levels, wins: stats.wins, strokes: stats.strokes, keys: stats.keys, resets: stats.resets, firstCourses: stats.firstCourses,
    share: { m3: pctOf('m3'), build: pctOf('build'), manage: pctOf('manage'), moment: pctOf('moment') }, hours: +(stats.min.total / 60).toFixed(1),
    econ: { perStage: Math.round(stats.econ.coins / Object.keys(stats.done).length || 0), first: stats.econ.first == null ? null : +stats.econ.first.toFixed(1), bought: stats.econ.bought, spent: stats.econ.spent, left: Math.floor(G.res.silver), tre: (G.econ && G.econ.tre) || 0 },   // ── econ14 ──
  };
}

const out = Object.entries(PLAYERS).map(([n, P]) => run(n, P));
// ── econ14 ── the same players again, now spending their coins in אוצר המלאכה (the machines speed the crews and the quarry)
const shopOut = Object.entries(PLAYERS).map(([n, P]) => run(n, P, 1, true));   // ── /econ14 ──
console.log('player   done(day)  ch1   ch2   ch3   ch4  levels strokes keys resets hours  m3% build% 1st-session-courses');
for (const r of out) console.log(`${r.name.padEnd(8)} ${String(r.days).padStart(8)}  ${[1, 2, 3, 4].map((c) => String(r.chapters[c]).padStart(5)).join(' ')}  ${String(r.levels).padStart(6)} ${String(r.strokes).padStart(7)} ${String(r.keys).padStart(4)} ${String(r.resets).padStart(6)} ${String(r.hours).padStart(5)}  ${String(r.share.m3).padStart(3)} ${String(r.share.build).padStart(6)} ${String(r.firstCourses).padStart(4)}`);
console.log(`(stages: ${Object.keys(PROJ).length}; regular ${out[0].days} days, heavy ${out[1].days} days)`);
for (const r of shopOut) console.log(`${r.name.padEnd(8)} + shop: coins a stage ${r.econ.perStage} · first purchase at minute ${r.econ.first} · bought ${r.econ.bought} (${r.econ.spent} coins) · left ${r.econ.left} · the treasurer ${r.econ.tre} · waits (m3) ${r.share.m3}% · ${r.levels} levels · ${r.days} days`);   // ── econ14 ──
fs.mkdirSync(new URL('./out/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('./out/game-sim.json', import.meta.url), JSON.stringify({ when: new Date().toISOString(), targets: { regular: '20–45 days, 125–250 levels', firstSession: '≥ 1 course', econ: '≈ 150–180 coins a stage, first purchase ≤ minute 8, waits ≤ v26' }, out, shopOut }, null, 1));
if (process.argv.includes('--check')) {
  const reg = out.find((r) => r.name === 'regular'), hv = out.find((r) => r.name === 'heavy');
  // (build7: a 3★ board pays a third segment, the owner's default ⚑1 — ≈ 10 % fewer boards: the floor 150 → 125)
  const ok = reg.days >= 20 && reg.days <= 45 && reg.levels >= 125 && reg.levels <= 250 && hv.days >= 5 && reg.firstCourses >= 1
    // ── econ14 ── ≈ 150–180 coins a stage; her first purchase by minute 8; the waits (the match-3's share) not above v26's 68 %
    && (() => { const e = shopOut[0]; return e.econ.perStage >= 140 && e.econ.perStage <= 190 && e.econ.first != null && e.econ.first <= 8 && e.share.m3 <= 68 && reg.share.m3 <= 68; })();
  console.log(ok ? 'pacing OK' : 'pacing OUT OF RANGE');
  process.exit(ok ? 0 : 1);
}
