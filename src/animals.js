// animals.js — the animals of the service, drawn with a tiny GPU rig.
// Every animal of a kind is one instance of one InstancedMesh (one draw call per kind). The legs, head, ears and tail
// are posed in the vertex shader from a few per-instance numbers (walk phase, walk amount, head pitch/yaw, tail, ears),
// so there are no skeletons and the CPU writes only a matrix and 12 floats per visible animal.
// Kinds: lamb (כבש בן שנה) · ram (איל) · goat (עז / שעיר) · bull (פר) · calf (עגל) · dove (יונה) · turtledove (תור).
// The flock is the fat-tailed sheep of the land (white wool, tan face, the אליה — Tamid 4:3 names it among the limbs);
// the goats are black (Song 4:1 "כעדר העזים"). Colours and breeds are an illustration choice.
// 1 unit = 1 amah; +x east, +z south, +y up. Every model faces +z (yaw = atan2(dx, dz)). No per-frame allocations.
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

/* ───────────────────────── shared rig helpers (also used by actors.js) ───────────────────────── */
const _c = new THREE.Color();
/** a part of a rigged model. tint: 0 none · 1 instance colour · 2 second colour (iCol2) · 3 skin shade (iC.z).
 *  o.metal / o.rough / o.emit: per-vertex PBR (one material for gold, linen and wool). o.fn(x, y, z, c): per-vertex colour. */
export function rigPart(g, hex, bone = 0, o = {}) {
  for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a);
  if (!g.index) g = mergeVertices(g);
  const n = g.attributes.position.count, P = g.attributes.position.array;
  const col = new Float32Array(n * 3), mr = new Float32Array(n * 3);
  _c.set(hex);
  for (let i = 0; i < n; i++) {
    let met = o.metal || 0;
    if (o.fn) { _c.set(hex); const m = o.fn(P[i * 3], P[i * 3 + 1], P[i * 3 + 2], _c); if (typeof m === 'number') met = m; }
    col[i * 3] = _c.r; col[i * 3 + 1] = _c.g; col[i * 3 + 2] = _c.b;
    mr[i * 3] = met; mr[i * 3 + 1] = o.rough === undefined ? 0.85 : o.rough; mr[i * 3 + 2] = o.emit || 0;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  g.setAttribute('aBone', new THREE.BufferAttribute(new Float32Array(n).fill(bone), 1));
  g.setAttribute('aTint', new THREE.BufferAttribute(new Float32Array(n).fill(o.tint || 0), 1));
  g.setAttribute('aMR', new THREE.BufferAttribute(mr, 3));
  return g;
}
export const merge = (parts) => { const g = mergeGeometries(parts, false); g.computeBoundingSphere(); return g; };

// geometry helpers (all indexed)
export const V3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
export function sph(r, p, s = [1, 1, 1], ws = 10, hs = 7, rot = null) {
  const g = new THREE.SphereGeometry(r, ws, hs).scale(s[0], s[1], s[2]);
  if (rot) { if (rot[0]) g.rotateX(rot[0]); if (rot[1]) g.rotateY(rot[1]); if (rot[2]) g.rotateZ(rot[2]); }
  return g.translate(p[0], p[1], p[2]);
}
export function cyl(rBot, rTop, h, p, seg = 8) { return new THREE.CylinderGeometry(rTop, rBot, h, seg).translate(p[0], p[1] + h / 2, p[2]); }
export function rod(a, b, r0, r1 = r0, seg = 6) {
  const A = V3(a), B = V3(b), d = B.clone().sub(A), L = d.length();
  const g = new THREE.CylinderGeometry(r1, r0, L, seg, 1);
  g.translate(0, L / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()));
  return g.translate(A.x, A.y, A.z);
}
export function box(w, h, d, p, rot = null) {
  const g = new THREE.BoxGeometry(w, h, d);
  if (rot) { if (rot[0]) g.rotateX(rot[0]); if (rot[1]) g.rotateY(rot[1]); if (rot[2]) g.rotateZ(rot[2]); }
  return g.translate(p[0], p[1], p[2]);
}
/** a tapered tube along a smooth curve through pts (horns, tails, ropes) */
export function tube(pts, r0, r1, seg = 14, rs = 6) {
  const c = new THREE.CatmullRomCurve3(pts.map(V3));
  const g = new THREE.TubeGeometry(c, seg, 1, rs, false), P = g.attributes.position, q = new THREE.Vector3();
  for (let i = 0; i <= seg; i++) {
    c.getPointAt(i / seg, q); const r = r0 + (r1 - r0) * (i / seg);
    for (let j = 0; j <= rs; j++) { const k = i * (rs + 1) + j; P.setXYZ(k, q.x + (P.getX(k) - q.x) * r, q.y + (P.getY(k) - q.y) * r, q.z + (P.getZ(k) - q.z) * r); }
  }
  return g;
}
export function lathe(pts, seg = 12, phi0 = 0, phiL = Math.PI * 2) { return new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), seg, phi0, phiL); }

const GLSL_ROT = `
  mat3 rX(float a){ float c = cos(a), s = sin(a); return mat3(1.0, 0.0, 0.0, 0.0, c, s, 0.0, -s, c); }
  mat3 rY(float a){ float c = cos(a), s = sin(a); return mat3(c, 0.0, -s, 0.0, 1.0, 0.0, s, 0.0, c); }
  mat3 rZ(float a){ float c = cos(a), s = sin(a); return mat3(c, s, 0.0, -s, c, 0.0, 0.0, 0.0, 1.0); }
  // p' = R p + T; rotation M about pivot P
  void about(mat3 M, vec3 P, out mat3 R, out vec3 T){ R = M; T = P - M * P; }
  // (Ra,Ta) after (Rb,Tb)
  void then(mat3 Ra, vec3 Ta, inout mat3 R, inout vec3 T){ T = Ra * T + Ta; R = Ra * R; }
`;

