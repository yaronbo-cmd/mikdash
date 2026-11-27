/* ── build 137 ── h137/hakzaa-model.js — work 2 "הקצעת קרשי התקרה", the model (spec docs/specs/shlav-14-he.md v3, עבודה 2). Pure.
 * THE BOARD (300 × 90 dp on the screen): the blade sweeps the middle 160 dp of it (the plane 140 dp long rides on it end to end);
 * there the board's excess over flat is kept in N cells along it × 3 lanes across. The charcoal (three stripes across the board)
 * shows the excess: the high places lose it gradually; the board is flat when every cell's excess is under EPS. Units: the excess in
 * tenths of a "fine" cut (fine 0.3, medium 0.6, deep 1.0 per pass: המחשה, a calibration, not a carpenter's table).
 * A STROKE: the work hand on the handle drives the plane along the board (p: 0 … 160 dp of travel); the blade cuts each cell it sweeps
 * in the stroke's direction. The cut per cell = min(excess, depth) × the skew's factor (0.85 when skewed ≥ 4°). Per cell the grain
 * says which way is with it (+1: toward +p); the knot cells.
 *   · with the grain: clean (any depth); against it: deep = a tear (−20, kept), medium = a small tear (the step capped at 20) unless
 *     skewed ≥ 4° (then clean, the cut 0.7), fine = nothing;
 *   · a knot: deep = a tear; the others clean;
 *   · speed (dp/s, the plane's): ≤ 240 clean; 240–300 the chip breaks (no long chip); over 300 held for 70 dp in one stroke = a tear
 *     where deep, or medium against the grain / at the knot; the deep plane is heavy: it cannot go faster than DEEP_MAX;
 *   · a tear (a real one): the scar stays (the step's flaw), the excess there grows by SCAR (planed out later, the board thinner); a
 *     board planed thinner than THIN is rejected and the next one comes (the scar stays in the pile).
 * A PASS = a stroke that swept at least 40% of the travel. A STEP = one board: 40 = flat within the level's passes and no tear; 20 =
 * up to two more, or a small tear; 10 = more; a real tear caps it at 20 and costs 20.
 * Level 3: the two boards of a pair must come out the same thickness (the gauge: within ±0.15 of the first); the board is twisted (its
 * two edges high at opposite ends — the winding sticks show it); the hand's lean across the board (−1 … 1) cuts one edge deeper.
 * The levels (spec "טבלת הרמות"; each board its own problem: BOARDS): 1 = 3 boards × 3 passes, one hand: the grain's way (which
 * handle), a wedge; 2 = 4 boards × 4 passes, two hands: the grain turns at a different place on each, knots, a twice-turned grain;
 * 3 = two pairs × 6 passes: the twist (its way turns per pair), the gauge, no arrows (the grain read from the edge).
 * Nothing random: every board's shape is its index's. The work's first tear is a free try. */
export const HK = Object.freeze({
  N: 20, LANES: 3, TRAVEL: 160, BOARD: 300, PLANE: 140, EPS: 0.04, DEPTH: [0.3, 0.6, 1.0], SKEW_MAX: 8, SKEW_OK: 4, SKEW_CUT: 0.85,
  CLEAN_V: 240, TEAR_V: 300, V_TAU: 0.08, V_HYST: 20, TEAR_RUN: 70, DEEP_MAX: 330, PASS_MIN: 0.06, SCAR: 0.3, THIN: 2.4, GAUGE: 0.15, LEAN: 0.8,
});
export const NAMES = Object.freeze(['דק', 'בינוני', 'עמוק']);
export const LEVEL = Object.freeze({ 1: { boards: 3, passes: 3 }, 2: { boards: 4, passes: 4 }, 3: { boards: 4, passes: 6, pairs: true } });   // (passes: a fallback; each board's par is its own)
/** a board's shape (deterministic by its index): excess per cell per lane, grain per cell, knot cells, thickness over flat */
/** each board is its own problem (build 137, ירון: "the levels too alike"): the high places' shape, the grain's way and where it
 *  turns, the knots; nothing random — the board's index picks it. Shapes: 'hump' (high in the middle), 'wedgeL'/'wedgeR' (high at one
 *  end: deep there, fine on the rest), 'two' (two humps), 'flat' (thin all over: fine passes only, the gauge decides). */
