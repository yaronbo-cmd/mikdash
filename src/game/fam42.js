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
export const FAM42 = Object.freeze(['lift', 'place', 'inspect']);
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
export const MAT42 = Object.freeze({ daily: 24, keep: 3, cost: Object.freeze({ rock: 2, stone: 1, roll: 4, pave: 3, lift: 2, pulley: 4, wstone: 5, giant: 5, top: 8, lattice: 8, warnst: 6 }) });   // ── build 46 ── (the soreg: 30 — three panels and the warning stones; a second morning again)   // ── build 45 ── (the wall: 32 in all — beyond one morning's caravan with stage 01's leftover, so its "מחר" comes in normal play)
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
