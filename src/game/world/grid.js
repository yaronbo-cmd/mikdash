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
  stages.s01 = s01(SECTORS);   // ── h127 ── (build 127: stage 01's section, shaped as the others; its old keys below stay as they were) ── /h127 ──
  stages.s06 = s06();   // ── h128 ── (build 128: stage 06's section, and its sea sheet) ── /h128 ──
  stages.s07 = s07(stages.s04);   // ── h129 ── (build 129: stage 07's section; the gates that lock at night are read from s04's entries) ── /h129 ──
  stages.s08 = s08();   // ── h131 ── (build 131: stage 08's section, and the pit's sheet at Beit Kerem) ── /h131 ──
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
  // (build 130: the basin as a built thing — the old mikveh station's pit and source hollows went with it)
  mik: { x0: 12, x1: 14, z0: -42, z1: -39, stair: 18, rod: [12.35, -40.5], inlet: [13, -42.25], outlet: [13.4, -38.75] },
  // the raising's stand (build 120's level 3, kept for the gallery's level 3: h130/raise.js) ({ x, z, face }); build 130: the old
  // stage's other stands went with it
  stands: { col3: [131.7, -2.4, 132.6, -3.5] },
  // ── h127 ── (build 127, rule 65: every other place stage 05's code used to type itself, read from here)
  // the raising's rig (build 120's level 3, h130/raise.js): the brake post, the block on the wood chamber's south wall the pull rope turns
  // in ([x, y, z]) and the four pullers on the rope's line
  rig: { 3: { post: [132.6, -3.5], block: [131.2, 9.5, -27.35], pull: [[129.8, -25.4], [129.1, -24.1], [128.5, -22.7], [127.8, -21.4]] } },
  // the court's walls and the chambers' [x0, z0, x1, z1] (the look's boxes, the sight rules)
  walls: [
    [0, -76, 150, -67.5], [0, 67.5, 150, 76], [-2, -76, 6, 76], [141, -76, 152, -13], [141, 13, 152, 76], [138, -13, 152, 13], [6, -14, 24, 14],
    [101, 27.5, 103, 67.5], [101, 27.5, 117, 29.5], [125, 27.5, 141, 29.5],
    [101, -67.5, 103, -27.5], [101, -29.5, 117, -27.5], [125, -29.5, 141, -27.5],
    [44, -67.5, 46, -27.5], [6, -29.5, 22, -27.5], [30, -29.5, 46, -27.5],
    [44, 27.5, 46, 67.5], [6, 27.5, 22, 29.5], [30, 27.5, 46, 29.5],
  ],
  // where a broken column's halves lie (the stone pile by the east gate: h130/world.js, gal.column)
  brokeAt: [110.5, -18.5],
  // the cameras (build 130: the old stage's film and opening went with it)
  cam: {
    // ── h130 ── the new stage's cameras [eye, aim]: each stand's view (the lifted view is the look's shape over it; the test's views are
    // the spectators' and the seat's own eyes), the stage's opening; the wood and light stations' stand views
    // (build 130, after its first still: seen through the act's own wider lens — gallery.js FOV — the whole run, the sledges and the
    //  kohen in the left third)
    gal: { N: [[80, 30, -8], [82, 6, -55]], S: [[67, 30, 8], [65, 6, 55]], E: [[84, 30, 6], [130, 6, 8]] },
    open130: [[[40, 420, 400], [73, 0, 0]], [[150, 110, 100], [73, 6, 0]], [[110, 40, 34], [73, 8, 0]]],
    wood: [[112, 14, -36], [122, 7.6, -46]],
    light: { 1: [[90, 22, 46], [99.6, 12, 62]], 2: [[56, 30, 2], [73.5, 30, 24]], 3: [[50, 34, -6], [73.5, 34, 24]], measures: [[30, 12, 22], [26, 7, 31.5]], wicks: [[34, 11, 17], [30, 7, 24]] },
    // level 3's raising (build 120's COL shots, kept): [eye, aim] in the column's own frame — [along from the foot, across toward the
    // court, height] — the whole rig from the side, the macro of the last degrees, the plumb lines
    // the opening of gal1 (the crowd's showing): the whole court from over its south-east corner, the gate in it; the kohen's look up
    // to the north wall ("ואם נעלה קומה?")
    open1: [[128, 80, 72], [86, 6, 0]],
    galUp: [[76, 9.5, -40], [73.5, 24, -67.5]],
    raise: { wide: [[1.8, 55, 13], [1.8, 0, 9.4]], macro: [[2.2, 11, 8.6], [0.3, 0, 7.0]], plumb: [[10, 14, 10.5], [0.3, 0, 7.6]] },
    // ── /h130 ──
  },
  // ── /h127 ──
  // ── h130 ── (build 130: the NEW stage 05, docs/specs/shlav-05-hadash-he.md "כתובות על העולם", docs/specs/build130-brief.md §1). Every
  // place the new stage's code reads; the rows the spec marks "קיים" are the built world's own (court, runs, ladders, walls, chambers,
  // mik, rig.3, stands.col3, brokeAt, above), the rows it marks "חדש" are checked here against the built world:
  //  · the column lines run on the line itself (z ∓62.5, x 136); a ladder's foot (z ∓60.2, x 133.8) lies 2.3 off the line on the court's
  //    side and the ladder leans across it to the gallery's floor: so "within 1.5 of a ladder's foot" is measured ALONG the line (the
  //    ladder's own x, or its z on the east), where the ladder crosses it;
  //  · the east line is one line z −27.5 … 27.5 with the gate's passage (z −13 … 13: the east gate house, walls [138, −13, 152, 13])
  //    cut out of it: the beams of its two segments bear on the gate's jambs, and no column may stand in it;
  //  · the spectators below stand between the column line and the wall (z ∓65; on the east x 139), each level's own fixed table (lv):
  //    tuned so that the even spacing fails, the least number of columns has a solution with 1.5 … 3 amot of room, one more column makes
  //    it easy, and no spectator-to-torch line passes within 2 of the menorah (h130/model.js; test/h130-model.test.mjs holds them);
  //  · the menorah stands at (73.5, 24), not on the court's axis: z 0 is stage 06's sledge lane (the spec's correction of 15.11);
  //  · the site's crews (crewSite) are re-planned off the wood chamber and its door: the scaffold that stood on the wood chamber's
  //    south wall by its door goes to the lepers' chamber's south wall (x 32 … 38), the pile at (70, 42) (on the south sleds' way and by
  //    the menorah) goes to the Nazirites' chamber's west wall (99, 46), and the sledges' lane ends at the Nazirites' door (121, 29.2),
  //    not the wood chamber's. (Build 130 part 3: the old keys scaff, piles, lane, laneCrew went with the old stage.)
  gal: {
    // the run of each side: axis, the column line, its two ends (the walls the beams bear on), the wall the gallery hangs from, the
    // passage cut out of it (the east), the gallery's direction from the line toward the wall (+1 / −1 in the line's normal)
    runs: {
      N: { axis: 'x', line: -62.5, a0: 46, a1: 101, wall: -67.5, cut: null },
      S: { axis: 'x', line: 62.5, a0: 46, a1: 101, wall: 67.5, cut: null },
      E: { axis: 'z', line: 136, a0: -27.5, a1: 27.5, wall: 141, cut: [-13, 13] },
    },
    // the gate's passage (מעבר השער המזרחי: x 138 … 152, z −13 … 13)
    passage: { x0: 138, x1: 152, z0: -13, z1: 13 },
    // the kohen's stand in the puzzle, and where the torch bearer waits in the picture until he is tapped
    stand: { N: [73.5, -52], S: [73.5, 52], E: [126, 0] },
    bearer: { N: [80.5, -50.5], S: [66.5, 50.5], E: [127.5, 7] },
    // the spectators below stand by the wall: z −65 (N), z 65 (S), x 139 (E); the other coordinate is each level's own (lv.watch)
    watch: { N: -65, S: 65, E: 139 },
    // the torch bearer's three stops (the court's floor)
    torch: [[73.5, 0], [40, 0], [107, 0]],
    // the sledges the columns wait on: five per stand (four and one spare), four amot toward the court from the stand, side by side
    // along the run (the column lying across the run, its foot toward the line)
    sleds: {
      N: [[67.5, -48], [70.5, -48], [73.5, -48], [76.5, -48], [79.5, -48]],
      S: [[67.5, 48], [70.5, 48], [73.5, 48], [76.5, 48], [79.5, 48]],
      E: [[122, -4.5], [122, -1.5], [122, 1.5], [122, 4.5], [122, 7.5]],
    },
    // the levels (the spec's "הרמות"): the side, the columns in stock (the least that can solve it) and the spare, the spectators below
    // (by the wall), the torch's stops (indices into torch), and level 3's raised column (the north segment's: the rig is rig.3's)
    lv: {
      1: { side: 'N', stock: 4, spare: 1, watch: [[57.5, -65], [84, -65]], torch: [0] },
      2: { side: 'S', stock: 4, spare: 1, watch: [[52, 65], [64, 65], [82, 65]], torch: [0, 1, 2] },
      3: { side: 'E', stock: 2, spare: 1, watch: [[139, -22], [139, 21.5]], torch: [0, 2], raise: 'N' },
    },
    // the camera's seat for the test from above: the last seat of each run, on the gallery's floor by the wall
    seat: { N: [99.5, -66], S: [99.5, 66], E: [140, 26.5] },
    // the gallery the crews built for an old save whose stage 05 was finished (brief §8): the old default columns, along each run
    crewCols: { N: [57, 68, 79, 90], S: [57, 68, 79, 90], E: [-16.25, 16.25] },
    // the opening's drawn line (the left hand draws it on the court's floor: inside and outside) and the crowd's gate
    ring: [[34, -40], [113, -40], [113, 40], [34, 40]],
    gate: [140, 0],
    // the tops of the court's walls as the world builds them (heights for the look's boxes; the order of walls above)
    wallTops: [40.3, 44.3, 6, 22.3, 38.3, 38.3, 6, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4, 20.4],
  },
  // (the wood chamber: the kohen's stand behind the log's left end, no nearer the camera than the log — build 130 part 3: the log a
  //  third of the screen with the kohen whole beside it)
  wood: { trestles: [121, -46], stand: [117.2, -46.4], second: [124, -50], clean: [128, -44], out: [112, -58] },
  light: {
    // the golden menorah (its place: המחשה), 50 amot high, four bowls at its head; its four ladders' feet 6 amot from it to the NE, NW,
    // SE and SW (6 / √2 = 4.243 on each axis), each leaning toward it
    menorah: [73.5, 24], h: 50,
    ladders: [[77.743, 19.757], [69.257, 19.757], [77.743, 28.243], [69.257, 28.243]],
    // level 1: the south gallery's east ladder and a clay bowl on the gallery's floor above it
    practice: { ladder: [99.6, 60.2], bowl: [99.6, 65] },
    measures: [26, 31.5], wicks: [30, 24],
  },
  eve: {
    // the ending's cameras [eye, aim]: the rise with the flames over the wall, the look over the city, the descent to the court
    cam: { rise: [[73.5, 70, 70], [73.5, 52, 24]], city: [[73.5, 150, 160], [-120, 20, -60]], down: [[118, 30, 30], [70, 12, 30]] },
  },
  // the world's site crews, re-planned off the wood chamber (see above): scaffolds [x0, z0, x1, z1], stone piles [x, z, stones], the
  // sledges' lane from outside the east gate to the Nazirites' door, its crew outside the gate
  crewSite: {
    scaff: [[46.2, -47, 48.4, -41], [32, -27.3, 38, -25.3], [107, 25.3, 113, 27.3], [46.2, 38, 48.4, 44]],
    piles: [[64, -40, 7], [109, -14, 6], [99, 46, 6], [112, 40, 5]],
    lane: [[156, 5.5], [139, 5.5], [128, 12], [121, 21], [121, 29.2]],
    laneCrew: { pull: [150, 5.5], drover: [150, 8] },
    // the world's crews in the court while the stage builds (crews.js SITES.nashim.stand: [x, z, face x, face z]): the north ones as they
    // stood; the three that stood at and round the menorah (73.5, 24) moved to the lepers' chamber's south wall (outside it, facing it),
    // every one at least 12 amot from the menorah and out of every station's own frame (build 130 part 3)
    stand: [[68, -20, 69, -26], [75, -24, 77, -30], [10, -24.5, 10, -28.5], [16, -24.5, 16, -28.5], [57, -24, 55, -30], [41, -24.5, 41, -28.5]],
  },
  // ── /h130 ──
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
  // ── h127 ── the places moved into the book in build 127 (build 130: the raising's stand and rig of level 3 stay; the rest went with the
  // old stage 05)
  { const [x, z] = C.stands.col3; E.push(ent('stand:col3', 'stand', x, z, 'עמדת הכהן בהרמת העמוד בחבלים', ILL, { extra: { acts: ['gal3'] } })); }
  { const R = C.rig[3]; E.push(ent('rig:post3', 'brake', R.post[0], R.post[1], 'עמוד הבלם של העמוד המורם', ILL)); E.push(ent('rig:block3', 'block', R.block[0], R.block[2], 'הגלגלת על קיר לשכת העצים', ILL, { y: R.block[1] })); }
  E.push(ent('broke', 'heap', C.brokeAt[0], C.brokeAt[1], 'מקום חצאי עמוד שנשבר, ליד ערמת האבנים', ILL));
  // ── /h127 ──
  // ── h130 ── the new stage's places (ids prefixed 'n:')
  const G = C.gal, SIDE = { N: 'בצפון', S: 'בדרום', E: 'במזרח' };
  for (const [s, R] of Object.entries(G.runs)) {
    const p = (a) => (R.axis === 'x' ? [a, R.line] : [R.line, a]);
    E.push(ent('n:run:' + s + '0', 'run', ...p(R.a0), `קצה קו העמודים ${SIDE[s]}`, ILL));
    E.push(ent('n:run:' + s + '1', 'run', ...p(R.a1), `קצה קו העמודים ${SIDE[s]}`, ILL));
  }
  E.push(ent('n:passage', 'passage', (G.passage.x0 + G.passage.x1) / 2, (G.passage.z0 + G.passage.z1) / 2, 'מעבר השער המזרחי', ILL));
  for (const [s, [x, z]] of Object.entries(G.stand)) E.push(ent('n:stand:gal' + s, 'stand', x, z, `עמדת הכהן בחידת העמודים ${SIDE[s]}`, ILL));
  for (const [s, [x, z]] of Object.entries(G.bearer)) E.push(ent('n:bearer:' + s, 'crew', x, z, `נושא האבוקה מחכה ${SIDE[s]}`, ILL));
  G.torch.forEach(([x, z], i) => E.push(ent('n:torch' + i, 'torch', x, z, `עצירה ${i + 1} של נושא האבוקה`, ILL)));
  for (const [s, L] of Object.entries(G.sleds)) L.forEach(([x, z], i) => E.push(ent(`n:sled:${s}${i}`, 'sled', x, z, `מזחלת עמוד ${i + 1} ${SIDE[s]}`, ILL)));
  for (const [lv, V] of Object.entries(G.lv)) V.watch.forEach(([x, z], i) => E.push(ent(`n:watch${lv}.${i}`, 'watch', x, z, `צופה ${i + 1} למטה, רמה ${lv}`, ILL)));
  for (const [s, [x, z]] of Object.entries(G.seat)) E.push(ent('n:seat:' + s, 'seat', x, z, `המושב האחרון בגזוזטרא ${SIDE[s]}`, ILL, { y: 17.4 }));
  G.ring.forEach(([x, z], i) => E.push(ent('n:ring' + i, 'mark', x, z, 'פינת הקו של הפתיחה (פנים וחוץ)', ILL)));
  E.push(ent('n:crowdGate', 'gate', G.gate[0], G.gate[1], 'הקהל המצויר נכנס בשער', ILL));
  const W = C.wood;
  E.push(ent('n:wood:trestles', 'trestles', W.trestles[0], W.trestles[1], 'חמורי העץ של הבדיקה', ILL));
  E.push(ent('n:wood:stand', 'stand', W.stand[0], W.stand[1], 'עמדת הכהן בלשכת העצים', ILL));
  E.push(ent('n:wood:second', 'crew', W.second[0], W.second[1], 'הכהן השני שבודק בול משלו', ILL));
  E.push(ent('n:wood:clean', 'heap', W.clean[0], W.clean[1], 'הערימה הנקייה', ILL));
  E.push(ent('n:wood:out', 'heap', W.out[0], W.out[1], 'ערימת הפסולים', ILL));
  const Lt = C.light;
  E.push(ent('n:menorah', 'menorah', Lt.menorah[0], Lt.menorah[1], 'מנורת הזהב, גובה חמישים אמה', 'סוכה נב ע"ב (מקומה: המחשה)'));
  Lt.ladders.forEach(([x, z], i) => E.push(ent('n:mladder' + i, 'ladder', x, z, `סולם ${i + 1} של המנורה`, 'סוכה ה, ב (מקומו: המחשה)')));
  E.push(ent('n:practice', 'practice', Lt.practice.ladder[0], Lt.practice.ladder[1], 'סולם האימון (סולם הגזוזטרא)', ILL));
  E.push(ent('n:bowl', 'bowl', Lt.practice.bowl[0], Lt.practice.bowl[1], 'קערת החרס על הגזוזטרא', ILL, { y: 17.4 }));
  E.push(ent('n:measures', 'measures', Lt.measures[0], Lt.measures[1], 'כלי המידה בפתח בית שמניה', 'מנחות ט, ב (מקומם: המחשה)'));
  E.push(ent('n:wicks', 'table', Lt.wicks[0], Lt.wicks[1], 'שולחן הפתילות', ILL));
  const CS = C.crewSite;
  CS.scaff.forEach(([x0, z0, x1, z1], i) => { E.push(ent('n:scaff' + i, 'scaffold', (x0 + x1) / 2, (z0 + z1) / 2, 'פיגום על קיר הלשכה', ILL)); });
  CS.piles.forEach(([x, z, n], i) => { E.push(ent('n:pile' + i, 'pile', x, z, 'ערמת אבנים', ILL)); });
  E.push(ent('n:lane:gate', 'lane', CS.lane[0][0], CS.lane[0][1], 'שביל המזחלות: מחוץ לשער המזרחי', ILL));
  E.push(ent('n:lane:crew', 'crew', CS.laneCrew.pull[0], CS.laneCrew.pull[1], 'מושכי המזחלת מחוץ לשער המזרחי', ILL));
  E.push(ent('n:lane:door', 'lane', CS.lane[CS.lane.length - 1][0], CS.lane[CS.lane.length - 1][1], 'שביל המזחלות: פתח לשכת הנזירים', ILL));
  // ── /h130 ──
  return { stage: 5, name: 'עזרת הנשים', bounds: { x0: -2, x1: 160, z0: -76, z1: 76 }, ...C, entries: E };
}
// ── /build 124 B ──

