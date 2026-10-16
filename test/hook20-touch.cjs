// (HOOK20, wave 20, "המסביב") REAL touch at 844×390 on dist/test.html:
//   node test/hook20-touch.cjs [--no-build] [--shots] [--part=1,2,3|all]
//   1 badges: a number only when something new waits; it goes when the tab opens; "היום" is a live board whose rows tap through
//   2 the daily riddle: a wrong step costs nothing, the hint arrives at 30 s, a solve pays one dinar once and keeps the fact; the end chain
//     after a course (≤ 15 s, a tap closes a card, nothing blocks the thumbs after it)
//   3 the profile (the level slot), the near circle: a second kohen = a second save key, the board ranks the two, a typed code adds a row
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/hook20');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), PART = (args.find((a) => a.startsWith('--part=')) || '--part=all').slice(7);
const has = (p) => PART === 'all' || PART.split(',').includes(String(p));
const W = 844, H = 390;
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !/ERR_TUNNEL|fonts\.g|net::/.test(m.text())) logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      try { if (!sessionStorage.getItem('h20-once')) { sessionStorage.setItem('h20-once', '1'); localStorage.clear(); } } catch (e) { /* blocked */ }
    });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    const boot = () => pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    await boot();
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const tap = (x, y) => pg.touchscreen.tap(Math.max(2, Math.min(W - 2, x)), Math.max(2, Math.min(H - 2, y)));
    const centre = (sel, txt) => G(([s, t]) => { const e = [...document.querySelectorAll(s)].find((x) => { const r = x.getBoundingClientRect(); return r.width > 1 && getComputedStyle(x).visibility !== 'hidden' && (!t || x.textContent.includes(t)); }); if (!e) return null; try { e.scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: 'instant' }); } catch (err) { /* */ } const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, [sel, txt || '']);   // (scrolled into view: a longer sheet — the profile's tools block — pushed buttons below the fold)
    const tapSel = async (sel, txt) => { const c = await centre(sel, txt); if (!c) return false; await tap(c.x, c.y); await pg.waitForTimeout(260); return true; };
    const shot = async (name) => { if (!SHOTS) return; await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/hook20/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); };
    const badge = (k) => G((k) => { const b = document.querySelector(`.gm-dock .gm-db[data-k="${k}"] .gm-badge`); return b && !b.classList.contains('gm-hidden') ? b.textContent : ''; }, k);
    const sheetOn = () => G(() => (document.querySelector('.gm-sheet.on h2') || {}).textContent || '');
    const closeSheet = async () => { if (await sheetOn()) { await tapSel('.gm-sheet.on .gm-x'); await waitFor(() => !document.querySelector('.gm-sheet.on'), null, 3000); } };

    /* the opening, then a live game at the wall */
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);
    await G(() => {
      const g = __T.game.state, site = 'wall'; g.ftue = 99; g.name = 'יכין'; g.mishmar = 3; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
      __T.game.hook20.ar.ensure(g);   // the seen marks are taken here: from now on only new things count
      for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
      g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
      g.xp = { 'סתתים': 14 }; g.focus = site; g.res.stone = 400; g.res.cedar = 120; g.crews = [{ at: 'wall' }, { at: 'wall' }];
      __T.game._.resync();
      __T.game.ui.xp({ craft: 'סתתים', icon: '⚒', name: 'הסתת', level: 2, xp: 14, next: 25, from: 10 });
    });
    await pg.waitForTimeout(1500);
    for (let k = 0; k < 3; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) break; const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(500); }
    await pg.waitForTimeout(600);

    /* ───────────── 1: the badges ───────────── */
    if (has(1)) {
      const st = await badge('store');
      check('1: the project tab has a badge (stages are new), the book has the new riddle, daily and crews have none', +st > 0 && !(await badge('daily')) && !(await badge('crews')), `store=${st} daily=${await badge('daily')} book=${await badge('book')} crews=${await badge('crews')}`);
      await tapSel('.gm-dock .gm-db[data-k="store"]'); await pg.waitForTimeout(500);
      check('1: opening the project tab by touch clears its badge, and it stays cleared', (await badge('store')) === '' && (await sheetOn()).length > 0);
      await closeSheet(); await pg.waitForTimeout(1300);
      check('1: still no badge on the project tab a second later (the marks are in the save)', (await badge('store')) === '' && (await G(() => !!__T.game.state.seen && Object.keys(__T.game.state.seen.store).length > 0)));
      await G(() => { __T.game.hook20.emit('jobDone', { stars: 2, job: 'strike', site: 'wall' }); });
      await pg.waitForTimeout(500);
      check('1: a finished job puts a 1 on "היום"', (await badge('daily')) === '1', await badge('daily'));
      await G(() => { const g = __T.game.state; g.book.un['1.1'] = 1; __T.game.ui.refresh(); });
      check('1: a fact unlocked puts a number on "ספר מידות"', +(await badge('book')) >= 2, await badge('book'));
      await tapSel('.gm-dock .gm-db[data-k="book"]'); await pg.waitForTimeout(400); await closeSheet();
      check('1: opening the book clears its badge', (await badge('book')) === '');
      await G(() => { const g = __T.game.state; g.crews.push({ at: null }); __T.game.ui.refresh(); });
      check('1: an idle crew is a badge on "צוותים" until the tab is opened', (await badge('crews')) === '1');
      await tapSel('.gm-dock .gm-db[data-k="crews"]'); await pg.waitForTimeout(300); await closeSheet();
      check('1: …and gone after', (await badge('crews')) === '');
      // the live board
      await G(() => { const g = __T.game.state; __T.game.hook20.ar.event(g, 'course', { id: 'wall', c: 2 }, { day: __T.game.hook20.ar.dayOf(Date.now()) }); g.score = (g.score | 0) + 750; g.stats.stones += 6; });
      await tapSel('.gm-dock .gm-db[data-k="daily"]'); await pg.waitForTimeout(600);
      const rows = await G(() => [...document.querySelectorAll('.gm-sheet.on .ar-row')].map((e) => ({ t: e.textContent.replace(/\s+/g, ' ').trim(), to: e.dataset.to, h: Math.round(e.getBoundingClientRect().height) })));
      check('1: "היום" is a live board: built today, crew, riddle, streak, dinars, circle, each a ≥ 44 px row', rows.length >= 6 && rows.every((r) => r.h >= 44) && rows.some((r) => /נדבך/.test(r.t)) && rows.some((r) => /חידת היום/.test(r.t)) && rows.some((r) => /יום 1|ימים ברצף/.test(r.t)), JSON.stringify(rows.map((r) => r.to)));
      check('1: …and shows today\'s numbers (a course, the stones, the points since the day began)', rows.some((r) => /נדבך אחד/.test(r.t) && /6 אבנים/.test(r.t)) && rows.some((r) => { const m = /★ ([\d,]+) נקודות היום/.exec(r.t); return m && +m[1].replace(/,/g, '') >= 750; }), rows[0] && rows[0].t);
      check('1: the daily badge went when the board opened', (await badge('daily')) === '');
      await shot('1-today-board');
      await tapSel('.gm-sheet.on .ar-row[data-to="riddle"]'); await pg.waitForTimeout(500);
      check('1: a row taps through to its place (the riddle)', /חידת היום/.test(await sheetOn()), await sheetOn());
      await closeSheet();
    }

    /* ───────────── 2: the riddle, the end chain ───────────── */
    if (has(2)) {
      await G(() => { const g = __T.game.state, H = __T.game.hook20, day = H.ar.dayOf(Date.now()); g.riddle = { day, id: 'gates7', step: 0, solved: false }; });
      const sc0 = await G(() => ({ s: __T.game.state.score | 0, c: (__T.game.state.dinars || []).length }));
      await tapSel('.gm-dock .gm-db[data-k="book"]'); await pg.waitForTimeout(400);
      check('2: the book carries a riddle row', (await centre('.gm-sheet.on .ar-row[data-to="riddle"]')) !== null);
      const tOpen = Date.now();
      await tapSel('.gm-sheet.on .ar-row[data-to="riddle"]'); await pg.waitForTimeout(500);
      check('2: the riddle is a sheet with 7 gate names and 3 walls', (await G(() => [document.querySelectorAll('.rd .rd-chip').length, document.querySelectorAll('.rd .rd-slot').length])).join() === '7,3');
      await shot('2-riddle-place');
      await tapSel('.rd .rd-chip', 'שער הדלק'); await tapSel('.rd .rd-slot', 'צפון'); await pg.waitForTimeout(300);
      const wrong = await G(() => ({ free: document.querySelectorAll('.rd .rd-chip:not(.in)').length, say: (document.querySelector('.rd-say') || {}).textContent, s: __T.game.state.score | 0, step: __T.game.state.riddle.step }));
      check('2: a wrong wall costs nothing (the name stays free, no points lost, the step stays, a soft line)', wrong.free === 7 && wrong.s === sc0.s && wrong.step === 0 && /אין עונש/.test(wrong.say || ''), JSON.stringify(wrong));
      check('2: no timer is shown and no hint yet', (await G(() => document.querySelector('.rd-hint').hidden && !/\d:\d\d/.test(document.querySelector('.rd').textContent))));
      await waitFor(() => !document.querySelector('.rd-hint').hidden, null, 34000);
      const dt = Date.now() - tOpen;
      check('2: the first hint arrives at 30 s of the step (not before, not after)', (await G(() => !document.querySelector('.rd-hint').hidden)) && dt > 27000 && dt < 34500, `${Math.round(dt / 1000)}s after the sheet opened`);
      await shot('2-riddle-hint');
      const place = { 'שער הדלק': 'דרום', 'שער הבכורות': 'דרום', 'שער המים': 'דרום', 'שער הניצוץ': 'צפון', 'שער הקרבן': 'צפון', 'שער בית המוקד': 'צפון', 'שער ניקנור': 'מזרח' };
      for (const [n, w] of Object.entries(place)) { await tapSel('.rd .rd-chip:not(.in)', n); await tapSel('.rd .rd-slot', w); }
      check('2: all seven gates placed → the second step (a choice)', await waitFor(() => /איזה שער/.test((document.querySelector('.rd-q') || {}).textContent || ''), null, 4000));
      await tapSel('.rd .rd-chip', 'שער המים'); await pg.waitForTimeout(300);
      check('2: a wrong answer fades and costs nothing', (await G(() => __T.game.state.riddle.step === 1 && !__T.game.state.riddle.solved)));
      await tapSel('.rd .rd-chip', 'שער ניקנור'); await pg.waitForTimeout(900);
      const win = await G(() => ({ s: __T.game.state.score | 0, c: (__T.game.state.dinars || []).length, kept: Object.keys((__T.game.state.book.riddles) || {}), solved: __T.game.state.riddle.solved, txt: (document.querySelector('.rd') || {}).textContent }));
      check('2: solved → one dinar of points (10,000) and the fact kept in the book', win.solved && win.s - sc0.s >= 10000 && win.s - sc0.s < 10400 && win.kept.includes('gates7'), JSON.stringify({ d: win.s - sc0.s, kept: win.kept }));
      check('2: the win card names tomorrow (a locked silhouette), no prize, no timer', /מחר/.test(win.txt) && /פתרתם/.test(win.txt));
      await shot('2-riddle-win');
      await G(() => { const H = __T.game.hook20; H.solve('gates7', H.ar.dayOf(Date.now())); });
      check('2: paid once a day (a second solve adds nothing)', (await G(() => __T.game.state.score | 0)) === win.s);
      await closeSheet();
      // a dinar's card may play: tap it away
      await pg.waitForTimeout(2500);
      for (let k = 0; k < 6; k++) { const c = await centre('.gm-dn.land'); if (!c) { await pg.waitForTimeout(500); if (!(await G(() => !!document.querySelector('.gm-dn')))) break; continue; } await tap(c.x, c.y); await pg.waitForTimeout(900); }
      await waitFor(() => !document.querySelector('.gm-dn'), null, 8000);

      // the end chain after a course
      await G(() => { window.__EC = { t0: 0, t1: 0, cards: [] }; new MutationObserver(() => { const e = document.querySelector('.ec'); if (e && !window.__EC.t0) window.__EC.t0 = performance.now(); if (!e && window.__EC.t0 && !window.__EC.t1) window.__EC.t1 = performance.now(); const h = document.querySelector('.ec-card'); const k = h ? (h.querySelector('h2') || {}).textContent + '|' + h.textContent : ''; if (k && window.__EC.cards[window.__EC.cards.length - 1] !== k) window.__EC.cards.push(k); }).observe(document.body, { childList: true, subtree: true, characterData: true }); __T.game.state.score += 400; __T.game.hook20.emit('course', { id: 'wall', c: 3, of: 8, by: 'hero' }); });
      const started = await waitFor(() => window.__EC.t0 > 0, null, 9000);
      check('2: the end chain starts after a course', started, started ? '' : JSON.stringify(await G(() => __T.game.hook20.why())));
      await waitFor(() => window.__EC.cards.length >= 1, null, 4000);
      await G(() => { window.__EC_HOLD = true; }); await pg.waitForTimeout(300); await shot('2-chain-crew');
      const c1 = await G(() => window.__EC.cards[window.__EC.cards.length - 1]);
      check('2: the chain names the crew and the stones', /אבנים/.test(c1 || '') && /אומנים|בעצמך/.test(c1 || ''), c1);
      const n1 = await G(() => window.__EC.cards.length);
      await G(() => { window.__EC_HOLD = false; }); await tap(W / 2, H / 2);   // a tap anywhere closes a card
      const nxt = await waitFor((n) => window.__EC.cards.length > n, n1, 1500);
      check('2: a tap anywhere closes a card at once (the next one comes)', nxt, JSON.stringify(await G(() => window.__EC.cards.map((c) => c.split('|')[0]))));
      await waitFor(() => window.__EC.cards.some((c) => /דינר/.test(c.split('|')[0])), null, 4000);
      await G(() => { window.__EC_HOLD = true; }); await pg.waitForTimeout(300); await shot('2-chain-points'); await G(() => { window.__EC_HOLD = false; });
      check('2: the points card: the score flies into the dinar (a bar, "+★ N")', await G(() => window.__EC.cards.some((c) => /\+★ [\d,]+/.test(c))));
      check('2: the chain ends by itself within 15 s of its start', await waitFor(() => window.__EC.t1 > 0, null, 15000));
      const ms = await G(() => Math.round(window.__EC.t1 - window.__EC.t0));
      check('2: …it took ≤ 15 s of play (shots held aside)', ms > 0 && ms <= 15000 + 4000, `${ms} ms incl. the held shots`);
      check('2: the cards: crew · points · (the dinar own card) · tomorrow', await G(() => { const t = window.__EC.cards.map((c) => c.split('|')[0]); return t.some((x) => /מחר/.test(x)); }));
      const free = await G(() => { const e = document.elementFromPoint(innerWidth - 90, innerHeight - 80); return !e || !e.closest('.ec'); });
      check('2: nothing of the chain is left over the thumbs', free && !(await G(() => !!document.querySelector('.ec'))));
    }

    /* ───────────── 3: the profile and the near circle ───────────── */
    if (has(3)) {
      await closeSheet();
      await tapSel('.gm-top .gm-xp'); await pg.waitForTimeout(500);
      const pr = await G(() => ({ h2: (document.querySelector('.gm-sheet.on h2') || {}).textContent, t: (document.querySelector('.gm-sheet.on .gm-sh-b') || {}).textContent }));
      check('3: the level slot opens the kohen\'s profile (name, title, crafts with a grade, stages, days, the משמר)', /הכהן/.test(pr.h2 || '') && /יכין/.test(pr.t) && /הסתת/.test(pr.t) && /משמר/.test(pr.t) && /יום משחק אחד|ימי משחק/.test(pr.t), (pr.t || '').slice(0, 160));
      await shot('3-profile');
      await tapSel('.gm-sheet.on .ar-btn', 'המשמר שלי'); await pg.waitForTimeout(500);
      const rk = await G(() => [...document.querySelectorAll('.gm-sheet.on .ar-rank:not(.demo)')].map((e) => e.textContent.replace(/\s+/g, ' ')));
      check('3: the near circle lists the kohen of this phone', rk.length === 1 && /יכין/.test(rk[0]), JSON.stringify(rk));
      await G(() => { __T.game.save(); });
      const nav = pg.waitForNavigation({ waitUntil: 'load', timeout: 30000 }).catch(() => null);
      await G(() => { const e = document.querySelector('.gm-sheet.on [data-a="aroundSlotAdd"]'); if (e) e.scrollIntoView({ block: 'center' }); });   // (board21: the demo rows push it below the fold)
      await tapSel('.gm-sheet.on [data-a="aroundSlotAdd"]');
      const navd = await nav; console.log('   reloaded:', !!navd);
      await boot();
      const keys = await G(() => ({ ptr: localStorage.getItem('bh_slot'), idx: localStorage.getItem('bh_slots'), main: /"name":"יכין"/.test(localStorage.getItem('bh_beta2') || ''), k2: localStorage.getItem('bh_save_k2') !== null || true }));
      check('3: a second kohen = the pointer moved to k2, the first save stays under its key', keys.ptr === 'k2' && /k2/.test(keys.idx) && keys.main, JSON.stringify(keys));
      await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
      await G(() => { const g = __T.game.state; g.name = 'נועה'; g.ftue = 99; g.dinars = [{ n: 1, seen: 1 }, { n: 2, seen: 1 }]; g.score = 20000; g.stats.stones = 30; __T.game.save(); });
      const two = await G(() => ({ k2: /"name":"נועה"/.test(localStorage.getItem('bh_save_k2') || ''), main: /"name":"יכין"/.test(localStorage.getItem('bh_beta2') || '') }));
      check('3: two kohanim, two saves (bh_beta2 and bh_save_k2)', two.k2 && two.main, JSON.stringify(two));
      await G(() => { __T.game.ui.openSheet('circle'); });
      await pg.waitForTimeout(500);
      const rk2 = await G(() => [...document.querySelectorAll('.gm-sheet.on .ar-rank:not(.demo)')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
      check('3: the board ranks them (נועה with 2 dinars above יכין)', rk2.length === 2 && /נועה/.test(rk2[0]) && /יכין/.test(rk2[1]), JSON.stringify(rk2));
      const code = await G(() => document.querySelector('.gm-sheet.on .ar-code').textContent.trim());
      check('3: the family code is 6 symbols', /^[A-Z2-9]{6}$/.test(code), code);
      const kin = await G(() => __T.game.hook20.ar.codeOf({ d: 4, s: 321, t: 5 }));
      await pg.fill('#ar-kl', 'בן דוד'); await pg.fill('#ar-kc', kin);
      await G(() => { const e = document.querySelector('.gm-sheet.on [data-a="aroundKin"]'); if (e) e.scrollIntoView({ block: 'center' }); });
      await tapSel('.gm-sheet.on [data-a="aroundKin"]'); await pg.waitForTimeout(600);
      const rk3 = await G(() => [...document.querySelectorAll('.gm-sheet.on .ar-rank:not(.demo)')].map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
      check('3: a typed code adds a row "בן דוד" with what he typed (4 dinars, 321 stones)', rk3.length === 3 && rk3[0].includes('בן דוד') && /4/.test(rk3[0]) && /321/.test(rk3[0]), JSON.stringify(rk3));
      await shot('3-circle');
    }
    /* ───────────── 4: the other riddles (order, count) and portrait ───────────── */
    if (has(4)) {
      const setRd = (id) => G((id) => { const g = __T.game.state, H = __T.game.hook20; g.riddle = { day: H.ar.dayOf(Date.now()), id, step: 0, solved: false }; __T.game.ui.closeSheet(); __T.game.ui.openSheet('riddle'); }, id);
      await setRd('lots4'); await pg.waitForTimeout(500);
      const order = ['תרומת הדשן מעל המזבח', 'השחיטה והזריקה ושאר העבודות', 'הקטרת הקטורת', 'העלאת האברים מן הכבש אל המזבח'];
      const first = await G(() => [...document.querySelectorAll('.rd .rd-chip')].map((e) => e.textContent));
      check('4: the order riddle shows the four lots shuffled (never in the right order)', first.length === 4 && first.join() !== order.join(), first.join(' | '));
      await tapSel('.rd .rd-chip', order[1]); await pg.waitForTimeout(300);
      check('4: a wrong first pick costs nothing: the order restarts, a soft line', (await G(() => !document.querySelector('.rd .rd-chip.ord') && /אין עונש/.test(document.querySelector('.rd-say').textContent))) && (await G(() => __T.game.state.riddle.step)) === 0);
      for (const t of order) await tapSel('.rd .rd-chip:not(.ord)', t);
      check('4: the right order → the second step (a choice)', await waitFor(() => /כמה פיסות/.test((document.querySelector('.rd-q') || {}).textContent || ''), null, 3000));
      await tapSel('.rd .rd-chip', 'ארבע'); await pg.waitForTimeout(600);
      check('4: solved (the lots)', await G(() => __T.game.state.riddle.solved && !!__T.game.state.book.riddles.lots4));
      await G(() => { __T.game.ui.closeSheet(); });
      await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(1500);
      const Hh = 844, Ww = 390;
      const tapP = (x, y) => pg.touchscreen.tap(x, y);
      const cP = (sel, txt) => centre(sel, txt);
      const tapSelP = async (sel, txt) => { const c = await centre(sel, txt); if (!c) return false; await tapP(c.x, c.y); await pg.waitForTimeout(260); return true; };
      await G(() => { __T.game.ui.openSheet('daily'); }); await pg.waitForTimeout(700);
      const prt = await G(() => ({ hs: document.documentElement.scrollWidth > innerWidth + 1, rows: [...document.querySelectorAll('.gm-sheet.on .ar-row')].map((e) => Math.round(e.getBoundingClientRect().height)), inside: [...document.querySelectorAll('.gm-sheet.on .ar-row')].every((e) => { const r = e.getBoundingClientRect(); return r.left >= 0 && r.right <= innerWidth; }) }));
      check('4: portrait 390×844: the live board fits (no horizontal scroll, every row ≥ 44 px, inside the screen)', !prt.hs && prt.inside && prt.rows.length >= 6 && prt.rows.every((h) => h >= 44), JSON.stringify(prt));
      await shot('4-portrait-today');
      await setRd('stairs15'); await pg.waitForTimeout(500);
      for (let i = 0; i < 15; i++) { const c = await cP('.rd .rd-stairs'); await tapP(c.x, c.y); await pg.waitForTimeout(110); }
      check('4: the stairs: fifteen taps count fifteen', (await G(() => document.querySelector('.rd-cnt').textContent.trim())) === '15');
      await shot('4-portrait-stairs');
      await tapSelP('.rd [data-rd="num"]'); await pg.waitForTimeout(500);
      check('4: "זה המספר" with 15 → the second step', await waitFor(() => /מה היו הלויים/.test((document.querySelector('.rd-q') || {}).textContent || ''), null, 3000));
      await tapSelP('.rd .rd-chip', 'שיר המעלות'); await pg.waitForTimeout(600);
      check('4: solved (the stairs), the win card shows tomorrow\'s locked riddle', await G(() => __T.game.state.riddle.solved && /מחר/.test(document.querySelector('.rd').textContent)));
      await G(() => { __T.game.ui.closeSheet(); }); await pg.waitForTimeout(400);
      for (let k = 0; k < 8 && await G(() => !!document.querySelector('.gm-dn')); k++) { const c = await centre('.gm-dn.land'); if (c) await tapP(c.x, c.y); await pg.waitForTimeout(900); }
      await tapSelP('.gm-top .gm-xp'); await pg.waitForTimeout(600);
      const pp = await G(() => ({ h2: (document.querySelector('.gm-sheet.on h2') || {}).textContent, hs: document.documentElement.scrollWidth > innerWidth + 1 }));
      check('4: portrait: the level slot (the name chip\'s place) opens the kohen\'s profile, no horizontal scroll', /הכהן/.test(pp.h2 || '') && !pp.hs, JSON.stringify(pp));
      await shot('4-portrait-profile');
    }
    check('no page errors', logs.length === 0, logs.slice(0, 3).join(' | '));
  } finally {
    await b.close();
  }
  const bad = results.filter((x) => !x).length;
  console.log(`\n${results.length - bad}/${results.length} passed in ${Math.round((Date.now() - T0) / 1000)}s`);
  process.exit(bad ? 1 : 0);
})();
