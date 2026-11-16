/* ── build 130 ── h130/light3d.js — the things of station 3 "חמישים אמה של אור" in the world (brief §5, §7): the golden menorah (50 amot,
 * four bowls at its head; its place: המחשה), its four ladders, the Temple's measures in the door of Beit Shemanya, the wicks table; and
 * the act's own pieces (the jar, a measure, the clay bowl, a flame, a strip of cloth). The world keeps what the save says: the lit bowls
 * burn, a broken jar and an oil stain lie where a jar fell (light.jar). Every place is the book's (BOOK.s05.light, ladders, court);
 * every number here is a size or an offset from a book place.
 */
import { BOOK } from '../world/grid.js';
import { MEASURES } from './model.js';

const S5 = BOOK.s05, LT = S5.light, FLOOR = S5.court.floor;
/** the gallery's floor (h120/layout.js Y.GFLOOR: 6.4 plinth + 10 column + 0.6 beam + 0.3 joist + 0.1 plank); the practice bowl sits on it */
export const GFLOOR = 17.4;
const TAU = Math.PI * 2;
export const SL = { X: null, g: null, key: '', flames: [], bowls: [], t: 0, ladders: null, menorah: null };

/* ───────── materials ───────── */
export function matsL(X) {
  const P = X.props, T = X.THREE;
  if (P.M.l30gold) return P.M;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.8, flatShading: true, ...o });
  P.M.l30gold = std('#D9A93A', { roughness: 0.32, metalness: 0.85, flatShading: false, emissive: '#3A2400', emissiveIntensity: 0.25 });
  P.M.l30wood = std('#9C7448', { roughness: 0.85 });
  P.M.l30woodD = std('#6E4E30', { roughness: 0.9 });
  P.M.l30clay = std('#B06A40', { roughness: 0.9, emissive: '#000000' });
  P.M.l30clayD = std('#7A4428', { roughness: 0.95 });
  P.M.l30bronze = std('#B88A44', { roughness: 0.4, metalness: 0.7, flatShading: false, emissive: '#000000' });
  P.M.l30linen = std('#ECE6D6', { roughness: 1, side: T.DoubleSide });
  P.M.l30linenW = std('#D6CDB8', { roughness: 1, side: T.DoubleSide });
  P.M.l30oil = new T.MeshStandardMaterial({ color: '#B8902A', roughness: 0.15, metalness: 0.1, emissive: '#3A2800', emissiveIntensity: 0.4 });
  P.M.l30stain = new T.MeshBasicMaterial({ color: 0x3A2A10, transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
  P.M.l30flame = new T.MeshBasicMaterial({ color: 0xFFC860, transparent: true, opacity: 0.95, depthWrite: false });
  P.M.l30flameC = new T.MeshBasicMaterial({ color: 0xFFF4C8, transparent: true, opacity: 0.95, depthWrite: false });
  P.M.l30stone = std('#D9CCB0', { roughness: 0.9 });
  return P.M;
}
const add = (X, o, parent) => { (parent || X.props.root).add(o); return o; };
function mesh(X, geo, mat, parent) { const m = new X.THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return add(X, m, parent); }
export function boxAt(X, mat, x, y, z, sx, sy, sz, parent) { const m = mesh(X, X.props.geo.box, mat, parent); m.scale.set(sx, sy, sz); m.position.set(x, y, z); return m; }
/** a rod from a to b (radius r) */
export function rod(X, mat, a, b, r, parent, seg = 6) {
  const T = X.THREE, d = new T.Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), L = d.length() || 1e-3;
  const m = mesh(X, new T.CylinderGeometry(r, r, L, seg), mat, parent);
  m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize()); return m;
}

/* ───────── the menorah and its ladders (their geometry, pure) ───────── */
/** the four bowls at the menorah's head: each toward its ladder (index as LT.ladders), 2 amot out from the shaft, at the top */
export function bowlsOf() {
  const [mx, mz] = LT.menorah, top = FLOOR + LT.h;
  return LT.ladders.map(([x, z]) => { const dx = x - mx, dz = z - mz, L = Math.hypot(dx, dz) || 1; return { x: mx + (dx / L) * 2, y: top, z: mz + (dz / L) * 2, dir: [dx / L, dz / L] }; });
}
/** a ladder's line: foot on the floor, top against its bowl's arm (the menorah's) or the gallery's edge (the practice ladder);
 *  out: the horizontal unit from the top toward the foot (the climber's back); y(j): rung j's height; at(y): the ladder's middle there */
