/* ── build 132 ── h132/sikra3d.js — work 4 "חוט הסיקרא": its things in the world (LANE B's file). Every place from BOOK.s09.
 *   the line: a ribbon on the block's faces that grows in place, sample by sample (no rebuild per frame), its colour the string's
 *     wetness when it was printed (dark, red, pale); its flaws as marks (seam, gap, drip, pink mark, stain, double stain, smear)
 *   the measuring: the rod with six notches, the wooden ladder leaned at the corner, the stakes
 *   the tools: the colour bow on its long wooden pole, the clay bowl, the helper's rod with its cloth swab (all wood and clay)
 *   the charcoal dots; the line as it stays (a lane of world.js: drawn from the save, its flaws kept)
 *   the sounds: string, wood, clay, a drop — nothing metal
 * Materials are made with the view (painted from the first frame).
 *
 *   VK · faceAt(s) · walkerAt(s, lv) · helperAt(s, lv) · footY(X, x, z) · camAt(s, lv) · smats(X) · makeRibbon · makeMarks · makeRod · makeLadder · makePole · makeBowl
 *   makeSwab · makeDots · voices(sfx) · lineRecord(L, track) · drawRecord(X, rec, parent) · SIKRA_LANE
 */
import { BOOK } from '../world/grid.js';
import { SK, TEF, wallAt, cornersOf } from './sikra-model.js';
import { addLane, SH9 } from './world.js';

const S9 = BOOK.s09, K9 = S9.sikra, LY = S9.lineY, F = S9.floor, TOP = S9.top;

/** the view's numbers (amot unless said; המחשה) */
export const VK = Object.freeze({
  LINE_H: 0.05,          // half the printed line's height
  OUT: 0.035,            // the line off the face (no flicker)
  DOT_R: 0.07,           // a charcoal dot's radius
  // the worker's path off each face (E: stand:w4 is 1.2 out; W: path:W, x −54.3, 1.3 out of −53; N and S as W)
  PATH: Object.freeze({ E: +(S9.stand.w4[0] - S9.block[2]).toFixed(3), N: 1.3, W: +(S9.block[0] - K9.pathW.x).toFixed(3), S: 1.3 }),
  // the helper ahead of him along the wall, a little further out (in the west in the same one-amah gap: never on the Ulam's steps)
  HELP_AHEAD: 4.4, HELP_OUT: Object.freeze({ E: 0.9, N: 0.9, W: 0, S: 0.9 }),
  // the follow camera (cam:w4: behind the worker and a little to the side, the wall left to right, the worker in the left third, the
  // helper and the bowl right of the middle; far enough that both stand whole from their feet on the fallen boards to the wall's top,
  // at the act's lens — the figures gate's rule "whole or absent"). West: the gap is one amah — the camera above him and behind
  CAM: Object.freeze({ back: 6, out: 16, up: 6, aimF: 2.8, aimIn: 0.8, aimUp: 3.4 }),
  CAMW: Object.freeze({ back: 13, out: 2.5, up: 13, aimF: 4, aimIn: 0.2, aimUp: 1.5 }),
  // the measuring: the face each corner's ladder leans on (its place is the book's, sikra:ladder — beside the rod, not before it)
  LAD_FACE: Object.freeze({ NE: 'z', SE: 'x', SW: 'z', NW: 'z' }),
  BOWL_PX: 52, DRIP_PX: 40,  // the right thumb's targets on the screen (the bowl about 2.5 cm: its hit radius in css px)
  BOWL_R: 0.62,          // the bowl's radius (a big clay bowl, seen)
  POLE_R: 0.05,
});

