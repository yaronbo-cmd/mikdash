// FUN14 (wave 14): FUN14's own job games by REAL TOUCH at 390×844 on dist/test.html — החוט הצבוע (snap), בניית קשת (place),
// השלם את הנדבך (course), הגלגל על הבור (wheel) — each opened through runMinigame as the course loop opens it (site, skin,
// level), played by its hand's cue (a timed cue waits for its moment), its result card read: ★ (never ☆☆☆), a sourced fact
// (טיוטה / המחשה), every button ≥ 44 px. Shots: test/out/fun14-jobs/<game>-{play,result}.png (look at them).
//   node test/fun14-jobs-touch.cjs [--no-build] [--only=snap,place,course,wheel]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/fun14-jobs');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const ONLY = ((args.find((a) => a.startsWith('--only=')) || '').slice(7) || 'snap,place,course,wheel').split(',');
const W = 390, H = 844;
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const SITE = { snap: 'wall', place: 'har', course: 'wall', wheel: 'lishka' };
const SKIN = { place: 'arch', course: 'course' };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    // (v27: __START_PAUSED as every touch test — under SwiftShader the live 3D loop renders at ~1 fps and the game's own clock crawled
    //  with it: the snap's gold band never came in 8 s; the simulation runs on its 50-ms interval instead, the game in real time)
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__DT_MAX = 0.6; window.__START_PAUSED = true; try { localStorage.clear(); } catch (e) { /* */ } });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const tap = (x, y) => pg.touchscreen.tap(Math.max(4, Math.min(W - 4, x)), Math.max(4, Math.min(H - 4, y)));
    const cdp = await ctx.newCDPSession(pg);   // (a finger's swipe along a cue {x, y → x2, y2}: CDP touch, as jobs-touch)
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1, radiusX: 6, radiusY: 6, force: 1 })) });
    const swipe = async (bb, k, n = 8, gap = 16) => { const P = (u, v) => [bb.x + bb.width * u, bb.y + bb.height * v], A = P(k.x, k.y), Z = P(k.x2 == null ? k.x : k.x2, k.y2 == null ? k.y : k.y2); await touch('touchStart', [A]); for (let q = 1; q <= n; q++) { await touch('touchMove', [[A[0] + ((Z[0] - A[0]) * q) / n, A[1] + ((Z[1] - A[1]) * q) / n]]); await pg.waitForTimeout(gap); } await touch('touchEnd', []); };
    const shot = async (name) => { const f = path.join(OUT, `${name}.png`); await pg.screenshot({ path: f, timeout: 120000 }); console.log('   shot', path.relative(ROOT, f)); };
    // the opening: a tap skips it
    await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, { timeout: 15000 }).catch(() => {});
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox(); if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await pg.waitForTimeout(1500);
    for (const game of ONLY) {
      const site = SITE[game];
      // open the job's game as the course loop does (runMinigame with the site, the skin, the level)
      await G(([game, site, skin]) => {
        window.__R = null;
        const run = globalThis.__BH_PARTS.minigames.runMinigame;
        run(game, { root: __T.game.ui.root || document.body, world: __T.stages, site, skin, level: 0, seed: 77, n: 0, kicker: 'בדיקה' }).then((r) => { window.__R = r; });
      }, [game, site, SKIN[game]]);
      await pg.waitForSelector('.fx-mg', { timeout: 10000 });
      await pg.waitForTimeout(700);
      const t0 = Date.now();
      let shotPlay = false, taps = 0;
      while (Date.now() - t0 < 90000) {
        const s = await G(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? { ...w.__mg.state(), cue: w.__mg.cue() } : null; });
        if (!s) break;
        if (s.done) break;
        if (s.how) { const e = await pg.$('.fx-mg-how'); const bb = e && await e.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height * 0.85); await pg.waitForTimeout(250); continue; }
        if (!shotPlay && s.progress >= 1) { shotPlay = true; await shot(`${game}-play`); }
        const c = s.cue; if (!c) { await pg.waitForTimeout(120); continue; }
        if (c.timed) await pg.waitForFunction(() => { const w = document.querySelector('.fx-mg'); const k = w && w.__mg && w.__mg.cue(); return !!(k && k.now) || !w || w.classList.contains('done'); }, null, { polling: 'raf', timeout: 8000 }).catch(() => {});
        const k = (await G(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? w.__mg.cue() : null; })) || c;
        const cv = await pg.$('.fx-mg canvas'); const bb = cv && await cv.boundingBox();
        if (bb && (k.x2 != null || k.y2 != null)) { await swipe(bb, k); taps++; }   // (the hand's swipe: the cord lifted, a stone dragged to its seat)
        else if (bb) { await tap(bb.x + bb.width * (k.x == null ? 0.5 : k.x), bb.y + bb.height * (k.y == null ? 0.5 : k.y)); taps++; }
        await pg.waitForTimeout(c.timed ? 200 : 260);
      }
      await pg.waitForFunction(() => { const w = document.querySelector('.fx-mg'); return !w || w.classList.contains('done'); }, null, { timeout: 15000 }).catch(() => {});
      await pg.waitForTimeout(700);
      const res = await G(() => { const w = document.querySelector('.fx-mg'); if (!w) return null; const t = (s) => (w.querySelector(s) || {}).textContent || ''; const btns = [...w.querySelectorAll('.fx-mg-res button')].map((x) => { const r = x.getBoundingClientRect(); return Math.min(r.width, r.height); }); return { stars: t('.fx-mg-stars'), tier: t('.fx-mg-tier'), fact: t('.fx-mg-fact'), title: t('.fx-mg-top b'), btns }; });
      await shot(`${game}-result`);
      const secs = Math.round((Date.now() - t0) / 1000);
      check(`${game}: played by touch to its result (${taps} taps, ${secs} s)`, !!res && /★/.test(res.stars) && secs <= 45, res ? `${res.title} · ${res.stars} ${res.tier}` : 'no result');
      check(`${game}: its fact is sourced (טיוטה / המחשה) and its buttons ≥ 44 px`, !!res && res.fact.length > 20 && /טיוטה|המחשה/.test(res.fact) && res.btns.every((v) => v >= 44), res ? res.fact.slice(0, 80) : '');
      const go = await pg.$('.fx-mg .fx-go'); const gb = go && await go.boundingBox(); if (gb) await tap(gb.x + gb.width / 2, gb.y + gb.height / 2);
      await pg.waitForFunction(() => !!window.__R, null, { timeout: 8000 }).catch(() => {});
      // (the next game only once this one's sheet is gone)
      await pg.waitForFunction(() => !document.querySelector('.fx-mg'), null, { timeout: 10000 }).catch(async () => { await G(() => { const b = document.querySelector('.fx-mg .fx-go'); if (b) b.click(); }); });
      const r = await G(() => window.__R);
      check(`${game}: resolves with a quality`, !!r && typeof r.quality === 'number', r ? `q ${r.quality} ${r.skipped ? 'skipped' : ''}` : 'none');
      await pg.waitForTimeout(600);
    }
    const bad = logs.filter((l) => !/fonts|favicon/.test(l));
    check('no console errors', !bad.length, bad.slice(0, 3).join(' | '));
    await ctx.close();
  } finally { await b.close(); }
  const pass = results.filter((r) => r.ok).length;
  console.log(`\n${pass}/${results.length} passed`);
  process.exit(pass === results.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
