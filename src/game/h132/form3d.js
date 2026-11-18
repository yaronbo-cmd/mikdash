/* ── build 132 ── h132/form3d.js — the things of work 1 "הקמת התבנית" (spec docs/specs/shlav-09-he.md, עבודה 1). LANE A's file.
 * Every material is painted when the view is made (no black first frame); every place is the book's (BOOK.s09).
 *   · the three shoulder rods on the yesod's top (NW, NE, SW: BOOK.s09.rod — from the yesod's outer corner, slid diagonally in to the
 *     block's corner where they stop), short squared timbers
 *   · the four stakes (wooden, square, a cut head): each waits beside its corner, and is driven in on the tap
 *   · the south-east corner's mark: the pour's line of stage 08 (a charcoal line on the edge where the yesod is not) — a tap on it drives
 *     that stake
 *   · level 3: the wind's signs — the flag at BOOK.s09.flag flapping harder, the dust cloud coming from the east — and the gust
 *   · the closing: a ring of dust round the form
 *   FORM3D: fmats(X) · rodMesh · stakeMesh · seLine · flagMesh · cloudMesh · ringDust
 */
import { BOOK } from '../world/grid.js';
import { box } from '../h131/world.js';
import { mats } from './world.js';

const S9 = BOOK.s09, Y0 = S9.base, F = S9.floor;
export function fmats(X) {
  const M = mats(X), Tt = X.THREE;
  if (M.y9rod) return M;
  const std = (c, o = {}) => new Tt.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, ...o });
  M.y9rod = std('#8A5E34');                           // a shoulder rod (squared timber)
  M.y9stake = std('#5E3E20');                         // a stake
  M.y9stakeH = std('#7A5530');                        // its cut head
  M.y9char = new Tt.MeshBasicMaterial({ color: 0x241a12 });   // the charcoal of the pour's line
  M.y9flag = std('#C8B48A', { side: Tt.DoubleSide, roughness: 1 });
  M.y9pole = std('#6B4A2A');
  M.y9dust = new Tt.MeshBasicMaterial({ color: 0xD9C9A6, transparent: true, opacity: 0.0, depthWrite: false });
  M.y9flash = new Tt.MeshBasicMaterial({ color: 0xFFE7A0, transparent: true, opacity: 0, depthWrite: false });
  return M;
}
/** a shoulder rod: a squared timber a little longer than its slide (the slide is from the yesod's outer corner to the block's corner) */
export function rodMesh(X, k, parent) {
  const Mt = fmats(X), g = new X.THREE.Group(); g.name = 'h132-rod-' + k; parent.add(g);
  const R = S9.rod[k], dx = R.to[0] - R.from[0], dz = R.to[1] - R.from[1], L = Math.hypot(dx, dz);
  const m = box(X, Mt.y9rod, -0.95 * L, 0, -0.16, 0.12, 0.3, 0.16, g); m.name = 'h132-rodbar';
  g.rotation.y = Math.atan2(-dz, dx); g.userData = { L, ux: dx / L, uz: dz / L };
  return g;
}
/** the rod at u (0 at the outer corner, 1 home at the block's corner): its head (the end that goes in) at the point */
export function rodAt(g, k, u) { const R = S9.rod[k]; g.position.set(R.from[0] + (R.to[0] - R.from[0]) * u, Y0, R.from[1] + (R.to[1] - R.from[1]) * u); return g; }
/** a stake: square, its head cut; height h over the ground it is driven into */
export function stakeMesh(X, parent) {
  const Mt = fmats(X), g = new X.THREE.Group(); g.name = 'h132-stake'; parent.add(g);
  box(X, Mt.y9stake, -0.14, -1.0, -0.14, 0.14, 1.1, 0.14, g); box(X, Mt.y9stakeH, -0.19, 1.1, -0.19, 0.19, 1.28, 0.19, g);
  return g;
}
/** the south-east corner: stage 08's pour line, where the block's faces meet the edge of what was poured (a short charcoal L) */
export function seLine(X, parent) {
  const Mt = fmats(X), [x, z] = S9.corner.SE, g = new X.THREE.Group(); g.name = 'h132-seline'; parent.add(g);
  box(X, Mt.y9char, x - 2.4, Y0 + 0.004, z - 0.05, x + 0.05, Y0 + 0.012, z + 0.05, g); box(X, Mt.y9char, x - 0.05, Y0 + 0.004, z - 2.4, x + 0.05, Y0 + 0.012, z + 0.05, g);
  return g;
}
/** the wind's flag (level 3): a pole at the book's place and a cloth that flaps as the wind grows */
export function flagMesh(X, parent) {
  const Mt = fmats(X), [x, z] = S9.flag, g = new X.THREE.Group(); g.name = 'h132-flag'; parent.add(g);
  box(X, Mt.y9pole, x - 0.12, F, z - 0.12, x + 0.12, F + 9, z + 0.12, g);
  const cloth = new X.THREE.Mesh(new X.THREE.PlaneGeometry(3.2, 1.8, 6, 1), Mt.y9flag); cloth.position.set(x + 1.6, F + 8.0, z); cloth.name = 'h132-flagcloth'; g.add(cloth);
  g.userData.cloth = cloth; g.userData.base = cloth.geometry.attributes.position.array.slice();
  return g;
}
/** the cloth's flap for wind w 0 … 1 at time t (a few vertices: cheap) */
export function flap(g, w, t) {
  const c = g.userData.cloth, P = c.geometry.attributes.position, b = g.userData.base;
  for (let i = 0; i < P.count; i++) { const x = b[i * 3] + 1.6, a = (0.15 + 0.85 * w) * 0.5 * x * Math.sin(t * (4 + 6 * w) - x * 1.6); P.array[i * 3 + 2] = b[i * 3 + 2] + a; }
  P.needsUpdate = true; c.rotation.y = -0.6 * w;
}
/** the dust cloud of the coming gust (level 3): a few soft puffs, coming in from the east across the court */
export function cloudMesh(X, parent) {
  const Mt = fmats(X), g = new X.THREE.Group(); g.name = 'h132-cloud'; parent.add(g);
  const geo = new X.THREE.IcosahedronGeometry(1, 0);
  for (let i = 0; i < 7; i++) { const m = new X.THREE.Mesh(geo, Mt.y9dust); const r = 2.2 + (i % 3) * 0.9; m.scale.set(r * 1.5, r * 0.7, r); m.position.set((i % 4) * 2.6 - 4, F + 1 + (i % 2) * 1.2, ((i * 5) % 7) * 2.2 - 7); g.add(m); }
  return g;
}
/** where the cloud stands for the signs' strength s 0 … 1 (far east, coming to the form) */
export function cloudAt(g, s) {
  const [cx, cz] = S9.mid, x = cx + 30 - 16 * s; g.position.set(x, 0, cz - 10); g.visible = s > 0.02;
  g.children[0].material.opacity = Math.min(0.55, s * 0.6);
}