const N_OF = Object.freeze({ E: [1, 0], N: [0, -1], W: [-1, 0], S: [0, 1] });
/** the face at s: its point on the line (x, z), the walk's unit u along it and the outward normal n */
export function faceAt(s) {
  // (past the round's end it goes on round the start: a close too long prints on the east face again, the helper walks on round it)
  const P = 4 * SK.SIDE; if (s >= P) s -= P;
  const w = wallAt(Math.min(s, P - 1e-9)), R = S9.run[w.k], L = SK.SIDE, ux = (R.to[0] - R.from[0]) / L, uz = (R.to[1] - R.from[1]) / L;
  const d = s - w.i * SK.SIDE;
  return { k: w.k, x: R.from[0] + ux * d, z: R.from[1] + uz * d, u: [ux, uz], n: N_OF[w.k] };
}
const rot = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
/** the frame round a corner: through the zone (an amah before and after the stake) u and n turn a quarter by themselves */
function frameAt(s, lv) {
  const f = faceAt(s); let blend = null;
  for (const c of (lv | 0) === 1 ? cornersOf(lv) : [...cornersOf(lv), 4 * SK.SIDE]) if (s >= c - SK.CORNER && s < c + SK.CORNER) blend = { c, t: (s - (c - SK.CORNER)) / (2 * SK.CORNER) };
  if (!blend) return { ...f, u: f.u, n: f.n, k1: f.k, k2: f.k, t: 0 };
  const a = faceAt(blend.c - 0.5), b = faceAt(blend.c + 0.5), sgn = Math.sign(a.u[0] * b.u[1] - a.u[1] * b.u[0]) || 1, ang = sgn * (Math.PI / 2) * blend.t;
  return { ...f, u: rot(a.u, ang), n: rot(a.n, ang), k1: a.k, k2: b.k, t: blend.t };
}
/** where the worker walks for s (off the face by its path; round the corner on an arc) and his facing */
export function walkerAt(s, lv) {
  const F0 = frameAt(s, lv), o1 = VK.PATH[F0.k1], o2 = VK.PATH[F0.k2], off = o1 + (o2 - o1) * F0.t;
  // (in a corner zone the base point is the corner itself at its middle: the arc keeps him outside the corner)
  let bx = F0.x, bz = F0.z;
  if (F0.t > 0) { const c = Math.round(s / SK.SIDE) * SK.SIDE, cc = faceAt(c), w = 1 - Math.abs(F0.t - 0.5) * 2; bx = F0.x + (cc.x - F0.x) * w * 0.6; bz = F0.z + (cc.z - F0.z) * w * 0.6; }
  return { x: bx + F0.n[0] * off, z: bz + F0.n[1] * off, u: F0.u, n: F0.n, k: F0.k, k1: F0.k1, k2: F0.k2, t: F0.t };
}
/** where the helper walks for the worker's s: ahead of him by HELP_AHEAD, a little further out — past the line's end too (level 1:
 *  on along the north wall; the whole round: on past the south-east corner), never standing still before the worker at the end */
export function helperAt(s, lv) {
  const hs = s + VK.HELP_AHEAD, H = walkerAt(hs, lv), o = VK.HELP_OUT[H.k1] + (VK.HELP_OUT[H.k2] - VK.HELP_OUT[H.k1]) * H.t;
  return { ...H, s: hs, x: H.x + H.n[0] * o, z: H.z + H.n[1] * o };
}
/** the height a man stands at on (x, z): what is really there — the world's ground (the court's floor; the yesod's ledge where it
 *  sticks out: X.ground), never under the floor. The site is clean in this work (the form's walls and sills are on the pile), so no
 *  thing of the stage is stood on: a ray onto the stage's things found stray tops a quarter amah apart and the men jumped an amah */
