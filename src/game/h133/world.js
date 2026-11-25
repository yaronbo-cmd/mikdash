/* ── build 133 ── h133/world.js — the things of stage 10 in the one world, drawn from the save (spec docs/specs/shlav-10-he.md, "מה
 * עומד בעולם אחרי כל השלמה ראשונה", "מה נשאר בעולם", "טבלת ההפסד", "מפת המחסומים"). Every place from BOOK.s10.
 *
 * Each row stands by its own work only (any order of works 1 and 2):
 *   · the stage's opening: the four crews' short scaffolds round the altar, the three heaps of the fill north of it, the kevesh's site in
 *     its scaffold with the rough body of stones and fill inside;
 *   · work 1 (הציפורן): the fit stones on the heap `stock` by the kevesh's foot; at the pit the heap of the rejected grows and stays;
 *   · work 2 (המלבן): the upper block, 28 × 28, 3 high, white, on the sovev's top (the sovev's step one amah round it); its scaffolds
 *     and heaps gone; a crack on the step where a corner struck;
 *   · work 3 (הכבש): the six slabs, the thirty amot on the ground, the scaffold gone; every lip a shadow line across, a cracked slab
 *     on the shards' heap, the rabuva open or partly covered, a flawed stone of work 1 a dark line on its slab;
 *   · work 4 (מלא נימא): the head stone "פורח" (the kevesh 32, its top at 25 over the gap), the two small kevashim; a scratch where a
 *     stone touched the altar;
 *   · the climb (הסיום): the bundle of wood on the fire's place; the champion's seal at the stage's entrance lit when it is won.
 * The floor under the hero agrees (stages.floorHook, chained to the floor the stages before laid): the kevesh once built (and its
 * top once the head stone is in), the scaffolds and heaps as things he cannot climb; the kevesh's sides and its open head are walls
 * (stages.hero.twinExtra): he walks off the kevesh only at its foot, or (after work 4) onto the altar's top.
 * The model of the old game ('guf' in temple.js) stays hidden from the stage's start (stages.stageOwn): this world draws it as he built it.
 *
 *   SH10 · mats10(X) · wedge(...) · slabMesh(...) · addLane(L) · initWorld(X) · frameWorld(dt, X) · restWorld(X, M) · finalWorld(X)
 *   floorAt(x, z) · onRamp(x, z, st) · own(k, on)
 */
import { BOOK } from '../world/grid.js';
import { box } from '../h131/world.js';
import { mats as mats9 } from '../h132/world.js';
import { pitXYZ } from '../h131/world.js';
import { KINDS } from './model.js';

const S10 = BOOK.s10, S8 = BOOK.s08, F = S10.floor, Y0 = S10.base, Y1 = S10.top, U = S10.upper, R = S10.ramp, MID = S10.mid;
export const SH10 = { X: null, g: null, key: '', t: 0, own: {}, floorPrev: null, M: null, champT: -1 };
const LANES = [];
export function addLane(L) { if (L && !LANES.includes(L)) LANES.push(L); return L; }
/** a lane (an act) owns a thing while it plays it: the world leaves it to the lane ('upper', 'ramp', 'head', 'stock') */
export function own(k, on) { if (on) SH10.own[k] = 1; else delete SH10.own[k]; SH10.key = ''; }
const lane = (f, ...a) => { for (const L of LANES) { try { if (L && L[f]) L[f](...a); } catch (e) { console.warn('[h133] lane', f, e && e.message); } } };

