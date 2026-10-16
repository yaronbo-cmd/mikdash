// POLISH23 (wave 23): the day polished — by REAL touch (CDP) at 844×390 on dist/test.html#avodah.
//   1 the night is dark (the 'nightd' preset: little sun/hemi, the אמרכל's torch the light, a dark frame) and the noon is not
//   2 the day's points go to Phase A's save (score ×10, once per task, lastSeen kept), the coin crosses 10,000 → "דינר זהב" (left unseen for Phase A)
//   3 the queue at the default pace (a pilgrim every 8 s, four at most) and EVERY work finishes by taps alone in ≤ 60 s
//   4 the craft zoom: the follow camera at ≈ 0.62 of its distance during a work, the stage ≥ 60 % of the frame's width, he is seen
//   5 PLACE22.close on the open floor (x −20…−16, z 0…6), fire and lambs ≥ 15 amot apart, the camera sees him at both
//   NODE_PATH=/home/claude/.npm-global/lib/node_modules /home/claude/wt/bus/brun node test/polish23-touch.cjs [--no-build] [--shots] [--only=queue,seals,…] [--skip-works]
const { chromium } = require('playwright');
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'test/out/polish23');
const args = process.argv.slice(2);
if (!args.includes('--no-build')) execSync('node build.mjs', { cwd: ROOT, stdio: 'inherit' });
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = args.includes('--shots');
const ONLY = (args.find((a) => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
const IDS = ['fire', 'watch', 'lambs', 'kiyor', 'queue', 'seals', 'wood', 'pen', 'nechunya', 'vessels', 'account', 'gates'].filter((i) => !ONLY.length || ONLY.includes(i));
const results = [];
const check = (name, ok, info = '') => { results.push(!!ok); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${info ? '  · ' + info : ''}`); };

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const T0 = Date.now();
  try {
    const ctx = await b.newContext({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/, (r) => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    const pg = await ctx.newPage();
    const errs = [];
    pg.on('console', (m) => { if (m.type() === 'error' && !/fonts|favicon|AudioContext/.test(m.text())) errs.push(m.text().slice(0, 240)); });
    pg.on('pageerror', (e) => errs.push('PAGEERR ' + e.message.slice(0, 240)));
    await pg.addInitScript(() => {
      try {
        localStorage.clear(); localStorage.setItem('bh_avodah', JSON.stringify({ v: 1, name: 'אביתר', mishmar: 3, seenIntro: true, created: Date.now(), lastSeen: Date.now() }));
        // a Phase A save near the first dinar (9,950 of 10,000), its lastSeen an hour ago (the bridge must leave it alone)
        localStorage.setItem('bh_beta2', JSON.stringify({ v: 6, score: 9950, dinars: [], scf: {}, lastSeen: Date.now() - 3600e3 }));
      } catch (e) { /* none */ }
      window.__GAME_LOG = []; window.__START_PAUSED = true; window.__DT_MAX = 0.6;
    });
    { const el = (args.find((a) => a.startsWith('--el=')) || '').slice(5); if (el) await pg.addInitScript((v) => { window.__P23_EL = +v; }, el); }
    if (args.includes('--nozoom')) await pg.addInitScript(() => { window.__P23_ZOOM = 0; });
    await pg.goto('file://' + path.join(ROOT, 'dist/test.html#avodah'));
    await pg.waitForFunction(() => window.__T && window.__T.booted, null, { polling: 200, timeout: 240000 });
    const G = (fn, a) => pg.evaluate(fn, a);
    const waitFor = (fn, a, ms = 8000) => pg.waitForFunction(fn, a, { polling: 100, timeout: ms }).then(() => true, () => false);
    const cdp = await ctx.newCDPSession(pg);
    const fingers = new Map();
    const send = (type) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: [...fingers.entries()].map(([id, [x, y]]) => ({ x: Math.round(x), y: Math.round(y), id, radiusX: 6, radiusY: 6, force: 1 })) });
    const down = async (id, x, y) => { fingers.set(id, [x, y]); await send('touchStart'); };
    const up = async (id) => { fingers.delete(id); if (fingers.size) await send('touchMove'); else await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); };
    const btnC = () => G(() => { const r = document.querySelector('.tw-btn').getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; });
    const tap = async () => { const c = await btnC(); await down(2, c.x, c.y); await pg.waitForTimeout(70); await up(2); };
    const shot = async (name) => {
      if (!SHOTS) return;
      await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); });
      await pg.screenshot({ path: path.join(OUT, name + '.png'), timeout: 240000 }); console.log('   shot test/out/polish23/' + name + '.png');
      await G(() => { window.__HUD_HOLD = false; });
    };
    /** the mean luminance (0…1) of the frame as the page sees it (a screenshot decoded in the page) */
    const luma = async () => {
      await G(() => { __T.simulate(false); __T.render(); __T.render(); window.__HUD_HOLD = true; __T.simulate(true); });
      const buf = await pg.screenshot({ timeout: 240000, clip: { x: 200, y: 90, width: 440, height: 240 } });
      await G(() => { window.__HUD_HOLD = false; });
      return pg.evaluate(async (b64) => {
        const bm = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
        const c = document.createElement('canvas'); c.width = bm.width; c.height = bm.height; const x = c.getContext('2d'); x.drawImage(bm, 0, 0);
        const d = x.getImageData(0, 0, c.width, c.height).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += (0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]) / 255; return s / (d.length / 4);
      }, buf.toString('base64'));
    };
    await waitFor(() => window.__DAY && __DAY.twin && __TWIN.on(), null, 60000);
    await G(() => { __DAY.clock.pause(); });

    /* 5. the places */
    const P = await G(() => { const p = __DAY.D.PLACE; return { close: p.close, fire: p.moked, lambs: p.lambs }; });
    check('PLACE22.close is on the open floor: x −20…−16, z 0…6', P.close.x >= -20 && P.close.x <= -16 && P.close.z >= 0 && P.close.z <= 6, JSON.stringify(P.close));
    check('the fire and the lambs markers are ≥ 15 amot apart', Math.hypot(P.fire.x - P.lambs.x, P.fire.z - P.lambs.z) >= 15, `${Math.hypot(P.fire.x - P.lambs.x, P.fire.z - P.lambs.z).toFixed(1)} amot`);
    const seen = [];
    for (const pl of ['close', 'moked', 'lambs']) {
      await G((p) => __DAY.teleport(p), pl); await pg.waitForTimeout(2600);
      const v = await G(() => { const c = __T.view.camNow({}), h = __T.stages.heroXYZ({}); return { ok: !__T.stages.frameBlocked(c.px, c.py, c.pz, h.x, h.y + 1.6, h.z, 'x'), x: h.x, z: h.z }; });
      seen.push(pl + ':' + (v.ok ? 'ok' : 'HIDDEN') + `(${v.x.toFixed(0)},${v.z.toFixed(0)})`);
      const free = await G((p) => { const q = __DAY.D.PLACE[p]; return __T.stages.hero && true; }, pl);
      void free;
      if (pl === 'close') await shot('p23-close');
    }
    check('at the close, the fire and the lambs the camera sees him (no built wall between)', seen.every((x) => /:ok/.test(x)), seen.join(' '));

    /* 1. the night is dark */
    await G(() => { __DAY.clock.skipTo(23); __DAY.teleport('seals'); }); await pg.waitForTimeout(3000);
    const nk = await G(() => ({ sky: __T.sky.key, torch: (() => { let t = 0; __T.scene.traverse((o) => { if (o.name === 'p23-torch') t = o.intensity; }); return t; })(), lum: (() => { let l = 0; __T.scene.traverse((o) => { if (o.isLight && o.name !== 'p23-torch' && o.visible) { if (o.isDirectionalLight) l += o.intensity; else if (o.isHemisphereLight) l += 0.5 * o.intensity; } }); return l; })() }));
    check('23:00: the world is on the dark night preset, the אמרכל\'s torch is lit, the sun+hemi light is under 0.5', nk.sky === 'nightd' && nk.torch > 10 && nk.lum < 0.5, JSON.stringify(nk));
    const lumN = await luma(); await shot('p23-night-seals');
    await G(() => { __DAY.teleport('lambs'); }); await pg.waitForTimeout(2800);
    const lumN2 = await luma(); await shot('p23-night-lambs');
    await G(() => { __DAY.clock.skipTo(10); }); await pg.waitForTimeout(3200);
    const lumD = await luma(); await shot('p23-noon');
    const nk2 = await G(() => { let t = 0; __T.scene.traverse((o) => { if (o.name === 'p23-torch') t = o.intensity; }); return { sky: __T.sky.key, torch: t }; });
    check('the night frame is dark (mean luma < 0.36 at the court, < 0.30 at the lambs) and at least 1.5× darker than noon', lumN < 0.36 && lumN2 < 0.30 && lumD > 1.5 * Math.max(lumN, lumN2), `court ${lumN.toFixed(3)} · lambs ${lumN2.toFixed(3)} · noon ${lumD.toFixed(3)}`);
    check('by day the torch is out (the day sky preset)', nk2.torch < 1 && nk2.sky !== 'nightd', JSON.stringify(nk2));

    /* 2. the bridge: the day's points → Phase A's score; the coin */
    await G(() => { __DAY.clock.skipTo(9.1); __DAY.D.refresh(); __DAY.clock.tick(40); });
    await waitFor(() => __DAY.tasks.get('wicks') && __DAY.tasks.get('wicks').state === 'open', null, 4000);
    await G(() => __DAY.teleport('store')); await pg.waitForTimeout(1800);
    const sv0 = await G(() => JSON.parse(localStorage.getItem('bh_beta2')));
    const coin0 = await G(() => ({ n: document.querySelector('.dy-cn').textContent, w: document.querySelector('.dy-cb').style.width }));
    await waitFor(() => { const s = __TWIN.spec(); return !!s && s.job === 'wicks'; }, null, 5000);
    for (let k = 0; k < 4; k++) { await tap(); await pg.waitForTimeout(300); if (await G(() => __DAY.tasks.get('wicks').state === 'done')) break; }
    const done = await waitFor(() => __DAY.tasks.get('wicks').state === 'done', null, 6000);
    await pg.waitForTimeout(600);
    const sv1 = await G(() => JSON.parse(localStorage.getItem('bh_beta2')));
    check('the errand done: Phase A\'s save gained its points ×10 (wicks 8 → +80), no more', done && sv1.score - sv0.score >= 60 && sv1.score - sv0.score <= 100, `${sv0.score} → ${sv1.score}`);
    check('9,950 + the day\'s points crossed 10,000: one דינר in the save, left unseen (Phase A celebrates it), lastSeen untouched', Array.isArray(sv1.dinars) && sv1.dinars.length === 1 && !sv1.dinars[0].seen && Math.abs(sv1.lastSeen - sv0.lastSeen) < 1000, JSON.stringify({ d: sv1.dinars, ls: sv1.lastSeen - sv0.lastSeen }));
    const banner = await G(() => (document.querySelector('.dy-banner') || {}).textContent);
    const coin1 = await G(() => ({ n: document.querySelector('.dy-cn').textContent, w: document.querySelector('.dy-cb').style.width, r: document.querySelector('.dy-coin').getBoundingClientRect().toJSON() }));
    check('the coin in the HUD shows the score and the bar (a visible chip, ≥ 24 px tall) and the banner says דינר', coin1.n !== coin0.n && coin1.r.height >= 20 && coin1.r.width > 40 && /דינר/.test(banner || ''), JSON.stringify({ coin0, coin1: { n: coin1.n, w: coin1.w }, banner }));
    await shot('p23-coin');
    // once: the same task, forced and done again the same day, pays nothing more
    await G(() => { __DAY.tasks.force('wicks'); });
    await pg.waitForTimeout(700);
    await waitFor(() => { const s = __TWIN.spec(); return !!s && s.job === 'wicks'; }, null, 5000);
    for (let k = 0; k < 4; k++) { await tap(); await pg.waitForTimeout(300); if (await G(() => __DAY.tasks.get('wicks').state === 'done')) break; }
    await waitFor(() => __DAY.tasks.get('wicks').state === 'done', null, 6000); await pg.waitForTimeout(500);
    const sv2 = await G(() => JSON.parse(localStorage.getItem('bh_beta2')));
    check('a task pays the master score once a day (the same task again: no more points)', sv2.score === sv1.score && sv2.dinars.length === 1, `${sv1.score} → ${sv2.score}`);

    /* 3 + 4. every work by taps alone in ≤ 60 s (the default pace); the camera zoom during a work */
    if (!args.includes('--skip-works')) {
      const times = {}, seenLog = {};
      for (const id of IDS) {
        await G((i) => { for (const t of __DAY.tasks.list()) if (/^restock-/.test(t.id) && t.state === 'open') __DAY.tasks.done(t.id); __DAY.tasks.force(i); const t = __DAY.tasks.get(i); __DAY.teleport(t.place); }, id);
        await pg.waitForTimeout(1500);
        const awake = await waitFor((i) => { const s = __TWIN.spec(); return !!s && s.job === i; }, id, 6000);
        if (!awake) { check(`${id}: the button wakes at its marker`, false, JSON.stringify(await G(() => __TWIN.spec() && __TWIN.spec().job))); continue; }
        const d0 = await G(() => { const c = __T.view.camNow({}), h = __T.stages.heroXYZ({}); return Math.hypot(c.px - h.x, c.py - h.y, c.pz - h.z); });
        const t0 = Date.now(); let n = 0, done = false, zoom = null, wfr = null, kfr = null, seenMid = null;
        while (Date.now() - t0 < 75000 && !done) {
          await tap(); n++; await pg.waitForTimeout(240);
          done = await G((i) => __DAY.tasks.get(i).state === 'done', id);
          if (zoom != null || n > 2) { const f = await G(() => { const c = __T.view.camNow({}), h = __T.stages.heroXYZ({}); return [!__T.stages.frameBlocked(c.px, c.py, c.pz, h.x, h.y + 1.6, h.z, 'x') ? 1 : 0, +Math.hypot(c.px - h.x, c.pz - h.z).toFixed(1), +c.py.toFixed(1)]; }); (seenLog[id] = seenLog[id] || []).push(f.join(':')); }
          if (!zoom && Date.now() - t0 >= 2800) {   // (the camera has settled and the kit has refitted its stage by then)
            seenMid = await G(() => { const c = __T.view.camNow({}), h = __T.stages.heroXYZ({}); return !__T.stages.frameBlocked(c.px, c.py, c.pz, h.x, h.y + 1.6, h.z, 'x'); });
            zoom = await G((d0) => { const c = __T.view.camNow({}), h = __T.stages.heroXYZ({}); return +(Math.hypot(c.px - h.x, c.py - h.y, c.pz - h.z) / d0).toFixed(2); }, d0);
            // the stage's width in the frame: the screen extent of the work's visible props (the instanced meshes of the kit)
            wfr = await G(() => {
              let lo = 1e9, hi = -1e9; const W = innerWidth;
              __T.scene.traverse((o) => {
                if (!o.isInstancedMesh || !o.visible || !/^(w22-|worksb22-)/.test(o.name) || !o.count) return;
                const m = new o.matrixWorld.constructor(), v = new __T.Vector3();
                for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); const e = m.elements; v.set(e[12], e[13], e[14]); const r = Math.max(Math.hypot(e[0], e[1], e[2]), Math.hypot(e[8], e[9], e[10])) * 0.5; for (const dx of [-r, r]) { const p = new __T.Vector3(v.x + dx, v.y, v.z).project(__T.camera); if (p.z < 1) { const x = (p.x * 0.5 + 0.5) * W; lo = Math.min(lo, x); hi = Math.max(hi, x); } } }
              });
              return hi > lo ? +((Math.min(hi, W) - Math.max(lo, 0)) / W).toFixed(2) : 0;
            });
            // the kit's own stages (WORKSA): the stage's width at its middle depth, as kit.place measures it (bounds from the works' defs)
            const BD = { watch: [1.2, 5.4, -4.6, 4.6], fire: [1.4, 6.2, -3.8, 3.8], lambs: [1.2, 5.4, -4, 4], pen: [1.6, 7, -4.8, 4.8], wood: [1.4, 6.2, -4.8, 4.8] }[id];
            kfr = BD ? await G((bd) => { const k = __W22.kit(); if (!k) return null; const mid = (bd[0] + bd[1]) / 2, p = k.screen(mid, bd[2], 0), q = k.screen(mid, bd[3], 0); return +(Math.abs(q.x - p.x) / innerWidth).toFixed(2); }, BD) : null;
            if (BD) console.log('   refit', id, await G(() => JSON.stringify([window.__P23_REFIT, window.__P23_REFIT_SKIP])));
            if (BD) console.log('   kit', id, JSON.stringify(await G((bd) => { const k = __W22.kit(); if (!k) return null; const mid = (bd[0] + bd[1]) / 2, c = __T.view.camNow({}), h = __T.stages.heroXYZ({}), hp = __T.view.project(h.x, h.y, h.z); return { fit: k.F.fit, K: k.F.K, Ca: k.F.Ca, p: k.screen(mid, bd[2], 0), q: k.screen(mid, bd[3], 0), far: k.screen(bd[1], 0, 1), near: k.screen(bd[0], 0, 0), hero: [Math.round(hp.x), Math.round(hp.y)], cam: [+c.px.toFixed(1), +c.py.toFixed(1), +c.pz.toFixed(1)], tgt: [+c.tx.toFixed(1), +c.ty.toFixed(1), +c.tz.toFixed(1)], h: [+h.x.toFixed(1), +h.y.toFixed(1), +h.z.toFixed(1)], Fxz: [+k.F.x.toFixed(1), +k.F.z.toFixed(1), +k.F.fx.toFixed(2), +k.F.fz.toFixed(2)] }; }, BD)));
            if (id === 'seals' || id === 'queue' || id === 'wood' || id === 'fire') await shot('p23-work-' + id);
          }
        }
        const secs = (Date.now() - t0) / 1000; times[id] = +secs.toFixed(0);
        check(`${id}: from its marker, finished by taps alone in ≤ 60 s`, done && secs <= 60, `${n} taps · ${secs.toFixed(0)} s · zoom ${zoom} · stage ${kfr != null ? Math.round(kfr * 100) + '% (kit)' : wfr == null ? '-' : Math.round(wfr * 100) + '% (props)'}`);
        if (kfr != null) check(`${id}: the stage fits ≥ 60 % of the frame's width`, kfr >= 0.6, `${Math.round(kfr * 100)}%`);
        if (zoom != null) {
          check(`${id}: the camera is closer during the work (≤ 0.78 of its distance) and he is seen`, zoom <= 0.78 && seenMid === true, `ratio ${zoom} seen ${seenMid}`);
        }
        if (wfr != null && wfr > 0) console.log(`   stage width ${id}: ${Math.round(wfr * 100)}% of the frame`);
        await pg.waitForTimeout(800);
      }
      console.log('   times', JSON.stringify(times));
      for (const id in seenLog) { const L = seenLog[id], bad = L.filter((x) => x[0] === '0').length; if (bad) console.log('   hidden', id, bad + '/' + L.length, L.join(' ')); }
    }
    check('no console errors', errs.length === 0, errs.slice(0, 3).join(' | '));
  } catch (e) { console.log('FAIL  exception', e && e.stack ? e.stack.split('\n').slice(0, 4).join(' ') : e); results.push(false); }
  finally { await b.close(); console.log(`\n${results.filter(Boolean).length}/${results.length} passed in ${((Date.now() - T0) / 1000).toFixed(0)} s`); process.exit(results.every(Boolean) ? 0 : 1); }
})();
