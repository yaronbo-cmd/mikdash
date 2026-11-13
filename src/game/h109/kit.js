/* ── build 109 ── h109/kit.js — what every act of stage 01 shares: the beat clock (the music's beat, else 124 BPM), the crews
 * of an act (old actors.js workers who really work: a pick on the beat, a rope pulled in time, a stone carried, a jar poured — never a
 * looping wave with nothing in hand, the owner 7.11), and small helpers (the finger on a world plane, a heavy follow).
 */
import { H109 } from './model.js';

const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
export const easeIO = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);

/** the beat: the music's own (stages' __BH_MUSIC.beat) when it plays, else 124 BPM; the gold moments are every k-th beat */
export function createBeat(X) {
  const P0 = 60 / H109.BPM;
  const B = { p: P0, t: 0, n: 0, ext: false };
  B.step = (dt) => {
    const b = X.beat();
    if (b) {
      const since = clamp(b.period - b.toNext, 0, b.period);
      if (since < B.t - b.period * 0.5) B.n++;
      B.p = b.period; B.t = since; B.ext = true;
    } else { B.ext = false; B.p = P0; B.t += dt; while (B.t >= B.p) { B.t -= B.p; B.n++; } }
  };
  /** seconds from now to the next gold moment (every k-th beat) */
  B.toGold = (k = 2) => { let to = B.p - B.t, n = B.n + 1; while (n % k) { to += B.p; n++; } return to; };
  /** the signed error (s) of a moment `ahead` s from now against the nearest gold */
  B.err = (ahead = 0, k = 2) => { const P = B.p * k, g = B.toGold(k); let e = (ahead - g) % P; if (e > P / 2) e -= P; if (e < -P / 2) e += P; return e; };
  /** 0..1 through the gold cycle: 0 just after a gold moment, → 1 at the next */
  B.phase = (k = 2) => 1 - B.toGold(k) / (B.p * k);
  return B;
}

/** the finger on a horizontal plane y = h (world) → {x, z} | null */
export function onPlane(X, sx, sy, h, out = {}) {
  const r = X.rayAt(sx, sy).ray; const d = r.direction, o = r.origin;
  if (Math.abs(d.y) < 1e-4) return null; const t = (h - o.y) / d.y; if (t < 0) return null;
  out.x = o.x + d.x * t; out.z = o.z + d.z * t; return out;
}

