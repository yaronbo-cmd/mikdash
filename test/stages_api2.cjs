// Functional test of the world API v2 (GDD §12 + juice, night, timelapse). No screenshots; the world is advanced
// with __T.step(). Runs without the game (window.__NO_GAME). Usage: node test/stages_api2.cjs [dist/test.html]
const { chromium } = require('playwright');
(async () => {
  const [file = 'dist/test.html'] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 1280, height: 800 } });
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__NO_GAME = true; });
  const logs = [];
  pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  await pg.goto('file://' + require('path').resolve(file));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 180000 });
  await pg.evaluate(() => __T.pause(true));
  const res = await pg.evaluate(async () => {
    const S = __T.stages, D = S._dbg, out = {}, fails = [];
    const ok = (name, cond, info) => { if (!cond) fails.push(name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
    const settle = async (p, sec = 12) => { let v = 'pending'; p.then((x) => { v = x; }); for (let t = 0; t < sec && v === 'pending'; t += 0.25) { __T.step(0.25); await Promise.resolve(); await Promise.resolve(); } return v; };
    const r1 = (v) => Math.round(v * 10) / 10;
    // exact names, as the game feature-detects them
    const fns = ['hotspot', 'screenPos', 'setCraneSite', 'showPlan', 'orbit', 'showcase', 'redLine', 'boxes', 'setVine', 'rain', 'shine', 'strikeFX', 'setComboLevel', 'playTimelapse', 'setQuarryStock'];
    out.missing = fns.filter((f) => typeof S[f] !== 'function');
    out.heroTool = typeof S.hero.setTool; out.quarry = S.quarry; out.hasQuarry = S.hasQuarry;
    // (the game drives Object.create(stages): everything must work through the prototype)
    const W = Object.create(S);
    __T.buildMode();
    // hit points: a perfect hit takes a whole boulder at once
    out.hitHp0 = await settle(W.hitBoulder(2, 0), 3); out.b2 = S.boulders[2];
    out.hitHp1 = await settle(W.hitBoulder(3, 1), 3); out.b3 = S.boulders[3];
    out.hitNoHp = await settle(W.hitBoulder(3), 3); out.b3b = S.boulders[3];
    ok('hp0 shatters', out.b2 === 0); ok('hp1 cracks', out.b3 === 1); ok('no hp steps', out.b3b === 0);
    // screen anchors
    const sp = W.screenPos({ boulder: 4 }); out.spBoulder = sp && [r1(sp.x), r1(sp.y), sp.on];
    const own = { x: 0, y: 0, on: false }; out.spOwn = W.screenPos('hero', own) === own;
    out.spBad = W.screenPos('nope');
    ok('screenPos boulder', sp && typeof sp.x === 'number');
    // the platform, then several sites
    S.setStage('har', 'done'); S.setBoulders([]); __T.step(1.5);
    out.quarryOn = D.quarryOn; ok('quarry shown after har', D.quarryOn === true);
    out.walkQuarry = await settle(W.hero.walkTo('quarry'), 20); out.heroAt = S.hero.at;
    ok('walk to quarry', out.walkQuarry === true && out.heroAt === 'quarry');
    const rc = new __T.Raycaster();
    rc.set(new __T.Vector3(208, 300, -208), new __T.Vector3(0, -1, 0)); out.pickQuarry = S.pick(rc);
    ok('pick quarry', out.pickQuarry && out.pickQuarry.kind === 'quarry');
    const n0 = S._dbg.nWork; W.setQuarryStock(20, 2); __T.step(0.2); out.quarrymen = S._dbg.nWork - n0;
    ok('quarrymen', out.quarrymen === 4, out.quarrymen);
    W.hero.setTool('iron'); out.tool1 = S.hero.tool; W.hero.setTool('wood'); out.tool2 = S.hero.tool;
    ok('tool swap', out.tool1 === 'iron' && out.tool2 === 'wood');
    // the crane: the latest started site, then the preferred one, and it is not stolen by progress updates
    S.setStage('wall', 'building', 0.5); __T.step(1);
    S.setStage('sorag', 'building', 0.5); __T.step(1);
    out.crane1 = D.crane.st && D.crane.st.id;
    W.setCraneSite('wall'); __T.step(0.1); out.crane2 = D.crane.st && D.crane.st.id;
    S.setStage('sorag', 'building', 0.6); __T.step(0.1); out.crane3 = D.crane.st && D.crane.st.id;
    W.setCraneSite(null); __T.step(0.1); out.crane4 = D.crane.st && D.crane.st.id;
    ok('crane latest', out.crane1 === 'sorag'); ok('crane preferred', out.crane2 === 'wall'); ok('crane kept on progress', out.crane3 === 'wall'); ok('crane back to latest', out.crane4 === 'sorag');
    W.setCraneSite('wall'); __T.step(0.1);
    // the hot spot rises with the reveal
    W.hotspot('wall'); __T.step(0.5); const y1 = D.hs.pos.y;
    S.setStage('wall', 'building', 0.8); __T.step(2); const y2 = D.hs.pos.y;
    out.hot = { vis: D.hs.a > 0.5, y1: r1(y1), y2: r1(y2) };
    ok('hotspot rises', y2 > y1 + 5, out.hot);
    const shs = W.screenPos('wall'); out.spWall = shs && [r1(shs.x), r1(shs.y), shs.on];
    rc.set(new __T.Vector3(D.hs.pos.x, D.hs.pos.y + 50, D.hs.pos.z), new __T.Vector3(0, -1, 0)); out.pickHot = S.pick(rc);
    ok('pick hotspot', out.pickHot && out.pickHot.id === 'wall');
    W.hotspot(null); __T.step(0.5); ok('hotspot off', D.hs.a < 0.05);
    // juice
    W.setComboLevel(3); out.combo = D.combo;
    W.strikeFX('wall', 'normal'); W.strikeFX('wall', 'perfect', 1); W.strikeFX('wall', 'combo', 4); W.strikeFX({ boulder: 1 }, 'perfect'); W.strikeFX('quarry', 'combo', 2); __T.step(0.3);
    W.setComboLevel(0);
    // the vision and the showcase
    out.plan = await settle(W.showPlan(1200), 4);
    out.show = await settle(W.showcase(), 14);
    ok('showPlan resolves', out.plan === true); ok('showcase resolves', out.show === true);
    // orbit: completes, and a flight cancels it
    S.setStage('gates', 'done'); __T.step(1);
    out.orbit = await settle(W.orbit('gates', 1.5), 4);
    const po = W.orbit('gates', 3); __T.step(0.3); __T.flyToPos(new __T.Vector3(500, 300, 0), new __T.Vector3(0, 0, 0), 800);
    let ov = 'pending'; po.then((v) => { ov = v; });
    for (let i = 0; i < 20 && ov === 'pending'; i++) { __T.render(); await Promise.resolve(); }
    out.orbitCancel = ov;
    ok('orbit resolves', out.orbit === true); ok('orbit cancelled by a flight', out.orbitCancel === false);
    // key moments
    W.redLine(0.5); __T.step(0.3); out.redOn = D.ST.sovev && S._dbg.hs && true;
    W.boxes(0); __T.step(0.2); W.boxes(0.5); __T.step(0.2); out.boxesOn = D.bx.on; out.boxWorkers = D.W.slice(0, D.nWork).filter((w) => w.role === 'winch').length;
    W.boxes(1); __T.step(0.5); W.boxes(1); __T.step(2); out.boxesAuto = D.bx.on;
    ok('boxes shown', out.boxesOn === true && out.boxWorkers === 2, out); ok('boxes auto-hide', out.boxesAuto === false);
    // the golden vine (QA P1-3, wave 4): hidden until the Ulam is finished, then hung — its stems and a first foliage
    // (44 leaves, 6 grapes, 2 clusters) — and growing with the player's leaves, grapes and clusters; grown in demoMode
    const K = D.vine.kinds, cnt = () => K.map((k) => k.m.count).join();
    W.setVine(25); __T.step(3); out.vineBefore = [cnt(), D.vine.grp.visible];
    ok('vine hidden before the Ulam', out.vineBefore[0] === '0,0,0' && !out.vineBefore[1], out.vineBefore);
    S.setStage('ulam', 'done'); __T.step(0.5); out.vineHanging = [cnt(), +D.vine.stemT.toFixed(2), D.vine.grp.visible];
    __T.step(4); out.vine25 = cnt();
    ok('vine hangs with the Ulam: stems first, then 44 + 25 leaves', out.vineHanging[0] === '0,0,0' && out.vineHanging[1] > 0 && out.vineHanging[2] && out.vine25 === '69,14,4', [out.vineHanging, out.vine25]);
    W.setVine(0); __T.step(3); out.vine0 = cnt(); ok('vine stays hung with 0 leaves', out.vine0 === '44,6,2' && D.vine.grp.visible, out.vine0);
    W.setVine({ leaves: 10, grapes: 3, clusters: 1 }); __T.step(3); out.vineObj = cnt(); ok('vine counts the player\'s grapes and clusters', out.vineObj === '54,9,3', out.vineObj);
    W.setVine(500); __T.step(6); out.vine500 = cnt(); ok('vine cap', out.vine500 === '360,120,36', out.vine500);
    W.setVine(0, null, { demo: true }); __T.step(4); out.vineDemo = cnt(); ok('the investor demo shows it grown', out.vineDemo === '300,96,30', out.vineDemo);
    S.setStage('ulam', 'locked'); __T.step(3); out.vineOff = [cnt(), D.vine.grp.visible]; ok('vine off with the Ulam unbuilt', out.vineOff[0] === '0,0,0' && !out.vineOff[1], out.vineOff);
    out.vineState = S.vineState();
    // the crews' read-only views (wave 4): crane(out) and scaffold(id)
    const co = {}; out.crane = S.crane(co); out.craneSame = out.crane === co;
    const sc = S.scaffold('wall'); out.scaff = sc && { runs: sc.runs.length, lift: sc.lift, view: sc.view, level: sc.level(sc.runs[0]) };
    ok('crane() and scaffold()', out.crane && out.crane.site === 'wall' && out.craneSame && typeof out.crane.x === 'number' && sc && sc.runs.length === 7 && typeof out.scaff.level === 'number' && S.scaffold('nope') === null, [out.crane, out.scaff]);
    W.rain(true); __T.step(3); out.rainK = r1(D.rain.k); W.rain(false); __T.step(4); out.rainK0 = D.rain.k;
    ok('rain', out.rainK > 0.8 && out.rainK0 === 0, [out.rainK, out.rainK0]);
    out.shine = await settle(W.shine(), 5); ok('shine resolves', out.shine === true);
    // timelapse: two sites, one to done, one to a progress; a live update during the replay moves its end
    const tlP = W.playTimelapse([{ id: 'nashim', from: 0, to: 1 }, { id: 'nikanor', a: { status: 'avail', p: 0 }, b: { status: 'building', p: 0.6 } }], 2400, { camera: false });
    __T.step(1.5); S.setStage('nikanor', 'building', 0.7);
    out.tl = await settle(tlP, 6);
    out.tlNashim = S.status('nashim'); out.tlNikanor = S.status('nikanor');
    ok('timelapse resolves', out.tl === true); ok('timelapse done', out.tlNashim.status === 'done'); ok('timelapse moved end', Math.abs(out.tlNikanor.progress - 0.7) < 0.01, out.tlNikanor);
    // night: braziers, lamps, the lantern, the two work lights
    __T.setTime('night'); __T.step(1.5);
    out.night = { k: r1(D.nightK), glows: D.glows.hi, flames: D.flames.count, L0: r1(__T.life.workLights[0].intensity), L1: r1(__T.life.workLights[1].intensity), visible: __T.life.workLights.map((l) => l.visible) };
    ok('night lights', D.nightK > 0.9 && D.flames.count > 0 && __T.life.workLights[0].intensity > 0, out.night);
    __T.setTime('dawn'); __T.step(3); out.day = { k: D.nightK, flames: D.flames.count, vis: __T.life.workLights.map((l) => l.visible) };
    ok('day off', D.nightK === 0 && D.flames.count === 0, out.day);
    // per-frame cost with everything running
    W.setComboLevel(5); W.hotspot('sorag'); W.rain(true); W.setVine(200); W.boxes(0.3); __T.setTime('night');
    const t0 = performance.now(); for (let i = 0; i < 300; i++) S.update(1 / 60); out.msPerFrame = +((performance.now() - t0) / 300).toFixed(3);
    __T.setTime('dawn'); W.rain(false); W.boxes(null); W.setComboLevel(0);
    // the whole-Temple view clears the transient effects
    W.showPlan(3000); __T.step(0.5); __T.demoMode(); __T.step(0.2); out.demoPlan = D.plan.on;
    ok('demo clears', out.demoPlan === false);
    // the finished Temple shows the golden vine grown, at once (QA P1-3); the game taking over gives the player's own
    out.vineWhole = [K.map((k) => k.m.count).join(), D.vine.grp.visible, D.vine.stemT];
    ok('whole view: the vine grown', out.vineWhole[0] === '300,96,30' && out.vineWhole[1] && out.vineWhole[2] === 1, out.vineWhole);
    W.setVine(7); __T.step(0.1); out.vineBack = K.map((k) => k.m.count).join();
    ok('the game takes over: a cut to the player\'s vine', out.vineBack === '51,8,2', out.vineBack);
    out.fails = fails;
    return out;
  });
  console.log(JSON.stringify(res, null, 0).replace(/,"/g, ',\n "'));
  const bad = logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l));
  console.log(bad.length ? bad.join('\n') : 'no errors');
  console.log(res.fails && res.fails.length ? 'FAILS: ' + res.fails.join(' | ') : 'ALL PASS');
  await b.close();
})();
