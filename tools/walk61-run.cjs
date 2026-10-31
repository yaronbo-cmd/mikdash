// build 61 — the free walk and the lifted look, played by touch on stage 02 (the court wall) in a browser: a new game straight to stage 02
// (?h45go=1), then a left-thumb drag one way and another (he walks where the thumb says, along the wall), a right-thumb drag up and down (the
// look lifts to the horizon and back), a tap (he walks to the work by himself), and the wall's share from world61 while the crews lay.
//   node tools/walk61-run.cjs [--size 844x390] [--out DIR] [--page out/index.html]
// Prints each step's numbers; shots in DIR/w61-<name>.png. Never a Divine Name.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const [VW, VH] = opt('--size', '844x390').split('x').map(Number), OUT = opt('--out', '/tmp/w61'), PAGE = path.resolve(__dirname, '..', opt('--page', 'out/index.html'));
fs.mkdirSync(OUT, { recursive: true });
const t0 = Date.now(), el = () => Math.round((Date.now() - t0) / 100) / 10;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'] });
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript(() => { window.__FORCE_Q = 'low'; try { if (!sessionStorage.getItem('w61')) { sessionStorage.setItem('w61', '1'); localStorage.clear(); } } catch (e) { /* */ } });
  const pg = await ctx.newPage(), errors = [];
  pg.on('pageerror', (e) => errors.push(String(e.message).slice(0, 300)));
  await pg.goto('file://' + PAGE + '?h45go=1', { waitUntil: 'load', timeout: 180000 });
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 240000, polling: 500 });
  await pg.evaluate(() => { window.__T.pause(true); window.__T.simulate(true, 0.05); });
  const on = await pg.waitForFunction(() => globalThis.__H42 && globalThis.__H42.on, null, { timeout: 90000, polling: 300 }).then(() => true).catch(() => false);
  console.log('har42 on', on, el()); if (!on) { console.log(JSON.stringify(errors)); await b.close(); process.exit(1); }
  const W = () => pg.evaluate(() => { const w = globalThis.__H42.walk61(), h = globalThis.__H42.heroBox(); return { ...w, hero: [Math.round(h.x * 10) / 10, Math.round(h.z * 10) / 10], sig: globalThis.__H42.sig(), line: globalThis.__H42.line() }; });
  // the opening's end: the first part's walk (pending) or its act
  await pg.waitForFunction(() => { const s = globalThis.__H42.walk61(); return s.part && s.part !== 'open'; }, null, { timeout: 120000, polling: 300 }).catch(() => {});
  // (the first part's place is where a new stage puts him: step him 20 amot off it, onto the open ground north of the wall, in the same tick
  // the morning's card goes — so the walk is his to make)
  await pg.evaluate(() => { const t = globalThis.__H42.walk61().target; if (t) window.__T.stages.hero.setPos(t.x + 18, t.z - 9, 0); document.querySelectorAll('.h42-card button[data-b="go"]').forEach((x) => x.click()); });
  console.log('ready', el(), JSON.stringify(await W()));
  const shot = async (name) => { await pg.evaluate(() => window.__T.simulate(false)); await pg.evaluate(() => window.__T.render()); await pg.screenshot({ path: path.join(OUT, `w61-${name}.png`), timeout: 240000 }); await pg.evaluate(() => window.__T.simulate(true, 0.05)); console.log('shot', name, el()); };
  const ev = (type, id, x, y) => pg.evaluate(([type, id, x, y]) => { const w = document.querySelector('.h42-walk'); if (!w) return false; w.dispatchEvent(new PointerEvent(type, { pointerId: id, clientX: x, clientY: y, bubbles: true, cancelable: true, pointerType: 'touch', isPrimary: id === 1 })); return true; }, [type, id, x, y]);
  const wait = (ms) => pg.waitForTimeout(ms);
  await shot('0-start');
  const away = (dx, dz) => pg.evaluate(([dx, dz]) => { const t = globalThis.__H42.walk61().target; if (t) window.__T.stages.hero.setPos(t.x + dx, t.z + dz, 0); }, [dx, dz]);
  const drag = async (id, x0, y0, dx, dy, holdMs) => { await ev('pointerdown', id, x0, y0); for (let i = 1; i <= 8; i++) { await ev('pointermove', id, x0 + (dx * i) / 8, y0 + (dy * i) / 8); await wait(30); } await wait(holdMs); await ev('pointerup', id, x0 + dx, y0 + dy); };
  // 1. the right thumb up: the look lifts (he stands away from the work: no work begins)
  await drag(2, VW * 0.8, VH * 0.75, 0, -160, 0); await wait(1500);
  const h1 = await W(), cam1 = await pg.evaluate(() => globalThis.__H42.camAt()); await shot('1-lifted');
  console.log('lift', h1.lift, 'cam', JSON.stringify(cam1.p.map((v) => Math.round(v))), '→', JSON.stringify(cam1.t.map((v) => Math.round(v))), h1.part, 'pending', h1.pending);
  // 2. back down
  await drag(2, VW * 0.8, VH * 0.2, 0, 160, 0); await wait(1500); const h2 = await W(); console.log('down', h2.lift); await shot('2-down');
  // 3. the left thumb: a drag held up the screen — he walks along the look; then left — along the screen's left
  const a0 = (await W()).hero; await drag(1, VW * 0.2, VH * 0.7, 0, -70, 1800); const a1 = (await W()).hero; await shot('3-walked');
  await away(18, -9); const b0 = (await W()).hero; await drag(1, VW * 0.2, VH * 0.6, -70, 0, 1500); const b1 = (await W()).hero;
  console.log('drag up', JSON.stringify(a0), '→', JSON.stringify(a1), '· left', JSON.stringify(b0), '→', JSON.stringify(b1), 'free s', (await W()).free, (await W()).part);
  // 4. a short drag on the left half that ends within the dead zone and lifts fast: nothing (not a tap); a tap: he walks to the work by himself
  await away(18, -9);
  await ev('pointerdown', 1, VW * 0.3, VH * 0.5); await wait(80); await ev('pointerup', 1, VW * 0.3, VH * 0.5);
  const tapAt = await W(); console.log('tap', JSON.stringify(tapAt.hero), 'auto', tapAt.auto, 'target', JSON.stringify(tapAt.target));
  await pg.waitForFunction(() => { const s = globalThis.__H42.walk61(); return !s.pending && !s.auto; }, null, { timeout: 60000, polling: 300 }).catch(() => {});
  const h5 = await W(); await shot('5-at-work'); console.log('arrived', JSON.stringify(h5.hero), h5.sig, '|', h5.line);
  // 6. the wall grows while the crews lay: world61's share now and 20 s later
  const w0 = (await W()).built.wall || 0; await wait(20000); const w1 = (await W()).built.wall || 0; console.log('wall built', w0, '→', w1);
  console.log('errors', JSON.stringify(errors), el());
  await b.close();
})();
