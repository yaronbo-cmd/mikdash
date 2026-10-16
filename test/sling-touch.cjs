// (FUN12, wave 12) "הקלע של דוד" by REAL touch at 390×844 — Playwright hasTouch, CDP touch drags (touchStart → touchMove ×6 →
// touchEnd), no autoplay flag. A lab page bundles src/games with the real audio kit and a stand-in game api (as games-touch).
// The hub → the sling's tile → its how-to (one player: no duel button) → "לשחק" → each level is played by a hand that drags the
// sling back along the arc the game's own solver gives for the first standing target (__g10.aimAt), waits for the next stone,
// and so on until the level's end; the result card (words, the pay chip, a fact marked טיוטה with its source) → "עוד פעם" takes
// the next level. Checked: 44-px targets, the dots on the first two shots, the pay, Goliath's fall on the last level, no errors.
// (GAMES13, wave 13) where the solver has no line (L6's last target), the hand makes a child's full pull back at 45°.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/sling-touch.cjs [--shots] [--levels=1,2,10]
//   shots: test/out/sling/*.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/sling');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots');
const LV = (args.find((a) => a.startsWith('--levels=')) || '').slice(9).split(',').filter(Boolean).map(Number);
const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
const entry = `
import * as GM from './src/games/index.js';
import { createAudio } from './src/game/audio.js';
const sfx = createAudio({});
const G = { res: { stone: 0, cedar: 0, gold: 0, silver: 0, bronze: 0, wstone: 0 }, ftue: 99 };
window.GM = GM; window.__G = G; window.__SAVES = 0; window.__PAUSE = []; window.__TOASTS = [];
window.__LOG = [];
const api = { state: G, sfx, log: window.__LOG, busy: false, whole: false, save: () => { window.__SAVES++; }, ui: { root: document.body, flashRes() {}, refresh() {}, toast(o) { window.__TOASTS.push(o); }, modal() { return Promise.resolve(false); } } };
GM.bindHost({ game: () => api, pause: (on) => window.__PAUSE.push(on) });
`;
const js = esbuild.buildSync({ stdin: { contents: entry, resolveDir: ROOT }, bundle: true, format: 'iife', write: false, target: 'es2020', minify: true, charset: 'utf8' }).outputFiles[0].text;
const PAGE = path.join(OUT, 'sling-lab.html');
fs.writeFileSync(PAGE, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>sling lab</title></head><body style="margin:0;height:100vh;background:#7FA3C8"><script>${js}</script></body></html>`);

const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.route(/fonts\.googleapis|fonts\.gstatic/, (r) => r.fulfill({ status: 200, body: '' }));
    const shot = async (n) => { if (!SHOTS) return; await pg.evaluate(() => { try { for (const a of document.getAnimations()) { try { a.finish(); } catch (e) { /* infinite */ } } } catch (e) { /* */ } }); await pg.screenshot({ path: path.join(OUT, n + '.png') }); };
    const E = (fn, a) => pg.evaluate(fn, a);
    const tapSel = async (sel) => { const l = pg.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 8000 }); const bb = await l.boundingBox(); await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); return bb; };
    const cdp = await ctx.newCDPSession(pg);
    const drag = async (a, z) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y }] });
      for (let k = 1; k <= 6; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((z.x - a.x) * k) / 6, y: a.y + ((z.y - a.y) * k) / 6 }] }); await pg.waitForTimeout(24); }
      await pg.waitForTimeout(60);
    };
    const up = () => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    /* the hand: drag the sling back along the solver's aim at the first standing target (a lob every third stone), until `stop` shows */
    let fallbacks = 0;
    async function hand(want, firstLv, stop) {
      let shots = 0;
      const t0 = Date.now();
      while (Date.now() - t0 < 90000) {
        if (await E((q) => !!document.querySelector(q), stop)) break;
        const s = await E(() => { const e = document.querySelector('.g10-sling'); return e && e.__g10 ? e.__g10.state() : null; });
        if (!s || s.over) { await pg.waitForTimeout(250); continue; }
        if (!s.ready) { await pg.waitForTimeout(200); continue; }
        const i = s.aims.findIndex((p) => p);
        if (i < 0) { await pg.waitForTimeout(200); continue; }
        let aim = await E(([k, lob]) => document.querySelector('.g10-sling').__g10.aimAt(k, lob), [i, shots % 3 === 2]);
        if (!aim) aim = await E(([k, lob]) => document.querySelector('.g10-sling').__g10.aimAt(k, lob), [i, shots % 3 !== 2]);   // (the other arc)
        // (GAMES13, PRODUCER-S13a #12) no line at all — L6's last target: a child's full pull back at 45°, as a child does (it fells it)
        if (!aim) { const k = s.scale || 1, d = 96 * Math.SQRT1_2 * k; aim = { from: { x: 0, y: 0 }, to: { x: d, y: d }, child: true }; fallbacks++; }
        // the finger goes down low on the right (anywhere works: the pull is relative), and pulls back by the aim's vector
        const a = { x: 300, y: 640 }, z = { x: a.x + (aim.to.x - aim.from.x), y: a.y + (aim.to.y - aim.from.y) };
        await drag(a, z);
        if (want === firstLv && shots === 0) await shot(`sl-L${want}-aim`);
        await up();
        shots++;
        if (want === firstLv && shots === 1) { await pg.waitForTimeout(450); await shot(`sl-L${want}-flight`); }
        if (want === 10 && shots === 1) { await pg.waitForTimeout(700); await shot('sl-L10-shot1'); }
        await pg.waitForTimeout(700);
      }
      return shots;
    }
    await pg.goto('file://' + PAGE);
    await E(() => { window.__R = null; window.GM.openGames({}).then((r) => { window.__R = r; }); });
    await pg.waitForSelector('.g10-tile');
    const tile = await E(() => { const t = document.querySelector('.g10-tile[data-v="sling"]'); if (!t) return null; const r = t.getBoundingClientRect(); return { h: r.height, w: r.width, txt: t.innerText }; });
    check('the hub has "הקלע של דוד" as a big tile', tile && tile.h >= 44 && /הקלע של דוד/.test(tile.txt), JSON.stringify(tile && { h: tile.h, w: tile.w }));
    await tapSel('.g10-tile[data-v="sling"]');
    await pg.waitForSelector('.g10-howto .g10-card');
    const how = await E(() => document.querySelector('.g10-howto .g10-card').innerText);
    check('its how-to: three steps, the verse with its source (טיוטה), alone or a duel in turns', /חֲמִשָּׁה חַלֻּקֵי אֲבָנִים/.test(how) && /שמואל א יז, מ/.test(how) && /טיוטה/.test(how) && /תור לכל אחד/.test(how) && !!(await pg.$('.g10-howto button[data-v="duel"]')), how.split('\n').slice(0, 2).join(' / '));
    await pg.waitForTimeout(400);
    await shot('sl-howto');
    const levels = LV.length ? LV : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    // (GAMES13) a run that starts past level 1 (--levels=6,…): the save already stands there, as a returning player's would
    if (levels[0] !== 1) await E((w) => { window.__G.games = window.__G.games || {}; window.__G.games.sling = { lv: w, best: {} }; }, levels[0]);
    await tapSel('.g10-howto button[data-v="solo"]');
    let first = true, lvNow = levels[0];
    for (const want of levels) {
      // (a level beyond the next is reached by the saved progress: the lab jumps the save, as a returning player would have it)
      if (want !== lvNow) {
        if (!first) { await tapSel('.g10-result button[data-v="close"]'); await pg.waitForFunction(() => window.__R !== null, null, { timeout: 8000 }); }
        await E((w) => { window.__G.games = window.__G.games || {}; window.__G.games.sling = { lv: w, best: {} }; window.__R = null; window.GM.openGames({ game: 'sling' }).then((r) => { window.__R = r; }); }, want);
        await pg.waitForSelector('.g10-howto .g10-card'); await tapSel('.g10-howto button[data-v="solo"]');
      } else if (!first) await tapSel('.g10-result button[data-v="again"]');
      first = false;
      await E(() => { if (window.__G.games) window.__G.games.paid = 0; });   // (the hub's day count: each level is checked for its pay)
      await pg.waitForSelector('.g10-sling');
      await pg.waitForTimeout(500);
      const st0 = await E(() => document.querySelector('.g10-sling').__g10.state());
      check(`level ${want}: it opens with five stones (${st0.name})`, st0.level === want && st0.stones === 5, `targets ${st0.targets}`);
      if (want === levels[0] || want === 10) await shot(`sl-L${want}-open`);
      const shots = await hand(want, levels[0], '.g10-result');
      const st = await E(() => { const e = document.querySelector('.g10-sling'); return e && e.__g10 ? e.__g10.state() : null; });
      if (want === 10 && st && st.won) await shot('sl-L10-fallen');
      await pg.waitForSelector('.g10-result', { timeout: 15000 }).catch(() => {});
      await pg.waitForTimeout(400);
      const card = await E(() => { const c = document.querySelector('.g10-result .g10-card'); return c ? c.innerText : ''; });
      check(`level ${want}: played by touch to its end (${shots} stone${shots === 1 ? '' : 's'}; ${st ? `${st.down}/${st.targets} down` : '?'})`, !!card && shots >= 1 && shots <= 5, card.split('\n')[0]);
      check(`level ${want}: a kind result, the pay, a fact marked טיוטה with its source`, /טיוטה/.test(card) && /הידעת/.test(card) && /\+\d+/.test(card) && !/הפסדת|נכשלת/.test(card));
      if (want === 10) check('Goliath: a stone to the forehead and he falls on his face', !!(st && st.won && st.goliath && st.goliath.down), JSON.stringify(st && st.goliath));
      if (want === levels[0] || want === 10) await shot(`sl-L${want}-result`);
      lvNow = st && st.won ? want + 1 : want;
    }
    console.log(`(the child's fallback pull, where the solver has no line: ${fallbacks}×)`);
    const targets = await E(() => [...document.querySelectorAll('.g10 button')].filter((x) => x.offsetParent).map((x) => { const r = x.getBoundingClientRect(); return Math.min(r.width, r.height); }));
    check('every button on screen is ≥ 44 px', targets.every((v) => v >= 44), targets.map(Math.round).join(','));
    await tapSel('.g10-result button[data-v="close"]');
    await pg.waitForFunction(() => window.__R !== null, null, { timeout: 8000 });
    /* the duel in turns on one phone: level 1 twice — תכלת, then the card "תור ארגמן", then ארגמן; a result at each end */
    if (!args.includes('--no-duel')) {
      await E(() => { window.__G.games.sling = { lv: 1, best: {} }; window.__G.games.paid = 0; window.__R = null; window.GM.openGames({ game: 'sling' }).then((r) => { window.__R = r; }); });
      await pg.waitForSelector('.g10-howto .g10-card'); await tapSel('.g10-howto button[data-v="duel"]');
      await pg.waitForSelector('.g10-sling'); await pg.waitForTimeout(500);
      const who0 = await E(() => (document.querySelector('.g10-sl-hud .who') || {}).textContent || '');
      const s1 = await hand(0, -1, '.g10-card h2');
      const turn = await E(() => { const c = document.querySelector('.g10-wrap .g10-card'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
      check('duel: the first player plays, then the card passes the phone ("תור ארגמן")', /תכלת/.test(who0) && /תור ארגמן/.test(turn), `${who0} · ${s1} stones · ${turn.slice(0, 90)}`);
      await shot('sl-duel-turn');
      await tapSel('.g10-wrap .g10-card button[data-v="go"]');
      await pg.waitForTimeout(500);
      const who1 = await E(() => (document.querySelector('.g10-sl-hud .who') || {}).textContent || '');
      const s2 = await hand(0, -1, '.g10-result');
      await pg.waitForSelector('.g10-result', { timeout: 15000 }).catch(() => {});
      await pg.waitForTimeout(400);
      const cards = await E(() => [...document.querySelectorAll('.g10-result .g10-card')].map((c) => c.innerText.replace(/\s+/g, ' ')));
      check('duel: the second player plays the same level; a kind result at each end with a sourced fact', /ארגמן/.test(who1) && cards.length === 2 && cards.every((t) => /טיוטה/.test(t) && !/הפסדת|נכשלת/.test(t)), `${who1} · ${s2} stones · ${cards.map((t) => t.slice(0, 40)).join(' | ')}`);
      await shot('sl-duel-result');
      await tapSel('.g10-result button[data-v="other"]'); await pg.waitForSelector('.g10-tile', { timeout: 8000 });
      await tapSel('.g10-x[data-v="close"]');
      await pg.waitForFunction(() => window.__R !== null, null, { timeout: 8000 });
    }
    const paid = await E(() => ({ res: window.__G.res, lv: window.__G.games.sling }));
    check('the games paid their stones and the level is saved', paid.res.stone > 0 && paid.lv && paid.lv.lv >= 1, JSON.stringify(paid));
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
  const ok = results.every(Boolean);
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
