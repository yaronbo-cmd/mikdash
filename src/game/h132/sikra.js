/* ── build 132 ── h132/sikra.js — work 4 "חוט הסיקרא" (spec docs/specs/shlav-09-he.md, עבודה 4). LANE B's file: phase 0 holds a stub
 * (stub.js); lane B replaces SIKRA_ACT here (its pure rules — the measuring rod and stakes, pace and height, wetness, bowl, drips,
 * stains, seams, six 5-amah segments a wall, the corner windows, the west wall's flaws from M.westSlots(), the closing — in
 * sikra-model.js, its things in sikra3d.js; two pointers at once). */
import { BOOK } from '../world/grid.js';
import { stubAct } from './stub.js';

const S9 = BOOK.s09;
export const SIKRA_ACT = {
  icon: '🧵',
  title: 'חוט הסיקרא',
  walkLine: () => 'חוט הסיקרא: מודדים, ואז מקיפים את הגוש',
  stand() { const s = S9.stand.w4; return { x: s[0], z: s[1], face: [S9.sikra.bowl[0], S9.sikra.bowl[1]] }; },
  prepare() {},
  make(m, X) { return stubAct(m, X, { eye: S9.cam.w4measure[0], aim: S9.cam.w4measure[1], at: { x: S9.sikra.start[0], y: S9.lineY, z: S9.sikra.start[1] }, line: 'חוט הסיקרא' }); },
};
