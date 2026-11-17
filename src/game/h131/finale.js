/* ── build 131 ── h131/finale.js — part 4 of stage 08, "הסיום" (spec: one work: the timbers pulled, the whitening, the water). THE
 * FRAME-AND-FINALE LANE'S FILE.
 * Build 131 part 1: a stand-in (stub.js) — the camera over the altar's site, and the work finishes at once. The lane replaces make().
 *   FINALE_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { stubAct } from './stub.js';
import { LINES } from './model.js';

const S8 = BOOK.s08;

export const FINALE_ACT = {
  icon: '💧',
  title: 'הסיום',
  walkLine: () => 'שולפים את קורות העץ, מלבינים ושופכים מים',
  stand() { const s = S8.stand.south; return { x: s[0], z: s[1], face: [s[0], s[1] - 4] }; },
  prepare() {},
  make(m, X) {
    const C = S8.cam.end;
    return stubAct(m, X, { eye: C[0], aim: C[1], at: { x: S8.mid[0], y: S8.top, z: S8.mid[1] }, line: LINES.holes });
  },
};