/* ───────── the act's crews: real work in their hands ───────── */
const TUNIC = ['#B89A6A', '#A88A5C', '#C2A878', '#9C8460', '#B4946A'];
const CREW = ['#7A3B2A', '#3E5C7A', '#5C6E34', '#7A6A2A'];
export function createGang(X) {
  const A = X.actors ? X.actors() : null;
  const L = [];
  let tt = 0, seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  /** a worker at (x, z) facing (fx, fz); role: pick | hammer | pull | push | carry | kneel | pour | point | lever | hold | walk */
  function add(x, z, o = {}) {
    if (!A) return null;
    const a = A.add(o.variant || 'worker', x, z, { yaw: 0, col2: o.col2 || CREW[(o.crew | 0) % CREW.length], fadeIn: true });   // ── h120 ── (o.variant: 'kohen' for a life-size kohen among the crew, in white with his turban and sash) ── /h120 ──
    try { a.col.set(o.tunic || TUNIC[Math.floor(rnd() * TUNIC.length)]); } catch (e) { /* */ }
    a.vis = 0; a.visT = 1;
    const w = { a, role: o.role || 'hold', off: o.off != null ? o.off : rnd() * 0.15, k: o.k || 2, fx: o.fx, fz: o.fz, t: 0, lastU: 0, onHit: o.onHit || null, from: o.from || null, to: o.to || null, leg: 0, wait: 0, item: o.item || null, dust: o.dust !== false, lean: o.lean || 0 };
    if (o.fx != null) a.yaw = Math.atan2(o.fx - x, o.fz - z);
    if (o.item) A.setItem(a, o.item);
    if (w.role === 'kneel') A.pose(a, 'kneel');
    if (w.role === 'point') A.pose(a, 'point');
    if (w.role === 'carry' && w.from && w.to) { A.setItem(a, null); go(w); }
    L.push(w); return w;
  }
  function go(w) {
    const p = w.leg ? w.from : w.to;
    A.setItem(w.a, w.leg ? null : (w.item || 'stone'));
    A.walk(w.a, [[p[0], p[1]]], w.speed || 2.4).then(() => { if (!w.a.alive) return; w.wait = 0.7 + rnd() * 0.6; w.leg = 1 - w.leg; });
  }
  function remove(w) { if (!w) return; const i = L.indexOf(w); if (i >= 0) L.splice(i, 1); try { A.remove(w.a); } catch (e) { /* */ } }
  function clear() { for (const w of L.slice()) remove(w); }
  function setRole(w, role, o = {}) { if (!w) return; w.role = role; Object.assign(w, o); if (role === 'kneel') A.pose(w.a, 'kneel'); else if (role === 'point') A.pose(w.a, 'point'); else if (role === 'talk') A.pose(w.a, 'talk'); else A.pose(w.a, 'stand'); if (o.item !== undefined) A.setItem(w.a, o.item); }
  function walkTo(w, x, z, speed = 2.6) { if (!w) return Promise.resolve(false); return A.walk(w.a, [[x, z]], speed); }
  function face(w, x, z) { if (w) { w.a.yaw = Math.atan2(x - w.a.x, z - w.a.z); } }
  const V = { x: 0, y: 0, z: 0 };
  /** every frame: the beat clock B (phase of the gold cycle) */
  function update(dt, B) {
    tt += dt;
    for (const w of L) {
      const a = w.a; if (!a.alive) continue;
      if (w.fx != null && !a.path && (w.role === 'pick' || w.role === 'hammer' || w.role === 'pull' || w.role === 'push' || w.role === 'lever' || w.role === 'hold')) a.yaw = Math.atan2(w.fx - a.x, w.fz - a.z);
      if (w.role === 'pick' || w.role === 'hammer') {
        // the swing: up slowly, the fall fast, the contact ON the beat (crews.js's digger), so the crew teaches the beat without words
        const k = w.k || 2, ph = B ? B.phase(k) : (tt / 0.97) % 1;
        const u = (ph + 0.66 + w.off) % 1;
        const top = w.role === 'pick' ? 2.9 : 2.3, hit = w.role === 'pick' ? 0.62 : 0.7;
        let r, bow;
        if (u < 0.52) { const v = ease(u / 0.52); r = lerp(hit, top, v); bow = lerp(0.55, 0.04, v); }
        else if (u < 0.66) { const v = (u - 0.52) / 0.14; r = lerp(top, hit, v * v); bow = lerp(0.04, 0.58, v * v); }
        else { const v = (u - 0.66) / 0.34; r = hit + Math.sin(v * Math.PI) * 0.1; bow = 0.55; }
        const hitNow = w.lastU < 0.66 && u >= 0.66; w.lastU = u;
        if (w.role === 'pick') { a.arm[0] = a.armT[0] = r; a.arm[2] = a.armT[2] = r; a.arm[1] = a.armT[1] = -0.12; a.arm[3] = a.armT[3] = -0.12; a.tilt = a.tiltT = -r + 0.35; }
        else { a.arm[2] = a.armT[2] = r; a.arm[3] = a.armT[3] = -0.1; a.arm[0] = a.armT[0] = 0.98; a.arm[1] = a.armT[1] = -0.34; a.tilt = a.tiltT = -r + 0.2; bow *= 0.6; }
        a.bow = a.bowT = bow;
        if (hitNow) {
          const fx = Math.sin(a.yaw), fz = Math.cos(a.yaw), x = a.x + fx * 1.7, z = a.z + fz * 1.7;
          if (w.dust) X.dust(x, X.ground(x, z) + 0.4, z, 3, 1.6);
          if (w.onHit) try { w.onHit(w); } catch (e) { /* */ }
        }
      } else if (w.role === 'pull' || w.role === 'push') {
        // a rope pulled in time ("בשירה קצובה"): lean back on the beat, both hands forward on the rope
        const ph = B ? B.phase(w.k || 2) : (tt / 0.97) % 1, s = Math.sin((ph + w.off) * TAU);
        const lean = w.role === 'pull' ? -0.22 - 0.16 * Math.max(0, s) : 0.45 + 0.15 * Math.max(0, s);
        a.arm[0] = a.armT[0] = 1.15; a.arm[2] = a.armT[2] = 1.15; a.arm[1] = a.armT[1] = -0.3; a.arm[3] = a.armT[3] = -0.3;
        a.bow = a.bowT = lean + (w.lean || 0); a.kn = a.knT = 0.15 + 0.1 * Math.max(0, s);
      } else if (w.role === 'lever') {
        const ph = B ? B.phase(w.k || 2) : (tt / 0.97) % 1, k = 0.5 - 0.5 * Math.cos((ph + w.off) * TAU), r = 1.2 - 0.35 * k;
        a.arm[0] = a.armT[0] = r; a.arm[2] = a.armT[2] = r; a.arm[1] = a.armT[1] = -0.2; a.arm[3] = a.armT[3] = -0.2;
        a.bow = a.bowT = 0.25 + 0.35 * k; a.tilt = a.tiltT = -r + 1.9;
      } else if (w.role === 'carry') {
        if (!a.path) { w.wait -= dt; if (w.wait <= 0 && w.from && w.to) { w.wait = 1e9; go(w); } }
        if (a.path) { a.arm[0] = a.armT[0] = 1.2; a.arm[2] = a.armT[2] = 1.2; a.arm[1] = a.armT[1] = -0.3; a.arm[3] = a.armT[3] = -0.3; }
      }
    }
    void V;
  }
  return { add, remove, clear, setRole, walkTo, face, update, list: L, get A() { return A; } };
}

