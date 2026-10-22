/* ── fable32 (build 30) ── rate30.js — ONE rating for every act of the morning (the owner, 22.10 09:19, hachraot-he.md "המערכות
 * הרוחביות" 3: "דירוג אחד 'מהודר / כשר / טעון תיקון' לפי דיוק; מהירות רק כקצב בתוך הפעולה; תארים לפי מיומנות בתפקיד ומניין בקרים").
 *   quality30(id, record) → q 0…1 from the act's own accuracy measures (the build's records — spills, wrong woods, false approvals, the
 *     pour, the scratches, the cut's misses, the throws …); NO time, NO speed: a slow, careful child is מהודר
 *   rate30(q) → 'mehudar' (q ≥ 0.85) · 'kasher' (0.5 ≤ q < 0.85) · 'tikkun' (q < 0.5)       mastery30 = round(100 q) (the roles book's %)
 *   RATE30.pay — the act's coins by its rating (מהודר 3 · כשר 2 · טעון תיקון 1): "טעון תיקון" is a label and an invitation, never a loss
 *   title30(counts) — a role's skill title by its counts of כשר / מהודר (draft: מתחיל → רגיל → מיומן → מומחה); served30(save) — the
 *     mornings served ("שימשת N בקרים"); role30(entry) — a roles-book row's best rating, its מהודר count and its title
 *   LINE30 — the ONE short action line (2–4 words) of each act's phase, the step card's text while an act is in progress (rohvi-he.md
 *     §14: "בזמן הפעולה — שורה אחת של 2–4 מילים"); reg30 / SRC30 — each act's source lines, shown at its end (one line, a tap opens them all)
 * Pure (no DOM, no three): day33.js, the modules and the tests read it. Every word a draft (טיוטה); never a Divine Name. ── /fable32 ── */
export const RATE30 = Object.freeze({
  hi: 0.85,
  lo: 0.5,
  ids: Object.freeze(['mehudar', 'kasher', 'tikkun']),
  he: Object.freeze({ mehudar: 'מהודר', kasher: 'כשר', tikkun: 'טעון תיקון' }),
  icon: Object.freeze({ mehudar: '✦', kasher: '✓', tikkun: '↻' }),
  pay: Object.freeze({ mehudar: 3, kasher: 2, tikkun: 1 }),
  key: Object.freeze({ mehudar: 'h', kasher: 'k', tikkun: 't' }),
  rank: Object.freeze({ mehudar: 3, kasher: 2, tikkun: 1 }),
  invite: 'אפשר לנסות שוב בספר התפקידים',
  // (the end: the word in the step card this long — the engine's seconds; the source line stays tappable until the next act, at most chipS)
  wordS: 2.4,
  chipS: 8,
  // ── the skill titles (draft; by the counts the roles book keeps): מתחיל — played; רגיל — 2 times כשר or better; מיומן — 3 times מהודר;
  // מומחה — 6 times מהודר (a role comes up every 3–4 mornings: רגיל in a week or two, מומחה after a few months of mornings) ──
  titles: Object.freeze([
    Object.freeze({ id: 'start', he: 'מתחיל', k: 0, h: 0 }),
    Object.freeze({ id: 'regular', he: 'רגיל', k: 2, h: 0 }),
    Object.freeze({ id: 'skilled', he: 'מיומן', k: 0, h: 3 }),
    Object.freeze({ id: 'expert', he: 'מומחה', k: 0, h: 6 }),
  ]),
});
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : Number.isFinite(v) ? v : 0);
const pick = (arr, n) => arr[Math.max(0, Math.min(arr.length - 1, n | 0))];
/** the rating of a quality 0…1 */
export function rate30(q) {
  const v = clamp01(+q);
  return v >= RATE30.hi ? 'mehudar' : v >= RATE30.lo ? 'kasher' : 'tikkun';
}
/** the better of two ratings (either may be missing) */
export const best30 = (a, b) => (!a ? b || null : !b ? a : RATE30.rank[a] >= RATE30.rank[b] ? a : b);
/** the act's quality 0…1 from its record — accuracy and the right action only. The weights of builds 22–27's mastery formulas with
 *  their time share taken out (renormalized); the laver, the ashes and the lamb by the build's own measures (the lamb: a blemished lamb
 *  approved is the halacha's "פסול" — "טעון תיקון", HANDOFF §5א-4) */
