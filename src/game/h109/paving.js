/* ── build 116 ── h109/paving.js — the paving of a quarter of a cut cell in seven slab sizes (docs/specs/build116-brief.md §C).
 * Pure: no three.js, no DOM. A cell is 10 × 10 units of 2.5 amot, four quarters of 5 × 5 units; one paving work is one quarter.
 * The mason's rule (an illustration of the craft): no point inside the quarter where four slab corners meet.
 *
 *   SIZES → the seven [w, h] · layout(seed, level) → { tiles: [{ w, h, x, y }], pile: [{ id, w, h, cracked?, extra? }] }
 *   newBoard() · canPlace(board, w, h, x, y) → bool · why(board, w, h, x, y) → null | 'out' | 'taken' | { cross: [px, py] }
 *   place(board, id, w, h, x, y) · lift(board, id) · stuck(board, pile) · done(board) · fits(board, w, h) → [x, y, turned] | null
 */
export const N = 5;               // a quarter: 5 × 5 units
export const UNIT = 2.5;          // amot
export const SIZES = Object.freeze([[1, 1], [1, 2], [1, 3], [1, 4], [2, 2], [2, 3], [3, 3]].map((a) => Object.freeze(a)));

function rnd(seed) { let t = (seed * 2654435761) >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let q = Math.imul(t ^ (t >>> 15), 1 | t); q ^= q + Math.imul(q ^ (q >>> 7), 61 | q); return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; }

export function newBoard() { return Array.from({ length: N }, () => Array(N).fill(0)); }
const cell = (b, x, y) => (x < 0 || y < 0 || x >= N || y >= N ? -1 : b[y][x]);

/** the inner point (px, py) (1..N−1) is a meeting of four corners: its four cells all laid, by four different slabs */
function cross(b, px, py) {
  const a = cell(b, px - 1, py - 1), c = cell(b, px, py - 1), d = cell(b, px - 1, py), e = cell(b, px, py);
  if (a <= 0 || c <= 0 || d <= 0 || e <= 0) return false;
  return a !== c && a !== d && a !== e && c !== d && c !== e && d !== e;
}

/** why a slab w × h cannot lie with its corner at (x, y) | null when it can */
export function why(b, w, h, x, y) {
  if (x < 0 || y < 0 || x + w > N || y + h > N) return 'out';
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (b[j][i]) return 'taken';
  // try it: a four-corner point on its outline?
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) b[j][i] = 1e6;
  let bad = null;
  for (let py = Math.max(1, y); py <= Math.min(N - 1, y + h) && !bad; py++) for (let px = Math.max(1, x); px <= Math.min(N - 1, x + w) && !bad; px++) if (cross(b, px, py)) bad = { cross: [px, py] };
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) b[j][i] = 0;
  return bad;
}
export function canPlace(b, w, h, x, y) { return why(b, w, h, x, y) === null; }
export function place(b, id, w, h, x, y) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) b[j][i] = id; }
export function lift(b, id) { for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (b[j][i] === id) b[j][i] = 0; }
export function done(b) { for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) if (!b[j][i]) return false; return true; }
/** a place for a w × h slab (either way round) | null */
export function fits(b, w, h) {
  for (const [W, H, t] of [[w, h, 0], [h, w, 1]]) for (let y = 0; y + H <= N; y++) for (let x = 0; x + W <= N; x++) if (canPlace(b, W, H, x, y)) return [x, y, t];
  return null;
}
/** nothing of the pile (the slabs not laid) can lie anywhere */
export function stuck(b, pile) { if (done(b)) return false; return !pile.some((s) => fits(b, s.w, s.h)); }

/** the whole board obeys the rule (a test's check) */
export function legal(b) { for (let py = 1; py < N; py++) for (let px = 1; px < N; px++) if (cross(b, px, py)) return false; return true; }

