// SITE (wave 6) — phone shots of the construction site. Usage: node test/site_shots.cjs <outDir> [names…]
// Each shot runs its `js` (the page's __T / stages), then frames the camera from `cam` (a function body returning
// {p, t}) and renders once. Phone portrait 390×844 at dpr 1, quality 'normal'.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const HAR = "__T.buildMode(); S.setStage('har','done',undefined,{instant:true});";
const WALL = (w) => `${HAR} S.setWork('wall', ${w}); __T.step(4); __T.step(2);`;
const FV = "const f = S.frontView('wall'); return f;";
// set the stones so that the working front is halfway along its sector in course c (+ k more stones)
const MID = (id, c, extra = '') => `${HAR} ${extra} const sl = S.slots('${id}', ${c}); const m = sl[sl.length >> 1]; S.setWork('${id}', { phase: 'courses', stones: m.stone }); __T.step(4); __T.step(2);`;
const NEAR = "const s = S.nextSlot('wall'); return { p: [s.face[0] - 16, s.y + 7, s.face[2] - 26], t: [s.face[0] + 2, s.y - 1, s.face[2]] };";
// the crane from the side: its jib, the stock under the pick point and the face it sets on
const CR = "const C = S._dbg.crane, fx = C.fwd.x, fz = C.fwd.y, sx = fz, sz = -fx, by = C.g.position.y; return { p: [C.bx - fx * 12 + sx * 36, by + 17, C.bz - fz * 12 + sz * 36], t: [C.bx + fx * 11, by + 8, C.bz + fz * 11] };";
// the crane itself: the treadwheel, the A-frame, the jib and its stays
const CL = "const C = S._dbg.crane, fx = C.fwd.x, fz = C.fwd.y, sx = fz, sz = -fx, by = C.g.position.y; return { p: [C.bx - fx * 40 + sx * 26, by + 22, C.bz - fz * 40 + sz * 26], t: [C.bx + fx * 3, by + 19, C.bz + fz * 3] };";
const SHOTS = {
  wall_survey: { js: WALL("{ phase: 'survey' }"), cam: "return { p: [70, 22, -118], t: [96, 2, -74] };" },
  wall_dig: { js: WALL("{ phase: 'dig' }"), cam: "return { p: [78, 16, -106], t: [98, 1, -76] };" },
  wall_found: { js: WALL("{ phase: 'foundation', stones: 0 }"), cam: FV },
  wall_c3wide: { js: `${HAR} const I = S.siteInfo('wall'); const n = I.perCourse.slice(0, 3).reduce((a, b) => a + b, 0) + (I.perCourse[3] >> 1); S.setWork('wall', { phase: 'courses', stones: n }); __T.step(4); __T.step(2);`, cam: "return { p: [60, 34, -150], t: [80, 3, -74] };" },
  wall_c3near: { js: `${HAR} const I = S.siteInfo('wall'); const n = I.perCourse.slice(0, 3).reduce((a, b) => a + b, 0) + (I.perCourse[3] >> 1); S.setWork('wall', { phase: 'courses', stones: n }); __T.step(4); __T.step(2);`, cam: NEAR },
  wall_c3top: { js: `${HAR} const I = S.siteInfo('wall'); const n = I.perCourse.slice(0, 3).reduce((a, b) => a + b, 0) + (I.perCourse[3] >> 1); S.setWork('wall', { phase: 'courses', stones: n }); __T.step(4); __T.step(2);`, cam: "const s = S.nextSlot('wall'); console.warn(JSON.stringify([s.x, s.y, s.z, s.course, s.index], null, 0), JSON.stringify(S._dbg.ST.wall.U.uC.value), JSON.stringify(S._dbg.ST.wall.U.uTh.value.slice(0,3)), JSON.stringify(S._dbg.ST.wall.U.uW.value)); return { p: [s.face[0], 70, -140], t: [s.face[0], 0, -74] };" },
  wall_c3half: { js: MID('wall', 3), cam: FV },
  wall_c8: { js: MID('wall', 8), cam: "const f = S.frontView('wall', 40); return f;" },
  wall_c14: { js: MID('wall', 14), cam: "const f = S.frontView('wall', 46); return f;" },
  wall_top: { js: `${HAR} const I = S.siteInfo('wall'); S.setWork('wall', { phase: 'courses', stones: Math.round(I.stones * 0.92) }); __T.step(4); __T.step(2);`, cam: "const f = S.frontView('wall', 52); return f;" },
  wall_done: { js: WALL("{ phase: 'done' }"), cam: "return { p: [70, 40, -128], t: [96, 12, -74] };" },
  crane1: { js: MID('wall', 3, '') + " S.setWork('wall', { stock: 12, dressing: { rough: 1, drafted: 1, dressed: 2 } }); __T.step(0.5); window.__cs = S.nextSlot('wall'); window.__lift = S.liftStone('wall'); __T.step(1.5);", cam: CR },
  crane_look: { js: "__T.step(0.1);", cam: CL },
  crane2: { js: "__T.step(1.1);", cam: CR },
  crane3: { js: "__T.step(1.0);", cam: CR },
  yard: { js: MID('wall', 3, '') + " S.setWork('wall', { stock: 18, dressing: { rough: 2, drafted: 1, dressed: 1 } }); __T.step(0.5);", cam: "const w = S.workSpot('wall', 'yard'), [ax, az] = w.along, [nx, nz] = w.n; return { p: [w.x + ax * 15 - nx * 8, w.y + 6.5, w.z + az * 15 - nz * 8], t: [w.x - ax * 3, w.y + 0.8, w.z - az * 3] };" },
  quarry: { js: `${HAR} S.setQuarryStock(14); __T.step(0.5);`, cam: "return { p: [186.6, 9.5, -198.3], t: [203, 3, -205] };" },
  altar_mid: { js: `${HAR} for (const id of ['wall','sorag','gates','nashim','nikanor','lishka']) S.setStage(id,'done',undefined,{instant:true}); S.setStage('yesod','done',undefined,{instant:true}); const I = S.siteInfo('sovev'); S.setWork('sovev', { phase: 'courses', stones: I.perCourse[0] + I.perCourse[1] + 30 }); __T.step(4); __T.step(2);`, cam: "return { p: [-80, 30, 22], t: [-38, 13, -4] };" },
  // (WORLD7, wave 7) the altar's wide top in mid-build, from above and closer (the stripes)
  altar_top: { js: `${HAR} for (const id of ['wall','sorag','gates','nashim','nikanor','lishka']) S.setStage(id,'done',undefined,{instant:true}); S.setStage('yesod','done',undefined,{instant:true}); const I = S.siteInfo('sovev'); S.setWork('sovev', { phase: 'courses', stones: I.perCourse[0] + I.perCourse[1] + 30 }); __T.step(4); __T.step(2);`, cam: "return { p: [-44, 52, 28], t: [-38, 17, -3] };" },
};
(async () => {
  const [out = 'test/out/site', ...names] = process.argv.slice(2);
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__NO_GAME = true; window.__DT_MAX = 0.6; });
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.goto('file://' + path.resolve('dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 180000 });
    await pg.evaluate(() => { __T.pause(true); const h = document.getElementById('hint'); if (h) h.style.display = 'none'; });
    for (const name of (names.length ? names : Object.keys(SHOTS))) {
      const s = SHOTS[name], t0 = Date.now();
      const info = await pg.evaluate(({ js, cam }) => {
        const S = __T.stages; new Function('S', js)(S);
        const c = new Function('S', cam)(S); __T.look(c.p, c.t); __T.render();
        const d = __T.drawCalls ? __T.drawCalls() : null; __T.render();
        const C = S._dbg.crane, b = C.block;
        return { d, lift: C.lift ? { t: +C.lift.t.toFixed(2), landed: C.lift.landed, roll: +C.lift.roll.toFixed(2) } : null, blk: b.visible ? [b.position.x, b.position.y, b.position.z].map((v) => +v.toFixed(1)) : 0, base: [C.bx, C.bz].map((v) => +(+v).toFixed(1)), set: S.siteInfo('wall').set };
      }, s);
      const f = `${out}/${name}.png`;
      await pg.screenshot({ path: f, timeout: 240000 });
      console.log('shot', f, ((Date.now() - t0) / 1000).toFixed(1) + 's', info ? JSON.stringify(info) : '');
    }
    const bad = logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l));
    console.log(bad.length ? bad.slice(0, 8).join('\n') : 'no errors');
  } finally { await b.close(); }
})();