/* ───────── ── h127 ── stage 01's section (build 127, rule 65: every place stage 01's code used to type itself, read from here) ───────── */
/** stage 01, the Mount's levelling (h109): the Mount's platform (mount.js PLAT) and the 500-amah square (mount.js SQUARE, made from the
 *  grid's own EAST and NORTH: the surveyors' rope act, h109/acts.js); the corner stone's act (the stone square in the real south-east
 *  corner, the treadwheel crane, the stock, the kohen on the guide rope); the courses on the east wall north of it (their wall line x,
 *  the two stretches' north ends z0, the free courses every step further north); the trumpeting place on the south-west corner (the
 *  corner's outer point, the trumpeter, the corner block's top, its parts [x, height over the top, z] and boxes); the cameras: the end
 *  film [eye, target, seconds], the overview's middle (the director's lift over the Mount, every stage's), the inscription's two shots */
const S01 = {
  platform: { x0: -300, x1: EAST, z0: -480, z1: 400 },
  corner: { stone: { x: 275.5, z: 398.7 }, crane: { x: 264, z: 392.6 }, stock: { x: 253.5, z: 392 }, kohen: { x: 268.6, z: 389.2 } },
  courses: { wallX: 276.1, z0: [352, 316], step: 36, n: 8 },
  letters: {
    face: { x: -300, z: 400 }, trumpeter: { x: -298.4, z: 398.4 }, top: { y0: 31.6, y: 38.2 },
    block: [-300.05, -289, 389, 400.05],                 // the corner block: x0, x1, z0, z1 (from the top's y0 to its y)
    parapet: { x: -299.45, z0: 389, z1: 396.9 },          // the parapet's blocks along the west edge (x; z from, to)
    stone: [-293.2, 1.2, 399.45], fill: [-289.4, 1.2, 399.45], faceAt: [-293.2, 1.25, 398.83],
    niche: [[-300.05, -296.9, 0.9, 399.6, 400.05], [-300.05, -299.6, 0.9, 396.9, 400.05]],   // [x0, x1, height, z0, z1]
    coping: [[-294.6, 400.15, 11.4], [-300.15, 394.6, 11.4]],                              // [x, z, length]
    pole: [-299.75, 1.5, 396.3], flag: [-299.75, 2.75, 396.3],
  },
  cam: {
    film: [[[60, 260, 520], [0, 0, -40], 3.0], [[60, 55, 70], [-30, -4, -21], 2.8], [[306, -36, 372], [277, -46, 399], 2.2], [[322, 14, 352], [277, -12, 398], 2.4], [[-200, 60, -260], [-280, 10, -150], 2.4], [[-352, 62, 456], [-296, 38, 396], 2.4], [[180, 300, 620], [27, 0, 66], 1.4]],
    over: [27, 0, 66],
    letters: [[-352, 58, 456], [-296, 396]],   // (eye; the target's x and z, at the corner block's top)
    shabbat: [[-372, 120, 470], [-150, 0, 250]],
  },
};
function s01() {
  const E = [], C = S01.corner, K = S01.courses, L = S01.letters;
  E.push(ent('corner:stone', 'stone', C.stone.x, C.stone.z, 'אבן הפינה בפינה הדרומית-מזרחית של ההר', ILL));
  E.push(ent('corner:crane', 'crane', C.crane.x, C.crane.z, 'מנוף הגלגל ליד אבן הפינה', ILL));
  E.push(ent('corner:stock', 'stock', C.stock.x, C.stock.z, 'האבנים המחכות למנוף', ILL));
  E.push(ent('stand:corner', 'stand', C.kohen.x, C.kohen.z, 'עמדת הכהן בחבל ההכוונה', ILL));
  for (let c = 0; c < K.n; c++) { const z0 = c < K.z0.length ? K.z0[c] : K.z0[1] - K.step * (c - 1); E.push(ent('course' + c, 'course', K.wallX, z0 + 7, `נדבך ${c + 1} בחומה המזרחית`, ILL)); }
  E.push(ent('letters:corner', 'corner', L.face.x, L.face.z, 'הפינה הדרומית-מערבית של ההר: בית התקיעה', 'מלחמות ד, ט, יב'));
  E.push(ent('letters:trumpeter', 'crew', L.trumpeter.x, L.trumpeter.z, 'מקום התוקע בפינה', ILL));
  E.push(ent('letters:stone', 'stone', L.stone[0], L.stone[2], 'אבן הכתובת "לבית התקיעה"', 'חפירות ב. מזר, 1968'));
  return { stage: 1, name: 'שיטוח ההר', bounds: S01.platform, square: { x0: EAST - SQ_N * CELL, x1: EAST, z0: NORTH, z1: NORTH + SQ_N * CELL }, ...S01, entries: E };
}
// ── /h127 ──

