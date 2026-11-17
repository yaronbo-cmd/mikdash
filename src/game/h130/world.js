/* ── build 130 ── h130/world.js — the things of the new stage 05 in the world, drawn from the save (brief §7): the gallery of each side
 * as he built it — the columns at his places, the beams with their sag or crack and the rough prop under a cracked one, the corbels
 * in the wall, the joists, the floor, the railing, the seats (sunk over a sagging beam), the ladders — while the model's own gallery
 * (temple.js set 'nashim-gz', fixed places) stays hidden, in this stage and every later one; the broken column's halves by the gate
 * (gal.column); the site's crews off the wood chamber (BOOK.s05.crewSite: scaffolds with a mason each, the stone piles).
 * The acts draw their own layouts with the same galDraw(side, layout). Every place is the book's; every size is a size here.
 *   SH130 · mats · box · label · initWorld(X) · frameWorld(dt, X) · finalWorld(X) · restWorld(X) · galDraw(X, side, layout, o) ·
 *   colMesh(X, fr, o) · shearLegs(X, fr, all, h, back) · frameOf(side, a) · GEO · Y
 */
import { BOOK } from '../world/grid.js';
import { RUNS, spans, colXZ, GAL } from './model.js';
import { h120Ladder } from '../../temple.js';
import { createBeat, createGang, clamp, lerp, ease } from '../h109/kit.js';

const S5 = BOOK.s05, GB = S5.gal;
/** the gallery's sizes (illustration, as build 120's layout): the plinth, the monolith, the beam, the joists, the floor, the railing */
export const GEO = Object.freeze({ FLOOR: S5.court.floor, PLINTH: 0.4, PLINTH_W: 1.6, COL_H: 10, R0: 0.6, R1: 0.5, BEAM_H: 0.6, BEAM_W: 0.7, JOIST: 0.3, JOIST_W: 0.32, JOIST_GAP: 2.2, PLANK: 0.1, RAIL: 1.3, SEAT_H: 0.45, CRADLE: 8 });
export const Y = Object.freeze({
  PLINTH_TOP: GEO.FLOOR + GEO.PLINTH, COL_TOP: GEO.FLOOR + GEO.PLINTH + GEO.COL_H, BEAM_TOP: GEO.FLOOR + GEO.PLINTH + GEO.COL_H + GEO.BEAM_H,
  JOIST_TOP: GEO.FLOOR + GEO.PLINTH + GEO.COL_H + GEO.BEAM_H + GEO.JOIST, GFLOOR: GEO.FLOOR + GEO.PLINTH + GEO.COL_H + GEO.BEAM_H + GEO.JOIST + GEO.PLANK,
});
export const SH130 = { X: null, B: null, crew: null, gal: {}, galKey: {}, own: {}, site: null, labels: [], t: 0, broke: null, brokeKey: '' };

