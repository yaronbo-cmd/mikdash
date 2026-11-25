/* ── build 135 ── h135/mukhni-model.js — work 2 "המוכני" (spec docs/specs/shlav-12-he.md, עבודה 2; the kinematic drawing and the load
 * test: docs/specs/shlav-12-kinematika-he.md). Pure: no three.js, no DOM. Units: amot, seconds, turns (rev).
 *
 * THE MACHINE (spec v8): a horizontal axle on two posts over the pit, a drum on it over the kiyor, two copper chains wound on the
 * drum down to the kiyor's rim, a big vertical wheel at the axle's end. One turn of the wheel = one amah of chain paid out (the game's
 * illustration; the drawn drum is thicker than the true ratio would need). The kiyor's bottom = 19 − d (d the descent in amot, 0 … 9).
 * What holds it at rest is the axle's friction in its bearings and the shoe on the wheel (F_S static, F_K kinetic below). *
 * THE LOAD (rev/s² on the wheel, inertia 1): gravity A_G × Leff wants it down; Leff = L − B × s (s the kiyor's submerged fraction of its
 * 4 amot under the water line, 0 … 1; L 1 empty, 1.6 full at level 3; B 1.4 empty, 1.25 full). The thread's friction holds it at rest
 * (static F_S) while nothing touches the wheel; once touched, or moving, the kinetic F_K. The work finger couples to the rim (K × the
 * difference of speeds, at most T); the brake's shoe (0 … 1, the helping hand from level 2; automatic at level 1) takes up to BR.
 * The wheel never turns back (the pawl, the tongue, lets it only pay out — the rise after a descent is the game's own helper, not this
 * model's).
 *
 * A TURN (a step): 40 clean; 20 if faster than W_SAFE at any moment of it (the axle creaks); 10 if it stuck (the brake too hard while
 * the finger pushes: it stops, he lets go and tries again) or hit (faster than W_HIT when the bottom crosses the pit's rim (y 16), the
 * water (the sink line, from level 2) or reaches the stop: a dent, −20). Level 3: a sharp change of speed (more than JERK in a quarter
 * second) spills water out of the full kiyor (−20, no three stars).
 *   fresh(lv) · step(S, dt, inp) → events · result(S) · bottom(S) · sub(S) · save(S, id) / load(b)
 */
export const MK = Object.freeze({
  A_G: 0.9, F_S: 1.6, F_K: 0.25, BR: 1.7, K: 6, T: 0.6, T_PUSH: 0.85,   // (T_PUSH: b135 probe — a finger on the rim pushes harder than it holds back; at 0.6 the floating lv-2 kiyor (load −0.36) crawled: −0.36 + 0.6 − F_K < 0)
  W_SAFE: 0.5, W_HIT: 0.62, W_MAX: 1.4, STUCK: 0.6, JERK: 0.32, JERK_WIN: 0.25, SPLASH_GAP: 1.5,
  Y0: 19, H: 4, RIM: 16, SINK: 15, STOP: 10, AUTO_W: 0.34,
});
export const REVS = Object.freeze({ 1: 3, 2: 9, 3: 9 });
const LOAD = Object.freeze({ 1: [1, 0], 2: [1, 1.4], 3: [1.6, 1.25] });
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

export function fresh(lv = 1) {
  lv = clamp(lv | 0 || 1, 1, 3);
  return { lv, revs: REVS[lv], water: lv > 1, d: 0, w: 0, ang: 0, t: 0, steps: [], cur: fresh1(), flaws: [], hist: [], splashT: -9, stuckT: 0, crossed: {}, done: false, first: true, brake: 0, load: 0 };
}
const fresh1 = () => ({ maxW: 0, stuck: false, hit: false, t: 0 });
/** the kiyor's bottom (y) */
export const bottom = (S) => MK.Y0 - S.d;
/** the submerged fraction of the kiyor (under the sink line), 0 … 1 */
export function sub(S) { if (!S.water) return 0; return clamp((MK.SINK - bottom(S)) / MK.H, 0, 1); }
/** the load's pull (rev/s²) now */
export function pull(S) { const [L, B] = LOAD[S.lv]; return MK.A_G * (L - B * sub(S)); }

/**
 * one step of the machine. inp: { hold: the work finger on the rim, fw: the finger's own speed round the axis (rev/s, + = down),
 * brake: 0 … 1 (ignored at level 1: the automatic shoe) } → events [{ k: 'turn', i, grade } | 'creak' | 'stuck' | 'hit' | 'splash' |
 * 'stop' | 'water' | 'rim' | 'tick' (a spoke past the tongue) ]
 */
