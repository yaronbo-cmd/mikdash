// Terrain of Jerusalem around the Mount, the city, trees, sky.
import * as THREE from 'three';
import { rng, makeNoise, smooth, lerp } from './util.js';
import { PLAT } from './mount.js';
import { groundMat, smoothGridNormals } from './look/ground.js';   // ── look B ── ── /look B ──
import { windMat } from './look/air.js';   // ── look C ── ── /look C ──
import { oliveCrownGeo, oliveTrunkGeo, cypressGeo, jitter } from './look/far.js';   // ── look D ── ── /look D ──

const NA = makeNoise(11), NB = makeNoise(29), NC = makeNoise(47), ND = makeNoise(83);
function prof(xs, ys, x) {
  if (x <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) if (x <= xs[i]) { const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]), s = t * t * (3 - 2 * t); return ys[i - 1] + (ys[i] - ys[i - 1]) * s; }
  return ys[ys.length - 1];
}
// east–west sections: beside the Mount · to the north · to the south (Upper City – Tyropoeon – City of David – Kidron – Mount of Olives)
const MX = [-4000, -1300, -800, -470, -440, -395, -345, -300, 277, 300, 345, 420, 560, 900, 1250, 1700, 4000];
const MY = [62, 62, 46, 0, -30, -50, -52, -48, -56, -58, -86, -112, -80, 60, 150, 110, 60];
const NX = [-4000, -1200, -600, -360, -300, 277, 330, 450, 760, 1250, 1700, 4000];
const NY = [70, 60, 34, 8, 2, -4, -12, -28, 70, 150, 110, 60];
const SX = [-4000, -1200, -700, -470, -330, -200, 0, 200, 330, 420, 600, 900, 1250, 1700, 4000];
const SY = [50, 50, 30, -10, -80, -60, -50, -62, -110, -135, -90, 50, 140, 100, 60];

export function terrainH(x, z) {
  let h = prof(MX, MY, x);
  h = lerp(h, prof(NX, NY, x), smooth(-420, -1000, z));
  h = lerp(h, prof(SX, SY, x), smooth(420, 950, z));
  const wc = smooth(-335, -300, x) * (1 - smooth(277, 300, x));
  let hc, wz = 1;
  if (z < -480) hc = lerp(-34, -2, smooth(-480, -760, z));
  else if (z > 400) { hc = -52; wz = 1 - smooth(410, 700, z); }
  else hc = -50;
  h = lerp(h, hc, wc * wz);
  if (z > 950) h -= (z - 950) * 0.04;
  const dPlat = Math.max(PLAT.X0 - x, x - PLAT.X1, PLAT.Z0 - z, z - PLAT.Z1, 0);
  h += ((NA(x / 260, z / 260, 4) - 0.5) * 26 + (NB(x / 60, z / 60, 3) - 0.5) * 5) * smooth(25, 280, dPlat);
  // ── world6 ── the ground under city.js's pools: a pit under the pool, the rim level round it, blending out (never raises)
  for (const C of CARVE) {
    const sd = Math.max(Math.abs(x - C.x) - C.hw, Math.abs(z - C.z) - C.hd);
    if (sd < C.m) h = Math.min(h, sd <= 0 ? C.pit : C.rim + (h - C.rim) * smooth(0, C.m, sd));
  }
  return h;
}
// ── world6 ── the Siloam Pool and the Pool of Bethesda (src/city.js SIL / BETH + their retaining walls). Both lie far outside
// the Mount's platform and its margins, where nothing but the city reads terrainH.
export const CARVE = [
  { x: -322, z: 1321, hw: 46, hd: 37, pit: -97, rim: -86.6, m: 36 },
  { x: 115, z: -735, hw: 75, hd: 55, pit: -12, rim: 2.4, m: 30 },
  { x: -520, z: -5, hw: 40, hd: 42, pit: 3.6, rim: 3.6, m: 26 },     // the Xystus (lowers only the hill west of x −480)
];

