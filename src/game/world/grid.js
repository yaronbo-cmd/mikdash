/* ── build 115 ── world/grid.js — the Mount's address grid and the address book of stage 01 (ירון 10.11: "העולם צריך להיות מחולק
 * לנ.צ מדויקים קודם כול"; spec "שלב 01: רשת נ.צ ואפיון", approved 10.11; docs/specs/build115-brief.md).
 * Pure: no three.js, no DOM. The grid is the world's order behind the scenes: it is NEVER drawn in the game (ירון 10.11: "בתוך
 * המשחקים אני בתוך העולם שלי. אין רשתות"); only the management phase's map shows it.
 *
 *   cell 25 × 25 amot · column k = floor((277 − x) / 25) from the east wall westward (א, ב, …) · row r = floor((z + 183.5) / 25) from
 *   the 500-amah square's north edge southward (1, 2, … inside it; ד1… south of it; צ1… north of it)
 *   cellOf(x, z) → { k, r } · rectOf(k, r) → { x0, x1, z0, z1, cx, cz } · nameOf(k, r) → 'יב־6' · parse(name) → { k, r } | null
 *   addr(x, z) → { cell, west, south } (amot inside the cell from its north-east corner, to half an amah)
 *   BOOK → the stage's address book (frozen; the same on every load)
 */
export const CELL = 25;
export const EAST = 277;          // mount.js PLAT.X1: the east wall's face
export const NORTH = -183.5;      // mount.js SQUARE.z0: the 500-amah square's north edge
export const SQ_N = 20;           // the square is 20 × 20 cells (Middot 2:1)

const ONES = ['', 'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט'], TENS = ['', 'י', 'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ'];
/** a Hebrew numeral (1..99), 15 and 16 as ט״ו ט״ז are written */
export function heb(n) {
  n = n | 0; if (n <= 0 || n > 99) return String(n);
  if (n === 15) return 'טו'; if (n === 16) return 'טז';
  return TENS[Math.floor(n / 10)] + ONES[n % 10];
}
const unheb = (s) => { for (let n = 1; n < 100; n++) if (heb(n) === s) return n; return 0; };

export function cellOf(x, z) { return { k: Math.floor((EAST - x) / CELL), r: Math.floor((z - NORTH) / CELL) }; }
export function rectOf(k, r) { const x1 = EAST - k * CELL, x0 = x1 - CELL, z0 = NORTH + r * CELL, z1 = z0 + CELL; return { x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2 }; }
export function rowName(r) { return r < 0 ? 'צ' + -r : r >= SQ_N ? 'ד' + (r - SQ_N + 1) : String(r + 1); }
export function nameOf(k, r) { return heb(k + 1) + '־' + rowName(r); }
export function parse(name) {
  const m = /^([א-ת]+)[־-](צ|ד)?(\d+)$/.exec(String(name || '').trim()); if (!m) return null;
  const k = unheb(m[1]) - 1, n = +m[3]; if (k < 0 || !(n >= 1)) return null;
  const r = m[2] === 'צ' ? -n : m[2] === 'ד' ? SQ_N + n - 1 : n - 1;
  return { k, r };
}
export function addr(x, z) {
  const { k, r } = cellOf(x, z), R = rectOf(k, r), h = (v) => Math.round(v * 2) / 2;
  return { cell: nameOf(k, r), k, r, west: h(R.x1 - x), south: h(z - R.z0) };
}

/** the rock cells of the 500-amah square: [k, r, highest rock over the platform's level] — every cell whose rock stands 3 amot or
 *  more over level 0 (the hill as stages.js hillY0 draws it; test/grid.test.mjs and tools/grid-probe check it against the world) */
export const ROCK_CELLS = Object.freeze([[11,2,5],[11,3,7],[11,4,6],[11,5,5],[11,6,3],[11,7,6],[11,8,5],[11,9,4],[12,0,10],[12,1,13],[12,2,15],[12,3,17],[12,4,17],[12,5,17],[12,6,16],[12,7,16],[12,8,15],[12,9,12],[12,10,5],[12,11,3],[13,0,17],[13,1,17],[13,2,24],[13,3,26],[13,4,28],[13,5,29],[13,6,26],[13,7,26],[13,8,22],[13,9,18],[13,10,12],[13,11,9],[13,12,3],[14,0,24],[14,1,28],[14,2,31],[14,3,33],[14,4,34],[14,5,33],[14,6,32],[14,7,31],[14,8,28],[14,9,23],[14,10,17],[14,11,10],[14,12,5],[15,0,28],[15,1,32],[15,2,34],[15,3,38],[15,4,39],[15,5,37],[15,6,36],[15,7,32],[15,8,30],[15,9,26],[15,10,21],[15,11,14],[15,12,9],[15,13,5],[16,0,28],[16,1,32],[16,2,35],[16,3,37],[16,4,39],[16,5,37],[16,6,36],[16,7,35],[16,8,33],[16,9,29],[16,10,23],[16,11,17],[16,12,11],[16,13,5],[17,0,26],[17,1,30],[17,2,33],[17,3,36],[17,4,38],[17,5,38],[17,6,36],[17,7,35],[17,8,33],[17,9,32],[17,10,24],[17,11,18],[17,12,10],[17,13,4],[18,0,23],[18,1,24],[18,2,26],[18,3,28],[18,4,30],[18,5,31],[18,6,34],[18,7,31],[18,8,31],[18,9,27],[18,10,22],[18,11,15],[18,12,8],[19,0,10],[19,1,11],[19,2,10],[19,3,14],[19,4,18],[19,5,22],[19,6,23],[19,7,24],[19,8,23],[19,9,18],[19,10,16],[19,11,8]].map((a) => Object.freeze(a)));

