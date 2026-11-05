/* ── build 105 ── lish105.js — stage 10, גוף המזבח והכבש, rebuilt on build 101's world (the spec doc "איפיון בנייה 105", 5.11; the owner
 *  5.11 16:01: "לפני כל בנייה אתה עושה איפיון ודיוק משימות"). Two deep acts, each done again at a rising level:
 *  - THE KEVESH ("ולא תעלה במעלות"): the crews have built its walls and filled them; a long straight-edge lies from the court's floor to the
 *    top. His stones in its middle lane, row by row from the foot: each is set on the soft fill and stands proud; held, the kohen raises
 *    the wooden maul (the longer, the higher); let go, it falls and the stone sinks (high: much; low: a little; too low: it only bounces).
 *    The straight-edge rocks on a stone that stands proud or tilted, lies flat on a true one, and shows light under one sunk too deep — the
 *    crew lifts it and puts more fill under (a fault). Where the finger holds the stone is where the maul falls: on a heavy-ended stone
 *    the high end. On wet fill the stone goes on sinking a moment after the blow. At the end a wooden roller goes down the kevesh.
 *  - THE WHITEWASH ("ולא היו סדין אותן בכפיס של ברזל, שמא יגע ויפסול"): a cloth, not the iron trowel; dipped in the bucket, wiped over
 *    the face; the cloth runs dry; held still it drips — a drip is wiped before it dries; the red line is never whitened. Three faces at
 *    a rising level, the last in a strong sun: lime laid over dried lime leaves a dark lap.
 * Pure: no THREE, no DOM. har42.js plays it. The maul, the straight-edge, the fill, the roller, the cloth, the drips and the drying: המחשה.
 * Never a Divine Name. */

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const TEFACH = 1 / 6;
/** the altar's body above the sovev: 28 × 28 (מדות ג, א: "נמצא עשרים ושמונה על עשרים ושמונה"), three amot high ("ושלש אמות קומתו" —
 *  "משפת סובב ולמעלה", זבחים נט ע"ב): from y 22 to 25, three courses */
export const GUF105 = Object.freeze({ x0: -52, x1: -24, z0: -17.5, z1: 10.5, y0: 22, top: 25, courses: 3 });
/** the kevesh (מדות ג, ג: "וכבש היה לדרומו של מזבח", 32 × 16): south of the altar, from the court's floor (16) at its foot to the top (25) */
export const RAMP105 = Object.freeze({ x0: -46, x1: -30, zTop: 10.5, zFoot: 42.5, y0: 16, y1: 25, rows: 16, row: 2 });

/* ───────── THE KEVESH ───────── */
export const KEV105 = Object.freeze({
  /** his rows (of 16, from the foot), one stone each in the middle lane; its size: across, along the slope, thick */
  rows: Object.freeze([1, 4, 8, 12, 15]), w: 2.6, len: 2.0, thick: 0.5,
  /** how proud each stone lands on the fill (amot), and its tilt (the upper end over the lower), per level 1…5 */
  e0: Object.freeze([null, 0.42, 0.45, 0.42, 0.42, 0.4]), t0: Object.freeze([null, 0, 0, 0.24, 0.05, 0.18]),
  /** a full blow sinks it this much (amot) — the fill harder level by level; from below h0 the maul only bounces */
  gain: Object.freeze([null, 0.3, 0.22, 0.24, 0.2, 0.2]), h0: 0.18, pw: 1.3, noise: 0.15,
  /** the maul rises to full in this many seconds of holding */
  tRise: 1.2,
  /** true within (amot): the middle, and the tilt; per level */
  tol: Object.freeze([null, 0.5, 0.4, 0.4, 0.35, 0.35].map((x) => (x ? x * TEFACH : null))),
  tolT: Object.freeze([null, 0.7, 0.6, 0.5, 0.5, 0.35].map((x) => (x ? x * TEFACH : null))),
  /** wet fill: after a blow it goes on sinking by this share of it, over cT seconds */
  wet: Object.freeze([null, 0, 0, 0, 0.45, 0.12]), cT: 0.8,
  /** where the finger holds (−1 the lower end, +1 the upper): the tilt changes by the sink × x × tiltK */
  tiltK: 1.0,
  /** true and settled this long: the master's "שוכב"; light under the edge this long: the crew lifts it */
  holdT: 0.6, lightT: 1.2,
  /** the crew lifting it and filling under it: this long, no blow */
  liftT: 1.6,
  /** level 1: the true line's shadow on the stone */
  shadow: Object.freeze([null, true, false, false, false, false]),
});

