/* ── build 129 ── h129/world.js — the things of stage 07 "הלשכות" in the world, drawn from the save on a beat (as h128/world.js). The
 * built world's model (temple.js h129 blocks) gives the shells: the Gazit's room with its floor at 16, the Golah chamber, the
 * instruments chambers' lower storeys and Beit HaMoked's hall; the pieces the stage takes over are sets of their own there
 * (stages.subSet): the wall's parts inside the rooms and Nikanor's solid lower storeys are hidden while this world runs, the Gazit's
 * and the Golah's roofs (and the south wall's piece over each room) until the stage's finish, the model's dome always (this world
 * draws the vault ring by ring and keeps its own), the two small arches until the player has freed them.
 * Drawn here: the holy line's dark stones; the bench as the player left it (a cracked corner where it struck), the mats and the
 * scribes' stands, an ink stain where a man walked through; the Golah's well, wheel, trough, channel and troughs (the crews' while
 * the station is not in play); the timber centering in each instruments chamber until its arch is freed (then the model's stones, a
 * crack, a fallen stone by the wall and its replacement of another shade); the great vault's rings, ring 1 the player's and the rest
 * the crews', built one after another with the centering moved west under each; the marble slab's cracked corner. The crews at work
 * round the three sites while the player is elsewhere. The floors (stages.floorHook) and the rooms open to the left thumb
 * (stages.twinOpen). Every place is the book's (BOOK.s07); every size a size.
 */
import { BOOK } from '../world/grid.js';
import { row0, corners, H129, matSeats } from './model.js';
import { createBeat, createGang, clamp, lerp, ease } from '../h109/kit.js';
import { golahInWorld, golahWorldNow } from './golah3d.js';   // (build 129 G5: the Golah's own things in the world)

const S7 = BOOK.s07, GZ = S7.gazit, GL = S7.golah, V = S7.vault, N7 = S7.night, F16 = S7.floors.azara, F6 = S7.floors.nashim;
const TAU = Math.PI * 2;
export const SH7 = { X: null, B: null, crew: null, M: null, key: {}, own: {}, busy: 0, t: 0, final: 0, men: [], parts: {}, film: null, ringT: 0, subT: 0 };

