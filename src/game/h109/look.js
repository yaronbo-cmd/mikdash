/* ── build 117 ── h109/look.js — the play zone of the look-around (ירון 10.11: "האם אפשר להמשיך לשחק גם אם יצאתי קצת החוצה
 * למרחב בזום אאוט? אם אפשר אז תשאיר האופציה הזו, לפחות עד שלב מסוים"). Pure: no three.js, no DOM.
 * u 0..1: how far the camera is pulled back and lowered toward the horizon (director.js camStep); yaw: how far it is turned.
 *   lookZone(u, yaw) → 'play' (the act runs and takes the touches as at u = 0) | 'wait' (the act waits; a touch brings the camera
 *   back) — the overview (the whole Mount from above) begins when u passes 1, see director.js.
 *   LOOK_PLAY = { u, yaw } the zone's edges · WHEEL_STEP the change of u for one notch of the wheel · pinchU(u0, d0, d) the u of a pinch
 */
export const LOOK_PLAY = Object.freeze({ u: 0.45, yaw: 1.0 });
export const WHEEL_STEP = 0.12;
export function lookZone(u, yaw) {
  const a = Math.abs(+yaw || 0), v = +u || 0;
  return v <= LOOK_PLAY.u + 1e-9 && a <= LOOK_PLAY.yaw + 1e-9 ? 'play' : 'wait';
}
/** the u of two fingers that began d0 apart at u0 and are now d apart: closing lifts it, opening brings it down (unclamped: > 1 asks
 *  for the overview) */
export function pinchU(u0, d0, d) { return (+u0 || 0) + (1 - d / Math.max(1, d0)) * 2.2; }
