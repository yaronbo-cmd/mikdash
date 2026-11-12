/* ── build 120 ── h120/model.js — stage 05 "עזרת הנשים והגזוזטרא" (spec docs/specs/shlav-05-he.md, approved 11.11; brief
 * docs/specs/build120-brief.md). Pure: no three.js, no DOM. The acts, the world, the bot and the tests share every rule from here.
 *
 *   const M = createH120(save?, opt?)  → the free-choice face of the director (as h109/model.js):
 *     M.st · M.open() · M.pick(id) · M.canDo(m) · M.mission() · M.done(res) · M.finished() · M.autoTo(want) · M.levelOf(m)
 *     M.progress() · M.streak(n) · M.free() · M.freeMission(id) · M.unitEnd(m) · M.shown(m)
 *     plus M.count() → [done of the twelve, 12] · M.stands(colId) · M.seated(beamId) · M.crew() (crewUnits now) · M.need(beamId)
 *   opt.freeKinds: the free works offered (default ['col', 'saw', 'carry']; the pack narrows it while acts are missing)
 *
 * The save (G.h120, v 1; freshH120()):
 *   { v, cur, done[], res{}, plays{}, best, intro,
 *     col:   { [id]: { done, by 'k'|'c', off [along, across] (fingers), lean [along, across] (fingers, after the wedges), wedges, chip,
 *                      crack, broke } }       (along: + away from the neighbour support, the beam's way; across: + toward the court)
 *     beam:  { [id]: { done (cut), by, need, meas, mark (amot), drift, skew (fingers), line 'sharp'|'faint'|'smear', torn, cut (amot),
 *                      seated, fit 'knock'|'shim'|'trim'|'lost', shim } }
 *     carry: { [lv]: { done, bumps, clean[] } },
 *     mik:   { water (amot over the basin's bottom), outlet (amot | null), ch [ { lv, kind 'in'|'over', pts [[x, z, depth (fingers)]…] } ],
 *              moved { trough: [x, z], jar1: [x, z], … }, [lv]: { done, fixes } },
 *     planks: { done, at [6] }, props { [lv]: 0|1 }, load 0|1, film 0|1 }
 *
 * The pure stepping functions (each documented where it stands):
 *   colStep(s, input, dt, L)    the column on its foot between the pull rope and the brake rope (station 1)
 *   sawStep(s, input, dt, L)    the two-man saw: his stroke, the carpenter's, binds, skew, the knot, the prop (station 2)
 *   carryStep(s, input, dt)     the beam on two shoulders: the front leads, the rear trails (station 3); beamHits() its obstacles
 *   floorH(x, z) · flow(ch, opt) · pourPath(x, z) · refChannel(lv, kind) · mikveh arithmetic (station 4)
 */
import { H120, Y, COLS, COL_IDS, BEAMS, BEAM_OF, MIK, CHAMBER, FINGER as F, TEFACH } from './layout.js';
export { H120, Y, COLS, COL_IDS, BEAMS, BEAM_OF, MIK, CHAMBER, RUNS, LADDERS, joistsOf } from './layout.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const DEG = Math.PI / 180;

/* ───────── the spec's table "מידות וספים" (verbatim), and what the brief adds per level ───────── */
export const LV = Object.freeze({
  1: Object.freeze({ land: 12, lean: 4, foot: 2, strokes: 8, cut: 2, pass: 6, channel: 10, over: 0,
    // (the brief: the crew's lag, the help, the gravity's scale A, the brake window)
    lag: 0.35, arc: 1, colour: 1, wind: 0, pulley: 0, A: 140, brakeTol: 3, knot: 0, rate: 0, shadow: 1, angle: 6 }),
  2: Object.freeze({ land: 10, lean: 3, foot: 1.5, strokes: 9, cut: 1.5, pass: 5, channel: 25, over: 0,
    lag: 0.35, arc: 0, colour: 1, wind: 1, pulley: 0, A: 205, brakeTol: 2, knot: 1, rate: 0, shadow: 0, angle: 4 }),
  3: Object.freeze({ land: 8, lean: 2, foot: 1, strokes: 9, cut: 1, pass: 4, channel: 15, over: 12,
    lag: 0.7, arc: 0, colour: 0, wind: 0, pulley: 1, A: 290, brakeTol: 2, knot: 1, rate: 1, shadow: 0, angle: 3 }),
});

/* ───────── the kohen's three bays (brief §1) ───────── */
export const BAYS = Object.freeze({
  1: Object.freeze({ col: 'S2', beam: 'SB1', nb: 'S1', side: 'S', grid: 'ט־10' }),
  2: Object.freeze({ col: 'N1', beam: 'NB1', nb: 'N2', side: 'N', grid: 'ט־5' }),
  3: Object.freeze({ col: 'EN', beam: 'ENB0', nb: null, side: 'E', grid: 'ו־7' }),
});
const HIS_COLS = new Set(Object.values(BAYS).map((b) => b.col)), HIS_BEAMS = new Set(Object.values(BAYS).map((b) => b.beam));
/** the nominal span of a beam (11; 11¼ for the east wing's long bay) */
export const spanOf = (beamId) => BEAM_OF[beamId].len;
/** the unit vector along a beam from its neighbour support toward his column (level lv's) */
export function bayDir(lv) { const B = BEAM_OF[BAYS[lv].beam], c = COLS[BAYS[lv].col], other = B.a === c.id ? B.pb : B.pa; const dx = c.x - other[0], dz = c.z - other[1], L = Math.hypot(dx, dz); return [dx / L, dz / L]; }

/* ───────── the precision chain (spec "שרשרת הדיוק") ───────── */
/**
 * what the beam of level lv must be (amot): the nominal span plus his column's foot offset along the gallery's axis plus its lean at
 * the top along the axis, both signed away from the neighbour (the save's convention). The stop log lets the foot be at most a tefach
 * off; the lean after wedging at most six fingers.
 */
