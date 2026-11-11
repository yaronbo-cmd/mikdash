/* ── build 111 ── h111/world.js — the things of stage 02 in the old world, shared by its acts: the station's frame on the wall (where a
 * stretch's cells lie), the kohen's stones (laid, and kept in the wall as the crews build on them), the treadwheel crane on the wall's top,
 * the gates' openings (the jambs' faces while the wall rises; the wooden frames once the kohen sets them), the great stones laid, the crews
 * of an act. Built, not boxes where it shows (rule 9): the stones are the old world's ashlar (drafted margins), the frames real timber.
 */
import { H111, STRETCH, GIANT, sidePoint, puzzleOf } from './model.js';
import { createBeat, createGang, clamp } from '../h109/kit.js';
import { makeCrane } from '../h109/acts3.js';

export const SH2 = { X: null, B: null, crew: null, crane: null, laid: {}, giants: {}, frames: [], jambs: [], holes: [], labels: [], craneAt: null, fill: {} };
const H = H111.H, ROWO = { 0: 2, 1: 0, 2: -2 };   // a row's offset across the wall from its centre line (outward +)

/** a stretch's frame: O = cell 0's start on the centre line; u along (cells grow); n outward; y the bed (the top of the course below) */
export function frameOf(s, extra = {}) {
  const T = STRETCH[s - 1]; const P = sidePoint(extra.k || T.k, extra.at != null ? extra.at : T.at);
  const G = extra.G != null ? extra.G : T.G, c = extra.c != null ? extra.c : T.c;
  const O = { x: P.x - P.ux * (G / 2), z: P.z - P.uz * (G / 2) };
  const F = { s, k: extra.k || T.k, G, c, O, ux: P.ux, uz: P.uz, nx: P.nx, nz: P.nz, y: c * H };
  /** a point at `along` amot from cell 0 and `across` amot out from the centre line */
  F.at = (along, across = 0, dy = 0) => ({ x: O.x + P.ux * along + P.nx * across, y: F.y + dy, z: O.z + P.uz * along + P.nz * across });
  /** a world point → { along, across } */
  F.local = (x, z) => { const dx = x - O.x, dz = z - O.z; return { along: dx * P.ux + dz * P.uz, across: dx * P.nx + dz * P.nz }; };
  F.yaw = Math.atan2(-P.uz, P.ux);   // a mesh's local +x along u
  return F;
}
export const rowOff = (row) => ROWO[row] ?? 0;

/* ───────── meshes ───────── */
export function stoneMesh(X, L, h, d, o = {}) {
  const T = X.THREE, A = X.stages.ashlar, geo = (A && A.geometry) || X.props.geo.box;
  const m = new T.Mesh(geo, o.mat || X.props.ashOf(o.seed, { set: o.set })); m.scale.set(L, h, d);   // ── look A ── (its own tone) ── /look A ── m.castShadow = true; m.receiveShadow = true;
  X.props.root.add(m); return m;
}
/** a stone of a stretch, placed: a stretcher (row 0 | 2) of L cells from a, or a header (row 'h') of 2 cells across the whole wall */
export function placeStone(X, F, m, st, lift = 0) {
  const hdr = st.row === 'h', w = hdr ? 2 : st.L, along = st.a + w / 2, across = hdr ? 0 : rowOff(st.row) + (st.row === 0 ? (st.off || 0) : 0);
  const p = F.at(along, across, H / 2 + lift);
  m.position.set(p.x, p.y, p.z); m.rotation.set(0, F.yaw, 0);
  // (a hair larger than the crews' stone of the same course under it, so his own is the one seen)
  m.scale.set((hdr ? 2 : st.L) - 0.05, H - 0.02, hdr ? H111.T + 0.04 : H111.ROW + 0.04);
}
/** the core's fill between the faces (the crews' field stones in mortar), where no header crosses */
function fillMesh(X, F, a, b) {
  const T = X.THREE, g = new T.BoxGeometry(1, 1, 1);
  const m = new T.Mesh(g, X.props.M.fill); const p = F.at((a + b) / 2, 0, H / 2 - 0.02);
  m.position.set(p.x, p.y, p.z); m.rotation.y = F.yaw; m.scale.set(b - a - 0.02, H - 0.08, H111.ROW + 0.02); m.receiveShadow = true; X.props.root.add(m); return m;
}
export function laidFill(X, F, P, stones) {
  const head = stones.filter((q) => q.row === 'h').map((q) => [q.a, q.a + 2]);
  const out = []; let x = 0;
  const cuts = [...head, ...(P.open ? [P.open] : [])].sort((p, q) => p[0] - q[0]);
  for (const [a, b] of cuts) { if (a > x) out.push(fillMesh(X, F, x, a)); x = Math.max(x, b); }
  if (x < F.G) out.push(fillMesh(X, F, x, F.G));
  return out;
}

