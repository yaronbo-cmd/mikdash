/* ── build 131 ── h131/world.js — the things of stage 08 in the one world, drawn from the save (THE CORE'S FILE: the lead's).
 *
 * Two places, both from the book (BOOK.s08):
 *  · the pit at Beit Kerem — the sheet set on the one world grid at BOOK.s08.pit.origin (7 km west of the Mount): the valley's ground
 *    round it (a broad patch with the hills rising, illustration), the pit itself (its walls show the dark mixed top layer and the pale
 *    clean virgin soil under it, "למטה מהבתולה"), its stones where the book lays them, the wooden cradle, the heap of rejected stones
 *    (one stone for each 'pit.chip' mark: it stays for good). The floor under the hero agrees with it (stages.floorHook, chained to the
 *    floor the stage before laid). goPit(X) / backFromPit(X): the work's jump there and back (the kohen at the pit's stand, the sun's
 *    shadow box over the pit while he works there);
 *  · the altar's site in the Azarah — the witness's four stakes, the hearth by the frame, the pile of the pit's stones (it grows with
 *    the pit's works), the frame once he has set it, the sections poured (his and the crews'), the two timbers until the finale pulls
 *    them, and after the finale the white yesod. The world's own model of the yesod (temple.js set 'yesod') stays hidden from the
 *    stage's start, in this stage and every later one (stages.stageOwn): this world draws the yesod as he built it, patches and all.
 *
 * The lanes draw their own things in their own files, registered here: pit3d.js (the pit lane), frame3d.js (the frame-and-finale lane),
 * pour3d.js (the pour lane). Each exports { init(X, M), frame(dt, X, M), rest(X, M), sync(X, M) } (any may be missing).
 *
 *   SH8 · mats(X) · box(X, mat, x0, y0, z0, x1, y1, z1, parent) · rock(X, mat, x, y, z, r, seed, parent) · pitXYZ(lx, y, lz)
 *   initWorld(X) · frameWorld(dt, X) · restWorld(X, M) · finalWorld(X) · goPit(X) · backFromPit(X) · pitFloor(lx, lz)
 */
import { BOOK, pitWorld } from '../world/grid.js';
import { makeNoise } from '../../util.js';
import { PIT3D } from './pit3d.js';
import { FRAME3D } from './frame3d.js';
import { POUR3D } from './pour3d.js';

const S8 = BOOK.s08, P = S8.pit, O = P.origin;
const LANES = [PIT3D, FRAME3D, POUR3D];
export const SH8 = { X: null, pit: null, site: null, key: '', t: 0, atPit: false, back: null, floorPrev: null };

/** a point of the pit's sheet (lx east, lz south of its middle; y over the valley's floor) in the world */
export function pitXYZ(lx, y, lz) { const w = pitWorld(lx, lz); return [w.x, w.y + y, w.z]; }

/* ───────── materials ───────── */
export function mats(X) {
  const P0 = X.props, T = X.THREE;
  if (P0.M.y8earth) return P0.M;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.92, flatShading: true, ...o });
  P0.M.y8earth = std('#FFFFFF', { vertexColors: true, flatShading: false });   // (the colour is the vertices': the valley's)
  P0.M.y8dark = std('#5E4630');            // the top layer: dark, mixed, worked
  P0.M.y8virgin = std('#D8C49C');          // the virgin soil under it: pale, clean
  P0.M.y8spoil = std('#9A7C56');           // dug earth on the rim
  P0.M.y8field = std('#C9BFA6');           // the field stones (whole, damp)
  P0.M.y8fieldD = std('#A99E86');
  P0.M.y8wood = std('#9A6E42', { roughness: 0.85 });
  P0.M.y8woodD = std('#6E4A2A', { roughness: 0.88 });
  P0.M.y8mix = std('#A89C88', { roughness: 0.8 });       // the mix, set (illustration: its make is not fixed — "תערובת")
  P0.M.y8white = std('#FFFFFF', { roughness: 0.6, emissive: '#3A3730' });     // the yesod whitened
  P0.M.y8hearth = std('#7C7268');
  P0.M.y8ash = std('#4A4440');
  P0.M.y8reed = std('#B7A76A', { roughness: 0.7 });   // (a reed: the hole's keeper)
  P0.M.y8hole = new T.MeshBasicMaterial({ color: '#1D140C' });   // (a reed's open hole, cut at the yesod's top)
  return P0.M;
}
/** a box from x0..x1, y0..y1, z0..z1 */
export function box(X, mat, x0, y0, z0, x1, y1, z1, parent) {
  const m = new X.THREE.Mesh(X.props.geo.box, mat); m.scale.set(Math.max(1e-3, Math.abs(x1 - x0)), Math.max(1e-3, Math.abs(y1 - y0)), Math.max(1e-3, Math.abs(z1 - z0))); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = true; m.receiveShadow = true; (parent || X.props.root).add(m); return m;
}
/** a rough field stone (the props' jittered rock), r its size, turned by seed */
export function rock(X, mat, x, y, z, r, seed = 1, parent) {
  const m = new X.THREE.Mesh(X.props.geo.rock, mat); m.scale.set(r * 1.25, r * 0.8, r); m.rotation.set(0, seed * 1.7, 0); m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true; (parent || X.props.root).add(m); return m;
}
const drop = (X, all) => { for (const o of all) { try { X.props.remove(o); } catch (e) { try { o.parent && o.parent.remove(o); } catch (e2) { /* */ } } } all.length = 0; };

