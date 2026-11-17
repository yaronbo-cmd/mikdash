/* ── build 131 ── h131/pit3d.js — the pit lane's own things in the world (THE PIT LANE'S FILE). world.js calls these hooks (PIT3D):
 *   init(X, M) · sync(X, M) (every 0.5 s) · frame(dt, X, M) · rest(X, M) · owns()
 * The pit's ground, walls, spoil and rejects' heap are the core's (world.js SH8.pit). This lane hides the core's plain book stones and
 * its plain cradle, and draws its own: the stones of the work in hand (each in its earth, lifted, leaning, sliding), the kohen's wooden
 * lever, the cradle with its carrying poles and rope lashings (BOOK.s08.pit.cradle), the hoisting ropes, the light of the nail check;
 * and the after-film of a work (the four carriers take the cradle up by its poles and carry the stone off on the road toward the Mount,
 * BOOK.s08.pit.road), which runs from frame() while the director's film holds the camera.
 *   PD · pmats(X) · W3(lx, y, lz) · L2(x, z) · stoneMesh · stonePose · moundsOf · leverMesh · cradleMesh · ringMesh · showFilm · filmStop
 * Units: amot on the pit's sheet (lx east, lz south of the pit's middle; y over the valley's floor). (המחשה: all of it.)
 */
import { BOOK } from '../world/grid.js';
import { SH8, mats, pitXYZ } from './world.js';
import { halfOf, sideDir, SIDES } from './pit-model.js';
import { createGang, createBeat } from '../h109/kit.js';

const P = BOOK.s08.pit, H = P.hole;
/** the pit's numbers for the drawing: the floor's height, the rim's radius, the lever's length and thickness, the cradle's size */
export const PD = Object.freeze({ FLOOR: -H.depth, R0: H.d / 2, LEVER: 5.8, LEVER_R: 0.085, CRADLE: [3.2, 1.9], POLE: 5.6 });
/** a point of the sheet in the world (a THREE.Vector3 when out is given) */
export const W3 = (lx, y, lz, out) => { const p = pitXYZ(lx, y, lz); return out ? out.set(p[0], p[1], p[2]) : { x: p[0], y: p[1], z: p[2] }; };
/** a world point back on the sheet [lx, lz] */
export const L2 = (x, z) => { const o = pitXYZ(0, 0, 0); return [x - o[0], z - o[2]]; };

/* ───────── materials (kept in the props' table: props.remove leaves them) ───────── */
export function pmats(X) {
  const PM = X.props.M, T = X.THREE; mats(X);
  if (PM.y8pStone) return PM;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.92, flatShading: true, ...o });
  PM.y8pStone = std('#B9AB8D');                                   // (each stone clones it: its wetness is its own)
  PM.y8pMound = std('#A88F66');                                   // the virgin soil still on a stone (damp, a little darker than the walls)
  PM.y8pLever = std('#8E6A40', { roughness: 0.8 });
  PM.y8pPole = std('#7A5634', { roughness: 0.85 });
  PM.y8pRope = std('#B89A62', { roughness: 0.95 });
  PM.y8pGreen = new T.MeshBasicMaterial({ color: '#56D364', transparent: true, opacity: 0.85, depthWrite: false });
  PM.y8pLight = new T.MeshBasicMaterial({ color: '#FFE7A0' });
  PM.y8pDark = new T.MeshBasicMaterial({ color: '#5A1E14' });
  PM.y8pFulcrum = std('#9E9480');
  return PM;
}

