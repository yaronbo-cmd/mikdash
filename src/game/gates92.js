/* ── build 92 ── gates92.js — STAGE 04 REBUILT AS PHYSICAL ACTS (the owner, 3.11 22:12: "תמשיך ל 4-6"; the task doc "שלב א׳ — המשימות
 * שנותרו": "המשקוף מורם בשני מנופים אמיתיים בפתח האמיתי שנשאר בחומה; אבן הרודיאנית. הכנף: ציר וגומה שרואים, הכנף נעצרת באופן שרואים";
 * the review "המשחקונים 03–13 — בחינת האתגר, הסיפוק וההארד פאן" §3 stage 04: risk inside the act — tilted too far the lintel slips back to
 * the ground (start again, free); a lintel for each gate, each heavier; the setting is the end of the lift — both ends must land together;
 * the leaf's pin goes in by place and by lean; the swing by strength — too hard it slams, too soft it does not close).
 *
 * THE GATES: "all the gateways there were twenty cubits high and ten wide" (Middot 2:3); on the north "the gate of the spark … the gate of
 * the offering" (Middot 1:5), on the south "the water gate" (Middot 1:4). He sets these three lintels, each heavier; the crews the rest.
 *
 * THE LINTEL on two treadwheel cranes, one at each end: he HOLDS the stone itself — while he holds, the crews walk their wheels and it
 * rises; the end he holds rises faster (his finger's place along the stone); the crews are never even (a drift), and the heavier stones
 * sway. A mason's A-frame level (libella) rides on it, its plumb bob showing the tilt. Tilted past the sling's hold, the low end slips out
 * and the stone slides back to the ground — start again (free; it counts). Let go — the crews brake: it hangs still. At the top the poles
 * swing it in over the opening, and it swings along its length a while. Then he holds it again to lower it — the longer he holds, the
 * faster the ropes pay out (a light touch: slow), and the end he holds goes down faster. It lands on the two jambs: off along its length,
 * one end misses its jamb (the crews lift it back a little); not level, one end lands first; too fast, its arris chips.
 *
 * THE LEAF hangs on the cranes beside its socket; he drags it along — it follows late and leans (a heavy thing); held still over the
 * socket and hanging straight, his hold lowers its pin in; off, or leaning, the pin knocks on the socket's rim (lifted back, free). Then a
 * flick on the leaf swings it shut: too soft it stops short and comes back; too hard it slams.
 *
 * Pure (no DOM, no three): har42.js draws and drives it; the tests read it. The method is המחשה (Vitruvius 10.2; the libella). Never a
 * Divine Name. ── /build 92 ── */

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** the three gates he sets (x: the opening's middle; face: the gatehouse's outer face, z), the opening (Middot 2:3), the stone */
export const GATES92 = Object.freeze({
  gates: Object.freeze([
    Object.freeze({ id: 'nitzotz', n: 'שער הניצוץ', x: -38, face: -78, why: '"וְשֶׁבַּצָּפוֹן, שַׁעַר הַנִּיצוֹץ" (מדות א, ה)' }),
    Object.freeze({ id: 'korban', n: 'שער הקרבן', x: -95, face: -78, why: '"שֵׁנִי לוֹ, שַׁעַר הַקָּרְבָּן" (מדות א, ה)' }),
    Object.freeze({ id: 'mayim', n: 'שער המים', x: -38, face: 78, why: 'בדרום: "שְׁלִישִׁי לוֹ, שַׁעַר הַמַּיִם" (מדות א, ד)' }),
  ]),
  W: 10, H: 20, jamb: 4, deep: 14,   // (the opening: 10 wide, 20 high — Middot 2:3 (the hearth's house's door 18, as the model's); each tower beside it; the gatehouse's depth)
  lw: 13.4, lh: 1.7, ld: 1.9,   // (the lintel: over the opening and 1.7 on each jamb)
  clear: 2.2,   // (the lintel's foot over the jambs' tops when the poles swing it in)
  craneX: 10.5, craneZ: 5.5, craneH: 38, wheelR: 2.6,   // (each crane off the opening's middle, before the face; its pole; its wheel)
});

