// WORKSA22: each work of the night / pen / wood in a lab court, by real touch (CDP) on the stand-in right thumb at 844×390:
// the work starts (the stage is set beside the hero), taps alone finish it, the acts carry points, the mentor line shows the source AFTER the end
// and not before, no red material in the props, no gore, no console errors. --shots writes PNGs to test/out/worksa22/.
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules node test/worksa22-touch.cjs [--shots] [--only=pen,wood] [--time=day]
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const ROOT = path.resolve(__dirname, '..'), OUT = path.join(ROOT, 'test/out/worksa22');
fs.mkdirSync(OUT, { recursive: true });
require(require.resolve('esbuild', { paths: [ROOT] })).buildSync({ entryPoints: [path.join(__dirname, 'worksa22-lab-entry.js')], bundle: true, format: 'iife', target: 'es2020', outfile: path.join(ROOT, 'test/out/worksa22-lab.bundle.js'), logLevel: 'warning', loader: { '.json': 'json' } });
const args = process.argv.slice(2), SHOTS = args.includes('--shots'), TIME = (args.find((a) => a.startsWith('--time=')) || '--time=night').slice(7);
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const IDS = ['watch', 'fire', 'lambs', 'pen', 'wood'], MAP = { watch: 'night', fire: 'moked', lambs: 'lambs', pen: 'pen', wood: 'wood' };
const results = []; const check = (n, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${n}${info ? '  · ' + info : ''}`); };
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage(); const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /worksa22|\[hands\]/.test(m.text()))) logs.push(m.type() + ' ' + m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.goto('file://' + path.join(ROOT, 'test/worksa22-lab.html') + '?time=' + TIME);
    await pg.waitForFunction(() => window.__LAB && __LAB.ready, null, { timeout: 90000 });
    const cdp = await ctx.newCDPSession(pg); const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const move = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchMove'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const G = (fn, a) => pg.evaluate(fn, a);
    const btn = async () => G(() => __LAB.btnCenter());
    const tapBtn = async (hold = 60) => { const c = await btn(); await down(9, c.x, c.y); await pg.waitForTimeout(hold); await up(9); };
    const dragBtn = async (dx) => { const c = await btn(); await down(9, c.x, c.y); await pg.waitForTimeout(40); for (let i = 1; i <= 4; i++) { await move(9, c.x + dx * i / 4, c.y); await pg.waitForTimeout(30); } await up(9); };
    const shot = async (name) => { if (!SHOTS) return; await G(() => { __LAB.render(); __LAB.render(); }); await pg.screenshot({ path: path.join(OUT, name + '.png') }); console.log('   shot test/out/worksa22/' + name + '.png'); };
    const M = (f) => G(f);
    for (const id of IDS) {
      if (ONLY.length && !ONLY.includes(id) && !ONLY.includes(MAP[id])) continue;
      const tag = `[${id}]`;
      await G((id) => { __LAB.stock.wood = 0; __LAB.run(id === 'watch' ? 'night' : id === 'fire' ? 'moked' : id); }, id);
      await pg.waitForTimeout(500);
      const st = await G((id) => __LAB.WORKS[id === 'watch' ? 'night' : id === 'fire' ? 'moked' : id].state(), id);
      check(`${tag} the stage is set (props drawn) and no red`, st.on && st.kit && (st.kit.box + st.kit.sph + st.kit.cyl) > 20 && st.reds === 0, JSON.stringify(st.kit) + ' reds ' + st.reds);
      const c0 = await G(() => (__LAB.coaches || []).slice(-1)[0] || '');
      check(`${tag} before the end: the hand's words, not the source`, c0 && !/טיוטה/.test(c0), c0);
      await shot(`${id}-0start`);
      // taps alone (a real touch on the thumb); the pen's water by a HOLD first
      let n = 0, shotMid = false; const t0 = Date.now();
      if (id === 'pen') {
        const c = await btn(); await down(9, c.x, c.y); await pg.waitForFunction(() => __LAB.M.wDone >= 2, null, { timeout: 40000, polling: 100 }).catch(() => {}); await shot('pen-1water-hold'); await up(9); await pg.waitForTimeout(200);
        const w = await G(() => __LAB.M.wDone); check(`${tag} a hold pours: the trough fills`, w >= 2, 'wDone ' + w);
      }
      while (!(await G(() => !!__LAB.result)) && Date.now() - t0 < 150000) {
        await tapBtn(); n++; await pg.waitForTimeout(id === 'pen' || id === 'fire' ? 420 : 520);
        if (!shotMid) { const p = await G(() => __LAB.M.progress); if (p >= 45) { shotMid = true; await shot(`${id}-2mid`); } }
      }
      const r = await G(() => __LAB.result);
      const acts = await G(() => __LAB.M.acts.length), pts = await G(() => __LAB.M.pts);
      check(`${tag} taps alone finish it`, !!r && r.ok && !r.skipped, `${n} taps, ${((Date.now() - t0) / 1000).toFixed(0)}s, r=${JSON.stringify(r && { q: r.quality, score: r.score, stars: r.stars })}`);
      check(`${tag} the acts carry points`, acts >= 3 && pts >= 30, `acts ${acts} pts ${pts}`);
      const hits = await G(() => __LAB.hits.length); check(`${tag} the "+N" of each act landed (juice.hit)`, hits >= acts, `hits ${hits}/${acts}`);
      const c1 = await G(() => __LAB.coaches.slice(-1)[0] || ''); check(`${tag} after the end: the mentor line with its source`, /טיוטה/.test(c1) && (/[א-ת]/.test(c1)), c1.slice(0, 120));
      if (id === 'pen') check(`${tag} the pen is labelled המחשה`, /המחשה/.test(c1), c1.slice(0, 80));
      if (id === 'wood') check(`${tag} the stock got the sound logs`, (await G(() => __LAB.stock.wood)) === 5, 'wood ' + (await G(() => __LAB.stock.wood)));
      const reds = await G((id) => __LAB.WORKS[id === 'watch' ? 'night' : id === 'fire' ? 'moked' : id].state().reds, id); check(`${tag} no red material at the end`, reds === 0, 'reds ' + reds);
      await shot(`${id}-3end`);
      await pg.waitForTimeout(3200);
      check(`${tag} the stage clears after the linger`, !(await G((id) => __LAB.WORKS[id === 'watch' ? 'night' : id === 'fire' ? 'moked' : id].state().on, id)));
    }
    // the aimed act: wood — a drag to the wrong side takes nothing
    if (!ONLY.length || ONLY.includes('wood')) {
      await G(() => { __LAB.stock.wood = 0; __LAB.run('wood'); }); await pg.waitForTimeout(400);
      await tapBtn(); await pg.waitForTimeout(700);          // log 0: turned (sound) → drag LEFT is wrong
      const p0 = await G(() => __LAB.M.pts); await dragBtn(-80); await pg.waitForFunction(() => __LAB.M.miss >= 1, null, { timeout: 20000, polling: 100 }).catch(() => {}); await pg.waitForTimeout(400);
      const w = await G(() => ({ miss: __LAB.M.miss, pts: __LAB.M.pts, bad: __LAB.M.bad, warn: __LAB.M.warn }));
      check('[wood] a drag to the wrong side: "עוד קצת", nothing taken', w.miss === 1 && w.pts === p0 && w.bad === 0, JSON.stringify(w));
      await dragBtn(80); await pg.waitForFunction(() => __LAB.M.good === 1, null, { timeout: 20000, polling: 100 }).catch(() => {});
      check('[wood] a drag to the right side lays it', (await G(() => __LAB.M.good)) === 1);
      await G(() => __LAB.WORKS.wood.stop());
    }
    check('no console errors', logs.length === 0, logs.slice(0, 4).join(' | '));
  } finally { await b.close(); }
  const ok = results.every(Boolean); console.log(ok ? `ALL ${results.length} PASS` : `${results.filter((x) => !x).length} FAIL of ${results.length}`); process.exit(ok ? 0 : 1);
})();
