/* ── build 135 ── h135/world.js — the things of stage 12 "הכיור" in the one world, drawn from the save (spec docs/specs/shlav-12-he.md
 * v8, "ביצוע חוזר", "טבלת ההפסד", "מפת המחסומים", "המראה"). Every place from BOOK.s12.
 *   · the kiyor (copper, finished) hanging on its two chains, the sun ring and the moon ring inside, the twelve seats, the spigots he installed as he
 *     aimed them (st.spigots), every dent from the descents and every scratch on a seat, where it happened;
 *   · the pit under it, cut into the court's floor (the depth mask, as stage 07's Golah: the cavity drawn first, a plate that writes only
 *     depth over its mouth, the floor after it fails there), its low stone rim; the water in it to the sink line once work 3 is done;
 *   · the mukhni (v8): two posts on the pit's rim, the horizontal axle on them (north–south), the drum over the kiyor with the two copper
 *     chains wound on it down to the lugs on the kiyor's rim, the big vertical wheel at the axle's south end, the brake's shoe on its
 *     lever against the wheel, the tongue that clicks at every spoke;
 *   · the rack of twelve knobs west of the kiyor and the thin rods along its wall to the plugs; the basket of spigots;
 *   · six stone stations east of it (the engraved hands bright, the feet dark), their steps as the last level played;
 *   · the strip of earth before the paving with the channel he dug (the old trace dark), the conduit's cover slabs along z 57.5 from the
 *     Golah's room, the mouths with their wooden sluices, the basin of forty se'ah hewn in the rock (its line, its white stones), the spill
 *     to the pit, the drain's chute; the champion's seal.
 * The machine's moving parts read SH12.d (the descent, amot), SH12.ang (the wheel's turn), SH12.brake: an act sets them and holds them
 * (SH12.hold); else the kiyor rises back slowly by itself after a dry descent (the game's helper, spec work 2; not the morning's raising)
 * and stays down while st.sunk (after the finale).
 *   SH12 · own(k, on) · initWorld · frameWorld · restWorld · finalWorld · wallsAt12 · seatPose(n, yaw, pitch, d)
 */
import { BOOK } from '../world/grid.js';
import { box } from '../h131/world.js';
import { wallsAt11 } from '../h134/world.js';
import { mats12, kiyorGeo, spigotMesh, wheelMesh, slabMesh } from './look.js';
import { mounts } from './dadim-model.js';
import { createWater } from '../h129/water.js';

const S12 = BOOK.s12, F = S12.floor, K = S12.kiyor, MK = S12.mukhni, P = S12.pit;
export const CAV = -7.5, MASK = -5;
export const SH12 = { X: null, g: null, key: '', own: {}, M: null, d: 0, ang: 0, brake: 0, hold: false, refs: null, W: null, pitW: null, fieldTex: null };
export function own(k, on) { if (on) SH12.own[k] = 1; else delete SH12.own[k]; SH12.key = ''; }
const RAD = Math.PI / 180;

/** a seat's spigot pose in the world (the kiyor at descent d): position, and its rotation (yaw about y from the seat's bearing, pitch) */
export function seatPose(n, yaw = 0, pitch = 0, d = 0) {
  const s = S12.seats[n], mt = mounts(S12)[n] || 0;
  return { x: s.x, y: s.y - d, z: s.z, ry: -(s.bear + yaw) * RAD, rz: (pitch + mt) * RAD };
}
/** the cut's cavity material order: an opaque mesh drawn before the mask */
const cav = (m, k = 0) => { m.renderOrder = CAV + k * 0.01; return m; };
function inCut(m, k = 0) {
  const T = SH12.X.THREE, M = m.material; M.transparent = false; M.blending = T.CustomBlending; M.blendSrc = T.SrcAlphaFactor; M.blendDst = T.OneMinusSrcAlphaFactor; M.blendEquation = T.AddEquation;
  m.renderOrder = CAV + 0.5 + 0.2 * k; return m;
}