const BOARDS = {
  // level 1 (one hand): read the arrows and pick the handle; a wedge asks for deep then fine
  1: [{ par: 2, shape: 'hump', top: 1.6, grain: [[0, 1]] }, { par: 2, shape: 'hump', top: 1.6, grain: [[0, -1]] }, { par: 3, shape: 'wedgeL', top: 2.4, grain: [[0, 1]] }],
  // level 2 (two hands): the grain turns at a different place on each board, knots move; the last board's grain turns twice (the
  // skew of the helper hand is the only clean way through its middle)
  2: [
    { par: 3, shape: 'hump', top: 1.0, grain: [[0, 1], [0.5, -1]], knot: [9, 10] },
    { par: 4, shape: 'wedgeR', top: 1.8, grain: [[0, -1], [0.3, 1]], knot: [14] },
    { par: 3, shape: 'two', top: 1.2, grain: [[0, 1], [0.65, -1]], knot: [5, 15] },
    { par: 3, shape: 'hump', top: 1.2, grain: [[0, 1], [0.35, -1], [0.7, 1]], knot: [] },
  ],
  // level 3 (the pairs): the twist turns the other way on each pair, the gauge, and no arrows: the grain is read by a light stroke (the
  // plane chatters against it), so each grain zone's par has one stroke more
  3: [
    { par: 3, shape: 'hump', top: 1.2, grain: [[0, 1]], twist: 1 }, { par: 6, shape: 'hump', top: 1.2, grain: [[0, -1]], twist: 1 },
    { par: 6, shape: 'wedgeL', top: 1.6, grain: [[0, -1], [0.6, 1]], twist: -1, knot: [6] }, { par: 9, shape: 'wedgeR', top: 1.6, grain: [[0, 1], [0.4, -1]], twist: -1, knot: [13] },
  ],
};
export const boardSpec = (lv, i) => { const L = BOARDS[lv] || BOARDS[1]; return L[i % L.length]; };
export function boardOf(lv, i) {
  const N = HK.N, e = [[], [], []], g = [], B = boardSpec(lv, i), knot = (B.knot || []).slice();
  for (let c = 0; c < N; c++) {
    const u = (c + 0.5) / N;
    const sh = B.shape === 'wedgeL' ? 1 - 0.8 * u : B.shape === 'wedgeR' ? 0.2 + 0.8 * u : B.shape === 'two' ? 0.45 + 0.55 * Math.abs(Math.sin(Math.PI * 2 * u)) : 0.55 + 0.45 * Math.sin(Math.PI * (u * 0.9 + 0.05));
    for (let l = 0; l < 3; l++) {
      let v = B.top * sh;
      if (lv === 3) v += 0.5 * (B.twist || 1) * ((l - 1) * (u - 0.5) * 2);   // (the twist: one edge high at one end, the other at the other)
      e[l].push(Math.max(0.1, +v.toFixed(3)));
    }
    let gg = 1; for (const [at, d] of B.grain) if (u >= at) gg = d; g.push(gg);
  }
  const extra = lv === 3 && i % 2 ? 0.6 + 0.3 * ((i >> 1) % 2) : 0;   // (the pair's second board starts thicker: the gauge)
  return { i, e, g, knot, T0: 10 + extra, removed: 0, scars: [], shape: B.shape, par: B.par || null };
}
export function fresh(lv) {
  const L = LEVEL[lv] || LEVEL[1];
  const S = { lv, L, k: 0, steps: [], flaws: [], first: true, t: 0, done: false, depth: 1, skew: 0, lean: 0, p: 0, dir: 0, two: false, ev: [], pile: [], thick: [] };
  next(S, 0); return S;
}
function next(S, i) {
  S.k = i; S.b = boardOf(S.lv, i);
  S.passes = 0; S.small = false; S.tear = false; S.stroke = null; S.p = 0; S.skew = S.lv === 1 ? 0 : S.skew; S.used2 = false;
  S.phase = 'plane';
}
/** the board's remaining excess (max), its flatness, its thickness over the pair's partner */
export const excess = (b) => Math.max(...b.e.map((ln) => Math.max(...ln)));
export const flat = (b) => excess(b) < HK.EPS;
/** the board's thickness (T0 less what came off where it was already flat) and, for a pair's second, how far over its partner */
export const thick = (b) => b.T0 - b.removed;
export const thickOver = (S) => (S.lv === 3 && S.k % 2 && S.thick[S.k - 1] != null ? thick(S.b) - S.thick[S.k - 1] : null);
/** how far each lane's charcoal stripe still shows: [stripe 0..2][lane] 0 … 1 */
export function charcoal(b) {
  const out = [];
  for (const c0 of [3, 9, 15]) { const row = []; for (let l = 0; l < 3; l++) { let s = 0; for (let c = c0; c < c0 + 3; c++) s += Math.min(1, b.e[l][c] / 0.9); row.push(s / 3); } out.push(row); }
  return out;
}
/** the blade's cell at travel p (the blade under the plane's middle) */
export const cellAt = (p) => Math.max(0, Math.min(HK.N - 1, Math.floor((p / HK.TRAVEL) * HK.N)));
function ev(S, e) { S.ev.push(e); return e; }
function tear(S, c, why) {
  if (S.stroke && S.stroke.tore) return; if (S.stroke) S.stroke.tore = true;   // (one tear a stroke)
  if (S.first) { S.first = false; ev(S, { k: 'free', c, why }); S.small = true; return; }
  S.tear = true; S.flaws.push({ f: 'hakzaa.tear', at: S.k, c }); S.b.scars.push(c);
  for (const l of [0, 1, 2]) S.b.e[l][c] += HK.SCAR;
  ev(S, { k: 'tear', c, why });
}
/** one frame. inp: { hold (the work hand on the handle), p (the plane's travel, dp, where the finger put it), skew (deg, the front
 *  handle; level 1: none), lean (−1 … 1), depth (0 1 2: set between strokes), two (the helper hand on the front handle now),
 *  lift (the plane drawn back toward the pushing hand: it rides lifted, no cut) } */
