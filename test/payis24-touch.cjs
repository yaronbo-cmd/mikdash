// PAYIS24: the lots in the player's hand and the new works (pitum · yachid · machar · etzim · tokim) in ENGINE22's day, by real touch on dist/test.html#avodah at 844×390 — each errand at its hour
// (clock.skipTo), the right button wakes at its marker, the tap starts the WORK (not the sheet), taps alone finish it in ≤ 60 s, the points
// go in (taskDone pts > 0), the source line shows after the end (טיוטה), no red in the stage, the hero never passes the Ulam (x > −81),
// no console errors.   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/payis24-touch.cjs [--no-build] [--shots] [--only=g-deshen,…]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/payis24');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const IDS = ['g-payis1', 'g-payis2', 'g-payis3', 'g-payis4', 'g-machar', 'pitum', 'yachid', 'etzim', 'tokim'].filter((i) => !ONLY.length || ONLY.includes(i));
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
    await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'אביתר', mishmar: 3, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* none */ } window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    let shotMs = 0; const shot = async (name) => { if (!SHOTS) return; const sT = Date.now(); try { await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/payis24/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); } finally { shotMs += Date.now() - sT; } };
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('Phase B day mode is on (twin + __DAY)', on); if (!on) throw new Error('no day mode');
    check('the payis24 works are registered', await G(() => ['payis', 'payis2', 'payis3', 'payis4', 'machar', 'pitum', 'yachid', 'etzim', 'tokim'].every((i) => __DAY.WORKS[i] && __DAY.WORKS[i].model)));
    await pg.waitForTimeout(800);
    for (const id of IDS) {
      const tag = `[${id}]`;
      const info = await G((id) => { const k = __DAY.tasks.get(id); return k ? { h: k.openH, work: k.work, game: k.game || null, place: k.place } : null; }, id);
      check(`${tag} the errand is a work, not a sheet`, info && info.work && !info.game, JSON.stringify(info));
      if (!info) continue;
      await G((h) => { __DAY.clock.skipTo(h + 0.05); __DAY.D.refresh && __DAY.D.refresh(); }, info.h); await pg.waitForTimeout(900);
      await G((id) => { for (const k of __DAY.tasks.list()) if (k.id !== id && k.state === 'open') k.state = 'passed'; __DAY.tasks.force(id); __DAY.clock.pause(); }, id);   // (only this errand's marker wakes the button; the clock holds at its hour)
      const opened = await G((id) => __DAY.tasks.get(id).state === 'open', id);
      check(`${tag} opens at its hour (${info.h})`, opened);
      await G((p) => __DAY.teleport(p), info.place); await pg.waitForTimeout(1500);
      const awake = await waitFor((id) => { const s = __TWIN.spec(); return !!s && s.job === id; }, id, 25000);
      check(`${tag} the right button wakes at the marker`, awake);
      await G(() => { const v = __T.view, c = v.camNow({}), h = {}; __T.stages.heroXYZ(h); const r = Math.hypot(c.px - c.tx, c.pz - c.tz) || 8, hy = c.py - c.ty; v.camSet(h.x - r, c.ty + hy, h.z, h.x, c.ty, h.z); });   // (the camera behind him, looking the way he faces: the teleport keeps the camera's old heading)
      await pg.waitForTimeout(2200);   // (the follow camera settles behind him, as when a player stands still at the marker)
      await G(() => { window.__GAME_LOG.length = 0; });
      const bc = await btnC(); let n = 0, mid = false, reds = 0, minX = 1e9; let t0 = Date.now(); shotMs = 0;
      const isLot = /^payis/.test(info.work);
      if (isLot) {
        await G(() => { window.__P24M = null; });
        await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2);   // (this tap starts the work)
        const started = await waitFor(() => !!window.__P24M && window.__P24M.phase === 'work', null, 15000);
        check(`${tag} the tap starts the lot (the ring work, not the sheet)`, started);
        // ── slice27 ── the day's lots open with the player raising his own finger: one tap = one finger, then the ring runs
        if (await G(() => !!window.__P24M && window.__P24M.sub === 'finger')) { await down(2, bc.x, bc.y); await pg.waitForTimeout(250); await up(2); await waitFor(() => window.__P24M && window.__P24M.sub === 'run', null, 5000); }
        // ── /slice27 ──
        await pg.waitForTimeout(2400);
        const s0 = await G(() => { const M = window.__P24M; return { sub: M.sub, pos: M.pos, rt: M.rt }; });
        const seen = new Set(); let ticks = 0, lastPos = -1; let rt0 = -1, rt1 = 0;   // (game time, not wall time: a loaded machine draws few frames)
        for (let q = 0; q < 400 && rt1 - rt0 < 2.2; q++) { await pg.waitForTimeout(100); const m = await G(() => { const M = window.__P24M; return { pos: M.pos, rt: M.rt, sub: M.sub }; }); if (rt0 < 0) rt0 = m.rt; rt1 = m.rt; seen.add(m.pos); if (m.pos !== lastPos) { if (lastPos >= 0) ticks++; lastPos = m.pos; } if (m.sub !== 'run') break; }
        check(`${tag} the gold ring runs round the kohanim before any tap`, s0.sub === 'run' && seen.size >= 3, `sub ${s0.sub} seen ${[...seen]} (${ticks} moves in ${(rt1 - rt0).toFixed(1)} game s)`);
        await shot(`${id}-0ring`);
        const before = await G(() => window.__P24M.pos);
        await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2); n++;
        await pg.waitForTimeout(120);
        const af = await G(() => { const M = window.__P24M; return { sub: M.sub, start: M.start, pos: M.pos, i: M.i, n: M.n }; });
        check(`${tag} the tap stopped the ring on a kohen (the hat is taken)`, af.sub !== 'run' && af.start >= 0 && af.start === af.pos, JSON.stringify({ before, ...af }));
        await pg.waitForTimeout(400); const still = await G(() => window.__P24M.pos);
        check(`${tag} the ring stays where it stopped`, still === af.pos, `pos ${still}`);
        await shot(`${id}-0named`);
        await pg.waitForTimeout(500); t0 = Date.now(); shotMs = 0;
      }
      while (!(await G((id) => __DAY.tasks.get(id).state === 'done', id)) && Date.now() - t0 < 75000) {
        await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2); n++; await pg.waitForTimeout(430);
        const st = await G((w) => { const W = window.__PAYIS24 && __PAYIS24.works[w]; const s = W ? W.state() : null; const h = {}; __T.stages.heroXYZ(h); return { reds: s ? s.reds : 0, on: s ? s.on : false, x: h.x }; }, info.work);
        reds = Math.max(reds, st.reds); minX = Math.min(minX, st.x);
        if (!mid && n === 4) { mid = true; await shot(`${id}-1mid`); console.log('   stage', JSON.stringify(await G((w) => { const k = window.__W22 && __W22.kit(), W = window.__PAYIS24 && __PAYIS24.works[w]; const c = __T.camera, tg = __T.controls.target, cf = Math.atan2(tg.x - c.position.x, tg.z - c.position.z), sf = k ? k.F.yaw : 0, d = Math.atan2(Math.sin(cf - sf), Math.cos(cf - sf)); return { fit: k ? k.F.fit : null, refit: W ? W.lastFit : null, camVsStageDeg: +(d * 57.3).toFixed(0), camY: +(c.position.y - tg.y).toFixed(1), camR: +Math.hypot(c.position.x - tg.x, c.position.z - tg.z).toFixed(1) }; }, info.work))); }
      }
      const secs = (Date.now() - t0 - shotMs) / 1000, done = await G((id) => __DAY.tasks.get(id).state === 'done', id);
      check(`${tag} taps alone finish it in ≤ 60 s`, done && secs <= 60, `${n} taps ${secs.toFixed(0)} s`);
      const pts = await G((id) => { const e = window.__GAME_LOG.find((x) => x.type === 'taskDone' && x.d && x.d.id === id); return e ? e.d.pts : 0; }, id);
      check(`${tag} the points go in`, pts > 0, `+${pts}`);
      await pg.waitForTimeout(400);
      await shot(`${id}-2end`);
      const line = await G(() => (document.querySelector('.dy-line') || {}).textContent || '');
      check(`${tag} the source line after the end (טיוטה + a source)`, /טיוטה/.test(line) && /[א-ת]+ [א-ת]{1,3}, [א-ת]/.test(line), line.slice(0, 110));
      if (info.work !== 'kiyor') check(`${tag} nothing red on the stage`, reds === 0, `reds ${reds}`);
      if (id === 'g-heichal') check(`${tag} the hero never passes the Ulam (x > −81)`, minX > -81, `min x ${minX.toFixed(1)}`);
      await pg.waitForTimeout(2600);
    }
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  exception', e && e.stack ? e.stack.split('\n').slice(0, 4).join(' ') : e); results.push(false); }
  finally { await b.close(); console.log(`\n${results.filter(Boolean).length}/${results.length} passed in ${((Date.now() - T0) / 1000).toFixed(0)} s`); process.exit(results.every(Boolean) ? 0 : 1); }
})();