/** each lintel heavier: rise (of the whole way, per second), lag (how slowly the tilt follows his hand), drift and sway (the crews'
 *  unevenness, rad/s), slip (the sling's hold, rad), swing (along its length after the swing-in, amot) and its damping, win (each end on
 *  its jamb: off along by less), flat (both ends together: tilt under), vChip (amot/s at the landing) */
export const LINTEL92 = Object.freeze({
  L: Object.freeze([
    Object.freeze({ rise: 0.085, lag: 3.2, drift: 0.05, sway: 0, swayW: 0, slip: 0.3, swing: 0.7, damp: 0.75, win: 0.5, flat: 0.06, vChip: 1.25 }),
    Object.freeze({ rise: 0.072, lag: 2.4, drift: 0.09, sway: 0.05, swayW: 1.1, slip: 0.26, swing: 1.1, damp: 0.45, win: 0.4, flat: 0.05, vChip: 1.1 }),
    Object.freeze({ rise: 0.062, lag: 1.8, drift: 0.11, sway: 0.09, swayW: 1.4, slip: 0.23, swing: 1.5, damp: 0.3, win: 0.32, flat: 0.04, vChip: 1.0 }),
  ]),
  A: 0.34,   // (rad/s of tilt with his hand at an end)
  takeUp: 0.3,   // (s: the crews take up the slack — a tap moves nothing)
  swingT: 1.6, om: 2.6,   // (the swing-in's time; the swing along: rad/s)
  lowerAm: 2.2, vDown: 0.9, hold0: 0.18, holdRamp: 1.5, holdMax: 1.8,   // (the way down to the jambs; amot/s at full; the hold's ramp, as stage 03's rope)
  slipT: 1.8, back: 0.45, crewAfter: 3,   // (the slip's slide down; a miss lifts it back that share of the way; after 3 slips the crews set it)
});
/** the lowering speed (a multiple of vDown) after holding t seconds */
export const hold92 = (t, c = LINTEL92) => (t > 0 ? Math.min(c.holdMax, c.hold0 + (1 - c.hold0) * (t / c.holdRamp)) : 0);