/* ───────── materials ───────── */
export function mats(X) {
  const P = X.props, T = X.THREE;
  if (P.M.n5marble) return P.M;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, ...o });
  P.M.n5marble = std('#EDE6D6', { roughness: 0.45, flatShading: false });
  P.M.n5lime = std('#D9CAA6', { roughness: 0.9 });
  P.M.n5limeD = std('#C2B08A', { roughness: 0.92 });
  P.M.n5cedar = std('#A8743E', { roughness: 0.8 });
  P.M.n5cedarL = std('#BE8A50', { roughness: 0.8 });
  P.M.n5cedarD = std('#7C5230', { roughness: 0.85 });
  P.M.n5bronze = std('#B07A3A', { roughness: 0.35, metalness: 0.7, flatShading: false });
  P.M.n5lead = std('#8E9298', { roughness: 0.5, metalness: 0.5 });
  P.M.n5rough = std('#6A4A2A', { roughness: 1 });
  P.M.n5dark = new T.MeshBasicMaterial({ color: 0x2A2016 });
  P.M.n5green = new T.MeshBasicMaterial({ color: 0x4FC46A, transparent: true, opacity: 0.85, depthWrite: false });
  P.M.n5chalk = new T.MeshBasicMaterial({ color: 0xF4EEDC, transparent: true, opacity: 0.9, depthWrite: false });
  P.M.n5ghost = new T.MeshStandardMaterial({ color: '#E8C890', roughness: 0.8, transparent: true, opacity: 0.38, depthWrite: false });
  P.M.n5ghostSag = new T.MeshStandardMaterial({ color: '#F0A040', roughness: 0.8, transparent: true, opacity: 0.55, depthWrite: false });
  P.M.n5ghostCrack = new T.MeshStandardMaterial({ color: '#D8402A', emissive: '#601008', roughness: 0.8, transparent: true, opacity: 0.7, depthWrite: false });
  P.M.n5rope = P.M.rope || std('#C9A46A', { roughness: 0.95 });
  return P.M;
}
/** a box from x0..x1, y0..y1, z0..z1 */
export function box(X, mat, x0, y0, z0, x1, y1, z1, parent) {
  const m = new X.THREE.Mesh(X.props.geo.box, mat); m.scale.set(Math.max(1e-3, Math.abs(x1 - x0)), Math.max(1e-3, Math.abs(y1 - y0)), Math.max(1e-3, Math.abs(z1 - z0))); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = true; m.receiveShadow = true; (parent || X.props.root).add(m); return m;
}
function inst(X, mat, L, all) {
  const T = X.THREE; if (!L.length) return null;
  const m = new T.InstancedMesh(X.props.geo.box, mat, L.length), M4 = new T.Matrix4(), q = new T.Quaternion(), p = new T.Vector3(), s = new T.Vector3();
  L.forEach((b, i) => { p.set((b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2); s.set(Math.abs(b[3] - b[0]), Math.abs(b[4] - b[1]), Math.abs(b[5] - b[2])); M4.compose(p, q, s); m.setMatrixAt(i, M4); });
  m.castShadow = true; m.receiveShadow = true; X.props.root.add(m); if (all) all.push(m); return m;
}
const drop = (X, all) => { for (const o of all) { X.props.remove(o); if (o.isInstancedMesh && o.dispose) o.dispose(); } all.length = 0; };

/* ───────── a column's frame: its foot on the run, the way it lies (along: toward the court for a waiting one; for the raised one the
   rig's way) and the court's side (across) ───────── */
/** the frame of a column at a along a side's run: x, z, the run's own direction (runDir) and the court's side (court) */
export function frameOf(side, a) {
  const R = RUNS[side], [x, z] = colXZ(R, a);
  const court = R.axis === 'x' ? [0, -Math.sign(R.line)] : [-1, 0], runDir = R.axis === 'x' ? [1, 0] : [0, 1];
  return { side, a, x, z, court, runDir };
}
/** a column: its plinth and the shaft on a pivot at the foot (lying toward `along` at θ, or standing with a lean in fingers).
 *  fr: { x, z, along, across }; o: { th, lean, off, wedges, chip, crack, cradle, mark, ghost } */
export function colMesh(X, fr, o = {}) {
  const T = X.THREE, M = mats(X), g = new T.Group(), F = 1 / 24, pw = GEO.PLINTH_W / 2, ghost = !!o.ghost;
  const mat = ghost ? M.n5ghost : M.n5marble;
  const plinth = o.noPlinth ? null : box(X, ghost ? M.n5ghost : M.n5lime, fr.x - pw, GEO.FLOOR, fr.z - pw, fr.x + pw, Y.PLINTH_TOP, fr.z + pw, g);
  const off = o.off || [0, 0], fx = fr.x + (fr.along[0] * off[0] + fr.across[0] * off[1]) * F, fz = fr.z + (fr.along[1] * off[0] + fr.across[1] * off[1]) * F;
  const piv = new T.Group(); piv.position.set(fx, o.noPlinth ? GEO.FLOOR + (o.lift || 0) : Y.PLINTH_TOP, fz); g.add(piv);
  const sg = new T.CylinderGeometry(GEO.R1, GEO.R0, GEO.COL_H - 0.3, 18); sg.translate(0, (GEO.COL_H - 0.3) / 2, 0);
  const shaft = new T.Mesh(sg, mat); shaft.castShadow = !ghost; shaft.receiveShadow = true; piv.add(shaft);
  const cap = box(X, mat, -0.62, GEO.COL_H - 0.3, -0.62, 0.62, GEO.COL_H, 0.62, piv); cap.castShadow = !ghost;
  if (o.chip) box(X, M.n5dark, GEO.R0 - 0.1, 0, -0.16, GEO.R0 + 0.02, 0.16, 0.16, piv);
  if (o.crack) { const k = box(X, M.n5dark, -0.025, 2.4, -0.025, 0.025, 7.1, 0.025, piv); k.position.x = (GEO.R0 + GEO.R1) / 2 - 0.02; k.rotation.z = 0.04; }
  const n = o.wedges | 0, sides = [fr.along, [-fr.along[0], -fr.along[1]], fr.across, [-fr.across[0], -fr.across[1]]];
  for (let i = 0; i < n; i++) { const s = sides[i % 4], k = Math.floor(i / 4) * 0.22 - 0.1, px = fx + s[0] * 0.66 + (s[1] ? k : 0), pz = fz + s[1] * 0.66 + (s[0] ? k : 0); box(X, M.n5lead, px - 0.1, Y.PLINTH_TOP, pz - 0.1, px + 0.1, Y.PLINTH_TOP + 0.08, pz + 0.1, g); }
  let cradle = null;
  if (o.cradle) {
    cradle = new T.Group(); g.add(cradle);
    for (const u of [4.2, 8.2]) { const h = Y.PLINTH_TOP + u * Math.sin(GEO.CRADLE * Math.PI / 180) - GEO.R0 * 0.95, px = fr.x + fr.along[0] * u * Math.cos(GEO.CRADLE * Math.PI / 180), pz = fr.z + fr.along[1] * u * Math.cos(GEO.CRADLE * Math.PI / 180);
      const a = fr.across, L = 1.9; box(X, M.n5cedarD, Math.min(px - a[0] * L, px + a[0] * L) - 0.22 * Math.abs(a[1]), GEO.FLOOR, Math.min(pz - a[1] * L, pz + a[1] * L) - 0.22 * Math.abs(a[0]), Math.max(px - a[0] * L, px + a[0] * L) + 0.22 * Math.abs(a[1]), h, Math.max(pz - a[1] * L, pz + a[1] * L) + 0.22 * Math.abs(a[0]), cradle); }
  }
  let mark = null;
  if (o.mark) { mark = new T.Mesh(new T.RingGeometry(GEO.R0 - 0.04, GEO.R0 + 0.05, 28), M.n5green); mark.rotation.x = -Math.PI / 2; mark.position.set(fr.x, (o.noPlinth ? GEO.FLOOR : Y.PLINTH_TOP) + 0.012, fr.z); mark.renderOrder = 3; g.add(mark); }
  X.props.root.add(g);
  const C = { g, piv, shaft, cap, plinth, cradle, mark, fr, foot: { x: fx, z: fz },
    pose(th, lean) {
      let v;
      if (th >= 89.999 && lean) { const la = (+lean[0] || 0) * F, lc = (+lean[1] || 0) * F; v = new T.Vector3(fr.along[0] * la + fr.across[0] * lc, GEO.COL_H, fr.along[1] * la + fr.across[1] * lc).normalize(); }
      else { const r = th * Math.PI / 180; v = new T.Vector3(fr.along[0] * Math.cos(r), Math.sin(r), fr.along[1] * Math.cos(r)).normalize(); }
      piv.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v);
    },
    at(u, out) { const v = out || new T.Vector3(); v.set(0, GEO.COL_H * u, 0).applyQuaternion(piv.quaternion).add(piv.position); return v; },
  };
  C.pose(o.th != null ? o.th : 90, o.lean);
  return C;
}
/** the shear legs (חמור) over the foot; head: the lashing's world point */
export function shearLegs(X, fr, all, h = 12, back = 1.5) {
  const T = X.THREE, M = mats(X);
  const hx = fr.x - fr.along[0] * back, hz = fr.z - fr.along[1] * back, head = new T.Vector3(hx, GEO.FLOOR + h, hz);
  for (const s of [-1, 1]) {
    const fx = fr.x + fr.across[0] * 2.4 * s - fr.along[0] * 0.4, fz = fr.z + fr.across[1] * 2.4 * s - fr.along[1] * 0.4, a = new T.Vector3(fx, GEO.FLOOR, fz);
    const v = new T.Vector3().subVectors(head, a), L = v.length(), m = new T.Mesh(new T.CylinderGeometry(0.16, 0.2, L + 0.6, 7), M.n5cedarD);
    m.position.copy(a).addScaledVector(v, 0.5 + 0.3 / L); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize()); m.castShadow = true; X.props.root.add(m); all.push(m);
  }
  const k = new T.Mesh(new T.SphereGeometry(0.3, 8, 6), M.n5rope); k.position.copy(head); X.props.root.add(k); all.push(k);
  return head;
}

