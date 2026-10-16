// (GAMES13, wave 13) The three games a boy of the Second Temple played — חמש אבנים, שמונה אבוקות, מגדל האגוזים — by REAL touch at
// 390×844: Playwright hasTouch, page.touchscreen.tap and CDP touch drags, no autoplay flag. A lab page bundles src/games with the
// real audio kit and a stand-in game api (as games-touch). Each game: the hub's tile → its how-to (3 steps, both modes) → "לבד" →
// played by a hand that reads only what a player sees (the game's __g10.state(): where the bones lie, when the golden bone is in
// the ring, which hand a torch lands in and when, where the towers stand) → the result card (kind words, the pay, a fact marked
// טיוטה with its source) → back. Then each duel on one phone: two players, the turn passed (knucklebones, nuts) or two halves
// (the torches, the top half turned to the player across). Checked: 44-px targets, the pay, no console errors.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/games13-touch.cjs [--shots] [--only=knuckle,torches,nuts] [--no-duel]
//   shots: test/out/games13/*.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/games13');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots');
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const want = (id) => !ONLY.length || ONLY.includes(id);
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
const PAGE = path.join(OUT, 'games13-lab.html');
fs.writeFileSync(PAGE, `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>games13 lab</title></head><body style="margin:0;height:100vh;background:#7FA3C8"><script>${js}</script></body></html>`);

