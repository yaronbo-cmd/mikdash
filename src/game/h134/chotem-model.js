/* ── build 134 ── h134/chotem-model.js — work 3 "שני החוטמים" (spec docs/specs/shlav-11-he.md, עבודה 3). Pure: no three.js, no DOM.
 * Mishnah Sukkah 4:9: "שני ספלים של כסף היו שם... ומנקבין כמין שני חטמין דקין, אחד מעבה ואחד דק, כדי שיהו שניהם כלין בבת אחת. מערבי
 * של מים, מזרחי של יין"; Sukkah 48b: "חמרא סמיך, מיא קליש". Silver: the Sages' (the owner's pick). The bench, the drill, the test, the
 * diameters and the times: המחשה.
 * Two cups, each with a sealed spout. One thumb pushes the drill's head down along its axis (the push's depth is the pressure: under 3 %
 * of the screen's height none, 3 … 8 % 1, 8 … 16 % 2, over 16 % 3); the other drags the bow's string to and fro (a stroke: 15 % of the
 * screen's width one way). Sealed: a stroke at pressure 1 goes a third of a step, 2 a step, 3 two steps; 6 steps break through, the hole
 * then half of D. Through: a stroke at 1 or 2 widens it by D/20, at 3 by D/10. Tearing comes first: levels 2–3 pressure 3 always tears
 * (the cup is out, no widening); level 1 only while breaking through; level 3 also pressure 2 while breaking through. No pressure: the bit
 * skids on the silver (a scratch, for looks, 0 points, no cost). D is the water's right bore; the wine's: 1.4 D (level 1), 1.25 D (2),
 * 1.15 D (3). A bore over 1.25 times its right one is no "thin spout": it sprays in the test and the cup is out. A hole cannot be made
 * narrower: a new cup for that side, from the breaking through; the other stays.
 * The test (a pull down on the wooden handle): both cups filled level; each empties in 6 s × (right / drilled)²; the target 6 s each.
 * Done when each is within the level's tolerance of 6 s (1 / 0.75 / 0.5 s) AND they differ by half a second at most.
 * Steps: a test after a change (a test with no bore changed since the last is not counted; each pair of bores once): 40 passes; 20 the
 * gap within 1.5 s and each within twice the tolerance; else 10. A first test that passes: +40.
 *   DK · WINE · TOL · fresh(lv) · press(px, h) · stroke(S, side, pr) · test(S) · result · save · load
 */
export const DK = Object.freeze({ P1: 0.03, P2: 0.08, P3: 0.16, STROKE: 0.15, SEAL: 6, STEP: [0, 1 / 3, 1, 2], OPEN: 0.5, WIDE: 1 / 20, WIDE3: 1 / 10,
  T0: 6, GAP: 0.5, TOO_WIDE: 1.25 });
