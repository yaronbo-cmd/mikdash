/* ─────────────────────────────────────────────────────────────────────────────
 * middot-quiz.js: MIDDOT10 (wave 10), the book's chapter quizzes and its final test, מבחן סיום המסכת. The owner (28.9 21:33):
 * "שכל מי שנכנס ולמד פרק עושה מבחן קצר ומקבל על זה נקודות ובסוף מבחן מסכם ומקבל הרבה נקודות שיהיה מוטיבציה ללמוד בכיף".
 * Pure rules, no DOM (test/middot-quiz.test.mjs). The questions: content/middot-quiz.json (drafts, one mishna each).
 *
 * A chapter is STUDIED when every mishna of it that is unlocked was opened in the book. Its quiz asks up to 5 questions, drawn
 * only from the mishnayot the player read (the least asked first, so a retake brings new ones); 10 points a right answer. The
 * best attempt counts, nothing is ever lost, retakes are free. When all 5 chapter quizzes were taken, מבחן סיום המסכת opens:
 * 10 questions (2 a chapter), 20 points each, and 100 for the siyum the first time, with a title. Silver: 1 for every 5 points,
 * paid once as the points grow (a gentle reward the game already has).
 * State in G.book, beside the book's own {un, read} (state.js), added here lazily so a save from before wave 10 loads as is:
 *   quiz  {'1'..'5': best right answers in one attempt, fin: the final's best}   asked {qid: times asked}
 *   pts   the learning points (derived from the bests)   paid  silver already paid   title  the title earned
 * ──────────────────────────────────────────────────────────────────────────── */
import QZ from '../../content/middot-quiz.json' with { type: 'json' };
import { MIDDOT } from './middot.js';

/** ⚑ the owner's numbers (defaults): points a right answer, the final's, the siyum's bonus, silver per points */
export const RULES = { per: 10, size: 5, finPer: 20, finSize: 10, finPerCh: 2, siyum: 100, silverPer: 5 };
export const TITLES = { done: 'מסיים מסכת מידות', perfect: 'בקי במסכת מידות' };
export const CHAPTERS = [1, 2, 3, 4, 5];
export const CH_HE = ['א', 'ב', 'ג', 'ד', 'ה'];

const okQ = (q) => q && typeof q.id === 'string' && typeof q.m === 'string' && Array.isArray(q.a) && q.a.length >= 2
  && Number.isInteger(q.ok) && q.ok >= 0 && q.ok < q.a.length && typeof q.q === 'string';
export const QUESTIONS = (QZ && Array.isArray(QZ.questions) ? QZ.questions : []).filter(okQ);
const chOf = (mid) => +String(mid).split('.')[0];
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

/** the book with this module's fields (repairs a save from before wave 10, or a damaged one) */
export function ensure(G) {
  if (!isObj(G.book)) G.book = { un: {}, read: {} };
  const B = G.book;
  if (!isObj(B.un)) B.un = {};
  if (!isObj(B.read)) B.read = {};
  if (!isObj(B.quiz)) B.quiz = {};
  for (const k of Object.keys(B.quiz)) { const v = num(B.quiz[k]); if (v === null || v < 0) delete B.quiz[k]; else B.quiz[k] = Math.floor(v); }
  if (!isObj(B.asked)) B.asked = {};
  if (num(B.paid) === null || B.paid < 0) B.paid = 0;
  if (num(B.dpts) === null || B.dpts < 0) B.dpts = 0;
  B.pts = points(B);
  return B;
}
const bookOf = (G) => (G && isObj(G.book) ? G.book : { un: {}, read: {} });
const bestOf = (B, key) => (isObj(B.quiz) ? num(B.quiz[key]) : null);

/** the learning points: the bests only, so they never go down (+ the daily questions' points, which only grow) */
export function points(B) {
  let p = 0;
  for (const c of CHAPTERS) p += RULES.per * (bestOf(B, String(c)) || 0);
  const f = bestOf(B, 'fin');
  if (f !== null) p += RULES.finPer * f + RULES.siyum;
  const d = isObj(B) ? num(B.dpts) : null;
  if (d !== null && d > 0) p += Math.floor(d);
  const w = bestOf(B, 'pl');   // (FUN11) "איפה זה?": the places quiz, its best
  if (w !== null) p += PLACES_Q.per * Math.min(PLACES_Q.size, w);
  return p;
}
/** ⚑ (FUN11, wave 11) "איפה זה?" — the camera flies to a place of the Temple, and he names it: 5 places, 5 points a right name,
 *  the best attempt counts (like a chapter's quiz) */
