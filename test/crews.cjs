// The CREWS agent's test: the building crews (src/crews.js) in a small lab scene and in the real build.
//   node test/crews.cjs            lab sheets + the real build (functional checks, draw calls, phone + desktop shots)
//   node test/crews.cjs lab [sheet…]   only the lab (test/out/crews/lab_*.png)
//   node test/crews.cjs real       only the real build (dist/test.html; run `node build.mjs` first)
// Needs NODE_PATH with playwright (PROJECT.md §10). One browser at a time, closed in finally. Exit code 1 on a failure.
// (SITE12: a queued run can be re-planned while it waits for its turn — test/out/site12/<this test>.plan.json = {"exec": "<another
//  test>.cjs", "argv": [...]} runs that one instead, once; the file is consumed)
if (!global.__SITE12_PLANNED) {
  try {
    const f = require('path').join(__dirname, 'out/site12', require('path').basename(__filename, '.cjs') + '.plan.json');
    if (require('fs').existsSync(f)) {
      const P = JSON.parse(require('fs').readFileSync(f, 'utf8')); require('fs').unlinkSync(f);
      if (P.exec) { global.__SITE12_PLANNED = true; console.log('plan: ' + P.exec + ' ' + (P.argv || []).join(' ')); process.argv = [process.argv[0], require('path').join(__dirname, P.exec), ...(P.argv || [])]; require(require('path').join(__dirname, P.exec)); return; }
    }
  } catch (e) { console.log('plan: ' + e.message); }
}
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/crews');
fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2);
const mode = args[0] === 'lab' || args[0] === 'real' ? args[0] : 'all';
const only = args.slice(mode === 'all' ? 0 : 1).filter((a) => !a.startsWith('--'));
const LAUNCH = { executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
const fails = [];
const ok = (name, cond, info) => { console.log((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); if (!cond) fails.push(name); };

function buildLab() {
  const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
  esbuild.buildSync({ entryPoints: [path.join(__dirname, 'crews-lab-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/crews-lab.bundle.js'), logLevel: 'warning' });
}

/* ───────── the lab: close-ups of every role ───────── */
const SHEETS = {
  // the wall site with four crews: masons, sawyers, the rope team at the crane, carriers, the foreman
  async site(pg) {
    await pg.evaluate(() => { const C = __C.crews; __C.P.wall = 0.5; C.setCrews('wall', 4); __C.step(12); });
    return [
      { name: 'site_wide', p: [95, 30, -140], t: [80, 2, -96] },
      { name: 'site_masons', p: [70, 7, -108], t: [62, 2, -91] },
      { name: 'site_saw', p: [106, 5, -114], t: [100, 2, -105] },
      { name: 'site_rope', p: [44, 9, -118], t: [42, 5, -88] },
      { name: 'site_phone', p: [110, 34, -150], t: [80, 2, -96], w: 390, h: 844 },
    ];
  },
  // ── people6 ── (PEOPLE) the masons at SITE's dressing yard strike SITE's stones: at every mason's first blow the
  // chisel's edge must stand ON his banker's stone (its top, within its footprint)
  async bankers(pg) {
    const r = await pg.evaluate(() => {
      const C = __C.crews, Y = __C.yardOn(); __C.P.wall = 0.5; C.setCrews('wall', 3); __C.step(16);
      const top = (s) => s.y + s.h / 2;
      return C._people.filter((w) => w.yard && w.fit).map((w) => {
        const b = Y.find((q) => Math.hypot(q.stone.x - w.yard.tx, q.stone.z - w.yard.tz) < 1.2), s = b && b.stone;
        // (the contact: the chisel's edge, or the hammer's face on a rough stone — recorded at the blow)
        const c = w.chisel ? [w.tipX, w.tipY, w.tipZ] : [w.hitX, w.hitY - 0.07, w.hitZ];
        return { st: w.yard.state, dy: s ? +(c[1] - top(s)).toFixed(3) : null, dx: s ? +(Math.abs(c[0] - s.x) - s.d / 2).toFixed(2) : null, dz: s ? +(Math.abs(c[2] - s.z) - s.w / 2).toFixed(2) : null, rh: +w.rHit.toFixed(2) };
      });
    });
    ok('bankers: masons at SITE\'s bankers', r.length >= 2, r.length);
    ok('bankers: the chisel\'s edge ON the stone at the blow (|dy| < 0.08, inside the top)', r.every((q) => q.dy !== null && Math.abs(q.dy) < 0.08 && q.dx < 0 && q.dz < 0), r);
    return [
      { name: 'bankers_masons', p: [96, 5.5, -114], t: [92, 1.8, -105.5] },
      { name: 'bankers_phone', p: [100, 9, -118], t: [92, 1.5, -105.5], w: 390, h: 844 },
    ];
  },
  // the foundations and the finishing phases on the same site
  async phases(pg) {
    await pg.evaluate(() => { const C = __C.crews; __C.P.wall = 0.05; C.setCrews('wall', 3); __C.step(9); });
    return [
      { name: 'phase_found', p: [95, 26, -135], t: [80, 2, -96], pre: '' },
      { name: 'phase_finish', p: [95, 26, -135], t: [80, 2, -96], pre: '__C.P.wall = 0.85; __C.step(6)' },
      { name: 'phase_cheer', p: [80, 10, -120], t: [80, 2, -96], pre: '__C.crews.cheer("wall"); __C.step(0.8)' },
    ];
  },
  // the altar: whole stones, wooden mallets, no chisels (Middot 3:4)
  async altar(pg) {
    await pg.evaluate(() => { const C = __C.crews; __C.P.yesod = 0.5; __C.setCrane('yesod', -22, -20); C.setCrews('yesod', 3); __C.step(9); });
    return [
      { name: 'altar_wide', p: [0, 40, -46], t: [-30, 17, -6] },
      { name: 'altar_close', p: [-6, 22, -30], t: [-19, 17.5, -10] },
    ];
  },
  // the quarry: picks, the block being split, the lever, carriers to the stock pile
  async quarry(pg) {
    await pg.evaluate(() => { const C = __C.crews; C.setQuarry(3); __C.step(9); });
    return [
      { name: 'quarry_wide', p: [168, 26, -238], t: [195, 1, -210] },
      { name: 'quarry_close', p: [178, 6, -215], t: [187, 2, -208] },
    ];
  },
  // the training yard: kohanim with hammer and chisel, and their master
  async yard(pg) {
    await pg.evaluate(() => { const C = __C.crews; C.trainees(4); __C.step(9); });
    return [
      { name: 'yard', p: [-40, 24, 36], t: [-52, 17, 56] },
      { name: 'yard_phone', p: [-36, 30, 28], t: [-52, 17, 56], w: 390, h: 844 },
    ];
  },
  // the House's builders are kohanim (Josephus, Ant. 15.11.6)
  async kohanim(pg) {
    await pg.evaluate(() => { const C = __C.crews; __C.P.heichal = 0.5; __C.setCrane('heichal', -104, -44); C.setCrews('heichal', 3); __C.step(9); });
    return [{ name: 'kohanim', p: [-96, 62, -112], t: [-134, 17, -48] }];
  },
  // the Mount: the first crew breaks a boulder beside the builder (on the rock's flanks)
  async har(pg) {
    await pg.evaluate(() => { __C.P.har = 0.3; __C.crews.setCrews('har', 1, [0]); __C.step(8); });
    return [{ name: 'har', p: [168, 30, -50], t: [128, 3, -84] }];
  },
  // a caravan's round: it leaves the site's bay (departure), comes back loaded, is collected: the drivers unload it
  async flow(pg) {
    await pg.evaluate(() => {
      const C = __C.crews;
      C.caravan('cedar', { status: 'out', left: 290000, total: 300000, site: 'wall' });
      __C.step(14);
    });
    return [
      { name: 'flow_depart', p: [-70, 34, -175], t: [-100, 2, -126] },
      { name: 'flow_unload', p: [-10, 16, -148], t: [-30, 2, -112], pre: `{ const C = __C.crews; C.caravan('cedar', { status: 'back', site: 'wall' }); __C.step(1); C.caravan('cedar', 'collected'); __C.step(7); }` },
      { name: 'flow_leave', p: [-60, 60, -190], t: [-100, 2, -120], pre: '__C.step(30)' },
      // the demo mode (timers ×60): a 30-second trip only rolls out of its bay and back in
      { name: 'flow_demo', p: [-52, 22, -152], t: [-82, 2, -113], pre: `{ const C = __C.crews; C.caravan('beitkerem', { status: 'out', left: 30000, total: 30000, site: 'wall' }); __C.step(2.5); window.__d1 = JSON.stringify(C.stats.trains.beitkerem); __C.step(22); window.__d2 = JSON.stringify(C.stats.trains.beitkerem); __C.step(4.5); window.__d3 = JSON.stringify(C.stats.trains.beitkerem); console.log('demo trip', window.__d1, window.__d2, window.__d3); }` },
    ];
  },
  // the caravans: the wagons train arriving over the causeway, the cedar train parked at the yard
  async caravan(pg) {
    await pg.evaluate(() => {
      const C = __C.crews;
      C.caravan('cedar', { status: 'back', site: 'wall' });
      C.caravan('wagons', { status: 'out', left: 70000, total: 300000, site: 'wall' });
      __C.step(24);
    });
    return [
      { name: 'caravan_road', p: [-190, 40, -175], t: [-220, 0, -100] },
      { name: 'caravan_parked', p: [60, 14, -150], t: [50, 2, -112] },
      { name: 'caravan_close', p: [58, 5, -122], t: [52, 2, -112] },
    ];
  },
};

async function lab(b) {
  buildLab();
  for (const [name, fn] of Object.entries(SHEETS)) {
    if (only.length && !only.includes(name)) continue;
    const pg = await b.newPage({ viewport: { width: 900, height: 560 } });
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.goto('file://' + path.join(__dirname, 'crews-lab.html') + (name === 'altar' || name === 'yard' || name === 'kohanim' ? '?temple=1' : ''));
    await pg.waitForFunction(() => window.__C && __C.ready, null, { timeout: 60000 });
    const shots = await fn(pg);
    for (const s of shots) {
      const t0 = Date.now();
      if (s.pre) await pg.evaluate(s.pre);
      if (s.w) await pg.setViewportSize({ width: s.w, height: s.h });
      await pg.evaluate((s) => { __C.resize(innerWidth, innerHeight); __C.look(s.p, s.t); __C.render(); }, s);
      const f = path.join(OUT, 'lab_' + s.name + '.png');
      await pg.screenshot({ path: f, timeout: 120000 });
      if (s.w) await pg.setViewportSize({ width: 900, height: 560 });
      console.log('shot', path.relative(ROOT, f), ((Date.now() - t0) / 1000).toFixed(1) + 's');
    }
    const st = await pg.evaluate(() => ({ dc: __C.drawCalls(), stats: __C.crews.stats }));
    console.log(name, 'draw calls', JSON.stringify(st.dc), 'stats', JSON.stringify(st.stats));
    ok(`lab ${name}: no errors`, !logs.length, logs.slice(0, 5));
    await pg.close();
  }
}

/* ───────── the real build: the game drives the crews through the world ───────── */
const VIEWS = [
  // [name, fixture, how the camera is set: the game's own focus on a site, or a look (x, y, z, dist, az°, el°) as the game's
  // view.lookAt makes it (portrait screens get 1.35× the distance); 'train' looks at the wagons' middle cart; pre: JS first]
  // the first crew arrives on the Mount (FTUE step 3): the camera the game uses on the first boulder
  ['har', 'har', { look: [128, 'g', -84, 95, 25, 30] }],
  ['wall', 'wall', { focus: 'wall' }],
  ['wall_close', 'wall', { look: [78, 4, -92, 100, -34, 30] }],
  ['cheer', 'wall', { look: [78, 4, -92, 100, -34, 30], pre: `{ __T.game._.tick(); __T.stages.crewsCheer('wall'); __T.step(0.8, 0.05); }` }],
  // the wagons coming in along the lane north of the courts (their timer is set so the train is on the road now)
  ['caravan', 'wall', { look: 'train', pre: `{ const g = __T.game.state, c = g.car.find((x) => x.r === 'wagons'); c.t1 = Date.now() + 45000; c.t0 = c.t1 - 1800e3; __T.game._.tick(); __T.step(1, 0.1); }` }],
  ['quarry', 'wall', { look: [196, 2, -205, 105, 135, 38] }],
  ['quarry_close', 'wall', { look: [188, 1, -209, 42, 135, 30] }],
  ['altar', 'altar', { focus: 'yesod' }],
  // (a closer view from the north; since wave 4 the game's own altar camera looks from the north-east, clear of the Nikanor
  //  gatehouse that used to hide the altar once it was built)
  ['altar_north', 'altar', { look: [-40, 17, -6, 95, -70, 42] }],
  ['yard', 'altar', { look: [-51, 17, 56, 62, -60, 34] }],
  ['heichal', 'heichal', { focus: 'heichal' }],
];
async function real(b) {
  const file = path.join(ROOT, 'dist/test.html');
  if (!fs.existsSync(file)) { ok('real: dist/test.html exists (run node build.mjs)', false); return; }
  const sizes = only.length ? only : ['phone', 'desktop'];
  for (const size of sizes) {
    const phone = size === 'phone', W = phone ? 390 : 1280, H = phone ? 844 : 800;
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: phone, isMobile: phone, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /crews|\[game\] world\./.test(m.text()))) logs.push(m.type() + ': ' + m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      try { localStorage.clear(); localStorage.setItem('bh_settings', JSON.stringify({ demo: false, rhythm: true })); } catch (e) { /* blocked */ }
    });
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const t0 = Date.now();
    await pg.goto('file://' + file);
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 300000 });
    console.log(`[${size}] booted in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    await pg.evaluate(() => { __T.pause(true); __T.simulate(false); });
    // the API reaches the world
    const api = await pg.evaluate(() => ({ crews: !!__T.crews, fns: ['setCrews', 'setQuarry', 'caravan', 'trainees', 'crewsCheer'].filter((f) => typeof __T.stages[f] !== 'function') }));
    ok(`[${size}] __T.crews and the world API`, api.crews && !api.fns.length, api.fns);
    // the fixtures: a save as the game would have it, pushed to the world by the game (resync → the full sync)
    const fixture = async (kind) => pg.evaluate((kind) => {
      const g = __T.game.state, now = Date.now();
      const done = (ids) => { for (const id of ids) g.st[id] = { done: true }; };
      g.ftue = 99; __T.game.ui.coach(null, ''); __T.game.ui.closeSheet && __T.game.ui.closeSheet();
      document.querySelectorAll('.gm-vision').forEach((e) => e.remove());   // (the opening vision of a fresh save)
      g.bh = g.bh.map(() => 0);
      for (const r of ['wagons', 'cedar', 'alexandria', 'beitkerem']) if (!g.routes.includes(r)) g.routes.push(r);
      g.carSlots = 3; g.car = []; g.train = [];
      while (g.crews.length < 4) g.crews.push({ at: null });
      if (kind === 'har') {
        g.st = { har: { w: 3, ph: 1 } }; g.bh = g.bh.map(() => 2); g.bh[4] = 1; g.crews = [{ at: 'har' }]; g.routes = []; g.ftue = 4;
        __T.game._.resync(); __T.stages.hero.place({ boulder: 4 }); __T.step(10, 0.1);
        return __T.crews.stats;
      }
      if (kind === 'wall') {
        done(['har']); g.st.wall = { w: 20, ph: 2 };
        g.crews[0].at = g.crews[1].at = g.crews[2].at = 'wall'; g.crews[3].at = 'quarry';
        g.car.push({ r: 'cedar', len: 'short', t0: now - 7200e3, t1: now - 60e3, y: 70 });            // back, waiting at the yard
        g.car.push({ r: 'wagons', len: 'short', t0: now - 1800e3 + 60e3, t1: now + 60e3, y: 60 });     // coming in over the causeway
        g.res.stone = 400;
      } else if (kind === 'altar') {
        done(['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka']); g.st.yesod = { w: 16, ph: 2 };
        g.crews[0].at = g.crews[1].at = g.crews[2].at = 'yesod'; g.crews[3].at = 'quarry';
        g.trainOn = true; g.train.push({ t0: now, t1: now + 9e6 }, { t0: now, t1: now + 9e6 });
        g.car.push({ r: 'beitkerem', len: 'short', t0: now - 3600e3, t1: now - 10e3, y: 40 });
      } else if (kind === 'heichal') {
        done(['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam']); g.st.heichal = { w: 50, ph: 2 };
        g.crews[0].at = g.crews[1].at = g.crews[2].at = 'heichal'; g.crews[3].at = 'quarry'; g.priests = 12;
      }
      __T.game._.resync();
      __T.stages.setCraneSite && __T.stages.setCraneSite(kind === 'wall' ? 'wall' : kind === 'altar' ? 'yesod' : 'heichal');
      __T.step(24, 0.1);
      return __T.crews.stats;
    }, kind);
    let cur = null, shots = 0;
    for (const [name, kind, how] of VIEWS) {
      if (kind !== cur) {
        const st = await fixture(kind); cur = kind;
        console.log(`[${size}] fixture ${kind}:`, JSON.stringify(st));
        if (kind === 'har') ok(`[${size}] har: the first crew at the builder's boulder`, st.sites.har && st.sites.har.crews === 1 && st.sites.har.people === 4, st.sites.har);
        if (kind === 'wall') {
          ok(`[${size}] wall: 3 crews → people at the site`, st.sites.wall && st.sites.wall.crews === 3 && st.sites.wall.people >= 12, st.sites.wall);
          ok(`[${size}] quarry crew`, st.quarry === 1);
          ok(`[${size}] cedar train parked (back)`, st.trains.cedar && st.trains.cedar.status === 'back');
          ok(`[${size}] wagons train on the road (out, arriving)`, st.trains.wagons && st.trains.wagons.status === 'out' && st.trains.wagons.leg === 'arrive', st.trains.wagons);
        }
        if (kind === 'altar') { ok(`[${size}] altar crews`, st.sites.yesod && st.sites.yesod.people >= 12, st.sites.yesod); ok(`[${size}] two trainees`, st.trainees === 2); ok(`[${size}] wall crews left`, !st.sites.wall || st.sites.wall.crews === 0); }
        if (kind === 'heichal') ok(`[${size}] heichal crews (kohanim)`, st.sites.heichal && st.sites.heichal.people >= 12, st.sites.heichal);
      }
      if (!phone && (name === 'yard' || name === 'quarry_close' || name === 'wall_close' || name === 'cheer')) continue;
      const tt = Date.now();
      if (how.pre) await pg.evaluate(how.pre);
      if (name === 'cheer') { const c = await pg.evaluate(() => __T.crews._people.filter((w) => w.site === 'wall' && w.cheer > 0).length); ok(`[${size}] a completed site cheers`, c >= 8, c); }
      const dc = await pg.evaluate((how) => {
        if (how.focus) __T.stages.focus(how.focus, 10);
        else if (how.look === 'train') { const c = __T.crews._trains.wagons.carts[1]; __T.view.lookAt(c.x, 2, c.z, 70, -60, 30, 10); }
        else { const L = how.look.slice(); if (L[1] === 'g') L[1] = __T.stages.groundAt(L[0], L[2]) + 4; __T.view.lookAt(...L, 10); }
        __T.step(0.2, 0.05); __T.render(); __T.render();
        return __T.drawCalls();
      }, how);
      await pg.evaluate(() => { __T.render(); });
      const f = path.join(OUT, `real_${name}_${size}.png`);
      // (a full-world SwiftShader frame can take minutes on a loaded machine: a timeout skips the shot, not the checks)
      try { await pg.screenshot({ path: f, timeout: 420000 }); } catch (e) { console.log(`shot ${name} ${size} skipped: ${e.name}`); continue; }
      shots++;
      const vis = await pg.evaluate(() => __T.crews.stats);
      console.log(`shot ${path.relative(ROOT, f)} ${((Date.now() - tt) / 1000).toFixed(0)} s · draw calls ${JSON.stringify(dc)} · crews drawn ${vis.actorsDrawn} kinds, ${vis.visible} people, ${vis.carts} carts`);
      ok(`[${size}] ${name}: ≤ 150 draw calls`, dc.total <= 150, dc);
    }
    // the whole-Temple view (stages.demoMode): the crews hide; back to building: they return
    const whole = await pg.evaluate(() => {
      __T.game.enterWhole(); __T.step(1, 0.1);
      const a = __T.crews.stats;
      const dc = (__T.jump('olives'), __T.drawCalls());
      __T.game.exitWhole(); __T.step(2, 0.1);
      const b = __T.crews.stats;
      return { inWhole: { drawn: a.actorsDrawn, animals: a.animalsDrawn, carts: a.carts }, back: { drawn: b.actorsDrawn, people: b.people }, dc };
    });
    ok(`[${size}] whole view hides the crews`, whole.inWhole.drawn === 0 && whole.inWhole.animals === 0 && whole.inWhole.carts === 0, whole.inWhole);
    ok(`[${size}] back to building: the crews return`, whole.back.people > 0, whole.back);
    ok(`[${size}] whole view ≤ 150 draw calls`, whole.dc.total <= 150, whole.dc);
    ok(`[${size}] no errors`, !logs.length, logs.slice(0, 6));
    await ctx.close();
  }
}
module.exports = { lab };
if (require.main === module) {
  (async () => {
    const b = await chromium.launch(LAUNCH);
    try {
      if (mode !== 'real') await lab(b);
      if (mode !== 'lab') await real(b);
    } finally { await b.close(); }
    console.log(fails.length ? `\n${fails.length} FAILED: ${fails.join(', ')}` : '\nall crews checks passed');
    process.exit(fails.length ? 1 : 0);
  })();
}
