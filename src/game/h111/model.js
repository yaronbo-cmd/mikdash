/* ── build 111 ── h111/model.js — stage 02 "חומת העזרה" in the old world (spec: Claude Doc "איפיון שלב 02 בעולם הישן", approved by the
 * owner 8.11 07:46 with its scoring rule). Pure: no three.js, no DOM. The plan (24 missions in the order of the spec's route table),
 * where each opens on the courts' wall, the levels, the courses the world shows for each mission, the stretches' puzzles, the save.
 *
 *   const M = createH111(save?) → the same face as stage 01's model (h109/model.js) for the director:
 *     M.st · M.mission() · M.done(res) · M.finished() · M.levelOf(m) · M.progress() · M.streak(n)
 *   plus M.coursesShown(m) → how many whole courses of the wall the world shows while mission m is open (−1: the plan only, 'last': all
 *   but the closing stone) · M.stretch(s) → the stretch's place and puzzle · M.unitEnd(m) → { title, sub } when a stretch closes
 *
 * The courts' wall in the old world (temple.js, stages.js `wall`): the ring round both courts, 6 amot thick, 21 courses of 2.18 amot;
 * the azara's own walls 44 high. The kohen's stations are on the azara's walls only (the owner's choice, open question 1): the crews
 * build the whole ring. His nine stretches are the courses 1–9, which the gates' 20 amot (Middot 2:3) still cross, so the openings
 * are a rule of level 3; the crews raise the courses above, and the closing stone is the ring's last stone.
 */

export const H111 = Object.freeze({
  STRETCHES: 9,
  H: 2.1818,          // a course (stages.js siteInfo('wall').H)
  T: 6,               // the wall's thickness (amot)
  ROW: 2,             // a face row's depth: the outer face, the core (the crews' fill), the inner face
  // the gates of the azara (Middot 1:4; temple.js): their openings, 10 amot wide, through the wall from the terrace (6) to the lintel (26)
  GATES: [
    { k: 'N', x: -160, n: 'בית המוקד' }, { k: 'N', x: -95, n: 'שער הקרבן' }, { k: 'N', x: -38, n: 'שער הניצוץ' },
    { k: 'S', x: -160, n: 'שער הדלק' }, { k: 'S', x: -118, n: 'שער הבכורות' }, { k: 'S', x: -38, n: 'שער המים' },
    { k: 'E', x: 3, n: 'שער ניקנור' },
  ],
  GATE_W: 10,
});

/** the wall's sides on the azara (the ring's lines, amot; +x east, +z south): the centre line, its outward normal, the inner face */
export const SIDE = Object.freeze({
  N: { c: -70.5, n: [0, -1] }, S: { c: 70.5, n: [0, 1] }, W: { c: -190, n: [-1, 0] }, E: { c: 144, n: [1, 0] },
});
/** a point on a side: `at` along it (x for N/S, z for W/E) → { x, z, nx, nz, ux, uz } with u the direction the stretch runs */
export function sidePoint(k, at, dir = 1) {
  const S = SIDE[k], ns = k === 'N' || k === 'S';
  const x = ns ? at : S.c, z = ns ? S.c : at;
  // u: along the side, so that seen from OUTSIDE (the courses' camera: spec "מבט מבחוץ ומלמעלה") the stretch runs to the screen's right
  const ux = ns ? (k === 'N' ? -1 : 1) * dir : 0, uz = ns ? 0 : (k === 'W' ? 1 : -1) * dir;
  return { x, z, nx: S.n[0], nz: S.n[1], ux, uz };
}

