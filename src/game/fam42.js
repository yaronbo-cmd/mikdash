/* ── fable32 (build 42) ── fam42.js — the families engine of the new Phase A (docs/specs/shlav-alef-v2-he.md §1–§4; shlav-alef-hard-fun-he.md
 * §1 the Hard Fun test, §5 the levels): pure, no DOM — each job a small state machine stepped by the act's input; reused by every stage.
 *   LIFT  — the treadwheel ("לשלוט במשקל", §2): hold = he walks the wheel (after a short start: a tap moves nothing); release early — it
 *           runs on by its momentum; a short drag back lowers. A stop inside the window with no correction is מהודר.
 *   PLACE — the course's hand stones (§3, "אריח על גבי לבנה", מגילה טז ע"ב): drag a stone of a chosen length to the course and hold it to
 *           settle; no joint over a joint of the course below; the last one must end exactly at the course's end. And the great stone on
 *           rollers (ROLL): drag the freed roller from the back to the front before the stone leaves the last one. And the last paving
 *           slabs (PAVE): drag slabs of the sizes that fill each row exactly.
 *   INSPECT — "reading the rock" (§10-01): sweep the light — at a grazing angle the bedding line appears; tap wedges along it at even
 *           spacing; hold to pour water — the crack runs — and release as it reaches the end. Rock 1 a clear line, 2 faint, 3 two lines
 *           and only one with the layers (המחשה: the method).
 * Every job: grade by rate30 (מהודר / כשר / טעון תיקון), never a loss, a fix always possible; levels 1–4 per family (lvl36: two מהודר
 * open the next). TAPS ALONE NEVER FINISH A JOB: every finish asks a hold past TAP42 s or a drag past DRAG42 px (test/build42). Never a
 * Divine Name. ── /fable32 ── */
import { rate30 } from '../avodah/shift/rate30.js';
import { ensure36, open36, L36 } from '../avodah/shift/lvl36.js';

/** a hold shorter than this is a tap: it moves nothing; a drag shorter than this (px) is a tap */
export const TAP42 = 0.25;
export const DRAG42 = 24;
export const FAM42 = Object.freeze(['lift', 'place', 'inspect', 'fit']);   // (build 47: the FIT family opens — the door leaf)
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const q3 = (faults) => (faults <= 0 ? 1 : faults <= 2 ? 0.65 : 0.3);   // (0 → מהודר, 1–2 → כשר, more → טעון תיקון)

/* ───────── LIFT: the treadwheel ───────── */
export const LIFT42 = Object.freeze({
  // acc: the wheel's push while held; drag: how fast it runs down when let go (less = more momentum); win: the stop window (stone height
  // 0…1); shadow: the shown stop (level 1); sway: the stone's swing (levels 3–4) — its height wobbles by sway × 0.04
  L: Object.freeze([null,
    Object.freeze({ acc: 0.55, drag: 0.9, vmax: 0.42, win: Object.freeze([0.6, 0.8]), shadow: true, sway: 0 }),
    Object.freeze({ acc: 0.55, drag: 0.9, vmax: 0.42, win: Object.freeze([0.62, 0.78]), shadow: false, sway: 0 }),
    Object.freeze({ acc: 0.45, drag: 0.6, vmax: 0.42, win: Object.freeze([0.64, 0.76]), shadow: false, sway: 0.5 }),
    Object.freeze({ acc: 0.42, drag: 0.5, vmax: 0.45, win: Object.freeze([0.66, 0.74]), shadow: false, sway: 0.8 }),
  ]),
  back: 0.5, still: 0.012,
  slipAfter: 3, slip: 0.1,   // (over the window and left alone this long, the crew's brake lets the stone sink back into it — a correction; the wheel never stays stuck over it)
});
export function createLift(L = 1) {
  const P = LIFT42.L[clamp(L | 0, 1, 4)];
  const s = { y: 0, v: 0, t: 0, held: 0, wasHeld: false, fix: 0, over: false, stopped: false, done: false, q: null, L: clamp(L | 0, 1, 4), win: P.win, shadow: P.shadow };
  /** dt s; inp: { hold: bool, back: bool (a drag back: lowers) } */
  function step(dt, inp = {}) {
    if (s.done || !(dt > 0)) return s;
    s.t += dt;
    if (inp.hold) { s.held += dt; s.wasHeld = true; } else s.held = 0;
    const push = inp.hold && s.held > TAP42;
    if (push) s.v = Math.min(P.vmax, s.v + P.acc * dt);
    else if (inp.back) s.v = Math.max(-P.vmax, s.v - P.acc * LIFT42.back * 2 * dt);
    else { const d = P.drag * dt; s.v = Math.abs(s.v) <= d ? 0 : s.v - Math.sign(s.v) * d; }
    if (s.slip) { if (inp.hold || inp.back) s.slip = false; else s.v = -LIFT42.slip; }
    s.y = clamp(s.y + s.v * dt, 0, 1.25);
    if (s.slip && s.y <= P.win[1] - 0.03) { s.y = P.win[1] - 0.03; s.v = 0; s.slip = false; s.backed = true; s.idle = 0; }
    if (!s.slip) { s.idle = !inp.hold && !inp.back && s.y > P.win[1] && Math.abs(s.v) < LIFT42.still * 2 ? (s.idle || 0) + dt : 0; if (s.idle > LIFT42.slipAfter) s.slip = true; }
    if (s.y > P.win[1] + 0.02 && !s.over) { s.over = true; s.fix++; }   // (past the window: a correction is needed)
    if (s.y < P.win[1]) s.over = false;
    if (inp.back) s.backed = true;
    const still = !inp.hold && !inp.back && Math.abs(s.v) < LIFT42.still && s.y > 0.03;
    if (still && !s.stopped) {
      s.stopped = true;
      if (s.y >= P.win[0] && s.y <= P.win[1]) { s.done = true; s.q = q3(s.fix + (s.backed ? 1 : 0)); }
      // (stopped short: lift again — no fault, a child lifts in pushes; stopped over: counted once, as it passed the window — the naive kid's runs)
    }
    if (!still) s.stopped = false;
    return s;
  }
  /** where it stops if let go now (the shadow of level 1) */
  const stopAt = () => clamp(s.y + (s.v > 0 ? (s.v * s.v) / (2 * P.drag) : -(s.v * s.v) / (2 * P.drag)), 0, 1.25);
  const sway = () => (P.sway ? Math.sin(s.t * 2.3) * P.sway * 0.04 : 0);
  return { step, state: () => s, stopAt, sway, P, result: () => (s.done ? { q: s.q, rating: rate30(s.q), fix: s.fix } : null) };
}

/* ───────── PLACE: the course's hand stones ───────── */
export const PLACE42 = Object.freeze({ lens: Object.freeze([2, 3, 4]), settle: 0, loose: 1.6 });   // ── build 45 ── (settle 0: a released stone settles by itself — the naive kid's stall everywhere; loose: a release this far (units) from where it lands is imprecise)
/** a course: the joints of the course below (positions), and his stretch [a, b) to fill (in units). ── build 43 ── a stone may go anywhere
 *  in the stretch: o.u (units) is where it was let go — it goes to the free place nearest it where it fits (the coordinator's build-43 #6:
 *  a release anywhere over the course's stretch); without o.u, the first free place (the order of build 42). His choice of stone and
 *  place stays his: a joint over a joint below is counted, never corrected. ── build 45 ── no hold to settle (it settles by itself);
 *  precision still counts (a release far from where it lands: every second such is a fault); spec.corner { want: 'a' | 'b' } — the
 *  course ends at a corner: its last 2 units are the corner stone's, laid with placeCorner(dir) — corner stones alternate direction
 *  course to course (המחשה), the wrong way is a fault; spec.retreat (level 3) — the plumb drops when the course is full: the stones that
 *  stand out are pushed in, one drag each (pushIn), before it is done. */
export function createCourse(spec) {
  const c = { below: (spec.below || []).slice(), a: spec.a, b: spec.b, at: spec.a, occ: [], stones: [], last: null, joints: [], faults: 0, rejects: 0, loose: 0, done: false, q: null, L: spec.L || 1,
    corner: spec.corner ? { want: spec.corner.want, dir: null, at: spec.b - 2 } : null, prot: null };
  const rb = () => (c.corner ? c.b - 2 : c.b);
  const free = (s, len) => { if (s < c.a || s + len > rb() + 1e-9) return false; for (let k = s; k < s + len; k++) if (c.occ[k]) return false; return true; };
  const runs = () => { const r = []; let s0 = null; const e0 = rb(); for (let k = c.a; k <= e0; k++) { const e = k < e0 && !c.occ[k]; if (e && s0 == null) s0 = k; if (!e && s0 != null) { r.push([s0, k - s0]); s0 = null; } } return r; };
  const minLen = () => Math.min(...PLACE42.lens);
  /** the free place for a stone of len nearest u (or the first), or null */
  function slotFor(len, u) {
    let best = null, bd = Infinity;
    for (let s = c.a; s + len <= rb() + 1e-9; s++) { if (!free(s, len)) continue; const d = u == null ? s - c.a : Math.abs(s + len / 2 - u); if (d < bd - 1e-9) { bd = d; best = s; } }
    return best;
  }
  const joint = (e) => { if (e <= c.a + 1e-9 || e >= c.b - 1e-9 || c.joints.some((j) => Math.abs(j.x - e) < 1e-6)) return; const over = c.below.some((j) => Math.abs(j - e) < 1e-6); c.joints.push({ x: e, over }); if (over) c.faults++; };
  function check() {
    if (runs().length || (c.corner && !c.corner.dir)) { const r = runs(); c.at = r.length ? r[0][0] : c.b; return; }
    c.at = c.b;
    if (spec.retreat && !c.prot) { c.prot = c.stones.map((x, i) => i).filter((i) => i % 2 === 0); if (c.prot.length) return; }
    if (c.prot && c.prot.length) return;
    c.done = true; c.q = q3(c.faults + Math.floor(c.loose / 2) + (c.rejects > 1 ? 1 : 0));
  }
  /** place a stone of length len: dragged (≥ DRAG42 px), fitting a free place → 'ok' | 'tap' | 'long' | 'gap' | 'done' (it settles by itself) */
  function place(len, o = {}) {
    if (c.done || c.prot) return 'done';
    if (!((o.dragPx || 0) >= DRAG42)) return 'tap';
    const s0 = slotFor(len, Number.isFinite(o.u) ? o.u : null);
    if (s0 == null) { c.rejects++; return 'long'; }
    // (it would leave a gap no stone fills: the course could never end — the naive kid's run K42-P-new stood there 3 minutes)
    for (let k = s0; k < s0 + len; k++) c.occ[k] = true;
    if (runs().some((r) => r[1] < minLen())) { for (let k = s0; k < s0 + len; k++) c.occ[k] = false; c.rejects++; return 'gap'; }
    c.stones.push([s0, len]); c.last = [s0, len];
    if (Number.isFinite(o.u) && Math.abs(o.u - (s0 + len / 2)) > PLACE42.loose) c.loose++;
    joint(s0); joint(s0 + len);
    check();
    return 'ok';
  }
  /** the corner stone, laid one way or the other ('a' | 'b'): it must be dragged; the wrong way is a fault (counted, never corrected) */
  function placeCorner(dir, o = {}) {
    if (!c.corner || c.done || c.prot) return 'done';
    if (!((o.dragPx || 0) >= DRAG42)) return 'tap';
    if (c.corner.dir) return 'long';
    c.corner.dir = dir === 'b' ? 'b' : 'a'; if (c.corner.dir !== c.corner.want) c.faults++;
    joint(c.corner.at); c.last = [c.corner.at, 2];
    check();
    return 'ok';
  }
  /** the retreat (level 3): a drag pushes the next stone that stands out back into line */
  function pushIn(o = {}) {
    if (!c.prot || !c.prot.length || c.done) return 'done';
    if (!((o.dragPx || 0) >= DRAG42)) return 'tap';
    c.prot.shift(); check(); return 'ok';
  }
  const fits = (len, u) => { const s0 = slotFor(len, Number.isFinite(u) ? u : null); if (s0 == null) return false; for (let k = s0; k < s0 + len; k++) c.occ[k] = true; const ok = !runs().some((r) => r[1] < minLen()); for (let k = s0; k < s0 + len; k++) c.occ[k] = false; return ok; };
  const overAt = (len, u) => { const s0 = slotFor(len, Number.isFinite(u) ? u : null); if (s0 == null) return false; return [s0, s0 + len].some((e) => e > c.a + 1e-9 && e < c.b - 1e-9 && c.below.some((j) => Math.abs(j - e) < 1e-6)); };
  return { place, placeCorner, pushIn, fits, overAt, slotFor, runs, state: () => c, result: () => (c.done ? { q: c.q, rating: rate30(c.q), faults: c.faults } : null) };
}
/** the course's lay-out for a seed: the course below's joints and his stretch (the crews lay the rest) */
export function courseSpec(n, L = 1) {
  const below = n % 2 ? [2, 5, 8, 11] : [3, 6, 9, 12];   // (the crews' course below, its joints every 3 units)
  const a = n % 2 ? 4 : 1, len = L >= 3 ? 7 : 6;
  return { below, a, b: a + len, L };
}

/** ── build 45 ── the court wall's courses (v2 §7): two courses of hand stones, the giant's course, the corner course (its corner the other way
 *  from the course below's — the corners alternate, המחשה), and the top course, entirely his (and at level 3, the retreat) */
export function wallSpec45(kind, L = 1, n = 0) {
  const below = n % 2 ? [2, 5, 8, 11] : [3, 6, 9, 12];
  if (kind === 'corner') return { below, a: 6, b: 15, L, corner: { want: n % 2 ? 'b' : 'a' } };
  if (kind === 'top') return { below, a: 0, b: 15, L, corner: { want: n % 2 ? 'b' : 'a' }, retreat: L >= 3 };
  return courseSpec(n, L);
}

/* ───────── LIFT (the wall's variant): the pulley, hand over hand (v2 §2) ───────── */
/** short swipes down in rhythm — each lifts the stone a little (gain per px, at most cap a pull); between pulls a brief still hold (catch s)
 *  catches the rope, else it slips back (slip); stop in the window; past it — a correction (as the wheel), and left alone there the rope
 *  is let out to the window's top (no kid stuck). A tap pulls nothing (the first 12 px of a gesture lift nothing; a pull counts from DRAG42). */
export const PULLEY45 = Object.freeze({
  L: Object.freeze([null,
    Object.freeze({ gain: 0.0032, cap: 0.17, slip: 0.05, win: Object.freeze([0.6, 0.8]), shadow: true, sway: 0 }),
    Object.freeze({ gain: 0.0032, cap: 0.17, slip: 0.06, win: Object.freeze([0.62, 0.78]), shadow: false, sway: 0 }),
    Object.freeze({ gain: 0.0028, cap: 0.15, slip: 0.08, win: Object.freeze([0.64, 0.76]), shadow: false, sway: 0.5 }),
    Object.freeze({ gain: 0.0026, cap: 0.13, slip: 0.09, win: Object.freeze([0.66, 0.74]), shadow: false, sway: 0.8 }),
  ]),
  catch: 0.12, dead: 12, idle: 0.7, letOut: 2.2,
});
export function createPulley(L = 1) {
  const P = PULLEY45.L[clamp(L | 0, 1, 4)];
  const s = { y: 0, t: 0, g: false, travel: 0, gained: 0, still: 0, caught: false, pulls: 0, slips: 0, over: false, fix: 0, idle: 0, done: false, q: null, L: clamp(L | 0, 1, 4), win: P.win, shadow: P.shadow };
  /** a gesture begins (the finger down on the rope) */
  function grab() { if (s.done) return; s.g = true; s.travel = 0; s.gained = 0; s.still = 0; s.caught = false; }
  /** the finger moved down by dyPx (up: nothing) */
  function pull(dyPx) {
    if (s.done || !s.g || !(dyPx > 0)) return;
    const before = s.travel; s.travel += dyPx; const eff = Math.max(0, s.travel - PULLEY45.dead) - Math.max(0, before - PULLEY45.dead);
    if (eff > 0 && s.gained < P.cap) { const inc = Math.min(P.cap - s.gained, eff * P.gain); s.gained += inc; s.y = clamp(s.y + inc, 0, 1.25); s.still = 0; s.caught = false; }
    if (before < DRAG42 && s.travel >= DRAG42) s.pulls++;
    if (s.y > P.win[1] + 0.02 && !s.over) { s.over = true; s.fix++; }
  }
  /** the finger down and still for dt */
  function hold(dt) { if (s.done || !s.g) return; s.still += dt; if (s.gained > 0 && s.still >= PULLEY45.catch) s.caught = true; }
  /** the finger up: a pull not caught slips back */
  function release() { if (s.done || !s.g) return; s.g = false; if (s.gained > 0 && !s.caught) { s.y = Math.max(0, s.y - P.slip); s.slips++; } s.idle = 0; }
  /** time; the stop: a rest in the window; past the window, left alone, the rope let out to its top (a correction already counted) */
  function step(dt) {
    if (s.done || !(dt > 0)) return s;
    s.t += dt; if (s.g) { s.idle = 0; return s; }
    s.idle += dt;
    if (s.y < P.win[1]) s.over = false;
    if (s.y > P.win[1] && s.idle > PULLEY45.letOut) s.y = Math.max(P.win[1] - 0.02, s.y - dt * 0.1);
    if (s.idle >= PULLEY45.idle && s.y >= P.win[0] && s.y <= P.win[1]) { s.done = true; s.q = q3(s.fix + Math.floor(s.slips / 2)); }
    return s;
  }
  const sway = () => (P.sway ? Math.sin(s.t * 2.3) * P.sway * 0.04 : 0);
  return { grab, pull, hold, release, step, sway, P, state: () => s, result: () => (s.done ? { q: s.q, rating: rate30(s.q), fix: s.fix } : null) };
}

