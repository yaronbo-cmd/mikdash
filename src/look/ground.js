/* ── look B ── src/look/ground.js — the ground of the Mount and the world around it (docs/specs/look/B-mount-and-ground.md §B1–B3):
 * ONE patch for the world terrain (world.js buildTerrain) and the natural hill (stages.js makeHill), on a MeshStandardMaterial with
 * vertex colours (the large-scale tone) and two vertex values aGr (x: the rock's bias, outcrops; y: a hollow's darker earth).
 * Three surface kinds blended by masks in the fragment shader: ROCK (bare limestone, pale, pitted, bedded by world height on the
 * steep), EARTH (packed earth with dry straw stubble) and GRAVEL (small stones in dust). Their detail is one 512² texture computed at
 * load (R: earth, G: gravel, B: rock, A: soft blobs), sampled from above at two scales (7 and 37 amot) and from the side on the steep
 * (no stretch). The work mask (B3): a canvas over the Mount, R trodden earth round the works and on the paths, G the carts' corridors
 * (their two ruts drawn in the shader along uGrRut), B the dark earth bedded round the rocks.
 *
 *   groundMat(THREE) → the terrain's material · groundPatch(sh, THREE) → the hill's onBeforeCompile ends with it
 *   groundDetailData(n) → Uint8Array (pure) · workMarks(ids) → { spots, paths, ruts } (pure) · groundWork(ids) → redraw the mask
 *   groundSkirts(list) → the hill's own bare slabs [x, z, r] into the mask · smoothGridNormals(geo, nx, nz) → normals over 3 × 3 vertices
 * 'high': the detail's relief (a bump from its height); 'normal': two scales, no relief; 'low': one scale. ── /look B ── */
import { BOOK } from '../game/world/grid.js';

const HI = () => { try { return (globalThis.__LOOK_Q || globalThis.__FORCE_Q) === 'high'; } catch (e) { return false; } };
const LOW = () => { try { return (globalThis.__LOOK_Q || globalThis.__FORCE_Q) === 'low'; } catch (e) { return false; } };

/* ───────── the detail: tileable, computed once (no canvas, no fetch) ───────── */
function hash2(x, y, s) { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1442695041); h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
function rng(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let q = Math.imul(t ^ (t >>> 15), 1 | t); q ^= q + Math.imul(q ^ (q >>> 7), 61 | q); return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; }
/** periodic value noise: period p lattice cells over the tile (u, v in 0..1) */
function pnoise(u, v, p, s) {
  const x = u * p, y = v * p, xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const a = hash2(xi % p, yi % p, s), b = hash2((xi + 1) % p, yi % p, s), c = hash2(xi % p, (yi + 1) % p, s), d = hash2((xi + 1) % p, (yi + 1) % p, s);
  const sx = xf * xf * (3 - 2 * xf), sy = yf * yf * (3 - 2 * yf);
  return a + (b - a) * sx + (c - a) * sy + (a - b - c + d) * sx * sy;
}
const fbm = (u, v, p, s, o) => { let t = 0, w = 0.5, n = 0; for (let i = 0; i < o; i++) { t += pnoise(u, v, p << i, s + i * 17) * w; n += w; w *= 0.5; } return t / n; };

/** the detail's texels, RGBA 0..255, n × n, tileable (sizes for n = 512; a smaller n scales them):
 *  R earth — dark shrub spots (< 0.16), mottled earth with clods (0.2…0.75), dry straw stubble in tufts (> 0.8)
 *  G gravel — angular stones lit on their sun side, a dark rim, dust between · B limestone — mottling, solution pits, no cracks
 *  A the bedrock field — soft blobs cut by a net of grikes: thresholded in the shader, the bare slabs with earth between them */
