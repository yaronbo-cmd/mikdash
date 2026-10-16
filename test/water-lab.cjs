// WATER's lab (wave 6): bundle test/water-lab-entry.js and render close-ups of world.water into test/out/water/.
//   node test/water-lab.cjs [shot …] [--w=390 --h=844]      (no names: every shot; --build: only the bundle)
// Needs NODE_PATH with playwright. One browser, closed in finally.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/water');
fs.mkdirSync(OUT, { recursive: true });
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
require(require.resolve('esbuild', { paths: [ROOT] })).buildSync({ entryPoints: [path.join(__dirname, 'water-lab-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/water-lab.bundle.js'), logLevel: 'warning' });
if (process.argv.includes('--build')) { console.log('lab bundle built'); process.exit(0); }
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
// each shot: pre (runs in the page, may be async), then the camera, then a render
const SHOTS = [
  { name: 'kiyor_flow', pre: 'await __L.settle(__L.water.kiyor({ spigots: 12, flow: 1, ms: 800 })); await __L.run(1.2)', p: [-52.5, 23.5, 31], t: [-63.5, 20.2, 20] },
  { name: 'kiyor_close', p: [-57.2, 21.2, 25.2], t: [-61.4, 20.0, 20.8] },
  { name: 'wash_1', pre: 'await __L.settle(__L.water.kiyor({ spigots: 0, ms: 0 })); await __L.run(0.6); window.K = __L.avodah.kohen("w1", { at: [-55, 24] }); window.WP = K.wash(); await __L.run(2.4)', p: [-56.5, 21.6, 34.0], t: [-61.0, 19.4, 20.8] },
  { name: 'wash_2', pre: 'await __L.run(0.9)', p: [-56.5, 21.6, 34.0], t: [-61.0, 19.4, 20.8] },
  { name: 'wash_3', pre: 'await __L.run(1.6)', p: [-56.5, 21.6, 34.0], t: [-61.0, 19.4, 20.8] },
  { name: 'drain', pre: 'await __L.settle(WP, 20); await __L.settle(__L.water.kiyor({ spigots: 3, flow: 1, ms: 0 })); await __L.run(3)', p: [-43.5, 25.5, 34], t: [-57.5, 17, 18.6] },
  { name: 'shitin', pre: 'await __L.settle(__L.water.kiyor({ spigots: 0, ms: 0 })); window.SP = __L.water.pour("shirayim", { corner: "W" }); await __L.run(2.0)', p: [-60.5, 21.0, 17.5], t: [-53.3, 17.1, 10.9] },
  { name: 'libation', pre: 'await __L.settle(SP, 10); window.LP = __L.water.pour("water"); await __L.run(1.6)', p: [-43.2, 29.6, 19.5], t: [-50.0, 25.3, 9.4] },
  { name: 'pool', pre: 'await __L.run(0.3)', p: [-17.5, 21.5, 60.5], t: [-24, 16, 52] },
  { name: 'twelve', pre: 'window.TW = __L.water.washTogether(); await __L.run(5.6)', p: [-48.5, 33, 34], t: [-63.5, 19.5, 20] },
  { name: 'twelve_night', pre: 'await __L.run(0.8); __L.night(true)', p: [-44, 30, 40], t: [-63.5, 19.5, 20] },
  { name: 'mukhni_down', pre: 'await __L.settle(TW, 30); __L.night(false); window.MP = __L.water.mukhni(true); await __L.run(3.2)', p: [-49.5, 26.5, 36], t: [-63.5, 22.5, 21] },
  { name: 'mukhni_night', pre: 'await __L.settle(MP, 12); __L.night(true)', p: [-49.5, 26.5, 36], t: [-63.5, 22.5, 21] },
  // Phase B's kiddush: the player's kohen steps to spigot 3; while both hands are held the spigot pours on him (the wheel first raises the kiyor)
  { name: 'hold', pre: 'await __L.settle(MP, 12); __L.night(false); K.remove(); window.KP = __L.avodah.kohen("player", { at: [-63.5, 25] }); __L.water.approach(KP, 0); await __L.run(0.3); window.HP = __L.water.hold(KP, 0, true); await __L.run(8.4)', p: [-58.6, 22.9, 28.2], t: [-60.9, 20.3, 20.8] },
  { name: 'hold_off', pre: '__L.water.hold(KP, 0, false); await __L.settle(HP, 6); await __L.run(0.6)', p: [-58.6, 22.9, 28.2], t: [-60.9, 20.3, 20.8] },
  // the rest of the blood, poured from beside the south yesod (avodah3d shirayim → world.water): a gentle stream, a thin trickle into the hole
  { name: 'shirayim_s', pre: 'window.PK = __L.avodah.kohen("pk", { at: [-49.5, 16.5] }); window.SH = __L.avodah.shirayim("S", { kohen: "pk" }); await __L.run(4.8)', p: [-57.4, 19.3, 17.2], t: [-52.3, 17.1, 12.3] },
];
(async () => {
  const W = +arg('w', 390), H = +arg('h', 844);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await b.newPage({ viewport: { width: W, height: H } });
    const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text().slice(0, 300)); });
    await pg.goto('file://' + path.join(__dirname, 'water-lab.html'), { timeout: 300000 });
    await pg.waitForFunction(() => window.__L && __L.ready, null, { timeout: 120000 });
    for (const s of SHOTS) {
      if (s.pre) await pg.evaluate(`(async () => { ${s.pre} })()`);
      if (only.length && !only.includes(s.name)) continue;
      await pg.evaluate((s) => { __L.look(s.p, s.t); __L.render(); }, s);
      const f = path.join(OUT, s.name + '.png');
      await pg.screenshot({ path: f, timeout: 180000 });
      console.log('shot', f, JSON.stringify(await pg.evaluate(() => __L.water.stats)));
    }
    console.log('draws', JSON.stringify(await pg.evaluate(() => __L.drawCalls())));
    if (errs.length) console.log('ERRORS', errs.slice(0, 8).join('\n'));
  } finally { await b.close(); }
})();