/** the way from the column line toward the wall the gallery hangs from (+1 / −1 along the line's normal axis) */
export const wallWay = (R) => Math.sign(R.wall - R.line);
/** the gallery's edge on the court's side and its railing (across the line: the normal axis' coordinate), the railing's top */
export function railOf(side) { const R = RUNS[side], s = wallWay(R), out = R.line - s * (GEO.BEAM_W / 2 + 0.25); return { s, out, re: out + s * 0.12, top: Y.GFLOOR + GEO.RAIL }; }
/** the sink of the gallery's floor at a along the run (a sagging beam's, or a cracked one's) */
export function sinkAt(G, a) { const g = G.find((q) => a >= q.a0 - 1e-6 && a <= q.a1 + 1e-6); if (!g) return 0; const d = g.kind === 'crack' ? GAL.CRACK_SINK : g.sag; if (!d) return 0; return d * Math.sin(Math.PI * (a - g.a0) / (g.a1 - g.a0)); }

/* ───────── the gallery of a side, drawn from a layout { cols [along], props [along], raised { lean, off, wedges, chip, crack } | null,
   open: true (no deck: the columns only — the puzzle's standing columns) } ───────── */
/** draw (or redraw) a side's gallery; o: { ghost: plan only (faint columns and beams coloured by their kind), standing: [bool] per
 *  column (else every column stands), deck: false (columns and beams only), beams: false (the columns alone) } → the record { all, cols: [C], beams } */
