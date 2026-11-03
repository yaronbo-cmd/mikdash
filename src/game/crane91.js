/* ── build 91 ── crane91.js — stage 01's crane made like the crane the world's crews build the Mount with (stages.js: the treadwheel
 * crane), at his stretch of the Mount's east wall (the owner, 3.11 21:09, a picture of the world's crane: "המנוף הזה ברקע עובד יפה. צריך
 * שגם המנוף של המשחק ייראה ויעבוד אותו דבר"; "האבן אמורה להיות מונפת מאחורי ההר מלמטה למעלה"; "האבן אמורה להתחבר לקיר שנבנה"). The
 * crane stands on the Mount's floor inside the wall, its pole leaning out over the wall; the corner stone lies outside, on the slope
 * below; his walk in the great wheel winds the rope: the stone comes up from below, the pole swings it in over the wall, and over its
 * gap in the wall's top course he lets go. Pure: the places, the pole's angle for a reach, the stone's way by the lift's height, the
 * walk's pull toward an open work. The method is המחשה (Vitruvius 10.2). Never a Divine Name. ── /build 91 ── */

/** z: the stretch's middle (the stone's place along the wall); slotX: the wall's face course's middle (outer face x 277, stones 2.4 deep);
 *  floor: the Mount's floor inside here (−48.9 before the fill); bx: the crane's base on the floor, its pole leaning east (+x); H: the
 *  pole; pickX: where the stone lies outside, on the slope; clear: the stone's middle over the wall's top while it swings in; rise: the
 *  lift's height by which it is up (then the swing); trench: the wall's foot here; n: its courses under his; up: his course's foot over the floor
 *  (the wall already stands higher than the floor it will hold the fill over: from outside, below, the stone comes up its face) */
export const CRANE91 = Object.freeze({
  z: 350, slotX: 275.8, backX: 273.4, floor: -48.9, bx: 262.8, H: 28, pickX: 282, clear: 2.4, rise: 0.3,
  wheelR: 3.6, wheelW: 2, axleY: 4.0, back: 1.6, pivot: 1.2, pivotY: 0.6, tread: 0.42,
  trench: -60, n: 8, top: 1.8, up: 5.4, len: 4.2, z0: 318, z1: 382, step: 2.6,
  magnet: 14, cone: 1.2,
});

/** the pole's tip's reach out from the base for its angle a (0 upright, + leaning out) */
/** the pole's height over the floor where it passes over x (for a): it must clear the wall's top (the pole leans out over it) */
export const poleAt91 = (x, a, c = CRANE91) => c.pivotY + (x - c.bx - c.pivot) / Math.tan(a);
export const reach91 = (a, c = CRANE91) => c.pivot + c.H * Math.sin(a);
/** the angle that puts the tip over x (the base at c.bx, leaning +x) */
export function angleFor91(x, c = CRANE91) { const k = (x - c.bx - c.pivot) / c.H; return Math.asin(Math.max(-0.9, Math.min(0.95, k))); }
/** the tip's height over the base's foot for a */
export const tipH91 = (a, c = CRANE91) => c.pivotY + c.H * Math.cos(a);
/** his course's foot and the wall's top */
export const base91 = (c = CRANE91) => c.floor + c.up;
export const top91 = (c = CRANE91) => c.floor + c.up + c.top;

/** the stone's way by the lift's height y (0…1.25; win: the lift's window, whose middle is over its gap): up from where it lies (pickY) to
 *  `topY` by c.rise, the pole leaning out; then the pole swings in, the stone at topY — over the gap at the window's middle, on past it
 *  (inside, over the floor) above the window → { a, x, hy, over } (over: in the window — the stone over its gap) */
export function path91(y, win, pickY, topY, c = CRANE91) {
  const aP = angleFor91(c.pickX, c), aW = angleFor91(c.slotX, c), wc = (win[0] + win[1]) / 2, y1 = Math.min(c.rise, wc - 0.05);
  const v = Math.max(0, Math.min(1.25, +y || 0));
  let a = aP, hy = topY;
  if (v <= y1) { const k = v / y1, e = k * k * (3 - 2 * k); hy = pickY + (topY - pickY) * e; }
  else a = Math.max(aW - 0.35, aP + ((aW - aP) * (v - y1)) / (wc - y1));
  const x = c.bx + reach91(a, c);
  return { a, x, hy, over: v >= win[0] && v <= win[1] };
}

/** the courses of his stretch of the wall (the crews' — he sets one stone in its top course): each [x, y, z, len, h, d, face] — the face
 *  row (outer, 2.4 deep) and the backing row; each course a little shorter than the one under it (the stretch rising); the top course's
 *  face row leaves his gap (c.len) at c.z */
export function wall91(c = CRANE91) {
  const out = [], base = c.floor + c.up, h = (base - c.trench) / c.n, lens = [3.6, 4.4, 3.2, 4.0, 4.8];
  for (let k = 0; k <= c.n; k++) {
    const y0 = k < c.n ? c.trench + k * h : base, hh = k < c.n ? h : c.top, za = c.z0 + k * c.step, zb = c.z1 - k * c.step;
    for (const [x, face] of [[c.slotX, 1], [c.backX, 0]]) {
      const runs = k === c.n && face ? [[za, c.z - c.len / 2], [c.z + c.len / 2, zb]] : [[za, zb]];
      for (const [r0, r1] of runs) {
        let z = r0, i = (k * 3 + (face ? 0 : 2)) % lens.length;
        while (r1 - z > 0.6) { let L = lens[i++ % lens.length]; if (r1 - z - L < 1.4) L = r1 - z; out.push([x, y0 + hh / 2, z + L / 2, L - 0.04, hh - 0.04, 2.36, face]); z += L; }
      }
    }
  }
  return out;
}

/** the walk's pull (the owner, 3.11 21:09: "ההליכה של השחקן לא מגנטית… צריך להחזיר"): a way within c.cone of the line to the nearest
 *  open work within c.magnet amot is bent onto it — fully at the work, not at all at the edge; the works [{ x, z }] → { x, z } unit */
export function pull91(d, h, works, c = CRANE91) {
  if (!d || !h || !works || !works.length) return d;
  let best = null, bd = c.magnet;
  for (const w of works) { if (!w) continue; const L = Math.hypot(w.x - h.x, w.z - h.z); if (L < bd && L > 1e-3) { const ux = (w.x - h.x) / L, uz = (w.z - h.z) / L; if (Math.acos(Math.max(-1, Math.min(1, d.x * ux + d.z * uz))) <= c.cone) { bd = L; best = { ux, uz, L }; } } }
  if (!best) return d;
  const m = Math.min(1, 1.15 - best.L / c.magnet), x = d.x * (1 - m) + best.ux * m, z = d.z * (1 - m) + best.uz * m, n = Math.hypot(x, z) || 1;
  return { x: x / n, z: z / n };
}
