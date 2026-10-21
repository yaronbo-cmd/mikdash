// ── world6 ── src/city.js — Jerusalem around the Mount in the late Second Temple period (WORLD, wave 6).
// 1 unit = 1 amah; +x east, +z south, +y up; the Mount's paving at y 0 (PROJECT.md §4).
// What it builds:
// - the First Wall (War 5.142–145, paraphrase): from Hippicus east to the Xystus (by Wilson's causeway); and from Hippicus
//   round the west and the south of the Upper City to the Essenes' gate, south above Siloam, and up the east side of the
//   City of David ("Ophlas") to the Mount's south-eastern corner. Square towers, gates: Gennath and the Essenes' gate are
//   Josephus's; the gate by Siloam and all sizes are illustrations (⚑).
// - the Second Wall (War 5.146): from the Gennath gate round the northern quarter to the Antonia.
// - Herod's three towers (War 5.161–175: Hippicus 25 × 25 cubits, 80 high; Phasael 40 × 40, 90; Mariamne 20 × 20, 50)
//   and the palace behind them (War 5.176–183: a wall of 30 cubits with towers at equal distances, two great halls,
//   porticoes, groves and ponds — the plan is an illustration ⚑).
// - the houses: the Upper City (mansions and courtyard houses), the Tyropoeon, the Lower City and the City of David down to
//   the Siloam Pool, the northern quarter, Bezetha outside the walls. Instanced archetypes on a street/block layout: flat
//   roofs with parapets (the ma'akeh, Deut. 22:8), courtyards, roof stairs, upper rooms, pergolas with vines, awnings.
//   Near the Mount the detailed archetypes, farther the simple ones (static LOD). One draw call per archetype.
// - the Siloam Pool (stepped; excavated from 2004) and the stepped street from it up the Tyropoeon to the Mount's
//   south-western corner and the Chuldah stairs; the Pool of Bethesda (two pools and a dam; porticoes ⚑).
// - thin smoke from courtyard ovens at dawn and dusk (one Points draw call, animated in its shader); lamps at night.
// Walls, pools and streets go into the shared Batch (existing materials: no new draw calls).
import * as THREE from 'three';
import { rng, smooth } from './util.js';
import { terrainH, setCityMask } from './world.js';
import { PLAT } from './mount.js';

/* ───────── the plan ───────── */
// the walls' lines (x, z); the towers of Herod on the first wall's north-western corner (world.js had them since wave 1)
const FIRST_N = [[-480, -92], [-620, -80], [-800, -58], [-1000, -28], [-1080, -18], [-1230, 4], [-1330, 30]];
const FIRST_S = [[-1330, 30], [-1330, 128], [-1346, 170], [-1346, 420], [-1332, 700], [-1290, 950], [-1180, 1040], [-1000, 1090],
  [-800, 1152], [-600, 1240], [-470, 1318], [-400, 1392], [-250, 1406], [-100, 1372], [60, 1292], [190, 1130], [262, 900],
  [292, 650], [294, 430], [277, 400]];
const SECOND = [[-1080, -18], [-1062, -200], [-995, -420], [-870, -560], [-640, -628], [-420, -618], [-308, -560]];
// the Third Wall (War 5.147–160, Agrippa's): from Hippicus north to the octagonal tower Psephinus, east past the kings' tombs,
// round the corner tower and down to the old wall by the Kidron (here: the Mount's north-eastern corner); its line ⚑
const THIRD = [[-1330, 30], [-1348, -260], [-1322, -700], [-1250, -1150], [-1150, -1470], [-800, -1590], [-400, -1630], [0, -1595],
  [300, -1480], [432, -1200], [442, -900], [365, -640], [277, -480]];
const PSEPHINUS = [-1150, -1470];
// the polygons that hold the houses (the first wall closed along the Mount's south and west sides; the second quarter)
const FW_POLY = [...FIRST_N, ...FIRST_S.slice(1), [-300, 400], [-300, -92]];
const SW_POLY = [...SECOND, [-300, -480], [-300, -92], ...FIRST_N.slice(0, 5)];
const TW_POLY = [...THIRD, [-300, -480], [-300, -92], ...FIRST_N.slice(0, -1)];
const TOWERS = { hippicus: [-1330, 30, 25, 80, 30], phasael: [-1330, 80, 40, 90, 40], mariamne: [-1330, 128, 20, 50, 20] };   // x, z, side, height in all, the solid part (War 5.161–170)
const SIL = { x: -322, z: 1321, hw: 42, hd: 33 };        // the Siloam Pool's terrace (half sizes) ⚑ size
const BETH = { x: 115, z: -735, hw: 75, hd: 55 };         // the Pool of Bethesda's enclosure ⚑ size
const STEPPED = [[-336, 486], [-328, 560], [-318, 700], [-311, 850], [-310, 1000], [-314, 1150], [-320, 1287]];
const OPHEL = [[-322, 472], [-250, 468], [-160, 452]];     // the street from the stepped street to the Chuldah plaza
const PALACE = { x0: -1330, x1: -1200, z0: 145, z1: 400 };
const MARKET = { x0: -940, x1: -850, z0: 250, z1: 320 };
const XYSTUS = { x0: -560, x1: -480, z0: -47, z1: 37, y: 3.9 };   // an open paved place west of the Mount (War 5.144); its look ⚑   // the Upper Market (War 5.137: "the upper market place"); place and size ⚑

/** the plan's lines and places (tests, other agents): read-only */
export const PLAN = { FIRST_N, FIRST_S, SECOND, THIRD, STEPPED, OPHEL, SIL, BETH, PALACE, TOWERS };

/** world positions of the landmarks (keys = CONTENT's city.json `landmark` keys) — for cards, crowds, water, cameras */
export const LANDMARKS = {
  tower_hippicus: [-1330, 30], tower_phasael: [-1330, 80], tower_mariamne: [-1330, 128], herod_palace: [-1265, 272],
  first_wall: [-800, -58], second_wall: [-995, -420], third_wall: [-400, -1630], psephinus: PSEPHINUS, gennath_gate: [-1080, -18], essenes_gate: [-1180, 1040],
  upper_city: [-900, 400], lower_city: [-150, 900], tyropoeon: [-400, 200], siloam_pool: [SIL.x, SIL.z],
  stepped_street: [-311, 850], bethesda: [BETH.x, BETH.z], mount_of_olives: [900, -100], kidron: [420, 150],
  xystus: [-520, -5], upper_market: [-895, 285], wilson_bridge: [-385, -59], robinson_arch: [-336, 430], antonia: [-245, -529],
};

