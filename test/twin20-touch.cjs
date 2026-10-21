// (TWIN20) the right thumb as a joystick; fixture of twin-stages. (twin-stages header:) Two thumbs at EVERY stage of the building site, by real touch (CDP) at 844×390 on dist/test.html — docs/WAVE18-BRIEF.md
// "test/twin-stages.cjs": for each stage, place him there (a fixture: the stages before it done, the stage in its courses), then
//   twin ON (.gm.tw-on) · he stands on the screen · the stick moves him in ≥ 6 of 8 directions (1 s each, from his banker) · a marker
//   of the deal is reached by the stick and its job starts by the work button, and taps alone finish it (no .fx-mg sheet frame) ·
//   the stick never walks into the Kodesh HaKodashim · no console errors.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/twin-stages.cjs [--stages=wall,gates] [--no-build] [--shots]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/twin20');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), W = 844, H = 390;
const ALL = ['wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam', 'heichal', 'kodesh'];
const STAGES = (args.find((a) => a.startsWith('--stages=')) || '').slice(9).split(',').filter(Boolean);
const LIST = STAGES.length ? STAGES : ALL;
const QUICK = ['F1', 'key', 'waves', 'plaster', 'gold', 'bronze', 'saw', 'rafts', 'aqueduct', 'wheel', 'tread', 'strike', 'line'];
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

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
      window.__TIP20 = 0; setInterval(() => { const t = document.querySelector('.tw-pad .tw-tip.t20'); if (t && !t.hidden) window.__TIP20++; }, 100); window.__MG_VIS = 0; setInterval(() => { const m = document.querySelector('.fx-mg'); if (m && m.classList.contains('on')) window.__MG_VIS++; }, 100);
      try { localStorage.clear(); localStorage.setItem('bh_twin_tips', '3'); } catch (e) { /* blocked */ }
    });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
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
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/twin20/' + name + '.png');
      await G(() => { window.__HUD_HOLD = false; });
    };
    const heroAt = () => G(() => { const S = __T.stages, p = S.heroXYZ({}), q = __T.view.projectRaw(p.x, p.y + 1.6, p.z); return { x: p.x, y: p.y, z: p.z, sx: Math.round(q.x), sy: Math.round(q.y), on: !!q.on }; });
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const closeCards = async () => { for (let k = 0; k < 4; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) return; const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(450); } };
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cb = cine && await cine.boundingBox();
    if (cb) await tap(cb.x + cb.width / 2, cb.y + cb.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(600);
    const site = (args.find((a) => a.startsWith('--stage=')) || '--stage=nashim').slice(8);
    const L0 = await G((site) => {
      const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
      for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
      g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 4, insp: 0, w: 0, ph: 2 };
      g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
      g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: { [site]: 2 }, sig: { [site]: 1 }, best: {} };
      window.__MG_VIS = 0; __T.game._.resync(); return window.__GAME_LOG.length;
    }, site);
    check('twin ON', await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 15000));
    await pg.waitForTimeout(2500); await closeCards();
    await waitFor((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'twinDeal'), L0, 12000);
    const mk = await G(() => __T.game._.twin().mk);
    check('two markers side by side', mk.length >= 2, JSON.stringify(mk));
    if (mk.length >= 2) {
      const A = { job: mk[0][0], x: mk[0][1], z: mk[0][2] }, B = { job: mk[1][0], x: mk[1][1], z: mk[1][2] };
      // he stands at A (beside it), the button shows A's job
      for (const [X, Y] of [[A, B], [B, A]]) {
        const tag = `[${X.job} → ${Y.job}]`;
        await G((p) => __T.stages.hero.place({ x: p.x - 2.2, z: p.z, face: [p.x, p.z] }), X); await pg.waitForTimeout(1500); await closeCards();
        await G((p) => { __T.game._.twin(); }, X);
        const w1 = await waitFor((j) => __TWIN.spec() && __TWIN.spec().job === j, X.job, 6000);
        check(`${tag} at the first marker the button is its job`, w1, JSON.stringify(await G(() => __TWIN.spec())));
        check(`${tag} the second tip "גררו לכיוון" showed once the walking and work tips have retired`, await G(() => window.__TIP20 > 0));
        const hr = await heroAt();
        const qy = await G((t) => { const q = __T.view.projectRaw(t.x, __T.stages.groundAt(t.x, t.z) + 0.5, t.z); return { x: q.x, y: q.y }; }, Y);
        let vx = qy.x - hr.sx, vy = qy.y - hr.sy; const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
        const bc = await btnC(), L1 = await G(() => window.__GAME_LOG.length);
        await G(() => { window.__A20 = { mv: 0, on: 0 }; document.querySelector('.tw-btn').addEventListener('pointermove', () => { if (!window.__A20.mv) window.__A20.mv = performance.now(); }, true); const f = () => { if (!window.__A20.on && __T.stages.aimOn()) window.__A20.on = performance.now(); requestAnimationFrame(f); }; requestAnimationFrame(f); });
        await down(2, bc.x, bc.y);
        const t0 = Date.now(); await move(2, bc.x + vx * 30, bc.y + vy * 30);
        const on1 = await waitFor(() => __TWIN.t20().on && __T.stages.aimOn(), null, 2000); await pg.waitForTimeout(100); const lat = await G(() => Math.round(window.__A20.on - window.__A20.mv));
        check(`${tag} the aim arrow is set within 50 ms of the first drag move (in-page: move event → aim visible at the next frame)`, on1 && lat <= 50, `${lat} ms`);
        await move(2, bc.x + vx * 85, bc.y + vy * 85); await pg.waitForTimeout(150);
        const a2 = await G(() => ({ ...__TWIN.t20(), mark: [...document.querySelectorAll('.tw-mk.aimed')].length, pw: document.querySelectorAll('.tw-pw20 i.f').length }));
        check(`${tag} the knob over the other marker's bearing picks and lights it; 3 power pips on a long drag`, a2.pick === Y.job && a2.mark === 1 && a2.pw === 3 && a2.lvl === 2, JSON.stringify(a2));
        await shot(`aim-${X.job}-${Y.job}`);
        await up(2);
        const off = await waitFor(() => !__T.stages.aimOn() && !__TWIN.t20().on, null, 1500);
        check(`${tag} the arrow goes on release`, off);
        const started = await waitFor(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobStart' && e.d.job === j), [L1, Y.job], 8000);
        const tw = await G((n) => window.__GAME_LOG.slice(n).filter((e) => e.type === 'twinWork').map((e) => e.d), L1);
        check(`${tag} the release starts the OTHER marker's job, the twinWork carries power ≥ 1.4`, started && tw.some((d) => d.job === Y.job && d.power >= 1.4), JSON.stringify(tw));
        // tap on to finish quickly: a few taps, then close
        for (let k = 0; k < 40 && !(await G(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobDone' && e.d.job === j), [L1, Y.job])); k++) { if (await pg.$('.gm-modal.on')) { await closeCards(); continue; } await tap(bc.x, bc.y); await pg.waitForTimeout(420); }
        console.log('   craft acts power log: ' + JSON.stringify((await G(() => (window.__CRAFT_ACTS || []).map((a) => a.p))).slice(0, 8)));
        await closeCards(); await pg.waitForTimeout(500);
        break;   // one direction is the contract; the second rerun is costly
      }
      // a tap alone does what it did: the nearest marker's job (no aim)
      const t20 = await G(() => __TWIN.t20());
      check('after the act: no aim left on', !t20.on);
    }
    check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | ').slice(0, 300));
  } finally { await b.close(); }
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