export function spanTrue(st, lv) {
  const B = BAYS[lv], c = st && st.col && st.col[B.col];
  const off = c && c.off ? clamp(+c.off[0] || 0, -4, 4) : 0, lean = c && c.lean ? clamp(+c.lean[0] || 0, -6, 6) : 0;
  return spanOf(B.beam) + (off + lean) * F;
}
/** the length a beam was cut to (amot): the mark plus the cut's drift, a skew end bearing on its short side; torn fibres one finger more */
export function cutLength(b) { return (+b.mark || 0) + ((+b.drift || 0) - Math.abs(+b.skew || 0) - (b.torn ? 1 : 0)) * F; }
const EPS = 1e-9;
/** how the beam meets its bay: 'knock' within half a finger · 'trim' longer · 'shim' short by up to a tefach (inclusive) · 'lost' */
export function fitOf(need, cut, lv) {
  void lv; const d = cut - need;
  if (Math.abs(d) <= 0.5 * F + EPS) return 'knock';
  if (d > 0) return 'trim';
  return d >= -TEFACH - EPS ? 'shim' : 'lost';
}
const mag = (v) => (v ? Math.hypot(+v[0] || 0, +v[1] || 0) : 0);
/** the bay as the load test finds it: 'perfect' (a column without wedge, chip or crack, lean and foot inside LV, the beam in with a knock) | 'creak' */
export function bayGrade(st, lv) {
  const B = BAYS[lv], c = st.col && st.col[B.col], b = st.beam && st.beam[B.beam], L = LV[lv];
  if (!c || !b) return 'creak';
  if ((c.wedges | 0) > 0 || c.chip || c.crack || c.broke) return 'creak';
  if (mag(c.lean) > L.lean + EPS || mag(c.off) > L.foot + EPS) return 'creak';
  return b.fit === 'knock' && !b.shim ? 'perfect' : 'creak';
}
/** the reason a bay creaks, in plain words (8.2's line) | '' */
export function creakWhy(st, lv) {
  const B = BAYS[lv], c = (st.col && st.col[B.col]) || {}, b = (st.beam && st.beam[B.beam]) || {};
  if (b.shim || b.fit === 'shim') return 'כאן יש כפיס תחת הקורה';
  if ((c.wedges | 0) > 0) return 'העמוד הזה עומד על טריזים';
  if (c.crack) return 'בעמוד הזה יש סדק';
  if (c.chip) return 'שפת הרגל של העמוד שבורה';
  if (mag(c.lean) > LV[lv].lean) return 'העמוד הזה נוטה';
  if (mag(c.off) > LV[lv].foot) return 'רגל העמוד זזה מהסימן';
  return bayGrade(st, lv) === 'perfect' ? '' : 'הקורה לא נכנסה בנקישה';
}

/* ───────── the crews' share (brief §2, crewUnits) ───────── */
// the crews' columns in their order, each with the count of his works after which it stands (S1 is raised in the opening; N2 while
// he works on level 1, before his level-2 measure can open); and their beams, each once both supports stand
const CREW_COLS = [['S1', 0], ['N2', 1], ['S3', 2], ['N3', 4], ['S4', 6], ['N4', 7], ['ES', 8]];
const CREW_BEAMS = [['SB0', 1], ['SB2', 3], ['NB2', 5], ['NB0', 6], ['SB3', 7], ['NB3', 8], ['SB4', 8], ['ESB0', 9], ['NB4', 9], ['ESB1', 10], ['ENB1', 10]];
/**
 * which crew columns stand and which crew beams are seated after nDone of his twelve works.
 *   his: the ids of the columns he raised (plan or free) and beams he seated (free carries) — they are never the crews'
 *   taken: the ids he took as free works (done or in hand) — never the crews' either
 * → { cols: [ids], beams: [ids] }. At twelve, everything stands and is seated.
 */
export function crewUnits(nDone, his = [], taken = []) {
  const H = new Set(his), Tk = new Set(taken), all = nDone >= 12;
  const stand = new Set(H);
  if (all) for (const id of HIS_COLS) stand.add(id);
  const cols = [];
  for (const [id, n] of CREW_COLS) if ((all || nDone >= n) && !H.has(id) && !Tk.has(id)) { cols.push(id); stand.add(id); }
  if (all) for (const id of COL_IDS) if (!stand.has(id) && !Tk.has(id)) { cols.push(id); stand.add(id); }
  const ok = (sid) => sid == null || stand.has(sid);
  const beams = [];
  for (const [id, n] of CREW_BEAMS) { const B = BEAM_OF[id]; if ((all || nDone >= n) && !H.has(id) && !Tk.has(id) && ok(B.a) && ok(B.b)) beams.push(id); }
  return { cols, beams };
}

/* ───────── station 1: the column (brief §4) ───────── */
/**
 * a fresh column state on its cradle. Angles in degrees from the floor; ω deg/s.
 * s: { th, w, p (the crew's force, lagged), pT (the finger's), lock (the brake rope's limit angle | null: running free), held (the
 *      finger on the pull rope), phase 'rise'|'landed'|'fell', land (ω at the seat), off [along, across] (fingers), sway (fingers at
 *      the top, across: the wind and the guy rope), sharp (level 3's warnings since the last tear), tears, crack, chip, jerkT, pHist }
 */
export function colFresh() { return { th: H120.CRADLE, w: 0, p: 0, pT: 0, lock: null, held: false, phase: 'rise', land: 0, off: [0, 0], sway: 0, sharp: 0, tears: 0, crack: 0, chip: 0, crossed: 0, crossW: 0, t: 0, pHist: [], slack: 0, maxW: 0 }; }
const K_PULL = 1.15, DAMP = 6, MU = 1, BRAKE = 2.2, CHIP_W = 18, HEAVE = 3.2;   // (BRAKE: the brake rope's bite, × A)
/** the pull rope's share at θ: whole below BAL, going slack over the next 4° */
export const pullShare = (th) => clamp(1 - (th - H120.BAL) / 4, 0, 1);
/**
 * one step of the column. input: { pT (0..1, the finger's pull), held (the finger on the pull rope, every step), heave (a
 * mouse tap: one short heave), press (the finger on the post: the brake rope locked), pay (degrees paid out round the post this step),
 * sharp (level 3: a pull above the finger-speed threshold), wind (fingers/s across at the top), haul (the guy crew's haul, 3 fingers
 * back) } → the events of this step: 'cross' (past BAL), 'slack', 'locked' (the brake bites a column that wants to go on), 'creak'
 * (a pull against the locked brake), 'warn' / 'tear' (level 3), 'jerk' (the foot walked), 'land' | 'chip' | 'fall' (at 90°).
 * Below BAL the crew's rope never lets it sink (ω ≥ 0); the brake rope only holds back; nothing falls because the finger let go.
 */
