/* ── build 84 ── soreg84.js — STAGE 03 REBUILT AS PHYSICAL ACTS (the owner, 3.11: "לא שינית כלום, המשחקונים נשארו גרועים"; the review
 * "המשחקונים 03–13 — בחינת האתגר, הסיפוק וההארד פאן" §3 stage 03 and §5: each act repeated at a rising level, risk inside the act, the
 * score "האבנים שלך" — מהודר a whole stone, כשר a half, a failed act 0 though the stone stands).
 *
 * THE STONE LATTICE (הסורג): Josephus describes the partition as stone — "a stone balustrade, three cubits high, very gracefully wrought"
 * (Wars 5.193; Ant. 15.417); the Mishnah gives its height as ten handbreadths (Middot 2:3). So the lattice is pierced stone slabs; the way
 * they are set — between grooved posts, lowered by a small hoist — is an illustration (המחשה). Each slab must continue the carved pattern
 * of the one before it. The crew lifts the slabs off the cart one at a time; he looks, turns a slab that stands back to front, sends back
 * one that does not continue, and lowers the right one on the rope: his finger pays out the rope (down lowers, up raises) and its side
 * pull is the tag line that steadies the swing. The slab enters the grooves only when it hangs straight over them; else it knocks on the
 * post tops and swings (a jam). Set down too fast, its edge chips. Three slabs a section, three sections, each harder: tighter grooves,
 * less damping, wind, slabs that come back to front, patterns whose wrong phase is hard to see.
 *
 * THE WARNING STONES: "upon it stood pillars at equal distances from one another" (Wars 5.193–194). The master builder paces the gap once;
 * he must set every stone that many paces from the one before — the count shown at first, then only the ticks, then carrying the weight.
 *
 * Pure (no DOM, no three): har42.js draws and drives it; the tests read it. Never a Divine Name. ── /build 84 ── */

export const SOREG84 = Object.freeze({
  bay: 1.5, post: 0.26, pil: 0.5, H: 1.68, T: 0.2, postH: 1.86, rim: 0.11, side: 0.05,   // (amot: the slab between its posts' faces; 10 טפחים high)
  apex: 6.6, hang: 0.85,   // (the hoist's sheave over the sill; the slab's bottom over the post tops when the crew hooks it)
  g: 19.6,   // (amot/s²: an amah ≈ ½ m)
  payK: 1.35,   // (amot of rope per screen height of finger travel)
  pullA: 1.6,   // (amot/s² of the tag line at full pull)
  bays: 3, parts: 3,
  cands: Object.freeze([Object.freeze([2, 3, 3]), Object.freeze([3, 3, 4]), Object.freeze([3, 4, 4])]),
  kinds: Object.freeze(['diamonds', 'rings', 'tri']),
  he: Object.freeze({ diamonds: 'מעוינים', rings: 'מעוינים וטבעות', tri: 'משולשים' }),
  p: 0.42, bar: 0.05, ring: 0.1, hstep: 0.3,
  jamUp: 0.28, jamKick: 0.55, helpAt: 3,
  tolMax: 0.17, tolMin: 0.05, dampMax: 1.9, dampMin: 0.28, sway0: Object.freeze([0.12, 0.42]), vChip: Object.freeze([1.5, 0.7]), wind: 0.9,
});

export const VALUE84 = Object.freeze({ mehudar: 1, kasher: 0.5, tikkun: 0 });
export const Q84 = Object.freeze({ mehudar: 1, kasher: 0.7, tikkun: 0.3 });

const lerp = (a, b, k) => a + (b - a) * k;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const frac = (v) => v - Math.floor(v);

/** the carved pattern at (X, Y) amot in the section's own coordinates (X to the right as seen from outside, Y up from the sill) → 0 a hole
 *  through the stone, 1 the stone's face, 2 a carved accent (drawn darker) */
