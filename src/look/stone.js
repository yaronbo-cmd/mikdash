/* ── look A ── src/look/stone.js — the look of every dressed stone in the game (docs/specs/look/A-things-in-hand.md §A1, §A2): cream-white
 * Jerusalem limestone, pecked, with a drafted margin round a rougher boss on the long faces, comb-chisel strokes on the others, dust at
 * the foot once laid. One shared program for meshes and instanced meshes (src/look/shader.js); the stone's tone is its colour.
 *
 *   stoneMat(THREE) → the shared ashlar material · ashOf(THREE, seed, o) → a tinted clone (o.set, o.margin, o.light)
 *   slabMat(THREE) / slabOf(THREE, seed) → the paving slab's · stoneTint(seed) / neighbourTint(prev, seed) → '#rrggbb' (8 tones)
 *   ashlarGeo(THREE) · plainGeo(THREE) · chipGeo(THREE, k) · slabGeo(THREE, w, h, d) · crackGeo(THREE, len, seed) · stoneDetail(THREE)
 *   ashTone(out, hex, k, x, z) → the crews' instanced stones in the same 8-tone range (stages.js putA)
 * Pure parts (no three.js, no DOM): TONES, stoneTint, neighbourTint, toneIndex, hsl2hex. ── /look A ── */
import { KIND, lookMat, lookClone } from './shader.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export function hsl2hex(h, s, l) {
  s /= 100; l /= 100; const a = s * Math.min(l, 1 - l);
  const f = (n) => { const k = (n + h / 30) % 12, c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(clamp(c, 0, 1) * 255).toString(16).padStart(2, '0'); };
  return '#' + f(0) + f(8) + f(4);
}
/** the 8 tones of the Jerusalem limestone (hue 34..46, saturation 10..22 %, lightness 76..84 %): creamy, slightly pink, slightly
 *  yellow, slightly grey */
export const TONES = Object.freeze([[40, 18, 80], [35, 16, 79], [44, 22, 80], [40, 12, 77], [42, 17, 84], [38, 20, 78], [46, 15, 82], [36, 14, 83]]);
const hh = (n) => { const v = Math.sin(n * 127.1 + 311.7) * 43758.5453; return v - Math.floor(v); };
export const toneIndex = (seed) => Math.floor(hh(seed * 1.618 + 0.37) * TONES.length) % TONES.length;
/** a tone with a hair of its own (so no two stones share a colour: the shader's per-stone pattern comes from it) */
function toneHex(i, seed, dl = 0) { const [h, s, l] = TONES[i]; return hsl2hex(h + (hh(seed * 3.3) - 0.5) * 1.6, s + (hh(seed * 5.1) - 0.5) * 1.2, clamp(l + dl + (hh(seed * 7.9) - 0.5) * 0.8, 70, 90)); }
export function stoneTint(seed) { return toneHex(toneIndex(seed), seed); }
/** the tone of the next stone in a row: never its neighbour's (prevIndex), returned as { hex, i } */
export function neighbourTint(prevIndex, seed) {
  let i = toneIndex(seed); if (i === prevIndex) i = (i + 1 + Math.floor(hh(seed + 9) * (TONES.length - 1))) % TONES.length;
  if (i === prevIndex) i = (i + 1) % TONES.length;
  return { hex: toneHex(i, seed), i };
}

