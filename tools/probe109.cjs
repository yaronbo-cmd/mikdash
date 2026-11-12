// probe109 — build 109's eyes: boot dist/test.html paused (the world simulated at 20 Hz, frames rendered only for a shot), then
// run a script of steps. node tools/probe109.cjs SCRIPT.json OUTDIR [W H]
//   steps: { "wait": ms } · { "eval": "js" } (its value is logged) · { "shot": "name" } · { "tap": [x, y] } · { "drag": [x0, y0, x1, y1, ms] }
//          { "script": "file.js" } (evaluated in the page) · { "path": [[x,y],...], ms, hold, release:"js" } · { "when": "js", max, then: step }
//          { "bot": "js → a step (or {done:true})", max } (the page's player: it returns the next step until done)
//          { "hold": [x, y, ms] } · { "holdUntil": [x, y, "js", maxMs] } · { "until": "js", "max": ms } · { "log": "js" }
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const [SCRIPT, OUT, W0, H0] = process.argv.slice(2);
const W = +(W0 || 960), H = +(H0 || 600), ROOT = path.join(__dirname, '..');
fs.mkdirSync(OUT, { recursive: true });
const steps = JSON.parse(fs.readFileSync(SCRIPT, 'utf8'));
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'] });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: !process.env.MOUSE, isMobile: !process.env.MOUSE && W < 1000, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('console', (m) => { if (m.type() === 'error' || /\[h109\]/.test(m.text())) errs.push(m.type() + ' ' + m.text().slice(0, 300)); });
  if (process.env.PROBE_ALL) { pg.on('console', (m) => { if (/\[h1(09|11|12|13)\]/.test(m.text())) console.log('CONSOLE', m.type(), m.text().slice(0, 300)); }); pg.on('framenavigated', (f) => { if (f === pg.mainFrame()) console.log('NAV', f.url().slice(-60)); }); }
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 300)));
  pg.on('crash', () => console.log('PAGE CRASHED'));
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const init = steps.find((s) => s.init); 
  await pg.addInitScript((code) => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; try { localStorage.clear(); } catch (e) { /* */ } if (code) { try { (0, eval)(code); } catch (e) { console.error('init', e.message); } } }, init ? init.init : '');
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 300000 });
  const cdp = await ctx.newCDPSession(pg);
  // (MOUSE=1: the same script played with a mouse; the first finger is the mouse, a second finger is ignored)
  if (process.env.MOUSE) { const send0 = cdp.send.bind(cdp); let down = false, last = [0, 0];
    cdp.send = async (m, o) => { if (m !== 'Input.dispatchTouchEvent') return send0(m, o); const p = o.touchPoints && o.touchPoints[0];
      if (o.type === 'touchStart' && p && !down) { last = [p.x, p.y]; await pg.mouse.move(p.x, p.y); await pg.mouse.down(); down = true; }
      else if (o.type === 'touchMove' && p && down) { last = [p.x, p.y]; await pg.mouse.move(p.x, p.y); }
      else if (o.type === 'touchEnd' && down) { await pg.mouse.up(); down = false; } }; }
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: 7 + i, radiusX: 6, radiusY: 6, force: 1 })) });
  const T0 = Date.now(); let n = 0;
  const log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(0)}s]`, ...a);
  async function run(s) {
    if (s.init) return;
    if (s.wait) await pg.waitForTimeout(s.wait);
    if (s.eval) { const v = await pg.evaluate(s.eval).catch((e) => 'EVALERR ' + e.message); if (v !== undefined) log('eval', typeof v === 'string' ? v.slice(0, 9000) : JSON.stringify(v).slice(0, 9000)); }
    if (s.log) { const v = await pg.evaluate(s.log).catch((e) => 'ERR ' + e.message); log(typeof v === 'string' ? v.slice(0, 1500) : JSON.stringify(v).slice(0, 1500)); }
    if (s.until) { const t = Date.now(); while (Date.now() - t < (s.max || 60000)) { const ok = await pg.evaluate(s.until).catch(() => false); if (ok) break; await pg.waitForTimeout(300); } log('until', s.until.slice(0, 80), ((Date.now() - t) / 1000).toFixed(1) + 's'); }
    if (s.tap) { await touch('touchStart', [s.tap]); await pg.waitForTimeout(70); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    if (s.hold) { const [x, y, ms] = s.hold; await touch('touchStart', [[x, y]]); await pg.waitForTimeout(ms); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    if (s.tapAt) { const v = await pg.evaluate(s.tapAt).catch((e) => null); if (v) { await touch('touchStart', [v]); await pg.waitForTimeout(50); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } log('tapAt', JSON.stringify(v)); }
    if (s.dragAt) { const v = await pg.evaluate(s.dragAt).catch((e) => null); if (v) { const [x0, y0, x1, y1, ms = 500] = v; const k = Math.max(4, Math.round(ms / 40)); await touch('touchStart', [[x0, y0]]); for (let i = 1; i <= k; i++) { await pg.waitForTimeout(ms / k); await touch('touchMove', [[x0 + ((x1 - x0) * i) / k, y0 + ((y1 - y0) * i) / k]]); } await pg.waitForTimeout(80); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } log('dragAt', JSON.stringify(v)); }
    if (s.tapWhen) { const [x, y, cond, max = 8000] = s.tapWhen; const t = Date.now(); let ok = false; while (Date.now() - t < max) { if (await pg.evaluate(cond).catch(() => false)) { ok = true; break; } await pg.waitForTimeout(8); } if (ok) { await touch('touchStart', [[x, y]]); await pg.waitForTimeout(40); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } log('tapWhen', ok ? 'tap' : 'timeout', ((Date.now() - t) / 1000).toFixed(2) + 's'); }
    if (s.holdUntil) { const [x, y, cond, max = 20000] = s.holdUntil; await touch('touchStart', [[x, y]]); const t = Date.now(); while (Date.now() - t < max) { if (await pg.evaluate(cond).catch(() => false)) break; await pg.waitForTimeout(25); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); log('holdUntil', ((Date.now() - t) / 1000).toFixed(2) + 's'); }
    if (s.drag) { const [x0, y0, x1, y1, ms = 400] = s.drag; const k = Math.max(4, Math.round(ms / 40)); await touch('touchStart', [[x0, y0]]); for (let i = 1; i <= k; i++) { await pg.waitForTimeout(ms / k); await touch('touchMove', [[x0 + ((x1 - x0) * i) / k, y0 + ((y1 - y0) * i) / k]]); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    if (s.shot) {
      await pg.evaluate(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; });
      const f = path.join(OUT, `${String(++n).padStart(2, '0')}-${s.shot}.png`); await pg.screenshot({ path: f, timeout: 240000 }); log('shot', path.basename(f));
      await pg.evaluate(() => { window.__HUD_HOLD = false; __T.simulate(true); });
    }
    if (s.script) { const code = fs.readFileSync(path.resolve(s.script), 'utf8'); const v = await pg.evaluate(code).catch((e) => 'SCRIPTERR ' + e.message); log('script', s.script, typeof v === 'string' ? v.slice(0, 200) : ''); }
    if (s.path) { const P = s.path, ms = s.ms || 600; await touch('touchStart', [P[0]]); const k = Math.max(P.length - 1, Math.round(ms / 40)); for (let i = 1; i <= k; i++) { await pg.waitForTimeout(ms / k); const f = (i / k) * (P.length - 1), j = Math.min(P.length - 2, Math.floor(f)), u = f - j; await touch('touchMove', [[P[j][0] + (P[j + 1][0] - P[j][0]) * u, P[j][1] + (P[j + 1][1] - P[j][1]) * u]]); } if (s.keep) { const t = Date.now(); while (Date.now() - t < s.keep) { if (s.release && await pg.evaluate(s.release).catch(() => false)) break; await pg.waitForTimeout(20); } } if (s.after) { const A = [P[P.length - 1], ...s.after], m2 = s.afterMs || 400, k2 = Math.max(4, Math.round(m2 / 40)); for (let i = 1; i <= k2; i++) { await pg.waitForTimeout(m2 / k2); const f = (i / k2) * (A.length - 1), j = Math.min(A.length - 2, Math.floor(f)), u = f - j; await touch('touchMove', [[A[j][0] + (A[j + 1][0] - A[j][0]) * u, A[j][1] + (A[j + 1][1] - A[j][1]) * u]]); } } await pg.waitForTimeout(60);   /* (build 120: after the keep, the finger eases back along `after` before it lifts) */ await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    // (build 113: several fingers) frames of touch points; a frame with more points presses the new ones, fewer releases the last ones
    if (s.seq) {
      let n0 = 0, last = []; const ms = s.ms || 50;
      for (const fr of s.seq) {
        const pts = fr || [];
        if (!pts.length) { if (n0) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
        else if (pts.length < n0) {
          // (lift the last fingers only: a touchEnd naming the ones lifted, the rest stay down)
          const gone = []; for (let i = pts.length; i < n0; i++) gone.push(last[i]);
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: gone.map(([x, y], j) => ({ x: Math.round(x), y: Math.round(y), id: 7 + pts.length + j })) }).catch(async () => { await touch('touchMove', pts); });
        } else await touch(pts.length > n0 ? 'touchStart' : 'touchMove', pts);
        if (pts.length) last = pts;
        n0 = pts.length; await pg.waitForTimeout(ms);
      }
      if (n0) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    if (s.when) { const t = Date.now(); while (Date.now() - t < (s.max || 4000)) { if (await pg.evaluate(s.when).catch(() => false)) break; await pg.waitForTimeout(8); } if (s.then) await run(s.then); }
    if (s.bot) {
      const t = Date.now(); let k = 0, last = '';
      while (Date.now() - t < (s.max || 600000)) {
        const a = await pg.evaluate(s.bot).catch((e) => ({ wait: 500, note: 'BOTERR ' + e.message }));
        if (!a) { await pg.waitForTimeout(300); continue; }
        if (a.note && a.note !== last) { log('bot', a.note); last = a.note; }
        if (a.done) { log('bot done', ((Date.now() - t) / 1000).toFixed(0) + 's', k, 'actions'); break; }
        k++; try { await run(a); } catch (e) { log("bot step failed", e.message); await pg.waitForTimeout(500); }
      }
    }
  }
  for (const s of steps) await run(s);
  console.log(errs.length ? 'ERRORS:\n' + errs.slice(0, 30).join('\n') : 'no errors');
  await b.close();
})().catch((e) => { console.error('probe failed', e); process.exit(1); });
