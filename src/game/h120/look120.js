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

/** the look's far pose (u = 1): horizontal distance and height over the aim, how far the view's aim slides ahead, the lens */
// (UG: the thumb's gain — a quarter of the screen's height is u 0.7, the view over the walls; the play zone, u ≤ 0.45, is a drag of
//  a sixth. PW: the pull-back eased in slowly, so inside the play zone the work stays big enough to play (about half its size at
//  u 0.45). S0/S1: the view's aim slides ahead only past the play zone. U1: the far pose is reached at u = 0.8. H1 70: well over
//  the court's 44-amah south wall, so the Mount and the city beyond show over it, the wall's top a good way under the horizon)
export const LOOK05 = Object.freeze({ UG: 2.8, PW: 2.5, S0: 0.4, S1: 0.35, U1: 0.8, D1: 110, H1: 70, F: 120, FOV1: 58, EL_MAX: 1.45, EL_MIN: 0.06, STEP: 0.05 });

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

const smooth = (u) => { const v = Math.max(0, Math.min(1, +u || 0)); return v * v * (3 - 2 * v); };

export function lookPose(base, u, yaw, lift = 0, K = LOOK05) {
  const [px, py, pz] = base.p, [tx, ty, tz] = base.t;
  const vx = px - tx, vy = py - ty, vz = pz - tz, h0 = Math.hypot(vx, vz) || 1, az = Math.atan2(vz, vx) + (+yaw || 0), e = Math.pow(smooth((+u || 0) / (K.U1 || 1)), K.PW || 1);
  const dH = h0 + (Math.max(h0, K.D1) - h0) * e, hy = vy + (Math.max(vy, K.H1) - vy) * e;
  // (lift > 0 raises the camera toward overhead, lift < 0 lowers it toward the floor — under a gallery seen from its side)
  const el0 = Math.atan2(hy, dH), R = Math.hypot(dH, hy), el = Math.max(K.EL_MIN, Math.min(K.EL_MAX, el0 + (+lift || 0)));
  const room = lift >= 0 ? K.EL_MAX - el0 : el0 - K.EL_MIN, lf = room > 1e-3 ? Math.min(1, Math.abs(+lift || 0) / room) : 1;
  const cx = Math.cos(az), cz = Math.sin(az), ce = Math.cos(el);
  const p = [tx + cx * ce * R, ty + Math.sin(el) * R, tz + cz * ce * R];
  // (the view's aim slides ahead, away from the camera: the work drops into the frame's lower half and the horizon comes in; less
  //  as the sight rule lifts the camera, so the work never leaves the frame)
  const f = K.F * smooth(((+u || 0) - K.S0) / K.S1) * (1 - lf);   // (none inside the play zone, u ≤ S0: the work stays near the middle, playable)
  const t = [tx - cx * f, ty, tz - cz * f];
  const fov0 = Number.isFinite(base.fov) ? base.fov : 40;
  return { p, t, fov: fov0 + (Math.max(fov0, K.FOV1) - fov0) * e, el, d: R, az };
}

/** does the segment p → q cross the box (the slab test; the segment's last `skip` amot before q are not judged) */
function segBox(p, q, b, skip) {
  const L = Math.hypot(q[0] - p[0], q[1] - p[1], q[2] - p[2]); if (L < 1e-6) return false;
  let t0 = 0, t1 = Math.max(0, 1 - skip / L);
  for (let k = 0; k < 3; k++) {
    const d = q[k] - p[k], lo = b[k], hi = b[k + 3];
    if (Math.abs(d) < 1e-9) { if (p[k] < lo || p[k] > hi) return false; continue; }
    let a = (lo - p[k]) / d, c = (hi - p[k]) / d; if (a > c) { const s = a; a = c; c = s; }
    if (a > t0) t0 = a; if (c < t1) t1 = c; if (t0 > t1) return false;
  }
  return true;
}
const inBox = (q, b, m = 0) => q[0] > b[0] - m && q[0] < b[3] + m && q[1] > b[1] - m && q[1] < b[4] + m && q[2] > b[2] - m && q[2] < b[5] + m;
/** a box between p and the aim a (a box that holds the aim, or stands within a reach of it, is the work's own: not judged) */
export function segHits(p, a, boxes = BOXES05) {
  for (const b of boxes) { if (inBox(a, b, 0.8)) continue; if (segBox(p, a, b, 1.5)) return true; }
  return false;
}
/** the camera in a box, or within m amot of it (just behind a wall's face) */
export function camInBox(p, boxes = BOXES05, m = 2) { return boxes.some((b) => inBox(p, b, m)); }

function clearAt(base, u, yaw, lift, boxes, extra, K, camOnly) {
  const a = base.t, a2 = [a[0], a[1] + 1.6, a[2]], q = lookPose(base, u, yaw, lift, K);
  if (q.p[1] < a[1] + 1.5 || camInBox(q.p, boxes)) return false;
  if (camOnly) return true;   // (the walk: the world first — only the camera kept out of the walls; a wall may hide him)
  if (segHits(q.p, a, boxes) || segHits(q.p, a2, boxes)) return false;
  return !(extra && extra(q.p, a));
}
/** the least change of elevation that clears the line at this yaw: up first at each step (over the walls), then down (under a
 *  gallery, from its side); null when none does */
export function sightLift(base, u, yaw, boxes = BOXES05, extra = null, K = LOOK05, camOnly = false) {
  const n = Math.ceil((K.EL_MAX - K.EL_MIN) / K.STEP);
  for (let k = 0; k <= n; k++) for (const s of k ? [1, -1] : [1]) { const lift = +(s * k * K.STEP).toFixed(3); if (clearAt(base, u, yaw, lift, boxes, extra, K, camOnly)) return lift; }
  return null;
}
/** the look as it may be: { lift, dyaw } — the least lift at the asked yaw; where no elevation sees the work (behind a 34-amah wall,
 *  under the gallery's far side) the nearest turn that does (0.1 rad steps either way): the camera never goes behind a wall */
export function sightPose(base, u, yaw, boxes = BOXES05, extra = null, K = LOOK05, camOnly = false) {
  for (let k = 0; k <= 32; k++) for (const s of k ? [1, -1] : [1]) {
    const dy = s * k * 0.1, lift = sightLift(base, u, yaw + dy, boxes, extra, K, camOnly);
    if (lift != null) return { lift, dyaw: +dy.toFixed(2) };
  }
  return { lift: 0, dyaw: -(+yaw || 0) };   // (nothing clear anywhere: the act's own shot)
}
