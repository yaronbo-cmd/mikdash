// AVODA12 (wave 12): Phase B by REAL TOUCH on the real build, a phone 390×844 (SwiftShader), no autoplay flags.
//   node build.mjs && NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/avodah-touch-w12.cjs [--only=shir,kelim,…]
// A player with a Phase A save (name "אהרן", mishmar 5) opens Phase B on Tuesday 18 Tishrei 5787 (Chol HaMoed Sukkot, 10:00):
//   1. N69: the first card greets him by name ("שלום, הכהן אהרן") — no name field — one touch on "לעבודה".
//   2. The song of the day (#avodah=shir): the water and the wine held on the silver bowls, the cymbal struck when the sgan
//      waves, the lyre notes tapped on the line, the trumpets (hold · three taps · hold) at each פרק, the people bow.
//   3. The new moments, each opened by a declared jump (__AVODAH._.run(id)) and then played by touch only: chavitin (take
//      each cake off "בין בשל ונא", split the twelve), shaarim (the gates' three blasts), kelim (the shelves to 93), machar
//      (check three lambs, judge each), neilah (the seven gates, the keys).
// Shots: test/out/avodah/w12-touch-*.png. Every tap is a CDP touch (touchStart/touchEnd) at the element's centre.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/avodah');
fs.mkdirSync(OUT, { recursive: true });
const ONLY = ((process.argv.find((a) => a.startsWith('--only=')) || '').split('=')[1] || '').split(',').filter(Boolean);
const want = (k) => !ONLY.length || ONLY.includes(k);
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const T0 = Date.now(), sec = () => ((Date.now() - T0) / 1000).toFixed(0);
const BUDGET = 570e3, left = () => BUDGET - (Date.now() - T0);   // (the queue cuts a run at 10 min: each part checks the time left)
const room = (k, ms) => { if (left() > ms) return true; console.log(`SKIP  ${k}: ${Math.round(left() / 1000)} s left`); return false; };

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
    try { localStorage.clear(); localStorage.setItem('bh_beta2', JSON.stringify({ v: 6, name: 'אהרן', mishmar: 5 })); } catch (e) { /* none */ }
    window.__AV_NOW = Date.parse('2026-09-29T10:00:00+03:00'); window.__AV_T0 = performance.now(); window.__GAME_LOG = [];
    window.__START_PAUSED = true;   // (SwiftShader: the world's loop is paused and simulated; each shot renders its frame — as produce-play)
  });
  const E = (fn, a) => pg.evaluate(fn, a);
  const wf = (fn, a, ms = 15000) => pg.waitForFunction(fn, a, { timeout: ms, polling: 60 }).then(() => true, () => false);
  const SHOTS = new Set(['01-greet', '03-shir-cymbal', '04-shir-perek2', '06-shir-card', '08-chavitin-split', '11-shaarim-open', '13-kelim-93', '15-machar-look', '18-neilah-night']);
  const shot = async (name) => {
    if (!SHOTS.has(name) || left() < 150e3) return;
    const f = path.join(OUT, `w12-touch-${name}.png`);
    try {
      await E(() => { try { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); } catch (e) { /* no hooks */ } });
      await pg.screenshot({ path: f, timeout: 120000 });
      console.log(`${sec()}s shot ${path.basename(f)}`);
    } catch (e) { console.log(`${sec()}s shot ${name} failed: ${e.message.slice(0, 60)}`); }
    await E(() => { window.__HUD_HOLD = false; });
  };
  const cdp = await ctx.newCDPSession(pg);
  const box = (sel) => E((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height } : null; }, sel);
  const touchAt = async (p, ms = 60) => { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p.x, y: p.y }] }); await pg.waitForTimeout(ms); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tap = async (sel, ms = 60) => { const p = await box(sel); if (!p) return false; await touchAt(p, ms); return true; };
  const minTarget = (sel) => E((s) => Math.min(...[...document.querySelectorAll(s)].map((e) => { const r = e.getBoundingClientRect(); return Math.min(r.width, r.height); })), sel);
  const game = () => E(() => (window.__AVODAH && window.__AVODAH._ ? window.__AVODAH._.game : null));
  const nextCards = async (n = 6) => { for (let k = 0; k < n; k++) { if (!(await wf(() => document.querySelector('.av-modal.on .av-go'), null, 4000))) return; await tap('.av-modal.on .av-go'); await pg.waitForTimeout(500); } };
  try {
    await pg.goto('file://' + path.join(ROOT, 'dist/temple3d.html') + '#avodah=shir');
    const up = await wf(() => window.__AVODAH && document.querySelector('.av-modal.on'), null, 180000);
    console.log(`${sec()}s Phase B up: ${up}`);
    /* ── 1. N69 ── */
    const first = await E(() => { const m = document.querySelector('.av-modal.on'); return m ? m.innerText.replace(/\s+/g, ' ').slice(0, 200) : ''; });
    check('N69: Phase B greets him by his Phase A name, no name field ("שלום, הכהן אהרן")', /שלום, הכהן אהרן/.test(first) && !(await box('.av-modal.on .av-input')), first.slice(0, 90));
    await shot('01-greet');
    await tap('.av-modal.on .av-go');
    /* ── 2. the song ── */
    if (want('shir')) {
      check('the song opens (#avodah=shir)', await wf(() => window.__AVODAH._.game === 'shir', null, 30000));
      await pg.waitForTimeout(2500);
      await shot('02-shir-bowls');
      // the water (Sukkot) on the western bowl, then the wine on the eastern one (Sukkah 4:9): a touch held until each is poured
      for (const [key, label, doneFn] of [['bowl-west', 'מים', () => /עכשיו היין/.test(document.querySelector('.av-hint').textContent)], ['bowl-east', 'יין', () => !!document.querySelector('[data-k="tziltzal"]')]]) {
        await wf((k) => document.querySelector(`.av3d-t[data-key="${k}"]:not(.off)`) || document.querySelector('.av-ctl .av-btn.hold'), key, 8000);
        const sel = (await box(`.av3d-t[data-key="${key}"]:not(.off)`)) ? `.av3d-t[data-key="${key}"]` : '.av-ctl .av-btn.hold';
        const p = await box(sel);
        console.log(`${sec()}s hold ${label} on ${sel} at ${p && Math.round(p.x)},${p && Math.round(p.y)}`);
        if (p) { await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: p.x, y: p.y }] }); await wf(doneFn, null, 30000); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
        await pg.waitForTimeout(1000);
      }
      check('the cymbal appears after the wine ([data-k="tziltzal"])', await wf(() => document.querySelector('[data-k="tziltzal"]'), null, 12000));
      const early = await tap('[data-k="tziltzal"]');   // at once: before the sgan waves
      const earlyHint = await E(() => document.querySelector('.av-hint').textContent);
      const waitedEarly = /עוד לא/.test(earlyHint);
      if (waitedEarly) {
        await wf(() => document.querySelector('.av-shir .av-flag.wave'), null, 8000);
        await shot('03-shir-cymbal');
        await tap('[data-k="tziltzal"]');
      }
      const struck = await wf(() => !document.querySelector('[data-k="tziltzal"]'), null, 5000);
      const hint = await E(() => document.querySelector('.av-hint').textContent);
      check('the cymbal by touch: an early tap only waits; at the sgan\'s wave it strikes and the Levites begin', early && struck && /בן ארזא/.test(hint), `${waitedEarly ? 'early tap waited ("עוד לא")' : 'the first tap came after the wave'} → ${hint.slice(0, 50)}`);
      if (!waitedEarly) await shot('03-shir-cymbal');
      // the song: tap "נגן" when a note is on the line; at each פרק's end the trumpets (hold · three taps · hold)
      let perakim = 0, hits = 0, shotMid = false;
      const tBtn = '[data-k="trumpet"]', nBtn = '[data-k="nagen"]';
      await wf(() => document.querySelector('[data-k="nagen"]'), null, 8000);
      const tEnd = Date.now() + Math.min(240000, left() - 150000);
      let nagenP = null, trumpetP = null;
      while (Date.now() < tEnd) {
        const st = await E(() => { const g = window.__AVODAH._.game; const n = [...document.querySelectorAll('.av-shir .av-note:not(.hit):not(.late)')].map((c) => +c.getAttribute('cx')); const t = document.querySelector('[data-k="trumpet"]'), l = document.querySelector('[data-k="nagen"]'); const c = (e) => { if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }; return { g, near: n.some((x) => Math.abs(x - 70) < 12), tOn: !!(t && !t.disabled), perek: (document.querySelector('.av-shir-perek') || {}).textContent || '', tp: c(t), lp: c(l) }; });
        nagenP = st.lp || nagenP; trumpetP = st.tp || trumpetP;
        if (st.g !== 'shir') break;
        if (!shotMid && /פרק 2/.test(st.perek)) { shotMid = true; await shot('04-shir-perek2'); }
        if (st.tOn) {
          await touchAt(trumpetP, 620); await pg.waitForTimeout(80);
          for (let k = 0; k < 3; k++) { await touchAt(trumpetP, 40); await pg.waitForTimeout(90); }
          await touchAt(trumpetP, 620);
          perakim++;
          await pg.waitForTimeout(400);
          if (perakim === 1) await shot('05-shir-bow');
          await wf(() => { const t = document.querySelector('[data-k="trumpet"]'); return !t || t.disabled; }, null, 4000);
          continue;
        }
        if (st.near) { await touchAt(nagenP, 30); hits++; }
        await pg.waitForTimeout(25);
      }
      const log = await E(() => (window.__GAME_LOG || []).filter((e) => /^shir/.test(e.type)).map((e) => e.type + (e.d && e.d.kind ? ':' + e.d.kind : '')));
      check('the song by touch: three פרקים, each closed by the trumpets and the bow', perakim === 3, `perakim ${perakim}, lyre taps ${hits}`);
      check('the music hears it: shirBlast:ttt → shirStart → 9 blasts → shirEnd (WORLD12\'s `shir` state)', log[0] === 'shirBlast:ttt' && log.includes('shirStart') && log.filter((x) => /shirBlast:(tekiah|teruah)/.test(x)).length === 9 && log[log.length - 1] === 'shirEnd', log.join(' '));
      await wf(() => document.querySelector('.av-modal.on .av-go'), null, 8000);
      await shot('06-shir-card');
      const cardTxt = await E(() => (document.querySelector('.av-modal.on') || {}).innerText || '');
      check('the song\'s card: sourced drafts (Tamid 7:3; RH 31a; Arachin 2:3)', /טיוטה/.test(cardTxt) && /תמיד ז/.test(cardTxt), cardTxt.replace(/\s+/g, ' ').slice(0, 80));
      await nextCards(3);
    }
    /* ── 3. the new moments, by touch ── */
    const run = async (id) => { await wf(() => !window.__AVODAH.busy && document.querySelector('.av-home.on'), null, 20000); await E((g) => window.__AVODAH._.run(g), id); return wf((g) => window.__AVODAH._.game === g, id, 20000); };
    if (want('chavitin') && room('chavitin', 90000)) {
      check('chavitin opens (declared jump)', await run('chavitin'));
      await pg.waitForTimeout(1800);
      await shot('07-chavitin');
      const tb = await box('[data-k="take"]');
      let good = 0, tries = 0;
      const tEnd = Date.now() + Math.min(90000, left() - 60000);
      while (Date.now() < tEnd && tries < 40) {
        const st = await E(() => { const n = document.querySelector('.av-svg rect.av-d-needle'); const t = document.querySelector('[data-k="take"]'); return { x: n ? +n.getAttribute('x') : 0, on: !!(t && !t.disabled), split: !!document.querySelector('.av-d-tgt') }; });
        if (st.split || !st.on) break;
        if (st.x >= 230 + 52 && st.x <= 230 + 70) { await touchAt(tb, 40); good++; tries++; await pg.waitForTimeout(250); }
        await pg.waitForTimeout(20);
      }
      await wf(() => document.querySelector('.av-d-tgt'), null, 60000);
      await shot('08-chavitin-split');
      const minT = await minTarget('.av-d-tgt .av-d-hit');
      let split = 0;
      for (let k = 0; k < 12; k++) { const ok = await tap('.av-d-tgt .av-d-hit'); if (!ok) break; split++; await pg.waitForTimeout(120); }
      check('chavitin by touch: cakes taken "בין בשל ונא", twelve split (targets ≥ 44 px)', good >= 3 && split === 12 && minT >= 43, `in the window ×${good}, split ×${split}, min target ${Math.round(minT)} px`);
      await wf(() => document.querySelector('.av-modal.on .av-go'), null, 8000); await shot('09-chavitin-card'); await nextCards(2);
    }
    if (want('shaarim') && room('shaarim', 45000)) {
      check('shaarim opens', await run('shaarim'));
      await pg.waitForTimeout(1500);
      const p = await box('[data-k="trumpet"]');
      await touchAt(p, 620); await pg.waitForTimeout(150); for (let k = 0; k < 3; k++) { await touchAt(p, 40); await pg.waitForTimeout(90); } await pg.waitForTimeout(200);
      await shot('10-shaarim-half');
      await touchAt(p, 620);
      check('shaarim by touch: tekiah, teruah, tekiah — the gates open', await wf(() => /השערים נפתחו/.test(document.querySelector('.av-hint') ? document.querySelector('.av-hint').textContent : '') || document.querySelector('.av-modal.on .av-go'), null, 6000));
      await shot('11-shaarim-open');
      await nextCards(2);
    }
    if (want('kelim') && room('kelim', 45000)) {
      check('kelim opens', await run('kelim'));
      await pg.waitForTimeout(1500);
      await shot('12-kelim');
      let n = 0;
      for (let k = 0; k < 12; k++) {
        const p = await E((i) => { const all = [...document.querySelectorAll('.av-d-tgt circle.av-d-hit')]; const e = all[i % all.length]; if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }, k);
        if (!p) break; await touchAt(p); n++; await pg.waitForTimeout(160);
        if (await box('.av-modal.on .av-go')) break;
      }
      const txt = await E(() => [...document.querySelectorAll('.av-svg text')].map((t) => t.textContent).join(' '));
      check('kelim by touch: the shelves to 93', /93/.test(txt) || await wf(() => document.querySelector('.av-modal.on .av-go'), null, 4000), `${n} taps`);
      await shot('13-kelim-93');
      await nextCards(2);
    }
    if (want('machar') && room('machar', 45000)) {
      check('machar opens', await run('machar'));
      await pg.waitForTimeout(1500);
      await shot('14-machar');
      let judged = 0;
      for (let k = 0; k < 3; k++) {
        if (!(await tap('.av-d-tgt .av-d-hit'))) break;
        await pg.waitForTimeout(300);
        const say = await E(() => { const t = [...document.querySelectorAll('.av-svg text')].map((x) => x.textContent).find((x) => /אוזן|סחוס|שריטה|סימן/.test(x)); return t || ''; });
        if (k === 0) await shot('15-machar-look');
        const blem = /סחוס/.test(say) && !/לא בסחוס/.test(say);
        await tap(blem ? '[data-k="mum"]' : '[data-k="tamim"]');
        judged++;
        await pg.waitForTimeout(700);
      }
      check('machar by touch: three lambs checked and judged (the ear\'s skin is not a blemish)', judged === 3 && await wf(() => document.querySelector('.av-modal.on .av-go'), null, 6000), `judged ${judged}`);
      await shot('16-machar-card');
      await nextCards(2);
    }
    if (want('neilah') && room('neilah', 45000)) {
      check('neilah opens', await run('neilah'));
      await pg.waitForTimeout(1500);
      await shot('17-neilah');
      const minT = await minTarget('.av-d-tgt .av-d-hit');
      let shut = 0;
      for (let k = 0; k < 7; k++) { if (!(await tap('.av-d-tgt .av-d-hit'))) break; shut++; await pg.waitForTimeout(200); }
      await pg.waitForTimeout(300);
      await tap('.av-d-tgt .av-d-hit');   // the keys
      check('neilah by touch: seven gates closed, the keys to Beit HaMoked', shut === 7 && await wf(() => document.querySelector('.av-modal.on .av-go'), null, 8000), `gates ${shut}, min target ${Math.round(minT)} px`);
      await shot('18-neilah-night');
      await nextCards(2);
    }
    check('no page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  } catch (e) { console.log('ERROR ' + e.message); check('the run completes', false, e.message); } finally { await b.close(); }
  const fail = results.filter((r) => !r.ok);
  console.log(`\n${results.length - fail.length}/${results.length} passed (${sec()} s)`);
  process.exit(fail.length ? 1 : 0);
})();