/* ───────── the LINE (the wall's opening act): stretched between two pins, its straightness graded ───────── */
/** a drag from the near pin to the far one: points (u along 0…1, d across, both as shares of the pins' distance); it ends when the finger
 *  reaches the far pin (u ≥ 0.95) having started at the near one (u ≤ 0.12); straight within 4 % — מהודר, 9 % — כשר, more — טעון תיקון (of the line's length, times the level's tolerance);
 *  a let-go midway: the line falls slack — draw again (a correction). A tap never stretches it. */
export const LINE45 = Object.freeze({ start: 0.12, end: 0.95, hi: 0.04, mid: 0.09, L: Object.freeze([null, 1.5, 1.2, 1, 0.8]) });   // (build 45: level 1 forgives a finger's wobble — 1 made the naive kid's lines טעון תיקון: 4 % of a 300-px line is 12 px)
export function createLine45(L = 1) {
  const k = { on: false, u: 0, dmax: 0, fix: 0, done: false, q: null, L: clamp(L | 0, 1, 4), tries: 0 };
  const tol = LINE45.L[k.L];
  function down(u, d) { if (k.done) return; k.on = u <= LINE45.start && Math.abs(d) < 0.2; k.u = u; k.dmax = 0; if (k.on) k.tries++; }
  function move(u, d) { if (!k.on || k.done) return; k.u = Math.max(k.u, u); k.dmax = Math.max(k.dmax, Math.abs(d)); if (u >= LINE45.end) { k.on = false; k.done = true; const dev = k.dmax / tol; k.q = clamp((dev <= LINE45.hi ? 1 : dev <= LINE45.mid ? 0.65 : 0.3) - 0.2 * k.fix, 0, 1); } }
  function up() { if (!k.on || k.done) return; k.on = false; if (k.u > LINE45.start + 0.08) k.fix++; }
  return { down, move, up, state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}

/* ───────── FLICK: the giant corner stone nudged home with a crowbar (v2 §3; the coordinator's build-43 #5) ───────── */
/** the crane has lowered it a little short of its place (x < 0; the place at 0, in amot along the course). Each flick of the lever is a
 *  drag: its length is the push (gain amot per px past half DRAG42, at most cap), its way on the screen toward (+1) or away from (−1) the
 *  place. Inside the window it is home. A push past the window the other side is an overshoot (a fault; nudge it back). Level 1 shows a
 *  ghost of the place; the levels narrow the window and make the lever livelier. A tap (< DRAG42 px) moves nothing. */
export const FLICK42 = Object.freeze({
  L: Object.freeze([null,
    Object.freeze({ gain: 0.0045, win: 0.07, ghost: true }),
    Object.freeze({ gain: 0.0045, win: 0.055, ghost: false }),
    Object.freeze({ gain: 0.006, win: 0.045, ghost: false }),
    Object.freeze({ gain: 0.007, win: 0.035, ghost: false }),
  ]),
  d0: 0.75, cap: 0.6, many: 6,
});
export function createFlick(L = 1, d0 = FLICK42.d0) {
  const P = FLICK42.L[clamp(L | 0, 1, 4)];
  const f = { x: -Math.abs(d0), flicks: 0, overs: 0, done: false, q: null, L: clamp(L | 0, 1, 4), win: P.win, ghost: P.ghost, side: -1 };
  /** a flick: { dragPx, dir: +1 toward the place (the +x way), −1 back } → 'ok' | 'tap' | 'home' | 'over' | 'done' */
  function flick(o = {}) {
    if (f.done) return 'done';
    if (!((o.dragPx || 0) >= DRAG42)) return 'tap';
    const dir = o.dir < 0 ? -1 : 1, m = Math.min(FLICK42.cap, (o.dragPx - DRAG42 / 2) * P.gain);
    f.flicks++; f.x += dir * m;
    if (Math.abs(f.x) <= f.win) { f.done = true; f.q = q3(f.overs + (f.flicks > FLICK42.many ? 1 : 0)); return 'home'; }
    const side = f.x < 0 ? -1 : 1; if (side !== f.side) { f.overs++; f.side = side; return 'over'; }
    return 'ok';
  }
  /** the push a drag of px gives (for the lever's look and the tools) */
  const push = (px) => Math.min(FLICK42.cap, Math.max(0, (px - DRAG42 / 2) * P.gain));
  return { flick, push, P, state: () => f, result: () => (f.done ? { q: f.q, rating: rate30(f.q), overs: f.overs } : null) };
}

/* ───────── ROLL: the great stone on rollers ───────── */
export const ROLL42 = Object.freeze({ beat: 1.25, spacing: 1, rollers: 4, moves: 6, win: 0.55 });
/** the stone moves one roller spacing each chant beat; the back roller frees as the stone's rear passes it; it must be dragged to the front
 *  before the stone's front leaves the last roller ahead — else a gap: the stone stops (the crew waits) until it is placed */
export function createRoll(L = 1) {
  const beat = ROLL42.beat * (L >= 3 ? 0.85 : 1);
  const r = { x: 0, t: 0, free: false, freeAt: 0, moved: 0, gaps: 0, waiting: false, done: false, q: null, beat };
  function step(dt) {
    if (r.done || !(dt > 0)) return r;
    r.t += dt;
    if (r.waiting) return r;
    r.x += (ROLL42.spacing / beat) * dt;
    const k = Math.floor(r.x / ROLL42.spacing);
    if (k > r.moved && !r.free) { r.free = true; r.freeAt = r.t; }   // (a roller freed behind)
    if (r.free && r.t - r.freeAt > beat * (1 + ROLL42.win)) { r.waiting = true; r.gaps++; }   // (the front left the last roller: a gap)
    return r;
  }
  /** the freed roller dragged to the front: a drag ≥ DRAG42 * 2 px → 'ok' | 'tap' | 'none' */
  function moveRoller(o = {}) {
    if (r.done) return 'done';
    if (!r.free) return 'none';
    if (!((o.dragPx || 0) >= DRAG42 * 2)) return 'tap';
    r.free = false; r.moved++; r.waiting = false;
    if (r.moved >= ROLL42.moves) { r.done = true; r.q = q3(r.gaps); }
    return 'ok';
  }
  return { step, moveRoller, state: () => r, result: () => (r.done ? { q: r.q, rating: rate30(r.q), gaps: r.gaps } : null) };
}

/* ───────── PAVE: the last paving slabs ───────── */
export const PAVE42 = Object.freeze({ sizes: Object.freeze([1, 2, 3]), rows: Object.freeze([5, 7, 4]) });
export function createPave(rows = PAVE42.rows) {
  const p = { rows: rows.slice(), left: rows.slice(), row: 0, rejects: 0, slabs: 0, done: false, q: null };
  /** a slab of size n dragged into the row (≥ DRAG42 px): it fits or not → 'ok' | 'tap' | 'long' | 'done' */
  function lay(n, o = {}) {
    if (p.done) return 'done';
    if (!((o.dragPx || 0) >= DRAG42)) return 'tap';
    if (n > p.left[p.row]) { p.rejects++; return 'long'; }
    p.left[p.row] -= n; p.slabs++;
    while (p.row < p.rows.length && p.left[p.row] === 0) p.row++;
    if (p.row >= p.rows.length) { p.done = true; p.q = q3(p.rejects); }
    return 'ok';
  }
  return { lay, state: () => p, result: () => (p.done ? { q: p.q, rating: rate30(p.q), rejects: p.rejects } : null) };
}

/* ───────── INSPECT: reading the rock ───────── */
// rock 1: one clear line; rock 2: one faint; rock 3: two lines — only one goes with the layers (המחשה)
export const ROCKS42 = Object.freeze([
  Object.freeze({ lines: Object.freeze([Object.freeze({ id: 'a', graze: 0.3, band: 0.22, layers: true })]) }),
  Object.freeze({ lines: Object.freeze([Object.freeze({ id: 'a', graze: 0.7, band: 0.1, layers: true })]) }),
  Object.freeze({ lines: Object.freeze([Object.freeze({ id: 'a', graze: 0.25, band: 0.14, layers: false }), Object.freeze({ id: 'b', graze: 0.72, band: 0.14, layers: true })]) }),
]);
export const INSPECT42 = Object.freeze({ wedges: 4, rate: 0.28, end: Object.freeze([0.9, 1.04]), minWedges: 3 });
export function createRock(i = 0, L = 1) {
  const R = ROCKS42[clamp(i | 0, 0, ROCKS42.length - 1)];
  const k = { i, seen: {}, line: null, wedges: [], crack: 0, held: 0, poured: false, fix: 0, done: false, q: null, L, light: -1 };
  const bandK = L >= 3 ? 0.7 : 1;
  /** the light swept to u (0…1 across the rock) → the lines it shows */
  function sweep(u) {
    k.light = u;
    for (const l of R.lines) if (Math.abs(u - l.graze) <= l.band * bandK) k.seen[l.id] = true;
    return R.lines.filter((l) => k.seen[l.id]).map((l) => l.id);
  }
  /** a wedge tapped at t (0…1 along the line `id`) — the line must have been seen */
  function wedge(id, t) {
    if (k.done || !k.seen[id]) return 'unseen';
    if (k.line && k.line !== id) return 'other';
    k.line = id;
    if (k.wedges.length >= INSPECT42.wedges) return 'full';
    k.wedges.push(clamp(t, 0, 1)); k.wedges.sort((a, b) => a - b);
    return 'ok';
  }
  /** the water: held (dt s) — past the tap, the crack runs; released → the grade if it reached the end */
  function pour(dt, hold) {
    if (k.done || k.wedges.length < INSPECT42.minWedges) return k;
    if (hold) {
      k.held += dt;
      if (k.held > TAP42) { k.crack = Math.min(1.2, k.crack + INSPECT42.rate * (k.wedges.length / INSPECT42.wedges) * dt); k.poured = true; }
      return k;
    }
    if (k.held > 0) {   // (released)
      k.held = 0;
      if (k.crack >= INSPECT42.end[0]) {
        const sp = gaps(k.wedges), even = sp.mean > 0 ? clamp(1 - sp.sd / sp.mean, 0, 1) : 0, line = R.lines.find((l) => l.id === k.line);
        const over = k.crack > INSPECT42.end[1];
        k.done = true;
        k.q = !line || !line.layers ? 0.3 : clamp(0.55 * even + 0.45 * (over ? 0.5 : 1) - 0.15 * k.fix, 0, 1);
      }   // (let go early: the crack stops — pour again; no fault: a child pours in pushes, as he lifts — the naive kid's runs; poured past the end is the mistake)
    }
    return k;
  }
  return { sweep, wedge, pour, rock: R, state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q), line: k.line } : null) };
}
function gaps(w) {
  const pts = [0, ...w, 1], g = [];
  for (let i = 1; i < pts.length; i++) g.push(pts[i] - pts[i - 1]);
  const mean = g.reduce((a, b) => a + b, 0) / g.length, sd = Math.sqrt(g.reduce((a, b) => a + (b - mean) ** 2, 0) / g.length);
  return { mean, sd };
}

/* ───────── levels per family (lvl36's rule: two מהודר at a level open the next) ───────── */
export function famRec(save, fam) {
  if (!save.fam || typeof save.fam !== 'object') save.fam = {};
  const a = save.fam[fam] || (save.fam[fam] = { n: 0, best: 0, last: 0 });
  ensure36(a);
  return a;
}
export function famLevel(save, fam) { const a = famRec(save, fam); return Math.max(1, Math.min(open36(a), (a.l36.pick | 0) || open36(a))); }
/** a job's grade kept at its level → { rating, L, opened (a new level) } */
export function famRate(save, fam, L, q) {
  const a = famRec(save, fam), rating = rate30(q), was = open36(a);
  a.n = (a.n | 0) + 1; a.last = Date.now(); a.best = Math.max(a.best | 0, Math.round(q * 100));
  const c = a.l36.c[L] || (a.l36.c[L] = { h: 0, k: 0, t: 0 }); c[rating === 'mehudar' ? 'h' : rating === 'kasher' ? 'k' : 't']++;
  const now = open36(a), opened = now > was ? now : 0;
  if (opened) a.l36.pick = now;
  return { rating, L, opened, max: L36.max };
}

/* ───────── the day's materials (v2 §9): a caravan each morning; never out mid-act — only at a course's end; up to 3 days kept ───────── */
export const MAT42 = Object.freeze({ daily: 24, keep: 3, cost: Object.freeze({ rock: 2, stone: 1, roll: 4, pave: 3, lift: 2, pulley: 4, wstone: 5, giant: 5, top: 8, lattice: 8, warnst: 6, lintel: 10, leaf: 8, leaf7: 12, wood: 6, beams: 10, pegs: 6, corner48: 12, voyage: 0, lever: 10, leaf49: 8, steps: 12, compass: 6, benches: 6, hub: 8, wheel: 6, dome: 14 }) });   // ── build 46 ── (the soreg: 30 — three panels and the warning stones; a second morning again)   // ── build 45 ── (the wall: 32 in all — beyond one morning's caravan with stage 01's leftover, so its "מחר" comes in normal play)
export const dayKey42 = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const dayN = (key) => { const [y, m, d] = key.split('-').map(Number); return Math.round(Date.UTC(y, m - 1, d) / 86400000); };
/** the morning's caravan(s): each new day since the last adds a day's load, never more than `keep` days in store → the loads that came */
export function caravan42(m, now, add = 0) {
  const key = dayKey42(now + add * 86400000);
  if (!m.day) { m.day = key; m.stock = MAT42.daily; return 1; }
  const days = dayN(key) - dayN(m.day);
  if (days <= 0) return 0;
  m.day = key;
  m.stock = Math.min(MAT42.daily * MAT42.keep, (m.stock | 0) + MAT42.daily * Math.min(days, MAT42.keep));
  return Math.min(days, MAT42.keep);
}
/** enough for this part (checked only at a course's end / a part's start: never mid-act) */
export const enough42 = (m, part) => (m.stock | 0) >= (MAT42.cost[part] | 0);
export function spend42(m, part) { m.stock = Math.max(0, (m.stock | 0) - (MAT42.cost[part] | 0)); return m.stock; }

/* ───────── ── build 46 ── stage 03, הסורג: the LATTICE (a PLACE variant, v2 §3 "סריג") and the WARNING STONES' spacing ───────── */
/** a lattice panel: W × H cells, each cell a tile — a set of strokes in the unit cell (x right, y down), drawn in one or two tones — in one of
 *  eight orientations (a flip, then quarter turns). The pattern runs on across the panels (the cell's column counts from the stretch's start),
 *  so the missing cell must continue it. The tray holds the right tile, turned at random, and two others. A tap turns a tray piece, a double
 *  tap flips it, a drag (≥ DRAG42 px) onto the gap sets it: the right shape the right way — in; anything else — out again, a mistake (never
 *  corrected for him). Graded by the mistakes and the turns beyond the fewest. The panels grow harder: diamonds → interlaced → two tones. */
const TILE46 = Object.freeze({
  diag: Object.freeze([[0, 1, 1, 0, 0]]),                                           // "/" — the diamonds' bar
  bar: Object.freeze([[0, 0.5, 1, 0.5, 0]]),                                        // "—" (an odd one in the tray)
  over: Object.freeze([[0, 1, 1, 0, 0], [0, 0, 0.38, 0.38, 0], [0.62, 0.62, 1, 1, 0]]),   // "/" over "\" (interlaced: the under bar broken)
  plus: Object.freeze([[0.5, 0, 0.5, 1, 0], [0, 0.5, 1, 0.5, 0]]),                  // "+" (an odd one)
  flag: Object.freeze([[0, 1, 1, 0, 0], [1, 0, 0.62, 0, 1]]),                       // "/" and a dark tick at its top end (two tones: it has a hand)
  hook: Object.freeze([[0, 1, 1, 0, 1], [0, 1, 0.38, 1, 0]]),                       // a dark "/" with a light foot (an odd one)
});
export const LAT46 = Object.freeze({
  kinds: Object.freeze({
    diamonds: Object.freeze({ tile: 'diag', odd: Object.freeze(['bar', 'plus']), rule: 'checker', he: 'מעוינים' }),
    interlaced: Object.freeze({ tile: 'over', odd: Object.freeze(['diag', 'plus']), rule: 'checker', he: 'שזורים' }),
    twotone: Object.freeze({ tile: 'flag', odd: Object.freeze(['hook', 'diag']), rule: 'turns', he: 'שני גוונים' }),
  }),
  W: 8, H: 4, extra: Object.freeze([null, 4, 3, 2, 2]),   // turns beyond the fewest, per level, before they cost a step
});
const r3 = (v) => Math.round(v * 1000) / 1000;
/** the strokes of a tile in an orientation (f: flipped left-right first, then r quarter turns clockwise) */
export function tile46(type, r = 0, f = 0) {
  return (TILE46[type] || []).map(([x1, y1, x2, y2, tone]) => {
    let a = [x1, y1], b = [x2, y2];
    if (f) { a = [1 - a[0], a[1]]; b = [1 - b[0], b[1]]; }
    for (let k = 0; k < (r & 3); k++) { a = [1 - a[1], a[0]]; b = [1 - b[1], b[0]]; }
    return [r3(a[0]), r3(a[1]), r3(b[0]), r3(b[1]), tone];
  });
}
const key46 = (segs) => segs.map(([a, b, c, d, t]) => ((a < c || (a === c && b <= d)) ? [a, b, c, d, t] : [c, d, a, b, t]).join(',')).sort().join('|');
export const same46 = (a, b) => key46(a) === key46(b);
/** the orientation a cell wants: 'checker' — the tile and its quarter turn alternate like a chessboard; 'turns' — a quarter turn more each
 *  column, a flip each row (two tones: its hand shows the way) */
