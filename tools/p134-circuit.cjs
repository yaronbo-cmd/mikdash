// probe134 script: the circuit by hand — the stage page with round 1 done but the last (INIT __H109_DONE), the last act ended by the
// test hook; then the mouse held (one press) leads the kohen; at each horn a still, the press let go and the horn tapped (a wrong horn
// first at the second). ENV FLAW=1: a crack in the NE horn first.
module.exports = async ({ pg, st, shot, log, wait, unmodal }) => {
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.mission) break; await wait(1000); }
  if (process.env.FLAW) await pg.evaluate(() => { const M = window.__T.game.h109.M; M.st.flaws.push({ f: 'orez.fall', work: 'orezNE1', lv: 1, corner: 'NE', layer: 1 }); M.st.horns.NE.salt = 2; });
  await pg.evaluate(() => { const H = window.__T.game.h109; H._goId(H.M.mission() ? H.M.mission().id : 'chilutzSW1'); });
  for (let i = 0; i < 60; i++) { const s = await st(); if (s.phase === 'act') break; await wait(1000); }
  await wait(1000); await pg.evaluate(() => window.__T.game.h109._end({ stars: 3, q: 1, pts: 120 }));
  for (let i = 0; i < 90; i++) { if (await pg.evaluate(() => !!window.__H134_CIRCUIT)) break; await unmodal(); await wait(1000); }
  await wait(3000); await shot('circuit-start');
  await pg.mouse.move(150, 250); await pg.mouse.down(); log('held');
  let shotUp = false;
  for (let k = 0; k < 4; k++) {
    for (let i = 0; i < 200; i++) { const c = await pg.evaluate(() => { const C = window.__H134_CIRCUIT; return { at: C.at, i: C.i, z: +C.z.toFixed(1), y: +C.y.toFixed(1) }; }); if (!shotUp && c.z < 30) { shotUp = true; await shot('circuit-kevesh'); } if (c.at) break; await wait(700); }
    await pg.mouse.up(); await shot('circuit-at-' + k);
    const p = await pg.evaluate((k) => { const C = ['SE', 'NE', 'NW', 'SW'], B = window.__T.BOOK || null; const H = window.__H134_X; const h = { SE: [-24.5, 10], NE: [-24.5, -17], NW: [-51.5, -17], SW: [-51.5, 10] }; const wrong = k === 1 ? 'NW' : C[k]; const q = H.scr(h[wrong][0], 25.5, h[wrong][1]); const r = H.scr(h[C[k]][0], 25.5, h[C[k]][1]); return { w: [q.x, q.y], r: [r.x, r.y], wrong }; }, k);
    if (k === 1) { await pg.mouse.click(p.w[0], p.w[1]); await wait(800); log('wrong tap', p.wrong, JSON.stringify(await pg.evaluate(() => window.__H134_CIRCUIT.touched))); }
    await pg.mouse.click(p.r[0], p.r[1]); await wait(1200); await shot('circuit-touched-' + k);
    log('touched', JSON.stringify(await pg.evaluate(() => { const C = window.__H134_CIRCUIT; return { t: C.touched, i: C.i, done: C.done }; })), JSON.stringify(p));
    if (k < 3) { await pg.mouse.move(150, 250); await pg.mouse.down(); }
  }
  await wait(2500); await shot('pullback'); await wait(2500); await shot('end');
  for (let i = 0; i < 40; i++) { const card = await pg.evaluate(() => { const e = document.querySelector('.h134-card'); return e ? e.innerText.slice(0, 500) : null; }); if (card) { log('card', card.replace(/\n/g, ' | ')); await shot('card'); break; } await wait(1000); }
};
