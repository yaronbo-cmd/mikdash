/* ── build 131 ── h131/model.js — stage 08 "יסוד המזבח" (spec docs/specs/shlav-08-he.md, approved 17.11). Pure: no three.js, no DOM.
 * The core of the stage's model: the plan and the save, the loss table, the one grading, the sourced lines. Each part's own rules live
 * in its own pure file beside this one (pit-model.js, frame-model.js, pour-model.js), so the three lanes never edit the same file.
 *
 *   H131 · LINES · QUICK · LOSS · lossPts · applyLoss · starsOf · qOf · grade · NEXT_STAGE
 *   PLAN · KINDS · freshH131 · createH131(save) · fromOld(oldDone)   the free-choice face of the director (as h129's and h130's):
 *     the pit and the frame free between them, each in order; the pour after both, in order; the finale after the pour.
 *   The save (G.h131): { v, cur, done, res, plays, best, i, intro, film, crews, marks: [{ f, work, at, n }],
 *     pit: { work, out: [] }, frame: { work }, pour: { work, sections: {}, prep }, finale: { work } }
 *     · `<kind>.work` is the act's own blob while a work is open (M.keep(kind, blob) after every real step; M.workOf(kind) on begin): a
 *       reload in the middle of a work begins it again at the step reached, with what was placed still placed. The director clears it
 *       when the work ends (M.done).
 *     · marks are the damages that stay in the world (rule 55): the world draws each where it happened (`at`: [x, z] in the world, or
 *       the pit's sheet [lx, lz] for 'pit.chip').
 *
 * Units: amot, seconds. Nothing random at play time (rule 56). Every place is the book's (BOOK.s08).
 */
import { BOOK } from '../world/grid.js';

const S8 = BOOK.s08;

/* ───────── the constants ───────── */
export const H131 = Object.freeze({
  FLOOR: S8.floor, TOP: S8.top,
  LOSS: 20, LOSS_BIG: 40,
  // (the stub acts of the parts not yet coded: how long their picture is held before they finish, seconds)
  STUB_SECS: 2.2,
});

/** the next stage, as the spec names it ("לשלב הבא (גוף המזבח)"): the end card after this stage names it */
export const NEXT_STAGE = 'גוף המזבח';

/* ───────── the lines (copied from the spec, docs/specs/shlav-08-he.md, and nowhere else) ───────── */
export const LINES = Object.freeze({
  stage: 'שלב 08: יסוד המזבח · הבור בבית כרם, המלבן, היציקה',
  // "למטה מהבתולה" in simple words (the spec's own, part 1)
  betula: 'בתולה היא אדמה שאף אחד לא נגע בה אף פעם: לא חרשו בה ולא בנו עליה. חופרים עד שמגיעים אליה, ומתחתיה מוציאים אבנים שלמות, שברזל לא נגע בהן.',
  middot34: 'המשנה אומרת שאבני המזבח באות מבקעת בית כרם, ושם "חופרין למטה מהבתולה" (מידות ג, ד)',
  place: 'עין כרם: זיהוי מוצע, לא ודאי',
  rashi: '"דפוס מרובע עשוי מארבע קרשים, וכל אחת ארוכה ל"ב" (רש"י זבחים נד ע"א)',
  rambam216: '"אטום כמין עמוד ואין עושין בו חלל כלל" (רמב"ם בית הבחירה ב, טז)',
  body: '"גוף של עץ או אבן בקרן דרומית מזרחית כמדת היסוד" (רמב"ם בית הבחירה ב, טז)',
  nail: 'פגימת המזבח "כדי שתחגור בה צפורן" (חולין יח ע"א)',
  iron: '"שהברזל נברא לקצר ימיו של אדם, והמזבח נברא להאריך" (מידות ג, ד)',
  holes: 'שני הנקבים בקרן המערבית דרומית (מידות ג, ב)',
  ill: '(המחשה)',
});
/** the quick words (rule 64), per part */
export const QUICK = Object.freeze({
  whole: 'שלמה!', clean: 'נקי!',
  corner: 'במקום!', square: 'רבוע!',
  reached: 'הגיע!', full: 'מלא!', sound: 'צליל מלא!',
  white: 'לבן!', water: 'יורדים!',
});
/** the loss table (spec "טבלת ההפסד"): label and points */
export const LOSS = Object.freeze({
  'pit.chip': ['אבן שנפגמה ונשארה בערימת הפסולות', 20],
  'frame.crack': ['קרש מסגרת שנסדק והוחלף בקרש בגוון אחר', 20],
  'pour.hollow': ['כיס אוויר: המקטע פורק ונוצק שוב, והטלאי נראה', 20],
  'pour.spill': ['תערובת שגלשה מעל קורת העץ והשאירה כתם על הרצפה', 20],
  'pour.reed': ['קנה שנסתם: הצוות החליף אותו ויצק שוב את הפינה', 40],
});
export const lossPts = (flag) => (LOSS[flag] ? LOSS[flag][1] : 0);
/** the score after a loss: never below zero */
export const applyLoss = (score, pts) => Math.max(0, (score | 0) - Math.max(0, pts | 0));

/* ───────── grades (the one system: 40 / 20 / 10; any damage caps the work at 10) ───────── */
export const starsOf = (q) => (q >= 0.9 ? 3 : q >= 0.7 ? 2 : 1);
export const qOf = (pts) => (pts >= 40 ? 1 : pts >= 20 ? 0.75 : 0.5);
export const grade = (dmg, clean) => ((dmg | 0) > 0 ? 10 : clean ? 40 : 20);

