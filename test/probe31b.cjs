// ── flow31 ── probe31b.cjs (dev): the first walk of a round — his pace, the walk's state, the camera's turn, sampled every 0.4 s ── /flow31 ──
const { chromium } = require('playwright'); const path = require('path');
const ROOT = path.resolve(__dirname, '..'); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage(); pg.on('pageerror', (e) => console.log('PAGEERR', e.message));
  await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'דרור', mishmar: 5, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* */ } window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__CAM28_NOHINT = true; });
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html') + '#shift=1');
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__SHIFT && __SHIFT.state() && __SHIFT.state().phase === 'run', null, { polling: 200, timeout: 240000 });
  const G = (fn) => pg.evaluate(fn);
  const samp = () => G(() => { const h = __T.stages.heroXYZ({}); const c = __S29C.state(); return { t: __SHIFT.state().t, h: [+h.x.toFixed(1), +h.z.toFixed(1)], lb: document.querySelector('.tw-btn .tw-lb').textContent, w: __S29W.state(), c: { mode: c.mode, az: c.az, want: c.want, off: c.off, arc: c.arc, k: c.k }, goal: __SHIFT.debug.goal(), next: __SHIFT.state().flowNext, log: __SHIFT.debug.log().slice(-3) }; });
  await sleep(1500);
  for (let leg = 0; leg < 3; leg++) {
    const r = await G(() => { const W = __SHIFT.E.work(__T.stages.heroXYZ({})); if (W && W.go) W.go(); return W && W.label; }); console.log('GO', r);
    for (let i = 0; i < 16; i++) { await sleep(400); const s = await samp(); console.log(JSON.stringify({ t: s.t, h: s.h, lb: s.lb, w: [s.w.on, s.w.why, s.w.plan, s.w.L, s.w.i, s.w.pts], c: s.c, goal: s.goal && [s.goal.ext, s.goal.p, s.goal.stuck], log: s.log })); if (!s.w.on && i > 2) break; }
    await sleep(4500);
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(2); });