// ── look D ── the Mount of Olives' groves (city.js buildOlivet plants its rows where this is over −0.35; the ground under them keeps a
// little green): a field of two waves, moved here from city.js so the terrain's colour can read it ── /look D ──
export const oliveGrove = (x, z) => Math.sin(x * 0.011 + z * 0.004) + Math.sin(z * 0.013 - x * 0.006 + 1.7);
// ── look D ── the height of the terrain as its mesh draws it (buildTerrain's grid: two triangles a cell, the cells wider away from the
// Mount): what lies on the far ground (the terraces' strips, the paths) follows the drawn surface, not terrainH between the vertices.
// The corners' heights cached (the same few hundred cells over and over) ── /look D ──
const TG = { N: 260, a: 910, b: 2730 }, TGH = new Map();
const gridX = (i) => { const t = i / TG.N * 2 - 1; return TG.a * t + TG.b * t * t * t; };
const gridI = (x) => { let lo = 0, hi = TG.N; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (gridX(m) <= x) lo = m; else hi = m; } return lo; };
const gridH = (i, j) => { const k = i * 1000 + j; let h = TGH.get(k); if (h === undefined) { h = terrainH(gridX(i), gridX(j)); TGH.set(k, h); } return h; };
export function terrainMeshH(x, z) {
  const i = gridI(x), j = gridI(z), x0 = gridX(i), z0 = gridX(j);
  const u = Math.max(0, Math.min(1, (x - x0) / (gridX(i + 1) - x0))), v = Math.max(0, Math.min(1, (z - z0) / (gridX(j + 1) - z0)));
  const ha = gridH(i, j), hb = gridH(i + 1, j), hc = gridH(i, j + 1), hd = gridH(i + 1, j + 1);
  return u + v <= 1 ? ha + u * (hb - ha) + v * (hc - ha) : hd + (1 - u) * (hc - hd) + (1 - v) * (hb - hd);
}

const ZONES = [
  { x0: -1500, x1: -485, z0: -600, z1: 900, dens: 0.8, cell: 23 },    // Upper City
  { x0: -470, x1: -262, z0: 440, z1: 1300, dens: 0.66, cell: 22 },    // Lower City / Tyropoeon
  { x0: -255, x1: 300, z0: 470, z1: 1400, dens: 0.72, cell: 22 },     // City of David / Ophel
  { x0: -900, x1: 420, z0: -1500, z1: -660, dens: 0.6, cell: 26 },    // Bezetha
];
export function cityMask(x, z) {
  let m = 0;
  for (const Z of ZONES) { const d = Math.max(Z.x0 - x, x - Z.x1, Z.z0 - z, z - Z.z1); m = Math.max(m, smooth(40, -20, d)); }
  if (extraMask) m = Math.max(m, extraMask(x, z));   // ── world6 ── the new city's quarters (city.js), so no lawns between its houses
  return m;
}
// ── world6 ── city.js registers its quarters here (called before buildTerrain / buildTrees)
let extraMask = null;
export function setCityMask(f) { extraMask = typeof f === 'function' ? f : null; }
const EXCL = [[PLAT.X0 - 40, PLAT.X1 + 40, PLAT.Z0 - 110, PLAT.Z1 + 70], [-480, -290, -85, -33], [-360, -290, 340, 500], [-160, 80, 395, 445], [280, 310, -20, 140]];
const inEx = (x, z, m = 0) => EXCL.some(([a, b, c, d]) => x > a - m && x < b + m && z > c - m && z < d + m);