export function motif84(kind, X, Y, c = SOREG84) {
  const p = c.p, s2 = Math.SQRT2;
  const u = (X + Y) / p, v = (X - Y) / p;
  const du = Math.abs(u - Math.round(u)) * p / s2, dv = Math.abs(v - Math.round(v)) * p / s2;
  if (kind === 'tri') {
    const h = c.hstep, dh = Math.abs(Y / h - Math.round(Y / h)) * h;
    if (dv < c.bar || dh < c.bar * 0.8) return 1;
    // a small round boss in every other triangle (the ones pointing up): the hand of the pattern
    const cellY = Math.floor(Y / h), xs = X - Y;   // (along the "/" bars)
    const q = frac(xs / p), up = q < 0.5;
    if (up) { const cx = (Math.floor(xs / p) + 0.25) * p + Y, cy = cellY * h + h * 0.36; if (Math.hypot(X - cx, (Y - cy) * 1.2) < c.bar * 1.2) return 2; }
    return 0;
  }
  if (du < c.bar || dv < c.bar) return 1;
  if (kind === 'rings') {
    // a ring in every other hole along the row: the holes' centres are where u and v are both half-integers
    const iu = Math.floor(u), iv = Math.floor(v);
    if ((((iu % 2) + 2) % 2) === 0) {
      const cu = iu + 0.5, cv = iv + 0.5, cx = ((cu + cv) * p) / 2, cy = ((cu - cv) * p) / 2, r = Math.hypot(X - cx, Y - cy);
      if (Math.abs(r - c.ring) < c.bar * 0.7) return 2;
    }
  }
  return 0;
}

/** the slab's face at its own (x, Y): a candidate { off, flip } in bay X0 (its window's left edge in the section) → the pattern there,
 *  with the slab's own rim (top and bottom) and thin side ribs */
export function face84(kind, X0, cand, x, Y, c = SOREG84) {
  if (Y < c.rim || Y > c.H - c.rim || x < c.side || x > c.bay - c.side) return 1;
  const xx = cand && cand.flip ? c.bay - x : x;
  return motif84(kind, X0 + (cand ? cand.off : 0) + xx, Y, c);
}

/** does this slab, as it stands, continue the pattern? — sampled over its face against the right one (≥ 97 % alike) */
export function fits84(kind, X0, cand, c = SOREG84, n = 28) {
  let same = 0, all = 0;
  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) {
    const x = c.side + ((i + 0.5) / n) * (c.bay - 2 * c.side), Y = c.rim + ((j + 0.5) / n) * (c.H - 2 * c.rim);
    const a = face84(kind, X0, cand, x, Y, c) > 0, b = face84(kind, X0, { off: 0, flip: false }, x, Y, c) > 0;
    all++; if (a === b) same++;
  }
  return same / all >= 0.97;
}

/** bay j's window in its section (the anchor slab j 0, his slabs 1…3): its left edge in pattern X */
export const bayX84 = (j, c = SOREG84) => j * (c.bay + c.post);

/** the slab's difficulty 0…1: its place among the nine (section k, slab i) and his level in the family */
export function diff84(k, i, L = 1, c = SOREG84) { const n = k * c.bays + i, N = c.parts * c.bays - 1; return clamp(n / N * 0.8 + (clamp(L | 0, 1, 4) - 1) * 0.1, 0, 1); }

/** one slab's set-up: the section's kind, its candidates on the cart (one right; the rest a wrong phase; in the third section any may
 *  stand back to front) and the hoist's numbers by its difficulty */
export function slab84(k, i, L = 1, rnd = Math.random, c = SOREG84) {
  const kind = c.kinds[clamp(k, 0, 2)], d = diff84(k, i, L, c), X0 = bayX84(i + 1, c);
  const nC = c.cands[clamp(k, 0, 2)][clamp(i, 0, 2)] + (L >= 3 && i === 2 ? 1 : 0);
  const offs = kind === 'rings' ? [c.p, c.p * 0.5, c.p * 1.5] : kind === 'tri' ? [c.p * 0.5, c.p * 0.25, c.p * 0.75] : [c.p * 0.5, c.p * 0.25, c.p * 0.75];
  const out = [{ off: 0, flip: kind === 'tri' && rnd() < 0.6, right: true }];
  for (let t = 0, q = 0; out.length < nC && t < 40; t++, q++) {
    const cand = { off: offs[q % offs.length] + (q >= offs.length ? c.p : 0), flip: kind === 'tri' ? rnd() < 0.5 : false, right: false };
    // (never a wrong one that would fit either way round)
    if (fits84(kind, X0, cand, c, 14) || fits84(kind, X0, { ...cand, flip: !cand.flip }, c, 14)) continue;
    out.push(cand);
  }
  // the cart's order: shuffled, but never the right one first at a level above 1 (a look first)
  for (let a = out.length - 1; a > 0; a--) { const b = Math.floor(rnd() * (a + 1)); [out[a], out[b]] = [out[b], out[a]]; }
  if ((L > 1 || k > 0) && out.length > 1 && out[0].right) { [out[0], out[1]] = [out[1], out[0]]; }
  return {
    k, i, kind, X0, d, cands: out,
    tol: +lerp(c.tolMax, c.tolMin, d).toFixed(3), damp: +lerp(c.dampMax, c.dampMin, d).toFixed(3),
    sway0: +lerp(c.sway0[0], c.sway0[1], d).toFixed(3) * (rnd() < 0.5 ? -1 : 1), vChip: +lerp(c.vChip[0], c.vChip[1], d).toFixed(3),
    wind: k >= 2 || d > 0.62 ? +(c.wind * (0.6 + 0.4 * d)).toFixed(3) : 0, ghost: k === 0 && i === 0 && L <= 1,
  };
}

