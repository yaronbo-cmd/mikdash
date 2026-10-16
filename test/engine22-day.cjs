// ENGINE22 (wave 22): the whole day's errands, each started from its marker by the right button (real CDP touch) and finished by taps
// ALONE — whichever works are registered (the night, the pen, the wood, the gate, the seals, the kiyor, the vessels, the account, the
// gates) or the generic three-tap errand. 844×390 on dist/test.html#avodah.   NODE_PATH=… brun node test/engine22-day.cjs [--no-build] [--only=a,b]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const IDS = ['fire', 'watch', 'lambs', 'kiyor', 'queue', 'seals', 'wood', 'wicks', 'pen', 'nechunya', 'vessels', 'account', 'gates'].filter((i) => !ONLY.length || ONLY.includes(i));
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
    await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on(), null, 60000);
    await G(() => { __DAY.clock.pause(); window.__WB22_EVERY = 4; });   // (WORKSB22's queue sends a pilgrim every 20 s by default: the test asks for one every 4 s)   // (the day waits while the bot plays: every errand stays open)
    for (const id of IDS) {
      const reg = await G((i) => { const t = __DAY.tasks.get(i); return { work: t && t.work, has: !!(t && __DAY.WORKS[t.work]) }; }, id);
      await G((i) => { __DAY.tasks.force(i); const t = __DAY.tasks.get(i); __DAY.teleport(t.place); }, id);
      await pg.waitForTimeout(1500);
      const awake = await waitFor((i) => { const s = __TWIN.spec(); return !!s && s.job === i; }, id, 6000);
      if (!awake) { check(`${id}: the button wakes at its marker`, false, JSON.stringify(await G(() => __TWIN.spec() && __TWIN.spec().job))); continue; }
      const t0 = Date.now(); let n = 0, done = false;
      while (Date.now() - t0 < 90000 && !done) {
        const c = await G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        await down(2, c.x, c.y); await pg.waitForTimeout(70); await up(2); n++;
        await pg.waitForTimeout(260);
        done = await G((i) => __DAY.tasks.get(i).state === 'done', id);
      }
      check(`${id} (${reg.has ? reg.work : 'generic'}): started from its marker, finished by taps alone`, done, `${n} taps · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    }
    /* the soak: a whole day by the clock (45 real minutes in 15-second steps, the world running): every block starts once, the tasks open
       and pass by themselves, the stores run low and open their errands, the day ends once with its card, the next night begins */
    if (!ONLY.length) {
      await G(() => { window.__GAME_LOG.length = 0; __DAY.clock.resume(); });
      for (let k = 0; k < 190; k++) { await G(() => { __DAY.clock.tick(15); }); await pg.waitForTimeout(40); if (await G(() => __DAY.clock.ended)) break; }
      const ended = await waitFor(() => !!document.querySelector('.dy-card'), null, 8000);
      const ev = await G(() => { const c = {}; for (const e of window.__GAME_LOG) c[e.type] = (c[e.type] || 0) + 1; return c; });
      check('the soak: the day runs 18:00 → 18:00 by the clock (blockStart ×4 or more, dayTick ≥ 90, taskOpen/taskPassed, restocks, dayEnd ×1) and ends with its card', ended && (ev.blockStart || 0) >= 4 && (ev.dayTick || 0) >= 90 && ev.taskPassed >= 10 && ev.dayEnd === 1, JSON.stringify(ev).slice(0, 220));
      await G(() => document.querySelector('.dy-go').click());
      check('and the next night begins (day 2), no tasks carried over', await waitFor(() => __DAY.clock.now().n === 2 && __DAY.clock.now().block === 'night', null, 4000) && await G(() => __DAY.tasks.counts().done === 0));
    }
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  exception', e && e.stack ? e.stack.split('\n').slice(0, 4).join(' ') : e); results.push(false); }
  finally { await b.close(); console.log(`\n${results.filter(Boolean).length}/${results.length} passed in ${((Date.now() - T0) / 1000).toFixed(0)} s`); process.exit(results.every(Boolean) ? 0 : 1); }
})();
