// PRODUCER13 (wave 13 — the owner, 30.9 07:32: "תחשוב שהמשחק מיועד בעיקר לבנים צעירים אז אולי אפשר לבדוק אילו משחקים שיחקו
// בתקופה ההיא ולהתאים משהו.."): the three new games of the period as a boy meets them, by REAL TOUCH on a phone (390×844, touch, he-IL).
//   node test/produce-games13.cjs --url=file:///…/peek.html [--tag=g13] [--games=knuckle,torches,nuts] [--modes=solo] [--duel=torches]
//        [--demo=0] [--each=110] [--budget=560]
// The owner's path: a fresh phone → ☰ → "מצב הדגמה" (his testing mode; --demo=0 skips it) → ☰ → the menu's "משחקי ביניים" row →
// the game's own button ([data-g10=<id>]) → its how-to (the mode card) → "לבד" / "שניים — טלפון אחד" → play → the result card (the
// fact, the pay) → "חזרה". Played as a child plays, reading only what the screen shows (each game's __g10.state(): the hand, the bones
// and the ring; the landing hand of each torch; the nut and the towers) and answering with real touches:
//   knuckle — tap the hand to throw, tap the bones on the mat while it flies (as many as the round needs), tap the hand when the
//             golden bone is in the ring;
//   torches — tap the hand (its side of the screen) a torch is about to land in, on its beat;
//   nuts    — drag back from the nut and let go: the game's own aim for a standing tower (aimAt), else a child's pull to the right.
// No test hook writes anything. Shots: test/out/produce/<tag>-NN-<step>.png (each one looked at); log <tag>-log.json.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
try { const f = path.join(__dirname, 'out/produce', (A.tag || 'g13') + '.args.json'); if (fs.existsSync(f)) { Object.assign(A, JSON.parse(fs.readFileSync(f, 'utf8'))); console.log('args from ' + f + ': ' + JSON.stringify(A)); } } catch (e) { console.log('args file: ' + e.message); }
const TAG = A.tag || 'g13';
let URL0 = A.url || 'file://' + path.join(ROOT, 'dist/test.html');
const GAMES = String(A.games || 'knuckle,torches,nuts').split(','), MODES = String(A.modes || 'solo').split(','), DUEL = String(A.duel || '').split(',').filter(Boolean);
const OUT = path.join(ROOT, 'test/out/produce'); fs.mkdirSync(OUT, { recursive: true });
if (/^file:\/\//.test(URL0)) { try { const src = URL0.replace(/^file:\/\//, ''), dst = path.join(OUT, 'builds', `run-${TAG}.html`); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); URL0 = 'file://' + dst; } catch (e) { console.log('build pin: ' + e.message); } }
const PROF = path.join(OUT, 'profile-' + TAG); fs.rmSync(PROF, { recursive: true, force: true }); fs.mkdirSync(PROF, { recursive: true });
const W = 390, H = 844, T0 = Date.now(), sec = () => Math.round((Date.now() - T0) / 1000), BUDGET = +(A.budget || 560) * 1000, left = () => BUDGET - (Date.now() - T0);
const note = (s) => console.log(`${String(sec()).padStart(4)}s ${s}`);
(async () => {
  const ctx = await chromium.launchPersistentContext(PROF, { executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=user-gesture-required'], viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const log = { tag: TAG, url: URL0, games: [], shots: [], errors: [] };
  try {
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = ctx.pages()[0] || await ctx.newPage();
    pg.on('pageerror', (e) => log.errors.push('PAGEERR ' + e.message.slice(0, 200)));
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) log.errors.push(m.text().slice(0, 200)); });
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__NO_OPENING = true; });
    await pg.goto(URL0);
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 300000 });
    note('booted (fresh profile; the opening film skipped: __NO_OPENING, declared)');
    const E = (fn, a) => pg.evaluate(fn, a); const wait = (ms) => pg.waitForTimeout(ms); let n = 0;
    await E(() => __T.simulate(true));
    const hide3d = (on) => E((v) => { const c = [...document.querySelectorAll('canvas')].find((x) => !x.closest('.g10, .fx-mg, .m3')); if (c) c.style.visibility = v ? 'hidden' : ''; }, on);
    const shot = async (name, world = false) => {
      if (world) { await hide3d(false); await E(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); __T.simulate(true); }); }
      const f = path.join(OUT, `${TAG}-${String(++n).padStart(2, '0')}-${name}.png`); await pg.screenshot({ path: f, timeout: 240000 });
      if (world) await hide3d(true);
      log.shots.push(path.relative(ROOT, f)); note(`SHOT ${path.relative(ROOT, f)}`); return f;
    };
    const tapXY = async (x, y, why) => { await pg.touchscreen.tap(x, y); if (why) note(`tap (${x | 0},${y | 0}) ${why}`); };
    const tapSel = async (sel, re, why) => {
      const b = await E(([s, t]) => { const all = [...document.querySelectorAll(s)].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && (!t || new RegExp(t).test(e.textContent)); }); const e = all[all.length - 1]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: Math.round(r.width), h: Math.round(r.height), t: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 50), inView: r.top >= 0 && r.bottom <= innerHeight }; }, [sel, re || null]);
      if (!b) return null;
      if (!b.inView) { note(`${why || sel}: off screen (y ${Math.round(b.y)}) — a finger scrolls`); await swipe(b.y > H ? 640 : 250, b.y > H ? 300 : 600); return tapSel(sel, re, why); }
      await tapXY(b.x, b.y, `${why || sel} "${b.t}" [${b.w}×${b.h}]${b.h < 44 || b.w < 44 ? ' ⚠ <44px' : ''}`); return b;
    };
    const swipe = async (y0, y1, x = 300) => { const cdp = await ctx.newCDPSession(pg); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] }); for (let q = 1; q <= 12; q++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + ((y1 - y0) * q) / 12 }] }); await wait(25); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {}); await wait(900); };
    const drag = async (from, to, ms = 500) => { const cdp = await ctx.newCDPSession(pg); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: from.x, y: from.y }] }); const k = 14; for (let q = 1; q <= k; q++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: from.x + ((to.x - from.x) * q) / k, y: from.y + ((to.y - from.y) * q) / k }] }); await wait(ms / k); } await wait(120); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {}); };
    const res = () => E(() => { const r = __T.game.state.res; return Object.fromEntries(Object.entries(r).map(([k, v]) => [k, Math.round(v)])); });
    // the cards of a fresh start (the name, the mentor), each by its own gold button
    const clearCards = async () => { for (let k = 0, quiet = 0; k < 20 && quiet < 3; k++) { if (await pg.$('.gm-modal.on .gm-input')) { await tapSel('.gm-modal.on .gm-input', null, 'name field'); await pg.keyboard.type('אהרן'); await wait(300); await tapSel('.gm-modal.on .gm-btn-gold', null, 'name: next'); await wait(1200); quiet = 0; continue; } if (await tapSel('.gm-modal.on .gm-btn-gold', null, 'a card')) { quiet = 0; await wait(1300); } else { quiet++; await wait(900); } } };
    await wait(2500); await clearCards();
    const openMenu = async () => { if (!(await E(() => !!document.querySelector('.gm-sheet.on')))) { await tapSel('[data-a="sheet"][data-k="menu"]', null, '☰ the menu'); await wait(1400); } };
    if (A.demo !== '0') {
      await openMenu(); await shot('menu', true);
      await tapSel('.gm-sheet.on .gm-sw[data-a="demo"]', null, 'the menu: מצב הדגמה'); await wait(2500);
      await clearCards();
      note(`DEMO: ${JSON.stringify(await E(() => ({ demo: !!__T.game.state.demo, strip: [...document.querySelectorAll('.gm-demo button')].map((x) => x.textContent.trim()) })))}`);
    }
    const res0 = await res(); note(`res at start ${JSON.stringify(res0)}`);
    // (--quarry=N) the quarry's cycle in the demo, as the owner meets it: the meter's stone chip → the sheet's "▶ שחק" (or the pill's
    // "▶ …"), N times; which game each one opens is logged (GAMES13: board, sling, חמש אבנים, board …); a new game of mine is played by
    // its player below, any other is left by its own exit
    const playOne = async (g, mode, rec) => {
      const t1 = Date.now(), END = Math.min(+(A.each || 110) * 1000, left() - 40000); let taps = 0, midShot = false, last = null, lastLog = 0; const trace = [];
      while (Date.now() - t1 < END) {
        const fin = await E(() => { const r = document.querySelector('.g10 .g10-res, .g10 .g10-fact'); const card = [...document.querySelectorAll('.g10 button[data-v]')].filter((b) => b.getBoundingClientRect().width > 0).map((b) => b.dataset.v); return { res: !!r, card }; });
        if (fin.res || fin.card.some((v) => /again|hub|close|more|next/.test(v))) break;
        let st = null;
        if (g === 'knuckle') {
          st = await E(() => { const b = document.querySelector('.g10-kn'); return b && b.__g10 ? b.__g10.state() : null; });
          if (!st) { await wait(300); continue; }
          if (st.over) break;
          if (st.phase === 'ready' && st.hand) { await tapXY(st.hand.x, st.hand.y, taps < 2 ? 'knuckle: the hand (throw)' : ''); taps++; await wait(120); }
          else if (st.phase === 'air') {
            const bone = st.picked < st.need ? (st.bones || []).find((b) => b) : null;
            if (bone) { await tapXY(bone.x, bone.y, taps < 4 ? 'knuckle: a bone on the mat' : ''); taps++; await wait(60); }
            else if (st.catchable && st.hand) { await tapXY(st.hand.x, st.hand.y, taps < 6 ? 'knuckle: catch (the golden bone in the ring)' : ''); taps++; await wait(150); }
            else await wait(25);
          } else await wait(120);
        } else if (g === 'torches') {
          st = await E(() => [...document.querySelectorAll('.g10-to')].map((b) => (b.__g10 ? b.__g10.state() : null)).filter(Boolean));
          if (!st.length) { await wait(300); continue; }
          if (st.every((q) => q.over)) break;
          let did = false;
          for (const q of st) {
            if (q.over || !q.hands) continue;
            if (!q.started) { await tapXY(q.hands[0].x, q.hands[0].y, `torches (player ${q.me}): the first tap starts the evening`); taps++; did = true; continue; }
            for (const hd of [0, 1]) { const d = q.due[hd]; if (d && d.in < 0.09 && d.in > -d.win * 0.8) { await tapXY(q.hands[hd].x, q.hands[hd].y, taps < 6 ? `torches (player ${q.me}): the ${hd ? 'right' : 'left'} hand on its beat` : ''); taps++; did = true; } }
          }
          if (!did) await wait(15);
          st = st.map((q) => ({ me: q.me, n: q.n, best: q.best, catches: q.catches, drops: q.drops, over: q.over, eight: q.eight }));
        } else if (g === 'nuts') {
          st = await E(() => { const b = document.querySelector('.g10-nuts'); if (!b || !b.__g10) return null; const s = b.__g10.state(); const i = (s.towers || []).findIndex((t) => t); return { ...s, aim: i >= 0 ? b.__g10.aimAt(i) : null, ti: i }; });
          if (!st) { await wait(300); continue; }
          if (st.over) { await wait(800); continue; }
          if (!st.ready || st.moving) { await wait(250); continue; }
          if (st.aim) { await drag(st.aim.from, st.aim.to); note(`nuts: a flick at tower ${st.ti} (the game's own line: pull ${JSON.stringify(st.aim.pull)})`); }
          else { const f = st.shooter; await drag(f, { x: f.x + 80, y: f.y + 14 }); note('nuts: a child\'s pull to the right (no line for this tower)'); }
          taps++; await wait(1500);
        } else { note(`no player for ${g}`); break; }
        if (st && JSON.stringify(st).slice(0, 400) !== last && Date.now() - lastLog > 2500) { last = JSON.stringify(st).slice(0, 400); lastLog = Date.now(); trace.push({ t: sec(), st: last.slice(0, 300) }); }
        if (!midShot && Date.now() - t1 > 12000) { midShot = true; await shot(`${g}-${mode}-playing`); }
      }
      rec.taps = taps; rec.playS = Math.round((Date.now() - t1) / 1000); rec.trace = trace.slice(-8);
    };
    const whichG10 = () => E(() => { const g = document.querySelector('.g10'); if (!g || g.getBoundingClientRect().height < 50) { const m3 = document.querySelector('.m3'); return m3 && m3.getBoundingClientRect().height > 50 ? 'board' : null; } for (const [k, s] of [['knuckle', '.g10-kn'], ['torches', '.g10-to'], ['nuts', '.g10-nuts'], ['sling', '.g10-sling'], ['stack', '.g10-stack, [class*="stack"]']]) if (g.querySelector(s)) return k; const t = g.querySelector('h2, .g10-title, .g10-cy-intro'); return 'g10:' + (g.dataset.game || (t ? t.textContent.trim().slice(0, 30) : '?')); });
    for (let q = 0; q < +(A.quarry || 0) && left() > 120000; q++) {
      const pill = await E(() => { const b = document.querySelector('.gm-pill'); return b && b.offsetParent ? b.innerText.replace(/\s+/g, ' ').trim() : ''; });
      if (/^▶/.test(pill)) await tapSel('.gm-pill', null, `quarry #${q + 1}: the pill`);
      else { await tapSel('.gm-res [data-r="stone"]', null, `quarry #${q + 1}: the stone chip`); await wait(1300); const pf = await tapSel('[data-a="playField"]', null, `quarry #${q + 1}: the sheet's ▶`); if (!pf) { note('no "▶" in the stone sheet'); await shot(`quarry${q + 1}-noplay`, true); break; } }
      await wait(2200);
      // the cycle's own intro card ("התחל"), then which game it is
      const intro = await E(() => { const c = document.querySelector('.g10-cy-intro, .g10 .g10-card'); return c && c.getBoundingClientRect().height > 20 ? c.innerText.replace(/\s+/g, ' ').trim().slice(0, 240) : null; });
      const kind0 = await whichG10(); note(`QUARRY #${q + 1} opened: ${kind0} · intro "${intro}"`);
      await shot(`quarry${q + 1}-${String(kind0).replace(/[^\w]/g, '')}`);
      const rec = { game: 'quarry#' + (q + 1), kind: kind0, intro, t: sec() };
      if (await tapSel('.g10 button', '^(התחל|לבד|שחק)', 'the cycle\'s intro: התחל')) await wait(1500);
      const kind = await whichG10(); rec.kind = kind;
      if (['knuckle', 'torches', 'nuts'].includes(kind)) { await hide3d(true); await playOne(kind, 'cycle', rec); await wait(1500); rec.result = await E(() => { const c = [...document.querySelectorAll('.g10 .g10-card, .g10 .g10-halfcard')].filter((x) => x.getBoundingClientRect().width > 0).pop(); return c ? c.innerText.replace(/\s+/g, ' ').trim().slice(0, 300) : null; }); await shot(`quarry${q + 1}-${kind}-result`); note(`QUARRY #${q + 1} ${kind}: ${rec.playS} s, ${rec.taps} touches · "${rec.result}"`); }
      // leave it: the result's button, else the game's exit (+ confirm), else the board's exit
      for (let k = 0; k < 4; k++) {
        const open = await whichG10(); if (!open) break;
        if (open === 'board') { await tapSel('.m3 .m3-exit', null, 'the board: exit'); await wait(800); await tapSel('.m3 button', 'לצאת', 'confirm'); await wait(1200); continue; }
        if (!(await tapSel('.g10 button[data-v="close"], .g10 button[data-v="hub"], .g10 button[data-v="back"]', null, 'back to building'))) { await tapSel('.g10 .g10-x', null, 'the game: יציאה'); await wait(800); await tapSel('.g10 button', '^כן', 'confirm'); }
        await wait(1300);
      }
      await hide3d(false); log.games.push(rec);
    }
    for (const g of GAMES) for (const mode of MODES.concat(DUEL.includes(g) && !MODES.includes('duel') ? ['duel'] : [])) {
      if (left() < 70000) { note(`no time for ${g} ${mode}`); break; }
      const rec = { game: g, mode, t: sec() };
      // ☰ → the "משחקי ביניים" row → the game's button (a finger scrolls the sheet to it)
      if (!(await E(() => !!document.querySelector('.g10-howto')))) {
        if (!(await E(() => !!document.querySelector('.g10 [data-g10-game]')))) {
          await openMenu();
          const row = await E((g) => { const b = document.querySelector(`.gm-sheet.on [data-g10="${g}"]`); const all = [...document.querySelectorAll('.gm-sheet.on [data-g10]')].map((x) => `${x.dataset.g10}:${x.textContent.replace(/\s+/g, ' ').trim().slice(0, 22)}`); return { has: !!b, all }; }, g);
          note(`the menu's games: ${JSON.stringify(row.all)}`); rec.menu = row.all;
          if (!row.has) { note(`NO BUTTON for ${g} in the menu`); rec.noButton = true; log.games.push(rec); await shot(`${g}-no-button`, true); continue; }
          await tapSel(`.gm-sheet.on [data-g10="${g}"]`, null, `the menu: ${g}`); await wait(1500);
        } else { await tapSel(`.g10 [data-g10-game="${g}"]`, null, `the hub: ${g}`); await wait(1300); }
      }
      rec.howto = await E(() => { const c = document.querySelector('.g10-howto .g10-card'); return c ? c.innerText.replace(/\s+/g, ' ').trim().slice(0, 400) : null; });
      note(`HOW-TO ${g}: "${rec.howto}"`);
      await shot(`${g}-howto`);
      if (!(await tapSel(`.g10-howto button[data-v="${mode}"]`, null, `mode ${mode}`))) { note(`no mode ${mode}`); rec.noMode = true; log.games.push(rec); await tapSel('.g10-howto button[data-v="back"]', null, 'back'); continue; }
      await wait(1200); await hide3d(true);
      await shot(`${g}-${mode}-start`);
      await playOne(g, mode, rec);
      rec.last = await E((g) => { const sel = g === 'knuckle' ? '.g10-kn' : g === 'torches' ? '.g10-to' : '.g10-nuts'; return [...document.querySelectorAll(sel)].map((b) => { try { return b.__g10.state(); } catch (e) { return null; } }).filter(Boolean).map((s) => JSON.stringify(s).slice(0, 260)); }, g);
      await wait(1800);
      rec.result = await E(() => { const c = [...document.querySelectorAll('.g10 .g10-card, .g10 .g10-halfcard')].filter((x) => x.getBoundingClientRect().width > 0).pop(); return c ? c.innerText.replace(/\s+/g, ' ').trim().slice(0, 420) : null; });
      note(`RESULT ${g} ${mode} after ${rec.playS} s, ${rec.taps} touches: "${rec.result}" · last ${JSON.stringify(rec.last).slice(0, 300)}`);
      await shot(`${g}-${mode}-result`);
      const res1 = await res(); rec.paid = Object.fromEntries(Object.entries(res1).filter(([k, v]) => v !== res0[k]).map(([k, v]) => [k, v - res0[k]])); Object.assign(res0, res1);
      note(`paid ${JSON.stringify(rec.paid)}`);
      log.games.push(rec);
      // back: the result card's own button (to the hub / the building), else the game's exit
      const back = await E(() => { const b = [...document.querySelectorAll('.g10 button[data-v]')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /hub|close|back/.test(x.dataset.v)) || [...document.querySelectorAll('.g10 button')].filter((x) => x.getBoundingClientRect().width > 0).find((x) => /חזרה|למשחק אחר|לבנייה/.test(x.textContent)); if (b) b.dataset.qa = 'back'; return b ? b.textContent.replace(/\s+/g, ' ').trim().slice(0, 30) : null; });
      if (back) { await tapSel('.g10 button[data-qa="back"]', null, `the result: ${back}`); await wait(1500); }
      else { await tapSel('.g10 .g10-x', null, 'the game: יציאה'); await wait(900); await tapSel('.g10 button[data-v="yes"]', null, 'confirm'); await wait(1200); }
      if (await E(() => !!document.querySelector('.g10 [data-g10-game]'))) { await tapSel('.g10 .g10-x[data-v="close"]', null, 'the hub: חזרה'); await wait(1200); }
      await hide3d(false);
    }
    await shot('end', true);
    note(`GAMES ${JSON.stringify(log.games.map((r) => `${r.game}/${r.mode}: ${r.noButton ? 'NO BUTTON' : r.noMode ? 'no mode' : `${r.playS}s ${r.taps} touches · ${(r.result || '').slice(0, 60)} · paid ${JSON.stringify(r.paid)}`}`))}`);
  } catch (e) { console.error('RUN ERROR', e.message); log.fatal = e.message; }
  finally {
    note(`errors ${log.errors.length} ${log.errors.slice(0, 3).join(' | ')}`);
    fs.writeFileSync(path.join(OUT, `${TAG}-log.json`), JSON.stringify(log, null, 1));
    await ctx.close();
  }
})();
