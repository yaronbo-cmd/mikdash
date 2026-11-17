/* ── build 130 ── h130/model.js — the NEW stage 05 "עזרת הנשים" (spec docs/specs/shlav-05-hadash-he.md, approved 15.11; brief
 * docs/specs/build130-brief.md §2, §10). Pure: no three.js, no DOM. The acts, the world, the bot and the tests share every rule here.
 * Every place comes from the address book (BOOK.s05: gal, wood, light, eve, runs, ladders); nothing random at play time (rule 56):
 * every table is fixed.
 *
 *   H130 · LINES · QUICK · LOSS · lossPts · applyLoss · starsOf · qOf · grade     the constants, the sourced lines, the loss table
 *   Gallery  GAL · RUNS · LEVELS · runOf · colXZ · beamOf · sagOf · spans · blockedAt · hides · placeOk · testBelow · testAbove ·
 *            galCheck · galPts · allowedOf · solve · slackOf · evenOf · menorahGap
 *            the raising (h120's model, kept as it is): RAISE_LV · CRADLE · BAL · pullShare · colFresh · colStep · leanAfter · colPts ·
 *            wedge
 *   Wood     WOOD · LOGS · logFresh · wormy · rollStep · seenHoles · tapAt · peelAt · decide · cutAt · woodPts · endBad · bestCut ·
 *            piecesOf
 *   Light    WICK · wickFresh · wickStep · wickOf · MEASURES · measure · minPours · CLIMB · climbFresh · climbStep · POUR ·
 *            pourFresh · pourStep · lightOf · lightPts
 *   PLAN · KINDS · freshH130 · createH130(save) · fromOld(old, oldDone)   the free-choice face of the director (as h129's)
 *
 * Units: amot, seconds, log (the liquid measure), degrees where named.
 */
import { BOOK } from '../world/grid.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const S5 = BOOK.s05, GB = S5.gal;
const EPS = 1e-9;

/* ───────── the constants ───────── */
export const H130 = Object.freeze({
  FLOOR: S5.court.floor,
  LOSS: 20, LOSS_BIG: 40,
});

/* ───────── the lines (brief §11: copied from the spec's file and nowhere else) ───────── */
export const LINES = Object.freeze({
  middot25: 'וחלקה היתה בראשונה, והקיפוה כצוצרה, שהנשים רואות מלמעלן, והאנשים מלמטן, כדי שלא יהו מערבין (מידות ב, ה)',
  sukkah51a: '"נשים מבפנים ואנשים מבחוץ" (סוכה נא ע"ב)',
  sukkah51b: '"נשים יושבות מלמעלה ואנשים מלמטה" (סוכה נא ע"ב)',
  wood: 'לשכת העצים, ששם הכהנים בעלי מומין מתליעין העצים. וכל עץ שנמצא בו תולעת, פסול מעל גבי המזבח (מידות ב, ה)',
  sukkah52: 'ומנורות של זהב היו שם, וארבעה ספלים של זהב בראשיהן, וארבעה סלמות לכל אחד ואחד, וארבעה ילדים מפרחי כהנה ובידיהם כדים של שמן (סוכה ה, ב)',
  sukkah52b: 'גובהה של מנורה חמשים אמה ... כדי שמן של שלשים שלשים לוג (סוכה נב ע"ב)',
  sukkah53: 'מבלאי מכנסי כהנים ומהמיניהן מהן היו מפקיעין, ובהן היו מדליקין (סוכה ה, ג)',
  eve: 'ולא היתה חצר בירושלים שאינה מאירה מאור בית השואבה (סוכה ה, ג)',
  eveAhead: 'מבט קדימה אל שמחת בית השואבה (המחשה)',
  // the opening of station 1 (the spec's own lines), and its mark
  where: 'איפה יעמוד כל קהל?',
  up: 'ואם נעלה קומה?',
  ill: '(המחשה)',
});
/** the quick words (rule 64) */
export const QUICK = Object.freeze({
  place: 'במקום!', straight: 'קורה ישרה!', clear: 'רואים!', perfectTest: 'כולם רואים!',
  brake: 'בלימה בול!', soft: 'נחיתה רכה!', plumb: 'אנך!',
  clean: 'נקי!', found: 'נמצא!', cut: 'חיתוך מדויק!',
  wick: 'רצועה שלמה!', exact: 'שלושים בדיוק!', rung: 'בקצב!', poured: 'בלי טיפה!', lit: 'דולק!',
});
/** the loss table (brief §10): label and points */
export const LOSS = Object.freeze({
  'gal.beam': ['קורה שנסדקה, ותמיכה גסה תחתיה', 20],
  'gal.column': ['העמוד נפל ונשבר', 40],
  'wood.worm': ['בול נגוע בערימה הנקייה', 20],
  'light.jar': ['כד שנשבר וכתם שמן על הרצפה', 20],
});
export const lossPts = (flag) => (LOSS[flag] ? LOSS[flag][1] : 0);
/** the score after a loss: never below zero */
export const applyLoss = (score, pts) => Math.max(0, (score | 0) - Math.max(0, pts | 0));

/* ───────── grades (the one system: 40 / 20 / 10; any damage caps the work at 10) ───────── */
export const starsOf = (q) => (q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1);
export const qOf = (pts) => (pts >= 40 ? 1 : pts >= 20 ? 0.75 : 0.5);
export const grade = (dmg, clean) => ((dmg | 0) > 0 ? 10 : clean ? 40 : 20);

/* ═════════════════ station 1: the gallery (brief §2 "Gallery") ═════════════════ */
/** the rules' numbers: a gap up to STRAIGHT is a straight beam, up to SAG it sags (kosher), more cracks; a column keeps LADDER from a
 *  ladder's crossing along the line, MINGAP from another column, END from the run's end wall; it hides the torch when a spectator's
 *  line passes within HIDE of its middle; no spectator line may pass within MENORAH of the menorah. SINK: the seat row over a sagging
 *  beam sinks (amot, the beam's sag at its middle) and the railing cuts the torch from a seat once the sink passes CLEAR. */
