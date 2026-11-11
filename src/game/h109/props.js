/* ── build 109 ── h109/props.js — the things of stage 01 in the world: the mission's stake with its red cloth, the small rocks of
 * each sector, ropes, stakes, wedges, slabs, rollers, the great stone, the inscription stone, the waste pile and its sledge.
 * Built, not boxes (rule 9): rough rocks are jittered icosahedra with flat facets, stakes are tapered with a cut head, the rope sags.
 * One material per kind; the instanced rocks are one draw call. No allocation per frame in update(). */

import { stoneMat, ashOf as ashOf0, ashlarGeo, plainGeo, ashGeoOf, neighbourTint } from '../../look/stone.js';   // ── look A ── ── /look A ──
import { lookClone, lookSet } from '../../look/shader.js';

const WOOD = '#8A6038', WOOD_D = '#6E4A28', ROPE = '#C9B27C', CLOTH = '#B8322A';

function hash(x, y, z) { const v = Math.sin(x * 12.9898 + y * 78.233 + z * 37.719) * 43758.5453; return v - Math.floor(v); }

export function createProps({ THREE, scene, ground, stages }) {
  const root = new THREE.Group(); root.name = 'h109'; scene.add(root);
  const M = {
    // ── look A ── every dressed stone is the stone system's (src/look/stone.js): ash the shared material, ashOf(seed) a tinted clone;
    // lump: the rough lumps and waste ── /look A ──
    ash: stoneMat(THREE),
    lump: null,
    wood: new THREE.MeshStandardMaterial({ color: WOOD, roughness: 0.85, flatShading: true }),
    woodD: new THREE.MeshStandardMaterial({ color: WOOD_D, roughness: 0.85, flatShading: true }),
    rope: new THREE.MeshStandardMaterial({ color: ROPE, roughness: 0.9 }),
    cloth: new THREE.MeshStandardMaterial({ color: CLOTH, roughness: 0.8, side: THREE.DoubleSide }),
    gold: new THREE.MeshBasicMaterial({ color: 0xFFD66E, transparent: true, opacity: 0.9, depthWrite: false }),
    ring: new THREE.MeshBasicMaterial({ color: 0xFFF2C8, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }),
    seam: new THREE.MeshBasicMaterial({ color: 0x3A2A1A, transparent: true, opacity: 0.85, depthWrite: false }),
    water: new THREE.MeshStandardMaterial({ color: '#6FA8D8', roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.85 }),
    beam: new THREE.MeshBasicMaterial({ color: 0xFFF4C0, transparent: true, opacity: 0.28, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }),
  };
  /** a rough rock: an icosahedron, its corners pushed in and out (one geometry for all, the instances vary in scale and turn) */
  function rockGeo(seed = 1, detail = 1) {
    const g = new THREE.IcosahedronGeometry(1, detail);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = 0.78 + hash(x * seed, y * 3.1, z * 1.7) * 0.42;
      p.setXYZ(i, x * k, Math.max(-0.35, y) * k, z * k);
    }
    const o = g.toNonIndexed(); o.computeVertexNormals(); return o;
  }
  const geo = { rock: rockGeo(1.3), chunk: rockGeo(4.1, 0), stake: null, cyl: new THREE.CylinderGeometry(1, 1, 1, 8), box: new THREE.BoxGeometry(1, 1, 1), ash: ashlarGeo(THREE), plain: plainGeo(THREE) };
  M.lump = lookClone(M.ash, '#B9AF9D'); M.lump.userData.look.boss = 0;
  /* ── look A ── a dressed stone's own material and mesh: a row's stones never share their neighbour's tone; about one in five chipped
   * (o.set 1: laid · o.light: the light end of the tones · o.margin amot · o.plain: no boss · o.chip false: never chipped) ── */
  let toneI = -1, nS = 0;
  function ashOf(seed, o = {}) {
    const sd = seed ?? (++nS) * 7.31 + 0.5;
    if (o.light || o.hex) return ashOf0(THREE, sd, o);
    const t = neighbourTint(toneI, sd); toneI = t.i; return ashOf0(THREE, sd, { ...o, hex: t.hex });
  }
  function stoneMesh(L, h, d, o = {}) {
    const sd = o.seed ?? (++nS) * 3.77 + 0.25;
    const g = o.plain ? geo.plain : o.chip === false ? geo.ash : ashGeoOf(THREE, sd);
    const m = new THREE.Mesh(g, ashOf(sd, { ...o, boss: o.plain ? false : o.boss })); m.scale.set(L, h, d); m.castShadow = true; m.receiveShadow = true; root.add(m); return m;
  }
  /** a stone laid (1: the dust at its foot) or lifted again (0) */
  const setLaid = (m, k) => { if (m && m.material) lookSet(m.material, k ? 1 : 0); };
  /* ── /look A ── */
  { const g = new THREE.CylinderGeometry(0.09, 0.05, 1, 6); g.translate(0, 0.5, 0); geo.stake = g; }

  /* ── the marker: a tall stake with a red cloth that moves in the wind (spec 3.1: "יתד גבוהה עם בד אדום") ── */
  const mk = new THREE.Group(); mk.name = 'h109-marker'; mk.visible = false; root.add(mk);
  { const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.16, 6.5, 6), M.wood); pole.position.y = 3.25; mk.add(pole);
    const clothG = new THREE.PlaneGeometry(1.7, 1.0, 6, 2); clothG.translate(0.85, 0, 0); const cloth = new THREE.Mesh(clothG, M.cloth); cloth.position.y = 5.9; mk.add(cloth); mk.userData.cloth = cloth; mk.userData.base = clothG.attributes.position.array.slice();
    const top = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 6), M.woodD); top.position.y = 6.7; mk.add(top); }
  function marker(at) { markers(null); if (!at) { mk.visible = false; return; } mk.visible = true; mk.position.set(at.x, ground(at.x, at.z), at.z); }
  // ── h114 ── (rule 54, free choice: every open work has its stake at once) the first in the list is the marker itself, the others its
  // clones (the cloth's geometry shared: they wave together) ── /h114 ──
  const mkMore = [];
  function markers(list) {
    const L = list || [];
    if (list) { if (L.length) { mk.visible = true; mk.position.set(L[0].x, ground(L[0].x, L[0].z), L[0].z); } else mk.visible = false; }
    for (let i = 1; i < Math.max(L.length, mkMore.length + 1); i++) {
      let c = mkMore[i - 1];
      if (!c && i < L.length) { c = mk.clone(true); c.name = 'h109-marker' + i; root.add(c); mkMore.push(c); }
      if (!c) continue;
      if (i < L.length) { c.visible = true; c.position.set(L[i].x, ground(L[i].x, L[i].z), L[i].z); c.rotation.y = mk.rotation.y + i; } else c.visible = false;
    }
  }

  /* ── the small rocks of the sectors: one instanced mesh, 9 × 5 + the chunks of a split ── */
  // ── h114 ── (ירון 9.11: "האבנים זה לא האבנים של האתר… כל אבן שהדמות מפוצצת צריך לפני כן להכניס אותה לתוך ההר") the small rocks are of
  // the Mount's own rock (the boulders' texture) and stand a third into the hill, as rock that grows out of it ── /h114 ──
  let rockMap = null; try { const bm = stages && stages.boulderMat && stages.boulderMat(); rockMap = bm && bm.map; } catch (e) { rockMap = null; }
  M.rock = new THREE.MeshStandardMaterial({ color: '#D9CDB2', map: rockMap, roughness: 0.93, metalness: 0, flatShading: true });
  const NR = 64, rocks = new THREE.InstancedMesh(geo.rock, M.rock, NR); rocks.name = 'h109-rocks'; rocks.count = 0; rocks.castShadow = true; rocks.receiveShadow = true; rocks.frustumCulled = false; root.add(rocks);
  rocks.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(NR * 3).fill(1), 3);
  const R = [];   // { x, y, z, r, yaw, sy, hp, hp0, crack, jolt, gone, vis, sector, i }
  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(), _p = new THREE.Vector3(), _c = new THREE.Color();
  function rockAdd(x, z, r, o = {}) {
    const k = R.length; if (k >= NR) return null;
    const y = ground(x, z);
    const q = { x, y, z, r, yaw: hash(x, z, 1) * 6.28, sy: o.sy || 0.65 + hash(z, x, 2) * 0.25, hp: o.hp || 2, hp0: o.hp || 2, crack: 0, jolt: 0, gone: 0, vis: true, sector: o.sector ?? -1, i: k, seam: o.seam || null };
    R.push(q); rocks.count = R.length; rockSet(q); return q;
  }
  function rockSet(q) {
    const j = q.jolt > 0 ? Math.sin(q.jolt * 60) * 0.06 * q.jolt : 0;
    const shrink = q.gone > 0 ? Math.max(0.001, 1 - q.gone) : 1;
    _e.set(0, q.yaw, j); _q.setFromEuler(_e); _s.set(q.r * shrink * (1 + q.crack * 0.04), q.r * q.sy * shrink * (1 - q.crack * 0.08), q.r * shrink * 0.92);
    _p.set(q.x, q.y + q.r * q.sy * 0.04 - (q.gone > 0 ? q.gone * q.r * 0.5 : 0), q.z);   // ── h114 ── (a third of it in the hill) ── /h114 ──
    if (!q.vis) _s.set(0.001, 0.001, 0.001);
    _m.compose(_p, _q, _s); rocks.setMatrixAt(q.i, _m);
    const c = 1 - q.crack * 0.22; _c.setRGB(c, c * 0.98, c * 0.95); rocks.setColorAt(q.i, _c);
    rocks.instanceMatrix.needsUpdate = true; rocks.instanceColor.needsUpdate = true;
  }
  function rockHit(q, dmg = 1) { q.hp = Math.max(0, q.hp - dmg); q.crack = 1 - q.hp / q.hp0; q.jolt = 1; if (q.hp <= 0) { q.gone = 0.001; chunksAt(q); } }
  /* the chunks of a split rock: they fall apart and roll a little, then lie as rubble the carriers take */
  const NC = 96, chunks = new THREE.InstancedMesh(geo.chunk, M.lump, NC); chunks.name = 'h109-chunks'; chunks.count = 0; chunks.castShadow = true; chunks.frustumCulled = false; root.add(chunks);
  const C = [];
  function chunksAt(q, n = 4) {
    for (let k = 0; k < n; k++) {
      const a = (k / n) * 6.28 + hash(q.x, k, 3), sp = 1.2 + hash(k, q.z, 4) * 1.6;
      const c = { x: q.x, y: q.y + q.r * 0.4, z: q.z, vx: Math.cos(a) * sp, vz: Math.sin(a) * sp, vy: 2.5 + hash(a, k, 5) * 2, s: q.r * (0.32 + hash(k, a, 6) * 0.18), rx: 0, ry: a, t: 0, rest: false, i: -1, gone: 0 };
      if (C.length < NC) { c.i = C.length; C.push(c); } else { const old = C.shift(); c.i = old.i; C.push(c); }
    }
    chunks.count = Math.min(NC, C.length);
  }
  function chunksStep(dt) {
    let any = false;
    for (const c of C) {
      if (c.gone >= 1) continue;
      if (!c.rest) { c.t += dt; c.vy -= 18 * dt; c.x += c.vx * dt; c.z += c.vz * dt; c.y += c.vy * dt; c.rx += dt * 5; const g = ground(c.x, c.z) + c.s * 0.4; if (c.y < g) { c.y = g; c.vy *= -0.3; c.vx *= 0.55; c.vz *= 0.55; if (Math.abs(c.vy) < 0.6 && c.t > 0.5) c.rest = true; } any = true; }
      if (c.fade) { c.gone = Math.min(1, c.gone + dt * 0.8); any = true; }
      _e.set(c.rx, c.ry, c.rx * 0.5); _q.setFromEuler(_e); const s = c.s * (1 - c.gone); _s.set(s, s * 0.8, s); _p.set(c.x, c.y - c.gone * 0.5, c.z); _m.compose(_p, _q, _s); chunks.setMatrixAt(c.i, _m);
    }
    if (any) chunks.instanceMatrix.needsUpdate = true;
  }
  /** the carriers took the rubble near (x, z) within r: it fades */
  function clearRubble(x, z, r) { for (const c of C) if (!c.fade && Math.hypot(c.x - x, c.z - z) < r) c.fade = true; }

  /* ── a rope: a tube that sags between two points (n segments) ── */
  function rope(n = 24, rad = 0.05) {
    const pts = []; for (let i = 0; i <= n; i++) pts.push(new THREE.Vector3());
    const curve = new THREE.CatmullRomCurve3(pts);
    let mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, n, rad, 4, false), M.rope); mesh.castShadow = false; mesh.frustumCulled = false; root.add(mesh);
    const R0 = { mesh, pts, n, rad,
      /** a → b with a sag (amot at the middle); ground: never under the ground */
      set(a, b, sag = 0) {
        for (let i = 0; i <= n; i++) {
          const u = i / n, x = a.x + (b.x - a.x) * u, z = a.z + (b.z - a.z) * u; let y = a.y + (b.y - a.y) * u - sag * 4 * u * (1 - u);
          const g = ground(x, z) + rad * 1.5; if (y < g) y = g; pts[i].set(x, y, z);
        }
        curve.updateArcLengths();   // ── h111 ── (the arc lengths were cached at the first, all-zero points: the tube collapsed to a point) ── /h111 ──
        const old = mesh.geometry; mesh.geometry = new THREE.TubeGeometry(curve, n, rad, 4, false); old.dispose();
      },
      show(v) { mesh.visible = !!v; },
      dispose() { root.remove(mesh); mesh.geometry.dispose(); },
    };
    return R0;
  }
  /** a stake driven into the ground (h amot over it); a red tie when tie */
  function stake(x, z, h = 1.4, tie = false) {
    const g = new THREE.Group(); const s = new THREE.Mesh(geo.stake, M.wood); s.scale.set(1.6, h, 1.6); g.add(s);
    if (tie) { const t = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.28), M.cloth); t.position.set(0.26, h * 0.85, 0); g.add(t); }
    g.position.set(x, ground(x, z), z); root.add(g); return g;
  }
  /** a flat ring on the ground round (x, z): r, width w, the material's colour */
  function ringAt(x, z, r, w, mat) { const m = new THREE.Mesh(new THREE.RingGeometry(1 - w / 2, 1 + w / 2, 48), mat.clone()); m.rotation.x = -Math.PI / 2; m.position.set(x, ground(x, z) + 0.25, z); m.scale.setScalar(r); m.renderOrder = 997; m.material.depthTest = false; m.frustumCulled = false; root.add(m); return m; }
  function remove(o) { if (!o) return; if (o.parent) o.parent.remove(o); o.traverse && o.traverse((c) => { if (c.geometry && !Object.values(geo).includes(c.geometry) && !c.geometry.userData.lookShared) c.geometry.dispose(); if (c.material && !Object.values(M).includes(c.material) && !c.material.userData.lookBase) c.material.dispose && c.material.dispose(); }); }

  let tt = 0;
  function frame(dt) {
    tt += dt;
    if (mk.visible) {
      const cl = mk.userData.cloth, P = cl.geometry.attributes.position, B = mk.userData.base;
      for (let i = 0; i < P.count; i++) { const x = B[i * 3]; P.setZ(i, Math.sin(tt * 5 + x * 3) * 0.12 * x); }
      P.needsUpdate = true; mk.rotation.y = Math.sin(tt * 0.6) * 0.3;
      for (let i = 0; i < mkMore.length; i++) if (mkMore[i].visible) mkMore[i].rotation.y = Math.sin(tt * 0.6 + i) * 0.3 + i;
    }
    let dirty = false;
    for (const q of R) {
      if (q.jolt > 0) { q.jolt = Math.max(0, q.jolt - dt * 4); dirty = true; rockSet(q); }
      if (q.gone > 0 && q.vis) { q.gone = Math.min(1, q.gone + dt * 5); if (q.gone >= 1) q.vis = false; rockSet(q); dirty = true; }
    }
    chunksStep(dt);
    void dirty;
  }
  return { root, M, geo, ashOf, stoneMesh, setLaid, marker, rockAdd, rockSet, rockHit, rocks: R, chunksAt, clearRubble, rope, stake, ringAt, remove, frame, markers, update: () => {}, mesh: { rocks, chunks, mk } };
}
