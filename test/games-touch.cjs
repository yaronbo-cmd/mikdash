// (GAMES10, wave 10) The classic in-between games by REAL touch at 390×844 — Playwright hasTouch + page.touchscreen.tap, no
// autoplay flag, no demo. Part A (a lab page: src/games bundled with the real audio kit and a stand-in game api whose G.res is
// paid through state.js gain): every game, solo and duel, is opened, its how-to/mode card read, played by a hand that
// reads only what a player sees (the columns, the open faces, the next foot), finished, and paid; the result card, its
// fact (טיוטה + source) and the pay chip are checked; the hub goes back and the 3D hold is released. Part B (the real build,
// dist/test.html): a saved game past the FTUE, the menu → "משחקי ביניים" → a race by touch → G.res grew, the world's hold
// released, no console errors.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/games-touch.cjs [--shots] [--lab-only] [--no-build]
//   shots: test/out/games/<game>-<mode>-{howto,play,result}.png · menu.png · hub.png · real-*.png
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/games');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots');
const LAB_ONLY = args.includes('--lab-only');
const REAL_ONLY = args.includes('--real-only');
const ONLY_L = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);   // e.g. --only=levites (a short run)
const ONLY = ONLY_L.length ? ONLY_L : null;
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));

const entry = `
import * as GM from './src/games/index.js';
import { createAudio } from './src/game/audio.js';
const sfx = createAudio({});
const G = { res: { stone: 0, cedar: 0, gold: 0, silver: 0, bronze: 0, wstone: 0 }, ftue: 99 };
window.GM = GM; window.__G = G; window.__SAVES = 0; window.__PAUSE = []; window.__TOASTS = [];
window.__LOG = []; window.__MODALS = [];
const api = { state: G, sfx, log: window.__LOG, busy: false, whole: false, save: () => { window.__SAVES++; }, ui: { root: document.body, flashRes() {}, refresh() {}, toast(o) { window.__TOASTS.push(o); }, modal(html, o) { window.__MODALS.push(html); return Promise.resolve(false); } } };
GM.bindHost({ game: () => api, pause: (on) => window.__PAUSE.push(on) });
`;
const js = esbuild.buildSync({ stdin: { contents: entry, resolveDir: ROOT }, bundle: true, format: 'iife', write: false, target: 'es2020', minify: true, charset: 'utf8' }).outputFiles[0].text;
const PAGE = path.join(OUT, 'games-lab.html');
fs.writeFileSync(PAGE, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>games lab</title></head><body style="margin:0;height:100vh;background:#7FA3C8"><script>${js}</script></body></html>`);

const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const PAY = { four: ['stone', 8], memory: ['gold', 6], race: ['silver', 10], stack: ['stone', 10], levites: ['silver', 8] };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    if (!REAL_ONLY) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.route(/fonts\.googleapis|fonts\.gstatic/, (r) => r.fulfill({ status: 200, body: '' }));
    const shot = (n) => (SHOTS ? pg.screenshot({ path: path.join(OUT, n + '.png') }) : null);
    const tapBox = async (bb, fx = 0.5, fy = 0.5) => { await pg.touchscreen.tap(bb.x + bb.width * fx, bb.y + bb.height * fy); };
    const tapSel = async (sel, fx, fy) => { const l = pg.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 8000 }); const bb = await l.boundingBox(); await tapBox(bb, fx, fy); };
    const E = (fn, a) => pg.evaluate(fn, a);

    await pg.goto('file://' + PAGE);

    /* the hub first: three games, 44-px targets */
    await E(() => { window.__R = null; window.GM.openGames({}).then((r) => { window.__R = r; }); });
    await pg.waitForSelector('.g10-tile');
    const tiles = await E(() => [...document.querySelectorAll('.g10-tile')].map((t) => { const r = t.getBoundingClientRect(); return { id: t.dataset.v, h: r.height, w: r.width, txt: t.textContent }; }));
    check('the hub shows the nine games as big tiles (≥ 44 px; GAMES13: the three of the period)', tiles.length === 9 && tiles.every((t) => t.h >= 44 && t.w >= 44), tiles.map((t) => t.id + ' ' + Math.round(t.h)).join(', '));
    check('the hub holds the 3D loop', await E(() => window.__PAUSE[0] === true));
    await shot('hub');
    await tapSel('.g10-x[data-v="close"]');
    await pg.waitForFunction(() => window.__R !== null, null, { timeout: 5000 });
    check('"חזרה" closes the hub and releases the hold', await E(() => !document.querySelector('.g10') && window.__PAUSE[window.__PAUSE.length - 1] === false));

    /* one game in one mode, by touch */
    async function playOne(id, mode) {
      const tag = `${id}-${mode}`;
      await E(() => { if (window.__G.games) window.__G.games.paid = 0; });   // (each game is checked on a fresh day's count; the cap has its own check)
      const before = await E(() => ({ ...window.__G.res }));
      await E((g) => { window.__R = null; window.GM.openGames({ game: g }).then((r) => { window.__R = r; }); }, id);
      await pg.waitForSelector('.g10-howto .g10-card');
      const how = await E(() => document.querySelector('.g10-howto .g10-card').innerText);
      check(`${tag}: the one-screen how-to (3 steps) and both modes`, /לבד/.test(how) && /שניים — טלפון אחד/.test(how) && (how.match(/\n/g) || []).length >= 3, how.split('\n')[0]);
      const fits = await E(() => { const c = document.querySelector('.g10-howto .g10-card'); return c.scrollHeight <= c.clientHeight + 2; });
      check(`${tag}: the how-to fits one screen`, fits);
      await pg.waitForTimeout(450);   // (the overlay's fade-in)
      await shot(`${tag}-howto`);
      await tapSel(`.g10-howto button[data-v="${mode}"]`);
      const t0 = Date.now();
      let taps = 0, shotPlay = false;
      if (id === 'four') {
        await pg.waitForSelector('.g10-board canvas');
        const duelCol = (s) => { const open = (c) => s.board[0][c] < 0; const want = s.turn === 0 ? 3 : 0; return open(want) ? want : [3, 2, 4, 1, 5, 0, 6].find(open); };
        while (Date.now() - t0 < 90000) {
          if (await E(() => !!document.querySelector('.g10-result'))) break;
          const s = await E(() => { const c = document.querySelector('.g10-board canvas'); return c && c.__g10 ? c.__g10.state() : null; });
          if (!s || s.busy || !s.human || s.win) { await pg.waitForTimeout(120); continue; }
          let col;
          if (mode === 'duel') col = duelCol(s);
          else {   // the hand: win if it can, block if it must, else a column near the middle that is open
            const B = s.board, R = 6, C = 7;
            const row = (c) => { for (let r = R - 1; r >= 0; r--) if (B[r][c] < 0) return r; return -1; };
            const wins = (c, p) => { const r = row(c); if (r < 0) return false; B[r][c] = p; let w = false; for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [1, -1]]) { let n = 1; for (const sg of [1, -1]) { let rr = r + dr * sg, cc = c + dc * sg; while (rr >= 0 && rr < R && cc >= 0 && cc < C && B[rr][cc] === p) { n++; rr += dr * sg; cc += dc * sg; } } if (n >= 4) w = true; } B[r][c] = -1; return w; };
            const open = [3, 2, 4, 1, 5, 0, 6].filter((c) => row(c) >= 0);
            col = open.find((c) => wins(c, s.turn)) ?? open.find((c) => wins(c, 1 - s.turn)) ?? open[0];
          }
          const p = await E((c) => document.querySelector('.g10-board canvas').__g10.colX(c), col);
          await pg.touchscreen.tap(p.x, p.y); taps++;
          if (!shotPlay && taps === 4) { await pg.waitForTimeout(400); await shot(`${tag}-play`); shotPlay = true; }
          await pg.waitForTimeout(150);
        }
      } else if (id === 'memory') {
        await pg.waitForSelector('.g10-mc');
        const seen = {};
        while (Date.now() - t0 < 90000) {
          if (await E(() => !!document.querySelector('.g10-result'))) break;
          const s = await E(() => { const g = document.querySelector('.g10-mem'); return g && g.__g10 ? g.__g10.state() : null; });
          if (!s || s.busy) { await pg.waitForTimeout(120); continue; }
          for (const c of s.cards) if (c.v != null) seen[c.i] = c.v;
          const shut = s.cards.filter((c) => !c.done && !c.up);
          const openOne = s.cards.find((c) => c.up && !c.done);
          let pick = null;
          if (openOne) pick = shut.find((c) => seen[c.i] === openOne.v) || shut.find((c) => seen[c.i] == null) || shut[0];
          else {
            const byV = {}; for (const c of shut) if (seen[c.i] != null) (byV[seen[c.i]] = byV[seen[c.i]] || []).push(c);
            const pair = Object.values(byV).find((l) => l.length >= 2);
            pick = pair ? pair[0] : shut.find((c) => seen[c.i] == null) || shut[0];
          }
          if (!pick) { await pg.waitForTimeout(150); continue; }
          await tapSel(`.g10-mc[data-i="${pick.i}"]`); taps++;
          if (!shotPlay && taps === 5) { await pg.waitForTimeout(350); await shot(`${tag}-play`); shotPlay = true; }
          await pg.waitForTimeout(140);
        }
      } else if (id === 'levites') {
        await pg.waitForSelector('.g10-lv .g10-pad');
        // the hand repeats what it heard; alone it lets the 5th phrase slip, in a duel the across player slips at 5 notes
        while (Date.now() - t0 < 100000) {
          if (await E(() => !!document.querySelector('.g10-result'))) break;
          const s = await E(() => { const b = document.querySelector('.g10-lv'); return b && b.__g10 ? b.__g10.state() : null; });
          if (!s || s.phase !== 'play') { await pg.waitForTimeout(80); continue; }
          let pad;
          if (s.idx < s.seq.length) pad = (!s.duel && s.seq.length >= 5) || (s.duel && s.turn === 1 && s.seq.length >= 5) ? (s.seq[s.idx] + 1) % 4 : s.seq[s.idx];
          else pad = (s.seq.length * 3 + 1) % 4;
          await tapSel(`.g10-pad[data-pad="${pad}"]`); taps++;
          if (!shotPlay && taps === 4) { await shot(`${tag}-play`); shotPlay = true; }
          await pg.waitForTimeout(120);
        }
      } else if (id === 'stack') {
        await pg.waitForSelector('.g10-half.g10-b .g10-stk');
        // the hand watches its stone: it sets it over the course (the first courses true), then lets one miss to end the wall
        const plan = mode === 'duel' ? { bot: 6, top: 4 } : { bot: 7 };
        const halves = Object.keys(plan);
        while (Date.now() - t0 < 100000) {
          if (await E(() => !!document.querySelector('.g10-result'))) break;
          let acted = false;
          for (const hf of halves) {
            const s = await E((q) => { const h = document.querySelector(`.g10-half.g10-${q[0]}`); return h && h.__g10 ? h.__g10.state() : null; }, hf);
            if (!s || s.over || !s.cur) continue;
            const miss = s.n >= plan[hf];
            const ok = await pg.waitForFunction(([q, miss]) => { const h = document.querySelector(`.g10-half.g10-${q[0]}`); const s = h && h.__g10 && h.__g10.state(); if (!s || !s.cur) return true; const d = s.cur.x - s.top.x; return miss ? (d > s.top.w + 0.03 || d < -s.cur.w - 0.03) : Math.abs(d) < 0.012; }, [hf, miss], { polling: 'raf', timeout: 9000 }).then(() => true, () => false);
            if (!ok) continue;
            const bb = await pg.locator(`.g10-half.g10-${hf[0]} .g10-stk`).boundingBox();
            await tapBox(bb, 0.5, 0.35); taps++; acted = true;
            if (!shotPlay && taps === 5) { await pg.waitForTimeout(200); await shot(`${tag}-play`); shotPlay = true; }
            await pg.waitForTimeout(60);
          }
          if (!acted) await pg.waitForTimeout(100);
        }
      } else {
        await pg.waitForSelector('.g10-half.g10-b .g10-foot-b');
        const box = async (half, f) => pg.locator(`.g10-half.g10-${half[0]} .g10-foot-b[data-foot="${f}"]`).boundingBox();
        const bb = { bot: { R: await box('bot', 'R'), L: await box('bot', 'L') } };
        if (mode === 'duel') bb.top = { R: await box('top', 'R'), L: await box('top', 'L') };
        const foot = { bot: 'R', top: 'R' };
        let round = 0;
        while (Date.now() - t0 < 120000) {
          if (await E(() => !!document.querySelector('.g10-result'))) break;
          const s = await E(() => { const h = document.querySelector('.g10-half.g10-b'); return h && h.__g10 ? h.__g10.state() : null; });
          if (!s || s.phase !== 'run') { await pg.waitForTimeout(60); continue; }
          const rw = s.wins[0] + s.wins[1];
          if (rw !== round) round = rw;
          // the duel: both players run; the top player takes the second round (a 2:1 match), the bottom the others
          const who = mode === 'duel' ? ((round === 1 ? taps % 3 !== 0 : taps % 3 === 0) ? 'top' : 'bot') : 'bot';
          await tapBox(bb[who][foot[who]]); taps++;
          foot[who] = foot[who] === 'R' ? 'L' : 'R';
          if (!shotPlay && taps === 30) { await shot(`${tag}-play`); shotPlay = true; }
          await pg.waitForTimeout(25);
        }
      }
      const res = await pg.waitForSelector('.g10-result .g10-card', { timeout: 15000 }).then(() => true, () => false);
      check(`${tag}: played by touch to the end (${taps} taps, ${((Date.now() - t0) / 1000).toFixed(1)} s)`, res && taps > 0);
      await pg.waitForTimeout(400);
      const card = await E(() => { const cs = [...document.querySelectorAll('.g10-result .g10-card')]; return cs.map((c) => c.innerText); });
      const after = await E(() => ({ ...window.__G.res }));
      const [k, n] = PAY[id];
      check(`${tag}: a friendly result${mode === 'duel' ? ' at both ends' : ''}, a fact marked טיוטה with its source`, card.length === (mode === 'duel' ? 2 : 1) && card.every((t) => /טיוטה/.test(t) && /הידעת/.test(t)) && !card.some((t) => /הפסדת|נכשלת|לוזר/.test(t)), card.map((t) => t.split('\n')[0]).join(' | '));
      check(`${tag}: paid through the game's resources (+${n} ${k})`, after[k] - before[k] === n && card.some((t) => /למלאי/.test(t)), `${before[k]} → ${after[k]}`);
      if (mode === 'duel') {
        const turned = await E(() => { const t = document.querySelector('.g10-result .g10-half.g10-t'); return t ? getComputedStyle(t).transform : ''; });
        check(`${tag}: the across player's card is turned to him (180°)`, /matrix\(-1, 0, 0, -1/.test(turned) || /matrix\(-1, 1\.2/.test(turned), turned);
      }
      await shot(`${tag}-result`);
      await tapSel(`.g10-result button[data-v="other"]`);
      await pg.waitForSelector('.g10-tile');
      await tapSel('.g10-x[data-v="close"]');
      await pg.waitForFunction(() => window.__R !== null, null, { timeout: 5000 });
      check(`${tag}: back to the building; the hold released`, await E(() => !document.querySelector('.g10') && window.__PAUSE[window.__PAUSE.length - 1] === false));
    }
    for (const id of ONLY || ['four', 'memory', 'race', 'stack', 'levites']) for (const mode of ['solo', 'duel']) {
      try { await playOne(id, mode); } catch (e) { check(`${id}-${mode}: ran`, false, e.message.split('\n')[0]); await pg.reload(); }
    }
    /* the day's count: past it a game is still played to its end, just without the pay line */
    {
      await E(() => { window.__G.games.paid = 6; window.__R = null; window.GM.openGames({ game: 'four' }).then((r) => { window.__R = r; }); });
      const before = await E(() => window.__G.res.stone);
      await tapSel('.g10-howto button[data-v="duel"]');
      await pg.waitForSelector('.g10-board canvas');
      const t1 = Date.now();
      while (Date.now() - t1 < 30000 && !(await E(() => !!document.querySelector('.g10-result')))) {
        const s = await E(() => { const c = document.querySelector('.g10-board canvas'); return c && c.__g10 ? c.__g10.state() : null; });
        if (!s || s.busy || s.win) { await pg.waitForTimeout(100); continue; }
        const p = await E((c) => document.querySelector('.g10-board canvas').__g10.colX(c), s.turn === 0 ? 2 : 5);
        await pg.touchscreen.tap(p.x, p.y); await pg.waitForTimeout(150);
      }
      await pg.waitForSelector('.g10-result .g10-card', { timeout: 10000 });
      const txt = await E(() => [...document.querySelectorAll('.g10-result .g10-card')].map((c) => c.innerText).join(' '));
      check('past the day\'s count (6): the game ends kindly, no pay and no pay line', (await E(() => window.__G.res.stone)) === before && !/למלאי/.test(txt) && /טיוטה/.test(txt));
      await tapSel('.g10-result button[data-v="other"]'); await pg.waitForSelector('.g10-tile'); await tapSel('.g10-x[data-v="close"]');
      await pg.waitForFunction(() => window.__R !== null, null, { timeout: 5000 });
    }
    /* the between-stages invitation: after a stage completes and the game is idle — once a day, never in the FTUE */
    await E(() => { window.__G.ftue = 3; window.__LOG.push({ t: performance.now(), type: 'stageDone', detail: { id: 'har' } }); });
    await pg.waitForTimeout(8000);
    const inFtue = await E(() => window.__MODALS.length);
    await E(() => { window.__G.ftue = 99; window.__LOG.push({ t: performance.now(), type: 'stageDone', detail: { id: 'har' } }); });
    const asked = await pg.waitForFunction(() => window.__MODALS.length > 0, null, { timeout: 12000 }).then(() => true, () => false);
    await E(() => { window.__LOG.push({ t: performance.now(), type: 'stageDone', detail: { id: 'wall' } }); });
    await pg.waitForTimeout(8000);
    const n = await E(() => window.__MODALS.length);
    check('the between-stages invitation: none in the FTUE; after a stage, once a day', inFtue === 0 && asked && n === 1, `ftue ${inFtue} · asked ${asked} · total ${n}`);
    check('lab: no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
    await ctx.close();
    }

    if (!LAB_ONLY) await realBuild(b);
  } finally { await b.close(); }
  const fails = results.filter((x) => !x).length;
  console.log(`\n${results.length - fails}/${results.length} passed`);
  process.exit(fails ? 1 : 0);
})();