export function quality30(id, r) {
  if (!r) return 0;
  switch (id) {
    case 'kiyor':   // the hands held under the spigots: each time a thumb lifted mid-wash (build 20's "lifts")
      return pick([1, 0.75, 0.6, 0.45], r.lifts);
    case 'deshen':   // the coals spilled on the way down (build 21)
      return pick([1, 0.65, 0.35], r.embersSpilledCount);
    case 'm22': {   // the unfit woods taken (the first morning's warned one not counted), the air between the logs, the wrong sizes laid
      const bad = Math.max(0, (r.invalidWoodSelectedCount | 0) - (r.warned | 0));
      return clamp01((0.25 * pick([1, 0.5, 0], bad) + 0.3 * clamp01((+r.airflowQualityScore || 0) / 100) + 0.15 * pick([1, 0.5, 0], r.cracks)) / 0.7);
    }
    case 'lamb':   // a blemished lamb approved −0.55 (טעון תיקון); a whole lamb rejected −0.2; dirt taken for a blemish −0.2
      return clamp01(1 - 0.55 * (r.falseApprovals | 0) - 0.2 * (r.wrongRejections | 0) - 0.2 * (r.dirtMistaken | 0));
    case 'inner':   // the pulls into the teni, each one too fast scratches the gold (build 26's accuracy, 100 − 5 a scratch)
      return clamp01((+r.accuracy || 0) / 100);
    case 'menorah': {   // the half-log poured into each lamp (under 0.8, over 0.45) and the wick's swipes refused
      const ref = r.refused | 0;
      return clamp01((0.5 * clamp01(+r.pourQ || 0) + 0.2 * (ref ? (ref <= 2 ? 0.6 : 0.3) : 1)) / 0.7);
    }
    case 'shochet':   // the cut's taps outside the gold, the binding let go short
      return clamp01((0.5 * pick([1, 0.7, 0.45, 0.25], r.misses) + 0.2 * pick([1, 0.7, 0.4], r.rebinds)) / 0.7);
    case 'zorek': {   // the vessel under the stream, the two gifts (Γ 1, one face 0.6; a throw over the line or past the corner −0.15), the clot
      const g = Array.isArray(r.gifts) && r.gifts.length ? r.gifts.reduce((s, x) => s + x, 0) / r.gifts.length : 0;
      return clamp01((0.25 * clamp01((+r.fillAcc || 0) / 100) + 0.4 * clamp01(g - 0.15 * (r.retries | 0)) + 0.15 * (1 - clamp01((+r.clotMax || 0) / 100))) / 0.8);
    }
    default:
      return 0;
  }
}
/** the roles book's mastery 0…100: accuracy only (build 30; the saves' older values stay as they were) */
export const mastery30 = (id, r) => Math.round(100 * quality30(id, r));
/** the coins of a rating */
export const pay30 = (rating) => RATE30.pay[rating] | 0;
/** a role's counts { h: מהודר, k: כשר, t: טעון תיקון, best } (a record's r30; none → zeros) */
export const counts30 = (r30) => ({ h: (r30 && r30.h) | 0, k: (r30 && r30.k) | 0, t: (r30 && r30.t) | 0, best: (r30 && r30.best) || null });
/** a role's title by its counts: k = the times כשר or better, h = the times מהודר (draft) */
export function title30(h, k) {
  let t = RATE30.titles[0];
  for (const x of RATE30.titles) if (h >= x.h && k >= x.k) t = x;
  return t;
}
/** a roles-book row: { best (the best rating), h (מהודר times), title } from the save's entry { n, best, last, r30 } — a play before
 *  build 30 (in n, not in r30) counts as כשר when its best was ≥ 50 % (its mastery had time in it, so never as מהודר); its best rating
 *  from the old best % (not rewritten) */
