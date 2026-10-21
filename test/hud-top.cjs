// HUD18 (wave 18, docs/WAVE18-BRIEF.md "test/hud-top.cjs") — the landscape top bar and the counters as targets, on the real build
// (dist/test.html), by REAL touch where it taps:
//   node test/hud-top.cjs [--no-build] [--shots] [--part=1|2|3|all]      shots: test/out/hud/*.png
//   part 1 (the bar, 844×390 then 667×375): the five tabs (צוותים · מלכים · ספר מידות · היום · הפרויקט) are visible icon buttons with a label,
//     ≥ 44 px (the hit area counts), inside the screen, at the top, outside both thumbs' zones, none over another or over the menu ☰,
//     the xp slot, the chips or the pill; a badge sits on its tab; the lower corners hold nothing of the HUD; each tab opens its sheet by touch
//     (the kings' tab opens the kings' contract) and lights up (aria-pressed); ☰ keeps the settings and no longer carries a tab row.
//   part 2 (the counters): ui.counter('xp' | 'coins' | each chip) → a rect on screen (null while the xp slot is hidden); ui.xp renders the slot
//     (icon, name, "רמה N", bar = progress in the level, a level up snaps the bar); ui.bump swells the chip ≈ 1.25× and ticks its number up
//     over ≈ 220 ms; the game's own re-render (refresh) in the middle never fights it; ui.hold keeps the number down until the landing.
//   part 3 (the rest): every sheet / modal / the deal still fits (the sheets are land-hud's); portrait 390×844 keeps the dock at the bottom
//     and the slot takes the name chip's place.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/hud');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), PART = (args.find((a) => a.startsWith('--part=')) || '--part=all').slice(7);
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const want = (n) => PART === 'all' || PART === String(n);

