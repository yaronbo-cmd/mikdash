// SITE14 (wave 14) — the owner, 30.9 23:27: "הדמות עדיין לפעמים צפה באוויר או שוקעת תשומת לבכם". The probe (BRAIN14-SITE14):
// every stage × its phases × the two dep orders, the kohen's feet against what the player SEES under them, frame by frame.
// - States: the 15 stages × survey, dig, courses (early/mid/late), finish, the moment (done); × the demo's order (STAGES: every
//   stage before it done — gates and nashim before the sorag) and the minimal one (only the stage's own deps: lishka and nikanor
//   before the sorag, the altar and the kiyor before Nikanor and the gates). Driven at the world level (setStage/setWork and his
//   own walkTo to each spot the game sends him to), real frames (dt 1/20 s: the walk's height filter lags at a phone's rate).
// - Feet = his mesh's position. Surface = the highest of 5 down-rays (his feet and ±0.35 amah) from 3 amot over his feet (he
//   floats when it is under his feet; he sinks when the centre ray's surface is over them),
//   against the VISIBLE meshes' up-facing triangles (a CPU grid built once from the scene), a building stage's hits above its
//   reveal height (uY) dropped (its shader cuts them); the Mount's rough rock by its CPU mirror hill.heightAt (its shader moves
//   the vertices). Skipped: him, every instanced mesh (crews, props, scaffolds, machines), points, lines, transparent FX.
// - Bases: each visible stage's footprint corners and edge midpoints — its lowest part at that point against what is under it
//   (a building hanging over the plaza: cause 5).
// - Report: a table per stage and order (max float, max sink, frames over 0.2), the worst five with crops (side views, looked at).
// DECLARED HOOKS: __START_PAUSED, __NO_OPENING, __NO_GAME (the world alone), __T.stages (+ _dbg.hero/hill/ST), __T.step,
// __T.render, __T.look. No taps: the floating is the world's, whatever the game asks.
// Usage: node test/hero-ground.cjs [dist/test.html] [--stages=har,wall,…] [--orders=demo,min] [--crops=5] [--out=test/out/hero-ground]
// Pass: no frame over 0.2 amah in any stage (and no floating base) → exit 0.
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs');
const A = Object.fromEntries(process.argv.slice(2).filter((a) => a.startsWith('--')).map((a) => { const m = a.match(/^--([^=]+)(?:=(.*))?$/); return [m[1], m[2] === undefined ? true : m[2]]; }));
const file = path.resolve(process.argv.slice(2).find((a) => !a.startsWith('--')) || 'dist/test.html');
const OUT = path.resolve(A.out || 'test/out/hero-ground'); fs.mkdirSync(OUT, { recursive: true });
const ALL = ['har', 'wall', 'gates', 'nashim', 'sorag', 'nikanor', 'lishka', 'yesod', 'sovev', 'guf', 'karnot', 'kiyor', 'ulam', 'heichal', 'kodesh'];
const IDS = A.stages ? String(A.stages).split(',') : ALL;
const ORDERS = String(A.orders || 'demo,min').split(',');
const CROPS = A.crops === undefined ? 5 : +A.crops, TOL = 0.2;
// STAGES' deps (src/game/content.js)
const DEPS = { har: [], wall: ['har'], gates: ['wall'], nashim: ['wall'], sorag: ['gates'], nikanor: ['nashim'], lishka: ['gates'], yesod: ['wall'], sovev: ['yesod'],
  guf: ['sovev'], karnot: ['guf'], kiyor: ['guf'], ulam: ['sorag', 'lishka', 'nikanor', 'karnot', 'kiyor'], heichal: ['ulam'], kodesh: ['heichal'] };
const closure = (id, s = new Set()) => { for (const d of DEPS[id]) { if (!s.has(d)) { s.add(d); closure(d, s); } } return s; };
const doneFor = (id, order) => (order === 'demo' ? ALL.slice(0, ALL.indexOf(id)) : ALL.filter((x) => closure(id).has(x)));
const W = 390, H = 844;