/* ───────── materials ───────── */
export function mats10(X) {
  const P0 = X.props, Tt = X.THREE, M9 = mats9(X);
  if (P0.M.y10rough) return P0.M;
  const std = (c, o = {}) => new Tt.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true, ...o });
  P0.M.y10white = M9.y9white;
  P0.M.y10rough = std('#A89E8B', { roughness: 0.95 });         // the kevesh's body: field stones and fill, rough
  P0.M.y10field = std('#CBC2AE', { roughness: 0.92 });         // a field stone of Beit Kerem (whole, uncut)
  P0.M.y10line = std('#6A6156');                                // a dark line on a slab (a flawed stone in it)
  P0.M.y10shade = std('#8E877C');                               // a lip's shadow line
  P0.M.y10crack = std('#5E574E');
  P0.M.y10scratch = std('#B9AE9C');
  P0.M.y10hole = new Tt.MeshBasicMaterial({ color: '#241C14' });
  P0.M.y10wood = M9.y9wood; P0.M.y10woodD = M9.y9woodD;
  P0.M.y10rope = std('#C8B28A', { roughness: 0.95 });
  P0.M.y10lime = std('#E9E4D8', { roughness: 0.95 });
  P0.M.y10pitch = std('#2E2924', { roughness: 0.5 });
  P0.M.y10salt = std('#F4F2EC', { roughness: 0.7, emissive: '#2A2926' });
  P0.M.y10gold = std('#E2B64A', { roughness: 0.4, metalness: 0.2, emissive: '#5A3A08' });
  P0.M.y10moss = std('#5E7A3A', { roughness: 1 });
  P0.M.y10mud = std('#5A4630', { roughness: 1 });
  P0.M.y10glow = new Tt.MeshBasicMaterial({ color: '#FFF3C4', transparent: true, opacity: 0.95, depthWrite: false, blending: Tt.AdditiveBlending });
  P0.M.y10green = new Tt.MeshBasicMaterial({ color: '#8EE07A', transparent: true, opacity: 0.85, depthWrite: false });
  P0.M.y10charcoal = std('#1E1A16');
  return P0.M;
}
/** a six-faced solid over x0 … x1, z0 … z1 whose bottom and top run straight from z0 to z1 (yb0 → yb1, yt0 → yt1) */
export function wedge(X, mat, x0, x1, z0, z1, yb0, yb1, yt0, yt1, parent) {
  const Tt = X.THREE, v = [
    [x0, yb0, z0], [x1, yb0, z0], [x1, yb1, z1], [x0, yb1, z1],
    [x0, yt0, z0], [x1, yt0, z0], [x1, yt1, z1], [x0, yt1, z1]];
  const q = [[0, 1, 2, 3], [7, 6, 5, 4], [0, 4, 5, 1], [1, 5, 6, 2], [2, 6, 7, 3], [3, 7, 4, 0]], P = [];
  for (const [a, b, c, d] of q) { for (const i of [a, c, b, a, d, c]) P.push(...v[i]); }
  const g = new Tt.BufferGeometry(); g.setAttribute('position', new Tt.Float32BufferAttribute(P, 3)); g.computeVertexNormals();
  const m = new Tt.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; (parent || X.props.root).add(m); return m;
}
/** a slab on the kevesh's slope from z0 (north, upper) to z1 (south), its top on the slope plus `lift` at its south edge (a lip) */
export function slabMesh(X, mat, x0, x1, z0, z1, th = 0.5, lift = 0, parent) {
  const t0 = S10.rampY(z0), t1 = S10.rampY(z1) + lift;
  return wedge(X, mat, x0, x1, z0, z1, t0 - th, t1 - th, t0, t1, parent);
}
export const rampY = (z) => S10.rampY(z);

