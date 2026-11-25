/* ── build 134 ── h134/look.js — what the things of stage 11 look like (spec docs/specs/shlav-11-he.md, "המראה"): the altar's top white
 * in the sun, the horns of the same stone (Beit Kerem, Middot 3:4), the pitch black and shining, the cups' silver bright and new.
 * low-poly and big, as in the whole game. Shared by the world (world.js) and the acts.
 *   mats11(X) · CELL · LAYER_H · cellXZ(horn, x, z) · pebbleGeo(T, cells, seed, h) · cupMesh(X, kind) · tone(corner)
 */
import { BOOK } from '../world/grid.js';
import { mats10 } from '../h133/world.js';

const S11 = BOOK.s11;
export const CELL = 1 / 12;                       // (half a tefach, in amot)
export const LAYER_H = 2.5 / 6;                   // (a layer: 2.5 tefachim)
/** each horn's stone a little different (spec "מה מבדיל בין הקרנות": the stone's hue) */
const HUE = { SE: '#E4DCCB', NE: '#DCD6C6', NW: '#E7DDC4', SW: '#D9D2C2' };
export const tone = (c) => HUE[c] || HUE.SE;
export function mats11(X) {
  const P0 = X.props, Tt = X.THREE, M10 = mats10(X);
  if (P0.M.y11pitch) return P0.M;
  const std = (c, o = {}) => new Tt.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true, ...o });
  P0.M.y11white = M10.y10white;
  for (const c of ['SE', 'NE', 'NW', 'SW']) P0.M['y11stone' + c] = std(tone(c), { roughness: 0.88 });
  P0.M.y11pitch = std('#1C1814', { roughness: 0.22, metalness: 0.05 });
  P0.M.y11pitchDull = std('#2A2622', { roughness: 0.85 });
  P0.M.y11stain = std('#16120F', { roughness: 0.4 });
  P0.M.y11scuff = std('#BFB39F');
  P0.M.y11crack = M10.y10crack;
  P0.M.y11salt = M10.y10salt;
  P0.M.y11wood = M10.y10wood; P0.M.y11woodD = M10.y10woodD; P0.M.y11rope = M10.y10rope;
  P0.M.y11hollow = new Tt.MeshBasicMaterial({ color: '#2B2219' });
  P0.M.y11silver = std('#E6E9EE', { roughness: 0.22, metalness: 0.85, flatShading: false });
  P0.M.y11silverDim = std('#A9ADB3', { roughness: 0.4, metalness: 0.7 });
  P0.M.y11copper = std('#B8743F', { roughness: 0.35, metalness: 0.6 });   // (the drill's bit: copper, in the workshop only)
  P0.M.y11water = new Tt.MeshStandardMaterial({ color: '#8FC4E8', roughness: 0.1, transparent: true, opacity: 0.8 });
  P0.M.y11wine = new Tt.MeshStandardMaterial({ color: '#7A1830', roughness: 0.15, transparent: true, opacity: 0.88 });
  P0.M.y11glow = M10.y10glow; P0.M.y11green = M10.y10green;
  P0.M.y11ghost = new Tt.MeshBasicMaterial({ color: '#FFF0B0', transparent: true, opacity: 0.35, depthWrite: false });
  P0.M.y11shadow = new Tt.MeshBasicMaterial({ color: '#2A2016', transparent: true, opacity: 0.45, depthWrite: false });
  P0.M.y11bad = new Tt.MeshBasicMaterial({ color: '#D9664A', transparent: true, opacity: 0.45, depthWrite: false });
  P0.M.y11light = new Tt.MeshBasicMaterial({ color: '#FFF6D8', transparent: true, opacity: 0.0, depthWrite: false, blending: Tt.AdditiveBlending });
  P0.M.y11cloth = std('#7A5A36');
  P0.M.y11basket = std('#A98A55', { roughness: 0.95 });
  return P0.M;
}
/** a cell's middle in the world: the horn's box and its grid (x east, z south) */
export function cellXZ(h, x, z) { return [h.box[0] + (x + 0.5) * CELL, h.box[1] + (z + 0.5) * CELL]; }
/** a pebble: the polyomino's outline extruded as one stone of constant thickness, its edges rounded by a bevel set inward (so it stays
 *  inside its cells and its neighbours' joints show), the top a little domed by a fixed seed's tilt (no draw at play time) — centred on
 *  its cells' middle, local x/z in cells × CELL, y from 0 to h (build 134 review of the first still: the block-per-cell pebble read as a
 *  pile of cubes) */
