// WORKSB22 — the four works inside the day (dist/test.html#avodah, 844x390, REAL touch via CDP): each errand's marker wakes the button, the first
// tap starts the work, the works' chips / bar are tapped by touch, the task is done, the source line comes after the end only.
// Needs ENGINE22's day (window.__DAY) — run on a build that has both.   NODE_PATH=... brun node test/worksb22-game.cjs [--no-build] [--shots]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/worksb22-game');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--no-shots');
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const want = (n) => !ONLY.length || ONLY.includes(n);
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
    await pg.addInitScript(() => {
      try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'אביתר', mishmar: 3, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* none */ }
      window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__WB22_EVERY = 4; window.__WB22_N = 4;
    });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const cdp = await ctx.newCDPSession(pg);
    const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const up = async (id) => { fingers.delete(id); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot ' + name);
      await G(() => { window.__HUD_HOLD = false; });
    };
    const tapEl = async (sel) => {
      const r = await G((sel) => { const e = document.querySelector(sel); if (!e) return null; const r = e.getBoundingClientRect(); const x = r.left + r.width / 2, y = r.top + r.height / 2, t = document.elementFromPoint(x, y); return r.width > 2 && t && (t === e || e.contains(t)) ? { x, y, w: r.width, h: r.height } : { x, y, w: r.width, h: r.height, covered: true }; }, sel);
      if (!r || r.covered) return null;
      await down(7, r.x, r.y); await pg.waitForTimeout(60); await up(7); return r;
    };
    const press = async () => { const bc = await G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2); };
    const L = (w) => `.wb-layer[data-work="${w}"]`;
    await G(() => { window.__LINES = []; const iv = setInterval(() => { const l = document.querySelector('.dy-line.on small'); if (l && window.__LINES[window.__LINES.length - 1] !== l.textContent) window.__LINES.push(l.textContent); }, 120); });
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('the day is on (two thumbs in the Temple)', on);
    /** force a task, go to its place, press the button until the work's layer shows */
    const start = async (taskId, place, layer, wk) => {
      await G(([t]) => { __DAY.tasks.force(t); __DAY.D.refresh && __DAY.D.refresh(); }, [taskId]);
      await G(([p, t]) => { const tk = __DAY.tasks.get(t); __DAY.teleport(tk && tk.place ? tk.place : p); }, [place, taskId]); await pg.waitForTimeout(1500);   // (wave 24 moved the markers to the real places: go where the task now stands)
      const awake = await waitFor((t) => { const s = __TWIN.spec(); return !!s && s.job === t; }, taskId, 6000);
      const isOn = (w) => G((w) => !!(window.__WB22 && __WB22[w] && __WB22[w].on()), w);
      for (let k = 0; k < 3 && !(await isOn(wk)); k++) { await press(); await pg.waitForTimeout(900); }
      const there = await waitFor((w) => !!(window.__WB22 && __WB22[w] && __WB22[w].on()), wk, 8000);
      return awake && there;
    };
    const dbgSpot = (wk) => G((wk) => { const w = __WB22[wk], B = w && w.B; if (!B || !B.spot) return null; const h = __T.stages.heroXYZ({}), sp = B.spot, p = __T.view.project(sp.x + sp.fx * 2.5, sp.y + 1, sp.z + sp.fz * 2.5), q = __T.view.project(h.x, h.y, h.z); return { hero: [h.x | 0, h.z | 0], spot: [sp.x | 0, sp.z | 0, sp.fx.toFixed(2), sp.fz.toFixed(2)], mid: p && [p.x | 0, p.y | 0, p.on], heroScr: q && [q.x | 0, q.y | 0, q.on] }; }, wk);
    const mentorBefore = () => G(() => { const l = document.querySelector('.dy-line.on small'); return l ? l.textContent : ''; });
    const taskState = (t) => G((t) => __DAY.tasks.get(t).state, t);
    const lineAfter = (re) => waitFor((re) => window.__LINES.some((t) => new RegExp(re).test(t)), re, 12000);

    if (want('queue')) {
    /* 1. the queue */
    await G(() => __DAY.clock.skipTo(8)); await G(() => { __DAY.D.refresh(); __DAY.clock.tick(30); });
    check('queue: the marker wakes the button and the first tap starts the work', await start('queue', 'gate', 'gate', 'queue'));
    await pg.waitForTimeout(2500); await shot('queue_a');
    let wrongOK = false;
    for (let i = 0; i < 14 && (await taskState('queue')) !== 'done'; i++) {
      const q = await G(() => { const W = __WB22.queue; return W.B.M.phase === 'work' ? W.queue().filter((p) => p.state === 'wait').sort((a, b) => a.id - b.id)[0] : null; });
      if (!q) { await pg.waitForTimeout(1500); continue; }
      const stts = ['north', 'ramp', 'birds', 'menachot'];
      const right = await G(([k]) => ['north', 'ramp', 'birds', 'menachot'].find((s) => __WB22.queue.okAt(k, s)), [q.kind]);
      if (!wrongOK) {
        const wrong = await G(([k]) => ['north', 'ramp', 'birds', 'menachot'].find((s) => !__WB22.queue.okAt(k, s)), [q.kind]);
        const m0 = await G(() => ({ i: __WB22.queue.B.M.i, pts: __WB22.queue.B.M.pts }));
        await tapEl(`${L('gate')} .wb-t[data-key="${q.key}"]`); await tapEl(`${L('gate')} .wb-bar [data-key="${wrong}"]`); await pg.waitForTimeout(500);
        const m1 = await G(([id]) => ({ i: __WB22.queue.B.M.i, pts: __WB22.queue.B.M.pts, st: __WB22.queue.queue().find((p) => p.id === id) }), [q.id]);
        wrongOK = m1.i === m0.i && m1.pts === m0.pts && m1.st && m1.st.state === 'wait';
        check('queue: a wrong send waits, no penalty', wrongOK, JSON.stringify([m0, m1]));
        await shot('queue_wrong');
      }
      await tapEl(`${L('gate')} .wb-t[data-key="${q.key}"]`); await tapEl(`${L('gate')} .wb-bar [data-key="${right}"]`); await pg.waitForTimeout(700);
      if ((await G(() => __WB22.queue.B.M.i)) === 1) await shot('queue_b');
    }
    check('queue: 4 pilgrims directed by taps → the task is done', await waitFor(() => __DAY.tasks.get('queue').state === 'done', null, 15000));
    check('queue: the mishna (source) comes after the end', await lineAfter('זבחים ה'));

    }
    if (want('seals')) {
    /* 2. seals */
    await G(() => { __DAY.clock.skipTo(9); __DAY.D.refresh(); __DAY.clock.tick(30); });
    check('seals: marker → button → work', await start('seals', 'seals', 'seals', 'seals'));
    await pg.waitForTimeout(800); await shot('seals_a');
    for (let i = 0; i < 2 && (await taskState('seals')) !== 'done'; i++) {
      const ask = await G(() => __WB22.seals.asking());
      await tapEl(`${L('seals')} .wb-bar [data-key="${ask}"]`); await pg.waitForTimeout(500);
      if (i === 0) await shot('seals_b');
      await tapEl(`${L('seals')} .wb-t[data-key="achiya"]`) || await tapEl(`${L('seals')} .wb-bar [data-key="achiya"]`); await pg.waitForTimeout(500);
    }
    const took = await G(() => __DAY.stock.snapshot());
    check('seals: matched twice, the libations leave the stock, the task is done', await waitFor(() => __DAY.tasks.get('seals').state === 'done', null, 12000), JSON.stringify(took));
    check('seals: source after the end', await lineAfter('שקלים ה'));

    }
    if (want('kiyor')) {
    /* 3. the kiyor */
    await G(() => { __DAY.clock.skipTo(11.2); __DAY.D.refresh(); __DAY.clock.tick(30); });
    check('kiyor: marker → button → work', await start('kiyor2', 'kiyor', 'kiyor', 'kiyor'));
    await pg.waitForTimeout(800); await shot('kiyor_a');
    for (let i = 0; i < 12; i++) { await tapEl(`${L('kiyor')} .wb-t[data-key="wheel"]`) || await tapEl(`${L('kiyor')} .wb-bar [data-key="turn"]`); await pg.waitForTimeout(650); if (i === 6) await shot('kiyor_b'); }
    check('kiyor: 12 turns by taps → done, the source after', (await waitFor(() => __DAY.tasks.get('kiyor2').state === 'done', null, 12000)) && (await lineAfter('יומא ג')));

    }
    if (want('close')) {
    /* 4. vessels + gates */
    await G(() => { __DAY.clock.skipTo(16.5); __DAY.D.refresh(); __DAY.clock.tick(30); });
    check('vessels: marker → button → work', await start('vessels', 'close', 'close', 'vessels'));
    await pg.waitForTimeout(800); console.log('   spot', JSON.stringify(await dbgSpot('vessels'))); await shot('vessels_a');
    for (let i = 0; i < 12; i++) { await tapEl(`${L('close')} .wb-t[data-key="t${i}"]`) || await tapEl(`${L('close')} .wb-bar [data-key="count"]`); await pg.waitForTimeout(260); if (i === 5) await shot('vessels_b'); }
    for (let i = 0; i < 6; i++) { await tapEl(`${L('close')} .wb-t[data-key="w${i}"]`) || await tapEl(`${L('close')} .wb-bar [data-key="wash"]`); await pg.waitForTimeout(260); }   // ── bloodb25 ── (the six washings)
    const cnt = await G(() => __WB22.vessels.state.cnt);
    check('vessels: 12 taps of 8 → 93, the task is done', cnt === 93 && (await waitFor(() => __DAY.tasks.get('vessels').state === 'done', null, 12000)), String(cnt));
    await G(() => { __DAY.clock.skipTo(17.3); __DAY.D.refresh(); __DAY.clock.tick(30); });
    check('gates: marker → button → work', await start('gates', 'close', 'close', 'gates'));
    await pg.waitForTimeout(800); await shot('gates_a');
    for (const k of ['stone', 'keys', 'lock']) { await tapEl(`${L('close')} .wb-t[data-key="g-${k}"]`) || await tapEl(`${L('close')} .wb-bar [data-key="gate"]`); await pg.waitForTimeout(k === 'lock' ? 1400 : 700); if (k === 'keys') await shot('gates_b'); }
    await shot('gates_c');
    check('gates: the stone, the keys, the lock → done, the source after', (await waitFor(() => __DAY.tasks.get('gates').state === 'done', null, 12000)) && (await lineAfter('מדות א')));

    }
    if (want('account')) {
    /* 5. the evening account */
    await G(() => { __DAY.clock.skipTo(16.8); __DAY.D.refresh(); __DAY.clock.tick(30); });
    check('account: marker → button → the count of 6', await start('account', 'store', 'seals', 'account'));
    // (this one by the RIGHT THUMB alone: each press of the button is the next seal)
    for (let i = 0; i < 6; i++) { await press(); await pg.waitForTimeout(450); }
    await shot('account_a');
    console.log('   account', JSON.stringify(await G(() => { const w = __WB22.account, M = w.B.M; return { i: M.i, n: M.n, phase: M.phase, done: M.done, counted: w.state.counted, on: w.on(), ended: w.B.ended, task: __DAY.tasks.get('account').state }; })));
    check('account: 6 counted by the right thumb alone → done', await waitFor(() => __DAY.tasks.get('account').state === 'done', null, 12000));
    }
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) {
    console.log('FAIL  exception', e && e.stack ? e.stack.split('\n').slice(0, 4).join(' ') : e); results.push(false);
  } finally {
    await b.close();
    console.log(`\n${results.filter(Boolean).length}/${results.length} passed in ${((Date.now() - T0) / 1000).toFixed(0)} s`);
    process.exit(results.every(Boolean) ? 0 : 1);
  }
})();
