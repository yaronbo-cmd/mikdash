/* ── build 134 ── h134/acts.js — the acts of stage 11 "הקרנות" (spec docs/specs/shlav-11-he.md), the registry the pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 * One station a corner for the packing (orez<c>) and the extraction (chilutz<c>), the repair of a flawed horn (fix<c>), and the
 * goldsmith's bench (chotem). The works, each in its own file: אריזת הקרנות (orez.js), חילוץ הגופים (chilutz.js), שני החוטמים
 * (chotem.js). The world of all of them: world.js, drawn from the save. The champion's seal (spec "חותם האלוף"): every station of
 * works 1 and 3 done at level 3 — giant fireworks at the seal east of the kevesh's foot, a bonus of 2,000 once.
 */
import { OREZ_ACT, FIX_ACT } from './orez.js';
import { CHIL_ACT } from './chilutz.js';
import { CHOTEM_ACT } from './chotem.js';
import { initWorld, frameWorld, SH11 } from './world.js';
import { CORNERS, RU } from './model.js';
import { BOOK } from '../world/grid.js';

const S11 = BOOK.s11;
function champion(dt, X) {
  const M = X.M; if (!M || !M.championDue) return;
  const C = SH11.champ;
  if (!C) {
    if (!M.championDue() || M.mission()) return;
    M.st.champion = 1; X.save(); SH11.key = '';
    try { if (X.bonus) X.bonus(2000, 'champion', 'חותם האלוף'); } catch (e) { /* */ }
    try { X.perfect('חותם האלוף!', { x: S11.champion[0], y: S11.floor + 2, z: S11.champion[1] }); } catch (e) { /* */ }
    SH11.champ = { t: 0, n: 0 };
    return;
  }
  C.t += dt;
  // (the giant fireworks over the seal and the altar: fixed places, no draw)
  const P = [[0, 18, 0], [6, 24, -8], [-6, 26, -14], [10, 30, -20], [-4, 32, -26], [2, 36, -16]];
  while (C.n < P.length && C.t > C.n * 0.45) { const p = P[C.n++]; try { X.sparks(S11.champion[0] + p[0], S11.floor + p[1], S11.champion[1] + p[2], 40); X.dust(S11.champion[0] + p[0], S11.floor + p[1], S11.champion[1] + p[2], 6, 6); } catch (e) { /* */ } }
  if (C.t > 4) SH11.champ = null;
}
/** a station of its corner: the act with the corner's name in its title (the walk's line and the marker) */
const at = (A, c, title) => ({ ...A, title: `${title} · ${RU[c]}`, walkLine: () => `${title}: לעלות על הכבש אל הקרן ${RU[c]}` });
export const ACTS = {
  chotem: { ...CHOTEM_ACT, walkLine: () => 'שני החוטמים: אל שולחן הצורף, בדרום עזרת הנשים (המחשה)' },
  __init: initWorld,
  __sh: () => SH11,
  __frame(dt, X) { frameWorld(dt, X); try { champion(dt, X); } catch (e) { /* */ } },
};
for (const c of CORNERS) {
  ACTS['orez' + c] = at(OREZ_ACT, c, 'אריזה');
  ACTS['chilutz' + c] = at(CHIL_ACT, c, 'חילוץ');
  ACTS['fix' + c] = at(FIX_ACT, c, 'תיקון');
}