export function colStep(s, inp = {}, dt = 1 / 60, L = LV[1]) {
  const ev = [];
  if (s.phase !== 'rise') return ev;
  const BAL = H120.BAL, A = L.A;
  s.held = !!inp.held;
  s.pT = s.held && inp.pT != null ? clamp(+inp.pT, 0, 1) : 0;   // (the finger off the rope: the crew holds what it has, it does not pull on)
  // the foot walks on a jerk of the pull rope while 20° < θ < 70° (a jump of p over 0.5 in 0.15 s, or an abrupt release)
  s.t += dt; s.pHist.push([s.t, s.pT]); while (s.pHist.length && s.t - s.pHist[0][0] > 0.15) s.pHist.shift();
  const pMin = s.pHist.reduce((a, q) => Math.min(a, q[1]), 1), pMax = s.pHist.reduce((a, q) => Math.max(a, q[1]), 0);
  if (pMax - pMin > 0.5 && s.th > 20 && s.th < 70 && !s.jerkT) { s.off[0] = clamp(s.off[0] + 0.25, -4, 4); s.jerkT = 0.3; ev.push('jerk'); }
  if (s.jerkT) s.jerkT = Math.max(0, s.jerkT - dt);
  // level 3: a sharp pull creaks the rope; a second one tears a strand and the column drops back onto its cradle
  if (inp.sharp && L.pulley && s.th < BAL) {
    s.sharp++;
    if (s.sharp === 1) ev.push('warn');
    else { const from = s.th; s.tears++; s.sharp = 0; s.th = H120.CRADLE; s.w = 0; s.p = 0; s.pT = 0; if (from > 45) { s.crack = 1; ev.push('crack'); } ev.push('tear'); s.tearFrom = from; return ev; }
  }
  if (inp.press && s.lock == null) { s.lock = s.th; if (s.w > 0.05) ev.push('locked'); }
  if (!inp.press && inp.press !== undefined) s.lock = null;
  // (rope slips round the post only under load: paid out while the column stands still, it gains no more than a degree of slack)
  if (s.lock != null && inp.pay > 0) s.lock = Math.min(s.lock + inp.pay, Math.max(s.lock, s.th + 0.25));
  const payV = s.lock != null && inp.pay > 0 ? inp.pay / dt : 0;
  if (inp.heave) s.w = Math.max(s.w, 0) + HEAVE;
  // level 2: the east wind's gusts push the top across; a haul on the guy rope takes up to 3 fingers back (never past plumb), and a haul
  // made inside a gust keeps the guy taut for the rest of that gust: the gust no longer moves it (the careful player's whole answer)
  const gust = Math.abs(+inp.wind || 0) > 0.3;
  if (!gust) s.guyHold = 0;
  if (inp.haul) { s.sway = Math.sign(s.sway) * Math.max(0, Math.abs(s.sway) - 3); if (gust) s.guyHold = 1; }
  if (inp.wind && !(gust && s.guyHold)) s.sway += inp.wind * dt;
  const n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n;
  const tau = L.lag;
  for (let i = 0; i < n; i++) {
    s.p += (s.pT - s.p) * (1 - Math.exp(-h / tau));
    const sh = pullShare(s.th);
    let a = -A * Math.sin((BAL - s.th) * DEG) + K_PULL * A * s.p * sh;
    if (s.th < BAL) a -= DAMP * s.w; else a -= MU * Math.sign(s.w);
    s.w += a * h;
    if (s.th < BAL && s.w < 0) s.w = 0;   // (the crew's rope: below the balance it never sinks back)
    const th0 = s.th; s.th += s.w * h;
    if (th0 < BAL && s.th >= BAL && !s.crossed) { s.crossed = 1; s.crossW = s.w; ev.push('cross'); }
    if (sh > 0 && pullShare(s.th) === 0 && !s.slack) { s.slack = 1; ev.push('slack'); }
    // the brake rope: the column cannot pass its limit; a column reaching it is caught (the rope stretches a little)
    // (taut on the post, the column goes no faster than the rope is paid out; one reaching it faster is caught within a degree or two)
    if (s.lock != null && s.th >= s.lock - 1e-6 && s.w > payV) s.w = Math.max(payV, s.w - BRAKE * A * h);
    if (s.w > s.maxW) s.maxW = s.w;
    if (s.th >= 90) {
      s.th = 90; s.land = s.w;
      // the seat: the foot lands flat; the landing walks it ω / land fingers along and leaves a lean of ω / 2 fingers at the top
      s.off[0] = clamp(s.off[0] + s.w / L.land, -4, 4); s.off[1] = clamp(s.off[1] + Math.abs(s.sway) * 0.25 * Math.sign(s.sway), -4, 4);
      if (s.w > CHIP_W) { s.phase = 'fell'; ev.push('fall'); }
      else { s.phase = 'landed'; if (s.w > L.land) { s.chip = 1; ev.push('chip'); } else ev.push('land'); }
      s.w = 0;
      break;
    }
  }
  if (s.lock != null && s.th < BAL && s.held && s.pT > 0.2 && s.th >= s.lock - 0.05) ev.push('creak');
  return ev;
}
/** the lean a landing leaves (fingers at the top): along ω / 2, across the sway at the landing */
export function leanAfter(s) { return [+(0.5 * s.land).toFixed(2), +(+s.sway || 0).toFixed(2)]; }
/** the column's grade (brief §4 "Grade"): 40 · 20 · 10 */
export function colPts(c, lv) {
  const L = LV[lv];
  if (c.broke || c.chip || c.crack) return 10;
  const lean = mag(c.lean), off = mag(c.off), w = c.wedges | 0;
  if (lean <= L.lean + EPS && off <= L.foot + EPS && w === 0) return 40;
  if (lean <= 2 * L.lean + EPS && off <= 2 * L.foot + EPS && w <= 2) return 20;
  return 10;
}
/** a lead wedge driven at a side of the plinth: the top moves one finger away from that side. side: [da, dc] (±1 on one axis) */
export function wedge(c, side) { c.lean = [+(c.lean[0] - side[0]).toFixed(2), +(c.lean[1] - side[1]).toFixed(2)]; c.wedges = (c.wedges | 0) + 1; return c; }
/** the wind of level 2 (fingers/s across at the top) at time t of the act: fixed gusts (rule 56), up to 2 a second in a gust */
export function windAt(t) {
  const P = 7.3, u = ((t % P) + P) % P, k = Math.floor(t / P) % 3;
  const g0 = [1.4, 2.6, 1.8][k], g1 = g0 + [1.6, 1.2, 2.0][k];
  if (u < g0 || u > g1) return 0.12;
  const x = (u - g0) / (g1 - g0); return 2 * Math.sin(Math.PI * x) * [1, 0.85, 0.95][k];
}

/* ───────── station 2: the saw (brief §5) ───────── */
/**
 * s: { depth 0..1, n (his strokes), cn (the carpenter's), turn 'his'|'carp', ct (time into the carpenter's stroke), cEnd (when it
 *      ended, act time), len (this stroke's length so far), drift, skew (fingers), binds, rhythm, run, knotHit, prop, torn, done,
 *      carpDur, t }
 * input: { v (the finger's speed along the saw's axis toward himself, in handle-lengths/s; < 0 pushing), w (across, handle-lengths/s),
 *          down (the finger on his handle), prop (the wedge under the offcut, once tapped) }
 * → events: 'stroke' (his ended: {len, fast}), 'skip' (the start skipped off the line), 'jump' (the knot), 'bind', 'rhythm',
 *   'carp' (the carpenter's stroke began), 'sag' (the last third: the offcut sags), 'through' (cut through), 'tear', 'finish' (14)
 */
