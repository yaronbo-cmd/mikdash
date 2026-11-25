// probe134 script: the stage page with every station of round 1 done but the last (INIT sets __H109_DONE and __H134_AUTO_CIRCUIT):
// the last act ended by the director's test hook → the circuit (auto), the pull-back, the fireworks (or the flawed horn's light), the
// result card; then a reload: the world as built, the visits open. ENV FLAW=1: a crack in the NE horn before the end.
module.exports = async ({ pg, st, shot, log, wait, unmodal }) => {
  for (let i = 0; i < 60; i++) { const s = await st(); if (s && s.mission) break; await wait(1000); }
  let s = await st(); log('state', s.site, s.phase, s.mission, JSON.stringify(s.open || '').slice(0, 200));
  if (process.env.FLAW) await pg.evaluate(() => { const M = window.__T.game.h109.M; M.st.flaws.push({ f: 'orez.fall', work: 'orezNE1', lv: 1, corner: 'NE', layer: 1 }); M.st.horns.NE.salt = 2; });
  await pg.evaluate(() => { const H = window.__T.game.h109; if (H._goId) H._goId(H.M.mission() ? H.M.mission().id : 'chilutzSW1'); });
  for (let i = 0; i < 60; i++) { s = await st(); if (s.phase === 'act') break; await wait(1000); }
  log('act', s.mission); await wait(1000);
  await pg.evaluate(() => window.__T.game.h109._end({ stars: 3, q: 1, pts: 120 }));
  let n = 0;
  for (let i = 0; i < 240; i++) {
    const c = await pg.evaluate(() => { const C = window.__H134_CIRCUIT; return C ? { i: C.i, at: C.at, done: C.done, touched: C.touched } : null; });
    const card = await pg.evaluate(() => { const e = document.querySelector('.h134-card'); return e ? e.innerText.slice(0, 400) : null; });
    if (i % 5 === 0) log('t', i, JSON.stringify(c), (await st()).phase);
    if (c && c.i >= 1 && n === 0) { n = 1; await shot('circuit-first'); }
    if (c && c.done && n === 1) { n = 2; await wait(1500); await shot('pullback'); await wait(1500); await shot('fireworks'); }
    if (card) { log('card', card.replace(/\n/g, ' | ')); await shot('card'); await pg.evaluate(() => document.querySelector('.h134-card .b').click()); break; }
    await unmodal(); await wait(1000);
  }
  for (let i = 0; i < 20; i++) { await unmodal(); await wait(1000); }
  await shot('after-card');
  log('done', await pg.evaluate(() => { const G = window.__T.game; return JSON.stringify({ site: G.h109 && G.h109.site, M: G.h109 && G.h109.M && { finale: G.h109.M.st.finale, done: G.h109.M.st.done.length } }); }));
  await pg.goto(pg.url().split('#')[0]); await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 250, timeout: 200000 });
  for (let i = 0; i < 25; i++) { await unmodal(); await wait(1000); }
  s = await st(); log('reload', s && s.site, s && s.phase, JSON.stringify(s && s.open).slice(0, 300));
  log('sh', await pg.evaluate(() => { const S = window.__H134_SH; return S && S.g ? S.g.children.map((c) => c.name).join(',') : 'none'; }));
  await shot('reload');
};
