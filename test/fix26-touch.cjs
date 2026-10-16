// FIX26 (WAVE26 items 1, 2, 3, 6), by real touch on dist/test.html#avodah at 844×390:
//  zoom   — a two-finger pinch on the free canvas changes __TWIN.cam().zoom (out and in) with no work running; the stick brings it back;
//           during a work the pinch stays within [0.7, 1.6] of the close camera (the close camera stays on); a two-finger double-tap resets
//  kiddush — the mukhni's HOLD raises the kiyor first; the twelve heaves; the real spouts are 0 within 3 s after the end; kiyor2 open ≤ 2 s
//  evarim — every piece has its name label from the start (the row and the ramp); the last three distinct; nothing red
//  payis  — after the ring stops: "מי יזכה?" — a tap on a kohen's figure registers the prediction; the count by taps; right → the stamp
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/fix26-touch.cjs --no-build [--noshots] [--only=zoom,kiddush,evarim,payis]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/fix26');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--noshots'), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const want = (s) => !ONLY.length || ONLY.includes(s);
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = await ctx.newPage(); const errs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
    await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'אביתר', mishmar: 3, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* none */ } window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; window.__PL = []; for (const t of ['pointerdown', 'pointerup', 'pointercancel']) window.addEventListener(t, (e) => { window.__PL.push([t, e.pointerId, e.target && (e.target.id || String(e.target.className).slice(0, 20) || e.target.tagName), Math.round(e.clientX || 0)]); if (window.__PL.length > 30) window.__PL.shift(); }, true); });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchEnd'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const shot = async (name) => { if (!SHOTS) return; await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/fix26/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); };
    const camD = () => G(() => { const c = __T.camera.position, t = __T.controls ? __T.controls.target : null; return t ? +Math.hypot(c.x - t.x, c.y - t.y, c.z - t.z).toFixed(2) : -1; });
    const TT = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: 21 + i, radiusX: 6, radiusY: 6, force: 1 })) });
    const pinch = async (cx, cy, d0, d1, steps = 8) => { await TT('touchStart', [[cx - d0 / 2, cy]]); await TT('touchStart', [[cx - d0 / 2, cy], [cx + d0 / 2, cy]]); for (let i = 1; i <= steps; i++) { const d = d0 + (d1 - d0) * i / steps; await TT('touchMove', [[cx - d / 2, cy], [cx + d / 2, cy]]); await pg.waitForTimeout(30); } await TT('touchEnd', []); };
    const tap2 = async (x0, x1, y) => { await TT('touchStart', [[x0, y]]); await TT('touchStart', [[x0, y], [x1, y]]); await pg.waitForTimeout(60); await TT('touchEnd', []); };
    const vv = () => G(() => (window.visualViewport ? +visualViewport.scale.toFixed(2) : 1));
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('Phase B day mode is on (twin + __DAY)', on); if (!on) throw new Error('no day mode');
    await pg.waitForTimeout(800);
    await G(() => { const e = document.querySelector('.dy-say'); window.__F26SAY = []; if (e) new MutationObserver(() => { if (e.classList.contains('on')) window.__F26SAY.push([Math.round(performance.now()), e.textContent.slice(0, 60)]); }).observe(e, { attributes: true, childList: true, subtree: true }); });
    // the errand at its hour, the hero at its place, the button awake
    const toWork = async (id) => {
      const info = await G((id) => { const k = __DAY.tasks.get(id); return k ? { h: k.openH, work: k.work, place: k.place } : null; }, id);
      if (!info) return false;
      await G((h) => { __DAY.clock.skipTo(h + 0.05); __DAY.D.refresh && __DAY.D.refresh(); }, info.h); await pg.waitForTimeout(900);
      await G((id) => { for (const k of __DAY.tasks.list()) if (k.id !== id && k.state === 'open') k.state = 'passed'; const k = __DAY.tasks.get(id); if (k.state === 'done') k.state = 'passed'; __DAY.tasks.force(id); __DAY.clock.pause(); }, id);
      await G((p) => __DAY.teleport(p), info.place); await pg.waitForTimeout(1500);
      return waitFor((id) => { const s = __TWIN.spec(); return !!s && s.job === id; }, id, 25000);
    };
    const tap = async (bc) => { await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2); };

    // ───────── zoom ─────────
    if (want('zoom')) {
      const z0 = await G(() => __TWIN.cam().zoom), d0 = await camD();
      await pinch(422, 170, 260, 70); await pg.waitForTimeout(1600);
      const z1 = await G(() => __TWIN.cam().zoom), d1 = await camD();
      check('[zoom] a pinch-in on the free canvas zooms OUT (no work)', z1 > z0 + 0.4 && d1 > d0 * 1.3, `zoom ${z0.toFixed(2)} → ${z1.toFixed(2)}, dist ${d0} → ${d1}`);
      await shot('zoom-1out');
      await pinch(422, 170, 70, 200); await pg.waitForTimeout(1600);
      const z2 = await G(() => __TWIN.cam().zoom), d2 = await camD();
      check('[zoom] a pinch-out zooms back IN', z2 < z1 - 0.3 && d2 < d1, `zoom ${z1.toFixed(2)} → ${z2.toFixed(2)}, dist ${d1} → ${d2}`);
      await pinch(422, 170, 260, 60); await pg.waitForTimeout(800);
      // the two-finger double-tap resets
      for (let r = 0; r < 2; r++) { await tap2(380, 470, 170); await pg.waitForTimeout(120); }
      await pg.waitForTimeout(1500);
      const z3 = await G(() => __TWIN.cam().zoom);
      check('[zoom] the page itself never zooms (visualViewport.scale 1)', (await vv()) === 1, `scale ${await vv()}`);
      check('[zoom] a two-finger double-tap resets the zoom', Math.abs(z3 - 1) < 0.08, `zoom → ${z3.toFixed(2)}`);
      // the stick brings it back
      await pinch(422, 170, 260, 60); await pg.waitForTimeout(800);
      const st = await G(() => { const e = document.querySelector('.tw-zone'); const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await down(5, st.x, st.y); await move(5, st.x, st.y - 30); await pg.waitForTimeout(400); await up(5); await pg.waitForTimeout(1500);
      const z4 = await G(() => __TWIN.cam().zoom);
      check('[zoom] the stick brings the camera back to him', Math.abs(z4 - 1) < 0.1, `zoom → ${z4.toFixed(2)}`);
      // during a work: the close camera stays, the pinch within [0.7, 1.6]
      if (await toWork('g-payis1')) {
        const bc = await btnC(); await tap(bc); await pg.waitForTimeout(1800);
        const w0 = await camD();
        await G(() => { window.__PL = []; }); await pinch(422, 150, 240, 60); console.log('   dbg', JSON.stringify(await G(() => [__TWIN.cam(), window.__PL, !!window.__HANDS, window.__HANDS && __HANDS.twin]))); await pg.waitForTimeout(1500);
        const w1 = await camD(), zw = await G(() => __TWIN.cam().zoom), still = await G(() => !!(window.__P24M && window.__P24M.phase === 'work'));
        check('[zoom] in a work a pinch-in zooms out, capped at 1.6 (the close camera stays)', zw > 1.2 && zw <= 1.6001 && w1 > w0 * 1.15 && still, `zoom ${zw.toFixed(2)} dist ${w0} → ${w1}`);
        await shot('zoom-2work-out');
        await pinch(422, 150, 60, 300, 10); await pg.waitForTimeout(1500);
        const w2 = await camD(), zw2 = await G(() => __TWIN.cam().zoom);
        check('[zoom] in a work a pinch-out zooms in, floored at 0.7', zw2 >= 0.6999 && zw2 < 1 && w2 < w1, `zoom ${zw2.toFixed(2)} dist ${w1} → ${w2}`);
        await shot('zoom-3work-in');
        for (let i = 0; i < 40 && (await G(() => !!(window.__P24M && !window.__P24M.done))); i++) { await tap(bc); await pg.waitForTimeout(300); }
        await pg.waitForTimeout(5000);
        const ze = await G(() => __TWIN.cam().zoom);
        check('[zoom] after the work the zoom is back to 1', Math.abs(ze - 1) < 0.1, `zoom ${ze.toFixed(2)}`);
        await G(() => { for (const k of __DAY.tasks.list()) if (k.state === 'open') k.state = 'passed'; });
      } else check('[zoom] payis1 wakes', false);
    }

    // ───────── kiddush: the mukhni, the twelve, the spouts close, kiyor2 ─────────
    if (want('kiddush')) {
      const ok = await toWork('g-kiddush'); check('[kiddush] the right button wakes', ok);
      if (ok) {
        const bc = await btnC();
        await tap(bc); await pg.waitForTimeout(1600);   // (the first tap starts the work)
        const W = () => G(() => { const w = window.__WB22 && __WB22.kiyor; const s = w && w.state; const wv = __T.water && typeof __T.water.kiyor === 'function' ? __T.water : null; return { mode: s && s.mode, rise: s && +s.rise.toFixed(2), spouts: s && s.spouts, n: w && w.B && w.B.M ? w.B.M.n : 0, i: w && w.B && w.B.M ? w.B.M.i : 0, acts: w && w.B && w.B.M ? w.B.M.acts.map((a) => a.q) : [], open: wv && wv.kiyor ? wv.kiyor().spigots - (wv.kiyor().washing | 0) : -1, washing: wv && wv.kiyor ? wv.kiyor().washing | 0 : 0, down: wv ? wv.down : null, lower: wv && wv.state ? +wv.state.lower.toFixed(2) : null, done: !!(w && w.B && w.B.M && w.B.M.done) }; });
        const s0 = await W();
        check('[kiddush] the work begins with the mukhni: the kiyor down in its pit', s0.mode === 'mukhni' && s0.rise < 0.05 && (s0.lower === null || s0.lower > 1.5), JSON.stringify(s0));
        await shot('kiddush-1down');
        // HOLD: press and watch the rise, release near the top mark
        await down(2, bc.x, bc.y); let sh = null;
        for (let i = 0; i < 40; i++) { await pg.waitForTimeout(80); sh = await W(); if (i === 8) await shot('kiddush-2holding'); if (sh.rise >= 0.97 || sh.mode !== 'mukhni') break; }
        await up(2); await pg.waitForTimeout(500);
        const s1 = await W();
        check('[kiddush] holding raises the kiyor; the release at the mark is the mukhni\'s act (gold there)', s1.mode === 'heave' && s1.i === 1 && s1.acts.length >= 1, `at release rise ${sh && sh.rise} → ${JSON.stringify(s1)}`);
        check('[kiddush] the kiyor is up (the world\'s mukhni)', s1.lower === null || s1.lower < 0.2, `lower ${s1.lower}`);
        let n = 0; const t0 = Date.now();
        while (!(await W()).done && Date.now() - t0 < 60000) { await tap(bc); n++; await pg.waitForTimeout(650); if (n === 5) await shot('kiddush-3heave'); }
        const s2 = await W(); const tEnd = await G(() => (window.__F26K ? window.__F26K.end : 0));
        check('[kiddush] taps alone finish it (the twelve heaves)', s2.done && s2.spouts === 12, `${n} taps ${((Date.now() - t0) / 1000).toFixed(0)} s ${JSON.stringify(s2)}`);
        const openAtEnd = s2.open;
        await pg.waitForTimeout(1300); const sMid = await W();
        let closedAt = 0; for (let i = 0; i < 40; i++) { const s = await W(); if (s.open === 0) { closedAt = await G(() => performance.now()); break; } await pg.waitForTimeout(100); }
        if (SHOTS) await shot('kiddush-4closed');
        check('[kiddush] the real spouts close one by one: 0 within 3 s after the end', closedAt && closedAt - tEnd <= 3000, `open at the end ${openAtEnd}, at +1.3 s ${sMid.open}, closed at +${closedAt ? Math.round(closedAt - tEnd) : '-'} ms`);
        const k2 = await G(() => ({ st: __DAY.tasks.get('kiyor2').state, at: window.__F26K2 || 0 }));
        check('[kiddush] kiyor2 is open within 2 s after the kiddush', k2.st === 'open' && k2.at && k2.at - tEnd <= 2000, JSON.stringify(k2) + ` end ${tEnd}`);
        // the ממונה's bubble after the epilogue, and the blue level bar on the chip
        const bub = await waitFor(() => (window.__F26SAY || []).some((x) => /הכיור התרוקן/.test(x[1])), null, 9000);
        check('[kiddush] the ממונה\'s bubble: "הכיור התרוקן — מלאו אותו למחר"', bub, JSON.stringify((await G(() => window.__F26SAY || [])).slice(-3)));
        await pg.waitForTimeout(600);
        const chip = await G(() => [...document.querySelectorAll('.tw-mk.f26l')].filter((e) => getComputedStyle(e).display !== 'none').length);
        check('[kiddush] the kiyor\'s chip shows its level (a blue bar)', chip >= 1, `chips ${chip}`);
        await shot('kiddush-5after');
        // a few seconds later: still closed (no washer re-opens one)
        await pg.waitForTimeout(4000); const s3 = await W();
        check('[kiddush] the spouts stay closed', s3.open === 0, `open ${s3.open}`);
        await G(() => { for (const k of __DAY.tasks.list()) if (k.state === 'open') k.state = 'passed'; });
      }
    }

    // ───────── evarim: the names on every piece ─────────
    if (want('evarim')) {
      const ok = await toWork('g-evarim'); check('[evarim] the right button wakes', ok);
      if (ok) {
        const bc = await btnC(); await tap(bc); await pg.waitForTimeout(1800);
        const L = await G(() => (window.__F26E ? __F26E() : null));
        check('[evarim] every piece in the row carries its name from the start', L && L.row.length >= 9 && L.row.every((x) => x.label), JSON.stringify(L && L.row.map((x) => x.label)));
        await shot('evarim-1labels');
        let n = 0; const t0 = Date.now();
        while (Date.now() - t0 < 70000 && !(await G(() => !!(__DAY.tasks.get('g-evarim').state === 'done' || (window.__F26E && __F26E().done))))) { await tap(bc); n++; await pg.waitForTimeout(500); if (n === 6) await shot('evarim-2ramp'); }
        const L2 = await G(() => (window.__F26E ? __F26E() : null));
        check('[evarim] on the ramp too: every laid piece keeps its name', L2 && L2.ramp.length >= 9 && L2.ramp.every((x) => x.label), JSON.stringify(L2 && L2.ramp.map((x) => x.label)));
        check('[evarim] the last three (סולת, חביתין, יין) are not the lamb\'s: drawn distinct', L2 && L2.distinct === true, JSON.stringify(L2 && L2.kinds));
        await waitFor(() => /במדבר כח/.test((document.querySelector('.dy-line') || {}).textContent || ''), null, 12000);
        const line = await G(() => (document.querySelector('.dy-line') || {}).textContent || '');
        check('[evarim] the mentor line explains the three (במדבר כח)', /המנחה והנסכים/.test(line) && /במדבר כח/.test(line), line.slice(0, 160));
        await shot('evarim-3after');
        check('[evarim] nothing red', L2 && L2.reds === 0, `reds ${L2 && L2.reds}`);
        await G(() => { for (const k of __DAY.tasks.list()) if (k.state === 'open') k.state = 'passed'; });
      }
    }

    // ───────── payis: the prediction ─────────
    if (want('payis')) {
      const ok = await toWork('g-payis1'); check('[payis] the right button wakes', ok);
      if (ok) {
        const bc = await btnC(); await tap(bc); await pg.waitForTimeout(2600);
        await tap(bc); await pg.waitForTimeout(700);   // ── slice27 ── (the lot opens with his own finger: a tap = one) ── /slice27 ──
        const P = () => G(() => { const M = window.__P24M; return M ? { sub: M.sub, pos: M.pos, start: M.start, guess: M.guess, win: M.win, plan: M.plan ? M.plan.win : -1, j: M.j, n: M.plan ? M.plan.n : 0, done: !!M.done, phase: M.phase, gold: M.acts.filter((a) => a.q >= 2).length, stamp: !!M.stamp } : null; });
        const r0 = await P(); check('[payis] the ring runs', r0 && r0.sub === 'run', JSON.stringify(r0));
        await shot('payis-1ring');
        await tap(bc); await pg.waitForTimeout(1500);
        const r1 = await P();
        check('[payis] the stop names the number, then asks "מי יזכה?" (the predict window)', r1 && r1.sub === 'predict', JSON.stringify(r1));
        await shot('payis-2predict');
        // a real tap on the winner's figure (count ahead: the plan's last seat)
        const sp = await G(() => (window.__F26P ? __F26P.seats() : null));
        const win = r1.plan, at = sp && sp[win];
        check('[payis] the kohanim\'s figures are on the screen to tap', at && at.x > 0 && at.x < 844 && at.y > 0 && at.y < 390, JSON.stringify(sp));
        if (at) { await down(3, at.x, at.y); await pg.waitForTimeout(60); await up(3); }
        await pg.waitForTimeout(500);
        const r2 = await P();
        check('[payis] the tap on a figure registers the prediction', r2 && r2.guess === win && r2.sub !== 'predict', JSON.stringify(r2));
        let n = 0; while ((await P()).phase === 'work' && n < 30) { await tap(bc); n++; await pg.waitForTimeout(420); }
        await waitFor(() => !!(window.__P24M && __P24M.done), null, 5000);
        const r3 = await P();
        check('[payis] the count by taps finishes; right → the "ניחשתם!" stamp (gold)', r3 && r3.done && r3.win === win && r3.stamp, JSON.stringify(r3));
        await shot('payis-3stamp');
        await G(() => { for (const k of __DAY.tasks.list()) if (k.state === 'open') k.state = 'passed'; });
      }
    }
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  harness: ' + (e && e.stack || e)); results.push(false); }
  await b.close();
  const f = results.filter((x) => !x).length;
  console.log(`\n${results.length - f}/${results.length} pass · ${((Date.now() - T0) / 1000).toFixed(0)} s`);
  process.exit(f ? 1 : 0);
})();
