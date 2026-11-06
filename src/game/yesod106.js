// ── build 106 ── stage 08's yesod rebuilt as a puzzle of field stones (the owner 6.11 09:06: "האבנים לא זזות ולכן הפאזל מאוד מצומצם …
// אפשר וצריך לבנות פאזל טנטרם שכזה אבל שיהיה אפשרות לשנות את זויות האבנים בהתאם לצורתם ושיהיה קשה מפעם לפעם"). A stretch of the yesod's
// course (one amah wide, Middot 3:1) seen from above, cut into whole field stones of many sides; they lie beside it turned every way; he turns
// each (15° at a time), turns it over, and lays it — it goes in only where its corners meet the place it was cut from (or one of the same
// shape); any stone laid is lifted again. Harder each stretch: more stones, stones that belong nowhere, angles off the square, and flips.
// Pure: no three.js, no DOM. The spec: the Claude Doc "איפיון בנייה 106", the section "היסוד (שלב 08) — פאזל אבני שדה".

/** the stretches' levels: len (amot along the course), n (stones), extra (stones of no place), rot (the turns they lie at: the step in
 *  degrees), flip (some lie face down), ghost (the places drawn in lime), devi (how far a cut leans off square, rad) */
export const TAN106 = Object.freeze({
  width: 1, tol: 0.17, step: 15, minArea: 0.32, minSide: 0.3,
  levels: Object.freeze([
    Object.freeze({ len: 4, n: 4, extra: 0, rot: 90, flip: false, ghost: true, devi: 0.35 }),
    Object.freeze({ len: 5, n: 6, extra: 1, rot: 45, flip: true, ghost: false, devi: 0.55 }),
    Object.freeze({ len: 6, n: 8, extra: 2, rot: 15, flip: true, ghost: false, devi: 0.75 }),
  ]),
});
const area = (P) => { let a = 0; for (let i = 0; i < P.length; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length]; a += x1 * y2 - x2 * y1; } return a / 2; };
const centroid = (P) => { let cx = 0, cy = 0, a = 0; for (let i = 0; i < P.length; i++) { const [x1, y1] = P[i], [x2, y2] = P[(i + 1) % P.length], f = x1 * y2 - x2 * y1; cx += (x1 + x2) * f; cy += (y1 + y2) * f; a += f; } a /= 2; return Math.abs(a) < 1e-9 ? P[0] : [cx / (6 * a), cy / (6 * a)]; };
/** a convex polygon cut by the line through p along d: the two halves (each CCW), or null */
export function cut106(P, p, d) {
  const side = (q) => (q[0] - p[0]) * d[1] - (q[1] - p[1]) * d[0], A = [], B = [];
  for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], sa = side(a), sb = side(b);
    if (sa >= 0) A.push(a); if (sa <= 0) B.push(a);
    if ((sa > 0 && sb < 0) || (sa < 0 && sb > 0)) { const t = sa / (sa - sb), x = [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]; A.push(x); B.push(x); } }
  return A.length >= 3 && B.length >= 3 ? [A, B] : null;
}
const minSide = (P) => { let m = 1e9; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; m = Math.min(m, Math.hypot(b[0] - a[0], b[1] - a[1])); } return m; };
/** the polygon's narrowest width (over its edges' normals) */
const thin = (P) => { let m = 1e9; for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length], L = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1, nx = -(b[1] - a[1]) / L, ny = (b[0] - a[0]) / L; let w = 0; for (const q of P) w = Math.max(w, Math.abs((q[0] - a[0]) * nx + (q[1] - a[1]) * ny)); m = Math.min(m, w); } return m; };
/** the frame [0,len]×[0,1] cut into n convex stones (always solvable: they are its own pieces) */
export function carve106(len, n, devi, rnd) {
  for (let tries = 0; tries < 400; tries++) {
    let parts = [[[0, 0], [len, 0], [len, 1], [0, 1]]], ok = true;
    while (parts.length < n && ok) {
      parts.sort((a, b) => Math.abs(area(b)) - Math.abs(area(a))); const P = parts[0], c = centroid(P);
      let xs = P.map((q) => q[0]), wide = Math.max(...xs) - Math.min(...xs), got = null;
      for (let k = 0; k < 30 && !got; k++) {
        const across = wide > 1.15 || rnd() < 0.3, a0 = across ? Math.PI / 2 : rnd() * Math.PI, a = a0 + (rnd() * 2 - 1) * devi, d = [Math.cos(a), Math.sin(a)], p = [c[0] + (rnd() - 0.5) * Math.min(1, wide) * 0.5, c[1] + (rnd() - 0.5) * 0.3];
        const r = cut106(P, p, d); if (!r) continue; if (r.some((h) => Math.abs(area(h)) < TAN106.minArea || minSide(h) < 0.12 || thin(h) < TAN106.minSide)) continue; got = r;
      }
      if (!got) ok = false; else parts = parts.slice(1).concat(got);
    }
    if (ok && parts.length === n) return parts.map((P) => (area(P) < 0 ? P.slice().reverse() : P));
  }
  return null;
}
const rot = (q, a) => [q[0] * Math.cos(a) - q[1] * Math.sin(a), q[0] * Math.sin(a) + q[1] * Math.cos(a)];
/** a stone's corners as it lies: its shape (about its middle) flipped (mirrored across its long axis), turned deg, at (x, y) */
export const pose106 = (shape, x, y, deg, flip) => shape.map((q) => { const r = rot(flip ? [q[0], -q[1]] : q, (deg * Math.PI) / 180); return [x + r[0], y + r[1]]; });
/** do two corner lists match within tol (any start, either way round)? */
export function match106(A, B, tol = TAN106.tol) {
  if (A.length !== B.length) return false; const n = A.length;
  for (const dir of [1, -1]) for (let s = 0; s < n; s++) { let ok = true; for (let i = 0; i < n && ok; i++) { const b = B[(s + dir * i + n * 2) % n]; if (Math.hypot(A[i][0] - b[0], A[i][1] - b[1]) > tol) ok = false; } if (ok) return true; }
  return false;
}

