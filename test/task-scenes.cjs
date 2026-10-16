// SITE15 (wave 15) — every task's scene of chapters 1–2 (har … yesod) by REAL TOUCH at 390×844 on dist/test.html (the owner's
// Gardenscapes loop, 1.10 18:22: "אנימציה"; his compass: the kohen walks from point to point, never floats, never vanishes).
// A fixture sets the stage (the stages before it done, the stage at its survey — as META15's spend would find it), then calls
// `__T.stages.taskScene(stage, task, …)` for every task of the stage in order (content/tasks.json when STORY15's file is in the
// tree, else the Mount's 12 of STARS15 §3 and a generic list per stage from PROJ). At every scene's held frame (1.6 s in, as the
// producer shoots it) and at its end: the kohen on screen in the safe frame, ≥ 80 px (K80) and not hidden; the world changed
// (the pegs, the rocks gone, the stones set, the finish's step, the moment handed over); the scene ≤ 9 s; draw calls ≤ 150 at
// the held frame; no console errors. Screenshots of the Mount's 12 scenes (--shots; looked at).
//   node test/task-scenes.cjs [--part=1|2] [--stages=har,wall] [--no-build] [--shots] [--file=dist/test.html] [--skip=har.c23]
// part 1: har, wall, sorag, gates · part 2: nashim, nikanor, lishka, yesod (each part under 10 minutes on the shared machine).
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/task-scenes');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const arg = (k, d) => { const a = args.find((x) => x.startsWith(`--${k}=`)); return a ? a.slice(k.length + 3) : d; };
const SHOTS = args.includes('--shots'), PART = +arg('part', 1) || 1;
const PARTS = { 1: ['har', 'wall', 'sorag', 'gates'], 2: ['nashim', 'nikanor', 'lishka', 'yesod'] };
const STAGES = arg('stages', '') ? arg('stages', '').split(',') : PARTS[PART] || PARTS[1];
const SKIP = new Set((arg('skip', '') || '').split(',').filter(Boolean));   // (tasks skipped by a tap, to test the skip)
const ONLY = new Set((arg('only', '') || '').split(',').filter(Boolean));   // (the other tasks are applied at once: a quick path to a state)
const W = 390, H = 844, K80 = 80, CALLS = 150, MAX_S = 9;
// the game's PROJ for chapters 1–2 (content.js): C courses × P stones, survey/dig steps, the finish steps
const PROJ = { har: { C: 6, P: 32, sv: 0, dg: 0, fin: 1 }, wall: { C: 8, P: 32, sv: 1, dg: 1, fin: 2 }, gates: { C: 6, P: 24, sv: 1, dg: 1, fin: 2 }, nashim: { C: 6, P: 24, sv: 1, dg: 1, fin: 2 },
  sorag: { C: 3, P: 32, sv: 1, dg: 1, fin: 1 }, nikanor: { C: 6, P: 24, sv: 1, dg: 1, fin: 3 }, lishka: { C: 6, P: 24, sv: 1, dg: 1, fin: 2 }, yesod: { C: 2, P: 32, sv: 1, dg: 1, fin: 0 } };