export function groundDetailData(n = 512) {
  const A = new Float32Array(n * n * 4), q = n / 512;
  // (the grikes: the edges of a periodic Voronoi net, 7 × 7 cells over the tile)
  const VC = 7, vr = rng(5), sites = [];
  for (let j = 0; j < VC; j++) for (let i = 0; i < VC; i++) sites.push([(i + 0.15 + vr() * 0.7) / VC, (j + 0.15 + vr() * 0.7) / VC]);
  const edge = (u, v) => {
    let f1 = 9, f2 = 9; const ci = Math.floor(u * VC), cj = Math.floor(v * VC);
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const ii = ci + di, jj = cj + dj, S = sites[((jj % VC) + VC) % VC * VC + ((ii % VC) + VC) % VC];
      const sx = S[0] + Math.floor(ii / VC), sy = S[1] + Math.floor(jj / VC), d = Math.hypot(u - sx, v - sy);
      if (d < f1) { f2 = f1; f1 = d; } else if (d < f2) f2 = d;
    }
    return (f2 - f1) * VC;
  };
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const u = i / n, v = j / n, k = (j * n + i) * 4;
    const m1 = fbm(u, v, 4, 3, 3), m2 = fbm(u, v, 16, 7, 2), m3 = pnoise(u, v, 48, 9);
    A[k] = 0.48 + (m1 - 0.5) * 0.55 + (m2 - 0.5) * 0.4 + (m3 - 0.5) * 0.18;   // earth: mottled
    A[k + 1] = 0.26 + (m2 - 0.5) * 0.2;                                       // gravel: the dust between the stones
    A[k + 2] = 0.62 + (m1 - 0.5) * 0.4 + (pnoise(u, v, 10, 11) - 0.5) * 0.32 + (m3 - 0.5) * 0.1;   // rock
    const w = (pnoise(u, v, 24, 15) - 0.5) * 0.02;
    // (the grikes only here and there: a net broken by a noise, so the slabs read as bedrock, not as laid flags)
    const brk = Math.min(1, Math.max(0, (pnoise(u, v, 9, 21) - 0.45) / 0.2));
    A[k + 3] = fbm(u, v, 3, 13, 4) * 0.85 + (m2 - 0.5) * 0.16 + 0.1 - 0.1 * brk * (1 - Math.min(1, Math.max(0, (edge(u + w, v - w) - 0.03) / 0.16)));
  }
  const r = rng(71);
  const stamp = (cx, cy, rad, ch, fn) => {
    const x0 = Math.floor(cx - rad - 1), x1 = Math.ceil(cx + rad + 1), y0 = Math.floor(cy - rad - 1), y1 = Math.ceil(cy + rad + 1);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const v = fn(x - cx, y - cy); if (v === null) continue;
      const k = ((((y % n) + n) % n) * n + (((x % n) + n) % n)) * 4 + ch; A[k] = v(A[k]);
    }
  };
  // earth: dark clods
  for (let i = 0; i < 380; i++) {
    const cx = r() * n, cy = r() * n, rad = (4 + r() * 8) * q, dk = 0.1 + r() * 0.14;
    stamp(cx, cy, rad, 0, (dx, dy) => { const d = Math.hypot(dx, dy * 1.3) / rad; return d > 1 ? null : (a) => a - dk * (1 - d * d); });
  }
  // the low shrubs (Poterium, thyme): dark rounded spots with a ragged edge
  for (let i = 0; i < 18; i++) {
    const cx = r() * n, cy = r() * n, rad = (8 + r() * 12) * q, ph = r() * 6.28;
    stamp(cx, cy, rad * 1.2, 0, (dx, dy) => { const a = Math.atan2(dy, dx), d = Math.hypot(dx, dy) / (rad * (0.9 + 0.08 * Math.sin(a * 3 + ph) + 0.06 * Math.sin(a * 7 - ph))); return d > 1 ? null : (o) => (d > 0.8 ? Math.min(o, 0.12) : 0.04 + 0.08 * d + 0.04 * Math.sin(dx * 1.3 / q) * Math.sin(dy * 1.5 / q)); });
  }
  // dry straw stubble: tufts of short bright strokes
  for (let t = 0; t < 150; t++) {
    const tx = r() * n, ty = r() * n, nb = 5 + Math.floor(r() * 8);
    for (let b = 0; b < nb; b++) {
      const a = -Math.PI / 2 + (r() - 0.5) * 2.4, L = (10 + r() * 22) * q, sx = tx + (r() - 0.5) * 14 * q, sy = ty + (r() - 0.5) * 14 * q, br = 0.86 + r() * 0.14;
      for (let s2 = 0; s2 <= L; s2 += 0.8) { const x = sx + Math.cos(a) * s2, y = sy + Math.sin(a) * s2; stamp(x, y, 1.3 * q, 0, (dx, dy) => (Math.hypot(dx, dy) > 1.3 * q ? null : (o) => (o < 0.18 ? o : Math.max(o, br - 0.08 * s2 / L)))); }
    }
  }
  // gravel: angular stones, lit on the sun's side, a dark rim
  for (let i = 0; i < 1500; i++) {
    const cx = r() * n, cy = r() * n, rad = (5 + r() * r() * 18) * q, l = 0.5 + r() * 0.45, an = r() * 3.14, ca = Math.cos(an), sa = Math.sin(an), sq = 0.6 + r() * 0.35;
    stamp(cx, cy, rad * 1.2, 1, (dx, dy) => {
      const ex = dx * ca + dy * sa, ey = (-dx * sa + dy * ca) / sq, d = Math.max(Math.hypot(ex, ey), (Math.abs(ex) + Math.abs(ey)) * 0.78) / rad;
      if (d > 1.18) return null;
      if (d > 1) return (a) => Math.min(a, 0.1);
      const lit = 0.85 + 0.35 * ((-dx - dy) / (rad * 1.4));
      return () => Math.min(1, l * lit * (1 - 0.2 * d * d));
    });
  }
  // rock: solution pits, and lighter weathered patches
  for (let i = 0; i < 1100; i++) {
    const cx = r() * n, cy = r() * n, rad = (1.5 + r() * 5) * q, dk = 0.25 + r() * 0.25;
    stamp(cx, cy, rad, 2, (dx, dy) => { const d = Math.hypot(dx, dy) / rad; return d > 1 ? null : (a) => a - dk * (1 - d); });
  }
  for (let i = 0; i < 90; i++) {
    const cx = r() * n, cy = r() * n, rad = (10 + r() * 30) * q;
    stamp(cx, cy, rad, 2, (dx, dy) => { const d = Math.hypot(dx, dy) / rad; return d > 1 ? null : (a) => a + 0.08 * (1 - d * d); });
  }
  const out = new Uint8Array(n * n * 4);
  for (let k = 0; k < out.length; k++) out[k] = Math.max(0, Math.min(255, Math.round(A[k] * 255)));
  return out;
}

