/* ── build 120 ── h120/world.js — the things of stage 05 in the world, drawn from the save on a beat (as h113/world.js): the ten
 * columns in their states (on the cradle, rising in a crew's hands, standing with the lean, wedges, chip or crack the save keeps),
 * the fourteen main beams (seated, with a shim), the corbels in the walls, the joists, the planks and the railing once laid, the
 * ladders, the props under a creaking bay; the carpenters' yard (trestles, the stock, the offcut heap, the heap of short beams, the
 * bench, two sawyers who really cut); the lepers' chamber (the rock-cut basin, its steps and rod, the water as high as the save has it,
 * the three hollows with their clay plugs, the plasterers' trough and the jars, the lime pit, the plasterers at the basin, the
 * channels); the site (scaffolds on the chambers' walls with their masons, stone piles, the sledge and the ox cart on their lane
 * through the east gate); the crews' schedule from crewUnits; the goal chip "מפתחים n/14".
 * The model's own gallery and basin (temple.js set 'nashim-gz') are hidden while this world draws the player's (never both).
 * Every place is a fixed table (rule 56); every size of the gallery comes from layout.js.
 */
import { H120, Y, COLS, COL_IDS, BEAMS, BEAM_OF, RUNS, LADDERS, MIK, BAYS, bayDir, joistsOf, vesselsOf } from './model.js';
import { h120Ladder } from '../../temple.js';
import { floorY, floorMesh, grooveMesh, basinWater, pool, carveUnder, tick as waterTick } from './water120.js';
import { createBeat, createGang, clamp, lerp, ease, camAt } from '../h109/kit.js';

export const SH5 = { final: 0, X: null, B: null, crew: null, cols: {}, colKey: {}, own: {}, beamsG: null, beamKey: '', gal: null, galKey: '', yard: null, ch: null, chKey: '', site: null,
  amb: [], ambKey: '', chip: null, film: null, labels: [], busy: 0, rise: {}, stood: null, t: 0, saw: null, lane: null, hideKey: '' };
const F = H120.FINGER, TAU = Math.PI * 2;

/* ───────── fixed places (amot; rule 56): one table in routes.js, read by the world, the acts and the tests ───────── */
import { YARD, SCAFF, PILES, LANE, LIME, LANE_L, laneAt, laneState, laneAdvance } from './routes.js';
export { YARD, SCAFF, PILES, LANE, LIME, laneState };
/** where a broken column's halves lie (the stone pile by the east gate) */
const BROKE_AT = [110.5, -18.5];

/* ───────── materials (the stage's own: rule "no M.stone") ───────── */
export function mats(X) {
  const P = X.props, T = X.THREE;
  if (P.M.h5marble) return P.M;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, ...o });
  P.M.h5marble = std('#EDE6D6', { roughness: 0.45, flatShading: false });
  P.M.h5lime = std('#D9CAA6', { roughness: 0.9 });
  P.M.h5limeD = std('#C2B08A', { roughness: 0.92 });
  P.M.h5cedar = std('#A8743E', { roughness: 0.8 });
  P.M.h5cedarL = std('#BE8A50', { roughness: 0.8 });
  P.M.h5cedarD = std('#7C5230', { roughness: 0.85 });
  P.M.h5bronze = std('#B07A3A', { roughness: 0.35, metalness: 0.7, flatShading: false });
  P.M.h5lead = std('#8E9298', { roughness: 0.5, metalness: 0.5 });
  P.M.h5plaster = std('#E4DED0', { roughness: 0.95 });
  P.M.h5plasterW = std('#A9A496', { roughness: 0.6 });   // (under water: darker)
  P.M.h5clay = std('#B8784C', { roughness: 0.85 });
  P.M.h5plug = std('#8A5A36', { roughness: 0.95 });
  P.M.h5white = std('#F4F1E8', { roughness: 1 });
  P.M.h5ox = std('#8A6A4E', { roughness: 0.9 });
  P.M.h5water = new T.MeshStandardMaterial({ color: '#4E8FA0', roughness: 0.08, metalness: 0.15, transparent: true, opacity: 0.82, depthWrite: false });
  P.M.h5dark = new T.MeshBasicMaterial({ color: 0x2A2016 });
  P.M.h5groove = new T.MeshBasicMaterial({ color: 0x5E5240, transparent: true, opacity: 0.75, depthWrite: false });
  P.M.h5green = new T.MeshBasicMaterial({ color: 0x4FC46A, transparent: true, opacity: 0.85, depthWrite: false });
  P.M.h5gold = new T.MeshBasicMaterial({ color: 0xFFD86A, transparent: true, opacity: 0.5, depthWrite: false, side: T.DoubleSide });
  P.M.h5rope = P.M.rope || std('#C9A46A', { roughness: 0.95 });
  return P.M;
}
/** a box from x0..x1, y0..y1, z0..z1 (amot, world, or the parent's frame) */
export function box(X, mat, x0, y0, z0, x1, y1, z1, parent) {
  const m = new X.THREE.Mesh(X.props.geo.box, mat); m.scale.set(Math.max(1e-3, Math.abs(x1 - x0)), Math.max(1e-3, Math.abs(y1 - y0)), Math.max(1e-3, Math.abs(z1 - z0))); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = true; m.receiveShadow = true; (parent || X.props.root).add(m); return m;
}
/** many boxes of one material as one instanced mesh: L [[x0, y0, z0, x1, y1, z1]…] */
function inst(X, mat, L, all) {
  const T = X.THREE; if (!L.length) return null;
  const m = new T.InstancedMesh(X.props.geo.box, mat, L.length), M4 = new T.Matrix4(), q = new T.Quaternion(), p = new T.Vector3(), s = new T.Vector3();
  L.forEach((b, i) => { p.set((b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2); s.set(Math.abs(b[3] - b[0]), Math.abs(b[4] - b[1]), Math.abs(b[5] - b[2])); M4.compose(p, q, s); m.setMatrixAt(i, M4); });
  m.castShadow = true; m.receiveShadow = true; X.props.root.add(m); if (all) all.push(m); return m;
}
function cyl(X, mat, x, y0, z, r0, r1, h, seg = 12, parent) { const T = X.THREE, m = new T.Mesh(new T.CylinderGeometry(r1, r0, h, seg), mat); m.position.set(x, y0 + h / 2, z); m.castShadow = true; m.receiveShadow = true; (parent || X.props.root).add(m); return m; }
const drop = (X, all) => { for (const o of all) { X.props.remove(o); if (o.isInstancedMesh) o.dispose && o.dispose(); } all.length = 0; };

/* ───────── a column's frame: its foot, the way it lies (along, away from the neighbour) and the court's side (across) ───────── */
export function colFrame(id) {
  const c = COLS[id]; let along = null;
  for (const lv of [1, 2, 3]) if (BAYS[lv].col === id) along = bayDir(lv);
  if (!along) along = c.side === 'E' ? [0, 1] : [1, 0];
  const across = c.side === 'S' ? [0, -1] : c.side === 'N' ? [0, 1] : [-1, 0];
  return { c, x: c.x, z: c.z, along, across };
}
/** the column's axis for angle θ (degrees from the floor, lying toward `along`), or standing with a lean (fingers at the top) */
export function colAxis(X, fr, th, lean) {
  const T = X.THREE;
  if (th >= 89.999 && lean) { const la = (+lean[0] || 0) * F, lc = (+lean[1] || 0) * F; return new T.Vector3(fr.along[0] * la + fr.across[0] * lc, H120.COL_H, fr.along[1] * la + fr.across[1] * lc).normalize(); }
  const r = th * Math.PI / 180; return new T.Vector3(fr.along[0] * Math.cos(r), Math.sin(r), fr.along[1] * Math.cos(r)).normalize();
}
/** a column: its plinth (fixed), and the shaft on a pivot at the foot. o: { th, lean, off, wedges, chip, crack, cradle, mark } */
export function colMesh(X, id, o = {}) {
  const T = X.THREE, M = mats(X), fr = colFrame(id), g = new T.Group(); g.name = 'h120-col-' + id;
  const pw = H120.PLINTH_W / 2;
  const plinth = box(X, M.h5lime, fr.x - pw, H120.FLOOR, fr.z - pw, fr.x + pw, Y.PLINTH_TOP, fr.z + pw, g);
  const off = o.off || [0, 0], fx = fr.x + (fr.along[0] * off[0] + fr.across[0] * off[1]) * F, fz = fr.z + (fr.along[1] * off[0] + fr.across[1] * off[1]) * F;
  const piv = new T.Group(); piv.position.set(fx, Y.PLINTH_TOP, fz); g.add(piv);
  const sg = new T.CylinderGeometry(H120.R1, H120.R0, H120.COL_H - 0.3, 20); sg.translate(0, (H120.COL_H - 0.3) / 2, 0);
  const shaft = new T.Mesh(sg, M.h5marble); shaft.castShadow = true; shaft.receiveShadow = true; piv.add(shaft);
  const cap = box(X, M.h5marble, -0.62, H120.COL_H - 0.3, -0.62, 0.62, H120.COL_H, 0.62, piv);
  if (o.chip) { box(X, M.h5dark, H120.R0 - 0.1, 0, -0.16, H120.R0 + 0.02, 0.16, 0.16, piv); for (const [a, b] of [[0.3, 0.4], [-0.25, 0.55]]) box(X, M.h5marble, fx + fr.along[0] * 0.9 + a * 0.3, Y.PLINTH_TOP, fz + fr.along[1] * 0.9 + b * 0.3, fx + fr.along[0] * 0.9 + a * 0.3 + 0.12, Y.PLINTH_TOP + 0.06, fz + fr.along[1] * 0.9 + b * 0.3 + 0.09, g); }
  if (o.crack) { const k = box(X, M.h5dark, -0.025, 2.4, -0.025, 0.025, 7.1, 0.025, piv); k.position.x = (H120.R0 + H120.R1) / 2 - 0.02; k.rotation.z = 0.04; }
  const n = o.wedges | 0, sides = [fr.along, [-fr.along[0], -fr.along[1]], fr.across, [-fr.across[0], -fr.across[1]]];
  for (let i = 0; i < n; i++) { const s = sides[i % 4], k = Math.floor(i / 4) * 0.22 - 0.1, px = fx + s[0] * 0.66 + (s[1] ? k : 0), pz = fz + s[1] * 0.66 + (s[0] ? k : 0); const w = box(X, M.h5lead, px - 0.1, Y.PLINTH_TOP, pz - 0.1, px + 0.1, Y.PLINTH_TOP + 0.08, pz + 0.1, g); w.rotation.y = Math.atan2(s[0], s[1]); }
  let cradle = null;
  if (o.cradle) {
    cradle = new T.Group(); g.add(cradle);
    // two cross timbers under the shaft at 4 and 8 amot along it, the log stop against the foot on the plinth
    for (const u of [4.2, 8.2]) { const h = Y.PLINTH_TOP + u * Math.sin(H120.CRADLE * Math.PI / 180) - H120.R0 * 0.95, px = fr.x + fr.along[0] * u * Math.cos(H120.CRADLE * Math.PI / 180), pz = fr.z + fr.along[1] * u * Math.cos(H120.CRADLE * Math.PI / 180);
      const a = fr.across, L = 1.9; box(X, M.h5cedarD, Math.min(px - a[0] * L, px + a[0] * L) - 0.22 * Math.abs(a[1]), H120.FLOOR, Math.min(pz - a[1] * L, pz + a[1] * L) - 0.22 * Math.abs(a[0]), Math.max(px - a[0] * L, px + a[0] * L) + 0.22 * Math.abs(a[1]), h, Math.max(pz - a[1] * L, pz + a[1] * L) + 0.22 * Math.abs(a[0]), cradle); }
    const lx = fr.x - fr.along[0] * 0.95, lz = fr.z - fr.along[1] * 0.95, a = fr.across;
    const stop = new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 1.8, 8), M.h5cedarD); stop.position.set(lx, Y.PLINTH_TOP + 0.2, lz); stop.rotation.set(a[1] ? Math.PI / 2 : 0, 0, a[0] ? Math.PI / 2 : 0); stop.castShadow = true; cradle.add(stop);
  }
  let mark = null;
  if (o.mark) { mark = new T.Mesh(new T.RingGeometry(H120.R0 - 0.04, H120.R0 + 0.05, 28), M.h5green); mark.rotation.x = -Math.PI / 2; mark.position.set(fr.x, Y.PLINTH_TOP + 0.012, fr.z); mark.renderOrder = 3; g.add(mark); }
  X.props.root.add(g);
  const C = { g, piv, shaft, cap, plinth, cradle, mark, fr, foot: { x: fx, z: fz },
    /** set the angle (θ from the floor) or the standing lean */
    pose(th, lean) { piv.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), colAxis(X, fr, th, lean)); },
    /** the world point at u (0 foot … 1 top) along the shaft */
    at(u, out) { const v = out || new T.Vector3(); v.set(0, H120.COL_H * u, 0).applyQuaternion(piv.quaternion).add(piv.position); return v; },
  };
  C.pose(o.th != null ? o.th : 90, o.lean);
  return C;
}
/** the shear legs (חמור): two cedar poles lashed at the head, over the foot; head: the lashing's world point */
export function shearLegs(X, fr, all, h = 12, back = 1.5) {
  const T = X.THREE, M = mats(X);
  const hx = fr.x - fr.along[0] * back, hz = fr.z - fr.along[1] * back, head = new T.Vector3(hx, H120.FLOOR + h, hz);
  for (const s of [-1, 1]) {
    const fx = fr.x + fr.across[0] * 2.4 * s - fr.along[0] * 0.4, fz = fr.z + fr.across[1] * 2.4 * s - fr.along[1] * 0.4, a = new T.Vector3(fx, H120.FLOOR, fz);
    const v = new T.Vector3().subVectors(head, a), L = v.length(), m = new T.Mesh(new T.CylinderGeometry(0.16, 0.2, L + 0.6, 7), M.h5cedarD);
    m.position.copy(a).addScaledVector(v, 0.5 + 0.3 / L); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize()); m.castShadow = true; X.props.root.add(m); all.push(m);
  }
  const k = new T.Mesh(new T.SphereGeometry(0.3, 8, 6), M.h5rope); k.position.copy(head); X.props.root.add(k); all.push(k);
  return head;
}