// terrain vertex colour at (x, z) with height h and normal.y ny (also used to blend the natural hill into it)
// ── world6 ── the hills as they are from spring's end to the first rains (the game's Sukkot): golden and olive-dry, greener only
// in the valley bottoms and the orchards (was a spring green)
// ── look B ── (the owner: "a rocky Jerusalem hill, not a lawn") the tones dry straw and ochre, the valley bottoms a dry olive; the
// rock, the earth and the stones are drawn by the ground's shader (look/ground.js) on this large-scale tone ── /look B ──
// ── look D ── (D1: no lawn) the valley bottoms a deeper dry olive and darker (the Kidron's depth felt from the Mount), the orchards' green
// only under the groves ── /look D ──
const TC = { gA: new THREE.Color('#A8966C'), gB: new THREE.Color('#C4B084'), dry: new THREE.Color('#CBB68A'), rock: new THREE.Color('#D2C4A4'), dust: new THREE.Color('#D3C3A0'), lush: new THREE.Color('#737650'), orchard: new THREE.Color('#9C9866'), soil: new THREE.Color('#A98262'), street: new THREE.Color('#B39874') };   // ── look D ── (street) ── /look D ──
export function terrainColor(x, z, h, ny, c, cm = cityMask(x, z)) {   // ── look B ── (cm: the city's mask, when the caller has it) ── /look B ──
  c.copy(TC.gA).lerp(TC.gB, NC(x / 150, z / 150, 3));
  c.lerp(TC.dry, smooth(0.45, 0.72, ND(x / 420 + 3, z / 420 - 2, 2)) * 0.8);
  // ── look D review K1 ── (the steeper far slopes: red earth between the limestone, the rock itself drawn by the ground's shader from
  // aGr.x; was one pale wash) ── /look D review ──
  c.lerp(TC.soil, smooth(0.07, 0.24, 1 - ny) * 0.4 * (1 - cm));
  c.lerp(TC.rock, smooth(0.14, 0.36, 1 - ny) * 0.35);
  c.lerp(TC.lush, smooth(-84, -114, h) * 0.7);   // ── look D review K1 ── (the Kidron's floor greener: 0.45 → 0.7, from higher up) ── /look D review ──
  // ── look D ── (the valley floor in shade: darker the deeper) ── /look D ──
  c.multiplyScalar(1 - 0.38 * smooth(-70, -115, h) * (1 - cm));
  // ── look D ── (the orchards' tint only where the olives stand: the Mount of Olives' groves, the scattered groves beyond) ── /look D ──
  if (x > 480) c.lerp(TC.orchard, 0.3 * smooth(480, 700, x) * (x < 1250 && Math.abs(z) < 1100 ? smooth(-0.6, -0.1, oliveGrove(x, z)) : smooth(0.4, 0.5, NA(x / 300 + 7, z / 300 - 3, 3))));
  c.lerp(TC.dust, cm * 0.78);
  // ── look D ── (D3: the streets and the open ground between the houses trodden earth in patches, not one beige) ── /look D ──
  if (cm > 0) c.lerp(TC.street, cm * (0.3 + 0.5 * smooth(0.36, 0.64, NC(x / 38 + 11, z / 38 - 5, 2))));
  // ── look D review K2 ── (the lanes between the houses in their shade: darker, so the blocks separate) ── /look D review ──
  if (cm > 0) c.multiplyScalar(1 - 0.24 * cm);
  const dPlat = Math.max(PLAT.X0 - x, x - PLAT.X1, PLAT.Z0 - z, z - PLAT.Z1, 0);
  c.lerp(TC.dust, smooth(90, 5, dPlat) * 0.7);
  // ── look B review H3 ── the broad tone (40–120 amot) the Mount's hill has too: darker, redder earth in patches, paler dusty crowns
  // (not in the city) ── /look B ──
  const big = NC(x / 90 + 7, z / 90 - 3, 3), dk = smooth(0.5, 0.34, big) * (1 - cm), cr = smooth(0.54, 0.7, big) * (1 - cm);
  c.lerp(TC.soil, dk * 0.4); c.multiplyScalar(1 - 0.16 * dk); c.lerp(TC.dust, cr * 0.4);
  return c;
}
// ── look B ── the ground's two vertex values (look/ground.js aGr): x the rock's bias (outcrops in patches of 30–80 amot, none in the
// city), y a hollow's darker earth (the valley bottoms, where the old green was) ── /look B ──
const NE = makeNoise(131);
export function terrainGr(x, z, h, out, city = cityMask(x, z)) {
  out[0] = smooth(0.58, 0.78, NE(x / 55 + 4, z / 55 - 7, 3)) * 0.75 * (1 - city) * (1 - 0.8 * smooth(-82, -118, h));   // ── look D ── (no bare slabs on the valley floors: their earth washed down) ── /look D ──
  out[1] = Math.min(1, smooth(-95, -135, h) * 0.7 + smooth(0.6, 0.8, NE(x / 140 - 2, z / 140 + 5, 2)) * 0.3) * (1 - city);
  return out;
}