/** a lintel at gate i (0…2) → { hold(on, u), step(dt), state() } — u: his finger along the stone, −1 (its left end on the screen) … 1 */
export function createLintel92(i = 0, rnd = Math.random) {
  const P = LINTEL92.L[clamp(i | 0, 0, 2)], C = LINTEL92;
  const k = { i: clamp(i | 0, 0, 2), ph: 'lift', y: 0, th: 0, w: 0, u: 0, holding: false, holdT: 0, t: 0, sx: 0, sv: 0, low: 0, v: 0,
    slips: 0, misses: 0, hard: 0, chip: false, uneven: false, pt: 0, done: false, q: null, crew: false, last: null,
    drift: (rnd() < 0.5 ? -1 : 1) * P.drift, ph0: rnd() * 6.283, sw0: (rnd() < 0.5 ? -1 : 1) * P.swing };
  const bias = () => k.drift + P.sway * Math.sin(P.swayW * k.t + k.ph0);
  function hold(on, u) { if (k.done) return; if (Number.isFinite(u)) k.u = clamp(u, -1, 1); if (!!on !== k.holding) { k.holding = !!on; k.holdT = 0; } }
  /** the tilt: toward the rate his hand and the crews ask, late by the stone's weight; braked when he lets go */
  function tilt(dt, sgn) {
    if (k.holding && k.holdT >= C.takeUp * (sgn < 0 ? 0.5 : 1)) { const want = sgn * C.A * k.u + bias() * (sgn < 0 ? 0.5 : 1); k.w += (want - k.w) * Math.min(1, P.lag * dt); }
    else k.w *= Math.exp(-4 * dt);
    k.th += k.w * dt;
  }
  function slipNow() { k.ph = 'slip'; k.pt = 0; k.slips++; k.last = 'slip'; k.holding = false; }
  /** (a slow frame is stepped in small steps: the swing and the tilt stay true on a slow phone) */
  function step(dt) { if (k.done || !(dt > 0)) return k; let r = Math.min(dt, 0.5); while (r > 1e-6 && !k.done) { const h = Math.min(0.05, r); step1(h); r -= h; } return k; }
  function step1(dt) {
    k.t += dt; if (k.holding) k.holdT += dt;
    if (k.ph === 'lift') {
      tilt(dt, 1);
      if (Math.abs(k.th) > P.slip) { slipNow(); return k; }
      if (k.holding && k.holdT >= C.takeUp) k.y = Math.min(1, k.y + P.rise * dt);
      if (k.y >= 1) { k.ph = 'swing'; k.pt = 0; k.w = 0; k.holding = false; }
    } else if (k.ph === 'slip') {
      k.pt += dt; const u = Math.min(1, k.pt / C.slipT); k.y = Math.max(0, k.y * (1 - u * u)); k.th += Math.sign(k.th || 1) * dt * 0.25;
      if (k.pt >= C.slipT) { k.y = 0; k.th = 0; k.w = 0; k.ph = 'lift'; if (k.slips >= C.crewAfter) { k.crew = true; finish(); } }
    } else if (k.ph === 'swing') {
      k.pt += dt; if (k.pt >= C.swingT) { k.ph = 'over'; k.sx = k.sw0; k.sv = 0; k.low = 0; }
    } else if (k.ph === 'over') {
      k.sv += (-C.om * C.om * k.sx - 2 * P.damp * k.sv) * dt; k.sx += k.sv * dt;
      tilt(dt, -1);
      if (Math.abs(k.th) > P.slip) { slipNow(); return k; }
      k.v = k.holding && k.holdT >= C.takeUp * 0.5 ? C.vDown * hold92(k.holdT) : 0;
      k.low = Math.min(C.lowerAm, k.low + k.v * dt);
      if (k.low >= C.lowerAm - 1e-9) land();
    }
    return k;
  }
  function land() {
    if (Math.abs(k.sx) > P.win) { k.misses++; k.last = 'miss'; k.low = C.lowerAm * (1 - C.back); k.sv += -Math.sign(k.sx) * 0.4; k.holding = false; return; }
    k.uneven = Math.abs(k.th) > P.flat; k.chip = k.v > P.vChip; k.hard = (k.uneven ? 1 : 0) + (k.chip ? 1 : 0); k.last = 'set'; finish();
  }
  function finish() {
    k.done = true; k.ph = 'set'; k.holding = false;
    if (k.crew) { k.q = 0; return; }
    const f = k.slips + k.misses + k.hard; k.q = f <= 0 ? 1 : f <= 2 ? 0.5 : 0;
  }
  /** the stone's place: rise (0…1 of the way up), the lowering (amot down from the swing-in height), the swing along (amot), the tilt (rad) */
  return { hold, step, state: () => k, P };
}

/** the stone's height over the ground (its foot) for the state: up the whole way to the jambs' top and clear, then down to the jambs */
export function lintelY92(k, H = GATES92.H, g = GATES92, c = LINTEL92) {
  const top = H + g.clear;
  if (k.ph === 'lift' || k.ph === 'slip') { const e = k.y; return top * e; }
  if (k.ph === 'swing') return top;
  if (k.ph === 'over') return top - (k.low / c.lowerAm) * g.clear;
  return H;
}
/** where the stone hangs before the face (z off the face, out toward the cranes): out while it rises, in over the opening after the swing */
export function lintelZ92(k, g = GATES92, c = LINTEL92) {
  const out = g.craneZ * 0.55, inn = g.ld / 2;
  if (k.ph === 'lift' || k.ph === 'slip') return out;
  if (k.ph === 'swing') { const u = Math.min(1, k.pt / c.swingT), e = u * u * (3 - 2 * u); return out + (inn - out) * e; }
  return inn;
}

/** the LEAF (the door) on its pivot: hang (dragged along to its socket, it follows late and leans; held still over it, a hold lowers the
 *  pin), then swing (a flick: too soft it comes back, too hard it slams). heavy: the second leaf, of the heavier gate */