/* ───────── ── h128 ── stage 06's section (build 128, rule 65: the book first; docs/specs/build128-brief.md §1) ───────── */
/** stage 06, Nicanor's gate and the fifteen steps. Every row of the brief's §1 checked against what the world draws (build 128):
 *  · the gate house (temple.js nikanor: batch.js gate('E', −4, −14, 10, 14, …)) is one solid from x −4 to 10, z ±14; its two bronze
 *    leaves hang on its EAST face, x 10 … 10.34, the opening z ±5 from y 13.5 to 33.5 (10 × 20, Middot 2:3). So the sill, where the
 *    door crosses and is hung, is x 10 (the brief had x 3, inside the solid), and the wickets stand in the gate house's west face, x −4,
 *    toward the Azarah (the brief's x 3 / stands x 0 were inside the solid);
 *  · the Azarah's floor (stages.js groundAt) is 13.5 only for −8 < x < 0; at x ≤ −8 the duchan's half steps rise to 16 at x ≤ −11, so
 *    the capstan at x −12 stands at y 16, and the stand facing both wickets is x −7 (x −8 is the first half step, 14.5);
 *  · the court's east gate house (temple.js 'gates' E: x 138 … 150) is solid: the place where the doors are awaited is on the court's
 *    floor in front of it, x 134 (the brief's x 141 was inside it), between the gallery's two east runs (z ±13);
 *  · the ramp keeps the spec's 43 amot and 7.5 up, its head on the true sill: ramp.low x 53, the sledge's head waiting 2 before it
 *    (x 55); the six notches keep the spec's spacing of 7 (x 49 … 14: the spec's x 7 is inside the gate house). The notches are where
 *    the sledge's TAIL is wedged; the sledge is the door's length (20), so its tail starts at x 75 and the climb is the player's up to
 *    the last notch (tail x 14, head x −6, on the Azarah's flat floor west of the gate house); the crew lands it from there;
 *  · the steps (temple.js: fifteen half cylinders round (10, 0), the j-th radius 6.5 + 0.5 j, top 13.5 − 0.5 j; stages.js line 1731):
 *    ring i (1 the lowest) has outer radius 13.5 − 0.5 (i − 1), its top y 6 + 0.5 i and its base y 5.5 + 0.5 i; ring 15's tread is
 *    the landing r ≤ 6.5 at 13.5 — the brief's rows agree;
 *  · the stone yard, the table, the gaps and the stands of rings 1, 8, 15, the pushing place and the sunrise view: as the brief.
 *  The sea is outside the Mount: its own sheet (20 × 20 cells of 30 km, column from the east, row from the north, as the Mount's) and
 *  the deck's own frame (amot from the mast foot on the deck: x forward to the bow, z to starboard, y up). */
