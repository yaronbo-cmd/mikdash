/* ── build 109 ── h109/model.js — stage 01 "שיטוח ההר" in the old world (docs/specs/shlav-01-olam-yashan-he.md, approved 8.11).
 * Pure: no three.js, no DOM. The plan of the stage (the missions in order, where each one opens on the Mount), the grades, the
 * levels, the losses and the save. The director (h109/director.js) runs the missions in the world; the acts (h109/acts/*) play them.
 *
 *   const M = createH109(save?)  → M.st (the save: G.h109) · M.open() → the works open now · M.pick(id) · M.mission() → the picked one | null
 *   M.done(result) (the picked one done) · M.finished() · M.autoTo(want) (tests)
 *   M.grade(err, win) → 'gold' | 'good' | 'ok' · M.levelOf(mission) → 1..3 · M.progress() → 0..1 (the Mount's build, stages.setStage)
 *   M.sectorGrade(i) → 'מהודר' | 'כשר' | null
 * Every number is amot, seconds or points. The points are the old game's (score.js ACT 10/20/40, streak 50); this file only says
 * which grade an act earned and what a unit's end pays (JOB_END by its stars).
 */

import { BOOK } from '../world/grid.js';
import { layout } from './paving.js';

export const H109 = Object.freeze({
  SECTORS: 9,
  ROCKS: 5,                 // small rocks per sector the kohen strikes (the crews strike the rest) — the owner, 8.11: "מסכים"
  BPM: 124,                 // the strike's beat: every 2nd beat (≈ 1 a second)
  GOLD: [0.12, 0.10, 0.09], // the gold window (s) at levels 1..3 (FUN19: ±120 ms at L1, ±90 after)
  GOOD: 0.18,
  HP: [2, 3, 4],            // strikes per small rock at levels 1..3 (+1 on a replay)
  ROPE_SIDES: 2,
  COURSES: 2,
  LETTERS: 'לבית התקיעה',
});