// ───────── in the page ─────────
function pageInit() {
  const S = __T.stages, D = S._dbg, hero = D.hero, hill = D.hill, ST = D.ST, scene = __T.scene;
  const P = window.__HG = { tris: null };
  // the grid: every visible-able, opaque, non-instanced mesh's up-facing triangles in the Mount's box, by 2-amah cells
  const GX0 = -360, GZ0 = -620, GX1 = 340, GZ1 = 470, CS = 2, NX = Math.ceil((GX1 - GX0) / CS), NZ = Math.ceil((GZ1 - GZ0) / CS);
  const meshes = [];
  let T9 = new Float32Array(9 << 16), TM = new Int32Array(1 << 16), NT = 0;
  const push = (a, b, c, mi) => {
    if (NT >= TM.length) { const t2 = new Float32Array(T9.length * 2); t2.set(T9); T9 = t2; const m2 = new Int32Array(TM.length * 2); m2.set(TM); TM = m2; }
    const o = NT * 9; T9[o] = a.x; T9[o + 1] = a.y; T9[o + 2] = a.z; T9[o + 3] = b.x; T9[o + 4] = b.y; T9[o + 5] = b.z; T9[o + 6] = c.x; T9[o + 7] = c.y; T9[o + 8] = c.z; TM[NT++] = mi;
  };
  scene.updateMatrixWorld(true);
  const stageOf = (o) => { for (let p = o; p; p = p.parent) { if (p.name && p.name.startsWith('stage-') && p.name !== 'stage-fx') return p.name.slice(6); if (p.name === 'stage-fx') return '#fx'; } return null; };
  const skip = (o) => { for (let p = o; p; p = p.parent) { const n = p.name || ''; if (n.startsWith('hero') || n.startsWith('crews') || n === 'stage-fx' || n === 'hill') return true; } return false; };
  const v = new __T.Vector3();
  scene.traverse((o) => {
    if (!o.isMesh || o.isInstancedMesh || o.isSkinnedMesh || !o.geometry || !o.geometry.attributes.position) return;
    const mats = Array.isArray(o.material) ? o.material : [o.material];
    if (mats.every((m) => m && m.transparent && m.opacity < 0.99)) return;
    if (skip(o)) return;
    const g = o.geometry; if (!g.boundingBox) g.computeBoundingBox();
    const bb = g.boundingBox.clone().applyMatrix4(o.matrixWorld);
    if (bb.max.x < GX0 || bb.min.x > GX1 || bb.max.z < GZ0 || bb.min.z > GZ1 || bb.min.y > 120) return;
    let lc = false; for (let q = o; q; q = q.parent) if (q.name === 'nashim-chambers') lc = true;
    const ter = g.attributes.position.count === 261 * 261;
    const mi = meshes.length; meshes.push({ o, st: stageOf(o), lc, ter, name: ter ? 'terrain' : o.name || o.parent && o.parent.name || '' });
    const pos = g.attributes.position, idx = g.index, n = idx ? idx.count : pos.count, M = o.matrixWorld;
    const get = (i, out) => out.set(pos.getX(i), pos.getY(i), pos.getZ(i)).applyMatrix4(M);
    const a = new __T.Vector3(), b = new __T.Vector3(), c = new __T.Vector3();
    for (let k = 0; k + 2 < n; k += 3) {
      get(idx ? idx.getX(k) : k, a); get(idx ? idx.getX(k + 1) : k + 1, b); get(idx ? idx.getX(k + 2) : k + 2, c);
      const ux = b.x - a.x, uy = b.y - a.y, uz = b.z - a.z, wx = c.x - a.x, wy = c.y - a.y, wz = c.z - a.z;
      const nx = uy * wz - uz * wy, ny = uz * wx - ux * wz, nz = ux * wy - uy * wx, L = Math.hypot(nx, ny, nz);
      if (L < 1e-9 || Math.abs(ny) < 0.25 * L) continue;   // up- or down-facing (slopes to ≈ 75°); the sign says which
      const down = ny < 0;
      const x0 = Math.min(a.x, b.x, c.x), x1 = Math.max(a.x, b.x, c.x), z0 = Math.min(a.z, b.z, c.z), z1 = Math.max(a.z, b.z, c.z);
      if (x1 < GX0 || x0 > GX1 || z1 < GZ0 || z0 > GZ1) continue;
      if (meshes[mi].ter && x0 > -300 && x1 < 277 && z0 > -480 && z1 < 400) continue;   // (the terrain's floor under the Mount: the hill covers it)
      push(a, b, c, down ? -1 - mi : mi);
    }
  });
  // CSR cells
  const cnt = new Int32Array(NX * NZ + 1);
  const cellsOf = (t, fn) => {
    const o = t * 9, x0 = Math.min(T9[o], T9[o + 3], T9[o + 6]), x1 = Math.max(T9[o], T9[o + 3], T9[o + 6]), z0 = Math.min(T9[o + 2], T9[o + 5], T9[o + 8]), z1 = Math.max(T9[o + 2], T9[o + 5], T9[o + 8]);
    const i0 = Math.max(0, Math.floor((x0 - GX0) / CS)), i1 = Math.min(NX - 1, Math.floor((x1 - GX0) / CS)), j0 = Math.max(0, Math.floor((z0 - GZ0) / CS)), j1 = Math.min(NZ - 1, Math.floor((z1 - GZ0) / CS));
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) fn(j * NX + i);
  };
  for (let t = 0; t < NT; t++) cellsOf(t, (c) => { cnt[c + 1]++; });
  for (let c = 0; c < NX * NZ; c++) cnt[c + 1] += cnt[c];
  const fill = cnt.slice(0, NX * NZ), cell = new Int32Array(cnt[NX * NZ]);
  for (let t = 0; t < NT; t++) cellsOf(t, (c) => { cell[fill[c]++] = t; });
  // a mesh's visibility this frame (its chain), and a stage's reveal height
  let visAt = -1; const vis = new Int8Array(meshes.length);
  const visible = (mi) => { if (vis[mi] === 0) { let on = true; for (let p = meshes[mi].o; p; p = p.parent) if (!p.visible) { on = false; break; } vis[mi] = on ? 1 : 2; } return vis[mi] === 1; };
  // batch.js's reveal, mirrored from its GLSL (bcFrontOf, bcThOf and the four branches) on the stage's own uniforms
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  function frontU(U, x, z) {
    const C = U.uC.value, nR = Math.round(C.w); let best = 0, bs = 1e9;
    for (let i = 0; i < nR; i++) { const R = U.uRect.value[i], cx = cl(x, R.x, R.z), cz = cl(z, R.y, R.w), dO = Math.hypot(x - cx, z - cz), dI = Math.min(x - R.x, R.z - x, z - R.y, R.w - z), sc = dO > 0 ? dO + 1000 : -1 / (1 + dI); if (sc < bs) { bs = sc; best = i; } }
    const R = U.uRect.value[best], K = U.uRK.value[best], cx = cl(x, R.x, R.z), cz = cl(z, R.y, R.w);
    const W = R.z - R.x, Dd = R.w - R.y, eN = cz - R.y, eS = R.w - cz, eW = cx - R.x, eE = R.z - cx, m = Math.min(eN, eS, eW, eE);
    const s = m === eN ? cx - R.x : m === eE ? W + cz - R.y : m === eS ? W + Dd + R.z - cx : 2 * W + Dd + R.w - cz;
    const uu = (s - K.z) / K.y, u = (uu - Math.floor(uu)) * K.x, f = Math.min(Math.floor(u), K.x - 1);
    return { f: K.w + f, p: u - f };
  }
  const thU = (U, fi) => { const t = U.uTh.value[fi >> 2]; return t ? [t.x, t.y, t.z, t.w][fi & 3] : 0; };
  const Uof = (m) => { const st = ST[m.st]; return m.lc && st.lc ? st.lc.U : st.U; };
  // is a face at height y (a top: up) of mesh m shown at (x, z)?
  function shownAt(m, x, z, y, up) {
    const st = ST[m.st]; if (!st) return true;
    if (st.status === 'done') return true;
    if (st.status !== 'building') return false;
    const U = Uof(m), C = U.uC.value;
    if (C.w < -0.5) { let cut = U.uY.value; for (let i = 0; i < Math.round(-C.w); i++) { const R = U.uRect.value[i]; if (x > R.x - 0.7 && x < R.z + 0.7 && z > R.y - 0.7 && z < R.w + 0.7) { cut = U.uRK.value[i].x; break; } } return y <= cut + 0.01; }
    if (C.w < 0.5) return y <= U.uY.value + 0.01;
    const by = y - (up ? 0.03 : 0), cI = Math.floor((by - C.x) / C.y);
    if (cI < C.z - 0.5) return true;
    if (cI < C.z + 0.5) { const f = frontU(U, x, z); return f.p < thU(U, f.f); }
    return false;
  }
  // the cap the reveal draws over a solid cut at (x, z): the top of the laid stones there, else the top of the course below
  function capAt(m, x, z) {
    const st = ST[m.st]; if (!st || st.status !== 'building') return null;
    const U = Uof(m), C = U.uC.value;
    if (C.w < -0.5) { for (let i = 0; i < Math.round(-C.w); i++) { const R = U.uRect.value[i]; if (x > R.x - 0.7 && x < R.z + 0.7 && z > R.y - 0.7 && z < R.w + 0.7) return U.uRK.value[i].x; } return U.uY.value; }
    if (C.w < 0.5) return U.uY.value;
    const f = frontU(U, x, z); return C.x + (C.z + (f.p < thU(U, f.f) ? 1 : 0)) * C.y;
  }
  // all the surfaces under (x, z): [{ y, what }] — the shown tops (or bottoms: wantDown), and the reveal's caps
  function hitsAt(x, z, out, wantDown) {
    out.length = 0;
    const per = new Map();
    const i = Math.floor((x - GX0) / CS), j = Math.floor((z - GZ0) / CS);
    if (i >= 0 && i < NX && j >= 0 && j < NZ) {
      const c = j * NX + i;
      for (let k = cnt[c]; k < cnt[c + 1]; k++) {
        const t = cell[k], o = t * 9, mr = TM[t], dn = mr < 0, mi = dn ? -1 - mr : mr;
        const ax = T9[o], az = T9[o + 2], bx = T9[o + 3], bz = T9[o + 5], cx = T9[o + 6], cz = T9[o + 8];
        const d = (bz - cz) * (ax - cx) + (cx - bx) * (az - cz); if (Math.abs(d) < 1e-12) continue;
        const l1 = ((bz - cz) * (x - cx) + (cx - bx) * (z - cz)) / d, l2 = ((cz - az) * (x - cx) + (ax - cx) * (z - cz)) / d, l3 = 1 - l1 - l2;
        if (l1 < -1e-6 || l2 < -1e-6 || l3 < -1e-6) continue;
        if (!visible(mi)) continue;
        const m = meshes[mi];
        let y;
        if (m.ter) {
          const HU = hill.U, Pp = HU.uPit.value, k = HU.uPitK.value;
          const lw = (vx, vy, vz) => (k > 0 && Pp.z > Pp.x && Math.max(Pp.x - 8 - vx, vx - Pp.z - 8, Pp.y - 8 - vz, vz - Pp.w - 8) < 0 ? vy + (Math.min(vy, HU.uFill.value - 0.3) - vy) * k : vy);
          y = l1 * lw(ax, T9[o + 1], az) + l2 * lw(bx, T9[o + 4], bz) + l3 * lw(cx, T9[o + 7], cz);
        } else y = l1 * T9[o + 1] + l2 * T9[o + 4] + l3 * T9[o + 7];
        const what = (m.st || 'static') + (m.name ? ':' + m.name : '');
        if (!m.st || m.st === '#fx') { if (dn === !!wantDown) out.push({ y, what }); continue; }
        let P = per.get(mi); if (!P) { P = { m, u: [], d: [], what }; per.set(mi, P); }
        (dn ? P.d : P.u).push(y);
      }
    }
    for (const P of per.values()) {
      const { m } = P;
      for (const y of wantDown ? P.d : P.u) if (shownAt(m, x, z, y, !wantDown)) out.push({ y, what: P.what });
      if (wantDown) continue;
      const cap = capAt(m, x, z);
      if (cap !== null && P.u.some((y) => y > cap + 0.02) && P.d.some((y) => y < cap - 0.02)) out.push({ y: cap, what: P.what + ':cap' });
    }
    if (hill.mesh.visible && !wantDown && x > -300 && x < 277 && z > -480 && z < 400) out.push({ y: hill.heightAt(x, z), what: 'hill' });
    return out;
  }
  const HB = [];
  // the surface under him: the highest of 5 down-rays from 3 over his feet
  const RAYS = [[0, 0], [0.35, 0], [-0.35, 0], [0, 0.35], [0, -0.35]];
  // he floats when no foot is on anything (the highest of the 5 rays is under his feet); he sinks when the middle of his feet is
  // inside a floor (the centre ray over them) — a toe at a ledge while he walks past a wall is not sinking
  // (also: the middle of his feet inside a solid at any depth — the first face above them is a top, not a bottom: a floor up to
  //  8 amot over them is a sink, deeper is a wall he walks through, reported apart as `thru`)
  function surface(x, z, feet) {
    vis.fill(0);
    let best = -1e9, what = 'nothing', mid = -1e9, mwhat = 'nothing', ins = 0, Uw = '', Ud = 0;
    for (const [dx, dz] of RAYS) {
      let U = 1e9, uw = '', Dn = 1e9;
      for (const h of hitsAt(x + dx, z + dz, HB)) {
        if (h.y > feet + 0.2 && h.y < U && !/sky/.test(h.what)) { U = h.y; uw = h.what; }
        if (h.y > feet + 3) continue;
        if (h.y > best) { best = h.y; what = h.what; }
        if (!dx && !dz && h.y > mid) { mid = h.y; mwhat = h.what; }
      }
      for (const h of hitsAt(x + dx, z + dz, [], true)) if (h.y > feet + 0.2 && h.y < Dn && !/sky/.test(h.what)) Dn = h.y;
      if (U < Dn && U - feet > 3 && U < 1e8) { ins++; if (!dx && !dz) { Uw = uw; Ud = U - feet; } }
    }
    if (ins === 5) return { y: feet, what: 'thru:' + Uw, thru: Ud };   // (inside a solid under all five: a wall he walks through)
    if (mid > feet + 0.2) return { y: mid, what: mwhat };   // sinks
    if (best < feet - 0.2) return { y: best, what };         // floats
    return { y: Math.max(Math.min(mid, feet), Math.min(best, feet)), what: mwhat };   // on the ground (a toe on a ledge counts as on it)
  }
  P.surface = surface; P.hitsAt = (x, z) => { vis.fill(0); return hitsAt(x, z, []).map((h) => ({ y: +h.y.toFixed(2), what: h.what })); };
  P.info = { tris: NT, meshes: meshes.length, cells: NX * NZ, refs: cell.length };
  // ── the bases: a visible stage's lowest part at its footprint's corners/edges against what is under it
  P.bases = () => {
    vis.fill(0);
    const out = [];
    for (const id in ST) {
      const st = ST[id]; if (id === 'har' || !st.group.visible) continue;
      for (const f of st.def.foot) {
        const [x0, z0, x1, z1] = f, e = 0.6;
        for (const [x, z] of [[x0 + e, z0 + e], [x1 - e, z0 + e], [x1 - e, z1 - e], [x0 + e, z1 - e]]) {
          const hs = hitsAt(x, z, []), isOwn = (h) => h.what.startsWith(id + ':') || h.what === id;
          let own = hitsAt(x, z, [], true).filter(isOwn).map((h) => h.y);
          if (!own.length) own = hs.filter(isOwn).map((h) => h.y);
          if (!own.length) continue;
          if (Math.min(...own) > (st.base || 0) + 0.6) continue;   // (a gallery or a lintel up on the walls is not a base)
          const lo = Math.min(...own), under = hs.filter((h) => !(h.what.startsWith(id + ':') || h.what === id) && h.y <= lo + 0.3);
          const sup = under.length ? Math.max(...under.map((h) => h.y)) : -1e9;
          if (lo - sup > TOLB) out.push({ id, x: +x.toFixed(1), z: +z.toFixed(1), bottom: +lo.toFixed(2), under: +sup.toFixed(2), gap: +(lo - sup).toFixed(2), by: under.length ? under.find((h) => h.y === sup).what : 'nothing' });
        }
      }
    }
    return out;
  };
  const TOLB = 0.3;
  return P.info;
}

