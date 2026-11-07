/* ── build 104 ── lish104.js — stage 09, הסובב וחוט הסיקרא, rebuilt on build 101's world (the spec doc "איפיון בנייה 104", 5.11; the owner
 *  5.11 16:01: "לפני כל בנייה אתה עושה איפיון ודיוק משימות"). Two deep acts, each done again at a rising level:
 *  - THE CORNER BY THE PLUMB ("עלה חמש"): the crews raise the altar's body course by course on the yesod; the north-east corner is his.
 *    Each of his corner stones comes down on the shear-legs (held: the longer, the faster — too fast it lands hard), then is trued to the
 *    plumb line: an unhewn stone, so first turned until its two faces run along the lines, then pushed — heavy, it sticks and then jumps
 *    (a gentle push: a finger's step; a shove: past the line). The bob swings at every jump and in the wind: while it swings the line
 *    cannot be read; a light touch steadies it. True and still: the master says "אמת". At the top: "וכנס אמה" — the peg one amah in.
 *  - THE RED LINE ("חוט של סיקרא חוגרו באמצע"): a cord dusted red, round the altar side by side at its middle. On the first side its
 *    start is set on the marked reed at five amot; on each side the far end is raised or lowered until the level hung on the cord is
 *    still at its notch, and the cord is pulled out and let go — it snaps a red line (too little: faint, again; too much or askew: a
 *    smear, washed off). Each side starts where the last ended, so an error carries round; on the fourth side the line must close on
 *    its own start.
 * Pure: no THREE, no DOM. har42.js plays it. The shear-legs, the stick of the stone, the bob's swing, the level on the cord, the red dust,
 * the washing: המחשה. Never a Divine Name. */

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
/** the altar's body from the yesod to the sovev (world, temple.js / stages.js 'sovev'): 30 × 30, x −53…−23, z −18.5…11.5, from y 17 to 22 */
export const BODY104 = Object.freeze({ x0: -53, x1: -23, z0: -18.5, z1: 11.5, y0: 17, floor: 16, courses: 5, top: 22 });
export const TEFACH = 1 / 6;

/* ───────── THE CORNER BY THE PLUMB ───────── */
export const CORNER104 = Object.freeze({
  /** his stones: on these courses (1…5); the crews lay the others' corners */
  courses: Object.freeze([1, 3, 4, 5]),
  /** the stone's size along each face (amot), its height one course */
  w: 1.7, d: 1.5,
  /** how far in from the line a face may stand and still be true (amot), and how square (rad) — per level 1…4 */
  tol: Object.freeze([null, 0.1, 0.08, 0.065, 0.05]),
  rotTol: Object.freeze([null, 0.08, 0.06, 0.05, 0.04]),
  /** the stone as it lands: turned off square (rad) and set out or in (amot), per level */
  rot0: Object.freeze([null, 0.05, 0.22, 0.26, 0.3]), off0: Object.freeze([null, 0.35, 0.45, 0.5, 0.55]),
  /** the outline's roughness (amot), per level */
  rough: Object.freeze([null, 0.03, 0.08, 0.1, 0.12]),
  /** the stick: a push builds up to fs (amot of finger on the stone's top) before it moves; then it jumps (the pull past fs) × gain */
  fs: Object.freeze([null, 0.1, 0.12, 0.13, 0.14]), gain: 0.5, step: 0.03,
  /** the turn: the same, in radians of the finger round the stone's middle */
  fr: 0.06, rgain: 0.5, rstep: 0.012,
  /** past the line by more than this: a crossing (a fault, once each time) */
  over: 0.02,
  /** the hoist: the stone starts this high; held, the speed rises (amot/s per s) to vmax; landing faster than vLand is hard */
  h0: 2.6, acc: 0.9, v0: 0.35, vmax: 1.8, vLand: 1.0, back: 0.9,
  /** the plumb bob: its swing's frequency (rad/s), its damping (1/s), how a jump kicks it, how still it must be to read, the wind */
  om: 2.1, damp: 0.16, kick: 2.2, calm: 0.03, wind: Object.freeze([null, 0, 0, 0.05, 0.065]), windEvery: 4.5,
  /** a tap on the bob keeps this much of its swing; a drag across it adds */
  steady: 0.25,
  /** true and still this long: "אמת" */
  holdT: 1.0,
  /** וכנס אמה: the peg one amah in from the edge, within a tefach */
  reed: 1, reedTol: TEFACH,
});

