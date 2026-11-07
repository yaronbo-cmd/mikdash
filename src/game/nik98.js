/* ── build 98 ── nik98.js — stage 06, שער ניקנור, after the owner's notes on build 96 (4.11 06:44–07:21):
 *  - the leaf (hang94): "הדלת לא 360 (רק ימינה שמאלה). ולא 'מרגישים' את הכובד שלה" — the leaf now turns on its pivot under his finger as it goes
 *    round the pivot (seen from above, the whole circle), heavy: it follows late, it keeps going when he lets go, and it must come to rest
 *    against its stop and then in its jamb without a bang — too hard and it bangs and swings back; too soft and it stops short;
 *  - the steps: "אבן אחת לא בונה קומת מדרגות שלמה. מתקן ההרמה לא ברור ולמעשה לא קיים. כללי הארד פאן לא נמצאים פה"; "תבדוק איך בנינו אותן
 *    בגרסה 15" — in build 15 the steps rose course by course, stone by stone, by the crane. Now each step is a half ring of stones round the
 *    core: the crews' crane lays them one by one, and his is the key stone in the middle of every ring, lowered by the hoist into the
 *    gap between the two set beside it (build 84's hoist: the rope's speed, the swing, the twist; set down hard it chips or breaks).
 * Pure: no THREE, no DOM. har42.js plays it. The crane, the core, the hoist: המחשה. Never a Divine Name. */
import { SOREG84, createHoist84 } from './soreg84.js';

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/* ───────── THE LEAF ON ITS PIVOT ───────── */
/** max: the leaf open against its stop (rad); per leaf (0 the south's, 1 the north's, heavier): k, c — the pull of his hand (a spring and a
 *  damper: lower k, the later it follows); mu — the pivot's friction when he lets go (rad/s²: the lower, the longer it swings on); vHard — the
 *  speed (rad/s) over which it bangs on the stop or the jamb; e — how much of its speed it keeps bouncing back */
export const SWING98 = Object.freeze({
  max: 1.25, over: 0.25,
  L: Object.freeze([
    Object.freeze({ k: 9, c: 3.2, mu: 0.6, vHard: 0.8, e: 0.35 }),
    Object.freeze({ k: 5, c: 2.0, mu: 0.36, vHard: 0.62, e: 0.4 }),
  ]),
});
/** ── build 100 ── a dry socket (no oil poured before the pin went in): the pin sticks — it moves only when his pull passes stick, then
 *  jerks free (stick: the lead of his finger, rad, it takes); a drag of muD on it while it moves (and mu × muK when he lets go); it creaks each time it breaks free and every creakT s it
 *  turns (the owner, 4.11 16:34: "ושאת החריקה ירגישו בנייד") */
export const DRY100 = Object.freeze({ stick: 0.15, muD: 0.9, muK: 3, creakT: 0.32, wMove: 0.03 });
/** the jobs, in order: open it against its stop; swing it shut into its jamb */
export const TASKS98 = Object.freeze(['open', 'shut']);
export const wrapA98 = (a) => a - 2 * Math.PI * Math.round(a / (2 * Math.PI));
/** the leaf: grab(phi) with his finger's angle round the pivot on the screen; drag(phi) as it goes round (any number of turns); let() —
 *  it swings on; step(dt) → events ('bang', 'touch', 'task', 'done'). th 0 shut … max open. */
export function createSwing98(i = 0, th0 = 0, o = {}) {
  const P = SWING98.L[clamp(i | 0, 0, 1)], M = SWING98.max, D = DRY100;
  const k = { i: clamp(i | 0, 0, 1), th: clamp(+th0 || 0, 0, M), w: 0, held: false, tt: 0, phi: 0, task: 0, bangs: 0, shorts: 0, done: false, q: null, last: null, t: 0, ev: [],
    dry: !!(o && o.dry), creaks: 0, cT: 0, stuck: true };   // ── build 100 ── (dry: no oil in its socket)
  const target = () => (TASKS98[k.task] === 'open' ? M : 0);
  function grab(phi) { if (k.done || !Number.isFinite(phi)) return false; k.held = true; k.phi = phi; k.tt = k.th; return true; }
  function drag(phi) { if (!k.held || !Number.isFinite(phi)) return; k.tt = clamp(k.tt + wrapA98(phi - k.phi), -SWING98.over, M + SWING98.over); k.phi = phi; }
  function let_() { if (!k.held) return; k.held = false; if (Math.abs(k.w) < 0.02 && !atTarget()) { k.shorts++; k.last = 'short'; } }
  const atTarget = () => Math.abs(k.th - target()) < 0.02;
  function step(dt) {
    k.ev = []; if (k.done || !(dt > 0)) return k;
    let r = Math.min(dt, 0.5);
    while (r > 1e-6 && !k.done) { const h = Math.min(0.01, r); r -= h; step1(h); }
    return k;
  }
  function step1(h) {
    k.t += h;
    let a = k.held ? P.k * (k.tt - k.th) - P.c * k.w : -Math.sign(k.w) * Math.min(Math.abs(k.w) / h, P.mu * (k.dry ? D.muK : 1));
    if (k.dry) {   // ── build 100 ── (stick, then a jerk free and a creak; a drag while it moves)
      const pull = k.held ? P.k * (k.tt - k.th) : 0;
      if (Math.abs(k.w) < D.wMove) { if (Math.abs(pull) < D.stick * P.k) { k.w = 0; a = 0; k.stuck = true; } else if (k.stuck) { k.stuck = false; k.creaks++; k.cT = 0; k.ev.push('creak'); } }
      else { if (k.held) a -= Math.sign(k.w) * Math.min(Math.abs(k.w) / h, D.muD); k.cT += h; if (k.cT >= D.creakT) { k.cT = 0; k.creaks++; k.ev.push('creak'); } }
    }
    k.w += a * h; k.th += k.w * h;
    for (const lim of [0, M]) {
      const past = lim === 0 ? k.th < 0 : k.th > M; if (!past) continue;
      const v = Math.abs(k.w); k.th = lim;
      if (v > P.vHard) { k.bangs++; k.w = -k.w * P.e; k.last = 'bang'; k.ev.push('bang'); if (k.held) k.tt = lim + (lim ? -0.12 : 0.12); }
      else { k.w = 0; k.last = 'touch'; k.ev.push('touch'); if (lim === target()) { k.task++; k.ev.push('task'); if (k.task >= TASKS98.length) { k.done = true; k.held = false; const f = k.bangs + (k.dry ? 1 : 0); k.q = f <= 0 ? 1 : f <= 2 ? 0.5 : 0; k.ev.push('done'); } } }
    }
  }
  return { grab, drag, let: let_, step, state: () => k, P, target, task: () => TASKS98[Math.min(k.task, TASKS98.length - 1)] };
}

