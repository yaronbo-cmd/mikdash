/* ── build 132 ── h132/sikra-model.js — work 4 "חוט הסיקרא" (spec docs/specs/shlav-09-he.md, עבודה 4): its rules, pure (no three.js, no
 * DOM). LANE B's file.
 *
 * The walk (spec "כיוון ההליכה", Mishnah Zevachim 5:3): from the south-east corner, east (north along it) → north → west → south, closing
 * on the start. A place on the line is s, amot along the perimeter from the start: the east wall 0–30, the north 30–60, the west 60–90,
 * the south 90–120 (BOOK.s09.run, order). Level 1 is the east wall and the north-east corner only (its corner zone runs one amah past it:
 * the line ends at 31).
 *
 *   SK · TEF · wallAt(s) · cornersOf(lv) · lineEnd(lv) · stakesOf(lv) · segIndex(s) · inCorner(s, lv) · segPts(dev) · wetBand(w)
 *   closeRule(d) · flawsOn(west) · measureFresh(lv) · measureTap(Ms, k) · lineFresh(lv, west) · lineStep(L, dt, inp)
 *   bowlTap(L) · dripTap(L, id) · lineMax(lv) · lineResult(L, Ms) · lineSave(L) · lineLoad(o)
 *
 * The left thumb is pace (0 … 4 amot a second, never backwards) and height (−3 … +3 tefachim, directly); it is the act's to read the
 * finger (pixels → these) — this file takes pace and height. Three measures (spec "החוקים והמספרים"): height (each 5-amah segment by its
 * worst deviation), continuity (a lift over 0.3 s is a seam), wetness (1 → 0 over 25 amot; the bowl; drips; stains). Corners: a pace
 * window and an exact height. The west wall: the flaws of works 1–3 (M.westSlots()) or the one fixed rough patch. The south: the close.
 * Every number the spec gives is here as written; the ones it marks "לכיוונון" and the few it leaves open are named (see the list in
 * SK's comment).
 */

/** one tefach in amot (an amah of five tefachim at the yesod in the Rambam; the game's grid keeps six: BOOK.s09.tef) */
export const TEF = 1 / 6;

export const SK = Object.freeze({
  SIDE: 30, SEG: 6, SEG_L: 5,                    // the wall, its six equal segments of 5 amot (spec "קטעים ופינות")
  PACE_MAX: 4,                                   // amot a second, measured against the wall
  H_MAX: 3,                                      // tefachim each way
  LIFT_FREE: 0.3,                                // s: a lift shorter than this does not count
  TAP_T: 0.25, TAP_PX: 12,                       // the right thumb's tap: shorter than 0.25 s, moved less than 12 px
  WET_LEN: 25,                                   // amot: the wetness falls from 1 to 0 along this
  DARK: 0.6, PINK: 0.25,                         // the string's colour bands
  DRIP_AFTER: 4, DRIP_PACE: 1,                   // after a refill: in the next 4 amot a pace under 1 amah a second drips
  STAND_T: 0.7,                                  // s: standing longer than this with a string that is not pink = a stain
  WIPE_T: 3,                                     // s: a fresh drip can be wiped this long
  FLAW_WET: 0.5, FLAW_LEN: 1,                    // over a flaw on the west wall: wetness at least 0.5; a flaw about an amah long
  CORNER: 1,                                     // amot before and after the corner's stake: the corner zone
  CORNER_PACE: Object.freeze([0.5, 1.5]),        // the corner's pace window, amot a second
  CORNER_H: 0.25,                                // tefachim: the corner's height
  CLOSE: 0.25,                                   // amot: the close within a quarter amah of the start is perfect
  DEV: Object.freeze([0.25, 0.5, 1]),            // tefachim: 40 / 20 / 10; more = wavy
  PTS: Object.freeze({ stake: 10, seg: [40, 20, 10], corner: 10, close: 40, loss: 20 }),
  // ── named, not numbers of the spec (spec: "המספרים הם נקודת פתיחה לכיוונון") ──
  STOP: 0.1,           // amot a second: under this the walk has stopped ("חזרה לנקודה: עצירה")
  DRIP_SLOW_T: 0.25,   // s: the slow pace after a refill held this long drips (the spec says no time; 0 would drip on the tap's own frame)
  CLOSE_ARM: 1.5,      // amot before the start: a stop from here on is the close
  CLOSE_OVER: 1,       // amot past the start: a walk that runs on this far closes by itself (long: the double stain)
  SUN: 0.012,          // level 3: wetness lost a second in the sun, on top of the way's ("קצב ההתייבשות בזמן לכיוונון")
  SAMPLE: 0.1,         // amot: the line's sample (the view grows the line by these)
});

