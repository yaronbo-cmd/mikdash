// NET10 (wave 10) — "כהנים יחד": two kohanim, two pages, one browser (the BroadcastChannel mock), by REAL TOUCH at 390×844.
//   node test/net-together.cjs [--no-build] [--shots]
// Two fresh profiles boot the real build side by side. A opens the menu → "כהנים יחד" → opens a shared work; B opens the same
// card and taps A's work (seen in the room, no typing). Checks: each sees the other's kohen (the figure in view, his plate on
// screen), his blows reach the other page (the figure swings), the stones count for both ("יחד" = the sum on both pages), the
// race panel updates, a cheer arrives, leaving hides him; no console errors. The world runs without rendering (__T.simulate);
// only the shots render. Wrap it: flock -w 1500 /home/claude/wt/bus/.browser.lock node test/net-together.cjs
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots');
// --courses: both pages in the Mount's courses (FLOW10's fixture: past the survey and the rocks, stone 1, segments paid) — A's
// stone rises in B's world too through the game's coStone hook (a build with FLOW10's s10-flow); the rocks part is skipped
const COURSES = args.includes('--courses');
const W = 390, H = 844;
const T0 = Date.now();
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}  (${Math.round((Date.now() - T0) / 1000)} s)`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await ctx.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__NET_MOCK = true;
      window.__TOASTS = []; new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.classList && n.classList.contains('gm-toast')) window.__TOASTS.push(n.textContent); }).observe(document, { childList: true, subtree: true });
      // a fresh profile per page (the two pages share this origin's storage: each clears it once, before any shared work exists)
      try { if (!sessionStorage.getItem('fx-once')) { sessionStorage.setItem('fx-once', '1'); for (const k of Object.keys(localStorage)) if (/^bh_/.test(k)) localStorage.removeItem(k); } } catch (e) { /* blocked */ }
    });
    const P = { A: await ctx.newPage(), B: await ctx.newPage() };
    const logs = { A: [], B: [] };
    for (const k of ['A', 'B']) {
      P[k].on('console', (m) => { if (m.type() === 'error') logs[k].push(m.text()); });
      P[k].on('pageerror', (e) => logs[k].push('PAGEERR ' + e.message));
    }
    const url = 'file://' + path.join(ROOT, 'dist/test.html');
    await Promise.all([P.A.goto(url), P.B.goto(url)]);
    await Promise.all(['A', 'B'].map((k) => P[k].waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 250, timeout: 360000 })));
    check('both pages boot the real build (two fresh profiles)', true);
    const G = (k, f, a) => P[k].evaluate(f, a);
    const tap = (k, x, y) => P[k].touchscreen.tap(x, y);
    const waitFor = (k, f, a, ms = 8000) => P[k].waitForFunction(f, a, { polling: 150, timeout: ms }).then(() => true, () => false);
    const tapEl = async (k, sel) => {
      const el = await P[k].$(sel); if (!el) return false;
      await el.scrollIntoViewIfNeeded().catch(() => {});
      const r = await el.boundingBox(); if (!r) return false;
      await tap(k, r.x + r.width / 2, r.y + r.height / 2); return true;
    };
    const shot = async (k, name) => {
      if (!SHOTS) return;
      await G(k, () => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const f = path.join(OUT, `net-together-${name}.png`);
      await P[k].screenshot({ path: f, timeout: 240000 });
      console.log('   shot', path.relative(ROOT, f));
      await G(k, () => { window.__HUD_HOLD = false; });
    };
    const mark = (k) => G(k, () => { const m = document.querySelector('.gm-mark'); if (!m || m.classList.contains('gm-hidden') || m.style.opacity === '0') return null; const t = m.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/); return t ? { x: +t[1], y: +t[2] } : null; });

    /* the opening: a tap skips it, on each page */
    for (const k of ['A', 'B']) {
      await waitFor(k, () => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 20000);
      const cine = await P[k].$('.gm-cine'); const cr = cine && await cine.boundingBox();
      if (cr) await tap(k, cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    }
    for (const k of ['A', 'B']) await waitFor(k, () => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 15000);
    check('each page is in its own game (the survey)', await waitFor('A', () => __T.game.state.ftue >= 1, null, 15000) && await waitFor('B', () => __T.game.state.ftue >= 1, null, 15000));
    if (COURSES) {
      for (const k of ['A', 'B']) {
        await G(k, (nm) => {
          const g = __T.game.state; g.ftue = 99; g.name = nm; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
          Object.assign(g.st.har, { p: 'courses', dp: 1, paid: 999, set: 1, k: 0, chk: 0 });
          if (g.st.har.keys[0] == null) g.st.har.keys[0] = 0.9;
          g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; __T.game._.resync();
        }, k === 'A' ? 'יכין' : 'בועז');
      }
      await P.A.waitForTimeout(2500);
    }

    /* the mode: the menu → "כהנים יחד" */
    const openMode = async (k) => {
      for (let i = 0; i < 3 && !(await P[k].$('.nt-modal')); i++) {
        await tapEl(k, '.gm-rb[data-k="menu"]');
        await waitFor(k, () => !!document.querySelector('.gm-sheet.on [data-net="open"]'), null, 5000);
        await tapEl(k, '.gm-sheet.on [data-net="open"]');
        await waitFor(k, () => !!document.querySelector('.nt-modal'), null, 3000);
      }
      return !!(await P[k].$('.nt-modal'));
    };
    check('A: the menu has "כהנים יחד" and it opens its card', await openMode('A'));
    check('A: the card finds a link (the mock between tabs)', await waitFor('A', () => !!document.querySelector('.nt-modal [data-nt="host"]'), null, 6000));
    await tapEl('A', '.nt-modal [data-nt="host"]');
    const code = await waitFor('A', () => __BH_NET.state.phase === 'wait' && /^\d{4}$/.test(__BH_NET.state.code), null, 5000) ? await G('A', () => __BH_NET.state.code) : '';
    check('A opens a shared work: a 4-digit code, the panel waits for the other kohen', !!code && await waitFor('A', (c) => (document.querySelector('.nt-panel') || {}).textContent.includes(c), code, 3000), code);
    await shot('A', 'A-wait');
    check('B: the menu → the card', await openMode('B'));
    check("B sees A's open work in the card (no typing)", await waitFor('B', (c) => [...document.querySelectorAll('.nt-modal [data-nt="join"]')].some((x) => x.dataset.code === c), code, 8000));
    await shot('B', 'B-lobby');
    await tapEl('B', `.nt-modal [data-nt="join"][data-code="${code}"]`);
    const joined = await waitFor('B', () => !!__BH_NET.state.him, null, 8000) && await waitFor('A', () => !!__BH_NET.state.him && __BH_NET.state.phase === 'play', null, 8000);
    check('B joins by one tap; each page sees the other kohen', joined, JSON.stringify(await G('A', () => { const s = __BH_NET.state; return { a: s.phase, him: s.him && s.him.mid }; })));

    /* each sees the other's kohen: the figure in this world, faded in, his plate on screen */
    const seen = async (k) => {
      await waitFor(k, () => { const f = __BH_NET.state.figure; return f && f.on && f.vis > 0.9; }, null, 6000);
      return G(k, () => { const f = __BH_NET.state.figure, pl = document.querySelector('.nt-plate'), ed = document.querySelector('.nt-edge'); const r = pl && pl.style.display !== 'none' ? pl.getBoundingClientRect() : null; return { f, plate: r ? { x: Math.round(r.left), y: Math.round(r.top), w: Math.round(r.width), text: pl.textContent } : null, edge: ed && ed.style.display !== 'none' ? ed.textContent : null }; });
    };
    for (const k of ['A', 'B']) {
      const s = await seen(k);
      const onScr = !!s.plate && s.plate.x > -10 && s.plate.x < W && s.plate.y > 40 && s.plate.y < H - 90;
      check(`${k} sees the other kohen: his figure in the world and his plate on screen`, s.f && s.f.on && s.f.vis > 0.9 && onScr, `fig ${s.f ? `${Math.round(s.f.x)},${Math.round(s.f.z)} scr ${Math.round(s.f.screen.x)},${Math.round(s.f.screen.y)}` : '-'} plate ${JSON.stringify(s.plate)} edge ${s.edge}`);
    }
    await shot('A', 'A-sees-B');
    await shot('B', 'B-sees-A');

    if (COURSES) {
      /* the courses: A taps his kohen until his builder sets a stone; the same stone rises in B's world (coStone) */
      check("this build has the game's coStone hook (FLOW10)", await G('B', () => typeof __T.game.coStone === 'function'));
      const set0 = await G('B', () => __T.game.state.st.har.set);
      const tapHero = async (k) => {
        const p = await G(k, () => { const h = __T.stages.hero.position, q = __T.view.project(h.x, h.y + 2.2, h.z); return { x: q.x, y: q.y, on: q.on }; });
        await tap(k, Math.max(8, Math.min(W - 8, p.on ? p.x : W / 2)), Math.max(120, Math.min(H - 150, p.on ? p.y : H * 0.55)));
      };
      for (let i = 0; i < 24 && (await G('A', () => __BH_NET.state.me.stones)) < 1; i++) {
        await waitFor('A', () => !__T.game.busy && !__T.game._.hero.busy, null, 6000);
        const r = await G('A', () => { const vis = (el) => el && el.offsetParent !== null && el.getBoundingClientRect().width > 0; const go = [...document.querySelectorAll('.fx-mg button')].find((x) => vis(x) && /המשך/.test(x.textContent)) || [...document.querySelectorAll('.gm-modal.on .gm-btn-gold')].find(vis) || [...document.querySelectorAll('.fx-mg canvas')].find(vis); if (!go) return null; const b = go.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height / 2 }; });
        if (r) await tap('A', r.x, r.y); else await tapHero('A');
        await P.A.waitForTimeout(700);
      }
      const aSt = await G('A', () => ({ stones: __BH_NET.state.me.stones, set: __T.game.state.st.har.set }));
      check('A sets a stone in the courses by tapping his kohen', aSt.stones >= 1, JSON.stringify(aSt));
      const rose = await waitFor('B', (s0) => __T.game.state.st.har.set > s0, set0, 8000);
      check("A's stone rises in B's world too (the other kohen's stone at the site they share, as crew work)", rose, `B's stones set ${set0} → ${await G('B', () => __T.game.state.st.har.set)}; B's crew stoneSet events ${await G('B', () => window.__GAME_LOG.filter((e) => e.type === 'stoneSet' && e.d.by === 'crew').length)}`);
      check("B's own race count stays his own (the other kohen's stone is not B's)", await G('B', () => __BH_NET.state.me.stones) === 0);
      check('both strips say "יחד: 1 אבן"', await waitFor('A', () => /יחד: 1 אבן/.test((document.querySelector('.nt-panel') || {}).textContent || ''), null, 5000) && await waitFor('B', () => /יחד: 1 אבן/.test((document.querySelector('.nt-panel') || {}).textContent || ''), null, 5000));
      await shot('B', 'B-courses');
      const errs = [...logs.A.map((e) => 'A ' + e), ...logs.B.map((e) => 'B ' + e)].filter((e) => !/favicon|net::ERR_FILE_NOT_FOUND/.test(e));
      check('no console errors on either page', errs.length === 0, errs.slice(0, 4).join(' | '));
      return;
    }

    /* A works: the survey's taps are strikes; B sees A's blows (the figure swings) and A's count */
    const strikeOnce = async (k) => {
      await waitFor(k, () => !__T.game.busy && !__T.game._.hero.busy, null, 6000);
      await waitFor(k, () => { const m = document.querySelector('.gm-mark'); return m && !m.classList.contains('gm-hidden') && m.style.opacity !== '0'; }, null, 4000);
      const m = await mark(k);
      const n0 = await G(k, () => window.__GAME_LOG.filter((e) => e.type === 'strike').length);
      if (m) await tap(k, Math.max(4, Math.min(W - 4, m.x)), Math.max(4, Math.min(H - 4, m.y))); else await tap(k, W / 2, H * 0.55);
      return waitFor(k, (n) => window.__GAME_LOG.filter((e) => e.type === 'strike').length > n, n0, 8000);
    };
    // the strip steps out of the pointer's way: count any moment the pointer and a visible strip overlap
    // (.gm-mark is a zero-size anchor: the pointer's size is its arrow and ring; the edge chip counts too)
    for (const k of ['A', 'B']) await G(k, () => {
      window.__CLASH = 0;
      setInterval(() => {
        const m = document.querySelector('.gm .gm-mark'); if (!m || m.classList.contains('gm-hidden') || m.style.opacity === '0') return;
        const parts = [...m.querySelectorAll('.gm-mark-ring, .gm-mark-ptr')].map((e) => e.getBoundingClientRect()).filter((r) => r.width > 0);
        for (const sel of ['.nt-panel', '.nt-edge']) {
          if (sel === '.nt-panel' && document.querySelector('.nt-more')) continue;   // (the details, opened by the player's own tap)
          const p = document.querySelector(sel); if (!p || getComputedStyle(p).visibility === 'hidden' || p.style.display === 'none') continue;
          const b = p.getBoundingClientRect(); if (!(b.width > 0)) continue;
          if (parts.some((a) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top)) window.__CLASH++;
        }
      }, 100);
    });
    let swung = false;
    await G('B', () => { window.__SWING = 0; const f = __BH_NET.partner; window.__swingT = setInterval(() => { if (f && f.state.swinging) window.__SWING++; }, 40); });
    for (let i = 0; i < 3; i++) await strikeOnce('A');
    swung = await waitFor('B', () => window.__SWING > 0 && __BH_NET.state.him.st.strikes >= 3, null, 6000);
    check("A's blows reach B: A's kohen swings his hammer on B's page, A's strikes counted there", swung, JSON.stringify(await G('B', () => ({ swing: window.__SWING, strikes: __BH_NET.state.him.st.strikes }))));

    /* stones for both: each splits a rock (a rock cleared counts as a stone of work) */
    const splitRock = async (k) => {
      await waitFor(k, () => __T.game.state.st.har.p !== 'survey', null, 12000);
      const s0 = await G(k, () => __BH_NET.state.me.stones);
      for (let i = 0; i < 16 && (await G(k, () => __BH_NET.state.me.stones)) <= s0; i++) await strikeOnce(k);
      return G(k, () => __BH_NET.state.me.stones);
    };
    for (let i = 0; i < 4 && (await G('A', () => __T.game.state.st.har.p === 'survey')); i++) await strikeOnce('A');
    const a1 = await splitRock('A');
    check('A splits a rock (by touch): one stone of work for A', a1 >= 1, `A stones ${a1}`);
    check('B counts it: "יחד: 1" on B\'s panel, A\'s row updated', await waitFor('B', () => /יחד: 1 אבן/.test(((document.querySelector('.nt-panel') || {}).textContent || '')) && __BH_NET.state.him.st.stones >= 1, null, 6000), await G('B', () => ((document.querySelector('.nt-panel') || {}).textContent || '').replace(/\s+/g, ' ').slice(0, 160)));
    for (let i = 0; i < 4 && (await G('B', () => __T.game.state.st.har.p === 'survey')); i++) await strikeOnce('B');
    const b1 = await splitRock('B');
    check('B splits a rock too', b1 >= 1, `B stones ${b1}`);
    const both = await waitFor('A', () => __BH_NET.state.total === 2 && /יחד: 2 אבנים/.test(((document.querySelector('.nt-panel') || {}).textContent || '')), null, 6000)
      && await waitFor('B', () => __BH_NET.state.total === 2 && /יחד: 2 אבנים/.test(((document.querySelector('.nt-panel') || {}).textContent || '')), null, 6000);
    check('the stones count for both: "יחד: 2 אבנים" on both pages (the sum, also in the shared document)', both, JSON.stringify(await G('A', () => ({ total: __BH_NET.state.total, members: Object.keys(__BH_NET.state.members || {}).length }))));
    const openMore = async (k) => {
      for (let i = 0; i < 3 && !(await P[k].$('.nt-more')); i++) {
        // the strip, where it rests (it may be sliding under a toast); while it steps out of the pointer's way, the menu's
        // "כהנים יחד" opens the details instead
        const vis = await waitFor(k, () => { const p = document.querySelector('.nt-panel'); return p && getComputedStyle(p).visibility !== 'hidden'; }, null, 1500);
        if (vis) { await P[k].waitForTimeout(350); await tapEl(k, '.nt-strip'); }
        else { await tapEl(k, '.gm-rb[data-k="menu"]'); await waitFor(k, () => !!document.querySelector('.gm-sheet.on [data-net="open"]'), null, 4000); await tapEl(k, '.gm-sheet.on [data-net="open"]'); }
        await waitFor(k, () => !!document.querySelector('.nt-more'), null, 1500);
      }
      return !!(await P[k].$('.nt-more'));
    };
    check('a tap on the strip opens the race details', await openMore('A'));
    const race = await G('A', () => [...document.querySelectorAll('.nt-race .nt-row')].map((r) => r.textContent.replace(/\s+/g, ' ').trim()));
    check('the race panel updates: each kohen\'s stones, perfect strikes, stones per minute', race.length === 2 && race.every((r) => /1 אבן/.test(r) && /לדקה/.test(r)), race.join(' | '));
    await shot('A', 'A-race');
    await shot('B', 'B-race');
    // (a player closes the card to go on working: its ✕ "סגור")
    const closeMore = async (k) => { if (await P[k].$('.nt-race')) await tapEl(k, '.nt-race .nt-card > [data-nt="fold"]'); return waitFor(k, () => !document.querySelector('.nt-race'), null, 2000); };
    check('the card closes by its "סגור"', await closeMore('A'));

    /* ten together: a shared celebration on both devices (A splits more rocks; the sum reaches 10) */
    for (let i = 0; i < 40 && (await G('A', () => __BH_NET.state.total)) < 10; i++) await strikeOnce('A');
    const ten = await waitFor('A', () => window.__TOASTS.some((t) => /יחד: 10 אבנים!/.test(t)), null, 5000) && await waitFor('B', () => window.__TOASTS.some((t) => /יחד: 10 אבנים!/.test(t)), null, 5000);
    check('ten stones together: the shared toast on both pages ("יחד: 10 אבנים!")', ten, `A total ${await G('A', () => __BH_NET.state.total)} · B total ${await G('B', () => __BH_NET.state.total)}`);

    /* a cheer: A → B */
    await openMore('A');
    await tapEl('A', '.nt-race [data-nt="cheer"]');
    check('a cheer ("יישר כוח") from A arrives on B', await waitFor('B', () => window.__TOASTS.some((t) => /יישר כוח!/.test(t)), null, 5000));
    await closeMore('A');

    /* where he works, out of view: A's camera looks away (the Mount of Olives) — a chip at A's screen edge points to B's kohen;
       a tap on it and the camera looks at him again */
    await G('A', () => __T.jump('olives'));
    const chip = await waitFor('A', () => { const e = document.querySelector('.nt-edge'); return !!e && e.style.display !== 'none' && e.getBoundingClientRect().width > 0; }, null, 4000);
    const chipBox = chip ? await G('A', () => { const r = document.querySelector('.nt-edge').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, t: document.querySelector('.nt-edge').textContent }; }) : null;
    check('out of view: a chip at the screen edge points to the other kohen (44 px)', chip && chipBox.h >= 44, JSON.stringify(chipBox));
    if (chip) {
      await shot('A', 'A-edge');
      const cb = await G('A', () => { const e = document.querySelector('.nt-edge'); if (!e || e.style.display === 'none') return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      if (cb) await tap('A', cb.x, cb.y);
      const looked = await waitFor('A', () => __BH_NET.state.figure && __BH_NET.state.figure.visible, null, 6000);
      const why = await G('A', () => { const f = __BH_NET.state.figure, c = __T.camera.position; return `fig ${Math.round(f.x)},${Math.round(f.z)} scr ${Math.round(f.screen.x)},${Math.round(f.screen.y)} on ${f.screen.on} · cam ${Math.round(c.x)},${Math.round(c.y)},${Math.round(c.z)}`; });
      check('a tap on the chip: the camera looks at him (his plate back on screen)', looked, why);
      // (FUN11, PRODUCER10 N31) the flight lands close: once the camera stands still, he is ≥ 80 px tall and inside the safe frame
      await waitFor('A', () => { const p = __T.camera.position, k = [p.x, p.y, p.z].map((v) => v.toFixed(2)).join(); const ok = window.__ntCam === k; window.__ntCam = k; return ok; }, null, 8000);
      const k80 = await G('A', () => {
        const f = __BH_NET.state.figure; if (!f) return null;
        __T.camera.updateMatrixWorld();
        const a = __T.view.project(f.x, f.y, f.z), fy = a.y, fx = a.x, fon = a.on;
        const b = __T.view.project(f.x, f.y + 5.2, f.z), hy = b.y, hon = b.on;
        const c = __T.camera.position, d = Math.hypot(c.x - f.x, c.y - f.y, c.z - f.z);
        return { px: Math.round(Math.abs(fy - hy)), x: Math.round(fx), feet: Math.round(fy), head: Math.round(hy), on: fon && hon, dist: Math.round(d), el: Math.round(Math.asin((c.y - f.y) / d) * 180 / Math.PI) };
      });
      check('N31: the flight lands close — he is ≥ 80 px tall, in the safe frame (not the whole hill from above)', k80 && k80.on && k80.px >= 80 && k80.x > 20 && k80.x < 370 && k80.head > 100 && k80.feet < 760 && k80.el <= 40, JSON.stringify(k80));
      await shot('A', 'A-look');
    }

    /* A leaves: B's figure of A goes (after the room says he left or his presence is cleared) */
    const before = await G('B', () => __BH_NET.state.total);
    await openMore('A');
    // (the details slide up as a bottom sheet; on a loaded SwiftShader machine the slide can take seconds: tap its button once it
    //  stands still inside the screen, as a finger would)
    for (let i = 0, prev = null; i < 40; i++) {
      const r = await G('A', () => { const b = document.querySelector('.nt-race [data-nt="leave"]'); if (!b) return null; const q = b.getBoundingClientRect(); return { y: q.y, h: q.height }; });
      if (r && prev && Math.abs(r.y - prev.y) < 0.5 && r.y >= 0 && r.y + r.h <= 844) break;
      prev = r; await P.A.waitForTimeout(250);
    }
    await tapEl('A', '.nt-race [data-nt="leave"]');
    check('leaving asks once more ("לצאת? הקש שוב")', await waitFor('A', () => /לצאת\? הקש שוב/.test((document.querySelector('.nt-race [data-nt="leave"]') || {}).textContent || '') && __BH_NET.state.phase === 'play', null, 2000));
    await tapEl('A', '.nt-race [data-nt="leave"]');
    check('A leaves: the panel closes on A', await waitFor('A', () => !document.querySelector('.nt-panel') && __BH_NET.state.phase === 'off', null, 4000));
    check("B: A's kohen leaves B's world", await waitFor('B', () => !__BH_NET.state.figure.on, null, 12000));
    const after = await G('B', () => __BH_NET.state.total);
    check("B: A's stones stay in the tally after he left", after === before && after >= 2, `${before} → ${after}`);

    const clash = [await G('A', () => window.__CLASH), await G('B', () => window.__CLASH)];
    check('the race strip and the edge chip never covered the game\'s pointer while the kohanim worked', clash[0] + clash[1] <= 1, `A ${clash[0]} · B ${clash[1]} (100-ms samples; the strip follows every frame)`);
    const errs = [...logs.A.map((e) => 'A ' + e), ...logs.B.map((e) => 'B ' + e)].filter((e) => !/favicon|net::ERR_FILE_NOT_FOUND/.test(e));
    check('no console errors on either page', errs.length === 0, errs.slice(0, 4).join(' | '));
  } catch (e) {
    check('the run completed', false, e.message.split('\n')[0]);
  } finally {
    await b.close();
    const bad = results.filter((r) => !r.ok);
    console.log(`\nnet-together: ${results.length - bad.length}/${results.length} passed in ${Math.round((Date.now() - T0) / 1000)} s`);
    process.exit(bad.length ? 1 : 0);
  }
})();
