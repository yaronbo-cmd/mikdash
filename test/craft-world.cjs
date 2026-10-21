// SITE16 (wave 16) — the crafts IN THE WORLD (the owner, 4.10: "שזה יהיה בתוך העולם ולא כמשחקון חיצוני"): the sawyer and the surveyor
// through stages.craft on dist/test.html at 390×844 (the wall's courses, game-courses-touch's fixture, the loop held). The models
// are driven directly with scripted states (saw.js's { blade, c, plank, planks, phase } and snap.js's { lift, phase, q }); when
// FLOW16's hands.js lands, the same checks run through it. Checks: saw.begin takes him to the bench (within 2 amot of the sawyer's
// place), K80 at the frame (≥ 80 px, on screen, not faded), box() on screen, the kerf follows the model's c, the log parts at the
// end, he walks back; line.begin takes him to the course's end, the cord's middle rises with the lift, the snap leaves the chalk
// line (jobs.lines), he walks back; draw calls ≤ 150; no console errors. Shots (test/out/craft-world): at the saw, the lift, the snap.
//   node test/craft-world.cjs [--no-build] [--site=wall] [--file=dist/test.html]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/craft-world');
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
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => { await G(() => { __T.render(); window.__HUD_HOLD = true; }); const f = path.join(OUT, `${name}.png`); await pg.screenshot({ path: f, timeout: 240000 }); console.log('   shot', path.relative(ROOT, f)); await G(() => { window.__HUD_HOLD = false; }); };
    /* the opening: a tap skips it */
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(600);
    /* the fixture: the Mount done, the wall in its courses at stone 4, the loop held (as tread-world) */
    const fx = await G(([site]) => {
      const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
      for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
      g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
      g.focus = site; g.res.stone = 400; g.crews = [];
      __T.game._.resync();
      __T.game.hold(true);
      const S = __T.stages, c = S.crane(); const hp = S.hero.position;
      return { crane: c ? { site: c.site, posed: c.posed } : null, hero: [hp.x, hp.y, hp.z].map(Math.round), craft: Object.keys(S.craft || {}) };
    }, [SITE]);
    console.log(`fixture: ${JSON.stringify(fx)}`);
    check('stages.craft = { tread, saw, line }', fx.craft.includes('tread') && fx.craft.includes('saw') && fx.craft.includes('line'), fx.craft.join(','));
    await G(() => __T.step(4, 0.05));
    await pg.waitForTimeout(300);
    const look = () => G(() => {
      const S = __T.stages, cam = __T.camera; cam.updateMatrixWorld();
      const hp = S.hero.position, Wd = innerWidth;
      const h = __T.view.project(hp.x, hp.y + 1.8, hp.z), on = !!h.on && h.x > 24 && h.x < Wd - 24 && h.y > 110;
      const fy = __T.view.project(hp.x, hp.y, hp.z).y, px = Math.round(Math.abs(fy - __T.view.project(hp.x, hp.y + 3.6, hp.z).y));
      const hh = S._dbg.hero, vis = !!(hh.mesh && hh.mesh.visible) && !(hh.fade < 0.5) && !(hh.edgeF < 0.5);
      const C = S.craftState(), g = S.groundAt(hp.x, hp.z);
      return { on, px, vis, x: Math.round(h.x), y: Math.round(h.y), hero: [hp.x, hp.y, hp.z].map((v) => Math.round(v * 10) / 10), dy: Math.round((hp.y - g) * 100) / 100, C, sheet: !!document.querySelector('.fx-mg'), dist: Math.round(cam.position.distanceTo(hp)) };
    });
    const walkIn = async (kind) => {
      let l = null, wt = 0;
      while (wt < 8) { l = await look(); if (l.C && l.C.kind === kind && l.C.near) break; await pg.waitForTimeout(350); wt += 0.35; }
      await pg.waitForTimeout(900); await G(() => __T.render()); return look();
    };
    /* ── the sawyer ── */
    const sb = await G(([site]) => __T.stages.craft.saw.begin(site), [SITE]);
    check('saw.begin: ok, the work\'s point and his stand at the bench', !!(sb && sb.ok && sb.at && sb.stand), JSON.stringify(sb));
    let l = await walkIn('saw');
    const dIn = l.C && l.C.at ? Math.hypot(l.hero[0] - l.C.at[0], l.hero[2] - l.C.at[2]) : 99;
    check('he stands at the sawyer\'s place (within 2 amot), on the ground', !!(l.C && l.C.near) && dIn < 2 && Math.abs(l.dy) < 0.6, `d ${dIn.toFixed(1)} · hero ${l.hero} · dy ${l.dy} · bench ${l.C && l.C.bench}`);
    check('K80 at the saw: ≥ 80 px, on screen, not faded, no sheet', l.px >= 80 && l.on && l.vis && !l.sheet, `${l.px} px · at ${l.x},${l.y}${l.vis ? '' : ' FADED'} · cam ${l.dist} · sheet ${l.sheet}`);
    const bx1 = await G(() => ({ ...__T.stages.craft.saw.box(), W: innerWidth, H: innerHeight }));
    check('saw.box(): the log\'s cut on screen', !!bx1 && bx1.w >= 44 && bx1.h >= 44 && bx1.x + bx1.w > 0 && bx1.x < bx1.W && bx1.y > 0 && bx1.y + bx1.h < bx1.H, JSON.stringify(bx1));
    let calls = await G(() => __T.drawCalls());
    check('draw calls ≤ 150 at the saw', calls.total <= 150, `${calls.total}`);
    await shot('1-at-the-saw');
    // the scripted model: 6 strokes, the blade to him and back, the kerf running down; then the plank comes off
    const cuts = [];
    for (let k = 0; k < 6; k++) {
      for (let j = 0; j <= 4; j++) { await G(([u, k]) => { __T.stages.craft.saw.update({ blade: u, pp: 0, c: Math.min(1, (k + u) / 6), plank: 0, planks: 2, phase: 'saw' }); __T.step(0.12, 0.04); }, [j / 4, k]); }
      const st = await G(() => __T.stages.craftState()); cuts.push(st.cut);
    }
    const partA = await G(() => { __T.stages.craft.saw.update({ blade: 0, pp: 0, c: 1, plank: 1, planks: 2, phase: 'plank' }); __T.step(0.8, 0.04); return __T.stages.craftState(); });
    check('the kerf follows the model\'s c; the log parts when the plank comes off', cuts[0] < cuts[5] && cuts[5] > 0.9 && partA.parted, `cut ${cuts.map((c) => c.toFixed(2)).join(' ')} · parted ${partA.parted}`);
    await shot('2-the-log-parts');
    const se = await G(() => __T.stages.craft.saw.end({ quality: 0.8 }));
    await G(() => __T.step(3.5, 0.05));
    const after = await look();
    check('saw.end: he leaves the bench for his banker; the craft is off', se && (!after.C.kind || after.C.done) && Math.hypot(after.hero[0] - sb.stand.x, after.hero[2] - sb.stand.z) > 1.5, `hero ${after.hero} · kind ${after.C.kind} · done ${after.C.done}`);
    await G(() => __T.step(1.0, 0.05));
    /* ── the surveyor ── */
    const lb = await G(([site]) => __T.stages.craft.line.begin(site), [SITE]);
    check('line.begin: ok, the lift point and his stand at the course\'s end', !!(lb && lb.ok && lb.at && lb.stand), JSON.stringify(lb));
    l = await walkIn('line');
    const dIn2 = l.C && l.C.at ? Math.hypot(l.hero[0] - l.C.at[0], l.hero[2] - l.C.at[2]) : 99;
    check('he stands at the course\'s end (within 2 amot), on the ground', !!(l.C && l.C.near) && dIn2 < 2 && Math.abs(l.dy) < 0.6, `d ${dIn2.toFixed(1)} · hero ${l.hero} · dy ${l.dy}`);
    check('K80 at the cord: ≥ 80 px, on screen, not faded, no sheet', l.px >= 80 && l.on && l.vis && !l.sheet, `${l.px} px · at ${l.x},${l.y} · cam ${l.dist}`);
    const bx2 = await G(() => ({ ...__T.stages.craft.line.box(), W: innerWidth, H: innerHeight }));
    check('line.box(): the cord on screen', !!bx2 && bx2.w >= 44 && bx2.h >= 44 && bx2.x + bx2.w > 0 && bx2.x < bx2.W && bx2.y + bx2.h > 0 && bx2.y < bx2.H, JSON.stringify(bx2));
    const y0 = await G(() => { __T.stages.craft.line.update({ lift: 0, phase: 'ready', q: [] }); __T.step(0.6, 0.04); return __T.stages.craftState().midY; });
    const y1 = await G(() => { __T.stages.craft.line.update({ lift: 0.7, phase: 'lift', q: [] }); __T.step(0.6, 0.04); return __T.stages.craftState().midY; });
    check('the cord\'s middle rises with the model\'s lift (0.7 → ≈ 0.84 amot)', y1 - y0 > 0.6 && y1 - y0 < 1.0, `mid ${y0.toFixed(2)} → ${y1.toFixed(2)}`);
    await shot('3-the-lift');
    const snap = await G(([site]) => { const n0 = __T.stages.jobs.lines.filter((q) => q.site === site).length; __T.stages.craft.line.update({ lift: 0.7, phase: 'snap', q: [0.95] }); __T.step(0.5, 0.04); const C = __T.stages.craftState(); return { n0, n1: __T.stages.jobs.lines.filter((q) => q.site === site).length, lines: C.lines, midY: C.midY }; }, [SITE]);
    check('the snap drops the cord and leaves the chalk line on the course', snap.lines === 1 && snap.n1 >= 1 && snap.midY < y1 - 0.5, JSON.stringify(snap));
    await shot('4-the-snap');
    calls = await G(() => __T.drawCalls());
    check('draw calls ≤ 150 at the cord', calls.total <= 150, `${calls.total}`);
    const le = await G(() => __T.stages.craft.line.end({ quality: 0.9 }));
    await G(() => __T.step(3.5, 0.05));
    const after2 = await look();
    check('line.end: he walks back; the craft is off', le && (!after2.C.kind || after2.C.done) && Math.hypot(after2.hero[0] - lb.stand.x, after2.hero[2] - lb.stand.z) > 1.5, `hero ${after2.hero} · kind ${after2.C.kind}`);
    /* the guard: a site with no course front → ok:false */
    const g2 = await G(() => __T.stages.craft.line.begin('kodesh'));
    check('guarded: line.begin on a site that is not building → { ok: false }', !!g2 && g2.ok === false, JSON.stringify(g2));
    check('no console errors', !logs.filter((x) => !/fonts|favicon/.test(x)).length, logs.slice(0, 3).join(' | ').slice(0, 300));
  } catch (e) { check('run', false, String(e && e.stack || e).slice(0, 400)); }
  finally { await b.close(); }
  const bad = results.filter((r) => !r.ok);
  console.log(`\n${results.length - bad.length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(bad.length ? 1 : 0);
})();
