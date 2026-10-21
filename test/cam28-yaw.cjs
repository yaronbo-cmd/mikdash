// CAM28 probe (not a gate): which way does the hero face for his yaw? two frames — the camera at (sin yaw, cos yaw) and at its opposite
const { chromium } = require('playwright');
const path = require('path');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/cam28');
const SAVE = { v: 1, name: 'אביתר', mishmar: 3, seenIntro: true };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage();
  await pg.addInitScript((sv) => { try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ ...sv, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* */ } window.__START_PAUSED = true; }, SAVE);
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
  await pg.waitForFunction(() => window.__DAY && window.__TWIN && __TWIN.on(), null, { polling: 200, timeout: 60000 });
  await pg.waitForTimeout(3500);
  for (const [nm, sg] of [['plus', 1], ['minus', -1]]) {
    const r = await pg.evaluate((sg) => { __T.simulate(false); __DAY.D.exit(); const h = {}; __T.stages.hero.show(true); __T.stages.hero.setPos(-15, 0, Math.PI / 2); __T.stages.heroXYZ(h); const s = Math.sin(h.yaw), c = Math.cos(h.yaw);
      __T.view.closeCam(true, 'probe'); for (const e of document.querySelectorAll('.dy-say,.dy-hud,.tw-mk')) e.style.display = 'none'; __T.look([h.x + sg * s * 9, h.y + 6.5, h.z + sg * c * 9], [h.x, h.y + 5, h.z]); __T.render(); __T.render(); return { yaw: h.yaw }; }, sg);
    await pg.screenshot({ path: path.join(OUT, `yaw-${nm}.png`) }); console.log(nm, JSON.stringify(r));
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(1); });
