// (fable20) The general work craft in the world (stages.craft.work + minigames/work.js) at the stages whose lead job had no craft of its own, by real touch (CDP) at 844×390 on dist/test.html — docs/WAVE18-BRIEF.md
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
const OUT = path.join(ROOT, 'test/out/work-touch');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots'), W = +((args.find((a) => a.startsWith('--w=')) || '--w=844').slice(4)), H = +((args.find((a) => a.startsWith('--h=')) || '--h=390').slice(4));
const PAIRS = { sorag: 'F1', lishka: 'wheel', ulam: 'waves', kiyor: 'aqueduct', har: 'letters', wall: 'rafts' };
const ALL = ['sorag', 'lishka', 'ulam', 'kiyor', 'har'];
const STAGES = (args.find((a) => a.startsWith('--stages=')) || '').slice(9).split(',').filter(Boolean);
const LIST = STAGES.length ? STAGES : ALL;

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
      window.__MG_VIS = 0; setInterval(() => { const m = document.querySelector('.fx-mg'); if (m && m.classList.contains('on')) window.__MG_VIS++; }, 100);
      try { localStorage.clear(); } catch (e) { /* blocked */ }
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
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/work-touch/' + name + '.png');
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


    for (const site of LIST) {
      const want = PAIRS[site] || 'F1', tag = `[${site} · ${want}]`, t1 = Date.now();
      const L0 = await G((site) => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
        g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 4, insp: 0, w: 0, ph: 2 };
        g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.res.silver = Math.max(g.res.silver || 0, 500); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
        g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: { [site]: 2 }, sig: { [site]: 1 }, best: {} };
        window.__MG_VIS = 0; window.__CRAFT_ACTS = []; __T.game._.resync();
        return window.__GAME_LOG.length;
      }, site);
      const on = await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 15000);
      await pg.waitForTimeout(2500); await closeCards();
      if (!on) { check(`${tag} twin ON`, false); continue; }
      const bank = await G((site) => { const w = __T.stages.workSpot(site, 'dress') || __T.stages.workSpot(site, 'set'); return w && { x: w.x, z: w.z, face: w.face }; }, site);
      if (bank) { await G((b) => __T.stages.hero.place({ x: b.x, z: b.z, face: b.face }), bank); await pg.waitForTimeout(1200); }
      await waitFor((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'twinDeal'), L0, 12000);
      const marks = await G((n) => { const e = [...window.__GAME_LOG.slice(n)].reverse().find((x) => x.type === 'twinDeal'); return e && e.d && e.d.marks ? e.d.marks.map((m) => m.job) : []; }, L0);
      const GEN = ['F1', 'arch', 'waves', 'letters', 'wheel', 'aqueduct', 'rafts'];
      const job = marks.includes(want) ? want : marks.find((j) => GEN.includes(j));
      check(`${tag} the deal's markers hold a job of the general work`, !!job, `marks ${marks.join(',')} → ${job}`);
      if (!job) continue;
      const pickT = () => G(([j, n]) => { const e = [...window.__GAME_LOG.slice(n)].reverse().find((x) => x.type === 'twinDeal'), dd = e && e.d; return dd && dd.marks ? dd.marks.find((m) => m.job === j) : null; }, [job, L0]);
      let target = await pickT(), woke = null, fdown = false; const t3 = Date.now();
      while (target && Date.now() - t3 < 20000) {
        target = (await pickT()) || target;
        const sp = await G(() => __TWIN.spec()); if (sp && sp.job === target.job) { woke = sp; break; }
        const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (m) { if (fdown) { await up(1); fdown = false; } await closeCards(); continue; }
        const hr = await heroAt(); const q = await G((t) => __T.view.projectRaw(t.x, __T.stages.groundAt(t.x, t.z) + 1, t.z), target);
        let vx = q.x - hr.sx, vy = q.y - hr.sy; const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
        if (vl < 12) { if (fdown) { await up(1); fdown = false; } await pg.waitForTimeout(200); continue; }
        if (!fdown) { await down(1, 190, 300); fdown = true; }
        await move(1, 190 + vx * 55, 300 + vy * 55); await pg.waitForTimeout(220);
      }
      if (fdown) await up(1);
      check(`${tag} the marker reached, the button takes the job`, !!woke, woke ? woke.icon + ' ' + woke.label : 'null');
      if (!woke) continue;
      await closeCards(); await pg.waitForTimeout(300);
      const L1 = await G(() => window.__GAME_LOG.length), bc = await btnC();
      // the first touch: the kohen's first frame within 50 ms, the piece before him
      await down(2, bc.x, bc.y); await pg.waitForTimeout(40);
      const first = await G(() => ({ w: __T.stages.caWork(), hands: !!(window.__HANDS && window.__HANDS.twin), gen: !!(window.__HANDS && window.__HANDS.generic) }));
      await up(2);
      const started = await waitFor(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobStart' && e.d.job === j), [L1, job], 8000);
      await pg.waitForTimeout(700);
      const mp = await G((n) => { const e = window.__GAME_LOG.slice(n).find((x) => x.type === 'mgPath'); return e && e.d; }, L1);
      const w1 = await G(() => __T.stages.caWork());
      check(`${tag} the job is played by the general work craft in the world (a workpiece before him, no sheet)`, started && mp && mp.generic && mp.hooks && w1.on && w1.boxes > 0, `mgPath ${JSON.stringify(mp)} · work ${JSON.stringify(w1)} · first-touch ${JSON.stringify(first.w && { armed: first.w.armed, stroke: first.w.stroke, on: first.w.on })}`);
      await shot(`${site}-${job}-start`);
      if (args.includes('--close')) { const info = await G(() => { __T.simulate(false); const m = __T.scene.getObjectByName('fable20-work'); const hid = []; __T.scene.traverse((o) => { if (o !== m && o.isMesh && o.visible && o !== __T.stages.hero.mesh) { hid.push(o); o.visible = false; } }); __T.render(); __T.render(); const out = { count: m.count, vis: m.visible, mat: m.material.type, ic: !!m.instanceColor, hid: hid.length, depth: m.material.depthTest, opaq: m.material.opacity }; window.__HID = hid; return out; }); console.log('   close ' + JSON.stringify(info)); await pg.screenshot({ path: path.join(OUT, `${site}-${job}-close.png`) }); await G(() => { for (const o of window.__HID) o.visible = true; __T.simulate(true); }); }
      let taps = 0; const t4 = Date.now(); let mid = null;
      while (Date.now() - t4 < 60000 && !(await G(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobDone' && e.d.job === j), [L1, job]))) {
        if (await pg.$('.gm-modal.on')) { await closeCards(); continue; }
        await tap(bc.x, bc.y); taps++; await pg.waitForTimeout(480);
        if (taps === 3) { mid = await G(() => __T.stages.caWork()); await shot(`${site}-${job}-mid`); }
      }
      const jd = await G(([n, j]) => { const e = window.__GAME_LOG.slice(n).find((x) => x.type === 'jobDone' && x.d.job === j); return e && e.d; }, [L1, job]);
      const acts = await G(() => (window.__CRAFT_ACTS || []).length), w2 = await G(() => __T.stages.caWork());
      check(`${tag} every tap is a stroke you can see and an act that pays; taps alone finish it`, !!jd && acts >= 4 && mid && mid.k >= 2 && mid.k <= 4 && await G(() => !window.__MG_VIS), `${taps} taps · ${acts} acts · mid k ${mid && mid.k}/${mid && mid.n} · ${jd ? `q ${jd.q.toFixed(2)} ★${jd.stars}` : 'no jobDone'} · end ${JSON.stringify(w2)}`);
      await shot(`${site}-${job}-end`);
      await closeCards();
      console.log(`   ${site}: ${Math.round((Date.now() - t1) / 1000)} s`);
    }
    check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | ').slice(0, 300));
  } finally { await b.close(); }
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
