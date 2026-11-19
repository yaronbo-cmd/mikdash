/* ── build 132 ── h132/form-model.js — the rules of work 1 "הקמת התבנית" (spec docs/specs/shlav-09-he.md, עבודה 1). Pure: no three.js,
 * no DOM. LANE A's file.
 *
 * The four walls of the form lie round the yesod; the player first sets the four stakes (the shoulder rods at NW, NE and SW slid in on
 * the yesod's top until they stop, then a tap drives the stake; at SE, where there is no yesod, a tap on the pour's line drives it),
 * then raises the walls. A wall's angle runs 0 (lying) … 90 (upright). The wall's speed follows the thumb's speed with a lag of about
 * 0.6 s (a first-order follow: its angle ends where the thumb's travel says, late — it goes on moving after the thumb stops). When the
 * wall comes to rest (no thumb on it, its speed spent) it is judged:
 *     89.5 … 90.5  → locked, 40 ("מושלם!")
 *     88 … 92      → locked, 20 (92 exactly is here)
 *     over 92 … 97 → the crew pulls it back: locked, 10 (its final score)
 *     under 88     → nothing: it stays where it rests; lifted again
 * A wall that passes 97 while moving falls outward and a board cracks: −20 (form.crack), its patch stays, the wall lies again.
 * Order: a wall with a tongue (N, S) sits only after both walls with the socket (E, W) are locked; else, resting at 88 or more, it does
 * not sit and the crew lowers it again: the streak is broken, no damage.
 * The free trial: the first small lift (from the first grab to that wall's next rest) — whatever it overshoots (past 92 or 97) the crew
 * catches and lowers again, no damage, no penalty, the streak whole.
 * Level 3: the wind. Its signs first (the flag, the ropes, the dust cloud), at WIND.SIGN s after the walls began; the gust at WIND.GUST
 * s, for WIND.DUR s. A wall not locked and raised past WIND.MIN when the gust is on sways (its angle ± its sway); to steady it: touch it
 * and drag against the sway, until it is still; locked then in 88 … 92 it scores 20 (the steadying's row). A sway that carries it past 97
 * cracks a board as any other fall.
 *
 *   FK · WALLS · TONGUE · SOCKET · RODS · fresh(lv) · load(b) · save(S, id) · rodTo(S, k, u) · stakeTap(S, k) · stakesIn(S)
 *   canGrab(S, k) · grab(S, k) · push(S, deg) · release(S) · step(S, dt) → events · shown(S, k) · judge(a) · result(S) · maxPts(lv)
 *   windOn(S) · signOf(S)
 * Units: degrees, seconds. Nothing random (rule 56).
 */
import { starsOf } from './model.js';

/** the work's numbers (spec "החוקים והמספרים"; "לכיוונון": opening values) */
export const FK = Object.freeze({
  LAG: 0.6,                 // (s) the wall's speed follows the thumb's with this lag
  PERF: Object.freeze({ lo: 89.5, hi: 90.5 }),   // 40
  GOOD: Object.freeze({ lo: 88, hi: 92 }),       // 20 (92 exactly belongs here)
  BACK: 97,                 // over 92 up to 97: pulled back, 10; over 97: falls outward
  REST_V: 0.25,             // (deg/s) slower than this with no thumb on it: at rest
  MAXA: 120,                // (the angle's cap while it moves; past BACK it has fallen anyway)
  // (review 132 R6: over the last 15° to upright the wall is a weight that slows — its lag grows gradually up to (1 + K) times, the
  //  drift still to come kept: it ends where the thumb's travel says, only later and more slowly, never an unseen stop)
  BRAKE: Object.freeze({ FROM: 75, TO: 90, K: 1.2 }),
  PTS: Object.freeze({ stake: 10, perf: 40, good: 20, back: 10, steady: 20, crack: -20 }),
  // level 3's wind (לכיוונון): seconds after the walls began (the fourth stake in); how long the gust blows; how high a wall must be
  // to sway; the sway's size (deg), its period (s); how fast a drag against it calms it (deg of sway per deg of the thumb's travel)
  WIND: Object.freeze({ SIGN: 9, GUST: 16, DUR: 11, MIN: 12, AMP: 4.5, PER: 1.7, STEADY: 0.55, STILL: 0.35 }),
});
export const WALLS = Object.freeze(['E', 'W', 'N', 'S']);
export const TONGUE = Object.freeze(['N', 'S']);
export const SOCKET = Object.freeze(['E', 'W']);
/** the stakes: three with a shoulder rod (NW, NE: the north's shoulder; SW: the west's), the south-east on the pour's line */
export const STAKES = Object.freeze(['NW', 'NE', 'SW', 'SE']);
export const RODS = Object.freeze(['NW', 'NE', 'SW']);

