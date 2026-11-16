/* ── build 128 ── h128/world.js — the things of stage 06 in the world, drawn from the save on a beat (as h120/world.js): the gate
 * house's passage opened (the world's own model of the gate keeps its stones; its painted doors and the old fifteen steps are cut out
 * with the site's holes, stages.siteHoles), the timber work ramp with its six notches and its two rough timbers (a broken timber where
 * the sledge ran back), the sledge with the south leaf, the capstan; once the doors are hung: the two bronze leaves on their hinges
 * (open, or closed at the end; a dent; the salt stains on the north leaf for good), the two wickets with their bolts (a bent tooth),
 * the steps' rough core and the fifteen rings as they are laid and closed (his stones and joints from the save, a crack, a missing
 * corner); the ground under the hero agreeing with what stands (stages.floorHook). The crews at work: masons in the yard, carriers.
 * Every place is the book's (BOOK.s06); every size a size.
 */
import { BOOK, ringOf } from '../world/grid.js';
import { ringPlan, CAP, tailX, Q } from './model.js';
import { createBeat, createGang, clamp, lerp, ease } from '../h109/kit.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { buildMaterial, revealUniforms, setBuilding } from '../../batch.js';

const S6 = BOOK.s06, RMP = S6.ramp, STP = S6.steps, GT = S6.gate, WK = S6.wicket;
const C0 = STP.c, TAU = Math.PI * 2;
/** the leaves' drawn opening: three quarters of the model's angle (at the model's 90° a leaf stands off its side of the passage, room for
 *  the men who close it) */
export const VIS = 0.75;
export const SH6 = { X: null, B: null, crew: null, root: null, M: null, key: {}, own: {}, busy: 0, t: 0, final: 0, men: [], cone: null, holeT: 0, film: null, parts: {} };

/* ───────── materials ───────── */
export function mats6(X) {
  const P = X.props, T = X.THREE;
  if (P.M.h6bronze) return P.M;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, ...o });
  P.M.h6bronze = std('#C9A04E', { roughness: 0.32, metalness: 0.82, flatShading: false });
  P.M.h6bronzeD = std('#A88038', { roughness: 0.4, metalness: 0.75, flatShading: false });
  P.M.h6timber = std('#9C7448', { roughness: 0.82 });
  P.M.h6timberL = std('#B58A58', { roughness: 0.8 });
  P.M.h6rough = std('#5E432A', { roughness: 0.95 });
  P.M.h6stone = std('#EAE2CE', { roughness: 0.8 });
  P.M.h6shade = std('#CDBC98', { roughness: 0.85 });
  P.M.h6core = std('#BDB29C', { roughness: 1 });   // (the rough core: rubble set in mortar, grey-tan; a fixed cell pattern by world place, no texture)
  P.M.h6core.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nvarying vec3 vW6;').replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvW6 = (modelMatrix * vec4(transformed, 1.0)).xyz;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying vec3 vW6;\nfloat h6h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }').replace('#include <color_fragment>', `#include <color_fragment>
      { vec2 q = vec2(vW6.x + vW6.z * 0.7, vW6.y * 1.6 + vW6.z * 0.3) * 1.1; vec2 c = floor(q), f = fract(q); float d1 = 9.0, d2 = 9.0, id = 0.0;
        for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) { vec2 o = vec2(float(i), float(j)); vec2 r = o + vec2(h6h(c + o), h6h(c + o + 7.3)) * 0.8 - f; float d = dot(r, r); if (d < d1) { d2 = d1; d1 = d; id = h6h(c + o + 3.1); } else if (d < d2) d2 = d; }
        float joint = smoothstep(0.02, 0.10, sqrt(d2) - sqrt(d1)); diffuseColor.rgb *= mix(1.08, 0.80 + id * 0.24, joint); }`);
  };
  P.M.h6pass = std('#DCD2BC', { roughness: 0.9 });
  P.M.h6dark = new T.MeshBasicMaterial({ color: 0x2A2016 });
  P.M.h6chalk = new T.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.9, depthWrite: false });
  P.M.h6green = new T.MeshBasicMaterial({ color: 0x4FC46A, transparent: true, opacity: 0.6, depthWrite: false });
  P.M.h6gold = new T.MeshBasicMaterial({ color: 0xFFD86A, transparent: true, opacity: 0.55, depthWrite: false, side: T.DoubleSide });
  P.M.h6red = new T.MeshBasicMaterial({ color: 0xE0402A, transparent: true, opacity: 0.85, depthWrite: false });
  P.M.h6light = new T.MeshBasicMaterial({ color: 0xFFF6C8, transparent: true, opacity: 0.95, depthWrite: false });
  P.M.h6rope = P.M.rope || std('#C9A46A', { roughness: 0.95 });
  P.M.h6dent = new T.MeshStandardMaterial({ color: 0x2A1A08, roughness: 0.55, metalness: 0.6, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3 });
  P.M.h6dentRim = new T.MeshStandardMaterial({ color: 0xFFE08A, roughness: 0.25, metalness: 0.9, emissive: 0x3A2A08, side: T.DoubleSide });
  // the salt stains (המחשה): the sea water dried on the bronze — the owner 15.11 ("puffy cotton ropes"): flat, thin, broken crusted runs
  // (0.03–0.06 amot wide), faint, down from the rivets and the bands' seams, longer low on the leaf; fine speckle along the seams and the
  // rivet lines and a sparse grain along the foot; no round blobs, no thickness (one flat canvas over the face; a fixed hash, no randomness)
  { const W = GT.leafW, H = GT.leafH, PX = 96, cw = Math.round(W * PX), ch = Math.round(H * PX), cv = document.createElement('canvas'); cv.width = cw; cv.height = ch; const g = cv.getContext('2d');
    const hs = (n) => { const v = Math.sin(n * 12.9898 + 78.233) * 43758.5453; return v - Math.floor(v); };
    const yPx = (y) => ch - y * PX, rows = [0.4, H * 0.35, H * 0.68, H - 0.4], cols = [0, 1, 2, 3, 4, 5].map((k) => 0.5 + k * (W - 1) / 5);
    const col = (a) => `rgba(232,230,220,${a.toFixed(3)})`;
    g.lineCap = 'butt';
    const speck = (z, y, a) => { g.fillStyle = col(a); g.fillRect(Math.round(z * PX), Math.round(yPx(y)), 1 + (hs(z * 31 + y) > 0.7 ? 1 : 0), 1); };
    const run = (z0, y0, len, w0, a0, seed) => {   // (a broken run down the face: short dashes, the gaps wider toward its end, its width 0.03–0.06)
      let y = y0, i = 0, z = z0;
      while (y > y0 - len && y > 0.05) {
        const f = (y0 - y) / len, h1 = hs(seed + i * 1.3), h2 = hs(seed + i * 2.1);
        const seg = 0.05 + 0.4 * h1 * h1 * (1 - 0.5 * f) + 0.08 * hs(seed + i * 5.3), gap = 0.02 + 0.5 * h2 * h2 * (0.4 + f);
        // (each dash a crusted crawl: three short pieces of wandering width and strength, crystals beside it now and then)
        let zz = z, yy = y;
        for (let q = 0; q < 3; q++) {
          const sub = seg / 3, z1 = zz + (hs(seed + i * 0.37 + q * 0.11) - 0.5) * 0.035;
          const w = Math.max(0.03, Math.min(0.06, w0 * (1 - 0.4 * f) * (0.6 + 0.7 * hs(seed + i * 0.7 + q * 0.29)))), a = a0 * (1 - 0.5 * f) * (0.45 + 0.55 * hs(seed + i * 3.1 + q * 0.53));
          g.strokeStyle = col(a); g.lineWidth = w * PX; g.beginPath(); g.moveTo(zz * PX, yPx(yy)); g.lineTo(z1 * PX, yPx(yy - sub)); g.stroke();
          zz = z1; yy -= sub;
        }
        for (let q = 0; q < 3; q++) if (hs(seed + i * 7.7 + q) > 0.55) speck(zz + (hs(seed + i * 8.1 + q) - 0.5) * 0.14, y - seg * hs(seed + i * 9.3 + q), a0 * (0.6 + 0.6 * hs(seed + q + i)));
        z = zz; y -= seg + gap; i++;
      }
    };
    rows.forEach((y, r) => {
      const low = 1 - y / H;   // (low on the leaf: longer and a little heavier)
      cols.forEach((z, k) => { const sd = 11 + r * 17 + k * 5; if (hs(sd) < 0.3 + 0.25 * (1 - low)) return; run(z + 0.02, y - 0.1, Math.min(y - 0.05, 1.0 + 3.8 * low * (0.6 + 0.8 * hs(sd + 1))), 0.045, 0.18 + 0.12 * low, sd); });
      for (let q = 0; q < 3; q++) { const sd = 97 + r * 13 + q; run(0.2 + (W - 0.4) * hs(sd), y - 0.24, Math.min(y - 0.05, 0.6 + 2.4 * low * hs(sd + 2)), 0.035, 0.16 + 0.12 * low, sd); }   // (from the band's seam)
      for (let i = 0; i < 140; i++) { const sd = 2000 + r * 211 + i; speck(W * hs(sd), y + (hs(sd + 1) > 0.5 ? 0.23 : -0.23) + (hs(sd + 2) - 0.5) * 0.04, 0.22 + 0.2 * hs(sd + 3)); }   // (along the band's two seams)
      for (const z of cols) for (let i = 0; i < 14; i++) { const sd = 3000 + r * 97 + z * 13 + i; speck(z + (hs(sd) - 0.5) * 0.22, y + (hs(sd + 1) - 0.5) * 0.22, 0.2 + 0.2 * hs(sd + 2)); }   // (round the rivets)
    });
    for (const z of [0.2, W - 0.2]) run(z, H - 0.6, H * 0.45, 0.035, 0.16, 300 + z);   // (down the edge strips' seams)
    for (let i = 0; i < 700; i++) { const z = W * hs(500 + i), y = 0.04 + 1.1 * Math.pow(hs(700 + i), 2.2); speck(z, y, 0.16 + 0.22 * hs(900 + i)); }   // (a sparse grain along the foot)
    const tx = new T.CanvasTexture(cv); tx.colorSpace = T.SRGBColorSpace;
    tx.anisotropy = 4; P.M.h6salt = new T.MeshStandardMaterial({ map: tx, transparent: true, depthWrite: false, roughness: 1, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2 }); }
  return P.M;
}
const box = (X, mat, x0, y0, z0, x1, y1, z1, parent) => {
  const m = new X.THREE.Mesh(X.props.geo.box, mat); m.scale.set(Math.max(1e-3, Math.abs(x1 - x0)), Math.max(1e-3, Math.abs(y1 - y0)), Math.max(1e-3, Math.abs(z1 - z0)));
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = true; m.receiveShadow = true; (parent || X.props.root).add(m); return m;
};
export { box };
const drop = (X, list) => { for (const o of list) X.props.remove(o); list.length = 0; };

