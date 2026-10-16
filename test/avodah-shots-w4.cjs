// Wave 4 (26 Sep 2026): real-build phone screenshots of the moments this wave changed — the 3D lamb choice and the
// close-up on the drawn parts, the reframed shots of QA P2-6 (payis2, barkai, evarim, after the zerika) and the ⚑ wicket
// route into the Heichal. The loop is paused (SwiftShader is slow): each shot waits for the game's own camera flight
// (world.look / sanctuary.focus run on the wall clock), then renders once.
//   node build.mjs && NODE_PATH=... node test/avodah-shots-w4.cjs [names]     → test/out/avodah/w4-phone-*.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = path.resolve(__dirname, 'out/avodah');
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[2] ? process.argv[2].split(',') : null;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run', '--disable-background-networking'] });
  const logs = [];
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 });
    const pg = await ctx.newPage();
    pg.on('console', (m) => { const t = m.text(); if (m.type() === 'error' && !/ERR_TUNNEL|fonts\.g/.test(t)) logs.push('error: ' + t); else if (m.type() === 'warning' && /\[avodah\]/.test(t)) logs.push('warn: ' + t); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      window.__AV_NOW = Date.parse('2026-09-27T05:40:00+03:00'); window.__AV_T0 = performance.now();
      try { localStorage.clear(); localStorage.setItem('bh_beta2', JSON.stringify({ v: 5, name: 'אלעזר', mishmar: 8 })); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, pid: 'pw4', name: 'אלעזר', mishmar: 8, seenIntro: true })); } catch (e) { /* ignore */ }
    });
    const t0 = Date.now();
    await pg.goto('file://' + path.resolve(__dirname, '../dist/test.html') + '#avodah');
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__AVODAH, null, { timeout: 400000, polling: 1000 });
    console.log('booted in', ((Date.now() - t0) / 1000).toFixed(0), 's');
    const shot = async (name) => {
      const t1 = Date.now();
      await pg.evaluate(() => { window.__HUD_HOLD = true; window.__T.render(); window.__T.render(); });
      await pg.screenshot({ path: path.join(OUT, `w4-phone-${name}.png`), timeout: 300000 });
      await pg.evaluate(() => { window.__HUD_HOLD = false; });
      console.log('shot', name, ((Date.now() - t1) / 1000).toFixed(0) + ' s');
    };
    const open = async (g) => {
      await pg.evaluate((g) => { window.__AVODAH._.run(g); }, g);
      await pg.waitForFunction(() => document.querySelector('.av-mg.on'), null, { timeout: 90000, polling: 250 });
    };
    const leave = async () => {   // skip what is left and close the cards, back to the home
      await pg.evaluate(() => { const s = document.querySelector('.av-mg .av-skip'); if (s) s.click(); });
      for (let i = 0; i < 20; i++) { await sleep(500); const busy = await pg.evaluate(() => { const g = document.querySelector('.av-modal.on .av-go'); if (g) g.click(); return window.__AVODAH.busy; }); if (!busy) break; }
    };
    const want = (n) => !only || only.includes(n);
    if (want('payis2')) { await open('payis2'); await sleep(3500); await shot('payis2'); await leave(); }
    if (want('barkai')) { await open('barkai'); await sleep(3500); await shot('barkai'); await leave(); }
    if (want('taleh')) {
      await open('taleh'); await sleep(3500);
      const rings = await pg.evaluate(() => document.querySelectorAll('.av3d-t[data-key^="lamb-"]:not(.off)').length);
      console.log('   taleh: lamb rings on screen', rings);
      await shot('taleh-choose');
      // choose the first lamb by its ring; then the close-up with the cup at its mouth
      await pg.evaluate(() => { const t = document.querySelector('.av3d-t[data-key="lamb-0"]') || document.querySelector('.av-lambmini .av-hit'); if (t) t.dispatchEvent(new MouseEvent('click', { bubbles: true })); if (t && t.classList.contains('av-hit')) t.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); });
      await sleep(3000);
      await pg.evaluate(() => { const t = document.querySelector('.av3d-t[data-key="cup"]'); if (t) t.dispatchEvent(new MouseEvent('click', { bubbles: true })); else { const c = document.querySelector('.av-cup .av-hit'); if (c) c.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })); } });
      await sleep(2500);
      const parts = await pg.evaluate(() => [...document.querySelectorAll('.av3d-t[data-key^="part-"]:not(.off)')].map((t) => t.dataset.key).join(','));
      console.log('   taleh: part rings on screen', parts || '(none — the illustrated card)');
      await shot('taleh-close');
      if (process.env.W4_DEBUG) console.log('   taleh: looks', JSON.stringify(await pg.evaluate(() => window.__AVODAH.world.calls.filter((c) => /^look$|animal\(/.test(c.fn) || c.fn === 'avodah.animal').slice(-8).map((c) => c.fn + ' ' + JSON.stringify(c.args).slice(0, 150)))), 'camera', JSON.stringify(await pg.evaluate(() => [window.__T.camera.position.toArray().map((v) => +v.toFixed(1)), window.__T.controls.target.toArray().map((v) => +v.toFixed(1))])));
      await leave();
    }
    if (want('zerika')) {
      await open('zerika'); await sleep(3000);
      await pg.evaluate(() => window.__AVODAH._.solve());
      await pg.waitForFunction(() => document.querySelector('.av-modal.on'), null, { timeout: 90000, polling: 250 });
      await sleep(2500);
      await shot('zerika-after');
      await leave();
    }
    if (want('evarim')) { await open('evarim'); await sleep(3500); await shot('evarim'); await leave(); }
    if (want('wicket')) {
      await pg.evaluate(() => { window.__AV_WICKET = true; });
      await open('heichal'); await sleep(9000);
      const g = await pg.evaluate(() => { const t = document.querySelector('.av3d-t[data-key="gate"]'); return t ? { off: t.classList.contains('off'), label: t.textContent } : null; });
      console.log('   heichal (wicket): gate ring', JSON.stringify(g), 'room', await pg.evaluate(() => (window.__AVODAH.world.sanctState() || {}).room));
      await shot('heichal-wicket');
      await leave();
      await pg.evaluate(() => { window.__AV_WICKET = false; });
    }
    await ctx.close();
  } finally { await b.close(); }
  console.log(logs.length ? logs.slice(0, 12).join('\n') : 'no errors');
})().catch((e) => { console.error(e); process.exit(1); });