export function galDraw(X, side, layout, o = {}) {
  galClear(X, side);
  if (!layout || !layout.cols) return null;
  const T = X.THREE, M = mats(X), R = RUNS[side], all = [], cols = [], ghost = !!o.ghost;
  const sorted = layout.cols.map((a, i) => ({ a, i })).sort((p, q) => p.a - q.a);
  const along = (a, w0, w1, y0, y1, a0, a1) => (R.axis === 'x' ? [a0, y0, Math.min(w0, w1), a1, y1, Math.max(w0, w1)] : [Math.min(w0, w1), y0, a0, Math.max(w0, w1), y1, a1]);
  // the columns
  for (const { a, i } of sorted) {
    if (o.standing && !o.standing[i]) continue;
    const f = frameOf(side, a), fr = { x: f.x, z: f.z, along: f.court, across: f.runDir };
    const rz = layout.raised && layout.raisedAt != null && Math.abs(layout.raisedAt - a) < 1e-6 ? layout.raised : null;
    const C = colMesh(X, fr, { th: 90, ghost, lean: rz ? rz.lean : null, off: rz ? rz.off : null, wedges: rz ? rz.wedges : 0, chip: rz ? rz.chip : 0, crack: rz ? rz.crack : 0 });
    all.push(C.g); cols.push(C); C.i = i;
  }
  // the beams over every gap: straight; sagging (two halves meeting lower at the middle); cracked (a V, a rough prop under it)
  const s = wallWay(R), hw = GEO.BEAM_W / 2, wl = R.line;
  const G = spans(R, layout.cols), beams = [];
  for (const g of o.beams === false ? [] : G) {
    const mat = ghost ? (g.kind === 'straight' ? M.n5ghost : g.kind === 'sag' ? M.n5ghostSag : M.n5ghostCrack) : M.n5cedar;
    const mid = (g.a0 + g.a1) / 2, dip = g.kind === 'crack' ? 0.35 : g.sag;
    if (!dip) { const b = box(X, mat, ...along(0, wl - hw, wl + hw, Y.COL_TOP, Y.BEAM_TOP, g.a0, g.a1)); all.push(b); beams.push(b); continue; }
    // two halves, each from its support down to the middle
    for (const [p0, p1] of [[g.a0, mid], [mid, g.a1]]) {
      const len = Math.abs(p1 - p0), m = new T.Mesh(X.props.geo.box, mat); m.castShadow = !ghost;
      const ang = Math.atan2(dip, len / 2) * (p0 < mid ? -1 : 1);
      if (R.axis === 'x') { m.scale.set(len + 0.05, GEO.BEAM_H, GEO.BEAM_W); m.position.set((p0 + p1) / 2, (Y.COL_TOP + Y.BEAM_TOP) / 2 - dip / 2, wl); m.rotation.z = ang; }
      else { m.scale.set(GEO.BEAM_W, GEO.BEAM_H, len + 0.05); m.position.set(wl, (Y.COL_TOP + Y.BEAM_TOP) / 2 - dip / 2, (p0 + p1) / 2); m.rotation.x = -ang; }
      X.props.root.add(m); all.push(m); beams.push(m);
    }
    if (g.kind === 'crack' && !ghost) { const [cx, cz] = colXZ(R, mid); all.push(box(X, M.n5dark, cx - 0.06, Y.COL_TOP - dip - 0.05, cz - 0.06, cx + 0.06, Y.BEAM_TOP - dip + 0.02, cz + 0.06)); }
  }
  // the rough props under cracked beams (they stay): a post and its stone
  for (const a of layout.props || []) {
    const [cx, cz] = colXZ(R, a); const p = new T.Mesh(new T.CylinderGeometry(0.2, 0.24, Y.COL_TOP - GEO.FLOOR - 0.65, 7), M.n5rough); p.position.set(cx + 0.15, (Y.COL_TOP + GEO.FLOOR - 0.35) / 2 + 0.15, cz + 0.1); p.rotation.z = 0.03; p.castShadow = true; X.props.root.add(p); all.push(p);
    all.push(box(X, M.n5limeD, cx - 0.45, GEO.FLOOR, cz - 0.45, cx + 0.45, GEO.FLOOR + 0.3, cz + 0.45));
  }
  if (o.deck !== false && !ghost) {
    // the deck: corbels in the wall, joists, the floor (sunk over a sagging beam), the railing on the court's edge, two rows of seats
    const out = R.line - s * (hw + 0.25), corb = [], joist = [], plank = [], rail = [], seat = [];
    const n = Math.max(1, Math.round((R.a1 - R.a0) / GEO.JOIST_GAP)), J = []; for (let i = 0; i <= n; i++) J.push(R.a0 + 0.3 + ((R.a1 - R.a0 - 0.6) * i) / n);
    const inCut = (a) => R.cut && a > R.cut[0] && a < R.cut[1];
    for (const a of J) {
      if (inCut(a)) continue;
      const dy = sinkAt(G, a);
      corb.push(along(0, R.wall, R.wall - s * 0.9, Y.BEAM_TOP - 0.7, Y.BEAM_TOP, a - 0.22, a + 0.22));
      joist.push(along(0, R.wall, out, Y.BEAM_TOP - dy, Y.JOIST_TOP - dy, a - GEO.JOIST_W / 2, a + GEO.JOIST_W / 2));
    }
    // the floor and the seats in pieces of about an amah, each at its own sink; the railing straight from post to post
    for (const [s0, s1] of R.cut ? [[R.a0, R.cut[0]], [R.cut[1], R.a1]] : [[R.a0, R.a1]]) {
      const k = Math.max(1, Math.round(s1 - s0));
      for (let i = 0; i < k; i++) {
        const a0 = s0 + ((s1 - s0) * i) / k, a1 = s0 + ((s1 - s0) * (i + 1)) / k, dy = sinkAt(G, (a0 + a1) / 2);
        plank.push(along(0, R.wall, out, Y.JOIST_TOP - dy, Y.GFLOOR - dy, a0, a1 + 0.01));
        for (const d of [1.2, 3.0]) { const w = R.wall - s * d; seat.push(along(0, w - 0.35, w + 0.35, Y.GFLOOR - dy, Y.GFLOOR - dy + GEO.SEAT_H, a0 + 0.05, a1 - 0.05)); }
      }
      const re = out + s * 0.12;
      rail.push(along(0, re - 0.1, re + 0.1, Y.GFLOOR + GEO.RAIL - 0.12, Y.GFLOOR + GEO.RAIL, s0, s1));
      rail.push(along(0, re - 0.04, re + 0.04, Y.GFLOOR + 0.3, Y.GFLOOR + GEO.RAIL - 0.12, s0, s1));   // (the balustrade's boards: what sinks under the top rail is cut)
      for (const a of J) if (a >= s0 && a <= s1) rail.push(along(0, re - 0.08, re + 0.08, Y.GFLOOR, Y.GFLOOR + GEO.RAIL, a - 0.08, a + 0.08));
    }
    inst(X, M.n5limeD, corb, all); inst(X, M.n5cedarD, joist, all); inst(X, M.n5cedarL, plank, all); inst(X, M.n5cedarD, rail, all); inst(X, M.n5cedar, seat, all);
    // the ladders up to it (the book's, at the run's ends)
    S5.ladders.forEach(([x, z, fx, fz]) => { if (!(R.axis === 'x' ? Math.sign(z) === Math.sign(R.line) && x >= R.a0 && x <= R.a1 : Math.abs(x - R.line) < 4)) return; for (const geo of h120Ladder(x, z, fx, fz, GEO.FLOOR, Y.GFLOOR)) { const m = new T.Mesh(geo, M.n5cedarD); m.castShadow = true; X.props.root.add(m); all.push(m); } });
  }
  const rec = { all, cols, beams, gaps: G, side };
  SH130.gal[side] = rec;
  return rec;
}
export function galClear(X, side) { const r = SH130.gal[side]; if (r) drop(X, r.all); SH130.gal[side] = null; SH130.galKey[side] = ''; }