/* ───────── the ramp: its line, the sledge on it ───────── */
const L0 = RMP.low, L1 = RMP.sill;
/** the ramp's top line (the timber's surface under the sledge's runners) at x: the floor beyond its low end, the sill past its head */
export function rampY(x) { if (x >= L0[0]) return L0[2]; if (x <= L1[0]) return L1[2]; return L0[2] + (L1[2] - L0[2]) * (L0[0] - x) / (L0[0] - L1[0]); }
export const PITCH = Math.atan2(L1[2] - L0[2], L0[0] - L1[0]);
const DECK = 0.28;   // (the planks' thickness over the stringers' line)
/** the sledge's pose at climb d: the tail and head x, their heights, the pitch (rad, + the head up), the middle */
export function sledgeAt(d) {
  const t = tailX(d), h = t - CAP.L, yt = rampY(t) + DECK, yh = rampY(h) + DECK;
  return { t, h, yt, yh, pitch: Math.atan2(yh - yt, CAP.L), mx: (t + h) / 2, my: (yt + yh) / 2 };
}
/** the ramp's timbers: two stringers on posts, the deck's planks (the rough ones darker and splintered), the six notch blocks; broken: [i …]
 *  a broken plank just above each notch the sledge ran back to */
export function rampBuild(X, broken = []) {
  const M = mats6(X), T = X.THREE, g = new T.Group(); X.props.root.add(g);
  const len = Math.hypot(L0[0] - L1[0], L1[2] - L0[2]), w = RMP.w;
  const along = (x0, x1, y, z0, z1, th, mat, yaw = 0) => {
    const m = new T.Mesh(X.props.geo.box, mat); const xm = (x0 + x1) / 2; m.scale.set(Math.abs(x1 - x0) / Math.cos(PITCH), th, Math.abs(z1 - z0));
    m.position.set(xm, rampY(xm) + y, (z0 + z1) / 2); m.rotation.set(0, yaw, -PITCH); m.castShadow = true; m.receiveShadow = true; g.add(m); return m;
  };
  for (const s of [-1, 1]) along(L1[0], L0[0], -0.3, s * w / 2 - 0.35 * s - 0.25, s * w / 2 - 0.35 * s + 0.25, 0.6, M.h6timber);
  const rough = (x) => RMP.rough.some(([a, b]) => x >= a && x <= b);
  const brokeAt = new Set((broken || []).filter((i) => i >= 0).map((i) => RMP.notch[i] - 1.5));
  for (let x = L1[0] + 0.5; x < L0[0]; x += 1) {
    const r = rough(x), br = [...brokeAt].some((b) => Math.abs(b - x) < 0.5);
    if (br) { along(x - 0.42, x - 0.05, DECK / 2 - 0.05, -w / 2, -0.3, 0.2, M.h6rough, 0.18); along(x + 0.05, x + 0.42, DECK / 2 - 0.18, 0.4, w / 2, 0.2, M.h6rough, -0.12); continue; }
    const m = along(x - 0.43, x + 0.43, DECK / 2 - 0.1, -w / 2, w / 2, 0.22, r ? M.h6rough : M.h6timberL);
    if (r) { m.rotation.x = ((x * 7.3) % 1 - 0.5) * 0.06; m.position.y += ((x * 3.1) % 1) * 0.06; }
  }
  // the notches: a cross block on the deck at each (the wedge drops behind it); (build 128 tuning T1) its ends run out through the
  // stringers as lugs past the ramp's edges, so a notch is seen beside the sledge while the sledge covers its middle
  g.userData.notch = RMP.notch.map((x) => along(x - 0.18, x + 0.18, DECK + 0.08, -w / 2 - 0.7, w / 2 + 0.7, 0.3, M.h6timber));
  // the posts under it (pairs, every four amot), down to the court's floor
  for (let x = L1[0] + 3; x < L0[0] - 1; x += 4) for (const s of [-1, 1]) box(X, M.h6timber, x - 0.22, L0[2], s * (w / 2 - 0.35) - 0.22, x + 0.22, rampY(x) - 0.55, s * (w / 2 - 0.35) + 0.22, g);
  // the roller on the sill the rope runs over
  { const r = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, w - 1, 10), M.h6timber); r.rotation.x = Math.PI / 2; r.position.set(L1[0] + 0.3, L1[2] + 0.35, 0); g.add(r); }
  void len; return g;
}
/** the sledge (two runners, cross bars) with a bronze leaf lying on it (when `leaf`); pose(d) */
export function sledgeMesh(X, leaf = true) {
  const M = mats6(X), T = X.THREE, g = new T.Group(); X.props.root.add(g);
  const L = CAP.L, w = RMP.w - 1;
  for (const s of [-1, 1]) box(X, M.h6timber, -L / 2, 0, s * w / 2 - 0.3, L / 2, 0.45, s * w / 2 + 0.3, g);
  for (let x = -L / 2 + 1; x < L / 2; x += 3) box(X, M.h6timberL, x - 0.25, 0.45, -w / 2, x + 0.25, 0.65, w / 2, g);
  let lf = null; if (leaf) { lf = leafSlab(X, false); lf.rotation.z = -Math.PI / 2; lf.position.set(-L / 2 + 0.2, 0.65 + GT.leafT / 2, -GT.leafW / 2); g.add(lf); }
  g.userData.leaf = lf;
  g.userData.pose = (d) => { const s = sledgeAt(d); g.position.set(s.mx, s.my, 0); g.rotation.set(0, 0, -s.pitch); return s; };
  return g;
}
/** a bronze leaf as a slab: width along local +z (0 … W), height along +y (0 … H), its thickness across x; bands and rivets (merged) */
export function leafSlab(X, salt, dent, xs = 1) {
  const M = mats6(X), T = X.THREE, g = new T.Group(), W = GT.leafW, H = GT.leafH, t = GT.leafT;
  const slab = new T.Mesh(X.props.geo.box, M.h6bronze); slab.scale.set(t, H, W); slab.position.set(0, H / 2, W / 2); slab.castShadow = true; slab.receiveShadow = true; g.add(slab);
  const parts = [];
  const bx = (y0, y1, z0, z1, d = 0.07) => { for (const s of [-1, 1]) { const q = new T.BoxGeometry(d, y1 - y0, z1 - z0); q.translate(s * (t / 2 + d / 2), (y0 + y1) / 2, (z0 + z1) / 2); parts.push(q); } };
  for (const y of [0.4, H * 0.35, H * 0.68, H - 0.4]) bx(y - 0.22, y + 0.22, 0.05, W - 0.05);
  bx(0.05, H - 0.05, 0.05, 0.35); bx(0.05, H - 0.05, W - 0.35, W - 0.05);
  for (const y of [0.4, H * 0.35, H * 0.68, H - 0.4]) for (let k = 0; k < 6; k++) for (const s of [-1, 1]) { const q = new T.SphereGeometry(0.07, 6, 4); q.translate(s * (t / 2 + 0.1), y, 0.5 + k * (W - 1) / 5); parts.push(q); }
  const bands = new T.Mesh(mergeGeometries(parts.map((p) => p.index ? p.toNonIndexed() : p), false), M.h6bronzeD); bands.castShadow = true; g.add(bands);
  // the ring handle on the inner face (west)
  { const r = new T.Mesh(new T.TorusGeometry(0.35, 0.06, 6, 16), M.h6bronzeD); r.rotation.y = Math.PI / 2; r.position.set(-xs * (t / 2 + 0.12), H * 0.3, W - 0.9); g.add(r); }
  if (dent) for (const fs of [1, -1]) {   // (the dent where the leaves met too fast: a hollow by the meeting edge, seen from both sides — a dark pit, a bright bruised rim, two scores)
    const f = fs * xs, y = H * 0.42, z = W - 0.75, o = (t / 2 + 0.02) * f;
    const pit = new T.Mesh(new T.CircleGeometry(0.62, 20), M.h6dent); pit.rotation.y = f * Math.PI / 2; pit.scale.set(1, 1.3, 1); pit.position.set(o, y, z); g.add(pit);
    const rim = new T.Mesh(new T.TorusGeometry(0.66, 0.07, 6, 24), M.h6dentRim); rim.rotation.y = f * Math.PI / 2; rim.scale.set(1, 1.3, 1); rim.position.set(o + 0.02 * f, y, z); g.add(rim);
    for (const [dy, a] of [[0.95, 0.5], [-1.0, -0.35]]) { const sc = new T.Mesh(new T.PlaneGeometry(0.06, 0.8), M.h6dentRim); sc.rotation.set(0, f * Math.PI / 2, 0); sc.rotateX(a); sc.position.set(o + 0.01 * f, y + dy, z - 0.1); g.add(sc); }
  }
  if (salt) { const p = new T.Mesh(new T.PlaneGeometry(W, H), M.h6salt); p.rotation.y = xs * Math.PI / 2; p.position.set(xs * (t / 2 + 0.12), H / 2, W / 2); g.add(p); }   // (one sheet over the face: the streaks run from its rivets)
  return g;
}
/** a hung leaf: its group at the hinge; set(phi) the opening angle (deg: 90 open against the passage's side, 0 closed) */
export function leafHung(X, side, o = {}) {
  const T = X.THREE, h = GT.hinge[side], g = new T.Group(); g.position.set(h[0], GT.sill, h[1]); X.props.root.add(g);
  const s = leafSlab(X, !!o.salt, !!o.dent, side === 'S' ? -1 : 1); g.add(s);
  if (side === 'S') s.rotation.y = Math.PI;   // (the south leaf runs from its hinge toward the north: turned round, its faces swapped back)
  g.userData.set = (phi) => { g.rotation.y = (side === 'N' ? -1 : 1) * phi * Math.PI / 180; };
  g.userData.set(o.phi == null ? 90 : o.phi);
  return g;
}

