// probe109 — build 109's eyes: boot dist/test.html paused (the world simulated at 20 Hz, frames rendered only for a shot), then
// run a script of steps. node tools/probe109.cjs SCRIPT.json OUTDIR [W H]
//   steps: { "wait": ms } · { "eval": "js" } (its value is logged) · { "shot": "name" } · { "tap": [x, y] } · { "drag": [x0, y0, x1, y1, ms] }
//          { "script": "file.js" } (evaluated in the page) · { "path": [[x,y],...], ms, hold, release:"js" } · { "when": "js", max, then: step }
//          { "bot": "js → a step (or {done:true})", max } (the page's player: it returns the next step until done)
//          { "hold": [x, y, ms] } · { "holdUntil": [x, y, "js", maxMs] } · { "until": "js", "max": ms } · { "log": "js" }
// FAST=1 (environment): a logic run. The init script sets window.__PROBE_FAST = 1 before the game loads, and src/main.js then draws
//   cheaply: pixel ratio 0.5 (kept there: the works' render scale and the frame-time guard do not raise it), no shadow map, no bloom,
//   no multisampled target (the OutputPass stays: it tone-maps). The viewport, the layout, the touch geometry (X.scr, grips in CSS px),
//   the game clock, the acts and the bot are as in a normal run. Use it for runs that check logic only (a work played to its end:
//   stars, points, flags, no stuck, the save). Its stills are blurred and flat: any still a person or a reviewer judges must come
//   from a normal run (without FAST). Note the probe is paced by the game's own clock (the world simulated in real time, the bot's
//   waits), so FAST shortens the boot and each still, not the play between them; the last lines log where the time went.
// PROBE_EXE=path: the Chromium to launch (default: /opt/pw-browsers/chromium where that file exists — the cloud — else Playwright's own
//   installed Chromium). PROBE_GPU=1: the machine's real graphics card instead of SwiftShader (on Windows ANGLE over Direct3D 11;
//   without PROBE_EXE, Playwright's full Chromium in its new headless mode, which can use the GPU). PROBE_HEADED=1: a visible window,
//   the fallback where headless still falls back to software. The first line logs the WebGL renderer (SwiftShader or the card), the
//   last lines the run's wall time and the page's frame times when it exposes them (__S30PROF, started by a script). Defaults: as before.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { pathToFileURL } = require('url');
const [SCRIPT, OUT, W0, H0] = process.argv.slice(2);
const W = +(W0 || 960), H = +(H0 || 600), ROOT = path.join(__dirname, '..');
fs.mkdirSync(OUT, { recursive: true });
const steps = JSON.parse(fs.readFileSync(SCRIPT, 'utf8'));
(async () => {
  const TB = Date.now();
  const TW = Date.now(), GPU = !!process.env.PROBE_GPU;
  const EXE = process.env.PROBE_EXE || (fs.existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
  const ANGLE = process.platform === 'win32' ? 'd3d11' : process.platform === 'darwin' ? 'metal' : 'gl';
  const args = GPU ? [`--use-angle=${ANGLE}`, '--enable-gpu', '--ignore-gpu-blocklist', '--enable-gpu-rasterization', '--mute-audio'] : ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'];
  const b = await chromium.launch({ executablePath: EXE, ...(GPU && !EXE ? { channel: 'chromium' } : {}), headless: !process.env.PROBE_HEADED, args });
  const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: !process.env.MOUSE, isMobile: !process.env.MOUSE && W < 1000, deviceScaleFactor: +(process.env.DSF || 1), locale: 'he-IL' });
  const pg = await ctx.newPage();
  const errs = [];
  const notes = [];   // ── h132 ── (the director's own [h109] info lines are notes, not errors: printed apart) ── /h132 ──
  pg.on('console', (m) => { if (m.type() === 'error') errs.push(m.type() + ' ' + m.text().slice(0, 300)); else if (/\[h109\]/.test(m.text())) notes.push(m.type() + ' ' + m.text().slice(0, 300)); });
  if (process.env.PROBE_ALL) { pg.on('console', (m) => { if (/\[h1(09|11|12|13|20m?)\]/.test(m.text())) console.log('CONSOLE', m.type(), m.text().slice(0, 300)); }); pg.on('framenavigated', (f) => { if (f === pg.mainFrame()) console.log('NAV', f.url().slice(-60)); }); }
  pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 300)));
  pg.on('crash', () => console.log('PAGE CRASHED'));
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  const init = steps.find((s) => s.init); 
  await pg.addInitScript(([code, fast]) => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6; if (fast) window.__PROBE_FAST = 1; try { if (+sessionStorage.getItem('__keep') > Date.now()) { code = sessionStorage.getItem('__init2') || ''; try { const L = JSON.parse(sessionStorage.getItem('__ls') || '{}'); for (const k of Object.keys(L)) localStorage.setItem(k, L[k]); } catch (e) { /* */ } } else localStorage.clear(); } catch (e) { /* */ } if (code) { try { (0, eval)(code); } catch (e) { console.error('init', e.message); } } }, [init ? init.init : '', !!process.env.FAST]);
  await pg.goto(pathToFileURL(path.join(ROOT, 'dist', 'test.html')).href);
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 300000 });
  const cdp = await ctx.newCDPSession(pg);
  console.log('webgl:', await pg.evaluate(() => { try { const r = window.__T && window.__T.renderer; const gl = r && r.getContext ? r.getContext() : document.createElement('canvas').getContext('webgl2'); const x = gl.getExtension('WEBGL_debug_renderer_info'); return x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } catch (e) { return 'unknown (' + e.message + ')'; } }), GPU ? '(PROBE_GPU)' : '');
  const bootS = ((Date.now() - TB) / 1000).toFixed(1);
  // (MOUSE=1: the same script played with a mouse; the first finger is the mouse, a second finger is ignored)
  if (process.env.MOUSE) { const send0 = cdp.send.bind(cdp); let down = false, last = [0, 0];
    cdp.send = async (m, o) => { if (m !== 'Input.dispatchTouchEvent') return send0(m, o); const p = o.touchPoints && o.touchPoints[0];
      if (o.type === 'touchStart' && p && !down) { last = [p.x, p.y]; await pg.mouse.move(p.x, p.y); await pg.mouse.down(); down = true; }
      else if (o.type === 'touchMove' && p && down) { last = [p.x, p.y]; await pg.mouse.move(p.x, p.y); }
      else if (o.type === 'touchEnd' && down) { await pg.mouse.up(); down = false; } }; }
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x: Math.round(x), y: Math.round(y), id: 7 + i, radiusX: 6, radiusY: 6, force: 1 })) });
  const T0 = Date.now(); let n = 0, shotMs = 0;
  const log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(0)}s]`, ...a);
  let lastScript = null, reloads = 0;   // ── h132 ── (the bot's script, run again after a page reload) ── /h132 ──
  let RN = 0;   // (the reloads so far: each one's init script)
  // ── h132 ── the two held fingers (see { fingers } below) ── /h132 ──
  const FG = [null, null], FGM = { left: false, right: false };
  async function fingersSet(want) {
    const W2 = [0, 1].map((i) => (want && Array.isArray(want[i]) ? [Math.round(want[i][0]), Math.round(want[i][1])] : null));
    if (process.env.MOUSE) {
      const [a, b] = W2;
      if (!b && FGM.right) { await pg.mouse.up({ button: 'right' }); FGM.right = false; }   // (released where it was pressed: on the bowl)
      if (a) { if (!FGM.left) { await pg.mouse.move(a[0], a[1]); await pg.mouse.down({ button: 'left' }); FGM.left = true; } else if (!b) await pg.mouse.move(a[0], a[1]); }
      else if (FGM.left) { await pg.mouse.up({ button: 'left' }); FGM.left = false; }
      if (b && !FGM.right) { await pg.mouse.move(b[0], b[1]); await pg.mouse.down({ button: 'right' }); FGM.right = true; }
      else if (b) await pg.mouse.move(b[0], b[1]);
      FG[0] = a; FG[1] = b; return;
    }
    const pts = (L) => L.map((p, i) => (p ? { x: p[0], y: p[1], id: 20 + i, radiusX: 6, radiusY: 6, force: 1 } : null)).filter(Boolean);
    const had = FG.filter(Boolean).length, now = W2.filter(Boolean).length;
    const newOne = W2.some((p, i) => p && !FG[i]), gone = FG.some((p, i) => p && !W2[i]);
    // (a lift first — the points still down are named in a move, the lifted one left out: the browser releases it — then a press)
    if (gone) { const keep = W2.map((p, i) => (p && FG[i] ? FG[i] : null)), off = FG.map((p, i) => (p && !W2[i] ? p : null)); if (keep.some(Boolean)) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: pts(off) }); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    if (now) await cdp.send('Input.dispatchTouchEvent', { type: newOne ? 'touchStart' : 'touchMove', touchPoints: pts(W2) });
    void had;
    FG[0] = W2[0]; FG[1] = W2[1];
  }
  async function run(s) {
    if (s.init) return;
    if (s.wait) await pg.waitForTimeout(s.wait);
    // (build 129: {reload: code} — the page reloaded with its save kept (localStorage), the init code replaced by this one)
    // ── h131 ── (the snapshot of the save and the new init code are carried by the probe itself, not by sessionStorage: the game's page came
    // back with sessionStorage empty, so the first step's init ran again and a __H131_FULL page wiped the save. Each reload adds an init
    // script; they all run in order and the newest, the last, restores the whole snapshot and runs its code) ── /h131 ──
    if (s.reload != null) { const L = await pg.evaluate(() => { const L = {}; try { for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); L[k] = localStorage.getItem(k); } } catch (e) { /* */ } return L; }); RN++; await pg.addInitScript(([L, c, n]) => { try { localStorage.clear(); for (const k of Object.keys(L)) localStorage.setItem(k, L[k]); } catch (e) { /* */ } window.__RELOAD_N = n; if (c) { try { (0, eval)(c); } catch (e) { console.error('reload init', e.message); } } }, [L, String(s.reload), RN]); await pg.reload(); await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 300000 }); await pg.evaluate(() => { try { __T.simulate(true); } catch (e) { /* */ } }); log('reloaded'); }
    if (s.eval) { const v = await pg.evaluate(s.eval).catch((e) => 'EVALERR ' + e.message); if (v !== undefined) log('eval', typeof v === 'string' ? v.slice(0, 9000) : JSON.stringify(v).slice(0, 9000)); }
    if (s.log) { const v = await pg.evaluate(s.log).catch((e) => 'ERR ' + e.message); log(typeof v === 'string' ? v.slice(0, 1500) : JSON.stringify(v).slice(0, 1500)); }
    if (s.until) { const t = Date.now(); while (Date.now() - t < (s.max || 60000)) { const ok = await pg.evaluate(s.until).catch(() => false); if (ok) break; await pg.waitForTimeout(300); } log('until', s.until.slice(0, 80), ((Date.now() - t) / 1000).toFixed(1) + 's'); }
    if (s.tap) { await touch('touchStart', [s.tap]); await pg.waitForTimeout(70); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    if (s.hold) { const [x, y, ms] = s.hold; await touch('touchStart', [[x, y]]); await pg.waitForTimeout(ms); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    if (s.tapAt) { const v = await pg.evaluate(s.tapAt).catch((e) => null); if (v) { await touch('touchStart', [v]); await pg.waitForTimeout(50); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } log('tapAt', JSON.stringify(v)); }
    if (s.dragAt) { const v = await pg.evaluate(s.dragAt).catch((e) => null); if (v) { const [x0, y0, x1, y1, ms = 500] = v; const k = Math.max(4, Math.round(ms / 40)); await touch('touchStart', [[x0, y0]]); for (let i = 1; i <= k; i++) { await pg.waitForTimeout(ms / k); await touch('touchMove', [[x0 + ((x1 - x0) * i) / k, y0 + ((y1 - y0) * i) / k]]); } await pg.waitForTimeout(80); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } log('dragAt', JSON.stringify(v)); }
    if (s.tapWhen) { const [x, y, cond, max = 8000] = s.tapWhen; const t = Date.now(); let ok = false; while (Date.now() - t < max) { if (await pg.evaluate(cond).catch(() => false)) { ok = true; break; } await pg.waitForTimeout(8); } if (ok) { await touch('touchStart', [[x, y]]); await pg.waitForTimeout(40); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); } log('tapWhen', ok ? 'tap' : 'timeout', ((Date.now() - t) / 1000).toFixed(2) + 's'); }
    // (build 120: a finger held down while a still is taken: [x, y, ms before the still, name])
    if (s.holdShotAt) { const [js, ms, name] = s.holdShotAt; const v = await pg.evaluate(js).catch(() => null); if (v) await run({ holdShot: [v[0], v[1], ms, name] }); log('holdShotAt', JSON.stringify(v)); }
    if (s.holdShot) { const [x, y, ms, name] = s.holdShot; await touch('touchStart', [[x, y]]); await pg.waitForTimeout(ms); await run({ shot: name }); await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    if (s.holdUntil) { const [x, y, cond, max = 20000] = s.holdUntil; await touch('touchStart', [[x, y]]); const t = Date.now(); while (Date.now() - t < max) { if (await pg.evaluate(cond).catch(() => false)) break; await pg.waitForTimeout(25); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); log('holdUntil', ((Date.now() - t) / 1000).toFixed(2) + 's'); }
    // ── h130 ── (build 130, the light's ladder by mouse: the right button is the boy's right hand) { mouseDrag: [x0, y0, x1, y1, ms, 'left'|'right'] }, or
    // { mouseDragAt: "js → [x0, y0, x1, y1, ms, button]" }: a drag with that mouse button (a page with MOUSE=1)
    if (s.mouseDragAt) { const v = await pg.evaluate(s.mouseDragAt).catch(() => null); if (v) await run({ mouseDrag: v }); log('mouseDragAt', JSON.stringify(v)); }
    if (s.mouseDrag) { const [x0, y0, x1, y1, ms = 300, bt = 'left'] = s.mouseDrag; const k = Math.max(4, Math.round(ms / 40)); await pg.mouse.move(x0, y0); await pg.mouse.down({ button: bt }); for (let i = 1; i <= k; i++) { await pg.waitForTimeout(ms / k); await pg.mouse.move(x0 + ((x1 - x0) * i) / k, y0 + ((y1 - y0) * i) / k); } await pg.waitForTimeout(40); await pg.mouse.up({ button: bt }); }
    // ── /h130 ──
    if (s.drag) { const [x0, y0, x1, y1, ms = 400] = s.drag; const k = Math.max(4, Math.round(ms / 40)); await touch('touchStart', [[x0, y0]]); for (let i = 1; i <= k; i++) { await pg.waitForTimeout(ms / k); await touch('touchMove', [[x0 + ((x1 - x0) * i) / k, y0 + ((y1 - y0) * i) / k]]); } await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    if (s.shot) {
      const ts = Date.now();
      await pg.evaluate(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; });
      const f = path.join(OUT, `${String(++n).padStart(2, '0')}-${String(s.shot).replace(/[:*?"<>|\\/]/g, '_')}.png`);   // (a name like ringF:3 is no file name on Windows)
      await pg.screenshot({ path: f, timeout: 240000 }); log('shot', path.basename(f));   // ── h130 ── (build 130: the screenshot had slipped into the comment above at 17d3e2c — no still was taken) ── /h130 ──
      await pg.evaluate(() => { window.__HUD_HOLD = false; __T.simulate(true); }); shotMs += Date.now() - ts;
    }
    if (s.script) { lastScript = s.script; const code = fs.readFileSync(path.resolve(s.script), 'utf8'); const v = await pg.evaluate(code).catch((e) => 'SCRIPTERR ' + e.message); log('script', s.script, typeof v === 'string' ? v.slice(0, 200) : ''); }
    if (s.path) { const P = s.path, ms = s.ms || 600; await touch('touchStart', [P[0]]); const k = Math.max(P.length - 1, Math.round(ms / 40)); for (let i = 1; i <= k; i++) { await pg.waitForTimeout(ms / k); const f = (i / k) * (P.length - 1), j = Math.min(P.length - 2, Math.floor(f)), u = f - j; await touch('touchMove', [[P[j][0] + (P[j + 1][0] - P[j][0]) * u, P[j][1] + (P[j + 1][1] - P[j][1]) * u]]); } if (s.pathUntil) { const t1 = Date.now(); while (Date.now() - t1 < (s.pathMax || 20000) && !(await pg.evaluate(s.pathUntil).catch(() => true))) { for (let i = 1; i <= k; i++) { if (s.pathEach && i % s.pathEach === 0 && await pg.evaluate(s.pathUntil).catch(() => true)) break; /* ── h128 ── (pathEach: the condition looked at every n moves, not once a lap) ── /h128 ── */ await pg.waitForTimeout(ms / k); const f = (i / k) * (P.length - 1), j = Math.min(P.length - 2, Math.floor(f)), u = f - j; await touch('touchMove', [[P[j][0] + (P[j + 1][0] - P[j][0]) * u, P[j][1] + (P[j + 1][1] - P[j][1]) * u]]); } } }   /* (build 120: the path again until the expression holds) */ if (s.keep) { const t = Date.now(); while (Date.now() - t < s.keep) { if (s.release && await pg.evaluate(s.release).catch(() => false)) break; await pg.waitForTimeout(20); } } if (s.after) { const A = [P[P.length - 1], ...s.after], m2 = s.afterMs || 400, k2 = Math.max(4, Math.round(m2 / 40)); for (let i = 1; i <= k2; i++) { await pg.waitForTimeout(m2 / k2); const f = (i / k2) * (A.length - 1), j = Math.min(A.length - 2, Math.floor(f)), u = f - j; await touch('touchMove', [[A[j][0] + (A[j + 1][0] - A[j][0]) * u, A[j][1] + (A[j + 1][1] - A[j][1]) * u]]); } } await pg.waitForTimeout(60);   /* (build 120: after the keep, the finger eases back along `after` before it lifts) */ await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
    // (build 113: several fingers) frames of touch points; a frame with more points presses the new ones, fewer releases the last ones
    if (s.seq) {
      let n0 = 0, last = []; const ms = s.ms || 50, t0 = Date.now();
      // (build 120: a point may be a page expression → [x, y] read at that frame (null: the finger is left out); seqUntil: when the frames
      //  run out, go back to frame seqLoop until the expression is true or seqMax ms passed)
      for (let fi = 0; fi < s.seq.length; fi++) {
        const fr = s.seq[fi];
        let pts = []; for (const q of fr || []) { if (typeof q === 'string') { const v = await pg.evaluate(q).catch(() => null); if (v) pts.push(v); } else pts.push(q); }
        if (fi === s.seq.length - 1 && s.seqUntil && Date.now() - t0 < (s.seqMax || 20000) && !(await pg.evaluate(s.seqUntil).catch(() => true))) fi = (s.seqLoop || 1) - 1;
        if (!pts.length) { if (n0) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
        else if (pts.length < n0) {
          // (lift the last fingers only: a touchEnd naming the ones lifted, the rest stay down)
          const gone = []; for (let i = pts.length; i < n0; i++) gone.push(last[i]);
          await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: gone.map(([x, y], j) => ({ x: Math.round(x), y: Math.round(y), id: 7 + pts.length + j })) }).catch(async () => { await touch('touchMove', pts); });
        } else await touch(pts.length > n0 ? 'touchStart' : 'touchMove', pts);
        if (pts.length) last = pts;
        n0 = pts.length; await pg.waitForTimeout(ms);
        if (s.seqShot && fi === s.seqShot[0] && !s.seqShotDone) { s.seqShotDone = 1; await run({ shot: s.seqShot[1] }); }   /* ── h128 ── (tuning: a still at a frame of the sequence, the fingers still down) ── /h128 ── */
      }
      if (n0) await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    }
    // ── h132 ── (build 132, stage 09 work 4: two thumbs at once, held ACROSS steps) { fingers: [p0 | null, p1 | null] } sets the state of
    // two fingers (ids 20 and 21, apart from the other steps' 7…): a point presses or moves that finger, null lifts it; the others stay
    // as they are. The left finger can stay down for a whole line while the right one taps. By mouse (MOUSE=1) finger 0 is the left
    // button (moved and held) and finger 1 the right button: pressed at its point and released there, the cursor then back to finger 0
    // (a short right click on the bowl or a drip while the left is held). { fingersOff: true } lifts both; { tap1: true } with a second
    // finger lets it go again in the same step. ── /h132 ──
    if (s.fingers || s.fingersOff) await fingersSet(s.fingersOff ? [null, null] : s.fingers);
    // (tap1: the second finger let go in the same step — a short tap whatever the page's speed: a slow page's next step came after 0.25 s)
    if (s.fingers && s.tap1 && s.fingers[1]) { await pg.waitForTimeout(40); await fingersSet([s.fingers[0], null]); }
    if (s.when) { const t = Date.now(); while (Date.now() - t < (s.max || 4000)) { if (await pg.evaluate(s.when).catch(() => false)) break; await pg.waitForTimeout(8); } if (s.then) await run(s.then); }
    if (s.bot) {
      const t = Date.now(); let k = 0, last = '';
      while (Date.now() - t < (s.max || 600000)) {
        let a = await pg.evaluate(s.bot).catch((e) => ({ wait: 500, note: 'BOTERR ' + e.message }));
        // ── h132 ── (the page reloaded under the bot — a work page reloads when its levels are all done: the context goes, and with it
        // the injected bot. Wait for the game to boot again and run the bot's script again, once per reload, instead of failing on.) ── /h132 ──
        if (a && a.note && /^BOTERR .*(Execution context was destroyed|__BOT is not defined|reading 'h109'|__T is not defined)/.test(a.note)) {
          log('bot', 'the page reloaded: waiting for it, the bot script again' + (lastScript ? ' (' + lastScript + ')' : ''));
          await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game && window.__T.game.h109, null, { polling: 200, timeout: 300000 }).catch(() => null);
          await pg.evaluate(() => { try { __T.simulate(true); } catch (e) { /* */ } }).catch(() => null);
          if (lastScript) { const code = fs.readFileSync(path.resolve(lastScript), 'utf8'); await pg.evaluate(code).catch((e) => log('script', 'SCRIPTERR ' + e.message)); }
          reloads++; if (reloads > 4) { log('bot', 'the page reloaded more than 4 times: stop'); break; }
          continue;
        }
        if (!a) { await pg.waitForTimeout(300); continue; }
        if (a.note && a.note !== last) { log('bot', a.note); last = a.note; }
        if (a.fail) errs.push('FAILED: ' + String(a.fail).slice(0, 300));   // ── h132 ── (a script's own failure: counted with the errors, the exit not 0) ── /h132 ──
        if (a.done) { log('bot done', ((Date.now() - t) / 1000).toFixed(0) + 's', k, 'actions'); break; }
        k++; try { await run(a); } catch (e) { log("bot step failed", e.message); await pg.waitForTimeout(500); }
      }
    }
  }
  for (const s of steps) await run(s);
  if (FG[0] || FG[1] || FGM.left || FGM.right) await fingersSet([null, null]);   // ── h132 ── (no finger left held at the end) ── /h132 ──
  console.log(`probe time${process.env.FAST ? ' (FAST)' : ''}: boot ${bootS}s, ${n} shots ${(shotMs / 1000).toFixed(1)}s, steps ${((Date.now() - T0) / 1000).toFixed(1)}s`);
  const fr = await pg.evaluate(() => { try { const P = globalThis.__S30PROF; const r = P && P.report ? P.report() : null; return r && r.n ? `${r.n} frames, p50 ${r.p50} ms, p95 ${r.p95} ms` + (r.renders ? `, renders p50 ${r.renders.p50} ms` : '') : null; } catch (e) { return null; } }).catch(() => null);
  console.log(`wall ${((Date.now() - TW) / 1000).toFixed(1)}s` + (fr ? ` · page frames: ${fr}` : ' · page frames: not exposed'));
  if (notes.length) console.log('page notes:\n' + notes.slice(0, 30).join('\n'));   // ── h132 ── ── /h132 ──
  console.log(errs.length ? 'ERRORS (' + errs.length + '):\n' + errs.slice(0, 30).join('\n') : 'no errors');   // ── h132 ── (the count: the PC summary's errors line) ── /h132 ──
  await b.close();
  if (errs.some((e) => /^FAILED: /.test(e))) process.exitCode = 2;   // ── h132 ── ── /h132 ──
})().catch((e) => { console.error('probe failed', e); process.exit(1); });
