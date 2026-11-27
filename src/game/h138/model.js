/* ── build 138 ── h138/model.js — stage 15 "קודש הקדשים" (spec docs/specs/shlav-15-he.md v4, approved by ChatGPT and Gemini 27.11, by
 * the owner 27.11 11:18 UTC "מאשר, לבנות"). Pure: the stage's plan and save, its flow, the flaw registry, the loss table, the words.
 * THE PLAN: two works, each with three levels (a level per visit, ירון 18.11), opened in order (spec "הסדר והחריגים"):
 *   work 1 "האומן בתיבה" (teivah) first; after it the parochot hang by themselves; work 2 "להשתיק שתי פרוכות" (parochot).
 *   THE FINALE IS OPEN: the owner (27.11 11:31 UTC) wants the stage's end a crescendo with a flood of dopamine, or straight to the film,
 *   and asked for a brainstorm. Until it is decided the stage ends on the result card after work 2 (no finale of its own).
 * The save (G.h138): { v, cur, done, res, plays, best, intro, crews, finale, champion, flaws, bestOf, works, hung: 0 | 1, creases: [..],
 *   tears: n }. Nothing random (rule 56). Every place is the book's (BOOK.s15). */
export const LEVELS = Object.freeze([1, 2, 3]);
export const KINDS = Object.freeze(['teivah', 'parochot']);
export const PLAN = Object.freeze(KINDS.flatMap((k) => LEVELS.map((lv) => ({ k, id: k + lv, lv, work: k }))).map((m, i) => Object.freeze({ ...m, n: i })));
export const STAGE_FLOW = Object.freeze(KINDS.map((k) => k + 1));
export const MUL = Object.freeze([1, 1, 2, 4]);
export const mulOf = (lv) => MUL[Math.max(1, Math.min(3, lv | 0 || 1))];
export const NEXT_STAGE = 'חנוכת הבית';
export const TITLES = Object.freeze({ teivah: 'האומן בתיבה', parochot: 'להשתיק שתי פרוכות' });
export const titleOf = (k) => TITLES[String(k).replace(/\d+$/, '')] || '';
export const WORDS = Object.freeze({ teivah: 'מתקנין מה שצריך בלבד, ועולין', parochot: 'האמה שקטה וחשוכה' });
export const LINES = Object.freeze({ stage: 'שלב 15: קודש הקדשים · האומן בתיבה, שתי הפרוכות' });
/** the loss table (spec "טבלת ההפסד"): label, points at level 1, where it stays */
export const LOSS = Object.freeze({
  'teivah.crease': ['קמט בריקוע הזהב', 20, 'wall'],
  'teivah.scratch': ['שריטה בזהב', 20, 'wall'],
  'parochot.tear': ['קרע בשפת הפרוכת', 20, 'edge'],
});
export const lossPts = (f, lv = 1) => (LOSS[f] ? LOSS[f][1] * mulOf(lv) : 0);