/* ───────── the detail: pecked limestone (fine pits, a few soft veins, sparse fossil flecks), one tile = 2.5 amot ───────── */
const CACHE = new WeakMap();
const cacheOf = (THREE) => { let c = CACHE.get(THREE); if (!c) { c = {}; CACHE.set(THREE, c); } return c; };
function rnd(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
export function stoneDetail(THREE) {
  const C = cacheOf(THREE); if (C.det) return C.det;
  const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d', { willReadFrequently: true }), r = rnd(4401);
  x.fillStyle = 'rgb(128,128,128)'; x.fillRect(0, 0, S, S);
  const around = (fn) => { for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) fn(ox, oy); };
  // soft clouds
  for (let i = 0; i < 70; i++) { const X = r() * S, Y = r() * S, R = 20 + r() * 90, l = r() < 0.5 ? 0 : 255, a = 0.05 + r() * 0.06;
    around((ox, oy) => { const g = x.createRadialGradient(X + ox, Y + oy, 0, X + ox, Y + oy, R); g.addColorStop(0, `rgba(${l},${l},${l},${a})`); g.addColorStop(1, `rgba(${l},${l},${l},0)`); x.fillStyle = g; x.fillRect(X + ox - R, Y + oy - R, R * 2, R * 2); }); }
  // a few soft veins
  for (let i = 0; i < 5; i++) { let X = r() * S, Y = r() * S, a = r() * 6.28; const pts = [[X, Y]]; for (let k = 0; k < 24; k++) { a += (r() - 0.5) * 0.5; X += Math.cos(a) * 9; Y += Math.sin(a) * 9; pts.push([X, Y]); }
    const l = r() < 0.6 ? 90 : 190; around((ox, oy) => { x.strokeStyle = `rgba(${l},${l},${l},0.16)`; x.lineWidth = 1 + r() * 1.5; x.beginPath(); pts.forEach(([p, q], k) => (k ? x.lineTo(p + ox, q + oy) : x.moveTo(p + ox, q + oy))); x.stroke(); }); }
  // the pecking: fine pits, each a dark dot with a lit lip
  for (let i = 0; i < 2600; i++) { const X = r() * S, Y = r() * S, R = 1.2 + r() * r() * 4.5, l = 40 + r() * 50;
    around((ox, oy) => { if (X + ox < -4 || X + ox > S + 4 || Y + oy < -4 || Y + oy > S + 4) return; x.fillStyle = `rgba(215,215,215,0.35)`; x.beginPath(); x.arc(X + ox + 0.7, Y + oy + 0.7, R, 0, 6.3); x.fill(); x.fillStyle = `rgba(${l},${l},${l},0.55)`; x.beginPath(); x.arc(X + ox, Y + oy, R, 0, 6.3); x.fill(); }); }
  // sparse fossil flecks: small pale shells
  for (let i = 0; i < 46; i++) { const X = r() * S, Y = r() * S, R = 1.5 + r() * 3.5, a = r() * 6.28;
    around((ox, oy) => { x.strokeStyle = 'rgba(232,232,232,0.6)'; x.lineWidth = 0.9; x.beginPath(); x.ellipse(X + ox, Y + oy, R, R * 0.55, a, 0, Math.PI * (1 + r() * 0.8)); x.stroke(); }); }
  // the grain
  const img = x.getImageData(0, 0, S, S), d = img.data; for (let i = 0; i < d.length; i += 4) { const g = (r() - 0.5) * 22; d[i] = clamp(d[i] + g, 0, 255); d[i + 1] = clamp(d[i + 1] + g, 0, 255); d[i + 2] = clamp(d[i + 2] + g, 0, 255); }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4; t.generateMipmaps = true;
  return (C.det = t);
}

/* ───────── materials ───────── */
export function stoneMat(THREE) { const C = cacheOf(THREE); return C.stone || (C.stone = lookMat(THREE, KIND.stone, { color: hsl2hex(40, 16, 80), tex: stoneDetail(THREE) })); }
/** a dressed stone's own material: a tinted clone (o.set 1: laid, dust at its foot · o.margin amot · o.light: from the light end ·
 *  o.boss false: a plain block) */
export function ashOf(THREE, seed, o = {}) {
  const m = lookClone(stoneMat(THREE), o.hex || (o.light ? toneHex([4, 6, 7][Math.floor(hh(seed) * 3)], seed, 1) : stoneTint(seed)));
  if (o.set) m.userData.look.set = o.set; if (o.margin) m.userData.look.margin = o.margin; if (o.boss === false) m.userData.look.boss = 0;
  return m;
}
export function slabMat(THREE) { const C = cacheOf(THREE); return C.slab || (C.slab = lookMat(THREE, KIND.slab, { color: hsl2hex(40, 14, 80), tex: stoneDetail(THREE) })); }
/** 4 tone families for the paving */
const SLAB_T = [[40, 14, 80], [36, 12, 78], [44, 16, 81], [40, 9, 77]];
export function slabTint(seed) { const [h, s, l] = SLAB_T[Math.floor(hh(seed * 2.7) * 4) % 4]; return hsl2hex(h + (hh(seed * 3.1) - 0.5) * 2, s + (hh(seed * 1.3) - 0.5) * 2, l + (hh(seed * 5.7) - 0.5) * 2); }
export function slabOf(THREE, seed) { return lookClone(slabMat(THREE), slabTint(seed)); }

/** the crews' instanced stones (stages.js putA): the honey of before → the 8 tones, the old ×0.88..1.04 shade kept to ±2 % */
/** the stages' stone colour (stages.js STONE.ash): the base tone */
export const ASH_HEX = hsl2hex(40, 16, 80);
const ASH0 = new Set(['#d8c9a6', '#cbb894', ASH_HEX]);
export function ashTone(out, hex, k, x, z) {
  const h = String(hex).toLowerCase(), sd = Math.round(x * 3.7 + z * 5.3) + 17;
  if (ASH0.has(h)) out.set(stoneTint(sd)); else out.set(hex);
  return out.multiplyScalar(1 + clamp((k - 0.96) * 0.25, -0.02, 0.02));
}