export function step(S, dt, inp = {}) {
  S.ev = []; S.t += dt;
  if (S.done) return S.ev;
  if (S.phase === 'next') { S.pt = (S.pt || 0) + dt; if (S.pt > 0.9) { next(S, S.k + 1); ev(S, { k: 'board', i: S.k }); } return S.ev; }
  if (inp.depth != null && !S.stroke && inp.depth !== S.depth) { S.depth = Math.max(0, Math.min(2, inp.depth | 0)); ev(S, { k: 'depth', d: S.depth }); }
  if (S.lv > 1 && inp.skew != null) S.skew = Math.max(-HK.SKEW_MAX, Math.min(HK.SKEW_MAX, inp.skew));
  if (inp.lean != null) S.lean = Math.max(-1, Math.min(1, inp.lean));
  if (inp.two) S.used2 = true;
  if (!inp.hold) { if (S.stroke) endStroke(S); return S.ev; }
  if (inp.lift) {   // (the plane lifted: drawn back toward the hand that pushes it, it does not cut)
    if (S.stroke) endStroke(S);
    if (inp.p != null) S.p = Math.max(0, Math.min(HK.TRAVEL, inp.p));
    S.v = 0; return S.ev;
  }
  let p = Math.max(0, Math.min(HK.TRAVEL, inp.p != null ? inp.p : S.p));
  // the deep plane is heavy: it lags a finger that outruns it
  const vmax = S.depth === 2 ? HK.DEEP_MAX : 1e9;
  const want = p - S.p, can = vmax * dt; if (Math.abs(want) > can) p = S.p + Math.sign(want) * can;
  if (!S.stroke) { S.stroke = { p0: S.p, lo: S.p, hi: S.p, dir: 0, fast: 0, chipped: false, cut: 0, cells: new Set(), long: true }; ev(S, { k: 'stroke' }); }
  const st = S.stroke, dp = p - S.p, v0 = Math.abs(dp) / Math.max(1e-4, dt);
  // the speed the thresholds read: smoothed over ~80 ms (a touch screen's samples jump), with a little hysteresis at the tear line
  st.vs = (st.vs || 0) + (v0 - (st.vs || 0)) * (1 - Math.exp(-dt / HK.V_TAU));
  const v = st.vs; S.v = v;
  if (Math.abs(dp) > 1e-6) {
    const dir = Math.sign(dp); if (!st.dir) st.dir = dir;
    if (dir === st.dir) {
      st.fast = v > HK.TEAR_V || (st.fast > 0 && v > HK.TEAR_V - HK.V_HYST) ? st.fast + Math.abs(dp) : 0;
      if (v > HK.CLEAN_V + HK.V_HYST / 2 && st.long) { st.long = false; ev(S, { k: 'chip' }); }
      const c0 = cellAt(S.p), c1 = cellAt(p);
      for (let c = Math.min(c0, c1); c <= Math.max(c0, c1); c++) if (!st.cells.has(c)) { st.cells.add(c); cut(S, c, dir, st); }
      st.lo = Math.min(st.lo, p); st.hi = Math.max(st.hi, p);
    } else if (Math.abs(p - (st.dir > 0 ? st.hi : st.lo)) > 12) { endStroke(S); S.p = p; return S.ev; }   // (a turn back ends the stroke: the plane lifted on the way back)
  }
  S.p = p; S.dir = st.dir;
  return S.ev;
}
function cut(S, c, dir, st) {
  const b = S.b, d = HK.DEPTH[S.depth], with_ = b.g[c] === dir, knot = b.knot.includes(c), skewed = Math.abs(S.skew) >= HK.SKEW_OK;
  let k = skewed ? HK.SKEW_CUT : 1;
  const fast = st.fast >= HK.TEAR_RUN;
  if (S.depth === 2 && (!with_ || knot)) { tear(S, c, knot ? 'knot' : 'grain'); k = 0.5; }
  else if (S.depth === 2 && fast) { tear(S, c, 'fast'); k = 0.5; }
  else if (S.depth === 1 && !with_ && !skewed) { if (!S.small) ev(S, { k: 'small', c }); S.small = true; k = 0.6; }
  else if (S.depth === 1 && fast && (!with_ || knot)) { tear(S, c, 'fast'); k = 0.5; }
  else if (!with_ && S.depth === 1) k = 0.7;
  // the lean: one edge cut deeper (level 3's twist); else the three lanes alike
  let any = 0;
  for (let l = 0; l < 3; l++) {
    const lk = S.lv === 3 ? Math.max(0.2, 1 + (l - 1) * S.lean * HK.LEAN) : 1, take = d * k * lk;
    const was = b.e[l][c], from = Math.min(was, take); b.e[l][c] = +(was - from).toFixed(4); any = Math.max(any, from);
    if (from < take - 1e-6 && flatAll(b)) { /* (beyond flat: the whole board thinner) */ }
  }
  // a pass over a flat board takes the depth off its thickness (level 3: the gauge)
  if (flatCell(b, c)) st.flatCut = (st.flatCut || 0) + d * k / HK.N;
  st.cut += any;
  // (against the grain and no tear: the plane chatters — level 3 has no arrows, this is how the grain is read)
  if (!with_ && any > 0 && !st.rough) { st.rough = true; ev(S, { k: 'rough', c }); }
}
const flatCell = (b, c) => b.e.every((ln) => ln[c] < HK.EPS);
const flatAll = (b) => b.e.every((ln) => ln.every((v) => v < HK.EPS));
function endStroke(S) {
  const st = S.stroke; S.stroke = null; if (!st) return;
  const span = (st.hi - st.lo) / HK.TRAVEL;
  if (span < 0.05) { ev(S, { k: 'nostroke' }); return; }
  const pass = span >= HK.PASS_MIN; if (pass) S.passes++;
  // the board's thickness: what came off where it was already flat (the gauge's reading)
  S.b.removed += st.flatCut || 0;
  ev(S, { k: 'pass', n: S.passes, pass, long: st.long && st.cut > 0.05, span: +span.toFixed(2), cut: +st.cut.toFixed(3) });
  const b = S.b;
  if (S.b.removed > HK.THIN) return reject(S);
  if (!flat(b)) return;
  const over = thickOver(S);
  if (over != null) {
    if (over < -HK.GAUGE) return reject(S, 'thin');
    if (over > HK.GAUGE) { ev(S, { k: 'gauge', over: +over.toFixed(3) }); return; }
  }
  boardDone(S);
}
function reject(S, why = 'thin') {
  if (S.first) { S.first = false; ev(S, { k: 'free', why }); }
  else { S.flaws.push({ f: 'hakzaa.tear', at: S.k, c: -1 }); ev(S, { k: 'tear', c: -1, why }); }
  S.pile.push({ i: S.k, scars: S.b.scars.slice(), rejected: true });
  ev(S, { k: 'reject', why });
  S.b = boardOf(S.lv, S.k); S.p = 0; S.tear = true;   // (the passes go on counting: the step's grade pays for it)
}
function boardDone(S) {
  const L = S.L, over = S.passes - (S.b.par || L.passes), tore = S.tear, small = S.small;
  const grade = !tore && !small && over <= 0 ? 'gold' : over <= 2 ? 'good' : 'ok';
  const g = tore && grade === 'gold' ? 'good' : grade;
  S.thick[S.k] = thick(S.b);
  S.steps.push({ i: S.k, grade: g, passes: S.passes, tear: tore, small, two: S.used2 || S.lv > 1 });
  S.pile.push({ i: S.k, scars: S.b.scars.slice() });
  ev(S, { k: 'board-done', i: S.k, grade: g, passes: S.passes, two: S.used2 });
  if (S.k + 1 >= L.boards) { S.done = true; S.phase = 'done'; ev(S, { k: 'done' }); }
  else { S.phase = 'next'; S.pt = 0; }
}
export function result(S) {
  const n = S.steps.length || 1, base = n * 40, flaws = S.flaws.length, PT = { gold: 40, good: 20, ok: 10 };
  const pts = S.steps.reduce((a, s) => a + PT[s.grade], 0), net = pts - flaws * 20, gold = S.steps.filter((s) => s.grade === 'gold').length;
  const allGold = gold === S.steps.length && S.steps.length > 0;
  const stars = !flaws && net >= base * 0.85 ? 3 : net >= base * 0.65 ? 2 : 1;
  return { stars, q: Math.max(0, net) / base, pts, perfect: stars === 3 && allGold, bonus: allGold && !flaws, flags: { boards: S.steps.length, gold, flaws } };
}
export function save(S, id) { return { id, v: 1, lv: S.lv, k: S.k, steps: S.steps, flaws: S.flaws, first: S.first, thick: S.thick, pile: S.pile, depth: S.depth }; }
export function load(b) { if (!b || b.v !== 1) return null; const S = fresh(b.lv); S.steps = b.steps || []; S.flaws = b.flaws || []; S.first = !!b.first; S.thick = b.thick || []; S.pile = b.pile || []; S.depth = b.depth | 0; next(S, Math.min(S.L.boards - 1, S.steps.length)); return S; }
/* ───────── a bot: plans each stroke the way a careful carpenter would (o.rough: deep and fast) ─────────
 * every stroke: of the ways (with or against the cells' grain), the depths, the skew (levels 2–3) and the lean (level 3), the one that
 * takes off the most without a tear; its span = the cells that still stand high. Each board's par (BOARDS[].par) is this plan's count. */
