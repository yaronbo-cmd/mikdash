// The Life agent's lab: bundle test/life-lab-entry.js and render model sheets into test/out/life/.
//   node test/life-lab.cjs            build + all sheets (animals, actors, props)
//   node test/life-lab.cjs --build    only build test/out/life-lab.bundle.js
//   node test/life-lab.cjs animals    one sheet
// Needs NODE_PATH with playwright (see PROJECT.md §10). One browser, closed in finally.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/life');
fs.mkdirSync(OUT, { recursive: true });

function build() {
  const esbuild = require(require.resolve('esbuild', { paths: [ROOT] }));
  esbuild.buildSync({ entryPoints: [path.join(__dirname, 'life-lab-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/life-lab.bundle.js'), logLevel: 'warning' });
}
build();
if (process.argv.includes('--build')) { console.log('lab bundle built'); process.exit(0); }
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));

const SHEETS = {
  // close-ups in the Temple: blood marks at the NE corner (lower) and SE horn (upper), limbs on the kevesh, salted
  async service(pg) {
    await pg.evaluate(() => {
      window.run = async (sec) => { for (let t = 0; t < sec; t += 0.1) { __L.step(0.1, 0.05); await new Promise((r) => setTimeout(r, 0)); } };
      window.settle = async (p, sec = 60) => { let v = 'pending'; Promise.resolve(p).then((x) => { v = x; }); for (let t = 0; t < sec && v === 'pending'; t += 0.1) { __L.step(0.1, 0.05); await new Promise((r) => setTimeout(r, 0)); } return v; };
      window.MK = __L.avodah.kohen('m', { at: [-20, -24] }); MK.carry('mizrak'); MK._a.fill = 1;
    });
    return [
      { name: 'service_marks_ne', p: [-12, 22, -30], t: [-23, 19.5, -18.5], pre: 'settle(__L.avodah.sprinkle("NE", "lower", { kohen: MK })).then(() => settle(MK.walkTo([-14, -30])))' },
      { name: 'service_marks_se_upper', p: [-14, 30, 20], t: [-24, 25, 10.5], pre: 'settle(__L.avodah.sprinkle("SE", "upper", { kohen: MK })).then(() => settle(MK.walkTo([-38, 0])))' },
      { name: 'service_limbs', p: [-50, 22, 38], t: [-44.5, 18.5, 32], pre: 'settle(__L.avodah.limbs("kevesh"), 150).then(() => settle(__L.avodah.limbs("salt"), 150))' },
      { name: 'service_gadol', p: [-20, 19.6, 55.5], t: [-20, 18.8, 50], pre: '(window.GK = __L.avodah.kohen("gadol", { garments: "gadol", at: [-20, 50] }), settle(GK.face([-20, 60]), 5))' },
      { name: 'service_gadol_side', p: [-15.5, 19.2, 52.5], t: [-20, 18.6, 50] },
    ];
  },
  // every item, set down in a row (two rows), at twice life size so the details read; and the mizrak with blood
  async props(pg) {
    await pg.evaluate(() => {
      const C = __L.actors, items = __L.ITEMS.filter((k) => k !== 'rope');
      items.forEach((k, i) => {
        const row = i < 11 ? 0 : 1, col = row ? i - 11 : i;
        const p = C.prop(k, -10 + col * 2, k === 'staff' ? 1.75 * 2 : k === 'lamb' ? 0.9 : 0.35, row * 3.2, 0, { s: 2, fadeIn: false });
        if (row) p.z = 3.2 + (col % 2) * 0.4;   // (the second row is further from the first, so both can be framed)
        if (k === 'mizrak' || k === 'machta' || k === 'bowl' || k === 'limb') p.fill = 1;
      });
      __L.step(0.2);
    });
    return [
      { name: 'props_a', p: [-5.5, 4.2, 7.5], t: [-5.5, 0.5, 0] },
      { name: 'props_b', p: [5, 4.2, 7.5], t: [5, 0.5, 0] },
      { name: 'props_c', p: [-5.5, 4.2, 10.7], t: [-5.5, 0.6, 3.2] },
      { name: 'props_d', p: [4, 5.5, 12], t: [4, 1.2, 3.2] },
    ];
  },
  // the cast: kohen, Kohen Gadol (8 and 4 garments), Levites with instruments, trumpeter, pilgrims; front and back
  async actors(pg) {
    await pg.evaluate(() => {
      const L = __L, C = L.actors, A = L.animals;
      const row = [
        ['kohen', null, 'stand'], ['gadol', null, 'stand'], ['gadol-white', null, 'stand'], ['levite', 'kinor', 'stand'], ['levite', 'nevel', 'stand'],
        ['levite', 'cymbals', 'stand'], ['kohen', 'trumpet', 'stand'], ['pilgrim', 'rope', 'stand'], ['woman', 'cage', 'stand'],
      ];
      window.__cast = row.map(([v, it, p], i) => { const a = C.add(v, -16 + i * 4, 0, { yaw: 0 }); if (it && it !== 'rope') C.setItem(a, it); if (v === 'levite' || it === 'trumpet') a.playing = true; C.pose(a, p); return a; });
      const lamb = A.add('lamb', __cast[7].x + 0.6, 2.2, { yaw: Math.PI, calm: true }); __cast[7].rope = lamb;
      // the second row: carrying and poses
      const row2 = [['kohen', 'mizrak', 'stand', 1], ['kohen', 'limb', 'stand'], ['kohen', 'log', 'stand'], ['kohen', 'machta', 'stand'], ['kohen', 'kaf', 'stand'], ['kohen', 'lamb', 'stand'],
        ['kohen', null, 'bless'], ['kohen', null, 'kneel'], ['kohen', 'kuz', 'pour'], ['kohen', 'bread', 'stand'], ['kohen', 'teni', 'stand'], ['kohen', 'torch', 'stand']];
      window.__cast2 = row2.map(([v, it, p, fill], i) => { const a = C.add(v, -20 + i * 3.6, -9, { yaw: 0 }); if (it) C.setItem(a, it); if (fill) a.fill = 1; C.pose(a, p); return a; });
      L.step(1.0);
    });
    return [
      { name: 'actors_front', p: [0, 6.5, 26], t: [0, 2.2, 0] },
      { name: 'actors_back', p: [0, 6.5, -26], t: [0, 2.2, 0] },
      { name: 'actors_gadol_front', p: [-10.5, 3.6, 5.2], t: [-11, 2.5, 0] },
      { name: 'actors_gadol_back', p: [-11.5, 3.6, -5.2], t: [-11, 2.3, 0] },
      { name: 'actors_levites', p: [2.5, 3.4, 7.5], t: [0, 2.3, 0] },
      { name: 'actors_row2', p: [0, 7, 14], t: [0, 2, -9] },
    ];
  },
  // the folds north of the Mount, filled; and the lambs' chamber
  async pens(pg) {
    await pg.evaluate(() => {
      const L = __L;
      window.__pens = L.buildPens(L.scene, L.animals); __pens.fill(54);
      window.__ch = L.buildLambsChamber(L.scene, L.animals); __ch.count(6);
      L.step(2);
    });
    return [
      { name: 'pens_overview', p: [80, 30, -462], t: [85, -31, -540], url: '?temple=0&terrain=1' },
      { name: 'pens_close', p: [70, -18, -515], t: [60, -30, -545] },
      { name: 'pens_doves', p: [92, -24, -505], t: [101, -31, -515] },
    ];
  },
  // every animal kind in a row, walking / idle, from the front-left and the back-right
  async animals(pg) {
    await pg.evaluate(() => {
      const L = __L, A = L.animals;
      const kinds = ['lamb', 'ram', 'goat', 'bull', 'calf', 'dove', 'turtledove'];
      const xs = [-9, -5, -1, 4, 9, 1.2, 2.2], zs = [0, 0, 0, 0, 0, 5, 5.2];
      window.__zoo = kinds.map((k, i) => A.add(k, xs[i], zs[i], { yaw: 0.5, calm: true }));
      window.__zoo[1].inspect = 1;
      const w = A.add('lamb', -12, -6, { yaw: 0 }); A.walk(w, [[-12, 40]], 1.7);
      L.step(1.2);
    });
    return [
      { name: 'animals_front', p: [6, 5.5, 20], t: [3, 1.4, 0] },
      { name: 'animals_back', p: [-2, 6, -18], t: [3, 1.4, 0] },
      { name: 'animals_close_lamb', p: [-5.5, 2.6, 5.6], t: [-8.6, 1.2, 1.2] },
      { name: 'animals_close_doves', p: [3.6, 1.6, 7.6], t: [1.7, 0.3, 5] },
      { name: 'animals_close_goat_ram', p: [-0.5, 3.2, 7.5], t: [-3, 1.4, 0] },
    ];
  },
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const [name, fn] of Object.entries(SHEETS)) {
      if (only.length && !only.includes(name)) continue;
      const pg = await b.newPage({ viewport: { width: 900, height: 560 } });
      const logs = [];
      pg.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') logs.push(m.type() + ': ' + m.text()); });
      pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
      await pg.goto('file://' + path.join(__dirname, 'life-lab.html') + (name === 'pens' ? '?temple=0&terrain=1' : name === 'service' ? '' : '?temple=0'), { timeout: 240000 });   // (a loaded machine: the bundle's first run can take minutes)
      await pg.waitForFunction(() => window.__L && __L.ready, null, { timeout: 60000 });
      const shots = await fn(pg);
      for (const s of shots) {
        const t0 = Date.now();
        if (s.pre) await pg.evaluate(s.pre);
        await pg.evaluate((s) => { __L.look(s.p, s.t); __L.render(); }, s);
        const f = path.join(OUT, s.name + '.png');
        await pg.screenshot({ path: f, timeout: 120000 });
        console.log('shot', path.relative(ROOT, f), ((Date.now() - t0) / 1000).toFixed(1) + 's');
      }
      const dc = await pg.evaluate(() => __L.drawCalls());
      console.log(name, 'draw calls', JSON.stringify(dc));
      console.log(logs.length ? logs.join('\n') : 'no errors');
      await pg.close();
    }
  } finally { await b.close(); }
})();
