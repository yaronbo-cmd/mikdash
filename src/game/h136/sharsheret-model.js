/* ── build 136 ── h136/sharsheret-model.js — work 3 "שרשראות הזהב, פרח כהונה", the model (spec docs/specs/shlav-13-he.md v4, עבודה 3).
 * Pure. "ושרשרות של זהב היו קבועות בתקרת האולם, שבהן פרחי כהונה עולין ורואין את העטרות" (Middot 3:8).
 * Two chains 0.8 apart (z −15.4 and −14.6: המחשה), the kohen between them, a hand on each: R (gold, the north chain) and L (sky blue,
 * the south chain). The hand that goes up is the work hand; the one that holds carries him and steadies the swing; they change at
 * every grab (the bracelets do not).
 * CLIMB (a step = a grab): drag a hand up; the gold ring marks the link nearest the thumb within RANGE (2.5; level 3 2.7 — the spec's
 * own fallback, step 0: 44 amot in 18 grabs leave no room at 2.5) over the other hand; lift the thumb and the hand takes that link; no
 * ring (too far) and it returns to the link it left: no slip, no damage. A hand in the air keeps the other from letting go: never two in
 * the air, never a fall.
 * THE SWING: with a hand in the air the body hangs from the other, the weight goes to its side (the rest point shifts toward the holding
 * chain) and both chains swing together as a pendulum — its pace fixed and predictable by the length under the ceiling, faster as he
 * climbs. Lifting a hand also gives it a nudge (weak / real / strong by level). A small sideways drag of the HOLDING hand: AGAINST the
 * body's motion it calms (−30% of the swing), WITH it while the body passes the middle it pumps (+0.1, as a swing): a spark on the
 * bracelet when a drag "took". Each grab is graded by the swing then: 40 ≤ 0.1, 20 ≤ 0.25, 10 above; at level 3 a grab at the swing's
 * edge (over 0.4) crushes a link (−20; it stays marked).
 * THE TOP (hands at y 86): the view is his eyes; the holding hand locks by itself; one thumb dragged on the open hall turns the body round
 * the chain (100 dp = 30°; ±85° from west — the spec's ±70° cannot reach Yedaiah at 77° nor Hen at 81° from the chains: widened, step 0);
 * a finger on the holding hand dragged a little sideways steadies (the turn stops meanwhile). A crown is seen when it sits in the centre
 * circle and the swing is under its threshold for a second: a ray from the window under it touches the gold, its name shows: 40 each.
 *   helem z −20: near, steady (0.1) · tuviah z −8: half hidden behind the other chain — turn past it until the chain is out of the line
 *   (0.1) · yedaiah z 8: far, really steady (0.05) · hen z 20: far and dark — only its GLINT: the sun from its window off the gold into a
 *   narrow zone 0.6 south of the eyes at rest; swing on purpose until, at the swing's edge, the eyes pass through it: on two swing edges
 *   in a row Hen in the circle for 0.3 s while the eyes are in the zone. The swing that was the enemy all the way up becomes the tool.
 * Levels: 1 from the scaffold at y 72: 6 grabs, Helem, a weak swing, ONE thumb (each drag moves the lower hand, the other holds by itself);
 * 2 from the opening's head y 62: 10 grabs, Helem and Tuviah, a real swing; 3 from the Heichal's door's head y 42: 18 grabs, all four.
 * Units: amot, seconds, degrees. Nothing random. */
import { BOOK } from '../world/grid.js';

