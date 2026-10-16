// (wave 6, FUN) The teen playtest of the v6 loop on the REAL HUD: BUILD's game (state v6, the pill, the meter, the cards)
// over its fake 3D world (test/game-harness-entry.js, site6=1), with the REAL parts registered — MATCH3's board (played
// move by move by its own bot at the persona's hand and pace), FUN's precision games (autoplay, ~1 s: their human timing
// is loop-sim's job), KINGS' court — on a virtual clock, so 10 minutes of play take a minute or two.
// נועם (16): a move every 4 s, cards skipped after 1 s, taps the pill every 0.43 s · מאיה (15): 6.5 s, reads 2.6 s, 0.8 s.
//   Run on a merge that holds s6-build + s6-match3 (+ s6-kings, s6-fun):  NODE_PATH=… node test/playtest/v6-bots.cjs [--shots] [--min=10] [--only=noam]
//   → test/out/playtest/v6-bots.json + a summary here; screenshots test/out/playtest/v6-<persona>-<when>.png (--shots)
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'test/out/playtest');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots');
const MIN = +((args.find((a) => a.startsWith('--min=')) || '--min=10').slice(6));
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const has = (p) => fs.existsSync(path.join(ROOT, p));
if (!has('src/game/state.js') || !/nextAction/.test(fs.readFileSync(path.join(ROOT, 'src/game/state.js'), 'utf8')) || !has('src/match3/index.js')) {
  console.log('v6-bots: needs a merge with s6-build (state v6) and s6-match3; skipped'); process.exit(0);
}
const { chromium } = require('playwright');

/* the entry: the real parts register themselves (__BH_PARTS), MATCH3's board opens with its test hook, then BUILD's harness */
const entry = path.join(OUT, 'v6-entry.js');
fs.writeFileSync(entry, [
  `import '../../../src/match3/index.js';`,
  `import * as E from '../../../src/match3/engine.js';`,
  has('src/kings/index.js') ? `import '../../../src/kings/index.js';` : '',
  `import '../../../src/game/hooks/index.js';`,
  `const P = globalThis.__BH_PARTS || {}; const run = P.match3 && P.match3.runLevel;`,
  `if (run) P.match3.runLevel = (ctx) => run({ ...ctx, test: true });`,
  `globalThis.__M3E = E;`,
  `import '../../game-harness-entry.js';`,
].join('\n'));
require(require.resolve('esbuild', { paths: [ROOT] })).buildSync({ entryPoints: [entry], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(OUT, 'v6-harness.bundle.js'), logLevel: 'error', loader: { '.json': 'json' } });
const page = fs.readFileSync(path.join(ROOT, 'test/game-harness.html'), 'utf8').replace(/<script[^>]*src="[^"]*"[^>]*><\/script>/, '<script src="v6-harness.bundle.js"></script>');
fs.writeFileSync(path.join(OUT, 'v6.html'), page);

const PERSONAS = {
  noam: { he: 'נועם', pace: 4000, skill: 0.65, read: 1000, gap: 430, name: 'נועם', start: '2026-10-04T08:00:00' },
  maya: { he: 'מאיה', pace: 6500, skill: 0.55, read: 2600, gap: 800, name: 'מאיה', explore: true, start: '2026-10-04T16:00:00' },
};

