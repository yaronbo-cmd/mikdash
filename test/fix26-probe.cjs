// FIX26 probe: where a two-finger pinch's pointers land in #avodah, and who sees them
const { chromium } = require('playwright'); const path = require('path');
const ROOT = path.resolve(__dirname, '..');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage();
  await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'אביתר', mishmar: 3, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* */ } window.__START_PAUSED = true; window.__DT_MAX = 0.6;
    window.__PL = []; for (const t of ['pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'touchstart', 'lostpointercapture', 'gotpointercapture']) window.addEventListener(t, (e) => { if (window.__PL.length < 60) window.__PL.push([t, e.pointerId, e.target && (e.target.id || e.target.className || e.target.tagName), Math.round(e.clientX || 0)]); }, true); });
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
  await pg.waitForFunction(() => window.__DAY && __TWIN.on(), null, { polling: 200, timeout: 60000 });
  await pg.waitForTimeout(1500);
  console.log('at', JSON.stringify(await pg.evaluate(() => [[300, 170], [550, 170], [422, 100]].map(([x, y]) => { const e = document.elementFromPoint(x, y); return [x, y, e && (e.id || e.className || e.tagName), e && getComputedStyle(e).touchAction]; }))));
  const cdp = await ctx.newCDPSession(pg);
  const T = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1, radiusX: 6, radiusY: 6, force: 1 })) });
  await T('touchStart', [[292, 170]]); console.log('c1', JSON.stringify(await pg.evaluate(() => __TWIN.cam()))); await T('touchStart', [[292, 170], [552, 170]]); console.log('c2', JSON.stringify(await pg.evaluate(() => __TWIN.cam())));
  for (let i = 1; i <= 8; i++) { const d = 260 - 190 * i / 8; await T('touchMove', [[422 - d / 2, 170], [422 + d / 2, 170]]); await pg.waitForTimeout(30); }
  console.log('c3', JSON.stringify(await pg.evaluate(() => __TWIN.cam()))); await T('touchEnd', []); await pg.waitForTimeout(1500); console.log('c4', JSON.stringify(await pg.evaluate(() => __TWIN.cam())), JSON.stringify(await pg.evaluate(() => window.__PL.slice(0, 12))));
  await pg.evaluate(() => { window.__PL = []; });
  await T('touchStart', [[500, 120]]); await T('touchStart', [[500, 120], [700, 120]]);
  for (let i = 1; i <= 8; i++) { await T('touchMove', [[500 + i * 10, 120], [700 - i * 10, 120]]); await pg.waitForTimeout(30); }
  await T('touchEnd', []);
  await pg.waitForTimeout(1500);
  console.log('log', JSON.stringify(await pg.evaluate(() => window.__PL)));
  console.log('zoom', await pg.evaluate(() => __TWIN.cam().zoom), 'vv', await pg.evaluate(() => window.visualViewport && visualViewport.scale));
  await pg.evaluate(() => { window.__PL = []; });
  await T('touchStart', [[300, 200]]); await T('touchStart', [[300, 200], [560, 200]]);
  for (let i = 1; i <= 8; i++) { await T('touchMove', [[300 + i * 12, 200], [560 - i * 12, 200]]); await pg.waitForTimeout(30); }
  console.log('mid zoom', await pg.evaluate(() => __TWIN.cam().zoom));
  await T('touchEnd', []);
  await pg.waitForTimeout(1500);
  console.log('log2', JSON.stringify(await pg.evaluate(() => window.__PL)));
  console.log('zoom2', await pg.evaluate(() => __TWIN.cam().zoom));
  await b.close();
})();