/** a resting angle's judgement: 'perf' | 'good' | 'back' (over 92 up to 97) | 'fall' (over 97) | 'low' (under 88) */
export function judge(a) {
  if (a > FK.BACK) return 'fall';
  if (a > FK.GOOD.hi) return 'back';
  if (a >= FK.PERF.lo && a <= FK.PERF.hi) return 'perf';
  if (a >= FK.GOOD.lo) return 'good';
  return 'low';
}

/* ═════════════ the state ═════════════
 * S = { lv, t, tw (s since the walls began, null before), stakes: { k: 0|1 }, rods: { k: u 0…1 }, W: { k: { a, v, st ('lie'|'up'|'lock'),
 *        pts, how, swayA, swayP, swayed, cracks } }, hold: k|null, pend (deg the thumb added since the last step), lift: { k, free }|null,
 *        free (1: the first lift not yet spent), streak, breaks, dmg, ev: [] (the last events), n }
 */
function wall(st) { return { a: st === 'up' ? 90 : 0, v: 0, st: st === 'up' ? 'lock' : 'lie', pts: 0, how: st === 'up' ? 'given' : '', swayA: 0, swayP: 0, swayed: 0, cracks: 0 }; }
export function fresh(lv) {
  lv = Math.max(1, Math.min(3, lv | 0 || 1));
  const given = lv === 1 ? ['E', 'W'] : [];
  const S = { lv, t: 0, tw: null, stakes: {}, rods: {}, W: {}, hold: null, pend: 0, lift: null, free: 1, streak: 0, breaks: 0, orders: 0, dmg: 0, pts: 0, n: 0, ev: [] };
  for (const k of STAKES) S.stakes[k] = 0;
  for (const k of RODS) S.rods[k] = 0;
  for (const k of WALLS) S.W[k] = wall(given.includes(k) ? 'up' : 'lie');
  return S;
}
/** the save's blob: what was reached (a reload resumes it: stakes in, walls locked or lying — a wall in motion lies again) */
export function save(S, id) {
  const W = {}; for (const k of WALLS) { const w = S.W[k]; W[k] = { a: w.st === 'lock' ? +w.a.toFixed(2) : 0, st: w.st === 'lock' ? 'lock' : 'lie', pts: w.pts, how: w.how, swayed: w.swayed, cracks: w.cracks }; }
  return { id, lv: S.lv, stakes: { ...S.stakes }, rods: { ...S.rods }, W, free: S.free, breaks: S.breaks, orders: S.orders, dmg: S.dmg, pts: S.pts, tw: S.tw, n: S.n };
}
export function load(b) {
  const S = fresh(b.lv);
  Object.assign(S.stakes, b.stakes || {}); Object.assign(S.rods, b.rods || {});
  for (const k of WALLS) { const q = (b.W || {})[k]; if (!q) continue; Object.assign(S.W[k], { a: q.a || 0, st: q.st === 'lock' ? 'lock' : 'lie', pts: q.pts | 0, how: q.how || '', swayed: q.swayed | 0, cracks: q.cracks | 0 }); }
  S.free = b.free == null ? 1 : b.free; S.breaks = b.breaks | 0; S.orders = b.orders | 0; S.dmg = b.dmg | 0; S.pts = b.pts | 0; S.tw = b.tw == null ? (stakesIn(S) ? 0 : null) : b.tw; S.n = b.n | 0;
  return S;
}
const evt = (S, e) => { S.ev.push(e); if (S.ev.length > 24) S.ev.shift(); S.n++; return e; };

