// (FUN12 → FLOW16, wave 16) The big button and the stock in the real build (dist/test.html) by REAL touch at 390×844.
// The balance (the owner, 4.10: "הדמות לא עושה כלום… משחקי ביניים די דביליים"): a v21 player (past the FTUE) at the Mount's courses
// with NO stones: the pill is the course loop's ("מה נעשה עכשיו?") and says the stock plainly — never a period game; the deal
// holds his cards AND the extra card "▶ הביאו אבנים · כ־N אבנים · לוח של ≈ M דק׳"; the board opens from that card only (MATCH3's
// own card, no cycle intro); a job card plays with the stock at 0 and sets his stones (the crews wait, he does not); after a
// reload the pill is still the loop's. (fun12's cycle lives on at the games' table and in the menu: not on the pill.)
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/cycle-touch.cjs [--shots] [--no-build]
//   shots: test/out/cycle/{pill,deal,board,job}.png
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/cycle');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const SHOTS = args.includes('--shots');
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const note = (s) => console.log('      ' + s);

(async () => {
  if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
  const { STAGES } = await import(path.join(ROOT, 'src/game/content.js'));
  const HAR = STAGES.find((s) => s.id === 'har');
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const t00 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
    pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__DT_MAX = 0.6;
      try { if (!sessionStorage.getItem('cy-once')) { sessionStorage.setItem('cy-once', '1'); localStorage.clear(); localStorage.setItem('bh_settings', JSON.stringify({ demo: false })); } } catch (e) { /* blocked */ }
    });
    const E = (fn, a) => pg.evaluate(fn, a);
    const shot = async (n) => { if (!SHOTS) return; await E(() => { try { for (const a of document.getAnimations()) { try { a.finish(); } catch (e) { /* infinite */ } } } catch (e) { /* */ } }); await pg.screenshot({ path: path.join(OUT, n + '.png'), timeout: 120000 }); };
    const tapSel = async (sel, fx = 0.5, fy = 0.5, timeout = 15000) => { const l = pg.locator(sel).first(); await l.waitFor({ state: 'visible', timeout }); const bb = await l.boundingBox(); await pg.touchscreen.tap(bb.x + bb.width * fx, bb.y + bb.height * fy); return bb; };
    const boot = async () => { await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 240000 }); await pg.waitForTimeout(1500); };
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await boot();
    // the fixture: a v21 player at the Mount's courses (boards played before), the stock and the meter empty, written once, then a reload
    const FIX = ({ W }) => {
      const g = __T.game.state;
      g.ftue = 99; g.op = 1; g.name = g.name || 'יכין'; g.mishmar = g.mishmar || 3;
      g.st = { har: { w: 0.2 * W, ph: 1 } }; g.focus = 'har'; g.bh = g.bh.map(() => 0); g.harAcc = 1;
      while (g.crews.length < 2) g.crews.push({ at: 'har' });
      g.m3 = g.m3 && typeof g.m3 === 'object' ? g.m3 : {}; g.m3.level = { quarry: 3, forest: 1, gold: 1 }; g.stats.levels = 2;
      if (g.games) delete g.games.cycle;
      g.res.stone = 0; g.res.silver = 300;
      __T.game._.resync(); __T.game.save();
      return JSON.stringify({ st: g.st, res: g.res });
    };
    const wrote = await E(FIX, { W: HAR.W });
    note(`fixture: ${wrote}`);
    await pg.reload(); await boot();
    if (await E(() => !(__T.game.state.st.har && __T.game.state.st.har.p === 'courses'))) { note('the save did not come back with the reload: the fixture again'); await E(FIX, { W: HAR.W }); await pg.waitForTimeout(1500); }
    const closeCards = async () => {
      let calm = 0;
      for (let i = 0; i < 24 && calm < 4; i++) {
        const m = await pg.$('.gm-modal.on .gm-btn, .gm-modal.on button, .gm-mo.on .gm-mo-go');
        if (!m) { calm++; await pg.waitForTimeout(500); continue; }
        calm = 0; const bb = await m.boundingBox(); if (bb) await pg.touchscreen.tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(800);
      }
    };
    /* the site on "pay the next segment" with an empty meter and an empty stock; the course's line already played */
    const toPay = () => E(() => {
      const g = __T.game.state, s = g.st.har;
      if (s && s.p === 'courses') { if (s.set % 16 === 0) s.set += 2; s.paid = s.set; s.k = 0; s.chk = s.set; s.bad = []; for (const i of [0, 16, 32, 48, 64]) if (i < s.set && s.keys[i] == null) s.keys[i] = 0.8; }   // (mid-course: no key stone in his next share — the key's card would open at once, not the deal)
      g.res.stone = 0; if (g.jobs && g.jobs.cur && g.jobs.cur.har) g.jobs.cur.har.line = 1;
      __T.game._.resync(); __T.game.save();
      return s ? { p: s.p, set: s.set, paid: s.paid, n: s.n, stone: g.res.stone } : null;
    });
    await closeCards();
    const site0 = await toPay();
    await pg.waitForTimeout(1500);
    const pill = await E(() => { const p = document.querySelector('.gm-pill'); return p ? { kind: p.dataset.kind, txt: p.innerText.replace(/\s+/g, ' ').trim() } : null; });
    check('with no stones the pill is the course loop\'s and says the stock plainly ("המלאי: 0 אבנים · הצוותים ממתינים · הכהן ממשיך") — no period game', pill && pill.kind === 'jobs' && /המלאי: 0 אבנים/.test(pill.txt) && /הצוותים ממתינים/.test(pill.txt) && /הכהן ממשיך/.test(pill.txt) && !/הקלע|נדבך על נדבך|חציבת גוש|חמש אבנים/.test(pill.txt), `${pill && pill.txt} · site ${JSON.stringify(site0)}`);
    const chip = await E(() => { const c = document.querySelector('.gm-chip[data-r="stone"] .gm-num'); return c ? c.textContent : ''; });
    check('the stone chip reads "have / need" when short', /\/\s*\d+/.test(chip) && /^0/.test(chip.trim()), chip);
    await shot('pill');
    await tapSel('.gm-pill');
    await pg.waitForSelector('.gm-deal.on', { timeout: 15000 });
    await pg.waitForTimeout(600);
    const deal = await E(() => { const d = document.querySelector('.gm-deal.on'); return { cards: [...d.querySelectorAll('.gm-jc')].map((c) => c.dataset.job), quarry: (d.querySelector('.gm-jc.quarry') || {}).innerText || '' }; });
    check('the deal holds his cards and the extra card "▶ הביאו אבנים · כ־N אבנים · לוח של ≈ M דק׳"', deal.cards.filter((j) => j !== 'quarry').length >= 1 && deal.cards.includes('quarry') && /הביאו אבנים/.test(deal.quarry) && /כ־\D?\d+\D? אבנים/.test(deal.quarry) && /לוח של ≈ \D?\d\D? דק/.test(deal.quarry), `${deal.cards.join('+')} · ${deal.quarry.replace(/\s+/g, ' ')}`);
    await shot('deal');
    // the board from the extra card only: MATCH3's own card (no cycle intro); a player who leaves after a look keeps what was gathered
    const b0 = await E(() => window.__GAME_LOG.length);
    // (a card of the day — the rest, the wage — pushes the deal down while it stands: wait for a clear screen, then the extra card)
    const clear = async () => { for (let i = 0; i < 30; i++) { const st = await E(() => ({ modal: !!document.querySelector('.gm-modal.on'), sheet: !!document.querySelector('.gm-sheet.on') })); if (st.sheet) await E(() => __T.game.ui.closeSheet()); if (!st.modal && !st.sheet) break; await closeCards(); } await pg.waitForTimeout(700); await pg.waitForFunction(() => { const d = document.querySelector('.gm-deal'); if (!d || !d.classList.contains('on')) return true; const t = getComputedStyle(d).transform; return t === 'none' || /^matrix\(1, 0, 0, 1, 0, 0\)$/.test(t); }, null, { timeout: 5000 }).catch(() => {}); };
    await clear();
    if (!(await E(() => !!document.querySelector('.gm-deal.on')))) { await tapSel('.gm-pill'); await pg.waitForSelector('.gm-deal.on', { timeout: 15000 }); await pg.waitForTimeout(700); }
    note('at the extra card: ' + await E(() => { const c = document.querySelector('.gm-deal.on .gm-jc.quarry'); const r = c.getBoundingClientRect(); const e = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return JSON.stringify({ r: [r.left, r.top, r.width, r.height].map(Math.round), hit: e && (e.className + '').slice(0, 40), dealT: getComputedStyle(document.querySelector('.gm-deal')).transform, root: document.querySelector('.gm').className, sheet: __T.game.ui.sheet, log: window.__GAME_LOG.slice(-5).map((e) => e.type) }); }));
    await tapSel('.gm-deal.on .gm-jc.quarry');
    const opened = await pg.waitForSelector('.m3 .m3-card .m3-cta', { timeout: 30000 }).then(() => true, () => false);
    if (!opened) note('no board: ' + await E((b0) => JSON.stringify({ busy: __T.game.busy, deal: !!document.querySelector('.gm-deal.on'), m3: !!document.querySelector('div.m3'), modal: !!document.querySelector('.gm-modal.on'), log: window.__GAME_LOG.slice(b0).map((e) => e.type + (e.d && (e.d.job || e.d.at) ? ':' + (e.d.job || e.d.at) : '')).slice(0, 14) }), b0));
    const intro = await E(() => !!document.querySelector('.g10-cy-intro'));
    check('the extra card opens the board itself (MATCH3\'s card), never a cycle game', opened && !intro, `m3 ${opened} · cycle intro ${intro}`);
    await shot('board');
    await tapSel('.m3 .m3-card .m3-cta');
    await pg.waitForTimeout(2500);
    await tapSel('.m3 .m3-exit');
    await pg.waitForTimeout(700);
    const q = await E(() => { const b = [...document.querySelectorAll('.m3 .m3-card button')].find((x) => /^\s*לצאת\s*$/.test(x.textContent)); if (!b) return null; const r = b.getBoundingClientRect(); return { x: r.x + r.width / 2, y: r.y + r.height / 2 }; });
    if (q) await pg.touchscreen.tap(q.x, q.y); else note('board: no "לצאת" on the exit card');
    await pg.waitForFunction(() => !document.querySelector('div.m3'), null, { timeout: 20000 }).catch(() => {});
    await pg.waitForTimeout(1500);
    const after = await E((b0) => { const L = window.__GAME_LOG.slice(b0); return { end: (L.find((e) => e.type === 'm3Won' || e.type === 'm3Lost' || e.type === 'm3Declined') || {}).type || null, cycle: L.some((e) => e.type === 'cycle') }; }, b0);
    check('the board went through the board\'s accounting; the cycle did not move', !!after.end && !after.cycle, JSON.stringify(after));
    // his own work never waits for the stock: a job card with the stock at 0 sets his stones (the job's sheet plays itself here: __MG_AUTO)
    await closeCards();
    const site1 = await toPay();
    await pg.waitForTimeout(2000);
    await E(() => { window.__MG_AUTO = 1; });
    const d2 = await E(() => { const d = document.querySelector('.gm-deal.on'); return d ? [...d.querySelectorAll('.gm-jc')].map((c) => c.dataset.job) : null; });
    if (!d2) { await tapSel('.gm-pill'); await pg.waitForSelector('.gm-deal.on', { timeout: 15000 }); await pg.waitForTimeout(600); }
    const jobs = await E(() => [...document.querySelectorAll('.gm-deal.on .gm-jc')].map((c) => c.dataset.job).filter((j) => j !== 'quarry'));
    const pickJ = jobs.find((j) => j !== 'key' && j !== 'strike') || jobs[0];
    note(`deal 2: ${jobs.join('+')} → ${pickJ} · site ${JSON.stringify(site1)}`);
    await shot('job');
    await clear();
    if (!(await E(() => !!document.querySelector('.gm-deal.on')))) { await tapSel('.gm-pill'); await pg.waitForSelector('.gm-deal.on', { timeout: 15000 }); await pg.waitForTimeout(700); }
    await tapSel(`.gm-deal.on .gm-jc[data-job="${pickJ}"]`);
    const j0 = await E(() => window.__GAME_LOG.length);
    const jd = await pg.waitForFunction(() => window.__GAME_LOG.some((e) => e.type === 'jobDone'), null, { timeout: 60000 }).then(() => true, () => false);
    if (!jd) note('no jobDone: ' + await E((j0) => JSON.stringify({ busy: __T.game.busy, deal: !!document.querySelector('.gm-deal.on'), mg: !!document.querySelector('.fx-mg'), modal: !!document.querySelector('.gm-modal.on'), log: window.__GAME_LOG.slice(j0).map((e) => e.type + (e.d && (e.d.job || e.d.at || e.d.kind) ? ':' + (e.d.job || e.d.at || e.d.kind) : '')).slice(0, 16) }), j0));
    const res = await E(() => { const e = window.__GAME_LOG.find((x) => x.type === 'jobDone'); const g = __T.game.state; return { job: e && e.d.job, stones: e && e.d.stones, set: g.st.har.set, hand: g.st.har.hand | 0, stone: g.res.stone }; });
    check('a job card plays with the stock at 0 and sets his stones by hand (the crews wait, he does not)', jd && res.stones > 0 && res.set > site1.set && res.stone === 0 && res.hand > 0, JSON.stringify(res));
    await E(() => { window.__MG_AUTO = 0; });
    // a reload: the pill is still the loop's, never a period game
    await pg.reload(); await boot();
    if (await E(() => !(__T.game.state.st.har && __T.game.state.st.har.p === 'courses'))) { note('the save did not come back with the reload (2): the fixture again'); await E(FIX, { W: HAR.W }); await pg.waitForTimeout(1500); }
    await closeCards(); await toPay(); await pg.waitForTimeout(2500);
    const pill2 = await E(() => { const p = document.querySelector('.gm-pill'); return p ? { kind: p.dataset.kind, txt: p.innerText.replace(/\s+/g, ' ').trim() } : null; });
    check('after a reload the pill is still the loop\'s', pill2 && pill2.kind === 'jobs' && !/▶/.test(pill2.txt), pill2 && pill2.txt);
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } finally { await b.close(); }
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed · ${Math.round((Date.now() - t00) / 1000)} s`);
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