/* ───────── the pit and the basin (cut into the floor) ───────── */
function hole(X, D, bx, y0, mat, matF) {
  const [x0, z0, x1, z1] = bx, t = 0.3, Mt = mats12(X);
  cav(box(X, mat, x0 - t, y0, z0 - t, x1 + t, F - 0.002, z0, D));
  cav(box(X, mat, x0 - t, y0, z1, x1 + t, F - 0.002, z1 + t, D));
  cav(box(X, mat, x0 - t, y0, z0, x0, F - 0.002, z1, D));
  cav(box(X, mat, x1, y0, z0, x1 + t, F - 0.002, z1, D));
  cav(box(X, matF || mat, x0, y0 - 0.2, z0, x1, y0, z1, D));
  const T = X.THREE, mk = new T.Mesh(new T.PlaneGeometry(x1 - x0, z1 - z0), Mt.y12mask); mk.rotation.x = -Math.PI / 2; mk.position.set((x0 + x1) / 2, F + 0.001, (z0 + z1) / 2); mk.renderOrder = MASK; mk.name = 'h135-cut'; D.add(mk);
}
function pit(X, Mt, D, st) {
  hole(X, D, P.box, P.floor, Mt.y12pitWall, Mt.y12pitFloor);
  // the low stone rim round it (a wall for him)
  const [x0, z0, x1, z1] = P.box, h = P.rimH, t = P.rimT;
  for (const q of [[x0 - t, z0 - t, x1 + t, z0], [x0 - t, z1, x1 + t, z1 + t], [x0 - t, z0, x0, z1], [x1, z0, x1 + t, z1]]) box(X, Mt.y12stone, q[0], F, q[1], q[2], F + h, q[3], D).name = 'h135-pit-rim';
  // the water to the sink line (work 3 done)
  if (st.water || st.crews) {
    const T = X.THREE, W = SH12.W, m = W.surface({ kind: 'box', deep: '#0E3440', bed: '#8E8470', wall: '#B9AC94', alpha: 0.95, chop: 0.8, heave: 1, glint: 1.1 });
    m.uniforms.uBox.value.set((x0 + x1) / 2, (z0 + z1) / 2, (x1 - x0) / 2, (z1 - z0) / 2); m.uniforms.uRim.value = F - P.sink; m.uniforms.uDepth.value = P.sink - P.floor;
    const w = new T.Mesh(new T.PlaneGeometry(x1 - x0 - 0.02, z1 - z0 - 0.02, 12, 16), m); w.rotation.x = -Math.PI / 2; w.position.set((x0 + x1) / 2, P.sink, (z0 + z1) / 2); w.name = 'h135-pit-water'; D.add(inCut(w, 3));
    SH12.pitW = w;
  } else SH12.pitW = null;
}
function basin(X, Mt, D, st) {
  const B = S12.basin;
  hole(X, D, B.box, F - B.depth, Mt.y12stoneHard, Mt.y12stoneHard);
  const [x0, z0, x1, z1] = B.box;
  for (let i = 0; i < 5; i++) { const x = x0 + 0.2 + (i % 3) * 0.3, z = z0 + 0.25 + Math.floor(i / 3) * 0.4; cav(box(X, Mt.y12whiteStone, x - 0.08, F - B.depth, z - 0.06, x + 0.08, F - B.depth + 0.08, z + 0.06, D)); }
  // the line of forty se'ah, engraved at the top (Gemini, v7)
  cav(box(X, Mt.y12waterLine, x0 - 0.001, B.line - 0.015, z0, x0 + 0.004, B.line + 0.015, z1, D), 1);
  if (st.water || st.crews) {
    const T = X.THREE, m = SH12.W.surface({ kind: 'box', deep: '#164450', bed: '#E8E2D2', wall: '#9E968A', alpha: 0.9, chop: 0.5, heave: 1, glint: 1.2 });
    m.uniforms.uBox.value.set((x0 + x1) / 2, (z0 + z1) / 2, 0.5, 0.5); m.uniforms.uRim.value = F - B.line; m.uniforms.uDepth.value = B.depth;
    const w = new T.Mesh(new T.PlaneGeometry(0.98, 0.98, 4, 4), m); w.rotation.x = -Math.PI / 2; w.position.set((x0 + x1) / 2, B.line, (z0 + z1) / 2); D.add(inCut(w, 3));
  }
  // the spill: an open stone chute from the basin to the pit's rim; the drain's chute east of the basin
  const sp = S12.spill; box(X, Mt.y12stoneHard, sp.from[0] - 0.22, F, sp.to[1], sp.from[0] + 0.22, F + 0.06, sp.from[1], D).name = 'h135-spill';
  const dr = S12.drain; box(X, Mt.y12stoneHard, dr.at[0] - 0.5, F, dr.at[1] - 0.2, dr.to[0], F + 0.05, dr.at[1] + 0.2, D).name = 'h135-drain';
}