const C = new WeakMap();
const cache = (THREE) => { let c = C.get(THREE); if (!c) { c = {}; C.set(THREE, c); } return c; };
function detailTex(THREE) {
  const c = cache(THREE); if (c.det) return c.det;
  const n = LOW() ? 256 : 512, t = new THREE.DataTexture(groundDetailData(n), n, n, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter; t.generateMipmaps = true; t.anisotropy = 4; t.needsUpdate = true;
  return (c.det = t);
}

/* ───────── the work mask (B3) ───────── */
// over the Mount and its margins: x −360…340, z −540…460 (the platform −300…277 × −480…400)
export const MASK = Object.freeze({ x0: -360, z0: -540, w: 700, d: 1000, n: 512 });
const NRUT = 8;
const SECT = BOOK.sectors;
// (the courses' stretches as acts3.js COURSES lays them: z0 352, 316, then 36 amot apart northward; the wall's face x 277)
const courseZ = (c) => (c === 0 ? 352 : c === 1 ? 316 : 316 - 36 * (c - 1));
/** the marks of the works done (or under way), by their ids, in the order done: spots [x, z, r] (trodden earth with chips), paths
 *  [ax, az, bx, bz, w] (trodden lines between the works, along the order he walked), ruts [ax, az, bx, bz] (the carts' and the
 *  sledge's routes: two parallel ruts) — every place from the address book */
export function workMarks(ids) {
  const spots = [], paths = [], ruts = [], seen = new Set();
  const pit = (i) => BOOK.pits[((i % BOOK.pits.length) + BOOK.pits.length) % BOOK.pits.length];
  const add = (x, z, r) => { const p = [+x.toFixed(2), +z.toFixed(2), r]; spots.push(p); return p; };
  const route = (pts, rut) => { for (let i = 1; i < pts.length; i++) { const s = [pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1]]; if (rut) ruts.push(s); else paths.push([...s, 2.4]); } };
  let last = null;
  for (const id of ids || []) {
    if (typeof id !== 'string' || seen.has(id)) continue; seen.add(id);
    let m, at = null;
    if (id === 'rope') { const x1 = 277, z0 = -183.5; route([[x1 - 50, z0 + 1.5], [x1 - 1.5, z0 + 1.5], [x1 - 1.5, z0 + 50]], false); at = add(x1 - 6, z0 + 6, 8); }
    else if ((m = /^(rocks|read|pave)(\d+)/.exec(id)) && SECT[+m[2]]) { const S = SECT[+m[2]]; at = add(m[1] === 'read' ? S.big.x : S.rect.cx, m[1] === 'read' ? S.big.z : S.rect.cz, m[1] === 'read' ? S.big.r + 7 : 10); }
    else if ((m = /^waste(\d+)$/.exec(id))) { const P = pit(+m[1] - 1), L = BOOK.pile; add(L.x, L.z, 7); at = add(P.x, P.z, 9); route([[L.x, L.z], [P.x, P.z]], true); }
    else if (id === 'corner') { const Y = BOOK.yard; at = add(BOOK.corner.x - 9, BOOK.corner.z - 9, 9); add(Y.x, Y.z, 9); route([[Y.x, Y.z], [Y.x + 20, BOOK.corner.z - 12], [BOOK.corner.x - 10, BOOK.corner.z - 12]], true); }
    else if ((m = /^course(\d+)$/.exec(id))) { const z = courseZ(+m[1]) + 7, Y = BOOK.yard; at = add(266, z, 9); route([[Y.x, Y.z], [256, Y.z], [256, z]], true); }
    else if (id === 'great') { const T = BOOK.great.track; add(T[0][0], T[0][1], 9); at = add(T[T.length - 1][0], T[T.length - 1][1], 8); route(T, true); }
    else if (id === 'letters') at = add(BOOK.letters.x + 6, BOOK.letters.z - 6, 8);
    if (!at) continue;
    // (the path he walked from the work before: from the nearest spot already marked)
    if (last) { let b = last, bd = Math.hypot(at[0] - b[0], at[1] - b[1]); for (const s of spots) { if (s === at) continue; const d = Math.hypot(at[0] - s[0], at[1] - s[1]); if (d < bd && d > 1) { bd = d; b = s; } } if (bd > 4) paths.push([b[0], b[1], at[0], at[1], 2.2]); }
    last = at;
  }
  return { spots, paths, ruts: ruts.slice(-NRUT) };
}

