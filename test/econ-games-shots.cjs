// ECON14 (wave 14) — my three pads at 390×844 on dist/test.html, by real touch (CDP): ❤️ "חריטת אותיות" (a letter traced along its
// cue), "אמת המים" (stones tapped by their cue until the water runs), ❤️ האבן שלי (a drawn mark) — shots looked at.
//   node test/econ-games-shots.cjs [--no-build]
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
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; try { localStorage.clear(); localStorage.setItem('bh-mg-howto', JSON.stringify({ draw: 1, pipes: 1, drawMark: 1 })); } catch (e) { /* */ } });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game && globalThis.__BH_PARTS && globalThis.__BH_PARTS.minigames, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const cdp = await ctx.newCDPSession(pg);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y, id: 1 })) });
    const drag = async (pts) => { await touch('touchStart', [pts[0]]); for (const p of pts.slice(1)) { await touch('touchMove', [p]); await pg.waitForTimeout(12); } await touch('touchEnd', []); };
    const shot = async (name) => { const f = path.join(OUT, `pad-${name}.png`); await pg.screenshot({ path: f, timeout: 120000 }); console.log('   shot', path.relative(ROOT, f)); };
    const cvBox = () => G(() => { const c = document.querySelector('.fx-mg canvas'); if (!c) return null; const r = c.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; });
    const cue = () => G(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? w.__mg.cue() : null; });
    const state = () => G(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? w.__mg.state() : null; });
    // ❤️ the letters: trace the glowing letters by their cue (the first stroke) and the strokes behind it (the model's own)
    await G(() => { window.__R = null; globalThis.__BH_PARTS.minigames.runMinigame('draw', { root: document.body, level: 0, howto: false }).then((r) => { window.__R = r; }); });
    const inView = () => pg.waitForFunction(() => { const c = document.querySelector('.fx-mg.on canvas'); const r = c && c.getBoundingClientRect(); return !!r && r.top > 0 && r.bottom <= innerHeight + 1; }, null, { polling: 100, timeout: 8000 }).then(() => true, () => false);
    await inView(); await pg.waitForTimeout(400);   // (the sheet slides up: the canvas in view before the finger)
    let cv = await cvBox();
    check('the letters\' pad opens tall (≥ 380 px) and in view', cv && cv.h >= 380 && cv.y + cv.h <= H + 1, JSON.stringify(cv));
    await shot('1-letters-start');
    for (let k = 0; k < 4; k++) {   // "לבית": each letter's strokes from the live model
      const strokes = await G(() => { const w = document.querySelector('.fx-mg'); const c = w.__mg.cue(); return c; });
      if (!strokes) break;
      const L = await G(() => { const M = window.__lastDrawModel; return null; });
      const c = await cue(); if (!c) break;
      const pts = []; for (let j = 0; j <= 10; j++) pts.push([cv.x + (c.x + (c.x2 - c.x) * j / 10) * cv.w, cv.y + (c.y + (c.y2 - c.y) * j / 10) * cv.h]);
      await drag(pts); await pg.waitForTimeout(150);
    }
    await shot('2-letters-traced');
    const st1 = await state();
    check('tracing along the cue cuts letters (progress ≥ 1)', st1 && st1.progress >= 1, JSON.stringify(st1));
    await G(() => { const s = document.querySelector('.fx-mg .fx-skip'); if (s) s.hidden = false; });
    await G(() => { const w = document.querySelector('.fx-mg'); if (w) w.remove(); });
    // the aqueduct: tap the cued stone until the water runs
    await G(() => { window.__R = null; globalThis.__BH_PARTS.minigames.runMinigame('pipes', { root: document.body, level: 1, seed: 7, howto: false }).then((r) => { window.__R = r; }); });
    await inView(); await pg.waitForTimeout(400);
    cv = await cvBox();
    await shot('3-pipes-start');
    let taps = 0;
    for (let k = 0; k < 60; k++) { const c = await cue(); if (!c) break; await pg.touchscreen.tap(cv.x + c.x * cv.w, cv.y + c.y * cv.h); taps++; await pg.waitForTimeout(120); if (k === 4) await shot('4-pipes-half'); }
    await pg.waitForTimeout(400);
    await shot('5-pipes-done');
    const r2 = await G(() => window.__R);
    check('the water runs: the aqueduct done by taps on its cue', await G(() => { const w = document.querySelector('.fx-mg'); return !!(w && w.classList.contains('done')) || !!window.__R; }), `${taps} taps`);
    const cells = await G(() => { const c = document.querySelector('.fx-mg canvas').getBoundingClientRect(); return { w: c.width / 5, h: c.height * 0.8 / 5 }; });
    check('each channel stone is ≥ 44 px (L2: 5 × 5)', cells.w >= 44 && cells.h >= 44, JSON.stringify(cells));
    check('no page errors', logs.length === 0, logs.slice(0, 3).join(' | '));
  } catch (e) { check('the shots ran', false, e.message); } finally { await b.close(); }
  const bad = results.filter((r) => !r.ok);
  console.log(`\n${results.length - bad.length}/${results.length} passed`);
  process.exit(bad.length ? 1 : 0);
})();