export function want46(kind, col, row) {
  const K = LAT46.kinds[kind]; if (!K) return { r: 0, f: 0 };
  return K.rule === 'turns' ? { r: col & 3, f: row & 1 } : { r: (col + row) & 1, f: 0 };
}
export function createLattice46(kind = 'diamonds', L = 1, o = {}) {
  const K = LAT46.kinds[kind] || LAT46.kinds.diamonds, lv = clamp(L | 0, 1, 4), rnd = typeof o.rnd === 'function' ? o.rnd : Math.random;
  const col0 = o.col0 | 0, slot = o.slot || { c: Math.floor(rnd() * LAT46.W), r: Math.floor(rnd() * LAT46.H) };
  const w = want46(kind, col0 + slot.c, slot.r), need = tile46(K.tile, w.r, w.f);
  const types = [K.tile, ...K.odd]; for (let i = types.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [types[i], types[j]] = [types[j], types[i]]; }
  const tray = types.map((t) => { let r = Math.floor(rnd() * 4), f = Math.floor(rnd() * 2); if (t === K.tile && same46(tile46(t, r, f), need)) r = (r + 1) & 3; return { type: t, r, f }; });
  // the fewest turns and flips from the right piece's start to a right orientation
  const ri = tray.findIndex((p) => p.type === K.tile), p0 = tray[ri];
  let fewest = 9; for (let f = 0; f < 2; f++) for (let r = 0; r < 4; r++) if (same46(tile46(K.tile, r, f), need)) { const df = f !== p0.f ? 1 : 0, dr = (r - p0.r + 4) & 3; fewest = Math.min(fewest, df + dr); }
  const k = { kind, L: lv, slot, col0, tray, need, moves: 0, fewest, mistakes: 0, done: false, q: null, wrong: null };
  function tap(i) { const p = tray[i]; if (!p || k.done) return 'done'; p.r = (p.r + 1) & 3; k.moves++; return 'turn'; }
  function flip(i) { const p = tray[i]; if (!p || k.done) return 'done'; p.f ^= 1; k.moves++; return 'flip'; }
  /** a piece let go: { dragPx, onSlot } → 'tap' | 'off' | 'wrong' | 'ok' | 'done' */
  function drop(i, d = {}) {
    const p = tray[i]; if (!p || k.done) return 'done';
    if (!((d.dragPx || 0) >= DRAG42)) return 'tap';
    if (!d.onSlot) return 'off';
    if (p.type !== K.tile || !same46(tile46(p.type, p.r, p.f), need)) { k.mistakes++; k.wrong = { type: p.type, r: p.r, f: p.f }; return 'wrong'; }
    k.done = true; const over = Math.max(0, k.moves - k.fewest), ex = LAT46.extra[lv];
    k.q = clamp((k.mistakes === 0 ? 1 : k.mistakes <= 1 ? 0.65 : 0.3) - (over > ex ? 0.35 * Math.ceil((over - ex) / (ex + 1)) : 0), 0, 1);
    return 'ok';
  }
  return { tap, flip, drop, state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null), cellWant: (c, r) => { const q = want46(kind, col0 + c, r); return tile46(K.tile, q.r, q.f); } };
}
/** the WARNING STONES: along a stretch of the soreg (from post A at 0 to post B at len amot) he walks (hold) and sets n stones where his eye
 *  says the gaps are equal; a stone too near a post or another (< 1.5 amot) is refused. After the last: the real gaps against the even ones —
 *  the largest miss within 8 % of the even gap מהודר, 18 % כשר, more טעון תיקון (the levels tighten it). A tap without walking sets nothing. */
export const SPACE46 = Object.freeze({ len: 36, near: 1.5, hi: 0.08, mid: 0.18, n: Object.freeze([null, 3, 3, 4, 4]), tol: Object.freeze([null, 1.25, 1.1, 1, 0.85]) });
export function createSpacing46(L = 1, o = {}) {
  const lv = clamp(L | 0, 1, 4), len = o.len || SPACE46.len, n = o.n || SPACE46.n[lv];
  const k = { L: lv, len, n, x: 0, stones: [], refused: 0, done: false, q: null, gaps: null, even: len / (n + 1), miss: null };
  function walk(dx) { if (k.done) return k.x; k.x = clamp(k.x + dx, 0, len); return k.x; }
  function set() {
    if (k.done) return 'done';
    const x = Math.round(k.x * 10) / 10;
    if (x < SPACE46.near || x > len - SPACE46.near || k.stones.some((s) => Math.abs(s - x) < SPACE46.near)) { k.refused++; return 'near'; }
    k.stones.push(x); k.stones.sort((a, b) => a - b);
    if (k.stones.length >= n) {
      const pts = [0, ...k.stones, len]; k.gaps = pts.slice(1).map((v, i) => Math.round((v - pts[i]) * 10) / 10);
      k.miss = Math.max(...k.gaps.map((g) => Math.abs(g - k.even))) / k.even; const m = k.miss / SPACE46.tol[lv];
      k.q = m <= SPACE46.hi ? 1 : m <= SPACE46.mid ? 0.65 : 0.3; k.done = true; return 'last';
    }
    return 'ok';
  }
  return { walk, set, state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null), ideal: () => Array.from({ length: n }, (_, i) => Math.round(k.even * (i + 1) * 10) / 10) };
}

/* ───────── ── build 47 ── stage 04, שערי העזרה: the LINTEL on two cranes (LIFT, v2 §2) and the FIT family (v2 §5) ───────── */
/** the lintel (or the heavy leaf) on two cranes, a crew at each: a HOLD lifts it — after a moment's take-up (a tap lifts nothing); the
 *  finger's slide left or right of where it went down shifts the pull between the two crews (pull: −1 … 1, the screen-left crew +); the
 *  crews are never even (drift), and at level 3 it sways — the bubble on the lintel shows the tilt. Out past the tube's end the crews stop and
 *  call (a fault, counted once each time). It rises only while the bubble is in the tube; at the top it waits until the bubble is centred;
 *  then SET: a drag moves it along (dx, amot) over the two posts, and letting go lowers it — both ends on their posts (|dx| within the
 *  window, the bubble centred) seats it; else one end misses (a correction) and the crews lift it back a little. Never a break. */