function maskState(THREE) {
  const c = cache(THREE); if (c.mask) return c.mask;
  const S = { tex: null, cv: null, ruts: Array.from({ length: NRUT }, () => new THREE.Vector4(0, 0, 0, 0)), box: new THREE.Vector4(MASK.x0, MASK.z0, 1 / MASK.w, 1 / MASK.d) };
  if (typeof document !== 'undefined') {
    S.cv = document.createElement('canvas'); S.cv.width = S.cv.height = MASK.n;
    S.tex = new THREE.CanvasTexture(S.cv); S.tex.generateMipmaps = false; S.tex.minFilter = S.tex.magFilter = THREE.LinearFilter; S.tex.wrapS = S.tex.wrapT = THREE.ClampToEdgeWrapping;
  } else {
    S.tex = new THREE.DataTexture(new Uint8Array(4), 1, 1, THREE.RGBAFormat); S.tex.needsUpdate = true;
  }
  c.mask = S; draw(S); return S;
}
function draw(S) {
  const cv = S.cv; if (!cv) return;
  const g = cv.getContext('2d'), n = MASK.n, sx = n / MASK.w, sz = n / MASK.d;
  g.globalCompositeOperation = 'source-over'; g.fillStyle = '#000'; g.fillRect(0, 0, n, n);
  g.globalCompositeOperation = 'lighter';
  const X = (x) => (x - MASK.x0) * sx, Z = (z) => (z - MASK.z0) * sz;
  const disc = (x, z, r0, r1, rgb, a) => {
    const gr = g.createRadialGradient(X(x), Z(z), r0 * sx, X(x), Z(z), r1 * sx);
    gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.save(); g.translate(X(x), Z(z)); g.scale(1, sz / sx); g.translate(-X(x), -Z(z)); g.fillRect(X(x) - r1 * sx, Z(z) - r1 * sx, r1 * sx * 2, r1 * sx * 2); g.restore();
  };
  const line = (ax, az, bx, bz, w, rgb, a) => {
    g.strokeStyle = `rgba(${rgb},${a})`; g.lineCap = 'round'; g.lineWidth = w * sx; g.beginPath(); g.moveTo(X(ax), Z(az)); g.lineTo(X(bx), Z(bz)); g.stroke();
    g.strokeStyle = `rgba(${rgb},${a * 0.5})`; g.lineWidth = w * sx * 2.2; g.beginPath(); g.moveTo(X(ax), Z(az)); g.lineTo(X(bx), Z(bz)); g.stroke();
  };
  // the rocks' bedding: the big rock and the small ones of every sector, and the hill's bare slabs (B)
  for (const S0 of SECT) { disc(S0.big.x, S0.big.z, S0.big.r * 0.7, S0.big.r * 1.45, '0,0,255', 0.85); for (const o of S0.small) disc(o.x, o.z, o.r * 0.6, o.r * 1.6, '0,0,255', 0.7); }
  for (const [x, z, r] of STATE.skirts) disc(x, z, r * 0.6, r * 1.5, '0,0,255', 0.6);
  const M = workMarks(STATE.ids);
  for (const [ax, az, bx, bz, w] of M.paths) line(ax, az, bx, bz, w, '255,0,0', 0.55);
  for (const [ax, az, bx, bz] of M.ruts) { line(ax, az, bx, bz, 3.2, '255,0,0', 0.5); line(ax, az, bx, bz, 3.2, '0,255,0', 1); }
  for (const [x, z, r] of M.spots) disc(x, z, r * 0.55, r * 1.1, '255,0,0', 1);
  for (let i = 0; i < NRUT; i++) { const R = M.ruts[i]; if (R) S.ruts[i].set(R[0], R[1], R[2], R[3]); else S.ruts[i].set(0, 0, 0, 0); }
  S.tex.needsUpdate = true;
}
const STATE = { THREE: null, ids: [], skirts: [] };
/** the works done and the one under way, in order (the director, when a work starts or ends; a load derives it from the save) */
export function groundWork(ids) {
  const L = Array.isArray(ids) ? ids.filter((x) => typeof x === 'string') : [];
  if (L.join() === STATE.ids.join()) return false;
  STATE.ids = L; const c = STATE.THREE && cache(STATE.THREE); if (c && c.mask) draw(c.mask); return true;
}
/** the hill's bare slabs: [x, z, r] — the dark earth bedded round each (once, at the hill's build) */
export function groundSkirts(list) { STATE.skirts = (list || []).slice(); const c = STATE.THREE && cache(STATE.THREE); if (c && c.mask) draw(c.mask); }