/* ───────── materials ───────── */
export function mats7(X) {
  const P = X.props, T = X.THREE;
  if (P.M.h7stone) return P.M;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, ...o });
  P.M.h7stone = std('#E6DCC4', { roughness: 0.8 });   // (the bench's dressed stone, the arch's)
  P.M.h7shade = std('#C9B48E', { roughness: 0.85 });   // (a replacement stone of another shade)
  P.M.h7holy = std('#4C4640', { roughness: 0.7 });     // (the holy line's dark stones)
  P.M.h7timber = std('#9C7448', { roughness: 0.82 });
  P.M.h7timberD = std('#7A5634', { roughness: 0.9 });
  P.M.h7reed = std('#C8AE72', { roughness: 0.95 });    // (the mats)
  P.M.h7reedD = std('#A88E58', { roughness: 0.95 });
  P.M.h7dark = new T.MeshBasicMaterial({ color: 0x1E1610 });
  P.M.h7ink = new T.MeshBasicMaterial({ color: 0x14100C, transparent: true, opacity: 0.85, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  P.M.h7crack = new T.MeshBasicMaterial({ color: 0x1A120A, polygonOffset: true, polygonOffsetFactor: -3 });
  P.M.h7light = new T.MeshBasicMaterial({ color: 0xFFF2C0 });
  P.M.h7water = std('#3E6E7C', { roughness: 0.12, metalness: 0.1, flatShading: false });
  P.M.h7cloak = std('#D9CFB8', { roughness: 1 });
  P.M.h7bronze = std('#B88A44', { roughness: 0.4, metalness: 0.7, flatShading: false });
  P.M.h7iron = std('#3A3A3A', { roughness: 0.6, metalness: 0.5 });
  P.M.h7rope = P.M.rope || std('#C9A46A', { roughness: 0.95 });
  return P.M;
}
export const box = (X, mat, x0, y0, z0, x1, y1, z1, parent) => {
  const m = new X.THREE.Mesh(X.props.geo.box, mat); m.scale.set(Math.max(1e-3, Math.abs(x1 - x0)), Math.max(1e-3, Math.abs(y1 - y0)), Math.max(1e-3, Math.abs(z1 - z0)));
  m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = true; m.receiveShadow = true; (parent || X.props.root).add(m); return m;
};
/** a box of size (L along its axis, H, D) centred at (x, y, z), turned a about y (a from +x toward +z) */
export function obox(X, mat, x, y, z, L, H, D, a, parent) {
  const m = new X.THREE.Mesh(X.props.geo.box, mat); m.scale.set(L, H, D); m.position.set(x, y, z); m.rotation.y = -a; m.castShadow = true; m.receiveShadow = true; (parent || X.props.root).add(m); return m;
}

/* ───────── the Gazit: the holy line, the bench, the mats and stands, the stains ───────── */
/** the holy line: dark stones across the room's floor */
export function holyLine(X, parent) {
  const M = mats7(X), g = parent || X.props.root, I = GZ.in, n = Math.round((I[2] - I[0]) / 1.5);
  for (let i = 0; i < n; i++) { const x0 = I[0] + (i * (I[2] - I[0])) / n, x1 = I[0] + ((i + 1) * (I[2] - I[0])) / n; box(X, M.h7holy, x0 + 0.03, F16 - 0.02, GZ.holy - 0.4, x1 - 0.03, F16 + 0.035, GZ.holy + 0.4, g); }
}
/** a bench stone (model stone: x, z, a, L, D) as a mesh: its top at the stone's height; cracked: a chipped corner and a dark crack */
export function benchStone(X, s, o = {}) {
  const M = mats7(X), T = X.THREE, g = new T.Group(), H = GZ.row0.H;
  const st = new T.Mesh(X.props.geo.box, o.mat || M.h7stone); st.scale.set(s.L, H, s.D); st.position.y = H / 2; st.castShadow = true; st.receiveShadow = true; g.add(st);
  // the seat's dressed band along its inner edge (the judges' side) — the eye reads which way it faces
  const band = new T.Mesh(X.props.geo.box, M.h7shade); band.scale.set(s.L - 0.1, 0.06, 0.28); band.position.set(0, H + 0.01, -s.D / 2 + 0.16); g.add(band);
  if (s.crack || o.crack) {
    const c = new T.Mesh(X.props.geo.box, M.h7crack); c.scale.set(0.04, 0.02, s.D * 0.8); c.position.set(s.L / 2 - 0.55, H + 0.012, 0.05); c.rotation.y = 0.5; g.add(c);
    const chip = new T.Mesh(X.props.geo.box, M.h7dark); chip.scale.set(0.3, 0.3, 0.3); chip.position.set(s.L / 2 - 0.12, H - 0.12, s.D / 2 - 0.12); g.add(chip);
  }
  g.position.set(s.x, F16, s.z); g.rotation.y = -s.a; (o.parent || X.props.root).add(g);
  g.userData.set = (q) => { g.position.set(q.x, F16, q.z); g.rotation.y = -q.a; };
  return g;
}
/** a mat (model mat), spread; rolled: a roll by its −axis end */
export function matMesh(X, m, o = {}) {
  const M = mats7(X), T = X.THREE, g = new T.Group();
  if (o.rolled) { const c = new T.Mesh(new T.CylinderGeometry(0.28, 0.28, m.D, 10), M.h7reed); c.rotation.x = Math.PI / 2; c.position.y = 0.28; c.castShadow = true; g.add(c); }
  else {
    const b = new T.Mesh(X.props.geo.box, M.h7reed); b.scale.set(m.L, 0.06, m.D); b.position.y = 0.03; b.receiveShadow = true; g.add(b);
    for (let k = 1; k < Math.round(m.L); k++) { const s2 = new T.Mesh(X.props.geo.box, M.h7reedD); s2.scale.set(0.05, 0.065, m.D); s2.position.set(-m.L / 2 + k, 0.035, 0); g.add(s2); }
  }
  g.position.set(m.x, F16, m.z); g.rotation.y = -m.a; (o.parent || X.props.root).add(g);
  g.userData.set = (q) => { g.position.set(q.x, F16, q.z); g.rotation.y = -q.a; };
  return g;
}
/** a scribe's writing stand (1 × 1): a slanted board on four legs, an ink pot */
export function standMesh(X, s, o = {}) {
  const M = mats7(X), T = X.THREE, g = new T.Group();
  for (const [a, b] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) { const l = new T.Mesh(X.props.geo.box, M.h7timberD); l.scale.set(0.08, 1.1, 0.08); l.position.set(a, 0.55, b); g.add(l); }
  const top = new T.Mesh(X.props.geo.box, M.h7timber); top.scale.set(1, 0.08, 1); top.position.y = 1.15; top.rotation.x = 0.25; top.castShadow = true; g.add(top);
  const pot = new T.Mesh(new T.CylinderGeometry(0.09, 0.1, 0.16, 8), M.h7dark); pot.position.set(0.32, 1.28, -0.3); g.add(pot);
  g.position.set(s.x, F16, s.z); (o.parent || X.props.root).add(g);
  g.userData.set = (q) => g.position.set(q.x, F16, q.z);
  return g;
}
/** an ink stain where it fell */
export function inkStain(X, x, z, parent) {
  const T = X.THREE, M = mats7(X), m = new T.Mesh(new T.CircleGeometry(0.42, 14), M.h7ink); m.rotation.x = -Math.PI / 2; m.position.set(x, F16 + 0.05, z); (parent || X.props.root).add(m);
  const m2 = new T.Mesh(new T.CircleGeometry(0.2, 10), M.h7ink); m2.rotation.x = -Math.PI / 2; m2.position.set(x + 0.45, F16 + 0.051, z - 0.2); (parent || X.props.root).add(m2);
  return m;
}
/** the Gazit's default mats and stands for a bench (gazit2's opening: rolled by the door) */
export function gazitLayout(st) {
  const stones = (st.gazit && st.gazit.stones) || row0().map((s) => ({ i: s.i, x: s.x, z: s.z, a: s.a, L: s.L, D: s.D, crack: 0 }));
  return { stones, mats: (st.gazit && st.gazit.mats) || null, stands: (st.gazit && st.gazit.stands) || null };
}

/* ───────── the arches ───────── */
/** a small arch's timber centering under its opening: a half disc of boards on two posts, its wedges on the floor posts */
export function centering(X, k, o = {}) {
  const M = mats7(X), T = X.THREE, A = V[k], g = new T.Group(), zc = A.at[1], r0 = A.crown - A.spring, xF = A.at[0];
  const sh = new T.Shape(); sh.moveTo(-r0, 0); sh.absarc(0, 0, r0 - 0.04, Math.PI, 0, true); sh.lineTo(r0, -0.35); sh.lineTo(-r0, -0.35); sh.lineTo(-r0, 0);
  const geo = new T.ExtrudeGeometry(sh, { depth: 0.8, bevelEnabled: false, curveSegments: 18 }); geo.rotateY(Math.PI / 2);
  const c = new T.Mesh(geo, M.h7timber); c.position.set(xF - 0.9, A.spring, zc); c.castShadow = true; g.add(c); g.userData.c = c;
  for (const s of [-1, 1]) { const p = box(X, M.h7timberD, xF - 0.8, A.floor, zc + s * (r0 - 0.6) - 0.15, xF - 0.2, A.spring - 0.75, zc + s * (r0 - 0.6) + 0.15, g); void p; }
  (o.parent || X.props.root).add(g); return g;
}
/** the great vault's ring i (1 …): its stones between R and R + 1 round the axis, x from the east end westward */
export function ringGeos(X, i, o = {}) {
  const T = X.THREE, A = V.M, n = A.stones, x1 = A.east - A.ringD * (i - 1), x0 = x1 - A.ringD + 0.05, out = [], R0 = A.R, R1 = A.R + 1, gap = o.gap != null ? o.gap : 0.035;
  for (let j = 0; j < n; j++) {
    const a0 = Math.PI - (j / n) * Math.PI - gap / R0, a1 = Math.PI - ((j + 1) / n) * Math.PI + gap / R0, sh = new T.Shape(), Q = 3;
    for (let q = 0; q <= Q; q++) { const a = a0 + (a1 - a0) * q / Q; const p = [-(A.axisZ + R1 * Math.cos(a)), A.spring + R1 * Math.sin(a)]; if (q) sh.lineTo(...p); else sh.moveTo(...p); }
    for (let q = Q; q >= 0; q--) { const a = a0 + (a1 - a0) * q / Q; sh.lineTo(-(A.axisZ + R0 * Math.cos(a)), A.spring + R0 * Math.sin(a)); }
    const g = new T.ExtrudeGeometry(sh, { depth: x1 - x0, bevelEnabled: false, curveSegments: 1 }); g.rotateY(Math.PI / 2); g.translate(x0, 0, 0); out.push(g);
  }
  return out;
}

/* ───────── the Golah (the crews' while the station is not in play: part 3 plays it) ───────── */
function golahBuild(X, S, g) {
  const M = mats7(X), T = X.THREE, w = GL.well, R = GL.shaftR;
  // the shaft's lining down to the water (the first level's depth: the crews' water stands there) and the rim of stones
  const sh = new T.Mesh(new T.CylinderGeometry(R, R, GL.depth[0], 20, 1, true), M.h7holy); sh.material.side = T.DoubleSide; sh.position.set(w[0], F16 - GL.depth[0] / 2, w[1]); g.add(sh);
  const wat = new T.Mesh(new T.CircleGeometry(R - 0.05, 20), M.h7water); wat.rotation.x = -Math.PI / 2; wat.position.set(w[0], F16 - GL.depth[0] + 0.3, w[1]); g.add(wat);
  for (let i = 0; i < 12; i++) { const a = ((i + 0.5) / 12) * TAU, br = (S.rimBroken || []).includes(i); obox(X, br ? M.h7shade : M.h7stone, w[0] + Math.cos(a) * (R + GL.rimT / 2), F16 + (br ? GL.rimH * 0.45 : GL.rimH) / 2, w[1] + Math.sin(a) * (R + GL.rimT / 2), (TAU * (R + GL.rimT / 2)) / 12 - 0.05, br ? GL.rimH * 0.45 : GL.rimH, GL.rimT, -a + Math.PI / 2, g); }   // (part 3: a broken stone, golah.rim, lower and dark where it broke)
  // the wheel's frame (two posts and a cap either side of the shaft, along x), its axle and wheel; the two ropes
  const W = GL.wheel, ay = F16 + W.axle;
  for (const s of [-1, 1]) { box(X, M.h7timberD, W.at[0] + s * W.post - 0.2, F16, W.at[1] - 0.2, W.at[0] + s * W.post + 0.2, ay + 0.4, W.at[1] + 0.2, g); }
  box(X, M.h7timber, W.at[0] - W.post - 0.3, ay + 0.4, W.at[1] - 0.25, W.at[0] + W.post + 0.3, ay + 0.75, W.at[1] + 0.25, g);
  const ax = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 2 * W.post, 8), M.h7timberD); ax.rotation.z = Math.PI / 2; ax.position.set(W.at[0], ay, W.at[1]); g.add(ax);
  const wh = new T.Mesh(new T.TorusGeometry(W.R, 0.12, 6, 20), M.h7timber); wh.position.set(W.at[0], ay, W.at[1]); wh.rotation.y = Math.PI / 2; g.add(wh);
  for (const s of [-1, 1]) { const r = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, W.axle + 1.5, 5), M.h7rope); r.position.set(W.at[0], ay - (W.axle + 1.5) / 2, W.at[1] + s * H129.ROPE_OFF); g.add(r); }
  // (part 3) the two buckets as the last trip left them: one up by the rim on its line, one down in the water; a cracked one dark-streaked
  if (S.gl) for (const i of [0, 1]) {
    const z = W.at[1] + (i ? 1 : -1) * H129.ROPE_OFF, y = i ? F16 + GL.rimH + 0.35 : F16 - GL.depth[0] - 0.2, b = new T.Mesh(new T.CylinderGeometry(H129.BUCKET_R, H129.BUCKET_R * 0.8, 0.8, 12), M.h7timber);
    b.position.set(W.at[0], y + 0.4, z); g.add(b);
    if ((S.bCracked || []).includes(i)) { const c = new T.Mesh(X.props.geo.box, M.h7crack); c.scale.set(0.05, 0.6, 0.04); c.position.set(W.at[0] + 0.15, y + 0.4, z + (i ? 1 : -1) * H129.BUCKET_R * 0.95); c.rotation.z = 0.4; g.add(c); }
  }
  // the head trough and the channel to the three troughs; the water in each as the crews left it
  const hs = GL.headSize; box(X, M.h7stone, GL.head[0] - hs[0] / 2, F16, GL.head[1] - hs[1] / 2, GL.head[0] + hs[0] / 2, F16 + hs[2], GL.head[1] + hs[1] / 2, g);
  const cw = GL.channel.w, seg = (a, b) => box(X, M.h7dark, Math.min(a[0], b[0]) - cw / 2, F16 + 0.005, Math.min(a[1], b[1]) - cw / 2, Math.max(a[0], b[0]) + cw / 2, F16 + 0.02, Math.max(a[1], b[1]) + cw / 2, g);
  const C = GL.channel.main; for (let i = 0; i + 1 < C.length; i++) seg(C[i], C[i + 1]);
  for (const [x, z0, z1] of GL.channel.spurs) seg([x, z0], [x, z1]);
  const ts = GL.troughSize;
  for (const k of Object.keys(GL.troughs)) {
    const t = GL.troughs[k], used = S.troughs && S.troughs[k] != null; if (!used) continue;
    const x0 = t[0] - ts[0] / 2, x1 = t[0] + ts[0] / 2, z0 = t[1] - ts[1] / 2, z1 = t[1] + ts[1] / 2, h = ts[2];
    box(X, M.h7stone, x0, F16, z0, x1, F16 + h, z0 + 0.2, g); box(X, M.h7stone, x0, F16, z1 - 0.2, x1, F16 + h, z1, g); box(X, M.h7stone, x0, F16, z0, x0 + 0.2, F16 + h, z1, g); box(X, M.h7stone, x1 - 0.2, F16, z0, x1, F16 + h, z1, g);
    box(X, M.h7stone, x0, F16, z0, x1, F16 + 0.15, z1, g);
    const f = clamp(S.troughs[k], 0, 1); if (f > 0.02) { const wm = new T.Mesh(X.props.geo.box, M.h7water); wm.scale.set(ts[0] - 0.4, 0.04, ts[1] - 0.4); wm.position.set(t[0], F16 + 0.15 + (h - 0.25) * f, t[1]); g.add(wm); }
  }
  for (const k of S.puddles || []) { const t = GL.troughs[k]; if (t) { const p = new T.Mesh(new T.CircleGeometry(1.4, 16), M.h7water); p.scale.set(1, 0.62, 1); p.rotation.x = -Math.PI / 2; p.position.set(t[0] + GL.puddle[0], F16 + 0.02, t[1] + GL.puddle[1]); g.add(p); } }   // (part 3: where the play's puddle lies, the book's)
}

