// A few screenshots of the engagement layer in the REAL 3D build (dist/test.html, SwiftShader; slow: one frame can take
// 10–60 s). The render loop is paused and every shot renders one frame on demand, like test/game-e2e.cjs.
//   node test/playtest/real-shots.cjs [--no-build]      → test/out/playtest/real-<scene>.png
// Scenes: the first coach (FTUE), the fork in the road (pill + strip), the rest card, a return visit (welcome card),
// the Sukkot card, and the investor's highlight reel at the Heichal.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'test/out/playtest');
fs.mkdirSync(OUT, { recursive: true });
if (!process.argv.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const results = [];
  try {
    const ctx = await b.newContext({ viewport: { width: 400, height: 860 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true;
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    });
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const t0 = Date.now();
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    console.log(`booted in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    const G = (fn, a) => pg.evaluate(fn, a);
    const shot = async (scene) => {
      await G(() => __T.simulate(false));
      await G(() => { __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const f = path.join(OUT, `real-${scene}.png`);
      const s0 = Date.now();
      await pg.screenshot({ path: f, timeout: 240000 });
      await G(() => { window.__HUD_HOLD = false; });
      console.log(`  shot ${path.relative(ROOT, f)} (${((Date.now() - s0) / 1000).toFixed(0)} s)`);
      results.push(scene);
    };
    const dismiss = async () => { for (let k = 0; k < 6; k++) { const on = await pg.$('.gm-modal.on .gm-btn-gold'); if (!on) break; await on.click(); await pg.waitForTimeout(350); } };

    // 1. the first coach: "הקש על הסלע"
    await pg.waitForFunction(() => __T.game.state.ftue >= 1, null, { polling: 100, timeout: 20000 }).catch(() => {});
    await pg.waitForTimeout(400);
    await shot('ftue-coach');

    // 2. the fork in the road: the wall done, the gates wait for rafts four minutes away, Ezrat Nashim can begin
    await G(() => {
      const g = __T.game.state; g.ftue = 99; __T.game.ui.coach(null, ''); g.story.priests = 1;
      g.st.har = { done: true }; g.bh = g.bh.map(() => 0); g.st.wall = { done: true };
      g.crews = [{ at: 'gates' }, { at: 'quarry' }]; g.routes = ['wagons', 'cedar', 'alexandria', 'beitkerem'];
      g.res.cedar = 0; g.res.stone = 400; g.st.gates = { w: 6, ph: 1 };
      g.car = [{ r: 'cedar', len: 'ftue', t0: Date.now(), t1: Date.now() + 239000, y: 120 }, { r: 'wagons', len: 'short', t0: Date.now(), t1: Date.now() + 1500000, y: 60 }];
      g.carCount = { wagons: 1, cedar: 1 };
      __T.game._.resync(); __T.stages.focus('gates', 10);
    });
    await pg.waitForTimeout(1500);
    const pill = await G(() => document.querySelector('.gm-pill').textContent + ' ‖ ' + (document.querySelector('.gm-next') || {}).textContent);
    console.log('  pill:', pill);
    await shot('fork-pill-strip');

    // 3. the rest card: every open site waits; the game says it is a good time to stop
    await G(() => { const g = __T.game.state; g.st.nashim = { w: 6.6, ph: 1 }; g.st.yesod = { w: 6, ph: 1 }; g.res.wstone = 0; g.car.push({ r: 'beitkerem', len: 'ftue', t0: Date.now(), t1: Date.now() + 470000, y: 60 }); g.carSlots = 3; __T.game._.resync(); __T.game.engagement._.restNow(); });
    await pg.waitForSelector('.gm-modal.on', { timeout: 8000 }).catch(() => {});
    await pg.waitForTimeout(500);
    await shot('rest-card');
    await dismiss();

    // 4. a return visit after three hours: the welcome card starts with what to do first
    await G(() => { const g = __T.game.state; g.res.cedar = 300; g.crews[0].at = 'gates'; __T.game._.simulateAbsence(3 * 3600 * 1000); });
    await pg.waitForSelector('.gm-modal.on', { timeout: 8000 }).catch(() => {});
    await pg.waitForTimeout(2500);
    await shot('welcome');
    await dismiss();

    // 5. the festival card (Sukkot: the Water Gate)
    await G(() => __T.game.engagement._.festival('sukkot'));
    await pg.waitForSelector('.gm-modal.on', { timeout: 5000 }).catch(() => {});
    await pg.waitForTimeout(400);
    await shot('sukkot');
    await dismiss();

    // 6. the investor: demo mode, the highlight reel jumps to the Heichal's gold
    await G(() => __T.game.switchMode(true));
    await pg.waitForTimeout(800);
    await dismiss();
    await G(() => { const g = __T.game.state; g.ftue = 99; __T.game.ui.coach(null, ''); for (const id of ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam']) g.st[id] = { done: true }; g.bh = g.bh.map(() => 0); __T.game._.resync(); });
    await G(() => { __T.game.demoNext(); });
    await pg.waitForTimeout(2600);
    await shot('demo-heichal');
    const bad = logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l));
    console.log(bad.length ? 'console errors: ' + bad.slice(0, 3).join(' | ') : 'no console errors');
    await ctx.close();
  } finally {
    await b.close();
  }
  console.log(`${results.length} shots`);
})().catch((e) => { console.error(e); process.exit(2); });