export function sawFresh(lv = 1) { return { depth: 0, n: 0, cn: 0, turn: 'his', ct: 0, cEnd: 0, len: 0, peak: 0, drift: 0, skew: 0, binds: 0, rhythm: 0, run: 0, knotHit: 0, prop: 0, torn: 0, done: 0, carpDur: 0.55, t: 0, lv, sag: 0, inStroke: 0, bindNow: 0 }; }
const SAW = { V_ON: 0.35, V_OFF: 0.12, G_HIS: 0.11, G_CARP: 0.04, FAST: 2.4, SHORT: 0.5, KNOT: [0.45, 0.58], SAG: 0.67, MAX: 14 };
export const SAW_K = Object.freeze({ ...SAW });
export function sawStep(s, inp = {}, dt = 1 / 60, L = LV[1]) {
  const ev = []; if (s.done) return ev;
  s.t += dt;
  const v = +inp.v || 0, w = +inp.w || 0;
  if (inp.prop && !s.prop) s.prop = 1;
  if (s.turn === 'carp') {
    // the carpenter's stroke: 0.55 s (level 3: 0.4 after the knot); driving against it binds the saw. His next stroke may start up to
    // 0.12 s before the carpenter's ends (in rhythm): then the carpenter's is over at once
    s.ct += dt;
    const early = inp.down && v > SAW.V_ON && s.ct >= s.carpDur - 0.12;
    if (!early && inp.down && (v > SAW.V_ON || v < -SAW.V_ON) && !s.bindNow) { s.bindNow = 1; s.binds++; s.drift += 0.5; ev.push('bind'); }
    if (s.ct >= s.carpDur || early) {
      s.turn = 'his'; s.cEnd = s.t + Math.max(0, s.carpDur - s.ct); s.cn++;
      s.depth = Math.min(1, s.depth + SAW.G_CARP * (s.depth >= SAW.KNOT[0] && s.depth <= SAW.KNOT[1] && L.knot ? 0.6 : 1));
      if (L.rate && s.knotHit && s.carpDur > 0.4) { s.carpDur = 0.4; ev.push('tempo'); }
      if (sawEnd(s, ev)) return ev;
      if (!early) return ev;
      if (s.bindNow) return ev;   // (still driving the bind's stroke: he must let go first)
    } else return ev;
  }
  // his turn: a stroke begins when the finger drives toward him, ends when it stops driving
  if (s.bindNow && !(inp.down && Math.abs(v) > SAW.V_OFF)) s.bindNow = 0;
  if (!s.inStroke && !s.bindNow && inp.down && v > SAW.V_ON) {
    s.inStroke = 1; s.len = 0; s.peak = 0; s.wander = 0;
    const lag = s.t - s.cEnd;
    if (s.cn > 0 && Math.abs(lag) <= 0.12) { s.rhythm++; s.run++; ev.push('rhythm'); } else if (s.cn > 0) s.run = 0;
  }
  if (s.inStroke) {
    if (v > 0) s.len += v * dt; s.peak = Math.max(s.peak, v);
    if (Math.abs(w) > 0.25) { s.skew += (Math.abs(w) - 0.25) * dt * 2.2; s.wander = 1; }
    if (!inp.down || v < SAW.V_OFF) {
      s.inStroke = 0; s.n++;
      const len = clamp(s.len, 0, 1.2), fast = s.peak > SAW.FAST;
      ev.push('stroke');
      // (a) the start: the first two strokes short and slow, or the saw skips off the line (the drift's seed)
      if (s.n <= 2 && (len > SAW.SHORT + 0.05 || fast)) { s.drift += s.n === 1 ? 1 : 0.5; ev.push('skip'); }
      // (c) the knot: a fast stroke there jumps half a finger
      const inKnot = L.knot && s.depth >= SAW.KNOT[0] && s.depth <= SAW.KNOT[1];
      if (inKnot && (fast || len > SAW.SHORT + 0.05)) { s.drift += 0.5; ev.push('jump'); }
      if (inKnot) s.knotHit = 1;
      const g = SAW.G_HIS * len * (inKnot ? 0.6 : 1) * (s.n <= 2 ? 1.6 : 1);
      s.depth = Math.min(1, s.depth + g);
      if (s.depth >= SAW.SAG && !s.sag) { s.sag = 1; ev.push('sag'); }
      if (sawEnd(s, ev)) return ev;
      s.turn = 'carp'; s.ct = 0; ev.push('carp');
    }
  } else if (inp.down && v < -SAW.V_ON && s.n > 0 && !s.bindNow) { s.binds++; s.drift += 0.5; ev.push('bind'); s.bindNow = 1; }
  return ev;
}
function sawEnd(s, ev) {
  if (s.depth >= 1 - 1e-9) { s.done = 1; if (!s.prop) { s.torn = 1; ev.push('tear'); } ev.push('through'); return true; }
  if (s.n >= SAW.MAX) { s.done = 1; s.over = 1; if (!s.prop) s.prop = 1; ev.push('finish'); return true; }
  return false;
}
/** the cut's grade against his own line (brief §5): 40 · 20 · 10 */
export function sawPts(b, lv) {
  const L = LV[lv], e = Math.abs(+b.drift || 0) + Math.abs(+b.skew || 0);
  if (b.over) return 10;
  if (e <= L.cut + EPS && b.line === 'sharp' && !b.torn && (b.binds | 0) <= 1) return 40;
  if (e <= 2 * L.cut + EPS) return 20;
  return 10;
}
/** the measured span: the true span, the slack cord's error (up to a tefach long at T 0.4), the end's offset from the mark (amot) */
export function measOf(need, T, endOff = 0) { const slack = clamp((1 - T) / 0.6, 0, 1) * TEFACH; return need + slack + endOff; }
/** the red line from the string's lift height (0..1 of the window's scale): 'faint' too low · 'sharp' · 'smear' too high */
export const lineOf = (h) => (h < 0.35 ? 'faint' : h > 0.75 ? 'smear' : 'sharp');

/* ───────── station 3: the beam on two shoulders (brief §6) ───────── */
/**
 * s: { f [x, z] (the front end: the kohen), r [x, z] (the rear: the worker), L (its cut length) }
 * input: { lead 'front'|'rear'|'both', to [x, z] (the finger's ground point for the leading end), to2 (the second finger: the rear) }
 * The leading end walks toward its finger at up to 2.5 amot/s; the other trails like a cart's trailer (it keeps the length and cuts
 * every turn inside). Two fingers: each end to its finger, the length restored symmetrically. → the moved distance of the lead.
 */
