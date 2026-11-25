/* ── build 134 ── h134/orez-model.js — work 1 "אריזת הקרנות", one station (spec docs/specs/shlav-11-he.md, עבודה 1). Pure: no three.js,
 * no DOM. Zevachim 54a: "מביא מלבן שהוא אמה על אמה, ומביא חלוקי אבנים... ומביא זפת וקוניא, וממחה ושופך. וזהו קרן".
 * A flat puzzle of constant thickness: the pebbles of the station's fixed set (sets.js) go on the ring between the frame and the core,
 * two layers. A pebble is lifted from the basket, dragged, turned (quarter turns) and flipped (its mirror) by the helping hand, let go:
 *   · its whole footprint on free ring cells → it seats (0.3 s);
 *   · over the frame, the core or another pebble → it lands crooked and stays LOOSE: not counted, the layer cannot close with one;
 *     no rolling into a gap by itself — he lifts it and puts it right;
 *   · its middle over the priests' walk (inward) → back to the basket, no cost; past the outer edge → it falls to the sovev's step:
 *     a FLAW (a crack in the horn's lip, −20), broken there; levels 1–2 it is back in the basket after a second, level 3 a worker
 *     brings one of the same shape after 3 s (no lock: the layer can always be finished). The work's first act is a free try.
 *   · a seated pebble may be lifted again while its layer is open.
 * The layer closes (a tap on the pot) once 92 cells (85 %) are covered and no pebble is loose; a full ring closes by itself. The crews
 * pour pitch and qunya: every hole fills to the layer's top. Scoring only then, every pebble once, by its last place ("אזור ריק" = free
 * cells touching by edges): 40 no free cell touches it; 20 only lone free cells; 10 a hole of two or more. A pebble left in the basket:
 * a step of 0 (it breaks the run). A clean layer (no hole of two or more): +40. A bonded second layer (every pebble he laid there sits on
 * two of HIS first-layer pebbles at least; pitch is no support): +40 once. A pitch stain (−20, for looks) for every hole of 3 or more
 * touching the frame. Level 3, the pitch window: 60 s after the first layer closes the pitch has gone thick — the second layer closed
 * after it leaves a ridge (−20, for looks) and no clean bonus.
 *   OK · fresh(corner, lv, o) · lift · place · drop · canClose · close · result · save · load · ghost
 */
import { setOf, orient, onRing, key, RINGSET, edgeOfFrame, solutionPose, N, RING_N } from './sets.js';

export const OK = Object.freeze({ CLOSE: 92, LIFT_LAG: 0.15, SEAT: 0.3, BACK: 1, SPARE: 3, WINDOW: 60, STAIN: 3, LIP: 2 });
export const GRADE = (g) => (g === 'gold' ? 40 : g === 'good' ? 20 : g === 'ok' ? 10 : 0);