/* ───────── THE STEPS: half rings of stones round the core, the key stone his ───────── */
/** step k (0 … 14 from the bottom): its ring j = 14 − k, outer radius, middle; top over the court's floor; its stones (odd: one on the axis) */
export const jOf98 = (k) => 14 - k;
export const Rout98 = (j) => 6.5 + 0.5 * j;
export const Rmid98 = (j) => 6.25 + 0.5 * j;
export const top98 = (k) => 0.5 * (k + 1);
export function ringN98(k) { const n = Math.max(7, Math.round((Math.PI * Rmid98(jOf98(k))) / 2.2)); return n % 2 ? n : n + 1; }
/** stone q of ring k: its angle round the arc (−π/2 north … π/2 south, 0 = due east, toward the court), its length along the ring */
export const angle98 = (k, q) => -Math.PI / 2 + ((q + 0.5) * Math.PI) / ringN98(k);
export const key98 = (k) => (ringN98(k) - 1) / 2;
/** the order the crews lay a ring: from both ends toward the middle, the key's gap left for him */
export function order98(k) { const n = ringN98(k), m = key98(k), o = []; for (let d = m; d >= 1; d--) o.push(m - d, m + d); return o.filter((q) => q !== m && q >= 0 && q < n); }
/** the hoist as build 84's, its numbers for a step stone: the gap's sides 0.5 over its bed, the stone 0.5 high, the boom's sheave 6 over it */
export const C98 = Object.freeze({ ...SOREG84, postH: 0.5, H: 0.5, apex: 6.4, hang: 0.9, helpAt: 3 });
/** the hoist's spec for part i (0, 1, 2 — steps, steps2, steps3) and its step s (0 … 4): the first part calm; the second with wind; the third
 *  with gusts, a tighter gap and a slower hand — each step a little tighter than the one before */
export function spec98(i, s, rnd = Math.random) {
  const I = clamp(i | 0, 0, 2), u = clamp(s | 0, 0, 4) / 4, d = clamp(I * 0.4 + u * 0.25, 0, 1);
  const tol = 0.2 - 0.12 * d, sw = (rnd() < 0.5 ? -1 : 1) * (0.15 + 0.3 * d);
  const gusts = I >= 2 ? [{ t: 2.6 + rnd() * 1.5, e: 1, dir: rnd() < 0.5 ? -1 : 1 }, { t: 7 + rnd() * 2, e: 1, dir: rnd() < 0.5 ? -1 : 1 }] : null;
  return { tol, tolZ: tol * 0.8, tolR: 0.24 - 0.14 * d, damp: 0.95 - 0.7 * d, sway0: sw, swayZ0: -sw * 0.4, twist0: (rnd() < 0.5 ? -1 : 1) * (0.35 + 0.45 * d), wind: I >= 1 ? 0.5 + 0.4 * u : 0, gusts, vChip: 1.4 - 0.6 * d, vBreak: (1.4 - 0.6 * d) * SOREG84.vBreakK };
}
export const hoist98 = (spec) => createHoist84(spec, C98);
/** one key stone: knocks on its neighbours, a chipped edge, broken stones → 1 / ½ / 0 */
export function stoneQ98(r) { const j = r.jams | 0, b = r.breaks | 0; return j >= C98.helpAt || b >= 2 ? 0 : j > 0 || r.chip || b ? 0.5 : 1; }
/** a part's grade from its five stones */
export function partQ98(qs) { if (!qs.length) return 0; const m = qs.reduce((a, b) => a + b, 0) / qs.length; return m >= 0.95 ? 1 : m >= 0.55 ? 0.5 : 0; }
/** the steps laid: the parts done (5 each) and the rings closed in the part he is on */
export const laid98 = (partsDone, rings) => clamp((partsDone | 0) * 5 + (rings | 0), 0, 15);