/* ───────── small geometry: flat-shaded quads and boxes, optionally vertex-coloured ───────── */
const _a = new THREE.Vector3(), _b = new THREE.Vector3(), _n = new THREE.Vector3();
class Acc {
  constructor(color) { this.p = []; this.n = []; this.c = color ? [] : null; this.uv = color ? [] : null; this.col = [1, 1, 1]; this.grad = null; }
  k(r, g = r, b = r) { this.col = [r, g, b]; return this; }
  // a quad a, b, c, d (any winding) facing n
  quad(a, b, c, d, nx, ny, nz) {
    _a.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); _b.set(c[0] - a[0], c[1] - a[1], c[2] - a[2]); _n.crossVectors(_a, _b);
    const L = Math.hypot(nx, ny, nz) || 1, vs = _n.x * nx + _n.y * ny + _n.z * nz >= 0 ? [a, b, c, a, c, d] : [a, c, b, a, d, c];
    const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
    for (const v of vs) {
      this.p.push(v[0], v[1], v[2]); this.n.push(nx / L, ny / L, nz / L);
      if (this.c) { const f = this.grad ? this.grad(v[1]) : 1; this.c.push(this.col[0] * f, this.col[1] * f, this.col[2] * f); }
      // (the houses' plaster: planar uv, 10 amot a tile)
      if (this.uv) this.uv.push(...(ay >= ax && ay >= az ? [v[0] / 10, v[2] / 10] : ax >= az ? [v[2] / 10, v[1] / 10] : [v[0] / 10, v[1] / 10]));
    }
  }
  // an axis-aligned box without its bottom
  box(x0, x1, y0, y1, z0, z1, bottom = false) {
    const q = (a, b, c, d, n) => this.quad(a, b, c, d, ...n);
    q([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0]);
    q([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1]);
    q([x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0], [0, 0, -1]);
    q([x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0], [1, 0, 0]);
    q([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0]);
    if (bottom) q([x0, y0, z0], [x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [0, -1, 0]);
    return this;
  }
  // a block with a roof at yR inside a parapet (hp high, t thick): outer walls, parapet top and inner faces, roof
  roofed(x0, x1, z0, z1, yB, yR, hp = 1.1, t = 0.5, kRoof = 0.8) {
    const yT = yR + hp, X0 = x0 + t, X1 = x1 - t, Z0 = z0 + t, Z1 = z1 - t, K = this.col;
    const q = (a, b, c, d, n) => this.quad(a, b, c, d, ...n);
    this.grad = (y) => (y <= yB + 0.01 ? 0.22 : 1.03);   // (a free "ground occlusion": 0 extra triangles)
    q([x0, yB, z1], [x1, yB, z1], [x1, yT, z1], [x0, yT, z1], [0, 0, 1]);
    q([x0, yB, z0], [x1, yB, z0], [x1, yT, z0], [x0, yT, z0], [0, 0, -1]);
    q([x1, yB, z0], [x1, yB, z1], [x1, yT, z1], [x1, yT, z0], [1, 0, 0]);
    q([x0, yB, z0], [x0, yB, z1], [x0, yT, z1], [x0, yT, z0], [-1, 0, 0]);
    this.grad = null;
    this.k(K[0] * 1.06, K[1] * 1.06, K[2] * 1.06);
    q([x0, yT, z0], [x1, yT, z0], [x1, yT, Z0], [x0, yT, Z0], [0, 1, 0]); q([x0, yT, Z1], [x1, yT, Z1], [x1, yT, z1], [x0, yT, z1], [0, 1, 0]);
    q([x0, yT, Z0], [X0, yT, Z0], [X0, yT, Z1], [x0, yT, Z1], [0, 1, 0]); q([X1, yT, Z0], [x1, yT, Z0], [x1, yT, Z1], [X1, yT, Z1], [0, 1, 0]);
    this.k(K[0] * 0.94, K[1] * 0.94, K[2] * 0.94);
    q([X0, yR, Z0], [X1, yR, Z0], [X1, yT, Z0], [X0, yT, Z0], [0, 0, 1]); q([X0, yR, Z1], [X1, yR, Z1], [X1, yT, Z1], [X0, yT, Z1], [0, 0, -1]);
    q([X0, yR, Z0], [X0, yR, Z1], [X0, yT, Z1], [X0, yT, Z0], [1, 0, 0]); q([X1, yR, Z0], [X1, yR, Z1], [X1, yT, Z1], [X1, yT, Z0], [-1, 0, 0]);
    this.k(K[0] * kRoof, K[1] * kRoof * 0.99, K[2] * kRoof * 0.96);
    q([X0, yR, Z0], [X0, yR, Z1], [X1, yR, Z1], [X1, yR, Z0], [0, 1, 0]);
    this.col = K; return this;
  }
  // a plain block: walls and a roof a shade darker (the far houses: parapets are below a pixel there)
  block(x0, x1, z0, z1, yB, yR, kRoof = 0.8) {
    const K = this.col; this.grad = (y) => (y <= yB + 0.01 ? 0.22 : 1.03); this.box(x0, x1, yB, yR, z0, z1); this.grad = null;
    const n = this.c ? this.c.length : 0;
    if (this.c) for (let i = n - 5 * 18; i < n - 4 * 18; i += 3) { this.c[i] *= kRoof; this.c[i + 1] *= kRoof * 0.99; this.c[i + 2] *= kRoof * 0.96; }
    this.col = K; return this;
  }
  // a dark opening (door, window) on a face: axis 'z' (face at z = w, facing sign s) or 'x'
  hole(axis, w, s, u0, u1, y0, y1, k = 0.16) {
    const K = this.col; this.k(k * 1.05, k, k * 0.92); const o = w + s * 0.06;
    if (axis === 'z') this.quad([u0, y0, o], [u1, y0, o], [u1, y1, o], [u0, y1, o], 0, 0, s);
    else this.quad([o, y0, u0], [o, y0, u1], [o, y1, u1], [o, y1, u0], s, 0, 0);
    this.col = K; return this;
  }
  // an oriented box along a→b (thickness th across), y0..y1 — for walls
  seg(ax, az, bx, bz, th, y0, y1) {
    const dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz) || 1, ux = dx / L, uz = dz / L, px = -uz * th / 2, pz = ux * th / 2;
    const A = [ax - px, az - pz], Bq = [bx - px, bz - pz], C = [bx + px, bz + pz], D = [ax + px, az + pz];
    const q = (a, b, c, d, n) => this.quad(a, b, c, d, ...n);
    q([A[0], y1, A[1]], [Bq[0], y1, Bq[1]], [C[0], y1, C[1]], [D[0], y1, D[1]], [0, 1, 0]);
    q([A[0], y0, A[1]], [Bq[0], y0, Bq[1]], [Bq[0], y1, Bq[1]], [A[0], y1, A[1]], [-pz * 0 + uz, 0, -ux]);
    q([D[0], y0, D[1]], [C[0], y0, C[1]], [C[0], y1, C[1]], [D[0], y1, D[1]], [-uz, 0, ux]);
    q([A[0], y0, A[1]], [D[0], y0, D[1]], [D[0], y1, D[1]], [A[0], y1, A[1]], [-ux, 0, -uz]);
    q([Bq[0], y0, Bq[1]], [C[0], y0, C[1]], [C[0], y1, C[1]], [Bq[0], y1, Bq[1]], [ux, 0, uz]);
    return this;
  }
  geo() {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    if (this.c) g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
    if (this.uv) g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    g.computeBoundingSphere();
    return g;
  }
}

/* ───────── helpers ───────── */
const inPoly = (P, x, z) => {
  let c = false;
  for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
    const [xi, zi] = P[i], [xj, zj] = P[j];
    if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c;
  }
  return c;
};
const dSeg = (px, pz, ax, az, bx, bz) => {
  const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz || 1)));
  return Math.hypot(px - ax - dx * t, pz - az - dz * t);
};
const dLine = (L, x, z) => { let d = 1e9; for (let i = 1; i < L.length; i++) d = Math.min(d, dSeg(x, z, ...L[i - 1], ...L[i])); return d; };
const rect = (R, x, z, m = 0) => x > R[0] - m && x < R[1] + m && z > R[2] - m && z < R[3] + m;
// places the houses keep clear of: the Mount and its margins, the causeway, Robinson's stairs, the Chuldah stairs, the Shushan
// stairs (world.js EXCL), the towers and the palace, the pools, the Chuldah plaza, the Antonia
const CLEAR = [[PLAT.X0 - 40, PLAT.X1 + 40, PLAT.Z0 - 110, PLAT.Z1 + 70], [-480, -290, -85, -33], [-360, -290, 340, 500],
  [-170, 90, 395, 480], [280, 310, -20, 140], [-1356, -1192, 0, 410], [SIL.x - SIL.hw - 12, SIL.x + SIL.hw + 12, SIL.z - SIL.hd - 12, SIL.z + SIL.hd + 12],
  [BETH.x - BETH.hw - 14, BETH.x + BETH.hw + 14, BETH.z - BETH.hd - 14, BETH.z + BETH.hd + 14], [-330, -140, 440, 490],
  [MARKET.x0 - 4, MARKET.x1 + 4, MARKET.z0 - 4, MARKET.z1 + 4], [XYSTUS.x0 - 12, XYSTUS.x1 + 4, XYSTUS.z0 - 8, XYSTUS.z1 + 8]];
const clearOf = (x, z) => !CLEAR.some((R) => rect(R, x, z)) && dLine(STEPPED, x, z) > 10.5 && dLine(OPHEL, x, z) > 10 &&
  dLine(FIRST_N, x, z) > 13 && dLine(FIRST_S, x, z) > 13 && dLine(SECOND, x, z) > 13 && dLine(THIRD, x, z) > 13 && Math.hypot(x - PSEPHINUS[0], z - PSEPHINUS[1]) > 24;
const distMount = (x, z) => Math.hypot(Math.max(PLAT.X0 - x, 0, x - PLAT.X1), Math.max(PLAT.Z0 - z, 0, z - PLAT.Z1));

