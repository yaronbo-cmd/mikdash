// The house inside (world.sanctuary, PROJECT.md §12): boots the real build, enters each room (ulam, heichal, kodesh-view),
// sets the states (lamps, ketoret, parochot, bread, doors), checks the API (pick, highlight, focus, walk-in), prints the
// draw calls per view and saves a handful of screenshots to test/out/sanctuary/ (phone 390×844, desktop 1280×720).
// Usage: node test/sanctuary.cjs [dist/test.html] [--quick | --shots=desktop | --shots=phone]
//   --quick: API + draw calls only; --shots=…: only that set of screenshots; no flag: everything, one browser at a time.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const OUT = 'test/out/sanctuary';

async function session(b, file, W, H, fn) {
  const pg = await b.newPage({ viewport: { width: W, height: H } });
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__NO_GAME = true; });
  const logs = [];
  pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text().slice(0, 300)); });
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  await pg.goto('file://' + path.resolve(file));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 300000 });
  await pg.evaluate(() => { __T.pause(true); const h = document.getElementById('hint'); if (h) h.style.display = 'none'; });
  try { await fn(pg); } finally { await pg.close(); }
  return logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l));
}

(async () => {
  const args = process.argv.slice(2), quick = args.includes('--quick'), file = args.find((a) => !a.startsWith('--')) || 'dist/test.html';
  const only = (args.find((a) => a.startsWith('--shots=')) || '').slice(8);
  const doApi = !only, doDesk = !quick && (!only || only === 'desktop'), doPhone = !quick && (!only || only === 'phone');
  fs.mkdirSync(OUT, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const fails = [], calls = {};
  const ok = (name, cond, info) => { if (!cond) fails.push(name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
  const shot = async (pg, name, js) => {
    const t0 = Date.now();
    const r = await pg.evaluate(async (js) => { const v = await (0, eval)(`(async () => { ${js} })()`); __T.sanctuary.settle(); __T.render(); return v; }, js);
    await pg.screenshot({ path: `${OUT}/${name}.png`, timeout: 900000 });
    console.log('  ', name, ((Date.now() - t0) / 1000).toFixed(1) + 's', r !== undefined ? JSON.stringify(r) : '');
    return r;
  };
  const dc = async (pg, name, js) => {
    const r = await pg.evaluate(async (js) => { await (0, eval)(`(async () => { ${js} })()`); __T.sanctuary.settle(); __T.render(); return __T.drawCalls(); }, js);
    calls[name] = r.total; console.log('   calls', name, JSON.stringify(r));
    ok('≤150 draw calls: ' + name, r.total <= 150, r);
    return r;
  };
  try {
    /* ── desktop: API, draw calls, screenshots ── */
    if (doApi) {
    const logs1 = await session(b, file, 1280, 720, async (pg) => {
      console.log('desktop 1280×720: API + draw calls');
      const api = await pg.evaluate(async () => {
        const S = __T.sanctuary, out = {};
        const fns = ['enter', 'exit', 'setLamps', 'setGoldAltar', 'setParochot', 'setDoors', 'setBread', 'setBezichin', 'highlight', 'focus', 'pick', 'update'];
        out.missing = fns.filter((f) => typeof S[f] !== 'function');
        out.viaStages = __T.stages.sanctuary === S && Object.create(__T.stages).sanctuary === S;
        // the walk-in, driven by update(): through the Ulam, the doors open, into the Heichal
        __T.jump('facade'); S.setDoors(0); S.settle();
        let res = 'pending'; S.enter('heichal').then((v) => { res = v; });
        let t = 0, maxDoor = 0;
        for (; t < 40 && res === 'pending'; t += 0.05) { S.update(0.05); maxDoor = Math.max(maxDoor, S.state.doors); await Promise.resolve(); }
        out.walk = { res, sec: +t.toFixed(1), room: S.state.room, doors: S.state.doors, cam: __T.camera.position.toArray().map((v) => +v.toFixed(1)) };
        // pick from inside: straight at the menorah, the table, the golden altar
        const rc = new __T.Raycaster(), V = __T.Vector3;
        const aim = (p, t) => { rc.set(new V(...p), new V(t[0] - p[0], t[1] - p[1], t[2] - p[2]).normalize()); return S.pick(rc); };
        __T.render();
        out.pickMenorah = aim([-116, 25, 4], [-125, 24, 7.5]); out.pickShulchan = aim([-116, 25, -4], [-125, 24, -7.5]);
        out.pickAltar = aim([-114, 25, 0], [-121, 23, 0]); out.pickWall = aim([-110, 30, 0], [-110, 30, 10]);
        // highlight + focus
        S.highlight('menorah'); out.hi = S.state.highlight; S.highlight(null);
        let f = 'pending'; S.focus('shulchan', 800).then((v) => { f = v; }); for (let i = 0; i < 60 && f === 'pending'; i++) { S.update(0.05); await Promise.resolve(); }
        out.focus = f; out.focusCam = __T.camera.position.toArray().map((v) => +v.toFixed(1));
        // states
        S.setLamps([1, 0, 1, 0, 1, 0, 1]); S.setGoldAltar({ coals: true, smoke: 0.5 }); S.setParochot({ outer: 1, inner: 0.5 }); S.setBread('empty'); S.setBezichin(false); S.settle();
        out.states = S.state;
        S.setLamps([1, 1, 1, 1, 1, 1, 1]); S.setGoldAltar({ coals: false, smoke: 0 }); S.setParochot({ outer: 0, inner: 0 }); S.setBread('full'); S.setBezichin(true); S.settle();
        // exit back to the steps
        let ex = 'pending'; S.exit().then((v) => { ex = v; }); for (let i = 0; i < 600 && ex === 'pending'; i++) { S.update(0.05); await Promise.resolve(); }
        out.exit = { res: ex, room: S.state.room, interior: S.state.interior, cam: __T.camera.position.toArray().map((v) => +v.toFixed(1)) };
        // outside places: pick the kiyor and the mechanism from the altar view
        __T.jump('altar'); __T.render();
        out.pickKiyor = aim([-40, 32, 40], [-63.5, 21.5, 20]); out.pickMechanism = aim([-40, 32, 40], [-63.5, 29, 25]);
        out.lampWest = S.lampPosition(0).toArray().map((v) => +v.toFixed(2));
        return out;
      });
      console.log(JSON.stringify(api, null, 0).replace(/,"/g, ',\n "'));
      ok('api complete', api.missing.length === 0, api.missing); ok('stages.sanctuary', api.viaStages);
      ok('walk-in resolves', api.walk.res === true && api.walk.room === 'heichal' && api.walk.doors === 1, api.walk);
      ok('pick menorah', api.pickMenorah && api.pickMenorah.id === 'menorah', api.pickMenorah);
      ok('pick shulchan', api.pickShulchan && api.pickShulchan.id === 'shulchan', api.pickShulchan);
      ok('pick gold altar', api.pickAltar && api.pickAltar.id === 'gold-altar', api.pickAltar);
      ok('pick room', api.pickWall && api.pickWall.id === 'heichal-in', api.pickWall);
      ok('focus resolves', api.focus === true); ok('exit resolves', api.exit.res === true && api.exit.room === 'out', api.exit);
      ok('pick kiyor', api.pickKiyor && api.pickKiyor.id === 'kiyor', api.pickKiyor);
      ok('pick mechanism', api.pickMechanism && api.pickMechanism.id === 'mechanism', api.pickMechanism);
      ok('states', api.states.bread === 'empty' && api.states.bezichin === false && api.states.parochot.outer === 1 && api.states.coals === 1, api.states);
      // draw calls in every view (outside with the doors shut and open; inside)
      for (const v of ['olives', 'facade', 'altar', 'kotel', 'royal', 'top']) await dc(pg, v, `__T.sanctuary.setDoors(0); __T.jump('${v}')`);
      await dc(pg, 'facade+doors', `__T.sanctuary.setDoors(1); __T.jump('facade')`);
      await dc(pg, 'altar+doors', `__T.sanctuary.setDoors(1); __T.jump('altar')`);
      await dc(pg, 'heichal(view)', `__T.jump('heichal')`);
      await dc(pg, 'ulam', `await __T.sanctuary.enter('ulam', { ms: 0 })`);
      await dc(pg, 'heichal', `await __T.sanctuary.enter('heichal', { ms: 0 })`);
      await dc(pg, 'heichal+smoke', `__T.sanctuary.setGoldAltar({ coals: 1, smoke: 1 }); for (let i = 0; i < 200; i++) __T.sanctuary.update(0.05)`);
      await dc(pg, 'kodesh-view', `__T.sanctuary.setGoldAltar({ coals: 0, smoke: 0 }); await __T.sanctuary.enter('kodesh-view', { ms: 0 })`);
      await dc(pg, 'lambs', `await __T.sanctuary.exit({ ms: 0 }); await __T.sanctuary.focus('lambs', 0)`);
      await dc(pg, 'avtinas', `await __T.sanctuary.focus('avtinas', 0)`);
      // ── wave 3 (World agent): anchors, the gate from inside, the wicket route, and every promise on time ──
      const w3 = await pg.evaluate(async () => {
        const S = __T.sanctuary, out = {};
        const idle = (ms) => new Promise((r) => setTimeout(r, ms));
        // a slow renderer: one update of 0.6 s (the tests' __DT_MAX) every 700 ms of wall clock — or none at all
        const timed = async (p, { slow = true, cap = 30000 } = {}) => {
          const t0 = performance.now(); let v = 'pending'; p.then((x) => { v = x; });
          while (v === 'pending' && performance.now() - t0 < cap) { await idle(slow ? 700 : 100); if (slow) S.update(0.6); }
          return { v, sec: +((performance.now() - t0) / 1000).toFixed(1) };
        };
        out.anchors = ['gate', 'gate-in', 'gold-altar-top', 'shulchan-east', 'shulchan-west', 'menorah-stone', 'menorah-stone-1', 'even-shtiya', 'wicket-north', 'menorah'].map((k) => [k, S.anchor(k)]);
        out.anchorBad = S.anchor('nothing');
        out.axis = S.state.menorahAxis;
        await S.enter('heichal', { ms: 0 }); S.settle();
        out.focusPaused = await timed(S.focus('menorah', 900), { slow: false });   // no frame at all: the backstop
        out.focusSlow = await timed(S.focus('shulchan', 900));                       // slow frames: the wall clock
        await S.exit({ ms: 0 }); __T.jump('altar');
        out.focusCut = await timed(S.focus('gold-altar', 900)); out.focusCutRoom = S.state.room;
        await S.focus('heichal-gate', 0); const c = __T.camera.position, t = __T.controls.target;
        out.gate = { cam: c.toArray().map((v) => +v.toFixed(1)), looksEast: t.x - c.x > 5 };
        await S.exit({ ms: 0 }); __T.jump('facade'); S.setDoors(0); S.settle();
        out.wicket0 = { v: await S.enter('heichal', { via: 'wicket', ms: 0 }), room: S.state.room, doors: S.state.doors };
        await S.exit({ ms: 0 }); __T.jump('facade'); S.setDoors(0); S.settle();
        out.wicket = await timed(S.enter('heichal', { via: 'wicket' }), { cap: 40000 });
        out.wicket.room = S.state.room; out.wicket.doors = S.state.doors; out.wicket.cam = __T.camera.position.toArray().map((v) => +v.toFixed(1));
        out.exitSlow = await timed(S.exit());
        out.exitSlow.room = S.state.room;
        // enter() with no duration (ketoret.js) answers within the gameplay's 6 s; a quick focus on an outside place from
        // inside is a cut out; a quick focus while a walk-in is still under way takes the camera on
        __T.jump('altar'); S.setDoors(0); S.settle();
        out.enterBrisk = await timed(S.enter('heichal')); out.enterBrisk.room = S.state.room;
        out.cutOut = await timed(S.focus('kiyor', 900)); out.cutOut.room = S.state.room;
        __T.jump('altar'); S.settle();
        const walkIn = S.enter('heichal', { ms: 6000 }); for (let i = 0; i < 4; i++) { await idle(700); S.update(0.6); }
        out.focusDuringWalk = await timed(S.focus('menorah', 900)); out.focusDuringWalk.room = S.state.room; out.focusDuringWalk.walkIn = await walkIn;
        const c2 = __T.camera.position; out.focusDuringWalk.cam = c2.toArray().map((v) => +v.toFixed(1));
        return out;
      });
      console.log('wave 3', JSON.stringify(w3));
      ok('anchors', w3.anchors.every(([k, v]) => Array.isArray(v) && v.length === 3 && v.every(Number.isFinite)) && w3.anchorBad === null, w3.anchors);
      ok('state.menorahAxis', w3.axis === 'ew' || w3.axis === 'ns', w3.axis);
      ok('focus on time with no frames (backstop)', w3.focusPaused.v === true && w3.focusPaused.sec <= 3.2, w3.focusPaused);
      ok('focus on time with slow frames', w3.focusSlow.v === true && w3.focusSlow.sec <= 2.2, w3.focusSlow);
      ok('a quick focus from outside cuts in, on time', w3.focusCut.v === true && w3.focusCut.sec <= 3.2 && w3.focusCutRoom === 'heichal', [w3.focusCut, w3.focusCutRoom]);
      ok('focus heichal-gate faces the gate', w3.gate.looksEast && w3.gate.cam[0] < -100, w3.gate);
      ok('wicket route (instant)', w3.wicket0.v === true && w3.wicket0.room === 'heichal' && w3.wicket0.doors === 1, w3.wicket0);
      ok('wicket route (walk, cut, the gate opens from inside)', w3.wicket.v === true && w3.wicket.room === 'heichal' && w3.wicket.doors === 1 && w3.wicket.cam[0] < -100, w3.wicket);
      ok('exit on time with slow frames', w3.exitSlow.v === true && w3.exitSlow.room === 'out' && w3.exitSlow.sec <= 6, w3.exitSlow);
      ok('enter() with no duration answers within 6 s', w3.enterBrisk.v === true && w3.enterBrisk.sec <= 6 && w3.enterBrisk.room === 'heichal', w3.enterBrisk);
      ok('a quick focus outside from inside cuts out, on time', w3.cutOut.v === true && w3.cutOut.sec <= 3.2 && w3.cutOut.room === 'out', w3.cutOut);
      ok('a quick focus during a walk-in takes the camera on', w3.focusDuringWalk.v === true && w3.focusDuringWalk.sec <= 3.2 && w3.focusDuringWalk.room === 'heichal' && Math.abs(w3.focusDuringWalk.cam[0] + 119.2) < 1.5, w3.focusDuringWalk);
    });
    console.log(logs1.slice(0, 12).join('\n') || 'desktop: no errors');
    ok('no page errors (desktop)', logs1.filter((l) => /PAGEERR|error:/.test(l)).length === 0, logs1.slice(0, 3));
    }
    /* ── desktop screenshots (one render each; the dawn ones first, then night: few time changes) ── */
    if (doDesk) {
    const logs3 = await session(b, file, 1280, 720, async (pg) => {
      console.log('desktop 1280×720: screenshots');
      await shot(pg, 'd1_ulam_doors_open', `__T.sanctuary.setDoors(1); await __T.sanctuary.enter('ulam', { ms: 0 })`);
      await shot(pg, 'd2_heichal_dawn', `await __T.sanctuary.enter('heichal', { ms: 0 }); __T.sanctuary.setLamps([1,1,1,1,1,1,1])`);
      await shot(pg, 'd3_shulchan_bread_empty', `__T.sanctuary.setBread('empty'); __T.sanctuary.setBezichin(false); await __T.sanctuary.focus('shulchan', 0)`);
      await shot(pg, 'd4_facade_world', `__T.sanctuary.setBread('full'); __T.sanctuary.setBezichin(true); await __T.sanctuary.exit({ ms: 0 }); __T.jump('facade')`);
      await shot(pg, 'd5_altar_world', `__T.jump('altar')`);
      // Phase A still works with the hollow house: the Heichal half built (the reveal cuts through the hollow walls), and the
      // craftsmen lowered in boxes over the Kodesh HaKodashim (stages.boxes)
      await shot(pg, 'd6_phaseA_heichal_building', `__T.sanctuary.setDoors(0); __T.stages.setStage('kodesh', 'locked'); __T.stages.setStage('heichal', 'building', 0.6); __T.step(3); __T.look([-20, 150, 150], [-120, 50, 0]); return __T.stages.status('heichal')`);
      await shot(pg, 'd7_phaseA_boxes', `__T.demoMode(); __T.step(1); __T.stages.boxes(0.75); __T.step(1.2); __T.stages.boxes(0.75); __T.look([-95, 150, 95], [-149, 110, 0]); return __T.stages._dbg.bx.on`);
      await shot(pg, 'd8_heichal_night_ketoret', `__T.setTime('night'); __T.sanctuary.setDoors(0); await __T.sanctuary.enter('heichal', { ms: 0 }); __T.sanctuary.setGoldAltar({ coals: 1, smoke: 0.7 }); for (let i = 0; i < 160; i++) __T.sanctuary.update(0.05)`);
      await shot(pg, 'd9_menorah_straight_night', `__T.sanctuary.setGoldAltar({ coals: 0, smoke: 0 }); for (let i = 0; i < 300; i++) __T.sanctuary.update(0.05); await __T.sanctuary.focus('menorah', 0)`);
      await shot(pg, 'd10_menorah_round_night', `__T.sanctuary.setMenorah({ style: 'round' })`);
      await shot(pg, 'd11_kodesh_view', `__T.sanctuary.setMenorah({ style: 'straight' }); await __T.sanctuary.enter('kodesh-view', { ms: 0 }); __T.sanctuary.setKodeshSmoke(0.6); for (let i = 0; i < 160; i++) __T.sanctuary.update(0.05)`);
    });
    console.log(logs3.slice(0, 12).join('\n') || 'desktop shots: no errors');
    ok('no page errors (desktop shots)', logs3.filter((l) => /PAGEERR|error:/.test(l)).length === 0, logs3.slice(0, 3));
    }
    /* ── phone ── */
    if (doPhone) {
      const logs2 = await session(b, file, 390, 844, async (pg) => {
        console.log('phone 390×844');
        await shot(pg, 'p1_ulam', `__T.sanctuary.setDoors(0); await __T.sanctuary.enter('ulam', { ms: 0 })`);
        await shot(pg, 'p2_heichal', `__T.sanctuary.setDoors(1); await __T.sanctuary.enter('heichal', { ms: 0 })`);
        await dc(pg, 'phone heichal', ``);
        await shot(pg, 'p3_heichal_night_ketoret', `__T.setTime('night'); __T.sanctuary.setGoldAltar({ coals: 1, smoke: 0.6 }); for (let i = 0; i < 160; i++) __T.sanctuary.update(0.05)`);
        await shot(pg, 'p4_kodesh_view', `__T.setTime('dawn'); __T.sanctuary.setGoldAltar({ coals: 0, smoke: 0 }); await __T.sanctuary.enter('kodesh-view', { ms: 0 })`);
        await dc(pg, 'phone kodesh-view', ``);
      });
      console.log(logs2.slice(0, 12).join('\n') || 'phone: no errors');
      ok('no page errors (phone)', logs2.filter((l) => /PAGEERR|error:/.test(l)).length === 0, logs2.slice(0, 3));
    }
  } finally { await b.close(); }
  console.log('draw calls per view: ' + JSON.stringify(calls));
  console.log(fails.length ? 'FAILS: ' + fails.join(' | ') : 'ALL PASS');
  process.exitCode = fails.length ? 1 : 0;
})();