/* ───────── the world as the save has it ───────── */
const layoutOf = (X, side) => { try { return X.M && X.M.galOf ? X.M.galOf(side) : null; } catch (e) { return null; } };
const keyOf = (X, side) => JSON.stringify([layoutOf(X, side), SH130.own[side] || 0]);
function galSync(X) {
  for (const side of ['N', 'S', 'E']) {
    if (SH130.own[side]) continue;
    const k = keyOf(X, side); if (SH130.galKey[side] === k) continue;
    const L = layoutOf(X, side);
    if (L) galDraw(X, side, L); else galClear(X, side);
    SH130.galKey[side] = k;
  }
  // the broken raised column's halves by the gate's stone pile (gal.column): they stay
  const nb = X.M && X.M.st ? (X.M.st.marks || []).filter((q) => q.f === 'gal.column').length : 0, bk = String(nb);
  if (bk !== SH130.brokeKey) {
    SH130.brokeKey = bk; if (SH130.broke) drop(X, SH130.broke); SH130.broke = [];
    const T = X.THREE, M = mats(X), [bx, bz] = S5.brokeAt;
    for (let i = 0; i < nb; i++) for (const [u0, u1, k] of [[0.3, 5.0, 0.12], [5.25, 10.0, -0.1]]) { const m = new T.Mesh(new T.CylinderGeometry(0.53, 0.58, u1 - u0, 14), M.n5marble); m.rotation.set(0, k + i * 0.4, Math.PI / 2); m.position.set(bx + i * 1.4 + k * 3, GEO.FLOOR + 0.55, bz + (u0 + u1) / 2 - 5 + i * 1.3); m.castShadow = true; X.props.root.add(m); SH130.broke.push(m); }
  }
}
/** the site's crews (re-planned off the wood chamber): a scaffold with a mason on it at each of its places, the stone piles */
function siteBuild(X) {
  if (SH130.site) drop(X, SH130.site.all);
  const all = [], men = [], M = mats(X), CS = S5.crewSite;
  for (const [x0, z0, x1, z1] of CS.scaff) {
    const top = GEO.FLOOR + 5;
    for (const [x, z] of [[x0, z0], [x1, z0], [x0, z1], [x1, z1]]) all.push(box(X, M.n5cedarD, x - 0.1, GEO.FLOOR, z - 0.1, x + 0.1, top + 1.2, z + 0.1));
    all.push(box(X, M.n5cedarL, x0, top, z0, x1, top + 0.15, z1));
    const w = SH130.crew ? SH130.crew.add((x0 + x1) / 2, (z0 + z1) / 2, { role: 'hammer', item: 'mallet', fx: (x0 + x1) / 2 + (Math.abs(x1 - x0) < 3 ? -1 : 0), fz: (z0 + z1) / 2 + (Math.abs(x1 - x0) >= 3 ? -1 : 0), crew: 1 }) : null;
    if (w) { w.a.y = w.a.fixedY = top + 0.15; men.push(w); }
  }
  for (const [x, z, n] of CS.piles) for (let i = 0; i < n; i++) { const r = Math.floor(i / 3), c = i % 3; all.push(box(X, M.n5lime, x + (c - 1) * 1.1 - 0.5, GEO.FLOOR + r * 0.7, z - 0.4 + r * 0.2, x + (c - 1) * 1.1 + 0.5, GEO.FLOOR + r * 0.7 + 0.65, z + 0.4 + r * 0.2)); }
  SH130.site = { all, men };
}
function modelHide(X, hide) { try { if (X.stages.nashimGallery) X.stages.nashimGallery(!hide); } catch (e) { /* */ } }
export function initWorld(X) {
  mats(X);
  SH130.X = X; SH130.B = createBeat(X); if (!SH130.crew) SH130.crew = createGang(X);
  try { window.__H130_SH = SH130; } catch (e) { /* (the probes' eyes) */ }
  try { const A = X.actors && X.actors(); if (A && A.setInstantVis) A.setInstantVis(true); } catch (e) { /* */ }
  modelHide(X, true);
  for (const s of ['N', 'S', 'E']) SH130.galKey[s] = null;
  galSync(X);
  if (!SH130.site) siteBuild(X);
}
/** after a reload, the stage done or later: his gallery as he built it, the model's own hidden; no crews of the stage */
export function restWorld(X) { mats(X); SH130.X = X; modelHide(X, true); galSync(X); }
export function finalWorld(X) { if (!SH130.X) return; galSync(X); }
/** an act takes a side's gallery out of the world's hands while it draws its own */
export function own(side, v) { if (v) SH130.own[side] = 1; else delete SH130.own[side]; SH130.galKey[side] = null; }
let jT = 0;
export function frameWorld(dt, X) {
  if (!SH130.B) return;
  SH130.t += dt;
  SH130.B.step(dt); if (SH130.crew) SH130.crew.update(dt, SH130.B);
  jT -= dt; if (jT <= 0) { jT = 0.5; modelHide(X, true); galSync(X); }
  for (const L of SH130.labels) L.frame();
}

