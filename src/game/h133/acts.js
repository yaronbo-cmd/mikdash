/* ── build 133 ── h133/acts.js — the acts of stage 10 "גוף המזבח והכבש" (spec docs/specs/shlav-10-he.md), the registry the pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 * The works, each in its own file: הציפורן (nail.js), המלבן במרכז (malben.js), הכבש (kevesh.js), מלא נימא (nima.js). The world of all of
 * them: world.js, drawn from the save. The champion's seal (spec "חותם האלוף"): the last work of the stage done at level 3 — giant
 * fireworks at the seal by the kevesh's foot, every crew cheering, a bonus of 2,000 once.
 */
import { NAIL_ACT } from './nail.js';
import { MALBEN_ACT } from './malben.js';
import { KEVESH_ACT } from './kevesh.js';
import { NIMA_ACT } from './nima.js';
import { initWorld, frameWorld, SH10 } from './world.js';
import { BOOK } from '../world/grid.js';

const S10 = BOOK.s10;
function champion(dt, X) {
  const M = X.M; if (!M || !M.championDue) return;
  const C = SH10.champ;
  if (!C) {
    if (!M.championDue() || M.mission()) return;
    M.st.champion = 1; X.save(); SH10.key = '';
    try { if (X.bonus) X.bonus(2000, 'champion', 'חותם האלוף'); } catch (e) { /* */ }
    try { X.perfect('חותם האלוף!', { x: S10.champion[0], y: S10.floor + 2, z: S10.champion[1] }); } catch (e) { /* */ }
    SH10.champ = { t: 0, n: 0 };
    return;
  }
  C.t += dt;
  // (the giant fireworks: bursts over the seal and the kevesh, three seconds; fixed places, no draw)
  const P = [[0, 18, 0], [-8, 24, -6], [7, 22, -10], [-14, 28, -18], [12, 26, -22], [0, 32, -14]];
  while (C.n < P.length && C.t > C.n * 0.45) { const p = P[C.n++]; try { X.sparks(S10.champion[0] + p[0], S10.floor + p[1], S10.champion[1] + p[2], 40); X.dust(S10.champion[0] + p[0], S10.floor + p[1], S10.champion[1] + p[2], 6, 6); } catch (e) { /* */ } }
  if (C.t > 4) SH10.champ = null;
}
export const ACTS = {
  nail: NAIL_ACT, malben: MALBEN_ACT, kevesh: KEVESH_ACT, nima: NIMA_ACT,
  __init: initWorld,
  __sh: () => SH10,
  __frame(dt, X) { frameWorld(dt, X); try { champion(dt, X); } catch (e) { /* */ } },
};