/* ───────── geometry ───────── */
// (a list of triangles; each triangle's winding is set outward from its reference point)
function builder(THREE) {
  const P = [], N = [], UV = [];
  const V = (a) => new THREE.Vector3(a[0], a[1], a[2]);
  function tri(a, b, c, na, nb, nc, ua = [0, 0], ub = [0, 0], uc = [0, 0], ref = [0, 0, 0]) {
    const A = V(a), B = V(b), Cc = V(c), n = new THREE.Vector3().crossVectors(B.clone().sub(A), Cc.clone().sub(A));
    const cen = A.clone().add(B).add(Cc).multiplyScalar(1 / 3).sub(V(ref));
    if (n.dot(cen) < 0) { [b, c] = [c, b]; [nb, nc] = [nc, nb]; [ub, uc] = [uc, ub]; }
    P.push(...a, ...b, ...c); N.push(...na, ...nb, ...nc); UV.push(...ua, ...ub, ...uc);
  }
  function quad(a, b, c, d, na, nb, nc, nd, ua, ub, uc, ud, ref) { tri(a, b, c, na, nb, nc, ua, ub, uc, ref); tri(a, c, d, na, nc, nd, ua, uc, ud, ref); }
  function geo() { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(N, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(UV, 2)); g.computeBoundingBox(); g.computeBoundingSphere(); return g; }
  return { tri, quad, geo };
}
/** a chamfered box (half extents h, chamfer c), flat normals on the faces, smooth across the chamfers */
function chamferBox(B, h, c) {
  const ax = [0, 1, 2];
  const pt = (o) => o;
  for (const a of ax) for (const s of [-1, 1]) {   // the faces
    const b = (a + 1) % 3, d = (a + 2) % 3, n = [0, 0, 0]; n[a] = s;
    const corner = (u, v) => { const p = [0, 0, 0]; p[a] = s * h[a]; p[b] = u * (h[b] - c); p[d] = v * (h[d] - c); return pt(p); };
    B.quad(corner(-1, -1), corner(1, -1), corner(1, 1), corner(-1, 1), n, n, n, n);
  }
  for (let a = 0; a < 3; a++) for (let b = a + 1; b < 3; b++) for (const sa of [-1, 1]) for (const sb of [-1, 1]) {   // the edges
    const d = 3 - a - b, na = [0, 0, 0], nb = [0, 0, 0]; na[a] = sa; nb[b] = sb;
    const p = (onA, v) => { const q = [0, 0, 0]; q[a] = sa * (onA ? h[a] : h[a] - c); q[b] = sb * (onA ? h[b] - c : h[b]); q[d] = v * (h[d] - c); return q; };
    B.quad(p(true, -1), p(true, 1), p(false, 1), p(false, -1), na, na, nb, nb);
  }
  for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz of [-1, 1]) {   // the corners
    B.tri([sx * h[0], sy * (h[1] - c), sz * (h[2] - c)], [sx * (h[0] - c), sy * h[1], sz * (h[2] - c)], [sx * (h[0] - c), sy * (h[1] - c), sz * h[2]], [sx, 0, 0], [0, sy, 0], [0, 0, sz]);
  }
}
const CH = 0.035, BOSS = 0.03;
const shared = (g) => { g.userData.lookShared = true; return g; };   // (cached: a prop's removal never disposes it)
/** the dressed ashlar, unit size: chamfered, and on both long faces (±z) a boss raised 0.03 with its own chamfer; its margin is a fixed
 *  width in amot, set in the shader (uv.x 2 / 3 mark the boss's foot and top) — 64 triangles */
