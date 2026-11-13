/* ── build 125 ── world/look.js — the right thumb's look shape over a walled site, one module for every stage (rule 66; build 124's
 * h120/look120.js made general: stage 05 keeps its own boxes and constants there, the other stages give theirs here). Pure: no
 * three.js, no DOM.
 *
 * As u grows the camera pulls back and RISES over the site, its view tilts up, the lens widens a little: the work low in the frame, the
 * site, the Mount and the city beyond, sky at the top. A sight rule (the site's boxes, and in an act the world's own test) lifts it,
 * or turns it to the nearest clear side, so no wall stands between the camera and the work; in the walk only the camera is kept out
 * of the walls (the world first, the horizon always in the frame).
 *
 *   LOOK_K                                                 the shape's constants (build 124's: UG the thumb's gain, a quarter of the
 *                                                          screen's height = u 0.7)
 *   lookPose(base, u, yaw, lift, K) → { p, t, fov, el, d, az }
 *   sightLift / sightPose(base, u, yaw, boxes, extra, K, camOnly), segHits(p, a, boxes), camInBox(p, boxes, m)
 *   makeLook({ boxes, K, act, walk }) → the pack's `look` option (director.js): { pose, sightPose, walk, act, ug, boxes }; act: false
 *                                                          keeps the director's own act look (an open site) — the thumb's gain and
 *                                                          the walk's look still the shape's
 *   ringBoxes(side, T, top, bottom)                        the Azarah's ring as four boxes from the address book's sides (BOOK.s02)
 * Amot throughout: +x east, +z south, +y up.
 */
export const LOOK_K = Object.freeze({ UG: 2.8, PW: 2.5, S0: 0.4, S1: 0.35, U1: 0.8, D1: 110, H1: 70, F: 120, FOV1: 58, EL_MAX: 1.45, EL_MIN: 0.06, STEP: 0.05 });

const smooth = (u) => { const v = Math.max(0, Math.min(1, +u || 0)); return v * v * (3 - 2 * v); };