// flat water planes (with uv in amot / 10) merged into one geometry
function mergePlanes(list) {
  const pos = [], nor = [], uv = [], idx = [];
  for (const w of list) {
    const b = pos.length / 3;
    for (const [x, z] of [[w.x0, w.z0], [w.x1, w.z0], [w.x1, w.z1], [w.x0, w.z1]]) { pos.push(x, w.y, z); nor.push(0, 1, 0); uv.push(x / 10, -z / 10); }
    idx.push(b, b + 2, b + 1, b, b + 3, b + 2);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeBoundingSphere();
  return g;
}

/* ───────── the walls, the towers, the gates ───────── */
function buildWalls(B) {
  const W = new Acc(false), D = new Acc(false), BIG = new Acc(false);
  const H = 22, TH = 9, ML = 2.2, MG = 4.6, MH = 2.4, MT = 1.1;
  const gates = [[-1080, -18], [-1180, 1040], [-432, 1356], [-870, -560], [-760, -63], [-600, -1605], [438, -1050]];   // Gennath · Essenes · Siloam ⚑ · a north gate ⚑ · a gate by the causeway road ⚑ · two third-wall gates ⚑
  const skipTower = (x, z) => gates.some(([gx, gz]) => Math.hypot(x - gx, z - gz) < 40) || Object.values(TOWERS).some(([tx, tz]) => Math.hypot(x - tx, z - tz) < 50) || Math.hypot(x - PSEPHINUS[0], z - PSEPHINUS[1]) < 40;
  const merlons = (acc, ax, az, bx, bz, off, y) => {
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, px = -uz, pz = ux;
    for (let s = MG / 2; s < L - ML / 2; s += MG) {
      const cx = ax + ux * s + px * off, cz = az + uz * s + pz * off;
      acc.seg(cx - ux * ML / 2, cz - uz * ML / 2, cx + ux * ML / 2, cz + uz * ML / 2, MT, y, y + MH);
    }
  };
  const tower = (acc, x, z, s, y0, top, ux = 1, uz = 0) => {
    const px = -uz, pz = ux, h = s / 2;
    acc.seg(x - ux * h, z - uz * h, x + ux * h, z + uz * h, s, y0, top);
    for (const [a, b] of [[[-h, -h], [h, -h]], [[h, -h], [h, h]], [[h, h], [-h, h]], [[-h, h], [-h, -h]]]) {
      const P = (q) => [x + ux * q[0] + px * q[1], z + uz * q[0] + pz * q[1]];
      const A = P(a), Bp = P(b), mx = (A[0] + Bp[0]) / 2 - x, mz = (A[1] + Bp[1]) / 2 - z, L = Math.hypot(mx, mz);
      // the merlons sit on the tower's edge, inset by half their thickness
      merlons(acc, A[0] - mx / L * MT / 2, A[1] - mz / L * MT / 2, Bp[0] - mx / L * MT / 2, Bp[1] - mz / L * MT / 2, 0, top);
    }
    // a band of small dark windows under the top
    for (const sgn of [-1, 1]) D.seg(x + px * sgn * (h + 0.02) - ux * 2, z + pz * sgn * (h + 0.02) - uz * 2, x + px * sgn * (h + 0.02) + ux * 2, z + pz * sgn * (h + 0.02) + uz * 2, 0.2, top - 6, top - 3.5);
  };
  const wall = (L, key) => {
    let run = 0;
    for (let i = 1; i < L.length; i++) {
      const [ax, az] = L[i - 1], [bx, bz] = L[i], len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 26)), ux = (bx - ax) / len, uz = (bz - az) / len;
      for (let k = 0; k < n; k++) {
        const x0 = ax + (bx - ax) * k / n, z0 = az + (bz - az) * k / n, x1 = ax + (bx - ax) * (k + 1) / n, z1 = az + (bz - az) * (k + 1) / n;
        const g = [terrainH(x0, z0), terrainH(x1, z1), terrainH((x0 + x1) / 2, (z0 + z1) / 2)];
        const top = Math.ceil((Math.max(...g) + H) / 3) * 3, bot = Math.min(...g) - 8;
        // (each piece overlaps the next by a little, so the joints close on the bends)
        W.seg(x0 - ux * 1.2, z0 - uz * 1.2, x1 + ux * 1.2, z1 + uz * 1.2, TH, bot, top);
        for (const off of [-(TH / 2 - MT / 2), TH / 2 - MT / 2]) merlons(W, x0, z0, x1, z1, off, top);
        run += len / n;
        if (run > 150 && !skipTower(x1, z1) && i + (k + 1) / n < L.length - 0.6) { run = 0; tower(W, x1, z1, 17, bot, top + 9, ux, uz); }
      }
    }
  };
  wall(FIRST_N); wall(FIRST_S); wall(SECOND); wall(THIRD.slice(1));
  // Psephinus: an octagon of seventy cubits at the third wall's north-western corner (War 5.159–160)
  { const [x, z] = PSEPHINUS, g = terrainH(x, z) - 4, geo = new THREE.CylinderGeometry(13, 13, 74, 8).translate(x, g + 37, z);
    B.geo('ash2', geo, -999); B.geo('ash2', new THREE.CylinderGeometry(14, 14, 1.6, 8).translate(x, g + 74.8, z), -999); }
  // the gates: two flanking towers and a dark arched opening through the wall
  for (const [gx, gz] of gates) {
    let best = null;
    for (const L of [FIRST_N, FIRST_S, SECOND, THIRD]) for (let i = 1; i < L.length; i++) { const d = dSeg(gx, gz, ...L[i - 1], ...L[i]); if (!best || d < best.d) best = { d, a: L[i - 1], b: L[i] }; }
    const [ax, az] = best.a, [bx, bz] = best.b, len = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / len, uz = (bz - az) / len;
    const t = Math.max(0, Math.min(1, ((gx - ax) * ux + (gz - az) * uz) / len)), cx = ax + ux * len * t, cz = az + uz * len * t;
    const g = terrainH(cx, cz), top = Math.ceil((g + H) / 3) * 3 + 11;
    for (const s of [-1, 1]) tower(W, cx + ux * s * 15, cz + uz * s * 15, 14, g - 10, top, ux, uz);
    D.seg(cx - ux * 4.5, cz - uz * 4.5, cx + ux * 4.5, cz + uz * 4.5, TH + 0.4, g - 1, g + 12);
    for (const [hw, y0, y1] of [[4.1, 12, 13.4], [3.3, 13.4, 14.5], [2.1, 14.5, 15.2]]) D.seg(cx - ux * hw, cz - uz * hw, cx + ux * hw, cz + uz * hw, TH + 0.4, g + y0, g + y1);   // the arch
  }
  // Herod's three towers: a solid base, a storey with windows, a parapet with corner turrets (War 5.161–175)
  for (const [x, z, s, h, sol] of Object.values(TOWERS)) {
    const base = Math.min(terrainH(x - s / 2, z - s / 2), terrainH(x + s / 2, z + s / 2), terrainH(x - s / 2, z + s / 2), terrainH(x + s / 2, z - s / 2)) - 3;
    const solid = base + sol, top = base + h;
    BIG.box(x - s / 2, x + s / 2, base, solid, z - s / 2, z + s / 2);
    BIG.box(x - s / 2 - 0.9, x + s / 2 + 0.9, solid, solid + 1.4, z - s / 2 - 0.9, z + s / 2 + 0.9);
    W.box(x - s / 2 + 0.6, x + s / 2 - 0.6, solid + 1.4, top - 1.6, z - s / 2 + 0.6, z + s / 2 - 0.6);
    W.box(x - s / 2 - 0.8, x + s / 2 + 0.8, top - 1.6, top, z - s / 2 - 0.8, z + s / 2 + 0.8);
    for (const [cx, cz] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {   // corner turrets
      const ox = x + cx * (s / 2 + 0.8), oz = z + cz * (s / 2 + 0.8);
      W.box(Math.min(ox, ox - cx * 5), Math.max(ox, ox - cx * 5), top, top + 5, Math.min(oz, oz - cz * 5), Math.max(oz, oz - cz * 5));
    }
    merlons(W, x - s / 2 + 3, z - s / 2 - 0.3, x + s / 2 - 3, z - s / 2 - 0.3, 0, top); merlons(W, x - s / 2 + 3, z + s / 2 + 0.3, x + s / 2 - 3, z + s / 2 + 0.3, 0, top);
    merlons(W, x - s / 2 - 0.3, z - s / 2 + 3, x - s / 2 - 0.3, z + s / 2 - 3, 0, top); merlons(W, x + s / 2 + 0.3, z - s / 2 + 3, x + s / 2 + 0.3, z + s / 2 - 3, 0, top);
    const nw = Math.max(2, Math.floor(s / 7));
    for (let k = 0; k < nw; k++) {
      const u = -s / 2 + (k + 0.5) * s / nw;
      for (const yy of [solid + 5, top - 8]) {
        D.box(x + u - 1, x + u + 1, yy, yy + 3.2, z - s / 2 + 0.5 - 0.15, z - s / 2 + 0.5); D.box(x + u - 1, x + u + 1, yy, yy + 3.2, z + s / 2 - 0.5, z + s / 2 - 0.5 + 0.15);
        D.box(x + s / 2 - 0.5, x + s / 2 - 0.5 + 0.15, yy, yy + 3.2, z + u - 1, z + u + 1); D.box(x - s / 2 + 0.5 - 0.15, x - s / 2 + 0.5, yy, yy + 3.2, z + u - 1, z + u + 1);
      }
    }
  }
  B.geo('ash2', W.geo(), -999); B.geo('ashBig', BIG.geo(), -999); B.geo('dark', D.geo(), -999);
}