/* ───────── the stakes ───────── */
export const stakesIn = (S) => STAKES.every((k) => S.stakes[k]);
/** a shoulder rod dragged inward on the yesod's top: it slides only inward and stops at the block's corner (u 1) */
export function rodTo(S, k, u) {
  if (!RODS.includes(k) || S.stakes[k]) return S.rods[k] || 0;
  const v = Math.max(S.rods[k], Math.min(1, +u || 0));
  if (v >= 1 && S.rods[k] < 1) evt(S, { k: 'rodHome', c: k });
  S.rods[k] = v; return v;
}
/** a tap that drives a stake: at a rod's corner once the rod has stopped; at SE on the pour's line any time → { ok, pts } */
export function stakeTap(S, k) {
  if (!STAKES.includes(k) || S.stakes[k]) return { ok: false, pts: 0 };
  if (RODS.includes(k) && S.rods[k] < 1) return { ok: false, pts: 0, why: 'rod' };
  S.stakes[k] = 1; S.pts += FK.PTS.stake; S.streak++;
  evt(S, { k: 'stake', c: k, pts: FK.PTS.stake });
  if (stakesIn(S) && S.tw == null) S.tw = 0;
  return { ok: true, pts: FK.PTS.stake };
}

/* ───────── the walls ───────── */
/** a wall can be taken: the four stakes in, the wall not locked; one thumb at a time */
export function canGrab(S, k) { const w = S.W[k]; return !!w && stakesIn(S) && w.st !== 'lock' && S.hold == null; }
export function grab(S, k) {
  if (!canGrab(S, k)) return false;
  const w = S.W[k]; S.hold = k; S.pend = 0; if (w.st === 'lie') w.st = 'up';
  if (!S.lift || S.lift.k !== k) S.lift = { k, free: S.free ? 1 : 0 };
  return true;
}
/** the thumb's travel since the last step, in degrees (up: +): the act turns its pixels into degrees */
export function push(S, deg) { if (S.hold != null && Number.isFinite(+deg)) S.pend += +deg; }
export function release(S) { if (S.hold == null) return; S.hold = null; }

/** the gust: on from WIND.GUST to WIND.GUST + DUR after the walls began (level 3 only) */
export const windOn = (S) => S.lv === 3 && S.tw != null && S.tw >= FK.WIND.GUST && S.tw < FK.WIND.GUST + FK.WIND.DUR;
/** the signs' strength 0 … 1 (the flag's flapping, the ropes, the dust cloud's nearness): from SIGN to GUST, full in the gust, then out */
export function signOf(S) {
  if (S.lv !== 3 || S.tw == null) return 0; const W = FK.WIND, t = S.tw;
  if (t < W.SIGN) return 0; if (t < W.GUST) return (t - W.SIGN) / (W.GUST - W.SIGN); if (t < W.GUST + W.DUR) return 1;
  return Math.max(0, 1 - (t - W.GUST - W.DUR) / 3);
}
/** the angle the world shows: the wall's own and its sway */
export const shown = (S, k) => { const w = S.W[k]; return w.a + (w.swayA > 0 ? w.swayA * Math.sin(w.swayP) : 0); };

