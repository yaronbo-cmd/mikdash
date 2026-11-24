/* ── build 133 ── h133/model.js — stage 10 "גוף המזבח והכבש" (spec docs/specs/shlav-10-he.md, approved by Claude, ChatGPT and Gemini
 * 24.11, by ירון's word "האיפיון המפורט יאושר על ידי שלושתכם"). Pure: no three.js, no DOM.
 * The core of the stage's model: the plan and the save, the stage's flow, the flaw registry, the loss table, the one grading, the
 * level's multiplier, the words. Each work's own rules live in its own pure file beside this one (nail-model.js, malben-model.js,
 * kevesh-model.js, nima-model.js).
 *
 *   KINDS · PLAN · LEVELS · VISIT · STAGE_FLOW · NEEDS · MUL · LOSS · WORDS · TITLES · NEXT_STAGE
 *   starsOf · qOf · lossPts · freshH133 · createH133(save) · stage(kind, lv, save) · slabOfBad(n) · SLABS_OF
 *
 * THE STAGE'S FLOW (spec "הסדר והחריגים"; ירון 18.11: a level per visit):
 *   · round 1, every work at level 1: 1 (הציפורן) and 2 (המלבן) open from the stage's start; 3 (הכבש) waits for 1 (the kevesh's stones
 *     are checked before they are built in: Rambam 1:14); 4 (מלא נימא) waits for 2 and 3 (the gap is between the kevesh and the altar).
 *     After the four, the stage counts as built and the next opens; the climb (the finale) plays once, alone;
 *   · after round 1 every station is open, each at its own next level (min(3, levels done + 1)); after the last it stays there;
 *   · the per-work links (#nail1 … #nima3) keep every level reachable (M.autoTo): what a work needs before it stands as the crews'.
 *
 * The save (G.h133): { v, cur, done, res, plays, best, i, intro, film, crews, flaws: [{ f, work, lv, n, at, slab, corner, where }],
 *   bestOf, stash, finale, champion, nail: { work }, malben: { work }, kevesh: { work }, nima: { work } }
 *   · flaws stay in the world (rule 55): the loss table's damages, each where it happened. A dark line on a kevesh slab (a flawed stone
 *     sent to the basket in work 1) stays until a play of work 3 re-seats that slab; a lip, a cracked slab, a covered rabuva are work 3's
 *     own and are re-judged on the slabs a later play re-seats ("הושבה טובה מתקנת שפה שנשארה"); a crack on the sovev's step and a
 *     scratch on the altar stay for good (spec "ביצוע חוזר": "עצירה טובה לא מוחקת שריטה ישנה").
 * Units: amot, seconds. Nothing random at play time (rule 56). Every place is the book's (BOOK.s10).
 */
export const KINDS = Object.freeze(['nail', 'malben', 'kevesh', 'nima']);
export const LEVELS = Object.freeze([1, 2, 3]);
export const PLAN = Object.freeze(KINDS.flatMap((k) => LEVELS.map((lv) => ({ k, id: k + lv, lv }))).map((m, i) => Object.freeze({ ...m, n: i })));
export const VISIT = Object.freeze({ first: 1, max: 3 });
export const STAGE_FLOW = Object.freeze(KINDS.map((k) => k + VISIT.first));
/** what each work needs done before it (spec "הסדר והחריגים") */
export const NEEDS = Object.freeze({ nail: Object.freeze([]), malben: Object.freeze([]), kevesh: Object.freeze(['nail']), nima: Object.freeze(['malben', 'kevesh']) });
/** the level's multiplier on everything (spec "המכפיל לפי רמה, על הכול": step, run, damage and the stage's bonuses) */
export const MUL = Object.freeze([1, 1, 2, 4]);
export const mulOf = (lv) => MUL[Math.max(1, Math.min(3, lv | 0 || 1))];
/** the next stage (the end card after this one names it) */
export const NEXT_STAGE = 'הקרנות';
export const TITLES = Object.freeze({ nail: 'הציפורן', malben: 'המלבן במרכז', kevesh: 'הכבש', nima: 'מלא נימא' });
export const ICONS = Object.freeze({ nail: '💅', malben: '🔲', kevesh: '⛰', nima: '🪶' });
/** the full-screen word of a perfect work (spec, each work's "מילת ההצלחה") and the quick word (rule 64) */
export const WORDS = Object.freeze({ nail: 'כשרה!', malben: 'עשרים ושמונה!', kevesh: 'חלק!', nima: 'סביב!', quick: 'מושלם!' });
export const LINES = Object.freeze({ stage: 'שלב 10: גוף המזבח והכבש · הציפורן, המלבן, הכבש, מלא נימא' });