/* ───────── the world from the save ───────── */
function stateOf(X) {
  const M = X.M, st = M.st, d = (id) => M.isDone(id), mk = (f, w) => st.marks.filter((q) => q.f === f && (!w || q.work === w));
  const L = gazitLayout(st);
  const glDone = d('golah1') || d('golah2') || d('golah3');
  const tr = {}; if (glDone) for (const k of ['A', 'B', 'C']) { const v = st.golah && st.golah.troughs && st.golah.troughs[k]; if (v != null) tr[k] = v; else if (st.golahCrews) tr[k] = 1; }
  const vM = d('vaultM'), rings = vM ? clamp(1 + Math.floor((st.vault.ringsT || 0) / RING_T), 1, V.M.rings) : 0;
  return {
    g1: d('gazit1'), g2: d('gazit2'), g3: d('gazit3'), L, cracks: mk('gazit.crack').map((q) => q.n), inks: mk('gazit.ink').map((q) => q.at),
    gl: glDone, glDepth: GL.depth[d('golah3') ? 2 : d('golah2') ? 1 : 0], troughs: tr, puddles: mk('golah.flood').map((q) => q.n), rimBroken: mk('golah.rim').map((q) => q.n), bCracked: mk('golah.bucket').map((q) => q.n),
    vN: d('vaultN'), vS: d('vaultS'), vM, rings, vcrack: { N: mk('vault.crack', 'vaultN').length, S: mk('vault.crack', 'vaultS').length, M: mk('vault.crack', 'vaultM').length },
    vstone: { N: mk('vault.stone', 'vaultN').length, S: mk('vault.stone', 'vaultS').length, M: mk('vault.stone', 'vaultM').length },
    night: d('night'), slab: mk('night.slab').length, fin: M.finished(),
  };
}
export const RING_T = 4;   // (the crews build one ring of the great vault in this many seconds of the world's time)
const keyOf = (S) => JSON.stringify([S.g1, S.g2, S.g3, S.L, S.cracks, S.inks, S.gl, S.troughs, S.puddles, S.rimBroken, S.bCracked, S.vN, S.vS, S.vM, S.rings, S.vcrack, S.vstone, S.night, S.slab, S.fin, SH7.final, SH7.own]);
export function rebuild(X, force) {
  const S = stateOf(X); SH7.state = S;
  const k = keyOf(S); if (!force && k === SH7.key.all) return;
  SH7.key.all = k;
  for (const o of Object.values(SH7.parts)) if (o) X.props.remove(o); SH7.parts = {};
  const T = X.THREE, P = SH7.parts, M = mats7(X), own = SH7.own;
  const grp = (n) => { const g = new T.Group(); g.name = 'h129-' + n; X.props.root.add(g); P[n] = g; return g; };
  // the Gazit
  { const g = grp('gazit'); holyLine(X, g);
    if (!own.bench) S.L.stones.forEach((s, i) => benchStone(X, { ...s, crack: S.cracks.includes(i) || s.crack }, { parent: g }));
    if (!own.mats && S.g2 && S.L.mats) for (const m of S.L.mats) matMesh(X, m, { parent: g });
    if (!own.mats && S.g2 && S.L.stands) for (const s of S.L.stands) standMesh(X, s, { parent: g });
    for (const a of S.inks) if (a) inkStain(X, a[0], a[1], g);
  }
  // the Golah (the crews' version until part 3 plays it; once a work of it is his, the play's own things as the save leaves them —
  // golah3d in the world: the well, the wheel, the channel and the troughs cut in the floor, their water, each mark)
  if (!own.golah) {
    const G = S.gl ? golahInWorld(X) : golahWorldNow();
    if (S.gl && G) { G.scene.visible = true; try { G.play.still({ tr: S.troughs, rim: S.rimBroken, cracked: S.bCracked, puddles: S.puddles, depth: S.glDepth }); } catch (e) { console.warn('[h129] golah still', e && e.message); } }
    else { if (G) G.scene.visible = false; golahBuild(X, S, grp('golah')); }
  }
  // the instruments chambers: the centering until the arch is freed; then the model's stones, a crack, a fallen stone and its shade
  for (const kk of ['N', 'S']) {
    const done = kk === 'N' ? S.vN : S.vS;
    try { X.stages.subSet('lishka:arch' + kk, done && !own['v' + kk]); } catch (e) { /* */ }
    if (own['v' + kk]) continue;
    const g = grp('v' + kk), A = V[kk];
    if (!done) { centering(X, kk, { parent: g }); continue; }
    if (S.vcrack[kk]) crackLine(X, A.at[0] + 0.02, A.crown + 0.5, A.at[1] + 0.4, g);
    if (S.vstone[kk]) fallen(X, A.at[0] - 1.4, A.floor, A.at[1] + (A.z[1] - A.at[1]) + 0.2, g, kk === 'N' ? 1 : -1);
  }
  // the great vault: its rings as built (ring 1 the player's, the rest the crews'); the centering under the next ring; the damage
  if (!own.vM) {
    const g = grp('vM'), A = V.M;
    for (let i = 1; i <= S.rings; i++) { const geos = ringGeos(X, i); geos.forEach((ge, j) => { const m = new T.Mesh(ge, i === 1 && S.vstone.M && j === 3 ? M.h7shade : M.h7stone); m.castShadow = true; m.receiveShadow = true; g.add(m); }); }
    if (S.rings < A.rings) ringCentering(X, S.rings ? S.rings + 1 : 1, g);
    if (S.vcrack.M) crackLine(X, A.east - 1.5, A.spring + A.R - 0.05, A.axisZ + 2, g, true);
    if (S.vstone.M) fallen(X, A.east - 3, A.floor, A.legs[0][1] + 1.2, g, 1);
  }
  // the marble slab's cracked corner
  if (S.slab && !own.slab) { const s = N7.slab, h = N7.slabSize / 2; const c = box(X, M.h7crack, s[0] + h - 0.4, s[2] + 0.045, s[1] + h - 0.3, s[0] + h - 0.02, s[2] + 0.06, s[1] + h - 0.27); c.rotation.y = 0.6; P.slab = c; }
  menSync(X, S);
  subSync(X, true);
}
/** a crack: a dark jagged line (on a vault's soffit when up: it lies along the barrel) */
export function crackLine(X, x, y, z, parent, up) {
  const M = mats7(X), T = X.THREE, g = new T.Group();
  const pts = [[0, 0], [0.3, 0.12], [0.55, -0.05], [0.9, 0.1], [1.2, -0.02]];
  for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]); const m = new T.Mesh(X.props.geo.box, M.h7crack); m.scale.set(up ? L : 0.06, up ? 0.04 : L, up ? 0.06 : 0.06); m.position.set(up ? (a[0] + b[0]) / 2 : 0, up ? 0 : (a[0] + b[0]) / 2, (a[1] + b[1]) / 2); m.rotation.set(up ? 0 : Math.atan2(b[1] - a[1], b[0] - a[0]), up ? -Math.atan2(b[1] - a[1], b[0] - a[0]) : 0, 0); g.add(m); }
  g.position.set(x, y, z); (parent || X.props.root).add(g); return g;
}
/** a fallen arch stone broken on the floor by the wall */
export function fallen(X, x, y, z, parent, s = 1) {
  const M = mats7(X), g = new X.THREE.Group();
  obox(X, M.h7stone, 0, 0.3, 0, 0.9, 0.6, 0.7, 0.4, g); obox(X, M.h7stone, 0.7 * s, 0.2, 0.5, 0.5, 0.4, 0.4, 1.1, g); obox(X, M.h7stone, -0.5, 0.12, 0.6, 0.3, 0.24, 0.3, 2, g);
  g.position.set(x, y, z); (parent || X.props.root).add(g); return g;
}
/** the great vault's centering under ring i: a half ring of timber on posts from the floor, the deck at its foot */
export function ringCentering(X, i, parent) {
  const M = mats7(X), T = X.THREE, A = V.M, g = new T.Group(), x1 = A.east - A.ringD * (i - 1), x0 = x1 - A.ringD;
  const sh = new T.Shape(); sh.absarc(0, 0, A.R - 0.05, Math.PI, 0, true); sh.lineTo(A.R - 0.05, -0.5); sh.lineTo(-(A.R - 0.05), -0.5); sh.lineTo(-(A.R - 0.05), 0);
  const hole = new T.Path(); hole.absarc(0, -0.1, A.R - 1.3, 0, Math.PI, false); sh.holes.push(hole);
  for (const xo of [0.4, A.ringD - 0.8]) { const ge = new T.ExtrudeGeometry(sh, { depth: 0.4, bevelEnabled: false, curveSegments: 20 }); ge.rotateY(Math.PI / 2); const m = new T.Mesh(ge, M.h7timber); m.position.set(x0 + xo, A.spring, A.axisZ); m.castShadow = true; g.add(m); }
  box(X, M.h7timber, x0, S7.vault.deck.y - 0.25, A.axisZ - A.R + 1, x1, S7.vault.deck.y, A.axisZ + A.R - 1, g);   // the deck
  for (const zz of [-0.7, -0.3, 0.3, 0.7]) box(X, M.h7timberD, x0 + 1.2, A.floor, A.axisZ + zz * A.R - 0.2, x0 + 1.6, S7.vault.deck.y - 0.25, A.axisZ + zz * A.R + 0.2, g);
  (parent || X.props.root).add(g); return g;
}

