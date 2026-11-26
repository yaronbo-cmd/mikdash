/* ── build 137 ── h137/taim-model.js — work 1 "מבוך התאים והמסיבה", the model (spec docs/specs/shlav-14-he.md v3, עבודה 1). Pure:
 * no three.js, no DOM. Every place from BOOK.s14.taim (the rooms, their floors, the routes of the three levels).
 * THE KOHEN is a circle (r 0.45) on the rooms' floors, with a heading (yaw: atan2 of z over x — 0 east, −π/2 north). Each frame:
 *   · fwd −1 … 1: the work hand's drag on his pelvis along the way he faces (40–56 dp = full); he walks where he faces, at VMAX × fwd
 *     (back at half), never sideways;
 *   · turn: the yaw the helper hand's finger moved round the ring this frame (radians) — from level 2 the only way he turns;
 *   · steer (level 1 only, one hand): the drag's own direction on the ground: he turns toward it (STEER rad/s), and toward the opening
 *     nearest ahead of him (within 30°, AUTO rad/s: spec "מסתובב לבד בעדינות אל הפתח");
 *   · free: no finger down (the halt after a step ends with it: the camera moves on only when both fingers have left).
 * THE WALLS: every edge of a room that is not an opening; he cannot pass them (the circle is pushed out). A touch of a jamb (a doorway's
 * side, or the corner of its mouth) marks the step (a soft touch: 20); a jamb struck at full speed (≥ 0.85 VMAX) with his heading more
 * than 35° off the doorway's axis is a broken stone corner: −20, kept, he stops; the step goes on, capped at 20.
 * A STEP = he enters the next room of the route (a cell, a corner of the roofs, the upper door): 40 clean, 20 after a touch, 10 after a
 * detour (he entered a cell not on the way and came out). Up a hatch: he walks under it on the forward drag; at his nearest to its
 * centre (the distance turns, or he stops) he rises through it in one second (≤ 0.35 off the centre: clean; else a touch of its rim).
 * After a step he stands at the threshold until both fingers leave (the camera moves on then). The work's first damage is a free try.
 * Units: amot, seconds. Nothing random (rule 56). */
import { BOOK } from '../world/grid.js';

