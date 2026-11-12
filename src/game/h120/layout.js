/* ── build 120 ── h120/layout.js — the one geometry source of stage 05's gallery and basin (pure: no three.js, no DOM). The stage's
 * model (h120/model.js), its world (h120/world.js) and the finished model of the House (src/temple.js, its `h120` block) all read their
 * numbers from here, so the gallery the player built and the House's own gallery are one design (brief §1, §9).
 *
 * Amot throughout: +x east, +z south, +y up; an amah = 6 tefachim = 24 fingers. The court of the women: x 6…141, z −67.5…67.5, floor
 * y 6 (Middot 2:5). Every size of the gallery is illustration (not in the sources).
 */

import { BOOK } from '../world/grid.js';   // (build 124 B, rule 65: the places are the address book's — BOOK.s05 — and no second copy)
const S5 = BOOK.s05;

export const FINGER = 1 / 24, TEFACH = 1 / 6;

export const H120 = Object.freeze({
  FINGER, TEFACH,
  FLOOR: 6,
  PLINTH: 0.4, PLINTH_W: 1.6,          // the stone base under a column, 1.6 × 1.6, top y 6.4
  COL_H: 10, R0: 0.6, R1: 0.5,         // the monolith: one stone, radius 0.6 at the foot, 0.5 at the top
  BEAM_H: 0.6, BEAM_W: 0.7,            // the main cedar beam on the column tops
  JOIST: 0.3, JOIST_W: 0.32, JOIST_GAP: 2.2,   // the short beams from the wall corbels to the main beam, every 2.2 amot
  PLANK: 0.1,                          // the floor planks
  OUT: 5,                              // the column line stands 5 amot from the wall face
  SPAN: 11, SPAN_E: 11.25,             // the nominal span centre to centre; the east wing's long bay
  BAL: 78, OVER: 97,                   // the balance angle of a rising column; past OVER it is lost
  RAIL: 1.3,                           // the wooden railing on the court edge
  CRADLE: 8,                           // the column lies on its cradle at 8° from the floor
});
export const Y = Object.freeze({
  PLINTH_TOP: H120.FLOOR + H120.PLINTH,                                   // 6.4
  COL_TOP: H120.FLOOR + H120.PLINTH + H120.COL_H,                         // 16.4
  BEAM_TOP: H120.FLOOR + H120.PLINTH + H120.COL_H + H120.BEAM_H,          // 17.0
  JOIST_TOP: H120.FLOOR + H120.PLINTH + H120.COL_H + H120.BEAM_H + H120.JOIST,   // 17.3
  GFLOOR: H120.FLOOR + H120.PLINTH + H120.COL_H + H120.BEAM_H + H120.JOIST + H120.PLANK,   // 17.4: the gallery's floor, about 11 amot over the court
});

/** the ten columns (ids stable, part of the save): side S / N / E; the gallery's axis at the column ('x' along the north and south
 *  sides, 'z' on the east wings); wall: the wall face the gallery hangs from */
export const COLS = Object.freeze(Object.fromEntries(Object.entries(S5.cols).map(([id, [x, z, side, axis]]) => [id, Object.freeze({ id, x, z, side, axis })])));
export const COL_IDS = Object.freeze(Object.keys(COLS));

/** the fourteen main beams: a, b the supports (a column id, or null: a corbel in a wall), pa, pb their points on the column line */
const beam = (id, a, b, pa, pb) => Object.freeze({ id, a, b, pa: Object.freeze(pa), pb: Object.freeze(pb), axis: pa[0] === pb[0] ? 'z' : 'x', len: Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) });
export const BEAMS = Object.freeze(S5.beams.map(([id, a, b, pa, pb]) => beam(id, a, b, [...pa], [...pb])));
export const BEAM_OF = Object.freeze(Object.fromEntries(BEAMS.map((b) => [b.id, b])));

/** the gallery's three runs: the wall face it hangs from, the column line, its extent along the wall; dir: from the wall toward the court */
export const RUNS = Object.freeze(S5.runs.map((r) => Object.freeze({ ...r })));
/** the joists of a run: their positions along it (every JOIST_GAP from its start, the ends inside) */
export function joistsOf(run) { const L = []; const n = Math.max(1, Math.round((run.a1 - run.a0) / H120.JOIST_GAP)); for (let i = 0; i <= n; i++) L.push(run.a0 + 0.3 + ((run.a1 - run.a0 - 0.6) * i) / n); return L; }
/** the ladders up to the gallery (at the chambers' ends of each run): [x, z, facing x, facing z] */
export const LADDERS = Object.freeze(S5.ladders.map((l) => [...l]));

/* ───────── the mikveh in the lepers' chamber (brief §1, §7; grid יא־6) ───────── */
/** the lepers' chamber's inside: x 6…44 (its east wall 44…46), z −67.5…−29.5 (its south wall −29.5…−27.5, the door the gap x 22…30) */
export const CHAMBER = (({ x0, x1, z0, z1, door, doorZ }) => Object.freeze({ x0, x1, z0, z1, door: Object.freeze([...door]), doorZ }))(S5.chambers.find((c) => c.id === 'lepers'));
/** the rock-cut basin: 2 × 3 amot at its bottom, 3 amot deep, a rim of two tefachim over the floor; seven steps down on its east side
 *  (x 14…18); the rod stands in it with its two marks; the inflow notch on its north rim, the overflow outlet on its south rim */
export const MIK = Object.freeze({
  x0: S5.mik.x0, x1: S5.mik.x1, z0: S5.mik.z0, z1: S5.mik.z1, stair: S5.mik.stair, deep: 3, rim: 2 * TEFACH, steps: 7,
  bottom: H120.FLOOR - 3, rimTop: H120.FLOOR + 2 * TEFACH,
  rod: S5.mik.rod,
  inlet: S5.mik.inlet, outlet: S5.mik.outlet,
  pit: S5.mik.pit,   // the plasterers' lime pit (level 3's trap)
  hollows: S5.mik.hollows,
  goal: Object.freeze({ 1: 0.5, 2: 1.5, 3: 3 }),               // the water over the bottom each level fills to (amot)
});