// the stretches (spec route: the north, the west and the start of the south, the south and the east). x/z along the side; G: the gap's
// length; the level's rules (lv); the gate opening it crosses (L3); the course it lays (its index, 0-based: course 0 is the footing)
export const STRETCH = Object.freeze([
  { s: 1, k: 'N', at: -66, G: 8, lv: 1, c: 1 },
  { s: 2, k: 'N', at: -128, G: 9, lv: 1, c: 2 },
  { s: 3, k: 'W', at: -42, G: 10, lv: 1, c: 3 },
  { s: 4, k: 'W', at: 14, G: 10, lv: 2, c: 4 },
  { s: 5, k: 'S', at: -140, G: 11, lv: 2, c: 5 },
  { s: 6, k: 'S', at: -80, G: 12, lv: 2, c: 6 },
  { s: 7, k: 'S', at: -118, G: 22, lv: 3, c: 7, gate: 4 },
  { s: 8, k: 'S', at: -38, G: 22, lv: 3, c: 8, gate: 5 },
  { s: 9, k: 'S', at: -14, G: 12, lv: 3, c: 9, bare: true },
].map((o) => Object.freeze(o)));
// the great stones: beside the stretches 4, 6, 8 (the next course, a little along the wall from the stretch)
export const GIANT = Object.freeze({ 4: { k: 'W', at: 38, L: 8 }, 6: { k: 'S', at: -64, L: 9 }, 8: { k: 'S', at: -66, L: 10 } });

const MISSIONS = () => {
  const L = [];
  L.push({ k: 'stakes', id: 'stakes', lv: 1 });
  const pair = (s, lv, o = {}) => { L.push({ k: 'bond', id: `bond${s}`, s, lv, ...o }); L.push({ k: 'plumb', id: `plumb${s}`, s, lv }); };
  pair(1, 1); pair(2, 1); pair(3, 1);
  pair(4, 2, { night: 1 }); L.push({ k: 'lever', id: 'lever4', s: 4, lv: 2 });
  pair(5, 2); pair(6, 2); L.push({ k: 'lever', id: 'lever6', s: 6, lv: 2 });
  L.push({ k: 'gates', id: 'gates', lv: 3, night: 2 });
  pair(7, 3); pair(8, 3); L.push({ k: 'lever', id: 'lever8', s: 8, lv: 3 });
  pair(9, 3);
  L.push({ k: 'closing', id: 'closing', lv: 3 });
  return L;
};
export const PLAN = Object.freeze(MISSIONS().map((m, i) => Object.freeze({ ...m, n: i })));
export const KINDS = Object.freeze(['stakes', 'bond', 'plumb', 'lever', 'gates', 'closing']);
const WEIGHT = { stakes: 1, bond: 2, plumb: 1.5, lever: 2.5, gates: 1, closing: 3 };
const TOTAL = PLAN.reduce((a, m) => a + WEIGHT[m.k], 0);

/* ───────── the puzzle of a stretch (deterministic): the joints of the course below, the kohen's stock ───────── */
function rng(seed) { let x = (seed * 2654435761) >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return (x >>> 0) / 4294967296; }; }
/** a partition of n cells into pieces of 2, 3, 4 (r: the random) */
function partition(n, r) {
  if (n <= 0) return [];
  for (let k = 0; k < 40; k++) {
    const out = []; let left = n;
    while (left > 0) {
      const opts = [2, 3, 4].filter((L) => L === left || left - L >= 2);
      if (!opts.length) break;
      const L = opts[Math.floor(r() * opts.length)]; out.push(L); left -= L;
    }
    if (left === 0) return out;
  }
  return n % 2 === 0 ? Array(n / 2).fill(2) : [3, ...Array((n - 3) / 2).fill(2)];
}
/**
 * the stretch's puzzle: G cells along; rows 0 (outer face) and 2 (inner face); the core (row 1) is the crews' fill, except under a header
 *  → { G, open: [a, b] | null (the gate's opening, kept empty), head: a | null (the solution's header: cells a, a+1 of all three rows),
 *      below: [Set row 0, Set row 2] (the joints of the course below: no joint of this course may stand over one), sol: [[a, L], …] per row,
 *      stock: [{ L, n }] (lengths: 2 3 4 stretchers, 6 the header that crosses the whole wall), marks: bool (the joints below are chalked) }
 */