/** the rig material: vertex colours with per-instance tints, per-vertex metal/rough/emissive, and a pose function
 *  `void rigPose(out mat3 R, out vec3 T)` that may read aBone, iA, iB, iC and its own uniforms. */
export function rigMaterial(key, poseGLSL, uniforms = {}, uniformDecl = '') {
  const m = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 });
  m.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', `#include <common>
        attribute float aBone; attribute float aTint; attribute vec3 aMR;
        attribute vec4 iA; attribute vec4 iB; attribute vec4 iC; attribute vec3 iCol2;
        varying vec3 vMR;
        ${uniformDecl}
        ${GLSL_ROT}
        ${poseGLSL}`)
      .replace('#include <color_vertex>', `vColor = vec4(1.0);
        vColor.rgb *= color.rgb;
        #ifdef USE_INSTANCING_COLOR
          vColor.rgb *= mix(vec3(1.0), instanceColor.rgb, step(0.5, aTint) * (1.0 - step(1.5, aTint)));
        #endif
        vColor.rgb *= mix(vec3(1.0), iCol2, step(1.5, aTint) * (1.0 - step(2.5, aTint)));
        vColor.rgb *= mix(1.0, iC.z, step(2.5, aTint));
        vMR = aMR;`)
      .replace('#include <beginnormal_vertex>', `#include <beginnormal_vertex>
        mat3 rgR; vec3 rgT; rigPose(rgR, rgT); objectNormal = normalize(rgR * objectNormal);`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        transformed = rgR * transformed + rgT;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying vec3 vMR;')
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = vMR.y;')
      .replace('#include <metalnessmap_fragment>', 'float metalnessFactor = vMR.x;')
      // ── people7 ── the silhouette darkens toward its edge (a soft drawn outline for free): people and animals read on pale
      // stone at the game's distance, with no extra draw call or program
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
        { float fr = 1.0 - clamp(abs(dot(normal, normalize(vViewPosition))), 0.0, 1.0); diffuseColor.rgb *= 1.0 - 0.5 * fr * fr * fr; }`)
      .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n  totalEmissiveRadiance += diffuseColor.rgb * vMR.z;');
  };
  m.customProgramCacheKey = () => 'rig-' + key;
  return m;
}

/** an InstancedMesh with the rig's per-instance attributes; write with rigWrite(), then rigEnd() */
export function rigMesh(geo, mat, max) {
  const g = geo.clone();
  const m = new THREE.InstancedMesh(g, mat, max);
  m.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(max * 3).fill(1), 3);
  for (const [k, n] of [['iA', 4], ['iB', 4], ['iC', 4], ['iCol2', 3]]) {
    const a = new THREE.InstancedBufferAttribute(new Float32Array(max * n).fill(k === 'iCol2' ? 1 : 0), n);
    a.setUsage(THREE.DynamicDrawUsage); g.setAttribute(k, a);
  }
  m.instanceMatrix.setUsage(THREE.DynamicDrawUsage); m.instanceColor.setUsage(THREE.DynamicDrawUsage);
  m.frustumCulled = false; m.count = 0; m.visible = false; m.castShadow = false; m.receiveShadow = true;
  m.userData.n = 0;
  return m;
}
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _p = new THREE.Vector3(), _s = new THREE.Vector3(), _Y = new THREE.Vector3(0, 1, 0);
/** instance i: position, yaw, uniform scale, colour (Color or null), iA/iB/iC arrays (4 each), second colour */
export function rigWrite(m, i, x, y, z, yaw, s, col, a, b, c, col2) {
  _q.setFromAxisAngle(_Y, yaw); _p.set(x, y, z); _s.set(s, s, s); _m4.compose(_p, _q, _s);
  _m4.toArray(m.instanceMatrix.array, i * 16);
  const g = m.geometry.attributes;
  if (col) { const C = m.instanceColor.array; C[i * 3] = col.r; C[i * 3 + 1] = col.g; C[i * 3 + 2] = col.b; }
  const A = g.iA.array, B = g.iB.array, CC = g.iC.array;
  for (let k = 0; k < 4; k++) { A[i * 4 + k] = a[k]; B[i * 4 + k] = b[k]; CC[i * 4 + k] = c[k]; }
  if (col2) { const D = g.iCol2.array; D[i * 3] = col2.r; D[i * 3 + 1] = col2.g; D[i * 3 + 2] = col2.b; }
}
export function rigEnd(m, n) {
  m.count = n; m.visible = n > 0;
  if (!n) return;
  const g = m.geometry.attributes;
  m.instanceMatrix.needsUpdate = true; m.instanceColor.needsUpdate = true;
  g.iA.needsUpdate = true; g.iB.needsUpdate = true; g.iC.needsUpdate = true; g.iCol2.needsUpdate = true;
}

/* ───────────────────────── blob shadows (one draw call for every creature) ───────────────────────── */
export class Blobs {
  constructor(scene, max = 512) {
    const c = document.createElement('canvas'); c.width = c.height = 64;
    const x = c.getContext('2d'), gr = x.createRadialGradient(32, 32, 0, 32, 32, 32);
    gr.addColorStop(0, 'rgba(0,0,0,.42)'); gr.addColorStop(0.55, 'rgba(0,0,0,.22)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    x.fillStyle = gr; x.fillRect(0, 0, 64, 64);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.MeshBasicMaterial({ map: t, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, color: '#2A2016' });
    this.m = new THREE.InstancedMesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2), mat, max);
    this.m.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    this.m.frustumCulled = false; this.m.renderOrder = 1; this.m.count = 0; this.max = max; this.n = 0;
    scene.add(this.m);
  }
  begin() { this.n = 0; }
  push(x, y, z, sx, sz, yaw = 0) {
    if (this.n >= this.max) return;
    _q.setFromAxisAngle(_Y, yaw); _p.set(x, y + 0.04, z); _s.set(sx, 1, sz); _m4.compose(_p, _q, _s);
    _m4.toArray(this.m.instanceMatrix.array, this.n * 16); this.n++;
  }
  end() { this.m.count = this.n; this.m.visible = this.n > 0; this.m.instanceMatrix.needsUpdate = true; }
}

