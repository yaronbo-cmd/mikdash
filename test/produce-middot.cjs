// PRODUCER10: the Middot book as the owner meets it — his own save (a copy of the baseline profile, the Mount's courses), real touch.
//   node test/produce-middot.cjs --url=file:///…/dist/test.html [--tag=mid] [--profile=test/out/produce/profile-base]
// The dock's "ספר מידות" → the chapters → every unlocked mishna opened by touch → a place name tapped (does the camera fly? a card?
// the way back?) → the chapter's quiz if it is offered (answers by touch; one wrong on purpose) → the points in the book.
// The state is read, never written. Shots: test/out/produce/<tag>-NN-<step>.png
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
try { const f = path.join(__dirname, 'out/produce', (A.tag || 'mid') + '.args.json'); if (fs.existsSync(f)) Object.assign(A, JSON.parse(fs.readFileSync(f, 'utf8'))); } catch (e) { /* (PRODUCER11: a queued run re-planned by its args file) */ }
// (PRODUCER11) a queued ticket handed to the other harness (the queue is FIFO; the args file says which run is due first):
//   {"exec": "produce-play.cjs", "argv": ["--tag=x", …]} — the rest of this file does not run
if (A.exec && A.exec !== path.basename(__filename)) { process.argv = [process.argv[0], path.join(__dirname, A.exec), ...(A.argv || [])]; console.log('exec ' + A.exec + ' ' + (A.argv || []).join(' ')); require(path.join(__dirname, A.exec)); return; }
const TAG = A.tag || 'mid', URL0 = A.url || 'file://' + path.join(ROOT, 'dist/test.html');
const OUT = path.join(ROOT, 'test/out/produce'); fs.mkdirSync(OUT, { recursive: true });
const SRC = path.resolve(A.profile || path.join(OUT, 'profile-base')), PROF = path.join(OUT, 'profile-' + TAG);
fs.rmSync(PROF, { recursive: true, force: true }); if (fs.existsSync(SRC)) fs.cpSync(SRC, PROF, { recursive: true }); else fs.mkdirSync(PROF, { recursive: true });
for (const f of ['SingletonLock', 'SingletonCookie', 'SingletonSocket']) fs.rmSync(path.join(PROF, f), { force: true });
const W = 390, H = 844, T0 = Date.now(), sec = () => Math.round((Date.now() - T0) / 1000);
const note = (s) => console.log(`${String(sec()).padStart(4)}s ${s}`);
(async () => {
  const ctx = await chromium.launchPersistentContext(PROF, { executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const errs = [];
  try {
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = ctx.pages()[0] || await ctx.newPage();
    pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 160)); });
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; });
    await pg.goto(URL0);
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 240000 });
    const E = (fn, a) => pg.evaluate(fn, a); const wait = (ms) => pg.waitForTimeout(ms); let n = 0;
    const shot = async (name) => {
      await E(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const f = path.join(OUT, `${TAG}-${String(++n).padStart(2, '0')}-${name}.png`); await pg.screenshot({ path: f, timeout: 240000 }); await E(() => { window.__HUD_HOLD = false; });
      note(`SHOT ${path.relative(ROOT, f)}`); return f;
    };
    // tap what a player sees: the first visible element matching sel (and text), scrolled to as a swipe would
    const tapSel = async (sel, text, why) => {
      const b = await E(([s, t]) => { const all = [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0 && (!t || new RegExp(t).test(e.textContent))); const e = all[0]; if (!e) return null; e.scrollIntoView({ block: 'center' }); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: Math.round(r.width), h: Math.round(r.height), t: e.textContent.replace(/\s+/g, ' ').trim().slice(0, 50) }; }, [sel, text || null]);
      if (!b) return null; await wait(150); await E(() => { __T.camera.updateMatrixWorld(); __T.game.frame(performance.now()); });
      await pg.touchscreen.tap(b.x, b.y); note(`tap ${why || sel} "${b.t}" [${b.w}×${b.h}]`); return b;
    };
    const book = () => E(() => { const g = __T.game.state; return g.book ? { pts: g.book.pts, quiz: g.book.quiz, read: Object.keys(g.book.read || {}).length, un: Object.keys(g.book.un || {}).length, title: g.book.title } : null; });
    // the cards on return (the welcome-back card comes a few seconds after the boot): wait for the screen to be clear
    // (a modal gets its class 'on' on the next animation frame, which SwiftShader delays: match the card itself, visible)
    await pg.waitForFunction(() => !!document.querySelector('.gm-modal .gm-btn-gold'), null, { polling: 250, timeout: 14000 }).catch(() => {});
    for (let k = 0, quiet = 0; k < 30 && quiet < 5; k++) { if (await tapSel('.gm-modal .gm-btn-gold', null, 'a card on return')) { quiet = 0; await wait(1500); } else { quiet++; await wait(1500); } }
    note(`book at start ${JSON.stringify(await book())}`);
    // 1. the dock's book
    if (!(await tapSel('.gm-dock [data-k="book"]', null, 'the dock: ספר מידות'))) { note('NO BOOK BUTTON'); }
    await wait(1200); if (!(await E(() => !!document.querySelector('.gm-sheet.on, .gm-sh.on')))) { note('the book did not open on the first tap: again'); await tapSel('.gm-dock [data-k="book"]', null, 'the dock: ספר מידות (again)'); }
    await wait(1500); await shot('book');
    // 2. the chapters: every unlocked mishna, opened by touch (the row, then "המשנה הבאה")
    const chapters = await E(() => [...document.querySelectorAll('[data-a="bookCh"]')].map((b) => b.dataset.c));
    let opened = 0, placeTapped = false;
    for (const c of chapters) {
      await tapSel(`[data-a="bookCh"][data-c="${c}"]`, null, `chapter tab ${c}`); await wait(700);
      const rows = await E(() => [...document.querySelectorAll('[data-a="mishnah"]')].map((b) => b.dataset.id));
      if (!rows.length) continue;
      await tapSel(`[data-a="mishnah"][data-id="${rows[0]}"]`, null, `mishna ${rows[0]}`); await wait(900); opened++;
      if (opened === 1) await shot(`mishna-${rows[0]}`);
      for (let k = 0; k < 12; k++) { const nx = await tapSel('[data-a="mishnah"]', 'המשנה הבאה', 'המשנה הבאה'); if (!nx) break; await wait(700); opened++; }
      // a place name in this mishna → the flight
      if (!placeTapped) {
        const pl = await E(() => [...document.querySelectorAll('.md-pl')].map((e) => { const r = e.getBoundingClientRect(); return { t: e.textContent.trim(), k: e.dataset.k, h: Math.round(r.height), w: Math.round(r.width) }; }));
        note(`place links here: ${JSON.stringify(pl).slice(0, 300)}`);
        if (pl.length) {
          await shot('place-links');
          const cam0 = await E(() => __T.camera.position.toArray().map(Math.round));
          await tapSel('.md-pl', null, 'a place name'); placeTapped = true; await wait(3500);
          const cam1 = await E(() => __T.camera.position.toArray().map(Math.round));
          note(`camera ${JSON.stringify(cam0)} → ${JSON.stringify(cam1)}`);
          await shot('place-flight');
          await wait(2500); await shot('place-card');
          if (await tapSel('[data-md="back"]', null, '↩ חזרה לספר')) { await wait(1500); await shot('back-to-book'); }
        }
      }
      // the chapter's quiz, when offered
      const qz = await tapSel('[data-md="quiz"]', null, 'the quiz');
      if (qz) {
        await wait(900); await shot('quiz-q1');
        for (let q = 0; q < 12; q++) {
          const ans = await E(() => [...document.querySelectorAll('.md-ans')].filter((e) => e.getBoundingClientRect().width > 0).length);
          if (!ans) break;
          await tapSel('.md-ans', q === 1 ? null : null, `answer (q${q + 1})`); await wait(700);
          if (q === 0) await shot('quiz-feedback');
          if (!(await tapSel('[data-x="next"]', null, 'next'))) break; await wait(700);
        }
        await shot('quiz-result');
        note(`book after the quiz ${JSON.stringify(await book())}`);
        await tapSel('[data-x="close"]', null, 'חזרה לספר'); await wait(900);
        await shot('book-after-quiz');
        break;
      }
    }
    note(`opened ${opened} mishnayot · book ${JSON.stringify(await book())}`);
    note(`errors ${errs.length} ${errs.slice(0, 3).join(' | ')}`);
  } catch (e) { console.error('RUN ERROR', e.message); }
  finally { await ctx.close(); }
})();