/* ───────── the capstan ───────── */
export function capstanMesh(X) {
  const M = mats6(X), T = X.THREE, g = new T.Group(), c = S6.capstan; g.position.set(c[0], c[2], c[1]); X.props.root.add(g);
  const drum = new T.Mesh(new T.CylinderGeometry(0.75, 0.85, 2.0, 14), M.h6timber); drum.position.y = 1.0; drum.castShadow = true; g.add(drum);
  const cap = new T.Mesh(new T.CylinderGeometry(1.0, 0.8, 0.35, 14), M.h6timberL); cap.position.y = 2.15; g.add(cap);
  const rot = new T.Group(); g.add(rot); rot.add(drum); rot.add(cap);
  for (let k = 0; k < 4; k++) { const b = new T.Mesh(X.props.geo.box, M.h6timberL); b.scale.set(3.6, 0.18, 0.18); const a = k * Math.PI / 2; b.position.set(Math.cos(a) * 2.6, 1.6, Math.sin(a) * 2.6); b.rotation.y = -a; b.castShadow = true; rot.add(b); }
  // the rope's turns on the drum
  for (let k = 0; k < 4; k++) { const r = new T.Mesh(new T.TorusGeometry(0.82, 0.06, 5, 16), M.h6rope); r.rotation.x = Math.PI / 2; r.position.y = 0.55 + k * 0.14; rot.add(r); }
  // the pawl ring on the floor (its teeth) and the pawl
  const ring = new T.Mesh(new T.CylinderGeometry(1.25, 1.25, 0.16, 20), M.h6timber); ring.position.y = 0.08; g.add(ring);
  box(X, M.h6bronzeD, 1.05, 0.12, -0.12, 1.55, 0.3, 0.12, g);
  g.userData.rot = rot;
  g.userData.ropeAt = (out) => out.set(c[0] + 0.85, c[2] + 0.75, c[1]);   // (the rope leaves the drum toward the east)
  return g;
}

