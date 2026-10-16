// QA: what the Phase B home shows on the days the investors may open it (phone 390×844, real build, #avodah).
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/qa-holiday.cjs → test/out/qa/holiday-*.png + the text
// Shabbat + Sukkot day 1 (26.9.2026 09:30) and Chol HaMoed (28.9.2026 10:00), a returning player (intro seen).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/qa');
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const DAYS = [['shabbat-sukkot1', '2026-09-26T09:30:00+03:00'], ['cholhamoed', '2026-09-28T10:00:00+03:00']];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const [tag, when] of DAYS) {
      const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('pageerror', (e) => errs.push(e.message));
      pg.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|ERR_/.test(m.text())) errs.push(m.text()); });
      await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
      await pg.addInitScript((when) => {
        window.__FORCE_Q = 'normal'; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
        window.__AV_NOW = Date.parse(when); window.__AV_T0 = performance.now();
        try {
          localStorage.clear();
          localStorage.setItem('bh_beta2', JSON.stringify({ v: 5, name: 'אלעזר', mishmar: 8 }));
          localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, pid: 'pqa', name: 'אלעזר', mishmar: 8, seenIntro: true }));
        } catch (e) { /* */ }
      }, when);
      await pg.goto('file://' + path.join(ROOT, 'dist/test.html') + '#avodah');
      await pg.waitForFunction(() => window.__T && window.__T.booted && window.__AVODAH && document.querySelector('.av-home.on'), null, { timeout: 400000, polling: 500 });
      await sleep(3000);
      const txt = await pg.evaluate(() => ({ status: (document.querySelector('.av-status') || {}).innerText || '', home: (document.querySelector('.av-home.on .av-body') || {}).innerText || '' }));
      console.log(`== ${tag} (${when})\nstatus: ${txt.status.replace(/\s+/g, ' ')}\nhome: ${txt.home.replace(/\s+/g, ' ').slice(0, 900)}`);
      await pg.evaluate(() => { __T.render(); __T.render(); window.__HUD_HOLD = true; });
      await pg.screenshot({ path: path.join(OUT, `holiday-${tag}.png`), timeout: 400000 });
      await pg.evaluate(() => { const b = document.querySelector('.av-home.on .av-body'); if (b) b.scrollTop = b.clientHeight * 0.85; });
      await sleep(300);
      await pg.screenshot({ path: path.join(OUT, `holiday-${tag}-scroll.png`), timeout: 400000 });
      console.log('errors:', errs.slice(0, 5));
      await ctx.close();
    }
  } finally { await b.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
