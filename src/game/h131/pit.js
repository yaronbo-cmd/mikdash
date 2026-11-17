/* ── build 131 ── h131/pit.js — part 1 of stage 08, "הבור בבקעת בית כרם" (spec: three works). THE PIT LANE'S FILE.
 * Build 131 part 1: a stand-in (stub.js) — the camera goes to the pit at Beit Kerem (the book's pit sheet, BOOK.s08.pit) and the work
 * finishes at once. The pit lane replaces this file's make() with the real act (its rules in pit-model.js, its things in pit3d.js).
 *   PIT_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK, pitWorld } from '../world/grid.js';
import { stubAct } from './stub.js';
import { LINES } from './model.js';

const S8 = BOOK.s08, P = S8.pit;
/** a camera point of the sheet [lx, y, lz] in the world */
const W = (p) => { const w = pitWorld(p[0], p[2]); return [w.x, w.y + p[1], w.z]; };

export const PIT_ACT = {
  icon: '⛏',
  title: 'הבור בבית כרם',
  walkLine: () => 'יוצאים אל הבור בבקעת בית כרם',
  /** on the Mount: the place the camera jumps from (the pile from the pit, north of the altar) */
  stand() { const s = S8.stand.pit; return { x: s[0], z: s[1], face: [S8.pile[0], S8.pile[1]] }; },
  prepare() {},
  make(m, X) {
    const C = P.cam.open, at = pitWorld(P.hole.at[0], P.hole.at[1]);
    return stubAct(m, X, { pit: true, eye: W(C[0]), aim: W(C[1]), at: { x: at.x, y: at.y, z: at.z }, line: LINES.place });
  },
};
