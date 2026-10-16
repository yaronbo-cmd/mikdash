// ── shift29 ── levels.js — the five shifts of the prototype (docs/WAVE29-BRIEF.md "the contract"; GAME29-PRINCIPLES §2.4).
// stars: [served fraction for ★, for ★★, 'beatRival' for ★★★ (on top of ★★)]. המחשה: the rates are a game's, not the Temple's.
export const ROUND_S = 90;
// ⚑ tuned (SHIFT29A, 12.10): the brief's counts 6/8/10/12/14 were cut to 5/7/8/10/11 — a pilgrim takes ~13–16 s on the real court (the laver
// is 86 amot round the ramp from the altar's east side at the run's 20 amot/s, three acts ~1.5 s each): with 6, ★★ (≥ 85 %) needed all six
// in 90 s, which no measured round came near. The rival from level 2 on −15 % (1.9/2.4/3.0/3.4 → 1.6/2.0/2.6/2.9): level 2's
// 171 was out of reach at ~14 s a pilgrim (6 served ≈ 150–170 with the combo); level 1's 1.4 stays (beaten at 5/6 in a scripted round).
const STARS = [0.6, 0.85, 'beatRival'];
// ── shift30 ── ⚑ back to the brief's counts 6/8/10/12/14 and the rival's 1.4/1.9/2.4/3.0/3.4: on the compact ring (stations.js) a pilgrim's
// walking is ~1.5 s (the scripted player by touch, 5 trips of 0.7–2.4 s at level 1) — the round had room to spare (5/5, 183–222 vs 126) ── /shift30 ──
export const LEVELS = {
  // ── flow31 ── level 1 cannot be lost (WAVE31 FLOW31 (6)): one pilgrim at a time (the next comes when the last is served or left), 45 s of
  // patience, 4 pilgrims, the rival 0.6/s; ★ 2 served · ★★ 3 · ★★★ all 4 and the rival beaten ── /flow31 ──
  1: { n: 1, he: 'משמרת 1 — שחר', types: ['olah'], concurrent: 1, one31: true, patienceS: 45, count: 4, spawnEveryS: 1, rival: { perS: 0.6, noise: 0.2 }, opening: false, event: null, stars: [0.5, 0.75, 'beatRival'], all3: true },
  2: { n: 2, he: 'משמרת 2 — בוקר', types: ['olah', 'ken'], concurrent: 2, patienceS: 22, count: 8, spawnEveryS: 8, rival: { perS: 1.9, noise: 0.25 }, opening: true, event: null, stars: STARS },
  3: { n: 3, he: 'משמרת 3 — עולי רגל', types: ['olah', 'ken', 'mincha'], concurrent: 2, patienceS: 20, count: 10, spawnEveryS: 7, rival: { perS: 2.4, noise: 0.3 }, opening: true, event: null, stars: STARS },
  4: { n: 4, he: 'משמרת 4 — עמוס', types: ['olah', 'ken', 'mincha'], concurrent: 3, patienceS: 18, count: 12, spawnEveryS: 6, rival: { perS: 3.0, noise: 0.3 }, opening: true, event: null, stars: STARS },
  5: { n: 5, he: 'משמרת 5 — ערב חג', types: ['olah', 'ken', 'mincha'], concurrent: 3, patienceS: 16, count: 14, spawnEveryS: 5.5, rival: { perS: 3.4, noise: 0.35 }, opening: true, event: 'coal', stars: STARS },
};
export const MAX_LEVEL = 5;
export const levelOf = (n) => LEVELS[Math.min(MAX_LEVEL, Math.max(1, Math.round(+n || 1)))];
// ── /shift29 ──
