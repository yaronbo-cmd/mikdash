// PLACES24: the Tamid's works ON THEIR REAL PLACES, by real touch on dist/test.html#avodah at 844×390 — each errand at its hour
// (clock.skipTo), the right button wakes at its (moved) marker, the tap starts the WORK; while it runs: the kit's frame is the anchor
// (kit.F.anchor), every drawn piece stands within 3 amot of the place's footprint, no piece is sunk in a solid (below the floor there),
// deshen's kohen walks ON the ramp's slope (a sample of him with z on the ramp has y = the ramp's height ± 0.4), the camera asks for the
// place's view (Heichal works: inside the door) while the hero never passes the Ulam (x > −81); taps alone finish it ≤ 60 s; +pts; the
// source line after the end; nothing red; no console errors.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/places24-touch.cjs [--no-build] [--shots] [--only=g-deshen,…]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/places24');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const ALL = ['g-kiddush', 'g-deshen', 'g-maaracha', 'g-taleh', 'g-shaarim', 'g-heichal', 'g-zerika', 'g-evarim', 'g-ketoret', 'g-erev', 'g-birkat', 'g-shir', 'g-neirot', 'watch', 'gates'];
const IDS = ALL.filter((i) => !ONLY.length || ONLY.includes(i));
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
    const shot = async (name) => { if (!SHOTS) return; await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); }); await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/places24/' + name + '.png'); await G(() => { window.__HUD_HOLD = false; }); };
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('Phase B day mode is on (twin + __DAY)', on); if (!on) throw new Error('no day mode');
    check('the anchors are loaded', await G(() => !!(window.__ANCHORS24 && __ANCHORS24.ANCHORS.altar && __ANCHORS24.ANCHORS.menorah)));
    await pg.waitForTimeout(800);
    // the probe of the stage, every few taps: anchor, the pieces' spread from the place's footprint, pieces sunk in a solid, the ramp's slope
    const probe = (w) => G((w) => {
      const k = window.__W22 && __W22.kit(); if (!k || !k.F.on) return { on: false };
      const A = k.F.A, P = k.points(), WL = (window.__T.avodah && null) || null; void WL;
      const area = A ? A.area : null; let far = 0, farMax = 0, sunk = 0, ramp = 0, rampBad = 0;
      const gr = __ANCHORS24.placeGround;
      for (const p of P) {
        if (area) { const dx = Math.max(area[0] - p[0], 0, p[0] - area[1]), dz = Math.max(area[2] - p[2], 0, p[2] - area[3]), d = Math.hypot(dx, dz); farMax = Math.max(farMax, d); if (d > 3) far++; }
        if (p[1] < gr(p[0], p[2]) - 0.45 && !/^g/.test(p[3])) sunk++;
      }
      // (the ramp: the kohen's feet — the lowest piece of each figure is not known; take the lit cylinders (the robes) with z on the ramp and x in it)
      if (k.F.anchor === 'ramp') for (const p of P) if (p[3] === 'cyl' && p[0] > -45.5 && p[0] < -30.5 && p[2] > 12 && p[2] < 42) { ramp++; const want = __ANCHORS24.placeGround(p[0], p[2]); if (p[1] < want - 0.4) rampBad++; }
      const v = k.F.view; const h = {}; __T.stages.heroXYZ(h); const cam = __T.camera ? __T.camera.position : null;
      return { on: true, anchor: k.F.anchor, n: P.length, far, farMax: +farMax.toFixed(2), sunk, ramp, rampBad, view: !!v, hx: +h.x.toFixed(1), cam: cam ? [+cam.x.toFixed(1), +cam.y.toFixed(1), +cam.z.toFixed(1)] : null, reds: k.reds(), bad: (() => { const bl = k.bloodCheck ? k.bloodCheck() : null; return bl ? bl.untagged + bl.nearFig + bl.floor : 0; })() };   // ── blooda25 ──
    }, w);
    for (const id of IDS) {
      const tag = `[${id}]`;
      const info = await G((id) => { const k = __DAY.tasks.get(id); return k ? { h: k.openH, work: k.work, game: k.game || null, place: k.place } : null; }, id);
      check(`${tag} the errand is a work at a p24 marker`, info && info.work && !info.game, JSON.stringify(info));
      if (!info) continue;
      await G((h) => { __DAY.clock.skipTo(h + 0.05); __DAY.D.refresh && __DAY.D.refresh(); }, info.h); await pg.waitForTimeout(900);
      await G((id) => { for (const k of __DAY.tasks.list()) if (k.id !== id && k.state === 'open') k.state = 'passed'; __DAY.tasks.force(id); __DAY.clock.pause(); }, id);
      await G((p) => __DAY.teleport(p), info.place); await pg.waitForTimeout(1500);
      const awake = await waitFor((id) => { const s = __TWIN.spec(); return !!s && s.job === id; }, id, 25000);
      check(`${tag} the right button wakes at the marker`, awake);
      await shot(`${id}-0marker`);
      await G(() => { window.__GAME_LOG.length = 0; });
      const bc = await btnC(); let n = 0, reds = 0, bad = 0, minX = 1e9, sawAnchor = null, far = 0, farMax = 0, sunk = 0, ramp = 0, rampBad = 0, view = false, camIn = false; const t0 = Date.now(); let shots = 0;
      while (!(await G((id) => __DAY.tasks.get(id).state === 'done', id)) && Date.now() - t0 < 75000) {
        await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2); n++; await pg.waitForTimeout(430);
        const st = await probe(info.work);
        if (st.on) { sawAnchor = sawAnchor || st.anchor; far = Math.max(far, st.far); farMax = Math.max(farMax, st.farMax); sunk = Math.max(sunk, st.sunk); ramp += st.ramp; rampBad += st.rampBad; view = view || st.view; reds = Math.max(reds, st.reds); bad = Math.max(bad, st.bad || 0); if (st.cam && st.cam[0] < -98) camIn = true; }
        minX = Math.min(minX, st.hx == null ? 1e9 : st.hx);
        if ((n === 3 || n === 7 || (n === 12 && /shir/.test(id))) && shots < 3) { shots++; await shot(`${id}-${shots}mid`); console.log('   probe', JSON.stringify(st)); }
      }
      const secs = (Date.now() - t0) / 1000, done = await G((id) => __DAY.tasks.get(id).state === 'done', id);
      check(`${tag} the stage is the real place (anchor)`, !!sawAnchor, String(sawAnchor));
      check(`${tag} every piece within 3 amot of the place`, far === 0, `far ${far}, max ${farMax}`);
      check(`${tag} no piece sunk in a solid`, sunk === 0, `sunk ${sunk}`);
      check(`${tag} the camera asks for the place's view`, view);
      if (info.work === 'deshen') check(`${tag} the kohen walks on the ramp's slope`, ramp > 0 && rampBad === 0, `on ramp ${ramp}, below ${rampBad}`);
      if (/heichal|ketoret|neirot/.test(info.work)) { check(`${tag} the camera goes inside the door`, camIn); check(`${tag} the hero never passes the Ulam (x > −81)`, minX > -81, `min x ${minX.toFixed(1)}`); }
      check(`${tag} taps alone finish it in ≤ 60 s`, done && secs <= 60, `${n} taps ${secs.toFixed(0)} s`);
      const pts = await G((id) => { const e = window.__GAME_LOG.find((x) => x.type === 'taskDone' && x.d && x.d.id === id); return e ? e.d.pts : 0; }, id);
      check(`${tag} the points go in`, pts > 0, `+${pts}`);
      await pg.waitForTimeout(400);
      await shot(`${id}-9end`);
      const line = await G(() => (document.querySelector('.dy-line') || {}).textContent || '');
      check(`${tag} the source line after the end (טיוטה)`, /טיוטה/.test(line), line.slice(0, 90));
      check(`${tag} reds ⊆ BLOOD, only at their places`, reds === 0 && bad === 0, `forbidden reds ${reds}, misplaced ${bad}`);   // ── blooda25 ── (DAM25 §4.4)
      await pg.waitForTimeout(2600);
    }
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  exception', e && e.stack ? e.stack.split('\n').slice(0, 4).join(' ') : e); results.push(false); }
  finally { await b.close(); console.log(`\n${results.filter(Boolean).length}/${results.length} passed in ${((Date.now() - T0) / 1000).toFixed(0)} s`); process.exit(results.every(Boolean) ? 0 : 1); }
})();
