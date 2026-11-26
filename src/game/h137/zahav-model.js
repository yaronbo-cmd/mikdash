/* ── build 137 ── h137/zahav-model.js — work 3 "הזהבת המים והדלתות", the model (spec docs/specs/shlav-14-he.md v3, עבודה 3). Pure.
 * Everything in the segment's own frame, in dp (the act maps the fingers onto it): a segment W × H; its leaves side by side, each
 * overlapping the one before by OV (the target 4–8: 6). Per segment, the tools in the work hand change by themselves, in order:
 *   1. WET — the broad brush (radius BRUSH; level 1: the whole height in one stroke) over the segment: every cell of the wet grid
 *      covered; a cell the brush comes onto a third time within PUDDLE_T is a puddle (the step capped at 20: a wrinkle later; the
 *      brush staying on a cell along a stroke is one pass);
 *   2. LEAF × n — a tap on the cushion lifts a leaf on the gilder's tip; a drag to its slot and a release in ONE motion: no pulling
 *      back (the finger moving back toward the cushion by PULL dp in the last 0.12 s tears it); within SNAP of the slot it snaps into
 *      the overlap: ≤ GOLD both ways = 40, else 20 (borderline); beyond: a hole (short of the slot, or off the height) or a deep
 *      wrinkle (too far over the last) — real damage, −20, a patch leaf goes over it (the step 10, the seam stays);
 *   3. BURNISH — short agate strokes over it: each cell twice (≥ 90% of them); the same cell three times faster than 300 dp/s
 *      lifts a small wrinkle (the step capped at 20).
 * THE MASK (levels 2–3): a segment on the border of "אחר הדלתות" needs the wooden mask at its place on the track (|m − need| ≤ MASK_TOL)
 * before he wets or lays: wet without it = the bare zone shines wet (a warning, no damage; it dries without gold); a leaf laid without
 * it = gold behind the doors (damage −20; a patch is not needed: it is scraped, the scar stays). The mask stays where it is left.
 * Level 1: no mask; the second hand may steady the leaf's corner while it is laid (+10). The leaf flutters a little in the door's
 * draught (FLUTTER dp) unless steadied. The work's first damage is a free try. Nothing random. */
export const ZH = Object.freeze({ OV: 6, GOLD: 6, SNAP: 12, PULL: 8, PULL_T: 0.12, BRUSH: 46, COLS: 10, ROWS: 4, PUDDLE_T: 1.2, AGATE: 30, BURN_N: 2, BURN_V: 300,
  BURN_FAST: 3, BURN_DONE: 0.9, MASK_TOL: 0.08, FLUTTER: 3, W: 280, H: 120 });
/** the segments of each level (spec "טבלת הרמות"): leaves each; the border segments' mask places (0 … 1 along the track) */
export const PLAN = Object.freeze({
  1: { wall: 'north', segs: [0, 1, 2, 3].map(() => ({ n: 2, border: null })), wetOne: true },
  2: { wall: 'east', segs: [{ n: 2, border: 0.12 }, { n: 2, border: 0.3 }, { n: 2, border: null }, { n: 2, border: null }, { n: 2, border: 0.7 }, { n: 2, border: 0.88 }] },
  3: { wall: 'south', segs: [0, 1, 2, 3, 4, 5, 6, 7].map((i) => ({ n: 3, border: null, relief: i === 3 || i === 4 })) },
});
export const leafW = (n) => (ZH.W + (n - 1) * ZH.OV) / n;
export const slotX = (n, k) => k * (leafW(n) - ZH.OV) + leafW(n) / 2;
export function fresh(lv) {
  const P = PLAN[lv] || PLAN[1];
  const S = { lv, P, k: 0, steps: [], flaws: [], first: true, t: 0, done: false, mask: lv > 1 ? 0.5 : null, ev: [], laid: [], steadyN: 0 };
  seg(S, 0); return S;
}
function seg(S, i) {
  S.k = i; S.g = S.P.segs[i];
  S.phase = 'wet'; S.wet = new Array(ZH.COLS * ZH.ROWS).fill(0); S.wetT = new Array(ZH.COLS * ZH.ROWS).fill(-9); S.wetN = new Array(ZH.COLS * ZH.ROWS).fill(0);
  S.puddle = false; S.under = new Set(); S.warn = false; S.leaf = 0; S.held = null; S.leaves = []; S.border = false; S.patch = false; S.borderline = false; S.wrinkle = false;
  S.burn = new Array(ZH.COLS * ZH.ROWS).fill(0); S.burnFast = new Array(ZH.COLS * ZH.ROWS).fill(0); S.steady = 0; S.brush = null; S.agate = null;
}
const ev = (S, e) => { S.ev.push(e); return e; };
const cellOf = (x, y) => { const c = Math.floor((x / ZH.W) * ZH.COLS), r = Math.floor((y / ZH.H) * ZH.ROWS); return c >= 0 && c < ZH.COLS && r >= 0 && r < ZH.ROWS ? r * ZH.COLS + c : -1; };
const cellsNear = (x, y, R) => { const out = []; for (let r = 0; r < ZH.ROWS; r++) for (let c = 0; c < ZH.COLS; c++) { const cx = (c + 0.5) * ZH.W / ZH.COLS, cy = (r + 0.5) * ZH.H / ZH.ROWS; if (Math.hypot(cx - x, cy - y) <= R) out.push(r * ZH.COLS + c); } return out; };
export const masked = (S) => !S.g.border || (S.mask != null && Math.abs(S.mask - S.g.border) <= ZH.MASK_TOL);
export const wetDone = (S) => S.wet.every((v) => v > 0);
export const burnDone = (S) => S.burn.filter((v) => v >= ZH.BURN_N).length >= ZH.BURN_DONE * S.burn.length;
function damage(S, f, why) {
  if (S.first) { S.first = false; ev(S, { k: 'free', why }); return false; }
  S.flaws.push({ f, at: S.k, why }); ev(S, { k: 'damage', f, why }); return true;
}
/** one frame. inp: { work: { x, y, down } (the work hand in the segment's frame, dp; down false = lifted), cushion (a tap on the
 *  cushion this frame), mask (the mask's place now, 0 … 1, or null), steady (the second finger on the leaf's corner) } */
