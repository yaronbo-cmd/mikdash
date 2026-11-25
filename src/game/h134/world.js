/* ── build 134 ── h134/world.js — the things of stage 11 in the one world, drawn from the save (spec docs/specs/shlav-11-he.md, "ביצוע
 * חוזר" (מצב העולם), "טבלת ההפסד", "מפת המחסומים", "המראה"). Every place from BOOK.s11.
 *   · each corner, before its packing: the wooden frame (an amah square, Zevachim 54a) set by the crew, the core standing in it with its
 *     rope loop, the basket of pebbles on the priests' walk;
 *   · packed: the horn, two layers of pebbles and the black pitch between them, the core still in it (until its extraction);
 *   · extracted: the horn hollow ("וישארו הקרנות חלולין", Rambam 2:16);
 *   · every mark where it happened: a pitch stain on the outer face, the ridge on the top, a scuff on the inner wall, a crack or a broken
 *     lip — and over a flaw the white salt patch once he pressed it in (Sukkah 48b); a broken pebble on the sovev's step below;
 *     while a salt is due, its block waits on the horn's stand;
 *   · the two silver cups by the SW horn once work 3 is done; the goldsmith's bench, stand, basin and two shelves (the rejected, the
 *     spare cups) in the south of the women's court (המחשה);
 *   · the champion's seal east of the kevesh's foot.
 * The floor and the walls chain to stage 10's (h133/world.js floorAt / wallsAt): a horn (or its frame) is a wall, the cups a small one,
 * the bench, the stand and the shelves too. The old game's 'karnot' model stays hidden (stages.stageOwn): this world draws the horns.
 *   SH11 · own(k, on) · initWorld · frameWorld · restWorld · finalWorld · hornGroup(X, c, st, o) · wallsAt11 · floorAt11
 */
import { BOOK } from '../world/grid.js';
import { box } from '../h131/world.js';
import { wallsAt as walls10 } from '../h133/world.js';
import { mats11, CELL, LAYER_H, cellXZ, pebbleGeo, cupMesh } from './look.js';
import { setOf, solutionPose, orient } from './sets.js';
import { CORNERS, isPegum } from './model.js';
import { DIRS } from './chilutz-model.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const S11 = BOOK.s11, Y = S11.top, HH = S11.hornH, TZ = S11.tz;
export const SH11 = { X: null, g: null, key: '', own: {}, floorPrev: null, M: null, wallsPrev: null };
export function own(k, on) { if (on) SH11.own[k] = 1; else delete SH11.own[k]; SH11.key = ''; }

