/* ── build 136 ── h136/maltra-model.js — work 1 "חמש המלתראות", the model (spec docs/specs/shlav-13-he.md v4, עבודה 1). Pure.
 * THE MODEL (spec "החבלים: הפיזיקה"): the lintel is a rigid body hanging at its centre on a short loop (Lp 3) from the crane's hook.
 *   · the hook is a fixed point (the machine does not move while he guides); the centre is a pendulum: a restoring force −(W/Lp)·r toward
 *     the rest point (0.3 amah off the face, right over the place); the hook turns freely about y (no restoring torque), light damping,
 *     I = mL²/12 (m ∝ L: beam 5 is 1.36 the mass and 2.54 the moment of beam 1 — ChatGPT's figures);
 *   · each tag line pulls its END toward the kohen at the steps' foot (x −54.5, z 0): tension 0 … Tmax = 0.15 W by the drag's depth; its
 *     horizontal part is 40% (the line comes down steeply), along (0.87, ±0.49) at beam 1 and (0.80, ±0.61) at beam 5;
 *   · one line: the beam turns (that end goes east) and the centre moves a little (full: ~0.16 east, ~0.09 to the middle);
 *     both equal: the torques and the inward parts cancel, a net force east (~0.3 amah at full) — damping costs distance, so PULSES;
 *   · the face: a beam end touching it in the hanging is a soft knock, no damage, a little spin added.
 * QUIET: both ends' sway under 0.1 and the centre within 0.1 of rest for 0.5 s → the lines glow. RELEASE: both thumbs off within 0.65 s (0.45 in the spec; build 136's review: ChatGPT and Gemini, too thin)
 * (one already slack: the other alone); a taut line let go outside the window gives its end a 3° shove and the quiet starts again.
 * LANDING (2 s down): two grades, the step takes the lower: parallel (the ends' distance from the face differs by L·|sin θ|: 40 ≤ 0.15,
 * 20 ≤ 0.3, 10 ≤ 0.45) and overhang (the two sides differ by 2|dz|: 40 ≤ 0.15, 20 ≤ 0.3, 10 ≤ 0.5); level 1 doubles the thresholds.
 * Worse than the 10 line: the far end strikes the face (a scratch on the painted beam) or an end lands on the course's edge (a broken
 * stone): −20, the machine lifts it, the step goes on capped at 20. The work's first landing is a free try.
 * The levels (spec "טבלת הרמות"): 1 = beams 1–2 (22, 24), the place's shadow, the thresholds doubled, one thumb (the other line damped
 * by the machine); 2 = beams 3–4 (26, 28): the north–south sway and its coupling; 3 = beam 5 (30) and the top course: announced gusts
 * from the north every 6 s (the flag flaps a second before), each pushing 0.4 amah south.
 * Units: amot, seconds, radians inside (degrees in the tables). Nothing random. */
import { BOOK } from '../world/grid.js';