/** the loss table (spec "טבלת ההפסד"): label and points at level 1 (×2 at level 2, ×4 at level 3) */
export const LOSS = Object.freeze({
  'nail.bad': ['אבן פגומה בכבש: קו כהה על לוח', 20],
  'malben.crack': ['סדק בשפת הסובב', 20],
  'kevesh.lip': ['מדרגה: קו צל על הכבש', 20],
  'kevesh.cracked': ['לוח נסדק', 20],
  'kevesh.rabuva': ['הרבובה מכוסה בחלקה', 20],
  'nima.scratch': ['שריטה על פאת המזבח', 20],
});
export const FLAWS = Object.freeze(Object.keys(LOSS));
export const lossPts = (f, lv = 1) => (LOSS[f] ? LOSS[f][1] * mulOf(lv) : 0);

/* ───────── grades (the one system: 40 / 20 / 10 a step; the work's stars from its share of the most it could score) ───────── */
export const starsOf = (q) => (q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1);
export const qOf = (pts, max) => (max > 0 ? Math.max(0, Math.min(1, pts / max)) : 0);

/** which kevesh slab (1 … 6) a flawed stone sent to the basket ends in: the n-th (from 0), in the slabs' order, round and round */
export const slabOfBad = (n) => ((Math.max(0, n | 0) % 6) + 1);
/** the slabs each level of work 3 seats (level 1: the player seats 1–3, the crew 4–6 quickly on the first completion) */
export const SLABS_OF = Object.freeze({ 1: Object.freeze([1, 2, 3]), 2: Object.freeze([1, 2, 3, 4, 5, 6]), 3: Object.freeze([1, 2, 3, 4, 5, 6]) });

export function freshH133() {
  return { v: 1, cur: null, done: [], res: {}, plays: {}, best: 0, i: 0, intro: 0, film: 0, crews: 0, flaws: [], bestOf: {}, stash: null, finale: 0, champion: 0,
    nail: { work: null }, malben: { work: null }, kevesh: { work: null }, nima: { work: null } };
}
const byId = (id) => PLAN.find((m) => m.id === id) || null;
const kindOfFlaw = (x) => String((x && x.f) || '').split('.')[0];
const better = (a, b) => (a.stars | 0) > (b.stars | 0) || ((a.stars | 0) === (b.stars | 0) && (a.pts | 0) > (b.pts | 0));
/** a kind's round-1 needs, deep (kevesh → nail; nima → malben, kevesh, nail) */
export function needsDeep(k) { const out = []; const go = (q) => { for (const n of NEEDS[q] || []) { if (!out.includes(n)) { go(n); out.push(n); } } }; go(k); return out; }

/** the world as a work of `kind` at level `lv` begins it, from the save: what stands (each by its own work, spec "מה עומד בעולם אחרי
 *  כל השלמה ראשונה": every row depends on its own work only) and the flaws so far */
export function stage(kind, lv, save) {
  const st = save || {}, d = st.done || [], L = Math.max(1, Math.min(3, lv | 0 || 1));
  const built = (k) => !!st.crews || d.some((id) => byId(id) && byId(id).k === k);
  const out = { kind, lv: L, stock: built('nail'), upper: built('malben'), ramp: built('kevesh'), head: built('nima'), flaws: ((st.flaws) || []).map((x) => ({ ...x })) };
  if (kind === 'kevesh') out.slabs = SLABS_OF[L].slice();
  return out;
}

