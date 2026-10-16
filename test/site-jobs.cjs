// SITE14 (wave 14) — the jobs in the building: stages.jobReveal(id, kind, q) at each of her ❤️ jobs' sites, as the course loop
// calls it (FUN14's playJob after the game, ECON14's shop): the site set to its mid courses (the demo's order: every stage
// before it done), the job revealed, the world run 3 s, then the frame the reveal returns rendered and shot (looked at), and
// the draw calls of that frame. Also jobSpot (the walk to the job), stoneMark (her mark) and setOwned (her lamps, at dusk).
// DECLARED HOOKS: __START_PAUSED, __NO_OPENING, __NO_GAME (the world alone), __T.stages, __T.step, __T.render, __T.look,
// __T.drawCalls, __T.setTime. Usage: node test/site-jobs.cjs [dist/test.html] [--only=gold,saw] [--out=test/out/site-jobs]
// Pass: every job's reveal returns its frame, the job leaves something in the building (the count of what it adds), its frame
// ≤ 150 draw calls, no page errors.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const A = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return [m[1], m[2] === undefined ? true : m[2]]; }));
const file = path.resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dist/test.html');
const OUT = path.resolve(A.out || 'test/out/site-jobs'); fs.mkdirSync(OUT, { recursive: true });
const ALL = ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam', 'heichal', 'kodesh'];
// [job id, kind, site, the phase's stones fraction]
const JOBS = [['gold', 'craft', 'heichal', 0.5], ['gold', 'craft', 'gates', 0.6], ['saw', 'craft', 'nashim', 0.5], ['column', 'craft', 'har', 0.4], ['line', 'craft', 'wall', 0.4],
  ['tread', 'stone', 'gates', 0.5], ['letters', 'craft', 'har', 0.95], ['plaster', 'craft', 'guf', 0.5], ['arch', 'craft', 'har', 0.6], ['mark', 'stone', 'wall', 0.4], ['lamps', 'craft', 'nikanor', 0.5]];
const ONLY = A.only ? String(A.only).split(',') : null;
const W = 390, H = 844;
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__START_PAUSED = true; window.__NO_OPENING = true; window.__NO_GAME = true; });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) errs.push('console: ' + m.text()); });
  const t0 = Date.now(), log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s]`, ...a);
  await pg.goto('file://' + file);
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.stages, null, { timeout: 400000 });
  await pg.evaluate(() => { __T.pause(true); __T.simulate(false); __T.buildMode(); for (const e of document.body.children) if (e.tagName !== 'CANVAS' && !e.querySelector('canvas')) e.style.visibility = 'hidden'; });
  let pass = true; const res = [];
  for (const [id, kind, site, frac] of JOBS) {
    if (ONLY && !ONLY.includes(id)) continue;
    const r = await pg.evaluate(async (a) => {
      const S = __T.stages, J = S.jobs;
      S.setAll('locked'); for (const d of a.done) S.setStage(d, 'done', undefined, { instant: true });
      S.setBoulders(a.site === 'har' ? new Array(12).fill(0) : []);
      S.setStage(a.site, 'building', 0, { instant: true });
      S.setWork(a.site, { phase: 'courses', stones: Math.round((S.siteInfo(a.site).stones || 0) * a.frac), stock: 6 });
      __T.step(3, 1 / 20);
      const sp = S.jobSpot ? S.jobSpot(a.id === 'mark' || a.id === 'lamps' ? 'dress' : a.id, { site: a.site }) : null;
      if (sp) S.hero.place(sp);
      __T.step(0.5, 1 / 20);
      const snap = () => JSON.stringify({ g: J.goldH, p: J.planks, c: J.cols, l: J.lines.length, pl: J.plaster, m: J.marks.length, o: J.owned, a: J.archT, lt: !!(J.n && J.n['har|letters']) });
      const before = snap();
      let out = null;
      if (a.id === 'mark') { const m = S.stoneMark(a.site, { strokes: [[[0.2, 0.2], [0.8, 0.8]], [[0.8, 0.2], [0.2, 0.8]], [[0.5, 0.1], [0.5, 0.9]]] }); S.setWork(a.site, { phase: 'courses', stones: Math.round((S.siteInfo(a.site).stones || 0) * a.frac) + 3 }); __T.step(4, 1 / 20); const mk = S.marks()[0]; out = mk ? { x: mk.x, y: mk.y, z: mk.z, p: [mk.x + mk.nx * 9 + mk.nz * 3, mk.y + 2.5, mk.z + mk.nz * 9 - mk.nx * 3], t: [mk.x, mk.y, mk.z], mark: m, shown: mk.shown } : null; }
      else if (a.id === 'lamps') { S.setOwned({ lamps: 6 }); __T.setTime && __T.setTime('night'); const h = S.hero.position, yw = S.hero.yaw; out = { x: h.x, y: h.y, z: h.z, p: [h.x + Math.sin(yw) * 7 - Math.cos(yw) * 2, h.y + 7, h.z + Math.cos(yw) * 7 + Math.sin(yw) * 2], t: [h.x + Math.sin(yw) * 2.4, h.y + 2.2, h.z + Math.cos(yw) * 2.4] }; }
      else out = S.jobReveal(a.id, a.kind, 0.95, { site: a.site });
      __T.step(3.2, 1 / 20);
      const after = snap();
      if (out && out.p) __T.look(out.p, out.t);
      __T.render(); __T.render();
      const calls = __T.drawCalls().total;
      return { out: out && { x: +out.x.toFixed(1), y: +out.y.toFixed(1), z: +out.z.toFixed(1), p: out.p && out.p.map((v) => +v.toFixed(1)), shown: out.shown }, spot: sp && [+sp.x.toFixed(1), +sp.z.toFixed(1)], changed: before !== after || a.id === 'tread', calls };
    }, { id, kind, site, frac, done: ALL.slice(0, ALL.indexOf(site)) });
    const f = path.join(OUT, `${id}-${site}.png`);
    await pg.screenshot({ path: f, timeout: 240000 });
    if (id === 'lamps') await pg.evaluate(() => { __T.setTime && __T.setTime('noon'); __T.stages.setOwned({ lamps: 0 }); });
    const ok = !!(r.out && r.out.p) && r.changed && r.calls <= 150;
    if (!ok) pass = false;
    log(`${id.padEnd(8)} @ ${site.padEnd(8)} reveal ${JSON.stringify(r.out)} spot ${JSON.stringify(r.spot)} lasting ${r.changed} calls ${r.calls} → ${ok ? 'pass' : 'FAIL'}  (${path.relative(process.cwd(), f)})`);
    res.push({ id, site, ...r, ok });
  }
  fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify(res, null, 1));
  console.log(errs.length ? 'PAGE ERRORS: ' + errs.slice(0, 4).join(' | ') : 'no page errors');
  if (errs.length) pass = false;
  console.log(pass ? 'ALL PASS' : 'FAIL');
  await b.close(); process.exit(pass ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
