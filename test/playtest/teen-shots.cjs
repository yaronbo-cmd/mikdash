// (wave 6, FUN) Two real-3D phone frames for the teen playtest: what נועם and מאיה see in the first seconds (the Mount and the
// first coach) and at the wall mid-build (the hero at work). One browser, closed in finally; the loop is paused and each frame
// is rendered on demand (SwiftShader: 20–300 s a frame under load).
//   node test/playtest/teen-shots.cjs [--label=v14]   → test/out/playtest/teen-<label>-<scene>.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'test/out/playtest');
fs.mkdirSync(OUT, { recursive: true });
const LABEL = (process.argv.find((a) => a.startsWith('--label=')) || '--label=v14').slice(8);
const PAGE = (process.argv.find((a) => a.startsWith('--page=')) || '').slice(7) || path.join(ROOT, 'dist/test.html');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'dusk'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    });
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const t0 = Date.now();
    await pg.goto('file://' + PAGE);
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 300000 });
    console.log(`booted in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    const G = (fn, a) => pg.evaluate(fn, a);
    const shot = async (scene) => {
      await G(() => { __T.render(); __T.game.frame(performance.now()); });
      const f = path.join(OUT, `teen-${LABEL}-${scene}.png`);
      const s0 = Date.now();
      await pg.screenshot({ path: f, timeout: 300000 });
      console.log(`  shot ${path.relative(ROOT, f)} (${((Date.now() - s0) / 1000).toFixed(0)} s)`);
    };
    await pg.waitForFunction(() => __T.game.state.ftue >= 1, null, { polling: 200, timeout: 30000 }).catch(() => {});
    await pg.waitForTimeout(500);
    await shot('first-seconds');
    if (process.argv.includes('--v6')) {      // BUILD's state v6 (a merge): the first key stone's crane sheet over the site, then the wall mid-build
      await G(() => { const g = __T.game.state; g.ftue = 99; __T.game.ui.coach(null, ''); g.st.har = { done: true }; g.res.silver = 200; g.res.stone = 300; __T.game._.resync(); });
      await pg.click('.gm-pill').catch(() => {});                        // starts the wall (its survey, paid in silver)
      await G(() => { const s = __T.game.state.st.wall; if (s) { s.p = 'courses'; s.dp = 1; s.set = 0; s.paid = 8; } __T.game._.resync(); __T.stages.focus && __T.stages.focus('wall', 10); });
      await G(() => { window.__KS = __T.game._.keyStone('wall'); });      // BUILD: the first key stone → FUN's crane sheet over the site
      await pg.waitForSelector('.fx-mg', { timeout: 20000 }).catch(() => console.log('  (no precision sheet within 20 s)'));
      await pg.waitForTimeout(2500);                                      // the sheet's own loop (its canvas) runs on real frames
      for (let k = 0; k < 2; k++) await G(() => { __T.render(); });
      await shot('v6-key-stone');
      await G(() => { window.__MG_AUTO = true; const b = document.querySelector('.fx-mg .fx-skip, .fx-mg [data-skip]'); if (b) b.click(); });
      await pg.waitForFunction(() => !document.querySelector('.fx-mg'), null, { timeout: 60000 }).catch(() => {});
      await G(() => { const g = __T.game.state, s = g.st.wall; if (s) { s.set = Math.min(s.n - 8, 70); s.paid = s.set + 8; } __T.game._.resync(); __T.stages.focus && __T.stages.focus('wall', 10); });
      await G(() => { try { __T.game._.doAction({ kind: 'work', id: 'wall' }); } catch (e) { /* */ } __T.pause && __T.pause(false); });
      await pg.waitForTimeout(8000);                                      // the walk and the first strokes
      await G(() => { __T.pause && __T.pause(true); });
      for (let k = 0; k < 4; k++) await G(() => { __T.render(); });
      await shot('v6-wall-build');
      if (logs.length) console.log('errors:', logs.slice(0, 5));
      return;
    }
    // the wall mid-build: the builder at the wall with a crew, as the player sees it after ~1 minute
    await G(() => {
      const g = __T.game.state; g.ftue = 99; __T.game.ui.coach(null, ''); g.story.priests = 1;
      g.st.har = { done: true }; g.bh = g.bh.map(() => 0); g.st.wall = { w: 30, ph: 2 };
      g.crews = [{ at: 'wall' }, { at: 'quarry' }]; g.res.cedar = 40; g.res.stone = 300;
      __T.game._.resync(); __T.stages.focus('wall', 10);
    });
    await pg.evaluate(() => __T.game.onSiteTap('wall'));
    for (let k = 0; k < 6; k++) { await G(() => __T.render()); }
    await shot('wall-build');
    if (logs.length) console.log('errors:', logs.slice(0, 5));
  } finally { await b.close(); }
})().catch((e) => { console.error(e); process.exit(2); });