/* ───────── Herod's palace (War 5.176–183; plan ⚑) ───────── */
function buildPalace(B, trees) {
  const { x0, x1, z0, z1 } = PALACE, top = 72, A = new Acc(false), R = new Acc(false), M = new Acc(false), Dk = new Acc(false), P = new Acc(false), Wt = new Acc(false);
  const g = (x, z) => terrainH(x, z);
  // the raised court and its enclosure wall (30 cubits from the ground) with towers at equal distances
  A.box(x0, x1, Math.min(g(x0, z0), g(x1, z1), g(x0, z1), g(x1, z0)) - 6, top - 0.3, z0, z1);
  P.box(x0 + 4, x1 - 4, top - 0.3, top, z0 + 4, (z0 + z1) / 2 - 22); P.box(x0 + 4, x1 - 4, top - 0.3, top, (z0 + z1) / 2 + 22, z1 - 4); P.box(x0 + 4, x1 - 4, top - 0.3, top, (z0 + z1) / 2 - 10, (z0 + z1) / 2 + 10); P.box(x0 + 4, x0 + 30, top - 0.3, top, (z0 + z1) / 2 - 22, (z0 + z1) / 2 + 22); P.box(x1 - 30, x1 - 4, top - 0.3, top, (z0 + z1) / 2 - 22, (z0 + z1) / 2 + 22);
  const wt = top + 18;
  for (const [a, b, c, d] of [[x0, x1, z0, z0 + 4], [x0, x1, z1 - 4, z1], [x0, x0 + 4, z0, z1], [x1 - 4, x1, z0, z1]]) A.box(a, b, top, wt, c, d);
  for (let z = z0; z <= z1 + 0.1; z += (z1 - z0) / 5) for (const x of [x0, x1]) A.box(x - 6, x + 6, top, wt + 8, z - 6, z + 6);
  for (let x = x0 + (x1 - x0) / 2; x < x1; x += 200) for (const z of [z0, z1]) A.box(x - 6, x + 6, top, wt + 8, z - 6, z + 6);
  // the two great halls (the "Caesareum" and the "Agrippeum"), their colonnades facing the gardens
  for (const [za, zb, face] of [[z0 + 10, z0 + 70, 1], [z1 - 70, z1 - 10, -1]]) {
    A.box(x0 + 14, x1 - 14, top, top + 26, za, zb);
    A.box(x0 + 12, x1 - 12, top + 26, top + 27.6, za - 2, zb + 2);
    R.box(x0 + 22, x1 - 22, top + 27.6, top + 31, za + 8, zb - 8);
    const zc = face > 0 ? zb : za;
    for (let x = x0 + 18; x <= x1 - 18; x += 7.5) M.box(x - 0.9, x + 0.9, top, top + 16, zc + face * 6 - 0.9, zc + face * 6 + 0.9);
    M.box(x0 + 16, x1 - 16, top + 16, top + 17.4, Math.min(zc, zc + face * 7.5), Math.max(zc, zc + face * 7.5));
    for (let x = x0 + 22; x < x1 - 20; x += 12) Dk.box(x, x + 3.4, top + 3, top + 11, zc - (face > 0 ? 0 : 0.12), zc + (face > 0 ? 0.12 : 0));
  }
  // the gardens between them: two long ponds and groves (the trees go to world.js buildTrees as cypresses)
  const zm = (z0 + z1) / 2;
  for (const dz of [-16, 16]) {
    Wt.box(x0 + 30, x1 - 30, top - 0.3, top + 0.2, zm + dz - 5, zm + dz + 5);
    for (const [a, b, c, d] of [[x0 + 28, x1 - 28, zm + dz - 7, zm + dz - 5], [x0 + 28, x1 - 28, zm + dz + 5, zm + dz + 7], [x0 + 28, x0 + 30, zm + dz - 5, zm + dz + 5], [x1 - 30, x1 - 28, zm + dz - 5, zm + dz + 5]]) P.box(a, b, top - 0.3, top + 0.55, c, d);
  }
  for (let x = x0 + 26; x < x1 - 20; x += 11) for (const z of [zm - 30, zm, zm + 30]) trees.push([x + (z === zm ? 5 : 0), top, z]);
  B.geo('ash', A.geo(), -999); B.geo('roof', R.geo(), -999); B.geo('wmarble', M.geo(), -999); B.geo('dark', Dk.geo(), -999); B.geo('pave', P.geo(), -999); B.geo('water', Wt.geo(), -999);
}

/* ───────── the pools and the streets ───────── */
function buildPools(B) {
  const P = new Acc(false), A = new Acc(false), Wt = new Acc(false), M = new Acc(false), R = new Acc(false);
  // a ring of solid boxes (bottom → y) between the rectangles [X0,X1]×[Z0,Z1] (outer) and inset by w (inner); sides: n e s w
  const ring = (acc, X0, X1, Z0, Z1, w, y0, y1, sides = 'nesw') => {
    if (sides.includes('n')) acc.box(X0, X1, y0, y1, Z0, Z0 + w);
    if (sides.includes('s')) acc.box(X0, X1, y0, y1, Z1 - w, Z1);
    if (sides.includes('w')) acc.box(X0, X0 + w, y0, y1, Z0 + (sides.includes('n') ? w : 0), Z1 - (sides.includes('s') ? w : 0));
    if (sides.includes('e')) acc.box(X1 - w, X1, y0, y1, Z0 + (sides.includes('n') ? w : 0), Z1 - (sides.includes('s') ? w : 0));
  };
  // the Siloam Pool: a paved rim, three flights of five steps with landings on the north, east and west; a dam on the south;
  // a low curb wall round it. Every step is solid down to the pit (the ground under the pool is carved in world.js).
  {
    const { x, z, hw, hd } = SIL, top = SIL.top, rise = 0.5, tread = 1.1, land = 3, bot = SIL.pit - 3;
    const X0 = x - hw, X1 = x + hw, Z0 = z - hd, Z1 = z + hd;
    ring(A, X0 - 4, X1 + 4, Z0 - 4, Z1 + 4, 4, bot, top + 0.7);                 // the retaining wall and its curb
    ring(P, X0, X1, Z0, Z1, 8, bot, top, 'new');                              // the rim
    let y = top, o = 8;
    for (let f = 0; f < 3; f++) {
      for (let st = 0; st < 5; st++) { y -= rise; ring(P, X0 + o, X1 - o, Z0 + o, Z1 - 5, tread, bot, y, 'new'); o += tread; }
      if (f < 2) { ring(P, X0 + o, X1 - o, Z0 + o, Z1 - 5, land, bot, y, 'new'); o += land; }
    }
    A.box(X0, X1, bot, top + 1.2, Z1 - 5, Z1);                                 // the dam
    const w = { x0: X0 + o, x1: X1 - o, z0: Z0 + o, z1: Z1 - 5, y: y - 0.9 };
    Wt.box(w.x0, w.x1, bot, w.y, w.z0, w.z1); SIL.water = w;
  }
  // the Pool of Bethesda: two deep pools in a paved court, a dam between them, porticoes round them and on the dam ⚑
  {
    const { x, z, hw, hd } = BETH, top = BETH.top, X0 = x - hw, X1 = x + hw, Z0 = z - hd, Z1 = z + hd, yw = top - 7, bot = BETH.pit - 3;
    ring(A, X0, X1, Z0, Z1, 12, bot, top - 0.3); A.box(X0 + 12, X1 - 12, bot, top - 0.3, z - 5, z + 5);
    ring(P, X0, X1, Z0, Z1, 12, top - 0.3, top); P.box(X0 + 12, X1 - 12, top - 0.3, top, z - 5, z + 5);
    BETH.water = [];
    for (const [za, zb] of [[Z0 + 12, z - 5], [z + 5, Z1 - 12]]) {
      const w = { x0: X0 + 12, x1: X1 - 12, z0: za, z1: zb, y: yw };
      Wt.box(w.x0, w.x1, bot, w.y, w.z0, w.z1); BETH.water.push(w);
      for (let st = 0; st < 12; st++) P.box(X1 - 20, X1 - 12, bot, top - 0.3 - (st + 1) * 0.55, za + st * 1.1, za + (st + 1) * 1.1);   // a stair down the east side
    }
    const col = (cx, cz) => M.box(cx - 0.8, cx + 0.8, top, top + 10, cz - 0.8, cz + 0.8);
    for (let k = 0; k <= 14; k++) { const xx = X0 + 6 + k * (X1 - X0 - 12) / 14; col(xx, Z0 + 6); col(xx, Z1 - 6); col(xx, z); }
    for (let k = 1; k < 8; k++) { const zz = Z0 + 6 + k * (Z1 - Z0 - 12) / 8; col(X0 + 6, zz); col(X1 - 6, zz); }
    for (const [a, b, c, d] of [[X0, X1, Z0, Z0 + 12], [X0, X1, Z1 - 12, Z1], [X0, X0 + 12, Z0 + 12, Z1 - 12], [X1 - 12, X1, Z0 + 12, Z1 - 12], [X0 + 12, X1 - 12, z - 5, z + 5]]) {
      M.box(a + 0.5, b - 0.5, top + 10, top + 11.2, c + 0.5, d - 0.5); R.box(a + 1, b - 1, top + 11.2, top + 12.6, c + 1, d - 1);
    }
  }
  B.geo('pave', P.geo(), -999); B.geo('ash', A.geo(), -999); B.geo('wmarble', M.geo(), -999); B.geo('roof', R.geo(), -999);
}

