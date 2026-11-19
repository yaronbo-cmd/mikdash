/* ── build 116 ── h109/slope.js — the great stone "down the slope" (docs/specs/build116-brief.md §A): its track and its weight.
 * Pure: no three.js, no DOM. The act (acts3.js GREAT) draws and touches; this file says where the track runs and how the stone
 * answers: it is heavy, it answers late, it gathers speed on the steep, and it must be slowed BEFORE the bend.
 *
 *   makeTrack(pts) → { L, at(s) → { x, z, tx, tz, nx, nz, yaw, k }, near(x, z) → s, bend(s) → bool }
 *   SL → the numbers · limitAt(T, s, lv) → the safe speed here · stepStone(S, inp, env, dt) → events
 * Every number is amot, seconds, amot/s. The numbers are the brief's start, tuned by play (an illustration of the craft, not a source).
 */

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/** a smooth track through the points (centripetal Catmull–Rom), sampled every half amah, with its arc length and curvature */
export function makeTrack(pts, step = 0.5) {
  const P = pts.map(([x, z]) => ({ x, z }));
  const ext = [{ x: 2 * P[0].x - P[1].x, z: 2 * P[0].z - P[1].z }, ...P, { x: 2 * P[P.length - 1].x - P[P.length - 2].x, z: 2 * P[P.length - 1].z - P[P.length - 2].z }];
  const raw = [];
  for (let i = 1; i < ext.length - 2; i++) {
    const p0 = ext[i - 1], p1 = ext[i], p2 = ext[i + 1], p3 = ext[i + 2];
    const n = Math.max(4, Math.ceil(Math.hypot(p2.x - p1.x, p2.z - p1.z) / 0.25));
    for (let j = 0; j < n; j++) {
      const t = j / n, t2 = t * t, t3 = t2 * t;
      const f = (a, b, c, d) => 0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      raw.push({ x: f(p0.x, p1.x, p2.x, p3.x), z: f(p0.z, p1.z, p2.z, p3.z) });
    }
  }
  raw.push({ ...P[P.length - 1] });
  // even samples every `step` along the arc
  const S = [{ x: raw[0].x, z: raw[0].z, s: 0 }]; let acc = 0, need = step;
  for (let i = 1; i < raw.length; i++) {
    const a = raw[i - 1], b = raw[i]; let l = Math.hypot(b.x - a.x, b.z - a.z), u0 = 0;
    while (acc + l * (1 - u0) >= need) { const u = u0 + (need - acc) / l; S.push({ x: a.x + (b.x - a.x) * u, z: a.z + (b.z - a.z) * u, s: need }); acc = need; u0 = u; need += step; }
    acc += l * (1 - u0);
  }
  const last = raw[raw.length - 1]; if (Math.hypot(last.x - S[S.length - 1].x, last.z - S[S.length - 1].z) > 0.05) S.push({ x: last.x, z: last.z, s: acc });
  const L = S[S.length - 1].s;
  // heading and curvature (the turn of the heading per amah, over 4 amot)
  for (let i = 0; i < S.length; i++) { const a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)], d = Math.hypot(b.x - a.x, b.z - a.z) || 1; S[i].tx = (b.x - a.x) / d; S[i].tz = (b.z - a.z) / d; S[i].yaw = Math.atan2(S[i].tx, S[i].tz); }
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const span = Math.max(1, Math.round(2 / step));
  for (let i = 0; i < S.length; i++) { const a = S[Math.max(0, i - span)], b = S[Math.min(S.length - 1, i + span)]; S[i].k = wrap(b.yaw - a.yaw) / Math.max(0.5, b.s - a.s); }
  const at = (s) => {
    const f = clamp(s, 0, L) / step, i = Math.min(S.length - 2, Math.floor(f)), u = clamp(f - i, 0, 1), a = S[i], b = S[i + 1];
    const tx = a.tx + (b.tx - a.tx) * u, tz = a.tz + (b.tz - a.tz) * u, n = Math.hypot(tx, tz) || 1;
    return { s: clamp(s, 0, L), x: a.x + (b.x - a.x) * u, z: a.z + (b.z - a.z) * u, tx: tx / n, tz: tz / n, nx: -tz / n, nz: tx / n, yaw: Math.atan2(tx / n, tz / n), k: a.k + (b.k - a.k) * u };
  };
  /** the arc position nearest (x, z) */
  const near = (x, z) => { let bi = 0, bd = 1e18; for (let i = 0; i < S.length; i++) { const d = (S[i].x - x) ** 2 + (S[i].z - z) ** 2; if (d < bd) { bd = d; bi = i; } } return S[bi].s; };
  const BEND = 1 / 70;
  /** a bend here or just ahead (the safe speed of the bend holds from 5 amot before it) */
  const bend = (s) => { for (let d = -2; d <= 5; d += 1) if (Math.abs(at(s + d).k) > BEND) return true; return false; };
  return { L, at, near, bend, samples: S, step };
}

