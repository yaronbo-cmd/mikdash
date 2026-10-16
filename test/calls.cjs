// Draw-call counter. Usage:
//   node test/calls.cjs <html> <view> <W> <H> [evalJS]
// Instruments WebGL2 draw functions and counts the calls issued by one __T.render()
// (scene pass + shadow pass if flagged + post-processing), and prints renderer.info when exposed.
const { chromium } = require('playwright');
(async () => {
  const [file = 'dist/test.html', view = 'olives', W = '1280', H = '800', extra = ''] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: +W, height: +H } });
  await pg.addInitScript((g) => { if (g) window.__WANT_GAME = true;
    window.__FORCE_Q = 'normal'; if (!window.__WANT_GAME) window.__NO_GAME = true;
    window.__GLC = { n: 0, on: false };
    for (const P of [WebGL2RenderingContext.prototype]) {
      for (const f of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced', 'drawRangeElements']) {
        const o = P[f]; if (!o) continue;
        P[f] = function (...a) { if (window.__GLC.on) window.__GLC.n++; return o.apply(this, a); };
      }
    }
  }, !!process.env.GAME);
  const logs = [];
  pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning' || m.text().startsWith('[calls]')) logs.push(m.type() + ': ' + m.text()); });
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  const path = require('path');
  await pg.goto('file://' + path.resolve(file));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 180000 });
  await pg.evaluate(() => { __T.pause(true); });
  if (extra) await pg.evaluate(extra);
  const r = await pg.evaluate((k) => {
    __T.jump(k); __T.render();
    window.__GLC.n = 0; window.__GLC.on = true; __T.render(); window.__GLC.on = false;
    const total = window.__GLC.n;
    const info = __T.drawCalls ? __T.drawCalls() : null;
    return { total, info };
  }, view);
  console.log(JSON.stringify(r));
  const bad = logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l));
  console.log(bad.length ? bad.join('\n') : 'no errors');
  await b.close();
})();