export const WINE = Object.freeze({ 1: 1.4, 2: 1.25, 3: 1.15 });
export const TOL = Object.freeze({ 1: 1, 2: 0.75, 3: 0.5 });
export const SIDES = Object.freeze(['water', 'wine']);
/** the pressure from the push's depth, as a share of the screen's height */
export const press = (k) => (k > DK.P3 ? 3 : k > DK.P2 ? 2 : k > DK.P1 ? 1 : 0);
const cup = () => ({ seal: 0, d: 0, open: false, torn: false, wide: false, scratch: 0, strokes: 0 });
export function fresh(lv) {
  const L = Math.max(1, Math.min(3, lv | 0 || 1));
  return { lv: L, c: { water: cup(), wine: cup() }, sel: 'water', tests: [], lastKey: null, first: true, rejects: [], spares: 0, done: false, free: true };
}
export const right = (S, side) => (side === 'wine' ? WINE[S.lv] : 1);
const tears = (S, C, pr) => (pr === 3 && (S.lv >= 2 || !C.open)) || (S.lv >= 3 && pr === 2 && !C.open);
/** would a stroke at pressure pr tear the cup on that side now (build 134, the review: the pressure gauge's red bead) */
export const wouldTear = (S, side, pr) => !!S.c[side] && tears(S, S.c[side], pr);
/** one stroke of the bow on the selected cup at pressure pr → { k: 'skid' | 'cut' | 'through' | 'wider' | 'tear' } */
export function stroke(S, side, pr) {
  const C = S.c[side]; if (!C || C.torn || C.wide || S.done) return null;
  C.strokes++;
  if (!pr) { C.scratch++; return { k: 'skid' }; }
  if (tears(S, C, pr)) { C.torn = true; return { k: 'tear' }; }
  if (!C.open) { C.seal += DK.STEP[pr]; if (C.seal >= DK.SEAL - 1e-9) { C.open = true; C.d = DK.OPEN; return { k: 'through' }; } return { k: 'cut', seal: C.seal / DK.SEAL }; }
  C.d = Math.round((C.d + (pr === 3 ? DK.WIDE3 : DK.WIDE)) * 1e6) / 1e6; return { k: 'wider', d: C.d };
}
/** a torn or too-wide cup to the shelf; a new one for its side, from the start */
export function replace(S, side) { const C = S.c[side]; if (!C || !(C.torn || C.wide)) return false; S.rejects.push({ side, why: C.torn ? 'tear' : 'wide', d: C.d }); S.c[side] = cup(); S.spares++; return true; }
/** a cup's emptying time (s); a sealed one never empties */
export function empty(S, side) { const C = S.c[side]; if (!C.open || !(C.d > 0)) return Infinity; return DK.T0 * Math.pow(right(S, side) / C.d, 2); }
/** the test → { tw, tv, gap, pass, grade, counted, wide: [sides that sprayed] } */
export function test(S) {
  if (S.done) return null;
  const k = `${S.c.water.open ? S.c.water.d : 's'}|${S.c.wine.open ? S.c.wine.d : 's'}|${S.rejects.length}`;
  const counted = k !== S.lastKey && !S.tests.some((t) => t.key === k); S.lastKey = k;
  const wide = SIDES.filter((s) => S.c[s].open && S.c[s].d > right(S, s) * DK.TOO_WIDE + 1e-9);
  for (const s of wide) S.c[s].wide = true;
  const tw = empty(S, 'water'), tv = empty(S, 'wine'), tol = TOL[S.lv], gap = Math.abs(tw - tv);
  const okW = Math.abs(tw - DK.T0) <= tol + 1e-9, okV = Math.abs(tv - DK.T0) <= tol + 1e-9;
  const pass = !wide.length && okW && okV && gap <= DK.GAP + 1e-9;
  const near = !wide.length && gap <= 1.5 + 1e-9 && Math.abs(tw - DK.T0) <= 2 * tol + 1e-9 && Math.abs(tv - DK.T0) <= 2 * tol + 1e-9;
  const grade = pass ? 'gold' : near ? 'good' : 'ok';
  const T = { key: k, tw, tv, gap, pass, grade, counted, wide, first: S.first && pass };
  if (counted) { S.tests.push(T); S.first = false; }
  if (pass) S.done = true;
  return T;
}
/** the strokes from the breaking through to each right bore (the spec's arithmetic: water 10, wine 18 / 15 / 13) */
export const strokesTo = (S, side) => Math.round((right(S, side) - DK.OPEN) / DK.WIDE);
export function result(S, o = {}) {
  const T = S.tests; if (!T.length) return { stars: 1, q: 0, pts: 0, perfect: false };
  const pts = T.reduce((a, t) => a + (t.grade === 'gold' ? 40 : t.grade === 'good' ? 20 : 10), 0), max = T.length * 40, gold = T.filter((t) => t.grade === 'gold').length;
  const flaws = S.rejects.length + (o.flaws | 0), looks = S.c.water.scratch + S.c.wine.scratch + (o.looks | 0);
  const stars = gold === T.length && !flaws && !looks ? 3 : !flaws && gold / T.length >= 0.7 ? 2 : 1;
  const last = T[T.length - 1];
  return { stars, q: pts / max, pts, perfect: stars === 3, flags: { tests: T.length, rejects: S.rejects.length, tw: last.tw, tv: last.tv, gap: last.gap } };
}
/** a pair is better (spec "ביצוע חוזר", work 3): the smaller gap first, then the smaller sum of distances from the target */
export const pairScore = (t) => (t ? [t.gap, Math.abs(t.tw - DK.T0) + Math.abs(t.tv - DK.T0)] : [Infinity, Infinity]);
export const betterPair = (a, b) => { const A = pairScore(a), B = pairScore(b); return A[0] < B[0] - 1e-9 || (Math.abs(A[0] - B[0]) <= 1e-9 && A[1] < B[1] - 1e-9); };
export function save(S, id) { return { id, v: 1, lv: S.lv, c: JSON.parse(JSON.stringify(S.c)), sel: S.sel, tests: S.tests, lastKey: S.lastKey, first: S.first, rejects: S.rejects, spares: S.spares }; }
export function load(b) { if (!b || b.v !== 1) return null; const S = fresh(b.lv); Object.assign(S, { c: b.c, sel: b.sel || 'water', tests: b.tests || [], lastKey: b.lastKey, first: b.first !== false, rejects: b.rejects || [], spares: b.spares | 0 }); return S; }
