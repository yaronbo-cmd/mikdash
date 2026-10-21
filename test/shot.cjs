// Screenshot harness. Usage:
//   node test/shot.cjs <html> <views,comma> <W> <H> <time> <quality> <outDir> [evalJS]
// views: olives,facade,altar,kotel,royal,top  time: dawn|noon|dusk|night  quality: normal|high
const { chromium } = require('playwright');
(async () => {
  const [file = 'dist/test.html', v = 'olives', W = '1280', H = '800', time = 'dawn', q = 'normal', out = '/tmp', extra = ''] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: +W, height: +H } });
  await pg.addInitScript((q) => { window.__FORCE_Q = q; }, q);
  const logs = [];
  pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  const path = require('path');
  await pg.goto('file://' + path.resolve(file));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 180000 });
  await pg.evaluate(() => { __T.pause(true); const h = document.getElementById('hint'); if (h) h.style.display = 'none'; });
  if (time !== 'dawn') await pg.evaluate((t) => __T.setTime(t), time);
  if (extra) await pg.evaluate(extra);
  for (const view of v.split(',')) {
    const t0 = Date.now();
    await pg.evaluate((k) => { __T.jump(k); __T.render(); __T.render(); }, view);
    const f = `${out}/${view}_${time}_${W}.png`;
    await pg.screenshot({ path: f, timeout: 180000 });
    console.log('shot', f, ((Date.now() - t0) / 1000).toFixed(1) + 's');
  }
  const bad = logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l));
  console.log(bad.length ? bad.join('\n') : 'no errors');
  await b.close();
})();
