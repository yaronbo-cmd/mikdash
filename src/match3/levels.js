/* ─────────────────────────────────────────────────────────────────────────────
 * levels.js: the three fields, the 15-level tutorial ladder and the procedural levels of "משחק האוצר".
 *
 *   FIELDS                         → { quarry:{he, res, …}, forest, gold }
 *   levelSpec(field, level, o)     → the engine spec { field, rows, colors, moves, goals, obj, coin, stars, … } (calibrated)
 *   levelInfo(field, level, o)     → { field, level, moves, colors, goals, yields, hint, hard, minutes, stars, teach }
 *   difficulty(level)              → 0…1.3 (monotonic base curve; hard levels and breathers ride on it)
 *
 * Layouts are made by rule (hand-chosen parameters for 1–15, a difficulty model for 16+), mirrored left–right so a board
 * reads as designed. Goal counts and star scores are calibrated by the bot on the level's own board seed: the bot plays
 * the board many times with different "hands"; the goal is the count it reaches in `target` of those games.
 * Texts that state facts are drafts (טיוטה) with a source.
 * ──────────────────────────────────────────────────────────────────────────── */
import { createBoard, resolve, botMove, reshuffle, hasMove, hashSeed } from './engine.js';

export const FIELDS = {
  quarry: {
    id: 'quarry', he: 'המחצבה', res: 'stone', resHe: 'אבנים', blkHe: 'סלע', objHe: 'אבן גזית',
    blurb: 'חוצבים אבני גזית מן הסלע, כמו במחצבות של ירושלים.',
    fact: 'ברמת שלמה, צפונית להר הבית, נמצאה מחצבה מימי הבית השני ובה גושים ארוכים עד כשמונה מטרים.', srcShort: 'רשות העתיקות, 2007',
    src: 'ארכיאולוגיה: מחצבות אבן בירושלים מימי בית שני (למשל רמת שלמה); טיוטה', illus: false,
  },
  forest: {
    id: 'forest', he: 'יער הלבנון', res: 'cedar', resHe: 'ארזים', blkHe: 'ארז', objHe: 'קורת ארז',
    blurb: 'כורתים ארזים ומורידים אותם אל הים, אל יפו.',
    fact: 'לבניין הבית השני הביאו עצי ארזים מן הלבנון בים עד יפו, ותמורתם נתנו לצורים ולצידונים מאכל, משקה ושמן.', srcShort: 'עזרא ג, ז',
    src: 'עזרא ג, ז: עצי ארזים מן הלבנון אל ים יפו (פרפרזה; טיוטה)', illus: false,
  },
  gold: {
    id: 'gold', he: 'מכרה הזהב', res: 'gold', resHe: 'זהב', blkHe: 'עפרה', objHe: 'גוש זהב',
    blurb: 'חופרים בעפר ומוצאים גושי זהב; מן העפרה — נחושת.',
    fact: 'אין מקור למכרות זהב בארץ ישראל. הזהב בא מנדבות — עלה, גרגר או אשכול לגפן — וממתנות מלכים, כמו נברשת הזהב של הילני.', srcShort: 'מדות ג, ח; עזרא ח, כה–כו; יומא ג, י',
    src: 'המחשה: אין מקור למכרות זהב בארץ ישראל; זהב המקדש בא מנדבות וממתנות מלכים (מדות ג, ח; עזרא ח, כה–כו; יומא ג, י) (טיוטה)', illus: true, label: 'המחשה',
  },
};
export const FIELD_IDS = ['quarry', 'forest', 'gold'];
export const RES_HE = { stone: 'אבנים', cedar: 'ארזים', gold: 'זהב', silver: 'כסף', bronze: 'נחושת', wstone: 'אבנים שלמות' };

