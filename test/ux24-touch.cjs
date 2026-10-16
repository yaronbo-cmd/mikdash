// UX24 (wave 24): the five S fixes of docs/UX24.md, each proved on the real build by real CDP touch at 844×390 (a fresh save):
//   1. the first-time flow's quiet HUD: while G.ftue < 99 the five tabs, the empty material chips, "מבט על" and an uncharged
//      "יד של אומן" are not on screen; the coins' purse and the menu ☰ are; once the flow ends (ftue 99) they all come back
//   2. the pill under two thumbs says no "הקש…" (nothing is tapped on the world) and no "אבן N מתוך M"
//   3. the words: the survey's coach is one short line; the crafts' teach lines ≤ 7 words; a long fact is not put over the work
//      in the first-time flow; the rock's banner is "סלע אחד פחות!"
//   4. the edge arrow (the compass) never sits on the HUD (the bar, the score's capsule, the pill) — sampled at every rock
//   5. the quarry board: once enough is gathered for the step, the gold "חזרה לבנייה" shows, and a real tap on it ends the board
//      with what was gathered (no "are you sure" card)
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/ux24-touch.cjs --no-build [--shots] [--part=1..5]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/ux24');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), PART = (args.find((a) => a.startsWith('--part=')) || '--part=all').slice(7);
const want = (n) => PART === 'all' || PART.split(',').includes(String(n));
const W = 844, H = 390;
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|net::/.test(m.text())) errs.push(m.text()); });
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.addInitScript(() => {
    window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
    try { if (!sessionStorage.getItem('ux24t')) { sessionStorage.setItem('ux24t', '1'); localStorage.clear(); } } catch (e) { /* */ }
    window.__UXB = []; new MutationObserver(() => { const e = document.querySelector('.gm-banner'); const t = e && e.innerText.trim(); if (t && window.__UXB[window.__UXB.length - 1] !== t) window.__UXB.push(t); }).observe(document, { childList: true, subtree: true, characterData: true });
  });
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
  const cdp = await ctx.newCDPSession(pg);
  const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tap = async (x, y) => { await down(9, x, y); await pg.waitForTimeout(60); await up(9); };
  const swipe = async (x0, y0, x1, y1) => { await down(8, x0, y0); for (let k = 1; k <= 6; k++) { await move(8, x0 + (x1 - x0) * k / 6, y0 + (y1 - y0) * k / 6); await pg.waitForTimeout(16); } await up(8); };
  const shot = async (name) => {
    if (!SHOTS) return;
    await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
    await pg.screenshot({ path: path.join(OUT, 'touch-' + name + '.png'), timeout: 240000 }); console.log('   shot test/out/ux24/touch-' + name + '.png');
    await G(() => { window.__HUD_HOLD = false; });
  };
  const VIS = `(e) => { if (!e) return false; const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden' || +s.opacity < 0.05) return false; for (let p = e; p; p = p.parentElement) { if (getComputedStyle(p).display === 'none') return false; } const r = e.getBoundingClientRect(); return r.width > 2 && r.height > 2; }`;
  const hud = () => G((VIS) => {
    const vis = eval(VIS);
    const chips = [...document.querySelectorAll('.gm-res .gm-chip')].map((c) => ({ k: c.dataset.r, vis: vis(c), v: c.innerText.trim() }));
    return { early: document.querySelector('.gm').classList.contains('ux-early'), ftue: __T.game.state.ftue, twin: !!(window.__TWIN && __TWIN.on()),
      tabs: [...document.querySelectorAll('.gm-dock .gm-db')].filter(vis).length, menu: vis(document.querySelector('.gm-rb')), purse: vis(document.querySelector('.gm-purse')),
      chips, ov: vis(document.querySelector('.tw-ov')), hand: vis(document.querySelector('.tw-hand')), handReady: !!(document.querySelector('.tw-hand') && document.querySelector('.tw-hand').classList.contains('ready')),
      pill: (document.querySelector('.gm-pill') || {}).innerText || '', coach: __T.game.ui.coachText };
  }, VIS);

  // the opening: a tap skips it (as a kid's first touch)
  await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
  { const c = await pg.$('.gm-cine'); const cb = c && await c.boundingBox(); if (cb) await tap(cb.x + cb.width / 2, cb.y + cb.height * 0.6); }
  await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
  await waitFor(() => __T.game.state.ftue >= 1 && window.__TWIN && __TWIN.on(), null, 20000);
  await pg.waitForTimeout(1500);

  /* ── 1 + 2 + 3: the first-time flow, a fresh save, in the survey ── */
  let h0 = await hud();
  if (want(1)) {
    await shot('1-early');
    check('1. a fresh save in landscape: two thumbs on, the first-time flow (ftue 1–98), `.ux-early` on', h0.twin && h0.ftue >= 1 && h0.ftue < 99 && h0.early, `ftue ${h0.ftue} twin ${h0.twin}`);
    check('1. the five tabs are not on screen in the flow; the menu ☰ and the coins\' purse are', h0.tabs === 0 && h0.menu && h0.purse, `tabs ${h0.tabs} menu ${h0.menu} purse ${h0.purse}`);
    check('1. no empty material chip (a 0 says nothing to a kid); a chip with stock stays', h0.chips.filter((c) => c.vis).every((c) => c.k === 'silver' || !/^0$/.test(c.v.replace(/[^\d]/g, ''))) && h0.chips.some((c) => c.vis && c.k !== 'silver'), JSON.stringify(h0.chips));
    check('1. "מבט על" and the uncharged "יד של אומן" wait', !h0.ov && (!h0.hand || h0.handReady), `ov ${h0.ov} hand ${h0.hand} ready ${h0.handReady}`);
  }
  if (want(2)) {
    check('2. the pill in the survey under two thumbs: no "הקש", the goal kept', !/הקש/.test(h0.pill) && /שיטוח ההר|מדידה/.test(h0.pill), JSON.stringify(h0.pill));
  }
  if (want(3)) {
    check('3. the survey\'s coach is one short line (≤ 4 words), naming the button', h0.coach && h0.coach.replace(/^רב האומנים\s*/, '').trim().split(/\s+/).length <= 4 && /עבודה/.test(h0.coach), JSON.stringify(h0.coach));
    // the work button wakes on him in the survey: a real touch starts the survey's craft — its teach line is short
    const bt = await G(() => { const b = document.querySelector('.tw-btn'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, awake: b.classList.contains('awake') }; });
    await tap(bt.x, bt.y);
    const got = await waitFor(() => /500/.test(__T.game.ui.coachText || ''), null, 8000);
    const c1 = await G(() => __T.game.ui.coachText);
    check('3. a real tap on "עבודה" starts the survey; its teach line ≤ 7 words ("החזיקו וגררו. עזבו ב־500!")', got && c1.replace(/^רב האומנים\s*/, '').trim().split(/\s+/).length <= 7, JSON.stringify(c1));
    await shot('3-survey');
    // (taps alone finish every work: the survey's cord pays out by itself after a tap) the craft ends before the next fixture
    for (let k = 0; k < 8 && await G(() => !!(window.__HANDS && window.__HANDS.twin)); k++) { await tap(bt.x, bt.y); await pg.waitForTimeout(1200); }
    // the crafts' teach lines, as the game would say them (the same ui.coach the crafts call)
    const lines = await G(() => {
      const L = ["החזיקו את 'עבודה' — האבן יורדת; גררו ימינה ושמאלה ליישר. הצל נח על המקום — שם היא נוחתת", 'החליקו מטה מהר על הכפתור — כל החלקה: צעד בגלגל. שתי החלקות בשנייה מסובבות אותו', 'נועם, החזיקו את הכפתור וגררו: החבל נפרש מן היתד — שחררו כשהמונה מגיע ל־500 אמה'];
      const out = []; for (const l of L) { __T.game.ui.coach(null, l); out.push(__T.game.ui.coachText.replace(/^רב האומנים\s*/, '').trim()); }
      __T.game.ui.coach(null, 'בעפר שהוצא מהר הבית ונופה בסינון נמצאו יותר ממאה אריחי אבן צבעוניים מימי הורדוס: אבן מקומית, ואבנים שהובאו מיוון · מקור · טיוטה');
      out.push('fact:' + (__T.game.ui.coachText || '(none)'));
      __T.game.ui.coach(null, ''); return out;
    });
    check('3. the crane, the treadwheel and the survey (with the name) teach in ≤ 7 words each', lines.slice(0, 3).every((l) => l.split(/\s+/).length <= 7) && /^נועם, /.test(lines[2]), JSON.stringify(lines.slice(0, 3)));
    check('3. a long fact with its source is not put over the work in the first-time flow', lines[3] === 'fact:(none)', lines[3]);
  }

  /* ── 4 + 3 (banner): the rocks under two thumbs, the edge arrow never on the HUD ── */
  if (want(4) || want(3)) {
    for (let k = 0; k < 6; k++) {   // (a card left by the survey: its gold button, as a kid)
      await waitFor(() => !(window.__HANDS && window.__HANDS.twin), null, 6000);
      const m = await G(() => { const b = document.querySelector('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      if (!m) break; await tap(m.x, m.y); await pg.waitForTimeout(700);
    }
    const B = await G(() => {
      const g = __T.game.state; g.ftue = 99; g.name = 'נועם'; __T.game.ui.coach(null, '');
      g.st.har = { p: 'dig', n: __T.game._.siteStones('har'), dp: 1, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
      g.focus = 'har'; g.crews = []; g.bh = g.bh.map((x) => x || 3); __T.game._.resync();
      return __T.stages.boulderSpots().length;
    });
    await pg.waitForTimeout(1500);
    // (a) the banner: rock 0 split by real taps on the work button
    let bannerOk = null, dg = null;
    await G(() => { const g = __T.game.state; g.bh = g.bh.map((x, k) => (k === 0 ? 1 : x || 3)); __T.game._.resync(); __T.stages.hero.place({ boulder: 0 }); });
    if (await waitFor(() => { const s = window.__TWIN.spec(); return !!s && s.job === 'rock' && document.querySelector('.tw-btn').classList.contains('awake'); }, null, 6000)) {
      const bt = await G(() => { const b = document.querySelector('.tw-btn'); const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      for (let k = 0; k < 8 && !(await G(() => __T.game.state.bh[0] === 0)); k++) { await down(2, bt.x, bt.y); await pg.waitForTimeout(50); await up(2); await pg.waitForTimeout(700); }
    }
    bannerOk = await waitFor(() => window.__UXB.includes('סלע אחד פחות!'), null, 4000); dg = await G(() => ({ bh: __T.game.state.bh[0], ev: window.__GAME_LOG.filter((e) => e.type === 'boulder').length, banners: window.__UXB.slice(-4) }));
    // (b) the arrow: he stands away from every rock (the button asleep); the work is set round him at 16 bearings, 70 amot out —
    // the arrow at every edge of the screen, read against the HUD's pieces
    const hits = [], seen = []; let shotA = false, taps = 0;
    const tip0 = await G(() => { const t = document.querySelector('.tw-zone .tw-tip'); return !!t && !t.hidden; });
    const spot = await G(() => { const bs = __T.stages.boulderSpots().map((b) => [+b[0], +b[1]]); let best = null, bd = -1; for (let x = -160; x <= 160; x += 8) for (let z = -160; z <= 160; z += 8) { const d = Math.min(...bs.map((b) => Math.hypot(b[0] - x, b[1] - z))); const near = Math.min(...bs.map((b) => Math.hypot(b[0] - x, b[1] - z))); if (d > 24 && d < 40 && d > bd) { bd = d; best = [x, z]; } } return best; });
    await G((p) => { if (p) __T.stages.hero.place({ x: p[0], z: p[1] }); }, spot);
    await pg.waitForTimeout(1200);
    const arrowNow = () => G(() => {
      const g = document.querySelector('.tw-goal'); if (!g) return null;
      const a = g.getBoundingClientRect(); if (a.left < -100 || a.top < -100) return null; const out = [];
      for (const e of document.querySelectorAll('.gm .gm-top > *, .gm .gm-sc, .gm .gm-goal .gm-pill, .gm .gm-dock .gm-db')) {
        const s = getComputedStyle(e); if (s.display === 'none' || s.visibility === 'hidden') continue; const q = e.getBoundingClientRect(); if (q.width < 3 || q.height < 3) continue;
        const w = Math.min(a.right, q.right) - Math.max(a.left, q.left), h = Math.min(a.bottom, q.bottom) - Math.max(a.top, q.top);
        if (w > 2 && h > 2) out.push(`${e.className.split(' ')[0]} ${Math.round(w)}×${Math.round(h)}`);
      }
      return { x: Math.round(a.left + a.width / 2), y: Math.round(a.top + a.height / 2), out };
    });
    for (let k = 0; k < 16; k++) {
      await G((k) => { const h = __T.stages.heroXYZ({}), a = k * Math.PI / 8; window.__TWIN.uxGoal({ x: h.x + Math.cos(a) * 70, y: h.y, z: h.z + Math.sin(a) * 70 }); }, k);
      await pg.waitForTimeout(400);
      const r = await arrowNow();
      if (r) { seen.push(`${r.x},${r.y}`); if (r.out.length) hits.push(`bearing ${k} @${r.x},${r.y}: ${r.out.join(' ')}`); if (!shotA && r.x < 200 && r.y < 200) { shotA = true; await shot('4-arrow'); } }
    }
    // (#11) a kid who walks by the arrow: three real taps on it
    for (let k = 0; k < 8 && taps < 3; k++) {
      await G((p) => { if (p) __T.stages.hero.place({ x: p[0], z: p[1] }); }, spot); await pg.waitForTimeout(900);   // (the arrow's walk took him to his rock: back to the spot away from the rocks)
      await G((k) => { const h = __T.stages.heroXYZ({}), a = k * 2.1; window.__TWIN.uxGoal({ x: h.x + Math.cos(a) * 70, y: h.y, z: h.z + Math.sin(a) * 70 }); }, k);
      await pg.waitForTimeout(500);
      const r = await arrowNow(); if (r) { await tap(r.x, r.y); taps++; await pg.waitForTimeout(900); }
    }
    await G(() => window.__TWIN.uxGoal(null));
    if (want(4)) {
      const pts = [...new Set(seen)];
      check(`4. the edge arrow at ${pts.length} places round the screen (16 bearings), never on the HUD (bar, capsule, pill, tabs)`, pts.length >= 8 && hits.length === 0, hits.slice(0, 3).join(' | ') || pts.slice(0, 16).join(' '));
      const tip1 = await G(() => { const t = document.querySelector('.tw-zone .tw-tip'); return !!t && !t.hidden; });
      check('4. (#11) three real taps on the edge arrow retire the walking tip "גררו כאן כדי ללכת"', tip0 && taps >= 3 && !tip1, `before ${tip0} · taps ${taps} · after ${tip1}`);
    }
    if (want(3)) check('3. a rock split by real taps: the banner is "סלע אחד פחות!" (never "הסלע מוכן!")', bannerOk && !(await G(() => window.__UXB.includes('הסלע מוכן!'))), JSON.stringify(dg));
  }

  /* ── 1 (after): the flow ended — everything comes back ── */
  if (want(1)) {
    await G(() => { __T.game.state.ftue = 99; __T.game.ui.refresh(); });
    await pg.waitForTimeout(600);
    const h1 = await hud();
    check('1. once the flow ends (ftue 99): `.ux-early` off, the five tabs and "מבט על" back', !h1.early && h1.tabs === 5 && h1.ov, `tabs ${h1.tabs} ov ${h1.ov}`);
  }

  /* ── (#10) "יד של אומן": the first time it is ready a tip says what to do; a real touch on it takes the tip away ── */
  if (want(1)) {
    await G(() => { window.__TWIN.charge(); });
    const shown = await waitFor(() => { const t = document.querySelector('.tw-tip.ux-hand'); return !!t && !t.hidden && t.getBoundingClientRect().width > 10; }, null, 3000);
    const hb = await G(() => { const t = document.querySelector('.tw-tip.ux-hand'), h = document.querySelector('.tw-hand'); const a = t.getBoundingClientRect(), r = h.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, tip: [Math.round(a.left), Math.round(a.top), Math.round(a.right), Math.round(a.bottom)], txt: t.innerText, inScreen: a.left >= 0 && a.right <= innerWidth && a.top >= 0 }; });
    await shot('10-hand');
    check('1. (#10) the hand charged: a tip "לחצו כאן — מכה של אומן!" over it, inside the screen', shown && hb.inScreen && /מכה של אומן/.test(hb.txt), JSON.stringify(hb));
    await tap(hb.x, hb.y); await pg.waitForTimeout(400);
    check('1. (#10) a real touch on the hand takes the tip away', await G(() => document.querySelector('.tw-tip.ux-hand').hidden));
  }

  /* ── 5: the quarry board's way back ── */
  if (want(5)) {
    await G(() => { window.__GAME_LOG.length = 0; const g = __T.game.state; g.res.stone = 0; __T.game._.playLevel({ kind: 'play', field: 'quarry', need: { stone: 2 }, id: 'har' }); });
    const open = await waitFor(() => !!document.querySelector('.m3'), null, 8000);
    // the start card's "התחל"
    for (let k = 0; k < 6; k++) { const s = await G(() => { const b = [...document.querySelectorAll('.m3 button, .m3-wrap button')].find((e) => /התחל/.test(e.innerText) && e.getBoundingClientRect().width > 2); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); if (!s) break; await tap(s.x, s.y); await pg.waitForTimeout(700); }
    check('5. the quarry board opens', open);
    let backShown = false, backAt = null, swipes = 0; const t0 = Date.now();
    while (Date.now() - t0 < 120000) {
      const st = await G(() => { const b = document.querySelector('.m3-back'); const v = b && !b.hidden && b.getBoundingClientRect().width > 2; const r = v ? b.getBoundingClientRect() : null; return { back: v ? { x: r.left + r.width / 2, y: r.top + r.height / 2, h: r.height, t: b.innerText } : null, pair: window.__UX24_M3 || null, card: !!document.querySelector('.m3-wrap'), need: (document.querySelector('.m3-foot .need') || {}).innerText || '' }; });
      if (st.back) { backShown = true; backAt = st.back; break; }
      if (st.card) { const s = await G(() => { const b = [...document.querySelectorAll('.m3-wrap button')].find((e) => /עוד שלב|התחל|המשך/.test(e.innerText)); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); if (s) await tap(s.x, s.y); await pg.waitForTimeout(800); continue; }
      if (st.pair) { await swipe(st.pair[0].x, st.pair[0].y, st.pair[1].x, st.pair[1].y); swipes++; await pg.waitForTimeout(1300); } else await pg.waitForTimeout(500);
    }
    await shot('5-back');
    check('5. enough gathered (by swipes on the board\'s own hint): the gold "חזרה לבנייה" shows, ≥ 44 px tall', backShown && backAt.h >= 44, backAt ? `${backAt.t} h ${Math.round(backAt.h)} after ${swipes} swipes` : `not shown after ${swipes} swipes`);
    if (backShown) {
      const stone0 = await G(() => __T.game.state.res.stone);
      await tap(backAt.x, backAt.y);
      const closed = await waitFor(() => !document.querySelector('.m3'), null, 6000);
      const r = await G(() => ({ ev: window.__GAME_LOG.filter((e) => /^m3(quit|Lost|Won|Declined)$/.test(e.type)).map((e) => e.type), stone: __T.game.state.res.stone, card: !!document.querySelector('.m3-wrap') }));
      check('5. a real tap on it ends the board at once (no "are you sure" card), back to the site, the stones kept', closed && r.ev.includes('m3quit') && r.stone >= 2, `${JSON.stringify(r)} (stone before the tap ${stone0})`);
    }
  }
  /* ── ⚑ the orientation: a phone held upright gets the turn card; "להמשיך לאורך" lets him play upright; sideways it is gone ── */
  if (want(6)) {
    await G(() => { window.__UX24_TURN = true; try { sessionStorage.removeItem('bh_ux24_upright'); } catch (e) { /* */ } });
    await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(900);
    const c = await G(() => { const e = document.querySelector('.gm-turn'); const r = e.getBoundingClientRect(); const x = e.querySelector('.gm-turn-x').getBoundingClientRect(); return { on: !e.classList.contains('gm-hidden') && r.width >= innerWidth - 1 && r.height >= innerHeight - 1, x: { x: x.left + x.width / 2, y: x.top + x.height / 2, h: x.height, w: x.width }, txt: e.innerText.replace(/\s+/g, ' ') }; });
    await shot('6-turn');
    check('⚑ held upright on a phone: the whole screen asks "סובבו את הטלפון", its way out ≥ 44 px', c.on && /סובבו את הטלפון/.test(c.txt) && c.x.h >= 44 && c.x.w >= 44, JSON.stringify(c));
    await pg.setViewportSize({ width: 844, height: 390 }); await pg.waitForTimeout(900);
    check('⚑ turned sideways: the card goes by itself', await G(() => document.querySelector('.gm-turn').classList.contains('gm-hidden')));
    await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(900);
    const c2 = await G(() => { const x = document.querySelector('.gm-turn .gm-turn-x').getBoundingClientRect(); return { x: x.left + x.width / 2, y: x.top + x.height / 2 }; });
    await tap(c2.x, c2.y); await pg.waitForTimeout(500);
    check('⚑ a real tap on "להמשיך לאורך": the card goes and stays gone this session', await G(() => document.querySelector('.gm-turn').classList.contains('gm-hidden')));
    await G(() => { window.__UX24_TURN = null; });
    await pg.setViewportSize({ width: 844, height: 390 }); await pg.waitForTimeout(600);
  }
  console.log(`\n${results.filter(Boolean).length}/${results.length} · errors ${errs.length} ${errs.slice(0, 3).join(' | ').slice(0, 300)}`);
  await b.close();
  process.exit(results.every(Boolean) && !errs.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
