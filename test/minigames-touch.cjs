// (wave 8B, GAMES8B) Every precision game and the match-3 board played by REAL touch at 390×844 — Playwright hasTouch,
// page.touchscreen.tap and CDP touch drags — in normal mode, with no autoplay flag (no __MG_AUTO / __M3_AUTO, no demo).
// The bot reads only what a player sees (the hand's cue: where, and whether now is the moment) and answers with a finger.
// Checked per game: the first-time how-to shows and the game waits for the tap; nothing plays by itself; the game is won by
// touch (not skipped) at a fair accuracy. Then: #demo's autopilot hands a game and a board over at the first real touch;
// the board swaps by drag and by tap-tap. One browser, closed in finally.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/minigames-touch.cjs [--shots]   → PASS/FAIL lines
//   shots (--shots): test/out/touch/<kind>-howto.png · -play.png · -result.png · m3-*.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/touch');
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = process.argv.includes('--shots');
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));

const js = esbuild.buildSync({
  stdin: { contents: "export * from './src/game/minigames/index.js'; export { createAudio } from './src/game/audio.js';", resolveDir: ROOT },
  bundle: true, format: 'iife', globalName: 'MG', write: false, target: 'es2020', minify: true,
}).outputFiles[0].text;
const PAGE = path.join(OUT, 'touch-lab.html');
fs.writeFileSync(PAGE, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>touch lab</title></head><body style="margin:0;height:100vh;background:linear-gradient(#7FA3C8,#E9CF9E 60%,#B89C6C)"><script>${js}</script></body></html>`);
esbuild.buildSync({ entryPoints: [path.join(__dirname, 'match3-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/match3.bundle.js'), logLevel: 'warning', charset: 'utf8' });

const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const GAMES = [['crane', {}], ['crane', { what: 'great' }], ['dress', {}], ['quarry', {}], ['plumb', {}], ['whole', {}], ['plumb', { site: 'karnot' }]];   // (GAMES13: the altar's top — the level first)
const PATIENT = { crane: 9500, quarry: 7000, plumb: 8000, whole: 4500 };   // longer than the old crew timeouts (8, 5, 6, 2.3 s)

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message));
    await pg.route(/fonts\.googleapis|fonts\.gstatic/, (r) => r.fulfill({ status: 200, body: '' }));
    const shot = (n) => (SHOTS ? pg.screenshot({ path: path.join(OUT, n + '.png') }) : null);
    const st = () => pg.evaluate(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? w.__mg.state() : null; });
    const cue = () => pg.evaluate(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? w.__mg.cue() : null; });
    const tapAt = async (sel, fx = 0.5, fy = 0.5) => { const bb = await pg.locator(sel).first().boundingBox(); if (!bb) return false; await pg.touchscreen.tap(bb.x + bb.width * fx, bb.y + bb.height * fy); return true; };
    const start = (kind, o) => pg.evaluate(([k, o]) => { window.__R = null; window.MG.runMinigame(k, { level: 0, seed: 11, ...o, sfx: window.MG.createAudio({}) }).then((r) => { window.__R = r; }); }, [kind, o]);

    /* a player's hand: follow the cue; a timed cue waits for its moment (watched in the page, frame by frame) */
    async function playByTouch(kind, maxMs = 90000) {
      const t0 = Date.now();
      let taps = 0;
      while (Date.now() - t0 < maxMs) {
        if (await pg.evaluate(() => !!document.querySelector('.fx-mg.done'))) return taps;
        const s = await st();
        if (s && s.how) { await tapAt('.fx-mg-how', 0.5, 0.85); taps++; await pg.waitForTimeout(250); continue; }
        const c = await cue();
        if (!c) { await pg.waitForTimeout(80); continue; }
        if (c.btn) { await tapAt(`.fx-mg [data-b="${c.btn}"]`); taps++; await pg.waitForTimeout(450); continue; }
        if (c.timed) {
          const hit = await pg.waitForFunction(() => { const w = document.querySelector('.fx-mg'); const k = w && w.__mg && w.__mg.cue(); return !!(k && k.now) || !!(w && w.classList.contains('done')); }, null, { polling: 'raf', timeout: 8000 }).then(() => true, () => false);
          if (!hit) continue;
          if (await pg.evaluate(() => !!document.querySelector('.fx-mg.done'))) return taps;
        }
        const k = (await cue()) || c, bb = await pg.locator('.fx-mg canvas').boundingBox();
        await pg.touchscreen.tap(bb.x + bb.width * k.x, bb.y + bb.height * k.y); taps++;
        await pg.waitForTimeout(c.timed ? 160 : 240);
      }
      return taps;
    }

    await pg.goto('file://' + PAGE);
    for (const [kind, o] of GAMES) {
      const name = kind + (o.what ? ':' + o.what : '') + (o.site ? '@' + o.site : '');
      await pg.evaluate(() => { try { localStorage.clear(); } catch (e) { /* file:// */ } });
      await start(kind, { ...o, howto: true });
      await pg.waitForTimeout(700);
      let s = await st();
      const handOn = await pg.evaluate(() => !!document.querySelector('.fx-mg-hand.on'));
      check(`${name}: the first-time how-to shows with the hand on the target`, s && s.how && handOn);
      await pg.waitForTimeout(1800);
      s = await st();
      check(`${name}: the game waits for the player's tap (no progress under the how-to)`, s && s.progress === 0 && !s.auto, `progress ${s && s.progress}`);
      await shot(name.replace(':', '-') + '-howto');
      await tapAt('.fx-mg-how', 0.5, 0.85);
      await pg.waitForTimeout(300);
      s = await st();
      check(`${name}: a tap closes the how-to`, s && !s.how);
      if (o.site) {   // (GAMES13) a leveling stage: the level's notch is the first target, and the sheet says what is leveled
        const c0 = await cue(), k0 = await pg.evaluate(() => (document.querySelector('.fx-mg-k') || {}).textContent || '');
        check(`${name}: the level with the needle comes first (the cue on the notch), "${k0}"`, c0 && Math.abs(c0.y - 0.58) < 0.01 && /פלס/.test(k0), JSON.stringify(c0));
      }
      if (PATIENT[kind] && !o.what && !o.site) {
        await pg.waitForTimeout(PATIENT[kind]);
        s = await st();
        check(`${name}: nothing plays by itself (${(PATIENT[kind] / 1000).toFixed(1)} s untouched)`, s && s.progress === 0, `progress ${s && s.progress}`);
      }
      if (SHOTS) setTimeout(() => shot(name.replace(':', '-') + '-play').catch(() => {}), kind === 'dress' ? 1500 : 900);
      const t0 = Date.now();
      const taps = await playByTouch(kind);
      await pg.waitForTimeout(400);
      const res = await pg.evaluate(() => ({ tier: (document.querySelector('.fx-mg-tier') || {}).textContent || '', acc: (document.querySelector('.fx-mg-acc') || {}).textContent || '', fact: (document.querySelector('.fx-mg-fact') || {}).textContent || '' }));
      await shot(name.replace(':', '-') + '-result');
      await tapAt('.fx-mg .fx-go');
      await pg.waitForFunction(() => window.__R, null, { timeout: 5000 }).catch(() => {});
      const r = await pg.evaluate(() => window.__R);
      check(`${name}: played to the end by real touch`, r && !r.skipped && r.quality >= 0.5, `${taps} taps, ${((Date.now() - t0) / 1000).toFixed(1)} s, quality ${r && r.quality}, ${res.tier} · ${res.acc}`);
      check(`${name}: a fact line on the result`, res.fact.length > 20);
      await pg.waitForTimeout(400);
    }

    /* #demo: the autopilot plays, and the first real touch takes the game over at the player's pace */
    await start('quarry', { demo: true, howto: false });
    await pg.waitForFunction(() => { const w = document.querySelector('.fx-mg'); return !!(w && w.__mg && w.__mg.state().progress > 0); }, null, { timeout: 20000, polling: 100 }).catch(() => {});
    let s = await st();
    check('demo: the autopilot plays a precision game', s && s.auto && s.progress > 0, `progress ${s && s.progress}`);
    await tapAt('.fx-mg canvas');
    await pg.waitForTimeout(250);
    const p0 = (await st()).progress;
    await pg.waitForTimeout(6500);
    s = await st();
    check('demo: a real touch takes the game over (the autopilot stops)', s && !s.auto && s.progress <= p0 + 1, `progress ${p0} → ${s && s.progress}`);
    await playByTouch('quarry');
    await tapAt('.fx-mg .fx-go');
    await pg.waitForFunction(() => window.__R, null, { timeout: 5000 }).catch(() => {});
    check('demo: the player finishes the game the autopilot started', !!(await pg.evaluate(() => window.__R)));

    /* the board: swaps by drag and by tap-tap, by real touch; then #demo's board handed over at a touch */
    const cdp = await ctx.newCDPSession(pg);
    const drag = async (a, z) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a[0], y: a[1] }] });
      for (let k = 1; k <= 5; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a[0] + ((z[0] - a[0]) * k) / 5, y: a[1] + ((z[1] - a[1]) * k) / 5 }] }); await pg.waitForTimeout(16); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    const geo = () => pg.evaluate(() => { const T = window.__M3_TEST, h = document.querySelector('.m3-hit'); if (!T || !h) return null; const r = h.getBoundingClientRect(); return { R: T.s.R, C: T.s.C, x: r.left, y: r.top, w: r.width, h: r.height, used: T.s.used, hint: T.hint() }; });
    const cell = (g, i) => [g.x + ((i % g.C) + 0.5) * (g.w / g.C), g.y + (Math.floor(i / g.C) + 0.5) * (g.h / g.R)];
    const board = async (demo, level) => {
      await pg.goto('file://' + path.join(__dirname, 'match3.html'));
      await pg.evaluate(([d, lv]) => { window.__R = null; window.M3.runLevel({ field: 'quarry', level: lv, sfx: window.__sfx, map: false, test: true, demo: d }).then((r) => { window.__R = r; }); }, [demo, level]);
      await pg.waitForTimeout(demo ? 900 : 1200);
    };
    await board(false, 2);
    check('board: the start card opens by a tap', await tapAt('.m3-card button'));
    await pg.waitForTimeout(900);
    await shot('m3-start');
    let ok = 0, ms = [];
    for (let m = 0; m < 6; m++) {
      await pg.waitForFunction(() => window.__M3_TEST && window.__M3_TEST.view && !window.__M3_TEST.view.locked, null, { timeout: 8000, polling: 100 }).catch(() => {});
      const g = await geo(); if (!g || !g.hint) break;
      const a = cell(g, g.hint[0]), z = cell(g, g.hint[1]), t1 = Date.now();
      if (m % 2 === 0) await drag(a, z); else { await pg.touchscreen.tap(...a); await pg.waitForTimeout(140); await pg.touchscreen.tap(...z); }
      let u = g.used;
      for (let k = 0; k < 80 && u === g.used; k++) { await pg.waitForTimeout(60); u = (await geo() || {}).used; }
      if (u === g.used + 1) ok++;
      await pg.waitForFunction(() => window.__M3_TEST && !window.__M3_TEST.view.locked, null, { timeout: 8000, polling: 50 }).catch(() => {});
      ms.push(Date.now() - t1);
      await pg.waitForTimeout(500);
      if (m === 0) await shot('m3-after-drag');
    }
    check('board: 6 swaps by real touch (drag, tap-tap, alternating) each make a move', ok === 6, `${ok}/6 · ${ms.map((x) => (x / 1000).toFixed(1)).join(' ')} s from the touch to the board settled (swap + cascade)`);
    await board(true, 12);
    const g0 = await geo();
    const a = cell(g0, g0.hint[0]), z = cell(g0, g0.hint[1]);
    await drag(a, z);
    await pg.waitForTimeout(2600);
    const u1 = (await geo() || {}).used;
    await pg.waitForTimeout(4000);
    const u2 = (await geo() || {}).used;
    check('board demo: a real touch takes the board over (no autopilot move after it)', u1 != null && u1 === u2, `used ${g0.used} → ${u1} → ${u2}`);
    check('no page errors', errs.length === 0, errs.slice(0, 2).join(' | '));
  } finally {
    await b.close();
  }
  const bad = results.filter((x) => !x).length;
  console.log(`\n${results.length - bad}/${results.length} PASS`);
  process.exit(bad ? 1 : 0);
})();