/* ── the tutorial ladder: one mechanic per level (the same ladder in each field's materials) ── */
const HINT = {
  match: { quarry: 'החלף שני כלים סמוכים: שלושה זהים ליד סלע או ליד אבן גזית — ונחצבות אבנים.',
    forest: 'שלושה זהים ליד ארז — והוא נכרת. קורת ארז שמגיעה לתחתית צפה לים יפו.',
    gold: 'שלושה זהים על העפר — חופרים. התאמה ליד גוש זהב אוספת אותו.' },
  tool: 'ארבעה בשורה יוצרים כלי עבודה: מקבת מנקה שורה, אזמל — טור. הם פועלים רק על אבן, עפר ועץ.',
  wedge: 'צורת ר או ט (L/T) יוצרת יתד — מבקע את הסלע סביבו.',
  layers: 'יש שכבות כפולות: פוגעים בהן פעמיים.',
  deep: 'השכבות עמוקות: שמור את הכלים והיתדות לסלע הקשה.',
  light: 'חמישה בשורה — אור המנורה: אוסף את כל הכלים מסוג אחד.',
  combo: 'החלף שני כלים מיוחדים זה עם זה — יחד הם חזקים פי כמה.',
  silver: 'שקלי כסף רוכבים על חלק מן הכלים — התאמה אוספת אותם.',
  field: { quarry: 'סלע האם עבה: שלוש שכבות. השתמש בכלים!',
    forest: 'גפן אוחזת בכלי ולא נותנת לו לזוז — התאמה עליו משחררת אותו.',
    gold: 'עפרת נחושת: כל שכבה שנשברת נותנת נחושת לבית המקדש.' },
  shape: 'לוח בצורה חדשה: הכלים נופלים דרך הפתחים.',
  lighttool: 'אור + כלי: כל הכלים מאותו סוג הופכים לכלים — ופועלים יחד.',
  six: 'החצוצרות מצטרפות: שישה סוגי כלים, וקשה יותר למצוא התאמות.',
  hard: 'שלב קשה! תכנן כמה מהלכים קדימה.',
  mix: 'הכול ביחד: כלים, יתדות ואור.',
  exam: 'שלב המבחן של השדה — בהצלחה!',
};
// hand-chosen parameters per tutorial level. blk: [pairs, max layers, zone] · earth: [row0, row1, layers, nugget pairs]
const TUT = [
  { teach: 'match', moves: 30, blk: [5, 1, 'bottom'], earth: [5, 7, 1, 2], every: 8, target: 0.97 },
  { teach: 'tool', moves: 30, blk: [6, 1, 'band'], earth: [3, 6, 1, 2], every: 8, target: 0.97 },
  { teach: 'wedge', moves: 31, blk: [6, 1, 'cluster'], earth: [3, 7, 1, 3], every: 8, target: 0.96 },
  { teach: 'layers', moves: 31, blk: [5, 2, 'band'], earth: [2, 7, 2, 3], every: 9, target: 0.96 },
  { teach: 'light', moves: 32, blk: [5, 2, 'pillars'], earth: [2, 7, 2, 3], every: 9, target: 0.95 },
  { teach: 'combo', moves: 32, blk: [6, 2, 'scatter'], earth: [2, 7, 1, 4], every: 9, target: 0.95 },
  { teach: 'silver', moves: 33, blk: [6, 2, 'bottom'], earth: [3, 7, 2, 3], every: 9, coin: 0.07, target: 0.95 },
  { teach: 'field', moves: 33, blk: [6, 3, 'band'], earth: [2, 7, 2, 4], every: 9, vine: 4, ore: 3, target: 0.94 },
  { teach: 'shape', moves: 33, shape: 'diamond', blk: [6, 2, 'scatter'], earth: [2, 6, 2, 4], every: 9, vine: 3, target: 0.94 },
  { teach: 'lighttool', moves: 35, blk: [7, 2, 'pillars'], earth: [2, 7, 2, 4], every: 10, vine: 4, coin: 0.04, target: 0.94 },
  { teach: 'six', moves: 37, colors: 6, blk: [6, 1, 'bottom'], earth: [3, 7, 1, 3], every: 9, target: 0.9 },
  { teach: 'hard', moves: 35, shape: 'arch', blk: [7, 3, 'band'], earth: [1, 7, 2, 4], every: 11, vine: 4, ore: 2, hard: true, target: 0.8 },
  { teach: 'mix', moves: 35, shape: 'corners', blk: [6, 2, 'scatter'], earth: [2, 7, 2, 4], every: 10, vine: 3, coin: 0.04, target: 0.9 },
  { teach: 'deep', moves: 37, blk: [7, 3, 'top'], earth: [1, 7, 2, 5], every: 10, vine: 5, ore: 3, target: 0.88 },
  { teach: 'exam', moves: 37, colors: 6, shape: 'twin', blk: [7, 2, 'band'], earth: [2, 7, 2, 4], every: 10, vine: 4, ore: 2, target: 0.85 },
];
export const TUTORIAL = TUT.length;