export function lookPose(base, u, yaw, lift = 0, K = LOOK_K) {
  const [px, py, pz] = base.p, [tx, ty, tz] = base.t;
  const vx = px - tx, vy = py - ty, vz = pz - tz, h0 = Math.hypot(vx, vz) || 1, az = Math.atan2(vz, vx) + (+yaw || 0), e = Math.pow(smooth((+u || 0) / (K.U1 || 1)), K.PW || 1);
  const dH = h0 + (Math.max(h0, K.D1) - h0) * e, hy = vy + (Math.max(vy, K.H1) - vy) * e;
  // (build 125, K.NEAR: a close act's play zone — up to u = K.KEEP_U0 the camera only backs away along the act's own line of sight,
  //  at its own elevation and lens, never lower nor into what stands round the work, to (1 + NEAR) times its distance; then it eases
  //  into the far shape by K.KEEP_U1. Without K.NEAR, build 124's shape as it was)
  let elS = Math.atan2(hy, dH), RS = Math.hypot(dH, hy), m = 1;
  if (K.NEAR != null) {
    const v = +u || 0, R0 = Math.hypot(h0, vy), el00 = Math.atan2(vy, h0), Rn = R0 * (1 + K.NEAR * Math.min(1, v / K.KEEP_U0));
    m = smooth((v - K.KEEP_U0) / (K.KEEP_U1 - K.KEEP_U0));
    elS = el00 + (elS - el00) * m; RS = Rn + (Math.max(Rn, RS) - Rn) * m;
  }
  // (lift > 0 raises the camera toward overhead, lift < 0 lowers it toward the floor — under a gallery seen from its side)
  const el0 = elS, R = RS, el = Math.max(K.EL_MIN, Math.min(K.EL_MAX, el0 + (+lift || 0)));
  const room = lift >= 0 ? K.EL_MAX - el0 : el0 - K.EL_MIN, lf = room > 1e-3 ? Math.min(1, Math.abs(+lift || 0) / room) : 1;
  const cx = Math.cos(az), cz = Math.sin(az), ce = Math.cos(el);
  const p = [tx + cx * ce * R, ty + Math.sin(el) * R, tz + cz * ce * R];
  // (the view's aim slides ahead, away from the camera: the work drops into the frame's lower half and the horizon comes in; less
  //  as the sight rule lifts the camera, so the work never leaves the frame)
  const f = K.F * smooth(((+u || 0) - K.S0) / K.S1) * (1 - lf);   // (none inside the play zone, u ≤ S0: the work stays near the middle, playable)
  const t = [tx - cx * f, ty, tz - cz * f];
  const fov0 = Number.isFinite(base.fov) ? base.fov : 40;
  return { p, t, fov: fov0 + (Math.max(fov0, K.FOV1) - fov0) * e * m, el, d: R, az };
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
export function segHits(p, a, boxes = []) {
  for (const b of boxes) { if (inBox(a, b, 0.8)) continue; if (segBox(p, a, b, 1.5)) return true; }
  return false;
}
/** the camera in a box, or within m amot of it (just behind a wall's face) */
export function camInBox(p, boxes = [], m = 2) { return boxes.some((b) => inBox(p, b, m)); }

/** the horizon's place in the frame (a fraction from the top) for a pose { p, t, fov } */
export function horizonOf(q) { const pitch = Math.atan2(q.p[1] - q.t[1], Math.hypot(q.t[0] - q.p[0], q.t[2] - q.p[2])); return 0.5 - Math.tan(pitch) / (2 * Math.tan((q.fov * Math.PI) / 360)); }
/** the ring sites' constants (stages 02–04): build 124's shape, the horizon kept at least 5 % into the frame */
export const LOOK_RING_K = Object.freeze({ ...LOOK_K, HZ: 0.05, HZ_U: 0.6, NEAR: 0.8, KEEP_U0: 0.45, KEEP_U1: 0.75, S0: 0.45, S1: 0.3 });
/** the open hill's (stage 01): the same, no walls — the world's own test (rocks, the city) and the horizon rule */
export const LOOK_OPEN_K = LOOK_RING_K;
function clearAt(base, u, yaw, lift, boxes, extra, K, camOnly) {
  const a = base.t, a2 = [a[0], a[1] + 1.6, a[2]], q = lookPose(base, u, yaw, lift, K);
  if (q.p[1] < a[1] + 1.5 || camInBox(q.p, boxes)) return false;
  // (build 125: K.HZ — a site whose look must keep the horizon in the frame: no lift so steep that the frame is ground only; a turn
  //  toward a clear side instead. Stage 05's K has none: its rule as in build 124)
  if (K.HZ && (+u || 0) >= (K.HZ_U != null ? K.HZ_U : 0.6) && horizonOf(q) < K.HZ) return false;   // (the far look only: inside the play zone the act's own frame)
  if (camOnly) return true;   // (the walk: the world first — only the camera kept out of the walls; a wall may hide him)
  if (segHits(q.p, a, boxes) || segHits(q.p, a2, boxes)) return false;
  return !(extra && extra(q.p, a));
}
/** the least change of elevation that clears the line at this yaw: up first at each step (over the walls), then down (under a
 *  gallery, from its side); null when none does */
export function sightLift(base, u, yaw, boxes = [], extra = null, K = LOOK_K, camOnly = false) {
  const n = Math.ceil((K.EL_MAX - K.EL_MIN) / K.STEP);
  for (let k = 0; k <= n; k++) for (const s of k ? [1, -1] : [1]) { const lift = +(s * k * K.STEP).toFixed(3); if (clearAt(base, u, yaw, lift, boxes, extra, K, camOnly)) return lift; }
  return null;
}
/** the look as it may be: { lift, dyaw } — the least lift at the asked yaw; where no elevation sees the work (behind a 34-amah wall,
 *  under the gallery's far side) the nearest turn that does (0.1 rad steps either way): the camera never goes behind a wall */
export function sightPose(base, u, yaw, boxes = [], extra = null, K = LOOK_K, camOnly = false) {
  if (K.NEAR != null && (+u || 0) <= K.KEEP_U0) return { lift: 0, dyaw: 0 };   // (build 125: the play zone of a close act is its own line of sight backed away: the act's frame, nothing new in it — no lift, no turn)
  for (let k = 0; k <= 32; k++) for (const s of k ? [1, -1] : [1]) {
    const dy = s * k * 0.1, lift = sightLift(base, u, yaw + dy, boxes, extra, K, camOnly);
    if (lift != null) return { lift, dyaw: +dy.toFixed(2) };
  }
  return { lift: 0, dyaw: -(+yaw || 0) };   // (nothing clear anywhere: the act's own shot)
}

/** the pack's look option: the shape with the site's boxes (the director's LK5 in an act, WL in the walk) */
export function makeLook({ boxes = [], K = LOOK_K, act = true, walk = true } = {}) {
  const B = Object.freeze(boxes.map((b) => Object.freeze([...b])));
  return Object.freeze({
    pose: (base, u, yaw, lift = 0) => lookPose(base, u, yaw, lift, K),
    sightPose: (base, u, yaw, boxes2 = B, extra = null, K2 = K, camOnly = false) => sightPose(base, u, yaw, boxes2 || B, extra, K2 || K, camOnly),
    walk: !!walk, act: !!act, ug: K.UG, boxes: B, K,
  });
}
/** the ring of the Azarah's wall as four boxes: side { N: { c }, S: { c }, W: { c }, E: { c } } (the wall's line), T its thickness,
 *  from bottom to top (amot) */
export function ringBoxes(side, T, top, bottom = -40) {
  const h = T / 2, x0 = side.W.c, x1 = side.E.c, z0 = side.N.c, z1 = side.S.c;
  return [[x0 - h, bottom, z0 - h, x1 + h, top, z0 + h], [x0 - h, bottom, z1 - h, x1 + h, top, z1 + h], [x0 - h, bottom, z0 - h, x0 + h, top, z1 + h], [x1 - h, bottom, z0 - h, x1 + h, top, z1 + h]];
}
