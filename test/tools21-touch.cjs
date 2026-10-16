// ── tools21 ── (wave 21, the owner's notes 6 and 7) the tool is the job's, by real touch (CDP) at 844×390 on dist/test.html:
//   · idle and walking: the tool hangs on his back / belt (hero.toolState().hung), nothing in his hand
//   · the first touch brings him to the rock with the pick UP (armed); the stroke finds it in his hand ≤ 100 ms after the touch-down
//   · two tools are never both in his hand (sampled every frame, the whole run)
//   · buying a tier in the shop (a real tap on the card): silver −300, the material colour changes, the float says "×1.15 …" once,
//     the next strike pays ×1.15 (10 · 20 · 40 → 12 · 23 · 46); the profile shows "הכלים שלי"
//   · the altar's mallet stays wood at the top tier
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/tools21-touch.cjs [--no-build] [--shots]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/tools21');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), W = 844, H = 390;
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
      window.__TD = [];
      window.addEventListener('pointerdown', (e) => { const t = e.target; if (t && t.closest && t.closest('.tw-btn')) window.__TD.push(performance.now()); }, true);
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    });
    const G = (fn, a) => pg.evaluate(fn, a);
    const cdp = await ctx.newCDPSession(pg);
    const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const tap = async (x, y, ms = 50) => { await down(9, x, y); await pg.waitForTimeout(ms); await up(9); };
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/tools21/' + name + '.png');
      await G(() => { window.__HUD_HOLD = false; });
    };
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const closeCards = async () => { for (let k = 0; k < 4; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) return; const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(400); } };
    const logN = () => G(() => window.__GAME_LOG.length);
    const since = (n, type) => G(([n, ty]) => window.__GAME_LOG.slice(n).filter((e) => e.type === ty).map((e) => e.d), [n, type]);

    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cbx = cine && await cine.boundingBox();
    if (cbx) await tap(cbx.x + cbx.width / 2, cbx.y + cbx.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(600);

    // the fixture: the Mount's rocks after the tutorial (as craft-feel's rock part), the hero off his stand
    const B = await G(() => {
      const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; __T.game.ui.coach(null, '');
      g.st.har = { p: 'dig', n: __T.game._.siteStones('har'), dp: 1, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
      g.bh = g.bh.map(() => 40); g.focus = 'har'; g.crews = []; g.econ = g.econ || {}; g.econ.paid1 = 1; g.res.silver = 2000; __T.game._.resync();
      const bs = __T.stages.boulderSpots(); return { i: 4, bs: bs.map((b) => [+b[0], +b[1], +b[2] || 8]) };
    });
    const on = await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 15000);
    await pg.waitForTimeout(800); await closeCards();
    // the recorder: every frame, his tool state (two in hand? hung while walking?)
    await G(() => {
      const R = window.__TS = { n: 0, two: 0, walkHand: 0, walkT: 0, maxShown: 0, hungIdle: 0, last: null, fr: [] };
      let wt = 0, tp = performance.now();
      const f = () => { const t = performance.now(), dt = (t - tp) / 1000; tp = t; const H = __T.stages.hero, s = H.toolState(); R.n++;
        if (s.inHand.length > 1) R.two++;
        R.maxShown = Math.max(R.maxShown, s.shown.length);
        if (H.walking || H.driving) { wt += dt; if (wt > 0.45 && s.inHand.length) R.walkHand++; R.walkT = Math.max(R.walkT, wt); } else wt = 0;
        R.last = s; if (R.fr.length < 4000) R.fr.push([Math.round(t), s.k, (H.walking || H.driving) ? 1 : 0, H.stroke ? 1 : 0, H.armed ? 1 : 0]);
        requestAnimationFrame(f); };
      requestAnimationFrame(f);
    });
    // he stands ~4.5 amot off the rock
    B.off = await G((B) => { const [x, z] = B.bs[B.i]; __T.stages.hero.place({ boulder: B.i }); const s = __T.stages.hero.standOf({ boulder: B.i }); let dx = s.x - x, dz = s.z - z; const L = Math.hypot(dx, dz) || 1; const d = Math.min(15.5, L + 5); __T.stages.hero.place({ x: x + dx / L * d, z: z + dz / L * d }); return { d }; }, B);
    const woke = await waitFor(() => { const s = __TWIN.spec(); return s && s.job === 'rock'; }, null, 6000);
    if (!on || !woke) { check('twin on, the button takes the rock', false); throw new Error('fixture'); }
    const bc = await btnC();
    const awayFromRock = () => G((B) => { const s = __T.stages.hero.standOf({ boulder: B.i }), [x, z] = B.bs[B.i]; let dx = s.x - x, dz = s.z - z; const L = Math.hypot(dx, dz) || 1; const d = Math.min(15.5, L + 5); __T.stages.hero.place({ x: x + dx / L * d, z: z + dz / L * d }); }, B);
    // 1 · idle, away from his work: hung
    await pg.waitForTimeout(2600);
    const idle = await G(() => __T.stages.hero.toolState());
    check('idle: the tool hangs (nothing in his hand)', idle.hung && idle.inHand.length === 0, JSON.stringify(idle));
    check('idle: one tool shown, hung', idle.shown.length <= 1, JSON.stringify(idle.shown));
    await shot('1-hung-idle');
    // 2 · walking with the left stick (a real touch drag): the tool stays on his back
    await down(5, 80, 310); await pg.waitForTimeout(120);
    for (let k = 1; k <= 8; k++) { fingers.set(5, [80 + k * 8, 310 - k * 3]); await send('touchMove'); await pg.waitForTimeout(110); }
    const walk = await G(() => ({ s: __T.stages.hero.toolState(), w: !!(__T.stages.hero.walking || __T.stages.hero.driving) }));
    await shot('2-walking-tool-on-back');
    for (let k = 0; k < 4; k++) { await pg.waitForTimeout(150); }
    await up(5);
    check('walking (the stick held): the tool is on his back, none in hand', walk.w && walk.s.hung && walk.s.inHand.length === 0, JSON.stringify(walk));
    await G((B) => { __T.stages.hero.place({ boulder: B.i }); const s = __T.stages.hero.standOf({ boulder: B.i }), [x, z] = B.bs[B.i]; let dx = s.x - x, dz = s.z - z; const L = Math.hypot(dx, dz) || 1; const d = Math.min(15.5, L + 5); __T.stages.hero.place({ x: x + dx / L * d, z: z + dz / L * d }); }, B);
    await pg.waitForTimeout(800);
    // the first touch away from the rock brings him there with the pick UP
    await tap(bc.x, bc.y);
    const armed = await waitFor(() => { const a = __T.stages.hero.armed; return a && a.up; }, null, 8000);
    await pg.waitForTimeout(500);
    const inh = await G(() => __T.stages.hero.toolState());
    check('armed at the rock: the pick is in his hand (one tool)', armed && !inh.hung && inh.inHand.length === 1 && inh.held === 'pick', JSON.stringify(inh));
    await shot('3-armed-pick-in-hand');
    // 3 · the pay: tier 1, then the shop
    const payOf = async () => { const L = await logN(); let q = null;
      await G(() => { window.__ACTPTS.length = 0; });
      await waitFor(() => { const r = __TWIN.ring(); return r.on && r.u > 0.82 && r.u < 0.97; }, null, 2500);
      await tap(bc.x, bc.y, 40);
      await waitFor((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'craftAct'), L, 3000); await pg.waitForTimeout(700);
      const a = (await since(L, 'craftAct'))[0]; q = a ? a.q : null; const pts = await G(() => window.__ACTPTS.slice());
      return { q, pts: pts[0], n: pts.length }; };
    await G(() => { const sc = __BH_PARTS.score, orig = sc.add; window.__ACTPTS = []; sc.add = function (n, why, o) { if (why === 'act') window.__ACTPTS.push(n); return orig.call(sc, n, why, o); }; });
    const base = [10, 20, 40];
    const p1 = await payOf();
    check('tier 1 pays ×1.0 (10 · 20 · 40; 50 in a gold run)', p1.q != null && (p1.pts === base[p1.q] || (p1.q === 2 && p1.pts === 50)), JSON.stringify(p1));
    // the stroke finds the tool in hand: the touch-down → k stays 0 and the stroke starts
    const stroke = await G(() => ({ s: __T.stages.hero.toolState() }));
    check('after a stroke the pick is in hand (k 0)', stroke.s.inHand.length === 1 && stroke.s.k === 0, JSON.stringify(stroke.s));
    await shot('4-stroke-tier1');
    // buy the pick's tier 2 with a real tap on the shop card
    const col1 = await G(() => __T.stages.hero.toolColor('pick'));
    await G(() => { window.__FLTXT = []; const o = new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) { const t = n.textContent || ''; if (/×1\.\d+\u2069? [^\d●○]/.test(t) && !/data-tool|ar-cr/.test(n.outerHTML || '')) window.__FLTXT.push(t); } }); o.observe(document.body, { childList: true, subtree: true, characterData: true }); });
    await G(() => __BH_PARTS.econ.shop());
    await pg.waitForTimeout(700);
    const card = await pg.$('.gm-buy[data-k="tl_pick"]');
    const sil0 = await G(() => Math.floor(__T.game.state.res.silver));
    if (card) { await card.scrollIntoViewIfNeeded(); await shot('4a-shop-tools');  const bb = await card.boundingBox(); await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(900); }
    const sil1 = await G(() => Math.floor(__T.game.state.res.silver)), col2 = await G(() => __T.stages.hero.toolColor('pick')), tr = await G(() => __T.game.state.tools && __T.game.state.tools.tier.pick);
    check('the shop sells the pick tier 2 for 300 silver by a real tap', !!card && sil0 - sil1 === 300 && tr === 2, `card ${!!card} silver ${sil0}→${sil1} tier ${tr}`);
    check('the look changed: the head colour is brighter steel', col1 && col2 && col1 !== col2, `${col1} → ${col2}`);
    await closeCards(); await G(() => { const s = document.querySelector('.gm-sheet.on .gm-x, .gm-sheet.on [data-a="close"]'); if (s) s.click(); });
    await pg.waitForTimeout(600);
    // the profile lists my tools
    const prof = await G(() => { const f = __BH_PARTS.around && __BH_PARTS.around.profile; return typeof f === 'function' ? f() : null; });
    // the next strikes pay ×1.15 and the float says it once
    const p2 = await payOf(), p3 = await payOf(); const fl1 = await G(() => window.__FLTXT);
    const ok2 = (p) => p.q != null && (p.pts === Math.round(base[p.q] * 1.15) || (p.q === 2 && p.pts === 58));
    check('tier 2 pays ×1.15 on the next strikes at once (12 · 23 · 46; 58 in a gold run), and the float says it once', ok2(p2) && ok2(p3) && fl1.filter((t) => /×1\.15/.test(t)).length === 1, JSON.stringify([p2, p3]));
    await shot('5-stroke-tier2');
    // tier 3 look (set directly: the shop would cost 900 more)
    await G(() => __T.stages.setTools({ pick: 3, hammer: 3, mallet: 3, sledge: 3, chisel: 3, plumb: 3, rope: 3 }));
    await pg.waitForTimeout(500);
    await shot('6-tier3-in-hand');
    // 4 · never two tools in hand, the whole run; hung while walking
    const rec = await G(() => ({ n: window.__TS.n, two: window.__TS.two, walkHand: window.__TS.walkHand, walkT: +window.__TS.walkT.toFixed(2), maxShown: window.__TS.maxShown }));
    check('two tools are never both in his hand (every frame)', rec.n > 100 && rec.two === 0, JSON.stringify(rec));
    check('while walking > 0.45 s the hand is empty (every frame)', rec.walkHand === 0, JSON.stringify(rec));
    // 5 · a stroke from the hook: the first stroke after a long idle finds the tool in hand within 100 ms of the touch-down
    await awayFromRock(); await pg.waitForTimeout(2600);
    const hung2 = await G(() => __T.stages.hero.toolState());
    check('after 2.6 s without work the pick goes back on his back', hung2.hung && hung2.inHand.length === 0, JSON.stringify(hung2));
    await shot('7-tier3-hung-on-back');
    // a cold stroke (no arm): the tool goes from his back to his hand within 100 ms of the stroke's start (the frame clock of the page)
    const t5 = await G(() => { window.__T5 = performance.now(); __T.stages.hero.act('pick', { boulder: 4 }); return window.__T5; });
    const inHand = await waitFor(() => __T.stages.hero.toolState().inHand.length === 1, null, 3000);
    const lat = await G((t0) => { const fr = window.__TS.fr.filter((r) => r[0] >= t0 - 40); const i0 = fr.findIndex((r) => r[1] < 0.999), i1 = fr.findIndex((r) => r[1] < 0.5); return i0 < 0 || i1 < 0 ? null : { ms: fr[i1][0] - fr[i0][0], frames: i1 - i0 }; }, t5);
    check('a stroke from the hook: the tool is in his hand', inHand, JSON.stringify(lat));
    check('hook → hand ≤ 100 ms (k 1 → < .5; or ≤ 2 frames when SwiftShader frames are slower than that)', lat && (lat.ms <= 100 || lat.frames <= 2), JSON.stringify(lat));
    // 6 · the altar: wood stays wood at the top tier
    await waitFor(() => !__T.stages.hero.busy, null, 6000); await awayFromRock(); await pg.waitForTimeout(500); await G(() => { __T.stages.hero.setTool('wood'); });
    await pg.waitForTimeout(400);
    const alt = await G(() => ({ s: __T.stages.hero.toolState(), c: __T.stages.hero.toolColor('mallet') }));
    const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const wc = alt.c ? rgb(alt.c) : [0, 0, 0];
    check('the altar: the mallet is wood at tier 3 (brown, warm, not steel), never an iron tool held', alt.s.held === 'mallet' && wc[0] > wc[2] + 20 && alt.s.tier === 3, JSON.stringify(alt));
    // 7 · reaching a stage: nashim (3) upgrades the stone tools at tier 1 for free, with a card; the profile shows my tools
    const e0 = await G(() => ({ si: Math.floor(__T.game.state.res.silver), t: JSON.stringify(__T.game.state.tools.tier) }));
    await G(() => { __T.game.state.tools.tier.chisel = 1; __T.game.state.tools.earned = {}; __T.game._.toolsReach('nashim'); });
    await pg.waitForTimeout(700);
    const e1 = await G(() => ({ si: Math.floor(__T.game.state.res.silver), tier: __T.game.state.tools.tier, toast: [...document.querySelectorAll('.gm-toast, .gm-tst, [class*=toast]')].map((n) => n.textContent).join(' | ').slice(0, 200), col: __T.stages.hero.toolColor('chisel') }));
    check('reaching nashim: the chisel (tier 1) becomes tier 2, free, with the card "הכלי שלך השתבח"', e1.tier.chisel === 2 && e1.si === e0.si && /השתבח/.test(e1.toast), JSON.stringify(e1));
    await shot('8-earned-card');
    await closeCards();
    { const xp = await pg.$('.gm-top .gm-xp[data-a]'); if (xp) { const bb = await xp.boundingBox(); await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(900); } }
    const profHTML = await G(() => { const x = document.querySelector('.ar-cr[data-tool="hammer"]'); return x ? x.textContent : null; });
    check('the profile shows "הכלים שלי" (a sheet with the hammer row)', !!profHTML, String(profHTML));
    await shot('9-profile-my-tools');
    const errs = logs.filter((l) => !/favicon|net::|ERR_FILE|Failed to load resource/.test(l));
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
    const fl = await G(() => window.__FLTXT);
    console.log('   float texts ' + JSON.stringify(fl));
  } catch (e) { console.log('ERROR', e && e.stack); results.push(false); }
  finally { await b.close(); }
  const pass = results.filter(Boolean).length;
  console.log(`\ntools21-touch: ${pass}/${results.length} in ${((Date.now() - T0) / 1000).toFixed(0)} s`);
  process.exit(pass === results.length ? 0 : 1);
})();
