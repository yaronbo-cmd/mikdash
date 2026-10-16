// Real-build screenshots of Phase B key moments (three.js world in SwiftShader + the Phase B HUD).
//   node build.mjs && node test/avodah-shots.cjs [phone|desktop|both]
// Uses the temporary '#avodah' entry of src/main.js. The render loop is paused (SwiftShader is slow): each shot
// flies the camera through the game's own world.look, then renders once. Output: test/out/avodah/real-*.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = path.resolve(__dirname, 'out/avodah');
fs.mkdirSync(OUT, { recursive: true });
const which = process.argv[2] || 'both';
const only = process.argv[3] ? process.argv[3].split(',') : null;          // e.g. home,shoevah
const SIZES = { phone: { width: 390, height: 844, mobile: true }, desktop: { width: 1280, height: 720, mobile: false } };
const MOMENTS = {
  phone: [['home', null, 'night'], ['altar', null, 'night'], ['payis2', 'payis2', 'dawn'], ['deshen', 'deshen', 'night'], ['zerika', 'zerika', 'dawn'], ['shir', 'shir', 'dawn']],
  desktop: [['home', null, 'night'], ['ketoret', 'ketoret', 'dawn'], ['korbanot', 'korbanot', 'noon'], ['shoevah', 'shoevah', 'night']],
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run', '--disable-background-networking'] });
  try {
    for (const k of which === 'both' ? ['phone', 'desktop'] : [which]) {
      const S = SIZES[k];
      const ctx = await b.newContext({ viewport: { width: S.width, height: S.height }, isMobile: S.mobile, hasTouch: S.mobile, deviceScaleFactor: 1 });
      const pg = await ctx.newPage();
      const logs = [];
      pg.on('console', (m) => { if (m.type() === 'error') logs.push('error: ' + m.text()); });
      pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
      await pg.addInitScript(() => {
        window.__FORCE_Q = 'normal'; window.__START_PAUSED = true;
        window.__AV_NOW = Date.parse('2026-09-25T20:00:00+03:00'); window.__AV_T0 = performance.now();
        try { localStorage.clear(); localStorage.setItem('bh_beta2', JSON.stringify({ v: 5, name: 'אלעזר', mishmar: 8 })); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, pid: 'pdemo', name: 'אלעזר', mishmar: 8, seenIntro: true })); } catch (e) { /* ignore */ }
      });
      const t0 = Date.now();
      await pg.goto('file://' + path.resolve(__dirname, '../dist/test.html') + '#avodah');
      await pg.waitForFunction(() => window.__T && window.__T.booted && window.__AVODAH, null, { timeout: 400000, polling: 1000 });
      console.log(k, 'booted in', ((Date.now() - t0) / 1000).toFixed(0), 's');
      for (const [name, game, tod] of MOMENTS[k].filter(([n]) => !only || only.includes(n))) {
        const t1 = Date.now();
        await pg.evaluate((t) => { window.__T.setTime(t); }, tod);
        if (game) {
          await pg.evaluate((g) => { window.__AVODAH._.run(g); }, game);
          await pg.waitForFunction(() => document.querySelector('.av-mg.on'), null, { timeout: 60000, polling: 250 });
          await pg.waitForTimeout(3200);                    // the camera flight (world.look) runs in __T.simulate
          await pg.evaluate((t) => { window.__T.setTime(t); }, tod);
        } else {
          if (name === 'altar') {            // the home folded away: the status bar over the night altar
            await pg.evaluate(() => { const h = document.querySelector('.av-home'); if (h && h.classList.contains('on')) document.querySelector('[data-a="home"]').click(); });
            await pg.evaluate(() => window.__T.look([-2, 44, 44], [-40, 21, -5]));
          } else await pg.evaluate((ph) => (ph ? window.__T.look([-10, 90, 110], [-30, 0, 40]) : window.__T.look([-2, 60, 90], [-60, 20, 0])), S.mobile);
        }
        await pg.evaluate(() => { window.__HUD_HOLD = true; window.__T.render(); window.__T.render(); });
        await pg.screenshot({ path: path.join(OUT, `real-${k}-${name}.png`), timeout: 240000 });
        await pg.evaluate(() => { window.__HUD_HOLD = false; });
        console.log('shot', k, name, ((Date.now() - t1) / 1000).toFixed(0) + 's');
        if (game) {
          await pg.evaluate(() => { const s = document.querySelector('.av-mg .av-skip'); if (s) s.click(); });
          for (let i = 0; i < 6; i++) { await pg.waitForTimeout(400); await pg.evaluate(() => { const g = document.querySelector('.av-modal.on .av-go'); if (g) g.click(); }); }
        }
      }
      console.log(logs.length ? logs.slice(0, 8).join('\n') : 'no errors');
      await ctx.close();
    }
  } finally { await b.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
