/* ── build 134 ── h134/model.js — stage 11 "הקרנות" (spec docs/specs/shlav-11-he.md v4, approved for code by ChatGPT on 25.11, by
 * ירון's word "ושאופוס יתחיל לעבוד על 11 אחרי אישור של הצאט"). Pure: no three.js, no DOM.
 * The stage's plan and save, its flow, the flaw registry (two kinds of damage), the loss table, the words.
 *
 * THE PLAN (the director's missions): each STATION is a kind, each with three levels (a level per visit, ירון 18.11):
 *   · work 1 "אריזת הקרנות": orezSE, orezNE, orezNW, orezSW — one station a corner (spec: "עבודה אחת עם ארבע תחנות"), any order;
 *   · work 2 "חילוץ הגופים": chilutzSE … chilutzSW — open only once all four horns are packed (Rambam 2:16, the owner's pick "כמו הרמבם");
 *   · work 3 "שני החוטמים": chotem — at the goldsmith's bench, open from the stage's start;
 *   · the repair of a flawed horn: fixSE … fixSW (not a work of its own: the same level, no level gained; spec "תיקון קרן פגומה").
 * Round 1 = every level-1 station once (4 + 4 + 1); then the stage counts as built (stage 12 opens, even with a flawed horn) and the
 * circuit (the finale) plays once. After round 1 every station of works 1 and 3 is open at its own next level; a replay of a packing
 * goes on at once into the extraction of the same horn at the same new level (spec "ביצוע חוזר": "רצף אחד אוטומטי"), so the
 * extraction stations are not offered alone again. A flawed horn's station offers its repair instead, at the level it was flawed at.
 *
 * The save (G.h134): { v, cur, done, res, plays, best, intro, crews, finale, champion, flaws, bestOf, stash,
 *   horns: { SE: { lv1, lv2, layers, marks }, … }, cups: { on, tests, spare, shelf }, works: { kind: blob } }
 *   · flaws: [{ f, work, lv, corner, layer, side, at }] — kept where they happened (rule 55); a horn is FLAWED while it has a 'pegum' flaw.
 * Units: amot, seconds. Nothing random (rule 56). Every place is the book's (BOOK.s11).
 */
export const CORNERS = Object.freeze(['SE', 'NE', 'NW', 'SW']);
export const LEVELS = Object.freeze([1, 2, 3]);
export const OREZ = Object.freeze(CORNERS.map((c) => 'orez' + c));
export const CHIL = Object.freeze(CORNERS.map((c) => 'chilutz' + c));
export const FIX = Object.freeze(CORNERS.map((c) => 'fix' + c));
export const KINDS = Object.freeze([...OREZ, ...CHIL, 'chotem', ...FIX]);
export const WORK_OF = (k) => (String(k).startsWith('orez') ? 'orez' : String(k).startsWith('chilutz') ? 'chilutz' : String(k).startsWith('fix') ? 'fix' : 'chotem');
export const CORNER_OF = (k) => (/(SE|NE|NW|SW)$/.exec(String(k).replace(/\d+$/, '')) || [])[1] || null;
export const PLAN = Object.freeze(KINDS.flatMap((k) => LEVELS.map((lv) => ({ k, id: k + lv, lv, work: WORK_OF(k), corner: CORNER_OF(k) }))).map((m, i) => Object.freeze({ ...m, n: i })));
export const STAGE_FLOW = Object.freeze([...OREZ, 'chotem', ...CHIL].map((k) => k + 1));
export const MUL = Object.freeze([1, 1, 2, 4]);
export const mulOf = (lv) => MUL[Math.max(1, Math.min(3, lv | 0 || 1))];
export const NEXT_STAGE = 'הכיור';
export const RU = Object.freeze({ SE: 'הדרומית מזרחית', NE: 'המזרחית צפונית', NW: 'הצפונית מערבית', SW: 'המערבית דרומית' });
export const TITLES = Object.freeze({ orez: 'אריזת הקרנות', chilutz: 'חילוץ הגופים', chotem: 'שני החוטמים', fix: 'תיקון קרן' });
export const titleOf = (k) => (WORK_OF(k) === 'chotem' ? TITLES.chotem : `${TITLES[WORK_OF(k)]} · הקרן ${RU[CORNER_OF(k)] || ''}`);
export const WORDS = Object.freeze({ orez: 'ארוזה!', chilutz: 'חלולה!', chotem: 'בבת אחת!', fix: 'שלמה!', quick: 'מושלם!' });
export const LINES = Object.freeze({ stage: 'שלב 11: הקרנות · אריזה, חילוץ הגופים, שני החוטמים' });

