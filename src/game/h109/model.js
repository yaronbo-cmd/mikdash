/* ── build 109 ── h109/model.js — stage 01 "שיטוח ההר" in the old world (docs/specs/shlav-01-olam-yashan-he.md, approved 8.11).
 * Pure: no three.js, no DOM. The plan of the stage (the missions in order, where each one opens on the Mount), the grades, the
 * levels, the losses and the save. The director (h109/director.js) runs the missions in the world; the acts (h109/acts/*) play them.
 *
 *   const M = createH109(save?)  → M.st (the save: G.h109) · M.mission() → the open mission | null · M.done(result) → the next one
 *   M.grade(err, win) → 'gold' | 'good' | 'ok' · M.levelOf(mission) → 1..3 · M.progress() → 0..1 (the Mount's build, stages.setStage)
 *   M.sectorGrade(i) → 'מהודר' | 'כשר' | null
 * Every number is amot, seconds or points. The points are the old game's (score.js ACT 10/20/40, streak 50); this file only says
 * which grade an act earned and what a unit's end pays (JOB_END by its stars).
 */

export const H109 = Object.freeze({
  SECTORS: 9,
  ROCKS: 5,                 // small rocks per sector the kohen strikes (the crews strike the rest) — the owner, 8.11: "מסכים"
  BPM: 124,                 // the strike's beat: every 2nd beat (≈ 1 a second)
  GOLD: [0.12, 0.10, 0.09], // the gold window (s) at levels 1..3 (FUN19: ±120 ms at L1, ±90 after)
  GOOD: 0.18,
  HP: [2, 3, 4],            // strikes per small rock at levels 1..3 (+1 on a replay)
  ROPE_SIDES: 2,
  COURSES: 2,
  GREAT_ROLLERS: [6, 9, 12],
  LETTERS: 'לבית התקיעה',
});

// the Mount in world amot (+x east, +z south): the nine sectors round the old boulders (stages.js BOULDERS 0..8; the crews take
// 9..11), the east retaining wall's corner and courses by the crane, the quarry where the great stone is cut, its road, the west
// wall's great course, the south-west corner of the inscription, and the fill behind the east wall where the waste goes.
export const PLACES = Object.freeze({
  rope: [{ a: [236, -150], b: [236, 350], face: [1, 0] }, { a: [-264, -150], b: [236, -150], face: [0, -1] }],
  corner: { x: 252, z: 92, face: [277, 92] },
  course: [{ x: 252, z: 60, face: [277, 60] }, { x: 252, z: 124, face: [277, 124] }],
  quarry: { x: 196, z: -199 },
  greatRoad: [[200, -196], [150, -230], [40, -240], [-80, -230], [-200, -200], [-262, -150]],
  great: { x: -262, z: -150, face: [-300, -150] },
  letters: { x: -276, z: 372, face: [-300, 400] },
  fill: { x: 250, z: -40 },
});

const MISSIONS = () => {
  const L = [];
  L.push({ k: 'rope', id: 'rope', lv: 1 });
  const sector = (s, lv) => { L.push({ k: 'rocks', id: `rocks${s}`, s, lv }); L.push({ k: 'read', id: `read${s}`, s, lv }); L.push({ k: 'pave', id: `pave${s}`, s, lv }); };
  sector(0, 1); sector(1, 1); sector(2, 1);
  L.push({ k: 'waste', id: 'waste1', lv: 1 });
  sector(3, 2);
  L.push({ k: 'corner', id: 'corner', lv: 1 });
  sector(4, 2);
  L.push({ k: 'course', id: 'course0', c: 0, lv: 2 });
  sector(5, 2);
  L.push({ k: 'course', id: 'course1', c: 1, lv: 2 });
  L.push({ k: 'waste', id: 'waste2', lv: 2 });
  sector(6, 3); sector(7, 3);
  L.push({ k: 'great', id: 'great', lv: 3 });
  sector(8, 3);
  L.push({ k: 'waste', id: 'waste3', lv: 3 });
  L.push({ k: 'letters', id: 'letters', lv: 3 });
  return L;
};
export const PLAN = Object.freeze(MISSIONS().map((m, i) => Object.freeze({ ...m, n: i })));
// how much of the Mount each kind of work moves (the stage's progress for stages.setStage: the hill comes down sector by sector)
const WEIGHT = { rope: 1, rocks: 2, read: 1.5, pave: 1.5, waste: 1, corner: 2, course: 2, great: 3, letters: 1 };
const TOTAL = PLAN.reduce((a, m) => a + WEIGHT[m.k], 0);