// the stepped street: pieces of ~9 amot, each a landing a step below the one before it (going down to Siloam); curbs; the
// street from its foot to the Chuldah stairs; the plaza before the stairs
function buildStreets(B) {
  const P = new Acc(false), C = new Acc(false), W = 14;
  const pieces = [];
  for (let i = 1; i < STEPPED.length; i++) {
    const [ax, az] = STEPPED[i - 1], [bx, bz] = STEPPED[i], len = Math.hypot(bx - ax, bz - az), n = Math.max(1, Math.round(len / 9));
    for (let k = 0; k < n; k++) pieces.push([ax + (bx - ax) * k / n, az + (bz - az) * k / n, ax + (bx - ax) * (k + 1) / n, az + (bz - az) * (k + 1) / n]);
  }
  // levels from the south (the pool's terrace) northward, never lower than the ground under the street
  const lev = new Array(pieces.length), low = new Array(pieces.length);
  for (let i = pieces.length - 1; i >= 0; i--) {
    const [ax, az, bx, bz] = pieces[i], mx = (ax + bx) / 2, mz = (az + bz) / 2, ux = (bz - az), uz = -(bx - ax), L = Math.hypot(ux, uz) || 1;
    let g = -1e9, gl = 1e9;
    for (const s of [-0.6, 0, 0.6]) for (const [px, pz] of [[mx, mz], [ax, az], [bx, bz]]) { const h = terrainH(px + ux / L * W * s, pz + uz / L * W * s); g = Math.max(g, h); gl = Math.min(gl, h); }
    lev[i] = Math.max(g + 0.35, i === pieces.length - 1 ? SIL.top : lev[i + 1]); low[i] = gl - 3;
  }
  pieces.forEach(([ax, az, bx, bz], i) => {
    const y = Math.round(lev[i] / 0.45) * 0.45, dx = bx - ax, dz = bz - az, L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L;
    P.seg(ax - ux * 0.3, az - uz * 0.3, bx + ux * 0.3, bz + uz * 0.3, W, Math.min(y - 2, low[i]), y);
    for (const s of [-1, 1]) C.seg(ax - uz * s * (W / 2 + 0.5), az + ux * s * (W / 2 + 0.5), bx - uz * s * (W / 2 + 0.5), bz + ux * s * (W / 2 + 0.5), 1.2, Math.min(y - 2, low[i]), y + 1.0);
  });
  // from the foot of Robinson's stairs east along the Mount's south wall to the plaza before the Chuldah stairs
  for (let i = 1; i < OPHEL.length; i++) {
    const [ax, az] = OPHEL[i - 1], [bx, bz] = OPHEL[i];
    const y = Math.max(terrainH(ax, az), terrainH(bx, bz), terrainH((ax + bx) / 2, (az + bz) / 2)) + 0.35;
    P.seg(ax, az, bx, bz, 12, y - 6, y);
  }
  P.box(-165, 85, -58, -51.35, 429.5, 472);        // the plaza under the Chuldah stairs (its top meets the last step, -51)
  B.geo('pave', P.geo(), -999); B.geo('ash2', C.geo(), -999);
}

/* ───────── the Xystus: a paved place cut into the Upper City's slope by the causeway, porticoes on three sides ⚑ ───────── */
function buildXystus(B) {
  const { x0, x1, z0, z1, y } = XYSTUS, P = new Acc(false), A = new Acc(false), M = new Acc(false), R = new Acc(false), C = new Acc(false);
  P.box(x0, x1, y - 6, y, z0, z1);
  // retaining walls where the hill was cut away (west, and along the north and south sides as the slope rises)
  A.box(x0 - 6, x0, y - 6, 19.5, z0 - 4, z1 + 4);
  for (let k = 0; k < 4; k++) {
    const xa = x0 + k * (x1 - x0) / 4, xb = x0 + (k + 1) * (x1 - x0) / 4, top = Math.max(terrainH(xa, z0 - 3), terrainH(xa, z1 + 3), y + 1.2) + 1;
    A.box(xa, xb, y - 6, top, z0 - 4, z0); A.box(xa, xb, y - 6, top, z1, z1 + 4);
  }
  // porticoes: columns, an architrave, a roof, on the west, north and south
  const col = (cx, cz) => M.box(cx - 0.75, cx + 0.75, y, y + 10.5, cz - 0.75, cz + 0.75);
  for (let z = z0 + 5; z <= z1 - 4.9; z += 7) col(x0 + 9, z);
  for (let x = x0 + 16; x <= x1 - 4; x += 7) { col(x, z0 + 9); col(x, z1 - 9); }
  for (const [a, b, c, d] of [[x0, x0 + 10, z0, z1], [x0 + 10, x1, z0, z0 + 10], [x0 + 10, x1, z1 - 10, z1]]) {
    M.box(a + (a === x0 ? 8 : 0), b, y + 10.5, y + 11.6, c + (c === z0 && b !== x0 + 10 ? 8 : 0), d - (d === z1 && b !== x0 + 10 ? 8 : 0));
    C.box(a, b, y + 11.6, y + 12.1, c, d); R.box(a + 0.5, b - 0.5, y + 12.1, y + 13.2, c + 0.5, d - 0.5);
  }
  B.geo('pave', P.geo(), -999); B.geo('ash', A.geo(), -999); B.geo('wmarble', M.geo(), -999); B.geo('cedar', C.geo(), -999); B.geo('roof', R.geo(), -999);
}

/* ───────── the Mount of Olives: terraces along the contours, olive rows on them, paths up; the Kidron's monuments ───────── */
// returns the olive positions for world.js buildTrees (rows on the terraces, in groves)
function buildOlivet(B, r) {
  const W = new Acc(false), Pv = new Acc(false), olives = [];
  const find = (L, z) => {   // the x where the western slope crosses the level L at z (the slope rises east from the Kidron)
    let x = 425, h0 = terrainH(x, z);
    for (; x < 1240; x += 10) { const h1 = terrainH(x + 10, z); if (h0 < L && h1 >= L) { let a = x, b = x + 10; for (let k = 0; k < 6; k++) { const m = (a + b) / 2; if (terrainH(m, z) < L) a = m; else b = m; } return (a + b) / 2; } h0 = h1; }
    return null;
  };
  const grove = (x, z) => Math.sin(x * 0.011 + z * 0.004) + Math.sin(z * 0.013 - x * 0.006 + 1.7) > -0.35;
  for (let L = -96; L <= 136; L += 6.5) {
    let prev = null, run = 0;
    for (let z = -1320; z <= 1150; z += 28) {
      const x = find(L, z), cur = x === null ? null : [x, z];
      if (cur && prev && Math.hypot(cur[0] - prev[0], 28) < 70) {
        // terraces only under the groves (open slopes between them; a lit wall on every contour read as a stadium's rows)
        // (world.js buildTrees plants the first 1,500 rows' olives, from the lowest terrace up: no bare terraces above them)
        if (olives.length < 1500 && grove((prev[0] + cur[0]) / 2 + 3.5, (prev[1] + cur[1]) / 2)) W.seg(prev[0], prev[1], cur[0], cur[1], 1.3, L - 2.4, L + 0.6);
        // a row of olives a little above the terrace wall, every ~14 amot, in groves (some terraces are fields)
        const len = Math.hypot(cur[0] - prev[0], cur[1] - prev[1]);
        for (let t = (run % 14) / len; t < 1; t += 14 / len) {
          const ox = prev[0] + (cur[0] - prev[0]) * t + 3.5 + r() * 1.5, oz = prev[1] + (cur[1] - prev[1]) * t + (r() - 0.5) * 3;
          if (grove(ox, oz) && Math.abs(oz) < 1100) olives.push([ox, oz]);
        }
        run += len;
      }
      prev = cur;
    }
  }
  // paths up from the Kidron to the ridge: zigzags of packed stones
  for (const z0 of [-430, 70, 520]) {
    let x = 432, z = z0, k = 0;
    while (x < 1230) {
      const nx = x + 38, nz = z0 + (k % 2 ? -26 : 26), n = 8;
      for (let i = 0; i < n; i++) {   // a ribbon that lies on the slope (a raised box read as a chain of white blocks from afar)
        const ax = x + (nx - x) * i / n, az = z + (nz - z) * i / n, bx = x + (nx - x) * (i + 1) / n, bz = z + (nz - z) * (i + 1) / n;
        const L = Math.hypot(bx - ax, bz - az) || 1, px = -(bz - az) / L * 1.8, pz = (bx - ax) / L * 1.8, y = (u, v) => terrainH(u, v) + 0.35;
        const A = [ax - px, y(ax - px, az - pz), az - pz], Bq = [bx - px, y(bx - px, bz - pz), bz - pz], C = [bx + px, y(bx + px, bz + pz), bz + pz], D = [ax + px, y(ax + px, az + pz), az + pz];
        _a.set(Bq[0] - A[0], Bq[1] - A[1], Bq[2] - A[2]); _b.set(D[0] - A[0], D[1] - A[1], D[2] - A[2]); _n.crossVectors(_a, _b); if (_n.y < 0) _n.negate();
        Pv.quad(A, Bq, C, D, _n.x, _n.y, _n.z);
      }
      x = nx; z = nz; k++;
    }
  }
  B.geo('ashpile', W.geo(), -999); B.geo('pave', Pv.geo(), -999);   // (the terraces: grey dry-stone, not dressed white ashlar)
  // the Kidron's monuments of the period (the names are the tradition's; ⚑ illustration): a pillar with a concave cone,
  // and a cube with a pyramid (the "Tomb of Zechariah")
  { const x = 452, z = 176, g = terrainH(x, z) - 1;
    B.box('ash2', x - 6.5, g, z - 6.5, x + 6.5, g + 13, z + 6.5); B.box('ash2', x - 7.2, g + 13, z - 7.2, x + 7.2, g + 14.2, z + 7.2, -999);
    B.box('ash2', x - 5, g + 14.2, z - 5, x + 5, g + 18, z + 5, -999); B.cyl('ash2', x, g + 18, z, 4.3, 4.3, 3, 14, -999);
    B.cyl('ash2', x, g + 21, z, 0.3, 4.2, 11, 14, -999); B.cyl('ash2', x, g + 32, z, 0.9, 0.3, 1.8, 8, -999); }
  { const x = 447, z = 228, g = terrainH(x, z) - 1;
    B.box('ash2', x - 5.5, g, z - 5.5, x + 5.5, g + 11, z + 5.5); B.box('ash2', x - 6.1, g + 11, z - 6.1, x + 6.1, g + 12.1, z + 6.1, -999);
    B.cyl('ash2', x, g + 12.1, z, 0.01, 8.6, 8.5, 4, -999, undefined, Math.PI / 4); }
  return olives;
}