/** one of his kevesh stones. i: 0…4 (its level = i + 1) */
export function createStone105(i = 0, rnd = Math.random) {
  const K = KEV105, L = clamp((i | 0) + 1, 1, 5), sg = rnd() < 0.5 ? -1 : 1;
  const k = { i, L, row: K.rows[clamp(i | 0, 0, 4)], ph: 'place', e: K.e0[L] * (0.92 + 0.16 * rnd()), t: K.t0[L] * (L === 3 ? sg : 1) * (0.9 + 0.2 * rnd()),
    held: false, x: 0, h: 0, lift: 0, creep: 0, strikes: 0, bounces: 0, refills: 0, still: 0, light: 0, q: null, done: false, ev: [] };
  /** the straight-edge on this stone and the row below: 'rock' (proud or tilted), 'flat', 'light' (sunk) */
  function edge() { if (k.e < -K.tol[L]) return 'light'; if (k.e > K.tol[L] || Math.abs(k.t) > K.tolT[L]) return 'rock'; return 'flat'; }
  /** how much the edge rocks (0…1) — for the eye */
  const rockA = () => clamp(Math.max(k.e - K.tol[L], Math.abs(k.t) - K.tolT[L], 0) / 0.3, 0, 1);
  function place() { if (k.ph === 'place') { k.ph = 'strike'; k.ev.push('placed'); } return k.ph; }
  /** the finger down on the stone at x (−1…1 along it): the maul starts up */
  function hold(x = 0) { if (k.ph !== 'strike' || k.lift > 0) return false; k.held = true; k.h = 0; k.x = clamp(x, -1, 1); return true; }
  const aim = (x) => { k.x = clamp(x, -1, 1); };
  /** let go: the maul falls. → 'bounce' | 'blow' */
  function release() {
    if (k.ph !== 'strike' || !k.held) return 'no';
    k.held = false; const h = k.h; k.h = 0; k.strikes++;
    if (h < K.h0) { k.bounces++; k.ev.push('bounce'); return 'bounce'; }
    const s = K.gain[L] * Math.pow((h - K.h0) / (1 - K.h0), K.pw) * (1 + (rnd() * 2 - 1) * K.noise);
    k.e = Math.max(-0.5, k.e - s); k.t -= s * k.x * K.tiltK; k.creep += s * K.wet[L]; k.still = 0; k.ev.push('blow');
    return 'blow';
  }
  /** every frame: the maul rises while held; wet fill creeps; settled true → 'true'; light long enough → 'refill' */
  function step(dt) {
    if (k.ph !== 'strike') return k.ph;
    if (k.lift > 0) { k.lift = Math.max(0, k.lift - dt); return 'lift'; }
    if (k.held) k.h = Math.min(1, k.h + dt / K.tRise);
    if (k.creep > 1e-4) { const d = Math.min(k.creep, (k.creep * dt) / K.cT + 0.02 * dt); k.creep -= d; k.e -= d; k.t -= d * k.x * K.tiltK; }
    const settled = k.creep < 0.004 && !k.held, ed = edge();
    if (ed === 'light' && k.creep < 0.004) { /* (the edge shows light whether or not the maul is up again) */ k.light += dt; if (k.light >= K.lightT) { k.light = 0; k.refills++; k.e = 0.1 + 0.06 * rnd(); k.t *= 0.5; k.creep = 0; k.held = false; k.h = 0; k.lift = K.liftT; k.ev.push('refill'); return 'refill'; } } else k.light = 0;
    if (ed === 'flat' && settled) { k.still += dt; if (k.still >= K.holdT) { k.ph = 'true'; k.done = true; k.q = k.refills === 0 ? 1 : k.refills === 1 ? 0.5 : 0; k.ev.push('true'); return 'true'; } } else k.still = 0;
    return 'strike';
  }
  /** the test's hand: { x, h } — a careful mason: the high end first, then the middle, short of the mark (and shorter on wet fill) */
  function hint() {
    if (k.ph !== 'strike') return null;
    if (k.creep > 0.004) return { wait: true };
    const tl = K.tolT[L], tol = K.tol[L];
    let x = 0, s = 0;
    if (Math.abs(k.t) > tl * 0.6) { x = Math.sign(k.t) * 0.85; s = Math.min(Math.abs(k.t) / 0.85 * 0.7, Math.max(0, k.e + tol * 0.6)); if (s <= 0.004 && Math.abs(k.t) > tl) s = Math.abs(k.t) / 0.85 * 0.5; }   // (sunk in the middle and still tilted: the high end all the same — the crew will fill under it)
    else if (k.e > tol * 0.4) s = (k.e * 0.65) / (1 + K.wet[L]);
    if (s <= 0.004) return { wait: true };
    const h = K.h0 + (1 - K.h0) * Math.pow(clamp(s / K.gain[L], 0, 1), 1 / K.pw);
    return { x, h: clamp(h, K.h0 + 0.02, 1) };
  }
  return { place, hold, aim, release, step, edge, rockA, hint, state: () => k };
}
/** the kevesh's grade from his stones */
export function kevQ105(qs) { if (!qs.length) return 0; const m = qs.reduce((a, b) => a + b, 0) / qs.length; return m >= 0.95 ? 1 : m >= 0.5 ? 0.5 : 0; }
/** the roller going down: where it knocks ("טק") — on a stone the crew had to lift and fill again */
export function roller105(stones) { return stones.filter((k) => k && k.refills > 0).map((k) => k.row); }

