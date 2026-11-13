/* ── build 125 ── h109/grips.js — the act's own grips on the screen (rule 66: "להרים ביד ימין בקלות את המצלמה"). The director asks an
 * act's wants(p) only of a touch on the right half of the screen; an act says yes only when the touch starts on or near one of its own
 * grips (the thing the hand really holds: the stone, the lever's end, the frame, the rope's end, the leaf, the key), so a drag anywhere
 * else on the right half is the right thumb's look. The radii are of the screen, never of one resolution (build 124's: about 90 px on a
 * 600 px high screen round a small grip, a third of the height round a large moving object).
 *
 *   gripR() · bigR()                       the two radii (px)
 *   scrOf(X, q)                             a world point {x, y, z} | [x, y, z] → { x, y, on }
 *   nearPts(X, p, pts, R)                   p within R of any of the world points on the screen
 *   nearSeg(X, p, a, b, R)                  p within R of the screen segment between two world points
 *   hitAny(X, p, objs)                      the touch's ray meets one of the meshes (or groups)
 *   nearObjs(X, p, objs, R)                 hitAny, or within R of one of their middles (centreOf)
 */
export const gripR = () => Math.max(44, 0.15 * (globalThis.innerHeight || 600));
export const bigR = () => 0.32 * (globalThis.innerHeight || 600);
const pt = (q) => (Array.isArray(q) ? { x: q[0], y: q[1], z: q[2] } : q);
export function scrOf(X, q) { const w = pt(q); const s = X.scr(w.x, w.y, w.z); return { x: s.x, y: s.y, on: s.on !== false }; }
export function nearPts(X, p, pts, R = gripR()) {
  if (!p) return true;
  for (const q of pts) { if (!q) continue; const s = scrOf(X, q); if (s.on && Math.hypot(p.x - s.x, p.y - s.y) < R) return true; }
  return false;
}
export function nearSeg(X, p, a, b, R = bigR()) {
  if (!p) return true;
  const A = scrOf(X, a), B = scrOf(X, b); if (!A.on && !B.on) return false;
  const dx = B.x - A.x, dy = B.y - A.y, L2 = dx * dx + dy * dy, u = L2 > 1 ? Math.max(0, Math.min(1, ((p.x - A.x) * dx + (p.y - A.y) * dy) / L2)) : 0;
  return Math.hypot(p.x - A.x - dx * u, p.y - A.y - dy * u) < R;
}
export function hitAny(X, p, objs) {
  if (!p) return true;
  const L = objs.filter(Boolean); if (!L.length) return false;
  try { return X.rayAt(p.x, p.y).intersectObjects(L, true).length > 0; } catch (e) { return false; }
}
export function nearObjs(X, p, objs, R = gripR()) {
  if (!p) return true;
  const L = objs.filter((o) => o && o.visible !== false);
  return hitAny(X, p, L) || nearPts(X, p, L.map((o) => centreOf(X, o)), R);
}
/** an object's middle in the world: its bounding box's centre (a mesh whose geometry is placed in world numbers has its position at 0) */
export function centreOf(X, o) {
  try { if (X.THREE && X.THREE.Box3) { const b = new X.THREE.Box3().setFromObject(o); if (!b.isEmpty()) { const c = b.getCenter(new X.THREE.Vector3()); return { x: c.x, y: c.y, z: c.z }; } } } catch (e) { /* */ }
  const v = o.getWorldPosition ? o.getWorldPosition(new o.position.constructor()) : o.position; return { x: v.x, y: v.y, z: v.z };
}