/* ───────── the columns as the save and the crews have them ───────── */
function colState(id) {
  const X = SH5.X, st = X.M.st, c = st.col[id];
  if (SH5.final) return { up: 1, ...(c || {}) };
  if (c && c.done) return { up: 1, ...c };
  if (X.M.crew().cols.includes(id) && SH5.introHold !== id) return { up: 1, by: 'c' };   // (the opening film raises S1 in view)
  return { up: 0 };
}
const colKeyOf = (id) => JSON.stringify([colState(id), SH5.final]);
function colClear(id) { const R = SH5.cols[id]; if (R) drop(SH5.X, R.all); SH5.cols[id] = null; }
export function colBuild(X, id) {
  colClear(id);
  const s = colState(id), all = [];
  const C = colMesh(X, id, s.up ? { th: 90, lean: s.lean, off: s.off, wedges: s.wedges, chip: s.chip, crack: s.crack } : { th: H120.CRADLE, cradle: 1 });
  all.push(C.g);
  SH5.cols[id] = { all, C, up: s.up };
  SH5.colKey[id] = colKeyOf(id);
  return SH5.cols[id];
}
/** a crew column rising in view (the same rig, smaller cast: three pullers, the shear legs, the rope), about 7 s */
function riseStart(X, id) {
  colClear(id);
  const all = [], C = colMesh(X, id, { th: H120.CRADLE, cradle: 1 }), fr = C.fr; all.push(C.g);
  const head = shearLegs(X, fr, all, 12, 1.5), rope = X.props.rope(16, 0.05), rope2 = X.props.rope(10, 0.05);
  const men = [];
  for (let k = 0; k < 3; k++) { const d = 6.5 + k * 1.3, x = fr.x - fr.along[0] * d + fr.across[0] * (k % 2 ? 0.5 : -0.5), z = fr.z - fr.along[1] * d + fr.across[1] * (k % 2 ? 0.5 : -0.5); const w = SH5.crew.add(x, z, { role: 'pull', item: 'rope', fx: fr.x, fz: fr.z, crew: 1, off: k * 0.21 }); if (w) men.push(w); }
  SH5.cols[id] = { all, C, up: 0 };
  SH5.rise[id] = { t: 0, C, head, rope, rope2, men, all, fr };
}
function riseFrame(dt) {
  const X = SH5.X;
  for (const id of Object.keys(SH5.rise)) {
    const R = SH5.rise[id]; R.t += dt;
    const u = clamp((R.t - 1.2) / 6, 0, 1), th = H120.CRADLE + (90 - H120.CRADLE) * (u < 0.85 ? ease(u / 0.85) * 0.93 : 0.93 + 0.07 * ((u - 0.85) / 0.15));
    R.C.pose(Math.min(90, th));
    if (R.C.cradle) R.C.cradle.visible = u < 0.4;
    const top = R.C.at(0.97), hand = R.men[0] ? { x: R.men[0].a.x, y: R.men[0].a.y + 1.25, z: R.men[0].a.z } : { x: R.head.x - R.fr.along[0] * 6, y: 7, z: R.head.z - R.fr.along[1] * 6 };
    R.rope.set({ x: top.x, y: top.y, z: top.z }, { x: R.head.x, y: R.head.y, z: R.head.z }, 0.05); R.rope2.set({ x: R.head.x, y: R.head.y, z: R.head.z }, hand, 0.15);
    for (const w of R.men) { w.a.x -= R.fr.along[0] * dt * 0.25 * (u > 0 && u < 1 ? 1 : 0); w.a.z -= R.fr.along[1] * dt * 0.25 * (u > 0 && u < 1 ? 1 : 0); }
    if (R.t > 7.6) {
      X.dust(R.fr.x, H120.FLOOR + 0.5, R.fr.z, 12, 3); try { X.play('thud'); } catch (e) { /* */ }
      R.rope.dispose(); R.rope2.dispose(); for (const w of R.men) SH5.crew.remove(w);
      for (const o of R.all) if (o !== R.C.g) X.props.remove(o);
      delete SH5.rise[id];
      colBuild(X, id);
    }
  }
}
function colsSync(X, init) {
  for (const id of COL_IDS) {
    if (SH5.own[id] || SH5.rise[id]) continue;
    const k = colKeyOf(id); if (SH5.colKey[id] === k && SH5.cols[id]) continue;
    const s = colState(id), was = SH5.cols[id];
    // a crew column that has just come up rises in view; one already standing (a reload, the zoom-out) is drawn standing
    if (!init && s.up && s.by === 'c' && was && !was.up && !SH5.final) riseStart(X, id);
    else colBuild(X, id);
  }
}

/* ───────── the beams, the joists, the corbels, the planks, the railing, the ladders, the props ───────── */
const seatedOf = (X) => BEAMS.filter((B) => SH5.final || (X.M && X.M.seated(B.id))).map((B) => B.id);
function beamsKey(X) { const st = X.M.st; return JSON.stringify([seatedOf(X), BEAMS.map((B) => (st.beam[B.id] || {}).shim || 0), st.props, st.planks.done, SH5.final, SH5.own.__beam || '']); }
/** the shim at a short beam's end on his column P1 (d: the beam's direction toward P1, gap amot): fresh pale cedar filling the gap
 *  to the column's centre, its head over the beam (drive: 0…1 how far it is driven in; 1 = home) → the group */
