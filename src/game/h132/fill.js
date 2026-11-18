/* ── build 132 ── h132/fill.js — work 2 "מילוי הגוש באיזון" (spec docs/specs/shlav-09-he.md, עבודה 2). THE LEAD'S file: phase 0 holds a
 * stub (stub.js); phase 1 replaces FILL_ACT here (the pure model in fill-model.js first: units, the flow step by step with the fixed tie
 * order, the collapse, the gauges at exactly 1 and 2, the weak pockets, the layers, level 3's caravan; its things in fill3d.js). */
import { BOOK } from '../world/grid.js';
import { stubAct } from './stub.js';

const S9 = BOOK.s09;
export const FILL_ACT = {
  icon: '🧺',
  title: 'מילוי הגוש באיזון',
  walkLine: () => 'המילוי: עשרים מטענים, חמש שכבות',
  stand() { const s = S9.stand.w2; return { x: s[0], z: s[1], face: [S9.ramp.foot[0], S9.ramp.foot[1]] }; },
  prepare() {},
  make(m, X) { return stubAct(m, X, { eye: S9.cam.w2[0], aim: S9.cam.w2[1], at: { x: S9.mid[0], y: S9.top, z: S9.mid[1] }, line: 'מילוי הגוש באיזון', kohen: false }); },
};