const S13 = BOOK.s13, CH = S13.chains;
export const SH = Object.freeze({
  G: 60,                           // the swing's "gravity" (amah/s²): its period 2π√(L/G) — 5.9 s from y 42, 3.9 from 72, 2.4 at the top
  RANGE: { 1: 2.5, 2: 2.5, 3: 2.7 }, LINK: CH.link,
  NUDGE: { 1: 0.01, 2: 0.03, 3: 0.04 }, SHIFT: { 1: 0.02, 2: 0.04, 3: 0.05 },
  DAMP: 0.04, CALM: 0.7, PUMP: 0.1, EDGE: 0.4,
  GRADE: [0.1, 0.25],
  TOP: CH.hands, EYE: CH.eye - CH.hands,
  TURN: 0.3, YAW_MAX: 85, CIRCLE: 7, SEE_T: 1.0,
  CROWNS: { 1: ['helem'], 2: ['helem', 'tuviah'], 3: ['helem', 'tuviah', 'yedaiah', 'hen'] },
  STEADY: { helem: 0.1, tuviah: 0.1, yedaiah: 0.05, hen: 9 },
  HEN_T: 0.3, GLINT_R: S13.glint.r, GLINT_Z: S13.glint.z - CH.zc,
  HIDE: [-4, 1],                   // tuviah: the other chain covers it while the view is this many degrees from it
});
export const crownOf = (k) => S13.crowns.find((c) => c.k === k);
export function fresh(lv) {
  const y0 = CH.start[lv] || CH.start[1];
  const S = { lv, y0, h: { R: y0 + 2.2, L: y0 + 1.8 }, air: null, tgt: null, s: 0, v: 0, eq: 0, top: false, yaw: 0, yawV: 0, steady: false,
    crowns: SH.CROWNS[lv].slice(), seen: [], seeT: 0, hen: { n: 0, in: false, acc: 0, lastSide: 0 }, steps: [], flaws: [], first: true, t: 0, done: false, sparkT: 0, grabs: 0 };
  return S;
}
const lenNow = (S) => Math.max(4, CH.top - Math.max(S.h.R, S.h.L));
export const omega = (S) => Math.sqrt(SH.G / lenNow(S));
export const swingAmp = (S) => Math.sqrt((S.s - S.eq) ** 2 + (S.v / omega(S)) ** 2);
export const low = (S) => (S.h.R <= S.h.L ? 'R' : 'L');
export const other = (k) => (k === 'R' ? 'L' : 'R');
/** the highest link a hand may take now (the other hand's height + the range), and a want snapped to a link */
export function reach(S, k) { return S.h[other(k)] + (SH.RANGE[S.lv] || 2.5); }
export function snap(S, k, want) {
  const R = reach(S, k), top = Math.min(R, SH.TOP), y = Math.round(want / SH.LINK) * SH.LINK;
  if (want > R + SH.LINK * 0.5) return null;   // (too far: no ring)
  if (y <= S.h[k] + SH.LINK * 0.5) return null;  // (not higher: no ring)
  return Math.min(top, y);
}
/** he takes a hand off its link (only when the other holds) */
export function lift(S, k) {
  if (S.top || S.air || S.done) return false;
  S.air = k; S.tgt = null; S.from = S.h[k];
  // the weight goes to the holding chain's side (L is south, +z): the rest point shifts; a nudge by level
  const side = k === 'R' ? 1 : -1;
  S.eq = side * (SH.SHIFT[S.lv] || 0.05);
  S.v += side * (SH.NUDGE[S.lv] || 0.05) * omega(S);
  return true;
}
/** the thumb's want while it drags the hand: the ring on the nearest link in reach (or none) */
export function aim(S, want) { if (!S.air) return null; S.tgt = snap(S, S.air, want); return S.tgt; }
/** the thumb lifts: the hand takes the marked link, or returns */
export function grab(S, ev = []) {
  if (!S.air) return ev;
  const k = S.air, y = S.tgt; S.air = null; S.eq = 0;
  if (y == null) { S.h[k] = S.from; ev.push({ k: 'back', hand: k }); return ev; }
  // (graded by the swing about the middle, where it will hang once both hands hold: grab quick, before the weight swings it out)
  const a = Math.abs(S.s), A = Math.sqrt(S.s * S.s + (S.v / omega(S)) ** 2);
  S.h[k] = y; S.grabs++;
  let grade = A <= SH.GRADE[0] ? 'gold' : A <= SH.GRADE[1] ? 'good' : 'ok';
  const edge = a > SH.EDGE;
  if (edge) ev.push({ k: 'bump', hand: k });
  if (S.first) { S.first = false; if (grade !== 'gold') { ev.push({ k: 'free', amp: +A.toFixed(3) }); grade = 'gold'; } }
  else if (S.lv === 3 && edge) { S.flaws.push({ f: 'sharsheret.link', at: +y.toFixed(2) }); ev.push({ k: 'crush', y }); }
  const st = { grade, amp: +A.toFixed(3), y: +y.toFixed(2), hand: k };
  S.steps.push(st); ev.push({ k: 'grab', ...st });
  if (Math.max(S.h.R, S.h.L) >= SH.TOP - 1e-6) { S.top = true; S.h.R = S.h.L = SH.TOP; S.eq = 0; ev.push({ k: 'top' }); }
  return ev;
}
/** a sideways drag of the holding hand (dir +1 = toward south, +z): calm or pump */
export function nudge(S, dir, ev = []) {
  const A = swingAmp(S), rel = S.s - S.eq, mov = Math.sign(S.v);
  if (A > 0.005 && mov && dir === -mov) {
    // against the motion: calm
    S.v *= SH.CALM; S.s = S.eq + rel * SH.CALM; ev.push({ k: 'calm' }); S.sparkT = 0.4;
  } else if (dir && (A < 0.02 || (mov === dir && Math.abs(rel) < 0.35 * Math.max(A, 0.05)))) {
    // with it, through the middle: pump
    S.v += dir * SH.PUMP * omega(S); ev.push({ k: 'pump' }); S.sparkT = 0.4;
  } else ev.push({ k: 'miss' });
  return ev;
}
/** the view's yaw to a crown (deg, + toward south) from the eyes (their z by the swing) */
export function yawTo(S, k) { const c = crownOf(k), ez = CH.zc + S.s; return (Math.atan2(c.z - ez, CH.x - c.x) * 180) / Math.PI; }
export function step(S, dt, inp = {}) {
  const ev = []; if (S.done) return ev;
  S.t += dt; S.sparkT = Math.max(0, S.sparkT - dt);
  // the pendulum (both chains together)
  const w = omega(S);
  S.v += (-w * w * (S.s - S.eq) - SH.DAMP * S.v) * dt; S.s += S.v * dt;
  if (!S.top) return ev;
  // the top: turn and see
  S.steady = !!inp.steady;
  if (!S.steady && inp.turn) S.yaw = Math.max(-SH.YAW_MAX, Math.min(SH.YAW_MAX, S.yaw + inp.turn));
  const A = swingAmp(S);
  const next = S.crowns.find((k) => !S.seen.includes(k));
  if (!next) { if (!S.done) { S.done = true; ev.push({ k: 'done' }); } return ev; }
  if (next === 'hen') {
    // the glint: the eyes (z offset s) in the zone at a swing's edge, Hen in the circle
    const inZone = Math.abs(S.s - SH.GLINT_Z) <= SH.GLINT_R, inCircle = Math.abs(S.yaw - yawTo(S, 'hen')) <= SH.CIRCLE;
    if (inZone && inCircle) { S.hen.in = true; S.hen.acc += dt; }
    // a pass ends when the eyes leave the zone
    if (!inZone && S.hen.in) { S.hen.in = false; if (S.hen.acc >= SH.HEN_T) { S.hen.n++; ev.push({ k: 'glint', n: S.hen.n }); } else S.hen.n = 0; S.hen.acc = 0; }
    // (a whole swing with no pass resets the count: the eyes went back to the north side)
    if (S.s < -0.05 && S.hen.n && !S.hen.in && S.hen.lastSide > 0) S.hen.n = S.hen.n;   // (kept: the next edge must come)
    S.hen.lastSide = Math.sign(S.s);
    if (S.hen.n >= 2) see(S, 'hen', ev);
    return ev;
  }
  const dy = S.yaw - yawTo(S, next), hid = next === 'tuviah' && dy >= SH.HIDE[0] && dy <= SH.HIDE[1];
  if (Math.abs(dy) <= SH.CIRCLE && !hid && A <= SH.STEADY[next]) { S.seeT += dt; if (S.seeT >= SH.SEE_T) see(S, next, ev); }
  else S.seeT = Math.max(0, S.seeT - dt * 2);
  return ev;
}
function see(S, k, ev) { S.seen.push(k); S.seeT = 0; S.hen = { n: 0, in: false, acc: 0, lastSide: 0 }; S.steps.push({ grade: 'gold', crown: k }); ev.push({ k: 'crown', crown: k }); }
export function result(S) {
  const n = S.steps.length || 1, pts = S.steps.reduce((a, s) => a + (s.grade === 'gold' ? 40 : s.grade === 'good' ? 20 : 10), 0);
  const gold = S.steps.filter((s) => s.grade === 'gold').length, flaws = S.flaws.length;
  const allGold = gold === S.steps.length && S.steps.length > 0 && S.seen.length === S.crowns.length;
  const stars = allGold && !flaws ? 3 : !flaws && gold / n >= 0.6 ? 2 : 1;
  return { stars, q: pts / (n * 40), pts, perfect: stars === 3, bonus: allGold && !flaws, flags: { grabs: S.grabs, gold, flaws, crowns: S.seen.length } };
}
export function save(S, id) { return { id, v: 1, lv: S.lv, flaws: S.flaws }; }
/** a reload: he starts again at the level's start (spec "ביצוע חוזר"); crushed links stay */
export function load(b) { if (!b || b.v !== 1) return null; const S = fresh(b.lv); S.flaws = b.flaws || []; S.first = false; return S; }

