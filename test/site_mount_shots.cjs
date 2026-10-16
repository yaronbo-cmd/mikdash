// SITE8B (wave 8B) — the Mount's working patch, phone shots 390×844 (no game: the world driven directly, for looks only; the
// real-touch check is test/site_mount.cjs). Usage: node test/site_mount_shots.cjs [dist/test.html] [outDir]
// Shots: m1-start (the first frame: the builder at boulder 4 with the gangs, tools, the survey cord), m2-split (right after
// boulder 4 splits: the chunks as rubble), m3-patch (40 s later: the levelled, staked patch, the spoil heap, the carriers),
// m4-next (the next rock framed by boulderView), m5-wide (the rough Mount from above: the patches). Prints draw calls.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const file = path.resolve(process.argv[2] || 'dist/test.html'), out = process.argv[3] || 'test/out/site8/shots';
fs.mkdirSync(out, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: 390, height: 844 } });
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__NO_GAME = true; window.__DT_MAX = 0.6; });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  await pg.goto('file://' + file);
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 400000 });
  const shot = async (name, js) => {
    const r = await pg.evaluate((js) => { const S = __T.stages; const v = new Function('S', js)(S); if (v && v.p) __T.look(v.p, v.t); __T.render(); const d = __T.drawCalls(); __T.render(); const cart = __T.crews && __T.crews.mountCart; return { d, v, cart, workers: S._dbg.nWork }; }, js);
    await pg.screenshot({ path: `${out}/${name}.png`, timeout: 300000 });
    console.log(name, JSON.stringify(r.d), r.v && r.v.az !== undefined ? `az ${r.v.az.toFixed(0)} el ${r.v.el} dist ${r.v.dist.toFixed(0)}${r.v.blocked ? ' BLOCKED' : ''}` : '', 'cart', JSON.stringify(r.cart), 'workers', r.workers);
  };
  await pg.evaluate(() => { __T.pause(true); const h = document.getElementById('hint'); if (h) h.style.display = 'none'; const S = __T.stages; __T.buildMode(); S.setStage('har', 'building', 0.08); S.setWork('har', { phase: 'dig' }); S.setBoulders(new Array(12).fill(2)); S.hero.place({ boulder: 4 }); S.hero.show(true); __T.step(1.5); });
  await shot('m1-start', 'return S.boulderView(4);');
  await pg.evaluate(() => { const S = __T.stages; S.hitBoulder(4, 1); __T.step(0.6); S.hitBoulder(4, 0); __T.step(0.9); });
  await shot('m2-split', 'return S.boulderView(4);');
  await pg.evaluate(() => { __T.step(40, 0.1); });
  await shot('m3-patch', 'const v = S.boulderView(4); return v;');
  await pg.evaluate(() => { const S = __T.stages; S.hero.place({ boulder: 5 }); __T.step(1.5); });
  await shot('m4-next', 'return S.boulderView(5);');
  await pg.evaluate(() => { const S = __T.stages; for (const i of [5, 6, 3]) S.hitBoulder(i, 0); __T.step(20, 0.1); });
  await shot('m5-wide', 'return { p: [260, 150, -250], t: [150, -40, -40] };');
  await shot('m6-cart', 'const c = __T.crews.mountCart; const y = S.groundAt(c.x, c.z); return { p: [c.x + 26, y + 22, c.z + 30], t: [c.x, y + 1.5, c.z] };');
  await shot('m7-east', 'return { p: [318, 30, 40], t: [262, -40, 60] };');
  // the Mount's walls: DESIGN8B's CAM.WALL (stages.wallView, what focus('har') flies to in the walls' phases)
  await pg.evaluate(() => { const S = __T.stages; S.setBoulders(new Array(12).fill(0)); S.setWork('har', { phase: 'courses', stones: 300, stock: 8 }); __T.step(6, 0.1); S.hero.place('har'); __T.step(1); });
  await shot('m8-wall', 'return S.wallView(\'har\');');
  console.log(errs.length ? 'PAGE ERRORS: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  await b.close();
})().catch((e) => { console.error(e); process.exit(2); });