/* ───────── the wickets ───────── */
/** a wicket (המחשה: 2 × 4) in the gate house's west face, seen from inside: its door, its two rings (left: the upper bolt, right: the
 *  lower), the two bolts and the gear between them; plate: the cover over the gear; set(a, b, travel) */
export function wicketMesh(X, k, o = {}) {
  const M = mats6(X), T = X.THREE, p = WK[k], g = new T.Group(); g.position.set(p[0], p[2], p[1]); X.props.root.add(g);
  const w = WK.w, h = WK.h, f = -0.04;   // (on the face, toward the Azarah: −x)
  box(X, M.h6dark, f - 0.02, 0, -w / 2 - 0.12, f, h + 0.12, w / 2 + 0.12, g);
  box(X, M.h6bronze, f - 0.2, 0.02, -w / 2, f - 0.02, h, w / 2, g);
  for (const y of [0.5, h / 2, h - 0.5]) box(X, M.h6bronzeD, f - 0.26, y - 0.08, -w / 2 + 0.06, f - 0.2, y + 0.08, w / 2 - 0.06, g);
  // the bolts: the upper rises into the lintel, the lower drops into the sill (their travel: 0 open … 1 locked)
  // (o.bold, both wickets in one far frame: the bolt bars thick and bright, so their slide reads at that size — the owner 15.11)
  if (o.bold && !M.h6boltB) M.h6boltB = new T.MeshStandardMaterial({ color: 0xFFD27A, emissive: 0x8A5A10, emissiveIntensity: 0.7, roughness: 0.3, metalness: 0.6 });
  const bz = o.bold ? 0.26 : 0.12, bx0 = o.bold ? f - 0.5 : f - 0.42, bm = o.bold ? M.h6boltB : M.h6bronzeD;
  const up = box(X, bm, bx0, h * 0.55, -bz, f - 0.26, h - 0.2, bz, g), lo = box(X, bm, bx0, 0.2, -bz, f - 0.26, h * 0.45, bz, g);
  const lintel = box(X, M.h6pass, f - 0.5, h + 0.12, -0.5, f, h + 0.5, 0.5, g); void lintel;
  // the gear between them (its teeth: a toothed wheel), and its cover plate
  // (its axle across the door: a group turned so the wheel's own axis is the world's x; the wheel turns about it, its ten teeth round it)
  const gearG = new T.Group(); gearG.position.set(f - 0.34, h / 2, 0); gearG.rotation.z = Math.PI / 2; g.add(gearG);
  const gear = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, 0.12, 12), M.h6bronzeD); gearG.add(gear);
  const teeth = []; for (let i = 0; i < 10; i++) { const a = i * TAU / 10, t2 = new T.Mesh(X.props.geo.box, M.h6bronzeD); t2.scale.set(0.1, 0.1, 0.07); t2.position.set(Math.cos(a) * 0.32, 0, Math.sin(a) * 0.32); t2.rotation.y = -a; gear.add(t2); teeth.push(t2); }
  const plate = box(X, M.h6bronzeD, f - 0.5, h / 2 - 0.55, -0.42, f - 0.44, h / 2 + 0.55, 0.42, g); plate.visible = !!o.plate;
  // the two ring handles (left = north side seen from the Azarah: the camera faces east, so the left is −z)
  const ringL = new T.Mesh(new T.TorusGeometry(0.3, 0.05, 6, 18), M.h6bronze); ringL.rotation.y = Math.PI / 2; ringL.position.set(f - 0.55, h * 0.52, -0.55); g.add(ringL);
  const ringR = new T.Mesh(new T.TorusGeometry(0.3, 0.05, 6, 18), M.h6bronze); ringR.rotation.y = Math.PI / 2; ringR.position.set(f - 0.55, h * 0.52, 0.55); g.add(ringR);
  for (const r of [ringL, ringR]) { const sp = box(X, M.h6bronzeD, -0.03, -0.03, -0.03, 0.03, 0.03, 0.31, r); sp.position.set(0, 0, 0); }
  // a bent tooth (from the save): a tooth of the gear bent askew, dark
  const bent = [o.tooth && o.tooth[0], o.tooth && o.tooth[1]];
  if (bent[0] || bent[1]) { teeth[2].rotation.z = 0.7; teeth[2].scale.set(0.13, 0.1, 0.07); teeth[2].material = M.h6dark; }
  g.userData = { up, lo, gear, plate, ringL, ringR, h, k,
    set(a, b, tr) { ringL.rotation.x = (a || 0) * Math.PI / 180; ringR.rotation.x = -(b || 0) * Math.PI / 180; gear.rotation.y = Math.min(a || 0, b || 0) * Math.PI / 180 * 0.5; const u = clamp(tr || 0, 0, 1); up.position.y = h * 0.775 - 0.05 + u * 0.32; lo.position.y = h * 0.225 + 0.1 - u * 0.32; },
    ringAt(side, out) { const r = side === 'L' ? ringL : ringR; r.updateMatrixWorld(true); return r.getWorldPosition(out); } };
  g.userData.set(0, 0, o.locked ? 1 : 0);
  return g;
}