const byId = (id) => PLAN.find((m) => m.id === id) || null;
const better = (a, b) => (a.stars | 0) > (b.stars | 0) || ((a.stars | 0) === (b.stars | 0) && (a.pts | 0) > (b.pts | 0));
export function freshH138() {
  return { v: 1, cur: null, done: [], res: {}, plays: {}, best: 0, intro: 0, crews: 0, finale: 0, champion: 0, flaws: [], bestOf: {}, works: {}, hung: 0 };
}
export function createH138(save) {
  const st = save && save.v === 1 ? save : freshH138();
  const F = freshH138();
  for (const [k, v] of Object.entries(F)) if (st[k] === undefined) st[k] = v;
  if (!Array.isArray(st.flaws)) st.flaws = [];
  if (!st.works || typeof st.works !== 'object') st.works = {};
  if (st.cur && !byId(st.cur)) st.cur = null;
  const d = (id) => st.done.includes(id);
  const M = {
    st,
    get plan() { return PLAN; },
    isDone: d,
    built(k) { return !!st.crews || LEVELS.some((lv) => d(k + lv)); },
    mission() { return st.cur ? byId(st.cur) : null; },
    levelsDone(kind) { return LEVELS.filter((lv) => d(kind + lv)).length; },
    nextLevel(kind) { return Math.min(3, M.levelsDone(kind) + 1); },
    visitOf(kind) { return byId(kind + M.nextLevel(kind)); },
    finished() { return !!st.crews || STAGE_FLOW.every(d); },
    round() { return M.finished() ? 2 : 1; },
    /** the parochot hang by themselves after work 1 */
    hungWanted() { return st.crews || M.finished() || M.built('teivah') ? 1 : 0; },
    canDo(m) {
      if (!m) return false;
      if (!M.finished()) { const i = KINDS.indexOf(m.k); if (m.lv !== 1 || d(m.id)) return false; return KINDS.slice(0, i).every((k) => M.built(k)) || !!st.link; }
      return m.lv === M.nextLevel(m.k);
    },
    open() {
      if (!M.finished()) return STAGE_FLOW.map(byId).filter((m) => !d(m.id) && M.canDo(m));
      return KINDS.map((k) => M.visitOf(k)).filter((m) => M.canDo(m));
    },
    next() { const o = M.open(); return o[0] || null; },
    pick(id) { const m = id ? byId(id) : null; st.cur = m && M.canDo(m) ? m.id : null; return M.mission(); },
    nDone() { return STAGE_FLOW.filter(d).length; },
    count() { return [M.nDone(), STAGE_FLOW.length]; },
    levelOf(m) { return m.lv | 0 || 1; },
    shown: null,
    filmOver() { M.shown = null; },
    flaw(f, o = {}) {
      if (!LOSS[f]) return 0;
      const m = M.mission(), lv = o.lv || (m && m.lv) || 1;
      st.flaws.push({ f, work: o.work || (m && m.id) || null, lv, at: o.at != null ? o.at : null });
      return lossPts(f, lv);
    },
    flaws(f) { return st.flaws.filter((x) => !f || x.f === f); },
    keep(kind, blob) { if (blob == null) delete st.works[kind]; else st.works[kind] = blob; },
    workOf(kind) { return st.works[kind] || null; },
    resultOf(id) { return st.res[id] || null; },
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      const r = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), pts: res.pts | 0, flags: res.flags || {}, loss: res.loss | 0 };
      if (!st.res[m.id] || better(r, st.res[m.id])) st.res[m.id] = r;
      const was = st.bestOf[m.work]; if (!was || better(r, was)) st.bestOf[m.work] = { id: m.id, stars: r.stars, pts: r.pts };
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      if (!d(m.id)) st.done.push(m.id);
      st.hung = Math.max(st.hung | 0, M.hungWanted());
      delete st.works[m.k];
      st.cur = null; M.shown = m.k;
      return null;
    },
    championDue() { return !st.champion && KINDS.every((k) => d(k + 3)); },
    /** the links: the first mission `want` takes; the works before it in the flow (and its lower levels) as the crews' (2 stars) */
    autoTo(want) {
      const off = PLAN.find((m) => !d(m.id) && want(m)) || PLAN.find((m) => want(m)) || null;
      if (!off) return null;
      const need = [];
      const i = KINDS.indexOf(off.k);
      st.link = 1;   // (a work's own link opens it without the works before it done: round 1 stays open, the stage does not close on a link)
      for (const k of KINDS.slice(0, i)) if (!M.built(k)) st.hung = 1;
      for (let lv = 1; lv < off.lv; lv++) need.push(off.k + lv);
      for (const id of need) if (!d(id)) { st.done.push(id); st.res[id] = { stars: 2, q: 0.7, pts: 20, flags: { crews: 1 } }; }
      M.shown = null; st.cur = off.id;
      return M.mission();
    },
    progress() { return Math.min(1, M.nDone() / STAGE_FLOW.length); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
  };
  return M;
}
/** a save whose old stage 15 (the old game's 'kodesh') was done: the new stage stands built by the crews */
export function fromOld(oldDone) { const st = freshH138(); if (oldDone) { st.crews = 1; st.finale = 1; st.hung = 1; st.intro = 1; } return st; }
