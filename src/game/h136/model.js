/* ── build 136 ── h136/model.js — stage 13 "האולם" (spec docs/specs/shlav-13-he.md v4, approved by ChatGPT and Gemini 26.11 ~00:40 UTC,
 * by the owner 26.11 14:18 UTC "מאשר, לבנות"). Pure: no three.js, no DOM. The stage's plan and save, its flow, the flaw registry, the
 * loss table, the words.
 *
 * THE PLAN: three works, each with three levels (a level per visit, ירון 18.11):
 *   · work 1 "חמש המלתראות" (maltra) and work 2 "כלונסות הארז" (kelonsa) open from the start, in any order (spec "הסדר והחריגים");
 *   · work 3 "שרשראות הזהב" (sharsheret) opens only after both (the walls complete to the ceiling and the roof, the chains are hung);
 *   · round 1 = each work's level 1 once; then the stage counts as built (stage 14 opens) and the finale "שחר בפתח שאין לו דלת" plays once.
 * After round 1 every work is open at its own next level.
 *
 * The save (G.h136): { v, cur, done, res, plays, best, intro, crews, finale, champion, flaws, bestOf, works: { kind: blob },
 *   beams: { i: { yaw, dz } } (each lintel as he landed it), poles: { z: { d, dw, de } } (each pole as he locked it: the lean, the
 *   bearings), crowns: [k…] (the crowns he has seen), walls: 0 | 1 | 2 (the walls' height: 0 to 70; 1 after works 1–2 to the roof) }
 *   · flaws: [{ f, work, lv, at }] — kept where they happened (rule 55): a scratch on a painted lintel, a broken course edge, a
 *     scratched pocket rim, a crack in the plaster, a crushed link.
 * Units: amot, seconds. Nothing random (rule 56). Every place is the book's (BOOK.s13).
 */
export const LEVELS = Object.freeze([1, 2, 3]);
export const KINDS = Object.freeze(['maltra', 'kelonsa', 'sharsheret']);
export const PLAN = Object.freeze(KINDS.flatMap((k) => LEVELS.map((lv) => ({ k, id: k + lv, lv, work: k }))).map((m, i) => Object.freeze({ ...m, n: i })));
export const STAGE_FLOW = Object.freeze(KINDS.map((k) => k + 1));
export const MUL = Object.freeze([1, 1, 2, 4]);
export const mulOf = (lv) => MUL[Math.max(1, Math.min(3, lv | 0 || 1))];
export const NEXT_STAGE = 'ההיכל';
export const TITLES = Object.freeze({ maltra: 'חמש המלתראות', kelonsa: 'כלונסות הארז', sharsheret: 'שרשראות הזהב' });
export const titleOf = (k) => TITLES[String(k).replace(/\d+$/, '')] || '';
export const WORDS = Object.freeze({ maltra: 'אקורד של עץ!', kelonsa: 'לא יבעט!', sharsheret: 'העטרות!', quick: 'מושלם!' });
export const LINES = Object.freeze({ stage: 'שלב 13: האולם · חמש המלתראות, כלונסות הארז, שרשראות הזהב' });

/** the loss table (spec "טבלת ההפסד"): label, points at level 1, where it stays */
export const LOSS = Object.freeze({
  'maltra.scratch': ['שריטה על הקורה המצוירת', 20, 'beam'],
  'maltra.break': ['שבר בשפת הנדבך', 20, 'course'],
  'kelonsa.rim': ['שפת שקע שרוטה', 20, 'pocket'],
  'kelonsa.crack': ['סדק בטיח', 20, 'wall'],
  'sharsheret.link': ['חוליה מעוכה', 20, 'chain'],
});
export const lossPts = (f, lv = 1) => (LOSS[f] ? LOSS[f][1] * mulOf(lv) : 0);

const byId = (id) => PLAN.find((m) => m.id === id) || null;
const better = (a, b) => (a.stars | 0) > (b.stars | 0) || ((a.stars | 0) === (b.stars | 0) && (a.pts | 0) > (b.pts | 0));
export function freshH136() {
  return { v: 1, cur: null, done: [], res: {}, plays: {}, best: 0, intro: 0, crews: 0, finale: 0, champion: 0, flaws: [], bestOf: {}, works: {},
    beams: {}, poles: {}, crowns: [], walls: 0 };
}

export function createH136(save) {
  const st = save && save.v === 1 ? save : freshH136();
  const F = freshH136();
  for (const [k, v] of Object.entries(F)) if (st[k] === undefined) st[k] = v;
  if (!Array.isArray(st.flaws)) st.flaws = [];
  if (!Array.isArray(st.crowns)) st.crowns = [];
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
    /** the walls stand to the roof and the chains hang: works 1 and 2 done (at any level), or the crews' */
    roofed() { return !!st.crews || !!st.linkRoof || (M.built('maltra') && M.built('kelonsa')); },
    canDo(m) {
      if (!m) return false;
      if (m.work === 'sharsheret' && !M.roofed()) return false;
      if (!M.finished()) return m.lv === 1 && !d(m.id);
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
    /* ── the flaw registry ── */
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
      if (M.roofed() && st.walls < 1) st.walls = 1;
      delete st.works[m.k];
      st.cur = null; M.shown = m.k;
      return null;
    },
    championDue() { return !st.champion && KINDS.every((k) => d(k + 3)); },
    /** the links: the first mission `want` takes; what it needs before it as the crews' (2 stars) */
    autoTo(want) {
      const off = PLAN.find((m) => !d(m.id) && want(m)) || PLAN.find((m) => want(m)) || null;
      if (!off) return null;
      const need = [];
      // (a chains' page needs the walls to the roof: the link stands them up — not works 1 and 2 done, so that round 1 stays open and the
      // stage does not close on a link, as stage 12's)
      if (off.work === 'sharsheret') st.linkRoof = 1;
      for (let lv = 1; lv < off.lv; lv++) need.push(off.k + lv);
      for (const id of need) if (!d(id)) { st.done.push(id); st.res[id] = { stars: 2, q: 0.7, pts: 20, flags: { crews: 1 } }; }
      if (M.roofed()) st.walls = Math.max(1, st.walls | 0);
      M.shown = null; st.cur = off.id;
      return M.mission();
    },
    progress() { return Math.min(1, M.nDone() / STAGE_FLOW.length); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
  };
  return M;
}
/** a save whose old stage 13 (the old game's 'ulam') was done: the new stage stands built by the crews */
export function fromOld(oldDone) { const st = freshH136(); if (oldDone) { st.crews = 1; st.finale = 1; st.walls = 1; } return st; }
