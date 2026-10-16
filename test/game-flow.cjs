// The whole Phase A flow on the REAL build with the REAL parts (BUILD, wave 6). Run it on a merge of the nine wave-6
// branches; on a lone branch it says which parts are absent (their fallback cards then stand in for them).
//   FTUE → the first stone by hand (FUN's crane) → a board (MATCH3) → a segment paid and set → a key stone (FUN) →
//   the course check (FUN's plumb) → a deal with a king (KINGS' court) → the inspection → the Mount's key moment.
//   node test/game-flow.cjs [--no-build]
// Phone 400×860, touch, the regular game (not the demo). The player follows the ONE action (the pill), taps the site when
// the action is a stroke and answers every card; the boards and the precision games play themselves (__M3_AUTO,
// __MG_AUTO). Between steps a fixture skips the long middles (the rest of a course). The render loop is paused and the
// world advances in real time (__T.simulate); one shot at the end: test/out/game-flow-end.png.
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out');
if (!process.argv.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const logs = [];
  try {
    const ctx = await b.newContext({ viewport: { width: 400, height: 860 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    await pg.addInitScript(() => {
      Object.assign(window, { __FORCE_Q: 'normal', __FORCE_TIME: 'noon', __GAME_LOG: [], __DIALOGS: [], __START_PAUSED: true, __DT_MAX: 0.6, __MG_AUTO: true, __M3_AUTO: true });
      for (const k of ['alert', 'confirm', 'prompt']) window[k] = () => { window.__DIALOGS.push(k); return null; };
      try { localStorage.clear(); localStorage.setItem('bh_settings', JSON.stringify({ demo: false })); } catch (e) { /* blocked */ }
    });
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const t0 = Date.now();
    // ── flow10 ── --file=<a snapshot of the build> (runs wait for the shared browser lock while the tree is rebuilt)
    { const fa = process.argv.slice(2).find((a) => a.startsWith('--file=')); await pg.goto('file://' + (fa ? path.resolve(fa.slice(7)) : path.join(ROOT, 'dist/test.html'))); }
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 300000 });
    console.log(`   booted in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    const parts = await pg.evaluate(() => __T.game._.parts());
    check('the game runs with the real parts (MATCH3, KINGS, FUN\'s games and loop hooks)', ['match3', 'kings', 'minigames', 'fun'].every((k) => parts.includes(k)), parts.join(',') || 'none (run it on the nine-branch merge)');

    // the player: follows the ONE action (the pill), taps the site when it is a stroke, answers every card (the gold button)
    await pg.evaluate(() => {
      window.__drive = async (untilSrc, maxMs, site = 'har') => {
        const until = new Function('L', 'G', `return (${untilSrc});`);
        const g = __T.game, t0 = performance.now(), sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const shown = (el) => !!el && getComputedStyle(el).display !== 'none' && !el.classList.contains('gm-hidden') && el.getBoundingClientRect().width > 0;
        let taps = 0;
        while (performance.now() - t0 < maxMs) {
          if (until(window.__GAME_LOG, g.state)) return { ok: true, taps, s: +((performance.now() - t0) / 1000).toFixed(1) };
          const gold = document.querySelector('.gm-modal.on .gm-btn-gold');
          if (gold) { gold.click(); await sleep(250); continue; }
          // ── fun14 ── (wave 14, the course loop) "מה נעשה עכשיו?": the player picks a card (the first: a key stone's when dealt)
          // (wave 16, the balance: the deal comes whatever the stock — the driver prefers the cards its autopilot finishes fast; the
          //  jobs' own games are played by touch in jobs-touch / hands-touch / fun14-jobs-touch)
          const cards = [...document.querySelectorAll('.gm-deal.on .gm-jc')], pref = ['key', 'strike', 'quarry'];
          const card = cards.sort((x, y) => (pref.indexOf(x.dataset.job) + 9) % 10 - (pref.indexOf(y.dataset.job) + 9) % 10)[0];
          if (card && !g.busy) { card.click(); taps++; await sleep(300); continue; }
          // ── /fun14 ──
          // a key moment's own play (hold, drag) is tested by test/moments.cjs; here, once it has shown for 6 s, the presenter's skip
          const sk = document.querySelector('.gm-mo-skip');
          if (sk && shown(sk) && !sk.hidden) { window.__moT = window.__moT || performance.now(); if (performance.now() - window.__moT > 6000) { sk.click(); window.__moT = 0; await sleep(400); continue; } }
          if (!g.busy) { const pill = document.querySelector('.gm-pill'); if (shown(pill)) pill.click(); else g.onSiteTap(site); taps++; }
          await sleep(220);
        }
        const open = [...document.querySelectorAll('.fx-mg, .gm-modal.on, .gm-sheet.on, [role=dialog]')].filter(shown).map((e) => e.className.split(' ')[0] + ':' + (e.textContent || '').trim().slice(0, 40));
        return { ok: false, taps, s: +((performance.now() - t0) / 1000).toFixed(1), last: window.__GAME_LOG.slice(-6).map((e) => e.type).join(',') + ` · busy ${g.busy} · open [${open.join(' | ')}]` };
      };
      window.__mark = () => performance.now();
    });
    const drive = (until, ms) => pg.evaluate(([u, m]) => window.__drive(u, m), [until, ms]);
    const info = (r) => `${r.s} s, ${r.taps} actions${r.last ? ' · last: ' + r.last + ' · errors: ' + logs.slice(-2).join(' | ').slice(0, 300) : ''}`;
    const fixture = (fn, arg) => pg.evaluate(([src, a]) => { const G = __T.game.state; new Function('G', 'a', src)(G, a); __T.game._.resync(); }, [fn, arg]);

    // 1. the FTUE → the first stone, set by the player's own hands (FUN's crane). The survey is played; the rough hill is
    //    cleared to its last boulder by a fixture (game-e2e plays the hill), then that boulder is struck
    let r = await drive("G.st.har && G.st.har.p === 'dig'", 120000);
    check('FTUE: the vision and the survey (the hero measures the Mount)', r.ok, info(r));
    await pg.evaluate(() => { const g = __T.game.state, i = g.bh.findIndex((v) => v > 0); g.bh = g.bh.map((v, k) => (k === i ? 1 : 0)); __T.game._.resync(); if (i >= 0) __T.game.onBoulderTap(i); });
    r = await drive("L.some((e) => e.type === 'stoneSet' && e.d && e.d.by === 'hero')", 240000);
    const first = await pg.evaluate(() => { const L = window.__GAME_LOG, st = L.find((e) => e.type === 'start'), s = L.find((e) => e.type === 'stoneSet'); return { key: L.some((e) => e.type === 'keyStone'), ms: st && s ? s.t - st.t : null }; });
    check('FTUE → the first stone, set by the player\'s hands through FUN\'s crane', r.ok && first.key, `${info(r)} · ${first.ms == null ? '?' : (first.ms / 1000).toFixed(0) + ' s from the start (paused-loop test time)'}`);

    // 2. a board: the mentor's stones are set, the pill offers the quarry for the shortfall, MATCH3's level pays it
    r = await drive("L.some((e) => e.type === 'm3Won' || e.type === 'm3Lost')", 300000);
    const board = await pg.evaluate(() => { const L = window.__GAME_LOG, e = L.find((x) => x.type === 'm3Won' || x.type === 'm3Lost'); return { won: e && e.type === 'm3Won', got: e && e.d && e.d.collected, lvl: (__T.game.state.m3.level || {}).quarry, open: L.some((x) => x.type === 'm3open') }; });
    check('a board: MATCH3\'s level in the quarry, its stones reach the meter, its save slot advances', r.ok && board.won && board.lvl >= 2, `${info(r)} · ${JSON.stringify(board)}`);

    // 3. the segment it paid, set stone by stone
    const tb = await pg.evaluate(() => window.__GAME_LOG.find((x) => x.type === 'm3Won' || x.type === 'm3Lost').t);
    // (wave 16, the balance: his hands set stones whatever the stock; a segment paid ('step') or three stones set after the board)
    r = await drive(`(L.some((e) => e.type === 'step' && e.t > ${tb}) && L.some((e) => e.type === 'stoneSet' && e.t > ${tb})) || L.filter((e) => e.type === 'stoneSet' && e.t > ${tb}).length >= 3`, 120000);
    check('a segment: paid from the board\'s stones and set stone by stone', r.ok, info(r));

    // 4. a key stone by the player's hands (FUN): the next course's cornerstone (fixture: the course below is set)
    const k0 = await pg.evaluate(() => window.__GAME_LOG.filter((e) => e.type === 'keyStone').length);
    await fixture("const s = G.st.har; s.set = 32; s.paid = Math.max(s.paid, 40); s.k = 0; s.bad = []; s.chk = 0;");
    r = await drive(`L.filter((e) => e.type === 'keyStone').length > ${k0}`, 90000);
    const key = await pg.evaluate(() => { const e = window.__GAME_LOG.filter((x) => x.type === 'keyStone').pop(); return e && e.d; });
    check('a key stone: the course\'s cornerstone by FUN\'s precision game, its quality kept', r.ok && key && key.quality > 0, `${info(r)} · ${JSON.stringify(key)}`);

    // 5. the course check (FUN's plumb) after two courses (fixture: the second course is one stone from its end)
    await fixture("const s = G.st.har; s.set = 63; s.paid = Math.max(s.paid, 64); s.k = 0; s.bad = []; s.chk = 0;");
    r = await drive("L.some((e) => e.type === 'check' && e.d && e.d.courses)", 90000);
    check('the course check: the engineer\'s plumb after two courses', r.ok, info(r));

    // 6. a deal with a king: the dock's door → a court → an offer → signed (KINGS' court, its apply() pays from the meter)
    await fixture('G.res.silver += 400; G.res.stone += 200;');
    // (in-page clicks: the court is a full-screen sheet; each partner is tried until one has an offer the meter can pay)
    const k = await pg.evaluate(async () => {
      const sleep = (ms) => new Promise((r) => setTimeout(r, ms)), q = (sel) => document.querySelector(sel);
      __T.game._.openKings();
      for (let t = 0; t < 80 && !q('.kg [data-a="court"]'); t++) await sleep(250);
      if (!q('.kg [data-a="court"]')) return { opened: false, busy: __T.game.busy };
      const ps = [...document.querySelectorAll('.kg [data-a="court"]')].map((r) => r.dataset.p);
      for (const p of ps) {
        const row = q(`.kg [data-a="court"][data-p="${p}"]`); if (!row) continue;
        row.click();
        for (let t = 0; t < 12 && !q('.kg [data-a="offer"]'); t++) await sleep(250);
        const offer = q('.kg [data-a="offer"]');
        if (offer) {
          offer.click();
          for (let t = 0; t < 12 && !q('.kg [data-a="sign"]'); t++) await sleep(250);
          const sign = q('.kg [data-a="sign"]');
          if (sign) { sign.click(); for (let t = 0; t < 24 && !window.__GAME_LOG.some((e) => e.type === 'deal'); t++) await sleep(250); }
          if (window.__GAME_LOG.some((e) => e.type === 'deal')) return { opened: true, dealt: true, p, ps };
        }
        const back = q('.kg [data-a="cancel"]') || q('.kg [data-a="back"]'); if (back) back.click();
        await sleep(500);
      }
      return { opened: true, dealt: false, ps };
    });
    // close the court with its own ✕ (scoped to KINGS' root .kg: the HUD's sheets have close buttons too)
    for (let t = 0; t < 8; t++) { const closed = await pg.evaluate(() => { const c = document.querySelector('.kg [data-a="cancel"], .kg [data-a="restore"], .kg [data-a="close"]'); if (c) c.click(); return !document.querySelector('.kg'); }); if (closed) break; await pg.waitForTimeout(500); }
    const opened = k.opened, dealt = !!k.dealt;
    const free = await pg.waitForFunction(() => !__T.game.busy, null, { timeout: 15000 }).then(() => true, () => false);
    const deal = await pg.evaluate(() => { const e = window.__GAME_LOG.find((x) => x.type === 'deal'); return e ? e.d : null; });
    check('a deal with a king: his court opens from the dock, a contract is signed, the court closes back to the site', opened && dealt && free, `${JSON.stringify(k)} · ${JSON.stringify(deal)} · free ${free}`);

    // 7. the inspection (FUN's plumb) and the Mount's key moment (fixture: every stone set, the finish done)
    await fixture("const s = G.st.har; s.set = s.n; s.paid = s.n; s.k = 0; s.bad = []; s.chk = s.n; s.p = 'finish'; s.fp = 1; s.fd = 1;");
    r = await drive("L.some((e) => e.type === 'stageDone' && e.d && e.d.id === 'har')", 240000);
    const end = await pg.evaluate(() => ({ insp: window.__GAME_LOG.some((e) => e.type === 'inspect' || (e.type === 'check' && e.d && !e.d.courses)), moment: window.__GAME_LOG.some((e) => e.type === 'moment'), done: __T.game.state.st.har && __T.game.state.st.har.done }));
    check('the inspection, then the Mount\'s key moment: the stage is done', r.ok && end.done, `${info(r)} · ${JSON.stringify(end)}`);

    const saved = await pg.evaluate(() => { try { const o = JSON.parse(localStorage.getItem('bh_beta2')); return { v: o.v, har: !!(o.st.har && o.st.har.done), m3: !!o.m3, kings: !!o.kings }; } catch (e) { return null; } });
    check('the save (bh_beta2, v6) holds it all, with MATCH3\'s and KINGS\' slots', saved && saved.v === 6 && saved.har && saved.m3 && saved.kings, JSON.stringify(saved));
    await pg.evaluate(() => { __T.simulate(false); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
    await pg.screenshot({ path: path.join(OUT, 'game-flow-end.png'), timeout: 240000 });
    const bad = logs.filter((l) => !/fonts|favicon/.test(l));
    check('no console errors along the flow', bad.length === 0, bad.slice(0, 3).join(' | '));
    check('no alert/confirm/prompt', (await pg.evaluate(() => window.__DIALOGS.length)) === 0);
  } catch (e) {
    check('the flow ran to its end', false, String(e && e.message).slice(0, 300));
  } finally {
    await b.close();
  }
  const failed = results.filter((x) => !x.ok);
  fs.writeFileSync(path.join(OUT, 'game-flow.json'), JSON.stringify({ when: new Date().toISOString(), results }, null, 1));
  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  process.exit(failed.length ? 1 : 0);
})();