export const CARRY = Object.freeze({ V: 2.5, HALF: 0.4 });
export function carryStep(s, inp = {}, dt = 1 / 60) {
  const step = (p, to) => { const dx = to[0] - p[0], dz = to[1] - p[1], d = Math.hypot(dx, dz), m = Math.min(d, CARRY.V * dt); if (d < 1e-9) return 0; p[0] += (dx / d) * m; p[1] += (dz / d) * m; return m; };
  const trail = (lead, tr) => { const dx = tr[0] - lead[0], dz = tr[1] - lead[1], d = Math.hypot(dx, dz) || 1; tr[0] = lead[0] + (dx / d) * s.L; tr[1] = lead[1] + (dz / d) * s.L; };
  let m = 0;
  if (inp.lead === 'both' && inp.to && inp.to2) {
    m = step(s.f, inp.to); step(s.r, inp.to2);
    const cx = (s.f[0] + s.r[0]) / 2, cz = (s.f[1] + s.r[1]) / 2, dx = s.f[0] - s.r[0], dz = s.f[1] - s.r[1], d = Math.hypot(dx, dz) || 1;
    s.f[0] = cx + (dx / d) * s.L / 2; s.f[1] = cz + (dz / d) * s.L / 2; s.r[0] = cx - (dx / d) * s.L / 2; s.r[1] = cz - (dz / d) * s.L / 2;
  } else if (inp.lead === 'rear' && inp.to) { m = step(s.r, inp.to); trail(s.r, s.f); }
  else if (inp.to) { m = step(s.f, inp.to); trail(s.f, s.r); }
  return m;
}
/** the angle (deg, 0..90) between the beam and an axis 'x' | 'z' */
export function carryAngle(s, axis) { const a = Math.abs(Math.atan2(s.f[1] - s.r[1], s.f[0] - s.r[0])) / DEG; const ax = a > 90 ? 180 - a : a; return axis === 'x' ? ax : 90 - ax; }
/**
 * what the beam (segment f–r, half-width CARRY.HALF) touches among the obstacles: { kind, id, ... } of each hit. Obstacle shapes:
 * { c: [x, z], r } a circle (columns, jars, a worker) or { x0, z0, x1, z1 } a rect (walls, piles, scaffold legs, the sledge, the cart,
 * the lime pit). kind: 'hard' (a thud, no damage) · 'scaffold' (−20) · 'jar' (−20) · 'lime' (feet only: the rear man) · 'worker'.
 */
export function beamHits(s, obs, feet) {
  const out = [], H = CARRY.HALF;
  const segD = (px, pz, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1, t = clamp(((px - a[0]) * dx + (pz - a[1]) * dz) / L2, 0, 1); return Math.hypot(px - a[0] - t * dx, pz - a[1] - t * dz); };
  for (const o of obs) {
    if (o.kind === 'lime') {
      // only feet count: the two bearers stand under the ends (feet: [[x, z] front, [x, z] rear])
      const P = feet || [s.f, s.r];
      P.forEach((p, i) => { if (p[0] > o.x0 && p[0] < o.x1 && p[1] > o.z0 && p[1] < o.z1) out.push({ kind: 'lime', id: o.id, who: i ? 'rear' : 'front' }); });
      continue;
    }
    if (o.c) { if (segD(o.c[0], o.c[1], s.f, s.r) < o.r + H) out.push({ kind: o.kind, id: o.id }); continue; }
    // a rect: the segment, widened by H, against it (sampled; the rects are walls and piles, never thinner than a tenth of an amah)
    const n = Math.max(2, Math.ceil(Math.hypot(s.f[0] - s.r[0], s.f[1] - s.r[1]) / 0.1));
    for (let i = 0; i <= n; i++) { const u = i / n, x = s.r[0] + (s.f[0] - s.r[0]) * u, z = s.r[1] + (s.f[1] - s.r[1]) * u; if (x > o.x0 - H && x < o.x1 + H && z > o.z0 - H && z < o.z1 + H) { out.push({ kind: o.kind, id: o.id }); break; } }
  }
  return out;
}

/** station 3's points (brief §6): 40 — no bump, no damage, handed over at the first try, and the beam seats with a knock; 20 — up to
 *  two bumps (a trim never earns more); 10 — otherwise (more bumps, a scaffold or a jar, a shim, a lost beam).
 *  r: { bumps, dmg (count of damage), tries (handings over until it lay right), fit } */
export function carryPts(r) {
  if (r.fit === 'shim' || r.fit === 'lost' || (r.dmg | 0) > 0) return 10;
  if (!(r.bumps | 0) && (r.tries | 0) <= 1 && r.fit === 'knock') return 40;
  return (r.bumps | 0) <= 2 ? 20 : 10;
}

/* ───────── station 4: the mikveh (brief §7) ───────── */
/** 40 seah stand in 1 × 1 × 3 cubic amot (Eruvin 4:2); the basin is 2 × 3 at its bottom → seah to depth (amot) */
export const SEAH40 = 3;
export const depthOfSeah = (seah) => (seah / 40) * SEAH40 / ((MIK.x1 - MIK.x0) * (MIK.z1 - MIK.z0));
/** where the overflow outlet was marked (h amot over the bottom): 'low' (under 3 by more than a finger: kosher, not מהודר) · 'exact' ·
 *  'high' (over 3 by more than a finger, still under the rim's lowest point) · 'over' (above the rim: the water goes over it by itself) */
export function outletOf(h) { if (h > MIK.deep + MIK.rim + EPS) return 'over'; if (Math.abs(h - MIK.deep) <= F + EPS) return 'exact'; return h < MIK.deep ? 'low' : 'high'; }
/** the water a level fills to (amot over the bottom): level 3 by its outlet */
export function waterGoal(lv, outlet) { if (lv < 3) return MIK.goal[lv]; const h = outlet == null ? MIK.deep : outlet; return Math.min(h, MIK.deep + MIK.rim); }

