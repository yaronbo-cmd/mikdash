// actors.js — the people of the service: kohanim, the Kohen Gadol, Levites and pilgrims, and the things they carry.
// Same GPU rig as animals.js: one InstancedMesh per kind of dress (one draw call each, drawn only when someone of that
// kind is in view) and ONE InstancedMesh for every held item (the item is chosen per instance in the vertex shader).
//
// Dress (sources; where they are silent the choice is ours and marked "illustration"):
// · kohen — the four white linen garments (Yoma 7:5; Rambam Klei HaMikdash 8:1–2): ketonet to the feet, michnasayim
//   (hidden), avnet of shesh, techelet, argaman and tola'at shani wound at elbow height with its ends hanging
//   (Rambam, Klei HaMikdash 8:1, 8:19 — three fingers wide, 32 amot, "כרך על גבי כרך"; the height "כנגד אצילי ידיו" is 10:1 and Zevachim 19a; ends hanging in front: illustration), migba'at; barefoot.
// · gadol — the eight garments (Yoma 7:5): + me'il of techelet with gold bells and pomegranates of techelet, argaman
//   and tola'at shani at its hem (72 bells, Zevachim 88b (R. Dosa for R. Yehuda: 36); a pomegranate between two bells (Exodus 28:33–34); Rambam, Klei HaMikdash ch. 9), the ephod worn behind with its belt and
//   shoulder straps and the two shoham stones, the choshen with twelve stones in four rows (stone colours:
//   illustration — the identifications differ), mitznefet, and the tzitz: a plain gold plate from ear to ear tied with
//   techelet, with NO legible writing (it carried the Name; PROJECT.md §2.3). Hair shows between tzitz and mitznefet
//   (Zevachim 19a).
// · gadol-white — his four white garments of Yom Kippur (Yoma 3:6, 7:4): all linen, a white avnet.
// · levite — plain robe and sash (their dress is not described: illustration), instruments kinor, nevel, tziltzal
//   (Arachin 2:3–6; Tamid 7:3).
// · pilgrim / woman — tunic and mantle with tzitzit (Num 15:38), head cloth or veil; barefoot on the Temple Mount
//   (Berakhot 9:5 "לא יכנס להר הבית ... במנעלו").
// Items: machta mizrak kaf bazach teni kuz flask limb salt log lamb oil trumpet bread torch cage kinor nevel cymbals
// staff rope. "limb" is a neutral, non-anatomical portion on a small tray (PROJECT.md §2.9).
// 1 unit = 1 amah; every model faces +z; no per-frame allocations.
import * as THREE from 'three';
import { rigPart, rigMaterial, rigMesh, rigWrite, rigEnd, merge, sph, cyl, rod, box, tube, lathe, lambStatic } from './animals.js';

const P = rigPart;
export const ACTOR_S = 1.1;          // a touch over life size, for a phone screen
/* ───────────────────────── the human rig ─────────────────────────
   bones 0 robe below the waist · 1 torso · 2 head · 3 left arm · 4 right arm · 5 left foot · 6 right foot
   iA = (walk phase, walk amount, bow, kneel) · iB = (left arm raise, left arm spread, right raise, right spread)
   iC = (head yaw, head pitch, skin shade, sway) */
const HIP = [0, 1.5, 0], NECK = [0, 2.72, 0], SHL = [0.42, 2.5, 0], SHR = [-0.42, 2.5, 0], FTL = [0.16, 1.2, 0], FTR = [-0.16, 1.2, 0];
const HANDL = [0.5, 1.6, 0.06], HANDR = [-0.5, 1.6, 0.06];
const v3 = (a) => `vec3(${a.map((v) => v.toFixed(3)).join(',')})`;
const HUMAN_POSE = `
  void rigPose(out mat3 R, out vec3 T){
    int b = int(aBone + 0.5);
    float ph = iA.x, wk = iA.y, bw = iA.z, kn = iA.w, bl = 0.0;
    if (kn > 1.5) { kn -= 2.0; bl = 1.0; }                 // ── people7 ── iA.w + 2 = a young face: no beard
    R = mat3(1.0); T = vec3(0.0);
    if (b == 0) {
      float sq = 1.0 - kn * 0.52;
      R = rY(sin(ph) * 0.05 * wk) * mat3(1.0, 0.0, 0.0, 0.0, sq, 0.0, 0.0, 0.0, 1.0);
      T = vec3(0.0, 0.0, kn * 0.12);
      // ── people6 ── (PEOPLE, wave 6) the hem moves: it swings with the stride and trails a little behind a walker, sways
      // with the body's weight shifts when he stands, and ripples in soft folds round the hem (more toward the hem)
      float hk = clamp((1.45 - position.y) / 1.3, 0.0, 1.0); hk *= hk;
      float ang = atan(position.z, position.x);
      T += vec3(sin(ph) * 0.07 * wk + iC.w * 2.2, 0.0, -0.06 * wk + cos(ph * 2.0) * 0.025 * wk) * hk;
      T.xz += normalize(position.xz + vec2(1e-4)) * sin(ang * 7.0 + ph * 1.5) * 0.018 * hk * (0.4 + wk);
      // ── end people6 ──
      return;
    }
    if (b >= 5) {
      float s = b == 5 ? 1.0 : -1.0;
      about(rX(sin(ph) * 0.42 * wk * s), b == 5 ? ${v3(FTL)} : ${v3(FTR)}, R, T);
      T += vec3(0.0, kn * 0.05, -kn * 0.45);
      T.y += max(0.0, sin(ph) * s) * 0.09 * wk;           // ── people6 ── the foot lifts as it swings forward
      return;
    }
    mat3 Ru; vec3 Tu;
    about(rX(bw) * rZ(sin(ph) * 0.035 * wk + iC.w), ${v3(HIP)}, Ru, Tu);
    Tu += vec3(0.0, -kn * 0.78, kn * 0.1);
    if (b == 1) { R = Ru; T = Tu; return; }
    mat3 Rl; vec3 Tl;
    if (b == 2) about(rY(iC.x) * rX(iC.y), ${v3(NECK)}, Rl, Tl);
    else if (b == 3) about(rZ(iB.y) * rX(-iB.x), ${v3(SHL)}, Rl, Tl);
    else about(rZ(-iB.w) * rX(-iB.z), ${v3(SHR)}, Rl, Tl);
    R = Ru * Rl; T = Ru * Tl + Tu;
    // ── people7 ── the beard (aBone 2.25) folds away into the head on a young face
    if (b == 2 && bl > 0.5 && fract(aBone) > 0.1) { T += R * vec3(0.0, 2.9, 0.0) * 0.99; R *= 0.01; }
  }`;

/* ───────────────────────── dress ───────────────────────── */
const WHITE = '#F7F4EC', WHITE2 = '#ECE7DA', SKIN = '#D9A57C', EYE = '#1E1510', LIPS = '#B9786A';
const TECHELET = '#2C5CA6', ARGAMAN = '#7A2D6C', SHANI = '#B8222C', GOLD = '#E3B64E';
const skin = { tint: 3, rough: 0.7 };
// (all source references in this file are drafting aids for the content agent to verify — PROJECT.md §2.1)
function head(parts, { beard = true, hair = true, woman = false } = {}) {
  parts.push(P(cyl(0.1, 0.1, 0.22, [0, 2.62, 0], 8), SKIN, 1, skin));
  parts.push(P(sph(0.27, [0, 2.98, 0.02], [0.95, 1.04, 1], 14, 10), SKIN, 2, skin));
  parts.push(P(sph(0.05, [0, 2.95, 0.29], [0.8, 1, 0.9], 6, 5), SKIN, 2, skin));
  // ── people6 ── eyes with whites (they read on a phone), the pupils a touch in front
  for (const s of [1, -1]) {
    parts.push(P(sph(0.058, [0.098 * s, 3.02, 0.243], [1, 0.85, 0.45], 7, 5), '#F2EEE6', 2, { rough: 0.3 }));
    parts.push(P(sph(0.034, [0.094 * s, 3.015, 0.262], [1, 1.2, 0.7], 6, 5), EYE, 2, { rough: 0.15 }));
  }
  parts.push(P(sph(0.06, [0.26, 2.98, 0], [0.5, 1, 0.8], 6, 4), SKIN, 2, skin), P(sph(0.06, [-0.26, 2.98, 0], [0.5, 1, 0.8], 6, 4), SKIN, 2, skin));
  if (hair) parts.push(P(sph(0.272, [0, 3.0, -0.05], [1.0, 0.98, 0.98], 12, 8), '#FFFFFF', 2, { tint: 2, rough: 0.9 }));
  if (beard) {
    // a full rounded beard round the jaw, and a moustache
    // (bone 2.25: the head's, marked as beard — a young face folds it away, HUMAN_POSE)
    parts.push(P(new THREE.SphereGeometry(0.25, 12, 6, 0, Math.PI * 2, Math.PI * 0.45, Math.PI * 0.55).scale(0.98, 1.2, 0.95).translate(0, 2.96, 0.05), '#FFFFFF', 2.25, { tint: 2, rough: 0.95 }));
    parts.push(P(sph(0.1, [0, 2.9, 0.25], [1.4, 0.45, 0.6], 8, 4), '#FFFFFF', 2.25, { tint: 2, rough: 0.95 }));
  } else if (woman) parts.push(P(sph(0.03, [0, 2.87, 0.26], [1.6, 0.6, 0.6], 6, 4), LIPS, 2));
}
function arms(parts, sleeve, { tint = 0, cuff = null } = {}) {
  for (const [s, b] of [[1, 3], [-1, 4]]) {
    parts.push(P(rod([0.42 * s, 2.54, 0], [0.49 * s, 1.72, 0.04], 0.125, 0.105, 8), sleeve, b, { tint, rough: 0.9 }));
    parts.push(P(sph(0.13, [0.42 * s, 2.5, 0], [1, 0.9, 1], 8, 6), sleeve, b, { tint, rough: 0.9 }));
    if (cuff) parts.push(P(cyl(0.11, 0.11, 0.05, [0.49 * s, 1.7, 0.04], 8), cuff, b));
    parts.push(P(sph(0.105, [0.5 * s, 1.6, 0.06], [0.9, 1.1, 1], 8, 6), SKIN, b, skin));
  }
}
function feet(parts, { sandals = false } = {}) {
  for (const [s, b] of [[1, 5], [-1, 6]]) {
    parts.push(P(sph(0.1, [0.16 * s, 0.07, 0.12], [0.9, 0.62, 1.6], 8, 5), SKIN, b, skin));
    if (sandals) parts.push(P(box(0.2, 0.03, 0.36, [0.16 * s, 0.015, 0.12]), '#5A4029', b));
  }
}
const SKIRT = [[0.001, 0.15], [0.5, 0.16], [0.49, 0.4], [0.45, 0.85], [0.41, 1.25], [0.38, 1.6], [0.001, 1.62]];
const TORSO = [[0.001, 1.45], [0.38, 1.47], [0.37, 1.75], [0.4, 2.1], [0.43, 2.35], [0.38, 2.52], [0.2, 2.64], [0.1, 2.7], [0.001, 2.71]];
const grow = (prof, d, y0 = 0) => prof.map(([r, y]) => [r > 0.01 ? r + d : r, y < y0 ? y0 : y]);
function avnet(parts, colours) {
  // the sash wound round the chest at elbow height, and its ends hanging in front (left)
  let y = 1.98;
  const bands = colours || [[WHITE2, 0.03], [TECHELET, 0.05], [WHITE2, 0.02], [ARGAMAN, 0.05], [WHITE2, 0.02], [SHANI, 0.05], [WHITE2, 0.03]];
  for (const [c, h] of bands) { parts.push(P(cyl(0.405 + (y - 1.98) * 0.1, 0.41 + (y - 1.98) * 0.1, h, [0, y, 0], 16), c, 1, { rough: 0.8 })); y += h; }
  const ends = colours ? [colours[1][0], colours[3][0], colours[5][0]] : [TECHELET, ARGAMAN, SHANI];
  ends.forEach((c, k) => parts.push(P(box(0.05, 0.85, 0.025, [0.12 + k * 0.05, 1.62, 0.43], [-0.07, 0, 0]), c, 1, { rough: 0.8 })));
}
function migbaat(parts) {
  parts.push(P(lathe([[0.24, 2.98], [0.3, 3.04], [0.325, 3.15], [0.315, 3.28], [0.265, 3.42], [0.16, 3.52], [0.001, 3.555]], 16), WHITE, 2, { rough: 0.85 }));
  for (const [y, r] of [[3.1, 0.318], [3.22, 0.32], [3.34, 0.295]]) parts.push(P(new THREE.TorusGeometry(r, 0.022, 5, 18).rotateX(Math.PI / 2).translate(0, y, 0), WHITE2, 2, { rough: 0.85 }));
}
function mitznefet(parts, y0 = 3.08) {
  parts.push(P(lathe([[0.25, y0], [0.33, y0 + 0.05], [0.36, y0 + 0.15], [0.345, y0 + 0.28], [0.29, y0 + 0.37], [0.15, y0 + 0.42], [0.001, y0 + 0.44]], 18), WHITE, 2, { rough: 0.85 }));
  for (const [dy, r, t] of [[0.1, 0.35, 0.12], [0.2, 0.356, -0.1], [0.3, 0.325, 0.08]]) parts.push(P(new THREE.TorusGeometry(r, 0.026, 5, 20).rotateX(Math.PI / 2 + t).translate(0, y0 + dy, 0), WHITE2, 2, { rough: 0.85 }));
}

