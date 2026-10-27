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
  const kind = () => { try { const tw = globalThis.__SHIFT && globalThis.__SHIFT.mods && globalThis.__SHIFT.mods.twin; if (tw && tw.viewK && tw.viewK() > 0.5) return 'act'; } catch (e) { /* */ } return null; };
  function topOff(H) {
    // the model's bounds once (its skinned meshes posed), as the height of its top over its root
    let top = -Infinity, ok = false;
    try {
      H.root.updateMatrixWorld(true);
      const ry = H.root.getWorldPosition(H.root.position.clone()).y;
      H.root.traverse((n) => {
        if (!n.isMesh) return;
        if (n.isSkinnedMesh && n.computeBoundingBox) n.computeBoundingBox(); else if (n.geometry && !n.geometry.boundingBox) n.geometry.computeBoundingBox();
        const bb = (n.isSkinnedMesh ? n.boundingBox : n.geometry && n.geometry.boundingBox); if (!bb) return;
        const b = bb.clone().applyMatrix4(n.matrixWorld); top = Math.max(top, b.max.y); ok = true;
      });
      return ok ? top - ry : null;
    } catch (e) { return null; }
  }
  function frame() {
    if (!st.on) return;
    try {
      const H = globalThis.__HERO35, cam = globalThis.__T && globalThis.__T.camera; if (!H || !H.loaded || !H.root || !cam || !H.root.visible) return;
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
    stats() { const o = {}; for (const [k, B] of Object.entries(K)) o[k] = { n: B.n, min: Math.round(B.min * 1000) / 1000, max: Math.round(B.max * 1000) / 1000, mean: B.n ? Math.round((B.sum / B.n) * 1000) / 1000 : null, lo: B.lo, hi: B.hi, out: B.out, tgtOff: B.tgtOff, tgtN: B.tgtN, worst: B.worst, low: B.low }; return { top: st.top, frames: st.n, err: st.err || null, k: o }; },
  };
})();