/** the stone's outline in its own frame: the true corner at (0,0), the faces along −u (the north face, v = 0) and −v (the east face, u = 0);
 *  rough points between, all inside the square's corner. u: east (out of the east face), v: north (out of the north face) */
export function outline104(L = 1, rnd = Math.random) {
  const C = CORNER104, r = C.rough[clamp(L | 0, 1, 4)], w = C.w, d = C.d, P = [[0, 0]];
  const n = 4;
  for (let q = 1; q <= n; q++) P.push([-(w * q) / (n + 1), -rnd() * r]);   // the north face, a little in here and there
  P.push([-w, -rnd() * r * 0.5]); P.push([-w + rnd() * r, -d * 0.55]); P.push([-w * 0.6, -d + rnd() * r]); P.push([-rnd() * r * 0.5, -d]);
  for (let q = n; q >= 1; q--) P.push([-rnd() * r, -(d * q) / (n + 1)]);   // the east face, from the back to the corner
  return P;
}

/** one of his corner stones. i: 0…3 (its level = i + 1). → lower(held, dt) while the hoist runs; push(du, dv) the finger on its top;
 *  twist(da) the finger round its middle; tapBob(); swingBob(dx, dz); step(dt) every frame; state() */
export function createCorner104(i = 0, rnd = Math.random) {
  const C = CORNER104, L = clamp((i | 0) + 1, 1, 4), course = C.courses[clamp(i | 0, 0, 3)];
  const sgn = () => (rnd() < 0.5 ? -1 : 1);
  const k = { i, L, course, ph: 'hang', h: C.h0, v: 0, held: false, hard: 0, crosses: 0, jumps: 0, shoves: 0,
    rot: sgn() * C.rot0[L] * (0.7 + 0.3 * rnd()), u: C.off0[L] * (0.4 + 0.6 * rnd()) * sgn(), v2: C.off0[L] * (0.4 + 0.6 * rnd()) * sgn(),
    acc: [0, 0], racc: 0, bob: [0, 0], bv: [0, 0], wind: 0, still: 0, tru: false, crossing: false, ev: [], q: null, done: false };
  const P = outline104(L, rnd);
  /** the outline as it lies now: turned by rot round the stone's middle and moved by (u, v) */
  const mid = [-C.w / 2, -C.d / 2];
  function pts() { const c = Math.cos(k.rot), s = Math.sin(k.rot); return P.map(([a, b]) => { const x = a - mid[0], y = b - mid[1]; return [mid[0] + x * c - y * s + k.u, mid[1] + x * s + y * c + k.v2]; }); }
  /** how far the stone stands out past each line (amot): + past it, − in from it */
  function ext() { const p = pts(); let eu = -Infinity, ev = -Infinity; for (const [a, b] of p) { if (a > eu) eu = a; if (b > ev) ev = b; } return { u: eu, v: ev }; }
  const amp = () => Math.hypot(k.bob[0], k.bob[1]) + Math.hypot(k.bv[0], k.bv[1]) / C.om;   // (the swing's reach: where it is and how fast it goes)
  const readable = () => amp() <= C.calm;
  function check(count = true) {
    const e = ext(), cross = e.u > C.over || e.v > C.over;
    if (cross && !k.crossing && count) { k.crosses++; k.ev.push('cross'); }
    k.crossing = cross;
    k.tru = !cross && e.u >= -C.tol[L] && e.v >= -C.tol[L] && Math.abs(k.rot) <= C.rotTol[L];
    return e;
  }
  function kick(m) { const a = Math.random() * Math.PI * 2; k.bv[0] += Math.cos(a) * m * C.kick; k.bv[1] += Math.sin(a) * m * C.kick; }
  /** the hoist: held, the stone comes down faster and faster; let go, it stops. → 'down' | 'landed' | 'hard' */
  function lower(held, dt) {
    if (k.ph !== 'hang') return k.ph;
    k.held = !!held;
    if (!held) { k.v = 0; return 'hang'; }
    k.v = Math.min(C.vmax, (k.v || C.v0) + C.acc * dt); k.h -= k.v * dt;
    if (k.h <= 0) {
      k.h = 0;
      if (k.v > C.vLand) { k.hard++; k.ev.push('hard'); k.h = C.back; k.v = 0; kick(0.05); return 'hard'; }
      k.ph = 'set'; k.v = 0; kick(0.02); check(false); return 'landed';   // (as it lands: not his crossing yet)
    }
    return 'down';
  }
  /** a push of the finger on the stone's top (amot, in u/v): it sticks, then jumps. → 'stick' | 'jump' | 'shove' */
  function push(du, dv) {
    if (k.ph !== 'set') return 'no';
    k.acc[0] += du; k.acc[1] += dv; const m = Math.hypot(k.acc[0], k.acc[1]), fs = C.fs[L];
    if (m < fs) return 'stick';
    const j = C.step + (m - fs) * C.gain, ux = k.acc[0] / m, uy = k.acc[1] / m;
    k.u = clamp(k.u + ux * j, -1.2, 1.2); k.v2 = clamp(k.v2 + uy * j, -1.2, 1.2); k.acc = [0, 0]; k.jumps++;
    const shove = j > 0.12; if (shove) { k.shoves++; k.ev.push('shove'); }
    kick(j * 0.35); check(); return shove ? 'shove' : 'jump';
  }
  /** the finger round the stone's middle (rad): the same stick */
  function twist(da) {
    if (k.ph !== 'set') return 'no';
    k.racc += da; const m = Math.abs(k.racc);
    if (m < C.fr) return 'stick';
    const j = (C.rstep + (m - C.fr) * C.rgain) * Math.sign(k.racc); k.rot = clamp(k.rot + j, -0.6, 0.6); k.racc = 0; k.jumps++;
    kick(Math.abs(j) * 0.25); check(); return 'turn';
  }
  function tapBob() { k.bob[0] *= C.steady; k.bob[1] *= C.steady; k.bv[0] *= C.steady; k.bv[1] *= C.steady; }
  function swingBob(dx, dz) { k.bv[0] += dx; k.bv[1] += dz; }
  /** every frame: the bob swings and settles, the wind; true and still long enough → 'true' */
  function step(dt) {
    const om = C.om, dm = C.damp, n = Math.max(1, Math.ceil(dt / 0.02)), h = dt / n;   // (small steps: a slow frame never blows the swing up)
    for (let q = 0; q < n; q++) for (let a = 0; a < 2; a++) { k.bv[a] += (-om * om * k.bob[a] - dm * k.bv[a]) * h; k.bob[a] += k.bv[a] * h; }
    const wd = C.wind[L]; if (wd > 0) { k.wind += dt; if (k.wind > C.windEvery) { k.wind = 0; kick(wd); } }
    if (k.ph !== 'set') return k.ph;
    if (k.tru && readable()) { k.still += dt; if (k.still >= C.holdT) { k.ph = 'true'; k.done = true; const f = k.hard + k.crosses + k.shoves; k.q = f === 0 ? 1 : f <= 2 ? 0.5 : 0; k.ev.push('true'); return 'true'; } }
    else k.still = 0;
    return 'set';
  }
  /** the test's hand: what a careful mason does next → { kind: 'turn', da } | { kind: 'push', du, dv } | { kind: 'wait' } | { kind: 'tap' } */
  function hint() {
    if (k.ph === 'hang') return { kind: 'lower', hold: k.h > 0.7 || k.v < 0.55 };
    if (k.ph !== 'set') return null;
    if (amp() > C.calm * 1.6) return { kind: 'tap' };
    if (Math.abs(k.rot) > C.rotTol[L] * 0.6) return { kind: 'turn', da: -Math.sign(k.rot) * (C.fr + 0.002) };
    const e = ext(), t = -C.tol[L] / 2, du = e.u > 0 || e.u < -C.tol[L] ? t - e.u : 0, dv = e.v > 0 || e.v < -C.tol[L] ? t - e.v : 0;
    if (du || dv) { const m = Math.hypot(du, dv), want = Math.min(m, 0.1), f = C.fs[L] + Math.max(0, want - C.step) / C.gain; return { kind: 'push', du: (du / m) * f, dv: (dv / m) * f }; }
    return { kind: 'wait' };
  }
  return { lower, push, twist, tapBob, swingBob, step, hint, pts, ext, readable, amp, mid, state: () => k, result: () => (k.done ? { q: k.q } : null) };
}
/** the act's grade: the mean of his stones' */
export const cornerQ104 = (qs) => (qs.length ? qs.reduce((a, b) => a + b, 0) / qs.length : 0);
/** וכנס אמה: the peg let go at r amot in from the edge → 'ok' | 'short' | 'long' */
export const reed104 = (r) => (Math.abs(r - CORNER104.reed) <= CORNER104.reedTol ? 'ok' : r < CORNER104.reed ? 'short' : 'long');

