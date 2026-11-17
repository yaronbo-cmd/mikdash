/* ── build 131 ── h131/pour.js — part 3 of stage 08, "היציקה" (the main work, spec: three works). THE POUR LANE'S FILE (the lead's).
 * Build 131 part 1: a stand-in (stub.js) — the camera over the work's section, and the work finishes at once. Part 2 codes the act on
 * the approved sample's simulation (samples/yetzika/sim.js).
 *   POUR_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { stubAct } from './stub.js';
import { LINES } from './model.js';

const S8 = BOOK.s08;
const mid = (b) => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2];

export const POUR_ACT = {
  icon: '🔥',
  title: 'היציקה',
  walkLine: (m) => `היציקה: מקטע ${m && m.lv ? m.lv : 1}`,
  stand(m) { const s = m && m.lv === 3 ? S8.stand.south : S8.stand.pour; return { x: s[0], z: s[1], face: [s[0], s[1] + (s[2] === 'S' ? 4 : -4)] }; },
  prepare() {},
  make(m, X) {
    const lv = m.lv || 1, [cx, cz] = mid(S8.sections[lv]), s = lv === 3 ? S8.stand.south : S8.stand.pour;
    const eye = [s[0] + (cx - s[0]) * -0.2, S8.floor + 18, s[1] + (cz - s[1]) * -0.6];
    return stubAct(m, X, { eye, aim: [cx, S8.floor, cz], at: { x: cx, y: S8.top, z: cz }, line: LINES.rambam216 });
  },
};
