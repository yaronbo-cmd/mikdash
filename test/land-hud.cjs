// LAND17 (wave 17) — the landscape shell at 844×390 on the real build (dist/test.html), by REAL touch where it taps:
//   node test/land-hud.cjs [--no-build] [--shots]        shots: test/out/land/*.png
// Checks: the HUD at rest has no overlaps and no control under 44 px (a ::before/::after hit area counts, as in qa-walk); under .tw-on
// (forced here) the thumbs' zones (--tw-left-w/--tw-left-top, --tw-right-w/--tw-right-h) hold no HUD element of this file and the five tabs are in the top bar (wave 18); every sheet
// (menu, book, project, crews, daily, shop) fits the screen, scrolls inside itself and its close button is reachable; three modal cards
// (a tall story card, the name prompt, a quiz) and a key moment fit with their buttons tappable; the deal sheet fits and its cards tap;
// the two settings persist across a reload; ui.stamp / ui.banner show and leave (the banner queues, never two at once); popups 'book'
// opens no card, floats "נוסף לספר" and keeps the fact in the book; portrait (390×844) carries none of the landscape rules.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/land');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SZ = ((args.find((a) => a.startsWith('--size=')) || '--size=844x390').slice(7).split('x').map(Number)), W = SZ[0] || 844, H = SZ[1] || 390, SHOTS = args.includes('--shots'), FROM = +((args.find((a) => a.startsWith('--from=')) || '--from=0').slice(7)) || 0;
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

