/* ── build 128 ── h128/acts.js — the acts of stage 06 "שער ניקנור וחמש עשרה המעלות" (brief §4–§8), the registry every pack shares:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg(), wants(p), holds(), cancel() } — it calls X.end once.
 * The sea (station 1, sea.js): three works on the ship and the quay at Akko, before the capstan.
 */
import { SEA } from './sea.js';
import { CAPSTAN } from './capstan.js';
import { RING } from './steps.js';
import { BOLT } from './wicket.js';
import { CLOSE } from './close.js';
import { initWorld, frameWorld, SH6 } from './world.js';
import { freeOf } from './model.js';
import { BOOK } from '../world/grid.js';

const S6 = BOOK.s06;
export const ACTS = {
  sea: SEA, capstan: CAPSTAN, steps: RING, wicket: BOLT, close: CLOSE,
  __init: initWorld,
  __sh: () => SH6,
  __frame(dt, X) { frameWorld(dt, X); },
  __ensure(m) { void freeOf(m && m.id); },
};