/* ───────────────────────── the quadruped rig ─────────────────────────
   bones: 0 body · 1 head+neck · 2 front-left leg · 3 front-right · 4 back-left · 5 back-right · 6 tail · 7 left ear · 8 right ear
   iA = (walk phase, walk amount, head pitch (+ = down), head yaw) · iB = (tail yaw, ear flick, breath, leg lift) */
const QUAD_POSE = `
  void rigPose(out mat3 R, out vec3 T){
    int b = int(aBone + 0.5);
    R = mat3(1.0); T = vec3(0.0);
    float ph = iA.x, wk = iA.y;
    if (b == 0) {
      float br = 1.0 + iB.z * 0.025;
      R = mat3(1.0, 0.0, 0.0, 0.0, br, 0.0, 0.0, 0.0, br); T = uPiv[0] - R * uPiv[0];
    } else if (b == 1 || b >= 7) {
      float bob = sin(ph * 2.0) * 0.07 * wk;
      about(rY(iA.w) * rX(iA.z + bob), uPiv[1], R, T);
      if (b >= 7) {
        float s = b == 7 ? 1.0 : -1.0;
        mat3 Re; vec3 Te; about(rZ(iB.y * s) * rX(-iB.y * 0.4), uPiv[b], Re, Te);
        T = R * Te + T; R = R * Re;
      }
    } else if (b <= 5) {
      float off = (b == 2 || b == 5) ? 0.0 : 3.14159;
      float a = sin(ph + off) * 0.5 * wk;
      about(rX(a), uPiv[b], R, T);
    } else if (b == 6) {
      about(rY(iB.x) * rX(-abs(iB.x) * 0.3), uPiv[6], R, T);
    }
  }`;
const BIRD_POSE = `
  void rigPose(out mat3 R, out vec3 T){
    int b = int(aBone + 0.5);
    R = mat3(1.0); T = vec3(0.0);
    if (b == 1) about(rY(iA.w) * rX(iA.y), uPiv[1], R, T);
    else if (b == 2) about(rZ(-iA.x), uPiv[2], R, T);
    else if (b == 3) about(rZ(iA.x), uPiv[3], R, T);
    else if (b == 4) about(rX(-iA.z), uPiv[4], R, T);
    else { R = mat3(1.0); T = vec3(0.0, iB.x, 0.0); }
  }`;

