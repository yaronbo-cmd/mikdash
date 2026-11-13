/* ── build 124 ── h120/look120.js — the right thumb's look in stage 05's walled court (rule 61: "אגודל ימין מסתכל סביב גם בתוך
 * משחקון: רואים קצת אופק ואיפה אני בעולם"; rule 3: always clear where I am). Pure: no three.js, no DOM.
 *
 * In an open site the director's look (h109/director.js) turns the camera round the work and lowers it toward the horizon. Inside the
 * court of the women (walls 34 amot high on three sides, the chambers 14) that puts the camera behind a wall. Here instead, as u grows,
 * the camera pulls back and RISES over the court, its view tilts up, the lens widens a little: at u = 1 the work stands in the lower
 * half of the frame, the court with its walls and gallery below, the Mount and the city beyond, sky at the top (the horizon about a
 * fifth of the frame from its top), reached at u = 0.8.
 *
 *   lookPose(base, u, yaw, lift) → { p, t, fov, el, d }   base { p: [x,y,z] the act's shot, t: its aim, fov: its lens }; lift (rad):
 *                                                          the extra elevation the sight rule asks (0 … ~1.45 − el)
 *   sightLift(base, u, yaw, boxes, extra) → lift           the least change of elevation, up or down (0.05 rad steps), at which nothing of `boxes` (nor `extra(p,
 *                                                          a)`, the world's own test) stands between the camera and the aim, and the
 *                                                          camera is not in or just behind a wall
 *   sightPose(base, u, yaw, boxes, extra) → { lift, dyaw } the same, turning toward the nearest clear side where no elevation sees it
 *   (…, K, camOnly)                                        the walk's rule: only the camera kept out of the walls (the world first)
 *   segHits(p, a, boxes), camInBox(p, boxes, m)            the two tests
 *   BOXES05                                                the court's walls (their measured tops), the chambers' walls, the gallery
 * Amot throughout: +x east, +z south, +y up.
 */
import { H120, Y, RUNS } from './layout.js';
import { WALLS } from './routes.js';
import { LOOK_K, lookPose as poseK, segHits as segK, camInBox as camK, sightLift as liftK, sightPose as sightK } from '../world/look.js';   // (build 125: the one look module)

/** the look's far pose (u = 1): horizontal distance and height over the aim, how far the view's aim slides ahead, the lens */
// (UG: the thumb's gain — a quarter of the screen's height is u 0.7, the view over the walls; the play zone, u ≤ 0.45, is a drag of
//  a sixth. PW: the pull-back eased in slowly, so inside the play zone the work stays big enough to play (about half its size at
//  u 0.45). S0/S1: the view's aim slides ahead only past the play zone. U1: the far pose is reached at u = 0.8. H1 70: well over
//  the court's 44-amah south wall, so the Mount and the city beyond show over it, the wall's top a good way under the horizon)
export const LOOK05 = LOOK_K;   // (build 125: the shape's constants are world/look.js's — the same numbers)

// the tops of the court's walls as built in the world (stage-wall 40.3 and 44.3 on the north and south, the east wall 22.3, the gate
// house 38.3, the chambers 20.4; the west side and the Nikanor steps are open: the world's own test covers what stands there)
const TOPS = [40.3, 44.3, 6, 22.3, 38.3, 38.3, 6, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4];
/** [x0, y0, z0, x1, y1, z1] boxes */
export const BOXES05 = Object.freeze([
  ...WALLS.map((r, i) => [r[0], H120.FLOOR - 1, r[1], r[2], TOPS[i] != null ? TOPS[i] : 40, r[3]]).filter((b) => b[4] > H120.FLOOR + 0.5),
  // the gallery: its floor, joists and beam, and the railing on its edge (from the wall face to the column line)
  ...RUNS.map((R) => {
    const e = R.line + R.dir * 0.4, w0 = Math.min(R.wall, e), w1 = Math.max(R.wall, e);
    return R.axis === 'x' ? [R.a0, Y.COL_TOP, w0, R.a1, Y.GFLOOR + H120.RAIL, w1] : [w0, Y.COL_TOP, R.a0, w1, Y.GFLOOR + H120.RAIL, R.a1];
  }),
].map((b) => Object.freeze(b)));


// (build 125: the shape and the sight rule are world/look.js's; here stage 05's boxes and constants by default, as in build 124)
export const lookPose = (base, u, yaw, lift = 0, K = LOOK05) => poseK(base, u, yaw, lift, K);
export const segHits = (p, a, boxes = BOXES05) => segK(p, a, boxes);
export const camInBox = (p, boxes = BOXES05, m = 2) => camK(p, boxes, m);
export const sightLift = (base, u, yaw, boxes = BOXES05, extra = null, K = LOOK05, camOnly = false) => liftK(base, u, yaw, boxes, extra, K, camOnly);
export const sightPose = (base, u, yaw, boxes = BOXES05, extra = null, K = LOOK05, camOnly = false) => sightK(base, u, yaw, boxes, extra, K, camOnly);
