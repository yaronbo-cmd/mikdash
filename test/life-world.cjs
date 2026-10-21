// The Life agent's full-world run: the morning Tamid highlights played through world.avodah in the real scene
// (dist/test.html, whole-Temple mode), screenshots at phone 390×844 and desktop 1280×720, draw calls per shot.
//   node build.mjs && NODE_PATH=<playwright> node test/life-world.cjs [phone|desktop]
// Choreography: a lamb from the lambs' chamber → the ring (inspected) → the cut-away → blood NE lower → the limbs to
// the kevesh, salted → up to the fire (flare, thicker smoke) → trumpets + Levites → the blessing → the prostration →
// the pens → washing at the kiyor.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/life');
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv[2];
const SIZES = [['phone', 390, 844], ['desktop', 1280, 720]].filter(([n]) => !only || n === only);

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  let fails = 0;
  try {
    for (const [name, W, H] of SIZES) {
      const pg = await b.newPage({ viewport: { width: W, height: H } });
      await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__NO_GAME = true; });
      const logs = [];
      pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text().slice(0, 400)); });
      pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
      await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
      await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 240000 });
      await pg.evaluate(() => {
        __T.pause(true);
        for (const id of ['hint', 'card']) { const e = document.getElementById(id); if (e) e.style.display = 'none'; }
        window.__W = { out: {}, dc: {}, fails: [] };
        window.ok = (n, c, i) => { if (!c) __W.fails.push(n + (i !== undefined ? ' ' + JSON.stringify(i) : '')); };
        window.settle = async (p, sec = 30) => { let v = 'pending'; Promise.resolve(p).then((x) => { v = x; }, (e) => { v = 'REJECTED ' + e; }); for (let t = 0; t < sec && v === 'pending'; t += 0.1) { __T.step(0.1, 0.05); await new Promise((r) => setTimeout(r, 0)); } return v; };
        window.run = async (sec) => { for (let t = 0; t < sec; t += 0.1) { __T.step(0.1, 0.05); await new Promise((r) => setTimeout(r, 0)); } };
        // a clear stage: nothing is offered before the morning Tamid (Pesachim 58b)
        __T.avodah.ambient(false);
      });
      // p, t: camera and target; or t = a JS expression giving [x, y, z] of the action, and p = an offset from it
      const shot = async (key, p, t) => {
        const t0 = Date.now();
        const dc = await pg.evaluate(([p, t, key]) => {
          if (typeof t === 'string') { t = eval(t); p = [t[0] + p[0], t[1] + p[1], t[2] + p[2]]; }
          __T.look(p, t); __T.render(); __T.render(); const d = __T.drawCalls(); __W.dc[key] = d; return d;
        }, [p, t, key]);
        await pg.screenshot({ path: path.join(OUT, `world_${key}_${name}.png`), timeout: 240000 });
        console.log(`shot world_${key}_${name}  calls ${dc.total} (scene ${dc.scene})  tris ${(dc.triangles / 1e6).toFixed(2)}M  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
      };
      const phase = async (label, fn) => { const t0 = Date.now(); await pg.evaluate(fn); console.log('  ' + label, ((Date.now() - t0) / 1000).toFixed(1) + 's'); };
      const tall = H > W;

      await phase('lamb out of the lambs chamber', async () => {
        const AV = __T.avodah;
        window.K = AV.kohen('tamid', { role: 'shochet', at: 'moked' });
        await settle(K.walkTo('lambsChamber'), 90);
        window.LAMB = AV.animal('lamb', 'lambsChamber');
        LAMB.inspect(true);
        window.LEAD = LAMB.leadTo('tamidRing', { by: K });
        await run(9);
      });
      const mid = '[(K._a.x + LAMB._h.x) / 2, K._a.y + 1.5, (K._a.z + LAMB._h.z) / 2]';
      await shot('1_lamb', tall ? [16, 11, 16] : [14, 9, 16], mid);
      await phase('at the ring', async () => {
        LAMB.inspect(false);
        __W.out.lead = await settle(LEAD, 120);
        ok('lamb at the ring', __W.out.lead === true);
        window.CUT = 0; window.SL = __T.avodah.slaughter(LAMB, 'tamidRing', { onCut: () => { CUT++; } });
        await run(2.6);
      });
      await shot('2_ring', tall ? [11, 8, 13] : [12, 7, 13], mid);
      await phase('cut-away, blood NE', async () => {
        __W.out.sl = await settle(SL, 30); ok('slaughter', __W.out.sl === true && CUT === 1);
        window.SP = __T.avodah.sprinkle('NE', 'lower');
        await run(9.5);
      });
      await shot('3_sprinkle', tall ? [15, 7, -16] : [15, 6, -15], '[K._a.x - 1, K._a.y + 2, K._a.z + 1]');
      await phase('limbs to the kevesh, salt', async () => {
        __W.out.sp = await settle(SP, 30); ok('sprinkle', __W.out.sp === true);
        __W.out.sp2 = await settle(__T.avodah.sprinkle('SW', 'lower'), 60);
        __W.out.limbs = await settle(__T.avodah.limbs('kevesh'), 150); ok('limbs on the kevesh', __W.out.limbs === true);
        window.SALT = __T.avodah.limbs('salt');
        await run(6);
      });
      await shot('4_limbs', tall ? [-26, 30, 64] : [-14, 26, 56], [-42, 18.5, 32]);
      await phase('limbs to the fire', async () => {
        __W.out.salt = await settle(SALT, 150); ok('salted', __W.out.salt === true);
        __T.avodah.smoke(1.6);
        window.FIRE = __T.avodah.limbs('fire');
        await run(26);
      });
      await shot('5_fire', tall ? [-2, 44, 30] : [-6, 40, 30], [-36, 25, -3]);
      await phase('trumpets and Levites', async () => {
        __W.out.fire = await settle(FIRE, 150); ok('limbs to the fire', __W.out.fire === true);
        __W.out.lev = await settle(__T.avodah.levites(true), 5);
        window.TR = __T.avodah.trumpets();
        await run(1.5);
      });
      await shot('6_levites', tall ? [-34, 23, 30] : [-30, 22, 30], [-9, 16, 0]);
      await phase('blessing', async () => {
        __W.out.tr = await settle(TR, 10); ok('trumpets', __W.out.tr === true);
        __W.out.bless = await settle(__T.avodah.blessing(true), 6); ok('blessing', __W.out.bless === true);
      });
      await shot('7_blessing', tall ? [-34, 38, 46] : [-36, 36, 44], [-62, 21, 4]);
      await phase('bow + the pens', async () => {
        __W.out.bow = await settle(__T.avodah.bow(true), 6);
        await run(1.5);
      });
      await shot('8_bow', tall ? [30, 46, 70] : [26, 40, 66], [72, 6, 6]);
      await pg.evaluate(async () => { await settle(__T.avodah.bow(false), 6); __T.avodah.pens.fill(60); await run(3); });
      await shot('9_pens', [140, 12, -492], [82, -30, -540]);
      // ambient life back on: two kohanim wash hands and feet at the kiyor (Tamid 1:4)
      await pg.evaluate(async () => { __T.avodah.ambient(true); window.KW = __T.avodah.kohen('kiyor-demo', { at: [-57, 26] }); __T.avodah._actors.list.find((a) => a === KW._a).ambient = true; KW.wash(); await run(4.5); });
      await shot('10_kiyor', tall ? [9, 6, 12] : [9, 5, 11], '[-62, 20, 21]');
      const res = await pg.evaluate(() => ({ out: __W.out, fails: __W.fails, stats: __T.avodah.stats }));
      console.log(name, JSON.stringify(res.out), JSON.stringify(res.stats));
      for (const f of res.fails) console.log('FAIL', f);
      const bad = logs.filter((l) => !/willReadFrequently|ERR_TUNNEL|fonts\.g/.test(l));
      if (bad.length) console.log(bad.slice(0, 12).join('\n'));
      fails += res.fails.length + bad.filter((l) => /PAGEERR|error/i.test(l)).length;
      await pg.close();
    }
  } finally { await b.close(); }
  console.log(fails ? `${fails} problems` : 'world run OK');
  process.exit(fails ? 1 : 0);
})();