/* ───────── the steps: the core and the fifteen rings ───────── */
/** a sector of an annulus (r0 … r1, angle a0 … a1 from the north end round by the east, y0 … y1) as a flat-shaded geometry; ends: draw
 *  the two end faces */
export function sectorGeo(T, r0, r1, a0, a1, y0, y1, ends = true) {
  const n = Math.max(1, Math.ceil((a1 - a0) / 0.06)), P = [];
  const pt = (r, a, y) => [C0[0] + r * Math.sin(a), y, C0[1] - r * Math.cos(a)];
  const quad = (A, B, Cc, D) => { P.push(...A, ...B, ...Cc, ...A, ...Cc, ...D); };
  for (let k = 0; k < n; k++) {
    const u0 = a0 + (a1 - a0) * k / n, u1 = a0 + (a1 - a0) * (k + 1) / n;
    quad(pt(r0, u0, y1), pt(r0, u1, y1), pt(r1, u1, y1), pt(r1, u0, y1));   // the top
    quad(pt(r1, u0, y1), pt(r1, u1, y1), pt(r1, u1, y0), pt(r1, u0, y0));   // the outer face (the riser)
    if (r0 > 0.01) quad(pt(r0, u1, y1), pt(r0, u0, y1), pt(r0, u0, y0), pt(r0, u1, y0));
  }
  if (ends) { quad(pt(r1, a0, y1), pt(r1, a0, y0), pt(r0, a0, y0), pt(r0, a0, y1)); quad(pt(r0, a1, y1), pt(r0, a1, y0), pt(r1, a1, y0), pt(r1, a1, y1)); }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(new Float32Array(P), 3)); g.computeVertexNormals();
  return g;   // (counter-clockwise from outside: the top up, the riser out, the ends along the arc)
}
/** the angle (rad from the north end) of a point q quarter-amot along ring i's outer edge */
export const angOf = (P, q) => (q * Q) / P.R;
/** ring i's stones as they stand: [{ a0, a1, crack, corner, key, id, his }] — the crews' from both ends, and the gap: open (none), or
 *  closed with the row the save holds (or the plan's one way) and the closing stone. open: the gap is left open */
export function ringStones(i, rec, open) {
  const P = ringPlan(i), L = [], J = 0.004;
  let s = 0; for (const l of P.crew.north) { L.push({ a0: angOf(P, s) + J, a1: angOf(P, s + l) - J }); s += l; }
  let e = P.arc; for (const l of P.crew.south) { L.push({ a0: angOf(P, e - l) + J, a1: angOf(P, e) - J }); e -= l; }
  if (open) return L;
  const r = rec || { left: P.sol.left, right: P.sol.right };
  const len = (id) => (P.yard.find((y) => y.id === id) || { len: 0 }).len, crk = (id) => !!(P.yard.find((y) => y.id === id) || {}).crack;
  let q = P.g0; for (const id of r.left) { L.push({ a0: angOf(P, q) + J, a1: angOf(P, q + len(id)) - J, id, his: 1, crack: !!(rec && rec.crack && crk(id)) }); q += len(id); }
  const keyA = q; let q2 = P.g0 + P.G; for (const id of r.right) { L.push({ a0: angOf(P, q2 - len(id)) + J, a1: angOf(P, q2) - J, id, his: 1, crack: !!(rec && rec.crack && crk(id)) }); q2 -= len(id); }
  L.push({ a0: angOf(P, keyA) + J, a1: angOf(P, keyA + P.C) - J, key: 1, his: 1, corner: !!(rec && rec.corner) });
  return L;
}
/** the whole steps as the save has them: the core under every ring; each ring shown laid, its gap open or closed. S: { laid(i), closed(i),
 *  rec(i) } → a group (merged per material) */
