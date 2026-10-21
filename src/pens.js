// pens.js — the animal pens ("דיר"): dry-stone folds outside the Temple Mount, north of the platform, where the
// flocks and the herds wait (illustration: the sheep market and the Sheep Gate were north of the Mount — Nehemiah 3:1,
// 3:32; the Mishnah gives no plan). Fields, troughs, a shelter, hay, the dove sellers' stalls with wicker cages; the
// animals themselves live in animals.js (fill(n)), the shepherds and sellers are actors placed by avodah3d.js.
// Also the lambs' chamber in Beit HaMoked (Middot 1:6; Tamid 3:3): six checked lambs always waiting (Arachin 2:5) —
// the room itself (walls, stalls, trough) is the Sanctuary agent's; here only the lambs and a little hay.
// All static geometry is merged into one mesh per site with the rig material (vertex colours, per-vertex roughness),
// so the whole fold complex is ONE draw call and is frustum-culled as a whole. 1 unit = 1 amah.
import * as THREE from 'three';
import { rigPart, rigMaterial, merge, box, cyl, sph } from './animals.js';
import { terrainH } from './world.js';
import { PENS, LAMBS_CHAMBER } from './places.js';
import { rng } from './util.js';

const STATIC_POSE = 'void rigPose(out mat3 R, out vec3 T){ R = mat3(1.0); T = vec3(0.0); }';
let _staticMat = null;
export const staticMaterial = () => _staticMat || (_staticMat = rigMaterial('static', STATIC_POSE));

const STONE = ['#D3C7AC', '#C9BC9F', '#DCD1B9', '#BFB194', '#D7CCB3', '#C4B698'];
const P = rigPart;