/* ───────── THE RED LINE ───────── */
/** the four sides, round from the north-east corner: east, south, west, north (each from corner a to corner b); the middle five amot above
 *  the court's floor (the altar ten high — מדות ג, א: "חוגרו באמצע") */
export const SIKRA104 = Object.freeze({
  sides: Object.freeze([
    Object.freeze({ id: 'east', he: 'המזרח', a: Object.freeze([-23, -18.5]), b: Object.freeze([-23, 11.5]), n: Object.freeze([1, 0]) }),
    Object.freeze({ id: 'south', he: 'הדרום', a: Object.freeze([-23, 11.5]), b: Object.freeze([-53, 11.5]), n: Object.freeze([0, 1]) }),
    Object.freeze({ id: 'west', he: 'המערב', a: Object.freeze([-53, 11.5]), b: Object.freeze([-53, -18.5]), n: Object.freeze([-1, 0]) }),
    Object.freeze({ id: 'north', he: 'הצפון', a: Object.freeze([-53, -18.5]), b: Object.freeze([-23, -18.5]), n: Object.freeze([0, -1]) }),
  ]),
  mid: 5, len: 30, hMin: 3, hMax: 7,
  /** the level on the cord: its bob's lean per amah of rise over the side (×), its frequency and damping, the notch's half-width */
  K: 1.6, om: 2.4, damp: 0.9, notch: Object.freeze([null, 0.12, 0.09, 0.075, 0.06]), wind: Object.freeze([null, 0, 0, 0.14, 0.1]), windEvery: 3.2,
  /** the snap: the pull out (amot) within [pMin, pMax[L]]; askew (along ÷ out) under this */
  pMin: 0.25, pMax: Object.freeze([null, 0.95, 0.85, 0.75, 0.65]), skew: 0.45,
  /** the grade of a side: both its ends within this of the middle (tefachim): מהודר, כשר */
  hi: 0.5, ok: 1.5,
});
/** the line round the altar. → setStart(h) (the first side only), setEnd(h), level() its bob now, snap(pull, along), step(dt), state() */
export function createSikra104() {
  const S = SIKRA104;
  const k = { side: 0, L: 1, step: 'start', y0: S.mid - 0.9, yA: S.mid - 0.9, yB: S.mid - 0.6, bob: 0, bv: 0, wind: 0, washes: 0, faint: 0,
    sides: [], done: false, q: null, closure: null, ev: [] };
  const Lof = (i) => clamp(i + 1, 1, 4);
  const slopeLean = () => clamp((k.yB - k.yA) * S.K, -1, 1);   // (the cord's rise over the side, leaned at the level)
  function setStart(h) { if (k.step !== 'start') return 'no'; k.yA = k.y0 = clamp(h, S.hMin, S.hMax); return 'ok'; }
  function releaseStart() { if (k.step !== 'start') return 'no'; k.step = 'end'; return 'next'; }
  function setEnd(h) { if (k.step !== 'end' && k.step !== 'snap') return 'no'; k.yB = clamp(h, S.hMin, S.hMax); k.step = 'end'; return 'ok'; }
  function releaseEnd() { if (k.step !== 'end') return 'no'; k.step = 'snap'; return 'snap'; }
  /** the bob's lean now (−1…1), and whether it is still at the notch */
  const level = () => k.bob;
  const atNotch = () => Math.abs(k.bob) <= S.notch[k.L] && Math.abs(k.bv) < 0.25;
  /** the snap: pull (amot out from the face), along (amot along it) → 'faint' | 'smear' | 'askew' | 'line' (then the next side, or 'closed') */
  function snap(pull, along = 0) {
    if (k.step !== 'snap') return 'no';
    if (pull < S.pMin) { k.faint++; k.ev.push('faint'); return 'faint'; }
    if (pull > S.pMax[k.L]) { k.washes++; k.ev.push('smear'); return 'smear'; }
    if (Math.abs(along) > S.skew * pull) { k.washes++; k.ev.push('askew'); return 'askew'; }
    const eA = Math.abs(k.yA - S.mid) / TEFACH, eB = Math.abs(k.yB - S.mid) / TEFACH, err = Math.max(eA, eB);
    const washed = k.sides.length ? k.washes - k.sides.reduce((a, s) => a + s.washes, 0) : k.washes;
    const last = k.side === S.sides.length - 1, step = last ? Math.abs(k.yB - k.y0) / TEFACH : 0;
    const e2 = Math.max(err, step), q = e2 <= S.hi && !washed ? 1 : e2 <= S.ok ? 0.5 : 0;
    k.sides.push({ id: S.sides[k.side].id, yA: k.yA, yB: k.yB, err, step, washes: washed, q });
    k.ev.push('line');
    if (last) { k.done = true; k.closure = step; k.q = k.sides.reduce((a, s) => a + s.q, 0) / k.sides.length; k.step = 'done'; return 'closed'; }
    k.side++; k.L = Lof(k.side); k.yA = k.yB; k.yB = k.yA + (Math.random() < 0.5 ? -1 : 1) * (0.25 + Math.random() * 0.25); k.bob = slopeLean(); k.bv = 0; k.step = 'end';
    return 'line';
  }
  function step(dt) {
    const tgt = slopeLean(), om = S.om, n = Math.max(1, Math.ceil(dt / 0.02)), h = dt / n;
    for (let q = 0; q < n; q++) { k.bv += (-om * om * (k.bob - tgt) - S.damp * k.bv) * h; k.bob += k.bv * h; }
    const wd = S.wind[k.L]; if (wd > 0 && k.step !== 'done') { k.wind += dt; if (k.wind > S.windEvery) { k.wind = 0; k.bv += (Math.random() < 0.5 ? -1 : 1) * wd * om; } }
    k.bob = clamp(k.bob, -1.4, 1.4);
  }
  /** the test's hand: the end's height that levels the cord (on the last side: the line's own start) */
  const hintEnd = (closeOnStart = true) => (k.side === S.sides.length - 1 && closeOnStart ? k.y0 : k.yA);
  return { setStart, releaseStart, setEnd, releaseEnd, level, atNotch, snap, step, hintEnd, state: () => k, side: () => S.sides[k.side] };
}

