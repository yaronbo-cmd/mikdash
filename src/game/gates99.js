/* ── build 99 ── gates99.js — stage 04 after the owner's notes on build 96 (4.11 07:36): the lintel "a good game, hard and challenging",
 * moved with TWO hands — a finger on each end of the stone. Each end hangs from its own treadwheel crane: while his finger is on an end its
 * crew walks their wheel and that end rises (a heavy stone: their pace builds up slowly; let go and they brake). The two crews never walk
 * alike (one quicker, and the quicker one changes), so the stone tilts; past the sling's hold the low end slips and it slides back down.
 * With one finger (a mouse) he raises an end, then the other, a little at a time. At the top the poles swing it in over the opening and it
 * swings along its length; then each finger pays out its end's rope, faster the longer it is held. Both ends must come down on their jambs
 * together, gently, with the swing settled: an end landing first, too hard, or off its jamb costs.
 * The leaf (its swing): build 98's heavy leaf on its pivot (nik98 createSwing98) — the crews push it round as his finger turns it.
 * Pure: no THREE, no DOM. har42.js draws and drives it. המחשה (Vitruvius 10.2). Never a Divine Name. ── /build 99 ── */
import { GATES92, LINTEL92, hold92 } from './gates92.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/** per lintel (0…2, each heavier): up (share of the way per second at a crew's full pace), ramp (s to full pace), drift (the crews'
 *  difference, a share of the pace), flip (s between the quicker crew changing), slip (rad of tilt the sling holds); the swing along the
 *  stone (amot) and its damping, win (amot off along it that still lands), flat (rad: both ends together), vChip (amot/s at the landing) */
export const LINTEL99 = Object.freeze({
  L: Object.freeze([
    Object.freeze({ up: 0.07, ramp: 0.9, drift: 0.12, flip: 7, slip: 0.16, swing: 0.7, damp: 0.75, win: 0.5, flat: 0.05, vChip: 1.25 }),
    Object.freeze({ up: 0.06, ramp: 1.2, drift: 0.2, flip: 5, slip: 0.14, swing: 1.1, damp: 0.45, win: 0.4, flat: 0.045, vChip: 1.1 }),
    Object.freeze({ up: 0.052, ramp: 1.5, drift: 0.28, flip: 3.5, slip: 0.12, swing: 1.5, damp: 0.3, win: 0.32, flat: 0.04, vChip: 1.0 }),
  ]),
  span: GATES92.lw - 1.2,   // (amot between the two slings)
  top: GATES92.H + GATES92.clear,   // (amot from the ground to the stone's foot at the top)
});

/** a lintel at gate i → { hold(e, on), step(dt), state() }: e 0 = its left end on the screen, 1 its right. The state keeps build 92's
 *  fields (ph, y, th, sx, low, slips, misses, crew, uneven, chip, done, q) so the stone is drawn as before; and per end: h (share of the
 *  way up), hold, holdT, v (its pace), low (amot paid out), down (landed) */