/* ───────── a field stone: a jittered low-poly block, fixed per seed ───────── */
const GEO = {};
function stoneGeo(T, seed) {
  const k = 'g' + (seed % 6); if (GEO[k]) return GEO[k];
  const g = new T.IcosahedronGeometry(1, 1), p = g.attributes.position;
  let s = 9301 + (seed % 6) * 49297; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const seen = new Map();
  for (let i = 0; i < p.count; i++) {
    const key = [p.getX(i), p.getY(i), p.getZ(i)].map((v) => v.toFixed(3)).join(',');
    let j = seen.get(key); if (!j) { j = [0.86 + rnd() * 0.22, 0.86 + rnd() * 0.22]; seen.set(key, j); }
    // (a block, not a ball: the sides pushed flat, a broad top)
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), f = (v) => Math.sign(v) * Math.pow(Math.abs(v), 0.55);
    p.setXYZ(i, f(x) * j[0], f(y) * 0.92 * j[1], f(z) * j[0]);
  }
  g.computeVertexNormals(); GEO[k] = g; return g;
}
/** a stone of the work: { g (on the sheet: its place, its turn), tip (its slant and lean), lift (the lever's pivot), body, mat } */
export function stoneMesh(X, s, parent) {
  const T = X.THREE, PM = pmats(X), g = new T.Group(), tip = new T.Group(), lift = new T.Group();
  const mat = PM.y8pStone.clone(); mat.color.offsetHSL(0, 0, ((s.id * 37) % 7 - 3) * 0.012);
  const [hx, hz] = halfOf(s), hy = s.r * 0.62;
  const body = new T.Mesh(stoneGeo(T, s.id + (s.repl ? 3 : 0)), mat); body.scale.set(hx, hy, hz); body.castShadow = true; body.receiveShadow = true;
  g.add(tip); tip.add(lift); lift.add(body);
  g.userData = { s, tip, lift, body, mat, hx, hy, hz, mounds: [], side: -1 };
  (parent || X.props.root).add(g);
  for (let k = 0; k < 4; k++) {
    const m = new T.Mesh(X.props.geo.rock, PM.y8pMound); m.receiveShadow = true; m.castShadow = false; m.rotation.y = k * 1.3 + s.id; g.add(m); g.userData.mounds.push(m);
  }
  stonePose(X, g, s, null);
  return g;
}
/** the stone as the work has it now: its earth (the mounds on each side; the stone sunk in by how much still holds it), its slant
 *  (level 2's deep side down), its lean on its neighbour (level 3), its slide, the lever's lift on one side (side: 0…3, or null) */
export function stonePose(X, g, s, side, extra = {}) {
  const U = g.userData, F = PD.FLOOR, [hx, hz] = [U.hx, U.hz], hy = U.hy;
  const cov = s.cover.reduce((a, v, k) => a + (s.block.includes(k) ? 0 : v), 0) / Math.max(1, 4 - s.block.length);
  const base = W3(s.at[0], F, s.at[1]);
  g.position.set(base.x + (extra.dx || 0), base.y, base.z + (extra.dz || 0)); g.rotation.set(0, -s.yaw, 0);
  // (sunk by the earth that holds it; a slanted one deeper on its deep side; a leaning one up on its east end, resting on the next)
  const sink = hy * (0.55 - 0.42 * (1 - Math.min(1, cov)));
  let rz = 0, rx = 0, y = hy - sink;
  if (s.tilt) rz -= s.tilt * (s.deep === 3 ? -1 : 1);
  if (s.lean != null || s.slide > 0) { const k = s.lean != null ? 1 - s.slide : 0; rz += 0.27 * k; y += hx * 0.27 * k; }
  if (s.knock) { rz *= 0.2; y = hy * 0.55; }
  U.tip.position.set(0, y, 0); U.tip.rotation.set(rx, 0, rz);
  // the lever's lift: a turn about the far edge, the near side up (rise 0…1); out: the whole stone up and level
  const r = s.out ? 0 : Math.max(0, s.rise || 0);
  U.lift.position.set(0, 0, 0); U.lift.rotation.set(0, 0, 0); U.body.position.set(0, 0, 0);
  if (side != null && r > 0) {
    const ang = r * 0.5, d = [[0, -1], [1, 0], [0, 1], [-1, 0]][side], piv = [-d[0] * hx, -d[1] * hz];
    U.lift.position.set(piv[0], -hy * 0.6, piv[1]); U.body.position.set(-piv[0], hy * 0.6, -piv[1]);
    if (d[0]) U.lift.rotation.z = d[0] * ang; else U.lift.rotation.x = -d[1] * ang;
  }
  if (extra.up) U.tip.position.y += extra.up;
  // the wet shine: a stone bared of its earth shines (spec: "האבן מבריקה מלחות")
  const wet = Math.max(0, 1 - cov * 1.6); U.mat.roughness = 0.95 - 0.6 * wet; U.mat.color.setHSL(0.1, 0.17 + 0.05 * wet, 0.6 - 0.1 * wet);
  // the mounds: one on each side still under earth (none against a neighbour), sized by its cover
  for (let k = 0; k < 4; k++) {
    const m = U.mounds[k], c = s.block.includes(k) || s.out || s.gone ? 0 : s.cover[k];
    m.visible = c > 0.03;
    if (!m.visible) continue;
    const d = [[0, -1], [1, 0], [0, 1], [-1, 0]][k], along = k % 2 ? hz : hx, out = k % 2 ? hx : hz;
    m.position.set(d[0] * (out + 0.1), 0, d[1] * (out + 0.1));
    const w = along * (0.7 + 0.2 * c), h = hy * (0.25 + 0.9 * c), dep = 0.35 + 0.55 * c;
    m.scale.set((k % 2 ? dep : w) / 1.3, h / 1.3, (k % 2 ? w : dep) / 1.3); m.position.y = -h * 0.35;
  }
}
/** the world point of a stone's centre (top), and of a side's lip at the floor (lifted with the stone) */
export function stoneTop(g, out) { const U = g.userData; out = out || new (g.position.constructor)(); U.body.getWorldPosition(out); out.y += U.hy * 0.7; return out; }
export function lipW(s, side, rise = 0) { const [hx, hz] = halfOf(s), d = sideDir(side, s.yaw), h = side % 2 ? hx : hz; return W3(s.at[0] + d[0] * (h + 0.15), PD.FLOOR + 0.18 + rise * h * 0.9, s.at[1] + d[1] * (h + 0.15)); }

