/* ── build 117 ── h109/look.js — the play zone of the look-around (ירון 10.11: "האם אפשר להמשיך לשחק גם אם יצאתי קצת החוצה
 * למרחב בזום אאוט? אם אפשר אז תשאיר האופציה הזו, לפחות עד שלב מסוים"). Pure: no three.js, no DOM.
 * u 0..1: how far the camera is pulled back and lowered toward the horizon (director.js camStep); yaw: how far it is turned.
 *   lookZone(u, yaw) → 'play' (the act runs and takes the touches as at u = 0) | 'wait' (the act waits; a touch brings the camera
 *   back) — the overview (the whole Mount from above) begins when u passes 1, see director.js.
 *   LOOK_PLAY = { u, yaw } the zone's edges · WHEEL_STEP the change of u for one notch of the wheel · pinchU(u0, d0, d) the u of a pinch
 */
export const LOOK_PLAY = Object.freeze({ u: 0.45, yaw: 1.0 });
export const WHEEL_STEP = 0.12;
export function lookZone(u, yaw, yawMax = LOOK_PLAY.yaw) {
  const a = Math.abs(+yaw || 0), v = +u || 0;
  return v <= LOOK_PLAY.u + 1e-9 && a <= yawMax + 1e-9 ? 'play' : 'wait';
}
/** ── build 132 ── an act's own turn of the look (optional hooks; an act without them looks as before):
 *   act.lookYaw (radians): the play zone's yaw edge in place of LOOK_PLAY.yaw, and the turn's clamp ±max(LOOK_YAW, it)
 *   act.lookEnd(yaw) → a finite number: where the turn settles when the look's finger lifts (u, the lift and zoom-out, is left alone)
 *  lookYawOf(act) · lookClampOf(act) · lookEndOf(act, yaw) → number | null ── /build 132 ── */
const LOOK_YAW = 2.8;   // (not exported: test/h127-snapshot.test.mjs holds look.js's data exports as build 126 had them)
const fin = (v) => typeof v === 'number' && Number.isFinite(v);
export const lookYawOf = (act) => (act && fin(act.lookYaw) && act.lookYaw > 0 ? act.lookYaw : LOOK_PLAY.yaw);
export const lookClampOf = (act) => (act && fin(act.lookYaw) && act.lookYaw > 0 ? Math.max(LOOK_YAW, act.lookYaw) : LOOK_YAW);
export function lookEndOf(act, yaw) {
  if (!act || typeof act.lookEnd !== 'function') return null;
  let v; try { v = act.lookEnd(yaw); } catch (e) { return null; }
  if (!fin(v)) return null; const L = lookClampOf(act); return Math.max(-L, Math.min(L, v));
}
/** the u of two fingers that began d0 apart at u0 and are now d apart: closing lifts it, opening brings it down (unclamped: > 1 asks
 *  for the overview) */
export function pinchU(u0, d0, d) { return (+u0 || 0) + (1 - d / Math.max(1, d0)) * 2.2; }
/** ── h132 ── the act set its own lens while the look's lens was on: the camera's fov is no more the one the look last set (fovSet) —
 *  that lens is the look's base from then on, and when the look ends it stays (the director's lk5Step / lk5Off) ── /h132 ── */
export function actLens(fovSet, now) { return fovSet != null && Number.isFinite(now) && Math.abs(now - fovSet) > 1e-3; }