export const LEAF92 = Object.freeze({
  light: Object.freeze({ lag: 2.6, om: 2.4, damp: 0.55, tol: 0.35, tolLean: 0.06, soft: 0.55, hard: 1.9, x0: 2.6 }),
  heavy: Object.freeze({ lag: 1.6, om: 1.9, damp: 0.35, tol: 0.25, tolLean: 0.045, soft: 0.8, hard: 1.6, x0: 3.4 }),
  drop: 2.4, vDrop: 0.8, back: 0.5, leanK: 0.09,   // (the pin's way down into the socket; amot/s; a knock lifts it back that share; lean per amah/s² of his pull)
});
export function createLeaf92(heavy = false, rnd = Math.random) {
  const P = heavy ? LEAF92.heavy : LEAF92.light, C = LEAF92;
  const k = { heavy: !!heavy, ph: 'hang', x: (rnd() < 0.5 ? -1 : 1) * P.x0, vx: 0, lean: 0, lv: 0, tx: null, holding: false, holdT: 0, low: 0,
    knocks: 0, weak: 0, slam: false, open: 1, ov: 0, done: false, q: null, last: null, t: 0 };
  k.tx = k.x;
  /** his drag: the place he pulls the leaf toward (amot along, 0 = over the socket); hold: his finger still on it (the pin lowers) */
  function pull(tx) { if (k.ph === 'hang' && Number.isFinite(tx)) k.tx = clamp(tx, -6, 6); }
  function hold(on) { if (k.done) return; if (!!on !== k.holding) { k.holding = !!on; k.holdT = 0; } }
  function step(dt) { if (k.done || !(dt > 0)) return k; let r = Math.min(dt, 0.5); while (r > 1e-6 && !k.done) { const h = Math.min(0.05, r); step1(h); r -= h; } return k; }
  function step1(dt) {
    k.t += dt; if (k.holding) k.holdT += dt;
    if (k.ph === 'hang') {
      const ax = (k.tx - k.x) * P.lag * P.lag - 2 * P.lag * k.vx; k.vx += ax * dt; k.x += k.vx * dt;   // (it follows his hand late: a heavy thing)
      k.lv += (-P.om * P.om * k.lean - 2 * P.damp * k.lv - C.leanK * ax) * dt; k.lean += k.lv * dt;   // (and leans against the pull, then swings back)
      const still = Math.abs(k.tx - k.x) < 0.25 && Math.abs(k.vx) < 0.4;
      if (k.holding && still) k.low = Math.min(C.drop, k.low + C.vDrop * dt);
      if (k.low >= C.drop - 1e-9) {
        if (Math.abs(k.x) <= P.tol && Math.abs(k.lean) <= P.tolLean) { k.ph = 'swing'; k.x = 0; k.lean = 0; k.last = 'seat'; k.holding = false; }
        else { k.knocks++; k.last = 'rim'; k.low = C.drop * (1 - C.back); k.lv += (k.x >= 0 ? 1 : -1) * 0.3; k.holding = false; }
      }
    } else if (k.ph === 'shut') {
      k.open = Math.max(0, k.open - k.ov * dt); if (k.open <= 0) { k.done = true; finish(); }
    } else if (k.ph === 'back') {
      k.open = Math.min(1, k.open + 0.7 * dt); if (k.open >= 1) k.ph = 'swing';
    } else if (k.ph === 'short') {
      k.open = Math.max(k.stop, k.open - k.ov * dt); if (k.open <= k.stop + 1e-6) k.ph = 'back';
    }
    return k;
  }
  /** a flick on the leaf toward shut: v in screen widths per second → 'weak' | 'ok' | 'slam' | 'wait' */
  function flick(v) {
    if (k.ph !== 'swing') return 'wait';
    if (!(v >= P.soft)) { k.weak++; k.ph = 'short'; k.ov = 0.9; k.stop = clamp(1 - v / P.soft, 0.25, 0.85); k.last = 'weak'; return 'weak'; }
    k.slam = v > P.hard; k.ov = k.slam ? 2.6 : 1.1; k.ph = 'shut'; k.last = k.slam ? 'slam' : 'ok'; return k.last;
  }
  function finish() { const f = k.knocks + (k.slam ? 1 : 0); k.q = f <= 0 ? 1 : f <= 2 ? 0.5 : 0; }
  return { pull, hold, step, flick, state: () => k, P };
}

/** his stones from this act's q: whole, half, none (the "האבנים שלך" of stage 03) */
export const rate92 = (q) => (q >= 1 ? 'mehudar' : q >= 0.5 ? 'kasher' : 'tikkun');
