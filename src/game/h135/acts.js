/* ── build 135 ── h135/acts.js — the acts of stage 12 "הכיור" (spec docs/specs/shlav-12-he.md v7), the registry the pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 * The three works, each in its own file: שנים עשר הדדים (dadim.js), המוכני (mukhni.js), ההמשכה מבור הגולה (hamshacha.js). The world of
 * all of them: world.js, drawn from the save. The champion's seal: every work done at level 3 — fireworks at the seal west of the
 * stations, a bonus of 2,000 once.
 */
import { DADIM_ACT } from './dadim.js';
import { MUKHNI_ACT } from './mukhni.js';
import { HAMSHACHA_ACT } from './hamshacha.js';
import { initWorld, frameWorld, SH12 } from './world.js';
import { BOOK } from '../world/grid.js';

const S12 = BOOK.s12;
try { if (typeof document !== 'undefined' && !document.getElementById('h134-line-css')) { const st = document.createElement('style'); st.id = 'h134-line-css'; st.textContent = 'body .h109-line{white-space:normal;max-width:min(92vw,600px);width:max-content;text-align:center}'; document.head.appendChild(st); } } catch (e) { /* */ }
function champion(dt, X) {
  const M = X.M; if (!M || !M.championDue) return;
  const C = SH12.champ;
  if (!C) {
    if (!M.championDue() || M.mission()) return;
    M.st.champion = 1; X.save(); SH12.key = '';
    try { if (X.bonus) X.bonus(2000, 'champion', 'חותם האלוף'); } catch (e) { /* */ }
    try { X.perfect('חותם האלוף!', { x: S12.champion[0], y: S12.floor + 2, z: S12.champion[1] }); } catch (e) { /* */ }
    SH12.champ = { t: 0, n: 0 };
    return;
  }
  C.t += dt;
  const P = [[0, 14, 0], [5, 20, -6], [-5, 22, 6], [8, 26, -2], [-3, 28, -8], [2, 32, 4]];
  while (C.n < P.length && C.t > C.n * 0.45) { const p = P[C.n++]; try { X.sparks(S12.champion[0] + p[0], S12.floor + p[1], S12.champion[1] + p[2], 40); X.dust(S12.champion[0] + p[0], S12.floor + p[1], S12.champion[1] + p[2], 6, 6); } catch (e) { /* */ } }
  if (C.t > 4) SH12.champ = null;
}
export const ACTS = {
  dadim: DADIM_ACT,
  mukhni: MUKHNI_ACT,
  hamshacha: HAMSHACHA_ACT,
  __init: initWorld,
  __sh: () => SH12,
  __frame(dt, X) { frameWorld(dt, X); try { champion(dt, X); } catch (e) { /* */ } },
};
