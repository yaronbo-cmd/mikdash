// ECON14 (wave 14) — the ring made legible (D3), by REAL TOUCH at 390×844 on dist/test.html: the Mount's courses (a fixture past
// the rocks), the save's first tries (the teach: slow beats, the hand, the mentor's line), one early, one late, one on the beat;
// the words under the gold; shots of the ring closing, "עכשיו!", and the words.   node test/econ-ring-probe.cjs [--no-build]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/econ');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const W = 390, H = 844;
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; try { localStorage.clear(); } catch (e) { /* */ } });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const tap = (x, y) => pg.touchscreen.tap(Math.max(4, Math.min(W - 4, x)), Math.max(4, Math.min(H - 4, y)));
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 50, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => { await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); }); const f = path.join(OUT, `ring-${name}.png`); await pg.screenshot({ path: f, timeout: 240000 }); console.log('   shot', path.relative(ROOT, f)); await G(() => { window.__HUD_HOLD = false; }); };
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);
    await G(() => { const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, ''); Object.assign(g.st.har, { p: 'courses', dp: 1, paid: 999, set: 2, k: 0, chk: 0 }); g.st.har.keys[0] = 0.9; g.res.stone = 400; g.crews = []; __T.game._.resync(); });
    await pg.waitForTimeout(2500);
    const heroPt = () => G(() => { const hp = __T.stages.hero.position; const q = __T.view.project(hp.x, hp.y + 1.8, hp.z); return { x: q.x, y: q.y }; });
    const ringOn = () => G(() => document.querySelector('.gm-ring').classList.contains('live'));
    const st = () => G(() => { const r = document.querySelector('.gm-ring'), h = __T.game._.hero; return { cls: r.className, fb: r.querySelector('s').textContent, fbOn: r.querySelector('s').className, coach: __T.game.ui.coachText, beat: h.beat, now: performance.now() / 1000, econ: __T.game.state.econ || {} }; });
    const tapHero = async () => { const p = await heroPt(); await tap(p.x, p.y + 10); };
    for (let k = 0; k < 3; k++) {
      await tapHero();
      for (let i = 0; i < 12; i++) {
        await pg.waitForTimeout(150);
        const d = await G(() => { const r = document.querySelector('.gm-ring'), h = __T.game._.hero; const a = h.anchorT; let sp = null; try { sp = __T.stages.screenPos(a, {}); } catch (e) { sp = String(e); } const hp = __T.stages.hero.position; return { cls: r.className.replace('gm-anchor gm-ring', ''), tf: r.style.transform, a: a && typeof a === 'object' ? JSON.stringify(a).slice(0, 80) : a, sp: sp && sp.x != null ? [Math.round(sp.x), Math.round(sp.y), sp.on] : sp, hero: [hp.x, hp.y, hp.z].map(Math.round), busy: h.busy, b: getComputedStyle(r.querySelector('b')).opacity, disp: getComputedStyle(r).display }; });
        console.log(k, i, JSON.stringify(d));
      }
    }
    await shot('dbg');
    check('no page errors', logs.length === 0, logs.slice(0, 3).join(' | '));
  } catch (e) { check('the probe ran', false, e.message); } finally { await b.close(); }
  const bad = results.filter((r) => !r.ok);
  console.log(`\n${results.length - bad.length}/${results.length} passed`);
  process.exit(bad.length ? 1 : 0);
})();