/** the pens: returns { mesh, folds, people, fill(n), get count, chamber: { count(n) } } */
export function buildPens(scene, animals) {
  const r = rng(5150);
  const parts = [];
  const { x0, x1, z0, z1 } = PENS;
  const H = (x, z) => terrainH(x, z);

  // a dry-stone wall: three courses of rough blocks and a row of capstones following the ground
  function wall(ax, az, bx, bz, gaps = []) {
    const L = Math.hypot(bx - ax, bz - az), ux = (bx - ax) / L, uz = (bz - az) / L, yaw = Math.atan2(uz, ux);
    for (let c = 0; c < 3; c++) {
      let s = c % 2 ? -0.6 : 0;
      while (s < L) {
        const len = 1.3 + r() * 0.9, m = Math.min(L, s + len), mid = (Math.max(0, s) + m) / 2;
        if (m - Math.max(0, s) > 0.3 && !gaps.some(([g0, g1]) => mid > g0 && mid < g1)) {
          const x = ax + ux * mid, z = az + uz * mid, y = H(x, z) + 0.28 + c * 0.5 - 0.15;
          const g = box(m - Math.max(0, s) - 0.08, 0.5 + r() * 0.08, 1.0 - c * 0.12 + r() * 0.1, [0, 0, 0], [0, -yaw + (r() - 0.5) * 0.06, (r() - 0.5) * 0.05]).translate(x, y, z);
          parts.push(P(g, STONE[Math.floor(r() * STONE.length)], 0, { rough: 0.95 }));
        }
        s += len;
      }
    }
    // capstones
    for (let s = 0.4; s < L - 0.3; s += 1.1 + r() * 0.4) {
      if (gaps.some(([g0, g1]) => s > g0 - 0.4 && s < g1 + 0.4)) continue;
      const x = ax + ux * s, z = az + uz * s;
      parts.push(P(sph(0.45, [x, H(x, z) + 1.62, z], [1.2, 0.55, 1], 6, 4), STONE[Math.floor(r() * STONE.length)], 0, { rough: 1 }));
    }
  }
  const gapAt = (a, w = 3) => [[a - w / 2, a + w / 2]];
  // outer wall with the entrance on the south, toward the Mount
  const ENT = 85;
  wall(x0, z0, x1, z0); wall(x1, z0, x1, z1); wall(x0, z1, x1, z1, gapAt(ENT - x0, 10)); wall(x0, z0, x0, z1);
  // the main aisle runs north from the entrance (x 79–91); folds on either side, a lane across at z −540…−535
  const folds = [
    { id: 'sheepA', x0: 20.5, x1: 48, z0: -569.5, z1: -540, kinds: ['lamb', 'lamb', 'lamb', 'ram'] },
    { id: 'sheepB', x0: 48, x1: 79, z0: -569.5, z1: -540, kinds: ['lamb', 'lamb', 'lamb', 'lamb', 'ram'] },
    { id: 'goats', x0: 20.5, x1: 48, z0: -535, z1: -505.5, kinds: ['goat'] },
    { id: 'sheepC', x0: 48, x1: 79, z0: -535, z1: -505.5, kinds: ['lamb', 'lamb', 'goat'] },
    { id: 'bulls', x0: 91, x1: 121, z0: -569.5, z1: -538, kinds: ['bull', 'bull', 'calf'] },
    { id: 'rams', x0: 121, x1: 149.5, z0: -569.5, z1: -538, kinds: ['ram', 'lamb', 'calf'] },
  ];
  // fold walls (x 48 splits the west block; the lane is walled on both sides; x 91 and x 121 on the east)
  wall(48, z0, 48, -540, gapAt(27, 3)); wall(48, -535, 48, z1, gapAt(3, 3));
  wall(x0, -540, 79, -540, gapAt(62 - x0, 3)); wall(x0, -535, 79, -535, gapAt(62 - x0, 3));
  wall(79, z0, 79, -545, []); wall(79, -545, 79, -540, gapAt(2.5, 3)); wall(79, -535, 79, z1, gapAt(14, 3));
  wall(91, z0, 91, -538, gapAt(20, 3.2)); wall(91, -538, x1, -538, []);
  wall(121, z0, 121, -538, gapAt(16, 3));
  // trampled earth and straw inside the walls, following the slope
  {
    const NX = 26, NZ = 13, g = new THREE.PlaneGeometry(x1 - x0, z1 - z0, NX, NZ).rotateX(-Math.PI / 2).translate((x0 + x1) / 2, 0, (z0 + z1) / 2);
    const p = g.attributes.position;
    for (let i = 0; i < p.count; i++) p.setY(i, H(p.getX(i), p.getZ(i)) + 0.1);
    g.computeVertexNormals();
    parts.push(P(g, '#B8A27B', 0, { rough: 1, fn: (x, y, z, c) => { const n = Math.sin(x * 0.37 + z * 0.21) * Math.sin(x * 0.13 - z * 0.29); c.offsetHSL(0, -0.03 * n, 0.05 * n); } }));
  }
  // water troughs (hewn stone with a water surface)
  const spots = { water: [], hay: [] };   // ── service13 ── where the flock comes when the pens are tended (tend(), wave 13)
  const trough = (x, z, len, yaw) => {
    const y = H(x, z);
    spots.water.push([x, z]);
    parts.push(P(box(len, 0.8, 1.3, [0, 0, 0], [0, yaw, 0]).translate(x, y + 0.4, z), '#C2B393', 0, { rough: 0.9 }));
    parts.push(P(box(len - 0.3, 0.05, 0.9, [0, 0, 0], [0, yaw, 0]).translate(x, y + 0.76, z), '#5E8DA8', 0, { rough: 0.08, metal: 0.1 }));
  };
  trough(34, -566.5, 8, 0); trough(63, -566.5, 9, 0); trough(34, -508.5, 8, 0); trough(63, -508.5, 8, 0);
  trough(106, -566.5, 10, 0); trough(135, -566.5, 9, 0); trough(85, -552, 7, Math.PI / 2);
  // hay and fodder heaps
  for (const f of folds) for (let k = 0; k < 2; k++) {
    const x = f.x0 + 4 + r() * (f.x1 - f.x0 - 8), z = f.z0 + 5 + r() * (f.z1 - f.z0 - 10);
    spots.hay.push([x, z]);
    parts.push(P(sph(1.6, [x, H(x, z) + 0.1, z], [1.4, 0.45, 1.1], 8, 5), '#D9B45C', 0, { rough: 1, fn: (xx, y, zz, c) => { c.offsetHSL(0, 0, Math.sin(xx * 9 + zz * 7) * 0.05); } }));
  }
  // a timber shelter over the north of the bulls' fold
  {
    const bx0 = 92, bx1 = 120, bz0 = -569, bz1 = -561, yb = H(106, -565) + 0.1;
    for (const x of [93, 106, 119]) for (const z of [-568.5, -561.5]) parts.push(P(cyl(0.22, 0.2, 4.2 + (z > -565 ? 0 : 0.8), [x, yb, z], 6), '#7A5A3C', 0, { rough: 0.9 }));
    const g = new THREE.BoxGeometry(bx1 - bx0 + 1.5, 0.35, bz1 - bz0 + 2).rotateX(-0.1).translate((bx0 + bx1) / 2, yb + 4.75, (bz0 + bz1) / 2);
    parts.push(P(g, '#A0764C', 0, { rough: 0.95, fn: (x, y, z, c) => { if (Math.floor(x * 1.6) % 2) c.offsetHSL(0, 0, -0.05); } }));
  }
  // the dove sellers' stalls by the entrance: trestle tables with wicker cages
  const sellers = [], cages = [];
  // (in the open east yard by the entrance: x 91–150, z −538…−505)
  for (const [sx, sz] of [[99, -512], [99, -525], [113, -514]]) {
    const y = H(sx, sz);
    parts.push(P(box(2.2, 0.15, 5, [sx, y + 1.35, sz]), '#8C6A43', 0, { rough: 0.85 }));
    for (const [dx, dz] of [[-0.9, -2.2], [0.9, -2.2], [-0.9, 2.2], [0.9, 2.2]]) parts.push(P(cyl(0.08, 0.08, 1.3, [sx + dx, y, sz + dz], 5), '#6E5234', 0));
    for (const dz of [-1.5, 0, 1.5]) {
      const cx = sx, cz = sz + dz, cy = y + 1.43;
      cages.push([cx, cy, cz]);
      // a wicker cage: a base, bent withies and a lid
      parts.push(P(cyl(0.55, 0.55, 0.08, [cx, cy, cz], 10), '#B98F52', 0, { rough: 0.95 }));
      for (let k = 0; k < 8; k++) { const a = k / 8 * Math.PI * 2; parts.push(P(cyl(0.025, 0.025, 0.72, [cx + Math.cos(a) * 0.52, cy, cz + Math.sin(a) * 0.52], 3), '#A87E45', 0)); }
      parts.push(P(new THREE.TorusGeometry(0.52, 0.035, 4, 14).rotateX(Math.PI / 2).translate(cx, cy + 0.36, cz), '#B98F52', 0));
      parts.push(P(sph(0.55, [cx, cy + 0.72, cz], [1, 0.35, 1], 10, 4, null).translate(0, 0, 0), '#C49A5C', 0, { rough: 1 }));
    }
    sellers.push({ x: sx + 1.9, z: sz, yaw: -Math.PI / 2, role: "seller" });
  }
  /* ── the animal market (wave 4, QA P2-13; illustration: Shekalim 7:2 speaks of the money found before the animal
     dealers in Jerusalem, "לפני סוחרי בהמה"; where they stood is not told): in the east yard by the entrance, three dealers'
     stalls — a striped awning on four poles, a trestle table with a money box and a balance — each beside a small
     roped pen where the animals for sale stand, and a trough; the dealers and their buyers are actors (avodah3d.js) ── */
  const market = [];
  const AWN = [['#B3452E', '#EEDFC0'], ['#3F6E8C', '#EEDFC0'], ['#7A8A3A', '#EEDFC0']];
  [[126, -514.5, 0], [140, -514.5, 1], [133, -529, 2]].forEach(([sx, sz, k]) => {
    const y = H(sx, sz);
    // the awning: four poles and a striped cloth sloping to the front (south)
    for (const [dx, dz, hh] of [[-2.4, -1.8, 3.3], [2.4, -1.8, 3.3], [-2.4, 1.8, 2.7], [2.4, 1.8, 2.7]]) parts.push(P(cyl(0.09, 0.08, hh, [sx + dx, y, sz + dz], 5), '#6E5234', 0, { rough: 0.9 }));
    for (let st = 0; st < 6; st++) {
      const x = sx - 2.6 + (st + 0.5) * (5.2 / 6);
      parts.push(P(box(5.2 / 6 + 0.01, 0.06, 4.1, [x, y + 3.02, sz], [0.15, 0, 0]), AWN[k][st % 2], 0, { rough: 0.95 }));
    }
    parts.push(P(box(5.3, 0.4, 0.05, [sx, y + 2.62, sz + 2.05]), AWN[k][0], 0, { rough: 0.95 }));   // the valance
    // the dealer's table: a money box and a balance
    parts.push(P(box(3.2, 0.14, 1.1, [sx, y + 1.18, sz - 0.6]), '#8C6A43', 0, { rough: 0.85 }));
    for (const [dx, dz] of [[-1.4, -1.05], [1.4, -1.05], [-1.4, -0.15], [1.4, -0.15]]) parts.push(P(cyl(0.07, 0.07, 1.12, [sx + dx, y, sz + dz], 5), '#6E5234', 0));
    parts.push(P(box(0.6, 0.35, 0.42, [sx - 0.8, y + 1.43, sz - 0.6]), '#5C4128', 0, { rough: 0.8 }));
    parts.push(P(cyl(0.04, 0.04, 0.7, [sx + 0.7, y + 1.25, sz - 0.6], 5), '#8A6A2A', 0, { metal: 0.6, rough: 0.4 }));
    parts.push(P(box(0.8, 0.04, 0.05, [sx + 0.7, y + 1.95, sz - 0.6]), '#8A6A2A', 0, { metal: 0.6, rough: 0.4 }));
    for (const s of [-1, 1]) parts.push(P(cyl(0.18, 0.2, 0.05, [sx + 0.7 + s * 0.38, y + 1.62, sz - 0.6], 8), '#A8843A', 0, { metal: 0.6, rough: 0.35 }));
    for (let c = 0; c < 5; c++) parts.push(P(cyl(0.07, 0.07, 0.025, [sx - 0.2 + c * 0.13, y + 1.25, sz - 0.9 + (c % 2) * 0.12], 7), '#C9A650', 0, { metal: 0.7, rough: 0.3 }));
    // the roped pen beside it (to the east or the west), stakes and a rope, a little trough and straw
    const px = sx + (k === 1 ? -0.2 : 0) + (k === 2 ? 5.6 : 0), pz = sz + (k === 2 ? 0 : 5.2), pw = 4.6, pd = 3.6;
    for (const [fx, fz] of [[-1, -1], [0, -1], [1, -1], [-1, 1], [0, 1], [1, 1]]) {
      const x = px + fx * pw / 2, z = pz + fz * pd / 2;
      parts.push(P(cyl(0.06, 0.05, 1.1, [x, H(x, z), z], 5), '#7A5A3C', 0, { rough: 0.9 }));
    }
    for (const [ax, az, bx, bz] of [[px - pw / 2, pz - pd / 2, px + pw / 2, pz - pd / 2], [px - pw / 2, pz + pd / 2, px + pw / 2, pz + pd / 2], [px - pw / 2, pz - pd / 2, px - pw / 2, pz + pd / 2], [px + pw / 2, pz - pd / 2, px + pw / 2, pz + pd / 2]]) {
      const L = Math.hypot(bx - ax, bz - az), g = new THREE.CylinderGeometry(0.03, 0.03, L, 4).rotateZ(Math.PI / 2).rotateY(-Math.atan2(bz - az, bx - ax));
      parts.push(P(g.translate((ax + bx) / 2, H(ax, az) + 0.95, (az + bz) / 2), '#C9B28A', 0, { rough: 1 }));
    }
    parts.push(P(box(1.8, 0.45, 0.6, [px, H(px, pz) + 0.22, pz + pd / 2 - 0.5]), '#B7A686', 0, { rough: 0.9 }));
    parts.push(P(sph(0.9, [px - 1.2, H(px, pz) + 0.05, pz - 0.6], [1.3, 0.35, 1], 8, 4), '#D9B45C', 0, { rough: 1 }));
    market.push({ id: 'market' + k, x0: px - pw / 2 + 0.5, x1: px + pw / 2 - 0.5, z0: pz - pd / 2 + 0.5, z1: pz + pd / 2 - 0.5, kinds: [['lamb', 'lamb', 'ram'], ['goat', 'lamb', 'calf'], ['lamb', 'calf', 'goat']][k], small: true });
    sellers.push({ x: sx, z: sz - 1.5, yaw: Math.PI, role: 'dealer' });
  });
  folds.push(...market);

  const g = merge(parts);
  const mesh = new THREE.Mesh(g, staticMaterial());
  mesh.name = 'pens'; mesh.receiveShadow = true; mesh.matrixAutoUpdate = false;
  scene.add(mesh);

  // shepherds in the aisle and in the folds (actors are placed by avodah3d.js)
  const people = [
    ...sellers,
    // buyers at the dealers' stalls and at their pens (illustration)
    { x: 125.2, z: -516.6, yaw: 0.2, role: 'buyer' }, { x: 141.3, z: -516.8, yaw: -0.3, role: 'buyer' }, { x: 136.2, z: -531.4, yaw: 1.4, role: 'buyer' }, { x: 128.4, z: -508.2, yaw: 2.9, role: 'buyer' },
    { x: 85, z: -520, yaw: 0.3, role: 'shepherd' }, { x: 62, z: -548, yaw: -2.4, role: 'shepherd' }, { x: 105, z: -545, yaw: 2.8, role: 'shepherd' },
    { x: 34, z: -520, yaw: 1.2, role: 'shepherd' }, { x: 86, z: -560, yaw: 3.1, role: 'shepherd' },
  ];

  /* ── animals: fill(n) spreads n over the folds; doves sit in the cages ── */
  const herd = [];
  const pick = (f, k) => f.kinds[k % f.kinds.length];
  function fill(n) {
    if (!isFinite(Number(n))) return herd.length;
    n = Math.max(0, Math.min(150, Math.round(Number(n))));
    while (herd.length > n) animals.remove(herd.pop());
    while (herd.length < n) {
      const k = herd.length, f = folds[k % folds.length], kind = pick(f, Math.floor(k / folds.length));
      const m = f.small ? 0 : kind === 'bull' ? 4 : 2;
      // (wave 4, QA P2-13: each fold's animals keep together as a flock — grazing round a spot of their own, about a third of
      //  the fold — so a fold reads as a flock, not a few animals scattered over an empty yard; the market's small pens: all of it)
      if (!f.flock) { const fx = f.small ? 0.5 : 0.3 + r() * 0.4, fz = f.small ? 0.5 : 0.3 + r() * 0.4, k2 = f.small ? 0.5 : 0.2; f.flock = { cx: f.x0 + (f.x1 - f.x0) * fx, cz: f.z0 + (f.z1 - f.z0) * fz, hx: (f.x1 - f.x0) * k2, hz: (f.z1 - f.z0) * k2 }; }
      const F = f.flock, x0 = Math.max(f.x0 + m, F.cx - F.hx), x1 = Math.min(f.x1 - m, F.cx + F.hx), z0 = Math.max(f.z0 + m, F.cz - F.hz), z1 = Math.min(f.z1 - m, F.cz + F.hz);
      const x = x0 + r() * (x1 - x0), z = z0 + r() * (z1 - z0);
      herd.push(animals.add(kind, x, z, { ground: H, graze: true, wander: { x0, x1, z0, z1 } }));
    }
    // the doves (two in each cage while the pens are open)
    const want = n > 0 ? cages.length * 2 : 0;
    while (doves.length > want) animals.remove(doves.pop());
    while (doves.length < want) {
      const c = cages[Math.floor(doves.length / 2)], s = doves.length % 2 ? 1 : -1;
      doves.push(animals.add(doves.length % 4 < 2 ? 'dove' : 'turtledove', c[0] + s * 0.2, c[2] + s * 0.1, { y: c[1] + 0.08, yaw: r() * 6.28, calm: true, scale: 0.95 }));
    }
    return herd.length;
  }
  const doves = [];
  /* ── service13 ── the pens tended (Phase B's "הדיר ולשכת הטלאים", wave 13): when the player fills the troughs ('water') or
   * gives the hay ('hay'), each animal of the folds walks to the nearest trough or heap (on its own side of it), stands a
   * while, and goes back to grazing in its flock (its wander box brings it home). → how many came. */
  function tend(kind = 'water') {
    const S = spots[kind === 'hay' ? 'hay' : 'water'];
    let n = 0;
    for (const h of herd) {
      if (!h || !h.alive || h.held) continue;
      let best = null, bd = 1e9;
      for (const q of S) { const d = Math.hypot(q[0] - h.x, q[1] - h.z); if (d < bd) { bd = d; best = q; } }
      if (!best || bd > 34) continue;
      const ux = (h.x - best[0]) / (bd || 1), uz = (h.z - best[1]) / (bd || 1), side = (r() - 0.5) * 5;
      const to = [best[0] + ux * 1.9 - uz * side, best[1] + uz * 1.9 + ux * side];
      animals.walk(h, [to], null).then((ok) => { if (!ok) return; h.face = best; setTimeout(() => { if (h.face === best) h.face = null; }, 9000); });
      n++;
    }
    return n;
  }

  return { mesh, folds, people, cages, fill, tend, get count() { return herd.length; }, herd };
}