/* ───────── the kiyor, its seats and spigots ───────── */
let SEATG0 = null, HOLEG0 = null;
const SEATG = (T) => SEATG0 || (SEATG0 = (() => { const g = new T.CylinderGeometry(0.15, 0.17, 0.08, 14); g.rotateZ(Math.PI / 2); return g; })());
const HOLEG = (T) => HOLEG0 || (HOLEG0 = (() => { const g = new T.CircleGeometry(0.065, 12); g.rotateY(Math.PI / 2); return g; })());
function kiyor(X, Mt, st) {
  const T = X.THREE, g = new T.Group(); g.name = 'h135-kiyor';
  const geo = kiyorGeo(T), out = new T.Mesh(geo, Mt.y12copper), inn = new T.Mesh(geo, Mt.y12copperIn);
  out.castShadow = true; g.add(out); g.add(inn);
  const bot = new T.Mesh(new T.CircleGeometry(K.r0, 32), Mt.y12copperIn); bot.rotation.x = -Math.PI / 2; bot.position.y = 0.05; g.add(bot);
  const lip = new T.Mesh(new T.TorusGeometry(K.r1, 0.06, 6, 40), Mt.y12copper); lip.rotation.x = Math.PI / 2; lip.position.y = K.h; g.add(lip);
  // the sun ring and the moon ring, engraved inside (ChatGPT): the morning's full level and the evening's
  const rIn = (y) => K.r0 + (K.r1 - K.r0) * Math.pow((y - K.y0) / K.h, 1.4) - 0.02;
  for (const [y, m] of [[S12.rings.sun, Mt.y12ring], [S12.rings.moon, Mt.y12ringMoon]]) { const r = new T.Mesh(new T.TorusGeometry(rIn(y), 0.025, 4, 48), m); r.rotation.x = Math.PI / 2; r.position.y = y - K.y0; g.add(r); }
  // the water inside (full to the sun ring by day; the evening's to the moon ring is the act's)
  const wm = new T.MeshStandardMaterial({ color: '#3E7E8C', roughness: 0.05, metalness: 0.1, transparent: true, opacity: 0.8 });
  const water = new T.Mesh(new T.CircleGeometry(rIn(S12.rings.sun), 40), wm); water.rotation.x = -Math.PI / 2; water.position.y = S12.rings.sun - K.y0; water.name = 'h135-kiyor-water'; water.renderOrder = 4; g.add(water);
  g.userData.water = water; g.userData.rIn = rIn;
  // the two lugs the chains hold (spec v8 §13a: copper bars from the lip in to z ±1.9, right under the drum's grooves, and a ring)
  for (const cz of MK.chains.z) { const dz = cz - K.z, sg = Math.sign(dz), Lb = K.r1 - Math.abs(dz) + 0.1, bar = new T.Mesh(new T.BoxGeometry(0.12, 0.08, Lb), Mt.y12copper); bar.position.set(0, K.h + 0.04, dz + (sg * (K.r1 - Math.abs(dz))) / 2); g.add(bar); const ring = new T.Mesh(new T.TorusGeometry(0.12, 0.035, 6, 12), Mt.y12copper); ring.rotation.y = Math.PI / 2; ring.position.set(0, K.h + 0.16, dz); g.add(ring); }
  // the bands of the casting (the look: a thick foot ring, two raised bands, the rim rolled out — המחשה)
  const rAt = (k) => K.r0 + (K.r1 - K.r0) * Math.pow(k, 1.4);
  for (const [k, t] of [[0.02, 0.09], [0.33, 0.035], [0.93, 0.04]]) { const b = new T.Mesh(new T.TorusGeometry(rAt(k) + 0.01, t, 6, 40), Mt.y12copper); b.rotation.x = Math.PI / 2; b.position.y = k * K.h; b.castShadow = true; g.add(b); }
  // the twelve seats: a round copper collar on the wall each, its socket dark
  for (const s of S12.seats) {
    const a = s.bear * RAD, sm = new T.Mesh(SEATG(T), Mt.y12brass); sm.position.set(s.x - K.x + Math.cos(a) * 0.02, s.y - K.y0, s.z - K.z + Math.sin(a) * 0.02); sm.rotation.y = -a; g.add(sm);
    const ho = new T.Mesh(HOLEG(T), Mt.y12socket); ho.position.copy(sm.position); ho.position.x += Math.cos(a) * 0.045; ho.position.z += Math.sin(a) * 0.045; ho.rotation.y = -a; g.add(ho);
    if ((st.flaws || []).some((x) => x.f === 'dadim.scratch' && x.at === s.n)) { const sc = new T.Mesh(new T.BoxGeometry(0.02, 0.2, 0.05), Mt.y12scratch); sc.position.copy(sm.position); sc.position.x += Math.cos(a) * 0.09; sc.position.z += Math.sin(a) * 0.09; sc.rotation.y = -a + 0.5; sc.name = 'h135-scratch'; g.add(sc); }
  }
  // the dents (work 2): a dark patch low on the wall, one for each, round its foot
  let nd = 0; for (const x of st.flaws || []) if (x.f === 'mukhni.dent') { const a = (200 + nd * 47) * RAD; const dm = new T.Mesh(new T.CircleGeometry(0.16, 10), Mt.y12dent); dm.position.set(Math.cos(a) * (K.r0 + 0.06), 0.4 + (nd % 3) * 0.3, Math.sin(a) * (K.r0 + 0.06)); dm.lookAt(Math.cos(a) * 9, dm.position.y, Math.sin(a) * 9); dm.name = 'h135-dent'; g.add(dm); nd++; }
  g.position.set(K.x, K.y0, K.z);
  return g;
}
function spigots(X, Mt, g, st, skip) {
  const T = X.THREE;
  for (const [k, p] of Object.entries(st.spigots || {})) {
    if (skip && skip(+k)) continue;
    const s = S12.seats[+k]; if (!s) continue;
    const m = spigotMesh(X), q = seatPose(+k, p.yaw || 0, p.pitch || 0, 0);
    m.position.set(q.x - K.x, q.y - K.y0, q.z - K.z); m.rotation.set(0, q.ry, q.rz, 'YZX'); m.name = 'h135-spigot-' + k; g.add(m);
  }
  void T;
}