// ── look D review K1 ── the old terraces on the open slopes (look/ground.js draws them from aGr.z): none on the Mount and its margins,
// in the city, on the valley floors, on the flat or on cliffs, nor where the Mount of Olives' groves have their own (city.js buildOlivet);
// in broad patches, not everywhere ── /look D review ──
export function terraceW(x, z, h, ny, cm) {
  // (the cheap factors first: most of the grid is out on one of them, and the noise is drawn only where it counts)
  const sl = 1 - ny, e = Math.max(Math.abs(x), Math.abs(z));
  if (cm >= 1 || sl < 0.008 || sl > 0.45 || h < -122 || e > 3200) return 0;
  const dPlat = Math.max(PLAT.X0 - x, x - PLAT.X1, PLAT.Z0 - z, z - PLAT.Z1, 0); if (dPlat < 200) return 0;
  let w = smooth(200, 380, dPlat) * smooth(0.008, 0.04, sl) * (1 - smooth(0.3, 0.45, sl)) * (1 - cm) * (1 - smooth(-100, -122, h)) * (1 - smooth(2700, 3200, e));
  if (x > 440 && x < 1270 && Math.abs(z) < 1120) w *= smooth(-0.2, -0.5, oliveGrove(x, z));
  return w > 0 ? w * smooth(0.2, 0.36, NA(x / 520 - 9, z / 520 + 4, 2)) : 0;
}

export function buildTerrain() {
  const N = 260, a = 910, b = 2730, n1 = N + 1;
  const xs = new Float32Array(n1);
  for (let i = 0; i <= N; i++) { const t = i / N * 2 - 1; xs[i] = a * t + b * t * t * t; }
  const pos = new Float32Array(n1 * n1 * 3);
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
    const k = j * n1 + i, x = xs[i], z = xs[j];
    pos[k * 3] = x; pos[k * 3 + 1] = terrainH(x, z); pos[k * 3 + 2] = z;
  }
  const idx = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const a0 = j * n1 + i, b0 = a0 + 1, c0 = a0 + n1, d0 = c0 + 1; idx.push(a0, c0, b0, b0, c0, d0); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  smoothGridNormals(g, n1, n1);   // ── look B ── (the light follows the land, not its triangles) ── /look B ──
  const nor = g.attributes.normal.array, col = new Float32Array(n1 * n1 * 3), gr = new Float32Array(n1 * n1 * 3), o = [0, 0];
  const c = new THREE.Color();
  for (let k = 0; k < n1 * n1; k++) {
    const cm = cityMask(pos[k * 3], pos[k * 3 + 2]);
    terrainColor(pos[k * 3], pos[k * 3 + 2], pos[k * 3 + 1], nor[k * 3 + 1], c, cm);
    col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
    const x = pos[k * 3], z = pos[k * 3 + 2], h = pos[k * 3 + 1], ny = nor[k * 3 + 1];
    terrainGr(x, z, h, o, cm);
    // ── look D review K1 ── (the far steep slopes: more of the rock bare, in patches; aGr.z the terraces) ── /look D review ──
    const dPlat = Math.max(PLAT.X0 - x, x - PLAT.X1, PLAT.Z0 - z, z - PLAT.Z1, 0), st = smooth(0.06, 0.2, 1 - ny) * (1 - cm) * smooth(200, 400, dPlat) * (1 - smooth(-90, -115, h));
    gr[k * 3] = st > 0 ? Math.max(o[0], st * (0.3 + 0.6 * smooth(0.4, 0.62, NE(x / 70 + 1, z / 70 - 3, 2)))) : o[0];
    gr[k * 3 + 1] = o[1]; gr[k * 3 + 2] = terraceW(x, z, h, ny, cm);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aGr', new THREE.BufferAttribute(gr, 3));
  const mesh = new THREE.Mesh(g, groundMat(THREE));   // ── look B ── (the ground's one material: look/ground.js) ── /look B ──
  mesh.receiveShadow = true; mesh.matrixAutoUpdate = false;
  return mesh;
}