/* the persona's brain, inside the page, on the page's fake timers */
function brain(P) {
  const B = window.__BOT = { clicks: 0, dead: 0, moves: 0, cards: [], samples: [], firsts: {}, stuck: 0 };
  const now = () => performance.now(), sec = () => Math.round(now() / 100) / 10;
  const q = (s) => document.querySelector(s);
  const shown = (el) => !!el && el.getAttribute('aria-hidden') !== 'true' && el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden';
  const first = (k) => { if (B.firsts[k] == null) B.firsts[k] = sec(); };
  let next = 0, lastCard = null, lastSample = -1, pend = null, dlgT = 0;
  const logN = () => (window.__GAME_LOG || []).length;
  function where() {
    if (shown(q('div.m3'))) return q('.m3-card') ? 'boardCard' : 'board';
    if (shown(q('.fx-mg'))) return 'precision';
    if (shown(q('.fx-dig'))) return 'dig';                                  // (wave 7) the dig of the day
    if (shown(q('.gm-mo.on'))) return 'moment';
    if (shown(q('.gm-modal'))) return 'card';
    if (shown(q('.gm-sheet.on')) || shown(q('.gm-sheet.open'))) return 'sheet';
    const dl = [...document.querySelectorAll('[role="dialog"]')].find(shown);
    if (dl) { B.dlg = (dl.className || dl.tagName) + ''; return 'dialog'; }
    return 'hud';
  }
  function step() {
    const t = now(), w = where();
    if (Math.floor(t / 5000) !== lastSample) {
      lastSample = Math.floor(t / 5000);
      const pill = q('.gm-pill'); B.samples.push({ t: sec(), w, pill: pill ? pill.textContent.trim().slice(0, 60) : '' });
    }
    if (pend && t > pend.t + 1500) { if (logN() === pend.n && where() === pend.w) B.dead++; pend = null; }
    if (t < next) return;
    try {
      if (w === 'boardCard') { const c = q('.m3-card .m3-cta'); if (c) { first('board'); c.click(); } next = t + P.read; return; }
      if (w === 'board') {
        first('board'); const M = globalThis.__M3_TEST, E = globalThis.__M3E;
        if (M && E) { const mv = E.botMove(M.s, P.skill); if (mv) { M.move(mv[0], mv[1]); B.moves++; } }
        next = t + P.pace; return;
      }
      if (w === 'dig') { first('dig'); const ok = q('.fx-dig .fx-ok'); if (ok && shown(ok)) { ok.click(); B.digs = (B.digs || 0) + 1; } next = t + P.read; return; }   // __MG_AUTO brushes by itself
      if (w === 'precision') { first('precision'); const ok = q('.fx-mg .fx-ok'); if (ok && shown(ok)) ok.click(); next = t + 400; return; }
      if (w === 'card') {
        const m = q('.gm-modal .gm-card'); const k = m ? m.textContent.trim().slice(0, 40) : '';
        if (k !== lastCard) { lastCard = k; B.cards.push({ t: sec(), k }); next = t + P.read; return; }
        const inp = q('.gm-modal .gm-input input, .gm-modal input.gm-input, .gm-modal input');
        if (inp && !inp.value) { inp.value = P.name; inp.dispatchEvent(new Event('input', { bubbles: true })); }
        const b = q('.gm-modal .gm-btn-gold') || q('.gm-modal .gm-btn'); if (b) b.click(); lastCard = null; next = t + 300; return;
      }
      if (w === 'moment') { first('moment'); const b = [...document.querySelectorAll('.gm-mo.on button')].find(shown); if (b && t - (dlgT || (dlgT = t)) > 20000) { b.click(); dlgT = 0; } next = t + 1000; return; }
      if (w === 'sheet' || w === 'dialog') {
        if (!dlgT) dlgT = t;
        const dg = q('[data-fun="dig"]'); if (dg && shown(dg) && t - dlgT > P.read) { dg.click(); next = t + 600; return; }   // (wave 7) the dig first
        const c = q('[data-fun^="claim:"]'); if (c && shown(c) && t - dlgT > P.read) { c.click(); B.claims = (B.claims || 0) + 1; next = t + 600; return; }
        if (t - dlgT > P.read + (B.firsts.today != null && t - B.firsts.today * 1000 < 12000 ? 6000 : 1500)) { const x = q('.gm-sheet .gm-x') || q('[role="dialog"] [aria-label*="סגור"]') || q('[role="dialog"] .m3-exit'); if (x) x.click(); else document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })); dlgT = 0; B.stuck++; }
        next = t + 500; return;
      }
      dlgT = 0;
      if (B.badge == null && (window.__GAME_LOG || []).some((e) => e.type === 'course')) { const bd = q('.gm-db[data-k="daily"] .gm-badge'); if (bd && !bd.classList.contains('gm-hidden')) B.badge = sec(); }   // (wave 7) the "היום" dot
    if (P.explore && B.firsts.today == null && (window.__GAME_LOG || []).some((e) => e.type === 'course')) {   // Maya opens "היום" after her first course
        const d = q('.gm-db[data-k="daily"]'); if (d) { d.click(); first('today'); next = t + 300; return; }
      }
      const pill = q('.gm-pill');
      if (pill && shown(pill) && !pill.disabled) { pend = { t, n: logN(), w }; pill.click(); B.clicks++; }
      next = t + P.gap;
    } catch (e) { B.err = String(e && e.message || e); next = t + 1000; }
  }
  setInterval(step, 100);
}

