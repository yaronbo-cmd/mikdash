// Evaluate JS in the booted page and print the JSON result. Usage: node test/eval.cjs "<js expression>"
const { chromium } = require('playwright');
(async () => {
  const [expr = '1', file = 'dist/test.html'] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await pg.addInitScript((g) => { if (g) window.__WANT_GAME = true; window.__FORCE_Q = 'normal'; if (!window.__WANT_GAME) window.__NO_GAME = true; }, !!process.env.GAME);
  const logs = [];
  pg.on('console', (m) => logs.push(m.type() + ': ' + m.text()));
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  await pg.goto('file://' + require('path').resolve(file));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 180000 });
  await pg.evaluate(() => __T.pause(true));
  try { const r = await pg.evaluate(expr); console.log(JSON.stringify(r, null, 1)); } catch (e) { console.log('EVAL ERROR', e.message); }
  console.log(logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l)).join('\n'));
  await b.close();
})();
