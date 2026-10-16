/* ─────────────────────────────────────────────────────────────────────────────
 * score.js — HOOK19 (wave 19, the owner's note 6; docs/FUN19.md §4.1): the master score. Every act and every end adds its fixed points;
 * every 10,000 pays one "דינר זהב" (המחשה). Never spent, never lost, buys nothing; its face is the stage where it was earned; the
 * coins give a title on a fixed ladder. Nothing random, nothing subtracted: a miss only ends a gold run.
 *   const S = createScore({ G: () => G, persist, emit, stage: () => 'wall' });
 *   S.add(n, why, { once: 'key' })  → { n, total, coins: [new dinars] }     // n ≥ 0; once: pays only the first time under that key
 *   S.grade('gold' | 'good' | 'ok') → the points of one scoring act (10 / 20 / 40, a gold from the 3rd in a row 50) — registers the streak
 *   S.idle()  → ms since the last act (grade) · S.streak() → the gold run's length
 *   S.get()   → { total, coins, base, next, frac, glow, title, nextTitle, left, unseen }
 *   S.list()  → G.dinars = [{ n, stage, t, seen? }] · S.seen(i) · S.unseen() → the coins whose celebration has not played
 * The save: G.score (a number) · G.dinars (the coins) · G.scf (the once-only flags: welcome, a craft's first time at a stage, a read entry).
 * ──────────────────────────────────────────────────────────────────────────── */
export const MILESTONE = 10000;
/** the scoring act: ok · good · gold, and a gold in a run of 3 or more golds */
export const ACT = { ok: 10, good: 20, gold: 40, streak: 50 };
export const STREAK_FROM = 3;
/** a job's end by its stars; the other fixed bonuses */
export const JOB_END = [0, 50, 100, 200];
export const BONUS = { fresh: 100, course: 250, stage: 1000, read: 500, quiz: 200, welcome: 1000 };
/** the title ladder on the kohen's name (המחשה: UI words): the coins at which each begins */
export const TITLES = [{ at: 1, t: 'פועל' }, { at: 3, t: 'אומן' }, { at: 6, t: 'אומן בכיר' }, { at: 10, t: 'ראש אומנים' }, { at: 15, t: 'בונה הבית' }];
export const titleOf = (n) => { let t = null; for (const x of TITLES) if (n >= x.at) t = x; return t ? t.t : null; };
/** the next title: { at, t, left } (null at the top) */
export const nextTitle = (n) => { for (const x of TITLES) if (n < x.at) return { at: x.at, t: x.t, left: x.at - n }; return null; };
export const fmt = (n) => { const s = String(Math.max(0, Math.floor(+n || 0))); return s.replace(/\B(?=(\d{3})+(?!\d))/g, ','); };

export function createScore(o = {}) {
  const gG = typeof o.G === 'function' ? o.G : () => o.G, st = { streak: 0, t: 0, acts: 0, gold: 0, by: {} };
  const now = typeof o.now === 'function' ? o.now : () => Date.now();
  const num = (v) => (Number.isFinite(+v) && +v > 0 ? Math.floor(+v) : 0);
  /** the saved fields, made when missing (an old save has none) */
  const box = () => {
    const G = gG(); if (!G) return null;
    G.score = num(G.score);
    if (!Array.isArray(G.dinars)) G.dinars = [];
    if (!G.scf || typeof G.scf !== 'object' || Array.isArray(G.scf)) G.scf = {};
    return G;
  };
  const stageNow = () => { try { return (typeof o.stage === 'function' && o.stage()) || ''; } catch (e) { return ''; } };
  /** the coins a total has earned, minus the ones kept: a coin is never lost — a save whose total passed a multiple without one gets it */
  function reconcile(G, quiet) {
    const due = Math.floor(G.score / MILESTONE), made = [];
    while (G.dinars.length < due) { const d = { n: G.dinars.length + 1, stage: stageNow(), t: now() }; G.dinars.push(d); made.push(d); }
    if (quiet) for (const d of made) d.seen = 1;
    return made;
  }
  function add(n, why = '', opt = {}) {
    const G = box(), k = num(n);
    if (!G) return { n: 0, total: 0, coins: [] };
    if (opt && opt.once) { const key = String(opt.once); if (G.scf[key]) return { n: 0, total: G.score, coins: [], again: true }; G.scf[key] = 1; }
    if (!k) return { n: 0, total: G.score, coins: [] };
    G.score += k; st.by[why || '?'] = (st.by[why || '?'] || 0) + k; st.acts++;
    const coins = reconcile(G, false);
    if (typeof o.emit === 'function') { try { o.emit('score', { n: k, why, total: G.score, coin: coins.length }); } catch (e) { /* the game's */ } }
    if (typeof o.persist === 'function') { try { o.persist(); } catch (e) { /* the game's */ } }
    return { n: k, total: G.score, coins };
  }
  /** one scoring act by its grade → its points; a gold run counts from the 3rd gold in a row (any other grade ends it, silently) */
  function grade(g) {
    const t = now();
    if (t - st.t > 8000) st.streak = 0;   // (a long pause: a fresh run — never announced, never a loss)
    st.t = t;
    if (g === 'gold') { st.streak++; st.gold++; return st.streak >= STREAK_FROM ? ACT.streak : ACT.gold; }
    st.streak = 0;
    return g === 'good' ? ACT.good : ACT.ok;
  }
  function get() {
    const G = box(), total = G ? G.score : 0, coins = G ? G.dinars.length : 0, base = Math.floor(total / MILESTONE) * MILESTONE, frac = (total - base) / MILESTONE;
    const nt = nextTitle(coins);
    return { total, coins, base, next: base + MILESTONE, frac, glow: frac >= 0.9, title: titleOf(coins), nextTitle: nt, left: base + MILESTONE - total, unseen: G ? G.dinars.filter((d) => !d.seen).length : 0 };
  }
  return {
    add, grade, get,
    /** a total's worth of coins made at once from a fixture or an old save, quietly (no celebration) */
    sync(quiet = true) { const G = box(); return G ? reconcile(G, quiet) : []; },
    list: () => { const G = box(); return G ? G.dinars.map((d) => ({ ...d })) : []; },
    unseen: () => { const G = box(); return G ? G.dinars.filter((d) => !d.seen).map((d) => ({ ...d })) : []; },
    seen(i) { const G = box(); const d = G && G.dinars[i]; if (d) { d.seen = 1; if (typeof o.persist === 'function') { try { o.persist(); } catch (e) { /* the game's */ } } } return !!d; },
    /** a gold run's length (tests, the music's pitch ladder) · ms since the last scoring act (the coin's celebration waits for a lull) */
    streak: () => st.streak,
    idle: () => (st.t ? now() - st.t : 1e9),
    stats: () => ({ ...st, by: { ...st.by } }),
  };
}