/* ───────── THE STAGE ───────── */
export const PARTS104 = Object.freeze(['open', 'plumb', 'sikra', 'reveal']);
export const DEP104 = Object.freeze({ plumb: [], sikra: ['plumb'] });
export const L104 = Object.freeze({
  plumb: '"עלה חמש וכנס אמה, זה הסובב" — הפינה שלכם: כל אבן שלה ישרה לפי האנך · מדות ג, א · טיוטה',
  hang: 'החזיקו את האבן — היא יורדת, ככל שמחזיקים מהר יותר · לאט לפני הנדבך · המחשה',
  hard: 'נחתה חזק מדי! הפועלים מרימים אותה שוב · המחשה',
  turn: 'האבן לא מסותתת — גררו את הקצה האחורי שלה כדי לסובב, עד שהפנים שלה הולכות לאורך הקווים · המחשה',
  push: 'דחפו את האבן בעדינות אל החוט — היא כבדה: נתקעת, ואז קופצת · המחשה',
  shove: 'חזק מדי — האבן קפצה רחוק · המחשה',
  cross: 'האבן בולטת מעבר לקו · המחשה',
  swing: 'המשקולת מתנדנדת — אי אפשר לקרוא את הקו. נגיעה קלה במשקולת מרגיעה אותה · המחשה',
  wind: 'רוח! המשקולת שוב זזה · המחשה',
  true: '"אמת" — הפינה ישרה · המחשה',
  crews: 'הפועלים מניחים את הנדבך · המחשה',
  reed: '"וכנס אמה" — גררו את היתד פנימה לאורך הקנה, אמה אחת מן השפה · מדות ג, א · טיוטה',
  reedShort: 'פחות מאמה · המחשה', reedLong: 'יותר מאמה · המחשה',
  sovev: '"עלה חמש וכנס אמה, זה הסובב" — מדות ג, א · טיוטה',
  sikra: '"וחוט של סיקרא חוגרו באמצע" — קו אדום אחד סביב כל המזבח · מדות ג, א · טיוטה',
  start: 'גררו את קצה החוט על הקנה — לאמצע המזבח, חמש אמות מהרצפה · המחשה',
  end: 'הרימו או הורידו את הקצה השני, עד שהמשקולת של הפלס עומדת בחריץ · המחשה',
  wait: 'חכו — המשקולת עוד זזה · המחשה',
  snap: 'משכו את החוט החוצה ושחררו — הוא מצליף ומשאיר קו · המחשה',
  faint: 'חלש מדי — משכו עוד קצת · המחשה',
  smear: 'חזק מדי — הקצוות זזו והקו נמרח. שוטפים ומצליפים שוב · המחשה',
  askew: 'משכתם באלכסון — הקו התעקם. שוטפים ומצליפים שוב · המחשה',
  next: 'הצד הבא מתחיל איפה שהקו נגמר · המחשה',
  last: 'הצד האחרון — הקו צריך לפגוש את ההתחלה שלו · המחשה',
  closed: '"להבדיל בין דמים העליונים לדמים התחתונים" — מדות ג, א · טיוטה',
  step: 'הקו לא נפגש — יש מדרגה בפינה · המחשה',
});
export const SRC104 = Object.freeze([
  'הסובב — "עלה חמש וכנס אמה, זה הסובב" — מדות ג, א · טיוטה',
  'חוט הסיקרא — "וחוט של סיקרא חוגרו באמצע, להבדיל בין דמים העליונים לדמים התחתונים" — מדות ג, א; זבחים נג ע"א · טיוטה',
  'האנך, החמור (מנוף העץ), היתד והקנה, הפלס התלוי על החוט, אבקת הסיקרא, וההצלפה — המחשה',
]);
