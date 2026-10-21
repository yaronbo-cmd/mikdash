// FLOW11 (wave 11) — N34, "a reopened game lands on the kohen at his work" (PRODUCER-S10 top 10 #1; the owner reopens the game
// every evening: tonight every reopen started on an empty frame). A REAL reload (page.reload) of a save, 390×844, hasTouch, no
// autoplay flags. Cases (--cases=har1,har5,wall,gates): the Mount's course 1 (stone 5) and course 5 (stone 140, with the crews
// at work as the owner has them), the wall's first course, the gates' courses. After the reload the page is only watched: samples
// at 0.3 … 6 s after the game's `start` — the kohen's projected height (feet → head, 3.6 amot) and whether he stands in the safe
// frame (not under the top bar, not under the bottom HUD). PASS: ≥ 80 px and in frame from 2 s on, and in frame on the first
// sample; a shot of the first frame and at 2 s and 6 s (look at them).
//   node test/game-reload-touch.cjs [--cases=har1,har5,wall] [--no-build] [--file=dist/test.html] [--noshots] [--tag=name]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const TAG = (args.find((a) => a.startsWith('--tag=')) || '--tag=').slice(6);
const OUT = path.join(ROOT, 'test/out/reload', TAG);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = !args.includes('--noshots');
const CASES = ((args.find((a) => a.startsWith('--cases=')) || '--cases=har1,har5,wall').slice(8)).split(',').filter(Boolean);
const W = 390, H = 844;
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

