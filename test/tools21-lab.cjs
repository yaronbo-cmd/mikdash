// ── tools21 ── the hero lab's sheets for the tools: each tool hung on his back / belt, seen from behind and from the side, at tier 1 and
// tier 3, and in his hand (the armed pose). Shots in test/out/tools21-lab/. NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/tools21-lab.cjs [hammer,pick,...]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/tools21-lab');
fs.mkdirSync(OUT, { recursive: true });
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
esbuild.buildSync({ entryPoints: [path.join(__dirname, 'hero-lab-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/hero-lab.bundle.js'), logLevel: 'warning' });
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'))[0];
const KINDS = (only ? only.split(',') : ['hammer', 'mallet', 'pick', 'sledge', 'plumb', 'rope']);
let fails = 0;
const check = (name, ok, info) => { console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${info !== undefined ? ' — ' + (typeof info === 'string' ? info : JSON.stringify(info)) : ''}`); if (!ok) fails++; };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await b.newPage({ viewport: { width: 640, height: 480 } });
    const logs = []; pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.goto('file://' + path.join(ROOT, 'test/hero-lab.html'), { timeout: 180000 });
    await pg.waitForFunction(() => window.__H && window.__H.ready, null, { timeout: 180000 });
    const E = (fn, a) => pg.evaluate(fn, a);
    const shot = async (n) => { await E(() => __H.render()); await pg.screenshot({ path: path.join(OUT, n + '.png'), timeout: 120000 }); console.log('shot test/out/tools21-lab/' + n + '.png'); };
    await E(() => { const S = __H.stages; S.buildMode(); S.setStage('har', 'done', 1, { instant: true }); S.setBoulders([]); S.setStage('wall', 'building', 0.3, { instant: true }); __H.step(0.2); S.hero.place('wall'); S.hero.setTool('iron'); __H.step(2.5); });
    const view = async (name, side) => {
      const hp = await E(() => { const p = __H.stages.hero.position; return [p.x, p.y, p.z]; }), yaw = await E(() => __H.stages._dbg.hero.yaw);
      const c = Math.cos(yaw), s = Math.sin(yaw), R = (mx, my, mz) => [hp[0] + mx * c + mz * s, hp[1] + my, hp[2] - mx * s + mz * c];
      const cam = side === 'back' ? [R(0, 6.4, -9.5), R(0, 3.6, 0)] : side === 'side' ? [R(-10.5, 5.2, -2), R(0, 3.4, 0)] : side === 'hand' ? [R(5.2, 4.6, 5.2), R(-0.4, 3.4, 1.2)] : [R(-3.8, 6.2, 9), R(0, 3.4, 0.5)];
      await E(([p, t]) => { __H.look(p, t); __H.step(1 / 30, 1 / 30); }, cam); await shot(name);
    };
    for (const k of KINDS) {
      for (const tier of [1, 3]) {
        const st = await E(([k, tier]) => { const H = __H.stages._dbg.hero; __H.stages.setTools({ [k]: tier }); H.held = k; H.armed = null; H.readyS = null; H.idle = 5; H.stroke = null; __H.step(1.2); return __H.stages.hero.toolState(); }, [k, tier]);
        check(`${k} tier ${tier}: hung (k ${st.k}), shown ${st.shown.join('+')}, none in hand`, st.hung && st.inHand.length === 0 && st.tier === tier && (k === 'rope' ? st.coil : st.shown.includes(k)), st);
        await view(`${k}-t${tier}-back`, 'back');
        if (tier === 3) await view(`${k}-t${tier}-side`, 'side');
      }
    }
    // in his hand, tier 3: the armed pose (the swing's top) with the hammer and the pick
    for (const k of ['hammer', 'pick']) {
      await E((k) => { const H = __H.stages._dbg.hero; __H.stages.setTools({ [k]: 3 }); H.held = k; __H.stages.hero.arm(k === 'pick' ? 'pick' : 'dress'); __H.step(1.0); }, k);
      const st = await E(() => __H.stages.hero.toolState());
      check(`${k} tier 3 armed: in his hand (k ${st.k})`, !st.hung && st.inHand.length === 1, st);
      await view(`${k}-t3-hand`, 'front'); await view(`${k}-t3-hand2`, 'hand');
      await E(() => __H.stages.hero.arm(null));
    }
    check('no page errors', !logs.length, logs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
  console.log(fails ? `${fails} FAILED` : 'all ok'); process.exit(fails ? 1 : 0);
})();
