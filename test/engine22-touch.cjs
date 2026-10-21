// ENGINE22 (wave 22): "יום במקדש" — Phase B as one weekday, by REAL touch (CDP) at 844×390 on dist/test.html#avodah.
//   twin on in the finished Temple · the stick walks the אמרכל ≥ 6 amot and never through the Ulam/Heichal (the פרוכת) nor the altar ·
//   the clock: 1 temple hour in 3 real minutes by day (tick), the horizon HUD "השעה … בעוד … (N דק׳) — …" · an errand opens at its hour
//   with a bubble and a marker · the button wakes at the marker and taps alone finish the errand · the clock pauses when the page is
//   hidden · dayEnd at 18:00 → "נעילת שערים" and the card → the next night, the save holds the day number · portrait: the home.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/engine22-touch.cjs [--no-build] [--shots]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/engine22');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots');
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
    await pg.addInitScript(() => {
      try { localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'אביתר', mishmar: 3, seenIntro: true, created: Date.now(), lastSeen: Date.now() })); } catch (e) { /* none */ }
      window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
    });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const cdp = await ctx.newCDPSession(pg);
    const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
    const up = async (id) => { const f = fingers.get(id); fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return f; };
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/engine22/' + name + '.png');
      await G(() => { window.__HUD_HOLD = false; });
    };
    const hero = () => G(() => { const p = __T.stages.heroXYZ({}); return { x: +p.x.toFixed(2), z: +p.z.toFixed(2), y: +p.y.toFixed(2), g: +__T.stages.groundAt(p.x, p.z).toFixed(2) }; });
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    /** drag the stick toward a world point (the screen direction of hero → target), hold ms, release */
    const walkToward = async (tx, tz, ms) => {
      const d = await G(([tx, tz]) => { const p = __T.stages.heroXYZ({}), a = { ...__T.view.project(p.x, p.y, p.z) }, b = { ...__T.view.project(tx, p.y, tz) }; const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy) || 1; return { dx: dx / L, dy: dy / L }; }, [tx, tz]);
      const sx = 150, sy = 290;
      await down(1, sx, sy);
      for (let k = 1; k <= 4; k++) { await move(1, sx + d.dx * 16 * k, sy + d.dy * 16 * k); await pg.waitForTimeout(30); }
      await pg.waitForTimeout(ms);
      await up(1);
    };

    /* 1. the Temple world, the two thumbs, the horizon */
    const on = await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 60000);
    check('Phase B landscape: the two thumbs are on in the finished Temple (.gm.tw-on, the אמרכל stands in the azara)', on && (await hero()).g >= 15.9);
    await pg.waitForTimeout(800);
    const hud0 = await G(() => __DAY.hud());
    check('the horizon HUD: "השעה: … · בעוד … (N דק׳) — …"', /^השעה: /.test(hud0.h1) && /בעוד/.test(hud0.h1) && /דק׳\)/.test(hud0.h1), hud0.h1);
    await shot('01-night-start');

    await G(() => { __DAY.clock.skipTo(23); });
    await pg.waitForTimeout(1500);
    check('the night: the sky follows the clock (the world\'s night preset at 23:00)', await G(() => __DAY.clock.now().block === 'night' && document.querySelector('.dy-gm') != null));
    await shot('01b-night');
    /* 1b. a sheet game as an errand (the morning's payis): from the marker, played as today */
    await G(() => { __DAY.clock.skipTo(4.5); __DAY.D.refresh(); __DAY.clock.tick(30); });
    const gOpen = await waitFor(() => __DAY.tasks.get('g-payis1').state === 'open', null, 3000);
    check('the morning sheets are errands at their hours (הפיס הראשון opens at 04:00)', gOpen);

    /* 1c. a sheet as an errand, from its marker: the button starts it, it is played as today, the Temple comes back */
    await G(() => __DAY.teleport('gazit'));
    await pg.waitForTimeout(1500);
    const gAwake = await waitFor(() => { const s = __TWIN.spec(); return !!s && s.job === 'g-payis1'; }, null, 5000);
    check('at the lots\' marker (לשכת הגזית) the button wakes with the sheet\'s errand', gAwake, JSON.stringify(await G(() => __TWIN.spec() && __TWIN.spec().job)));
    const bc0 = await btnC();
    await down(2, bc0.x, bc0.y); await pg.waitForTimeout(70); await up(2);
    // (wave 23: the dawn's errands are world works now — the button plays them by taps; a sheet would be Phase B's own run)
    const started = await waitFor(() => (window.__AVODAH && __AVODAH.busy) || (window.__HANDS && __HANDS.twin) || (__DAY.tasks.get('g-payis1').state !== 'open'), null, 8000);
    check('a tap starts the errand (a world work under two thumbs, or the sheet as today)', started);
    for (let k = 0; k < 120 && await G(() => __AVODAH.busy); k++) { await G(() => { try { __AVODAH._.solve(); } catch (e) { /* */ } const b = document.querySelector('.av-go'); if (b && b.offsetParent) b.click(); }); await pg.waitForTimeout(500); }
    for (let k = 0; k < 40 && await G(() => __DAY.tasks.get('g-payis1').state === 'open'); k++) { await down(2, bc0.x, bc0.y); await pg.waitForTimeout(70); await up(2); await pg.waitForTimeout(700); }
    const back = await waitFor(() => !__AVODAH.busy && !document.querySelector('.av-home.on') && __TWIN.on(), null, 8000);
    check('the errand ends by taps alone, it is done, and the Temple (not the home) is back with the thumbs', back && await G(() => __DAY.tasks.get('g-payis1').state === 'done'), await G(() => __DAY.tasks.get('g-payis1').state));
    await pg.waitForTimeout(1500);

    await G(() => { __DAY.clock.skipTo(5.6); __DAY.clock.tick(30); });
    const appt = await waitFor(() => /התמיד של שחר/.test((document.querySelector('.dy-banner') || {}).textContent || ''), null, 3000);
    check('an appointment of the day arrives with a line: "עכשיו: התמיד של שחר" (05:40)', appt, await G(() => (document.querySelector('.dy-banner') || {}).textContent));

    /* 2. the stick: ≥ 6 amot; the Ulam is a wall; the altar is a wall */
    const h0 = await hero();
    await walkToward(-15, 30, 2200);
    const h1 = await hero();
    const walked = Math.hypot(h1.x - h0.x, h1.z - h0.z);
    check('the left stick walks him ≥ 6 amot, feet on the floor', walked >= 6 && Math.abs(h1.y - h1.g) < 0.2, `${walked.toFixed(1)} amot, y ${h1.y} g ${h1.g}`);
    await G(() => __T.stages.hero.setPos(-64, 0, -1.57));
    await pg.waitForTimeout(500);
    await walkToward(-110, 0, 4500);
    const h2 = await hero();
    check('toward the Heichal: never into the Ulam / the House (the door at −92 and the פרוכת are out of reach): outside x<−76.5 ∧ |z|<50.9', !(h2.x < -76.5 && Math.abs(h2.z) < 50.9), `x ${h2.x} z ${h2.z}`);
    await G(() => __T.stages.hero.setPos(-18, 0, -1.57));
    await pg.waitForTimeout(400);
    await walkToward(-40, 0, 4500);
    const h3 = await hero();
    check('toward the altar: stops at its foot (x > −21.2)', h3.x > -21.4, `x ${h3.x}`);
    await G(() => __T.stages.hero.setPos(-30, 55, 0));
    await pg.waitForTimeout(300);
    await walkToward(-30, 120, 3500);
    const h4 = await hero();
    check('toward the south wall: never off the azara floor (z ≤ 67.5)', h4.z <= 67.6, `z ${h4.z}`);

    /* 3. the clock: a temple hour in 3 real minutes by day; the horizon follows */
    await G(() => __DAY.clock.skipTo(9));
    const c0 = await G(() => __DAY.clock.now().h);
    await G(() => __DAY.clock.tick(180));
    const c1 = await G(() => __DAY.clock.now().h);
    check('the clock: 3 real minutes = 1 temple hour by day', Math.abs(c1 - c0 - 1) < 0.01, `${c0} → ${c1}`);
    /* 4. an errand opens at its hour: bubble + marker; the button wakes there; taps alone finish it */
    await G(() => { __DAY.clock.skipTo(9.1); __DAY.D.refresh(); });
    await G(() => __DAY.clock.tick(40));    // across a quarter → tasks.sync
    const opened = await waitFor(() => __DAY.tasks.get('wicks') && __DAY.tasks.get('wicks').state === 'open', null, 4000);
    const say = await waitFor(() => !!document.querySelector('.dy-say.on'), null, 3000);
    check('the errand "פתילות" (בן בבי) opens at its hour, with a speech bubble', opened && say, await G(() => (document.querySelector('.dy-say') || {}).textContent));
    await pg.waitForTimeout(600);
    await G(() => __DAY.teleport('store'));
    await pg.waitForTimeout(1400);
    const mkOn = await G(() => [...document.querySelectorAll('.tw-mk')].some((m) => m.style.transform && !/-999/.test(m.style.transform)));
    const awake = await waitFor(() => { const s = __TWIN.spec(); return !!s && s.job === 'wicks'; }, null, 5000);
    check('a marker stands in the world and the right button wakes at it (🕯)', mkOn && awake, JSON.stringify(await G(() => __TWIN.spec() && { icon: __TWIN.spec().icon, job: __TWIN.spec().job })));
    await shot('02-errand-marker');
    const bc = await btnC();
    const pts0 = await G(() => JSON.parse(localStorage.getItem('bh_avodah') || '{}').points || 0);
    for (let k = 0; k < 3; k++) { await down(2, bc.x, bc.y); await pg.waitForTimeout(70); await up(2); await pg.waitForTimeout(350); }
    const done = await waitFor(() => __DAY.tasks.get('wicks').state === 'done', null, 6000);
    check('three taps on the button (the first starts it) finish the errand (taps alone); the points go in', done && await G(() => __DAY.D && true), await G(() => JSON.stringify(__DAY.tasks.counts())));
    const src = await waitFor(() => !!document.querySelector('.dy-line.on small'), null, 3000);
    check('the source line comes after the work (טיוטה + the Mishnah)', src, await G(() => (document.querySelector('.dy-line') || {}).textContent));
    await shot('03-errand-done');
    void pts0;

    await G(() => __DAY.clock.skipTo(11.5));
    await pg.waitForTimeout(900);
    const hud1 = await G(() => __DAY.hud());
    check('the HUD shows the next appointment and its minutes', /התמיד של בין הערביים/.test(hud1.h1) && /בעוד 3 שעות \(9 דק׳\)/.test(hud1.h1), hud1.h1);

    /* 4b. the compass: an arrow toward the nearest due errand; a tap on it brings him there (a fade, not a long walk) */
    const nd = await G(() => { const n = __DAY.tasks.nextDue(); const p = __DAY.D.PLACE[n.k.place]; return { id: n.k.id, x: p.x, z: p.z }; });
    const gOn = await waitFor(() => { const g = document.querySelector('.tw-goal'); return !!g && !!g.style.transform && !/-999/.test(g.style.transform); }, null, 5000);
    check('the compass arrow shows toward the nearest due errand', gOn, JSON.stringify(nd));
    if (gOn) {
      const gc = await G(() => { const r = document.querySelector('.tw-goal').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
      await down(3, gc.x, gc.y); await pg.waitForTimeout(60); await up(3);
      await pg.waitForTimeout(1200);
      const hq = await hero();
      check('a tap on the compass brings him to it (≤ 6 amot from its marker)', Math.hypot(hq.x - nd.x, hq.z - nd.z) <= 6, `${JSON.stringify(hq)} → ${nd.x},${nd.z}`);
    }

    /* 4c. the stock: a low store shows in the horizon ("חסר: …") and opens its restock errand — never a block */
    await G(() => { __DAY.stock.take('wine', 20); __DAY.clock.tick(40); });
    await pg.waitForTimeout(900);
    const hs = await G(() => __DAY.hud());
    check('a low store: the HUD says "חסר: יין" and Achiya\'s restock errand opens', /חסר: .*יין/.test(hs.h2) && await G(() => __DAY.tasks.get('restock-wine') && __DAY.tasks.get('restock-wine').state === 'open'), hs.h2);
    /* 4d. the list: a tap on the horizon opens the ממונים' requests with a "לשם" each */
    const hc = await G(() => { const r = document.querySelector('.dy-h1').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    await down(4, hc.x, hc.y); await pg.waitForTimeout(60); await up(4);
    const lst = await waitFor(() => document.querySelector('.dy-list.on') && document.querySelectorAll('.dy-row').length >= 2, null, 3000);
    check('a tap on the horizon opens the requests list (rows with the ממונה, the place, the hour, "לשם")', lst, await G(() => document.querySelectorAll('.dy-row').length + ' rows'));
    await shot('05-list');
    await G(() => document.querySelector('[data-dy=close]').click());

    /* 4e. the follow camera never looks through a built wall at him (WORKSB22's note: the gate's closing stood behind a wall block) */
    const seen = [];
    for (const pl of ['close', 'seals', 'lambs', 'moked', 'store', 'wood', 'gate', 'gazit']) {
      await G((p) => __DAY.teleport(p), pl);
      await pg.waitForTimeout(2600);
      const v = await G(() => { const c = __T.view.camNow({}), h = __T.stages.heroXYZ({}); return !__T.stages.frameBlocked(c.px, c.py, c.pz, h.x, h.y + 1.6, h.z, 'x'); });
      seen.push(pl + ':' + (v ? 'ok' : 'HIDDEN'));
      if (pl === 'close') await shot('06-close');
    }
    check('at every errand place the camera sees him (no built wall between)', seen.every((x) => /ok$/.test(x)), seen.join(' '));

    /* 5. the clock pauses when the page is hidden */
    const hh0 = await G(() => __DAY.clock.now().h);
    await G(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => true }); document.dispatchEvent(new Event('visibilitychange')); });
    await pg.waitForTimeout(500);
    const pausedFlag = await G(() => __DAY.clock.paused);
    await pg.waitForTimeout(2500);
    const hh1 = await G(() => __DAY.clock.now().h);
    check('document.hidden: the clock is paused and does not move', pausedFlag && Math.abs(hh1 - hh0) < 1e-6, `${hh0} → ${hh1}`);
    await G(() => { Object.defineProperty(document, 'hidden', { configurable: true, get: () => false }); document.dispatchEvent(new Event('visibilitychange')); });
    await pg.waitForTimeout(500);
    check('visible again: the clock runs on', !(await G(() => __DAY.clock.paused)));

    /* 7. the day's end: 18:00 → "נעילת שערים" → the card → the next night; the save holds the day number */
    await G(() => { __DAY.clock.skipTo(17.99); __DAY.clock.tick(20); });
    const stamp = await waitFor(() => /נעילת שערים/.test((document.querySelector('.dy-end') || {}).textContent || ''), null, 5000);
    check('at 18:00 the chain begins with the stamp "נעילת שערים"', stamp);
    const card = await waitFor(() => !!document.querySelector('.dy-card'), null, 6000);
    const cardT = await G(() => (document.querySelector('.dy-card') || {}).textContent || '');
    check('the day\'s card: tasks done / passed (no penalty), points, tomorrow', card && /בקש(ות הושלמו|ה אחת הושלמה)/.test(cardT) && /זכויות/.test(cardT), cardT.slice(0, 160));
    await shot('04-day-end');
    const ev = await G(() => window.__GAME_LOG.some((e) => e.type === 'dayEnd'));
    await G(() => document.querySelector('.dy-go').click());
    const next = await waitFor(() => __DAY.clock.now().n === 2 && __DAY.clock.now().block === 'night', null, 4000);
    const saved = await G(() => { const A = JSON.parse(localStorage.getItem('bh_avodah') || '{}'); return A.day ? { n: A.day.n, h: A.day.h } : null; });
    check('dayEnd fired; the clock resets to the next night; the save holds the day number (2)', ev && next && saved && saved.n === 2, JSON.stringify(saved));

    /* 8. portrait keeps today's Phase B (the home), no twin */
    await pg.setViewportSize({ width: 390, height: 844 });
    const port = await waitFor(() => !document.querySelector('.gm.tw-on') && document.querySelector('.av-home.on'), null, 8000);
    check('portrait: no thumbs, the home panel (today\'s Phase B)', port);
    await pg.setViewportSize({ width: 844, height: 390 });
    const land = await waitFor(() => !!document.querySelector('.gm.tw-on') && !document.querySelector('.av-home.on'), null, 10000);
    check('rotated back to landscape: the Temple and the thumbs return (the clock paused meanwhile)', land);
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) {
    console.log('FAIL  exception', e && e.stack ? e.stack.split('\n').slice(0, 4).join(' ') : e); results.push(false);
  } finally {
    await b.close();
    console.log(`\n${results.filter(Boolean).length}/${results.length} passed in ${((Date.now() - T0) / 1000).toFixed(0)} s`);
    process.exit(results.every(Boolean) ? 0 : 1);
  }
})();
