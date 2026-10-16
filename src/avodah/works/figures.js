/* ── figures24 ── figures.js — the people and animals of the works (WAVE24 FIGURES24: "רזולוציה כללית מדי", "ברכת כהנים לא מבוצעת כמו הכהנים").
 * One rigged kohen shared by every work: the ketonet's skirt and its upper part, the avnet at the height of the elbows (linen, techelet,
 * argaman — the shani is left out: no red material in a work, ⚑), a head with eyes, brows, nose, ears and beard, the migba'at wound
 * round it, upper arm + forearm solved by two-bone IK (the elbow goes where its pole says), a palm, four fingers of two joints and a
 * thumb on each hand, bare feet. Every part is ONE InstancedMesh shared by all the figures of the frame (10 draw calls for a crowd of
 * 13 or 70); a figure smaller than ~70 px on the screen keeps mitten hands (no fingers). No image, no red, no Name.
 *   man(k, a, s, y, o) → { L, R, head }  — the same call every work already makes (robe, skin, cap, yaw, arms, lean, torch, sit, lying,
 *   scale, t) plus o.pose ∈ POSES and o.u (0…1: how far into it). L / R / head come back in the kit's LOCAL (a, s, y): hang a vessel
 *   exactly in the hands.  The blessing (תמיד ז, ב; סוטה ז, ו "במקדש — על גבי ראשיהם"): both hands above the head, the palms out
 *   toward the people, the thumbs all but touching, each hand's fingers split in two pairs (the kohanim's custom: the windows).
 * k = the kit (kit.js); a, s, y = the kit's local frame; every figure faces `yaw` (0 = along the line, away from the player; π = toward him). ── /figures24 ── */
import * as THREE from 'three';
import { h26Fig, h26Note } from './hero26.js';   // ── hero26 ── ── /hero26 ──

export const SKIN = ['#E0B58C', '#D3A27A', '#C79468'], LINEN = '#EFE9DA', ROBE = { kohen: '#EFE9DA', levi: '#7C8AA3', guard: '#8F8670', amarkal: '#C9B58A', worker: '#A8957A' };
export const WOOL = '#F3EDE0', WOOL2 = '#E6DDC9', HOOF = '#6B5A46', FACE = '#CDB892';
export const POSES = ['stand', 'walk', 'carry', 'scoop', 'pour', 'bow', 'bless', 'reach', 'raise', 'torch', 'point', 'hold', 'lots'];
const TECH = '#3A63A8', ARG = '#6E3A78';   // (the avnet: techelet and argaman; linen between — never the shani)

/* ───────── the body's measures (local units at scale 1; ~1.53 to the top of the migba'at) ───────── */
const HIP = 0.74, SHX = 0.175, SHY = 1.13, UP = 0.27, FORE = 0.235, PALM = 0.085, PALMW = 0.075, PALMT = 0.032, NECK = 1.19, HEADC = 1.33;
const FING = [[0.028, 0.078, 0.0105], [0.0095, 0.085, 0.011], [-0.0095, 0.08, 0.0105], [-0.027, 0.064, 0.0092]];   // index, middle, ring, little: [across, length, radius]
const SPLIT0 = [0.06, 0.02, -0.02, -0.06], SPLIT1 = [0.24, 0.18, -0.18, -0.24];   // (a hand at rest · the kohanim's split: two pairs, a window between)
const MAXF = 80;

/* ───────── the pose library: the right arm (the left mirrors it unless given) in the body's frame: x his right, y up, z forward ─────────
 * w = the wrist, pole = where the elbow goes, hd = wrist → knuckles, pn = out of the palm, curl 0…1, split 0…1, th = the thumb's way */
