// WORKSA22 in ENGINE22's day (needs src/avodah/day merged + `import '../works/register.js'` uncommented): each work started from its marker by the
// right button on #avodah (dist/test.html, 844×390), taps alone finish it, the task is done, the points go in, the source line shows after the end.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/worksa22-day.cjs [--no-build] [--shots] [--only=pen,wood]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/worksa22-day');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const IDS = ['watch', 'fire', 'lambs', 'pen', 'wood'].filter((i) => !ONLY.length || ONLY.includes(i));
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
    const shot = async (name) => { if (!SHOTS) return; await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/worksa22-day/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); };
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('Phase B day mode is on (twin + __DAY)', on); if (!on) throw new Error('no day mode');
    await pg.waitForTimeout(800);
    console.log('   lights', JSON.stringify(await G(() => { const L = []; __T.scene.traverse((o) => { if (o.isLight) L.push([o.type.replace('Light', ''), +o.intensity.toFixed(2), o.visible ? 1 : 0]); }); return L.slice(0, 14); })));
    for (const id of IDS) {
      const tag = `[${id}]`, t0 = Date.now();
      await G((id) => { __DAY.clock.skipTo(['watch', 'fire', 'lambs'].includes(id) ? 22 : 10.2); __DAY.D.refresh && __DAY.D.refresh(); }, id); await pg.waitForTimeout(1200);
      await G((id) => { for (const o of ['watch', 'fire', 'lambs', 'pen', 'wood']) { const k = __DAY.tasks.get(o); if (o !== id && k && k.state === 'open') k.state = 'passed'; } }, id);   // (only this errand's marker wakes the button)
      const place = await G((id) => { __DAY.tasks.force(id); const k = __DAY.tasks.get(id); return k && k.place; }, id);
      check(`${tag} the task opens (forced) and has a place`, !!place, place);
      await G((p) => __DAY.teleport(p), place); await pg.waitForTimeout(1600);
      const awake = await waitFor((id) => { const s = __TWIN.spec(); return !!s && s.job === id; }, id, 25000);
      check(`${tag} the right button wakes at the marker`, awake);
      await shot(`${id}-0marker`);
      const bc = await btnC(); let n = 0, started = false;
      while (!(await G((id) => __DAY.tasks.get(id).state === 'done', id)) && Date.now() - t0 < 170000) {
        await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2); n++; await pg.waitForTimeout(450);
        if (!started && n === 3) { started = true; await shot(`${id}-1mid`); console.log('   stage', JSON.stringify(await G(() => { const k = __W22.kit(), F = k.F, o = []; for (const [a, s] of [[1.4, -4], [1.4, 4], [5, -4], [5, 4], [3, 0]]) { const p = k.screen(a, s, 0); o.push([a, s, p.x, p.y]); } return { K: +F.K.toFixed(2), Ca: +F.Ca.toFixed(2), a0: F.a0, at: [+F.x.toFixed(1), +F.z.toFixed(1)], pts: o }; }))); }
      }
      const done = await G((id) => __DAY.tasks.get(id).state === 'done', id);
      check(`${tag} taps alone finish it; the task is done`, done, `${n} taps ${((Date.now() - t0) / 1000).toFixed(0)}s`);
      await shot(`${id}-2end`);
      const line = await G(() => (document.querySelector('.dy-line') || {}).textContent || '');
      check(`${tag} the source line after the end (טיוטה)`, /טיוטה/.test(line), line.slice(0, 100));
      if (id === 'pen') check(`${tag} labelled המחשה`, /המחשה/.test(line + (await G(() => __DAY.tasks.get('pen').he))));
      if (id === 'wood') check(`${tag} the stock got wood`, (await G(() => __DAY.stock.get('wood'))) >= 5, 'wood ' + (await G(() => __DAY.stock.get('wood'))));
      await pg.waitForTimeout(3000);
    }
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  exception', e && e.stack ? e.stack.split('\n').slice(0, 4).join(' ') : e); results.push(false); }
  finally { await b.close(); console.log(`\n${results.filter(Boolean).length}/${results.length} passed in ${((Date.now() - T0) / 1000).toFixed(0)} s`); process.exit(results.every(Boolean) ? 0 : 1); }
})();