export function shimMesh(X, all, P1, d, gap, drive = 1) {
  const T = X.THREE, g = new T.Group(), m = new T.MeshStandardMaterial({ color: '#F6E4B6', emissive: '#4A3A1A', emissiveIntensity: 0.35, roughness: 0.8, flatShading: true }), hw = H120.BEAM_W / 2, w = Math.max(0.14, gap);
  const ex = Math.abs(d[0]) > 0.5;
  const bx = (a0, a1, y0, y1, w0, w1) => box(X, m, ex ? a0 : w0, y0, ex ? w0 : a0, ex ? a1 : w1, y1, ex ? w1 : a1, g);
  // (local: along the beam toward the column's centre from 0 to w; across ±)
  bx(-w, 0, Y.COL_TOP, Y.BEAM_TOP, -hw - 0.03, hw + 0.03);
  bx(-w - 0.14, 0.1, Y.BEAM_TOP, Y.BEAM_TOP + 0.18, -hw - 0.15, hw + 0.15);   // (the driven head: proud of the beam on both sides, read from the walking camera)
  g.position.set(P1[0] * (ex ? 1 : 1), (1 - drive) * 0.35, P1[1]);
  if ((ex ? d[0] : d[1]) < 0) g.scale[ex ? 'x' : 'z'] = -1;
  X.props.root.add(g); all.push(g); return g;
}
function beamsBuild(X) {
  if (SH5.beamsG) drop(X, SH5.beamsG);
  const all = (SH5.beamsG = []), M = mats(X), st = X.M.st, seated = new Set(seatedOf(X)), hw = H120.BEAM_W / 2;
  const cedar = [], corb = [], joist = [], plank = [], rail = [];
  for (const B of BEAMS) {
    if (!seated.has(B.id) || SH5.own.__beam === B.id) continue;
    let [ax, az] = B.pa, [bx, bz] = B.pb;
    // his shim (כפיס): a beam short by up to a tefach ends short of his column's centre; a block of fresh pale cedar fills the gap, its
    // driven head standing a little over the beam and its sides, so it reads from the walking camera too. It stays.
    const b = st.beam[B.id], hb = Object.values(BAYS).find((q) => q.beam === B.id);
    if (b && b.shim && hb) {
      const hisA = hb.col === B.a, P1 = hisA ? B.pa : B.pb, P0 = hisA ? B.pb : B.pa, L = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), d = [(P1[0] - P0[0]) / L, (P1[1] - P0[1]) / L];
      const gap = clamp(L - (+b.cut || L), 0, H120.TEFACH), e = [P1[0] - d[0] * gap, P1[1] - d[1] * gap];
      if (hisA) { ax = e[0]; az = e[1]; } else { bx = e[0]; bz = e[1]; }
      shimMesh(X, all, P1, d, gap);
    }
    cedar.push(B.axis === 'x' ? [Math.min(ax, bx), Y.COL_TOP, az - hw, Math.max(ax, bx), Y.BEAM_TOP, az + hw] : [ax - hw, Y.COL_TOP, Math.min(az, bz), ax + hw, Y.BEAM_TOP, Math.max(az, bz)]);
  }
  const planked = SH5.final || (st.planks && st.planks.done);
  for (const R of RUNS) {
    const s = -R.dir, out = R.line - s * (hw + 0.25), J = joistsOf(R), jw = H120.JOIST_W / 2;
    const span = (L, a0, a1, w0, w1, y0, y1) => L.push(R.axis === 'x' ? [Math.min(a0, a1), y0, Math.min(w0, w1), Math.max(a0, a1), y1, Math.max(w0, w1)] : [Math.min(w0, w1), y0, Math.min(a0, a1), Math.max(w0, w1), y1, Math.max(a0, a1)]);
    const under = (a) => BEAMS.find((B) => (B.axis === R.axis) && (R.axis === 'x' ? Math.abs(B.pa[1] - R.line) < 0.1 && a >= Math.min(B.pa[0], B.pb[0]) - 1e-6 && a <= Math.max(B.pa[0], B.pb[0]) + 1e-6 : Math.abs(B.pa[0] - R.line) < 0.1 && a >= Math.min(B.pa[1], B.pb[1]) - 1e-6 && a <= Math.max(B.pa[1], B.pb[1]) + 1e-6));
    for (const a of J) {
      span(corb, a - 0.22, a + 0.22, R.wall, R.wall - s * 0.9, Y.BEAM_TOP - 0.7, Y.BEAM_TOP);
      const B = under(a); if (B && seated.has(B.id) && SH5.own.__beam !== B.id) span(joist, a - jw, a + jw, R.wall, out, Y.BEAM_TOP, Y.JOIST_TOP);
    }
    if (planked) {
      span(plank, R.a0, R.a1, R.wall, out, Y.JOIST_TOP, Y.GFLOOR);
      const re = out + s * 0.12;
      for (const a of J) span(rail, a - 0.08, a + 0.08, re - 0.08, re + 0.08, Y.GFLOOR, Y.GFLOOR + H120.RAIL);
      span(rail, R.a0, R.a1, re - 0.1, re + 0.1, Y.GFLOOR + H120.RAIL - 0.12, Y.GFLOOR + H120.RAIL);
      span(rail, R.a0, R.a1, re - 0.05, re + 0.05, Y.GFLOOR + H120.RAIL * 0.5 - 0.05, Y.GFLOOR + H120.RAIL * 0.5 + 0.05);
    }
  }
  inst(X, M.h5cedar, cedar, all); inst(X, M.h5limeD, corb, all); inst(X, M.h5cedarD, joist, all); inst(X, M.h5cedarL, plank, all); inst(X, M.h5cedarD, rail, all);
  // the props (סמוכה) under a creaking bay (8.2): a post under the beam's middle, its foot on a stone
  for (const lv of [1, 2, 3]) if (st.props && st.props[lv]) {
    const B = BEAM_OF[BAYS[lv].beam], mx = (B.pa[0] + B.pb[0]) / 2, mz = (B.pa[1] + B.pb[1]) / 2;
    all.push(cyl(X, M.h5cedarD, mx, H120.FLOOR + 0.3, mz, 0.22, 0.2, Y.COL_TOP - H120.FLOOR - 0.3, 8)); all.push(box(X, M.h5limeD, mx - 0.4, H120.FLOOR, mz - 0.4, mx + 0.4, H120.FLOOR + 0.3, mz + 0.4));
  }
  SH5.beamKey = beamsKey(X);
}
function laddersBuild(X, all) {
  const M = mats(X);
  LADDERS.forEach(([x, z, fx, fz], li) => { for (const g of h120Ladder(x, z, fx, fz, H120.FLOOR, Y.GFLOOR)) { const m = new X.THREE.Mesh(g, M.h5cedarD); m.castShadow = true; m.userData.lad = li + 1; X.props.root.add(m); all.push(m); } });
}

