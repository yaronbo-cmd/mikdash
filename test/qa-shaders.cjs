// QA / UI wave 4 (P2-10): shader programs at boot, at the Phase B entry and at the first walk into the Heichal.
//   node build.mjs && NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/qa-shaders.cjs [--bundle=dist/test.html] [--out=name]
// Real build, SwiftShader, one small viewport (390×844). The loop is paused; frames are rendered on demand.
// Reports (test/out/qa-ui/shaders-<out>.json and the console):
//   programs after boot · after the first Phase B frame · the new programs the first Heichal frame compiles (names) ·
//   the time a renderer.compile() at the door takes (= the compile work the first frame inside would do) · the boot's
//   own precompile records (window.__UI_COMPILE, present once the ── ui ── block in main.js is in the build).
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const BUNDLE = path.resolve(ROOT, arg('bundle', 'dist/test.html'));
const NAME = arg('out', 'run');
const OUT = path.join(ROOT, 'test/out/qa-ui');
fs.mkdirSync(OUT, { recursive: true });
const T0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(0).padStart(4)}s]`, ...a);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run', '--disable-background-networking'] });
  const R = { bundle: BUNDLE, steps: [] };
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|net::/.test(m.text())) errs.push(m.text().slice(0, 200)); });
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__DT_MAX = 0.6; window.__START_PAUSED = true; window.__FORCE_Q = 'normal';
      try { localStorage.clear(); } catch (e) { /* blocked */ }
      window.__LT = []; try { new PerformanceObserver((l) => { for (const e of l.getEntries()) window.__LT.push({ s: Math.round(e.startTime), d: Math.round(e.duration) }); }).observe({ type: 'longtask', buffered: true }); } catch (e) { /* */ }
    });
    const G = (fn, a) => pg.evaluate(fn, a);
    // the page-side helpers: the program list, and a timed compile for the composer's target (what the frames use)
    const helpers = () => {
      window.__progs = () => (__T.renderer.info.programs || []).map((p) => `${String(p.cacheKey).split(',').slice(0, 2).join('/').slice(0, 40)}#${String(p.cacheKey).length}:${hash(p.cacheKey)}`);
      function hash(s) { let h = 0; s = String(s); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
    };
    await pg.goto('file://' + BUNDLE + '#avodah');
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 900000, polling: 500 });
    await G(helpers);
    const boot = await G(() => ({ programs: __progs().length, lt: window.__LT.slice().sort((a, b) => b.d - a.d).slice(0, 5), compile: window.__UI_COMPILE || null, t: Math.round(performance.now()) }));
    R.steps.push({ step: 'boot', ...boot }); log('boot', JSON.stringify(boot));
    await pg.waitForFunction(() => !!window.__AVODAH, null, { timeout: 300000, polling: 500 });
    await new Promise((r) => setTimeout(r, 1500));
    const home = await G(() => { const a = performance.now(); const p0 = __progs(); __T.render(); const p1 = __progs(); const s0 = new Set(p0); return { ms: Math.round(performance.now() - a), programs: p1.length, added: p1.filter((x) => !s0.has(x)).map((x) => x.split('#')[0]), compile: window.__UI_COMPILE || null }; });
    R.steps.push({ step: 'phaseB-first-frame', ...home }); log('Phase B first frame', JSON.stringify(home));
    // the service's first games run before dawn: the time of day turns to night, and the night's lights (the menorot's
    // point lights) change the light count of every material, so the first night frame compiles a new program set
    await G(() => new Promise((r) => { const t0 = performance.now(); (function w() { const c = window.__UI_COMPILE || []; if (c.some((x) => /phaseB/.test(x.label)) || performance.now() - t0 > 60000) r(); else setTimeout(w, 250); })(); }));
    // a player spends at least this long on the first cards before the service reaches the night; the GPU process links
    // what was compiled meanwhile (the same wait in both runs: nothing is pending in the old build)
    await new Promise((r) => setTimeout(r, +(process.env.QA_GAP_MS || 30000)));
    const night = await G(() => { const p0 = __progs(), s0 = new Set(p0); __T.setTime('night'); const a = performance.now(); __T.render(); const ms = Math.round(performance.now() - a), p1 = __progs(); const added = p1.filter((x) => !s0.has(x)).map((x) => x.split('#')[0]); const by = {}; for (const n of added) by[n] = (by[n] || 0) + 1; return { ms, programs: p1.length, added: added.length, byName: by, compile: window.__UI_COMPILE || null }; });
    R.steps.push({ step: 'first-night-frame (the service before dawn)', ...night }); log('first night frame', JSON.stringify(night));
    const night2 = await G(() => { const a = performance.now(); __T.render(); return { ms: Math.round(performance.now() - a), programs: __T.renderer.info.programs.length }; });
    R.steps.push({ step: 'second-night-frame', ...night2 }); log('second night frame', JSON.stringify(night2));
    await G(() => __T.setTime('dawn'));
    // the walk in: the sanctuary's own camera walk (advanced by __T.simulate while the loop is paused)
    const walked = await G(async () => {
      __T.simulate(true);
      const S = __T.sanctuary; if (!S || !S.enter) return 'no-sanctuary';
      const r = await Promise.race([S.enter('heichal').then(() => 'in'), new Promise((res) => setTimeout(() => res('timeout'), 90000))]);
      __T.simulate(false);
      return r + ' room=' + (S.state && S.state.room);
    });
    log('walk', walked);
    const inside = await G(() => {
      const p0 = __progs(), s0 = new Set(p0), a = performance.now();
      __T.render();
      const ms = Math.round(performance.now() - a), p1 = __progs();
      const added = p1.filter((x) => !s0.has(x)).map((x) => x.split('#')[0]);
      const by = {}; for (const n of added) by[n] = (by[n] || 0) + 1;
      return { ms, programs: p1.length, added: added.length, byName: by, lt: window.__LT.filter((x) => x.s > a - 20).sort((x, y) => y.d - x.d).slice(0, 3) };
    });
    R.steps.push({ step: 'first-frame-inside', walked, ...inside }); log('first frame inside', JSON.stringify(inside));
    const again = await G(() => { const a = performance.now(); __T.render(); return { ms: Math.round(performance.now() - a), programs: __T.renderer.info.programs.length }; });
    R.steps.push({ step: 'second-frame-inside', ...again }); log('second frame inside', JSON.stringify(again));
    R.errors = errs;
  } catch (e) { log('FAILED', String(e).slice(0, 300)); R.failed = String(e).slice(0, 300); }
  finally { await b.close(); }
  fs.writeFileSync(path.join(OUT, `shaders-${NAME}.json`), JSON.stringify(R, null, 1));
  log('done →', path.join(OUT, `shaders-${NAME}.json`));
})();
