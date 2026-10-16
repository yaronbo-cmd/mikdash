// PRODUCER13: one row per stage from produce-play --demoPick logs (test/out/produce/<tag>-log.json), for the verdict table.
//   node test/produce-summary13.cjs m1 m2 m3 …
// Per stage: the games that opened (and whether the plumb's check came, with its level rounds if the log says), every course end
// (who set the last stone, the toast), the beats (their shots), K80 over the world shots of that stage, the census at the stage's
// end (lifting machines on screen, carts, workers — working frame · ×3), the idle windows (heroReturn / workFrame in a no-touch
// window) and the walks (the worst walked-to-straight ratio of a continuous walk ≥ 6 amot, the reversals).
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out/produce');
const tags = process.argv.slice(2);
const rows = [];
for (const tag of tags) {
  const f = path.join(OUT, `${tag}-log.json`); if (!fs.existsSync(f)) { console.log(`${tag}: no log`); continue; }
  const L = JSON.parse(fs.readFileSync(f, 'utf8'));
  const ids = [...new Set((L.stage || []).map((s) => s.id).concat((L.census || []).map((c) => c.id)))];
  for (const id of ids) {
    const st = (L.stage || []).find((s) => s.id === id) || {};
    const shots = (L.shots || []).filter((r) => r.s && r.s.id === id && r.k80 && !/^between|overlay|zoomed/.test(r.k80) && !/-wide-/.test(r.f));
    const k = shots.filter((r) => r.k80 === '✓').length, kx = shots.filter((r) => r.k80[0] === '✗').map((r) => path.basename(r.f).replace(/^[^-]+-/, '').replace(/\.png$/, '') + ':' + r.k80.slice(2));
    const games = (L.quarry || []).filter((q) => q.t >= (st.t || 0) - (st.secs || 0) - 5 && q.t <= (st.t || 1e9)).map((q) => q.kind.replace('precision:', '') + (q.title ? ` "${q.title.slice(0, 26)}"` : ''));
    const courses = (L.courses || []).filter((c) => c.id === id).map((c) => `${c.c}/${c.of} ${c.by}${c.toast ? '' : ' (no toast)'}`);
    const beats = (L.beats || []).filter((b) => b.id === id).map((b) => (b.f ? path.basename(b.f) : `late ${b.late}`));
    const cen = (L.census || []).filter((c) => c.id === id && c.at === 'end').pop();
    const cs = (c) => (c ? `crane ${c.crane && c.crane.onScreen ? 'on' : 'off'}${c.machines != null ? ` · machines ${c.machines}` : ''} · carts ${c.cartsOnScreen != null ? c.cartsOnScreen + "/" + c.cartsAll : c.cartsInView} · people ${(c.workersOnScreen || 0) + (c.siteWorkersOnScreen || 0)}` : '—');
    const idle = (L.idle || []).filter((w) => w.id === id).map((w) => `${w.why}: ${w.secs}s ret ${w.ev.heroReturn} wf ${w.ev.workFrame} crew ${w.ev.crewStones}`);
    let worst = null; (st.walkLens || []).forEach((len, i) => { const n = st.walkNet && st.walkNet[i]; if (!n) return; const d = Math.hypot(n[0], n[1]); if (len >= 6) { const r = len / Math.max(1, d); if (!worst || r > worst.r) worst = { r: +r.toFixed(1), len, d: Math.round(d) }; } });
    rows.push({ tag, id, games, courses, beats, k80: `✓${k} ✗${kx.length}${kx.length ? ' [' + kx.join(', ') + ']' : ''}`, census: `${cs(cen && cen.near)} ‖ ×3 ${cs(cen && cen.wide)}`, idle, walks: st.walks, worst, rev: st.reversals, ret: (st.returns || []).map((r) => r.amot), set: st.set, ev: st.ev && { course: st.ev.course, beat: st.ev.courseBeat, crew: st.ev.crewStones, hero: st.ev.heroStones, games: st.ev.games } });
  }
  if (L.pickMiss) console.log(`${tag} PICK MISSES: ${JSON.stringify(L.pickMiss)}`);
  if (L.errors && L.errors.length) console.log(`${tag} ERRORS: ${L.errors.slice(0, 3).join(' | ')}`);
}
for (const r of rows) {
  console.log(`\n■ ${r.id} (${r.tag}) set ${JSON.stringify(r.set)} · ev ${JSON.stringify(r.ev)}`);
  console.log(`  games: ${r.games.join(' · ') || '—'}`);
  console.log(`  courses: ${r.courses.join(' · ') || '—'} · beats: ${r.beats.join(' · ') || '—'}`);
  console.log(`  K80 ${r.k80}`);
  console.log(`  census end: ${r.census}`);
  console.log(`  idle: ${r.idle.join(' · ') || '—'} · walks ${r.walks} · worst ${JSON.stringify(r.worst)} · reversals ${r.rev} · heroReturn amot ${JSON.stringify(r.ret)}`);
}