export function step(S, dt, inp = {}) {
  S.ev = []; S.t += dt;
  if (S.done) return S.ev;
  if (inp.mask != null && S.lv > 1) { const m = Math.max(0, Math.min(1, inp.mask)); if (Math.abs(m - S.mask) > 1e-4) { S.mask = m; } }
  const w = inp.work || null;
  if (S.phase === 'next') { S.pt += dt; if (S.pt > 0.8) { seg(S, S.k + 1); ev(S, { k: 'seg', i: S.k }); } return S.ev; }
  if (S.phase === 'wet') {
    if (w && w.down) {
      if (!S.brush) { S.brush = { x: w.x, y: w.y }; if (S.g.border && !masked(S) && !S.warn) { S.warn = true; ev(S, { k: 'warn' }); } }
      const now = new Set();
      const R = S.P.wetOne ? ZH.H : ZH.BRUSH, steps = Math.max(1, Math.ceil(Math.hypot(w.x - S.brush.x, w.y - S.brush.y) / 6));
      for (let i = 1; i <= steps; i++) {
        const x = S.brush.x + (w.x - S.brush.x) * i / steps, y = S.brush.y + (w.y - S.brush.y) * i / steps;
        const ys = S.P.wetOne ? [ZH.H * 0.125, ZH.H * 0.375, ZH.H * 0.625, ZH.H * 0.875] : [y];
        for (const yy of ys) for (const c of cellsNear(x, yy, S.P.wetOne ? ZH.W / ZH.COLS * 0.75 : R)) {
          // a pass = the brush coming onto the cell again (it was not under it the frame before): a third pass within PUDDLE_T = a puddle
          const enter = !S.under.has(c) && !now.has(c); now.add(c);
          if (enter) {
            if (S.wet[c]) { S.wetN[c] = S.t - S.wetT[c] < ZH.PUDDLE_T ? S.wetN[c] + 1 : 1; if (S.wetN[c] > 2 && !S.puddle) { S.puddle = true; ev(S, { k: 'puddle', c }); } }
            else S.wetN[c] = 1;
          }
          S.wetT[c] = S.t; S.wet[c] = 1;
        }
      }
      S.under = now;
      S.brush = { x: w.x, y: w.y };
    } else if (S.brush) { S.brush = null; S.under = new Set(); if (wetDone(S)) { S.phase = 'leaf'; S.leaf = 0; ev(S, { k: 'wet-done' }); } }
    return S.ev;
  }
  if (S.phase === 'leaf') {
    const n = S.g.n, tx = slotX(n, S.leaf), ty = ZH.H / 2;
    if (inp.cushion && !S.held) { S.held = { x: inp.cushion.x, y: inp.cushion.y, x0: inp.cushion.x, y0: inp.cushion.y, hist: [], on: false, steady: 0 }; ev(S, { k: 'lift' }); return S.ev; }
    if (!S.held) return S.ev;
    const H = S.held;
    if (w && w.down) { H.on = true; H.x = w.x; H.y = w.y; H.hist.push({ t: S.t, x: w.x, y: w.y }); while (H.hist.length > 2 && S.t - H.hist[0].t > ZH.PULL_T) H.hist.shift(); if (inp.steady) H.steady += dt; return S.ev; }
    if (!H.on) return S.ev;
    // the release: pulled back? where? (the flutter shifts an unsteadied leaf a little: level 1's draught)
    S.held = null;
    const a = H.hist[0] || { x: H.x, y: H.y }, b = { x: H.x, y: H.y }, dx = tx - H.x0, dy = ty - H.y0, L = Math.hypot(dx, dy) || 1;
    const back = -(((b.x - a.x) * dx + (b.y - a.y) * dy) / L);
    const fl = S.lv === 1 && H.steady < 0.15 ? ZH.FLUTTER * Math.sin(S.t * 7) : 0;
    const ex = H.x - tx, ey = H.y + fl - ty, steadied = S.lv === 1 && H.steady >= 0.15;
    if (steadied) S.steady++;
    if (back > ZH.PULL) { const dmg = damage(S, 'zahav.tear', 'pull'); ev(S, { k: 'tear', dmg }); if (dmg) S.patch = true; return S.ev; }   // (the leaf torn: another leaf for the same slot)
    if (S.g.border && !masked(S)) { const dmg = damage(S, 'zahav.border', 'border'); ev(S, { k: 'border', dmg }); if (dmg) S.border = true; }
    let q = 'gold';
    if (Math.abs(ex) <= ZH.GOLD && Math.abs(ey) <= ZH.GOLD) q = 'gold';
    else if (Math.abs(ex) <= ZH.SNAP && Math.abs(ey) <= ZH.SNAP) { q = 'good'; S.borderline = true; }
    else {
      const why = ex > ZH.SNAP || Math.abs(ey) > ZH.SNAP ? 'hole' : 'wrinkle';
      const dmg = damage(S, why === 'hole' ? 'zahav.hole' : 'zahav.wrinkle', why); ev(S, { k: why, dmg, ex: +ex.toFixed(1), ey: +ey.toFixed(1) }); if (dmg) S.patch = true;
      q = 'bad';
    }
    S.leaves.push({ k: S.leaf, q, ex: +ex.toFixed(1), ey: +ey.toFixed(1), steadied });
    ev(S, { k: 'laid', i: S.leaf, q, ex: +ex.toFixed(1), ey: +ey.toFixed(1), steadied });
    S.laid.push({ seg: S.k, k: S.leaf, q });
    S.leaf++;
    if (S.leaf >= n) { S.phase = 'burnish'; S.pt = 0; ev(S, { k: 'ready' }); }
    return S.ev;
  }
  if (S.phase === 'burnish') {
    if (w && w.down) {
      if (!S.agate) S.agate = { x: w.x, y: w.y, t: S.t, last: -1 };
      const A = S.agate, d = Math.hypot(w.x - A.x, w.y - A.y), v = d / Math.max(1e-4, dt);
      const steps = Math.max(1, Math.ceil(d / 6));
      for (let i = 1; i <= steps; i++) {
        const x = A.x + (w.x - A.x) * i / steps, y = A.y + (w.y - A.y) * i / steps, c = cellOf(x, y);
        if (c >= 0 && c !== A.last) { S.burn[c]++; if (v > ZH.BURN_V) { S.burnFast[c]++; if (S.burnFast[c] >= ZH.BURN_FAST && !S.wrinkle) { S.wrinkle = true; ev(S, { k: 'small-wrinkle', c }); } } A.last = c; for (const cc of cellsNear(x, y, ZH.AGATE * 0.6)) if (cc !== c) S.burn[cc] += 0.5; }
      }
      A.x = w.x; A.y = w.y;
      if (burnDone(S)) segDone(S);
    } else S.agate = null;
  }
  return S.ev;
}
function segDone(S) {
  const g = S.patch || S.border ? 'ok' : S.borderline || S.puddle || S.wrinkle ? 'good' : 'gold';
  S.steps.push({ i: S.k, grade: g, steady: S.lv === 1 && S.steady >= S.g.n, two: S.lv > 1 || S.steady > 0 });
  ev(S, { k: 'seg-done', i: S.k, grade: g, steady: S.lv === 1 && S.steady >= S.g.n });
  if (S.k + 1 >= S.P.segs.length) { S.done = true; S.phase = 'done'; ev(S, { k: 'done' }); }
  else { S.phase = 'next'; S.pt = 0; }
}
export function result(S) {
  const n = S.steps.length || 1, base = n * 40, flaws = S.flaws.length, PT = { gold: 40, good: 20, ok: 10 };
  const pts = S.steps.reduce((a, s) => a + PT[s.grade], 0), net = pts - flaws * 20, gold = S.steps.filter((s) => s.grade === 'gold').length;
  const allGold = gold === S.steps.length && S.steps.length > 0;
  const stars = !flaws && net >= base * 0.85 ? 3 : net >= base * 0.65 ? 2 : 1;
  return { stars, q: Math.max(0, net) / base, pts, perfect: stars === 3 && allGold, bonus: allGold && !flaws, flags: { segs: S.steps.length, gold, flaws, steady: S.steps.filter((s) => s.steady).length } };
}
export function save(S, id) { return { id, v: 1, lv: S.lv, k: S.k, steps: S.steps, flaws: S.flaws, first: S.first, mask: S.mask, laid: S.laid }; }
export function load(b) { if (!b || b.v !== 1) return null; const S = fresh(b.lv); S.steps = b.steps || []; S.flaws = b.flaws || []; S.first = !!b.first; S.mask = b.mask; S.laid = b.laid || []; seg(S, Math.min(S.P.segs.length - 1, S.steps.length)); return S; }
/* ───────── a bot: the mask first, the wet in rows, each leaf to its slot (o.err: dp off; o.pull: pull back), the agate in rows ───────── */
export function bot(S, o = {}) {
  const B = S.__bot || (S.__bot = { path: null, i: 0, phase: '', rest: 0, seg: -1 });
  if (B.seg !== S.k || B.phase !== S.phase + ':' + S.leaf) { B.seg = S.k; B.phase = S.phase + ':' + S.leaf; B.path = null; B.i = 0; B.rest = 0.1; }
  const out = { mask: S.g.border && !o.noMask ? S.g.border : null, steady: S.lv === 1 && o.steady };
  if (B.rest > 0) { B.rest -= 1 / 60; return { ...out, work: { down: false } }; }
  if (S.phase === 'wet') {
    if (!B.path) { B.path = []; const rows = S.P.wetOne ? [ZH.H / 2] : [ZH.H * 0.2, ZH.H * 0.6, ZH.H * 0.9]; rows.forEach((y, j) => { const xs = j % 2 ? [ZH.W, 0] : [0, ZH.W]; for (let k = 0; k <= 30; k++) B.path.push({ x: xs[0] + (xs[1] - xs[0]) * k / 30, y }); }); B.i = 0; }
    if (B.i < B.path.length) return { ...out, work: { ...B.path[B.i++], down: true } };
    return { ...out, work: { down: false } };
  }
  if (S.phase === 'leaf') {
    if (!S.held) return { ...out, cushion: { x: 24, y: -58 }, work: { down: false } };
    const tx = slotX(S.g.n, S.leaf) + (o.err || 0), ty = ZH.H / 2;
    if (!B.path) { B.path = []; for (let k = 0; k <= 24; k++) B.path.push({ x: 24 + (tx - 24) * k / 24, y: -58 + (ty + 58) * k / 24 }); if (o.pull) for (let k = 1; k <= 4; k++) B.path.push({ x: tx - k * 4, y: ty }); B.i = 0; }
    if (B.i < B.path.length) return { ...out, work: { ...B.path[B.i++], down: true } };
    return { ...out, work: { down: false } };
  }
  if (S.phase === 'burnish') {
    if (!B.path) { B.path = []; for (let r = 0; r < ZH.ROWS; r++) { const y = (r + 0.5) * ZH.H / ZH.ROWS; for (let rep = 0; rep < 2; rep++) { const xs = (r + rep) % 2 ? [ZH.W - 4, 4] : [4, ZH.W - 4]; for (let k = 0; k <= 84; k++) B.path.push({ x: xs[0] + (xs[1] - xs[0]) * k / 84, y }); } } B.i = 0; }
    if (B.i < B.path.length) return { ...out, work: { ...B.path[B.i++], down: true } };
    B.path = null; return { ...out, work: { down: false } };
  }
  return { ...out, work: { down: false } };
}
