/* ── build 117 ── h109/wedges.js — the wedges struck in rounds (ירון 10.11: "כל יתד נכנסה ישר למקומה בלי ניסיון שני, אפס אתגר";
 * he approved the rounds: "היתדות נשמע מעניין. בוא ננסה"). Pure: no three.js, no DOM. Illustration of the masons' craft (המחשה).
 * The wedges lie in a row along the crack (index order = along it). Each needs NEED blows. The masons' rule: strike them evenly; a
 * wedge two blows ahead of a wedge next to it pulls the crack aside (crooked). From level 2 a wedge owed blows and left unstruck too
 * long trembles, then backs out one blow (loose).
 *   newRound(n) · blow(R, i, t) → { ok, full?, crooked?, done } · tick(R, t, lv) → [{ i, tremble } | { i, out }] · LOOSE_S[lv]
 */
export const NEED = 3;
export const LOOSE_S = Object.freeze([0, 0, 6, 4]);   // (level → seconds unstruck before it trembles; 0: never)
export const TREMBLE_S = 1.2;
export function newRound(n) { return { n, blows: Array(n).fill(0), last: Array(n).fill(0), crooked: 0, loose: 0, crookAt: [], started: false }; }
export function isDone(R) { return R.blows.every((b) => b >= NEED); }
export function blow(R, i, t) {
  if (i < 0 || i >= R.n) return { ok: false };
  if (R.blows[i] >= NEED) return { ok: false, full: true, done: isDone(R) };
  if (!R.started) { R.started = true; R.last.fill(t); }
  R.blows[i]++; R.last[i] = t;
  let crooked = false;
  for (const j of [i - 1, i + 1]) if (j >= 0 && j < R.n && R.blows[i] - R.blows[j] >= 2 && !R.crookAt.includes(i)) { R.crookAt.push(i); R.crooked++; crooked = true; break; }
  return { ok: true, crooked, done: isDone(R) };
}
export function tick(R, t, lv) {
  const lim = LOOSE_S[Math.max(0, Math.min(3, lv | 0))]; const out = [];
  if (!lim || !R.started || isDone(R)) return out;
  for (let i = 0; i < R.n; i++) {
    if (R.blows[i] >= NEED || R.blows[i] <= 0) continue;
    const since = t - R.last[i];
    if (since >= lim + TREMBLE_S) { R.blows[i] = Math.max(0, R.blows[i] - 1); R.loose++; R.last[i] = t; out.push({ i, out: true }); }
    else if (since >= lim) out.push({ i, tremble: true });
  }
  return out;
}