export function outlineOf(cells) {
  const E = new Map(), k = (x, z) => x * 1024 + z, add = (a, b) => { const r = k(...b) + ':' + k(...a); if (E.has(r)) E.delete(r); else E.set(k(...a) + ':' + k(...b), [a, b]); };
  for (const [x, z] of cells) { add([x, z], [x + 1, z]); add([x + 1, z], [x + 1, z + 1]); add([x + 1, z + 1], [x, z + 1]); add([x, z + 1], [x, z]); }
  const from = new Map(); for (const [a, b] of E.values()) { const q = k(...a); if (!from.has(q)) from.set(q, []); from.get(q).push(b); }
  const loops = [];
  while (from.size) {
    const [q0, l0] = from.entries().next().value; let cur = [Math.floor(q0 / 1024), q0 % 1024], loop = [cur];
    for (let g = 0; g < 4096; g++) { const q = k(...cur), L = from.get(q); if (!L || !L.length) break; const nx = L.pop(); if (!L.length) from.delete(q); if (nx[0] === loop[0][0] && nx[1] === loop[0][1]) break; loop.push(nx); cur = nx; }
    void l0;
    // (drop the points in the middle of a straight run)
    const out = loop.filter((p, i) => { const a = loop[(i + loop.length - 1) % loop.length], b = loop[(i + 1) % loop.length]; return (p[0] - a[0]) * (b[1] - p[1]) - (p[1] - a[1]) * (b[0] - p[0]) !== 0; });
    loops.push(out);
  }
  loops.sort((a, b) => b.length - a.length);
  return loops;
}
export function pebbleGeo(T, cells, seed = 1, h = LAYER_H) {
  let cx = 0, cz = 0; for (const [x, z] of cells) { cx += x + 0.5; cz += z + 0.5; } cx /= cells.length; cz /= cells.length;
  const loops = outlineOf(cells), toS = (L) => L.map(([x, z]) => new T.Vector2((x - cx) * CELL, -(z - cz) * CELL));
  const shape = new T.Shape(toS(loops[0]));
  for (const L of loops.slice(1)) shape.holes.push(new T.Path(toS(L)));
  const bs = 0.16 * CELL, bt = Math.min(h * 0.22, 0.2 * CELL);
  const g = new T.ExtrudeGeometry(shape, { depth: Math.max(0.01, h * 0.9 - 2 * bt), bevelEnabled: true, bevelThickness: bt, bevelSize: bs, bevelOffset: -bs - 0.07 * CELL, bevelSegments: 2, curveSegments: 1, steps: 1 });
  g.rotateX(-Math.PI / 2); g.translate(0, bt, 0);
  // (the top a little tilted, its own way: a fixed seed's)
  let s = (seed * 9301 + 49297) % 233280; const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const tx = (rnd() - 0.5) * 0.08 * h / CELL, tz = (rnd() - 0.5) * 0.08 * h / CELL, P = g.attributes.position;
  for (let i = 0; i < P.count; i++) { const y = P.getY(i); if (y > h * 0.5) P.setY(i, y + (P.getX(i) * tx + P.getZ(i) * tz)); }
  g.computeVertexNormals();
  g.userData = { cx, cz };
  return g;
}
/** a silver cup with its spout (the "חוטם" under it), local: the cup's foot at y 0; r its radius (amot) */
export function cupMesh(X, r = 0.12, mat) {
  const T = X.THREE, M = mats11(X), g = new T.Group();
  const body = new T.Mesh(new T.CylinderGeometry(r, r * 0.72, r * 1.5, 18, 1, true), mat || M.y11silver); body.position.y = r * 0.95; g.add(body);
  const base = new T.Mesh(new T.CylinderGeometry(r * 0.72, r * 0.72, r * 0.08, 18), mat || M.y11silver); base.position.y = r * 0.24; g.add(base);
  const rim = new T.Mesh(new T.TorusGeometry(r, r * 0.06, 6, 20), mat || M.y11silver); rim.rotation.x = Math.PI / 2; rim.position.y = r * 1.7; g.add(rim);
  const spout = new T.Mesh(new T.CylinderGeometry(r * 0.16, r * 0.2, r * 0.36, 10), mat || M.y11silver); spout.position.y = r * 0.06; g.add(spout); g.userData.spout = spout;
  const inner = new T.Mesh(new T.CircleGeometry(r * 0.97, 18), M.y11hollow); inner.rotation.x = -Math.PI / 2; inner.position.y = r * 0.3; g.add(inner); g.userData.inner = inner;
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
export const HORNS = S11.horns;
/** the view of a corner: forward along one of its outer axes, so the basket (inward) is at the screen's left and the Mount beyond */
export function viewOf(c) {
  const h = S11.horns[c], out = [-h.in[0], -h.in[1]];
  const cands = [[out[0], 0], [0, out[1]]];
  for (const f of cands) { const r = [-f[1], f[0]]; if (r[0] * h.in[0] + r[1] * h.in[1] < 0) return { f, r }; }
  return { f: cands[0], r: [-cands[0][1], cands[0][0]] };
}
