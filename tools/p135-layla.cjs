// probe135 script: #layla — round 1 done (the crews'), the first night: the evening's test, the sinking (__H135_AUTO_FINALE turns the
// wheel by itself), Jericho at dawn, the fireworks, the result card; then a reload: the kiyor as built, sunk, the visits open.
module.exports = async ({ pg, st, shot, log, wait, unmodal }) => {
  await pg.evaluate(() => { globalThis.__H135_AUTO_FINALE = 1; });
  let k = 0;
  for (let i = 0; i < 400; i++) {
    const s = await st();
    const card = await pg.evaluate(() => { const e = document.querySelector('.h135-card'); return e ? e.innerText.slice(0, 400) : null; });
    if (i % 6 === 0) { log('t', i, s && s.site, s && s.phase, s && s.mission, JSON.stringify(await pg.evaluate(() => { const S = window.__H135_SH; return S ? { d: +(S.d || 0).toFixed(2), slack: S.slack } : null; }))); if (k < 8) { k++; await shot('layla-' + i); } }
    if (card) { log('card', card.replace(/\n/g, ' | ')); await shot('card'); await pg.evaluate(() => { const b = document.querySelector('.h135-card button, .h135-card .b'); if (b) b.click(); }); break; }
    await unmodal(); await wait(1000);
  }
  for (let i = 0; i < 15; i++) { await unmodal(); await wait(1000); }
  await shot('after-card');
  log('done', await pg.evaluate(() => { const H = window.__T.game.h109; return JSON.stringify(H && H.M && { finale: H.M.st.finale, sunk: H.M.st.sunk, done: H.M.st.done.length }); }));
};
