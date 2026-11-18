/* ── build 132 ── h132/form.js — work 1 "הקמת התבנית" (spec docs/specs/shlav-09-he.md, עבודה 1). LANE A's file: phase 0 holds a stub
 * (stub.js); lane A replaces FORM_ACT here (its pure rules in form-model.js, its things in form3d.js, the walls shared with strip.js
 * in walls3d.js). Every place: BOOK.s09; the world it begins from: M.stageOf(m) (h132/model.js stage('form', lv, save)). */
import { BOOK } from '../world/grid.js';
import { stubAct } from './stub.js';

const S9 = BOOK.s09;
export const FORM_ACT = {
  icon: '🪵',
  title: 'הקמת התבנית',
  walkLine: (m) => 'התבנית: מרימים ארבע דפנות' + (m && m.lv === 1 ? ' (שתיים כבר עומדות)' : m && m.lv === 3 ? ' (ורוח בדרך)' : ''),
  stand() { const s = S9.stand.w1; return { x: s[0], z: s[1], face: [S9.mid[0], S9.mid[1]] }; },
  prepare() {},
  make(m, X) { return stubAct(m, X, { eye: S9.cam.w1[0], aim: S9.cam.w1[1], at: { x: S9.mid[0], y: S9.top, z: S9.mid[1] }, line: 'הקמת התבנית', kohen: false }); },
};
