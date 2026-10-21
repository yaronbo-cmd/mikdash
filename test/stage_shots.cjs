// Several screenshots of construction states in one page load.
// Usage: node test/stage_shots.cjs <plan.json> <outDir> [W] [H] [time]
// plan.json: [{ "name": "a", "js": "__T.buildMode()", "p": [x,y,z], "t": [x,y,z] } | { "name": "b", "js": "...", "view": "olives" }, ...]
// "js" runs before the shot (use __T.step(sec) to advance time); camera from p/t or a named view.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const [planFile, out = 'test/out', W = '1280', H = '800', time = 'dawn'] = process.argv.slice(2);
  const plan = JSON.parse(fs.readFileSync(planFile, 'utf8'));
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: +W, height: +H } });
  await pg.addInitScript((g) => { if (g) window.__WANT_GAME = true; window.__FORCE_Q = 'normal'; if (!window.__WANT_GAME) window.__NO_GAME = true; }, !!process.env.GAME);
  const logs = [];
  pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning' || m.text().startsWith('[calls]')) logs.push(m.type() + ': ' + m.text()); });
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  await pg.goto('file://' + path.resolve('dist/test.html'));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 180000 });
  await pg.evaluate(() => { __T.pause(true); const h = document.getElementById('hint'); if (h) h.style.display = 'none'; });
  if (time !== 'dawn') await pg.evaluate((t) => __T.setTime(t), time);
  for (const s of plan) {
    const t0 = Date.now();
    if (s.js) await pg.evaluate(s.js);
    const calls = await pg.evaluate((s) => {
      if (s.view) __T.jump(s.view); else if (s.p) __T.look(s.p, s.t);
      __T.render();
      if (s.settle) { const t = performance.now() + s.settle; while (performance.now() < t) {} __T.render(); }
      const c = s.calls ? __T.drawCalls() : null;
      __T.render();
      return c;
    }, s);
    const f = `${out}/${s.name}_${W}.png`;
    await pg.screenshot({ path: f, timeout: 180000 });
    console.log('shot', f, ((Date.now() - t0) / 1000).toFixed(1) + 's', calls ? JSON.stringify(calls) : '');
  }
  const bad = logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l));
  console.log(bad.length ? bad.join('\n') : 'no errors');
  await b.close();
})();