/* ───────── the mukhni ───────── */
function mukhni(X, Mt, D) {
  const T = X.THREE, R = {}, x = MK.x, [pz0, pz1] = MK.posts, w = MK.postW / 2, AX = MK.axle.y, WZ = MK.wheel.z;
  // the two posts on the pit's stone rim, a little over the axle; the double arm: two pairs of diagonal beams from each post to the axle
  for (const z of [pz0, pz1]) box(X, Mt.y12wood, x - w, F, z - w, x + w, AX + 0.6, z + w, D).name = 'h135-post';
  const beam = (a, b, t = 0.16) => { const A = new T.Vector3(...a), B = new T.Vector3(...b), L = A.distanceTo(B), m = new T.Mesh(new T.BoxGeometry(t, L, t), Mt.y12wood); m.position.copy(A).lerp(B, 0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.clone().sub(A).normalize()); m.castShadow = true; D.add(m); return m; };
  for (const [z, s] of [[pz0, 1], [pz1, -1]]) for (const dx of [-0.24, 0.24]) beam([x + dx, MK.arm.y0, z + s * w], [x + dx, AX - 0.15, z + s * 2.6]);
  // the axle (it turns: its own group), the drum on it over the kiyor, the vertical wheel beyond the south post
  const axle = new T.Group(); axle.position.set(x, AX, 0); D.add(axle); R.axle = axle;
  const ag = new T.CylinderGeometry(MK.axle.r, MK.axle.r, MK.axle.z1 - MK.axle.z0, 10); ag.rotateX(Math.PI / 2);
  const am = new T.Mesh(ag, Mt.y12woodD); am.position.z = (MK.axle.z0 + MK.axle.z1) / 2; am.castShadow = true; axle.add(am);
  const drum = new T.Mesh((() => { const g = new T.CylinderGeometry(1, 1, MK.drum.L, 16); g.rotateX(Math.PI / 2); return g; })(), Mt.y12woodL); drum.position.z = MK.drum.z; drum.scale.set(MK.drum.rDraw, MK.drum.rDraw, 1); axle.add(drum); R.drum = drum;
  // (spec v8 §12b, §13a: two separate grooves, north at z 18.1 and south at z 21.9, one chain in each, wound in ONE layer, coil beside coil: the
  // radius stays, every turn pays out one amah of each chain, the kiyor never tilts. Eleven coils a groove: nine turns and two spare.
  // As it pays out, the coils get fewer: a progress gauge without numbers.)
  R.wound = [];
  // (§14: the groove's pitch 0.12, eleven coils over 1.32 of z; the chain leaves the drum at the last coil still wound, so its exit
  // walks along the groove as it pays out — up to 0.66 to a side; both grooves the same hand, so both chains move together)
  MK.chains.grooves.forEach(([g0, g1]) => {
    for (const e of [g0 - 0.03, g1 + 0.03]) { const f = new T.Mesh(new T.CylinderGeometry(0.36, 0.36, 0.05, 16), Mt.y12wood); f.rotation.x = Math.PI / 2; f.position.z = e; axle.add(f); }
    for (let i = 0; i < MK.chains.coils; i++) { const r = new T.Mesh(new T.TorusGeometry(MK.drum.rDraw + 0.02, 0.04, 5, 16), Mt.y12copper); r.position.z = g0 + MK.chains.pitch * (i + 0.5); axle.add(r); R.wound.push(r); r.userData.i = i; }
  });
  for (const dz of [-MK.drum.L / 2, MK.drum.L / 2]) { const f = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.08, 16), Mt.y12wood); f.rotation.x = Math.PI / 2; f.position.z = MK.drum.z + dz; axle.add(f); }
  const wheel = new T.Group(); wheel.position.z = WZ; axle.add(wheel); R.wheel = wheel;
  const wm = wheelMesh(X, MK.wheel.r, MK.wheel.spokes); wm.rotation.x = Math.PI / 2; wheel.add(wm);
  // (the handles on its rim, as in the picture)
  for (let i = 0; i < MK.wheel.handles; i++) { const a = (i / MK.wheel.handles) * Math.PI * 2 + 0.2, hm = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.6, 6), Mt.y12woodD); hm.rotation.x = Math.PI / 2; hm.position.set(Math.cos(a) * (MK.wheel.r + 0.02), Math.sin(a) * (MK.wheel.r + 0.02), 0.32); wheel.add(hm); }
  // the two copper chains (their length and lean set each frame: pose())
  R.chains = MK.chains.z.map((cz, i) => { const seg = () => { const m = new T.Mesh(new T.CylinderGeometry(0.045, 0.045, 1, 6), Mt.y12copper); m.castShadow = true; D.add(m); return m; }; return { userData: { cz, side: i ? 1 : -1 }, a: seg(), b: seg(), c: seg() }; });
  // (§15a: under each groove a wooden guide ring fixed to the arm, at y 27.8 right over its lug: above it the chain walks with the coil,
  // under it it hangs plumb all the way)
  for (const cz of MK.chains.z) { const gr = new T.Mesh(new T.TorusGeometry(0.17, 0.07, 8, 14), Mt.y12woodD);   // (§16: a wide, rounded guide ring — the chain enters it without rubbing or catching)
    gr.rotation.x = Math.PI / 2; gr.position.set(MK.x, MK.chains.guideY, cz); D.add(gr); box(X, Mt.y12woodD, MK.x - 0.05, MK.chains.guideY - 0.04, cz - 0.05, MK.x + 0.95, MK.chains.guideY + 0.04, cz + 0.05, D); }
  // the brake: its post, the lever on its pivot, the shoe on the wheel's rim from outside (east), the handle out of the rim
  const z = MK.brake.z, [pvx, pvy] = MK.brake.pivot, [shx, shy] = MK.brake.shoe, [hx, hy] = MK.brake.handle;
  box(X, Mt.y12wood, pvx - 0.15, F, z - 0.15, pvx + 0.15, pvy, z + 0.15, D).name = 'h135-brake-post';
  const lever = new T.Group(); lever.position.set(pvx, pvy, z); D.add(lever); R.lever = lever;
  const seg = (a, b, t = 0.16) => { const A = new T.Vector3(a[0] - pvx, a[1] - pvy, 0), B = new T.Vector3(b[0] - pvx, b[1] - pvy, 0), L = A.distanceTo(B), m = new T.Mesh(new T.BoxGeometry(t, L, t), Mt.y12woodD); m.position.copy(A).lerp(B, 0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.clone().sub(A).normalize()); m.castShadow = true; lever.add(m); return m; };
  seg([pvx, pvy], [shx + 0.2, shy]); seg([pvx, pvy], [hx, hy]);
  const shoe = new T.Mesh(new T.BoxGeometry(0.24, 0.9, 0.36), Mt.y12woodD); shoe.position.set(shx + 0.12 - pvx, shy - pvy, 0); lever.add(shoe); R.shoe = shoe; shoe.userData.x0 = shoe.position.x;
  const knob = new T.Mesh(new T.SphereGeometry(0.32, 12, 8), Mt.y12woodL); knob.position.set(hx - pvx, hy - pvy, 0); lever.add(knob); R.knob = knob;
  // the wooden platform by the wheel and its stairs from the west (spec v8 §13b; wood only, no iron — המחשה)
  { const [px0, pz0, px1, pz1] = MK.platform.box, PY = MK.platform.y;
    box(X, Mt.y12wood, px0, PY - 0.25, pz0, px1, PY, pz1, D).name = 'h135-platform';
    for (const [lx, lz] of [[px0 + 0.2, pz0 + 0.2], [px1 - 0.2, pz0 + 0.2], [px0 + 0.2, pz1 - 0.2], [px1 - 0.2, pz1 - 0.2]]) box(X, Mt.y12woodD, lx - 0.17, F, lz - 0.17, lx + 0.17, PY - 0.25, lz + 0.17, D);
    for (const zz of [pz0 + 0.05, pz1 - 0.05]) box(X, Mt.y12woodD, px0 + 0.4, PY, zz - 0.05, px1, PY + 1.1, zz + 0.05, D);   // (the rails)
    const [sx0, sz0, sx1, sz1] = MK.stairs.box, n = 18;
    for (let i = 0; i < n; i++) { const xa = sx0 + ((sx1 - sx0) * i) / n, xb = sx0 + ((sx1 - sx0) * (i + 1)) / n, y = F + ((PY - F) * (i + 1)) / n; box(X, Mt.y12woodL, xa, y - 0.12, sz0 + 0.3, xb + 0.02, y, sz1 - 0.3, D); }
    for (const zz of [sz0 + 0.3, sz1 - 0.42]) { const L = Math.hypot(sx1 - sx0, PY - F), st = new T.Mesh(new T.BoxGeometry(L, 0.3, 0.12), Mt.y12woodD); st.position.set((sx0 + sx1) / 2, (F + PY) / 2 - 0.2, zz + 0.06); st.rotation.z = Math.atan2(PY - F, sx1 - sx0); D.add(st); } }
  // the tongue: a thin flexible stick on the south post whose tip the spokes pass (spec: it only sounds, it never locks)
  const [tx, ty, tz] = MK.tongue, tg = new T.Group(); tg.position.set(tx, ty, tz); D.add(tg); R.tongue = tg;
  const tm = new T.Mesh(new T.BoxGeometry(0.9, 0.05, 0.05), Mt.y12woodL); tm.position.x = -0.45; tg.add(tm);
  return R;
}
function rack(X, Mt, D) {
  const T = X.THREE, [rx, rz] = S12.rack.at, y = S12.rack.y, r = S12.rack.r, knobs = [];
  box(X, Mt.y12wood, rx - 0.12, F, rz - 0.12, rx + 0.12, y, rz + 0.12, D).name = 'h135-rack';
  box(X, Mt.y12wood, rx - 0.15, y - 0.08, rz - r - 0.15, rx + 0.15, y + 0.06, rz + r + 0.15, D);
  for (let i = 0; i < 12; i++) {
    const a = Math.PI * (0.05 + (0.9 * i) / 11), kx = rx - Math.sin(a) * 0.12, kz = rz - Math.cos(a) * r;
    const k = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 0.12, 10), Mt.y12woodL); k.position.set(kx, y + 0.12, kz); k.castShadow = true; D.add(k); knobs.push(k);
    // the rod along the kiyor's wall to its seat's plug (thin and light)
    const s = S12.seats[i], A = new T.Vector3(kx, y + 0.12, kz), B = new T.Vector3(s.x, s.y + 0.12, s.z), mid = A.clone().lerp(B, 0.5); mid.y = Math.max(A.y, B.y) + 0.3;
    const c = new T.QuadraticBezierCurve3(A, mid, B), rod = new T.Mesh(new T.TubeGeometry(c, 10, 0.012, 4, false), Mt.y12woodL); rod.name = 'h135-rod'; D.add(rod); knobs[i].userData.rod = rod;
  }
  return knobs;
}
function stations(X, Mt, D, lv) {
  const out = [];
  for (const st of S12.stations) { const g = slabMesh(X, st, lv); g.name = 'h135-station-' + st.i; D.add(g); out.push(g); }
  return out;
}
/** the strip of earth (its old channels dark), the conduit's cover slabs, the mouths with their sluices */
function field(X, Mt, D, st) {
  const T = X.THREE, Fd = S12.field;
  if (!SH12.own.field) {
    const tex = traceTex(T, st.trace), m = new T.MeshStandardMaterial({ color: '#ffffff', map: tex, roughness: 1 });
    const p = new T.Mesh(new T.PlaneGeometry(Fd.x1 - Fd.x0, Fd.z1 - Fd.z0), m); p.rotation.x = -Math.PI / 2; p.position.set((Fd.x0 + Fd.x1) / 2, F + 0.012, (Fd.z0 + Fd.z1) / 2); p.receiveShadow = true; p.name = 'h135-field'; D.add(p);
  }
  const C = S12.golah.conduit, n = Math.floor((C.x1 - C.x0) / 1.5);
  for (let i = 0; i < n; i++) { const x = C.x0 + i * 1.5; box(X, Mt.y12stoneD, x + 0.04, F, C.z - C.w / 2, x + 1.46, F + 0.02, C.z + C.w / 2, D); }
  for (const [k, p] of [['mouth1', S12.golah.mouth1], ['mouth2', S12.golah.mouth2]]) {
    const g = new T.Group(); g.name = 'h135-' + k; D.add(g);
    box(X, Mt.y12stone, p[0] - 0.7, F, p[1] - 0.4, p[0] + 0.7, F + 0.5, p[1] + 0.4, g);
    const gate = box(X, Mt.y12woodD, p[0] - 0.45, F + 0.1, p[1] - 0.55, p[0] + 0.45, F + 0.75, p[1] - 0.45, g); gate.name = 'h135-sluice-' + k;
  }
}
/** the strip's earth as a canvas: soft deterministic speckles, the old channels dark (the trace of the last night) */
export function traceTex(T, trace, size = 4) {
  const Fd = S12.field, NX = Math.round((Fd.x1 - Fd.x0) / Fd.cell), NZ = Math.round((Fd.z1 - Fd.z0) / Fd.cell);
  const c = document.createElement('canvas'); c.width = NX * size; c.height = NZ * size; const g = c.getContext('2d');
  g.fillStyle = '#8A6B4A'; g.fillRect(0, 0, c.width, c.height);
  let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  for (let i = 0; i < NX * NZ * 2; i++) { g.fillStyle = rnd() < 0.5 ? 'rgba(60,40,22,0.18)' : 'rgba(170,140,100,0.18)'; g.fillRect(rnd() * c.width, rnd() * c.height, 2 + rnd() * 3, 2 + rnd() * 3); }
  if (trace && trace.cells) { g.fillStyle = 'rgba(52,36,22,0.75)'; for (const k of trace.cells) { const i = k % NX, j = (k / NX) | 0; g.fillRect(i * size, j * size, size, size); } }
  const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
}
function champion(X, Mt, D, won) {
  const [x, z] = S12.champion; box(X, Mt.y12stone, x - 0.6, F, z - 0.6, x + 0.6, F + 1.4, z + 0.6, D).name = 'h135-seal';
  if (won) { const T = X.THREE, c = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.12, 20), Mt.y12gold); c.position.set(x, F + 1.48, z); D.add(c); }
}
function clear(G) { while (G.children.length) { const c = G.children[0]; G.remove(c); c.traverse && c.traverse((o) => { if (o.geometry && o.geometry !== (SH12.X && SH12.X.props.geo.box)) { try { o.geometry.dispose(); } catch (e) { /* */ } } if (o.material && o.material.map && o.material.map.isCanvasTexture) { try { o.material.map.dispose(); } catch (e) { /* */ } } }); } }
const lvShown = (M) => Math.max(1, Math.min(3, (M.levelsDone && M.levelsDone('dadim')) || 1));
function sync(X, M) {
  if (!SH12.g || !M) return;
  const st = M.st, own = SH12.own;
  const key = JSON.stringify([st.done, st.spigots, st.trace ? st.trace.cells.length : 0, st.water, st.crews, st.flaws.length, Object.keys(own), lvShown(M), st.champion, st.sunk]);
  if (key === SH12.key) return; SH12.key = key;
  const D = SH12.g, Mt = mats12(X); clear(D);
  if (!SH12.W) SH12.W = createWater(X.THREE);
  pit(X, Mt, D, st);
  const kg = kiyor(X, Mt, st); D.add(kg); cav(kg.children[0], 3);
  kg.traverse((o) => { if (o.isMesh && o.renderOrder === 0) o.renderOrder = CAV + 0.03; });
  inCut(kg.userData.water, 2);
  if (!own.spigots) spigots(X, Mt, kg, st, own.spigotsSkip);
  const R = mukhni(X, Mt, D); R.kiyor = kg;
  R.knobs = own.rack ? [] : rack(X, Mt, D);
  R.stations = own.stations ? [] : stations(X, Mt, D, lvShown(M));
  if (!own.basket) { const [bx, bz] = S12.basket, T = X.THREE, b = new T.Mesh(new T.CylinderGeometry(0.42, 0.32, 0.36, 12), Mt.y10wood || Mt.y12wood); b.position.set(bx, F + 0.18, bz); b.castShadow = true; b.name = 'h135-basket'; D.add(b); }
  field(X, Mt, D, st);
  basin(X, Mt, D, st);
  champion(X, Mt, D, !!st.champion);
  SH12.refs = R;
  pose();
}
/** the machine at SH12.d / SH12.ang / SH12.brake */
function pose() {
  const R = SH12.refs; if (!R) return;
  const d = SH12.d;
  if (R.kiyor) { R.kiyor.position.y = K.y0 - d; R.kiyor.rotation.z = SH12.sway || 0; }
  if (R.axle) R.axle.rotation.z = -SH12.ang;
  const nW = 2 + 9 * Math.max(0, 1 - d / K.travel);   // (the coils still wound, continuous)
  if (R.wound) { const n = Math.round(nW); for (const r of R.wound) r.visible = r.userData.i < n; }
  if (R.shoe) R.shoe.position.x = R.shoe.userData.x0 - 0.12 * SH12.brake;
  // (the chain: from its groove's side of the drum down to its lug; two links of the drawing so that a slack chain bows out — spec v8:
  // the chains go taut and slack and the kiyor trembles a little as the load changes)
  if (R.chains && R.kiyor) for (const c of R.chains) {
    const T = SH12.X.THREE, sd = c.userData.side, top = new T.Vector3(MK.x, MK.axle.y - MK.drum.rDraw, MK.chains.grooves[sd < 0 ? 0 : 1][0] + MK.chains.pitch * (nW - 0.5));
    const sw = SH12.sway || 0, hl = K.h + 0.16, bot = new T.Vector3(MK.x - hl * Math.sin(sw), K.y0 - d + hl * Math.cos(sw), c.userData.cz);
    const gd = new T.Vector3(MK.x, MK.chains.guideY, c.userData.cz);
    const sl = Math.max(0, Math.min(1, SH12.slack || 0)), mid = gd.clone().lerp(bot, 0.5); mid.x += sd * sl * 0.45; mid.z += sd * sl * 0.2; mid.y -= sl * 0.25;
    const put = (m, p, q) => { m.position.copy(p).lerp(q, 0.5); m.scale.set(1, Math.max(0.01, p.distanceTo(q)), 1); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), p.clone().sub(q).normalize()); };
    put(c.a, top, gd); put(c.b, gd, mid); put(c.c, mid, bot);
  }
  if (R.kiyor && R.kiyor.userData.water) R.kiyor.userData.water.visible = !SH12.own.kiyorWater && (SH12.d < 0.05 || SH12.own.kiyorFull);
}