function kohenDress({ gadol = false, white = false } = {}) {
  const parts = [];
  parts.push(P(lathe(SKIRT, 16), WHITE, 0, { rough: 0.9 }));
  if (!gadol || white) parts.push(P(lathe(TORSO, 16), WHITE, 1, { rough: 0.9 }));
  head(parts);
  arms(parts, WHITE);
  feet(parts);
  if (!gadol) { avnet(parts); migbaat(parts); return parts; }
  if (white) { avnet(parts, [[WHITE2, 0.03], [WHITE, 0.05], [WHITE2, 0.02], [WHITE, 0.05], [WHITE2, 0.02], [WHITE, 0.05], [WHITE2, 0.03]]); mitznefet(parts, 3.0); return parts; }
  // me'il of techelet over the ketonet (no sleeves: the ketonet's show)
  parts.push(P(lathe(grow([[0.001, 0.33], [0.5, 0.34], [0.49, 0.5], [0.45, 0.85], [0.41, 1.25], [0.38, 1.6], [0.001, 1.62]], 0.03), 18), TECHELET, 0, { rough: 0.75 }));
  parts.push(P(lathe(grow(TORSO, 0.015), 18), TECHELET, 1, { rough: 0.75 }));
  parts.push(P(new THREE.TorusGeometry(0.165, 0.03, 5, 16).rotateX(Math.PI / 2).translate(0, 2.64, 0), '#24477F', 1));
  // bells of gold and pomegranates at the hem, alternating, 72 bells (Zevachim 88b); the pomegranates between them
  const pomC = [TECHELET, ARGAMAN, SHANI];
  for (let k = 0; k < 144; k++) {
    const a = k / 144 * Math.PI * 2, x = Math.sin(a) * 0.55, z = Math.cos(a) * 0.55;
    if (k % 2) parts.push(P(sph(0.03, [x, 0.3, z], [1, 1.15, 1], 5, 4), GOLD, 0, { metal: 1, rough: 0.3 }));
    else parts.push(P(sph(0.034, [x, 0.3, z], [1, 1.1, 1], 5, 4), pomC[(k / 2) % 3], 0, { rough: 0.7 }));
  }
  // the ephod behind: gold and the four threads, from the waist to the heels; its belt; the shoulder straps
  const ephodFn = (x, y, z, c) => { const a = Math.atan2(x, z), k = ((Math.floor((a + Math.PI) * 9) % 6) + 6) % 6; c.set([GOLD, TECHELET, GOLD, ARGAMAN, GOLD, SHANI][k]); return k % 2 ? 0.1 : 0.85; };
  parts.push(P(lathe([[0.575, 0.4], [0.53, 0.9], [0.49, 1.3], [0.455, 1.62]], 14, Math.PI * 0.62, Math.PI * 0.76), GOLD, 0, { rough: 0.45, fn: ephodFn }));
  parts.push(P(cyl(0.44, 0.43, 0.14, [0, 1.5, 0], 18), GOLD, 1, { rough: 0.4, fn: (x, y, z, c) => { const k = Math.floor(y * 50) % 3; c.set([GOLD, TECHELET, SHANI][(k + 3) % 3]); return k === 0 ? 0.9 : 0.1; } }));
  for (const s of [1, -1]) {
    parts.push(P(tube([[s * 0.2, 1.62, -0.42], [s * 0.25, 2.3, -0.42], [s * 0.285, 2.6, -0.1], [s * 0.28, 2.58, 0.18], [s * 0.21, 2.4, 0.41]], 0.045, 0.045, 12, 5), GOLD, 1, { metal: 0.85, rough: 0.35 }));
    parts.push(P(sph(0.075, [s * 0.285, 2.66, 0.02], [1, 0.55, 1.1], 8, 5), '#1F3A33', 1, { rough: 0.12, emit: 0.05 }));
    parts.push(P(new THREE.TorusGeometry(0.08, 0.018, 4, 12).rotateX(Math.PI / 2).translate(s * 0.285, 2.655, 0.02), GOLD, 1, { metal: 1, rough: 0.3 }));
  }
  // the choshen: a gold-set square with twelve stones in four rows of three; gold chains up, techelet cords down
  parts.push(P(box(0.46, 0.48, 0.04, [0, 2.2, 0.45], [-0.08, 0, 0]), GOLD, 1, { metal: 0.9, rough: 0.3 }));
  const STONES = ['#B3261E', '#C9C24A', '#1E8A4E', '#3AA3A0', '#2B4FB8', '#E8E4DC', '#E07A2A', '#8C8C86', '#7B3FA0', '#D8B93A', '#16261F', '#4F8A3C'];
  STONES.forEach((c, i) => {
    const row = Math.floor(i / 3), col = i % 3;
    parts.push(P(box(0.105, 0.085, 0.04, [(1 - col) * 0.135, 2.37 - row * 0.112, 0.48 - row * 0.009], [-0.08, 0, 0]), c, 1, { rough: 0.12, emit: 0.18 }));
  });
  for (const s of [1, -1]) {
    parts.push(P(tube([[s * 0.2, 2.43, 0.47], [s * 0.26, 2.56, 0.3], [s * 0.285, 2.64, 0.09]], 0.014, 0.014, 6, 4), GOLD, 1, { metal: 1, rough: 0.3 }));
    parts.push(P(tube([[s * 0.2, 1.97, 0.46], [s * 0.23, 1.8, 0.45], [s * 0.26, 1.6, 0.44]], 0.012, 0.012, 6, 4), TECHELET, 1));
  }
  mitznefet(parts, 3.17);
  // the tzitz: a plain gold plate on the forehead, ear to ear, tied behind with techelet — no writing
  parts.push(P(new THREE.CylinderGeometry(0.266, 0.266, 0.07, 18, 1, true, -1.15, 2.3).translate(0, 3.1, 0.02), GOLD, 2, { metal: 1, rough: 0.22, emit: 0.06 }));
  parts.push(P(new THREE.CylinderGeometry(0.262, 0.262, 0.022, 14, 1, true, 1.15, Math.PI * 2 - 2.3).translate(0, 3.1, 0.0), TECHELET, 2));
  return parts;
}
function leviteDress() {
  const parts = [];
  parts.push(P(lathe(SKIRT, 14), '#FFFFFF', 0, { tint: 1, rough: 0.95 }));
  parts.push(P(lathe(TORSO, 14), '#FFFFFF', 1, { tint: 1, rough: 0.95 }));
  parts.push(P(cyl(0.4, 0.4, 0.12, [0, 1.62, 0], 14), '#6A4A2C', 1, { rough: 0.9 }));
  parts.push(P(box(0.07, 0.6, 0.02, [0.16, 1.32, 0.42], [-0.08, 0, 0]), '#6A4A2C', 1));
  head(parts);
  parts.push(P(new THREE.SphereGeometry(0.29, 14, 6, 0, Math.PI * 2, 0, Math.PI * 0.42).translate(0, 2.98, 0.0), '#E7DCC4', 2, { rough: 0.9 }));
  parts.push(P(new THREE.TorusGeometry(0.265, 0.035, 5, 16).rotateX(Math.PI / 2).translate(0, 3.12, 0), '#8A6A44', 2));
  arms(parts, '#FFFFFF', { tint: 1 });
  feet(parts);
  return parts;
}
function pilgrimDress({ woman = false } = {}) {
  const parts = [];
  const skirt = woman ? [[0.001, 0.12], [0.54, 0.13], [0.52, 0.4], [0.47, 0.85], [0.41, 1.25], [0.37, 1.6], [0.001, 1.62]] : [[0.001, 0.45], [0.47, 0.46], [0.45, 0.85], [0.41, 1.25], [0.38, 1.6], [0.001, 1.62]];
  parts.push(P(lathe(skirt, 14), '#FFFFFF', 0, { tint: 1, rough: 0.95 }));
  parts.push(P(lathe(TORSO, 14), '#FFFFFF', 1, { tint: 1, rough: 0.95 }));
  if (!woman) {
    // bare shins under a knee-length tunic; a rope belt
    for (const s of [1, -1]) parts.push(P(rod([0.16 * s, 0.48, 0], [0.16 * s, 0.1, 0.04], 0.075, 0.065, 6), SKIN, s > 0 ? 5 : 6, skin));
    parts.push(P(new THREE.TorusGeometry(0.39, 0.03, 5, 16).rotateX(Math.PI / 2).translate(0, 1.66, 0), '#8C6B45', 1));
  }
  // the mantle over shoulders and back, open in front; tzitzit at its corners (a blue thread among the white)
  const open = woman ? 0.5 : 0.62;
  parts.push(P(lathe([[0.001, 2.62], [0.24, 2.64], [0.45, 2.5], [0.48, 2.2], [0.47, 1.7], [0.49, 1.2], [0.52, woman ? 0.5 : 0.95]], 14, open, Math.PI * 2 - open * 2), '#FFFFFF', 1, { tint: 2, rough: 0.95 }));
  for (const a of [open + 0.02, -open - 0.02]) {
    const x = Math.sin(a) * 0.53, z = Math.cos(a) * 0.53, y = woman ? 0.5 : 0.95;
    for (let k = 0; k < 4; k++) parts.push(P(cyl(0.012, 0.012, 0.28, [x + (k - 1.5) * 0.018, y - 0.28, z], 3), k === 1 ? TECHELET : '#F3EFE6', 1));
  }
  if (woman) {
    head(parts, { beard: false, hair: false, woman: true });
    // a veil over the head and shoulders
    parts.push(P(new THREE.SphereGeometry(0.31, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.62).scale(1, 1.05, 1.02).translate(0, 2.99, -0.02), '#FFFFFF', 2, { tint: 2, rough: 0.95 }));
    parts.push(P(lathe([[0.3, 2.99], [0.33, 2.8], [0.4, 2.6], [0.47, 2.45]], 14, 0.9, Math.PI * 2 - 1.8), '#FFFFFF', 1, { tint: 2, rough: 0.95 }));
  } else {
    head(parts, { hair: false });
    parts.push(P(new THREE.SphereGeometry(0.295, 14, 7, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(1, 0.95, 1).translate(0, 2.99, -0.01), '#E8DFCC', 2, { rough: 0.95 }));
    parts.push(P(lathe([[0.29, 3.0], [0.3, 2.85], [0.33, 2.7]], 12, 1.2, Math.PI * 2 - 2.4), '#E8DFCC', 2, { rough: 0.95 }));
    parts.push(P(new THREE.TorusGeometry(0.29, 0.03, 5, 16).rotateX(Math.PI / 2).translate(0, 3.05, 0), '#6B4E33', 2));
  }
  arms(parts, '#FFFFFF', { tint: 1 });
  feet(parts);
  // (beard colour for pilgrims: iCol2 is the mantle, so their beards take the fixed hair tint below)
  for (const g of parts) { const t = g.attributes.aTint.array, c = g.attributes.color.array; for (let i = 0; i < t.length; i++) if (t[i] === 2 && Math.round(g.attributes.aBone.array[i]) === 2 && !woman) { t[i] = 0; c[i * 3] = 0.09; c[i * 3 + 1] = 0.06; c[i * 3 + 2] = 0.04; } }
  return parts;
}
export const DRESS = {
  kohen: () => kohenDress(), gadol: () => kohenDress({ gadol: true }), 'gadol-white': () => kohenDress({ gadol: true, white: true }),
  levite: leviteDress, pilgrim: () => pilgrimDress(), woman: () => pilgrimDress({ woman: true }),
};

/* ───────────────────────── items ─────────────────────────
   Authored in the body frame (+z forward) with the grip at the origin. Bone 1 = contents (shown when iA.z > 0.5),
   bone 2 = flame (flickers). hold: two (both hands, in front) · R (right hand) · shoulder · arms (cradled) · blow ·
   lyre · harp · cymbals · staff */
const SILVER = '#D6D9DE';
const MET = { metal: 1, rough: 0.28 };
const ITEM_DEF = {
  // ── yk ── (World agent, wave 3) the Kohen Gadol's vessels on Yom Kippur. "בכל יום היה חותה בשל כסף ומערה בשל זהב, והיום
  // חותה בשל זהב ובה היה מכניס ... בכל יום היתה כבדה, והיום קלה; בכל יום היתה ידה קצרה, והיום ארוכה" (Yoma 4:4): a light gold
  // machta with a long handle. "נטל את המחתה בימינו ואת הכף בשמאלו" (Yoma 5:1): ykKetoret = the machta in the right hand and
  // the kaf (full of ketoret) in the left. goral: the two gold lots (Yoma 3:9, Ben Gamla made them of gold); kalpi: the urn
  // the lots were drawn from (its form: illustration). Contents (bone 1) = the coals, shown when fill > 0.5.
  machtaGold: { hold: 'R', build: () => [
    P(box(0.36, 0.035, 0.32, [0, 0.0, 0.86]), GOLD, 0, MET), P(box(0.38, 0.08, 0.025, [0, 0.04, 0.7]), GOLD, 0, MET), P(box(0.38, 0.08, 0.025, [0, 0.04, 1.02]), GOLD, 0, MET),
    P(box(0.025, 0.08, 0.32, [0.18, 0.04, 0.86]), GOLD, 0, MET), P(box(0.025, 0.08, 0.32, [-0.18, 0.04, 0.86]), GOLD, 0, MET),
    P(rod([0, 0.02, -0.08], [0, 0.03, 0.7], 0.022), GOLD, 0, MET), P(sph(0.035, [0, 0.02, -0.08], [1, 1, 1], 6, 4), GOLD, 0, MET),
    ...[[0.07, 0.9], [-0.08, 0.83], [0.02, 0.95], [-0.04, 0.9], [0.09, 0.8]].map(([x, z]) => P(sph(0.06, [x, 0.06, z], [1, 0.7, 1], 6, 4), '#FF7A2A', 1, { emit: 1.6, rough: 0.9 }))] },
  ykKetoret: { hold: 'two', y: -0.05, build: () => [
    // the machta, in the right hand (the actor's right is −x), its pan held forward
    P(box(0.32, 0.035, 0.3, [-0.5, 0.0, 0.5]), GOLD, 0, MET), P(box(0.34, 0.07, 0.022, [-0.5, 0.035, 0.35]), GOLD, 0, MET), P(box(0.34, 0.07, 0.022, [-0.5, 0.035, 0.65]), GOLD, 0, MET),
    P(box(0.022, 0.07, 0.3, [-0.34, 0.035, 0.5]), GOLD, 0, MET), P(box(0.022, 0.07, 0.3, [-0.66, 0.035, 0.5]), GOLD, 0, MET),
    P(rod([-0.5, 0.02, -0.02], [-0.5, 0.03, 0.35], 0.02), GOLD, 0, MET),
    ...[[-0.44, 0.52], [-0.56, 0.47], [-0.5, 0.58]].map(([x, z]) => P(sph(0.055, [x, 0.05, z], [1, 0.7, 1], 6, 4), '#FF7A2A', 1, { emit: 1.6, rough: 0.9 })),
    // the kaf, in the left hand: a gold vessel with its cover (Tamid 5:4 "וכסוי היה לו")
    P(lathe([[0.001, 0], [0.13, 0], [0.16, 0.04], [0.17, 0.17], [0.155, 0.18], [0.001, 0.05]], 14).translate(0.5, -0.05, 0.12), GOLD, 0, MET),
    P(new THREE.SphereGeometry(0.16, 12, 5, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(1, 0.5, 1).translate(0.5, 0.13, 0.12), GOLD, 0, MET)] },
  goral: { hold: 'two', build: () => [0.46, -0.46].map((x) => P(box(0.12, 0.2, 0.02, [x, 0.12, 0.06]), GOLD, 0, { metal: 1, rough: 0.25, emit: 0.05 })) },
  goral1: { hold: 'R', build: () => [P(box(0.2, 0.03, 0.3, [0, 0.015, 0]), GOLD, 0, { metal: 1, rough: 0.25, emit: 0.05 })] },   // one lot, set on a goat's head
  kalpi: { hold: 'two', build: () => [
    P(lathe([[0.001, 0], [0.26, 0], [0.3, 0.08], [0.32, 0.5], [0.27, 0.62], [0.2, 0.66], [0.22, 0.7], [0.001, 0.7]], 16), '#9A6E45', 0, { rough: 0.7 }),
    P(new THREE.TorusGeometry(0.31, 0.02, 5, 18).rotateX(Math.PI / 2).translate(0, 0.46, 0), '#7A5536', 0, { rough: 0.7 }),
    P(new THREE.TorusGeometry(0.3, 0.02, 5, 18).rotateX(Math.PI / 2).translate(0, 0.12, 0), '#7A5536', 0, { rough: 0.7 })] },
  // ── end yk ──
  mizrak: { hold: 'two', y: 0.05, build: () => [
    P(lathe([[0.0, -0.14], [0.1, -0.07], [0.21, 0.03], [0.26, 0.13], [0.245, 0.145], [0.19, 0.06], [0.08, -0.03], [0.0, -0.07]], 16), SILVER, 0, MET),
    P(new THREE.CircleGeometry(0.19, 14).rotateX(-Math.PI / 2).translate(0, 0.055, 0), '#4E0D10', 1, { rough: 0.35 })] },
  machta: { hold: 'R', build: () => [
    P(box(0.44, 0.05, 0.4, [0, 0.0, 0.62]), SILVER, 0, MET), P(box(0.46, 0.1, 0.03, [0, 0.05, 0.43]), SILVER, 0, MET), P(box(0.46, 0.1, 0.03, [0, 0.05, 0.81]), SILVER, 0, MET),
    P(box(0.03, 0.1, 0.4, [0.22, 0.05, 0.62]), SILVER, 0, MET), P(box(0.03, 0.1, 0.4, [-0.22, 0.05, 0.62]), SILVER, 0, MET),
    P(rod([0, 0.02, -0.05], [0, 0.03, 0.44], 0.03), SILVER, 0, MET),
    ...[[0.08, 0.66], [-0.1, 0.58], [0.02, 0.72], [-0.05, 0.68], [0.1, 0.55]].map(([x, z]) => P(sph(0.07, [x, 0.07, z], [1, 0.7, 1], 6, 4), '#FF7A2A', 1, { emit: 1.6, rough: 0.9 }))] },
  kaf: { hold: 'two', build: () => [
    P(lathe([[0.001, 0], [0.2, 0], [0.24, 0.06], [0.26, 0.26], [0.24, 0.27], [0.21, 0.08], [0.001, 0.06]], 16), GOLD, 0, MET),
    P(lathe([[0.001, 0.08], [0.15, 0.1], [0.17, 0.28], [0.001, 0.28]], 14), GOLD, 0, MET),
    P(new THREE.SphereGeometry(0.17, 14, 6, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(1, 0.55, 1).translate(0, 0.28, 0), GOLD, 0, MET),
    P(box(0.28, 0.02, 0.28, [0, 0.37, 0], [0, 0.4, 0]), '#E9E2D0', 0, { rough: 0.9 })] },
  bazach: { hold: 'two', build: () => [
    P(lathe([[0.001, 0], [0.16, 0.01], [0.21, 0.1], [0.2, 0.11], [0.001, 0.05]], 16), SILVER, 0, MET),
    P(new THREE.SphereGeometry(0.2, 14, 6, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(1, 0.5, 1).translate(0, 0.1, 0), SILVER, 0, MET),
    P(sph(0.035, [0, 0.21, 0], [1, 1, 1], 6, 4), SILVER, 0, MET)] },
  teni: { hold: 'two', build: () => [
    P(lathe([[0.001, 0], [0.18, 0], [0.24, 0.16], [0.27, 0.2], [0.25, 0.21], [0.21, 0.05], [0.001, 0.04]], 16), GOLD, 0, MET),
    P(new THREE.TorusGeometry(0.24, 0.018, 5, 14, Math.PI).translate(0, 0.2, 0), GOLD, 0, MET)] },
  kuz: { hold: 'R', y: -0.1, build: () => [
    P(lathe([[0.001, -0.25], [0.12, -0.24], [0.16, -0.1], [0.14, 0.08], [0.07, 0.16], [0.08, 0.22], [0.001, 0.2]], 14), GOLD, 0, MET),
    P(new THREE.ConeGeometry(0.035, 0.18, 6).rotateX(Math.PI / 2 + 0.6).translate(0, 0.14, 0.14), GOLD, 0, MET),
    P(new THREE.TorusGeometry(0.09, 0.018, 4, 10, Math.PI).rotateY(Math.PI / 2).translate(0, 0.0, -0.13), GOLD, 0, MET)] },
  flask: { hold: 'R', y: -0.05, build: () => [
    P(sph(0.13, [0, -0.08, 0], [1, 1.05, 1], 12, 8), GOLD, 0, MET), P(cyl(0.04, 0.035, 0.16, [0, 0.03, 0], 8), GOLD, 0, MET), P(new THREE.TorusGeometry(0.045, 0.012, 4, 10).rotateX(Math.PI / 2).translate(0, 0.19, 0), GOLD, 0, MET)] },
  oil: { hold: 'R', y: -0.05, build: () => [
    P(lathe([[0.001, -0.18], [0.09, -0.17], [0.1, 0.02], [0.04, 0.08], [0.045, 0.14], [0.001, 0.14]], 10), GOLD, 0, MET), P(cyl(0.03, 0.03, 0.06, [0, 0.14, 0], 6), '#8C6A43', 0)] },
  salt: { hold: 'two', build: () => [
    P(lathe([[0.001, -0.02], [0.2, -0.01], [0.26, 0.1], [0.24, 0.11], [0.001, 0.05]], 14), '#A77C4F', 0, { rough: 0.9 }),
    P(new THREE.SphereGeometry(0.23, 14, 6, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(1, 0.5, 1).translate(0, 0.08, 0), '#F7F6F2', 0, { rough: 0.55, emit: 0.08 })] },
  log: { hold: 'shoulder', build: () => [
    P(new THREE.CylinderGeometry(0.15, 0.17, 1.6, 8).rotateZ(Math.PI / 2), '#7A5B3E', 0, { rough: 1 }),
    P(new THREE.CylinderGeometry(0.13, 0.13, 0.02, 8).rotateZ(Math.PI / 2).translate(0.8, 0, 0), '#D6B587', 0), P(new THREE.CylinderGeometry(0.15, 0.15, 0.02, 8).rotateZ(Math.PI / 2).translate(-0.8, 0, 0), '#D6B587', 0)] },
  limb: { hold: 'two', build: () => [
    P(lathe([[0.001, -0.02], [0.27, -0.015], [0.3, 0.02], [0.28, 0.025], [0.001, 0.0]], 16), SILVER, 0, MET),
    P(sph(0.17, [0, 0.1, 0], [1.35, 0.62, 0.95], 10, 7), '#D9BFA6', 0, { rough: 0.7 }),
    P(new THREE.SphereGeometry(0.175, 10, 4, 0, Math.PI * 2, 0, Math.PI * 0.32).scale(1.36, 0.64, 0.96).translate(0, 0.105, 0), '#FBFAF6', 1, { rough: 0.5, emit: 0.12 })] },
  // the two silver bowls at the south-west horn for the libations (Sukkah 4:9); contents: the wine
  bowl: { hold: 'R', build: () => [
    P(lathe([[0.001, 0], [0.12, 0.005], [0.17, 0.09], [0.16, 0.1], [0.11, 0.02], [0.001, 0.02]], 12), SILVER, 0, MET),
    P(new THREE.CircleGeometry(0.13, 12).rotateX(-Math.PI / 2).translate(0, 0.07, 0), '#5B1424', 1, { rough: 0.2 })] },
  bread: { hold: 'two', y: 0.02, build: () => {
    // the showbread as "an open box" (Menachot 94b; the other view: "a rocking ship"), with its horns
    const C = '#C98C4E', o = { rough: 0.8 };
    return [P(box(1.1, 0.07, 0.55, [0, 0.0, 0]), C, 0, o), P(box(1.1, 0.26, 0.07, [0, 0.12, 0.25]), C, 0, o), P(box(1.1, 0.26, 0.07, [0, 0.12, -0.25]), C, 0, o),
      ...[[0.52, 0.25], [-0.52, 0.25], [0.52, -0.25], [-0.52, -0.25]].map(([x, z]) => P(sph(0.07, [x, 0.3, z], [1, 1.4, 1], 6, 4), '#B8783E', 0, o))];
  } },
  trumpet: { hold: 'blow', build: () => [
    P(cyl(0.028, 0.028, 1.0, [0, 0, 0], 8).rotateX(Math.PI / 2), SILVER, 0, MET),
    P(lathe([[0.028, 0], [0.05, 0.08], [0.1, 0.16], [0.15, 0.2]], 12).rotateX(Math.PI / 2).translate(0, 0, 0.98), SILVER, 0, MET),
    P(new THREE.TorusGeometry(0.035, 0.012, 4, 10).translate(0, 0, 0.35), SILVER, 0, MET), P(new THREE.TorusGeometry(0.035, 0.012, 4, 10).translate(0, 0, 0.65), SILVER, 0, MET)] },
  torch: { hold: 'R', build: () => [
    P(rod([0, -0.2, 0], [0, 0.75, 0.1], 0.04, 0.05, 6), '#6E4F32', 0), P(sph(0.09, [0, 0.8, 0.1], [1, 1.3, 1], 8, 6), '#3A2A20', 0),
    P(sph(0.12, [0, 0.95, 0.1], [0.8, 1.6, 0.8], 8, 6), '#FFB54A', 2, { emit: 2.2, rough: 1 })] },
  cage: { hold: 'two', y: -0.18, build: () => [
    P(cyl(0.3, 0.3, 0.05, [0, 0, 0], 12), '#B98F52', 0, { rough: 0.95 }),
    ...Array.from({ length: 8 }, (_, k) => { const a = k / 8 * Math.PI * 2; return P(cyl(0.018, 0.018, 0.34, [Math.cos(a) * 0.28, 0, Math.sin(a) * 0.28], 3), '#A87E45', 0); }),
    P(new THREE.SphereGeometry(0.3, 12, 5, 0, Math.PI * 2, 0, Math.PI * 0.5).scale(1, 0.45, 1).translate(0, 0.34, 0), '#C49A5C', 0, { rough: 1 }),
    P(new THREE.TorusGeometry(0.16, 0.02, 4, 10, Math.PI).translate(0, 0.46, 0), '#A87E45', 0)] },
  kinor: { hold: 'lyre', build: () => {
    const W = '#9C6B3E';
    return [P(box(0.42, 0.26, 0.1, [0, 0, 0]), W, 0, { rough: 0.6 }),
      P(tube([[0.17, 0.1, 0], [0.24, 0.4, 0], [0.2, 0.7, 0], [0.25, 0.86, 0]], 0.03, 0.025, 8, 5), W, 0), P(tube([[-0.17, 0.1, 0], [-0.24, 0.4, 0], [-0.2, 0.7, 0], [-0.25, 0.86, 0]], 0.03, 0.025, 8, 5), W, 0),
      P(rod([-0.28, 0.8, 0], [0.28, 0.8, 0], 0.025), GOLD, 0, MET),
      ...Array.from({ length: 7 }, (_, k) => P(box(0.006, 0.66, 0.006, [-0.12 + k * 0.04, 0.46, 0.05]), '#EDE3CC', 0))];
  } },
  nevel: { hold: 'harp', build: () => {
    const W = '#7E5433';
    return [P(sph(0.22, [0, 0.05, 0], [1, 1.3, 0.55], 10, 7), W, 0, { rough: 0.55 }),
      P(tube([[0.12, 0.3, 0], [0.26, 0.7, 0], [0.24, 1.1, 0]], 0.035, 0.03, 8, 5), W, 0), P(tube([[-0.12, 0.3, 0], [-0.26, 0.7, 0], [-0.24, 1.1, 0]], 0.035, 0.03, 8, 5), W, 0),
      P(rod([-0.28, 1.07, 0], [0.28, 1.07, 0], 0.03), GOLD, 0, MET),
      ...Array.from({ length: 10 }, (_, k) => P(box(0.006, 0.8, 0.006, [-0.17 + k * 0.038, 0.65, 0.06]), '#EDE3CC', 0))];
  } },
  cymbals: { hold: 'cymbals', build: () => [
    P(lathe([[0.001, 0.04], [0.06, 0.035], [0.08, 0.01], [0.2, -0.02], [0.2, -0.03], [0.001, -0.005]], 14).rotateZ(Math.PI / 2).translate(0.03, 0, 0), '#D9A060', 3, MET),
    P(lathe([[0.001, 0.04], [0.06, 0.035], [0.08, 0.01], [0.2, -0.02], [0.2, -0.03], [0.001, -0.005]], 14).rotateZ(-Math.PI / 2).translate(-0.03, 0, 0), '#D9A060', 4, MET)] },
  staff: { hold: 'R', build: () => [P(rod([0, -1.55, 0.1], [0, 1.6, 0.1], 0.045, 0.04, 6), '#7A5A3C', 0, { rough: 0.9 }), P(tube([[0, 1.6, 0.1], [0, 1.8, 0.15], [0, 1.82, 0.3], [0, 1.7, 0.33]], 0.04, 0.035, 6, 5), '#7A5A3C', 0)] },
  lamb: { hold: 'arms', y: -0.35, build: () => [lambStatic().scale(0.62, 0.62, 0.62).rotateY(Math.PI / 2).translate(0.1, -0.35, 0.05)] },
  rope: { hold: 'rope', build: () => [P(new THREE.CylinderGeometry(0.03, 0.03, 1, 5).rotateX(Math.PI / 2).translate(0, 0, 0.5), '#8C6A43', 0, { rough: 1 })] },
};
// ── crews items ── (CREWS agent: the Phase A building crews, src/crews.js; docs/CREWS.md)
// The builders' tools and loads, and the workers' dress. `rope` (the tag lines at the crane), `log` (cedar on the carts)
// and `staff` (the foreman's rod, the drivers' goads) are the items above. Low-poly on purpose: every item instance
// runs the vertices of every item (one geometry), so each of these is a few dozen vertices.
// · hammer — a mason's hammer, iron head; the handle hangs down from the fist, so a tilt of −(arm raise) keeps it in
//   line with the arm through a swing (crews.js). · mallet — a wooden mallet: the altar's stones are not touched by
//   iron (Middot 3:4, "שלא הונף עליהן ברזל"), so its setters work with wood. · chisel — held in the left hand on the
//   stone (a prop placed at the hand). · pick — a two-handed quarry pick (quarrymen, foundation diggers).
// · saw — a two-man saw, grip at the first sawyer's hands, the blade reaching the second's (+z). · stone — a dressed
//   block carried on the shoulder. · fieldstone — a whole, unhewn stone for the altar (Middot 3:4), carried in the arms.
// · basket — earth, lime or chips, carried on the shoulder. · beam — a squared cedar beam on two trestles (a sawing
//   bench, set down as a prop). · door — a bronze door leaf on a cart (the Alexandria caravan: Nikanor's doors,
//   Yoma 38a). Colours and shapes: illustration.
{
  const IRON = '#5E5A55', WOOD = '#8C6A43', WOOD2 = '#A8814F', CEDAR = '#B98D62', LIME = '#EDE7DA', EARTH = '#8A6A48';
  const ASH = '#DCCDAA';
  Object.assign(ITEM_DEF, {
    hammer: { hold: 'R', build: () => [
      P(rod([0, 0.1, 0], [0, -0.62, 0.02], 0.035, 0.03, 5), WOOD, 0, { rough: 0.8 }),
      P(box(0.15, 0.15, 0.4, [0, -0.66, 0.06]), IRON, 0, { metal: 0.7, rough: 0.45 })] },
    mallet: { hold: 'R', build: () => [
      P(rod([0, 0.1, 0], [0, -0.6, 0.02], 0.04, 0.035, 5), WOOD, 0, { rough: 0.8 }),
      P(new THREE.CylinderGeometry(0.15, 0.15, 0.42, 8).rotateX(Math.PI / 2).translate(0, -0.66, 0.05), WOOD2, 0, { rough: 0.85 })] },
    chisel: { hold: 'R', build: () => [
      P(rod([0, 0.08, 0], [0, -0.46, 0], 0.03, 0.022, 5), IRON, 0, { metal: 0.7, rough: 0.4 }),
      P(new THREE.ConeGeometry(0.032, 0.08, 4).rotateX(Math.PI).translate(0, -0.5, 0), '#8C8781', 0, { metal: 0.8, rough: 0.35 })] },
    pick: { hold: 'two', build: () => [
      P(rod([0, 0.15, 0], [0, -1.05, 0.03], 0.045, 0.04, 5), WOOD, 0, { rough: 0.85 }),
      P(new THREE.ConeGeometry(0.07, 0.5, 4).rotateX(Math.PI / 2).translate(0, -1.1, 0.3), IRON, 0, { metal: 0.6, rough: 0.5 }),
      P(new THREE.ConeGeometry(0.06, 0.34, 4).rotateX(-Math.PI / 2).translate(0, -1.1, -0.2), IRON, 0, { metal: 0.6, rough: 0.5 })] },
    saw: { hold: 'two', build: () => [
      P(box(0.02, 0.13, 2.3, [0, -0.26, 1.15]), '#B9B6AE', 0, { metal: 0.35, rough: 0.4 }),
      P(box(0.03, 0.025, 2.3, [0, -0.19, 1.15]), '#8C6A43', 0, { rough: 0.8 }),
      P(rod([0, 0.1, 0], [0, -0.28, 0], 0.035, 0.035, 5), WOOD, 0), P(rod([0, 0.1, 2.3], [0, -0.28, 2.3], 0.035, 0.035, 5), WOOD, 0)] },
    stone: { hold: 'shoulder', y: 0.18, build: () => [P(box(0.95, 0.5, 0.62, [0, 0, 0]), ASH, 0, { rough: 0.92 })] },
    fieldstone: { hold: 'arms', y: 0.06, build: () => [P(new THREE.IcosahedronGeometry(0.34, 0).scale(1.2, 0.85, 1).translate(0, 0, 0.12), '#D5CCBA', 0, { rough: 0.95 })] },
    basket: { hold: 'shoulder', y: 0.12, build: () => [
      P(lathe([[0.001, -0.2], [0.26, -0.19], [0.33, 0.02], [0.35, 0.12], [0.33, 0.13], [0.001, 0.1]], 10), '#B08A52', 0, { rough: 1 }),
      P(sph(0.28, [0, 0.1, 0], [1, 0.35, 1], 8, 4), EARTH, 0, { rough: 1 })] },
    beam: { hold: 'two', build: () => [
      P(box(4.2, 0.5, 0.55, [0, 1.62, 0]), CEDAR, 0, { rough: 0.75 }),
      ...[-1.4, 1.4].flatMap((x) => [P(rod([x, 1.37, 0], [x - 0.35, 0, 0.5], 0.05, 0.05, 4), WOOD, 0), P(rod([x, 1.37, 0], [x - 0.35, 0, -0.5], 0.05, 0.05, 4), WOOD, 0),
        P(rod([x, 1.37, 0], [x + 0.35, 0, 0.5], 0.05, 0.05, 4), WOOD, 0), P(rod([x, 1.37, 0], [x + 0.35, 0, -0.5], 0.05, 0.05, 4), WOOD, 0)]),
      P(box(0.4, 0.06, 0.55, [0.9, 1.9, 0]), '#E2C79C', 0, { rough: 1 })] },
    door: { hold: 'two', build: () => [
      P(box(1.7, 0.18, 3.6, [0, 0, 0]), '#B8844A', 0, { metal: 0.85, rough: 0.35 }),
      ...[-1.2, 0, 1.2].map((z) => P(box(1.5, 0.06, 0.12, [0, 0.11, z]), '#8E6232', 0, { metal: 0.85, rough: 0.4 }))] },
  });
  // the builders' dress: a knee-length work tunic (instance colour), bare shins and arms from the elbow, a cloth belt and
  // a head cloth in the crew's colour (iCol2: the player sees which crew is which), barefoot on the Mount (Berakhot 9:5).
  // Dress: illustration (the sources do not describe the builders' clothes).
  const workerDress = () => {
    const parts = [];
    parts.push(P(lathe([[0.001, 0.62], [0.47, 0.63], [0.45, 0.9], [0.41, 1.25], [0.38, 1.6], [0.001, 1.62]], 12), '#FFFFFF', 0, { tint: 1, rough: 0.95 }));
    parts.push(P(lathe(TORSO, 12), '#FFFFFF', 1, { tint: 1, rough: 0.95 }));
    for (const s of [1, -1]) parts.push(P(rod([0.16 * s, 0.66, 0], [0.16 * s, 0.1, 0.04], 0.075, 0.065, 6), SKIN, s > 0 ? 5 : 6, skin));
    parts.push(P(cyl(0.405, 0.4, 0.16, [0, 1.55, 0], 12), '#FFFFFF', 1, { tint: 2, rough: 0.9 }));
    parts.push(P(box(0.08, 0.5, 0.025, [0.2, 1.3, 0.41], [-0.1, 0, 0]), '#FFFFFF', 1, { tint: 2, rough: 0.9 }));
    const hp = []; head(hp);
    // hair and beard: a fixed dark tint (iCol2 is the crew colour)
    for (const g of hp) { const t = g.attributes.aTint.array, c = g.attributes.color.array; for (let i = 0; i < t.length; i++) if (t[i] === 2) { t[i] = 0; c[i * 3] = 0.1; c[i * 3 + 1] = 0.07; c[i * 3 + 2] = 0.045; } }
    parts.push(...hp);
    parts.push(P(new THREE.SphereGeometry(0.305, 12, 6, 0, Math.PI * 2, 0, Math.PI * 0.53).scale(1, 1.02, 1.04).translate(0, 2.98, -0.02), '#FFFFFF', 2, { tint: 2, rough: 0.95 }));
    parts.push(P(new THREE.TorusGeometry(0.3, 0.03, 4, 14).rotateX(Math.PI / 2).translate(0, 3.02, -0.02), '#FFFFFF', 2, { tint: 2, rough: 0.95, fn: (x, y, z, c) => { c.multiplyScalar(0.8); } }));
    parts.push(P(tube([[0.08, 2.98, -0.28], [0.1, 2.8, -0.33], [0.09, 2.6, -0.3]], 0.05, 0.035, 5, 4), '#FFFFFF', 2, { tint: 2, rough: 0.95 }));
    // short sleeves (tunic colour), bare forearms
    for (const [s, b] of [[1, 3], [-1, 4]]) {
      parts.push(P(rod([0.42 * s, 2.54, 0], [0.46 * s, 2.12, 0.02], 0.13, 0.12, 7), '#FFFFFF', b, { tint: 1, rough: 0.95 }));
      parts.push(P(sph(0.135, [0.42 * s, 2.5, 0], [1, 0.9, 1], 7, 5), '#FFFFFF', b, { tint: 1, rough: 0.95 }));
      parts.push(P(rod([0.46 * s, 2.14, 0.02], [0.5 * s, 1.66, 0.06], 0.085, 0.075, 6), SKIN, b, skin));
      parts.push(P(sph(0.105, [0.5 * s, 1.6, 0.06], [0.9, 1.1, 1], 7, 5), SKIN, b, skin));
    }
    feet(parts);
    return parts;
  };
  DRESS.worker = workerDress;
}
// ── end crews items ──
// ── crowd items ── (PEOPLE, wave 6: the plaza's life, src/crowd.js) · lulav — the lulav bound with its myrtle and willow in
// the right hand, the etrog in the left (Sukkah 3:4, 3:9; the Mishnah's four kinds) · aravah — a long willow branch brought
// from Motza for the altar's sides (Sukkah 4:5), carried on the shoulder · jar — a clay water jar on the shoulder (the
// site's water carriers: illustration) · scroll — a scroll held open (the scribe's wage roll, the overseer's plan, the
// teacher: illustration) · halil — the flute that plays before the bikkurim (Bikkurim 3:3) · table — a low table set down
// as a prop (the scribe's, the dove seller's) · mikveh — the mouth of a stepped immersion pool by the southern steps
// (archaeology of the Ophel: illustration of its look). Low-poly: every item instance runs every item's vertices.
{
  const GREEN = '#5F7F3A', GREEN2 = '#7C9A4E', ETROG = '#E6C23F', CLAY = '#B8784C', PARCH = '#E9DDC2', WOODD = '#7A5A3A';
  Object.assign(ITEM_DEF, {
    lulav: { hold: 'two', y: 0.05, build: () => [
      P(rod([-0.2, -0.25, 0.02], [-0.24, 1.55, 0.14], 0.035, 0.02, 5), GREEN, 0, { rough: 0.9 }),
      P(box(0.1, 1.1, 0.02, [-0.23, 0.95, 0.1], [0.07, 0, 0]), GREEN2, 0, { rough: 0.9 }),
      P(sph(0.07, [-0.19, 0.1, 0.03], [1, 2.2, 1], 6, 4), '#4E6B30', 0, { rough: 1 }),
      P(sph(0.095, [0.2, 0.02, 0.06], [1, 1.25, 1], 8, 6), ETROG, 0, { rough: 0.7 })] },
    aravah: { hold: 'shoulder', y: 0.1, build: () => [
      P(rod([0, -0.25, -0.7], [0, 2.05, 1.5], 0.045, 0.02, 5), '#7A6A48', 0, { rough: 0.9 }),
      ...[0.35, 0.5, 0.62, 0.74, 0.86, 0.96].map((u, k) => P(sph(0.16 - k * 0.012, [(k % 2 ? 0.08 : -0.08), -0.25 + 2.3 * u, -0.7 + 2.2 * u], [0.7, 1.6, 0.45], 6, 4), k % 2 ? GREEN2 : GREEN, 0, { rough: 1 }))] },
    jar: { hold: 'shoulder', y: 0.2, build: () => [P(lathe([[0.001, -0.3], [0.14, -0.28], [0.22, -0.05], [0.2, 0.2], [0.09, 0.32], [0.1, 0.4], [0.001, 0.4]], 10), CLAY, 0, { rough: 0.85 })] },
    scroll: { hold: 'two', y: 0.08, build: () => [
      P(box(0.36, 0.28, 0.012, [0, 0, 0.02], [-0.5, 0, 0]), PARCH, 0, { rough: 0.95 }),
      P(cyl(0.03, 0.03, 0.34, [-0.19, -0.16, 0.11], 6).rotateX(-0.5), WOODD, 0), P(cyl(0.03, 0.03, 0.34, [0.19, -0.16, 0.11], 6).rotateX(-0.5), WOODD, 0)] },
    halil: { hold: 'blow', build: () => [P(cyl(0.022, 0.03, 0.62, [0, 0, 0], 6).rotateX(Math.PI / 2), '#C9A56B', 0, { rough: 0.6 })] },
    table: { hold: 'two', build: () => [
      P(box(1.5, 0.08, 0.8, [0, 0.72, 0]), '#8C6A43', 0, { rough: 0.85 }),
      ...[[-0.65, -0.32], [0.65, -0.32], [-0.65, 0.32], [0.65, 0.32]].map(([x, z]) => P(box(0.08, 0.7, 0.08, [x, 0.35, z]), WOODD, 0)),
      P(cyl(0.05, 0.05, 0.08, [0.5, 0.76, 0.15], 6), '#3A2E24', 0)] },
    mikveh: { hold: 'two', build: () => [
      P(box(3.2, 0.2, 0.3, [0, 0.1, -1.05]), '#D8CCB0', 0, { rough: 0.9 }), P(box(3.2, 0.2, 0.3, [0, 0.1, 1.05]), '#D8CCB0', 0, { rough: 0.9 }),
      P(box(0.3, 0.2, 2.4, [-1.45, 0.1, 0]), '#D8CCB0', 0, { rough: 0.9 }), P(box(0.3, 0.2, 2.4, [1.45, 0.1, 0]), '#D8CCB0', 0, { rough: 0.9 }),
      ...[0, 1, 2].map((k) => P(box(2.6, 0.05, 0.6, [0, -0.1 - k * 0.3, -0.6 + k * 0.45]), '#C9BC9E', 0, { rough: 0.9 })),
      P(box(2.6, 0.02, 0.9, [0, -0.85, 0.45]), '#3D6B7A', 0, { rough: 0.15 })] },
  });
}
// ── end crowd items ──
export const ITEMS = Object.keys(ITEM_DEF);
// bone 1: contents (blood in the mizrak, coals in the machta: shown when iA.z > 0.5) · bone 2: flame · bones 3/4: the two cymbals
const ITEM_POSE = `
  void rigPose(out mat3 R, out vec3 T){
    R = mat3(1.0); T = vec3(0.0);
    float aItem = floor((aBone + 0.5) / 8.0), bn = aBone - aItem * 8.0;
    if (abs(aItem - iA.x) > 0.5 || (bn > 0.5 && bn < 1.5 && iA.z < 0.5)) { R = mat3(0.0); return; }
    if (bn > 1.5 && bn < 2.5) { float f = 1.0 + 0.18 * sin(iB.x * 17.0) * sin(iB.x * 7.3); R = mat3(f, 0.0, 0.0, 0.0, f, 0.0, 0.0, 0.0, f); T = vec3(0.0, 0.95, 0.1) * (1.0 - f); }
    if (bn > 2.5 && bn < 3.5) T.x += iA.w;
    if (bn > 3.5) T.x -= iA.w;
    mat3 Rt = rX(iA.y); T = Rt * T; R = Rt * R;
  }`;

/* ───────────────────────── the cast ───────────────────────── */
const _e = [0, 0, 0];
function rotX(v, a) { const c = Math.cos(a), s = Math.sin(a), y = v[1] * c - v[2] * s, z = v[1] * s + v[2] * c; v[1] = y; v[2] = z; }
function rotZ(v, a) { const c = Math.cos(a), s = Math.sin(a), x = v[0] * c - v[1] * s, y = v[0] * s + v[1] * c; v[0] = x; v[1] = y; }
const lerp = (a, b, t) => a + (b - a) * t;
// arm targets for each way of holding: [left raise, left spread, right raise, right spread]
const HOLD = {
  none: null, two: [1.05, -0.3, 1.05, -0.3], R: [0, 0.05, 0.62, -0.05], shoulder: [0, 0.05, 2.55, -0.42], arms: [1.15, -0.36, 1.15, -0.36],
  blow: [1.75, -0.42, 1.95, -0.34], lyre: [0.95, -0.12, 0.85, -0.38], harp: [0.8, -0.2, 0.8, -0.2], cymbals: [1.25, 0.1, 1.25, 0.1], staff: [0, 0.05, 0.5, -0.05], rope: [0, 0.05, 0.5, -0.02],
};
/** ctx: { scene, camera?, blobs, ground(x, z) } */
export function createActors(ctx) {
  const { scene, blobs } = ctx;
  let camera = ctx.camera || null;
  const ground = ctx.ground || (() => 0);
  const meshes = {};
  const humanMat = rigMaterial('human', HUMAN_POSE);
  // ── site16 ── the caps: createActors({ max, maxItems }) — 96 / 160 as before; the crews' instance asks for more (the life layer)
  const MAXK = ctx && ctx.max >= 8 ? ctx.max | 0 : 96, MAXI = ctx && ctx.maxItems >= 8 ? ctx.maxItems | 0 : 160;
  const getMesh = (k) => {
    if (meshes[k]) return meshes[k];
    const m = rigMesh(merge(DRESS[k]()), humanMat, MAXK); m.name = 'actor-' + k; scene.add(m);   // ── site16 ── (MAXK: the crews' instance holds the life layer too)
    return (meshes[k] = { m, n: 0, max: MAXK });
  };
  // items: one geometry, one instance per held item
  const itemParts = [];
  ITEMS.forEach((id, i) => {
    // (the item id is packed into aBone: bone + 8 × item — WebGL allows only 16 vertex attributes)
    for (const g of ITEM_DEF[id].build()) { const b = g.attributes.aBone.array; for (let k = 0; k < b.length; k++) b[k] += 8 * i; itemParts.push(g); }
  });
  const itemMat = rigMaterial('item', ITEM_POSE);
  const items = rigMesh(merge(itemParts), itemMat, MAXI); items.name = 'items'; scene.add(items);
  const ITEM_ID = {}; ITEMS.forEach((k, i) => { ITEM_ID[k] = i; });
  items.userData.n = 0;

  const list = [];
  // things set down in the world (limbs on the kevesh, the silver bowls at the horn): { item, x, y, z, yaw, fill, vis }
  const props = [];
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const SKIN_COL = new THREE.Color(1, 1, 1);
  const HAIR = ['#2A1C12', '#3B2718', '#1C1410', '#5A3E28', '#8C8680', '#2E211A'].map((h) => new THREE.Color(h));
  const PIL = ['#8C5A3C', '#3F5F8C', '#7A3E3E', '#C9A66B', '#556B3A', '#E0D7C5', '#6B4E7A', '#B55A3A', '#D8C9A8', '#2F4F4F', '#9E7B4F', '#4E6E8E'].map((h) => new THREE.Color(h));
  const LEV = ['#E6DABF', '#DCCDAE', '#E9E0CB'].map((h) => new THREE.Color(h));

  /** variant: kohen | gadol | gadol-white | levite | pilgrim | woman; opts: { yaw, y, ground, item, col, col2 } */
  function add(variant, x, z, opts = {}) {
    if (!DRESS[variant]) variant = 'kohen';
    const K = getMesh(variant);
    const isP = variant === 'pilgrim' || variant === 'woman';
    const a = {
      variant, K, x, z, y: opts.y !== undefined ? opts.y : (opts.ground || ground)(x, z), yaw: opts.yaw || 0, s: ACTOR_S * (opts.scale || (0.92 + rnd() * 0.16)),
      vis: opts.hidden ? 0 : (opts.fadeIn ? 0 : 1), visT: opts.hidden ? 0 : 1, ground: opts.ground || null, fixedY: opts.y,
      path: null, pi: 0, speed: opts.speed || 3.4, res: null, face: null, faceRes: null, moving: false,
      ph: rnd() * 6, wk: 0, bow: 0, bowT: 0, kn: 0, knT: 0, sway: 0,
      arm: [0, 0.05, 0, 0.05], armT: [0, 0.05, 0, 0.05], lift: 0, liftT: 0,
      hy: 0, hp: 0, hyT: 0, hpT: 0, lookT: rnd() * 3, look: null,
      item: null, hold: 'none', tilt: 0, tiltT: 0, fill: 0, gesture: null, playing: false, playT: rnd() * 5,
      col: opts.col ? new THREE.Color(opts.col) : isP ? PIL[Math.floor(rnd() * PIL.length)].clone() : variant === 'levite' ? LEV[Math.floor(rnd() * LEV.length)].clone() : new THREE.Color(1, 1, 1),
      col2: opts.col2 ? new THREE.Color(opts.col2) : isP ? PIL[Math.floor(rnd() * PIL.length)].clone() : HAIR[Math.floor(rnd() * HAIR.length)].clone(),
      shade: 0.82 + rnd() * 0.3, rope: null, alive: true, onHide: null,
      hand: new THREE.Vector3(), handL: new THREE.Vector3(), handR: new THREE.Vector3(),
      poseName: 'stand', poseRes: null,
      // ── people7 ── faces vary: about one man in five is young (no beard, a touch shorter); a child is always young
      young: opts.young !== undefined ? !!opts.young : (opts.scale && opts.scale < 0.85) || rnd() < 0.2,
    };
    if (a.young && !opts.scale && opts.young === undefined) a.s *= 0.95;
    // pilgrims: tunic and mantle of different colours; skin for the kohanim from the shade
    if (!isP && variant !== 'levite') a.col.copy(SKIN_COL);
    if (opts.item) setItem(a, opts.item);
    list.push(a);
    return a;
  }
  function remove(a) {
    if (!a || !a.alive) return;
    a.alive = false; const i = list.indexOf(a); if (i >= 0) list.splice(i, 1);
    for (const k of ['res', 'faceRes', 'poseRes']) if (a[k]) { const r = a[k]; a[k] = null; r(false); }
    if (a.gesture && a.gesture.res) a.gesture.res(false);
  }
  function setItem(a, item) {
    const id = item && ITEM_DEF[item] ? item : null;
    a.item = id; a.hold = id ? ITEM_DEF[id].hold : 'none'; a.fill = id === 'machta' ? 1 : 0;
    a.armT = HOLD[a.hold] ? HOLD[a.hold].slice() : [0, 0.05, 0, 0.05];
  }
  // ── world api (s4) ── (World agent) every promise resolves on time, whatever the frame rate. Motion runs in simulation
  // time (update(dt)), but the loop clamps dt per frame, so on a software renderer or a busy phone the simulation runs
  // slower than the wall clock, and a paused loop does not run it at all: the gameplay's 15 s guard on walkTo expired while
  // a walk was still under way in simulation time (integration run; screenshots block the main thread for many seconds).
  // So a walk keeps pace with the wall clock (never behind speed × real time elapsed), and every promise has a wall-clock
  // backstop that finishes its motion (snaps it to the end) and resolves: 1.6 × its duration + 2.5 s.
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  function guard(p, finish, sec) {
    let t = null, done = false;
    const arm = (ms) => { t = setTimeout(() => { if (done) return; let later = false; try { later = finish() === 'later'; } catch (e) { later = false; } if (later) arm(2000); }, ms); };
    arm((Math.max(0, sec || 0) * 1.6 + 2.5) * 1000);
    return p.then((v) => { done = true; clearTimeout(t); return v; });
  }
  function walk(a, pts, speed) {
    if (a.res) { const r = a.res; a.res = null; r(false); }
    a.path = pts && pts.length ? pts : null; a.pi = 0; if (speed) a.speed = speed;
    if (!a.path) return Promise.resolve(true);
    let L = 0, px = a.x, pz = a.z;
    for (const q of a.path) { L += Math.hypot(q[0] - px, q[1] - pz); px = q[0]; pz = q[1]; }
    const tok = {}; a.walkTok = tok; a.walkT0 = now(); a.walked = 0;
    const pr = new Promise((res) => { a.res = res; });
    return guard(pr, () => {
      if (a.walkTok !== tok || !a.path) return;
      if (a.paused && a.alive) return 'later';                 // (a pilgrim stopped to bow: its walk goes on after)
      const e = a.path[a.path.length - 1]; a.x = e[0]; a.z = e[1]; a.path = null;
      if (a.res) { const r = a.res; a.res = null; r(true); }
    }, L / Math.max(0.1, a.speed));
  }
  function face(a, x, z) {
    if (a.faceRes) { const r = a.faceRes; a.faceRes = null; r(false); }
    a.face = [x, z];
    const tok = {}; a.faceTok = tok;
    return guard(new Promise((res) => { a.faceRes = res; }), () => {
      if (a.faceTok !== tok || !a.faceRes) return;
      if (a.path && a.alive) return 'later';                   // (it turns once it stops)
      if (a.face) a.yaw = Math.atan2(a.face[0] - a.x, a.face[1] - a.z);
      a.face = null; const r = a.faceRes; a.faceRes = null; r(true);
    }, 0.8);
  }
  // ── end world api (s4) ──
  // poses: target values for bow / kneel / arms; gestures run on a small timeline
  const POSES = {
    stand: { bow: 0, kn: 0 }, lift: { bow: -0.05, kn: 0, arms: [2.2, -0.25, 2.2, -0.25] }, bless: { bow: -0.04, kn: 0, arms: [2.95, 0.3, 2.95, 0.3] },
    bow: { bow: 0.75, kn: 0, arms: [0.35, 0.05, 0.35, 0.05] }, kneel: { bow: 1.28, kn: 1, arms: [1.45, 0.25, 1.45, 0.25] },
    // semicha: both hands pressed on the animal's head (for the owner of an offering; source for the card: content agent)
    lean: { bow: 0.45, kn: 0, arms: [1.0, -0.22, 1.0, -0.22] },
  };
  // sanctifying hands and feet at the kiyor: bent low and crouched, the right hand down at the right foot and the left at
  // the left (Zevachim 19b, as WATER asked; the rig's straight arms reach the shins: illustration; the washing itself:
  // Tamid 1:4, Yoma 3:10). Hands at ≈ (±0.29, 0.68, 0.51) in the rig's model units (was 1.06 high)
  POSES.wash = { bow: 1.25, kn: 0.5, arms: [0.6, -0.3, 0.6, -0.3] };
  POSES.prostrate = POSES.kneel; POSES.semicha = POSES.lean;
  // ── yk ── (World agent) semicha on the bull's head: bent a little further, both hands pressed forward and down
  // (Yoma 3:8 "וסומך שתי ידיו עליו ומתודה"); raise: the machta lifted before him (Yoma 4:3, 5:1); carry: both hands
  // forward at chest height, walking slowly with a vessel in each (Yoma 5:1)
  POSES.semicha = { bow: 0.5, kn: 0, arms: [1.25, -0.28, 1.25, -0.28] };
  POSES.raise = { bow: -0.04, kn: 0, arms: [0.3, 0.05, 1.7, -0.08] };
  POSES.carry = { bow: 0, kn: 0, arms: [1.2, -0.3, 1.2, -0.3] };
  // ── end yk ──
  // ── crowd ── (PEOPLE) sit: kneeling upright on the heels (students round their teacher, a scribe at his table); point:
  // the right arm out toward what he shows; talk: a hand opened in front; dance: both arms up (torches at Simchat Beit
  // HaShoeva, Sukkah 5:4); offer: both hands forward (a loaf, a cup of water)
  POSES.sit = { bow: 0.08, kn: 0.92, arms: [0.55, 0.12, 0.55, 0.12] };
  POSES.point = { bow: 0, kn: 0, arms: [0, 0.05, 1.45, -0.25] };
  POSES.talk = { bow: 0.02, kn: 0, arms: [0.1, 0.05, 0.85, -0.2] };
  POSES.dance = { bow: -0.08, kn: 0.12, arms: [2.6, 0.35, 2.6, 0.35] };
  POSES.offer = { bow: 0.12, kn: 0, arms: [1.0, -0.25, 1.0, -0.25] };
  // ── end crowd ──
  function pose(a, p) {
    if (a.poseRes) { const r = a.poseRes; a.poseRes = null; r(false); }
    // ── yk ── "flick": one quick flick of the right hand, "כמצליף" (Yoma 5:3) — the motion only, no marks (PROJECT.md §2.9)
    if (p === 'flick') {
      if (a.gesture && a.gesture.res) a.gesture.res(false);
      return guard(new Promise((res) => { a.gesture = { kind: 'flick', t: 0, dur: 0.75, res }; }), () => { if (a.gesture && a.gesture.kind === 'flick') { const g = a.gesture; a.gesture = null; if (g.res) g.res(true); } }, 0.75);
    }
    // ── end yk ──
    if (p === 'pour' || p === 'throw') {
      if (a.gesture && a.gesture.res) a.gesture.res(false);
      const dur = p === 'pour' ? 2.4 : 0.9;
      // (── world api (s4) ── the wall-clock backstop)
      return guard(new Promise((res) => { a.gesture = { kind: p, t: 0, dur, res }; }), () => { if (a.gesture && a.gesture.kind === p) { const g = a.gesture; a.gesture = null; a.tiltT = 0; if (g.res) g.res(true); } }, dur);
    }
    const P0 = POSES[p] || POSES.stand;
    a.poseName = POSES[p] ? p : 'stand';
    a.bowT = P0.bow; a.knT = P0.kn;
    a.armT = P0.arms ? P0.arms.slice() : HOLD[a.hold] ? HOLD[a.hold].slice() : [0, 0.05, 0, 0.05];
    // (── world api (s4) ── the wall-clock backstop: the pose is taken at once and the promise resolves)
    let mine = null;
    return guard(new Promise((res) => { mine = res; a.poseRes = res; a.poseDue = 0.7; }), () => { if (a.poseRes === mine) { a.bow = a.bowT; a.kn = a.knT; a.poseRes = null; mine(true); } }, 0.7);
  }

  // hand positions in world space (the same rig as the shader)
  function armLocal(a, side, H, S, out) {
    const pit = side > 0 ? a.arm[0] : a.arm[2], spr = side > 0 ? a.arm[1] : a.arm[3];
    out[0] = H[0] - S[0]; out[1] = H[1] - S[1]; out[2] = H[2] - S[2];
    rotX(out, -pit); rotZ(out, side > 0 ? spr : -spr);
    out[0] += S[0] - HIP[0]; out[1] += S[1] - HIP[1]; out[2] += S[2] - HIP[2];
    rotZ(out, Math.sin(a.ph) * 0.035 * a.wk + a.sway); rotX(out, a.bow);
    out[0] += HIP[0]; out[1] += HIP[1] - a.kn * 0.78; out[2] += HIP[2] + a.kn * 0.1;
  }
  function toWorld(a, l, v) {
    const c = Math.cos(a.yaw), s = Math.sin(a.yaw), S = a.s;
    v.set(a.x + (l[0] * c + l[2] * s) * S, a.y + l[1] * S, a.z + (-l[0] * s + l[2] * c) * S);
  }

  const fr = new THREE.Frustum(), pm = new THREE.Matrix4(), sp = new THREE.Sphere();
  const A = [0, 0, 0, 0], B = [0, 0, 0, 0], C = [0, 0, 1, 0], IA = [0, 0, 0, 0], IB = [0, 0, 0, 0], IC = [0, 0, 1, 0];
  const M4 = new THREE.Matrix4(), Q = new THREE.Quaternion(), V = new THREE.Vector3(), S3 = new THREE.Vector3(), UP = new THREE.Vector3(0, 1, 0), Z = new THREE.Vector3(0, 0, 1), D = new THREE.Vector3();
  let T = 0;
  let enabled = true;
  function update(dt) {
    T += dt;
    if (!enabled) { for (const k in meshes) rigEnd(meshes[k].m, 0); rigEnd(items, 0); return; }
    let cx = 0, cy = 0, cz = 0;
    if (camera) { camera.updateMatrixWorld(); pm.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); fr.setFromProjectionMatrix(pm); cx = camera.position.x; cy = camera.position.y; cz = camera.position.z; }
    for (const k in meshes) meshes[k].n = 0;
    let ni = 0;
    for (let i = 0; i < list.length; i++) {
      const a = list[i];
      if (a.vis !== a.visT) {
        const dir = a.visT > a.vis ? 1 : -1; a.vis += dir * dt / 0.45;
        if ((dir > 0 && a.vis >= a.visT) || (dir < 0 && a.vis <= a.visT)) { a.vis = a.visT; if (a.vis === 0 && a.onHide) { const f = a.onHide; a.onHide = null; f(); } }
      }
      let inView = a.vis > 0.001;
      if (inView && camera) {
        const dx = a.x - cx, dy = a.y - cy, dz = a.z - cz;
        if (dx * dx + dy * dy + dz * dz > 700 * 700) inView = false;
        else { sp.center.set(a.x, a.y + 2, a.z); sp.radius = 3.5; inView = fr.intersectsSphere(sp); }
      }
      if (!inView && !a.path && !a.face && !a.gesture && !a.poseRes && !a.rope) continue;
      step(a, dt);
      if (!inView) continue;
      const K = a.K;
      if (K.n >= K.max) continue;
      A[0] = a.ph; A[1] = a.wk; A[2] = a.bow + Math.sin(T * 1.75 + a.shade * 31) * 0.014 * (1 - a.wk); A[3] = a.kn + (a.young ? 2 : 0);   // (── people6 ── a breath)
      B[0] = a.arm[0]; B[1] = a.arm[1]; B[2] = a.arm[2]; B[3] = a.arm[3];
      C[0] = a.hy; C[1] = a.hp; C[2] = a.shade; C[3] = a.sway;
      const sc = a.s * (a.vis < 1 ? Math.max(0.001, a.vis) : 1);
      rigWrite(K.m, K.n++, a.x, a.y + Math.abs(Math.cos(a.ph)) * 0.06 * a.wk, a.z, a.yaw, sc, a.col, A, B, C, a.col2);
      if (blobs) blobs.push(a.x, a.y, a.z, 1.5 * a.s * a.vis, 1.3 * a.s * a.vis, a.yaw);
      // the held item
      if (a.item && ni < MAXI - 1) {
        const def = ITEM_DEF[a.item];
        if (a.hold === 'R' || a.hold === 'staff' || a.hold === 'rope') { armLocal(a, -1, HANDR, SHR, _e); toWorld(a, _e, V); }
        else if (a.hold === 'shoulder') { armLocal(a, -1, HANDR, SHR, _e); toWorld(a, _e, V); V.y -= 0.05 * a.s; }
        else { armLocal(a, 1, HANDL, SHL, _e); toWorld(a, _e, a.handL); armLocal(a, -1, HANDR, SHR, _e); toWorld(a, _e, a.handR); V.copy(a.handL).add(a.handR).multiplyScalar(0.5); }
        V.y += (def.y || 0) * a.s + (a.hold === 'two' || a.hold === 'arms' ? 0.12 * a.s : 0);
        IA[0] = ITEM_ID[a.item]; IA[1] = a.tilt + (a.hold === 'blow' ? -0.45 - a.bow : 0); IA[2] = a.fill; IA[3] = a.hold === 'cymbals' ? Math.max(0, a.handL.distanceTo(a.handR) / a.s * 0.5 - 0.06) : 0;
        IB[0] = T + i * 1.7;
        rigWrite(items, ni++, V.x, V.y, V.z, a.yaw, sc, null, IA, IB, IC, null);
        a.hand.copy(V);
      } else if (!a.item) { armLocal(a, -1, HANDR, SHR, _e); toWorld(a, _e, a.hand); }
      // a lead rope from the right hand to the animal's neck
      if (a.rope && a.rope.alive && ni < MAXI - 1) {
        if (a.item) { armLocal(a, -1, HANDR, SHR, _e); toWorld(a, _e, V); } else V.copy(a.hand);
        D.copy(a.rope.neck).sub(V); const L = Math.max(0.01, D.length());
        Q.setFromUnitVectors(Z, D.multiplyScalar(1 / L)); S3.set(1, 1, L); M4.compose(V, Q, S3); M4.toArray(items.instanceMatrix.array, ni * 16);
        const g = items.geometry.attributes; g.iA.array[ni * 4] = ITEM_ID.rope; g.iA.array[ni * 4 + 1] = 0; g.iA.array[ni * 4 + 2] = 0; g.iA.array[ni * 4 + 3] = 0;
        ni++;
      }
    }
    for (let i = 0; i < props.length && ni < MAXI - 1; i++) {
      const p = props[i];
      if (p.vis !== p.visT) { const dir = p.visT > p.vis ? 1 : -1; p.vis += dir * dt / 0.35; if ((dir > 0 && p.vis >= p.visT) || (dir < 0 && p.vis <= p.visT)) p.vis = p.visT; }
      if (p.vis <= 0.001) continue;
      if (camera) { sp.center.set(p.x, p.y, p.z); sp.radius = 1.5; if (!fr.intersectsSphere(sp)) continue; }
      IA[0] = ITEM_ID[p.item]; IA[1] = p.tilt || 0; IA[2] = p.fill || 0; IA[3] = 0; IB[0] = T;
      rigWrite(items, ni++, p.x, p.y, p.z, p.yaw || 0, (p.s || ACTOR_S) * p.vis, null, IA, IB, IC, null);
    }
    for (const k in meshes) rigEnd(meshes[k].m, meshes[k].n);
    rigEnd(items, ni);
  }
  function prop(item, x, y, z, yaw = 0, o = {}) {
    if (!ITEM_DEF[item]) return null;
    const p = { item, x, y, z, yaw, fill: o.fill || 0, tilt: o.tilt || 0, s: o.s, vis: o.fadeIn === false ? 1 : 0, visT: 1 };
    props.push(p); return p;
  }
  function unprop(p) { const i = props.indexOf(p); if (i >= 0) props.splice(i, 1); }

  function step(a, dt) {
    let moving = false, want = a.yaw;
    // ── world api (s4) ── a step keeps pace with the wall clock (see guard) and may pass several points of the path
    if (a.path && a.paused && a.walkT0 !== undefined) a.walkT0 = now() - (a.walked || 0) / Math.max(0.1, a.speed) * 1000;
    if (a.path && !a.paused) {
      let stp = a.speed * dt;
      if (a.walkT0 !== undefined) { const behind = a.speed * (now() - a.walkT0) / 1000 - (a.walked || 0); if (behind > stp) stp = behind; }
      a.walked = (a.walked || 0) + stp;
      for (let n = 0; a.path && n < 64; n++) {
        const p = a.path[a.pi], dx = p[0] - a.x, dz = p[1] - a.z, d = Math.hypot(dx, dz);
        if (d <= stp || d < 0.02) {
          a.x = p[0]; a.z = p[1]; a.pi++; stp = Math.max(0, stp - d);
          if (a.pi >= a.path.length) { a.path = null; if (a.res) { const r = a.res; a.res = null; r(true); } }
          else if (stp <= 0) break;
        } else { a.x += dx / d * stp; a.z += dz / d * stp; break; }
      }
      if (a.path) { const p = a.path[a.pi], dx = p[0] - a.x, dz = p[1] - a.z; if (dx * dx + dz * dz > 1e-6) { moving = true; want = Math.atan2(dx, dz); } }
    }
    // ── end world api (s4) ──
    if (!moving && a.face) {
      want = Math.atan2(a.face[0] - a.x, a.face[1] - a.z);
      let dyw = want - a.yaw; dyw = Math.atan2(Math.sin(dyw), Math.cos(dyw));
      if (Math.abs(dyw) < 0.04) { a.face = null; if (a.faceRes) { const r = a.faceRes; a.faceRes = null; r(true); } }
    }
    let dy = want - a.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy));
    a.yaw += dy * Math.min(1, dt * (moving ? 9 : 7));
    a.moving = moving;
    a.wk += ((moving ? 1 : 0) - a.wk) * Math.min(1, dt * 8);
    if (moving) a.ph += a.speed * dt / 1.15 * Math.PI;
    const gy = a.fixedY !== undefined && !a.path ? a.fixedY : (a.ground || ground)(a.x, a.z);
    a.y += (gy - a.y) * Math.min(1, dt * 14); if (Math.abs(gy - a.y) > 6) a.y = gy;
    // pose (bow / kneel) and arms
    const kr = Math.min(1, dt * 4.5);
    a.bow += (a.bowT - a.bow) * kr; a.kn += (a.knT - a.kn) * kr;
    const tgt = a.armT;
    let t0 = tgt[0], t1 = tgt[1], t2 = tgt[2], t3 = tgt[3];
    // swinging arms while walking (a free arm only)
    const free = a.poseName === 'stand' && !a.gesture;
    if (free && moving) {
      const sw = Math.sin(a.ph) * 0.38;
      if (!HOLD[a.hold]) { t0 += sw; t2 -= sw; } else if (a.hold === 'R' || a.hold === 'shoulder' || a.hold === 'staff' || a.hold === 'rope') t0 += sw;
    }
    // instruments: plucking, a cymbal clash every few beats
    if (a.playing && free) {
      a.playT += dt;
      if (a.hold === 'lyre' || a.hold === 'harp') { t2 += Math.sin(a.playT * 7) * 0.12; t3 += Math.sin(a.playT * 3.5) * 0.08; }
      else if (a.hold === 'cymbals') { const u = (a.playT % 1.6) / 1.6, cl = u < 0.25 ? Math.sin(u / 0.25 * Math.PI) : 0; t1 = 0.35 - cl * 0.55; t3 = 0.35 - cl * 0.55; }
      else if (a.hold === 'blow') { t0 += Math.sin(a.playT * 2) * 0.03; }
    }
    // gestures
    if (a.gesture) {
      const G = a.gesture; G.t += dt; const u = Math.min(1, G.t / G.dur);
      // ── yk ── the flick: the right hand dips toward the vessel and flicks out and down
      if (G.kind === 'flick') { const k = u < 0.35 ? u / 0.35 : Math.max(0, 1 - (u - 0.35) / 0.65); t2 = 1.15 + 0.55 * k; t3 = -0.2 + 0.2 * k; } else
      // ── end yk ──
      if (G.kind === 'throw') {
        // a quick toss from the vessel: arms dip, then swing up and forward
        const k = u < 0.45 ? -Math.sin(u / 0.45 * Math.PI) * 0.22 : Math.sin((u - 0.45) / 0.55 * Math.PI) * 0.5;
        t0 = (HOLD[a.hold] ? HOLD[a.hold][0] : 0.9) + k; t2 = (HOLD[a.hold] ? HOLD[a.hold][2] : 0.9) + k;
        if (!HOLD[a.hold]) { t1 = -0.2; t3 = -0.2; }
      } else {
        // pour: raise, tip the vessel forward, hold, return
        const k = u < 0.25 ? u / 0.25 : u > 0.8 ? (1 - u) / 0.2 : 1;
        a.tiltT = 1.35 * k; t0 = Math.max(t0, 1.3 * k); t2 = Math.max(t2, 1.3 * k);
      }
      if (u >= 1) { a.gesture = null; a.tiltT = 0; if (G.res) G.res(true); }
    }
    const ar = Math.min(1, dt * (a.gesture ? 14 : 7));
    a.arm[0] += (t0 - a.arm[0]) * ar; a.arm[1] += (t1 - a.arm[1]) * ar; a.arm[2] += (t2 - a.arm[2]) * ar; a.arm[3] += (t3 - a.arm[3]) * ar;
    a.tilt += (a.tiltT - a.tilt) * Math.min(1, dt * 8);
    if (a.poseRes) { a.poseDue -= dt; if (a.poseDue <= 0) { const r = a.poseRes; a.poseRes = null; r(true); } }
    // the head: looks about when idle, at a target when told
    a.lookT -= dt;
    if (a.lookT <= 0) { a.hyT = (rnd() - 0.5) * 0.9; a.hpT = (rnd() - 0.5) * 0.25; a.lookT = 2 + rnd() * 4; }
    let hyT = moving ? 0 : a.hyT, hpT = moving ? 0.05 : a.hpT;
    if (a.look) { const w = Math.atan2(a.look[0] - a.x, a.look[1] - a.z) - a.yaw; hyT = Math.max(-1, Math.min(1, Math.atan2(Math.sin(w), Math.cos(w)))); hpT = 0.15; }
    if (a.poseName === 'bless') { hyT = 0; hpT = -0.12; }
    if (a.poseName === 'kneel') { hyT = 0; hpT = 0.3; }
    a.hy += (hyT - a.hy) * Math.min(1, dt * 3); a.hp += (hpT - a.hp) * Math.min(1, dt * 3);
    // ── people6 ── weight shifts: a slow lean from one foot to the other, now and then
    a.sway = (Math.sin(T * 0.55 + a.shade * 20) * 0.022 + Math.sin(T * 1.3 + a.shade * 7) * 0.006) * (1 - a.wk);
  }

  return {
    add, remove, walk, face, pose, setItem, update, list, items, prop, unprop, props, ITEM_ID,
    setEnabled(v) { enabled = !!v; },
    setCamera(c) { camera = c; },
    get drawn() { let n = items.visible ? 1 : 0; for (const k in meshes) n += meshes[k].m.visible ? 1 : 0; return n; },
    handWorld(a, side, out) { armLocal(a, side, side > 0 ? HANDL : HANDR, side > 0 ? SHL : SHR, _e); toWorld(a, _e, out); return out; },
  };
}