/** the crews' layers of a corner (a save from the crews, or a link's): level 1's solution */
export function crewLayers(c) {
  const L = (layer) => setOf(c, 1, layer).map((p, i) => ({ c: p.solution, s: i + 1 }));
  return { l1: L(1), l2: L(2), p1: [], p2: [], lv: 1 };
}
/** a layer's pebbles as one mesh (their cells to the world) */
function layerMesh(X, h, list, y0, mat) {
  const T = X.THREE, parts = [];
  for (const p of list || []) {
    if (!p || !p.c || !p.c.length) continue;
    const g = pebbleGeo(T, p.c, p.s | 0 || 1, LAYER_H), [wx, wz] = cellXZ(h, g.userData.cx - 0.5, g.userData.cz - 0.5);
    g.translate(wx, y0, wz); parts.push(g);
  }
  if (!parts.length) return null;
  const g = mergeGeometries(parts); for (const p of parts) p.dispose();
  const m = new T.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
}
/** a corner's horn as the save has it; o.skip: parts an act draws itself ('frame', 'l2', 'core', 'basket') */
export function hornGroup(X, c, st, o = {}) {
  const T = X.THREE, Mt = mats11(X), h = S11.horns[c], H = st.horns[c], g = new T.Group(); g.name = 'h134-horn-' + c;
  const [x0, z0, x1, z1] = h.box, skip = o.skip || {};
  const L = H.layers || (H.packed ? crewLayers(c) : null);
  if (L) {
    // the pitch: a dark bed under the pebbles of each layer (it fills every hole to the layer's top)
    box(X, H.ridgeDull ? Mt.y11pitchDull : Mt.y11pitch, x0 + 0.01, Y, z0 + 0.01, x1 - 0.01, Y + LAYER_H * (skip.l2 ? 1 : 2) - 0.012, z1 - 0.01, g).name = 'h134-pitch';
    // the core's square left hollow inside the pitch bed is drawn by the core or the hollow below
    const a = layerMesh(X, h, L.l1, Y, Mt['y11stone' + c]); if (a) { a.name = 'h134-l1'; g.add(a); }
    if (!skip.l2) { const b = layerMesh(X, h, L.l2, Y + LAYER_H, Mt['y11stone' + c]); if (b) { b.name = 'h134-l2'; g.add(b); } }
  }
  const core = h.core, ch = S11.tef * 6, half = h.coreHalf;
  if (!H.cored && !skip.core) {
    const cm = box(X, Mt.y11wood, core[0] - half, Y, core[1] - half, core[0] + half, Y + ch, core[1] + half, g); cm.name = 'h134-core';
    const loop = new T.Mesh(new T.TorusGeometry(0.11, 0.025, 6, 14), Mt.y11rope); loop.position.set(core[0], Y + ch + 0.1, core[1]); loop.name = 'h134-loop'; g.add(loop);
  }
  if (H.cored && L) {
    // the hollow: the core's square open down to the altar's top, its inner faces dark
    box(X, Mt.y11hollow, core[0] - half + 0.005, Y + 0.004, core[1] - half + 0.005, core[0] + half - 0.005, Y + 0.012, core[1] + half - 0.005, g).name = 'h134-hollow';
  }
  if (!H.packed && !skip.frame) {
    // the frame (מלבן): four beams round the horn's square, a hand thick, 5 tefachim high
    const t = 0.06, y1 = Y + HH;
    for (const q of [[x0 - t, z0 - t, x1 + t, z0], [x0 - t, z1, x1 + t, z1 + t], [x0 - t, z0, x0, z1], [x1, z0, x1 + t, z1]]) box(X, Mt.y11wood, q[0], Y, q[1], q[2], y1, q[3], g).name = 'h134-frame';
  }
  if (!H.packed && !skip.basket) {
    const [bx, bz] = h.basket, b = new T.Mesh(new T.CylinderGeometry(0.34, 0.26, 0.3, 12), Mt.y11basket); b.position.set(bx, Y + 0.15, bz); b.castShadow = true; b.name = 'h134-basket'; g.add(b);
    for (let i = 0; i < 6; i++) { const r = 0.12 + (i % 3) * 0.05, a = i * 2.1; box(X, Mt['y11stone' + c], bx + Math.cos(a) * r - 0.07, Y + 0.28, bz + Math.sin(a) * r - 0.05, bx + Math.cos(a) * r + 0.07, Y + 0.36, bz + Math.sin(a) * r + 0.05, g); }
  }
  marks(X, Mt, g, c, st);
  return g;
}
/** a horn's outward faces: the two sides away from the altar's middle (for stains and the fall's crack) */
const outSides = (c) => [c.includes('E') ? 'E' : 'W', c.includes('S') ? 'S' : 'N'];
function faceStrip(X, Mt, g, h, side, u0, u1, ya, yb, mat) {
  const [x0, z0, x1, z1] = h.box, e = 0.012;
  if (side === 'E') return box(X, mat, x1 - 0.005, ya, z0 + u0, x1 + e, yb, z0 + u1, g);
  if (side === 'W') return box(X, mat, x0 - e, ya, z0 + u0, x0 + 0.005, yb, z0 + u1, g);
  if (side === 'S') return box(X, mat, x0 + u0, ya, z1 - 0.005, x0 + u1, yb, z1 + e, g);
  return box(X, mat, x0 + u0, ya, z0 - e, x0 + u1, yb, z0 + 0.005, g);
}
function marks(X, Mt, g, c, st) {
  const h = S11.horns[c], H = st.horns[c], F = st.flaws.filter((x) => x.corner === c), flawed = F.some(isPegum);
  const salted = flawed && H.salt === 2;
  F.forEach((x, i) => {
    if (x.f === 'orez.stain') {
      // (the pitch ran out where the hole touched the frame: a black run down the outer face, at the hole's side)
      const at = x.at || {}, side = at.side || outSides(c)[i % 2], u = Math.max(0, Math.min(0.85, (at.u || 0.4))), ya = Y + (x.layer === 2 ? LAYER_H : 0);
      faceStrip(X, Mt, g, h, side, u, u + 0.16, ya + 0.02, ya + LAYER_H, Mt.y11stain).name = 'h134-stain';
    } else if (x.f === 'orez.ridge') {
      for (let k = 0; k < 6; k++) box(X, Mt.y11stain, h.box[0] + 0.08 + k * 0.14, Y + HH - 0.01, h.box[1] + 0.06 + (k % 2) * 0.04, h.box[0] + 0.17 + k * 0.14, Y + HH + 0.035 + (k % 3) * 0.01, h.box[1] + 0.94 - (k % 2) * 0.04, g).name = 'h134-ridge';
    } else if (x.f === 'chilutz.scuff') {
      const d = DIRS[x.side] || DIRS.E, core = h.core, r = h.coreHalf + 0.004, y0 = Y + 0.1 + (i % 3) * 0.12;
      const m = box(X, Mt.y11scuff, core[0] + d[0] * r - 0.06, y0, core[1] + d[1] * r - 0.06, core[0] + d[0] * r + 0.06, y0 + 0.1, core[1] + d[1] * r + 0.06, g); m.name = 'h134-scuff';
    } else if (x.f === 'orez.fall' || x.f === 'chilutz.break') {
      const side = outSides(c)[i % 2], top = x.f === 'chilutz.break';
      const crack = top ? box(X, Mt.y11crack, h.core[0] - 0.32, Y + HH - 0.05, h.core[1] - 0.04, h.core[0] - 0.08, Y + HH + 0.006, h.core[1] + 0.04, g) : faceStrip(X, Mt, g, h, side, 0.42, 0.5, Y + HH - 0.3, Y + HH + 0.004, Mt.y11crack);
      crack.name = top ? 'h134-break' : 'h134-crack';
      if (salted) { const s = top ? box(X, Mt.y11salt, h.core[0] - 0.34, Y + HH - 0.02, h.core[1] - 0.07, h.core[0] - 0.06, Y + HH + 0.02, h.core[1] + 0.07, g) : faceStrip(X, Mt, g, h, side, 0.38, 0.54, Y + HH - 0.34, Y + HH + 0.02, Mt.y11salt); s.name = 'h134-salt-patch'; }
      if (x.f === 'orez.fall') { const [sx, sz] = [h.core[0] + (c.includes('E') ? 1.1 : -1.1), h.core[1] + (c.includes('S') ? 1.1 : -1.1)]; for (let k = 0; k < 3; k++) box(X, Mt['y11stone' + c], sx + k * 0.14 - 0.06, S11.top - 3, sz - 0.05 + (k % 2) * 0.08, sx + k * 0.14 + 0.06, S11.top - 3 + 0.06, sz + 0.05 + (k % 2) * 0.08, g).name = 'h134-shard'; }
    }
  });
  if (flawed && H.salt === 1) { const [sx, sz] = h.stand; box(X, Mt.y11salt, sx - 0.16, Y, sz - 0.12, sx + 0.16, Y + 0.22, sz + 0.12, g).name = 'h134-salt-wait'; }
}
function cupsOn(X, Mt, D) {
  const C = S11.cups;
  for (const k of ['water', 'wine']) { const m = cupMesh(X, C.r); m.position.set(C[k][0], Y, C[k][1]); m.name = 'h134-cup-' + k; D.add(m); }
}
function workshop(X, Mt, D, st) {
  const T = X.THREE, y = TZ.y, [b0, b1, b2, b3] = TZ.benchBox;
  box(X, Mt.y11woodD, b0, y + 0.85, b1, b2, y + 0.95, b3, D).name = 'h134-bench';
  for (const [x, z] of [[b0 + 0.1, b1 + 0.1], [b2 - 0.1, b1 + 0.1], [b0 + 0.1, b3 - 0.1], [b2 - 0.1, b3 - 0.1]]) box(X, Mt.y11woodD, x - 0.06, y, z - 0.06, x + 0.06, y + 0.85, z + 0.06, D);
  // the awning (a cloth on four poles) over the bench and the stand
  for (const [x, z] of [[b0 - 0.3, b1 - 0.3], [b2 + 0.3, b1 - 0.3], [b0 - 0.3, TZ.stand[1] + 1], [b2 + 0.3, TZ.stand[1] + 1]]) box(X, Mt.y11wood, x - 0.05, y, z - 0.05, x + 0.05, y + 2.6, z + 0.05, D);
  const aw = box(X, Mt.y11cloth, b0 - 0.4, y + 2.6, b1 - 0.4, b2 + 0.4, y + 2.66, TZ.stand[1] + 1.1, D); aw.name = 'h134-awning';
  // the test stand: two posts and a bar, the cups' seat; the stone basin under it, its rim half an amah below the cups
  const [sx, sz] = TZ.stand, top = y + 1.2;
  for (const dx of [-0.75, 0.75]) box(X, Mt.y11woodD, sx + dx - 0.06, y, sz - 0.06, sx + dx + 0.06, top, sz + 0.06, D);
  box(X, Mt.y11wood, sx - 0.8, top - 0.06, sz - 0.12, sx + 0.8, top, sz + 0.12, D).name = 'h134-stand';
  const [q0, q1, q2, q3] = TZ.basinBox; box(X, Mt.y10rough || Mt.y11white, q0, y, q1, q2, top - TZ.basinDrop - 0.25, q3, D).name = 'h134-basin';
  // the two shelves: the rejected cups (each kept, rule 55) and the spare cups
  for (const [k, n] of [['shelf', st.cups.shelf | 0], ['spare', st.cups.spare | 0]]) {
    const [x, z] = TZ[k]; box(X, Mt.y11woodD, x - 0.8, y + 1.0, z - 0.25, x + 0.8, y + 1.06, z + 0.25, D).name = 'h134-' + k;
    for (const dx of [-0.75, 0.75]) box(X, Mt.y11woodD, x + dx - 0.05, y, z - 0.05, x + dx + 0.05, y + 1.0, z + 0.05, D);
    for (let i = 0; i < Math.min(8, n); i++) { const m = cupMesh(X, 0.09, k === 'shelf' ? Mt.y11silverDim : Mt.y11silver); m.position.set(x - 0.66 + i * 0.19, y + 1.06, z); m.name = 'h134-' + k + '-cup'; D.add(m); }
  }
  void T;
}
function champion(X, Mt, D, won) {
  const [x, z] = S11.champion, F = S11.floor; box(X, Mt.y11white, x - 0.6, F, z - 0.6, x + 0.6, F + 1.4, z + 0.6, D).name = 'h134-seal';
  if (won) { const T = X.THREE, c = new T.Mesh(new T.CylinderGeometry(0.42, 0.42, 0.12, 20), mats11(X).y10gold); c.position.set(x, F + 1.48, z); c.name = 'h134-seal-gold'; D.add(c); }
}
function clear(G) { while (G.children.length) { const c = G.children[0]; G.remove(c); c.traverse && c.traverse((o) => { if (o.geometry && o.geometry !== (SH11.X && SH11.X.props.geo.box)) { try { o.geometry.dispose(); } catch (e) { /* */ } } }); } }
function sync(X, M) {
  if (!SH11.g || !M) return;
  const st = M.st, own = SH11.own;
  const key = JSON.stringify([st.done, st.flaws.map((x) => [x.f, x.corner, x.layer, x.side]), CORNERS.map((c) => [st.horns[c].packed, st.horns[c].cored, st.horns[c].salt, !!st.horns[c].layers, st.horns[c].rebuilt | 0]), st.cups, st.crews, st.finale, st.champion, Object.keys(own), st.started | 0]);
  if (key === SH11.key) return; SH11.key = key;
  const D = SH11.g, Mt = mats11(X); clear(D);
  for (const c of CORNERS) { if (own['horn:' + c]) continue; D.add(hornGroup(X, c, st)); }
  if (st.cups.on && !own.cups) cupsOn(X, Mt, D);
  if (!own.workshop) workshop(X, Mt, D, st);
  champion(X, Mt, D, !!st.champion);
}