/** the numbers of the stone's weight, by level 1..3 (index 0..2) */
export const SL = Object.freeze({
  vmax: 6,                 // the asked speed at a full pull
  acc: 1.5,                // the crews paying out rope: how fast it gathers to the asked speed (plus the slope's push)
  B: [6, 5, 4.2],          // the crews' brake
  minBrake: 0.6,           // the brake always wins in the end: it never slows by less than this
  vs: [5, 5, 4.4],         // the safe speed on the straight
  vb: [3, 3, 2.6],         // the safe speed in a bend
  red: 0.7,                // the ropes start to redden at this share of the safe speed
  snapT: 0.7,              // over the safe speed this long: a rope snaps
  half: [3, 2.2, 1.5],     // the track's room each side of the stone's middle (past it: off the track)
  edge: 0.75,              // brushing the white stones: this share of the room
  steer: 0.25,             // the levers turn its nose (rad/s at a full side pull)
  rest: 0.3,               // … at rest a little (the levers alone)
  follow: [0.7, 0.4, 0.0], // how much the rollers' own line takes the bends for him (the rest is his steering)
  amax: 0.6,               // the nose never further off the line than this (rad)
  back: 1,                 // the crews haul it back at most this fast (on the level only)
  strike: 1.2,             // touching the wall faster than this: it strikes
  g: 9,                    // the slope's push: g × sin(slope)
});

/** the safe speed at s for level lv */
export function limitAt(T, s, lv = 1) { const i = clamp((lv | 0) - 1, 0, 2); return T.bend(s) ? SL.vb[i] : SL.vs[i]; }

/** one step of the stone.
 *  S { s, o, a, v, over } (along the track, sideways, nose off the line (rad), speed, time over the safe speed)
 *  inp { pull: −1..1 (forward; back only on the level), side: −1..1 (right +) }
 *  env { sin: the slope downhill along the track (+ down), k: the track's curvature here, lim: the safe speed here, lv }
 *  → { snap?: true, strain: v / lim } */
export function stepStone(S, inp, env, dt) {
  const i = clamp((env.lv | 0) - 1, 0, 2), g = SL.g * (env.sin || 0);
  const pull = clamp(inp.pull || 0, -1, 1), want = pull >= 0 ? pull * SL.vmax : Math.abs(env.sin || 0) < 0.05 ? pull * SL.back : 0;
  const lim = env.lim || SL.vs[i];
  let v = S.v;
  if (v < want) v = Math.min(want, v + (SL.acc + Math.max(0, g)) * dt);
  else if (v > want) {
    const brake = Math.max(SL.minBrake, SL.B[i] * (1 - 0.5 * Math.min(1, Math.abs(v) / Math.max(0.1, lim))) - (v > 0 ? g : -g));
    v = v > 0 ? Math.max(want, v - brake * dt) : Math.min(want, v + brake * dt);
  }
  S.v = v;
  // the nose: the levers turn it; the track's line turns under it (the rollers take a share of the bend for him)
  const k = env.k || 0, side = clamp(inp.side || 0, -1, 1);
  S.a += side * SL.steer * (SL.rest + Math.min(1, Math.abs(v) / 3) * (1 - SL.rest)) * dt;
  S.a += k * v * (1 - SL.follow[i]) * dt;   // (the line turning right (k < 0) leaves the nose to its left)
  S.a = clamp(S.a, -SL.amax, SL.amax);
  S.o += v * Math.sin(S.a) * dt;
  S.s += v * Math.cos(S.a) * dt;
  const strain = Math.abs(v) / Math.max(0.1, lim);
  const out = { strain };
  if (strain > 1) { S.over = (S.over || 0) + dt; if (S.over >= SL.snapT) { out.snap = true; S.over = 0; } }
  else S.over = Math.max(0, (S.over || 0) - dt * 2);
  return out;
}

/** the stone's state at a place, at rest */
export function restAt(s) { return { s, o: 0, a: 0, v: 0, over: 0 }; }