/* ── h117 ── (ירון 10.11: "המשחקון הראשון קשה לא הצלחתי. רמות הקושי צריכות לעלות בצורה הדרגתית") five steps over his paving works:
 *  step 1: 4 slabs (one 3×3), all their places in chalk · 2: 5 slabs, the two biggest chalked · 3: 6–7 slabs, the four-corner rule
 *  · 4: 8–9 · 5: 9–11 with two slabs too many and a cracked one. stepOf(n) → the step after n paving works done. ── /h117 ── */
export const STEPS = Object.freeze([
  null,
  { want: [4, 4], kinds: 3, W: [0.2, 0.6, 0.9, 1, 1.4, 2.2, 3], need: 9, chalk: 99, extras: false },
  { want: [5, 5], kinds: 3, W: [0.3, 0.8, 1, 1, 1.4, 2, 2.2], need: 6, chalk: 2, extras: false },
  { want: [6, 7], kinds: 4, W: [0.4, 1, 1, 1, 1.4, 2.2, 2.4], need: 6, chalk: 0, extras: false },
  { want: [8, 9], kinds: 5, W: [1, 1.4, 1.3, 1, 1.3, 1.2, 0.9], need: 0, chalk: 0, extras: false },
  { want: [9, 11], kinds: 5, W: [1.4, 1.6, 1.4, 1, 1.2, 1, 0.6], need: 0, chalk: 0, extras: true },
].map((o) => (o ? Object.freeze(o) : o)));
export function stepOf(n) { n = Math.max(0, n | 0); return n === 0 ? 1 : n === 1 ? 2 : n <= 3 ? 3 : n <= 5 ? 4 : 5; }
/** the chalked places of a layout at its step: the biggest tiles first (step 1: all) */
export function chalkOf(L) {
  const S = STEPS[L.step] || STEPS[3]; if (!S.chalk) return [];
  return L.tiles.map((t, i) => ({ ...t, i })).sort((a, b) => b.w * b.h - a.w * a.h || a.i - b.i).slice(0, S.chalk);
}
/** one true tiling for a seed at a step (1..5), and his pile made of it */
export function layoutStep(seed, step = 3) {
  const st = Math.max(1, Math.min(5, step | 0)), S = STEPS[st];
  const R = rnd(seed * 7919 + st * 7741 + 29);
  for (let attempt = 0; attempt < 6000; attempt++) {
    const b = newBoard(), tiles = []; let id = 0, ok = true;
    while (!done(b) && ok) {
      let fx = -1, fy = -1; for (let j = 0; j < N && fx < 0; j++) for (let i = 0; i < N; i++) if (!b[j][i]) { fx = i; fy = j; break; }
      const opts = [];
      SIZES.forEach(([w, h], k) => { for (const [W, H] of w === h ? [[w, h]] : [[w, h], [h, w]]) if (canPlace(b, W, H, fx, fy)) opts.push({ W, H, wt: S.W[k] }); });
      if (!opts.length) { ok = false; break; }
      let r = R() * opts.reduce((a, o) => a + o.wt, 0), pick = opts[0];
      for (const o of opts) { r -= o.wt; if (r <= 0) { pick = o; break; } }
      place(b, ++id, pick.W, pick.H, fx, fy); tiles.push({ w: pick.W, h: pick.H, x: fx, y: fy });
    }
    if (!ok || !legal(b) || tiles.length < S.want[0] || tiles.length > S.want[1]) continue;
    if (new Set(tiles.map((t) => Math.min(t.w, t.h) + 'x' + Math.max(t.w, t.h))).size < S.kinds) continue;
    if (S.need && !tiles.some((t) => t.w * t.h >= S.need)) continue;
    const pile = tiles.map((t) => ({ w: Math.min(t.w, t.h), h: Math.max(t.w, t.h) }));
    if (S.extras) {
      for (let k = 0; k < 2; k++) { const [w, h] = SIZES[1 + Math.floor(R() * 5)]; pile.push({ w, h, extra: true }); }
      const c = pile[Math.floor(R() * tiles.length)]; pile.push({ w: c.w, h: c.h, cracked: true });
    }
    for (let i = pile.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [pile[i], pile[j]] = [pile[j], pile[i]]; }
    pile.forEach((p, i) => { p.id = i + 1; });
    return { tiles, pile, seed, step: st, level: st >= 5 ? 3 : st >= 4 ? 2 : 1 };
  }
  // (never reached in the tested seeds) a plain legal tiling of the step's size
  return layout(seed, st >= 4 ? 2 : 1);
}

