/* ── build 130 ── h130/acts.js — the acts of the new stage 05 "עזרת הנשים" (spec docs/specs/shlav-05-hadash-he.md, brief §3–§6), the
 * registry every pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg(), wants(p), holds(), cancel() } — it calls X.end once.
 * The gallery (gallery.js, with level 3's raising, raise.js), the wood chamber (wood.js), the light (light.js) and the evening (eve.js).
 * The world of all of them: world.js (with wood3d.js and light3d.js), drawn from the save.
 */
import { GALLERY } from './gallery.js';
import { WOOD_ACT } from './wood.js';
import { LIGHT } from './light.js';
import { EVE } from './eve.js';
import { initWorld, frameWorld, SH130 } from './world.js';

export const ACTS = {
  gallery: GALLERY,
  wood: WOOD_ACT,
  light: LIGHT,
  eve: EVE,
  __init: initWorld,
  __sh: () => SH130,
  __frame(dt, X) { frameWorld(dt, X); },
};