const SIDES = Object.freeze(['E', 'N', 'W', 'S']);   // the walk's order (BOOK.s09.order)
/** the wall at s, its index and the distance along it */
export function wallAt(s) { const i = Math.max(0, Math.min(3, Math.floor(s / SK.SIDE))); return { k: SIDES[i], i, d: s - i * SK.SIDE }; }
/** the corners the walk passes (s): level 1 the north-east only; else NE, NW, SW (the south-east is the start and the close) */
export const cornersOf = (lv) => ((lv | 0) === 1 ? [30] : [30, 60, 90]);
export const CORNER_K = Object.freeze({ 30: 'NE', 60: 'NW', 90: 'SW' });
/** where the line ends: level 1 one amah past the north-east corner (its corner zone), else the start again (the close) */
export const lineEnd = (lv) => ((lv | 0) === 1 ? 30 + SK.CORNER : 4 * SK.SIDE);
/** the stakes of the measuring opening (spec: level 1 the two corners of the east wall; else all four) */
export const stakesOf = (lv) => ((lv | 0) === 1 ? ['SE', 'NE'] : ['SE', 'NE', 'NW', 'SW']);
/** the segment of s (0 … 23): six of 5 amot on each wall; a segment never crosses a corner */
export const segIndex = (s) => Math.max(0, Math.min(4 * SK.SEG - 1, Math.floor(s / SK.SEG_L)));
/** is s in a corner zone (one amah before the corner's stake and one after) — measured only by the corner rule */
const EPS = 1e-6;
export function inCorner(s, lv) { for (const c of cornersOf(lv)) if (s >= c - SK.CORNER - EPS && s < c + SK.CORNER - EPS) return c; return 0; }
/** a segment's points by its worst deviation (tefachim): up to a quarter 40, a half 20, one 10, more: wavy −20 */
export function segPts(dev) { const D = SK.DEV, P = SK.PTS.seg; return dev <= D[0] ? P[0] : dev <= D[1] ? P[1] : dev <= D[2] ? P[2] : -SK.PTS.loss; }
/** the string's colour: dark above 0.6, red and glinting 0.25–0.6 (the time to tap), pink below 0.25 */
export const wetBand = (w) => (w > SK.DARK ? 'dark' : w >= SK.PINK ? 'red' : 'pink');
/** the close by where the walk stopped (d = s − the start's s): within a quarter amah perfect; beyond it the double stain; short a gap */
export const closeRule = (d) => (Math.abs(d) <= SK.CLOSE ? 'perfect' : d > 0 ? 'blot2' : 'gap');
/** the west wall's flaw places on the line (s), from M.westSlots() (each { f, slot, d }) */
export const flawsOn = (west) => (Array.isArray(west) ? west : []).map((q) => ({ f: q.f, slot: q.slot, d: q.d, s0: 2 * SK.SIDE + q.d - SK.FLAW_LEN / 2, s1: 2 * SK.SIDE + q.d + SK.FLAW_LEN / 2 }));
/** is s in the free trial (the first segment, up to the first charcoal dot) */
export const isFree = (s) => s < SK.SEG_L;

/* ───────── the measuring opening: the rod at each corner, a tap drives the stake (10 each) ───────── */
export function measureFresh(lv) { return { lv: lv | 0 || 2, want: stakesOf(lv).slice(), done: [], pts: 0 }; }
/** the stake at corner k driven (the corners in the walk's order; another corner is not taken) → { ok, pts, last } */
export function measureTap(Ms, k) {
  const next = Ms.want.find((q) => !Ms.done.includes(q));
  if (!next || k !== next) return { ok: false, pts: 0, last: false };
  Ms.done.push(k); Ms.pts += SK.PTS.stake;
  return { ok: true, pts: SK.PTS.stake, last: Ms.done.length === Ms.want.length };
}
export const measureNext = (Ms) => Ms.want.find((q) => !Ms.done.includes(q)) || null;