export function buildCity(scene, B) {
  const r = rng(909);
  const pal = ['#D6C29B', '#CBB48C', '#DDCBA6', '#C2A87F', '#D1BB93', '#BCA27A', '#E0CFAC', '#C8AE86', '#B99D74', '#D8C4A0'].map((h) => new THREE.Color(h));
  const bodies = [], uppers = [], lights = [];
  for (const Z of ZONES) {
    const cell = Z.cell;
    for (let gx = Z.x0; gx < Z.x1; gx += cell) for (let gz = Z.z0; gz < Z.z1; gz += cell) {
      if (r() > Z.dens) continue;
      const w = 9 + r() * 9, d = 9 + r() * 9, x = gx + cell / 2 + (r() - 0.5) * (cell - w) * 0.6, z = gz + cell / 2 + (r() - 0.5) * (cell - d) * 0.6;
      if (inEx(x, z, 12)) continue;
      const hs = [terrainH(x - w / 2, z - d / 2), terrainH(x + w / 2, z - d / 2), terrainH(x - w / 2, z + d / 2), terrainH(x + w / 2, z + d / 2)];
      const lo = Math.min(...hs), hi = Math.max(...hs);
      if (hi - lo > 10) continue;
      const H = 5.5 + r() * 6 + (r() < 0.18 ? 5 : 0), y0 = lo - 2, y1 = hi + H, rot = (r() - 0.5) * 0.12;
      const c = pal[Math.floor(r() * pal.length)];
      bodies.push([x, z, w, d, y0, y1, rot, c]);
      if (r() < 0.38) uppers.push([x + (r() - 0.5) * w * 0.4, z + (r() - 0.5) * d * 0.4, w * 0.42, d * 0.42, y1, y1 + 4.5 + r() * 2, rot, c]);
      if (r() < 0.55) lights.push([x + (r() - 0.5) * w * 0.8, y1 + 1.5, z + (r() - 0.5) * d * 0.8]);
    }
  }
  const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.93 });
  const mk = (list, lip) => {
    const m = new THREE.InstancedMesh(geo, mat, list.length);
    const q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), M = new THREE.Matrix4(), up = new THREE.Vector3(0, 1, 0);
    const cc = new THREE.Color();
    list.forEach(([x, z, w, d, y0, y1, rot, c], i) => {
      q.setFromAxisAngle(up, rot);
      if (lip) { p.set(x, y1 - 0.3, z); s.set(w + 0.7, 1.2, d + 0.7); cc.copy(c).offsetHSL(0, -0.03, -0.06); }
      else { p.set(x, y0, z); s.set(w, y1 - y0, d); cc.copy(c); }
      M.compose(p, q, s); m.setMatrixAt(i, M); m.setColorAt(i, cc);
    });
    m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
    scene.add(m); return m;
  };
  mk(bodies, false); mk(bodies, true); mk(uppers, false);
  // doors and small windows
  {
    const dm = new THREE.MeshStandardMaterial({ color: '#3A2C20', roughness: 1 });
    const doors = new THREE.InstancedMesh(geo, dm, bodies.length * 3);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), off = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    let n = 0;
    const rr = rng(4242);
    for (const [x, z, w, d, y0, y1, rot] of bodies) {
      q.setFromAxisAngle(up, rot);
      const face = rr() < 0.5 ? 1 : -1, ground = terrainH(x, z + face * d / 2);
      off.set((rr() - 0.5) * w * 0.5, 0, face * (d / 2 + 0.03)).applyQuaternion(q);
      p.set(x + off.x, Math.max(ground, y0) , z + off.z); sc.set(1.5, 2.6, 0.12); M.compose(p, q, sc); doors.setMatrixAt(n++, M);
      for (let k = 0; k < 2; k++) {
        const wx = (rr() - 0.5) * w * 0.7, wy = y1 - 3.2;
        if (wy - ground < 4) continue;
        off.set(wx, 0, -face * (d / 2 + 0.03)).applyQuaternion(q);
        p.set(x + off.x, wy, z + off.z); sc.set(0.9, 1.1, 0.12); M.compose(p, q, sc); doors.setMatrixAt(n++, M);
      }
    }
    doors.count = n; doors.frustumCulled = false; scene.add(doors);
  }

  // Herod's towers on the western edge — Hippicus 80, Phasael 90, Mariamne 55 (War 5.4.3)
  for (const [x, z, s, h] of [[-1330, 30, 26, 80], [-1330, 80, 30, 90], [-1330, 128, 22, 55]]) {
    const base = Math.min(terrainH(x - s / 2, z - s / 2), terrainH(x + s / 2, z + s / 2), terrainH(x - s / 2, z + s / 2), terrainH(x + s / 2, z - s / 2)) - 3;
    B.box('ash', x - s / 2, base, z - s / 2, x + s / 2, base + h, z + s / 2);
    B.box('ash', x - s / 2 - 0.8, base + h - 1.5, z - s / 2 - 0.8, x + s / 2 + 0.8, base + h + 0.3, z + s / 2 + 0.8, -999);
    for (let k = 0; k < 6; k++) { const t = -s / 2 + 1 + k * (s - 2) / 5; B.box('ash', x + t - 0.8, base + h + 0.3, z - s / 2 - 0.8, x + t + 0.8, base + h + 2.6, z - s / 2 + 0.8, -999); B.box('ash', x + s / 2 - 0.8, base + h + 0.3, z + t - 0.8, x + s / 2 + 0.8, base + h + 2.6, z + t + 0.8, -999); }
  }
  { const x0 = -1318, x1 = -1210, z0 = 150, z1 = 390, base = terrainH(-1264, 270) - 4; B.box('ash', x0, base, z0, x1, base + 30, z1); B.box('pave', x0, base + 30, z0, x1, base + 30.3, z1, -999); }

  // night lamps
  const lp = new Float32Array(lights.length * 3);
  lights.forEach(([x, y, z], i) => lp.set([x, y, z], i * 3));
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  return { lampGeo: lg };
}