/* ───────── the lever: a long wooden bar from the tip through his hands and on; a fulcrum stone under it near the tip ───────── */
export function leverMesh(X, parent) {
  const T = X.THREE, PM = pmats(X), g = new T.Group();
  const bar = new T.Mesh(new T.CylinderGeometry(PD.LEVER_R, PD.LEVER_R * 1.15, 1, 7), PM.y8pLever); bar.castShadow = true; g.add(bar);
  const ful = new T.Mesh(new T.DodecahedronGeometry(0.32, 0), PM.y8pFulcrum); ful.scale.set(1.1, 0.75, 0.9); ful.castShadow = true; ful.visible = false; g.add(ful);
  (parent || X.props.root).add(g); g.userData = { bar, ful };
  return g;
}
const _a = { x: 0, y: 0, z: 0 };
/** the bar from tip (world) toward hand (world), on past it to the lever's length; fulcrum: a world point under the bar, or null */
export function leverSet(X, g, tip, hand, ful) {
  const T = X.THREE, U = g.userData, v = new T.Vector3(hand.x - tip.x, hand.y - tip.y, hand.z - tip.z); const d = Math.max(0.5, v.length()); v.multiplyScalar(1 / d);
  const L = Math.max(PD.LEVER, d + 0.9);
  _a.x = tip.x + v.x * L / 2; _a.y = tip.y + v.y * L / 2; _a.z = tip.z + v.z * L / 2;
  U.bar.position.set(_a.x, _a.y, _a.z); U.bar.scale.set(1, L, 1); U.bar.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v);
  U.ful.visible = !!ful; if (ful) U.ful.position.set(ful.x, ful.y, ful.z);
}

/* ───────── the cradle: two runners, the slats, two long carrying poles lashed on with rope (BOOK.s08.pit.cradle) ───────── */
export function cradleMesh(X, parent) {
  const T = X.THREE, PM = pmats(X), M = mats(X), g = new T.Group(), [L, Wd] = PD.CRADLE;
  const bx = (mat, x0, y0, z0, x1, y1, z1) => { const m = new T.Mesh(X.props.geo.box, mat); m.scale.set(x1 - x0, y1 - y0, z1 - z0); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); m.castShadow = true; m.receiveShadow = true; g.add(m); return m; };
  for (const s of [-0.7, 0.7]) bx(M.y8woodD, -L / 2, 0, s - 0.12, L / 2, 0.35, s + 0.12);
  for (let i = 0; i < 5; i++) bx(M.y8wood, -1.3 + i * 0.65 - 0.12, 0.35, -Wd / 2, -1.3 + i * 0.65 + 0.12, 0.48, Wd / 2);
  // the poles along its length, out past both ends where the four carriers take them
  for (const s of [-1.05, 1.05]) { const p = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, PD.POLE, 7), PM.y8pPole); p.rotation.z = Math.PI / 2; p.position.set(0, 0.42, s); p.castShadow = true; g.add(p);
    for (const x of [-1.1, 1.1]) { const r = new T.Mesh(new T.TorusGeometry(0.13, 0.03, 4, 8), PM.y8pRope); r.rotation.y = Math.PI / 2; r.position.set(x, 0.42, s); g.add(r); } }
  const c = W3(P.cradle[0], 0, P.cradle[1]); g.position.set(c.x, c.y, c.z);
  (parent || X.props.root).add(g); return g;
}
/** the four carriers' hands on the poles (local to the cradle): front left, front right, back left, back right */
export const POLE_ENDS = [[PD.POLE / 2 - 0.35, -1.05], [PD.POLE / 2 - 0.35, 1.05], [-PD.POLE / 2 + 0.35, -1.05], [-PD.POLE / 2 + 0.35, 1.05]];

/** the nail check's light: n bright segments round the stone's rim (lit as the thumb passes), the chip a dark notch */
export function ringMesh(X, g, n = 40) {
  const T = X.THREE, PM = pmats(X), U = g.userData, R = new T.Group(), segs = [];
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, m = new T.Mesh(X.props.geo.box, PM.y8pLight);
    const x = Math.cos(a) * U.hx * 0.98, z = Math.sin(a) * U.hz * 0.98; m.position.set(x, U.hy * 0.62, z);
    m.scale.set(0.07, 0.05, (2 * Math.PI * Math.max(U.hx, U.hz)) / n * 0.9); m.rotation.y = -a; m.visible = false; m.renderOrder = 6; R.add(m); segs.push(m);
  }
  U.body.parent.add(R); R.userData = { segs, n }; return R;
}

