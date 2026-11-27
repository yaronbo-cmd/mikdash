/* ── build 138 ── h138/acts.js — the acts of stage 15 "קודש הקדשים" (spec docs/specs/shlav-15-he.md v4), the registry the pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 * work 1 "האומן בתיבה" (teivah: the view from inside the box over the whole screen), work 2 "להשתיק שתי פרוכות" (parochot: the amah's
 * section). Both stand the kohen at the Heichal's west end; the act's screen takes over (his walk up to the lul and the box's descent are
 * a short line for now: build 138's first integration). The world: world.js. */
import { BOOK } from '../world/grid.js';
import { overlayAct } from './kit15.js';
import { teivahView } from './teivah-view.js';
import { parochotView } from './parochot-view.js';
import { initWorld, frameWorld, SH15 } from './world.js';

const B = BOOK.s15;
const flaw = (map) => (label) => { for (const [k, v] of Object.entries(map)) if (String(label).includes(k)) return v; return null; };
export const TEIVAH_ACT = {
  icon: '🪵', title: 'האומן בתיבה',
  walkLine: () => 'האומן בתיבה: אל הלול שבעלייה, מעל קודש הקדשים',
  stand() { return { x: B.stand.heichal.x + 2, z: 0, face: [-150, 0] }; },
  prepare() {},
  make: (m, X) => overlayAct(m, X, teivahView, { flawOf: flaw({ 'קמט': 'teivah.crease', 'שריטה': 'teivah.scratch' }) }),
};
export const PAROCHOT_ACT = {
  icon: '🧵', title: 'להשתיק שתי פרוכות',
  walkLine: () => 'שתי הפרוכות: אל הכותל הדרומי, מול הפרוכת החיצונה',
  stand() { return { x: B.stand.heichal.x, z: B.stand.heichal.z, face: [-150, B.stand.heichal.z] }; },
  prepare() {},
  make: (m, X) => overlayAct(m, X, parochotView, { flawOf: flaw({ 'קרע': 'parochot.tear' }) }),
};
export const ACTS = {
  teivah: TEIVAH_ACT,
  parochot: PAROCHOT_ACT,
  __init: initWorld,
  __sh: () => SH15,
  __frame(dt, X) { frameWorld(dt, X); },
};
