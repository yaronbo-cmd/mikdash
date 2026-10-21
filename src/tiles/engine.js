/* ─────────────────────────────────────────────────────────────────────────────
 * tiles/engine.js: the pure engine of "זיכרון המקדש" (the Temple memory tile-flip). No DOM; deterministic by seed.
 *
 *   const s = deal(level, seed);        // a face-down board: 4×3 (L1) · 5×4 (L2) · 6×4 (L3) · 6×5 (L4+)
 *   flip(s, i)      → { s, ev }         // ev: 'flip' · 'match' {a, b, gain, streak} · 'miss' {a, b} · 'noop'
 *   settle(s)       → s                 // after a miss (the UI waited ~0.7 s): the two tiles go face down
 *   undo(s)         → { s, pair }       // cancels the last miss (one per round): the miss and the streak come back
 *   hint(s)         → { s, pair }       // two tiles that match (two per round)
 *   shuffle(s)      → s                 // the unmatched tiles change places; the matched ones stay
 *   isWon(s) · stars(s, ms) · gain(streak, level) · LEVELS · PICS · timeLimit(level)
 *
 * Every function returns a NEW state (the old one is never mutated), so the UI can keep the previous one for undo/peek.
 * Pairs are either two identical pictures or (from level 3) a picture and its Hebrew name card ("connected" pairs):
 * two tiles match when their `pic` is the same, whatever their `kind`.
 * ──────────────────────────────────────────────────────────────────────────── */

/* the pictures (drawn in art.js; the Hebrew names are drafts — docs/TILES35.md has a source line for each) */
export const PICS = ['menorah', 'incense', 'laver', 'table', 'lamb', 'logs', 'basket', 'jug', 'salt', 'shofar', 'trumpets', 'pomegranate', 'moked', 'cap', 'harp', 'ramp'];
export const PIC_HE = {
  menorah: 'המנורה', incense: 'מזבח הקטורת', laver: 'הכיור', table: 'שולחן הפנים', lamb: 'כבש התמיד', logs: 'גזרי עצים',
  basket: 'סל ביכורים', jug: 'פך השמן', salt: 'מלח', shofar: 'שופר', trumpets: 'חצוצרות', pomegranate: 'רימון',
  moked: 'מדורת המוקד', cap: 'מגבעת הכהן', harp: 'נבל', ramp: 'כבש המזבח',
};
/* the grid per level (level 5+ keeps 6×5 and adds connected pairs) */
export const LEVELS = [null, { cols: 4, rows: 3 }, { cols: 5, rows: 4 }, { cols: 6, rows: 4 }, { cols: 6, rows: 5 }];
export const MAX_LEVEL = 4;
export const HINTS = 2, UNDOS = 1;
export const BASE = 2, STREAK_BONUS = 5;     // פרוטות: +2 a pair, +5 when the streak is 2 or more, × level

export function gridOf(level) {
  const L = LEVELS[Math.min(MAX_LEVEL, Math.max(1, level | 0))];
  return { cols: L.cols, rows: L.rows, pairs: (L.cols * L.rows) / 2 };
}
/* how many of the pairs are picture + name card: none up to level 2, a third at 3, half at 4, two thirds from 5 */
export function connectedOf(level, pairs) {
  const f = level <= 2 ? 0 : level === 3 ? 1 / 3 : level === 4 ? 1 / 2 : 2 / 3;
  return Math.floor(pairs * f);
}
/* a generous clock: 20 s + 9 s a pair (L1 1:14 · L2 1:50 · L3 2:08 · L4 2:35). It is never the point; running out is a free retry. */
export function timeLimit(level) { const { pairs } = gridOf(level); return 20000 + pairs * 9000; }
export const gain = (streak, level) => (BASE + (streak >= 2 ? STREAK_BONUS : 0)) * Math.max(1, level | 0);

/* ── seeded random (mulberry32) ── */
export function hashSeed(...parts) {
  let h = 2166136261 >>> 0;
  for (const p of parts) for (const ch of String(p)) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619) >>> 0; }
  return h || 1;
}
function rnd(s) {
  let t = (s.rs = (s.rs + 0x6D2B79F5) >>> 0);
  t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
}
const shuffleArr = (s, arr) => { for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(rnd(s) * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; } return arr; };
const clone = (s) => Object.assign({}, s, { tiles: s.tiles.map((t) => Object.assign({}, t)), open: s.open.slice(), pending: s.pending ? s.pending.slice() : null, last: s.last ? Object.assign({}, s.last) : null });