export const GAL = Object.freeze({ STRAIGHT: 12, SAG: 14, LADDER: 1.5, MINGAP: 2, END: 1, HIDE: 1.2, MENORAH: 2, SAG_MAX: 0.45, CLEAR: 0.12, CRACK_SINK: 0.3 });
const LADDERS = S5.ladders;
/** the three runs (BOOK.s05.gal.runs), each with its ladders' crossings along the line */
export const RUNS = Object.freeze(Object.fromEntries(Object.entries(GB.runs).map(([side, R]) => {
  const lad = LADDERS.filter(([x, z]) => (R.axis === 'x' ? Math.sign(z) === Math.sign(R.line) && x >= R.a0 && x <= R.a1 : Math.abs(x - R.line) < 4 && z >= R.a0 && z <= R.a1)).map(([x, z]) => (R.axis === 'x' ? x : z));
  return [side, Object.freeze({ side, ...R, cut: R.cut ? Object.freeze([...R.cut]) : null, ladders: Object.freeze(lad) })];
})));
/** the levels (BOOK.s05.gal.lv): the run, the stock, the spectators, the torch's stops as points */
export const LEVELS = Object.freeze(Object.fromEntries(Object.entries(GB.lv).map(([lv, V]) => [lv, Object.freeze({
  lv: +lv, side: V.side, run: RUNS[V.side], stock: V.stock, spare: V.spare, n: V.stock, watch: V.watch, torch: Object.freeze(V.torch.map((i) => GB.torch[i])), raise: V.raise || null,
})])));
export const runOf = (lv) => LEVELS[lv].run;
/** a column's place on the court's floor from its place along the run */
export const colXZ = (run, a) => (run.axis === 'x' ? [a, run.line] : [run.line, a]);
/** a beam over a gap: 'straight' | 'sag' | 'crack' */
export const beamOf = (len) => (len <= GAL.STRAIGHT + EPS ? 'straight' : len <= GAL.SAG + EPS ? 'sag' : 'crack');
/** the sag at a beam's middle (amot): none up to 12, growing to SAG_MAX at 14 */
export const sagOf = (len) => (len <= GAL.STRAIGHT + EPS ? 0 : +(GAL.SAG_MAX * clamp((len - GAL.STRAIGHT) / (GAL.SAG - GAL.STRAIGHT), 0, 1)).toFixed(3));
/** the run's segments (the east is cut by the gate's passage) */
const segsOf = (run) => (run.cut ? [[run.a0, run.cut[0]], [run.cut[1], run.a1]] : [[run.a0, run.a1]]);
/**
 * the gaps of a run with columns at `cols` (places along the line, any order): every gap between two supports, the two end gaps of
 * each segment included (a segment's ends are the walls, or the gate's jambs) → [{ a0, a1, len, kind, sag, seg }] in order
 */
export function spans(run, cols) {
  const s = [...cols].map(Number).filter(Number.isFinite).sort((a, b) => a - b), out = [];
  segsOf(run).forEach(([s0, s1], seg) => {
    let p = s0;
    for (const a of s.filter((v) => v > s0 && v < s1)) { out.push({ a0: p, a1: a, len: a - p, seg }); p = a; }
    out.push({ a0: p, a1: s1, len: s1 - p, seg });
  });
  for (const g of out) { g.len = +g.len.toFixed(4); g.kind = beamOf(g.len); g.sag = sagOf(g.len); }
  return out;
}
/** a point's distance to a segment */
export function segDist(p, a, b) {
  const vx = b[0] - a[0], vz = b[1] - a[1], l2 = vx * vx + vz * vz, t = l2 ? clamp(((p[0] - a[0]) * vx + (p[1] - a[1]) * vz) / l2, 0, 1) : 0;
  return Math.hypot(p[0] - a[0] - t * vx, p[1] - a[1] - t * vz);
}
/** does a column (its middle [x, z]) hide the torch from a spectator: the line between them passes within HIDE of it */
export const hides = (col, watcher, torch) => segDist(col, watcher, torch) < GAL.HIDE;
/**
 * why a column may not stand at a along the run (others: the other columns' places): 'end' (at the end walls or a jamb), 'gate' (in the
 * gate's passage), 'ladder' (within LADDER of a ladder's crossing), 'near' (within MINGAP of another column) — or null
 */
export function blockedAt(run, a, others = []) {
  if (a < run.a0 + GAL.END - EPS || a > run.a1 - GAL.END + EPS) return 'end';
  if (run.cut && a > run.cut[0] - GAL.END + EPS && a < run.cut[1] + GAL.END - EPS) return 'gate';
  if (run.ladders.some((l) => Math.abs(a - l) < GAL.LADDER - EPS)) return 'ladder';
  if (others.some((o) => Math.abs(o - a) < GAL.MINGAP - EPS)) return 'near';
  return null;
}
/** the nearest place to a where a column may stand (the act slides a dropped column there), or null */
export function placeOk(run, a, others = []) {
  if (!blockedAt(run, a, others)) return a;
  for (let d = 0.05; d < 60; d += 0.05) for (const s of [-1, 1]) { const b = +(a + s * d).toFixed(3); if (b >= run.a0 && b <= run.a1 && !blockedAt(run, b, others)) return b; }
  return null;
}
/**
 * the test from below: every spectator looks at every stop of the torch; a column whose middle is within HIDE of that line hides it
 * → { lost: [{ w, t, col }], hidden: [column indices], ok }  (cols: places along the run, in the act's own order)
 */
export function testBelow(cols, lv) {
  const L = LEVELS[lv], run = L.run, lost = [], hid = new Set();
  L.watch.forEach((w, wi) => L.torch.forEach((t, ti) => cols.forEach((a, ci) => { if (hides(colXZ(run, a), w, t)) { lost.push({ w: wi, t: ti, col: ci }); hid.add(ci); } })));
  return { lost, hidden: [...hid].sort((a, b) => a - b), ok: !lost.length };
}
/**
 * the test from above: the seats over a sagging beam sink with it (its sag at the middle); past CLEAR the railing cuts the torch from
 * those seats. A cracked beam is propped but its seats sink CRACK_SINK. → { rows: [{ gap, a0, a1, sink, cut }], cut }
 */
