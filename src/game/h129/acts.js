/* ── build 129 ── h129/acts.js — the acts of stage 07 "הלשכות" (brief §4–§7), the registry every pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg(), wants(p), holds(), cancel() } — it calls X.end once.
 * The Golah (station 2, golah.js) came in part 3 (pack.js GOLAH_IN_PLAY).
 */
import { GAZIT } from './gazit.js';
import { VAULT } from './vault.js';
import { NIGHT } from './night.js';
import { GOLAH_ACT } from './golah.js';
import { initWorld, frameWorld, SH7 } from './world.js';

export const ACTS = {
  gazit: GAZIT, golah: GOLAH_ACT, vault: VAULT, night: NIGHT,
  __init: initWorld,
  __sh: () => SH7,
  __frame(dt, X) { frameWorld(dt, X); },
};