/* the saves: written once into a booted game, then the page reloads (the state is never touched again) */
const FIX = {
  har1: { at: 'har', set: 5, crews: 0 },
  har5: { at: 'har', set: 140, crews: 2 },
  wall: { at: 'wall', set: 3, crews: 2 },
  gates: { at: 'gates', set: 3, crews: 2 },
};

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      // (a reload keeps the save: localStorage is cleared only on the first load of each case)
      try { if (!sessionStorage.getItem('__keep')) localStorage.clear(); } catch (e) { /* blocked */ }
    });
    const FILE = (args.find((a) => a.startsWith('--file=')) || '').slice(7) || path.join(ROOT, 'dist/test.html');
    const G = (fn, a) => pg.evaluate(fn, a);
    const booted = () => pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game && window.__GAME_LOG.some((e) => e.type === 'start'), null, { polling: 50, timeout: 240000 });
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); });
      const f = path.join(OUT, `${name}.png`);
      await pg.screenshot({ path: f, timeout: 240000 });
      console.log('   shot', path.relative(ROOT, f));
      await G(() => { window.__HUD_HOLD = false; });
    };
    /* the kohen as the player sees him: his projected height (feet → head) and the safe frame (the top bar, the bottom HUD) */
    const look = () => G(() => {
      const S = __T.stages, cam = __T.camera; cam.updateMatrixWorld();
      const hp = S.hero.position, t0 = (window.__GAME_LOG.find((e) => e.type === 'start') || { t: 0 }).t;
      const f = { ...__T.view.project(hp.x, hp.y, hp.z) }, h = { ...__T.view.project(hp.x, hp.y + 3.6, hp.z) };
      const px = Math.round(Math.abs(f.y - h.y)), cx = (f.x + h.x) / 2, cy = (f.y + h.y) / 2;
      const on = !!f.on && !!h.on && cx > 24 && cx < innerWidth - 24 && cy > 110 && cy < innerHeight - 130;
      const vis = !!(S.hero.mesh ? S.hero.mesh.visible : true);
      const card = !!document.querySelector('.gm-modal.on');
      const res = document.querySelector('.gm-res'), over = res ? res.scrollWidth - res.clientWidth : 0;   // (N18: a chip cut at the edge)
      return { t: Math.round((performance.now() - t0) / 100) / 10, px, on, vis, card, over, x: Math.round(cx), y: Math.round(cy), hero: [hp.x, hp.z].map(Math.round), dist: Math.round(cam.position.distanceTo(hp)),
        cam: [cam.position.x, cam.position.y, cam.position.z].map(Math.round) };
    });
    for (const name of CASES) {
      const fx = FIX[name]; if (!fx) { console.log('unknown case', name); continue; }
      console.log(`\n== ${name}: ${fx.at} set ${fx.set}, crews ${fx.crews}`);
      await G(() => { try { sessionStorage.removeItem('__keep'); } catch (e) { /* */ } }).catch(() => {});
      await pg.goto('file://' + path.resolve(FILE));
      await booted();
      await pg.waitForTimeout(1500);
      /* the save: the stages before `at` done, `at` in its courses at stone `set` (a named player after the first-time flow) */
      await G((fx) => {
        const g = __T.game.state, ids = __T.game._.stageIds();
        g.ftue = 99; g.op = 1; g.name = 'יכין'; g.bh = g.bh.map(() => 0);
        for (const id of ids) { if (id === fx.at) break; g.st[id] = { done: true }; }
        const s = g.st[fx.at] && !g.st[fx.at].done ? g.st[fx.at] : (g.st[fx.at] = { p: 'courses', n: __T.game._.siteStones(fx.at), dp: 1, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 });
        Object.assign(s, { p: 'courses', dp: 1, paid: 999, set: fx.set, k: 0, chk: 0 });
        for (const i of [0, 16, 32, 64, 96, 128]) if (i < fx.set && s.keys[i] == null) s.keys[i] = 0.9;
        g.focus = fx.at; g.res.stone = Math.max(g.res.stone || 0, 400);
        g.crews = Array.from({ length: fx.crews }, () => ({ at: fx.at }));
        __T.game._.resync();
        __T.simulate(false);
        __T.game.destroy();                 // (persists the save; no timer of the first boot writes after it)
        sessionStorage.setItem('__keep', '1');
      }, fx);
      await pg.waitForTimeout(300);
      /* the reopen, twice (a SwiftShader render blocks the page for seconds, so the timing and the look are two reloads):
         1) only watched, no render: samples at 0.3 … 6 s after the game's `start`, then a shot of the frame as it stands;
         2) a shot of the very first frame (the render shows the state at that instant) */
      await pg.reload();
      await booted();
      const rows = [];
      const at = (sec) => pg.waitForFunction((sec) => performance.now() - window.__GAME_LOG.find((e) => e.type === 'start').t >= sec * 1000, sec, { polling: 30, timeout: 20000 });
      for (const sec of [0.3, 0.6, 1.0, 1.5, 2.0, 3.0, 4.0, 6.0]) { await at(sec); rows.push(await look()); }
      if (SHOTS) await shot(`${name}-6s`);
      const ev = await G(() => window.__GAME_LOG.filter((e) => /heroPlace|heroReturn|heroAim|markAim|welcome|loadLand|start/.test(e.type)).map((e) => `${e.type}@${Math.round(e.t - window.__GAME_LOG.find((q) => q.type === 'start').t)}`).join(' '));
      if (SHOTS) {
        await pg.reload();
        await booted();
        await shot(`${name}-first`);   // (the render steps the camera's flight first, as the game loop does before every frame)
        const f = await look();
        console.log(`   first frame (2nd reload, as rendered): ${f.px}px ${f.on ? 'in' : 'OUT'} at ${f.x},${f.y} d${f.dist}`);
        check(`[${name}] the first rendered frame after a reopen: the kohen ≥ 80 px and in frame`, f.on && f.vis && f.px >= 80, `${f.px}px at ${f.x},${f.y} d${f.dist}`);
      }
      console.log('   samples:', rows.map((r) => `${r.t}s ${r.px}px ${r.on ? 'in' : 'OUT'}${r.vis ? '' : ' hidden'}${r.card ? ' card' : ''} d${r.dist}`).join(' · '));
      console.log('   events:', ev);
      const late = rows.filter((r) => r.t >= 2);
      check(`[${name}] the first frame after the reopen already has the kohen in frame`, rows[0].on && rows[0].vis, `${rows[0].t}s ${rows[0].px}px at ${rows[0].x},${rows[0].y} hero ${rows[0].hero} cam ${rows[0].cam}`);
      check(`[${name}] from 2 s on the kohen ≥ 80 px and in frame (at his work)`, late.length && late.every((r) => r.on && r.vis && r.px >= 80), late.map((r) => `${r.t}s:${r.px}px${r.on ? '' : ' OUT'}`).join(' '));
      check(`[${name}] the top row fits the phone (no resource chip cut, N18)`, rows[rows.length - 1].over <= 1, `overflow ${rows[rows.length - 1].over} px`);
      fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(rows));
    }
    const bad = logs.filter((l) => !/fonts|favicon/.test(l));
    check('no console errors', !bad.length, bad.slice(0, 3).join(' | '));
    await ctx.close();
  } finally { await b.close(); }
  const pass = results.filter((r) => r.ok).length;
  console.log(`\n${pass}/${results.length} passed`);
  // (the one-browser queue: a follow-up for the same slot — test/out/reload/<tag>.after.sh, if present, runs once after the cases)
  { const af = path.join(ROOT, 'test/out/reload', `${TAG || 'run'}.after.sh`); if (fs.existsSync(af)) { const sh = fs.readFileSync(af, 'utf8'); fs.unlinkSync(af); try { execSync(sh, { cwd: ROOT, stdio: 'inherit', shell: '/bin/bash', timeout: 240000 }); } catch (e) { console.log('after-hook:', e.message.split('\n')[0]); } } }
  process.exit(pass === results.length ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(1); });