/** the loss table (spec "טבלת ההפסד"): label, points at level 1, the kind ('pegum' a flaw that makes the horn flawed; 'look' for looks; 'cup') */
export const LOSS = Object.freeze({
  'orez.fall': ['סדק בשפת הקרן: חלוק נפל אל הסובב', 20, 'pegum'],
  'orez.stain': ['כתם זפת שחור על פני הקרן', 20, 'look'],
  'orez.ridge': ['רכס זפת גבשושי בראש הקרן', 20, 'look'],
  'chilutz.scuff': ['שפשוף בדופן הפנימית', 20, 'look'],
  'chilutz.break': ['שבר בשפה העליונה', 20, 'pegum'],
  'chotem.tear': ['הכסף נקרע: הספל במדף הפסולים', 20, 'cup'],
  'chotem.wide': ['נקב רחב מדי: הספל במדף הפסולים', 20, 'cup'],
  'chotem.scratch': ['שריטה דקה על הספל', 0, 'look'],
});
export const lossPts = (f, lv = 1) => (LOSS[f] ? LOSS[f][1] * mulOf(lv) : 0);
export const isPegum = (x) => !!(x && LOSS[x.f] && LOSS[x.f][2] === 'pegum');

const byId = (id) => PLAN.find((m) => m.id === id) || null;
const better = (a, b) => (a.stars | 0) > (b.stars | 0) || ((a.stars | 0) === (b.stars | 0) && (a.pts | 0) > (b.pts | 0));
const freshHorn = () => ({ packed: 0, cored: 0, lv1: null, lv2: null, layers: null, marks: [], salt: 0, repairLv: 0, rebuilt: 0 });
export function freshH134() {
  const horns = {}; for (const c of CORNERS) horns[c] = freshHorn();
  return { v: 1, cur: null, done: [], res: {}, plays: {}, best: 0, intro: 0, crews: 0, finale: 0, champion: 0, flaws: [], bestOf: {}, stash: null,
    horns, cups: { on: null, tests: 0, spare: 0, shelf: 0, shelfWhy: [] }, works: {}, chain: null };
}