/* ───────── THE WHITEWASH ───────── */
export const SID105 = Object.freeze({
  cols: 24, rows: 12,
  /** the three faces: how big (amot), the row the red line runs in (−1: none), how fast a drip runs (cells/s), dries (s), the lap */
  faces: Object.freeze([
    Object.freeze({ id: 'east', he: 'הפנים המזרחיות, עד הקו', w: 6, h: 3.4, band: 11, run: 0.9, dryDrip: 5.5, lap: Infinity }),
    Object.freeze({ id: 'south', he: 'הפנים הדרומיות, מעל הקו ומתחתיו', w: 6, h: 3.2, band: 8, run: 1.1, dryDrip: 4.5, lap: Infinity }),
    Object.freeze({ id: 'kevesh', he: 'דופן הכבש, בשמש', w: 7, h: 2.6, band: -1, run: 1.3, dryDrip: 3.2, lap: 2.2 }),
  ]),
  /** the cloth: its reach (cells, soft), how much it lays, how fast it runs dry; a band cell is touched when its weight passes touch */
  rB: 1.3, rate: 0.5, use: 0.0062, touch: 0.35, cap: 1.4, covered: 0.9,
  /** lime over lime already white and dried (in the sun): a dark lap — where the cloth passes over it (its rim, a row away, does not count) */
  lapW: 0.25,
  /** held still (moved less than stillD cells in stillT s) with a full cloth: a drip */
  stillD: 0.35, stillT: 0.5, dripLoad: 0.45, dripAt: 0.35,
  /** done: this share of the face white, no drip running */
  need: 0.92,
});