/* ───────── the sets the stage takes over in the model (stages.subSet) ───────── */
const ALWAYS_OFF = ['wall:gz', 'wall:gl', 'wall:vN', 'wall:vS', 'nikanor:vN', 'nikanor:vS', 'lishka:dome'];
const ROOFS = ['lishka:gzroof', 'lishka:glroof', 'wall:gzt', 'wall:glt'];
function subSync(X, force) {
  const S0 = X.stages; SH7.subT -= 1;
  if (!force && SH7.subT > 0) return;
  SH7.subT = 6;
  try { const info = S0.siteInfo ? S0.siteInfo('lishka') : null; if (!info || info.status !== 'done') S0.setStage('lishka', 'done', 1, { instant: true }); } catch (e) { /* */ }
  if (!S0.subSet) return;
  for (const k of ALWAYS_OFF) S0.subSet(k, false);
  const roofs = !!(SH7.final || (SH7.state && SH7.state.fin)) && !SH7.open;
  for (const k of ROOFS) S0.subSet(k, roofs);
}
/** the rooms open to the sky while the finale looks in (the night's last pictures) */
export function roofsOpen(X, v) { SH7.open = !!v; subSync(X, true); }

/* ───────── the floors as they stand (stages.floorHook) and the rooms open to the left thumb (stages.twinOpen) ───────── */
const inR = (r, x, z) => x >= r[0] && x <= r[2] && z >= r[1] && z <= r[3];
const ROOMS = () => {
  const I = GZ.in, B = GZ.block, dn = GZ.doorN, W = GL.room, A = V.N.block, Bs = V.S.block, H = V.M.hall;
  return {
    gzIn: I, gzOut: B, gzDoor: [dn[0] - GZ.doorNW / 2, B[1] - 0.6, dn[0] + GZ.doorNW / 2, I[1] + 0.1],
    glIn: [W[0] + 1, W[1] + 1, W[2] - 1, W[3] - 1], glOut: W, glDoor: [GL.door[0] - GL.doorW / 2, W[1] - 0.6, GL.door[0] + GL.doorW / 2, W[1] + 1.1],
    vN: [A[0] + 1, A[1] + 1, A[2] - 1, A[3] - 1], vNo: A, vNdoor: [A[2] - 1.1, V.N.z[0], A[2] + 0.6, V.N.z[1]],
    vS: [Bs[0] + 1, Bs[1] + 1, Bs[2] - 1, Bs[3] - 1], vSo: Bs, vSdoor: [Bs[2] - 1.1, V.S.z[0], Bs[2] + 0.6, V.S.z[1]],
    mk: H, mkOut: [H[0] - 1, H[1] - 1, H[2] + 1, H[3] + 1], mkDoor: [N7.door.azara[0] - 2, H[3] - 0.1, N7.door.azara[0] + 2, H[3] + 1.6],
  };
};
function floorAt(x, z) {
  const R = ROOMS(), top = GZ.row0.H;
  if (inR(R.gzOut, x, z)) {
    if (inR(R.gzIn, x, z) || inR(R.gzDoor, x, z)) return F16;
    return S7.golah.top;   // (the walls)
  }
  if (inR(R.glOut, x, z)) {
    if (inR(R.glIn, x, z) || inR(R.glDoor, x, z)) { const w = GL.well; return Math.hypot(x - w[0], z - w[1]) < GL.shaftR + GL.rimT ? F16 + GL.rimH : F16; }
    return S7.golah.top;
  }
  for (const k of ['N', 'S']) { const A = V[k]; if (inR(R['v' + k + 'o'], x, z)) return inR(R['v' + k], x, z) || inR(R['v' + k + 'door'], x, z) ? A.floor : A.top; }
  if (inR(R.mkOut, x, z)) return inR(R.mk, x, z) || inR(R.mkDoor, x, z) ? V.M.floor : V.M.spring;
  void top; return null;
}
function openRooms(X) {
  const R = ROOMS();
  try { if (X.stages.twinOpen) X.stages.twinOpen([R.gzOut, R.glOut, R.mkOut, R.vNo, R.vSo]); } catch (e) { /* */ }
}