export function testAbove(cols, lv) {
  const run = LEVELS[lv].run, rows = [];
  spans(run, cols).forEach((g, i) => {
    const sink = g.kind === 'crack' ? GAL.CRACK_SINK : g.sag;
    if (sink > 0) rows.push({ gap: i, a0: g.a0, a1: g.a1, sink, cut: sink > GAL.CLEAR });
  });
  return { rows, cut: rows.some((r) => r.cut) };
}
/**
 * the whole check of a layout: legal (every column may stand where it is), the gaps, how many sag and crack, who loses the torch, and
 * whether it is מהודר (the least number of columns, every beam straight, the torch never lost)
 */
export function galCheck(cols, lv) {
  const L = LEVELS[lv], run = L.run, legal = cols.every((a, i) => !blockedAt(run, a, cols.filter((_, j) => j !== i)));
  const g = spans(run, cols), sags = g.filter((x) => x.kind === 'sag').length, cracks = g.filter((x) => x.kind === 'crack').length, below = testBelow(cols, lv);
  return { legal, gaps: g, sags, cracks, hidden: below.hidden, lost: below.lost.length, n: cols.length, least: cols.length <= L.n, mehudar: legal && cols.length <= L.n && !sags && !cracks && below.ok };
}
/** a gallery work's points: 40 מהודר; 20 a kosher layout (a sag, a spare column, the torch still lost somewhere); 10 a crack (damage) */
export const galPts = (c, dmg = 0) => grade(dmg + (c.cracks | 0), c.mehudar);
/** the run's places where a column may stand, as intervals [lo, hi] (none of the rules but the gaps): END, the gate, the ladders, and
 *  the hide windows of every spectator-to-torch line of the level (sampled every 0.01 amot) */
export function allowedOf(lv, step = 0.01) {
  const L = LEVELS[lv], run = L.run, out = []; let lo = null, prev = null;
  for (let a = run.a0; a <= run.a1 + EPS; a = +(a + step).toFixed(4)) {
    const ok = !blockedAt(run, a) && !L.watch.some((w) => L.torch.some((t) => hides(colXZ(run, a), w, t)));
    if (ok && lo == null) lo = a;
    if (!ok && lo != null) { out.push([lo, prev]); lo = null; }
    prev = a;
  }
  if (lo != null) out.push([lo, prev]);
  return out;
}
const inIv = (iv, a) => iv.find(([lo, hi]) => a >= lo - EPS && a <= hi + EPS) || null;
/** a column's room with its neighbours fixed (amot): the width of the places it may take, its gaps kept straight */
function roomOf(run, iv, cs, i) {
  const seg = segsOf(run).find(([s0, s1]) => cs[i] > s0 && cs[i] < s1), prev = cs.filter((a) => a < cs[i] && a > seg[0]).pop() ?? seg[0], next = cs.find((a) => a > cs[i] && a < seg[1]) ?? seg[1];
  const lo0 = Math.max(next - GAL.STRAIGHT, prev === seg[0] ? prev : prev + GAL.MINGAP), hi0 = Math.min(prev + GAL.STRAIGHT, next === seg[1] ? next : next - GAL.MINGAP);
  const I = inIv(iv, cs[i]); if (!I) return 0;
  return Math.max(0, Math.min(hi0, I[1]) - Math.max(lo0, I[0]));
}
/**
 * every layout of n columns on a step grid where every rule holds (every beam straight, no torch lost) → { count, best: { cols, room } }
 * best: the one whose tightest column has the most room. (The tests' and the tuning's; the act never solves for the player.)
 */
export function solve(lv, n, step = 0.25) {
  const L = LEVELS[lv], run = L.run, iv = allowedOf(lv), segs = segsOf(run);
  // one segment: every layout of k columns in it, its gaps all straight → { count, list }
  function inSeg([s0, s1], k) {
    const pts = []; for (let a = s0; a <= s1 + EPS; a = +(a + step).toFixed(4)) if (a > s0 && a < s1 && inIv(iv, a)) pts.push(a);
    const list = [], cs = [];
    (function rec(from) {
      const back = cs.length ? cs[cs.length - 1] : s0;
      if (cs.length === k) { if (s1 - back <= GAL.STRAIGHT + EPS) list.push(cs.slice()); return; }
      for (let i = from; i < pts.length; i++) {
        const a = pts[i];
        if (cs.length && a - back < GAL.MINGAP - EPS) continue;
        if (a - back > GAL.STRAIGHT + EPS) break;
        cs.push(a); rec(i + 1); cs.pop();
      }
    })(0);
    return list;
  }
  // the counts per segment (n split over them), each segment's layouts, the best by its tightest column's room
  const splits = segs.length === 1 ? [[n]] : Array.from({ length: n + 1 }, (_, k) => [k, n - k]);
  let count = 0, best = null;
  for (const sp of splits) {
    const per = segs.map((S, i) => inSeg(S, sp[i])); if (per.some((x) => !x.length)) continue;
    const top = per.map((list) => { let b = null; for (const cs of list) { const r = Math.min(...cs.map((_, i) => roomOf(run, iv, cs, i)), Infinity); if (!b || r > b.room + EPS) b = { cols: cs, room: r }; } return b; });
    count += per.reduce((a, x) => a * x.length, 1);
    const room = Math.min(...top.map((t) => t.room)), cols = top.flatMap((t) => t.cols);
    if (!best || room > best.room + EPS) best = { cols, room: +(Number.isFinite(room) ? room : 0).toFixed(3) };
  }
  return { count, best };
}
/** the level's slack: the room of the tightest column in its best layout of n columns (0 when none) */
export const slackOf = (lv, n = LEVELS[lv].n, step = 0.25) => { const r = solve(lv, n, step); return r.best ? r.best.room : 0; };
/** the even spacing of n columns in each segment of a level's run (the first thing a player tries) */
export function evenOf(lv, n = LEVELS[lv].n) {
  const segs = segsOf(LEVELS[lv].run), k = segs.length, per = Math.round(n / k), out = [];
  for (const [s0, s1] of segs) for (let i = 1; i <= per; i++) out.push(+(s0 + ((s1 - s0) * i) / (per + 1)).toFixed(3));
  return out;
}
/** how near the level's spectator-to-torch lines pass the menorah (amot) */
export const menorahGap = (lv) => Math.min(...LEVELS[lv].watch.flatMap((w) => LEVELS[lv].torch.map((t) => segDist(S5.light.menorah, w, t))));

