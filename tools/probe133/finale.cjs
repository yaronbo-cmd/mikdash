const drive = require('./drive.cjs');
module.exports = async (o) => {
  const { pg, st, shot, log, wait, unmodal } = o;
  await drive(o);
  for (let i = 0; i < 40; i++) {
    const r = await pg.evaluate(() => { const c = document.querySelector('[class*="h133"]'); const t = Array.from(document.querySelectorAll('.h109-ui,.gm-modal,[class*="h133"]')).map((e) => e.className + ':' + (e.innerText || '').slice(0, 80).replace(/\n/g, ' ')).slice(0, 6); const M = window.__T.game.h109.M; return { t, fin: M.st.finale, guf: (window.__T.game.h109.state() || {}).phase }; });
    log('t' + i, JSON.stringify(r).slice(0, 600));
    if (i % 4 === 0) await shot('fin' + i);
    if (r.t.some((x) => /שוב, לשיפור/.test(x))) { await shot('card'); break; }
    await wait(2000);
  }
  const before = await pg.evaluate(() => JSON.stringify(window.__T.game.h109.M.st));
  log('st-before', before.slice(0, 800));
  await pg.reload(); await wait(20000);
  for (let i = 0; i < 20; i++) { await unmodal(); await wait(1000); }
  const after = await pg.evaluate(() => { try { return JSON.stringify(window.__T.game.h109.M.st); } catch (e) { return 'ERR ' + e.message; } });
  log('st-after', after.slice(0, 800));
  await shot('reloaded');
};
