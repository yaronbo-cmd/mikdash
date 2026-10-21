// Functional test of the construction layer API (window.__T.stages). No screenshots; the simulation is
// advanced with __T.step(). Usage: node test/stages_api.cjs [dist/test.html]
const { chromium } = require('playwright');
(async () => {
  const [file = 'dist/test.html'] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await pg.addInitScript((g) => { if (g) window.__WANT_GAME = true; window.__FORCE_Q = 'normal'; if (!window.__WANT_GAME) window.__NO_GAME = true; }, !!process.env.GAME);
  const logs = [];
  pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  await pg.goto('file://' + require('path').resolve(file));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 180000 });
  await pg.evaluate(() => __T.pause(true));
  const res = await pg.evaluate(async () => {
    const S = __T.stages, out = {}, T = window.THREE_ || null;
    const settle = async (p, sec = 12) => { let v = 'pending'; p.then((x) => { v = x; }); for (let t = 0; t < sec && v === 'pending'; t += 0.5) { __T.step(0.5); await Promise.resolve(); await Promise.resolve(); } return v; };
    const pos = () => { const p = S.hero.position; return [+p.x.toFixed(1), +p.y.toFixed(1), +p.z.toFixed(1)]; };
    out.ids = S.ids.join(',');
    __T.buildMode();
    out.buildMode = { har: S.status('har').status, wall: S.status('wall').status, boulders: S.boulders.join(''), hero: pos() };
    // walk to a boulder, swing, crack + shatter
    out.walkBoulder = await settle(S.hero.walkTo({ boulder: 4 }));
    out.heroAtBoulder = pos();
    let impact = 'pending'; S.hero.swing().then((v) => { impact = v; });
    __T.step(0.2); await Promise.resolve(); out.impactAfter02 = impact;
    __T.step(0.3); await Promise.resolve(); out.impactAfter05 = impact;
    out.hit1 = await settle(S.hitBoulder(4), 3); out.state1 = S.boulders[4];
    out.hit2 = await settle(S.hitBoulder(4), 3); out.state2 = S.boulders[4];
    // picking: rays straight down onto boulder 0 and onto the Mount, and one into the sky
    const TH = __T, rc = new TH.Raycaster();
    const down = (x, z) => { rc.set(new TH.Vector3(x, 400, z), new TH.Vector3(0, -1, 0)); return S.pick(rc); };
    { const b0 = S.boulderSpots ? S.boulderSpots()[0] : [-172, -122]; out.pickBoulder0 = down(b0[0], b0[1]); }   // (site9: the field's rock 0, from the world)
    out.pickMount = down(0, 250);
    rc.set(new TH.Vector3(0, 400, 0), new TH.Vector3(0, 1, 0)); out.pickSky = S.pick(rc);
    // walk to the Mount work spot
    out.walkHar = await settle(S.hero.walkTo('har'));
    out.heroAtHar = pos();
    // build the Mount in steps
    S.setStage('har', 'building', 0); __T.step(0.5);
    out.harFound = S.status('har');
    S.setStage('har', 'building', 0.5); __T.step(3);
    out.harHalf = S.status('har'); out.groundAtHarSpot = +S.groundAt(246, 36).toFixed(2);
    S.setStage('har', 'done'); __T.step(1.5);
    out.harDone = S.status('har'); out.groundAfterHar = +S.groundAt(246, 36).toFixed(2);
    // walls, then across regions
    for (const id of ['wall', 'sorag', 'gates', 'nashim', 'nikanor']) { S.setStage(id, 'building', 0.3); __T.step(0.5); S.setStage(id, 'done'); __T.step(1.2); }
    out.walkWall = await settle(S.hero.walkTo('wall')); out.heroAtWall = pos();
    out.walkLishka = await settle(S.hero.walkTo('lishka'), 20); out.heroAtLishka = pos();
    out.walkHeichal = await settle(S.hero.walkTo('heichal'), 20); out.heroAtHeichal = pos();
    out.walkKiyor = await settle(S.hero.walkTo('kiyor'), 20); out.heroAtKiyor = pos();
    out.walkSorag = await settle(S.hero.walkTo('sorag'), 25); out.heroAtSorag = pos();
    // interrupted walk resolves false
    const p1 = S.hero.walkTo('nashim'); let r1 = 'pending'; p1.then((v) => { r1 = v; });
    __T.step(0.3); const p2 = S.hero.walkTo('nikanor'); await Promise.resolve(); out.interrupted = r1;
    out.walkNikanor = await settle(p2, 20); out.heroAtNikanor = pos();
    // FX + camera
    S.celebrate('nikanor'); S.workFX('wall'); __T.step(0.5);
    const c0 = __T.camera.position.clone(); S.focus('ulam'); __T.render && 0; out.focusCalled = true;
    out.siteCenterUlam = S.siteCenter('ulam').toArray().map((v) => +v.toFixed(1));
    // the rest of the Temple
    for (const id of S.ids) if (S.status(id).status !== 'done') { S.setStage(id, 'building', 0.2); __T.step(0.3); S.setStage(id, 'building', 0.9); __T.step(0.5); S.setStage(id, 'done'); __T.step(1.3); }
    out.allDone = S.ids.every((id) => S.status(id).status === 'done');
    out.lifePhase = __T.life.phase;
    out.hillVisible = S._dbg.hill.mesh.visible;
    out.craneVisible = S._dbg.crane.g.visible;
    out.workers = S._dbg.nWork;
    out.pickAfterDone = down(-40, -3);
    // back to build mode: locked + available sites are pickable again
    __T.buildMode(); __T.step(0.2);
    out.pickHarAvail = down(0, 250);
    return out;
  });
  console.log(JSON.stringify(res, null, 1));
  const bad = logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l));
  console.log(bad.length ? bad.join('\n') : 'no errors');
  await b.close();
})();
