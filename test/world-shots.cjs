// WORLD (wave 6): before/after phone shots of the world from fixed cameras, in as few page loads as possible.
//   node build.mjs && NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/world-shots.cjs [--set=base] [--only=a,b]
//        [--bundle=dist/test.html] [--out=test/out/world/<tag>] [--W=390 --H=844] [--calls]
// Loads: 'game' = Phase A, fresh save, time pinned (__FORCE_TIME); 'avodah' = Phase B (#avodah, clock pinned by __AV_NOW);
// 'world' = no game (__NO_GAME), the world alone. The loop is paused; each shot renders on demand (SwiftShader is slow).
// A shot: { load, time, wait (ms of simulated real time before the shot), js (runs first), p/t (a fixed camera; without it
// the game's own camera), hud (false = hide the HTML layers), calls (renderer.info of one full frame) }.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const arg = (k, d) => { const a = process.argv.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const flag = (k) => process.argv.includes(`--${k}`);
const BUNDLE = path.resolve(ROOT, arg('bundle', 'dist/test.html'));
const SET = arg('set', 'base');
const OUT = path.resolve(ROOT, arg('out', `test/out/world/${SET}`));
const W = +arg('W', 390), H = +arg('H', 844);
const ONLY = arg('only', '') ? arg('only', '').split(',') : null;
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const T0 = Date.now();
const log = (...a) => console.log(`[${((Date.now() - T0) / 1000).toFixed(0).padStart(4)}s]`, ...a);

