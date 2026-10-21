/* ─────────────────────────────────────────────────────────────────────────────
 * nudge.js — HOOK19 (wave 19; docs/FUN19.md §4.2 "the tabs that call"): when a tab may call the player, and the lines it says.
 * Only the rules (pure: the clock is injected, so the node test walks hours in a blink); the game decides WHEN a natural pause is
 * (a job's result, a course's end) and WHAT is waiting; ui.nudge() shows it (the mentor's line, the gold arrow for 1.5 s, one pulse).
 *   const N = createNudges({ now })
 *   N.offer(tab, line)  → { ok, why }   ok: show it now (and it is counted). why: 'early' | 'gap' | 'tab' | 'silent'
 *   N.opened(tab)       the player opened the tab: its badge clears, its ignored count restarts
 *   N.stage(id)         a new stage: the silenced tabs may call again
 *   N.warp(ms)          (tests) the clock moves on
 * The rules: never in the first 2 minutes · one at a time and at most one every 4 minutes · each tab at most once in 15 minutes ·
 * two ignored nudges for a tab silence it until the next stage (its badge stays: the badge is the game's, never ours to remove).
 * Nothing is lost by a silence, nothing is paid for opening a tab. The lines are the המחשה of the mentor's voice.
 * ──────────────────────────────────────────────────────────────────────────── */
export const TABS = ['book', 'crews', 'kings', 'daily', 'store'];   // the dock's data-k, in the order of the dock's badges (store: the project)
export const GAP = { first: 120000, any: 240000, tab: 900000 };
export const SILENT_AFTER = 2;
/** the lines (the mentor's voice; a fixed table, never random). {n}: the stage's name */
export const LINES = {
  survey: 'המידה נכנסה לספר מידות. קרא ותקבל ★500',
  book: 'בספר מידות מחכה לך משנה על {n}',
  crews: 'צוות אחד מחכה לך. שלח אותו לחצוב',
  kings: 'הספינה בנמל. בוא לפרוק',
  daily: 'משימה הושלמה! בוא לראות את העלה בגפן',
  grape: 'שלוש משימות הושלמו! בוא לקחת את הענב',
  store: 'נפתח שלב חדש: {n}',
};
export const lineOf = (k, n = '') => String(LINES[k] || '').replace('{n}', n);

export function createNudges(o = {}) {
  const clock = typeof o.now === 'function' ? o.now : () => Date.now();
  let skew = 0;
  const now = () => clock() + skew, t0 = now();
  const S = { last: 0, at: {}, pend: {}, ign: {}, count: 0, stage: '' };
  const why = (w) => ({ ok: false, why: w });
  function offer(tab, line = '') {
    if (!TABS.includes(tab)) return why('tab?');
    const t = now();
    if (t - t0 < GAP.first) return why('early');
    if (S.last && t - S.last < GAP.any) return why('gap');
    if (S.at[tab] && t - S.at[tab] < GAP.tab) return why('tab');
    if ((S.ign[tab] || 0) >= SILENT_AFTER) return why('silent');
    // the last call of this tab was not answered (its tab not opened since): one more ignored — the second one silences it
    if (S.pend[tab]) { S.ign[tab] = (S.ign[tab] || 0) + 1; S.pend[tab] = 0; if (S.ign[tab] >= SILENT_AFTER) return why('silent'); }
    S.last = t; S.at[tab] = t; S.pend[tab] = 1; S.count++;
    return { ok: true, tab, line: String(line || '') };
  }
  return {
    offer,
    opened(tab) { S.pend[tab] = 0; S.ign[tab] = 0; },
    stage(id) { if (id !== S.stage) { S.stage = id; S.ign = {}; S.pend = {}; } },
    warp(ms) { skew += Math.max(0, +ms || 0); },
    state: () => ({ last: S.last, count: S.count, at: { ...S.at }, ign: { ...S.ign }, pend: { ...S.pend }, played: now() - t0 }),
  };
}
