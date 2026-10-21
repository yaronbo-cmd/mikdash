// SERVICE13 (wave 13): פיטום הקטורת and the pens / the lambs' chamber by REAL TOUCH on the real build, a phone 390×844
// (SwiftShader), no autoplay flags.
//   node build.mjs && NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/avodah-touch-w13.cjs [--only=pitum,dir]
// A player with a Phase A save (name "אביתר", mishmar 3) opens Phase B's home (#avodah) on Wednesday 19 Tishrei 5787 (Chol
// HaMoed Sukkot, 10:00):
//   1. the home's box "בית אבטינס והדיר": the invitation (no ketoret yet) and tomorrow's need (20 Tishrei: 8 bulls …);
//   2. "לפטם קטורת" touched on the home: the eleven spices — the stone touched, the pour held until the beam is level —
//      then the mortar's words touched on the line, the pinch of "מעלה עשן"; the store is 368 manim; the home shows it;
//   3. "לדיר וללשכת הטלאים" touched on the home: the water held, the hay touched, tomorrow's musaf animals led out (8 bulls,
//      2 rams, a goat), each new lamb touched, its ear, eye, nose and lip touched, judged by touch; the chamber holds six.
// The only declared hooks: __AV_NOW (the clock), __START_PAUSED + __T.simulate/render for the shots (as produce-play), and
// scrollIntoView to bring the home's box into view (a player scrolls). Every tap is a CDP touch at the element's centre.
// Shots: test/out/avodah/w13-touch-*.png.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/avodah');
fs.mkdirSync(OUT, { recursive: true });
const ONLY = ((process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1] || '').split(',').filter(Boolean);
const want = (k) => !ONLY.length || ONLY.includes(k);
const FILE = ((process.argv.find((a) => a.startsWith('--file=')) || '').split('=')[1] || 'dist/test.html');   // (the page with its viewport meta: temple3d.html is the artifact's fragment, laid out 980 px wide under a phone's emulation)
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const T0 = Date.now(), sec = () => ((Date.now() - T0) / 1000).toFixed(0);
const BUDGET = (+process.env.W13_BUDGET || 545) * 1e3, left = () => BUDGET - (Date.now() - T0);
const WEIGHT = [70, 70, 70, 70, 16, 16, 16, 16, 12, 3, 9];   // כריתות ו ע״א (the test's own table, as a player reads the baraita)

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage();
  pg.setDefaultTimeout(15000);
  const errors = [];
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errors.push(m.text().slice(0, 200)); });
  pg.on('pageerror', (e) => errors.push('PAGEERR ' + e.message.slice(0, 200)));
  await pg.addInitScript(() => {
    try { localStorage.clear(); localStorage.setItem('bh_beta2', JSON.stringify({ v: 6, name: 'אביתר', mishmar: 3 })); } catch (e) { /* none */ }
    window.__AV_NOW = Date.parse('2026-09-30T10:00:00+03:00'); window.__AV_T0 = performance.now(); window.__GAME_LOG = [];
    window.__START_PAUSED = true;   // (SwiftShader: the world's loop is paused and simulated; each shot renders its frame)
  });
  const E = (fn, a) => pg.evaluate(fn, a);
  const wf = (fn, a, ms = 15000) => pg.waitForFunction(fn, a, { timeout: ms, polling: 50 }).then(() => true, () => false);
  const SHOTS = new Set((process.env.W13_SHOTS || '03-pitum-weigh,07-dir-check').split(','));
  const shot = async (name) => {
    if (!SHOTS.has(name) || left() < 60e3) return;
    const f = path.join(OUT, `w13-touch-${name}.png`);
    try {
      await E(() => { try { __T.simulate(false); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); } catch (e) { /* no hooks */ } });   // (one render: SwiftShader takes ~30 s a frame here)
      await pg.screenshot({ path: f, timeout: 90000 });
      console.log(`${sec()}s shot ${path.basename(f)}`);
    } catch (e) { console.log(`${sec()}s shot ${name} failed: ${e.message.slice(0, 60)}`); }
    await E(() => { window.__HUD_HOLD = false; });
  };
  const cdp = await ctx.newCDPSession(pg);
  const boxOf = (sel) => E((s) => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height } : null; }, sel);
  const down = (p) => cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p.x, y: p.y }] });
  const up = () => cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  const touchAt = async (p, ms = 60) => { await down(p); await pg.waitForTimeout(ms); await up(); };
  const tap = async (sel, ms = 60) => { const p = await boxOf(sel); if (!p) return false; await touchAt(p, ms); return true; };
  /** the centre of a tap target in the picture, by its aria-label */
  const tgt = (cls, label) => E(([c, l]) => { const g = [...document.querySelectorAll(c)].find((x) => x.getAttribute('aria-label') === l); if (!g) return null; const r = g.querySelector('.av-hit').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, [cls, label]);
  const nextCards = async (n = 6) => { for (let k = 0; k < n; k++) { if (!(await wf(() => document.querySelector('.av-modal.on .av-go'), null, 5000))) return; await tap('.av-modal.on .av-go'); await pg.waitForTimeout(500); } };
  const hint = () => E(() => (document.querySelector('.av-hint') || {}).textContent || '');
  const svcBox = () => E(() => ((document.querySelector('.av-svc') || {}).innerText || '').replace(/[⁦-⁩]/g, '').replace(/\s+/g, ' '));
  // (integration v26: the box is taller than the home's sheet — centred, its buttons lay at y 1291 on an 844 screen and the touch hit
  //  nothing; a player scrolls to the button itself)
  //  — and the scroll lifts the home's sheet (--ui-dock 0 → 558 px over ~600 ms): the button is read once it stands still
  const toBox = async (k) => {
    await E((k) => { const x = document.querySelector(`.av-svc [data-play="${k}"]`) || document.querySelector('.av-svc'); if (x) x.scrollIntoView({ block: 'center', behavior: 'instant' }); }, k);
    await pg.waitForTimeout(900);
    let a = null, same = 0;
    for (let i = 0; i < 20; i++) { await pg.waitForTimeout(150); const b = await boxOf(`.av-svc [data-play="${k}"]`); same = a && b && Math.abs(a.y - b.y) < 0.5 && Math.abs(a.x - b.x) < 0.5 ? same + 1 : 0; a = b; if (same >= 2) return b; }
    return a;
  };
  try {
    await pg.goto('file://' + path.join(ROOT, FILE) + '#avodah');
    const upOk = await wf(() => window.__AVODAH && document.querySelector('.av-modal.on'), null, 180000);
    console.log(`${sec()}s Phase B up: ${upOk}`);
    await tap('.av-modal.on .av-go');   // "שלום, הכהן אביתר" → to the work
    check('the home opens', await wf(() => document.querySelector('.av-home.on') && document.querySelector('.av-svc'), null, 30000));
    /* ── 1. the home's box ── */
    const b0 = await svcBox();
    check('the home: "בית אבטינס והדיר" — the invitation, tomorrow\'s need from the calendar (8 bulls, 2 rams, 14 lambs, a goat + the two tamid lambs)', /בוא לשקול/.test(b0) && /מחר צריך: 2 כבשי תמיד · מוסף: 8 פרים, 2 אילים, 14 כבשים, שעיר/.test(b0), b0.slice(0, 150));
    const pb0 = await toBox('pitum');
    check('the box\'s buttons are ≥ 44 px', pb0 && pb0.h >= 44 && pb0.w >= 44, pb0 ? `${Math.round(pb0.w)}×${Math.round(pb0.h)}` : 'none');
    await shot('01-home-box');
    /* ── 2. פיטום הקטורת ── */
    if (want('pitum')) {
      const pb = await toBox('pitum');   // (again, right before the touch: the shot took time)
      await touchAt(pb);
      check('pitum opens from the home by touch', await wf(() => window.__AVODAH._.game === 'pitum', null, 30000));
      await wf(() => document.querySelectorAll('.av-p-tgt').length >= 6, null, 20000);
      await pg.waitForTimeout(800);
      const minT = await E(() => Math.min(...[...document.querySelectorAll('.av-p-tgt .av-hit')].map((e) => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); })));
      check('pitum: every tap target ≥ 44 px (the stones, the honey)', minT >= 44, `${Math.round(minT)} px`);
      let weighed = 0, overs = 0;
      for (let k = 0; k < 11 && left() > 110e3; k++) {
        const w = WEIGHT[k];
        const need = await E(() => /כמה מנה/.test([...document.querySelectorAll('.av-svg text')].map((t) => t.textContent).join(' ')));
        if (need) { const p = await tgt('.av-p-tgt', `אבן משקל ${w} מנה`); if (p) await touchAt(p); await pg.waitForTimeout(250); }
        if (k === 0) await shot('02-pitum-stone');
        const pour = await boxOf('[data-k="pour"]');
        if (!pour) break;
        await down(pour);
        await wf(() => { const l = document.querySelector('.av-p-level'); return l && l.classList.contains('on'); }, null, 8000);
        await up();
        await pg.waitForTimeout(200);
        for (let t = 0; t < 8 && /יותר מדי/.test(await hint()); t++) { overs++; await tap('[data-k="less"]'); await pg.waitForTimeout(250); }
        for (let t = 0; t < 4 && /עוד קצת/.test(await hint()); t++) { await down(await boxOf('[data-k="pour"]')); await pg.waitForTimeout(90); await up(); await pg.waitForTimeout(250); }
        const ok = await wf((n) => { const d = document.querySelectorAll('.av-p-jar.done').length; return d >= n || !!document.querySelector('.av-p-lane'); }, k + 1, 4000);
        if (ok) weighed++;
        if (k === 3) await shot('03-pitum-weigh');
      }
      check('pitum by touch: the eleven weighed, each by its stone and a held pour', weighed === 11, `${weighed}/11, ${overs} "הסר מעט"`);
      check('pitum: the mortar\'s lane opens', await wf(() => !!document.querySelector('.av-p-lane'), null, 8000));
      let hits = 0;
      const gb = await boxOf('[data-k="grind"]');
      const t1 = Date.now();
      while (Date.now() - t1 < 30000) {
        const st = await E(() => {
          const xOf = (g) => { const m = /translate\(([-\d.]+)/.exec(g.getAttribute('transform') || ''); return m ? +m[1] : -999; };
          const on = [...document.querySelectorAll('.av-p-word')].some((g) => !g.classList.contains('hit') && !g.classList.contains('late') && Math.abs(xOf(g) - 292) <= 14);
          return { on, done: !document.querySelector('[data-k="grind"]') };
        });
        if (st.done) break;
        if (st.on && gb) { await touchAt(gb, 30); hits++; await pg.waitForTimeout(150); }
        await pg.waitForTimeout(25);
        if (hits === 6) await shot('04-pitum-grind');
      }
      const words = await E(() => document.querySelectorAll('.av-p-word.hit').length);
      check('pitum by touch: "הדק היטב, היטב הדק" — the words struck on the line', words >= 8, `${words} words on the beat (${hits} touches)`);
      // a pinch of "מעלה עשן" (כריתות ו ע״א), and Beit Avtinas' smoke "מתמר ועולה כמקל" (יומא לח ע״א)
      await wf(() => [...document.querySelectorAll('.av-p-tgt')].some((g) => g.getAttribute('aria-label') === 'קורט מעלה עשן'), null, 8000);
      const pin = await tgt('.av-p-tgt', 'קורט מעלה עשן');
      if (pin) await touchAt(pin);
      check('pitum by touch: the pinch of "מעלה עשן" — their smoke "מתמר ועולה כמקל" (יומא לח ע״א)', !!pin && await wf(() => /מתמר ועולה כמקל/.test((document.querySelector('.av-cite') || {}).textContent || ''), null, 5000));
      await shot('04b-pitum-smoke');
      check('pitum: the store fills — 368 manim (365 + 3)', await wf(() => /368 מנה/.test([...document.querySelectorAll('.av-svg text')].map((t) => t.textContent).join(' ')), null, 10000));
      await shot('05-pitum-store');
      const card = await wf(() => document.querySelector('.av-modal.on .av-go'), null, 12000);
      const ct = await E(() => ((document.querySelector('.av-modal.on') || {}).innerText || '').replace(/\s+/g, ' '));
      check('pitum: its draft card with the sources (כריתות ו, הדק היטב, 368), "+368 מנה באוצר הקטורת"', card && /טיוטה/.test(ct) && /כריתות ו/.test(ct) && /מנה באוצר הקטורת/.test(ct), ct.slice(0, 140));
      await nextCards(4);
      await wf(() => document.querySelector('.av-home.on') && document.querySelector('.av-svc'), null, 20000);
      const b1 = await svcBox();
      check('the home now shows the store: 368 manim', /368 מנה/.test(b1), b1.slice(0, 120));
    }
    /* ── 3. the pens and the lambs' chamber ── */
    if (want('dir') && left() > 90e3) {
      const db = await toBox('dir');
      await touchAt(db);
      check('dir opens from the home by touch', await wf(() => window.__AVODAH._.game === 'dir', null, 30000));
      await wf(() => document.querySelector('[data-k="water"]'), null, 20000);
      await pg.waitForTimeout(800);
      await shot('06-dir-pens');
      const wb = await boxOf('[data-k="water"]');
      await down(wb);
      await wf(() => document.querySelector('[data-k="water"]').disabled, null, 12000);
      await up();
      for (let i = 1; i <= 3; i++) { const p = await tgt('.av-r-tgt', `אלומת מספוא ${i}`); if (p) await touchAt(p); await pg.waitForTimeout(250); }
      // tomorrow's musaf (20 Tishrei): 8 bulls, 2 rams and a goat led out to the fold of tomorrow, one touch each
      check('dir by touch: the trough filled, the hay in the manger — tomorrow\'s musaf animals come', await wf(() => /מחר במוסף/.test(document.querySelector('.av-hint').textContent), null, 12000));
      await pg.waitForTimeout(400);
      await shot('06b-dir-musaf');
      let led = 0;
      for (let k = 0; k < 20; k++) {
        const p = await E(() => { const g = [...document.querySelectorAll('.av-r-tgt')].find((x) => /^(פר|איל|שעיר) \d+$/.test(x.getAttribute('aria-label') || '')); if (!g) return null; const r = g.querySelector('.av-hit').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        if (!p) break; await touchAt(p); led++; await pg.waitForTimeout(120);
      }
      check('dir by touch: 8 bulls, 2 rams and a goat led out ("מוכנים למחר")', led === 11 && await wf(() => /מוכנים למחר|טלאים חדשים|הקש על טלה/.test(document.querySelector('.av-hint').textContent), null, 6000), `${led} touched`);
      check('dir: the new lambs come to the chamber', await wf(() => /טלאים חדשים|הקש על טלה/.test(document.querySelector('.av-hint').textContent), null, 12000));
      let judged = 0, minP = 999;
      for (let k = 1; k <= 3; k++) {
        const p = await tgt('.av-r-tgt', `טלה ${k}`);
        if (!p) continue;
        await touchAt(p); await pg.waitForTimeout(350);
        for (const part of ['האוזן', 'העין', 'החוטם', 'השפה']) { const q = await tgt('.av-r-tgt', part); if (q) { minP = Math.min(minP, q.w, q.h); await touchAt(q); await pg.waitForTimeout(200); } }
        if (k === 1) await shot('07-dir-check');
        const blem = await E(() => !!document.querySelector('.av-r-mark'));
        await tap(blem ? '[data-k="mum"]' : '[data-k="tamim"]');
        judged++;
        await pg.waitForTimeout(900);
      }
      check('dir by touch: three new lambs, each looked at in four places and judged; the parts ≥ 44 px', judged === 3 && minP >= 44, `judged ${judged}, parts ${Math.round(minP)} px`);
      const card = await wf(() => document.querySelector('.av-modal.on .av-go'), null, 10000);
      const ct = await E(() => ((document.querySelector('.av-modal.on') || {}).innerText || '').replace(/\s+/g, ' '));
      check('dir: six checked lambs in the chamber, the card with ערכין ב, ה', card && /ערכין ב, ה/.test(ct) && /טיוטה/.test(ct), ct.slice(0, 120));
      await shot('08-dir-card');
      await nextCards(3);
      await wf(() => document.querySelector('.av-home.on') && document.querySelector('.av-svc'), null, 20000);
      const b2 = await svcBox();
      check('the home: today\'s tending marked (watered, hay, checked 2)', /השקית/.test(b2) && /בדקת 2/.test(b2), b2.slice(0, 160));
      await E(() => { const x = document.querySelector('.av-svc'); if (x) x.scrollIntoView({ block: 'center', behavior: 'instant' }); });
      await shot('09-home-after');
    }
    check('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  } catch (e) { console.log('ERROR ' + e.message); check('the run completes', false, e.message); } finally { await b.close(); }
  const fail = results.filter((r) => !r.ok);
  console.log(`\n${results.length - fail.length}/${results.length} passed (${sec()} s)`);
  process.exit(fail.length ? 1 : 0);
})();
