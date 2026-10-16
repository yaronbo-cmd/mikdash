// Model-based playtest (HOOKS agent): persona bots play the REAL Phase A rules (src/game/state.js) on a virtual
// clock, second by second, and every second of play is classified. The output is a boredom map per persona and
// the hook metrics of docs/HOOKS.md §4 (time to first build, dead time, reward and novelty cadence, goal clarity,
// the state at exit, "why come back?").
//   node test/playtest/sim.mjs                 summary table + test/out/playtest/sim-<label>.json
//   node test/playtest/sim.mjs --label=after   (file suffix; default 'now')
//   node test/playtest/sim.mjs --map           also print the minute-by-minute boredom maps
// The UI is not simulated here (see test/playtest/dom-bots.cjs for the real HUD): reading a card, playing a key
// moment and making a decision are modelled as time spent (per persona), using the durations measured in the DOM bots.
process.env.TZ = 'Asia/Jerusalem';
import * as S from '../../src/game/state.js';
import { STAGES, stageById, ROUTES, RIDX, TRAIN, CHAPTERS } from '../../src/game/content.js';
import fs from 'node:fs';
import { restState } from '../../src/game/hooks/next.js';
import * as NX from '../../src/game/hooks/next.js';
// (round 3) the idle-crew cue (src/game/hooks/index.js): crews waiting 30 s at a blocked site → one toast (3 in all, 10 min
// apart) with one tap to move them; a persona that follows suggestions takes it (the child does not read toasts)
const CUE = typeof NX.idleCrews === 'function' && !process.argv.includes('--no-cue');

const SEC = 1000, MIN = 60 * SEC, HOUR = 60 * MIN, DAY = 24 * HOUR;
const START = new Date('2026-10-04T08:00:00+03:00').getTime();   // a Sunday morning in Jerusalem (after Sukkot)
const args = process.argv.slice(2);
const LABEL = (args.find((a) => a.startsWith('--label=')) || '--label=now').slice(8);

/* ── classes of a second of play ── */
// build: a strike or a crew-visible step that moved a site · moment: a key moment · read: a card · decide: a sheet
// decision (caravan, crew, start) · collect · learn: the Middot book / quiz · watch: the welcome timelapse ·
// hollow: tapping with no meaningful result (stone nobody needs) · dead: nothing meaningful to do
const CLASSES = ['build', 'moment', 'read', 'decide', 'collect', 'learn', 'watch', 'hollow', 'dead'];
const MEANINGFUL = new Set(['build', 'moment', 'read', 'decide', 'collect', 'learn', 'watch']);

/* ── personas (durations in seconds; spm = taps a minute; perfect = share of perfect strikes) ── */
export const PERSONAS = {
  firstTimer: { label: 'the curious first-timer', plan: [{ day: 0, h: 19.5, min: 20 }], spm: 34, perfect: 0.25, read: 7, moment: 24, decide: 5, explore: true, smartCrews: false, idle: 'explore', lens: 'short' },
  busyAdult: { label: 'the busy adult (3 × 5 min a day, 7 days)', plan: week([8, 13, 21], 5, 7), spm: 38, perfect: 0.35, read: 4, moment: 18, decide: 4, smartCrews: true, idle: 'leave', lens: 'fit', quiz: true },
  binger: { label: 'the binger (one hour)', plan: [{ day: 0, h: 20, min: 60 }], spm: 44, perfect: 0.5, read: 5, moment: 16, decide: 4, explore: true, smartCrews: true, idle: 'grind', lens: 'short', quiz: true },
  returner: { label: 'the returner (day 1, then back after 3 days)', plan: [{ day: 0, h: 9, min: 8 }, { day: 0, h: 21, min: 6 }, { day: 3, h: 20, min: 10 }], spm: 38, perfect: 0.35, read: 4, moment: 18, decide: 4, smartCrews: true, idle: 'leave', lens: 'long', quiz: true },
  child: { label: 'the child (10–12: taps a lot, reads little)', plan: [{ day: 0, h: 16, min: 15 }], spm: 66, perfect: 0.15, read: 1.5, moment: 30, decide: 6, smartCrews: false, idle: 'mash', lens: 'coach', skipsBook: true },
  investor: { label: 'the investor (demo ×60, 5 minutes)', demo: true, plan: [{ day: 0, h: 11, min: 5 }], spm: 40, perfect: 0.3, read: 3, moment: 10, decide: 3, smartCrews: true, idle: 'leave5', lens: 'short' },
};
function week(hours, min, days) { const p = []; for (let d = 0; d < days; d++) for (const h of hours) p.push({ day: d, h, min }); return p; }

