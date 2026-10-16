// (wave 6, FUN) The teen playtest of the v6 loop, headless on the REAL rules: BUILD's state v6 (src/game/state.js), MATCH3's
// engine and levels (every board played by its bot at the persona's hand, timed at the persona's pace per move), FUN's
// precision games (simulated with the persona's human timing) and loop hooks, and KINGS' pure trade logic.
// נועם (16): fast, skilled, impatient · מאיה (15): slower hand, reads, claims every order, visits the kings.
// Reports the first session minute by minute, the shares of time, the novelties, day 1, the return visit and week 1.
//   Run it on a merge of s6-fun + s6-build + s6-match3 + s6-kings (a detached peek worktree):
//   node test/playtest/loop-sim.mjs            → a summary here + test/out/playtest/loop-sim.json
import fs from 'node:fs';

const need = async (p) => { try { return await import(p); } catch (e) { return null; } };
const S = await need('../../src/game/state.js');
const M3 = await need('../../src/match3/index.js');
const K = await need('../../src/kings/index.js');
const MG = await need('../../src/game/minigames/index.js');
const L = await need('../../src/game/hooks/loop.js');
if (!S || !S.nextAction || !MG || !L) { console.log('loop-sim: needs state v6 (s6-build) + FUN; run it on a merge'); process.exit(0); }
if (!M3) console.log('(no MATCH3 on this tree: boards are modelled)');
if (!K) console.log('(no KINGS on this tree: no deals)');

const MIN = 60000, HOUR = 60 * MIN, DAY = 24 * HOUR;
const START = new Date('2026-10-04T08:00:00').getTime();   // a Sunday morning
const PERSONAS = {
  noam: { he: 'נועם', pace: 4.0, skill: 0.65, perfect: 0.45, sd: 0.05, mu: 0.02, boardOver: 8, card: 2, moment: 30, retries: 3,
    replay: true, kings: 0.3, daily: 0.5, day1: [[8, 8], [17, 12], [21, 6]], week: [[8, 8], [17, 10], [21, 6]] },
  maya: { he: 'מאיה', pace: 6.5, skill: 0.55, perfect: 0.3, sd: 0.09, mu: 0.05, boardOver: 12, card: 5, moment: 70, retries: 2,
    replay: false, kings: 1, daily: 1, day1: [[16, 15], [20, 25]], week: [[16, 15], [20, 25]] },
};
const RES = ['stone', 'cedar', 'gold', 'silver', 'bronze', 'wstone'];
const STAR_BONUS = [0, 0.15, 0.3, 0.5];

function human(P, R) {        // the persona sees the right moment and taps after a reaction delay ~ N(mu, sd)
  let due = -1;
  return (M, t) => {
    const a = M.auto();
    if (due < 0 && a) { const g = Math.sqrt(-2 * Math.log(R() + 1e-9)) * Math.cos(6.283 * R()); due = t + Math.max(-0.08, P.mu + P.sd * g); if (due <= t) { due = -1; return a; } return false; }
    if (due >= 0 && t >= due) { due = -1; return typeof a === 'string' ? a : (M.stones && M.cur && M.cur() ? (M.cur().kind === 'whole' ? 'ok' : 'no') : true); }
    return false;
  };
}