/* ───────── the floor and the walls ───────── */
const inB = (b, x, z, m = 0) => x > b[0] - m && x < b[2] + m && z > b[1] - m && z < b[3] + m;
const BLOCKS = () => {
  const out = CORNERS.map((c) => S11.horns[c].box);
  const C = S11.cups; out.push([C.water[0] - 0.15, C.water[1] - 0.15, C.wine[0] + 0.15, C.wine[1] + 0.15]);
  out.push(TZ.benchBox.slice()); const [sx, sz] = TZ.stand; out.push([sx - 0.85, sz - 0.3, sx + 0.85, sz + 0.3]);
  for (const k of ['shelf', 'spare']) { const [x, z] = TZ[k]; out.push([x - 0.85, z - 0.3, x + 0.85, z + 0.3]); }
  return out;
};
/** the horns, the cups, the bench, the stand and the shelves are walls (he walks round them); stage 10's walls first */
export function wallsAt11(x, z, x0, z0) {
  try { if (walls10(x, z, x0, z0)) return true; } catch (e) { /* */ }
  const B = BLOCKS(), m = 0.18;
  for (const b of B) if (inB(b, x, z, m) && !inB(b, x0, z0, m)) return true;
  return false;
}
function floorSet(X) {
  const S0 = X.stages; if (!S0 || !S0.floorHook) return;
  try { const cur = S0.floorHookOf ? S0.floorHookOf() : null; if (cur && cur !== floorAt11) SH11.floorPrev = cur; } catch (e) { /* */ }
  S0.floorHook(floorAt11);
}
export function floorAt11(x, z) { const f = SH11.floorPrev; return f ? f(x, z) : null; }
function wallsSet(X) { try { const h = X.stages && X.stages.hero; if (h && h.twinExtra) h.twinExtra(wallsAt11); } catch (e) { /* */ } }
function modelHide(X) { try { if (X.stages.stageOwn) X.stages.stageOwn('karnot', true); } catch (e) { /* */ } }
function build(X) { const g = new X.THREE.Group(); g.name = 'h134-site'; X.props.root.add(g); SH11.g = g; }

export function initWorld(X) {
  mats11(X); SH11.X = X; SH11.M = X.M;
  try { window.__H134_SH = SH11; } catch (e) { /* (the probes' eyes) */ }
  modelHide(X); floorSet(X); wallsSet(X);
  if (!SH11.g) build(X);
  SH11.key = ''; sync(X, X.M);
}
let jT = 0;
export function frameWorld(dt, X) {
  if (!SH11.X) return; SH11.M = X.M;
  jT -= dt; if (jT <= 0) { jT = 0.4; modelHide(X); floorSet(X); wallsSet(X); sync(X, X.M); }
}
export function restWorld(X, M) { mats11(X); SH11.X = X; SH11.M = M; modelHide(X); floorSet(X); wallsSet(X); if (!SH11.g) build(X); SH11.key = ''; sync(X, M); }
export function finalWorld(X) { if (!SH11.X) return; SH11.key = ''; sync(X, X.M); }
export { orient, solutionPose };
