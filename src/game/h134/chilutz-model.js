/* ── build 134 ── h134/chilutz-model.js — work 2 "חילוץ הגופים", one station (spec docs/specs/shlav-11-he.md, עבודה 2). Pure: no three.js,
 * no DOM. Rambam Beit HaBechira 2:16: "עד שישלים הבנין ויסיר הגופים שבתוך הבנין... וישארו הקרנות חלולין".
 * The pitch has caught the core at hidden points, FIXED for each corner and level (the spec's table). The work hand tilts the core (a drag
 * on its head: the drag's screen direction turned into a WORLD direction by the camera's yaw at the touch, and locked; 100 % = 3° = a
 * drag of a tenth of the screen's height): 0 … 80 % work, 80 … 100 % full (the rope creaks), 100 … 120 % over (half a second there leaves a
 * scuff), 120 % the hard stop. Tilting AWAY from a point lifts its side: a strip of light opens there (seen only from that side — the
 * helping hand turns the view). Held at 60 % or more within 30° of straight away from it for half a second, the point lets go ("טיק"),
 * and stays let go. Then a pull up on the rope's loop: a screen's height = 6 tefachim; at most 1.5 tefachim a second (over 80 % of it the
 * rope creaks and dust rises); faster, or with a point still caught, the core catches (a scuff on the inner wall on that side), and when
 * the finger lifts it sinks to the last safe height; over 4.5 tefachim a second the lip breaks (a FLAW, instead of the scuff). Out once it
 * has risen 5 tefachim. Level 2's core is stone: it answers 0.3 s late and swings past (the over range comes easily).
 * Steps: every point once (40 with no scuff on its side, else 20) and the pull (40 with no scuff, 20 with one, 10 with more); a clean
 * core (no scuff at all) +40.
 *   CK · POINTS · DIRS · fresh(corner, lv) · tiltTo · tiltEnd · step · pullBy · pullEnd · lights · result · save · load
 */
export const CK = Object.freeze({ FULL: 3, DRAG: 0.1, WORK: 0.8, OVER: 1.0, STOP: 1.2, REL: 0.6, CONE: 30, HOLD: 0.5, OVER_T: 0.5, LAG: 0.3,
  PULL_SCREEN: 6, SPEED: 1.5, CREAK: 0.8, BREAK: 4.5, OUT: 5, TEF: 1 / 6 });
const R2 = Math.SQRT1_2;
export const DIRS = Object.freeze({ N: [0, -1], NE: [R2, -R2], E: [1, 0], SE: [R2, R2], S: [0, 1], SW: [-R2, R2], W: [-1, 0], NW: [-R2, -R2] });
/** the points of each corner and level (the spec's table) */
export const POINTS = Object.freeze({
  SE: Object.freeze({ 1: ['E'], 2: ['E', 'N'], 3: ['NE', 'W', 'SW'] }),
  NE: Object.freeze({ 1: ['N'], 2: ['N', 'W'], 3: ['NW', 'S', 'E'] }),
  NW: Object.freeze({ 1: ['W'], 2: ['W', 'S'], 3: ['N', 'SE', 'W', 'SW'] }),
  SW: Object.freeze({ 1: ['S'], 2: ['S', 'E'], 3: ['SE', 'N', 'NW'] }),
});
export const HE = Object.freeze({ N: 'צפון', NE: 'צפון מזרח', E: 'מזרח', SE: 'דרום מזרח', S: 'דרום', SW: 'דרום מערב', W: 'מערב', NW: 'צפון מערב' });