/* board shapes (8 columns × 9 rows; '#' = a hole). Every column keeps a lowest cell, so logs can reach the sea. */
const SHAPES = {
  full: [],
  corners: ['#......#', '', '', '', '', '', '', '', '#......#'],
  diamond: ['##....##', '#......#', '', '', '', '', '', '#......#', '##....##'],
  arch: ['###..###', '#......#'],
  twin: ['', '', '', '...##...', '...##...', '...##...'],
  pillars: ['', '', '.#....#.', '', '', '', '.#....#.'],
  hourglass: ['', '', '#......#', '##....##', '##....##', '##....##', '#......#'],
  cross: ['##....##', '##....##', '', '', '', '', '', '##....##', '##....##'],
};
const SHAPE_CYCLE = ['full', 'corners', 'pillars', 'diamond', 'full', 'twin', 'arch', 'hourglass', 'full', 'cross'];

/* ── the difficulty model ── */
export function difficulty(level) {
  if (level <= TUT.length) return 0.1 + 0.3 * (level - 1) / (TUT.length - 1);             // 0.10 … 0.40
  return Math.min(1.3, 0.4 + 0.9 * Math.log1p((level - TUT.length) / 12) / Math.log1p(65 / 12));   // 0.40 → 1.3 (level 80+)
}
export const isHard = (level) => level > TUT.length && level % 7 === 0;
export const isBreather = (level) => level > TUT.length && level % 7 === 1;
export function targetWin(level) {
  if (level <= TUT.length) return TUT[level - 1].target;
  const d = difficulty(level);
  if (isHard(level)) return 0.6;
  if (isBreather(level)) return 0.88;
  return Math.max(0.64, 0.8 - 0.14 * (d - 0.4) / 0.9);
}
function genParams(level) {
  const d = difficulty(level), L = level, rng = mul(hashSeed('gp', L));
  const hard = isHard(L), easy = isBreather(L);
  const pick = (a) => a[(rng() * a.length) | 0];
  const q = hard ? 1.25 : easy ? 0.75 : 1;
  return {
    teach: hard ? 'hard' : 'gen',
    moves: Math.round(31 + 7 * Math.min(1, d) + (hard ? 2 : 0)),
    colors: easy ? 5 : (L >= 22 && (L % 3 !== 0 || L >= 40)) ? 6 : 5,
    shape: easy ? 'full' : SHAPE_CYCLE[L % SHAPE_CYCLE.length],
    blk: [Math.min(10, Math.round((5 + 4 * d) * q)), Math.min(3, 1 + Math.round(2 * d * q)), pick(['bottom', 'band', 'pillars', 'scatter', 'cluster', 'top'])],
    earth: [pick([1, 2, 3]), 7, d * q > 0.7 ? 2 : pick([1, 2]), Math.min(6, 3 + Math.round(3 * d))],
    every: Math.round(9 + 3 * Math.min(1, d) * q),
    vine: Math.round(Math.min(8, 2 + 5 * d) * q),
    ore: Math.round(1 + 3 * d),
    coin: 0.03 + 0.03 * rng(),
    hard, target: targetWin(L),
  };
}