export function buildTrees(scene, extra = [], rows = null, courts = []) {   // ── world6 ── extra: [x, y, z] cypresses (the palace gardens); rows: [x, z] olives on the Mount of Olives' terraces (city.js)
  const r = rng(313), olives = [], cyp = [];
  const addOlive = (x, z, s = 1) => { if (inEx(x, z, 8) || cityMask(x, z) > 0.35) return false; olives.push([x, terrainH(x, z), z, s * (0.8 + r() * 0.5), r() * 6.28]); return true; };
  let tries = 0;
  // ── look D ── (D2) the rows stay rows, each tree a little off its place (up to 15 % of the 14-amot spacing) and about one in twelve
  // left out; a left-out tree still draws its two numbers, so every other tree stands where it stood ── /look D ──
  let gone = 0;
  if (rows) for (const [x, z] of rows) if (olives.length + gone < 1500) {   // ── world6 ──
    const [jx, jz, drop] = jitter(x, z, 14);
    if (drop && !inEx(x, z, 8) && cityMask(x, z) <= 0.35) { r(); r(); gone++; continue; }
    addOlive(x + jx, z + jz);
  }
  for (const [x, z] of courts) olives.push([x, terrainH(x, z), z, 0.62 + r() * 0.25, r() * 6.28]);   // ── world6 ── trees in the city's courts
  while (olives.length + gone < 1700 && tries < 60000) { tries++; const x = 470 + r() * 1900, z = -1700 + r() * 3400; if (rows && x < 1250 && Math.abs(z) < 1100) continue; if (NA(x / 300 + 7, z / 300 - 3, 3) < 0.44) continue; addOlive(x, z); }
  for (let i = 0; i < 150; i++) addOlive(440 + r() * 150, -260 + r() * 380, 1.1);          // Gethsemane
  for (let i = 0; i < 1400 && olives.length + gone < 2300; i++) { const x = -2600 + r() * 5200, z = -2600 + r() * 5200; if (NB(x / 200, z / 200, 2) < 0.52) continue; addOlive(x, z); }
  for (let i = 0; i < 700 && cyp.length < 230; i++) {
    const x = -1500 + r() * 1900, z = -1500 + r() * 2900;
    if (cityMask(x, z) < 0.6 || inEx(x, z, 14)) continue;
    cyp.push([x, terrainH(x, z) - 1, z, 0.8 + r() * 0.5]);
  }
  for (const [x, y, z] of extra) cyp.push([x, y - 1, z, 0.7 + r() * 0.4]);   // ── world6 ──
  // ── look D review K1 ── wild trees and shrub clumps (terebinth, carob, thorn: illustration) on the open slopes and along the Kidron's
  // floor, in small loose clusters, none in rows: the olive crown's instances (no trunk: low and bushy), a darker green. Their own rng,
  // so every other tree stands where it stood ── /look D review ──
  const wild = [], rw = rng(5151);
  for (let c = 0, tries2 = 0; c < 44 && tries2 < 4000; tries2++) {
    const kid = c < 14, x = kid ? 330 + rw() * 330 : -2400 + rw() * 4800, z = kid ? -1300 + rw() * 2700 : -2400 + rw() * 4800, h = terrainH(x, z);
    if (inEx(x, z, 30) || cityMask(x, z) > 0.02) continue;
    if (kid ? h > -96 : (h < -100 || (x > 440 && x < 1270 && Math.abs(z) < 1120 && oliveGrove(x, z) > -0.5))) continue;
    c++;
    const n = 3 + Math.floor(rw() * 5);
    for (let i = 0; i < n; i++) { const a = rw() * 6.28, d = 3 + rw() * 13, px = x + Math.cos(a) * d, pz = z + Math.sin(a) * d; if (!inEx(px, pz, 8)) wild.push([px, terrainH(px, pz), pz, 0.45 + rw() * 0.45, rw() * 6.28]); }
  }
  // ── look D ── (D2) the olive: a crown of three irregular clumps in silver grey-green, two tones by the normal (look/far.js), raised so
  // the short twisted trunk shows under it; the cypress a dark slender spindle with a ragged outline (was a smooth cone). One instanced
  // mesh per part as before, the same counts ── /look D ──
  const leaf = windMat(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, flatShading: true, vertexColors: true }));   // ── look C ── (the crowns sway in the wind) ── /look C ──
  const bark = new THREE.MeshStandardMaterial({ color: '#5E4E3C', roughness: 1 });
  const nO = olives.length; olives.push(...wild);   // ── look D review K1 ── (the wild ones last: crowns only) ── /look D review ──
  const can = new THREE.InstancedMesh(oliveCrownGeo(THREE), leaf, olives.length), trunk = new THREE.InstancedMesh(oliveTrunkGeo(THREE), bark, nO);
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), cc = new THREE.Color();
  const leafPal = ['#8A9672', '#7E8A68', '#929B7A', '#859070', '#7A8565', '#8E9876', '#848E6C'].map((h) => new THREE.Color(h));
  const wildPal = ['#7A8A52', '#84905A', '#71804C', '#8A945E'].map((h) => new THREE.Color(h));
  olives.forEach(([x, y, z, k, rot], i) => {
    q.setFromAxisAngle(up, rot);
    if (i >= nO) {   // ── look D review K1 ── (a wild clump: low, wider than high, sunk a little into the slope) ── /look D review ──
      p.set(x, y + 2.2 * k, z); s.set(5.4 * k, 3.4 * k, 5.4 * k); M.compose(p, q, s); can.setMatrixAt(i, M);
      can.setColorAt(i, cc.copy(wildPal[i % wildPal.length]).multiplyScalar(0.9 + 0.2 * ((i * 7) % 5) / 4)); return;
    }
    p.set(x, y + 2.3 * k + 1.7, z); s.set(5.0 * k, 3.7 * k, 5.0 * k); M.compose(p, q, s); can.setMatrixAt(i, M);
    cc.copy(leafPal[(i * 5 + (x | 0)) % leafPal.length]).multiplyScalar(0.94 + 0.12 * ((Math.abs(z | 0) % 7) / 6)); can.setColorAt(i, cc);
    p.set(x, y - 0.5, z); s.set(k, k * 1.2, k); M.compose(p, q, s); trunk.setMatrixAt(i, M);
  });
  const cone = new THREE.InstancedMesh(cypressGeo(THREE), new THREE.MeshStandardMaterial({ color: '#34502F', roughness: 0.9, flatShading: true }), cyp.length);
  cyp.forEach(([x, y, z, k], i) => { p.set(x, y, z); s.set(k * 0.95, k * (0.92 + (i % 3) * 0.13), k * 0.95); q.setFromAxisAngle(up, (i * 2.399) % 6.283); M.compose(p, q, s); cone.setMatrixAt(i, M); });
  for (const m of [can, trunk, cone]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); }
}