export function fresh(corner, lv) {
  const L = Math.max(1, Math.min(3, lv | 0 || 1));
  return { corner, lv: L, pts: (POINTS[corner] || POINTS.SE)[L].map((d) => ({ d, done: false, scuff: false, hold: 0 })),
    dir: [1, 0], want: 0, k: 0, v: 0, q: [], over: 0, overHit: false, rise: 0, safe: 0, speed: 0, caught: false, broke: false, out: false,
    scuffs: 0, pullScuffs: 0, pullOn: false, t: 0, side: null, ev: [] };
}
/** the work hand on the core's head: a world direction (unit, x east, z south) and a tilt in units of FULL (0 … 1.2) */
export function tiltTo(S, dir, k) {
  const L = Math.hypot(dir[0], dir[1]); if (L > 1e-6) S.dir = [dir[0] / L, dir[1] / L];
  S.want = Math.max(0, Math.min(CK.STOP, k));
}
export function tiltEnd(S) { S.want = 0; }
const ang = (a, b) => Math.acos(Math.max(-1, Math.min(1, a[0] * b[0] + a[1] * b[1]))) * 180 / Math.PI;
export const allFree = (S) => S.pts.every((p) => p.done);
/** the clock → events [{ k: 'free', d } | { k: 'scuff', d, why } | { k: 'creak' }] */
export function step(S, dt) {
  const ev = []; S.t += dt;
  // (level 2: stone, late and swinging; levels 1 and 3 wood: the tilt follows at once)
  if (S.lv === 2) {
    S.q.push({ t: S.t, w: S.want }); while (S.q.length > 1 && S.q[1].t <= S.t - CK.LAG) S.q.shift();
    const w = S.q[0].t <= S.t - CK.LAG ? S.q[0].w : 0;
    const acc = (w - S.k) * 60 - S.v * 7.5; S.v += acc * dt; S.k = Math.max(0, Math.min(CK.STOP, S.k + S.v * dt)); if (S.k === CK.STOP || S.k === 0) S.v = 0;
  } else S.k = S.want;
  if (S.out) return ev;
  // the over range: half a second there leaves a scuff (once a lean)
  if (S.k > CK.OVER) { S.over += dt; if (S.over >= CK.OVER_T && !S.overHit) { S.overHit = true; ev.push(scuff(S, sideOf(S.dir), 'over')); } }
  else { S.over = 0; if (S.k < CK.WORK) S.overHit = false; }
  // a point lets go: 60 % or more, within 30° of straight away from it, for half a second
  for (const p of S.pts) {
    if (p.done) continue;
    const away = [-DIRS[p.d][0], -DIRS[p.d][1]];
    if (S.k >= CK.REL && ang(S.dir, away) <= CK.CONE) { p.hold += dt; if (p.hold >= CK.HOLD) { p.done = true; ev.push({ k: 'free', d: p.d, scuff: p.scuff }); } }
    else p.hold = 0;
  }
  return ev;
}
function sideOf(dir) { let best = 'E', bd = -2; for (const [k, v] of Object.entries(DIRS)) { const d = v[0] * dir[0] + v[1] * dir[1]; if (d > bd) { bd = d; best = k; } } return best; }
function scuff(S, d, why) {
  S.scuffs++;
  const p = S.pts.find((q) => q.d === d) || null; if (p) p.scuff = true;
  return { k: 'scuff', d, why };
}
/** the light strip of each still-caught point: how open (0 … 1) — tilting away lifts its side */
export function lights(S) {
  return S.pts.map((p) => { if (p.done) return { d: p.d, k: 0, done: true }; const away = [-DIRS[p.d][0], -DIRS[p.d][1]], c = S.dir[0] * away[0] + S.dir[1] * away[1]; return { d: p.d, k: Math.max(0, Math.min(1, c * S.k / CK.REL)), done: false, hold: p.hold / CK.HOLD }; });
}
/** a pull on the rope: dRise in tefachim over dt seconds → events */
export function pullBy(S, dRise, dt) {
  const ev = [];
  if (S.out || S.caught || dt <= 0) return ev;
  const v = Math.max(0, dRise) / dt; S.speed = S.speed * 0.6 + v * 0.4;
  if (dRise <= 0) return ev;
  S.pullOn = true;
  if (S.speed > CK.BREAK && !S.broke) { S.broke = true; S.caught = true; ev.push({ k: 'break' }); return ev; }
  const caughtPt = S.pts.find((p) => !p.done);
  if (caughtPt || S.speed > CK.SPEED) {
    S.caught = true; const d = caughtPt ? caughtPt.d : sideOf(S.dir);
    S.pullScuffs++; S.scuffs++; const p = S.pts.find((q) => q.d === d); if (p) p.scuff = true; ev.push({ k: 'scuff', d, why: caughtPt ? 'caught' : 'fast' });
    return ev;
  }
  if (S.speed > CK.SPEED * CK.CREAK) ev.push({ k: 'creak' });
  S.rise = Math.min(CK.OUT, S.rise + dRise); S.safe = S.rise;
  if (S.rise >= CK.OUT) { S.out = true; ev.push({ k: 'out' }); }
  return ev;
}
/** the finger off the rope: a caught core sinks to the last safe height */
export function pullEnd(S) { const was = S.caught; S.caught = false; S.speed = 0; S.rise = S.safe; return was; }
export function result(S, o = {}) {
  const steps = S.pts.map((p) => (p.scuff ? 20 : 40)); steps.push(S.scuffs === 0 ? 40 : S.scuffs === 1 ? 20 : 10);
  const pts = steps.reduce((a, b) => a + b, 0), max = steps.length * 40, gold = steps.filter((v) => v === 40).length;
  const flaws = (S.broke ? 1 : 0) + (o.flaws | 0), looks = S.scuffs;
  const stars = gold === steps.length && !flaws && !looks ? 3 : !flaws && gold / steps.length >= 0.7 ? 2 : 1;
  return { stars, q: pts / max, pts, perfect: stars === 3, clean: S.scuffs === 0, steps, flags: { scuffs: S.scuffs, broke: S.broke } };
}
export function save(S, id) { return { id, v: 1, corner: S.corner, lv: S.lv, pts: S.pts.map((p) => ({ d: p.d, done: p.done, scuff: p.scuff })), scuffs: S.scuffs, pullScuffs: S.pullScuffs, broke: S.broke, safe: S.safe }; }
export function load(b) {
  if (!b || b.v !== 1) return null; const S = fresh(b.corner, b.lv);
  (b.pts || []).forEach((q, i) => { if (S.pts[i] && S.pts[i].d === q.d) { S.pts[i].done = !!q.done; S.pts[i].scuff = !!q.scuff; } });
  S.scuffs = b.scuffs | 0; S.pullScuffs = b.pullScuffs | 0; S.broke = !!b.broke; S.rise = S.safe = +b.safe || 0; return S;
}
