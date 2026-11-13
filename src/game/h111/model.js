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
// ── build 118 ── a real logic puzzle (brief docs/specs/build118-brief.md §M; the owner 9.11: "חידת היגיון קשה, מלאי מדויק, סדר
// אחד"): stretchers of 2–5 amot along one face row, the 6 a header across the whole wall (2 cells of both rows), ONE stock for both
// rows, exact from stretch 4 with exactly one way to close the course; stretches 1–3 one extra stretcher and 2–3 ways.
function rng(seed) { let x = (seed * 2654435761) >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; return (x >>> 0) / 4294967296; }; }
/** a partition of n cells into pieces of lens (r: the random) */
function partition(n, r, lens = [2, 3, 4, 5]) {
  if (n <= 0) return [];
  const lo = Math.min(...lens);
  for (let k = 0; k < 60; k++) {
    const out = []; let left = n;
    while (left > 0) {
      const opts = lens.filter((L) => L === left || left - L >= lo);
      if (!opts.length) break;
      const L = opts[Math.floor(r() * opts.length)]; out.push(L); left -= L;
    }
    if (left === 0) return out;
  }
  return null;
}
/** the table of the brief §M1: by level, what a stretch must be */
const RULES = { 1: { exact: false, want: [2, 3], bonus: 100 }, 2: { exact: true, want: [1, 1], bonus: 200 }, 3: { exact: true, want: [1, 1], bonus: 400 } };
/** the cells a stretch must fill: the spans of both rows outside the opening */
const spansOf = (G, open) => (open ? [[0, open[0]], [open[1], G]] : [[0, G]]);
/** is x an edge where no joint counts (the stretch's ends, the opening's edges)? */
const freeEdge = (P, x) => x <= 0 || x >= P.G || (P.open && (x === P.open[0] || x === P.open[1]));

/**
 * how many different full layouts close the stretch (≤ cap): both rows filled outside the opening, every joint off the course below,
 * the stock used (all of it when exact, all but one stone otherwise), the stones of `laid` ({ a, L, row: 0|2|'h' }) kept where they are.
 */
export function countSolutions(P, cap = 4, laid = []) {
  const G = P.G, occ = [new Int8Array(G), new Int8Array(G)];
  if (P.open) for (let r = 0; r < 2; r++) for (let x = P.open[0]; x < P.open[1]; x++) occ[r][x] = 2;
  const cnt = {}; for (const s of P.stock) cnt[s.L] = (cnt[s.L] || 0) + 1;
  const spanEnd = (x) => { for (const [a, b] of spansOf(G, P.open)) if (x >= a && x < b) return b; return x; };
  const bad = (r, x) => !freeEdge(P, x) && P.below[r].has(x);
  for (const q of laid) {
    const hdr = q.row === 'h', w = hdr ? 2 : q.L;
    if (!cnt[q.L]) return 0; cnt[q.L]--;
    for (const r of hdr ? [0, 1] : [q.row === 0 ? 0 : 1]) for (let x = q.a; x < q.a + w; x++) { if (x < 0 || x >= G || occ[r][x]) return 0; occ[r][x] = 1; }
    for (const r of hdr ? [0, 1] : [q.row === 0 ? 0 : 1]) if (bad(r, q.a) || bad(r, q.a + w)) return 0;
  }
  // a laid stone's neighbours must meet it at its edge: checked as the search fills up to it (a stone may not overlap it)
  const total = Object.values(cnt).reduce((a, b) => a + b, 0), leave = P.exact ? 0 : 1;
  let found = 0;
  const go = (used) => {
    if (found >= cap) return;
    // the first empty cell, row 0 first
    let r = -1, x = -1;
    for (let rr = 0; rr < 2 && r < 0; rr++) for (let xx = 0; xx < G; xx++) if (!occ[rr][xx]) { r = rr; x = xx; break; }
    if (r < 0) { if (total - used === leave) found++; return; }
    const end = spanEnd(x);
    // a joint at x itself (what lies left of it ended here): the course below must not have one there
    if (bad(r, x)) return;
    // the header: across both rows, from row 0 (row 1 is still empty there)
    if (r === 0 && cnt[6] > 0 && x + 2 <= end && !occ[1][x] && !occ[1][x + 1] && !occ[0][x + 1] && !bad(0, x + 2) && !bad(1, x) && !bad(1, x + 2)) {
      cnt[6]--; occ[0][x] = occ[0][x + 1] = occ[1][x] = occ[1][x + 1] = 1; go(used + 1); occ[0][x] = occ[0][x + 1] = occ[1][x] = occ[1][x + 1] = 0; cnt[6]++;
    }
    for (const L of [2, 3, 4, 5]) {
      if (!(cnt[L] > 0) || x + L > end) continue;
      let ok = true; for (let k = x; k < x + L; k++) if (occ[r][k]) { ok = false; break; }
      if (!ok || bad(r, x + L)) continue;
      // it must end where the next thing starts (another stone, a laid one, the span's end): an occupied cell right after is fine
      cnt[L]--; for (let k = x; k < x + L; k++) occ[r][k] = 1; go(used + 1); for (let k = x; k < x + L; k++) occ[r][k] = 0; cnt[L]++;
    }
  };
  go(0);
  return found;
}
/** can the course still be closed with these stones where they lie? */
export const canFinish = (P, laid) => countSolutions(P, 1, laid) > 0;
/** the one laid stone the master builder chalks: removing it makes the course closable again (null: none or not needed) */
export function misplaced(P, laid) {
  if (canFinish(P, laid)) return null;
  for (let i = laid.length - 1; i >= 0; i--) { const rest = laid.filter((_, j) => j !== i); if (canFinish(P, rest)) return laid[i]; }
  return null;
}