/** one step of the world: the walls follow, sway, fall, rest and are judged. → the step's events */
export function step(S, dt) {
  const out = []; if (!(dt > 0)) return out;
  S.t += dt; if (S.tw != null) S.tw += dt;
  const W9 = FK.WIND, gust = windOn(S), om = (2 * Math.PI) / W9.PER;
  for (const k of WALLS) {
    const w = S.W[k]; if (w.st !== 'up') continue;
    // (the thumb's speed this step, followed with the lag: exact for a speed held over the step, so the angle ends at the thumb's travel)
    const held = S.hold === k, u = held ? S.pend : 0, tgt = u / dt;
    const B9 = FK.BRAKE, f = Math.max(0, Math.min(1, (w.a - B9.FROM) / (B9.TO - B9.FROM))), Lg = FK.LAG * (1 + B9.K * (w.v > 0 ? f : 0)), L0 = w.lag || FK.LAG;
    if (Lg !== L0) w.v = tgt + ((w.v - tgt) * L0) / Lg;   // (the drift still to come, (v − thumb) × lag, kept as the lag grows)
    w.lag = Lg;
    const e = Math.exp(-dt / Lg), v0 = w.v;
    w.v = tgt + (v0 - tgt) * e;
    w.a += tgt * dt + (v0 - tgt) * Lg * (1 - e);
    if (held) S.pend = 0;
    if (w.a < 0) { w.a = 0; w.v = Math.max(0, w.v); }
    if (w.a > FK.MAXA) w.a = FK.MAXA;
    // level 3: the gust sets a raised wall swaying; a drag against the sway calms it
    if (gust && w.swayA === 0 && w.a > W9.MIN) { w.swayA = W9.AMP; w.swayP = 0; w.swayed = 1; out.push(evt(S, { k: 'sway', wall: k })); }
    if (w.swayA > 0) {
      const sv = w.swayA * om * Math.cos(w.swayP);
      if (held && tgt * sv < 0) w.swayA = Math.max(0, w.swayA - W9.STEADY * Math.abs(u));
      w.swayP += om * dt;
      if (w.swayA <= W9.STILL && !gust) { w.swayA = 0; out.push(evt(S, { k: 'still', wall: k })); }
      else if (w.swayA < W9.STILL) w.swayA = W9.STILL;   // (the gust still blows: it keeps a breath of sway until it passes)
    }
    // past 97: it falls outward (the free lift: the crew catches it)
    if (shown(S, k) > FK.BACK) { out.push(fall(S, k)); continue; }
    // at rest: judged
    if (!held && Math.abs(w.v) < FK.REST_V && w.swayA === 0) { const e2 = rest(S, k); if (e2) out.push(e2); }
  }
  return out;
}
function endLift(S, k) { if (S.lift && S.lift.k === k) { if (S.lift.free) S.free = 0; S.lift = null; } }
function lower(S, k) { const w = S.W[k]; w.a = 0; w.v = 0; w.lag = FK.LAG; w.st = 'lie'; w.swayA = 0; if (S.hold === k) S.hold = null; }
function fall(S, k) {
  const w = S.W[k], from = shown(S, k), free = !!(S.lift && S.lift.k === k && S.lift.free);
  lower(S, k); endLift(S, k);
  if (free) return evt(S, { k: 'caught', wall: k, from });
  w.cracks++; S.dmg++; S.streak = 0; S.breaks++;
  return evt(S, { k: 'crack', wall: k, from, pts: FK.PTS.crack });
}
function rest(S, k) {
  const w = S.W[k];
  w.a += w.v * (w.lag || FK.LAG); w.v = 0; w.lag = FK.LAG;   // (the last of its drift: it rests exactly where the thumb's travel says)
  const a = w.a, j = judge(a), free = !!(S.lift && S.lift.k === k && S.lift.free);
  if (j === 'low') { endLift(S, k); return null; }   // (it rests where it is: lifted again)
  if (j === 'fall') return fall(S, k);
  // the order: a tongue wall sits only after both socket walls are locked
  if (TONGUE.includes(k) && !SOCKET.every((q) => S.W[q].st === 'lock')) {
    lower(S, k); endLift(S, k);
    if (free) return evt(S, { k: 'caught', wall: k, from: a, order: 1 });
    S.streak = 0; S.breaks++; S.orders++;
    return evt(S, { k: 'order', wall: k, from: a, pts: 0 });
  }
  if (j === 'back' && free) { lower(S, k); endLift(S, k); return evt(S, { k: 'caught', wall: k, from: a }); }
  endLift(S, k);
  let pts, how;
  if (j === 'back') { pts = FK.PTS.back; how = 'back'; w.a = 90; }
  else if (w.swayed) { pts = FK.PTS.steady; how = 'steady'; }
  else if (j === 'perf') { pts = FK.PTS.perf; how = 'perf'; }
  else { pts = FK.PTS.good; how = 'good'; }
  w.st = 'lock'; w.pts = pts; w.how = how; S.pts += pts;
  if (how === 'perf') S.streak++; else { S.streak = 0; }
  const all = WALLS.every((q) => S.W[q].st === 'lock');
  return evt(S, { k: 'lock', wall: k, at: +a.toFixed(2), how, pts, last: all ? 1 : 0 });
}

/* ───────── the result ───────── */
/** the most a level can score: four stakes, and 40 for each wall he raises (level 1: the two with tongues) */
export const maxPts = (lv) => STAKES.length * FK.PTS.stake + (lv === 1 ? 2 : 4) * FK.PTS.perf;
export const done = (S) => stakesIn(S) && WALLS.every((k) => S.W[k].st === 'lock');
export function result(S) {
  const max = maxPts(S.lv), pts = Math.max(0, S.pts - 20 * S.dmg), q = Math.max(0, Math.min(1, pts / max));
  const perfect = done(S) && !S.dmg && !S.breaks && WALLS.every((k) => ['perf', 'given'].includes(S.W[k].how));
  return { pts, max, q: +q.toFixed(3), stars: starsOf(q), perfect, flags: { 'form.crack': S.dmg, order: S.orders, breaks: S.breaks, walls: Object.fromEntries(WALLS.map((k) => [k, S.W[k].how + ':' + (+S.W[k].a.toFixed(1))])) } };
}