/** an indexed grid's normals (nx × nz vertices, row-major), averaged with their 8 neighbours: the light follows the hill's shape, not
 *  its triangles (the positions stay) */
export function smoothGridNormals(geo, nx, nz, passes = 1) {
  const N = geo.attributes.normal, a = N.array;
  for (let p = 0; p < passes; p++) {
    const b = new Float32Array(a.length);
    for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
      let x = 0, y = 0, z = 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        const ii = i + di, jj = j + dj; if (ii < 0 || jj < 0 || ii >= nx || jj >= nz) continue;
        const w = di === 0 && dj === 0 ? 2 : di === 0 || dj === 0 ? 1 : 0.5, k = (jj * nx + ii) * 3;
        x += a[k] * w; y += a[k + 1] * w; z += a[k + 2] * w;
      }
      const L = Math.hypot(x, y, z) || 1, k = (j * nx + i) * 3; b[k] = x / L; b[k + 1] = y / L; b[k + 2] = z / L;
    }
    a.set(b);
  }
  N.needsUpdate = true;
}

/* ───────── the shader ───────── */
const VERT = /* glsl */`
attribute vec2 aGr; varying vec3 vGrW; varying vec3 vGrN; varying vec2 vGrA;`;
const VERT_MAIN = /* glsl */`
  vGrW = (modelMatrix * vec4(transformed, 1.0)).xyz; vGrN = normalize(mat3(modelMatrix) * objectNormal); vGrA = aGr;`;
