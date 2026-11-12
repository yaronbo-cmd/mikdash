/* ── look D ── src/look/far.js — what is far: the hills round the Mount, the trees, the city (docs/specs/look/D-far-surroundings.md).
 * Geometry only, on programs that already exist: the Mount of Olives' terraces and paths lie on the ground's own material (look/ground.js,
 * the terrain's program), the trees keep their instanced meshes (one per part, the same counts or fewer).
 *
 *   olivetGround(THREE, mat, { terraces, paths }, F) → ONE mesh on the terrain's material (mat): each terrace a low dry-stone wall of pale rock along its contour with a
 *     shadow line under it and the terrace's own tilled earth above it; each path up the slope a band of trodden earth whose edges melt into
 *     the ground. F = { h(x, z): the drawn terrain's height, col(x, z, h, c): the terrain's vertex colour, gr(x, z, h, out): its aGr }
 *   oliveCrownGeo(THREE) / oliveTrunkGeo(THREE) → an olive: a crown of three irregular clumps (two tones by the normal: silver above and
 *     toward the sun, a deeper green under), a short trunk of four twisted segments · cypressGeo(THREE) → a slender spindle, ragged
 *   cityMat(mat) → the houses' one material (city.js buildHouses): blotches in the plaster (lighter limewash, darker weathered patches, by
 *     the world position: no tile repeats from house to house) and a dirtier foot (the archetypes' roof is at local y 0, the street ~11 below);
 *     the cloud shadows of round C on 'high'. One program, as before
 *   jitter(x, z, s) → a row tree's [dx, dz, drop]: up to 15 % of the spacing s, about one tree in twelve left out (a hash: no rng drawn)
 * ── /look D ── */

import { airPatch, AIR_ON } from './air.js';