// the floor of the lepers' chamber: a fixed field (rule 56), a general fall toward the basin of about a finger per amah, low rises
// and dips of up to 1.5 tefachim; the strip between the basin and the door falls toward the lime pit (level 3's trap)
const RISES = [
  [13, -47.4, 3.1, 0.55],                          // level 1: one low rise on the straight way (deepen two fingers along about 1.5 amot)
  [31.4, -49.6, 3.4, 0.6], [18.6, -44.4, 3.2, 0.55],   // level 2: two rises
  [10.4, -50.6, 2.4, 0.6],                          // level 3's inflow: a small one
  [26.2, -37.7, 3.0, 0.8],                          // the shoulder east of the lime pit's hollow (the overflow's right way climbs it)
  [33.5, -60.5, -4, 2.2], [22, -64, 3, 2.4], [38.5, -36, -3, 2.0], [8, -33, 2.5, 1.8],   // dips and humps elsewhere
];
const dRect = (x, z, x0, z0, x1, z1) => Math.hypot(Math.max(x0 - x, 0, x - x1), Math.max(z0 - z, 0, z - z1));
const smooth = (a, b, v) => { const u = clamp((v - a) / (b - a), 0, 1); return u * u * (3 - 2 * u); };
const PIT_C = [(MIK.pit.x0 + MIK.pit.x1) / 2, (MIK.pit.z0 + MIK.pit.z1) / 2];
/** the floor's height at (x, z) (amot): the paving's top; the relief is real but too slight to read by eye */
export function floorH(x, z) {
  const hN = F * 1.0 * dRect(x, z, MIK.x0, MIK.z0, MIK.stair, MIK.z1);
  // the south-east strip: a valley from the outlet down to the lime pit, and on toward the door
  const ox = MIK.outlet[0], oz = MIK.outlet[1], ux = PIT_C[0] - ox, uz = PIT_C[1] - oz, uL = Math.hypot(ux, uz);
  const along = ((x - ox) * ux + (z - oz) * uz) / uL, perp = ((x - ox) * -uz + (z - oz) * ux) / uL;
  const hS = -F * 0.95 * clamp(along, -2, uL + 2) + F * 0.18 * perp * perp / (1 + 0.04 * perp * perp) - F * 2.6 * Math.exp(-((x - PIT_C[0]) ** 2 + (z - PIT_C[1]) ** 2) / (2 * 2.2 * 2.2)) - F * 0.9 * clamp(z + 36, 0, 8);
  const w = smooth(-40.6, -38.4, z) * smooth(10.5, 12.5, x);
  let h = (1 - w) * hN + w * hS;
  h += F * (0.55 * Math.sin(x * 0.61 + 1.3) * Math.sin(z * 0.47 - 0.4) + 0.3 * Math.sin(x * 0.23 + z * 0.31));
  for (const [cx, cz, a, sg] of RISES) h += F * a * Math.exp(-((x - cx) ** 2 + (z - cz) ** 2) / (2 * sg * sg));
  return H120.FLOOR + h;
}
/** the vessels on the floor (the plasterers' wooden trough, the jars), as moved: footprints */
export const VESSELS = Object.freeze([
  Object.freeze({ id: 'trough', kind: 'trough', at: Object.freeze([24.5, -46.9]), w: 2.6, d: 1.0 }),
  Object.freeze({ id: 'jar1', kind: 'jar', at: Object.freeze([26.6, -44.3]), r: 0.55 }),
  Object.freeze({ id: 'jar2', kind: 'jar', at: Object.freeze([17.2, -56.4]), r: 0.55 }),
  Object.freeze({ id: 'jar3', kind: 'jar', at: Object.freeze([31.8, -40.6]), r: 0.55 }),
]);
export function vesselsOf(moved = {}) { return VESSELS.map((v) => ({ ...v, at: moved[v.id] ? moved[v.id].slice() : v.at.slice() })); }
function inVessel(x, z, v, pad = 0.1) { if (v.kind === 'trough') return Math.abs(x - v.at[0]) < v.w / 2 + pad && Math.abs(z - v.at[1]) < v.d / 2 + pad; return Math.hypot(x - v.at[0], z - v.at[1]) < v.r + pad; }
const inPit = (x, z) => x > MIK.pit.x0 && x < MIK.pit.x1 && z > MIK.pit.z0 && z < MIK.pit.z1;
/** a channel's points resampled every `step` amot, the depth (fingers) interpolated → [[x, z, depth, i0]] (i0: the source vertex) */
export function resample(pts, step = 0.25) {
  const out = []; if (!pts || !pts.length) return out;
  out.push([pts[0][0], pts[0][1], pts[0][2] || 1, 0]);
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.ceil(L / step));
    for (let k = 1; k <= n; k++) { const u = k / n; out.push([a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, (a[2] || 1) + ((b[2] || 1) - (a[2] || 1)) * u, u < 0.5 ? i - 1 : i]); }
  }
  return out;
}
/**
 * the water's run along a channel (the approved first version: along the channel only, not a free spill). The bed at a point is the
 * floor less its depth. The water passes on while the next bed is not higher; before a higher bed it must stand up to it, allowed
 * only if the channel's brim (the floor) along the standing reach is at least that high (and the source is); else it stops there.
 * opt: { moved (the vessels' places), step }
 * → { ok (it ran the whole channel), stop (the sample index it stood at | -1), at [x, z] (where), vessel (id of a vessel it ran
 *     through | null), pit (it ran into the lime pit), pools [[i0, i1]] (the reaches it stood in), n, len (amot run), front (index) }
 */
export function flow(ch, opt = {}) {
  const P = resample(ch.pts || ch, opt.step || 0.25), V = vesselsOf(opt.moved);
  const res = { ok: false, stop: -1, at: null, vessel: null, pit: false, pools: [], n: P.length, len: 0, front: 0 };
  if (P.length < 2) return res;
  const bed = P.map((p) => floorH(p[0], p[1]) - p[2] * F), brim = P.map((p) => floorH(p[0], p[1]));
  let level = bed[0];
  for (let i = 1; i < P.length; i++) {
    const p = P[i];
    if (!res.vessel) for (const v of V) if (inVessel(p[0], p[1], v)) { res.vessel = v.id; break; }
    if (inPit(p[0], p[1])) res.pit = true;
    if (bed[i] > level + 1e-9) {
      // it stands back over the reach whose bed is lower than this one; the brim there must hold it
      let j = i - 1, held = true; while (j >= 0 && bed[j] < bed[i]) { if (brim[j] < bed[i] - 1e-9) { held = false; break; } j--; }
      if (held && j < 0 && brim[0] < bed[i]) held = false;
      if (!held) { res.stop = i - 1; res.at = [P[i - 1][0], P[i - 1][1]]; res.front = i - 1; return res; }
      res.pools.push([j + 1, i - 1]);
    }
    level = bed[i];
    res.len += Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]); res.front = i;
  }
  res.ok = true; return res;
}
/** the steepest fall from (x, z): the test pour's thread, the spill over a rim. → [[x, z]…] up to len amot (it stops in a hollow) */
export function pourPath(x, z, len = 4, step = 0.2) {
  const out = [[x, z]]; let px = x, pz = z;
  for (let k = 0; k * step < len; k++) {
    const e = 0.05, gx = (floorH(px + e, pz) - floorH(px - e, pz)) / (2 * e), gz = (floorH(px, pz + e) - floorH(px, pz - e)) / (2 * e), g = Math.hypot(gx, gz);
    if (g < 1e-5) break;
    const nx = px - (gx / g) * step, nz = pz - (gz / g) * step;
    if (floorH(nx, nz) >= floorH(px, pz)) break;
    px = nx; pz = nz; out.push([px, pz]);
    if (inPit(px, pz)) break;
  }
  return out;
}
/** does a channel end where it must: an inflow at the basin's inlet notch, an overflow out of the chamber's door */
export function reaches(ch) {
  const p = ch.pts[ch.pts.length - 1]; if (!p) return false;
  if (ch.kind === 'over') return p[0] > CHAMBER.door[0] && p[0] < CHAMBER.door[1] && p[1] >= CHAMBER.doorZ - 0.6;
  return Math.hypot(p[0] - MIK.inlet[0], p[1] - MIK.inlet[1]) < 0.8 || dRect(p[0], p[1], MIK.x0, MIK.z0, MIK.x1, MIK.z1) < 0.45;
}
/** does a channel start where it must: at its level's hollow (inflow) or at the outlet (overflow) */
export function starts(ch) {
  const p = ch.pts[0]; if (!p) return false;
  const s = ch.kind === 'over' ? MIK.outlet : MIK.hollows[ch.lv]; return Math.hypot(p[0] - s[0], p[1] - s[1]) < 0.9;
}
/** deepen a channel's vertices within r of (x, z) by df fingers → { cracked: [vertex indices that passed four fingers] } */
export function deepenAt(pts, x, z, df, r = 0.6) {
  const cracked = [];
  for (let i = 0; i < pts.length; i++) { const p = pts[i]; if (Math.hypot(p[0] - x, p[1] - z) <= r) { p[2] = (p[2] || 1) + df; if (p[2] > 4 + 1e-9) cracked.push(i); } }
  return { cracked };
}
// the reference ways (brief §7: "the reference solutions of the three levels must exist and be tested"): waypoints, then each point
// deepened as little as the fall asks (a bed that never rises: the water never has to stand)
const WAYS = {
  'in1': [MIK.hollows[1], [13, -49.5], [13, -45], MIK.inlet],
  'in2': [MIK.hollows[2], [31.5, -49.7], [24.5, -45.2], [18.6, -44.4], [15, -43.2], MIK.inlet],   // (round the trough's south side, between it and the jar)
  'in3': [MIK.hollows[3], [10.4, -50.6], [12.4, -45.5], MIK.inlet],
  'over3': [MIK.outlet, [17.5, -38.9], [24.8, -38.7], [27.8, -36.2], [27.8, -32], [27, -29.9], [27, -29.2]],
};
/** a channel's depths set as the fall asks: each point as shallow as it may be (a finger at least) while its bed never rises → the
 *  channel (its pts changed in place); maxDepth (fingers) the deepest it took */
