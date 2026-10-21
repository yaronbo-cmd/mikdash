// scratch: a coin's celebration, shot mid-way
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'); const OUT = path.join(ROOT, 'test/out/hook'); fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage(); const logs = [];
  pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); }); pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; try { localStorage.clear(); } catch (e) {} });
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
  const cdp = await ctx.newCDPSession(pg);
  const tap = async (x, y) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 9 }] }); await pg.waitForTimeout(60); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, { timeout: 15000 }).catch(() => {});
  const cine = await pg.$('.gm-cine'); const cb = cine && await cine.boundingBox(); if (cb) await tap(cb.x + cb.width / 2, cb.y + cb.height * 0.6);
  await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, { timeout: 12000 }).catch(() => {});
  await pg.waitForTimeout(800);
  await pg.evaluate(() => { const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; __T.game.ui.coach(null, ''); g.st.har = { p: 'dig', n: __T.game._.siteStones('har'), dp: 1, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 }; g.focus = 'har'; g.crews = []; g.score = 9980; g.dinars = []; __T.game._.resync(); });
  await pg.waitForFunction(() => window.__TWIN && __TWIN.on(), null, { timeout: 15000 }).catch(() => {});
  await pg.waitForTimeout(1500);
  console.log(await pg.evaluate(() => { __T.game.juice.hit('rock', { at: null, text: '+1', perfect: true }); return JSON.stringify(__T.game.score.get()); }));
  const shot = async (n) => { await pg.evaluate(() => { __T.simulate(false); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, n + '.png'), timeout: 240000 }); await pg.evaluate(() => { window.__HUD_HOLD = false; }); console.log('shot', n); };
  const t0 = Date.now(); let got = false;
  while (Date.now() - t0 < 60000) {
    const st = await pg.evaluate(() => ({ dn: !!document.querySelector('.gm-dn'), land: !!document.querySelector('.gm-dn.land'), un: __T.game.score.unseen().length, cap: document.querySelector('.gm-sc') && document.querySelector('.gm-sc').className }));
    if (st.land && !got) { got = true; await pg.waitForTimeout(500); await shot('dinar-land'); console.log(JSON.stringify(st)); }
    if (got && !st.dn) { console.log('celebration done in', Math.round((Date.now() - t0) / 1000), 's'); break; }
    await pg.waitForTimeout(250);
  }
  console.log('after', await pg.evaluate(() => JSON.stringify({ g: __T.game.score.get(), list: __T.game.score.list(), cap: document.querySelector('.gm-sc').textContent })));
  await shot('dinar-after');
  await pg.evaluate(() => __T.game.ui.openSheet('treasure')); await pg.waitForTimeout(500); await shot('treasure');
  console.log('errors', logs.slice(0, 3));
  await b.close();
})().catch((e) => { console.error(e); process.exit(2); });