const V = (x, y, z) => [x, y, z];
const ARM_STAND = { w: V(0.2, 0.665, 0.035), pole: V(0.3, 0, -1), hd: V(0, -1, 0.06), pn: V(-1, 0, 0), curl: 0.35, split: 0, th: 'rest' };
const P = {
  stand: { lean: 0, head: 0, R: ARM_STAND },
  carry: { lean: 0.04, head: 0.12, R: { w: V(0.1, 0.9, 0.26), pole: V(1, -0.4, -0.3), hd: V(-0.3, 0.12, 1), pn: V(-1, 0.25, 0), curl: 0.6, split: 0, th: 'grip' } },
  reach: { lean: 0.08, head: 0.1, R: { w: V(0.15, 1.04, 0.4), pole: V(0.6, -1, -0.2), hd: V(0, 0.05, 1), pn: V(0, -1, 0.1), curl: 0.2, split: 0, th: 'open' } },
  raise: { lean: -0.04, head: -0.15, R: { w: V(0.2, 1.58, 0.1), pole: V(1, 0, -0.2), hd: V(0, 1, 0.05), pn: V(-1, 0, 0), curl: 0.15, split: 0, th: 'open' } },
  bless: { lean: -0.03, head: -0.06, R: { w: V(0.09, 1.585, 0.075), pole: V(1, -0.15, 0.25), hd: V(-0.06, 1, 0.06), pn: V(0, 0.04, 1), curl: 0.02, split: 1, th: 'kohen' } },
  scoop: { lean: 0.62, head: 0.25, R: { w: V(0.12, 0.74, 0.36), pole: V(1, -0.2, -0.4), hd: V(0, -0.55, 1), pn: V(-1, 0, 0), curl: 0.82, split: 0, th: 'grip' }, L: { w: V(-0.06, 0.9, 0.24), pole: V(-1, -0.2, -0.4), hd: V(0.1, -0.55, 1), pn: V(1, 0, 0), curl: 0.82, split: 0, th: 'grip' } },
  pour: { lean: 0.14, head: 0.3, R: { w: V(0.14, 1.0, 0.33), pole: V(1, -0.6, -0.2), hd: V(-0.05, 0.2, 1), pn: V(-1, 0, 0), curl: 0.6, split: 0, th: 'grip' }, L: { w: V(-0.04, 0.9, 0.3), pole: V(-1, -0.6, -0.2), hd: V(0.15, 0.1, 1), pn: V(0, 1, 0), curl: 0.3, split: 0, th: 'open' } },
  torch: { lean: 0, head: 0, R: { w: V(0.21, 1.2, 0.2), pole: V(1, -1, -0.3), hd: V(0, 1, 0.12), pn: V(-1, 0, 0), curl: 0.92, split: 0, th: 'grip' }, L: null },
  point: { lean: 0.03, head: 0, R: { w: V(0.17, 1.26, 0.42), pole: V(1, -1, -0.2), hd: V(0, 0.25, 1), pn: V(-1, 0, 0), curl: 0.85, split: 0, th: 'grip', point: 1 }, L: null },
  lots: { lean: 0.06, head: 0.2, R: { w: V(0.12, 1.15, 0.44), pole: V(1, -1, -0.3), hd: V(-0.15, 0.15, 1), pn: V(0, -1, 0), curl: 0.95, split: 0, th: 'grip', point: 1 }, L: null },   // (the פיס: the hand out, one or two fingers — o.fingers)
  hold: { lean: 0.03, head: 0.18, R: { w: V(0.12, 1.0, 0.3), pole: V(1, -1, -0.3), hd: V(-0.1, 0.45, 1), pn: V(0, 1, 0), curl: 0.25, split: 0, th: 'open' }, L: { w: V(-0.12, 1.0, 0.3), pole: V(-1, -1, -0.3), hd: V(0.1, 0.45, 1), pn: V(0, 1, 0), curl: 0.25, split: 0, th: 'open' } },
};
P.bow = { lean: 0.95, head: 0.35, hang: true, R: { w: V(0.17, 0.68, 0.12), pole: V(0.4, 0, -1), hd: V(0, -1, 0.1), pn: V(-1, 0, 0), curl: 0.3, split: 0, th: 'rest' } };
P.walk = P.stand;
export const POSE = P;
const mirror = (A) => A && { ...A, w: V(-A.w[0], A.w[1], A.w[2]), pole: V(-A.pole[0], A.pole[1], A.pole[2]), hd: V(-A.hd[0], A.hd[1], A.hd[2]), pn: V(-A.pn[0], A.pn[1], A.pn[2]) };
const ARM_STAND_L = mirror(ARM_STAND);

/* ───────── small vector math on arrays (figure space) ───────── */
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2], len = (a) => Math.hypot(a[0], a[1], a[2]);
const nrm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const lerpV = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
const ortho = (v, d) => { const o = sub(v, mul(d, dot(v, d))); return len(o) < 1e-4 ? null : nrm(o); };
const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
const sm = (u) => u * u * (3 - 2 * u);

/** an arm's params between two (stand → pose) at u; the wrist's path swings forward on the way (never through the chest) */
function mixArm(A, B, u) {
  if (u <= 0) return A; if (u >= 1) return B;
  const e = sm(u), w = lerpV(A.w, B.w, e); w[2] += 0.18 * Math.sin(Math.PI * e) * (B.w[1] - A.w[1] > 0.3 ? 1 : 0.3);
  return { w, pole: lerpV(A.pole, B.pole, e), hd: nrm(lerpV(A.hd, B.hd, e)), pn: nrm(lerpV(A.pn, B.pn, e)), curl: A.curl + (B.curl - A.curl) * e, split: A.split + (B.split - A.split) * e, th: e < 0.5 ? A.th : B.th, point: e * (B.point || 0) };
}

