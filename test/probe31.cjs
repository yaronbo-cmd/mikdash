// ── flow31 ── probe31.cjs — a quick look (dev): boot #shift=1, take the pilgrim by the button, report the flow's state, two shots ── /flow31 ──
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/probe31'); fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage(); pg.on('pageerror', (e) => console.log('PAGEERR', e.message)); pg.on('console', (m) => { if (m.type() === 'error' || /\[shift\]/.test(m.text())) console.log('CONSOLE', m.text().slice(0, 200)); });
  await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'דרור', mishmar: 5, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* */ } window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__CAM28_NOHINT = true; });
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html') + '#shift=1');
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__SHIFT && __SHIFT.state() && __SHIFT.state().phase === 'run', null, { polling: 200, timeout: 240000 });
  const G = (fn) => pg.evaluate(fn);
  const rep = () => G(() => ({ s: __SHIFT.state(), next: __SHIFT.E.flowNext && __SHIFT.E.flowNext(), f: window.__F31 && __F31.state(), d: __S29D(), spec: __TWIN.spec(), lb: document.querySelector('.tw-btn .tw-lb').textContent, chips: [...document.querySelectorAll('.s29-st,.s29-pc')].map((e) => [e.dataset.st || e.dataset.pid, e.className]) }));
  await sleep(3500); console.log('A', JSON.stringify(await rep()));
  const steps = +(process.argv[2] || 3);
  for (let i = 0; i < steps; i++) { await G(() => { const s = __TWIN.spec(); const W = __SHIFT.E.work({ ...(__T.stages.heroXYZ({})) }); if (W && W.go) W.go(); }); await sleep(2500); console.log('B' + i, JSON.stringify(await rep())); await G(() => { window.__HUD_HOLD = true; __T.render(); }); await pg.screenshot({ path: path.join(OUT, `p${i}.png`) }); await G(() => { window.__HUD_HOLD = false; }); }
  await b.close();
})().catch((e) => { console.error(e); process.exit(2); });