export function role30(a) {
  if (!a || !((a.n | 0) > 0)) return { best: null, h: 0, k: 0, title: null };
  const c = counts30(a.r30),
    old = Math.max(0, (a.n | 0) - c.h - c.k - c.t),
    oldBest = old > 0 || !a.r30 ? rate30((+a.best || 0) / 100) : null,
    k = c.h + c.k + (old > 0 && (+a.best || 0) >= 50 ? old : 0);
  return { best: best30(c.best, oldBest), h: c.h, k, title: title30(c.h, k) };
}
/** the mornings served: build 30's count (save.served30), or for an older save the second lots held (roles26.m — a morning's last role) */
export function served30(save) {
  if (!save || typeof save !== 'object') return 0;
  if (Number.isFinite(+save.served30) && save.served30 != null) return Math.max(0, save.served30 | 0);
  const r26 = save.roles26 && typeof save.roles26 === 'object' ? save.roles26.m | 0 : 0,
    r23 = save.roles23 && typeof save.roles23 === 'object' ? save.roles23.m | 0 : 0;
  return Math.max(0, r26 || r23);
}
/** "שימשת N בקרים" (one morning: "שימשת בוקר אחד"; none: '') */
export const servedHe30 = (n) => (n > 1 ? `שימשת ${n} בקרים` : n === 1 ? 'שימשת בוקר אחד' : '');
/** ── the one line while an act is in progress (2–4 words; the act's sources at its end). The keys are the engine's phases. ── */
export const LINE30 = Object.freeze({
  kiyor: Object.freeze({ up: 'קדשו ידיים ורגליים', pose: 'שני אגודלים — החזיקו' }),
  lot: Object.freeze({ raise: 'החליקו למעלה ☝', count: 'הממונה סופר', show: 'הפיס' }),
  deshen: Object.freeze({ in: 'החליקו הילך והילך', sweep: 'החליקו הילך והילך', full: 'אזנו את המחתה', walk: 'אזנו את המחתה', desc: 'אזנו את המחתה', turn: 'לטבעת הזהב', foot: 'לטבעת הזהב', near: 'הקישו — צברו', go: 'צברו את הגחלים', pour: 'צברו את הגחלים' }),
  // (the pyre: l1–l3 the lot's four logs, L1–L3 the six of build 22; the first morning's sort says which woods go left — the names: the end's card)
  m22: Object.freeze({ in: 'כשר ימינה · פסול שמאלה', sort: 'כשר ימינה · פסול שמאלה', first: 'זית, גפן, מתולע — שמאלה', sorted: 'הגזרים מוכנים', carry: 'העלו למזבח', stackIn: 'שני עבים לבסיס', l1: 'שני עבים לבסיס', l2: 'בינוני לרוחבם', l3: 'דק במרכז', L1: 'עבים לבסיס', L2: 'בינוניים לרוחב', L3: 'דקים במרכז', ready: 'הציתו — הקישו', ignite: 'המערכה בוערת' }),
  lamb: Object.freeze({ in: 'בדקו את הטלה', scan: 'האירו ומצאו כתם', zoom: 'מקרוב', dirt: 'החליקו להבריש', clean: 'נקי ✓', blem: 'יש בו מום', aside: 'הוצא לצד', wait: 'הביאו טלה חדש', bring: 'טלה חדש', false: 'עיכוב — יש בו מום', ok: 'תמים לקרבן' }),
  inner: Object.freeze({ in: 'העבירו את הנגר', bolt: 'העבירו את הנגר', key: 'סובבו את המפתח', open: 'השער הגדול נפתח', walk: 'אל מזבח הזהב', step: 'הטני לפניכם', set: 'הטני לפניכם', pull: 'חפנו את הדשן — לאט', leave: 'הניחו וצאו' }),
  menorah: Object.freeze({ in: 'העבירו את הנגר', bolt: 'העבירו את הנגר', key: 'סובבו את המפתח', open: 'השער הגדול נפתח', walk: 'אל המנורה', step: 'עלו על האבן', wick: 'הוציאו את הפתילה', wick2: 'הוציאו וקנחו', wipe: 'קנחו את הנר', pour: 'עד הפס הזהוב', spill: 'נשפך — שוב', new: 'פתילה חדשה — הקישו', drag: 'גררו את האש', lit: 'הנר דולק', kuz: 'הכוז על המעלה', kuzd: 'הכוז על המעלה' }),
  shochet: Object.freeze({ in: 'אל הטלה', bind: 'גררו: יד ורגל', bound: 'עקוד — ראשו לדרום', wait: 'המתינו לקול השער', cut: 'שחטו בזהב', cutd: 'וקבל המקבל' }),
  zorek: Object.freeze({ in: 'אל המזרק', wait: 'המתינו לקול השער', waitOpen: 'השוחט עומד לשחוט', cut: 'שחט השוחט', recv: 'המזרק תחת הזרם', full: 'המזרק מלא', carry: 'לקרן מזרחית צפונית ⟳', hold: 'מרסו — חמש נרות קודם', aim: 'זרקו מתחת לחוט', splash: 'ניתנה מתנה', carry2: 'לקרן מערבית דרומית ⟳', aim2: 'זרקו מתחת לחוט', splash2: 'ניתנה מתנה', base: 'שפכו על היסוד', poured: 'שירי הדם ליסוד' }),
});
/** the words of a line (the test's 2–4: a glyph — ✓ ☝ ⟳ · — is not a word) */
export const words30 = (s) => String(s || '').replace(/[—·:,!?✓☝⟳✦↻]/g, ' ').split(/\s+/).filter((w) => /[א-ת]/.test(w)).length;
/** ── the acts' names and their source lines (each module registers its own, at load: its texts stay in it — only where they show
 *  changed). SRC30[id] = { he, icon, chip: the one line at the end, all: every line the act showed (a tap on the chip opens them) } ── */