export const PLACES_Q = { size: 5, per: 5 };
/** the most points there are (for the book's line) */
export const MAX_POINTS = CHAPTERS.length * RULES.per * RULES.size + RULES.finPer * RULES.finSize + RULES.siyum;

/** one chapter (1..5): what is open and read, whether it is studied, its quiz's size and best */
export function chapter(G, c) {
  const B = bookOf(G), un = B.un || {}, rd = B.read || {};
  const ms = MIDDOT.filter((m) => chOf(m.id) === c);
  const open = ms.filter((m) => un[m.id]).map((m) => m.id), read = open.filter((id) => rd[id]);
  const pool = QUESTIONS.filter((q) => chOf(q.m) === c && un[q.m] && rd[q.m]).length;
  const studied = open.length > 0 && read.length === open.length;
  const best = bestOf(B, String(c));
  return {
    c, he: CH_HE[c - 1], total: ms.length, open: open.length, read: read.length, missing: open.length - read.length, studied,
    pool, size: Math.min(RULES.size, pool), ready: studied && pool > 0, best, taken: best !== null,
  };
}
/** the final test: open once all 5 chapter quizzes were taken */
export function final(G) {
  const B = bookOf(G), taken = CHAPTERS.filter((c) => bestOf(B, String(c)) !== null).length;
  const size = CHAPTERS.reduce((n, c) => n + Math.min(RULES.finPerCh, chapter(G, c).pool), 0);
  const best = bestOf(B, 'fin');
  return { taken, open: taken === CHAPTERS.length && size > 0, size, best, done: best !== null, title: B.title || null };
}

/** a seeded random (tests pass one; the game passes Math.random) */
export function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const pickLeast = (list, n, asked, rnd) => list.map((q) => ({ q, k: asked[q.id] || 0, r: rnd() })).sort((a, b) => a.k - b.k || a.r - b.r).slice(0, n).map((x) => x.q);
const bookOrder = (a, b) => a.m.localeCompare(b.m, 'en', { numeric: true }) || QUESTIONS.indexOf(a) - QUESTIONS.indexOf(b);
/** the answers in a fresh order: {q, a: [...], ok} (ok = the right one's new index) */
function shuffled(q, rnd) {
  const idx = q.a.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  return { id: q.id, m: q.m, q: q.q, a: idx.map((i) => q.a[i]), ok: idx.indexOf(q.ok), ref: q.ref, ex: q.ex, draft: q.status !== 'approved' };
}
/** a quiz: which = 1..5 (a chapter) or 'fin'. → [{id, m, q, a, ok, ref, ex}] in the book's order ([] when it is not open) */
export function build(G, which, rnd = Math.random) {
  const B = bookOf(G), un = B.un || {}, rd = B.read || {}, asked = isObj(B.asked) ? B.asked : {};
  const ok = (q) => un[q.m] && rd[q.m];
  let qs = [];
  if (which === 'fin') {
    if (!final(G).open) return [];
    for (const c of CHAPTERS) qs.push(...pickLeast(QUESTIONS.filter((q) => chOf(q.m) === c && ok(q)), RULES.finPerCh, asked, rnd));
  } else {
    const st = chapter(G, +which);
    if (!st.ready) return [];
    qs = pickLeast(QUESTIONS.filter((q) => chOf(q.m) === +which && ok(q)), RULES.size, asked, rnd);
  }
  return qs.sort(bookOrder).map((q) => shuffled(q, rnd));
}

/**
 * An attempt is over: `right` of `n` questions (ids: the questions asked). The best counts; nothing is lost.
 * → {key, right, n, prev, best, improved, gained (points), pts, silver (to pay now), title (new, or null), siyum (the final's first time)}
 */
export function record(G, which, right, n, ids = []) {
  const B = ensure(G), key = which === 'fin' ? 'fin' : which === 'pl' ? 'pl' : String(+which);
  if (key !== 'fin' && key !== 'pl' && !CHAPTERS.includes(+key)) return null;
  right = Math.max(0, Math.min(Math.floor(num(right) || 0), Math.floor(num(n) || 0)));
  for (const id of ids) B.asked[id] = (B.asked[id] || 0) + 1;
  const before = points(B), prev = bestOf(B, key);
  B.quiz[key] = prev === null ? right : Math.max(prev, right);
  let title = null;
  if (key === 'fin') {
    const t = n > 0 && right === n ? TITLES.perfect : TITLES.done;
    if (B.title !== TITLES.perfect && B.title !== t) { B.title = t; title = t; }
  }
  B.pts = points(B);
  const silver = Math.max(0, Math.floor(B.pts / RULES.silverPer) - B.paid);
  B.paid += silver;
  return { key, right, n, prev, best: B.quiz[key], improved: prev === null || right > prev, gained: B.pts - before, pts: B.pts, silver, title, siyum: key === 'fin' && prev === null };
}