/* Part B: the real build — the menu's section opens a game, the game pays into the save */
async function realBuild(b) {
  if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
  pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.addInitScript(() => {
    window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__DT_MAX = 0.6;
    try {
      if (!sessionStorage.getItem('g10-once')) {
        sessionStorage.setItem('g10-once', '1'); localStorage.clear();
        localStorage.setItem('bh_settings', JSON.stringify({ demo: false }));
        localStorage.setItem('bh_beta2', JSON.stringify({ v: 6, ftue: 99, op: 1, name: 'יכין', mishmar: 3, created: Date.now() - 864e5, clock: Date.now(), lastSeen: Date.now(), st: { har: { done: true } }, res: { stone: 40, cedar: 0, bronze: 0, gold: 0, silver: 60, wstone: 0 } }));
      }
    } catch (e) { /* blocked */ }
  });
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 240000 });
  await pg.waitForTimeout(1500);
  const E = (fn, a) => pg.evaluate(fn, a);
  // (a SwiftShader frame can hold the page for seconds: an overlay's fade-in may not have advanced when the shot is taken — the
  // CSS animations are finished first, so the shot shows the settled screen the player sees)
  const shot = async (n) => { if (SHOTS) { await E(() => { try { for (const a of document.getAnimations()) { try { a.finish(); } catch (e) { /* infinite */ } } } catch (e) { /* */ } }); await pg.screenshot({ path: path.join(OUT, n + '.png'), timeout: 120000 }); } };
  const tapSel = async (sel, fx = 0.5, fy = 0.5) => { const l = pg.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 15000 }); const bb = await l.boundingBox(); await pg.touchscreen.tap(bb.x + bb.width * fx, bb.y + bb.height * fy); };
  const st = await E(() => ({ ftue: __T.game.state.ftue, parts: __T.game._.parts(), silver: __T.game.state.res.silver }));
  check('real: the saved game is past the FTUE and the part is registered (parts().games)', st.ftue === 99 && st.parts.includes('games'), JSON.stringify(st));
  // close whatever card greets the player (welcome back, a daily)
  for (let i = 0; i < 4; i++) { const m = await pg.$('.gm-modal .gm-btn, .gm-modal button'); if (!m) break; const bb = await m.boundingBox(); if (bb) await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(700); }
  await tapSel('.gm-rb[data-k="menu"]');
  await pg.waitForSelector('[data-g10="race"]', { timeout: 8000 });
  const menu = await E(() => { const s = [...document.querySelectorAll('.gm-sec')].find((x) => /משחקי ביניים/.test(x.textContent)); const bs = [...document.querySelectorAll('[data-g10]')].map((x) => { const r = x.getBoundingClientRect(); return { id: x.dataset.g10, h: Math.round(r.height), w: Math.round(r.width) }; }); return { sec: !!s, bs }; });
  check('real: the menu has the "משחקי ביניים" section with a 44-px button per game (9: FUN12 the sling, GAMES13 three more)', menu.sec && menu.bs.length === 9 && menu.bs.every((x) => x.h >= 44 && x.w >= 44), JSON.stringify(menu.bs));
  // (the sheet slides in and scrolls; on a loaded SwiftShader machine the slide can take seconds: wait until the button stands
  //  still inside the screen, as a finger would, then tap it)
  for (let i = 0, prev = null; i < 40; i++) {
    await pg.locator('[data-g10="race"]').scrollIntoViewIfNeeded().catch(() => {});
    const r = await pg.locator('[data-g10="race"]').first().boundingBox();
    if (r && prev && Math.abs(r.y - prev.y) < 0.5 && r.y >= 0 && r.y + r.height <= 844) break;
    prev = r; await pg.waitForTimeout(250);
  }
  await shot('real-menu');
  const before = await E(() => __T.game.state.res.silver);
  await tapSel('[data-g10="race"]');
  await pg.waitForSelector('.g10-howto .g10-card', { timeout: 8000 });
  const held = await E(() => ({ sheet: !!document.querySelector('.gm-sheet.on'), top: document.elementFromPoint(195, 600) && document.elementFromPoint(195, 600).closest('.g10') !== null }));
  check('real: the race opens over the game (the sheet closed, the overlay takes the touch)', !held.sheet && held.top, JSON.stringify(held));
  await tapSel('.g10-howto button[data-v="solo"]');
  await pg.waitForSelector('.g10-half.g10-b .g10-foot-b');
  const R = await pg.locator('.g10-half.g10-b .g10-foot-b[data-foot="R"]').boundingBox(), L = await pg.locator('.g10-half.g10-b .g10-foot-b[data-foot="L"]').boundingBox();
  let f = 0, taps = 0; const t0 = Date.now();
  while (Date.now() - t0 < 120000) {
    if (await E(() => !!document.querySelector('.g10-result'))) break;
    const s = await E(() => { const h = document.querySelector('.g10-half.g10-b'); return h && h.__g10 ? h.__g10.state() : null; });
    if (!s || s.phase !== 'run') { await pg.waitForTimeout(60); continue; }
    const bb = f ? L : R; f = 1 - f;
    await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); taps++;
    if (taps === 24) await shot('real-race');
    await pg.waitForTimeout(20);
  }
  const done = await pg.waitForSelector('.g10-result .g10-card', { timeout: 20000 }).then(() => true, () => false);
  const after = await E(() => ({ silver: __T.game.state.res.silver, saved: JSON.parse(localStorage.getItem('bh_beta2')).res.silver, games: __T.game.state.games }));
  check(`real: the race played by touch to its end, paid +10 silver into the game and the save`, done && after.silver - before >= 10 && after.saved === after.silver && after.games && after.games.paid === 1, `${before} → ${after.silver} (saved ${after.saved}), ${taps} taps, G.games ${JSON.stringify(after.games)}`);
  await pg.waitForTimeout(500);   // (the card's fade-in)
  await shot('real-result');
  // (PRODUCER10 N37) the duel's far end in the real build: page.html and ui.css.js hide a bare .top under body.gm-on
  await tapSel('.g10-result button[data-v="other"]'); await pg.waitForSelector('.g10-tile');
  for (const [g, sel] of [['four', '.g10-band.g10-t'], ['race', '.g10-half.g10-t .g10-foot-b']]) {
    await tapSel(`.g10-tile[data-v="${g}"]`); await pg.waitForSelector('.g10-howto .g10-card');
    await tapSel('.g10-howto button[data-v="duel"]'); await pg.waitForTimeout(900);
    const vis = await E((q) => { const e = document.querySelector(q); if (!e) return null; const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { d: cs.display, v: cs.visibility, h: Math.round(r.height), w: Math.round(r.width), top: Math.round(r.top) }; }, sel);
    check(`real: the ${g} duel shows the far player's end (${sel})`, vis && vis.d !== 'none' && vis.v !== 'hidden' && vis.h >= 44 && vis.w >= 44 && vis.top < 422, JSON.stringify(vis));
    await shot(`real-${g}-duel`);
    await tapSel('.g10 [data-exit]'); await pg.waitForSelector('.g10-wrap .g10-card'); await tapSel('.g10-wrap button[data-v="yes"]');
    await pg.waitForSelector('.g10-tile', { timeout: 8000 });
  }
  await tapSel('.g10-x[data-v="close"]');
  await pg.waitForFunction(() => !document.querySelector('.g10'), null, { timeout: 8000 });
  const back = await E(() => ({ paused: !!(window.__T && window.__T.paused && window.__T.paused()), hud: !!document.querySelector('.gm-top') }));
  check('real: back to the building (the overlay gone, the HUD there)', back.hud, JSON.stringify(back));
  await shot('real-back');

  /* (FUN11, wave 11) the doors a child finds by himself: the world's game table (SITE11's pick target calls games.table()), the chip
     after a board, and the invitation after a stage that names the stage's own game */
  const info = await E(() => __BH_PARTS.games.tableInfo());
  await E(() => { window.__tbl = __BH_PARTS.games.table(); });
  await pg.waitForSelector('.g10-tile', { timeout: 8000 });
  await pg.waitForTimeout(400);
  const hub = await E(() => { const t = [...document.querySelectorAll('.g10-tile')], f = t[0], r = f.getBoundingClientRect(); return { first: f.dataset.v, feat: f.classList.contains('g10-feat'), rib: (f.querySelector('.g10-rib') || {}).textContent || '', why: (f.querySelector('span') || {}).textContent || '', h: Math.round(r.height), n: t.length }; });
  check('fun11: the game table opens the hub, the game of the stage first ("מתאים למה שאתה בונה") with its reason', hub.first === info.game && hub.feat && /מתאים/.test(hub.rib) && hub.why.length > 20 && hub.h >= 96 && hub.n === 9, JSON.stringify({ info, hub }));
  await shot('fun11-table-hub');
  await tapSel(`.g10-tile[data-v="${info.game}"]`);
  check('fun11: a tap on the featured game opens its how-to', await pg.waitForSelector('.g10-howto .g10-card', { timeout: 8000 }).then(() => true, () => false));
  await tapSel('.g10-howto button[data-v="back"]'); await pg.waitForSelector('.g10-tile', { timeout: 8000 });
  await tapSel('.g10-x[data-v="close"]'); await pg.waitForFunction(() => !document.querySelector('.g10'), null, { timeout: 8000 });
  // the chip: a board's end written once into the game's log, then only touch
  await E(() => { const L = __T.game.log; L.push({ t: (L.length ? L[L.length - 1].t : 0) + 1, type: 'm3Won', detail: { field: 'quarry', level: 1, stars: 2 } }); });
  const chipOn = await pg.waitForSelector('.g10-chip.on', { timeout: 15000 }).then(() => true, () => false);
  await pg.waitForTimeout(400);
  const cb = await E(() => { const c = document.querySelector('.g10-chip'); if (!c) return null; const r = c.getBoundingClientRect(), go = c.querySelector('.go').getBoundingClientRect(), x = c.querySelector('.x').getBoundingClientRect(); const dk = [...document.querySelectorAll('.gm-dock, .gm-db')].map((e) => e.getBoundingClientRect()).filter((q) => q.height > 0); const dockTop = dk.length ? Math.round(Math.min(...dk.map((q) => q.top))) : null; const at = document.elementFromPoint(go.left + go.width / 2, go.top + go.height / 2); return { game: c.dataset.game, h: Math.round(go.height), xw: Math.round(x.width), top: Math.round(r.top), bottom: Math.round(r.bottom), left: Math.round(r.left), right: Math.round(r.right), dockTop, onTop: !!(at && c.contains(at)) }; });
  check('fun11: a finished board leaves a chip for one game (44-px targets, above the dock, on top, on screen)', chipOn && cb && cb.h >= 44 && cb.xw >= 44 && cb.left >= 0 && cb.right <= 390 && cb.onTop && (cb.dockTop === null || cb.bottom <= cb.dockTop), JSON.stringify(cb));
  await shot('fun11-chip');
  // (a SwiftShader shot can outlast the chip's 12 s, and a tap in its last 0.3 s races the fade: the test lets that chip go and
  // shows a fresh one for the tap — declared, then only touch)
  await pg.waitForFunction(() => !document.querySelector('.g10-chip'), null, { timeout: 16000 }).catch(() => {});
  await E(() => __BH_PARTS.games.chip()); await pg.waitForSelector('.g10-chip.on', { timeout: 5000 }); await pg.waitForTimeout(350);
  await tapSel('.g10-chip .go');
  const chipGame = await pg.waitForSelector('.g10-howto .g10-card', { timeout: 8000 }).then(() => true, () => false);
  const howT = await E(() => (document.querySelector('.g10-howto h2') || {}).textContent || '');
  check('fun11: a tap on the chip opens that game', chipGame && !(await E(() => !!document.querySelector('.g10-chip.on'))), howT);
  await tapSel('.g10-howto button[data-v="back"]'); await pg.waitForSelector('.g10-tile', { timeout: 8000 });
  await tapSel('.g10-x[data-v="close"]'); await pg.waitForFunction(() => !document.querySelector('.g10'), null, { timeout: 8000 });
  // the invitation after a stage: the stage's own game, its reason and source
  await E(() => { window.__inv = __BH_PARTS.games.invite(__T.game.state, 'nikanor'); });
  const invOn = await pg.waitForSelector('.gm-modal .g10-inv', { timeout: 8000 }).then(() => true, () => false);
  await pg.waitForTimeout(500);
  const inv = invOn ? await E(() => ({ game: document.querySelector('.g10-inv').dataset.game, t: document.querySelector('.g10-inv').closest('.gm-modal').textContent.replace(/\s+/g, ' ').trim() })) : { t: '' };
  check('fun11: after Nikanor the invitation names שיר הלויים, with its reason and its source', inv.game === 'levites' && /שיר הלויים/.test(inv.t) && /משנה מדות ב, ה/.test(inv.t), inv.t.slice(0, 170));
  await shot('fun11-invite');
  await tapSel('.gm-modal .gm-btn-gold');
  const levHow = await pg.waitForSelector('.g10-howto .g10-card', { timeout: 8000 }).then(() => true, () => false);
  check('fun11: its gold button opens that game', levHow && /שיר הלויים/.test(await E(() => (document.querySelector('.g10-howto h2') || {}).textContent || '')));
  await tapSel('.g10-howto button[data-v="back"]'); await pg.waitForSelector('.g10-tile', { timeout: 8000 });
  await tapSel('.g10-x[data-v="close"]'); await pg.waitForFunction(() => !document.querySelector('.g10'), null, { timeout: 8000 });

  check('real: no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  await ctx.close();
}
