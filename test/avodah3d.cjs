// world.avodah (PROJECT.md §12) — functional test in the Life lab (inner Temple, plain colours, fast to render).
// Every call of the contract is exercised; promises must resolve (never reject), unknown arguments must be ignored.
// Screenshots of the key moments go to test/out/life/api_*.png.
//   NODE_PATH=<playwright> node test/avodah3d.cjs [--no-shots]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/life');
fs.mkdirSync(OUT, { recursive: true });
require(require.resolve('esbuild', { paths: [ROOT] })).buildSync({ entryPoints: [path.join(__dirname, 'life-lab-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/life-lab.bundle.js'), logLevel: 'warning' });
const SHOTS = !process.argv.includes('--no-shots');

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let failed = 0;
  try {
    const pg = await b.newPage({ viewport: { width: 900, height: 560 } });
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.goto('file://' + path.join(__dirname, 'life-lab.html'), { timeout: 240000 });   // (a loaded machine)
    await pg.waitForFunction(() => window.__L && __L.ready, null, { timeout: 60000 });
    await pg.evaluate(() => {
      window.__R = { out: {}, fails: [] };
      window.ok = (name, cond, info) => { if (!cond) __R.fails.push(name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); };
      // advance the simulation until the promise settles (a macrotask between steps lets every await chain run)
      window.settle = async (p, sec = 30) => {
        let v = 'pending'; Promise.resolve(p).then((x) => { v = x; }, (e) => { v = 'REJECTED ' + e; });
        for (let t = 0; t < sec && v === 'pending'; t += 0.1) { __L.step(0.1, 0.05); await new Promise((r) => setTimeout(r, 0)); }
        return v;
      };
      window.near = (a, x, z, d = 1.5) => Math.hypot(a.x - x, a.z - z) < d;
      // advance a fixed time
      window.run = async (sec) => { for (let t = 0; t < sec; t += 0.1) { __L.step(0.1, 0.05); await new Promise((r) => setTimeout(r, 0)); } };
    });
    const shot = async (name, p, t) => {
      if (!SHOTS) return;
      await pg.evaluate(([p, t]) => { __L.look(p, t); __L.render(); }, [p, t]);
      await pg.screenshot({ path: path.join(OUT, 'api_' + name + '.png'), timeout: 120000 });
      console.log('shot api_' + name);
    };
    const phase = async (name, fn) => { const t0 = Date.now(); await pg.evaluate(fn); console.log('phase', name, ((Date.now() - t0) / 1000).toFixed(1) + 's'); };

    await phase('api + lambs chamber + kohen', async () => {
      const AV = __L.avodah, O = __R.out;
      const fns = ['kohen', 'animal', 'slaughter', 'sprinkle', 'limbs', 'libation', 'trumpets', 'levites', 'blessing', 'bow', 'fire', 'smoke', 'pilgrim', 'pilgrims', 'birdOffering', 'update'];
      O.missing = fns.filter((f) => typeof AV[f] !== 'function');
      ok('every §12 function exists', !O.missing.length, O.missing);
      ok('pens.fill + lambsChamber.count', typeof AV.pens.fill === 'function' && typeof AV.lambsChamber.count === 'function');
      O.chamber = AV.lambsChamber.count(6); ok('six lambs in the chamber', O.chamber === 6, O.chamber);
      window.K = AV.kohen('tamid', { garments: 'kohen', role: 'shochet' });
      ok('kohen handle', K && ['walkTo', 'face', 'carry', 'pose', 'remove'].every((f) => typeof K[f] === 'function'));
      ok('kohen(id) is idempotent', AV.kohen('tamid') === K);
      O.walkChamber = await settle(K.walkTo('lambsChamber'), 120);
      ok('walk to the lambs chamber', O.walkChamber === true && near(K._a, -172.5, -62.75, 2), [K._a.x, K._a.z]);
      window.LAMB = AV.animal('lamb', 'lambsChamber');
      ok('animal handle', LAMB && ['leadTo', 'inspect', 'hide', 'remove'].every((f) => typeof LAMB[f] === 'function'));
      O.chamberAfter = AV.lambsChamber.n;
      LAMB.inspect(true); __L.step(1.5);
      ok('inspected by torchlight (Tamid 3:4)', K._a.item === 'torch', K._a.item);
      // the lamb is led out on a rope
      window.LEAD = LAMB.leadTo('tamidRing', { by: K });
      await run(14);
    });
    await shot('lamb_led', [-120, 30, -30], [-150, 16, -55]);
    await phase('lead + slaughter', async () => {
      const AV = __L.avodah, O = __R.out;
      LAMB.inspect(false);
      ok('the torch is put away after the inspection', K._a.item === null, K._a.item);
      O.lead = await settle(LEAD, 120);
      ok('lead the lamb to the ring', O.lead === true && near(LAMB._h, -47, -33.5, 3.2), [LAMB._h.x, LAMB._h.z]);
      window.CUT = 0;
      window.SL = AV.slaughter(LAMB, 'tamidRing', { onCut: () => { CUT++; } });
      await run(2.5);
    });
    await shot('before_cut', [-36, 22, -22], [-46, 17.5, -34]);
    await phase('after the cut', async () => {
      const O = __R.out;
      O.slaughter = await settle(SL, 30);
      ok('slaughter resolves, cut called once', O.slaughter === true && CUT === 1, [O.slaughter, CUT]);
      ok('the kohen holds the mizrak with a little blood', K._a.item === 'mizrak' && K._a.fill === 1, [K._a.item, K._a.fill]);
      ok('the lamb is gone', !LAMB.alive);
    });
    await shot('mizrak', [-40, 20.5, -27], [-45.3, 18, -33.8]);
    await phase('sprinkle', async () => {
      const AV = __L.avodah, O = __R.out;
      O.sp1 = await settle(AV.sprinkle('NE', 'lower'), 60);
      window.MARKS1 = AV.stats.marks;
      ok('sprinkle NE lower', O.sp1 === true && MARKS1 >= 2, [O.sp1, MARKS1]);
    });
    await shot('sprinkle_ne', [-9, 23, -34], [-23, 18.5, -18.5]);
    await phase('sprinkle SW, yesod, upper', async () => {
      const AV = __L.avodah, O = __R.out;
      O.sp2 = await settle(AV.sprinkle('SW', 'lower'), 60);
      O.sp3 = await settle(AV.sprinkle('SW', 'yesod'), 30);
      O.sp4 = await settle(AV.sprinkle('SE', 'upper'), 60);
      ok('sprinkle SW lower / yesod / SE upper', O.sp2 === true && O.sp3 === true && O.sp4 === true, [O.sp2, O.sp3, O.sp4]);
      ok('upper: the kohen went up by the kevesh', K._a.y > 24.5, K._a.y);
      O.down = await settle(K.walkTo('kiyor'), 60);
      ok('down again to the kiyor', O.down === true && K._a.y < 20, K._a.y);
    });
    await phase('limbs to the kevesh', async () => {
      const AV = __L.avodah, O = __R.out;
      O.l1 = await settle(AV.limbs('kevesh'), 150);
      O.props = AV.stats.props;
      ok('limbs on the kevesh', O.l1 === true && O.props >= 6, [O.l1, O.props]);
      O.l2 = await settle(AV.limbs('salt'), 150);
      ok('salted', O.l2 === true && __L.actors.props.filter((p) => p.fill === 1).length >= 6);
    });
    await shot('limbs_kevesh', [-16, 26, 48], [-42, 19, 30]);
    await phase('limbs to the fire', async () => {
      const AV = __L.avodah, O = __R.out;
      window.FIREP = AV.limbs('fire');
      await run(16);
    });
    await shot('limbs_fire', [-8, 36, 24], [-32, 25, -2]);
    await phase('fire done, levites, trumpets, blessing', async () => {
      const AV = __L.avodah, O = __R.out;
      O.l3 = await settle(FIREP, 150);
      ok('limbs to the fire', O.l3 === true, O.l3);
      O.fire = AV.fire(1.6); O.smoke = AV.smoke(2);
      ok('fire / smoke accept levels', O.fire === true && O.smoke === true);
      O.lev = await settle(AV.levites(true), 5);
      ok('levites on the duchan', O.lev === true && __L.actors.list.filter((a) => a.variant === 'levite').length >= 12);
      window.TR = AV.trumpets();
      await run(1.4);
    });
    await shot('levites_trumpets', [-26, 21, 22], [-9, 16.5, 0]);
    await phase('blessing', async () => {
      const AV = __L.avodah, O = __R.out;
      O.tr = await settle(TR, 10); ok('trumpets resolve', O.tr === true);
      O.bl = await settle(AV.blessing(true), 5); ok('blessing', O.bl === true);
      O.blessUp = __L.actors.list.filter((a) => a.poseName === 'bless').length; ok('hands above the heads', O.blessUp >= 8, O.blessUp);
    });
    await shot('blessing', [-34, 34, 34], [-62, 20.5, 0]);
    await phase('bow', async () => {
      const AV = __L.avodah, O = __R.out;
      O.bl2 = await settle(AV.blessing(false), 5);
      O.p1 = AV.pilgrims(5); await run(20);
      O.bow = await settle(AV.bow(true), 5);
      O.kneel = __L.actors.list.filter((a) => a.poseName === 'kneel').length; ok('people prostrate', O.bow === true && O.kneel >= 3, O.kneel);
    });
    await shot('bow', [-8, 26, -20], [-40, 16, -40]);
    await phase('libation, pilgrims, birds, pens, graceful', async () => {
      const AV = __L.avodah, O = __R.out;
      O.bow2 = await settle(AV.bow(false), 5);
      O.lib = await settle(AV.libation('wine'), 80); O.lib2 = await settle(AV.libation('water'), 80);
      ok('libations', O.lib === true && O.lib2 === true, [O.lib, O.lib2]);
      const p1 = AV.pilgrim('olah'); O.pArr = await settle(p1.arrived, 120);
      ok('a pilgrim with a lamb', O.pArr === true && p1.animal && p1.animal.alive, O.pArr);
      const p2 = AV.pilgrim('yoledet'); O.pArr2 = await settle(p2.arrived, 60);
      ok('a woman with two birds', O.pArr2 === true && p2.animals.length === 2, O.pArr2);
      window.P2 = p2;
      O.bo = await settle(AV.birdOffering('olah'), 90); O.bc = await settle(AV.birdOffering('chatat'), 90);
      ok('bird offerings', O.bo === true && O.bc === true, [O.bo, O.bc]);
      // the Kohen Gadol burns the limbs, the Segan at his right (Tamid 7:3; Yoma 33a)
      O.kv2 = await settle(AV.limbs('kevesh'), 150);
      O.kg = await settle(AV.limbs('fire', { gadol: true }), 240);
      ok('the Kohen Gadol burns the limbs', O.kv2 === true && O.kg === true && [...AV._cast.values()].some((h) => h._a.alive && h._a.variant === 'gadol'), [O.kv2, O.kg]);
      O.lean = await settle(p1.pilgrim.pose('lean'), 3); ok('semicha pose', O.lean === true && p1.pilgrim._a.poseName === 'lean');
      const pk = AV.kohen('placed'); O.place = pk.place('kiyor');
      ok('place() is instant', O.place === true && near(pk._a, -60.4, 20, 0.05), [pk._a.x, pk._a.z]);
      await run(0.6);
      const rc = new __L.THREE.Raycaster(new __L.THREE.Vector3(-60.4, 60, 20), new __L.THREE.Vector3(0, -1, 0));
      O.pick = AV.pick(rc); ok('pick a kohen', O.pick && O.pick.kind === 'kohen' && O.pick.id === 'placed', O.pick && [O.pick.kind, O.pick.id]);
      O.pick0 = AV.pick(new __L.THREE.Raycaster(new __L.THREE.Vector3(-120, 60, 0), new __L.THREE.Vector3(0, -1, 0))); ok('pick nothing', O.pick0 === null);
      O.pick = O.pick && O.pick.kind;
      O.wash = await settle(pk.wash(), 40); ok('washing at the kiyor', O.wash === true && Math.hypot(pk._a.x + 63.5, pk._a.z - 20) < 4, [pk._a.x, pk._a.z]);
      O.amb = AV.ambient(true); await run(12); O.washers = [...AV._cast.keys()].filter((k) => k.startsWith('kiyor-')).length;
      ok('ambient: kohanim at the kiyor', O.amb === true && O.washers === 2, O.washers);
      O.amb0 = AV.ambient(false); await run(1.5);
      ok('ambient(false) clears them', O.amb0 === false && [...AV._cast.keys()].filter((k) => k.startsWith('kiyor-')).length === 0);
      O.pens = AV.pens.fill(40); ok('pens.fill', O.pens === 40, O.pens);
      O.pens0 = AV.pens.fill(12); ok('pens.fill down', O.pens0 === 12, O.pens0);
      // ── service13 ── the pens tended: the flock walks to the troughs, then to the hay; an unknown kind is the water
      O.tendW = AV.pens.tend('water'); O.tendH = AV.pens.tend('hay'); O.tendX = AV.pens.tend('bogus');
      ok('pens.tend (water, hay; unknown = water)', typeof O.tendW === 'number' && O.tendW > 0 && typeof O.tendH === 'number' && typeof O.tendX === 'number', `${O.tendW}/${O.tendH}/${O.tendX}`);
      // unknown arguments are ignored gracefully, nothing rejects
      O.g1 = await settle(K.walkTo('nowhere'), 2); O.g2 = AV.animal('dragon', 'x'); O.g3 = await settle(AV.limbs('bogus'), 2);
      O.g4 = await settle(AV.slaughter(null), 2); O.g5 = AV.fire('abc'); O.g6 = await settle(AV.sprinkle('XX', 'zz'), 60);
      O.g7 = K.carry('sword'); O.g8 = await settle(K.pose('dance'), 3); O.g9 = AV.lambsChamber.count('many'); ok('bad count keeps the chamber', O.g9 === AV.lambsChamber.n && O.g9 > 0, O.g9);
      ok('graceful', O.g1 === false && O.g2 === null && O.g3 === false && O.g4 === false && O.g5 === true && O.g6 === true && K._a.item === null && O.g8 === true,
        [O.g1, O.g2, O.g3, O.g4, O.g5, O.g6, K._a.item, O.g8]);
      AV.pilgrims(0); await run(3);
      O.stats = AV.stats;
    });
    await shot('pilgrims_birds', [-2, 22, 26], [-10, 15, 6]);
    // ── world api (s4) + yk ── (World agent, wave 3)
    await phase('world api (s4): lambs to choose, parts, facing', async () => {
      const AV = __L.avodah, O = __R.out, THREE = __L.THREE;
      AV.lambsChamber.count(6); await run(0.3);
      const pos = AV.lambsChamber.positions(); O.lambPos = pos.length;
      ok('lambsChamber.positions: six lambs with heads', pos.length === 6 && pos.every((q) => Array.isArray(q.head) && q.head.length === 3), pos.length);
      const q = pos[2], ray = new THREE.Raycaster(new THREE.Vector3(q.x + 0.3, 40, q.z), new THREE.Vector3(0, -1, 0));
      O.lambPick = AV.lambsChamber.pick(ray); ok('lambsChamber.pick finds the lamb under the ray', O.lambPick === 2, O.lambPick);
      const L2 = AV.animal('lamb', 'lambsChamber', { index: 2 });
      ok('animal(lamb, lambsChamber, { index }) takes the chosen lamb', L2 && Math.hypot(L2.position.x - q.x, L2.position.z - q.z) < 0.01, L2 && [L2.position.x, L2.position.z, q.x, q.z]);
      const ear = L2.partPosition('ear'), nose = L2.partPosition('nose'), tail = L2.partPosition('tail');
      O.parts = { ear, nose, tail, facing: L2.facing };
      const f = L2.forward, P = L2.position, d = (a) => (a[0] - P.x) * f[0] + (a[2] - P.z) * f[1];
      ok('partPosition: the nose ahead, the tail behind, the ear up', ear && nose && tail && d(nose) > 0.9 && d(tail) < -0.5 && ear[1] > P.y + 1.3, [d(nose), d(tail), ear && ear[1] - P.y]);
      ok('facing / forward agree', Math.abs(Math.atan2(f[0], f[1]) - L2.facing) < 1e-6 && L2.partPosition('wing-of-nothing') === null);
      L2.remove(); await run(1.2);
    });
    await phase('world api (s4): walkTo resolves on the wall clock', async () => {
      const AV = __L.avodah, O = __R.out;
      const K2 = AV.kohen('clock', { at: [-150, 45] });
      // no simulation steps at all: the wall-clock backstop must finish the walk (30 amot at 7 → 4.3 s; backstop ≤ 9.4 s)
      const t0 = performance.now(); let v = 'pending'; K2.walkTo([-120, 45], { speed: 7 }).then((x) => { v = x; });
      while (v === 'pending' && performance.now() - t0 < 12000) await new Promise((r) => setTimeout(r, 100));
      O.backstop = { v, sec: +((performance.now() - t0) / 1000).toFixed(1), x: K2._a.x };
      ok('a walk resolves with the loop stopped (backstop)', v === true && O.backstop.sec < 10 && Math.abs(K2._a.x + 120) < 0.01, O.backstop);
      // slow frames: one step after 2 s of wall clock moves the walker 2 s along its way (the pace of the clock)
      K2.walkTo([-150, 45], { speed: 7 });
      await new Promise((r) => setTimeout(r, 2000));
      __L.step(0.05, 0.05);
      O.catchup = +(-120 - K2._a.x).toFixed(1);
      ok('a walk keeps pace with the wall clock', O.catchup > 12, O.catchup);
      const t1 = performance.now(); let w = 'pending'; AV.wait(1.2).then((x) => { w = x; });
      while (w === 'pending' && performance.now() - t1 < 8000) await new Promise((r) => setTimeout(r, 100));
      ok('wait() resolves without steps', w === true && performance.now() - t1 < 6000, performance.now() - t1);
      let pz = 'pending'; K2.pose('bow').then((x) => { pz = x; }); let fz = 'pending'; K2.face([-150, 0]).then((x) => { fz = x; });
      const t2 = performance.now();
      while ((pz === 'pending' || fz === 'pending') && performance.now() - t2 < 9000) await new Promise((r) => setTimeout(r, 100));
      ok('pose() and face() resolve without steps', pz === true && fz !== 'pending', [pz, fz]);
      K2.remove(); await run(1);
    });
    await phase('yk: the Kohen Gadol\'s service (watch only)', async () => {
      const AV = __L.avodah, O = __R.out, Y = O.yk = {};
      ok('yomKippur exists', typeof AV.yomKippur === 'function');
      const Y_ = () => AV.ykState();
      Y.immersion = await settle(AV.yomKippur('immersion'), 40);
      Y.white = await settle(AV.yomKippur('white'), 60);
      Y.whiteDress = Y_().dress;
      Y.confession = await settle(AV.yomKippur('confession'), 60);
      Y.crowd = Y_().crowd; Y.bull = Y_().bull;
      ok('confession: in white, at his bull, the people in the azara', Y.confession === true && Y.whiteDress === 'gadol-white' && Y.bull && Y.crowd >= 20, Y);
      Y.lots = await settle(AV.yomKippur('lots'), 60);
      Y.goats = Y_().goats; Y.lotsProps = Y_().lots; Y.kalpi = Y_().kalpi;
      ok('lots: two goats, the kalpi, a lot on each head', Y.lots === true && Y.goats === 2 && Y.lotsProps === 2 && Y.kalpi, Y);
      Y.ketoret = await settle(AV.yomKippur('ketoret'), 60);
      Y.even = await settle(AV.yomKippur('even-shtiya'), 20);
      Y.machtaOnStone = __L.actors.props.some((p) => p.item === 'machtaGold');
      let counts = []; Y.sprinkle = await settle(AV.yomKippur('sprinkle', { onCount: (n) => counts.push(n) }), 30); Y.counts = counts.join('');
      ok('sprinkle: eight, counted', Y.sprinkle === true && Y.counts === '01234567' && Y.machtaOnStone, Y);
      Y.parochet = await settle(AV.yomKippur('parochet'), 30);
      Y.out = await settle(AV.yomKippur('machta-out'), 40);
      Y.machtaGone = !__L.actors.props.some((p) => p.item === 'machtaGold');
      Y.exit = await settle(AV.yomKippur('exit'), 120);
      Y.exitDress = Y_().dress; Y.exitX = +Y_().x.toFixed(1);
      ok('every step resolves true', ['immersion', 'white', 'ketoret', 'even', 'parochet', 'out', 'exit'].every((k) => Y[k] === true), Y);
      ok('machta taken out; home in his own clothes', Y.machtaGone && Y.exitDress === 'own' && Y.exitX > 60, Y);
      // superseded: a new step cancels the old one; 'end' clears the stage
      const p1 = AV.yomKippur('confession'); await run(0.5); const p2 = AV.yomKippur('lots');
      Y.super = [await settle(p1, 10), await settle(p2, 60)];
      ok('a newer step supersedes (false), the new one runs (true)', Y.super[0] === false && Y.super[1] === true, Y.super);
      Y.end = await settle(AV.yomKippur('end'), 5); await run(1.5);
      Y.left = { ...Y_(), props: __L.actors.props.filter((p) => ['goral', 'goral1', 'kalpi', 'machtaGold'].includes(p.item)).length };
      ok('end clears the stage', Y.end === true && !Y.left.dress && !Y.left.goats && !Y.left.bull && !Y.left.props && !Y.left.crowd && !Y.left.sheet, Y.left);
    });
    for (const [name, step, p, t] of [['yk_confession', 'confession', [-44, 28, -44], [-59, 18.5, -7]], ['yk_lots', 'lots', [2, 27, -8], [-22, 18, -32]]]) {
      await pg.evaluate(async (st) => { const AV = __L.avodah; const pr = AV.yomKippur(st); await settle(pr, 60); if (st === 'confession') { AV.yomKippur('confession'); await run(6.5); } }, step);
      await shot(name, p, t);
    }
    await pg.evaluate(async () => { await settle(__L.avodah.yomKippur('end'), 5); await run(1.5); });
    await phase('remove', async () => {
      const O = __R.out;
      K.remove(); await run(1.5);
      ok('kohen removed', !K._a.alive);
      O.dc = __L.drawCalls();
    });
    const res = await pg.evaluate(() => __R);
    console.log(JSON.stringify(res.out, null, 0).slice(0, 3000));
    const bad = logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l));
    if (bad.length) { console.log(bad.slice(0, 20).join('\n')); }
    for (const f of res.fails) console.log('FAIL', f);
    failed = res.fails.length + bad.filter((l) => /PAGEERR|error/i.test(l)).length;
    console.log(failed ? `${res.fails.length} FAILED checks` : 'ALL PASS');
  } finally { await b.close(); }
  process.exit(failed ? 1 : 0);
})();
