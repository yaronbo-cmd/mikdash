/* ── build 68 ── crane68.js — the crane station at the court wall (the owner, 1.11: "הגלגלת הפיסית שמורידה אבן על הקיר ומכוונת אותה"; his own
 * proposal: one place and one frame for the lift, the alignment and the course — stones of three real sizes lifted onto the real wall; the
 * reports: "תזוזת האבן… באמצע שומקום"). The rig (a shear-legs on a sled, its boom over the course, the sheave at its end — המחשה) stands at
 * his stretch of the wall; the stones lie north of it where the cart unloaded them. One stone at a time: a tap hooks it (the crew drags it
 * under the hook), his pulls lift it (the pulley's own rules, fam42 createPulley: hand over hand, the catch, the window — the window IS the
 * course's height), a sideways drag moves the rig along the wall on its sled, a let-go over a free place lowers the stone onto the course
 * (the course's own rules, createCourse: the nearest free place, the gap, the joints). Pure: the hang, the alignment, the pile, the cart's way,
 * the tap's pick. Never a Divine Name. ── /build 68 ── */

export const CRANE68 = Object.freeze({
  legs: 1.7, legsZ: -3.4, boom: 3.4, over: 1.5, lift: 0.48, pileZ: -7.5, pileX0: -5.5, pileDx: 3.3, cartX: 11, cartZ: -10.5, cartFrom: 62, cartS: 7, hookT: 0.7, lowerT: 0.55, tapR: 72, sled: 3.9, topUp: 9,
  swingT: 1.4, backS: 5, armS: 2.6, dim: 0.38,   // ── build 70 ── (the swing over the course s; the return's lowering amot/s; the arm's way back rad/s; a stone with no place: its opacity)
});
export const PH68 = Object.freeze(['wait', 'pick', 'hook', 'lift', 'swing', 'align', 'back', 'set']);   // ── build 70 ── (swing: the arm over the course; back: a stone with no place lowered to the pile)

/** the hanging stone's centre y for the pulley's y (0…1.25): on the ground (sy 0) its centre c.lift over it; at the window's foot it hangs
 *  c.over over the course's centre cy (its bottom clear of the course's top — anywhere in the window it clears it); above, higher still */
export function hangY68(sy, gY, cy, win, c = CRANE68) { const lo = win[0] || 0.6; return gY + c.lift + Math.max(0, sy) * ((cy + c.over - gY - c.lift) / lo); }

/** the rig's place along the course after a sideways drag of dxPx (screen px; pxPerUnit px for one course unit), in course units (the
 *  stone's centre), kept inside his stretch [a, b] for a stone of len */
export function alignU68(u, dxPx, pxPerUnit, len, a, b) { const k = Math.abs(pxPerUnit) > 1 ? dxPx / pxPerUnit : 0; const lo = a + len / 2, hi = Math.max(lo, b - len / 2); return Math.max(lo, Math.min(hi, u + k)); }

/** the pile: the stones of the sizes lens (and the corner stones, dir 'a' | 'b') lying north of the rig — offsets (dx, dz) from the course's
 *  origin (its first unit's west end) */
export function pile68(lens, corners, c = CRANE68) {
  const out = []; let i = 0;
  for (const len of lens) out.push({ len, dir: null, dx: c.pileX0 + i++ * c.pileDx, dz: c.pileZ });
  for (const d of corners || []) out.push({ len: 2, dir: d, dx: c.pileX0 + i++ * c.pileDx, dz: c.pileZ });
  return out;
}

/** the cart's way in: from the east along the wall's outside at c.cartS amot/s to its stand (dx from the course's origin), t s after it set out */
export function cartAt68(t, c = CRANE68) { const dx = Math.max(c.cartX, c.cartFrom - c.cartS * Math.max(0, t)); return { dx, stopped: dx <= c.cartX + 1e-9, t: (c.cartFrom - c.cartX) / c.cartS }; }

/** the pile stone nearest a tap on the screen (pts: each stone's screen point or null), within c.tapR px → its index, else −1 */
export function pick68(pts, x, y, c = CRANE68) { let bi = -1, bd = c.tapR; pts.forEach((p, i) => { if (!p) return; const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; bi = i; } }); return bi; }

/** the stone's slide from the pile to under the hook: its place at k (0…1, eased) between (x0, z0) and (x1, z1) */
export function slide68(k, x0, z0, x1, z1) { const e = k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k); return { x: x0 + (x1 - x0) * e, z: z0 + (z1 - z0) * e }; }

// ── build 70 ── the owner's play of build 69 (2.11): "אם שמתי אבן קטנה ואז הרמתי אבן גדולה ואין לה מקום היא נשארת תקועה באוויר על המנוף…
// צריך שלא יתאפשר מלכתחילה להעלות אותה… היא לא יכולה להישאר באוויר"; "האבן מתרוממת בתוך הקיר". The rules: a stone fits the course only
// where a run holds it without leaving a gap too small for any stone (the course's own gap rule); a stone that fits nowhere is not hooked,
// and one that hangs with no place left comes back down to the pile. The arm: it points out (away from the wall) while the stone is
// hooked and lifted outside the wall's face, then swings over the course for the alignment and the lowering (a derrick's swing, המחשה).
/** the runs (as createCourse's runs(): [start, length]) a stone of len fits in: the run holds it, and what stays is nothing or at least minLen */
export function fitRuns68(runs, len, minLen = 2) { return (runs || []).filter(([, rl]) => rl >= len && (rl === len || rl - len >= minLen)); }
/** does the pile stone fit anywhere: a corner stone where the course wants a corner not yet laid; a plain stone in some run */
export function fitsAny68(runs, len, dir, corner) { return dir ? !!(corner && !corner.dir) : fitRuns68(runs, len).length > 0; }
/** the arm's turn at k (0…1, eased) of the swing: from pointing out (π) to over the course (0) */
export function armRot68(k) { const e = k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k); return Math.PI * (1 - e); }
/** the sheave's place in the rig's own frame for the arm's turn rot: z = boom·cos(rot) (out: −boom; over the course: +boom) */
export function sheaveZ68(rot, c = CRANE68) { return c.boom * Math.cos(rot); }
