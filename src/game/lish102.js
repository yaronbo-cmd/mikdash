/* ── build 102 ── lish102.js — stage 07, הלשכות, rebuilt on build 101's world (the design doc "שלבים 07–10: החלטות לפני בנייה", 4.11; the
 *  owner 5.11 07:41: "אל תחכה. תתקדם"). Three acts, one in each chamber, each done again at a rising level; what a crew can do without a
 *  skill (the benches, the spokes) the crew does where he sees it.
 *  - לשכת הגזית: THE ROPE COMPASS — a worker kneels at the centre holding the peg; the kohen leads the rope's end round it with his finger.
 *    Too near: the rope sags and the line he scratches runs in. Too far: the rope strains, the worker leans and struggles; past it, the peg
 *    is torn out and the worker falls back. The line stays on the floor as drawn; the crew sets the benches on it.
 *  - לשכת הגולה: THE WHEEL AND THE BUCKET — his finger going round the hub turns the wheel (a crank); the water in the bucket sways with every
 *    change of speed and spills over the rim; too fast, the bucket knocks the shaft. At the top he stops it at the lip (the worker drops the
 *    pawl); wound past it the bucket hits the wheel and tips. Then dragged to the trough, the water runs to the court's basin.
 *  - בית המוקד: THE VAULT, RING BY RING — the stones lie on the floor in widths; each dragged to a side is hoisted by the crew onto the
 *    centering. The two sides must end level with the keystone's edges: a gap too wide and the keystone falls through, too narrow and it does
 *    not go in. A side ahead of the other by more than a stone's width tilts the centering and the last stone slides back. Then the wedges
 *    are knocked out, the centering eases down, a hush, a creak — the ring stands.
 * Pure: no THREE, no DOM. har42.js plays it. The rope compass, the pawl, the trough's channel and basin, the centering and the stones' widths:
 * המחשה. Never a Divine Name. */

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const wrap102 = (a) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));

/* ───────── לשכת הגזית: THE ROPE COMPASS ───────── */
/** the four arcs: the judges' half circle (west, with its shadow), then the three rows of disciples before them (east, each a little wider,
 *  no shadow, a narrower pull). R: the rope (amot); win: the pull that keeps it taut without straining, a share of R; thr: [מהודר, כשר] in
 *  roundness percent. bins: the arc's samples; yankT: the strain held this long (s) tears the peg out; yankK: or this many times the window
 *  at once; lean: how far a straining peg leans (a share of win per window over); sag: the finger's smoothing (the rope's weight, 1/s). */
export const ROPE102 = Object.freeze({
  arcs: Object.freeze([
    Object.freeze({ who: 'judges', R: 7, m: Math.PI, win: 0.15, guide: true, thr: Object.freeze([93, 80]), benches: 6 }),
    Object.freeze({ who: 'row1', R: 7, m: 0, win: 0.13, guide: false, thr: Object.freeze([93, 80]), benches: 6 }),
    Object.freeze({ who: 'row2', R: 8.6, m: 0, win: 0.11, guide: false, thr: Object.freeze([94, 82]), benches: 7 }),
    Object.freeze({ who: 'row3', R: 10.2, m: 0, win: 0.095, guide: false, thr: Object.freeze([94, 82]), benches: 8 }),
  ]),
  bins: 72, yankT: 0.7, yankK: 2.2, lean: 0.5, sag: 16, minPx: 13, rmsK: 0.16, fill: 0.94,
});
/** one arc. feed(angle, r, dt) with his finger's place round the peg (rad, amot) while it is down; lift() when it is up; replant() when the
 *  crew has driven the peg again. → events in k.ev: 'slack', 'taut', 'strain', 'yank', 'done' */