export function createH134(save) {
  const st = save && save.v === 1 ? save : freshH134();
  const F = freshH134();
  for (const [k, v] of Object.entries(F)) if (st[k] === undefined) st[k] = v;
  for (const c of CORNERS) { if (!st.horns[c]) st.horns[c] = freshHorn(); for (const [k, v] of Object.entries(freshHorn())) if (st.horns[c][k] === undefined) st.horns[c][k] = v; }
  if (!Array.isArray(st.flaws)) st.flaws = [];
  if (!st.works || typeof st.works !== 'object') st.works = {};
  if (st.cur && !byId(st.cur)) st.cur = null;
  const d = (id) => st.done.includes(id);
  const roundOne = (k) => !!st.crews || d(k + 1);
  const allPacked = () => OREZ.every(roundOne);
  const M = {
    st,
    get plan() { return PLAN; },
    isDone: d,
    /** a horn is flawed while a 'pegum' flaw of it stands (the salt only hides it) */
    flawed(c) { return st.flaws.some((x) => x.corner === c && isPegum(x)); },
    flawedHorns() { return CORNERS.filter((c) => M.flawed(c)); },
    built(k) { return !!st.crews || LEVELS.some((lv) => d(k + lv)); },
    mission() { return st.cur ? byId(st.cur) : null; },
    levelsDone(kind) { return LEVELS.filter((lv) => d(kind + lv)).length; },
    nextLevel(kind) { return Math.min(3, M.levelsDone(kind) + 1); },
    visitOf(kind) { return byId(kind + M.nextLevel(kind)); },
    finished() { return !!st.crews || STAGE_FLOW.every(d); },
    round() { return M.finished() ? 2 : 1; },
    /** the repair's level: the level the horn was flawed at */
    repairLevel(c) { const x = st.flaws.filter((q) => q.corner === c && isPegum(q)).pop(); return x ? Math.max(1, Math.min(3, x.lv | 0 || 1)) : 1; },
    canDo(m) {
      if (!m) return false;
      if (m.work === 'fix') return M.flawed(m.corner) && m.lv === M.repairLevel(m.corner) && !!st.horns[m.corner].packed;
      if (m.work === 'chilutz') {
        if (M.flawed(m.corner)) return false;
        if (!allPacked()) return false;
        if (M.finished()) return false;   // (after round 1 an extraction comes only after its packing's replay, in one run)
        return m.lv === 1 && !d(m.id);
      }
      if (m.work === 'orez' && M.flawed(m.corner)) return false;   // (the flawed horn's station is its repair)
      if (!M.finished()) return m.lv === 1 && !d(m.id);
      return m.lv === M.nextLevel(m.k);
    },
    /** what the walk offers: round 1 every level-1 station whose needs stand (and a flawed horn's repair); after it each station at its next level */
    open() {
      const fix = FIX.map((k) => byId(k + M.repairLevel(CORNER_OF(k)))).filter((m) => m && M.canDo(m));
      if (!M.finished()) return [...STAGE_FLOW.map(byId).filter((m) => !d(m.id) && M.canDo(m)), ...fix];
      return [...[...OREZ, 'chotem'].map((k) => M.visitOf(k)).filter((m) => M.canDo(m)), ...fix];
    },
    next() { const o = M.open(); return o[0] || null; },
    pick(id) {
      if (st.stash && st.cur) { st.flaws = [...st.flaws, ...st.stash.flaws]; st.stash = null; }
      const m = id ? byId(id) : null; st.cur = m && M.canDo(m) ? m.id : null; st.stash = null;
      if (st.cur && m.work === 'orez' && M.isReplay(m)) {
        // (a replay lifts the second layer: its stains and ridge are set aside while it plays, back if he walks away)
        const out = st.flaws.filter((x) => x.corner === m.corner && (x.layer === 2 || x.f === 'orez.ridge'));
        if (out.length) { st.stash = { k: m.k, flaws: out }; st.flaws = st.flaws.filter((x) => !out.includes(x)); }
      }
      if (st.cur && m.work === 'fix') {
        const out = st.flaws.filter((x) => x.corner === m.corner && x.f !== 'chilutz.scuff');
        if (out.length) { st.stash = { k: m.k, flaws: out }; st.flaws = st.flaws.filter((x) => !out.includes(x)); }
      }
      return M.mission();
    },
    /** a packing played again after round 1 (or after the horn was packed before): its first layer stands, only the second is packed again */
    isReplay(m) { return !!(m && m.work === 'orez' && st.horns[m.corner] && st.horns[m.corner].packed && st.horns[m.corner].cored); },
    nDone() { return STAGE_FLOW.filter(d).length; },
    count() { return [M.nDone(), STAGE_FLOW.length]; },
    levelOf(m) { return m.lv | 0 || 1; },
    shown: null,
    filmOver() { M.shown = null; },
    /* ── the flaw registry ── */
    flaw(f, o = {}) {
      if (!LOSS[f]) return 0;
      const m = M.mission(), lv = o.lv || (m && m.lv) || 1;
      st.flaws.push({ f, work: o.work || (m && m.id) || null, lv, corner: o.corner || (m && m.corner) || null, layer: o.layer | 0, side: o.side || null, at: o.at || null });
      if (isPegum({ f }) && (o.corner || (m && m.corner))) st.horns[o.corner || m.corner].salt = 1;
      return lossPts(f, lv);
    },
    flaws(f) { return st.flaws.filter((x) => !f || x.f === f); },
    hornFlaws(c) { return st.flaws.filter((x) => x.corner === c); },
    salted(c) { const h = st.horns[c]; if (h) h.salt = 2; },
    keep(kind, blob) { if (blob == null) delete st.works[kind]; else st.works[kind] = blob; },
    workOf(kind) { return st.works[kind] || null; },
    resultOf(id) { return st.res[id] || null; },
    /** the end of a mission (the director's) */
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      const r = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), pts: res.pts | 0, flags: res.flags || {}, loss: res.loss | 0 };
      // (the repair: no level gained; the stars of its packing's level only if better — spec "תיקון קרן פגומה")
      const rid = m.work === 'fix' ? 'orez' + m.corner + m.lv : m.id;
      if (!st.res[rid] || better(r, st.res[rid])) st.res[rid] = r;
      const wk = m.work === 'fix' ? 'orez' : m.work; const was = st.bestOf[wk]; if (!was || better(r, was)) st.bestOf[wk] = { id: rid, stars: r.stars, pts: r.pts };
      st.stash = null;
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      if (m.work !== 'fix' && !d(m.id)) st.done.push(m.id);
      delete st.works[m.k];
      st.cur = null; M.shown = m.k;
      return null;
    },
    /** the chained extraction inside a packing's replay or a repair: its own record (the station chilutz<c> at that level) */
    doneChain(c, lv, res = {}) {
      const id = 'chilutz' + c + lv, r = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), pts: res.pts | 0, flags: res.flags || {} };
      if (!st.res[id] || better(r, st.res[id])) st.res[id] = r;
      const was = st.bestOf.chilutz; if (!was || better(r, was)) st.bestOf.chilutz = { id, stars: r.stars, pts: r.pts };
      if (!d(id)) st.done.push(id);
      st.horns[c].cored = 1;
      return id;
    },
    /** the horn's own state as the world draws it */
    horn(c) { return st.horns[c]; },
    championDue() { return !st.champion && [...OREZ, 'chotem'].every((k) => d(k + 3)); },
    /** the links: the first station `want` takes; what it needs before it as the crews' (2 stars) */
    autoTo(want) {
      // (a repair's link, #fixSE2: the corner packed and cored by the crews up to that level, a crack at that level under its salt patch)
      const fx = PLAN.find((m) => m.work === 'fix' && want(m));
      if (fx && !PLAN.some((m) => m.work !== 'fix' && want(m))) {
        const c = fx.corner;
        for (let lv = 1; lv <= fx.lv; lv++) for (const id of ['orez' + c + lv, 'chilutz' + c + lv]) if (!d(id)) { st.done.push(id); st.res[id] = { stars: 2, q: 0.7, pts: 20, flags: { crews: 1 } }; }
        Object.assign(st.horns[c], { packed: 1, cored: 1, lv1: 'crews', salt: 2 });
        if (!M.flawed(c)) st.flaws.push({ f: 'orez.fall', work: 'orez' + c + fx.lv, lv: fx.lv, corner: c, layer: 1, side: null, at: null });
        M.shown = null; st.cur = null; return M.pick(fx.id);
      }
      const off =PLAN.find((m) => m.work !== 'fix' && !d(m.id) && want(m)) || PLAN.find((m) => m.work !== 'fix' && want(m)) || null;
      if (!off) return null;
      const need = [];
      if (off.work === 'chilutz') for (const c of CORNERS) need.push('orez' + c + 1);
      if (off.lv > 1) need.push(off.k + 1);
      if (off.lv > 1 && off.work === 'orez') need.push('chilutz' + off.corner + 1);
      if (off.lv > 1) for (const lv of [2, 3]) if (lv < off.lv) need.push(off.k + lv);
      // (a later level's link must not close round 1 on the page before its own work opens: the rest of round 1 is left open)
      for (const id of need) if (!d(id)) {
        const m = byId(id); st.done.push(id); st.res[id] = { stars: 2, q: 0.7, pts: 20, flags: { crews: 1 } };
        if (m.work === 'orez') { st.horns[m.corner].packed = 1; st.horns[m.corner].lv1 = 'crews'; }
        if (m.work === 'chilutz') st.horns[m.corner].cored = 1;
      }
      M.shown = null;
      st.cur = off.id; st.stash = null;
      return M.mission();
    },
    progress() { return Math.min(1, M.nDone() / STAGE_FLOW.length); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
  };
  return M;
}
/** a save whose old stage 11 (the old game's 'karnot') was done: the new stage stands built by the crews */
export function fromOld(oldDone) { const st = freshH134(); if (oldDone) { st.crews = 1; st.finale = 1; for (const c of CORNERS) { st.horns[c].packed = 1; st.horns[c].cored = 1; st.horns[c].lv1 = st.horns[c].lv2 = 'crews'; } st.cups.on = { crews: 1 }; } return st; }