const FY = { m: new Map(), key: '' };
const FOOT = Object.freeze([[0.3, 0.3], [-0.3, 0.3], [0.3, -0.3], [-0.3, -0.3]]);   // (a foot's corners round his place, amot)
export function footY(X, x, z) {
  // (spec line 218: the walls lie where they fell; he walks on them where they lie and on the floor or the foundation elsewhere — the
  //  height from the lying walls' boards (a ray down under each of his foot's four corners: the highest, so no foot is inside a board),
  //  the court's floor and the yesod; nothing else's top, so no stray top makes him jump)
  if (FY.key !== SH9.key) { FY.m.clear(); FY.key = SH9.key; }
  const key = Math.round(x * 4) + ',' + Math.round(z * 4); let y = FY.m.get(key); if (y != null) return y;
  y = F;
  try { const g = X.ground ? X.ground(x, z) : NaN; if (Number.isFinite(g) && g > y && g < LY - 1) y = g; } catch (e) { /* (the floor) */ }
  try {
    const T = X.THREE; if (!FY.rc) FY.rc = { r: new T.Raycaster(), o: new T.Vector3(), d: new T.Vector3(0, -1, 0) };
    const objs = []; if (SH9.walls) for (const k of Object.keys(SH9.walls)) { const g = SH9.walls[k].grp; if (g && g.visible) objs.push(g); }
    const seen = (o) => { for (let q = o; q; q = q.parent) if (q.visible === false) return false; return true; };
    for (const [dx, dz] of FOOT) {
      FY.rc.o.set(x + dx, LY - 1, z + dz); FY.rc.r.set(FY.rc.o, FY.rc.d); FY.rc.r.far = LY - F;
      const h = FY.rc.r.intersectObjects(objs, true).find((q) => seen(q.object));
      if (h && h.point.y > y) y = h.point.y;
    }
  } catch (e) { /* (the floor) */ }
  FY.m.set(key, y); return y;
}
/** the follow shot at s: [eye], [aim] */
export function camAt(s, lv, wHere) {
  const W = wHere || walkerAt(s, lv), F0 = frameAt(s, lv), wt = (k) => (k === 'W' ? 1 : 0), m = wt(F0.k1) + (wt(F0.k2) - wt(F0.k1)) * F0.t;
  const C = {}; for (const q of Object.keys(VK.CAM)) C[q] = VK.CAM[q] + (VK.CAMW[q] - VK.CAM[q]) * m;
  const eye = [W.x - W.u[0] * C.back + W.n[0] * C.out, F + C.up, W.z - W.u[1] * C.back + W.n[1] * C.out];
  const aim = [W.x + W.u[0] * C.aimF + W.n[0] * C.aimIn, F + C.aimUp, W.z + W.u[1] * C.aimF + W.n[1] * C.aimIn];
  return [eye, aim];
}
/** a corner's measuring shot: outside the corner, the rod, the ladder and the helper in it (derived from cam:w4:measure's height and
 *  distance; the west corners from the north and the south — west of the block are the Ulam's steps) */
export function measureShot(k) { const B0 = S9.cam.w4corner[k]; return [B0[0].slice(), B0[1].slice()]; }   // (the book's: cam:w4:corner)

/* ───────── materials ───────── */
export function smats(X) {
  const P0 = X.props, T = X.THREE;
  if (P0.M.y9sk) return P0.M.y9sk;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, ...o });
  const M = {
    line: new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.6, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, emissive: '#200403' }),
    pole: std('#8C6A43'), poleD: std('#6B4728'), bowl: std('#A9603A', { roughness: 0.9 }), bowlIn: std('#7A1810', { roughness: 0.5, emissive: '#2A0503' }),
    cloth: std('#D9CCB0', { roughness: 1 }),
    str: new T.MeshStandardMaterial({ color: '#5E0E0A', roughness: 0.4, emissive: '#000000' }),
    dot: new T.MeshBasicMaterial({ color: '#1A1714', polygonOffset: true, polygonOffsetFactor: -2 }),
    drip: std('#9C1A12', { roughness: 0.35, emissive: '#300604', polygonOffset: true, polygonOffsetFactor: -4 }),
    pink: std('#E9A7A3', { roughness: 0.8, polygonOffset: true, polygonOffsetFactor: -4 }),
    blot: std('#8A1710', { roughness: 0.5, polygonOffset: true, polygonOffsetFactor: -4 }),
    seam: std('#3A0806', { polygonOffset: true, polygonOffsetFactor: -5 }),
    flash: new T.MeshBasicMaterial({ color: '#FF3A22', transparent: true, opacity: 0, depthWrite: false }),
    rough: std('#EEEAE1', { roughness: 1 }), roughD: std('#C9C2B4', { roughness: 1 }),   // (the block's own white, and its chipped shade)
    stake: std('#6B4728'), rod: std('#9C7046'), notch: std('#2E1E10'),
  };
  P0.M.y9sk = M; return M;
}