/* ───────── the carpenters' yard: trestles, the stock, the heaps, the bench; two sawyers who really cut ───────── */
export function trestle(X, x, z, all, alongX = true, top = H120.FLOOR + 1.6) {
  const M = mats(X), g = new X.THREE.Group(); g.position.set(x, H120.FLOOR, z); if (!alongX) g.rotation.y = Math.PI / 2; X.props.root.add(g); all.push(g);
  box(X, M.h5cedarD, -0.2, top - H120.FLOOR - 0.3, -1.1, 0.2, top - H120.FLOOR, 1.1, g);
  for (const sz of [-0.85, 0.85]) for (const sx of [-0.45, 0.45]) { const l = box(X, M.h5cedarD, -0.07, 0, -0.07, 0.07, top - H120.FLOOR - 0.2, 0.07, g); l.position.set(sx, (top - H120.FLOOR - 0.2) / 2, sz); l.rotation.z = -sx * 0.35; }
  return g;
}
const SAWL = YARD.saw.x1 - YARD.saw.x0;
function yardBuild(X) {
  if (SH5.yard) drop(X, SH5.yard.all);
  const all = [], M = mats(X); SH5.yard = { all };
  if (SH5.final) return;
  const st = X.M.st, top = H120.FLOOR + 1.6;
  for (const x of [YARD.his.x0 + 2, YARD.his.x1 - 2]) trestle(X, x, YARD.his.z, all);
  for (const x of [YARD.saw.x0 + 2, YARD.saw.x1 - 2.6]) trestle(X, x, YARD.saw.z, all);
  // his beam (or a free one) cut and waiting on his trestles for its carry (station 3); the splinter stays if the fibres tore
  if (!SH5.own.__yard) {
    const W = BEAMS.find((B) => { const b = st.beam[B.id]; return b && b.done && b.by === 'k' && !X.M.seated(B.id); });
    if (W) { const b = st.beam[W.id], x1 = YARD.his.x0 + (+b.cut || W.len); all.push(box(X, M.h5cedar, YARD.his.x0, top, YARD.his.z - 0.35, x1, top + 0.6, YARD.his.z + 0.35)); if (b.torn) { const sp = box(X, M.h5cedarL, x1 - 0.05, top, YARD.his.z - 0.05, x1 + 0.45, top + 0.06, YARD.his.z + 0.15); sp.rotation.z = -0.35; all.push(sp); } SH5.yard.wait = W.id; }
  }
  // the stock: squared cedar beams stacked along the wall, as many as are still to be cut (6 at most drawn)
  const left = BEAMS.filter((B) => !(st.beam[B.id] && st.beam[B.id].done) && !X.M.seated(B.id)).length, n = Math.min(6, Math.max(1, Math.ceil(left / 2.5)));
  for (let i = 0; i < n; i++) { const r = Math.floor(i / 3), k = i % 3, x = YARD.stock.x - 0.9 + k * 0.62 + r * 0.31; all.push(box(X, k % 2 ? M.h5cedarL : M.h5cedar, x - 0.28, H120.FLOOR + r * 0.56, YARD.stock.z0, x + 0.28, H120.FLOOR + 0.56 + r * 0.56, YARD.stock.z1)); }
  // the offcut heap (the ends cut off: his, and the yard's) and the heap of short beams (each lost beam stays there)
  const offs = 3 + [1, 2, 3].filter((lv) => st.beam[BAYS[lv].beam] && st.beam[BAYS[lv].beam].done).length;
  for (let i = 0; i < offs; i++) { const a = i * 2.39, r = 0.35 + (i % 3) * 0.3, x = YARD.offcut[0] + Math.cos(a) * r, z = YARD.offcut[1] + Math.sin(a) * r; const b = box(X, M.h5cedarL, x - 0.5, H120.FLOOR + (i > 3 ? 0.4 : 0), z - 0.25, x + 0.5, H120.FLOOR + 0.4 + (i > 3 ? 0.4 : 0), z + 0.25); b.rotation.y = a; all.push(b); }
  const lost = BEAMS.filter((B) => st.beam[B.id] && st.beam[B.id].lost).length;
  for (let i = 0; i < lost; i++) all.push(box(X, M.h5cedarD, YARD.short[0] - 5, H120.FLOOR + i * 0.56, YARD.short[1] - 0.28 + (i % 2) * 0.05, YARD.short[0] + 5, H120.FLOOR + 0.56 + i * 0.56, YARD.short[1] + 0.28));
  // the bench and its tools (the tools only: rule "כלי הנגר")
  const [bx, bz] = YARD.bench; all.push(box(X, M.h5cedarD, bx - 1.4, H120.FLOOR + 1.0, bz - 0.4, bx + 1.4, H120.FLOOR + 1.15, bz + 0.4));
  for (const dx of [-1.2, 1.2]) for (const dz of [-0.3, 0.3]) all.push(box(X, M.h5cedarD, bx + dx - 0.06, H120.FLOOR, bz + dz - 0.06, bx + dx + 0.06, H120.FLOOR + 1.0, bz + dz + 0.06));
  all.push(box(X, M.h5cedarL, bx - 1.1, H120.FLOOR + 1.15, bz - 0.04, bx - 0.1, H120.FLOOR + 1.19, bz + 0.04));   // the amah rod
  all.push(cyl(X, M.h5rope, bx + 0.5, H120.FLOOR + 1.15, bz, 0.22, 0.22, 0.1, 10));                                // the cord, coiled
  all.push(box(X, M.h5bronze, bx + 0.8, H120.FLOOR + 1.15, bz - 0.25, bx + 1.25, H120.FLOOR + 1.18, bz - 0.05));   // the adze's blade
  sawyersBuild(X, all);
}
/** the yard's two sawyers: the beam on their trestles is cut through (about 14 s), the offcut drops, a fresh one is carried in */
function sawyersBuild(X, all) {
  const M = mats(X), top = H120.FLOOR + 1.6, z = YARD.saw.z, cutX = YARD.saw.x1 - 1.0;
  const beam = box(X, M.h5cedar, YARD.saw.x0, top, z - 0.3, cutX, top + 0.6, z + 0.3); all.push(beam);
  const off = box(X, M.h5cedarL, cutX, top, z - 0.3, YARD.saw.x1, top + 0.6, z + 0.3); all.push(off);
  const kerf = box(X, M.h5dark, cutX - 0.02, top + 0.6, z - 0.31, cutX + 0.02, top + 0.6, z + 0.31); all.push(kerf);
  const blade = box(X, M.h5lead, cutX - 0.01, top + 0.5, z - 1.4, cutX + 0.01, top + 0.75, z + 1.4); all.push(blade);
  const old = SH5.saw && SH5.saw.men; if (old) for (const w of old) SH5.crew.remove(w);
  const men = [];
  for (const s of [-1, 1]) { const w = SH5.crew.add(cutX + 0.2, z + s * 1.75, { role: 'pull', item: 'saw', fx: cutX, fz: z, crew: 2, off: s > 0 ? 0.5 : 0, k: 1 }); if (w) men.push(w); }
  SH5.saw = { t: (SH5.saw && SH5.saw.t) || 0, beam, off, kerf, blade, men, cutX, top, z, phase: 'cut', offY: 0, offV: 0 };
}
function sawFrame(dt) {
  const S = SH5.saw; if (!S || !S.beam.parent) return;
  S.t += dt;
  const X = SH5.X, CUT = 14;
  if (S.phase === 'cut') {
    const u = clamp(S.t / CUT, 0, 1), d = 0.6 * u;
    S.kerf.scale.y = Math.max(1e-3, d); S.kerf.position.y = S.top + 0.6 - d / 2;
    const st = Math.sin(S.t * Math.PI * 2 / 1.1);   // (one stroke each way in 1.1 s: the blade travels across the beam)
    S.blade.position.z = S.z + st * 0.45; S.blade.position.y = S.top + 0.62 - d;
    for (const w of S.men) { w.a.z = S.z + Math.sign(w.a.z - S.z) * (1.75 + 0.3 * st * Math.sign(w.a.z - S.z)); }
    // (an act's men near the saw beam (SH5.sawKeep: the carry's bearers): a sawyer within 1.5 of one steps 1.4 back along it, 1.2 amot apart at the least)
    for (const w of S.men) { if (w.x0 == null) w.x0 = w.a.x; const K = SH5.sawKeep, near = !!K && K.some((b) => b && b.a && b.a.alive !== false && Math.hypot(b.a.x - w.x0, b.a.z - w.a.z) < 1.5); w.a.x = w.x0 - (near ? 1.4 : 0); }
    if (Math.abs(st) > 0.98 && (S.t % 1.1) < dt * 2) X.dust(S.cutX, S.top + 0.3, S.z, 2, 0.6);
    if (u >= 1) { S.phase = 'drop'; S.t = 0; S.offV = 0; X.play('thud'); }
  } else if (S.phase === 'drop') {
    S.offV += 9.8 * dt; S.off.position.y = Math.max(H120.FLOOR + 0.3, S.off.position.y - S.offV * dt); S.off.rotation.z = Math.min(0.5, S.off.rotation.z + dt * 1.5);
    S.blade.visible = false;
    if (S.t > 1.0) { S.phase = 'swap'; S.t = 0; for (const w of S.men) { SH5.crew.setRole(w, 'carry', { item: null }); SH5.crew.walkTo(w, YARD.stock.x - 2, w.a.z < S.z ? YARD.saw.z - 1.5 : YARD.saw.z + 1.5, 2.2); } }
  } else if (S.phase === 'swap') {
    S.beam.visible = S.t < 1.5 || S.t > 6;
    if (S.t > 3 && S.t - dt <= 3) for (const w of S.men) { SH5.crew.setRole(w, 'carry', { item: 'beam' }); SH5.crew.walkTo(w, S.cutX + 0.2, w.a.z < S.z ? S.z - 1.75 : S.z + 1.75, 2.0); }
    if (S.t > 6.2) {
      S.phase = 'cut'; S.t = 0; S.blade.visible = true; S.beam.visible = true;
      S.off.position.y = S.top + 0.3; S.off.rotation.z = 0; S.kerf.scale.y = 1e-3;
      for (const w of S.men) { SH5.crew.setRole(w, 'pull', { item: 'saw' }); w.fx = S.cutX; w.fz = S.z; }
    }
  }
}

/* ───────── the lepers' chamber: the basin, the steps, the rod, the water, the hollows, the vessels, the lime pit, the plasterers ───────── */
function chKey(X) { const st = X.M.st; return JSON.stringify([+(st.mik.water || 0).toFixed(3), st.mik.outlet, st.mik.ch.map((c) => c.pts.length + ':' + c.pts.reduce((a, p) => a + p[2], 0).toFixed(2)), st.mik.moved, st.mik.limeSpoiled || 0, [1, 2, 3].map((lv) => (st.mik[lv] || {}).done || 0), SH5.final, SH5.busy && X.mission && X.mission.k === 'mikveh']); }
export function basinBuild(X, all, o = {}) {
  const M = mats(X), K = MIK, y0 = K.bottom, x1 = K.stair, n = K.steps - 1, tr = (x1 - K.x1) / n, rh = K.deep / K.steps, st = X.M.st;
  const water = o.water != null ? o.water : (st.mik.water || 0), wy = y0 + water;
  const i0 = all.length;
  all.push(box(X, water > 0.02 ? M.h5plasterW : M.h5plaster, K.x0, y0 - 0.1, K.z0, K.x1, y0, K.z1));
  // the walls: plaster above the water, the darker plaster under it
  const wall = (x0, z0, xa, za) => { if (water > 0.02) all.push(box(X, M.h5plasterW, x0, y0, z0, xa, Math.min(wy, H120.FLOOR), za)); if (wy < H120.FLOOR) all.push(box(X, M.h5plaster, x0, Math.max(y0, wy), z0, xa, H120.FLOOR, za)); };
  wall(K.x0 - 0.06, K.z0, K.x0, K.z1); wall(K.x0, K.z0 - 0.06, x1, K.z0); wall(K.x0, K.z1, x1, K.z1 + 0.06); wall(x1, K.z0, x1 + 0.06, K.z1);
  for (let i = 1; i <= n; i++) all.push(box(X, y0 + i * rh < wy ? M.h5plasterW : M.h5plaster, K.x1 + (i - 1) * tr, y0, K.z0, K.x1 + i * tr, y0 + i * rh, K.z1));
  // the rim of two tefachim, the inflow notch on the north, the outlet on the south once cut (its sill at the save's height)
  const rw = 0.3, rt = K.rimTop, F0 = H120.FLOOR, outl = o.outlet !== undefined ? o.outlet : st.mik.outlet;
  all.push(box(X, M.h5limeD, K.x0 - rw, F0, K.z0 - rw, K.inlet[0] - 0.2, rt, K.z0)); all.push(box(X, M.h5limeD, K.inlet[0] + 0.2, F0, K.z0 - rw, x1 + rw, rt, K.z0));
  if (outl != null) { all.push(box(X, M.h5limeD, K.x0 - rw, F0, K.z1, K.outlet[0] - 0.2, rt, K.z1 + rw)); all.push(box(X, M.h5limeD, K.outlet[0] + 0.2, F0, K.z1, x1 + rw, rt, K.z1 + rw)); const sy = K.bottom + outl; if (sy > F0) all.push(box(X, M.h5limeD, K.outlet[0] - 0.2, F0, K.z1, K.outlet[0] + 0.2, Math.min(rt, sy), K.z1 + rw)); }
  else all.push(box(X, M.h5limeD, K.x0 - rw, F0, K.z1, x1 + rw, rt, K.z1 + rw));
  all.push(box(X, M.h5limeD, K.x0 - rw, F0, K.z0, K.x0, rt, K.z1)); all.push(box(X, M.h5limeD, x1, F0, K.z0, x1 + rw, rt, K.z1));
  // the rod with its two marks: forty seah (half an amah), a man's height (three amot); a notch every amah
  const [rx, rz] = K.rod; all.push(box(X, M.h5cedarL, rx - 0.05, y0, rz - 0.05, rx + 0.05, rt + 0.4, rz + 0.05));
  for (const h of [1, 2]) all.push(box(X, M.h5dark, rx - 0.06, y0 + h - 0.012, rz - 0.06, rx + 0.06, y0 + h + 0.012, rz + 0.06));
  for (const h of [0.5, 3]) all.push(box(X, M.h5bronze, rx - 0.09, y0 + h - 0.03, rz - 0.09, rx + 0.09, y0 + h + 0.03, rz + 0.09));
  // the water: the stage's own surface (h120/water120.js), its plaster darkened under it
  // (the cut's inside takes no shadow: the shadow map's steps along the rim's edge read as a jagged band on the plaster)
  for (let k = i0; k < all.length; k++) { const m = all[k]; if (m && m.isMesh && m.position.y < H120.FLOOR) m.receiveShadow = false; }
  carveUnder(X);   // (the slabs under the court floor would close the cut)
  const bw = basinWater(X); X.props.root.add(bw.g); all.push(bw.g); bw.set(water);
  return { surf: water > 0.004 ? bw.surf : null, bw, wy };
}
function chamberBuild(X) {
  if (SH5.ch) drop(X, SH5.ch.all);
  const all = [], M = mats(X), T = X.THREE, st = X.M.st; SH5.ch = { all };
  // the chamber's own floor: large slabs on the field's true relief (h120/water120.js)
  { const f = floorMesh(X); X.props.root.add(f); all.push(f); }
  SH5.ch.basin = basinBuild(X, all);
  const live = SH5.busy && SH5.mikLv ? SH5.mikLv : 0;   // (station 4 playing level `live`: its hollow, plug, vessels and channels are the act's)
  // the three rock hollows (rain water standing in each until its level drained it), their clay plugs
  for (const lv of [1, 2, 3]) {
    const [hx, hz] = MIK.hollows[lv], full = !(st.mik[lv] && st.mik[lv].done), y = floorY(hx, hz);
    const d = new T.Mesh(new T.CircleGeometry(1.3, 20), M.h5limeD); d.rotation.x = -Math.PI / 2; d.position.set(hx, y + 0.06, hz); X.props.root.add(d); all.push(d);
    const r = new T.Mesh(new T.TorusGeometry(1.32, 0.09, 5, 20), M.h5lime); r.rotation.x = -Math.PI / 2; r.position.set(hx, y + 0.02, hz); X.props.root.add(r); all.push(r);
    if (full && live !== lv) { const w = pool(X, hx, hz); w.set(1); X.props.root.add(w.mesh); all.push(w.mesh); }
    if (live !== lv) all.push(cyl(X, M.h5plug, hx + 1.2, y, hz, 0.2, 0.17, full ? 0.32 : 0.2, 8));
  }
  // the vessels where they stand (moved or not): the plasterers' wooden trough, the jars
  if (!live) for (const v of vesselsOf(st.mik.moved)) for (const o of vesselMesh(X, v)) all.push(o);
  // the plasterers' lime pit (level 3's trap): white lime in a shallow pit with a low kerb (spoiled: grey and cracked)
  const P = MIK.pit, py = floorY((P.x0 + P.x1) / 2, (P.z0 + P.z1) / 2) - 0.004;
  all.push(box(X, st.mik.limeSpoiled ? M.h5limeD : M.h5white, P.x0, py - 0.2, P.z0, P.x1, py + 0.04, P.z1));
  for (const [a, b, c, d] of [[P.x0 - 0.2, P.z0 - 0.2, P.x1 + 0.2, P.z0], [P.x0 - 0.2, P.z1, P.x1 + 0.2, P.z1 + 0.2], [P.x0 - 0.2, P.z0, P.x0, P.z1], [P.x1, P.z0, P.x1 + 0.2, P.z1]]) all.push(box(X, M.h5limeD, a, py, b, c, py + 0.18, d));
  // the channels as cut (station 4): a groove in the slabs along each, darker where deepened
  for (const ch of st.mik.ch) { if (live && ch.lv === live) continue; const g = grooveMesh(X, ch.pts || []); if (g) { X.props.root.add(g); all.push(g); } }
  SH5.chKey = chKey(X);
}
/** (station 4: the act asks the chamber drawn anew — its own work's hollow, plug, vessels and channels left to it) */
export function chamberRedraw(X) { chamberBuild(X); }
/** a vessel's meshes on the floor (the trough: a cedar box with lime in it; a jar) */
export function vesselMesh(X, v, parent) {
  const M = mats(X), T = X.THREE, [x, z] = v.at, y = floorY(x, z), out = [], root = parent || X.props.root;
  if (v.kind === 'trough') {
    const g = new T.Group(); g.position.set(x, y, z); root.add(g); out.push(g);
    box(X, M.h5cedarD, -v.w / 2, 0, -v.d / 2, v.w / 2, 0.55, v.d / 2, g); box(X, M.h5white, -v.w / 2 + 0.1, 0.55, -v.d / 2 + 0.1, v.w / 2 - 0.1, 0.56, v.d / 2 - 0.1, g);
  } else { const g = new T.LatheGeometry([[0.001, 0], [0.32, 0.04], [0.52, 0.45], [0.55, 0.85], [0.4, 1.25], [0.2, 1.45], [0.22, 1.6], [0.001, 1.6]].map(([a, b]) => new T.Vector2(a, b)), 12); const m = new T.Mesh(g, M.h5clay); m.position.set(x, y, z); m.castShadow = true; root.add(m); out.push(m); }
  return out;
}

