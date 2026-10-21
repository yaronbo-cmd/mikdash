// (BOARD21, wave 21) REAL touch at 844×390 on dist/test.html:  node test/board21-touch.cjs [--no-build] [--shots] [--part=1,2,3|all]
//   1 a fresh save: exactly 3 demo rows marked לדוגמה + the player's; the flashes (rows slide 40 ms apart, numbers count up to the true number, gold glow, medals flip, the profile ring fills)
//   2 a family code pushes the demos down; many rows: the board scrolls to his row on open; the rank-up stamp shows once on the first open after a change
//   3 reduced motion skips the animations; the end chain: "+★" counts up, the tomorrow card has the locked silhouette
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/board21');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), PART = (args.find((a) => a.startsWith('--part=')) || '--part=all').slice(7);
const has = (p) => PART === 'all' || PART.split(',').includes(String(p));
const W = 844, H = 390;
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

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
      try { if (!sessionStorage.getItem('b21-once')) { sessionStorage.setItem('b21-once', '1'); localStorage.clear(); } } catch (e) { /* blocked */ }
    });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    const boot = () => pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    await boot();
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const tap = (x, y) => pg.touchscreen.tap(Math.max(2, Math.min(W - 2, x)), Math.max(2, Math.min(H - 2, y)));
    const centre = (sel, txt) => G(([s, t]) => { const e = [...document.querySelectorAll(s)].find((x) => { const r = x.getBoundingClientRect(); return r.width > 1 && getComputedStyle(x).visibility !== 'hidden' && (!t || x.textContent.includes(t)); }); if (!e) return null; try { e.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' }); } catch (err) { /* */ } const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, [sel, txt || '']);   // (scrolled into view: a longer sheet — the profile's tools block — pushed buttons below the fold)
    const tapSel = async (sel, txt) => { const c = await centre(sel, txt); if (!c) return false; await tap(c.x, c.y); await pg.waitForTimeout(260); return true; };
    const shot = async (name) => { if (!SHOTS) return; await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/board21/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); };
    const badge = (k) => G((k) => { const b = document.querySelector(`.gm-dock .gm-db[data-k="${k}"] .gm-badge`); return b && !b.classList.contains('gm-hidden') ? b.textContent : ''; }, k);
    const sheetOn = () => G(() => (document.querySelector('.gm-sheet.on h2') || {}).textContent || '');
    const closeSheet = async () => { if (await sheetOn()) { await tapSel('.gm-sheet.on .gm-x'); await waitFor(() => !document.querySelector('.gm-sheet.on'), null, 3000); } };

    /* the opening, then a live game at the wall */
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);
    await G(() => {
      const g = __T.game.state, site = 'wall'; g.ftue = 99; g.name = 'יכין'; g.mishmar = 3; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
      __T.game.hook20.ar.ensure(g);   // the seen marks are taken here: from now on only new things count
      for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
      g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
      g.xp = { 'סתתים': 14 }; g.focus = site; g.res.stone = 400; g.res.cedar = 120; g.crews = [{ at: 'wall' }, { at: 'wall' }];
      __T.game._.resync();
      __T.game.ui.xp({ craft: 'סתתים', icon: '⚒', name: 'הסתת', level: 2, xp: 14, next: 25, from: 10 });
    });
    await pg.waitForTimeout(1500);
    for (let k = 0; k < 3; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) break; const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(500); }
    await pg.waitForTimeout(600);
    const raw = async (name) => { await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/board21/' + name + '.png'); };
    const openCircle = async () => {
      await closeSheet(); await tapSel('.gm-top .gm-xp'); await pg.waitForTimeout(700);
      const t = Date.now(); await tapSel('.gm-sheet.on .ar-btn', 'המשמר שלי'); return t;
    };
    const rowsNow = () => G(() => [...document.querySelectorAll('.gm-sheet.on .ar-rank')].map((e) => ({ t: e.textContent.replace(/\s+/g, ' ').trim(), me: e.classList.contains('me'), demo: e.classList.contains('demo') })));
    await G(() => { const g = __T.game.state, A = __T.game.hook20.ar; A.ensure(g); g.stats.stones = 40; g.dinars = [{ n: 1, seen: 1 }, { n: 2, seen: 1 }]; g.around.st0 = 40; g.around.dn0 = 2; g.around.demo = undefined; g.around.kin = []; g.around.rank = 0; });

    /* ───────────── 1: a fresh save: three demos and himself; the flashes ───────────── */
    if (has(1)) {
      await closeSheet(); await tapSel('.gm-top .gm-xp'); await pg.waitForTimeout(160);
      const ring = await G(() => { const f = document.querySelector('.gm-sheet.on .ar-ring .f'); return f ? { an: getComputedStyle(f).animationName, off: getComputedStyle(f).strokeDashoffset, fr: getComputedStyle(f.closest('.ar-ring')).getPropertyValue('--f') } : null; });
      check('1: the profile\'s level ring is there and fills on open (animation ar-ring)', ring && /ar-ring/.test(ring.an), JSON.stringify(ring));
      await raw('1-profile-ring-early'); await pg.waitForTimeout(1300); await raw('1-profile-ring');
      const kv = await G(() => [...document.querySelectorAll('.gm-sheet.on .ar-kv .cu')].map((e) => [e.textContent, e.dataset.to]));
      check('1: the profile\'s numbers end at the true number', kv.length === 3 && kv.every(([t, to]) => t.replace(/,/g, '') === to), JSON.stringify(kv));
      const t0 = await openCircle();
      await pg.waitForTimeout(120);
      const early = await G(() => ({ cu: [...document.querySelectorAll('.gm-sheet.on .ar-rank .cu')].map((e) => [e.textContent, e.dataset.to]), play: document.querySelector('.gm-sheet.on .gm-sh-b').classList.contains('ar-play') }));
      check('1: on open the numbers are counting (not yet at their true value) and the board is in play', early.play && early.cu.some(([t, to]) => t.replace(/,/g, '') !== to), JSON.stringify(early.cu.slice(0, 5)));
      await pg.waitForTimeout(250);
      const an = await G(() => { const rs = [...document.querySelectorAll('.gm-sheet.on .ar-rank')]; return { delays: rs.map((e) => getComputedStyle(e).animationDelay.split(',')[0]), me: getComputedStyle(rs.find((e) => e.classList.contains('me'))).animationName, medal: getComputedStyle(rs[0].querySelector('.n')).animationName }; });
      const d = an.delays.map((x) => Math.round(parseFloat(x) * 1000));
      check('1: rows slide in 40 ms apart', d.length === 4 && d.every((x, i) => i === 0 || x - d[i - 1] === 40), JSON.stringify(d));
      check('1: his row glows gold (ar-glow) and the medals flip (ar-flip)', /ar-glow/.test(an.me) && /ar-flip/.test(an.medal), JSON.stringify(an));
      await raw('1-board-early');
      await pg.waitForTimeout(900);
      const fin = await G(() => ({ cu: [...document.querySelectorAll('.gm-sheet.on .ar-rank .cu')].map((e) => [e.textContent, e.dataset.to]) }));
      check('1: the count-up ends at the true number (all of them)', fin.cu.length >= 9 && fin.cu.every(([t, to]) => t.replace(/,/g, '') === to), JSON.stringify(fin.cu.slice(0, 6)));
      const rs = await rowsNow();
      check('1: exactly 3 demo rows, each marked לדוגמה, plus his own', rs.length === 4 && rs.filter((r) => r.demo).length === 3 && rs.filter((r) => r.demo).every((r) => /לדוגמה/.test(r.t)) && rs.filter((r) => r.me).length === 1, JSON.stringify(rs.map((r) => r.t.slice(0, 40))));
      check('1: the demos are the first משמרות, not children (a line says so)', rs.some((r) => /יהויריב/.test(r.t)) && rs.some((r) => /ידעיה/.test(r.t)) && rs.some((r) => /חרים/.test(r.t)) && (await G(() => /לא ילדים אמיתיים/.test(document.querySelector('.gm-sheet.on .gm-sh-b').textContent))));
      const me = await G(() => { const b = document.querySelector('.gm-sheet.on .gm-sh-b').getBoundingClientRect(), r = document.querySelector('.gm-sheet.on .ar-rank.me').getBoundingClientRect(); return r.top >= b.top - 1 && r.bottom <= b.bottom + 1; });
      check('1: his row is in view on open', me);
      await raw('1-board'); void t0;
    }

    /* ───────────── 2: a family; the rank-up; the scroll to him ───────────── */
    if (has(2)) {
      await openCircle(); await pg.waitForTimeout(1200);
      const place0 = await G(() => __T.game.state.around.rank);
      const kin = await G(() => __T.game.hook20.ar.codeOf({ d: 9, s: 300, t: 4 }));
      await pg.fill('#ar-kl', 'אחי'); await pg.fill('#ar-kc', kin); await tapSel('.gm-sheet.on [data-a="aroundKin"]'); await pg.waitForTimeout(700);
      let rs = await rowsNow();
      const iK = rs.findIndex((r) => /אחי/.test(r.t)), iD = rs.findIndex((r) => r.demo);
      check('2: a typed family code pushes the demos to the bottom (his brother above, demos last, still shown at one row)', iK === 0 && iD >= 2 && rs.slice(iD).every((r) => r.demo) && rs.length === 5, JSON.stringify(rs.map((r) => r.t.slice(0, 30))));
      const hasTog = await G(() => !!document.querySelector('.gm-sheet.on [data-a="aroundDemo"]'));
      const toTog = () => G(() => { const e = document.querySelector('.gm-sheet.on [data-a="aroundDemo"]'); if (e) e.scrollIntoView({ block: 'center' }); });
      await toTog(); const tg1 = await tapSel('.gm-sheet.on [data-a="aroundDemo"]'); const afterHide = (await rowsNow()).filter((r) => r.demo).length, st1 = await G(() => __T.game.state.around.demo);
      await toTog(); const tg2 = await tapSel('.gm-sheet.on [data-a="aroundDemo"]'); const afterShow = (await rowsNow()).filter((r) => r.demo).length;
      check('2: a toggle hides the demos (and brings them back)', hasTog && tg1 && tg2 && afterHide === 0 && afterShow === 3, JSON.stringify({ hasTog, tg1, tg2, afterHide, afterShow, st1 }));
      // the rank-up: a baseline open (place p), he builds, opens again
      await G(() => { const g = __T.game.state; g.around.kin = []; g.around.demo = undefined; g.around.rank = 0; });
      await closeSheet(); await openCircle(); await pg.waitForTimeout(1200);
      const base = await G(() => ({ rank: __T.game.state.around.rank, key: __T.game.state.around.rankKey }));
      check('2: the first open stores his place and shows no stamp', base.rank > 1 && !(await G(() => document.querySelector('.gm-stamp.on'))), JSON.stringify(base));
      await G(() => { const g = __T.game.state; g.dinars.push({ n: 3, seen: 1 }); g.stats.stones = 70; });
      await closeSheet(); await pg.waitForTimeout(300); await openCircle();
      const st = await waitFor(() => { const s = document.querySelector('.gm-stamp.on .gm-st-t'); return s && /עלית למקום \d/.test(s.textContent); }, null, 3000);
      check('2: a better place since the last open plays the stamp "עלית למקום N!"', st, await G(() => (document.querySelector('.gm-st-t') || {}).textContent));
      await pg.waitForTimeout(350); await raw('2-rankup-stamp');
      check('2: …and an arrow on his row', await G(() => !!document.querySelector('.gm-sheet.on .ar-rank.me .ar-upa')));
      await pg.waitForTimeout(2200);
      await closeSheet(); await openCircle(); await pg.waitForTimeout(900);
      check('2: the stamp shows once (the next open, no change: none)', !(await G(() => document.querySelector('.gm-stamp.on'))) && !(await G(() => !!document.querySelector('.gm-sheet.on .ar-upa'))));
      // many rows: the board scrolls to HIS row
      await G(() => { const A = __T.game.hook20.ar, g = __T.game.state; g.around.demo = 'hide'; g.around.kin = []; for (let i = 0; i < 9; i++) A.addKin(g, 'קרוב' + (i + 1), A.codeOf({ d: 50 + i, s: 500, t: 3 })); });
      await closeSheet(); await openCircle(); await pg.waitForTimeout(500);
      const sc = await G(() => { const bd = document.querySelector('.gm-sheet.on .gm-sh-b'), b = bd.getBoundingClientRect(), r = document.querySelector('.gm-sheet.on .ar-rank.me').getBoundingClientRect(); return { top: bd.scrollTop, scrollable: bd.scrollHeight > bd.clientHeight + 40, inview: r.top >= b.top - 1 && r.bottom <= b.bottom + 1, n: document.querySelectorAll('.gm-sheet.on .ar-rank').length }; });
      check('2: with ten rows the board scrolls so his row is in view on open', sc.scrollable && sc.top > 0 && sc.inview, JSON.stringify(sc));
      await raw('2-board-scrolled');
      check('2: with 9 family rows the demos are hidden by default (⚑) when not chosen — here hidden by his toggle', (await rowsNow()).every((r) => !r.demo));
      await G(() => { const g = __T.game.state; g.around.kin = []; g.around.demo = undefined; g.around.rank = 0; });
    }

    /* ───────────── 3: reduced motion; the end chain ───────────── */
    if (has(3)) {
      await pg.emulateMedia({ reducedMotion: 'reduce' });
      await G(() => { const g = __T.game.state; g.around.rank = 9; g.around.rankKey = '0|3'; });
      await openCircle(); await pg.waitForTimeout(150);
      const rm = await G(() => ({ play: document.querySelector('.gm-sheet.on .gm-sh-b').classList.contains('ar-play'), cu: [...document.querySelectorAll('.gm-sheet.on .ar-rank .cu')].every((e) => e.textContent.replace(/,/g, '') === e.dataset.to), an: [...document.querySelectorAll('.gm-sheet.on .ar-rank')].map((e) => getComputedStyle(e).animationName), stamp: !!document.querySelector('.gm-stamp.on') }));
      check('3: reduced motion: no play class, the true numbers at once, no row animation, no stamp (a banner line instead)', !rm.play && rm.cu && rm.an.every((x) => x === 'none') && !rm.stamp, JSON.stringify(rm));
      await closeSheet(); await tapSel('.gm-top .gm-xp'); await pg.waitForTimeout(150);
      check('3: reduced motion: the profile ring does not animate', await G(() => getComputedStyle(document.querySelector('.gm-sheet.on .ar-ring .f')).animationName === 'none'));
      await closeSheet(); await pg.emulateMedia({ reducedMotion: 'no-preference' });
      // the end chain
      await G(() => { window.__EC = { cards: [], pts: [] }; new MutationObserver(() => { const c = document.querySelector('.ec-card'); if (!c) return; const h = (c.querySelector('h2') || {}).textContent; if (!window.__EC.cards.includes(h)) window.__EC.cards.push(h); const p = c.querySelector('.ec-pts'); if (p) window.__EC.pts.push([Math.round(performance.now()), p.textContent]); }).observe(document.body, { childList: true, subtree: true, characterData: true }); __T.game.hook20.chain.runNow({ kind: 'course', stones: 12, pts: 3200, golds: 0 }); });
      const gotPts = await waitFor(() => window.__EC.pts.length > 0, null, 9000);
      await pg.waitForTimeout(450);
      const mid = await G(() => { const p = document.querySelector('.ec-pts'); const bar = document.querySelector('.ec-bar i'); return { t: p ? p.textContent : '', shine: bar ? getComputedStyle(bar, '::after').animationName : '' }; });
      check('3: the chain\'s "+★" counts up (a mid value, then the full 3,200)', gotPts && /\+★ \d/.test(mid.t) && mid.t !== '+★ 3,200' || (await G(() => window.__EC.pts.some(([, t]) => t !== '+★ 3,200'))), JSON.stringify(mid));
      check('3: the bar has its shine sweep', /ec-shine/.test(mid.shine), mid.shine);
      await raw('3-chain-points');
      await pg.waitForTimeout(1000);
      check('3: …and ends at the true number', (await G(() => (document.querySelector('.ec-pts') || {}).textContent)) === '+★ 3,200' || (await G(() => window.__EC.pts.slice(-1)[0][1])) === '+★ 3,200');
      const tm = await waitFor(() => !!document.querySelector('.ec-lock'), null, 12000);
      check('3: the "מחר" card shows tomorrow\'s riddle as a locked silhouette with its title', tm && (await G(() => /חידת מחר: .+/.test(document.querySelector('.ec-lock').textContent))), await G(() => (document.querySelector('.ec-lock') || {}).textContent));
      await raw('3-chain-tomorrow');
      await waitFor(() => !document.querySelector('.ec'), null, 12000);
    }
    check('no page errors', logs.length === 0, logs.slice(0, 3).join(' | '));
  } finally {
    await b.close();
  }
  const bad = results.filter((x) => !x).length;
  console.log(`\n${results.length - bad}/${results.length} passed in ${Math.round((Date.now() - T0) / 1000)}s`);
  process.exit(bad ? 1 : 0);
})();
