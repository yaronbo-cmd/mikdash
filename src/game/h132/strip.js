/* ── build 132 ── h132/strip.js — work 3 "שליפת התבנית" (spec docs/specs/shlav-09-he.md, עבודה 3). LANE A's file: phase 0 holds a stub
 * (stub.js); lane A replaces STRIP_ACT here (its pure rules — the dependency graph, the tap test, level 3's wedge and westward slide,
 * the damages — in strip-model.js, its things in strip3d.js, the walls shared with form.js in walls3d.js). */
import { BOOK } from '../world/grid.js';
import { stubAct } from './stub.js';

const S9 = BOOK.s09;
export const STRIP_ACT = {
  icon: '🪓',
  title: 'שליפת התבנית',
  walkLine: () => 'השליפה: בודקים בטאפ ושולפים בסדר הנכון',
  stand() { const s = S9.stand.w3; return { x: s[0], z: s[1], face: [S9.mid[0], S9.mid[1]] }; },
  prepare() {},
  make(m, X) { return stubAct(m, X, { eye: S9.cam.w3[0], aim: S9.cam.w3[1], at: { x: S9.mid[0], y: S9.top, z: S9.mid[1] }, line: 'שליפת התבנית', kohen: false }); },
};