/* ───────── the site: scaffolds with their masons, stone piles, the sledge and the ox cart on their lane ───────── */
function siteBuild(X) {
  if (SH5.site) { drop(X, SH5.site.all); for (const w of SH5.site.men) SH5.crew.remove(w); }
  const all = [], men = [], M = mats(X); SH5.site = { all, men };
  if (SH5.final) return;
  SCAFF.forEach(([x0, z0, x1, z1], si) => {
    const posts = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]], n0 = all.length;
    for (const [x, z] of posts) all.push(cyl(X, M.h5cedarD, x, H120.FLOOR, z, 0.1, 0.09, 13.5, 6));
    for (const y of [H120.FLOOR + 6, H120.FLOOR + 12]) all.push(box(X, M.h5cedarL, x0 - 0.1, y - 0.12, z0 - 0.1, x1 + 0.1, y, z1 + 0.1));
    for (let i = n0; i < all.length; i++) all[i].userData.scaf = si + 1;   // (a scaffold is hidden whole, its mason with it)
    // a mason on the upper lift, dressing the wall's course (he really works: a mallet and a chisel on the beat)
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, wx = x1 - x0 < z1 - z0 ? (x0 < 60 ? x0 - 1 : x1 + 1) : cx, wz = x1 - x0 < z1 - z0 ? cz : (z0 < 0 ? z0 - 1 : z1 + 1);
    const w = SH5.crew.add(cx, cz, { role: 'hammer', item: 'chisel', fx: wx, fz: wz, crew: 1 }); if (w) { w.a.y = w.a.fixedY = H120.FLOOR + 12; w.dust = false; w.scaf = si + 1; men.push(w); }
  });
  for (const [x, z, n] of PILES) for (let i = 0; i < n; i++) { const r = Math.floor(i / 3), k = i % 3, a = (x * 7 + z * 3 + i) % 2 ? 0.12 : -0.08; const b = box(X, k % 2 ? M.h5lime : M.h5limeD, x - 1.6 + k * 1.05 + r * 0.5, H120.FLOOR + r * 0.62, z - 0.5, x - 0.7 + k * 1.05 + r * 0.5, H120.FLOOR + 0.6 + r * 0.62, z + 0.5); b.rotation.y = a; all.push(b); }
  // a broken column's halves (each fall) on the pile by the east gate
  const broke = COL_IDS.reduce((a, id) => a + ((X.M.st.col[id] || {}).broke | 0), 0);
  for (let i = 0; i < Math.min(broke, 3); i++) for (const h of [0, 1]) { const T = X.THREE, m = new T.Mesh(new T.CylinderGeometry(0.52, 0.58, 4.8, 14), M.h5marble); m.rotation.z = Math.PI / 2; m.position.set(BROKE_AT[0] + h * 5.2 - 2.6, H120.FLOOR + 0.58 + i * 1.1, BROKE_AT[1] + (h ? 0.3 : -0.2)); m.castShadow = true; X.props.root.add(m); all.push(m); }
  // the plasterers' lime pit by the wood chamber (station 3, level 3's pass): white lime in a shallow pit with a low kerb
  { const P = LIME; all.push(box(X, M.h5white, P.x0, H120.FLOOR - 0.2, P.z0, P.x1, H120.FLOOR + 0.04, P.z1)); for (const [a, b, c, d] of [[P.x0 - 0.2, P.z0 - 0.2, P.x1 + 0.2, P.z0], [P.x0 - 0.2, P.z1, P.x1 + 0.2, P.z1 + 0.2], [P.x0 - 0.2, P.z0, P.x0, P.z1], [P.x1, P.z0, P.x1 + 0.2, P.z1]]) all.push(box(X, M.h5limeD, a, H120.FLOOR, b, c, H120.FLOOR + 0.18, d)); }
  // the sherds of every jar a beam broke (station 3): they stay on the floor
  for (const [x, z, k] of (X.M.st.sherds || [])) for (let i = 0; i < 6; i++) { const a = i * 1.7 + (k | 0), r = 0.25 + (i % 3) * 0.22, b = box(X, M.h5clay, x + Math.cos(a) * r - 0.13, H120.FLOOR, z + Math.sin(a) * r - 0.09, x + Math.cos(a) * r + 0.13, H120.FLOOR + 0.05, z + Math.sin(a) * r + 0.09); b.rotation.y = a; all.push(b); }
  SH5.siteKey = siteKeyOf(X);
  laneBuild(X, all, men);
}
const siteKeyOf = (X) => JSON.stringify([(X.M.st.sherds || []).length, SH5.final]);
/** the stone sledge (drawn by three men) and the ox cart on the lane from the east gate to the wood chamber: fixed periods (rule 56) */
function laneBuild(X, all, men) {
  const M = mats(X), T = X.THREE;
  const sledge = new T.Group(); box(X, M.h5cedarD, -1.8, 0, -1.0, 1.8, 0.3, -0.7, sledge); box(X, M.h5cedarD, -1.8, 0, 0.7, 1.8, 0.3, 1.0, sledge); box(X, M.h5cedar, -1.5, 0.3, -1.1, 1.5, 0.5, 1.1, sledge); box(X, M.h5lime, -1.3, 0.5, -0.8, 1.3, 1.6, 0.8, sledge);
  X.props.root.add(sledge); all.push(sledge);
  const pull = [];
  for (let k = 0; k < 3; k++) { const w = SH5.crew.add(150, -5.5, { role: 'pull', item: 'rope', crew: 0, off: k * 0.3 }); if (w) { pull.push(w); men.push(w); } }
  const cart = new T.Group(); box(X, M.h5cedar, -1.6, 0.9, -0.9, 1.6, 1.2, 0.9, cart); box(X, M.h5cedarD, -1.6, 1.2, -0.95, 1.6, 1.6, -0.85, cart); box(X, M.h5cedarD, -1.6, 1.2, 0.85, 1.6, 1.6, 0.95, cart);
  for (const s of [-1, 1]) { const wh = new T.Mesh(new T.CylinderGeometry(0.75, 0.75, 0.16, 12), M.h5cedarD); wh.rotation.x = Math.PI / 2; wh.position.set(0, 0.75, s * 1.05); cart.add(wh); }
  box(X, M.h5cedarD, 1.6, 0.95, -0.07, 4.2, 1.07, 0.07, cart);   // the pole to the yoke
  for (const dz of [-0.55, 0.55]) { // two oxen (a body, a head, horns, four legs)
    const ox = new T.Group(); ox.position.set(5.0, 0, dz); cart.add(ox);
    const body = new T.Mesh(new T.SphereGeometry(0.62, 10, 8), M.h5ox); body.scale.set(1.7, 0.95, 0.85); body.position.y = 1.3; ox.add(body);
    const head = new T.Mesh(new T.SphereGeometry(0.3, 8, 6), M.h5ox); head.scale.set(1.35, 0.95, 0.9); head.position.set(1.15, 1.45, 0); ox.add(head);
    for (const s of [-1, 1]) { const h = new T.Mesh(new T.ConeGeometry(0.05, 0.38, 5), M.h5white); h.position.set(1.08, 1.75, s * 0.2); h.rotation.x = s * 0.7; ox.add(h); }
    for (const [lx, lz] of [[0.65, 0.3], [0.65, -0.3], [-0.7, 0.3], [-0.7, -0.3]]) { const l = new T.Mesh(new T.CylinderGeometry(0.1, 0.08, 0.95, 5), M.h5ox); l.position.set(lx, 0.47, lz); l.userData.leg = 1; ox.add(l); }
  }
  X.props.root.add(cart); all.push(cart);
  const dr = SH5.crew.add(150, -8, { role: 'walk', item: 'staff', crew: 3 }); if (dr) men.push(dr);
  SH5.lane = { sledge, pull, cart, dr, t: 0 };
}
function laneFrame(dt) {
  const L = SH5.lane; if (!L || !L.sledge.parent) return;
  L.t += dt; const X = SH5.X;
  // (each on its own clock: a sledge or a cart whose next step would meet an act's beam (SH5.laneHold) halts until it is clear — station 3)
  // (and while the beam comes near the crossing (SH5.laneYield, level 3 of station 3) a crew outside the crossing's stretch waits at
  //  its edge, and one inside it hurries out: the crossing is clear within a few seconds and stays clear while the beam is there)
  const yieldNow = !!(SH5.laneYield && SH5.laneYield());
  const hold = (which, tt) => { const q = laneState(tt + dt, which); return !!(SH5.laneHold && !q.off && SH5.laneHold(which, q.s, q.dir)); };
  L.ts = L.ts == null ? L.t : L.ts; L.tc = L.tc == null ? L.t : L.tc;
  L.holdS = hold('sledge', L.ts); L.holdC = hold('cart', L.tc);
  if (!L.holdS) L.ts = laneAdvance(L.ts, 'sledge', dt, yieldNow); if (!L.holdC) L.tc = laneAdvance(L.tc, 'cart', dt, yieldNow);
  // (while an act plays, the sledge and the cart go no farther along the lane than the act's view cone lets them: they unload there)
  const cap = SH5.cone ? SH5.cone.laneCap : LANE_L;
  const a = laneState(L.ts, 'sledge'); a.s = Math.min(a.s, cap); const p = laneAt(a.s), yaw = p.yaw + (a.dir < 0 ? Math.PI : 0);
  L.sledge.position.set(p.x, H120.FLOOR, p.z); L.sledge.rotation.y = p.yaw - Math.PI / 2; L.sledge.visible = !a.off;
  L.pull.forEach((w, k) => { const q = laneAt(a.s + (a.dir >= 0 ? 3.2 + k * 1.1 : -3.2 - k * 1.1)); w.a.x = q.x + (k - 1) * 0.6 * Math.cos(p.yaw); w.a.z = q.z - (k - 1) * 0.6 * Math.sin(p.yaw); w.a.yaw = yaw; w.a.visT = a.off || w.a.coneHid ? 0 : 1; w.fx = null; });
  const c = laneState(L.tc, 'cart'); if (c.s > cap) { c.s = cap; c.dir = 0; } const q = laneAt(c.s);
  L.cart.position.set(q.x, H120.FLOOR, q.z); L.cart.rotation.y = q.yaw - Math.PI / 2 + (c.dir < 0 ? Math.PI : 0); L.cart.visible = !c.off;
  if (c.dir && !L.holdC) L.cart.traverse((o) => { if (o.userData.leg) o.rotation.z = Math.sin(L.tc * 5 + o.position.x * 3 + o.position.z * 5) * 0.35; });
  if (L.dr) { const d = laneAt(c.s + (c.dir >= 0 ? 6.5 : -6.5)); L.dr.a.x = d.x + 1.4 * Math.cos(q.yaw); L.dr.a.z = d.z - 1.4 * Math.sin(q.yaw); L.dr.a.yaw = q.yaw + (c.dir < 0 ? Math.PI : 0); L.dr.a.visT = c.off || L.dr.a.coneHid ? 0 : 1; }
  L.now = { sledge: a, cart: c };
  void X;
}
/** a scaffold brought down by a beam (station 3) and set up again by its crew: hidden whole (its mason with it), or shown */
export function scafShow(si, on) {
  if (!SH5.site) return;
  for (const o of SH5.site.all) if (o.userData.scaf === si + 1) { if (o.userData.coneHid) o.userData.coneVis = !!on; else o.visible = !!on; }
  for (const w of SH5.site.men) if (w.scaf === si + 1) { w.a.visT = on ? 1 : 0; w.a.vis = on ? w.a.vis : 0; w.down = !on; }
}

