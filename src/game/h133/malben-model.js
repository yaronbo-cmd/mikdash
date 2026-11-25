/* ── build 133 ── h133/malben-model.js — work 2 "המלבן במרכז" (spec docs/specs/shlav-10-he.md, עבודה 2). Pure: no three.js, no DOM.
 * The frame of 28 × 28 (Zevachim 54a) hangs over the sovev's top on four ropes, one crew at each side. A drag from a crew outward (away
 * from the block, across its side) has that crew pull: the frame takes the pull late (0.5 s) and goes on after the thumb lifts, braking
 * by itself (about 1.2 s). It is one rigid body: as it comes north, the margin on the south grows by itself. Level 1: one axis (the north
 * and south crews locked); level 2: both; level 3: it comes shifted AND turned 3°, and a drag along a crew's side turns it. A hold on its
 * middle for half a second lowers it ("מרפים יחד"); the landing is judged on the four margins — each should be one amah (the step of the
 * sovev): within half a tefach 40, a tefach 20, two tefachim 10; a side farther than two tefachim strikes the sovev's edge (−20, a
 * crack stays). The start's shift and turn are fixed (rule 56).
 *
 *   MK · START · fresh(lv) · pull(S, side, px) · turn(S, side, px) · step(S, dt) · margins(S) · land(S) · result(S) · save · load
 */
export const MK = Object.freeze({
  REF_H: 420,
  GAIN: 0.026,          // (amah/s of impulse per px of drag on the 420-px screen: a quarter of the screen moves it about an amah)
  LAG: 0.5,             // (s: the pull reaches the frame this late)
  TAU: 0.42,            // (s: the frame's own braking; still in about 1.2 s)
  TURN: 0.036,          // (deg/s of impulse per px, level 3)
  HALF: 1 / 28,         // (the frame's half-side is 14: a turn of a degrees moves a corner 14·sin a)
  TEF: 1 / 6,
  GREEN: 1 / 6,         // (a side "green" while its margin is within a tefach of one amah)
  GREEN_DEG: 0.5,
  HOLD: 0.5,            // (s: the hold on the middle that lowers it)
  LIMIT: 1.5,           // (the most it may shift from the middle before a crew stops it; build 133: 1.5 — level 3 comes 1.2 off)
});
/** the start of each level (spec "רמות": the frame shifted, level 3 turned too) — fixed */
export const START = Object.freeze({ 1: Object.freeze({ dx: 1.4, dz: 0, a: 0 }), 2: Object.freeze({ dx: -1.1, dz: 0.9, a: 0 }), 3: Object.freeze({ dx: 0.9, dz: -1.2, a: 3 }) });
const SIDES = ['N', 'S', 'E', 'W'];
/** a crew's pull direction (world: x east, z south) */
export const DIR = Object.freeze({ N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] });

