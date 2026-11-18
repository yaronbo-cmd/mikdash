/* ── build 132 ── h132/walls3d.js — the four walls of the form, shared by work 1 (form.js) and work 3 (strip.js). LANE A's file.
 *
 * The core (world.js) builds each wall as one group hinged at its foot (wallSet(k, deg) turns it). This file dresses those same groups
 * so the joint reads from afar (spec "המראה": "הדפנות עץ, עם לשון ושקע שרואים מרחוק"; "בכל פינה רואים בבירור לשון עץ גדולה בדופן אחת
 * ושקע בדופן שלידה"): on the north and south walls a large pale tongue at each end, as long as the wall is thick (המחשה), coming through
 * the socket and just proud of it, a dark peg across its end; on the east and west walls a dark housing on the outer face round each
 * socket's mouth. It also holds the walls while a work of this lane moves them, and after the strip lays them where they fell: north,
 * south and east lying outward where they fell, the west one (it fell onto the Ulam's lowest step and the two pullers took it down) flat
 * beside the timber pile (the phase-1 decision 3, BOOK.s09.pile).
 *   WALLS3D (a lane: world.js addLane) · wmats(X) · dress(X) · hold(who, on) · wallHinge(k) · wallHead(k, deg) · outward(k)
 */
import { BOOK } from '../world/grid.js';
import { box } from '../h131/world.js';
import { SH9, wallSet, mats } from './world.js';

const S9 = BOOK.s09, B = S9.block, T = S9.T, Y0 = S9.base, H = S9.H, F = S9.floor, W9 = S9.wall;
/** each wall's hinge in the world as world.js has it (its foot's line), its run, its outward normal [x, z] */
const HG = {
  N: { p: [B[0], W9.N.z], along: [1, 0], L: B[2] - B[0], n: [0, -1] },
  S: { p: [B[0], W9.S.z], along: [1, 0], L: B[2] - B[0], n: [0, 1] },
  E: { p: [W9.E.x, B[1] - T], along: [0, 1], L: B[3] - B[1] + 2 * T, n: [1, 0] },
  W: { p: [B[0], B[1] - T], along: [0, 1], L: B[3] - B[1] + 2 * T, n: [-1, 0], inside: true },
};
export const outward = (k) => HG[k].n.slice();
export const wallHinge = (k) => ({ ...HG[k], p: HG[k].p.slice() });
/** the middle of a wall's head (its top edge) at an angle (90 upright; 0 lying: outward for N, S, E; the west one inward on the yesod) */
export function wallHead(k, deg, u = 0.5) {
  const h = HG[k], a = (Math.max(0, Math.min(120, deg)) * Math.PI) / 180, s = h.inside ? -1 : 1;
  const x0 = h.p[0] + h.along[0] * h.L * u, z0 = h.p[1] + h.along[1] * h.L * u;
  // (the head leans out along the normal as the wall lies: outer walls outward, the west one inward)
  return [x0 + s * h.n[0] * H * Math.cos(a), Y0 + H * Math.sin(a), z0 + s * h.n[1] * H * Math.cos(a)];
}
/** the west wall's place beside the pile (המחשה): its run's west end, and how far north of the pile's middle its edge lies */
export const PILEW = Object.freeze({ x0: S9.pile[0] - S9.side, dz: 2.4 });   // (its west end a side's length west of the pile)
export const WL = { X: null, who: new Set(), dressed: false, after: false };

