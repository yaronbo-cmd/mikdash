/* ── fable32 (build 36) ── lvl36.js — E2 of the work environment: FOUR MASTERY LEVELS for every built role, real Hard Fun without failure
 * (docs/specs/svivat-avoda-he.md §1.4, §4.1–§4.5, §9 item 2; the corrected table in gemini-koshi-kesharim-2-he.md "טבלת רמות מתוקנת").
 *   LVL36[id][L − 1] — each role's four levels: { he (the level's name), add (what it adds — a short line), src (its source, טיוטה) or
 *     mh (המחשה), p (the act's knobs at that level — the engine and the role's module read them through par36) }. The levels are
 *     cumulative: a level keeps the conditions of the ones below it. Difficulty is content — a narrower window, a subtler blemish, one more
 *     halachic condition, weight, balance — never a global speed-up and never a penalty (the rating of build 30 is unchanged: מהודר ≥ 0.85).
 *   The record (save.roles23[id], build 23/30/31's) gets l36 = { c: { 1: {h,k,t}, … 4 }, pts, pick, keep, up: [{ ti, lv, d, t, pr }] }:
 *     c — the ratings counted per level; pts — the mastery points (never lost); pick — the level he chose (the roles book);
 *     keep — the title an older save had earned by build 30's counts (kept: no title ever goes down); up — the titles he rose to (the
 *     journal's pages). A practice run's record goes back whole (practice31's merge31), so practice counts as a morning does.
 *   open36(rec) — the highest level open: two מהודר at a level open the next (the owner said "גו" to the plan; default of §11.2)
 *   lvl36(save, id) — the level he plays (his pick, never above what is open; 1 by default) · pick36(save, id, L) — the roles book's choice
 *   rec36(rec, L, rating, o) — an act rated at level L: its count, its points (PTS36), a new title → { pts, opened, up }
 *   ensure36(rec) — an older record made level-aware once (its counts are level 1's; its points from them; its old title kept)
 *   migrate36(save) — every role of an older save, once · boker36(acts) — "בוקר מהודר" · all36(save) — "כל הרמות" · pages36(save)
 * Pure (no DOM, no three). Every word a draft (טיוטה) or המחשה; never a Divine Name. ── /fable32 ── */
import { RATE30, rate30, title30, titleLv36, TITLE36, role30 } from './rate30.js';