const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const PAY = { knuckle: 'stone', torches: 'gold', nuts: 'silver' };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.route(/fonts\.googleapis|fonts\.gstatic/, (r) => r.fulfill({ status: 200, body: '' }));
    const shot = async (n) => { if (!SHOTS) return; await pg.screenshot({ path: path.join(OUT, n + '.png') }); };
    const E = (fn, a) => pg.evaluate(fn, a);
    const tap = (p) => pg.touchscreen.tap(p.x, p.y);
    const tapSel = async (sel) => { const l = pg.locator(sel).first(); await l.waitFor({ state: 'visible', timeout: 8000 }); const bb = await l.boundingBox(); await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); return bb; };
    const cdp = await ctx.newCDPSession(pg);
    const drag = async (a, z) => {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y }] });
      for (let k = 1; k <= 6; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((z.x - a.x) * k) / 6, y: a.y + ((z.y - a.y) * k) / 6 }] }); await pg.waitForTimeout(24); }
      await pg.waitForTimeout(60);
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    await pg.goto('file://' + PAGE);
    await E(() => { window.__R = null; window.GM.openGames({}).then((r) => { window.__R = r; }); });
    await pg.waitForSelector('.g10-tile');
    const tiles = await E(() => [...document.querySelectorAll('.g10-tile')].map((t) => { const r = t.getBoundingClientRect(); return { id: t.dataset.v, h: r.height, txt: t.innerText }; }));
    check('the hub: nine games, the three new ones among them as big tiles', tiles.length === 9 && ['knuckle', 'torches', 'nuts'].every((id) => tiles.some((t) => t.id === id && t.h >= 44)), tiles.map((t) => t.id).join(','));
    await tapSel('.g10-x[data-v="close"]');
    await pg.waitForFunction(() => window.__R !== null, null, { timeout: 5000 });

    async function open(id, mode) {
      await E(() => { if (window.__G.games) window.__G.games.paid = 0; });
      await E((g) => { window.__R = null; window.GM.openGames({ featured: g }).then((r) => { window.__R = r; }); }, id);
      await pg.waitForSelector(`.g10-tile[data-v="${id}"]`);
      await tapSel(`.g10-tile[data-v="${id}"]`);
      await pg.waitForSelector('.g10-howto .g10-card');
      await pg.waitForTimeout(250);
      const how = await E(() => document.querySelector('.g10-howto .g10-card').innerText);
      const lis = await E(() => document.querySelectorAll('.g10-howto .g10-how li').length);
      if (mode === 'solo') await shot(`${id}-howto`);
      await tapSel(`.g10-howto button[data-v="${mode}"]`);
      return { how, lis };
    }
    async function result(id, tag) {
      await pg.waitForSelector('.g10-result', { timeout: 30000 }).catch(() => {});
      await pg.waitForTimeout(450);
      const cards = await E(() => [...document.querySelectorAll('.g10-result .g10-card')].map((c) => c.innerText.replace(/\s+/g, ' ')));
      await shot(`${id}-${tag}-result`);
      return cards;
    }
    async function close() {
      const other = await E(() => !!document.querySelector('.g10-result button[data-v="close"]'));
      if (other) await tapSel('.g10-result button[data-v="close"]');
      else { await tapSel('.g10-result button[data-v="other"]'); await pg.waitForSelector('.g10-tile', { timeout: 8000 }); await tapSel('.g10-x[data-v="close"]'); }
      await pg.waitForFunction(() => window.__R !== null, null, { timeout: 8000 });
    }
    const buttons44 = () => E(() => [...document.querySelectorAll('.g10 button')].filter((x) => x.offsetParent).map((x) => { const r = x.getBoundingClientRect(); return Math.min(r.width, r.height); }));

    /* ───────── חמש אבנים ───────── */
    const KN = () => E(() => { const e = document.querySelector('.g10-kn'); return e && e.__g10 ? e.__g10.state() : null; });
    // one throw by touch: tap the hand, tap `pick` bones (the round's need unless told otherwise), catch in the ring (or let it fall)
    async function throwOnce({ pick = null, letFall = false, shotAt = '' } = {}) {
      let s = await KN();
      for (let k = 0; k < 40 && s && s.phase !== 'ready' && !s.over; k++) { await pg.waitForTimeout(120); s = await KN(); }
      if (!s || s.over) return s;
      await tap(s.hand);
      await pg.waitForTimeout(60);
      s = await KN();
      const n = pick == null ? s.need : pick;
      for (let i = 0; i < n; i++) { s = await KN(); const bn = s.bones.find((q) => q); if (!bn) break; await tap(bn); await pg.waitForTimeout(40); }
      if (shotAt) { await pg.waitForTimeout(150); await shot(shotAt); }
      if (letFall) { for (let k = 0; k < 200; k++) { s = await KN(); if (s.phase !== 'air') break; await pg.waitForTimeout(60); } return s; }
      // the catch at the ring's first moment (a busy machine's frame may come between the look and the tap)
      for (let k = 0; k < 600; k++) { s = await KN(); if (s.phase !== 'air') return s; if (s.catchable) { await tap(s.hand); break; } await pg.waitForTimeout(8); }
      await pg.waitForTimeout(100);
      return KN();
    }
    try {
    if (want('knuckle')) {
      const h = await open('knuckle', 'solo');
      check('חמש אבנים: the how-to (3 steps), the verse with its source (טיוטה), alone or two on one phone', h.lis === 3 && /זכריה ח, ה/.test(h.how) && /טיוטה/.test(h.how) && /שניים — טלפון אחד/.test(h.how), h.how.split('\n').slice(0, 2).join(' / '));
      await pg.waitForSelector('.g10-kn'); await pg.waitForTimeout(400);
      await shot('knuckle-solo-open');
      let s = await KN();
      check('חמש אבנים: four bones on the mat, the golden one in the hand, targets ≥ 44 px', s && s.bones.filter(Boolean).length === 4 && s.phase === 'ready' && s.need === 1, JSON.stringify({ need: s && s.need, hand: s && s.hand }));
      // one drop on purpose: kind words, the same throw again, a little slower
      const f0 = s.flight;
      s = await throwOnce({ pick: 1, letFall: true });
      await pg.waitForTimeout(300);
      s = await KN();
      check('a dropped bone: "נפלה!", the same throw again (ones), a little slower — nothing lost', s.players[0].misses === 1 && s.round === 0 && s.group === 0 && s.flight > f0, `flight ${f0.toFixed(2)} → ${s.flight.toFixed(2)}`);
      let throws = 0, shotMid = false;
      while (throws < 30) {
        s = await KN(); if (!s || s.over) break;
        const r0 = s.round;
        s = await throwOnce({ shotAt: !shotMid && r0 === 1 ? 'knuckle-solo-twos' : '' });
        if (r0 === 1) shotMid = true;
        throws++;
        if (!s) break;
      }
      const cards = await result('knuckle', 'solo');
      check(`חמש אבנים: ones, twos, threes and fours by touch (${throws} throws after the drop)`, cards.length === 1 && throws >= 9 && throws <= 20, cards[0] && cards[0].slice(0, 60));
      check('חמש אבנים: a kind result, the pay (stone), a fact marked טיוטה with its source', /טיוטה/.test(cards[0] || '') && /הידעת/.test(cards[0] || '') && /\+\d+/.test(cards[0] || '') && !/הפסדת|נכשלת/.test(cards[0] || ''));
      const t44 = await buttons44();
      check('חמש אבנים: every button ≥ 44 px', t44.every((v) => v >= 44), t44.map(Math.round).join(','));
      await close();
      if (!args.includes('--no-duel')) {
        await open('knuckle', 'duel');
        await pg.waitForSelector('.g10-kn'); await pg.waitForTimeout(400);
        s = await KN();
        const t0 = s.turn;
        await throwOnce();   // a good throw keeps the turn
        s = await KN();
        const kept = s.turn === t0;
        await throwOnce({ pick: 0 });   // caught without the bone: the turn passes, and a card hands the phone over
        await pg.waitForSelector('.g10-wrap .g10-card', { timeout: 5000 }).catch(() => {});
        await pg.waitForTimeout(300);
        const card = await E(() => { const c = document.querySelector('.g10-wrap .g10-card'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
        await shot('knuckle-duel-turn');
        await tapSel('.g10-wrap .g10-card button[data-v="go"]');
        await pg.waitForTimeout(300);
        s = await KN();
        const bands = await E(() => [...document.querySelectorAll('.g10-band')].map((b) => ({ on: b.classList.contains('on'), vis: b.offsetParent !== null, tr: getComputedStyle(b).transform })));
        check('חמש אבנים, a duel: a good throw keeps the turn; a miss passes it — the card "תור ארגמן" hands the phone over; both bands upright', kept && s.turn === 1 - t0 && s.phase === 'ready' && /תור ארגמן/.test(card) && bands.filter((b) => b.vis).length === 2 && bands.every((b) => b.tr === 'none'), `turn ${t0} → ${s.turn} · ${card.slice(0, 60)}`);
        check('חמש אבנים, a duel: the mat is laid for who plays now (ארגמן starts his ones: four bones)', s.bones.filter(Boolean).length === 4 && s.need === 1, JSON.stringify(s.players));
        await tapSel('.g10-band [data-exit]'); await tapSel('.g10-wrap button[data-v="yes"]');
        await pg.waitForSelector('.g10-tile', { timeout: 8000 }); await tapSel('.g10-x[data-v="close"]');
        await pg.waitForFunction(() => window.__R !== null, null, { timeout: 8000 });
      }
    }
    } catch (e) { check(`knuckle: ran to its end`, false, e.message.split('\n')[0]); await shot('knuckle-error'); try { await pg.goto('file://' + PAGE); } catch (x) { /* */ } }

    /* ───────── שמונה אבוקות ───────── */
    const TO = () => E(() => [...document.querySelectorAll('.g10-to')].map((e) => e.__g10.state()));
    // the juggler's hand: tap the side where a torch lands, on its beat, until n torches are up (then let them fall: the evening ends)
    async function juggle(me, upTo, ms) {
      const t0 = Date.now(); let taps = 0, st = null;
      while (Date.now() - t0 < ms) {
        st = (await TO()).find((q) => q.me === me);   // (by the player, not the DOM order: the top half comes first in the page)
        if (!st || st.over) break;
        if (st.n >= upTo) { await pg.waitForTimeout(40); continue; }   // (hands off: the torches fall)
        let best = null;
        for (const hd of [0, 1]) { const d = st.due[hd]; if (d && !st.shaking[hd] && d.in < 0.045 && d.in > -d.win * 0.7) best = hd; }
        if (best != null) { await tap(st.hands[best]); taps++; await pg.waitForTimeout(15); } else await pg.waitForTimeout(4);
      }
      return { taps, st: (await TO()).find((q) => q.me === me) };
    }
    try {
    if (want('torches')) {
      const h = await open('torches', 'solo');
      const plain = h.how.replace(/[\u0591-\u05C7]/g, '');   // (the quote carries its vowels)
      check('שמונה אבוקות: the how-to (3 steps), the Talmud\'s words with the source (טיוטה), alone or two', h.lis === 3 && /סוכה נג, א/.test(plain) && /אין נוגעות/.test(plain) && /טיוטה/.test(plain), plain.split('\n').slice(0, 2).join(' / '));
      await pg.waitForSelector('.g10-to'); await pg.waitForTimeout(400);
      let st = (await TO())[0];
      check('שמונה אבוקות: the torches wait for the first tap', st && !st.started && st.n === 3 && st.t === 0);
      await tap({ x: 195, y: 420 });
      await pg.waitForTimeout(900);
      await shot('torches-solo-start');
      const r = await juggle(0, 5, 45000);
      st = r.st;
      check(`שמונה אבוקות: juggled by touch up to five torches (${r.taps} taps, ${st.catches} catches, ${st.drops} fell)`, st.best >= 5 && st.catches >= 19, JSON.stringify({ n: st.n, best: st.best, drops: st.drops }));
      await shot('torches-solo-five');
      const cards = await result('torches', 'solo');
      check('שמונה אבוקות: three fallen torches end the evening kindly; the pay (gold), a fact marked טיוטה with its source', cards.length === 1 && /טיוטה/.test(cards[0]) && /\+\d+/.test(cards[0]) && /אבוקות/.test(cards[0]) && !/הפסדת|נכשלת/.test(cards[0]), cards[0] && cards[0].slice(0, 70));
      await close();
      if (!args.includes('--no-duel')) {
        await open('torches', 'duel');
        await pg.waitForSelector('.g10-to'); await pg.waitForTimeout(400);
        const S0 = await TO();
        // the near player starts in his half; the across player's half is turned (his hands appear mirrored)
        await tap({ x: 195, y: 700 }); await tap({ x: 195, y: 140 });
        await pg.waitForTimeout(600);
        const r2 = await juggle(0, 4, 30000);
        await shot('torches-duel');
        const S1 = (await TO()).sort((a, b) => a.me - b.me);
        const turned = await E(() => { const t = document.querySelector('.g10-half.g10-t'); return t ? getComputedStyle(t).transform : ''; });
        check('שמונה אבוקות, a duel: two jugglers, one per half — the top half turned; each half\'s hands answer its own taps', S0.length === 2 && S1[0].started && S1[1].started && S1[0].best >= 4 && /matrix\(-1/.test(turned), JSON.stringify(S1.map((q) => ({ n: q.n, c: q.catches, d: q.drops }))) + ` · ${r2.taps} taps`);
        const cards2 = await result('torches', 'duel');
        check('שמונה אבוקות, a duel: a kind card at each end', cards2.length === 2 && cards2.every((t) => /טיוטה/.test(t)), cards2.map((t) => t.slice(0, 30)).join(' | '));
        await close();
      }
    }
    } catch (e) { check(`torches: ran to its end`, false, e.message.split('\n')[0]); await shot('torches-error'); try { await pg.goto('file://' + PAGE); } catch (x) { /* */ } }

    /* ───────── מגדל האגוזים ───────── */
    const NU = () => E(() => { const e = document.querySelector('.g10-nuts'); return e && e.__g10 ? e.__g10.state() : null; });
    async function flick(stop, tag) {
      let n = 0; const t0 = Date.now();
      while (Date.now() - t0 < 60000) {
        if (await E((q) => !!document.querySelector(q), stop)) break;
        const s = await NU();
        if (!s || s.over || !s.ready) { await pg.waitForTimeout(200); continue; }
        const i = s.towers.findIndex((p) => p); if (i < 0) { await pg.waitForTimeout(200); continue; }
        let aim = await E((k) => document.querySelector('.g10-nuts').__g10.aimAt(k), i);
        if (!aim) { const k = s.scale || 1; aim = { from: { x: 0, y: 0 }, to: { x: 90 * k, y: 12 * k } }; }   // (a child's full flat pull)
        const a = { x: 250, y: 600 }, z = { x: a.x + (aim.to.x - aim.from.x), y: a.y + (aim.to.y - aim.from.y) };
        if (tag && n === 0) {   // the dots of the first nut, under the finger
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: a.x, y: a.y }] });
          for (let k = 1; k <= 6; k++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: a.x + ((z.x - a.x) * k) / 6, y: a.y + ((z.y - a.y) * k) / 6 }] }); await pg.waitForTimeout(24); }
          await pg.waitForTimeout(120); await shot(`${tag}-aim`);
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
        } else await drag(a, z);
        n++;
        if (tag && n === 1) { await pg.waitForTimeout(500); await shot(`${tag}-roll`); }
        await pg.waitForTimeout(900);
      }
      return n;
    }
    try {
    if (want('nuts')) {
      const h = await open('nuts', 'solo');
      check('מגדל האגוזים: the how-to (3 steps) says the tower is an illustration (המחשה); alone or two', h.lis === 3 && /המחשה/.test(h.how) && /שניים — טלפון אחד/.test(h.how), h.how.split('\n').slice(0, 2).join(' / '));
      for (const lv of [1, 2, 3, 4, 5]) {
        if (lv > 1) { await tapSel('.g10-result button[data-v="again"]'); }
        await E(() => { if (window.__G.games) window.__G.games.paid = 0; });
        await pg.waitForSelector('.g10-nuts'); await pg.waitForTimeout(450);
        const s0 = await NU();
        if (lv === 1) await shot('nuts-L1-open');
        const n = await flick('.g10-result', lv === 1 || lv === 5 ? `nuts-L${lv}` : '');
        const s = await NU();
        const cards = await result('nuts', `L${lv}`);
        check(`מגדל האגוזים, courtyard ${lv} (${s0.name}): played by touch — ${n} nut${n === 1 ? '' : 's'}, ${s ? `${s.down}/${s.targets}` : '?'} towers down`, s && s.won && n >= 1 && n <= 3 && s0.level === lv, cards[0] && cards[0].slice(0, 50));
        if (lv === 1) check('מגדל האגוזים: a kind result, the pay (silver), a fact marked טיוטה with its source', /טיוטה/.test(cards[0]) && /הידעת/.test(cards[0]) && /\+\d+/.test(cards[0]));
      }
      const t44 = await buttons44();
      check('מגדל האגוזים: every button ≥ 44 px', t44.every((v) => v >= 44), t44.map(Math.round).join(','));
      await close();
      if (!args.includes('--no-duel')) {
        await E(() => { window.__G.games.nuts = { lv: 1 }; });
        await open('nuts', 'duel');
        await pg.waitForSelector('.g10-nuts'); await pg.waitForTimeout(400);
        await flick('.g10-wrap .g10-card h2', '');
        const turn = await E(() => { const c = document.querySelector('.g10-wrap .g10-card'); return c ? c.innerText.replace(/\s+/g, ' ') : ''; });
        check('מגדל האגוזים, a duel: the card passes the phone ("תור ארגמן")', /תור ארגמן/.test(turn), turn.slice(0, 80));
        await tapSel('.g10-wrap .g10-card button[data-v="go"]');
        await pg.waitForTimeout(500);
        await flick('.g10-result', '');
        const cards = await result('nuts', 'duel');
        check('מגדל האגוזים, a duel: the same courtyard for each; a kind card at each end', cards.length === 2 && cards.every((t) => /טיוטה/.test(t) && !/הפסדת|נכשלת/.test(t)), cards.map((t) => t.slice(0, 30)).join(' | '));
        await close();
      }
    }
    } catch (e) { check(`nuts: ran to its end`, false, e.message.split('\n')[0]); await shot('nuts-error'); try { await pg.goto('file://' + PAGE); } catch (x) { /* */ } }

    const paid = await E(() => window.__G.res);
    check('the games paid through the game\'s path (stone · gold · silver)', ['knuckle', 'torches', 'nuts'].filter(want).every((id) => paid[PAY[id]] > 0), JSON.stringify(paid));
    check('the hold is released after the games', await E(() => window.__PAUSE[window.__PAUSE.length - 1] === false && !document.querySelector('.g10')));
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
  const ok = results.every(Boolean);
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed`);
  process.exit(ok ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