/* ───────── the line: a ribbon that grows in place ───────── */
const BANDC = { dark: [0.52, 0.06, 0.04], red: [0.78, 0.13, 0.09], pink: [0.92, 0.66, 0.64] };
export function makeRibbon(X, parent, maxS) {
  const T = X.THREE, N = Math.ceil(maxS / SK.SAMPLE) + 6;
  const pos = new Float32Array(N * 6), col = new Float32Array(N * 6), idx = new Uint32Array((N - 1) * 6);
  for (let i = 0; i < N - 1; i++) { const a = i * 2; idx.set([a, a + 1, a + 2, a + 1, a + 3, a + 2], i * 6); }
  const g = new T.BufferGeometry();
  const pa = new T.BufferAttribute(pos, 3), ca = new T.BufferAttribute(col, 3); pa.setUsage(T.DynamicDrawUsage); ca.setUsage(T.DynamicDrawUsage);
  g.setAttribute('position', pa); g.setAttribute('color', ca); g.setIndex(new T.BufferAttribute(idx, 1)); g.setDrawRange(0, 0);
  g.boundingSphere = new T.Sphere(new T.Vector3(S9.mid[0], LY, S9.mid[1]), S9.side);   // (never recomputed per frame)
  const mesh = new T.Mesh(g, smats(X).line); mesh.name = 'h132-sikra-line'; mesh.frustumCulled = false; mesh.renderOrder = 3; parent.add(mesh);
  const R = { mesh, n: 0, N, lo: N, hi: -1 };
  /** sample i at s: height h (tefachim), band, and whether it is printed (a gap or a seam: not) */
  R.set = (i, s, h, band, on = true) => {
    if (i < 0 || i >= N) return;
    const f = faceAt(s), x = f.x + f.n[0] * VK.OUT, z = f.z + f.n[1] * VK.OUT, y = LY + h * TEF, e = on ? VK.LINE_H : 0, c = BANDC[band] || BANDC.red, o = i * 6;
    pos[o] = x; pos[o + 1] = y + e; pos[o + 2] = z; pos[o + 3] = x; pos[o + 4] = y - e; pos[o + 5] = z;
    col[o] = col[o + 3] = c[0]; col[o + 1] = col[o + 4] = c[1]; col[o + 2] = col[o + 5] = c[2];
    if (i < R.lo) R.lo = i; if (i > R.hi) R.hi = i;
    if (i + 1 > R.n) R.n = i + 1;
  };
  /** a printed stretch taken back (a gap, a seam): its samples flat */
  R.cut = (s0, s1) => { for (let i = Math.max(0, Math.floor(s0 / SK.SAMPLE)); i <= Math.min(R.n - 1, Math.ceil(s1 / SK.SAMPLE)); i++) { const o = i * 6, m = (pos[o + 1] + pos[o + 4]) / 2; pos[o + 1] = pos[o + 4] = m; if (i < R.lo) R.lo = i; if (i > R.hi) R.hi = i; } };
  /** once a step: only the samples written since the last flush go to the card (the ranges add up until the renderer uploads them
   *  and clears them itself: two steps in one frame must not drop the first one's samples — they stayed at the origin) */
  R.flush = () => {
    if (R.hi < R.lo) return;
    const a = R.lo * 6, cnt = (R.hi - R.lo + 1) * 6;
    pa.addUpdateRange(a, cnt); ca.addUpdateRange(a, cnt); pa.needsUpdate = true; ca.needsUpdate = true;
    g.setDrawRange(0, Math.max(0, R.n - 1) * 6); R.lo = N; R.hi = -1;
  };
  R.dispose = () => { parent.remove(mesh); g.dispose(); };
  return R;
}

