// PRODUCER14: what wave 14's course loop gave her, per run — from produce-play's log (<tag>-log.json) and the game's event log
// (<tag>-glog.json, --glog=1).   node test/produce-jobs14.cjs peekA1 [peekA2 …]
// Per run: the deals (both cards, "חדש!", the ↻, her pick), every job played (its game, ★, coins, q, time, by its own cue: taps /
// drags / holds), her ❤️ jobs seen and played, the ring's tries (the first perfect), the purse and the shop (the first purchase's
// minute, her five items and their buttons' size), the coins over the run, the course ends and the time between them.
const fs = require('fs'), path = require('path');
const OUT = path.join(__dirname, 'out/produce');
const HEART = [['gold', /זהב|שיבריק|gold|cover/], ['saw', /ניסור|מסור|saw/], ['column', /עמוד|column|pull/], ['arch', /קשת|arch/], ['line', /החוט|line|snap/], ['letters', /אותיות|letters|לבית התקיעה/], ['tread', /גלגל הדריכה|tread/], ['wheel', /הגלגל בלשכת|wheel|לשכת הגולה/], ['rafts', /רפסוד|rafts/]];
for (const tag of process.argv.slice(2)) {
  const lf = path.join(OUT, `${tag}-log.json`), gf = path.join(OUT, `${tag}-glog.json`);
  if (!fs.existsSync(lf) && !fs.existsSync(gf)) { console.log(`${tag}: no log`); continue; }
  const L = fs.existsSync(lf) ? JSON.parse(fs.readFileSync(lf, 'utf8')) : {}, G = fs.existsSync(gf) ? JSON.parse(fs.readFileSync(gf, 'utf8')) : { ev: [] };
  const ev = G.ev || [], t0 = (ev.find((e) => /^(strike|ftue|stageStart|demoJump)$/.test(e.type)) || ev[0] || { t: 0 }).t;
  const T = (t) => Math.round((t - t0) / 1000);
  console.log(`\n■ ${tag}${L.fatal ? ' · FATAL ' + L.fatal : ''} · errors ${(L.errors || []).length}${(L.errors || []).length ? ' [' + L.errors.slice(0, 2).join(' | ').slice(0, 200) + ']' : ''}`);
  const deals = L.deals || [];
  console.log(`  DEALS ${deals.length}: ${deals.slice(0, 12).map((d) => `${d.id}:${d.set} ${d.cards.map((c) => `${c.job || c.t.slice(0, 18)}${c.isNew ? '*' : ''}`).join(' | ')}${d.redealt ? ' → ↻' : ` → "${(d.pickT || '').slice(0, 18)}"`}`).join(' · ')}`);
  const small = deals.flatMap((d) => d.cards.filter((c) => c.w < 44 || c.h < 44).map((c) => `${c.t.slice(0, 12)} ${c.w}×${c.h}`)).concat(deals.filter((d) => d.redeal && (d.redeal.w < 44 || d.redeal.h < 44)).map((d) => `↻ ${d.redeal.w}×${d.redeal.h}`));
  if (small.length) console.log(`  DEAL TARGETS < 44 px: ${[...new Set(small)].join(' · ')}`);
  const jobs = ev.filter((e) => e.type === 'jobDone' || e.type === 'job').map((e) => { const st0 = ev.filter((x) => x.type === 'jobStart' && x.t <= e.t).pop(); return { t: T(e.t), len: st0 ? Math.round((e.t - st0.t) / 1000) : null, ...(e.d || {}) }; });
  const shown = ev.filter((e) => e.type === 'dealShown'), firstG = (ev.find((e) => e.type === 'strike') || {}).t;
  console.log(`  DEALS SHOWN ${shown.length} (first ${shown.length ? T(shown[0].t) + ' s after the run\'s first event' + (firstG ? `, ${Math.round((shown[0].t - firstG) / 1000)} s after her first strike (${ev.filter((e) => e.type === 'strike' && e.t < shown[0].t).length} strikes before it)` : '') : '—'}) · ↻ ${ev.filter((e) => e.type === 'dealRe').length} · closed ${ev.filter((e) => e.type === 'dealClosed').length} · empty ${ev.filter((e) => e.type === 'dealEmpty').length} · walks to the job ${ev.filter((e) => e.type === 'jobWalk').length} · reveals ${ev.filter((e) => e.type === 'jobReveal').length} · strike cards ${ev.filter((e) => e.type === 'strikeCard').length}`);
  console.log(`  JOBS ${jobs.length}: ${jobs.map((j) => `${j.t}s ${j.job || j.id}@${j.site || ''}${j.len != null ? ' ' + j.len + 's' : ''} ${'★'.repeat(j.stars || 0)}${j.coins != null ? ' +' + j.coins : ''}${j.q != null ? ' q' + (+j.q).toFixed(2) : ''}${j.skipped ? ' SKIP' : ''}`).join(' · ')}`);
  const mg = L.mg || [];
  console.log(`  GAMES ${mg.length}: ${mg.map((m) => `${m.kind}${m.title ? ' "' + m.title.slice(0, 24) + '"' : ''} ${m.playS != null ? m.playS + 's' : ''} taps ${m.taps || 0}${m.drags ? ' drags ' + m.drags : ''}${m.holds ? ' holds ' + m.holds.length : ''}${m.endedAlone ? ' ALONE' : ''} → ${m.result || (m.finished === false ? 'NOT FINISHED' : '')}${m.fact ? ' · fact "' + m.fact.slice(0, 50) + '"' : ''}`).join('\n         ')}`);
  const seen = HEART.map(([k, re]) => { const inDeal = deals.some((d) => d.cards.some((c) => re.test(c.job) || re.test(c.t))); const played = jobs.some((j) => re.test(j.job || j.id || '')) || mg.some((m) => re.test(m.kind || '') || re.test(m.title || '')); return `${k} ${played ? '✓played' : inDeal ? '½dealt' : '✗'}`; });
  console.log(`  HER ❤️: ${seen.join(' · ')}`);
  const ring = L.ring || [];
  if (ring.length) { const fp = ring.findIndex((r) => r.perfect); console.log(`  RING ${ring.length} timed tries: ${ring.map((r) => `${r.perfect ? '✓' : '·'}${r.dt != null ? (+r.dt).toFixed(2) : ''}${r.words ? ' "' + r.words.slice(0, 24) + '"' : ''}`).join(' ')} → first perfect at try ${fp >= 0 ? fp + 1 : '— none'}`); }
  const strikes = ev.filter((e) => e.type === 'strike'); if (strikes.length) console.log(`  STRIKES ${strikes.length}: perfect ${strikes.filter((e) => e.d && e.d.perfect).length}${strikes.some((e) => e.d && e.d.dt != null) ? ` · dt (s) ${strikes.slice(0, 12).map((e) => e.d.dt != null ? (+e.d.dt).toFixed(2) : '?').join(' ')}` : ''}`);
  for (const s of L.shop || []) console.log(`  SHOP at ${s.t}s coins ${s.coins}: ${s.err || ''}${(s.items || []).map((x) => `[${(x.item || x.b).slice(0, 16)} ${x.price != null ? x.price : '?'}${x.off ? ' off' : ''}]`).join(' ')}${s.small && s.small.length ? ` · < 44 px: ${s.small.join(', ')}` : ''}${s.bought ? ` → BOUGHT ${s.bought.item.slice(0, 30)} for ${s.bought.price} at minute ${s.bought.min}` : ''}${s.drew ? ' (drew her mark)' : ''}`);
  const pays = ev.filter((e) => /^(pay|coins|payJob|purse|econ)/.test(e.type)); if (pays.length) console.log(`  PAY events ${pays.length}: ${pays.slice(0, 10).map((e) => `${T(e.t)}s ${e.type} ${JSON.stringify(e.d).slice(0, 60)}`).join(' · ')}`);
  const sil = (L.shots || []).filter((r) => r.s && r.s.silver != null).map((r) => `${r.t}s:${r.s.silver}`); if (sil.length) console.log(`  COINS over the run (wall s:silver): ${sil.filter((x, i, a) => i === 0 || x.split(':')[1] !== a[i - 1].split(':')[1]).join(' ')}`);
  const courses = ev.filter((e) => e.type === 'course').map((e) => ({ t: T(e.t), id: e.d && e.d.id, c: e.d && e.d.c, by: e.d && e.d.by }));
  console.log(`  COURSES: ${courses.map((c, i) => `${c.t}s ${c.id} ${c.c} ${c.by}${i ? ` (+${c.t - courses[i - 1].t}s)` : ''}`).join(' · ') || 'none'}`);
  const k80 = (L.shots || []).filter((r) => r.k80 === '✓').length, kx = (L.shots || []).filter((r) => r.k80 && r.k80[0] === '✗');
  console.log(`  K80 ✓${k80} ✗${kx.length} ${kx.map((r) => path.basename(r.f).replace(/\.png$/, '') + ':' + r.k80.slice(2)).join(', ')}`);
}