export function puzzleOf(s) {
  const T = STRETCH[s - 1]; if (!T) return null;
  const r = rng(1009 * s + 77), G = T.G;
  let open = null;
  if (T.gate != null) { const a = Math.round((G - H111.GATE_W) / 2); open = [a, a + H111.GATE_W]; }
  // the spans the stones must fill (both sides of an opening)
  const spans = open ? [[0, open[0]], [open[1], G]] : [[0, G]];
  // a header at level 2 and up: two cells across the whole wall, in the longest span, ≥ 2 cells from its ends
  let head = null;
  if (T.lv >= 2) {
    const sp = spans.slice().sort((a, b) => (b[1] - b[0]) - (a[1] - a[0]))[0];
    if (sp[1] - sp[0] >= 6) { const lo = sp[0] + 2, hi = sp[1] - 4; head = lo + Math.floor(r() * (hi - lo + 1)); }
  }
  const sol = [[], []];
  for (let row = 0; row < 2; row++) {
    for (const [a0, b0] of spans) {
      const parts = head != null && head >= a0 && head + 2 <= b0 ? [[a0, head], [head + 2, b0]] : [[a0, b0]];
      for (const [a, b] of parts) { let x = a; for (const L of partition(b - a, r)) { sol[row].push([x, L]); x += L; } }
    }
  }
  // the joints of the course below: where this course's solution has none (so the solution is good), spaced, about one every 3 amot
  const below = [new Set(), new Set()];
  for (let row = 0; row < 2; row++) {
    const cuts = new Set(); for (const [a, L] of sol[row]) { cuts.add(a); cuts.add(a + L); }
    if (head != null) { cuts.add(head); cuts.add(head + 2); }
    const cand = []; for (let x = 1; x < G; x++) if (!cuts.has(x) && !(open && x >= open[0] && x <= open[1])) cand.push(x);
    for (const x of cand.sort(() => r() - 0.5)) { if ([...below[row]].some((y) => Math.abs(y - x) < 2)) continue; below[row].add(x); if (below[row].size >= Math.max(2, Math.round(G / 3))) break; }
  }
  // the stock: the solution's stones, and some more (fewer at level 3: "ובמלאי פחות אפשרויות")
  const cnt = { 2: 0, 3: 0, 4: 0, 6: 0 };
  for (const row of sol) for (const [, L] of row) cnt[L]++;
  if (head != null) cnt[6]++;
  const extra = T.lv >= 3 ? 1 : 2;
  for (let i = 0; i < extra; i++) cnt[[2, 3, 4][Math.floor(r() * 3)]]++;
  if (T.lv >= 2 && head == null) cnt[6]++;
  const stock = [6, 4, 3, 2].filter((L) => cnt[L] > 0).map((L) => ({ L, n: cnt[L] }));
  return { s, G, open, head, below, sol, stock, marks: !T.bare, lv: T.lv };
}
/** is a laid course of a stretch good? cells: per row an array of G (null | stone id); stones: { id → { a, L, row: 0|2|'h' } }
 *  → { full, joj: [{ id, row, x }], head: bool } — full: every cell of both face rows outside the opening is laid */
export function checkCourse(P, stones) {
  const rowsOf = (st) => (st.row === 'h' ? [0, 1] : [st.row === 0 ? 0 : 1]);
  const occ = [Array(P.G).fill(null), Array(P.G).fill(null)];
  for (const st of stones) { const w = st.row === 'h' ? 2 : st.L; for (const r of rowsOf(st)) for (let x = st.a; x < st.a + w; x++) if (x >= 0 && x < P.G) occ[r][x] = st.id; }
  let full = true;
  for (let r = 0; r < 2; r++) for (let x = 0; x < P.G; x++) { if (P.open && x >= P.open[0] && x < P.open[1]) continue; if (occ[r][x] == null) full = false; }
  const joj = [];
  for (const st of stones) {
    const w = st.row === 'h' ? 2 : st.L;
    for (const r of rowsOf(st)) for (const x of [st.a, st.a + w]) {
      if (x <= 0 || x >= P.G) continue;
      if (P.open && (x === P.open[0] || x === P.open[1])) continue;
      if (P.below[r].has(x)) joj.push({ id: st.id, row: r, x });
    }
  }
  return { full, joj, head: stones.some((st) => st.row === 'h') };
}

