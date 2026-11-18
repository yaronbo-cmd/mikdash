/* ── build 132 ── h132/strip3d.js — the things of work 3 "שליפת התבנית" (spec docs/specs/shlav-09-he.md, עבודה 3). LANE A's file.
 * Every material painted when the view is made; every place the book's (BOOK.s09: brace, belt, beltY, wedge, wedgeY, pile).
 *   · the block under the form: white and plastered, its faces as the fill left them (a bulged board's mark, a nest's bare stones) —
 *     seen as each wall falls (the fill's top stays the core's)
 *   · the braces: a long timber from its foot on the ground (the west one short and steep, its foot on the Ulam's lowest step) up to the
 *     belt, pressing on it
 *   · the belts: a beam on each wall's outer face at the book's height; the ends of east and west lie over the ends of north and south
 *   · level 3, the wedge: driven between the south wall and the east wall's socket, at the south-east corner
 *   · the bulged boards of the fill (on the walls themselves: they fall with them)
 *   strip3d: smats(X) · blockBody(X, flaws, parent) · scar(X, kind, at, parent) · braceMesh · beltMesh · wedgeMesh · bulgeOn(X, k)
 */
import { BOOK } from '../world/grid.js';
import { box } from '../h131/world.js';
import { mats, SH9 } from './world.js';