/* ───────── the parts (built once, lazily: node tests never build them) ───────── */
function colorize(g, c) { const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c; a[i * 3 + 1] = c; a[i * 3 + 2] = c; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; }
function colorHex(g, hex) { const c = new THREE.Color(hex), n = g.attributes.position.count, a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g; }
function merge(list) {
  const gs = list.map((g) => (g.index ? g.toNonIndexed() : g));
  let n = 0; for (const g of gs) n += g.attributes.position.count;
  const P3 = new Float32Array(n * 3), N3 = new Float32Array(n * 3), C3 = new Float32Array(n * 3); let o = 0;
  for (const g of gs) { const c = g.attributes.position.count; P3.set(g.attributes.position.array, o * 3); N3.set(g.attributes.normal.array, o * 3); C3.set(g.attributes.color.array, o * 3); o += c; }
  const m = new THREE.BufferGeometry(); m.setAttribute('position', new THREE.BufferAttribute(P3, 3)); m.setAttribute('normal', new THREE.BufferAttribute(N3, 3)); m.setAttribute('color', new THREE.BufferAttribute(C3, 3));
  m.computeBoundingSphere(); return m;
}
const sph = (r, x, y, z, sx = 1, sy = 1, sz = 1, w = 10, h = 7, c = 1) => colorize(new THREE.SphereGeometry(r, w, h).scale(sx, sy, sz).translate(x, y, z), c);
const lathe = (pts, n, c = 1) => colorize(new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n), c);
function buildGeos() {
  const G = {};
  // the ketonet's skirt, ground to the hips, in soft folds (more toward the hem); the hem a shade darker
  const sk = new THREE.LatheGeometry([[0.001, 0.035], [0.205, 0.035], [0.2, 0.1], [0.19, 0.35], [0.174, 0.6], [0.16, 0.74], [0.13, 0.785], [0.001, 0.79]].map(([r, y]) => new THREE.Vector2(r, y)), 22);
  { const p = sk.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z); if (r < 0.01) continue; const k = 1 + 0.055 * Math.sin(Math.atan2(z, x) * 9 + 0.6) * clamp01((0.74 - y) / 0.7); p.setXYZ(i, x * k, y, z * k * 0.86); } sk.computeVertexNormals(); }
  G.skirt = merge([colorize(sk, 1), colorize(new THREE.TorusGeometry(0.2, 0.012, 4, 22).rotateX(Math.PI / 2).scale(1, 1, 0.86).translate(0, 0.045, 0), 0.86)]);
  // the upper ketonet (from the hips, y 0 = the hips), its neckline
  G.torso = merge([lathe([[0.001, -0.03], [0.156, -0.03], [0.152, 0.06], [0.16, 0.18], [0.174, 0.3], [0.184, 0.37], [0.172, 0.42], [0.125, 0.458], [0.06, 0.474], [0.001, 0.476]], 18).scale(1, 1, 0.78),
    colorize(new THREE.TorusGeometry(0.052, 0.009, 4, 12).rotateX(Math.PI / 2).translate(0, 0.468, 0.004), 0.88)]);
  // the avnet wound round at the height of the elbows, its two ends hanging in front (linen · techelet · argaman, illustration)
  { const bands = [], H = [['#ECE6D6', 0.018], [TECH, 0.024], ['#ECE6D6', 0.01], [ARG, 0.024], ['#ECE6D6', 0.01], [TECH, 0.024], ['#ECE6D6', 0.018]]; let y = 0.11;
    for (const [c, h] of H) { bands.push(colorHex(new THREE.CylinderGeometry(0.171, 0.168, h, 18, 1, true).scale(1, 1, 0.8).translate(0, y + h / 2, 0), c)); y += h; }
    bands.push(colorHex(new THREE.BoxGeometry(0.028, 0.4, 0.008).translate(0.032, -0.08, 0.142).rotateX(-0.03), TECH));
    bands.push(colorHex(new THREE.BoxGeometry(0.028, 0.36, 0.008).translate(-0.006, -0.06, 0.142).rotateX(-0.03), ARG));
    G.avnet = merge(bands); }
  // the head about its centre: skin (the instance colour) and the darker parts as shares of it — hair, beard, eyes, brows
  G.head = merge([
    sph(0.108, 0, 0, 0, 0.9, 1.06, 0.98, 18, 14),
    sph(0.104, 0, 0.008, -0.016, 0.99, 1.0, 1.0, 14, 10, 0.42),                                       // the hair (back and temples)
    colorize(new THREE.SphereGeometry(0.11, 16, 8, 0, Math.PI * 2, Math.PI * 0.62, Math.PI * 0.38).scale(0.92, 1.1, 0.98).translate(0, -0.006, 0.004), 0.45),   // the beard
    sph(0.033, 0, -0.032, 0.1, 1, 0.28, 0.36, 8, 5, 0.42),                                             // the moustache
    sph(0.021, 0.036, 0.014, 0.088, 1, 0.8, 0.6, 8, 6, 1.4), sph(0.021, -0.036, 0.014, 0.088, 1, 0.8, 0.6, 8, 6, 1.4),   // the eyes' whites
    sph(0.0125, 0.036, 0.013, 0.1, 1, 1.1, 0.6, 8, 6, 0.07), sph(0.0125, -0.036, 0.013, 0.1, 1, 1.1, 0.6, 8, 6, 0.07),   // the eyes
    colorize(new THREE.BoxGeometry(0.036, 0.008, 0.012).rotateZ(-0.12).translate(0.037, 0.039, 0.097), 0.3), colorize(new THREE.BoxGeometry(0.036, 0.008, 0.012).rotateZ(0.12).translate(-0.037, 0.039, 0.097), 0.3),
    sph(0.017, 0, -0.006, 0.106, 0.8, 1.3, 1, 8, 6, 0.93),                                            // the nose
    sph(0.022, 0.097, 0, -0.004, 0.45, 1, 0.7, 8, 6, 0.93), sph(0.022, -0.097, 0, -0.004, 0.45, 1, 0.7, 8, 6, 0.93),   // the ears
    colorize(new THREE.CylinderGeometry(0.045, 0.05, 0.12, 10).translate(0, -0.12, -0.008), 0.94),       // the neck
  ]);
  // the migba'at: linen wound round the head, low on the brow (its shape: illustration)
  G.cap = merge([lathe([[0.096, 0.028], [0.118, 0.05], [0.124, 0.1], [0.118, 0.15], [0.1, 0.18], [0.06, 0.196], [0.001, 0.2]], 18).scale(1, 1, 0.98),
    ...[[0.058, 0.122, 0.12], [0.098, 0.124, -0.1], [0.138, 0.12, 0.09]].map(([y, r, t]) => colorize(new THREE.TorusGeometry(r, 0.0075, 4, 20).rotateX(Math.PI / 2 + t).translate(0, y, 0), 0.86))]);
  G.foot = sph(1, 0, 0.026, 0.03, 0.042, 0.028, 0.072, 9, 6);
  G.limb = colorize(new THREE.CylinderGeometry(0.84, 1, 1, 10, 1).translate(0, 0.5, 0), 1);
  G.ball = sph(1, 0, 0, 0, 1, 1, 1, 10, 7);
  G.palm = merge([sph(0.5, 0, 0.5, 0, 1, 1.04, 1, 10, 8), sph(0.5, 0, 0.98, 0, 0.98, 0.18, 0.95, 10, 5, 0.97)]);
  G.finger = merge([colorize(new THREE.CylinderGeometry(1, 1, 1, 7, 1, true).translate(0, 0.5, 0), 1), sph(1, 0, 1, 0, 1, 0.33, 1, 7, 4), sph(1, 0, 0, 0, 1, 0.33, 1, 7, 4, 0.97)]);
  return G;
}

