// PRODUCER15 (wave 15): the K80 probe of SITE15's task scenes, stage by stage — `stages.taskScene(stage, task, o)` called as META15
// calls it (a DECLARED hook, logged; no touch — the touch gate is produce-stars15 --stages), with STORY15's task objects read from
// content/tasks.json (--tasks=<path>). Per task: the kohen at 1.5 s and 4 s into the scene and at its end (on screen? hidden? px),
// the scene's length, R (px, at, skipped), the camera's distance; a shot at 1.5 s for the first N tasks of each stage.
//   node test/produce-scenes15.cjs --tag=sc1 --url=file:///… --tasks=/home/claude/wt/story15/content/tasks.json --stages=har,wall [--per=12] [--shots=16] [--budget=560]
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const A = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] === undefined ? true : m[2]] : [a, true]; }));
const TAG = A.tag || 'scenes', URL0 = A.url || 'file://' + path.join(ROOT, 'dist/test.html'), BUDGET = +(A.budget || 560) * 1000, SHOTS = +(A.shots || 16), PER = +(A.per || 12);
const TASKS = JSON.parse(fs.readFileSync(A.tasks || path.join(ROOT, 'content/tasks.json'), 'utf8'));
const STG = [...fs.readFileSync(path.join(ROOT, 'src/game/content.js'), 'utf8').matchAll(/^\s*S\('(\w+)', '([^']+)', (\d), \[([^\]]*)\], (\d+)/gm)].map((m) => ({ id: m[1], n: m[2], ch: +m[3], W: +m[5] }));
const OUT = path.join(ROOT, 'test/out/produce'); fs.mkdirSync(OUT, { recursive: true });
const PROFILE = path.join(OUT, 'profile-' + TAG); fs.rmSync(PROFILE, { recursive: true, force: true }); fs.mkdirSync(PROFILE, { recursive: true });
const W = 390, H = 844, T0 = Date.now(); const sec = () => Math.round((Date.now() - T0) / 1000), left = () => BUDGET - (Date.now() - T0);
const note = (s) => console.log(`${String(sec()).padStart(4)}s ${s}`);
(async () => {
  const ctx = await chromium.launchPersistentContext(PROFILE, { executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'], viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  const log = { tag: TAG, url: URL0, stages: [], errors: [] };
  try {
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = ctx.pages()[0] || await ctx.newPage();
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__GAME_LOG = []; window.__START_PAUSED = true; window.__NO_OPENING = true; for (const k of ['alert', 'confirm', 'prompt']) window[k] = () => null; });
    pg.on('pageerror', (e) => log.errors.push('PAGEERR ' + e.message.slice(0, 200)));
    await pg.goto(URL0); await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.game, null, { polling: 200, timeout: 300000 });
    const E = (fn, a) => pg.evaluate(fn, a), wait = (ms) => pg.waitForTimeout(ms);
    note('booted · taskScene: ' + (await E(() => typeof (__T.stages && __T.stages.taskScene))));
    const heroView = () => E(() => {
      const S = __T.stages, h = S && S.hero; if (!h) return null; __T.camera.updateMatrixWorld();
      const cam = __T.camera, P = h.position.clone(), head = P.clone(); head.y += 3.6;
      const pr = (v) => { const q = v.clone().project(cam); return { x: (q.x + 1) / 2 * innerWidth, y: (1 - q.y) / 2 * innerHeight, front: q.z < 1 }; };
      const a = pr(P), b = pr(head); const on = a.front && b.x > 10 && b.x < innerWidth - 10 && b.y > 90 && a.y < innerHeight - 110;
      let occ = null;
      if (on) { const mine = (o) => { for (let q = o; q; q = q.parent) if (q === h) return true; return false; }; const vis = (o) => { for (let q = o; q; q = q.parent) if (!q.visible) return false; return true; };
        const block = (pt) => { const rc = new __T.Raycaster(); const dd = cam.position.distanceTo(pt); rc.set(cam.position, pt.clone().sub(cam.position).normalize()); rc.camera = cam; for (const x of rc.intersectObjects(__T.scene.children, true)) { if (x.object.isSkinnedMesh && x.point.distanceTo(P) < 4.5) continue; const mt = Array.isArray(x.object.material) ? x.object.material[0] : x.object.material; { let sid = null; for (let q = x.object; q && !sid; q = q.parent) { const m2 = /^stage-(\w+)$/.exec(q.name || ''); if (m2) sid = m2[1]; } const STD = __T.stages._dbg && __T.stages._dbg.ST; if (sid && STD && STD[sid] && STD[sid].status === 'building' && STD[sid].U && STD[sid].U.uY && x.point.y > STD[sid].U.uY.value + 0.05) continue; } if (mine(x.object) || !vis(x.object) || x.object.name === 'hill' || (x.object.geometry && x.object.geometry.boundingSphere && x.object.geometry.boundingSphere.radius > 3000) || x.object.name === 'pave' || x.object.isPoints || x.object.isLine || x.object.isSprite || (mt && (mt.visible === false || mt.colorWrite === false || (mt.transparent && (mt.opacity < 0.5 || mt.depthWrite === false || mt.blending === 2)) || mt.opacity < 0.2))) continue; return x.distance < dd - 1.2 ? (x.object.name || x.object.type) : null; } return null; };
        const chest = P.clone(); chest.y += 2.2; const o1 = block(head), o2 = block(chest); if (o1 && o2) occ = o1; }
      return { on, hidden: !!occ, occ, px: Math.round(Math.abs(a.y - b.y)), x: Math.round(b.x), y: Math.round(b.y), dist: Math.round(cam.position.distanceTo(head)), feetY: +P.y.toFixed(2) };
    });
    let nShot = 0;
    const shot = async (name) => { if (nShot >= SHOTS) return null; await E(() => { __T.simulate(false); __T.render(); __T.render(); __T.game.frame(performance.now()); window.__HUD_HOLD = true; __T.simulate(true); }); const f = path.join(OUT, `${TAG}-${String(++nShot).padStart(2, '0')}-${name}.png`); await pg.screenshot({ path: f, timeout: 120000 }); await E(() => { window.__HUD_HOLD = false; }); return path.relative(ROOT, f); };
    const K = (hv) => !hv ? 'no-hero' : hv.on && !hv.hidden && hv.px >= 80 ? '✓' : `✗ ${!hv.on ? 'OFF' : hv.hidden ? 'HIDDEN(' + hv.occ + ')' : hv.px + 'px'}`;
    for (const id of String(A.stages || 'har').split(',')) {
      if (left() < 30000) { note(`no time left for ${id}`); break; }
      const tasks = (TASKS[id] || []).slice(0, PER); if (!tasks.length) { note(`${id}: no tasks in the file`); continue; }
      // the jump (state written once, logged): the stages before done, this one at its start, the old loop's materials; then the scenes in order
      const wrote = await E(({ id, STG }) => { const g = __T.game.state; g.ftue = 99; const i = STG.findIndex((s) => s.id === id), before = STG.slice(0, i).map((s) => s.id); for (const b of before) g.st[b] = { done: true }; for (const s of STG.slice(i + 1)) delete g.st[s.id]; delete g.st[id]; g.focus = null; g.bh = (g.bh || []).map(() => 0); g.harAcc = 1; for (const [k, v] of Object.entries({ stone: 600, wstone: 600, cedar: 400, bronze: 400, gold: 300, silver: 200 })) g.res[k] = Math.max(g.res[k] || 0, v); if (g.meta) { g.meta.stars = 30; g.meta.cur = null; } __T.game._.resync(); __T.game.save(); return `${id} at its start · done before ${before.join(',') || '—'}`; }, { id, STG });
      note(`JUMP (state written once): ${wrote}`); await wait(2500);
      await E((id) => { try { __T.stages.setStage(id, 'building'); } catch (e) { /* the world may already be there */ } }, id); await wait(800);
      const S = { id, tasks: [] }; log.stages.push(S);
      for (const t of tasks) {
        if (left() < 20000) { note('no time left'); break; }
        const r0 = await E(([id, t]) => { const S = __T.stages; window.__SC = { done: null, t0: performance.now() }; try { const p = S.taskScene(id, t, { q: 0.8, skip: (end) => { window.__SC.end = end; }, sfx: () => {} }); Promise.resolve(p).then((R) => { window.__SC.done = R || { ok: false }; window.__SC.t1 = performance.now(); }, (e) => { window.__SC.done = { err: String(e && e.message || e) }; window.__SC.t1 = performance.now(); }); return 'started'; } catch (e) { return 'threw: ' + (e && e.message); } }, [id, t]);
        const rec = { id: t.id, kind: t.do && t.do.kind, start: r0, at: {} }; S.tasks.push(rec);
        if (r0 !== 'started') { note(`${t.id} (${rec.kind}): ${r0}`); continue; }
        for (const ms of [1500, 4000]) { await wait(ms === 1500 ? 1500 : 2500); if (await E(() => !!window.__SC.done)) break; await E(() => { __T.camera.updateMatrixWorld(); __T.game.frame(performance.now()); }); const hv = await heroView(); rec.at[ms] = hv ? { k: K(hv), px: hv.px, d: hv.dist, feet: hv.feetY } : null; if (ms === 1500 && S.tasks.length <= +(A.shotPer || 6)) rec.shot = await shot(`${id}-${t.id.split('.')[1]}-1.5s`); }
        await pg.waitForFunction(() => !!window.__SC.done, null, { polling: 200, timeout: 16000 }).catch(() => {});
        const R = await E(() => ({ R: window.__SC.done, s: window.__SC.t1 ? Math.round((window.__SC.t1 - window.__SC.t0) / 100) / 10 : null }));
        await E(() => { __T.camera.updateMatrixWorld(); __T.game.frame(performance.now()); }); const hv = await heroView(); rec.end = hv ? { k: K(hv), px: hv.px, d: hv.dist, feet: hv.feetY } : null; rec.s = R.s; rec.R = R.R && { ok: R.R.ok, skipped: R.R.skipped, px: R.R.px, at: R.R.at, kind: R.R.kind, moment: R.R.moment, err: R.R.err, phase: R.R.phase, stones: R.R.stones };
        if (!R.R) { note(`${t.id}: no end in 16 s → skipped by end()`); await E(() => { try { window.__SC.end && window.__SC.end(); } catch (e) { /* */ } }); await wait(800); rec.timeout = true; }
        const ev = await E(() => (window.__GAME_LOG || []).filter((e) => e.type === 'taskScene').slice(-2).map((e) => e.d));
        note(`${id} ${t.id} (${rec.kind}) ${rec.s != null ? rec.s + ' s' : 'no end'} · 1.5s ${rec.at[1500] ? rec.at[1500].k + ' d' + rec.at[1500].d : '—'} · 4s ${rec.at[4000] ? rec.at[4000].k + ' d' + rec.at[4000].d : '—'} · end ${rec.end ? rec.end.k + ' d' + rec.end.d : '—'} · R ${JSON.stringify(rec.R || {}).slice(0, 120)} · ev ${JSON.stringify(ev).slice(0, 100)}`);
        await wait(600);
      }
      const ks = S.tasks.filter((x) => x.at[1500]).map((x) => x.at[1500].k); S.k80 = `${ks.filter((k) => k === '✓').length}/${ks.length}`;
      note(`STAGE ${id}: K80 at 1.5 s ✓ ${S.k80} · lengths ${S.tasks.map((x) => x.s).join(' ')} · ends ✓ ${S.tasks.filter((x) => x.end && x.end.k === '✓').length}/${S.tasks.filter((x) => x.end).length}`);
    }
    note(`errors ${log.errors.length} ${log.errors.slice(0, 2).join(' | ')}`);
  } catch (e) { console.error('RUN ERROR', e.message); log.fatal = e.message; }
  finally { fs.writeFileSync(path.join(OUT, `${TAG}-log.json`), JSON.stringify(log, null, 1)); await ctx.close(); }
})();