async function run(b, key, P) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL', timezoneId: 'Asia/Jerusalem' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts/.test(m.text())) errs.push(m.text().slice(0, 160)); });
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 160)));
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const start = new Date(P.start);
  await pg.clock.install({ time: start });
  await pg.clock.pauseAt(start);
  await pg.addInitScript(() => {
    try { localStorage.clear(); localStorage.setItem('bh_settings', JSON.stringify({ demo: false })); } catch (e) { /* */ }
    window.__MG_AUTO = true;
    window.requestAnimationFrame = (cb) => setTimeout(() => cb(performance.now()), 100);  // 10 frames a second on the fake clock (a shared CPU)
    window.cancelAnimationFrame = (id) => clearTimeout(id);
  });
  await pg.goto('file://' + path.join(OUT, 'v6.html') + '?api12=1&site6=1&tod=noon');
  await pg.evaluate(brain, P);
  const t0 = Date.now(), shots = [];
  const shot = async (s) => { if (!SHOTS) return; const f = path.join(OUT, `v6-${key}-${s}.png`); await pg.screenshot({ path: f }); shots.push(f); };
  const plan = [5, 40, 180, 360, 600];                                   // 0:05 · 0:40 · 3:00 · 6:00 · 10:00 (taken when crossed)
  let boardShot = false, todayShot = false;
  for (let s = 0; s < MIN * 60; s += 5) {
    await pg.clock.runFor(5000);
    while (plan.length && plan[0] <= s + 5) { const m = plan.shift(); await shot(`${Math.floor(m / 60)}_${String(m % 60).padStart(2, '0')}`); }
    if (SHOTS && (!boardShot || !todayShot)) {
      const w = await pg.evaluate(() => (window.__BOT.firsts.today != null && document.querySelector('.gm-sheet.on') ? 'today' : document.querySelector('div.m3') && !document.querySelector('.m3-card') ? 'board' : ''));
      if (w === 'board' && !boardShot) { boardShot = true; await pg.clock.runFor(12000); s += 12; await shot('board'); }
      if (w === 'today' && !todayShot) { todayShot = true; await shot('today'); }
    }
  }
  const data = await pg.evaluate(() => ({ bot: window.__BOT, G: { res: __H.game.state.res, st: Object.fromEntries(Object.entries(__H.game.state.st || {}).map(([k, v]) => [k, { p: v.p, set: v.set, n: v.n, c: v.c, done: v.done }])) }, log: (window.__GAME_LOG || []).map((e) => ({ t: Math.round(e.t / 100) / 10, type: e.type, d: e.d && typeof e.d === 'object' ? { by: e.d.by, id: e.d.id, kind: e.d.kind, field: e.d.field, c: e.d.c } : null })) }));
  await ctx.close();
  return { key, he: P.he, realS: +((Date.now() - t0) / 1000).toFixed(1), errors: [...new Set(errs)].slice(0, 6), shots, ...metrics(data) };
}

function metrics(d) {
  const L = d.log, B = d.bot;
  const at = (type, f = () => true) => { const e = L.find((x) => x.type === type && f(x)); return e ? e.t : null; };
  const n = B.samples.length || 1, share = {};
  for (const s of B.samples) share[s.w] = (share[s.w] || 0) + 1;
  for (const k of Object.keys(share)) share[k] = Math.round((100 * share[k]) / n);
  const types = [...new Set(L.map((e) => e.type))];
  return {
    firstStoneByHand: at('keyStone') ?? at('stoneSet', (e) => e.d && e.d.by === 'hero'),
    firstBoard: B.firsts.board ?? null, firstCourse: at('course'), firstPrecision: B.firsts.precision ?? null,
    boardsWon: L.filter((e) => e.type === 'm3Won').length, boardsLost: L.filter((e) => e.type === 'm3Lost').length,
    cardsFirst60s: B.cards.filter((c) => c.t <= 60).map((c) => c.k), cards: B.cards.length,
    share, dlg: B.dlg || null, today: B.firsts.today ?? null, claims: B.claims || 0, digs: B.digs || 0, firstDig: B.firsts.dig ?? null, badge: B.badge ?? null, pillClicks: B.clicks, deadClicks: B.dead, moves: B.moves, stuckDialogs: B.stuck, botErr: B.err || null,
    pills: B.samples.filter((s, i) => i % 6 === 0).map((s) => `${s.t}s ${s.w}: ${s.pill}`),
    eventTypes: types.length, res: d.G.res, st: d.G.st,
  };
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const out = [];
  try {
    for (const [k, P] of Object.entries(PERSONAS)) {
      if (ONLY.length && !ONLY.includes(k)) continue;
      const r = await run(b, k, P); out.push(r);
      console.log(`══ ${r.he} (${r.realS} s real) · first stone by hand ${r.firstStoneByHand} s · first board ${r.firstBoard} s · first precision ${r.firstPrecision} s · first course ${r.firstCourse} s`);
      console.log(`   boards won/lost ${r.boardsWon}/${r.boardsLost} · moves ${r.moves} · time: ${JSON.stringify(r.share)} · pill clicks ${r.pillClicks} (dead ${r.deadClicks}) · stuck dialogs ${r.stuckDialogs}${r.dlg ? ' (' + r.dlg + ')' : ''} · today ${r.today} s, claims ${r.claims} · dig ${r.firstDig} s ×${r.digs} · היום dot ${r.badge} s`);
      console.log(`   cards in the first 60 s (${r.cardsFirst60s.length}): ${r.cardsFirst60s.join(' | ').slice(0, 300)}`);
      console.log(`   errors: ${r.errors.length ? r.errors.join(' | ') : 'none'}${r.botErr ? ' · bot: ' + r.botErr : ''}`);
    }
  } finally { await b.close(); }
  fs.writeFileSync(path.join(OUT, 'v6-bots.json'), JSON.stringify(out, null, 1));
  console.log('wrote test/out/playtest/v6-bots.json');
})();