/** one face. i: 0…2 */
export function createSid105(i = 0) {
  const S = SID105, F = S.faces[clamp(i | 0, 0, 2)], C = S.cols, R = S.rows, N = C * R;
  const cov = new Float32Array(N), tP = new Float32Array(N).fill(-1), pink = new Uint8Array(N), lap = new Uint8Array(N), run = new Uint8Array(N);
  const bandRow = F.band;
  const k = { i, face: F, tool: null, iron: 0, load: 0, dips: 0, t: 0, down: false, at: null, drips: [], dried: 0, wiped: 0, pinkEv: 0, lapEv: 0,
    strokePink: false, strokeLap: false, stillAcc: 0, trail: [], q: null, done: false, ev: [] };
  const inBand = (r) => r === bandRow;
  const idx = (c, r) => r * C + c;
  /** the tool: the iron trowel is stopped by the master (no fault); the cloth is taken */
  function tool(name) { if (name === 'iron') { k.iron++; k.ev.push('iron'); return 'stop'; } k.tool = 'cloth'; return 'ok'; }
  function dip() { if (k.tool !== 'cloth') return false; k.load = 1; k.dips++; k.ev.push('dip'); return true; }
  /** the cloth at (x, y) in cells (y up from the face's foot): lime laid on the cells round it */
  function lay(x, y, wipe = true) {
    const r0 = Math.max(0, Math.floor(y - S.rB)), r1 = Math.min(R - 1, Math.floor(y + S.rB)), c0 = Math.max(0, Math.floor(x - S.rB)), c1 = Math.min(C - 1, Math.floor(x + S.rB));
    const lf = Math.min(1, k.load * 1.6); if (lf <= 0) return;
    for (let r = r0; r <= r1; r++) for (let c = c0; c <= c1; c++) {
      const d = Math.hypot(c + 0.5 - x, r + 0.5 - y), w = 1 - d / S.rB; if (w <= 0) continue;
      const j = idx(c, r);
      if (inBand(r)) { if (w > S.touch) { if (!pink[j]) pink[j] = 1; if (!k.strokePink) { k.strokePink = true; k.pinkEv++; k.ev.push('pink'); } } continue; }
      if (F.lap < Infinity && w > S.lapW && cov[j] >= S.covered && tP[j] >= 0 && k.t - tP[j] > F.lap) { lap[j] = 1; if (!k.strokeLap) { k.strokeLap = true; k.lapEv++; k.ev.push('lap'); } }
      const dep = S.rate * w * lf; cov[j] = Math.min(S.cap, cov[j] + dep); if (w > S.lapW) tP[j] = k.t; k.load = Math.max(0, k.load - dep * S.use);
      // a drip under the cloth: wiped
      if (wipe) for (const dr of k.drips) if (!dr.dry && !dr.gone && Math.abs(dr.x - x) < 1.2 && Math.abs(dr.y - y) < 1.2) { dr.gone = true; k.wiped++; k.ev.push('wipe'); for (const q of dr.cells) run[q] = 0; }
    }
  }
  function down(x, y) { if (k.tool !== 'cloth') return false; k.down = true; k.at = [x, y]; k.strokePink = false; k.strokeLap = false; k.trail = [[x, y, k.t]]; lay(x, y); return true; }
  function move(x, y) {
    if (!k.down || !k.at) return; x = clamp(x, 0, C - 0.001); y = clamp(y, 0, R - 0.001);
    const [x0, y0] = k.at, d = Math.hypot(x - x0, y - y0), n = Math.max(1, Math.ceil(d / 0.25));
    for (let q = 1; q <= n; q++) lay(x0 + ((x - x0) * q) / n, y0 + ((y - y0) * q) / n);
    k.at = [x, y]; k.trail.push([x, y, k.t]); while (k.trail.length > 2 && k.t - k.trail[0][2] > S.stillT) k.trail.shift();
  }
  function up() { k.down = false; k.at = null; k.stillAcc = 0; }
  /** every frame: a still, full cloth drips; drips run down and dry; → 'done' once white enough with no drip running */
  function step(dt) {
    k.t += dt;
    if (k.down && k.at) {
      const tr = k.trail, span = tr.length ? k.t - tr[0][2] : 0; let mx = 0; for (const p of tr) mx = Math.max(mx, Math.hypot(p[0] - k.at[0], p[1] - k.at[1]));
      if (span >= S.stillT * 0.9 && mx < S.stillD && k.load > S.dripLoad) { k.stillAcc += dt * k.load; if (k.stillAcc > S.dripAt) { k.stillAcc = 0; k.drips.push({ x: k.at[0], y: k.at[1] - 1.4, y0: k.at[1] - 1.4, age: 0, dry: false, gone: false, cells: [] }); k.load *= 0.8; k.ev.push('drip'); } }
      else k.stillAcc = Math.max(0, k.stillAcc - dt);
      if (k.at) lay(k.at[0], k.at[1], false);   // (a still cloth goes on soaking the place under it)
    }
    for (const dr of k.drips) {
      if (dr.dry || dr.gone) continue;
      dr.age += dt; dr.y = Math.max(0, dr.y - F.run * dt);
      const c = clamp(Math.floor(dr.x), 0, C - 1), r = clamp(Math.floor(dr.y), 0, R - 1), j = idx(c, r); if (!dr.cells.includes(j)) { dr.cells.push(j); run[j] = 1; }
      if (inBand(r) && !dr.pinked) { dr.pinked = true; pink[j] = 1; k.pinkEv++; k.ev.push('pink'); }
      if (dr.age >= F.dryDrip) { dr.dry = true; k.dried++; k.ev.push('dried'); }
    }
    if (!k.done && cover() >= S.need && !k.drips.some((d) => !d.dry && !d.gone)) {
      k.done = true; const f = faults(); k.q = f === 0 ? 1 : f <= 2 ? 0.5 : 0; k.ev.push('done'); return 'done';
    }
    return k.done ? 'done' : 'on';
  }
  const faults = () => k.dried + k.pinkEv + k.lapEv;
  /** the share of the face (the band left out) that is white */
  function cover() { let n = 0, m = 0; for (let r = 0; r < R; r++) { if (inBand(r)) continue; for (let c = 0; c < C; c++) { m++; if (cov[idx(c, r)] >= S.covered) n++; } } return m ? n / m : 0; }
  /** the test's hand: the next place for the cloth — row by row from the top (the band and its edge left alone), back and forth */
  function hint() {
    if (k.tool !== 'cloth') return { kind: 'tool' };
    if (k.load < 0.22) return { kind: 'dip' };
    const live = k.drips.find((d) => !d.dry && !d.gone); if (live) return { kind: 'to', x: live.x, y: live.y };
    for (let r = R - 1; r >= 0; r--) {
      if (inBand(r)) continue;
      const cs = []; for (let c = 0; c < C; c++) if (cov[idx(c, r)] < S.covered) cs.push(c);
      if (!cs.length) continue;
      const y = r + 0.5, ltr = r % 2 === 0, c = ltr ? cs[0] : cs[cs.length - 1];
      return { kind: 'to', x: c + 0.5, y, row: r, ltr };
    }
    return { kind: 'wait' };
  }
  return { tool, dip, down, move, up, step, cover, hint, faults, bandRow, cells: () => ({ cov, pink, lap, run }), state: () => k };
}
/** the whitewash's grade from its three faces */
export function sidQ105(qs) { if (!qs.length) return 0; const m = qs.reduce((a, b) => a + b, 0) / qs.length; return m >= 0.95 ? 1 : m >= 0.5 ? 0.5 : 0; }