const SETS = {
  // step 0 of wave 6: what the game shows today
  base: [
    { name: 'a-open', load: 'game', time: 'dawn', wait: 9000, calls: true },
    { name: 'a-site', load: 'world', time: 'dawn', js: "__T.buildMode(); const S = __T.stages; S.setStage('har', 'done'); __T.step(1.5); S.setStage('wall', 'building', 0.5); __T.step(1); S.focus('wall', 1)", wait: 700, calls: true },
    { name: 'wide-dusk', load: 'world', time: 'dusk', js: '__T.demoMode()', p: [760, 330, 1180], t: [-330, -20, 120], calls: true },
    { name: 'b-home', load: 'avodah', wait: 7000 },
  ],
  // the city and the sky from the usual views (world only, no HUD)
  city: [
    { name: 'olives-dawn', load: 'world', time: 'dawn', view: 'olives' },
    { name: 'kotel-noon', load: 'world', time: 'noon', view: 'kotel' },
    { name: 'royal-dusk', load: 'world', time: 'dusk', view: 'royal' },
    { name: 'wide-dusk', load: 'world', time: 'dusk', p: [760, 330, 1180], t: [-330, -20, 120], calls: true },
    { name: 'upper-noon', load: 'world', time: 'noon', p: [-420, 170, 520], t: [-1100, -10, 60] },
    { name: 'night', load: 'world', time: 'night', p: [760, 330, 1180], t: [-330, -20, 120] },
  ],
  // wave 6: the new city (world only, no HUD)
  city6: [
    { name: 'map', load: 'world', time: 'noon', p: [-380, 2600, 700], t: [-380, 0, 180], hud: false },
    { name: 'wide-dusk', load: 'world', time: 'dusk', p: [760, 330, 1180], t: [-330, -20, 120], calls: true, hud: false },
    { name: 'olives-dawn', load: 'world', time: 'dawn', view: 'olives', hud: false },
    { name: 'upper-noon', load: 'world', time: 'noon', p: [-420, 170, 520], t: [-1100, -10, 60], hud: false },
    { name: 'siloam', load: 'world', time: 'noon', p: [-160, 60, 1470], t: [-330, -80, 1250], hud: false },
  ],
  city6b: [
    { name: 'map', load: 'world', time: 'noon', p: [-380, 2600, 700], t: [-380, 0, 180], hud: false },
    { name: 'wide-dusk', load: 'world', time: 'dusk', js: '__T.demoMode()', p: [760, 330, 1180], t: [-330, -20, 120], calls: true, hud: false },
    { name: 'kotel-noon', load: 'world', time: 'noon', view: 'kotel', hud: false },
    { name: 'b-siloamDawn', load: 'world', js: "__T.beauty('siloamDawn')", hud: false },
    { name: 'b-cityDusk', load: 'world', js: "__T.beauty('cityDusk')", hud: false },
    { name: 'b-kidronNight', load: 'world', js: "__T.beauty('kidronNight')", hud: false, calls: true },
  ],
  // wave 6: the beauty cameras (src/city.js BEAUTY) + the kotel view
  beauty: [
    { name: 'b-heichalSunrise', load: 'world', js: "__T.beauty('heichalSunrise')", hud: false },
    { name: 'b-olivesDawn', load: 'world', js: "__T.beauty('olivesDawn')", hud: false },
    { name: 'b-siloamDawn', load: 'world', js: "__T.beauty('siloamDawn')", hud: false },
    { name: 'kotel-noon', load: 'world', time: 'noon', view: 'kotel', hud: false },
    { name: 'b-plazaNoon', load: 'world', js: "__T.beauty('plazaNoon')", hud: false },
    { name: 'b-cityDusk', load: 'world', js: "__T.beauty('cityDusk')", hud: false },
    { name: 'b-kidronNight', load: 'world', js: "__T.beauty('kidronNight')", hud: false, calls: true },
  ],
  // wave 6, last pass: the six beauty cameras + the Temple from the Mount of Olives + the city at night (the street lamps)
  beauty6: [
    { name: 'b-olivesDawn', load: 'world', js: "__T.beauty('olivesDawn')", hud: false },
    { name: 'b-heichalSunrise', load: 'world', js: "__T.beauty('heichalSunrise')", hud: false },
    { name: 'b-templeFromOlives', load: 'world', js: "__T.beauty('templeFromOlives')", hud: false },
    { name: 'b-siloamDawn', load: 'world', js: "__T.beauty('siloamDawn')", hud: false },
    { name: 'b-plazaNoon', load: 'world', js: "__T.beauty('plazaNoon')", hud: false, calls: true },
    { name: 'b-cityDusk', load: 'world', js: "__T.beauty('cityDusk')", hud: false, calls: true },
    { name: 'b-kidronNight', load: 'world', js: "__T.beauty('kidronNight')", hud: false, calls: true },
    { name: 'city-night', load: 'world', time: 'night', p: [760, 330, 1180], t: [-330, -20, 120], hud: false, calls: true },
  ],
  // wave 7 (WORLD7): candidates for the opening vision (the finished House over the Old City at the golden hour)
  vision0: [
    { name: 'vA', load: 'world', time: 'golden', js: '__T.demoMode()', p: [430, 260, 630], t: [-100, 50, 0], hud: false, calls: true },
    { name: 'vB', load: 'world', time: 'golden', js: '__T.demoMode()', p: [700, 190, 1000], t: [-100, 50, 0], hud: false },
    { name: 'vC', load: 'world', time: 'golden', js: '__T.demoMode()', p: [100, 200, 1150], t: [-100, 45, 0], hud: false },
    { name: 'vD', load: 'world', time: 'golden', js: '__T.demoMode()', p: [800, 150, 250], t: [-100, 55, 0], hud: false },
  ],
  vision1: [
    { name: 'vD2', load: 'world', time: 'golden', js: '__T.demoMode()', p: [800, 150, 250], t: [-100, 55, 0], hud: false },
    { name: 'vE', load: 'world', time: 'golden', js: '__T.demoMode()', p: [760, 300, 120], t: [-110, 40, 0], hud: false, calls: true },
    { name: 'vF', load: 'world', time: 'golden', js: '__T.demoMode()', p: [620, 240, -300], t: [-110, 50, 20], hud: false },
    { name: 'vG', load: 'world', time: 'golden', js: '__T.demoMode()', p: [900, 420, 420], t: [-120, 30, 0], hud: false },
  ],
  vision2: [
    { name: 'vH', load: 'world', time: 'golden', js: '__T.demoMode()', p: [700, 250, 330], t: [-120, 75, 0], hud: false, calls: true },
    { name: 'vI', load: 'world', time: 'golden', js: '__T.demoMode()', p: [620, 330, 260], t: [-120, 60, 10], hud: false },
    { name: 'vJ', load: 'world', time: 'golden', js: '__T.demoMode()', p: [760, 280, 120], t: [-110, 70, 0], hud: false },
    { name: 'vK', load: 'world', time: 'golden', js: '__T.buildMode()', p: [650, 240, 306], t: [-120, 75, 0], hud: false },
  ],
  // wave 7 (WORLD7): the Phase A site at every time of day (the rough Mount, the wall site, the altar, the house) + the night city
  siteT: (() => {
    const HAR = "__T.buildMode(); const S = __T.stages; S.setStage('har', 'done', undefined, { instant: true });";
    const MOUNT = { js: '__T.buildMode(); __T.step(0.3)', p: [330, 110, 60], t: [100, 10, -60] };
    const WALL = { js: `${HAR} const I = S.siteInfo('wall'); const n = I.perCourse.slice(0, 3).reduce((a, b) => a + b, 0) + (I.perCourse[3] >> 1); S.setWork('wall', { phase: 'courses', stones: n }); __T.step(4); __T.step(2);`, p: [40, 60, -190], t: [70, 6, -74] };
    const ALTAR = { js: `${HAR} for (const id of ['wall','sorag','gates','nashim','nikanor','lishka','yesod']) S.setStage(id, 'done', undefined, { instant: true }); const I = S.siteInfo('sovev'); S.setWork('sovev', { phase: 'courses', stones: I.perCourse[0] + I.perCourse[1] + 30 }); __T.step(4); __T.step(2);`, p: [-2, 44, 44], t: [-40, 21, -5] };
    const HOUSE = { js: `${HAR} for (const id of ['wall','sorag','gates','nashim','nikanor','lishka','yesod','sovev','guf','karnot','kiyor']) S.setStage(id, 'done', undefined, { instant: true }); S.setStage('ulam', 'building', 0.55); S.setStage('heichal', 'building', 0.55); __T.step(3);`, p: [58, 86, 40], t: [-80, 52, 0] };
    const o = [];
    for (const [k, site, times] of [['mount', MOUNT, ['dawn', 'noon', 'dusk', 'night']], ['wall', WALL, ['dawn', 'noon', 'dusk', 'night']], ['altar', ALTAR, ['dawn', 'night']], ['house', HOUSE, ['noon', 'dusk']]]) {
      times.forEach((time, i) => o.push({ name: `${k}-${time}`, load: 'world', time, js: i === 0 ? site.js : undefined, p: site.p, t: site.t, hud: false, calls: i === 0 }));
    }
    o.push({ name: 'n-kidron', load: 'world', js: "__T.demoMode(); __T.beauty('kidronNight')", hud: false, calls: true });
    o.push({ name: 'n-city', load: 'world', time: 'night', p: [760, 330, 1180], t: [-330, -20, 120], hud: false });
    return o;
  })(),
  // wave 7 (WORLD7): the Ulam's façade and the House up close (the gold, the roofline's crest)
  house7: [
    { name: 'f-facade-dawn', load: 'world', time: 'dawn', js: '__T.demoMode()', view: 'facade', hud: false, calls: true },
    { name: 'f-facade-noon', load: 'world', time: 'noon', view: 'facade', hud: false },
    { name: 'f-heichalSunrise', load: 'world', js: "__T.beauty('heichalSunrise')", hud: false },
    { name: 'f-templeFromOlives', load: 'world', js: "__T.beauty('templeFromOlives')", hud: false },
  ],
  // wave 7 (WORLD7), the last pass: house7 + the vision's first frame + the rough Mount's new ground at dawn and dusk
  final7: [
    { name: 'f-facade-dawn', load: 'world', time: 'dawn', js: '__T.demoMode()', view: 'facade', hud: false, calls: true },
    { name: 'f-facade-noon', load: 'world', time: 'noon', view: 'facade', hud: false },
    { name: 'f-heichalSunrise', load: 'world', js: "__T.beauty('heichalSunrise')", hud: false },
    { name: 'f-templeFromOlives', load: 'world', js: "__T.beauty('templeFromOlives')", hud: false },
    { name: 'vision', load: 'world', js: "__T.demoMode(); __T.beauty('vision')", hud: false, calls: true },
    { name: 'mount-dawn', load: 'world', time: 'dawn', js: '__T.buildMode(); __T.step(0.3)', p: [330, 110, 60], t: [100, 10, -60], hud: false },
    { name: 'mount-dusk', load: 'world', time: 'dusk', p: [330, 110, 60], t: [100, 10, -60], hud: false },
  ],
  dusk7: [
    { name: 'wall-dusk', load: 'world', time: 'dusk', js: `__T.buildMode(); const S = __T.stages; S.setStage('har', 'done', undefined, { instant: true }); const I = S.siteInfo('wall'); const n = I.perCourse.slice(0, 3).reduce((a, b) => a + b, 0) + (I.perCourse[3] >> 1); S.setWork('wall', { phase: 'courses', stones: n }); __T.step(4); __T.step(2);`, p: [40, 60, -190], t: [70, 6, -74], hud: false },
    { name: 'n-city-dusk', load: 'world', time: 'dusk', p: [760, 330, 1180], t: [-330, -20, 120], hud: false },
  ],
  sky: [
    { name: 'sky-dawn', load: 'world', time: 'dawn', p: [601, 120, -215], t: [-400, 180, 400] },
    { name: 'sky-noon', load: 'world', time: 'noon', p: [601, 120, -215], t: [-400, 180, 400] },
    { name: 'sky-dusk', load: 'world', time: 'dusk', p: [601, 120, -215], t: [-400, 180, 400] },
    { name: 'sky-night', load: 'world', time: 'night', p: [601, 120, -215], t: [-400, 180, 400] },
  ],
};

