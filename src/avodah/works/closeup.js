/* ── figures24 ── closeup.js — the precision camera of the works (WAVE24: "רוצים להראות בדיוק רב ככל הניתן את העבודות").
 * A work asks for a close-up at its key act; the day's frame (day/index.js `// ── figures24 ──`) lays it over the follow camera
 * twin.js computed, and lets it go: a dolly in over `ms` (1.2 s), the act in the frame's middle, 5–7 amot away, 20–30° down, held while
 * the work keeps asking (or `hold` s after a single call), then a glide back to the follow camera — never a cut. One state, no allocation.
 *   closeup({ x, y, z }, { dist: 6, el: 0.44 (rad, ~25°), ms: 1200, hold: 2.5, az }) — world point; az: the bearing (default: the camera's now)
 *   closeAt(k, a, s, y, o)  — the same at a point of the kit's stage (local a, s, y); dist scales with the stage's size (K / 1.5)
 *   release()               — glide back now          · closeState() — tests ── /figures24 ── */
const CU = { on: false, w: 0, goal: 0, x: 0, y: 0, z: 0, dist: 6, el: 0.44, ms: 1200, until: 0, az: NaN, azWant: NaN, n: 0, since: 0, key: '', relKey: '', relT: -1e9, gx: 0, gy: 0, gz: 0, gdist: 6, gel: 0.44, saz: 0, snap: false, df: 1, de: 0 };
const tmp = { x: 0, y: 0, z: 0 };
const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

/** ask for a close-up at a world point (repeat the call to keep it; a new point or key while it holds glides there, never a cut) */
export function closeup(at, o = {}) {
  if (!at || !Number.isFinite(at.x) || !Number.isFinite(at.z)) return false;
  const t = now(), fresh = !CU.on || CU.goal === 0, key = o.key || '';
  if (fresh && key && key === CU.relKey && t - CU.relT < 6000) return false;   // (a work's lingering frames after its end do not take the camera back)
  CU.gx = at.x; CU.gy = Number.isFinite(at.y) ? at.y : CU.gy || 0; CU.gz = at.z;
  if (fresh || key !== CU.key) { CU.az = NaN; CU.azWant = Number.isFinite(o.az) ? o.az : NaN; CU.n++; CU.since = t; CU.key = key; CU.df = 1; CU.de = 0; }
  CU.gdist = Math.max(3, Math.min(18, o.dist || 6)) * CU.df; CU.gel = Math.max(0.2, Math.min(0.75, o.el == null ? 0.44 : o.el)) + CU.de; CU.ms = Math.max(300, o.ms || 1200);
  CU.until = t + (o.hold == null ? 2.5 : o.hold) * 1000; CU.goal = 1;
  if (!CU.on || CU.w <= 0) CU.snap = true;
  CU.on = true;
  return true;
}
/** the same at a kit-local point (dist in amot at a stage of K 1.5; a bigger stage, a farther camera) */
export function closeAt(k, a, s, y, o = {}) {
  if (!k || !k.world || !k.F || !k.F.on) return false;
  k.world(a, s, y, tmp); const sc = Math.max(0.6, Math.min(3, (k.F.K || 1.5) / 1.5));
  let az = o.az;
  if (Number.isFinite(o.from)) { const fx = k.F.fx, fz = k.F.fz, ca = Math.cos(o.from), sa = Math.sin(o.from); const dx = fx * ca - fz * sa, dz = fz * ca + fx * sa; az = Math.atan2(dz, dx); }   // (o.from: the bearing in the stage's own frame — 0 = from beyond the stage, π = from the player's side)
  return closeup({ x: tmp.x, y: tmp.y, z: tmp.z }, { ...o, az, dist: (o.dist || 6) * sc });
}
export function release() { if (CU.goal) { CU.relKey = CU.key; CU.relT = now(); } CU.goal = 0; }
export const closeState = () => ({ on: CU.on, w: +CU.w.toFixed(3), goal: CU.goal, n: CU.n, x: CU.x, y: CU.y, z: CU.z, dist: CU.dist, el: CU.el, key: CU.key, df: CU.df, de: CU.de });

/** the day's frame, after the follow camera was set: blend it toward the close-up. view: { camNow(out), camSet(px, py, pz, tx, ty, tz) },
 *  dt (s), blocked?(px, py, pz, tx, ty, tz) → true when a built mass stands between. Returns true while it holds the camera. */