const S06 = {
  eastGate: [134, 0, 6],
  // the timber work ramp (המחשה): low end on the court's floor → the sill; the six stop notches (x of the sledge's tail, on z 0); the two
  // rough timbers (x from, to); its width; the sledge (its length, the door's; its head's and its tail's x at the start)
  ramp: { foot: [55, 0, 6], low: [53, 0, 6], sill: [10, 0, 13.5], notch: [49, 42, 35, 28, 21, 14], rough: [[31, 38], [10, 17]], w: 6, sledge: { L: 20, head: 55, tail: 75 } },
  capstan: [-12, 0, 16],
  // the fifteen steps: the half threshing floor's centre, the lowest ring's outer radius, tread and rise, the court's floor; the yard and
  // the templates' table; the gaps and stands of the player's three rings ([x, z, y]: the gap's centre on the tread's middle at the
  // ring's base; the stand)
  steps: {
    c: [10, 0], R1: 13.5, tread: 0.5, rise: 0.5, n: 15, floor: 6, ends: [[10, -13.5], [10, 13.5]],
    yard: [40, -14, 6], table: [36, -10, 6],
    gap: { 1: [23.25, 0, 6], 8: [19.75, 0, 9.5], 15: [16.25, 0, 13] },
    stand: { 1: [28, 0, 6], 8: [23.5, 0, 6.5], 15: [20, 0, 10] },
  },
  // the two wickets (המחשה: size 2 × 4 and place) in the gate house's west face, and the stands behind them inside the Azarah
  wicket: { N: [-4, -11, 13.5], S: [-4, 11, 13.5], standN: [-6, -11, 13.5], standS: [-6, 11, 13.5], standBoth: [-7, 0, 13.5], w: 2, h: 4 },
  close: { stand: [-6, 0, 13.5], view: [40, 0, 6] },
  // (part 2) the gate's passage through the gate house (x from, to; z half width; the sill's y; the opening's top), the two leaves' hinges
  // on its east end (the leaves open inward, west, each against its side of the passage), the place the doors stand waiting on the
  // Azarah's floor before they are hung, the Levites' line in the court before dawn (המחשה)
  gate: { x: [-4, 10], half: 5, sill: 13.5, top: 33.5, hinge: { N: [9.6, -5], S: [9.6, 5] }, leafW: 5, leafH: 20, leafT: 0.35 },
  levites: { from: [27, -4, 6], to: [12, 0, 13.5] },
  // (part 3) the caravan from Akko: the two wagons with the doors come in through the court's east gate house (from outside it to the
  // place the doors are awaited; המחשה)
  // (build 128, B2: one side shot that goes with them) from: the lead wagon's middle when the film starts; to: where it is when the 5 s
  // end (v amot a second, the oxen's walk); gap: from the lead wagon's middle to the second's; the wagon: its bed's length and width,
  // its wheels' radius and the two axles' x (front first: they go west, −x); the oxen: their middle's x from the wagon's middle, half
  // the yoke's spread, their size, the yoke before their middle and its height over the road; the men beside it: how far out on the
  // near (south) side, their x from the wagon's middle, the hand on the rail (arm raise, spread); after: where the kohen stands when
  // it is over (near the capstan, outside its pull: its walk line shows). (The road east of the court's gate: the floor 6 to x 155, down
  // to 0 by x 165, flat beyond: the film keeps to the flat, x 160 and more)
  caravan: { from: [198, 0, 0], to: [185.5, 0, 0], gap: 28, v: 2.4, len: 21, w: 5.8, wheel: 1.2, axles: [-8, 8], ox: -13.6, oxZ: 1.0, oxS: 1.25, yokeX: 1.2, yokeY: 2.5,
    side: 4.0, men: [-5, 5], hand: [0.35, 0.9], after: [-28, 4],   // (part 3: the stage's bounds reach x 200 for the caravan's approach)
    clear: [120, 300, -260, 120] },   // (clear: x0, x1, z0, z1 round the road in the film's frame, where the standing pilgrims step out while it plays)
  // the Ulam and the House as one block (avodah/day/cam28.js's own: the camera is never in the porch): the right thumb's lifted view
  // from inside the Azarah keeps out of it
  house: [-177, 15.5, -50.5, -76.7, 116, 50.5],
  // the stage's cameras on the Mount ([eye], [aim]; every shot, opening and film reads its eye and aim from here)
  cam: {
    // the opening (rule 3: where am I): the Mount from high, the gate house with no doors, the bare slope where the steps will be
    open: [[[170, 120, 96], [8, 12, 0]], [[124, 92, 74], [20, 22, 0]], [[40, 21, 24], [16, 8, 0]]],
    // §5: behind and above the capstan, looking east through the open gate down the ramp; the lifted view from above; the hanging
    capstan: [[-37, 32, 8], [34, 3, -1]] /* (build 128 fix: a step back and a little lower, the bar man nearest the lens whole at u 0) */, capLift: [[-14, 82, 34], [30, 7, 0]], hang: [[46, 24, 16], [9, 20, 0]],
    // §6: per ring, the yard (the template), the row and the closing stone; the whole half threshing floor from high (ring 15's moment)
    ring: {
      1: { yard: [[50, 22, 0], [39, 6, -13]], row: [[38, 22, 0], [24.5, 6.2, 0]], key: [[31, 13, 2], [23.2, 6.3, 0]] },
      8: { yard: [[50, 22, 0], [39, 6, -13]], row: [[40, 30, 0], [21.5, 9.2, 0]], key: [[27.5, 16, 2], [19.7, 9.8, 0]] },
      15: { yard: [[50, 22, 0], [39, 6, -13]], row: [[34, 28, 0], [17.5, 12.6, 0]], key: [[23.5, 19, 2], [16.2, 13.2, 0]] },
    },
    ringAll: [[48, 42, 0], [14, 8, 0]],
    // §7: close behind each wicket in the Azarah; both from further back
    wicketN: [[-11, 17.6, -11], [-4, 15.6, -11]], wicketS: [[-11, 17.6, 11], [-4, 15.6, 11]], wickets: [[-34.7, 26.8, 0], [-4, 15.2, 0]] /* (build 128 fix: as close as shows both leaves whole, about 2 amot to spare each side at 960×600) */,
    // §8: behind and above the twenty men, looking east through the opening; the lifted view from above
    close: [[-21, 27, 0], [9, 18, 0]], closeLift: [[-6, 62, 0], [5, 13.5, 0]],
    // the end: the Levites on the steps before dawn, the sun on the closed doors, the north leaf near
    endSteps: [[48, 11, 3], [15, 10, 0]],
    // (part 3) the camera's short flight out to the sea from the court's east gate, and the caravan coming in through it
    toSea: [[150, 70, 24], [420, 40, 0]], caravan: [[209, 22, 66], [209, 2.5, 0]] /* (B2: eye and aim at the film's start; their y over the road under the aim; both move west with the lead wagon) */, endSun: [[34, 15, 2], [10, 22, 0]], endSalt: [[15.5, 18, -6], [9.6, 19, -2.6]],
    // the director's last shots (eye, aim, seconds): the gate and its steps from the court, then high
    film: [[[52, 24, 18], [10, 16, 0], 3], [[120, 90, 70], [10, 10, 0], 3]],
  },
  // ── the sea sheet ──
  sea: {
    sheet: { name: 'גיליון הים', n: 20, km: 30 },
    // [column index from the east (0 = א), row index from the north (0 = 1)]
    places: { alexandria: [18, 12], storm: [3, 9], akko: [2, 5] },
    // the ship (המחשה): a merchant ship of one mast and one square sail, in the deck's frame. hull: the stern post's and the stem's x,
    // the beam and where it is widest, the depth from the keel to the deck at the mast, the freeboard over the water there, the sheer
    // (how much the deck rises at each end)
    hull: { stern: -38, stem: 22, beam: 16, wide: -14, depth: 7, free: 3.4, sheer: [2.2, 2.8] },
    mast: { at: [0, 0], h: 34, yard: 30 },
    deck: {
      // the two doors (each 5 × 20 × 0.35, lying fore and aft, one each side of the mast line): centre, length along x, width along z
      doors: { port: [-12, -3.2], stbd: [-12, 3.2], L: 20, W: 5, T: 0.35 },
      // each door's two ring handles (x, z)
      handles: { port: [[-16, -3.2], [-8, -3.2]], stbd: [[-16, 3.2], [-8, 3.2]] },
      // the four lashing rings in the deck (inboard, between the doors), the four cleats at the rails, the four tails' grips (the free
      // ends the player takes: aft of each cleat along the rail)
      rings: { portFore: [-5, -0.35], portAft: [-19, -0.35], stbdFore: [-5, 0.35], stbdAft: [-19, 0.35] },
      cleats: { portFore: [-5, -6.7], portAft: [-19, -6.7], stbdFore: [-5, 6.7], stbdAft: [-19, 6.7] },
      tails: { portFore: [-8, -6.1], portAft: [-22, -6.1], stbdFore: [-8, 6.1], stbdAft: [-22, 6.1] },
      rail: [-12, -7.1],            // where the port door goes over the side (the throw)
      nicanor: [-26, 0],            // he stands aft of the doors, facing forward
      // six sailors at work: [x, z, his work] — two at the doors' aft lashings ('lash'), two bailing over the rail ('bail'), one at the
      // port rudder's lashing in its housing ('steer': he keeps the turns tight, he does not steer), one hauling the brail hand over hand ('haul')
      sailors: [[-23, -5.4, 'lash'], [-23, 5.4, 'lash'], [4, -5.6, 'bail'], [7, 5.4, 'bail'], [-33.6, -3.9, 'steer'], [14, 1.2, 'haul']],
      hook: [-31, 6.2],             // the boat hook's rest by the starboard rail
      // the ship's rudder (המחשה, build 128 sea look 2): two broad-bladed quarter rudders, each on its stout post through a housing
      // on the quarter: the posts where they pass the housings (x, z); the cross tiller that joins the two tillers: its line across
      // the deck (x, from z, to z); the seventh sailor, the helmsman, who holds it with both hands (x, z: aft of the bar, to starboard
      // of the middle line so Nicanor stays in sight)
      steer: [[-33, -6.5], [-33, 6.5]],
      tiller: [-29.4, -4.3, 4.3],
      helm: [-30.25, 2.2],
      // (part 3, the play; המחשה) where a sailor stands to make each rope fast on its cleat (forward of it and inboard: never between the
      // play camera and a rope); the two lashers' own places in the play are the aft ones
      fast: { portFore: [-3.6, -6.4], portAft: [-14.5, -6.4], stbdFore: [-3.6, 6.4], stbdAft: [-14.5, 6.4] },
      // a ring pulled out of the deck: the next ring the rope is tied to (amot along x from the old one: aft for a fore ring, fore for an aft one)
      next: 1.6,
      // (part 3, the play) each tail's end coiled on the deck toward the player: the grip (x, z), two to port and two to starboard,
      // forward of the play camera and clear of every figure (the aft pair laid forward along the rail: aft of their cleats the deck
      // is under the frame's foot)
      coil: { portFore: [-7.5, -6.1], portAft: [-16.5, -6.1], stbdFore: [-7.5, 6.1], stbdAft: [-16.5, 6.1] },
      // the throw: the four sailors round the port door (two at its inboard edge, two at the rail) and where the door goes over the side
      lift: [[-15.5, -0.4], [-8.5, -0.4], [-19, -0.2], [-5, -0.2]],   // (B3: all four at its inboard edge: the rail side is the camera's)
      // (B6) the hold: the four sailors on the far side of the second door, by the starboard rail (never between the camera and the rings)
      help: [[-19.5, 6.5], [-14.5, 6.7], [-9.5, 6.7], [-4.5, 6.5]],
      // the hold: Nicanor down on the starboard door (his chest at its middle), the sailor who keeps the other ring for a mouse's
      // player (beside it, fore and inboard), and the empty place he stands before afterwards (by the port door's timbers)
      hold: [-12, 3.2], keeper: [-6.1, 4.5], sorry: [-12, 0.2],
    },
    // Akko (sea3): the ship moored port side to the quay, in the deck's frame then. The quay's edge (z) and top (y over the deck at the
    // mast), its stretch along x; the derrick's foot and its head over the water; the place the thrown door rises under the side; the
    // door's landing place on the quay
    quay: { edge: -8.6, top: 0.6, x: [-70, 40], derrick: { foot: [-12, -13.5], head: [-12, -7.6, 27] }, bob: [-12, -8.2], land: [-12, -18.5],
      // (part 3) the hoisting rope's hauling end on the quay (where the derrick's crew and the player's thumb haul: x, z), the hook's rest
      // over the water before it is taken (x, z, y over the deck), the quay's width inland, the derrick's crew (x, z). (The derrick's
      // head was 16 over the deck in part 1; a leaf 20 long hung by its ring must clear the quay: 27.)
      haul: [-4.5, -13.6], hookRest: [-17.5, -8.4, 5], w: 26, crew: [[-6.5, -14.6], [-3, -12.8], [-4.8, -16.2]],
      // (part 3, illustration) the windlass between the derrick's men (x, z), the bollards on the edge (x), the houses beyond the
      // harbour wall, where Akko's camera sees them past the quay's end ([x, z, width, depth, height])
      // (build 128 tuning T5, illustration) the quay hand by the edge, aft of the door's swing and clear of its landing place (x, z): he
      // reaches out his arms as the hung door swings toward the quay and drops them as it swings back
      reach: [-22, -9.8],
      windlass: [-4.8, -14.4], bollards: [-30, 12], houses: [[46, -14, 9, 7, 6], [50, -26, 7, 8, 8], [58, -38, 10, 6, 5], [30, -40, 8, 8, 7], [12, -42, 9, 7, 6]] },
    // (part 3) the opening picture: Alexandria's low shore astern as the ship leaves (המחשה: its x behind the stern, its length)
    coast: { x: -420, w: 1400, h: 7 },
    // the sea's cameras in the deck's frame ([eye], [aim]): the play camera behind and above Nicanor (the doors and four ropes in frame,
    // the horizon in the upper third); the lifted one, set for a swell over the bow (the whole ship and the next swell: the act turns it round the ship to face the
    // swell's heading); the look
    // sample's round (radius, height, aim)
    cam: { play: [[-41, 11, 0], [-3, 0, 0]], lift: [[-78, 42, 0], [6, 0, 0]], round: { R: 82, y: 34, t: [-8, 2, 0] },
      // (part 3, the play) the lifted view's top (u 0.45: the ship's whole length and the next swell's way, turned toward it), the
      // throw (the door over the rail and down), the hold (from starboard across the door: its two rings side by side), the empty
      // place, the opening picture (from ahead of her, looking aft: the shore she leaves behind her), Akko (from the quay, far aft of the
      // derrick, so its head, the hung door and its landing place are all in frame: the gap between her side and the quay where the door rises, the hook on the right, the hauling end on the left) and
      // its lifted view (the derrick, the door and the quay from above)
      // (the play's own deck shot: low and close over the two doors from aft, forward of the helmsman and the tiller (they are behind
      //  it), so the doors and their four ropes fill the frame; lifted, it rises and pulls back over the stern)
      deck: [[-28.6, 14, 0], [-12, 0, 0]],
      liftTop: { d: 56, el: 0.55, t: [-8, 0, 0] },
      // (B4) the lift inside the play zone, at u 0.45: distance and elevation over the aim, the aim, and how much of the way round toward
      // the next swell's side it turns (the rest past the play zone)
      liftPlay: { d: 28, el: 0.85, t: [-11, 0, 0], turn: 0.15 },
      // (the lift at u 0.2: risen and pulled back aft, the stern whole in the frame: its tiller, the helmsman, the quarter rudders)
      stern: [[-56, 19, 0], [-14, 0, 0]], throw: [[-5, 10, -23], [-12, 0, -9]] /* (B3: outboard of the port rail and above it, looking down at the water beside her side) */, hold: [[-12, 10.5, -3.6], [-12, 0.6, 3.4]],
      sorry: [[-27, 6.5, 7], [-12, 1, -3.4]], open: [[64, 22, 46], [-18, 4, 0]],
      akko: [[-52, 15, -36], [-12, 9, -11]], akkoLift: [[-42, 52, -52], [-12, 6, -12]] },
    // the cloud break (המחשה, build 128 sea look 2), in the sea's frame: where the bright patch of light first falls on the water
    // (far ahead, under the low sun) before it runs to the doors; the patch's radius; the torn hole's radius in the ceiling as seen
    // from the ship (radians, round the low sun)
    light: { from: [330, -150], r: 36, hole: 0.2 },
  },
};
const seaName = (k, r) => 'ים־' + heb(k + 1) + '־' + (r + 1);
function s06() {
  const E = [], C = S06, S = C.steps, R = C.ramp, W = C.wicket;
  const e3 = (id, kind, p, label, src, extra) => E.push(ent(id, kind, p[0], p[1], label, src, { y: p[2], extra }));
  e3('eastGate', 'gate', C.eastGate, 'לפני השער המזרחי של עזרת הנשים: כאן מחכים לדלתות', ILL);
  e3('ramp:foot', 'sledge', R.foot, 'רגל כבש העבודה: הדלת על המזחלת', ILL);
  e3('ramp:low', 'ramp', R.low, 'הקצה התחתון של כבש העבודה', ILL);
  e3('ramp:sill', 'sill', R.sill, 'סף שער ניקנור, ראש הכבש', 'מידות ב, ג');
  const yOn = (x) => R.low[2] + (R.sill[2] - R.low[2]) * (R.low[0] - x) / (R.low[0] - R.sill[0]);
  R.notch.forEach((x, i) => E.push(ent('ramp:notch' + (i + 1), 'notch', x, 0, `שקע עצירה ${i + 1}`, ILL, { y: +yOn(x).toFixed(4) })));
  R.rough.forEach(([a, b], i) => E.push(ent('ramp:rough' + (i + 1), 'rough', (a + b) / 2, 0, `קורה מחוספסת ${i + 1} בכבש`, ILL, { y: +yOn((a + b) / 2).toFixed(4) })));
  e3('capstan', 'capstan', C.capstan, 'הכננת, על רצפת העזרה', ILL);
  E.push(ent('steps:c', 'steps', S.c[0], S.c[1], 'מרכז חצי הגורן של חמש עשרה המעלות', 'מידות ב, ה'));
  S.ends.forEach(([x, z], i) => E.push(ent('steps:end' + 'NS'[i], 'end', x, z, `הקצה ה${i ? 'דרומי' : 'צפוני'} של המעלה התחתונה`, 'מידות ב, ה', { y: S.floor })));
  e3('steps:yard', 'yard', S.yard, 'מגרש האבנים של המעלות', ILL);
  e3('steps:table', 'table', S.table, 'שולחן התבניות', ILL);
  for (const i of [1, 8, 15]) {
    e3('steps:gap' + i, 'gap', S.gap[i], `רווח הסגירה במעלה ${i}`, ILL);
    e3('stand:ring' + i, 'stand', S.stand[i], `עמדת השחקן מול מעלה ${i}`, ILL);
  }
  e3('wicket:N', 'wicket', W.N, 'הפשפש הצפוני', 'מידות ב, ו');
  e3('wicket:S', 'wicket', W.S, 'הפשפש הדרומי', 'מידות ב, ו');
  e3('stand:wicketN', 'stand', W.standN, 'עמדת השחקן מאחורי הפשפש הצפוני', ILL);
  e3('stand:wicketS', 'stand', W.standS, 'עמדת השחקן מאחורי הפשפש הדרומי', ILL);
  e3('stand:wickets', 'stand', W.standBoth, 'עמדת השחקן מול שני הפשפשים', ILL);
  e3('stand:close', 'stand', C.close.stand, 'עמדת הדחיפה בתוך העזרה', ILL);
  e3('close:view', 'view', C.close.view, 'נקודת המבט לזריחה בעזרת הנשים', ILL);
  E.push(ent('gate:hingeN', 'hinge', C.gate.hinge.N[0], C.gate.hinge.N[1], 'ציר הכנף הצפונית של שער ניקנור', ILL, { y: C.gate.sill }));
  E.push(ent('gate:hingeS', 'hinge', C.gate.hinge.S[0], C.gate.hinge.S[1], 'ציר הכנף הדרומית של שער ניקנור', ILL, { y: C.gate.sill }));
  e3('levites:from', 'levites', C.levites.from, 'הלויים מחכים בעזרת הנשים לפני עלות השחר', ILL);
  e3('caravan:from', 'wagon', C.caravan.from, 'השיירה מעכו: העגלות עם הדלתות מחוץ לשער המזרחי', ILL);
  e3('caravan:to', 'wagon', C.caravan.to, 'העגלות עם הדלתות נכנסות בשער המזרחי', ILL);
  // the sea sheet's own entries: { id, kind, cell, k, r, km [east, south of the sheet's north-east corner, the cell's middle], label, src }
  const SEA = C.sea, km = SEA.sheet.km, SL = { alexandria: ['יציאה מאלכסנדריא (רואים ולא משחקים)', 'יומא לח ע"א'], storm: ['הסערה והנחשול', ILL], akko: ['נמלה של עכו', 'יומא לח ע"א'] };
  const seaE = Object.entries(SEA.places).map(([id, [k, r]]) => ({ id, kind: 'sea', cell: seaName(k, r), k, r, km: [-(k + 0.5) * km, (r + 0.5) * km], label: SL[id][0], src: SL[id][1] }));
  return { stage: 6, name: 'שער ניקנור וחמש עשרה המעלות', bounds: { x0: -20, x1: 200, z0: -30, z1: 30 }, ...C, sea: { ...SEA, entries: seaE }, entries: E };
}
/** a ring of the fifteen steps (i 1 … 15, 1 the lowest): its outer radius, its tread's middle radius, its base and its top (amot) */
export function ringOf(i) { const S = S06.steps, R = S.R1 - S.tread * (i - 1); return { i, R, mid: R - S.tread / 2, base: S.floor + S.rise * (i - 1), top: S.floor + S.rise * i }; }
/** a cell's name on the sea sheet (ים־<column>־<row>) */
export { seaName };
// ── /h128 ──

