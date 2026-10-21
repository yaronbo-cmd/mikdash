// SITE (wave 6) — the construction site API: siteInfo · setWork · nextSlot · slots · workSpot · frontView · liftStone,
// and the old setStage path. No screenshots. Usage: node test/site_api.cjs [dist/test.html]
const { chromium } = require('playwright');
(async () => {
  const [file = 'dist/test.html'] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__NO_GAME = true; window.__DT_MAX = 0.6; });
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.goto('file://' + require('path').resolve(file));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 180000 });
    await pg.evaluate(() => __T.pause(true));
    const res = await pg.evaluate(async () => {
      const S = __T.stages, fails = [], out = {};
      const ok = (name, cond, info) => { if (!cond) fails.push(name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
      const settle = async (p, sec = 12) => { let v = 'pending'; p.then((x) => { v = x; }); for (let t = 0; t < sec && v === 'pending'; t += 0.25) { __T.step(0.25); await Promise.resolve(); await Promise.resolve(); } return v; };
      const t0 = performance.now();
      out.info = {};
      for (const id of S.ids) { const i = S.siteInfo(id); out.info[id] = [i.kind, i.stones, i.courses, i.fronts, i.rounds, i.H, i.virtual ? 'v' : ''].join(' '); ok('stones ' + id, i.stones > 0, i); }
      out.layoutMs = Math.round(performance.now() - t0);
      // the Mount's survey / dig: no spot of SITE's (BUILD keeps the builder among the boulders — no walk before the first stroke)
      __T.buildMode(); S.setWork('har', { phase: 'survey' }); __T.step(0.3);
      ok('har survey: no workSpot', S.workSpot('har', 'survey') === null && S.workSpot('har', 'set') === null && !!S.workSpot('har', 'dress'));
      __T.buildMode(); S.setStage('har', 'done', undefined, { instant: true }); __T.step(0.5);
      const I = S.siteInfo('wall');
      // survey → dig → foundation (0 stones: the ghosts) → courses
      out.w0 = S.setWork('wall', { phase: 'survey' }); __T.step(0.5);
      ok('survey = before the stones', S.status('wall').status === 'building' && S.siteInfo('wall').set === 0);
      out.w1 = S.setWork('wall', { phase: 'foundation', stones: 0 }); __T.step(1);
      const s0 = S.nextSlot('wall'); out.slot0 = s0 && [s0.x, s0.y, s0.z, s0.w, s0.h, s0.course, s0.index].map((v) => +(+v).toFixed(2));
      ok('first slot on course 0', s0 && s0.course === 0 && s0.index === 0, s0);
      // one stone: exactly +1, the working front's stone
      out.w2 = S.setWork('wall', { phase: 'courses', stones: 1 }); __T.step(1.5);
      ok('one stone set', S.siteInfo('wall').set === 1, S.siteInfo('wall'));
      const s1 = S.nextSlot('wall'); ok('the next slot moved on', s1 && (s1.index === 1 || s1.course === 1) && s1.stone >= 1, s1);
      // a big jump ripples in (eased), then lands exactly
      S.setWork('wall', { stones: I.perCourse[0] + 5 }); __T.step(0.2); out.midRipple = S.siteInfo('wall').set; __T.step(3);
      out.afterJump = S.siteInfo('wall');
      ok('jump lands exactly', out.afterJump.set === I.perCourse[0] + 5 && out.afterJump.course === 1, out.afterJump);
      ok('ripple', out.midRipple > 1 && out.midRipple < I.perCourse[0] + 5, out.midRipple);
      // slots of course 0 are all set; workSpot kinds
      const sl = S.slots('wall', 0); ok('slots(course 0) all set', sl.length > 0 && sl.every((s) => s.set), sl.length);
      { const top = I.perCourse.reduce((a, n, c) => (n > 0 ? c : a), 0); ok('slots(top course) not empty', S.slots('wall', top).length > 0, [top, I.perCourse.slice(-3)]); }
      out.spots = ['set', 'dress', 'stock', 'survey', 'quarry'].map((k) => { const w = S.workSpot('wall', k); return k + ':' + (w ? [w.x, w.y, w.z].map((v) => v.toFixed(1)).join(',') + (w.stone ? ' stone' : '') : 'null'); });
      ok('workSpot dress has a stone', !!(S.workSpot('wall', 'dress') || {}).stone);
      out.frontView = S.frontView('wall');
      // liftStone: +1 at the working front, resolves after the lift
      const n0 = S.siteInfo('wall').set, ns = S.nextSlot('wall');
      const r = await settle(S.liftStone('wall'), 10); out.lift = r;
      ok('liftStone +1 at the working front', r && r.stones >= n0 + 1 && r.course === ns.course && r.index === ns.index, [n0, r, ns.course, ns.index]);
      // the stock pile feeds the crane (one stone off per lift); the dressing yard's spot; the ashlar export for carts
      S.setWork('wall', { stock: 5 }); const r2 = await settle(S.liftStone('wall'), 10);
      ok('a lift takes a stone off the stock', r2 && S._dbg.ST.wall.stock === 4, [r2, S._dbg.ST.wall.stock]);
      const yd = S.workSpot('wall', 'yard'); ok('workSpot yard', !!(yd && yd.along && yd.n), yd);
      ok('yard bankers (PEOPLE)', yd.bankers && yd.bankers.length === 3 && yd.bankers.map((b) => b.state).join() === 'dressed,drafted,rough' && yd.bankers.every((b) => b.stone && b.stone.h > 0.8 && Math.abs(b.stone.y - b.y - 1.6) < 0.2), yd.bankers);
      ok('ashlar export', !!(S.ashlar && S.ashlar.geometry && S.ashlar.material));
      // the old API: setStage(…, p) maps to stones; revealY-driven parts still move
      S.setStage('wall', 'building', 0.6); __T.step(3); const I6 = S.siteInfo('wall');
      ok('setStage p → stones', Math.abs(I6.set - Math.round((0.6 - 0.15) / 0.85 * I6.stones)) <= 1, I6.set);
      out.status6 = S.status('wall');
      S.setWork('wall', { phase: 'finish', finish: 0.5 }); __T.step(2); __T.step(2); ok('finish = all stones', S.siteInfo('wall').set === I.stones);
      // a lift cut short (the stage is done while the stone is in the air) still resolves — a caller never hangs
      S.setWork('wall', { phase: 'courses', stones: I.perCourse[0] + 12 }); __T.step(3);
      const pc = S.liftStone('wall'); for (let k = 0; k < 6; k++) { __T.step(0.25); await Promise.resolve(); }
      out.inFlight = !!S._dbg.crane.lift;
      S.setWork('wall', { phase: 'done' }); const rc = await settle(pc, 8); out.cutShort = rc;
      ok('a lift cut short resolves', rc !== 'pending' && out.inFlight, [rc, out.inFlight]);
      __T.step(1.5); ok('done', S.status('wall').status === 'done');
      // the altar (field) and the kiyor (cast)
      for (const id of ['wall', 'sorag', 'gates', 'nashim', 'nikanor', 'lishka']) S.setStage(id, 'done', undefined, { instant: true });
      S.setWork('yesod', { phase: 'courses', stones: 10 }); __T.step(2); ok('altar stones', S.siteInfo('yesod').set === 10);
      S.setWork('kiyor', { phase: 'courses', stones: 5 }); __T.step(2); ok('kiyor pours', S.siteInfo('kiyor').set === 5 && S.siteInfo('kiyor').kind === 'cast');
      // the kiyor's next pour by the crane (a glowing crucible on the hook), and the altar's next field stone
      const rk = await settle(S.liftStone('kiyor'), 12); out.kiyorLift = rk;
      ok('kiyor lift = the next pour', rk && rk.stones === 6 && S.siteInfo('kiyor').set === 6, rk);
      const ra = await settle(S.liftStone('yesod'), 12); out.altarLift = ra;
      ok('altar lift = the next field stone', ra && ra.stones === 11, ra);
      out.fails = fails;
      return out;
    });
    console.log(JSON.stringify(res, null, 1).slice(0, 4000));
    console.log(res.fails.length ? 'FAILS: ' + res.fails.join(' | ') : 'ALL PASS');
    const bad = logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l));
    console.log(bad.length ? bad.slice(0, 10).join('\n') : 'no errors');
  } finally { await b.close(); }
})();