// the in-page audit: every visible control's hit size, the HUD's pairwise overlaps, the zones, the overflow
const AUDIT = () => {
  const vis = (e) => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 1 && r.height > 1 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > 0.05 && !e.closest('.gm-hidden, .gm-sheet:not(.on), .gm-deal:not(.on), .gm-modal:not(.on)'); };
  const label = (e) => (e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : e.tagName) + (e.dataset && e.dataset.a ? `[${e.dataset.a}${e.dataset.k ? ':' + e.dataset.k : ''}]` : '') + ' "' + (e.textContent || '').trim().slice(0, 18) + '"';
  const hitRect = (e) => {
    const r = e.getBoundingClientRect(), s = getComputedStyle(e);
    let L = r.left, T = r.top, Rr = r.right, B = r.bottom;
    for (const ps of (s.overflowX !== 'visible' || s.overflowY !== 'visible' ? [] : ['::before', '::after'])) {   // (a box that clips its overflow clips its own ::after too)
      const p = getComputedStyle(e, ps);
      if (!p || p.content === 'none' || p.content === 'normal' || p.position !== 'absolute' || p.pointerEvents === 'none' || p.display === 'none') continue;
      const px = (v) => (/px$/.test(v) ? parseFloat(v) : NaN);
      const l = px(p.left), t = px(p.top), rr = px(p.right), b = px(p.bottom);
      if ([l, t, rr, b].some(isNaN)) continue;
      const bl = parseFloat(s.borderLeftWidth) || 0, bt = parseFloat(s.borderTopWidth) || 0, br = parseFloat(s.borderRightWidth) || 0, bb = parseFloat(s.borderBottomWidth) || 0;
      L = Math.min(L, r.left + bl + l); T = Math.min(T, r.top + bt + t); Rr = Math.max(Rr, r.right - br - rr); B = Math.max(B, r.bottom - bb - b);
    }
    return { w: Rr - L, h: B - T, box: r };
  };
  const root = document.querySelector('.gm');
  const R = { small: [], overlaps: [], zones: [], off: [], hscroll: document.documentElement.scrollWidth > innerWidth + 1, vw: innerWidth, vh: innerHeight };
  // controls ≥ 44 px (inside the HUD, the sheets, the cards, the moments)
  const ctl = [...document.querySelectorAll('.gm button, .gm [role=switch], .gm [data-a], .gm input')].filter((e) => vis(e) && !e.disabled);
  for (const e of ctl) {
    const h = hitRect(e);
    if (h.w < 43.5 || h.h < 43.5) R.small.push(`${label(e)} ${Math.round(h.w)}×${Math.round(h.h)}`);
    const r = h.box;
    if (r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) { if (!e.closest('.gm-sh-b, .gm-card, .gm-mo-card, .gm-deal')) R.off.push(label(e)); }
  }
  // the HUD at rest: pairwise overlaps among the persistent pieces
  const hud = [...document.querySelectorAll('.gm-rb, .gm-res .gm-chip, .gm-top .gm-name, .gm-pill, .gm-pill-alt, .gm-demo > *, .gm-dock nav, .gm-toast, .gm-bub, .gm-banner.on, .gm-back')].filter(vis);
  for (let i = 0; i < hud.length; i++) for (let j = i + 1; j < hud.length; j++) {
    const a = hud[i].getBoundingClientRect(), b = hud[j].getBoundingClientRect();
    if (hud[i].contains(hud[j]) || hud[j].contains(hud[i])) continue;
    const w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    if (w > 3 && h > 3) R.overlaps.push(`${label(hud[i])} × ${label(hud[j])} ${Math.round(w)}×${Math.round(h)}`);
  }
  // the thumbs' zones (under .tw-on): nothing of the HUD's own may sit in them
  if (root && root.classList.contains('tw-on')) {
    const cs = getComputedStyle(root), px = (v, base) => (/vw$/.test(v) ? parseFloat(v) * innerWidth / 100 : /vh$/.test(v) ? parseFloat(v) * innerHeight / 100 : parseFloat(v) || base);
    const lw = px(cs.getPropertyValue('--tw-left-w').trim(), 0.45 * innerWidth), lt = px(cs.getPropertyValue('--tw-left-top').trim(), 0.35 * innerHeight);
    const rw = px(cs.getPropertyValue('--tw-right-w').trim(), 230), rh = px(cs.getPropertyValue('--tw-right-h').trim(), 210);
    R.zone = { lw, lt, rw, rh };
    const mine = [...document.querySelectorAll('.gm-top > *, .gm-top .gm-chip, .gm-goal > *, .gm-dock, .gm-dock nav, .gm-toast, .gm-bub, .gm-banner.on, .gm-demo > *, .gm-back, .gm-cine')].filter(vis);
    for (const e of mine) {
      const r = e.getBoundingClientRect();
      const inL = r.left < lw && r.right > 0 && r.bottom > lt && r.top < innerHeight, inR = r.right > innerWidth - rw && r.left < innerWidth && r.bottom > innerHeight - rh && r.top < innerHeight;
      if (inL || inR) R.zones.push(`${label(e)} [${Math.round(r.left)},${Math.round(r.top)} ${Math.round(r.width)}×${Math.round(r.height)}] ${inL ? 'LEFT' : 'RIGHT'}`);
    }
  }
  // sheets, cards, moments, the deal: inside the screen
  R.panels = [];
  for (const e of document.querySelectorAll('.gm-sheet.on, .gm-card, .gm-mo-card, .gm-deal.on')) {
    if (!vis(e)) continue;
    const r = e.getBoundingClientRect(), b = e.querySelector('.gm-sh-b, .gm-btn-row, .gm-mo-end');
    R.panels.push({ k: label(e), top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), h: Math.round(r.height), inside: r.top >= -1 && r.bottom <= innerHeight + 1 && r.left >= -1 && r.right <= innerWidth + 1, scrolls: e.scrollHeight > e.clientHeight + 1 || !!(e.querySelector('.gm-sh-b') && e.querySelector('.gm-sh-b').scrollHeight > e.querySelector('.gm-sh-b').clientHeight + 1) });
  }
  return R;
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts\.g|net::/.test(m.text())) logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      try { if (!sessionStorage.getItem('land-once')) { sessionStorage.setItem('land-once', '1'); localStorage.clear(); } } catch (e) { /* blocked */ }
    });
    const fa = args.find((a) => a.startsWith('--file=')), PAGE = 'file://' + (fa ? path.resolve(fa.slice(7)) : path.join(ROOT, 'dist/test.html'));
    await pg.goto(PAGE);
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const tap = (x, y) => pg.touchscreen.tap(Math.max(2, Math.min(W - 2, x)), Math.max(2, Math.min(H - 2, y)));
    const center = (sel) => G((s) => { const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 1 && getComputedStyle(x).visibility !== 'hidden'); if (!e) return null; if (e.closest('.gm-sh-b, .gm-card, .gm-mo-card')) e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, sel);
    // a story card the game raises by its own clock (the first wage …) may come up over a step: close it with its first button (a real tap), once noted
    const clearModals = async () => { for (let k = 0; k < 6 && await G(() => !!document.querySelector('.gm-modal')); k++) { console.log('   (a game card was up over the step: closed by its button)'); await settle(); const x = await center('.gm-modal.on .gm-btn[data-i="0"]'); if (x) await tap(x.x, x.y); await pg.waitForTimeout(700); } };
    const closeDeal = async () => { for (let k = 0; k < 3 && await G(() => !!document.querySelector('.gm-deal.on')); k++) { const x = await center('.gm-deal.on .gm-x'); if (x) await tap(x.x, x.y); await pg.waitForTimeout(600); } };
    const audit = (tag) => G(AUDIT).then((r) => { r.tag = tag; return r; });
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const fn = name + (W === 844 && H === 390 ? '' : `-${W}x${H}`);
      await pg.screenshot({ path: path.join(OUT, fn + '.png'), timeout: 240000 });
      console.log('   shot test/out/land/' + fn + '.png');
      await G(() => { window.__HUD_HOLD = false; });
    };
    // (a slow software-GL frame can leave a sheet mid-slide: wait until the sheets and the cards have stopped moving)
    const settle = async () => {
      await pg.waitForTimeout(450);
      await waitFor(() => [...document.querySelectorAll('.gm-sheet.on, .gm-modal.on .gm-card, .gm-mo.on .gm-mo-card')].every((e) => { const m = new DOMMatrix(getComputedStyle(e).transform); return Math.abs(m.e) < 0.5 && Math.abs(m.f) < 0.5 && +getComputedStyle(e).opacity > 0.98; }), null, 4000);
    };
    const report = (name, r, ...keys) => { const bad = keys.flatMap((k) => (r[k] || []).map((x) => `${k}: ${x}`)); check(name, bad.length === 0 && !r.hscroll, bad.slice(0, 5).join(' | ') + (r.hscroll ? ' | HSCROLL' : '')); return bad; };

    /* the opening, then a live game at the wall (as hands-touch's fixture): the deal on the table */
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);
    await G(() => {
      const g = __T.game.state, site = 'wall'; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
      for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
      g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
      g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.res.silver = 1234; g.crews = [];
      g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: { wall: { c: 0, n: 0, key: 1, re: 0, line: 1, deal: { cards: ['tread', 'strike'], key: null, quarry: false, set: 0, t: 1 } } }, deals: { wall: 1 }, sig: { wall: 1 }, best: {} };
      __T.game._.resync();
    });
    await pg.waitForTimeout(1800);

    /* 1. the HUD at rest, 844×390 (the deal is the game's own: it comes up first — its ✕ is a real tap) */
    await closeDeal();
    let r = await audit('hud'), c = null;
    check('the viewport is 844×390 and landscape rules apply (--tw-left-w is set on .gm)', r.vw === W && r.vh === H && await G(() => getComputedStyle(document.querySelector('.gm')).getPropertyValue('--tw-left-w').trim() === '45vw'));
    report('the HUD at rest: no control under 44 px, none off-screen, no overlaps, no horizontal scroll', r, 'small', 'off', 'overlaps');
    await shot('1-hud');

    if (FROM < 5) {   // sections 2–4 (--from=5 skips them: a quick re-run of the deal, the moment, the stamp, the reload, portrait; --from=6: from the moment on)
    /* 2. under .tw-on the thumbs' zones are empty (hud18: the dock's tabs sit in the top bar) */
    await G(() => { if (window.__TWIN && __TWIN.force) __TWIN.force(true); else document.querySelector('.gm').classList.add('tw-on'); });
    await settle();
    r = await audit('tw-on');
    // ── hud18 ── (wave 18) the dock is no longer folded into the menu: its five tabs are visible icon buttons in the top bar, beside ☰
    check('.tw-on is on and the five tabs are visible in the top bar (not folded into the menu), outside the thumbs\' zones', await G(() => { const t = [...document.querySelectorAll('.gm-dock .gm-db')].filter((b) => getComputedStyle(b).display !== 'none').map((e) => e.getBoundingClientRect()); return document.querySelector('.gm').classList.contains('tw-on') && t.length === 5 && t.every((r) => r.width >= 44 && r.height >= 44 && r.top >= 0 && r.bottom <= 60 && r.right <= innerWidth); }));
    // ── /hud18 ──
    report('under .tw-on the left zone (45vw × below 35vh) and the right box (230×210) hold no HUD element', r, 'zones', 'overlaps', 'small');
    await shot('2-tw-on');
    // a toast, a bubble (the mentor), a banner and a stamp stay out of the zones as well
    await G(() => { __T.game.ui.toast({ icon: 'star', title: 'מכה מושלמת', body: 'הצוות שמח', ms: 6000 }); __T.game.ui.coach(null, 'שורה אחת של המדריך, עם מקור קטן, כמו בגל 16. נסו להקיש עכשיו.'); __T.game.ui.banner('הסלע מוכן!', { ms: 4000 }); });
    await pg.waitForTimeout(900);
    r = await audit('tw-on-overlays');
    report('a toast, the mentor\'s bubble and a banner under .tw-on: in the top right, out of both zones, none over another', r, 'zones', 'overlaps');
    await shot('3-tw-on-overlays');
    await G(() => { __T.game.ui.coach(null, ''); });
    await pg.waitForTimeout(4200);

    if (args.includes('--zones')) { await G(() => { __T.game.ui.coach(null, ''); }); check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | ')); const okz = results.filter(Boolean).length; await b.close(); console.log(`\n${okz}/${results.length} checks passed (--zones: the HUD at rest and the thumbs' zones only)`); process.exit(okz === results.length ? 0 : 1); }
    /* 3. the menu sheet under .tw-on: the dock's tabs, the two choices */
    await clearModals();
    c = await center('.gm-rb');
    await tap(c.x, c.y);
    await waitFor(() => document.querySelector('.gm-sheet.on'), null, 4000); await settle();
    r = await audit('menu');
    check('the menu sheet opens (touch) with the settings and the two choices (the tabs are on the bar, no tab row in the menu)', await G(() => [...document.querySelectorAll('.gm-dock .gm-db')].filter((b) => getComputedStyle(b).display !== 'none').length === 5 && !document.querySelector('.gm-sheet.on .gm-navrow') && document.querySelectorAll('.gm-sheet.on [role=switch]').length >= 3 && !!document.querySelector('.gm-sheet.on [data-k="cam"][data-v="director"]') && !!document.querySelector('.gm-sheet.on [data-k="popups"][data-v="book"]')));   // ── hud18 ── ── /hud18 ──
    const pan = r.panels.find((p) => /gm-sheet/.test(p.k));
    check('the menu sheet fits 844×390 (top ≥ 0, bottom ≤ 390), scrolls inside itself', pan && pan.inside && pan.h <= H, JSON.stringify(pan));
    report('the menu sheet: every control ≥ 44 px', r, 'small');
    await shot('4-menu');
    // the choices persist: cam → director, popups → book (real touch), then a reload
    await clearModals();   // ── hud18 ── (the game's first-wage card comes up by its own clock, sometimes over this step: closed by its button, as above)
    c = await center('.gm-sheet.on [data-k="cam"][data-v="director"]'); await tap(c.x, c.y); await pg.waitForTimeout(250);
    c = await center('.gm-sheet.on [data-k="popups"][data-v="book"]'); await tap(c.x, c.y); await pg.waitForTimeout(250);
    const st1 = await G(() => ({ s: __T.game.settings(), saved: JSON.parse(localStorage.getItem('bh_settings') || '{}'), ev: window.__GAME_LOG.filter((e) => e.type === 'settings').map((e) => e.d && e.d.key + '=' + e.d.value) }));
    check('the two settings change by touch, are saved in bh_settings and fire the `settings` event', st1.s.cam === 'director' && st1.s.popups === 'book' && st1.saved.cam === 'director' && st1.saved.popups === 'book' && st1.ev.includes('cam=director') && st1.ev.includes('popups=book'), JSON.stringify({ saved: st1.saved, ev: st1.ev }));
    check('game.on("settings") hears a change (the bus TWIN17 listens to)', await G(() => { let got = null; const off = __T.game.on('settings', (d) => { got = d; }); __T.game.setSetting('cam', 'follow'); __T.game.setSetting('cam', 'director'); off(); return !!got && got.key === 'cam'; }));
    await shot('5-menu-choices');
    // the other tabs, from the top bar (hud18: no longer inside the menu): crews / book / project / daily, each fits and its close is reachable
    for (const [k, name] of [['crews', 'crews'], ['book', 'book'], ['store', 'project'], ['daily', 'daily']]) {
      await clearModals();
      c = await center(`.gm-dock .gm-db[data-k="${k}"]`);
      if (c) await tap(c.x, c.y);
      await settle();
      r = await audit('sheet-' + name);
      const p = r.panels.find((q) => /gm-sheet/.test(q.k));
      check(`the ${name} sheet (opened from the top bar's tab by touch) fits 844×390 and every control is ≥ 44 px`, p && p.inside && r.small.length === 0, `${JSON.stringify(p)} ${r.small.slice(0, 3).join(' | ')}`);
      const x = await center('.gm-sheet.on .gm-x');
      const hit = x && await G((p) => { const e = document.elementFromPoint(p.x, p.y); return !!e && !!e.closest('.gm-x'); }, x);
      check(`the ${name} sheet's close button is on screen and is the element under its centre`, !!hit, JSON.stringify(x));
      await shot('6-sheet-' + name);
    }
    await clearModals();
    await G(() => __T.game.ui.openSheet('shop')); await settle();
    r = await audit('sheet-shop'); { const p = r.panels.find((q) => /gm-sheet/.test(q.k)); check('the shop (אוצר המלאכה) fits and scrolls inside itself', p && p.inside && r.small.length === 0, `${JSON.stringify(p)} ${r.small.slice(0, 3).join(' | ')}`); }
    await shot('6-sheet-shop');
    c = await center('.gm-sheet.on .gm-x'); if (c) await tap(c.x, c.y); await pg.waitForTimeout(500);
    check('a tap on the close button closes the sheet', await G(() => !document.querySelector('.gm-sheet.on')));

    await clearModals();
    /* 4. popups 'book' (set above): no card opens, "נוסף לספר" floats, the fact is in the book */
    await G(() => { window.__FL = []; window.__FLI = setInterval(() => { for (const f of document.querySelectorAll('.gm-float')) if (f.style.opacity && f.style.opacity !== '0' && f.textContent && !window.__FL.includes(f.textContent)) window.__FL.push(f.textContent); }, 60); });
    await G(() => { __T.game.ui.storyCard({ t: 'האבן והבונה', q: 'ציטוט לדוגמה', d: 'פרט לדוגמה שנשמר בספר', ref: 'מקור לדוגמה' }, 'סיפור'); __T.game.ui.findCard('bigstone'); });
    await settle();
    const bk = await G(() => ({ modal: !!document.querySelector('.gm-modal'), floats: window.__FL.slice(), notes: (__T.game.state.notes || []).map((n) => n.t) }));
    check("popups 'book': a story card and a find card do not open; a float \"נוסף לספר\" shows; the facts are kept in G.notes", !bk.modal && bk.floats.includes('נוסף לספר') && bk.notes.includes('האבן והבונה'), JSON.stringify(bk));
    await G(() => __T.game.ui.openSheet('book')); await settle();
    check('the book sheet lists the saved fact under "נוסף לספר"', await G(() => /נוסף לספר/.test(document.querySelector('.gm-sheet.on .gm-sh-b').textContent) && /האבן והבונה/.test(document.querySelector('.gm-sheet.on .gm-sh-b').textContent)));
    await G(() => { __T.game.ui.closeSheet(); __T.game.setSetting('popups', 'show'); });
    // and with 'show' the card opens as ever
    await G(() => { window.__CARD = __T.game.ui.storyCard({ t: 'כרטיס גבוה', q: 'מִי שֶׁהוּא מִתְנַדֵּב עָלֶה, אוֹ גַרְגִּיר, אוֹ אֶשְׁכּוֹל, מֵבִיא וְתוֹלֶה בָהּ', d: 'טקסט ארוך. '.repeat(150), ref: 'משנה מדות ג, ח' }, 'סיפור'); });
    await settle();
    r = await audit('modal-tall');
    { const p = r.panels.find((q) => /gm-card/.test(q.k)); check("popups 'show': the story card opens; a TALL card fits inside 844×390 (scrolls inside itself)", p && p.inside && p.scrolls, JSON.stringify(p)); }
    { const bt = await G(() => { const e = document.querySelector('.gm-modal.on .gm-btn[data-i="0"]'); if (!e) return null; const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { y: Math.round(r.top + r.height / 2), h: Math.round(r.height), on: !!t && !!t.closest('.gm-btn[data-i="0"]'), stack: document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2).slice(0, 4).map((x) => x.tagName + '.' + String(x.className && x.className.baseVal === undefined ? x.className : '').split(' ').slice(0, 2).join('.')), modals: document.querySelectorAll('.gm-modal').length }; }); check('the tall card\'s button is on screen, ≥ 44 px, and the element under its centre', bt && bt.on && bt.h >= 44 && bt.y < H, JSON.stringify(bt)); }
    await shot('7-modal-tall');
    c = await center('.gm-modal.on .gm-btn[data-i="0"]'); if (c) await tap(c.x, c.y);
    check('a tap on the card\'s button closes it', await waitFor(() => !document.querySelector('.gm-modal'), null, 3000));
    // the name prompt (24 mishmarot + an input) — the tallest card of the first minutes
    await G(() => { window.__NP = __T.game.ui.namePrompt(); });
    await settle();
    r = await audit('modal-name');
    { const p = r.panels.find((q) => /gm-card/.test(q.k)); check('the name prompt (input + 24 משמרות) fits and scrolls inside itself', p && p.inside, JSON.stringify(p)); }
    check('the name prompt: every control ≥ 44 px', r.small.length === 0, r.small.slice(0, 4).join(' | '));
    await shot('8-modal-name');
    c = await center('.gm-modal.on .gm-btn[data-i="0"]'); if (c) await tap(c.x, c.y);
    if (!(await waitFor(() => !document.querySelector('.gm-modal'), null, 3000))) {   // ── hud18 ── (a real tap that does not close a card is a bug at this size: say where it went)
      console.log('   (the name card did not close by its first button: ' + JSON.stringify(await G(([x, y]) => { const b = document.querySelector('.gm-modal.on .gm-btn[data-i="0"]'), q = b && b.getBoundingClientRect(), t = document.elementFromPoint(x, y); return { tap: [Math.round(x), Math.round(y)], btn: q && [q.left, q.top, q.width, q.height].map(Math.round), hit: t && (t.tagName + '.' + t.className), modals: document.querySelectorAll('.gm-modal').length, on: document.querySelectorAll('.gm-modal.on').length, txt: (document.querySelector('.gm-modal .gm-btn') || {}).textContent, vv: window.visualViewport ? [Math.round(visualViewport.offsetTop), Math.round(visualViewport.scale * 100)] : null, sy: [Math.round(scrollY), Math.round((document.querySelector('.gm-modal') || {}).scrollTop || 0)] }; }, [c.x, c.y])) + ')');
    }
    await clearModals();   // ── hud18 ── (the game raises its own name card / wage card by its clock: they queue before the quiz and the test would answer them instead)
    // a quiz card (4 answers)
    await G(() => { window.__Q = __T.game.ui.quizCard({ q: 'כמה אמות היה גובהו של המזבח בשלבו העליון, לפי המשנה?', a: ['חמש', 'עשר', 'שלוש עשרה', 'שלושים ושתיים'], ok: 1, ref: 'משנה מדות ג, א' }); });
    await settle();
    r = await audit('modal-quiz');
    { const p = r.panels.find((q) => /gm-card/.test(q.k)); check('the quiz card fits and its answers and buttons are ≥ 44 px', p && p.inside && r.small.length === 0, `${JSON.stringify(p)} ${r.small.slice(0, 3).join(' | ')}`); }
    await shot('9-modal-quiz');
    c = await center('.gm-modal.on .gm-btn[data-i="1"]');
    if (c) { const hit = await G(([x, y]) => { const t = document.elementFromPoint(x, y); const b = document.querySelector('.gm-modal.on .gm-btn[data-i="1"]'), q = b && b.getBoundingClientRect(); return { t: t && (t.className || t.tagName), txt: b && b.textContent, r: q && [q.left, q.top, q.width, q.height].map(Math.round) }; }, [c.x, c.y]); console.log('   (the quiz close button: ' + JSON.stringify(hit) + ' at ' + Math.round(c.x) + ',' + Math.round(c.y) + ')'); await tap(c.x, c.y); }
    await waitFor(() => !document.querySelector('.gm-modal'), null, 3000);
    if (await G(() => !!document.querySelector('.gm-modal'))) { await pg.waitForTimeout(800); const c2 = await center('.gm-modal.on .gm-btn[data-i="1"]'); if (c2) await tap(c2.x, c2.y); await waitFor(() => !document.querySelector('.gm-modal'), null, 3000); }

    }
    if (FROM < 6) {
    /* 5. the deal sheet (the course loop's two cards) — under .tw-on and without */
    for (const forced of [true, false]) {
      await clearModals();   // ── hud18 ── (the first-wage card, by the game's clock)
      await G((f) => { if (window.__TWIN && __TWIN.force) __TWIN.force(f); else document.querySelector('.gm').classList.toggle('tw-on', f); }, forced);
      // (the game opens the deal by itself now and then: tap the pill only when it is not already open — the pill toggles it)
      if (!(await G(() => !!document.querySelector('.gm-deal.on')))) { const pill = await center('.gm-pill'); if (pill) await tap(pill.x, pill.y); }
      let opened = await waitFor(() => document.querySelector('.gm-deal.on .gm-jc'), null, 3000);
      if (!opened) { const pill = await center('.gm-pill'); if (pill) await tap(pill.x, pill.y); opened = await waitFor(() => document.querySelector('.gm-deal.on .gm-jc'), null, 6000); }
      if (!opened) console.log('   (the deal did not open: ' + JSON.stringify(await G(() => ({ deal: document.querySelector('.gm-deal') && document.querySelector('.gm-deal').className, modal: !!document.querySelector('.gm-modal'), busy: (() => { try { return [__T.game.loop.busy(), __T.game.loop.deal()]; } catch (e) { return String(e); } })(), mcls: (document.querySelector('.gm-modal') || {}).className, mtx: ((document.querySelector('.gm-modal') || {}).textContent || '').slice(0, 60), hit: (() => { const p = document.querySelector('.gm-pill'); if (!p) return null; const r = p.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return (t && t.className) + '@' + Math.round(r.left) + ',' + Math.round(r.top) + ',' + Math.round(r.width) + 'x' + Math.round(r.height); })(), sheet: !!document.querySelector('.gm-sheet.on'), twon: document.querySelector('.gm').classList.contains('tw-on'), bub: (document.querySelector('.gm-bub') || {}).className, pill: (document.querySelector('.gm-pill') || {}).textContent }))) + ')');
      await settle();
      r = await audit('deal-' + forced);
      const p = r.panels.find((q) => /gm-deal/.test(q.k));
      check(`the deal sheet (${forced ? 'under .tw-on' : 'plain landscape'}) fits 844×390 and its cards are ≥ 44 px`, p && p.inside && r.small.length === 0, `${JSON.stringify(p) || JSON.stringify(await G(() => { const d = document.querySelector('.gm-deal'); if (!d) return null; const q = d.getBoundingClientRect(), c = getComputedStyle(d); return { cls: d.className, op: c.opacity, vis: c.visibility, disp: c.display, r: [q.left, q.top, q.width, q.height].map(Math.round), modal: !!document.querySelector('.gm-modal.on'), mo: !!document.querySelector('.gm-mo.on'), sheet: !!document.querySelector('.gm-sheet.on') }; }))} ${r.small.slice(0, 3).join(' | ')}`);
      await shot('10-deal-' + (forced ? 'tw' : 'plain'));
      { const x = await center('.gm-deal.on .gm-x'); if (x) await tap(x.x, x.y); await pg.waitForTimeout(500); }   // (the cards are tapped last, below: a card begins a craft that would hold the moment back)
    }
    await G(() => { if (window.__HANDS && window.__HANDS.cancel) window.__HANDS.cancel(); });
    await waitFor(() => !window.__HANDS, null, 8000); await pg.waitForTimeout(800);   // (a craft the deal's tap began must be over before the moment)

    }   // (--from=6)
    /* 6. a key moment (the Mount's own) fits inside the screen */
    await clearModals();   // ── hud18 ──
    await G(() => { const g = __T.game.state; g.st.har = Object.assign({}, g.st.har, { ready: true }); __T.game._.resync(); __T.game._.runMoment('har'); });
    let moOn = await waitFor(() => document.querySelector('.gm-mo.on'), null, 10000);
    for (let k = 0; k < 2 && !moOn; k++) { await G(() => { __T.game._.runMoment('har'); }); moOn = await waitFor(() => document.querySelector('.gm-mo.on'), null, 10000); }
    await settle();
    if (!moOn) console.log('   (the moment did not open: ' + JSON.stringify(await G(() => ({ mo: document.querySelector('.gm-mo') && document.querySelector('.gm-mo').className, modal: !!document.querySelector('.gm-modal'), sheet: !!document.querySelector('.gm-sheet.on'), log: window.__GAME_LOG.slice(-6).map((e) => e.type), ready: __T.game.state.st.har && __T.game.state.st.har.ready }))) + ')');
    r = await audit('moment');
    { const p = r.panels.find((q) => /gm-mo-card/.test(q.k)); check('the key moment\'s card fits inside 844×390', p && p.inside, JSON.stringify(p)); }
    check('the moment: every control ≥ 44 px', r.small.length === 0, r.small.slice(0, 4).join(' | '));
    await shot('11-moment');
    // its end (the source card and "המשך" show when the play is done): shown here with a real source, the card must still fit
    await G(() => { const e = document.querySelector('.gm-mo-end'); if (!e) return; e.hidden = false; e.querySelector('.gm-mo-src').innerHTML = '<p class="gm-q">"וְהַמִּזְבֵּחַ אַמָּה אַרְבַּע עֶשְׂרֵה עַל אַמָּה אַרְבַּע עֶשְׂרֵה"</p><p>הפרשנות של המשחק; הציטוט מלא כאן כדי לבדוק גובה.</p><span class="gm-ref">משנה מדות ג, א</span>'; document.querySelector('.gm-mo-skip').hidden = true; });
    await pg.waitForTimeout(300);
    r = await audit('moment-end');
    { const p = r.panels.find((q) => /gm-mo-card/.test(q.k)); check('the moment\'s end (the source and "המשך") fits inside 844×390, the button reachable', p && p.inside && (await G(() => { const e = document.querySelector('.gm-mo-go'); const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return r.height >= 44 && r.bottom <= innerHeight && !!t && !!t.closest('.gm-mo-go'); })), JSON.stringify(p)); }
    await shot('11-moment-end');
    await G(() => { const s = document.querySelector('.gm-mo-skip'); s.hidden = false; s.click(); });
    await waitFor(() => !document.querySelector('.gm-mo'), null, 4000);

    /* 7. the stamp and the banner */
    await clearModals(); await closeDeal();   // ── hud18 ──
    await G(() => { window.__ST = { stamp: null }; __T.game.ui.stamp('יוצאים לעבודה!', { ms: 4200 }).then(() => { window.__ST.stamp = performance.now(); }); });
    await waitFor(() => document.querySelector('.gm-stamp.on'), null, 3000); await pg.waitForTimeout(500);
    const sm = await G(() => { const s = document.querySelector('.gm-stamp'), t = document.querySelector('.gm-st-t'), r = t.getBoundingClientRect(), cs = getComputedStyle(s); return { pe: cs.pointerEvents, text: t.textContent, w: Math.round(r.width), h: Math.round(r.height), fs: parseFloat(getComputedStyle(t).fontSize), cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2), btn: s.querySelectorAll('button, [data-a]').length }; });
    check('ui.stamp: a huge centred word (≥ 60 px, ≥ 40% of the width), pointer-events none, no buttons', sm.pe === 'none' && sm.btn === 0 && sm.fs >= 60 && sm.w >= 0.4 * W && Math.abs(sm.cx - W / 2) < 30 && Math.abs(sm.cy - H / 2) < 40 && sm.text === 'יוצאים לעבודה!', JSON.stringify(sm));
    await shot('12-stamp');
    check('ui.stamp: a tap THROUGH the stamp reaches what is under it (the HUD menu button still opens its sheet)', await (async () => { const bx = await center('.gm-rb'); await tap(bx.x, bx.y); const ok = await waitFor(() => document.querySelector('.gm-sheet.on'), null, 2500); await G(() => __T.game.ui.closeSheet()); return ok; })());
    check('ui.stamp leaves by itself (the promise resolves, .on goes)', await waitFor(() => window.__ST.stamp && !document.querySelector('.gm-stamp.on'), null, 8000));
    await G(() => { window.__BN = []; const o = new MutationObserver(() => { const n = document.querySelectorAll('.gm-banner.on').length; window.__BN.push(n); }); o.observe(document.querySelector('.gm-banner'), { attributes: true, attributeFilter: ['class'] }); window.__BNdone = []; __T.game.ui.banner('הסלע מוכן!', { ms: 2600 }).then(() => window.__BNdone.push('a')); __T.game.ui.banner('הנדבך הושלם!', { ms: 900 }).then(() => window.__BNdone.push('b')); });
    await waitFor(() => document.querySelector('.gm-banner.on'), null, 2000); await pg.waitForTimeout(300);
    const b1 = await G(() => ({ text: document.querySelector('.gm-banner').textContent, n: document.querySelectorAll('.gm-banner.on').length }));
    await shot('13-banner');
    check('ui.banner: one line at the top, imperative; two calls queue (never two at once)', b1.text === 'הסלע מוכן!' && b1.n === 1);
    await waitFor(() => window.__BNdone.length === 2, null, 8000);
    check('ui.banner: the second shows after the first has left, then both resolve in order', await G(() => window.__BNdone.join('') === 'ab' && Math.max(...window.__BN) <= 1));

    /* 7b. a card in the deal taps (it begins a craft: this is the last thing the game is asked to do before the reload) */
    await G(() => { document.querySelector('.gm').classList.remove('tw-on'); });
    if (!(await G(() => !!document.querySelector('.gm-deal.on')))) { const pill = await center('.gm-pill'); if (pill) await tap(pill.x, pill.y); }
    await waitFor(() => document.querySelector('.gm-deal.on .gm-jc'), null, 6000); await settle();
    { const card = await center('.gm-deal.on .gm-jc'); if (card) await tap(card.x, card.y); await pg.waitForTimeout(900); check('a card in the deal taps (the deal closes and the craft begins)', await waitFor(() => !document.querySelector('.gm-deal.on'), null, 5000)); }
    await G(() => { if (window.__HANDS && window.__HANDS.cancel) window.__HANDS.cancel(); });
    /* 8. the settings survive a reload */
    // (the supervisor, 5.10: a reload in the same breath as the craft's cancel lost the store in 2 runs of 5 — never with a beat between;
    // the game writes bh_settings synchronously at each choice, so the test lets the page settle and reads the store first)
    await pg.waitForTimeout(600);
    const pre = await G(() => localStorage.getItem('bh_settings'));
    if (!/"cam":"director"/.test(pre || '')) console.log('   (before the reload the store says ' + pre + ')');
    await pg.reload();
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const st2 = await G(() => ({ s: __T.game.settings() }));
    check('after a reload the two settings are as chosen (cam director, popups show→ the last set value)', st2.s.cam === 'director' && st2.s.popups === 'show', JSON.stringify({ cam: st2.s.cam, popups: st2.s.popups }));

    /* 9. portrait carries none of the landscape rules */
    await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(600);
    const pv = await G(() => { const g = document.querySelector('.gm'); if (!g) return null; return { dock: getComputedStyle(document.querySelector('.gm-dock')).display, nav: getComputedStyle(document.querySelector('.gm-navrow') || document.body).display, left: getComputedStyle(g).getPropertyValue('--tw-left-w').trim(), sheet: getComputedStyle(document.querySelector('.gm-sheet')).bottom, top: getComputedStyle(document.querySelector('.gm-top')).paddingTop }; });
    check('portrait 390×844: the dock shows at the bottom, no tab row, no zone variables, the sheet is a bottom sheet', pv && pv.dock !== 'none' && !(pv.nav === 'grid') && pv.left === '' && pv.sheet === '0px', JSON.stringify(pv));

    check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
  const ok = results.filter(Boolean).length;
  console.log(`\n${ok}/${results.length} checks passed in ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(ok === results.length ? 0 : 1);
})().catch((e) => { console.error('FATAL', e); process.exit(2); });