/* ───────── ── h129 ── stage 07's section (build 129, rule 65: the book first; docs/specs/build129-brief.md §1) ───────── */
/** stage 07, the chambers (world stage id 'lishka'). Every row of the brief's §1 checked against what the world draws (build 129):
 *  · the Gazit: temple.js box('ash', −100, 6, 58, −62, 28, 82) — one solid today; places.js GAZIT the same rectangle. Its room
 *    inside 1-amah walls, its floor at 16 (the Azarah's), the holy line on the mid-line of the Azarah's south wall (temple.js
 *    wall(−187, 67.5, 0, 73.5, 6, 44): z 67.5 … 73.5). That wall runs THROUGH both south chambers' rooms (6 … 44 high): the stage's
 *    temple.js block must cut it inside them (x −99 … −63 and x −146 … −132), as it must hollow the Gazit's solid;
 *  · the Gazit's east door (−63, 76) is in the chol half, over the Chel's terrace (6): the floor inside is 16, so outside that door
 *    there is a drop of 10 — it is read as the door of an inner stair (המחשה); the crowd stands inside it (−65, 76);
 *  · the Golah: x −147 … −131 is free between the Delek gate house (temple.js gate('S', −169, 64, −151, 78)) and Bechorot (−127 …
 *    −109); it crosses the south wall as the Gazit does (its south face z 74, half an amah beyond the wall's outer face). Its walls
 *    rise to 28 as the Gazit's (המחשה); its door to the Azarah in its north wall at x −139, where the channel goes out (המחשה, added:
 *    the stand looks north through it to the channel and the troughs). The Azarah's walkers (stages.js AZ_WP) use a corner point
 *    (−140, 58) on the room's north face and the aisle z 53 west of x −95, over the channel's line: the stage's world must move that
 *    point off the room and let the walkers step over the channel (it is a groove in the floor);
 *  · the three troughs at z 50 stand on the Azarah's floor 14 amot south of the House's south wall (avodah3d.js: the House z ±35.9
 *    west of the Ulam, x −176.9 … −91.2; the Ulam x −92 … −76.5): free;
 *  · the instruments chambers: temple.js wall(0, −26, 8, −14, 6, 32) and wall(0, 14, 8, 26, 6, 32), the two blocks by Nicanor; the
 *    Nikanor wall (x 0 … 6) runs inside them: their lower storey must be cut. The ground before their east faces (x 8) is the women's
 *    court at 6 (stages.js groundAt); the fifteen steps reach z ±13.5 only, the openings are at |z| 17 … 23: free;
 *  · Beit HaMoked: temple.js buildMoked — walls 1 amah round x −178 … −142, z −83 … −58, floor 16, the dome one half cylinder of
 *    radius 12.5 round the axis x (centre y 30.2, z −70.5), 36 long (x −178 … −142). Its rings, 3 deep, run from its EAST end (x −142)
 *    west, so ring 1 is x −145 … −142 (the brief's "x −142 … −139" lay outside the hall, east of its east wall); the deck's stand
 *    (−146, −70.5) stands just west of ring 1, under it, looking east and up;
 *  · the Levite who sleeps outside (the brief's (−160, −86, 6)): the Chel's terrace at 6 ends at z −83.5 (stages.js groundAt: from
 *    there its half-amah steps go down; z −86 is the step at 3.5). He lies along the north wall across the door to the Chel, on the
 *    half amah of terrace before it: (−160, −83.25, 6);
 *  · the hearth (−160, −70.5), the marble slab (−160.5 … −159.5, −76.5 … −75.5, its ring at (−160, −76)), the two doors and the six
 *    ledges are buildMoked's own numbers. */
