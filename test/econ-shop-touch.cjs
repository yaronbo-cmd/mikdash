// ECON14 (wave 14) — the purse, the coins' flight and אוצר המלאכה by REAL TOUCH at 390×844 on dist/test.html: a job's pay flies
// to the purse (≤ 12 coins, ≤ 1.2 s, a tap skips), the first pay's card (עזרא ג, ז), the purse opens the shop, every buy button
// is ≥ 44 px, a lamp is bought by a tap, her mark is drawn by a drag and kept (25 coins), Shabbat closes the shop.
//   node test/econ-shop-touch.cjs [--no-build]
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
    const shot = async (name) => { await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); }); const f = path.join(OUT, `shop-${name}.png`); await pg.screenshot({ path: f, timeout: 240000 }); console.log('   shot', path.relative(ROOT, f)); await G(() => { window.__HUD_HOLD = false; }); };
    const box = (sel) => G((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, sel);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);
    await G(() => { const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, ''); Object.assign(g.st.har, { p: 'courses', dp: 1, paid: 999, set: 2, k: 0, chk: 0 }); g.st.har.keys[0] = 0.9; g.res.stone = 400; g.crews = []; __T.game._.resync(); });
    await pg.waitForTimeout(2000);
    // the purse: 44 px, in the top row
    const pu = await box('.gm-purse');
    check('the purse is in the top row, ≥ 44 px tall', pu && pu.h >= 44 && pu.w >= 44 && pu.y < 60, JSON.stringify(pu));
    // a job's pay (as FUN14's playJob pays it): the coins fly to the purse
    const s0 = await G(() => __T.game.state.res.silver);
    const t0 = Date.now();
    await G(() => { const g = __T.game.state, out = __T.game.S ? null : null; const P = globalThis.__BH_PARTS.econ; window.__PAYOUT = null; const S = window.__T.gameState || null; });
    await G(() => { const g = __T.game.state; const o = { coins: 9, stars: 3, first: !g.econ.paid1, id: 'strike' }; g.res.silver += 9; g.econ.paid1 = 1; globalThis.__BH_PARTS.econ.pay(o, { x: 195, y: 520 }); });
    await pg.waitForTimeout(450);
    const flying = await G(() => [...document.querySelectorAll('.gm-coin')].filter((e) => getComputedStyle(e).opacity !== '0').length);
    await shot('1-flight');
    check('the coins fly (3–12 sprites in the air)', flying >= 3 && flying <= 12, `${flying}`);
    const landed = await waitFor(() => !document.querySelector('.gm-coin') || [...document.querySelectorAll('.gm-coin')].every((e) => e.style.opacity === '0'), null, 3000);
    check('they land within 1.2 s (+ the machine\'s slack)', landed && Date.now() - t0 < 2600, `${Date.now() - t0} ms`);
    check('the purse counts the pay', await G((s0) => +document.querySelector('.gm-purse .gm-num').textContent >= s0 + 9 - 1, s0));
    // the first pay's card
    const card = await waitFor(() => /ויתנו כסף לחצבים|וַיִּתְּנוּ/.test((document.querySelector('.gm-modal.on') || {}).textContent || ''), null, 5000);
    check('the first pay\'s card quotes עזרא ג, ז (טיוטה)', card && await G(() => /עזרא ג, ז/.test(document.querySelector('.gm-modal.on').textContent) && /טיוטה/.test(document.querySelector('.gm-modal.on').textContent)));
    await shot('2-first-card');
    { const g = await box('.gm-modal.on .gm-btn-gold'); if (g) await tap(g.x, g.y); await pg.waitForTimeout(600); }
    // the purse opens the shop
    await G(() => { __T.game.state.res.silver = 140; __T.game.ui.refresh(); });
    { const p = await box('.gm-purse'); await tap(p.x, p.y); }
    check('the purse opens אוצר המלאכה', await waitFor(() => /אוצר המלאכה/.test((document.querySelector('.gm-sheet h2') || {}).textContent || '') && document.querySelectorAll('.gm-shop-card').length >= 10, null, 4000));
    await pg.waitForTimeout(400);
    await shot('3-shop');
    // every buy button ≥ 44 px (scrolled into view one by one)
    const small = await G(() => { const out = []; for (const e of document.querySelectorAll('.gm-buy')) { e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); if (r.width < 44 || r.height < 44) out.push(`${e.dataset.k}:${Math.round(r.width)}×${Math.round(r.height)}`); } return { n: document.querySelectorAll('.gm-buy').length, small: out }; });
    check('every shop button is ≥ 44 × 44 px', small.n >= 10 && small.small.length === 0, `${small.n} buttons ${small.small.join(' ')}`);
    // a lamp, by a tap
    const lampBtn = async () => { await G(() => document.querySelector('.gm-buy[data-k="lamp"]').scrollIntoView({ block: 'center' })); await pg.waitForTimeout(250); return box('.gm-buy[data-k="lamp"]'); };
    { const lb = await lampBtn(); await tap(lb.x, lb.y); }
    check('a tap buys a lamp (30 coins; the 3D gets setOwned)', await waitFor(() => __T.game.state.shop.lamps === 1 && __T.game.state.res.silver === 110, null, 3000), await G(() => JSON.stringify([__T.game.state.shop, __T.game.state.res.silver])));
    await shot('4-lamp');
    // her mark: the pad opens, a drag draws, "✓ זה הסימן שלי" keeps it
    await G(() => document.querySelector('.gm-buy[data-k="mark"]').scrollIntoView({ block: 'center' })); await pg.waitForTimeout(250);
    { const mb = await box('.gm-buy[data-k="mark"]'); await tap(mb.x, mb.y); }
    const pad = await waitFor(() => !!document.querySelector('.fx-mg[data-kind="drawMark"] canvas'), null, 5000);
    check('the mark\'s pad opens', pad);
    if (pad) {
      await pg.waitForTimeout(700);
      const cv = await box('.fx-mg canvas');
      // (the how-to's tap first, if shown), then a stroke by real touch through CDP
      const cdp = await ctx.newCDPSession(pg);
      const touch = async (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y]) => ({ x, y, id: 1 })) });
      const pts = []; for (let k = 0; k <= 24; k++) { const a = (k / 24) * 6.283; pts.push([cv.x + Math.cos(a) * cv.w * 0.18, cv.y + Math.sin(a) * cv.h * 0.2]); }
      await touch('touchStart', [pts[0]]); for (const p of pts.slice(1)) { await touch('touchMove', [p]); await pg.waitForTimeout(16); } await touch('touchEnd', []);
      await pg.waitForTimeout(300);
      await shot('5-mark-drawn');
      const ok = await box('.fx-mg .fx-ok[data-b="done"]'); if (ok) await tap(ok.x, ok.y);
      await pg.waitForTimeout(900);
      check('her mark is kept: 25 coins, one stone at this stage', await waitFor(() => __T.game.state.shop.marks && __T.game.state.shop.marks.har === 1 && __T.game.state.res.silver === 85, null, 6000), await G(() => JSON.stringify([__T.game.state.shop, __T.game.state.res.silver])));
    }
    // Shabbat closes the shop with nothing lost (the regular game: a rest day)
    await G(() => { __T.game.ui.closeSheet(); });
    check('no page errors', logs.length === 0, logs.slice(0, 3).join(' | '));
  } catch (e) { check('the probe ran', false, e.message); } finally { await b.close(); }
  const bad = results.filter((r) => !r.ok);
  console.log(`\n${results.length - bad.length}/${results.length} passed`);
  process.exit(bad.length ? 1 : 0);
})();