export function greedy(ch) {
  let bed = Infinity, mx = 0;
  for (const p of ch.pts) { const f = floorH(p[0], p[1]); const b = Math.min(bed, f - F); p[2] = +Math.max(1, (f - b) / F + 0.02).toFixed(2); bed = f - p[2] * F; mx = Math.max(mx, p[2]); }
  ch.maxDepth = mx; return ch;
}
/** the waypoints of a reference way → points every amah with depths (fingers): the least that keeps the bed from rising */
export function refChannel(lv, kind = 'in') {
  const W = WAYS[kind + lv]; if (!W) return null;
  return greedy({ lv, kind, pts: resample(W.map((p) => [p[0], p[1], 1]), 1).map((p) => [p[0], p[1], 1]) });
}
/** the straight line from a level's start to its end, one finger deep (what a child draws first) */
export function straightChannel(lv, kind = 'in') {
  const a = kind === 'over' ? MIK.outlet : MIK.hollows[lv], b = kind === 'over' ? [26, -29.2] : MIK.inlet;
  return { lv, kind, pts: resample([[a[0], a[1], 1], [b[0], b[1], 1]], 1).map((p) => [p[0], p[1], 1]) };
}

/* ───────── the plan ───────── */
const MISSIONS = () => {
  const L = [];
  for (const lv of [1, 2, 3]) for (const k of ['col', 'saw', 'carry', 'mikveh']) L.push({ k, id: `${k}${lv}`, lv });
  L.push({ k: 'planks', id: 'planks', lv: 1 });
  return L;
};
export const PLAN = Object.freeze(MISSIONS().map((m, i) => Object.freeze({ ...m, n: i })));
export const KINDS = Object.freeze(['col', 'saw', 'carry', 'mikveh', 'planks']);
const TWELVE = PLAN.filter((m) => m.k !== 'planks').map((m) => m.id);
const kindOf = (id) => (/^[a-z]+/.exec(id) || [''])[0];

/* ───────── the free works (rule 58, "רשות"): colF:<id>, sawF:<id>, carryF:<id> ───────── */
export function freeOf(id) {
  const m = /^(col|saw|carry)F:([A-Z0-9]+)$/.exec(id || ''); if (!m) return null;
  if (m[1] === 'col' && (!COLS[m[2]] || HIS_COLS.has(m[2]))) return null;
  if (m[1] !== 'col' && (!BEAM_OF[m[2]] || HIS_BEAMS.has(m[2]))) return null;
  return { k: m[1], id, unit: m[2], lv: 3, free: true, noPulley: m[1] === 'col' };
}