// one state's run: set the stages, then his walks to the spots of each phase, sampled every frame
function pageRun(arg) {
  const { id, done, dt, phases } = arg;
  const S = __T.stages, D = S._dbg, hero = D.hero, P = window.__HG;
  const rows = [];
  S.setAll('locked');
  for (const d of done) S.setStage(d, 'done', undefined, { instant: true });
  if (id === 'har') S.setBoulders(new Array(12).fill(2));
  else S.setBoulders([]);
  S.setStage(id, 'building', 0, { instant: true });
  __T.step(0.3, dt);
  const info = S.siteInfo(id) || { stones: 0 };
  const frame = () => { __T.step(dt, dt); };
  const samp = (tag) => {
    if (!hero.vis || Math.min(hero.fade, hero.edgeF === undefined ? 1 : hero.edgeF) < 0.6) return;
    const x = hero.x, z = hero.z, y = hero.y, s = P.surface(x, z, y);
    const d = y - s.y;   // + floats, − sinks
    rows.push([tag, +x.toFixed(2), +z.toFixed(2), +y.toFixed(3), +s.y.toFixed(3), +d.toFixed(3), s.what, +(hero.yaw || 0).toFixed(3), hero.path ? 1 : 0, +S.groundAt(x, z).toFixed(3), s.thru ? +s.thru.toFixed(1) : 0]);
  };
  const walk = (target, tag, max = 25) => {
    const sp = target; if (!sp) return;
    let fin = false; const p = S.hero.walkTo(sp); p.then(() => { fin = true; });
    // (the promise settles on a microtask: step frames and check the path instead)
    for (let t = 0; t < max; t += dt) { frame(); samp(tag); if (!hero.path && !hero.door && Math.abs(hero.y - S.groundAt(hero.x, hero.z)) < 0.01 && t > 0.3) break; }
    for (let t = 0; t < 0.6; t += dt) { frame(); samp(tag + '·idle'); }
  };
  const spot = (k) => { const s = S.workSpot(id, k); return s && typeof s.x === 'number' ? s : null; };
  const settle = (sec) => { for (let t = 0; t < sec; t += dt) frame(); };
  // start: at the region's entrance (the outer hub, or the Azara's for the House), as from the last site
  const start = { har: [140, -60], wall: [192, 0] }[id] || [192, 0];
  S.hero.place({ x: start[0], z: start[1], faceX: 0, faceZ: 0 });
  settle(0.2);
  for (const ph of phases) {
    if (ph === 'survey') { S.setWork(id, { phase: 'survey' }); settle(1); if (id === 'har') { walk({ boulder: 2 }, 'survey:b2'); walk({ boulder: 5 }, 'survey:b5'); walk('har', 'survey:har'); } else walk(spot('survey'), 'survey'); }
    else if (ph === 'dig') { S.setWork(id, { phase: 'dig' }); settle(2); if (id === 'har') { walk({ boulder: 8 }, 'dig:b8'); walk('har', 'dig:har'); } else walk(spot('set'), 'dig'); }
    else if (ph.startsWith('courses')) {
      const f = { 'courses-e': 0.12, 'courses-m': 0.5, 'courses-l': 0.9 }[ph];
      S.setWork(id, { phase: 'courses', stones: Math.round((info.stones || 0) * f), stock: 6 }); settle(3);
      walk(spot('dress'), ph + ':dress'); walk(spot('set'), ph + ':set');
      if (ph === 'courses-e') { walk(spot('stock'), ph + ':stock'); walk(spot('dress'), ph + ':dress2'); }
    } else if (ph === 'finish') { S.setWork(id, { phase: 'finish', finish: 0.6 }); settle(3); walk(spot('set'), 'finish:set'); walk(spot('dress'), 'finish:dress'); }
    else if (ph === 'done') { S.setStage(id, 'done', undefined, { instant: true }); settle(1.5); walk(spot('moment'), 'moment'); walk(id, 'moment:spot'); }
  }
  return { rows, info: { stones: info.stones } };
}