export function ashlarGeo(THREE) {
  const C = cacheOf(THREE); if (C.ash) return C.ash;
  const B = builder(THREE); chamferBox(B, [0.5, 0.5, 0.5 - BOSS], CH);
  for (const sz of [-1, 1]) {
    const z0 = sz * (0.5 - BOSS), z1 = sz * 0.5, m0 = 0.36, m1 = 0.33, ref = [0, 0, sz * 0.4];
    const base = (sx, sy) => [sx * m0, sy * m0, z0], top = (sx, sy) => [sx * m1, sy * m1, z1];
    const nz = [0, 0, sz];
    B.quad(top(-1, -1), top(1, -1), top(1, 1), top(-1, 1), nz, nz, nz, nz, [3, 0], [3, 0], [3, 0], [3, 0], ref);
    for (const [ax, sg] of [[0, -1], [0, 1], [1, -1], [1, 1]]) {
      const n = [0, 0, sz * 0.7]; n[ax] = sg * 0.7;
      const e = ax === 0 ? [[sg, -1], [sg, 1]] : [[-1, sg], [1, sg]];
      B.quad(base(...e[0]), base(...e[1]), top(...e[1]), top(...e[0]), n, n, n, n, [2, 0], [2, 0], [3, 0], [3, 0], [0, 0, 0]);
    }
  }
  return (C.ash = shared(B.geo()));
}
/** the chamfered unit box without a boss (ends, fillers, the corner block, the parapet) — 44 triangles */
export function plainGeo(THREE) {
  const C = cacheOf(THREE); if (C.plain) return C.plain;
  const B = builder(THREE); chamferBox(B, [0.5, 0.5, 0.5], CH);
  return (C.plain = shared(B.geo()));
}
/** an ashlar with one upper corner knocked off (k 0..2: which corner); the bounding box and the bearing faces stay exact */
export function chipGeo(THREE, k) {
  const C = cacheOf(THREE); C.chip = C.chip || []; if (C.chip[k]) return C.chip[k];
  const g = ashlarGeo(THREE).clone(), P = g.attributes.position, N = g.attributes.normal, UV = g.attributes.uv;
  const [sx, sz] = [[1, 1], [-1, 1], [1, -1]][k % 3], f0 = 3 - 0.36;
  const moved = new Uint8Array(P.count);
  for (let i = 0; i < P.count; i++) {
    if (UV.getX(i) > 1.5) continue;   // (the boss lies inside the margin, clear of the cut)
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i), f = (sx * x + y + sz * z) / 0.5;
    if (f > f0) { const k2 = (f - f0) / 6; P.setXYZ(i, x - k2 * sx, y - k2, z - k2 * sz); moved[i] = 1; }
  }
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
  for (let t = 0; t < P.count; t += 3) {
    if (!moved[t] && !moved[t + 1] && !moved[t + 2]) continue;
    a.fromBufferAttribute(P, t); b.fromBufferAttribute(P, t + 1); c.fromBufferAttribute(P, t + 2);
    n.crossVectors(b.clone().sub(a), c.clone().sub(a)); if (n.lengthSq() < 1e-12) continue; n.normalize();
    for (let j = 0; j < 3; j++) N.setXYZ(t + j, n.x, n.y, n.z);
  }
  g.computeBoundingBox(); g.computeBoundingSphere();
  return (C.chip[k] = shared(g));
}
/** about one stone in five is chipped (by its seed) */
export const chipOf = (seed) => (hh(seed * 4.3 + 1.1) < 0.2 ? Math.floor(hh(seed * 9.1) * 3) : -1);
export function ashGeoOf(THREE, seed) { const k = chipOf(seed); return k < 0 ? ashlarGeo(THREE) : chipGeo(THREE, k); }

/** a paving slab w × h × d (amot), its top edges chamfered (c amot), the sides flat — 20 triangles */
export function slabGeo(THREE, w = 1, h = 1, d = 1, c = 0.04) {
  const B = builder(THREE), X = w / 2, Y = h / 2, Z = d / 2, cc = Math.min(c, X * 0.4, Z * 0.4, Y * 0.8), up = [0, 1, 0], dn = [0, -1, 0];
  B.quad([-X + cc, Y, -Z + cc], [X - cc, Y, -Z + cc], [X - cc, Y, Z - cc], [-X + cc, Y, Z - cc], up, up, up, up);
  B.quad([-X, -Y, -Z], [X, -Y, -Z], [X, -Y, Z], [-X, -Y, Z], dn, dn, dn, dn);
  for (const [n, a, b] of [[[0, 0, 1], [-X, Z], [X, Z]], [[0, 0, -1], [-X, -Z], [X, -Z]], [[1, 0, 0], [X, -Z], [X, Z]], [[-1, 0, 0], [-X, -Z], [-X, Z]]]) {
    B.quad([a[0], -Y, a[1]], [b[0], -Y, b[1]], [b[0], Y - cc, b[1]], [a[0], Y - cc, a[1]], n, n, n, n);
    const ia = [a[0] - Math.sign(a[0]) * cc, a[1] - Math.sign(a[1]) * cc], ib = [b[0] - Math.sign(b[0]) * cc, b[1] - Math.sign(b[1]) * cc];
    B.quad([a[0], Y - cc, a[1]], [b[0], Y - cc, b[1]], [ib[0], Y, ib[1]], [ia[0], Y, ia[1]], n, n, up, up);
  }
  return B.geo();
}
/** the broken slab's crack: a jagged dark ribbon len amot long (along x), lying flat, a hair over the top */
export function crackGeo(THREE, len, seed = 1) {
  const n = 9, P = [], r = rnd(seed * 977 + 13);
  const pts = []; let z = 0; for (let i = 0; i <= n; i++) { z += (r() - 0.5) * len * 0.08; pts.push([-len / 2 + (len * i) / n, z, 0.035 + r() * 0.05]); }
  for (let i = 0; i < n; i++) { const [x0, z0, w0] = pts[i], [x1, z1, w1] = pts[i + 1];
    P.push(x0, 0, z0 - w0, x1, 0, z1 - w1, x1, 0, z1 + w1, x0, 0, z0 - w0, x1, 0, z1 + w1, x0, 0, z0 + w0); }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.computeVertexNormals(); return g;
}