/* ── the bot ── */
function rng(seed) { let s = seed; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
const restDay = () => false;              // (the week of the sim holds no Shabbat visit problem: Shabbat grace is tested in unit tests)

function neededRes(G) {
  const need = {};
  for (const s of STAGES) {
    const st = S.statusOf(G, s.id);
    if (st !== 'avail' && st !== 'building') continue;
    const from = st === 'building' ? G.st[s.id].ph : 0;
    for (let k = from; k < 3; k++) for (const [r, v] of Object.entries(s.cost[k])) need[r] = (need[r] || 0) + v;
  }
  for (const r of Object.keys(need)) need[r] = Math.max(0, need[r] - (G.res[r] || 0));
  return need;
}

export function runPersona(key, P, { seed = 7, hooks = null } = {}) {
  const rand = rng(seed);
  const G = S.fresh(START + P.plan[0].day * DAY + (P.plan[0].h - 8) * HOUR, { demo: !!P.demo });
  G.clock = G.lastSeen = G.created;
  const out = { key, label: P.label, sessions: [], events: [], firsts: {} };
  const seen = new Set();
  const first = (k, t) => { if (!seen.has(k)) { seen.add(k); out.firsts[k] = t; } };
  const book = { read: 0 };
  let tGame = 0;                                   // play seconds since the first session began (all sessions)
  const cue = { since: 0, at: -1e15, n: 0 };
  for (let si = 0; si < P.plan.length; si++) {
    const v = P.plan[si];
    const t0 = START + v.day * DAY + (v.h - 8) * HOUR;
    const ses = playSession(G, P, t0, v.min * MIN, { rand, first, out, si, book, tGame, hooks, cue });
    tGame += ses.secs.length;
    out.sessions.push(ses);
  }
  out.final = { chapter: S.chapterOf(G), done: S.doneCount(G), vine: { ...G.vine }, streak: G.daily.streak, doneDay: out.firsts['stage:kodesh'] != null ? out.sessions.length : null };
  return out;
}

function playSession(G, P, t0, durMs, C) {
  const { rand, first, out } = C;
  const secs = [];                     // one class per second
  const ev = [];                       // {s, k, d}
  const E = (s, k, d) => { ev.push({ s, k, d }); out.events.push({ si: C.si, s, k, d }); };
  let t = t0;
  const endT = t0 + durMs;
  const awayMs = t - G.clock;
  const snap = S.snapshot(G);
  const rep = S.settle(G, t);
  const daily = S.dailyCheck(G, t, restDay);
  let busy = [];                        // queued activities: {cls, s} (seconds left)
  const queue = (cls, s, label) => { if (s > 0) busy.push({ cls, s, label }); };
  // arrival: the welcome report (≥ 90 s away) and its timelapse
  if (awayMs >= S.WELCOME_MIN_S * 1000 && (Object.keys(rep.work).length || rep.done.length || rep.hits.length || S.carsBack(G, t) || daily)) {
    if (Object.keys(rep.work).length || rep.done.length || rep.hits.length) queue('watch', 4, 'timelapse');
    queue('read', P.read, 'welcome');
    E(0, 'welcome', { awayH: +(awayMs / HOUR).toFixed(1), work: Object.keys(rep.work), done: rep.done.map((c) => c.id), back: S.carsBack(G, t), capped: rep.capped });
  }
  if (daily) E(0, 'reward', { what: 'wage', streak: daily.streak });
  // (round 3) what waited for the player: key moments ready while away, caravans that arrived while away
  const aud = { waitingMoments: STAGES.filter((x) => G.st[x.id] && G.st[x.id].ready).map((x) => x.id), backOnArrival: S.carsBack(G, t), arrivedLive: 0, crewSecs: 0, idleCrewSecs: 0, idleByLack: {} };
  for (const c of rep.done) onComplete(c, 0, 'offline');
  let acc = 0, walk = 0, idleRun = 0, lastBoulder = -1, left = false, dead = 0;
  const ftue = G.ftue < 99 && !C.si ? { step: 0, t: 0 } : null;       // the first session plays the tutorial
  if (ftue) { queue('watch', 4, 'vision'); if (S.statusOf(G, 'har') === 'avail') S.startBuild(G, 'har'); first('firstSight', 0); }
  let crewDue = -1, storyDue = -1, idleRunS = 0, restPoint = null;

  function onComplete(c, s, how) {
    if (!c) return;
    E(s, 'reward', { what: 'stageDone', id: c.id, how });
    first('stage:' + c.id, C.tGame + s);
    if (!ftue || how !== 'offline') { queue('watch', stageById(c.id).quiet ? 1 : 3, 'celebrate'); queue('read', P.read, 'card'); }
    if (c.find) { queue('read', P.read * 0.8, 'find'); E(s, 'novelty', { what: 'find', id: c.find }); }
    if (c.momentFind) queue('read', P.read * 0.8, 'find');
    if (c.donor) { queue('read', P.read, 'donor'); E(s, 'novelty', { what: 'donor', id: c.donor }); }
    if (c.chapter) { queue('watch', 3, 'showcase'); queue('read', P.read * 1.3, 'chapter'); E(s, 'reward', { what: 'chapter', n: c.chapter }); E(s, 'novelty', { what: 'chapter', n: c.chapter }); }
    for (const r of c.routes || []) E(s, 'novelty', { what: 'route', id: r });
    if (c.crewsNow) E(s, 'reward', { what: 'crew', n: c.crewsNow });
    if (c.training) E(s, 'novelty', { what: 'training' });
    if (c.mishnayot && c.mishnayot.length) E(s, 'reward', { what: 'mishnayot', n: c.mishnayot.length });
    for (const st of STAGES) if (st.deps.includes(c.id) && S.statusOf(G, st.id) === 'avail') E(s, 'novelty', { what: 'siteOpens', id: st.id });
  }
  function taskHit(kind, s, n = 1) {
    const r = S.taskProgress(G, kind, n);
    if (r.leaf) E(s, 'reward', { what: 'leaf' });
    if (r.grape) E(s, 'reward', { what: 'grape' });
    if (r.cluster) E(s, 'reward', { what: 'cluster' });
  }
  function sendCaravans(s) {
    const need = neededRes(G);
    let n = 0;
    for (let guard = 0; guard < 4 && S.carFree(G) > 0; guard++) {
      let open = ROUTES.filter((R) => S.routeOpen(G, R.id) && !G.car.some((c) => c.r === R.id) && ((need[R.res] || 0) > 0 || (R.ftue && !G.carCount[R.id])));
      if (P.lens === 'coach') open = open.filter((R) => R.ftue && !G.carCount[R.id]);           // the child sends only what the coach points to
      if (!open.length) break;
      open.sort((a, b) => (need[b.res] || 0) - (need[a.res] || 0));
      const R = open[0];
      const fresh1 = R.ftue && !G.carCount[R.id];
      let len = fresh1 ? 'ftue' : 'short';
      if (!fresh1 && P.lens === 'long') len = 'long';
      if (!fresh1 && P.lens === 'fit') len = R.long.min * 60000 / S.speedOf(G) <= nextVisitMs() ? 'long' : 'short';
      const r = S.startCaravan(G, R.id, len, t);
      if (!r.ok) break;
      n++;
      E(s, 'decision', { what: 'caravan', r: R.id, len });
      first('route:' + R.id, C.tGame + s);
      taskHit('caravan', s);
    }
    return n;
  }
  function nextVisitMs() {
    const plan = P.plan; const cur = plan[C.si], nx = plan[C.si + 1];
    return nx ? (nx.day - cur.day) * DAY + (nx.h - cur.h) * HOUR : 8 * HOUR;
  }
  function decide(s) {
    let n = 0;
    // collect
    for (let k = G.car.length - 1; k >= 0; k--) if (S.carState(G.car[k], t) === 'back') {
      const r = S.collectCaravan(G, k, t);
      if (r) { n++; queue('collect', 2, 'collect'); E(s, 'reward', { what: 'collect', r: r.r, n: r.n }); taskHit('collect', s); if (r.r === 'alexandria' && r.first && !G.story.nikanor) { G.story.nikanor = 1; queue('read', P.read * 3, 'nikanor story'); E(s, 'novelty', { what: 'story', id: 'nikanor' }); } }
    }
    const paid = S.unblock(G);
    for (const id of paid) E(s, 'reward', { what: 'phase', id });
    if (ftue && ftue.step < 6) return n;
    // start what is affordable (the goal pill first)
    for (let guard = 0; guard < 6; guard++) {
      const r = S.recommend(G);
      if (r.kind !== 'start') break;
      if (!S.startBuild(G, r.id).ok) break;
      n++; queue('decide', P.decide, 'start'); E(s, 'decision', { what: 'start', id: r.id }); first('start:' + r.id, C.tGame + s); E(s, 'novelty', { what: 'stageStart', id: r.id });
      if (ftue && r.id === 'wall') ftue.step = Math.max(ftue.step, 8);
    }
    if (P.explore || P.smartCrews) for (const st of STAGES) if (S.statusOf(G, st.id) === 'avail' && S.startBuild(G, st.id).ok) { n++; queue('decide', P.decide, 'start'); E(s, 'decision', { what: 'start', id: st.id }); E(s, 'novelty', { what: 'stageStart', id: st.id }); }
    // crews: a smart player moves crews off blocked sites (to working sites, else the quarry)
    if (P.smartCrews && S.isDone(G, 'har')) {
      const work = S.buildingSites(G).filter((id) => !S.blockOf(G, id));
      let moved = 0;
      G.crews.forEach((c, i) => { const want = work.length ? work[i % work.length] : 'quarry'; if (c.at !== want && !(c.at && work.includes(c.at))) { c.at = want; moved++; } });
      if (moved) { n++; queue('decide', P.decide, 'crews'); E(s, 'decision', { what: 'crews', moved }); }
    }
    // caravans
    if (P.lens !== 'coach' || (ftue && ftue.step >= 6)) { const k = sendCaravans(s); if (k) { n += k; queue('decide', P.decide, 'caravans'); } }
    // training and the quiz
    if (G.trainOn) {
      while (G.train.length < G.trainSlots && G.priests + G.train.length < 10 && S.startTraining(G, t).ok) { n++; queue('decide', 2, 'train'); E(s, 'decision', { what: 'train' }); first('train', C.tGame + s); }
      if (P.quiz) for (let k = 0; k < 3; k++) { const q = S.quizToday(G, t); if (!q) break; const r = S.answerQuiz(G, q.id, rand() < 0.8 ? q.ok : (q.ok + 1) % 3, t); queue('learn', 12, 'quiz'); if (r.correct) { E(s, 'reward', { what: 'quiz' }); taskHit('quiz', s); } }
    }
    return n;
  }

  const initial = decide(0);
  for (let s = 0; t < endT && !left; s++, t += SEC) {
    // the tutorial's scripted beats (index.js runFtue / ftueTo / ftueWatch)
    if (ftue) {
      if (ftue.step === 0 && s >= 4) { ftue.step = 1; first('coach', C.tGame + s); }
      if (ftue.step >= 1 && ftue.step < 3 && (S.bouldersLeft(G) <= 9 || G.stats.perfect >= 1 || s >= 49)) { ftue.step = 3; crewDue = s + 6; }
      if (crewDue > 0 && s >= crewDue) { crewDue = -1; if (!G.crews.length) G.crews.push({ at: 'har' }); E(s, 'reward', { what: 'crew', n: 1 }); E(s, 'novelty', { what: 'crew' }); first('crew', C.tGame + s); storyDue = s + 12.5; ftue.step = 4; }
      if (storyDue > 0 && s >= storyDue) { storyDue = -1; G.story.priests = 1; queue('read', P.read * 1.4, 'priests story'); queue('decide', P.decide * 1.6, 'name + mishmar'); E(s, 'novelty', { what: 'story', id: 'priests' }); ftue.step = 5; }
      if (ftue.step >= 5 && ftue.step < 6 && S.isDone(G, 'har') && !busy.length) { ftue.step = 6; decide(s); }
      if (ftue.step >= 6 && ftue.step < 8 && G.st.wall) ftue.step = 8;
      if (ftue.step === 8 && G.carCount.wagons) { ftue.step = 99; G.ftue = 99; E(s, 'ftueDone', {}); first('ftueDone', C.tGame + s); }
    }
    // the natural stopping point: the first time (after the tutorial) nothing could be done for 20 s in a row
    // (where the rest card comes; the baseline had no card, but the moment is the same)
    if (G.ftue >= 99 && restPoint == null) { if (restState(G, t).idle) { if (++idleRunS >= 20) { restPoint = s; E(s, 'restPoint', {}); } } else idleRunS = 0; }
    if (s % 10 === 0 && s) {
      for (const c of G.car) if (c.t1 > t - 10 * SEC && c.t1 <= t) aud.arrivedLive++;
      for (const c of G.crews) {
        if (!c.at || c.at === 'quarry') { aud.crewSecs += 10; continue; }
        aud.crewSecs += 10;
        const blk = S.blockOf(G, c.at);
        if (blk && blk.lack) { aud.idleCrewSecs += 10; for (const k of Object.keys(blk.lack)) aud.idleByLack[k] = (aud.idleByLack[k] || 0) + 10; }
      }
      if (CUE && G.ftue >= 99 && P.idle !== 'mash') {
        const idle = NX.idleCrews(G);
        if (idle.length) { if (!C.cue.since) C.cue.since = t; } else C.cue.since = 0;
        if (C.cue.since && t - C.cue.since >= 30 * SEC && t - C.cue.at >= 10 * MIN && C.cue.n < 3) {
          C.cue.since = 0; C.cue.at = t; C.cue.n++;
          let moved = 0; for (const c of idle) { const to = NX.crewTarget(G); if (to && S.assignCrew(G, c.i, to)) moved++; }
          E(s, 'decision', { what: 'idleCue', moved }); queue('decide', 2, 'idle cue');
        }
      }
      const r = S.settle(G, t);
      for (const c of r.done) onComplete(c, s, 'crew');
      if (r.ready.length) for (const id of r.ready) E(s, 'momentReady', { id });
    }
    if (busy.length) { const b = busy[0]; secs.push(b.cls); b.s -= 1; if (b.s <= 0) busy.shift(); continue; }
    // what the goal pill says now
    const rec = S.recommend(G);
    if (rec.kind === 'moment') {
      const d = stageById(rec.id);
      queue('moment', P.moment, 'moment');
      E(s, 'novelty', { what: 'moment', id: d.moment }); first('moment:' + d.moment, C.tGame + s);
      const c = S.momentDone(G, rec.id);
      if (c) { if (rec.id === 'har') { first('wow:greatStone', C.tGame + s); } onComplete(c, s + P.moment, 'moment'); }
      secs.push('moment');
      continue;
    }
    // back caravans are collected as soon as the badge shows (every persona does that)
    if (S.carsBack(G, t) && (P.lens !== 'coach' || !ftue || ftue.step >= 8)) { const n = decide(s); if (n) { secs.push('collect'); continue; } }
    if (rec.kind === 'build') {
      idleRun = 0;
      acc += P.spm / 60;
      let moved = false;
      while (acc >= 1) {
        acc -= 1;
        if (walk > 0) { walk -= 1; continue; }
        const perfect = rand() < P.perfect;
        const combo = S.noteStrike(G, perfect);
        taskHit('strikes', s); if (perfect) taskHit('perfect', s);
        if (rec.id === 'har') {
          const i = S.pickBoulder(G.bh);
          if (i !== lastBoulder) { lastBoulder = i; walk = 1; }   // a new boulder: the builder walks there (one strike's time)
          const h = S.hitBoulder(G, i, perfect ? 2 : 1);
          if (h.ok) { moved = true; if (h.shattered) { E(s, 'reward', { what: 'boulder', left: S.bouldersLeft(G) }); first('boulder', C.tGame + s); } }
          continue;
        }
        const a = S.addWork(G, rec.id, S.strikeValue(perfect, combo));
        if (a.added > 0) moved = true;
        if (a.paid) E(s, 'reward', { what: 'phase', id: rec.id });
        if (a.reached === 'done') onComplete(S.completeStage(G, rec.id), s, 'strike');
        if (a.reached) break;
      }
      if (moved) first('strike', C.tGame + s);
      secs.push('build');                     // (the builder is working a site that moves: a second between two strikes counts too)
      continue;
    }
    // nothing to build: decisions first
    if (rec.kind === 'start' || rec.kind === 'blocked' || rec.kind === 'priests' || rec.kind === 'none') {
      const n = decide(s);
      if (n) { secs.push('decide'); continue; }
    }
    // idle: the persona's habit
    idleRun++;
    const need = neededRes(G);
    if (!P.skipsBook && Object.keys(G.book.un).some((id) => !G.book.read[id]) && P.idle !== 'mash') {
      const id = Object.keys(G.book.un).find((x) => !G.book.read[x]);
      const r = S.readMishnah(G, id);
      if (r.first) { taskHit('learn', s); C.book.read++; }
      queue('learn', 18, 'mishnah'); secs.push('learn'); E(s, 'learn', { id });
      continue;
    }
    if (P.idle === 'grind' || P.idle === 'mash' || P.idle === 'explore') {
      if (S.isDone(G, 'har')) {
        // the quarry (the hero cuts stone): meaningful only if stone is short
        acc += P.spm / 60;
        while (acc >= 1) { acc -= 1; const perfect = rand() < P.perfect; S.noteStrike(G, perfect); G.res.stone += 3 * (perfect ? 2 : 1); taskHit('strikes', s); if (perfect) taskHit('perfect', s); }
        secs.push((need.stone || 0) > 0 ? 'build' : 'hollow');
      } else secs.push('dead');
      if (P.idle === 'explore' && idleRun > 90) { secs[secs.length - 1] = 'dead'; }
      continue;
    }
    secs.push('dead');
    dead++;
    if ((P.idle === 'leave' && idleRun >= 20) || (P.idle === 'leave5' && idleRun >= 30)) { left = true; E(s, 'leave', { why: 'nothing to do', rec: rec.kind }); }
  }
  // exit: timers running and the next meaningful event (what would bring the player back)
  S.settle(G, t);
  const timers = [];
  for (const c of G.car) timers.push({ what: 'caravan:' + c.r, ms: Math.max(0, c.t1 - t) });
  for (const tr of G.train) timers.push({ what: 'priest', ms: Math.max(0, tr.t1 - t) });
  for (const id of S.buildingSites(G)) {
    const n = S.crewsAt(G, id), blk = S.blockOf(G, id);
    if (!n || blk) continue;
    const d = stageById(id), s0 = G.st[id], cap = d.W * (s0.ph >= 3 ? 1 : [0, 0.15, 0.7][s0.ph]);
    timers.push({ what: (s0.ph >= 3 ? 'finish:' : 'phase:') + id, ms: S.gmMs(G, (cap - s0.w) / (d.crew * n)) });
  }
  const blocked = S.buildingSites(G).filter((id) => S.blockOf(G, id)).map((id) => ({ id, lack: (S.blockOf(G, id) || {}).lack }));
  aud.idleCrewsAtExit = G.crews.filter((c) => c.at && c.at !== 'quarry' && S.blockOf(G, c.at) && S.blockOf(G, c.at).lack).length;
  aud.crewsAtExit = G.crews.length;
  timers.sort((a, b) => a.ms - b.ms);
  const counts = Object.fromEntries(CLASSES.map((k) => [k, secs.filter((x) => x === k).length]));
  return {
    t0, day: Math.floor((t0 - START) / DAY), secs, ev, counts, left: left ? secs.length : null, initial, restPoint, aud,
    exit: { timers: timers.slice(0, 5).map((x) => ({ ...x, min: +(x.ms / MIN).toFixed(1) })), next: timers[0] ? +(timers[0].ms / MIN).toFixed(1) : null, blocked, rec: S.recommend(G), chapter: S.chapterOf(G), done: S.doneCount(G) },
  };
}

/* ── metrics ── */
export function metrics(r) {
  const all = r.sessions.flatMap((s) => s.secs);
  const tot = all.length || 1;
  const pc = (k) => +(100 * all.filter((x) => x === k).length / tot).toFixed(1);
  const rewards = r.events.filter((e) => e.k === 'reward');
  const nov = r.events.filter((e) => e.k === 'novelty');
  const decisions = r.events.filter((e) => e.k === 'decision');
  // longest stretch without a meaningful second, and the longest reward drought, inside sessions
  let longestDead = 0, drought = 0;
  for (const s of r.sessions) {
    let run = 0; for (const x of s.secs) { run = MEANINGFUL.has(x) ? 0 : run + 1; longestDead = Math.max(longestDead, run); }
    const ts = s.ev.filter((e) => e.k === 'reward').map((e) => e.s).sort((a, b) => a - b);
    let prev = 0; for (const x of [...ts, s.secs.length]) { drought = Math.max(drought, x - prev); prev = x; }
  }
  const exits = r.sessions.map((s) => s.exit);
  const withTimer = exits.filter((x) => x.timers.length).length;
  const nexts = exits.map((x) => x.next).filter((x) => x != null).sort((a, b) => a - b);
  return {
    minutes: +(tot / 60).toFixed(1), sessions: r.sessions.length,
    meaningfulPct: +(100 * all.filter((x) => MEANINGFUL.has(x)).length / tot).toFixed(1),
    deadPct: pc('dead'), hollowPct: pc('hollow'), buildPct: pc('build'), learnPct: pc('learn'),
    longestDeadS: longestDead, rewardDroughtS: drought,
    rewardsPerMin: +(rewards.length / (tot / 60)).toFixed(2), noveltyPerSession: +(nov.length / r.sessions.length).toFixed(1),
    decisionsPerMin: +(decisions.length / (tot / 60)).toFixed(2),
    firstBuildDoneS: r.firsts['stage:har'] ?? null, firstBoulderS: r.firsts.boulder ?? null, firstStrikeS: r.firsts.strike ?? null,
    greatStoneS: r.firsts['wow:greatStone'] ?? null, crewS: r.firsts.crew ?? null, ftueDoneS: r.firsts.ftueDone ?? null,
    wallDoneS: r.firsts['stage:wall'] ?? null,
    exitWithTimerPct: +(100 * withTimer / r.sessions.length).toFixed(0), exitNextMedianMin: nexts.length ? nexts[Math.floor(nexts.length / 2)] : null,
    earlyExits: r.sessions.filter((s) => s.left != null).length,
    firstRestPointS: r.sessions[0] ? r.sessions[0].restPoint : null,
    firstSessionMeaningfulBeforeRest: (() => { const s0 = r.sessions[0]; if (!s0) return null; const n = s0.restPoint ?? s0.secs.length; const sl = s0.secs.slice(0, n); return +(100 * sl.filter((x) => MEANINGFUL.has(x)).length / Math.max(1, sl.length)).toFixed(1); })(),
    final: r.final,
    round3: round3(r),
  };
}
/** (round 3) crews, caravans and waiting moments: what the world shows vs. what the rules do */
export function round3(r) {
  const A = r.sessions.map((s) => s.aud || {});
  const crew = A.reduce((a, x) => a + (x.crewSecs || 0), 0), idle = A.reduce((a, x) => a + (x.idleCrewSecs || 0), 0);
  const lack = {}; for (const x of A) for (const [k, v] of Object.entries(x.idleByLack || {})) lack[k] = (lack[k] || 0) + v;
  let offIdleH = 0;
  r.sessions.forEach((s, i) => { const nx = r.sessions[i + 1]; const gapH = nx ? (nx.t0 - (s.t0 + s.secs.length * SEC)) / HOUR : 8; offIdleH += ((s.aud && s.aud.idleCrewsAtExit) || 0) * Math.min(12, Math.max(0, gapH)); });
  const offCrewH = r.sessions.reduce((a, s, i) => { const nx = r.sessions[i + 1]; const gapH = nx ? (nx.t0 - (s.t0 + s.secs.length * SEC)) / HOUR : 8; return a + ((s.aud && s.aud.crewsAtExit) || 0) * Math.min(12, Math.max(0, gapH)); }, 0);
  return {
    idleCrewPctLive: crew ? Math.round((100 * idle) / crew) : 0, idleByLack: lack,
    idleCrewHoursOffline: +offIdleH.toFixed(1), idleCrewPctOffline: offCrewH ? Math.round((100 * offIdleH) / offCrewH) : 0,
    caravansArrivedLive: A.reduce((a, x) => a + (x.arrivedLive || 0), 0), caravansWaitingOnArrival: A.reduce((a, x) => a + (x.backOnArrival || 0), 0),
    sessionsOpeningOnAMoment: A.filter((x) => x.waitingMoments && x.waitingMoments.length).length, momentsWaiting: A.flatMap((x) => x.waitingMoments || []),
  };
}

/* ── the boredom map: one character a minute (majority class), '!' marks a minute that is mostly dead ── */
const GLYPH = { build: '█', moment: '★', read: '▤', decide: '◆', collect: '◎', learn: '✎', watch: '◉', hollow: '░', dead: '·' };
export function mapOf(ses) {
  const out = [];
  for (let m = 0; m * 60 < ses.secs.length; m++) {
    const sl = ses.secs.slice(m * 60, m * 60 + 60);
    const c = {}; for (const x of sl) c[x] = (c[x] || 0) + 1;
    const top = Object.entries(c).sort((a, b) => b[1] - a[1])[0][0];
    out.push(GLYPH[top]);
  }
  return out.join('');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const res = {};
  for (const [k, P] of Object.entries(PERSONAS)) res[k] = runPersona(k, P);
  const M = Object.fromEntries(Object.entries(res).map(([k, r]) => [k, metrics(r)]));
  console.log('persona      min  meaningful dead hollow  longest-dead  drought  rewards/min  decisions/min  exit-with-timer  exit-next(min)  har-done  wall-done');
  for (const [k, m] of Object.entries(M)) console.log(`${k.padEnd(11)} ${String(m.minutes).padStart(5)} ${String(m.meaningfulPct).padStart(8)}% ${String(m.deadPct).padStart(5)}% ${String(m.hollowPct).padStart(5)}% ${String(m.longestDeadS).padStart(9)} s ${String(m.rewardDroughtS).padStart(6)} s ${String(m.rewardsPerMin).padStart(9)} ${String(m.decisionsPerMin).padStart(12)} ${String(m.exitWithTimerPct).padStart(12)}% ${String(m.exitNextMedianMin).padStart(12)} ${String(m.firstBuildDoneS).padStart(9)} ${String(m.wallDoneS).padStart(9)}`);
  console.log('\nround 3 · persona  idle-crew%(live)  idle-crew-h(offline, % of crew-h)  caravans arrived live / waiting on arrival  sessions opening on a moment');
  for (const [k, m] of Object.entries(M)) { const x = m.round3; console.log(`${k.padEnd(11)} ${String(x.idleCrewPctLive).padStart(6)}% ${JSON.stringify(x.idleByLack)}  ${String(x.idleCrewHoursOffline).padStart(6)} h (${x.idleCrewPctOffline}%)  ${x.caravansArrivedLive} / ${x.caravansWaitingOnArrival}  ${x.sessionsOpeningOnAMoment} of ${m.sessions} ${x.momentsWaiting.join(',')}`); }
  if (args.includes('--map')) {
    console.log('\nlegend: █ build · ★ key moment · ▤ card · ◆ decision · ◎ collect · ✎ learn · ◉ watch · ░ hollow taps · · dead');
    for (const [k, r] of Object.entries(res)) {
      console.log(`\n${r.label}`);
      r.sessions.forEach((s, i) => console.log(`  s${i + 1} d${s.day} ${mapOf(s)}  exit: next ${s.exit.next ?? '–'} min · ${s.exit.timers.map((x) => `${x.what} ${x.min}m`).join(', ') || 'no timers'}${s.exit.blocked.length ? ' · blocked ' + s.exit.blocked.map((b) => b.id + ' ' + JSON.stringify(b.lack)).join(' ') : ''}`));
    }
  }
  fs.mkdirSync(new URL('../out/playtest/', import.meta.url), { recursive: true });
  const slim = Object.fromEntries(Object.entries(res).map(([k, r]) => [k, { label: r.label, metrics: M[k], firsts: r.firsts, final: r.final, sessions: r.sessions.map((s) => ({ day: s.day, map: mapOf(s), counts: s.counts, exit: s.exit, left: s.left, ev: s.ev.filter((e) => e.k !== 'learn').slice(0, 400) })) }]));
  fs.writeFileSync(new URL(`../out/playtest/sim-${LABEL}.json`, import.meta.url), JSON.stringify({ when: new Date().toISOString(), label: LABEL, personas: slim }, null, 1));
  console.log(`\nwrote test/out/playtest/sim-${LABEL}.json`);
}