export const SRC30 = {};
export const ACT30 = Object.freeze({
  kiyor: Object.freeze({ he: 'קידוש ידיים ורגליים', icon: '💧' }),
  deshen: Object.freeze({ he: 'תרומת הדשן', icon: '🔥' }),
  m22: Object.freeze({ he: 'סידור המערכה', icon: '🪵' }),
  lamb: Object.freeze({ he: 'בדיקת הטלה', icon: '🐑' }),
  inner: Object.freeze({ he: 'דישון מזבח הפנימי', icon: '🥣' }),
  menorah: Object.freeze({ he: 'דישון המנורה', icon: '🪔' }),
  shochet: Object.freeze({ he: 'השחיטה', icon: '🔪' }),
  zorek: Object.freeze({ he: 'זריקת הדם', icon: '🏺' }),
  lot: Object.freeze({ he: 'הפיס', icon: '☝' }),
  lot2: Object.freeze({ he: 'הפיס השני', icon: '☝' }),
});
export function reg30(id, o = {}) {
  const all = (o.all || []).filter(Boolean);
  SRC30[id] = Object.freeze({ he: (ACT30[id] && ACT30[id].he) || id, icon: (ACT30[id] && ACT30[id].icon) || '•', chip: o.chip || all[0] || '', all: Object.freeze(all.length ? all : [o.chip].filter(Boolean)) });
  return SRC30[id];
}
/** a source line with "טיוטה" (the older lines that lacked it get it here, where they now show) */
export const draft30 = (s) => (/טיוטה|המחשה/.test(s) ? s : `${s} · טיוטה`);
