// WATER (wave 6): a few targeted phone-portrait shots of world.water in the real build (dist/test.html, the finished
// Temple: __NO_GAME). One browser, closed in finally; the loop is paused and each frame is rendered on demand.
//   node build.mjs && NODE_PATH=<playwright> node test/water-world.cjs [shot …] [--night]
// Shots → test/out/water/world_<name>.png; draw calls at the kiyor view on the console.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/water');
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const T0 = Date.now(), log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(0).padStart(4)}s]`, ...a);
const SHOTS = [
  // (ambient life off: no pilgrims, washers or twelve of their own while the shots are set up)
  { name: 'kiyor', pre: '__T.avodah.ambient(false); __T.water.kiyor({ spigots: 12, flow: 1, ms: 0 }); await RUN(1.6)', p: [-45, 27, 38], t: [-62.5, 20, 20] },
  // one kohen washing, three frames: he bends and the water starts / hands and feet under it / straightened, the water runs off
  { name: 'wash1', pre: '__T.water.kiyor({ spigots: 0, ms: 0 }); await RUN(1.2); window.K = __T.avodah.kohen("ww", { at: [-56.5, 22.5] }); window.KP = K.wash(); await RUN(2.9)', p: [-58.6, 22.9, 28.2], t: [-60.9, 20.3, 20.8] },
  { name: 'wash2', pre: 'await RUN(1.1)', p: [-58.6, 22.9, 28.2], t: [-60.9, 20.3, 20.8] },
  { name: 'wash3', pre: 'await RUN(2.9)', p: [-58.6, 22.9, 28.2], t: [-60.9, 20.3, 20.8] },
  // the twelve at once (Yoma 37a)
  { name: 'twelve', pre: 'K.remove(); await RUN(0.8); window.TW = __T.water.washTogether(); await RUN(5.6)', p: [-50.5, 25.5, 31], t: [-63.5, 19.6, 20] },
  // the runoff down the steps to the drain grate by the altar, the amah's grates east of it
  { name: 'drain', pre: 'await RUN(2.2)', p: [-40, 27, 36], t: [-55, 16.5, 17.5] },
  { name: 'shitin', pre: '__T.water.pour("shirayim", { corner: "W" }); await RUN(1.4)', p: [-59.8, 20.2, 3.8], t: [-53.5, 17.0, 11.0] },
  { name: 'libation', pre: '__T.avodah.libation("water"); await RUN(6.5)', p: [-45.2, 28.6, 16.6], t: [-50.6, 25.3, 9.8] },
  { name: 'mukhni', pre: '__T.water.mukhni(true, { sec: 3 }); await RUN(3.4)', p: [-45, 27, 38], t: [-62.5, 21, 20] },
  // the south yesod's one amah: the rest of the blood, a thin trickle into the hole (Middot 3:2); then the amah's grates run clear
  { name: 'shitin_s', pre: '__T.water.mukhni(false, { sec: 0.5 }); __T.water.pour("shirayim", { corner: "S" }); await RUN(1.3)', p: [-48.4, 19.6, 17.2], t: [-52.6, 17.0, 12.1] },
  { name: 'channel', pre: 'await RUN(2.4)', p: [-9.5, 22.5, 29.5], t: [-19, 16, 17.2] },
  { name: 'outlet', pre: 'await RUN(0.5)', p: [300, -43, 38], t: [279, -49.5, 17.2] },
  { name: 'outlet_far', pre: 'await RUN(0.2)', p: [420, 10, 30], t: [279, -47, 17.2] },
];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true });
    const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|net::/.test(m.text())) errs.push(m.text().slice(0, 200)); });
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const night = process.argv.includes('--night');
    await pg.addInitScript((night) => { window.__FORCE_Q = 'normal'; window.__NO_GAME = 1; window.__START_PAUSED = 1; window.__DT_MAX = 0.6; if (night) window.__FORCE_TIME = 'night'; }, night);
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'), { timeout: 600000 });
    await pg.waitForFunction(() => window.__T && __T.booted, null, { timeout: 600000, polling: 1000 });
    log('booted');
    await pg.evaluate(() => { window.RUN = async (sec) => { for (let t = 0; t < sec; t += 0.1) { __T.step(0.1, 1 / 30); await new Promise((r) => setTimeout(r, 0)); } }; });
    for (const s of SHOTS) {
      await pg.evaluate(`(async () => { ${s.pre} })()`);
      if (only.length && !only.includes(s.name)) continue;
      await pg.evaluate((s) => { __T.look(s.p, s.t); __T.render(); }, s);
      const f = path.join(OUT, `world_${s.name}${night ? '_night' : ''}.png`);
      await pg.screenshot({ path: f, timeout: 600000 });
      log('shot', f, JSON.stringify(await pg.evaluate(() => __T.water.stats)));
      if (s.name === 'kiyor') log('drawCalls', JSON.stringify(await pg.evaluate(() => __T.drawCalls())));
    }
    if (errs.length) log('ERRORS', errs.slice(0, 6).join('\n'));
  } finally { await b.close(); }
})();