export function createH133(save) {
  const st = save && save.v === 1 ? save : freshH133();
  const F = freshH133();
  for (const [k, v] of Object.entries(F)) if (st[k] === undefined) st[k] = v;
  for (const k of KINDS) { if (!st[k] || typeof st[k] !== 'object') st[k] = { work: null }; if (st[k].work === undefined) st[k].work = null; }
  if (!Array.isArray(st.flaws)) st.flaws = [];
  if (!st.bestOf || typeof st.bestOf !== 'object') st.bestOf = {};
  if (st.cur && !byId(st.cur)) st.cur = null;
  const d = (id) => st.done.includes(id);
  const kindDone = (k) => !!st.crews || KINDS.includes(k) && LEVELS.some((lv) => d(k + lv));
  const roundOne = (k) => !!st.crews || d(k + VISIT.first);
  /** flaws a play of `m` sets aside while it plays (they come back if he walks away; replaced by the play's own at its end) */
  const replaced = (m, x) => {
    if (m.k === 'kevesh') { const S = SLABS_OF[m.lv]; return (kindOfFlaw(x) === 'kevesh' && S.includes(x.slab | 0)) || (x.f === 'nail.bad' && S.includes(x.slab | 0)) || (kindOfFlaw(x) === 'kevesh' && x.f === 'kevesh.rabuva'); }
    return false;
  };
  const M = {
    st,
    get plan() { return PLAN; },
    isDone: d,
    built: kindDone,
    mission() { return st.cur ? byId(st.cur) : null; },
    /** round 1's next work in the plan's order whose needs stand (null when round 1 is done) */
    next() { if (st.crews) return null; const id = STAGE_FLOW.find((x) => !d(x) && NEEDS[byId(x).k].every(roundOne)); return id ? byId(id) : null; },
    levelsDone(kind) { return LEVELS.filter((lv) => d(kind + lv)).length; },
    nextLevel(kind) { return Math.min(VISIT.max, M.levelsDone(kind) + VISIT.first); },
    visitOf(kind) { return byId(kind + M.nextLevel(kind)); },
    round() { return M.finished() ? 2 : 1; },
    /** a work can be picked: in round 1 a level-1 work whose needs stand; after round 1 any work whose level 1 is done before it */
    canDo(m) {
      if (!m) return false;
      if (M.finished()) return m.lv === 1 || roundOne(m.k);
      if (m.lv === 1) return !d(m.id) && NEEDS[m.k].every(roundOne);
      return !d(m.id) && roundOne(m.k) && needsDeep(m.k).every(roundOne);
    },
    /** what the walk offers: in round 1 every level-1 work whose needs stand; after it every station at its next level */
    open() { if (!M.finished()) return STAGE_FLOW.map(byId).filter((m) => !d(m.id) && M.canDo(m)); return KINDS.map((k) => M.visitOf(k)); },
    pick(id) {
      if (st.stash && st.cur) { st.flaws = [...st.flaws, ...st.stash.flaws]; st.stash = null; }
      const m = id ? byId(id) : null; st.cur = m && M.canDo(m) ? m.id : null;
      st.stash = null;
      if (st.cur) { const out = st.flaws.filter((x) => replaced(m, x)); if (out.length) { st.stash = { k: m.k, flaws: out }; st.flaws = st.flaws.filter((x) => !replaced(m, x)); } }
      return M.mission();
    },
    nDone() { return STAGE_FLOW.filter(d).length; },
    count() { return [M.nDone(), STAGE_FLOW.length]; },
    finished() { return !!st.crews || STAGE_FLOW.every(d); },
    levelOf(m) { return m.lv | 0 || 1; },
    stageOf(m) { const w = m || M.mission(); return w ? stage(w.k, w.lv, st) : null; },
    shown: null,
    filmOver() { M.shown = null; },
    /* ── the flaw registry ── */
    /** a flaw kept where it happened → its points at the open work's level (the director's X.loss takes them) */
    flaw(f, o = {}) {
      if (!LOSS[f]) return 0;
      const m = M.mission(), lv = o.lv || (m && m.lv) || 1;
      const x = { f, work: o.work || (m && m.id) || null, lv, n: o.n | 0, at: o.at == null ? null : o.at, slab: o.slab | 0, corner: o.corner || null, where: o.where || null };
      if (f === 'nail.bad') x.slab = slabOfBad(st.flaws.filter((q) => q.f === 'nail.bad').length + (st.stash ? st.stash.flaws.filter((q) => q.f === 'nail.bad').length : 0));
      st.flaws.push(x);
      return lossPts(f, lv);
    },
    flaws(f) { return st.flaws.filter((x) => !f || x.f === f); },
    clearFlaws(id) { st.flaws = st.flaws.filter((x) => x.work !== id); },
    workOf(kind) { return (st[kind] && st[kind].work) || null; },
    keep(kind, blob) { if (st[kind]) st[kind].work = blob == null ? null : blob; },
    resultOf(id) { return st.res[id] || null; },
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      const r = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), pts: res.pts | 0, flags: res.flags || {}, loss: res.loss | 0 };
      if (!st.res[m.id] || better(r, st.res[m.id])) st.res[m.id] = r;
      const was = st.bestOf[m.k]; if (!was || better(r, was)) st.bestOf[m.k] = { id: m.id, stars: r.stars, pts: r.pts };
      st.stash = null;   // (the play's own flaws stand: a good seating mends a lip, a new one is the new one)
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      if (!d(m.id)) st.done.push(m.id);
      if (st[m.k]) st[m.k].work = null;
      st.cur = null; st.i = st.done.length; M.shown = m.k;
      return null;
    },
    /** the champion's seal (spec "חותם האלוף"): the last work of the stage done at level 3 — once */
    championDue() { return !st.champion && KINDS.every((k) => d(k + 3)); },
    /** the links: the first work `want` takes; what it needs before it (round 1's works it depends on, and its own level 1) as the crews' */
    autoTo(want) {
      const off = PLAN.find((m) => !d(m.id) && want(m)) || PLAN.find(want) || null;
      if (!off) return null;
      const need = [...needsDeep(off.k).map((k) => k + 1), ...(off.lv > 1 ? [off.k + 1] : [])];
      for (const id of need) if (!d(id)) { st.cur = id; M.done({ stars: 2, pts: 20 }); }
      M.shown = null;
      if (d(off.id) && !M.finished()) { /* (a level played again from its link before round 1 is done) */ st.cur = off.id; st.stash = null; return M.mission(); }
      return M.pick(off.id);
    },
    progress() { return Math.min(1, M.nDone() / STAGE_FLOW.length); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
  };
  return M;
}
/** a save whose old stage 10 (the old game's 'guf') was done: the new stage stands built by the crews */
export function fromOld(oldDone) { const st = freshH133(); if (oldDone) { st.crews = 1; st.finale = 1; } return st; }