/* ───────────────────────── models ───────────────────────── */
const P = rigPart;
function sheep({ ram = false } = {}) {
  const WOOL = ram ? '#EDE6D6' : '#F6F1E6', WOOL2 = ram ? '#DDD3C0' : '#E9E1D1', FACE = ram ? '#A57A55' : '#CFA885', FACE2 = ram ? '#C49A72' : '#E2C3A2';
  const HOOF = '#3B3029', NOSE = '#5E4034', EYE = '#15100C';
  const s = ram ? 1.18 : 1;
  const W = { rough: 0.95 };
  const parts = [
    // the woolly body: overlapping lumps make the soft cloud silhouette
    P(sph(0.5, [0, 1.12, 0.36], [1, 0.95, 1.05]), WOOL, 0, W), P(sph(0.55, [0, 1.17, -0.1], [1.05, 1, 1.1]), WOOL, 0, W),
    P(sph(0.5, [0, 1.1, -0.55], [1, 0.95, 1]), WOOL, 0, W), P(sph(0.34, [0.19, 1.43, 0.18]), WOOL, 0, W), P(sph(0.34, [-0.19, 1.43, 0.18]), WOOL, 0, W),
    P(sph(0.33, [0, 1.46, -0.36]), WOOL, 0, W), P(sph(0.42, [0, 0.9, -0.05], [1, 0.75, 1.55]), WOOL2, 0, W), P(sph(0.36, [0, 0.98, 0.7]), WOOL2, 0, W),
    P(sph(0.3, [0.3, 1.06, -0.3]), WOOL2, 0, W), P(sph(0.3, [-0.3, 1.06, -0.3]), WOOL2, 0, W),
    // neck ruff, head, muzzle, nose, eyes, wool cap
    P(sph(0.3, [0, 1.4, 0.76], [0.92, 1.1, 1]), WOOL, 1, W),
    P(sph(0.25, [0, 0, 0], [0.84, 0.95, 1.28], 10, 7, [0.38, 0, 0]).translate(0, 1.57, 1.07), FACE, 1),
    P(sph(0.165, [0, 1.47, 1.29], [0.9, 0.82, 1]), FACE2, 1),
    P(sph(0.05, [0, 1.49, 1.43], [1.5, 0.8, 0.8], 6, 4), NOSE, 1, { rough: 0.5 }),
    P(sph(0.058, [0.155, 1.66, 1.19], [1, 1, 1], 6, 5), EYE, 1, { rough: 0.12 }), P(sph(0.058, [-0.155, 1.66, 1.19], [1, 1, 1], 6, 5), EYE, 1, { rough: 0.12 }),
    P(sph(0.2, [0, 1.79, 1.0], [1.1, 0.78, 1.1]), WOOL, 1, W),
    // drooping ears (the land's broad-tailed sheep carry long ears)
    P(sph(ram ? 0.11 : 0.17, [0, 0, 0], [1.55, 0.42, 0.72], 8, 5, [0, 0, -0.55]).translate(ram ? 0.24 : 0.3, 1.6, ram ? 1.08 : 1.0), FACE, 7),
    P(sph(ram ? 0.11 : 0.17, [0, 0, 0], [1.55, 0.42, 0.72], 8, 5, [0, 0, 0.55]).translate(ram ? -0.24 : -0.3, 1.6, ram ? 1.08 : 1.0), FACE, 8),
    // the fat tail (אליה)
    P(sph(0.27, [0, 0.97, -0.93], [1.05, 1.25, 0.72]), WOOL, 6, W), P(sph(0.16, [0, 0.72, -0.98], [1.1, 0.8, 0.7]), WOOL2, 6, W),
  ];
  const legs = [[0.19, 0.42], [-0.19, 0.42], [0.19, -0.52], [-0.19, -0.52]];
  legs.forEach(([x, z], k) => {
    parts.push(P(rod([x, 0.98, z], [x, 0.1, z], 0.088, 0.07, 7), FACE, 2 + k), P(cyl(0.085, 0.074, 0.13, [x, 0, z], 7), HOOF, 2 + k, { rough: 0.5 }));
  });
  if (ram) {
    // spiral horns: back, down and forward round the ears, ridged in bands
    const horn = (sx) => {
      const pts = [];
      for (let k = 0; k <= 12; k++) {
        const u = k / 12, a = 1.2 + u * 5.4, R = 0.38 - 0.2 * u;
        pts.push([sx * (0.16 + 0.34 * u), 1.52 + R * Math.sin(a), 0.84 + R * Math.cos(a) * 1.05]);
      }
      return P(tube(pts, 0.13, 0.035, 28, 8), '#D9C6A0', 1, { rough: 0.6, fn: (x, y, z, c) => { const k = Math.abs(x) > 0.3 ? 0.78 : 1; c.multiplyScalar(k * (0.92 + 0.08 * Math.sin(y * 60 + z * 60))); } });
    };
    parts.push(horn(1), horn(-1));
  }
  const g = merge(parts);
  if (s !== 1) g.scale(s, s, s);
  const piv = [[0, 1.1, 0], [0, 1.36, 0.62], ...legs.map(([x, z]) => [x, 0.98, z]), [0, 1.2, -0.82], [0.17, 1.64, 1.0], [-0.17, 1.64, 1.0]].map((p) => p.map((v) => v * s));
  return { geo: g, piv, stride: 1.0 * s, blob: [1.5 * s, 2.3 * s], neck: [0, 1.45 * s, 0.85 * s], r: 1.5 * s, lod: 520 };
}
function goat() {
  const HAIR = '#2B2521', HAIR2 = '#3A322C', MUZ = '#4A3E36', HORN = '#5A5048', HOOF = '#231C18', EYE = '#C79B3A';
  const parts = [
    P(sph(0.46, [0, 1.3, -0.05], [0.95, 1.05, 1.95]), HAIR, 0, { rough: 0.7 }),
    P(sph(0.36, [0, 1.35, 0.55], [1, 1.1, 1]), HAIR, 0, { rough: 0.7 }),
    // the shaggy fringe of the black goats of the land
    P(sph(0.34, [0, 1.0, -0.02], [0.95, 0.55, 2.3]), HAIR2, 0, { rough: 0.85 }),
    ...[-0.6, -0.25, 0.1, 0.42].flatMap((z, i) => [1, -1].map((sx) => P(sph(0.15, [sx * 0.33, 1.02, z], [0.75, 1.55, 1.2]), i % 2 ? HAIR2 : HAIR, 0, { rough: 0.85 }))),
    P(sph(0.15, [0, 1.55, 0.8], [1, 1.3, 1]), HAIR, 1),
    P(sph(0.21, [0, 0, 0], [0.78, 0.92, 1.45], 10, 7, [0.55, 0, 0]).translate(0, 1.72, 1.08), HAIR, 1),
    P(sph(0.12, [0, 1.58, 1.32], [0.9, 0.8, 1]), MUZ, 1),
    P(sph(0.048, [0.13, 1.8, 1.14], [1, 1, 1], 6, 5), EYE, 1, { rough: 0.15 }), P(sph(0.048, [-0.13, 1.8, 1.14], [1, 1, 1], 6, 5), EYE, 1, { rough: 0.15 }),
    // beard
    P(new THREE.ConeGeometry(0.075, 0.34, 6).rotateX(Math.PI).translate(0, 1.36, 1.24), HAIR2, 1),
    // small horns curving back
    P(tube([[0.08, 1.9, 1.02], [0.11, 2.08, 0.92], [0.14, 2.14, 0.74], [0.16, 2.08, 0.58]], 0.055, 0.018, 10, 5), HORN, 1, { rough: 0.55 }),
    P(tube([[-0.08, 1.9, 1.02], [-0.11, 2.08, 0.92], [-0.14, 2.14, 0.74], [-0.16, 2.08, 0.58]], 0.055, 0.018, 10, 5), HORN, 1, { rough: 0.55 }),
    // long drooping ears
    P(sph(0.2, [0, 0, 0], [0.45, 1.5, 0.28], 8, 5, [0.2, 0, 0.3]).translate(0.25, 1.52, 1.02), HAIR2, 7),
    P(sph(0.2, [0, 0, 0], [0.45, 1.5, 0.28], 8, 5, [0.2, 0, -0.3]).translate(-0.25, 1.52, 1.02), HAIR2, 8),
    // the upright tail
    P(new THREE.ConeGeometry(0.065, 0.22, 6).rotateX(-0.6).translate(0, 1.58, -0.92), HAIR, 6),
  ];
  const legs = [[0.17, 0.5], [-0.17, 0.5], [0.17, -0.55], [-0.17, -0.55]];
  legs.forEach(([x, z], k) => { parts.push(P(rod([x, 1.1, z], [x, 0.1, z], 0.075, 0.06, 6), HAIR2, 2 + k), P(cyl(0.07, 0.062, 0.12, [x, 0, z], 6), HOOF, 2 + k, { rough: 0.5 })); });
  return { geo: merge(parts), piv: [[0, 1.3, 0], [0, 1.5, 0.66], ...legs.map(([x, z]) => [x, 1.1, z]), [0, 1.5, -0.86], [0.12, 1.78, 1.05], [-0.12, 1.78, 1.05]], stride: 1.1, blob: [1.3, 2.3], neck: [0, 1.6, 0.9], r: 1.6, lod: 520 };
}
function bovine({ calf = false } = {}) {
  const HIDE = calf ? '#C89E70' : '#8C5536', HIDE2 = calf ? '#B88A5C' : '#6E4029', MUZ = calf ? '#E6CDB5' : '#C9AE9A', HOOF = '#2A211B', HORN = '#E7DCC4', EYE = '#120D0A';
  const parts = [
    P(sph(0.72, [0, 1.95, -0.1], [1, 1.02, 1.85]), HIDE, 0, { rough: 0.75 }),
    P(sph(0.66, [0, 2.05, 0.95], [1.02, 1.08, 1]), HIDE, 0, { rough: 0.75 }),
    P(sph(0.3, [0, 2.62, 0.72], [1.4, 0.8, 1.3]), HIDE2, 0, { rough: 0.8 }),                // the hump
    P(sph(0.55, [0, 1.45, 0.1], [0.95, 0.6, 1.9]), HIDE2, 0, { rough: 0.8 }),                // belly
    P(sph(0.62, [0, 1.95, -1.05], [1, 0.95, 0.9]), HIDE, 0, { rough: 0.75 }),               // rump
    P(sph(0.26, [0, 1.62, 1.62], [0.7, 1.25, 0.8]), HIDE2, 1),                              // dewlap
    P(sph(0.36, [0, 2.2, 1.68], [0.95, 1.05, 1.1]), HIDE, 1),
    P(sph(0.34, [0, 0, 0], [0.9, 0.95, 1.45], 10, 7, [0.75, 0, 0]).translate(0, 2.05, 2.12), HIDE, 1),
    P(sph(0.26, [0, 1.8, 2.45], [1.05, 0.8, 0.85]), MUZ, 1),
    P(sph(0.05, [0.1, 1.78, 2.66], [1, 0.7, 0.5], 6, 4), '#3A2A24', 1), P(sph(0.05, [-0.1, 1.78, 2.66], [1, 0.7, 0.5], 6, 4), '#3A2A24', 1),
    P(sph(0.07, [0.25, 2.25, 2.1], [1, 1, 1], 6, 5), EYE, 1, { rough: 0.12 }), P(sph(0.07, [-0.25, 2.25, 2.1], [1, 1, 1], 6, 5), EYE, 1, { rough: 0.12 }),
    P(sph(0.16, [0, 0, 0], [1.6, 0.5, 0.8], 8, 5, [0, 0, -0.25]).translate(0.46, 2.3, 1.95), HIDE2, 7),
    P(sph(0.16, [0, 0, 0], [1.6, 0.5, 0.8], 8, 5, [0, 0, 0.25]).translate(-0.46, 2.3, 1.95), HIDE2, 8),
    P(tube([[0, 2.2, -1.62], [0, 1.6, -1.72], [0, 1.0, -1.7]], 0.05, 0.04, 8, 5), HIDE2, 6),
    P(sph(0.1, [0, 0.9, -1.7], [1, 1.8, 1]), '#2C221C', 6),
  ];
  if (calf) parts.push(P(sph(0.14, [0, 2.5, 2.0]), HIDE2, 1));   // a calf's poll tuft, no horns
  else {
    parts.push(P(tube([[0.2, 2.5, 2.0], [0.5, 2.62, 1.98], [0.68, 2.82, 2.1], [0.72, 3.02, 2.28]], 0.1, 0.03, 12, 6), HORN, 1, { rough: 0.5, fn: (x, y, z, c) => { if (y > 2.88) c.set('#4A4038'); } }));
    parts.push(P(tube([[-0.2, 2.5, 2.0], [-0.5, 2.62, 1.98], [-0.68, 2.82, 2.1], [-0.72, 3.02, 2.28]], 0.1, 0.03, 12, 6), HORN, 1, { rough: 0.5, fn: (x, y, z, c) => { if (y > 2.88) c.set('#4A4038'); } }));
  }
  const legs = [[0.36, 0.95], [-0.36, 0.95], [0.36, -1.1], [-0.36, -1.1]];
  legs.forEach(([x, z], k) => { parts.push(P(rod([x, 1.55, z], [x, 0.16, z], 0.17, 0.13, 7), HIDE2, 2 + k), P(cyl(0.15, 0.13, 0.2, [x, 0, z], 7), HOOF, 2 + k, { rough: 0.5 })); });
  const g = merge(parts), s = calf ? 0.62 : 1;
  if (calf) g.scale(s, s, s);
  const piv = [[0, 1.95, 0], [0, 2.25, 1.35], ...legs.map(([x, z]) => [x, 1.55, z]), [0, 2.2, -1.6], [0.3, 2.3, 1.95], [-0.3, 2.3, 1.95]].map((p) => p.map((v) => v * s));
  return { geo: g, piv, stride: 1.8 * s, blob: [2.4 * s, 4.2 * s], neck: [0, 2.3 * s, 1.7 * s], r: 3 * s, lod: 700 };
}
// bird rig bones: 0 body · 1 head · 2 left wing · 3 right wing · 4 tail · iA = (wing open, head pitch, tail, head yaw) · iB.x = hop
function bird({ turtle = false } = {}) {
  const BODY = turtle ? '#B98E72' : '#E9E7E2', WING = turtle ? '#9C7156' : '#CFCCC6', BAR = turtle ? '#5C3E2E' : '#9A9894', HEAD = turtle ? '#C4A08A' : '#E4E2DE';
  const parts = [
    P(sph(0.16, [0, 0.26, 0], [0.95, 0.9, 1.45]), BODY, 0, { rough: 0.8 }),
    P(sph(0.1, [0, 0.36, 0.2]), BODY, 0),
    P(sph(0.095, [0, 0.46, 0.25]), HEAD, 1),
    P(new THREE.ConeGeometry(0.025, 0.08, 5).rotateX(Math.PI / 2).translate(0, 0.45, 0.36), '#5A4A40', 1, { rough: 0.5 }),
    P(sph(0.02, [0.06, 0.48, 0.31], [1, 1, 1], 5, 4), '#1A120E', 1, { rough: 0.1 }), P(sph(0.02, [-0.06, 0.48, 0.31], [1, 1, 1], 5, 4), '#1A120E', 1, { rough: 0.1 }),
    P(sph(0.13, [0.1, 0.3, -0.04], [0.35, 0.6, 1.5]), WING, 2, { fn: (x, y, z, c) => { if (z < -0.08 && z > -0.14) c.set(BAR); } }),
    P(sph(0.13, [-0.1, 0.3, -0.04], [0.35, 0.6, 1.5]), WING, 3, { fn: (x, y, z, c) => { if (z < -0.08 && z > -0.14) c.set(BAR); } }),
    P(box(0.13, 0.025, 0.2, [0, 0.26, -0.28]), BAR, 4),
    P(cyl(0.012, 0.012, 0.12, [0.05, 0.02, 0.02], 4), '#C0625A', 0), P(cyl(0.012, 0.012, 0.12, [-0.05, 0.02, 0.02], 4), '#C0625A', 0),
  ];
  // the turtledove's black-and-white striped neck patch; the pigeon's green-violet sheen
  if (turtle) for (const sx of [1, -1]) parts.push(P(box(0.02, 0.07, 0.07, [sx * 0.085, 0.38, 0.2]), '#2A2522', 0, { fn: (x, y, z, c) => { if (Math.floor(y * 90) % 2) c.set('#F2EEE8'); } }));
  else parts.push(P(sph(0.105, [0, 0.37, 0.21], [1, 0.7, 0.9]), '#8FA59A', 0, { metal: 0.3, rough: 0.35 }));
  return { geo: merge(parts), piv: [[0, 0.26, 0], [0, 0.4, 0.2], [0.1, 0.36, 0], [-0.1, 0.36, 0], [0, 0.28, -0.2]], stride: 0.3, blob: [0.35, 0.5], neck: [0, 0.4, 0.2], r: 0.4, lod: 160, bird: true };
}