// the Mount in world amot (+x east, +z south). ── h115 ── (ירון 10.11: "לכל סלע ולכל אבן יש מיקום מוגדר ומדויק נ.צ. בעולם") every
// place is the address book's (game/world/grid.js BOOK): the nine sectors are the kohen's nine cells on the high rock (יב־6 … יד־8),
// the waste goes down the slope into pits, the corner stone is the retaining wall's real south-east corner and the courses are the
// east wall's beside it. (The great stone's quarry, road and course are build 114's until build 116.) ── /h115 ──
export const PLACES = Object.freeze({
  book: BOOK,
  sectors: BOOK.kohen.map((c) => Object.freeze({ x: c.rect.cx, z: c.rect.cz, k: c.k, r: c.r, name: c.name })),
  corner: { x: BOOK.corner.x, z: BOOK.corner.z },
  course: BOOK.courses.map((c) => ({ x: BOOK.corner.x, z: c.z })),
  great: { x: BOOK.great.x, z: BOOK.great.z, end: { x: BOOK.great.endX, z: BOOK.great.endZ } },   // ── h116 ── down the slope ── /h116 ──
  letters: { x: -281, z: 383, face: [-300, 400] },
  pile: { x: BOOK.pile.x, z: BOOK.pile.z },
  pits: BOOK.pits,
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

/* ── h116 ── (build116-brief §D; ירון 10.11: "להמשיך לרצף ולבנות גם מעבר ליחידות הנדרשות, איפה שהגיוני") THE WORLD'S FREE WORKS:
 * beyond the plan, every more of the same work is open in its real place with the same game and points: every rock cell of the
 * square (rocks{s} → read{s}, s ≥ 9, BOOK.sectors), every quarter of a cell he cut (pave{s}q1..q3; pave{s} for a free cell), the east
 * wall's further stretches (course2..course7) and the waste whenever a pile is there (waste4, …). They are not in PLAN: they never
 * count for finished() or progress() and never block. The crews' cutting is the model's too (crewCut): the view only shows it. ── /h116 ── */
const SECT = BOOK.sectors, NK = BOOK.kohen.length;
const AT = new Map(SECT.map((c, s) => [c.k + ',' + c.r, s]));
const KEEP = new Set(BOOK.great.keep.map(([k, r]) => k + ',' + r));
/** the crews' cells in their order (the book's sectors after the kohen's nine) and what each waits for */
export const CREW = SECT.slice(NK).map((c, i) => ({ s: NK + i, k: c.k, r: c.r, need: KEEP.has(c.k + ',' + c.r) ? 'great' : c.k > 13 && c.r >= 5 && c.r <= 7 ? 'read' + (6 + c.r - 5) : null }));
export const FREE_COURSES = 8, FREE_WASTE = 9;
const kindOf = (id) => (/^[a-z]+/.exec(id) || [''])[0];
/** a free work by its id (null: not one) */
export function freeOf(id) {
  let m = /^(rocks|read)(\d+)$/.exec(id || ''); if (m && +m[2] >= NK && +m[2] < SECT.length) return { k: m[1], id, s: +m[2], lv: 3, free: true };
  m = /^pave(\d+)(?:q([0-3]))?$/.exec(id || ''); if (m) { const s = +m[1], q = m[2] != null ? +m[2] : 0; if (s < SECT.length && (s >= NK || q > 0) && !(m[2] != null && q === 0)) return { k: 'pave', id, s, q, lv: 3, free: true }; }
  m = /^course(\d+)$/.exec(id || ''); if (m && +m[1] >= 2 && +m[1] < FREE_COURSES) return { k: 'course', id, c: +m[1], lv: 3, free: true };
  m = /^waste(\d+)$/.exec(id || ''); if (m && +m[1] >= 4 && +m[1] < 4 + FREE_WASTE) return { k: 'waste', id, lv: 3, free: true };
  return null;
}
export const quarterKey = (s, q) => `q${s}_${q}`;
/** a fresh save */
export function freshH109() {
  return { v: 1, i: 0, done: [], res: {}, rocks: Array.from({ length: H109.SECTORS }, () => Array(H109.ROCKS).fill(-1)), waste: 0, wasteIn: 0, best: 0, plays: {}, lay: {} };
}

const FREE_CACHE = {};
export function createH109(save) {
  const st = save && save.v === 1 ? save : freshH109();
  if (!Array.isArray(st.rocks) || st.rocks.length < H109.SECTORS) st.rocks = freshH109().rocks;
  if (!st.lay || typeof st.lay !== 'object') st.lay = {};
  // (a save from before the free choice: its line of works done up to st.i is its done list already)
  if (st.cur && !PLAN.some((m) => m.id === st.cur) && !freeOf(st.cur)) st.cur = null;   // ── h114 ── (each sector's paving as he laid it) ── /h114 ──
  const M = {
    st,
    get plan() { return PLAN; },
    // ── h114 ── (ירון 9.11, rule 54: "שאני אבחר לאן ללכת ומה לעשות מתי שבא לי") the works are not a line: every work whose real
    // prerequisite is done is open at once and he picks one by walking to it. The prerequisites are the building's own: the rope
    // before all (the square is measured first), a sector's rocks → its reading → its paving, the corner → the first course → the
    // second → the great course → the inscription on it, and the waste when there is a pile. The level of a work follows how many
    // of its kind he finished (0–2 → 1, 3–5 → 2, 6+ → 3), not where it is. ── /h114 ──
    /** the picked work (he walked to its stake) | null */
    mission() { return st.cur ? PLAN.find((m) => m.id === st.cur) || M.freeMission(st.cur) : null; },
    isDone(id) { return st.done.includes(id); },
    /** may m be done now (its prerequisites done, itself not) */
    canDo(m) {
      if (!m || st.done.includes(m.id)) return false;
      if (m.free) return M.free().some((x) => x.id === m.id);   // ── h116 ── ── /h116 ──
      const d = (id) => st.done.includes(id);
      switch (m.k) {
        case 'rope': return true;
        // ── h115 ── (the rock is cut from its low east edge inward: a cell opens when the cell east of it is read) ── /h115 ──
        case 'rocks': return d('rope') && (m.s < 3 || d('read' + (m.s - 3)));
        case 'read': return d('rocks' + m.s);
        case 'pave': return d('read' + m.s);
        case 'corner': return d('rope');
        case 'course': return d(m.c ? 'course0' : 'corner');
        case 'great': return d('course1');
        case 'letters': return d('great') && PLAN.every((x) => x.k === 'waste' || x.k === 'letters' || d(x.id));   /* (on the corner's top: the Mount stands) */
        case 'waste': {
          const prev = { waste1: null, waste2: 'waste1', waste3: 'waste2' }[m.id];
          if (prev && !d(prev)) return false;
          const others = PLAN.some((x) => x.k !== 'waste' && !d(x.id));
          return (st.waste | 0) >= (others ? 3 : 1);
        }
        default: return d('rope');
      }
    },
    /** the open works: the plan's in its order, then the free ones (── h116 ──) */
    open() { return PLAN.filter((m) => M.canDo(m)).concat(M.free()); },
    /** he walked to a work's stake (null: he walked away from it) */
    pick(id) { const m = id ? (PLAN.find((x) => x.id === id) || M.freeMission(id)) : null; st.cur = m && M.canDo(m) ? m.id : null; return M.mission(); },
    // ── h116 ── the world's free works (see freeOf) ── /h116 ──
    freeMission(id) { const m = freeOf(id); if (!m) return null; FREE_CACHE[id] = FREE_CACHE[id] || Object.freeze(m); return FREE_CACHE[id]; },
    /** the crews' cut cells now (sectors ≥ 9), in their order: as many as the plan's progress (and the clock) asks, the cells he took
     *  (his free works, the one he walks to) and the cells that wait (the great stone's way, the kohen's rows) left out */
    crewCut() {
      const want = M.crewWant(), out = []; const d = (id) => st.done.includes(id);
      for (const c of CREW) { if (out.length >= want) break; if (d('rocks' + c.s) || st.cur === 'rocks' + c.s) continue; if (c.need && !d(c.need)) continue; out.push(c.s); }
      return out;
    },
    crewWant() { const n = st.done.filter((id) => PLAN.some((m) => m.id === id)).length, f = Math.min(1, n / PLAN.length); return Math.min(CREW.length, 6 + Math.floor((CREW.length - 6) * f) + (st.crewX | 0)); },
    /** is sector s's cell cut (by him or the crews) */
    cellCut(s, crew) { if (st.done.includes('read' + s)) return true; return s >= NK && (crew || M.crewCut()).includes(s); },
    /** his cells: the sectors he read, the oldest first */
    mine() { const L = []; for (const id of st.done) { const m = /^read(\d+)$/.exec(id); if (m) L.push(+m[1]); } return L; },
    /** the free works open now */
    free() {
      const out = [], d = (id) => st.done.includes(id); if (!d('rope')) return out;
      const crew = M.crewCut(), cs = new Set(crew), cut = (s) => d('read' + s) || cs.has(s);
      // every rock cell beside a cut one (not the crews', not the great stone's way before it is down)
      for (let s = NK; s < SECT.length; s++) {
        const c = SECT[s];
        if (d('rocks' + s)) { if (!d('read' + s)) out.push(M.freeMission('read' + s)); continue; }
        if (cs.has(s) || (KEEP.has(c.k + ',' + c.r) && !d('great'))) continue;
        if ([[1, 0], [-1, 0], [0, 1], [0, -1]].some(([a, b]) => { const t = AT.get((c.k + a) + ',' + (c.r + b)); return t != null && cut(t); })) out.push(M.freeMission('rocks' + s));
      }
      // the quarters of his cells not yet laid (the kohen's first quarter is the plan's pave{s})
      for (const s of M.mine()) for (let q = 0; q < 4; q++) {
        if (s < NK && q === 0) continue; if (s < NK && !d('pave' + s)) continue;
        if (st.lay && st.lay[quarterKey(s, q)]) continue;
        out.push(M.freeMission(s >= NK && q === 0 ? 'pave' + s : `pave${s}q${q}`));
      }
      // the east wall on to the north, stretch after stretch
      for (let c = 2; c < FREE_COURSES; c++) { if (d('course' + c)) continue; if (d('course' + (c - 1))) out.push(M.freeMission('course' + c)); break; }
      // the waste: whenever three stones or more lie on the pile once the plan's three are done
      if (d('waste3') && (st.waste | 0) >= 3) for (let n = 4; n < 4 + FREE_WASTE; n++) if (!d('waste' + n)) { out.push(M.freeMission('waste' + n)); break; }
      return out.filter(Boolean);
    },
    finished() { return PLAN.every((m) => st.done.includes(m.id)); },
    /** his own works in the Mount's walls are done (the porticoes rise only then) */
    wallsDone() { return ['corner', 'course0', 'course1', 'great'].every((id) => st.done.includes(id)); },
    /** (tests, the one-minigame page) the open works not passing `want` are done by the crews in the plan's order until one that
     *  passes is open; it is picked. → it | null */
    autoTo(want) {
      for (let g = 0; g < PLAN.length + 2; g++) {
        const O = M.open().filter((m) => !m.free), hit = O.find(want); if (hit) return M.pick(hit.id);   // ── h116 ── (the plan's works only: a free one is never forced) ── /h116 ──
        const m = O[0]; if (!m) return null;
        st.cur = m.id; M.done({ stars: 2 });
      }
      return null;
    },
    /** the level an act plays at: by how many of its kind he finished (the sector works) or the work's own; a replay one higher */
    levelOf(m) {
      const n = (st.plays[m.id] | 0);
      let lv = m.lv | 0;
      if (m.k === 'rocks' || m.k === 'read' || m.k === 'pave' || m.free) { const c = st.done.filter((id) => id !== m.id && kindOf(id) === m.k).length; lv = c < 3 ? 1 : c < 6 ? 2 : 3; }
      return Math.min(3, lv + (n > 0 ? 1 : 0));
    },
    /** one act graded from its timing error |err| (s) against the level's gold window */
    grade(err, lv = 1) { const a = Math.abs(err), g = H109.GOLD[Math.max(0, Math.min(2, lv - 1))]; return a <= g ? 'gold' : a <= H109.GOOD ? 'good' : 'ok'; },
    /** the picked work ends: result { stars 0..3, q 0..1, lost?: bool (counted 0), waste?: n stones to the pile } */
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      st.res[m.id] = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), lost: !!res.lost, ...((res.loss | 0) > 0 ? { loss: res.loss | 0 } : {}) };   // (build 125: the points its damage cost, when it cost any)
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      if (res.waste > 0) st.waste += res.waste | 0;
      if (m.k === 'waste') { st.wasteIn += st.waste; st.waste = 0; }
      if (!st.done.includes(m.id)) st.done.push(m.id);
      st.cur = null;
      // the waste works left when all else is done and the pile is empty are skipped (the crews swept it)
      if ((st.waste | 0) <= 0 && !PLAN.some((x) => x.k !== 'waste' && !st.done.includes(x.id))) for (const x of PLAN) if (x.k === 'waste' && !st.done.includes(x.id)) { st.done.push(x.id); st.res[x.id] = { stars: 0, q: 0, skipped: true }; }
      st.i = st.done.length;
      // ── h116 ── (brief §D2) after every work the crews lay one open quarter of the oldest of his cells (not the one he paved last);
      // the stage done, every open quarter ── /h116 ──
      if (m.k === 'pave') st.lastPaved = m.s;
      M.crewsPave(M.finished() ? 999 : 1);
      return null;
    },
    /** the crews lay n open free quarters of his cells (st.lay[key] = { t, crew }) */
    crewsPave(n = 1) {
      st.lay = st.lay || {}; let k = 0;
      const mine = M.mine(), L = n >= 999 ? mine : mine.slice(0, Math.max(0, mine.length - 2));   // ── h116 ── (his two newest cells stay his to pave) ── /h116 ──
      for (const s of L) {
        if (k >= n) break; if (s === st.lastPaved && n < 999) continue;
        for (let q = 0; q < 4 && k < n; q++) {
          if (s < NK && q === 0 && !st.done.includes('pave' + s)) continue;
          const key = quarterKey(s, q); if (st.lay[key]) continue;
          const L = layout(s * 13 + q * 5 + 1, 1); st.lay[key] = { t: L.tiles.map((t) => [t.w, t.h, t.x, t.y]), crew: 1 }; k++;
        }
      }
      return k;
    },
    rockHit(s, r, grade) { if (!st.rocks[s]) st.rocks[s] = Array(s < NK ? H109.ROCKS : 3).fill(-1); const a = st.rocks[s]; a[r] = Math.max(a[r], RANK[grade] ?? 0); },
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
