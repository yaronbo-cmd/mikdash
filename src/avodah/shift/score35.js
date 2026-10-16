/* ── fable32 (build 14) ── score35.js — ONE score for the whole game: Phase A's master score (game/score.js: G.score, the דינר זהב every
 * 10,000, the titles) read and written from the Temple day too. The owner (15.10): "נצטרך לשלב את לוח הניקוד משלב א׳… משחקוני ביניים
 * אמיתיים… יעזרו לנו להתקדם בשלב ולצבור ניקוד כללי". So: the day's acts score as Phase A's acts do (ok · good · gold = 10 · 20 · 40),
 * a task of the ממונה 50, a badge 100, a new day 250; the interludes: a board won = a base + 50 a star. The save is Phase A's own
 * (bh_beta2: G.score, G.dinars, G.scf) — nothing new to migrate, and the capsule reads the same in both phases.
 *   const SC = openScore({ emit }) → { add(n, why, opt), grade(g), get(), fmt, G }   (a stub without storage: add() counts in memory)
 * Never a Divine Name. ── /fable32 ── */
import { createScore, ACT, JOB_END, BONUS, fmt } from '../../game/score.js';
import { load, save } from '../../game/state.js';

export const DAYSCORE = Object.freeze({ act: ACT, task: JOB_END[1], badge: 100, day: BONUS.course, tiles: 200, pen: 150, m3: 100, star: 50, lostLamb: 100 });
export { fmt };

let shared = null;
/** the one score object of this page (Phase A's G loaded from its save; kept across the day and the lobby) */
export function openScore(o = {}) {
  if (shared) return shared;
  let G = null;
  try { G = load().G; } catch (e) { G = { score: 0, dinars: [], scf: {} }; }
  const persist = () => { try { save(G); } catch (e) { /* storage: the game keeps running */ } };
  const S = createScore({ G: () => G, persist, emit: (t, d) => { try { o.emit && o.emit(t, d); } catch (e) { /* */ } }, stage: () => 'mikdash' });
  shared = { G, add: (n, why, opt) => S.add(n, why, opt), grade: (g) => S.grade(g), get: () => S.get(), fmt, S };
  return shared;
}
/** the interlude's points: a board won pays its base + 50 a star; a try pays nothing (no guilt, nothing lost) */
export function interludeScore(game, r) {
  if (!r || r.quit || !r.won) return 0;
  const base = DAYSCORE[game] || 100;
  return base + DAYSCORE.star * Math.max(0, Math.min(3, r.stars | 0));
}
/** tests: a fresh score on a given G (no storage) */
export function scoreOn(G, o = {}) { const S = createScore({ G: () => G, emit: o.emit, stage: () => 'mikdash' }); return { G, add: (n, why, opt) => S.add(n, why, opt), grade: (g) => S.grade(g), get: () => S.get(), fmt, S }; }
