/* ── build 94 ── nikanor94.js — stage 06, שער ניקנור, rebuilt as physical acts in the world (the owner, 3.11 22:12: "תמשיך ל 4-6"; the task
 * doc, stage 06: the bronze leaf raised on a lever and wedges, a wedge driven under it by a blow while the gap is open; the leaf hung on its
 * pivot; the fifteen steps set on their half circle, each one's note true when it lies on its line — "מֻקָּפוֹת כַּחֲצִי גֹרֶן עֲגֻלָּה", מדות ב, ה;
 * the review §3: each act more than once, each time harder). Pure: no THREE, no DOM. har42.js plays it. Never a Divine Name. */

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const DRAG94 = 14;

/* ───────── THE LEVER (מוט ויתדות): his weight on the pole's end lifts the leaf; let go, it sinks; a wedge under it while the gap is open ───────── */
/** per level (0: his first leaf, the south's; 1: the north's, heavier; 2: the yard's/test's): n wedges to its hanging height; reach: the gap
 *  (in wedge heights) with the pole all the way down; up: how fast the heavy leaf follows his pull (wedges/s); sink: how fast it settles when
 *  he lets go (wedges/s), and acc: faster each wedge (the higher, the heavier on the pole); a wedge goes in at a gap ≥ 1, catches half-way and
 *  springs out at ≥ short; under that the mallet strikes the leaf's foot (a "low" — said, not counted) */
export const LEVER94 = Object.freeze({
  L: Object.freeze([
    Object.freeze({ n: 4, reach: 1.45, up: 1.6, sink: 0.5, acc: 0.15 }),
    Object.freeze({ n: 5, reach: 1.38, up: 1.25, sink: 0.6, acc: 0.18 }),
    Object.freeze({ n: 5, reach: 1.3, up: 1.1, sink: 0.65, acc: 0.2 }),
  ]),
  short: 0.6, crewAfter: 5,
});
export function createLever94(i = 0) {
  const P = LEVER94.L[clamp(i | 0, 0, 2)];
  const k = { i: clamp(i | 0, 0, 2), n: P.n, notch: 0, lift: 0, press: 0, held: false, peak: 0, misses: 0, shorts: 0, lows: 0, done: false, crew: false, q: null, last: null, t: 0 };
  /** his finger on the pole's end: p 0…1 (how far down); off: let go */
  function press(p) { if (k.done) return; k.held = true; k.press = clamp(+p || 0, 0, 1); }
  function letGo() { k.held = false; k.press = 0; }
  const sinkV = () => P.sink * (1 + P.acc * k.notch);
  function step(dt) {
    if (k.done || !(dt > 0)) return k; let r = Math.min(dt, 0.5);
    while (r > 1e-6 && !k.done) { const h = Math.min(0.05, r); r -= h; k.t += h;
      const want = k.held ? k.press * P.reach : 0;
      if (k.lift < want) k.lift = Math.min(want, k.lift + P.up * h); else k.lift = Math.max(want, k.lift - (k.held ? P.up : sinkV()) * h);
      k.peak = Math.max(k.peak, k.lift);
      if (k.lift <= 1e-4 && k.peak >= 1) { k.misses++; k.peak = 0; k.last = 'sank'; if (k.misses + k.shorts >= LEVER94.crewAfter) crewDo(); }
      if (k.lift <= 1e-4) k.peak = 0;
    }
    return k;
  }
  /** a blow on the wedge at the gap under the leaf → 'in' | 'done' | 'short' | 'low' */
  function wedge() {
    if (k.done) return 'done';
    if (k.lift >= 1) { k.notch++; k.lift -= 1; k.peak = k.lift; k.last = 'in'; if (k.notch >= k.n) { k.done = true; finish(); return 'done'; } return 'in'; }
    if (k.lift >= LEVER94.short) { k.shorts++; k.last = 'short'; if (k.misses + k.shorts >= LEVER94.crewAfter) crewDo(); return 'short'; }
    k.lows++; k.last = 'low'; return 'low';
  }
  function crewDo() { k.notch = k.n; k.lift = 0; k.done = true; k.crew = true; k.q = 0; k.last = 'crew'; }
  function finish() { const f = k.misses + k.shorts; k.q = f <= 0 ? 1 : f <= 2 ? 0.5 : 0; }
  return { press, letGo, step, wedge, state: () => k, P, sinkV };
}