export const LINTEL47 = Object.freeze({
  L: Object.freeze([null,
    Object.freeze({ rise: 0.11, drift: 0, sway: 0, swayW: 0, win: 0.5, centre: 0.3 }),   // ── build 54 ── (level 1: no drift — the inspector's review §4 must 8: four times in a row "the bubble ran") ── /build 54 ──
    Object.freeze({ rise: 0.1, drift: 0.42, sway: 0, swayW: 0, win: 0.35, centre: 0.26 }),
    Object.freeze({ rise: 0.09, drift: 0.4, sway: 0.45, swayW: 1.1, win: 0.3, centre: 0.24 }),
    Object.freeze({ rise: 0.08, drift: 0.5, sway: 0.6, swayW: 1.4, win: 0.25, centre: 0.2 }),
  ]),
  G: 1.6, lim: 1, takeUp: 0.35, gain: 0.012, dx0: 1.2, offFault: 3, fine: 0.3,   // (fine: the lintel moves 0.3 of the finger — a heavy stone; at 1:1 the least drag, 24 px, moved it past the window: K47-P's 45 drags)
});
export function createLintel47(L = 1, o = {}) {
  const lv = clamp(L | 0, 1, 4), P = LINTEL47.L[lv], heavy = !!o.heavy, rnd = typeof o.rnd === 'function' ? o.rnd : Math.random;
  const k = { L: lv, heavy, phase: 'lift', y: 0, tilt: 0, pull: 0, held: 0, holding: false, t: 0, faults: 0, out: false, off: 0, fix: 0, dx: (rnd() < 0.5 ? -1 : 1) * LINTEL47.dx0, done: false, q: null,
    drift: (rnd() < 0.5 ? -1 : 1) * P.drift * (heavy ? 1.15 : 1), sway: P.sway * (heavy ? 1.2 : 1), swayW: P.swayW, ph: rnd() * 6.28, centre: P.centre, win: P.win };
  function hold(on) { if (k.done) return; k.holding = !!on; if (!on) k.held = 0; }
  function slide(pull) { k.pull = clamp(+pull || 0, -1, 1); }
  function step(dt) {
    if (k.done) return; k.t += dt;
    if (k.phase !== 'lift' || !k.holding) return;
    k.held += dt; if (k.held < LINTEL47.takeUp) return;   // (the crews take up the slack: a tap lifts nothing)
    const bias = k.drift + k.sway * Math.sin(k.swayW * k.t + k.ph);
    k.tilt = clamp(k.tilt + LINTEL47.G * (k.pull + bias) * dt * 0.5, -LINTEL47.lim, LINTEL47.lim);
    const a = Math.abs(k.tilt);
    if (a >= LINTEL47.lim - 1e-6) { if (!k.out) { k.out = true; k.faults++; } return; }   // (out of the tube: the crews stop and call)
    if (k.out && a < LINTEL47.lim * 0.6) k.out = false;
    if (k.out) return;
    if (a > k.centre) k.off += dt;   // (time off the centre, beyond the window)
    k.y = Math.min(1, k.y + P.rise * (heavy ? 0.85 : 1) * dt);
    if (k.y >= 1 && a <= k.centre) k.phase = 'set';
  }
  /** set: a drag along (px, signed: + toward the screen-right post), then let go → 'tap' | 'ok' (seated) | 'miss' (one end off) | 'done' | 'wait' */
  function set(px, ppa) {   // (ppa: the screen's px per amah there — else LINTEL47.gain)
    if (k.done) return 'done'; if (k.phase !== 'set') return 'wait';
    if (Math.abs(px || 0) < DRAG42) return 'tap';
    k.dx = clamp(k.dx + (ppa > 0 ? (px / ppa) * LINTEL47.fine : px * LINTEL47.gain), -3, 3);
    if (Math.abs(k.dx) <= k.win && Math.abs(k.tilt) <= k.centre) {
      k.done = true; const f = k.faults + k.fix + Math.floor(k.off / LINTEL47.offFault);
      k.q = f <= 0 ? 1 : f <= 2 ? 0.65 : 0.3; return 'ok';
    }
    k.fix++; return 'miss';
  }
  return { hold, slide, step, set, state: () => k, P, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** the DOOR LEAF on its pivot (FIT, v2 §5 — the family's engine, reused later): PIN — a drag down lowers the leaf's pin into its socket; the
 *  drag's angle off the vertical is the pin's (within tol it seats; past it, it stops on the rim — a correction, lifted back, free); a pin
 *  seated off by more than half the tol binds on the first swing. SWING — a flick (a quick drag) swings it: free, and a soft flick, it swings
 *  and closes softly; a hard one slams (a correction); bound, it stops part way — a TAP on the wedge under it frees it, then flick again.
 *  Graded by the corrections: none מהודר. A tap never seats or swings it; never a break. */
export const LEAF47 = Object.freeze({ tol: Object.freeze([null, 16, 11, 8, 6]), hard: 2.6, soft: 0.25, quick: 0.6 });
export function createLeaf47(L = 1) {
  const lv = clamp(L | 0, 1, 4), tol = LEAF47.tol[lv];
  const k = { L: lv, tol, phase: 'pin', rims: 0, wedges: 0, slams: 0, binds: false, bound: false, angle: null, open: 0, done: false, q: null };
  /** a drag down from the leaf: { dx, dy } px → 'tap' | 'rim' | 'seated' | 'done' | 'wait' */
  function pin(dx, dy) {
    if (k.done) return 'done'; if (k.phase !== 'pin') return 'wait';
    if (!(dy >= DRAG42)) return 'tap';
    const a = Math.abs(Math.atan2(dx || 0, dy) * 180 / Math.PI); k.angle = Math.round(a * 10) / 10;
    if (a > tol) { k.rims++; return 'rim'; }
    k.binds = a > tol * 0.5; k.phase = 'swing'; return 'seated';
  }
  /** a flick: { px, sec } → 'tap' | 'binds' | 'slam' | 'ok' | 'weak' | 'done' | 'wait' | 'wedge' */
  function flick(px, sec) {
    if (k.done) return 'done'; if (k.phase !== 'swing') return 'wait';
    if (!(px >= DRAG42) || !(sec > 0)) return 'tap';
    if (k.bound) return 'wedge';
    if (k.binds) { k.bound = true; k.binds = false; k.open = 0.3; return 'binds'; }
    const v = px / sec / 1000;   // (px per ms)
    if (sec > LEAF47.quick * 2 || v < LEAF47.soft) return 'weak';
    if (v > LEAF47.hard) { k.slams++; }
    k.open = 1; k.done = true; const f = k.rims + k.wedges + k.slams; k.q = f <= 0 ? 1 : f <= 2 ? 0.65 : 0.3;
    return v > LEAF47.hard ? 'slam' : 'ok';
  }
  function wedge() { if (k.done || !k.bound) return 'no'; k.bound = false; k.wedges++; k.open = 0; return 'ok'; }
  return { pin, flick, wedge, state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** "שבעת השערים" (מדות א, ד–ה): each gate's name dragged to its gate; a name let go on another gate is a mistake (it flies back, the
 *  Mishnah's words for that gate shown); a tap never places it. No mistake — מהודר; one or two — כשר; more — טעון תיקון. */
export const GATES47 = Object.freeze([
  Object.freeze({ id: 'delek', n: 'שער הדלק', side: 'S', x: -160, z: 71, why: '"שֶׁבַּדָּרוֹם, שַׁעַר הַדֶּלֶק" (מדות א, ד)' }),
  Object.freeze({ id: 'bechorot', n: 'שער הבכורות', side: 'S', x: -118, z: 71, why: 'בדרום: "שֵׁנִי לוֹ, שַׁעַר הַבְּכוֹרוֹת" (מדות א, ד)' }),
  Object.freeze({ id: 'mayim', n: 'שער המים', side: 'S', x: -38, z: 71, why: 'בדרום: "שְׁלִישִׁי לוֹ, שַׁעַר הַמַּיִם" (מדות א, ד)' }),
  Object.freeze({ id: 'moked', n: 'בית המוקד', side: 'N', x: -160, z: -70.5, why: 'בצפון: "שְׁלִישִׁי לוֹ, בֵּית הַמּוֹקֵד" (מדות א, ה)' }),
  Object.freeze({ id: 'korban', n: 'שער הקרבן', side: 'N', x: -95, z: -71, why: 'בצפון: "שֵׁנִי לוֹ, שַׁעַר הַקָּרְבָּן" (מדות א, ה)' }),
  Object.freeze({ id: 'nitzotz', n: 'שער הניצוץ', side: 'N', x: -38, z: -71, why: '"וְשֶׁבַּצָּפוֹן, שַׁעַר הַנִּיצוֹץ" (מדות א, ה)' }),
  Object.freeze({ id: 'nikanor', n: 'שער ניקנור', side: 'E', x: 3, z: 0, why: '"שֶׁבַּמִּזְרָח, שַׁעַר נִקָּנוֹר" (מדות א, ד)' }),
]);
export function createNames47(order) {
  const ids = Array.isArray(order) && order.length === GATES47.length ? order.slice() : GATES47.map((g) => g.id);
  const k = { order: ids, i: 0, set: [], mistakes: 0, last: null, done: false, q: null };
  /** the current name let go: { dragPx, on: gate id | null } → 'tap' | 'off' | 'wrong' | 'ok' | 'done' */
  function drop(d = {}) {
    if (k.done) return 'done'; if (!((d.dragPx || 0) >= DRAG42)) return 'tap'; if (!d.on) return 'off';
    const want = k.order[k.i]; if (d.on !== want) { if (!k.set.includes(d.on)) { k.mistakes++; k.last = { want, got: d.on }; return 'wrong'; } return 'off'; }
    k.set.push(want); k.i++; if (k.i >= k.order.length) { k.done = true; k.q = k.mistakes === 0 ? 1 : k.mistakes <= 2 ? 0.65 : 0.3; }
    return 'ok';
  }
  return { drop, state: () => k, current: () => (k.done ? null : GATES47.find((g) => g.id === k.order[k.i])), result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}

/* ───────── ── build 48 ── stage 05, עזרת הנשים: the shared INSPECT engine (v2 §4.2, §4.4) and the gallery's FIT (v2 §5) ───────── */
/** the wood's defect pool: each a kind with its verdict and its source; the species are told by the bark and the leaf (named at level 1) */
export const WOOD48 = Object.freeze({
  holes: Object.freeze({ he: 'חורי תולעת', bad: true, why: '"וְכָל עֵץ שֶׁנִּמְצָא בוֹ תוֹלַעַת, פָּסוּל מֵעַל גַּבֵּי הַמִּזְבֵּחַ" — מדות ב, ה · טיוטה' }),
  gallery: Object.freeze({ he: 'מחילות תולעת מתחת לקליפה', bad: true, under: true, why: 'תולעת מתחת לקליפה — רואים רק כשמקלפים; "כל עץ שנמצא בו תולעת, פסול" — מדות ב, ה · טיוטה' }),
  olive: Object.freeze({ he: 'עץ זית', bad: true, species: true, why: '"כָּל הָעֵצִים כְּשֵׁרִין לַמַּעֲרָכָה, חוּץ מִשֶּׁל זַיִת וְשֶׁל גֶּפֶן" — תמיד ב, ג · טיוטה' }),
  vine: Object.freeze({ he: 'עץ גפן', bad: true, species: true, why: '"חוּץ מִשֶּׁל זַיִת וְשֶׁל גֶּפֶן" — תמיד ב, ג · טיוטה' }),
  fig: Object.freeze({ he: 'תאנה', bad: false, species: true, why: '"בְּאֵלּוּ רְגִילִין: בְּמֻרְבִּיּוֹת שֶׁל תְּאֵנָה" — תמיד ב, ג · טיוטה' }),
  walnut: Object.freeze({ he: 'אגוז', bad: false, species: true, why: '"וְשֶׁל אֱגוֹז" — תמיד ב, ג · טיוטה' }),
  shemen: Object.freeze({ he: 'עץ שמן', bad: false, species: true, why: '"וְשֶׁל עֵץ שָׁמֶן" — תמיד ב, ג · טיוטה' }),
  knot: Object.freeze({ he: 'קשר בעץ', bad: false, decoy: true, why: 'קשר (סיקוס) נראה כמו חור — אבל אין בו מחילה; כשר · המחשה' }),
  scar: Object.freeze({ he: 'צלקת בקליפה', bad: false, decoy: true, why: 'צלקת בקליפה — לא תולעת; כשר · המחשה' }),
  drop: Object.freeze({ he: 'לשלשת ציפורים', bad: false, decoy: true, wipe: true, why: 'לשלשת — מנגבים, ונשאר עץ נקי · המחשה' }),
});
export const WOOD48_TYPES = Object.freeze(Object.keys(WOOD48));
/** the shuffle-bag (v2 §4.4): every type once before any repeats; never the same type twice in a row — across refills too */
export function createBag48(saved, rnd = Math.random, types = WOOD48_TYPES) {
  const k = saved && Array.isArray(saved.bag) ? { bag: saved.bag.filter((t) => types.includes(t)), last: saved.last || null } : { bag: [], last: null };
  const shuffle = () => { const a = types.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  function draw() {
    if (!k.bag.length) { k.bag = shuffle(); if (k.bag[0] === k.last && k.bag.length > 1) [k.bag[0], k.bag[1]] = [k.bag[1], k.bag[0]]; }
    const t = k.bag.shift(); k.last = t; return t;
  }
  return { draw, state: () => k };
}
/** a log in hand: four faces round it; the defect (or the species) on one face, at a place, a size and a turn of its own. A vertical swipe
 *  turns it; a swipe along it PEELS the bark of the face in view (and wipes what lies on it); a tap MARKS a spot; a drag to a pile DECIDES
 *  (a tap never decides). Verdict: a good log rejected — כשר (a waste, no harm); a bad log to the altar — טעון תיקון (removed, with the reason). */
const SPECIES48 = ['fig', 'walnut', 'shemen'];
export function createLog48(type, rnd = Math.random, L = 1) {
  const T = WOOD48[type] || WOOD48.knot, sp = T.species ? type : SPECIES48[Math.floor(rnd() * 3)];
  const k = { type, species: sp, bad: !!T.bad, face: 0, at: { face: Math.floor(rnd() * 4), u: 0.18 + rnd() * 0.64, v: 0.25 + rnd() * 0.5, size: 0.7 + rnd() * 0.6, turn: rnd() * 6.28 },
    peeled: [false, false, false, false], wiped: false, marks: [], turns: 0, decided: null, right: null, L: clamp(L | 0, 1, 4) };
  if (T.species) k.at.face = -1;   // (the species: on every face)
  const visible = () => { if (k.at.face < 0) return true; if (k.at.face !== k.face) return false; if (T.under) return k.peeled[k.face]; if (T.wipe) return !k.wiped; return true; };
  function turn(dir) { if (k.decided) return 'done'; k.face = (k.face + (dir < 0 ? 3 : 1)) % 4; k.turns++; return 'turn'; }
  function peel(px) { if (k.decided) return 'done'; if (!(px >= DRAG42)) return 'tap'; const was = k.peeled[k.face]; k.peeled[k.face] = true; if (T.wipe && k.at.face === k.face) k.wiped = true; return was ? 'again' : 'peel'; }
  function mark(u, v) { if (k.decided) return 'done'; const hit = visible() && k.at.face >= 0 && Math.abs(u - k.at.u) < 0.12 && Math.abs((v == null ? k.at.v : v) - k.at.v) < 0.3; k.marks.push({ face: k.face, u, hit }); return hit ? 'hit' : 'mark'; }
  /** toAltar: true — "למערכה", false — "לא למזבח" → 'tap' | 'ok' | 'waste' (a good log rejected) | 'bad' (a bad log accepted) | 'done' */
  function decide(toAltar, px) {
    if (k.decided) return 'done'; if (!(px >= DRAG42)) return 'tap';
    k.decided = toAltar ? 'altar' : 'out'; k.right = toAltar ? !k.bad : k.bad;
    return k.right ? 'ok' : toAltar ? 'bad' : 'waste';
  }
  return { turn, peel, mark, decide, visible, state: () => k, T };
}
/** the wood's grade over the chamber's logs: all right מהודר; a good log rejected (only) כשר; a bad log to the altar טעון תיקון */
export function woodGrade48(results) { const bad = results.some((r) => r === 'bad'), waste = results.some((r) => r === 'waste'); return bad ? 0.3 : waste ? 0.65 : 1; }
/** the GALLERY (גזוזטרא, מדות ב, ה): its beams into the wall's sockets — the corner beams first, else the next ones will not go in (blocked:
 *  an order mistake, undone free); each beam set at its socket is pushed in: the push's angle off the socket's line is the beam's — within the
 *  tolerance it enters and locks; past it, it stops at the rim (a correction, no damage). A tap never sets or pushes. */
export const GAL48 = Object.freeze({ tol: Object.freeze([null, 20, 14, 10, 7]), sockets: Object.freeze(['corner', 'next', 'next', 'next', 'corner']) });
export function createGallery48(L = 1, kinds = GAL48.sockets) {
  const lv = clamp(L | 0, 1, 4), tol = GAL48.tol[lv];
  const k = { L: lv, tol, kinds: kinds.slice(), set: kinds.map(() => null), locked: kinds.map(() => false), order: 0, wrong: 0, rims: 0, done: false, q: null };
  const cornersIn = () => k.kinds.every((t, i) => t !== 'corner' || k.locked[i]);
  /** a beam (its kind) let go at socket i: { dragPx } → 'tap' | 'blocked' | 'wrong' | 'taken' | 'ok' | 'done' */
  function place(i, kind, d = {}) {
    if (k.done) return 'done'; if (!((d.dragPx || 0) >= DRAG42)) return 'tap'; if (!(i >= 0 && i < k.kinds.length)) return 'off';
    if (k.set[i]) return 'taken';
    if (kind !== k.kinds[i]) { k.wrong++; return 'wrong'; }
    if (kind !== 'corner' && !cornersIn()) { k.order++; return 'blocked'; }
    k.set[i] = kind; return 'ok';
  }
  /** push the beam at socket i: the drag (dx, dy) against the socket's line (ax, ay) → 'tap' | 'rim' | 'lock' | 'wait' | 'done' */
  function push(i, dx, dy, ax, ay) {
    if (k.done) return 'done'; if (!k.set[i] || k.locked[i]) return 'wait';
    const n = Math.hypot(dx, dy); if (!(n >= DRAG42)) return 'tap';
    const a = Math.abs(Math.atan2(dx * ay - dy * ax, dx * ax + dy * ay) * 180 / Math.PI);
    if (a > tol) { k.rims++; return 'rim'; }
    k.locked[i] = true;
    if (k.locked.every(Boolean)) { k.done = true; const f = k.order + k.wrong + k.rims; k.q = f <= 0 ? 1 : f <= 2 ? 0.65 : 0.3; }
    return 'lock';
  }
  return { place, push, cornersIn, state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** TENON & PEG (v2 §5 "שגם ויתד"): slide the tenon into its mortise (a drag along it: its angle within the tolerance, else it stops — a
 *  correction); then taps on the peg with the mallet drive it in a little each (the pitch rises as it goes in); when it LOCKS the sound
 *  changes — stop; a tap after the lock splits it (a correction: a new peg, free — drive it again); left alone a moment after the lock, done. */
export const PEG48 = Object.freeze({ step: Object.freeze([0.16, 0.27]), idle: 1.2, tol: Object.freeze([null, 18, 13, 10, 8]) });
export function createPeg48(L = 1, rnd = Math.random) {
  const lv = clamp(L | 0, 1, 4), tol = PEG48.tol[lv];
  const k = { L: lv, tol, tenon: false, rims: 0, depth: 0, locked: false, over: 0, idle: 0, taps: 0, done: false, q: null };
  function tenon(dx, dy, ax, ay) {
    if (k.done) return 'done'; if (k.tenon) return 'in'; const n = Math.hypot(dx, dy); if (!(n >= DRAG42)) return 'tap';
    const a = Math.abs(Math.atan2(dx * ay - dy * ax, dx * ax + dy * ay) * 180 / Math.PI); if (a > tol) { k.rims++; return 'rim'; }
    k.tenon = true; return 'in';
  }
  function tap() {
    if (k.done) return 'done'; if (!k.tenon) return 'wait'; k.taps++; k.idle = 0;
    if (k.locked) { k.over++; k.locked = false; k.depth = 0; return 'split'; }
    k.depth = Math.min(1, k.depth + PEG48.step[0] + rnd() * (PEG48.step[1] - PEG48.step[0]));
    if (k.depth >= 1) { k.locked = true; if (k.over >= 2) { k.done = true; const f = k.rims + k.over; k.q = f <= 2 ? 0.65 : 0.3; } return 'lock'; }   // (after two split pegs the third holds as it locks — the master's hand on the mallet: the naive kid K48-P3 split and split for a minute)
    return 'in';
  }
  function step(dt) { if (k.done || !k.locked) return; k.idle += dt; if (k.idle >= PEG48.idle) { k.done = true; const f = k.rims + k.over; k.q = f <= 0 ? 1 : f <= 2 ? 0.65 : 0.3; } }
  return { tenon, tap, step, state: () => k, pitch: () => 280 + k.depth * 380, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}

/* ───────── ── build 49 ── stage 06, שער ניקנור: the STORM (the voyage, v2 §11 — the approved two-thumb exception), the LEVER & WEDGE (v2 §2),
 * the FIFTEEN STEPS tuned by ear (v2 §3) ───────── */
/** the storm: waves one by one, each telegraphed (a swell rising on its side: `tele`), then its push (`push`), then a breath (`rest`). The deck's
 *  heel h integrates the wave's push and the LEFT thumb's balance b (−1…1, the slide from where it went down): dh/dt = K·(p + b) − D·h, so the
 *  balance must answer the push. Past the line (|h| > line) — counted once a wave; beaten (|h| ≥ 1) — that wave REPLAYS (no failure, counted).
 *  The RIGHT thumb holds the second door's ropes: let go more than `slack` s in a push, the door slides — that wave replays. After the third
 *  wave the sailors throw the first door overboard (a scene, never his fault: `throw`). The last wave is the hug — "הטילוני עמה לים": the right
 *  thumb must stay on the door the whole push (else the sailors take it: replay). Then the sea calms at once. A tap holds nothing (take-up). */
export const STORM49 = Object.freeze({
  K: 2.4, D: 1.2, line: 0.55, beat: 1, tele: 1.5, push: 2.4, rest: 0.9, throwT: 4.2, slack: 1.5, takeUp: 0.25,
  waves: Object.freeze([1, -1, 1, -1, 1, -1, 1, -1]), str: Object.freeze([null, 0.8, 0.9, 1, 1.1]),   // (eight waves — the storm long enough to be one)
});
export function createStorm49(L = 1, o = {}) {
  const lv = clamp(L | 0, 1, 4), P = STORM49, W = o.waves || P.waves, last = W.length - 1;
  const k = { L: lv, i: 0, ph: 'tele', t: 0, h: 0, b: 0, hold: false, held: 0, slackT: 0, crossed: false, crossings: 0, replays: 0, thrown: false, done: false, q: null, p: 0, why: null, hug: false };
  const str = (i) => P.str[lv] * (i === last ? 1.15 : 1);
  function balance(b) { k.b = clamp(+b || 0, -1, 1); }
  function holdOn(on) { if (on && !k.hold) k.held = 0; k.hold = !!on; }
  const holding = () => k.hold && k.held >= P.takeUp;
  function replay(why) { k.replays++; k.why = why; k.h = 0; k.ph = 'tele'; k.t = 0; k.crossed = false; k.slackT = 0; }
  function step(dt) {
    if (k.done) return; if (k.hold) k.held += dt;
    k.t += dt; k.hug = k.i === last;
    if (k.ph === 'throw') { k.h *= Math.max(0, 1 - dt * 2); k.p = 0; if (k.t >= P.throwT) { k.thrown = true; k.ph = 'tele'; k.t = 0; k.i++; } return; }
    const u = k.ph === 'push' ? Math.min(1, k.t / P.push) : 0; k.p = k.ph === 'push' ? W[k.i] * str(k.i) * Math.sin(Math.PI * u) : 0;
    k.h += (P.K * (k.p + k.b) - P.D * k.h) * dt;
    if (k.ph === 'push') {
      if (!holding()) k.slackT += dt; else k.slackT = Math.max(0, k.slackT - dt * 2);
      if (Math.abs(k.h) > P.line && !k.crossed) { k.crossed = true; k.crossings++; }
      if (Math.abs(k.h) >= P.beat) { replay('heel'); return; }
      if (k.hug ? k.slackT > 0.35 : k.slackT > P.slack) { replay(k.hug ? 'hug' : 'ropes'); return; }
    }
    if (k.ph === 'tele' && k.t >= P.tele) { k.ph = 'push'; k.t = 0; }
    else if (k.ph === 'push' && k.t >= P.push) { k.ph = 'rest'; k.t = 0; }
    else if (k.ph === 'rest' && k.t >= P.rest) {
      k.t = 0; k.crossed = false; k.slackT = 0;
      if (k.i >= last) { k.done = true; const f = k.crossings + k.replays; k.q = f <= 0 ? 1 : f <= 2 ? 0.65 : 0.3; return; }
      if (k.i === 2 && !k.thrown) { k.ph = 'throw'; return; }
      k.i++; k.ph = 'tele';
    }
  }
  return { balance, holdOn, step, state: () => k, P, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null), dirAt: () => W[k.i] };
}
/** the LEVER & WEDGE (v2 §2): the bronze leaf raised notch by notch — a LONG drag down on the lever (≥ long px) lifts it one notch at the drag's
 *  end; at the top it holds for `win` s: a TAP then slides a wedge under it (the notch kept); missed — it sinks back a notch (a correction). A
 *  short drag lifts a little and it settles back (nothing). Taps never lift. */
export const LEVER49 = Object.freeze({ notches: Object.freeze([null, 4, 4, 5, 5]), win: Object.freeze([null, 1.6, 1.3, 1.05, 0.85]), long: 0.22 });
export function createLever49(L = 1) {
  const lv = clamp(L | 0, 1, 4), n = LEVER49.notches[lv], win = LEVER49.win[lv];
  const k = { L: lv, n, win, notch: 0, up: false, upT: 0, misses: 0, shorts: 0, done: false, q: null };
  /** a drag on the lever: dy (px, + down), H (the screen's height) → 'tap' | 'short' | 'up' | 'busy' | 'done' */
  function pump(dy, H) { if (k.done) return 'done'; if (k.up) return 'busy'; if (!(dy >= DRAG42)) return 'tap'; if (dy < LEVER49.long * (H || 400)) { k.shorts++; return 'short'; } k.up = true; k.upT = 0; return 'up'; }
  function wedge() { if (k.done || !k.up) return 'no'; k.up = false; k.notch++; if (k.notch >= k.n) { k.done = true; const f = k.misses; k.q = f <= 0 ? 1 : f <= 2 ? 0.65 : 0.3; return 'done'; } return 'ok'; }
  function step(dt) { if (k.done || !k.up) return null; k.upT += dt; if (k.upT >= k.win) { k.up = false; k.misses++; return 'sank'; } return null; }
  return { pump, wedge, step, state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** the FIFTEEN STEPS (מדות ב, ה: "מֻקָּפוֹת כַּחֲצִי גֹרֶן עֲגֻלָּה"): each curved step stone dragged onto its arc; let go on the arc's line (|err|
 *  ≤ tol, in step-depths) it lies level and its note rings true; off it, it lies tilted — off-key — and slides back (a correction). A tap never
 *  places. 15 steps, 15 notes: the tune he built */
export const STEPS49 = Object.freeze({ n: 15, tol: Object.freeze([null, 0.6, 0.48, 0.38, 0.3]), scale: Object.freeze([0, 2, 4, 7, 9]) });
export function createSteps49(L = 1, n = STEPS49.n) {
  const lv = clamp(L | 0, 1, 4), tol = STEPS49.tol[lv];
  const k = { L: lv, n, tol, i: 0, off: 0, notes: [], done: false, q: null };
  /** the stone let go: { dragPx, err } (err: the drop's distance from the arc's line, in step-depths) → 'tap' | 'off' | 'true' | 'done' */
  function drop(d = {}) {
    if (k.done) return 'done'; if (!((d.dragPx || 0) >= DRAG42)) return 'tap';
    if (!(Math.abs(d.err) <= tol)) { k.off++; return 'off'; }
    const s = STEPS49.scale, deg = s[k.i % s.length] + 12 * Math.floor(k.i / s.length); k.notes.push(deg); k.i++;
    if (k.i >= k.n) { k.done = true; const f = k.off; k.q = f <= 1 ? 1 : f <= 4 ? 0.65 : 0.3; }
    return 'true';
  }
  return { drop, state: () => k, freq: (deg) => 220 * Math.pow(2, deg / 12), result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}

/* ── build 50 ── stage 07, הלשכות: "קשתות ועיגולים" (v2 §10 "07", §3 the compass, the arch and dome; §2/§5 the wheel). Never a Divine Name. */
/** the COMPASS (לשכת הגזית — "כחצי גורן עגולה", סנהדרין ד, ג): a HOLD at the centre plants the peg (`plant` s); then the finger sweeps round
 *  it and the rope marks the arc. Each sample: its angle (rad) and its radius relative to the rope's (dev = r/R − 1): pulled in, the rope
 *  slackens; out, it strains (both shown). Done when `span` degrees are covered (a jump over 0.5 rad is not a sweep). The grade: the arc's
 *  RMS deviation against `tol` (מהודר ≤ tol; כשר ≤ 2·tol). A tap neither plants nor sweeps */
export const COMPASS50 = Object.freeze({ plant: 0.5, span: 180, jump: 0.5, slack: -0.06, strain: 0.06, tol: Object.freeze([null, 0.08, 0.065, 0.05, 0.04]) });
export function createCompass50(L = 1) {
  const lv = clamp(L | 0, 1, 4), P = COMPASS50, tol = P.tol[lv];
  const k = { L: lv, tol, planted: false, holdT: 0, a: null, cum: 0, lo: 0, hi: 0, n: 0, sq: 0, max: 0, dev: 0, rope: 'taut', done: false, q: null, lifts: 0 };
  function hold(dt, onCentre) { if (k.planted || k.done) return k.planted; if (onCentre) { k.holdT += dt; if (k.holdT >= P.plant) k.planted = true; } else k.holdT = 0; return k.planted; }
  function sweep(angle, dev) {
    if (!k.planted || k.done) return null;
    if (k.a != null) { let d = angle - k.a; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; if (Math.abs(d) > P.jump) { k.a = angle; return k.rope; } k.cum += d; k.lo = Math.min(k.lo, k.cum); k.hi = Math.max(k.hi, k.cum); }
    if (k.a0 == null) k.a0 = angle; k.a = angle; k.dev = dev; k.n++; k.sq += dev * dev; k.max = Math.max(k.max, Math.abs(dev)); k.rope = dev < P.slack ? 'slack' : dev > P.strain ? 'strain' : 'taut';
    if ((k.hi - k.lo) * 180 / Math.PI >= P.span) { k.done = true; const rms = Math.sqrt(k.sq / Math.max(1, k.n)); k.rms = rms; k.q = rms <= tol ? 1 : rms <= 2 * tol ? 0.65 : 0.3; }
    return k.rope;
  }
  function lift() { if (k.planted && !k.done) { k.a = null; k.lifts++; } }
  const covered = () => (k.hi - k.lo) * 180 / Math.PI;
  return { hold, sweep, lift, covered, state: () => k, P, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** the WHEEL's HUB (לשכת הגולה — "וְהַגַּלְגַּל נָתוּן עָלָיו", מדות ה, ד): a drag across turns the hub with the finger; a spoke dragged in
 *  fits only while an empty slot stands at the top (|err| ≤ tol) — else it jams (a correction). A tap fits nothing. Eight spokes */
export const HUB50 = Object.freeze({ n: 8, gain: 0.4, tol: Object.freeze([null, 18, 14, 10, 7]) });   // (build 50: the naive kid K50-P turned and missed for 170 s at 15°)
export function createHub50(L = 1) {
  const lv = clamp(L | 0, 1, 4), P = HUB50, tol = P.tol[lv];
  const k = { L: lv, tol, angle: 0, filled: Array(P.n).fill(false), jams: 0, done: false, q: null };
  const wrap = (d) => { d = ((d % 360) + 540) % 360 - 180; return d; };
  /** the empty slot nearest the top and its error (deg; the slot i stands at i·45° + the hub's angle) */
  function nearest() { let best = null; for (let i = 0; i < P.n; i++) { if (k.filled[i]) continue; const e = wrap(i * (360 / P.n) + k.angle); if (!best || Math.abs(e) < Math.abs(best.err)) best = { i, err: e }; } return best; }
  function turn(dxPx) { if (!k.done) k.angle += (+dxPx || 0) * P.gain; return k.angle; }   // (live, with the finger)
  function insert(d = {}) {
    if (k.done) return 'done'; if (!((d.dragPx || 0) >= DRAG42)) return 'tap';
    const nb = nearest(); if (!nb || Math.abs(nb.err) > tol) { k.jams++; return 'jam'; }
    k.filled[nb.i] = true; k.angle -= nb.err;
    if (k.filled.every(Boolean)) { k.done = true; k.q = k.jams <= 1 ? 1 : k.jams <= 3 ? 0.65 : 0.3; return 'done'; }
    return 'ok';
  }
  return { turn, insert, nearest, state: () => k, P, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** the WHEEL turned (LIFT): HOLD — the wheel gathers speed (after `takeUp` s: a tap is nothing); let go — it slows. The bucket rises with the
 *  turning; over `spill` (speed) the water spills from it. Three buckets; each delivered with what is left in it. Full buckets — מהודר */
export const WINCH50 = Object.freeze({ buckets: 3, takeUp: 0.25, acc: 0.9, fric: 0.7, vmax: 2.4, rise: 0.3, spillRate: 0.45, spill: Object.freeze([null, 1.6, 1.4, 1.25, 1.1]) });
export function createWinch50(L = 1) {
  const lv = clamp(L | 0, 1, 4), P = WINCH50, sp = P.spill[lv];
  const k = { L: lv, spill: sp, v: 0, h: 0, i: 0, full: 1, hold: false, held: 0, spills: 0, spilling: false, got: [], done: false, q: null };
  function hold(on) { if (on && !k.hold) k.held = 0; k.hold = !!on; }
  function step(dt) {
    if (k.done) return null; if (k.hold) k.held += dt;
    k.v = k.hold && k.held >= P.takeUp ? Math.min(P.vmax, k.v + P.acc * dt) : Math.max(0, k.v - P.fric * dt);
    k.h += k.v * P.rise * dt;
    const was = k.spilling; k.spilling = k.v > sp && k.full > 0; if (k.spilling) { k.full = Math.max(0, k.full - P.spillRate * dt); if (!was) k.spills++; }
    if (k.h >= 1) { k.got.push(Math.round(k.full * 100) / 100); k.i++; k.h = 0; k.full = 1; k.v *= 0.3; if (k.i >= P.buckets) { k.done = true; const m = k.got.reduce((a, b) => a + b, 0) / k.got.length; k.q = m >= 0.9 ? 1 : m >= 0.6 ? 0.65 : 0.3; return 'done'; } return 'bucket'; }
    return k.spilling ? 'spill' : null;
  }
  return { hold, step, state: () => k, P, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** the ARCH and the DOME (בית המוקד — "כִּפָּה", מדות א, ח): voussoirs on the wooden centering, ALTERNATELY left and right — a stone that
 *  would put one side two ahead tilts the centering (refused, a correction); the KEYSTONE last (before the sides are full — refused, a
 *  correction). Then taps knock out the wedges under the centering; the last one out: the centering drops and THE DOME HOLDS — only with its
 *  keystone (before it, a tap knocks nothing). A tap never sets a stone */
export const ARCH50 = Object.freeze({ side: Object.freeze([null, 3, 4, 4, 5]), wedges: 4 });
export function createArch50(L = 1) {
  const lv = clamp(L | 0, 1, 4), P = ARCH50;
  const k = { L: lv, n: P.side[lv], left: 0, right: 0, key: false, tilts: 0, early: 0, wedges: P.wedges, out: 0, holds: false, done: false, q: null };
  function place(side, d = {}) {
    if (k.key) return 'full'; if (!((d.dragPx || 0) >= DRAG42)) return 'tap';
    const l = k.left + (side === 'L' ? 1 : 0), r = k.right + (side === 'R' ? 1 : 0);
    if ((side === 'L' ? k.left : k.right) >= k.n) return 'full';
    if (Math.abs(l - r) > 1) { k.tilts++; return 'tilt'; }
    k.left = l; k.right = r; return 'ok';
  }
  function keystone(d = {}) { if (k.key) return 'full'; if (!((d.dragPx || 0) >= DRAG42)) return 'tap'; if (k.left < k.n || k.right < k.n) { k.early++; return 'early'; } k.key = true; return 'ok'; }
  const balance = () => k.left - k.right;
  function strike() {
    if (k.done) return 'done'; if (!k.key) return 'no';
    k.out++; if (k.out < k.wedges) return 'out';
    k.holds = true; k.done = true; const f = k.tilts + k.early; k.q = f <= 0 ? 1 : f <= 2 ? 0.65 : 0.3; return 'holds';
  }
  return { place, keystone, balance, strike, state: () => k, P, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}

/* ───────── ── build 55 ── stage 08, היסוד (docs/specs/shlav-alef-08-16-he.md §2, §3 "08"): the altar's field stones — the INSPECT family's
 *  stone (turned face by face, wiped, felt along its edge, seen against the light), the PLACE family's field stones (an untrimmed puzzle — no
 *  snapping) and the last row of the yesod (only where there is one: Middot 3:1). Kasher ➡, pasul ⬅ (§1 rule 13). ───────── */
/** the stones' defect pool: each a kind with its verdict and its source */
export const STONE55 = Object.freeze({
  crack: Object.freeze({ he: 'סדק', bad: true, why: '"וּבִפְגִימָה לְכָל דָּבָר" — מדות ג, ד · טיוטה' }),
  mud: Object.freeze({ he: 'כתם בוץ', bad: false, decoy: true, wipe: true, why: 'בוץ — מנגבים, ונשארת אבן שלמה · המחשה' }),
  mudcrack: Object.freeze({ he: 'סדק מתחת לבוץ', bad: true, wipe: true, under: true, why: 'מתחת לבוץ — סדק; "וּבִפְגִימָה לְכָל דָּבָר" — מדות ג, ד · טיוטה' }),
  whole: Object.freeze({ he: 'אבן שלמה', bad: false, why: '"אֲבָנִים שְׁלֵמוֹת" — דברים כז, ו · טיוטה' }),
  nick: Object.freeze({ he: 'פגימה בשפה', bad: true, edge: true, why: '"וכמה פגימת המזבח — כדי שתחגור בה צפורן" — חולין יח ע"א · טיוטה' }),
  iron: Object.freeze({ he: 'נגיעת ברזל', bad: true, glint: true, why: '"שֶׁהַבַּרְזֶל פּוֹסֵל בִּנְגִיעָה" — מדות ג, ד · טיוטה' }),
  hair: Object.freeze({ he: 'סדק נסתר', bad: true, raking: true, why: 'רק באור צד; "וּבִפְגִימָה לְכָל דָּבָר" — מדות ג, ד · טיוטה' }),   // ── build 56 ──
  deep: Object.freeze({ he: 'סדק עמוק', bad: true, ring: true, why: 'צליל עמום; "וּבִפְגִימָה לְכָל דָּבָר" — מדות ג, ד · טיוטה' }),
  // ── build 57 ── stage 10's decoys: they look like flaws and are not — each its own page in ספר הפגימות ── /build 57 ──
  moss: Object.freeze({ he: 'טחב', bad: false, decoy: true, wipe: true, page: 'טחב — לא פגימה', why: 'טחב — מנגבים, ונשארת אבן שלמה · המחשה' }),
  fossil: Object.freeze({ he: 'מאובן של צדפה', bad: false, decoy: true, mark: 'fossil', page: 'מאובן — לא פגימה', why: 'נשאר אחרי ניגוב, והאצבע עוברת חלק — טבע, לא פגימה · המחשה' }),
  pits: Object.freeze({ he: 'גומות טבעיות', bad: false, decoy: true, mark: 'pits', page: 'גומות — לא פגימה', why: 'האצבע לא נתפסת — טבע, לא פגימה · המחשה' }),
});
/** ── build 57 ── the decoys' pages in the book (the mud's too — build 55's decoy) */
export const PAGE57 = Object.freeze({ mud: 'בוץ — לא פגימה', moss: 'טחב — לא פגימה', fossil: 'מאובן — לא פגימה', pits: 'גומות — לא פגימה' });
export const STONE55_TYPES = Object.freeze(Object.keys(STONE55));
/** the bag's types by level: the first inspection (level 1) — a crack, a mud stain, a whole stone; then the mud over a crack; after the twist — iron */
export const BAG55 = Object.freeze({ 1: Object.freeze(['crack', 'mud', 'whole']), 2: Object.freeze(['crack', 'mud', 'whole', 'mudcrack']), iron: Object.freeze(['crack', 'mud', 'whole', 'mudcrack', 'iron']) });
/** a stone on the bench: four faces round it; its defect on one face at a place; at level 1 a mud stain as a decoy on another face. A quick
 *  swipe ↔ turns it; rubbing WIPES the face in view (the mud goes); a drag to a heap DECIDES — kasher ➡ "למזבח", pasul ⬅ "לא למזבח" */
export function createStone55(type, rnd = Math.random, L = 1) {
  const T = STONE55[type] || STONE55.whole, lv = clamp(L | 0, 1, 4);
  const f0 = T.raking || T.ring ? 0 : lv <= 1 ? (type === 'iron' ? 0 : rnd() < 0.5 ? 0 : 1) : 1 + Math.floor(rnd() * 3);   // (build 56: the raking light's crack and the mallet's on the face in view)   // (level 1: the crack on the face in view or the next one; the iron's face in view — its glint still only at its angle)
  const k = { type, bad: !!T.bad, face: 0, L: lv, at: { face: T.edge ? -1 : f0, u: 0.25 + rnd() * 0.5, v: 0.3 + rnd() * 0.4, len: 0.45 + rnd() * 0.3, seed: Math.floor(rnd() * 1e6) },
    mud: -1, wiped: 0, turns: 0, decided: null, right: null };
  if (T.wipe) k.mud = k.at.face;
  else if (lv <= 1 && !T.edge && !T.glint && !T.raking && !T.ring) k.mud = (k.at.face + 2) % 4;   // (the decoy, on the face opposite)
  const covered = () => k.mud >= 0 && k.wiped < 1;
  /** what shows on the face in view: 'crack' | 'mud' | 'glint' | null */
  const shows = () => { if (k.mud === k.face && covered()) return 'mud'; if (k.at.face !== k.face) return null; return type === 'crack' || type === 'mudcrack' ? 'crack' : type === 'iron' ? 'glint' : type === 'hair' ? 'hair' : null; };
  function turn(dir) { if (k.decided) return 'done'; k.face = (k.face + (dir < 0 ? 3 : 1)) % 4; k.turns++; return 'turn'; }
  /** rubbing on the face in view: amount 0…1 of a full wipe */
  function wipe(amount) { if (k.decided) return 'done'; if (k.mud !== k.face || k.wiped >= 1) return 'clean'; k.wiped = Math.min(1, k.wiped + Math.max(0, amount)); return k.wiped >= 1 ? 'wiped' : 'wiping'; }
  function decide(toAltar, px) {
    if (k.decided) return 'done'; if (!(px >= DRAG42)) return 'tap';
    k.decided = toAltar ? 'altar' : 'out'; k.right = toAltar ? !k.bad : k.bad;
    return k.right ? 'ok' : toAltar ? 'bad' : 'waste';
  }
  return { turn, wipe, decide, shows, covered, state: () => k, T };
}
/** the stones' grade: as the wood's — all right מהודר; a good stone rejected (only) כשר; a bad stone to the altar טעון תיקון */
export function stoneGrade55(results) { return woodGrade48(results); }
/** the FINGERNAIL (חולין יח ע"א): a finger slid slowly along the edge (0…1); at the nick it catches. Faster than vmax edges a second: "לאט" */
export const NAIL55 = Object.freeze({ vmax: Object.freeze([null, 0.95, 0.8, 0.7, 0.6]), w: 0.05, bins: 20 });
export function createNail55(hasNick, rnd = Math.random, L = 2) {
  const lv = clamp(L | 0, 1, 4), k = { nick: hasNick ? 0.18 + rnd() * 0.64 : null, caught: false, fast: 0, bins: new Array(NAIL55.bins).fill(0), L: lv, decided: null, right: null };
  /** the finger from u0 to u1 in dt seconds → 'fast' | 'caught' | 'ok' | 'done' */
  function slide(u0, u1, dt) {
    if (k.decided) return 'done'; if (k.caught) return 'caught';
    const a = clamp(Math.min(u0, u1), 0, 1), b = clamp(Math.max(u0, u1), 0, 1), v = (b - a) / Math.max(1e-3, dt);
    if (v > NAIL55.vmax[lv]) { k.fast++; return 'fast'; }
    for (let i = Math.floor(a * NAIL55.bins); i <= Math.min(NAIL55.bins - 1, Math.floor(b * NAIL55.bins)); i++) k.bins[i] = 1;
    if (k.nick != null && b >= k.nick - NAIL55.w && a <= k.nick + NAIL55.w) { k.caught = true; return 'caught'; }
    return 'ok';
  }
  const felt = () => k.bins.reduce((s, x) => s + x, 0) / NAIL55.bins;
  function decide(toAltar, px) {
    if (k.decided) return 'done'; if (!(px >= DRAG42)) return 'tap';
    k.decided = toAltar ? 'altar' : 'out'; const bad = k.nick != null; k.right = toAltar ? !bad : bad;
    return k.right ? 'ok' : toAltar ? 'bad' : 'waste';
  }
  return { slide, felt, decide, state: () => k };
}
/** FIELD STONES (the yesod's first course, untrimmed — the contrast to the hewn stone before): each gap has its stone, turned one way. A tap
 *  turns a stone a quarter; a drag lays it where it is let go — no snapping: within `tight` of the gap's middle it closes it; within `loose`
 *  it lies with a sliver open (a fill stone from the heap closes it); further, or the wrong stone or turn, it does not go in.
 *  Grade: no fill מהודר; up to two כשר; more טעון תיקון */
export const FIELD55 = Object.freeze({ tight: Object.freeze([null, 0.45, 0.35, 0.28, 0.22]), loose: 0.95, kasherFills: 2 });
export function createField55(n = 3, rnd = Math.random, L = 1) {
  const lv = clamp(L | 0, 1, 4), order = [0, 1, 2, 3].slice(0, Math.max(2, Math.min(4, n)));
  for (let i = order.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  const k = { L: lv, gaps: order.map((shape) => ({ shape, rot: 1 + Math.floor(rnd() * 3), stone: -1, sliver: false })), stones: order.map((_, i) => ({ shape: i < order.length ? [...order].sort()[i] : 0, rot: 0, gap: -1 })), fills: 0, extra: 0, misses: 0, done: false, q: null };
  function rotate(i) { const s = k.stones[i]; if (!s || s.gap >= 0 || k.done) return 'no'; s.rot = (s.rot + 1) % 4; return 'turn'; }
  /** stone i let go at distance `off` (amot) from gap g's middle → 'nofit' | 'tight' | 'gap' | 'busy' | 'no' */
  function drop(i, g, off) {
    const s = k.stones[i], G = k.gaps[g]; if (!s || !G || s.gap >= 0 || k.done) return 'no'; if (G.stone >= 0) return 'busy';
    const turned = s.rot !== G.rot && lv <= 1;   // (level 1 forgives the turn — §1 rule 7: the stone settles turned, a sliver left for a fill stone)
    if (s.shape !== G.shape || (s.rot !== G.rot && !turned) || !(off <= FIELD55.loose)) { k.misses++; return 'nofit'; }
    if (turned) s.rot = G.rot;
    s.gap = g; G.stone = i; G.sliver = turned || off > FIELD55.tight[lv]; end(); return G.sliver ? 'gap' : 'tight';
  }
  /** a fill stone into gap g → 'filled' | 'extra' (no sliver there: an unneeded fill) | 'no' */
  function fill(g) { const G = k.gaps[g]; if (!G || k.done) return 'no'; if (G.stone < 0) return 'no'; if (G.sliver) { G.sliver = false; k.fills++; end(); return 'filled'; } k.extra++; return 'extra'; }
  function end() { if (k.gaps.every((G) => G.stone >= 0 && !G.sliver)) { k.done = true; const f = k.fills + k.extra; k.q = f === 0 ? 1 : f <= FIELD55.kasherFills ? 0.65 : 0.3; } }
  return { rotate, drop, fill, state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** the four field-stone shapes (outline points, amot, about their middle): no two alike, none symmetric under a quarter turn */
export const SHAPES55 = Object.freeze([
  Object.freeze([[-0.85, -0.45], [0.2, -0.62], [0.82, -0.2], [0.7, 0.5], [-0.15, 0.6], [-0.78, 0.25]]),
  Object.freeze([[-0.7, -0.6], [0.75, -0.5], [0.85, 0.15], [0.3, 0.62], [-0.55, 0.55], [-0.9, -0.05]]),
  Object.freeze([[-0.6, -0.65], [0.55, -0.6], [0.88, 0.05], [0.45, 0.6], [-0.85, 0.48]]),
  Object.freeze([[-0.88, -0.3], [-0.3, -0.66], [0.62, -0.55], [0.8, 0.35], [0.1, 0.64], [-0.62, 0.42]]),
]);
/** THE LAST ROW, ALONE (מדות ג, א): the yesod runs along all the north and all the west, and one amah into the south and one into the east.
 *  Slots in the altar's own frame (x from its west 0…32, z from its north 0…32): the north and the west in four stretches each (the first two
 *  of each laid by the crews), and the two amah-long ends. A stone let go on the rim where there is no yesod: "כאן אין יסוד" — back to the
 *  heap, no penalty. Grade: one stray or none מהודר, else כשר. */
export const LAST55 = Object.freeze({
  slots: Object.freeze([
    Object.freeze({ id: 'n1', x: 4, z: 0.5, w: 8, d: 1, pre: true }), Object.freeze({ id: 'n2', x: 12, z: 0.5, w: 8, d: 1, pre: true }),
    Object.freeze({ id: 'n3', x: 20, z: 0.5, w: 8, d: 1 }), Object.freeze({ id: 'n4', x: 28, z: 0.5, w: 8, d: 1 }),
    Object.freeze({ id: 'w1', x: 0.5, z: 5, w: 1, d: 8, pre: true }), Object.freeze({ id: 'w2', x: 0.5, z: 13, w: 1, d: 8, pre: true }),
    Object.freeze({ id: 'w3', x: 0.5, z: 21, w: 1, d: 8 }), Object.freeze({ id: 'w4', x: 0.5, z: 28.5, w: 1, d: 7 }),
    Object.freeze({ id: 's1', x: 1.5, z: 31.5, w: 1, d: 1, end: 'south' }), Object.freeze({ id: 'e1', x: 31.5, z: 1.5, w: 1, d: 1, end: 'east' }),
  ]),
  near: 3.2, side: 32,
});
export function createLast55(L = 1) {
  const lv = clamp(L | 0, 1, 4), k = { L: lv, set: {}, strays: 0, done: false, q: null };
  for (const s of LAST55.slots) if (s.pre) k.set[s.id] = true;
  const open = () => LAST55.slots.filter((s) => !k.set[s.id]);
  const dist = (s, x, z) => Math.hypot(Math.max(0, Math.abs(x - s.x) - s.w / 2), Math.max(0, Math.abs(z - s.z) - s.d / 2));
  /** where on the rim (x, z in the altar's frame) a stone was let go → { r: 'set' | 'noyesod' | 'away' | 'taken', slot } */
  function drop(x, z) {
    if (k.done) return { r: 'away' };
    let best = null; for (const s of LAST55.slots) { const d = dist(s, x, z); if (d <= LAST55.near && (!best || d < best.d)) best = { s, d }; }
    const rim = Math.min(Math.abs(x), Math.abs(z), Math.abs(LAST55.side - x), Math.abs(LAST55.side - z)) <= LAST55.near && x > -LAST55.near && z > -LAST55.near && x < LAST55.side + LAST55.near && z < LAST55.side + LAST55.near;
    if (best && !k.set[best.s.id] && (best.d <= (lv <= 1 ? 2.6 : 1.6) || !rim)) {   /* (level 1 a little wider round its stretch — §1 rule 7) */ k.set[best.s.id] = true; if (!open().length) { k.done = true; k.q = k.strays <= 1 ? 1 : 0.65; } return { r: 'set', slot: best.s }; }
    if (best && k.set[best.s.id] && best.d <= 1.6) return { r: 'taken', slot: best.s };
    if (rim) { k.strays++; return { r: 'noyesod' }; }
    return { r: 'away' };
  }
  return { drop, open, state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}

/* ───────── ── build 56 ── stage 09, הסובב וחוט הסיקרא (docs/specs/shlav-alef-08-16-he.md §3 "09"): the raking light, the mallet and the
 *  witness stone, the courses stepped in (מדות ג, א: "עלה חמש וכנס אמה"), the red line at the altar's middle ───────── */
/** the raking light: a crack that shows only when the lamp is low at the stone's side — its angle θ (radians from the front, ± to the sides) */
export const RAKE56 = Object.freeze({ from: Object.freeze([null, 0.7, 0.95, 1.05, 1.15]), span: 0.3 });
export const rake56 = (theta, L = 2) => { const lv = clamp(L | 0, 1, 4), k = clamp((Math.abs(theta) - RAKE56.from[lv]) / RAKE56.span, 0, 1); return lv <= 1 ? Math.max(0.25, k) : k; };
/** the mallet's ring: a whole stone rings long and wide; a cracked one dull — short and broken; level 4's deep crack only a little shorter */
export const RING56 = Object.freeze({ whole: Object.freeze({ rings: 5, T: 1.6, reach: 0.5, broken: false }), crack: Object.freeze([null, Object.freeze({ rings: 2, T: 0.55, reach: 0.18, broken: true }), Object.freeze({ rings: 2, T: 0.6, reach: 0.2, broken: true }), Object.freeze({ rings: 2, T: 0.65, reach: 0.22, broken: true }), Object.freeze({ rings: 4, T: 1.25, reach: 0.4, broken: true })]) });
export const ring56 = (cracked, L = 3) => (cracked ? RING56.crack[clamp(L | 0, 1, 4)] : RING56.whole);
/** THE SOVEV's course: each stone laid where it is let go — out from the plumb line by e (amot; + juts out, − set in); small drags inward ⬅ /
 *  outward ➡ move it; within tol of the line it is true. Grade: the nudges over the course — n or fewer מהודר, 2n כשר, more טעון תיקון */
export const COURSE56 = Object.freeze({ tol: Object.freeze([null, 0.12, 0.09, 0.07, 0.05]), max: 0.8 });
export function createCourse56(n = 4, L = 1) {
  const lv = clamp(L | 0, 1, 4), k = { L: lv, n, stones: [], cur: -1, nudges: 0, done: false, q: null };
  const tol = COURSE56.tol[lv];
  /** the next stone let go at e0 → 'true' | 'out' | 'in' */
  function lay(e0) { if (k.done || k.cur >= 0) return 'busy'; const e = clamp(e0, -COURSE56.max, COURSE56.max); k.stones.push({ e, nudges: 0, ok: false }); k.cur = k.stones.length - 1; return check(); }
  function check() { const s = k.stones[k.cur]; if (Math.abs(s.e) <= tol) { s.ok = true; k.cur = -1; if (k.stones.length >= k.n) { k.done = true; k.q = k.nudges <= k.n ? 1 : k.nudges <= 2 * k.n ? 0.65 : 0.3; } return 'true'; } return s.e > 0 ? 'out' : 'in'; }
  /** a drag of d amot inward (+) or outward (−) on the stone in hand */
  function nudge(d) { if (k.cur < 0) return 'none'; const s = k.stones[k.cur]; s.e = clamp(s.e - d, -COURSE56.max, COURSE56.max); s.nudges++; k.nudges++; return check(); }
  return { lay, nudge, state: () => k, tol, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** חוט הסיקרא (מדות ג, א: "חוגרו באמצע"): the left peg to the middle by the reed, the right one to the same height by the level on the
 *  thread, then the snap. Heights in amot from the court's floor; the altar is ten high — the middle at five. Grade: both ends within half a
 *  tefach of the middle מהודר; within `kasher` כשר; else the line is washed off and done again, free */
export const THREAD56 = Object.freeze({ mid: 5, hi: 1 / 12, kasher: 0.3, band: Object.freeze([null, 0.25, 0.15, 0.1, 0.08]) });
export function createThread56(L = 1) {
  const lv = clamp(L | 0, 1, 4), k = { L: lv, step: 1, yL: 3, yR: 2, washes: 0, done: false, q: null, err: null };   // (both pegs low on the sovev's face to begin)
  const setL = (y) => { if (k.step !== 1) return k.step; k.yL = clamp(y, 1, 9.5); return k.step; };
  /** step 1 done when the left peg is let go within the level's band of the middle (level 1 shows the band on the reed) */
  function releaseL() { if (k.step !== 1) return 'no'; if (Math.abs(k.yL - THREAD56.mid) <= THREAD56.band[lv]) { k.step = 2; return 'next'; } return Math.abs(k.yL - THREAD56.mid) <= THREAD56.kasher && lv >= 2 ? (k.step = 2, 'next') : 'again'; }
  const setR = (y) => { if (k.step !== 2 && k.step !== 3) return k.step; k.yR = clamp(y, 1, 9.5); return k.step; };   /* (before the snap the right peg may be set again) */
  /** the level on the thread: the bubble's offset (−1…1), centred when the two ends are level */
  const bubble = () => clamp((k.yR - k.yL) / 0.6, -1, 1);
  function releaseR(gate) { if (k.step !== 2 && k.step !== 3) return 'no'; if (gate && Math.abs(k.yR - k.yL) > THREAD56.kasher) { k.step = 2; return 'again'; } k.step = 3; return 'next'; }   /* (gate — level 1: let go with the bubble far off, the peg is set again before the pull) */
  /** the snap: the red line struck — graded; out of `kasher` it is washed off and done again (free) */
  function snap() {
    if (k.step !== 3) return 'no';
    const err = Math.max(Math.abs(k.yL - THREAD56.mid), Math.abs(k.yR - THREAD56.mid)); k.err = err;
    if (err <= THREAD56.kasher) { k.done = true; k.q = err <= THREAD56.hi ? 1 : 0.65; return k.q === 1 ? 'mehudar' : 'kasher'; }
    k.washes++; k.step = 1; k.yL = 3; k.yR = 2; return 'wash';
  }
  return { setL, releaseL, setR, releaseR, bubble, snap, state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}

/* ───────── ── build 57 ── stage 10, גוף המזבח והכבש (docs/specs/shlav-alef-08-16-he.md §3 "10"): what is pasul and what only looks pasul
 *  (the inspection's decoys, levels 3–4), the kevesh's rows on an even slope ("שְׁלֹשִׁים וּשְׁתַּיִם עַל רֹחַב שֵׁשׁ עֶשְׂרֵה", מדות ג, ג) and the
 *  whitewash with a cloth ("וּמְלַבְּנִים אוֹתָן פַּעֲמַיִם בַּשָּׁנָה", מדות ג, ד; never iron) ───────── */
/** the stones of stage 10: each a set of marks on its faces. A mark is a crack (the finger catches), a fossil or natural pits (the finger runs
 *  over them smooth — nature); mud or moss over a face (rubbed off); a nick on the top edge (a slow finger along it catches); a deep crack
 *  (the mallet: dull). Level 3 — one mark; level 4 — two marks on one stone (each to be checked). Kasher ➡, pasul ⬅ */
export const STONE57 = Object.freeze({
  fossil: Object.freeze({ he: 'מאובן של צדפה', L: 3, bad: false, marks: Object.freeze([['fossil', 0]]), why: 'האצבע עוברת חלק — טבע, לא פגימה · המחשה' }),
  pits: Object.freeze({ he: 'גומות טבעיות', L: 3, bad: false, marks: Object.freeze([['pits', 0]]), why: 'האצבע לא נתפסת — טבע, לא פגימה · המחשה' }),
  moss: Object.freeze({ he: 'טחב', L: 3, bad: false, coat: Object.freeze(['moss', 0]), marks: Object.freeze([]), why: 'טחב — מנגבים, ונשארת אבן שלמה · המחשה' }),
  mud: Object.freeze({ he: 'כתם בוץ', L: 3, bad: false, coat: Object.freeze(['mud', 1]), marks: Object.freeze([]), why: 'בוץ — מנגבים, ונשארת אבן שלמה · המחשה' }),
  crack: Object.freeze({ he: 'סדק', L: 3, bad: true, marks: Object.freeze([['crack', 1]]), why: 'האצבע נתפסת בסדק; "וּבִפְגִימָה לְכָל דָּבָר" — מדות ג, ד · טיוטה' }),
  deep: Object.freeze({ he: 'סדק עמוק', L: 3, bad: true, deep: true, marks: Object.freeze([]), why: 'צליל עמום; "וּבִפְגִימָה לְכָל דָּבָר" — מדות ג, ד · טיוטה' }),
  nick: Object.freeze({ he: 'פגימה בשפה', L: 3, bad: true, nick: true, marks: Object.freeze([]), why: '"כדי שתחגור בה צפורן" — חולין יח ע"א · טיוטה' }),
  fossilcrack: Object.freeze({ he: 'מאובן — וסדק', L: 4, bad: true, marks: Object.freeze([['fossil', 0], ['crack', 2]]), why: 'המאובן — טבע; הסדק — פגימה · המחשה' }),
  pitsmoss: Object.freeze({ he: 'גומות וטחב', L: 4, bad: false, coat: Object.freeze(['moss', 2]), marks: Object.freeze([['pits', 0]]), why: 'גומות טבע, וטחב שנוגב — אבן שלמה · המחשה' }),
  mossdeep: Object.freeze({ he: 'טחב — וסדק עמוק', L: 4, bad: true, deep: true, coat: Object.freeze(['moss', 0]), marks: Object.freeze([]), why: 'הטחב נוגב; הצליל עמום — סדוקה · המחשה' }),
  fossilnick: Object.freeze({ he: 'מאובן — ופגימה בשפה', L: 4, bad: true, nick: true, marks: Object.freeze([['fossil', 0]]), why: 'המאובן — טבע; השפה — פגומה · המחשה' }),
});
/** the act's stones: four at level 3 (a fossil and a crack — the heart of it: both stay after wiping; one of pits / moss / mud; one of the
 *  deep crack / the nick: a stone that looks whole), then two at level 4 (the two decoys together, and one decoy with a flaw) */
export function list57(rnd = Math.random, L = 3) {
  const pick = (a) => a[Math.floor(rnd() * a.length)], mix = (a) => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  const l3 = mix(['fossil', 'crack', pick(['pits', 'moss', 'mud']), pick(['deep', 'nick'])]);
  return L >= 4 ? mix(['pitsmoss', pick(['fossilcrack', 'mossdeep', 'fossilnick']), 'fossil', pick(['deep', 'nick'])]) : l3.concat(mix(['pitsmoss', pick(['fossilcrack', 'mossdeep', 'fossilnick'])]));
}
export function createStone57(type, rnd = Math.random) {
  const T = STONE57[type] || STONE57.fossil, lv = T.L;
  const k = { type, bad: !!T.bad, face: 0, L: lv, at: { face: -1, u: 0.25 + rnd() * 0.5, v: 0.3 + rnd() * 0.4, len: 0.45 + rnd() * 0.3, seed: Math.floor(rnd() * 1e6) },
    marks: T.marks.map(([kind, face]) => ({ kind, face: lv <= 3 && kind === 'crack' ? (rnd() < 0.5 ? 0 : 1) : face, u: 0.3 + rnd() * 0.4, v: 0.35 + rnd() * 0.3 })),
    coat: T.coat ? T.coat[0] : null, mud: T.coat ? T.coat[1] : -1, wiped: 0, deep: !!T.deep, nick: T.nick ? { face: 0, u: 0.2 + rnd() * 0.6 } : null,
    turns: 0, felt: {}, edge: {}, taps: 0, decided: null, right: null };
  const covered = () => k.mud >= 0 && k.wiped < 1;
  /** what the face f carries: { crack, mark ('fossil' | 'pits' | null), coat amount and kind } */
  const look = (f) => { const ms = k.marks.filter((m) => m.face === f); const cr = ms.find((m) => m.kind === 'crack'), mk = ms.find((m) => m.kind !== 'crack'); return { crack: cr || null, mark: mk ? mk.kind : null, markAt: mk || null, coat: k.mud === f ? 1 - k.wiped : 0, moss: k.coat === 'moss' }; };
  /** what shows on the face in view: 'moss' | 'mud' | 'crack' | 'fossil' | 'pits' | null */
  const shows = () => { if (k.mud === k.face && covered()) return k.coat; const l = look(k.face); return l.crack ? 'crack' : l.mark; };
  function turn(dir) { if (k.decided) return 'done'; k.face = (k.face + (dir < 0 ? 3 : 1)) % 4; k.turns++; return 'turn'; }
  function wipe(amount) { if (k.decided) return 'done'; if (k.mud !== k.face || k.wiped >= 1) return 'clean'; k.wiped = Math.min(1, k.wiped + Math.max(0, amount)); return k.wiped >= 1 ? 'wiped' : 'wiping'; }
  /** the finger over the face in view (clean): a crack catches it; a fossil or pits — smooth (nature); else plain → 'catch' | 'fossil' | 'pits' | 'plain' | 'covered' */
  function feel() { if (k.decided) return 'done'; if (k.mud === k.face && covered()) return 'covered'; const l = look(k.face), r = l.crack ? 'catch' : l.mark || 'plain'; k.felt[k.face] = r; return r; }
  /** a finger along the top edge of the face in view, from u0 to u1 in dt s → 'fast' | 'caught' | 'ok' (the nick, as build 55's fingernail) */
  function edgeSlide(u0, u1, dt) {
    if (k.decided) return 'done'; const e = k.edge[k.face] || (k.edge[k.face] = { bins: new Array(NAIL55.bins).fill(0), caught: false });
    if (e.caught) return 'caught';
    const a = clamp(Math.min(u0, u1), 0, 1), b = clamp(Math.max(u0, u1), 0, 1), v = (b - a) / Math.max(1e-3, dt);
    if (v > NAIL55.vmax[3]) return 'fast';
    for (let i = Math.floor(a * NAIL55.bins); i <= Math.min(NAIL55.bins - 1, Math.floor(b * NAIL55.bins)); i++) e.bins[i] = 1;
    if (k.nick && k.nick.face === k.face && b >= k.nick.u - NAIL55.w && a <= k.nick.u + NAIL55.w) { e.caught = true; return 'caught'; }
    return 'ok';
  }
  const edgeFelt = () => { const e = k.edge[k.face]; return e ? e.bins.reduce((s, x) => s + x, 0) / NAIL55.bins : 0; };
  /** the mallet on the stone: a deep crack rings dull */
  const tap = () => { k.taps++; return k.deep ? 'dull' : 'ring'; };
  function decide(toAltar, px) {
    if (k.decided) return 'done'; if (!(px >= DRAG42)) return 'tap';
    k.decided = toAltar ? 'altar' : 'out'; k.right = toAltar ? !k.bad : k.bad;
    return k.right ? 'ok' : toAltar ? 'bad' : 'waste';
  }
  /** the book's pages this stone opens: its decoys (each its own page) and its flaws */
  const pages = () => { const p = new Set(); for (const m of k.marks) p.add(m.kind); if (k.coat) p.add(k.coat); if (k.deep) p.add('deep'); if (k.nick) p.add('nick'); return [...p]; };
  return { turn, wipe, feel, edgeSlide, edgeFelt, tap, decide, shows, look, covered, pages, state: () => k, T };
}
/** THE KEVESH (מדות ג, ג): its paving rows, two amot each along it, laid from the crews' last row up to the altar's top; each row's height set
 *  before it is let go — even when it continues the slope from the row below (S per amah: nine amot over thirty-two). A row's error is
 *  carried by the next (each continues from the one below it) — so small errors add up to a step where the kevesh meets the altar's top.
 *  Level 1: within `snap` of the right height it settles there (and the slope's shadow shows it); off by more than `crooked` — lifted again (free). */
export const KEVESH57 = Object.freeze({ S: 9 / 32, row: 2, foot: 16, rows: 16, his: 6, snap: Object.freeze([null, 0.15, 0, 0, 0]), crooked: 0.35, hi: 0.04, ok: 0.1, top: 0.08, topOk: 0.2, gear: Object.freeze([null, 0.42, 0.36, 0.3, 0.26]) });
export function createKevesh57(L = 1, n = KEVESH57.his) {
  const lv = clamp(L | 0, 1, 4), K = KEVESH57, first = K.rows - n, k = { n, L: lv, first, rows: [], tries: 0, crooked: 0, done: false, q: null };
  /** the true height of row i's middle (rows from the foot: one amah up the slope, then two by two) */
  const ideal = (i) => K.foot + K.S * (1 + K.row * i);
  /** where the next row should be: on from the row below it (the crews' last row is true) */
  const target = () => (k.rows.length ? k.rows[k.rows.length - 1].h : ideal(first - 1)) + K.S * K.row;
  /** the slope gauge on the row below and the stone in hand: the bubble −1…1, centred when the row goes on at the slope */
  const bubble = (h) => clamp((h - target()) / 0.25, -1, 1);
  /** a row let go at height h → 'even' | 'off' (laid, its error carried on) | 'crooked' (lifted again) */
  function lay(h) {
    if (k.done) return 'done'; k.tries++;
    let e = h - target(); if (Math.abs(e) <= K.snap[lv]) e = 0;
    if (Math.abs(e) > K.crooked) { k.crooked++; return 'crooked'; }
    k.rows.push({ i: first + k.rows.length, h: target() + e, e });
    if (k.rows.length >= n) { k.done = true; const m = Math.max(...k.rows.map((r) => Math.abs(r.e))), d = Math.abs(drift()); k.q = m <= K.hi && d <= K.top ? 1 : m <= K.ok && d <= K.topOk ? 0.65 : 0.3; }
    return Math.abs(e) <= K.hi ? 'even' : 'off';
  }
  /** at the top: how far the last row is off the kevesh's true line (where it meets the altar's top: a step of this much) */
  const drift = () => (k.rows.length ? k.rows[k.rows.length - 1].h - ideal(k.rows[k.rows.length - 1].i) : 0);
  return { lay, target, ideal, bubble, drift, state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** THE WHITEWASH (מדות ג, ד: "וּמְלַבְּנִים אוֹתָן פַּעֲמַיִם בַּשָּׁנָה"; with a cloth — "לֹא הָיוּ סָדִין אוֹתָן בְּכָפִיס שֶׁל בַּרְזֶל"): the finger
 *  spreads it over a grid on the face; its speed in face-widths a second — slower than vmin drips (each a drop that runs down), faster than
 *  vmax streaks (half covered: a second pass at a good pace covers it). Done at `need` covered. Grade: drips and streaks ≤ hi מהודר, ≤ ok כשר */
export const SID57 = Object.freeze({ cols: 20, rows: 10, vmin: Object.freeze([null, 0.1, 0.15, 0.2, 0.26]), vmax: Object.freeze([null, 4, 3.2, 2.6, 2.1]), need: Object.freeze([null, 0.8, 0.86, 0.9, 0.92]), hi: 2, ok: 6, gap: 0.6 });   // (level 1 — §1 rule 7, forgiving: from a stroke across the whole face in 10 s to one in a quarter second; the naive kid's 1.7-s strokes over 40 % of the face read slow at 0.2 — K57-P-S2, W-S1)
export function createSid57(L = 1) {
  const lv = clamp(L | 0, 1, 4), C = SID57, cells = new Array(C.cols * C.rows).fill(0), k = { L: lv, drips: 0, streaks: 0, done: false, q: null, lastDrip: -9, lastStreak: -9 };
  const cover = () => cells.reduce((a, c) => a + Math.min(1, c), 0) / cells.length;
  const speed = (v) => (v < C.vmin[lv] ? 'slow' : v > C.vmax[lv] ? 'fast' : 'ok');
  /** the cloth over (u, v ∈ 0…1) at speed sp (face-widths a second), at time t (s) → 'ok' | 'slow' | 'fast' | 'drip' | 'streak' | 'done' */
  function wipe(u, v, sp, t) {
    if (k.done) return 'done';
    const ci = clamp(Math.floor(u * C.cols), 0, C.cols - 1), ri = clamp(Math.floor(v * C.rows), 0, C.rows - 1), r = speed(sp);
    for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) { const c = ci + dc, rr = ri + dr; if (c < 0 || rr < 0 || c >= C.cols || rr >= C.rows) continue; const i = rr * C.cols + c, w = dc === 0 && dr === 0 ? 1 : 0.6; cells[i] = r === 'fast' ? Math.max(cells[i], 0.5 * w) : Math.max(cells[i], w); }
    let out = r;
    if (r === 'slow' && t - k.lastDrip > C.gap) { k.drips++; k.lastDrip = t; out = 'drip'; }
    if (r === 'fast' && t - k.lastStreak > C.gap) { k.streaks++; k.lastStreak = t; out = 'streak'; }
    if (cover() >= C.need[lv]) { k.done = true; const bad = k.drips + k.streaks; k.q = bad <= C.hi ? 1 : bad <= C.ok ? 0.65 : 0.3; }
    return out;
  }
  /** the least-covered row (0…1 from the top) — where the hint points */
  const gapRow = () => { let best = 0, bv = Infinity; for (let r = 0; r < C.rows; r++) { let s = 0; for (let c = 0; c < C.cols; c++) s += Math.min(1, cells[r * C.cols + c]); if (s < bv) { bv = s; best = r; } } return (best + 0.5) / C.rows; };
  return { wipe, cover, speed, gapRow, cell: (c, r) => cells[r * C.cols + c], state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}

/* ───────── ── build 58 ── stage 11, הקרנות (docs/specs/shlav-alef-08-16-he.md §3 "11"): the four horns, set square in the altar's corners
 *  ("מְקוֹם הַקְּרָנוֹת אַמָּה מִזֶּה וְאַמָּה מִזֶּה", מדות ג, א) — no snapping, the tolerance smaller horn by horn, the fourth with no shadow; the
 *  two holes in the south-west horn's yesod, found open by water poured from a jug (מדות ג, ב — המחשה) — the stream goes on a little after
 *  the jug is straightened; the first pyre — the wood sorted and stacked as in Phase B, the fire lit ───────── */
/** a horn in its corner, in the corner's own frame: u along one edge inward, v along the other (amot), its middle true at (½, ½) — its two
 *  outer faces flush with the altar's edges; rot its turn (degrees). Horn i (1…4) is level i: the tolerances shrink, the fourth has no shadow */
export const HORN58 = Object.freeze({ tolA: Object.freeze([null, 8, 6, 4, 3]), tolP: Object.freeze([null, 0.25, 0.18, 0.13, 0.1]), shadow: Object.freeze([null, true, true, true, false]), from: 1.55, rot: Object.freeze([22, 38]), min: 0.3 });
export function createHorn58(L = 1, rnd = Math.random) {
  const lv = clamp(L | 0, 1, 4), H = HORN58, sg = rnd() < 0.5 ? -1 : 1;
  const k = { L: lv, u: H.from + rnd() * 0.3, v: H.from + rnd() * 0.3, rot: sg * (H.rot[0] + rnd() * (H.rot[1] - H.rot[0])), set: false, tries: 0, q: null };
  const tolA = H.tolA[lv], tolP = H.tolP[lv];
  const move = (du, dv) => { if (k.set) return; k.u = Math.max(H.min, k.u + du); k.v = Math.max(H.min, k.v + dv); };
  const place = (u, v) => { if (k.set) return; k.u = Math.max(H.min, u); k.v = Math.max(H.min, v); };
  const turn = (d) => { if (k.set) return; k.rot = ((k.rot + d + 540) % 360) - 180; };
  /** its two edges: each glows green when the horn is square (within tolA of the altar's line, any quarter turn) and that face is flush */
  const sq = () => { const r = ((k.rot % 90) + 90) % 90; return Math.min(r, 90 - r); };
  const edges = () => { const a = sq() <= tolA; return { a: a && Math.abs(k.v - 0.5) <= tolP, b: a && Math.abs(k.u - 0.5) <= tolP, sq: sq(), du: k.u - 0.5, dv: k.v - 0.5 }; };
  /** let go: set where it lies when both edges are green (no snapping), else it stays to be moved or turned again */
  function release() {
    if (k.set) return 'set'; k.tries++; const e = edges();
    if (e.a && e.b) { k.set = true; const n = Math.max(e.sq / tolA, Math.abs(e.du) / tolP, Math.abs(e.dv) / tolP); k.q = n <= 0.5 ? 1 : 0.65; return 'set'; }
    return e.sq > tolA ? 'turn' : 'move';
  }
  return { move, place, turn, edges, release, state: () => k, tolA, tolP, shadow: H.shadow[lv] };
}
/** the four horns' grade: the mean of their own */
export function hornsGrade58(qs) { const m = qs.reduce((a, q) => a + (q || 0.3), 0) / Math.max(1, qs.length); return m >= 0.9 ? 1 : m >= 0.6 ? 0.65 : 0.3; }
/** THE TWO HOLES (מדות ג, ב): water from a jug onto the yesod by the south-west horn must go down the holes without running over the yesod.
 *  The jug's tilt 0…1 (from 0.2 it pours, full at 1); the stream follows the tilt late (tau s) — it goes on a little after the jug is
 *  straightened; the holes take `drain` a second; the water on the yesod over its rim runs off (a spill). The jug holds 1. Grade: no spill
 *  מהודר, one כשר, more טעון תיקון */
export const POUR58 = Object.freeze({ qmax: 0.6, drain: 0.3, from: 0.2, rim: Object.freeze([null, 0.14, 0.1, 0.08, 0.065]), tau: Object.freeze([null, 0.3, 0.45, 0.6, 0.75]), gap: 0.8, jugs: 3 });   // (jugs: a jugful that ran over is poured again — a fresh jug — up to three; c58 kid W-S2 emptied his one jug in one spilling pour)
export function createPour58(L = 1) {
  const lv = clamp(L | 0, 1, 4), P = POUR58, k = { L: lv, tilt: 0, s: 0, pool: 0, poured: 0, spills: 0, done: false, q: null, lastSpill: -9, t: 0, jug: 1, jug0: 0 };
  const flowOf = (tilt) => (tilt < P.from ? 0 : ((tilt - P.from) / (1 - P.from)) * P.qmax);
  /** the tilt at which the stream equals what the holes take — level 1's mark on the jug's arc */
  const safe = () => P.from + (1 - P.from) * (P.drain / P.qmax);
  /** one step: the jug at tilt, dt s → 'pour' | 'spill' | 'still' | 'refill' (that jugful ran over: a fresh one, up to P.jugs) | 'done' */
  function step(tilt, dt) {
    if (k.done) return 'done'; k.t += dt; k.tilt = clamp(tilt, 0, 1);
    const q = k.poured >= 1 ? 0 : flowOf(k.tilt); k.s += (q - k.s) * Math.min(1, dt / P.tau[lv]); if (k.s < 1e-4 && q === 0) k.s = 0;
    const s = Math.min(k.s, Math.max(0, 1 - k.poured) / Math.max(dt, 1e-3)); k.poured = Math.min(1, k.poured + s * dt);
    k.pool = Math.max(0, k.pool + (s - P.drain) * dt);
    let r = s > 0.002 ? 'pour' : 'still';
    if (k.pool > P.rim[lv]) { k.pool = P.rim[lv]; if (k.t - k.lastSpill > P.gap) { k.spills++; k.lastSpill = k.t; r = 'spill'; } else r = 'spilling'; }
    if (k.poured >= 1 && k.s < 0.01 && k.pool <= 0.002 && k.spills > k.jug0 && k.jug < P.jugs) { k.jug++; k.jug0 = k.spills; k.poured = 0; k.s = 0; return 'refill'; }
    if (k.poured >= 1 && k.s < 0.01 && k.pool <= 0.002) { k.done = true; k.q = k.spills === 0 ? 1 : k.spills === 1 ? 0.65 : 0.3; return 'done'; }
    return r;
  }
  return { step, safe, flowOf, state: () => k, rim: P.rim[lv], result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** THE FIRST PYRE: eight logs by the altar's fire place — six fit (fig, walnut, pine; two thick, two middling, two thin) and two unfit (olive,
 *  vine). Each carried ➡ to the pyre's next place or ⬅ out (§1 rule 13): an unfit log on the pyre comes back; a fit one thrown out comes back.
 *  The pyre: two thick logs below, two middling across them, two thin on top — the air between each pair ("רוח" — too tight, right, too wide);
 *  a log lies where it is let go (its error along its pair's spread), level 1 settles it within `forgive`. Then the fire */
export const WOOD58 = Object.freeze({
  fig: Object.freeze({ he: 'תאנה', fit: true }), walnut: Object.freeze({ he: 'אגוז', fit: true }), pine: Object.freeze({ he: 'עץ שמן', fit: true }),
  olive: Object.freeze({ he: 'זית', fit: false }), vine: Object.freeze({ he: 'גפן', fit: false }),
});
export const PYRE58 = Object.freeze({ order: Object.freeze(['thick', 'thick', 'mid', 'mid', 'thin', 'thin']), air: 0.6, tight: 0.3, wide: 0.95, reach: 1.3, forgive: Object.freeze([null, 0.35, 0.15, 0.1, 0.08]), max: 0.6 });
export function createPyre58(L = 1, rnd = Math.random) {
  const lv = clamp(L | 0, 1, 4), Y = PYRE58;
  const base = [['fig', 'thick'], ['walnut', 'thick'], ['pine', 'mid'], ['fig', 'mid'], ['walnut', 'thin'], ['pine', 'thin'], ['olive', 'thick'], ['vine', 'thin']];
  for (let i = base.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [base[i], base[j]] = [base[j], base[i]]; }
  const k = { L: lv, logs: base.map(([kind, cls], i) => ({ i, kind, cls, fit: WOOD58[kind].fit, at: 'pile' })), laid: [], wrong: 0, waste: 0, lit: false, done: false, q: null };
  const next = () => (k.laid.length < Y.order.length ? Y.order[k.laid.length] : null);
  /** log i let go on the pyre, off its place by e along its pair's spread (amot, + out) and d across → 'laid' | 'unfit' | 'size' | 'far' | 'no' */
  function toPyre(i, e = 0, d = 0) {
    const g = k.logs[i]; if (!g || g.at !== 'pile' || k.done) return 'no';
    if (!g.fit) { k.wrong++; return 'unfit'; }
    if (g.cls !== next()) return 'size';
    if (Math.abs(d) > Y.reach || Math.abs(e) > Y.reach) return 'far';
    let ee = clamp(e, -Y.max, Y.max); if (Math.abs(ee) <= Y.forgive[lv]) ee = 0;
    g.at = 'pyre'; k.laid.push({ i, e: ee }); return 'laid';
  }
  /** log i thrown out → 'out' (unfit: right) | 'waste' (fit: it comes back) | 'no' */
  function toOut(i) { const g = k.logs[i]; if (!g || g.at !== 'pile' || k.done) return 'no'; if (g.fit) { k.waste++; return 'waste'; } g.at = 'out'; return 'out'; }
  /** the air between each laid pair: the nominal gap plus both errors (outward widens) */
  const gaps = () => { const out = []; for (let p = 0; p + 1 < k.laid.length; p += 2) { const g = Y.air + k.laid[p].e + k.laid[p + 1].e; out.push({ g, ok: g >= Y.tight && g <= Y.wide, tight: g < Y.tight, wide: g > Y.wide }); } return out; };
  const ready = () => k.laid.length >= Y.order.length && k.logs.every((g) => g.fit || g.at === 'out');
  function light() { if (!ready() || k.lit) return 'no'; k.lit = true; k.done = true; const bad = gaps().filter((x) => !x.ok).length, m = k.wrong + k.waste; k.q = bad === 0 && m === 0 ? 1 : bad <= 1 && m <= 2 ? 0.65 : 0.3; return 'lit'; }
  return { toPyre, toOut, next, gaps, ready, light, state: () => k, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}

/* ── build 59 ── STAGE 12, הכיור (docs/specs/shlav-alef-08-16-he.md §3 "12"): the laver cast in bronze, its twelve spigots cast and screwed in,
 * and Ben Katin's mukhni that sinks it into the water at night ("בֶּן קָטִין עָשָׂה שְׁנֵים עָשָׂר דַּד לַכִּיּוֹר… וְאַף הוּא עָשָׂה מוּכְנִי לַכִּיּוֹר",
 * יומא ג, י). The ways of the work — the furnace, the moulds, the thread, the rope and its counterweight — are המחשה ── /build 59 ── */
/** THE CASTING (lift — "to stop before the time"): bronze from the furnace into a mould whose line is its fill 1. The furnace's tilt 0…1
 *  (from `from` it pours); the stream follows the tilt late (tau — the bronze is thick: straightened, it still runs a little); the fill
 *  f = what ran in ÷ the mould's cap. A pour ends when the stream stops: f in the window [1 − win, 1 + win] → 'done'; above it → 'over'
 *  (and at 1 + rim it runs over the mould's lip → 'spill'); below it → 'more' (pour again — not a try). Over or spilt: the mould is emptied
 *  and poured again ("יוצקים שוב" — no loss). Level 1 a wide window, level 4 a very short one. The grade: the fails, and how near the line */
export const CAST59 = Object.freeze({ qmax: 0.55, from: 0.2, tau: Object.freeze([null, 0.25, 0.38, 0.5, 0.62]), win: Object.freeze([null, 0.18, 0.1, 0.05, 0.025]), rim: 0.24, still: 0.006, mark: 0.9, react: 0.3 });   // (mark: level 1's even tilt — what still comes after a child's reaction (react s) and the bronze's own after-flow fill at most this share of the window: K59-P-S1/S2, the eye on the line and the finger ¼ s late)
export function createCast59(L = 1, cap = 1, qm = CAST59.qmax) {
  const lv = clamp(L | 0, 1, 4), C = CAST59, win = C.win[lv], tau = C.tau[lv], QM = Math.max(0.02, +qm || C.qmax), k = { L: lv, cap: Math.max(0.02, +cap || 1), tilt: 0, s: 0, f: 0, pouring: false, over: false, fails: 0, spills: 0, pours: 0, done: false, q: null, last: null };
  const flowOf = (tilt) => (tilt < C.from ? 0 : ((tilt - C.from) / (1 - C.from)) * QM);
  /** the tilt whose after-flow (the stream × tau) fills at most `mark` of the window: level 1's gold mark on the furnace's arc */
  const safe = () => C.from + ((1 - C.from) * Math.min(QM, (C.mark * win * k.cap) / (tau + C.react))) / QM;
  /** one step: the furnace at tilt, dt s → 'pour' | 'spilling' | 'still' | 'more' | 'over' | 'spill' | 'done' */
  function step(tilt, dt) {
    if (k.done) return 'done';
    k.tilt = clamp(+tilt || 0, 0, 1); const q = flowOf(k.tilt);
    k.s += (q - k.s) * Math.min(1, dt / tau); if (k.s < 1e-4 && q === 0) k.s = 0;
    const still = C.still * Math.min(1, k.cap); k.f += (k.s * dt) / k.cap; if (q > 0 || k.s > still) k.pouring = true;   // (still: by the mould's size — a small mould's last trickle counts)
    if (k.f >= 1 + C.rim) { k.f = 1 + C.rim; k.over = true; }
    if (k.pouring && q === 0 && k.s <= still) {   // the stream has stopped: the pour is judged
      k.pouring = false; k.pours++;
      if (k.over || k.f > 1 + win) { const sp = k.over; k.fails++; if (sp) k.spills++; k.over = false; k.f = 0; k.s = 0; k.last = sp ? 'spill' : 'over'; return k.last; }
      if (k.f >= 1 - win) { k.done = true; k.q = k.fails === 0 ? (Math.abs(k.f - 1) <= win / 2 ? 1 : 0.65) : k.fails === 1 ? 0.65 : 0.3; k.last = 'done'; return 'done'; }
      k.last = 'more'; return 'more';
    }
    return k.over ? 'spilling' : k.s > still ? 'pour' : 'still';
  }
  return { step, safe, flowOf, state: () => k, win, tau, qm: QM, result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** the twelve spigots' moulds (פ׳): each a different size — so each pour a different amount (cap: the laver's mould is 1) */
export const SPIGOTS59 = Object.freeze({ caps: Object.freeze([0.16, 0.28, 0.2, 0.34, 0.13, 0.24, 0.3, 0.18, 0.38, 0.22, 0.14, 0.26]), his: 4 });   // (his: the first four his — small, large, middling, larger; the other eight his fellows')
/** the small furnace's stream for a mould of cap: smaller for a smaller mould, but not in proportion — each mould still a different pour */
export const spigotQ59 = (cap) => CAST59.qmax * Math.sqrt(Math.max(0.01, cap));
/** the twelve's grade: by the moulds that needed a second pour */
export function spigotsGrade59(fails) { const n = fails.filter((x) => x > 0).length; return n === 0 ? 1 : n <= 3 ? 0.65 : 0.3; }
/** THE SPIGOT SCREWED IN (fit): a ⟳ turn screws it in (the thread's lock at `lock` degrees); the resistance rises as it goes (each degree of
 *  the finger turns it less); at the lock — a click; past the lock by more than the level's slack — "too hard": it turns no further, a turn
 *  back ⟲ eases it (no damage). Let go at the click (or within the slack) → set. A let-go before the click is no try */
export const SCREW59 = Object.freeze({ lock: 540, slack: Object.freeze([null, 70, 45, 30, 18]), stiff: 0.55, past: 0.35 });
export function createScrew59(L = 1) {
  const lv = clamp(L | 0, 1, 4), C = SCREW59, slack = C.slack[lv], k = { L: lv, th: 0, clicked: false, tight: false, set: false, fails: 0, q: null };
  const gain = () => 1 - C.stiff * Math.min(1, k.th / C.lock) ** 2;
  /** a turn of the finger by deg (+ ⟳ in) → 'turn' | 'click' | 'tight' | 'eased' | 'stuck' | 'set' */
  function turn(deg) {
    if (k.set) return 'set'; let d = +deg || 0; if (!d) return 'turn';
    if (d > 0) {
      if (k.tight) return 'stuck';
      if (k.th < C.lock) { const was = k.th; k.th = Math.min(C.lock, k.th + d * gain()); if (was < C.lock && k.th >= C.lock) { k.clicked = true; return 'click'; } return 'turn'; }
      k.th += d * C.past; if (k.th > C.lock + slack) { k.th = C.lock + slack; k.tight = true; return 'tight'; } return 'turn';
    }
    k.th = Math.max(0, k.th + d); if (k.th < C.lock) k.clicked = false;
    if (k.tight && k.th <= C.lock + slack * 0.5) { k.tight = false; return 'eased'; } return 'turn';
  }
  /** let go → 'set' | 'tight' (a try failed: turn back a little) | 'more' (before the click: no try) */
  function release() {
    if (k.set) return 'set'; if (k.tight) { k.fails++; return 'tight'; } if (k.th < C.lock) return 'more';
    k.set = true; k.q = k.fails === 0 ? 1 : k.fails === 1 ? 0.65 : 0.3; return 'set';
  }
  return { turn, release, state: () => k, slack, depth: () => Math.min(1, k.th / C.lock), result: () => (k.set ? { q: k.q, rating: rate30(k.q) } : null) };
}
/** the spigots' grade: the mean of their own */
export function screwGrade59(qs) { const m = qs.reduce((a, q) => a + (q || 0.3), 0) / Math.max(1, qs.length); return m >= 0.9 ? 1 : m >= 0.6 ? 0.65 : 0.3; }
/** THE MUKHNI AT NIGHT (lift, turned over): slow ⬆ drags pay out the rope — the laver goes down into the water of its pit, its counterweight
 *  rises; paid too fast (over vmax, amot a second) the rope slips and the laver lurches down (`slip` more); it sits on the curb at `drop` —
 *  softly when the last of it came slower than `soft`, else a splash. Level 1 the most patient rope */
export const MUKHNI59 = Object.freeze({ drop: 2.05, gear: 0.9, vmax: Object.freeze([null, 1.4, 1.05, 0.8, 0.6]), soft: Object.freeze([null, 0.8, 0.6, 0.45, 0.32]), near: 0.4, slip: 0.18 });
export function createMukhni59(L = 1) {
  const lv = clamp(L | 0, 1, 4), C = MUKHNI59, k = { L: lv, d: 0, slips: 0, landed: false, soft: null, vLand: 0, done: false, q: null };
  /** the rope paid dd amot at v amot a second → 'pay' | 'near' | 'slip' | 'soft' | 'splash' | 'done' */
  function pay(dd, v) {
    if (k.done) return 'done'; dd = Math.max(0, +dd || 0); v = Math.max(0, +v || 0); if (!dd) return k.d >= C.drop - C.near ? 'near' : 'pay';
    let r = 'pay'; if (v > C.vmax[lv]) { k.slips++; dd += C.slip; r = 'slip'; }
    k.d += dd;
    if (k.d >= C.drop) { k.d = C.drop; k.landed = true; k.done = true; k.vLand = r === 'slip' ? Math.max(v, C.vmax[lv]) * 1.5 : v; k.soft = k.vLand <= C.soft[lv]; k.q = k.slips === 0 && k.soft ? 1 : k.slips <= 1 && (k.soft || k.slips === 0) ? 0.65 : 0.3; return k.soft ? 'soft' : 'splash'; }
    return r === 'slip' ? 'slip' : k.d >= C.drop - C.near ? 'near' : 'pay';
  }
  return { pay, state: () => k, vmax: C.vmax[lv], soft: C.soft[lv], result: () => (k.done ? { q: k.q, rating: rate30(k.q) } : null) };
}