export function createRope102(i = 0, o = {}) {
  const A = ROPE102.arcs[clamp(i | 0, 0, ROPE102.arcs.length - 1)], n = ROPE102.bins;
  const win = Math.max(A.win, (ROPE102.minPx / Math.max(1, +o.Rpx || 200)));   // (on a small screen the window is never under minPx)
  const k = { i: clamp(i | 0, 0, 3), R: A.R, m: A.m, win, guide: A.guide, bins: new Array(n).fill(null), drawn: [], rS: null, T: 0, rope: 'slack', strainT: 0, lean: 0,
    yanked: false, yanks: 0, prev: null, done: false, q: null, rnd: 0, ev: [], t: 0 };
  function mark(b, e) { if (k.bins[b] == null) k.bins[b] = e; }
  function feed(angle, r, dt) {
    k.ev = []; if (k.done || k.yanked || !Number.isFinite(angle) || !Number.isFinite(r)) return k;
    dt = clamp(+dt || 0, 0, 0.1); k.t += dt;
    k.rS = k.rS == null ? r : k.rS + (r - k.rS) * Math.min(1, dt * ROPE102.sag);
    const dev = k.rS / k.R - 1, T = Math.max(0, dev) / k.win, was = k.rope;
    k.T = T; k.rope = dev < -0.012 ? 'slack' : T > 1 ? 'strain' : 'taut';
    if (k.rope === 'strain') { k.strainT += dt; k.lean = Math.min(1, k.lean + dt * 1.5 * (T - 1)); } else { k.strainT = Math.max(0, k.strainT - dt * 2); k.lean = Math.max(0, k.lean - dt * 0.8); }
    if (k.rope !== was) k.ev.push(k.rope);
    if (k.strainT > ROPE102.yankT || T > ROPE102.yankK) { k.yanked = true; k.yanks++; k.prev = null; k.strainT = 0; k.ev.push('yank'); return k; }
    // where the scribe is: slack — at his finger (inside the circle); taut — on the rope's length; strained — the peg leaning out after him
    const e = dev < 0 ? Math.max(-0.45, dev) : ROPE102.lean * k.win * k.lean, u = wrap102(angle - k.m);
    k.drawn.push([angle, k.R * (1 + e)]); if (k.drawn.length > 900) k.drawn.splice(0, 300);
    if (Math.abs(u) <= Math.PI / 2 + 0.35) {   // (a little past either end too: a hand that runs off the end in one step still closes it)
      const b = Math.floor(((u + Math.PI / 2) / Math.PI) * n), on = (q) => q >= 0 && q < n;
      if (k.prev && Math.abs(k.prev.b - b) > 1 && Math.abs(k.prev.b - b) < n / 3) { const s = Math.sign(b - k.prev.b); for (let q = k.prev.b + s; q !== b; q += s) if (on(q)) mark(q, k.prev.e + ((e - k.prev.e) * (q - k.prev.b)) / (b - k.prev.b)); }
      if (on(b)) mark(b, e); k.prev = { b, e };
    } else k.prev = null;
    const filled = k.bins.filter((v) => v != null).length;
    if (filled >= Math.ceil(n * ROPE102.fill) && k.bins.slice(0, 3).some((v) => v != null) && k.bins.slice(-3).some((v) => v != null)) finish();   // (stake to stake: a hand set down a hair inside a stake still closes it)
    return k;
  }
  function finish() {
    const v = k.bins.filter((x) => x != null), rms = Math.sqrt(v.reduce((s, x) => s + x * x, 0) / Math.max(1, v.length));
    k.rms = rms; k.rnd = Math.round(100 * clamp(1 - rms / ROPE102.rmsK, 0, 1)); k.done = true;
    k.q = k.yanks === 0 && k.rnd >= A.thr[0] ? 1 : k.yanks <= 1 && k.rnd >= A.thr[1] ? 0.5 : 0; k.ev.push('done');
  }
  const covered = () => k.bins.filter((v) => v != null).length / n;
  function lift() { k.prev = null; k.rS = null; if (k.rope === 'strain') k.rope = 'slack'; k.strainT = 0; }
  function replant() { k.yanked = false; k.lean = 0; k.rS = null; k.prev = null; k.rope = 'slack'; }
  /** the line as drawn, bin by bin, for the benches: the radius at a share u (0 … 1) along the half */
  function radiusAt(u) { const b = clamp(Math.round(u * (n - 1)), 0, n - 1); let e = k.bins[b]; if (e == null) for (let d = 1; d < n && e == null; d++) e = k.bins[b - d] != null ? k.bins[b - d] : k.bins[b + d]; return k.R * (1 + (e || 0)); }
  return { feed, lift, replant, covered, radiusAt, state: () => k, A, angleAt: (u) => k.m - Math.PI / 2 + u * Math.PI };
}
/** the act's grade: the mean of its arcs, the judges' arc counting double (the half circle the court sits on) */
export function ropeQ102(qs) { if (!qs.length) return 0; const w = qs.map((_, j) => (j === 0 ? 2 : 1)), s = qs.reduce((a, q, j) => a + q * w[j], 0) / w.reduce((a, b) => a + b, 0); return s >= 0.92 ? 1 : s >= 0.45 ? 0.5 : 0; }