/** THE HOIST: the slab on its rope under the sheave. step(dt, pay, pull): pay — amot of rope let out this frame (− hauls in), pull — the
 *  tag line −1…1. A pendulum about the sheave (its length the rope's), damped, the wind's gusts; over the posts' tops it enters the grooves
 *  only within tol of straight, else it knocks and swings (a jam); in the grooves it slides straight down; on the sill, its speed decides
 *  a clean seat or a chipped edge. Events: 'jam', 'enter', 'leave' (hauled back up out of the grooves), 'seat' (with chip). */
export function createHoist84(spec, c = SOREG84) {
  const top = c.postH + c.hang;
  const s = { ph: 'hang', yb: top, x: spec.sway0 || 0, vx: 0, v: 0, t: 0, jams: 0, chip: false, vLand: 0, help: false, ev: [] };
  const L = () => Math.max(0.4, c.apex - (s.yb + c.H));
  function step(dt, pay = 0, pull = 0) {
    s.ev = []; if (s.ph === 'seated' || !(dt > 0)) return s;
    s.t += dt;
    const vNow = pay / dt; s.v += (vNow - s.v) * Math.min(1, dt / 0.09);
    if (s.ph === 'hang') {
      const y1 = Math.min(top, s.yb - pay);
      // the swing (a few sub-steps: the short rope at the top swings fast)
      const n = Math.max(1, Math.ceil(dt / 0.008)), h = dt / n, damp = s.help ? Math.max(spec.damp, 3.2) : spec.damp;
      for (let q = 0; q < n; q++) {
        const gust = spec.wind ? spec.wind * (Math.sin((s.t + q * h) * 0.9) * 0.7 + Math.sin((s.t + q * h) * 2.3 + 1) * 0.3) : 0;
        const a = -(c.g / L()) * s.x - damp * s.vx + clamp(pull, -1, 1) * c.pullA + gust;
        s.vx += a * h; s.x += s.vx * h;
      }
      if (s.yb > c.postH && y1 <= c.postH) {
        if (Math.abs(s.x) <= spec.tol) { s.ph = 'groove'; s.yb = Math.min(y1, c.postH - 0.001); s.ev.push('enter'); }
        else { s.jams++; s.yb = c.postH + c.jamUp; s.vx += Math.sign(s.x || 1) * c.jamKick; s.v = 0; s.ev.push('jam'); if (s.jams >= c.helpAt) s.help = true; }
      } else s.yb = y1;
      return s;
    }
    if (s.ph === 'groove') {
      s.x += (0 - s.x) * Math.min(1, dt * 14); s.vx = 0;
      if (s.yb - pay >= c.postH) { s.ph = 'hang'; s.yb = c.postH + 0.01; s.ev.push('leave'); return s; }   // (hauled back up out of the grooves: a look at the seam, and back)
      const y1 = s.yb - pay;
      if (y1 <= 0) { s.yb = 0; s.ph = 'seated'; s.vLand = Math.max(0, s.v); s.chip = s.vLand > spec.vChip; s.ev.push('seat'); }
      else s.yb = y1;
    }
    return s;
  }
  return { step, state: () => s, L, top };
}

/** one slab's result: { right, jams, chip } → { rating, v (האבנים שלך), q } — the wrong slab seated is a failed act (0: the crew sets the
 *  right one); three jams and the crew steadied it (0); a jam or two, or a chipped edge — כשר; clean — מהודר */