const S13 = BOOK.s13, MA0 = S13.maltra;
const RAD = Math.PI / 180;
export const ML = Object.freeze({
  W0: 2.0,             // the pendulum's angular frequency (rad/s): −(W/Lp)·r per unit mass = −W0²·r
  CD: 0.7,             // the centre's damping (1/s)
  YD: 0.10,            // the hook's turning damping (1/s)
  F1: 0.72,            // one line at full tension, its horizontal part per unit mass (amah/s²): 0.4 · 0.15 · W0² · Lp
  QUIET: 0.1, QUIET_T: 0.5, WINDOW: 0.65, SHOVE: 3, DROP_T: 2.0, LIFT_T: 1.6, COURSE_T: 1.4,
  PAR: [0.15, 0.3, 0.45], OVER: [0.15, 0.3, 0.5],
  KNOCK_E: 0.35,       // the face's give: the end's speed into it comes back at this part
  GUST: 0.5, GUST_T: 1.0, GUST_EVERY: 6, GUST_WARN: 1, GUST_FIRST: 4,   // (a gust: a push of 0.5 amah/s² on average over a second; unopposed it moves the beam ~0.3 amah — the spec's 0.4 tuned in step 0 so that a pulse against it can stop it)
  AUTO_K: 3.0,         // level 1: the machine's line tension per amah/s of its end's speed toward the face
  ARRIVE_T: 2.2, ARRIVE_X: 1.6,   // the hook swings the beam in from 1.6 amot out over 2.2 s (the beam turning as it comes)
  SLACK: 0.08,
});
/** what each beam brings (spec table): its spin (deg/s), its start angle (deg), sway (amah), gusts, shadow */
export const BEAMS = Object.freeze([
  { i: 0, spin: 4, ang: 8, sway: 0, gust: false, shadow: true },
  { i: 1, spin: 8, ang: 12, sway: 0, gust: false, shadow: true },
  { i: 2, spin: 8, ang: 12, sway: 0, gust: false, shadow: false },
  { i: 3, spin: 6, ang: 10, sway: 0.6, gust: false, shadow: false },
  { i: 4, spin: 3, ang: 10, sway: 0, gust: true, shadow: false },
]);
export const LEVEL_BEAMS = Object.freeze({ 1: [0, 1], 2: [2, 3], 3: [4] });
const lenOf = (i) => MA0.beams[i].len;
const massOf = (i) => lenOf(i) / 22;
/** the unit direction of a line from an end (its world x, z) to the kohen (horizontal) */
export function lineDir(xe, ze) { const dx = MA0.handler[0] - xe, dz = MA0.handler[1] - ze, L = Math.hypot(dx, dz) || 1; return [dx / L, dz / L]; }
export function fresh(lv) {
  const list = LEVEL_BEAMS[lv] || LEVEL_BEAMS[1];
  const S = { lv, list, k: 0, steps: [], flaws: [], first: true, t: 0, two: false, done: false, bonus: 0 };
  arrive(S);
  return S;
}
/** the next beam comes up: swung in from the east, at its own angle and spin (and sway) */
export function arrive(S) {
  const i = S.list[S.k], B = BEAMS[i], R = MA0.rest(i);
  S.b = { i, L: lenOf(i), m: massOf(i), I: (massOf(i) * lenOf(i) * lenOf(i)) / 12, rx: R.x, ry: R.y };
  S.cx = ML.ARRIVE_X; S.cz = 0; S.vx = 0; S.vz = B.sway ? B.sway * ML.W0 : 0; S.th = B.ang * RAD; S.w = B.spin * RAD;
  S.hook = ML.ARRIVE_X;      // (the hook's own offset east of rest: it comes in over ARRIVE_T)
  S.T = [0, 0]; S.auto = [0, 0]; S.held = [false, false]; S.taut = [false, false];
  S.phase = 'arrive'; S.pt = 0; S.quiet = 0; S.glow = false; S.win = null; S.y = 0; S.cap = 0; S.tries = 0; S.gust = { t: 0, warn: false }; S.knockT = 0;
  S.two = false;
  return S;
}
/** the ends: north (k 0, z −L/2) and south (k 1, z +L/2); their x offsets from the rest centre, their gaps to the face */
export function ends(S) {
  const h = S.b.L / 2, s = Math.sin(S.th), c = Math.cos(S.th);
  const n = { x: S.cx + h * s, z: S.cz - h * c }, so = { x: S.cx - h * s, z: S.cz + h * c };
  const gap = (e) => MA0.restGap + e.x;   // (the end's distance from the face: the rest gap and its x offset)
  return [{ ...n, gap: gap(n), v: S.vx + h * c * S.w }, { ...so, gap: gap(so), v: S.vx - h * c * S.w }];
}
/** the centre's sway amplitude (its offset from rest and its speed, in amot) */
export const amp = (S) => Math.sqrt((S.cx - S.hook) ** 2 + S.cz * S.cz + (S.vx * S.vx + S.vz * S.vz) / (ML.W0 * ML.W0));
export const endSpeed = (S) => Math.abs(S.w) * S.b.L / 2;
/** the two grades of a landing as it stands (spec step 5) */
export function grades(S) {
  const k = S.lv === 1 ? 2 : 1, par = S.b.L * Math.abs(Math.sin(S.th)), over = 2 * Math.abs(S.cz);
  const g = (v, T) => (v <= T[0] * k ? 40 : v <= T[1] * k ? 20 : v <= T[2] * k ? 10 : 0);
  return { par, over, gp: g(par, ML.PAR), go: g(over, ML.OVER) };
}
/** one step of dt. inp: { T: [tN, tS] (0..1, the thumbs' tensions; null = no thumb on that line) } → events */
export function step(S, dt, inp = {}) {
  const ev = []; if (S.done) return ev;
  S.t += dt; S.pt += dt; S.knockT = Math.max(0, S.knockT - dt);
  const B = BEAMS[S.b.i], th = inp.T || [null, null];
  // the thumbs: tension and holding; level 1 the line without a thumb is the machine's (damping only), while the other is held
  for (let k = 0; k < 2; k++) {
    const t = th[k];
    if (t != null) { S.held[k] = true; S.T[k] = Math.max(0, Math.min(1, t)); }
    else { if (S.held[k]) S.held[k] = false; S.T[k] = 0; }
  }
  if (S.held[0] && S.held[1]) S.two = true;
  const E = ends(S);
  if (S.lv === 1 && (S.phase === 'hang' || S.phase === 'arrive')) {
    for (let k = 0; k < 2; k++) {
      const o = 1 - k;
      S.auto[k] = !S.held[k] && S.held[o] ? Math.max(0, Math.min(1, ML.AUTO_K * Math.max(0, -E[k].v))) : 0;
    }
  } else S.auto[0] = S.auto[1] = 0;
  const Te = [Math.max(S.T[0], S.auto[0]), Math.max(S.T[1], S.auto[1])];
  // the release window (spec step 4)
  const tautNow = [S.T[0] > ML.SLACK, S.T[1] > ML.SLACK];   // (the machine's line at level 1 is not his: it lets go with his)
  if (S.phase === 'hang') {
    for (let k = 0; k < 2; k++) {
      if (S.taut[k] && !tautNow[k] && !S.held[k]) {
        // a taut line let go
        if (S.win && S.win.k !== k && S.t - S.win.t <= ML.WINDOW) { S.win = null; if (S.glow) { drop(S, ev); break; } }
        else if (!tautNow[1 - k]) { if (S.glow) { drop(S, ev); break; } }
        else S.win = { k, t: S.t };
      }
    }
    if (S.win && S.t - S.win.t > ML.WINDOW) {
      // the window closed with the other line still taut: the first one's end gets a 3° shove, the quiet starts again
      const k = S.win.k; S.win = null; S.w += (k === 0 ? 1 : -1) * ML.SHOVE * RAD; S.quiet = 0; S.glow = false; ev.push({ k: 'shove', end: k });
    }
  }
  S.taut = tautNow;
  // forces (per unit mass)
  let ax = 0, az = 0, al = 0;
  if (S.phase === 'arrive' || S.phase === 'hang' || S.phase === 'drop') {
    for (let k = 0; k < 2; k++) {
      if (Te[k] <= 0) continue;
      const e = E[k], d = lineDir(MA0.rest(S.b.i).x + e.x, e.z), F = ML.F1 * Te[k];
      ax += F * d[0]; az += F * d[1];
      al += (k === 0 ? 1 : -1) * ((S.b.L / 2) * F * d[0] * S.b.m) / S.b.I;
    }
    ax += -ML.W0 * ML.W0 * (S.cx - S.hook) - ML.CD * S.vx;
    az += -ML.W0 * ML.W0 * S.cz - ML.CD * S.vz;
    al += -ML.YD * S.w;
    // the gusts (level 3: from the north, announced by the flag a second before; steady every 6 s)
    if (B.gust && (S.phase === 'hang' || S.phase === 'drop')) {
      S.gust.t += dt; const ph = (S.gust.t - ML.GUST_FIRST) % ML.GUST_EVERY, n = Math.floor((S.gust.t - ML.GUST_FIRST) / ML.GUST_EVERY);
      S.gust.warn = S.gust.t > ML.GUST_FIRST - ML.GUST_WARN && (ph > ML.GUST_EVERY - ML.GUST_WARN || ph < 0.3);
      if (S.gust.t >= ML.GUST_FIRST && n !== S.gust.n) { S.gust.n = n; ev.push({ k: 'gust' }); }
      if (S.gust.t >= ML.GUST_FIRST && ph < ML.GUST_T) { const s = Math.sin((Math.PI * ph) / ML.GUST_T); az += ML.GUST * 2 * s * s; S.gust.on = true; } else S.gust.on = false;
    }
    S.vx += ax * dt; S.vz += az * dt; S.w += al * dt;
    S.cx += S.vx * dt; S.cz += S.vz * dt; S.th += S.w * dt;
  }
  if (S.phase === 'arrive') {
    S.hook = ML.ARRIVE_X * Math.max(0, 1 - S.pt / ML.ARRIVE_T);
    if (S.pt >= ML.ARRIVE_T) { S.hook = 0; S.phase = 'hang'; S.pt = 0; ev.push({ k: 'hang' }); }
  }
  // the face: an end that touches it is a soft knock (no damage, a little spin)
  if (S.phase === 'arrive' || S.phase === 'hang' || S.phase === 'drop') {
    const E2 = ends(S);
    for (let k = 0; k < 2; k++) {
      const e = E2[k];
      if (e.gap < 0) {
        const sg = k === 0 ? 1 : -1, h = S.b.L / 2;
        // the position: half by the centre, half by the turn
        S.cx += -e.gap * 0.5; S.th += sg * (-e.gap * 0.5) / h;
        if (e.v < 0) { const J = -(1 + ML.KNOCK_E) * e.v / (1 / S.b.m + (h * h) / S.b.I) * 0.5; S.vx += J / S.b.m; S.w += (sg * h * J) / S.b.I; }
        if (S.knockT <= 0) { S.knockT = 0.35; ev.push({ k: 'knock', end: k }); }
      }
    }
  }
  // the quiet (spec step 3)
  if (S.phase === 'hang') {
    const q = amp(S) < ML.QUIET && endSpeed(S) < ML.QUIET;   // (the ends: their drift over a second under 0.1)
    S.quiet = q ? S.quiet + dt : 0;
    const g0 = S.glow; S.glow = S.quiet >= ML.QUIET_T;
    if (S.glow && !g0) ev.push({ k: 'glow' });
    // nothing held, nothing taut, the quiet on: a tap on a handle releases (the act sends inp.tap)
    if (S.glow && inp.tap && !tautNow[0] && !tautNow[1]) drop(S, ev);
  }
  if (S.phase === 'drop') {
    S.y = Math.min(1, S.pt / ML.DROP_T);
    if (S.pt >= ML.DROP_T) land(S, ev);
  } else if (S.phase === 'lift') {
    S.y = Math.max(0, 1 - S.pt / ML.LIFT_T);
    if (S.pt >= ML.LIFT_T) { S.phase = 'hang'; S.pt = 0; S.quiet = 0; S.glow = false; S.hook = 0; ev.push({ k: 'hang' }); }
  } else if (S.phase === 'course') {
    if (S.pt >= ML.COURSE_T) {
      S.k++;
      if (S.k >= S.list.length) { S.done = true; S.phase = 'done'; ev.push({ k: 'done' }); }
      else { arrive(S); ev.push({ k: 'arrive', i: S.b.i }); }
    }
  }
  return ev;
}
function drop(S, ev) { S.phase = 'drop'; S.pt = 0; S.win = null; S.glow = false; S.quiet = 0; ev.push({ k: 'drop' }); }
function land(S, ev) {
  const G = grades(S); S.tries++;
  const bad = G.gp === 0 ? 'maltra.scratch' : G.go === 0 ? 'maltra.break' : null;
  let grade = Math.min(G.gp, G.go);
  if (bad || (S.first && grade < 40)) {
    if (S.first) { S.first = false; ev.push({ k: 'free', par: G.par, over: G.over, why: bad || 'grade' }); lift(S); return; }
    S.flaws.push({ f: bad, at: S.b.i }); S.cap = 20; ev.push({ k: 'hit', f: bad, par: G.par, over: G.over }); lift(S); return;
  }
  S.first = false;
  if (S.cap) grade = Math.min(grade, S.cap);
  const gn = grade >= 40 ? 'gold' : grade >= 20 ? 'good' : 'ok';
  const st = { i: S.b.i, grade: gn, par: +G.par.toFixed(3), over: +G.over.toFixed(3), yaw: +S.th.toFixed(5), dz: +S.cz.toFixed(4), two: !!S.two };
  S.steps.push(st);
  S.phase = 'course'; S.pt = 0; S.y = 1;
  ev.push({ k: 'land', ...st });
}
function lift(S) { S.phase = 'lift'; S.pt = 0; S.th += (S.th >= 0 ? 1 : -1) * 0.5 * RAD; S.w = 0; S.vx = 0; S.vz = 0; }
export function result(S) {
  const n = S.steps.length || 1, pts = S.steps.reduce((a, s) => a + (s.grade === 'gold' ? 40 : s.grade === 'good' ? 20 : 10), 0);
  const gold = S.steps.filter((s) => s.grade === 'gold').length, flaws = S.flaws.length;
  const allGold = gold === S.steps.length && S.steps.length > 0;
  const stars = allGold && !flaws ? 3 : !flaws && gold / n >= 0.6 ? 2 : 1;
  return { stars, q: pts / (n * 40), pts, perfect: stars === 3, bonus: allGold && !flaws, flags: { beams: S.steps.length, gold, flaws, two: S.steps.filter((s) => s.two).length } };
}
export function save(S, id) { return { id, v: 1, lv: S.lv, k: S.k, steps: S.steps, flaws: S.flaws, first: S.first }; }
/** a reload in the middle: the beams landed stand, the next one comes up */
export function load(b) { if (!b || b.v !== 1) return null; const S = fresh(b.lv); S.steps = b.steps || []; S.flaws = b.flaws || []; S.first = !!b.first && !S.steps.length; S.k = Math.min(S.list.length - 1, b.k | 0); arrive(S); return S; }