/* ───────── the crews (never idle: masons dress stones, carriers bring water, the vault's crews on its deck) ───────── */
function menSync(X, S) {
  const key = [S.g1, S.g3, S.vN, S.vS, S.vM, S.rings >= V.M.rings, S.night, SH7.busy].join('');
  if (SH7.key.men === key) return; SH7.key.men = key;
  for (const w of SH7.men) SH7.crew.remove(w); SH7.men = [];
  if (SH7.busy || S.night) return;
  const add = (x, z, o) => { const w = SH7.crew.add(x, z, o); if (w) SH7.men.push(w); return w; };
  // the Gazit: two masons dress a bench stone outside its north door, in the Azarah (until the court is seated)
  if (!S.g3) { const d = GZ.doorN; add(d[0] - 3, d[1] - 4, { role: 'hammer', item: 'chisel', fx: d[0] - 1.6, fz: d[1] - 4, crew: 1 }); add(d[0] + 3, d[1] - 4, { role: 'hammer', item: 'mallet', fx: d[0] + 1.6, fz: d[1] - 4, crew: 1 }); }
  // the instruments chambers: a man trims the centering's wedges before each opening
  for (const k of ['N', 'S']) if (!(k === 'N' ? S.vN : S.vS)) { const A = V[k]; add(A.at[0] + 3, A.at[1] + (k === 'N' ? -4.5 : 4.5), { role: 'hammer', item: 'mallet', fx: A.at[0] + 1.5, fz: A.at[1] + (k === 'N' ? -4.5 : 4.5), crew: 2 }); }
  // Beit HaMoked: masons on the hall's floor until ring 1 is freed; then on the deck while the crews build the rings
  { const A = V.M, h = A.hall; if (!S.vM) { add(h[2] - 5, A.axisZ - 6, { role: 'hammer', item: 'chisel', fx: h[2] - 5, fz: A.axisZ - 4.5, crew: 3 }); add(h[2] - 8, A.axisZ + 6, { role: 'hammer', item: 'mallet', fx: h[2] - 8, fz: A.axisZ + 4.5, crew: 3 }); } }
  // the Golah: a carrier brings a jar from the head trough to the first trough (the crews' water)
  if (S.gl) add(GL.head[0] + 1.5, GL.head[1] - 2, { role: 'carry', item: 'jar', from: [GL.head[0] + 1.5, GL.door[1] - 2], to: [GL.troughs.A[0] + 2.2, GL.troughs.A[1] + 1.2], crew: 2 });
}