export function buildSky() {
  const uniforms = {
    top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() },
    sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() }, sunI: { value: 1 },
  };
  const mk = (u) => new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, horizon, bottom, sunCol, sunDir; uniform float sunI; varying vec3 vP;
      void main(){ vec3 d = normalize(vP); float h = d.y;
        vec3 c = h > 0.0 ? mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.42)) : mix(horizon, bottom, clamp(-h * 5.0, 0.0, 1.0));
        float s = max(dot(d, normalize(sunDir)), 0.0);
        c += sunCol * (pow(s, 1600.0) * 30.0 + pow(s, 28.0) * 0.5 + pow(s, 4.0) * 0.14) * sunI;
        gl_FragColor = vec4(c, 1.0); }`,
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(5000, 32, 16), mk(uniforms));
  dome.renderOrder = -10; dome.frustumCulled = false;
  const envU = THREE.UniformsUtils.clone(uniforms);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), mk(envU)));
  // stars
  const r = rng(12), sp = new Float32Array(1400 * 3);
  for (let i = 0; i < 1400; i++) { const a = r() * Math.PI * 2, e = Math.asin(0.05 + r() * 0.95); sp.set([Math.cos(a) * Math.cos(e) * 4600, Math.sin(e) * 4600, Math.sin(a) * Math.cos(e) * 4600], i * 3); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.7, sizeAttenuation: false, color: '#ffffff', transparent: true, opacity: 0.9, depthWrite: false, depthTest: false, fog: false }));
  stars.renderOrder = -9; stars.frustumCulled = false; stars.visible = false;
  dome.add(stars);
  return { dome, uniforms, envScene, envU, stars };
}

export function buildClouds(dome, puff) {
  const r = rng(77), clouds = [];
  for (let c = 0; c < 11; c++) {
    const a = r() * Math.PI * 2, e = 0.09 + r() * 0.12, R = 4200;
    const g = new THREE.Group();
    g.position.set(Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R);
    for (let k = 0; k < 6; k++) {
      const m = new THREE.SpriteMaterial({ map: puff, color: '#ffffff', transparent: true, opacity: 0.9, depthWrite: false, depthTest: false, fog: false });
      const s = new THREE.Sprite(m);
      s.position.set((r() - 0.5) * 900, (r() - 0.5) * 120, (r() - 0.5) * 300);
      const sc = 380 + r() * 420; s.scale.set(sc * 1.6, sc * 0.7, 1); s.renderOrder = -8;
      g.add(s); clouds.push(s);
    }
    dome.add(g);
  }
  return clouds;
}