export const ROLES36 = Object.freeze(['kiyor', 'deshen', 'm22', 'lamb', 'inner', 'menorah', 'shochet', 'zorek']);
const lv = (he, add, o, p) => Object.freeze({ he, add, ...(o.src ? { src: o.src } : { mh: 1 }), p: Object.freeze(p) });
const cite = (q, ref) => `"${q}" — ${ref} · טיוטה`;
// ── the table (svivat-avoda-he.md §4.2; the numbers a draft, tuned by the autoplayer's two profiles — §4.5) ──
export const LVL36 = Object.freeze({
  // הכיור: the hold of the two thumbs (the protocol's first exception) — the ring that fills, then none, then longer, then the balance
  kiyor: Object.freeze([
    lv('החזקה מודרכת', 'הטבעת מתמלאת ומראה כמה עוד', {}, { guide: 1, hold: 1, bal: null }),
    lv('בלי הדרכה', 'בלי מילוי הטבעת — מחזיקים עד שהמים פוסקים', {}, { guide: 0, hold: 1, bal: null }),
    lv('החזקה ארוכה', 'המים זורמים זמן רב יותר', {}, { guide: 0, hold: 1.6, bal: null }),
    lv('שני אגודלים באיזון', 'הזרם נוטה — מאזנים בגובה האגודלים, בלי להרים', { src: cite('ימין על ימין, שמאל על שמאל', 'זבחים יט ע״ב') }, { guide: 0, hold: 1.6, bal: Object.freeze({ wind: 1.55, shake: 1.55, fix: 2.4, lim: 0.5, gap: 0.9 }) /* ── fable32 (build 37) ── (was 1.1 / 0.55: with hand37 the skilled 86 %) ── */ }),
  ]),
  // תרומת הדשן: the coals, the pan's weight on the way down, the heap's exact place
  // ── fable32 (build 37) ── (the pans retuned with the tools' new balance hand, hand37 — the browser and node now agree: level 1 the pan
  // ×1.2 of build 35's, spilling at 0.68 (was ×0.65 at 0.8: with the steady hand the child never spilt — 100 %); level 3 ×1.45 at 0.6
  // (was 1.4 / 0.62); level 4 ×1.65 at 0.53 (was 1.6 / 0.55)) ── /fable32 ──
  deshen: Object.freeze([
    lv('גחלים ברורות', 'הגחלים לפניכם — פנו הילך והילך', {}, { inner: 0, heavy: Object.freeze({ wind: 0.6, shake: 0.45, spill: 0.9 }), exact: 0 }),   // ── build 52 ── (level 1 softened: a child's two thumbs, the right a reaction (~250 ms) behind the meter, spilled 3.25 times a walk (7 % ≤ 1) at wind 1.2, shake 1.2, spill 0.68 — now 0.28 (98 % ≤ 1); tools/bal52.mjs) ── /build 52 ──
    lv('מן המאוכלות הפנימיות', 'חותים רק מן הגחלים שאוכלו — בצד שבו הן לוחשות', { src: cite('חתה מן המאוכלות הפנימיות', 'תמיד א, ד') }, { inner: 1, heavy: Object.freeze({ wind: 1.2, shake: 1.2, spill: 0.68 }), exact: 0 }),
    lv('מחתה כבדה', 'המחתה מלאה וכבדה — האיזון צר', { src: cite('נטל את מחתת הכסף', 'תמיד א, ד') }, { inner: 1, heavy: Object.freeze({ wind: 1.45, shake: 1.45, spill: 0.6 }), exact: 0 }),
    lv('מקום ההנחה המדויק', 'צוברים שלושה טפחים מן הכבש — בדיוק', { src: cite('צבר את הגחלים על גבי הרצפה רחוק מן הכבש שלשה טפחים', 'תמיד א, ד') }, { inner: 1, heavy: Object.freeze({ wind: 1.65, shake: 1.65, spill: 0.53 }), exact: 0.75 }),
  ]),
  // המערכה: the sort, the air between the logs, the second pyre (of the incense)
  m22: Object.freeze([
    lv('עצים ברורים', 'מעט עצים פסולים, וברורים', { src: cite('במרביות של תאנה ושל אגוז ושל עץ שמן', 'תמיד ב, ג') }, { bad: 3, band: 1, strict: 0, second: 0 }),
    lv('זית וגפן מעורבים', 'יותר עצי זית וגפן, באותם גדלים כמו הכשרים', { src: cite('כל העצים כשרים למערכה חוץ משל זית ושל גפן', 'תמיד ב, ג') }, { bad: 4, band: 1, strict: 0, second: 0 }),
    lv('חלון האוויר צר', 'המרווח בין הגזרים צר יותר — ונספר כל גזר שלא הונח נכון', { src: cite('ורוח היה בין הגזרין', 'תמיד ב, ד') }, { bad: 4, band: 0.5, strict: 1, second: 0 }),
    lv('גם המערכה השנייה', 'אחרי הגדולה — שני גזרי תאנה למערכה של הקטורת', { src: cite('וסדרו מערכה שניה של קטרת', 'תמיד ב, ה') }, { bad: 4, band: 0.21, strict: 1, second: 2, band2: 0.18 }),
  ]),
  // בדיקת הטלה: the blemish plain, small, dirt that looks like one, two lambs
  lamb: Object.freeze([
    lv('מום גלוי', 'המום נראה לאור האבוקה', { src: cite('בודקין אותו לאור האבוקות', 'תמיד ג, ד') }, { small: 0, mimic: 0, two: 0, pB: 0.8, dirt: 4 } /* ── fable32 (build 37) ── (more to read: more lambs with a blemish, up to four straws or mud — was P25's 0.5 and 2) ── */),
    lv('מומים קטנים', 'המום קטן — באוזן או בעין', { src: cite('כל מום משלשה ושבעים מום המנויין בבהמה פוסלין אותה מן הקרבן', 'רמב״ם, איסורי מזבח ב, י') }, { small: 1, mimic: 0, two: 0, pB: 0.8, dirt: 4 }),
    lv('לכלוך שנראה כמו מום', 'מקרוב לא רואים — מבריש, ואז יודע', {}, { small: 1, mimic: 1, two: 0, pB: 0.8, dirt: 4 }),
    lv('שני טלאים להשוואה', 'בודקים שני טלאים, והמום זעיר — ובוחרים את התמים', { src: cite('צאו והביאו טלה מלשכת הטלאים', 'תמיד ג, ג') }, { small: 1, mimic: 1, two: 1, pB: 0.85, dirt: 4, sz: 0.5 } /* ── fable32 (build 37) ── (the blemish half a small one's size — was pB 0.65, dirt 3, sz 1) ── */),
  ]),
  // דישון מזבח הפנימי: the pulls (too fast scratches the gold), the guide, the teni out
  inner: Object.freeze([
    lv('חפינות מודרכות', 'המד מראה את קצב החפינה', {}, { guide: 1, vmax: 2.4, teni: null }),
    lv('רגישות לשריטה', 'הזהב רגיש — חופנים לאט יותר', {}, { guide: 1, vmax: 2.05, teni: null }),
    lv('בלי הדרכה', 'בלי מד הקצב — לפי היד', {}, { guide: 0, vmax: 2.05, teni: null }),
    lv('הכניסה השנייה: הטני החוצה', 'נוטלים את הטני המלא ויוצאים בו בלי שתיפול גחלת', { src: cite('נכנס ונטל את הטני והשתחוה ויצא', 'תמיד ו, א') }, { guide: 0, vmax: 1.9, teni: Object.freeze({ wind: 1.4, shake: 1.6, fix: 2.4, lim: 0.5, gap: 0.9, s: 4.6 }) /* ── fable32 (build 37) ── (was 1.0 / 0.55: with hand37 the skilled 79 %; 1.6 gave node 21 % and the browser 0 of 14) ── */ }),
  ]),
  // דישון המנורה: the lamp shown, the half-log band, the eastern lamp out, the western lamp out
  menorah: Object.freeze([
    lv('נר מודרך', 'הנר הבא מסומן', {}, { lo: 0.905, hi: 0.995, ev: 0, west: 0 }),
    lv('פס חצי הלוג צר', 'הפס הזהוב צר יותר', { src: cite('שמן אחר במדה והוא חצי לוג', 'רמב״ם, תמידין ומוספין ג, יב') }, { lo: 0.93, hi: 0.985, ev: 0, west: 0 }),
    lv('נר מזרחי כבוי', 'נר שכבה — מדליקים מנר דולק', { src: cite('מצאן שכבו, מדשנן ומדליקן מן הדולקים', 'תמיד ג, ט') }, { lo: 0.93, hi: 0.985, ev: 1, west: 0 }),
    lv('נר מערבי כבוי', 'הנר המערבי כבה — מדליקים ממזבח העולה', { src: cite('מצאו שכבה, מדשנו ומדליקו מעל מזבח העולה', 'תמיד ו, א') }, { lo: 0.951, hi: 0.969, ev: 1, west: 1 }),
  ]),
  // השוחט: the cut's window, the binding's direction, the needle's pace
  shochet: Object.freeze([
    lv('חלון רחב', 'פס הזהב רחב', {}, { win: Object.freeze([0.445, 0.555]), turn: 0, sweep: 1 } /* ── fable32 (build 37) ── (was [0.435, 0.565]: the child 82 %) ── */),
    lv('עקידה בכיוון הנכון', 'בלי קו העזר — עוקדים יד ורגל, ראשו לדרום; עקידה הפוכה נספרת', { src: cite('וכך היתה עקדתו, ראשו לדרום ופניו למערב', 'תמיד ד, א') }, { win: Object.freeze([0.445, 0.555]), turn: 1, sweep: 1 }),
    lv('חלון צר', 'פס הזהב צר', {}, { win: Object.freeze([0.465, 0.535]), turn: 1, sweep: 1 }),
    lv('חלון צר ומחוג מהיר', 'פס צר, והמחוג נע מהר יותר', {}, { win: Object.freeze([0.482, 0.518]), turn: 1, sweep: 0.7 }),
  ]),
  // הזורק: the stream, the line, the corner, the clot
  zorek: Object.freeze([
    lv('זרם רחב', 'קל להחזיק את המזרק תחת הזרם', {}, { tol: 0.19, guide: 1, deg: 3, coag: 1 }),
    lv('מתחת לחוט', 'בלי קו העזר — זורקים מתחת לחוט הסיקרא', { src: cite('וחוט של סקרא חוגרו באמצע, להבדיל בין הדמים העליונים לדמים התחתונים', 'מדות ג, א') }, { tol: 0.15, guide: 0, deg: 3, coag: 1 }),
    lv('פינה מדויקת', 'כמין גמא — בדיוק על הקרן', { src: cite('מתנה אחת כמין גמא נותן', 'זבחים נג, ב') }, { tol: 0.14, guide: 0, deg: 1.8, coag: 1 }),
    lv('קרישה מהירה', 'הדם קורש מהר — ממרסים בלי הפסקה', { src: cite('ממרס בו… כדי שלא יקרש', 'יומא ד, ג (בדם הפר של יום הכפורים)') }, { tol: 0.1, guide: 0, deg: 0.38, coag: 3.6 }),
  ]),
});
/** a level's knobs (1…4; a missing role or level: level 1's) */
export const par36 = (id, L) => {
  const t = LVL36[id];
  if (!t) return null;
  const i = Math.max(1, Math.min(4, L | 0 || 1)),
    o = globalThis.__LV36P && globalThis.__LV36P[id] && globalThis.__LV36P[id][i];   // (the tuning tool's override — tools/lvl36sim.mjs; the game never sets it)
  return o ? { ...t[i - 1].p, ...o } : t[i - 1].p;
};
// ── the mastery points of an act (§4.3: by the rating and the level; never lost) — a draft ──
export const PTS36 = Object.freeze({ mehudar: Object.freeze([10, 20, 35, 60]), kasher: Object.freeze([5, 10, 18, 30]), tikkun: Object.freeze([1, 2, 3, 5]) });
export const pts36 = (rating, L) => ((PTS36[rating] || PTS36.tikkun)[Math.max(1, Math.min(4, L | 0 || 1)) - 1] | 0);
export const L36 = Object.freeze({ max: 4, need: 2 /* (מהודר at a level to open the next) */, word: 'רמה', draft: 'הרמות — טיוטה' });
const obj = (v) => v && typeof v === 'object' && !Array.isArray(v);
const zero = () => ({ h: 0, k: 0, t: 0 });
/** an older record made level-aware, once: its ratings are level 1's (build 30's r30, and the plays before it — כשר when their best was
 *  ≥ 50 %, as role30 counts them); its points from them; the title it had by build 30's counts kept (no title goes down) */