/** the six lambs of the lambs' chamber (Arachin 2:5), placed inside LAMBS_CHAMBER, with a little hay */
export function buildLambsChamber(scene, animals, ground) {
  const { x0, x1, z0, z1, floor } = LAMBS_CHAMBER;
  const r = rng(606);
  const parts = [];
  // hay that reads as hay (wave 4, QA P2-7): straw-coloured heaps in the corners, their surface bristling with loose stalks,
  // a long fill of hay in the manger along the west wall, and stalks strewn on the floor round the heaps (all one mesh)
  const STRAW = ['#E2C372', '#D6B25A', '#EBD597', '#C99E45', '#DDBB66'];
  const strawOn = (cx, cy, cz, rx, rz, h, n) => {
    for (let k = 0; k < n; k++) {
      const a = r() * Math.PI * 2, u = Math.sqrt(r()), x = cx + Math.cos(a) * rx * u, z = cz + Math.sin(a) * rz * u;
      const y = cy + h * Math.max(0, 1 - u * u) + 0.02, len = 0.45 + r() * 0.55;
      parts.push(P(box(len, 0.035, 0.05, [0, 0, 0], [0, r() * Math.PI, (r() - 0.5) * 0.7]).translate(x, y, z), STRAW[Math.floor(r() * STRAW.length)], 0, { rough: 1, emit: 0.06 }));
    }
  };
  const heap = (x, z, rx, rz, h) => {
    parts.push(P(sph(1, [x, floor + 0.02, z], [rx, h, rz], 10, 5), '#D9B45C', 0, { rough: 1, emit: 0.05, fn: (xx, y, zz, c) => { c.offsetHSL(0.005 * Math.sin(xx * 7), 0.04 * Math.sin(xx * 5 + zz * 3), 0.06 * Math.sin(xx * 11 + zz * 9) - 0.07 * Math.max(0, 0.25 - (y - floor)) * 4); } }));
    strawOn(x, floor, z, rx * 0.95, rz * 0.95, h, 34);
    strawOn(x, floor - 0.02, z, rx * 1.6, rz * 1.6, 0.0, 16);   // strewn round it
  };
  for (const [x, z, rx, rz, h] of [[x0 + 1.9, z0 + 1.6, 1.5, 1.2, 0.62], [x0 + 1.8, z1 - 1.7, 1.4, 1.2, 0.55], [x1 - 1.5, z0 + 1.6, 1.3, 1.1, 0.5], [x1 - 1.5, z1 - 1.4, 1.2, 1.0, 0.45]]) heap(x, z, rx, rz, h);
  // the manger's hay (the manger itself, along the west wall, is temple.js's: x0 + 0.1 … 1.3, its top at the floor + 1.05)
  parts.push(P(sph(1, [x0 + 0.7, floor + 0.98, (z0 + z1) / 2], [0.45, 0.28, (z1 - z0) / 2 - 1.6], 8, 4), '#D2AE58', 0, { rough: 1, emit: 0.05 }));
  strawOn(x0 + 0.7, floor + 0.98, (z0 + z1) / 2, 0.4, (z1 - z0) / 2 - 1.7, 0.26, 40);
  const mesh = new THREE.Mesh(merge(parts), staticMaterial()); mesh.name = 'lambs-hay'; mesh.matrixAutoUpdate = false; scene.add(mesh);
  // two rows of three, facing east toward the door into Beit HaMoked's hall (the stalls are the Sanctuary agent's)
  const spots = [];
  for (let i = 0; i < 12; i++) {
    const col = i % 3, row = Math.floor(i / 3) % 2, layer = Math.floor(i / 6);
    spots.push([x0 + 2.2 + col * 3.3 + layer * 1.6, z0 + 2.5 + row * 4.6 + layer * 1.2]);
  }
  const lambs = [];
  function count(n) {
    if (!isFinite(Number(n))) return lambs.length;
    n = Math.max(0, Math.min(12, Math.round(Number(n))));
    while (lambs.length > n) animals.remove(lambs.pop());
    while (lambs.length < n) {
      const [x, z] = spots[lambs.length];
      lambs.push(animals.add('lamb', x, z, { y: floor, yaw: Math.PI / 2 + (r() - 0.5) * 0.8, calm: true, wander: null }));
    }
    return lambs.length;
  }
  /** hand one lamb over to the service (it leaves the chamber's list; the chamber refills to `keep` later) */
  function take() { return lambs.length ? lambs.pop() : null; }
  return { mesh, count, take, get n() { return lambs.length; }, lambs, spots };
}
