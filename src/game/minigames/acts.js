/* ── craftb19 ── acts.js — the scoring act of a craft played in the world (FUN19 §2, binding: "one touch, one act you can see, one
 * answer from the world; the number comes last and lands somewhere"). A model calls act(M, q, o) on its IMPACT frame — a rubbed
 * tile, the saw's cutting stroke, the bob settling on its mark — never on the touch-down. It logs M.acts and pushes ONE fx entry with
 * the act, its sound, its buzz and its "+N": hands.js plays that entry on the same frame, and the world craft's update / act answers
 * in the world on the same frame too (stages.js `// ── craftb19 ──`).
 *   q: 0 ok · 1 good · 2 gold. Points ok 10 · good 20 · gold 40; from the 3rd gold in a row 50 a gold ("קצב!"). A miss never subtracts.
 *   beatQ(level): a rhythm act's grade on the music's beat (FUN19: gold if |impact − beat − 40 ms| ≤ 90 ms, ±120 at L1; good ≤ 180 ms;
 *   no music, or the rhythm setting off → good).
 * No allocation per frame: an act allocates its one record. */
export const PTS = [10, 20, 40], STREAK_PTS = 50, LAT = 0.04;
export const GOLD_WIN = (level) => ((level | 0) <= 0 ? 0.12 : 0.09);

/** the grade of an act landing now, against the music's beat → 0 | 1 | 2 (tests may set globalThis.__CRAFT_BEAT = () => ({ period, toNext })) */
export function beatQ(level = 0) {
  let b = null;
  try { const f = globalThis.__CRAFT_BEAT; if (typeof f === 'function') b = f(); else { const M = globalThis.__BH_MUSIC; b = M && typeof M.beat === 'function' ? M.beat() : null; } } catch (e) { b = null; }
  if (!b || !(b.period > 0) || !Number.isFinite(+b.toNext)) return 1;
  const p = +b.period, to = ((+b.toNext % p) + p) % p, since = p - to;
  const err = Math.min(Math.abs(since - LAT), Math.abs(to + LAT), Math.abs(since + p - LAT));
  return err <= GOLD_WIN(level) ? 2 : err <= 0.18 ? 1 : 0;
}

// ── twin20 ── (the right stick's drag: 1.0 · 1.3 · 1.6 while armed, set by twin.js)
const twin20Power = () => { try { const w = globalThis.__TW_POWER; return w && w.until > performance.now() ? +w.p || 1 : 1; } catch (e) { return 1; } };
// ── /twin20 ──
// ── tools21 ── (the tier of the tool in his hand: ×1.0 · 1.15 · 1.3, set by tools.js use() for the job being played)
export const toolMult = () => { try { const m = +globalThis.__TOOL_MULT; return m > 0 && m < 3 ? m : 1; } catch (e) { return 1; } };
// ── /tools21 ──
/** the act: logs it, pays it (the streak), and pushes its one fx entry. o: { power, x, y (the "+N" in the work's box), sfx, tap, beat, say } */
export function act(M, q, o = {}) {
  q = q >= 2 ? 2 : q >= 1 ? 1 : 0;
  if (o.tap && q > 1) q = 1;                                   // (a tap on a non-tap craft earns at most good)
  if (!Array.isArray(M.acts)) M.acts = [];
  M.goldRun = q === 2 ? (M.goldRun | 0) + 1 : 0;
  const pts = Math.round((q === 2 && M.goldRun >= 3 ? STREAK_PTS : PTS[q]) * toolMult() + 1e-6);   // ── tools21 ── (a better tool pays more)
  const a = { n: M.acts.length + 1, q, pts, power: (o.power == null ? 1 : +o.power) * twin20Power(), t: +M.t || 0, x: o.x == null ? 0.5 : +o.x, y: o.y == null ? 0.4 : +o.y, tap: !!o.tap, beat: !!o.beat, done: false };
  M.acts.push(a);
  M.pts = (M.pts | 0) + pts;
  const say = o.say || (q === 2 && M.goldRun >= 3 ? 'קצב!' : '');
  // (M.juice: the world craft answers this act through juice.hit on the same frame — the "+N", its flight to the score, the sound, the buzz)
  if (M.juice) { a.say = say; M.fx.push({ act: a }); return a; }
  M.fx.push({ act: a, sfx: o.sfx || (q === 2 ? 'perfect' : q === 1 ? 'good' : 'soft'), haptic: q === 2 ? [12, 30, 18] : q === 1 ? 14 : 8, pop: { t: say ? `+${pts} ${say}` : `+${pts}`, x: a.x, y: a.y, kind: q === 2 ? 'good' : '' } });
  return a;
}
/** the bonus at a job's own end (a full panel, a straight cut, a course true): one more "+N" with its word, never graded */
export function bonus(M, pts, say, o = {}) {
  M.pts = (M.pts | 0) + pts;
  if (!Array.isArray(M.bonuses)) M.bonuses = [];
  M.bonuses.push({ pts, say, done: false });   // (the world craft pays it to the master score: score.add)
  M.fx.push({ bonus: { pts, say }, sfx: o.sfx || 'chime', o: { combo: 5 }, haptic: [10, 30, 10, 30, 10], pop: { t: `+${pts} ${say}`, x: o.x == null ? 0.5 : o.x, y: o.y == null ? 0.3 : o.y, kind: 'big' } });
}
/** the model's quality from its acts (the stars): gold 1 · good .82 · ok .6 (hands.js's ring grades, the same scale) */
export function actsQ(M, d = 0.8) {
  const A = M.acts; if (!A || !A.length) return d;
  let s = 0; for (let i = 0; i < A.length; i++) s += A[i].q === 2 ? 1 : A[i].q === 1 ? 0.82 : 0.6;
  return s / A.length;
}
// ── /craftb19 ──
