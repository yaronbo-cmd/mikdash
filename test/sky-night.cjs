// WORLD12 (wave 12): the nights by the Hebrew date — the moon at its phase, a clear dry night, the overcast of a wet one.
// node test/sky-night.cjs [dist/test.html] [--out=test/out/sky12]   (through the queue: /home/claude/wt/bus/brun node test/sky-night.cjs)
// Checks: the boot's nightSky() takes __FORCE_DATE (the moon's lit fraction by the Hebrew day), and shots of the moon at a
// crescent, a quarter, full, and the night of rain — looked at by hand.
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.env.NODE_PATH || '/home/claude/.npm-global/lib/node_modules', 'playwright'));
const file = process.argv.find((a) => a.endsWith('.html')) || 'dist/test.html';
const out = (process.argv.find((a) => a.startsWith('--out=')) || '--out=test/out/sky12').slice(6);
fs.mkdirSync(out, { recursive: true });
const ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
let fails = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ARGS });
  const pg = await b.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  // the evening of 2026-11-13 begins 4 Kislev 5787: a thin crescent, and (weather.js) a dry night
  await pg.addInitScript(() => { window.__NO_GAME = true; window.__FORCE_TIME = 'night'; window.__FORCE_DATE = '2026-11-13'; window.__FORCE_Q = 'normal'; window.__START_PAUSED = true; });
  await pg.goto('file://' + path.resolve(file));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 240000 });
  const n = await pg.evaluate(() => globalThis.__BH_WEATHER.night());
  console.log('the night:', n.civil, n.heb, n.rain ? 'rain' : 'dry', 'moon', n.moon.lit.toFixed(2));
  const m = await pg.evaluate(() => __T.sky.moon);
  ok(Math.abs(m.lit - n.moon.lit) < 1e-6, `the boot set the moon by __FORCE_DATE: lit ${m.lit.toFixed(2)} (4 Kislev)`);
  ok(m.clear === !n.rain, `a ${n.rain ? 'wet' : 'dry'} night: clear ${m.clear}`);
  await pg.evaluate(() => { const c = __T.controls; c.maxPolarAngle = Math.PI - 0.05; c.minPolarAngle = 0; c.maxDistance = 1e5; c.minDistance = 0; const h = document.getElementById('hint'); if (h) h.style.display = 'none'; });
  // the moon: az 45° (south-east), 30° up (sky.js SKY.night) — look at it from the plaza
  const look = () => pg.evaluate(() => { const d = [Math.cos(0.5236) * Math.cos(0.7854), Math.sin(0.5236), Math.cos(0.5236) * Math.sin(0.7854)]; const p = [-60, 40, -20]; __T.look(p, [p[0] + d[0] * 60, p[1] + d[1] * 60, p[2] + d[2] * 60]); __T.render(); __T.render(); });
  for (const [tag, day, clear] of [['crescent-4', 4, true], ['quarter-8', 8, true], ['full-15', 15, true], ['waning-22', 22, true], ['wet-15', 15, false]]) {
    await pg.evaluate(([day, clear]) => { const SYN = 29.530589, age = day - 0.25; __T.sky.setMoon({ age, lit: (1 - Math.cos(2 * Math.PI * age / SYN)) / 2 }, clear); __T.sky.setOvercast(clear ? 0 : 1); }, [day, clear]);
    await look();
    const f = `${out}/moon-${tag}.png`;
    await pg.screenshot({ path: f });
    // the moon's brightness in the centre region of the frame: a crescent is much dimmer than the full moon
    const lum = await pg.evaluate(() => { const c = __T.renderer.domElement, g = document.createElement('canvas'); g.width = 60; g.height = 60; const x = g.getContext('2d'); x.drawImage(c, c.width / 2 - 30, c.height / 2 - 30, 60, 60, 0, 0, 60, 60); const d = x.getImageData(0, 0, 60, 60).data; let s = 0, mx = 0; for (let i = 0; i < d.length; i += 4) { const l = 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; s += l; if (l > mx) mx = l; } return { mean: s / (d.length / 4), max: mx }; });
    console.log('shot', f, 'centre mean', lum.mean.toFixed(1), 'max', lum.max.toFixed(0));
  }
  ok(errs.length === 0, 'no page errors' + (errs.length ? ': ' + errs.join(' | ') : ''));
  await b.close();
  console.log(fails ? `${fails} FAILED` : 'all ok');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
