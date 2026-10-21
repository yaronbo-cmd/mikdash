// (TWIN18, wave 18) Two thumbs at EVERY stage of the building site, by real touch (CDP) at 844×390 on dist/test.html — docs/WAVE18-BRIEF.md
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
const OUT = path.join(ROOT, 'test/out/twin-stages');
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
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/twin-stages/' + name + '.png');
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

    if (args.includes('--fresh')) {
      /* (the brief: "the next stages the course loop reaches in a fresh play") the wall from its first step under two thumbs: the survey's
         stake by the arrow and the button, the dig paid by the pill, the dig by the button, then the courses' markers */
      const site = 'wall';
      const L0 = await G((site) => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        g.st.har = { done: true };
        g.st[site] = { p: 'survey', n: __T.game._.siteStones(site), dp: 0, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
        g.focus = site; g.res.silver = Math.max(g.res.silver || 0, 500); g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
        window.__MG_VIS = 0; __T.game._.resync(); return window.__GAME_LOG.length;
      }, site);
      const on = await waitFor(() => window.__TWIN && __TWIN.on(), null, 15000);
      await pg.waitForTimeout(2000); await closeCards();
      check('[wall · fresh] twin ON at the wall\'s survey', on);
      const phase = () => G(() => __T.game.state.st.wall && __T.game.state.st.wall.p);
      // play: follow the arrow (or ↩), the button when it wakes, the pill when the dig must be paid — as a child does — up to 120 s
      const t0 = Date.now(), seen = new Set(); let acts = 0, fdown = false;
      while (Date.now() - t0 < 120000) {
        const ph = await phase(); seen.add(ph);
        if (ph === 'courses' && await G((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'twinDeal' && e.d.id === 'wall'), L0)) break;
        if (await pg.$('.gm-modal.on')) { if (fdown) { await up(1); fdown = false; } await closeCards(); continue; }
        const sp = await G(() => __TWIN.spec());
        if (sp && (sp.job === 'banker' || sp.job === 'back')) { if (fdown) { await up(1); fdown = false; } const bc = await btnC(); await tap(bc.x, bc.y); acts++; await pg.waitForTimeout(sp.job === 'back' ? 2500 : 450); continue; }
        // the dig's payment: the pill (the game's own words on it)
        const pay = await G(() => { const j = __T.game.state.st.wall; return j && j.p === 'dig' && !j.dp; });
        if (pay) { if (fdown) { await up(1); fdown = false; } const pl = await G(() => { const p = document.querySelector('.gm-pill'); if (!p) return null; const r = p.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; }); if (pl) await tap(pl.x, pl.y); await pg.waitForTimeout(1200); await closeCards(); const so = await pg.$('.gm-sheet.on .gm-btn-gold, .gm-sheet .gm-btn-gold'); if (so) { const bb = await so.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(800); } continue; }
        // else walk by the arrow
        const goal = await G(() => { const e = document.querySelector('.tw-goal'); if (!e || /-999/.test(e.style.transform)) return null; const r = e.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
        if (goal) { const hr = await heroAt(); let vx = goal.x - hr.sx, vy = goal.y - hr.sy; const vl = Math.hypot(vx, vy) || 1; if (!fdown) { await down(1, 190, 300); fdown = true; } await move(1, 190 + vx / vl * 55, 300 + vy / vl * 55); await pg.waitForTimeout(300); continue; }
        if (fdown) { await up(1); fdown = false; }
        await pg.waitForTimeout(400);
      }
      if (fdown) await up(1);
      const end = await phase();
      check('[wall · fresh] survey → dig → courses by the thumbs alone (the arrow, the button, the pill for the dig\'s pay), the deal\'s markers out', end === 'courses' && await G((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'twinDeal' && e.d.id === 'wall'), L0) && await G(() => !window.__MG_VIS), `phases ${[...seen].join('→')} · ${acts} button touches · ${Math.round((Date.now() - t0) / 1000)} s · sheet frames ${await G(() => window.__MG_VIS)}`);
      await shot('wall-fresh');
    }
    for (const site of (args.includes('--fresh') ? [] : LIST)) {
      const tag = `[${site}]`, t1 = Date.now();
      /* the fixture: every stage before it done, this one in its courses (stone 4, its first key stone set), a named player after the tutorial */
      const L0 = await G((site) => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
        g.st[site] = { p: 'courses', n: __T.game._.siteStones(site), dp: 1, paid: 999, set: 4, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: 4, insp: 0, w: 0, ph: 2 };
        g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
        g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: { [site]: 2 }, sig: { [site]: 1 }, best: {} };
        window.__MG_VIS = 0; __T.game._.resync();
        return window.__GAME_LOG.length;
      }, site);
      const on = await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 15000);
      await pg.waitForTimeout(2500); await closeCards();
      check(`${tag} twin ON at the stage`, on, `${await G(() => __T.game._.twin && JSON.stringify(__T.game._.twin().dealOpen))}`);
      if (!on) continue;
      const bank = await G((site) => { const w = __T.stages.workSpot(site, 'dress') || __T.stages.workSpot(site, 'set'); return w && { x: w.x, z: w.z, face: w.face }; }, site);
      if (bank) { await G((b) => __T.stages.hero.place({ x: b.x, z: b.z, face: b.face }), bank); await pg.waitForTimeout(1500); }
      const hs = await heroAt();
      check(`${tag} he stands on the screen (the follow camera)`, hs.on && hs.sx > 40 && hs.sx < W - 40 && hs.sy > 60 && hs.sy < H - 40, `${hs.sx},${hs.sy} at ${Math.round(hs.x)},${Math.round(hs.z)}`);
      // ── stages21 ── (the owner, 8.10: "בשלב העזרת נשים השחקן בתוך הקיר") at his banker the camera comes to a bearing from which no built mass stands between it and him (chest or head: polled up to 8 s — its easing runs on the game's own clock), and he is not inside the finished wall's ring
      { const seeV = () => G((site) => { const q = {}; __T.view.camNow(q); const p = __T.stages.heroXYZ({}), S = __T.stages;
          const blk = (y) => S.frameBlocked(q.px, q.py, q.pz, p.x, p.y + y, p.z, site);
          const ring = p.x > -193 && p.x < 147 && p.z > -73.5 && p.z < 73.5 && !(p.x > -187 && p.x < 141 && p.z > -67.5 && p.z < 67.5) && !(p.x > 141 && Math.abs(p.z) < 13);
          return { chest: blk(1.6), head: blk(3.4), ring, x: Math.round(p.x), z: Math.round(p.z) }; }, site);
        let v = await seeV(); for (let k = 0; k < 16 && v.chest && v.head; k++) { await pg.waitForTimeout(500); v = await seeV(); }
        check(`${tag} the camera sees him at his banker (no built mass between) and he is not inside the finished wall's ring`, !(v.chest && v.head) && (site === 'wall' || site === 'gates' || !v.ring), JSON.stringify(v)); }
      // ── /stages21 ──
      await shot(`${site}-1`);
      /* the stick: 8 directions, 1 s each, from his banker */
      const res = [];
      for (let k = 0; k < 8 && bank; k++) {
        const a = k * Math.PI / 4;
        await G((b) => __T.stages.hero.place({ x: b.x, z: b.z, face: b.face }), bank); await pg.waitForTimeout(250);
        const h0 = await heroAt();
        await down(1, 190, 300); for (let j = 1; j <= 4; j++) { await move(1, 190 + Math.cos(a) * 15 * j, 300 + Math.sin(a) * 15 * j); await pg.waitForTimeout(25); }
        await pg.waitForTimeout(1000);
        const h1 = await heroAt(); await up(1); await pg.waitForTimeout(150);
        res.push(Math.round(Math.hypot(h1.x - h0.x, h1.z - h0.z) * 10) / 10);
      }
      const moved = res.filter((d) => d >= 2).length;
      check(`${tag} the stick moves him in ≥ 6 of 8 directions from his banker`, moved >= 6, `${moved}/8 · ${res.join(' ')}`);
      if (moved < 6) console.log('   dbg: ' + (await G(() => __TWIN.dbg().slice(-6))).join(' '));
      if (bank) { await G((b) => __T.stages.hero.place({ x: b.x, z: b.z, face: b.face }), bank); await pg.waitForTimeout(400); }
      /* a marker: walk to it by the stick, its job starts by the button, taps alone finish it */
      await waitFor((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'twinDeal'), L0, 12000);
      const pickT = () => G((q) => { const e = [...window.__GAME_LOG].reverse().find((x) => x.type === 'twinDeal'), dd = e && e.d; if (!dd || !dd.marks || !dd.marks.length) return null; const ms = dd.marks.slice().sort((a, b) => (q.indexOf(a.job) < 0 ? 99 : q.indexOf(a.job)) - (q.indexOf(b.job) < 0 ? 99 : q.indexOf(b.job))); return ms[0]; }, QUICK);
      let target = await pickT(), woke = null, fdown = false; const t3 = Date.now();
      // ── stages21 ── (the finished wall's ring is a body to the stick: a marker inside the court is not reached from the dressing yard outside it — there the compass is his way; the stick's last 14 amot is what this check is about)
      if (target) { const inC = (x, z) => x > -187 && x < 141 && z > -67.5 && z < 67.5; const h0 = await heroAt();
        if (inC(target.x, target.z) !== inC(h0.x, h0.z)) { const l = Math.hypot(target.x, target.z) || 1, k = Math.min(14, l); await G((t) => __T.stages.hero.place({ x: t.x - t.x / (Math.hypot(t.x, t.z) || 1) * t.k, z: t.z - t.z / (Math.hypot(t.x, t.z) || 1) * t.k, face: [t.x, t.z] }), { x: target.x, z: target.z, k }); await pg.waitForTimeout(900); } }
      // ── /stages21 ──
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
      check(`${tag} a marker is reached by the stick and the button takes its job`, !!woke, `${target && target.job} · ${woke ? woke.icon + ' ' + woke.label : 'null'}`);
      if (!woke) console.log('   diag: ' + JSON.stringify(await G((t) => { const p = __T.stages.heroXYZ({}); return { hero: [Math.round(p.x), Math.round(p.y), Math.round(p.z)], target: t, ty: Math.round(__T.stages.groundAt(t.x, t.z)), tw: __T.game._.twin && __T.game._.twin(), spec: __TWIN.spec(), probe: __TWIN.probe(), dbg: __TWIN.dbg().slice(-5) }; }, target)));
      if (woke) {
        const L1 = await G(() => window.__GAME_LOG.length), bc = await btnC();
        await tap(bc.x, bc.y);
        const started = await waitFor(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobStart' && e.d.job === j), [L1, woke.job], 8000);
        let taps = 0; const t4 = Date.now();
        while (started && Date.now() - t4 < 70000 && !(await G(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobDone' && e.d.job === j), [L1, woke.job]))) {
          if (await pg.$('.gm-modal.on')) { await closeCards(); continue; }
          await tap(bc.x, bc.y); taps++; await pg.waitForTimeout(420);
          if (args.includes('--diag') && taps === 1) await G(() => { window.__FC = { n: 0, t: performance.now(), n0: 0 }; const f = () => { window.__FC.n++; requestAnimationFrame(f); }; requestAnimationFrame(f); });
          if (args.includes('--diag') && taps % 10 === 0) console.log('   fps over the taps ' + await G(() => { const F = window.__FC, t = performance.now(), r = ((F.n - F.n0) * 1000 / (t - F.t)).toFixed(1); F.n0 = F.n; F.t = t; return r; }));
          if (args.includes('--diag') && taps % 10 === 0) console.log('   diag ' + taps + ': ' + JSON.stringify(await G((b) => { const H = window.__HANDS, e = document.elementFromPoint(b.x, b.y); return { st: H && H.state ? H.state() : null, kind: H && H.kind, at: e ? e.className : null, spec: __TWIN.spec(), dbg: __TWIN.dbg().slice(-2), log: window.__GAME_LOG.slice(-6).map((x) => x.type) }; }, bc)).slice(0, 700));
        }
        const jd = await G(([n, j]) => { const e = window.__GAME_LOG.slice(n).find((x) => x.type === 'jobDone' && x.d.job === j); return e && e.d; }, [L1, woke.job]);
        check(`${tag} its job starts by the button and taps alone finish it — no sheet frame`, started && !!jd && jd.stars >= 1 && await G(() => !window.__MG_VIS), `${woke.job} · ${taps} taps · ${jd ? `q ${jd.q.toFixed(2)} ★${jd.stars}` : 'no jobDone'} · sheet frames ${await G(() => window.__MG_VIS)}`);
        await closeCards();
      }
      /* away from his work (40 amot off): the edge arrow points to it, or the button says "↩ לעבודה" */
      if (bank) {
        await G((b) => { const p = { x: b.x + 28, z: b.z + 28 }; __T.stages.hero.place({ x: p.x, z: p.z, face: [b.x, b.z] }); }, bank); await pg.waitForTimeout(1200);
        await closeCards();
        await waitFor(() => __TWIN.goal() || __TWIN.marks().length > 0 || (__TWIN.spec() && __TWIN.spec().job === 'back'), null, 6000);
        const g = await G(() => ({ goal: __TWIN.goal(), spec: __TWIN.spec() && __TWIN.spec().job, marks: __TWIN.marks().length, tw: __T.game._.twin && __T.game._.twin() }));
        check(`${tag} away from his work: the edge arrow or a marker on screen shows the way (or "↩ לעבודה")`, g.goal || g.marks > 0 || g.spec === 'back', JSON.stringify(g));
      }
      /* the Kodesh HaKodashim: never walked into (its block, from just east of it, pushed west 2 s) */
      if (site === 'kodesh') {
        await G(() => __T.stages.hero.place({ x: -134, z: 0, face: [-140, 0] })); await pg.waitForTimeout(400);
        const before = await heroAt();
        const west = await G(() => { const p = __T.stages.heroXYZ({}), a = __T.view.projectRaw(p.x, p.y, p.z), ax = a.x, ay = a.y, q = __T.view.projectRaw(p.x - 10, p.y, p.z); const vx = q.x - ax, vy = q.y - ay, l = Math.hypot(vx, vy) || 1; return [vx / l, vy / l]; });
        await down(1, 190, 300); for (let j = 1; j <= 4; j++) { await move(1, 190 + west[0] * 15 * j, 300 + west[1] * 15 * j); await pg.waitForTimeout(25); }
        let minX = before.x; const t5 = Date.now(); while (Date.now() - t5 < 2000) { await pg.waitForTimeout(150); const p = await heroAt(); minX = Math.min(minX, p.x); }
        await up(1);
        check('[kodesh] the stick never walks him into the Kodesh HaKodashim', minX > -139, `from x ${before.x.toFixed(1)} → min x ${minX.toFixed(1)}`);
      }
      console.log(`   ${site}: ${Math.round((Date.now() - t1) / 1000)} s`);
    }
    check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | ').slice(0, 300));
  } finally { await b.close(); }
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