/* ───────── THE STAGE ───────── */
export const PARTS105 = Object.freeze(['open', 'makevet', 'sidud', 'reveal']);
export const DEP105 = Object.freeze({ makevet: [], sidud: ['makevet'] });
export const L105 = Object.freeze({
  kevesh: '"וכבש היה לדרומו של מזבח" — האבנים באמצע שלכם · מדות ג, ג · טיוטה',
  place: 'גררו את האבן מהמזחלת למקום שלה בשורה · המחשה',
  hold: 'החזיקו על האבן — המקבת עולה; שחררו — היא נופלת · המחשה',
  rock: 'הסרגל מתנדנד — האבן עוד בולטת · המחשה',
  tilt: 'הסרגל מתנדנד — קצה אחד גבוה. הכו על הקצה הגבוה · המחשה',
  bounce: 'נמוך מדי — המקבת רק קפצה · המחשה',
  light: 'רואים אור מתחת לסרגל — האבן שקעה מדי · המחשה',
  refill: 'הפועלים מרימים את האבן ומוסיפים מילוי · המחשה',
  wet: 'מילוי רטוב — האבן שוקעת עוד אחרי המכה. חכו · המחשה',
  heavy: 'לאבן הזאת קצה כבד — היכן שהאצבע, שם המקבת · המחשה',
  top: 'השורה העליונה — צריכה לפגוש את ראש המזבח בלי מדרגה · המחשה',
  flat: '"שוכב" — הסרגל שוכב על האבן · המחשה',
  crews: 'הפועלים מניחים את השורות שבין האבנים שלכם · המחשה',
  steps: '"ולא תעלה במעלות על מזבחי" — הכבש חלק · שמות כ, כג · טיוטה',
  roller: 'הגלגלת יורדת בכבש — איפה שיש מדרגה היא קופצת · המחשה',
  rollerOk: 'הגלגלת ירדה חלק — אין מדרגה · המחשה',
  guf: '"ושלש אמות קומתו" — הצוות מגביה את גוף המזבח · שמות כז, א; "משפת סובב ולמעלה", זבחים נט ע"ב · טיוטה',
  sid: '"ומלבנים אותן פעמים בשנה" — מלבינים את המזבח · מדות ג, ד · טיוטה',
  tool: 'במה מסיידים? געו בכלי · המחשה',
  iron: '"לא היו סדין אותן בכפיס של ברזל" — במטלית · מדות ג, ד · טיוטה',
  dip: 'געו בדלי — המטלית נספגת בסיד · המחשה',
  wipe: 'גררו את המטלית על הקיר · המחשה',
  dry: 'המטלית התייבשה — חזרו לדלי · המחשה',
  drip: 'טיפה! נגבו אותה לפני שתתייבש · המחשה',
  dried: 'הטיפה התייבשה — נשאר פס · המחשה',
  pink: 'הקו האדום נעשה ורוד! את הקו לא מסיידים · המחשה',
  lap: 'השמש חזקה — סיד על סיד יבש משאיר פס כהה · המחשה',
  faceDone: '"לבן" — הצוות ממשיך מכאן · המחשה',
  next: 'הקיר הבא · המחשה',
  done: 'המזבח לבן, והכבש עולה אליו בלי מדרגה · המחשה',
});
export const SRC105 = Object.freeze([
  'גוף המזבח — "נמצא עשרים ושמונה על עשרים ושמונה" — מדות ג, א; "ושלש אמות קומתו" — שמות כז, א, "משפת סובב ולמעלה" — זבחים נט ע"ב · טיוטה',
  'הכבש — "וכבש היה לדרומו של מזבח", שלושים ושתיים על שש עשרה — מדות ג, ג · טיוטה',
  'בלי מדרגות — "ולא תעלה במעלות על מזבחי" — שמות כ, כג · טיוטה',
  'הסיד — "ומלבנים אותן פעמים בשנה... לא היו סדין אותן בכפיס של ברזל, שמא יגע ויפסול" — מדות ג, ד · טיוטה',
  'מקבת העץ, הסרגל, המילוי, הגלגלת, המטלית, הטיפות והייבוש — המחשה',
]);
