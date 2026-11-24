/* ── build 133 ── h133/nail-model.js — work 1 "הציפורן" (spec docs/specs/shlav-10-he.md, עבודה 1). Pure: no three.js, no DOM.
 * The stones the crew raised whole from the pit wait in a row by the cradle. Each stone's edge is checked with the thumb as with a
 * fingernail (Rambam, Beit HaBechira 1:14: "כל אבן שנפגמה כדי שתחגור בה הציפורן ... פסולה"): a drag along the edge at the right speed
 * makes a thin glint run on it; at a flaw the glint breaks for a moment; a stop there marks it. An edge with no flaw lights whole once
 * the thumb has run all of it. Mud looks like a flaw but the glint runs over it smooth; moss (level 2 on) has no glint at all and is
 * wiped first with a linen cloth (three strokes back and forth). Once every edge of the stone is checked: up to the basket (fit, for the
 * kevesh), down to the heap (flawed). The flaws' places are fixed (rule 56: no draw).
 *
 *   NK · STONES · fresh(lv) · cur(S) · edgeOf(S) · glide(S, u0, u1, v, dt) · stop(S, u) · rotate(S) · canSort(S) · sort(S, to) · done(S)
 *   result(S) · save(S, id) · load(blob)
 * Every call returns its events ([{ k, … }]) for the act to answer with light, sound and points; the points are level 1's (the act
 * multiplies by the level, model.js MUL).
 */
export const NK = Object.freeze({
  REF_H: 420,                       // (the speeds are px/s on a screen 420 px high, the phone's landscape height; scaled by the act)
  SPEED: Object.freeze({ lo: 150, hi: 450, smear: 600 }),
  MARK: Object.freeze({ exact: 0.04, near: 0.10, late: 0.6 }),
  BINS: 40, COVER: 0.97, WIPES: 3,
  PTS: Object.freeze({ exact: 40, near: 20, sort: 10, bad: 20 }),
});
const MOSS_W = 0.22;
/** the stones of each level (spec's table, 1-based stones): bad [edge, at], mud [[edge, at]…], moss [[edge, from, to]…] */
const T = (n, edges, bad, mud, moss) => ({ n, edges, bad, mud, moss });
export const STONES = Object.freeze({
  1: T(6, 1, { 2: [0, 0.35], 5: [0, 0.70] }, { 3: [[0, 0.5]] }, {}),
  2: T(8, 2, { 2: [1, 0.20], 4: [0, 0.60], 7: [1, 0.85] }, { 1: [[0, 0.5]], 6: [[0, 0.42]] }, { 4: [[0, 0.60 - MOSS_W / 2, 0.60 + MOSS_W / 2]], 8: [[1, 0.30, 0.52]] }),
  3: T(10, 2, { 1: [0, 0.08], 4: [1, 0.50], 6: [0, 0.92], 9: [1, 0.30] }, { 2: [[0, 0.5]], 5: [[1, 0.55]], 9: [[1, 0.62]] }, { 3: [[0, 0.35, 0.57]], 6: [[0, 0.92 - MOSS_W, 0.985]], 10: [[1, 0.2, 0.42]] }),
});