export function ensure36(a) {
  if (!obj(a)) return null;
  if (obj(a.l36) && obj(a.l36.c)) {
    for (let L = 1; L <= 4; L++) if (!obj(a.l36.c[L])) a.l36.c[L] = zero();
    if (!Array.isArray(a.l36.up)) a.l36.up = [];
    a.l36.pts = Math.max(0, a.l36.pts | 0);
    return a.l36;
  }
  const r = role30({ ...a, l36: undefined }),
    r30 = obj(a.r30) ? a.r30 : {},
    h = r30.h | 0,
    k = Math.max(0, r.k - h),
    t = Math.max(0, (a.n | 0) - h - r.k),
    keep = (a.n | 0) > 0 ? title30(h, r.k).id : null;
  a.l36 = { c: { 1: { h, k, t }, 2: zero(), 3: zero(), 4: zero() }, pts: h * pts36('mehudar', 1) + k * pts36('kasher', 1) + t * pts36('tikkun', 1), pick: 1, keep, up: [], old: 1 };
  return a.l36;
}
/** the highest level open: level 1 always; each next one after two מהודר at the one below it */
export function open36(a) {
  const l = obj(a) && obj(a.l36) && obj(a.l36.c) ? a.l36 : obj(a) ? { c: { 1: { h: (obj(a.r30) && a.r30.h) | 0 } } } : null;
  let L = 1;
  while (l && L < L36.max && (((l.c[L] || {}).h | 0) >= L36.need)) L++;
  return L;
}
/** the level he plays a role at: his pick (the roles book), never above what is open */
export function lvl36(save, id) {
  const a = save && obj(save.roles23) ? save.roles23[id] : null,
    p = obj(a) && obj(a.l36) ? a.l36.pick | 0 : 1;
  return Math.max(1, Math.min(open36(a), p || 1));
}
/** the roles book's choice: only an open level; the record made if he has none yet (the laver's first morning) */
export function pick36(save, id, L) {
  if (!obj(save) || !ROLES36.includes(id)) return false;
  if (!obj(save.roles23)) save.roles23 = { m: 0, h: [] };
  const a = save.roles23[id] || (save.roles23[id] = { n: 0, best: 0, last: 0 });
  const l = ensure36(a);
  L = L | 0;
  if (!(L >= 1 && L <= open36(a))) return false;
  l.pick = L;
  return true;
}
/** an act rated at level L: the count, the points, the levels opened, a title risen to (o: { d: the game's day, t: the real time, pr }) */
export function rec36(a, L, rating, o = {}) {
  const l = ensure36(a);
  if (!l) return null;
  L = Math.max(1, Math.min(4, L | 0 || 1));
  const before = titleLv36(a),
    open0 = open36(a),
    c = l.c[L],
    key = RATE30.key[rating] || 't';
  c[key] = (c[key] | 0) + 1;
  const pts = pts36(rating, L);
  l.pts = (l.pts | 0) + pts;
  const after = titleLv36(a),
    open1 = open36(a),
    up = TITLE36.indexOf(after) > TITLE36.indexOf(before) ? { ti: after.id, lv: L, d: o.d | 0, t: +o.t || 0, ...(o.pr ? { pr: 1 } : {}) } : null;
  if (up) l.up.push(up);
  if (l.up.length > 12) l.up.splice(0, l.up.length - 12);
  return { pts, total: l.pts, opened: open1 > open0 ? open1 : 0, up, title: after, was: before };
}
/** every role of an older save, once (the lobby's mount and the day's start call it; a new save has nothing to do) */
export function migrate36(save) {
  if (!obj(save) || !obj(save.roles23)) return 0;
  let n = 0;
  for (const id of ROLES36) {
    const a = save.roles23[id];
    if (obj(a) && !obj(a.l36)) {
      ensure36(a);
      n++;
    }
  }
  return n;
}
/** "בוקר מהודר" (§4.4): every act of his own that morning מהודר, each at level 3 or more — acts: [[id, rating, L] …] */
export const boker36 = (acts) => Array.isArray(acts) && acts.length > 0 && acts.every((x) => Array.isArray(x) && x[1] === 'mehudar' && (x[2] | 0) >= 3);
/** "כל הרמות" (§4.4): מהודר at level 4 in every built role */
export const all36 = (save) => {
  const r = save && obj(save.roles23) ? save.roles23 : {};
  return ROLES36.every((id) => obj(r[id]) && obj(r[id].l36) && obj(r[id].l36.c) && ((r[id].l36.c[4] || {}).h | 0) > 0);
};
/** the role's row in the roles book: its levels (open, chosen, מהודר per level), its points, its title */
export function row36(save, id) {
  const a = save && obj(save.roles23) ? save.roles23[id] : null,
    l = obj(a) && obj(a.l36) ? a.l36 : null,
    open = open36(a),
    pick = lvl36(save, id);
  return {
    id, open, pick,
    pts: l ? l.pts | 0 : 0,
    lv: [1, 2, 3, 4].map((L) => ({ L, open: L <= open, h: l ? ((l.c[L] || {}).h | 0) : L === 1 && obj(a) && obj(a.r30) ? a.r30.h | 0 : 0, need: L > 1 ? L36.need : 0, from: L - 1 })),
    title: obj(a) && (a.n | 0) > 0 ? titleLv36(a) : null,
  };
}
/** the journal's mastery pages: the titles risen to (each role's l36.up), the "בוקר מהודר" mornings (save.lvl36.boker), "כל הרמות" */
export function pages36(save) {
  const r = save && obj(save.roles23) ? save.roles23 : {},
    out = [];
  for (const id of ROLES36) {
    const a = r[id];
    if (obj(a) && obj(a.l36) && Array.isArray(a.l36.up)) for (const u of a.l36.up) if (obj(u)) out.push({ k: 'title', id, ti: u.ti, lv: u.lv | 0, d: u.d | 0, t: +u.t || 0, pr: !!u.pr });
  }
  const b = save && obj(save.lvl36) && Array.isArray(save.lvl36.boker) ? save.lvl36.boker : [];
  for (const x of b) if (obj(x)) out.push({ k: 'boker', d: x.d | 0, t: +x.t || 0, acts: Array.isArray(x.acts) ? x.acts : [] });
  out.sort((a, b) => b.t - a.t || b.d - a.d);
  return { pages: out, all: all36(save) };
}
/** "בוקר מהודר" recorded (the engine, at the morning's end; at most one a day; 40 kept) */
export function addBoker36(save, d, t, acts) {
  if (!obj(save)) return false;
  const s = obj(save.lvl36) ? save.lvl36 : (save.lvl36 = { v: 1, boker: [] });
  if (!Array.isArray(s.boker)) s.boker = [];
  if (s.boker.some((x) => obj(x) && (x.d | 0) === (d | 0))) return false;
  s.boker.push({ d: d | 0, t: +t || 0, acts: acts.map((x) => [x[0], x[1], x[2] | 0]) });
  if (s.boker.length > 40) s.boker.splice(0, s.boker.length - 40);
  return true;
}
// (the sources of the mastery pages — the role's own line is its page's; these for the morning and the badge)
export const SRC36 = Object.freeze({
  boker: cite('בהידור מצוה עד שליש במצוה', 'בבא קמא ט ע״א'),
  all: cite('זכו בו שלשה עשר כהנים', 'יומא ב, ג'),
});
export { rate30 };