/* ───────── the pit's site at Beit Kerem ───────── */
const H = P.hole, R0 = H.d / 2, SEG = 40, GR = P.ground, NSA = 90, NSB = 300;   // (the colour noise: its two scales in amot)
/** the ground's height on the sheet (amot over the valley's floor): the pit's floor inside it, the valley round it rising to the hills
 *  (illustration: a broad valley of terraced slopes) */
export function pitFloor(lx, lz) {
  const r = Math.hypot(lx - H.at[0], lz - H.at[1]);
  if (r < R0) return -H.depth;
  return hillAt(lx, lz);
}
function hillAt(lx, lz) {
  const r = Math.hypot(lx, lz); if (r < GR.flat) return 0;
  const u = Math.min(1, (r - GR.flat) / GR.rise), a = Math.atan2(lz, lx);
  const h = GR.top * u * u * (3 - 2 * u) * (0.75 + 0.25 * Math.sin(a * 3 + 0.7) + 0.12 * Math.sin(a * 7 - r / 260));
  return Math.round(h / 6) * 6 * 0.6 + h * 0.4;   // (terraces: the hillsides in steps)
}
function pitBuild(X) {
  const T = X.THREE, M = mats(X), all = [], g = new T.Group(); g.name = 'h131-pit'; X.props.root.add(g); all.push(g);
  // the valley: rings from the pit's rim out to the patch's edge (no ground over the pit)
  const NA = 72, rs = []; for (let r = R0; r < P.ground.R; r = r < 40 ? r + 2 : r * 1.12) rs.push(r); rs.push(P.ground.R);
  // the colours as the Mount's own hills (world.js TC: dry gold and olive at Sukkot), greener in the valley's bottom, the dug rim pale
  const pos = [], col = [], idx = [], c = new T.Color(), N1 = makeNoise(131), N2 = makeNoise(813);
  const gA = new T.Color('#A3A064'), gB = new T.Color('#B9AE74'), dry = new T.Color('#C9B684'), lush = new T.Color('#86934E'), dug = new T.Color('#C2AA80'), edge = new T.Color('#9C8E66');
  rs.forEach((r, i) => { for (let j = 0; j < NA; j++) {
    const a = (j / NA) * Math.PI * 2, lx = H.at[0] + Math.cos(a) * r, lz = H.at[1] + Math.sin(a) * r, y = hillAt(lx, lz);
    const [x, , z] = pitXYZ(lx, 0, lz); pos.push(x, O.y + y, z);
    c.copy(gA).lerp(gB, N1(lx / NSA, lz / NSA, 3)).lerp(dry, Math.max(0, N2(lx / NSB + 3, lz / NSB - 2, 2) * 1.6 - 0.6));
    c.lerp(lush, Math.max(0, 1 - r / GR.flat) * 0.55);                        // (the valley's floor: wetter, greener)
    if (y > 2 && Math.abs(y / 6 - Math.round(y / 6)) < 0.12) c.lerp(edge, 0.5);  // (the terraces' stone edges)
    c.lerp(dug, Math.max(0, 1 - (r - R0) / 9) * 0.8); col.push(c.r, c.g, c.b);   // (the earth trodden and dug round the pit)
    if (i) { const a0 = (i - 1) * NA + j, a1 = (i - 1) * NA + (j + 1) % NA, b0 = i * NA + j, b1 = i * NA + (j + 1) % NA; idx.push(a0, a1, b0, a1, b1, b0); /* (wound to face up) */ }
  } });
  const gg = new T.BufferGeometry(); gg.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); gg.setAttribute('color', new T.Float32BufferAttribute(col, 3)); gg.setIndex(idx); gg.computeVertexNormals();
  const ground = new T.Mesh(gg, M.y8earth); ground.receiveShadow = true; ground.name = 'h131-valley'; g.add(ground);
  // the pit's walls: the dark top layer over the pale virgin soil, and its floor
  const [cx, , cz] = pitXYZ(H.at[0], 0, H.at[1]);
  const wall = (y0, y1, mat) => { const w = new T.Mesh(new T.CylinderGeometry(R0, R0, y1 - y0, SEG, 1, true), mat); w.material = mat.clone(); w.material.side = T.BackSide; w.position.set(cx, O.y + (y0 + y1) / 2, cz); w.receiveShadow = true; g.add(w); return w; };
  wall(-H.dark, 0, M.y8dark); wall(-H.depth, -H.dark, M.y8virgin);
  const fl = new T.Mesh(new T.CircleGeometry(R0, SEG), M.y8virgin); fl.rotation.x = -Math.PI / 2; fl.position.set(cx, O.y - H.depth + 0.01, cz); fl.receiveShadow = true; g.add(fl);
  // the dug earth heaped on the rim (north and east: the stand and the cradle are south and west)
  for (let i = 0; i < 9; i++) { const a = -Math.PI * 0.9 + i * 0.16, r = R0 + 2.2; const [x, , z] = pitXYZ(H.at[0] + Math.cos(a) * r, 0, H.at[1] + Math.sin(a) * r); rock(X, M.y8spoil, x, O.y + 0.1, z, 1.1 + 0.25 * Math.sin(i * 2.3), i, g); }
  // the stones where the book lays them, half in the virgin soil (the pit lane takes them over: SH8.pit.stones)
  const stones = {};
  for (const [lv, L] of Object.entries(P.stones)) stones[lv] = L.map(([lx, lz], i) => { const [x, , z] = pitXYZ(lx, 0, lz); return rock(X, i % 2 ? M.y8fieldD : M.y8field, x, O.y - H.depth + 0.25, z, lv === '3' ? 0.75 : 0.9, +lv * 3 + i, g); });
  // the wooden cradle: two runners and the cross slats (המחשה)
  { const [x, , z] = pitXYZ(P.cradle[0], 0, P.cradle[1]);
    for (const s of [-0.7, 0.7]) box(X, M.y8woodD, x - 1.6, O.y, z + s - 0.12, x + 1.6, O.y + 0.35, z + s + 0.12, g);
    for (let i = 0; i < 5; i++) box(X, M.y8wood, x - 1.3 + i * 0.65 - 0.12, O.y + 0.35, z - 0.95, x - 1.3 + i * 0.65 + 0.12, O.y + 0.48, z + 0.95, g); }
  const rej = new T.Group(); rej.name = 'h131-rejects'; g.add(rej);
  SH8.pit = { g, all, ground, stones, rej, rejN: -1 };
}
/** the rejected stones' heap: one stone per 'pit.chip' mark, for good */
function rejSync(X, M) {
  const S = SH8.pit; if (!S) return;
  const n = M ? M.marksOf('pit.chip').length : 0; if (n === S.rejN) return; S.rejN = n;
  while (S.rej.children.length) S.rej.remove(S.rej.children[0]);
  const Mt = mats(X), [x, , z] = pitXYZ(P.rejects[0], 0, P.rejects[1]);
  for (let i = 0; i < n; i++) rock(X, Mt.y8fieldD, x + (i % 3) * 1.2 - 1.2, O.y + 0.4 + Math.floor(i / 3) * 0.7, z + (i % 2) * 0.6, 0.65, 11 + i, S.rej);
}

