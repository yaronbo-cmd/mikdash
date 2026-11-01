/* ── build 64 ── cam64.js — the camera of the first stages, back in the player's right thumb (the owner, 1.11: "המצלמה שם יותר טובה כי היא
 * פותחת למעלה ולמטה הכול, אגודל ימין"; the owner's reports of 30.10 and 1.11: "המצלמה קופצת אוטומטית מזווית לזווית… אני השחקן צריך לבחור";
 * "הכהן נעלם, המצלמה יצאה החוצה"). An orbit about the look point — bearing `az`, elevation `el` (0 = the horizon, π/2 = straight down),
 * distance `d` — that is the player's: a drag on the right half turns it (dx) and tilts it (dy: up = toward the horizon, down = toward the
 * top view, the whole range in `tiltPx` px); a pinch brings it nearer or farther. It stays where he leaves it, through walks, the site and
 * the works: during a work the act's own frame is the start, and two fingers on the thing turn, tilt and zoom it the same way (one finger
 * stays the act's). Pure: har42.js reads the fingers and sets the camera from the orbit each frame; the floor (main.js clampCam: the
 * ground under the camera) and the pull-in (`pull64`: nearer along the same line until the look point is seen) keep the figure in the
 * frame. Never a Divine Name. ── /build 64 ── */

export const CAM64 = Object.freeze({ elMin: 0.12, elMax: 1.42, dMin: 9, dMax: 90, turnPx: 520, tiltPx: 340, ease: 7, pull: 0.86, pullSteps: 8, twoPx: 6 });

/** an orbit: the bearing (rad, +x east → +z south), the elevation (rad over the horizon) and the distance (amot), all kept in range */
export function orbit64(az, el, d, c = CAM64) {
  return { az: wrap64(az), el: Math.max(c.elMin, Math.min(c.elMax, el)), d: Math.max(c.dMin, Math.min(c.dMax, d)) };
}
export function wrap64(a) { a = a % (2 * Math.PI); if (a > Math.PI) a -= 2 * Math.PI; if (a < -Math.PI) a += 2 * Math.PI; return a; }

/** the orbit after a drag of (dx, dy) px (screen y down): the world follows the finger — right turns the camera round to the left of
 *  the look point (az up), up tilts toward the horizon (el down), down toward the top view */
export function drag64(o, dx, dy, c = CAM64) {
  return orbit64(o.az + (dx / c.turnPx) * Math.PI, o.el + (dy / c.tiltPx) * (c.elMax - c.elMin), o.d, c);
}

/** the orbit after a pinch: `ratio` = the fingers' distance now over the distance at the start (apart → nearer) */
export function pinch64(o, ratio, c = CAM64) { return orbit64(o.az, o.el, o.d / Math.max(0.2, Math.min(5, ratio || 1)), c); }

/** the view of an orbit about the look point t ([x, y, z]) → { p, t } */
export function view64(o, t) {
  const ce = Math.cos(o.el);
  return { p: [t[0] + Math.cos(o.az) * ce * o.d, t[1] + Math.sin(o.el) * o.d, t[2] + Math.sin(o.az) * ce * o.d], t: [t[0], t[1], t[2]] };
}

/** the orbit a view { p, t } stands in (an act's own frame taken over by the thumb) */
export function fromView64(v, c = CAM64) {
  const dx = v.p[0] - v.t[0], dy = v.p[1] - v.t[1], dz = v.p[2] - v.t[2], L = Math.hypot(dx, dz), d = Math.hypot(dx, dy, dz) || 1;
  return orbit64(Math.atan2(dz, dx), Math.atan2(dy, L), d, c);
}

/** the orbit eased toward another over dt s (the shortest way round) */
export function ease64(o, to, dt, c = CAM64) {
  const k = Math.min(1, dt * c.ease), da = wrap64(to.az - o.az);
  return orbit64(o.az + da * k, o.el + (to.el - o.el) * k, o.d + (to.d - o.d) * k, c);
}

/** the pull-in: the farthest distance ≤ o.d, in steps of c.pull, whose camera sees the look point — `blocked(p, t)` says when the
 *  line from the camera p to t is cut (a wall, the rough Mount, the ground) → the distance to use (o.d when the line is clear) */
export function pull64(o, t, blocked, c = CAM64) {
  let d = o.d;
  for (let i = 0; i <= c.pullSteps; i++) {
    const v = view64({ az: o.az, el: o.el, d }, t);
    if (!blocked(v.p, v.t)) return d;
    d = Math.max(c.dMin, d * c.pull); if (d <= c.dMin) break;
  }
  return c.dMin;   // (never clear: as near as it goes)
}

/** two fingers → their middle and the distance between them */
export function two64(a, b) { return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, L: Math.hypot(a.x - b.x, a.y - b.y) || 1 }; }
