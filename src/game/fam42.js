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
    s.y = clamp(s.y + s.v * dt, 0, 1.25);
    if (s.y > P.win[1] + 0.02 && !s.over) { s.over = true; s.fix++; }   // (past the window: a correction is needed)
    if (s.y < P.win[1]) s.over = false;
    if (inp.back) s.backed = true;
    const still = !inp.hold && !inp.back && Math.abs(s.v) < LIFT42.still && s.y > 0.03;
    if (still && !s.stopped) {
      s.stopped = true;
      if (s.y >= P.win[0] && s.y <= P.win[1]) { s.done = true; s.q = q3(s.fix + (s.backed ? 1 : 0)); }
      else s.fix++;   // (stopped short or over: lift again or lower — a correction)
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
export const PLACE42 = Object.freeze({ lens: Object.freeze([2, 3, 4]), settle: 0.5 });
/** a course: the joints of the course below (positions), and his stretch [a, b) to fill (in units) */
export function createCourse(spec) {
  const c = { below: (spec.below || []).slice(), a: spec.a, b: spec.b, at: spec.a, joints: [], faults: 0, rejects: 0, done: false, q: null, L: spec.L || 1 };
  /** place a stone of length len: it must be dragged (≥ DRAG42 px) and held to settle (≥ settle s); it must fit the stretch; → 'ok' | 'tap' | 'unsettled' | 'long' | 'gap' | 'done' */
  function place(len, o = {}) {
    if (c.done) return 'done';
    if (!((o.dragPx || 0) >= DRAG42)) return 'tap';
    if (!((o.settleS || 0) >= PLACE42.settle)) return 'unsettled';
    if (c.at + len > c.b + 1e-9) { c.rejects++; return 'long'; }
    { const rem = c.b - (c.at + len); if (rem > 1e-9 && rem < Math.min(...PLACE42.lens) - 1e-9) { c.rejects++; return 'gap'; } }   // (it would leave a gap no stone fills: the course could never end — the naive kid's run K42-P-new stood there 3 minutes)
    c.at += len;
    if (c.at < c.b - 1e-9) { const over = c.below.some((j) => Math.abs(j - c.at) < 1e-6); c.joints.push({ x: c.at, over }); if (over) c.faults++; }
    if (Math.abs(c.at - c.b) < 1e-6) { c.done = true; c.q = q3(c.faults + (c.rejects > 1 ? 1 : 0)); }
    return 'ok';
  }
  const fits = (len) => { const rem = c.b - (c.at + len); return rem > -1e-9 && !(rem > 1e-9 && rem < Math.min(...PLACE42.lens) - 1e-9); };
  const overAt = (len) => { const e = c.at + len; return e < c.b - 1e-9 && c.below.some((j) => Math.abs(j - e) < 1e-6); };
  return { place, fits, overAt, state: () => c, result: () => (c.done ? { q: c.q, rating: rate30(c.q), faults: c.faults } : null) };
}
/** the course's lay-out for a seed: the course below's joints and his stretch (the crews lay the rest) */
export function courseSpec(n, L = 1) {
  const below = n % 2 ? [2, 5, 8, 11] : [3, 6, 9, 12];   // (the crews' course below, its joints every 3 units)
  const a = n % 2 ? 4 : 1, len = L >= 3 ? 7 : 6;
  return { below, a, b: a + len, L };
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
      } else if (k.poured) k.fix++;   // (let go early: the crack stops — pour again)
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
export const MAT42 = Object.freeze({ daily: 24, keep: 3, cost: Object.freeze({ rock: 2, stone: 1, roll: 4, pave: 3, lift: 2 }) });
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