/* ───────── the houses ───────── */
// archetypes: local x across the street front, z depth (+z = the front: door side), y 0 = the main roof; walls reach down to
// -40 (hidden in the ground: an instance is placed by its roof, so no archetype is ever stretched in height)
function archetypes() {
  const A = {};
  const G = -40;
  // courtyard house: a two-storey back wing, lower side wings and a porch wing, a court, a roof stair, an upper room
  A.court = new Acc(true).k(1)
    .roofed(-10, 10, -10, -4, G, 0).roofed(-10, 10, 5, 10, G, -4.5).roofed(-10, -5, -4, 5, G, -2).roofed(5, 10, -4, 5, G, -4.5)
    .k(0.8, 0.78, 0.74).box(-5, 5, G, -11, -4, 5).k(0.97).box(2.6, 5, G, -7, -3.6, 0.8)
    .k(0.99).box(-9.5, -3.5, 0, 4.2, -9.5, -4.8).hole('z', -4.8, 1, -8, -6.4, 0, 2.8)
    .hole('z', 10, 1, -1.3, 1.3, -11, -7.2).hole('z', -10, -1, -6, -4.8, -3.4, -2.2).hole('z', -10, -1, 3.4, 4.6, -3.4, -2.2).hole('x', -10, -1, -2, -0.8, -6.4, -5.2);
  // block house with a walled yard in front, an outside stair up to the roof, an upper room
  A.block = new Acc(true).k(1)
    .roofed(-10, 10, -10, 1.5, G, 0).k(0.97).box(-10, -9.4, G, -8.6, 1.5, 10).box(9.4, 10, G, -8.6, 1.5, 10).box(-10, -1.8, G, -8.6, 9.4, 10).box(1.8, 10, G, -8.6, 9.4, 10)
    .k(0.8, 0.78, 0.74).box(-9.4, 9.4, G, -11, 1.5, 9.4)
    .k(0.96).box(3, 9.2, G, -8, 1.5, 3.1).box(5, 9.2, G, -4.5, 1.5, 3.1).box(7.2, 9.2, G, -1.5, 1.5, 3.1)
    .k(0.99).box(-9.2, -3.2, 0, 4.2, -9.2, -3.6).hole('z', -3.6, 1, -7.6, -6, 0, 2.8)
    .hole('z', 1.5, 1, -4, -1.6, -11, -7.2).hole('z', -10, -1, -5, -3.8, -3.6, -2.4).hole('z', -10, -1, 3.8, 5, -3.6, -2.4).hole('x', 10, 1, -6, -4.8, -3.6, -2.4);
  // mansion (Upper City; two cells wide): a tall hall, side wings, a porticoed south range, a peristyle court, a roof pavilion
  {
    const m = new Acc(true).k(1).roofed(-20, 20, -10, -2, G, 0).roofed(-20, -12, -2, 10, G, -3).roofed(12, 20, -2, 10, G, -3);
    m.k(1.02).roofed(-12, 12, 6.5, 10, G, -7.5, 0.9, 0.4).k(0.82, 0.8, 0.76).box(-12, 12, G, -13, -2, 6.5);
    m.k(1.04); for (let x = -9; x <= 9.1; x += 6) m.box(x - 0.5, x + 0.5, -13, -7.5, 5.5, 6.5);
    m.box(-12, 12, -7.5, -6.6, -2, -0.6);
    m.k(0.99).roofed(12.5, 19.5, -9.5, -3, 0, 5, 0.9, 0.4).roofed(-19.5, -13, -9.5, -4, 0, 3.8, 0.9, 0.4);
    m.hole('z', 10, 1, -17.5, -15, -13, -8).hole('z', 10, 1, 15, 17.5, -13, -8);
    for (const x of [-16, -8, 0, 8, 16]) m.hole('z', -10, -1, x - 0.7, x + 0.7, -4.4, -2.6).hole('z', -10, -1, x - 0.7, x + 0.7, -10.4, -8.8);
    m.hole('x', -20, -1, 2, 3.4, -9, -7.4).hole('x', 20, 1, 2, 3.4, -9, -7.4).hole('z', -3, 1, 14, 15.6, 0, 3);
    A.mansion = m;
  }
  // a row of three small houses under one roofline, doors to the street
  A.row = new Acc(true).k(1).roofed(-10, -3.4, -10, 6, G, 0).roofed(-3.4, 3.2, -10, 6, G, -1.6).roofed(3.2, 10, -10, 6, G, 1.2)
    .k(0.97).box(4.5, 9, 1.2, 3.8, -9, -4.5)
    .hole('z', 6, 1, -5.6, -4, -10, -6.4).hole('z', 6, 1, -0.6, 1, -10, -6.4).hole('z', 6, 1, 6, 7.6, -10, -6.4)
    .hole('z', 6, 1, 3.8, 5, -4.4, -3.2).hole('z', 6, 1, -8.6, -7.4, -3.4, -2.2).hole('z', -10, -1, -1, 0.2, -4.6, -3.4);
  // far: a plain block with a parapet · an L-house round a court
  A.far = new Acc(true).k(1).block(-9.6, 9.6, -9.6, 9.6, G, 0).hole('z', 9.6, 1, -1.2, 1.2, -10, -6.6);
  A.farL = new Acc(true).k(1).block(-9.6, 9.6, -9.6, 0, G, 0).block(-9.6, 0, 0, 9.6, G, -3.5).k(0.8, 0.78, 0.74).box(0, 9.6, G, -10.5, 0, 9.6);
  // pergola with a vine (on roofs and in courts) · an awning of cloth over a door
  A.pergola = new Acc(true).k(0.42, 0.33, 0.24).box(-2.8, -2.4, 0, 3.4, 1.8, 2.2).box(2.4, 2.8, 0, 3.4, 1.8, 2.2).box(-3, 3, 3.4, 3.7, 1.8, 2.2)
    .k(0.36, 0.52, 0.24).box(-3.3, 3.2, 3.7, 4.3, -2.6, 2.5).k(0.3, 0.46, 0.2).box(-2.4, 1.2, 4.3, 4.8, -1.6, 1.4);
  A.awning = new Acc(true).k(1);
  { const q = (a, b, c, d, n) => A.awning.quad(a, b, c, d, ...n); q([-2.4, 0, 0], [2.4, 0, 0], [2.4, -1.1, 2.6], [-2.4, -1.1, 2.6], [0, 0.92, 0.39]); q([-2.4, 0, 0], [2.4, 0, 0], [2.4, -1.1, 2.6], [-2.4, -1.1, 2.6], [0, -0.92, -0.39]);
    A.awning.k(0.45, 0.36, 0.28).box(-2.35, -2.15, -3.4, -1.1, 2.45, 2.65).box(2.15, 2.35, -3.4, -1.1, 2.45, 2.65); }
  return A;
}

// the regions: bounding box, the test, the grid's angle, cell, block (cells), street width, density, mansions
const REGIONS = [
  { id: 'upper', bb: [-1346, -470, -92, 1410], test: (x, z) => x < -470 && inPoly(FW_POLY, x, z), ang: 0.05, cell: 20, bu: 4, bv: 2, st: 6, dens: 0.93, man: 0.34, tint: 1.03 },
  { id: 'tyro', bb: [-480, -338, -40, 470], test: (x, z) => x >= -470 && z < 470 && inPoly(FW_POLY, x, z), ang: 0.0, cell: 17, bu: 2, bv: 2, st: 5, dens: 0.9, man: 0, tint: 0.99 },
  { id: 'lower', bb: [-480, 300, 470, 1410], test: (x, z) => x >= -470 && z >= 470 && inPoly(FW_POLY, x, z), ang: -0.09, cell: 17, bu: 3, bv: 2, st: 5, dens: 0.9, man: 0.04, tint: 0.97 },
  { id: 'second', bb: [-1080, -300, -640, -20], test: (x, z) => inPoly(SW_POLY, x, z) && !inPoly(FW_POLY, x, z), ang: 0.2, cell: 18, bu: 3, bv: 2, st: 6, dens: 0.9, man: 0.05, tint: 0.99 },
  { id: 'bezetha', bb: [-1350, 445, -1640, -560], test: (x, z) => inPoly(TW_POLY, x, z) && !inPoly(SW_POLY, x, z) && !inPoly(FW_POLY, x, z), ang: -0.1, cell: 20, bu: 3, bv: 2, st: 7, dens: 0.55, man: 0.03, tint: 1.0 },
];
const STONE = ['#E3D3B2', '#D8C39C', '#CDB48A', '#E9DEC6', '#C7A97E', '#D6BD92', '#BD9F75', '#DCC9A4', '#CFBB98', '#C2A583', '#B89A73', '#E0CBA0', '#F2EBDD', '#EFE6D4', '#D9B887', '#CFA873'].map((h) => new THREE.Color(h));
const CLOTH = ['#A8452F', '#C08A3E', '#5E6C83', '#D9CBAE', '#8A5A3C', '#B8663A'].map((h) => new THREE.Color(h));