/* ───────── the hooks ───────── */
const ST = { cradle: null, hid: false, film: null };
/** the core's plain stones and plain cradle out (this lane draws its own); its own cradle in */
function own(X) {
  const S = SH8.pit; if (!S) return;
  if (!ST.hid) {
    ST.hid = true;
    for (const L of Object.values(S.stones || {})) for (const m of L) m.visible = false;
    const M = mats(X), c = W3(P.cradle[0], 0, P.cradle[1]);
    for (const m of S.g.children) if (m.isMesh && (m.material === M.y8wood || m.material === M.y8woodD) && Math.hypot(m.position.x - c.x, m.position.z - c.z) < 2.6) m.visible = false;
  }
  if (!ST.cradle) ST.cradle = cradleMesh(X, S.g);
}
export const pitCradle = () => ST.cradle;
export const PIT3D = {
  owns: () => true,
  init(X) { pmats(X); own(X); },
  rest(X) { pmats(X); own(X); },
  sync(X) { own(X); },
  frame(dt, X) { if (ST.film) filmStep(dt, X); },
};

/* ───────── the after-film: the carriers take the cradle up by its poles and carry the stone off toward the Mount ───────── */
/** o: { gang (createGang, the carriers already round the cradle: o.men), stone (its mesh, already on the cradle), cradle, kohen (yaw) },
 *  done(): the act's things cleared */
export function showFilm(X, o) {
  filmStop(X);
  const road = P.road.map(([lx, lz]) => W3(lx, 0, lz));
  ST.film = { ...o, t: 0, road, B: createBeat(X), seg: 0, u: 0, up: 0, at: { x: road[0].x, z: road[0].z }, yaw: 0 };
  for (const w of o.men) { try { o.gang.setRole(w, 'walk', { fx: null }); } catch (e) { /* */ } }
}
const CARRY_V = 1.9;
function filmStep(dt, X) {
  const F = ST.film; F.t += dt;
  try { F.B.step(dt); } catch (e) { /* */ }
  // (first the lift: the poles from the ground to the hands; then the walk along the road)
  F.up = Math.min(1, F.up + dt / 0.9);
  if (F.up >= 1 && F.seg < F.road.length - 1) {
    const a = F.road[F.seg], b = F.road[F.seg + 1], L = Math.hypot(b.x - a.x, b.z - a.z);
    F.u += (CARRY_V * dt) / Math.max(0.1, L); if (F.u >= 1) { F.u = 0; F.seg++; }
    const q = F.road[Math.min(F.seg + 1, F.road.length - 1)], p = F.road[F.seg], u = F.u;
    F.at.x = p.x + (q.x - p.x) * u; F.at.z = p.z + (q.z - p.z) * u;
    const want = Math.atan2(q.z - p.z, q.x - p.x); let d = want - F.yaw; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; F.yaw += d * Math.min(1, dt * 2.5);
  }
  const c = F.cradle, y0 = X.ground(F.at.x, F.at.z);
  c.position.set(F.at.x, y0 + 1.25 * F.up, F.at.z); c.rotation.set(0, -F.yaw, 0);
  if (F.stone) { F.stone.position.set(c.position.x, c.position.y + 0.48, c.position.z); F.stone.rotation.set(0, -F.yaw, 0); }
  // the carriers at the poles' ends, walking, their arms down on the poles
  const cs = Math.cos(F.yaw), sn = Math.sin(F.yaw);
  F.men.forEach((w, k) => {
    const a = w && w.a; if (!a || !a.alive) return;
    const [px, pz] = POLE_ENDS[k], ox = px + (px > 0 ? 0.55 : -0.55), x = F.at.x + ox * cs - pz * sn, z = F.at.z + ox * sn + pz * cs;
    a.x = x; a.z = z; a.path = null; a.yaw = Math.atan2(cs, sn);
    a.wk = F.up >= 1 ? 1 : 0; a.ph = (a.ph || 0) + dt * Math.PI * 1.6 * (F.up >= 1 ? 1 : 0);
    a.arm[0] = a.armT[0] = 0.55; a.arm[2] = a.armT[2] = 0.55; a.arm[1] = a.armT[1] = -0.1; a.arm[3] = a.armT[3] = -0.1; a.bow = a.bowT = 0.08;
  });
}
/** the film's end (or any end): its things cleared by the act's own clear(); the hook stops */
export function filmStop() { ST.film = null; }
export const filmOn = () => !!ST.film;
void SIDES;