/* ───────── the pool: one InstancedMesh per part, hung on the kit's root; the kit's begin/end reset and commit it ───────── */
const tM = new THREE.Matrix4(), tX = new THREE.Vector3(), tY = new THREE.Vector3(), tZ = new THREE.Vector3(), tP = new THREE.Vector3(), tC = new THREE.Color();
const colorCache = new Map();
const col = (hex) => { let c = colorCache.get(hex); if (!c) { c = new THREE.Color(hex); colorCache.set(hex, c); } return c; };
let GEOS = null;
function poolOf(k) {
  if (k.__fig24) return k.__fig24;
  const root = (k.light && k.light.parent) || null;
  if (!root || !THREE.InstancedMesh) return null;
  if (!GEOS) GEOS = buildGeos();
  const caps = { skirt: MAXF, torso: MAXF, avnet: MAXF, head: MAXF, cap: MAXF, foot: MAXF * 2, limb: MAXF * 8, ball: MAXF * 4, palm: MAXF * 2, finger: MAXF * 20 };
  const mats = { cloth: new THREE.MeshStandardMaterial({ color: '#FFFFFF', vertexColors: true, roughness: 0.9 }), skin: new THREE.MeshStandardMaterial({ color: '#FFFFFF', vertexColors: true, roughness: 0.62 }) };
  const M = {}, N = {};
  for (const key in caps) {
    const m = new THREE.InstancedMesh(GEOS[key], /head|foot|palm|finger/.test(key) ? mats.skin : mats.cloth, caps[key]);
    m.name = 'f24-' + key; m.frustumCulled = false; m.visible = false; m.count = 0; m.castShadow = false; m.receiveShadow = false; m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    const c = new THREE.Color(1, 1, 1); for (let i = 0; i < caps[key]; i++) m.setColorAt(i, c);
    root.add(m); M[key] = m; N[key] = 0;
  }
  const pool = { M, N, caps, figs: 0, fingers: 0 };
  const b0 = k.begin, e0 = k.end, r0 = k.reds, s0 = k.stats;
  k.begin = function () { for (const key in N) N[key] = 0; pool.figs = 0; pool.fingers = 0; return b0.apply(k, arguments); };
  k.end = function () { for (const key in M) { const m = M[key]; m.count = N[key]; m.visible = N[key] > 0 && k.F.on; m.instanceMatrix.needsUpdate = true; if (m.instanceColor) m.instanceColor.needsUpdate = true; } return e0.apply(k, arguments); };
  k.reds = function () { let n = r0.apply(k, arguments); for (const key in M) { const m = M[key]; for (let i = 0; i < m.count; i++) { m.getColorAt(i, tC); const h = tC.getHex(), r = (h >> 16) & 255, g = (h >> 8) & 255, b = h & 255; if (r >= 140 && g <= r * 0.45 && b <= r * 0.45) n++; } } return n; };
  k.stats = function () { return Object.assign(s0.apply(k, arguments), { figs: pool.figs, fingers: pool.fingers }); };
  k.__fig24 = pool;
  return pool;
}
function putBasis(pool, key, pos, X, Y, Z, sx, sy, sz, hex) {
  const i = pool.N[key]; if (i >= pool.caps[key]) return;
  tX.set(X[0] * sx, X[1] * sx, X[2] * sx); tY.set(Y[0] * sy, Y[1] * sy, Y[2] * sy); tZ.set(Z[0] * sz, Z[1] * sz, Z[2] * sz);
  tM.makeBasis(tX, tY, tZ); tM.setPosition(pos[0], pos[1], pos[2]);
  const m = pool.M[key]; m.setMatrixAt(i, tM); m.setColorAt(i, col(hex)); pool.N[key] = i + 1;
}
/** a segment A → B (world), its section sx × sz, its front toward `front` */
function putSeg(pool, key, A, B, sx, sz, front, hex) {
  const d = sub(B, A), L = len(d); if (L < 1e-6) return;
  const Y = mul(d, 1 / L); let Z = ortho(front, Y); if (!Z) Z = ortho([0, 1, 0.3], Y) || [1, 0, 0];
  const X = cross(Y, Z);
  putBasis(pool, key, A, X, Y, Z, sx, L, sz, hex);
}