/* ───────── the altar's site ───────── */
const mid = (b) => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];
function siteBuild(X) {
  const T = X.THREE, M = mats(X), g = new T.Group(); g.name = 'h131-site'; X.props.root.add(g);
  const F = S8.floor;
  // the witness's stakes (tapered, a cut head: the props' stake)
  for (const [, [x, z]] of Object.entries(S8.stakes)) { const s = new T.Mesh(X.props.geo.stake, M.y8wood); s.scale.set(1.6, 1.4, 1.6); s.position.set(x, F, z); s.castShadow = true; g.add(s); }
  // the hearth by the frame: a ring of stones and the dead ash (the fire is the pour's)
  // (b131 look round 2: none when the pour keeps its hearth by the section — BOOK.s08.pourAt: this one was a leftover at the opening)
  if (!S8.pourAt) { const [x, z] = S8.fire; for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2; rock(X, M.y8hearth, x + Math.cos(a) * 1.1, F + 0.15, z + Math.sin(a) * 1.1, 0.32, i, g); }
    const ash = new T.Mesh(new T.CircleGeometry(0.85, 16), M.y8ash); ash.rotation.x = -Math.PI / 2; ash.position.set(x, F + 0.02, z); g.add(ash); }
  const pile = new T.Group(); pile.name = 'h131-pile'; g.add(pile);
  const drawn = new T.Group(); drawn.name = 'h131-yesod'; g.add(drawn);
  SH8.site = { g, pile, drawn, key: '' };
}
/** what the save says stands at the altar: the pile of the pit's stones, the frame, the sections, the timbers, the white yesod */
function siteSync(X, M) {
  const S = SH8.site; if (!S || !M) return;
  const st = M.st, has = (id) => M.isDone(id);
  const key = [st.done.join(','), st.crews, st.marks.length, st.pour && st.pour.prep, POUR3D.act].join('|'); if (key === S.key) return; S.key = key;
  const T = X.THREE, Mt = mats(X), F = S8.floor, Y1 = S8.top;
  for (const g of [S.pile, S.drawn]) while (g.children.length) g.remove(g.children[0]);
  // the pile from the pit: the stones he brought up (1, 1, 3) until the pour takes them into the frame
  const pitN = (has('pit1') ? 1 : 0) + (has('pit2') ? 1 : 0) + (has('pit3') ? 3 : 0), used = has('pour3') || st.crews;
  if (!used) { const [x, z] = S8.pile; for (let i = 0; i < pitN; i++) rock(X, i % 2 ? Mt.y8fieldD : Mt.y8field, x + (i % 3) * 1.4 - 1.4, F + 0.45 + Math.floor(i / 3) * 0.75, z + (i % 2) * 0.8 - 0.4, 0.8, 21 + i, S.pile); }
  // the frame: once its first work is done (the frame lane draws its own while it plays: FRAME3D)
  const finale = has('finale') || st.crews;
  if ((has('frame1') || st.crews) && !finale && !(FRAME3D.owns && FRAME3D.owns())) {
    const A = S8.altar, t = S8.frame.T;
    box(X, Mt.y8wood, A[0] - t, F, A[1] - t, A[2] + t, S8.frame.y1, A[1], S.drawn);
    box(X, Mt.y8wood, A[0] - t, F, A[3], A[2] + t, S8.frame.y1, A[3] + t, S.drawn);
    box(X, Mt.y8wood, A[0] - t, F, A[1], A[0], S8.frame.y1, A[3], S.drawn);
    box(X, Mt.y8wood, A[2], F, A[1], A[2] + t, S8.frame.y1, A[3], S.drawn);
  }
  // the timbers that keep the place with no yesod empty, their joint's peg and the two reeds: from the pour's preparation (pour1's first
  // step: st.pour.prep) on, until the finale pulls the timbers; the reeds stay as the holes (the pour act draws its own reeds while it
  // plays level 3: POUR3D.act)
  const prep = has('pour1') || (st.pour && st.pour.prep) || st.crews;
  // (once the third section is poured the mix holds the joint: the peg is gone, and the reeds are cut at the yesod's top — their open
  // holes, where the finale's water goes down; nothing of the pour stands above the top)
  const set3 = has('pour3') || st.crews;
  if (prep && !finale) {
    for (const k of ['E', 'S']) { const b = S8.wood[k]; box(X, Mt.y8woodD, b[0], F, b[1], b[2], Y1, b[3], S.drawn); }
    if (!set3) { const J = S8.wood.joint, pg = new T.Mesh(new T.CylinderGeometry(0.16, 0.2, 0.9, 8), Mt.y8wood); pg.position.set(J[0], Y1 + 0.05, J[1]); pg.castShadow = true; S.drawn.add(pg); }
  }
  if (prep && POUR3D.act !== 3) for (const [x, z] of S8.reeds) {
    if (set3) {
      const r = new T.Mesh(new T.RingGeometry(0.115, 0.17, 14), Mt.y8reed); r.rotation.x = -Math.PI / 2; r.position.set(x, Y1 + 0.012, z); S.drawn.add(r);
      const h = new T.Mesh(new T.CircleGeometry(0.12, 12), Mt.y8hole); h.rotation.x = -Math.PI / 2; h.position.set(x, Y1 + 0.014, z); S.drawn.add(h);
    } else { const r = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 1.7, 10), Mt.y8reed); r.position.set(x, F + 0.85, z); r.castShadow = true; S.drawn.add(r); }
  }
  // the mix: his sections, then the crews' rest (after the third), white after the finale (the pour lane draws its own while it plays)
  const mat = finale ? Mt.y8white : Mt.y8mix;
  const whole = has('pour3') || st.crews;
  if (whole) for (const b of Object.values(S8.yesod)) box(X, mat, b[0], F, b[1], b[2], Y1, b[3], S.drawn);
  else for (const lv of [1, 2]) if (has('pour' + lv)) { const b = S8.sections[lv]; box(X, mat, b[0], F, b[1], b[2], Y1, b[3], S.drawn); }
  void T; void mid;
}

