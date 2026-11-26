/* ── build 137 ── h137/acts.js — the acts of stage 14 "ההיכל" (spec docs/specs/shlav-14-he.md v3), the registry the pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 * The three works, each in its own file: מבוך התאים (taim.js), הקצעת קרשי התקרה (hakzaa.js), הזהבת המים והדלתות (zahav.js). The world
 * of all of them: world.js, drawn from the save; while an act runs, the world leaves it the part it draws itself (own: the cells' wing
 * in section, the yard's bench, the wall being gilded). The champion's seal: every work done at level 3 — fireworks at the seal on the
 * court, a bonus of 2,000 once.
 */
import { TAIM_ACT } from './taim.js';
import { HAKZAA_ACT } from './hakzaa.js';
import { ZAHAV_ACT } from './zahav.js';
import { initWorld, frameWorld, SH14, own } from './world.js';
import { PLAN as ZPLAN } from './zahav-model.js';
import { BOOK } from '../world/grid.js';

const S14 = BOOK.s14;
try { if (typeof document !== 'undefined' && !document.getElementById('h134-line-css')) { const st = document.createElement('style'); st.id = 'h134-line-css'; st.textContent = 'body .h109-line{white-space:normal;max-width:min(92vw,600px);width:max-content;text-align:center}'; document.head.appendChild(st); } } catch (e) { /* */ }
/** the act with the world's part handed to it while it runs */
function owning(A, keyOf) {
  return { ...A, make(m, X) {
    const k = keyOf(m); own(k, true);
    const a = A.make(m, X), end = a.end;
    a.end = function (...r) { try { return end.apply(a, r); } finally { own(k, false); } };
    return a;
  } };
}
function champion(dt, X) {
  const M = X.M; if (!M || !M.championDue) return;
  const C = SH14.champ;
  if (!C) {
    if (!M.championDue() || M.mission()) return;
    M.st.champion = 1; X.save(); SH14.key = '';
    try { if (X.bonus) X.bonus(2000, 'champion', 'חותם האלוף'); } catch (e) { /* */ }
    try { X.perfect('חותם האלוף!', { x: S14.champion[0], y: S14.floor + 2, z: S14.champion[1] }); } catch (e) { /* */ }
    SH14.champ = { t: 0, n: 0 };
    return;
  }
  C.t += dt;
  const P = [[0, 14, 0], [5, 20, -6], [-5, 22, 6], [8, 26, -2], [-3, 28, -8], [2, 32, 4]];
  while (C.n < P.length && C.t > C.n * 0.45) { const p = P[C.n++]; try { X.sparks(S14.champion[0] + p[0], S14.floor + p[1], S14.champion[1] + p[2], 40); X.dust(S14.champion[0] + p[0], S14.floor + p[1], S14.champion[1] + p[2], 6, 6); } catch (e) { /* */ } }
  if (C.t > 4) SH14.champ = null;
}
export const ACTS = {
  taim: owning(TAIM_ACT, () => 'wing'),
  hakzaa: owning(HAKZAA_ACT, () => 'yard'),
  zahav: owning(ZAHAV_ACT, (m) => 'gold:' + (ZPLAN[m.lv | 0 || 1] || ZPLAN[1]).wall),
  __init: initWorld,
  __sh: () => SH14,
  __frame(dt, X) { frameWorld(dt, X); try { champion(dt, X); } catch (e) { /* */ } },
};