/* ───────── a bot (step 0's prototype check, and the probes): pulses by the rules a child can learn ───────── */
/** what a learning hand does this frame: pulse the line of the end going west (or turning away), brake the sway by the coupling; let go in the quiet */
export function bot(S, o = {}) {
  const T = [null, null]; if (S.phase !== 'hang' && S.phase !== 'arrive') return { T };
  const two = o.two !== false && S.lv > 1, gain = o.gain || 1;
  // the turn: pull the end that must go east (θ > 0: the north end is east already → pull the south one)
  const want = -(S.th * 1.0 + S.w * 2.4) * (S.b.L / 22);   // (>0: the north end should go east)
  const sway = S.cz * 1.4 + S.vz * 0.9;   // (>0: moving / out south → the south line's inward pull brakes it… the north line pulls south)
  let tN = Math.max(0, want) * 6 * gain, tS = Math.max(0, -want) * 6 * gain;
  if (two) { tN += Math.max(0, -sway) * 3; tS += Math.max(0, sway) * 3; }
  // the gusts: a pulse on the south line as the flag flaps
  if (S.gust && S.gust.warn) tS = Math.max(tS, 0.45);
  tN = Math.min(1, tN); tS = Math.min(1, tS);
  if (S.lv === 1 && !o.two) { if (Math.abs(S.th) > 0 || true) { const k = want >= 0 ? 0 : 1; T[k] = k === 0 ? tN : tS; if (T[k] < 0.02) T[k] = 0; } return { T, tap: S.glow && S.b.L * Math.abs(Math.sin(S.th)) < (o.par || 0.2) }; }
  const aligned = S.b.L * Math.abs(Math.sin(S.th)) < (o.par || 0.1);
  if (S.glow && aligned && !(S.gust && (S.gust.warn || S.gust.on))) return { T: [null, null], tap: true };
  T[0] = tN < 0.02 ? 0 : tN; T[1] = tS < 0.02 ? 0 : tS;
  return { T };
}
