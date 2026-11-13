/* ── build 115 ── world/grid.js — the Mount's address grid and the address book of stage 01 (ירון 10.11: "העולם צריך להיות מחולק
 * לנ.צ מדויקים קודם כול"; spec "שלב 01: רשת נ.צ ואפיון", approved 10.11; docs/specs/build115-brief.md).
 * Pure: no three.js, no DOM. The grid is the world's order behind the scenes: it is NEVER drawn in the game (ירון 10.11: "בתוך
 * המשחקים אני בתוך העולם שלי. אין רשתות"); only the management phase's map shows it.
 *
 *   cell 25 × 25 amot · column k = floor((277 − x) / 25) from the east wall westward (א, ב, …) · row r = floor((z + 183.5) / 25) from
 *   the 500-amah square's north edge southward (1, 2, … inside it; ד1… south of it; צ1… north of it)
 *   cellOf(x, z) → { k, r } · rectOf(k, r) → { x0, x1, z0, z1, cx, cz } · nameOf(k, r) → 'יב־6' · parse(name) → { k, r } | null
 *   addr(x, z) → { cell, west, south } (amot inside the cell from its north-east corner, to half an amah)
 *   BOOK → the world's one address book (frozen; the same on every load): stage 01's sectors as before, and (build 124 B, rule 65:
 *          "ספר כתובות אחד הוא הבסיס לכל העבודה") a section per stage, BOOK.s02 … BOOK.s05, each { stage, name, bounds, entries, … }:
 *          entries [{ id, kind, x, z, y?, cell, label, src }] (cell = nameOf(cellOf(x, z)); src: the source, or "המחשה"), and the
 *          stage's own tables the code reads its places from (stage 05: h120/layout.js, routes.js and model.js read BOOK.s05)
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
function kohenRocks(CELLS = KOHEN_CELLS, NS = 5, s0 = 0, all = [], stands = []) {
  const out = [];
  CELLS.forEach(([k, r], i) => { const s = s0 + i;
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
      if (C.small.length >= NS) break;
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

/** ── h116 ── (build116-brief §D: every rock cell is playable) every other rock cell of the square in the crews' order (the east columns
 *  first, each from the north), its big rock and three small rocks; the kohen's nine first and exactly as in 115 ── /h116 ── */
