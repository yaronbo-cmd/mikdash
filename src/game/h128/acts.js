/* ── build 128 ── h128/acts.js — the acts of stage 06 "שער ניקנור וחמש עשרה המעלות" (brief §4–§8), the registry every pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg(), wants(p), holds(), cancel() } — it calls X.end once.
 * The sea (station 1) is part 3's: its works are in the plan, and the pack (pack.js SEA_IN_PLAY) starts the stage at the capstan until
 * then; its act here only gives the work back as the crews would leave it.
 */
import { CAPSTAN } from './capstan.js';
import { RING } from './steps.js';
import { BOLT } from './wicket.js';
import { CLOSE } from './close.js';
import { initWorld, frameWorld, SH6 } from './world.js';
import { freeOf } from './model.js';
import { BOOK } from '../world/grid.js';

const S6 = BOOK.s06;
/** (part 3) the sea's station: not built yet — at the court's east gate, it ends at once with no stars */
const SEA = {
  icon: '🌊', title: 'הנחשול',
  walkLine: () => 'הדלתות בדרך מאלכסנדריא',
  stand() { return { x: S6.eastGate[0] - 4, z: S6.eastGate[1], face: [S6.eastGate[0], S6.eastGate[1]] }; },
  prepare() {},
  make(m, X) { return { begin() { setTimeout(() => X.end({ stars: 0, q: 0, pts: 0 }), 300); }, update() {}, at: () => null, dbg: () => ({ phase: 'part3' }), wants: () => false, holds: () => false }; },
};
export const ACTS = {
  sea: SEA, capstan: CAPSTAN, steps: RING, wicket: BOLT, close: CLOSE,
  __init: initWorld,
  __sh: () => SH6,
  __frame(dt, X) { frameWorld(dt, X); },
  __ensure(m) { void freeOf(m && m.id); },
};
