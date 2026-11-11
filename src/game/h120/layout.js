/* ── build 120 ── h120/layout.js — the one geometry source of stage 05's gallery and basin (pure: no three.js, no DOM). The stage's
 * model (h120/model.js), its world (h120/world.js) and the finished model of the House (src/temple.js, its `h120` block) all read their
 * numbers from here, so the gallery the player built and the House's own gallery are one design (brief §1, §9).
 *
 * Amot throughout: +x east, +z south, +y up; an amah = 6 tefachim = 24 fingers. The court of the women: x 6…141, z −67.5…67.5, floor
 * y 6 (Middot 2:5). Every size of the gallery is illustration (not in the sources).
 */

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
export const COLS = Object.freeze({
  S1: Object.freeze({ id: 'S1', x: 57, z: 62.5, side: 'S', axis: 'x' }),
  S2: Object.freeze({ id: 'S2', x: 68, z: 62.5, side: 'S', axis: 'x' }),
  S3: Object.freeze({ id: 'S3', x: 79, z: 62.5, side: 'S', axis: 'x' }),
  S4: Object.freeze({ id: 'S4', x: 90, z: 62.5, side: 'S', axis: 'x' }),
  N1: Object.freeze({ id: 'N1', x: 57, z: -62.5, side: 'N', axis: 'x' }),
  N2: Object.freeze({ id: 'N2', x: 68, z: -62.5, side: 'N', axis: 'x' }),
  N3: Object.freeze({ id: 'N3', x: 79, z: -62.5, side: 'N', axis: 'x' }),
  N4: Object.freeze({ id: 'N4', x: 90, z: -62.5, side: 'N', axis: 'x' }),
  EN: Object.freeze({ id: 'EN', x: 136, z: -16.25, side: 'E', axis: 'z' }),
  ES: Object.freeze({ id: 'ES', x: 136, z: 16.25, side: 'E', axis: 'z' }),
});
export const COL_IDS = Object.freeze(Object.keys(COLS));

/** the fourteen main beams: a, b the supports (a column id, or null: a corbel in a wall), pa, pb their points on the column line */
const beam = (id, a, b, pa, pb) => Object.freeze({ id, a, b, pa: Object.freeze(pa), pb: Object.freeze(pb), axis: pa[0] === pb[0] ? 'z' : 'x', len: Math.hypot(pb[0] - pa[0], pb[1] - pa[1]) });
export const BEAMS = Object.freeze([
  beam('SB0', null, 'S1', [46, 62.5], [57, 62.5]), beam('SB1', 'S1', 'S2', [57, 62.5], [68, 62.5]), beam('SB2', 'S2', 'S3', [68, 62.5], [79, 62.5]),
  beam('SB3', 'S3', 'S4', [79, 62.5], [90, 62.5]), beam('SB4', 'S4', null, [90, 62.5], [101, 62.5]),
  beam('NB0', null, 'N1', [46, -62.5], [57, -62.5]), beam('NB1', 'N1', 'N2', [57, -62.5], [68, -62.5]), beam('NB2', 'N2', 'N3', [68, -62.5], [79, -62.5]),
  beam('NB3', 'N3', 'N4', [79, -62.5], [90, -62.5]), beam('NB4', 'N4', null, [90, -62.5], [101, -62.5]),
  beam('ENB0', null, 'EN', [136, -27.5], [136, -16.25]), beam('ENB1', 'EN', null, [136, -16.25], [136, -13]),
  beam('ESB0', null, 'ES', [136, 27.5], [136, 16.25]), beam('ESB1', 'ES', null, [136, 16.25], [136, 13]),
]);
export const BEAM_OF = Object.freeze(Object.fromEntries(BEAMS.map((b) => [b.id, b])));

/** the gallery's three runs: the wall face it hangs from, the column line, its extent along the wall; dir: from the wall toward the court */
export const RUNS = Object.freeze([
  Object.freeze({ side: 'S', axis: 'x', wall: 67.5, line: 62.5, a0: 46, a1: 101, dir: -1 }),
  Object.freeze({ side: 'N', axis: 'x', wall: -67.5, line: -62.5, a0: 46, a1: 101, dir: 1 }),
  Object.freeze({ side: 'EN', axis: 'z', wall: 141, line: 136, a0: -27.5, a1: -13, dir: -1 }),
  Object.freeze({ side: 'ES', axis: 'z', wall: 141, line: 136, a0: 13, a1: 27.5, dir: -1 }),
]);
/** the joists of a run: their positions along it (every JOIST_GAP from its start, the ends inside) */
export function joistsOf(run) { const L = []; const n = Math.max(1, Math.round((run.a1 - run.a0) / H120.JOIST_GAP)); for (let i = 0; i <= n; i++) L.push(run.a0 + 0.3 + ((run.a1 - run.a0 - 0.6) * i) / n); return L; }
/** the ladders up to the gallery (at the chambers' ends of each run): [x, z, facing x, facing z] */
export const LADDERS = Object.freeze([[47.4, 60.2, 47.4, 64], [99.6, 60.2, 99.6, 64], [47.4, -60.2, 47.4, -64], [99.6, -60.2, 99.6, -64], [133.8, -26, 137, -26], [133.8, 26, 137, 26]]);

/* ───────── the mikveh in the lepers' chamber (brief §1, §7; grid יא־6) ───────── */
/** the lepers' chamber's inside: x 6…44 (its east wall 44…46), z −67.5…−29.5 (its south wall −29.5…−27.5, the door the gap x 22…30) */
export const CHAMBER = Object.freeze({ x0: 6, x1: 44, z0: -67.5, z1: -29.5, door: Object.freeze([22, 30]), doorZ: -29.5 });
/** the rock-cut basin: 2 × 3 amot at its bottom, 3 amot deep, a rim of two tefachim over the floor; seven steps down on its east side
 *  (x 14…18); the rod stands in it with its two marks; the inflow notch on its north rim, the overflow outlet on its south rim */
export const MIK = Object.freeze({
  x0: 12, x1: 14, z0: -42, z1: -39, stair: 18, deep: 3, rim: 2 * TEFACH, steps: 7,
  bottom: H120.FLOOR - 3, rimTop: H120.FLOOR + 2 * TEFACH,
  rod: Object.freeze([12.35, -40.5]),
  inlet: Object.freeze([13, -42.25]), outlet: Object.freeze([13.4, -38.75]),
  pit: Object.freeze({ x0: 19.5, x1: 23.5, z0: -36.5, z1: -32.5 }),   // the plasterers' lime pit (level 3's trap)
  hollows: Object.freeze({ 1: Object.freeze([13, -52.5]), 2: Object.freeze([36, -51.5]), 3: Object.freeze([8.6, -56.6]) }),
  goal: Object.freeze({ 1: 0.5, 2: 1.5, 3: 3 }),               // the water over the bottom each level fills to (amot)
});