/** the nine cells the kohen cuts in stage 01, in the order of its sectors 0..8: the east column first (the rock is cut from its low
 *  edge inward), יב־6 … יד־8 */
export const KOHEN_CELLS = Object.freeze([[11, 5], [11, 6], [11, 7], [12, 5], [12, 6], [12, 7], [13, 5], [13, 6], [13, 7]].map((a) => Object.freeze(a)));

const rnd = (seed) => { let t = (seed * 2654435761) >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let q = Math.imul(t ^ (t >>> 15), 1 | t); q ^= q + Math.imul(q ^ (q >>> 7), 61 | q); return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; };
const TAU = Math.PI * 2;

/** the big rock and the five small rocks of each of the kohen's cells, and their stands: all a pure function of the cells (every
 *  rock inside its own cell, none touching another, every stand clear of every rock) */
function kohenRocks() {
  const out = [], all = [], stands = [];
  KOHEN_CELLS.forEach(([k, r], s) => {
    const R = rectOf(k, r), rn = rnd(k * 97 + r * 13 + 7);
    const a0 = rn() * TAU, d0 = 1 + rn() * 1.8, br = 5.6 + rn() * 1.0;
    const big = { x: +(R.cx + Math.cos(a0) * d0).toFixed(2), z: +(R.cz + Math.sin(a0) * d0).toFixed(2), r: +br.toFixed(2) };
    all.push({ x: big.x, z: big.z, r: big.r });
    out.push({ s, k, r, name: nameOf(k, r), rect: R, big, small: [] });
  });
  // the small rocks: round each big rock, the places with most room, inside their cell; the kohen's stand on the side with room
  const room = (x, z) => { let d = 60; for (const o of all) d = Math.min(d, Math.hypot(x - o.x, z - o.z) - o.r); return d; };
  for (const C of out) {
    const rn = rnd(C.k * 31 + C.r * 7 + 3), R = C.rect, b = C.big, cand = [];
    for (let i = 0; i < 36; i++) for (let ri = 0; ri < 4; ri++) {
      const a = (i / 36) * TAU + C.s * 0.37, rr = 1.6 + rn() * 0.45, d = b.r + 2.4 + rr + ri * 1.1;
      const x = b.x + Math.cos(a) * d, z = b.z + Math.sin(a) * d;
      if (x - rr < R.x0 + 0.6 || x + rr > R.x1 - 0.6 || z - rr < R.z0 + 0.6 || z + rr > R.z1 - 0.6) continue;
      cand.push({ x, z, r: rr, a, ri, sc: rn() * 0.5 - ri * 0.3 });
    }
    cand.sort((p, q) => q.sc - p.sc);
    for (const c of cand) {
      if (C.small.length >= 5) break;
      if (room(c.x, c.z) < c.r + 1.4) continue;
      // the stand: of 12 sides, the one with most room, 3.4 amot out from the rock's face
      let best = null, bc = -1;
      for (let q = 0; q < 12; q++) { const qa = (q / 12) * TAU, sx = c.x + Math.cos(qa) * (c.r * 0.75 + 3.4), sz = c.z + Math.sin(qa) * (c.r * 0.75 + 3.4), cl = Math.min(room(sx, sz), ...C.small.map((o) => Math.hypot(sx - o.x, sz - o.z) - o.r)); if (cl > bc) { bc = cl; best = { qa, sx, sz }; } }
      if (bc < 1.3) continue;
      if (stands.some((o) => Math.hypot(o.sx - c.x, o.sz - c.z) < c.r + 1.6)) continue;
      const o = { x: +c.x.toFixed(2), z: +c.z.toFixed(2), r: +c.r.toFixed(2), ux: +Math.cos(best.qa).toFixed(4), uz: +Math.sin(best.qa).toFixed(4), sx: +best.sx.toFixed(2), sz: +best.sz.toFixed(2) };
      C.small.push(o); all.push({ x: o.x, z: o.z, r: o.r }); stands.push(o);
    }
    // walk order: round the big rock
    C.small.sort((p, q) => Math.atan2(p.z - b.z, p.x - b.x) - Math.atan2(q.z - b.z, q.x - b.x));
    C.small.forEach((o, i) => { o.i = i; });
  }
  return out;
}

const deepFreeze = (o) => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const k of Object.keys(o)) deepFreeze(o[k]); } return o; };
function makeBook() {
  const pit = (k, r) => { const R = rectOf(k, r); return { name: nameOf(k, r), x: R.cx, z: R.cz, w: 12, d: 10, depth: 4.5 }; };
  return deepFreeze({
    cell: CELL,
    rockCells: ROCK_CELLS.map(([k, r, h]) => ({ k, r, h, name: nameOf(k, r) })),
    kohen: kohenRocks(),
    // the waste: tipped into pits down the slope east of the kohen's cells (one pit for each of the three waste works); the pile
    // where the cut cells' chips are heaped, on the slope at the east edge of his cells
    pile: { name: nameOf(10, 6), x: 9, z: -21 },
    pits: [pit(9, 6), pit(9, 5), pit(9, 7)],
    // the stone yard by the east wall, where the dressed building stones wait for the wall
    yard: { name: nameOf(2, 20), ...(({ cx, cz }) => ({ x: cx, z: cz }))(rectOf(2, 20)) },
    // the corner stone: the REAL south-east corner of the retaining wall (mount.js PLAT.X1, PLAT.Z1), the lowest ground of the
    // Mount; the two stretches of the east wall beside it for the courses (north of it)
    corner: { name: nameOf(0, 23), x: 277, z: 400 },
    courses: [{ name: nameOf(0, 22), z: 383 }, { name: nameOf(0, 21), z: 358 }],
    letters: { name: nameOf(22, 22), x: -281, z: 383 },
  });
}
export const BOOK = makeBook();