const DOORS = { court: [0, -7.2, 10], block: [-2.8, -7.2, 1.5], row: [0.2, -6.4, 6], mansion: [-16.2, -8, 10] };   // the street door (local, from the roof)
function buildHouses(scene, r, tex) {
  const L = {}, add = (k, m, c) => (L[k] || (L[k] = [])).push([m, c]);
  const lamps = [], smoke = [], courtTrees = [];
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), o = new THREE.Vector3();
  const place = (x, z, ang, w, d, key, near, reg, allow = true) => {
    const ca = Math.cos(ang), sa = Math.sin(ang), hw = w / 2, hd = d / 2;
    const pts = [[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd], [0, 0]].map(([u, v]) => [x + u * ca + v * sa, z - u * sa + v * ca]);
    if (!allow || !pts.every(([px, pz]) => reg.test(px, pz) && clearOf(px, pz))) return false;
    const hs = pts.map(([px, pz]) => terrainH(px, pz)), lo = Math.min(...hs), hi = Math.max(...hs);
    if (hi - lo > 13) return false;
    const base = key === 'mansion' ? 13 : key === 'row' ? 10 : 11;
    const top = Math.max(hi + 4, (lo + hi) / 2 + base + (r() - 0.35) * 2.2);
    q.setFromAxisAngle(up, ang); p.set(x, top, z); s.set(w / (key === 'mansion' ? 40 : 20), 1, d / 20); M.compose(p, q, s);
    const c = STONE[Math.floor(r() * STONE.length)].clone().multiplyScalar(reg.tint * (0.95 + r() * 0.08));
    add(key, M.clone(), c);
    const loc = (u, y, v) => o.set(u * s.x, y, v * s.z).applyQuaternion(q).add(p);
    const court = key === 'court' ? [0, -11, 0.5] : key === 'block' ? [-5, -11, 5.5] : key === 'mansion' ? [-8, -13, 2] : null;   // the court (the oven)
    if (near && court && r() < 0.2) { loc(court[0], court[1] + 1, court[2]); smoke.push([o.x, o.y, o.z]); }
    if (near && court && r() < 0.22) { loc(court[0] + 1.5, 0, court[2] - 0.5); courtTrees.push([o.x, o.z]); }   // a fig or olive tree in the court
    if (near && court && r() < 0.18) {               // a pergola with a vine: on the roof, or over the court
      const onRoof = r() < 0.45, spot = onRoof ? (key === 'mansion' ? [4, 0, -6] : [5.5, 0, -6.8]) : court;
      loc(spot[0], spot[1], spot[2]); const mm = new THREE.Matrix4().compose(o.clone(), q.clone(), new THREE.Vector3(1, 1, 1)); add('pergola', mm, new THREE.Color(1, 1, 1));
    }
    if (near && (reg.id === 'lower' || reg.id === 'tyro' || r() < 0.3) && r() < 0.22) {   // an awning over the street door
      const door = key === 'court' ? [0, -7.2, 10] : key === 'block' ? [-2.8, -7.2, 1.5] : key === 'row' ? [0.2, -6.4, 6] : key === 'mansion' ? [-16.2, -8, 10] : [0, -6.6, 9.6];
      loc(door[0], door[1] + 0.9, door[2]); const mm = new THREE.Matrix4().compose(o.clone(), q.clone(), new THREE.Vector3(1, 1, 1)); add('awning', mm, CLOTH[Math.floor(r() * CLOTH.length)]);
    }
    if (r() < (near ? 0.42 : 0.22)) { loc((r() - 0.5) * 12, 1.6 + (key === 'mansion' ? 1 : 0), (r() - 0.5) * 12); lamps.push(o.x, o.y, o.z); }
    // a lamp by the street door, about one near house in four (lamps at doors and at shops: Shabbat 21b; Bava Kamma 6:6 — where
    // exactly: illustration); its own hash, so r()'s sequence and the whole layout stay the same
    if (near && DOORS[key] && Math.abs(Math.sin(x * 12.9898 + z * 78.233) * 43758.5453) % 1 < 0.27) { const d = DOORS[key]; loc(d[0] + 2.2, d[1] - 0.6, d[2] + 0.6); lamps.push(o.x, o.y, o.z); }
    return true;
  };
  for (const R of REGIONS) {
    const ca = Math.cos(R.ang), sa = Math.sin(R.ang);
    const [bx0, bx1, bz0, bz1] = R.bb, cs = [[bx0, bz0], [bx1, bz0], [bx1, bz1], [bx0, bz1]].map(([x, z]) => [x * ca - z * sa, x * sa + z * ca]);
    const u0 = Math.min(...cs.map((c) => c[0])), u1 = Math.max(...cs.map((c) => c[0])), v0 = Math.min(...cs.map((c) => c[1])), v1 = Math.max(...cs.map((c) => c[1]));
    // blocks of houses between streets; each column of blocks keeps its own rows, so the cross streets jog (as in old
    // cities); block sizes and street widths vary; every house turns and shifts a little
    const NEAR = 450;
    for (let ub = u0; ub < u1;) {
      const bu = Math.max(1, R.bu + (r() < 0.3 ? -1 : r() < 0.25 ? 1 : 0)), stU = R.st + (r() < 0.18 ? 7 : r() < 0.3 ? -1.5 : 0);
      for (let vb = v0 - r() * R.cell; vb < v1;) {
        const bv = Math.max(1, R.bv + (r() < 0.25 ? 1 : r() < 0.15 ? -1 : 0)), stV = R.st + (r() < 0.18 ? 6 : r() < 0.3 ? -1.5 : 0);
        for (let j = 0; j < bv; j++) for (let i = 0; i < bu; i++) {
          if (r() > R.dens) continue;
          const cu = ub + (i + 0.5) * R.cell + (r() - 0.5) * 1.2, cv = vb + (j + 0.5) * R.cell + (r() - 0.5) * 1.2;
          const x = cu * ca + cv * sa, z = -cu * sa + cv * ca;
          const ang = R.ang + (j === 0 && bv > 1 ? Math.PI : 0) + (r() - 0.5) * 0.06, near = distMount(x, z) < NEAR;
          // a mansion takes two cells of a row (Upper City; more of them on the brow over the Tyropoeon)
          if (near && i + 1 < bu && r() < R.man * (R.id === 'upper' && x > -800 ? 1.5 : 1)) {
            const u2 = ub + (i + 1) * R.cell, x2 = u2 * ca + cv * sa, z2 = -u2 * sa + cv * ca;
            if (place(x2, z2, ang, 2 * R.cell - 0.5, R.cell - 0.4, 'mansion', true, R)) { i++; continue; }
          }
          const low = R.id === 'lower' || R.id === 'tyro', pick = r();
          const key = near ? (low ? (pick < 0.36 ? 'court' : pick < 0.58 ? 'block' : 'row') : (pick < 0.5 ? 'court' : pick < 0.78 ? 'block' : 'row')) : (pick < 0.62 ? 'far' : 'farL');
          place(x, z, ang, R.cell - 0.4, R.cell - 0.4, key, near, R);
        }
        vb += bv * R.cell + stV;
      }
      ub += bu * R.cell + stU;
    }
  }
  // the Upper Market's stalls: awnings round the square, facing in
  {
    const { x0, x1, z0, z1 } = MARKET, M4 = new THREE.Matrix4(), qq = new THREE.Quaternion(), P3 = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
    const stall = (x, z, ang) => { const g = terrainH(x, z); qq.setFromAxisAngle(up, ang); P3.set(x, g + 3.6, z); add('awning', M4.compose(P3, qq, one).clone(), CLOTH[Math.floor(r() * CLOTH.length)]); };
    for (let x = x0 + 5; x < x1 - 3; x += 6.5) { stall(x, z0 + 1, 0); stall(x, z1 - 1, Math.PI); }
    for (let z = z0 + 8; z < z1 - 6; z += 6.5) { stall(x0 + 1, z, Math.PI / 2); stall(x1 - 1, z, -Math.PI / 2); }
  }
  // one instanced mesh per archetype; the material is shared (one program)
  const A = archetypes(), mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.93, vertexColors: true });
  if (tex && tex.map) { mat.map = tex.map; if (tex.normalMap) { mat.normalMap = tex.normalMap; mat.normalScale.set(0.7, 0.7); } }
  const meshes = {};
  for (const [k, list] of Object.entries(L)) {
    const m = new THREE.InstancedMesh(A[k].geo(), mat, list.length);
    list.forEach(([mm, c], i) => { m.setMatrixAt(i, mm); m.setColorAt(i, c); });
    m.castShadow = k !== 'awning'; m.receiveShadow = true; m.frustumCulled = false; m.name = 'city-' + k; m.matrixAutoUpdate = false;
    scene.add(m); meshes[k] = m;
  }
  return { meshes, lamps, smoke, courtTrees, count: Object.fromEntries(Object.entries(L).map(([k, v]) => [k, v.length])) };
}