/* ───────── what stands ───────── */
const flawsOf = (st, f) => (st.flaws || []).filter((x) => x.f === f);
const builtOf = (M, k) => !!(M && M.built && M.built(k));
function build(X) {
  const Tt = X.THREE, g = new Tt.Group(); g.name = 'h133-site'; X.props.root.add(g);
  const drawn = new Tt.Group(); drawn.name = 'h133-drawn'; g.add(drawn);
  SH10.g = g; SH10.drawn = drawn;
}
function clear(G) { while (G.children.length) { const c = G.children[0]; G.remove(c); if (c.geometry && c.geometry !== X0geo()) { try { c.geometry.dispose(); } catch (e) { /* */ } } } }
const X0geo = () => (SH10.X && SH10.X.props && SH10.X.props.geo ? SH10.X.props.geo.box : null);
function sync(X, M) {
  if (!SH10.g || !M) return;
  const st = M.st, own = SH10.own;
  const key = [st.done.join(','), st.flaws.map((x) => x.f + ':' + (x.slab | 0) + ':' + (x.corner || '') + ':' + (x.work || '')).join(';'), st.basket | 0, st.crews, st.finale, st.champion, st.cur || '', st.rejects | 0, Object.keys(own).join(','), (M.shown || '')].join('|');
  if (key === SH10.key) return; SH10.key = key;
  const D = SH10.drawn, Mt = mats10(X); clear(D);
  const stock = builtOf(M, 'nail'), upper = builtOf(M, 'malben'), ramp = builtOf(M, 'kevesh'), head = builtOf(M, 'nima');
  // ── the crews' scaffolds and the fill's heaps (until the upper block stands)
  if (!upper && !own.upper) {
    for (const k of ['N', 'S', 'E', 'W']) {
      const [x, z] = S10.crew[k], wide = k === 'N' || k === 'S', y0 = k === 'W' ? F + 0.5 : F, h = 3;
      const hx = wide ? 2 : 1, hz = wide ? 1 : 2;
      for (const [dx, dz] of [[-hx, -hz], [hx, -hz], [-hx, hz], [hx, hz]]) box(X, Mt.y10woodD, x + dx - 0.12, y0, z + dz - 0.12, x + dx + 0.12, y0 + h, z + dz + 0.12, D);
      box(X, Mt.y10wood, x - hx, y0 + h - 0.2, z - hz, x + hx, y0 + h, z + hz, D).name = 'h133-scaff-' + k;
    }
    S10.mat.forEach(([x, z], i) => { const m = [Mt.y10field, Mt.y10lime, Mt.y10pitch][i]; const c = new X.THREE.Mesh(new X.THREE.ConeGeometry(1.4, 1.2, 9), m); c.position.set(x, F + 0.6, z); c.castShadow = c.receiveShadow = true; c.name = 'h133-mat'; D.add(c); });
  }
  // ── the upper block and its cracks on the sovev's step
  if (upper && !own.upper) { const b = box(X, Mt.y10white, U[0], Y0, U[1], U[2], Y1, U[3], D); b.name = 'h133-upper'; }
  for (const c of flawsOf(st, 'malben.crack')) crackAt(X, Mt, D, c.corner || 'SE');
  // ── the kevesh: its site in scaffold, or its slabs
  if (!own.ramp) {
    rampBody(X, Mt, D);
    if (!ramp) rampScaffold(X, Mt, D);
    else rampSlabs(X, Mt, D, st);
  }
  if (head && !own.head) headStone(X, Mt, D);
  if (head) smallRamps(X, Mt, D);
  for (const s of flawsOf(st, 'nima.scratch')) scratchAt(X, Mt, D, s.where || 'a');
  // ── the heaps by the kevesh's foot: the stones checked fit (stock), the shards
  if (stock && !own.stock) stockHeap(X, Mt, D, st);
  const cracked = flawsOf(st, 'kevesh.cracked').length; if (cracked) shardsHeap(X, Mt, D, cracked);
  // ── the climb's things: the salt basket by the foot (until the climb), the wood on the fire's place after it
  if (!st.finale) saltBasket(X, Mt, D);
  if (st.finale) woodBundle(X, Mt, D);
  champion(X, Mt, D, !!st.champion);
  rejects(X, Mt, D, st.rejects | 0);
  keeps(X, Mt, D, st.done || []);
}
function crackAt(X, Mt, D, corner) {
  const B = S10.block9, x = corner.includes('E') ? B[2] - 0.5 : B[0] + 0.5, z = corner.includes('S') ? B[3] - 0.5 : B[1] + 0.5;
  const sx = corner.includes('E') ? -1 : 1, sz = corner.includes('S') ? -1 : 1;
  for (let i = 0; i < 4; i++) { const m = box(X, Mt.y10crack, x + sx * i * 0.5 - 0.07, Y0 - 0.01, z + sz * (i % 2) * 0.25 - 0.3, x + sx * i * 0.5 + 0.07, Y0 + 0.012, z + sz * (i % 2) * 0.25 + 0.3, D); m.rotation.y = 0.5 * (i % 2 ? 1 : -1); m.name = 'h133-crack'; }
}
/** the kevesh's rough body: field stones and fill under the slabs (half an amah under the slope), from the foot to the ground's line */
export function rampBody(X, Mt, D) {
  const z0 = R.ground, z1 = R.foot;
  const m = wedge(X, Mt.y10rough, R.x0, R.x1, z0, z1, F - 0.02, F - 0.02, S10.rampY(z0) - 0.5, S10.rampY(z1) - 0.5 + 0.02, D); m.name = 'h133-body';
  // its west side's rabuva: the opening in the body, one amah by one
  const rb = S10.rabuva; box(X, Mt.y10hole, rb.x - 0.03, rb.y0, rb.z0, rb.x + 0.6, rb.y1, rb.z1, D).name = 'h133-rabuva-hole';
}
export function rampScaffold(X, Mt, D) {
  const x0 = R.x0 - 1, x1 = R.x1 + 1, z0 = R.ground - 0.5, z1 = R.foot + 0.5;
  for (let z = z0; z <= z1 + 0.01; z += 5) for (const x of [x0, x1]) { const h = Math.max(1.5, S10.rampY(Math.min(R.foot, Math.max(R.ground, z))) - F + 1.2); box(X, Mt.y10woodD, x - 0.13, F, z - 0.13, x + 0.13, F + h, z + 0.13, D).name = 'h133-pole'; }
  for (const x of [x0, x1]) for (const k of [0.45, 0.9]) { const zA = z0, zB = z1; const m = wedge(X, Mt.y10wood, x - 0.1, x + 0.1, zA, zB, F + (S10.rampY(R.ground) - F) * k + 0.3, F + 0.5 * k, F + (S10.rampY(R.ground) - F) * k + 0.55, F + 0.5 * k + 0.25, D); m.name = 'h133-rail'; }
}
const lipOf = (st, i) => flawsOf(st, 'kevesh.lip').some((x) => (x.slab | 0) === i);
function rampSlabs(X, Mt, D, st) {
  for (const s of S10.slabs) {
    const lip = lipOf(st, s.i) ? 0.09 : 0;
    const m = slabMesh(X, Mt.y10white, R.x0, R.x1, s.z0, s.z1, 0.5, lip, D); m.name = 'h133-slab' + s.i;
    if (lip) { const y = S10.rampY(s.z1) + 0.02; box(X, Mt.y10shade, R.x0, y - 0.06, s.z1 - 0.05, R.x1, y + lip, s.z1 + 0.18, D).name = 'h133-lip'; }
    if (flawsOf(st, 'nail.bad').some((x) => (x.slab | 0) === s.i)) { const zc = (s.z0 + s.z1) / 2 + 0.8, y = S10.rampY(zc) + 0.015; const l = box(X, Mt.y10line, R.x0 + 2.5, y - 0.01, zc - 0.07, R.x0 + 9, y + 0.02, zc + 0.07, D); l.rotation.x = -Math.atan(9 / 32); l.rotation.y = 0.12; l.name = 'h133-badline'; }
  }
  // the rabuva: open, or partly covered by its slab's side
  if (flawsOf(st, 'kevesh.rabuva').length) { const rb = S10.rabuva; box(X, Mt.y10white, rb.x - 0.05, rb.y0 + 0.45, rb.z0 - 0.02, rb.x + 0.05, rb.y1 + 0.02, rb.z1 + 0.02, D).name = 'h133-rabuva-covered'; }
}
export function headStone(X, Mt, D) {
  const H = S10.head, m = wedge(X, Mt.y10white, H.x0, H.x1, H.z0, H.z1, S10.rampY(H.z0) - 1.2, S10.rampY(H.z1) - 1.2, S10.rampY(H.z0), S10.rampY(H.z1), D); m.name = 'h133-head';
}
export function smallRamps(X, Mt, D) {
  const K = S10.ks; wedge(X, Mt.y10white, K.x0, K.x1, K.z0, K.z1, F, F, S10.ksY(K.z0), S10.ksY(K.z1), D).name = 'h133-ks';
  const Y = S10.ky, L = Y.lanes, y = (s) => S10.kyY(s);
  // lane 1 north along the kevesh's west side (s 0 … 28 from the foot), lane 2 west (s 28 … 34.5), the tip north (34.5 … L)
  const s1 = Y.mid[0][1] - Y.mid[1][1], s2 = s1 + (Y.mid[1][0] - Y.mid[2][0]);
  wedge(X, Mt.y10white, L[0].x0, L[0].x1, L[0].z0, L[0].z1, F, F, y(s1 + 1), y(0), D).name = 'h133-ky1';
  box(X, Mt.y10white, L[1].x0, F, L[1].z0, L[1].x1, y((s1 + s2) / 2), L[1].z1, D).name = 'h133-ky2';
  wedge(X, Mt.y10white, L[2].x0, L[2].x1, L[2].z0, L[2].z1, F, F, y(Y.L), y(s2 + 1), D).name = 'h133-ky3';
}
/** where each level's stone stands against the altar's face (a scratch is drawn there) */
const SCR = { a: [MID[0] + 3, Y1 - 0.5, U[3] + 0.03, 'z'], b: [R.x1 + 1, Y0 - 0.5, S10.block9[3] + 0.03, 'z'], c: [-52.5, F + 0.6, BOOK.s09.spur.S[3] + 0.03, 'z'] };
function scratchAt(X, Mt, D, w) { const p = SCR[w] || SCR.a, m = box(X, Mt.y10scratch, p[0] - 0.9, p[1] - 0.05, p[2] - 0.02, p[0] + 0.9, p[1] + 0.05, p[2] + 0.02, D); m.rotation.z = 0.25; m.name = 'h133-scratch'; }
function stockHeap(X, Mt, D, st) {
  const [x, z] = S10.stock, n = 6 + Math.min(10, (st.basket | 0));
  for (let i = 0; i < n; i++) { const a = i * 2.39, r = 0.4 + (i % 4) * 0.45, row = Math.floor(i / 7); box(X, Mt.y10field, x + Math.cos(a) * r - 0.45, F + row * 0.55, z + Math.sin(a) * r - 0.35, x + Math.cos(a) * r + 0.45, F + row * 0.55 + 0.55, z + Math.sin(a) * r + 0.35, D).name = 'h133-stock'; }
}
function shardsHeap(X, Mt, D, n) {
  const [x, z] = S10.shards;
  for (let i = 0; i < n * 3; i++) { const a = i * 1.7, r = 0.3 + (i % 3) * 0.5; const m = box(X, Mt.y10white, x + Math.cos(a) * r - 0.7, F, z + Math.sin(a) * r - 0.4, x + Math.cos(a) * r + 0.7, F + 0.25, z + Math.sin(a) * r + 0.4, D); m.rotation.y = a; m.name = 'h133-shard'; }
}
function saltBasket(X, Mt, D) {
  const Tt = X.THREE, [x, z] = S10.salt, b = new Tt.Mesh(new Tt.CylinderGeometry(0.6, 0.45, 0.6, 12), mats9(X).y9wood); b.position.set(x, F + 0.3, z); b.castShadow = true; b.name = 'h133-salt'; D.add(b);
  const s = new Tt.Mesh(new Tt.SphereGeometry(0.5, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), Mt.y10salt); s.position.set(x, F + 0.55, z); s.scale.y = 0.4; D.add(s);
  for (let i = 0; i < 5; i++) box(X, Mt.y10woodD, x + 1.2 - 0.12, F + 0.15 + i * 0.12, z - 0.9 + i * 0.05, x + 1.2 + 0.12, F + 0.3 + i * 0.12, z + 0.9 + i * 0.05, D).name = 'h133-wood';
}
function woodBundle(X, Mt, D) { const [x, z] = MID; for (let i = 0; i < 6; i++) { const m = box(X, Mt.y10woodD, x - 1.1, Y1 + (i % 3) * 0.18, z - 0.4 + (i % 3) * 0.28 - 0.1, x + 1.1, Y1 + (i % 3) * 0.18 + 0.2, z - 0.4 + (i % 3) * 0.28 + 0.1, D); m.rotation.y = i * 0.5; m.name = 'h133-bundle'; } }
function champion(X, Mt, D, won) {
  const [x, z] = S10.champion; box(X, Mt.y10white, x - 0.6, F, z - 0.6, x + 0.6, F + 1.4, z + 0.6, D).name = 'h133-seal';
  if (won) { const Tt = X.THREE, c = new Tt.Mesh(new Tt.CylinderGeometry(0.42, 0.42, 0.12, 20), Mt.y10gold); c.position.set(x, F + 1.48, z); c.name = 'h133-seal-gold'; D.add(c); }
}
/** at the pit (BOOK.s08.pit.rejects): the rejected stones of every play, a heap that grows and stays */
function rejects(X, Mt, D, n) {
  if (!n) return; const [rx, rz] = S8.pit.rejects;
  for (let i = 0; i < Math.min(24, n); i++) { const a = i * 2.2, r = 1.2 + (i % 5) * 0.35, [x, y, z] = pitXYZ(rx + 2.5 + Math.cos(a) * r, 0, rz + 1.5 + Math.sin(a) * r); const m = box(X, Mt.y10field, x - 0.4, y, z - 0.3, x + 0.4, y + 0.45 + (i % 3) * 0.1, z + 0.3, D); m.rotation.y = a; m.name = 'h133-reject'; }
}
/** (rule: each station keeps one thing for every level done) a fit stone (1, at the pit), a coiled rope (2), a roller (3), a feather on a stake (4) */
export function keepCount(done, k) { return [1, 2, 3].filter((lv) => done.includes(k + lv)).length; }
function keeps(X, Mt, D, done) {
  const Tt = X.THREE;
  const n1 = keepCount(done, 'nail'); for (let i = 0; i < n1; i++) { const [x, y, z] = pitXYZ(S10.keep.w1[0] + i * 0.9, 0, S10.keep.w1[1]); box(X, Mt.y10field, x - 0.3, y, z - 0.25, x + 0.3, y + 0.4, z + 0.25, D).name = 'h133-keep-nail'; }
  const n2 = keepCount(done, 'malben'); for (let i = 0; i < n2; i++) { const [x, z] = S10.keep.w2, t = new Tt.Mesh(new Tt.TorusGeometry(0.42, 0.12, 6, 14), Mt.y10rope); t.rotation.x = Math.PI / 2; t.position.set(x + i * 1.1, F + 0.12, z); t.name = 'h133-keep-malben'; D.add(t); }
  const n3 = keepCount(done, 'kevesh'); for (let i = 0; i < n3; i++) { const [x, z] = S10.keep.w3, c = new Tt.Mesh(new Tt.CylinderGeometry(0.22, 0.22, 2.2, 10), Mt.y10wood); c.rotation.z = Math.PI / 2; c.position.set(x, F + 0.22 + i * 0.44, z); c.castShadow = true; c.name = 'h133-keep-kevesh'; D.add(c); }
  const n4 = keepCount(done, 'nima'); for (let i = 0; i < n4; i++) { const [x, z] = S10.keep.w4; box(X, Mt.y10woodD, x + i * 0.8 - 0.06, F, z - 0.06, x + i * 0.8 + 0.06, F + 0.9, z + 0.06, D).name = 'h133-keep-nima'; const f = box(X, Mt.y10salt, x + i * 0.8 - 0.03, F + 0.9, z - 0.04, x + i * 0.8 + 0.03, F + 1.5, z + 0.04, D); f.rotation.z = 0.3; f.name = 'h133-keep-nima'; }
}

