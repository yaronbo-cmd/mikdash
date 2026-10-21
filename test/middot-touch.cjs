// MIDDOT10 (wave 10): the Middot book by REAL TOUCH on the real build, 390×844 (hasTouch, isMobile), a fresh profile with a seeded
// save (the Mount, the court's wall and gates, Ezrat Nashim, the soreg, Nikanor and the chambers built; the Heichal not yet). No
// autoplay flags: every action is a touchscreen tap on what the player sees (a long sheet is scrolled to the target first).
//   node test/middot-touch.cjs [--no-build] [--shots]
// A · איפה זה בעולם: the dock's book → chapter א → 1:1 → the name "בית המוקד" (built) → the book closes, the camera flies there, its
//     card opens, a chip leads back to 1:1; then "בית הכפרת" (the Kodesh HaKodashim, not built) → the whole-Temple view, the chip
//     says so; back → the building view and the book at 1:1.
// B · the quizzes: chapter א waits ("קרא עוד 9 משניות") → the 9 mishnayot opened by touch → its quiz, one answer wrong on purpose
//     (the right one shown, no shame) → the points and the silver in the book; chapter ה's quiz → מבחן סיום המסכת opens after the
//     five → 10 questions → the title and "many points". The world runs in real time without rendering (__T.simulate).
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots');
const W = 390, H = 844;
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const S = await import(pathToFileURL(path.join(ROOT, 'src/game/state.js')).href);
  const { MIDDOT } = await import(pathToFileURL(path.join(ROOT, 'src/game/middot.js')).href);
  const QZ = JSON.parse(fs.readFileSync(path.join(ROOT, 'content/middot-quiz.json'), 'utf8')).questions;
  // the seeded save: built through the chambers; the whole book open; chapters ב ג ד read and quizzed, ה read, א not read yet
  const now = Date.now(), Gs = S.fresh(now);
  for (const id of ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka']) S.completeStage(Gs, id);
  Object.assign(Gs, { ftue: 99, op: 1, name: 'יכין', mishmar: 1 });
  for (const m of MIDDOT) { Gs.book.un[m.id] = 1; if (!m.id.startsWith('1.')) Gs.book.read[m.id] = 1; }
  Object.assign(Gs.book, { quiz: { 2: 4, 3: 3, 4: 5 }, asked: {}, pts: 120, paid: 24 });
  S.dailyCheck(Gs, now);
  const SAVE = JSON.stringify(Gs);

  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(([save, key]) => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      try { if (!sessionStorage.getItem('md-once')) { sessionStorage.setItem('md-once', '1'); localStorage.clear(); localStorage.setItem(key, save); localStorage.setItem('bh_settings', JSON.stringify({ rhythm: true })); } } catch (e) { /* storage */ }
    }, [SAVE, S.SAVE_KEY]);
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const tap = (x, y) => pg.touchscreen.tap(x, y);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    // (a shot of the world renders it twice — SwiftShader: 10–40 s a frame; a shot of a card over the book renders nothing new)
    const shot = async (name, world = false) => {
      if (!SHOTS) return;
      if (world) await waitFor(() => { const p = __T.camera.position, k = [p.x, p.y, p.z].map((v) => v.toFixed(1)).join(); const ok = window.__mdCam === k; window.__mdCam = k; return ok; }, null, 6000);   // (the flight has landed)
      const t = Date.now();
      await G((w) => { __T.simulate(false); if (w) { __T.render(); __T.render(); } __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); }, world);
      const f = path.join(OUT, `middot-${name}.png`);
      await pg.screenshot({ path: f, timeout: 240000 });
      console.log('   shot', path.relative(ROOT, f), `${((Date.now() - t) / 1000).toFixed(0)} s`);
      await G(() => { window.__HUD_HOLD = false; });
    };
    /** tap an element by selector (scrolled into view first, as a player's swipe would): → true when it was there */
    // (a finger taps what it sees: the target is brought into the visible part of its sheet — not under the dock or the top bar —
    // and the point tapped is checked to be on it; a covered target is reported, not clicked around)
    const covered = [];
    // (a sheet slides in for 0.26 s: a player waits until it stands still before tapping in it)
    const still = () => waitFor(() => { const e = document.querySelector('.gm-sheet.on'); if (!e) return true; const r = e.getBoundingClientRect(); const k = r.top + ',' + r.bottom; const ok = window.__mdLast === k && r.bottom <= innerHeight + 1; window.__mdLast = k; return ok; }, null, 3000);
    const tapSel = async (sel, pick) => {
      await still();
      const box = await G(([s, p]) => {
        const all = [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0 && (!p || e.textContent.includes(p)));
        const e = all[0]; if (!e) return null;
        const hit = () => {
          const rs = [...e.getClientRects()].filter((r) => r.width > 2 && r.height > 2);
          for (const r of rs) for (const [fx, fy] of [[0.5, 0.5], [0.3, 0.5], [0.7, 0.5]]) {
            const x = r.left + r.width * fx, y = r.top + r.height * fy;
            if (x < 2 || y < 2 || x > innerWidth - 2 || y > innerHeight - 2) continue;
            const t = document.elementFromPoint(x, y);
            if (t && (t === e || e.contains(t))) return { x, y };
          }
          return null;
        };
        let at = null;
        for (const b of ['center', 'start', 'end', 'nearest']) { e.scrollIntoView({ block: b, inline: 'nearest' }); if ((at = hit())) break; }
        if (!at) { const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { x: r.left + r.width / 2, y: r.top + r.height / 2, cover: t ? (t.className || t.tagName) + ':' + (t.textContent || '').trim().slice(0, 24) : 'nothing' }; }
        return at;
      }, [sel, pick || null]);
      if (!box) { covered.push(`${sel}: not found`); return false; }
      if (box.cover) { covered.push(`${sel}: covered by ${box.cover}`); console.log('   covered', sel, box.cover); return false; }
      await pg.waitForTimeout(120);
      await tap(Math.round(box.x), Math.round(box.y));
      return box;
    };
    const text = (sel) => G((s) => { const e = document.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : ''; }, sel);
    /** the game's own cards (the wage, the welcome, the reading siyum): a player reads them and taps their button */
    const cards = [];
    const dismissCards = async () => {
      for (let k = 0; k < 6; k++) {
        const c = await G(() => { const m = document.querySelector('.gm-modal.on:not(.md-qz)'); if (!m) return null; const b = m.querySelector('.gm-btn-gold') || m.querySelector('.gm-btn'); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, t: m.textContent.replace(/\s+/g, ' ').trim().slice(0, 40) }; });
        if (!c) return;
        cards.push(c.t); await tap(Math.round(c.x), Math.round(c.y)); await pg.waitForTimeout(450);
      }
    };
    // any card the game opens on a return (the wage, the welcome): its buttons, by touch
    for (let k = 0; k < 6; k++) {
      if (!(await waitFor(() => !!document.querySelector('.gm-modal.on .gm-btn'), null, k ? 2500 : 6000))) break;
      await tapSel('.gm-modal.on .gm-btn-gold') || await tapSel('.gm-modal.on .gm-btn');
      await pg.waitForTimeout(500);
    }

    /* ── A · איפה זה בעולם ── */
    await tapSel('.gm-db[data-k="book"]');
    check('the dock opens the book', await waitFor(() => !!document.querySelector('.gm-sheet.on') && !!document.querySelector('.md-pts'), null, 6000));
    check('the book shows the learning points (the seed: 120)', /120/.test(await text('.md-pts .md-n')), await text('.md-pts'));
    const wait9 = await text('.md-chq');
    check('chapter א: its quiz waits for the reading ("קרא עוד 9 משניות")', /קרא עוד 9 משניות/.test(wait9), wait9);
    await tapSel('[data-a="mishnah"][data-id="1.1"]');
    await waitFor(() => !!document.querySelector('.gm-q .md-pl'), null, 4000);
    const names = await G(() => [...document.querySelectorAll('.gm-q .md-pl')].map((e) => e.dataset.k + ':' + e.textContent.replace(/[֑-ׇ]/g, '')));
    check('1:1 — its places are links (בית המוקד, בית אבטינס, בית הניצוץ, הר הבית, שערי העזרה, בית הכפרת)', ['beit-hamoked', 'avtinas', 'nitzotz', 'har', 'azara-gates', 'kodesh'].every((k) => names.some((n) => n.startsWith(k + ':'))), names.join(' | '));
    const sizes = await G(() => [...document.querySelectorAll('.gm-q .md-pl')].map((e) => Math.round(e.getBoundingClientRect().height)));
    check('the links are ≥ 44 px tall to a finger (padding, the text unmoved)', sizes.length > 0 && sizes.every((h) => h >= 44), sizes.join(','));
    const plain = await G(() => (document.querySelector('.gm-q') || {}).textContent || '');
    const m11 = MIDDOT.find((m) => m.id === '1.1');
    check('the mishna reads exactly as before (niqqud and all)', plain === m11.he);
    await shot('a1-mishna-links', true);
    const t0 = await G(() => __T.controls.target.toArray());
    const r1 = await tapSel('.gm-q .md-pl[data-k="beit-hamoked"]');
    check('a tap on "בית המוקד" closes the book', await waitFor(() => !document.querySelector('.gm-sheet.on'), null, 4000), r1 ? `tap ${Math.round(r1.x)},${Math.round(r1.y)}` : 'not found');
    // the place in frame, over its card: its point projects inside the screen, below the top bar and above the card, once the
    // camera has landed (two samples alike)
    const inView = ([x, y, z]) => waitFor(([x, y, z]) => {
      const p = __T.camera.position, k = [p.x, p.y, p.z].map((v) => v.toFixed(1)).join(); const still = window.__mdCam2 === k; window.__mdCam2 = k;
      const o = __T.view.project(x, y, z), card = document.getElementById('card'), top = card && card.classList.contains('on') ? card.getBoundingClientRect().top : innerHeight;
      return still && o.on && o.x > 20 && o.x < innerWidth - 20 && o.y > 150 && o.y < top - 10;
    }, [x, y, z], 9000);
    const flew = await inView([-160, 20, -70]);
    const t1 = await G(() => { const o = __T.view.project(-160, 20, -70); return [Math.round(o.x), Math.round(o.y), Math.round(document.getElementById('card').getBoundingClientRect().top)]; });
    check('the camera flies to Beit HaMoked: it lands in frame, over its card', flew, `from target ${t0.map(Math.round)} · the place at ${t1[0]},${t1[1]} px, the card from ${t1[2]} px`);
    check('its card opens: "בית המוקד"', await waitFor(() => document.getElementById('card').classList.contains('on') && /בית המוקד/.test(document.getElementById('ct').textContent), null, 4000), await text('#ct'));
    check('a chip leads back to the book', /חזרה לספר/.test(await text('.md-back')) && /בית המוקד/.test(await text('.md-back')), await text('.md-back'));
    await pg.waitForTimeout(2500);
    const stay = await G(() => { const o = __T.view.project(-160, 20, -70); return o.on && o.y > 150 && o.y < document.getElementById('card').getBoundingClientRect().top; });
    check('the camera stays on the place (the game\'s camera nets wait)', stay);
    await shot('a2-moked', true);
    await tapSel('.md-back button');
    check('back: the book reopens at 1:1', await waitFor(() => !!document.querySelector('.gm-sheet.on') && /משנה מדות א, א/.test((document.querySelector('.gm-sheet.on h3') || {}).textContent || ''), null, 5000));
    check('back: the card and the chip are gone', await waitFor(() => !document.getElementById('card').classList.contains('on') && !document.querySelector('.md-back'), null, 3000));
    await tapSel('.gm-q .md-pl[data-k="kodesh"]');
    const whole = await waitFor(() => __T.game.whole === true, null, 5000);
    check('"בית הכפרת", not built yet → the whole-Temple view', whole);
    const flewK = await inView([-150, 55, 0]);
    check('the camera flies to the Kodesh HaKodashim in the finished House: in frame, over its card', flewK, (await G(() => { const o = __T.view.project(-150, 55, 0); return [Math.round(o.x), Math.round(o.y)]; })).join(','));
    check('the chip says it is not built yet', /עוד לא נבנה/.test(await text('.md-back')), await text('.md-back'));
    check('its card: אבן השתייה', /אבן השתייה/.test(await text('#ct')), await text('#ct'));
    await shot('a3-kodesh-whole', true);
    await tapSel('.md-back button');
    check('back: the building view again, the book at 1:1', await waitFor(() => __T.game.whole === false && /משנה מדות א, א/.test((document.querySelector('.gm-sheet.on h3') || {}).textContent || ''), null, 6000));

    /* ── B · the quizzes ── */
    // chapter א: the other eight mishnayot, by "המשנה הבאה"
    for (let k = 0; k < 8; k++) { await tapSel('[data-a="mishnah"]', 'המשנה הבאה'); await pg.waitForTimeout(150); }
    await waitFor(() => !!document.querySelector('.gm-modal.on:not(.md-qz)'), null, 1500);
    await dismissCards();   // (the 34th mishna read: the book's own "סיום מסכת מידות" card of the reading)
    console.log('   cards:', cards.join(' | ') || '-');
    check('the whole tractate read → the book\'s own siyum card of the reading (tapped away)', cards.some((t) => /סיום מסכת מידות/.test(t)), cards.join(' | '));
    const read1 = await G(() => Object.keys(__T.game.state.book.read).filter((id) => id.startsWith('1.')).length);
    check('the nine mishnayot of chapter א opened by touch', read1 === 9, `${read1}`);
    check('the last one ends with the chapter\'s quiz waiting (gold)', /למדת את פרק א׳/.test(await text('.md-done')), await text('.md-done'));
    const silver0 = await G(() => __T.game.state.res.silver);
    const answerQuiz = async (wrongAt = -1) => {
      let n = 0, shame = wrongAt < 0;   // (verified only where an answer was wrong on purpose)
      for (let k = 0; k < 12; k++) {
        const q = await G(() => { const h = document.querySelector('.md-qz h2'); const a = [...document.querySelectorAll('.md-qz .md-ans')].map((e) => e.textContent.trim()); return h && a.length && !document.querySelector('.md-qz .md-ans[disabled]') ? { q: h.textContent.trim(), a } : null; });
        if (!q) break;
        const src = QZ.find((x) => x.q === q.q);
        const right = src ? src.a[src.ok] : null;
        let pick = q.a.findIndex((a) => a === right);
        if (k === wrongAt) pick = q.a.findIndex((a) => a !== right);
        await tapSel(`.md-qz .md-ans[data-k="${pick}"]`);
        await waitFor(() => !!document.querySelector('.md-qz .md-fb .gm-note'), null, 3000);
        if (k === wrongAt) {
          const fb = await text('.md-qz .md-fb');
          shame = /התשובה:/.test(fb) && !!(await G(() => document.querySelector('.md-qz .md-ans.md-right') && document.querySelector('.md-qz .md-ans.md-chosen'))) && !/טעות|נכשל|לא נכון|גרוע/.test(fb);
          await shot('b2-wrong-kindly');
        }
        n++;
        await tapSel('.md-qz [data-x="next"]');
        await pg.waitForTimeout(250);
      }
      return { n, shame };
    };
    await tapSel('.md-done .gm-btn');
    check('its quiz opens', await waitFor(() => !!document.querySelector('.md-qz h2'), null, 4000));
    const qa = await answerQuiz(1);
    check('five questions by touch, each with its source and טיוטה', qa.n === 5, `${qa.n}`);
    check('a wrong answer: the right one is shown with the mishna, nothing shames', qa.shame);
    await waitFor(() => !!document.querySelector('.md-qz .md-res'), null, 4000);
    const res1 = await text('.md-qz .md-res');
    check('the result: 4 of 5, +40 learning points, silver', /4 מתוך 5/.test(res1) && /\+40 נקודות לימוד/.test(res1) && /\+8 כסף/.test(res1), res1.slice(0, 120));
    await shot('b3-quiz-result');
    await tapSel('.md-qz [data-x="close"]');
    await waitFor(() => !document.querySelector('.md-qz'), null, 3000);
    const st1 = await G(() => ({ q: __T.game.state.book.quiz['1'], pts: __T.game.state.book.pts, s: __T.game.state.res.silver }));
    check('saved in G.book: quiz[1] = 4, pts 160; silver +8', st1.q === 4 && st1.pts === 160 && st1.s - silver0 === 8, JSON.stringify(st1));
    check('the chapter\'s page keeps the best (4 of 5) and a retake', /השיא שלך 4 מתוך 5/.test(await text('.md-done')), await text('.md-done'));
    await tapSel('[data-a="bookBack"]');
    check('the points appear in the book', await waitFor(() => /160/.test((document.querySelector('.md-pts .md-n') || {}).textContent || ''), null, 4000));
    check('the save on disk has them', await G(() => { const s = JSON.parse(localStorage.getItem('bh_beta2') || '{}'); return s.book && s.book.quiz && s.book.quiz['1'] === 4 && s.book.pts === 160; }));
    // chapter ה, the fifth quiz → the final opens
    await tapSel('[data-a="bookCh"][data-c="4"]');
    await tapSel('.md-chq .gm-btn');
    await waitFor(() => !!document.querySelector('.md-qz h2'), null, 4000);
    await answerQuiz(-1);
    await waitFor(() => !!document.querySelector('.md-qz .md-res'), null, 4000);
    await tapSel('.md-qz [data-x="close"]');
    await waitFor(() => !document.querySelector('.md-qz'), null, 3000);
    const fin = await text('.md-pts');
    check('after the five chapter quizzes: מבחן סיום המסכת opens', /למבחן סיום המסכת/.test(fin), fin.slice(0, 140));
    await tapSel('.md-pts [data-c="fin"]');
    await waitFor(() => !!document.querySelector('.md-qz h2'), null, 4000);
    const kick = await text('.md-qz .gm-kick');
    const qf = await answerQuiz(-1);
    check('the final: ten questions', qf.n === 10, `${qf.n} · ${kick}`);
    await waitFor(() => !!document.querySelector('.md-qz .md-res'), null, 4000);
    const resF = await text('.md-qz .md-res');
    check('the final pays many points (+300) and a title (בקי במסכת מידות)', /\+300 נקודות לימוד/.test(resF) && /בקי במסכת מידות/.test(resF) && /הדרן עלך/.test(resF), resF.slice(0, 160));
    await shot('b5-final-result');
    await tapSel('.md-qz [data-x="close"]');
    await waitFor(() => !document.querySelector('.md-qz'), null, 3000);
    check('the book shows the title and the points', /בקי במסכת מידות/.test(await text('.md-pts')) && /510/.test(await text('.md-pts .md-n')), await text('.md-pts'));
    await shot('b6-book-title');

    /* ── C · שאלת היום: the daily question inside the learning points (FUN11, wave 11) ── */
    const row = await text('.md-pts .md-dq');
    check('C: the book\'s points box holds today\'s question ("שאלת היום · עוד 3 שאלות היום")', /שאלת היום/.test(row) && /עוד 3 שאלות היום/.test(row) && /נקודות לימוד/.test(row) && !/כסף/.test(row), row);
    const dq = async (right) => {
      await waitFor(() => !!document.querySelector('.md-daily h2') && !!document.querySelector('.md-daily .md-ans:not([disabled])'), null, 4000);
      const q = await G(() => ({ q: document.querySelector('.md-daily h2').textContent.trim(), a: [...document.querySelectorAll('.md-daily .md-ans')].map((e) => e.textContent.trim()), kick: document.querySelector('.md-daily .gm-kick').textContent.replace(/\s+/g, ' ').trim() }));
      const src = QZ.find((x) => x.q === q.q), ra = src ? src.a[src.ok] : null;
      const pick = right ? q.a.findIndex((a) => a === ra) : q.a.findIndex((a) => a !== ra);
      await tapSel(`.md-daily .md-ans[data-k="${pick}"]`);
      await waitFor(() => !!document.querySelector('.md-daily .md-fb .gm-note'), null, 3000);
      return { ...q, fb: await text('.md-daily .md-fb'), src: !!src };
    };
    const p0 = await G(() => ({ pts: __T.game.state.book.pts, s: __T.game.state.res.silver, n: (__T.game.state.quiz || {}).n | 0 }));
    await tapSel('.md-pts .md-dq [data-a="quiz"]');
    const d1 = await dq(true);
    check('C: a tap opens today\'s first question (1 of 3), one of the book\'s sourced questions', /שאלת היום · 1 מתוך 3/.test(d1.kick) && d1.src, d1.kick + ' · ' + d1.q);
    const p1 = await G(() => ({ pts: __T.game.state.book.pts, s: __T.game.state.res.silver, n: __T.game.state.quiz.n }));
    check('C: right → "נכון!", the mishna quoted, ★ +10 learning points (and the book\'s silver)', /נכון!/.test(d1.fb) && /\+10 נקודות לימוד/.test(d1.fb) && p1.pts - p0.pts === 10 && p1.s - p0.s === 2 && p1.n === 1, `${d1.fb.slice(0, 90)} · pts ${p0.pts}→${p1.pts} · silver +${p1.s - p0.s}`);
    await shot('c1-daily-right');
    await tapSel('.md-daily [data-x="next"]');
    const d2 = await dq(false);
    const p2 = await G(() => ({ pts: __T.game.state.book.pts, n: __T.game.state.quiz.n }));
    check('C: a wrong answer shows the right one and its mishna kindly; nothing is lost', /התשובה:/.test(d2.fb) && !/טעות|נכשל|גרוע/.test(d2.fb) && p2.pts === p1.pts && p2.n === 2, `${d2.fb.slice(0, 90)} · pts ${p2.pts}`);
    await tapSel('.md-daily [data-x="next"]');
    await dq(true);
    const p3 = await G(() => ({ pts: __T.game.state.book.pts, n: __T.game.state.quiz.n }));
    check('C: the third of the day, and then "סיום"', p3.n === 3 && p3.pts === p1.pts + 10 && !!(await G(() => document.querySelector('.md-daily [data-x="close"]'))), JSON.stringify(p3));
    await tapSel('.md-daily [data-x="close"]');
    await waitFor(() => !document.querySelector('.md-daily'), null, 3000);
    check('C: the book\'s row says today\'s questions are done; the points show', await waitFor((pts) => /ענית על שאלות היום/.test((document.querySelector('.md-pts .md-dq') || {}).textContent || '') && ((document.querySelector('.md-pts .md-n') || {}).textContent || '').includes(String(pts)), p3.pts, 4000), await text('.md-pts'));
    await tapSel('.md-pts .md-dq [data-a="quiz"]');
    check('C: a fourth tap: "לשאלות של היום כבר ענית", with the way to the chapter quizzes', await waitFor(() => /כבר ענית/.test((document.querySelector('.md-daily') || {}).textContent || ''), null, 3000), await text('.md-daily h2'));
    await tapSel('.md-daily [data-x="close"]');
    await waitFor(() => !document.querySelector('.md-daily'), null, 3000);
    check('C: the save on disk has the daily points', await G((p) => { const s = JSON.parse(localStorage.getItem('bh_beta2') || '{}'); return s.book && s.book.pts === p && s.book.dpts === 20; }, p3.pts));

    /* ── D · איפה זה? — the camera flies to a place he built, and he names it (FUN11, wave 11) ── */
    const PL = (await import(pathToFileURL(path.join(ROOT, 'src/game/middot.js')).href)).PLACE;
    const d0 = await G(() => __T.game.state.book.pts);
    check('D: the points box offers "איפה זה?"', /איפה זה\?/.test(await text('.md-pts .md-pqr')), await text('.md-pts .md-pqr'));
    await tapSel('.md-pts .md-pqb');
    check('D: the book closes; the quiz card sits low, the world above it', await waitFor(() => !document.querySelector('.gm-sheet.on') && !!document.querySelector('.md-pq.on .md-ans'), null, 5000));
    let dRight = 0, dFrames = [], dQuotes = 0;
    for (let k = 0; k < 5; k++) {
      await waitFor(() => !!document.querySelector('.md-pq .md-ans:not([disabled])'), null, 4000);
      const names = await G(() => [...document.querySelectorAll('.md-pq .md-ans')].map((e) => e.textContent.trim()));
      // which place is shown: the one whose target the camera flies to (the test reads the flight; the finger reads the screen)
      const landed = await waitFor(() => { const p = __T.camera.position, s = [p.x, p.y, p.z].map((v) => v.toFixed(1)).join(); const ok = window.__pqCam === s; window.__pqCam = s; return ok; }, null, 8000);
      const shown = await G((pl) => {
        const card = document.querySelector('.md-pq .gm-card').getBoundingClientRect().top;
        __T.camera.updateMatrixWorld();
        const names = [...document.querySelectorAll('.md-pq .md-ans')].map((e) => e.textContent.trim());
        const hit = Object.entries(pl).filter(([, P]) => names.includes(P.he)).map(([key, P]) => { const o = __T.view.project(...P.pt[1]); return { key, he: P.he, x: Math.round(o.x), y: Math.round(o.y), on: o.on, d: Math.hypot(o.x - innerWidth / 2, o.y - innerHeight * 0.35) }; }).sort((a, b) => a.d - b.d);
        return { card: Math.round(card), best: hit[0] };
      }, PL);
      const inFrame = landed && shown.best && shown.best.on && shown.best.x > 10 && shown.best.x < 380 && shown.best.y > 100 && shown.best.y < shown.card;
      dFrames.push(inFrame ? 1 : 0);
      const pick = k === 2 ? names.findIndex((n) => n !== shown.best.he) : names.indexOf(shown.best.he);
      await tapSel(`.md-pq .md-ans[data-n="${pick}"]`);
      await waitFor(() => !!document.querySelector('.md-pq .md-fb .gm-note'), null, 3000);
      const fb = await text('.md-pq .md-fb');
      if (/משנה מדות/.test(fb) && /טיוטה/.test(fb)) dQuotes++;
      if (/נכון!/.test(fb)) dRight++;
      if (k === 0) await shot('d1-place-quiz', true);
      await tapSel('.md-pq [data-x="next"]');
      await pg.waitForTimeout(200);
    }
    check('D: every place landed in frame, above the card (5 of 5)', dFrames.every(Boolean), dFrames.join(''));
    check('D: each answer shows the Mishnah\'s own words, with the source and טיוטה', dQuotes === 5, `${dQuotes}`);
    await waitFor(() => !!document.querySelector('.md-pq .md-res'), null, 4000);
    const dres = await text('.md-pq .md-res');
    const dAfter = await G(() => __T.game.state.book.pts);
    check('D: the result — 4 of 5 by touch (one wrong on purpose), +20 learning points, the best kept', dRight === 4 && /4 מתוך 5/.test(dres) && dAfter - d0 === 20 && /\+20 נקודות לימוד/.test(dres), `${dres.slice(0, 80)} · pts ${d0}→${dAfter}`);
    await shot('d2-place-result');
    await tapSel('.md-pq [data-x="book"]');
    check('D: back to the book; the quiz gone, the game\'s camera free again', await waitFor(() => !!document.querySelector('.gm-sheet.on') && !document.querySelector('.md-pq'), null, 5000));

    check('every target a finger could reach (not covered)', covered.length === 0, covered.slice(0, 4).join(' · '));
    check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | '));

    /* ── E · N29 on a phone (PRODUCER10 top-10 #5): while he builds the Mount, "הר הבית" flies to the Mount AS IT STANDS (not the
       whole-Temple view), one way back, "כאן אתה בונה עכשיו". A second profile: the Mount begun, past the first-time flow. ── */
    const GhE = S.fresh(now); Object.assign(GhE, { ftue: 99, op: 1, name: 'יכין', mishmar: 1 }); S.startBuild(GhE, 'har'); S.dailyCheck(GhE, now);
    const ctxE = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pgE = await ctxE.newPage();
    const logsE = [];
    pgE.on('console', (m) => { if (m.type() === 'error') logsE.push(m.text()); });
    pgE.on('pageerror', (e) => logsE.push('PAGEERR ' + e.message));
    await pgE.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pgE.addInitScript(([save, key]) => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      try { if (!sessionStorage.getItem('mh-once')) { sessionStorage.setItem('mh-once', '1'); localStorage.clear(); localStorage.setItem(key, save); localStorage.setItem('bh_settings', JSON.stringify({ rhythm: true })); } } catch (e) { /* storage */ }
    }, [JSON.stringify(GhE), S.SAVE_KEY]);
    await pgE.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pgE.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const GE = (fn, a) => pgE.evaluate(fn, a);
    const waitE = (fn, a, ms = 8000) => pgE.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const tapE = async (sel) => {
      await waitE(() => { const e = document.querySelector('.gm-sheet.on'); if (!e) return true; const r = e.getBoundingClientRect(), k = r.top + ',' + r.bottom, ok = window.__e2 === k && r.bottom <= innerHeight + 1; window.__e2 = k; return ok; }, null, 3000);
      const box = await GE((s) => {
        const e = [...document.querySelectorAll(s)].find((x) => x.getBoundingClientRect().width > 0); if (!e) return null;
        for (const bl of ['center', 'start', 'end', 'nearest']) {
          e.scrollIntoView({ block: bl, inline: 'nearest' });
          for (const r of [...e.getClientRects()].filter((q) => q.width > 2 && q.height > 2)) for (const fx of [0.5, 0.3, 0.7]) {
            const x = r.left + r.width * fx, y = r.top + r.height / 2; if (x < 2 || y < 2 || x > innerWidth - 2 || y > innerHeight - 2) continue;
            const t = document.elementFromPoint(x, y); if (t && (t === e || e.contains(t))) return { x, y };
          }
        }
        const r = e.getBoundingClientRect(), t = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        return { cover: t ? (t.className || t.tagName) + ':' + (t.textContent || '').trim().slice(0, 30) : 'nothing' };
      }, sel);
      if (!box || box.cover) { console.log('   E: cannot tap', sel, box ? box.cover : 'not found'); return false; }
      await pgE.waitForTimeout(120); await pgE.touchscreen.tap(Math.round(box.x), Math.round(box.y)); return true;
    };
    for (let k = 0; k < 6; k++) {
      if (!(await waitE(() => !!document.querySelector('.gm-modal.on .gm-btn'), null, k ? 2500 : 6000))) break;
      (await tapE('.gm-modal.on .gm-btn-gold')) || (await tapE('.gm-modal.on .gm-btn'));
      await pgE.waitForTimeout(500);
    }
    await tapE('.gm-db[data-k="book"]');
    await waitE(() => !!document.querySelector('.gm-sheet.on'), null, 6000);
    const openedE = (await tapE('[data-a="mishnah"][data-id="2.1"]')) && (await waitE(() => !!document.querySelector('.gm-q .md-pl[data-k="har"]'), null, 4000));
    if (!openedE) { await GE(() => { __T.simulate(false); __T.render(); __T.simulate(true); }); await pgE.screenshot({ path: path.join(OUT, 'middot-e0-book.png'), timeout: 240000 }); console.log('   E: the book as it was: test/out/middot-e0-book.png ·', await GE(() => (document.querySelector('.gm-sheet.on') || {}).textContent ? document.querySelector('.gm-sheet.on').textContent.replace(/\s+/g, ' ').slice(0, 200) : 'no sheet')); }
    check('E: a new player building the Mount: the book → 2:1, "הר הבית" a link', openedE);
    if (openedE) {
      await tapE('.gm-q .md-pl[data-k="har"]');
      const PE = (await import(pathToFileURL(path.join(ROOT, 'src/game/middot.js')).href)).PLACE.har.pt[1];
      const landedE = await waitE(([x, y, z]) => {
        const p = __T.camera.position, k = [p.x, p.y, p.z].map((v) => v.toFixed(1)).join(); const st = window.__e3 === k; window.__e3 = k;
        __T.camera.updateMatrixWorld();
        const o = __T.view.project(x, y, z), card = document.getElementById('card'), top = card && card.classList.contains('on') ? card.getBoundingClientRect().top : innerHeight;
        return st && o.on && o.x > 10 && o.x < innerWidth - 10 && o.y > 100 && o.y < top;
      }, PE, 12000);
      const whereE = await GE(([x, y, z]) => { const o = __T.view.project(x, y, z); return { x: Math.round(o.x), y: Math.round(o.y), whole: __T.game.whole, chip: (document.querySelector('.md-back') || {}).textContent || '', backs: document.querySelectorAll('.md-back button').length }; }, PE);
      check('E (N29): "הר הבית" → the Mount AS IT STANDS (not the whole-Temple view), in frame over its card, "כאן אתה בונה עכשיו", one way back', landedE && whereE.whole === false && /כאן אתה בונה עכשיו/.test(whereE.chip) && whereE.backs === 1, JSON.stringify(whereE));
      await GE(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      if (SHOTS) { await pgE.screenshot({ path: path.join(OUT, 'middot-e1-har-as-it-stands.png'), timeout: 240000 }); console.log('   shot test/out/middot-e1-har-as-it-stands.png'); }
      await GE(() => { window.__HUD_HOLD = false; });
      await tapE('.md-back button');
      check('E: back → the book at 2:1, the chip gone', await waitE(() => !!document.querySelector('.gm-sheet.on') && /משנה מדות ב, א/.test((document.querySelector('.gm-sheet.on h3') || {}).textContent || '') && !document.querySelector('.md-back'), null, 6000));
    }
    check('E: no console errors', logsE.length === 0, logsE.slice(0, 3).join(' | '));
    await ctxE.close();
  } catch (e) {
    check('the run finished', false, e.message.split('\n')[0]);
  } finally {
    await b.close();
  }
  const fails = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - fails}/${results.length} passed`);
  process.exit(fails ? 1 : 0);
})();
