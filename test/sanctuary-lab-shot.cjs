// Lab screenshots. Usage: node test/sanctuary-lab-shot.cjs <W> <H> "name|js" ["name|js" …]
// Each js runs in the page (window.__L), then the scene is rendered twice and saved to test/out/lab/<name>.png.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const [W = '640', H = '360', ...shots] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await b.newPage({ viewport: { width: +W, height: +H } });
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning' || m.text().startsWith('[lab]')) logs.push(m.type() + ': ' + m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    const t0 = Date.now();
    await pg.goto('file://' + path.resolve('test/out/sanctuary-lab.html'));
    await pg.waitForFunction(() => window.__L && window.__L.ready, null, { timeout: 120000 });
    console.log('boot', ((Date.now() - t0) / 1000).toFixed(1) + 's');
    for (const s of shots) {
      const i = s.indexOf('|'), name = s.slice(0, i), js = s.slice(i + 1);
      const t1 = Date.now();
      const r = await pg.evaluate(async (js) => { const v = await (0, eval)(`(async () => { ${js} })()`); __L.render(); __L.render(); return v; }, js);
      await pg.screenshot({ path: `test/out/lab/${name}.png`, timeout: 180000 });
      console.log('shot', name, ((Date.now() - t1) / 1000).toFixed(1) + 's', r !== undefined ? JSON.stringify(r) : '');
    }
    console.log(logs.filter((l) => !/willReadFrequently/.test(l)).join('\n') || 'no errors');
  } finally { await b.close(); }
})();
