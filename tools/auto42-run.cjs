// build 42 — runs the new stage 01 in a browser (Phase A, out/index.html made with mkout --no-shift) and plays it with tools/auto42.js:
//   node tools/auto42-run.cjs --run NAME [--size 640x296] [--skilled] [--seed N] [--at <part>] [--minutes 9] [--page out/index.html]
// a new game (fresh storage), or --at <part> (the save's fixture: ?h42at=<part>). Prints the parts' times, the grades, the page errors; shots
// in …/auto/<run>/shot-<name>.png. Run ONLY through /home/claude/wt/bus/brun. Never a Divine Name.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const args = process.argv.slice(2), opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; }, flag = (k) => args.includes(k);
const RUN = opt('--run', 'h42'), [VW, VH] = opt('--size', '640x296').split('x').map(Number), AT = opt('--at', ''), MIN = +opt('--minutes', 9);
const AUTO = '/tmp/claude-0/-home-claude/92bf52df-7cb5-51be-8ceb-ea3690eaf336/auto', OUT = path.join(AUTO, RUN);
const PAGE = path.resolve(__dirname, '..', opt('--page', 'out/index.html'));
fs.mkdirSync(OUT, { recursive: true });
const t0 = Date.now(), el = () => Math.round((Date.now() - t0) / 100) / 10;
// (build 45: --occ — at each shot, what stands between the camera and his chest: the camera, him, and the meshes the ray meets before him)
const OCC = () => {
  const T = window.__T, c = T.camera, hp = { x: 0, y: 0, z: 0 }; T.stages.heroXYZ(hp); const to = new T.Vector3(hp.x, hp.y + 3, hp.z), d = to.clone().sub(c.position), L = d.length(); d.normalize();
  const rc = new T.Raycaster(c.position.clone(), d, 0.1, L - 1.5); rc.camera = c; const hits = rc.intersectObjects(T.scene.children.filter((k) => k.visible), true).filter((h) => { if (!h.object.isMesh) return false; for (let k = h.object; k; k = k.parent) if (!k.visible) return false; return true; });
  const nm = (o) => { const a = []; for (let k = o, i = 0; k && i < 4; k = k.parent, i++) a.push(k.name || k.type); return a.join('<'); };
  const r1 = (v) => Math.round(v * 10) / 10;
  return { cam: [r1(c.position.x), r1(c.position.y), r1(c.position.z)], hero: [r1(hp.x), r1(hp.y), r1(hp.z)], L: r1(L), hits: hits.slice(0, 4).map((h) => [r1(h.distance), nm(h.object)]) };
};
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--mute-audio'] });
  const ctx = await b.newContext({ viewport: { width: VW, height: VH }, hasTouch: true, deviceScaleFactor: 1 });
  await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
  await ctx.addInitScript(() => { window.__FORCE_Q = 'low'; try { if (!sessionStorage.getItem('a42')) { sessionStorage.setItem('a42', '1'); localStorage.clear(); } } catch (e) { /* */ } });
  const pg = await ctx.newPage(), errors = [];
  pg.on('pageerror', (e) => errors.push(String(e.message).slice(0, 300)));
  const QX = opt('--query', ''), url = 'file://' + PAGE + '?' + [AT ? `h42at=${AT}` : '', QX].filter(Boolean).join('&');   // (build 45: --query adds the developers' flags, e.g. h45go=1)
  await pg.goto(url, { waitUntil: 'load', timeout: 180000 });
  await pg.waitForFunction(() => window.__T && window.__T.booted, null, { timeout: 240000, polling: 500 });
  console.log('booted', el());
  await pg.evaluate(() => { window.__T.pause(true); window.__T.simulate(true, 0.05); });
  const ok = await pg.waitForFunction(() => globalThis.__H42 && globalThis.__H42.on, null, { timeout: 60000, polling: 300 }).then(() => true).catch(() => false);
  console.log('har42 on', ok, el());
  if (!ok) { console.log('errors', JSON.stringify(errors)); await b.close(); process.exit(1); }
  await pg.addScriptTag({ path: path.join(__dirname, 'auto42.js') });
  if (flag('--cam')) { await pg.addScriptTag({ path: path.join(__dirname, 'cam41.js') }); await pg.evaluate(() => globalThis.__CAM41.start()); }   // (build 43: the camera's measure on the stage's acts)
  await pg.exposeFunction('__shot42', async (name) => { await pg.evaluate(() => window.__T.simulate(false)).catch(() => {}); await pg.evaluate(() => window.__T.render()).catch(() => {}); await pg.screenshot({ path: path.join(OUT, `shot-${name}.png`), timeout: 240000 }).catch(() => {}); await pg.evaluate(() => window.__T.simulate(true, 0.05)).catch(() => {}); console.log('shot', name, el());
    if (flag('--occ')) console.log('occ', name, JSON.stringify(await pg.evaluate(OCC).catch((e) => String(e).slice(0, 120)))); });
  const res = await Promise.race([
    pg.evaluate((o) => globalThis.__AUTO42.start({ ...o, shot: (n) => globalThis.__shot42(n) }), { skilled: flag('--skilled'), seed: +opt('--seed', 7), after: flag('--after') }),
    new Promise((r) => setTimeout(() => r({ timeout: true }), MIN * 60000)),
  ]);
  if (res && res.timeout) { await pg.evaluate(() => globalThis.__AUTO42.stop()).catch(() => {}); }
  const st = await pg.evaluate(() => (globalThis.__H42 ? { s: globalThis.__H42.state(), on: globalThis.__H42.on } : null)).catch(() => null);
  const after = await pg.evaluate(() => { try { const g = window.__T.game && window.__T.game.state; return g ? { harDone: !!(g.st && g.st.har && g.st.har.done), ftue: g.ftue } : null; } catch (e) { return null; } }).catch(() => null);
  await pg.evaluate(() => window.__T.render()).catch(() => {}); await pg.screenshot({ path: path.join(OUT, 'shot-end.png'), timeout: 240000 }).catch(() => {});
  const h44 = await pg.evaluate(() => { try { const S = JSON.parse(localStorage.getItem('bh_har42') || 'null'); return { test: S && S.test44, yard: S && S.yard, vision: localStorage.getItem('bh_vision44') }; } catch (e) { return null; } }).catch(() => null);   // (build 44)
  if (h44) console.log('h44', JSON.stringify(h44));
  const cam = flag('--cam') ? await pg.evaluate(() => globalThis.__CAM41 && globalThis.__CAM41.stats()).catch(() => null) : null;
  if (cam) console.log('cam41', JSON.stringify(cam));
  const R = { run: RUN, size: [VW, VH], at: AT || null, wallS: el(), res, st, after, errors, cam, h44 };
  fs.writeFileSync(path.join(OUT, 'auto42.json'), JSON.stringify(R, null, 1));
  console.log('times', JSON.stringify(res && res.times));
  console.log('grades', JSON.stringify(res && res.grades));
  console.log('state', JSON.stringify(st), 'after', JSON.stringify(after));
  console.log('notes', JSON.stringify((res && res.notes || []).slice(-12)));
  console.log(errors.length ? 'errors ' + JSON.stringify(errors.slice(0, 8)) : 'no page errors', '·', el());
  await Promise.race([b.close(), new Promise((r) => setTimeout(r, 20000))]);   // (build 43: after a finished stage the browser's close took ~5 minutes under swiftshader — the queue does not wait for it)
  process.exit(0);
})().catch((e) => { console.error('FAIL', e && e.stack || e); process.exit(1); });