/* ───────── the floor (stages.floorHook): the pit's sheet; elsewhere the floor the stage before laid ───────── */
const SPAN = (P.sheet.n * P.sheet.cell) / 2;
function floorAt(x, z) {
  const lx = x - O.x, lz = z - O.z;
  if (Math.abs(lx) <= P.ground.R && Math.abs(lz) <= P.ground.R) return O.y + (Math.abs(lx) <= SPAN && Math.abs(lz) <= SPAN ? pitFloor(lx, lz) : hillAt(lx, lz));
  const f = SH8.floorPrev; return f ? f(x, z) : null;
}
function floorSet(X) {
  const S0 = X.stages; if (!S0 || !S0.floorHook) return;
  try { const cur = S0.floorHookOf ? S0.floorHookOf() : null; if (cur && cur !== floorAt) SH8.floorPrev = cur; } catch (e) { /* */ }
  S0.floorHook(floorAt);
}
function modelHide(X) { try { if (X.stages.stageOwn) X.stages.stageOwn('yesod', true); } catch (e) { /* */ } }

/* ───────── the jump to the pit and back ───────── */
/** the work at the pit: the kohen at its stand (facing north), the sun's shadow box over the pit */
export function goPit(X) {
  if (SH8.atPit) return; SH8.atPit = true;
  try { const h = X.heroAt(); SH8.back = h && Number.isFinite(h.x) ? { x: h.x, z: h.z } : null; } catch (e) { SH8.back = null; }
  const [x, , z] = pitXYZ(P.stand[0], 0, P.stand[1]);
  try { X.hero.setPos(x, z, Math.PI); } catch (e) { /* */ }
  try { if (X.view && X.view.shadowAt) X.view.shadowAt(O.x, O.z); } catch (e) { /* */ }
}
/** back on the Mount: at the place he left from, the shadow box home */
export function backFromPit(X) {
  if (!SH8.atPit) return; SH8.atPit = false;
  const s = S8.stand.pit, b = SH8.back || { x: s[0], z: s[1] };
  try { X.hero.setPos(b.x, b.z, 0); } catch (e) { /* */ }
  try { if (X.view && X.view.shadowAt) X.view.shadowAt(null); } catch (e) { /* */ }
}