/* ───────── the line ───────── */
/** a fresh line at level lv; west: M.westSlots() (only walls that are walked: level 1 never reaches the west) */
export function lineFresh(lv, west) {
  const L = lv | 0 || 2;
  return {
    lv: L, end: lineEnd(L), sun: L === 3,
    s: 0, h: 0, pace: 0, w: 1, t: 0,
    started: false, done: false, closed: null,
    down: false, liftT: 0, lifted: false,          // (lifted: the bow off the wall after a lift of 0.3 s or more, until the next touch)
    standT: 0, stood: false,                        // (a stand's stain once a stand)
    wetTo: -1, slowT: 0,                            // (after a refill: the 4 amot it drips in at a slow pace)
    seg: { i: 0, dev: 0, n: 0 },                    // (the segment now: its worst deviation, its samples)
    segs: [],                                       // [{ i, dev, pts, free }]
    cz: null, corners: [],                          // (the corner zone now; each corner's result { c, k, r, pts })
    flaws: L === 1 ? [] : flawsOn(west), flawI: 0,
    drips: [], dripN: 0,                            // [{ id, s, age, st: 'fresh' | 'wiped' | 'lost' | 'free' }]
    marks: [],                                      // what stays on the line: { f, s, s1?, n? } (seam, gap, blot, blot2, smear, drip, pink, wavy, pale)
    pale: null,                                     // (the pale stretch now: its start)
    seams: 0, dripsAll: 0, dmg: 0, lossPts: 0, gain: 0,
    excess: 0, refills: 0,
  };
}
const mark = (L, f, s, o = {}) => { const m = { f, s: +s.toFixed(2), ...o }; L.marks.push(m); return m; };
/** a damage (−20) or a mark of no points; in the free trial the helper wipes it: no mark, no penalty */
function harm(L, ev, f, s, pts, o = {}) {
  const free = isFree(s);
  const e = { e: f, s: +s.toFixed(2), pts: free ? 0 : -pts, free, ...o };
  if (!free) { mark(L, 'sikra.' + f, s, o); if (pts) { L.dmg++; L.lossPts += pts; } }
  ev.push(e); return e;
}
function segClose(L, ev) {
  const g = L.seg; if (g.n <= 0) { L.seg = { i: g.i + 1, dev: 0, n: 0 }; return; }
  const p = segPts(g.dev), s = g.i * SK.SEG_L + SK.SEG_L / 2, free = g.i === 0;
  const r = { e: 'seg', i: g.i, dev: +g.dev.toFixed(3), pts: free && p < 0 ? 0 : p, free };
  L.segs.push({ i: g.i, dev: r.dev, pts: r.pts, free }); ev.push(r);
  if (p > 0) L.gain += p;
  else if (!free) { L.dmg++; L.lossPts += SK.PTS.loss; mark(L, 'sikra.wavy', g.i * SK.SEG_L, { s1: (g.i + 1) * SK.SEG_L }); }
  void s;
  L.seg = { i: g.i + 1, dev: 0, n: 0 };
}
function cornerClose(L, ev) {
  const z = L.cz; L.cz = null; if (!z) return;
  let r = 'plain', pts = 0;
  if (z.fast) r = 'gap'; else if (z.stop) r = 'smear'; else if (!z.slow && !z.hBad && !z.lift) { r = 'perfect'; pts = SK.PTS.corner; L.gain += pts; }
  L.corners.push({ c: z.c, k: CORNER_K[z.c], r, pts: r === 'perfect' ? pts : r === 'plain' ? 0 : -SK.PTS.loss });
  ev.push({ e: 'corner', c: z.c, k: CORNER_K[z.c], r, pts });
}
function closeAt(L, ev, s) {
  if (L.closed) return;
  const d = s - L.end, r = closeRule(d);
  L.closed = r; L.done = true;
  if (L.seg.n > 0) segClose(L, ev);
  if (r === 'perfect') { L.gain += SK.PTS.close; ev.push({ e: 'close', r, d: +d.toFixed(3), pts: SK.PTS.close }); }
  else { harm(L, ev, r === 'gap' ? 'gap' : 'blot2', s, SK.PTS.loss, r === 'gap' ? { s1: L.end, why: 'close' } : {}); ev.push({ e: 'close', r, d: +d.toFixed(3), pts: -SK.PTS.loss }); }
  ev.push({ e: 'done' });
}
function newDrip(L, ev, s, why) {
  const id = ++L.dripN, free = isFree(s);
  const d = { id, s: +s.toFixed(2), age: 0, st: free ? 'free' : 'fresh', why };
  L.drips.push(d); if (!free) L.dripsAll++;
  ev.push({ e: 'drip', id, s: d.s, why, free });
  return d;
}
/**
 * one step of the line. inp: { down: the left thumb on, pace: amot/s (≥ 0; clamped to 0 … 4), h: tefachim (clamped to ±3) }.
 * → the step's events (each { e, … }): seg, corner, flawOk, gap, drip, dripLost, blot, seam, pale, close, done, turn.
 */
