// (TWIN17, wave 17) Two thumbs at the Mount in LANDSCAPE, by REAL touch (CDP Input.dispatchTouchEvent, two fingers at once) at
// 844×390 on dist/test.html — docs/WAVE17-BRIEF.md "test/twin-touch.cjs":
//   part 1 (the rocks): twin turns on (.gm.tw-on, the 'twin' event); a left drag walks him ≥ 6 amot the drag's way and the release
//     stops him; his feet on the ground (± 0.1); he never passes into a rock; while he walks his screen point stays in the middle
//     third; by a rock the right button wakes (⛏) and a tap strikes; the four answers land within 50 ms of the touch; the pips
//     empty after 3 taps and refill; the first action within 10 s of entering; both thumbs at once (walk + tap).
//   part 2 (the courses): the deal becomes markers in the world (no .gm-deal.on); he is walked to a marker by the stick, the button
//     takes its icon, a tap starts the job and taps alone finish it (no .fx-mg, no .gm-deal.on while working, a float at the end);
//     cam 'director' brings workFrame back; portrait (390×844) shows no twin control.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/twin-touch.cjs [--part=1|2|all] [--no-build] [--shots]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/twin');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), PART = (args.find((a) => a.startsWith('--part=')) || '--part=all').slice(7);
const W = 844, H = 390;
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    const warns = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); if (m.type() === 'warning') warns.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      window.__MG_SEEN = []; window.__DEAL_SEEN = 0; window.__MG_VIS = 0; window.__HANDS_LOG = [];
      { let hv = null; Object.defineProperty(globalThis, '__HANDS', { configurable: true, get: () => hv, set: (v) => { hv = v; window.__HANDS_LOG.push(v ? `${v.kind}:${v.twin ? 'twin' : 'canvas'}` : 'null'); } }); }
      setInterval(() => { const m = document.querySelector('.fx-mg'); if (m && m.classList.contains('on')) window.__MG_VIS++; }, 100);
      new MutationObserver((ms) => { for (const m of ms) { for (const n of m.addedNodes) if (n.classList && n.classList.contains('fx-mg')) window.__MG_SEEN.push((n.dataset && n.dataset.kind) || '?'); if (m.type === 'attributes' && m.target.classList && m.target.classList.contains('gm-deal') && m.target.classList.contains('on')) window.__DEAL_SEEN++; } }).observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
      window.__POPS = []; window.__JXS = 0; setInterval(() => { if (document.querySelector('.jx-s.on')) window.__JXS++;   /* (the juice result's stars over the work: the twin path's end, juice18) */ for (const f of document.querySelectorAll('.gm-float, .fx-pop, .jx-n'))   /* ── juice18 ── (.jx-n: juice.hit's words and numbers, contract 3) ── /juice18 ── */ if (f.textContent && getComputedStyle(f).opacity !== '0' && !window.__POPS.includes(f.textContent)) window.__POPS.push(f.textContent); }, 80);
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const cdp = await ctx.newCDPSession(pg);
    // (real touch: every live finger in each event, as a phone sends it)
    const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
    // (CDP: a point missing from the next event is released — a touchMove with the fingers that stay; touchEnd when none stays)
    const up = async (id) => { const f = fingers.get(id); fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); return f; };
    const tap = async (x, y) => { await down(9, x, y); await pg.waitForTimeout(60); await up(9); };
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/twin/' + name + '.png');
      await G(() => { window.__HUD_HOLD = false; });
    };
    const heroAt = () => G(() => { const S = __T.stages, p = S.heroXYZ({}), q = __T.view.project(p.x, p.y + 1.6, p.z); return { x: p.x, y: p.y, z: p.z, g: S.groundAt(p.x, p.z), sx: Math.round(q.x), sy: Math.round(q.y), on: !!q.on }; });
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width }; });
    /* the opening: a tap skips it */
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cb = cine && await cine.boundingBox();
    if (cb) await tap(cb.x + cb.width / 2, cb.y + cb.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);

    if (PART === '1' || PART === 'all') {
      /* the fixture: the Mount's rocks after the tutorial (a named player; the dig paid; every rock standing) */
      const B = await G(() => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; __T.game.ui.coach(null, '');
        g.st.har = { p: 'dig', n: __T.game._.siteStones('har'), dp: 1, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
        g.focus = 'har'; g.crews = []; __T.game._.resync();
        const bs = __T.stages.boulderSpots();
        return { i: 4, bs: bs.map((b) => [+b[0], +b[1], +b[2] || 8]) };
      });
      await G(() => { if (window.__TWIN) { __TWIN.force(false); setTimeout(() => __TWIN.force(null), 400); } });   // (a fresh entry for "the first action within 10 s")
      await pg.waitForTimeout(500);
      const on = await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 8000);
      await G((i) => __T.stages.hero.place({ boulder: i }), B.i);   // (the rock for the strike: he stands at it — the game no longer walks him back under two thumbs)
      check('landscape at the Mount: twin ON (.gm.tw-on and the "twin" event)', on && await G(() => window.__GAME_LOG.some((e) => e.type === 'twin' && e.d.on)));
      const zones = await G(() => { const r = (s) => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: Math.round(b.left), t: Math.round(b.top), w: Math.round(b.width), h: Math.round(b.height) }; }; return { zone: r('.tw-zone'), btn: r('.tw-btn'), hand: r('.tw-hand') }; });
      check('the stick\'s zone is the left 45% from 35% of the height; the work button ≥ 44 px at the bottom right', zones.zone && zones.zone.l === 0 && Math.abs(zones.zone.w - W * 0.45) < 3 && Math.abs(zones.zone.t - H * 0.35) < 3 && zones.btn && zones.btn.w >= 44 && zones.btn.l > W - 240 && zones.btn.t > H - 220 && zones.hand && zones.hand.w >= 44, JSON.stringify(zones));
      await pg.waitForTimeout(1200);
      const spec0 = await G(() => __TWIN.spec());
      check('by a rock the right button wakes with the rock\'s act (⛏)', !!spec0 && spec0.job === 'rock' && await G(() => document.querySelector('.tw-btn').classList.contains('awake')), JSON.stringify(spec0));
      /* the right tap by the rock strikes: the four answers within 50 ms; the pips empty after 3 and refill */
      const bc = await btnC();
      const n0 = await G(() => window.__GAME_LOG.filter((e) => e.type === 'stroke' || e.type === 'boulder' || e.type === 'strike').length);
      const tFirst = Date.now();
      const tP0 = await G(() => (window.__GAME_LOG[window.__GAME_LOG.length - 1] || { t: 0 }).t + 1);
      await down(2, bc.x, bc.y); await pg.waitForTimeout(50); await up(2);
      for (let k = 0; k < 2; k++) { await pg.waitForTimeout(120); await down(2, bc.x, bc.y); await pg.waitForTimeout(40); await up(2); }   // (three quick touches: the pips)
      const p3 = await G(() => __TWIN.pips());
      // ── crafta19 ── (FUN19 §2, binding: "one touch, one act you can see … the number comes last") the touch is his fall; the four
      // answers (dust · the "+N" · shake+buzz · sound: juice.hit) come together at the impact ≈ 90 ms after it — never at the touch-down
      await waitFor((t) => window.__GAME_LOG.some((e) => e.type === 'craftAct' && e.t >= t), tP0, 3000);
      const ca = await G((t) => { const e = window.__GAME_LOG.find((x) => x.type === 'craftAct' && x.t >= t); return e ? e.d : null; }, tP0);
      check('a tap on the work button: his fall at once, the four answers at the impact (≤ 400 ms after the touch here; juice.hit: dust · "+N" · shake+buzz · sound)', !!ca && ca.lag != null && ca.lag <= 400, JSON.stringify(ca) + ' (≈ 90 ms + 2–4 SwiftShader frames here; craft-feel.cjs holds the feel to ≤ 200)');
      // ── /crafta19 ──
      const firstS = await G(() => { const L = window.__GAME_LOG, a = [...L].reverse().find((e) => e.type === 'twin' && e.d.on), w = a && L.find((e) => e.t >= a.t && (e.type === 'twinWork' || e.type === 'twinWalk')); return a && w ? (w.t - a.t) / 1000 : null; });
      check('the first action within 10 s of entering (twin on → the first work)', firstS != null && firstS <= 10, `${firstS == null ? '—' : firstS.toFixed(1)} s`);
      const pMin = await G(() => Math.min(9, ...window.__GAME_LOG.filter((e) => e.type === 'twinPips').slice(-4).map((e) => e.d.n)));
      // (a loaded machine stretches the three touches past the refill's wait (0.7 s): then each touch taking its pip is the check)
      const pTook = await G((t) => window.__GAME_LOG.filter((e) => e.type === 'twinPips' && e.t >= t && !e.d.dry && e.d.n < 3).length, tP0);
      // ── crafta19 ── (PIP_WAIT 700 → 300: at the rhythm's ≈ 1 act a second the pips never run dry — a touch that does nothing is the bug —
      // so under the CDP's own pace each strike takes its pip and they refill; a mash still dries them) ── /crafta19 ──
      check('three taps empty the pips', p3 === 0 || pMin === 0 || pTook >= 2, `pips ${p3} · ${await G(() => window.__GAME_LOG.filter((e) => /^twin(Btn|Pips|Grade|Work)$/.test(e.type)).slice(-10).map((e) => e.type + JSON.stringify(e.d)).join(' '))}`);
      const struck = await waitFor((n) => window.__GAME_LOG.filter((e) => e.type === 'stroke' || e.type === 'boulder' || e.type === 'strike').length > n, n0, 9000);
      check('the right tap by a rock strikes it (the game\'s stroke)', struck, await G(() => window.__GAME_LOG.filter((e) => e.type === 'stroke' || e.type === 'boulder').slice(-2).map((e) => e.type + JSON.stringify(e.d)).join(' ')));
      const refill = await waitFor(() => __TWIN.pips() === 3, null, 4000);
      check('the pips refill (≈ 1 s)', refill, `pips ${await G(() => __TWIN.pips())}`);
      await shot('1-rock');
      /* the walk: a left drag away from the rock (on screen), held ~2.5 s; the release stops him */
      await pg.waitForTimeout(1500);   // (the strike's swing ends)
      const h0 = await heroAt();
      const rock = await G((i) => { const s = __T.stages.boulderSpots()[i]; const q = __T.view.project(+s[0], __T.stages.groundAt(+s[0], +s[1]) + 2, +s[1]); return { x: q.x, y: q.y }; }, B.i);
      let ddx = h0.sx - rock.x, ddy = h0.sy - rock.y; const dl = Math.hypot(ddx, ddy) || 1; ddx /= dl; ddy /= dl;
      const sx = 190, sy = 300;
      await down(1, sx, sy);
      for (let k = 1; k <= 4; k++) { await move(1, sx + ddx * 15 * k, sy + ddy * 15 * k); await pg.waitForTimeout(30); }
      const samples = []; const t1 = Date.now();
      while (Date.now() - t1 < 2600) { await pg.waitForTimeout(250); samples.push(await heroAt()); }
      const h1 = await heroAt();
      await up(1);
      await pg.waitForTimeout(700);
      const h2 = await heroAt(); await pg.waitForTimeout(400); const h3 = await heroAt();
      const walked = Math.hypot(h1.x - h0.x, h1.z - h0.z);
      // (the way he went, on screen: both points through the camera as it is now)
      const way = await G(([a, b]) => { const p = __T.view.project(a.x, a.y, a.z), px = p.x, py = p.y, q = __T.view.project(b.x, b.y, b.z); return { dx: q.x - px, dy: q.y - py }; }, [h0, h1]);
      const ang = Math.abs(Math.atan2(way.dx * ddy - way.dy * ddx, way.dx * ddx + way.dy * ddy)) * 180 / Math.PI;
      check('a left drag walks him ≥ 6 amot the drag\'s way (on screen, within 40°)', walked >= 6 && ang <= 40, `walked ${walked.toFixed(1)} amot · off ${ang.toFixed(0)}°`);
      check('the release stops him', Math.hypot(h3.x - h2.x, h3.z - h2.z) < 0.3, `after release ${Math.hypot(h3.x - h2.x, h3.z - h2.z).toFixed(2)}`);
      const gerr = Math.max(...samples.map((s) => Math.abs(s.y - s.g)));
      check('his feet on the ground while he walks (± 0.1)', gerr <= 0.1, `max |y − ground| ${gerr.toFixed(3)} over ${samples.length}`);
      const mid = samples.filter((s) => s.on && s.sx > W / 3 && s.sx < 2 * W / 3 && s.sy > H / 3 - 20 && s.sy < 2 * H / 3 + 20);
      check('while he walks his screen point stays in the middle third', samples.length >= 5 && mid.length >= samples.length - 1, `${mid.length}/${samples.length} · ${samples.map((s) => `${s.sx},${s.sy}`).slice(0, 6).join(' ')}`);
      await shot('2-walk');
      /* the rock: walked straight into the nearest standing rock for 2.5 s — he never passes into it */
      const near = await G((bs) => { const p = __T.stages.heroXYZ({}); let bi = -1, bd = 1e9; const st = __T.stages.boulders; bs.forEach((b, i) => { if (!(st[i] > 0)) return; const d = Math.hypot(p.x - b[0], p.z - b[1]); if (d < bd) { bd = d; bi = i; } }); return { bi, bd }; }, B.bs);
      const rk = B.bs[near.bi];
      let minD = 1e9;
      { const hr = await heroAt(); const q = await G((r) => __T.view.project(r[0], __T.stages.groundAt(r[0], r[1]) + 1, r[1]), rk); const vx = q.x - hr.sx, vy = q.y - hr.sy, vl = Math.hypot(vx, vy) || 1;
        await down(1, sx, sy); for (let k = 1; k <= 4; k++) { await move(1, sx + vx / vl * 15 * k, sy + vy / vl * 15 * k); await pg.waitForTimeout(30); }
        const t2 = Date.now(); while (Date.now() - t2 < 3200) { await pg.waitForTimeout(200); const p = await heroAt(); minD = Math.min(minD, Math.hypot(p.x - rk[0], p.z - rk[1])); }
        await up(1); }
      check('walking into a rock, he stops at its side (never inside it)', minD >= rk[2] * 0.85, `closest ${minD.toFixed(1)} amot to a rock of r ${rk[2].toFixed(1)} (from ${near.bd.toFixed(1)})`);
      /* both thumbs at once: the left walks while the right taps */
      await pg.waitForTimeout(600);
      const hb = await heroAt(), bc2 = await btnC();
      const away = await G((r) => { const p = __T.stages.heroXYZ({}), a = __T.view.project(p.x, p.y, p.z), ax = a.x, ay = a.y, q = __T.view.project(r[0], __T.stages.groundAt(r[0], r[1]), r[1]); const vx = ax - q.x, vy = ay - q.y, l = Math.hypot(vx, vy) || 1; return [vx / l, vy / l]; }, rk);
      await down(1, sx, sy); for (let k = 1; k <= 4; k++) { await move(1, sx + away[0] * 15 * k, sy + away[1] * 15 * k); await pg.waitForTimeout(30); }
      await down(2, bc2.x, bc2.y); await pg.waitForTimeout(60);
      const fb2n = await G(() => __TWIN.fb().n); await up(2);
      await pg.waitForTimeout(900);
      const hc = await heroAt(); await up(1);
      { const t5 = await G(() => performance.now() - 2500); const ev = await G((t) => window.__GAME_LOG.filter((e) => e.t >= t && /^twin|stroke|boulder|moment|card/.test(e.type)).map((e) => e.type + JSON.stringify(e.d)).join(' '), t5); console.log('   both thumbs: ' + ev.slice(0, 600)); }
      check('two thumbs at once: the left keeps walking while the right touches', Math.hypot(hc.x - hb.x, hc.z - hb.z) > 2 && await G(() => window.__GAME_LOG.some((e) => e.type === 'twinBtn')), `walked ${Math.hypot(hc.x - hb.x, hc.z - hb.z).toFixed(1)} · fb ${fb2n}`);
      /* the pinch on the free canvas zooms out; a touch on the stick brings the camera back to him */
      { const z0 = await G(() => __TWIN.cam().zoom);
        await down(3, 560, 150); await down(4, 640, 170); for (let k = 1; k <= 6; k++) { await move(3, 560 + k * 6, 150 + k * 2); await move(4, 640 - k * 6, 170 - k * 2); await pg.waitForTimeout(40); }
        await up(4); await up(3); await pg.waitForTimeout(900);
        const z1 = await G(() => __TWIN.cam().zoom);
        await down(1, sx, sy); await pg.waitForTimeout(120); await up(1); await pg.waitForTimeout(1500);
        const z2 = await G(() => __TWIN.cam().zoom);
        check('a pinch on the free canvas zooms out; a touch on the stick brings the camera back to him', z1 > z0 * 1.3 && z2 < z1 * 0.8, `zoom ${z0.toFixed(2)} → ${z1.toFixed(2)} → ${z2.toFixed(2)}`); }
      /* "יד של אומן" charged (by good work — here the test charges it): it glows; a tap = a guaranteed perfect strike: the gold flash, "מושלם!" */
      { await G(() => __TWIN.charge()); await pg.waitForTimeout(300);
        const glow = await G(() => document.querySelector('.tw-hand').classList.contains('ready'));
        const nb = await G(() => { const p = __T.stages.heroXYZ({}), bs = __T.stages.boulderSpots(), st = __T.stages.boulders; let bi = -1, bd = 1e9; bs.forEach((b, i) => { if (!(st[i] > 0)) return; const d = Math.hypot(p.x - b[0], p.z - b[1]); if (d < bd) { bd = d; bi = i; } }); if (bi >= 0) __T.stages.hero.place({ boulder: bi }); return bi; });
        await pg.waitForTimeout(1200);
        const hb2 = await G(() => { const r = document.querySelector('.tw-hand').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        const n0 = await G(() => window.__GAME_LOG.filter((e) => e.type === 'strike' && e.d.perfect).length);
        await tap(hb2.x, hb2.y);
        const perf = await waitFor((n) => window.__GAME_LOG.filter((e) => e.type === 'strike' && e.d.perfect).length > n, n0, 9000);
        await pg.waitForTimeout(400);
        check('"יד של אומן": glows when charged; a tap strikes a perfect stroke (the gold flash and a big "מושלם!")', glow && perf && await G(() => window.__POPS.includes('מושלם!')), `glow ${glow} · rock ${nb} · perfect ${perf} · pops ${(await G(() => window.__POPS.slice(-4))).join('|')}`); }
      /* the next work off the screen: an arrow at the edge */
      { await G(() => { const p = __T.stages.heroXYZ({}); __T.stages.hero.place({ x: p.x - 60, z: p.z + 5 }); }); await pg.waitForTimeout(1500);
        const ga = await G(() => __TWIN.goal()); check('the next work off the screen gets an arrow at the edge', ga, `${ga}`); }
      check('[part 1] no .fx-mg sheet and no .gm-deal.on', await G(() => !window.__MG_SEEN.length && !document.querySelector('.gm-deal.on')), await G(() => window.__MG_SEEN.join(',')));
    }

    if (PART === '2' || PART === 'all') {
      /* the fixture: the Mount's courses at stone 4 (as game-courses-touch part 1 after the first great stone), the deal on the table */
      await G(() => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        g.st.har = { p: 'courses', n: __T.game._.siteStones('har'), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 2 };
        g.focus = 'har'; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = [];
        g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: { har: 2 }, sig: { har: 1 }, best: {} };
        __T.game._.resync();
      });
      const marks = await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'dealShown' && e.d.twin) && __TWIN.marks().length > 0, null, 20000);
      const ds = await G(() => { const e = [...window.__GAME_LOG].reverse().find((x) => x.type === 'twinDeal'); return e && e.d; });
      check('the deal becomes markers in the world (no .gm-deal sheet)', marks && !(await G(() => !!document.querySelector('.gm-deal.on'))), JSON.stringify(ds));
      { let hs = await heroAt(); for (let k = 0; k < 12 && !(hs.sx > W / 3 && hs.sx < 2 * W / 3 && hs.sy > H / 3 - 20 && hs.sy < 2 * H / 3 + 20); k++) { await pg.waitForTimeout(300); hs = await heroAt(); }
        check('the follow camera holds him in the middle third at his work (after the game placed him there)', hs.sx > W / 3 && hs.sx < 2 * W / 3 && hs.sy > H / 3 - 20 && hs.sy < 2 * H / 3 + 20, `${hs.sx},${hs.sy} · at ${Math.round(hs.x)},${Math.round(hs.z)}`); }
      if (!marks) console.log('   diag: ' + JSON.stringify(await G(() => ({ want: __T.game.loop.want(), deal: __T.game.loop.deal(), busy: __T.game.busy, uiBusy: __T.game.ui.busy, on: __TWIN.on(), job: __T.game.loop.busy(), log: window.__GAME_LOG.slice(-14).map((e) => e.type + (e.d && e.d.id ? ':' + e.d.id : '')) }))));
      await shot('3-marks');
      /* two jobs, each as a child plays it: walk to its marker by the stick (drag toward it on screen until the button takes its icon),
         a tap starts it, taps alone finish it */
      const played = [];
      for (let round = 0; round < 2; round++) {
        const tag = `[job ${round + 1}]`;
        // (the next deal comes once the cards over the world are closed — the first wage's: its button first, as she would)
        if (round) { const n0 = await G(() => window.__GAME_LOG.filter((x) => x.type === 'twinDeal').length); const tw = Date.now();
          while (Date.now() - tw < 25000 && !(await G((n) => { const d = [...window.__GAME_LOG].reverse().find((x) => x.type === 'twinDeal'); return window.__GAME_LOG.filter((x) => x.type === 'twinDeal').length > n && d && d.d.marks.length; }, n0))) {
            const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (m) { const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); }
            await pg.waitForTimeout(400);
          } }
        const pickT = () => G((pl) => { const e = [...window.__GAME_LOG].reverse().find((x) => x.type === 'twinDeal'), dd = e && e.d; return dd && dd.marks && (dd.marks.find((m) => !pl.includes(m.job) && m.job !== 'key') || dd.marks.find((m) => !pl.includes(m.job)) || dd.marks[0]); }, played);
        let target = await pickT();
        let woke = null; const sx = 190, sy = 300;
        if (target) {
          const t3 = Date.now(); let fdown = false;
          while (Date.now() - t3 < 25000) {
            target = (await pickT()) || target;   // (a new deal while he walks: the marker he sees now)
            const sp = await G(() => __TWIN.spec()); if (sp && sp.job === target.job) { woke = sp; break; }
            { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (m) { if (fdown) { await up(1); fdown = false; } const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(500); continue; } }   // (a card over the world: its button first, as she would)
            const hr = await heroAt(); const q = await G((m) => __T.view.project(m.x, __T.stages.groundAt(m.x, m.z) + 1, m.z), target);
            let vx = q.x - hr.sx, vy = q.y - hr.sy; const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
            if (vl < 12) { if (fdown) { await up(1); fdown = false; } await pg.waitForTimeout(200); continue; }
            if (!fdown) { await down(1, sx, sy); fdown = true; }
            await move(1, sx + vx * 55, sy + vy * 55);
            await pg.waitForTimeout(220);
          }
          if (fdown) await up(1);
        }
        check(`${tag} the stick walks him to a marker and the work button takes its job`, !!woke, `${target && target.job} · ${JSON.stringify(woke)}`);
        if (!woke) console.log('   probe: ' + JSON.stringify(await G(() => __TWIN.probe())) + ' · now ' + Math.round(await G(() => performance.now())));
        if (!woke) console.log('   diag: ' + JSON.stringify(await G((t) => { const h = __T.stages.heroXYZ({}), gh = __T.game._.hero; return { tw: __T.game._.twin && __T.game._.twin(), spec: __TWIN.spec(), on: __TWIN.on(), hold: document.querySelector('.gm.tw-hold') ? 1 : 0, hero: [Math.round(h.x), Math.round(h.z)], target: t, busy: gh.busy, cur: !!gh.cur, job: __T.game.loop.busy(), deal: __T.game.loop.deal(), uiBusy: __T.game.ui.busy, log: window.__GAME_LOG.slice(-16).map((e) => e.type) }; }, target)));
        if (!woke) break;
        played.push(woke.job);
        const bc = await btnC();
        const pre = await G(() => { const h = __T.stages.heroXYZ({}); return { spec: __TWIN.spec(), h: [Math.round(h.x), Math.round(h.z)] }; });
        await tap(bc.x, bc.y);
        const started = await waitFor((j) => window.__GAME_LOG.some((e) => e.type === 'jobStart' && e.d.job === j), woke.job, 8000);
        check(`${tag} a tap on the button starts the job`, started, woke.job);
        if (!started) console.log('   dbg: ' + JSON.stringify(pre) + ' ' + JSON.stringify(await G(() => ({ tw: __T.game._.twin && __T.game._.twin(), log: window.__GAME_LOG.slice(-12).map((e) => e.type + (e.type === 'jobStart' || e.type === 'jobPick' ? ':' + e.d.job : '')), dbg: __TWIN.dbg().slice(-6) }))));
        // (the job by taps alone: the button every ~0.45 s, as a beginner would)
        const jxs0 = await G(() => window.__JXS | 0);   // (the stars seen before this job)
        let taps = 0, dealOnWork = false; const t4 = Date.now();
        while (Date.now() - t4 < 90000) {
          if (await G((j) => window.__GAME_LOG.some((e) => e.type === 'jobDone' && e.d.job === j), woke.job)) break;
          if (await G(() => !!document.querySelector('.gm-deal.on'))) dealOnWork = true;
          const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (m) { const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(400); continue; }
          await tap(bc.x, bc.y); taps++;
          await pg.waitForTimeout(450);
        }
        const jd = await G((j) => { const e = window.__GAME_LOG.find((x) => x.type === 'jobDone' && x.d.job === j); return e && e.d; }, woke.job);
        check(`${tag} taps alone finish the job (it builds and pays)`, !!jd && jd.stars >= 1, `${taps} taps · ${JSON.stringify(jd && { job: jd.job, q: jd.q, stars: jd.stars, coins: jd.coins, stones: jd.stones, skipped: jd.skipped })}`);
        check(`${tag} while working: no .fx-mg sheet, no .gm-deal.on`, await G(() => !window.__MG_SEEN.length) && !dealOnWork, `mg ${await G(() => window.__MG_SEEN.join(','))} · deal ${dealOnWork}`);
        await pg.waitForTimeout(600);
        if (round === 0) { check(`${tag} the end is a float over the work, the juice's stars, or the strike card's toast (★ · מטבעות)`, await G((j0) => window.__POPS.some((t) => /★/.test(t) && /מטבעות/.test(t)) || window.__JXS > j0 || !!document.querySelector('.gm-toast'), jxs0), (await G(() => window.__POPS.slice(-6))).join(' | ')); await shot('4-job'); }
      }
      /* cam 'director': today's frames come back (workFrame / dealFrame fly the camera) */
      await G(() => { const s = __T.game.settings(); s.cam = 'director'; window.__GAME_LOG.push({ t: performance.now(), type: 'T-director', d: {} }); });
      await pg.waitForTimeout(800);
      const dir = await G(() => !__TWIN.cam().on);
      await G(() => { __T.game._.resync(); });
      const wf = await waitFor(() => { const i = window.__GAME_LOG.findIndex((e) => e.type === 'T-director'); return window.__GAME_LOG.slice(i).some((e) => e.type === 'workFrame' || e.type === 'dealFrame' || e.type === 'heroAim'); }, null, 12000);
      check('cam "director": the follow camera lets go and workFrame comes back', dir && wf, `follow off ${dir} · frames ${wf}`);
      if (!wf) console.log('   diag: ' + JSON.stringify(await G(() => ({ on: __TWIN.on(), cam: __TWIN.cam(), log: window.__GAME_LOG.slice(-14).map((e) => e.type + (e.d && e.d.on != null ? ':' + e.d.on : '')) }))));
      await G(() => { __T.game.settings().cam = 'follow'; });
    }
    if (PART === '3' || PART === '34' || PART === 'all') {
      /* (fix round, the supervisor's kid17: "stuck at the bench" at set 21) the courses after the first wage: from his banker, the stick
         pushed 1 s in 8 directions moves him in at least 6 of them */
      { const P3 = +(args.find((x) => x.startsWith('--p3set=')) || '--p3set=0').slice(8); if (P3) await G((n) => { window.__P3SET = n; }, P3); }
      await G(() => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        g.st.har = { p: 'courses', n: __T.game._.siteStones('har'), dp: 1, paid: 999, set: window.__P3SET || 21, k: 0, fp: 0, fd: 0, keys: { 0: 0.9, 16: 0.9, 32: 0.9 }, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 2 };
        g.focus = 'har'; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
        __T.game._.resync();
      });
      await waitFor(() => window.__TWIN && __TWIN.on() && !document.querySelector('.gm.tw-hold') && !document.querySelector('.fx-mg.on'), null, 20000);
      await pg.waitForTimeout(2500);
      const bank = await G(() => { const w = __T.stages.workSpot('har', 'dress'); return { x: w.x, z: w.z, face: w.face }; });
      const res = []; const sx = 190, sy = 300;
      for (let k = 0; k < 8; k++) {
        const a = k * Math.PI / 4;
        await G((b) => __T.stages.hero.place({ x: b.x, z: b.z, face: b.face }), bank); await pg.waitForTimeout(300);
        const h0 = await heroAt();
        await down(1, sx, sy); for (let j = 1; j <= 4; j++) { await move(1, sx + Math.cos(a) * 15 * j, sy + Math.sin(a) * 15 * j); await pg.waitForTimeout(25); }
        await pg.waitForTimeout(1000);
        const h1 = await heroAt(); await up(1); await pg.waitForTimeout(250);
        const d = Math.hypot(h1.x - h0.x, h1.z - h0.z);
        const ev = await G(() => window.__GAME_LOG.slice(-8).map((e) => e.type + (e.d && e.d.why ? ':' + e.d.why : e.d && e.d.on != null ? ':' + e.d.on : '')).join(' '));
        res.push({ k, d: Math.round(d * 10) / 10, ev });
      }
      const moved = res.filter((r) => r.d >= 2).length;
      check('[courses] from his banker the stick moves him in ≥ 6 of 8 directions (1 s each)', moved >= 6, `${moved}/8 · ${res.map((r) => r.d).join(' ')} · banker ${Math.round(bank.x)},${Math.round(bank.z)}`);
      if (moved < 8) { for (const r of res) if (r.d < 2) console.log(`   dir ${r.k}: ${r.d} · ${r.ev}`); console.log('   dbg: ' + (await G(() => __TWIN.dbg())).join(' ')); }
      if (moved < 6) console.log('   diag: ' + JSON.stringify(await G((b) => { const S = __T.stages, g0 = S.groundAt(b.x, b.z), out = []; for (let k = 0; k < 16; k++) { const a = k * Math.PI / 8, row = []; for (const r of [0.45, 1, 2, 4, 8]) { const x = b.x + Math.cos(a) * r, z = b.z + Math.sin(a) * r; row.push(Math.round((S.groundAt(x, z) - g0) * 10) / 10 + (S.hero.free(x, z, b.x + Math.cos(a) * (r - 0.45), b.z + Math.sin(a) * (r - 0.45)) ? '' : 'X')); } out.push(row.join(',')); } return { g0, marks: __TWIN.marks(), spec: __TWIN.spec(), map: out }; }, bank)));
      const goalIn = await G(() => { const e = document.querySelector('.tw-goal'), z = document.querySelector('.tw-zone'); if (!e || !z) return null; const r = e.getBoundingClientRect(), q = z.getBoundingClientRect(); return r.width > 0 && r.left < q.right && r.right > q.left && r.top < q.bottom && r.bottom > q.top && getComputedStyle(e).display !== 'none' && !/-999/.test(e.style.transform); });
      check('[courses] the edge arrow never sits inside the stick\'s zone', !goalIn, `${goalIn}`);
    }
    if (PART === '4' || PART === '34' || PART === 'all') {
      /* (fix round, the supervisor's kid17: the first-time flow's special stone opened the crane as a sheet under two thumbs) from the dig's
         end through the first special stone: no .fx-mg — the crane is played in the world by the work button */
      await G(() => {
        const g = __T.game.state; g.ftue = 4; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        g.st.har = { p: 'courses', n: __T.game._.siteStones('har'), dp: 1, paid: 999, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 2 };
        g.focus = 'har'; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.jobs = null;
        window.__MG_SEEN.length = 0; window.__MG_VIS = 0; window.__P4 = true; __T.game._.resync();
      });
      await waitFor(() => window.__TWIN && __TWIN.on() && !document.querySelector('.gm.tw-hold'), null, 15000);
      await G(() => { const w = __T.stages.workSpot('har', 'dress'); if (w) __T.stages.hero.place({ x: w.x, z: w.z, face: w.face }); });   // (at his banker, as the first-time flow places him)
      await pg.waitForTimeout(1500);
      const L4 = await G(() => window.__GAME_LOG.length);
      const sp4 = await G(() => __TWIN.spec());
      let how = 'button';
      if (sp4 && sp4.job === 'key' && !args.includes('--card')) { const bc = await btnC(); await tap(bc.x, bc.y); } else { how = 'the card'; await G(() => { __T.game._.keyStone('har'); }); }   // (as the card's gold button; not awaited — it is the whole game)
      const inWorld = await waitFor(() => !!window.__HANDS && window.__HANDS.twin, null, 10000);
      let taps = 0; const t5 = Date.now();
      while (Date.now() - t5 < 60000 && !(await G((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'keyStone' && e.d.id === 'har'), L4))) {
        const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (m) { const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(400); continue; }
        const bc = await btnC(); await tap(bc.x, bc.y); taps++; await pg.waitForTimeout(450);
      }
      const ks = await G((n) => { const e = window.__GAME_LOG.slice(n).find((x) => x.type === 'keyStone' && x.d.id === 'har'); return e && e.d; }, L4);
      check('[first-time flow] the special stone (the crane) is played in the world by the work button: no .fx-mg, the stone set', inWorld && !!ks && await G(() => !window.__MG_SEEN.length && __T.game.state.st.har.keys[0] != null && !window.__MG_VIS), `started by ${how} (${sp4 && sp4.job}) · in the world ${inWorld} · ${taps} taps · ${JSON.stringify(ks)} · mg ${await G(() => window.__MG_SEEN.join(','))} · sheet-visible ${await G(() => window.__MG_VIS)} · hands ${await G(() => window.__HANDS_LOG.slice(-4).join(' '))} · twin ${await G(() => __TWIN.on())} · warn ${warns.slice(-3).join(' | ').slice(0, 300)}`);
    }
    if (PART === '5' || PART === 'all') {
      /* (second fix round, the supervisor's run: the course check's plumb came up as a sheet and locked the thumbs) a course's end under
         two thumbs: the check plays in the world by the work button, and the stick stays live meanwhile */
      await G(() => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        g.st.har = { p: 'courses', n: __T.game._.siteStones('har'), dp: 1, paid: 999, set: 32, k: 0, fp: 0, fd: 0, keys: { 0: 0.9, 16: 0.9 }, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 2 };
        g.focus = 'har'; g.crews = []; window.__MG_VIS = 0; __T.game._.resync();
      });
      await waitFor(() => window.__TWIN && __TWIN.on() && !document.querySelector('.gm.tw-hold'), null, 15000);
      await pg.waitForTimeout(1200);
      const L5 = await G(() => window.__GAME_LOG.length);
      await G(() => { __T.game._.doAction({ kind: 'check', id: 'har' }); });
      const inW = await waitFor(() => !!window.__HANDS && window.__HANDS.twin && window.__HANDS.kind === 'plumb', null, 10000);
      // the stick during the check
      const h0 = await heroAt(); await down(1, 190, 300); for (let j = 1; j <= 4; j++) { await move(1, 190, 300 - 15 * j); await pg.waitForTimeout(25); } await pg.waitForTimeout(1000); const h1 = await heroAt(); await up(1);
      const walked5 = Math.hypot(h1.x - h0.x, h1.z - h0.z);
      let taps = 0; const t6 = Date.now();
      while (Date.now() - t6 < 50000 && !(await G((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'check' && e.d.id === 'har'), L5))) {
        const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (m) { const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(400); continue; }
        const bc = await btnC(); await tap(bc.x, bc.y); taps++; await pg.waitForTimeout(450);
      }
      const ck = await G((n) => { const e = window.__GAME_LOG.slice(n).find((x) => x.type === 'check' && x.d.id === 'har'); return e && e.d; }, L5);
      check('[course check] in the world by the work button (no sheet), and the stick walks him meanwhile', inW && !!ck && walked5 >= 2 && await G(() => !window.__MG_VIS), `in the world ${inW} · walked ${walked5.toFixed(1)} · ${taps} taps · ${JSON.stringify(ck)} · sheet frames ${await G(() => window.__MG_VIS)} · dbg ${(await G(() => __TWIN.dbg().slice(-4))).join(' ')}`);
    }
    if (PART === '6' || PART === '67' || PART === 'all') {
      /* (TWIN18, contract 4) the timing ring on the work button: a touch on the gold = מושלם, off it = soft; ★★★ is earned */
      await G(() => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        g.st.har = { p: 'courses', n: __T.game._.siteStones('har'), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 4, insp: 0, w: 0, ph: 2 };
        g.focus = 'har'; g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
        g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: { har: { c: 0, n: 0, key: 1, re: 0, line: 1, deal: { cards: ['tread', 'strike'], key: null, quarry: false, set: 4, t: 1 } } }, deals: { har: 2 }, sig: { har: 1 }, best: {} };
        __T.game._.resync();
      });
      await waitFor(() => window.__TWIN && __TWIN.on() && !document.querySelector('.gm.tw-hold'), null, 15000);
      await pg.waitForTimeout(1500);
      await G(() => { const w = __T.stages.workSpot('har', 'dress'); if (w) __T.stages.hero.place({ x: w.x, z: w.z, face: w.face }); });
      const L6 = await G(() => window.__GAME_LOG.length);
      // (he walks to the treadwheel's marker by the stick)
      { const t8 = Date.now(); let fd = false; while (Date.now() - t8 < 15000 && !(await G(() => __TWIN.spec() && __TWIN.spec().job === 'tread'))) {
          const m = await G(() => { const e = [...window.__GAME_LOG].reverse().find((x) => x.type === 'twinDeal'); return e && e.d.marks.find((k) => k.job === 'tread'); }); if (!m) { await pg.waitForTimeout(300); continue; }
          const hr = await heroAt(); const q = await G((t) => __T.view.projectRaw(t.x, __T.stages.groundAt(t.x, t.z) + 1, t.z), m); let vx = q.x - hr.sx, vy = q.y - hr.sy; const vl = Math.hypot(vx, vy) || 1;
          if (!fd) { await down(1, 190, 300); fd = true; } await move(1, 190 + vx / vl * 55, 300 + vy / vl * 55); await pg.waitForTimeout(220); }
        if (fd) await up(1); }
      const bc = await btnC(); await tap(bc.x, bc.y);
      const craft = await waitFor(() => !!window.__HANDS && window.__HANDS.twin, null, 10000);
      // a touch timed to the gold, as a player does: read the ring, wait for its gold moment, touch
      const tapAtGold = async () => { const r = await G(() => __TWIN.ring()); if (!r.on || !r.cyc) return null; const left = (1 - r.u) * r.cyc * 1000; await pg.waitForTimeout(Math.max(0, left - 45)); await down(2, bc.x, bc.y); await pg.waitForTimeout(40); await up(2); return true; };
      const tapAtMid = async () => { const r = await G(() => __TWIN.ring()); if (!r.on || !r.cyc) return null; const toMid = ((1.5 - r.u) % 1) * r.cyc * 1000; await pg.waitForTimeout(Math.max(0, toMid - 45)); await down(2, bc.x, bc.y); await pg.waitForTimeout(40); await up(2); return true; };
      const ringOn = await waitFor(() => !!document.querySelector('.tw-pad.ring') && __TWIN.ring().on && !!__TWIN.ring().cyc, null, 3000);
      await shot('5-ring');
      for (let k = 0; k < 3; k++) { if (!(await tapAtGold())) { await tap(bc.x, bc.y); await pg.waitForTimeout(450); } }   // ── crafta19 ── (no ring: plain taps, steps in the wheel) ── /crafta19 ──
      if (!(await tapAtMid())) { await tap(bc.x, bc.y); await pg.waitForTimeout(600); }
      const gr = await G((n) => window.__GAME_LOG.slice(n).filter((e) => e.type === 'twinGrade').map((e) => e.d.g), L6);
      // ── crafta19 ── (FUN19 §2, binding: the ring is the RHYTHM crafts' and its grade the impact's — the treadwheel is graded by its pace,
      // so no ring rides its button; the ring's gold → "מושלם" at the impact is craft-feel.cjs's (rock, banker, dress)) ── /crafta19 ──
      check('[ring] the treadwheel (a pace craft) shows no timing ring; its strides are graded at their impact (twinGrade at: impact)', craft && !ringOn && gr.length > 0 && (await G((n) => window.__GAME_LOG.slice(n).filter((e) => e.type === 'twinGrade').every((e) => e.d.at === 'impact'), L6)), `ring ${ringOn} · grades ${gr.join(',')}`);
      // the job ends by taps; its quality follows the touches (never above their average)
      const t7 = Date.now(); while (Date.now() - t7 < 45000 && !(await G((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobDone'), L6))) { await tap(bc.x, bc.y); await pg.waitForTimeout(420); }
      const jd6 = await G((n) => { const e = window.__GAME_LOG.slice(n).find((x) => x.type === 'jobDone'); return e && e.d; }, L6);
      check('[ring] taps off the gold still finish the job (it builds and pays), below ★★★', !!jd6 && jd6.stars >= 1 && jd6.stars < 3, jd6 ? `q ${jd6.q} ★${jd6.stars}` : 'no jobDone');
    }
    if (PART === '7' || PART === '67' || PART === 'all') {
      /* (TWIN18, kid17) a world craft that refuses to begin (the treadwheel's crane busy, no open slot): under two thumbs the job is
         played at his hands — never its sheet over the job the thumb started */
      await G(() => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        g.st.har = { p: 'courses', n: __T.game._.siteStones('har'), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 4, insp: 0, w: 0, ph: 2 };
        g.focus = 'har'; g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
        g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: { har: { c: 0, n: 0, key: 1, re: 0, line: 1, deal: { cards: ['tread', 'strike'], key: null, quarry: false, set: 4, t: 7 } } }, deals: { har: 2 }, sig: { har: 1 }, best: {} };
        const T = __T.stages.craft && __T.stages.craft.tread; if (T) { window.__TB0 = T.begin; T.begin = () => ({ ok: false, why: 'test' }); }
        __T.game._.resync();
      });
      await waitFor(() => window.__TWIN && __TWIN.on() && !document.querySelector('.gm.tw-hold') && !(window.__HANDS && window.__HANDS.twin), null, 15000);
      await pg.waitForTimeout(1500);
      await G(() => { const w = __T.stages.workSpot('har', 'dress'); if (w) __T.stages.hero.place({ x: w.x, z: w.z, face: w.face }); });
      const L7 = await G(() => window.__GAME_LOG.length);
      { const t8 = Date.now(); let fd = false; while (Date.now() - t8 < 15000 && !(await G(() => __TWIN.spec() && __TWIN.spec().job === 'tread'))) {
          const m = await G(() => { const e = [...window.__GAME_LOG].reverse().find((x) => x.type === 'twinDeal'); return e && e.d.marks.find((k) => k.job === 'tread'); }); if (!m) { await pg.waitForTimeout(300); continue; }
          const hr = await heroAt(); const q = await G((t) => __T.view.projectRaw(t.x, __T.stages.groundAt(t.x, t.z) + 1, t.z), m); let vx = q.x - hr.sx, vy = q.y - hr.sy; const vl = Math.hypot(vx, vy) || 1;
          if (!fd) { await down(1, 190, 300); fd = true; } await move(1, 190 + vx / vl * 55, 300 + vy / vl * 55); await pg.waitForTimeout(220); }
        if (fd) await up(1); }
      // (contract 3) a stand-in juice: each touch on material is answered by juice.hit(kind, { at, text, perfect, combo, craft, quality })
      // (JUICE18's own juice when it is there: its hit is watched and passed on)
      await G(() => { window.__JH = []; const P = globalThis.__BH_PARTS || (globalThis.__BH_PARTS = {}); const rec = (k, o) => { window.__JH.push({ k, at: !!(o && o.at), text: o && o.text, perfect: !!(o && o.perfect), craft: o && o.craft, q: o && o.quality, keys: Object.keys(o || {}).join(',') }); };
        if (!P.juice) P.juice = { hit: rec, stub: true }; else if (typeof P.juice.hit === 'function') { const real = P.juice.hit; window.__JH0 = real; P.juice.hit = function (k, o) { rec(k, o); return real.call(this, k, o); }; } });
      if (args.includes('--diag')) console.log('   diag7 ' + JSON.stringify(await G((n) => ({ spec: __TWIN.spec(), hero: __T.stages.heroXYZ({}), deals: window.__GAME_LOG.slice(n).filter((e) => e.type === 'twinDeal').map((e) => e.d.marks), walk: window.__GAME_LOG.slice(n).filter((e) => /twinWalk|twinStick/.test(e.type)).slice(-3).map((e) => e.type + JSON.stringify(e.d)) }), L7)).slice(0, 900));
      const bc7 = await btnC(); await tap(bc7.x, bc7.y);
      const hands7 = await waitFor(() => !!window.__HANDS && window.__HANDS.twin, null, 10000);
      const wt7 = await G(() => ({ stub: !!window.__TB0, wheel: !!(__T.stages.tread && __T.stages.tread().on) }));
      let sheet7 = false; for (let k = 0; k < 8; k++) { sheet7 = sheet7 || await G(() => [...document.querySelectorAll('.fx-mg')].some((e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return r.width > 40 && r.height > 40 && cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05; })); await pg.waitForTimeout(250); }
      const t9 = Date.now(); while (Date.now() - t9 < 40000 && !(await G((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobDone'), L7))) { await tap(bc7.x, bc7.y); await pg.waitForTimeout(420); }
      const jd7 = await G((n) => { const e = window.__GAME_LOG.slice(n).find((x) => x.type === 'jobDone'); return e && e.d; }, L7);
      if (args.includes('--diag')) console.log('   diag7b ' + JSON.stringify(await G((n) => window.__GAME_LOG.slice(n).filter((e) => /^mg|jobPick|jobStart|jobDone|craft$|minigame/.test(e.type)).slice(0, 12).map((e) => e.type + JSON.stringify(e.d)), L7)).slice(0, 1400));
      await G(() => { const T = __T.stages.craft && __T.stages.craft.tread; if (T && window.__TB0) T.begin = window.__TB0; });
      const jh = await G(() => { const P = globalThis.__BH_PARTS; if (P && P.juice && P.juice.stub) delete P.juice; else if (P && P.juice && window.__JH0) P.juice.hit = window.__JH0; return window.__JH; });
      const jk = ['at', 'text', 'perfect', 'combo', 'craft', 'quality'];
      check('[juice.hit] each touch on the work calls juice.hit(kind, { at, text, perfect, combo, craft, quality }) — the craft by its trade', jh.length >= 3 && jh.every((h) => jk.every((k) => h.keys.split(',').includes(k)) && h.at) && jh.some((h) => h.k === 'craft' && h.craft), `${jh.length} hits · ${JSON.stringify(jh[0] || {}).slice(0, 160)}`);
      check('[refused craft] the treadwheel says no: the job is played at his hands by the button, no sheet, and it finishes', hands7 && wt7.stub && !wt7.wheel && !sheet7 && !!jd7, `hands ${hands7} · ${JSON.stringify(wt7)} · sheet ${sheet7} · ${jd7 ? `★${jd7.stars}` : 'no jobDone'}`);
    }
    if (PART === '2' || PART === 'all') {
        /* portrait: no twin control */
        await pg.setViewportSize({ width: 390, height: 844 });
        await pg.waitForTimeout(1200);
        const port = await G(() => ({ on: __TWIN.on(), cls: !!document.querySelector('.gm.tw-on'), vis: [...document.querySelectorAll('.tw-zone,.tw-pad,.tw-btn,.tw-mk')].some((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).display !== 'none'; }) }));
        check('portrait (390×844): no twin control', !port.on && !port.cls && !port.vis, JSON.stringify(port));
        await pg.setViewportSize({ width: W, height: H });
    }
    check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | ').slice(0, 300));
  } finally { await b.close(); }
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
