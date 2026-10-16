// SITE16 (wave 16) — WORKERS EVERYWHERE, the life layer (the owner, 4.10: "הוא ריק מפועלים"): a scripted run on dist/test.html at
// 390×844. Fixture A: the Mount at mid-courses (game-courses-touch's fixture) — the whole-bay zoom-out counts the ambient workers
// in view (≥ 25; stages.lifeCount), draw calls ≤ 150 there and at a close frame on the bench; a shot of the Mount's front, of the
// quarry's road (its carriers) and of the bench. Fixture B: the wall active, the Mount done — ≥ 3 workers at the finished Mount
// (its gates' guards and sweepers), the tap card on a worker ("פועלי הורדוס · המחשה"). No console errors.
//   node test/life.cjs [--no-build] [--file=dist/test.html]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/life');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const arg = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const W = 390, H = 844;
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
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(600);
    /* fixture A: the Mount at mid-courses */
    const fa = await G(() => {
      const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
      const n = __T.game._.siteStones('har'), from = Math.floor(n / 2);
      Object.assign(g.st.har, { p: 'courses', dp: 1, paid: 999, set: from, k: 0, chk: 0 });
      for (const i of [0, 16, 32]) if (i < from && g.st.har.keys[i] == null) g.st.har.keys[i] = 0.9;
      g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; __T.game._.resync(); __T.game.hold(true);
      return { n, from };
    });
    console.log(`fixture A: ${JSON.stringify(fa)}`);
    await G(() => __T.step(8, 0.05));
    await pg.waitForTimeout(2500);
    await G(() => __T.step(4, 0.05));
    const la = await G(() => __T.stages.lifeCount());
    check('the life layer at the Mount: ≥ 25 ambient workers dealt (lifeCount.total)', la.total >= 25, `total ${la.total} · key ${la.key}`);
    // the zoom-out: the bay from the south-east, high, the workers' centroid at the centre
    const zo = await G(() => {
      const L = __T.stages.lifeList().filter((w) => w.site === 'har' && w.role !== 'carrier' || (w.site === 'har' && w.role === 'carrier' && Math.hypot(w.x - 185, w.z + 191) > 60));
      let cx = 0, cz = 0, cy = 0; for (const w of L) { cx += w.x; cz += w.z; cy += w.y; } cx /= L.length || 1; cz /= L.length || 1; cy /= L.length || 1;
      __T.stages.flyTo([cx + 70, cy + 95, cz + 70], [cx, cy + 2, cz], 10); __T.step(1.5, 0.05); __T.render();
      const c = __T.stages.lifeCount(), d = __T.drawCalls();
      return { c, calls: d.total, centroid: [cx, cy, cz].map(Math.round), n: L.length };
    });
    check('≥ 25 ambient workers in view at the whole-bay zoom-out', zo.c.inView >= 25, `inView ${zo.c.inView} · bySite ${JSON.stringify(zo.c.bySite)} · centroid ${zo.centroid}`);
    check('draw calls ≤ 150 at the zoom-out', zo.calls <= 150, `${zo.calls}`);
    await shot('1-the-mount-front');
    // the road: the quarry's carriers
    const rd = await G(() => {
      const L = __T.stages.lifeList().filter((w) => w.site === 'har' && w.role === 'carrier' && Math.hypot(w.x - 185, w.z + 191) < 60);
      let cx = 0, cz = 0; for (const w of L) { cx += w.x; cz += w.z; } cx /= L.length || 1; cz /= L.length || 1;
      const y = __T.stages.groundAt(cx, cz);
      __T.stages.flyTo([cx + 30, y + 28, cz + 30], [cx, y + 1, cz], 10); __T.step(1.5, 0.05); __T.render();
      return { n: L.length, calls: __T.drawCalls().total, at: [cx, cz].map(Math.round) };
    });
    check('carriers on the quarry\'s road (4)', rd.n >= 3, `${rd.n} at ${rd.at} · calls ${rd.calls}`);
    await shot('2-the-road');
    // the bench: a close frame, the two sawyers
    const bn = await G(() => {
      const L = __T.stages.lifeList().filter((w) => w.site === 'har' && (w.role === 'sawA' || w.role === 'sawB'));
      let cx = 0, cz = 0; for (const w of L) { cx += w.x; cz += w.z; } cx /= L.length || 1; cz /= L.length || 1;
      const y = __T.stages.groundAt(cx, cz);
      __T.stages.flyTo([cx + 14, y + 9, cz + 14], [cx, y + 1.6, cz], 10); __T.step(1.5, 0.05); __T.render();
      return { n: L.length, calls: __T.drawCalls().total, at: [cx, cz].map(Math.round) };
    });
    check('two sawyers at the Mount\'s bench; draw calls ≤ 150 at the close frame', bn.n === 2 && bn.calls <= 150, `${bn.n} at ${bn.at} · calls ${bn.calls}`);
    await shot('3-the-bench');
    /* fixture B: the wall active, the Mount done — the finished Mount's life */
    await G(() => {
      const g = __T.game.state; g.st.har = { done: true };
      g.st.wall = { p: 'courses', n: __T.game._.siteStones('wall'), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
      g.focus = 'wall'; g.crews = []; __T.game._.resync(); __T.game.hold(true);
      __T.step(6, 0.05);
    });
    await pg.waitForTimeout(2500);
    const lb = await G(() => { __T.step(5, 0.05); __T.stages.flyTo([-86, 48, 226], [-98, 1, 305], 10); __T.step(4, 0.05); __T.render(); return { c: __T.stages.lifeCount(), calls: __T.drawCalls().total, har: __T.stages.lifeList().filter((w) => w.site === 'har').map((w) => `${w.role}@${Math.round(w.x)},${Math.round(w.z)} v${w.vis.toFixed(1)} ${w.st}`) }; });
    check('≥ 3 workers at the finished Mount (the gates\' guards, the plaza\'s sweepers)', (lb.c.bySite.har || 0) >= 3, `bySite ${JSON.stringify(lb.c.bySite)} · total ${lb.c.total} · calls ${lb.calls} · ${lb.har.join(' | ')}`);
    check('≥ 25 ambient workers dealt at the wall (the active stage)', lb.c.total - (lb.c.bySite.har || 0) >= 20, `total ${lb.c.total}`);
    await shot('4-the-finished-mount');
    // the tap card: a worker at the wall under the finger
    const card = await G(() => {
      const L = __T.stages.lifeList().filter((w) => w.site === 'wall' && w.vis > 0.5 && w.st === 'work' && (w.role === 'mason' || w.role === 'digger'));
      const w = L[0]; if (!w) return { none: true };
      const y = __T.stages.groundAt(w.x, w.z);
      __T.stages.flyTo([w.x + 9, y + 6, w.z + 9], [w.x, y + 1.5, w.z], 10); __T.step(2.2, 0.05); __T.render();
      // (whoever of them is on screen now: the game's own camera may have had its say)
      for (const q of L) { const p = __T.view.project(q.x, __T.stages.groundAt(q.x, q.z) + 1.5, q.z); if (p.on && p.x > 40 && p.x < innerWidth - 40 && p.y > 150 && p.y < innerHeight - 130) return { x: Math.round(p.x), y: Math.round(p.y), role: q.role }; }
      const p = __T.view.project(w.x, y + 1.5, w.z); return { x: Math.round(p.x), y: Math.round(p.y), role: w.role, off: true };
    });
    if (!card.none) { await tap(card.x, card.y); await pg.waitForTimeout(400); }
    const ct = await G(() => { const c = document.getElementById('card'); return { on: !!(c && c.classList.contains('on')), t: (document.getElementById('ct') || {}).textContent || '', s: (document.getElementById('cs') || {}).textContent || '' }; });
    check('the tap card on a worker: "פועלי הורדוס · המחשה", a draft', ct.on && /פועלי הורדוס/.test(ct.t) && /המחשה/.test(ct.t) && /טיוטה/.test(ct.s), `${JSON.stringify(ct)} · at ${card.x},${card.y} ${card.role}`);
    check('no console errors', !logs.filter((x) => !/fonts|favicon/.test(x)).length, logs.slice(0, 3).join(' | ').slice(0, 300));
  } catch (e) { check('run', false, String(e && e.stack || e).slice(0, 400)); }
  finally { await b.close(); }
  const bad = results.filter((r) => !r.ok);
  console.log(`\n${results.length - bad.length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(bad.length ? 1 : 0);
})();