/* ───────── the crews at real work (rules 4–5): the next column's gang, the joist layers on the newest seated beam, the plasterers ───────── */
function ambKeyOf(X) { const C = X.M.crew(); return JSON.stringify([C.cols.length, C.beams.length, X.M.nDone(), SH5.final, SH5.busy ? (X.mission && X.mission.id) : 0]); }
function ambient(X) {
  for (const w of SH5.amb) SH5.crew.remove(w); SH5.amb = [];
  if (SH5.final) return;
  const add = (x, z, o, y) => { const w = SH5.crew.add(x, z, o); if (w) { if (y != null) w.a.y = w.a.fixedY = y; SH5.amb.push(w); } return w; };   // (fixedY: a man on the joists stands on them, not on the floor under them)
  const C = X.M.crew(), up = new Set(C.cols.concat(X.M.his())), busyK = SH5.busy && X.mission ? X.mission.k : null;
  // the gang at the next column the crews will raise: two men levering it on its cradle, one dressing its plinth
  const next = busyK === 'col' ? null : COL_IDS.find((id) => !up.has(id) && !Object.values(BAYS).some((b) => b.col === id) && !SH5.own[id] && !SH5.rise[id]);
  if (next) { const fr = colFrame(next), px = fr.x + fr.along[0] * 5, pz = fr.z + fr.along[1] * 5; add(px + fr.across[0] * 1.6, pz + fr.across[1] * 1.6, { role: 'lever', fx: px, fz: pz, crew: 1 }); add(fr.x - fr.along[0] * 1.6 + fr.across[0] * 1.2, fr.z - fr.along[1] * 1.6 + fr.across[1] * 1.2, { role: 'hammer', item: 'chisel', fx: fr.x, fz: fr.z, crew: 1 }); }
  // the joist layers on the newest seated beam: two men on the gallery's joists with mallets
  const seated = BEAMS.filter((B) => X.M.seated(B.id) && SH5.own.__beam !== B.id), B = (SH5.joistAt && BEAM_OF[SH5.joistAt]) || seated[seated.length - 1];   // (station 3 leaves them on the beam it seated)
  if (B) { const mx = (B.pa[0] + B.pb[0]) / 2, mz = (B.pa[1] + B.pb[1]) / 2, R = RUNS.find((r) => r.axis === B.axis && (r.axis === 'x' ? Math.abs(r.line - mz) < 0.1 : Math.abs(r.line - mx) < 0.1 && Math.sign(r.a0 + r.a1) === Math.sign(mz)));
    if (R) { const w0 = (R.wall + R.line) / 2; for (const d of [-2, 2]) { const x = R.axis === 'x' ? mx + d : w0, z = R.axis === 'x' ? w0 : mz + d; add(x, z, { role: 'hammer', item: 'mallet', fx: R.axis === 'x' ? x + 0.5 : R.line, fz: R.axis === 'x' ? R.line : z + 0.5, crew: 2 }, Y.JOIST_TOP); } } }
  // the plasterers at the basin (trowel work: a chisel and mallet on its walls) — out of the way while he works there
  // (in the chamber every man stands on its own floor: its relief, h120/water120.js)
  if (busyK !== 'mikveh') for (const w of [add(MIK.stair + 1.0, MIK.z0 - 1.1, { role: 'hammer', item: 'chisel', fx: MIK.x1 + 1, fz: MIK.z0, crew: 3, tunic: '#E8E0CC' }), add(MIK.x0 - 1.2, (MIK.z0 + MIK.z1) / 2, { role: 'hammer', item: 'mallet', fx: MIK.x0, fz: (MIK.z0 + MIK.z1) / 2, crew: 3, tunic: '#E8E0CC' }), add(MIK.pit.x0 - 0.8, (MIK.pit.z0 + MIK.pit.z1) / 2, { role: 'lever', fx: MIK.pit.x0 + 1, fz: (MIK.pit.z0 + MIK.pit.z1) / 2, crew: 3 })]) if (w) w.a.ground = floorY;
  // a carrier between the stock and the yard (beams on the shoulder)
  if (busyK !== 'saw' && busyK !== 'carry') add(YARD.stock.x - 2, YARD.stock.z0 + 1, { role: 'carry', item: 'beam', from: [YARD.stock.x - 2, YARD.stock.z0 + 1], to: [YARD.his.x0 - 1.5, YARD.his.z - 1.2], crew: 2 });
}

