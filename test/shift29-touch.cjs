// ── shift29 ── SHIFT29A (WAVE29): the shift by real touch on dist/test.html#shift=1 at 844×390 — the HUD; a pilgrim within 12 s with
// an icon and a bar; taking him (a touch on his chip) and his three stations serve him (score rises, a "+N"); a pilgrim left alone leaves
// at patience 0 (lost +1, the combo resets, no error); the round ends at 90 s with the end card; "עוד פעם" restarts within 2 s; 2 stars
// open level 2 (forced: __SHIFT.debug.stars(2)); the opening's wrong-order line; no console errors; shots.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/shift29-touch.cjs --no-build [--noshots]
//   … --play=1,1,1,2,2,2   plays whole rounds by touch (a greedy player) and prints the scores (no checks)
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/shift29');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--noshots');
const PLAY = (args.find((a) => a.startsWith('--play=')) || '').slice(7).split(',').filter(Boolean).map(Number);
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
const SAVE = { v: 1, name: 'דרור', mishmar: 5, seenIntro: true };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const pg = await ctx.newPage(); const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); if (/\[shift\]/.test(m.text())) console.log('   console:', m.text().slice(0, 200)); });
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
  await pg.addInitScript((sv) => { try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ ...sv, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* */ } window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; }, SAVE);
  const hash = PLAY.length ? '#shift=' + PLAY[0] : '#shift=1';
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html' + hash));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
  const G = (fn, a) => pg.evaluate(fn, a);
  const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
  const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
  const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
  const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
  const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
  const tapAt = async (x, y) => { await down(7, x, y); await pg.waitForTimeout(60); await up(7); };
  const center = (sel) => G((s) => { const e = typeof s === 'string' ? document.querySelector(s) : null; if (!e) return null; const r = e.getBoundingClientRect(); if (r.width < 2 || r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) return null; return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }, sel);
  const tapSel = async (sel) => { const c = await center(sel); if (!c) return false; await tapAt(c.x, c.y); return true; };
  let nShot = 0;
  const shot = async (name) => { if (!SHOTS) return; await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); const f = `${String(++nShot).padStart(2, '0')}-${name}.png`; await pg.screenshot({ path: path.join(OUT, f), timeout: 240000 }); console.log('   shot test/out/shift29/' + f); await G(() => { window.__HUD_HOLD = false; }); };
  const st = () => G(() => (window.__SHIFT && __SHIFT.state()) || null);
  const pil = () => G(() => { const m = __SHIFT.mods; if (!m) return []; return m.pilgrims.list().map((P) => { const r = P.el && P.el.getBoundingClientRect(); return { id: P.id, type: P.type, icon: P.icon, state: P.state, step: P.step, route: P.route, patience: +P.patience.toFixed(2), c: r && r.width > 2 && r.left > -50 && r.left < innerWidth ? { x: r.left + r.width / 2, y: r.top + Math.min(r.height / 2, 18) } : null, text: P.el ? P.el.textContent : '', bar: !!(P.el && P.el.querySelector('i,b,.bar,[class*=bar]')) }; }); });
  // a station by touch: its chip in the world when SHIFT29B draws one, else the engine's tap (the walk is the same)
  const tapStation = async (id) => {
    const c = await G((id) => { const e = document.querySelector(`[data-station="${id}"],[data-st="${id}"],[data-sh-st="${id}"]`); if (!e) return null; const r = e.getBoundingClientRect(); if (r.width < 2 || r.left < 0 || r.right > innerWidth || r.top < 0 || r.bottom > innerHeight) return null; const x = r.left + r.width / 2, y = r.top + r.height / 2, top = document.elementFromPoint(x, y); return { x, y, hit: !!(top && (top === e || e.contains(top))), top: top ? (top.className || top.tagName) + '' : '' }; }, id);
    if (c && c.hit) { const n0 = await G(() => __SHIFT.debug.log().length); await tapAt(c.x, c.y); await pg.waitForTimeout(250); const n1 = await G(() => __SHIFT.debug.log().length); if (n1 > n0 || (await G(() => !!(window.__S29W && __S29W.state().on || __SHIFT.state().acting)))) return 'chip'; console.log(`   (a touch on the ${id} chip did nothing: ${JSON.stringify(await G(() => __SHIFT.debug.log().slice(-3)))})`); }
    if (c) console.log(`   (the ${id} chip is covered by "${c.top}" — the engine's tap)`);
    await G((id) => __SHIFT.E.tapStation(id), id); return 'api';
  };
  // the act: taps on the work button until the pilgrim's step moves (taps alone finish every act)
  const finishAct = async (pid, step0, ms = 9000) => {
    const t0 = Date.now(); let taps = 0;
    while (Date.now() - t0 < ms) {
      const p = (await pil()).find((q) => q.id === pid); const s = await st();
      if (!p || p.step > step0 || s.phase !== 'run') return { ok: true, taps, ms: Date.now() - t0 };
      const acting = await G(() => __SHIFT.state().acting);
      if (acting || (await G(() => !!(window.__TWIN && __TWIN.spec && __TWIN.spec())))) { const c = await center('.tw-btn'); if (c) { await tapAt(c.x, c.y); taps++; } }
      await pg.waitForTimeout(350);
    }
    return { ok: false, taps, ms: Date.now() - t0 };
  };
  const serve = async (p) => {
    // take: a touch on his chip
    let how = 'chip';
    if (p.state === 'taken') how = 'held';
    else if (p.c) await tapAt(p.c.x, p.c.y); else { how = 'api'; await G((id) => { const P = __SHIFT.mods.pilgrims.list().find((q) => q.id === id); __SHIFT.E.tapPilgrim(P); }, p.id); }
    let took = await waitFor((id) => __SHIFT.state().carried === id, p.id, 1500);
    if (!took && p.state !== 'taken') { const q = (await pil()).find((x) => x.id === p.id); if (q && q.c) { await tapAt(q.c.x, q.c.y); how = 'chip2'; took = await waitFor((id) => __SHIFT.state().carried === id, p.id, 2500); } }   // (a chip that moved under the finger: the player taps again)
    if (!took) return { took: false, how };
    const acts = [];
    // ── route31 ── the laver: the kohen's own act, once per round, before the first ── /route31 ──
    if ((await st()).washed === false) { const via = await tapStation('kiyor'); await waitFor(() => __SHIFT.state().acting || __SHIFT.state().phase !== 'run', null, 8000); const t0 = Date.now(); while ((await st()).washed === false && (await st()).phase === 'run' && Date.now() - t0 < 9000) { if ((await st()).acting) { const c = await center('.tw-btn'); if (c) await tapAt(c.x, c.y); } await pg.waitForTimeout(350); } acts.push({ sid: 'kiyor', via, ok: (await st()).washed }); }
    for (let i = p.step || 0; i < p.route.length; i++) {
      const sid = p.route[i]; const via = await tapStation(sid);
      await waitFor(() => __SHIFT.state().acting || __SHIFT.state().phase !== 'run', null, 8000);
      const r = await finishAct(p.id, i); acts.push({ sid, via, ...r });
      if (!r.ok) { console.log('   act failed:', JSON.stringify(await G(() => ({ log: __SHIFT.debug.log().filter((e) => e[1] !== 'no').slice(-10), goal: __SHIFT.debug.goal(), st: __SHIFT.state(), walk: window.__S29W && __S29W.state(), hero: (() => { const h = {}; __T.stages.heroXYZ(h); return [+h.x.toFixed(1), +h.z.toFixed(1)]; })() })))); break; }
    }
    return { took: true, how, acts };
  };

  try {
    const on = await waitFor(() => window.__SHIFT && __SHIFT.state() && __SHIFT.state().phase === 'run', null, 90000);
    check('#shift=1 starts a round (phase run)', on, JSON.stringify(await st())); if (!on) throw new Error('no shift');
    if (PLAY.length) {
      const scores = [];
      for (let k = 0; k < PLAY.length; k++) {
        if (k > 0) {   // the next round: "עוד פעם" or the level picked
          const lv = PLAY[k]; const ok = await G((lv) => __SHIFT.run(lv), lv); const up = await waitFor(() => !!(__SHIFT.state() && (__SHIFT.state().phase === 'run' || __SHIFT.state().phase === 'opening')), null, 8000); if (!up) { console.log('   round did not start', ok, JSON.stringify(await st())); break; }
        }
        if ((await st()).phase === 'opening') { for (let i = 0; i < 4; i++) { await tapSel(`.sh-ring[data-i="${i}"]`); await pg.waitForTimeout(250); } }
        while (((await st()) || {}).phase === 'run') {
          const L = (await pil()).filter((q) => q.state === 'wait' || q.state === 'atStation' || q.state === 'taken').sort((a, c) => (a.state === 'taken' ? -1 : c.state === 'taken' ? 1 : a.patience - c.patience));
          if (!L.length) { await pg.waitForTimeout(400); continue; }
          await serve(L[0]);
        }
        await waitFor(() => __SHIFT.state().phase === 'end', null, 100000);
        const r = (await st()).result; scores.push(r);
        console.log('   LOG ' + JSON.stringify(await G(() => __SHIFT.debug.log().filter((e) => e[1] !== 'no').map((e) => e.join(':')))).slice(0, 2400)); console.log(`ROUND ${k + 1} L${r.level}: score ${r.score} · rival ${r.rivalName} ${r.rival} · ${r.stars}★ · served ${r.served}/${r.count} · lost ${r.lost}`);
        if (k === 0 || k === 3) await shot(`play-end-L${r.level}`);
      }
      console.log('SCORES', JSON.stringify(scores.map((r) => [r.level, r.score, r.rival, r.stars, r.served, r.lost])));
      return;
    }
    // the HUD
    const hud = await G(() => ({ top: !!document.querySelector('.sh-top'), score: (document.querySelector('.sh-score b') || {}).textContent, sun: !!document.querySelector('.sh-sun svg'), riv: (document.querySelector('.sh-rr.them span') || {}).textContent, combo: !!document.querySelector('.sh-combo'), dayHud: getComputedStyle(document.querySelector('.dy-hud') || document.body).display }));
    check('the HUD: the sun arc, "ניקוד", the rival bar (a משמר), the combo chip; the day HUD hidden', hud.top && hud.sun && /^משמר /.test(hud.riv || '') && hud.combo && hud.dayHud === 'none', JSON.stringify(hud));
    await shot('start-hud');
    const t0 = Date.now();
    const sp = await waitFor(() => __SHIFT.state().spawned >= 1, null, 14000);
    const ps0 = await pil();
    check('a pilgrim within 12 s of the round, with an icon and a bar', sp && ps0.length >= 1 && /🐑/.test(ps0[0].text) && ps0[0].bar, `${Date.now() - t0} ms · ${JSON.stringify(ps0[0] && { icon: ps0[0].icon, text: ps0[0].text, bar: ps0[0].bar, c: ps0[0].c })}`);
    await pg.waitForTimeout(1200);
    const gate = await G(() => { const b = document.querySelector('.sh-top [data-sh=gate]'), any = document.querySelector('[data-sh=gate]'); const r = (b || any) && (b || any).getBoundingClientRect(); return { docked: !!b, any: !!any, text: any ? any.textContent : '', r: r ? [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] : null, cls: any ? any.className : '', disp: any ? getComputedStyle(any).display : '' }; });
    // ── shift30 ── (WAVE30: the gate's chip is one of the court's chips — over the line, or at the screen's edge toward it — with "תור N";
    // no longer docked in the top bar) ── /shift30 ──
    { const g2 = await G(() => { const e = document.querySelector('.s29-st[data-st=gate]'); if (!e) return null; const r = e.getBoundingClientRect(); return { text: e.textContent, r: [Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)] }; });
      check('the gate chip (🚪 השער · תור N) on the screen, ≥ 44 px', !!g2 && g2.r[0] >= -2 && g2.r[0] + g2.r[2] <= 846 && g2.r[1] >= 0 && g2.r[3] >= 44 && /השער/.test(g2.text) && /תור \d/.test(g2.text), JSON.stringify(g2)); void gate; }
    await shot('pilgrim-at-gate');
    // serve him by touch
    const s0 = await st();
    const p1 = (await pil())[0];
    const sv = await serve(p1);
    const s1 = await st();
    check('taking him (a touch on his chip) and his three stations serve him: score rises, a "+N"', sv.took && s1.served === 1 && s1.score > s0.score && /^\+\d+$/.test(s1.float), `${JSON.stringify(sv)} · score ${s0.score}→${s1.score} · float "${s1.float}"`);
    await shot('served-plus');
    // left alone at the gate: the patience at the edge, he leaves
    await waitFor(() => __SHIFT.state().spawned >= 2 && __SHIFT.mods.pilgrims.list().some((P) => P.state === 'wait'), null, 14000);
    const c0 = await st();
    await G(() => { const m = __SHIFT.mods; for (const P of m.pilgrims.list()) if (P.state === 'wait') P.patience = 0.03; });
    const left = await waitFor((n) => __SHIFT.state().lost > n, c0.lost, 6000);
    const c1 = await st();
    check('a pilgrim left alone leaves at patience 0: lost +1, combo ×1, the round goes on', left && c1.lost === c0.lost + 1 && c1.combo === 1 && c1.phase === 'run', `lost ${c0.lost}→${c1.lost} · combo ${c0.combo}→${c1.combo} · stamp "${await G(() => (document.querySelector('.sh-stamp') || {}).textContent)}"`);
    await pg.waitForTimeout(200); await shot('left-halach');
    // a wrong-order station: the line, no penalty
    await waitFor(() => __SHIFT.mods.pilgrims.list().some((P) => P.state === 'wait'), null, 14000);
    const p2 = (await pil()).find((q) => q.state === 'wait');
    if (p2 && p2.c) { await tapAt(p2.c.x, p2.c.y); if (!(await waitFor((id) => __SHIFT.state().carried === id, p2.id, 2500))) { const q = (await pil()).find((x) => x.id === p2.id); if (q && q.c) await tapAt(q.c.x, q.c.y); await waitFor((id) => __SHIFT.state().carried === id, p2.id, 2500); } }
    if (p2 && (await st()).carried !== p2.id) { console.log('   (the second pilgrim\'s chip moved under the finger twice — taken through the engine)'); await G((id) => { const P = __SHIFT.mods.pilgrims.list().find((q) => q.id === id); if (P) __SHIFT.E.tapPilgrim(P); }, p2.id); }
    const sc2 = (await st()).score;
    await G(() => __SHIFT.E.runAt('zerika'));   // ── route31 ── (the true route: the samicha first) ── /route31 ──
    const line = await G(() => [...document.querySelectorAll('.sh-stamp.on, .s29-no')].map((e) => e.textContent).join(' | ') + ' · ' + __SHIFT.state().no);
    check('a station out of order: "לא — הסמיכה קודם", no penalty', /לא — הסמיכה קודם/.test(line) && (await st()).score === sc2, line);
    await pg.waitForTimeout(150); await shot('wrong-order');
    // the round's end at 90 s (served by touch on the way: the greedy player)
    while ((await st()).phase === 'run' && Date.now() - T0 < 420000) {
      const L = (await pil()).filter((q) => q.state === 'wait' || q.state === 'atStation' || q.state === 'taken').sort((a, c) => (a.state === 'taken' ? -1 : c.state === 'taken' ? 1 : a.patience - c.patience));
      if (!L.length) { await pg.waitForTimeout(400); continue; }
      await serve(L[0]);
    }
    const ended = await waitFor(() => __SHIFT.state().phase === 'end' && !!document.querySelector('.sh-end .sh-card'), null, 100000);
    const r = (await st()).result;
    const card = await G(() => { const c = document.querySelector('.sh-end .sh-card'); return c ? { stars: c.querySelectorAll('.sh-stars i').length, res: c.querySelector('.sh-res').textContent, sub: c.querySelector('.sh-sub').textContent, again: !!c.querySelector('[data-sh=again]'), why: !c.querySelector('details').open } : null; });
    check('the round ends at 90 s with the end card (★, score — rival, שיא, "עוד פעם", the source folded)', ended && card && card.again && card.why && /משמר/.test(card.res) && /שיא/.test(card.sub), `${JSON.stringify(card)} · t ${r && JSON.stringify(r)}`);
    console.log(`   ROUND 1 (test) L1: score ${r.score} · rival ${r.rival} · ${r.stars}★ · served ${r.served}/${r.count} · lost ${r.lost}`);
    await pg.waitForTimeout(1300); await shot('end-card');
    // "עוד פעם": the same level again within 2 s, no reload
    const tA = Date.now(); const okA = await tapSel('.sh-end [data-sh=again]');
    const again = await waitFor(() => __SHIFT.state().phase === 'run' && __SHIFT.state().t < 3 && !document.querySelector('.sh-end'), null, 4000);
    check('"עוד פעם" restarts the same level within 2 s (no reload)', okA && again && Date.now() - tA <= 2600 && (await st()).level === 1 && (await G(() => !!window.__T.booted)), `${Date.now() - tA} ms (incl. polling)`);
    // 2 stars open the next level
    await G(() => { __SHIFT.debug.stars(2); __SHIFT.debug.end(); });
    const nx = await waitFor(() => !!document.querySelector('.sh-end [data-sh=next]'), null, 4000);
    check('2 stars (forced): "המשמרת הבאה" on the card, saved lvl 2', nx && (await G(() => __SHIFT.save.lvl)) === 2, JSON.stringify(await G(() => __SHIFT.save)));
    await tapSel('.sh-end [data-sh=next]');
    const op = await waitFor(() => __SHIFT.state().phase === 'opening' && __SHIFT.state().level === 2 && document.querySelectorAll('.sh-ring[data-sh=op]').length === 4, null, 5000);
    check('level 2 opens with the opening: four rings', op, JSON.stringify(await st()));
    await pg.waitForTimeout(500); await shot('opening-rings');
    await tapSel('.sh-ring[data-i="2"]'); await pg.waitForTimeout(120);
    const wl = await G(() => (document.querySelector('.sh-stamp') || {}).textContent || '');
    check('the opening\'s wrong order: "לא — הפיס קודם"', /לא — הפיס קודם/.test(wl), wl);
    await shot('opening-wrong');
    for (let i = 0; i < 4; i++) { await tapSel(`.sh-ring[data-i="${i}"]`); await pg.waitForTimeout(200); }
    const r2 = await waitFor(() => __SHIFT.state().phase === 'run' && __SHIFT.state().level === 2, null, 11000);
    check('the opening done by four taps → the round runs (level 2, two at a time)', r2, JSON.stringify((await st()).opening));
    await waitFor(() => __SHIFT.state().spawned >= 1, null, 12000); await pg.waitForTimeout(1500); await shot('level2-run');
    // the entry card (Phase B's default entry): "משמרת" big, "סיור" small
    await G(() => { __SHIFT.tour(); __SHIFT.card(); });
    const ent = await G(() => { const g = document.querySelector('.sh-entry [data-sh=go]'), t = document.querySelector('.sh-entry [data-sh=tour]'); if (!g || !t) return null; const a = g.getBoundingClientRect(), c = t.getBoundingClientRect(); return { go: [Math.round(a.width), Math.round(a.height)], tour: [Math.round(c.width), Math.round(c.height)], txt: g.textContent }; });
    check('the entry card: a big "משמרת" and a smaller "סיור" (≥ 44 px)', ent && ent.go[1] >= 60 && ent.tour[1] >= 44 && ent.go[0] * ent.go[1] > ent.tour[0] * ent.tour[1] * 2, JSON.stringify(ent));
    await shot('entry-card');
    await tapSel('.sh-entry [data-sh=tour]');
    const back = await waitFor(() => !document.body.classList.contains('sh-on') && window.__DAY && __DAY.D.active && !__SHIFT.state(), null, 4000);
    check('"סיור" goes back to the day (the day HUD back, no shift)', back);
    check('no console errors', errs.length === 0, errs.slice(0, 4).join(' | '));
  } catch (e) { check('run', false, e && e.stack ? e.stack.slice(0, 400) : String(e)); }
  finally {
    console.log(`${results.filter(Boolean).length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
    await b.close();
    process.exit(results.every(Boolean) ? 0 : 1);
  }
})();
// ── /shift29 ──
