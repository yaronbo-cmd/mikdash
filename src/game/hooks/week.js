/* ─────────────────────────────────────────────────────────────────────────────
 * hooks/week.js: the weekly goal (GDD §9 promised it; HOOKS.md finding 10). Pure rules over the save, no DOM.
 *
 * One goal a week, Sunday to Friday (Shabbat is outside the week: nothing is counted and nothing is asked then):
 * finish WEEK.sites sites and bring WEEK.caravans caravans home. Reaching it hangs a cluster on the golden vine
 * (the Mishnah's "אֶשְׁכּוֹל", Middot 3:8) and pays silver. A missed week is simply a new week: nothing is lost,
 * nothing is shamed. The goal sits between the daily tasks (minutes) and the chapters (days): a mid-term rung
 * for the goal-gradient (Kivetz et al. 2006).
 * G.week = {key: 'YYYY-MM-DD' (that week's Sunday), sites, caravans, done}
 * ──────────────────────────────────────────────────────────────────────────── */
export const WEEK = { sites: 2, caravans: 4, reward: { silver: 60 }, cluster: 1 };

const pad = (n) => String(n).padStart(2, '0');
/** The local Sunday that starts the week of `now` ('YYYY-MM-DD'). */
export function weekKey(now) {
  const d = new Date(now);
  const s = new Date(d.getFullYear(), d.getMonth(), d.getDate() - d.getDay(), 12);
  return `${s.getFullYear()}-${pad(s.getMonth() + 1)}-${pad(s.getDate())}`;
}
export const isShabbatDay = (now) => new Date(now).getDay() === 6;

/** The week's record, started fresh when the week changes. */
export function ensureWeek(G, now) {
  const key = weekKey(now);
  if (!G.week || typeof G.week !== 'object' || G.week.key !== key) G.week = { key, sites: 0, caravans: 0, done: false };
  return G.week;
}

/**
 * Count one site finished or one caravan collected. → {done: true, reward} the moment the goal is reached, else null.
 * (Shabbat: not counted. The rules never ask for play on Shabbat.)
 */
export function noteWeek(G, kind, now) {
  if (isShabbatDay(now)) return null;
  const w = ensureWeek(G, now);
  if (w.done) return null;
  if (kind === 'site') w.sites++;
  else if (kind === 'caravan') w.caravans++;
  else return null;
  if (w.sites >= WEEK.sites && w.caravans >= WEEK.caravans) {
    w.done = true;
    for (const [k, v] of Object.entries(WEEK.reward)) G.res[k] = (G.res[k] || 0) + v;
    G.vine.clusters += WEEK.cluster;
    return { done: true, reward: { ...WEEK.reward }, cluster: WEEK.cluster };
  }
  return null;
}

/** For the HUD: {sites, caravans, need, done, frac, shabbat} */
export function weekView(G, now) {
  const w = ensureWeek(G, now);
  const frac = (Math.min(w.sites, WEEK.sites) + Math.min(w.caravans, WEEK.caravans)) / (WEEK.sites + WEEK.caravans);
  return { sites: w.sites, caravans: w.caravans, need: WEEK, done: w.done, frac, shabbat: isShabbatDay(now) };
}
