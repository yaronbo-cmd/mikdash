/* ─────────────────────────────────────────────────────────────────────────────
 * pen/engine.js: the pure engine of "הוצאת הטלה מהדיר" (the sliding-block pen puzzle). No DOM; deterministic by seed.
 *
 *   A level: { w:6, h:6, exitRow, pieces:[{ id, kind, x, y, len, dir:'h'|'v' }], optimal? }
 *   The gate is in the LEFT fence of row `exitRow` (RTL: forward is leftward, so the lamb walks "ahead" out of the pen).
 *   The lamb (kind 'lamb', horizontal, in the exit row) has reached the gate when x === 0.
 *
 *   load(level)                → a state: the level's pieces + moves:0, hist:[], hints:HINTS, optimal
 *   canMove(s, id, delta)      → true when the piece can slide `delta` cells along its axis (every cell on the way free)
 *   range(s, id)               → { min, max }: how far it can slide now (min ≤ 0 ≤ max)
 *   move(s, id, delta)         → a NEW state (moves+1, the old positions kept in hist), or null when illegal
 *   undo(s)                    → the previous state (moves−1), or null when nothing to undo (unlimited)
 *   hint(s)                    → { s, move:[id, delta] | null }: the next optimal move (HINTS a level), lit by the UI
 *   isWon(s) · solve(s) → { moves:[[id, delta]…], n } | null (BFS over board states; a move = one slide of any length)
 *   generate(level, seed)      → a solvable level whose optimal length sits in bandOf(level) (see below)
 *   HAND[1..6]                 → hand-authored levels; puzzle(level, seed) picks HAND for 1–6 and generate() from 7
 *   stars(moves, optimal) · gain(stars, level) · bandOf(level) · hashSeed(…parts)
 *
 * Every function returns a NEW state; the old one is never mutated.
 * ──────────────────────────────────────────────────────────────────────────── */

export const W = 6, H = 6, HINTS = 2;
/* the pieces (drawn in art.js); the Hebrew names are drafts — docs/PEN35.md */
export const KINDS = {
  lamb: { len: 2, he: 'הטלה' }, goat: { len: 2, he: 'עז' }, cow: { len: 3, he: 'פרה' },
  hay: { len: 2, he: 'חבילת קש' }, trough: { len: 3, he: 'שוקת' }, kohen: { len: 2, he: 'כהן עם סל' },
};
export const KIND_HE = Object.fromEntries(Object.entries(KINDS).map(([k, v]) => [k, v.he]));