/* ───────── the line's marks (shared geometry; one small mesh a mark, made when the mark happens) ───────── */
export function makeMarks(X, parent) {
  const T = X.THREE, M = smats(X);
  const G = { drip: new T.BoxGeometry(0.07, 1, 0.03), pink: new T.BoxGeometry(0.16, 0.42, 0.02), blot: new T.CircleGeometry(0.26, 12), smear: new T.BoxGeometry(1.7, 0.42, 0.02), seam: new T.BoxGeometry(0.08, 0.2, 0.03), lump: new T.BoxGeometry(1, 1, 1) };
  const PAINT = [0.9, 0.6, 0.35].map((o) => new T.MeshStandardMaterial({ color: '#A3221A', roughness: 0.5, transparent: true, opacity: o, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
  // (the smear's strokes: [x along the face, x scale, y scale, paint 0..2])
  const SMR = [[-0.55, 1.1, 0.75, 0], [-0.2, 1.5, 0.6, 0], [0.2, 1.6, 0.45, 1], [0.55, 1.4, 0.32, 1], [0.85, 1.1, 0.22, 2]];
  const place = (m, s, dy = 0, out = VK.OUT + 0.012) => { const f = faceAt(s); m.position.set(f.x + f.n[0] * out, LY + dy, f.z + f.n[1] * out); m.rotation.y = Math.atan2(f.n[0], f.n[1]); parent.add(m); return m; };
  return {
    drip(s) { const m = new T.Mesh(G.drip, M.drip); m.scale.y = 0.05; place(m, s, -0.08); m.userData.s = s; return m; },
    grow(m, u) { const L = 0.15 + 0.5 * u; m.scale.y = L; m.position.y = LY - 0.06 - L / 2; },
    pink(s) { return place(new T.Mesh(G.pink, M.pink), s, -0.32); },
    blot(s, off = 0) { return place(new T.Mesh(G.blot, M.blot), s + off, 0); },
    // (a smear of the paint itself: a wiped streak of the line's red, thick where the cloth met the plaster, thinning as it was dragged)
    smear(s) {
      const g = new T.Group(); SMR.forEach(([x, sx, sy, k]) => { const m = new T.Mesh(G.blot, PAINT[k]); m.position.x = x; m.scale.set(sx, sy, 1); g.add(m); });
      return place(g, s, 0);
    },
    seam(s) { return place(new T.Mesh(G.seam, M.seam), s, 0, VK.OUT + 0.02); },
    // (spec line 286: "משטח מחוספס באורך אמה בערך" — a rough, broken patch about one amah long in the block's own white: lumps and chips
    //  standing out of the face, their shading the roughness)
    rough(s0, s1) {
      const g = new T.Group(), L = Math.max(0.9, Math.min(1.2, s1 - s0));
      for (let i = 0; i < 11; i++) {
        const w = 0.14 + ((i * 0.27) % 1) * 0.22, m = new T.Mesh(G.lump, i % 4 === 3 ? M.roughD : M.rough);
        m.scale.set(w, w * (0.7 + ((i * 0.53) % 1) * 0.6), 0.06 + ((i * 0.41) % 1) * 0.1);
        m.position.set(((i * 0.618) % 1 - 0.5) * L, ((i * 0.381 + 0.2) % 1 - 0.5) * 0.7, 0.02); m.rotation.z = (i - 5) * 0.3; g.add(m);
      }
      return place(g, (s0 + s1) / 2, 0, 0.02);
    },
  };
}

/* ───────── the measuring: the rod with six notches (one amah: the line six tefachim under the top), the ladder, a stake ───────── */
export function makeRod(X) {
  const T = X.THREE, M = smats(X), g = new T.Group(); g.name = 'h132-sikra-rod';
  const L = 6 * TEF; // (from the hook at its head down to its lower end: six tefachim)
  const r = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, L, 6), M.rod); r.position.y = -L / 2; r.castShadow = true; g.add(r);
  const hook = new T.Mesh(new T.BoxGeometry(0.34, 0.08, 0.1), M.rod); hook.position.y = 0.02; g.add(hook);
  for (let i = 1; i <= 6; i++) { const n = new T.Mesh(new T.CylinderGeometry(0.075, 0.075, 0.025, 6), M.notch); n.position.y = -i * TEF + 0.012; g.add(n); }
  g.userData.L = L; return g;
}
export function makeLadder(X, len = 6.2) {
  const T = X.THREE, M = smats(X), g = new T.Group(); g.name = 'h132-sikra-ladder';
  for (const sx of [-0.32, 0.32]) { const r = new T.Mesh(new T.BoxGeometry(0.1, len, 0.1), M.pole); r.position.set(sx, len / 2, 0); r.castShadow = true; g.add(r); }
  for (let i = 1; i < 12; i++) { const r = new T.Mesh(new T.BoxGeometry(0.64, 0.07, 0.07), M.poleD); r.position.set(0, (i * len) / 12, 0); g.add(r); }
  g.userData.len = len; return g;
}
/** lean the ladder from its foot (x, z on the floor, or on what lies there: fy) to its head at (hx, hy, hz) */
export function leanLadder(g, x, z, hx, hy, hz, fy = F) {
  const dx = hx - x, dy = hy - fy, dz = hz - z, L = Math.hypot(dx, dy, dz);
  g.position.set(x, fy, z); g.scale.set(1, L / g.userData.len, 1);
  g.rotation.set(0, 0, 0); g.rotation.order = 'YXZ'; g.rotation.y = Math.atan2(dx, dz); g.rotation.x = Math.atan2(Math.hypot(dx, dz), dy);
}
export function makeStake(X) { const T = X.THREE, m = new T.Mesh(new T.CylinderGeometry(0.06, 0.035, 0.45, 6), smats(X).stake); m.castShadow = true; return m; }

/* ───────── the tools: the bow on its pole, the bowl, the swab rod ───────── */
export function makePole(X) {
  const T = X.THREE, M = smats(X), g = new T.Group(); g.name = 'h132-sikra-pole';
  const pole = new T.Mesh(new T.CylinderGeometry(VK.POLE_R, VK.POLE_R * 1.2, 1, 6), M.pole); pole.castShadow = true; g.add(pole);
  const bow = new T.Group(); g.add(bow);
  const arc = new T.Mesh(new T.TorusGeometry(0.42, 0.04, 5, 10, Math.PI), M.poleD); bow.add(arc);   // (the bent stick: the bow)
  const str = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.84, 5), M.str); str.rotation.z = Math.PI / 2; bow.add(str);   // (the thick saturated string)
  const Y = new T.Vector3(0, 1, 0), V = new T.Vector3();
  return {
    g, str,
    /** the pole from base to top ([x, y, z]); the bow at the top across the line (along u), its string on the face */
    set(base, top, u) {
      V.set(top[0] - base[0], top[1] - base[1], top[2] - base[2]); const L = V.length();
      pole.position.set((base[0] + top[0]) / 2, (base[1] + top[1]) / 2, (base[2] + top[2]) / 2); pole.scale.set(1, L, 1); pole.quaternion.setFromUnitVectors(Y, V.normalize());
      bow.position.set(top[0], top[1], top[2]); bow.rotation.set(0, Math.atan2(u[0], u[1]) - Math.PI / 2, 0);
    },
  };
}
export function makeBowl(X) {
  const T = X.THREE, M = smats(X), g = new T.Group(), R = VK.BOWL_R; g.name = 'h132-sikra-bowl';
  const pts = [[0.001, 0], [R * 0.55, 0.02], [R * 0.9, 0.16], [R, 0.34], [R * 0.95, 0.36], [R * 0.82, 0.2], [0.001, 0.08]].map(([a, b]) => new T.Vector2(a, b));
  const b = new T.Mesh(new T.LatheGeometry(pts, 14), M.bowl); b.castShadow = true; g.add(b);
  const ink = new T.Mesh(new T.CircleGeometry(R * 0.85, 14), M.bowlIn); ink.rotation.x = -Math.PI / 2; ink.position.y = 0.27; g.add(ink);
  return g;
}
export function makeSwab(X) {
  const T = X.THREE, M = smats(X), g = new T.Group(); g.name = 'h132-sikra-swab';
  const r = new T.Mesh(new T.CylinderGeometry(0.035, 0.04, 1, 5), M.pole); r.castShadow = true; g.add(r);
  const c = new T.Mesh(new T.SphereGeometry(0.16, 7, 5), M.cloth); c.scale.set(1, 1.3, 1); g.add(c);
  const Y = new T.Vector3(0, 1, 0), V = new T.Vector3();
  return { g, set(a, b) { V.set(b[0] - a[0], b[1] - a[1], b[2] - a[2]); const L = V.length(); r.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); r.scale.set(1, L, 1); r.quaternion.setFromUnitVectors(Y, V.normalize()); c.position.set(b[0], b[1], b[2]); } };
}
/** the charcoal dots of the walls walked (the north's every second), hidden until the helper marks each */
export function makeDots(X, parent, lv) {
  const T = X.THREE, M = smats(X), geo = new T.CircleGeometry(VK.DOT_R, 8), out = [];
  const walls = lv === 1 ? ['E'] : S9.order;
  walls.forEach((k) => { const i0 = S9.order.indexOf(k); K9.dots[k].forEach((p, j) => { if (K9.sparse[k] && !K9.sparse[k].includes(j + 1)) return; const s = i0 * SK.SIDE + (j + 1) * SK.SEG_L, f = faceAt(s - 1e-6), m = new T.Mesh(geo, M.dot); m.position.set(p[0] + f.n[0] * 0.02, LY, p[1] + f.n[1] * 0.02); m.rotation.y = Math.atan2(f.n[0], f.n[1]); m.visible = false; parent.add(m); out.push({ s, m }); }); });
  return out;
}