async function run() {
  const plan = (SETS[SET] || []).filter((s) => !ONLY || ONLY.includes(s.name));
  const loads = [...new Set(plan.map((s) => s.load))];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-first-run', '--disable-background-networking'] });
  const R = [];
  try {
    for (const load of loads) {
      const ctx = await b.newContext({ viewport: { width: W, height: H }, isMobile: W < 700, hasTouch: W < 700, deviceScaleFactor: 1, locale: 'he-IL' });
      const pg = await ctx.newPage();
      const errs = [];
      pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message));
      pg.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g|net::|ERR_TUNNEL/.test(m.text())) errs.push(m.text().slice(0, 240)); });
      await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
      const first = plan.find((s) => s.load === load);
      await pg.addInitScript(([load, time]) => {
        window.__FORCE_Q = 'normal'; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
        if (load === 'world') window.__NO_GAME = true;
        if (load === 'game' || load === 'world') window.__FORCE_TIME = time || 'dawn';
        if (load === 'avodah') { window.__AV_NOW = Date.parse('2026-09-27T09:40:00+03:00'); window.__AV_T0 = performance.now(); }
        try {
          localStorage.clear();
          if (load === 'avodah') { localStorage.setItem('bh_beta2', JSON.stringify({ v: 5, name: 'אלעזר', mishmar: 8 })); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, pid: 'pw6', name: 'אלעזר', mishmar: 8, seenIntro: true })); }
        } catch (e) { /* blocked */ }
      }, [load, first.time]);
      const t0 = Date.now();
      await pg.goto('file://' + BUNDLE + (load === 'avodah' ? '#avodah' : ''));
      await pg.waitForFunction((load) => window.__T && window.__T.booted && (load !== 'avodah' || window.__AVODAH), load, { timeout: 900000, polling: 1000 });
      log(load, 'booted in', ((Date.now() - t0) / 1000).toFixed(0), 's');
      let curTime = first.time || 'dawn';
      for (const s of plan.filter((x) => x.load === load)) {
        const t1 = Date.now();
        if (s.time && s.time !== curTime) { await pg.evaluate((k) => __T.setTime(k), s.time); curTime = s.time; }
        if (s.js) await pg.evaluate(s.js);
        if (s.wait) await sleep(s.wait);
        const info = await pg.evaluate((s) => {
          window.__HUD_HOLD = true;
          if (s.hud === false) for (const e of document.querySelectorAll('.gm, .av, .sc-root, #card, .top, .dock, #hint, #mk')) { e.dataset.wsHide = e.style.visibility; e.style.visibility = 'hidden'; }
          if (s.view) __T.jump(s.view); else if (s.p) __T.look(s.p, s.t);
          __T.render(); __T.render();
          const c = __T.camera.position, t = __T.controls.target;
          const r = { cam: [c.x, c.y, c.z].map((v) => +v.toFixed(1)), tgt: [t.x, t.y, t.z].map((v) => +v.toFixed(1)) };
          if (s.calls) { r.calls = __T.drawCalls(); }
          return r;
        }, s);
        if (s.calls) await pg.evaluate(() => __T.render());
        const f = path.join(OUT, `${s.name}.png`);
        await pg.screenshot({ path: f, timeout: 400000 });
        await pg.evaluate(() => { window.__HUD_HOLD = false; for (const e of document.querySelectorAll('[data-ws-hide]')) { e.style.visibility = e.dataset.wsHide; delete e.dataset.wsHide; } });
        log('shot', f, ((Date.now() - t1) / 1000).toFixed(0) + ' s', JSON.stringify(info));
        R.push({ name: s.name, file: f, ...info });
      }
      if (errs.length) log('errors:', errs.join('\n'));
      R.push({ load, errors: errs });
      await ctx.close();
    }
  } finally { await b.close(); }
  fs.writeFileSync(path.join(OUT, 'shots.json'), JSON.stringify(R, null, 1));
  log('done →', OUT);
}
run().catch((e) => { console.error(e); process.exit(1); });