/* ── the layout builder ── */
function mul(seed) {
  let r = seed >>> 0;
  return () => { r = (r + 0x6D2B79F5) >>> 0; let t = Math.imul(r ^ (r >>> 15), r | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
function layout(field, P, rng) {
  const R = 9, C = 8, H = C / 2;
  const g = [];
  const sh = SHAPES[P.shape || 'full'] || [];
  for (let r = 0; r < R; r++) { g.push([]); for (let c = 0; c < C; c++) g[r].push((sh[r] && sh[r][c] === '#') ? '#' : '.'); }
  const free = (r, c) => r >= 0 && r < R && c >= 0 && c < C && g[r][c] === '.';
  const put = (r, c, ch) => { g[r][c] = ch; g[r][C - 1 - c] = ch; };
  const cand = (zone) => {
    const out = [];
    for (let r = 1; r < R; r++) for (let c = 0; c < H; c++) {
      if (!free(r, c)) continue;
      const ok = zone === 'bottom' ? r >= R - 2 : zone === 'band' ? r === 3 || r === 4 : zone === 'pillars' ? (c === 1 || c === 2) && r >= 3
        : zone === 'top' ? r === 1 || r === 2 : zone === 'cluster' ? r >= 3 && r <= 5 && c >= 1 : r >= 2;
      if (ok) out.push([r, c]);
    }
    return out;
  };
  const place = (n, zone, ch) => {
    let pool = cand(zone);
    if (pool.length < n) pool = pool.concat(cand('scatter'));
    if (field === 'forest') pool = pool.filter(([r]) => r < R - 2);   // the shore stays open: logs reach the sea
    for (let q = 0; q < n && pool.length; q++) {
      const j = (rng() * pool.length) | 0, [r, c] = pool.splice(j, 1)[0];
      if (!free(r, c)) { q--; continue; }
      put(r, c, typeof ch === 'function' ? ch() : ch);
    }
  };
  let [bn, bl, bz] = P.blk || [0, 1, 'bottom'];
  if (field === 'forest') { bz = bz === 'bottom' ? 'scatter' : bz; bl = Math.min(3, bl + 1); bn = Math.max(3, bn - 2); }   // fewer, older cedars: the logs are the steady work   // fewer, older cedars up the slope; the logs need an open way down
  const layer = () => String(1 + Math.min(bl - 1, (rng() * bl) | 0));
  if (field === 'gold') {
    // ore rock (a side yield of bronze) from the "field" level on; earth over the lower board; nuggets under it
    const [r0, r1, el, np] = P.earth;
    if (P.ore) place(P.ore, bz === 'bottom' ? 'band' : bz, layer);
    const cells = [];
    for (let r = r0; r <= (r1 >= 7 ? R - 1 : r1); r++) for (let c = 0; c < H; c++) if (free(r, c)) cells.push([r, c]);
    for (const [r, c] of cells) put(r, c, el === 2 && rng() < 0.55 ? 'E' : 'e');
    for (let q = 0; q < np && cells.length; q++) {
      const [r, c] = cells.splice((rng() * cells.length) | 0, 1)[0];
      put(r, c, g[r][c] === 'E' ? 'N' : 'n');
    }
  } else {
    place(bn, bz, layer);
    if (field === 'forest' && P.vine) place(Math.ceil(P.vine / 2), 'scatter', 'v');
  }
  // objects waiting at the start (ashlars / logs) in the top rows
  { const c = 1 + ((rng() * 2) | 0); if (free(0, c)) put(0, c, 'a'); }
  if (P.coin) place(1, 'top', 's');
  return g.map((row) => row.join(''));
}

/* ── the spec of a level (uncalibrated) ── */
function rawSpec(field, level, o = {}) {
  let P = level <= TUT.length ? TUT[level - 1] : genParams(level);
  // (wave 7, FUN) a gold board played for bronze (Nikanor's doors, the kiyor) always carries copper ore — before, gold levels
  // 1–7 had none, so a bronze step sent the player to boards that could never pay it (loop-sim: ten gold boards in a row)
  const oreNeed = field === 'gold' && o.need && o.need.bronze > 0;
  if (oreNeed) { const [bn, bl, bz] = P.blk || [0, 1, 'bottom'], e = P.earth || [3, 7, 1, 2]; P = { ...P, ore: Math.max(P.ore || 0, 8), blk: [bn, Math.max(2, bl), bz], earth: [e[0], e[1], e[2], Math.max(1, (e[3] | 0) - 2)] }; }   // the copper is the goal; fewer nuggets
  const rng = mul(hashSeed('lay', field, level));
  const f = FIELDS[field] ? field : 'quarry';
  const spec = {
    field: f, level, teach: P.teach, hard: !!P.hard, target: P.target,
    rows: layout(f, P, rng), colors: P.colors || 5, moves: P.moves, coin: P.coin || 0.015,
  };
  const wst = f === 'quarry' && o.need && o.need.wstone > 0;
  const kind = f === 'forest' ? 'log' : f === 'gold' ? 'nugget' : wst ? 'wstone' : 'ashlar';
  spec.obj = { kind, total: 99, max: kind === 'log' ? 4 : 3, every: kind === 'log' ? Math.max(3, (P.every || 10) - 5) : P.every || 10 };
  const main = wst ? 'wstone' : oreNeed ? 'bronze' : FIELDS[f].res;
  spec.goals = [{ t: main }];
  if (f === 'forest') spec.goals.push({ t: 'log' });                // bring the logs down to the sea (the level's clock)
  return spec;
}

/* ── the bot calibration (memoised): goals at the target win rate; star scores from the winning games ── */
const SIMS = 20, SKILL = 0.55, FIN = 660;       // SKILL 0.55 ≈ FUN's Maya (15)         // FIN ≈ the finale's points per move left (measured by the bot test)
// the owner's "at least three minutes": a typical player (Maya, 6.5 s a move) should need ≥ MIN_USED moves to reach the goal
// (≈ 2.8 min + the cards ≈ 3 min); where the plain calibration ends sooner, the main goal and the moves grow together, the win
// rate kept. The first session's three quarry boards are left as FUN measured them (L1 ≈ 2:55 with its cards).
const MIN_USED = 26, EXTRA = 12, MAX_MOVES = 40;
/* (FUN12, wave 12) the quarry's cycle brings the board back after other games, longer and harder: round r (1, 2) adds ROUND_MOVES
   moves a round and lowers the win target a little, and the goal is calibrated for them — a longer goal, a bigger pay */
export const ROUND_MOVES = 4, ROUND_MAX = 2;
const memo = new Map();
export function calibrate(spec, seed, sims = SIMS) {
  const res = [], goalsT = spec.goals.map((g) => g.t), M0 = spec.moves;
  const floor = !(spec.field === 'quarry' && spec.level <= 3);
  const long = floor ? Math.max(M0, Math.min(MAX_MOVES + ROUND_MOVES * (spec.round | 0), M0 + EXTRA)) : M0;
  for (let q = 0; q < sims; q++) {
    const s = createBoard(Object.assign({}, spec, { goals: [], moves: long }), seed);
    const rnd = mul(hashSeed('hand', seed, q));
    const trace = [];                    // per move: [score, moves left, tallies…]
    for (let guard = 0; s.moves > 0 && guard < 200; guard++) {
      const m = botMove(s, SKILL, rnd);
      if (!m) { reshuffle(s); if (!hasMove(s)) break; continue; }
      resolve(s, m[0], m[1], false);
      trace.push([s.score, s.moves, ...goalsT.map((t) => s.t[t] || 0)]);
    }
    res.push(trace);
  }
  const target = spec.target || 0.8;
  const rowAt = (tr, M) => (tr.length ? tr[Math.min(tr.length, M) - 1] : null);
  const finals = (gi, M) => res.map((tr) => { const r = rowAt(tr, M); return r ? r[2 + gi] : 0; }).sort((a, b) => a - b);
  const quant = (arr, p) => arr[Math.max(0, Math.min(arr.length - 1, Math.floor(p * arr.length)))];
  // a normal fit is steadier in the tail than an order statistic of 16 games
  const Z = (p) => { const t = Math.sqrt(-2 * Math.log(1 - p)); return t - (2.515517 + 0.802853 * t + 0.010328 * t * t) / (1 + 1.432788 * t + 0.189269 * t * t + 0.001308 * t * t * t); };
  const goals = spec.goals.map((g, gi) => {
    const f = finals(gi, M0), m = f.reduce((a, b) => a + b, 0) / f.length;
    const sd = Math.sqrt(f.reduce((a, b) => a + (b - m) * (b - m), 0) / Math.max(1, f.length - 1));
    const tg = gi ? Math.min(0.97, target + 0.05) : target;
    const n = Math.floor(tg >= 0.9 ? Math.min(quant(f, 1 - tg), m - Z(tg) * sd) : quant(f, 1 - tg));   // the tail by a normal fit; the body by the quantile
    return { t: g.t, n: Math.max(gi ? 1 : 4, n) };
  });
  // the joint rate: lower the main goal until enough games reach every goal
  const winsAt = (M) => res.filter((tr) => { const r = rowAt(tr, M); return r && goals.every((g, gi) => r[2 + gi] >= g.n); }).length / res.length;
  while (goals.length > 1 && winsAt(M0) < target) goals.pop();          // a second goal this board cannot give reliably is dropped
  for (let guard = 0; guard < 40 && winsAt(M0) < target && goals[0].n > 4; guard++) goals[0].n = Math.floor(goals[0].n * 0.95);
  // the three-minute floor: the typical player's moves to the goal (median) ≥ MIN_USED
  let M = M0;
  const reach = (tr) => { const i = tr.findIndex((row) => goals.every((g, gi) => row[2 + gi] >= g.n)); return i < 0 ? 1e9 : i + 1; };
  const med = () => { const a = res.map(reach).sort((x, y) => x - y); return a[Math.floor(a.length / 2)]; };
  for (let guard = 0; floor && guard < 80 && med() < MIN_USED; guard++) {
    const prev = goals[0].n, pm = M;
    goals[0].n = Math.max(prev + 1, Math.round(prev * 1.03));
    while (M < long && winsAt(M) < target) M++;
    if (winsAt(M) < target) { goals[0].n = prev; M = pm; break; }
  }
  // winning scores: the score when the goals were first met + the finale's estimate for the moves left
  const ws = [];
  for (const tr of res) {
    const at = reach(tr);
    if (at <= M) ws.push(tr[at - 1][0] + FIN * (M - at));
  }
  ws.sort((a, b) => a - b);
  const r10 = (x) => Math.max(100, Math.round(x / 100) * 100);
  const stars = ws.length ? [0, r10(quant(ws, 0.35)), r10(quant(ws, 0.75))] : [0, 3000, 6000];
  if (stars[2] <= stars[1]) stars[2] = stars[1] + 500;
  const main = finals(0, M);
  return { goals, stars, yields: [quant(main, 0.1), quant(main, 0.9)], rate: winsAt(M), moves: M };
}

export function levelSeed(field, level) { return hashSeed('m3', field, level); }
export function levelSpec(field, level, o = {}) {
  level = Math.max(1, level | 0);
  const f = FIELDS[field] ? field : 'quarry';
  const wst = f === 'quarry' && o.need && o.need.wstone > 0 ? 1 : 0;
  const ore = f === 'gold' && o.need && o.need.bronze > 0 ? 1 : 0;
  const rd = Math.max(0, Math.min(ROUND_MAX, o.round | 0));
  const key = f + ':' + level + ':' + wst + ':' + ore + (rd ? ':r' + rd : '');
  const seed = o.seed != null ? o.seed >>> 0 : levelSeed(f, level);
  if (memo.has(key) && o.seed == null) return Object.assign({}, memo.get(key));
  const spec = rawSpec(f, level, o);
  if (rd) { spec.moves += ROUND_MOVES * rd; spec.target = Math.max(0.6, (spec.target || 0.8) - 0.03 * rd); spec.round = rd; }
  const cal = calibrate(spec, seed);
  spec.goals = cal.goals;
  spec.moves = cal.moves;
  spec.stars = cal.stars;
  spec.yields = cal.yields;
  spec.seed = seed;
  spec.calRate = cal.rate;
  if (o.seed == null) memo.set(key, spec);
  return Object.assign({}, spec);
}
export function hintOf(field, level) {
  if (level > TUT.length) return isHard(level) ? HINT.hard : '';
  const h = HINT[TUT[level - 1].teach];
  return typeof h === 'string' ? h : (h && h[field]) || '';
}
export function levelInfo(field, level, o = {}) {
  const sp = levelSpec(field, level, o);
  const res = sp.goals[0].t;
  return {
    field: sp.field, level: sp.level, moves: sp.moves, colors: sp.colors, goals: sp.goals.map((g) => ({ t: g.t, n: g.n })),
    yields: { [res]: sp.yields.slice() }, hint: hintOf(sp.field, sp.level), hard: sp.hard, teach: sp.teach,
    minutes: Math.round(sp.moves * 6.5 / 60 * 10) / 10, stars: sp.stars.slice(), diff: difficulty(sp.level),
  };
}