const FRAG = /* glsl */`
uniform sampler2D uGrT; uniform sampler2D uGrM; uniform vec4 uGrMB; uniform vec4 uGrRut[${NRUT}];
uniform vec3 uGrStraw; uniform vec3 uGrRock; uniform vec3 uGrGrav; uniform vec3 uGrDark;
varying vec3 vGrW; varying vec3 vGrN; varying vec2 vGrA;
float grDet = 1.0; float grHt = 0.5; vec3 grPack = vec3(0.3);
vec3 grGround(vec3 vc) {
  vec3 W = vGrW, N = normalize(vGrN);
  vec2 p = W.xz;
  // (the side projection's gradients, outside the branch)
  bool gx = abs(N.x) > abs(N.z); vec2 us = (gx ? W.zy : W.xy) / 10.0;
  vec2 usx = dFdx(us), usy = dFdy(us);
  vec4 d1 = texture2D(uGrT, p / 10.0 + 0.13);
#ifndef GR_LOW
  vec4 d2 = texture2D(uGrT, vec2(p.x * 0.8 - p.y * 0.6, p.x * 0.6 + p.y * 0.8) / 37.0 + 0.37);
#else
  vec4 d2 = d1;
#endif
  float slope = 1.0 - N.y;
  // the work mask: trodden earth (r), the carts' corridors (g), the rocks' bedding (b)
  vec4 wm = vec4(0.0); vec2 mu = (p - uGrMB.xy) * uGrMB.zw;
  if (mu.x > 0.0 && mu.y > 0.0 && mu.x < 1.0 && mu.y < 1.0) wm = texture2D(uGrM, mu);
  float trod = clamp(wm.r * 1.2, 0.0, 1.0);
  // ROCK: bare bedrock slabs (the field thresholded: lower where the vertex's bias is rocky and on the slope; the grikes between them
  // earth), and the whole face on the steep (over ≈ 33°)
  float rf = d2.a + (d1.a - 0.5) * 0.16, th = 0.7 - vGrA.x * 0.5 - smoothstep(0.04, 0.2, slope) * 0.25 + trod * 0.35 + vGrA.y * 0.2;
  float slab = smoothstep(th, th + 0.035, rf);
  float steep = smoothstep(0.17, 0.26, slope + (d2.a - 0.5) * 0.14);
  float rk = max(slab, steep);
  float rim = smoothstep(th - 0.09, th, rf) * (1.0 - slab) * (1.0 - steep);
  // GRAVEL: scree below the rock, the trodden ground, patches
  float gv = clamp(smoothstep(0.55, 0.75, d2.r + (d1.a - 0.5) * 0.3) * 0.5 * (1.0 - vGrA.y) + trod * smoothstep(0.35, 0.65, d1.g + d2.a * 0.4) * 0.8 + rim * 0.5, 0.0, 1.0);
  // EARTH: mottled, dry straw in tufts, the low dark shrubs, darker in the hollows and where trodden
  float e = d1.r;
  vec3 earth = vc * (0.5 + 0.75 * mix(e, d2.r, 0.3));
  float straw = smoothstep(0.78, 0.9, e) * clamp(1.0 - trod * 1.6, 0.0, 1.0) * (1.0 - 0.6 * vGrA.y);
  earth = mix(earth, uGrStraw * (0.8 + 0.3 * d2.r), straw * 0.6);
  earth = mix(earth, uGrDark * (0.7 + 0.6 * e), clamp(vGrA.y * 0.6 + trod * 0.8, 0.0, 0.9));
  float shrub = (1.0 - smoothstep(0.12, 0.18, e)) * (1.0 - trod);
  earth = mix(earth, vec3(0.16, 0.15, 0.09) * (0.75 + 2.5 * e), shrub * 0.85);
  vec3 grav = mix(uGrGrav, vc, 0.4) * (0.4 + 1.0 * mix(d1.g, d2.g, 0.2)) * (1.0 - 0.2 * trod);
  // ROCK: pale limestone, pitted; on the steep its detail from the side and horizontal beds by height
  float rb = mix(d1.b, d2.b, 0.45), sw = smoothstep(0.26, 0.5, slope);
  if (sw > 0.01) rb = mix(rb, textureGrad(uGrT, us, usx, usy).b, sw);
  float bed = smoothstep(0.78, 0.95, abs(fract(W.y * 0.42 + (d2.a - 0.5) * 0.9) * 2.0 - 1.0)) * smoothstep(0.18, 0.4, slope) * smoothstep(0.25, 0.55, d1.a + 0.2);
  vec3 rock = mix(uGrRock, vc, 0.25) * (0.52 + 0.62 * rb) * (1.0 - 0.32 * bed) * (0.8 + 0.2 * smoothstep(th + 0.02, th + 0.1, rf)) * (1.0 - 0.12 * sw);
  rock *= mix(vec3(1.0), vec3(0.86, 0.84, 0.8), smoothstep(0.45, 0.7, d2.b) * 0.8);   // (weathered grey patches)
  vec3 col = mix(earth, grav, gv);
  col *= 1.0 - 0.3 * rim;
  col = mix(col, rock, rk);
  // the dark earth bedded round the rocks; the carts' two ruts
  col *= 1.0 - 0.38 * wm.b;
  if (wm.g > 0.05) {
    float dm = 1e3;
    for (int i = 0; i < ${NRUT}; i++) { vec4 R = uGrRut[i]; vec2 ab = R.zw - R.xy; float L2 = dot(ab, ab); if (L2 < 1e-3) continue;
      vec2 ap = p - R.xy; float t = clamp(dot(ap, ab) / L2, 0.0, 1.0); dm = min(dm, length(ap - ab * t)); }
    float rut = 1.0 - smoothstep(0.1, 0.32, abs(dm - 0.75));
    col *= 1.0 - 0.3 * rut * wm.g;
  }
  // (packed earth with small stones: the fill behind the walls, as the hill's shader lays it)
  grPack = mix(uGrDark * (0.95 + 0.7 * mix(d1.r, d2.r, 0.4)), grav, smoothstep(0.45, 0.75, d2.g) * 0.55 + 0.1);
  grDet = lkLumGr(col) / max(0.04, lkLumGr(vc));
  grHt = mix(mix(e, d1.g, gv), rb - bed * 0.3, rk);
  return col;
}`;
const FRAG_FN = /* glsl */`float lkLumGr(vec3 c) { return dot(c, vec3(0.333)); }`;
const BUMP = /* glsl */`
#ifdef GR_HI
  { vec2 dH = vec2(dFdx(grHt), dFdy(grHt)) * 0.05; vec3 sx = dFdx(-vViewPosition), sy = dFdy(-vViewPosition), r1 = cross(sy, normal), r2 = cross(normal, sx);
    float det = dot(sx, r1) * faceDirection; vec3 g = sign(det) * (dH.x * r1 + dH.y * r2); normal = normalize(abs(det) * normal - g); }
#endif`;