/* ───────── the sounds (built at the step's opening; nothing metal: the string, wood, clay, a drop) ───────── */
export function voices(sfx) {
  let ctx = null, out = null, noise = null, hum = null;
  const muted = () => { try { return !!(sfx && sfx.muted); } catch (e) { return true; } };
  function init() {
    if (ctx) return true;
    try { ctx = sfx && sfx.context; } catch (e) { ctx = null; }
    if (!ctx) return false;
    out = ctx.createGain(); out.gain.value = 0.85; out.connect(ctx.__bhOut || ctx.destination);
    const n = ctx.sampleRate; noise = ctx.createBuffer(1, n, ctx.sampleRate); const d = noise.getChannelData(0); let s = 4241; for (let i = 0; i < n; i++) { s = (s * 16807) % 2147483647; d[i] = (s / 2147483647) * 2 - 1; }
    return true;
  }
  const ok = () => init() && !muted();
  function tone(f0, f1, dur, peak, type = 'sine', at = 0) { const t = ctx.currentTime + at, o = ctx.createOscillator(), g = ctx.createGain(); o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t + dur); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + 0.05); }
  function burst(f, q, dur, peak, type = 'bandpass') { const t = ctx.currentTime, s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; fl.type = type; fl.frequency.value = f; fl.Q.value = q; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + dur); s.connect(fl); fl.connect(g); g.connect(out); s.start(t); s.stop(t + dur + 0.05); }
  const tn = (o) => tone(o.f0, o.f1, o.d, o.g, o.w || 'sine'), bn = (o) => burst(o.f, o.q, o.d, o.g);
  const SND = {
    knock: [{ f0: 210, f1: 90, d: 0.22, g: 0.16 }, { f: 1100, q: 1.6, d: 0.06, g: 0.06 }],                 // (the wooden mallet on the wooden stake)
    clay: [{ f0: 520, f1: 380, d: 0.16, g: 0.08, w: 'triangle' }, { f: 2400, q: 3, d: 0.05, g: 0.03 }],     // (the swab in the clay bowl)
    drop: [{ f0: 900, f1: 260, d: 0.14, g: 0.09 }],                                                       // (a drop)
    wipe: [null, { f: 1600, q: 0.8, d: 0.22, g: 0.05 }],                                                  // (cloth on stone)
    snap: [{ f0: 300, f1: 70, d: 0.18, g: 0.12, w: 'triangle' }, { f: 700, q: 1, d: 0.12, g: 0.06 }],      // (the string snaps off the stone)
  };
  const play = (k) => { if (!ok()) return; const [a, b] = SND[k]; if (a) tn(a); if (b) bn(b); };
  return {
    init,
    knock: () => play('knock'), clay: () => play('clay'), drop: () => play('drop'), wipe: () => play('wipe'), snap: () => play('snap'),
    pluck(k = 1) { if (!ok()) return; tn({ f0: 196 * k, f1: 190 * k, d: 0.6, g: 0.08, w: 'triangle' }); tn({ f0: 392 * k, f1: 388 * k, d: 0.4, g: 0.03 }); },   // (the string: the corner's chime)
    /** the string brushing the stone while he walks: its loudness the pace */
    hum(k) { if (!init() || !out) return; if (!hum) { const s = ctx.createBufferSource(), fl = ctx.createBiquadFilter(), g = ctx.createGain(); s.buffer = noise; s.loop = true; fl.type = 'bandpass'; fl.frequency.value = 650; fl.Q.value = 1.2; g.gain.value = 0.0001; s.connect(fl); fl.connect(g); g.connect(out); s.start(); hum = { s, g, fl }; } try { hum.g.gain.setTargetAtTime(muted() ? 0.0001 : 0.0001 + 0.035 * Math.max(0, Math.min(1, k)), ctx.currentTime, 0.08); } catch (e) { /* */ } },
    stop() { try { if (hum) { hum.s.stop(); hum = null; } } catch (e) { hum = null; } },
  };
}