function stepsBuild(X, S, skip = 0) {
  const M = mats6(X), T = X.THREE, g = new T.Group(); X.props.root.add(g);
  const core = [], stone = [], shade = [], dark = [];
  for (let i = 1; i <= 15; i++) { const R = ringOf(i); core.push(sectorGeo(T, R.R - STP.tread, R.R, 0, Math.PI, STP.floor, R.base, false)); }
  core.push(sectorGeo(T, 0, ringOf(15).R - STP.tread, 0, Math.PI, STP.floor, ringOf(15).top, false));   // (the landing before the gate)
  for (let i = 1; i <= 15; i++) {
    if (i === skip || !S.laid(i)) continue;
    const R = ringOf(i), rec = S.rec(i);
    for (const st of ringStones(i, rec, !S.closed(i))) {
      if (st.corner) {   // (the closing stone lost its outer north corner: the stone without it)
        const da = Math.min(0.5 / R.R, (st.a1 - st.a0) * 0.3);
        stone.push(sectorGeo(T, R.R - STP.tread, R.R, st.a0 + da, st.a1, R.base, R.top));
        stone.push(sectorGeo(T, R.R - STP.tread, R.R - 0.22, st.a0, st.a0 + da, R.base, R.top));
        stone.push(sectorGeo(T, R.R - 0.22, R.R, st.a0, st.a0 + da, R.base, R.top - 0.3));
        continue;
      }
      (rec && rec.shade && st.crack ? shade : stone).push(sectorGeo(T, R.R - STP.tread, R.R, st.a0, st.a1, R.base, R.top));
      if (st.crack) { const am = (st.a0 + st.a1) / 2; dark.push(sectorGeo(T, R.R - STP.tread + 0.02, R.R - 0.02, am - 0.004, am + 0.006, R.top, R.top + 0.012, false)); }
    }
  }
  const add = (L, mat) => { if (!L.length) return; const m = new T.Mesh(mergeGeometries(L, false), mat); m.castShadow = true; m.receiveShadow = true; g.add(m); for (const q of L) q.dispose(); };
  add(core, M.h6core); add(stone, M.h6stone); add(shade, M.h6shade); add(dark, M.h6dark);
  return g;
}

/* ───────── the passage through the gate house (its stones are the world's: cut out there; ours line it) ───────── */
const HOLES = () => {
  const x0 = GT.x[0], x1 = GT.x[1], h = GT.half, R = STP.R1;
  return [[x0 - 0.1, -h, x1 + 0.9, h], [x1 + 0.9, -R - 0.1, C0[0] + R + 0.1, R + 0.1], [x1, h + 1.35, x1 + 0.9, R + 0.1], [x1, -R - 0.1, x1 + 0.9, -h - 1.35]];
};
/* the gate house's own ashlar on what we add to it (the passage's lining, its ceiling, the face over the rings): the site's own built
 * material — its map, normal map and course joints (its bcJ) — with uniforms of our own (no holes cut in it), and the world-space
 * texture coordinates the site's batch gives its walls (batch.js add: u along the face, v the height, both over the tile), so the
 * courses run on from the stones beside them at the same heights. Without the site's mesh (a test page), the steps' stone. */
const TILE_ASH = 24;   // (main.js mats.ash.tile: amot per texture repeat)
function ashMat(X) {
  if (SH6.ashM !== undefined) return SH6.ashM;
  let src = null;
  try { X.scene.traverse((o) => { if (src || !o.isMesh || o.name !== 'ash') return; const mm = Array.isArray(o.material) ? o.material.find((q) => q && q.map) : o.material; if (!mm || !mm.map) return; let p = o; while (p && !/^stage-nikanor$/.test(p.name || '')) p = p.parent; if (p) src = mm; }); } catch (e) { src = null; }
  if (!src) { SH6.ashM = null; return null; }
  const U = revealUniforms(), m = buildMaterial(src, U, TILE_ASH, src.userData.bcJ || null); setBuilding(m, true);
  SH6.ashM = m; return m;
}
function ashBox(X, x0, y0, z0, x1, y1, z1, parent) {
  const T = X.THREE, mat = ashMat(X), M = mats6(X);
  if (!mat) return box(X, M.h6stone, x0, y0, z0, x1, y1, z1, parent);
  const g = new T.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)).toNonIndexed(); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  const P = g.attributes.position.array, N = g.attributes.normal.array, n = P.length / 3, uv = new Float32Array(n * 2), ab = new Float32Array(n).fill(Math.min(y0, y1, GT.sill));   // (the occlusion counts from the floor it stands on: the ceiling is not a slab lying on the ground)
  for (let i = 0; i < n; i++) {
    const x = P[3 * i], y = P[3 * i + 1], z = P[3 * i + 2], nx = N[3 * i], ny = N[3 * i + 1], nz = N[3 * i + 2], ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
    let u, v; if (ay >= ax && ay >= az) { u = x; v = -z; if (ny < 0) u = -u; } else if (ax >= az) { u = nx > 0 ? -z : z; v = y; } else { u = nz > 0 ? x : -x; v = y; }
    uv[2 * i] = u / TILE_ASH; uv[2 * i + 1] = v / TILE_ASH;
  }
  g.setAttribute('uv', new T.BufferAttribute(uv, 2)); g.setAttribute('aBase', new T.BufferAttribute(ab, 1));
  const me = new T.Mesh(g, mat); me.castShadow = true; me.receiveShadow = true; (parent || X.props.root).add(me); return me;
}
function passageBuild(X) {
  const M = mats6(X), T = X.THREE, g = new T.Group(); X.props.root.add(g);
  const x0 = GT.x[0], x1 = GT.x[1], h = GT.half;
  ashBox(X, x0, STP.floor, -h, x1, GT.sill, h, g);              // the passage's floor (the gate house's body under it)
  ashBox(X, x0, GT.sill, -h - 0.6, x1, GT.top, -h, g);          // its two sides
  ashBox(X, x0, GT.sill, h, x1, GT.top, h + 0.6, g);
  // (the holes cut the gate house's east face 0.9 deep beside the doors, where the old steps stood, from the floor to the doors' top
  //  — stages.siteHoles takes one height for all its rectangles — and the model is hollow: this face stands again over each ring)
  for (const sg of [1, -1]) ashBox(X, x1, GT.sill, sg > 0 ? h : -h - 1.35, x1 + 0.9, GT.top, sg > 0 ? h + 1.35 : -h, g);   // (the passage's hole runs 0.9 past its east end: its jambs there, out to where the faces over the rings begin (h + 1.35), so no slit beside the doors)
  const zA = h + 1.35, zB = STP.R1 + 0.1;
  for (let i = 1; i <= 15; i++) {
    const R = ringOf(i), zo = Math.min(zB, R.R), zi = Math.max(zA, R.R - STP.tread); if (zo <= zi) continue;
    for (const sg of [1, -1]) ashBox(X, x1, R.top, sg > 0 ? zi : -zo, x1 + 0.9, GT.top, sg > 0 ? zo : -zi, g);
  }
  { const R = ringOf(15), zo = Math.min(zB, R.R - STP.tread); if (zo > zA) for (const sg of [1, -1]) ashBox(X, x1, R.top, sg > 0 ? zA : -zo, x1 + 0.9, GT.top, sg > 0 ? zo : -zA, g); }
  SH6.parts.ceil = ashBox(X, x0, GT.top, -h - 0.6, x1, GT.top + 0.6, h + 0.6, g);  // its ceiling (the closing's lifted view looks in from above: close.js hides it then)
  return g;
}
function holesSync(X, force) {
  const S0 = X.stages; SH6.holeT -= 1;
  if (!force && SH6.holeT > 0) return;
  SH6.holeT = 6;
  try { const info = S0.siteInfo ? S0.siteInfo('nikanor') : null; if (!info || info.status !== 'done') S0.setStage('nikanor', 'done', 1, { instant: true }); } catch (e) { /* */ }
  try { if (S0.siteOpen) S0.siteOpen('nikanor', true); } catch (e) { /* */ }
  try { if (S0.siteHoles) S0.siteHoles('nikanor', HOLES(), STP.floor - 0.05, GT.top); } catch (e) { /* */ }
}