/* ───────── שאלת היום (FUN11, wave 11): the daily Middot question, folded into the learning points — one system (wave 10's ⚑
   default). Three a day (the game passes TRAIN.quizPerDay), drawn from the book's own sourced questions: the mishnayot read first,
   then the ones open, then any; the least asked first; the same question all day (seeded by the day, so a reload shows it again).
   A right answer: DAILY.pts learning points, and the book's silver (1 per 5 points) pays through the same path; a wrong one shows
   the right answer and its mishna, and nothing is lost. The day's count stays where the game keeps it, G.quiz {day, n, done}
   (state.js: the daily tasks and the rest card read it). ───────── */
export const DAILY = { perDay: 3, pts: 10 };   // ⚑ the owner's numbers (default: a daily right answer = a chapter quiz's)
const hashStr = (s) => [...String(s)].reduce((a, ch) => (Math.imul(a, 31) + ch.charCodeAt(0)) >>> 0, 7);
function quizDay(G, day) {
  if (!isObj(G.quiz)) G.quiz = { day: '', n: 0, done: {} };
  const Z = G.quiz;
  if (!isObj(Z.done)) Z.done = {};
  if (Z.day !== day) { Z.day = day; Z.n = 0; for (const k of Object.keys(Z.done)) if (!k.endsWith(day)) delete Z.done[k]; }
  if (!(num(Z.n) >= 0)) Z.n = 0;
  return Z;
}
/** how many of today's questions are left */
export function dailyLeft(G, day, perDay = DAILY.perDay) { return G ? Math.max(0, perDay - (quizDay(G, day).n | 0)) : 0; }
/** today's next question, shuffled for the day ({id, m, q, a, ok, ref, ex, draft, tier: 0 read · 1 open · 2 any}), or null */
export function dailyPick(G, day, perDay = DAILY.perDay) {
  if (!G || typeof G !== 'object') return null;
  const B = ensure(G), Z = quizDay(G, day);
  if ((Z.n | 0) >= perDay) return null;
  const un = B.un || {}, rd = B.read || {};
  const tiers = [QUESTIONS.filter((q) => un[q.m] && rd[q.m]), QUESTIONS.filter((q) => un[q.m] && !rd[q.m]), QUESTIONS];
  for (let t = 0; t < tiers.length; t++) {
    const c = tiers[t].filter((q) => !Z.done[q.id + day]);
    if (!c.length) continue;
    const q = pickLeast(c, 1, B.asked, rng(hashStr(`${day}#${Z.n | 0}`)))[0];
    return { ...shuffled(q, rng(hashStr(`${day}:${q.id}`))), tier: t };
  }
  return null;
}
/** the answer to today's question q (as dailyPick gave it; choice = the index shown) → {ok, correct, gained, pts, silver, left} */
export function dailyAnswer(G, q, choice, day, perDay = DAILY.perDay) {
  if (!G || !q || !QUESTIONS.some((x) => x.id === q.id)) return { ok: false };
  const B = ensure(G), Z = quizDay(G, day);
  if (Z.done[q.id + day] || (Z.n | 0) >= perDay) return { ok: false };
  Z.done[q.id + day] = 1; Z.n = (Z.n | 0) + 1;
  B.asked[q.id] = (B.asked[q.id] || 0) + 1;
  const correct = choice === q.ok, before = points(B);
  if (correct) B.dpts = (num(B.dpts) || 0) + DAILY.pts;
  B.pts = points(B);
  const silver = Math.max(0, Math.floor(B.pts / RULES.silverPer) - B.paid);
  B.paid += silver;
  return { ok: true, correct, gained: B.pts - before, pts: B.pts, silver, left: Math.max(0, perDay - Z.n) };
}

/** the book's summary line: points, quizzes taken, the title */
export function summary(G) {
  const B = bookOf(G), f = final(G);
  return { pts: points(B), max: MAX_POINTS, taken: f.taken, finalOpen: f.open, finalDone: f.done, title: B.title || null };
}