/* ───────── the gates' openings ───────── */
/** the openings on (once the plan is staked: the crews leave them from the first course) */
export function holesOn(X, on) { SH2.holesOn = !!on; try { X.stages.wallHoles(on ? SH2.holes : []); } catch (e) { /* */ } }
export function holeRects() {
  return H111.GATES.filter((g) => g.k !== 'E').map((g) => (g.k === 'N' ? [g.x - 5, -73.6, g.x + 5, -67.4] : [g.x - 5, 67.4, g.x + 5, 73.6]));
}
/** the timber frame (formwork) of an opening: two posts, the head, braces; 10 wide, 20 high, the wall's depth */
export function gateFrame(X, gi) {
  const T = X.THREE, gr = new T.Group(), Wd = X.props.M.wood, Dk = X.props.M.woodD, g = H111.GATES[gi];
  const box = (w, h, d, x, y, z, mat = Wd, rz = 0) => { const m = new T.Mesh(X.props.geo.box, mat); m.scale.set(w, h, d); m.position.set(x, y, z); m.rotation.z = rz; m.castShadow = true; gr.add(m); return m; };
  const D = g.k === 'E' ? 6 : 6.2;
  for (const s of [-1, 1]) { box(0.7, 20, D, s * 4.65, 10, 0); box(0.45, 20, 0.3, s * 4.2, 10, D / 2 - 0.15, Dk); box(0.45, 20, 0.3, s * 4.2, 10, -D / 2 + 0.15, Dk); }
  box(10, 0.8, D, 0, 19.6, 0);
  for (let k = 0; k < 3; k++) box(9.2, 0.3, 0.35, 0, 4 + k * 5.5, D / 2 - 0.2, Dk);
  for (const s of [-1, 1]) box(0.3, 11.5, 0.3, 0, 12.5, s * (D / 2 - 0.2), Dk, s * 0.68);
  if (g.k === 'N' || g.k === 'S') { gr.position.set(g.x, 6, g.k === 'N' ? -70.5 : 70.5); gr.rotation.y = 0; }
  else { gr.position.set(3, 6, 0); gr.rotation.y = Math.PI / 2; }
  X.props.root.add(gr); return gr;
}
function jambsMake(X) {
  const T = X.THREE, out = [];
  for (const r of holeRects()) for (const x of [r[0], r[2]]) {
    const ins = x === r[0] ? 0.3 : -0.3;   // (a dressed jamb stone, inside the opening's edge)
    const m = new T.Mesh(X.props.geo.ash, X.props.ashOf(null, { set: 1 })); m.scale.set(0.6, 1, 6.05); m.position.set(x + ins, 6, (r[1] + r[3]) / 2); m.castShadow = true; m.visible = false; X.props.root.add(m); out.push({ m, x, z: (r[1] + r[3]) / 2 });
  }
  return out;
}
function jambsSync(X) {
  // (each jamb as high as the courses shown beside the opening, up to its lintel)
  for (const J of SH2.jambs) {
    let tp = -1e9; try { tp = X.stages.wallTopAt(J.x + SH2.jambSide(J) * 0.6, J.z); } catch (e) { tp = -1e9; }
    const hgt = Math.min(26, tp) - 6;
    if (!(hgt > 0.2) || !SH2.holesOn) { J.m.visible = false; continue; }
    J.m.visible = true; J.m.scale.y = hgt; J.m.position.y = 6 + hgt / 2;
  }
}