/* ───────── labels, the goal chip ───────── */
export function label(X) {
  css();
  const el = document.createElement('div'); el.className = 'h109-ui h120-lab'; document.body.appendChild(el);
  const L = { el, at: null, set(text, at, hot) { el.textContent = text; L.at = at; el.style.display = text ? '' : 'none'; el.classList.toggle('hot', !!hot); }, frame() { if (!L.at) return; const q = X.scr(L.at.x, L.at.y, L.at.z); el.style.left = q.x + 'px'; el.style.top = q.y + 'px'; el.style.opacity = q.on ? '1' : '0'; }, remove() { el.remove(); const i = SH5.labels.indexOf(L); if (i >= 0) SH5.labels.splice(i, 1); } };
  SH5.labels.push(L); return L;
}
let cssOn = false;
function css() {
  if (cssOn) return; cssOn = true;
  const st = document.createElement('style');
  st.textContent = `.h120-lab{transform:translate(-50%,-50%);font:900 16px/1 Heebo,system-ui;color:#3A2608;background:rgba(255,246,222,.94);border:2px solid #C8A04A;border-radius:12px;padding:3px 8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25);direction:rtl}
.h120-lab.hot{background:#FFE7A0;border-color:#E09A2A}
.h120-goal{display:flex;align-items:center;gap:6px;padding:4px 12px 4px 10px;border-radius:18px;background:rgba(255,248,228,.92);color:#5A3A0A;font:900 16px/1 Heebo,system-ui;box-shadow:0 2px 6px rgba(0,0,0,.18);pointer-events:none;direction:rtl;white-space:nowrap}
.h120-goal small{font:700 11px/1 Heebo,system-ui;color:#8A6A3A}`;
  document.head.appendChild(st);
}
function goalChip(X) {
  css();
  if (!SH5.chip) { SH5.chip = document.createElement('div'); SH5.chip.className = 'h120-goal'; SH5.chip.innerHTML = '<span>🏛</span><small>מפתחים</small><b>0/14</b><small class="k"></small>'; }
  const top = document.querySelector('.gm-top'); if (!top) return;
  const after = top.querySelector('.h109-chip') || top.querySelector('.gm-sc'); const host = (after && after.parentNode) || top;
  if (SH5.chip.parentNode !== host) { if (after && after.nextSibling) host.insertBefore(SH5.chip, after.nextSibling); else host.appendChild(SH5.chip); }
  const n = SH5.final ? 14 : X.M ? X.M.bays() : 0, b = SH5.chip.querySelector('b'), t = `${n}/14`; if (b.textContent !== t) b.textContent = t;
  const up = SH5.final ? 10 : COL_IDS.filter((id) => colState(id).up).length, k = SH5.chip.querySelector('.k'), t2 = `· עמודים ${up}/10`; if (k.textContent !== t2) k.textContent = t2;
}
export function disposeChip() { try { if (SH5.chip) SH5.chip.remove(); } catch (e) { /* */ } }

/* ───────── the camera: an act's close shots (OrbitControls' far limit gives way), the crews kept out of its ground ───────── */
export function keep(X, rects) {
  try { if (X.view && X.view.closeCam) X.view.closeCam(!!(rects && rects.length), 'h120-act'); } catch (e) { /* */ }
  try { if (X.stages.keepOut) X.stages.keepOut(rects || [], { walkOff: true }); } catch (e) { /* */ }   // (walkOff: whoever's way runs into it walks off, no clump at its edge)
  try { if (X.stages.craneOff) X.stages.craneOff(!!(rects && rects.length)); } catch (e) { /* */ }
}

/* ───────── an act's clear view (rule 13; build 118's hidden onlookers) ─────────
 * viewCone(X, shots, opt): while an act runs nothing of the world stands between its camera and its work, or is cut by the frame's
 * bottom. shots: [[eye, aim, workR]…] (every shot the act uses; eye and aim [x, y, z]; workR: how deep the work itself is round its
 * aim). Inside any shot's frustum (with a margin past the frame's edges) and nearer than its work: the world's own figures (the
 * gangs, the masons, the yard's sawyers, the lane's men) are walked out before the act's first frame (they vanish at once and come
 * back after), fixed props (scaffolds, stone piles, the yard's stock and heaps) are hidden for the act and restored, the sledge and
 * the cart stop on their lane before they would enter it, and the stage's crews (crews.js) are kept out of its ground (keepOut).
 * opt: { keep: the act's own ground rects, skip: [figures or meshes the act owns] }. viewCone(X, null) ends it, restoring all. */
const D2R = Math.PI / 180;
function coneOf(X, eye, aim, workR = 3) {
  const e = camAt(X, eye, aim), f = [aim[0] - e[0], aim[1] - e[1], aim[2] - e[2]], d = Math.hypot(...f); f[0] /= d; f[1] /= d; f[2] /= d;
  let r = [-f[2], 0, f[0]]; const rl = Math.hypot(r[0], r[2]) || 1; r = [r[0] / rl, 0, r[2] / rl];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const cam = X.camera, tv = Math.tan(((cam && cam.fov) || 40) * D2R / 2), th = tv * ((cam && cam.aspect) || innerWidth / innerHeight);
  return { e, f, r, u, dW: Math.max(1, d - workR), tv, th, aim, workR };
}
/** is the world point in the cone c, nearer than its work (m: the margin past the frame's edges, as a share of the half-width) */
function inC(c, x, y, z, m = 0.12) {
  const vx = x - c.e[0], vy = y - c.e[1], vz = z - c.e[2], d = vx * c.f[0] + vy * c.f[1] + vz * c.f[2];
  if (d < 0.8 || d > c.dW) return false;
  const px = (vx * c.r[0] + vy * c.r[1] + vz * c.r[2]) / d, py = (vx * c.u[0] + vy * c.u[1] + vz * c.u[2]) / d;
  return Math.abs(px) < c.th * (1 + m) && Math.abs(py) < c.tv * (1 + m);
}
export function inCone(x, y, z) { const C = SH5.cone; return !!C && (C.L.some((c) => inC(c, x, y, z)) || (!!C.live && inC(C.live, x, y, z))); }
/** the cone of the camera as it stands now (the shots of a raise move on; what this one sees is cleared too), to the nearest work */
const LV = { d: null };
function liveCone(C) {
  const cam = SH5.X && SH5.X.camera; if (!cam || !cam.getWorldDirection) return null;
  const T = SH5.X.THREE; LV.d = LV.d || new T.Vector3(); cam.updateMatrixWorld(); cam.getWorldDirection(LV.d);
  const e = [cam.position.x, cam.position.y, cam.position.z], f = [LV.d.x, LV.d.y, LV.d.z];
  let dW = 0; for (const c of C.L) { const a = c.aim; const d = (a[0] - e[0]) * f[0] + (a[1] - e[1]) * f[1] + (a[2] - e[2]) * f[2] - c.workR; if (d > dW) dW = d; }
  if (dW < 1 || dW > 70) return null;   // (the zoom-out over the Mount clears nothing)
  let r = [-f[2], 0, f[0]]; const rl = Math.hypot(r[0], r[2]) || 1; r = [r[0] / rl, 0, r[2] / rl];
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const tv = Math.tan(((cam.fov) || 40) * D2R / 2);
  return { e, f, r, u, dW, tv, th: tv * (cam.aspect || innerWidth / innerHeight) };
}
/** a figure (foot, waist, head) or a mesh (its box's corners, centre and mid-faces) inside the cone */
function figIn(a) { const y = a.y != null ? a.y : H120.FLOOR; return inCone(a.x, y + 0.2, a.z) || inCone(a.x, y + 1.0, a.z) || inCone(a.x, y + 1.9, a.z); }
/** (opt.edge) a figure the frame's edge would cut — part of it on the screen and part off, or within the margin of an edge — is
 *  taken out of the picture too, so no man stands cut by the frame's border while the camera follows the work */