/* ───────── לשכת הגולה: THE WHEEL AND THE BUCKET ───────── */
/** rd: the axle's drum (amot of rope a radian); k, c: his hand on the hub (a spring and a damper, a heavy wheel); load: the bucket's weight
 *  back on the wheel (rad/s²); mu: the axle's friction; cFree: the drag when he lets go (so it runs back slowly); w0, z: the water's sway
 *  (rad/s, damping); push: how hard a change of speed sways it; spillK: water lost a second per radian over the rim; top: the bucket's
 *  catch band at the lip (amot, its rim against the lip) and how still (amot/s) for how long the worker needs to drop the pawl; hit: wound
 *  past the lip by this much it hits the wheel. The four buckets: each deeper (the pit's water goes down), the rim lower, the speed lower */
export const WHEEL102 = Object.freeze({
  rd: 0.55, k: 42, c: 9, load: 3.2, mu: 2.2, cFree: 1.6, w0: 5.2, z: 0.1, push: 0.9, spillK: 0.9,
  top: Object.freeze({ lo: -0.5, hi: 0.12, still: 0.22, hold: 0.4 }), hit: 0.4,
  buckets: Object.freeze([
    Object.freeze({ depth: 5, rim: 0.5, vmax: 2.3 }), Object.freeze({ depth: 7, rim: 0.43, vmax: 2.0 }),
    Object.freeze({ depth: 9, rim: 0.37, vmax: 1.8 }), Object.freeze({ depth: 11, rim: 0.31, vmax: 1.6 }),
  ]),
});
/** one bucket. grab(phi) / drag(phi) with his finger's angle round the hub on the screen, already signed so that + winds the rope up;
 *  let(); step(dt) → events in k.ev: 'spill', 'knock', 'hit', 'caught', 'bottom'; pour() once caught; then done with W the water left */