export function createLintel99(i = 0, rnd = Math.random) {
  const P = LINTEL99.L[clamp(i | 0, 0, 2)], C = LINTEL92, T = LINTEL99;
  const E = () => ({ h: 0, hold: false, holdT: 0, v: 0, low: 0, down: false, vIn: 0 });
  const k = { i: clamp(i | 0, 0, 2), ph: 'lift', y: 0, th: 0, sx: 0, sv: 0, low: 0, t: 0, pt: 0, e: [E(), E()], fast: rnd() < 0.5 ? 0 : 1, flipT: 0,
    slips: 0, misses: 0, hard: 0, chip: false, uneven: false, done: false, q: null, crew: false, last: null, holding: false, sw0: (rnd() < 0.5 ? -1 : 1) * P.swing };
  /** a crew's pace: the quicker one by drift, the slower by it */
  const crewK = (e) => 1 + (e === k.fast ? 1 : -1) * P.drift;
  function hold(e, on) { if (k.done || (e !== 0 && e !== 1)) return; const x = k.e[e]; if (!!on !== x.hold) { x.hold = !!on; x.holdT = 0; } k.holding = k.e[0].hold || k.e[1].hold; }
  function tiltOf() { return k.ph === 'over' ? Math.atan2(k.e[0].low - k.e[1].low, T.span) : Math.atan2((k.e[1].h - k.e[0].h) * T.top, T.span); }
  function slipNow() { k.ph = 'slip'; k.pt = 0; k.slips++; k.last = 'slip'; for (const x of k.e) { x.hold = false; x.v = 0; } k.holding = false; }
  function step(dt) { if (k.done || !(dt > 0)) return k; let r = Math.min(dt, 0.5); while (r > 1e-6 && !k.done) { const h = Math.min(0.05, r); step1(h); r -= h; } return k; }
  function step1(dt) {
    k.t += dt; for (const x of k.e) if (x.hold) x.holdT += dt;
    k.flipT += dt; if (k.flipT >= P.flip) { k.flipT = 0; if (rnd() < 0.6) k.fast = 1 - k.fast; }
    if (k.ph === 'lift') {
      k.e.forEach((x, e) => { const want = x.hold ? P.up * crewK(e) * Math.min(1, x.holdT / P.ramp) : 0; x.v += (want - x.v) * Math.min(1, (x.hold ? 3 : 6) * dt); if (x.v < 1e-4 && !x.hold) x.v = 0; x.h = clamp(x.h + x.v * dt, 0, 1); });
      k.y = (k.e[0].h + k.e[1].h) / 2; k.th = tiltOf();
      if (Math.abs(k.th) > P.slip) { slipNow(); return; }
      if (k.e[0].h >= 1 && k.e[1].h >= 1) { k.ph = 'swing'; k.pt = 0; for (const x of k.e) { x.hold = false; x.v = 0; } k.holding = false; k.th = 0; }
      else for (const x of k.e) if (x.h >= 1) { x.h = 1; x.v = 0; }
    } else if (k.ph === 'slip') {
      k.pt += dt; const u = Math.min(1, k.pt / C.slipT), f = 1 - u * u; for (const x of k.e) x.h *= f; k.y = (k.e[0].h + k.e[1].h) / 2; k.th += Math.sign(k.th || 1) * dt * 0.25;
      if (k.pt >= C.slipT) { for (const x of k.e) x.h = 0; k.y = 0; k.th = 0; k.ph = 'lift'; if (k.slips >= C.crewAfter) { k.crew = true; finish(); } }
    } else if (k.ph === 'swing') {
      k.pt += dt; if (k.pt >= C.swingT) { k.ph = 'over'; k.sx = k.sw0; k.sv = 0; k.low = 0; }
    } else if (k.ph === 'over') {
      k.sv += (-C.om * C.om * k.sx - 2 * P.damp * k.sv) * dt; k.sx += k.sv * dt;
      k.e.forEach((x, e) => { if (x.down) { x.v = 0; return; } x.v = x.hold && x.holdT >= C.takeUp * 0.5 ? C.vDown * hold92(x.holdT) * (0.85 + 0.3 * (e === k.fast ? 1 : 0)) : 0; x.low = Math.min(C.lowerAm, x.low + x.v * dt); if (x.low >= C.lowerAm - 1e-9) land(x); });
      k.low = (k.e[0].low + k.e[1].low) / 2; k.th = tiltOf();
      if (!k.done && k.ph === 'over' && Math.abs(k.th) > P.slip) { slipNow(); return; }
      if (k.e[0].down && k.e[1].down) finish();
    }
  }
  /** an end comes down on its jamb: off along the stone it misses (both lifted back a little); the first down with the other still high
   *  is an uneven landing; too fast it chips */
  function land(x) {
    if (Math.abs(k.sx) > P.win) { k.misses++; k.last = 'miss'; for (const y of k.e) { y.low = Math.min(y.low, C.lowerAm * (1 - C.back)); y.hold = false; y.down = false; } k.holding = false; k.sv += -Math.sign(k.sx) * 0.4; return; }
    x.down = true; x.vIn = x.v; x.hold = false; k.holding = k.e[0].hold || k.e[1].hold;
    if (x.v > P.vChip) { k.chip = true; k.last = 'chip'; }
    const other = k.e[0] === x ? k.e[1] : k.e[0];
    if (!other.down && Math.atan2(C.lowerAm - other.low, T.span) > P.flat) { k.uneven = true; k.last = 'first'; }
    else if (!other.down) k.last = 'touch';
  }
  function finish() {
    k.done = true; k.ph = 'set'; for (const x of k.e) x.hold = false; k.holding = false;
    if (k.crew) { k.q = 0; return; }
    k.hard = (k.uneven ? 1 : 0) + (k.chip ? 1 : 0); if (!k.uneven && !k.chip) k.last = 'set';
    const f = k.slips + k.misses + k.hard; k.q = f <= 0 ? 1 : f <= 2 ? 0.5 : 0;
  }
  /** which end wants his hand now (−1: none; for the hint) and which wants letting go */
  function want() {
    if (k.ph === 'lift') { const d = k.e[1].h - k.e[0].h; return k.e[0].h >= 1 ? 1 : k.e[1].h >= 1 ? 0 : Math.abs(d) < 0.02 ? -1 : d > 0 ? 0 : 1; }
    if (k.ph === 'over') { const d = k.e[1].low - k.e[0].low; return k.e[0].down ? 1 : k.e[1].down ? 0 : Math.abs(d) < 0.08 ? -1 : d > 0 ? 0 : 1; }
    return -1;
  }
  return { hold, step, want, state: () => k, P };
}
