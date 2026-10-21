// SITE15 (wave 15) — המנופאי, the crane operator in the world (the owner, 2.10 14:28: "הכהן לומד מקצוע"), by REAL TOUCH at 390×844
// on dist/test.html: the wall's courses (game-courses-touch's fixture), the treadwheel job opened as the course loop opens it
// (runMinigame 'tread' with the world and the site), its hold buttons held by a finger on the cue. Checks: he walks INTO the
// lifting crane's wheel (within 2 amot of its inside point), K80 at the held frame (≥ 80 px, on screen), the real block's height
// follows the lift, a stone is seated on the release (the operator's prop until the count's ripple), the game resolves with a
// quality and he walks back; draw calls ≤ 150; no console errors. Three shots (test/out/tread-world): the walk in, the lift, the seat.
//   node test/tread-world.cjs [--no-build] [--site=wall] [--file=dist/test.html]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/tread-world');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const arg = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SITE = arg('site', 'wall'), W = 390, H = 844;
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    });
    await pg.goto('file://' + path.resolve(arg('file', '') || path.join(ROOT, 'dist/test.html')));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const tap = (x, y) => pg.touchscreen.tap(Math.max(4, Math.min(W - 4, x)), Math.max(4, Math.min(H - 4, y)));
    const cdp = await ctx.newCDPSession(pg);
    const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i + 1, radiusX: 6, radiusY: 6, force: 1 })) });
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => { await G(() => { __T.render(); window.__HUD_HOLD = true; }); const f = path.join(OUT, `${name}.png`); await pg.screenshot({ path: f, timeout: 240000 }); console.log('   shot', path.relative(ROOT, f)); await G(() => { window.__HUD_HOLD = false; }); };
    /* the opening: a tap skips it */
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(600);
    /* the fixture: the Mount done, the wall in its courses at stone 4 (as game-courses-touch's wall part), the loop's nets held */
    const fx = await G(([site]) => {
      const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
      for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
      g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
      g.focus = site; g.res.stone = 400; g.crews = [];
      __T.game._.resync();
      __T.game.hold(true);   // (as jobGame holds the loop while a job's game runs: momentBusy + overlay — no net walks or places him)
      const S = __T.stages, c = S.crane(); const i = S.siteInfo(site), hp = S.hero.position;
      return { crane: c ? { site: c.site, bx: Math.round(c.bx), bz: Math.round(c.bz), posed: c.posed } : null, set: i && i.set, hero: [hp.x, hp.y, hp.z].map(Math.round) };
    }, [SITE]);
    console.log(`fixture: ${JSON.stringify(fx)}`);
    // (the crane poses at the working front within a few seconds of the world's clock)
    await G(() => __T.step(4, 0.05));
    await pg.waitForTimeout(300);
    const look = () => G(() => {
      const S = __T.stages, cam = __T.camera; cam.updateMatrixWorld();
      const hp = S.hero.position, Wd = innerWidth, Hd = innerHeight;
      const h = __T.view.project(hp.x, hp.y + 1.8, hp.z), on = !!h.on && h.x > 24 && h.x < Wd - 24 && h.y > 110;
      const fy = __T.view.project(hp.x, hp.y, hp.z).y, px = Math.round(Math.abs(fy - __T.view.project(hp.x, hp.y + 3.6, hp.z).y));
      const sheet = document.querySelector('.fx-mg-sheet'), sr = sheet ? sheet.getBoundingClientRect() : null;
      const T = S.tread(), c = S.crane(), hh = S._dbg.hero, vis = !!(hh.mesh && hh.mesh.visible) && !(hh.fade < 0.5) && !(hh.edgeF < 0.5);
      return { on, px, vis, x: Math.round(h.x), y: Math.round(h.y), sheetTop: sr ? Math.round(sr.top) : null, hero: [hp.x, hp.y, hp.z].map((v) => Math.round(v * 10) / 10), T, crane: c ? [Math.round(c.bx), Math.round(c.bz)] : null, dist: Math.round(cam.position.distanceTo(hp)) };
    });
    /* the job's game, as the course loop opens it (runMinigame with the world and the site): the world takes the operator */
    await G(([site]) => {
      window.__R = null;
      const run = globalThis.__BH_PARTS.minigames.runMinigame;
      run('tread', { root: __T.game.ui.root || document.body, world: __T.stages, site, level: 0, seed: 77, n: 0, kicker: 'בדיקה', howto: false }).then((r) => { window.__R = r; });
    }, [SITE]);
    await pg.waitForSelector('.fx-mg', { timeout: 10000 });
    const begun = await G(() => window.__GAME_LOG.find((e) => e.type === 'taskScene' && e.d && e.d.kind === 'tread' && e.d.at === 'begin'));
    check('treadBegin took him: the world links the game', !!begun, begun ? `spot ${begun.d.spot} from ${begun.d.from} · ${begun.d.slots} slots` : 'no begin (the sheet game played)');
    // the walk in: within 2 amot of the wheel's inside point (≤ 7 s of the world's clock), then the held frame
    let l = null, wt = 0;
    while (wt < 7) { l = await look(); if (l.T && l.T.on && l.T.at && Math.hypot(l.hero[0] - l.T.at[0], l.hero[2] - l.T.at[2]) < 2) break; await pg.waitForTimeout(350); wt += 0.35; }
    await pg.waitForTimeout(900); await G(() => __T.render()); l = await look();
    const dIn = l.T && l.T.at ? Math.hypot(l.hero[0] - l.T.at[0], l.hero[2] - l.T.at[2]) : 99;
    check('he stands inside the wheel (within 2 amot of its inside point, on the tread)', !!(l.T && l.T.on && l.T.inWheel) && dIn < 2, `d ${dIn.toFixed(1)} · hero ${l.hero} · at ${l.T && l.T.at ? l.T.at.map((v) => Math.round(v)) : '—'} · crane ${l.crane}`);
    check('K80 at the held frame: ≥ 80 px, on screen above the sheet, not faded', l.px >= 80 && l.on && l.vis && (l.sheetTop === null || l.y < l.sheetTop), `${l.px} px · at ${l.x},${l.y}${l.vis ? '' : ' FADED'} · sheet top ${l.sheetTop} · cam ${l.dist}`);
    const calls = await G(() => __T.drawCalls());
    check('draw calls ≤ 150 at the held frame', calls.total <= 150, `${calls.total}`);
    await shot('1-in-the-wheel');
    /* played by the hand's cue: hold the foot the cue names for its ms (a finger on the button) */
    const t0 = Date.now();
    let hy0 = null, hyUp = false, seated = false, shotLift = false, shotSeat = false, holds = 0;
    while (Date.now() - t0 < 80000) {
      const s = await G(() => { const w = document.querySelector('.fx-mg'); return w && w.__mg ? { ...w.__mg.state(), cue: w.__mg.cue(), T: __T.stages.tread() } : null; });
      if (!s || s.done) break;
      if (s.how) { const e = await pg.$('.fx-mg-how'); const bb = e && await e.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height * 0.85); await pg.waitForTimeout(250); continue; }
      if (s.T) { if (hy0 === null && s.T.hy !== null) hy0 = s.T.hy; else if (hy0 !== null && s.T.hy !== null && s.T.hy > hy0 + 0.8) hyUp = true; if (s.T.set >= 1) seated = true; }
      if (!shotLift && s.T && s.T.h > 0.3) { shotLift = true; await shot('2-the-lift'); }
      if (!shotSeat && seated) { shotSeat = true; await shot('3-seated'); }
      const c = s.cue; if (!c || !c.btn) { await pg.waitForTimeout(120); continue; }
      const btn = await pg.$(`.fx-mg [data-b="${c.btn}"]`); const bb = btn && await btn.boundingBox();
      if (bb) { const p = [bb.x + bb.width / 2, bb.y + bb.height / 2]; await touch('touchStart', [p]); await pg.waitForTimeout(Math.max(60, Math.min(900, c.ms || 350))); await touch('touchEnd', []); holds++; }
      await pg.waitForTimeout(140);
    }
    await pg.waitForFunction(() => { const w = document.querySelector('.fx-mg'); return !w || w.classList.contains('done'); }, null, { timeout: 15000 }).catch(() => {});
    const Tend = await G(() => __T.stages.tread());
    check('the real block rose with the lift and a stone was seated on a release', hyUp && seated, `holds ${holds} · hy ${hy0 !== null ? hy0.toFixed(1) : '—'} → up ${hyUp} · seated ${Tend.set} · ${Math.round((Date.now() - t0) / 1000)} s`);
    const res = await G(() => { const w = document.querySelector('.fx-mg'); if (!w) return null; const t = (q) => (w.querySelector(q) || {}).textContent || ''; return { stars: t('.fx-mg-stars'), tier: t('.fx-mg-tier'), fact: t('.fx-mg-fact') }; });
    check('the result card as today (★, a sourced fact)', !!res && /★/.test(res.stars) && /טיוטה|המחשה/.test(res.fact), res ? `${res.stars} ${res.tier}` : 'no card');
    const go = await pg.$('.fx-mg .fx-go'); const gb = go && await go.boundingBox(); if (gb) await tap(gb.x + gb.width / 2, gb.y + gb.height / 2);
    await waitFor(() => !!window.__R, null, 8000);
    await G(() => { __T.step(1.5, 0.05); __T.game.hold(false); });
    const after = await look();
    const r = await G(() => window.__R);
    check('the game resolves with a quality; treadEnd: he leaves the wheel for his banker', !!r && typeof r.quality === 'number' && after.T && !after.T.on && (Math.hypot(after.hero[0] - (l.T.at ? l.T.at[0] : 0), after.hero[2] - (l.T.at ? l.T.at[2] : 0)) > 1.5), `q ${r && r.quality} · hero ${after.hero} · on ${after.T && after.T.on}`);
    check('no console errors', !logs.filter((x) => !/fonts|favicon/.test(x)).length, logs.slice(0, 3).join(' | ').slice(0, 300));
  } catch (e) { check('run', false, String(e && e.stack || e).slice(0, 400)); }
  finally { await b.close(); }
  const bad = results.filter((r) => !r.ok);
  console.log(`\n${results.length - bad.length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(bad.length ? 1 : 0);
})();
