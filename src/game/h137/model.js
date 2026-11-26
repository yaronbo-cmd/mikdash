/* ── build 137 ── h137/model.js — stage 14 "ההיכל" (spec docs/specs/shlav-14-he.md v3, approved by ChatGPT and Gemini 26.11, by the
 * owner 26.11 22:22 UTC "מאשר, לבנות"). Pure: the stage's plan and save, its flow, the flaw registry, the loss table, the words.
 * THE PLAN: three works, each with three levels (a level per visit, ירון 18.11), opened in order (spec "הסדר והחריגים"):
 *   work 1 "מבוך התאים והמסיבה" (taim) first; after it the walls rise by themselves to 62; work 2 "הקצעת קרשי התקרה" (hakzaa); after
 *   it the two ceilings, the upper chamber, the roof and the parapet; the doors hang by themselves; work 3 "הזהבת המים והדלתות" (zahav)
 *   last; then the finale "ההברקה האחרונה" (the last seam, one stroke) and the stage is built (stage 15 opens).
 * After round 1 every work is open at its own next level.
 * The save (G.h137): { v, cur, done, res, plays, best, intro, crews, finale, champion, flaws, bestOf, works: { kind: blob }, walls: 0 … 3
 *   (0 the cells' wing to its frame; 1 the walls to 62 after work 1; 2 the ceilings and the roof after work 2; 3 the doors hung),
 *   planks: [{ i, scars }] (the boards he planed: the nesarim in the ceiling), gilt: { wall: [q…] } (the leaves as he laid them),
 *   corners: [door ids] (the broken corners, kept), seam: grade of the finale }
 * Units: amot, seconds. Nothing random (rule 56). Every place is the book's (BOOK.s14). */
export const LEVELS = Object.freeze([1, 2, 3]);
export const KINDS = Object.freeze(['taim', 'hakzaa', 'zahav']);
export const PLAN = Object.freeze(KINDS.flatMap((k) => LEVELS.map((lv) => ({ k, id: k + lv, lv, work: k }))).map((m, i) => Object.freeze({ ...m, n: i })));
export const STAGE_FLOW = Object.freeze(KINDS.map((k) => k + 1));
export const MUL = Object.freeze([1, 1, 2, 4]);
export const mulOf = (lv) => MUL[Math.max(1, Math.min(3, lv | 0 || 1))];
export const NEXT_STAGE = 'קודש הקדשים';
export const TITLES = Object.freeze({ taim: 'מבוך התאים והמסיבה', hakzaa: 'הקצעת קרשי התקרה', zahav: 'הזהבת המים והדלתות' });
export const titleOf = (k) => TITLES[String(k).replace(/\d+$/, '')] || '';
export const WORDS = Object.freeze({ taim: 'כל הפתחים נקיים!', hakzaa: 'שבב אחד ארוך!', zahav: 'מראה של זהב!', havraka: 'ההיכל בזהב!' });
export const LINES = Object.freeze({ stage: 'שלב 14: ההיכל · מבוך התאים, הקצעת התקרה, הזהבת הקירות' });
/** the loss table (spec "טבלת ההפסד"): label, points at level 1, where it stays */
export const LOSS = Object.freeze({
  'taim.corner': ['שבר בפינת אבן של מזוזה', 20, 'jamb'],
  'hakzaa.tear': ['קרע סיבים בלוח', 20, 'plank'],
  'zahav.tear': ['עלה זהב שנקרע', 20, 'wall'],
  'zahav.hole': ['חור בציפוי', 20, 'wall'],
  'zahav.wrinkle': ['קמט עמוק בזהב', 20, 'wall'],
  'zahav.border': ['זהב "אחר הדלתות"', 20, 'wall'],
});
export const lossPts = (f, lv = 1) => (LOSS[f] ? LOSS[f][1] * mulOf(lv) : 0);

const byId = (id) => PLAN.find((m) => m.id === id) || null;
const better = (a, b) => (a.stars | 0) > (b.stars | 0) || ((a.stars | 0) === (b.stars | 0) && (a.pts | 0) > (b.pts | 0));
export function freshH137() {
  return { v: 1, cur: null, done: [], res: {}, plays: {}, best: 0, intro: 0, crews: 0, finale: 0, champion: 0, flaws: [], bestOf: {}, works: {}, walls: 0, planks: [], gilt: {}, corners: [], seam: null };
}
export function createH137(save) {
  const st = save && save.v === 1 ? save : freshH137();
  const F = freshH137();
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
    /** the walls' state wanted by what is done: 0 the frame; 1 to 62 (work 1); 2 ceilings and roof (work 2); 3 the doors (with it) */
    wallsWanted() { if (st.crews || M.finished()) return 3; if (M.built('hakzaa')) return 3; if (M.built('taim')) return 1; return 0; },
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
      st.walls = Math.max(st.walls | 0, M.wallsWanted());
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
      for (const k of KINDS.slice(0, i)) if (!M.built(k)) st.walls = Math.max(st.walls | 0, k === 'taim' ? 1 : 3);
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
/** a save whose old stage 14 (the old game's 'heichal') was done: the new stage stands built by the crews */
export function fromOld(oldDone) { const st = freshH137(); if (oldDone) { st.crews = 1; st.finale = 1; st.walls = 3; st.intro = 1; } return st; }