/* ═════════════════ the plan and the save ═════════════════ */
const MISSIONS = () => [
  { k: 'pit', id: 'pit1', lv: 1 }, { k: 'pit', id: 'pit2', lv: 2 }, { k: 'pit', id: 'pit3', lv: 3 },
  { k: 'frame', id: 'frame1', lv: 1 }, { k: 'frame', id: 'frame2', lv: 2 }, { k: 'frame', id: 'frame3', lv: 3 },
  { k: 'pour', id: 'pour1', lv: 1 }, { k: 'pour', id: 'pour2', lv: 2 }, { k: 'pour', id: 'pour3', lv: 3 },
  { k: 'finale', id: 'finale', lv: 1 },
];
export const PLAN = Object.freeze(MISSIONS().map((m, i) => Object.freeze({ ...m, n: i })));
export const KINDS = Object.freeze(['pit', 'frame', 'pour', 'finale']);
/** what each work waits for (every id listed done) */
export const NEEDS = Object.freeze({
  pit2: ['pit1'], pit3: ['pit2'], frame2: ['frame1'], frame3: ['frame2'],
  pour1: ['pit3', 'frame3'], pour2: ['pour1'], pour3: ['pour2'], finale: ['pour3'],
});
export function freshH131() {
  return { v: 1, cur: null, done: [], res: {}, plays: {}, best: 0, i: 0, intro: 0, film: 0, crews: 0,
    marks: [], pit: { work: null, out: [] }, frame: { work: null }, pour: { work: null, sections: {}, prep: 0 }, finale: { work: null } };
}
export function createH131(save) {
  const st = save && save.v === 1 ? save : freshH131();
  const F = freshH131();
  for (const [k, v] of Object.entries(F)) if (st[k] === undefined) st[k] = v;
  for (const k of KINDS) { if (!st[k] || typeof st[k] !== 'object') st[k] = F[k]; for (const [q, v] of Object.entries(F[k])) if (st[k][q] === undefined) st[k][q] = v; }
  if (st.cur && !PLAN.some((m) => m.id === st.cur)) st.cur = null;
  // (a pour mark kept before part 3 has its place as {x, z, r}: as [x, z], its radius in n (tenths of an amah), as the finale reads it)
  if (Array.isArray(st.marks)) for (const k of st.marks) if (k && /^pour\./.test(k.f) && k.at && !Array.isArray(k.at) && Number.isFinite(+k.at.x) && Number.isFinite(+k.at.z)) { if (!(k.n > 0) && +k.at.r > 0) k.n = Math.round(+k.at.r * 10); k.at = [+k.at.x, +k.at.z]; }
  const d = (id) => st.done.includes(id);
  const M = {
    st,
    get plan() { return PLAN; },
    isDone: d,
    mission() { return st.cur ? PLAN.find((m) => m.id === st.cur) || null : null; },
    canDo(m) { return !!m && !d(m.id) && (NEEDS[m.id] || []).every(d); },
    open() { return PLAN.filter((m) => M.canDo(m)); },
    pick(id) { const m = id ? PLAN.find((x) => x.id === id) : null; st.cur = m && M.canDo(m) ? m.id : null; return M.mission(); },
    nDone() { return PLAN.filter((m) => d(m.id)).length; },
    count() { return [M.nDone(), PLAN.length]; },
    finished() { return !!st.crews || PLAN.every((m) => d(m.id)); },   // (a save the crews built: the stage stands done, drawn as theirs)
    levelOf(m) { return m.lv | 0 || 1; },
    /** a damage, kept in the save where it happened; returns its points (the director's X.loss takes them) */
    mark(f, work, at, n = 0) { const p = lossPts(f); if (!p) return 0; st.marks.push({ f, work, at: at == null ? null : at, n }); return p; },
    marksOf(f) { return st.marks.filter((x) => !f || x.f === f); },
    /** the open work's own blob (the act saves it after each real step; null when the work starts fresh) */
    workOf(kind) { return (st[kind] && st[kind].work) || null; },
    keep(kind, blob) { if (st[kind]) st[kind].work = blob == null ? null : blob; },
    done(res = {}) {
      const m = M.mission(); if (!m) return null;
      st.res[m.id] = { stars: Math.max(0, Math.min(3, res.stars | 0)), q: +(res.q || 0), pts: res.pts | 0, flags: res.flags || {} };
      st.plays[m.id] = (st.plays[m.id] | 0) + 1;
      if (!d(m.id)) st.done.push(m.id);
      if (st[m.k]) st[m.k].work = null;
      st.cur = null; st.i = st.done.length;
      return null;
    },
    autoTo(want) {
      for (let g = 0; g < PLAN.length + 2; g++) {
        const O = M.open(), hit = O.find(want); if (hit) return M.pick(hit.id);
        const m = O[0]; if (!m) return null;
        st.cur = m.id; M.done({ stars: 2 });
      }
      return null;
    },
    progress() { return Math.min(1, M.nDone() / PLAN.length); },
    streak(n) { if (n > st.best) st.best = n; return st.best; },
  };
  return M;
}
/** a save whose old stage 08 (the game before build 131: the old yesod site) was finished: the new stage "built by the crews" (no
 *  points, every work open to play again as free work: st.crews); else a fresh one. Other stages' progress is never touched here. */
/** the stones he raised whole from the pit (the book's per level), for the stage's end chain — not the old stage's 64 */
export function stonesOf(save) {
  const d = (save && save.done) || [], P = BOOK.s08.pit.stones;
  return ['1', '2', '3'].reduce((n, lv) => n + (d.includes('pit' + lv) ? (P[lv] || []).length : 0), 0);
}
export function fromOld(oldDone) {
  const st = freshH131();
  if (oldDone) st.crews = 1;
  return st;
}