export function lineStep(L, dt, inp = {}) {
  const ev = []; if (L.done || !(dt > 0)) return ev;
  const on = !!inp.down;
  // ── continuity: a lift under 0.3 s does not count (the walk goes on as it was); longer: the bow lifts, a seam stays
  if (on) {
    if (!L.started) L.started = true;
    L.liftT = 0; L.lifted = false; L.down = true;
    L.pace = Math.max(0, Math.min(SK.PACE_MAX, +inp.pace || 0));
    L.h = Math.max(-SK.H_MAX, Math.min(SK.H_MAX, +inp.h || 0));
  } else if (L.started) {
    L.down = false; L.liftT += dt;
    if (!L.lifted && L.liftT >= SK.LIFT_FREE) {
      L.lifted = true; L.pace = 0;
      if (L.s >= L.end - SK.CLOSE_ARM && L.lv !== 1) { closeAt(L, ev, L.s); return ev; }
      const free = isFree(L.s);
      if (!free) { L.seams++; mark(L, 'sikra.seam', L.s); }
      ev.push({ e: 'seam', s: +L.s.toFixed(2), pts: 0, free });
      if (L.cz) L.cz.lift = true;
    }
  }
  if (!L.started) return ev;
  L.t += dt;
  const printing = !L.lifted;
  const v = printing ? L.pace : 0, s0 = L.s;
  let s1 = s0 + v * dt;
  // ── level 1: the line ends one amah past the north-east corner
  if (L.lv === 1 && s1 >= L.end) s1 = L.end;
  // ── the wetness: by the way, and at level 3 by the time in the sun too
  const w0 = L.w;
  L.w = Math.max(0, L.w - (s1 - s0) / SK.WET_LEN - (L.sun && printing ? SK.SUN * dt : 0));
  // ── the pale line (below 0.25: no points, the line stays pale)
  if (printing && s1 > s0) {
    if (wetBand(L.w) === 'pink') { if (L.pale == null) { L.pale = s0; ev.push({ e: 'pale', s: +s0.toFixed(2), pts: 0 }); } }
    else if (L.pale != null) { if (!isFree(L.pale)) mark(L, 'sikra.pale', L.pale, { s1: +s0.toFixed(2) }); L.pale = null; }
  }
  void w0;
  // ── the west wall's flaws: a wetness of 0.5 at least as the string reaches one, else it skips it (a gap)
  while (L.flawI < L.flaws.length && s1 >= L.flaws[L.flawI].s0 - EPS) {
    const F = L.flaws[L.flawI++];
    if (L.w >= SK.FLAW_WET - EPS) ev.push({ e: 'flawOk', slot: F.slot, s: +F.s0.toFixed(2) });
    else harm(L, ev, 'gap', F.s0, SK.PTS.loss, { s1: +F.s1.toFixed(2), why: 'flaw', slot: F.slot });
  }
  // ── height and the segments (the corner zones are left out of them), the corner zones by their own rule
  const dev = Math.abs(L.h);
  const zc = inCorner(s1, L.lv) || inCorner(s0, L.lv);
  if (zc && !L.cz && s1 >= zc - SK.CORNER) L.cz = { c: zc, fast: false, stop: false, slow: false, hBad: false, lift: L.lifted, turned: false };
  if (L.cz) {
    const z = L.cz;
    if (printing) {
      if (L.pace > SK.CORNER_PACE[1] && !z.fast) { z.fast = true; harm(L, ev, 'gap', s1, SK.PTS.loss, { why: 'corner', c: z.c, s1: +(z.c + SK.CORNER).toFixed(2) }); }
      if (L.pace < SK.STOP && !z.stop && !z.fast) { z.stop = true; harm(L, ev, 'smear', s1, SK.PTS.loss, { c: z.c }); }
      if (L.pace < SK.CORNER_PACE[0]) z.slow = true;
      if (dev > SK.CORNER_H) z.hBad = true;
    } else z.lift = true;
    if (!z.turned && s1 >= z.c) { z.turned = true; ev.push({ e: 'turn', c: z.c, k: CORNER_K[z.c] }); }
    if (s1 >= z.c + SK.CORNER - EPS) cornerClose(L, ev);
  } else if (printing && s1 > s0 && s1 <= (L.lv === 1 ? SK.SIDE : 4 * SK.SIDE) + EPS && L.seg.i < (L.lv === 1 ? 1 : 4) * SK.SEG) {
    // (a segment's samples are where the string was printed outside the corner zones)
    const i = segIndex(s1 - 1e-9);
    while (L.seg.i < i) segClose(L, ev);
    L.seg.dev = Math.max(L.seg.dev, dev); L.seg.n++;
  }
  // (a segment whose end the walk passed — also through a corner zone — is closed)
  if (!L.done) { const iEnd = Math.floor((s1 + 1e-9) / SK.SEG_L); while (L.seg.i < iEnd && L.seg.i < 4 * SK.SEG) segClose(L, ev); }
  // ── the drips: a refill's 4 amot at a pace under 1 drips; a fresh drip not wiped in 3 s is −20
  if (L.wetTo >= 0) {
    if (s1 >= L.wetTo) { L.wetTo = -1; L.slowT = 0; }
    else if (printing && L.pace < SK.DRIP_PACE) { L.slowT += dt; if (L.slowT >= SK.DRIP_SLOW_T) { newDrip(L, ev, s1, 'slow'); L.wetTo = -1; L.slowT = 0; } }
    else L.slowT = 0;
  }
  for (const d of L.drips) {
    if (d.st !== 'fresh' && d.st !== 'free') continue;
    d.age += dt;
    if (d.age > SK.WIPE_T) {
      if (d.st === 'free') { d.st = 'wiped'; ev.push({ e: 'wipe', id: d.id, s: d.s, free: true, pts: 0 }); continue; }   // (the free trial: the helper wipes it, no mark)
      d.st = 'lost'; L.dmg++; L.lossPts += SK.PTS.loss; mark(L, 'sikra.drip', d.s, { n: d.id });
      ev.push({ e: 'dripLost', id: d.id, s: d.s, pts: -SK.PTS.loss });
    }
  }
  // ── a stand: still over 0.7 s with a string that is not pink = a stain (once a stand; the corner's stop is its smear)
  const stopped = printing && L.pace < SK.STOP;
  if (stopped && !L.cz && !(L.lv !== 1 && s1 >= L.end - SK.CLOSE_ARM) && wetBand(L.w) !== 'pink') {
    L.standT += dt;
    if (!L.stood && L.standT > SK.STAND_T) { L.stood = true; harm(L, ev, 'blot', s1, SK.PTS.loss); }
  } else if (!stopped) { L.standT = 0; L.stood = false; }
  L.s = s1;
  // ── the end: level 1 at its end; else the close (a stop in the arm, or a walk run on past it)
  if (L.lv === 1) { if (s1 >= L.end) { if (L.cz) cornerClose(L, ev); if (L.seg.n > 0) segClose(L, ev); if (L.pale != null) { if (!isFree(L.pale)) mark(L, 'sikra.pale', L.pale, { s1: +s1.toFixed(2) }); L.pale = null; } L.done = true; ev.push({ e: 'done' }); } }
  else if (s1 >= L.end + SK.CLOSE_OVER) closeAt(L, ev, s1);
  else if (stopped && s1 >= L.end - SK.CLOSE_ARM) closeAt(L, ev, s1);
  if (L.done && L.pale != null) { if (!isFree(L.pale)) mark(L, 'sikra.pale', L.pale, { s1: +L.s.toFixed(2) }); L.pale = null; }
  return ev;
}
/** a tap on the bowl: the helper wets the string (wetness 1); while still dark it is too much: a drip on the spot. After it the next 4
 *  amot drip at a slow pace. → events */
