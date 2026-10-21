// (NAV19, wave 19) Moving him under two thumbs, by REAL touch (CDP Input.dispatchTouchEvent) at 844×390 on dist/test.html —
// docs/WAVE19-BRIEF.md "test/nav-touch.cjs" (the owner's notes 1, 3, 12, 16 and 01:31 "הרבה הליכות מיותרות"):
//   fresh  — a fresh save at the Mount: twin ON after the opening; the stick in 4 directions → he walks AND faces the drag's way (≤ 20°)
//   stick  — the stick in 8 directions at 3 camera bearings (the follow camera; a key moment's camera from another side; the opposite
//            side) and after a real pinch: the walk on the screen and his facing within 20° of the drag
//   over   — "מבט על": the button ≥ 56 px above the pips; a tap lifts the camera high over the site (markers out); a second tap brings
//            it back; the stick brings it back too, and walks him the drag's way right after
//   compass— away from his work, the edge compass is a button (≥ 44 px): a tap brings him to the work it points to in ≤ 1.5 s (a quick
//            walk with a dust trail, or a fade-and-appear when the way is long)
//   portrait — the phone turned with the overview on: two thumbs off at once, every control hidden
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/nav-touch.cjs [--part=fresh,stick,over,compass,walks,portrait] [--no-build] [--shots]
//     [--html=<path to another build, for a before/after>]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/nav');
const args = process.argv.slice(2);
const HTML = (args.find((a) => a.startsWith('--html=')) || '').slice(7) || path.join(ROOT, 'dist/test.html');
if (!args.includes('--no-build') && !args.some((a) => a.startsWith('--html='))) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), W = 844, H = 390;
const PARTS = ((args.find((a) => a.startsWith('--part=')) || '--part=fresh,stick,over,compass').slice(7)).split(',');
const has = (p) => PARTS.includes(p) || PARTS.includes('all');
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };
const deg = (r) => Math.round(r * 180 / Math.PI);
const adiff = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));

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
    await pg.goto('file://' + HTML);
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const cdp = await ctx.newCDPSession(pg);
    const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const tap = async (x, y) => { await down(9, x, y); await pg.waitForTimeout(60); await up(9); };
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/nav/' + name + '.png');
      await G(() => { window.__HUD_HOLD = false; });
    };
    const closeCards = async () => { for (let k = 0; k < 4; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) return; const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(450); } };
    const box = (sel) => G((s) => { const e = document.querySelector(s); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height, l: r.left, t: r.top, b: r.bottom, r: r.right }; }, sel);
    const here = () => G(() => { const p = __T.stages.heroXYZ({}); return { x: p.x, y: p.y, z: p.z, yaw: p.yaw }; });
    /** the walk and the facing on the screen since s (the camera as it is now): screen vectors, world distance */
    const seen = (s) => G((s) => {
      const V = __T.view, pr = (V.projectRaw || V.project).bind(V), p = __T.stages.heroXYZ({});
      const a = pr(s.x, s.y + 1, s.z), ax = a.x, ay = a.y, c = pr(p.x, p.y + 1, p.z), cx = c.x, cy = c.y;
      const f = pr(p.x + Math.sin(p.yaw) * 3, p.y + 1, p.z + Math.cos(p.yaw) * 3);
      return { wx: cx - ax, wy: cy - ay, fx: f.x - cx, fy: f.y - cy, d: Math.hypot(p.x - s.x, p.z - s.z), x: p.x, z: p.z };
    }, s);
    /** the stick in `n` directions from (x, z): each drag held 0.8 s → [{ a, walk°, face°, d }] */
    const SX = 190, SY = 300;
    async function stickRound(tag, at, n, opts = {}) {
      const out = [];
      for (let k = 0; k < n; k++) {
        const a = k * 2 * Math.PI / n;
        if (at) { await G((p) => __T.stages.hero.place({ x: p.x, z: p.z, face: [p.x - 10, p.z] }), at); await pg.waitForTimeout(250); }
        if (opts.before) await opts.before(k);
        const s = await here();
        await down(1, SX, SY); for (let j = 1; j <= 4; j++) { await move(1, SX + Math.cos(a) * 14 * j, SY + Math.sin(a) * 14 * j); await pg.waitForTimeout(20); }
        await pg.waitForTimeout(opts.hold || 800);
        const v = await seen(s);
        await up(1); await pg.waitForTimeout(150);
        const wa = Math.atan2(v.wy, v.wx), fa = Math.atan2(v.fy, v.fx);
        out.push({ k, drag: deg(a), walk: deg(wa), face: deg(fa), dw: deg(adiff(wa, a)), df: deg(adiff(fa, a)), d: Math.round(v.d * 10) / 10, px: Math.round(Math.hypot(v.wx, v.wy)) });
      }
      // (a drag into something standing — a ledge, the stock — slides him along it: those under 3 amot are not judged)
      const moved = out.filter((r) => r.d >= 3 && r.px >= 6);
      const bad = moved.filter((r) => r.dw > 20 || r.df > 20);
      check(`${tag}: the stick in ${n} directions → he walks AND faces the drag's way (≤ 20°)`, moved.length >= n - (n > 4 ? 2 : 1) && !bad.length,
        `moved ${moved.length}/${n} · ` + out.map((r) => `${r.drag}°→w${r.walk}/f${r.face}${r.dw > 20 || r.df > 20 ? '✗' : ''}(${r.d})`).join(' '));
      return out;
    }

    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cb = cine && await cine.boundingBox();
    if (cb) await tap(cb.x + cb.width / 2, cb.y + cb.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(800);

    if (has('fresh')) {
      /* a fresh save at the Mount: as the owner plays it (the first-time flow, its own key moments) */
      const on = await waitFor(() => window.__TWIN && __TWIN.on(), null, 15000);
      check('[fresh] a fresh save in landscape: twin ON at the Mount', on);
      await closeCards();
      if (on) await stickRound('[fresh] the Mount', null, 4);
      await shot('fresh');
    }

    /* the fixture for the rest: the wall in its courses (the Mount done), a named player after the tutorial */
    const site = 'wall';
    const L0 = await G((site) => {
      const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
      for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
      g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 4, insp: 0, w: 0, ph: 2 };
      g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
      g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: { [site]: 2 }, sig: { [site]: 1 }, best: {} };
      __T.game._.resync(); return window.__GAME_LOG.length;
    }, site);
    const on = await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 15000);
    await pg.waitForTimeout(2500); await closeCards();
    check('[wall] twin ON at the wall\'s courses', on);
    // (an open place on the Mount's top inside the rising wall: 12 amot clear in all 8 directions by his own feet's rules)
    const OPEN = await G(() => { const Hh = __T.stages.hero, C = [[-60, 0], [-90, 30], [-100, -30], [-40, 40], [-40, -40], [-120, 0], [-20, 20], [-140, 40], [60, 40], [60, -40]];
      for (const [x, z] of C) { let ok = true; for (let k = 0; k < 8 && ok; k++) { const a = k * Math.PI / 4, r = Hh.line(x, z, x + Math.cos(a) * 12, z + Math.sin(a) * 12); ok = !!r && r.d < 0.5; } if (ok) return { x, z }; }
      return { x: -60, z: 0, none: true }; });
    console.log('   the open place: ' + JSON.stringify(OPEN));

    if (has('stick') && on) {
      await stickRound('[stick · the follow camera]', OPEN, 8);
      // a key moment's / a check's own camera (the director's frame) from another side, then from the opposite side: the camera held
      for (const [tag, turn] of [['[stick · a key moment\'s camera, turned 120°]', 2.1], ['[stick · the camera from the opposite side]', Math.PI]]) {
        await G(([t, o]) => { const s = __T.game.settings(); window.__CAM0 = s.cam; s.cam = 'director'; const az = 0.42 + t, el = 0.6, d = 46, x = o.x, z = o.z, y = __T.stages.groundAt(x, z) + 1.6;
          clearInterval(window.__CAMFIX); window.__CAMFIX = setInterval(() => __T.view.camSet(x + Math.cos(el) * Math.cos(az) * d, y + Math.sin(el) * d, z + Math.cos(el) * Math.sin(az) * d, x, y, z), 30); }, [turn, OPEN]);
        await pg.waitForTimeout(700);
        await stickRound(tag, OPEN, 8);
        if (turn === Math.PI) await shot('stick-opposite');
        await G(() => { clearInterval(window.__CAMFIX); __T.game.settings().cam = window.__CAM0 || 'follow'; });
        await pg.waitForTimeout(1200);
      }
      // after a real pinch on the free canvas (zoom out), the follow camera
      await G((p) => __T.stages.hero.place({ x: p.x, z: p.z, face: [p.x - 10, p.z] }), OPEN); await pg.waitForTimeout(400);
      await down(3, 470, 170); await down(4, 560, 230); for (let j = 1; j <= 6; j++) { await move(3, 470 - j * 4, 170 - j * 4); await move(4, 560 + j * 4, 230 + j * 4); await pg.waitForTimeout(30); }
      for (let j = 1; j <= 6; j++) { await move(3, 446 + j * 9, 146 + j * 4); await move(4, 584 - j * 9, 254 - j * 4); await pg.waitForTimeout(30); }
      await up(3); await up(4); await pg.waitForTimeout(900);
      const zk = await G(() => __TWIN.cam().zoom);
      await stickRound(`[stick · after a pinch (zoom ${zk.toFixed(2)})]`, null, 4);
    }

    if (has('over') && on) {
      await G((p) => __T.stages.hero.place({ x: p.x, z: p.z, face: [p.x - 10, p.z] }), OPEN); await pg.waitForTimeout(500);
      const ob = await box('.tw-ov'), pips = await box('.tw-pips'), bt = await box('.tw-btn');
      check('[over] "מבט על" in the right zone above the pips, ≥ 56 px', ob && ob.w >= 56 && ob.h >= 56 && ob.l > W * 0.55 && pips && ob.b <= pips.t + 1 && bt && ob.b <= bt.t, JSON.stringify({ ob, pips: pips && [pips.t, pips.b], btn: bt && bt.t }));
      const y0 = await G(() => __T.view.camNow({}).py);
      await waitFor(() => __TWIN.marks().length > 0, null, 8000);
      await tap(ob.x, ob.y); await pg.waitForTimeout(1800);
      const o1 = await G(() => ({ ov: __TWIN.over(), cam: __T.view.camNow({}), marks: __TWIN.marks().length, me: !/-999/.test((document.querySelector('.tw-me') || { style: {} }).style.transform || '-999'), goal: __TWIN.goal(), label: document.querySelector('.tw-ov').textContent }));
      check('[over] a tap lifts the camera high over the site (markers out, "אני" over him)', o1.ov && o1.ov.on && o1.ov.k > 0.9 && o1.cam.py - y0 > 300 && o1.marks > 0 && o1.me,
        `k ${o1.ov && o1.ov.k} · camera y ${Math.round(y0)} → ${Math.round(o1.cam.py)} · markers ${o1.marks} · me ${o1.me} · goal ${o1.goal} · "${o1.label}"`);
      await shot('over');
      const ovl = await G(() => { const M = [...document.querySelectorAll('.tw-mk')].filter((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.left > -500; }), B = M.map((e) => [e.querySelector('.tw-mi').getBoundingClientRect(), e.querySelector('span').getBoundingClientRect()]); let n = 0; for (let i = 0; i < B.length; i++) for (let j = i + 1; j < B.length; j++) for (const a of B[i]) for (const b of B[j]) { if (a.left < b.right - 4 && a.right > b.left + 4 && a.top < b.bottom - 4 && a.bottom > b.top + 4) n++; } return { n, k: B.length }; });
      check('[over] the markers\' labels never stack', ovl.n === 0, JSON.stringify(ovl));
      await tap(ob.x, ob.y); await pg.waitForTimeout(1800);
      const o2 = await G(() => ({ ov: __TWIN.over(), py: __T.view.camNow({}).py }));
      check('[over] a second tap brings it back', o2.ov && !o2.ov.on && o2.ov.k < 0.1 && Math.abs(o2.py - y0) < 15, `k ${o2.ov && o2.ov.k} · y ${Math.round(o2.py)}`);
      await tap(ob.x, ob.y); await pg.waitForTimeout(1500);
      await stickRound('[over] the stick brings it back and walks him the drag\'s way', null, 4, { before: async (k) => { if (k) { const ob2 = await box('.tw-ov'); await tap(ob2.x, ob2.y); await pg.waitForTimeout(1300); } } });
      const o3 = await G(() => __TWIN.over());
      check('[over] the stick let the overview go', o3 && !o3.on, JSON.stringify(o3));
    }

    if (has('compass') && on) {
      const bank = await G((site) => { const w = __T.stages.workSpot(site, 'dress') || __T.stages.workSpot(site, 'set'); return w && { x: w.x, z: w.z }; }, site);
      for (const [tag, off] of [['near (≈ 30 amot)', 22], ['far (≈ 110 amot)', 80]]) {
        await G(([b, o]) => __T.stages.hero.place({ x: b.x + o, z: b.z + o * 0.4, face: [b.x + o + 10, b.z] }), [bank, off]); await pg.waitForTimeout(1200); await closeCards();
        const gOn = await waitFor(() => __TWIN.goal(), null, 6000);
        const gb = await box('.tw-goal');
        check(`[compass · ${tag}] away from his work the compass shows, a button ≥ 44 px`, gOn && gb && gb.w >= 44, gb ? `${Math.round(gb.x)},${Math.round(gb.y)} ${Math.round(gb.w)} px` : 'none');
        if (!gOn) continue;
        const n0 = await G(() => window.__GAME_LOG.length), t0 = Date.now();
        await tap(gb.x, gb.y);
        const end = await waitFor((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'twinGoToEnd'), n0, 5000);
        const r = await G((n) => { const L = window.__GAME_LOG.slice(n), a = L.find((e) => e.type === 'twinGoTo'), e = L.find((x) => x.type === 'twinGoToEnd'); return { a: a && a.d, e: e && e.d }; }, n0);
        const dEnd = r.a && r.e ? Math.hypot(r.a.to[0] - r.e.at[0], r.a.to[1] - r.e.at[1]) : 99;
        check(`[compass · ${tag}] a tap brings him to his work in ≤ 1.5 s`, end && r.e && r.e.ok && r.e.s <= 1.5 && dEnd <= 4, `${r.a ? r.a.how : '—'} · ${r.e ? r.e.s : '—'} s game time · ${((Date.now() - t0) / 1000).toFixed(1)} s wall · from ${r.a && r.a.from} to ${r.a && r.a.to} · at ${r.e && r.e.at}`);
        if (off === 22) await shot('compass-near');
      }
    }
    /* the walks (note 16, the owner 01:31): at a stage's courses, a marker reached by the stick, its job by the button and taps alone —
       every amah he is moved by the game itself meanwhile is summed (sampled every 100 ms; the stick is not touched) */
    if (has('walks')) {
      const QUICK = ['strike', 'line', 'saw', 'F1', 'plaster', 'gold', 'bronze', 'waves', 'wheel', 'tread', 'rafts', 'aqueduct', 'key'];
      const btnC = () => box('.tw-btn');
      for (const st of ((args.find((a) => a.startsWith('--stages=')) || '--stages=nashim,wall').slice(9)).split(',')) {
        await G((site) => {
          const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
          for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
          g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 4, insp: 0, w: 0, ph: 2 };
          g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
          g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: { [site]: 2 }, sig: { [site]: 1 }, best: {} };
          __T.game._.resync();
        }, st);
        await waitFor(() => __TWIN.on(), null, 15000); await pg.waitForTimeout(2500); await closeCards();
        const bank = await G((site) => { const w = __T.stages.workSpot(site, 'dress') || __T.stages.workSpot(site, 'set'); return w && { x: w.x, z: w.z, face: w.face }; }, st);
        if (bank) { await G((b) => __T.stages.hero.place({ x: b.x, z: b.z, face: b.face }), bank); await pg.waitForTimeout(800); }
        await waitFor(() => __TWIN.marks().length > 0, null, 12000);
        // the nearest marker of the quick jobs: walked to by the stick
        let woke = null, fdown = false; const t3 = Date.now();
        while (Date.now() - t3 < 20000) {
          const sp = await G(() => __TWIN.spec()); if (sp && sp.job && sp.job !== 'back' && sp.job !== 'banker') { woke = sp; break; }
          if (await pg.$('.gm-modal.on')) { if (fdown) { await up(1); fdown = false; } await closeCards(); continue; }
          const t = await G((q) => { const e = [...window.__GAME_LOG].reverse().find((x) => x.type === 'twinDeal'), m = e && e.d.marks; if (!m || !m.length) return null; return m.slice().sort((a, b) => (q.indexOf(a.job) < 0 ? 99 : q.indexOf(a.job)) - (q.indexOf(b.job) < 0 ? 99 : q.indexOf(b.job)))[0]; }, QUICK);
          if (!t) { await pg.waitForTimeout(300); continue; }
          const hr = await G(() => { const p = __T.stages.heroXYZ({}), q = __T.view.projectRaw(p.x, p.y + 1, p.z); return { sx: q.x, sy: q.y }; });
          const q = await G((t) => { const r = __T.view.projectRaw(t.x, __T.stages.groundAt(t.x, t.z) + 1, t.z); return { x: r.x, y: r.y }; }, t);
          let vx = q.x - hr.sx, vy = q.y - hr.sy; const vl = Math.hypot(vx, vy) || 1;
          if (vl < 12) { if (fdown) { await up(1); fdown = false; } await pg.waitForTimeout(200); continue; }
          if (!fdown) { await down(1, SX, SY); fdown = true; }
          await move(1, SX + vx / vl * 55, SY + vy / vl * 55); await pg.waitForTimeout(220);
        }
        if (fdown) await up(1);
        if (!woke) { check(`[walks · ${st}] a marker reached by the stick`, false); continue; }
        // its job, by taps alone; his own moves summed meanwhile
        const L1 = await G(() => window.__GAME_LOG.length), bc = await btnC();
        await G(() => { const S = __T.stages; window.__WALK = { d: 0, p: S.heroXYZ({}), max: 0, n: 0 }; clearInterval(window.__WALKT); window.__WALKT = setInterval(() => { const W2 = window.__WALK, q = S.heroXYZ({}), s = Math.hypot(q.x - W2.p.x, q.z - W2.p.z); if (s < 40) W2.d += s; else W2.n++; W2.max = Math.max(W2.max, s); W2.p = q; }, 100); });
        await tap(bc.x, bc.y);
        let taps = 0; const t4 = Date.now();
        while (Date.now() - t4 < 45000 && !(await G(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobDone' && e.d.job === j), [L1, woke.job]))) {
          if (await pg.$('.gm-modal.on')) { await closeCards(); continue; }
          await tap(bc.x, bc.y); taps++; await pg.waitForTimeout(420);
        }
        const wk = await G(() => { clearInterval(window.__WALKT); return window.__WALK; });
        const ev = await G((n) => window.__GAME_LOG.slice(n).filter((e) => /^(jobWalk|heroReturn|heroPlace|checkStand|twinBack)$/.test(e.type)).map((e) => e.type + JSON.stringify(e.d)).join(' ').slice(0, 300), L1);
        check(`[walks · ${st}] the job "${woke.job}" by taps alone: the game walks him ≤ 15 amot in all (no loop round the court, no walk back)`, wk.d <= 15, `${woke.job} · ${taps} taps · walked ${wk.d.toFixed(1)} amot by the game · hops ${wk.n} · ${ev}`);
        await shot(`walks-${st}`);
        // then three strikes at his banker by the button (the "⚒ מכה" the button offers by it), the game's walks meanwhile
        if (bank) {
          await G((b) => __T.stages.hero.place({ x: b.x + 2, z: b.z + 2, face: b.face }), bank); await pg.waitForTimeout(900); await closeCards();
          const n0 = await G(() => (__T.stages.hero.navLog ? __T.stages.hero.navLog().length : 0));
          for (let k = 0; k < 4; k++) { const b2 = await btnC(); await tap(b2.x, b2.y); await pg.waitForTimeout(700); }
          const sp2 = await G(() => __TWIN.spec());
          const nl = await G(() => (__T.stages.hero.navLog ? __T.stages.hero.navLog() : []));
          console.log(`   [walks · ${st}] button ${sp2 && sp2.job} · the game's walks (t, from, to, way, straight, legs, twin, key, dash): ` + JSON.stringify(nl.slice(-8)));
          const loops = nl.filter((w) => w[8] && w[5] > Math.max(20, w[6] * 2.5));
          // (note 16: two acts at one place stay at one place) the strikes at his banker after the job there: at most the one step onto it
          const since = nl.slice(n0).filter((w) => w[5] > 1.5);
          check(`[walks · ${st}] strikes at his banker right after the job there: no walk between them (≤ 1 step onto it, ≤ 10 amot)`, since.length <= 1 && since.every((w) => w[5] <= 10), JSON.stringify(since));
          check(`[walks · ${st}] no walk the game asks for under two thumbs goes round (way > 2.5 × straight)`, !loops.length, JSON.stringify(loops.slice(0, 3)));
        }
      }
    }
    /* note 11 ("בהסתת רמה 4 הדמות נבלעת בתוך הקיר"): the wall at its 4th–5th course — at his banker and through a few strikes he stands
       ON what is laid (his feet at the ground there, never under the course's top beside him), and the follow camera sees him */
    if (has('walltop')) {
      for (const frac of [0.3, 0.55]) {
        const n0 = await G(([site, fr]) => {
          const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
          for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
          const n = __T.game._.siteStones(site);
          g.st[site] = { p: 'courses', n, dp: 1, paid: 999, set: Math.floor(n * fr) + 1, k: 0, fp: 0, fd: 0, keys: { 0: 0.9, 1: 0.9, 2: 0.9, 3: 0.9 }, ev: {}, bad: [], chk: 9, insp: 0, w: 0, ph: 2 };
          g.focus = site; g.crews = []; g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: { [site]: 2 }, sig: { [site]: 1 }, best: {} };
          __T.game._.resync(); return n;
        }, ['wall', frac]);
        await waitFor(() => __TWIN.on(), null, 15000); await pg.waitForTimeout(2500); await closeCards();
        const pr = await G(() => {
          const S = __T.stages, w = S.workSpot('wall', 'dress'), sl = S.nextSlot('wall');
          if (w) S.hero.place({ x: w.x, z: w.z, face: w.face });
          return { w: w && [w.x, w.y, w.z].map((v) => Math.round(v * 10) / 10), slot: sl && { y: Math.round(sl.y * 10) / 10, h: sl.h, face: sl.face && sl.face.map((v) => Math.round(v * 10) / 10), n: sl.n } };
        });
        await pg.waitForTimeout(2500);
        const r = await G(() => { const S = __T.stages, p = S.heroXYZ({}), q = __T.view.projectRaw(p.x, p.y + 1.6, p.z), sl = S.nextSlot('wall'), c = __T.view.camNow({});
          // what the camera really sees: the line from the camera to his head crosses the wall's face below its laid top → hidden
          let hid = false; if (sl && sl.n && sl.face) { const nx = sl.n[0], nz = sl.n[1], f = sl.face, hy = p.y + 3, sh = (p.x - f[0]) * nx + (p.z - f[2]) * nz, sc = (c.px - f[0]) * nx + (c.pz - f[2]) * nz;
            if (sh * sc < 0) { const t = sh / (sh - sc), y = hy + (c.py - hy) * t; hid = y < sl.y - 0.3; } }
          // the highest laid top within 2.5 amot of his feet (a ring of 8 points): above his head = he is inside / under it
          let top = -1e9; for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4; top = Math.max(top, S.groundAt(p.x + Math.cos(a) * 1.2, p.z + Math.sin(a) * 1.2)); }
          return { x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10, z: Math.round(p.z * 10) / 10, g: Math.round(S.groundAt(p.x, p.z) * 10) / 10, top: Math.round(top * 10) / 10, slotY: sl ? Math.round(sl.y * 10) / 10 : null, sx: Math.round(q.x), sy: Math.round(q.y), on: !!q.on, hid, cam: [Math.round(c.px), Math.round(c.py), Math.round(c.pz)] }; });
        console.log(`   [walltop ${frac}] spot ${JSON.stringify(pr)} · him ${JSON.stringify(r)}`);
        check(`[wall · ${Math.round(frac * 100)}% laid] at his banker he stands on his ground, the wall never between the camera and his head, on the screen`, Math.abs(r.y - r.g) < 0.3 && r.top - r.y < 2.5 && !r.hid && r.on && r.sx > 40 && r.sx < W - 40 && r.sy > 60 && r.sy < H - 30, JSON.stringify(r));
        await shot(`walltop-${Math.round(frac * 100)}`);
      }
    }
    /* the phone turned to portrait (twin-touch's check, after every part above — the overview, the compass's dash): two thumbs off at once */
    if (has('portrait') || PARTS.includes('all') || !args.some((a) => a.startsWith('--part='))) {
      await G(() => { const e = document.querySelector('.tw-ov'); if (e && window.__TWIN && __TWIN.over) __TWIN.over(true); });   // (the overview left on)
      await pg.setViewportSize({ width: 390, height: 844 });
      await pg.waitForTimeout(1200);
      const port = await G(() => ({ on: __TWIN.on(), cls: !!document.querySelector('.gm.tw-on'), vis: [...document.querySelectorAll('.tw-zone,.tw-pad,.tw-btn,.tw-mk,.tw-ov,.tw-goal,.tw-me')].some((e) => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).display !== 'none'; }), over: __TWIN.over ? __TWIN.over() : null }));
      check('portrait (390×844), the overview left on: no twin control, the overview let go', !port.on && !port.cls && !port.vis && !(port.over && port.over.on), JSON.stringify(port));
    }
    check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | ').slice(0, 300));
  } finally { await b.close(); }
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