/* ───────── the act's labels (a count over a pile): DOM chips that follow a world point ───────── */
export function label(X) {
  const el = document.createElement('div'); el.className = 'h109-ui h111-lab'; document.body.appendChild(el);
  const L = { el, at: null, set(text, at) { el.textContent = text; L.at = at; el.style.display = text ? '' : 'none'; }, frame() { if (!L.at) return; const q = X.scr(L.at.x, L.at.y, L.at.z); el.style.left = q.x + 'px'; el.style.top = q.y + 'px'; el.style.opacity = q.on ? '1' : '0'; }, remove() { el.remove(); const i = SH2.labels.indexOf(L); if (i >= 0) SH2.labels.splice(i, 1); } };
  SH2.labels.push(L); return L;
}
let cssOn = false;
function css() {
  if (cssOn) return; cssOn = true;
  const st = document.createElement('style');
  st.textContent = `.h111-lab{transform:translate(-50%,-50%);font:900 17px/1 Heebo,system-ui;color:#3A2608;background:rgba(255,246,222,.94);border:2px solid #C8A04A;border-radius:12px;padding:3px 8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25);direction:rtl}
.h111-lab.hot{background:#FFE7A0}`;
  document.head.appendChild(st);
}

/* ───────── the world as the save has it ───────── */
export function initWorld(X) {
  css();
  SH2.X = X; SH2.B = createBeat(X); SH2.crew = createGang(X);
  const P = X.props, T = X.THREE;
  if (!P.M.ash) { try { const A = X.stages.ashlar; if (A && A.material) P.M.ash = A.material; if (A && A.geometry) P.geo.ash = A.geometry; } catch (e) { /* */ } }
  if (!P.M.fill) P.M.fill = new T.MeshStandardMaterial({ color: '#A59478', roughness: 1, flatShading: true });
  if (!P.M.chalk) P.M.chalk = new T.MeshBasicMaterial({ color: 0xFFF6DA, transparent: true, opacity: 0.95, depthWrite: false });
  if (!P.M.redc) P.M.redc = new T.MeshBasicMaterial({ color: 0xD8432E, transparent: true, opacity: 0.95, depthWrite: false });
  if (!P.M.wet) P.M.wet = new T.MeshStandardMaterial({ color: '#7E95A6', roughness: 0.25, metalness: 0.05, transparent: true, opacity: 0.45, depthWrite: false });
  SH2.crane = makeCrane(X); SH2.crane.g.visible = false;
  // the openings of the gates (from the first course: the crews leave them as they lay), and their jambs
  SH2.holes = holeRects();
  SH2.jambSide = (J) => { for (const r of SH2.holes) { if (Math.abs(J.x - r[0]) < 0.01) return -1; if (Math.abs(J.x - r[2]) < 0.01) return 1; } return 1; };
  const st = X.M.st, done = (id) => st.done.includes(id);
  holesOn(X, done('stakes'));
  SH2.jambs = jambsMake(X);
  // the frames he set
  SH2.frames = [];
  for (const gi of st.gates || []) SH2.frames[gi] = gateFrame(X, gi);
  // his stretches, as he left them
  SH2.laid = {}; SH2.fill = {};
  for (let s = 1; s <= 9; s++) {
    const L = st.lay[s]; if (!L || !L.stones || !done(`bond${s}`)) continue;
    const F = frameOf(s), Pz = puzzleOf(s);
    const ms = L.stones.map((q) => { const m = stoneMesh(X, 1, 1, 1); placeStone(X, F, m, q); return m; });
    SH2.laid[s] = { stones: L.stones.map((q) => ({ ...q })), meshes: ms };
    SH2.fill[s] = laidFill(X, F, Pz, L.stones);
  }
  // the great stones laid
  SH2.giants = {};
  for (const k of Object.keys(st.giant || {})) { const g = st.giant[k]; if (!g || !g.done) continue; SH2.giants[k] = giantAt(X, +k, g); }
  // the closing stone
  if (st.closing && st.closing.done) { const c = st.closing; const m = stoneMesh(X, 1, 1, 1); m.position.set(c.x, c.y, c.z); m.rotation.y = c.yaw; m.scale.set(c.w - 0.04, c.h - 0.02, c.d + 0.04); SH2.closeM = m; }
}
/** a stretch laid in the save but not in the world yet (a mission passed without being played: a minigame's own page, tests) */
export function ensureLaid(X, s) {
  const L = X.M.st.lay[s]; if (SH2.laid[s] || !L || !L.stones) return SH2.laid[s] || null;
  const F = frameOf(s), Pz = puzzleOf(s);
  const ms = L.stones.map((q) => { const m = stoneMesh(X, 1, 1, 1); placeStone(X, F, m, q); return m; });
  SH2.laid[s] = { stones: L.stones.map((q) => ({ ...q })), meshes: ms }; SH2.fill[s] = laidFill(X, F, Pz, L.stones);
  return SH2.laid[s];
}
/** a great stone's frame: its bed on the course over stretch s, a little along the wall (GIANT) */
export function giantFrame(s) { const Gd = GIANT[s]; return frameOf(s, { k: Gd.k, at: Gd.at, G: Gd.L, c: STRETCH[s - 1].c + 1 }); }
export const GIANT_D = 2.6, GIANT_C = 3 - 2.6 / 2;   // its depth; its centre's place across when its face is on the wall's outer face
/** a great stone's pose: d0, d1 how far each end still stands in from the face (0: on it); tilt: leaning out on the edge */
export function giantPose(F, m, d0, d1, tilt = 0, lift = 0) {
  const L = F.G, a0 = GIANT_C - d0, a1 = GIANT_C - d1;
  const c = F.at(L / 2, (a0 + a1) / 2, H / 2 + lift);
  const dx = F.ux * L + F.nx * (a1 - a0), dz = F.uz * L + F.nz * (a1 - a0);
  m.position.set(c.x, c.y, c.z); m.rotation.set(0, 0, 0); m.rotation.order = 'YXZ'; m.rotation.y = Math.atan2(-dz, dx);
  m.rotation.x = 0; m.rotation.z = 0; if (tilt) { m.rotateOnAxis(new m.position.constructor(1, 0, 0), -tilt); }
  m.scale.set(L - 0.04, H - 0.02, GIANT_D);
}
/** a great stone as laid (save: { done, d0, d1 } — its ends' last offsets) */
export function giantAt(X, s, g) {
  const F = giantFrame(s), m = stoneMesh(X, 1, 1, 1);
  giantPose(F, m, g.d0 || 0, g.d1 || 0); return m;
}

/** what the save has and the world does not show yet (missions passed without being played) */
function ensureWorld(X) {
  const st = X.M && X.M.st; if (!st) return;
  const cur = X.mission;   // (the open act owns its own stretch / stone)
  for (let s = 1; s <= 9; s++) if (st.done.includes(`bond${s}`) && !(cur && cur.k === 'bond' && cur.s === s)) ensureLaid(X, s);
  for (const k of Object.keys(st.giant || {})) if (st.giant[k] && st.giant[k].done && !SH2.giants[k]) SH2.giants[k] = giantAt(X, +k, st.giant[k]);
  for (const gi of st.gates || []) if (!SH2.frames[gi]) SH2.frames[gi] = gateFrame(X, gi);
  if (st.done.includes('stakes') && !SH2.holesOn) holesOn(X, true);
}
/* ───────── every frame ───────── */
let jT = 0;
export function frameWorld(dt, X) {
  if (!SH2.B) return;
  SH2.B.step(dt); if (SH2.crew) SH2.crew.update(dt, SH2.B);
  jT -= dt; if (jT <= 0) { jT = 0.5; jambsSync(X); ensureWorld(X); }
  for (const L of SH2.labels) L.frame();
}
export { clamp };