/** a station's work (o.free: the stage's first act is a free try) */
export function fresh(corner, lv, o = {}) {
  const L = Math.max(1, Math.min(3, lv | 0 || 1));
  const S = { corner, lv: L, layer: 1, P: [], held: -1, free: o.free !== false, tries: 0, closed: [], tarT: null, ridge: false, below: null, pitchBelow: [], fell: 0, t: 0, n: 0 };
  deal(S, 1, o.skip1 || null);
  return S;
}
function deal(S, layer, keepOwn) {
  S.layer = layer; S.held = -1;
  S.P = setOf(S.corner, S.lv, layer).map((p, i) => ({ i, id: p.id, shape: p.shape, cells: p.cells, sol: solutionPose(p), at: null, loose: false, back: 0, spare: 0 }));
  if (keepOwn) S.below = keepOwn;
}
/** the cells a pose covers: orientation o, anchor x, z */
export const cellsOf = (p, o, x, z) => orient(p.shape, o).map(([a, b]) => [a + x, b + z]);
/** cells taken by the seated pebbles (but `skip`) */
export function taken(S, skip = -1) { const T = new Map(); S.P.forEach((p, i) => { if (i !== skip && p.at && !p.loose) for (const [x, z] of cellsOf(p, p.at.o, p.at.x, p.at.z)) T.set(key(x, z), i); }); return T; }
export const covered = (S) => taken(S).size;
/** may a pose seat: every cell on a free ring cell */
export function fits(S, i, o, x, z) { const T = taken(S, i); return cellsOf(S.P[i], o, x, z).every(([a, b]) => onRing(a, b) && !T.has(key(a, b))); }
/** where a let-go lands, from the pebble's middle (cells, may be fractional) relative to the frame: 'in' | 'walk' (inward) | 'fall' (outward) */
export function sideOf(S, mx, mz, inward) {
  if (mx >= -0.5 && mx <= N + 0.5 && mz >= -0.5 && mz <= N + 0.5) return 'in';
  // (inward: the two sides toward the altar's middle; inward = [sx, sz], −1 west/north … +1 east/south of the horn's middle)
  const ox = mx < -0.5 ? -1 : mx > N + 0.5 ? 1 : 0, oz = mz < -0.5 ? -1 : mz > N + 0.5 ? 1 : 0;
  const outX = ox !== 0 && ox !== inward[0], outZ = oz !== 0 && oz !== inward[1];
  if (!(outX || outZ)) return 'walk';
  // (build 134, the rule-67 review: a finger that slid just over the outer lip is not a throw — up to LIP cells past the edge the pebble
  // goes back to the basket with a warning; only a pebble let go farther out falls)
  const past = Math.max(outX ? (ox > 0 ? mx - (N - 0.5) : -0.5 - mx) : 0, outZ ? (oz > 0 ? mz - (N - 0.5) : -0.5 - mz) : 0);
  return past <= OK.LIP ? 'lip' : 'fall';
}
export function lift(S, i) { const p = S.P[i]; if (!p || p.back > 0 || p.spare > 0 || S.held >= 0) return false; S.held = i; return true; }
/** let go of the held pebble at pose (o, x, z) with its middle at (mx, mz) in cells → { k: 'seat' | 'loose' | 'walk' | 'fall', free } */
export function drop(S, o, x, z, mx, mz, inward) {
  const i = S.held; if (i < 0) return null; S.held = -1; const p = S.P[i]; S.tries++; S.n++;
  const side = sideOf(S, mx, mz, inward);
  if (side === 'walk') { p.at = null; p.loose = false; return { k: 'walk', i }; }
  if (side === 'lip') { p.at = null; p.loose = false; return { k: 'lip', i }; }
  if (side === 'fall') {
    const free = S.free; S.free = false; p.at = null; p.loose = false;
    if (!free) { S.fell++; if (S.lv >= 3) p.spare = OK.SPARE; else p.back = OK.BACK; } else p.back = OK.BACK;
    return { k: 'fall', i, free };
  }
  S.free = false;
  if (fits(S, i, o, x, z)) { p.at = { o, x, z }; p.loose = false; if (S.tarArm && S.layer === 2 && S.tarT == null) { S.tarT = 0; S.tarArm = false; } return { k: 'seat', i }; }
  p.at = { o, x, z }; p.loose = true; return { k: 'loose', i };
}
/** the clock: a fallen pebble back in the basket, a spare brought; the level-3 pitch window */
export function step(S, dt) {
  const ev = []; S.t += dt;
  for (const p of S.P) { if (p.back > 0) { p.back -= dt; if (p.back <= 0) { p.back = 0; ev.push({ k: 'back', i: p.i }); } } if (p.spare > 0) { p.spare -= dt; if (p.spare <= 0) { p.spare = 0; ev.push({ k: 'spare', i: p.i }); } } }
  if (S.tarT != null && S.layer === 2) { S.tarT += dt; if (S.tarT >= OK.WINDOW && !S.thick) { S.thick = true; ev.push({ k: 'thick' }); } }
  return ev;
}
/** the pitch's look in the level-3 window: 1 fresh … 0 thick */
export const tarShine = (S) => (S.tarT == null || S.layer !== 2 ? 1 : Math.max(0, 1 - S.tarT / OK.WINDOW));
export const anyLoose = (S) => S.P.some((p) => p.loose);
export const canClose = (S) => !anyLoose(S) && covered(S) >= OK.CLOSE;
export const full = (S) => !anyLoose(S) && covered(S) >= RING_N;
/** the free regions (edges only) of the ring now → [{ cells: [[x, z]…], n, frame }] */
export function holes(S) {
  const T = taken(S), seen = new Set(), out = [];
  for (const k of RINGSET) {
    if (T.has(k) || seen.has(k)) continue;
    const x0 = Math.floor(k / 16), z0 = k % 16, st = [[x0, z0]], cells = []; seen.add(k);
    while (st.length) { const [x, z] = st.pop(); cells.push([x, z]); for (const [a, b] of [[x + 1, z], [x - 1, z], [x, z + 1], [x, z - 1]]) { const q = key(a, b); if (RINGSET.has(q) && !T.has(q) && !seen.has(q)) { seen.add(q); st.push([a, b]); } } }
    out.push({ cells, n: cells.length, frame: cells.some(([x, z]) => edgeOfFrame(x, z)) });
  }
  return out;
}
/** a seated pebble's grade at the close: 'gold' (no free cell touches it), 'good' (only lone free cells), 'ok' (a hole of 2 or more) */
export function gradeOf(S, i, H) {
  const p = S.P[i], hs = H || holes(S), at = new Map(); hs.forEach((h, j) => { for (const [x, z] of h.cells) at.set(key(x, z), j); });
  let worst = 0;
  for (const [x, z] of cellsOf(p, p.at.o, p.at.x, p.at.z)) for (const [a, b] of [[x + 1, z], [x - 1, z], [x, z + 1], [x, z - 1]]) { const j = at.get(key(a, b)); if (j != null) worst = Math.max(worst, hs[j].n >= 2 ? 2 : 1); }
  return worst === 0 ? 'gold' : worst === 1 ? 'good' : 'ok';
}
/** close the open layer → { layer, steps: [{ i, id, grade }…], left: [i…] (a step of 0 each), clean, bonded, stains: [cells…], ridge,
 *  pitch: [[x, z]…] (the holes the pitch filled) } — the layer's account; then the next layer is dealt (or the work is packed) */
