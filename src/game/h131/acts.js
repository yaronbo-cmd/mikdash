/* ── build 131 ── h131/acts.js — the acts of stage 08 "יסוד המזבח" (spec docs/specs/shlav-08-he.md), the registry every pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg(), wants(p), holds(), cancel() } — it calls X.end once.
 * The lanes, each in its own files: the pit (pit.js), the frame (frame.js) and the finale (finale.js), the pour (pour.js).
 * The world of all of them: world.js (the pit's site at Beit Kerem and the altar's site in the court), drawn from the save.
 */
import { PIT_ACT } from './pit.js';
import { FRAME_ACT } from './frame.js';
import { POUR_ACT } from './pour.js';
import { FINALE_ACT } from './finale.js';
import { initWorld, frameWorld, SH8 } from './world.js';

export const ACTS = {
  pit: PIT_ACT, frame: FRAME_ACT, pour: POUR_ACT, finale: FINALE_ACT,
  __init: initWorld,
  __sh: () => SH8,
  __frame(dt, X) { frameWorld(dt, X); },
};
