const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage();
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; try { if (!sessionStorage.getItem('__keep')) localStorage.clear(); } catch (e) {} });
  await pg.goto('file://' + path.join(__dirname, '../dist/test.html'));
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
  await pg.waitForTimeout(3000);
  console.log(await pg.evaluate(() => { const g = __T.game.state; g.ftue = 99; g.score = 10050; g.dinars = [{ n: 1, stage: 'har', t: 1, seen: 1 }]; __T.simulate(false); __T.game.destroy(); sessionStorage.setItem('__keep', '1'); return Object.keys(localStorage).map((k) => k + ':' + localStorage.getItem(k).length + ':' + /"score":10050/.test(localStorage.getItem(k))); }));
  await pg.reload();
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
  await pg.waitForTimeout(3000);
  console.log(await pg.evaluate(() => ({ keys: Object.keys(localStorage), keep: sessionStorage.getItem('__keep'), score: __T.game.state.score, dinars: (__T.game.state.dinars || []).length })));
  await b.close();
})();