const cam = { px: 0, py: 0, pz: 0, tx: 0, ty: 0, tz: 0 };
export function closeTick(view, dt, blocked, floor) {
  if (!CU.on || !view || typeof view.camNow !== 'function') return false;
  if (CU.goal && now() > CU.until) CU.goal = 0;
  const step = dt * 1000 / CU.ms; CU.w = CU.goal ? Math.min(1, CU.w + step) : Math.max(0, CU.w - step);
  if (CU.w <= 0 && !CU.goal) { CU.on = false; if (typeof view.closeCam === 'function') view.closeCam(false); return false; }
  const md = typeof view.closeCam === 'function' ? view.closeCam(true) : 0;
  view.camNow(cam);
  // (the follow camera as it is seen: the world keeps it md away from its target — blend from that, so the way back ends where it was)
  { const dx = cam.px - cam.tx, dy = cam.py - cam.ty, dz = cam.pz - cam.tz, d = Math.hypot(dx, dy, dz); if (md > 0 && d > 1e-3 && d < md) { const f = md / d; cam.px = cam.tx + dx * f; cam.py = cam.ty + dy * f; cam.pz = cam.tz + dz * f; } }
  // the bearing: as asked, else the follow camera's own (the side he already looks from), fixed per key; turned off a wall
  if (!Number.isFinite(CU.az)) {
    let az = Number.isFinite(CU.azWant) ? CU.azWant : Math.atan2(cam.pz - CU.gz, cam.px - CU.gx), el = CU.gel;
    if (typeof blocked === 'function') {
      // the first clear pose: as asked, then turned a little, raised, brought nearer (never inside a wall or the altar, never over the court's edge)
      const at = (b, e, d) => [CU.gx + Math.cos(e) * Math.cos(b) * d, CU.gy + Math.sin(e) * d, CU.gz + Math.cos(e) * Math.sin(b) * d];
      let got = false;
      search: for (const [df, de] of [[1, 0], [1, 0.2], [0.8, 0.2], [1, 0.4], [0.8, 0.4], [0.65, 0.35], [1, 0.6], [0.8, 0.6], [0.65, 0.8], [0.5, 0.8]]) for (const off of [0, 0.35, -0.35, 0.7, -0.7, 1.1, -1.1, 1.6, -1.6, Math.PI]) {
        const q = at(az + off, el + de, CU.gdist * df);
        if (!blocked(q[0], q[1], q[2], CU.gx, CU.gy, CU.gz)) { az += off; el += de; CU.gdist *= df; CU.df = df; CU.de = de; got = true; break search; }
      }
      if (!got) { CU.relKey = CU.key; CU.relT = now(); CU.goal = 0; CU.w = 0; CU.on = false; if (typeof view.closeCam === 'function') view.closeCam(false); return false; }   // (no clear pose: no close-up — the follow camera keeps the frame; the same key is not tried again for 6 s)
    }
    CU.az = az; CU.gel = el;
  }
  // the drawn close-up eases toward the asked one (a new act's point: a glide of ~0.6 s); a fresh one starts on it
  if (CU.snap) { CU.snap = false; CU.x = CU.gx; CU.y = CU.gy; CU.z = CU.gz; CU.dist = CU.gdist; CU.el = CU.gel; CU.saz = CU.az; }
  else {
    const k = 1 - Math.exp(-dt * 4);
    CU.x += (CU.gx - CU.x) * k; CU.y += (CU.gy - CU.y) * k; CU.z += (CU.gz - CU.z) * k; CU.dist += (CU.gdist - CU.dist) * k; CU.el += (CU.gel - CU.el) * k;
    let da = CU.az - CU.saz; da = Math.atan2(Math.sin(da), Math.cos(da)); CU.saz += da * k;
  }
  const ce = Math.cos(CU.el), se = Math.sin(CU.el);
  const qx = CU.x + ce * Math.cos(CU.saz) * CU.dist, qy = CU.y + se * CU.dist, qz = CU.z + ce * Math.sin(CU.saz) * CU.dist;
  let qy2 = qy; if (typeof floor === 'function') { const f = floor(qx, qz); if (Number.isFinite(f) && qy2 < f + 1.5) qy2 = f + 1.5; }   // (never under the ground or a step)
  const e = CU.w * CU.w * (3 - 2 * CU.w);
  view.camSet(cam.px + (qx - cam.px) * e, cam.py + (qy2 - cam.py) * e, cam.pz + (qz - cam.pz) * e, cam.tx + (CU.x - cam.tx) * e, cam.ty + (CU.y - cam.ty) * e, cam.tz + (CU.z - cam.tz) * e);
  return true;
}
export function closeReset(view) { CU.on = false; CU.w = 0; CU.goal = 0; if (view && typeof view.closeCam === 'function') view.closeCam(false); }
try { globalThis.__F24 = Object.assign(globalThis.__F24 || {}, { closeup, closeAt, release, closeState }); } catch (e) { /* tests */ }