export function step(S, dt, inp = {}) {
  const ev = []; if (S.done || !(dt > 0)) return ev;
  S.t += dt; S.cur.t += dt;
  const hold = !!inp.hold, fw = Number.isFinite(inp.fw) ? inp.fw : 0;
  const g = pull(S); S.load = g;
  let b = S.lv === 1 ? autoBrake(S, g, hold, fw) : clamp(+inp.brake || 0, 0, 1);
  S.brake = b;
  const moving = S.w > 0.02;
  let a;
  if (!moving && !hold) {
    // at rest, nobody on the rim: the thread holds it (static), unless the load is past it
    if (g <= MK.F_S) { S.w = 0; a = 0; } else a = g - MK.F_K - MK.BR * b;
  } else {
    const tf = hold ? clamp(MK.K * (fw - S.w), -MK.T, MK.T_PUSH) : 0;
    a = g + tf - MK.F_K * (moving ? 1 : 0.5) - MK.BR * b * (moving ? 1 : 0.6);
  }
  const w0 = S.w;
  S.w = clamp(S.w + a * dt, 0, MK.W_MAX);
  // stuck: the finger pushes, the brake holds it, it does not move
  if (hold && fw > 0.15 && S.w < 0.04 && b > 0.3) { S.stuckT += dt; if (S.stuckT >= MK.STUCK && !S.cur.stuck) { S.cur.stuck = true; ev.push({ k: 'stuck' }); S.w = 0; } } else S.stuckT = 0;
  // level 3: a sharp change of speed spills the water in the kiyor
  S.hist.push([S.t, S.w]); while (S.hist.length > 2 && S.t - S.hist[0][0] > MK.JERK_WIN) S.hist.shift();
  if (S.lv === 3 && S.t - S.splashT > MK.SPLASH_GAP && Math.abs(S.w - S.hist[0][1]) > MK.JERK) { S.splashT = S.t; S.flaws.push({ f: 'mukhni.splash', at: +S.d.toFixed(2) }); ev.push({ k: 'splash' }); }
  const d0 = S.d;
  S.d = Math.min(S.revs, S.d + ((w0 + S.w) / 2) * dt);
  S.ang += (S.d - d0) * Math.PI * 2;
  if (S.w > S.cur.maxW) S.cur.maxW = S.w;
  if (S.w > MK.W_SAFE && w0 <= MK.W_SAFE) ev.push({ k: 'creak' });
  // the eight spokes past the tongue: a tick each
  if (Math.floor(S.d * 8) > Math.floor(d0 * 8)) ev.push({ k: 'tick' });
  // the crossings: the pit's rim, the water, the stop
  const cross = (y, key) => { const b0 = MK.Y0 - d0, b1 = MK.Y0 - S.d; if (b0 > y && b1 <= y && !S.crossed[key]) { S.crossed[key] = 1; ev.push({ k: key }); if (S.w > MK.W_HIT) hit(S, ev, key); } };
  cross(MK.RIM, 'rim');
  if (S.water) cross(MK.SINK, 'water');
  // a whole turn
  while (Math.floor(S.d + 1e-9) > S.steps.length && S.steps.length < S.revs) {
    const c = S.cur, grade = c.hit || c.stuck ? 'soft' : c.maxW > MK.W_SAFE ? 'good' : 'gold';
    S.steps.push({ i: S.steps.length, grade, maxW: +c.maxW.toFixed(3), stuck: c.stuck, hit: c.hit });
    ev.push({ k: 'turn', i: S.steps.length - 1, grade });
    S.cur = fresh1(); S.cur.maxW = S.w;
  }
  if (S.d >= S.revs - 1e-9) {
    if (S.w > MK.W_HIT && !S.crossed.stop) hit(S, ev, 'stop');
    S.crossed.stop = 1; S.w = 0; S.done = true; ev.push({ k: 'stop' });
  }
  return ev;
}
function hit(S, ev, where) {
  S.cur.hit = true;
  // (a dent at the crossing: the last turn's grade is 10 — the turn it happened in is still running, so it is the current one's; at the
  //  stop the last turn has already been counted: it is marked on it)
  if (where === 'stop' && S.steps.length) { const L = S.steps[S.steps.length - 1]; L.grade = 'soft'; L.hit = true; }
  S.flaws.push({ f: 'mukhni.dent', at: where });
  ev.push({ k: 'hit', where });
}
/** level 1's shoe: it keeps the wheel at AUTO_W (a gentle descent the finger leads) */
function autoBrake(S, g, hold, fw) {
  const tf = hold ? clamp(MK.K * (fw - S.w), -MK.T, MK.T_PUSH) : 0;
  const want = (g + tf - MK.F_K) + (S.w - MK.AUTO_W) * 4;
  return clamp(want / MK.BR, 0, 1);
}
/** the end (spec: every turn 40 = the work's bonus; three stars = every turn gold and no damage; level 3 a spill takes the third) */
export function result(S) {
  const n = S.steps.length || 1, pts = S.steps.reduce((a, s) => a + (s.grade === 'gold' ? 40 : s.grade === 'good' ? 20 : 10), 0);
  const gold = S.steps.filter((s) => s.grade === 'gold').length, dents = S.flaws.filter((x) => x.f === 'mukhni.dent').length, spills = S.flaws.filter((x) => x.f === 'mukhni.splash').length;
  const allGold = gold === S.steps.length && S.steps.length > 0;
  const stars = allGold && !dents && !spills ? 3 : !dents && gold / n >= 0.6 ? 2 : 1;
  return { stars, q: pts / (n * 40), pts, perfect: stars === 3, bonus: allGold && !dents, flags: { turns: S.steps.length, gold, dents, spills } };
}
export function save(S, id) { return { id, v: 1, lv: S.lv, steps: S.steps, flaws: S.flaws }; }
/** a reload in the middle: the turns done stand, the descent goes on from the last whole turn (the kiyor is drawn there) */
export function load(b) { if (!b || b.v !== 1) return null; const S = fresh(b.lv); S.steps = b.steps || []; S.flaws = b.flaws || []; S.d = S.steps.length; S.first = false; if (bottom(S) <= MK.RIM) S.crossed.rim = 1; if (S.water && bottom(S) <= MK.SINK) S.crossed.water = 1; return S; }
