/* ─────────────────────────────────────────────────────────────────────────────
 * hooks/rhythm.js: honest perfect strikes and combo milestones (HOOKS agent, docs/HOOKS.md finding 3).
 *
 * The playtest found that mashing the screen made 88% of strikes "perfect": while the builder swings, only the
 * latest tap is kept, and the latest tap of a burst always lands next to the beat. So the skill layer (the gold
 * ring, the combo ×1.5 → ×3) paid out for not looking at it. Rule now: a strike is perfect only when it was
 * aimed, i.e. fewer than MASH_TAPS taps arrived since the previous strike began (one swing cycle, 0.86 s). A mashed strike still counts as a
 * normal strike (no punishment, GDD §2.1); it just earns no gold. The first time it happens the coach says how
 * the ring works, once. (Rhythm Heaven's lesson: timing is the game, and it is taught by feel, not by text.)
 * ──────────────────────────────────────────────────────────────────────────── */
export const MASH_TAPS = 3;             // 3+ taps for one strike (one swing cycle, 0.86 s) is a burst, not an aimed tap
export const MILESTONES = [3, 6, 10];   // the combo multiplier steps (content.comboMult): ×1.5, ×2, ×3

/** Counts the taps that led to each strike: take() returns the taps since the previous take() (the previous
 *  strike's start) and starts counting again. An aimed player gives 1 (a nervous one 2); a burst gives 3 or more. */
export function createTapMeter() {
  let n = 0;
  return {
    tap() { n++; },
    take() { const k = n; n = 0; return k; },
    reset() { n = 0; },
    get count() { return n; },
  };
}
export const isMash = (tapsForStrike) => tapsForStrike >= MASH_TAPS;

/** The combo reached a new multiplier step (for the milestone flash): the step's index + 1, or 0. */
export function milestone(prev, now) {
  for (let k = MILESTONES.length - 1; k >= 0; k--) if (prev < MILESTONES[k] && now >= MILESTONES[k]) return k + 1;
  return 0;
}
export const MILESTONE_TEXT = ['', 'רצף ×1.5', 'רצף ×2', 'רצף ×3 · יד של אומן'];
