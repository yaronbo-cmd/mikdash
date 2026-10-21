// PEOPLE's hero lab: bundle test/hero-lab-entry.js (the real stages.js over plain-colour geometry) and take shots of the
// builder's strokes into test/out/hero/. One browser, closed in finally.
//   node test/hero-lab.cjs                 all sheets
//   node test/hero-lab.cjs stroke          one sheet (stroke | kinds | sites | api)
//   node test/hero-lab.cjs --build         only the bundle
// Needs NODE_PATH with playwright (PROJECT.md §10).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/hero');
fs.mkdirSync(OUT, { recursive: true });
function build() {
  const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
  esbuild.buildSync({ entryPoints: [path.join(__dirname, 'hero-lab-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/hero-lab.bundle.js'), logLevel: 'warning' });
}
build();
if (process.argv.includes('--build')) { console.log('hero lab bundle built'); process.exit(0); }
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const W = +(process.env.W || 390), H = +(process.env.H || 844);
let fails = 0;
const check = (name, ok, info) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${info !== undefined ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : ''}`); if (!ok) fails++; };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await b.newPage({ viewport: { width: W, height: H } });
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.goto('file://' + path.join(ROOT, 'test/hero-lab.html'), { timeout: 180000 });
    await pg.waitForFunction(() => window.__H && window.__H.ready, null, { timeout: 180000 });
    const shot = async (name) => { const f = path.join(OUT, `${name}.png`); await pg.evaluate(() => __H.render()); await pg.screenshot({ path: f, timeout: 120000 }); console.log('shot', path.relative(ROOT, f)); };
    const E = (fn, arg) => pg.evaluate(fn, arg);
    const sheets = require('./hero-lab-sheets.cjs');
    for (const [name, fn] of Object.entries(sheets)) {
      if (only.length && !only.includes(name)) continue;
      const t0 = Date.now();
      try { await fn({ pg, E, shot, check }); } catch (e) { check(`sheet ${name}`, false, e.message); }
      console.log(`sheet ${name}: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    }
    const bad = logs.filter((l) => !/willReadFrequently|GPU stall|ERR_TUNNEL/.test(l));
    check('no console errors', !bad.length, bad.slice(0, 5).join(' | '));
  } finally { await b.close(); }
  console.log(fails ? `${fails} FAILED` : 'all ok');
  process.exit(fails ? 1 : 0);
})();