function makePuzzle(T, seed) {
  const r = rng(seed), G = T.G, R = RULES[T.lv];
  let open = null;
  if (T.gate != null) { const a = Math.round((G - H111.GATE_W) / 2); open = [a, a + H111.GATE_W]; }
  const spans = spansOf(G, open);
  // a header from level 2: two cells across the whole wall, in a span ≥ 6 cells, ≥ 2 cells from its ends
  let head = null;
  if (T.lv >= 2) {
    const sp = spans.filter(([a, b]) => b - a >= 6); if (sp.length) { const [a, b] = sp[Math.floor(r() * sp.length)]; const lo = open ? a : a + 2, hi = open ? b - 2 : b - 4; head = lo + Math.floor(r() * (hi - lo + 1)); }
  }
  const sol = [[], []];
  for (let row = 0; row < 2; row++) for (const [a0, b0] of spans) {
    const parts = head != null && head >= a0 && head + 2 <= b0 ? [[a0, head], [head + 2, b0]] : [[a0, b0]];
    for (const [a, b] of parts) { const pc = partition(b - a, r); if (!pc) return null; let x = a; for (const L of pc) { sol[row].push([x, L]); x += L; } }
  }
  // the course below: a real tiling of 2–4 stones per row, its joints never under this course's solution
  const cuts = [new Set(), new Set()];
  for (let row = 0; row < 2; row++) { for (const [a, L] of sol[row]) { cuts[row].add(a); cuts[row].add(a + L); } if (head != null) { cuts[row].add(head); cuts[row].add(head + 2); } }
  const belowStones = [[], []], below = [new Set(), new Set()];
  for (let row = 0; row < 2; row++) for (const [a0, b0] of spans) {
    let ok = false;
    for (let k = 0; k < 80 && !ok; k++) {
      const pc = partition(b0 - a0, r, [2, 3, 4]); if (!pc) continue;
      let x = a0, good = true; const xs = [];
      for (const L of pc) { x += L; if (x < b0) { if (cuts[row].has(x)) { good = false; break; } xs.push(x); } }
      if (!good) continue;
      ok = true; x = a0; for (const L of pc) { belowStones[row].push([x, L]); x += L; } for (const y of xs) below[row].add(y);
    }
    if (!ok) return null;
  }
  const stock = [];
  for (const row of sol) for (const [, L] of row) stock.push(L);
  if (head != null) stock.push(6);
  if (!R.exact) stock.push([2, 3, 4, 5][Math.floor(r() * 4)]);
  stock.sort((a, b) => a - b);
  const P = { s: T.s, G, lv: T.lv, open, head, below, belowStones, sol, stock: stock.map((L, i) => ({ id: i + 1, L })), marks: !T.bare, exact: R.exact, bonus: R.bonus };
  P.n = countSolutions(P, 4);
  return P;
}
const CACHE = {};
/**
 * the stretch's puzzle → { s, G, lv, open: [a, b] | null, head, below: [Set row 0, Set row 2], belowStones: [[a, L]…] per row,
 *   sol: [[a, L]…] per row, stock: [{ id, L }] single stones short to long, marks, exact, bonus, n (its number of solutions, ≤ 4) }
 */
export function puzzleOf(s) {
  if (CACHE[s]) return CACHE[s];
  const T = STRETCH[s - 1]; if (!T) return null;
  const R = RULES[T.lv];
  let best = null;
  for (let k = 0; k <= 600; k++) {
    const P = makePuzzle(T, 1009 * s + 77 + k); if (!P || P.n < 1) continue;
    if (P.n >= R.want[0] && P.n <= R.want[1]) { best = P; break; }
    if (!best || Math.abs(P.n - R.want[0]) < Math.abs(best.n - R.want[0])) best = P;
  }
  CACHE[s] = best;
  return best;
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
      st.res[m.id] = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), lost: !!res.lost, ...((res.loss | 0) > 0 ? { loss: res.loss | 0 } : {}) };   // (build 125: the points its damage cost, when it cost any)
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