export function close(S) {
  if (!canClose(S)) return null;
  const H = holes(S), steps = [], left = [];
  S.P.forEach((p, i) => { if (p.at && !p.loose) steps.push({ i, id: p.id, grade: gradeOf(S, i, H) }); else left.push(i); });
  const clean0 = !H.some((h) => h.n >= 2);
  const stains = H.filter((h) => h.n >= OK.STAIN && h.frame).map((h) => h.cells);
  const pitch = H.flatMap((h) => h.cells);
  const R = { layer: S.layer, steps, left, clean: clean0, bonded: false, stains, ridge: false, pitch };
  if (S.layer === 1) {
    const own = new Map(); S.P.forEach((p, i) => { if (p.at && !p.loose) for (const [x, z] of cellsOf(p, p.at.o, p.at.x, p.at.z)) own.set(key(x, z), i); });
    S.below = [...own.entries()]; S.pitchBelow = pitch.map(([x, z]) => key(x, z));
    S.closed.push(R); S.seats1 = S.P.filter((p) => p.at && !p.loose).map((p) => ({ i: p.i, at: { ...p.at } }));
    if (S.lv >= 3) S.tarArm = true;   // (build 134, the review: the window opens at the first pebble seated in layer 2, not while he looks)
    deal(S, 2);
  } else {
    const own = new Map(S.below || []);
    const mine = S.P.filter((p) => p.at && !p.loose);
    R.bonded = mine.length > 0 && left.length === 0 && mine.every((p) => new Set(cellsOf(p, p.at.o, p.at.x, p.at.z).map(([x, z]) => own.get(key(x, z))).filter((v) => v != null)).size >= 2);
    if (S.lv >= 3 && S.tarT != null && S.tarT >= OK.WINDOW) { R.ridge = true; R.clean = false; }
    S.closed.push(R); S.seats2 = mine.map((p) => ({ i: p.i, at: { ...p.at } })); S.layer = 3; S.done = true;
  }
  return R;
}
/** the work's account: every step, its share of the most, the stars (spec "סוף עבודה לפי כוכבים"); flaws as counted by the act */
export function result(S, o = {}) {
  let pts = 0, max = 0, gold = 0, n = 0;
  for (const R of S.closed) { for (const s of R.steps) { pts += GRADE(s.grade); max += 40; n++; if (s.grade === 'gold') gold++; } for (const _ of R.left) { max += 40; n++; } }
  const flaws = o.flaws | 0, looks = o.looks | 0;
  const stars = n && gold === n && !flaws && !looks ? 3 : !flaws && n && gold / n >= 0.7 ? 2 : 1;
  return { stars, q: max ? pts / max : 0, pts, perfect: stars === 3, flags: { gold, n, fell: S.fell } };
}
/** level 1's shadow: where the held pebble belongs (its solution's cells) */
export function ghost(S, i) { const p = S.P[i]; if (!p || !p.sol) return null; return cellsOf(p, p.sol.o, p.sol.x, p.sol.z); }
export function save(S, id) { return { id, v: 1, corner: S.corner, lv: S.lv, layer: S.layer, free: S.free, fell: S.fell, closed: S.closed, below: S.below, pitchBelow: S.pitchBelow, tarT: S.tarT, tarArm: !!S.tarArm, seats1: S.seats1 || null, at: S.P.map((p) => (p.at && !p.loose ? { ...p.at } : null)) }; }
export function load(b) {
  if (!b || b.v !== 1 || !b.corner) return null;
  const S = fresh(b.corner, b.lv, { free: b.free });
  if (b.layer >= 2) { S.closed = b.closed || []; S.below = b.below || null; S.pitchBelow = b.pitchBelow || []; S.seats1 = b.seats1 || null; S.tarT = b.tarT; S.tarArm = !!b.tarArm; deal(S, 2); }
  S.fell = b.fell | 0;
  (b.at || []).forEach((a, i) => { const p = S.P[i]; if (p && a && fits(S, i, a.o, a.x, a.z)) p.at = { o: a.o, x: a.x, z: a.z }; });
  return S;
}
/** a packing played again (spec "ביצוע חוזר", work 1): the crews lift the second layer; the first stands as he built it (its cells and
 *  pitch from the horn's save) — only the second is packed, with the new level's set */
export function secondOnly(S, l1, p1) {
  const own = new Map(); (l1 || []).forEach((p, i) => { for (const [x, z] of p.c || []) own.set(key(x, z), i); });
  S.below = [...own.entries()]; S.pitchBelow = (p1 || []).map(([x, z]) => key(x, z)); S.replay = true;
  deal(S, 2); S.tarT = null; return S;
}
