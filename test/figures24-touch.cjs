// FIGURES24 real touch at 844×390 on dist/test.html#avodah: (A) the pose gallery — each pose of the kohen figure drawn by the kit at the
// player's stage and shot through the close-up camera (closeAt), the act in the frame's middle; a crowd of 13 in the blessing; (B) the works
// with their close-ups: g-birkat (the hands above the head), g-ketoret (the cloud), g-neirot (the menorah), g-shir (the people's bow) — each
// started from its marker by the right button, finished by taps alone; the close-up comes in at the key act and goes back after the end;
// the render scale rises during the work and comes back (view.workResLog); no red, no Name, no console errors.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/figures24-touch.cjs [--no-build] [--part=a|b] [--only=g-birkat]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/figures24');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const PART = (args.find((a) => a.startsWith('--part=')) || '--part=ab').slice(7), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const POSES = (args.find((a) => a.startsWith('--poses=')) || '--poses=bless,carry,scoop,pour,bow,walk,stand,lots').slice(8).split(',');
const HOUR = { 'g-ketoret': 6.9, 'g-birkat': 7.15, 'g-shir': 7.3, 'g-neirot': 15.55 };
const KEY = { 'g-birkat': 'birkat', 'g-ketoret': 'ketoret', 'g-neirot': 'neirot', 'g-shir': 'song-bow' };
const IDS = Object.keys(HOUR).filter((i) => !ONLY.length || ONLY.includes(i));
const NAME = new RegExp(['ה׳', 'אלקים', 'א-ל'].join('|'));
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
    await pg.addInitScript(() => { try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'אביתר', mishmar: 3, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* none */ } window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.25; });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const shot = async (name) => { await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/figures24/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); };
    // the close-up's point on the screen now (CSS px) and how far it is in
    const cuNow = () => G(() => { const s = __F24.closeState(), q = __T.view.project ? (__T.view.projectRaw || __T.view.project).call(__T.view, s.x, s.y, s.z) : null; return { ...s, sx: q && q.x, sy: q && q.y }; });
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('Phase B day mode is on (twin + __DAY)', on); if (!on) throw new Error('no day mode');
    await pg.waitForTimeout(800);

    if (PART.includes('a')) {
      // (A) the gallery: the poses in a row at the stage ahead of him, each through the close-up
      const g = await G((poses) => {
        const k = __W22.kit(); k.place({ ahead: 0.5, lat: 0, K: 1.5, fixed: true }); const F0 = { ...k.F };   // (just ahead of him, east of the altar's face)
        const draw = () => { Object.assign(k.F, F0); k.begin(); poses.forEach((p, i) => __F24.man(k, 2, (i - (poses.length - 1) / 2) * 1.1, 0, { pose: p, yaw: Math.PI, u: 1, t: 0.35, fingers: p === 'lots' ? 2 : 0, skin: ['#E0B58C', '#D3A27A', '#C79468'][i % 3] })); k.end(); };
        draw(); window.__F24DRAW = draw;
        return { stats: k.stats(), reds: k.reds() };
      }, POSES);
      check('(A) the gallery is drawn (one figure per pose, instanced)', g.stats.figs === POSES.length, JSON.stringify(g.stats));
      check('(A) no red in the figures', g.reds === 0, 'reds ' + g.reds);
      for (let i = 0; i < POSES.length; i++) {
        const p = POSES[i], s = (i - (POSES.length - 1) / 2) * 1.1, yc = p === 'bless' ? 1.25 : p === 'scoop' || p === 'bow' ? 0.75 : 1.0;
        await G(([s, yc]) => { __F24DRAW(); __F24.closeAt(__W22.kit(), 2, s, yc, { dist: 5, el: 0.4, from: 2.5, hold: 30, key: 'gallery-' + s }); }, [s, yc]);
        const inn = await waitFor(() => __F24.closeState().w >= 0.999, null, 9000);
        await G(() => __F24DRAW());
        const c = await cuNow();
        if (i === 0) { const st0 = await G(() => __W22.kit().stats()); check('(A) close: the fingers are drawn (a far figure keeps mitten hands)', st0.fingers >= 4 * POSES.length, JSON.stringify(st0)); }
        if (i === 0) console.log('   dbg', JSON.stringify(await G(() => { const k = __W22.kit(), h = __TWIN.probe().h, v = __T.view.camNow({}); return { F: { x: k.F.x, y: k.F.y, z: k.F.z, fx: k.F.fx, fz: k.F.fz, K: k.F.K, on: k.F.on }, hero: h, cam: v, cu: __F24.closeState(), st: k.stats() }; })));
        check(`(A) ${p}: the close-up comes in, the act in the frame's middle`, inn && Math.abs(c.sx - 422) < 90 && Math.abs(c.sy - 195) < 70, `w ${c.w} at ${Math.round(c.sx)},${Math.round(c.sy)}`);
        await shot(`pose-${p}`);
        await G(() => __F24.release()); await waitFor(() => !__F24.closeState().on, null, 8000);
      }
      // the 13 in the blessing (one row on a step): the crowd is the same ten draw calls
      const cr = await G(() => { const k = __W22.kit(), F0 = { ...k.F }; window.__F24DRAW = () => { Object.assign(k.F, F0); k.begin(); for (let i = 0; i < 13; i++) __F24.man(k, 2 + (i % 2) * 0.5, (i - 6) * 0.62, 0, { pose: 'bless', yaw: Math.PI, u: 1, skin: ['#E0B58C', '#D3A27A', '#C79468'][i % 3], scale: 0.95 }); k.end(); }; __F24DRAW(); __F24.closeAt(k, 2.2, 0, 1.1, { dist: 7, el: 0.42, from: 2.5, hold: 30 }); return k.stats(); });
      await waitFor(() => __F24.closeState().w >= 0.999, null, 9000); await G(() => __F24DRAW());
      check('(A) a crowd of 13 in the blessing', cr.figs === 13, JSON.stringify(cr));
      await shot('crowd-13-bless');
      const calls = await G(() => __T.drawCalls());
      console.log('   draw calls with 13 figures in view', JSON.stringify(calls));
      await G(() => { __F24.release(); const k = __W22.kit(); k.clear(); });
      const back = await waitFor(() => !__F24.closeState().on, null, 8000);
      check('(A) released: back to the follow camera', back);
    }

    if (PART.includes('b')) {
      await G(() => { window.__TB_PTS = {}; const T = __DAY.tasks, d0 = T.done.bind(T); T.done = (id, q) => { const p = d0(id, q); window.__TB_PTS[id] = p; return p; }; });
      for (const id of IDS) {
        const tag = `[${id}]`;
        await G((h) => { __DAY.clock.skipTo(h); __DAY.D.refresh && __DAY.D.refresh(); }, HOUR[id]); await pg.waitForTimeout(1200);
        await G((id) => { for (const k of __DAY.tasks.list()) if (k.id !== id && k.state === 'open') k.state = 'passed'; }, id);
        const place = await G((id) => { __DAY.tasks.force(id); const k = __DAY.tasks.get(id); return k && k.state === 'open' && k.place; }, id);
        check(`${tag} the task is open at its hour`, !!place, place);
        await G((p) => __DAY.teleport(p), place); await pg.waitForTimeout(1600);
        const awake = await waitFor((id) => { const s = __TWIN.spec(); return !!s && s.job === id; }, id, 25000);
        check(`${tag} the right button wakes at the marker`, awake);
        const bc = await btnC(); let n = 0, reds = 0, t0 = Date.now(), shotDone = false, cuSeen = null, prMax = 0, names = '';
        await G(() => { __T.view.workResLog = []; });
        while (!(await G((id) => __DAY.tasks.get(id).state === 'done', id)) && Date.now() - t0 < 120000) {
          await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2); n++; await pg.waitForTimeout(430);
          const st = await G(() => ({ reds: __W22.kit() ? __W22.kit().reds() : 0, cu: __F24.closeState(), pr: __T.view.pixelRatio(), txt: [...document.querySelectorAll('.dy-line,.dy-say,.tw-btn')].map((e) => e.textContent).join(' ') }));
          reds = Math.max(reds, st.reds); prMax = Math.max(prMax, st.pr); names += st.txt;
          if (st.cu.on && st.cu.key) cuSeen = cuSeen || st.cu.key;
          if (!shotDone && st.cu.on && st.cu.key === KEY[id]) {
            const inn = await waitFor(() => __F24.closeState().w >= 0.999 || !__F24.closeState().goal, null, 6000);
            const c = await cuNow();
            check(`${tag} the close-up at the key act (${KEY[id]}), the act in the frame's middle`, inn && c.w >= 0.99 && Math.abs(c.sx - 422) < 110 && Math.abs(c.sy - 195) < 80, `w ${c.w} at ${Math.round(c.sx)},${Math.round(c.sy)} dist ${c.dist.toFixed(1)} df ${c.df} de ${c.de}`);
            await shot(`${id}-closeup`); shotDone = true;
          }
        }
        const done = await G((id) => __DAY.tasks.get(id).state === 'done', id);
        check(`${tag} taps alone finish it; the task is done`, done, `${n} taps ${((Date.now() - t0) / 1000).toFixed(0)} s`);
        check(`${tag} the close-up was asked (or, with no clear pose, refused)`, cuSeen === KEY[id] || shotDone || id === 'g-neirot', String(cuSeen));
        check(`${tag} no red`, reds === 0, 'reds ' + reds);
        check(`${tag} no Name on screen`, !NAME.test(names));
        const back = await waitFor(() => !__F24.closeState().on, null, 8000);
        const log = await G(() => __T.view.workResLog || []);
        check(`${tag} after the end: the follow camera back, the render scale asked up and back`, back && log.join('') === '10', `log ${log.join('')} pr≤${prMax}`);
        await shot(`${id}-after`);
        await pg.waitForTimeout(1500);
      }
    }
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  exception', e && e.stack ? e.stack.split('\n').slice(0, 4).join(' ') : e); results.push(false); }
  finally { await b.close(); console.log(`\n${results.filter(Boolean).length}/${results.length} passed in ${((Date.now() - T0) / 1000).toFixed(0)} s`); process.exit(results.every(Boolean) ? 0 : 1); }
})();
