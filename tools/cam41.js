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
  // ── build 51 ── the object rule (the inspector's review 27.10 §4 item 1; the coordinator's build-51 brief): in an act's view the thing
  // ≥ 30 % of the screen's width and ≥ 20 % of its height, and the line from the camera to its middle not through him (a ray against his
  // figure: a 0.6-amah cylinder from his feet to his top). The thing: the act's world box (touch40's obj40.bb — its parts or the act's own
  // thing; the laver's __OBJ51K). Per act frame: its width and height shares (its box's eight corners projected, clipped to the screen),
  // occluded or not ('self': the thing is in his own hands — the pan on the way down, the blood's vessel carried — not counted) ── /build 51 ──
  function occl(C, O, A, top, R) {
    const dx = O.x - C.x, dz = O.z - C.z, fx = C.x - A.x, fz = C.z - A.z, a = dx * dx + dz * dz, b = 2 * (fx * dx + fz * dz), c = fx * fx + fz * fz - R * R;
    if (a < 1e-9) return false; const D = b * b - 4 * a * c; if (D < 0) return false;
    const q = Math.sqrt(D), s0 = Math.max(0, (-b - q) / (2 * a)), s1 = Math.min(0.97, (-b + q) / (2 * a)); if (s0 > s1) return false;
    const y0 = C.y + (O.y - C.y) * s0, y1 = C.y + (O.y - C.y) * s1; return Math.max(y0, y1) >= A.y && Math.min(y0, y1) <= A.y + top;
  }
  function objM(B, O, cam, p, top) {
    const bb = O.bb, V = cam.position.constructor; let x0 = 9, x1 = -9, y0 = 9, y1 = -9, n = 0;
    for (const i of [0, 3]) for (const j of [1, 4]) for (const k of [2, 5]) { const v = new V(bb[i], bb[j], bb[k]).project(cam); if (!(v.z < 1 && v.z > -1)) continue; n++; x0 = Math.min(x0, v.x); x1 = Math.max(x1, v.x); y0 = Math.min(y0, v.y); y1 = Math.max(y1, v.y); }
    const id = String(O.id || '?'), I = (B.ids || (B.ids = {}))[id] || (B.ids[id] = { n: 0, w: 0, h: 0, wOk: 0, hOk: 0, ok: 0, occ: 0, self: 0 });
    B.oN = (B.oN || 0) + 1; I.n++;
    if (!n) return;
    const ws = Math.max(0, (Math.min(1, x1) - Math.max(-1, x0)) / 2), hs = Math.max(0, (Math.min(1, y1) - Math.max(-1, y0)) / 2);
    const c = { x: (bb[0] + bb[3]) / 2, y: (bb[1] + bb[4]) / 2, z: (bb[2] + bb[5]) / 2 }, self = !!O.self || Math.hypot(c.x - p.x, c.z - p.z) < 0.7;
    const oc = !self && top > 0 && occl(cam.position, c, p, top, 0.6);
    B.oW = (B.oW || 0) + ws; B.oH = (B.oH || 0) + hs; I.w += ws; I.h += hs;
    if (ws >= 0.3) { B.oWok = (B.oWok || 0) + 1; I.wOk++; } if (hs >= 0.2) { B.oHok = (B.oHok || 0) + 1; I.hOk++; } if (ws >= 0.3 && hs >= 0.2) { B.oOk = (B.oOk || 0) + 1; I.ok++; }
    if (self) { B.oSelf = (B.oSelf || 0) + 1; I.self++; } if (oc) { B.oOcc = (B.oOcc || 0) + 1; I.occ++; }
    // ── build 52 ── his screen box (a 0.6-amah figure, feet to top, 8 × 9 points projected — those in front of the camera — and clipped): its width share (hw), and the
    // share of the thing's box under it when he stands nearer than the thing (cov — "he covers it") ── /build 52 ──
    if (top > 0) { let a0 = 9, a1 = -9, b0 = 9, b1 = -9, m = 0; for (let q = 0; q < 8; q++) for (let j = 0; j <= 8; j++) { const yy = (top * j) / 8, v = new V(p.x + Math.cos(q * Math.PI / 4) * 0.6, p.y + yy, p.z + Math.sin(q * Math.PI / 4) * 0.6).project(cam); if (!(v.z < 1 && v.z > -1)) continue; m++; a0 = Math.min(a0, v.x); a1 = Math.max(a1, v.x); b0 = Math.min(b0, v.y); b1 = Math.max(b1, v.y); }
      if (m) { const hw = Math.max(0, (Math.min(1, a1) - Math.max(-1, a0)) / 2), dH = Math.hypot(p.x - cam.position.x, p.y + top / 2 - cam.position.y, p.z - cam.position.z), dO = Math.hypot(c.x - cam.position.x, c.y - cam.position.y, c.z - cam.position.z);
        const X0 = Math.max(-1, x0), X1 = Math.min(1, x1), Y0 = Math.max(-1, y0), Y1 = Math.min(1, y1), A = Math.max(1e-6, (X1 - X0) * (Y1 - Y0)), cv = dH < dO ? Math.max(0, Math.min(X1, a1) - Math.max(X0, a0)) * Math.max(0, Math.min(Y1, b1) - Math.max(Y0, b0)) / A : 0;
        I.hw = (I.hw || 0) + hw; I.hwN = (I.hwN || 0) + 1; if (hw <= 0.35) I.hw35 = (I.hw35 || 0) + 1; if (!self && cv > 0.2) I.cov = (I.cov || 0) + 1; const hh = Math.max(0, (Math.min(1, b1) - Math.max(-1, b0)) / 2); if (hw > 0 && hh > 0.45) I.big = (I.big || 0) + 1; } }   // ── build 53 ── (big: his figure seen over 45 % of the height) ── /build 53 ──
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
        // ── build 53 ── the object rule in Phase A (the inspector's review §4 must 1): the act's thing — its box from the stage (objBox) — per part ── /build 53 ──
        if (k === 'act' && h4.objBox) { try { const O = h4.objBox(); if (O && O.bb) objM(B, { bb: O.bb, id: String(h4.state().part || '?') }, cam, { x: hb.x, y: hb.y, z: hb.z }, hb.h); } catch (e) { st.err = 'obj53 ' + String(e && e.message).slice(0, 80); } }
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
      if (k === 'act') { try { const T4 = globalThis.__T40, O = T4 && T4.obj && T4.obj.bb ? T4.obj : globalThis.__OBJ51K || null; if (O && O.bb) objM(B, O, cam, p, st.top); } catch (e) { st.err = 'obj51 ' + String(e && e.message).slice(0, 80); } }   // ── build 51 ── the object rule's measure ── /build 51 ──
      if (k === 'walk') {
        try { const E = globalThis.__SHIFT.E, nx = E.flowNext && E.flowNext(); if (nx && nx.at) { B.tgtN++; const s = globalThis.__T.view.project(nx.at.x, (nx.at.y || 16) + 1, nx.at.z); if (!s || s.on === false || s.x < 0 || s.y < 0 || s.x > W || s.y > Hh) B.tgtOff++; } } catch (e) { /* */ }
      }
      // (a tight spot: walking with the guard pulled in, or him too big — one shot asked for every 8 s at most; the autoplayer takes it)
      if (k === 'walk' && (frac > HI || (g && g.pull < 0.8)) && !st.want && performance.now() - (st.wantT || 0) > 8000) { st.want = { frac: Math.round(frac * 1000) / 1000, gm, x: Math.round(p.x * 10) / 10, z: Math.round(p.z * 10) / 10 }; st.wantT = performance.now(); }
      st.n++; st.last = { k, frac, gm };
    } catch (e) { st.err = String(e && e.message).slice(0, 120); }
  }
  const pc = (a, n) => (n ? Math.round((a / n) * 1000) / 10 : null);
  const objS = (B) => ({ n: B.oN, w: pc(B.oW || 0, B.oN), h: pc(B.oH || 0, B.oN), wOk: pc(B.oWok || 0, B.oN), hOk: pc(B.oHok || 0, B.oN), ok: pc(B.oOk || 0, B.oN), occ: pc(B.oOcc || 0, B.oN - (B.oSelf || 0)), self: B.oSelf || 0,
    ids: Object.fromEntries(Object.entries(B.ids || {}).map(([k, I]) => [k, { n: I.n, w: pc(I.w, I.n), h: pc(I.h, I.n), ok: pc(I.ok, I.n), occ: pc(I.occ, I.n - I.self), self: I.self, hw: pc(I.hw || 0, I.hwN || 0), hw35: pc(I.hw35 || 0, I.hwN || 0), cov: pc(I.cov || 0, (I.hwN || 0) - I.self), big: pc(I.big || 0, I.hwN || 0) }])) });   // (shares in %; occ of the frames not 'self')
  globalThis.__CAM41 = {
    start() { if (st.on) return; st.on = true; st.timer = setInterval(frame, 50); },   // (the page's simulated loop steps every 50 ms — main.js simulate — and renders only for a shot: sampled on its beat)
    stop() { st.on = false; clearInterval(st.timer); },
    reset() { for (const k of Object.keys(K)) delete K[k]; st.want = null; },
    take() { const w = st.want; st.want = null; return w; },
    now: () => st.last,
    stats() { const o = {}; for (const [k, B] of Object.entries(K)) o[k] = { n: B.n, min: Math.round(B.min * 1000) / 1000, max: Math.round(B.max * 1000) / 1000, mean: B.n ? Math.round((B.sum / B.n) * 1000) / 1000 : null, lo: B.lo, hi: B.hi, out: B.out, tgtOff: B.tgtOff, tgtN: B.tgtN, worst: B.worst, low: B.low, objX: B.objN ? Math.round((B.objSum / B.objN) * 1000) / 1000 : null, objOff: B.objOff || 0, camOff: B.camN ? Math.round((B.camOff / B.camN) * 100) / 100 : null, dHero: B.camN ? Math.round((B.dHero / B.camN) * 100) / 100 : null, ...(B.oN ? { obj: objS(B) } : {}) }; return { top: st.top, frames: st.n, err: st.err || null, figD: st.figD, k: o }; },
  };
})();
