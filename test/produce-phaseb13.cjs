// PRODUCER13 (wave 13 — the owner, 30.9 07:32: "הדירים והאורוות מסביב לבית" and "פיטום הקטרת, עדיין לדעתי לא נכנס למשחק"): Phase B's
// home, פיטום הקטורת and the lambs' chamber, by REAL TOUCH on the owner's path (390×844, touch, he-IL).
//   node test/produce-phaseb13.cjs --url=file:///…/peek.html [--tag=pb] [--games=pitum,dir] [--demo=1] [--budget=560] [--stuck=150]
// The path: a fresh phone → ☰ → "מצב הדגמה" (his mode) → ☰ → the gold "העבודה בבית · שלב ב׳" → Phase B's home → the box "בית אבטינס
// והדיר" (the ketoret in store, tomorrow's need, the chamber's six) → "לפטם קטורת" / "לדיר וללשכת הטלאים" → play as a child plays,
// from what the screen shows (the hint's words, the jar's name, the green level line, the word on the mortar's line, the lambs and
// their four places) → the end → the home again (the store after the pitum; the day's tending after the pens).
//   pitum — a weight stone is tried as a child tries them (70, 16, 12, 9, 3: the one the scale takes); "שפוך" held until the green
//           line shows; "הסר מעט" when too much; then "הדק!" when a word reaches the line;
//   dir   — the water held until the trough is full, the hay tapped, each new lamb tapped and its four places looked at, then judged
//           from what the hint says (a mark → the child asks "is it a blemish?": he answers as the hint's words suggest), the six counted.
// No test hook writes anything (the demo's own switch and Phase B's own buttons only). Shots: test/out/produce/<tag>-NN-<step>.png.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
try { const f = path.join(__dirname, 'out/produce', (A.tag || 'pb') + '.args.json'); if (fs.existsSync(f)) { Object.assign(A, JSON.parse(fs.readFileSync(f, 'utf8'))); console.log('args from ' + f + ': ' + JSON.stringify(A)); } } catch (e) { console.log('args file: ' + e.message); }
const TAG = A.tag || 'pb';
let URL0 = A.url || 'file://' + path.join(ROOT, 'dist/test.html');
const GAMES = String(A.games || 'pitum,dir').split(',');
const OUT = path.join(ROOT, 'test/out/produce'); fs.mkdirSync(OUT, { recursive: true });
if (/^file:\/\//.test(URL0)) { try { const src = URL0.replace(/^file:\/\//, ''), dst = path.join(OUT, 'builds', `run-${TAG}.html`); fs.mkdirSync(path.dirname(dst), { recursive: true }); fs.copyFileSync(src, dst); URL0 = 'file://' + dst; } catch (e) { console.log('build pin: ' + e.message); } }
const PROF = path.join(OUT, 'profile-' + TAG); fs.rmSync(PROF, { recursive: true, force: true }); fs.mkdirSync(PROF, { recursive: true });
const W = 390, H = 844, T0 = Date.now(), sec = () => Math.round((Date.now() - T0) / 1000), BUDGET = +(A.budget || 560) * 1000, left = () => BUDGET - (Date.now() - T0);
const STUCK = +(A.stuck || 150) * 1000;
const note = (s) => console.log(`${String(sec()).padStart(4)}s ${s}`);
(async () => {
  const ctx = await chromium.launchPersistentContext(PROF, { executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=user-gesture-required'], viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const log = { tag: TAG, url: URL0, games: [], homes: [], shots: [], words: [], errors: [] };
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
    const shot = async (name) => {
      await E(() => { try { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); } catch (e) { /* Phase B has its own loop */ } });
      const f = path.join(OUT, `${TAG}-${String(++n).padStart(2, '0')}-${name}.png`); await pg.screenshot({ path: f, timeout: 240000 });
      await E(() => { window.__HUD_HOLD = false; });
      log.shots.push(path.relative(ROOT, f)); note(`SHOT ${path.relative(ROOT, f)}`); return f;
    };
    const tapXY = async (x, y, why) => { await pg.touchscreen.tap(x, y); if (why) note(`tap (${x | 0},${y | 0}) ${why}`); };
    const swipe = async (y0, y1, x = 300) => { const cdp = await ctx.newCDPSession(pg); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: y0 }] }); for (let q = 1; q <= 12; q++) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: y0 + ((y1 - y0) * q) / 12 }] }); await wait(25); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {}); await wait(900); };
    const tapSel = async (sel, re, why, depth = 0) => {
      const b = await E(([s, t]) => { const all = [...document.querySelectorAll(s)].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden' && (!t || new RegExp(t).test(e.textContent)); }); const e = all[0]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2, w: Math.round(r.width), h: Math.round(r.height), t: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 50), inView: r.top >= 40 && r.bottom <= innerHeight - 20, dis: !!e.disabled }; }, [sel, re || null]);
      if (!b) return null;
      if (!b.inView && depth < 4) { note(`${why || sel}: off screen (y ${Math.round(b.y)}) — a finger scrolls`); await swipe(b.y > H / 2 ? 640 : 250, b.y > H / 2 ? 300 : 600); return tapSel(sel, re, why, depth + 1); }
      await tapXY(b.x, b.y, `${why || sel} "${b.t}" [${b.w}×${b.h}]${b.h < 44 || b.w < 44 ? ' ⚠ <44px' : ''}${b.dis ? ' (disabled)' : ''}`); return b;
    };
    const holdEl = async (sel, until, maxMs, why) => {   // a real press held until `until()` is true in the page (or maxMs)
      const r = await E((s) => { const e = document.querySelector(s); if (!e) return null; const q = e.getBoundingClientRect(); return { x: q.x + q.width / 2, y: q.y + q.height / 2 }; }, sel); if (!r) return null;
      const cdp = await ctx.newCDPSession(pg); await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [r] }); const t = Date.now(); let ok = false;
      while (Date.now() - t < maxMs) { if (await E(until)) { ok = true; break; } await wait(30); }
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await cdp.detach().catch(() => {}); note(`held ${why} ${Date.now() - t} ms${ok ? ' (released on the sign)' : ' (released: time)'}`); return ok;
    };
    const clearCards = async () => { for (let k = 0, quiet = 0; k < 20 && quiet < 3; k++) { if (await pg.$('.gm-modal.on .gm-input')) { await tapSel('.gm-modal.on .gm-input', null, 'name field'); await pg.keyboard.type('אהרן'); await wait(300); await tapSel('.gm-modal.on .gm-btn-gold', null, 'name: next'); await wait(1200); quiet = 0; continue; } if (await tapSel('.gm-modal.on .gm-btn-gold', null, 'a card')) { quiet = 0; await wait(1300); } else { quiet++; await wait(900); } } };
    await wait(2500); await clearCards();
    const openMenu = async () => { if (!(await E(() => !!document.querySelector('.gm-sheet.on')))) { await tapSel('[data-a="sheet"][data-k="menu"]', null, '☰ the menu'); await wait(1400); } };
    if (A.demo !== '0') {
      await openMenu(); await tapSel('.gm-sheet.on .gm-sw[data-a="demo"]', null, 'the menu: מצב הדגמה'); await wait(2500); await clearCards();
      note(`DEMO: ${JSON.stringify(await E(() => ({ demo: !!__T.game.state.demo, strip: [...document.querySelectorAll('.gm-demo button')].map((x) => x.textContent.trim()) })))}`);
    }
    await openMenu();
    const avBtn = await E(() => { const b = document.querySelector('.gm-sheet.on [data-a="avodah"]'); return b ? b.innerText.replace(/\s+/g, ' ').trim() : null; });
    note(`the menu's Phase B button: "${avBtn}"`); log.menuButton = avBtn;
    await shot('menu');
    if (!(await tapSel('.gm-sheet.on [data-a="avodah"]', null, 'the menu: Phase B'))) throw new Error('no Phase B button in the menu');
    await pg.waitForFunction(() => { const t = document.querySelector('.av-top, .av-home, .av-box'); return !!(t && t.getBoundingClientRect().height > 0); }, null, { polling: 300, timeout: 120000 }).catch(() => note('Phase B did not show its home in 120 s'));
    await wait(2500);
    // the cards Phase B opens with (a welcome, the day's first card): its gold button, until the home is clear
    const avCards = async () => { for (let k = 0; k < 8; k++) { const c = await E(() => { const m = [...document.querySelectorAll('.av-modal, .av-card.on, .av-intro')].find((x) => x.getBoundingClientRect().height > 40 && getComputedStyle(x).display !== 'none'); if (!m) return null; const b = [...m.querySelectorAll('button')].find((x) => x.getBoundingClientRect().width > 0 && /gold|primary|go/.test(x.className)) || [...m.querySelectorAll('button')].find((x) => x.getBoundingClientRect().width > 0); if (b) b.dataset.qa = 'avc'; return { t: m.innerText.replace(/\s+/g, ' ').trim().slice(0, 160), b: b ? b.textContent.trim().slice(0, 30) : null }; }); if (!c || !c.b) return; note(`Phase B card: "${c.t}" → "${c.b}"`); log.words.push({ t: sec(), card: c.t }); await tapSel('[data-qa="avc"]', null, 'the card'); await wait(1400); } };
    const home = async (why) => {
      await avCards();
      const h = await E(() => { const b = document.querySelector('.av-svc'); if (!b) return null; const r = b.getBoundingClientRect(); return { txt: b.innerText.replace(/\s+/g, ' ').trim().slice(0, 600), y: Math.round(r.top), h: Math.round(r.height), btns: [...b.querySelectorAll('button')].map((x) => `${x.textContent.trim()} [${Math.round(x.getBoundingClientRect().width)}×${Math.round(x.getBoundingClientRect().height)}]${/gold/.test(x.className) ? ' gold' : ''}`) }; });
      note(`HOME (${why}): ${JSON.stringify(h)}`); log.homes.push({ t: sec(), why, ...h });
      if (h && (h.y > H - 120 || h.y < 60)) { await swipe(h.y > H / 2 ? 640 : 250, h.y > H / 2 ? 300 : 600); }
      await shot(`home-${why}`);
      return h;
    };
    await home('first');
    for (const g of GAMES) {
      if (left() < 90000) { note(`no time for ${g}`); break; }
      const rec = { game: g, t: sec() };
      const btn = await tapSel(`.av-svc [data-play="${g}"]`, null, `the home's box: ${g}`) || await tapSel(`[data-play="${g}"]`, null, `a tile: ${g}`);
      if (!btn) { note(`NO BUTTON for ${g}`); rec.noButton = true; log.games.push(rec); continue; }
      await wait(2500);
      const t1 = Date.now(); let lastHint = '', shots = 0, lastShot = 0, stoneTry = 0, lambSeen = new Set(), done = false;
      while (Date.now() - t1 < STUCK && left() > 40000) {
        const s = await E(() => {
          const vis = (x) => { if (!x) return false; const r = x.getBoundingClientRect(), cs = getComputedStyle(x); return r.width > 4 && r.height > 4 && cs.display !== 'none' && cs.visibility !== 'hidden'; };
          const mg = [...document.querySelectorAll('.av-mg')].find(vis);
          if (!mg) { const m = [...document.querySelectorAll('.av-modal, .av-card')].find(vis); return { mg: null, card: m ? m.innerText.replace(/\s+/g, ' ').trim().slice(0, 200) : null }; }
          const tx = (q) => { const x = mg.querySelector(q); return x && vis(x) ? x.innerText.replace(/\s+/g, ' ').trim() : ''; };
          const btns = [...mg.querySelectorAll('button')].filter(vis).map((b) => ({ k: b.dataset.k || '', t: b.textContent.replace(/\s+/g, ' ').trim().slice(0, 24), dis: !!b.disabled }));
          const tg = [...mg.querySelectorAll('[role=button][aria-label]')].filter(vis).map((x) => { const r = x.getBoundingClientRect(); return { l: x.getAttribute('aria-label'), x: r.x + r.width / 2, y: r.y + r.height / 2, on: x.classList.contains('on') || x.classList.contains('done') }; });
          const lev = mg.querySelector('.av-p-level'); const line = mg.querySelector('.av-p-hitline'); const lr = line ? line.getBoundingClientRect() : null;
          const words = [...mg.querySelectorAll('.av-p-word')].map((w) => { const r = w.getBoundingClientRect(); return { cx: r.x + r.width / 2, w: r.width, done: w.classList.contains('done') || +getComputedStyle(w).opacity < 0.3 }; });
          return { mg: mg.dataset.game, title: tx('.av-mg-t'), hint: tx('.av-hint'), intro: tx('.av-mg-intro').slice(0, 200), btns, tg, level: !!(lev && lev.classList.contains('on')), lineX: lr ? lr.x + lr.width / 2 : null, words, end: btns.some((b) => /המשך|סיום|חזרה/.test(b.t) && !b.dis) && !btns.some((b) => /שפוך|הדק|מלא|תמים/.test(b.t)) };
        }).catch((e) => ({ err: e.message }));
        if (s.err) { await wait(500); continue; }
        if (!s.mg) {
          if (s.card) { note(`card: "${s.card}"`); await tapSel('.av-modal button, .av-card button', 'המשך|התחל|הבא|סיום|אישור|חזרה|לבית', 'the card'); await wait(1300); continue; }
          if (rec.started) { done = true; break; }
          await wait(700); continue;
        }
        if (!rec.started) { rec.started = true; rec.title = s.title; rec.intro = s.intro; note(`GAME ${g}: "${s.title}" · intro "${s.intro}"`); await shot(`${g}-open`); }
        if (s.hint !== lastHint) { lastHint = s.hint; log.words.push({ t: sec(), g, hint: s.hint }); note(`hint: "${s.hint}"`); }
        if (Date.now() - lastShot > 20000 && shots < 6) { lastShot = Date.now(); shots++; await shot(`${g}-play${shots}`); }
        if (s.end) { await shot(`${g}-end`); rec.endWords = s.hint; const b = s.btns.find((x) => /המשך|סיום|חזרה/.test(x.t) && !x.dis); await tapSel(`.av-mg button`, b.t.replace(/[()]/g, '.'), `the end: ${b.t}`); await wait(1800); done = true; break; }
        const has = (k) => s.btns.find((b) => b.k === k);
        if (g === 'pitum') {
          if (has('grind') && !has('grind').dis) {   // the mortar: "הדק!" when a word is on the line
            const w = s.lineX != null ? s.words.filter((q) => !q.done).map((q) => Math.abs(q.cx - s.lineX)).sort((a, b) => a - b)[0] : 0;
            if (w != null && w < 14) { await tapSel('.av-mg [data-k="grind"]', null, ''); rec.grind = (rec.grind || 0) + 1; await wait(120); } else await wait(25);
            continue;
          }
          if (has('pour') && !has('pour').dis) {   // the scale took the stone: hold "שפוך" until the green line
            await holdEl('.av-mg [data-k="pour"]', () => { const l = document.querySelector('.av-mg .av-p-level'); return !!(l && l.classList.contains('on')); }, 6000, '"שפוך"'); rec.pours = (rec.pours || 0) + 1; await wait(900); continue;
          }
          if (has('less') && !has('less').dis) { await tapSel('.av-mg [data-k="less"]', null, '"הסר מעט"'); await wait(500); continue; }
          const stones = s.tg.filter((t) => /אבן משקל/.test(t.l));
          if (stones.length && /אבן המשקל|כמה מנה|הנח על הכף|לא זו|אינה|משקל/.test(s.hint + ' ' + s.title) ) { const st = stones[stoneTry % stones.length]; stoneTry++; await tapXY(st.x, st.y, `a weight stone: ${st.l}`); rec.stones = (rec.stones || 0) + 1; await wait(900); continue; }
        }
        if (g === 'dir') {
          if (has('water') && !has('water').dis && !rec.watered) { rec.watered = true; await holdEl('.av-mg [data-k="water"]', () => /מלאה/.test((document.querySelector('.av-mg .av-hint') || {}).textContent || ''), 7000, 'the water jar'); await wait(700); continue; }
          if (has('tamim') && !has('tamim').dis) {   // the judgement, from the hint's words
            const mum = /מום|חתוך|נקוב|סדוק|פגום|קרוע/.test(s.hint) && !/לא נמצא|אינו מום|אין מום/.test(s.hint);
            await tapSel(`.av-mg [data-k="${mum ? 'mum' : 'tamim'}"]`, null, `judge: ${mum ? 'בעל מום' : 'תמים'} (the hint: "${s.hint.slice(0, 60)}")`); rec.judged = (rec.judged || 0) + 1; await wait(1500); continue;
          }
        }
        // any other step: the next target it offers (the hay, a lamb, its four places, a lamb to count), as a child tries them
        const t = s.tg.find((x) => !x.on && !lambSeen.has(x.l + Math.round(x.x / 20) + ',' + Math.round(x.y / 20)));
        if (t) { lambSeen.add(t.l + Math.round(t.x / 20) + ',' + Math.round(t.y / 20)); await tapXY(t.x, t.y, `target "${t.l}"`); rec.taps = (rec.taps || 0) + 1; await wait(700); continue; }
        if (lambSeen.size > 30) lambSeen = new Set();
        const go = s.btns.find((b) => !b.dis && !/יציאה|דלג/.test(b.t));
        if (go) { await tapSel('.av-mg button', go.t.replace(/[()]/g, '.'), `the game's button "${go.t}"`); await wait(900); continue; }
        await wait(500);
      }
      rec.s = Math.round((Date.now() - t1) / 1000); rec.done = done;
      if (!done) { note(`${g} not ended by my hand in ${rec.s} s: דלג`); rec.stuck = true; await shot(`${g}-stuck`); await tapSel('.av-mg .av-skip', null, 'דלג'); await wait(1500); }
      log.games.push(rec); note(`GAME DONE ${JSON.stringify(rec).slice(0, 400)}`);
      await home(`after-${g}`);
    }
    note(`HOMES ${JSON.stringify(log.homes.map((h) => `${h.why}: ${(h.txt || '—').slice(0, 220)}`))}`);
  } catch (e) { console.error('RUN ERROR', e.message); log.fatal = e.message; }
  finally {
    note(`errors ${log.errors.length} ${log.errors.slice(0, 3).join(' | ')}`);
    fs.writeFileSync(path.join(OUT, `${TAG}-log.json`), JSON.stringify(log, null, 1));
    await ctx.close();
  }
})();