/** two-bone IK (figure space): the elbow of shoulder S reaching wrist W, bent toward `pole` */
function elbowOf(S, W, l1, l2, pole) {
  let d = sub(W, S), D = len(d); const dn = mul(d, 1 / (D || 1));
  const Dc = Math.max(Math.abs(l1 - l2) + 1e-3, Math.min(l1 + l2 - 1e-4, D));
  const a = (l1 * l1 - l2 * l2 + Dc * Dc) / (2 * Dc), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const q = ortho(pole, dn) || ortho([0, -1, 0], dn) || [1, 0, 0];
  const E = add(add(S, mul(dn, a)), mul(q, h));
  return { E, W: add(S, mul(dn, Dc)) };   // (a wrist out of reach comes in along the line)
}

/* ───────── man: the figure ───────── */
/** a standing, walking, sitting or lying man. o: { robe, skin, cap, yaw, scale, pose, u, t, avnet, fingers (lots / point: how many held out), arms (legacy 0…2.3), lean (legacy), torch, sit, lying, held }
 *  → { L, R, head } in the kit's local (a, s, y) */
export function man(k, a, s, y, o = {}) {
  // ── hero26 ── the player's figure: the work's acting kohen wears the hero's look (hero26.js h26Fig: o.hero, or the work's ACTOR); an epilogue may re-pose it
  const h26 = h26Fig(k, a, s, o); if (h26) { o = h26; if (o.__a != null) { a = o.__a; s = o.__s; } }
  // ── /hero26 ──
  if (k.fig) k.fig(a, s, y, 'man');   // ── blooda25 ── (the blood check: no palette piece by a figure)
  const yaw = o.yaw || 0, sc = o.scale || 1, robe = o.robe || ROBE.kohen, skin = o.skin || SKIN[0];
  const cap = o.cap || (robe === ROBE.kohen ? '#F4EFE3' : '#5C5242');
  const avnet = o.avnet == null ? robe === ROBE.kohen : !!o.avnet;
  // the pose: named, or read from the old knobs (arms 0…1 reach forward, …2.3 hands up; lean = a bow; torch)
  let name = o.pose, u = o.u == null ? 1 : clamp01(o.u);
  if (!name) {
    if (o.torch) name = 'torch';
    else if ((o.arms || 0) > 1.05) { name = 'raise'; u = clamp01((o.arms - 1.05) / 1.1); }
    else if ((o.arms || 0) > 0.12) { name = 'reach'; u = clamp01((o.arms - 0.12) / 0.8); }
    else name = 'stand';
  }
  const PZ = P[name] || P.stand, legacyBow = o.pose ? 0 : Math.min(1.0, (o.lean || 0) * 0.55);
  let Rr, Ll;
  if (name === 'raise' && o.arms != null && o.arms > 1.05) { Rr = mixArm(P.reach.R, P.raise.R, u); Ll = mixArm(mirror(P.reach.R), mirror(P.raise.R), u); }
  else { Rr = mixArm(ARM_STAND, PZ.R, u); Ll = PZ.L === null ? ARM_STAND_L : mixArm(ARM_STAND_L, PZ.L || mirror(PZ.R), u); }
  let lean = (PZ.lean || 0) * sm(u) + legacyBow, headP = (PZ.head || 0) * sm(u);
  const hang = !!PZ.hang || legacyBow > 0.05;
  const t = o.t || 0, walk = name === 'walk' || o.walk ? Math.sin(t * 7.5 + a * 1.3 + s) : 0, walking = name === 'walk' || !!o.walk;
  if (o.fingers && Rr.point) Rr = { ...Rr, ext: Math.max(1, Math.min(4, o.fingers | 0)) };
  if (walking) { Rr = { ...Rr, w: add(Rr.w, V(0, 0.02 * Math.abs(walk), -0.11 * walk)) }; Ll = { ...Ll, w: add(Ll.w, V(0, 0.02 * Math.abs(walk), 0.11 * walk)) }; }
  // the world frame of this figure: R0 its root, rW / uW / fW its right, up and forward (each G long); lying: up → forward, forward → up
  const F = k.F || { fx: 1, fz: 0, K: 1, Ca: 1, a0: 0 }, K = F.K || 1, G = K * sc, cy = Math.cos(yaw), sy = Math.sin(yaw);
  const Aw = [F.fx, 0, F.fz], Sw = [-F.fz, 0, F.fx];
  let fW = add(mul(Aw, cy), mul(Sw, sy)), uW = [0, 1, 0], rW = add(mul(Aw, -sy), mul(Sw, cy));
  let y0 = y;
  if (o.lying) { const f0 = fW; fW = uW; uW = f0; y0 = y + 0.02; }
  const R0w = k.world ? (k.world(a, s, y0, tP), [tP.x, tP.y, tP.z]) : [a, y0, s];
  rW = mul(rW, G); uW = mul(uW, G); fW = mul(fW, G);
  const W = (p) => [R0w[0] + rW[0] * p[0] + uW[0] * p[1] + fW[0] * p[2], R0w[1] + rW[1] * p[0] + uW[1] * p[1] + fW[1] * p[2], R0w[2] + rW[2] * p[0] + uW[2] * p[1] + fW[2] * p[2]];
  const Wd = (d) => nrm([rW[0] * d[0] + uW[0] * d[1] + fW[0] * d[2], rW[1] * d[0] + uW[1] * d[1] + fW[1] * d[2], rW[2] * d[0] + uW[2] * d[1] + fW[2] * d[2]]);
  // (kit-local of a figure point, so a prop drawn by the kit lands on it under the stage's squash Ca)
  const Lo = (p) => [a + (p[2] * cy - p[0] * sy) * sc / (F.Ca || 1), s + (p[2] * sy + p[0] * cy) * sc, y0 + p[1] * sc];
  const pool = poolOf(k), RET = { L: null, R: null, head: null };
  const Rh = Rr, Lh = Ll;
  // the body: the hips' pivot, the trunk leaned forward by `lean` about the hips (a seated man's hips are lower)
  const hipY = o.sit ? 0.42 : HIP;
  const cl = Math.cos(lean), sl = Math.sin(lean), bu = [0, cl, sl], bf = [0, -sl, cl];
  const body = (p) => [p[0], hipY + bu[1] * (p[1] - HIP) + bf[1] * p[2], bu[2] * (p[1] - HIP) + bf[2] * p[2]];
  const bodyD = (d) => [d[0], bu[1] * d[1] + bf[1] * d[2], bu[2] * d[1] + bf[2] * d[2]];
  // the head: on the neck, pitched by headP more
  const ch = Math.cos(lean + headP), shh = Math.sin(lean + headP), hu = [0, ch, shh], hf = [0, -shh, ch];
  const neck = body([0, NECK, 0]), hc = add(neck, mul(hu, HEADC - NECK));
  // the arms
  const arms = [];
  for (const [sg, A] of [[1, Rh], [-1, Lh]]) {
    const S0 = [sg * SHX, SHY, 0], S = body(S0);
    let Wt, pole, hd, pn;
    if (hang) { Wt = add(S, sub(A.w, S0)); pole = A.pole; hd = A.hd; pn = A.pn; }
    else { Wt = body(A.w); pole = bodyD(A.pole); hd = bodyD(A.hd); pn = bodyD(A.pn); }
    const { E, W: Wr } = elbowOf(S, Wt, UP, FORE, pole);
    hd = nrm(hd); pn = ortho(pn, hd) || [0, 0, 1];
    arms.push({ sg, S, E, Wr, hd, pn, A });
  }
  // the hands' grip points (returned: where a held thing sits)
  for (const H of arms) { const g = add(add(H.Wr, mul(H.hd, PALM * 0.62)), mul(H.pn, 0.035)); (H.sg > 0 ? (RET.R = Lo(g)) : (RET.L = Lo(g))); }
  RET.head = Lo(add(hc, [0, 0.21, 0]));
  if (!pool) return RET;
  if (pool.figs >= MAXF) return RET;
  pool.figs++;
  // (how big on the screen: a far figure keeps mitten hands)
  let fine = true;
  if (k.screen) { const p0 = k.screen(a, s, y0), p1 = k.screen(a, s, y0 + 1.5 * sc); fine = Math.abs(p1.y - p0.y) > 70 || !p0.on; }
  const up = Wd([0, 1, 0]), fwd = Wd([0, 0, 1]), right = cross(up, fwd);   // (a proper rotation for the instances: x = y × z; the parts are symmetric)
  // skirt (from the ground; a seated man's is short), feet
  const skY = o.sit ? hipY / HIP : 1;
  if (o.hero === true) h26Note(k, a, s, y0, R0w, fW, sc, pool.N.skirt);   // ── hero26 ── (his spot, his ring; the skirt's instance index: tests read its colour) ── /hero26 ──
  putBasis(pool, 'skirt', R0w, right, up, fwd, G, G * skY, G, robe);
  const fz = walking ? 0.09 * walk : 0;
  for (const sg of [1, -1]) {
    const fp = o.sit ? [sg * 0.085, 0, 0.42] : [sg * 0.075, 0, 0.04 + sg * fz];
    putBasis(pool, 'foot', W(fp), right, up, fwd, G, G, G, skin);
  }
  if (o.sit) for (const sg of [1, -1]) { putSeg(pool, 'limb', W([sg * 0.085, hipY, 0.0]), W([sg * 0.085, hipY + 0.02, 0.4]), 0.085 * G, 0.085 * G, uW, robe); putSeg(pool, 'limb', W([sg * 0.085, hipY + 0.02, 0.4]), W([sg * 0.085, 0.04, 0.42]), 0.075 * G, 0.075 * G, fW, robe); }
  // the trunk and the avnet (their y 0 at the hips), the head, the migba'at
  const hipW = W([0, hipY, 0]), bU = Wd(bu), bF = Wd(bf), bR = cross(bU, bF);
  putBasis(pool, 'torso', hipW, bR, bU, bF, G, G, G, robe);
  if (avnet) putBasis(pool, 'avnet', hipW, bR, bU, bF, G, G, G, '#FFFFFF');
  const hU = Wd(hu), hF = Wd(hf), hR = cross(hU, hF), hcW = W(hc);
  putBasis(pool, 'head', hcW, hR, hU, hF, G, G, G, skin);
  putBasis(pool, 'cap', hcW, hR, hU, hF, G, G, G, cap);
  // the arms: shoulder ball, upper sleeve, elbow ball, forearm sleeve to the wrist; the hand
  for (const H of arms) {
    const Sw2 = W(H.S), Ew = W(H.E), Ww = W(H.Wr), pnW = Wd(H.pn), hdW = Wd(H.hd);
    putBasis(pool, 'ball', Sw2, right, up, fwd, 0.056 * G, 0.056 * G, 0.056 * G, robe);
    putSeg(pool, 'limb', Sw2, Ew, 0.05 * G, 0.05 * G, fwd, robe);
    putBasis(pool, 'ball', Ew, right, up, fwd, 0.044 * G, 0.044 * G, 0.044 * G, robe);
    putSeg(pool, 'limb', Ew, Ww, 0.042 * G, 0.042 * G, fwd, robe);
    hand(pool, H, W, Wd, G, skin, fine || !!o.fingers, Ww, hdW, pnW);
  }
  // a torch in the right hand: the stave and the flame by the kit
  if (o.torch && k.c) { const g = RET.R; k.c(g[0], g[1], g[2] + 0.3 * sc, 0.03 * sc, 0.8 * sc, '#6B4A2B'); flame(k, g[0], g[1], g[2] + 0.7 * sc, o.torch * sc * 0.6, t); }
  return RET;
}
/** a hand: the palm from the wrist, then four fingers of two joints and the thumb (figure space → world) */
function hand(pool, H, W, Wd, G, skin, fine, Ww, hdW, pnW) {
  const A = H.A, sg = H.sg, hd = H.hd, pn = H.pn;
  const th = mul(cross(hd, pn), -sg);   // (the thumb's side: toward the middle for a palm turned out)
  if (!fine) { putSeg(pool, 'palm', Ww, W(add(H.Wr, mul(hd, PALM + 0.06))), PALMW * G, PALMT * 1.2 * G, pnW, skin); return; }
  putSeg(pool, 'palm', Ww, W(add(H.Wr, mul(hd, PALM))), PALMW * G, PALMT * G, pnW, skin);
  const kc = add(H.Wr, mul(hd, PALM * 0.94)), curl = A.curl || 0, split = A.split || 0;
  for (let f = 0; f < 4; f++) {
    const [ac, L, r] = FING[f], sp = SPLIT0[f] + (SPLIT1[f] - SPLIT0[f]) * split;
    const c = A.point && f < (A.ext || 1) ? curl * (1 - A.point) : curl;   // (point / lots: the first `ext` fingers straight)
    const base = add(kc, mul(th, ac * (1 + 0.25 * split)));
    const d0 = nrm(add(hd, mul(th, sp)));
    const d1 = nrm(add(mul(d0, Math.cos(c * 1.15)), mul(pn, Math.sin(c * 1.15)))), d2 = nrm(add(mul(d0, Math.cos(c * 2.5)), mul(pn, Math.sin(c * 2.5))));
    const m1 = add(base, mul(d1, L * 0.56)), tip = add(m1, mul(d2, L * 0.44));
    const bw = W(base), mw = W(m1);
    putSeg(pool, 'finger', bw, mw, r * G, r * 0.9 * G, pnW, skin); putSeg(pool, 'finger', mw, W(tip), r * 0.92 * G, r * 0.85 * G, pnW, skin);
    pool.fingers++;
  }
  // the thumb: from the heel of the palm on its side; open, round a grip, or the kohanim's — out wide toward the other hand's
  const tb = add(add(H.Wr, mul(hd, 0.022)), mul(th, 0.03)), wt = A.th;
  const td = wt === 'grip' ? nrm(add(add(mul(hd, 0.55), mul(pn, 0.7)), mul(th, 0.2))) : wt === 'kohen' ? nrm(add(add(mul(hd, 0.42), mul(th, 0.9)), mul(pn, 0.06))) : wt === 'open' ? nrm(add(mul(hd, 0.6), mul(th, 0.72))) : nrm(add(add(mul(hd, 0.8), mul(th, 0.35)), mul(pn, 0.3)));
  const td2 = wt === 'grip' ? nrm(add(td, mul(th, -0.6))) : wt === 'kohen' ? nrm(add(td, mul(hd, 0.25))) : td;
  const t1 = add(tb, mul(td, 0.034)), t2 = add(t1, mul(td2, 0.03));
  putSeg(pool, 'finger', W(tb), W(t1), 0.0135 * G, 0.012 * G, pnW, skin); putSeg(pool, 'finger', W(t1), W(t2), 0.0118 * G, 0.0108 * G, pnW, skin);
}

