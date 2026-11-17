/* ── build 131 ── h131/frame.js — part 2 of stage 08, "המלבן" (spec: three works). THE FRAME-AND-FINALE LANE'S FILE.
 * Build 131 part 1: a stand-in (stub.js) — the camera shows the altar's site with the witness's stakes, and the work finishes at once.
 * The frame lane replaces make() with the real act (its rules in frame-model.js, its things in frame3d.js).
 *   FRAME_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { stubAct } from './stub.js';
import { LINES } from './model.js';

const S8 = BOOK.s08;

export const FRAME_ACT = {
  icon: '📐',
  title: 'המלבן',
  walkLine: () => 'המלבן: מסגרת העץ במקום שהעד מראה',
  stand() { const s = S8.stand.frame; return { x: s[0], z: s[1], face: [S8.mid[0], S8.mid[1]] }; },
  prepare() {},
  make(m, X) {
    const C = S8.cam.site;
    return stubAct(m, X, { eye: C[0], aim: C[1], at: { x: S8.mid[0], y: S8.top, z: S8.mid[1] }, line: LINES.rashi });
  },
};