/* ───────── the walls ───────── */
const inB = (b, x, z, m = 0) => x > b[0] - m && x < b[2] + m && z > b[1] - m && z < b[3] + m;
const BLOCKS = () => {
  const [x0, z0, x1, z1] = P.box, t = P.rimT, r = S12.rack;
  return [[x0 - t, z0 - t, x1 + t, z1 + t], [r.at[0] - 0.3, r.at[1] - r.r - 0.2, r.at[0] + 0.3, r.at[1] + r.r + 0.2], S12.basin.box, [S12.champion[0] - 0.6, S12.champion[1] - 0.6, S12.champion[0] + 0.6, S12.champion[1] + 0.6],
    ...MK.posts.map((pz) => [MK.x - 0.3, pz - 0.3, MK.x + 0.3, pz + 0.3]), [MK.brake.pivot[0] - 0.15, MK.brake.z - 0.15, MK.brake.pivot[0] + 0.15, MK.brake.z + 0.15]];
};
/** the floor on the platform and up its stairs (stages.floorHook); elsewhere the floor laid before */
const PREV = { f: null, busy: false };
export function floorAt12(x, z) {
  const Pf = MK.platform, Sb = MK.stairs.box;
  if (inB(Pf.box, x, z)) return Pf.y;
  if (inB(Sb, x, z)) return S12.floor + ((Pf.y - S12.floor) * Math.max(0, Math.min(1, (x - Sb[0]) / (Sb[2] - Sb[0]))));
  if (!PREV.f || PREV.busy) return null;   // (a guard: stage 11's hook may hold this one as its own "before")
  PREV.busy = true; try { return PREV.f(x, z); } finally { PREV.busy = false; }
}
function floorSet(X) {
  const S0 = X.stages; if (!S0 || !S0.floorHook) return;
  try { const cur = S0.floorHookOf ? S0.floorHookOf() : null; if (cur && cur !== floorAt12) PREV.f = cur; } catch (e) { /* */ }
  S0.floorHook(floorAt12);
}
/** the pit (its rim), the rack, the basin, the seal, the posts and the brake's post are walls; the platform is one but from its stairs;
 *  stage 11's first */