const OTHER_CELLS = ROCK_CELLS.filter(([k, r]) => !KOHEN_CELLS.some(([a, b]) => a === k && b === r)).map(([k, r]) => [k, r]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
function allSectors() {
  const all = [], stands = [];
  const K = kohenRocks(KOHEN_CELLS, 5, 0, all, stands);
  const O = kohenRocks(OTHER_CELLS, 3, KOHEN_CELLS.length, all, stands);
  return K.concat(O);
}
const deepFreeze = (o) => { if (o && typeof o === 'object' && !Object.isFrozen(o)) { Object.freeze(o); for (const k of Object.keys(o)) deepFreeze(o[k]); } return o; };
function makeBook() {
  const SECTORS = allSectors();
  const stages = { s02: s02(), s03: s03(), s04: s04(), s05: s05() };   // ── build 124 B ── ── /build 124 B ──
  const pit = (k, r) => { const R = rectOf(k, r); return { name: nameOf(k, r), x: R.cx, z: R.cz, w: 12, d: 10, depth: 4.5 }; };
  return deepFreeze({
    ...stages,
    cell: CELL,
    rockCells: ROCK_CELLS.map(([k, r, h]) => ({ k, r, h, name: nameOf(k, r) })),
    sectors: SECTORS,
    kohen: SECTORS.slice(0, KOHEN_CELLS.length),
    // the waste: tipped into pits down the slope east of the kohen's cells (one pit for each of the three waste works); the pile
    // where the cut cells' chips are heaped, on the slope at the east edge of his cells
    pile: { name: nameOf(10, 6), x: 9, z: -21 },
    pits: [pit(9, 6), pit(9, 5), pit(9, 7), pit(9, 4), pit(9, 8), pit(8, 6)],   // ── h116 ── (three more for the free waste works, brief §D) ── /h116 ──
    // the stone yard by the east wall, where the dressed building stones wait for the wall
    yard: { name: nameOf(2, 20), ...(({ cx, cz }) => ({ x: cx, z: cz }))(rectOf(2, 20)) },
    // the corner stone: the REAL south-east corner of the retaining wall (mount.js PLAT.X1, PLAT.Z1), the lowest ground of the
    // Mount; the two stretches of the east wall beside it for the courses (north of it)
    corner: { name: nameOf(0, 23), x: 277, z: 400 },
    courses: [{ name: nameOf(0, 22), z: 383 }, { name: nameOf(0, 21), z: 358 }],
    letters: { name: nameOf(22, 22), x: -281, z: 383 },
    // ── h116 ── the great stone "down the slope" (build116-brief §A): it lies on its rollers on the rock in יט־6 and is let down
    // west, off the rock, then turned north along the west wall's top into its course (north of the causeway's gate, z −66…−52).
    // The rock it starts on (the cells round its way, k 17..19 r 4..6) stays standing until it is down. ── /h116 ──
    great: {
      name: nameOf(18, 5), end: (({ k, r }) => nameOf(k, r))(cellOf(-298.1, -150)), x: -185.5, z: -46, endX: -298.1, endZ: -150,
      track: [[-185.5, -46], [-200, -46], [-216, -46], [-232, -46.5], [-246, -52], [-258, -63], [-270, -76], [-282, -90], [-292, -103], [-297.3, -116], [-298.1, -130], [-298.1, -150]],
      keep: [[17, 4], [17, 5], [17, 6], [18, 4], [18, 5], [18, 6], [19, 4], [19, 5], [19, 6]],
    },
  });
}
/* ───────── ── build 124 B ── the stages' sections (rule 65) ───────── */
const cellName = (x, z) => { const { k, r } = cellOf(x, z); return nameOf(k, r); };
const ent = (id, kind, x, z, label, src, more = {}) => ({ id, kind, x, z, ...(more.y != null ? { y: more.y } : {}), cell: cellName(x, z), label, src, ...(more.extra || {}) });
const ILL = 'המחשה';

/** stage 02, the Azarah's wall (h111/model.js, stakes.js, bond.js: registered here, their code not yet reading it; test/book.test.mjs
 *  holds the two equal number for number). The ring's sides, the nine stretches (the gap's middle on the side's centre line) and
 *  the bond act's stand of each (standTop: 1.4 back along the stretch, 0.4 out), the corner stakes, the gate openings. */
const S02 = {
  side: { N: { c: -70.5, n: [0, -1] }, S: { c: 70.5, n: [0, 1] }, W: { c: -190, n: [-1, 0] }, E: { c: 144, n: [1, 0] } },
  stretch: [[1, 'N', -66, 8], [2, 'N', -128, 9], [3, 'W', -42, 10], [4, 'W', 14, 10], [5, 'S', -140, 11], [6, 'S', -80, 12], [7, 'S', -118, 22], [8, 'S', -38, 22], [9, 'S', -14, 12]],
  stakes: { A: [-187, -67.5], B: [-187, 67.5], C: [0, 67.5], D: [0, -67.5] },
  // (build 125) the ring's thickness (h111/model.js H111.T) and its finished top as the world builds it (stages.js ST.wall: the
  // closing stone's course, 42.5 + a course's half height, rounded up) — the look's walls (world/look.js ringBoxes)
  ring: { T: 6, top: 44 },
  gates: [['N', -160, 'בית המוקד'], ['N', -95, 'שער הקרבן'], ['N', -38, 'שער הניצוץ'], ['S', -160, 'שער הדלק'], ['S', -118, 'שער הבכורות'], ['S', -38, 'שער המים'], ['E', 3, 'שער ניקנור']],
  // ── h126 ── (build 126, rule 65: "הכול יושב על העולם" — every other place stage 02's code used to type itself, read from here)
  // the great stones' places beside stretches 4, 6, 8 (side, along it; h111/model.js GIANT keeps their lengths)
  giant: { 4: ['W', 38], 6: ['S', -64], 8: ['S', -66] },
  // the openings' band across the wall on the north and south sides (h111/world.js holeRects: the wall's 6 and a tenth more)
  band: { N: [-73.6, -67.4], S: [67.4, 73.6] },
  // the gates' act (h111/acts2.js GATES): the court's middle, the kohen's stand, the two west slots where no gate is, the frames' yard
  // (its first token; 14 apart in fours, 12 between the rows, the second row 7 in), the carrying crew's walk, the pointing crewman and
  // where he points, the three tallies, the shot over the court (eye, target)
  gatesAct: {
    mid: [-95, 0], stand: [-95, 9], west: [[-190, -30], [-190, 30]], yard: [-126, -6], carry: [[-104, 14], [-112, 30]], point: [-84, -10], pointAt: [-95, -40],
    tally: { N: [-125, -56], S: [-125, 56], E: [-14, 0] }, shot: [[-95, 330, 72], [-95, 0, -14]],
  },
  // the closing stone's place when the world gives none (h111/acts2.js closingSlot: the west wall's outer face, course 19, at y 42.5)
  closing: [-192, -4.8],
  // the cameras: the film's shots [eye, target, seconds], the stage's opening, the night, the end's round (its middle, radius, height),
  // the stakes act's two shots ([eye with its height over the ground, target likewise, the ground's sample points])
  cam: {
    film: [[[-95, 230, 210], [-95, 10, 0], 3.0], [[-95, 60, -150], [-95, 14, -70], 2.6], [[-260, 70, 0], [-190, 20, 0], 2.4], [[-60, 60, 160], [-95, 14, 70], 2.4], [[60, 300, 260], [-60, 0, 0], 1.6]],
    intro: [[[-60, 520, 520], [-40, 0, 0]], [[-95, 260, 230], [-95, 0, 0]], [[-30, 60, -20], [-4, 0, -64]]],
    night: [[-95, 120, 150], [-95, 14, 0]],
    round: { c: [-95, 0], R: 210, y: 120 },
    stakesTop: [[-93, 150, 150], [-93, 0, 4], [-93, 0], [-93, 0]],
    stakesNorth: [[-120, 40, -40], [-60, 0, -67.5], [-120, -67], [-60, -67]],
  },
  // ── /h126 ──
};
function s02() {
  const sp = (k, at) => { const S = S02.side[k], ns = k === 'N' || k === 'S'; return { x: ns ? at : S.c, z: ns ? S.c : at, nx: S.n[0], nz: S.n[1], ux: ns ? (k === 'N' ? -1 : 1) : 0, uz: ns ? 0 : (k === 'W' ? 1 : -1) }; };
  const E = [];
  for (const [n, k, at, G] of S02.stretch) {
    const P = sp(k, at), O = { x: P.x - P.ux * (G / 2), z: P.z - P.uz * (G / 2) }, r2 = (v) => +v.toFixed(4);
    E.push(ent('stretch' + n, 'stretch', P.x, P.z, `קטע ${n} של החומה`, ILL, { extra: { side: k, at, G } }));
    E.push(ent('stand:stretch' + n, 'stand', r2(O.x + P.ux * -1.4 + P.nx * 0.4), r2(O.z + P.uz * -1.4 + P.nz * 0.4), `עמדת הכהן בקטע ${n}`, ILL));
  }
  for (const [k, [x, z]] of Object.entries(S02.stakes)) E.push(ent('stake' + k, 'stake', x, z, `יתד פינה ${k}`, 'מידות ה, א'));
  E.push(ent('stand:stakes', 'stand', S02.stakes.D[0] - 5.1, S02.stakes.D[1] + 3.9, 'עמדת הכהן ביתד הצפונית-מזרחית', ILL));
  S02.gates.forEach(([k, at, n], i) => E.push(ent('gate' + i, 'gate', at, k === 'E' ? 0 : S02.side[k].c, n, 'מידות א, ד', { extra: { side: k } })));
  // ── h126 ── the places moved into the book in build 126
  for (const [s, [k, at]] of Object.entries(S02.giant)) { const P = sp(k, at); E.push(ent('giant' + s, 'stone', P.x, P.z, `האבן הגדולה ליד קטע ${s}`, ILL, { extra: { side: k, at } })); }
  const GA = S02.gatesAct;
  E.push(ent('stand:gates', 'stand', GA.stand[0], GA.stand[1], 'עמדת הכהן בתבניות הפתחים', ILL));
  GA.west.forEach(([x, z], i) => E.push(ent('gates:west' + i, 'slot', x, z, 'מקום בלי שער בחומה המערבית', ILL)));
  E.push(ent('gates:yard', 'yard', GA.yard[0], GA.yard[1], 'תבניות הפתחים מחכות באמצע העזרה', ILL));
  E.push(ent('gates:point', 'crew', GA.point[0], GA.point[1], 'איש הצוות שמראה את הפתחים', ILL));
  E.push(ent('closing', 'stone', S02.closing[0], S02.closing[1], 'אבן הסגירה בחומה המערבית', ILL, { y: 42.5 }));
  // ── /h126 ──
  return { stage: 2, name: 'חומת העזרה', bounds: { x0: -200, x1: 150, z0: -80, z1: 80 }, side: S02.side, ring: S02.ring, stretch: S02.stretch, stakes: S02.stakes, gates: S02.gates, giant: S02.giant, band: S02.band, gatesAct: S02.gatesAct, closing: S02.closing, cam: S02.cam, entries: E };   // ── h126 ── (giant … cam) ── /h126 ──
}

/** stage 03, the soreg and the chel (h112/model.js RUNS, STEPS; registered): each run's posts (who sets each), the sighting's eye,
 *  the posts act's stand (2.4 out of the near post's line, 0.6 along the sighting), the kohen's flight of steps */
const S03 = {
  line: { E: [1, 0], N: [0, -1], S: [0, 1] },
  runs: {
    1: { posts: [[165, -31.86, 'E'], [165, -29, 'E'], [165, -26, 'E'], [165, -23, 'E'], [165, -20, 'E'], [165, -17, 'E', 'k'], [165, -14, 'E', 'k'], [165, -11, 'E', 'k'], [165, -8, 'E']], eye: [165, -22.6], dir: [0, 1], near: 4 },
    2: { posts: [[160.98, -91.5, 'N'], [165, -91.5, 'E'], [165, -88.5, 'E'], [165, -85.5, 'E', 'k'], [165, -82.5, 'E', 'k'], [165, -79.5, 'E', 'k'], [165, -76.5, 'E', 'k'], [165, -73.5, 'E'], [165, -71.62, 'E']], eye: [165, -93.6], dir: [0, 1], near: 1 },
    3: { posts: [[165, 71.62, 'E'], [165, 73.5, 'E'], [165, 76.5, 'E'], [165, 79.5, 'E'], [165, 82.5, 'E'], [165, 85.5, 'E', 'k'], [165, 88.5, 'E', 'k'], [165, 91.5, 'E', 'k'], [162, 91.5, 'S'], [159, 91.5, 'S'], [156.96, 91.5, 'S']], eye: [165, 80.0], dir: [0, 1], near: 4 },
  },
  steps: { z0: -4, z1: 4, x0: 156.5 },
  // ── h126 ── (build 126, rule 65: every other place stage 03's code used to type itself, read from here)
  // each run's openings in the Mount's floor under its posts (h112/model.js RUNS hole: x0, z0, x1, z1), the corner run's second sighting
  holes: { 1: [[164.2, -31.86, 165.8, -7.55]], 2: [[164.2, -92.2, 165.8, -71.4], [160.2, -92.2, 165.8, -90.8]], 3: [[164.2, 71.62, 165.8, 92.2], [156.96, 90.8, 165.8, 92.2]] },
  eye2: { 3: [154.6, 91.5] },
  stepsHole: [156.5, -4, 163.2, 4],   // (the flight's opening in the floor: x0, z0, x1, z1)
  ring: [-211.5, -92, 165.5, 92],    // the soreg's ring on the Mount's floor (stages.js sorag foot): x0, z0, x1, z1
  east: [165, 0],                    // the soreg's east line at the entrance (the posts act's view when no bay is open)
  flight: [160, 0],                  // the flight's middle (the steps' and the closing's view)
  podium: 157,                       // the podium's ashlar core behind the flight begins here (x; h112/world.js stepsBuild, flightFloor)
  stepStand: [155.9, -2.6],          // the kohen's stand at the top steps (11, 12: x) and beside the flight (z) (h112/acts2.js stepStand)
  stepsKeep: 182,                    // the steps act keeps the floor clear east to here (x)
  // the cameras: the film [eye, target, seconds]; the opening; the walk down the east line (eye and target x and height, their z
  // offsets, the z's); a post seen close; the north from above; the reader's walk (x's: from, at the slab, away); the finale on
  // the flight (the hero's foot of the flight and its top, x and z; the two shots)
  cam: {
    film: [[[40, 260, 260], [-20, 0, 0], 3.0], [[186, 14, 10], [160, 3, 0], 2.6], [[180, 22, -110], [160, 2, -80], 2.4], [[180, 22, 110], [160, 2, 80], 2.4], [[260, 300, 300], [-20, 0, 0], 1.6]],
    intro: [[[-40, 520, 520], [-20, 0, 0]], [[-20, 300, 260], [-20, 0, 0]], [[196, 26, 30], [165, 0, -10]]],
    walk: { eye: [176, 7, 6], t: [165, 1.2, -8], z: [-6, -30, -55, -80] },
    north: [[150, 60, -150], [150, 0, -80]],
    post: [[173.5, 2.6, 4.5], [165, 1.6, 0]],
    reader: [181, 166.9, 182],
    foot: [164.6, 0.6], top: [155.2, 0.6],
    side: [[164, 9, 21], [160, 3, 0]], end: [[167, 12, 10], [140, 6, 0]],
    steps: [[171, 13], [159.5, 0]],   // the steps act's shot: eye and target x, z (their heights over the laid step)
  },
  // ── /h126 ──
};
function s03() {
  const E = [];
  for (const [lv, R] of Object.entries(S03.runs)) {
    R.posts.forEach(([x, z, line, k], i) => E.push(ent(`post${lv}.${i}`, 'post', x, z, `${k ? 'עמוד הכהן' : 'עמוד הצוות'} ${i + 1} במסלול ${lv}`, ILL, { extra: { line, run: +lv } })));
    E.push(ent('eye' + lv, 'eye', R.eye[0], R.eye[1], `נקודת הכיוון של מסלול ${lv}`, ILL));
    const n = S03.line[R.posts[R.near][2]];
    E.push(ent('stand:posts' + lv, 'stand', R.eye[0] + n[0] * 2.4 + R.dir[0] * 0.6, R.eye[1] + n[1] * 2.4 + R.dir[1] * 0.6, `עמדת הכהן בעמודי מסלול ${lv}`, ILL));
  }
  E.push(ent('steps', 'steps', S03.steps.x0, (S03.steps.z0 + S03.steps.z1) / 2, 'שתים עשרה המעלות מן החיל', 'מידות ב, ג'));
  // ── h126 ── the places moved into the book in build 126
  for (const [lv, [x, z]] of Object.entries(S03.eye2)) E.push(ent('eye' + lv + 'b', 'eye', x, z, `נקודת הכיוון השנייה של מסלול ${lv} (מעבר לפינה)`, ILL));
  E.push(ent('soreg:east', 'line', S03.east[0], S03.east[1], 'קו הסורג המזרחי מול הכניסה', ILL));
  E.push(ent('flight', 'steps', S03.flight[0], S03.flight[1], 'אמצע המעלות', ILL));
  E.push(ent('flight:foot', 'stand', S03.cam.foot[0], S03.cam.foot[1], 'רגלי המעלות: מכאן הכהן עולה', ILL));
  E.push(ent('flight:top', 'stand', S03.cam.top[0], S03.cam.top[1], 'ראש המעלות, על החיל', ILL));
  // ── /h126 ──
  return { stage: 3, name: 'הסורג והחיל', bounds: { x0: 150, x1: 175, z0: -100, z1: 100 }, runs: S03.runs, steps: S03.steps, holes: S03.holes, eye2: S03.eye2, stepsHole: S03.stepsHole, ring: S03.ring, east: S03.east, flight: S03.flight, podium: S03.podium, stepStand: S03.stepStand, stepsKeep: S03.stepsKeep, cam: S03.cam, entries: E };   // ── h126 ── (holes … cam) ── /h126 ──
}

/** stage 04, the Azarah's gates (h113/model.js GATES, SOUTH, YARD; h111's Nikanor; registered): the frame's outer face at the
 *  opening's middle, the carpenters' yard on the chel */
const S04 = {
  gates: [['nitzotz', 'שער הניצוץ', -38, -78], ['korban', 'שער הקרבן', -95, -78], ['moked', 'שער בית המוקד', -160, -76], ['mayim', 'שער המים', -38, 78], ['bechorot', 'שער הבכורות', -118, 78], ['delek', 'שער הדלק', -160, 78]],
  nikanor: [3, 0],
  yard: { x0: -84.4, x1: -64.4, z: -80.2 },
  // ── h126 ── (build 126, rule 65: every other place stage 04's code used to type itself, read from here)
  // the carpenters' yard: its trestles' post line (z), the rack's two ends (x), the wall line behind it (z); the yard's keep (z from, to)
  yardMore: { post: -77.6, rack: [-62.6, -47.8], wall: -73.95, keep: [-84, -73] },
  // the gatehouses the crews keep clear round the kohen's north frames and the south three (z from, to) and the north porch's band
  houses: { N: [-79, -63], porch: [-79.2, -75.3], S: [63, 79], inner: -64, court: -67.5, passS: [67.5, 78.2] },   // (inner: a gatehouse's inner face over the lintel; court: the court's north face, the passage's end; passS: the south passages' floor, z from, to)
  // the cameras: the film [eye, target, seconds]; the opening; the gilding's and the third level's walks; Nikanor across the court;
  // the end's round (middle, radius, height); the yard's two shots (eye and target: x off the yard's middle, height, z)
  cam: {
    film: [[[-60, 260, 260], [-80, 0, 0], 3.0], [[-66, 20, -112], [-66, 12, -78], 2.6], [[-100, 20, 112], [-100, 12, 78], 2.6], [[-60, 300, 300], [-80, 0, 0], 1.6]],
    intro: [[[-60, 520, 520], [-80, 0, 0]], [[-80, 280, 240], [-80, 0, 0]]],
    toKorban: [[-66, 34, -116], [-80, 8, -78]],
    toMoked: [[-130, 40, -118], [-150, 8, -76]],
    nikanor: [[120, 60, 90], [40, 8, 0]],
    round: { c: [-80, 0], R: 330, y: 200 },
    rack: [[2, 36, -110], [0, 11, -79.5]],
    lintel: [[3, 15, -103], [0, 12, -78]],
  },
  // ── /h126 ──
};
function s04() {
  const E = S04.gates.map(([key, n, c, zf]) => ent('gate:' + key, 'gate', c, zf, n, 'מידות א, ד'));
  E.push(ent('nikanor', 'gate', S04.nikanor[0], S04.nikanor[1], 'שער ניקנור', 'מידות ב, ו'));
  E.push(ent('yard', 'yard', (S04.yard.x0 + S04.yard.x1) / 2, S04.yard.z, 'חצר הנגרים על החיל', ILL));
  // ── h126 ── the places moved into the book in build 126
  E.push(ent('yard:rack', 'rack', (S04.yardMore.rack[0] + S04.yardMore.rack[1]) / 2, S04.yard.z, 'מתלה הקרשים בחצר הנגרים', ILL));
  // ── /h126 ──
  return { stage: 4, name: 'שערי העזרה', bounds: { x0: -175, x1: 10, z0: -90, z1: 90 }, gates: S04.gates, nikanor: S04.nikanor, yard: S04.yard, yardMore: S04.yardMore, houses: S04.houses, cam: S04.cam, entries: E };   // ── h126 ── (yardMore … cam) ── /h126 ──
}

/** stage 05, the women's court (Middot 2:5: 135 × 135, a chamber of 40 in each corner): THE source of its places — h120/layout.js,
 *  routes.js and model.js read them from here. The gallery's columns, beams, runs and ladders; the four chambers and their doors;
 *  the lepers' chamber's mikveh (the basin, the rod, the inlet and outlet, the source hollows of the three levels, the plasterers'
 *  lime pit, the vessels); the carpenters' yard and its trestles; the lime pit by the wood chamber; every act's stand (as the acts'
 *  own stand() makes it: test/book.test.mjs holds them equal) */
const S05 = {
  court: { x0: 6, x1: 141, z0: -67.5, z1: 67.5, floor: 6 },
  cols: { S1: [57, 62.5, 'S', 'x'], S2: [68, 62.5, 'S', 'x'], S3: [79, 62.5, 'S', 'x'], S4: [90, 62.5, 'S', 'x'], N1: [57, -62.5, 'N', 'x'], N2: [68, -62.5, 'N', 'x'], N3: [79, -62.5, 'N', 'x'], N4: [90, -62.5, 'N', 'x'], EN: [136, -16.25, 'E', 'z'], ES: [136, 16.25, 'E', 'z'] },
  beams: [['SB0', null, 'S1', [46, 62.5], [57, 62.5]], ['SB1', 'S1', 'S2', [57, 62.5], [68, 62.5]], ['SB2', 'S2', 'S3', [68, 62.5], [79, 62.5]], ['SB3', 'S3', 'S4', [79, 62.5], [90, 62.5]], ['SB4', 'S4', null, [90, 62.5], [101, 62.5]],
    ['NB0', null, 'N1', [46, -62.5], [57, -62.5]], ['NB1', 'N1', 'N2', [57, -62.5], [68, -62.5]], ['NB2', 'N2', 'N3', [68, -62.5], [79, -62.5]], ['NB3', 'N3', 'N4', [79, -62.5], [90, -62.5]], ['NB4', 'N4', null, [90, -62.5], [101, -62.5]],
    ['ENB0', null, 'EN', [136, -27.5], [136, -16.25]], ['ENB1', 'EN', null, [136, -16.25], [136, -13]], ['ESB0', null, 'ES', [136, 27.5], [136, 16.25]], ['ESB1', 'ES', null, [136, 16.25], [136, 13]]],
  runs: [{ side: 'S', axis: 'x', wall: 67.5, line: 62.5, a0: 46, a1: 101, dir: -1 }, { side: 'N', axis: 'x', wall: -67.5, line: -62.5, a0: 46, a1: 101, dir: 1 }, { side: 'EN', axis: 'z', wall: 141, line: 136, a0: -27.5, a1: -13, dir: -1 }, { side: 'ES', axis: 'z', wall: 141, line: 136, a0: 13, a1: 27.5, dir: -1 }],
  ladders: [[47.4, 60.2, 47.4, 64], [99.6, 60.2, 99.6, 64], [47.4, -60.2, 47.4, -64], [99.6, -60.2, 99.6, -64], [133.8, -14.6, 137, -14.6], [133.8, 26, 137, 26]],
  chambers: [
    { id: 'lepers', label: 'לשכת המצורעים', x0: 6, x1: 44, z0: -67.5, z1: -29.5, door: [22, 30], doorZ: -29.5 },
    { id: 'wood', label: 'לשכת דיר העצים', x0: 103, x1: 141, z0: -67.5, z1: -29.5, door: [117, 125], doorZ: -29.5 },
    { id: 'oils', label: 'לשכת בית שמניה', x0: 6, x1: 44, z0: 29.5, z1: 67.5, door: [22, 30], doorZ: 29.5 },
    { id: 'nazirites', label: 'לשכת הנזירים', x0: 103, x1: 141, z0: 29.5, z1: 67.5, door: [117, 125], doorZ: 29.5 },
  ],
  mik: { x0: 12, x1: 14, z0: -42, z1: -39, stair: 18, rod: [12.35, -40.5], inlet: [13, -42.25], outlet: [13.4, -38.75], pit: { x0: 19.5, x1: 23.5, z0: -36.5, z1: -32.5 }, hollows: { 1: [13, -52.5], 2: [36, -51.5], 3: [8.6, -56.6] } },
  vessels: [{ id: 'trough', kind: 'trough', at: [24.5, -46.9], w: 2.6, d: 1.0 }, { id: 'jar1', kind: 'jar', at: [26.6, -44.3], r: 0.55 }, { id: 'jar2', kind: 'jar', at: [17.2, -56.4], r: 0.55 }, { id: 'jar3', kind: 'jar', at: [31.8, -40.6], r: 0.55 }],
  yard: { his: { x0: 80, x1: 92, z: -31.5 }, saw: { x0: 79, x1: 91, z: -26.6 }, stock: { x: 99.4, z0: -33.2, z1: -21.2 }, offcut: [94.6, -34.2], short: [84, -35.4], bench: [95.6, -29.6] },
  lime: { x0: 134.6, z0: -27.3, x1: 137.4, z1: -23.3 },
  // every act's stand at each level, as its act makes it ({ x, z, face }); the free works' stands are the same acts' on their own units
  stands: { col1: [82.6, 57.9, 81.5, 58.8], col2: [46.5, -57.5, 47.6, -58.4], col3: [131.7, -2.4, 132.6, -3.5], saw1: [68, 58.9, 68, 62.5], saw2: [57, -58.9, 57, -62.5], saw3: [132.4, -16.25, 136, -16.25],
    carry1: [78.5, -29.1, 83, -31.5], carry2: [78.5, -29.1, 83, -31.5], carry3: [78.5, -29.1, 83, -31.5], mikveh1: [14.8, -51.1, 13, -52.5], mikveh2: [37.8, -50.1, 36, -51.5], mikveh3: [10.4, -55.2, 8.6, -56.6], planks: [62.5, 53.5, 62.5, 62.5] },
};
function s05() {
  const E = [], C = S05;
  E.push(ent('court', 'court', (C.court.x0 + C.court.x1) / 2, 0, 'עזרת הנשים', 'מידות ב, ה'));
  for (const [id, [x, z]] of Object.entries(C.cols)) E.push(ent('col:' + id, 'column', x, z, `עמוד ${id} של הגזוזטרא`, ILL, { y: C.court.floor }));
  for (const [id, , , pa, pb] of C.beams) E.push(ent('beam:' + id, 'beam', (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2, `קורה ${id}`, ILL));
  C.ladders.forEach(([x, z], i) => E.push(ent('ladder' + i, 'ladder', x, z, 'סולם אל הגזוזטרא', ILL)));
  for (const c of C.chambers) {
    E.push(ent('chamber:' + c.id, 'chamber', (c.x0 + c.x1) / 2, (c.z0 + c.z1) / 2, c.label, 'מידות ב, ה'));
    E.push(ent('door:' + c.id, 'door', (c.door[0] + c.door[1]) / 2, c.doorZ, 'הפתח של ' + c.label, ILL));
  }
  const M = C.mik;
  E.push(ent('mik:basin', 'basin', (M.x0 + M.x1) / 2, (M.z0 + M.z1) / 2, 'המקווה החצוב בלשכת המצורעים', 'נגעים יד, ח'));
  E.push(ent('mik:rod', 'rod', M.rod[0], M.rod[1], 'הקנה עם סימני הגובה', ILL));
  E.push(ent('mik:inlet', 'inlet', M.inlet[0], M.inlet[1], 'פתח הכניסה של המים', ILL));
  E.push(ent('mik:outlet', 'outlet', M.outlet[0], M.outlet[1], 'פתח הגלישה', ILL));
  E.push(ent('mik:pit', 'pit', (M.pit.x0 + M.pit.x1) / 2, (M.pit.z0 + M.pit.z1) / 2, 'בור הסיד של הטייחים', ILL));
  for (const [lv, [x, z]] of Object.entries(M.hollows)) E.push(ent('mik:hollow' + lv, 'hollow', x, z, `גומת המקור, רמה ${lv}`, ILL));
  for (const v of C.vessels) E.push(ent('vessel:' + v.id, 'vessel', v.at[0], v.at[1], v.kind === 'trough' ? 'שוקת הטייחים' : 'כד', ILL));
  const Y = C.yard;
  E.push(ent('yard:his', 'trestles', (Y.his.x0 + Y.his.x1) / 2, Y.his.z, 'החמורים של הקורה שלו בחצר הנגרים', ILL));
  E.push(ent('yard:saw', 'trestles', (Y.saw.x0 + Y.saw.x1) / 2, Y.saw.z, 'החמורים של הנסרים', ILL));
  E.push(ent('yard:stock', 'stock', Y.stock.x, (Y.stock.z0 + Y.stock.z1) / 2, 'מלאי הקורות', ILL));
  E.push(ent('yard:offcut', 'heap', Y.offcut[0], Y.offcut[1], 'ערמת הנסורת', ILL));
  E.push(ent('yard:short', 'heap', Y.short[0], Y.short[1], 'הקורות הקצרות', ILL));
  E.push(ent('yard:bench', 'bench', Y.bench[0], Y.bench[1], 'ספסל הנגרים', ILL));
  E.push(ent('lime', 'pit', (C.lime.x0 + C.lime.x1) / 2, (C.lime.z0 + C.lime.z1) / 2, 'בור הסיד ליד לשכת העצים', ILL));
  // (one entry for each spot: the carry's three levels share one stand, named by all of them)
  const ACT = { col: 'הקמת העמוד', saw: 'ניסור הקורה', carry: 'נשיאת הקורה', mikveh: 'מילוי המקווה', planks: 'הנחת הנסרים' }, spot = new Map();
  for (const [id, [x, z]] of Object.entries(C.stands)) { const k = x + ',' + z; if (spot.has(k)) spot.get(k).ids.push(id); else spot.set(k, { x, z, ids: [id] }); }
  for (const { x, z, ids } of spot.values()) {
    const a = ids[0].replace(/\d+$/, ''), lv = ids.map((i) => i.slice(a.length)).filter(Boolean);
    E.push(ent('stand:' + ids.join('+'), 'stand', x, z, `עמדת הכהן ב${ACT[a]}` + (lv.length ? (lv.length > 1 ? `, רמות ${lv.join(', ')}` : `, רמה ${lv[0]}`) : ''), ILL, { extra: { acts: ids } }));
  }
  return { stage: 5, name: 'עזרת הנשים', bounds: { x0: -2, x1: 160, z0: -76, z1: 76 }, ...C, entries: E };
}
// ── /build 124 B ──

export const BOOK = makeBook();