export function ladderOf(k) {
  let foot, top;
  if (k === 'practice') {
    const P = S5.ladders.find((l) => l[0] === LT.practice.ladder[0] && l[1] === LT.practice.ladder[1]) || [LT.practice.ladder[0], LT.practice.ladder[1], LT.practice.ladder[0], LT.practice.ladder[1]];
    foot = [P[0], FLOOR, P[1]]; top = [P[2], GFLOOR + 0.9, P[3]];
  } else {
    const B = bowlsOf()[k], [x, z] = LT.ladders[k];
    foot = [x, FLOOR, z]; top = [B.x + B.dir[0] * 0.7, B.y - 0.4, B.z + B.dir[1] * 0.7];
  }
  const ox = foot[0] - top[0], oz = foot[2] - top[2], oL = Math.hypot(ox, oz) || 1, out = [ox / oL, oz / oL];
  const at = (y) => { const u = (y - foot[1]) / (top[1] - foot[1]); return [foot[0] + (top[0] - foot[0]) * u, y, foot[2] + (top[2] - foot[2]) * u]; };
  const left = [-out[1], out[0]];   // (the climber faces −out: his left is (dz, −dx) of his facing)
  return { k, foot, top, out, left, face: [-out[0], -out[1]], at, y: (j) => foot[1] + j, n: Math.floor(top[1] - foot[1]) };
}
/** a ladder's mesh: two rails and a rung every amah up its height */
export function ladderMesh(X, L, parent, W = 1.0) {
  const M = matsL(X), g = new X.THREE.Group(); add(X, g, parent);
  const off = (p, s) => [p[0] + L.left[0] * s * W / 2, p[1], p[2] + L.left[1] * s * W / 2];
  for (const s of [-1, 1]) rod(X, M.l30wood, off(L.foot, s), off(L.top, s), 0.07, g);
  for (let j = 1; j <= L.n; j++) { const c = L.at(L.y(j)); rod(X, M.l30woodD, off(c, -1), off(c, 1), 0.045, g, 5); }
  return g;
}
/** the menorah: a stepped stone base, the golden shaft rising 50 amot, a crown and four arms with their bowls */
export function menorahMesh(X, parent) {
  const M = matsL(X), T = X.THREE, g = new T.Group(); add(X, g, parent);
  const [mx, mz] = LT.menorah, top = FLOOR + LT.h;
  boxAt(X, M.l30stone, mx, FLOOR + 0.3, mz, 4.2, 0.6, 4.2, g); boxAt(X, M.l30stone, mx, FLOOR + 0.8, mz, 3, 0.4, 3, g);
  const shaft = mesh(X, new T.CylinderGeometry(0.55, 0.9, LT.h - 1.4, 14), M.l30gold, g); shaft.position.set(mx, FLOOR + 1 + (LT.h - 1.4) / 2, mz);
  for (let k = 1; k < 5; k++) { const kn = mesh(X, new T.SphereGeometry(0.85, 12, 8), M.l30gold, g); kn.scale.set(1, 0.55, 1); kn.position.set(mx, FLOOR + 1 + (k * LT.h) / 5, mz); }
  const crown = mesh(X, new T.CylinderGeometry(1.1, 0.6, 1, 14), M.l30gold, g); crown.position.set(mx, top - 0.9, mz);
  const bowls = bowlsOf().map((B) => {
    rod(X, M.l30gold, [mx, top - 0.6, mz], [B.x, B.y - 0.45, B.z], 0.16, g);
    const b = mesh(X, new T.CylinderGeometry(0.75, 0.4, 0.5, 16, 1, true), M.l30gold, g); b.position.set(B.x, B.y - 0.15, B.z);
    const base = mesh(X, new T.CircleGeometry(0.4, 14), M.l30gold, g); base.rotation.x = -Math.PI / 2; base.position.set(B.x, B.y - 0.39, B.z);
    return { ...B, mesh: b };
  });
  return { g, bowls };
}
/** a bowl's oil (a disc whose height follows k 0…1) */
export function oilDisc(X, B, r0, r1, h, parent) {
  const M = matsL(X), d = mesh(X, new X.THREE.CircleGeometry(1, 18), M.l30oil, parent); d.rotation.x = -Math.PI / 2; d.visible = false;
  d.userData.set = (k) => { d.visible = k > 0.01; const y = B.y - h / 2 + h * Math.min(1, k) * 0.9, r = r0 + (r1 - r0) * Math.min(1, k); d.position.set(B.x, y, B.z); d.scale.set(r, r, r); };
  return d;
}
/** a flame: an outer and an inner cone, flickering; grows from 0 (k) */
export function flameMesh(X, at, parent, size = 1) {
  const M = matsL(X), T = X.THREE, g = new T.Group(); g.position.set(...at); add(X, g, parent);
  const o = new T.Mesh(new T.ConeGeometry(0.22 * size, 0.9 * size, 10), M.l30flame); o.position.y = 0.45 * size; g.add(o);
  const i = new T.Mesh(new T.ConeGeometry(0.11 * size, 0.5 * size, 8), M.l30flameC); i.position.y = 0.27 * size; g.add(i);
  g.userData = { k: 1, ph: at[0] * 1.7 + at[2] * 0.9 };
  g.userData.tick = (t) => { const f = 1 + 0.12 * Math.sin(t * 13 + g.userData.ph) + 0.07 * Math.sin(t * 29 + g.userData.ph * 2); const k = g.userData.k; g.scale.set(Math.max(1e-3, k), Math.max(1e-3, k * f), Math.max(1e-3, k)); g.visible = k > 0.01; };
  return g;
}
/** the clay bowl of the practice, on the gallery's floor */
export function clayBowl(X, at, parent) {
  const M = matsL(X), T = X.THREE, b = mesh(X, new T.CylinderGeometry(0.45, 0.25, 0.3, 14, 1, true), M.l30clay, parent); b.position.set(at[0], at[1] + 0.15, at[2]);
  const f = mesh(X, new T.CircleGeometry(0.25, 12), M.l30clayD, parent); f.rotation.x = -Math.PI / 2; f.position.set(at[0], at[1] + 0.02, at[2]);
  return b;
}
/** the oil jar: a clay body (lathe), its neck and mouth; the oil seen in its mouth (a disc, k 0…1) */
export function jarMesh(X, o = {}) {
  const M = matsL(X), T = X.THREE, g = new T.Group(), s = o.s || 1;
  const pts = [[0, 0], [0.2, 0.02], [0.32, 0.25], [0.36, 0.5], [0.3, 0.75], [0.14, 0.88], [0.12, 1.0], [0.16, 1.04]].map(([r, y]) => new T.Vector2(r * s, y * s));
  const body = new T.Mesh(new T.LatheGeometry(pts, 14), o.mat || M.l30clay); body.castShadow = true; g.add(body);
  const oil = new T.Mesh(new T.CircleGeometry(0.115 * s, 12), M.l30oil); oil.rotation.x = -Math.PI / 2; oil.position.y = 0.97 * s; g.add(oil);
  g.userData = { body, oil, s, h: 1.04 * s, lip: [0, 1.04 * s, 0.14 * s] };
  g.userData.fill = (k) => { oil.visible = k > 0.01; oil.position.y = (0.55 + 0.42 * Math.min(1, k)) * s; };
  (o.parent || X.props.root).add(g);
  return g;
}
/** a measure of the Temple (by its volume in log): a bronze cup whose size is its volume's cube root */
export function measureMesh(X, logs, parent) {
  const M = matsL(X), T = X.THREE, g = new T.Group(), s = 0.32 * Math.cbrt(logs / 12) + 0.08;
  const c = new T.Mesh(new T.CylinderGeometry(s * 0.95, s * 0.8, s * 1.6, 14, 1, true), M.l30bronze); c.position.y = s * 0.8; c.castShadow = true; g.add(c);
  const b = new T.Mesh(new T.CircleGeometry(s * 0.8, 12), M.l30bronze); b.rotation.x = -Math.PI / 2; b.position.y = 0.01; g.add(b);
  const oil = new T.Mesh(new T.CircleGeometry(s * 0.9, 12), M.l30oil); oil.rotation.x = -Math.PI / 2; oil.position.y = s * 1.5; g.add(oil);
  g.userData = { s, oil, h: s * 1.6 }; add(X, g, parent); return g;
}
/** the measures' places on their bench in the door of Beit Shemanya: a row along x, the hin first; the jar's place in front */
export function measuresLayout() {
  const [x0, z0] = LT.measures, n = MEASURES.length, W = 4.2;
  return { bench: [x0, FLOOR, z0], cups: MEASURES.map((m, i) => ({ ...m, at: [x0 - W / 2 + (W * (i + 0.5)) / n, FLOOR + 0.9, z0] })), jar: [x0 + 0.6, FLOOR, z0 - 1.6], vat: [x0 - 3.1, FLOOR, z0 - 0.8] };
}
/** the wicks table: a low table, the worn garments on it, the made wicks in a basket (where the act puts each one) */
export function wicksLayout() {
  const [x0, z0] = LT.wicks;
  return { table: [x0, FLOOR, z0], top: FLOOR + 1.05, cloth: [x0 + 0.45, FLOOR + 1.07, z0], basket: [x0 - 1.0, FLOOR + 1.07, z0 + 0.45] };
}