const S9 = BOOK.s09, B = S9.block, T = S9.T, Y0 = S9.base, Y1 = S9.top, H = S9.H, F = S9.floor, W9 = S9.wall;
export function smats(X) {
  const M = mats(X), Tt = X.THREE;
  if (M.y9brace) return M;
  const std = (c, o = {}) => new Tt.MeshStandardMaterial({ color: c, roughness: 0.86, flatShading: true, ...o });
  M.y9brace = std('#8E6238');
  M.y9belt = std('#7A5230');
  M.y9beltT = std('#9A6E42');            // (the east and west belts a shade lighter: who lies on whom reads at the corners)
  M.y9wedge = std('#C99A5E', { emissive: '#1E1206' });
  M.y9face = std('#FFFFFF', { roughness: 0.6, emissive: '#3A3730' });   // the block's white face (the core's y9white, its own copy to light)
  return M;
}
/** a wall's outward normal [x, z] and its face's line: N z, S z, E x, W x (the block's face, under the wall) */
export const NORM = Object.freeze({ N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] });
const faceAt = (k) => (k === 'N' ? B[1] : k === 'S' ? B[3] : k === 'E' ? B[2] : B[0]);
/** the white block under the form, its faces with the fill's marks (each face lit when its wall falls: faces[k].material) */
export function blockBody(X, flaws, parent) {
  const Mt = smats(X), g = new X.THREE.Group(); g.name = 'h132-strip-block'; parent.add(g);
  const faces = {};
  // (four face slabs and a core, so a face can light alone)
  box(X, Mt.y9white, B[0] + 0.05, Y0, B[1] + 0.05, B[2] - 0.05, Y1 - 0.27, B[3] - 0.05, g);
  for (const k of ['N', 'S', 'E', 'W']) {
    const f = faceAt(k), n = NORM[k], m = Mt.y9face.clone();
    const sl = n[0] ? box(X, m, Math.min(f, f - n[0] * 0.06), Y0, B[1], Math.max(f, f - n[0] * 0.06), Y1 - 0.26, B[3], g) : box(X, m, B[0], Y0, Math.min(f, f - n[1] * 0.06), B[2], Y1 - 0.26, Math.max(f, f - n[1] * 0.06), g);
    sl.name = 'h132-face-' + k; faces[k] = sl;
  }
  const has = (f) => (flaws || []).filter((x) => x.f === f);
  const face = (k, a, y0, y1, w, mat, nm) => {   // (a mark on face k at `a` amot along the walk's run, as world.js draws them after the strip)
    const R = S9.run[k], L = Math.hypot(R.to[0] - R.from[0], R.to[1] - R.from[1]), ux = (R.to[0] - R.from[0]) / L, uz = (R.to[1] - R.from[1]) / L, x = R.from[0] + ux * a, z = R.from[1] + uz * a, n = NORM[k], e = 0.07;
    const m = box(X, mat, Math.min(x - Math.abs(ux) * w / 2, x + n[0] * e), y0, Math.min(z - Math.abs(uz) * w / 2, z + n[1] * e), Math.max(x + Math.abs(ux) * w / 2, x + n[0] * e), y1, Math.max(z + Math.abs(uz) * w / 2, z + n[1] * e), g); m.name = 'h132-' + nm; return m;
  };
  has('fill.bulge').forEach((b) => face(b.wall || 'N', S9.side / 2, Y0 + 1.2, Y1 - 1.2, 5, Mt.y9scar, 'bulgemark'));
  has('fill.nest').forEach((b, i) => { const z = b.zone || 'NE', k = z === 'NE' ? 'E' : z === 'NW' ? 'N' : z === 'SW' ? 'W' : 'S'; face(k, 26 - i * 0.4, Y0 + 0.4, Y0 + 1.6, 1.6, Mt.y9nest, 'nest'); });
  g.userData = { faces, face };
  return g;
}
/** a torn corner piece (strip.torn) at a block corner, or a torn patch (strip.patch) on the south face */
export function scar(X, kind, at, parent) {
  const Mt = smats(X);
  if (kind === 'torn') { const [x, z] = S9.corner[at] || S9.corner.SE, sx = x > S9.mid[0] ? -1 : 1, sz = z > S9.mid[1] ? -1 : 1; const m = box(X, Mt.y9scar, Math.min(x, x + sx * 0.9), Y0 + 1.5, Math.min(z, z + sz * 0.9), Math.max(x, x + sx * 0.9), Y1 - 0.4, Math.max(z, z + sz * 0.9), parent); m.name = 'h132-torn'; return m; }
  const g = parent.userData && parent.userData.face; if (g) return g('S', S9.side / 2, Y0 + 1.6, Y0 + 3.2, 2.2, Mt.y9scar, 'tornpatch');
  return null;
}
/** a beam from a to b ([x, y, z]), square of side w (a brace) */
export function beam(X, mat, a, b, w, parent) {
  const m = new X.THREE.Mesh(X.props.geo.box, mat), dx = b[0] - a[0], dy = b[1] - a[1], dz = b[2] - a[2], L = Math.hypot(dx, dy, dz);
  m.scale.set(w, w, L); m.position.set((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2); m.lookAt(b[0], b[1], b[2]);
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
}
/** where a brace stands: its foot (the book's) and its head on the belt at the wall's middle */
export function braceEnds(k) {
  const f = S9.brace[k], y0 = k === 'W' ? S9.brace.wY : F, n = NORM[k], g = S9.belt[k];
  return [[f[0], y0, f[1]], [g[0] + n[0] * 0.45, S9.beltY + 0.1, g[1] + n[1] * 0.45]];
}
export function braceMesh(X, k, parent) {
  const g = new X.THREE.Group(); g.name = 'h132-brace-' + k; parent.add(g);
  const [a, b] = braceEnds(k); beam(X, smats(X).y9brace, a, b, 0.42, g);
  g.userData = { a, b }; return g;
}
/** a belt: on its wall's outer face; the east and west ones over the north and south ones' ends (a little higher, past the corners) */
export function beltEnds(k) {
  const y = S9.beltY + (k === 'E' || k === 'W' ? 0.36 : 0);
  if (k === 'N' || k === 'S') { const z = W9[k].z + NORM[k][1] * 0.2; return [[B[0] - T - 0.7, y, z], [B[2] + T + 0.7, y, z]]; }
  const x = W9[k].x + NORM[k][0] * 0.2; return [[x, y, B[1] - T - 0.7], [x, y, B[3] + T + 0.7]];
}
export function beltMesh(X, k, parent) {
  const g = new X.THREE.Group(); g.name = 'h132-belt-' + k; parent.add(g); const Mt = smats(X), [a, b] = beltEnds(k), lit = k === 'E' || k === 'W';
  box(X, lit ? Mt.y9beltT : Mt.y9belt, Math.min(a[0], b[0]) - (a[0] === b[0] ? 0.2 : 0), a[1] - 0.18, Math.min(a[2], b[2]) - (a[2] === b[2] ? 0.2 : 0), Math.max(a[0], b[0]) + (a[0] === b[0] ? 0.2 : 0), a[1] + 0.18, Math.max(a[2], b[2]) + (a[2] === b[2] ? 0.2 : 0), g);
  g.userData = { a, b }; return g;
}
/** level 3: the wedge in the south-east joint (between the south wall's end and the east wall's socket), its head proud above the belts */
export function wedgeMesh(X, parent) {
  const g = new X.THREE.Group(); g.name = 'h132-wedge'; parent.add(g); const Mt = smats(X), [x, z] = S9.wedge;
  box(X, Mt.y9wedge, x + 0.05, S9.wedgeY - 0.6, z + 0.05, x + 0.4, S9.wedgeY + 1.3, z + 0.45, g);
  box(X, Mt.y9wedge, x - 0.05, S9.wedgeY + 1.3, z - 0.05, x + 0.5, S9.wedgeY + 1.6, z + 0.55, g);
  g.userData = { at: [x + 0.25, S9.wedgeY + 1.2, z + 0.3] }; return g;
}
/** a bulged board of the fill (fill.bulge on wall k): the wall bowed outward at its middle — on the wall's own group, so it falls with it */
export function bulgeOn(X, k, parent) {
  const W = SH9.walls && SH9.walls[k]; if (!W) return null; const Mt = smats(X), L = k === 'N' || k === 'S' ? B[2] - B[0] : B[3] - B[1] + 2 * T;
  const g = new X.THREE.Group(); g.name = 'h132-bulge-' + k; W.grp.add(g);
  const o = k === 'N' || k === 'W' ? -1 : 1, outF = k === 'W' ? -T : 0, a0 = L / 2 - 4, a1 = L / 2 + 4, t0 = Math.min(outF, outF + o * 0.35), t1 = Math.max(outF, outF + o * 0.35);
  if (k === 'N' || k === 'S') box(X, Mt.y9wood, a0, 1, t0, a1, H - 1, t1, g); else box(X, Mt.y9wood, t0, 1, a0, t1, H - 1, a1, g);
  if (parent) void parent;
  return g;
}
void F;