export function bowlTap(L) {
  const ev = []; if (L.done) return ev;
  const dark = wetBand(L.w) === 'dark';
  if (dark && L.started) { L.excess++; newDrip(L, ev, L.s, 'excess'); }
  L.w = 1; L.refills++; L.wetTo = L.s + SK.DRIP_AFTER; L.slowT = 0;
  ev.unshift({ e: 'refill', s: +L.s.toFixed(2), excess: dark && L.started });
  return ev;
}
/** a tap on a fresh drip (within 3 s): the helper wipes it with the swab, a pink mark stays (0 points, the grand prize is lost) */
export function dripTap(L, id) {
  const d = L.drips.find((q) => q.id === id);
  if (!d || (d.st !== 'fresh' && d.st !== 'free') || d.age > SK.WIPE_T) return [];
  if (d.st === 'free') { d.st = 'wiped'; return [{ e: 'wipe', id, s: d.s, pts: 0, free: true }]; }   // (the free trial: no mark)
  d.st = 'wiped'; mark(L, 'sikra.pink', d.s, { n: d.id });
  return [{ e: 'wipe', id, s: d.s, pts: 0 }];
}
/** the fresh drips a tap may wipe now */
export const freshDrips = (L) => L.drips.filter((d) => (d.st === 'fresh' || d.st === 'free') && d.age <= SK.WIPE_T);

