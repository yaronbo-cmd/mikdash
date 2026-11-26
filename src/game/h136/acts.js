/* ── build 136 ── h136/acts.js — the acts of stage 13 "האולם" (spec docs/specs/shlav-13-he.md v4), the registry the pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 * The three works, each in its own file: חמש המלתראות (maltra.js), כלונסות הארז (kelonsa.js), שרשראות הזהב (sharsheret.js). The world of
 * all of them: world.js, drawn from the save. The champion's seal: every work done at level 3 — fireworks at the seal on the court, a
 * bonus of 2,000 once.
 */
import { MALTRA_ACT } from './maltra.js';
import { KELONSA_ACT } from './kelonsa.js';
import { SHARSHERET_ACT } from './sharsheret.js';
import { initWorld, frameWorld, SH13 } from './world.js';
import { BOOK } from '../world/grid.js';

const S13 = BOOK.s13;
try { if (typeof document !== 'undefined' && !document.getElementById('h134-line-css')) { const st = document.createElement('style'); st.id = 'h134-line-css'; st.textContent = 'body .h109-line{white-space:normal;max-width:min(92vw,600px);width:max-content;text-align:center}'; document.head.appendChild(st); } } catch (e) { /* */ }
function champion(dt, X) {
  const M = X.M; if (!M || !M.championDue) return;
  const C = SH13.champ;
  if (!C) {
    if (!M.championDue() || M.mission()) return;
    M.st.champion = 1; X.save(); SH13.key = '';
    try { if (X.bonus) X.bonus(2000, 'champion', 'חותם האלוף'); } catch (e) { /* */ }
    try { X.perfect('חותם האלוף!', { x: S13.champion[0], y: S13.floor + 2, z: S13.champion[1] }); } catch (e) { /* */ }
    SH13.champ = { t: 0, n: 0 };
    return;
  }
  C.t += dt;
  const P = [[0, 14, 0], [5, 20, -6], [-5, 22, 6], [8, 26, -2], [-3, 28, -8], [2, 32, 4]];
  while (C.n < P.length && C.t > C.n * 0.45) { const p = P[C.n++]; try { X.sparks(S13.champion[0] + p[0], S13.floor + p[1], S13.champion[1] + p[2], 40); X.dust(S13.champion[0] + p[0], S13.floor + p[1], S13.champion[1] + p[2], 6, 6); } catch (e) { /* */ } }
  if (C.t > 4) SH13.champ = null;
}
export const ACTS = {
  maltra: MALTRA_ACT,
  kelonsa: KELONSA_ACT,
  sharsheret: SHARSHERET_ACT,
  __init: initWorld,
  __sh: () => SH13,
  __frame(dt, X) { frameWorld(dt, X); try { champion(dt, X); } catch (e) { /* */ } },
};
