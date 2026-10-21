// (FUN11, wave 11) The in-between games' door in the world, by REAL touch at 390×844 (Playwright hasTouch + touchscreen.tap; no
// autoplay flag). SITE11's game table by the quarry (stages.gameTable) and FUN11's sign over it ("משחקים"): the camera is posed once
// to look at the table (declared: a player's pan would bring it there), then only touch —
//   the sign shows over the table (≥ 44 px, on screen, just above it) → a tap opens the hub with the stage's game first
//   ("מתאים למה שאתה בונה") → back; a tap on the table itself (SITE11's pick) opens the hub too → back; under a sheet the sign hides.
// On a build without SITE11's table (a lone s11-fun) it reports that and checks only that nothing shows.
//   node test/games-door-touch.cjs [--file=dist/test.html] [--shots]      shots: test/out/games/door-*.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/games');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots');
const FILE = (args.find((a) => a.startsWith('--file=')) || '').slice(7) || path.join(ROOT, 'dist/test.html');
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__DT_MAX = 0.6;
      try {
        if (!sessionStorage.getItem('door-once')) {
          sessionStorage.setItem('door-once', '1'); localStorage.clear();
          localStorage.setItem('bh_settings', JSON.stringify({ demo: false }));
          localStorage.setItem('bh_beta2', JSON.stringify({ v: 6, ftue: 99, op: 1, name: 'יכין', mishmar: 3, created: Date.now() - 864e5, clock: Date.now(), lastSeen: Date.now(), focus: 'wall', st: { har: { done: true } }, res: { stone: 40, cedar: 0, bronze: 0, gold: 0, silver: 60, wstone: 0 } }));
        }
      } catch (e) { /* blocked */ }
    });
    await pg.goto('file://' + path.resolve(ROOT, FILE));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 240000 });
    await pg.waitForTimeout(1500);
    const E = (fn, a) => pg.evaluate(fn, a);
    const shot = async (n) => { if (SHOTS) { await E(() => { __T.render(); try { for (const a of document.getAnimations()) { try { a.finish(); } catch (e) { /* infinite */ } } } catch (e) { /* */ } }); await pg.screenshot({ path: path.join(OUT, `door-${n}.png`), timeout: 120000 }); console.log('   shot', `test/out/games/door-${n}.png`); } };
    const tapBox = async (bb) => { await pg.touchscreen.tap(Math.round(bb.x + bb.width / 2), Math.round(bb.y + bb.height / 2)); };
    const tapSel = async (sel) => { const l = pg.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 15000 }); await tapBox(await l.boundingBox()); };
    for (let i = 0; i < 5; i++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) break; const bb = await m.boundingBox(); if (bb) await tapBox(bb); await pg.waitForTimeout(700); }
    const hasT = await E(() => !!(__T.stages && typeof __T.stages.gameTable === 'function'));
    if (hasT) await pg.waitForFunction(() => __T.stages.gameTable().on, null, { polling: 250, timeout: 12000 }).catch(() => {});   // (the quarry turns on at the world's next update)
    const T = hasT ? await E(() => __T.stages.gameTable()) : null;
    if (!T) {
      await pg.waitForTimeout(1500);
      check('no table in this world (a build without SITE11\'s): no sign shows', !(await E(() => !!document.querySelector('.g10-tag-w.on'))));
      check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
      return;
    }
    check('the world has SITE11\'s game table by the quarry', T && T.on, JSON.stringify(T));
    // the camera looks at the table once (a pan would bring it there): from the south-east, at 70 amot
    await E(([x, y, z]) => { __T.view.lookAt(x, y, z, 70, 40, 22, 10); }, [T.x, T.y, T.z]);
    await pg.waitForTimeout(1200);
    await E(() => { __T.render(); });
    const on = await pg.waitForSelector('.g10-tag-w.on', { timeout: 10000 }).then(() => true, () => false);
    await pg.waitForTimeout(400);
    const sg = await E(([x, y, z]) => { const e = document.querySelector('.g10-tag-w'); if (!e) return null; const r = e.getBoundingClientRect(), p = __T.view.project(x, y, z), at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { w: Math.round(r.width), h: Math.round(r.height), l: Math.round(r.left), t: Math.round(r.top), b: Math.round(r.bottom), px: Math.round(p.x), py: Math.round(p.y), top: !!(at && e.contains(at)), text: e.textContent.trim() }; }, [T.x, T.y, T.z]);
    check('the sign "משחקים" shows over the table (≥ 44 px, on screen, just above it, on top)', on && sg && sg.h >= 44 && sg.w >= 44 && sg.l >= 0 && sg.l + sg.w <= 390 && sg.b <= sg.py + 4 && sg.b >= sg.py - 90 && Math.abs(sg.l + sg.w / 2 - sg.px) <= 30 && sg.top, JSON.stringify(sg));
    await shot('sign');
    await tapSel('.g10-tag-w');
    const hubOn = await pg.waitForSelector('.g10-tile', { timeout: 8000 }).then(() => true, () => false);
    await pg.waitForTimeout(400);
    const hub = hubOn ? await E(() => { const f = document.querySelector('.g10-tile'); return { first: f.dataset.v, feat: f.classList.contains('g10-feat'), rib: (f.querySelector('.g10-rib') || {}).textContent || '' }; }) : null;
    check('a tap on the sign opens the hub, the stage\'s game first ("מתאים למה שאתה בונה")', hubOn && hub.feat && /מתאים/.test(hub.rib), JSON.stringify(hub));
    await shot('hub');
    check('the sign is gone while the games are open', !(await E(() => !!document.querySelector('.g10-tag-w.on'))));
    await tapSel('.g10-x[data-v="close"]');
    await pg.waitForFunction(() => !document.querySelector('.g10'), null, { timeout: 8000 });
    // the table itself, by touch (SITE11's pick target)
    await E(([x, y, z]) => { __T.view.lookAt(x, y, z, 70, 40, 22, 10); }, [T.x, T.y, T.z]);
    await pg.waitForTimeout(1200);
    await E(() => { __T.render(); });
    const tp = await E(([x, y, z]) => { const p = __T.view.project(x, y - 1, z); return { x: Math.round(p.x), y: Math.round(p.y), on: p.on }; }, [T.x, T.y, T.z]);
    await pg.touchscreen.tap(tp.x, tp.y);
    const hub2 = await pg.waitForSelector('.g10-tile', { timeout: 8000 }).then(() => true, () => false);
    check('a tap on the table itself (SITE11\'s pick) opens the games too', hub2, JSON.stringify(tp));
    if (hub2) {
      await pg.waitForTimeout(500);
      await tapSel('.g10-x[data-v="close"]');
      let gone = await pg.waitForFunction(() => !document.querySelector('.g10'), null, { timeout: 8000 }).then(() => true, () => false);
      if (!gone) {
        console.log('   after the close tap:', JSON.stringify(await E(() => ({ n: document.querySelectorAll('.g10').length, tiles: document.querySelectorAll('.g10-tile').length, x: document.querySelectorAll('.g10-x').length }))));
        await tapSel('.g10-x[data-v="close"]');
        gone = await pg.waitForFunction(() => !document.querySelector('.g10'), null, { timeout: 8000 }).then(() => true, () => false);
      }
      check('its "חזרה" closes the games', gone);
    }
    // under a sheet the sign steps aside
    await tapSel('.gm-rb[data-k="menu"]');
    await pg.waitForSelector('.gm-sheet.on', { timeout: 8000 });
    await pg.waitForTimeout(500);
    check('under an open sheet the sign hides', !(await E(() => !!document.querySelector('.g10-tag-w.on'))));
    const mk = await E(() => { const b = document.querySelector('[data-g10].gm-btn-gold'); if (!b) return null; const r = b.getBoundingClientRect(); return { id: b.dataset.g10, t: b.textContent.trim(), h: Math.round(r.height), n: document.querySelectorAll('[data-g10]').length }; });
    const n5 = await E(() => [...document.querySelectorAll('[data-g10]')].map((b) => Math.round(b.getBoundingClientRect().height)));
    check('the menu\'s games: all six (FUN12: the sling), 44 px; at most one marked, with its ✦ (the stage in focus; none without one)', n5.length === 6 && n5.every((h) => h >= 44) && (!mk || /✦/.test(mk.t)) && (await E(() => document.querySelectorAll('[data-g10].gm-btn-gold').length)) <= 1, JSON.stringify({ mk, n5 }));
    await shot('menu');
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) {
    check('the run finished', false, e.message.split('\n')[0]);
  } finally {
    await b.close();
    const fails = results.filter((x) => !x).length;
    console.log(`\n${results.length - fails}/${results.length} passed`);
    process.exit(fails ? 1 : 0);
  }
})();
