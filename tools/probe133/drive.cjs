// in-page driver for works 3 and 4: the act's own update() stepped at 1/60 s with a synthetic left thumb (the page renders at ~1 fps here)
module.exports = async ({ pg, st, shot, log, wait, unmodal }) => {
  const MODE = process.env.MODE || 'good';
  let s; for (let i = 0; i < 80; i++) { await unmodal(); s = await st(); if (s && s.phase === 'act' && s.act && (s.act.slab || s.act.len)) break; await wait(500); }
  log('begin', JSON.stringify(s.act).slice(0, 400)); await shot('begin');
  const r = await pg.evaluate(async (MODE) => {
    const H = window.__T.game.h109, A = H.act(), dt = 1 / 60, out = [];
    let down = false, x = 200, y = 300, id = 77, ph = 'pull', hold = 0, nudge = 0, T = 0, stroke = 0, lastEv = '';
    const D = () => A.dbg();
    const g0 = (d) => (d.slab ? 1.6 : 1.3);
    const stopDist = (v, g) => (v > 0 ? (v * v) / (2 * g) : 0);
    for (let it = 0; it < 60 * 240; it++) {
      const d = D(); if (d.finished || d.busy || d.seated) break;
      const dir = d.dir || [0.6, -0.8], rem = d.len - d.s - (d.slab ? 0 : 0.008);
      let want = 'free';
      if (MODE === 'early' && ph === 'brake' && Math.abs(d.v) > 0.3) { ph = 'rel'; }
      if (ph === 'pull') { want = 'pull'; if (stopDist(d.v, g0(d)) >= rem - (d.slab ? 0.3 : 0.15)) ph = 'coast'; if (d.turn === null && d.len === 8 && d.s < 6 && d.v > 1.0) ph = 'coast'; }
      else if (ph === 'coast') { want = 'free'; if (Math.abs(d.v) < 1e-3) { if (!d.slab && rem > 0.012) { ph = 'nudge'; nudge = 0; } else { ph = 'brake'; hold = 0; } } else if (stopDist(d.v, g0(d) + 4) >= rem) { ph = 'brake'; hold = 0; } if (d.len === 8 && d.s < 6 && d.v < 0.3) ph = 'pull'; }
      else if (ph === 'nudge') { want = 'pull'; nudge += dt; if (nudge >= 0.06) ph = 'coast'; }
      else if (ph === 'brake') { want = 'brake'; if (Math.abs(d.v) < 1e-3) hold += dt; if (hold > (MODE === 'early' ? 0 : 0.5)) ph = 'rel'; }
      else { want = 'free'; ph = 'pull'; }
      if (MODE === 'slide' && d.slab && d.k === 0 && !d.free) { want = it % 400 < 30 ? 'pull' : 'free'; }
      // the thumb
      if (want === 'free') { if (down) { A.up({ id, x, y }); down = false; } }
      else { if (!down) { x = 200; y = 300; A.down({ id, x, y }); down = true; stroke = 0; } if (want === 'pull') { x += dir[0] * 6; y += dir[1] * 6; stroke += 6; A.move({ id, x, y }); if (stroke > 160) { A.up({ id, x, y }); down = false; } } }
      A.update(dt); T += dt;
      const e = d.ev.join(','); if (e !== lastEv) { lastEv = e; }
      const n = D(); if (n.ev.length && n.ev[n.ev.length - 1] !== d.ev[d.ev.length - 1]) { out.push(n.ev[n.ev.length - 1] + '@' + T.toFixed(1)); if (/seated|cracked|again|turn|touch/.test(n.ev[n.ev.length - 1])) ph = /seated|again|cracked/.test(n.ev[n.ev.length - 1]) ? 'pull' : ph; }
    }
    if (down) A.up({ id, x, y });
    const d = D(); return { T: +T.toFixed(1), out: out.slice(-30), d: { pts: d.pts, dmg: d.dmg, lips: d.lips, cracked: d.cracked, gap: d.gap, seated: d.seated, turn: d.turn, busy: d.busy }, flaws: H.M.st.flaws };
  }, MODE);
  log('drive', JSON.stringify(r).slice(0, 1500));
  await shot('driven');
  for (let i = 0; i < 80; i++) { s = await st(); if (s.phase !== 'act') break; if (i === 6) await shot('ending'); await wait(1500); }
  log('after', s.phase, JSON.stringify({ mission: s.mission, open: s.open }));
  const W = await pg.evaluate(() => { const H = window.__T.game.h109; const sh = window.__H133_SH; const names = []; if (sh && sh.drawn) sh.drawn.traverse((o) => { if (o.name) names.push(o.name); }); const c = {}; for (const n of names) c[n] = (c[n] | 0) + 1; return { done: H.M.st.done, flaws: H.M.st.flaws, res: H.M.st.res, drawn: c }; });
  log('world', JSON.stringify(W).slice(0, 1500));
  await shot('world');
};
