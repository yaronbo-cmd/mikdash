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

/** (review P6) while a stage 09 act runs the body carries h132-act: the touch's flash smaller and dimmer, the gold vignette off — the
 *  words and the numbers of a quick run read on the work, not in a glare. It goes half a second after the stage's frames stop */
const GLARE = 'body.h132-act .jx-f{width:80px;height:80px;filter:opacity(.5)}body.h132-act .jx-f.g{width:110px;height:110px}body.h132-act .jx>.jx-v{display:none}';
let clsT = 0;
function actClass() {
  if (typeof document === 'undefined' || !document.body) return;
  if (!document.getElementById('h132-glare')) { const st = document.createElement('style'); st.id = 'h132-glare'; st.textContent = GLARE; document.head.appendChild(st); }
  document.body.classList.toggle('h132-act', document.body.classList.contains('h109-act'));
  clearTimeout(clsT); clsT = setTimeout(() => { try { document.body.classList.remove('h132-act'); } catch (e) { /* */ } }, 500);
}
export const ACTS = {
  form: FORM_ACT, fill: FILL_ACT, strip: STRIP_ACT, sikra: SIKRA_ACT,
  __init: initWorld,
  __sh: () => SH9,
  __frame(dt, X) { frameWorld(dt, X); actClass(); },
};