const RANK = { gold: 2, good: 1, ok: 0 };
export const GRADE_N = { gold: 'מהודר', good: 'כשר', ok: 'כשר' };

/** a fresh save */
export function freshH109() {
  return { v: 1, i: 0, done: [], res: {}, rocks: Array.from({ length: H109.SECTORS }, () => Array(H109.ROCKS).fill(-1)), waste: 0, wasteIn: 0, best: 0, plays: {} };
}

export function createH109(save) {
  const st = save && save.v === 1 ? save : freshH109();
  if (!Array.isArray(st.rocks) || st.rocks.length !== H109.SECTORS) st.rocks = freshH109().rocks;
  const M = {
    st,
    get plan() { return PLAN; },
    mission() { return st.i < PLAN.length ? PLAN[st.i] : null; },
    finished() { return st.i >= PLAN.length; },
    /** the level an act plays at: the mission's own, a replay one higher (max 3) */
    levelOf(m) { const n = (st.plays[m.id] | 0); return Math.min(3, (m.lv | 0) + (n > 0 ? 1 : 0)); },
    /** one act graded from its timing error |err| (s) against the level's gold window */
    grade(err, lv = 1) { const a = Math.abs(err), g = H109.GOLD[Math.max(0, Math.min(2, lv - 1))]; return a <= g ? 'gold' : a <= H109.GOOD ? 'good' : 'ok'; },
    /** a mission ends: result { stars 0..3, q 0..1, lost?: bool (counted 0), waste?: n stones to the pile }. → the next mission */
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      st.res[m.id] = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), lost: !!res.lost };
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      if (res.waste > 0) st.waste += res.waste | 0;
      if (m.k === 'waste') { st.wasteIn += st.waste; st.waste = 0; }
      st.done.push(m.id); st.i++;
      // a waste mission with nothing on the pile is skipped (the crews swept it)
      while (M.mission() && M.mission().k === 'waste' && st.waste <= 0) { st.done.push(M.mission().id); st.res[M.mission().id] = { stars: 0, q: 0, skipped: true }; st.i++; }
      return M.mission();
    },
    rockHit(s, r, grade) { const a = st.rocks[s]; if (!a) return; a[r] = Math.max(a[r], RANK[grade] ?? 0); },
    /** the sector's grade from its three works: מהודר when every one earned 3 stars, else כשר (a lost work: נכשל) */
    sectorGrade(s) {
      const ids = [`rocks${s}`, `read${s}`, `pave${s}`]; if (!ids.every((id) => st.res[id])) return null;
      if (ids.some((id) => st.res[id].lost)) return 'נכשל';
      return ids.every((id) => st.res[id].stars >= 3) ? 'מהודר' : 'כשר';
    },
    /** the Mount's build 0..1 */
    progress() { let w = 0; for (const id of st.done) { const m = PLAN.find((x) => x.id === id); if (m) w += WEIGHT[m.k]; } return Math.min(1, w / TOTAL); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
  };
  return M;
}

/** stars from a quality 0..1 (the old game's: ≥ .9 three, ≥ .7 two, else one) */
export const starsOf = (q) => (q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1);
/** the beat grid: the next gold moment (s from now) on every 2nd beat, from a beat period p and the time to the next beat */
export function nextGold(p, toNext) { const P = 2 * p; let t = ((toNext % P) + P) % P; return t; }