/* ───────── the ground as it stands (stages.floorHook): the passage, the ramp, the steps' core and rings ───────── */
function floorAt(x, z) {
  const st = SH6.state; if (!st) return null;
  if (x >= GT.x[0] && x <= GT.x[1] && Math.abs(z) <= GT.half) return GT.sill;
  if (x < C0[0]) return null;
  const r = Math.hypot(x - C0[0], z - C0[1]);
  if (st.ramp && Math.abs(z) <= RMP.w / 2 && x <= L0[0]) return rampY(x) + DECK;
  if (r > STP.R1 || !st.core) return r <= STP.R1 ? STP.floor : null;
  if (r <= ringOf(15).R - STP.tread) return ringOf(15).top;
  const i = clamp(1 + Math.floor((STP.R1 - r) / STP.tread), 1, 15), R = ringOf(i);
  if (!st.laid(i)) return R.base;
  if (!st.closed(i)) { const P = ringPlan(i), a = Math.atan2(x - C0[0], -(z - C0[1])), q = (a * P.R) / Q; if (q > P.g0 && q < P.g0 + P.G) return R.base; }
  return R.top;
}

/* ───────── the world from the save ───────── */
function stateOf(X) {
  const M = X.M, st = M.st, d = (id) => M.isDone(id);
  const cap = d('capstan'), laidN = M.ringsLaid(), next = !d('ring1') ? 1 : !d('ring8') ? 8 : !d('ring15') ? 15 : 0;
  const S = {
    cap, ramp: !cap, core: cap, fin: M.finished(),
    laid: (i) => cap && (i <= laidN || i === next || M.finished()),
    closed: (i) => M.ringClosed(i),
    rec: (i) => st.rings[i] || null,
    leaves: cap, closedGate: d('close'), dent: (st.close && st.close.dent) || [0, 0], salt: M.finished(),
    wN: d('wicketN') || d('wickets'), wS: d('wicketS') || d('wickets'), tooth: { N: st.bolts.N.tooth, S: st.bolts.S.tooth },
    timber: (st.cap && st.cap.timber) || [],
  };
  return S;
}
const keyOf = (S) => JSON.stringify([S.cap, S.fin, [...Array(15)].map((_, k) => (S.laid(k + 1) ? 1 : 0) + (S.closed(k + 1) ? 2 : 0) + (S.rec(k + 1) ? JSON.stringify(S.rec(k + 1)).length * 4 : 0)), S.closedGate, S.dent, S.salt, S.wN, S.wS, S.tooth, S.timber, SH6.own]);
export function rebuild(X, force) {
  const S = stateOf(X); SH6.state = S;
  const k = keyOf(S); if (!force && k === SH6.key.all) return;
  SH6.key.all = k;
  const Pt = SH6.parts; for (const o of Object.values(Pt)) if (o) X.props.remove(o); SH6.parts = {};
  const P = SH6.parts, M = mats6(X);
  P.pass = passageBuild(X);
  if (S.ramp && !SH6.own.ramp) P.ramp = rampBuild(X, S.timber);
  if (!S.cap && !SH6.own.sledge) { P.sledge = sledgeMesh(X, true); P.sledge.userData.pose(0); }
  if (!S.cap && !SH6.own.capstan) P.capstan = capstanMesh(X);
  if (S.core) P.steps = stepsBuild(X, S, SH6.own.ring | 0);
  if (S.leaves && !SH6.own.leaves) {
    P.leafN = leafHung(X, 'N', { phi: S.closedGate ? 0 : 90 * VIS, dent: S.dent[1], salt: S.salt });
    P.leafS = leafHung(X, 'S', { phi: S.closedGate ? 0 : 90 * VIS, dent: S.dent[0] });
  }
  if (S.leaves) for (const k2 of ['N', 'S']) if (!SH6.own['w' + k2]) P['w' + k2] = wicketMesh(X, k2, { locked: k2 === 'N' ? S.wN : S.wS, plate: k2 === 'S' || S.wN, tooth: S.tooth[k2] });
  // the yard's stones and the templates' table (always, while the steps are being built: the crews work there)
  if (S.cap && !S.fin) {
    const g = new X.THREE.Group(); X.props.root.add(g); P.yard = g;
    const y = STP.yard, t = STP.table;
    if (!SH6.own.yard) for (let k2 = 0; k2 < 8; k2++) box(X, k2 % 3 ? M.h6stone : M.h6shade, y[0] - 3 + (k2 % 4) * 2.1, y[2], y[1] - 2.5 + Math.floor(k2 / 4) * 2.6, y[0] - 1.6 + (k2 % 4) * 2.1, y[2] + 0.5, y[1] - 1.4 + Math.floor(k2 / 4) * 2.6, g);
    box(X, M.h6timber, t[0] - 1.6, t[2] + 1.0, t[1] - 0.8, t[0] + 1.6, t[2] + 1.15, t[1] + 0.8, g);
    for (const [a, b] of [[-1.4, -0.6], [1.4, -0.6], [-1.4, 0.6], [1.4, 0.6]]) box(X, M.h6timber, t[0] + a - 0.08, t[2], t[1] + b - 0.08, t[0] + a + 0.08, t[2] + 1.0, t[1] + b + 0.08, g);
  }
  menSync(X, S);
}