export function wmats(X) {
  const M = mats(X), Tt = X.THREE;
  if (M.y9tongueB) return M;
  const std = (c, o = {}) => new Tt.MeshStandardMaterial({ color: c, roughness: 0.85, flatShading: true, ...o });
  M.y9tongueB = std('#EBC489', { roughness: 0.75, emissive: '#2A1C08' });   // the big tongue: pale, it reads from afar
  M.y9house = std('#4A2F17');                                              // the socket's housing on the outer face
  M.y9mouth = std('#170E06');                                              // the socket's mouth
  M.y9peg = std('#3A2410');
  return M;
}
/** the joints made large on the core's wall groups (once) */
export function dress(X) {
  if (!SH9.walls) return false;
  const Mt = wmats(X);
  for (const k of ['N', 'S', 'E', 'W']) {
    const W = SH9.walls[k]; if (!W || W.grp.userData.dressed9) continue; W.grp.userData.dressed9 = 1;
    const h = HG[k], L = h.L, g = new X.THREE.Group(); g.name = 'h132-joints-' + k; W.grp.add(g);
    const alongX = k === 'N' || k === 'S';
    const th = k === 'N' ? [0, T] : [-T, 0];                     // (the board's thickness in the group's frame, as world.js builds it)
    const outF = k === 'W' ? -T : 0, o = k === 'N' || k === 'W' ? -1 : 1;   // (the outer face and the way out of it)
    const bx = (mat, a0, a1, y0, y1, t0, t1) => (alongX ? box(X, mat, a0, y0, t0, a1, y1, t1, g) : box(X, mat, t0, y0, a0, t1, y1, a1, g));
    if (alongX) {
      // the tongues: through the socket wall (as long as it is thick) and proud of its housing, nearly the wall's height; a peg across
      for (const [a0, a1, pa] of [[-T - 0.42, 0.02, -T - 0.3], [L - 0.02, L + T + 0.42, L + T + 0.3]]) {
        bx(Mt.y9tongueB, a0, a1, 0.35, H - 0.35, th[0] + 0.03, th[1] - 0.03).name = 'h132-tongue';
        for (const y of [0.9, H / 2, H - 0.9]) bx(Mt.y9peg, pa - 0.07, pa + 0.07, y - 0.25, y + 0.25, th[0] - 0.12, th[1] + 0.12);
      }
    } else {
      // the sockets: a dark housing round each mouth on the outer face, the mouth darker, where the tongue comes through
      for (const [a0, a1] of [[0, T], [L - T, L]]) {
        const lo = Math.min(outF, outF + o * 0.28), hi = Math.max(outF, outF + o * 0.28);
        bx(Mt.y9house, a0 - 0.32, a0, 0.12, H - 0.12, lo, hi); bx(Mt.y9house, a1, a1 + 0.32, 0.12, H - 0.12, lo, hi);
        bx(Mt.y9house, a0, a1, 0.12, 0.35, lo, hi); bx(Mt.y9house, a0, a1, H - 0.35, H - 0.12, lo, hi);
        bx(Mt.y9mouth, a0, a1, 0.35, H - 0.35, Math.min(outF, outF + o * 0.06), Math.max(outF, outF + o * 0.06)).name = 'h132-socket';
      }
    }
  }
  WL.dressed = true; return true;
}
/** each wall back on its own hinge (a work's own pre-state: the west wall may lie by the pile from an earlier strip) */
export function homeWalls() { if (!SH9.walls) return; for (const k of ['N', 'S', 'E', 'W']) { const W = SH9.walls[k]; if (W) W.grp.position.set(HG[k].p[0], Y0, HG[k].p[1]); } }
/** a work of this lane holds the walls (it turns them itself) while it plays */
export function hold(who, on) { if (on) WL.who.add(who); else WL.who.delete(who); }
const ORDER = ['site', 'formLying', 'formUp', 'filled', 'bare', 'lined'];
const after = (M) => { try { const b = M && M.block ? M.block() : 'site'; return ORDER.indexOf(b) >= ORDER.indexOf('bare'); } catch (e) { return false; } };
/** the walls after the strip: all four carried to the timber pile and laid flat in a stack beside it, face up (the site clean for the
 *  line: no board left round the block) — each group turned so its run lies along +x and its height along +z, one board's thickness
 *  over the one below */
export const STACK = Object.freeze(['S', 'N', 'E', 'W']);
export function stackAt(k) {
  const [, pz] = S9.pile, i = STACK.indexOf(k), along = k === 'N' || k === 'S';
  // (N/S: turned a quarter about x, their thickness then hangs below (N) or stands above (S) the group's origin; E/W: as the west one)
  const y = F + T * (i + 1) + (k === 'S' ? -T : 0) + 0.02 * i;
  return { p: [PILEW.x0, y, pz - PILEW.dz - H], r: along ? [Math.PI / 2, 0, 0] : [0, Math.PI / 2, Math.PI / 2] };
}
export function lieAfter() {
  if (!SH9.walls) return;
  for (const k of STACK) { const W = SH9.walls[k]; if (!W) continue; const q = stackAt(k); W.grp.visible = true; W.grp.position.set(q.p[0], q.p[1], q.p[2]); W.grp.rotation.set(q.r[0], q.r[1], q.r[2]); }
}
export const WALLS3D = {
  owns(what) { if (what !== 'walls') return false; return WL.who.size > 0 || (!!WL.X && after(WL.X.M)); },
  init(X) { WL.X = X; wmats(X); dress(X); },
  sync(X, M) { WL.X = X; if (!WL.dressed) dress(X); if (!WL.who.size && after(M)) lieAfter(); },
  frame(dt, X, M) { if (!WL.who.size && SH9.walls && after(M) && STACK.some((k) => SH9.walls[k] && SH9.walls[k].grp.position.x !== PILEW.x0)) lieAfter(); },
  rest(X, M) { WL.X = X; wmats(X); dress(X); if (after(M)) lieAfter(); },
};
void F;