/** a lamb as one static piece (all bones 0): the lamb a kohen carries in his arms (actors.js items) */
export function lambStatic() { const g = sheep().geo; g.attributes.aBone.array.fill(0); return g; }
// ── recovered (build 25) ── the sheep's rig (geo, pivots, pose) for a skinned mesh of its own: pen25's lamb at the pen door
// (the export's name did not survive the bundle; `sheepRig` is the recovery's)
export const sheepRig = () => ({ ...sheep(), pose: QUAD_POSE });

const BUILD = { lamb: () => sheep(), ram: () => sheep({ ram: true }), goat, bull: () => bovine(), calf: () => bovine({ calf: true }), dove: () => bird(), turtledove: () => bird({ turtle: true }) };
export const ANIMAL_KINDS = Object.keys(BUILD);
const SPEED = { lamb: 1.7, ram: 1.8, goat: 2.0, bull: 1.6, calf: 1.5, dove: 0.6, turtledove: 0.6 };

/* ───────────────────────── the herd ───────────────────────── */
/** ctx: { scene, camera?, blobs?, ground(x, z)? } → { add, remove, update, list, setCamera } */
export function createAnimals(ctx) {
  const { scene } = ctx;
  let camera = ctx.camera || null;
  const ownBlobs = !ctx.blobs, blobs = ctx.blobs || new Blobs(scene, 256);
  const ground = ctx.ground || (() => 0);
  const kinds = {};
  const getKind = (k) => {
    if (kinds[k]) return kinds[k];
    const d = BUILD[k]();
    const U = { uPiv: { value: d.piv.map(V3) } };
    const mat = rigMaterial(d.bird ? 'bird' : 'quad', d.bird ? BIRD_POSE : QUAD_POSE, U, `uniform vec3 uPiv[${d.piv.length}];`);
    const mesh = rigMesh(d.geo, mat, 160);
    mesh.name = 'animal-' + k;
    scene.add(mesh);
    return (kinds[k] = { d, mesh, n: 0, max: 160 });
  };
  const list = [];
  let seedN = 1;
  const rnd = () => { seedN = (seedN * 16807) % 2147483647; return (seedN - 1) / 2147483646; };

  /** kind, x, z; opts: { yaw, y, ground(fn), wander: {x0,x1,z0,z1}, graze, calm, scale, tint (hex) } */
  function add(kind, x, z, opts = {}) {
    if (!BUILD[kind]) return null;
    const K = getKind(kind);
    const h = {
      kind, K, x, z, y: opts.y !== undefined ? opts.y : (opts.ground || ground)(x, z), yaw: opts.yaw !== undefined ? opts.yaw : rnd() * 6.28, s: opts.scale || (0.92 + rnd() * 0.16),
      vis: opts.hidden ? 0 : 1, visT: opts.hidden ? 0 : 1, alive: true, ground: opts.ground || null, fixedY: opts.y,
      path: null, pi: 0, speed: SPEED[kind] * (0.9 + rnd() * 0.2), res: null, face: null, follow: null, followDist: 2.2,
      wander: opts.wander || null, wT: rnd() * 4, graze: !!opts.graze, calm: !!opts.calm,
      ph: rnd() * 6.28, wk: 0, hp: 0, hpT: 0, hy: 0, hyT: 0, tail: 0, ear: 0, earT: 1 + rnd() * 4, lookT: rnd() * 3, gT: 3 + rnd() * 8, grazing: 0,
      seed: rnd() * 100, inspect: 0, hop: 0, wing: 0, wingT: 2 + rnd() * 6,
      tint: opts.tint ? new THREE.Color(opts.tint) : null, neck: new THREE.Vector3(), moving: false, onHide: null, lodOn: true,
      held: null,   // { x, y, z, yaw } — carried (a dove in a basket): no walking, set by the owner every frame
    };
    list.push(h);
    return h;
  }
  function remove(h) { if (!h) return; h.alive = false; const i = list.indexOf(h); if (i >= 0) list.splice(i, 1); if (h.res) { const r = h.res; h.res = null; r(false); } }
  // ── world api (s4) ── (World agent) as in actors.js: a walk keeps pace with the wall clock, and a wall-clock backstop
  // (1.6 × its duration + 2.5 s) finishes it and resolves, even when the loop is slow or paused
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  /** walk a list of [x, z] points; resolves true on arrival, false if replaced */
  function walk(h, pts, speed) {
    if (h.res) { const r = h.res; h.res = null; r(false); }
    h.follow = null; h.path = pts && pts.length ? pts : null; h.pi = 0; if (speed) h.speed = speed;
    if (!h.path) return Promise.resolve(true);
    let L = 0, px = h.x, pz = h.z;
    for (const q of h.path) { L += Math.hypot(q[0] - px, q[1] - pz); px = q[0]; pz = q[1]; }
    const tok = {}; h.walkTok = tok; h.walkT0 = now(); h.walked = 0;
    let done = false, t = null;
    const pr = new Promise((res) => { h.res = res; });
    t = setTimeout(() => {
      if (done || h.walkTok !== tok || !h.path) return;
      const e = h.path[h.path.length - 1]; h.x = e[0]; h.z = e[1]; h.path = null;
      if (h.res) { const r = h.res; h.res = null; r(true); }
    }, (L / Math.max(0.1, h.speed) * 1.6 + 2.5) * 1000);
    return pr.then((v) => { done = true; clearTimeout(t); return v; });
  }
  // ── end world api (s4) ──

  const fr = new THREE.Frustum(), pm = new THREE.Matrix4(), sp = new THREE.Sphere();
  const A = [0, 0, 0, 0], B = [0, 0, 0, 0], C = [0, 0, 1, 0], WHITE = new THREE.Color(1, 1, 1);
  let T = 0;
  function update(dt) {
    T += dt;
    let cx = 0, cy = 0, cz = 0;
    if (camera) {
      camera.updateMatrixWorld(); pm.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); fr.setFromProjectionMatrix(pm);
      cx = camera.position.x; cy = camera.position.y; cz = camera.position.z;
    }
    for (const k in kinds) kinds[k].n = 0;
    if (ownBlobs) blobs.begin();
    for (let i = 0; i < list.length; i++) {
      const h = list[i], d = h.K.d;
      // visibility fade (hide / show)
      if (h.vis !== h.visT) {
        const dir = h.visT > h.vis ? 1 : -1;
        h.vis += dir * dt / 0.4;
        if ((dir > 0 && h.vis >= h.visT) || (dir < 0 && h.vis <= h.visT)) { h.vis = h.visT; if (h.onHide && h.vis === 0) { const f = h.onHide; h.onHide = null; f(); } }
      }
      if (h.vis <= 0.001) continue;
      // LOD: far or out of view → neither simulated nor drawn (except when scripted, so it keeps its path)
      let inView = true;
      if (camera) {
        const dx = h.x - cx, dy = h.y - cy, dz = h.z - cz, dd = dx * dx + dy * dy + dz * dz;
        if (dd > d.lod * d.lod) inView = false;
        else { sp.center.set(h.x, h.y + d.r * 0.4, h.z); sp.radius = d.r * h.s + 1; inView = fr.intersectsSphere(sp); }
      }
      if (!inView && !h.path && !h.follow) continue;
      step(h, dt);
      if (!inView) continue;
      const K = h.K;
      if (K.n >= K.max) continue;
      const bob = d.bird ? h.hop : Math.abs(Math.sin(h.ph)) * 0.05 * h.wk * h.s;
      A[0] = h.ph; A[1] = h.wk; A[2] = h.hp; A[3] = h.hy;
      if (d.bird) { A[0] = h.wing; A[1] = h.hp; A[2] = h.tail; A[3] = h.hy; B[0] = 0; B[1] = 0; B[2] = 0; B[3] = 0; }
      else { B[0] = h.tail; B[1] = h.ear; B[2] = Math.sin(T * 2.2 + h.seed); B[3] = 0; }
      rigWrite(K.mesh, K.n++, h.x, h.y + bob, h.z, h.yaw, h.s * (h.vis < 1 ? Math.max(0.001, easeOut(h.vis)) : 1), h.tint || WHITE, A, B, C, null);
      if (!h.held) blobs.push(h.x, h.y, h.z, d.blob[0] * h.s * h.vis, d.blob[1] * h.s * h.vis, h.yaw);
    }
    for (const k in kinds) rigEnd(kinds[k].mesh, kinds[k].n);
    if (ownBlobs) blobs.end();
  }
  const easeOut = (u) => 1 - (1 - u) * (1 - u);

  function step(h, dt) {
    const d = h.K.d;
    let moving = false, want = h.yaw;
    if (h.held) { h.x = h.held.x; h.y = h.held.y; h.z = h.held.z; h.yaw = h.held.yaw; }
    else if (h.follow) {
      const L = h.follow, dx = L.x - h.x, dz = L.z - h.z, dist = Math.hypot(dx, dz);
      if (dist > h.followDist + 0.15) {
        // (── world api (s4) ── on a rope it never falls more than 3 amot behind, when its leader catches up with the clock)
        const v = Math.max(dist - h.followDist - 3, Math.min(dist - h.followDist, Math.max(h.speed, (L.speed || h.speed) * 1.05) * dt));
        h.x += dx / dist * v; h.z += dz / dist * v; moving = true; want = Math.atan2(dx, dz);
      } else if (dist > 0.3) want = Math.atan2(dx, dz);
    } else if (h.path) {
      // ── world api (s4) ── the wall-clock pace (scripted walks only: the wandering flock keeps simulation time)
      let stp = h.speed * dt;
      if (h.walkT0 !== undefined && h.res) { const behind = h.speed * (now() - h.walkT0) / 1000 - (h.walked || 0); if (behind > stp) stp = behind; }
      h.walked = (h.walked || 0) + stp;
      for (let n = 0; h.path && n < 64; n++) {
        const p = h.path[h.pi], dx = p[0] - h.x, dz = p[1] - h.z, dist = Math.hypot(dx, dz);
        if (dist <= stp || dist < 0.02) {
          h.x = p[0]; h.z = p[1]; h.pi++; stp = Math.max(0, stp - dist);
          if (h.pi >= h.path.length) { h.path = null; if (h.res) { const r = h.res; h.res = null; r(true); } }
          else if (stp <= 0) break;
        } else { h.x += dx / dist * stp; h.z += dz / dist * stp; break; }
      }
      if (h.path) { const p = h.path[h.pi], dx = p[0] - h.x, dz = p[1] - h.z; if (dx * dx + dz * dz > 1e-6) { moving = true; want = Math.atan2(dx, dz); } }
      // ── end world api (s4) ──
    } else if (h.wander) {
      h.wT -= dt;
      if (h.wT <= 0) {
        const W = h.wander;
        if (rndF(h) < 0.55) { h.path = [[W.x0 + rndF(h) * (W.x1 - W.x0), W.z0 + rndF(h) * (W.z1 - W.z0)]]; h.pi = 0; h.speed = SPEED[h.kind] * 0.55; }
        h.wT = 4 + rndF(h) * 9;
      }
    }
    if (h.face && !moving) want = Math.atan2(h.face[0] - h.x, h.face[1] - h.z);
    let dy = want - h.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    h.yaw += dy * Math.min(1, dt * (moving ? 5 : 3));
    h.moving = moving;
    h.wk += ((moving ? 1 : 0) - h.wk) * Math.min(1, dt * 6);
    if (moving) h.ph += h.speed * dt / d.stride * Math.PI;
    // ground
    if (!h.held) {
      const gy = h.fixedY !== undefined && !h.path && !h.follow ? h.fixedY : (h.ground || ground)(h.x, h.z);
      h.y += (gy - h.y) * Math.min(1, dt * 12); if (Math.abs(gy - h.y) > 6) h.y = gy;
    }
    // life: look around, graze, flick the ears, wag the tail
    h.lookT -= dt; h.earT -= dt; h.gT -= dt;
    if (h.lookT <= 0) { h.hyT = (rndF(h) - 0.5) * 1.1; h.hpT = (rndF(h) - 0.6) * 0.35; h.lookT = 1.5 + rndF(h) * 4; }
    if (h.graze && !moving && h.gT <= 0) { h.grazing = h.grazing > 0 ? 0 : 3 + rndF(h) * 5; h.gT = h.grazing > 0 ? h.grazing : 4 + rndF(h) * 8; }
    if (h.grazing > 0) h.grazing -= dt;
    const grazeOn = h.grazing > 0 && !moving && !h.inspect;
    let hpT = grazeOn ? (d.bird ? 0.9 : 0.95) + Math.sin(T * 7 + h.seed) * 0.05 : moving ? 0.08 : h.hpT;
    let hyT = moving || grazeOn ? 0 : h.hyT;
    if (h.inspect) { hpT = -0.25; hyT = Math.sin(T * 0.8 + h.seed) * 0.35; }
    if (h.headFix !== undefined && h.headFix !== null && !moving) { hyT = h.headFix; hpT = 0.05; }
    h.hp += (hpT - h.hp) * Math.min(1, dt * 3); h.hy += (hyT - h.hy) * Math.min(1, dt * 2.5);
    if (h.earT <= 0) { h.ear = 0.55; h.earT = 1.5 + rndF(h) * 5; }
    h.ear *= Math.max(0, 1 - dt * 7);
    if (d.bird) {
      h.wingT -= dt;
      if (h.wingT <= 0) { h.wingT = 3 + rndF(h) * 7; h.flap = 0.7; }
      if (h.flap > 0) { h.flap -= dt; h.wing = Math.abs(Math.sin(h.flap * 22)) * 0.9; } else h.wing *= Math.max(0, 1 - dt * 8);
      h.tail = Math.sin(T * 3 + h.seed) * 0.15;
      h.hop = h.flap > 0 ? Math.sin(Math.min(1, (0.7 - h.flap) / 0.7) * Math.PI) * 0.05 : 0;
    } else {
      const wagF = h.kind === 'goat' ? 14 : 8, wagA = moving ? 0.28 : h.kind === 'goat' ? 0.12 : 0.1;
      h.tail = Math.sin(T * wagF + h.seed) * wagA * (0.6 + 0.4 * Math.sin(T * 0.7 + h.seed * 3));
    }
    // the neck point (for a lead rope)
    const c = Math.cos(h.yaw), s = Math.sin(h.yaw), n = d.neck, sc = h.s;
    h.neck.set(h.x + (n[0] * c + n[2] * s) * sc, h.y + n[1] * sc, h.z + (-n[0] * s + n[2] * c) * sc);
  }
  const rndF = (h) => { h.seed = (h.seed * 9301 + 49297) % 233280; return h.seed / 233280; };

  let enabled = true;
  return {
    add, remove, walk, update(dt) { if (enabled) update(dt); else for (const k in kinds) rigEnd(kinds[k].mesh, 0); }, list, blobs,
    setCamera(c) { camera = c; },
    setEnabled(v) { enabled = !!v; },
    kinds: ANIMAL_KINDS,
    get drawn() { let n = 0; for (const k in kinds) n += kinds[k].mesh.visible ? 1 : 0; return n; },
  };
}
