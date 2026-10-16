// WORLD12 (wave 12): the nights and the finale, on the real build by real touch at 390×844 (no autoplay flags).
//   node build.mjs && /home/claude/wt/bus/brun node test/finale-touch.cjs [--out=test/out/finale12]
// 1. the rain by the Hebrew date in the real game: a wet winter night (__FORCE_DATE) rains, a dry one does not (its moon and
//    stars), and the story card "גשם רק בלילה" comes only on the wet night;
// 2. the build-up: with the Ulam built, pilgrims of named lands walk up to the Mount (crowd.js LANDS) and lamps are hung;
// 3. the night of light: __BH_FINALE.celebrate() → night, every lamp, the crowd 'chag', the chag music; the moment 'chanukat'
//    played by 16 real taps on the four menorot; its end card is sourced, tagged טיוטה, marked המחשה, with no fireworks.
// Screenshots (looked at by hand): <out>/rain-wet.png, rain-dry.png, buildup.png, chag-start.png, chag-half.png, chag-end.png
const path = require('path'), fs = require('fs');
const { chromium } = require(path.join(process.env.NODE_PATH || '/home/claude/.npm-global/lib/node_modules', 'playwright'));
const ROOT = path.resolve(__dirname, '..');
const out = path.resolve(ROOT, (process.argv.find((a) => a.startsWith('--out=')) || '--out=test/out/finale12').slice(6));
fs.mkdirSync(out, { recursive: true });
const ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'];
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ARGS });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const pg = await ctx.newPage();
  const errs = [];
  pg.on('pageerror', (e) => errs.push(e.message));
  await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await pg.addInitScript(() => {
    window.__GAME_LOG = []; window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
    window.__FORCE_DATE = '2026-11-24';   // 15 Kislev 5787: a wet night (src/weather.js)
    for (const k of ['alert', 'confirm', 'prompt']) window[k] = () => null;
    try { localStorage.clear(); localStorage.setItem('bh_settings', JSON.stringify({ demo: false })); } catch (e) { /* blocked */ }
  });
  const t0 = Date.now();
  await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 300000 });
  await pg.evaluate(() => { window.__G = __T.game; __T.simulate(true); });
  console.log(`booted in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  const E = (fn, a) => pg.evaluate(fn, a);
  const shot = async (name) => {
    await E(() => { __T.simulate(false); __T.render(); __T.render(); __G.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
    const f = path.join(out, name + '.png');
    await pg.screenshot({ path: f, timeout: 300000 });
    await E(() => { window.__HUD_HOLD = false; });
    console.log('   shot', path.relative(ROOT, f));
  };
  const closeCards = () => E(() => { for (let k = 0; k < 8; k++) { const x = document.querySelector('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (x) x.click(); } });
  const ALL = ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam', 'heichal', 'kodesh'];

  // ── 1. the rain by the date (the House's chapter: everything built up to the Heichal) ──
  await E((ALL) => {
    const g = __G.state; g.ftue = 99; __G.ui.coach(null, ''); __G.ui.closeSheet();
    for (const st of ALL) if (st !== 'heichal' && st !== 'kodesh') g.st[st] = { done: true };
    g.bh = g.bh.map(() => 0); g.priests = 10; g.story.avInvAltar = 1; g.story.avInvFinale = 1; g.story.rain = 0;
    __G._.resync();
  }, ALL);
  await closeCards();
  await E(() => { __G._.setTime('night'); });
  // (a new game's opening holds the time of day until it ends: wait for the night's rain to be decided)
  await pg.waitForFunction(() => __T.stages._dbg.rain.want === true, null, { timeout: 25000, polling: 250 }).catch(() => {});
  await pg.waitForTimeout(3000);
  const wet = await E(() => ({ want: __T.stages._dbg.rain.want, k: __T.stages._dbg.rain.k, n: globalThis.__BH_WEATHER.night(), sky: __T.sky.moon }));
  check('a wet night by the date rains (15 Kislev 5787: the winter)', wet.want === true && wet.n.rain === true, `${wet.n.civil} ${wet.n.heb} rain ${wet.n.rain}`);
  const SKYCAM = () => E(() => { __T.look([-60, 64, -70], [120, 96, 110]); __T.step(2); });   // over the courts toward the south-east sky (the moon's side)
  await SKYCAM();
  await shot('rain-wet');
  // the story card of the first rainy night waits for a calm moment: let the game's tick reach it
  const card = await pg.waitForFunction(() => { const m = document.querySelector('.gm-modal.on'); return !!m && /גשם רק בלילה/.test(m.textContent); }, null, { timeout: 20000, polling: 300 }).then(() => true, () => false);
  const cardTxt = await E(() => (document.querySelector('.gm-modal.on') || {}).textContent || '');
  check('the story card "גשם רק בלילה" on the first rainy night, with Josephus and "לא בכל לילה"', card && /יוספוס/.test(cardTxt) && /לא בכל לילה/.test(cardTxt), cardTxt.slice(0, 80));
  await closeCards();
  // a dry night: 4 Kislev (a crescent)
  await E(() => { window.__FORCE_DATE = '2026-11-13'; __G._.setTime('dusk'); __G._.setTime('night'); });
  await pg.waitForTimeout(3500);
  const dry = await E(() => ({ want: __T.stages._dbg.rain.want, k: __T.stages._dbg.rain.k, n: globalThis.__BH_WEATHER.night(), sky: __T.sky.moon, over: __T.sky.overcast }));
  check('a dry night by the date: no rain, a clear sky, the moon at its phase (4 Kislev: a crescent)', dry.want === false && dry.n.rain === false && dry.sky.clear && dry.sky.lit < 0.25, `${dry.n.heb} lit ${dry.sky.lit.toFixed(2)} overcast ${dry.over.toFixed(2)}`);
  await SKYCAM();
  await shot('rain-dry');

  // ── 2. the build-up: the Ulam built, the Heichal and the Kodesh not yet — by day ──
  await E(() => { __G._.setTime('noon'); try { __T.stages.hero.place('heichal'); } catch (e) { /* the world's */ } __T.crowd.setScene('site'); globalThis.__BH_FINALE.poll(); });
  await pg.waitForTimeout(2500);
  const bu = await E(() => { const c = __T.crowd, F = globalThis.__BH_FINALE.state; return { F, buildup: c.buildup, scene: c.scene, lamps: __T.life.fest, lands: [...new Set(c.actors && c.actors.list ? c.actors.list.filter((a) => a.land).map((a) => a.land) : [])] }; });
  check('the build-up: the House begun → pilgrims of named lands walk up (crowd.setBuildup), lamps are hung', bu.F.lands >= 2 && bu.buildup === bu.F.lands && bu.lamps.n > 0, JSON.stringify(bu));
  await E(() => { const h = __T.stages.hero.position; __T.look([h.x + 30, h.y + 34, h.z - 42], [h.x, h.y + 2, h.z - 12]); __T.step(4); });
  await shot('buildup');

  // ── 3. the night of light ──
  await E((ALL) => { const g = __G.state; for (const st of ALL) g.st[st] = { done: true }; g.celeb = true; __G._.resync(); }, ALL);
  await closeCards();
  await E(() => { window.__CELEB = globalThis.__BH_FINALE.celebrate().then(() => { window.__CELEB_DONE = true; }); });
  const open = await pg.waitForFunction(() => { const m = document.querySelector('.gm-mo.on'); return !!m && m.getAttribute('aria-label') === 'חנוכת הבית' && !!m.querySelector('.gm-ch-men'); }, null, { timeout: 60000, polling: 250 }).then(() => true, () => false);
  check('the celebration opens its moment "חנוכת הבית"', open);
  await pg.waitForTimeout(1500);
  const w1 = await E(() => ({ time: __T.sky.key, fest: __T.life.fest, scene: __T.crowd.scene, stats: __T.crowd.stats }));
  check('the world at night: every lamp lit, the crowd of the celebration', w1.time === 'night' && w1.fest.visible && w1.fest.n === w1.fest.of && w1.scene === 'chag', JSON.stringify(w1));
  console.log('   camera', JSON.stringify(await E(() => ({ p: __T.camera.position.toArray().map(Math.round), t: __T.controls.target.toArray().map(Math.round) }))));
  await shot('chag-start');
  for (const [tag, p, t] of [['A', [200, 110, 110], [-60, 10, 0]], ['B', [150, 70, 60], [-40, 0, 0]], ['C', [120, 40, 0], [-70, 40, 0]]]) {
    await E(([p, t]) => { __T.look(p, t); __T.step(1); }, [p, t]);
    await shot('chag-view-' + tag);
  }
  // sixteen real taps: four on each menorah (the whole menorah is the target)
  const tapMen = async (m) => { const r = await E((m) => { const g = document.querySelectorAll('.gm-mo.on .gm-ch-men')[m]; if (!g) return null; const b = g.getBoundingClientRect(); return { x: b.left + b.width / 2, y: b.top + b.height * 0.55, w: b.width, h: b.height }; }, m); if (r) await pg.touchscreen.tap(r.x, r.y); return r; };
  const r0 = await tapMen(0);
  check('a menorah is a big target (≥ 44 px each way)', r0 && r0.w >= 44 && r0.h >= 44, r0 ? `${Math.round(r0.w)}×${Math.round(r0.h)} px` : 'none');
  for (let k = 1; k < 8; k++) { await tapMen(k < 4 ? 0 : 1); await pg.waitForTimeout(120); }
  const half = await E(() => ({ c: (document.querySelector('.gm-mo.on .gm-mo-count') || {}).textContent, lit: document.querySelectorAll('.gm-mo.on .gm-ch-fl.on').length, music: globalThis.__BH_MUSIC.get() }));
  check('each tap lights the next bowl (8 taps → 8 flames)', half.lit === 8, `${half.c} · ${half.lit}`);
  check('the chag music plays at the celebration (the first tap started the music)', half.music.want === 'chag', JSON.stringify({ state: half.music.state, want: half.music.want, bpm: half.music.bpm }));
  await shot('chag-half');
  for (let k = 0; k < 8; k++) { await tapMen(k < 4 ? 2 : 3); await pg.waitForTimeout(120); }
  const ended = await pg.waitForFunction(() => { const e = document.querySelector('.gm-mo.on .gm-mo-end'); return !!e && !e.hidden; }, null, { timeout: 8000, polling: 200 }).then(() => true, () => false);
  const endc = await E(() => ({ src: (document.querySelector('.gm-mo.on .gm-mo-src') || {}).textContent || '', draft: !!document.querySelector('.gm-mo.on .gm-draft'), kick: (document.querySelector('.gm-mo.on .gm-mo-k') || {}).textContent || '', inv: !!document.querySelector('.gm-mo.on .gm-ch-inv'), all: document.body.innerText }));
  check('16 bowls lit → the end card: sourced (עזרא, יוספוס, סוכה), טיוטה, המחשה', ended && /עזרא/.test(endc.src) && /יוספוס/.test(endc.src) && /סוכה/.test(endc.src) && endc.draft && /המחשה/.test(endc.kick + endc.src), endc.src.slice(0, 90));
  check('no fireworks anywhere (⚑ owner)', !/זיקוק/.test(endc.all));
  check('the invitation "הזמינו חברים לחגיגה" when the net is there', endc.inv === !!(await E(() => globalThis.__BH_NET && typeof globalThis.__BH_NET.open === 'function')), `button ${endc.inv}`);
  await shot('chag-end');
  const go = await E(() => { const x = document.querySelector('.gm-mo.on .gm-mo-go'); if (!x) return null; const r = x.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
  if (go) await pg.touchscreen.tap(go.x, go.y);
  const done = await pg.waitForFunction(() => window.__CELEB_DONE === true, null, { timeout: 10000 }).then(() => true, () => false);
  const after = await E(() => ({ F: globalThis.__BH_FINALE.state, scene: __T.crowd.scene, time: __T.sky.key, want: globalThis.__BH_MUSIC.get().want }));
  check('"המשך" ends the celebration: the time, the crowd and the music come back', done && !after.F.celebrating && after.time === 'noon' && after.want !== 'chag' && after.scene !== 'chag', JSON.stringify(after));
  check('no page errors', errs.length === 0, errs.join(' | '));
  await b.close();
  const bad = results.filter((x) => !x).length;
  console.log(`\n${results.length - bad}/${results.length} passed`);
  process.exit(bad ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(2); });