export function slabQ84(r) {
  const rating = !r.right || r.jams >= SOREG84.helpAt ? 'tikkun' : r.jams > 0 || r.chip ? 'kasher' : 'mehudar';
  return { rating, v: VALUE84[rating], q: Q84[rating] };
}

/** a section's grade from its three slabs → q 0…1 (the mean) */
export const partQ84 = (items) => (items.length ? Math.round((items.reduce((a, r) => a + Q84[r.rating], 0) / items.length) * 1000) / 1000 : 0);

/** the score in the world: the items [[part, i, v], …] → their sum (halves kept) */
export const yours84 = (items) => (Array.isArray(items) ? items.reduce((a, q) => a + (Number(q && q[2]) || 0), 0) : 0);
/** the sum as he reads it: 4, 4½ */
export const yoursHe84 = (n) => { const w = Math.floor(n + 1e-9), h = n - w > 0.25; return h ? (w ? `${w}½` : '½') : String(w); };

/* ── THE WARNING STONES ── */
export const WARN84 = Object.freeze({ pace: 1.5, n: 4, gaps: Object.freeze([5, 6, 7]), cad: 0.55, cadHeavy: 0.82, demoCad: 0.62 });

/** the run's set-up: the gap in paces (the same for all: equal distances) and what each stone shows — footprints, the count, the weight */
export function warn84(L = 1, rnd = Math.random, c = WARN84) {
  const lv = clamp(L | 0, 1, 4), gap = c.gaps[Math.floor(rnd() * c.gaps.length)] + (lv >= 3 ? 1 : 0);
  const stones = Array.from({ length: c.n }, (_, i) => ({
    prints: i === 0 && lv <= 2, count: lv <= 1 ? i <= 1 : lv <= 2 ? i === 0 : false, heavy: i === c.n - 1, cad: i === c.n - 1 ? c.cadHeavy : c.cad,
  }));
  return { gap, stones, L: lv };
}

/** the paces: he walks a whole pace at a time (held: one after another; let go: the pace under way ends); a step back; set the stone */
export function createPaces84(spec, c = WARN84) {
  const s = { i: 0, n: 0, t: 0, walking: 0, hold: false, err: [], placed: [], done: false, ev: [] };
  const cad = () => (spec.stones[s.i] ? spec.stones[s.i].cad : c.cad);
  function step(dt, hold) {
    s.ev = []; s.hold = !!hold; if (s.done) return s;
    if (s.walking) { s.t += dt; if (s.t >= cad()) { s.n += s.walking; s.t = 0; s.ev.push(s.walking > 0 ? 'pace' : 'back'); s.walking = 0; } }
    if (!s.walking && s.hold) { s.walking = 1; s.t = 0; }
    return s;
  }
  function back() { if (s.done || s.walking || s.n <= 0) return false; s.walking = -1; s.t = 0; return true; }
  /** the pace under way as a fraction (for the figure between paces) */
  const at = () => s.n + (s.walking ? (s.walking * Math.min(1, s.t / cad())) : 0);
  function set() {
    if (s.done || s.walking || s.n <= 0) return null;
    const e = s.n - spec.gap, a = Math.abs(e), rating = a === 0 ? 'mehudar' : a === 1 ? 'kasher' : 'tikkun';
    const r = { i: s.i, paces: s.n, err: e, rating, v: VALUE84[rating], moved: a >= 2 };
    s.err.push(e); s.placed.push(r); s.i++; s.n = 0; s.t = 0;
    if (s.i >= spec.stones.length) s.done = true;
    return r;
  }
  const q = () => partQ84(s.placed);
  return { step, back, set, at, q, state: () => s, cad };
}

/* ── THE THIRTEEN BOWS: with the procession, on its beat (not graded — a moment; "together" counted) ── */
export const BOW84 = Object.freeze({ n: 13, gapX: 2.6, walk: 4.6, bowT: 1.05, win: 0.4 });
/** was his bow with theirs? his swipe's time against the procession's bow's start */
export const together84 = (tHis, tTheirs, c = BOW84) => Number.isFinite(tHis) && Number.isFinite(tTheirs) && tHis >= tTheirs - c.win && tHis <= tTheirs + c.bowT;
