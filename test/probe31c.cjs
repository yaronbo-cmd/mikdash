// ── flow31 ── probe31c.cjs (dev): shift29-world's lab — the bar's colour and the stick's two legs, with the walk/twin state ── /flow31 ──
const { chromium } = require('playwright'); const path = require('path');
const ROOT = path.resolve(__dirname, '..'); const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage(); pg.on('pageerror', (e) => console.log('PAGEERR', e.message)); pg.on('console', (m) => { if (m.type() === 'error') console.log('CONSOLE', m.text().slice(0, 200)); });
  await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'דרור', mishmar: 5, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* */ } window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__CAM28_NOHINT = true; });
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
  await pg.waitForFunction(() => window.__DAY && __DAY.twin && __TWIN.on() && __DAY.D.active, null, { polling: 200, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x, y, id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); }; const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  await sleep(600); await G(() => { __DAY.clock.resume(); __DAY.clock.skipTo(7); __DAY.tasks.sync(); __DAY.D.refresh(); });
  console.log('lab', await G(() => __SHIFTLAB.start({ spawn: false, patienceS: 300 }).then((m) => !!m)));
  await sleep(1500);
  const sp = await G(() => { const M = __SHIFTLAB.mods; M.P.clear(); for (const t of ['olah', 'ken', 'mincha']) M.P.spawn(t); return M.P.list().length; }); console.log('spawned', sp);
  await sleep(2500);
  console.log('chips', JSON.stringify(await G(() => __SHIFTLAB.mods.P.list().map((P) => ({ id: P.id, st: P.state, tr: P.el && P.el.style.transform, cls: P.el && P.el.className, bar: P._bar && P._bar.style.background, pat: P.patience })))), JSON.stringify(await G(() => __S29D())));
  await G(() => { const L = __SHIFTLAB.mods.P.list(); for (const P of L) P.patience = 0.4; }); await sleep(1500);
  console.log('bars@0.4', JSON.stringify(await G(() => __SHIFTLAB.mods.P.list().map((P) => [P.id, P._bar && P._bar.style.background, P._bar && getComputedStyle(P._bar).backgroundColor, P.el.style.transform]))), JSON.stringify(await G(() => __S29D())));
  const st = () => G(() => { const h = __T.stages.heroXYZ({}); return { h: [+h.x.toFixed(2), +h.z.toFixed(2)], w: __S29W.state(), stick: __TWIN.stick ? __TWIN.stick() : null, mul: __T.stages.hero.speedMul, hold: document.querySelector('.dy-sheet.on, .card.on') ? 'card' : '', top: (() => { const t = document.elementFromPoint(150, 300); return t ? t.className + '' : ''; })() }; });
  await G(() => __SHIFTLAB.mods.cam.off());
  for (const mul of [1, 1.8]) {
    await G(([m]) => { __T.stages.hero.setPos(-14, 0, Math.atan2(-16, 0)); __T.stages.hero.speedMul = m; }, [mul]); await sleep(400);
    console.log('before', mul, JSON.stringify(await st()));
    await down(3, 150, 300); for (let k = 1; k <= 6; k++) { await move(3, 150 + 10 * k, 300 - 6 * k); await sleep(30); } await sleep(700);
    console.log('during', mul, JSON.stringify(await st())); await up(3); await sleep(300);
  }
  await b.close();
})().catch((e) => { console.error(e); process.exit(2); });