function mkStone(L, j) {
  const k = j + 1, bad = L.bad[k] ? { e: L.bad[k][0], at: L.bad[k][1] } : null;
  return {
    k, bad, edges: L.edges, e: 0,
    mud: (L.mud[k] || []).map(([e, at]) => ({ e, at })),
    moss: (L.moss[k] || []).map(([e, a, b]) => ({ e, a, b, wipes: 0, dir: 0, last: null })),
    ck: Array(L.edges).fill(false), marked: Array(L.edges).fill(null), cov: Array.from({ length: L.edges }, () => Array(NK.BINS).fill(0)),
    sorted: null,
  };
}
export function fresh(lv) {
  const L = STONES[Math.max(1, Math.min(3, lv | 0 || 1))];
  return { lv: Math.max(1, Math.min(3, lv | 0 || 1)), i: 0, stones: Array.from({ length: L.n }, (_, j) => mkStone(L, j)), t: 0, arr: null, arrE: -1, pts: 0, max: maxOf(L), dmg: 0, wrong: 0, missed: 0, exact: 0, n: 0, free: true, heap: 0, basket: 0 };
}
function maxOf(L) { let m = 0; for (let k = 1; k <= L.n; k++) m += L.bad[k] ? NK.PTS.exact + NK.PTS.sort : NK.PTS.sort; return m; }
export const cur = (S) => S.stones[S.i] || null;
/** the edge in hand: its flaw (if on it), mud, moss */
export function edgeOf(S) {
  const s = cur(S); if (!s) return null;
  return { e: s.e, bad: s.bad && s.bad.e === s.e ? s.bad.at : null, mud: s.mud.filter((m) => m.e === s.e).map((m) => m.at), moss: s.moss.filter((m) => m.e === s.e), ck: s.ck[s.e], marked: s.marked[s.e] };
}
const inMoss = (s, e, u) => s.moss.some((m) => m.e === e && m.wipes < NK.WIPES && u >= m.a && u <= m.b);
/** the thumb went along the edge from u0 to u1 (0 … 1) at v px/s (on the 420-px screen): the glint, the coverage, the arrival at a
 *  flaw, the wipes on a moss patch. → { glint: 'on' | 'smear' | 'off', events } */