const S07 = {
  floors: { azara: 16, nashim: 6, israel: 13.5 },
  gazit: {
    block: [-100, 58, -62, 82], in: [-99, 59, -63, 81], floor: 16, holy: 70.5, chol: [70.5, 81],
    // the opening straight row: the seven bench stones' centres (x) on z 79; a stone is 4 long, 1.5 deep, 1.2 high (המחשה)
    row0: { z: 79, xs: [-92.5, -88.5, -84.5, -80.5, -76.5, -72.5, -68.5], L: 4, D: 1.5, H: 1.2 },
    door: [-63, 76], crowd: [-65, 76], wait: [-81, 66], stand: [-81, 72, 16], face: 'S',
    // (build 129, part 2: the room's door from the Azarah in its north wall, the holy half — temple.js h129Gazit: x −83 … −79, 16 … 24;
    //  the judges and the kohen come in by it; המחשה)
    doorN: [-81, 58.5], doorNW: 4, doorNH: 8,
    // (closing round, F5: where the kohen stands while the film after a Gazit work looks at the court at work — the holy half's east part)
    filmKohen: [-69, 67.5],
  },
  golah: {
    room: [-147, 58, -131, 74], floor: 16, top: 28, wallT: 1,
    // its door to the Azarah in the north wall (x middle, z of the wall's middle; width; height over the floor) — added in build 129
    door: [-139, 58.5], doorW: 4, doorH: 8,
    // the well's mouth: its centre, the shaft's radius, the rim's height and thickness; the wheel over it: its centre, the axle over the
    // floor, along x; the wheel's radius (the two rope lines hang 0.9 either side of the shaft's axis, along z); the frame's posts (x off
    // the centre, either side)
    well: [-139, 65], shaftR: 2.5, rimH: 0.8, rimT: 0.6,
    wheel: { at: [-139, 65], axle: 5, along: 'x', R: 0.9, post: 3.2 },
    depth: [10, 20, 30],
    // the trough by the well, the channel's head; its size (x, z, the rim over the floor)
    head: [-139, 60], headSize: [2.2, 1.2, 0.8],
    // the channel in the floor: the main line, and the three spurs (x; from z, to z) into the troughs; its width
    channel: { main: [[-139, 60], [-139, 52], [-111, 52]], spurs: [[-139, 52, 50], [-125, 52, 50], [-111, 52, 50]], w: 0.5 },
    troughs: { A: [-139, 50], B: [-125, 50], C: [-111, 50] }, troughSize: [3, 1.6, 0.9],
    sluice: { A: [-139, 52], B: [-125, 52], C: [-111, 52] },
    stand: [-139, 69, 16], face: 'N',
    // (build 129, part 3) the plank laid over the well's mouth along the axle, between the two ropes (length, width, thickness), the two
    // crew men who haul standing on it either side of the ropes; where a flood's puddle lies beside its basin (offset from its centre);
    // where the kohen stands to wash his hands over the first trough's water (build 129 G11: on the court's pavement by its east end,
    // facing west over it; the trough's middle is what he faces) — all המחשה
    plank: { L: 5.9, w: 0.5, h: 0.14 }, crew: [[-140.35, 65], [-137.65, 65]], puddle: [1.9, -2.1], wash: [-136.9, 50],
  },
  vault: {
    // the small arches: the opening's middle in the block's east face (x 8); the arch from z, to z; floor, springing, the crown's
    // underside, top (the Israel court's level); the stones in the arch; the leg on rock (z, the south one)
    N: { at: [8, -20], z: [-23, -17], floor: 6, spring: 9.5, crown: 12.5, top: 13.5, stones: 7, block: [0, -26, 8, -14] },
    S: { at: [8, 20], z: [17, 23], floor: 6, spring: 9.5, crown: 12.5, top: 13.5, stones: 9, rock: 23, block: [0, 14, 8, 26] },
    standN: [3, -20, 6], standS: [3, 20, 6], face: 'E',
    // Beit HaMoked's great vault: the hall; the barrel's axis (east–west) at z, its springing and radius; the legs' walls (z from, to);
    // the rings: 3 deep, 12 from the east end x −142 westward; ring 1 x −145 … −142; 11 stones in a ring
    M: { hall: [-177, -82, -143, -59], floor: 16, axisZ: -70.5, spring: 30.2, R: 12.5, legs: [[-83, -82], [-59, -58]], east: -142, ringD: 3, rings: 12, stones: 11 },
    deck: { y: 29, stand: [-146, -70.5, 29], face: 'E' },
    // (closing round, F1–F2: the work's moment as it stands, "עשיתי את זה" (the brief): the centering carried out, the stones in the air.
    //  In a small chamber the Levite stands with his nevel in the low door (the arch's opening, beside its middle) and the kohen in the
    //  women's court beside the arch's jamb, never before it; the arch is the face of the upper storey's wall, which rises flush over
    //  it (temple.js nikanor:cut), so no man can stand on it there. On the great vault's ring a crew man stands on its crown (its
    //  extrados, the spring + R + 1); the kohen is out of that picture (from the hall's west end he could not stand whole in it))
    after: { N: { kohen: [9.9, -13.6], levi: [7.6, -18.6] }, S: { kohen: [11.2, 24.6], levi: [7.6, 18.6] }, M: { man: [-143.5, -65.9, 42.9] } },   // (closing round 2: the vault's man on the ring's south shoulder, 20° off the crown, clear of the north wall's band z −73.5 … −67.5: from the low after-eye the sky is behind him)
  },
  night: {
    hearth: [-160, -70.5, 16], slab: [-160, -76, 16], slabSize: 1,
    // the camera at each gate he locks: back from the gate's inner face into the court and up (amot), the torch beside the gateway
    // (round 2: the gate a quarter of the frame or more); the gateway's size from inside, as the Mishnah's gates (מידות ב, ג: twenty
    // high, ten wide); the gate houses' depth (temple.js gate(): 14, its outer face the entry's z); Nikanor's half depth and the Israel
    // court's floor; Beit HaMoked's door to the Chel from inside the hall (its wall 1 amah, the hall's floor 16; temple.js door('N', −83 …):
    // 6 wide inside, between the two north ledges)
    // (round 3) the whole gateway in the frame, its top not cut: the lens (degrees), the share of the frame's height the gateway's height
    // takes (back from its face as far as that needs), the aim's height on the gateway (share of its height), the eye over the aim, the
    // torch's light (the full-size gates; a smaller gateway less) and the torch's height
    gateCam: { fov: 60, fill: 1.5, mid: 0.55, up: 1.5, lamp: 18, torch: 6.5 },
    // (closing round, F3: a gate whose foot a built thing hides from that eye gets its own: back from the gate's face, the eye over the
    //  aim. The gate of the spark: the eight dwarf pillars with their cedar beam north of the altar (temple.js, Middot 3:5: z −60.4 …
    //  −59.6, the beam's top 20.5) stand 3.5 amot before its inner face across its whole width — from 12 back and 17 over the aim (55° down; the director keeps an eye
    //  35 from its aim back along the same line — main.js minDistance — and from either the line to the gateway's foot passes over the beam)
    gateEye: { 'gate:nitzotz': { back: 12, up: 17 } },
    // (round 3) the מדורה: long logs (3–4 amot) crosswise in three layers (offsets across each layer), their radius; the ring of hearth
    // stones; the coals between; the flames (how many, within what radius of the middle, their heights)
    fire: { layers: [[-0.85, 0, 0.85], [-0.85, 0, 0.85], [-0.45, 0.45]], len: [3.1, 3.9], r: 0.2, ringN: 13, ringR: 2.4, embers: 40, flames: 24, flameR: 1.25, flameH: [0.8, 2.5] },
    // (round 3) who sleeps where: the elders on ledges 3–6 (the two by the Azarah's door, the two in the hall's arms; none by the door to
    // the Chel, the gate he locks); the young on the floor round the fire, their feet to it ([angle in half-turns from east toward the
    // south, the feet's distance from the hearth's middle]); the kohen kneels at the slab's south-west corner, toward
    // the fire (whole in the hall's frame, off the fire's line and off the sleep picture's line)
    elderOn: [2, 3, 4, 5], youngAt: [[0, 3.1], [0.2, 3.1], [0.4, 3.1], [0.6, 3.1], [0.8, 3.1], [1, 3.1]], kneel: [-1.4, 1.4],
    // (round 3) the door the Levite sleeps outside: temple.js door('N', −83, −160, 10, 6, 24): its width and height, its leaves set out
    // from its face
    leviDoor: { w: 10, h: 18, out: 0.6 },
    fireLight: { dist: 34, decay: 1.6 }, moon: { at: [-60, 120, 70], aim: [-80, 16, 0] },
    gateIn: { w: 10, h: 20, depth: 14, nikHalf: 7, mokedWall: 1, mokedW: 6, mokedH: 8 },
    door: { azara: [-160, -58], chel: [-160, -83] },
    // buildMoked's six stone ledges (x0, z0, x1, z1; from the floor 16 to 17)
    ledges: [[-166, -82, -163.2, -80.4], [-156.8, -82, -154, -80.4], [-166, -60.6, -163.2, -59], [-156.8, -60.6, -154, -59], [-177, -72.5, -175.4, -68.5], [-144.6, -72.5, -143, -68.5]],
    ledgeY: 17,
    levi: [-160, -83.25, 6],
    // (closing round 2) where he sits: on that half amah, his back to the wall east of the door (the door 10 wide on x −160: its jamb at
    // −155), clear of the lamp before the door; the landing's flat ends at z −83.5, he takes −83 … −83.5
    leviSeat: [-153.6, -83.2, 6],
  },
  // what stands round the Golah in the built world, as the look sample draws it (the numbers are the world's own): the Azarah's south
  // wall (temple.js wall(−187, 67.5, 0, 73.5, 6, 44)), the Delek and Bechorot gate houses (temple.js gate('S', …, 6, 50)), the House's
  // south face west of the Ulam and the Ulam (avodah3d.js: z ±35.9 for x −176.9 … −91.2; x −92 … −76.5, z ±50.9), the Chel's terrace (6)
  around: {
    southWall: { z: [67.5, 73.5], y: [6, 44] },
    gateHouses: [[-169, 64, -151, 78], [-127, 64, -109, 78]], gateTop: 50,
    house: { x: [-176.9, -91.2], z: 35.9, top: 116 }, ulam: [-92, -50.9, -76.5, 50.9],
    chel: 6,
  },
  // (part 2) the right thumb's look (world/look.js, rule 66): the walls of the rooms the acts play in, as [x0, z0, x1, z1, bottom, top]
  // with the walls' thickness — the Gazit (temple.js's walls to the cornice), the two instruments chambers, Beit HaMoked's hall — so a
  // lifted camera rises over them instead of looking at their outside
  lookRooms: { T: 1, rooms: [[-100, 58, -62, 82, 6, 28.4], [0, -26, 8, -14, 6, 32], [0, 14, 8, 26, 6, 32], [-178, -83, -142, -58, 6, 30.25]] },
  // the stage's cameras ([eye], [aim]). Part 1: the Golah's play view behind the kohen at the stand and its lifted view; the water
  // look sample's keyframes [[eye], [aim], at s]. (The other stations' cameras join in part 2.)
  cam: {
    // (part 2) the stage's opening: from high over the Mount, down to the two south chambers, then Beit HaMoked's hall open to the sky
    // (closing round 2: four cuts, each one built thing of this stage whole, from high outside (a probe at 32° showed the instruments
    //  chambers and the Golah cut at the frame's edges: the lens 44°)
    //  the House: the instruments chambers by Nicanor, the Gazit, the Golah's well house (steep, over the Azarah's south wall), Beit
    //  HaMoked from the north)
    open: [[[70.2, 103.2, 54.1], [4, 19, 0]], [[-52.8, 112.6, 2.3], [-81, 28, 70]], [[-125.9, 84.2, 73.9], [-139, 22, 66]], [[-127.9, 108.7, -124], [-160, 23, -70.5]]], openFov: 44,
    // (part 2) the Gazit's play view: from high over the north wall, down on the chol half (the roof is not on yet); its lens (degrees)
    gazit: [[-81, 44, 59], [-81, 16, 75.5]], gazitFov: 40,
    // (the rows: nearly overhead, the holy half's strip by the line in the frame where the mats wait; from so high a kneeling student
    //  covers only his own place, never the bench behind him)
    gazitRows: [[-81, 50, 64], [-81, 16, 74.5]],
    // (part 2) the instruments chambers from inside, at the stand, looking east at the arch against the day (a wide lens: the room is 6
    // deep); Beit HaMoked's great vault from the hall west of ring 1, at the deck's height
    vaultN: [[1.4, 9.6, -20], [8, 10.2, -20]], vaultS: [[1.4, 9.6, 20], [8, 10.2, 20]], vaultFov: 64,
    // (closing round 2: the great vault's ring is the subject — from the hall's west end at the deck's height, the whole ring and both
    //  masons on the deck in the frame. The Azarah's north wall runs east from the ring's own east face (temple.js wall(−142, −73.5,
    //  0, −67.5, 6, 44)): from any eye inside the hall its end stands behind the ring's middle; from here its top is level with the crown)
    vaultM: [[-174, 29.5, -70.5], [-143.5, 31, -70.5]], vaultMFov: 60,
    // (part 2) the night: the slab over the fire from the nave (the fire lights it); the hall with the fire and the sleepers, from
    // the nave's south end (x −166 … −154: the four chambers' partitions stand east and west of it, up to 27)
    night: [[-159, 22.5, -65.5], [-160, 16.3, -76]], nightFov: 50, nightHall: [[-160, 23, -81], [-160, 16.5, -67]],
    // (round 2) the slab close: from 2.5 south of it and 1.6 over the floor, the slab a quarter of the frame and its ring for two thumbs,
    // the two ledges by the north wall with their elders, the young kohanim on the floor beyond it; its lens. The Levite outside, from
    // the Chel's terrace before the hall's north door
    // (round 3: from the north of the slab looking south, so the gate he locks in the hall's north wall has no sleepers at its foot: over
    // the slab the kohen kneeling beyond it, the fire and the young round it, the elders on the ledges by the Azarah's door)
    nightSlab: [[-160, 17.7, -78.6], [-160, 16.2, -74.6]], nightSlabFov: 52,
    // (closing round 2: back and a little east, so the Levite seated east of the door (leviSeat) is whole in the frame's left part and
    //  the shut door with its lamp in the middle)
    nightLevi: [[-156.5, 11, -95], [-159.5, 7.5, -84]],
    // (round 3) where he sleeps on the slab: from the south-east, the fire beside the camera lighting him
    // (closing round: from (−153.8, 19.6, −71.8) the frame's edge cut the young sleeper east of the fire, the one west of it and the
    //  elder on the west ledge, and the figures gate took them out and reported them. From the north, between the two north ledges and
    //  low, as the slab's own picture: he lies on the slab in the front, the fire and the young round it beyond, the elders on their
    //  ledges — every sleeper whole in the frame at 960×600 and 1600×900, and at the hall's own look lifted a third (night.js lookFn))
    nightSleep: [[-160, 18.5, -81], [-160, 16.4, -75.5]], nightSleepFov: 58,
    // the night's last three pictures (round 3): from the hall's floor at its west end looking east and up — the fire in the lower
    // third with the sleepers round it, the barrel over it; low over the first trough along the channel — the water, the other
    // troughs behind, the Azarah's wall and the House beyond; inside the Gazit at eye height from its north side — the round bench whole
    // (round 4: the trough picture from five amot up and west of the first trough, so all three troughs lie in the frame's lower half)
    end: [[[-174.5, 25, -70.5], [-140.5, 23.8, -70.5]], [[-150, 21, 56], [-118, 16.4, 49]], [[-80.5, 19.6, 61.2], [-80.5, 16.8, 79]]],
    // (round 3) each picture's lens: the hall's barrel whole over the fire; along the troughs; the round bench whole
    endFov: [74, 60, 64],
    // ── h129 round 4 ── the stage's last picture, held under the frontier card: the court and the chambers from high — never the
    // Gazit's inside with its roof on, nor the follow camera against a wall ── /h129 ──
    // (round 5: far and high from the south over the Gazit and the Golah, the House in the middle, Beit HaMoked at the far north-west:
    //  the whole court of this stage in the world's 32° lens around the card at 960×600)
    after: [[-150, 210, 230], [-125, 16, 0]],
    // ── h129 round 4 ── each work's picture after it (the director's pull-back): a small arch from the women's court through its opening
    // (the chamber is under the Israel court: from above it is stone); the great vault and the night from the hall's floor ── /h129 ──
    done: { night: [[-159, 22.5, -65.5], [-160, 16.3, -76]] },
    // ── h129 closing round ── (F1, F2, F4) each work's composed picture, [eye, aim, lens]: the moment as it stands is played in it
    // (vault.js finish: a cut, the bot's still '<id>-stands') and the film after the work opens on the same picture (a cut, no swing
    // through the hero). A small arch three-quarter from the women's court on the side of the Levites' steps (beyond the arch the lepers'
    // chamber's wall stands at z ∓27.5: no eye there), the eye outside the steps' half circle (radius 13.5 round (10, 0)), the arch
    // whole and large in the middle, the kohen whole in the left third; the great vault's ring from the hall's west end over the four
    // chambers' partitions (27.6), the ring whole and the man on its crown against the sky (behind the ring's middle the Azarah's north
    // wall's end, temple.js wall(−142, −73.5, 0, −67.5, 6, 44), stands on the vault's axis: it is the court's wall, not a stray); the
    // Gazit three-quarter from high over its north-west corner (over the north wall's top, 28.4): the bench, the rows, the scribes and
    // the kohen in the holy half in the left third ── /h129 ──
    stands: { vaultN: [[24, 11, -8], [9.5, 9.8, -18.6], 32], vaultS: [[24, 11, 8], [9.5, 9.8, 19], 32], vaultM: [[-174, 22, -70.5], [-143.5, 35.5, -70.5], 60], gazit: [[-100, 40, 52], [-80, 17, 73], 44] },
    golah: [[-139, 21.6, 73.2], [-139, 15.4, 61]],
    // (build 129, part 3, G5: the play in the built world, its walls whole) the shaft from the kohen's stand, as the water look's first
    // frame (cam.look[0]): the eye over the stand, tilted down into the well — the wheel at the top, the rope down to the bucket; the eye
    // comes in over the mouth (to `mouth` amot of the axis at the rim for each amah below) as the bucket is deeper; the aim on the axis
    // (x off aim[0]) between the bucket and the axle (aim[1] of the way up), never deeper than aim[2] under the floor
    // (closing round 2: the eye on the well's own x, south of the mouth — the two haulers on the plank (x ∓1.35) at the picture's two
    //  sides, the mouth, the ropes and the bucket between them clear; from x −141.2 the west hauler stood over the mouth)
    golahShaft: { eye: [-139, 26, 68.2], mouth: 1.9, aim: [0, 0.25, 9.5] },
    // the pour: high by the room's south wall, west of the wheel's plane, looking north and down under the frame's cap and through the
    // door: the bucket at the rim, the trough by the well, the channel out by the door, trough A beyond it in the court
    golahPour: [[-140.8, 31, 69.2], [-139.3, 16, 57.5]],
    // (the sharing: from the north over the troughs in use, as close as they all fit the frame's width (margin m amot each side, at
    //  least dmin), el degrees down; the aim on their row at z, y over the floor); the moment (G11): the kohen standing at the first
    //  trough's east end, from the north-north-west at his chest's height, three-quarter from his side — his arms out over the trough,
    //  the whole figure, the trough's water beside him; the film after a work (G13, G15): the Golah as it stands, in two pictures
    //  cut one after the other — the court from the north-west at a three-quarter height (about 33° down): the three troughs in a row
    //  with their water, the channel along them and out of the chamber's door; then from high over the court north of the chamber (its
    //  walls are 12 amot: only from this steep can the eye see over them) the wheel and the well's mouth, the channel, the troughs below
    golahShare: { el: 52, dmin: 8.5, m: 0.8, z: 50.6, y: 0.2 }, golahWash: [[-141.5, 18.8, 42.1], [-138.1, 17.8, 50]],
    golahFilm: [[[-157, 37, 42], [-127, 16, 53]], [[-126, 70, 44], [-127, 16, 58]]],
    golahFov: 50,
    // the one golden light over the Golah: light B (main.js TIMES.dusk: its colour #FFBA6E, low from the west), its elevation and
    // azimuth in degrees (the world's convention, main.js setTime: from +x toward +z): low and golden, from the west a little to the
    // north, so it runs along the court between the House and the south wall and over the cut-down west wall into the room (illustration)
    sun: { el: 24, az: 186 },
    // the look sample's camera: down the shaft from the lit (west) side, the pour from the side, over the cut-down north wall, up the
    // channel from the east toward the coming water, the basin from the east with the sun's glint on it
    look: [
      [[-141.2, 26, 67.6], [-138.9, 6.5, 64.7], 0],
      [[-141.5, 25.6, 67.8], [-138.9, 8.4, 64.6], 3.5],
      [[-143.2, 23.6, 67.4], [-139, 14.4, 64.4], 6.8],
      [[-142.2, 22, 57.2], [-139, 18, 61], 8.6],
      [[-141.8, 21.4, 57.3], [-139, 17.5, 60.4], 11.2],
      [[-134.8, 20.5, 54.6], [-134, 15.8, 52.1], 12.9],
      [[-122.4, 18.4, 52.7], [-129.5, 15.8, 52], 14.4],
      [[-120.6, 17.6, 50.6], [-125.2, 15.3, 50], 16.4],
      [[-120.9, 17.5, 50.2], [-125.3, 15.3, 49.9], 20],
    ],
  },
};
function s07(s04) {
  const E = [], C = S07, G = C.gazit, W = C.golah, V = C.vault, N = C.night;
  const e3 = (id, kind, p, label, src, extra) => E.push(ent(id, kind, p[0], p[1], label, src, { y: p[2], extra }));
  const mid = (r) => [(r[0] + r[2]) / 2, (r[1] + r[3]) / 2];
  // the Gazit
  e3('gazit', 'chamber', [...mid(G.block), G.floor], 'לשכת הגזית', 'מידות ה, ד');
  e3('gazit:holy', 'line', [(G.in[0] + G.in[2]) / 2, G.holy, G.floor], 'קו הקודש בלשכת הגזית (מקומו המחשה)', 'יומא כה ע"א');
  G.row0.xs.forEach((x, i) => e3('gazit:stone' + (i + 1), 'bench', [x, G.row0.z, G.floor], `אבן ספסל ${i + 1} בשורת הפתיחה`, ILL));
  e3('gazit:door', 'door', [...G.door, G.floor], 'הפתח בקיר המזרחי של הגזית', ILL);
  e3('gazit:doorN', 'door', [...G.doorN, G.floor], 'הפתח מן העזרה אל לשכת הגזית', ILL);
  e3('gazit:crowd', 'crowd', [...G.crowd, G.floor], 'הקהל בפתח', ILL);
  e3('gazit:wait', 'stand', [...G.wait, G.floor], 'הדיינים מחכים עומדים, בחצי הקודש', ILL);
  e3('stand:gazit', 'stand', G.stand, 'עמדת השחקן בגזית', ILL);
  // the Golah
  e3('golah', 'chamber', [...mid(W.room), W.floor], 'לשכת הגולה (מקומה המחשה)', 'מידות ה, ד');
  e3('golah:well', 'well', [...W.well, W.floor], 'פי הבור', 'מידות ה, ד');
  e3('golah:wheel', 'wheel', [...W.wheel.at, W.floor + W.wheel.axle], 'הגלגל שעל הבור (צורתו המחשה)', 'מידות ה, ד');
  e3('golah:door', 'door', [...W.door, W.floor], 'הפתח מלשכת הגולה אל העזרה', ILL);
  e3('golah:head', 'trough', [...W.head, W.floor], 'השוקת שליד הבור, ראש התעלה', ILL);
  e3('golah:bend', 'channel', [...W.channel.main[1], W.floor], 'התעלה פונה מזרחה', ILL);
  e3('golah:end', 'channel', [...W.channel.main[2], W.floor], 'סוף התעלה', ILL);
  for (const k of ['A', 'B', 'C']) {
    e3('golah:trough' + k, 'trough', [...W.troughs[k], W.floor], `שוקת ${k === 'A' ? 'א' : k === 'B' ? 'ב' : 'ג'} בעזרה`, ILL);
    e3('golah:sluice' + k, 'sluice', [...W.sluice[k], W.floor], `אבן הסכר של שוקת ${k === 'A' ? 'א' : k === 'B' ? 'ב' : 'ג'}`, ILL);
  }
  e3('stand:golah', 'stand', W.stand, 'עמדת השחקן בגולה', ILL);
  W.crew.forEach((p, i) => e3('golah:crew' + (i + 1), 'crew', [...p, W.floor + W.rimH + W.plank.h], `מושך בחבל ${i + 1}, על הקרש שעל פי הבור`, ILL));
  e3('golah:wash', 'kohen', [...W.wash, W.floor], 'הכהן נוטל ידיו מן השוקת הראשונה', ILL);
  // the vault
  e3('vault:N', 'arch', [...V.N.at, V.N.floor], 'הקשת של לשכת כלי השיר הצפונית (מידותיה המחשה)', 'מידות ב, ו');
  e3('vault:S', 'arch', [...V.S.at, V.S.floor], 'הקשת של לשכת כלי השיר הדרומית (מידותיה המחשה)', 'מידות ב, ו');
  e3('stand:vaultN', 'stand', V.standN, 'עמדת השחקן בלשכת כלי השיר הצפונית', ILL);
  e3('stand:vaultS', 'stand', V.standS, 'עמדת השחקן בלשכת כלי השיר הדרומית', ILL);
  e3('vault:M', 'vault', [(V.M.hall[0] + V.M.hall[2]) / 2, V.M.axisZ, V.M.spring], 'הקמרון הגדול של בית המוקד ("כיפה", בעולם קמרון חבית: המחשה)', 'מידות א, ח');
  e3('vault:ring1', 'ring', [V.M.east - V.M.ringD / 2, V.M.axisZ, V.M.spring], 'הטבעת הראשונה של הקמרון', ILL);
  e3('stand:vaultM', 'stand', V.deck.stand, 'עמדת השחקן על במת הפיגום', ILL);
  // the night
  e3('night:hearth', 'hearth', N.hearth, 'המדורה בבית המוקד', 'שבת א, יא');
  e3('night:slab', 'slab', N.slab, 'טבלת השיש, אמה על אמה, והטבעת', 'מידות א, ט');
  e3('night:doorAzara', 'door', [...N.door.azara, C.floors.azara], 'הפתח מבית המוקד אל העזרה', 'מידות א, ז');
  e3('night:doorChel', 'door', [...N.door.chel, C.floors.azara], 'הפתח מבית המוקד אל החיל', 'מידות א, ז');
  N.ledges.forEach((b, i) => e3('night:ledge' + (i + 1), 'ledge', [...mid(b), N.ledgeY], `רובד אבן ${i + 1}`, 'מידות א, ח'));
  e3('night:levi', 'levi', N.levi, 'בן לוי ישן לו מבחוץ', 'מידות א, ט');
  // the gates that lock at night: stage 04's own entries (never retyped here)
  const gates = s04.entries.filter((e) => e.kind === 'gate').map((e) => e.id);
  // (round 2) where each gate is locked from inside: its gateway's inner face (middle, at the floor), the way into the court, its size —
  // read from stage 04's entries: the gate houses of the north and south walls 14 deep (their entry the outer face), Nikanor's from its
  // middle, Beit HaMoked's own door to the Chel (its entry stands in the hall)
  const GI = N.gateIn, locks = {};
  for (const e of s04.entries.filter((q) => q.kind === 'gate')) {
    if (e.id === 'nikanor') locks[e.id] = { at: [e.x - GI.nikHalf, C.floors.israel, e.z], n: [-1, 0], w: GI.w, h: GI.h };
    else if (e.id === 'gate:moked') locks[e.id] = { at: [N.door.chel[0], C.floors.azara, N.door.chel[1] + GI.mokedWall], n: [0, 1], w: GI.mokedW, h: GI.mokedH };
    else { const s = e.z < 0 ? 1 : -1; locks[e.id] = { at: [e.x, C.floors.azara, e.z + s * GI.depth], n: [0, s], w: GI.w, h: GI.h }; }
  }
  return { stage: 7, name: 'הלשכות', bounds: { x0: -185, x1: 30, z0: -90, z1: 90 }, ...C, night: { ...N, gates, locks }, entries: E };
}
// ── /h129 ──

