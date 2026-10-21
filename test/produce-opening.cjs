// PRODUCER10: the first minute of a fresh profile, frame by frame — the opening, the survey (a shot at every tap), the first rocks.
//   node test/produce-opening.cjs [--url=file:///…/dist/test.html] [--tag=open] [--rocks=2]
// Real touch at 390×844 on what the screen shows; the state is read, never written. Answers: where does the opening end (close on
// the kohen, or far)? does the coach's line match the frame? is the survey's target on screen and seen?
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
const TAG = A.tag || 'open', URL0 = A.url || 'file://' + path.join(ROOT, 'dist/test.html'), ROCKS = +(A.rocks || 2);
const OUT = path.join(ROOT, 'test/out/produce'); fs.mkdirSync(OUT, { recursive: true });
const W = 390, H = 844, T0 = Date.now(), sec = () => ((Date.now() - T0) / 1000).toFixed(1);
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = await ctx.newPage(); const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; });
    await pg.goto(URL0);
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const E = (fn, a) => pg.evaluate(fn, a); let n = 0;
    const look = () => E(() => {
      __T.camera.updateMatrixWorld(); const h = __T.stages.hero, cam = __T.camera; const P = h.position.clone(), hd = P.clone(); hd.y += 1.7;
      const pr = (v) => { const q = v.clone().project(cam); return [Math.round((q.x + 1) / 2 * innerWidth), Math.round((1 - q.y) / 2 * innerHeight), q.z < 1]; };
      const a = pr(P), c = pr(hd); const t = (s) => { const x = document.querySelector(s); return x && x.offsetParent ? x.innerText.replace(/\s+/g, ' ').trim().slice(0, 90) : ''; };
      const m = document.querySelector('.gm-mark'), mt = m && !m.classList.contains('gm-hidden') && m.style.opacity !== '0' && m.style.transform.match(/translate\(([-\d.]+)px,\s*([-\d.]+)px/);
      const L = window.__GAME_LOG.filter((e) => e.type === 'opening').map((e) => e.d && e.d.at).join(',');
      return { ftue: __T.game.state.ftue, p: __T.game.state.st.har.p, hero: c, heroPx: Math.abs(a[1] - c[1]), dist: Math.round(cam.position.distanceTo(hd)), mark: mt ? [Math.round(+mt[1]), Math.round(+mt[2])] : null, pill: t('.gm-pill'), bub: t('.gm-bub'), cine: !!document.querySelector('.gm-cine'), opening: L };
    });
    const shot = async (name) => {
      await E(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const i = await look(); const f = path.join(OUT, `${TAG}-${String(++n).padStart(2, '0')}-${name}.png`);
      await pg.screenshot({ path: f }); await E(() => { window.__HUD_HOLD = false; });
      console.log(`${sec()}s SHOT ${path.relative(ROOT, f)} ${JSON.stringify(i)}`); return i;
    };
    await shot('boot');
    for (const at of [3, 7, 11, 15, 19]) { await pg.waitForTimeout(Math.max(0, at * 1000 - (Date.now() - T0))); const i = await shot(`t${at}`); if (i.ftue >= 1 && !i.cine && at > 7) break; }
    await pg.waitForFunction(() => __T.game.state.ftue >= 1 && !document.querySelector('.gm-cine'), null, { polling: 150, timeout: 25000 }).catch(() => {});
    await pg.waitForTimeout(1500);
    let i = await shot('survey-0');
    for (let k = 1; k <= 6 && i.p === 'survey'; k++) {
      if (!i.mark) { console.log('no pointer at the survey'); break; }
      await E(() => { __T.camera.updateMatrixWorld(); __T.game.frame(performance.now()); });
      await pg.touchscreen.tap(i.mark[0], i.mark[1]); await pg.waitForTimeout(1500);
      i = await shot(`survey-${k}`);
    }
    for (let r = 0; r < ROCKS * 3 && i.p !== 'courses'; r++) {
      await pg.waitForTimeout(1200); i = await look();
      if (i.mark) { await E(() => { __T.camera.updateMatrixWorld(); __T.game.frame(performance.now()); }); await pg.touchscreen.tap(i.mark[0], i.mark[1]); }
      await pg.waitForTimeout(400); if (r % 2 === 1) i = await shot(`rock-${r}`);
    }
    console.log('errors', errs.length, errs.slice(0, 2).join(' | '));
  } finally { await b.close(); }
})();