export function createWheel102(i = 0, rnd = Math.random) {
  const P = WHEEL102, B = P.buckets[clamp(i | 0, 0, 3)];
  const k = { i: clamp(i | 0, 0, 3), depth: B.depth, rim: B.rim, vmax: B.vmax, th: 0, w: 0, h: -B.depth, s: 0, sv: 0, W: 1, held: false, tt: 0, phi: 0,
    ph: 'up', stillT: 0, spills: 0, spilling: false, knocks: 0, hits: 0, kT: 0, ev: [], done: false, q: null, t: 0, wPrev: 0 };
  function grab(phi) { if (k.ph !== 'up' || !Number.isFinite(phi)) return false; k.held = true; k.phi = phi; k.tt = k.th; return true; }
  function drag(phi) { if (!k.held || !Number.isFinite(phi)) return; const d = wrap102(phi - k.phi); k.phi = phi; k.tt += d; k.tt = clamp(k.tt, k.th - 1.2, k.th + 1.2); }
  function let_() { k.held = false; }
  function step(dt) {
    k.ev = []; if (k.done || !(dt > 0)) return k;
    let r = Math.min(dt, 0.25); while (r > 1e-6) { const h = Math.min(0.01, r); r -= h; step1(h); }
    return k;
  }
  function step1(h) {
    k.t += h; k.kT = Math.max(0, k.kT - h);
    if (k.ph === 'up') {
      let a = (k.held ? P.k * (k.tt - k.th) - P.c * k.w : -P.cFree * k.w) - P.load;
      const fr = P.mu; if (Math.abs(k.w) < 1e-3 && Math.abs(a) <= fr) a = -k.w / h; else a -= Math.sign(k.w || a) * fr;
      k.w += a * h; k.th += k.w * h;
      if (k.th < 0) { if (k.w < -0.5) k.ev.push('bottom'); k.th = 0; k.w = Math.max(0, k.w); if (k.held) k.tt = Math.max(k.tt, 0); }
      k.h = -k.depth + P.rd * k.th;
      const v = P.rd * k.w, acc = (P.rd * (k.w - k.wPrev)) / h; k.wPrev = k.w;
      // the water sways with every change of speed; too fast, the bucket swings and knocks the shaft's side
      let f = acc * P.push;
      if (Math.abs(v) > k.vmax) { if (k.kT <= 0) { k.knocks++; k.kT = 0.45; k.ev.push('knock'); k.sv += (rnd() < 0.5 ? -1 : 1) * (2.0 + (Math.abs(v) - k.vmax) * 3); } }
      k.sv += (-P.w0 * P.w0 * k.s - 2 * P.z * P.w0 * k.sv - f) * h; k.s += k.sv * h;
      const over = Math.abs(k.s) - k.rim, was = k.spilling; k.spilling = over > 0 && k.W > 0.01;
      if (k.spilling) { k.W = Math.max(0, k.W - over * P.spillK * h * 3); if (!was) { k.spills++; k.ev.push('spill'); } }
      if (k.h > P.hit) { k.hits++; k.ev.push('hit'); k.W *= 0.35; k.s = 0; k.sv = 0; k.th = (P.hit - 0.9 + k.depth) / P.rd; k.w = -0.6; k.tt = k.th; k.held = false; k.h = -k.depth + P.rd * k.th; }
      const inBand = k.h >= P.top.lo && k.h <= P.top.hi && Math.abs(v) <= P.top.still;
      k.stillT = inBand ? k.stillT + h : 0;
      if (k.stillT >= P.top.hold) { k.ph = 'caught'; k.w = 0; k.held = false; k.ev.push('caught'); }
    } else { k.sv += (-P.w0 * P.w0 * k.s - 2 * P.z * P.w0 * 2.5 * k.sv) * h; k.s += k.sv * h; }
  }
  function pour() { if (k.ph !== 'caught') return false; k.ph = 'pour'; return true; }
  function poured() { if (k.ph !== 'pour') return null; k.ph = 'done'; k.done = true; k.q = k.W >= 0.9 && !k.hits ? 1 : k.W >= 0.6 ? 0.5 : 0; return k.q; }
  return { grab, drag, let: let_, step, pour, poured, state: () => k, B, P };
}
/** the act's grade: the mean of its buckets; and the basin's fill (a share of what four full buckets bring) */
export const wheelQ102 = (qs) => { if (!qs.length) return 0; const s = qs.reduce((a, b) => a + b, 0) / qs.length; return s >= 0.88 ? 1 : s >= 0.45 ? 0.5 : 0; };

/* ───────── בית המוקד: THE VAULT, RING BY RING ───────── */
/** total: the half ring in units along the arch (the vault's 10.6 amot radius: a unit 1.39 amot); key: the keystone's width; pile: the
 *  widths on the floor and how many; tilt: one side ahead by more than this tilts the centering; guide: the keystone's place shown in shadow (tilt: the ring's widest stone — a side may lead by one stone, not more);
 *  wedges: under the centering's posts. Ring 1: two widths; 2: three; 3: four, the heaviest — and no shadow after the first */
