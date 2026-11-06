// ── build 106 ── stage 07's vault of בית המוקד, rebuilt (the owner 6.11 08:57: the pile cut off and only its top stone to be had, straight
// stones on a round arch, 7 stones and a keystone, figures doing nothing, no machine and no animals, an arch with no house round it, a
// stone once set that could not be moved — "תחשוב הארד פאן"). The spec: the Claude Doc "איפיון בנייה 106 — כיפת בית המוקד (שלב 07)".
// Two skills at once: the sum of widths (the owner 6.11 09:21: "לא לבטל את משחק החשבון") — stones of 1–3 units, each side's arc to be
// closed exactly — and the hand: the stone hanging from the crane brought over its place, turned by the tag lines to the joint's angle,
// steadied, let down slowly; any stone of his lifted again; the keystone chosen to the gap's measure (no chisel in the courts — "ומקבות
// והגרזן כל כלי ברזל לא נשמע בבית בהבנתו", מלכים א ו, ז: the keystones come dressed, he picks the one); the wedges struck side by side. Pure: no
// three.js, no DOM.
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** the ring: 17 voussoirs' arc over the half circle — the crews lay the lower ones, two units each; his: how many of each side's top standard
 *  places are his — his arc a side is his×2 units, filled with stones of 1, 2 or 3 units (the owner, 6.11 09:21: "להכניס גם חידת חשבון של
 *  רוחבים. בהחלט." — the widths' sum stays the puzzle, the hand on the crane is added to it); extra: stones in the row that are no part of
 *  the answer; cracked: stones with a hairline crack; swing: the hanging stone swings when moved; wind: gusts (ring 3); glow: the joint lights
 *  when the stone is true (ring 1); vMax: the fastest touch that does not chip (amot/s); tolT: the joint's angle (rad); tolS: the swing
 *  (amot) at the touch; keys: the keystones on the bench, each its width less the gap's (finger-widths; one of them 0); marks: the reed's
 *  numbers and the stones' widths read out (ring 1) */
export const VAULT106 = Object.freeze({
  n: 17, side: 8, h0: 2.6, acc: 1.25, vTop: 2.6, liftH: 1.3, tiltRate: 0.9, tiltLag: 3.2, wedges: 4, taps: 2,
  rings: Object.freeze([
    Object.freeze({ his: 2, extra: 1, cracked: 0, swing: false, wind: 0, glow: true, vMax: 0.95, tolT: 0.075, tolS: 0.14, keys: Object.freeze([-1, 0, 1]), marks: true }),
    Object.freeze({ his: 3, extra: 2, cracked: 1, swing: true, wind: 0, glow: false, vMax: 0.9, tolT: 0.065, tolS: 0.12, keys: Object.freeze([-1, 0, 1, 2]), marks: false }),
    Object.freeze({ his: 4, extra: 2, cracked: 2, swing: true, wind: 1, glow: false, vMax: 0.75, tolT: 0.055, tolS: 0.1, keys: Object.freeze([-2, -1, 0, 1, 2]), marks: false }),
  ]),
});
/** a standard place's angle from the left springing (rad): side 'L' j=0 is the springer at the left; 'R' mirrors; the keystone at π/2 */
export const DA106 = Math.PI / VAULT106.n;
export const UNIT106 = DA106 / 2;
export const slotA106 = (side, j) => (side === 'K' ? Math.PI / 2 : side === 'L' ? (j + 0.5) * DA106 : Math.PI - (j + 0.5) * DA106);
/** the tilt a stone needs in its place (its joints radial): 0 for the keystone, + leaning toward the left springing */
export const slotTilt106 = (side, j) => slotA106(side, j) - Math.PI / 2;
/** his stone of w units whose lower joint is u0 units above the crews' last (first: the crews' standard places a side): its middle's angle */
export const seatA106 = (side, first, u0, w) => { const a = first * DA106 + (u0 + w / 2) * UNIT106; return side === 'L' ? a : side === 'R' ? Math.PI - a : Math.PI / 2; };
/** can the widths ws (a multiset) fill a and b exactly, disjointly (each stone used at most once)? */
export function fills106(ws, a, b) {
  if (a === 0 && b === 0) return true; if (a < 0 || b < 0) return false;
  const t = a > 0 ? 'a' : 'b', seen = new Set();
  for (let q = 0; q < ws.length; q++) { const w = ws[q]; if (seen.has(w)) continue; seen.add(w); const rest = ws.slice(0, q).concat(ws.slice(q + 1)); if (t === 'a' ? fills106(rest, a - w, b) : fills106(rest, a, b - w)) return true; }
  return false;
}
/** one side's arc split into stones of 1–3 units (rnd); never all of the crews' width alone — the sum is the puzzle */
function split106(U, rnd) { for (let t = 0; t < 20; t++) { const o = split0(U, rnd); if (o.some((w) => w !== 2)) return o; } return split0(U, rnd); }
function split0(U, rnd) { const out = []; let r = U; while (r > 0) { const opts = [1, 2, 3].filter((w) => w <= r && !(r - w === 0 && out.length === 0 && U > 3 && w === U)); const w = opts[Math.floor(rnd() * opts.length)] || r; out.push(w); r -= w; } return out; }

/** one ring. pick(id) → a stone of the row hangs over the crown; aim('L'|'R') → the crane carries it over that side's place ('lead': that
 *  side is ahead — not; 'over': wider than the place left — a fault, it stays hanging); pull(d) (−1…1) the tag lines turn it; hold(on) lowers
 *  it (faster the longer held; let go → it stops); back() → the hanging stone down to the row again; lift(side) → his top stone on that
 *  side hangs again; step(dt) → the touch: 'seat' | 'chip' (too fast: seated, a chip off its arris) | 'knock' (swinging: it struck its
 *  neighbour, up again) | 'askew' (not true: on one corner, up a little); then the keystone: choose(i) one off the bench (its width
 *  k.keys[i].w, the gap k.gap fingers); keyUp() it hangs over the gap; its touch: 'seat' | 'tight' (too wide: back to the bench) | 'falls'
 *  (too narrow: down to the centering, broken — a fault); strike(q) a wedge (two taps each;
 *  |left − right| taps > 2 → 'uneven') */
export function createVault106(i = 0, rnd = Math.random) {
  const V = VAULT106, G = V.rings[clamp(i | 0, 0, 2)], first = V.side - G.his, U = G.his * 2;
  const ws = split106(U, rnd).concat(split106(U, rnd));
  for (let q = 0; q < G.extra; q++) ws.push(1 + Math.floor(rnd() * 3));
  const cr = []; for (let q = 0; q < G.cracked; q++) cr.push(1 + Math.floor(rnd() * 3));
  const all = ws.map((w) => ({ w, cracked: false })).concat(cr.map((w) => ({ w, cracked: true })));
  for (let q = all.length - 1; q > 0; q--) { const j = Math.floor(rnd() * (q + 1)); [all[q], all[j]] = [all[j], all[q]]; }
  const row = all.map((r, id) => ({ id, w: r.w, cracked: r.cracked, used: false }));
  const k = {
    i: clamp(i | 0, 0, 2), G, first, U, row, L: [], R: [], hang: null, ph: 'set', faults: 0, ev: [], last: null, chips: 0, knocks: 0, cracks: 0, keyFalls: 0, uneven: 0, overs: 0,
    key: null, keyN: 0, gap: 0, keys: [], taps: [0, 0, 0, 0], tapL: 0, tapR: 0, out: 0, done: false, q: null, t: 0, gust: 0, gustT: 2 + rnd() * 2, lifts: 0, plan: null,
  };
  const ev = (e) => { k.ev.push(e); k.last = e; return e; };
  const sideArr = (s) => (s === 'L' ? k.L : k.R);
  const sum = (s) => sideArr(s).reduce((a, b) => a + b.w, 0);
  const full = (s) => sum(s) >= U;
  /** the tilt the hanging stone needs over its side's place */
  const need = () => { const h = k.hang; if (!h || h.side === 'K' || !h.side) return 0; return seatA106(h.side, first, sum(h.side), h.stone.w) - Math.PI / 2; };
  function newKeys() { k.gap = 9 + Math.floor(rnd() * 4); const off = G.keys.slice(); for (let q = off.length - 1; q > 0; q--) { const j = Math.floor(rnd() * (q + 1)); [off[q], off[j]] = [off[j], off[q]]; } k.keys = off.map((o, i) => ({ i, over: o, w: k.gap + o, gone: false, tried: false })); k.key = null; }
  function hangAt(stone, side, h, tilt) { k.hang = { stone, side, h, tilt, tT: tilt, s: 0, sv: 0, v: 0, down: false, pull: 0 }; }
  function pick(id) {
    if (k.ph !== 'set' || k.hang) return 'none'; const r = row.find((x) => x.id === id && !x.used); if (!r) return 'none';
    r.used = true; hangAt(r, null, V.h0 + 1.6, 0); return ev('pick');
  }
  function aim(side) {
    const h = k.hang; if (!h || h.side === side || (side !== 'L' && side !== 'R') || h.key) return 'none';
    if (full(side)) return ev('full');
    if (h.stone.w > U - sum(side)) { k.faults++; k.overs++; return ev('over'); }   // (wider than the place left: it would stand into the keystone's)
    const o = side === 'L' ? 'R' : 'L'; if (sum(side) - sum(o) >= 3 && !full(o)) return ev('lead');   // (a side well ahead waits for the other: the centering is loaded evenly)
    if (G.swing && h.side) h.sv += (side === 'L' ? 1 : -1) * 0.9;   // (carried across the crown: it swings)
    else if (G.swing) h.sv += (side === 'L' ? 1 : -1) * 0.5;
    h.side = side; h.h = Math.max(h.h, V.h0); h.v = 0; return ev('aim');
  }
  function pull(d) { const h = k.hang; if (!h) return; h.pull = clamp(d, -1, 1); }
  function hold(on) { const h = k.hang; if (!h) return; if (on && !h.side && !h.key) return; h.down = !!on; if (!on) h.v = 0; }
  function back() { const h = k.hang; if (!h || h.key) return 'none'; h.stone.used = false; k.hang = null; return ev('back'); }
  function lift(side) {
    if (k.ph !== 'set' || k.hang) return 'none'; const arr = sideArr(side); if (!arr.length) return ev('below');
    const st = arr.pop(); hangAt(st, side, V.liftH, seatA106(side, first, sum(side), st.w) - Math.PI / 2); k.lifts++; return ev('lift');
  }
  /** the stone touches its place: judged */
  function touch() {
    const h = k.hang, dT = Math.abs(h.tilt - need());
    if (Math.abs(h.s) > G.tolS) { k.faults++; k.knocks++; h.h = 0.5; h.v = 0; h.down = false; h.sv *= -0.6; return ev('knock'); }
    if (dT > G.tolT) { h.h = 0.3; h.v = 0; h.down = false; return ev('askew'); }
    const fast = h.v > G.vMax; if (fast) { k.faults++; k.chips++; }
    sideArr(h.side).push(h.stone); k.hang = null;
    if (full('L') && full('R')) { k.ph = 'key'; newKeys(); }
    return ev(fast ? 'chip' : 'seat');
  }
  function keyTouch() {
    const h = k.hang, K = k.key;
    if (Math.abs(h.s) > G.tolS) { k.faults++; k.knocks++; h.h = 0.5; h.v = 0; h.down = false; h.sv *= -0.6; return ev('knock'); }
    if (K.over > 0) { k.hang = null; K.hang = false; K.tried = true; k.key = null; return ev('tight'); }
    if (K.over < 0) { k.hang = null; k.faults++; k.keyFalls++; K.gone = true; k.key = null; return ev('falls'); }
    const fast = h.v > G.vMax; if (fast) { k.faults++; k.chips++; }
    k.hang = null; K.hang = false; k.ph = 'strike';
    for (const s of k.L.concat(k.R)) if (s.cracked) { k.faults++; k.cracks++; }
    return ev(fast ? 'chip' : 'seat');
  }
  function choose(i) { if (k.ph !== 'key' || k.hang) return 'none'; const K = k.keys[i]; if (!K || K.gone) return 'none'; k.key = K; return ev('choose'); }
  function keyUp(i) { if (i != null) choose(i); if (k.ph !== 'key' || !k.key || k.hang) return 'none'; k.key.hang = true; hangAt({ id: 'key', key: true, w: 2 }, 'K', V.h0, 0); k.hang.key = true; return ev('keyUp'); }
  function strike(q) {
    if (k.ph !== 'strike' || k.taps[q] >= V.taps) return 'none'; k.taps[q]++; if (q < 2) k.tapL++; else k.tapR++;
    let r = 'tap'; if (Math.abs(k.tapL - k.tapR) > 2) { k.faults++; k.uneven++; r = 'uneven'; k.tapL = k.tapR = Math.min(k.tapL, k.tapR); }
    if (k.taps[q] >= V.taps) { k.out++; if (r === 'tap') r = 'out'; }
    if (k.out >= V.wedges) { k.ph = 'eased'; k.done = true; const f = k.faults; k.q = f === 0 ? 1 : f <= 2 ? 0.5 : 0; return ev('eased'); }
    return ev(r);
  }
  function step(dt) {
    k.t += dt; const h = k.hang; let r = null; if (!h) return null;
    // the tag lines: the tilt follows the pull (lag); the wind
    h.tT = clamp(h.tT + h.pull * V.tiltRate * dt, -1.2, 1.2); h.tilt += (h.tT - h.tilt) * Math.min(1, V.tiltLag * dt);
    if (G.wind && k.ph !== 'strike') { k.gustT -= dt; if (k.gustT <= 0) { k.gust = (rnd() < 0.5 ? -1 : 1) * (0.5 + rnd() * 0.5); k.gustT = 3 + rnd() * 3; } k.gust *= Math.exp(-dt * 1.4); h.sv += k.gust * dt * 1.6; }
    // the swing: a pendulum, damped; without G.swing it is damped hard
    const w = 2.1, c = G.swing ? 0.55 : 6; h.sv += (-w * w * h.s - c * h.sv) * dt; h.s += h.sv * dt; if (!G.swing && !G.wind) { h.s *= Math.exp(-dt * 6); }
    // lowering: held → the walker steps back, faster the longer; let go → stops
    if (h.down && (h.side || h.key)) { h.v = Math.min(V.vTop, h.v + V.acc * dt); h.h -= h.v * dt; if (h.h <= 0) { h.h = 0; r = h.key ? keyTouch() : touch(); } }
    return r;
  }
  /** the stones left in the row, sound ones (their widths) */
  const free = () => row.filter((x) => !x.used && !x.cracked);
  /** what a careful mason picks next: a sound stone for the side behind that leaves both sides still fillable */
  function plan() {
    const sides = sum('L') <= sum('R') ? ['L', 'R'] : ['R', 'L'];
    for (const s of sides) { if (full(s)) continue; const rem = U - sum(s), o = s === 'L' ? 'R' : 'L';
      for (const r of free().sort((a, b) => b.w - a.w)) { if (r.w > rem) continue; if (sum(s) + r.w - sum(o) >= 4 && !full(o)) continue; const rest = free().filter((x) => x !== r).map((x) => x.w); if (fills106(rest, rem - r.w, U - sum(o))) return { id: r.id, side: s }; } }
    return null;
  }
  /** the test's hand: what a careful mason does next */
  function hint() {
    if (k.ph === 'strike') { const order = [0, 2, 1, 3]; for (const q of order) if (k.taps[q] < V.taps) { const L = q < 2; if (k.tapL - k.tapR >= 2 && L) continue; if (k.tapR - k.tapL >= 2 && !L) continue; return { kind: 'strike', q }; } return null; }
    if (k.ph === 'key') { if (k.hang) return lowerHint(0); const K = k.keys.find((x) => x.over === 0 && !x.gone); return { kind: 'keyUp', i: K.i }; }
    if (k.ph !== 'set') return null;
    const h = k.hang;
    if (!h) { const p = plan(); if (p) { k.plan = p.side; return { kind: 'pick', id: p.id }; } for (const s of ['L', 'R']) if (sideArr(s).length) return { kind: 'lift', side: s }; return null; }
    if (!h.side) { const s = k.plan && !full(k.plan) && h.stone.w <= U - sum(k.plan) ? k.plan : (U - sum('L') >= h.stone.w ? 'L' : 'R'); return { kind: 'aim', side: s }; }
    return lowerHint(need());
  }
  function lowerHint(nd) {
    const h = k.hang, dT = nd - h.tT; if (Math.abs(dT) > 0.01 || Math.abs(nd - h.tilt) > G.tolT * 0.5) return { kind: 'pull', d: clamp(dT * 4, -1, 1) };
    if (Math.abs(h.s) > G.tolS * 0.5 || Math.abs(h.sv) > 0.25) return { kind: 'wait' };
    const safe = h.h > 0.55 ? h.v < 1.6 : h.v < G.vMax * 0.7; return { kind: 'hold', on: safe };
  }
  return { pick, aim, pull, hold, back, lift, choose, keyUp, strike, step, hint, need, sum, full, plan, state: () => k, G, first, U };
}
export const vaultQ106 = (qs) => { if (!qs.length) return 0; const s = qs.reduce((a, b) => a + b, 0) / qs.length; return s >= 0.88 ? 1 : s >= 0.45 ? 0.5 : 0; };

/** the lines (one short instruction; after " · " the source or המחשה) */
export const L106 = Object.freeze({
  pick: 'בחרו אבן — כל נקודה עליה היא יחידה; כל צד צריך להיסגר בדיוק · "בית המוקד כפה" — מדות א, ח · טיוטה',
  aim: 'גררו את האבן התלויה ימינה או שמאלה — אל הצד שהיא משלימה · המחשה',
  over: 'רחבה מהמקום שנשאר — לא נכנסת! מדדו: כמה יחידות חסרות בצד? · המחשה',
  stuck: 'אין בשורה אבן שמשלימה — הרימו אבן מהקשת והחליפו · המחשה',
  tilt: 'משכו בחבל — האבן נוטה עד שהחיבור מקביל לשכנה · המחשה',
  lower: 'החזיקו על האבן — היא יורדת. הרפו — נעצרת. לאט בסוף! · המחשה',
  seat: '"טק" — האבן יושבת · המחשה',
  chip: 'מהר מדי — נשבר שבב מהפינה · המחשה',
  knock: 'היא התנדנדה — נקשה בשכנה. חכו שתירגע · המחשה',
  askew: 'לא ישרה — עומדת על פינה. יישרו בחבל ונסו שוב · המחשה',
  lead: 'קודם הצד השני — התבנית צריכה משקל שווה · המחשה',
  lift: 'האבן שוב תלויה במנוף — הורידו אותה כמו שצריך · המחשה',
  below: 'קודם האבן שמעליה · המחשה',
  back: 'האבן חזרה לשורה · המחשה',
  cracked: 'יש סדק דק באבן — מי שרואה משאיר אותה בצד · המחשה',
  key: 'הצדדים נפגשו — ראש הבנאים מדד את הרווח. בחרו אבן ראשה ברוחב שלו · המחשה',
  nochisel: 'אבני הראשה באו מסותתות — "ומקבות והגרזן כל כלי ברזל לא נשמע בבית בהבנתו" — מלכים א ו, ז · טיוטה',
  tight: 'רחבה מדי — נתקעה למעלה וחזרה לספסל. נסו אחרת · המחשה',
  falls: 'צרה מדי — נפלה עד התבנית ונסדקה! · המחשה',
  strike: 'הקישו על הטריזים — פעם בצד הזה, פעם בצד ההוא · המחשה',
  uneven: 'שוב באותו צד — התבנית נטתה וחרקה · המחשה',
  holds: 'הקשת עומדת · המחשה',
  sleep: '"וזקני בית אב ישנים שם, ומפתחות העזרה בידם" — מדות א, ח · טיוטה',
});
export const SRC106 = Object.freeze([
  'בית המוקד — "כפה, ובית גדול היה, מקף רובדין של אבן, וזקני בית אב ישנים שם, ומפתחות העזרה בידם" — מדות א, ח · טיוטה',
  'אבני הבית באו מסותתות: "אבן שלמה מסע נבנה, ומקבות והגרזן כל כלי ברזל לא נשמע בבית בהבנתו" — מלכים א ו, ז · טיוטה',
  'מנוף גלגל הדריכה, התבנית והטריזים, חבלי הכיוון, רוחבי האבנים בטבעת ומדידת הרווח לאבן הראשה — המחשה של בניית קשתות בתקופה',
]);
