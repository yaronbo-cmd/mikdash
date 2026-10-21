// Draw calls (one full frame: shadow-free scene + post, and the scene pass alone) in the world-API v2 states.
// Usage: node test/calls_api2.cjs [W] [H]
const { chromium } = require('playwright');
(async () => {
  const [W = '1280', H = '800'] = process.argv.slice(2);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: +W, height: +H } });
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__NO_GAME = true; });
  const logs = [];
  pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
  pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
  await pg.goto('file://' + require('path').resolve('dist/test.html'));
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 180000 });
  await pg.evaluate(() => __T.pause(true));
  const states = [
    ['demo (finished Temple)', "__T.demoMode(); __T.step(0.5)", 'olives'],
    ['build mode (hill, boulders)', "__T.buildMode(); __T.step(0.5)", 'olives'],
    ['showPlan (ghost of all stages)', "__T.buildMode(); __T.stages.setStage('har','building',0,{instant:true}); __T.stages.showPlan(2600); __T.step(1.9)", 'olives'],
    ['wall 0.55 + hot spot (day)', "__T.buildMode(); const S=__T.stages; S.setStage('har','done'); S.setBoulders([]); S.setStage('wall','building',0.55,{instant:true}); S.setStage('nashim','avail'); S.hero.place('wall'); S.hotspot('wall'); S.setQuarryStock(24,2); __T.step(2)", [190, 90, -230, 98, 20, -80]],
    ['same, night (braziers, lamps, lantern)', "__T.setTime('night'); __T.step(2)", [190, 90, -230, 98, 20, -80]],
    ['same, night + rain + combo', "__T.stages.rain(true); __T.stages.setComboLevel(5); __T.step(2)", [190, 90, -230, 98, 20, -80]],
    ['showcase (6 done + ghost of the rest)', "__T.setTime('dawn'); __T.stages.rain(false); __T.stages.setComboLevel(0); const S=__T.stages; for (const id of ['har','wall','sorag','gates','nashim','nikanor']) S.setStage(id,'done',1,{instant:true}); S.showcase(); __T.step(5.5)", 'olives'],
    ['heichal 0.7 (heaviest build)', "__T.buildMode(); const S=__T.stages; S.setBoulders([]); for (const id of S.ids.slice(0, 12)) S.setStage(id,'done',1,{instant:true}); S.setStage('ulam','done',1,{instant:true}); S.setStage('heichal','building',0.7,{instant:true}); S.setStage('kodesh','avail'); S.hero.place('heichal'); S.hotspot('heichal'); __T.step(2)", 'olives'],
    ['same, night + rain + vine 360', "__T.setTime('night'); __T.stages.rain(true); __T.stages.setVine(600); __T.step(6)", 'olives'],
    ['kodesh 1 + boxes + shine (night)', "const S=__T.stages; S.setStage('heichal','done',1,{instant:true}); S.setStage('kodesh','building',1,{instant:true}); S.boxes(0.4); S.shine(); __T.step(0.8); S.boxes(0.5)", [-102, 150, -72, -149, 113, 0]],
  ];
  const out = [];
  for (const [name, js, view] of states) {
    const r = await pg.evaluate(([js, view]) => {
      eval(js);
      if (typeof view === 'string') __T.jump(view); else __T.look(view.slice(0, 3), view.slice(3));
      __T.render(); __T.render();
      return __T.drawCalls();
    }, [js, view]);
    out.push(`${name.padEnd(42)} total ${String(r.total).padStart(4)}   scene ${String(r.scene).padStart(4)}   tris ${r.triangles}`);
  }
  console.log(out.join('\n'));
  const bad = logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l));
  console.log(bad.length ? bad.join('\n') : 'no errors');
  await b.close();
})();
