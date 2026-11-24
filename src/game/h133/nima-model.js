/* ── build 133 ── h133/nima-model.js — work 4 "מלא נימא" (spec docs/specs/shlav-10-he.md, עבודה 4). Pure: no three.js, no DOM.
 * The last stone of a way on its rollers, brought to the altar's face and stopped a hair from it (Rambam 2:13 "ואויר מעט היה מפסיק בין
 * הכבש למזבח"; Zevachim 62b: the small kevashim "מובדלים מן המזבח מלא נימא"). The same three states as the kevesh's slabs
 * (kevesh-model.js motion): drag along the way, let go, hold to brake; the stone comes down where it stands when the thumb leaves the
 * brake. Near the face the crew's pull is slow (and the act's picture goes close, the time three times slower). The gap is measured
 * level, square to the face, the stone's whole width: over nothing and up to a tenth of a tefach — 40; three tenths — 20; six tenths —
 * 10 (and beyond: the crew brings it close, 10); touching — the stone scratches the altar (−20, it stays).
 *   level 1: the head stone "פורח" of the great kevesh — 4.5 amot straight up the slope to the upper block's south face;
 *   level 2: the last stone of the small kevesh to the sovev — 8.5 amot up its lane to the sovev's south face;
 *   level 3: the last stone of the small kevesh to the yesod — 6 amot west, a turn north, 2 amot to the spur's south face; the turn
 *            taken slowly enough (1.2 amah/s or less) passes the corner without touching it: +20.
 *
 *   NM · WAYS · fresh(lv) · step(S, input, dt) · gapOf(S) · result(S) · save · load
 */
import { motion, mstep, KM } from './kevesh-model.js';

export const NM = Object.freeze({
  TEF: 1 / 6, PERFECT: 0.1 / 6, NEAR: 0.3 / 6, FAR: 0.6 / 6,
  TURN_V: 1.2,
  SLOW: Object.freeze({ d: 1.0, v: 0.6, b: 3 }),   // (the last amah: the crew's pull slow; the act's close-up and its slow time)
  CLOSE: 1.4,                                      // (amot from the face: the close-up begins, the time three times slower)
  PTS: Object.freeze({ perfect: 40, near: 20, far: 10, turn: 20, loss: 20 }),
});
/** each level's way: its length to the face (amot), the turn's place along it (level 3), the stone's mass and the slope's pull */
export const WAYS = Object.freeze({
  1: Object.freeze({ len: 4.5, turn: null, mass: 1.3, g: 2.0, what: 'head' }),
  2: Object.freeze({ len: 8.5, turn: null, mass: 0.8, g: 1.6, what: 'sovev' }),
  3: Object.freeze({ len: 8, turn: 6, mass: 0.8, g: 1.1, what: 'yesod' }),
});

export function fresh(lv) {
  const L = Math.max(1, Math.min(3, lv | 0 || 1)), W = WAYS[L];
  const mo = motion({ len: W.len, mass: W.mass, g: W.g, still: 0.6, brake: KM.BRAKE[2], slow: NM.SLOW, vmax: 4 });
  return { lv: L, way: W, mo, t: 0, touched: false, turn: null, seated: null, free: true, n: 0, pts: 0, max: NM.PTS.perfect + (L === 3 ? NM.PTS.turn : 0), dmg: 0 };
}
/** the gap left to the face (amot) */
export const gapOf = (S) => Math.max(0, S.way.len - S.mo.s);
/** the close-up's moment: the stone near and slow */
export const closeOf = (S) => gapOf(S) <= NM.CLOSE && !S.seated;
/** one step: input { pull, brake } → events: 'touch' (the face: a scratch, or the free trial's catch), 'turn', 'seated' */
export function step(S, input = {}, dt = 1 / 60) {
  const ev = []; if (S.seated) return ev;
  S.t += dt;
  const s0 = S.mo.s;
  for (const e of mstep(S.mo, input, dt)) if (e.k === 'seat') ev.push(...seat(S));
  if (S.seated) return ev;
  // the turn (level 3): passing it fast, the stone touches the corner — slowed, no bonus, no damage
  if (S.way.turn != null && S.turn == null && s0 < S.way.turn && S.mo.s >= S.way.turn) {
    const v = Math.abs(S.mo.v); S.turn = v <= NM.TURN_V ? 'clean' : 'bump';
    if (S.turn === 'bump') S.mo.v = Math.min(S.mo.v, 0.3);
    ev.push({ k: 'turn', clean: S.turn === 'clean', v: +v.toFixed(2) });
  }
  // the face: never through it
  if (S.mo.s >= S.way.len) {
    S.mo.s = S.way.len; const hit = S.mo.v > 0.01; S.mo.v = 0;
    if (hit && !S.touched) {
      if (S.free) ev.push({ k: 'touch', free: true });
      else { S.touched = true; S.dmg++; ev.push({ k: 'touch', loss: NM.PTS.loss }); }
    }
  }
  if (S.mo.s < 0) { S.mo.s = 0; S.mo.v = 0; }
  if (S.mo.pulled && S.free && S.mo.s > 0.3 && !input.pull) S.free = false;   // (the free trial: the first push, until it is let go)
  return ev;
}
function seat(S) {
  if (!S.mo.pulled || S.mo.s < 0.2) return [];
  const g = gapOf(S);
  let grade = null, pts = 0;
  if (g <= 0) { grade = null; pts = 0; }
  else if (g <= NM.PERFECT) { grade = 'gold'; pts = NM.PTS.perfect; }
  else if (g <= NM.NEAR) { grade = 'good'; pts = NM.PTS.near; }
  else { grade = 'ok'; pts = NM.PTS.far; }
  const bonus = S.way.turn != null && S.turn === 'clean' ? NM.PTS.turn : 0;
  S.pts = pts + bonus; S.n++;
  S.seated = { k: 'seated', grade, pts, bonus, gap: +g.toFixed(4), tef: +(g * 6).toFixed(3), touched: S.touched, close: g > NM.FAR ? 'crew' : null };
  return [S.seated];
}
export const done = (S) => !!S.seated;
export function result(S) {
  const R = S.seated || { grade: null, pts: 0, bonus: 0 }, pts = S.pts, q = Math.max(0, Math.min(1, pts / S.max));
  const stars = S.dmg > 0 ? (q >= 0.7 ? 2 : 1) : q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1;
  return { pts, max: S.max, q, stars, perfect: S.dmg === 0 && R.grade === 'gold' && (S.way.turn == null || R.bonus > 0), flags: { gap: R.gap, tef: R.tef, touched: S.touched, turn: S.turn } };
}
export function save(S, id) { return { id, lv: S.lv, free: S.free, touched: S.touched, n: S.n }; }
export function load(b) { if (!b || !b.lv) return null; const S = fresh(b.lv); S.free = !!b.free; S.touched = !!b.touched; S.n = b.n | 0; return S; }
