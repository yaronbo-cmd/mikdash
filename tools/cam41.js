/* build 41 — the camera's measure, in the page (added by tools/autoplay35-run.cjs --cam41, after the page is up). Every 50 ms (the simulated loop's step):
 * the kohen's height on the screen (his feet and the top of his hat — the model's bounds measured once, then followed by its root) as a
 * share of the screen's height, his whole figure in the frame (feet and top in front of the camera, inside the screen), and the place he
 * goes (the engine's flowNext) on the screen. Kept per kind of frame: 'walk' (he moves, no act's surface up), 'act' (an act's authored view eased in: the twin's viewK), 'still'. __CAM41.stats() → per kind { n, min, max, lo (< 18 %),
 * hi (> 45 %), out (not whole in the frame), tgtOff (walking, the place off the screen), worst: [ [frac, x, z, guard mode] … ] }.
 * Never a Divine Name. */
(() => {
  if (globalThis.__CAM41) return;
  const LO = 0.18, HI = 0.45;
  const K = {}, st = { on: false, top: null, n: 0, last: null, px: NaN, pz: NaN };
  // (the kind of frame by the camera's own state: an act's authored view eased in (the twin's viewK over ½) → 'act'; else the follow
  //  camera — 'walk' while he moves, 'still' when he stands)
  const kind = () => { try { const h4 = globalThis.__H42; if (h4 && h4.on) { const s = h4.state(); return s.job && !s.pending ? 'act' : null; } } catch (e) { /* */ }   // (build 42–43: the new stage 01's act)
    try { const tw = globalThis.__SHIFT && globalThis.__SHIFT.mods && globalThis.__SHIFT.mods.twin; if (tw && tw.viewK && tw.viewK() > 0.5) return 'act'; } catch (e) { /* */ } return null; };
  function topOff(H) {
    // the model's bounds once (its skinned meshes posed), as the height of its top over its root
    let top = -Infinity, ok = false;
    try {
      H.root.updateMatrixWorld(true);
      const ry = H.root.getWorldPosition(H.root.position.clone()).y;
      (H.phaseA ? H.root.traverseVisible.bind(H.root) : H.root.traverse.bind(H.root))((n) => {   // (build 43: Phase A's figure — its visible meshes only)
        if (!n.isMesh) return;
        if (n.isSkinnedMesh && n.computeBoundingBox) n.computeBoundingBox(); else if (n.geometry && !n.geometry.boundingBox) n.geometry.computeBoundingBox();
        const bb = (n.isSkinnedMesh ? n.boundingBox : n.geometry && n.geometry.boundingBox); if (!bb) return;
        const b = bb.clone().applyMatrix4(n.matrixWorld); if (H.phaseA && b.max.y - b.min.y > 12) return; top = Math.max(top, b.max.y); ok = true;
      });
      return ok ? top - ry : null;
    } catch (e) { return null; }
  }
  function frame() {
    if (!st.on) return;
    try {
      let H = globalThis.__HERO35; const cam = globalThis.__T && globalThis.__T.camera;
      const h4 = globalThis.__H42; if (h4 && h4.on) {   // (build 43: the new stage 01 — his feet and his height from the stage itself; build 42's page: the stages' feet and the measured 6.44)
        const hb = h4.heroBox ? h4.heroBox() : (() => { const q = { x: 0, y: 0, z: 0 }; globalThis.__T.stages.heroXYZ(q); return { x: q.x, y: q.y, z: q.z, h: 6.44 }; })(), V = cam.position.constructor, a = new V(hb.x, hb.y, hb.z).project(cam), b = new V(hb.x, hb.y + hb.h, hb.z).project(cam), fr = a.z < 1 && b.z < 1 ? (b.y - a.y) / 2 : NaN, frac = fr > 0 ? fr : NaN;
        const inside = (v) => v.z < 1 && v.z > -1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1, k = kind() || 'walk', B = K[k] || (K[k] = { n: 0, min: Infinity, max: -Infinity, lo: 0, hi: 0, out: 0, tgtOff: 0, tgtN: 0, sum: 0, worst: [], low: [] });
        B.n++; st.top = hb.h; if (Number.isFinite(frac)) { B.min = Math.min(B.min, frac); B.max = Math.max(B.max, frac); B.sum += frac; if (frac < LO) B.lo++; if (frac > HI) { B.hi++; if (B.worst.length < 6) B.worst.push([Math.round(frac * 1000) / 1000, h4.state().part]); } } if (!(inside(a) && inside(b))) B.out++;
        if (k === 'act' && h4.objAt) { try { const o = h4.objAt(); if (o) { const v = new V(o.x, o.y, o.z).project(cam), ox = (v.x + 1) / 2; B.objN = (B.objN || 0) + 1; B.objSum = (B.objSum || 0) + ox; if (ox < 0.5 || ox > 0.7) { B.objOff = (B.objOff || 0) + 1; if (B.low.length < 6) B.low.push([Math.round(ox * 100) / 100, h4.state().part]); } } const ca = h4.camAt(), cp = cam.position; B.camN = (B.camN || 0) + 1; B.camOff = (B.camOff || 0) + Math.hypot(cp.x - ca.p[0], cp.y - ca.p[1], cp.z - ca.p[2]); B.dHero = (B.dHero || 0) + Math.hypot(cp.x - hb.x, cp.y - hb.y - hb.h / 2, cp.z - hb.z); } catch (e) { /* */ } }
        st.n++; return;
      }
      if (!(H && H.loaded && H.root && H.root.visible)) {   // (Phase A — build 43: the visible figure standing where the stages' hero is: a skinned mesh within 3 amot of him, found once)
        if (!st.figA) { try { const sh = globalThis.__T.stages.hero, hp = sh.position; let best = null, bd = 9; globalThis.__T.scene.traverseVisible((n) => { if (!n.isSkinnedMesh && !(n.isMesh && n.parent && /hero|kohen|figure/i.test(n.parent.name || ''))) return; const w = n.getWorldPosition(n.position.clone()), d = Math.hypot(w.x - hp.x, w.z - hp.z); if (d < bd) { bd = d; best = n; } }); st.figA = best; st.figD = Math.round(bd * 100) / 100; } catch (e) { st.err = 'figA ' + String(e && e.message).slice(0, 80); } }
        H = st.figA ? { loaded: true, root: st.figA, phaseA: true } : null;
      }
      if (!H || !H.loaded || !H.root || !cam || !H.root.visible) return;
      if (st.top == null) { st.top = topOff(H); if (st.top == null) return; }
      const p = H.root.getWorldPosition(H.root.position.clone()), q = p.clone(); q.y += st.top;
      const a = p.clone().project(cam), b = q.clone().project(cam);
      const W = innerWidth, Hh = innerHeight, inside = (v) => v.z < 1 && v.z > -1 && Math.abs(v.x) <= 1 && Math.abs(v.y) <= 1;
      const frac0 = a.z < 1 && b.z < 1 ? ((b.y - a.y) / 2) : NaN, frac = frac0 > 0 ? frac0 : NaN;   // (NDC y: the screen's height is 2; behind the camera or upside down: not a height — counted out)
      let k = kind();
      const moved = Number.isFinite(st.px) && Math.hypot(p.x - st.px, p.z - st.pz) > 0.004; st.px = p.x; st.pz = p.z;
      if (!k) k = moved ? 'walk' : 'still';
      const B = K[k] || (K[k] = { n: 0, min: Infinity, max: -Infinity, lo: 0, hi: 0, out: 0, tgtOff: 0, tgtN: 0, sum: 0, worst: [], low: [] });
      B.n++;
      const g = globalThis.__DAY && globalThis.__DAY.cam28 && globalThis.__DAY.cam28.state ? globalThis.__DAY.cam28.state() : null, gm = g ? (g.mode || '') + (g.pull < 1 ? '·' + (Math.round(g.pull * 100) / 100) : '') : '';
      if (Number.isFinite(frac)) { B.min = Math.min(B.min, frac); B.max = Math.max(B.max, frac); B.sum += frac; if (frac < LO) B.lo++; if (frac > HI) { B.hi++; if (B.worst.length < 6 || frac > B.worst[B.worst.length - 1][0]) { B.worst.push([Math.round(frac * 1000) / 1000, Math.round(p.x * 10) / 10, Math.round(p.z * 10) / 10, gm]); B.worst.sort((x, y) => y[0] - x[0]); B.worst.length = Math.min(6, B.worst.length); } } if (frac < LO && B.low.length < 4) B.low.push([Math.round(frac * 1000) / 1000, Math.round(p.x * 10) / 10, Math.round(p.z * 10) / 10, gm]); }
      if (!(inside(a) && inside(b))) B.out++;
      if (k === 'act') { try { const ca = globalThis.__H42.camAt(), cp = cam.position; B.camN = (B.camN || 0) + 1; B.camOff = (B.camOff || 0) + Math.hypot(cp.x - ca.p[0], cp.y - ca.p[1], cp.z - ca.p[2]); B.dHero = (B.dHero || 0) + Math.hypot(cp.x - p.x, cp.y - p.y - 2, cp.z - p.z); } catch (e) { /* */ } }   // (build 43: the camera that renders vs the stage's own, and its distance to him)
      if (k === 'act') { try { const o = globalThis.__H42 && globalThis.__H42.objAt && globalThis.__H42.objAt(); if (o) { const v = new p.constructor(o.x, o.y, o.z).project(cam), ox = (v.x + 1) / 2; B.objN = (B.objN || 0) + 1; B.objSum = (B.objSum || 0) + ox; if (ox < 0.5 || ox > 0.7) B.objOff = (B.objOff || 0) + 1; } } catch (e) { /* */ } }   // (build 43: the act's thing across the width — 55–65 % wanted)
      if (k === 'walk') {
        try { const E = globalThis.__SHIFT.E, nx = E.flowNext && E.flowNext(); if (nx && nx.at) { B.tgtN++; const s = globalThis.__T.view.project(nx.at.x, (nx.at.y || 16) + 1, nx.at.z); if (!s || s.on === false || s.x < 0 || s.y < 0 || s.x > W || s.y > Hh) B.tgtOff++; } } catch (e) { /* */ }
      }
      // (a tight spot: walking with the guard pulled in, or him too big — one shot asked for every 8 s at most; the autoplayer takes it)
      if (k === 'walk' && (frac > HI || (g && g.pull < 0.8)) && !st.want && performance.now() - (st.wantT || 0) > 8000) { st.want = { frac: Math.round(frac * 1000) / 1000, gm, x: Math.round(p.x * 10) / 10, z: Math.round(p.z * 10) / 10 }; st.wantT = performance.now(); }
      st.n++; st.last = { k, frac, gm };
    } catch (e) { st.err = String(e && e.message).slice(0, 120); }
  }
  globalThis.__CAM41 = {
    start() { if (st.on) return; st.on = true; st.timer = setInterval(frame, 50); },   // (the page's simulated loop steps every 50 ms — main.js simulate — and renders only for a shot: sampled on its beat)
    stop() { st.on = false; clearInterval(st.timer); },
    reset() { for (const k of Object.keys(K)) delete K[k]; st.want = null; },
    take() { const w = st.want; st.want = null; return w; },
    now: () => st.last,
    stats() { const o = {}; for (const [k, B] of Object.entries(K)) o[k] = { n: B.n, min: Math.round(B.min * 1000) / 1000, max: Math.round(B.max * 1000) / 1000, mean: B.n ? Math.round((B.sum / B.n) * 1000) / 1000 : null, lo: B.lo, hi: B.hi, out: B.out, tgtOff: B.tgtOff, tgtN: B.tgtN, worst: B.worst, low: B.low, objX: B.objN ? Math.round((B.objSum / B.objN) * 1000) / 1000 : null, objOff: B.objOff || 0, camOff: B.camN ? Math.round((B.camOff / B.camN) * 100) / 100 : null, dHero: B.camN ? Math.round((B.dHero / B.camN) * 100) / 100 : null }; return { top: st.top, frames: st.n, err: st.err || null, figD: st.figD, k: o }; },
  };
})();
