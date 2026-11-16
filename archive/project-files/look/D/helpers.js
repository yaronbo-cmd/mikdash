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
  // round C: the sun's direction (the DirectionalLight, found as stage 05 finds it), a cart of the crews' trains
  window.__SUNL = () => { let L = null; T.scene.traverse((o) => { if (!L && o.isDirectionalLight) L = o; }); return L; };
  window.__SUND = () => { const L = window.__SUNL(); const d = L.position.clone().sub(L.target.position).normalize(); return [d.x, d.y, d.z]; };
  window.__SUNCAM = (p, up) => { const d = window.__SUND(); return [p, [p[0] + d[0] * 300, p[1] + d[1] * 300 - (up || 0), p[2] + d[2] * 300]]; };
  window.__CART = () => { const m = T.scene.getObjectByName('crews-carts'); if (!m || !m.count) return null; const M = new T.scene.matrix.constructor(); let best = null; const c = T.camera.position; for (let i = 0; i < m.count; i++) { m.getMatrixAt(i, M); const x = M.elements[12], y = M.elements[13], z = M.elements[14]; const d = Math.hypot(x - 0, z - 0); if (!best || d < best.d) best = { x, y, z, d, i }; } return best; };
  window.__GY = (x, z) => { const rc = new T.Raycaster(new T.Vector3(x, 2000, z), new T.Vector3(0, -1, 0), 0.1, 4000); rc.camera = T.camera; let h = []; try { h = rc.intersectObjects(T.scene.children, true); } catch (e) { h = []; } const q = h.find((q) => { let o = q.object; while (o) { if (!o.visible) return false; o = o.parent; } return !q.object.isPoints && !q.object.isSprite && !q.object.isLine && q.object.name !== 'sky'; }); return q ? q.point.y : 0; };
  return 'helpers ready';
})();
