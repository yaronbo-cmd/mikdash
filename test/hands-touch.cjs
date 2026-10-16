// (FLOW16, wave 16) "The screen is the tool": the treadwheel craft played IN THE WORLD by REAL touch at 390×844 on dist/test.html —
// no sheet, no pane, no result card. The wall's first course (game-courses-touch's fixture), a deal with the 'tread' card by
// touch; then only the canvas: a finger right / left of the kohen turns the real wheel (SITE15's crane: __T.stages.tread().h rises),
// the stone seats; the hint hand is anchored in the world (within 120 px of the wheel); the end is a float ("★★ · +N מטבעות")
// and the mentor's line with its ref in his bubble, dismissed by a tap. No .fx-mg element at any time; no console errors.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/hands-touch.cjs [--no-build] [--shots]   shots: test/out/hands/*.png
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/hands');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), W = 390, H = 844;
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      window.__MG_SEEN = []; new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('fx-mg')) window.__MG_SEEN.push((n.dataset && n.dataset.kind) || '?'); }).observe(document, { childList: true, subtree: true });
      window.__FLOATS = []; setInterval(() => { for (const f of document.querySelectorAll('.gm-float')) if (f.style.opacity && f.style.opacity !== '0' && f.textContent && !window.__FLOATS.includes(f.textContent)) window.__FLOATS.push(f.textContent); }, 80);
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const tap = (x, y) => pg.touchscreen.tap(Math.max(4, Math.min(W - 4, x)), Math.max(4, Math.min(H - 4, y)));
    const cdp = await ctx.newCDPSession(pg);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1, radiusX: 6, radiusY: 6, force: 1 })) });
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/hands/' + name + '.png');
      await G(() => { window.__HUD_HOLD = false; });
    };
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);
    /* the fixture: the wall's first course (as game-courses-touch --part=wall), the deal on the table holds the 'tread' card */
    await G(() => {
      const g = __T.game.state, site = 'wall'; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
      for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
      g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
      g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = [];
      g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: { wall: { c: 0, n: 0, key: 1, re: 0, line: 1, deal: { cards: ['tread', 'strike'], key: null, quarry: false, set: 0, t: 1 } } }, deals: { wall: 1 }, sig: { wall: 1 }, best: {} };
      __T.game._.resync();
    });
    await pg.waitForTimeout(2500);
    /* the deal by touch: the pill, then the tread card */
    const pill = await G(() => { const p = document.querySelector('.gm-pill'); if (!p) return null; const r = p.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, kind: p.dataset.kind, txt: p.textContent }; });
    check('the pill is the course loop\'s ("מה נעשה עכשיו?")', pill && pill.kind === 'jobs', pill && pill.txt);
    await tap(pill.x, pill.y);
    const card = await waitFor(() => !!document.querySelector('.gm-deal.on .gm-jc[data-job="tread"]'), null, 8000) && await G(() => { const r = document.querySelector('.gm-deal.on .gm-jc[data-job="tread"]').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    check('the deal shows the tread card', !!card);
    if (card) await tap(card.x, card.y);
    const on = await waitFor(() => !!window.__HANDS && window.__HANDS.kind === 'tread', null, 15000);
    check('the craft opens in the world (hands.js: __HANDS, a "craft" begin event)', on && await G(() => window.__GAME_LOG.some((e) => e.type === 'craft' && e.d.at === 'begin' && e.d.kind === 'tread')));
    await pg.waitForTimeout(2600);   // (his walk into the wheel, the camera's flight)
    const wheel = () => G(() => { const t = __T.stages.tread(); const q = t.at ? __T.view.project(t.at[0], t.at[1] + 1.2, t.at[2]) : null; return { on: t.on, h: t.h, set: t.set, inWheel: t.inWheel, x: q ? Math.round(q.x) : null, y: q ? Math.round(q.y) : null, vis: !!(q && q.on) }; });
    const hint = async () => { const w = await wheel(); const c = await G(() => { const e = document.querySelector('.gm-coach'); if (!e || e.classList.contains('gm-hidden') || e.style.opacity === '0') return null; const m = e.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return m ? { x: +m[1], y: +m[2] } : null; }); return { w, c, d: c && w.x != null ? Math.round(Math.hypot(c.x - w.x, c.y - w.y)) : null }; };
    let hs = await hint();
    for (let k = 0; k < 20 && !(hs.c && hs.d != null && hs.d <= 120); k++) { await pg.waitForTimeout(300); hs = await hint(); }
    check('the hint hand is anchored in the world: within 120 px of the wheel\'s projection', hs.c && hs.d != null && hs.d <= 120, JSON.stringify(hs));
    check('the coach says the craft\'s words (no sheet hint)', await G(() => /רגל ימין/.test(__T.game.ui.coachText || '')), await G(() => __T.game.ui.coachText));
    await shot('1-hint');
    /* the play: a finger on the kohen's side the hand points to, held as long as the cue says (the model's own stride) */
    let maxH = 0, maxSet = 0, taps = 0, shot2 = false, w0 = await wheel();
    const t1 = Date.now();
    while (Date.now() - t1 < 80000) {
      const s = await G(() => (window.__HANDS ? { st: window.__HANDS.state(), cue: window.__HANDS.cue(), at: window.__HANDS.at() } : null));
      if (!s) break;
      const w = await wheel(); maxH = Math.max(maxH, w.h || 0); maxSet = Math.max(maxSet, w.set || 0);
      if (s.st.done) break;
      if (!shot2 && (s.st.i >= 1 || (w.h > 0.3 && taps > 6))) { shot2 = true; await shot('2-play'); }
      const c = s.cue;
      if (!c || !c.btn || !s.at || !s.at.on) { await pg.waitForTimeout(120); continue; }
      if (!c.now) { await pg.waitForTimeout(60); continue; }
      const p = [Math.max(6, Math.min(W - 6, s.at.x)), Math.max(6, Math.min(H - 6, s.at.y))];
      await touch('touchStart', [p]); await pg.waitForTimeout(Math.max(120, Math.min(700, c.ms || 350))); await touch('touchEnd', []); taps++;
      await pg.waitForTimeout(90);
    }
    const w1 = await wheel();
    console.log(`   play: ${taps} touches in ${Math.round((Date.now() - t1) / 1000)} s · wheel at start ${JSON.stringify(w0)} · end ${JSON.stringify(w1)} · max h ${maxH.toFixed(2)} · stones seated ${maxSet}`);
    check('taps right / left of the kohen turn the real wheel: the stone rises (tread().h)', maxH > 0.3, `max h ${maxH.toFixed(2)} · ${taps} touches`);
    check('the stone seats (tread().set advances)', maxSet >= 1, `seated ${maxSet}`);
    const done = await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'jobDone' && e.d.job === 'tread'), null, 20000);
    const jd = await G(() => { const e = window.__GAME_LOG.find((x) => x.type === 'jobDone' && x.d.job === 'tread'); return e && e.d; });
    check('the job ends through FUN14\'s turn (jobDone: stars, coins, the share set)', done && jd && jd.stars >= 1 && !jd.skipped, JSON.stringify(jd));
    await pg.waitForTimeout(500);
    const fl = await G(() => window.__FLOATS.slice());
    check('the result is a float over the work ("★ · +N מטבעות"), no result card', fl.some((t) => /★/.test(t) && /מטבעות/.test(t)) && await G(() => !document.querySelector('.fx-mg')), fl.join(' | '));
    const bub = await G(() => __T.game.ui.coachText || '');
    check('the mentor\'s line with its source in his bubble (טיוטה + ref)', /ויטרוביוס/.test(bub) && /טיוטה/.test(bub), bub.slice(0, 120));
    // (ECON14's first-pay card may stand over the world: its button first — the bubble waits under it; then a tap on the world)
    for (let k = 0; k < 4; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) break; const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(700); }
    check('the line stays until a tap (after the card)', await G(() => /טיוטה/.test(__T.game.ui.coachText || '')), await G(() => (__T.game.ui.coachText || '').slice(0, 60)));
    await shot('3-end');
    const hp = await G(() => { const p = __T.stages.hero.position, q = __T.view.project(p.x, p.y + 1, p.z); return { x: Math.round(q.x), y: Math.round(q.y) }; });
    await tap(Math.max(20, Math.min(W - 20, hp.x)), Math.max(150, Math.min(H - 150, hp.y)));
    await pg.waitForTimeout(500);
    check('a tap on the world dismisses the line', await G(() => !/טיוטה/.test(__T.game.ui.coachText || '')), await G(() => __T.game.ui.coachText));
    check('no .fx-mg element for the craft (no sheet, no pane; the course check\'s plumb after it may open its own)', await G(() => !window.__MG_SEEN.includes('tread') && !document.querySelector('.fx-mg[data-kind="tread"]')), 'seen ' + await G(() => window.__MG_SEEN.join(',')));
    check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | ').slice(0, 300));
  } finally { await b.close(); }
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