/** ── h115 ── how blocked a camera's view is: of 12 points on the segment from the camera to its aim, those under the ground or inside
 *  a sphere of O ({x, y, z, r}); clearView: none ── /h115 ── */
/** where the camera really stands: the world camera keeps its distance from the aim (main.js minDist), so a near shot is pushed back */
export function camAt(X, p, t) {
  let md = 0; try { md = X.view && X.view.minDist ? X.view.minDist() : 0; } catch (e) { md = 0; }
  const d = Math.hypot(p[0] - t[0], p[1] - t[1], p[2] - t[2]); if (!(md > d) || d < 1e-6) return p;
  const k = md / d; return [t[0] + (p[0] - t[0]) * k, t[1] + (p[1] - t[1]) * k, t[2] + (p[2] - t[2]) * k];
}
export function viewBlock(X, p, t, O) {
  p = camAt(X, p, t); let n = 0;
  for (let i = 1; i < 12; i++) {
    const u = i / 12, x = p[0] + (t[0] - p[0]) * u, y = p[1] + (t[1] - p[1]) * u, z = p[2] + (t[2] - p[2]) * u;
    if (u < 0.92 && y < X.ground(x, z) + 0.6) { n++; continue; }
    for (const o of O) if (Math.hypot(x - o.x, y - o.y, z - o.z) < o.r) { n++; break; }
  }
  return n;
}
export function clearView(X, p, t, O) { return viewBlock(X, p, t, O) === 0; }
/** ── h115 ── what really stands between a camera and its aim (a ray through the scene: the big rocks, the hill, the cut walls; small
 *  things — figures, tools, sprites, see-through props — and the last 3 amot before the aim do not count) ── /h115 ── */
let RC = null;
export function rayBlocked(X, p, t) {
  p = camAt(X, p, t); const T = X.THREE; RC = RC || new T.Raycaster();
  const o = new T.Vector3(p[0], p[1], p[2]), d = new T.Vector3(t[0] - p[0], t[1] - p[1], t[2] - p[2]), L = d.length(); if (L < 1) return false;
  RC.set(o, d.normalize()); RC.far = L - 3; RC.camera = X.camera;
  let hits = []; try { hits = RC.intersectObject(X.scene, true); } catch (e) { hits = []; }
  // the ground between (the hill as it is cut now), a point every amah and a half
  { const n = Math.max(4, Math.ceil((L - 3) / 1.5)); for (let i = 1; i < n; i++) { const u = (i / n) * (L - 3) / L, x = p[0] + (t[0] - p[0]) * u, y = p[1] + (t[1] - p[1]) * u, z = p[2] + (t[2] - p[2]) * u; if (y < X.ground(x, z) - 0.15) return true; } }
  for (const h of hits) {
    const m = h.object; if (!m.isMesh || m.isSprite || m.isInstancedMesh || m.name === 'hill') continue;   // (the hill is cut in its shader: its ground is asked of X.ground below)
    let vis = true; for (let q = m; q; q = q.parent) if (!q.visible) { vis = false; break; } if (!vis) continue;
    const mt = Array.isArray(m.material) ? m.material[0] : m.material; if (!mt || mt.transparent || mt.depthWrite === false) continue;
    if (!m.geometry.boundingSphere) m.geometry.computeBoundingSphere();
    const sc = m.getWorldScale(new T.Vector3()), r = m.geometry.boundingSphere.radius * Math.max(sc.x, sc.y, sc.z); if (r < 2.5) continue;
    return true;
  }
  return false;
}
