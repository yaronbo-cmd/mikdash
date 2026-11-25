module.exports = async ({ pg, st, shot, log, wait, unmodal }) => {
  const H = () => pg.evaluate(() => { const H = window.__T.game.h109; if (!H) return {}; const s = H.state() || {}; return { phase: s.phase, mission: s.mission, done: H.M && H.M.st.done, fin: H.M && H.M.st.finale }; });
  let flawed = false;
  for (let i = 0; i < 260; i++) {
    await unmodal(); const s = await H();
    if (i % 5 === 0) log('i' + i, JSON.stringify(s));
    if (s.fin) break;
    if (s.phase === 'walk' && s.mission) log('tp', s.mission, await pg.evaluate((id) => { const T = { malben: [[-14, -14], [-30, -30], [-12, 0]], kevesh: [[-38, 45.5], [-26, 28], [-50, 30]], nima: [[-38, 20], [-26, 40], [-51, 18]], nail: [[-48, -27], [-48, -27], [-48, -27]] }; const k = id.replace(/\d/, ''), lv = +id.slice(-1); const p = T[k][lv - 1]; const X = window.__H133_X; if (!X) return 'noX'; try { X.hero.setPos(p[0], p[1], 0); } catch (e) { return 'ERR ' + e.message; } return 'ok ' + p; }, s.mission));
    if (s.phase === 'act') {
      if (!flawed) { flawed = true; await pg.evaluate(() => window.__T.game.h109.M.flaw('kevesh.lip', { slab: 3 })); }
      await wait(2500); await pg.evaluate(() => window.__T.game.h109._end({ stars: 2, pts: 20 }));
    }
    if (s.phase === 'end' && i % 10 === 0) await shot('end' + i);
    await wait(1500);
  }
  await wait(3000); await shot('after-fin');
  for (let i = 0; i < 30; i++) { const c = await pg.evaluate(() => { const e = document.querySelector('.h133-card'); if (!e) return null; const t = e.innerText.replace(/\n/g, ' | '); e.querySelector('.a').click(); return t; }); if (c) { log('card', c); break; } await wait(2000); }
  await wait(5000); await shot('after-card');
  for (let i = 0; i < 30; i++) { await unmodal(); const r = await pg.evaluate(() => { const H = window.__T.game.h109, s = H.state() || {}; return JSON.stringify({ phase: s.phase, mission: s.mission, open: s.open, vis: H.visiting && H.visiting() }); }); log('again' + i, r); if (/"phase":"act"/.test(r)) { await shot('again-act'); break; } await wait(3000); }
};