const MOMENT = { har: 'greatStone', wall: 'wall', sorag: 'sorag', gates: 'gates', nashim: 'nashim', nikanor: 'nikanor', lishka: 'lishka', yesod: 'yesod' };
/* the Mount's 12 (STORY15's content/tasks.json as posted on the bus, 05:58 UTC; the lines are not read here) */
const HAR12 = [
  { id: 'har.survey', n: 'מדדו את ההר', cost: 1, after: [], do: { kind: 'survey' } },
  { id: 'har.dig', n: 'פנו את הסלעים', cost: 2, after: ['har.survey'], do: { kind: 'dig' } },
  { id: 'har.first', n: 'הניחו את האבן הראשונה', cost: 1, after: ['har.dig'], do: { kind: 'job', job: 'key', from: 0, to: 1 } },
  { id: 'har.c1', n: 'בנו את הנדבך הראשון', cost: 1, after: ['har.first'], do: { kind: 'courses', from: 1, to: 32 } },
  { id: 'har.line', n: 'החוט הצבוע', cost: 1, after: ['har.c1'], do: { kind: 'job', job: 'line' } },
  { id: 'har.c23', n: 'נדבכים ב׳–ג׳', cost: 2, after: ['har.line'], do: { kind: 'courses', from: 32, to: 96 } },
  { id: 'har.columns', n: 'הקימו את עמודי הסטיו', cost: 2, after: ['har.c23'], do: { kind: 'job', job: 'column' } },
  { id: 'har.arch', n: 'בנו את קשת רובינסון', cost: 3, after: ['har.c23'], do: { kind: 'job', job: 'arch' } },
  { id: 'har.c456', n: 'נדבכים ד׳–ו׳', cost: 3, after: ['har.columns', 'har.arch'], do: { kind: 'courses', from: 96, to: 192 } },
  { id: 'har.letters', n: 'חרטו ״לבית התקיעה״', cost: 1, after: ['har.c456'], do: { kind: 'job', job: 'letters' } },
  { id: 'har.pave', n: 'רצפו את הרחבה', cost: 2, after: ['har.c456'], do: { kind: 'finish', step: 0 } },
  { id: 'har.moment', n: 'האבן הגדולה', cost: 2, after: ['har.letters', 'har.pave'], do: { kind: 'moment', moment: 'greatStone' } },
];
/* a generic stage (until STORY15's tasks land): the survey, the dig, the key stone, a course at a time, the finish steps, the moment */
function genericTasks(id) {
  const P = PROJ[id], T = [];
  if (P.sv) T.push({ id: `${id}.survey`, n: 'מדדו', cost: 1, after: [], do: { kind: 'survey' } });
  if (P.dg) T.push({ id: `${id}.dig`, n: 'חפרו', cost: 1, after: [], do: { kind: 'dig' } });
  T.push({ id: `${id}.first`, n: 'האבן הראשונה', cost: 1, after: [], do: { kind: 'job', job: 'key', from: 0, to: 1 } });
  for (let c = 0; c < P.C; c++) T.push({ id: `${id}.c${c + 1}`, n: `נדבך ${c + 1}`, cost: 1, after: [], do: { kind: 'courses', from: c ? c * P.P : 1, to: (c + 1) * P.P } });
  for (let f = 0; f < P.fin; f++) T.push({ id: `${id}.f${f}`, n: `גימור ${f + 1}`, cost: 1, after: [], do: { kind: 'finish', step: f } });
  T.push({ id: `${id}.moment`, n: 'הרגע', cost: 2, after: [], do: { kind: 'moment', moment: MOMENT[id] } });
  return T;
}
function tasksOf(id) {
  const f = path.join(ROOT, 'content/tasks.json');
  if (fs.existsSync(f)) { try { const j = JSON.parse(fs.readFileSync(f, 'utf8')); if (Array.isArray(j[id]) && j[id].length) return j[id]; } catch (e) { /* the fallback */ } }
  return id === 'har' ? HAR12 : genericTasks(id);
}
const results = [];
const check = (name, ok, info = '') => { results.push({ name, ok: !!ok, info }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    const pg = await ctx.newPage();
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await pg.addInitScript(() => {
      window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
      try { localStorage.clear(); } catch (e) { /* blocked */ }
    });
    const FILE = arg('file', '') || path.join(ROOT, 'dist/test.html');
    await pg.goto('file://' + path.resolve(FILE));
    await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 100, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const tap = (x, y) => pg.touchscreen.tap(Math.max(4, Math.min(W - 4, x)), Math.max(4, Math.min(H - 4, y)));
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); });
      const f = path.join(OUT, `${name}.png`);
      await pg.screenshot({ path: f, timeout: 240000 });
      console.log('   shot', path.relative(ROOT, f));
      await G(() => { window.__HUD_HOLD = false; });
    };
    /* the opening: a tap skips it (as the daughter does) */
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening'), null, 15000);
    const cine = await pg.$('.gm-cine'); const cr = cine && await cine.boundingBox();
    if (cr) await tap(cr.x + cr.width / 2, cr.y + cr.height * 0.6);
    await waitFor(() => window.__GAME_LOG.some((e) => e.type === 'opening' && e.d.at === 'end'), null, 12000);
    await pg.waitForTimeout(600);
    /* where the kohen is on screen (the world's own projection; `on` false where the rough Mount hides a point), K80, the crane */
    if (args.includes('--camlog')) await G(() => { window.__CAMLOG = []; const P = __T.camera.position; for (const k of ['set', 'copy', 'lerpVectors', 'add', 'sub', 'addScaledVector', 'setFromSpherical']) { const f = P[k]; P[k] = function (...a) { window.__CAMLOG.push(k + ' @ ' + String(new Error().stack).split('\n').slice(2, 4).join(' | ').replace(/file:[^)]*\//g, '').slice(0, 200)); return f.apply(this, a); }; } });
    const look = () => G(() => {
      const S = __T.stages, cam = __T.camera; cam.updateMatrixWorld();
      const Wd = innerWidth, Hd = innerHeight, hp = S.hero.position;
      const h = __T.view.project(hp.x, hp.y + 1.8, hp.z), on = !!h.on && h.x > 24 && h.x < Wd - 24 && h.y > 110 && h.y < Hd - 130;
      const fy = __T.view.project(hp.x, hp.y, hp.z).y, px = Math.round(Math.abs(fy - __T.view.project(hp.x, hp.y + 3.6, hp.z).y));
      // hidden: the crane between the camera and his chest, a built stage's masonry (its hits above the reveal's cut are air), the rough Mount
      let hidden = false, hiddenBy = '';
      try { if (__T.Raycaster) { const o = cam.position.clone(), dv = new __T.Vector3(hp.x, hp.y + 2.4, hp.z).sub(o), L = dv.length(); const rc = new __T.Raycaster(o, dv.normalize(), 0, L - 1.6); const C = S._dbg.crane; if (C && C.g && C.g.visible && rc.intersectObject(C.g, true).length) { hidden = true; hiddenBy = 'crane'; }
        if (!hidden) for (const st of Object.values(S._dbg.ST)) { if (!st.group.visible) continue; const uY = st.status === 'building' ? st.U.uY.value : 1e9; const hits = rc.intersectObject(st.group, true).filter((q) => q.object && q.object.isMesh && !q.object.isInstancedMesh && q.object.visible && q.point.y <= uY + 0.05); if (hits.length) { hidden = true; hiddenBy = st.id; break; } }
        if (!hidden && typeof S.occluded === 'function' && S.occluded(hp.x, hp.y + 2.4, hp.z)) { hidden = true; hiddenBy = 'hill'; } } } catch (e) { /* */ }
      const hh = S._dbg.hero, vis = !!(hh.mesh && hh.mesh.visible) && !(hh.fade < 0.5) && !(hh.edgeF < 0.5);
      return { on, px, hidden, hiddenBy, vis, x: Math.round(h.x), y: Math.round(h.y), hero: [hp.x, hp.y, hp.z].map((v) => Math.round(v * 10) / 10), run: S.taskRunning(), dist: Math.round(cam.position.distanceTo(hp)) };
    });
    const tapCanvas = async () => { await tap(W / 2, H * 0.42); };
    let shotsLeft = args.includes('--shots-all') ? 99 : 12;
    for (const id of STAGES) {
      const tasks = tasksOf(id);
      /* the fixture: the stages before it done, the stage at its survey (as a fresh save reaches it), the game's loop held off */
      const fx = await G(([site]) => {
        const g = __T.game.state; g.ftue = 99; g.name = 'יכין'; __T.game.ui.coach(null, '');
        const ids = __T.game._.stageIds();
        for (const sid of ids) { if (sid === site) break; g.st[sid] = { done: true }; }
        if (site !== 'har') g.bh = g.bh.map(() => 0);
        g.st[site] = { p: 'survey', n: __T.game._.siteStones(site), dp: 0, paid: 0, set: 0, k: 0, fp: 0, fd: 0, keys: {}, ev: {}, bad: [], chk: 0, insp: 0, w: 0, ph: 1 };
        g.focus = site; g.crews = [];
        __T.game._.resync();
        __T.game.hold(true);   // (the loop's nets off while the scenes run — META15 holds it the same way)
        const hp = __T.stages.hero.position;
        return { hero: [hp.x, hp.y, hp.z].map(Math.round), n: __T.game._.siteStones(site), info: __T.stages.siteInfo(site) };
      }, [id]);
      console.log(`\n── ${id}: ${tasks.length} tasks · hero at ${fx.hero} · stones ${fx.info ? fx.info.stones : '?'} (${fx.n} logical)`);
      await pg.waitForTimeout(400);
      for (const task of tasks) {
        const kind = task.do.kind, tid = task.id, skip = SKIP.has(tid), quick = ONLY.size && !ONLY.has(tid);
        const before = await G(([site]) => { const i = __T.stages.siteInfo(site); const S = __T.stages; const hp = S.hero.position; return { set: i ? i.set : 0, phase: i ? i.phase : null, bh: S.boulders.filter((v) => v > 0).length, hero: [hp.x, hp.z].map(Math.round) }; }, [id]);
        // the scene (not awaited here: K80 is read while it holds), its promise's result kept on the window; the world's clock
        // is stepped (__T.step) so a 7-s scene costs seconds, the camera's flight gets its real second
        await G(([site, tk, q]) => { window.__SCENE = null; __T.simulate(false); const p = __T.stages.taskScene(site, tk, { q: 0.85, hero: !q, sfx: (n) => { (window.__SFX = window.__SFX || []).push(n); } }); p.then((r) => { window.__SCENE = r; }); if (q) p.skip(); }, [id, task, quick]);
        if (quick) { await G(() => { __T.step(0.6, 0.05); __T.simulate(true); }); await pg.waitForTimeout(150); const r0 = await G(() => window.__SCENE); console.log(`   (${tid} applied: ${r0 && r0.phase} ${r0 && r0.stones})`); continue; }
        if (skip) { await G(() => __T.step(1.4, 0.05)); await pg.waitForTimeout(1200); await tapCanvas(); await G(() => __T.step(0.3, 0.05)); }
        const t0 = Date.now();
        const walk = await G(() => { const r = __T.stages.taskRunning(); return r ? r : null; });
        const heldAt = Math.max(1.6, (walk && walk.arrived === false ? 4.4 : 1.6));
        // to the held frame: he has arrived (or 4.4 s in), the flight landed (its real second)
        let wt = 0;
        while (!skip && wt < heldAt) { const r = await G(() => { __T.step(0.4, 0.05); return __T.stages.taskRunning(); }); wt += 0.4; if (!r) break; if (r.arrived && wt >= 1.6) break; }
        await pg.waitForTimeout(1250);
        await G(() => { __T.render(); if (window.__CAMLOG) window.__CAMLOG.length = 0; });
        const held = await look();
        let calls = null;
        if (!skip) calls = await G(() => __T.drawCalls());
        const doShot = SHOTS && (id === 'har' || args.includes('--shots-all')) && shotsLeft-- > 0;
        if (doShot) await shot(`${tid}`);
        // to the end (≤ 9.6 s of the world's clock), then the flight's real second and a frame
        let steps = 0;
        while (steps < 24) { const d = await G(() => { __T.step(0.4, 0.05); return !!window.__SCENE; }); steps++; if (d) break; }
        const done = await G(() => !!window.__SCENE);
        await pg.waitForTimeout(1050);
        await G(() => { __T.render(); });
        const res = await G(() => window.__SCENE);
        const end = await look();
        if (doShot && (end.px < K80 || end.hidden || !end.on)) await shot(`${tid}-end`);
        const lg = await G(([tid]) => window.__GAME_LOG.filter((e) => e.type === 'taskScene' && e.d && e.d.id === tid).map((e) => e.d), [tid]);
        if (args.includes('--camlog')) { const cl = await G(() => (window.__CAMLOG || []).slice(0, 12)); console.log('   camlog:', cl.length ? '\n     ' + cl.join('\n     ') : 'none'); const rv = lg.find((d) => d.at === 'reveal'); if (rv) console.log('   reveal:', JSON.stringify(rv)); const st0 = lg.find((d) => d.at === 'start'); if (st0) console.log('   start:', JSON.stringify(st0)); console.log('   cam end:', JSON.stringify(await G(() => ({ p: __T.camera.position.toArray().map(Math.round), t: __T.controls.target.toArray().map(Math.round), hero: __T.stages.hero.position.toArray().map(Math.round) })))); }
        const endLog = lg.find((d) => d.at === 'end' || d.at === 'skip'), sceneS = endLog ? endLog.s : wt + steps * 0.4;
        await G(() => { __T.simulate(true); });
        const after = await G(([site]) => { const i = __T.stages.siteInfo(site); const S = __T.stages; const hp = S.hero.position; return { set: i ? i.set : 0, phase: i ? i.phase : null, finish: S._dbg.ST[site].finish || 0, bh: S.boulders.filter((v) => v > 0).length, hero: [hp.x, hp.z].map(Math.round) }; }, [id]);
        const walked = Math.hypot(after.hero[0] - before.hero[0], after.hero[1] - before.hero[1]);
        const ok = !!(res && res.ok) && done && sceneS <= MAX_S && (skip ? res.skipped : Math.min(held.px, end.px) >= K80 && held.on && end.on && held.vis && end.vis && !held.hidden && !end.hidden && (!calls || calls.total <= CALLS)) && !!res.at;
        if (!ok || args.includes('--camlog')) { const st0 = lg.find((d) => d.at === 'start'); if (st0) console.log('   start:', JSON.stringify(st0).slice(0, 300)); }
        // what the task did in the world, by kind
        let changed = false, why = '';
        if (kind === 'survey') { changed = after.phase === 'dig'; why = `phase ${before.phase}→${after.phase}`; }
        else if (kind === 'dig') { changed = id === 'har' ? after.bh === 0 : after.phase === 'foundation' || after.phase === 'courses'; why = id === 'har' ? `rocks ${before.bh}→${after.bh}` : `phase ${before.phase}→${after.phase}`; }
        else if (kind === 'courses' || (kind === 'job' && task.do.to > task.do.from)) { changed = after.set > before.set; why = `stones ${before.set}→${after.set}`; }
        else if (kind === 'finish') { changed = after.phase === 'finish' && after.finish > 0; why = `finish ${after.finish.toFixed(2)}`; }
        else if (kind === 'job') { changed = !!(res && res.ok); why = `reveal ${task.do.job}`; }
        else if (kind === 'moment') { changed = !!(res && res.moment); why = `moment ${res && res.moment}`; }
        check(`[${id}] ${tid} (${kind}${skip ? ', tapped' : ''})`, ok && changed,
          `${sceneS} s (${((Date.now() - t0) / 1000).toFixed(0)} s wall) · K80 ${held.px}/${end.px} px${held.hidden || end.hidden ? ' HIDDEN:' + (held.hiddenBy || end.hiddenBy) : ''}${!held.on || !end.on ? ' OFF' : ''}${!held.vis || !end.vis ? ' FADED' : ''} · walked ${Math.round(walked)} · ${why}${calls ? ` · calls ${calls.total}` : ''} · at ${res && res.at ? `${res.at.x},${res.at.y}` : '—'}${res && res.skipped ? ' · skipped' : ''} · cam ${held.dist}→${end.dist}`);
        // (what META15 does after: G.st from the result — the resync must not move a stone: the world's count equals the mapping)
        if (res && kind !== 'moment') { const real = fx.info ? fx.info.stones : 0, n = fx.n; const back = n ? Math.round((res.set / n) * real) : res.stones; if (back !== res.stones) check(`[${id}] ${tid}: the result's logical count maps back to the world's`, false, `set ${res.set} → ${back} ≠ ${res.stones}`); }
      }
      // the "!" markers over the next tasks' spots: drawn with the pins (0 new draw calls), cleared by []
      const mk = await G(([site, tk]) => { const S = __T.stages; const n = S.taskMarks(tk.slice(0, 3).map((t) => ({ stage: site, task: t }))); S.update(0.05); const c = S._dbg.ST[site] ? 1 : 0; const pins = __T.scene.children.find((o) => o.isInstancedMesh && o.geometry && o.geometry.type === 'OctahedronGeometry'); const cnt = pins ? pins.count : -1; S.taskMarks([]); S.update(0.05); return { n, cnt, after: pins ? pins.count : -1, c }; }, [id, tasks]);
      check(`[${id}] taskMarks: ${mk.n} markers drawn with the pins`, mk.n >= 1 && mk.cnt >= mk.n && mk.after <= mk.cnt - mk.n, `pins ${mk.cnt} → ${mk.after}`);
      await G(() => { __T.game.hold(false); });
      if ((Date.now() - T0) / 1000 > 540) { console.log('(time budget: the rest of the stages are left for another run)'); break; }
    }
    check('no console errors', !logs.length, logs.slice(0, 3).join(' | ').slice(0, 300));
    const sfx = await G(() => (window.__SFX || []).slice(0, 12));
    console.log('sfx played:', sfx.join(' '));
  } catch (e) { check('run', false, String(e && e.stack || e).slice(0, 400)); }
  finally { await b.close(); }
  const bad = results.filter((r) => !r.ok);
  console.log(`\n${results.length - bad.length}/${results.length} passed · ${Math.round((Date.now() - T0) / 1000)} s`);
  process.exit(bad.length ? 1 : 0);
})();