/* ───────── a label over a world point ───────── */
let cssOn = false;
function css() {
  if (cssOn) return; cssOn = true;
  const st = document.createElement('style');
  st.textContent = `.h130-lab{transform:translate(-50%,-50%);font:900 16px/1 Heebo,system-ui;color:#3A2608;background:rgba(255,246,222,.94);border:2px solid #C8A04A;border-radius:12px;padding:3px 8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25);direction:rtl}
.h130-lab.hot{background:#FFE7A0;border-color:#E09A2A}
.h130-ill{left:calc(12px + env(safe-area-inset-left,0px));top:calc(64px + env(safe-area-inset-top,0px));background:rgba(28,20,10,.72);color:#FFE9B0;font:800 14px/1 Heebo,system-ui;padding:6px 12px;border-radius:10px;direction:rtl}
.h130-src{left:50%;top:calc(96px + env(safe-area-inset-top,0px));transform:translateX(-50%);max-width:min(86vw,760px);background:rgba(28,20,10,.82);color:#FFF6DA;font:700 15px/1.35 Heebo,system-ui;padding:8px 14px;border-radius:12px;direction:rtl;text-align:center;transition:opacity .4s}
.h130-src.off{opacity:0}`;
  document.head.appendChild(st);
}
export function label(X) {
  css();
  const el = document.createElement('div'); el.className = 'h109-ui h130-lab'; document.body.appendChild(el);
  const L = { el, at: null, set(text, at, hot) { el.textContent = text; L.at = at; el.style.display = text ? '' : 'none'; el.classList.toggle('hot', !!hot); }, frame() { if (!L.at) return; const q = X.scr(L.at.x, L.at.y, L.at.z); el.style.left = q.x + 'px'; el.style.top = q.y + 'px'; el.style.opacity = q.on ? '1' : '0'; }, remove() { el.remove(); const i = SH130.labels.indexOf(L); if (i >= 0) SH130.labels.splice(i, 1); } };
  SH130.labels.push(L); return L;
}
/** a fixed tag on the screen (the "(המחשה)" mark, a source line): el.set(text) / el.remove() */
export function tag(cls) {
  css();
  const el = document.createElement('div'); el.className = 'h109-ui ' + cls; document.body.appendChild(el);
  return { el, set(t) { el.textContent = t || ''; el.classList.toggle('off', !t); }, remove() { el.remove(); } };
}
export { clamp, lerp, ease, GAL };