export function initWorld(X) {
  mats7(X);
  SH7.X = X; SH7.M = X.M; SH7.B = createBeat(X); SH7.crew = createGang(X); SH7.key = {}; SH7.own = {}; SH7.busy = 0; SH7.men = []; SH7.open = false;
  try { window.__H129_SH7 = SH7; } catch (e) { /* (the probes' eyes) */ }
  try { const A = X.actors && X.actors(); if (A && A.setInstantVis) A.setInstantVis(true); } catch (e) { /* */ }
  try { if (X.stages.floorHook) X.stages.floorHook(floorAt); } catch (e) { /* */ }
  openRooms(X);
  if (X.M.finished()) SH7.final = 1;
  rebuild(X, true);
}
export function finalWorld(X) { if (!SH7.X) initWorld(X); SH7.final = 1; rebuild(X, true); }
/** an act takes a thing out of the world's hands while it plays it: 'bench', 'mats', 'vN', 'vS', 'vM', 'slab', 'golah' */
export function own(k, v) { if (v) SH7.own[k] = v; else delete SH7.own[k]; }
let jT = 0, hookT = 0;
export function frameWorld(dt, X) {
  if (SH7.film) { try { SH7.film.frame(dt); } catch (e) { console.warn('[h129] film frame', e && e.message); } }
  if (!SH7.B) return;
  SH7.t += dt; SH7.B.step(dt); if (SH7.crew) SH7.crew.update(dt, SH7.B);
  // (the crews build the great vault's rings after ring 1, one every RING_T seconds of the world's time)
  const st = X.M && X.M.st; if (st && X.M.isDone('vaultM') && (st.vault.ringsT || 0) < RING_T * V.M.rings) { st.vault.ringsT = (st.vault.ringsT || 0) + dt; }
  jT -= dt; if (jT <= 0) { jT = 0.5; try { rebuild(X); subSync(X); } catch (e) { console.warn('[h129] world', e && e.message); } }
  hookT -= dt; if (hookT <= 0) { hookT = 2; try { if (X.stages.floorHook) X.stages.floorHook(floorAt); openRooms(X); } catch (e) { /* */ } }
}
export function setBusy(X, v) { SH7.busy = v ? 1 : 0; try { menSync(X, SH7.state || stateOf(X)); } catch (e) { /* */ } }
/** the vault whole at once (the night opens on a finished vault) */
export function vaultWhole(X) { const st = X.M.st; st.vault.ringsT = RING_T * V.M.rings; rebuild(X, true); }
export { floorAt, clamp, lerp, ease, TAU, matSeats, corners };
