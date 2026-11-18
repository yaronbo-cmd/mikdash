/* ── build 132 ── h132/acts.js — the acts of stage 09 "הסובב וחוט הסיקרא" (spec docs/specs/shlav-09-he.md), the registry every pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg(), wants(p), holds(), cancel() } — it calls X.end once.
 * The lanes, each in its own files: lane A the form (form.js) and the strip (strip.js); lane B the line (sikra.js); the lead the fill
 * (fill.js) and the ending (pack.js finale). The world of all of them: world.js, drawn from the save and the open work.
 */
import { FORM_ACT } from './form.js';
import { FILL_ACT } from './fill.js';
import { STRIP_ACT } from './strip.js';
import { SIKRA_ACT } from './sikra.js';
import { initWorld, frameWorld, SH9 } from './world.js';

export const ACTS = {
  form: FORM_ACT, fill: FILL_ACT, strip: STRIP_ACT, sikra: SIKRA_ACT,
  __init: initWorld,
  __sh: () => SH9,
  __frame(dt, X) { frameWorld(dt, X); },
};