function uniforms(THREE) {
  const c = cache(THREE); if (c.U) return c.U;
  STATE.THREE = THREE;
  const S = maskState(THREE), col = (h) => new THREE.Color(h);
  c.U = {
    uGrT: { value: detailTex(THREE) }, uGrM: { value: S.tex }, uGrMB: { value: S.box }, uGrRut: { value: S.ruts },
    uGrStraw: { value: col('#C9B07A') }, uGrRock: { value: col('#CFC5AF') }, uGrGrav: { value: col('#B9AC94') }, uGrDark: { value: col('#86684C') },
  };
  return c.U;
}
/** the ground's patch, on a shader whose fragment has vertex colours (the hill calls it at the end of its own) */
export function groundPatch(sh, THREE) {
  Object.assign(sh.uniforms, uniforms(THREE));
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\n' + VERT)
    .replace('#include <project_vertex>', '#include <project_vertex>\n' + VERT_MAIN);
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', '#include <common>\n' + FRAG_FN + FRAG)
    .replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb = grGround(diffuseColor.rgb);')
    .replace('#include <normal_fragment_maps>', '#include <normal_fragment_maps>\n' + BUMP);
}
/** the defines and the program's key for a ground material (the level picks the variant) */
export function groundDefines(m) {
  const d = Object.assign({}, m.defines); delete d.GR_HI; delete d.GR_LOW;
  if (HI()) d.GR_HI = ''; else if (LOW()) d.GR_LOW = '';
  m.defines = d; return HI() ? '-hi' : LOW() ? '-low' : '';
}
/** the world terrain's material */
export function groundMat(THREE) {
  STATE.THREE = THREE;
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
  const k = groundDefines(m);
  m.onBeforeCompile = (sh) => groundPatch(sh, THREE);
  m.customProgramCacheKey = () => 'ground' + k;
  return m;
}