/* ───────── ── h131 ── stage 08's section (build 131, rule 65: the book first; docs/specs/shlav-08-he.md "טבלת הכתובות") ───────── */
/** stage 08, the altar's foundation (world stage id 'yesod'). Every row of the spec's table checked against what the world draws:
 *  · the altar (temple.js 'The Altar'): x −54 … −22, z −19.5 … 12.5 on the Azarah's floor 16 — as the spec;
 *  · the yesod as the world builds it (temple.js S('yesod') and stages.js groundAt's `yes`): the whole north (x −54 … −22, z −19.5 …
 *    −18.5), the whole west (x −54 … −53, z −18.5 … 12.5), ONE MORE AMAH into the south beyond the west strip (x −53 … −52, z 11.5 …
 *    12.5) and one more into the east beyond the north strip (x −23 … −22, z −18.5 … −17.5), and the first course under the body (x −53
 *    … −23, z −18.5 … 11.5). The spec read "אוכל בדרום/במזרח אמה" as the corner cells of the strips themselves; the built world reads
 *    it as one amah past them. The world decides (the spec: "אם העולם הבנוי אומר אחרת, הוא קובע"), so: the east timber starts at z
 *    −17.5 (spec −18.5) and the south timber at x −52 (spec −53); each is 30 / 29 long (spec 31). The south timber takes the south-east
 *    corner cell (x −23 … −22, z 11.5 … 12.5) and the east one butts on it there: the joint the player fixes is that cell's middle
 *    (−22.5, 12), as the spec;
 *  · the two holes (מידות ג, ב): the world draws them at (−53.55, 12) and (−52.5, 12) (places.js LIBATION_BOWLS.holes, shown with the
 *    altar's body, set 'guf'): the reeds stand there (spec (−53.7, 12), (−53.3, 12)); both on the yesod (the west strip's last cell
 *    and the south amah), clear of the south timber;
 *  · north of the altar the slaughter place's floor rings (temple.js 'North of the altar': x −47, −41, −35, −29; z −29.5 … −49.5 every
 *    4): the spec's fire (−30, −32) stood on the rings at (−29, −29.5) and (−29, −33.5); it moves to the open square between them
 *    (−32, −31.5); the pile from the pit (−46, −32) likewise to (−44, −31.5). Between the altar's north face and the first ring row
 *    (z −19.5 … −29.5) the floor is free: the stands and the witness are there;
 *  · the Ulam's twelve steps begin at x −55 (temple.js xr[0]): one amah west of the frame's west face. The frame's west timber lies
 *    against the altar's edge (x −54.5 … −54); a man at a west corner stands on the first tread (y 16.5) — the frame coder places them;
 *  · the south stand (−48, 17): west of the kevesh (x −46 … −30, set 'guf', not built yet) and east of the ring slab (−54.3, 14.2): free.
 *  The pit at Beit Kerem has its own small sheet (4 × 4 cells of 25, its middle the pit's middle) set on the one world grid: its middle
 *  is written ONCE here (pit.origin) and every place of the sheet is local to it (lx east, lz south). */