/* ── seeded random (mulberry32), the same as tiles ── */
export function hashSeed(...parts) {
  let h = 2166136261 >>> 0;
  for (const p of parts) for (const ch of String(p)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h || 1;
}
function rng(seed) {
  let a = (seed >>> 0) || 1;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}

/* ── the difficulty bands: [min, max] optimal moves and [min, max] pieces per level ── */
export function bandOf(level) {
  const L = Math.max(1, level | 0);
  const B = [null, [3, 5, 4, 5], [4, 6, 5, 6], [5, 7, 5, 7], [6, 9, 6, 8], [8, 12, 8, 10], [9, 13, 8, 10], [10, 15, 8, 11], [12, 17, 9, 11], [13, 20, 9, 12]];
  const b = L < B.length ? B[L] : [15, 25, 10, 12];
  return { min: b[0], max: b[1], pMin: b[2], pMax: b[3] };
}
/** 1–3 stars by moves against the optimal: 3 ≤ optimal+2 · 2 ≤ optimal×1.5 · else 1 */
export function stars(moves, optimal) {
  if (moves <= optimal + 2) return 3;
  if (moves <= optimal * 1.5) return 2;
  return 1;
}
/** פרוטות: (3 + 2×stars) × the level (the factor is capped at 10) */
export const gain = (st, level) => (3 + 2 * Math.max(0, Math.min(3, st | 0))) * Math.max(1, Math.min(10, level | 0));

/* ── geometry ── */
const cells = (p) => { const out = []; for (let k = 0; k < p.len; k++) out.push(p.dir === 'h' ? [p.x + k, p.y] : [p.x, p.y + k]); return out; };
function grid(s) {
  const g = new Int8Array(s.w * s.h).fill(-1);
  s.pieces.forEach((p, i) => { for (const [x, y] of cells(p)) if (x >= 0 && y >= 0 && x < s.w && y < s.h) g[y * s.w + x] = i; });
  return g;
}
const byId = (s, id) => s.pieces.findIndex((p) => p.id === id);
/** how far piece `id` can slide along its axis right now */
export function range(s, id) {
  const i = byId(s, id); if (i < 0) return { min: 0, max: 0 };
  const p = s.pieces[i], g = grid(s);
  const free = (x, y) => x >= 0 && y >= 0 && x < s.w && y < s.h && g[y * s.w + x] < 0;
  let min = 0, max = 0;
  if (p.dir === 'h') { while (free(p.x + min - 1, p.y)) min--; while (free(p.x + p.len + max, p.y)) max++; }
  else { while (free(p.x, p.y + min - 1)) min--; while (free(p.x, p.y + p.len + max)) max++; }
  return { min, max };
}
export function canMove(s, id, delta) {
  delta |= 0; if (!delta) return false;
  const r = range(s, id);
  return delta >= r.min && delta <= r.max;
}
const clone = (s) => Object.assign({}, s, { pieces: s.pieces.map((p) => Object.assign({}, p)) });

/** a fresh state from a level (the optimal count is solved when the level does not carry it) */
export function load(level) {
  const s = { w: level.w || W, h: level.h || H, exitRow: level.exitRow | 0, pieces: level.pieces.map((p) => Object.assign({}, p)), moves: 0, hist: [], hints: HINTS, won: false };
  const lamb = s.pieces.find((p) => p.kind === 'lamb');
  if (!lamb || lamb.dir !== 'h' || lamb.y !== s.exitRow) throw new Error('pen: the lamb must lie horizontally in the exit row');
  s.optimal = level.optimal >= 0 ? level.optimal | 0 : (solve(s) || { n: 0 }).n;
  s.level = level.level | 0; s.seed = level.seed; s.name = level.name || '';
  s.won = isWon(s);
  return s;
}
export const lambOf = (s) => s.pieces.find((p) => p.kind === 'lamb');
export const isWon = (s) => { const l = lambOf(s); return !!l && l.x === 0; };

/** the player slides piece `id` by `delta` cells (one move, whatever the distance) */
export function move(s0, id, delta) {
  delta |= 0;
  if (s0.won || !canMove(s0, id, delta)) return null;
  const s = clone(s0);
  const p = s.pieces[byId(s, id)];
  s.hist = s0.hist.concat([s0.pieces.map((q) => (q.dir === 'h' ? q.x : q.y))]);
  if (p.dir === 'h') p.x += delta; else p.y += delta;
  s.moves = s0.moves + 1; s.last = [id, delta];
  s.won = isWon(s);
  return s;
}
/** back one move (unlimited) */
export function undo(s0) {
  if (!s0.hist.length) return null;
  const s = clone(s0);
  const pos = s0.hist[s0.hist.length - 1];
  s.pieces.forEach((p, i) => { if (p.dir === 'h') p.x = pos[i]; else p.y = pos[i]; });
  s.hist = s0.hist.slice(0, -1); s.moves = Math.max(0, s0.moves - 1); s.last = null; s.won = isWon(s);
  return s;
}
/** the board as it was dealt */
export function reset(s0) {
  if (!s0.hist.length) return s0;
  const s = clone(s0), pos = s0.hist[0];
  s.pieces.forEach((p, i) => { if (p.dir === 'h') p.x = pos[i]; else p.y = pos[i]; });
  s.hist = []; s.moves = 0; s.last = null; s.won = false;
  return s;
}
/** the next optimal move (HINTS a level, free); null when none is left or the board is solved */
export function hint(s0) {
  if (s0.hints <= 0 || s0.won) return { s: s0, move: null };
  const r = solve(s0);
  if (!r || !r.moves.length) return { s: s0, move: null };
  const s = clone(s0); s.hints = s0.hints - 1;
  return { s, move: r.moves[0] };
}

/* ── the solver: BFS over the piece positions (a key = the positions in base 6, one number); a move = one slide of any length ── */
const keyOf = (pos) => { let k = 0; for (let i = 0; i < pos.length; i++) k = k * 6 + pos[i]; return k; };
function posOf(s) { return s.pieces.map((p) => (p.dir === 'h' ? p.x : p.y)); }
const powers = (n) => { const out = new Array(n); let k = 1; for (let i = n - 1; i >= 0; i--) { out[i] = k; k *= 6; } return out; };
/** every legal single-slide neighbour of a position vector, as fn(pieceIndex, newValue, newKey) → true stops.
 *  The key is updated arithmetically, so a neighbour already seen costs no allocation. */
function eachNeighbour(s, pos, key, lambI, g, pw, fn) {
  const w = s.w, h = s.h, ps = s.pieces, n = ps.length;
  g.fill(-1);
  for (let i = 0; i < n; i++) { const p = ps[i], v = pos[i]; if (p.dir === 'h') for (let k = 0; k < p.len; k++) g[p.y * w + v + k] = i; else for (let k = 0; k < p.len; k++) g[(v + k) * w + p.x] = i; }
  for (let i = 0; i < n; i++) {
    const p = ps[i], v = pos[i], horiz = p.dir === 'h', lim = horiz ? w : h, pk = pw[i];
    for (let k = 1; ; k++) {   // backward (left / up)
      const nv = v - k; if (nv < 0) break;
      if ((horiz ? g[p.y * w + nv] : g[nv * w + p.x]) >= 0) break;
      if (fn(i, nv, key - k * pk)) return true;
      if (i === lambI && nv === 0) break;
    }
    for (let k = 1; ; k++) {   // forward (right / down)
      const edge = v + p.len - 1 + k; if (edge >= lim) break;
      if ((horiz ? g[p.y * w + edge] : g[edge * w + p.x]) >= 0) break;
      if (fn(i, v + k, key + k * pk)) return true;
    }
  }
  return false;
}
const withV = (pos, i, nv) => { const np = pos.slice(); np[i] = nv; return np; };
/** the shortest list of moves to bring the lamb to the gate, or null when the pen is stuck (or past `cap` states) */
export function solve(s, cap = 400000) {
  const lambI = s.pieces.findIndex((p) => p.kind === 'lamb');
  if (lambI < 0) return null;
  const start = posOf(s), g = new Int8Array(s.w * s.h), pw = powers(start.length);
  if (start[lambI] === 0) return { moves: [], n: 0 };
  const seen = new Map(); seen.set(keyOf(start), null);
  let frontier = [[start, keyOf(start)]], n = 0, found = -1;
  while (frontier.length && found < 0) {
    n++;
    const next = [];
    for (const [pos, pk] of frontier) {
      eachNeighbour(s, pos, pk, lambI, g, pw, (i, nv, k) => {
        if (seen.has(k)) return false;
        seen.set(k, [pk, i, nv - pos[i]]);
        if (i === lambI && nv === 0) { found = k; return true; }
        next.push([withV(pos, i, nv), k]);
        return seen.size > cap;
      });
      if (found >= 0) break;
      if (seen.size > cap) return null;
    }
    frontier = next;
  }
  if (found < 0) return null;
  const moves = []; let cur = found;
  while (seen.get(cur)) { const [pk, i, d] = seen.get(cur); moves.push([s.pieces[i].id, d]); cur = pk; }
  return { moves: moves.reverse(), n };
}

/* ── the generator ── */
/** random pieces on the board (the lamb first); null when the board got too crowded */
function scatter(rand, nPieces) {
  const s = { w: W, h: H, exitRow: 2, pieces: [] };
  const taken = new Int8Array(W * H).fill(0);
  const put = (p) => { for (const [x, y] of cells(p)) taken[y * W + x] = 1; s.pieces.push(p); };
  const fits = (p) => cells(p).every(([x, y]) => x >= 0 && y >= 0 && x < W && y < H && !taken[y * W + x]);
  put({ id: 'lamb', kind: 'lamb', x: 1 + Math.floor(rand() * 4), y: s.exitRow, len: 2, dir: 'h' });
  const kinds = ['goat', 'goat', 'cow', 'hay', 'hay', 'trough', 'kohen', 'goat', 'cow', 'hay', 'kohen'];
  let n = 1, tries = 0;
  const count = {};
  while (n < nPieces && tries < 200) {
    tries++;
    const kind = kinds[Math.floor(rand() * kinds.length)];
    if (kind === 'trough' && count.trough) continue;
    if (kind === 'kohen' && count.kohen >= 2) continue;
    const len = KINDS[kind].len, dir = rand() < 0.55 ? 'v' : 'h';
    const x = Math.floor(rand() * (dir === 'h' ? W - len + 1 : W)), y = Math.floor(rand() * (dir === 'v' ? H - len + 1 : H));
    if (dir === 'h' && y === s.exitRow) continue;   // nothing else lies along the lamb's lane
    const p = { id: kind + (n), kind, x, y, len, dir };
    if (!fits(p)) continue;
    put(p); count[kind] = (count[kind] || 0) + 1; n++;
  }
  return n >= Math.max(3, nPieces - 1) ? s : null;
}
/** the whole component of the start, with every position's distance to the gate (moves are reversible, so one backward
 *  BFS from the winning positions gives the optimal length of every reachable position). null past `cap` positions. */
function explore(s, cap) {
  const lambI = 0, g = new Int8Array(s.w * s.h);
  const start = posOf(s), pw = powers(start.length), k0 = keyOf(start);
  const idx = new Map([[k0, 0]]), poss = [start], keys = [k0], wins = [];
  if (start[lambI] === 0) wins.push(0);
  let frontier = [0], over = false;
  while (frontier.length) {
    const next = [];
    for (const q of frontier) {
      const pos = poss[q];
      eachNeighbour(s, pos, keys[q], lambI, g, pw, (i, nv, nk) => {
        if (idx.has(nk)) return false;
        const j = poss.length; idx.set(nk, j); poss.push(withV(pos, i, nv)); keys.push(nk); next.push(j);
        if ((i === lambI ? nv : pos[lambI]) === 0) wins.push(j);
        if (poss.length > cap) { over = true; return true; }
        return false;
      });
      if (over) return null;
    }
    frontier = next;
  }
  if (!wins.length) return null;
  const dist = new Int32Array(poss.length).fill(-1);
  for (const j of wins) dist[j] = 0;
  let f = wins, d = 0;
  while (f.length) {
    d++; const nf = [];
    for (const q of f) eachNeighbour(s, poss[q], keys[q], lambI, g, pw, (i, nv, nk) => { const j = idx.get(nk); if (dist[j] < 0) { dist[j] = d; nf.push(j); } return false; });
    f = nf;
  }
  return { poss, dist, maxD: d - 1 };
}
/** the level with its pieces moved to a position vector of the component */
const placed = (s, pos) => Object.assign({}, s, { pieces: s.pieces.map((p, i) => Object.assign({}, p, p.dir === 'h' ? { x: pos[i] } : { y: pos[i] })) });
/** a random change of the pen: a new piece in a free place (mostly), or a piece turned on its spot, or one taken away */
function mutate(rand, s, band) {
  const n = s.pieces.length, roll = rand();
  const taken = new Int8Array(W * H); for (const p of s.pieces) for (const [x, y] of cells(p)) taken[y * W + x] = 1;
  const fits = (p, skip) => cells(p).every(([x, y]) => x >= 0 && y >= 0 && x < W && y < H && (!taken[y * W + x] || (skip && cells(skip).some(([a, b]) => a === x && b === y))));
  if (n > 2 && (roll < 0.15 || n >= band.pMax + 1)) {   // take one away
    const i = 1 + Math.floor(rand() * (n - 1));
    return Object.assign({}, s, { pieces: s.pieces.filter((p, q) => q !== i) });
  }
  if (n > 1 && roll < 0.35) {   // turn one on its spot
    const i = 1 + Math.floor(rand() * (n - 1)), p = s.pieces[i];
    const q = Object.assign({}, p, { dir: p.dir === 'h' ? 'v' : 'h' });
    if (q.dir === 'h' && q.y === s.exitRow) return null;
    if (!fits(q, p)) return null;
    return Object.assign({}, s, { pieces: s.pieces.map((r, k) => (k === i ? q : r)) });
  }
  const kinds = ['goat', 'goat', 'cow', 'hay', 'hay', 'trough', 'kohen', 'goat', 'cow', 'hay', 'kohen'];
  for (let t = 0; t < 30; t++) {
    const kind = kinds[Math.floor(rand() * kinds.length)];
    const have = s.pieces.filter((p) => p.kind === kind).length;
    if ((kind === 'trough' && have) || (kind === 'kohen' && have >= 2)) continue;
    const len = KINDS[kind].len, dir = rand() < 0.55 ? 'v' : 'h';
    const x = Math.floor(rand() * (dir === 'h' ? W - len + 1 : W)), y = Math.floor(rand() * (dir === 'v' ? H - len + 1 : H));
    if (dir === 'h' && y === s.exitRow) continue;
    let id = kind + n; while (s.pieces.some((p) => p.id === id)) id += 'x';
    const p = { id, kind, x, y, len, dir };
    if (!fits(p)) continue;
    return Object.assign({}, s, { pieces: s.pieces.concat([p]) });
  }
  return null;
}
/** a solvable level for (level, seed): random pieces, the component explored (every reachable position gets its optimal
 *  length), the pen mutated while its deepest position is shallower than the band, then a position in the band picked at
 *  random. Deterministic by seed; the starts and the mutations are capped, and the best found (the closest to the band)
 *  is the fallback, so the call always returns a solvable board. */
export function generate(level = 1, seed = 1, opts = {}) {
  level = Math.max(1, level | 0);
  const band = bandOf(level), rand = rng(hashSeed('pen', level, seed));
  const starts = opts.attempts || 12, steps = opts.steps || 24, cap = opts.cap || 25000;
  const pMin = opts.pMin || band.pMin, pMax = opts.pMax || band.pMax;
  let best = null, bestGap = Infinity;
  const consider = (s, ex) => {
    const byD = new Map();   // in-band positions by their optimal length: a length is drawn first, so the band is spread evenly
    for (let j = 0; j < ex.dist.length; j++) { const dd = ex.dist[j]; if (dd >= band.min && dd <= band.max) { if (!byD.has(dd)) byD.set(dd, []); byD.get(dd).push(j); } }
    let pick = 0, gap = 0;
    if (byD.size) { const ds = [...byD.keys()]; const arr = byD.get(ds[Math.floor(rand() * ds.length)]); pick = arr[Math.floor(rand() * arr.length)]; }
    else { let bd = -1; for (let j = 0; j < ex.dist.length; j++) if (ex.dist[j] > bd) { bd = ex.dist[j]; pick = j; } gap = bd < band.min ? band.min - bd : bd - band.max; }
    const out = Object.assign(placed(s, ex.poss[pick]), { level, seed, optimal: ex.dist[pick] });
    if (!gap) return out;
    if (gap < bestGap) { bestGap = gap; best = out; }
    return null;
  };
  for (let a = 0; a < starts; a++) {
    const n = pMin + Math.floor(rand() * (pMax - pMin + 1));
    let s = scatter(rand, n);
    if (!s) continue;
    let ex = explore(s, cap);
    if (!ex) continue;
    for (let m = 0; m < steps && ex.maxD < band.min; m++) {
      // the mutation starts from the deepest position, where the pen is most tangled
      let deep = 0, bd = -1; for (let j = 0; j < ex.dist.length; j++) if (ex.dist[j] > bd) { bd = ex.dist[j]; deep = j; }
      const s2 = mutate(rand, placed(s, ex.poss[deep]), band);
      if (!s2) continue;
      const ex2 = explore(s2, cap);
      if (ex2 && ex2.maxD >= ex.maxD) { s = s2; ex = ex2; }
    }
    const out = consider(s, ex);
    if (out) return out;
  }
  if (best) return best;
  const L = HAND[1];   // no component reached (never seen in practice): the first hand level, so the game always has a board
  return Object.assign({}, L, { level, seed, pieces: L.pieces.map((p) => Object.assign({}, p)) });
}

/* ── hand-authored levels 1–6 (ids are unique per level; optimal verified by the solver in the tests) ──
 *  Row 2 is the lane; the gate is at its left end. Coordinates: x to the right, y downward, both from 0. */
const P = (id, kind, x, y, dir = 'h') => ({ id, kind, x, y, len: KINDS[kind].len, dir });
export const HAND = {
  /* L1 · 4 moves: a kohen and a cow stand in the lane; the goat above must step aside */
  1: { w: 6, h: 6, exitRow: 2, level: 1, name: 'דיר ראשון', optimal: 4, pieces: [
    P('lamb', 'lamb', 2, 2), P('goat1', 'goat', 4, 0, 'v'), P('goat2', 'goat', 1, 5), P('kohen1', 'kohen', 0, 2, 'v'), P('cow1', 'cow', 1, 0, 'v'),
  ] },
  /* L2 · 5 moves: the trough along the top wall, a cow down the second column */
  2: { w: 6, h: 6, exitRow: 2, level: 2, name: 'ליד השוקת', optimal: 5, pieces: [
    P('lamb', 'lamb', 3, 2), P('trough1', 'trough', 1, 0), P('cow1', 'cow', 1, 3, 'v'), P('goat1', 'goat', 1, 1, 'v'), P('goat2', 'goat', 2, 1), P('hay1', 'hay', 4, 0, 'v'),
  ] },
  /* L3 · 6 moves: three goats, two cows, a hay bale and the trough */
  3: { w: 6, h: 6, exitRow: 2, level: 3, name: 'שלוש עזים', optimal: 6, pieces: [
    P('lamb', 'lamb', 4, 2), P('trough1', 'trough', 1, 5), P('goat1', 'goat', 5, 0, 'v'), P('cow1', 'cow', 1, 4), P('goat2', 'goat', 1, 1), P('goat3', 'goat', 3, 1), P('hay1', 'hay', 1, 2, 'v'), P('cow2', 'cow', 4, 3, 'v'),
  ] },
  /* L4 · 9 moves: two cows lie across, two kohanim with baskets */
  4: { w: 6, h: 6, exitRow: 2, level: 4, name: 'שני כהנים', optimal: 9, pieces: [
    P('lamb', 'lamb', 4, 2), P('cow1', 'cow', 1, 1), P('cow2', 'cow', 0, 4), P('goat1', 'goat', 5, 3, 'v'), P('kohen1', 'kohen', 4, 4, 'v'), P('goat2', 'goat', 0, 1, 'v'), P('kohen2', 'kohen', 0, 3), P('goat3', 'goat', 3, 2, 'v'), P('hay1', 'hay', 3, 4, 'v'),
  ] },
  /* L5 · 11 moves: a crowded pen — the trough stands upright by the wall */
  5: { w: 6, h: 6, exitRow: 2, level: 5, name: 'דיר צפוף', optimal: 11, pieces: [
    P('lamb', 'lamb', 4, 2), P('goat1', 'goat', 2, 5), P('kohen1', 'kohen', 0, 4), P('hay1', 'hay', 2, 4), P('kohen2', 'kohen', 4, 4, 'v'), P('goat2', 'goat', 3, 3), P('goat3', 'goat', 2, 0, 'v'), P('hay2', 'hay', 3, 1, 'v'), P('cow1', 'cow', 5, 3, 'v'), P('goat4', 'goat', 0, 5), P('trough1', 'trough', 1, 1, 'v'),
  ] },
  /* L6 · 12 moves: four cows */
  6: { w: 6, h: 6, exitRow: 2, level: 6, name: 'ארבע פרות', optimal: 12, pieces: [
    P('lamb', 'lamb', 4, 2), P('cow1', 'cow', 1, 1), P('hay1', 'hay', 1, 2, 'v'), P('cow2', 'cow', 2, 5), P('goat1', 'goat', 0, 1, 'v'), P('kohen1', 'kohen', 3, 2, 'v'), P('cow3', 'cow', 0, 0), P('cow4', 'cow', 1, 4), P('goat2', 'goat', 0, 5), P('hay2', 'hay', 5, 0, 'v'), P('hay3', 'hay', 0, 3, 'v'),
  ] },
};
export const HAND_MAX = 6;
/** the level to play: hand-authored for 1–6, generated from 7 on (both deterministic by seed) */
export function puzzle(level = 1, seed = 1) {
  level = Math.max(1, level | 0);
  if (level <= HAND_MAX) { const L = HAND[level]; return Object.assign({}, L, { seed, pieces: L.pieces.map((p) => Object.assign({}, p)) }); }
  return generate(level, seed);
}
