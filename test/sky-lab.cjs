// WORLD (wave 6): the sky lab — every preset toward the sun and away from it, and the rain's overcast, in a small scene.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/sky-lab.cjs [presets] [--W=390 --H=844]   → test/out/sky/*.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/sky');
fs.mkdirSync(OUT, { recursive: true });
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const W = +arg('W', 390), H = +arg('H', 844);
const only = (process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dawn,noon,dusk,night,rain').split(',');
(async () => {
  const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
  esbuild.buildSync({ entryPoints: [path.join(__dirname, 'sky-lab-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/sky-lab.bundle.js'), logLevel: 'warning' });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await b.newPage({ viewport: { width: W, height: H } });
    const errs = [];
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.text().slice(0, 300)); });
    await pg.goto('file://' + path.join(__dirname, 'sky-lab.html'), { timeout: 240000 });
    await pg.waitForFunction(() => window.__ready, null, { timeout: 120000 });
    for (const k of only) {
      const key = k === 'rain' ? 'night' : k, over = k === 'rain' ? 1 : k === 'grey' ? 1 : 0;
      const az = await pg.evaluate(([key, over]) => { __S.set(key, over); return __S.T[key].az; }, [key === 'grey' ? 'noon' : key, over]);
      for (const [nm, a, el, y] of [['sun', az, 7, 60], ['away', az + 180, 7, 60], ['up', az + 40, 34, 60], ['game', az + 150, -9, 300]]) {
        await pg.evaluate(([a, el, y]) => { window.__LAB_Y = y; __S.look(a, el); __S.render(); }, [a, el, y]);
        const f = path.join(OUT, `${k}-${nm}.png`);
        await pg.screenshot({ path: f, timeout: 300000 });
        console.log('shot', f);
      }
    }
    console.log(errs.length ? errs.join('\n') : 'no errors');
  } finally { await b.close(); }
})();