export function fresh(lv) {
  const L = Math.max(1, Math.min(3, lv | 0 || 1)), s = START[L];
  return { lv: L, dx: s.dx, dz: s.dz, a: s.a, vx: 0, vz: 0, va: 0, q: [], t: 0, landed: null, pulls: 0, free: true, n: 0, bumped: 0 };
}
/** the axes a level lets move: level 1 the east and west crews only */
export const can = (S, side) => S.lv >= 2 || side === 'E' || side === 'W';
/** a crew's pull, px of the drag (on the 420-px screen): queued, reaches the frame after LAG */
export function pull(S, side, px) {
  if (S.landed || !can(S, side) || !(px > 0)) return false;
  const d = DIR[side], k = MK.GAIN * px;
  S.q.push({ t: S.t + MK.LAG, vx: d[0] * k, vz: d[1] * k, va: 0 }); S.pulls++; S.n++;
  return true;
}
/** level 3: a drag along a crew's side turns the frame (+ counter-clockwise from above) */
export function turn(S, sign, px) {
  if (S.landed || S.lv < 3 || !(px > 0)) return false;
  S.q.push({ t: S.t + MK.LAG, vx: 0, vz: 0, va: Math.sign(sign) * MK.TURN * px }); S.n++;
  return true;
}
/** one step: the queued pulls land, the frame moves and brakes; a crew stops it at the sovev's edge → events */
export function step(S, dt) {
  const ev = []; if (S.landed) return ev;
  S.t += dt;
  while (S.q.length && S.q[0].t <= S.t) { const p = S.q.shift(); S.vx += p.vx; S.vz += p.vz; S.va += p.va; ev.push({ k: 'take' }); }
  const k = Math.exp(-dt / MK.TAU);
  S.dx += S.vx * dt; S.dz += S.vz * dt; S.a += S.va * dt;
  S.vx *= k; S.vz *= k; S.va *= k;
  if (S.lv < 2) { S.dz = 0; S.vz = 0; }
  for (const ax of ['dx', 'dz']) if (Math.abs(S[ax]) > MK.LIMIT) { S[ax] = Math.sign(S[ax]) * MK.LIMIT; S[ax === 'dx' ? 'vx' : 'vz'] = 0; S.bumped++; ev.push({ k: 'bump', ax }); }
  if (Math.abs(S.a) > 8) { S.a = Math.sign(S.a) * 8; S.va = 0; }
  return ev;
}
export const moving = (S) => Math.hypot(S.vx, S.vz) > 0.02 || Math.abs(S.va) > 0.05 || S.q.length > 0;
/** the four margins (amot, from the frame's nearest corner on that side to the sovev's edge; 1 when centred and square) */
export function margins(S) {
  const c = 14 * Math.sin((Math.abs(S.a) * Math.PI) / 180);   // (a turn pushes a corner of every side out by this much)
  return { N: 1 + S.dz - c, S: 1 - S.dz - c, E: 1 - S.dx - c, W: 1 + S.dx - c };
}
export function green(S) { const m = margins(S), o = {}; for (const k of SIDES) o[k] = Math.abs(m[k] - 1) <= MK.GREEN && (S.lv < 3 || Math.abs(S.a) <= MK.GREEN_DEG); return o; }
/** the landing: judged on the worst side → { grade, pts, crack: side | null, bonus, err } */
export function land(S) {
  if (S.landed) return S.landed;
  const m = margins(S), errs = SIDES.map((k) => [k, Math.abs(m[k] - 1)]), worst = errs.reduce((a, b) => (b[1] > a[1] ? b : a));
  const e = worst[1], T = MK.TEF;
  let grade = null, pts = 0, crack = null;
  if (e <= T / 2) { grade = 'gold'; pts = 40; } else if (e <= T) { grade = 'good'; pts = 20; } else if (e <= 2 * T) { grade = 'ok'; pts = 10; } else { crack = worst[0]; }
  const bonus = S.lv >= 3 && Math.abs(S.a) <= MK.GREEN_DEG ? 20 : 0;
  S.landed = { grade, pts, crack, bonus, err: +e.toFixed(4), a: +S.a.toFixed(3), m };
  S.n++;
  return S.landed;
}
/** the corner a cracked side strikes (the one farther out): N/S with E or W by the frame's shift */
export function crackCorner(S, side) { if (side === 'N' || side === 'S') return side + (S.dx >= 0 ? 'E' : 'W'); return (S.dz >= 0 ? 'S' : 'N') + side; }
export function result(S) {
  const L = S.landed || { pts: 0, bonus: 0, crack: null }, max = 40 + (S.lv >= 3 ? 20 : 0), pts = L.pts + L.bonus;
  const q = Math.max(0, Math.min(1, pts / max)), stars = L.crack ? 1 : q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1;
  return { pts, max, q, stars, perfect: !L.crack && L.grade === 'gold' && (S.lv < 3 || L.bonus > 0), flags: { err: L.err, a: L.a, crack: L.crack || null, pulls: S.pulls } };
}
export function save(S, id) { return { id, lv: S.lv, dx: S.dx, dz: S.dz, a: S.a, pulls: S.pulls, free: S.free, n: S.n }; }
export function load(b) { if (!b || !b.lv) return null; const S = fresh(b.lv); for (const k of ['dx', 'dz', 'a', 'pulls', 'free', 'n']) if (b[k] !== undefined) S[k] = b[k]; return S; }