/* ───────── the crews (never idle: masons dress stones in the yard, carriers bring them; at the capstan's bars before it turns) ───────── */
function menSync(X, S) {
  const key = (S.cap ? 'c' : 'r') + (S.fin ? 'f' : '') + (SH6.busy ? 'b' : '');
  if (SH6.key.men === key) return; SH6.key.men = key;
  for (const w of SH6.men) SH6.crew.remove(w); SH6.men = [];
  if (SH6.busy) return;
  const add = (x, z, o) => { const w = SH6.crew.add(x, z, o); if (w) SH6.men.push(w); return w; };
  const y = STP.yard;
  if (!S.fin) {
    add(y[0] - 2.3, y[1] + 1.2, { role: 'hammer', item: 'mallet', fx: y[0] - 2.3, fz: y[1] - 0.5, crew: 1 });
    add(y[0] + 1.9, y[1] + 1.2, { role: 'hammer', item: 'chisel', fx: y[0] + 1.9, fz: y[1] - 0.5, crew: 1 });
  }
  if (S.cap && !S.fin) {
    const e = STP.ends[0];
    add(y[0] - 4, y[1] + 3, { role: 'carry', item: 'stone', from: [y[0] - 4, y[1] + 3], to: [e[0] + 3, e[1] - 2.5], crew: 2 });
    add(e[0] + 2.2, e[1] - 1.8, { role: 'hammer', item: 'mallet', fx: e[0] + 2.5, fz: e[1] + 0.5, crew: 2 });
  }
}

export function initWorld(X) {
  mats6(X);
  SH6.X = X; SH6.M = X.M; SH6.B = createBeat(X); SH6.crew = createGang(X); SH6.key = {}; SH6.own = {}; SH6.busy = 0; SH6.men = [];
  try { window.__H128_SH6 = SH6; } catch (e) { /* (the probes' eyes) */ }
  try { const A = X.actors && X.actors(); if (A && A.setInstantVis) A.setInstantVis(true); } catch (e) { /* */ }
  holesSync(X, true);
  try { if (X.stages.floorHook) X.stages.floorHook(floorAt); } catch (e) { /* */ }
  if (X.M.finished()) SH6.final = 1;
  rebuild(X, true);
}
export function finalWorld(X) { if (!SH6.X) initWorld(X); SH6.final = 1; rebuild(X, true); }
/** an act takes a thing out of the world's hands while it plays it: 'ramp', 'sledge', 'capstan', 'leaves', 'wN', 'wS', or ring: i */
export function own(k, v) { if (v) SH6.own[k] = v; else delete SH6.own[k]; }
let jT = 0, hookT = 0;
export function frameWorld(dt, X) {
  if (SH6.film) { try { SH6.film.frame(dt); } catch (e) { console.warn('[h128] film frame', e && e.message); } }
  if (!SH6.B) return;
  SH6.t += dt; SH6.B.step(dt); if (SH6.crew) SH6.crew.update(dt, SH6.B);
  rustFrame(dt);
  // (the closing's lifted view — the act waits then — sees the twenty men from above: the passage's ceiling left out while the camera is high)
  const ce = SH6.parts.ceil; if (ce) { let hi = false; if (SH6.own.leaves && X.view && X.view.camNow) { const q = {}; try { X.view.camNow(q); hi = q.py > GT.top + 8; } catch (e) { /* */ } } ce.visible = !hi; }
  jT -= dt; if (jT <= 0) { jT = 0.5; try { rebuild(X); holesSync(X); } catch (e) { console.warn('[h128] world', e && e.message); } }
  hookT -= dt; if (hookT <= 0) { hookT = 2; try { if (X.stages.floorHook) X.stages.floorHook(floorAt); } catch (e) { /* */ } }
}
/* ───────── (build 128 tuning) rust flakes: a dry bolt, a stiff hinge shed a little rust dust when they are worked ───────── */
const RU = { mesh: null, p: [], N: 72, i: 0 };
/** n flakes of rust from (x, y, z), falling and tumbling to the ground in about a second (spread: amot across) */
export function rust(X, x, y, z, n = 6, spread = 0.3) {
  const T = X.THREE;
  if (!RU.mesh || !RU.mesh.parent) {
    RU.mesh = new T.InstancedMesh(X.props.geo.box, new T.MeshBasicMaterial({ color: 0x9A4A1C }), RU.N); RU.mesh.frustumCulled = false; RU.mesh.count = RU.N; X.props.root.add(RU.mesh);
    RU.p = [...Array(RU.N)].map(() => ({ life: 0, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, r: 0, s: 0.1 })); RU.m = new T.Matrix4(); RU.q = new T.Quaternion(); RU.e = new T.Euler(); RU.v = new T.Vector3(); RU.sc = new T.Vector3();
    for (let i = 0; i < RU.N; i++) { RU.m.makeScale(0, 0, 0); RU.mesh.setMatrixAt(i, RU.m); }
  }
  for (let k = 0; k < n; k++) {
    const P = RU.p[RU.i = (RU.i + 1) % RU.N], h = ((RU.i * 37 + k * 11) % 17) / 17, h2 = ((RU.i * 53 + k * 7) % 13) / 13;   // (a fixed spread: no randomness)
    const px = x + (h - 0.5) * spread, pz = z + (h2 - 0.5) * spread, fy = floorAt(px, pz);
    // (it falls slowly, as dust, and lies on the floor a while: a short heap of red where the bolt or the hinge grinds)
    Object.assign(P, { life: 3.2 + 0.6 * h, x: px, y, z: pz, fy: Number.isFinite(fy) && fy < y ? fy + 0.02 : y - 1.2, vx: (h2 - 0.5) * 0.4, vy: 0.15 + 0.2 * h, vz: (h - 0.5) * 0.4, r: h * 6, s: 0.1 + 0.08 * h2 });
  }
}
function rustFrame(dt) {
  if (!RU.mesh || !RU.mesh.parent) return;
  let live = 0;
  RU.p.forEach((P, i) => {
    if (P.life <= 0) return; P.life -= dt; live++;
    if (P.y > P.fy) { P.vy -= 4 * dt; P.x += P.vx * dt; P.y = Math.max(P.fy, P.y + P.vy * dt); P.z += P.vz * dt; P.r += dt * 6; }
    if (P.life <= 0) RU.m.makeScale(0, 0, 0);
    else { RU.q.setFromEuler(RU.e.set(P.r, P.r * 0.7, 0)); RU.m.compose(RU.v.set(P.x, P.y, P.z), RU.q, RU.sc.set(P.s, P.s * 0.4, P.s)); }
    RU.mesh.setMatrixAt(i, RU.m);
  });
  RU.mesh.instanceMatrix.needsUpdate = true; RU.live = live;
}
export function setBusy(X, v) { SH6.busy = v ? 1 : 0; try { menSync(X, SH6.state || stateOf(X)); } catch (e) { /* */ } }
export { floorAt, HOLES, clamp, lerp, ease, TAU };
