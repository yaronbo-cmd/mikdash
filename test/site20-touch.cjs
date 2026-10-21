// (SITE20, wave 20) The wall's plan A, the key stone's landing, the crowd before the piece — by real touch (CDP) at 844×390 on dist/test.html.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/site20-touch.cjs [--no-build] [--shots] [--probe] [--only=wall,ks,crowd]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/site20');
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
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/site20/' + name + '.png');
      await G(() => { window.__HUD_HOLD = false; });
    };
    const heroAt = () => G(() => { const S = __T.stages, p = S.heroXYZ({}), q = __T.view.projectRaw(p.x, p.y + 1.6, p.z); return { x: p.x, y: p.y, z: p.z, sx: Math.round(q.x), sy: Math.round(q.y), on: !!q.on }; });
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const closeCards = async () => { for (let k = 0; k < 4; k++) { const m = await pg.$('.gm-modal.on .gm-btn-gold, .gm-modal.on .gm-btn'); if (!m) return; const bb = await m.boundingBox(); if (bb) await tap(bb.x + bb.width / 2, bb.y + bb.height / 2); await pg.waitForTimeout(450); } };    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cb = cine && await cine.boundingBox();
    if (cb) await tap(cb.x + cb.width / 2, cb.y + cb.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(600);
    const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
    const want = (k) => !ONLY.length || ONLY.includes(k);
    /* the fixture: every stage before `site` done, `site` in its courses with `course` courses laid (its stones counted from the site's own layout) */
    const fix = async (site, course, gsO) => {
      const L0 = await G(([site, course, gsO]) => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; g.bh = g.bh.map(() => 0); __T.game.ui.coach(null, '');
        for (const id of __T.game._.stageIds()) { if (id === site) break; g.st[id] = { done: true }; }
        const info = __T.stages.siteInfo(site); let n = 0; for (let c = 0; c < course && c < info.perCourse.length; c++) n += info.perCourse[c];
        const gn = __T.game._.siteStones(site), gs = gsO != null ? gsO : Math.round(gn * n / info.stones);
        g.st[site] = { p: 'courses', n: gn, dp: 1, paid: 999, set: gs, k: 0, fp: 0, fd: 0, keys: { 0: 0.9 }, ev: {}, bad: [], chk: gs, insp: 0, w: 0, ph: 2 };
        g.focus = site; g.res.stone = Math.max(g.res.stone || 0, 400); g.crews = []; g.econ = Object.assign(g.econ || {}, { card1: 1 });
        g.jobs = { v: 1, lv: {}, s3: {}, n: {}, last: {}, cur: {}, deals: { [site]: 2 }, sig: { [site]: 1 }, best: {} };
        window.__MG_VIS = 0; __T.game._.resync();
        return window.__GAME_LOG.length;
      }, [site, course, gsO]);
      const on = await waitFor(() => window.__TWIN && __TWIN.on() && !!document.querySelector('.gm.tw-on'), null, 15000);
      await pg.waitForTimeout(2500); await closeCards();
      return { L0, on };
    };
    if (args.includes('--probe')) {
      const f = await fix('wall', 4); await waitFor(() => __T.stages.nextSlot('wall'), null, 15000);
      console.log(JSON.stringify(await G(() => { const i = __T.stages.siteInfo('wall'); return { st: __T.game.state.st.wall, i }; })).slice(0, 900));
      console.log(JSON.stringify(await G(() => { const S = __T.stages, i = S.siteInfo('wall'), s = S.nextSlot('wall'), d = S.workSpot('wall', 'dress'), t = S.workSpot('wall', 'set'), h = S.heroXYZ({}); return { i, s, d, t, h, gAtSlot: S.groundAt(s.face[0], s.face[2]) }; })));
      await shot('probe');
    }
    /* the stick, along a world direction (wx, wz): the screen direction of that world vector from where he stands, 15 px steps (as twin-stages) */
    let fdown = false;
    const stickWorld = async (wx, wz, ms) => {
      const v = await G(([wx, wz]) => { const p = __T.stages.heroXYZ({}), a0 = __T.view.projectRaw(p.x, p.y, p.z), ax = a0.x, ay = a0.y, q = __T.view.projectRaw(p.x + wx * 6, p.y, p.z + wz * 6), vx = q.x - ax, vy = q.y - ay, l = Math.hypot(vx, vy) || 1; return [vx / l, vy / l]; }, [wx, wz]);
      await down(1, 190, 300); for (let j = 1; j <= 4; j++) { await move(1, 190 + v[0] * 15 * j, 300 + v[1] * 15 * j); await pg.waitForTimeout(25); }
      if (args.includes('--dbg')) console.log('   stick', JSON.stringify(v), await G(() => ({ st: __T.stages.hero.twinState(), d: __TWIN.dbg().slice(-5) })));
      await pg.waitForTimeout(ms); await up(1); await pg.waitForTimeout(120);
    };
    const place = (x, z, fx, fz) => G(([x, z, fx, fz]) => __T.stages.hero.place({ x, z, face: [fx, fz] }), [x, z, fx, fz]);
    if (want('wall')) {
      const f = await fix('wall', 4); check('[wall] twin ON in course 4', f.on);
      await waitFor(() => __T.stages.nextSlot('wall'), null, 15000);
      const sp = await G(() => { const w = __T.stages.workSpot('wall', 'dress'), s = __T.stages.nextSlot('wall'); return { x: w.x, z: w.z, face: w.face, top: !!w.top, y: w.y, slotY: s.y - s.h / 2, n: s.n }; });
      check('[wall] the dress spot is on the wall (top spot)', sp.top && Math.abs(sp.y - sp.slotY) < 0.3, JSON.stringify(sp));
      await place(sp.x, sp.z, sp.face[0], sp.face[1]); await pg.waitForTimeout(2200); await closeCards();
      const h0 = await heroAt(), r0 = await G(() => __T.stages.hero.s20());
      check('[wall] under two thumbs in course 4 he stands on the top (y within 0.2 of the course top)', Math.abs(h0.y - sp.slotY) < 0.2 && r0.act, `y ${h0.y.toFixed(2)} top ${sp.slotY.toFixed(2)} · ramp ${r0.on} Lr ${r0.Lr.toFixed(1)}`);
      check('[wall] the ramp stands at the wall (visible earth ramp)', r0.on && r0.Lr > 4, JSON.stringify({ ax: r0.ax, az: r0.az, Lr: r0.Lr }));
      await shot('wall-top');
      // along the wall: the stick toward ±x (the wall's own direction)
      const nrm = sp.n, tx = -nrm[1], tz = nrm[0];
      const band = (p) => { const o = { x: Math.abs(p.x) <= 190 }; return Math.abs(Math.abs(p.z) - 70.5) <= 3.1 || Math.abs(Math.abs(p.x - -23) - 170) <= 3.1; };
      let along = 0, ymin = 99, ymax = -99; const a0 = await heroAt();
      for (const sg of [1, -1]) { await place(sp.x, sp.z, sp.face[0], sp.face[1]); await pg.waitForTimeout(300); const b0 = await heroAt(); await stickWorld(tx * sg, tz * sg, 1200); const b1 = await heroAt(); along = Math.max(along, Math.hypot(b1.x - b0.x, b1.z - b0.z)); ymin = Math.min(ymin, b1.y); ymax = Math.max(ymax, b1.y); }
      if (args.includes('--dbg')) console.log(JSON.stringify(await G(([x,z]) => { const S = __T.stages, o = []; for (let d = -12; d <= 12; d += 2) { const xx = x + d; o.push([d, +S.groundAt(xx, z).toFixed(2), S.hero.free(xx, z, x, z)]); } return { o, st: S.hero.twinState(), z0: z }; }, [sp.x, sp.z])));
      check('[wall] the stick walks him ALONG the top and he stays on it', along >= 3 && ymin > sp.slotY - 0.3 && ymax < sp.slotY + 0.3, `moved ${along.toFixed(1)} · y ${ymin.toFixed(2)}…${ymax.toFixed(2)}`);
      // off the edge: out (n) 2.5 s: stays on the wall
      await place(sp.x, sp.z, sp.face[0], sp.face[1]); await pg.waitForTimeout(300);
      await stickWorld(nrm[0], nrm[1], 2500); const e1 = await heroAt();
      const outD = (e1.x - sp.face[0]) * nrm[0] + (e1.z - sp.face[1]) * nrm[1];
      check('[wall] a push OUT over the outer edge does not take him off (the band\'s edge is a wall)', outD < 1.7 && e1.y > sp.slotY - 0.3, `out ${outD.toFixed(2)} y ${e1.y.toFixed(2)}`);
      // the ramp: from its foot up
      const r1 = await G(() => __T.stages.hero.s20()); const fx = r1.ax - r1.nx * (r1.Lr - 1), fz = r1.az - r1.nz * (r1.Lr - 1);
      await place(fx, fz, r1.ax, r1.az); await pg.waitForTimeout(400); const g0 = await heroAt();
      await stickWorld(r1.nx, r1.nz, 2200); const g1 = await heroAt();
      check('[wall] the ramp: from its foot the stick takes him up to the top', g0.y < sp.slotY - 2 && g1.y > sp.slotY - 0.4, `y ${g0.y.toFixed(1)} → ${g1.y.toFixed(2)}`);
      await shot('wall-ramp');
      // a walk the game asks for, from inside the court: up the ramp (no fade), to the top spot
      await place(r1.ax - r1.nx * 30, r1.az - r1.nz * 30, r1.ax, r1.az); await pg.waitForTimeout(400);
      const w0 = await heroAt(); let sawY = 0, faded = false;
      await G(([x, z, f]) => { window.__WALK = __T.stages.hero.walkTo({ x, z, face: f }); }, [sp.x, sp.z, sp.face]);
      const t6 = Date.now(); while (Date.now() - t6 < 8000) { const h = await heroAt(); sawY = Math.max(sawY, h.y); if (await G(() => /R/.test(__T.stages.hero.twinState()))) faded = true; if (!(await G(() => __T.stages.hero.walking))) break; await pg.waitForTimeout(150); }
      const w1 = await heroAt();
      check('[wall] a walk the game asks for from inside the court goes up the ramp (no fade) to the top spot', w0.y < 3 && Math.abs(w1.y - sp.slotY) < 0.3 && !faded && Math.hypot(w1.x - sp.x, w1.z - sp.z) < 2, `y ${w0.y.toFixed(1)} → ${w1.y.toFixed(2)} · faded ${faded} · at ${w1.x.toFixed(1)},${w1.z.toFixed(1)} want ${sp.x.toFixed(1)},${sp.z.toFixed(1)}`);
    }
    if (want('ks')) {
      const f = await fix('wall', 0, 128); check('[ks] twin ON at a crane key (game course 4)', f.on);
      await waitFor((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'twinDeal'), f.L0, 15000);
      const sp = await G(() => { const w = __T.stages.workSpot('wall', 'dress'), n = __T.stages.nextSlot('wall').n; return { x: w.x - n[0] * 1.5, z: w.z - n[1] * 1.5, face: w.face }; });   // (1.5 amot in from the banker: the nearest marker is the key's, not a bench's)
      await place(sp.x, sp.z, sp.face[0], sp.face[1]); await pg.waitForTimeout(2000); await closeCards();
      const woke = await waitFor(() => { const s = __TWIN.spec(); return s && s.job === 'key'; }, null, 15000);
      check('[ks] the key marker wakes the button at the top spot', woke);
      if (!woke) console.log('   diag ' + JSON.stringify(await G(() => { const p = __T.stages.heroXYZ({}); return { hero: [p.x, p.y, p.z].map((v) => Math.round(v * 10) / 10), spec: __TWIN.spec(), marks: __TWIN.marks(), probe: __TWIN.probe && __TWIN.probe(), s20: __T.stages.hero.s20(), tw: __T.game._.twin && __T.game._.twin() }; })).slice(0, 1200));
      if (woke) {
        await G(() => { window.__KSREC = []; const f = () => { const k = __T.stages.hero.ks(); if (k.on) { const p = __T.view.projectRaw(k.x, k.y, k.z), sx = p.x, sy = p.y, c = __T.view.projectRaw(k.x, k.cy, k.z), cx = c.x, cy = c.y;
          const pl = [...document.querySelectorAll('body *')].filter((e) => !e.children.length && /^\+\d+/.test((e.textContent || '').trim())).map((e) => { const r = e.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; })[0] || null;
          window.__KSREC.push({ t: performance.now(), sx, sy, cx, cy, landed: k.landT >= 0, plus: pl, gone: k.gone }); } requestAnimationFrame(f); }; requestAnimationFrame(f); });
        const L1 = await G(() => window.__GAME_LOG.length), bc = await btnC(); await tap(bc.x, bc.y);
        await waitFor(([n]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobStart' && e.d.job === 'key'), [L1], 8000);
        console.log('   hands ' + JSON.stringify(await G(() => ({ kind: window.__HANDS && __HANDS.kind, job: window.__HANDS && __HANDS.job, key: __T.game.state.st.wall && __T.game.state.st.wall.keys, ev: window.__GAME_LOG.slice(-6).map((e) => e.type + ':' + JSON.stringify(e.d).slice(0, 80)) }))));
        let taps = 0, shotDone = false; const t4 = Date.now();
        while (Date.now() - t4 < 70000 && !(await G((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobDone' && e.d.job === 'key'), L1))) {
          if (await pg.$('.gm-modal.on')) { await closeCards(); continue; }
          await tap(bc.x, bc.y); taps++; await pg.waitForTimeout(420);
          if (!shotDone) { const k = await G(() => __T.stages.hero.ks()); if (k.on && k.cy - k.sy < 3.2) { shotDone = true; await shot('ks-low'); } }
        }
        const rec = await G(() => window.__KSREC);
        const land = rec.findIndex((r) => r.landed), lr = land >= 0 ? rec[land] : null;
        check('[ks] the key stone was in the craft and landed', !!lr, `${rec.length} frames · ${taps} taps`);
        if (lr) {
          const inMid = (x, y) => x > W * 0.2 && x < W * 0.8 && y > H * 0.2 && y < H * 0.8;
          const before = rec.slice(Math.max(0, land - 2), land + 1), allIn = before.every((r) => inMid(r.cx, r.cy));
          check('[ks] at the landing the stone is in the frame\'s middle 60 %', allIn, before.map((r) => `${Math.round(r.cx)},${Math.round(r.cy)}`).join(' '));
          let dd = 999, pp = null; for (const r of rec.slice(Math.max(0, land - 4), land + 14)) if (r.plus) { const d = Math.hypot(r.plus[0] - r.sx, r.plus[1] - r.sy); if (d < dd) { dd = d; pp = r; } }
          check('[ks] its "+N" is born within 40 px of the stone\'s top', dd <= 40, pp ? `${Math.round(dd)} px · plus ${Math.round(pp.plus[0])},${Math.round(pp.plus[1])} top ${Math.round(pp.sx)},${Math.round(pp.sy)}` : 'no +N seen');
          const hi = rec.slice(0, land).filter((r) => r.cy != null); const mn = Math.min(...hi.map((r) => r.cy)), mx = Math.max(...hi.map((r) => r.cx));
          console.log('   stone path (cx,cy): ' + hi.filter((_, i) => i % Math.max(1, Math.floor(hi.length / 8)) === 0).map((r) => `${Math.round(r.cx)},${Math.round(r.cy)}`).join(' | '));
        }
      }
    }
    if (want('crowd')) {
      const PAIRS = { sorag: 'F1', kiyor: 'aqueduct' }, GEN = ['F1', 'arch', 'waves', 'letters', 'wheel', 'aqueduct', 'rafts'];
      for (const site of (ONLY.includes('crowd') && args.find((a) => a.startsWith('--sites=')) ? args.find((a) => a.startsWith('--sites=')).slice(8).split(',') : ['sorag', 'kiyor'])) {
        const tag = `[crowd · ${site}]`;
        const f = await fix(site, 0, 4); if (!f.on) { check(`${tag} twin ON`, false); continue; }
        const bank = await G((site) => { const w = __T.stages.workSpot(site, 'dress') || __T.stages.workSpot(site, 'set'); return w && { x: w.x, z: w.z, face: w.face }; }, site);
        if (bank) { await place(bank.x, bank.z, bank.face[0], bank.face[1]); await pg.waitForTimeout(1500); }
        await waitFor((n) => window.__GAME_LOG.slice(n).some((e) => e.type === 'twinDeal'), f.L0, 12000);
        const mk = await G(([n, g, want]) => { const e = [...window.__GAME_LOG.slice(n)].reverse().find((x) => x.type === 'twinDeal'); const m = e && e.d && e.d.marks ? (e.d.marks.find((q) => q.job === want) || e.d.marks.find((q) => g.includes(q.job))) : null; return m; }, [f.L0, GEN, PAIRS[site]]);
        check(`${tag} the deal holds a general-work job`, !!mk, JSON.stringify(mk));
        if (!mk) continue;
        // (a little off the marker, toward the banker: the marker's own job is the nearest)
        await place(mk.x, mk.z, bank.face[0], bank.face[1]); await pg.waitForTimeout(1200);
        const woke = await waitFor((j) => { const s = __TWIN.spec(); return s && s.job === j; }, mk.job, 10000);
        check(`${tag} the button wakes at the marker`, woke);
        if (!woke) continue;
        const people = () => G(() => { const out = []; const C = __T.crews; if (C && C._people) for (const w of C._people) if (!w.gone && w.a && w.a.vis > 0.5) out.push([w.a.x, w.a.z, w.role || '', !!w.y20]); return out; });
        const cs0 = await G(() => __T.stages.craftState({}));
        const bc = await btnC(); await down(2, bc.x, bc.y); await pg.waitForTimeout(60); await up(2);
        const started = await waitFor(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobStart' && e.d.job === j), [f.L0, mk.job], 8000);
        const near = async (r) => { const cs = await G(() => __T.stages.craftState({})); const P = await people(); const sw = await G(([x, z, r]) => __T.stages.hero.workersNear(x, z, r), [cs.wx, cs.wz, r]); return { cs, crew: P.filter((q) => Math.hypot(q[0] - cs.wx, q[1] - cs.wz) <= r), stage: sw }; };
        const n0 = await near(5);
        await pg.waitForTimeout(1000); const n1 = await near(3), n1b = await near(4.8);
        await pg.waitForTimeout(1500); const n2 = await near(3);
        check(`${tag} the craft runs (piece on) `, started && n1.cs.wOn, `piece ${n1.cs.wx.toFixed(1)},${n1.cs.wz.toFixed(1)}`);
        check(`${tag} 1 s after the craft begins no worker stands within 3 amot of the piece (and none within 4.8 once they have gone)`, started && n1.crew.length === 0 && n1.stage.length === 0 && n2.crew.length === 0 && n2.stage.length === 0, `at the touch within 5: crews ${n0.crew.length} stage ${n0.stage.length}; at 1 s within 3: ${n1.crew.length}+${n1.stage.length}, within 4.8: ${n1b.crew.length}+${n1b.stage.length}; at 2.5 s within 3: ${n2.crew.length}+${n2.stage.length}`);
        await shot(`crowd-${site}`);
        // finish the job by taps, then they go back (the people held are released)
        let taps = 0; const t4 = Date.now();
        while (Date.now() - t4 < 60000 && !(await G(([n, j]) => window.__GAME_LOG.slice(n).some((e) => e.type === 'jobDone' && e.d.job === j), [f.L0, mk.job]))) { if (await pg.$('.gm-modal.on')) { await closeCards(); continue; } await tap(bc.x, bc.y); taps++; await pg.waitForTimeout(450); }
        await closeCards(); await pg.waitForTimeout(6500);
        const held = (await people()).filter((q) => q[3]).length, st = await G(() => __T.stages.craftState({}));
        check(`${tag} after the work nobody is still held`, held === 0 && !st.wOn, `held ${held} · ${taps} taps`);
      }
    }
    check('no console errors', logs.length === 0, logs.slice(0, 3).join(' | ').slice(0, 300));
  } finally { await b.close(); }
  console.log(`\n${results.filter(Boolean).length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(results.every(Boolean) ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