function edgeCut(x, y, z, h = 3.6) {
  const X = SH5.X; if (!X || !X.scr) return false;
  const W = innerWidth, H = innerHeight, m = 40, P = [X.scr(x, y, z), X.scr(x, y + h, z)];
  let inn = 0, out = 0;
  for (const q of P) { if (!q || !q.on) { out++; continue; } if (q.x < m || q.x > W - m || q.y < m || q.y > H - m) out++; else inn++; }
  const mid = X.scr(x, y + h / 2, z); if (mid && mid.on && mid.x > -60 && mid.x < W + 60 && mid.y > -60 && mid.y < H + 60) inn++;
  return out > 0 && inn > 0;
}
let BB = null;
function meshIn(o) {
  const T = SH5.X.THREE; if (!o.userData.h5bb) { BB = BB || new T.Box3(); BB.setFromObject(o); o.userData.h5bb = [BB.min.x, BB.min.y, BB.min.z, BB.max.x, BB.max.y, BB.max.z]; }
  const [x0, y0, z0, x1, y1, z1] = o.userData.h5bb, xm = (x0 + x1) / 2, ym = (y0 + y1) / 2, zm = (z0 + z1) / 2;
  for (const x of [x0, xm, x1]) for (const y of [y0, ym, y1]) for (const z of [z0, zm, z1]) if (inCone(x, y, z)) return true;
  return false;
}
function coneFigs() {
  const L = [].concat(SH5.amb, SH5.site ? SH5.site.men : [], SH5.saw ? SH5.saw.men : [], ...Object.values(SH5.rise).map((R) => R.men));
  return L.filter(Boolean);
}
function coneMeshes() { return [].concat(SH5.site ? SH5.site.all : [], SH5.yard ? SH5.yard.all : [], SH5.lad || []); }
/** (each beat, and after a rebuild) walk out / hide what stands in the cone; bring back what no longer does */
export function coneApply() {
  const C = SH5.cone, scaf = new Set();
  if (C && C.reKeep) { C.reKeep = 0; keep(SH5.X, C.rects); }
  if (C) C.live = C.noLive ? null : liveCone(C);
  const lad = new Set(); if (C) for (const o of SH5.lad || []) if (o.userData.lad && !C.skip.has(o) && meshIn(o)) lad.add(o.userData.lad);
  if (C) for (const o of coneMeshes()) if (o.userData.scaf && !C.skip.has(o) && meshIn(o)) scaf.add(o.userData.scaf);
  // every figure of the shared pool (this stage's gangs and the stage's crews alike), but the act's own; a scaffold's mason with it
  const A = SH5.X && SH5.X.actors ? SH5.X.actors() : null, pool = (A && A.list) || [];
  const skipA = new Set(); if (C) for (const o of C.skip) if (o) skipA.add(o.a || o);
  const scafA = new Set(); for (const w of coneFigs()) if (w.scaf && scaf.has(w.scaf)) scafA.add(w.a);
  for (const a of pool) {
    if (!a || a.alive === false) continue;
    const hit = !!C && !skipA.has(a) && (scafA.has(a) || figIn(a) || (C.edge && edgeCut(a.x, a.y != null ? a.y : H120.FLOOR, a.z, 3.3 * (a.s || 1))));
    if (hit) { if (!a.coneHid) { a.coneHid = 1; a.coneV = a.visT; } a.visT = 0; a.vis = 0; }
    else if (a.coneHid) { a.coneHid = 0; a.visT = a.coneV != null ? a.coneV : 1; }
  }
  // the loose things the crews set down (stones, jars, tools on the floor) — hidden in the cone like the men
  for (const p of (A && A.props) || []) {
    const hit = !!C && !skipA.has(p) && inCone(p.x, p.y + 0.3, p.z);
    if (hit) { if (!p.coneHid) { p.coneHid = 1; p.coneV = p.visT; } p.visT = 0; p.vis = 0; }
    else if (p.coneHid) { p.coneHid = 0; p.visT = p.coneV != null ? p.coneV : 1; }
  }
  for (const o of coneMeshes()) {
    const hit = !!C && !C.skip.has(o) && (o.userData.scaf ? scaf.has(o.userData.scaf) : o.userData.lad ? lad.has(o.userData.lad) : meshIn(o));
    if (hit) { if (!o.userData.coneHid) { o.userData.coneHid = 1; o.userData.coneVis = o.visible; o.visible = false; } }
    else if (o.userData.coneHid) { o.userData.coneHid = 0; o.visible = o.userData.coneVis !== false; }
  }
}
export function viewCone(X, shots, opt = {}) {
  const hw = X.hero && X.hero.h120Workers;
  // (the stage's own wall scaffolds along the chambers: hidden while an act's close shots play, back for the high camera and after)
  try { if (X.stages.h120Scaff) X.stages.h120Scaff('nashim', !(shots && shots.length) || !!opt.depth); } catch (e) { /* */ }
  if (!shots || !shots.length) { SH5.cone = null; coneApply(); keep(X, opt.keep || []); if (hw) hw(null); return; }
  if (hw) hw((x, y, z) => inCone(x, y + 0.2, z) || inCone(x, y + 1.2, z) || inCone(x, y + 2.2, z) || inCone(x, y + 3.2, z) || (opt.edge !== false && edgeCut(x, y, z, 5.6)));   // the stage's own builders (at the builder's size), likewise
  // a crew column still rising in view finishes standing first (its gang never shares the act's ground)
  for (const id of Object.keys(SH5.rise)) { const R = SH5.rise[id]; R.rope.dispose(); R.rope2.dispose(); for (const w of R.men) SH5.crew.remove(w); for (const o of R.all) if (o !== R.C.g) X.props.remove(o); delete SH5.rise[id]; colBuild(X, id); }
  const L = shots.map(([p, t, r]) => coneOf(X, p, t, r));
  if (opt.depth) for (const c of L) c.dW = Math.min(c.dW, opt.depth);   // (opt.depth: clear only this near the lens — a high camera over the court)
  const C = (SH5.cone = { L, skip: new Set(opt.skip || []), laneCap: LANE_L, noLive: opt.live === false, edge: opt.edge !== false });
  // the lane: the farthest point the sledge and the cart (and the men ahead of them) may reach outside the cone
  for (let s = 0; s <= LANE_L; s += 0.5) { const q = laneAt(s); let bad = false; for (const y of [0.5, 1.5, 2.5]) for (const k of [-2, 0, 2, 6]) { const p2 = laneAt(Math.min(LANE_L, s + k)); if (inCone(p2.x, H120.FLOOR + y, p2.z)) bad = true; } void q; if (bad) { C.laneCap = Math.max(0, s - 2); break; } }
  // the stage's crews (crews.js) kept off the cone's ground: three depth bands per shot, each its bounding rect on the floor
  const rects = (opt.keep || []).slice();
  for (const c of L) {
    const NB = L.length > 2 ? 2 : 3, bands = Array.from({ length: NB }, () => []);   // (crews.js keeps six rects: two bands a shot when there are more than two shots)
    for (let i = 0; i <= 24; i++) for (let j = -12; j <= 12; j++) {
      const d = (c.dW * i) / 24, w = (j / 12) * d * c.th * 1.15, x = c.e[0] + c.f[0] * d + c.r[0] * w, z = c.e[2] + c.f[2] * d + c.r[2] * w;
      if ([0.2, 1, 2].some((y) => inC(c, x, H120.FLOOR + y, z))) bands[Math.min(NB - 1, Math.floor((i / 25) * NB))].push([x, z]);
    }
    for (const B of bands) if (B.length) rects.push([Math.min(...B.map((p) => p[0])), Math.min(...B.map((p) => p[1])), Math.max(...B.map((p) => p[0])), Math.max(...B.map((p) => p[1]))]);
  }
  C.rects = rects.slice(0, 6);
  keep(X, C.rects);
  coneApply(); C.reKeep = 1;   // (the director sets its own ground rect right after make(): the next beat sets the act's again)
}
/** (the director sets its own ground rect after make(): an act calls this again in its begin()) */
export function coneKeep(X) { if (SH5.cone) keep(X, SH5.cone.rects); }
/** an act's own figures or meshes, never hidden by its cone */
/** a life-size kohen among the crew (white, his turban and sash): the acts' own kohen where his hands work at the crews' scale */
export function kohenFig(x, z, o = {}) { return SH5.crew ? SH5.crew.add(x, z, { role: 'hold', crew: 2, variant: 'kohen', tunic: '#FFFFFF', col2: '#2E1E12', ...o }) : null; }
/** a figure's two hands brought onto a grip p ({x, y, z}): the arms raised or lowered toward its height, the body stepping (inside a
 *  leash round o.home) so the hands are on it; called every frame while he holds it. o: { home [x, z], leash, spread, rMin, rMax, face } */
export function handsTo(X, w, p, o = {}) {
  if (!w || !p || !w.a) return null;
  const a = w.a, A = X.actors ? X.actors() : null; if (!A || !A.handWorld) return null;
  let L, R; try { L = A.handWorld(a, 1, new X.THREE.Vector3()); R = A.handWorld(a, -1, new X.THREE.Vector3()); } catch (e) { return null; }
  const mx = (L.x + R.x) / 2, my = (L.y + R.y) / 2, mz = (L.z + R.z) / 2;
  const r = clamp((a.armT[0] || 0) + clamp((p.y - my) * 0.5, -0.09, 0.09), o.rMin != null ? o.rMin : 0.4, o.rMax != null ? o.rMax : 2.7);
  a.arm[0] = a.armT[0] = a.arm[2] = a.armT[2] = r; a.arm[1] = a.armT[1] = a.arm[3] = a.armT[3] = o.spread != null ? o.spread : -0.24;
  if (o.home) {
    let nx = a.x + clamp((p.x - mx) * 0.7, -0.14, 0.14), nz = a.z + clamp((p.z - mz) * 0.7, -0.14, 0.14);
    const dx = nx - o.home[0], dz = nz - o.home[1], d = Math.hypot(dx, dz), R0 = o.leash != null ? o.leash : 0.7;
    if (d > R0) { nx = o.home[0] + (dx / d) * R0; nz = o.home[1] + (dz / d) * R0; }
    a.x = nx; a.z = nz;
  }
  if (o.face !== false) a.yaw = Math.atan2(p.x - a.x, p.z - a.z);
  return Math.hypot(p.x - mx, p.y - my, p.z - mz);
}
export function coneOwn(...objs) { if (SH5.cone) for (const o of objs) if (o) SH5.cone.skip.add(o); }

/* ───────── the world as the save has it ───────── */
function modelHide(X, hide) { try { if (X.stages.nashimGallery) X.stages.nashimGallery(!hide); } catch (e) { /* */ } }
export function initWorld(X) {
  css(); mats(X);
  SH5.X = X; SH5.B = createBeat(X); SH5.crew = createGang(X); try { window.__H120_SH5 = SH5; } catch (e) { /* (the probes' eyes) */ }
  SH5.cols = {}; SH5.colKey = {}; SH5.rise = {}; SH5.own = {};
  if (X.M.finished()) SH5.final = 1;
  modelHide(X, true);
  const lad = []; laddersBuild(X, lad); SH5.lad = lad;
  colsSync(X, true);
  beamsBuild(X); yardBuild(X); chamberBuild(X); siteBuild(X);
  ambient(X); SH5.ambKey = ambKeyOf(X);
}
/** the stage done: everything stands, the gallery planked; the yard and the site's rigs go */
export function finalWorld(X) {
  if (!SH5.X) return;
  SH5.final = 1;
  for (const id of COL_IDS) if (!SH5.own[id]) colBuild(X, id);
  beamsBuild(X); yardBuild(X); siteBuild(X); chamberBuild(X); ambient(X);
}
/** an act takes a thing out of the world's hands while it plays it (a column id, or '__beam': a beam id) */
export function own(id, v) { if (v) SH5.own[id] = v; else delete SH5.own[id]; }
export function ensureWorld(X) {
  const st = X.M && X.M.st; if (!st) return;
  colsSync(X, false);
  if (SH5.beamKey !== beamsKey(X)) beamsBuild(X);
  if (SH5.chKey !== chKey(X) && !(SH5.busy && SH5.mikLv)) chamberBuild(X);
  if (SH5.site && SH5.siteKey !== siteKeyOf(X) && !SH5.busy) siteBuild(X);
  const k = ambKeyOf(X); if (k !== SH5.ambKey) { SH5.ambKey = k; ambient(X); yardBuild(X); if (SH5.cone) coneApply(); }
}
let jT = 0;
export function frameWorld(dt, X) {
  if (SH5.film) { try { SH5.film.frame(dt); } catch (e) { console.warn('[h120] film frame', e && e.message); } }
  if (!SH5.B) return;
  SH5.t += dt;
  SH5.B.step(dt); if (SH5.crew) SH5.crew.update(dt, SH5.B);
  riseFrame(dt); sawFrame(dt); laneFrame(dt);
  waterTick(dt, X);
  jT -= dt; if (jT <= 0) { jT = 0.5; modelHide(X, true); ensureWorld(X); goalChip(X); if (SH5.cone || SH5.coneWas) { coneApply(); SH5.coneWas = !!SH5.cone; } }
  if (SH5.cone) coneHold(X);
  for (const L of SH5.labels) L.frame();
  // (no two labels overlap: a later one that meets an earlier one moves up above it)
  { const on = SH5.labels.filter((L) => L.at && L.el.style.display !== 'none' && L.el.style.opacity !== '0'); const R = [];
    for (const L of on) { let r = L.el.getBoundingClientRect(), dy = 0; for (let k = 0; k < 4; k++) { const hit = R.find((q) => r.left < q.right && r.right > q.left && r.top - dy < q.bottom && r.bottom - dy > q.top); if (!hit) break; dy += (r.bottom - dy) - hit.top + 4; } if (dy) L.el.style.top = (parseFloat(L.el.style.top) - dy) + 'px'; R.push({ left: r.left, right: r.right, top: r.top - dy, bottom: r.bottom - dy }); } }
}
/** every frame: what the cone hid stays hidden though its crew shows it again (crews.js sets its men's visT as they walk and work) */
function coneHold(X) {
  const A = X.actors ? X.actors() : null; if (!A) return;
  for (const a of A.list || []) if (a && a.coneHid) { a.visT = 0; a.vis = 0; }
  for (const p of A.props || []) if (p && p.coneHid) { p.visT = 0; p.vis = 0; }
}
export { clamp, lerp, ease, TAU };