const S08 = {
  floor: 16, top: 17,
  altar: [-54, -19.5, -22, 12.5], mid: [-38, -3.5],
  // the yesod as the world builds it ([x0, z0, x1, z1]) — מידות ג, א; רמב"ם בית הבחירה ב, י
  yesod: { N: [-54, -19.5, -22, -18.5], W: [-54, -18.5, -53, 12.5], S1: [-53, 11.5, -52, 12.5], E1: [-23, -18.5, -22, -17.5], body: [-53, -18.5, -23, 11.5] },
  // the witness's four stakes at the frame's corners (illustration of רמב"ם ב, א–ד)
  stakes: { NW: [-54, -19.5], NE: [-22, -19.5], SE: [-22, 12.5], SW: [-54, 12.5] },
  // the frame (רש"י זבחים נד ע"א: "דפוס מרובע עשוי מארבע קרשים, וכל אחת ארוכה ל"ב"): four timbers of 32 round the altar's edge, their
  // thickness (המחשה) outside it, an amah high (16 … 17)
  frame: { L: 32, T: 0.5, y0: 16, y1: 17 },
  // the two timbers that keep the place with no yesod empty (רמב"ם ב, טז: "גוף של עץ או אבן"; their length המחשה, see above)
  wood: { E: [-23, -17.5, -22, 11.5], S: [-52, 11.5, -22, 12.5], joint: [-22.5, 12] },
  reeds: [[-53.55, 12], [-52.5, 12]],
  // the player's three sections (המחשה); level 3 with the south-west corner's amah to z 12.5 (x −54 … −52: the west strip and the south amah)
  sections: { 1: [-43, -19.5, -33, -9], 2: [-43, -9, -33, 1.5], 3: [-54, 1.5, -43, 11.5], corner3: [-54, 11.5, -52, 12.5] },
  fire: [-32, -31.5], pile: [-44, -31.5],
  // ── h131 frame ── the frame's three works and the finale (all המחשה): level 1 the joined frame as the crew set it down — its shift
  // [dx, dz] and turn (degrees) from the stakes; level 2 the four loose beams as the crew laid them inside the place — each its middle
  // and its turn (0 along x, 90 along z); level 3 the frame pegged at three corners, the one pegged off its stake turned about NW;
  // the diagonal beam's rest north of the frame ([x0, z0, x1, z1]); the frame men's place out from each corner (amot along the
  // diagonal); the finale: the lime trough, the water jar's place on the yesod (the kohen pours there), the pile of the pulled timbers
  // and the frame's boards (east of the altar, on the kevesh's free ground)
  work: {
    frame1: { shift: [7, -2], turn: -12 },
    frame2: { N: [[-37, -14.5], 4], E: [[-27, -3], 95], S: [[-38, 7.5], -3], W: [[-48.5, -2.5], 86] },
    frame3: { pegs: ['NW', 'NE', 'SW'], wrong: 'NE', turn: 4.5 },
    diag: [-54, -25.5, -22, -25.5], men: 2.2,
    lime: [-49, 15.2], jar: [-42, 13.6], water: [-43, 9.5], logs: [-12, 18],
    // the works' cameras ([eye], [aim]): the frame from the stand's side, high; the finale's pull from the south-east, its cloth from the
    // south over the whole yesod, its water by the south-west corner
    cam: { frame: [[-38, 50, -49], [-38, 16, -3]], pull: [[-17, 31, 37], [-29, 16, 4]], white: [[-38, 50, 40], [-38, 16, -4]], water: [[-33, 21, 27], [-49, 16, 9.5]] },
  },
  // ── /h131 frame ──
  stand: { frame: [-38, -27, 'S'], witness: [-38, -22, 'N'], pour: [-38, -24, 'S'], south: [-48, 17, 'N'], pit: [-48, -27, 'N'] },
  // the stage's cameras on the Mount ([eye], [aim]): the opening from high down to the altar's site (rule 3); the site from the frame's
  // stand; the end: high over the altar's middle, the whole Azarah round it
  cam: {
    open: [[[150, 260, -260], [-38, 16, -3.5]], [[-6, 70, -70], [-38, 16, -3.5]]],
    site: [[-38, 40, -46], [-38, 16, -6]],
    end: [[-38, 190, 70], [-38, 16, -3.5]],
  },
  // ── the pit at Beit Kerem (מידות ג, ד: "ממקום שחופרין למטה מהבתולה"): the sheet on the one world grid ──
  pit: {
    // the pit's middle in the world (amot: x east, z south, the Mount's origin): Ein Kerem — "זיהוי מוצע, לא ודאי" (the owner,
    // 17.11). From the coordinates of Ein Kerem's village (31.768 N, 35.1605 E) and the Dome of the Rock (31.778 N, 35.2354 E):
    // 7.09 km west, 1.11 km south, an amah 0.48 m. The coordinates are as known, not fetched (no map service reachable here): check
    // against OpenStreetMap. The spec's first estimate was (−13,900, +2,200).
    origin: { x: -14770, z: 2310, y: 0, place: 'עין כרם', status: 'זיהוי מוצע, לא ודאי' },
    sheet: { name: 'גיליון הבקעה', n: 4, cell: 25 },
    // the pit: its middle, diameter, depth, the dark top layer's depth (below it the virgin soil)
    hole: { at: [0, 0], d: 16, depth: 4, dark: 2 },
    stones: { 1: [[-3, -2]], 2: [[3, -1]], 3: [[-1.3, 3], [0, 3.5], [1.3, 3]] },
    cradle: [-10, 4], rejects: [12, 6], stand: [0, 9, 'N'],
    // the ground round the pit (המחשה): the valley's floor patch drawn round the sheet — its radius, the flat floor's radius round the
    // pit, how far out the hillsides rise and how high (the valley lies about 140 m under the Mount: the hills round it rise that much)
    ground: { R: 3000, flat: 60, rise: 1400, top: 260 },
    // the opening view: above (0, 30), facing the Mount on the horizon (it lies east-north-east: 14,770 east and 2,310 north)
    cam: { open: [[-12, 13, 34], [6, 2, -16]], play: [[0, 11, 21], [0, -1, 0]] },
  },
};
const pitName = (k, r) => 'כרם־' + heb(k + 1) + '־' + (r + 1);
/** a place of the pit's sheet (lx east, lz south of the pit's middle) in the world, and its sheet cell */
export function pitWorld(lx, lz) { const O = S08.pit.origin; return { x: O.x + lx, z: O.z + lz, y: O.y }; }
export function pitCell(lx, lz) { const c = S08.pit.sheet.cell, h = (S08.pit.sheet.n * c) / 2; const k = Math.floor((h - lx) / c), r = Math.floor((lz + h) / c); return { k, r, name: pitName(k, r) }; }
function s08() {
  const E = [], C = S08, mid = (b) => [(b[0] + b[2]) / 2, (b[1] + b[3]) / 2], y = C.floor;
  const e2 = (id, kind, p, label, src, more) => E.push(ent(id, kind, p[0], p[1], label, src, { y, ...(more || {}) }));
  e2('altar', 'altar', C.mid, 'תחום המזבח, 32 על 32', 'רמב"ם בית הבחירה ב, ז');
  const SIDE = { NW: 'הצפונית מערבית', NE: 'הצפונית מזרחית', SE: 'הדרומית מזרחית', SW: 'הדרומית מערבית' };
  for (const [k, p] of Object.entries(C.stakes)) e2('stake:' + k, 'stake', p, `יתד העד בפינה ${SIDE[k]}`, 'רמב"ם ב, א–ד (היתד המחשה)');
  const A = C.altar, t = C.frame.T / 2;
  e2('frame:N', 'beam', [(A[0] + A[2]) / 2, A[1] - t], 'קורת המסגרת הצפונית, 32', 'רש"י זבחים נד ע"א');
  e2('frame:S', 'beam', [(A[0] + A[2]) / 2, A[3] + t], 'קורת המסגרת הדרומית, 32', 'רש"י זבחים נד ע"א');
  e2('frame:W', 'beam', [A[0] - t, (A[1] + A[3]) / 2], 'קורת המסגרת המערבית, 32', 'רש"י זבחים נד ע"א');
  e2('frame:E', 'beam', [A[2] + t, (A[1] + A[3]) / 2], 'קורת המסגרת המזרחית, 32', 'רש"י זבחים נד ע"א');
  const YL = { N: ['היסוד בצפון, כל הצפון', 'רמב"ם ב, י'], W: ['היסוד במערב, כל המערב', 'רמב"ם ב, י'], S1: ['היסוד אוכל בדרום אמה אחת', 'רמב"ם ב, י; מידות ג, א'], E1: ['היסוד אוכל במזרח אמה אחת', 'רמב"ם ב, י; מידות ג, א'], body: ['האזור שנוצק תחת גוף המזבח', 'זבחים נד ע"א'] };
  for (const [k, b] of Object.entries(C.yesod)) e2('yesod:' + k, 'yesod', mid(b), YL[k][0], YL[k][1]);
  e2('wood:E', 'timber', mid(C.wood.E), 'קורת העץ המזרחית (שם אין יסוד)', 'רמב"ם ב, טז (אורכה המחשה)');
  e2('wood:S', 'timber', mid(C.wood.S), 'קורת העץ הדרומית (שם אין יסוד)', 'רמב"ם ב, טז (אורכה המחשה)');
  e2('wood:joint', 'joint', C.wood.joint, 'המפגש של שתי הקורות בקרן הדרומית מזרחית', ILL);
  C.reeds.forEach((p, i) => e2('reed' + (i + 1), 'reed', p, `הקנה ${i ? 'השני' : 'הראשון'}: כאן יישאר נקב`, 'מידות ג, ב (המקום המדויק המחשה)'));
  for (const k of ['1', '2', '3']) e2('section' + k, 'section', mid(C.sections[k]), `מקטע היציקה של רמה ${k}`, ILL);
  e2('section3:corner', 'section', mid(C.sections.corner3), 'אמת הקרן שבמקטע של רמה 3', ILL);
  e2('fire', 'hearth', C.fire, 'האש והקדרה', ILL);
  e2('pile', 'pile', C.pile, 'ערימת האבנים מהבור', ILL);
  // ── h131 frame ── ── /h131 frame ──
  const W8 = C.work;
  e2('diag', 'beam', mid(W8.diag), 'קורת האלכסון, מונחת עד שהמסגרת רבועה', ILL);
  e2('lime', 'trough', W8.lime, 'ערבת הסיד והמפה (הליבון במפה, לא בכף ברזל)', 'מידות ג, ד (בזמן הבנייה המחשה)');
  e2('jar', 'jar', W8.jar, 'כד המים בסיום', ILL);
  e2('water', 'pour', W8.water, 'כאן נשפכים המים על היסוד', ILL);
  e2('logs', 'pile', W8.logs, 'ערימת קורות העץ שנשלפו', ILL);
  const SL = { frame: 'עמדת השחקן במלבן', witness: 'עמדת העד', pour: 'עמדת השחקן ביציקה, רמות 1 ו-2', south: 'עמדת השחקן ביציקה, רמה 3 ובסיום', pit: 'כאן יוצאים אל הבור בבית כרם (קפיצת מצלמה)' };
  for (const [k, p] of Object.entries(C.stand)) e2('stand:' + k, 'stand', p, SL[k], ILL, { extra: { face: p[2] } });
  // the pit's sheet: its own entries { id, kind, lx, lz (on the sheet), x, z (in the world), cell (the sheet's), label, src }
  const P = C.pit, pe = [];
  const pp = (id, kind, [lx, lz], label, src) => { const w = pitWorld(lx, lz); pe.push({ id, kind, lx, lz, x: w.x, z: w.z, cell: pitCell(lx, lz).name, label, src }); };
  pp('pit', 'pit', P.hole.at, `הבור: קוטר ${P.hole.d}, עומק ${P.hole.depth}, שכבה כהה עד ${P.hole.dark} ומתחתיה הבתולה`, 'מידות ג, ד (המידות המחשה)');
  pp('stone1', 'stone', P.stones[1][0], 'אבן רמה 1, כמעט גלויה', ILL);
  pp('stone2', 'stone', P.stones[2][0], 'אבן רמה 2, באלכסון', ILL);
  P.stones[3].forEach((p, i) => pp('stone3.' + (i + 1), 'stone', p, `אבן ${i + 1} מהשלוש של רמה 3, נשענות זו על זו`, ILL));
  pp('cradle', 'cradle', P.cradle, 'עריסת העץ: כאן בדיקת הציפורן', 'חולין יח ע"א (העריסה המחשה)');
  pp('rejects', 'heap', P.rejects, 'ערימת הפסולות, נשארת לתמיד', ILL);
  pp('stand', 'stand', P.stand, 'עמדת השחקן בבור', ILL);
  return { stage: 8, name: 'יסוד המזבח', bounds: { x0: -60, x1: 0, z0: -40, z1: 25 }, ...C, pit: { ...P, entries: pe }, entries: E };
}
export { pitName };
// ── /h131 ──

export const BOOK = makeBook();