/** a fresh face-down board for (level, seed) — the same arguments always give the same board */
export function deal(level = 1, seed = 1) {
  level = Math.max(1, level | 0);
  const { cols, rows, pairs } = gridOf(level);
  const s = { level, cols, rows, pairs, n: cols * rows, rs: (seed >>> 0) || 1, seed: (seed >>> 0) || 1 };
  const pics = shuffleArr(s, PICS.slice()).slice(0, pairs);
  const conn = connectedOf(level, pairs);
  const tiles = [];
  pics.forEach((pic, j) => {
    tiles.push({ pic, kind: 'pic', up: false, done: false });
    tiles.push({ pic, kind: j < conn ? 'name' : 'pic', up: false, done: false });
  });
  shuffleArr(s, tiles);
  return Object.assign(s, {
    tiles, open: [], pending: null, last: null,
    matches: 0, misses: 0, streak: 0, bestStreak: 0, perutot: 0, flips: 0,
    hints: HINTS, undos: UNDOS, limit: timeLimit(level), won: false,
  });
}
export const canFlip = (s, i) => !s.won && !s.pending && i >= 0 && i < s.n && !s.tiles[i].done && !s.tiles[i].up && s.open.length < 2;

/** the player taps tile i */
export function flip(s0, i) {
  if (!canFlip(s0, i)) return { s: s0, ev: 'noop' };
  const s = clone(s0);
  s.tiles[i].up = true; s.open.push(i); s.flips++;
  if (s.open.length < 2) return { s, ev: 'flip', i };
  const [a, b] = s.open;
  if (s.tiles[a].pic === s.tiles[b].pic) {
    s.tiles[a].done = s.tiles[b].done = true;
    s.open = []; s.matches++; s.streak++; s.bestStreak = Math.max(s.bestStreak, s.streak);
    const g = gain(s.streak, s.level); s.perutot += g;
    s.won = s.matches >= s.pairs;
    return { s, ev: 'match', a, b, gain: g, streak: s.streak, won: s.won };
  }
  s.last = { a, b, streak: s.streak };
  s.misses++; s.streak = 0; s.pending = [a, b];
  return { s, ev: 'miss', a, b };
}
/** after a miss: the two tiles go face down (the UI calls this when its flip-back is due) */
export function settle(s0) {
  if (!s0.pending) return s0;
  const s = clone(s0);
  for (const i of s.pending) s.tiles[i].up = false;
  s.pending = null; s.open = [];
  return s;
}
/** cancels the last miss: the miss and the streak come back; the two tiles are returned for a short peek */
export function undo(s0) {
  if (!s0.last || s0.undos <= 0 || s0.won) return { s: s0, pair: null };
  const s = settle(s0);
  const r = clone(s);
  r.misses = Math.max(0, r.misses - 1); r.streak = r.last.streak; r.undos--;
  const pair = [r.last.a, r.last.b]; r.last = null;
  return { s: r, pair };
}
/** two tiles that match, chosen by the seed (two hints a round, free) */
export function hint(s0) {
  if (s0.hints <= 0 || s0.won) return { s: s0, pair: null };
  const s = clone(s0);
  const left = {};
  s.tiles.forEach((t, i) => { if (!t.done) (left[t.pic] = left[t.pic] || []).push(i); });
  const pics = Object.keys(left).filter((p) => left[p].length === 2 && !(s.open.length === 1 && left[p].includes(s.open[0])));
  const all = pics.length ? pics : Object.keys(left).filter((p) => left[p].length === 2);
  if (!all.length) return { s: s0, pair: null };
  const pick = all[Math.floor(rnd(s) * all.length)];
  s.hints--;
  return { s, pair: left[pick].slice() };
}
/** the unmatched tiles change places (the matched stay where they are); open tiles go face down, no penalty */
export function shuffle(s0) {
  if (s0.won) return s0;
  const s = clone(settle(s0));
  const idx = []; s.tiles.forEach((t, i) => { if (!t.done) idx.push(i); });
  const order = shuffleArr(s, idx.slice());
  const moved = idx.map((i) => s.tiles[i]);
  order.forEach((to, q) => { s.tiles[to] = Object.assign({}, moved[q], { up: false }); });
  s.open = []; s.last = null;      // the remembered miss no longer points at the same places
  return s;
}
export const isWon = (s) => s.matches >= s.pairs;
/** 1–3 stars by misses and time: a kind scale (the clock is never the point) */
export function stars(s, ms) {
  if (!isWon(s)) return 0;
  const tr = s.limit > 0 ? ms / s.limit : 0, mr = s.misses / Math.max(1, s.pairs);
  if (mr <= 0.75 && tr <= 0.7) return 3;
  if (mr <= 1.5 && tr <= 1) return 2;
  return 1;
}
export const fmtTime = (ms) => { const t = Math.max(0, Math.round(ms / 1000)); return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`; };