/* ───────── oven smoke (dawn, dusk): one Points draw call; each column's puffs rise, drift, swell and fade in the shader ───────── */
function buildSmoke(cols) {
  const N = 11, pos = new Float32Array(cols.length * N * 3), seed = new Float32Array(cols.length * N);
  cols.forEach(([x, y, z], i) => { const s0 = (i * 0.618) % 1; for (let k = 0; k < N; k++) { pos.set([x, y, z], (i * N + k) * 3); seed[i * N + k] = (s0 + k / N) % 1; } });
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(pos, 3)); g.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
  const U = { uTime: { value: 0 }, uScale: { value: 1400 }, uCol: { value: new THREE.Color('#D8D0C6') }, uOp: { value: 0.3 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, fog: false,
    vertexShader: `attribute float aSeed; uniform float uTime, uScale; varying float vA;
      void main() {
        float life = fract(uTime * 0.035 + aSeed);
        vec3 p = position + vec3(life * 26.0 + sin(aSeed * 31.0 + uTime * 0.4) * life * 3.0, life * 44.0, life * 9.0);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = (4.0 + life * 17.0) * uScale / max(-mv.z, 1.0);
        vA = smoothstep(0.0, 0.1, life) * (1.0 - smoothstep(0.35, 1.0, life)) * smoothstep(4200.0, 700.0, -mv.z);
      }`,
    fragmentShader: `uniform vec3 uCol; uniform float uOp; varying float vA;
      void main() { vec2 q = gl_PointCoord - 0.5; float a = 1.0 - dot(q, q) * 4.0; if (a <= 0.0) discard; gl_FragColor = vec4(uCol, a * a * vA * uOp); }`,
  });
  const pts = new THREE.Points(g, mat); pts.frustumCulled = false; pts.renderOrder = 2; pts.name = 'city-smoke';
  return { pts, U };
}

/* ───────── the city ───────── */
/**
 * buildJerusalem(scene, B, P, opts) — call where world.js buildCity was called (main.js boot, Batch stage '_').
 * opts.water: a guarded factory (WATER's waterMaterial) for the pools' water; else the Batch's 'water'.
 * Returns { lampGeo, trees, update(dt, camera), setTime(k), landmarks, stats }.
 */
export function buildJerusalem(scene, B, P, opts = {}) {
  const r = rng(6061);
  // the ground inside the walls (and in Bezetha) is the city's dust, not grass
  setCityMask((x, z) => (inPoly(FW_POLY, x, z) || inPoly(TW_POLY, x, z)) && !rect([BETH.x - BETH.hw, BETH.x + BETH.hw, BETH.z - BETH.hd, BETH.z + BETH.hd], x, z, 20) ? 1 : 0);
  SIL.top = -86; SIL.pit = -97; BETH.top = 3; BETH.pit = -12;
  buildWalls(B);
  const trees = [];
  buildPalace(B, trees);
  buildPools(B);
  // the pools' water: one mesh of flat planes (with uv); a deep green-grey stone-pool water (not the blue of a swimming pool)
  // until WATER's waterMaterial() lands (same program as any plain MeshStandardMaterial)
  const water = new THREE.Mesh(mergePlanes([SIL.water, ...BETH.water]), opts.waterMat || new THREE.MeshStandardMaterial({ color: '#3D6770', roughness: 0.08, metalness: 0.1, envMapIntensity: 1.2 }));
  water.receiveShadow = true; water.matrixAutoUpdate = false; water.name = 'city-pools'; scene.add(water);
  buildStreets(B);
  buildXystus(B);
  const olives = buildOlivet(B, r);
  const H = buildHouses(scene, r, opts.houseTex);
  { const { x0, x1, z0, z1 } = MARKET, g = (x, z) => terrainH(x, z) + 0.45; B.slab('pave', [[x0, g(x0, z0), z0], [x0, g(x0, z1), z1], [x1, g(x1, z1), z1], [x1, g(x1, z0), z0]], 4); }
  const sm = buildSmoke(H.smoke.slice(0, 48)); scene.add(sm.pts);
  // lamps also along the stepped street (both curbs, every ~22 amot) and at the gates and Herod's towers
  for (let i = 1; i < STEPPED.length; i++) {
    const [ax, az] = STEPPED[i - 1], [bx, bz] = STEPPED[i], L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L;
    for (let d = 11; d < L; d += 22) { const x = ax + ux * d, z = az + uz * d, sd = (Math.floor(d / 22) % 2 ? 1 : -1) * 7.6; H.lamps.push(x - uz * sd, terrainH(x - uz * sd, z + ux * sd) + 3.4, z + ux * sd); }
  }
  for (const [x, z, s, h] of Object.values(TOWERS)) { const g = terrainH(x, z); for (const k of [0.45, 0.8]) H.lamps.push(x + s / 2 + 0.6, g + h * k, z); }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(H.lamps, 3));
  if (P) {
    const pk = (id, x, z, hw, hd, y0, y1) => P(id, x - hw, y0, z - hd, x + hw, y1, z + hd);
    for (const [id, [x, z, s, h]] of Object.entries(TOWERS)) { const g = terrainH(x, z); pk('tower_' + id, x, z, s / 2 + 1, s / 2 + 1, g - 4, g + h); }
    pk('herod_palace', -1265, 272, 65, 128, 55, 100);
    pk('siloam_pool', SIL.x, SIL.z, SIL.hw, SIL.hd, SIL.top - 12, SIL.top + 3);
    pk('bethesda', BETH.x, BETH.z, BETH.hw, BETH.hd, BETH.top - 10, BETH.top + 13);
    pk('kidron', 450, 202, 12, 36, terrainH(450, 202) - 4, terrainH(450, 202) + 34);
    pk('xystus', (XYSTUS.x0 + XYSTUS.x1) / 2, (XYSTUS.z0 + XYSTUS.z1) / 2, 40, 42, XYSTUS.y - 1, XYSTUS.y + 14);
    // long things get a row of small boxes (a tap anywhere along them; never one huge box a camera could sit inside)
    const along = (id, L, every, hw, dy0, dy1) => {
      for (let i = 1; i < L.length; i++) {
        const [ax, az] = L[i - 1], [bx, bz] = L[i], n = Math.max(1, Math.round(Math.hypot(bx - ax, bz - az) / every));
        for (let k = 0; k < n; k++) { const x = ax + (bx - ax) * (k + 0.5) / n, z = az + (bz - az) * (k + 0.5) / n, g = terrainH(x, z); pk(id, x, z, hw, hw, g + dy0, g + dy1); }
      }
    };
    along('stepped_street', STEPPED, 40, 9, -3, 4);
    along('first_wall', FIRST_N, 60, 7, -2, 26); along('first_wall', FIRST_S.slice(2), 60, 7, -2, 26);
    along('second_wall', SECOND, 60, 7, -2, 26); along('third_wall', THIRD.slice(1), 70, 7, -2, 26);
  }
  let t = 0, smokeOn = true;
  return {
    lampGeo: lg, trees, olives, courtTrees: H.courtTrees, landmarks: LANDMARKS, meshes: H.meshes, stats: H.count, smoke: sm.pts, water,
    /** the pools' water material (WATER's waterMaterial(), guarded by the caller); returns true when set */
    setWaterMaterial(m) { if (!m || !m.isMaterial) return false; water.material = m; return true; },
    update(dt, camera) {
      t += dt; sm.U.uTime.value = t;
      if (camera && smokeOn) sm.U.uScale.value = (innerHeight * Math.min(devicePixelRatio || 1, 1.5)) / 2 / Math.tan(THREE.MathUtils.degToRad(camera.fov) / 2);
    },
    setTime(k) {
      smokeOn = k === 'dawn' || k === 'dusk' || k === 'golden'; sm.pts.visible = smokeOn;   // (world7: the morning ovens in the golden hour too)
      sm.U.uCol.value.set(k === 'dusk' ? '#CDBBAE' : '#DCD4CB'); sm.U.uOp.value = k === 'dusk' ? 0.2 : 0.18;
    },
  };
}

/** named beauty cameras: { p, t, time, he } — `__T.beauty(name)` flies there and sets the time */
export const BEAUTY = {
  // (polar: the shot may look a little up, past the game's own camera limit; the sun rises in the east-south-east)
  olivesDawn: { p: [250, 70, 160], t: [1096, 110, 468], polar: 1.7, time: 'dawn', he: 'שחר מעל הר הזיתים' },
  templeFromOlives: { p: [900, 330, -250], t: [-150, -10, 40], time: 'dawn', he: 'המקדש מהר הזיתים בבוקר' },
  heichalSunrise: { p: [140, 90, 60], t: [-110, 60, 0], polar: 1.5, time: 'dawn', he: 'ההיכל בזריחה — כהר מכוסה שלג' },
  cityDusk: { p: [-150, 260, 1150], t: [-800, 20, 150], time: 'dusk', he: 'העיר בין הערביים' },
  plazaNoon: { p: [250, 150, 460], t: [-70, 16, 40], time: 'noon', he: 'רחבת הר הבית בצהריים' },
  kidronNight: { p: [720, 30, 40], t: [270, 12, 5], polar: 1.75, time: 'night', he: 'נחל קדרון בלילה' },
  // ── world7 ── the opening vision (the game's first frame, main.js runVision): the finished House over the Old City at the
  // golden hour from over the Kidron, the Upper City's roofs, the First Wall and Herod's towers behind it; p → p2 = the slow
  // push-in, `down` = the same view after the veil (the bare Mount among the city), `end` = over the rough hill, before the
  // game's own camera takes the first boulder
  vision: { p: [740, 280, 200], p2: [612, 249, 171], t: [-110, 72, 5], time: 'golden', he: 'חזון הבית — מעל העיר העתיקה', down: { p: [612, 249, 171], t: [-110, 72, 5] }, end: { p: [224, 66, -39], t: [128, 9.5, -84] } },   // (end: the first boulder at 120 amot on the game's own bearing — the hero ≈ 45 px tall on a phone)
  siloamDawn: { p: [-300, -30, 1135], t: [-324, -92, 1330], time: 'dawn', he: 'בריכת השילוח והרחוב המדורג' },
};