export const RING102 = Object.freeze({
  wedges: 4,
  rings: Object.freeze([
    Object.freeze({ total: 24, key: 2, pile: Object.freeze({ 3: 4, 4: 4 }), tilt: 4, guide: true }),
    Object.freeze({ total: 24, key: 4, pile: Object.freeze({ 2: 4, 3: 4, 4: 3 }), tilt: 4, guide: false }),
    Object.freeze({ total: 24, key: 2, pile: Object.freeze({ 2: 3, 3: 4, 4: 3, 5: 2 }), tilt: 5, guide: false }),
  ]),
});
/** one ring. place('L'|'R', w) → 'ok' | 'tilt' (it slides back) | 'over' (it would pass the crown; not set) | 'none'; back(side) → the last
 *  stone of that side down again; key() → 'seat' | 'falls' (too wide a gap) | 'tight'; strike() → 'out' | 'eased'; settle() → the ring stands */
export function createRing102(i = 0) {
  const G = RING102.rings[clamp(i | 0, 0, 2)], S = (G.total - G.key) / 2;
  const k = { i: clamp(i | 0, 0, 2), total: G.total, keyW: G.key, side: S, pile: { ...G.pile }, L: [], R: [], tilts: 0, overs: 0, backs: 0, keyFails: 0, ph: 'set', out: 0, done: false, q: null, last: null };
  const sum = (a) => a.reduce((x, y) => x + y, 0);
  const sums = () => ({ L: sum(k.L), R: sum(k.R) });
  function place(side, w) {
    if (k.ph !== 'set') return 'none'; w = +w; if (!(k.pile[w] > 0) || (side !== 'L' && side !== 'R')) return 'none';
    const arr = side === 'L' ? k.L : k.R, other = side === 'L' ? k.R : k.L;
    if (sum(arr) + w > S + G.key / 2) { k.overs++; k.last = 'over'; return 'over'; }
    if (sum(arr) + w - sum(other) > G.tilt) { k.tilts++; k.last = 'tilt'; return 'tilt'; }
    k.pile[w]--; arr.push(w); k.last = 'ok'; return 'ok';
  }
  function back(side) { if (k.ph !== 'set') return null; const arr = side === 'L' ? k.L : k.R; if (!arr.length) return null; const w = arr.pop(); k.pile[w] = (k.pile[w] | 0) + 1; k.backs++; return w; }
  function key() {
    if (k.ph !== 'set') return 'none'; const s = sums();
    if (s.L === S && s.R === S) { k.ph = 'strike'; return 'seat'; }
    k.keyFails++; return s.L <= S && s.R <= S ? 'falls' : 'tight';
  }
  function strike() { if (k.ph !== 'strike') return 'none'; k.out++; if (k.out < RING102.wedges) return 'out'; k.ph = 'eased'; return 'eased'; }
  function settle() { if (k.ph !== 'eased') return null; k.ph = 'held'; k.done = true; const f = k.tilts + k.overs + k.backs + k.keyFails; k.q = f === 0 ? 1 : f <= 2 ? 0.5 : 0; k.faults = f; return k.q; }
  /** a stone's place on the arch: from the springing (0) to the crown (total/2), its middle, in units (the left side's from the left) */
  function at(side, j) { const arr = side === 'L' ? k.L : k.R; let a = 0; for (let q = 0; q < j; q++) a += arr[q]; return a + arr[j] / 2; }
  return { place, back, key, strike, settle, sums, at, state: () => k, G, S };
}
export const ringQ102 = (qs) => { if (!qs.length) return 0; const s = qs.reduce((a, b) => a + b, 0) / qs.length; return s >= 0.88 ? 1 : s >= 0.45 ? 0.5 : 0; };