/** one stretch. stones: { id, shape (corners about its middle), deg, flip, at: null | slot id, extra }; slots: the places cut, each
 *  { id, P (corners in the frame), by: stone id | null }. drop(id, x, y) → 'set' (its corners met a free place: it lies there) | 'nofit'
 *  (over the frame but no place takes it — a miss) | 'aside' (off the frame); turn(id, steps) by 15°; flip(id) (from level 2); lift(id) →
 *  back in the hand; hint() → { id, slot } (the master points: a hint) ; done when every place is taken */
export function createTangram106(level = 0, rnd = Math.random) {
  const L = TAN106.levels[Math.max(0, Math.min(TAN106.levels.length - 1, level | 0))], len = L.len;
  const P = carve106(len, L.n, L.devi, rnd) || carve106(len, L.n, 0.2, rnd);
  const slots = P.map((Q, i) => ({ id: i, P: Q, c: centroid(Q), by: null }));
  const lie = () => { const steps = Math.round(360 / L.rot); let d = Math.floor(rnd() * steps) * L.rot; if (d === 0) d = L.rot; return d % 360; };
  const stones = slots.map((s, i) => { const shape = s.P.map((q) => [q[0] - s.c[0], q[1] - s.c[1]]), f = L.flip && rnd() < 0.4, d = lie();
    // (lying turned by d (and face down if f): its shape as it lies; to go in he turns it back)
    const lay = pose106(shape, 0, 0, d, false).map((q) => (f ? [q[0], -q[1]] : q));
    return { id: i, shape: lay, deg: 0, flip: false, at: null, extra: false }; });
  for (let e = 0; e < L.extra; e++) {   // (stones of no place: a piece of another stretch's cut, a little other in size)
    let shape = null; for (let t = 0; t < 160 && !shape; t++) { const Q = carve106(2 + rnd() * 2, 3, 0.9, rnd); if (!Q) continue; const R = Q[Math.floor(rnd() * Q.length)], c = centroid(R), s = t < 80 ? 0.8 + rnd() * 0.15 : 0.7 + rnd() * 0.4, sh = R.map((q) => [(q[0] - c[0]) * s, (q[1] - c[1]) * s]); if (slots.some((sl) => { const sc = sl.P.map((q) => [q[0] - sl.c[0], q[1] - sl.c[1]]); for (let a = 0; a < 360; a += 15) for (const f of [false, true]) if (match106(pose106(sh, 0, 0, a, f), sc, 0.25)) return true; return false; })) continue; shape = sh; }
    if (shape) stones.push({ id: stones.length, shape, deg: 0, flip: false, at: null, extra: true }); }
  for (let q = stones.length - 1; q > 0; q--) { const j = Math.floor(rnd() * (q + 1)); [stones[q], stones[j]] = [stones[j], stones[q]]; }
  stones.forEach((s, i) => { s.id = i; });
  const k = { level: level | 0, L, len, slots, stones, misses: 0, hints: 0, lifts: 0, done: false, q: null, ev: [], last: null, sets: 0 };
  const ev = (e) => { k.ev.push(e); k.last = e; return e; };
  const S = (id) => stones.find((s) => s.id === id);
  const corners = (s, x, y) => pose106(s.shape, x, y, s.deg, s.flip);
  function turn(id, steps) { const s = S(id); if (!s || s.at != null) return 'none'; s.deg = (((s.deg + steps * TAN106.step) % 360) + 360) % 360; return ev('turn'); }
  function flip(id) { const s = S(id); if (!s || s.at != null || !L.flip) return 'none'; s.flip = !s.flip; return ev('flip'); }
  function lift(id) { const s = S(id); if (!s || s.at == null) return 'none'; slots[s.at].by = null; s.at = null; k.lifts++; return ev('lift'); }
  /** the place his stone would take dropped at (x, y), or null */
  function fits(id, x, y) { const s = S(id); if (!s) return null; const C = corners(s, x, y); return slots.find((sl) => sl.by == null && match106(C, sl.P)) || null; }
  function drop(id, x, y) {
    const s = S(id); if (!s || s.at != null || k.done) return 'none';
    const sl = fits(id, x, y);
    if (sl) { sl.by = s.id; s.at = sl.id; k.sets++; if (slots.every((q) => q.by != null)) { k.done = true; k.q = k.hints ? 0.5 : k.misses > slots.length * 2 ? 0.5 : 1; return ev('done'); } return ev('set'); }
    if (x > -0.3 && x < len + 0.3 && y > -0.3 && y < 1.3) { k.misses++; return ev('nofit'); }
    return ev('aside');
  }
  /** where a stone goes and how it lies there (deg, flip): for the master's hint and the test's hand */
  function answer(id) {
    const s = S(id); if (!s || s.extra) return null;
    for (const sl of slots) { if (sl.by != null) continue; for (let a = 0; a < 360; a += TAN106.step) for (const f of L.flip ? [false, true] : [false]) if (match106(pose106(s.shape, sl.c[0], sl.c[1], a, f), sl.P, 0.02)) return { slot: sl.id, x: sl.c[0], y: sl.c[1], deg: a, flip: f }; }
    return null;
  }
  function hint() { const s = stones.find((q) => q.at == null && answer(q.id)); if (!s) return null; k.hints++; return { id: s.id, ...answer(s.id) }; }
  /** the test's hand (no hint counted): the next stone and how */
  function plan() { const s = stones.find((q) => q.at == null && answer(q.id)); return s ? { id: s.id, ...answer(s.id) } : null; }
  return { turn, flip, lift, drop, fits, answer, hint, plan, corners, state: () => k, L, len };
}
export const tanQ106 = (qs) => { if (!qs.length) return 0; const s = qs.reduce((a, b) => a + b, 0) / qs.length; return s >= 0.88 ? 1 : s >= 0.45 ? 0.5 : 0; };
export const YL106 = Object.freeze({
  open: 'קטע של היסוד — אמה רוחב. מלאו אותו באבני שדה שלמות · "עלה אמה וכנס אמה, זה היסוד" — מדות ג, א · טיוטה',
  pick: 'גררו אבן אל הקטע · המחשה',
  turn: 'סובבו את האבן בטבעת שסביבה · המחשה',
  flip: 'הקישו פעמיים — האבן מתהפכת · המחשה',
  set: '"טק" — נכנסה · המחשה',
  nofit: 'אין לה מקום כך — סובבו, הפכו, או נסו אבן אחרת · המחשה',
  extra: 'יש כאן אבן שאין לה מקום בכלל · המחשה',
  lift: 'האבן שוב ביד · המחשה',
  hint: 'ראש הבנאים מראה: האבן הזו, למקום הזה · המחשה',
  done: 'הקטע סגור — אבני שדה שלמות, בלי ברזל · "אבנים שלמות תבנה" — דברים כז, ו · טיוטה',
  crews: 'הצוותים ממשיכים לבנות עד הקטע הבא · המחשה',
});
