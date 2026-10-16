// PEOPLE's phone shots in the real build (dist/test.html; run `node build.mjs` first): the plaza's crowd by day and by
// night (the finished Mount, __NO_GAME), checked for people at their stations and the draw-call budget.
//   node test/people-shots.cjs [plaza] [night]      → test/out/people/*.png
// Needs NODE_PATH with playwright (PROJECT.md §10). One browser, closed in finally. Exit code 1 on a failure.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/people');
fs.mkdirSync(OUT, { recursive: true });
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const W = +(process.env.W || 390), H = +(process.env.H || 844);
const fails = [];
const ok = (name, cond, info) => { console.log((cond ? 'ok   ' : 'FAIL ') + name + (info !== undefined ? ' ' + JSON.stringify(info) : '')); if (!cond) fails.push(name); };
// [name, time, crowd scene, camera: view.lookAt(x, y, z, dist, az, el)]
const SHOTS = [
  ['plaza', 'noon', 'auto', [-85, 2, 296, 75, -60, 34]],
  ['night', 'night', 'auto', [-85, 2, 300, 70, -60, 34]],
  ['shoeva', 'night', 'night', [50, 8, 0, 50, 10, 30]],
];
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const pg = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
    const logs = [];
    pg.on('console', (m) => { if (m.type() === 'error') logs.push(m.text()); });
    pg.on('pageerror', (e) => logs.push('PAGEERR ' + e.message));
    await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__NO_GAME = true; window.__START_PAUSED = true; window.__DT_MAX = 0.6; });
    await pg.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const t0 = Date.now();
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html'));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 300000 });
    console.log(`booted in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
    await pg.evaluate(() => { __T.pause(true); if (__T.simulate) __T.simulate(false); const h = document.getElementById('hint'); if (h) h.style.display = 'none'; });
    // wave 7: the hero at three distances (hero.view: his front-left) and a crew at his site — the Phase A site by day
    const HERO = [['hero_far', 70, 30], ['hero_mid', 26, 16], ['hero_close', 9, 8]];
    if (!only.length || only.some((o) => o.startsWith('hero') || o === 'crew')) {
      await pg.evaluate(() => {
        const S = __T.stages; __T.setTime('noon'); S.buildMode(); S.setStage('har', 'done', 1, { instant: true }); if (S.setBoulders) S.setBoulders([]);
        S.setStage('wall', 'building', 0.3, { instant: true }); if (S.setWork) S.setWork('wall', { phase: 'courses', stones: 60 });
        if (__T.life && __T.life.setPhase) __T.life.setPhase('build'); if (__T.crews) __T.crews.setCrews('wall', 2, [0, 1]);
        S.hero.place('wall'); S.hero.setTool('iron'); __T.crowd.setScene('auto'); __T.step(8, 1 / 30);
      });
      for (const [name, dist, el] of [...HERO, ['crew', 55, 34]]) {
        if (only.length && !only.includes(name) && !only.includes('hero')) continue;
        const tt = Date.now();
        await pg.evaluate(([name, dist, el]) => {
          const v = __T.stages.hero.view(dist, el), V = __T.Vector3;
          if (name === 'crew') { const i = __T.crews && __T.crews.stats; v.t = [v.t[0], v.t[1] - 3, v.t[2]]; }
          __T.flyToPos(new V(...v.p), new V(...v.t), 1);
          return new Promise((r) => setTimeout(() => { __T.render(); r(); }, 40));
        }, [name, dist, el]);
        try { await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 420000 }); } catch (e) { ok(`${name}: shot`, false, e.name); continue; }
        const dc = await pg.evaluate(() => __T.drawCalls());
        ok(`${name}: ≤ 150 draw calls, ≤ 1.5 M triangles`, dc.total <= 150 && dc.triangles <= 1.5e6, dc);
        console.log(`shot test/out/people/${name}.png ${((Date.now() - tt) / 1000).toFixed(0)} s`);
      }
    }
    // wave 7: the doves of the flock, close (a camera 22 amot from one of them, from above and from below)
    if (only.includes('doves')) {
      for (const [name, up] of [['doves_above', 1], ['doves_below', -1]]) {
        await pg.evaluate((up) => {
          __T.setTime('noon'); __T.step(1, 1 / 30);
          let m = null; __T.scene.traverse((o) => { if (!m && o.isInstancedMesh && o.count === 16 && o.material && o.material.vertexColors && o.material.side === 2) m = o; });
          const M = new __T.camera.matrix.constructor(), P = new __T.Vector3(); m.getMatrixAt(0, M); P.setFromMatrixPosition(M);
          __T.flyToPos(new __T.Vector3(P.x + 14, P.y + 16 * up, P.z + 10), P.clone(), 1);
          return new Promise((r) => setTimeout(() => { __T.render(); r(); }, 40));
        }, up);
        await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 420000 });
        console.log(`shot test/out/people/${name}.png`);
      }
    }
    for (const [name, time, sc, cam] of SHOTS) {
      if (only.length && !only.includes(name)) continue;
      const tt = Date.now();
      const st = await pg.evaluate(([time, sc, cam]) => {
        __T.setTime(time); __T.crowd.setScene(sc); __T.step(12, 1 / 30);
        // (the camera: from the target, `dist` away at azimuth az and elevation el, as view.lookAt; the fly lasts 1 ms)
        const [x, y, z, dist, az, el] = cam, a = az * Math.PI / 180, e = el * Math.PI / 180, g = __T.stages.groundAt(x, z) + y;
        __T.flyToPos(new __T.Vector3(x + Math.cos(e) * Math.cos(a) * dist, g + Math.sin(e) * dist, z + Math.cos(e) * Math.sin(a) * dist), new __T.Vector3(x, g, z), 1);
        return new Promise((r) => setTimeout(() => { __T.render(); r(Object.assign({ cam: [__T.camera.position.x, __T.camera.position.y, __T.camera.position.z, __T.controls.target.x, __T.controls.target.y, __T.controls.target.z, __T.camera.fov, __T.camera.zoom].map((v) => Math.round(v)), off: __T.camera.view && __T.camera.view.enabled ? [__T.camera.view.offsetX, __T.camera.view.offsetY, __T.camera.view.width, __T.camera.view.fullWidth].map(Math.round) : null }, __T.crowd.stats)); }, 40));
      }, [time, sc, cam]);
      ok(`${name}: people at their stations (${st.scene})`, st.people >= 20, st);
      try { await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 420000 }); } catch (e) { ok(`${name}: shot`, false, e.name); continue; }
      const dc = await pg.evaluate(() => __T.drawCalls());
      ok(`${name}: ≤ 150 draw calls, ≤ 1.5 M triangles`, dc.total <= 150 && dc.triangles <= 1.5e6, dc);
      console.log(`shot test/out/people/${name}.png ${((Date.now() - tt) / 1000).toFixed(0)} s`);
    }
    ok('no page errors', !logs.length, logs.slice(0, 4));
  } finally { await b.close(); }
  console.log(fails.length ? `${fails.length} FAILED` : 'all ok');
  process.exit(fails.length ? 1 : 0);
})();