const T14 = BOOK.s14.taim;
export const TM = Object.freeze({
  R: T14.r, VMAX: 2.3, BACK: 0.5, STEER: 2.4, AUTO: 1.0, AUTO_ANG: 30, BREAK_V: 0.85, BREAK_ANG: 35, BOUNCE: 0.35, HATCH_R: 0.85, HATCH_GOLD: 0.35,
  RISE_T: 1.0, CUT_T: 1.2, EPS: 1e-6, JOIN: 0.6, SEE: 6,
});
const RAD = Math.PI / 180;
const wrap = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
export const yawOf = (dx, dz) => Math.atan2(dz, dx);
/* ───────── the rooms, their openings and walls (computed once) ───────── */
export const ROOMS = T14.rooms;
const BY = new Map(ROOMS.map((R) => [R.id, R]));
export const roomOf = (id) => BY.get(id) || null;
/** the floor's height in a room at x */
export function floorY(R, x) {
  if (typeof R.y === 'number') return R.y;
  const [x0, , x1] = R.r, k = Math.max(0, Math.min(1, (x - x0) / (x1 - x0)));
  return R.y.x0 + (R.y.x1 - R.y.x0) * k;
}
const inside = (R, x, z, m = 0) => x >= R.r[0] - m && x <= R.r[2] + m && z >= R.r[1] - m && z <= R.r[3] + m;
/** the openings between rooms: { a, b, axis 'x'|'z' (the edge's normal), at (the edge's coordinate), lo, hi (along it) } */
function joins() {
  const out = [];
  for (let i = 0; i < ROOMS.length; i++) for (let j = i + 1; j < ROOMS.length; j++) {
    const A = ROOMS[i], B = ROOMS[j];
    for (const [ax, a0, a1, b0, b1, o0, o1, p0, p1] of [
      ['x', A.r[2], A.r[0], B.r[0], B.r[2], A.r[1], A.r[3], B.r[1], B.r[3]],
      ['z', A.r[3], A.r[1], B.r[1], B.r[3], A.r[0], A.r[2], B.r[0], B.r[2]],
    ]) {
      let at = null;
      if (Math.abs(a0 - b0) < 1e-6) at = a0; else if (Math.abs(a1 - b1) < 1e-6) at = a1;
      if (at == null) continue;
      const lo = Math.max(o0, p0), hi = Math.min(o1, p1); if (hi - lo < 0.5) continue;
      const mid = (lo + hi) / 2, ya = floorY(A, ax === 'x' ? at : mid), yb = floorY(B, ax === 'x' ? at : mid);
      if (Math.abs(ya - yb) > TM.JOIN) continue;
      out.push({ a: A.id, b: B.id, axis: ax, at, lo, hi });
    }
  }
  return out;
}
export const JOINS = joins();
const NB = new Map(ROOMS.map((R) => [R.id, []]));
for (const J of JOINS) { NB.get(J.a).push(J); NB.get(J.b).push(J); }
export const neighbours = (id) => (NB.get(id) || []).map((J) => (J.a === id ? J.b : J.a));
/** a room's walls: its four edges minus the openings; each { a: [x, z], b: [x, z], jamb (a doorway's side) , ends: [jambA, jambB] } */
function wallsOf(R) {
  const [x0, z0, x1, z1] = R.r, out = [];
  const edges = [['z', z0, x0, x1, [0, -1]], ['z', z1, x0, x1, [0, 1]], ['x', x0, z0, z1, [-1, 0]], ['x', x1, z0, z1, [1, 0]]];
  for (const [ax, at, lo, hi, n] of edges) {
    const gaps = (NB.get(R.id) || []).filter((J) => J.axis === ax && Math.abs(J.at - at) < 1e-6).map((J) => [J.lo, J.hi]).sort((p, q) => p[0] - q[0]);
    let s = lo;
    const push = (u0, u1, e0, e1) => { if (u1 - u0 < 1e-6) return; const a = ax === 'z' ? [u0, at] : [at, u0], b = ax === 'z' ? [u1, at] : [at, u1]; out.push({ a, b, jamb: R.kind === 'door', ends: [e0, e1], n }); };
    let lastGap = false;
    for (const [g0, g1] of gaps) { push(s, Math.min(g0, hi), lastGap, true); s = Math.max(s, g1); lastGap = true; }
    push(s, hi, lastGap, false);
  }
  return out;
}
const WALLS = new Map(ROOMS.map((R) => [R.id, wallsOf(R)]));
export const wallsOfRoom = (id) => WALLS.get(id) || [];
/** a doorway's axis (the way through it): the axis of its openings' normal */
const AXIS = new Map(ROOMS.filter((R) => R.kind === 'door' || R.kind === 'end').map((R) => [R.id, R.axis || 'x']));
/** a doorway's room next to a room (its mouth) — for the jamb's axis when he touches a mouth's corner */
function doorAt(roomId, x, z) {
  for (const id of [roomId, ...neighbours(roomId)]) { const R = BY.get(id); if (R && (R.kind === 'door' || R.kind === 'end') && inside(R, x, z, 0.6)) return R; }
  return null;
}
/* ───────── the state ───────── */
export function fresh(lv) {
  const RT = T14.routes[lv] || T14.routes[1], st = RT.start;
  return {
    lv, route: RT.steps.map((s) => (typeof s === 'string' ? { room: s } : s)), k: 0, steps: [], flaws: [], first: true, t: 0, done: false,
    x: st.x, z: st.z, yaw: st.yaw, room: st.room, y: floorY(BY.get(st.room), st.x), v: 0,
    phase: 'walk', pt: 0, halt: false, touched: false, broke: false, detour: false, seen: [st.room], last: st.room,
    hatch: null, rise: null, cut: null, contact: null, two: false, used: { ring: false }, ev: [],
  };
}
/** the next step's target room */
export const target = (S) => (S.k < S.route.length ? S.route[S.k] : null);
const isStep = (R) => R && (R.kind === 'cell' || R.kind === 'corner' || R.kind === 'end' || (R.kind === 'hall' && !R.cam));
const isWrong = (S, R) => R && (R.kind === 'cell' || R.id === 'heichal' || R.id === 'ulam') && !S.route.some((s) => s.room === R.id) && R.id !== S.route0;
/** where the opening toward the next target is (the light ahead: the mouth he must reach, or the hatch) */
export function goal(S) {
  const tg = target(S); if (!tg || tg.cut) return null;
  const T = BY.get(tg.room), C = BY.get(S.room);
  if (C && C.hatch && C.hatch.to === tg.room) return { x: C.hatch.x, z: C.hatch.z, y: floorY(C, C.hatch.x), hatch: true };
  // a breadth-first path through the rooms to the target; the first opening on it
  const prev = new Map([[S.room, null]]), q = [S.room];
  while (q.length) { const id = q.shift(); if (id === tg.room) break; for (const J of NB.get(id) || []) { const n = J.a === id ? J.b : J.a; if (!prev.has(n)) { prev.set(n, { id, J }); q.push(n); } } }
  if (!prev.has(tg.room)) return T ? { x: (T.r[0] + T.r[2]) / 2, z: (T.r[1] + T.r[3]) / 2, y: floorY(T, (T.r[0] + T.r[2]) / 2) } : null;
  let n = tg.room, p = prev.get(n);
  while (p && p.id !== S.room) { n = p.id; p = prev.get(n); }
  if (!p) return null;
  const J = p.J, m = (J.lo + J.hi) / 2, x = J.axis === 'x' ? J.at : m, z = J.axis === 'x' ? m : J.at;
  return { x, z, y: floorY(C, x), via: n };
}
/* ───────── one frame ───────── */
function push(S, e) { S.ev.push(e); return e; }
/** the circle against the walls near: push out; → the hardest contact this frame { jamb, nx, nz, door } or null */
function collide(S) {
  let hit = null;
  for (let it = 0; it < 3; it++) {
    let moved = false;
    for (const id of [S.room, ...neighbours(S.room)]) {
      const R = BY.get(id); if (!R) continue;
      if (Math.abs(floorY(R, S.x) - S.y) > 1.2) continue;
      for (const W of WALLS.get(id)) {
        const ax = W.b[0] - W.a[0], az = W.b[1] - W.a[1], L2 = ax * ax + az * az || 1;
        let u = ((S.x - W.a[0]) * ax + (S.z - W.a[1]) * az) / L2; u = Math.max(0, Math.min(1, u));
        const px = W.a[0] + ax * u, pz = W.a[1] + az * u, dx = S.x - px, dz = S.z - pz, d = Math.hypot(dx, dz);
        if (d >= TM.R - 1e-4) continue;
        // (only walls whose open side he is on: the circle's centre in this room, or on its line)
        const nx = d > 1e-6 ? dx / d : 0, nz = d > 1e-6 ? dz / d : 0;
        if (d < 1e-6) continue;
        S.x = px + nx * TM.R; S.z = pz + nz * TM.R; moved = true;
        const corner = (u <= 1e-3 && W.ends[0]) || (u >= 1 - 1e-3 && W.ends[1]);
        const jamb = W.jamb || corner;
        const c = { jamb, nx, nz, door: jamb ? (R.kind === 'door' || R.kind === 'end' ? R : doorAt(S.room, px, pz)) : null, room: id };
        if (!hit || (jamb && !hit.jamb)) hit = c;
      }
    }
    if (!moved) break;
  }
  return hit;
}
/** which room he stands in now (the current, or a neighbour he crossed into) */
function locate(S) {
  const C = BY.get(S.room);
  if (C && inside(C, S.x, S.z)) return S.room;
  for (const id of neighbours(S.room)) { const R = BY.get(id); if (R && inside(R, S.x, S.z)) return id; }
  return S.room;
}
/** a step ends: the grade, the halt */
function stepDone(S, roomId, how) {
  const g = S.broke || S.touched || how === 'rim' ? 'good' : S.detour ? 'ok' : 'gold';
  const grade = S.detour && g !== 'gold' ? 'ok' : S.detour ? 'ok' : g;
  const s = { room: roomId, grade, broke: S.broke, touched: S.touched, detour: S.detour, two: S.used.ring };
  S.steps.push(s); S.k++; S.touched = false; S.broke = false; S.detour = false; S.halt = true; S.used.ring = false; S.brokeAt = null;
  push(S, { k: 'step', room: roomId, grade, i: S.steps.length - 1, two: s.two });
  const nx = target(S);
  if (!nx) { S.done = true; S.phase = 'done'; push(S, { k: 'done' }); }
  else if (nx.cut) { S.phase = 'cut'; S.pt = 0; S.cut = nx; push(S, { k: 'cut', to: nx.room }); }
}
function enter(S, from, to) {
  const R = BY.get(to), tg = target(S);
  S.last = from; S.room = to;
  if (tg && !tg.cut && tg.room === to) { stepDone(S, to, ''); return; }
  if (isWrong(S, R)) { if (!S.detour) push(S, { k: 'detour', room: to }); S.detour = true; }
  push(S, { k: 'room', room: to, from });
}
export function step(S, dt, inp = {}) {
  S.ev = []; S.t += dt; S.pt += dt;
  if (S.done) return S.ev;
  if (S.phase === 'cut') {
    if (S.pt >= TM.CUT_T) { const c = S.cut; S.room = c.room; S.x = c.x; S.z = c.z; S.yaw = c.yaw; S.y = floorY(BY.get(c.room), c.x); S.k++; S.cut = null; S.phase = 'walk'; S.halt = true; push(S, { k: 'placed', room: c.room }); }
    return S.ev;
  }
  if (S.phase === 'rise') {
    const r = S.rise, k = Math.min(1, S.pt / TM.RISE_T);
    S.x = r.x0 + (r.hx - r.x0) * Math.min(1, k * 3); S.z = r.z0 + (r.hz - r.z0) * Math.min(1, k * 3); S.y = r.y0 + (r.y1 - r.y0) * (k * k * (3 - 2 * k));
    if (k >= 1) { S.phase = 'walk'; S.rise = null; S.y = r.y1; const from = S.room; S.room = r.to; S.last = from; if (r.rim) S.touched = true; stepDone(S, r.to, r.rim ? 'rim' : ''); }
    return S.ev;
  }
  if (S.halt) { S.v = 0; if (inp.free) { S.halt = false; push(S, { k: 'go' }); } return S.ev; }
  // the heading
  const lv = S.lv;
  if (inp.turn) { S.yaw = wrap(S.yaw + inp.turn); if (Math.abs(inp.turn) > 1e-4) S.used.ring = true; }
  const fwd = Math.max(-1, Math.min(1, inp.fwd || 0));
  if (lv === 1 && inp.steer != null && Math.abs(fwd) > 0.05) { const d = wrap(inp.steer - S.yaw); S.yaw = wrap(S.yaw + Math.sign(d) * Math.min(Math.abs(d), TM.STEER * dt)); }
  if (lv === 1 && fwd > 0.05) {
    const G = goal(S);
    if (G) { const a = yawOf(G.x - S.x, G.z - S.z), d = wrap(a - S.yaw), dist = Math.hypot(G.x - S.x, G.z - S.z); if (Math.abs(d) < TM.AUTO_ANG * RAD && dist < TM.SEE && dist > 0.3) S.yaw = wrap(S.yaw + Math.sign(d) * Math.min(Math.abs(d), TM.AUTO * dt)); }
  }
  // the walk
  const v = fwd >= 0 ? fwd * TM.VMAX : fwd * TM.VMAX * TM.BACK; S.v = v;
  const cx = Math.cos(S.yaw), cz = Math.sin(S.yaw);
  const sub = Math.max(1, Math.ceil(Math.abs(v * dt) / 0.15));
  for (let i = 0; i < sub; i++) {
    S.x += cx * v * dt / sub; S.z += cz * v * dt / sub;
    const hit = collide(S);
    const was = S.room, now = locate(S);
    if (now !== was) enter(S, was, now);
    if (S.halt || S.done || S.phase !== 'walk') break;
    if (hit) {
      S.contact = hit;
      if (hit.jamb && !S.cTouch) {
        // a jamb: how hard, and how far off the doorway's way
        const ax = hit.door ? AXIS.get(hit.door.id) || 'x' : 'x', along = ax === 'x' ? Math.abs(cx) : Math.abs(cz), off = Math.acos(Math.min(1, along)) / RAD;
        const hard = Math.abs(v) >= TM.BREAK_V * TM.VMAX && off > TM.BREAK_ANG;
        S.cTouch = 0.5;
        if (hard && S.brokeAt === (hit.door ? hit.door.id : S.room)) { S.touched = true; S.v = 0; S.x += hit.nx * TM.BOUNCE; S.z += hit.nz * TM.BOUNCE; collide(S); break; }   // (one break a doorway a step: the next hit there only stops him)
        if (hard) {
          S.brokeAt = hit.door ? hit.door.id : S.room;
          S.x += hit.nx * TM.BOUNCE; S.z += hit.nz * TM.BOUNCE; S.v = 0;
          if (S.first) { S.first = false; push(S, { k: 'free', door: hit.door ? hit.door.id : null }); S.touched = true; }
          else { S.broke = true; S.flaws.push({ f: 'taim.corner', at: hit.door ? hit.door.id : S.room }); push(S, { k: 'break', door: hit.door ? hit.door.id : null, x: S.x, z: S.z }); }
          collide(S); break;
        } else { S.touched = true; push(S, { k: 'touch', door: hit.door ? hit.door.id : null }); }
      }
    }
  }
  if (S.cTouch) S.cTouch = Math.max(0, S.cTouch - dt);
  S.y = floorY(BY.get(S.room), S.x);
  // the hatch: under it on the forward drag; at his nearest he rises
  const C = BY.get(S.room), tg = target(S);
  if (C && C.hatch && tg && !tg.cut && C.hatch.to === tg.room) {
    const d = Math.hypot(S.x - C.hatch.x, S.z - C.hatch.z);
    if (d < TM.HATCH_R) {
      if (!S.hatch) S.hatch = { min: d, t: 0 };
      S.hatch.min = Math.min(S.hatch.min, d); S.hatch.t += dt;
      const turning = d > S.hatch.min + 0.04, still = Math.abs(v) < 0.1 && S.hatch.t > 0.25;
      if (turning || still) {
        const rim = S.hatch.min > TM.HATCH_GOLD, U = BY.get(C.hatch.to);
        S.phase = 'rise'; S.pt = 0; S.rise = { x0: S.x, z0: S.z, hx: C.hatch.x, hz: C.hatch.z, y0: S.y, y1: floorY(U, C.hatch.x), to: C.hatch.to, rim };
        push(S, { k: 'rise', to: C.hatch.to, rim, off: +S.hatch.min.toFixed(3) }); S.hatch = null;
      }
    } else S.hatch = null;
  } else S.hatch = null;
  return S.ev;
}
/* ───────── the result (spec "ניקוד", stars by the base: steps × 40) ───────── */
export const PTS = { gold: 40, good: 20, ok: 10 };
export function result(S) {
  const n = S.steps.length || 1, base = n * 40, flaws = S.flaws.length;
  const pts = S.steps.reduce((a, s) => a + PTS[s.grade], 0), net = pts - flaws * 20;
  const gold = S.steps.filter((s) => s.grade === 'gold').length, allGold = gold === S.steps.length && S.steps.length > 0;
  const stars = !flaws && net >= base * 0.85 ? 3 : net >= base * 0.65 ? 2 : 1;
  return { stars, q: Math.max(0, net) / base, pts, perfect: stars === 3 && allGold, bonus: allGold && !flaws, flags: { steps: S.steps.length, gold, flaws, two: S.steps.filter((s) => s.two).length } };
}
export function save(S, id) { return { id, v: 1, lv: S.lv, k: S.k, steps: S.steps, flaws: S.flaws, first: S.first, room: S.room, x: S.x, z: S.z, yaw: S.yaw }; }
export function load(b) {
  if (!b || b.v !== 1) return null;
  const S = fresh(b.lv); S.steps = b.steps || []; S.flaws = b.flaws || []; S.first = !!b.first; S.k = Math.min(S.route.length - 1, b.k | 0);
  while (S.route[S.k] && S.route[S.k].cut) S.k++;
  if (b.room && BY.has(b.room)) { S.room = b.room; S.x = b.x; S.z = b.z; S.yaw = b.yaw; S.y = floorY(BY.get(b.room), b.x); }
  S.halt = true; return S;
}
/* ───────── a bot (the probes, the prototype check): walks to each opening's light the way a child learns ───────── */
/** o.two: use the ring (levels 2–3 must); o.rough: full speed into the jambs (to test the damage) */
export function bot(S, o = {}) {
  if (S.phase !== 'walk') return { free: true };
  if (S.halt) return { free: true };
  const G = goal(S); if (!G) return { free: true };
  const R = BY.get(S.room);
  // aim: the opening's mouth, then a point a little beyond it (straight through); for a hatch, its centre
  let ax = G.x, az = G.z;
  if (!G.hatch && G.via) { const V = BY.get(G.via); if (V) { const vx = (V.r[0] + V.r[2]) / 2, vz = (V.r[1] + V.r[3]) / 2; const J = JOINS.find((j) => (j.a === S.room && j.b === G.via) || (j.b === S.room && j.a === G.via)); if (J) { if (J.axis === 'x') { const s = Math.sign(vx - J.at) || 1, d = Math.abs(J.at - S.x); ax = J.at + s * 0.6; az = (J.lo + J.hi) / 2; if (d > 1.2) { ax = J.at - s * 1.0; } } else { const s = Math.sign(vz - J.at) || 1, d = Math.abs(J.at - S.z); az = J.at + s * 0.6; ax = (J.lo + J.hi) / 2; if (d > 1.2) az = J.at - s * 1.0; } } } }
  const want = yawOf(ax - S.x, az - S.z), d = wrap(want - S.yaw), dist = Math.hypot(ax - S.x, az - S.z);
  const out = { free: false };
  if (S.lv === 1 && !o.two) out.steer = want; else out.turn = Math.sign(d) * Math.min(Math.abs(d), 3.0 / 60);
  out.fwd = o.rough ? 1 : Math.abs(d) > 0.5 ? 0 : G.hatch ? Math.min(0.5, dist * 0.6 + 0.08) : Math.min(1, 0.35 + dist * 0.25);
  void R;
  return out;
}