function rnd(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
const hash = (x, z, s) => { const v = Math.sin(x * 12.9898 + z * 78.233 + s * 37.719) * 43758.5453; return v - Math.floor(v); };

/** a row tree's offset along and across its row and whether it is left out (the same tree always gets the same) */
export function jitter(x, z, s = 14) {
  const a = (hash(x, z, 1) - 0.5) * 2 * 0.15 * s, b = (hash(x, z, 2) - 0.5) * 2 * 0.07 * s;
  return [b, a, hash(x, z, 3) < 1 / 12];
}

/* ───────── the terraces and the paths on the Mount of Olives ───────── */
const WALL = { lo: 0.7, hi: 0.95, th: 0.9, down: 2.4, up: 4.2, k: [0.84, 0.8, 0.7] };
export function olivetGround(THREE, mat, { terraces = [], paths = [] }, F) {
  // (typed arrays sized for the most vertices the pieces can make: no growing arrays at boot)
  let nv = 0; for (const [ax, az, bx, bz] of terraces) nv += Math.max(2, Math.round(Math.hypot(bx - ax, bz - az) / 9)) * 30;   // (five quads a piece)
  for (const pts of paths) nv += Math.max(0, pts.length - 1) * 18;
  const P = new Float32Array(nv * 3), N = new Float32Array(nv * 3), C = new Float32Array(nv * 3), G = new Float32Array(nv * 2), e = new THREE.Color(), gr = [0, 0];
  let k3 = 0, k2 = 0;
  const v = (p, n, col, g) => { P[k3] = p[0]; P[k3 + 1] = p[1]; P[k3 + 2] = p[2]; N[k3] = n[0]; N[k3 + 1] = n[1]; N[k3 + 2] = n[2]; C[k3] = col[0]; C[k3 + 1] = col[1]; C[k3 + 2] = col[2]; G[k2] = g[0]; G[k2 + 1] = g[1]; k3 += 3; k2 += 2; };
  // (a quad a b c d, each [position, normal, colour, aGr]: its two triangles turned to face the normal's side)
  const quad = (a, b, cc, d) => {
    const A = a[0], ex = b[0][0] - A[0], ey = b[0][1] - A[1], ez = b[0][2] - A[2], fx = cc[0][0] - A[0], fy = cc[0][1] - A[1], fz = cc[0][2] - A[2];
    const n = a[1], s = (ey * fz - ez * fy) * n[0] + (ez * fx - ex * fz) * n[1] + (ex * fy - ey * fx) * n[2];
    for (const q of s >= 0 ? [a, b, cc, a, cc, d] : [a, cc, b, a, d, cc]) v(...q);
  };
  const UP = [0, 1, 0];
  const ground = (x, z) => { const h = F.h(x, z); F.col(x, z, h, e); F.gr(x, z, h, gr); return { h, col: [e.r, e.g, e.b], g: [gr[0], gr[1]] }; };
  const tone = (col, k) => [col[0] * k[0], col[1] * k[1], col[2] * k[2]];
  // the pale dry-stone (the ground shader draws it as rock: its aGr's rock bias full)
  const STONE = [0.8, 0.76, 0.66], ROCK = [1, 0];
  for (const [ax, az, bx, bz] of terraces) {
    const L = Math.hypot(bx - ax, bz - az) || 1, ux = (bx - ax) / L, uz = (bz - az) / L;
    // (downhill: the side where the slope falls — the Kidron's, west, nearly always)
    let dx = -uz, dz = ux; const mx = (ax + bx) / 2, mz = (az + bz) / 2;
    if (F.h(mx + dx * 4, mz + dz * 4) > F.h(mx - dx * 4, mz - dz * 4)) { dx = -dx; dz = -dz; }
    const n = Math.max(2, Math.round(L / 9)), row = [];
    for (let i = 0; i <= n; i++) {
      // (the line wanders half an amah off the contour's straight piece, and here and there a stretch has fallen: no ruled lines)
      const wob = (hash(ax, az, 9 + i) - 0.5) * (i > 0 && i < n ? 1.0 : 0), x = ax + (bx - ax) * i / n + dx * wob, z = az + (bz - az) * i / n + dz * wob, t = WALL.th / 2;
      const s = 0.85 + 0.3 * hash(x, z, 5);   // (the wall's height wanders a little: dry-stone, not a kerb)
      const g0 = ground(x + dx * t, z + dz * t), g1 = ground(x - dx * t, z - dz * t), gD = ground(x + dx * (t + WALL.down), z + dz * (t + WALL.down)), gU = ground(x - dx * (t + WALL.up), z - dz * (t + WALL.up));
      const top = Math.max(g0.h, g1.h) + WALL.hi * s;
      row.push({ x, z, top, g0, g1, gD, gU, t });
    }
    for (let i = 1; i < row.length; i++) {
      const A = row[i - 1], B = row[i], t = A.t;
      if (hash(A.x, A.z, 8) < 0.08) continue;
      const p = (R, k, y) => [R.x + dx * t * k, y, R.z + dz * t * k];
      const kA = 0.94 + 0.12 * hash(A.x, A.z, 6), sc = tone(STONE, [kA, kA, kA]);
      // the wall: its top, its downhill face (from a little under the ground), its uphill face
      quad([p(A, 1, A.top), UP, sc, ROCK], [p(B, 1, B.top), UP, sc, ROCK], [p(B, -1, B.top), UP, sc, ROCK], [p(A, -1, A.top), UP, sc, ROCK]);
      const fD = [dx, 0, dz], fU = [-dx, 0, -dz], sd = tone(sc, [0.92, 0.92, 0.92]);
      quad([p(A, 1, A.g0.h - WALL.lo), fD, sd, ROCK], [p(B, 1, B.g0.h - WALL.lo), fD, sd, ROCK], [p(B, 1, B.top), fD, sc, ROCK], [p(A, 1, A.top), fD, sc, ROCK]);
      quad([p(A, -1, A.g1.h - WALL.lo), fU, sd, ROCK], [p(B, -1, B.g1.h - WALL.lo), fU, sd, ROCK], [p(B, -1, B.top), fU, sc, ROCK], [p(A, -1, A.top), fU, sc, ROCK]);
      // the shadow line under it: the ground at the wall's foot darker, fading out downhill
      const lift = 0.25, fo = (R, g, k) => [R.x + dx * k, g.h + lift, R.z + dz * k];
      quad([fo(A, A.g0, t), UP, tone(A.g0.col, [0.6, 0.58, 0.56]), A.g0.g], [fo(B, B.g0, t), UP, tone(B.g0.col, [0.6, 0.58, 0.56]), B.g0.g],
        [fo(B, B.gD, t + WALL.down), UP, B.gD.col, B.gD.g], [fo(A, A.gD, t + WALL.down), UP, A.gD.col, A.gD.g]);
      // the terrace's floor above it: tilled earth, a little darker and browner, no rock (fading into the slope above)
      const soil = (g) => [g.g[0] * 0.3, g.g[1]];
      quad([fo(A, A.g1, -t), UP, tone(A.g1.col, WALL.k), soil(A.g1)], [fo(B, B.g1, -t), UP, tone(B.g1.col, WALL.k), soil(B.g1)],
        [fo(B, B.gU, -t - WALL.up), UP, B.gU.col, B.gU.g], [fo(A, A.gU, -t - WALL.up), UP, A.gU.col, A.gU.g]);
    }
  }
  // the paths: trodden earth, browner and darker in the middle, its edges the ground's own colour
  const W = [-4.2, -1.5, 1.5, 4.2], TROD = [0.72, 0.64, 0.55];
  for (const pts of paths) {
    let prev = null;
    for (let i = 0; i < pts.length; i++) {
      const [x, z] = pts[i], [px, pz] = pts[Math.max(0, i - 1)], [nx, nz] = pts[Math.min(pts.length - 1, i + 1)];
      const L = Math.hypot(nx - px, nz - pz) || 1, ox = -(nz - pz) / L, oz = (nx - px) / L;
      const cur = W.map((w, k) => { const g = ground(x + ox * w, z + oz * w); const mid = k === 1 || k === 2; return [[x + ox * w, g.h + 0.22, z + oz * w], UP, mid ? tone(g.col, TROD) : g.col, mid ? [0, Math.min(g.g[1], 0.1)] : g.g]; });
      if (prev) for (let k = 0; k < 3; k++) quad(prev[k], cur[k], cur[k + 1], prev[k + 1]);
      prev = cur;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(P.subarray(0, k3), 3));
  geo.setAttribute('normal', new THREE.BufferAttribute(N.subarray(0, k3), 3));
  geo.setAttribute('color', new THREE.BufferAttribute(C.subarray(0, k3), 3));
  geo.setAttribute('aGr', new THREE.BufferAttribute(G.subarray(0, k2), 2));
  geo.computeBoundingSphere();
  // (the terrain's own material: its one program; a quarter amah over the drawn surface, no depth fight from any camera)
  const m = new THREE.Mesh(geo, mat);
  m.receiveShadow = true; m.matrixAutoUpdate = false; m.name = 'olivet-ground';
  return m;
}

/* ───────── the trees ───────── */
// (a geometry's faces with their own normals and vertex colours; tone(n) → [r, g, b])
function faceted(THREE, src, tone) {
  const g = src.index ? src.toNonIndexed() : src, p = g.attributes.position, col = new Float32Array(p.count * 3);
  g.computeVertexNormals();
  const n = g.attributes.normal;
  for (let i = 0; i < p.count; i += 3) {
    const t = tone(n.getX(i), n.getY(i), n.getZ(i));
    for (let k = 0; k < 3; k++) col.set(t, (i + k) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  for (const a of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(a)) g.deleteAttribute(a);
  return g;
}
const merge = (THREE, list) => {
  let n = 0; for (const g of list) n += g.attributes.position.count;
  const out = new THREE.BufferGeometry();
  for (const [k, s] of [['position', 3], ['normal', 3], ['color', 3]]) {
    const a = new Float32Array(n * s); let o = 0;
    for (const g of list) { a.set(g.attributes[k].array, o); o += g.attributes[k].array.length; }
    out.setAttribute(k, new THREE.BufferAttribute(a, s));
  }
  out.computeBoundingSphere(); return out;
};
/** the olive's crown: three irregular clumps (60 triangles; the old ball was 80), in the old ball's unit space (y −1…1: the wind sways
 *  its upper half). Silver-light above and toward the sun (+z, south: the work light's sun), a deeper green under */
export function oliveCrownGeo(THREE) {
  const r = rnd(4), parts = [];
  for (const [cx, cy, cz, rad] of [[-0.34, -0.1, 0.12, 0.68], [0.38, 0.0, -0.16, 0.64], [0.02, 0.36, 0.28, 0.56]]) {
    const g0 = new THREE.IcosahedronGeometry(rad, 0), g = g0.index ? g0.toNonIndexed() : g0, p = g.attributes.position;
    const rot = r() * 6.28, cs = Math.cos(rot), sn = Math.sin(rot);
    // (shared corners of the icosahedron moved alike: the clump stays closed)
    const seen = new Map();
    for (let i = 0; i < p.count; i++) {
      const key = p.getX(i).toFixed(3) + p.getY(i).toFixed(3) + p.getZ(i).toFixed(3);
      if (!seen.has(key)) seen.set(key, [0.8 + r() * 0.36, 0.86 + r() * 0.26]);
      const [k, ky] = seen.get(key), x = p.getX(i) * k, z = p.getZ(i) * k;
      p.setXYZ(i, cx + x * cs - z * sn, cy + p.getY(i) * k * ky, cz + x * sn + z * cs);
    }
    parts.push(faceted(THREE, g, (nx, ny, nz) => {
      const s = Math.max(0, Math.min(1, ny * 0.75 + nz * 0.35 + 0.25));
      return [0.66 + 0.38 * s, 0.7 + 0.38 * s, 0.6 + 0.46 * s];   // (silver: the light faces lose their yellow)
    }));
  }
  return merge(THREE, parts);
}
// (every triangle turned to face away from the axis: c(y) → the axis's [x, z] at height y)
function outward(pos, c) {
  for (let i = 0; i < pos.length; i += 9) {
    const ax = pos[i + 3] - pos[i], ay = pos[i + 4] - pos[i + 1], az = pos[i + 5] - pos[i + 2], bx = pos[i + 6] - pos[i], by = pos[i + 7] - pos[i + 1], bz = pos[i + 8] - pos[i + 2];
    const nx = ay * bz - az * by, nz = ax * by - ay * bx, my = (pos[i + 1] + pos[i + 4] + pos[i + 7]) / 3, [qx, qz] = c(my);
    const ox = (pos[i] + pos[i + 3] + pos[i + 6]) / 3 - qx, oz = (pos[i + 2] + pos[i + 5] + pos[i + 8]) / 3 - qz;
    if (nx * ox + nz * oz < 0) for (let j = 0; j < 3; j++) { const t = pos[i + 3 + j]; pos[i + 3 + j] = pos[i + 6 + j]; pos[i + 6 + j] = t; }
  }
  return pos;
}
/** the olive's trunk: four segments, five sides, each ring turned and shifted (a short gnarled trunk, 40 triangles; 3.2 high, as before) */
export function oliveTrunkGeo(THREE) {
  const S = 5, R = [[0, 0, 0, 0.62], [0.16, 0.85, 0.06, 0.5], [-0.06, 1.65, 0.2, 0.44], [0.2, 2.45, 0.02, 0.4], [0.06, 3.2, -0.12, 0.3]];
  const pos = [];
  const ring = (k) => { const [x, y, z, rr] = R[k], tw = k * 0.45; return Array.from({ length: S }, (_, i) => { const a = tw + i / S * Math.PI * 2, w = rr * (0.85 + 0.3 * ((i * 7 + k * 3) % 5) / 4); return [x + Math.cos(a) * w, y, z + Math.sin(a) * w]; }); };
  for (let k = 1; k < R.length; k++) {
    const a = ring(k - 1), b = ring(k);
    for (let i = 0; i < S; i++) { const j = (i + 1) % S; pos.push(...a[i], ...b[i], ...b[j], ...a[i], ...b[j], ...a[j]); }
  }
  const axis = (y) => { let k = 1; while (k < R.length - 1 && R[k][1] < y) k++; const A = R[k - 1], B = R[k], t = Math.max(0, Math.min(1, (y - A[1]) / (B[1] - A[1]))); return [A[0] + (B[0] - A[0]) * t, A[2] + (B[2] - A[2]) * t]; };
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(outward(pos, axis), 3));
  g.computeVertexNormals(); g.computeBoundingSphere();
  return g;
}
/** the cypress: a slender dark spindle, widest a third of the way up, its outline ragged (five sides, six rings: 45 triangles) */
export function cypressGeo(THREE) {
  const S = 5, rings = [[0, 0.45], [1.6, 1.25], [4.2, 1.45], [7.2, 1.15], [10.0, 0.75], [12.3, 0.38]], tip = 14.2, r = rnd(17), pos = [];
  const ring = (k) => { const [y, rr] = rings[k], tw = k * 0.6; return Array.from({ length: S }, (_, i) => { const a = tw + i / S * Math.PI * 2, w = rr * (0.72 + r() * 0.5); return [Math.cos(a) * w, y + (r() - 0.5) * 0.5 * (k > 0 ? 1 : 0), Math.sin(a) * w]; }); };
  const RS = rings.map((_, k) => ring(k));
  const tri = (a, b, c) => pos.push(...a, ...b, ...c);
  for (let k = 1; k < RS.length; k++) for (let i = 0; i < S; i++) { const j = (i + 1) % S, a = RS[k - 1], b = RS[k]; tri(a[i], b[i], b[j]); tri(a[i], b[j], a[j]); }
  const T = RS[RS.length - 1], top = [0.1, tip, -0.05];
  for (let i = 0; i < S; i++) tri(T[i], top, T[(i + 1) % S]);
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(outward(pos, () => [0, 0]), 3));
  g.computeVertexNormals(); g.computeBoundingSphere();
  return g;
}

/* ───────── the houses' plaster ───────── */
const HOUSE_V = /* glsl */`
#ifdef USE_INSTANCING
  vHsW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
#else
  vHsW = (modelMatrix * vec4(transformed, 1.0)).xyz;
#endif
  vHsY = position.y;
  // ── look D review K2 ── (the roof marks: the local position, whether the face looks up, the house's own hash) ── /look D review ──
  vHsL = position.xz; vHsUp = objectNormal.y;
#ifdef USE_INSTANCING
  vHsI = fract(sin(dot(floor(instanceMatrix[3].xz * 0.37), vec2(12.9898, 78.233))) * 43758.5453);
#else
  vHsI = 1.0;
#endif`;
const HOUSE_F = /* glsl */`
  { vec3 q = vHsW;
    // (two octaves of value noise over the wall's plane: x and z with y folded in, so walls facing x or z both get it)
    vec2 a = vec2(q.x + q.y * 0.7, q.z - q.y * 0.6);
    float n = hsN(a / 3.2) * 0.65 + hsN(a / 1.1 + 7.3) * 0.35;
    diffuseColor.rgb *= mix(1.0, 0.88, smoothstep(0.58, 0.82, n)) * mix(1.0, 1.07, smoothstep(0.32, 0.14, n));
    // the foot: splashed and dirtier toward the street (ragged top edge) ── look D review K2 ── (higher and darker: seen from the city's
    // camera) ── /look D review ──
    float ft = smoothstep(-6.6, -11.4, vHsY + (n - 0.5) * 1.8);
    diffuseColor.rgb *= mix(vec3(1.0), vec3(0.7, 0.64, 0.56), ft);
    // ── look D review K2 ── about one roof in six: a pale drying mat (or a cloth spread out) or the dark square of a stair's hatch, on the
    // main roof's floor (local y 0 … −5; the parapets' tops are above it) ── /look D review ──
    if (vHsUp > 0.9 && vHsY > -5.0 && vHsY < 0.05 && vHsI < 0.17) {
      vec2 c = vec2((fract(vHsI * 53.7) - 0.5) * 9.0, -7.0 + (fract(vHsI * 91.3) - 0.5) * 2.0);
      if (vHsI < 0.11) { vec2 d = abs(vHsL - c) - vec2(2.6, 1.7); float m = 1.0 - smoothstep(-0.15, 0.1, max(d.x, d.y));
        diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.86, 0.8, 0.66) * (0.93 + 0.1 * hsN(vHsL * 1.7)), m); }
      else { vec2 d = abs(vHsL - c) - vec2(1.0); diffuseColor.rgb *= 1.0 - 0.7 * (1.0 - smoothstep(-0.1, 0.05, max(d.x, d.y))); }
    } }`;
const HOUSE_C = /* glsl */`
varying vec3 vHsW; varying float vHsY; varying vec2 vHsL; varying float vHsUp; varying float vHsI;
float hsH(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float hsN(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hsH(i), hsH(i + vec2(1.0, 0.0)), f.x), mix(hsH(i + vec2(0.0, 1.0)), hsH(i + vec2(1.0, 1.0)), f.x), f.y); }`;
export function cityMat(m) {
  m.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vHsW; varying float vHsY; varying vec2 vHsL; varying float vHsUp; varying float vHsI;')
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + HOUSE_V);
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\n' + HOUSE_C)
      .replace('#include <color_fragment>', '#include <color_fragment>\n' + HOUSE_F);
    airPatch(sh);
  };
  m.customProgramCacheKey = () => 'city-d' + (AIR_ON() ? '-air' : '');
  return m;
}
