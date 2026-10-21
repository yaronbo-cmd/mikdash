// PRODUCER14 (wave 14, the owner's daughter: "זה ארוך ומשעמם, היא רק בורחת למשחקי הביניים"): the gestures' timeline of a
// produce-play run (--glog=1), read from the game's own event log, and her escape moments.
//   node test/produce-base14.cjs b1 [b2 …] [--from=har] [--mins=10]
// Per run: every player gesture in order, by family (a tap on the survey, a rock, a stone; a perfect strike; each precision game
// by kind; the board; a moment; a job; a card/pill/sheet tap is "menu" and never breaks a run), then:
//   · the longest run of one gesture (s, taps) — menus inside a run do not break it, any other gesture does;
//   · the time to the first course end (from the first gesture), and every course end (who set its last stone);
//   · the escape moments (the brief's D1 pacing): one gesture > 25 s · no new kind of job for 90 s · ≥ 8 s with nothing to touch.
// Times are the page's clock (performance.now) from the first gesture; the harness's wall-clock taps are aligned to it by the
// median lag between a pointer tap and the strike it caused (or the dump's own pageNow/wallSec pair when the run wrote one).
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out/produce');
const A = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return [m[1], m[2] === undefined ? true : m[2]]; }));
const tags = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const MINS = +(A.mins || 10);
const fam = (e) => {
  const d = e.d || {};
  if (e.type === 'strike') { const j = String(d.job || ''); return /^b\d+$/.test(j) ? 'rock' : /:survey/.test(j) ? 'survey' : /:(stone|dress|course|seg)/.test(j) ? 'stone' : 'strike:' + j.replace(/^\w+:/, ''); }
  if (e.type === 'minigameStart') return 'game:' + d.kind;
  if (e.type === 'momentStart') return 'moment';
  if (e.type === 'jobStart' || e.type === 'job') return 'job:' + (d.id || d.job || '?');
  return null;
};
for (const tag of tags) {
  const f = path.join(OUT, `${tag}-glog.json`); if (!fs.existsSync(f)) { console.log(`${tag}: no glog`); continue; }
  const G = JSON.parse(fs.readFileSync(f, 'utf8')), L = fs.existsSync(path.join(OUT, `${tag}-log.json`)) ? JSON.parse(fs.readFileSync(path.join(OUT, `${tag}-log.json`), 'utf8')) : {};
  const ev = G.ev || [], steps = G.steps || L.steps || [];
  // the wall → page offset (s): the dump's own pair, else the median lag pointer tap → strike
  let off = G.pageNow != null && G.wallSec != null ? G.pageNow / 1000 - G.wallSec : null;
  if (off == null) {   // each pointer tap makes a strike within ~1 s: the most common (strike − tap) lag, in whole seconds, is the offset
    const strikes = ev.filter((e) => e.type === 'strike').map((e) => e.t / 1000), hist = {};
    for (const s of steps.filter((x) => /^pointer|^ring/.test(x.why || ''))) for (const t of strikes) { const k = Math.round(t - s.t); hist[k] = (hist[k] || 0) + 1; }
    const top = Object.entries(hist).sort((a, b) => b[1] - a[1])[0]; off = top ? +top[0] : 0;
  }
  const acts = [];
  for (const e of ev) { const k = fam(e); if (k) acts.push({ t: e.t / 1000, k, perfect: !!(e.d && e.d.perfect), d: e.d }); }
  for (const s of steps) { const w = s.why || ''; if (/^pill|^sheet big|^card|^tap \.gm-modal|name|^mini-game: המשך|moment: המשך|the how-to/.test(w) || (s.sel && /gm-modal|gm-big|gm-pill|fx-go|mo-go/.test(s.sel))) acts.push({ t: s.t + off, k: 'menu', w: w.slice(0, 50) }); else if (w === 'nothing to tap') acts.push({ t: s.t + off, k: 'nothing' }); }
  for (const b of (G.board || L.board || [])) acts.push({ t: b.t + off, k: 'board', n: b.accepted });
  acts.sort((a, b) => a.t - b.t);
  const play = acts.filter((a) => a.k !== 'menu' && a.k !== 'nothing');
  if (!play.length) { console.log(`${tag}: no gestures`); continue; }
  const t0 = A.from ? (ev.find((e) => e.type === 'stageStart' && e.d && e.d.id === A.from) || { t: play[0].t * 1000 }).t / 1000 : play[0].t;
  const T = (t) => Math.round(t - t0);
  const end = t0 + MINS * 60, inWin = (a) => a.t >= t0 - 1 && a.t <= end;
  // mini-games last until the harness's result (log.mg: playS + its 4 s watch); a game is one gesture
  const mg = (G.mg && G.mg.length >= (L.mg || []).length ? G.mg : L.mg || []).map((m) => ({ t: m.t + off - (m.playS || 0) - 5, dur: (m.playS || 0) + 5, kind: m.kind, taps: m.taps, res: m.result, alone: m.endedAlone }));
  // (the board lasts from its start to the tap that leaves it: its end card or its exit)
  const outF = path.join(OUT, `${tag}.out`), closed = fs.existsSync(outF) ? [...fs.readFileSync(outF, 'utf8').matchAll(/GAME CLOSED: board after (\d+) s/g)].map((m) => +m[1]) : [];
  let bi = 0;
  for (const a of acts.filter((x) => x.k === 'board')) { const cd = closed[bi++]; if (cd != null) { mg.push({ t: a.t - 4, dur: cd, kind: 'board', taps: a.n }); a.k = 'game:board'; continue; } const e = steps.map((x) => ({ t: x.t + off, w: x.why || '' })).find((x) => x.t > a.t + 1 && /board's end card|board exit|confirm: לצאת/.test(x.w)); const nx = acts.find((x) => x.t > a.t + 1 && x.k !== 'menu' && x.k !== 'nothing' && x.k !== 'board'); const tEnd = e ? e.t : nx ? nx.t : a.t; mg.push({ t: a.t, dur: Math.round(tEnd - a.t), kind: 'board', taps: a.n }); a.k = 'game:board'; }
  // (a game lasts from its minigameStart to the tap that closes its result card, "mini-game: המשך")
  for (const a of acts.filter((x) => x.k.startsWith('game:') && x.k !== 'game:board')) { const e = acts.find((x) => x.t > a.t && x.k === 'menu' && /mini-game: המשך|continue|skip/.test(x.w || '')); const m = mg.find((q) => 'game:' + q.kind === a.k && Math.abs(q.t - a.t) < 30); if (e) { if (m) { m.t = a.t; m.dur = Math.round(e.t - a.t); } else mg.push({ t: a.t, dur: Math.round(e.t - a.t), kind: a.k.slice(5) }); } }
  // runs of one gesture (menus do not break a run)
  const runs = []; let cur = null;
  for (const a of acts.filter(inWin)) {
    if (a.k === 'menu' || a.k === 'nothing') { if (cur) cur.menus++; continue; }
    const k = a.k.startsWith('game:') ? a.k : a.k;
    if (cur && cur.k === k && !k.startsWith('game:')) { cur.end = a.t; cur.n++; cur.perfect += a.perfect ? 1 : 0; }
    else { if (cur) runs.push(cur); cur = { k, start: a.t, end: a.t, n: 1, perfect: a.perfect ? 1 : 0, menus: 0 }; const g = k.startsWith('game:') && mg.find((m) => Math.abs(m.t - a.t) < 20 && 'game:' + m.kind === k); if (g) { cur.end = a.t + g.dur; cur.game = g; } }
  }
  if (cur) runs.push(cur);
  const dur = (r) => Math.round(r.end - r.start);
  const longest = runs.slice().sort((a, b) => dur(b) - dur(a))[0], longTap = runs.filter((r) => /^(stone|rock|survey|strike)/.test(r.k)).sort((a, b) => dur(b) - dur(a))[0];
  const courses = ev.filter((e) => e.type === 'course').map((e) => ({ t: T(e.t / 1000), id: e.d && e.d.id, c: e.d && e.d.c, of: e.d && e.d.of, by: e.d && e.d.by }));
  // escapes
  const esc = [];
  for (const r of runs) if (r.k !== 'moment' && dur(r) > 25) esc.push({ t: T(r.start + 25), s0: r.start, s1: r.end, why: `one gesture "${r.k}" for ${dur(r)} s (${r.game ? (r.game.taps || 0) + ' moves' : r.n + ' taps'}${r.perfect ? `, ${r.perfect} perfect` : ''})` });
  // no new kind of job for 90 s: a "new kind" = a family not played in the 90 s before it
  let lastNew = t0; const seenAt = {};
  for (const a of play.filter(inWin)) { const k = a.k; if (seenAt[k] == null || a.t - seenAt[k] > 90) { if (a.t - lastNew > 90 && !esc.some((x) => x.s0 != null && Math.min(x.s1, a.t) - Math.max(x.s0, lastNew) > 0.5 * (a.t - lastNew))) esc.push({ t: T(lastNew + 90), why: `no new kind of job for ${Math.round(a.t - lastNew)} s (then "${k}")` }); lastNew = a.t; } seenAt[k] = a.t; }
  if (Math.min(end, play.filter(inWin).pop().t) - lastNew > 90 && play.filter(inWin).length) esc.push({ t: T(lastNew + 90), why: `no new kind of job for ${Math.round(Math.min(end, play.filter(inWin).pop().t) - lastNew)}+ s to the window's end` });
  // nothing to touch for ≥ 8 s (the harness found no pointer, hand, ring, pill or card): runs of 'nothing'
  let nz = null; const nothing = [];
  for (const a of acts.filter(inWin)) { if (a.k === 'nothing') { if (!nz) nz = { s: a.t, e: a.t }; else nz.e = a.t; } else if (nz) { if (nz.e - nz.s + 1.5 >= 8) nothing.push(nz); nz = null; } }
  for (const z of nothing) esc.push({ t: T(z.s), why: `nothing to touch for ${Math.round(z.e - z.s + 1.5)} s` });
  // gaps between gestures ≥ 12 s outside games (a wait she feels)
  const pl = play.filter(inWin);
  for (let i = 1; i < pl.length; i++) {
    let a0 = pl[i - 1].t; const g0 = mg.find((m) => a0 >= m.t - 2 && a0 <= m.t + m.dur + 2); if (g0) a0 = Math.max(a0, g0.t + g0.dur);   // (a game's own time is play, not a wait)
    const g = pl[i].t - a0; if (g < 12) continue;
    const inGap = acts.filter((a) => a.t > a0 && a.t < pl[i].t), menus = inGap.filter((a) => a.k === 'menu'), noth = inGap.filter((a) => a.k === 'nothing');
    esc.push({ t: T(a0), why: `a ${Math.round(g)} s gap between gestures ("${pl[i - 1].k}" → "${pl[i].k}"): ${menus.length ? `${menus.length} card/pill taps [${[...new Set(menus.map((m) => m.w))].slice(0, 4).join('; ')}]` : ''}${noth.length ? ` nothing to touch ×${noth.length}` : ''}${!menus.length && !noth.length ? 'watching (the harness found nothing it had to do)' : ''}` });
  }
  esc.sort((a, b) => a.t - b.t);
  // per family
  const byK = {}; for (const r of runs) { const o = byK[r.k] = byK[r.k] || { n: 0, s: 0, runs: 0, perfect: 0 }; o.n += r.n; o.s += dur(r) || 1; o.runs++; o.perfect += r.perfect; }
  console.log(`\n■ ${tag} — ${MINS} min from the first gesture (page clock; wall→page offset ${off.toFixed(1)} s) · ${pl.length} gestures`);
  console.log(`  families: ${Object.entries(byK).map(([k, o]) => `${k} ×${o.n}${o.perfect ? ` (${o.perfect} perfect)` : ''} in ${o.runs} run(s), ${o.s} s`).join(' · ')}`);
  console.log(`  timeline: ${runs.map((r) => `${T(r.start)}s ${r.k}${r.n > 1 ? '×' + r.n : ''}${dur(r) > 2 ? ` ${dur(r)}s` : ''}${r.game ? ` [${r.game.taps || 0} taps${r.game.alone ? ', ended alone' : ''}${r.game.res ? ', ' + r.game.res.slice(0, 30) : ''}]` : ''}`).join(' → ')}`);
  console.log(`  LONGEST one-gesture run: "${longest.k}" ${dur(longest)} s, ${longest.n} taps (from ${T(longest.start)} s)${/stone|rock|survey/.test(longest.k) ? ` — at the fastest a finger can strike (0.86 s a stroke) still ${Math.round(longest.n * 0.86)} s` : ''}`);
  if (longTap && longTap !== longest) console.log(`  LONGEST strike run: "${longTap.k}" ${dur(longTap)} s, ${longTap.n} taps (from ${T(longTap.start)} s; ≥ ${Math.round(longTap.n * 0.86)} s at the fastest a finger can strike)`);
  console.log(`  COURSE ENDS: ${courses.length ? courses.map((c) => `${c.t}s ${c.id} ${c.c}/${c.of || '?'} by ${c.by}`).join(' · ') : 'none'} · first at ${courses.length ? courses[0].t + ' s' : '—'}`);
  console.log(`  ESCAPES (${esc.length}): ${esc.map((e) => `${e.t}s ${e.why}`).join(' | ')}`);
  console.log(`  games: ${mg.map((m) => `${T(m.t)}s ${m.kind} ${m.dur}s${m.alone ? ' (ended alone)' : ''} ${m.res || ''}`).join(' · ') || '—'}`);
  const out = { tag, off, t0, gestures: pl.length, byK, runs: runs.map((r) => ({ t: T(r.start), k: r.k, n: r.n, s: dur(r), perfect: r.perfect })), longest: { k: longest.k, s: dur(longest), n: longest.n, t: T(longest.start) }, longTap: longTap && { k: longTap.k, s: dur(longTap), n: longTap.n, t: T(longTap.start) }, courses, esc };
  fs.writeFileSync(path.join(OUT, `${tag}-base14.json`), JSON.stringify(out, null, 1));
}