export function wallsAt12(x, z, x0, z0) {
  try { if (wallsAt11(x, z, x0, z0)) return true; } catch (e) { /* */ }
  for (const b of BLOCKS()) if (inB(b, x, z, 0.18) && !inB(b, x0, z0, 0.18)) return true;
  const Pb = MK.platform.box, Sb = MK.stairs.box, onP = (a, c) => inB(Pb, a, c) || inB(Sb, a, c);
  if (onP(x, z) !== onP(x0, z0) && !(inB(Sb, x, z) && x < Sb[0] + 0.8) && !(inB(Sb, x0, z0) && x0 < Sb[0] + 0.8)) return true;   // (on and off only at the stairs' foot)
  return false;
}
function wallsSet(X) { try { const h = X.stages && X.stages.hero; if (h && h.twinExtra) h.twinExtra(wallsAt12); } catch (e) { /* */ } }
function modelHide(X) { try { if (X.stages.stageOwn) X.stages.stageOwn('kiyor', true); } catch (e) { /* */ } }
function build(X) { const g = new X.THREE.Group(); g.name = 'h135-site'; X.props.root.add(g); SH12.g = g; }

export function initWorld(X) {
  mats12(X); SH12.X = X; SH12.M = X.M;
  try { window.__H135_SH = SH12; } catch (e) { /* (the probes' eyes) */ }
  modelHide(X); floorSet(X); wallsSet(X);
  if (!SH12.g) build(X);
  if (X.M && X.M.st && X.M.st.sunk) SH12.d = K.travel;
  SH12.key = ''; sync(X, X.M);
}
let jT = 0;
export function frameWorld(dt, X, loop) {
  if (!SH12.X) return; SH12.M = X.M;
  const now = performance.now(); if (loop && now - (SH12.lastF || 0) < 80) return; if (!loop) SH12.lastF = now;
  jT -= dt; if (jT <= 0) { jT = 0.4; modelHide(X); floorSet(X); wallsSet(X); sync(X, X.M); }
  // (no act holds the machine: the kiyor rises back slowly after a descent, or stays down while it is sunk for the night)
  if (!SH12.hold) {
    const st = X.M && X.M.st, want = st && st.sunk ? K.travel : 0;
    if (Math.abs(SH12.d - want) > 1e-3) { const v = 0.6 * dt, dd = Math.max(-v, Math.min(v, want - SH12.d)); SH12.d += dd; SH12.ang += dd * Math.PI * 2; }
    SH12.brake = Math.max(0, SH12.brake - dt * 2);
  }
  if (SH12.W) SH12.W.tick(dt);
  pose();
}
export function restWorld(X, M) { mats12(X); SH12.X = X; SH12.M = M; modelHide(X); floorSet(X); wallsSet(X); if (!SH12.g) build(X); if (M && M.st && M.st.sunk) SH12.d = K.travel; SH12.key = ''; sync(X, M); try { if (!SH12.tick) { SH12.tick = true; const go = () => { try { frameWorld(1 / 60, SH12.X, true); } catch (e) { /* */ } if (SH12.restLoop) requestAnimationFrame(go); }; SH12.restLoop = true; requestAnimationFrame(go); } } catch (e) { /* */ } }
export function finalWorld(X) { if (!SH12.X) return; SH12.key = ''; sync(X, X.M); }
export { pose };