/* ───────── a bot (step 0, the probes) ───────── */
export function bot(S, o = {}) {
  if (S.done) return {};
  if (!S.top) {
    const A = Math.sqrt(S.s * S.s + (S.v / omega(S)) ** 2);
    if (!S.air) {
      // calm first when the swing is big (a drag against the motion), else lift the lower hand
      if (A > (o.calmAt || 0.06)) return Math.abs(S.v) > 0.03 ? { nudge: -Math.sign(S.v) } : {};
      return { lift: low(S) };
    }
    // in the air: aim at the highest link in reach, grab when the body is near the middle and slow
    const want = reach(S, S.air) - 0.05;
    return { aim: want, grab: true };
  }
  const next = S.crowns.find((k) => !S.seen.includes(k)); if (!next) return {};
  if (next === 'hen') {
    const tg = yawTo(S, 'hen'), dy = tg - S.yaw;
    if (Math.abs(dy) > 1) return { turn: Math.sign(dy) * Math.min(Math.abs(dy), 2) };
    // pump until the eyes reach the zone at the edge: amplitude ~ GLINT_Z
    const A = swingAmp(S);
    if (A < SH.GLINT_Z + 0.02 && Math.abs(S.s) < 0.35 * Math.max(A, 0.05)) return { nudge: Math.sign(S.v) || 1 };
    if (A > SH.GLINT_Z + SH.GLINT_R - 0.05 && Math.abs(S.v) > 0.1) return { nudge: -Math.sign(S.v), steadyOff: true };
    return {};
  }
  const tg = yawTo(S, next) + (next === 'tuviah' ? 3 : 0), dy = tg - S.yaw;
  if (swingAmp(S) > SH.STEADY[next] * 0.8) return { steady: true, nudge: -Math.sign(S.v) || 0 };
  if (Math.abs(dy) > 0.5) return { turn: Math.sign(dy) * Math.min(Math.abs(dy), 2) };
  return {};
}