(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const pg = await b.newPage({ viewport: { width: W, height: H }, hasTouch: true, isMobile: true, deviceScaleFactor: 1, locale: 'he-IL' });
  await pg.addInitScript(() => { window.__FORCE_Q = 'normal'; window.__FORCE_TIME = 'noon'; window.__START_PAUSED = true; window.__NO_OPENING = true; window.__NO_GAME = true; });
  const errs = []; pg.on('pageerror', (e) => errs.push(e.message));
  const t0 = Date.now(), log = (...a) => console.log(`[${((Date.now() - t0) / 1000).toFixed(0)}s]`, ...a);
  await pg.goto('file://' + file);
  await pg.waitForFunction(() => window.__T && window.__T.booted && window.__T.stages, null, { timeout: 400000 });
  await pg.evaluate(() => { __T.pause(true); __T.simulate(false); __T.buildMode(); });
  const info = await pg.evaluate(`(${pageInit.toString()})()`);
  log('grid', JSON.stringify(info));
  const PH = ['survey', 'dig', 'courses-e', 'courses-m', 'courses-l', 'finish', 'done'];
  const table = [], worst = [], bases = [];
  for (const id of IDS) for (const order of ORDERS) {
    const done = doneFor(id, order);
    if (order === 'min' && done.join() === doneFor(id, 'demo').join()) continue;   // the same state
    const phases = id === 'kiyor' ? PH.filter((p) => p !== 'courses-m') : PH;
    const r = await pg.evaluate(`(${pageRun.toString()})(${JSON.stringify({ id, done, dt: 1 / 20, phases })})`);
    const rows = r.rows;
    const by = {};
    for (const q of rows) { const ph = q[0].split(':')[0].split('·')[0]; (by[ph] = by[ph] || []).push(q); }
    for (const [ph, qs] of Object.entries(by)) {
      let fl = 0, sk = 0, over = 0, w = null, thru = 0, tw = null;
      for (const q of qs) { const d = q[5]; if (q[10]) { thru++; if (!tw) tw = q; } if (d > fl) fl = d; if (-d > sk) sk = -d; if (Math.abs(d) > TOL) over++; if (!w || Math.abs(d) > Math.abs(w[5])) w = q; }
      table.push({ id, order, ph, n: qs.length, float: +fl.toFixed(2), sink: +sk.toFixed(2), over, worst: w, thru, tw });
      if (w && Math.abs(w[5]) > TOL) worst.push({ id, order, ph, done, row: w });
    }
    // the bases at the late courses and done (the building as it stands)
    const bs = await pg.evaluate(() => window.__HG.bases());
    for (const x of bs) bases.push({ at: id, order, ...x });
    const mf = Math.max(0, ...table.filter((t) => t.id === id && t.order === order).map((t) => t.float)), ms = Math.max(0, ...table.filter((t) => t.id === id && t.order === order).map((t) => t.sink));
    log(`${id.padEnd(8)} ${order.padEnd(4)} samples ${rows.length}  max float ${mf.toFixed(2)}  max sink ${ms.toFixed(2)}  bases ${bs.length ? bs.length + ' (' + [...new Set(bs.map((x) => x.id))].join(',') + ')' : 0}`);
  }
  // the table per stage (both orders)
  const per = {};
  for (const t of table) { const p = per[t.id] = per[t.id] || { id: t.id, float: 0, sink: 0, over: 0, n: 0, worstPh: '' }; p.n += t.n; p.over += t.over; if (t.float > p.float) p.float = t.float; if (t.sink > p.sink) p.sink = t.sink; if (Math.max(t.float, t.sink) >= Math.max(p.float, p.sink)) p.worstPh = t.order + '/' + t.ph; }
  console.log('\nstage    | max float | max sink | frames > 0.2 / all | worst at');
  let pass = 0;
  for (const id of IDS) { const p = per[id]; if (!p) continue; const ok = p.float <= TOL && p.sink <= TOL; if (ok) pass++; console.log(`${id.padEnd(8)} | ${p.float.toFixed(2).padStart(9)} | ${p.sink.toFixed(2).padStart(8)} | ${String(p.over).padStart(6)} / ${String(p.n).padEnd(9)} | ${p.worstPh} ${ok ? '✓' : '✗'}`); }
  console.log(`\n${pass}/${IDS.length} stages ≤ ${TOL} amah`);
  { const th = {}; for (const t of table) { const id = t.id; th[id] = th[id] || 0; } }
  const thru = {}; for (const t of table) if (t.thru) thru[t.id] = (thru[t.id] || 0) + t.thru;
  console.log('walks through masonry (frames, apart from float/sink):', Object.keys(thru).length ? JSON.stringify(thru) : 'none');
  for (const t of table) if (t.tw) console.log(`  thru ${t.id} ${t.order}/${t.ph}: ${t.thru} frames, e.g. ${t.tw[0]} (${t.tw[1]}, ${t.tw[2]}) feet ${t.tw[3]} in [${t.tw[6]}] ${t.tw[10]} under its top`);
  for (const id of IDS) { const ws = table.filter((t) => t.id === id && t.worst && Math.abs(t.worst[5]) > TOL).sort((a, b) => Math.abs(b.worst[5]) - Math.abs(a.worst[5])).slice(0, 4); for (const t of ws) { const q = t.worst; console.log(`  ${id} ${t.order}/${t.ph} ${q[0]}: (${q[1]}, ${q[2]}) feet ${q[3]} groundAt ${q[9]} surface ${q[4]} [${q[6]}] d ${q[5]} ${q[8] ? 'walking' : 'standing'}`); } }
  const bsum = {}; for (const x of bases) { const k = x.id; bsum[k] = Math.max(bsum[k] || 0, x.gap); }
  const bseen = new Set(); for (const x of bases.sort((a, b) => b.gap - a.gap)) { const k = x.at + x.order + x.id; if (bseen.has(k)) continue; bseen.add(k); console.log(`  base: at ${x.at}/${x.order} ${x.id} (${x.x}, ${x.z}) bottom ${x.bottom} over ${x.under} [${x.by}] gap ${x.gap}`); }
  console.log('floating bases (gap, amot):', Object.keys(bsum).length ? JSON.stringify(bsum) : 'none');
  // the worst five, distinct (stage, phase), cropped
  worst.sort((a, b) => Math.abs(b.row[5]) - Math.abs(a.row[5]));
  const seen = new Set(), pick = [];
  for (const w of worst) { const k = w.id + w.ph; if (seen.has(k)) continue; seen.add(k); pick.push(w); if (pick.length >= CROPS) break; }
  for (let i = 0; i < pick.length; i++) {
    const w = pick[i], [tag, x, z, y, sy, d, what, yaw] = w.row;
    console.log(`#${i + 1} ${w.id} ${w.order} ${tag}: feet ${y} groundAt ${w.row[9]} surface ${sy} (${what}) → ${d > 0 ? 'floats' : 'sinks'} ${Math.abs(d).toFixed(2)} at (${x}, ${z})`);
    const scr = await pg.evaluate((a) => {
      const S = __T.stages, D = S._dbg, hero = D.hero;
      S.setAll('locked'); for (const dd of a.done) S.setStage(dd, 'done', undefined, { instant: true });
      S.setBoulders(a.id === 'har' ? new Array(12).fill(2) : []);
      S.setStage(a.id, 'building', 0, { instant: true });
      const ph = a.ph;
      if (ph === 'survey' || ph === 'dig') S.setWork(a.id, { phase: ph });
      else if (ph.startsWith('courses')) S.setWork(a.id, { phase: 'courses', stones: Math.round((S.siteInfo(a.id).stones || 0) * { 'courses-e': 0.12, 'courses-m': 0.5, 'courses-l': 0.9 }[ph]), stock: 6 });
      else if (ph === 'finish') S.setWork(a.id, { phase: 'finish', finish: 0.6 });
      else if (ph === 'done' || ph === 'moment') S.setStage(a.id, 'done', undefined, { instant: true });
      __T.step(3, 1 / 20);
      S.hero.place({ x: a.x, z: a.z, faceX: a.x + Math.sin(a.yaw), faceZ: a.z + Math.cos(a.yaw) });
      hero.y = a.y; hero.yaw = a.yaw; hero.face = null;
      const up = S.update; S.update = () => up(0);
      for (const e of document.body.children) if (e.tagName !== 'CANVAS' && !e.querySelector('canvas')) e.style.visibility = 'hidden';
      // (a clear line to him: the first of 8 directions, 30° up, 15 amot out, whose line no shown surface rises over)
      const T = [a.x, a.y + 1.6, a.z], HG = window.__HG;
      let P = null;
      for (const el of [0.5, 0.9]) { for (let k = 0; k < 8 && !P; k++) {
        const az = a.yaw + 1.2 + k * Math.PI / 4, D2 = 15, p = [a.x + Math.sin(az) * Math.cos(el) * D2, T[1] + Math.sin(el) * D2, a.z + Math.cos(az) * Math.cos(el) * D2];
        let ok = true;
        for (let i = 2; i < 20 && ok; i++) { const u = i / 20, x = T[0] + (p[0] - T[0]) * u, y = T[1] + (p[1] - T[1]) * u, z = T[2] + (p[2] - T[2]) * u; if (Math.hypot(x - a.x, z - a.z) < 1.2) continue; if (HG.hitsAt(x, z).some((h) => h.y > y + 0.2)) ok = false; }
        if (ok) P = p;
      } if (P) break; }
      __T.look(P || [a.x + 6, a.y + 14, a.z + 6], T);
      __T.render(); __T.render();
      S.update = up;
      const v = new __T.Vector3(a.x, a.y + 1.2, a.z).project(__T.camera);
      return { sx: (v.x + 1) / 2 * innerWidth, sy: (1 - v.y) / 2 * innerHeight };
    }, { id: w.id, done: w.done, ph: w.ph, x, z, y, yaw });
    const cw = 300, ch = 300, cx = Math.max(0, Math.min(W - cw, scr.sx - cw / 2)), cy = Math.max(0, Math.min(H - ch, scr.sy - ch / 2));
    const f = path.join(OUT, `worst-${i + 1}-${w.id}-${w.ph}.png`);
    await pg.screenshot({ path: f, clip: { x: cx, y: cy, width: cw, height: ch }, timeout: 240000 });
    console.log('   crop', path.relative(process.cwd(), f));
  }
  fs.writeFileSync(path.join(OUT, 'result.json'), JSON.stringify({ table, per, bases, worst: pick, info }, null, 1));
  console.log(errs.length ? 'PAGE ERRORS: ' + errs.slice(0, 3).join(' | ') : 'no page errors');
  const allOk = pass === IDS.filter((id) => per[id]).length && !bases.length && !errs.length;
  console.log(allOk ? 'ALL PASS' : 'FAIL');
  await b.close(); process.exit(allOk ? 0 : 1);
})().catch((e) => { console.error(e); process.exit(2); });