/** the stretch's solution as laid stones ({ a, L, row: 0 | 2 | 'h', off }) */
export function solutionStones(s) {
  const P = puzzleOf(s); if (!P) return [];
  const out = [];
  P.sol.forEach((row, ri) => { for (const [a, L] of row) out.push({ a, L, row: ri === 0 ? 0 : 2, off: 0 }); });
  if (P.head != null) out.push({ a: P.head, L: 6, row: 'h', off: 0 });
  return out;
}
/** a fresh save */
export function freshH111() {
  return { v: 1, i: 0, done: [], res: {}, best: 0, plays: {}, lay: {}, gates: [], giant: {}, nights: [], loss: 0 };
}

export function createH111(save) {
  const st = save && save.v === 1 ? save : freshH111();
  for (const [k, v] of Object.entries(freshH111())) if (st[k] === undefined) st[k] = v;
  const M = {
    st,
    get plan() { return PLAN; },
    mission() { return st.i < PLAN.length ? PLAN[st.i] : null; },
    finished() { return st.i >= PLAN.length; },
    levelOf(m) { const n = (st.plays[m.id] | 0); return Math.min(3, (m.lv | 0) + (n > 0 ? 1 : 0)); },
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      st.res[m.id] = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), lost: !!res.lost };
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      st.done.push(m.id); st.i++;
      // a mission passed without being played (a minigame's own page skips to it; tests) leaves the world as the crews would have
      if (m.k === 'bond' && !(st.lay[m.s] && st.lay[m.s].stones)) st.lay[m.s] = { stones: solutionStones(m.s) };
      if (m.k === 'lever' && !(st.giant[m.s] && st.giant[m.s].done)) st.giant[m.s] = { done: 1, d0: 0, d1: 0 };
      if (m.k === 'gates' && (st.gates || []).length < 7) st.gates = [0, 1, 2, 3, 4, 5, 6];
      return M.mission();
    },
    progress() { let w = 0; for (const id of st.done) { const m = PLAN.find((x) => x.id === id); if (m) w += WEIGHT[m.k]; } return Math.min(1, w / TOTAL); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
    stretch: (s) => STRETCH[s - 1] || null,
    puzzle: (s) => puzzleOf(s),
    /** the whole courses the world shows while mission m is open (the crews have laid up to under the kohen's course) */
    coursesShown(m) {
      if (!m) return 'done';
      if (m.k === 'stakes') return -1;
      if (m.k === 'bond' || m.k === 'plumb') return STRETCH[m.s - 1].c;
      if (m.k === 'lever') return STRETCH[m.s - 1].c + 1;
      if (m.k === 'gates') return STRETCH[6].c;
      if (m.k === 'closing') return 'last';
      return 0;
    },
    /** a stretch closes with its plumb line: its grade from the two works (מהודר when both earned 3 stars) */
    unitEnd(m) {
      if (m.k !== 'plumb') return null;
      const a = st.res[`bond${m.s}`], b = st.res[`plumb${m.s}`]; if (!a || !b) return null;
      return { title: `קטע ${m.s} מתוך 9`, sub: a.stars >= 3 && b.stars >= 3 ? 'מהודר' : 'כשר', bonus: `קטע ${m.s} · ${a.stars >= 3 && b.stars >= 3 ? 'מהודר' : 'כשר'}` };
    },
  };
  return M;
}
export const starsOf = (q) => (q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1);