export function glide(S, u0, u1, v, dt = 0) {
  const s = cur(S), ev = []; S.t += Math.max(0, dt);
  if (!s || s.sorted) return { glint: 'off', events: ev };
  const e = s.e, a = Math.max(0, Math.min(1, Math.min(u0, u1))), b = Math.max(0, Math.min(1, Math.max(u0, u1)));
  const good = v >= NK.SPEED.lo && v <= NK.SPEED.hi, smear = v > NK.SPEED.smear;
  // the moss: a stroke back over a patch (the direction turned on it) is a wipe
  const dir = Math.sign(u1 - u0);
  for (const m of s.moss) {
    if (m.e !== e || m.wipes >= NK.WIPES || dir === 0) continue;
    const on = u1 >= m.a - 0.02 && u1 <= m.b + 0.02;
    if (on && m.dir && dir !== m.dir && v > 40) { m.wipes++; ev.push({ k: 'wipe', n: m.wipes, of: NK.WIPES }); if (m.wipes >= NK.WIPES) ev.push({ k: 'wiped' }); }
    if (on) m.dir = dir;
  }
  if (s.ck[e]) return { glint: good ? 'on' : smear ? 'smear' : 'off', events: ev };
  if (good) {
    const B = NK.BINS;
    for (let i = Math.floor(a * B); i <= Math.min(B - 1, Math.floor(b * B)); i++) { const u = (i + 0.5) / B; if (!inMoss(s, e, u)) s.cov[e][i] = 1; }
    if (s.bad && s.bad.e === e && !inMoss(s, e, s.bad.at) && s.bad.at >= a - 0.005 && s.bad.at <= b + 0.005) { S.arr = S.t; S.arrE = e; ev.push({ k: 'break', at: s.bad.at }); }
    for (const at of s.mud.filter((m) => m.e === e).map((m) => m.at)) if (at >= a && at <= b) ev.push({ k: 'mudpass', at });
    const cov = s.cov[e].reduce((x, y) => x + y, 0) / B;
    // (a patch of moss not wiped holds the edge back: under it nothing is checked)
    const mossLeft = s.moss.some((m) => m.e === e && m.wipes < NK.WIPES);
    if (cov >= NK.COVER && !mossLeft) {
      s.ck[e] = true; ev.push({ k: 'lit', e });
      if (s.bad && s.bad.e === e && s.marked[e] == null) S.missed++;
    }
  }
  return { glint: good ? 'on' : smear ? 'smear' : 'off', events: ev };
}
/** the thumb stopped at u: a mark. → events: { k: 'mark', grade: 'gold' | 'good', pts } | { k: 'wrong' } | { k: 'none' } */
export function stop(S, u) {
  const s = cur(S); if (!s || s.sorted) return [{ k: 'none' }];
  const e = s.e;
  if (s.ck[e] || s.marked[e] != null) return [{ k: 'none' }];
  if (inMoss(s, e, u)) return [{ k: 'none', why: 'moss' }];   // (under the moss the thumb feels nothing: wipe it first)
  S.n++;
  if (s.bad && s.bad.e === e) {
    const d = Math.abs(u - s.bad.at), timely = S.arr != null && S.arrE === e && S.t - S.arr <= NK.MARK.late;
    if (d <= NK.MARK.exact && timely) { s.marked[e] = u; s.ck[e] = true; S.pts += NK.PTS.exact; S.exact++; return [{ k: 'mark', grade: 'gold', pts: NK.PTS.exact, at: s.bad.at }]; }
    if (d <= NK.MARK.near) { s.marked[e] = u; s.ck[e] = true; S.pts += NK.PTS.near; return [{ k: 'mark', grade: 'good', pts: NK.PTS.near, at: s.bad.at }]; }
  }
  S.wrong++;
  return [{ k: 'wrong', mud: s.mud.some((m) => m.e === e && Math.abs(m.at - u) <= NK.MARK.near) }];
}
/** the right thumb on the stone: the next edge */
export function rotate(S) { const s = cur(S); if (!s || s.edges < 2 || s.sorted) return false; s.e = (s.e + 1) % s.edges; S.arr = null; return true; }
export const canSort = (S) => { const s = cur(S); return !!s && !s.sorted && s.ck.every(Boolean); };
/** up to the basket ('basket') or down to the heap ('pile') → events */
export function sort(S, to) {
  const s = cur(S); if (!s || !canSort(S)) return [{ k: 'shake' }];
  const bad = !!s.bad, marked = bad && s.marked[s.bad.e] != null, ev = [];
  const free = S.free; S.free = false;
  if (to === 'basket') {
    if (!bad) { S.pts += NK.PTS.sort; ev.push({ k: 'basket', pts: NK.PTS.sort, grade: 'ok' }); }
    else if (free) { ev.push({ k: 'back' }); reset(s); S.n++; return ev; }   // (the free trial: nothing lost, the stone back to the row)
    else { S.dmg++; ev.push({ k: 'badIn', loss: NK.PTS.bad }); }
  } else {
    if (bad && marked) { S.pts += NK.PTS.sort; ev.push({ k: 'pile', pts: NK.PTS.sort, grade: 'ok', split: true }); }
    else if (bad) ev.push({ k: 'pile', pts: 0, split: true });
    else if (free) { ev.push({ k: 'back' }); reset(s); S.n++; return ev; }
    else { S.wrong++; ev.push({ k: 'goodOut' }); }
  }
  s.sorted = to; if (to === 'basket') S.basket++; else S.heap++;
  S.n++; S.i++; S.arr = null;
  if (S.i >= S.stones.length) ev.push({ k: 'done' });
  return ev;
}
function reset(s) { s.e = 0; s.ck.fill(false); s.marked.fill(null); for (const c of s.cov) c.fill(0); for (const m of s.moss) { m.wipes = 0; m.dir = 0; } }
export const done = (S) => S.i >= S.stones.length;
export function result(S) {
  const q = S.max > 0 ? Math.max(0, Math.min(1, S.pts / S.max)) : 0;
  const stars = S.dmg > 0 ? Math.min(2, q >= 0.7 ? 2 : 1) : q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1;
  const perfect = S.dmg === 0 && S.wrong === 0 && S.missed === 0 && S.exact === S.stones.filter((s) => s.bad).length;
  return { pts: S.pts, max: S.max, q, stars, perfect, flags: { dmg: S.dmg, wrong: S.wrong, missed: S.missed, exact: S.exact, basket: S.basket, heap: S.heap } };
}
export function save(S, id) { return { id, lv: S.lv, i: S.i, pts: S.pts, dmg: S.dmg, wrong: S.wrong, missed: S.missed, exact: S.exact, n: S.n, free: S.free, heap: S.heap, basket: S.basket, sorted: S.stones.map((s) => s.sorted) }; }
export function load(b) {
  if (!b || !b.lv) return null;
  const S = fresh(b.lv);
  for (const k of ['i', 'pts', 'dmg', 'wrong', 'missed', 'exact', 'n', 'free', 'heap', 'basket']) if (b[k] !== undefined) S[k] = b[k];
  (b.sorted || []).forEach((v, j) => { if (S.stones[j]) S.stones[j].sorted = v; });
  return S;
}