/* ───────── the floor and the walls ───────── */
const inR = (b, x, z) => x > b[0] && x < b[2] && z > b[1] && z < b[3];
/** on the kevesh's walkable top: the thirty amot once work 3 is done, the head and the altar's top once work 4 is */
export function onRamp(x, z, M) {
  if (!(x > R.x0 && x < R.x1)) return false;
  const head = builtOf(M, 'nima'), ramp = builtOf(M, 'kevesh');
  if (!ramp) return false;
  return z <= R.foot && z >= (head ? R.head : R.ground);
}
export function floorAt(x, z) {
  const M = SH10.M;
  if (M) {
    const ramp = builtOf(M, 'kevesh'), head = builtOf(M, 'nima'), upper = builtOf(M, 'malben');
    if (onRamp(x, z, M)) return S10.rampY(Math.max(z, R.head));
    if (upper && head && inR(U, x, z)) return Y1;
    // the things he cannot climb: the kevesh's site in its scaffold, the crews' scaffolds, the heaps
    if (!ramp && x > R.x0 - 1.2 && x < R.x1 + 1.2 && z > R.ground - 0.6 && z < R.foot + 0.6) return F + 3;
    if (!upper) {
      for (const k of ['N', 'S', 'E', 'W']) { const [cx, cz] = S10.crew[k], wide = k === 'N' || k === 'S'; if (Math.abs(x - cx) < (wide ? 2.2 : 1.2) && Math.abs(z - cz) < (wide ? 1.2 : 2.2)) return F + 3; }
      for (const [cx, cz] of S10.mat) if (Math.hypot(x - cx, z - cz) < 1.4) return F + 1.3;
    }
    if (Math.hypot(x - S10.stock[0], z - S10.stock[1]) < 1.6 && builtOf(M, 'nail')) return F + 1.3;
    if (head) { const K = S10.ks; if (x > K.x0 && x < K.x1 && z > K.z0 && z < K.z1) return S10.ksY(z); for (const L of S10.ky.lanes) if (x > L.x0 && x < L.x1 && z > L.z0 && z < L.z1) return F + 1.2; }
  }
  const f = SH10.floorPrev; return f ? f(x, z) : null;
}
function floorSet(X) {
  const S0 = X.stages; if (!S0 || !S0.floorHook) return;
  try { const cur = S0.floorHookOf ? S0.floorHookOf() : null; if (cur && cur !== floorAt) SH10.floorPrev = cur; } catch (e) { /* */ }
  S0.floorHook(floorAt);
}
/** the kevesh's sides and its open head are walls: off it only at its foot, or (work 4 done) onto the altar's top; the top's edge too */
export function wallsAt(x, z, x0, z0) {
  const M = SH10.M; if (!M || !builtOf(M, 'kevesh')) return false;
  const was = onRamp(x0, z0, M), now = onRamp(x, z, M), top = builtOf(M, 'nima') && builtOf(M, 'malben');
  const onTop = (a, b) => top && inR(U, a, b);
  if (was && !now) return !(z > R.foot - 0.4) && !onTop(x, z);
  if (onTop(x0, z0) && !onTop(x, z) && !now) return true;
  return false;
}
function wallsSet(X) { try { const h = X.stages && X.stages.hero; if (h && h.twinExtra) h.twinExtra(wallsAt); } catch (e) { /* */ } }
function modelHide(X) { try { if (X.stages.stageOwn) X.stages.stageOwn('guf', true); } catch (e) { /* */ } }

/* ───────── the life of the world ───────── */
export function initWorld(X) {
  mats10(X); SH10.X = X; SH10.M = X.M;
  try { window.__H133_SH = SH10; } catch (e) { /* (the probes' eyes) */ }
  modelHide(X); floorSet(X); wallsSet(X);
  if (!SH10.g) build(X);
  SH10.key = ''; sync(X, X.M);
  lane('init', X, X.M);
}
let jT = 0;
export function frameWorld(dt, X) {
  if (!SH10.X) return;
  SH10.t += dt; SH10.M = X.M;
  jT -= dt; if (jT <= 0) { jT = 0.4; modelHide(X); floorSet(X); wallsSet(X); sync(X, X.M); lane('sync', X, X.M); }
  lane('frame', dt, X, X.M);
}
export function restWorld(X, M) {
  mats10(X); SH10.X = X; SH10.M = M; modelHide(X); floorSet(X); wallsSet(X);
  if (!SH10.g) build(X);
  SH10.key = ''; sync(X, M); lane('rest', X, M);
}
export function finalWorld(X) { if (!SH10.X) return; SH10.key = ''; sync(X, X.M); }
export const KINDS10 = KINDS;