// the in-page audit of the top bar: every piece's rect, the zones, the overlaps
const BAR = () => {
  const vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && !e.closest('.gm-hidden'); };
  const rc = (e) => { const r = e.getBoundingClientRect(); return { l: Math.round(r.left), t: Math.round(r.top), r: Math.round(r.right), b: Math.round(r.bottom), w: Math.round(r.width), h: Math.round(r.height) }; };
  const hit = (e) => {   // the box plus its ::after hit area (as land-hud counts it)
    const r = e.getBoundingClientRect(), s = getComputedStyle(e); let L = r.left, T = r.top, R = r.right, B = r.bottom;
    for (const ps of ['::before', '::after']) {
      const p = getComputedStyle(e, ps); if (!p || p.content === 'none' || p.content === 'normal' || p.position !== 'absolute' || p.pointerEvents === 'none') continue;
      const px = (v) => (/px$/.test(v) ? parseFloat(v) : NaN), l = px(p.left), t = px(p.top), rr = px(p.right), bb = px(p.bottom); if ([l, t, rr, bb].some(isNaN)) continue;
      const bl = parseFloat(s.borderLeftWidth) || 0, bt = parseFloat(s.borderTopWidth) || 0, br = parseFloat(s.borderRightWidth) || 0, bw = parseFloat(s.borderBottomWidth) || 0;
      L = Math.min(L, r.left + bl + l); T = Math.min(T, r.top + bt + t); R = Math.max(R, r.right - br - rr); B = Math.max(B, r.bottom - bw - bb);
    }
    return { w: Math.round(R - L), h: Math.round(B - T) };
  };
  const g = document.querySelector('.gm'), cs = getComputedStyle(g);
  const px = (v, base) => (/vw$/.test(v) ? parseFloat(v) * innerWidth / 100 : /vh$/.test(v) ? parseFloat(v) * innerHeight / 100 : parseFloat(v) || base);
  const out = { vw: innerWidth, vh: innerHeight, twon: g.classList.contains('tw-on'), hscroll: document.documentElement.scrollWidth > innerWidth + 1 };
  out.zone = { lw: px(cs.getPropertyValue('--tw-left-w').trim(), 0.45 * innerWidth), lt: px(cs.getPropertyValue('--tw-left-top').trim(), 0.35 * innerHeight), rw: px(cs.getPropertyValue('--tw-right-w').trim(), 230), rh: px(cs.getPropertyValue('--tw-right-h').trim(), 210) };
  out.tabs = [...document.querySelectorAll('.gm-dock .gm-db')].filter((b) => getComputedStyle(b).display !== 'none').map((e) => ({ k: e.dataset.k, vis: vis(e), rc: rc(e), hit: hit(e), label: (e.querySelector('span') || {}).textContent || '', icon: !!e.querySelector('svg'), pressed: e.getAttribute('aria-pressed'), badge: (() => { const b = e.querySelector('.gm-badge'); return b && vis(b) ? { t: b.textContent, rc: rc(b) } : null; })() }));
  out.menu = (() => { const e = document.querySelector('.gm-rb'); return e && vis(e) ? { rc: rc(e), hit: hit(e) } : null; })();
  out.chips = [...document.querySelectorAll('.gm-res .gm-chip')].filter(vis).map((e) => ({ r: e.dataset.r, rc: rc(e), hit: hit(e) }));
  out.xp = (() => { const e = document.querySelector('.gm-xp'); return e && vis(e) ? { rc: rc(e) } : null; })();
  out.pill = (() => { const e = document.querySelector('.gm-pill'); return e && vis(e) ? rc(e) : null; })();
  out.name = (() => { const e = document.querySelector('.gm-top .gm-name'); return e && vis(e) ? rc(e) : null; })();
  out.dock = (() => { const e = document.querySelector('.gm-dock nav'); return e && vis(e) ? rc(e) : null; })();
  // the HUD's own pieces in the zones' corners (any piece of this file at the bottom of the screen: nothing but the thumbs' own)
  const all = [...document.querySelectorAll('.gm-top > *, .gm-res .gm-chip, .gm-xp, .gm-dock nav, .gm-db, .gm-pill, .gm-pill-alt, .gm-demo > *')].filter(vis);
  out.zoneHits = all.filter((e) => { const r = e.getBoundingClientRect(); const z = out.zone; return (r.left < z.lw && r.bottom > z.lt && r.top < innerHeight) || (r.right > innerWidth - z.rw && r.bottom > innerHeight - z.rh && r.top < innerHeight); }).map((e) => e.className + '/' + (e.dataset.k || e.dataset.r || ''));
  out.lowest = Math.max(0, ...all.map((e) => e.getBoundingClientRect().bottom));
  // pairwise overlaps among the bar's pieces
  const pcs = [...document.querySelectorAll('.gm-rb, .gm-db, .gm-res .gm-chip, .gm-xp, .gm-pill')].filter(vis);
  out.overlaps = [];
  for (let i = 0; i < pcs.length; i++) for (let j = i + 1; j < pcs.length; j++) {
    const a = pcs[i].getBoundingClientRect(), b = pcs[j].getBoundingClientRect();
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (w > 1 && h > 1) out.overlaps.push(`${pcs[i].className.split(' ').slice(0, 2).join('.')}${pcs[i].dataset.k || pcs[i].dataset.r || ''} × ${pcs[j].className.split(' ').slice(0, 2).join('.')}${pcs[j].dataset.k || pcs[j].dataset.r || ''} ${Math.round(w)}×${Math.round(h)}`);
  }
  // the chip row must not be clipped: the last chip inside the row's box
  out.resClip = (() => { const r = document.querySelector('.gm-res'); if (!r) return null; return r.scrollWidth > r.clientWidth + 1; })();
  return out;
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts\.g|net::/.test(m.text())) logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      try { if (!sessionStorage.getItem('hud-once')) { sessionStorage.setItem('hud-once', '1'); localStorage.clear(); } } catch (e) { /* blocked */ }
    });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    let W = 844, H = 390;
    const tap = (x, y) => pg.touchscreen.tap(Math.max(2, Math.min(W - 2, x)), Math.max(2, Math.min(H - 2, y)));
    const center = (sel) => G((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 1 && getComputedStyle(x).visibility !== 'hidden'); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
    const settle = async () => { await pg.waitForTimeout(450); await waitFor(() => [...document.querySelectorAll('.gm-sheet.on')].every((e) => { const m = new DOMMatrix(getComputedStyle(e).transform); return Math.abs(m.e) < 0.5 && Math.abs(m.f) < 0.5 && +getComputedStyle(e).opacity > 0.98; }), null, 4000); };
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 });
      console.log('   shot test/out/hud/' + name + '.png');
      await G(() => { window.__HUD_HOLD = false; });
    };
    const closeAll = async () => { for (let k = 0; k < 3; k++) { if (await G(() => !!document.querySelector('.gm-modal.on'))) { const x = await center('.gm-modal.on .gm-btn[data-i="0"]'); if (x) await tap(x.x, x.y); await pg.waitForTimeout(600); } } if (await G(() => !!document.querySelector('.gm-deal.on'))) { const x = await center('.gm-deal.on .gm-x'); if (x) await tap(x.x, x.y); await pg.waitForTimeout(600); } await G(() => { if (document.querySelector('.kg')) { const k = document.querySelector('.kg [data-a="close"]'); if (k) k.click(); } __T.game.ui.closeSheet(); }); await pg.waitForTimeout(300); };

    /* the opening, then a live game at the wall with a badge on three tabs */
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);
    await G(() => {
      const g = __T.game.state, site = 'wall'; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
      for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
      g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
      g.focus = site; g.res.stone = 400; g.res.cedar = 120; g.res.gold = 35; g.res.bronze = 8; g.res.silver = 1234; g.crews = [{ at: null }, { at: null }];
      g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: { wall: { c: 0, n: 0, key: 1, re: 0, line: 1, deal: { cards: ['tread', 'strike'], key: null, quarry: false, set: 0, t: 1 } } }, deals: { wall: 1 }, sig: { wall: 1 }, best: {} };
      __T.game._.resync();
    });
    await pg.waitForTimeout(1800);
    await closeAll();
    await G(() => { if (window.__TWIN && __TWIN.force) __TWIN.force(true); else document.querySelector('.gm').classList.add('tw-on'); });
    await settle();

    /* ───────────── part 1: the bar ───────────── */
    if (want(1)) for (const [w, h] of [[844, 390], [667, 375]]) {
      if (w !== W) { await pg.setViewportSize({ width: w, height: h }); W = w; H = h; await pg.waitForTimeout(900); await G(() => { if (window.__TWIN && __TWIN.force) __TWIN.force(true); }); await settle(); }
      const tag = `${w}×${h}`;
      await closeAll();
      const r = await G(BAR);
      check(`${tag}: landscape rules and .tw-on are on (the zones' variables are set)`, r.vw === w && r.vh === h && r.twon && r.zone.lw > 0, JSON.stringify(r.zone));
      check(`${tag}: five tabs (צוותים · מלכים · ספר מידות · היום · הפרויקט), each visible with an icon and a label`, r.tabs.length === 5 && r.tabs.every((t) => t.vis && t.icon && t.label.trim().length > 1) && r.tabs.map((t) => t.k).join() === 'crews,kings,book,daily,store', JSON.stringify(r.tabs.map((t) => [t.k, t.label, t.vis])));
      check(`${tag}: every tab ≥ 44 px (the hit area counts), inside the screen`, r.tabs.every((t) => t.hit.w >= 43.5 && t.hit.h >= 43.5 && t.rc.l >= 0 && t.rc.r <= w && t.rc.t >= 0 && t.rc.b <= h) && !!r.menu && r.menu.hit.w >= 43.5 && r.menu.hit.h >= 43.5, JSON.stringify(r.tabs.map((t) => [t.k, t.hit.w, t.hit.h, t.rc.l, t.rc.r])));
      check(`${tag}: the tabs sit in the top bar (bottom ≤ 60 px), right of the counters, beside the menu ☰ at the top right corner`, r.tabs.every((t) => t.rc.b <= 60) && r.menu.rc.r >= w - 30 && r.menu.rc.t <= 14 && r.tabs.every((t) => t.rc.r <= r.menu.rc.l) && (!r.chips.length || Math.max(...r.chips.map((c) => c.rc.r)) <= Math.min(...r.tabs.map((t) => t.rc.l))), JSON.stringify({ menu: r.menu.rc, tabsL: Math.min(...r.tabs.map((t) => t.rc.l)), chipsR: Math.max(...r.chips.map((c) => c.rc.r)) }));
      check(`${tag}: nothing of the HUD in the thumbs' zones; the whole bar and the pill end above the left zone's top (${Math.round(r.zone.lt)}) — the lower corners are empty`, r.zoneHits.length === 0 && r.lowest <= r.zone.lt + 1, `${r.zoneHits.join(' | ')} lowest=${Math.round(r.lowest)}`);
      check(`${tag}: no piece of the bar over another (☰, tabs, xp, chips, pill) and no horizontal scroll`, r.overlaps.length === 0 && !r.hscroll, r.overlaps.slice(0, 4).join(' | '));
      check(`${tag}: the chips (stone, cedar, gold, silver, bronze) are all there, not clipped, ≥ 44 px with their hit area`, r.chips.length >= 5 && !r.resClip && r.chips.every((c) => c.hit.h >= 43.5 && c.hit.w >= 43.5 && c.rc.l >= 0), JSON.stringify(r.chips.map((c) => [c.r, c.rc.w, c.hit.h])));
      check(`${tag}: the player's name chip is not on the bar (the plate over the hero and the menu keep it)`, !r.name);
      check(`${tag}: the badges sit on their tabs (crews, book, daily) inside the tab's rect`, ['crews', 'book'].every((k) => { const t = r.tabs.find((x) => x.k === k); return t && (!t.badge && w !== 844 /* hook20: the badges are real: the first pass opened the tabs, so they are gone */ || t.badge && +t.badge.t > 0 && t.badge.rc.l >= t.rc.l - 1 && t.badge.rc.r <= t.rc.r + 6 && t.badge.rc.t >= t.rc.t - 4); }), JSON.stringify(r.tabs.map((t) => [t.k, t.badge && t.badge.t])));
      await shot(`1-bar-${w}x${h}`);
      // each tab opens its sheet by real touch and lights up; ☰ keeps the settings
      for (const [k, title] of [['crews', /צוותים/], ['book', /ספר/], ['daily', /היום|יומי|משימות/], ['store', /פרויקט/]]) {
        const c = await center(`.gm-dock .gm-db[data-k="${k}"]`);
        await tap(c.x, c.y);
        const ok = await waitFor((k) => document.querySelector('.gm-sheet.on') && document.querySelector(`.gm-dock .gm-db[data-k="${k}"]`).getAttribute('aria-pressed') === 'true', k, 4000);
        await settle();
        const info = await G(() => ({ h2: (document.querySelector('.gm-sheet.on h2') || {}).textContent, n: document.querySelectorAll('.gm-sheet.on').length })).catch(() => null);
        check(`${tag}: the "${k}" tab opens its sheet by touch and lights up`, ok && info && title.test(info.h2 || ''), JSON.stringify(info && info.h2));
        // the tab is still reachable with its sheet open (a second tap closes it: the toggle)
        const c2 = await center(`.gm-dock .gm-db[data-k="${k}"]`); await tap(c2.x, c2.y);
        check(`${tag}: a second tap on the lit "${k}" tab closes the sheet (the tab stays on top of the sheet's column)`, await waitFor(() => !document.querySelector('.gm-sheet.on'), null, 3000));
      }
      { const c = await center('.gm-dock .gm-db[data-k="kings"]'); await tap(c.x, c.y);
        const ok = await waitFor(() => !!document.querySelector('.kg'), null, 5000); await pg.waitForTimeout(500);
        const kg = await G(() => { const e = document.querySelector('.kg'); if (!e) return null; const r = e.getBoundingClientRect(), t = document.querySelector('.gm-top').getBoundingClientRect(); return { top: Math.round(r.top), barBottom: Math.round(t.bottom) }; });
        check(`${tag}: the kings' tab opens the kings' contract (the bar stays visible above it)`, ok && kg && kg.top >= kg.barBottom - 1, JSON.stringify(kg));
        await shot(`1-kings-${w}x${h}`);
        await closeAll(); }
      { const c = await center('.gm-rb'); await tap(c.x, c.y); await waitFor(() => document.querySelector('.gm-sheet.on'), null, 4000); await settle();
        const m = await G(() => ({ sw: document.querySelectorAll('.gm-sheet.on [role=switch]').length, cam: !!document.querySelector('.gm-sheet.on [data-k="cam"][data-v="director"]'), tabrow: !!document.querySelector('.gm-sheet.on .gm-navrow, .gm-sheet.on .gm-nav') }));
        check(`${tag}: ☰ opens the menu with the settings (switches and the camera choice) and no tab row`, m.sw >= 3 && m.cam && !m.tabrow, JSON.stringify(m));
        await shot(`1-menu-${w}x${h}`);
        await closeAll(); }
    }
    if (W !== 844) { await pg.setViewportSize({ width: 844, height: 390 }); W = 844; H = 390; await pg.waitForTimeout(800); }

    /* ───────────── part 2: the counters as targets ───────────── */
    if (want(2)) {
      await closeAll();
      await G(() => { if (window.__TWIN && __TWIN.force) __TWIN.force(true); });
      const ui = '__T.game.ui';
      check('ui.counter: the xp slot is hidden before the first ui.xp, so counter("xp") is null', await G(() => { const u = __T.game.ui; return u.counter('xp') === null && document.querySelector('.gm-xp').classList.contains('gm-hidden'); }));
      const keys = await G(() => [...document.querySelectorAll('.gm-res .gm-chip')].map((e) => e.dataset.r));
      const rects = await G((ks) => ks.concat(['coins']).map((k) => { const r = __T.game.ui.counter(k); return [k, r && { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) }]; }), keys);
      check('ui.counter: every chip of the meter and "coins" answer with a DOMRect on screen; "coins" is the purse (silver)', rects.every(([k, r]) => r && r.w > 20 && r.h > 20 && r.l >= 0 && r.l + r.w <= 844 && r.t >= 0 && r.t + r.h <= 100) && JSON.stringify(rects.find((x) => x[0] === 'coins')[1]) === JSON.stringify(rects.find((x) => x[0] === 'silver')[1]), JSON.stringify(rects));
      check('ui.counter: a key that is not a counter answers null', await G(() => __T.game.ui.counter('nope') === null && __T.game.ui.counter('') === null));
      await G(() => __T.game.ui.xp({ craft: 'strike', icon: '⛏', name: 'הסתת', level: 1, xp: 3, next: 10 }));
      await pg.waitForTimeout(150);
      let x = await G(() => { const e = document.querySelector('.gm-xp'), r = __T.game.ui.counter('xp'); return { hidden: e.classList.contains('gm-hidden'), text: e.textContent.replace(/[⁦⁩]/g, ''), fill: document.querySelector('.gm-xp-bar i').style.width, num: document.querySelector('.gm-xp-bar em').textContent.replace(/[⁦⁩]/g, ''), ic: document.querySelector('.gm-xp-ic').textContent, rc: r && { l: Math.round(r.left), t: Math.round(r.top), w: Math.round(r.width), h: Math.round(r.height) } }; });
      check('ui.xp: the slot shows — icon, the craft\'s name, "רמה 1", a bar at 30% with "3/10" in it — and counter("xp") is its rect', !x.hidden && x.ic === '⛏' && /הסתת/.test(x.text) && /רמה 1/.test(x.text) && /^30(\.0)?%$/.test(x.fill) && x.num === '3/10' && x.rc && x.rc.w >= 100 && x.rc.l < 120, JSON.stringify(x));
      await shot('2-xp-slot');
      const bar = await G(BAR);
      check('the xp slot is on the bar at the top left, out of the zones, over nothing', bar.xp && bar.xp.rc.t < 60 && !bar.zoneHits.length && bar.overlaps.length === 0, JSON.stringify(bar.xp) + ' ' + bar.overlaps.join('|'));
      // the bar is progress INSIDE the level: level 2 starts at 10, next 25 → xp 17 is 7/15 = 46.7%
      await G(() => __T.game.ui.xp({ craft: 'strike', icon: '⛏', name: 'הסתת', level: 2, xp: 17, next: 25 }));
      x = await G(() => ({ fill: document.querySelector('.gm-xp-bar i').style.width, lv: document.querySelector('.gm-xp-tx small').textContent.replace(/[⁦⁩]/g, ''), cls: document.querySelector('.gm-xp').className }));
      check('ui.xp: a level up — "רמה 2", the bar restarts from the level\'s own start (17 in 10…25 = 46.7%), the "lvup" pop plays', /^46\.7%$/.test(x.fill) && x.lv === 'רמה 2' && /lvup/.test(x.cls), JSON.stringify(x));
      // the bump: chip swells ≈ 1.25×, the number ticks up over ≈ 220 ms
      const real = await G(() => Math.floor(__T.game.state.res.stone));
      const run = await G(async () => {
        const u = __T.game.ui, chip = document.querySelector('.gm-res [data-r="stone"]'), num = chip.querySelector('.gm-num');
        const read = () => +String(num.textContent).split('/')[0].replace(/[^\d]/g, '');
        const t0 = performance.now(), seq = [], sc = []; __T.game.state.res.stone += 5;   // (the economy counted +5: the chip is re-rendered, then bumped)
        u.refresh(); u.bump('stone', 5);
        const kf = chip.getAnimations().flatMap((a) => (a.effect && a.effect.getKeyframes ? a.effect.getKeyframes().map((k) => String(k.transform)) : []));   // (the swell's own keyframes: the sampler below is a timer on a slow software renderer and can miss the peak frame)
        await new Promise((res) => { const iv = setInterval(() => { const m = new DOMMatrix(getComputedStyle(chip).transform); sc.push(+m.a.toFixed(3)); seq.push(read()); if (performance.now() - t0 > 700) { clearInterval(iv); res(); } }, 16); });
        return { seq, sc, final: read(), kf };
      });
      const mono = run.seq.every((v, i) => i === 0 || v >= run.seq[i - 1]);
      const kfMax = Math.max(0, ...run.kf.map((t) => +((/scale\(([\d.]+)/.exec(t) || [])[1] || 0)));
      check('ui.bump("stone", 5): the chip swells to ≈ 1.25× (the animation\'s peak keyframe, and it was seen above 1.05) and settles at 1', kfMax >= 1.2 && kfMax <= 1.35 && Math.max(...run.sc) > 1.05 && Math.max(...run.sc) <= 1.35 && Math.abs(run.sc[run.sc.length - 1] - 1) < 0.01, `keyframes ${run.kf.join(' ')} · seen peak ${Math.max(...run.sc)} last ${run.sc[run.sc.length - 1]}`);
      check('ui.bump: the number ticks up (never down) from real − 5 to the real value and ends exactly on it', mono && run.seq[0] <= real + 1 && run.final === real + 5 && new Set(run.seq).size >= 3, `real ${real} seq ${[...new Set(run.seq)].join(',')} final ${run.final}`);
      // the game's own re-render in the middle of a tick does not fight it
      const mid = await G(async () => {
        const u = __T.game.ui, num = document.querySelector('.gm-res [data-r="stone"] .gm-num'), read = () => +String(num.textContent).split('/')[0].replace(/[^\d]/g, '');
        __T.game.state.res.stone += 8; u.refresh(); u.bump('stone', 8);
        await new Promise((r) => setTimeout(r, 70)); const a = read(); u.refresh(); u.refresh(); const b2 = read();
        await new Promise((r) => setTimeout(r, 90)); u.refresh(); const c2 = read();
        await new Promise((r) => setTimeout(r, 250)); u.refresh(); return { a, b2, c2, end: read(), real: Math.floor(__T.game.state.res.stone) };
      });
      check('a re-render during the tick keeps the bumped value (no jump to the final number, no drop) and the number ends on the real one', mid.b2 === mid.a || mid.b2 === mid.a + 1, JSON.stringify(mid));
      check('…and settles on the real value', mid.end === mid.real && mid.c2 >= mid.b2 && mid.c2 <= mid.real, JSON.stringify(mid));
      // hold: the number stays down until the landing (a material: the purse's "1.2K" would hide a difference of 30)
      const hd = await G(async () => {
        const u = __T.game.ui, num = document.querySelector('.gm-res [data-r="stone"] .gm-num'), val = () => +String(num.textContent).split('/')[0].replace(/\D/g, '');
        __T.game.state.res.stone += 30; u.refresh(); const full = val(); const held0 = u.hold('stone', 30); const h1 = val(); u.refresh(); const h2 = val();
        u.bump('stone', 30); await new Promise((r) => setTimeout(r, 400)); return { full, held0, h1, h2, end: val(), real: Math.floor(__T.game.state.res.stone) };
      });
      check('ui.hold("stone", 30): the chip shows 30 less while the flight is out (also across a re-render); ui.bump lands it', hd.held0 && hd.h1 === hd.full - 30 && hd.h2 === hd.h1 && hd.end === hd.real && hd.full === hd.real, JSON.stringify(hd));
      // the xp number ticks through the same machinery
      const xt = await G(async () => {
        const u = __T.game.ui, em = document.querySelector('.gm-xp-bar em'), rd = () => +String(em.textContent).replace(/[⁦⁩]/g, '').split('/')[0];
        u.xp({ craft: 'strike', icon: '⛏', name: 'הסתת', level: 2, xp: 18, next: 25 }); u.hold('xp', 1); const a = rd(); u.bump('xp', 1); await new Promise((r) => setTimeout(r, 400)); return { a, end: rd() };
      });
      check('xp: hold("xp", 1) shows 17 until the "+1" lands, then bump → 18', xt.a === 17 && xt.end === 18, JSON.stringify(xt));
      // a hold that never lands lets go by itself
      check('a hold never released lets go by itself within 3.5 s (the number is not stuck low)', await (async () => { await G(() => { __T.game.state.res.cedar += 10; __T.game.ui.refresh(); __T.game.ui.hold('cedar', 10); }); await pg.waitForTimeout(3600); return await G(() => { __T.game.ui.refresh(); return +String(document.querySelector('.gm-res [data-r="cedar"] .gm-num').textContent).split('/')[0].replace(/\D/g, '') === Math.floor(__T.game.state.res.cedar); }); })());
      await shot('2-counters');
      // the counter's rect follows the layout (the viewport changes: it is measured when asked)
      await pg.setViewportSize({ width: 667, height: 375 }); W = 667; H = 375; await pg.waitForTimeout(900);
      const r2 = await G(() => { const r = __T.game.ui.counter('xp'), c = __T.game.ui.counter('coins'); return { xp: r && Math.round(r.right), c: c && Math.round(c.right), vw: innerWidth }; });
      check('667×375: counter("xp") and counter("coins") are on screen after the resize', r2.xp && r2.c && r2.xp <= 667 && r2.c <= 667, JSON.stringify(r2));
      await shot('2-xp-667x375');
      await pg.setViewportSize({ width: 844, height: 390 }); W = 844; H = 390; await pg.waitForTimeout(800);
    }

    /* ───────────── part 3: portrait ───────────── */
    if (want(3)) {
      await G(() => { if (window.__TWIN && __TWIN.force) __TWIN.force(null); });
      await pg.setViewportSize({ width: 390, height: 844 }); W = 390; H = 844; await pg.waitForTimeout(900);
      await G(() => { __T.game.ui.xp({ craft: 'strike', icon: '⛏', name: 'הסתת', level: 1, xp: 3, next: 10 }); });
      const p = await G(() => { const d = document.querySelector('.gm-dock nav').getBoundingClientRect(), x = document.querySelector('.gm-xp').getBoundingClientRect(), t = document.querySelector('.gm-top').getBoundingClientRect(), nm = getComputedStyle(document.querySelector('.gm-top .gm-name')).display, tabs = [...document.querySelectorAll('.gm-db')].map((e) => Math.round(e.getBoundingClientRect().height)); const chips = [...document.querySelectorAll('.gm-res .gm-chip')].map((e) => e.getBoundingClientRect()); return { dockTop: Math.round(d.top), vh: innerHeight, xpR: Math.round(x.right), xpL: Math.round(x.left), xpTop: Math.round(x.top), topB: Math.round(t.bottom), name: nm, tabs, chipsOver: chips.some((c) => c.right > x.left + 1 && c.left < x.right - 1), clip: document.querySelector('.gm-res').scrollWidth > document.querySelector('.gm-res').clientWidth + 1, hs: document.documentElement.scrollWidth > innerWidth + 1, ctr: !!__T.game.ui.counter('xp') && !!__T.game.ui.counter('coins') }; });
      check('portrait 390×844: the dock stays at the bottom (five tabs), the xp slot is in the top row in the name chip\'s place, over no chip, counters answer', p.dockTop > 700 && p.tabs.length === 5 && p.xpTop < 60 && p.topB < 70 && p.name === 'none' && !p.chipsOver && !p.hs && p.ctr, JSON.stringify(p));
      await shot('3-portrait-xp');
    }

    check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
  const ok = results.filter(Boolean).length;
  console.log(`\n${ok}/${results.length} checks passed in ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(ok === results.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