/* ───────── the line as it stays (the save: st.sikra.line) ───────── */
/** the line's record: its height each half amah (tefachim ×100) and its band (d r p), the stretches not printed, the marks */
export function lineRecord(L, track) {
  return { v: 1, lv: L.lv, to: +L.s.toFixed(2), hs: track.hs.slice(), ws: track.ws.join(''), cuts: (track.cuts || []).slice(), marks: L.marks.map((m) => ({ ...m })), closed: L.closed || null };
}
const BAND_OF = { d: 'dark', r: 'red', p: 'pink' };
/** the whole line from its record (on reload, after the work, in the ending): one ribbon and its marks */
export function drawRecord(X, rec, parent) {
  if (!rec || rec.v !== 1) return null;
  const T = X.THREE, g = new T.Group(); g.name = 'h132-sikra-kept'; parent.add(g);
  const R = makeRibbon(X, g, Math.max(rec.to || 0, 1) + 1), step = 0.5, n = Math.round((rec.to || 0) / SK.SAMPLE);
  for (let i = 0; i <= n; i++) { const s = i * SK.SAMPLE, j = Math.min(rec.hs.length - 1, Math.floor(s / step)); if (j < 0) break; R.set(i, s, (rec.hs[j] || 0) / 100, BAND_OF[rec.ws[j]] || 'red'); }
  for (const [a, b] of rec.cuts || []) R.cut(a, b);
  R.flush();
  const MK = makeMarks(X, g);
  for (const m of rec.marks || []) {
    const f = String(m.f).replace('sikra.', '');
    if (f === 'drip') MK.grow(MK.drip(m.s), 1); else if (f === 'pink') MK.pink(m.s); else if (f === 'blot') MK.blot(m.s);
    else if (f === 'blot2') { MK.blot(m.s, -0.3); MK.blot(m.s, 0.3); } else if (f === 'smear') MK.smear(m.s); else if (f === 'seam') MK.seam(m.s);
  }
  return g;
}

/* ───────── the lane: the kept line drawn by the world while the block is 'lined' (and the act's own while it plays) ───────── */
export const SK3 = { kept: null, key: '', act: false };
function laneSync(X, M) {
  const st = M && M.st, rec = st && st.sikra && st.sikra.line, lined = M && M.block && M.block() === 'lined';
  const key = SK3.act ? 'act' : lined && rec ? JSON.stringify([rec.to, rec.marks.length, rec.closed, rec.lv]) : '';
  if (key === SK3.key) return; SK3.key = key;
  if (SK3.kept) { SK3.kept.parent && SK3.kept.parent.remove(SK3.kept); SK3.kept = null; }
  if (key && key !== 'act') SK3.kept = drawRecord(X, rec, X.props.root);
}
export const SIKRA_LANE = addLane({
  owns: (k) => k === 'line' && (SK3.act || !!SK3.kept),
  init: (X, M) => laneSync(X, M), sync: (X, M) => laneSync(X, M), rest: (X, M) => { SK3.key = ''; laneSync(X, M); },
});