function run(key) {
  const P = PERSONAS[key];
  let seed = 7 + key.length; Math.random = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const R = MG.rng(99 + key.length);
  const G = S.fresh(START);
  const log = [];                 // { t, what, s } per action · s = seconds spent
  const first = {};               // novelty → ms from the start of play
  const share = { board: 0, build: 0, key: 0, manage: 0, moment: 0, wait: 0 };
  let played = 0, hand = 0, boards = 0, wins = 0, segs = 0, stones = 0, keys = 0, deals = 0, claims = 0, maxHollow = 0, digs = 0;
  const note = (k, t) => { if (first[k] == null) first[k] = played + t; };
  const emit = (name, data, now) => { for (const b of L.onEvent(G, name, data, now)) note(b.kind, 0); };

  function spend(what, s, now, cat) { log.push({ t: played, what, s: +s.toFixed(1), cat }); share[cat] += s; played += s; return now + s * 1000; }

  function board(a, now) {
    const field = a.field || 'quarry';
    G.m3 = G.m3 && typeof G.m3 === 'object' ? G.m3 : {}; G.m3.level = G.m3.level || {};
    const level = G.m3.level[field] || 1;
    const got = {}; let won = false, stars = 0, used = 0, tries = 0;
    if (M3 && M3.levelSpec && M3.playBot) {
      const spec = M3.levelSpec(field, level, { need: a.need });
      const d = L.m3Daily(now, G), mult = d && d.field === field ? d.mult : 1;
      while (tries < P.retries && !won) {
        tries++;
        const r = M3.playBot(spec, spec.seed, P.skill, hand++);
        used += r.used;
        const g = {}; for (const k of RES) if (r.t && r.t[k]) g[k] = r.t[k];
        if (r.won) {
          won = true; stars = Math.max(1, (spec.stars || []).filter((x) => r.score >= x).length);
          const main = Object.keys(g).sort((x, y) => g[y] - g[x])[0];
          if (main) g[main] += Math.round(g[main] * (STAR_BONUS[stars] + (mult - 1)));
        }
        for (const k of Object.keys(g)) got[k] = (got[k] || 0) + g[k];
      }
    } else { won = Math.random() < 0.8; stars = won ? 2 : 0; got[field === 'forest' ? 'cedar' : field === 'gold' ? 'gold' : 'stone'] = 24; used = 25; tries = 1; }
    boards++; if (won) { wins++; G.m3.level[field] = level + 1; }
    const s = used * P.pace + tries * P.boardOver;
    note('board', 0);
    now = spend(`▶ ${field} L${level}${won ? ' ★' + stars : ' ✗'}${tries > 1 ? ' ×' + tries : ''} (+${Object.entries(got).map(([k, v]) => v + ' ' + k).join(', ')})`, s, now, 'board');
    const before = { ...G.res };
    S.grantLevel(G, { won, stars, collected: got }, a.need || {});
    emit(won ? 'm3Won' : 'm3Lost', { field, level, stars, collected: got }, now);
    if (won) note('boardWon', 0);
    if (stars >= 3) note('threeStars', 0);
    const paid = Object.keys(G.res).some((k) => (G.res[k] || 0) < (before[k] || 0));
    return now;
  }

  function preciseGame(kind, id, now, cat, setup = {}) {
    const lv = L.mgLevel(G, kind);
    const game = MG.GAMES[kind];
    let r = MG.simulate(game, { level: lv, rng: MG.rng(Math.floor(Math.random() * 1e6)), setup }, human(P, R));
    let s = r.s * 1.15 + P.card, tries = 1;
    if (P.replay && MG.tierOf(r.quality) <= 1) { const r2 = MG.simulate(game, { level: lv, rng: MG.rng(Math.floor(Math.random() * 1e6)) }, human(P, R)); s += r2.s * 1.15 + P.card; tries++; if (r2.score > r.score) r = r2; }
    now = spend(`${kind} (L${lv}) → ${MG.TIERS[MG.tierOf(r.quality)]} ${r.quality.toFixed(2)}${tries > 1 ? ' (שוב)' : ''}`, s, now, cat);
    emit('minigame', { kind, level: lv, quality: r.quality, perfect: r.perfect, tier: MG.tierOf(r.quality), score: r.score }, now);
    note('mg_' + kind, 0);
    return { now, r };
  }

  function tend(now) {                   // orders, the kings' arrivals: a teen's quick look between things
    if (K && K.unloadAll) { const u = K.unloadAll(G, now); if (u.length) { note('arrival', 0); now = spend(`🚢 unload ×${u.length}`, 4 * u.length, now, 'manage'); for (const x of u) emit('delivery', x, now); } }
    for (const o of L.ordersFor(G, now)) if (o.done) { const rw = L.claimOrder(G, o.id, now); if (rw) { S.gain(G, rw); claims++; note('orderClaimed', 0); now = spend(`✓ order: ${o.he}`, 4, now, 'manage'); } }
    return now;
  }

  // (wave 7) the dig of the day: Maya digs whenever it waits, Noam half the time (P.daily); a brush of 5–10 s + the card
  function digToday(now) {
    if (!L.dig || !L.digState) return now;
    const ds = L.digState(G, now);
    if (!ds.ready || Math.random() > P.daily) return now;
    const r = L.dig(G, now); if (!r) return now;
    S.gain(G, r.reward); digs++; note('dig', 0);
    return spend(`⛏ חפירת היום: ${r.find.he} (${r.n}/${r.of})`, P.card * 2 + (key === 'maya' ? 10 : 6), now, 'manage');
  }
  function kings(a, now) {
    if (!K || !K.partners || Math.random() > P.kings) return now;
    const needs = a.lack || {};
    let best = null;
    for (const p of K.partners(G, now) || []) for (const o of K.offers(G, p.id || p, now, { needs }) || []) if (o.ok && o.now && (!best || o.cost < best.cost)) best = o;
    if (!best) return now;
    const r = K.accept(G, best.id, now, {});
    if (r && r.ok) { deals++; note('deal', 0); emit('deal', { king: best.partner, what: best.id }, now); return spend(`👑 ${best.partner}: ${best.id} (${best.cost} כסף, ${Math.round(best.ms / 60000)} דק׳)`, P.card * 4 + 10, now, 'manage'); }
    return now;
  }

  function session(t0, mins, label) {
    let now = t0;
    const rep = S.settle(G, now);
    if (rep && rep.stones) for (const [id, n] of Object.entries(rep.stones)) emit('stoneSet', { id, n, by: 'crew' }, now);
    S.dailyCheck && S.dailyCheck(G, now, (k) => L.isRestDay(k));
    // crews as BUILD's simulator places them: the sites crews can work, else the quarry
    const b = S.buildingSites(G);
    const work = b.filter((id) => { const j = S.jobOf(G, id); return j && (j.crew || j.kind === 'boulders'); });
    G.crews.forEach((c, i) => { c.at = work.length ? work[i % work.length] : (S.isDone(G, 'har') ? 'quarry' : null); });
    while (G.trainOn && G.train.length < G.trainSlots && G.priests + G.train.length < 10 && S.startTraining(G, now).ok) { /* train */ }
    const end = t0 + mins * MIN, startPlayed = played;
    now = tend(now);
    const d = L.dailyState(G, now);
    if (!d.rest && !d.done && !d.locked && Math.random() < P.daily) { now = preciseGame(d.mg, null, now, 'key').now; note('daily', 0); }
    now = digToday(now);
    let lastKey = '', same = 0, nextSettle = now + MIN;
    for (let guard = 0; guard < 6000 && now < end; guard++) {
      if (now >= nextSettle) {
        const rr = S.settle(G, now); if (rr && rr.stones) for (const [id, n] of Object.entries(rr.stones)) emit('stoneSet', { id, n, by: 'crew' }, now);
        now = tend(now); now = digToday(now); nextSettle = now + MIN;
        const f = S.focusOf && S.focusOf(G), st = f && S.stepOf ? S.stepOf(G, f) : null;
        if (st && st.cost) for (const k of Object.keys(st.cost)) if (st.cost[k] > 0) maxHollow = Math.max(maxHollow, (G.res[k] || 0) / st.cost[k]);
      }
      // (wave 7) BUILD7 1301170: a bronze step leads with the king's offer (the pill's main action) — both teens follow the pill
      const a = S.nextAction(G, { deal: (r, n) => { try { const o = K && K.bestFor ? K.bestFor(G, r, n, now) : null; return o && o.ok ? { partner: o.partner, offer: o.id, n: o.gives[r], cost: o.cost } : null; } catch (e) { return null; } } });
      const k = a.kind + ':' + a.id; same = k === lastKey ? same + 1 : 0; lastKey = k;
      if (a.kind === 'done') break;
      if (a.kind === 'none' || same > 400) { now = spend('… nothing to do', 30, now, 'wait'); note('wait', 0); continue; }
      if (a.kind === 'moment') { now = spend(`✦ moment ${a.id}`, P.moment, now, 'moment'); const c = S.momentDone(G, a.id); if (c) { emit('stageDone', { id: c.id }, now); note('stage', 0); } continue; }
      if (a.kind === 'key') {
        const g = a.game || 'crane', jk = S.jobOf(G, a.id); const { now: n2, r } = preciseGame(g, a.id, now, 'key', { what: (jk && jk.what) || a.what }); now = n2;
        const o = S.setKey(G, a.id, { quality: r.quality, perfect: r.perfect }); keys++; stones++; note('firstStone', 0);
        emit('keyStone', { id: a.id, kind: g, quality: r.quality, perfect: r.perfect }, now); emit('stoneSet', { id: a.id, n: 1, by: 'hero', key: true }, now);
        if (o && o.course) { emit('course', { id: a.id }, now); note('course', 0); }
        continue;
      }
      if (a.kind === 'inspect') { now = preciseGame('plumb', a.id, now, 'key').now; const r = S.inspect(G, a.id); note('inspect', 0); if (r && r.reached === 'done') { const c = S.completeStage(G, a.id); if (c) emit('stageDone', { id: c.id }, now); } continue; }
      if (a.kind === 'build') { S.payStep(G, a.id); segs++; now = spend(`בנה ${a.id} (${Object.entries(a.cost || {}).map(([x, v]) => v + ' ' + x).join(', ')})`, 2, now, 'manage'); continue; }
      if (a.kind === 'start') { S.startBuild(G, a.id); now = spend(`start ${a.id}`, 3, now, 'manage'); continue; }
      if (a.kind === 'deal') {
        const r = K && K.accept ? K.accept(G, a.offer, now, {}) : null;
        if (r && r.ok) { deals++; note('deal', 0); emit('deal', { king: a.partner, what: a.offer }, now); now = spend(`👑 ${a.partner}: ${a.offer} (${a.cost} כסף)`, P.card * 4 + 10, now, 'manage'); continue; }
        if (a.play) { now = board(a.play, now); now = tend(now); continue; }
      }
      if (a.kind === 'play') { if (a.field === 'forest' || a.field === 'gold') now = kings(a, now); now = board(a, now); now = tend(now); continue; }
      if (a.kind === 'priests') { now = board({ field: 'quarry', need: { silver: 20 } }, now); continue; }
      // BUILD 0b07de7: the course check is a job (FUN's plumb, check:'courses', ~7 s); the stroke below performs it
      if (a.kind === 'check') { now = preciseGame('plumb', a.id, now, 'key', { rounds: 3 }).now; note('check', 0); }
      // work: a stroke on the site (survey, dig, boulders, a stone, an event, a finish step, a reset)
      const j = S.jobOf(G, a.id);
      if (j && j.kind === 'boulders') { const i = S.pickBoulder(G.bh); S.hitBoulder(G, i, Math.random() < P.perfect ? 2 : 1); now = spend('⛏ boulder', 0.86, now, 'build'); continue; }
      const perfect = Math.random() < P.perfect;
      const r = S.stroke(G, a.id, perfect);
      if (!r || !r.ok) { now = spend('… (stroke refused)', 5, now, 'wait'); continue; }
      emit('stroke', { id: a.id, job: j && j.kind, perfect }, now);
      now = spend(`🔨 ${j ? j.kind : 'work'} ${a.id}`, 0.86 + (r.stones && r.stones.length ? 0.4 : 0), now, 'build');
      if (r.stones && r.stones.length) { stones += r.stones.length; note('firstStone', 0); emit('stoneSet', { id: a.id, n: r.stones.length, by: 'hero' }, now); }
      if (r.course) { emit('course', { id: a.id }, now); note('course', 0); }
      if (r.reached === 'done') { const c = S.completeStage(G, a.id); if (c) emit('stageDone', { id: c.id }, now); }
      else if (r.reached === 'ready') { now = spend(`✦ moment ${a.id}`, P.moment, now, 'moment'); const c = S.momentDone(G, a.id); if (c) emit('stageDone', { id: c.id }, now); }
    }
    return { label, min: +((played - startPlayed) / 60).toFixed(1) };
  }

  // ── the first session (minute by minute), the rest of day 1, the return visit, week 1 ──
  const out = { he: P.he, sessions: [] };
  const [h0, m0] = P.day1[0];
  out.sessions.push(session(START + (h0 - 8) * HOUR, m0, 'day 1 · first'));
  const minutes = [];
  for (let m = 0; m < Math.ceil(m0); m++) {
    const inMin = log.filter((e) => e.t >= m * 60 && e.t < (m + 1) * 60);
    const by = {}; for (const e of inMin) by[e.cat] = (by[e.cat] || 0) + e.s;
    const top = Object.entries(by).sort((x, y) => y[1] - x[1])[0];
    const notable = inMin.filter((e) => e.cat !== 'build' || /stone|course/.test(e.what)).map((e) => e.what).filter((w) => !/^🔨 stone|^⛏/.test(w)).slice(0, 3);
    minutes.push(`${String(m).padStart(2)}:00 ${top ? top[0] : '—'} ${notable.join(' · ')}`.slice(0, 180));
  }
  const at10 = Object.entries(first).filter(([, t]) => t <= 600).map(([k]) => k);
  out.first = Object.fromEntries(Object.entries(first).map(([k, t]) => [k, Math.round(t)]));
  out.minutes = minutes; out.novelties10 = at10;
  const shareOf = () => { const tot = Object.values(share).reduce((a, b) => a + b, 0) || 1; return Object.fromEntries(Object.entries(share).map(([k, v]) => [k, Math.round((100 * v) / tot)])); };
  out.shareFirst = shareOf();
  for (const [h, m] of P.day1.slice(1)) out.sessions.push(session(START + (h - 8) * HOUR, m, 'day 1'));
  out.day1 = { stagesDone: S.doneCount(G), stones, keys, boards, wins, segs, claims, deals, digs, finds: L.album(G).filter((x) => x.got).length, crew: G.crews.length };
  // the return visit, 20 h after the last session of day 1
  const lastH = P.day1[P.day1.length - 1][0];
  const back = START + (lastH - 8) * HOUR + 20 * HOUR;
  const before = log.length, playedBefore = played;
  out.sessions.push(session(back, 10, 'return (20 h)'));
  const ret = log.slice(before);
  out.return = { firstAction: ret[0] ? ret[0].what : '—', firstActionS: ret[0] ? Math.round(ret[0].t - playedBefore) : null, first3: ret.slice(0, 3).map((e) => e.what) };
  // week 1 (Saturday rests)
  for (let d = 2; d <= 7; d++) {
    const day = new Date(START + (d - 1) * DAY);
    if (day.getDay() === 6) continue;
    for (const [h, m] of P.week) session(START + (d - 1) * DAY + (h - 8) * HOUR, m, 'week');
  }
  out.week1 = { stagesDone: S.doneCount(G), of: 15, stones, keys, boards, wins, segs, claims, deals, digs, finds: L.album(G).filter((x) => x.got).length, hours: +(played / 3600).toFixed(1), held: Object.fromEntries(Object.entries(G.res || {}).map(([k, v]) => [k, Math.round(v)])) };
  out.share = shareOf();
  out.boardsPerSeg = segs ? +(boards / segs).toFixed(2) : null;
  out.maxHollow = +maxHollow.toFixed(1);
  return out;
}

const res = { noam: run('noam'), maya: run('maya') };
for (const [k, r] of Object.entries(res)) {
  console.log(`\n══ ${r.he} ══ first: ${Object.entries(r.first).map(([x, t]) => `${x} ${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`).join(' · ')}`);
  console.log(r.minutes.join('\n'));
  console.log(`novelties by 10:00 (${r.novelties10.length}): ${r.novelties10.join(', ')}`);
  console.log(`share, first session: ${JSON.stringify(r.shareFirst)} · all: ${JSON.stringify(r.share)} · boards per segment ${r.boardsPerSeg} · max stock / next need ×${r.maxHollow}`);
  console.log(`day 1: ${JSON.stringify(r.day1)}`);
  console.log(`return: first action in ${r.return.firstActionS} s: ${r.return.first3.join(' → ')}`);
  console.log(`week 1: ${JSON.stringify(r.week1)}`);
}
fs.mkdirSync(new URL('../out/playtest/', import.meta.url), { recursive: true });
fs.writeFileSync(new URL('../out/playtest/loop-sim.json', import.meta.url), JSON.stringify({ when: new Date().toISOString(), res }, null, 1));
