/* ── build 130 ── h130/acts.js — the acts of the new stage 05 "עזרת הנשים" (spec docs/specs/shlav-05-hadash-he.md, brief §3–§6), the
 * registry every pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg(), wants(p), holds(), cancel() } — it calls X.end once.
 * Part 1: the gallery (gallery.js, with level 3's raising, raise.js). The wood chamber, the light and the evening are parts 2 and 3: a
 * kind with no act here has no stand, so the director offers none of its works yet.
 */
import { GALLERY } from './gallery.js';
import { initWorld, frameWorld, SH130 } from './world.js';

export const ACTS = {
  gallery: GALLERY,
  __init: initWorld,
  __sh: () => SH130,
  __frame(dt, X) { frameWorld(dt, X); },
};