/* ───────── the save ───────── */
export function freshH120() {
  return { v: 1, cur: null, done: [], res: {}, plays: {}, best: 0, intro: 0, col: {}, beam: {}, carry: {}, mik: { water: 0, outlet: null, ch: [], moved: {} }, planks: { done: 0, at: [] }, props: {}, load: 0, film: 0, i: 0 };
}
const FREE_CACHE = {};
export function createH120(save, opt = {}) {
  const st = save && save.v === 1 ? save : freshH120();
  for (const [k, v] of Object.entries(freshH120())) if (st[k] === undefined) st[k] = v;
  for (const k of ['water', 'outlet', 'ch', 'moved']) if (st.mik[k] === undefined) st.mik[k] = freshH120().mik[k];
  const freeKinds = new Set(opt.freeKinds || ['col', 'saw', 'carry']);
  if (st.cur && !PLAN.some((m) => m.id === st.cur) && !freeOf(st.cur)) st.cur = null;
  const d = (id) => st.done.includes(id);
  const M = {
    st,
    get plan() { return PLAN; },
    mission() { return st.cur ? PLAN.find((m) => m.id === st.cur) || M.freeMission(st.cur) : null; },
    isDone: d,
    /** may m be done now: the real building conditions only (brief §2) */
    canDo(m) {
      if (!m || d(m.id)) return false;
      if (m.free) return M.free().some((x) => x.id === m.id);
      const lv = m.lv;
      switch (m.k) {
        case 'col': return lv === 1 || d('col' + (lv - 1));
        case 'mikveh': return lv === 1 || d('mikveh' + (lv - 1));
        case 'saw': return d('col' + lv);
        case 'carry': return d('saw' + lv);
        case 'planks': return TWELVE.every(d);
        default: return false;
      }
    },
    open() { return PLAN.filter((m) => M.canDo(m)).concat(M.free()); },
    pick(id) { const m = id ? (PLAN.find((x) => x.id === id) || M.freeMission(id)) : null; st.cur = m && M.canDo(m) ? m.id : null; return M.mission(); },
    freeMission(id) { const m = freeOf(id); if (!m) return null; FREE_CACHE[id] = FREE_CACHE[id] || Object.freeze(m); return FREE_CACHE[id]; },
    /** his twelve works done (the planks are the closing one, not counted) */
    nDone() { return TWELVE.filter(d).length; },
    count() { return [M.nDone(), 12]; },
    /** what he built himself: his plan columns raised, his free columns, his free carries */
    his() {
      const L = [];
      for (const lv of [1, 2, 3]) if (d('col' + lv)) L.push(BAYS[lv].col);
      for (const id of st.done) { const f = freeOf(id); if (f && (f.k === 'col' || f.k === 'carry')) L.push(f.unit); }
      return L;
    },
    taken() { const L = []; for (const id of st.done.concat(st.cur ? [st.cur] : [])) { const f = freeOf(id); if (f) L.push(f.unit); } return L; },
    crew() { return crewUnits(M.nDone(), M.his(), M.taken()); },
    stands(id) { return M.his().includes(id) || M.crew().cols.includes(id); },
    seated(id) {
      for (const lv of [1, 2, 3]) if (BAYS[lv].beam === id) return d('carry' + lv);
      return d('carryF:' + id) || M.crew().beams.includes(id);
    },
    /** the free works open now (rule 58): every column the crews have not raised yet; every main beam whose two supports stand */
    free() {
      const out = []; const C = M.crew(), cs = new Set(C.cols), bs = new Set(C.beams), his = new Set(M.his());
      if (freeKinds.has('col')) for (const id of COL_IDS) { if (HIS_COLS.has(id) || cs.has(id) || his.has(id) || d('colF:' + id)) continue; out.push(M.freeMission('colF:' + id)); }
      for (const B of BEAMS) {
        if (HIS_BEAMS.has(B.id) || bs.has(B.id) || d('carryF:' + B.id)) continue;
        const up = (sid) => sid == null || cs.has(sid) || his.has(sid);
        if (!up(B.a) || !up(B.b)) continue;
        if (!d('sawF:' + B.id)) { if (freeKinds.has('saw')) out.push(M.freeMission('sawF:' + B.id)); }
        else if (freeKinds.has('carry')) out.push(M.freeMission('carryF:' + B.id));
      }
      return out.filter(Boolean);
    },
    finished() { return PLAN.every((m) => d(m.id)); },
    /** (tests, the one-minigame page) the open plan works not passing `want` are done by the crews until one that passes is open */
    autoTo(want) {
      for (let g = 0; g < PLAN.length + 2; g++) {
        const O = M.open().filter((m) => !m.free), hit = O.find(want); if (hit) return M.pick(hit.id);
        const m = O[0]; if (!m) return null;
        st.cur = m.id; M.done({ stars: 2 });
      }
      return null;
    },
    levelOf(m) { if (m.free) return 3; const n = (st.plays[m.id] | 0); return Math.min(3, (m.lv | 0) + (n > 0 ? 1 : 0)); },
    /** the beam's need (amot): his bay's true span; a crew's or a free beam's nominal one */
    need(beamId) { for (const lv of [1, 2, 3]) if (BAYS[lv].beam === beamId) return spanTrue(st, lv); return spanOf(beamId); },
    /** the picked work ends: { stars, q, lost } — what the act did not leave in the save, the crews leave as they would have */
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      st.res[m.id] = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), lost: !!res.lost };
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      if (!d(m.id)) st.done.push(m.id);
      st.cur = null; st.i = st.done.length;
      M.defaults(m);
      return null;
    },
    /** what the crews leave of a work not played (a one-minigame page, tests): a column exact and unwedged, a beam cut to the true
     *  span with a sharp line, the level's channel as the reference way, the water at the level's mark */
    defaults(m) {
      const lv = m.lv;
      if (m.k === 'col') { const id = m.free ? m.unit : BAYS[lv].col; if (!(st.col[id] && st.col[id].done)) st.col[id] = { done: 1, by: 'c', off: [0, 0], lean: [0, 0], wedges: 0, chip: 0, crack: 0, broke: 0 }; }
      if (m.k === 'saw' || m.k === 'carry') {
        const id = m.free ? m.unit : BAYS[lv].beam, need = M.need(id);
        const b = st.beam[id] || (st.beam[id] = {});
        if (!b.done) Object.assign(b, { done: 1, by: b.by || 'c', need, meas: need, mark: need, drift: 0, skew: 0, line: 'sharp', torn: 0, cut: need });
        if (m.k === 'carry' && !b.seated) { b.seated = 1; b.fit = b.fit || fitOf(need, b.cut, lv); if (b.fit === 'shim') b.shim = 1; }
        if (m.k === 'carry' && !m.free) st.carry[lv] = st.carry[lv] || { done: 1, bumps: 0, clean: [] };
      }
      if (m.k === 'mikveh') {
        const L = st.mik[lv] || (st.mik[lv] = {}); L.done = 1; L.fixes = L.fixes | 0;
        if (!st.mik.ch.some((c) => c.lv === lv && c.kind === 'in')) st.mik.ch.push(refChannel(lv, 'in'));
        if (lv === 3) { if (st.mik.outlet == null) st.mik.outlet = MIK.deep; if (!st.mik.ch.some((c) => c.lv === 3 && c.kind === 'over')) st.mik.ch.push(refChannel(3, 'over')); }
        st.mik.water = Math.max(st.mik.water || 0, waterGoal(lv, st.mik.outlet));
      }
      if (m.k === 'planks' && !st.planks.done) st.planks = { done: 1, at: [0, 1, 2, 3, 4, 5].map((i) => i) };
    },
    progress() { return Math.min(1, st.done.filter((id) => PLAN.some((m) => m.id === id)).length / PLAN.length); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
    /** the crews' chambers' walls while he works (0..1 of their courses): as many of his twelve as are done */
    shown() { return Math.min(0.96, 0.18 + (0.78 * M.nDone()) / 12); },
    /** the main beams seated (the goal chip "מפתחים n/14") */
    bays() { return BEAMS.filter((B) => M.seated(B.id)).length; },
    /** a bay of the gallery closes when his beam is seated: מהודר when its column, its cut and its carry earned three stars */
    unitEnd(m) {
      if (m.k !== 'carry' || m.free) return null;
      const r = ['col', 'saw', 'carry'].map((k) => st.res[k + m.lv]).filter(Boolean);
      const all3 = r.length === 3 && r.every((x) => x.stars >= 3);
      return { title: 'מפתח נסגר בגזוזטרא', sub: all3 ? 'מהודר' : 'כשר', bonus: `מפתח ${m.lv} · ${all3 ? 'מהודר' : 'כשר'}` };
    },
  };
  return M;
}
export const starsOf = (q) => (q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1);
/** points by the spec's rule: 40 clean, 20 (a mistake without damage), 10 */
export const qOf = (pts) => (pts >= 40 ? 1 : pts >= 20 ? 0.75 : 0.5);
export { kindOf };
