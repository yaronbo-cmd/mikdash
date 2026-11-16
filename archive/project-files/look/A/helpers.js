// page helpers for the round-A shot set (evaluated in the page)
(() => {
  const T = window.__T;
  // the world point under a screen point (opaque, visible meshes only)
  window.__W = (sx, sy) => {
    const c = T.camera; c.updateMatrixWorld(true);
    const v = new T.Vector3((sx / innerWidth) * 2 - 1, -(sy / innerHeight) * 2 + 1, 0.5).unproject(c).sub(c.position).normalize();
    const rc = new T.Raycaster(c.position.clone(), v, 0.1, 2000); rc.camera = c;
    let hits = [];
    try { hits = rc.intersectObjects(T.scene.children, true); } catch (e) { hits = []; }
    const h = hits.find((q) => { let o = q.object; while (o) { if (!o.visible) return false; o = o.parent; } const m = q.object.material; return m && !Array.isArray(m) && !m.transparent && !q.object.isSprite && !q.object.isPoints && !q.object.isLine; });
    if (h) return [h.point.x, h.point.y, h.point.z];
    // (no hit: the point at the camera target's distance)
    const d = c.position.distanceTo(T.controls.target); return [c.position.x + v.x * d, c.position.y + v.y * d, c.position.z + v.z * d];
  };
  // the camera moved toward the world point under (sx, sy): k = the share of the distance kept, lift = amot up
  window.__ZOOM = (sx, sy, k, lift = 0) => {
    const w = window.__W(sx, sy), p = T.camera.position;
    return [[w[0] + (p.x - w[0]) * k, w[1] + (p.y - w[1]) * k + lift, w[2] + (p.z - w[2]) * k], w];
  };
  // a camera at azimuth az (rad, from +z toward +x), elevation el (rad), distance d from target t
  window.__CAM = (t, az, el, d) => [[t[0] + d * Math.cos(el) * Math.sin(az), t[1] + d * Math.sin(el), t[2] + d * Math.cos(el) * Math.cos(az)], t];
  window.__A = () => { const s = T.game.h109.state(); return s && s.act; };
  // the bot until cond (a js string over a = the act's dbg) holds; the bot's own shots are dropped by the runner
  window.__BOTUNTIL = (cond) => { let a = null; try { a = window.__A(); } catch (e) { a = null; } let ok = false; try { ok = !!(0, eval)('(a)=>(' + cond + ')')(a); } catch (e) { ok = false; } if (ok) return { done: true }; return window.__BOT.next(); };
  return 'helpers ready';
})();