/** many figures at once (the 8 of the lots, the 13, the Levites): list = [[a, s, y, o], …] — the same instancing, one call */
export function crowd(k, list) { for (const f of list) man(k, f[0], f[1], f[2], f[3] || {}); }

/** a flame: three glowing blobs flickering with time t (orange and gold — never red) */
export function flame(k, a, s, y, size = 1, t = 0) {
  const f1 = 1 + 0.12 * Math.sin(t * 17 + a * 3), f2 = 1 + 0.18 * Math.sin(t * 23 + 1.7 + s);
  k.s(a, s, y + 0.1 * size, 0.2 * size * f1, 0.34 * size * f2, 0.2 * size * f1, '!#FFA22E');
  k.s(a, s, y + 0.16 * size, 0.12 * size * f2, 0.24 * size * f1, 0.12 * size * f2, '!#FFD76A');
  k.s(a, s, y + 0.2 * size, 0.06 * size, 0.12 * size * f2, 0.06 * size, '!#FFF3C4');
}

/** a lamb. o: { yaw, scale, lift, head: 0…1 (head raised), glow: 0…1 (a gold ring about it), mark: bool (a gold ear-ring: "מבוקר"), step (leg swing phase) } */
export function lamb(k, a, s, y, o = {}) {
  if (k.fig) k.fig(a, s, y, 'lamb');   // ── blooda25 ──
  const yaw = o.yaw || 0, sc = o.scale || 1, lift = o.lift || 0, ph = o.step || 0;
  const L = (da, ds) => [a + (da * Math.cos(yaw) - ds * Math.sin(yaw)) * sc, s + (da * Math.sin(yaw) + ds * Math.cos(yaw)) * sc];
  const y0 = y + lift, wool = o.wool || WOOL;
  k.s(a, s, y0 + 0.5 * sc, 0.3 * sc, 0.27 * sc, 0.46 * sc, wool, { yaw: yawOf(yaw) });                                      // the body
  const [ba, bs] = L(0.5, 0);
  k.s(ba, bs, y0 + (0.62 + 0.12 * (o.head == null ? 0.4 : o.head)) * sc, 0.17 * sc, 0.17 * sc, 0.2 * sc, FACE, { yaw: yawOf(yaw) });      // the head
  const [ea, es] = L(0.44, 0.17), [fa, fs] = L(0.44, -0.17);
  k.s(ea, es, y0 + 0.72 * sc, 0.07 * sc, 0.05 * sc, 0.13 * sc, FACE, { yaw: yawOf(yaw), roll: 0.5 });                                     // the ears
  k.s(fa, fs, y0 + 0.72 * sc, 0.07 * sc, 0.05 * sc, 0.13 * sc, FACE, { yaw: yawOf(yaw), roll: -0.5 });
  if (o.mark) k.s(ea, es + 0.0, y0 + 0.64 * sc, 0.045 * sc, 0.045 * sc, 0.045 * sc, '!#FFD24A');                                       // the gold tag on a checked lamb's ear
  const [ya, ys] = L(0.6, 0.07), [za, zs] = L(0.6, -0.07);
  k.s(ya, ys, y0 + 0.7 * sc, 0.025 * sc, 0.025 * sc, 0.025 * sc, '#3A2E22'); k.s(za, zs, y0 + 0.7 * sc, 0.025 * sc, 0.025 * sc, 0.025 * sc, '#3A2E22');   // the eyes
  for (let i = 0; i < 4; i++) {
    const da = i < 2 ? 0.3 : -0.28, ds = i & 1 ? 0.15 : -0.15, sw = Math.sin(ph + i * 1.7) * 0.06;
    const [la, ls] = L(da + sw, ds);
    k.c(la, ls, y0 + 0.14 * sc, 0.04 * sc, 0.3 * sc, HOOF);
  }
  const [ta, ts] = L(-0.5, 0);
  k.s(ta, ts, y0 + 0.5 * sc, 0.08 * sc, 0.08 * sc, 0.1 * sc, wool);                                                                      // the tail
  if (o.glow) {
    const g = o.glow, r = (0.62 + 0.1 * Math.sin((o.t || 0) * 5)) * sc;
    k.ring(a, s, y0 + 0.02, r * (0.9 + 0.1 * g), '!#FFD24A');                                                                    // a gold ring on the ground
  }
}
try { globalThis.__F24 = Object.assign(globalThis.__F24 || {}, { man, POSES }); } catch (e) { /* tests */ }
const yawOf = (yaw) => -yaw;   // (a figure facing `yaw` in the (a, s) plane is turned the other way about the world's up axis)
