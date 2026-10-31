/* ── build 61 ── walk61.js — the free walk and the lifted look of Phase A (docs/specs/shlav-alef-olam-he.md §9; the owner, 30.10: "שיהיה
 * הרגשה של קצת חופשיות… שלא יתברבר עם הסטיק מצד אחד ומצד שני שכן ירגיש תחושת אוטנומיות בתנועה, לא סתם לחיצה על המסך"; "אם השחקן מושך יד
 * ימין על המסך לכיוון מעלה, המצלמה תעלה קצת ותראה את האופק יותר בבירור"). Pure: har42.js reads the finger and drives the hero with it.
 *   left half  — a finger put down anywhere is the centre of a stick no one sees; the drag from it walks him that way, faster the longer
 *                it is (dead zone `dead`, full at `R` px). Near an open work (`magnet` amot) a drag roughly toward it (within `cone`) is
 *                bent onto it — the magnet; the walls he slides along are stages.js's own (twinStep)
 *   a tap      — anywhere (≤ `tapMs`, ≤ `tapPx`): he walks to the work by himself (the guided walk of build 39, now a shortcut)
 *   held still — ≥ `holdMs` without a drag past the dead zone: the guided walk while held (build 39's, kept for the hands that know it)
 *   right half — a drag up lifts the look (0…1, `liftPx` px for the whole lift), down brings it back; it stays until a work begins
 * Never a Divine Name. ── /build 61 ── */

export const WALK61 = Object.freeze({ dead: 12, R: 70, tapMs: 260, tapPx: 10, holdMs: 380, magnet: 6, cone: 1.05, liftPx: 160, rise: 9, level: 0.8 });

/** which half a finger came down on: 'L' (the walk) or 'R' (the look) */
export function side61(x, w) { return x < w / 2 ? 'L' : 'R'; }

/** the drag (dx, dy px, screen y down) → { sx, sy, k }: the unit direction on the screen (sx right, sy up) and its strength 0…1 past the
 *  dead zone; null inside it */
export function stick61(dx, dy, c = WALK61) {
  const L = Math.hypot(dx, dy); if (!(L > c.dead)) return null;
  const k = Math.min(1, (L - c.dead) / Math.max(1, c.R - c.dead));
  return { sx: dx / L, sy: -dy / L, k };
}

/** the screen's direction on the ground, from the camera's look (p → t): up the screen = the look's way on the ground, right = its right
 *  (+x east, +z south, +y up: right of a look f is (−f.z, f.x)) → { x, z } unit, or null when the look is straight down */
export function toWorld61(s, p, t) {
  if (!s) return null;
  let fx = t[0] - p[0], fz = t[2] - p[2]; const Lf = Math.hypot(fx, fz); if (Lf < 1e-6) return null; fx /= Lf; fz /= Lf;
  const rx = -fz, rz = fx, x = fx * s.sy + rx * s.sx, z = fz * s.sy + rz * s.sx, L = Math.hypot(x, z) || 1;
  return { x: x / L, z: z / L };
}

/** the magnet: within c.magnet amot of the work, a way within c.cone (rad) of the line to it is bent onto it (fully at the work, not at all
 *  at the magnet's edge) → { x, z } unit (the same way when out of reach) */
export function magnet61(d, h, w, c = WALK61) {
  if (!d || !w) return d;
  const vx = w.x - h.x, vz = w.z - h.z, L = Math.hypot(vx, vz); if (!(L > 1e-3) || L > c.magnet) return d;
  const ux = vx / L, uz = vz / L, a = Math.acos(Math.max(-1, Math.min(1, d.x * ux + d.z * uz))); if (a > c.cone) return d;
  const m = 1 - L / c.magnet, x = d.x * (1 - m) + ux * m, z = d.z * (1 - m) + uz * m, n = Math.hypot(x, z) || 1;
  return { x: x / n, z: z / n };
}

/** what a finger that lifted was: 'tap' (short and still), 'drag' or 'hold' */
export function kind61(ms, px, c = WALK61) { return px <= c.tapPx && ms <= c.tapMs ? 'tap' : px <= c.dead ? 'hold' : 'drag'; }

/** the look's lift after a drag of dy px on the right half (screen y down: up lifts) from k0 */
export function lift61(k0, dy, c = WALK61) { return Math.max(0, Math.min(1, k0 - dy / c.liftPx)); }

/** a view { p, t } lifted by k: the camera `rise` amot higher, its look brought toward level (`level` of the drop from it at k = 1) — the
 *  horizon in the frame; k 0 → the same view */
export function liftView61(v, k, c = WALK61) {
  if (!v || !(k > 0)) return v;
  const p = [v.p[0], v.p[1] + c.rise * k, v.p[2]], ty = v.t[1] + (p[1] - v.t[1]) * c.level * k;
  return { p, t: [v.t[0], ty, v.t[2]] };
}