/* ───────── the raising (level 3's peak): build 120's column on the ropes, kept as it is (h120/model.js colStep) ───────── */
// (the level-3 numbers of h120's LV: the crew's lag, the gravity's scale, the brake window, the landing; the pulley's sharp-pull rule)
export const RAISE_LV = Object.freeze({ land: 8, lean: 2, foot: 1, lag: 0.7, arc: 0, colour: 0, wind: 0, pulley: 1, A: 290, brakeTol: 2 });
export const CRADLE = 8, BAL = 78, COL_H = 10, FINGER = 1 / 24;
const DEG = Math.PI / 180;
const K_PULL = 1.15, DAMP = 6, MU = 1, BRAKE = 2.2, CHIP_W = 18, HEAVE = 3.2;
/** the pull rope's share at θ: whole below BAL, going slack over the next 4° */
export const pullShare = (th) => clamp(1 - (th - BAL) / 4, 0, 1);
export function colFresh() { return { th: CRADLE, w: 0, p: 0, pT: 0, lock: null, held: false, phase: 'rise', land: 0, off: [0, 0], sway: 0, sharp: 0, tears: 0, crack: 0, chip: 0, crossed: 0, crossW: 0, t: 0, pHist: [], slack: 0, maxW: 0 }; }
/** one step of the column between the pull rope and the brake rope (h120/model.js colStep, unchanged) → events */
export function colStep(s, inp = {}, dt = 1 / 60, L = RAISE_LV) {
  const ev = [];
  if (s.phase !== 'rise') return ev;
  const A = L.A;
  s.held = !!inp.held;
  s.pT = s.held && inp.pT != null ? clamp(+inp.pT, 0, 1) : 0;
  s.t += dt; s.pHist.push([s.t, s.pT]); while (s.pHist.length && s.t - s.pHist[0][0] > 0.15) s.pHist.shift();
  const pMin = s.pHist.reduce((a, q) => Math.min(a, q[1]), 1), pMax = s.pHist.reduce((a, q) => Math.max(a, q[1]), 0);
  if (pMax - pMin > 0.5 && s.th > 20 && s.th < 70 && !s.jerkT) { s.off[0] = clamp(s.off[0] + 0.25, -4, 4); s.jerkT = 0.3; ev.push('jerk'); }
  if (s.jerkT) s.jerkT = Math.max(0, s.jerkT - dt);
  if (inp.sharp && L.pulley && s.th < BAL) {
    s.sharp++;
    if (s.sharp === 1) ev.push('warn');
    else { const from = s.th; s.tears++; s.sharp = 0; s.th = CRADLE; s.w = 0; s.p = 0; s.pT = 0; if (from > 45) { s.crack = 1; ev.push('crack'); } ev.push('tear'); s.tearFrom = from; return ev; }
  }
  if (inp.press && s.lock == null) { s.lock = s.th; if (s.w > 0.05) ev.push('locked'); }
  if (!inp.press && inp.press !== undefined) s.lock = null;
  if (s.lock != null && inp.pay > 0) s.lock = Math.min(s.lock + inp.pay, Math.max(s.lock, s.th + 0.25));
  const payV = s.lock != null && inp.pay > 0 ? inp.pay / dt : 0;
  if (inp.heave) s.w = Math.max(s.w, 0) + HEAVE;
  const gust = Math.abs(+inp.wind || 0) > 0.3;
  if (!gust) s.guyHold = 0;
  if (inp.haul) { s.sway = Math.sign(s.sway) * Math.max(0, Math.abs(s.sway) - 3); if (gust) s.guyHold = 1; }
  if (inp.wind && !(gust && s.guyHold)) s.sway += inp.wind * dt;
  const n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n, tau = L.lag;
  for (let i = 0; i < n; i++) {
    s.p += (s.pT - s.p) * (1 - Math.exp(-h / tau));
    const sh = pullShare(s.th);
    let a = -A * Math.sin((BAL - s.th) * DEG) + K_PULL * A * s.p * sh;
    if (s.th < BAL) a -= DAMP * s.w; else a -= MU * Math.sign(s.w);
    s.w += a * h;
    if (s.th < BAL && s.w < 0) s.w = 0;
    const th0 = s.th; s.th += s.w * h;
    if (th0 < BAL && s.th >= BAL && !s.crossed) { s.crossed = 1; s.crossW = s.w; ev.push('cross'); }
    if (sh > 0 && pullShare(s.th) === 0 && !s.slack) { s.slack = 1; ev.push('slack'); }
    if (s.lock != null && s.th >= s.lock - 1e-6 && s.w > payV) s.w = Math.max(payV, s.w - BRAKE * A * h);
    if (s.w > s.maxW) s.maxW = s.w;
    if (s.th >= 90) {
      s.th = 90; s.land = s.w;
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
/** the lean a landing leaves (fingers at the top) */
export function leanAfter(s) { return [+(0.5 * s.land).toFixed(2), +(+s.sway || 0).toFixed(2)]; }
const mag = (v) => (v ? Math.hypot(+v[0] || 0, +v[1] || 0) : 0);
/** the raised column's grade: 40 · 20 · 10 (h120's colPts at level 3) */
export function colPts(c, L = RAISE_LV) {
  if (c.broke || c.chip || c.crack) return 10;
  const lean = mag(c.lean), off = mag(c.off), w = c.wedges | 0;
  if (lean <= L.lean + EPS && off <= L.foot + EPS && w === 0) return 40;
  if (lean <= 2 * L.lean + EPS && off <= 2 * L.foot + EPS && w <= 2) return 20;
  return 10;
}
/** a lead wedge driven at a side of the plinth: the top moves one finger away from that side */
export function wedge(c, side) { c.lean = [+(c.lean[0] - side[0]).toFixed(2), +(c.lean[1] - side[1]).toFixed(2)]; c.wedges = (c.wedges | 0) + 1; return c; }

/* ═════════════════ station 2: the wood chamber (brief §2 "Wood") ═════════════════ */
/** the log's numbers: a hole is seen when it faces the viewer within SEE degrees and no bark covers it; a tap within the hollow sounds
 *  hollow (trembles 1), just past its end trembles less over EDGE amot; a peeled strip is PEEL_W long and PEEL_A degrees round; the cut
 *  is right RIGHT[0] … RIGHT[1] past the hollow's end */
export const WOOD = Object.freeze({ SEE: 50, EDGE: 0.3, PEEL_W: 0.6, PEEL_A: 30, RIGHT: Object.freeze([0.3, 1.2]), TURN: 360 });
const lg = (id, L, r, holes = [], bark = [], hollow = null) => Object.freeze({ id, L, r, holes: Object.freeze(holes.map(([ang, s]) => Object.freeze({ ang, s }))), bark: Object.freeze(bark.map(([s0, s1, a0, a1]) => Object.freeze({ s0, s1, a0, a1 }))), hollow: hollow ? Object.freeze({ s0: hollow[0], s1: hollow[1] }) : null });
/** the level tables (fixed): level 1 six logs, the holes seen after rolling; level 2 eight logs, the worm under the bark, only the tap
 *  tells where to peel; level 3 six big logs, some with one bad end (a hollow from that end) */
export const LOGS = Object.freeze({
  1: Object.freeze([
    lg('1a', 4, 0.35), lg('1b', 4, 0.32, [[200, 1.4], [215, 1.6], [190, 2.0]]), lg('1c', 4.2, 0.36),
    lg('1d', 3.8, 0.33, [[40, 2.6], [55, 2.9]]), lg('1e', 4, 0.34), lg('1f', 4.1, 0.35, [[300, 0.9], [310, 1.1], [290, 1.3], [305, 3.2]]),
  ]),
  2: Object.freeze([
    lg('2a', 4, 0.35, [], [[0.5, 1.5, 100, 220]]), lg('2b', 4.2, 0.36, [[150, 2.3], [170, 2.5]], [[1.8, 3.0, 120, 200]], [2.0, 2.8]),
    lg('2c', 3.9, 0.33, [], [[2.2, 3.4, 300, 30]]), lg('2d', 4, 0.34, [[350, 1.0], [10, 1.2]], [[0.6, 1.6, 320, 40]], [0.7, 1.5]),
    lg('2e', 4.1, 0.35, [], [[1.0, 2.0, 60, 140]]), lg('2f', 4, 0.36, [[80, 3.1], [95, 3.3]], [[2.8, 3.8, 60, 120]], [2.9, 3.6]),
    lg('2g', 4.2, 0.34), lg('2h', 3.8, 0.33, [], [[0.3, 1.0, 200, 260]]),
  ]),
  3: Object.freeze([
    lg('3a', 6, 0.5, [[30, 0.5], [45, 0.8]], [], [0, 1.6]), lg('3b', 6.2, 0.52), lg('3c', 6, 0.5, [[210, 5.5], [190, 5.2]], [], [4.3, 6]),
    lg('3d', 5.8, 0.48), lg('3e', 6.1, 0.51, [[120, 0.3]], [], [0, 2.2]), lg('3f', 6, 0.5, [[300, 5.7]], [], [5.0, 6]),
  ]),
});
/** a log in the act's hands: rolled (rot, degrees, and the most it was turned each way), the strips peeled, the taps, the cut */
export function logFresh(lv, i) { const log = LOGS[lv][i]; return { lv, i, log, rot: 0, rotMin: 0, rotMax: 0, peeled: [], taps: [], cut: null, decided: null }; }
/** a log has a worm: holes, or a hollow stretch */
export const wormy = (log) => !!(log.holes.length || log.hollow);
const angIn = (a, a0, a1) => { const n = (x) => ((x % 360) + 360) % 360, A = n(a), s = n(a0), e = n(a1); return s <= e ? A >= s && A <= e : A >= s || A <= e; };
const angDiff = (a, b) => { const d = (((a - b) % 360) + 540) % 360 - 180; return Math.abs(d); };
const barkOver = (S, h) => S.log.bark.some((b) => h.s >= b.s0 && h.s <= b.s1 && angIn(h.ang, b.a0, b.a1)) && !S.peeled.some((p) => h.s >= p.s0 && h.s <= p.s1 && angIn(h.ang, p.a0, p.a1));
/** the holes seen now: facing the viewer (log angle + rot near 0) and not under bark */
export const seenHoles = (S) => S.log.holes.map((h, k) => k).filter((k) => { const h = S.log.holes[k]; return angDiff(h.ang + S.rot, 0) <= WOOD.SEE && !barkOver(S, h); });
/** roll the log by d degrees (a drag along it; either way, a whole turn and more) → { rot, seen } */
export function rollStep(S, d) {
  S.rot += +d || 0; S.rotMin = Math.min(S.rotMin, S.rot); S.rotMax = Math.max(S.rotMax, S.rot);
  return { rot: S.rot, seen: seenHoles(S), turned: S.rotMax - S.rotMin >= WOOD.TURN };
}
/** a tap at s along the log: 'deep' and still, or 'hollow' (the log trembles there, dust falls); just past the hollow's end it
 *  trembles less (the act shows the tremble, so the game is played without sound) → { sound, tremble 0…1, dust } */
export function tapAt(log, s) {
  const H = log.hollow;
  if (H && s >= H.s0 - EPS && s <= H.s1 + EPS) return { sound: 'hollow', tremble: 1, dust: true };
  const d = H ? Math.min(Math.abs(s - H.s0), Math.abs(s - H.s1)) : 99;
  const t = H && d < WOOD.EDGE ? +(0.6 * (1 - d / WOOD.EDGE)).toFixed(3) : 0.05;
  return { sound: t > 0.3 ? 'hollow' : 'deep', tremble: t, dust: t > 0.3 };
}
/** a strip of bark peeled at s, round the angle that faces the viewer (degrees in the log's own frame) → { strip, found: hole indices
 *  under it } */
export function peelAt(S, s, angle) {
  const strip = { s0: s - WOOD.PEEL_W / 2, s1: s + WOOD.PEEL_W / 2, a0: angle - WOOD.PEEL_A, a1: angle + WOOD.PEEL_A };
  S.peeled.push(strip);
  const found = S.log.holes.map((h, k) => k).filter((k) => { const h = S.log.holes[k]; return h.s >= strip.s0 && h.s <= strip.s1 && angIn(h.ang, strip.a0, strip.a1); });
  return { strip, found };
}
/**
 * the decision: the log to the clean pile or out. A wormy log in the clean pile is found when it is split: wood.worm −20, the pile
 * back to be checked; a good log thrown out is missing from the stock (fewer points, no damage). A cut log (level 3) is judged by what
 * is left of it → { ok, flag, waste }
 */
export function decide(log, to, cut = null) {
  const bad = cut ? cut.res === 'near' : wormy(log);
  if (to === 'clean') return bad ? { ok: false, flag: 'wood.worm', waste: 0 } : { ok: true, flag: null, waste: 0 };
  // (build 130 W: a log with one bad end thrown out whole, uncut: no worm in the pile, but the good wood is lost with it)
  if (bad && !cut && endBad(log)) return { ok: true, flag: null, waste: 1 };
  return bad ? { ok: true, flag: null, waste: 0 } : { ok: false, flag: null, waste: 1 };
}
/** a log whose hollow runs from one of its ends (level 3: cut that end off, the rest is saved) */
export const endBad = (log) => !!(log.hollow && (log.hollow.s0 <= EPS || log.hollow.s1 >= log.L - EPS));
/** the cut that saves the most good wood with no worm left: the middle of the right band past the hollow's end (the bot's, the hint's) */
export function bestCut(log) {
  if (!endBad(log)) return null;
  const m = (WOOD.RIGHT[0] + WOOD.RIGHT[1]) / 2;
  return log.hollow.s0 <= EPS ? +(log.hollow.s1 + m).toFixed(3) : +(log.hollow.s0 - m).toFixed(3);
}
/** what a cut leaves: the piece kept [k0, k1] (the good side) and the piece that goes out [o0, o1] (the hollow's side) */
export function piecesOf(log, s) {
  const left = endBad(log) ? log.hollow.s0 <= EPS : s < log.L / 2;
  return left ? { keep: [s, log.L], out: [0, s] } : { keep: [0, s], out: [s, log.L] };
}
/**
 * level 3: a cut at s across a log with one bad end. Right: RIGHT[0] … RIGHT[1] past the hollow's end, toward the good wood. Nearer
 * leaves the worm (wood.worm, −20); farther wastes good wood (fewer points: `lost` amot). A log with no bad end: any cut wastes it.
 * → { res: 'right' | 'near' | 'far' | 'waste', past, lost, flag }
 */
export function cutAt(log, s) {
  const H = log.hollow;
  if (!H || (H.s0 > EPS && H.s1 < log.L - EPS)) return { res: 'waste', past: 0, lost: +Math.min(s, log.L - s).toFixed(3), flag: null };
  const fromA = H.s0 <= EPS, past = fromA ? s - H.s1 : H.s0 - s;
  if (past < WOOD.RIGHT[0] - EPS) return { res: 'near', past: +past.toFixed(3), lost: 0, flag: 'wood.worm' };
  if (past > WOOD.RIGHT[1] + EPS) return { res: 'far', past: +past.toFixed(3), lost: +(past - WOOD.RIGHT[1]).toFixed(3), flag: null };
  return { res: 'right', past: +past.toFixed(3), lost: 0, flag: null };
}
/** a wood work's points: 40 every decision right and no waste; 20 a good log thrown out or a wasteful cut; 10 a worm let into the pile */
export const woodPts = (r) => grade(r.dmg | 0, !(r.wrong | 0) && !(r.waste | 0));

/* ═════════════════ station 3: fifty amot of light (brief §2 "Light") ═════════════════ */
/** the wick: the strip's width is the choice (amot); a pull faster than LIMIT (amot/s) tears it (start a new one, no loss); LEN amot
 *  of unbroken strip make a wick. A thick wick gives strong light and drinks fast; a thin one weak light that lasts */
export const WICK = Object.freeze({ LIMIT: 1.2, LEN: 1.0, MIN: 0.06, MAX: 0.24, MID: 0.14 });
export function wickFresh(width = WICK.MID) { return { w: clamp(+width, WICK.MIN, WICK.MAX), len: 0, tears: 0, done: 0 }; }
/** a pull of d amot at v amot/s → events 'tear' | 'done' */
export function wickStep(S, d, v) {
  if (S.done) return [];
  if (v > WICK.LIMIT + EPS) { S.len = 0; S.tears++; return ['tear']; }
  S.len = Math.min(WICK.LEN, S.len + Math.max(0, +d || 0));
  if (S.len >= WICK.LEN - EPS) { S.done = 1; return ['done']; }
  return [];
}
/** a wick's light: its strength (1 for the middle width) and how fast it drinks (log an hour) */
export const wickOf = (w) => ({ strength: +(w / WICK.MID).toFixed(3), rate: +(2.5 * Math.pow(w / WICK.MID, 1.5)).toFixed(3) });
/** the seven measures of the Temple for liquids (the names as in מנחות ט, ב), in log; a hin is twelve log (מנחות פט ע"א) */
export const MEASURES = Object.freeze([
  Object.freeze({ id: 'hin', name: 'הין', log: 12 }), Object.freeze({ id: 'half', name: 'חצי ההין', log: 6 }),
  Object.freeze({ id: 'third', name: 'שלישית ההין', log: 4 }), Object.freeze({ id: 'quarter', name: 'רביעית ההין', log: 3 }),
  Object.freeze({ id: 'log', name: 'לג', log: 1 }), Object.freeze({ id: 'halflog', name: 'חצי לג', log: 0.5 }),
  Object.freeze({ id: 'qlog', name: 'רביעית לג', log: 0.25 }),
]);
const MEAS = Object.fromEntries(MEASURES.map((m) => [m.id, m]));
/** the least number of pours that make `target` log exactly */
export function minPours(target = 30) {
  const q = Math.round(target * 4), V = MEASURES.map((m) => Math.round(m.log * 4)), best = new Array(q + 1).fill(Infinity); best[0] = 0;
  for (let t = 1; t <= q; t++) for (const v of V) if (v <= t && best[t - v] + 1 < best[t]) best[t] = best[t - v] + 1;
  return best[q];
}
/** the jar filled by a list of pours (measure ids): over thirty runs over on the floor (no loss; pour back and try again) →
 *  { total, n, over, exact, mehudar } (מהודר: thirty in the least number of pours — hin, hin, half a hin) */
export function measure(pours, target = 30) {
  const total = pours.reduce((a, id) => a + (MEAS[id] ? MEAS[id].log : 0), 0), n = pours.length;
  const exact = Math.abs(total - target) < EPS;
  return { total, n, over: total > target + EPS, exact, mehudar: exact && n === minPours(target) };
}
/**
 * the ladder: rungs one amah apart; the jar on the shoulder is a pendulum (period PERIOD) that each hand move pushes, LATE seconds
 * later, toward that hand's side. Lifting a hand while the jar leans to that hand's side spills oil in proportion to the lean (past
 * SPILL); a lean past DROP drops the jar (light.jar). The boy never falls. A hand lifted as the jar passes the middle going away from it
 * is the perfect step. With both hands holding the boy steadies the jar (more damping); quiet: the right hand is free for the camera.
 * (build 130 L1: PUSH 0.55 → 0.22 — at 0.55 one lift a fifth of a second late after the jar passed the middle dropped it: no hand can
 *  play that. At 0.22 a careful player late by half a second never drops it; lifting each hand as the jar swings toward it — feeding
 *  the swing — drops it within a few rungs, and a hurried climb spills a little: test/h130-light.test.mjs)
 * φ > 0 leans to the right hand's side.
 */
export const CLIMB = Object.freeze({ PERIOD: 1.4, LATE: 0.18, PUSH: 0.22, DAMP: 0.25, HOLD_DAMP: 0.9, SPILL: 0.12, SPILL_K: 1.6, DROP: 0.62, MID: 0.08, QUIET: 0.05 });
const W0 = (2 * Math.PI) / CLIMB.PERIOD;
export function climbFresh(top = 12, oil = 30) { return { top, rung: 0, L: 0, R: 0, up: null, phi: 0, w: 0, oil, oil0: oil, spilled: 0, dropped: 0, perfect: 0, steps: 0, push: [], t: 0 }; }
/** the jar quiet and both hands holding: the right hand may lift the camera */
export const climbQuiet = (S) => !S.up && Math.abs(S.phi) < CLIMB.QUIET && Math.abs(S.w) < CLIMB.QUIET * W0;
/**
 * one step. hand: null, or { h: 'L' | 'R', a: 'lift' | 'place' } — lift a holding hand (only while the other holds), place the lifted
 * hand on the next rung → events 'lift', 'perfect', 'spill', 'place', 'rung', 'top', 'drop'
 */
export function climbStep(S, hand, dt) {
  const ev = [];
  if (S.dropped) return ev;
  if (hand && hand.a === 'lift' && !S.up && (hand.h === 'L' || hand.h === 'R')) {
    const sg = hand.h === 'R' ? 1 : -1;
    S.up = hand.h; ev.push('lift');
    if (sg * S.phi > CLIMB.SPILL) { const k = Math.min(S.oil, CLIMB.SPILL_K * (sg * S.phi - CLIMB.SPILL) * S.oil0 / 10); S.oil -= k; S.spilled += k; ev.push('spill'); }
    if (Math.abs(S.phi) < CLIMB.MID && -sg * S.w > 0) { S.perfect++; ev.push('perfect'); }
    S.push.push({ at: S.t + CLIMB.LATE, d: sg * CLIMB.PUSH });
  } else if (hand && hand.a === 'place' && S.up === hand.h) {
    const o = hand.h === 'L' ? 'R' : 'L';
    S[hand.h] = Math.min(S[o] + 1, S.top, S[hand.h] + 1); S.up = null; S.steps++; ev.push('place');
    const r = Math.min(S.L, S.R); if (r > S.rung) { S.rung = r; ev.push('rung'); if (S.rung >= S.top) ev.push('top'); }
  }
  // the pendulum, with the late pushes
  const n = Math.max(1, Math.ceil(dt / (1 / 240))), h = dt / n, c = S.up ? CLIMB.DAMP : CLIMB.HOLD_DAMP;
  for (let i = 0; i < n; i++) {
    S.t += h;
    for (let k = S.push.length - 1; k >= 0; k--) if (S.t >= S.push[k].at) { S.w += S.push[k].d * W0; S.push.splice(k, 1); }
    S.w += (-W0 * W0 * S.phi - c * S.w) * h; S.phi += S.w * h;
    if (Math.abs(S.phi) > CLIMB.DROP) { S.dropped = 1; S.spilled += S.oil; S.oil = 0; ev.push('drop'); break; }
  }
  return ev;
}
/** pouring the jar into the bowl: the tilt (0…1) sets the flow; past OVER the oil runs over the bowl's lip, and a tilt turned faster
 *  than FAST a second throws part of it outside — what goes outside is lost */
export const POUR = Object.freeze({ START: 0.3, RATE: 18, OVER: 0.85, FAST: 1.6 });
export function pourFresh(oil, cap = 30) { return { oil, bowl: 0, cap, out: 0, tilt: 0 }; }
export function pourStep(S, tilt, dt) {
  const t = clamp(+tilt || 0, 0, 1), v = dt > 0 ? Math.abs(t - S.tilt) / dt : 0; S.tilt = t;
  const flow = Math.min(S.oil, Math.max(0, t - POUR.START) * POUR.RATE * dt); if (flow <= 0) return { into: 0, out: 0 };
  const outK = clamp(Math.max((t - POUR.OVER) / (1 - POUR.OVER), (v - POUR.FAST) / POUR.FAST), 0, 1), out = flow * outK;
  let into = flow - out; const room = S.cap - S.bowl; const over = Math.max(0, into - room); into -= over;
  S.oil -= flow; S.bowl += into; S.out += out + over;
  return { into, out: out + over };
}
/**
 * the light: each bowl's oil (log) and its wick's width → each flame's strength and how long it burns (hours), and how far the light
 * reaches in the ending (0…1: the courtyards of Jerusalem lit one by one)
 */
export function lightOf(bowls, wicks) {
  const flames = bowls.map((oil, i) => { const W = wickOf(wicks[i] != null ? wicks[i] : WICK.MID); return { strength: oil > 0 ? W.strength : 0, hours: oil > 0 ? +(oil / W.rate).toFixed(2) : 0 }; });
  const night = 12, reach = flames.reduce((a, f) => a + f.strength * Math.min(1, f.hours / night), 0) / Math.max(1, 4);
  return { flames, reach: +clamp(reach, 0, 1).toFixed(3) };
}
/** a light work's points: 40 no oil lost and no jar broken; 20 oil spilled or a tear; 10 a jar broken */
export const lightPts = (r) => grade(r.dmg | 0, !(r.spilled > 0.01) && !(r.out > 0.01));

/* ═════════════════ the plan and the save ═════════════════ */
const MISSIONS = () => [
  { k: 'gallery', id: 'gal1', lv: 1 }, { k: 'gallery', id: 'gal2', lv: 2 }, { k: 'gallery', id: 'gal3', lv: 3 },
  { k: 'wood', id: 'wood1', lv: 1 }, { k: 'wood', id: 'wood2', lv: 2 }, { k: 'wood', id: 'wood3', lv: 3 },
  { k: 'light', id: 'light1', lv: 1 }, { k: 'light', id: 'light2', lv: 2 }, { k: 'light', id: 'light3', lv: 3 },
  { k: 'eve', id: 'eve', lv: 1 },
];
export const PLAN = Object.freeze(MISSIONS().map((m, i) => Object.freeze({ ...m, n: i })));
export const KINDS = Object.freeze(['gallery', 'wood', 'light', 'eve']);
const PREV = { gal2: 'gal1', gal3: 'gal2', wood2: 'wood1', wood3: 'wood2', light1: 'gal3', light2: 'light1', light3: 'light2', eve: 'light3' };
/** the default gallery the crews built (an old save whose stage 05 was finished): columns 57, 68, 79, 90 north and south, the east's two */
export const CREW_COLS = GB.crewCols;
export function freshH130() {
  return { v: 1, cur: null, done: [], res: {}, plays: {}, best: 0, i: 0, intro: 0,
    // the damages kept to the eye (rule 55): { f, work, at, n }; the gallery as he built it per side: { cols [along], props [along of a
    // cracked beam's middle], broke (the raised column fell: its halves at brokeAt), raised { off, lean, wedges, chip, crack } }
    marks: [], gal: {}, wood: {}, light: {}, crews: 0, open1: 0 };
}
export function createH130(save) {
  const st = save && save.v === 1 ? save : freshH130();
  for (const [k, v] of Object.entries(freshH130())) if (st[k] === undefined) st[k] = v;
  if (st.cur && !PLAN.some((m) => m.id === st.cur)) st.cur = null;
  const d = (id) => st.done.includes(id);
  const M = {
    st,
    get plan() { return PLAN; },
    isDone: d,
    mission() { return st.cur ? PLAN.find((m) => m.id === st.cur) || null : null; },
    /** the gallery in order; the wood free at any time; the light when gal3 is done (its level 1 uses the gallery's ladder); the evening
     *  right after light3. A save the crews built (st.crews) opens the light without waiting for the gallery */
    canDo(m) {
      if (!m || d(m.id)) return false;
      if (m.id === 'light1' && st.crews) return true;
      return !PREV[m.id] || d(PREV[m.id]);
    },
    open() { return PLAN.filter((m) => M.canDo(m)); },
    pick(id) { const m = id ? PLAN.find((x) => x.id === id) : null; st.cur = m && M.canDo(m) ? m.id : null; return M.mission(); },
    nDone() { return PLAN.filter((m) => d(m.id)).length; },
    count() { return [M.nDone(), PLAN.length]; },
    finished() { return PLAN.every((m) => d(m.id)); },
    levelOf(m) { return m.lv | 0 || 1; },
    /** a damage, kept in the save where it happened; returns its points (the director's X.loss takes them) */
    mark(f, work, at, n = 0) { const p = lossPts(f); if (!p) return 0; st.marks.push({ f, work, at: at == null ? null : at, n }); return p; },
    marksOf(f) { return st.marks.filter((x) => !f || x.f === f); },
    /** the gallery of a side as he built it (or the crews: CREW_COLS), or null */
    galOf(side) { return st.gal[side] || (st.crews ? { cols: CREW_COLS[side].slice(), props: [], crew: 1 } : null); },
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      st.res[m.id] = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), pts: res.pts | 0, flags: res.flags || {} };
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      if (!d(m.id)) st.done.push(m.id);
      st.cur = null; st.i = st.done.length;
      return null;
    },
    autoTo(want) {
      for (let g = 0; g < PLAN.length + 2; g++) {
        const O = M.open(), hit = O.find(want); if (hit) return M.pick(hit.id);
        const m = O[0]; if (!m) return null;
        st.cur = m.id; M.done({ stars: 2 });
      }
      return null;
    },
    progress() { return Math.min(1, M.nDone() / PLAN.length); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
  };
  return M;
}
/**
 * an old save of build 120's stage 05 (G.h120) → the new stage's save. A finished old stage: the new stage "built by the crews" (the
 * default columns, no points, every station open to play: st.crews); one in the middle: the new stage from its beginning. Later stages'
 * progress lives elsewhere in the game's save and is never touched here.
 */
export function fromOld(old, oldDone) {
  const st = freshH130();
  if (old && oldDone) st.crews = 1;
  return st;
}