/* ───────── THE STEPS (חמש עשרה מעלות, מדות ב, ה): each step's key stone slid on its rollers to its line; its note true when it lies there ───────── */
/** per part (steps, steps2, steps3: five steps each, from the bottom): tol — the stone's distance from its line (in step depths, ½ amah) for
 *  a true note; off — up to it the stone lies, its note off; beyond it, it rocks and stays where it stopped, to be slid again; lag/damp — the
 *  heavy stone after his finger; mu — the rollers' friction once he lets go (the slide goes on: let go while it moves and it overshoots) */
export const STEPS94 = Object.freeze({
  L: Object.freeze([
    Object.freeze({ tol: 0.55, off: 1.2, lag: 4.2, mu: 3.4 }),
    Object.freeze({ tol: 0.42, off: 0.95, lag: 3.6, mu: 2.7 }),
    Object.freeze({ tol: 0.3, off: 0.75, lag: 3.0, mu: 2.1 }),
  ]),
  per: 5, depth: 0.5, x0: 4.5, scale: Object.freeze([0, 2, 4, 7, 9]),
});
/** the note of step k (0 … 14, from the bottom) in semitones over 220 Hz; the steps' tune climbs the pentatonic scale */
export const deg94 = (k) => { const s = STEPS94.scale; return s[k % s.length] + 12 * Math.floor(k / s.length); };
export const freq94 = (deg, cents = 0) => 165 * Math.pow(2, (deg + cents / 100) / 12);
/** one part's five steps (i: 0, 1, 2 → steps k = 5i … 5i+4). x: the stone's place along its radius (amot; 0 = on its line, + outward) */
export function createSteps94(i = 0) {
  const P = STEPS94.L[clamp(i | 0, 0, 2)], C = STEPS94;
  const k = { i: clamp(i | 0, 0, 2), j: 0, k0: clamp(i | 0, 0, 2) * C.per, x: C.x0, v: 0, tx: C.x0, held: false, sliding: false, offs: 0, notes: [], qs: [], done: false, q: null, last: null, t: 0 };
  /** his finger on the stone: grab; drag(tx) the place he pulls it to (amot along its radius); let go: it slides on and stops */
  function grab() { if (k.done) return false; k.held = true; k.sliding = false; k.tx = k.x; return true; }
  function drag(tx) { if (k.held && Number.isFinite(tx)) k.tx = clamp(tx, -6, 8); }
  function letGo() { if (!k.held) return; k.held = false; k.sliding = true; }
  const err = () => k.x / C.depth;
  function step(dt) {
    if (k.done || !(dt > 0)) return null; let r = Math.min(dt, 0.5), out = null;
    while (r > 1e-6 && !out) { const h = Math.min(0.03, r); r -= h; k.t += h;
      if (k.held) { const a = (k.tx - k.x) * P.lag * P.lag - 2 * P.lag * k.v; k.v += a * h; k.x += k.v * h; }
      else if (k.sliding) { const s = Math.sign(k.v), dv = P.mu * h; if (Math.abs(k.v) <= dv) { k.v = 0; k.sliding = false; out = settle(); } else { k.v -= s * dv; k.x += k.v * h; } }
    }
    return out;
  }
  /** the stone stopped → 'true' | 'off' (it lies, its note off) | 'rock' (it does not lie: slide it again) | 'done' */
  function settle() {
    const e = Math.abs(err()), kk = k.k0 + k.j;
    if (e > P.off) { k.offs++; k.last = 'rock'; return 'rock'; }
    const good = e <= P.tol; k.qs.push(good ? 1 : 0.5); k.notes.push({ deg: deg94(kk), cents: good ? 0 : Math.round(clamp(err(), -2, 2) * 45) }); k.last = good ? 'true' : 'off';
    k.j++; if (k.j >= C.per) { k.done = true; const m = k.qs.reduce((a, b) => a + b, 0) / k.qs.length - 0.1 * Math.max(0, k.offs - 1); k.q = m >= 0.95 ? 1 : m >= 0.6 ? 0.5 : 0; return 'done'; }
    k.x = C.x0; k.v = 0; k.tx = C.x0; return k.last;
  }
  /** the hum under his hand as he slides: cents off the true note (0 within tol) */
  function hum() { const e = err(); return Math.abs(e) <= P.tol ? 0 : Math.round(clamp(e, -3, 3) * 40); }
  return { grab, drag, letGo, step, hum, err, state: () => k, P, cur: () => k.k0 + k.j };
}

export const rate94 = (q) => (q >= 1 ? 'mehudar' : q >= 0.5 ? 'kasher' : 'tikkun');
