// MIDDOT10 (wave 10): where each "איפה זה בעולם" flight lands, seen at 390×844 on the real build — the book's place poses
// (src/game/middot.js PLACE) through the game's own api (game.showPlace), on the seeded mid-game save of test/middot-touch.cjs
// (a place not built yet is shown in the whole-Temple view). One shot per place, taken after the flight has landed.
//   node test/middot-poses.cjs [--no-build] [--keys=kodesh,altar,…]
// Checks: the camera's target ends on the place; its card (or the chip's line) is up; the camera is not inside a wall (it sees
// the place: the target projects inside the frame, above the card).
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const KEYS = ((args.find((a) => a.startsWith('--keys=')) || '').slice(7) || 'kodesh,altar,nikanor,kiyor,gazit,duchan,heichal,har').split(',');
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const S = await import(pathToFileURL(path.join(ROOT, 'src/game/state.js')).href);
  const { MIDDOT, PLACE } = await import(pathToFileURL(path.join(ROOT, 'src/game/middot.js')).href);
  const now = Date.now(), Gs = S.fresh(now);
  for (const id of ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka']) S.completeStage(Gs, id);
  Object.assign(Gs, { ftue: 99, op: 1, name: 'יכין', mishmar: 1 });
  for (const m of MIDDOT) Gs.book.un[m.id] = 1;
  S.dailyCheck(Gs, now);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(([save, key]) => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      try { localStorage.clear(); localStorage.setItem(key, save); localStorage.setItem('bh_settings', JSON.stringify({ rhythm: true })); } catch (e) { /* storage */ }
    }, [JSON.stringify(Gs), S.SAVE_KEY]);
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    await G(() => { for (const m of document.querySelectorAll('.gm-modal.on .gm-btn-gold')) m.click(); });
    for (const k of KEYS) {
      const P = PLACE[k]; if (!P) { check(`${k}: a place`, false); continue; }
      const t = P.pt[1];
      await G((key) => { window.__mdCam = null; __T.game.showPlace(key); }, k);
      await pg.waitForTimeout(600);   // (the flight has begun: a still camera now means it has landed, not that it has not left)
      const landed = await waitFor(() => { const p = __T.camera.position, s = [p.x, p.y, p.z].map((v) => v.toFixed(1)).join(); const ok = window.__mdCam === s; window.__mdCam = s; return ok; }, null, 9000);
      const on = await G(([x, y, z]) => { const o = __T.view.project(x, y, z), c = document.getElementById('card'); return { on: o.on, x: Math.round(o.x), y: Math.round(o.y), top: c.classList.contains('on') ? Math.round(c.getBoundingClientRect().top) : 844 }; }, t);
      const card = await G(() => (document.getElementById('card').classList.contains('on') ? document.getElementById('ct').textContent : '') + ' | ' + ((document.querySelector('.md-back.on') || {}).textContent || '').replace(/\s+/g, ' '));
      check(`${k} (${P.he}): the flight lands, the place in frame over its card`, landed && on.on && on.x > 20 && on.x < 370 && on.y > 150 && on.y < on.top - 10, `the place at ${on.x},${on.y} px, the card from ${on.top} · ${card}`);
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const f = path.join(OUT, `middot-pose-${k}.png`);
      await pg.screenshot({ path: f, timeout: 240000 });
      await G(() => { window.__HUD_HOLD = false; });
      console.log('   shot', path.relative(ROOT, f));
    }
    check('no page errors', logs.length === 0, logs.slice(0, 3).join(' | '));
  } catch (e) {
    check('the run finished', false, e.message.split('\n')[0]);
  } finally {
    await b.close();
  }
  const fails = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - fails}/${results.length} passed`);
  process.exit(fails ? 1 : 0);
})();