/* ───────── the station's things in the world, from the save ───────── */
/** draw (once) the menorah, its four ladders, the measures' bench, the wicks table; then keep the lit bowls and the damages as the save
 *  says (sync on a key). st: the stage's save (h130 model), its light part and marks */
export function lightWorld(X, st) {
  const T = X.THREE, M = matsL(X);
  if (!SL.g || SL.X !== X || !SL.g.parent) {
    SL.X = X; SL.g = new T.Group(); SL.g.name = 'h130-light-world'; X.props.root.add(SL.g); SL.key = ''; SL.flames = []; SL.dyn = null;
    SL.menorah = menorahMesh(X, SL.g);
    SL.ladders = [0, 1, 2, 3].map((k) => ladderMesh(X, ladderOf(k), SL.g));
    // the measures' bench and the seven cups on it, the great vat beside
    const ML = measuresLayout(); boxAt(X, M.l30stone, ML.bench[0], FLOOR + 0.45, ML.bench[2], 4.6, 0.9, 1.0, SL.g);
    SL.cups = ML.cups.map((c) => { const m = measureMesh(X, c.log, SL.g); m.position.set(...c.at); return m; });
    const vat = mesh(X, new T.CylinderGeometry(0.9, 0.75, 1.3, 16, 1, true), M.l30clayD, SL.g); vat.position.set(ML.vat[0], FLOOR + 0.65, ML.vat[2]);
    const vo = mesh(X, new T.CircleGeometry(0.85, 16), M.l30oil, SL.g); vo.rotation.x = -Math.PI / 2; vo.position.set(ML.vat[0], FLOOR + 1.15, ML.vat[2]);
    // the wicks table, the garments, the basket
    const WL = wicksLayout(), [tx, , tz] = WL.table;
    boxAt(X, M.l30wood, tx, WL.top - 0.05, tz, 2.6, 0.1, 1.4, SL.g);
    for (const [dx, dz] of [[-1.15, -0.55], [1.15, -0.55], [-1.15, 0.55], [1.15, 0.55]]) boxAt(X, M.l30woodD, tx + dx, FLOOR + 0.5, tz + dz, 0.12, 1.0, 0.12, SL.g);
    const pile = boxAt(X, M.l30linenW, tx + 0.9, WL.top + 0.06, tz - 0.4, 0.6, 0.12, 0.4, SL.g); pile.rotation.y = 0.2;
    const bk = mesh(X, new T.CylinderGeometry(0.3, 0.24, 0.2, 12, 1, true), M.l30woodD, SL.g); bk.position.set(WL.basket[0], WL.basket[1] + 0.1, WL.basket[2]);
    SL.dyn = new T.Group(); SL.g.add(SL.dyn);
  }
  lightSync(X, st);
  return SL;
}
/** the save's light: st.light.lit { b0..b3: 1, clay: 1 } burn; st.marks light.jar: a broken jar and a stain where it fell */
export function lightSync(X, st) {
  if (!SL.g || !st) return;
  const L = st.light || {}, lit = L.lit || {}, marks = (st.marks || []).filter((q) => q.f === 'light.jar' && q.at);
  const key = JSON.stringify([lit, marks.map((q) => q.at)]);
  if (key === SL.key) return; SL.key = key;
  X.props.remove(SL.dyn); SL.dyn = new X.THREE.Group(); SL.g.add(SL.dyn); SL.flames = [];
  const bowls = SL.menorah.bowls;
  bowls.forEach((B, i) => { if (!lit['b' + i]) return; const o = oilDisc(X, B, 0.4, 0.7, 0.5, SL.dyn); o.userData.set(0.8); SL.flames.push(flameMesh(X, [B.x + B.dir[0] * 0.25, B.y + 0.05, B.z + B.dir[1] * 0.25], SL.dyn, 1.3)); });
  if (lit.clay) { const b = LT.practice.bowl, at = [b[0], GFLOOR, b[1]]; clayBowl(X, at, SL.dyn); SL.flames.push(flameMesh(X, [at[0], at[1] + 0.3, at[2]], SL.dyn, 0.7)); }
  for (const q of marks) brokenJar(X, q.at, SL.dyn);
}
/** a broken jar: three sherds and a dark stain of oil round them (kept: light.jar) */
export function brokenJar(X, at, parent) {
  const M = matsL(X), T = X.THREE, [x, z] = at, y = FLOOR;
  const st = mesh(X, new T.CircleGeometry(1.1, 18), M.l30stain, parent); st.rotation.x = -Math.PI / 2; st.position.set(x, y + 0.02, z); st.scale.set(1, 0.7, 1); st.castShadow = false;
  [[0.2, 0.1, 0.5], [-0.35, 0.25, 2.1], [0.05, -0.4, 4]].forEach(([dx, dz, a], i) => { const s = mesh(X, new T.CylinderGeometry(0.3, 0.32, 0.35, 8, 1, true, a, 1.6 + i * 0.3), M.l30clay, parent); s.position.set(x + dx, y + 0.12, z + dz); s.rotation.set(1.2 + i * 0.4, a, 0.3); });
}
export function lightFrame(dt) { SL.t += dt; for (const f of SL.flames) f.userData.tick(SL.t); }