/* ───────── the life of the world ───────── */
const lane = (f, ...a) => { for (const L of LANES) { try { if (L && L[f]) L[f](...a); } catch (e) { console.warn('[h131] lane', f, e && e.message); } } };
export function initWorld(X) {
  mats(X); SH8.X = X;
  try { window.__H131_SH = SH8; } catch (e) { /* (the probes' eyes) */ }
  modelHide(X); floorSet(X);
  if (!SH8.pit) pitBuild(X);
  if (!SH8.site) siteBuild(X);
  rejSync(X, X.M); siteSync(X, X.M);
  lane('init', X, X.M);
}
let jT = 0;
export function frameWorld(dt, X) {
  if (!SH8.X) return;
  SH8.t += dt;
  jT -= dt; if (jT <= 0) { jT = 0.5; modelHide(X); floorSet(X); rejSync(X, X.M); siteSync(X, X.M); lane('sync', X, X.M); }
  lane('frame', dt, X, X.M);
}
/** after a reload, the stage done or later: the yesod as he built it, the model's own hidden; the pit's heap of rejects */
export function restWorld(X, M) {
  mats(X); SH8.X = X; modelHide(X); floorSet(X);
  if (!SH8.pit) pitBuild(X);
  if (!SH8.site) siteBuild(X);
  rejSync(X, M); siteSync(X, M);
  lane('rest', X, M);
}
export function finalWorld(X) { if (!SH8.X) return; siteSync(X, X.M); }
export { drop };