/* ───────── the stage ───────── */
/** stage 07's parts in the building loop: the three chambers, any order */
export const PARTS102 = Object.freeze(['open', 'compass', 'wheel', 'dome', 'reveal']);
export const DEP102 = Object.freeze({ compass: Object.freeze([]), wheel: Object.freeze([]), dome: Object.freeze([]) });
/** the lines (one short instruction; after " · " the source) */
export const L102 = Object.freeze({
  rope: 'הובילו את קצה החבל סביב היתד — מתוח, לא רפוי ולא חזק מדי · "כחצי גורן עגולה, כדי שיהו רואין זה את זה" — סנהדרין ד, ג · טיוטה',
  rows: 'שורה של תלמידי חכמים — "ושלש שורות של תלמידי חכמים יושבין לפניהם" — סנהדרין ד, ד · טיוטה',
  slack: 'החבל רפוי — הקו בורח פנימה. התרחקו מעט · המחשה',
  strain: 'מתוח מדי — הפועל בקושי מחזיק את היתד! · המחשה',
  yank: 'היתד נעקרה — הפועל נוטע אותה שוב · המחשה',
  benches: 'הפועלים מניחים ספסלים על הקו שחרטתם · המחשה',
  sages: 'החכמים יושבים — "כל אחד ואחד מכיר את מקומו" — סנהדרין ד, ד · טיוטה',
  wheel: 'סובבו את האצבע סביב הציר — הגלגל מעלה את הדלי · "שם היה בור, והגלגל נתון עליו" — מדות ה, ד · טיוטה',
  spill: 'המים נשפכים! סובבו חלק ושווה · המחשה',
  knock: 'מהר מדי — הדלי נחבט בדופן הבור · המחשה',
  top: 'עצרו את הדלי בשפת הבור — הפועל נועל את הגלגל · המחשה',
  hit: 'הדלי נתקע בגלגל ונשפך — עצרו מוקדם יותר · המחשה',
  caught: 'גררו את הדלי אל השוקת · המחשה',
  pour: '"ומשם מספקים מים לכל העזרה" — מדות ה, ד · טיוטה',
  vault: 'גררו אבן אל צד הקשת — הפועלים מעלים אותה בגלגלת · "בית המוקד כפה" — מדות א, ח · טיוטה',
  vault2: 'הצדדים צריכים להיפגש בדיוק בשולי אבן הראשה · המחשה',
  tilt: 'צד אחד הקדים — התבנית חורקת והאבן מחליקה חזרה · המחשה',
  over: 'האבן עוברת את אמצע הקשת — בחרו צרה יותר · המחשה',
  key: 'עכשיו אבן הראשה — גררו אותה למעלה · המחשה',
  falls: 'הרווח רחב מדי — אבן הראשה נופלת! הורידו אבן והחליפו · המחשה',
  tight: 'הרווח צר מדי — אבן הראשה לא נכנסת · המחשה',
  back: 'האבן ירדה בחזרה לערימה · המחשה',
  strike: 'הקישו על הטריזים — התבנית יורדת · המחשה',
  holds: 'הקשת עומדת · המחשה',
  sleep: '"וזקני בית אב ישנים שם, ומפתחות העזרה בידם" — מדות א, ח · טיוטה',
});
export const SRC102 = Object.freeze([
  'לשכת הגזית — שם היתה סנהדרי גדולה של ישראל יושבת — מדות ה, ד; "כחצי גורן עגולה, כדי שיהו רואין זה את זה" — סנהדרין ד, ג; "ושלש שורות של תלמידי חכמים יושבין לפניהם" — סנהדרין ד, ד · טיוטה',
  'לשכת הגולה — "שם היה בור, והגלגל נתון עליו, ומשם מספקים מים לכל העזרה" — מדות ה, ד · טיוטה',
  'בית המוקד — "כפה, ובית גדול היה, מקף רובדין של אבן, וזקני בית אב ישנים שם, ומפתחות העזרה בידם" — מדות א, ח · טיוטה',
  'המחוגה בחבל, הנעילה של הגלגל, השוקת והבריכה, התבנית ורוחבי האבנים — המחשה',
]);