/** one true tiling of the quarter for a seed and a level, and his pile made of it (level 3: two slabs too many and a cracked one) */
export function layout(seed, level = 1) {
  const lv = Math.max(1, Math.min(3, level | 0));
  const R = rnd(seed * 7919 + lv * 104729 + 13);
  const want = lv === 1 ? [6, 7] : [9, 11];
  for (let attempt = 0; attempt < 4000; attempt++) {
    const b = newBoard(), tiles = []; let id = 0, ok = true;
    // (the shapes' weights by level: level 1 big slabs, later more small ones)
    const W1 = lv === 1 ? [0.4, 1, 1, 1, 1.4, 2.2, 2.4] : [1.4, 1.6, 1.4, 1, 1.2, 1, 0.6];
    while (!done(b) && ok) {
      // the first empty cell, in reading order
      let fx = -1, fy = -1; for (let j = 0; j < N && fx < 0; j++) for (let i = 0; i < N; i++) if (!b[j][i]) { fx = i; fy = j; break; }
      const opts = [];
      SIZES.forEach(([w, h], k) => { for (const [W, H] of w === h ? [[w, h]] : [[w, h], [h, w]]) if (canPlace(b, W, H, fx, fy)) opts.push({ W, H, wt: W1[k] }); });
      if (!opts.length) { ok = false; break; }
      let tot = opts.reduce((a, o) => a + o.wt, 0), r = R() * tot, pick = opts[0];
      for (const o of opts) { r -= o.wt; if (r <= 0) { pick = o; break; } }
      place(b, ++id, pick.W, pick.H, fx, fy); tiles.push({ w: pick.W, h: pick.H, x: fx, y: fy });
    }
    if (!ok || !legal(b)) continue;
    if (tiles.length < want[0] || tiles.length > want[1]) continue;
    const kinds = new Set(tiles.map((t) => Math.min(t.w, t.h) + 'x' + Math.max(t.w, t.h)));
    if (lv === 1 && (kinds.size < 4 || !tiles.some((t) => t.w * t.h >= 6))) continue;
    if (lv >= 2 && kinds.size < 5) continue;
    // the pile: his slabs shuffled (each by its own size, lying long side across), at level 3 two more that fit nowhere at the end
    // and one cracked (a copy of one of his sizes)
    const pile = tiles.map((t) => ({ w: Math.min(t.w, t.h), h: Math.max(t.w, t.h) }));
    if (lv >= 3) {
      for (let k = 0; k < 2; k++) { const [w, h] = SIZES[1 + Math.floor(R() * 5)]; pile.push({ w, h, extra: true }); }
      const c = pile[Math.floor(R() * tiles.length)]; pile.push({ w: c.w, h: c.h, cracked: true });
    }
    for (let i = pile.length - 1; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [pile[i], pile[j]] = [pile[j], pile[i]]; }
    pile.forEach((p, i) => { p.id = i + 1; });
    return { tiles, pile, seed, level: lv };
  }
  // (never reached in the tested seeds) a plain legal tiling
  const tiles = [{ w: 3, h: 3, x: 0, y: 0 }, { w: 2, h: 3, x: 3, y: 0 }, { w: 1, h: 2, x: 0, y: 3 }, { w: 4, h: 1, x: 1, y: 3 }, { w: 4, h: 1, x: 1, y: 4 }];
  return { tiles, pile: tiles.map((t, i) => ({ id: i + 1, w: Math.min(t.w, t.h), h: Math.max(t.w, t.h) })), seed, level: lv };
}
