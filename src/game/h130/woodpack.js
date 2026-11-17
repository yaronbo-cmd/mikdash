/* ── build 130 (W-wire: TEMPORARY) ── h130/woodpack.js — a stand-in pack for the wood station alone, so its page
 * (__H109_ONLY = 'wood' with __H130_FULL) runs before the real pack of part 1 is merged. The reviewer replaces it at merge with the
 * real h130/pack.js: register WOOD_ACT (wood.js) as ACTS.wood, and call woodWorld(X) / woodFrame(dt, X) / woodRest(X) (wood3d.js)
 * from the stage world's initWorld / frameWorld / restWorld.
 */
import { PLAN, createH130 } from './model.js';
import { WOOD_ACT } from './wood.js';
import { woodWorld, woodFrame, woodRest } from './wood3d.js';
import { makeLook, LOOK_RING_K } from '../world/look.js';
import { BOOK } from '../world/grid.js';

const S5 = BOOK.s05, GB = S5.gal;
const LOOKW = makeLook({ boxes: S5.walls.map((r, i) => [r[0], S5.court.floor - 1, r[1], r[2], GB.wallTops[i] != null ? GB.wallTops[i] : 40, r[3]]).filter((b) => b[4] > S5.court.floor + 0.5), K: LOOK_RING_K });
const ACTS = { wood: WOOD_ACT, __init: (X) => woodWorld(X), __frame: (dt, X) => woodFrame(dt, X) };
export function makeWoodPack() {
  return {
    id: 'nashim', key: 'h130', name: 'עזרת הנשים', PLAN, ACTS, icon: '🏛',
    create: (save) => createH130(save), count: (M) => M.count(), freeFilms: true, look: LOOKW,
    endTitle: 'עזרת הנשים נבנתה!', endSub: '', film: [],
    sync() {}, unitEnd: () => null, before: () => null, async finale() {},
    rest(X) { woodRest(X); }, dispose() {},
  };
}
