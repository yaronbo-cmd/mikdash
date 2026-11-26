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
 * The levels (spec "טבלת הרמות"): 1 = 3 boards × 3 passes, even grain, the skew straightens by itself; 2 = 4 boards × 4 passes, the
 * grain turns at a knot in the middle; 3 = two pairs × 6 passes, the gauge and the twist, the grain reversed between a pair's boards.
 * Nothing random: every board's shape is its index's. The work's first tear is a free try. */
export const HK = Object.freeze({
  N: 20, LANES: 3, TRAVEL: 160, BOARD: 300, PLANE: 140, EPS: 0.04, DEPTH: [0.3, 0.6, 1.0], SKEW_MAX: 8, SKEW_OK: 4, SKEW_CUT: 0.85,
  CLEAN_V: 240, TEAR_V: 300, TEAR_RUN: 70, DEEP_MAX: 330, PASS_MIN: 0.4, SCAR: 0.3, THIN: 2.4, GAUGE: 0.15, LEAN: 0.8,
});
export const NAMES = Object.freeze(['דק', 'בינוני', 'עמוק']);
export const LEVEL = Object.freeze({ 1: { boards: 3, passes: 3 }, 2: { boards: 4, passes: 4 }, 3: { boards: 4, passes: 6, pairs: true } });
/** a board's shape (deterministic by its index): excess per cell per lane, grain per cell, knot cells, thickness over flat */
export function boardOf(lv, i) {
  const N = HK.N, e = [[], [], []], g = [], knot = [];
  const top = lv === 1 ? 1.8 : lv === 2 ? 1.0 : 1.5, ph = (i * 0.37) % 1;
  for (let c = 0; c < N; c++) {
    const u = (c + 0.5) / N, hump = 0.55 + 0.45 * Math.sin(Math.PI * (u * 0.9 + 0.05 + ph * 0.1));   // (high in the middle, lower at the ends)
    for (let l = 0; l < 3; l++) {
      let v = top * hump;
      if (lv === 3) { const tw = 0.5 * ((l - 1) * (u - 0.5) * 2); v += tw; }   // (the twist: lane 0 high at one end, lane 2 at the other)
      e[l].push(Math.max(0.1, +v.toFixed(3)));
    }
    if (lv === 2) g.push(u < 0.5 ? 1 : -1);
    else if (lv === 3) g.push(i % 2 ? -1 : 1);
    else g.push(1);
    if (lv === 2 && (c === 9 || c === 10)) knot.push(c);
  }
  const extra = lv === 3 && i % 2 ? 0.6 + 0.3 * ((i >> 1) % 2) : 0;   // (the pair's second board starts thicker: the gauge)
  return { i, e, g, knot, T0: 10 + extra, removed: 0, scars: [] };
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
 *  handle; level 1: none), lean (−1 … 1), depth (0 1 2: set between strokes), two (the helper hand on the front handle now) } */
export function step(S, dt, inp = {}) {
  S.ev = []; S.t += dt;
  if (S.done) return S.ev;
  if (S.phase === 'next') { S.pt = (S.pt || 0) + dt; if (S.pt > 0.9) { next(S, S.k + 1); ev(S, { k: 'board', i: S.k }); } return S.ev; }
  if (inp.depth != null && !S.stroke && inp.depth !== S.depth) { S.depth = Math.max(0, Math.min(2, inp.depth | 0)); ev(S, { k: 'depth', d: S.depth }); }
  if (S.lv > 1 && inp.skew != null) S.skew = Math.max(-HK.SKEW_MAX, Math.min(HK.SKEW_MAX, inp.skew));
  if (inp.lean != null) S.lean = Math.max(-1, Math.min(1, inp.lean));
  if (inp.two) S.used2 = true;
  if (!inp.hold) { if (S.stroke) endStroke(S); return S.ev; }
  let p = Math.max(0, Math.min(HK.TRAVEL, inp.p != null ? inp.p : S.p));
  // the deep plane is heavy: it lags a finger that outruns it
  const vmax = S.depth === 2 ? HK.DEEP_MAX : 1e9;
  const want = p - S.p, can = vmax * dt; if (Math.abs(want) > can) p = S.p + Math.sign(want) * can;
  if (!S.stroke) { S.stroke = { p0: S.p, lo: S.p, hi: S.p, dir: 0, fast: 0, chipped: false, cut: 0, cells: new Set(), long: true }; ev(S, { k: 'stroke' }); }
  const st = S.stroke, dp = p - S.p, v = Math.abs(dp) / Math.max(1e-4, dt);
  S.v = v;
  if (Math.abs(dp) > 1e-6) {
    const dir = Math.sign(dp); if (!st.dir) st.dir = dir;
    if (dir === st.dir) {
      st.fast = v > HK.TEAR_V ? st.fast + Math.abs(dp) : 0;
      if (v > HK.CLEAN_V && st.long) { st.long = false; ev(S, { k: 'chip' }); }
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
  const L = S.L, over = S.passes - L.passes, tore = S.tear, small = S.small;
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
/* ───────── a bot: strokes with the grain at a steady speed, the depth by what is left (o.rough: deep and fast) ───────── */
export function bot(S, o = {}) {
  const B = S.__bot || (S.__bot = { t: 0, dir: 1, on: false, from: 0, to: HK.TRAVEL, rest: 0 });
  if (S.phase !== 'plane') { B.on = false; return { hold: false }; }
  if (B.rest > 0) { B.rest -= 1 / 60; return { hold: false }; }
  const b = S.b;
  if (!B.on) {
    // plan the stroke: the half that still has excess, the direction with its grain; the depth: deep only with the grain and no knot
    const left = b.e.some((ln) => ln.slice(0, HK.N / 2).some((v) => v >= HK.EPS)), right = b.e.some((ln) => ln.slice(HK.N / 2).some((v) => v >= HK.EPS));
    let lo = 0, hi = HK.TRAVEL;
    if (S.lv === 2) { if (left) { lo = 0; hi = HK.TRAVEL / 2 - 0.5; } else { lo = HK.TRAVEL / 2 + 0.5; hi = HK.TRAVEL; } }
    const c = cellAt((lo + hi) / 2), dir = b.g[c];
    const ex = excess(b), over = Math.max(0, thickOver(S) || 0);
    let depth = o.rough ? 2 : ex > 0.95 && !b.knot.length && S.lv === 1 ? 2 : ex > 0.35 || over > 0.5 ? 1 : 0;
    if (flat(b) && over > 0) depth = over > 0.75 ? 1 : 0;
    B.depth = depth; B.dir = dir; B.from = dir > 0 ? lo : hi; B.to = dir > 0 ? hi : lo; B.on = true; B.p = B.from; B.lean = 0;
    if (S.lv === 3) { const l0 = b.e[0].reduce((a, v) => a + v, 0), l2 = b.e[2].reduce((a, v) => a + v, 0); B.lean = Math.max(-1, Math.min(1, (l2 - l0) * 0.4)); }
    return { hold: false, depth, p: B.from, skew: S.lv > 1 ? (o.rough ? 0 : 5) : 0, lean: B.lean };
  }
  if (Math.abs(S.p - B.from) > 1 && !S.stroke && B.p === B.from) return { hold: false, p: B.from };
  const v = o.rough ? 420 : 200;
  B.p += B.dir * v / 60;
  const end = B.dir > 0 ? B.p >= B.to : B.p <= B.to;
  if (end) { B.on = false; B.rest = 0.15; return { hold: false }; }
  return { hold: true, p: B.p, skew: S.lv > 1 ? (o.rough ? 0 : 5) : 0, lean: B.lean, depth: B.depth };
}