function plan(S) {
  const b = S.b, N = HK.N, need = []; for (let c = 0; c < N; c++) need.push(Math.max(b.e[0][c], b.e[1][c], b.e[2][c]) >= HK.EPS);
  const over = Math.max(0, thickOver(S) || 0);
  if (flat(b)) {   // (level 3's gauge: a whole-length pass at the depth nearest what is over, with the grain where it runs most)
    const d = over > 0.75 ? 1 : 0, dir = b.g.filter((v) => v > 0).length >= N / 2 ? 1 : -1;
    return { lo: 0, hi: HK.TRAVEL, dir, depth: d, skew: S.lv > 1 ? 5 : 0, lean: 0 };
  }
  let c0 = need.indexOf(true), c1 = need.lastIndexOf(true);
  let best = null;
  for (const dir of [1, -1]) for (const depth of [2, 1, 0]) for (const skew of S.lv > 1 ? [5, 0] : [0]) for (const lean of S.lv === 3 ? [-1, 0, 1] : [0]) {
    // the longest run of cells (from c0 or to c1) this cut can take without a tear; the score = what comes off
    let ok = true, sc = 0;
    for (let c = c0; c <= c1; c++) {
      const with_ = b.g[c] === dir, knot = b.knot.includes(c), skewed = Math.abs(skew) >= HK.SKEW_OK;
      if (depth === 2 && (!with_ || knot)) { ok = false; break; }
      if (depth === 1 && !with_ && !skewed) { ok = false; break; }
      const k = (skewed ? HK.SKEW_CUT : 1) * (!with_ && depth === 1 ? 0.7 : 1), d = HK.DEPTH[depth] * k;
      for (let l = 0; l < 3; l++) { const lk = S.lv === 3 ? Math.max(0.2, 1 + (l - 1) * lean * HK.LEAN) : 1; sc += Math.min(b.e[l][c], d * lk); }
    }
    if (!ok) continue;
    if (!best || sc > best.sc + 1e-6) best = { sc, dir, depth, skew, lean };
  }
  if (!best) best = { dir: b.g[c0], depth: 0, skew: S.lv > 1 ? 5 : 0, lean: 0 };
  // (a short span still sweeps a little past it: the plane's blade must run off the high place)
  const lo = Math.max(0, (c0 - 0.5) * HK.TRAVEL / N), hi = Math.min(HK.TRAVEL, (c1 + 1.5) * HK.TRAVEL / N);
  return { lo, hi, ...best };
}
export function bot(S, o = {}) {
  const B = S.__bot || (S.__bot = { t: 0, dir: 1, on: false, from: 0, to: HK.TRAVEL, rest: 0 });
  if (S.phase !== 'plane') { B.on = false; return { hold: false }; }
  if (B.rest > 0) { B.rest -= 1 / 60; return { hold: false }; }
  if (!B.on) {
    const P = o.rough ? { lo: 0, hi: HK.TRAVEL, dir: S.b.g[10], depth: 2, skew: 0, lean: 0 } : plan(S);
    B.depth = P.depth; B.dir = P.dir; B.from = P.dir > 0 ? P.lo : P.hi; B.to = P.dir > 0 ? P.hi : P.lo; B.on = true; B.p = B.from; B.lean = P.lean; B.skew = P.skew;
    return { hold: false, depth: P.depth, p: B.from, skew: P.skew, lean: P.lean };
  }
  if (Math.abs(S.p - B.from) > 1 && !S.stroke && B.p === B.from) return { hold: true, lift: true, p: B.from };   // (drawn back, lifted)
  const v = o.rough ? 420 : 200;
  B.p += B.dir * v / 60;
  const end = B.dir > 0 ? B.p >= B.to : B.p <= B.to;
  if (end) { B.on = false; B.rest = 0.15; return { hold: false }; }
  return { hold: true, p: B.p, skew: B.skew, lean: B.lean, depth: B.depth };
}