/** the most a play can earn (the stakes, every segment at 40, every corner perfect, the close) */
export function lineMax(lv) {
  const L = lv | 0 || 2, walls = L === 1 ? 1 : 4;
  return stakesOf(L).length * SK.PTS.stake + walls * SK.SEG * SK.PTS.seg[0] + cornersOf(L).length * SK.PTS.corner + (L === 1 ? 0 : SK.PTS.close);
}
/** the grand prize (spec "שיא ודופמין"): a whole round with not one lift and not one drip */
export const grandOf = (L) => L.done && L.seams === 0 && L.dripsAll === 0;
/** the work's result: q is what was earned (less the losses) over the most; the stars from q; the one grading's points (40 a grand
 *  round with no damage, 20, 10 with damage); perfect = the grand prize with no damage (its full-screen word "הקפה אחת!") */
export function lineResult(L, Ms) {
  const earned = (Ms ? Ms.pts : 0) + L.gain, net = Math.max(0, earned - L.lossPts), max = lineMax(L.lv);
  const q = Math.max(0, Math.min(1, net / max)), grand = grandOf(L), perfect = grand && L.dmg === 0;
  const stars = q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1, pts = L.dmg > 0 ? 10 : perfect ? 40 : 20;
  const count = (f) => L.marks.filter((m) => m.f === 'sikra.' + f).length;
  return { stars, q: +q.toFixed(3), pts, perfect, grand, net, max, dmg: L.dmg,
    flags: { seam: L.seams, drip: count('drip'), pink: count('pink'), gap: count('gap'), blot: count('blot'), blot2: count('blot2'), smear: count('smear'), wavy: count('wavy'), pale: count('pale'), close: L.closed || null, perfectCorners: L.corners.filter((c) => c.r === 'perfect').length } };
}

/* ───────── the save: the act's blob while it plays (a reload resumes on the line), and the line as it stays ───────── */
/** a compact line for the save: the heights each half amah (tefachim ×100), the wetness band of each, the marks */
export function lineTrack() { return { hs: [], ws: [] }; }
export function lineSave(L, track) { return { v: 1, L: { ...L, flaws: L.flaws.map((f) => ({ ...f })), drips: L.drips.map((d) => ({ ...d })), marks: L.marks.map((m) => ({ ...m })), segs: L.segs.slice(), corners: L.corners.slice(), seg: { ...L.seg }, cz: L.cz ? { ...L.cz } : null }, track: track ? { hs: track.hs.slice(), ws: track.ws.slice() } : null }; }
export function lineLoad(o) { if (!o || o.v !== 1 || !o.L) return null; return { L: { ...o.L }, track: o.track ? { hs: o.track.hs.slice(), ws: o.track.ws.slice() } : lineTrack() }; }
