/* ── fable32 (build 33) ── lamb33.js — "הטלה המבוקר": the first real-time hook (docs/specs/time-gating-hooks-he.md, hook 1, approved by the
 * owner 22.10 08:53; hachraot-he.md "הוקים בזמן אמת"). A lamb he inspects today in לשכת הטלאים is offered as the Tamid four REAL days
 * later. The data, pure (no DOM, no three) — day33.js (the morning, the chamber's run), chamber33.js (the chamber's cards, the morning's
 * card), lobby35 / lock29 (the "מכאן" card's door), book32 (the journal's tab) and the tests read it:
 *   save.lambs33 = { v, last, n, list: [lamb], blem: [inspection] }
 *     last — the day number (where the phone is) of the last inspection: one a day (המחשה: the game's pace)
 *     lamb — { i, d (the day inspected), t (the real time), h (the Hebrew date then), c (its tag's colour), r (the inspection's rating),
 *              at (the day it was offered; 0 = in the chamber), by ('me' — on his own morning, 'court' — by the chamber's kohanim on its
 *              day), gd (the game's day of that morning), ot, oh (the real time and the Hebrew date he saw it), seen (the morning's card) }
 *     blem — the inspections whose lamb had a blemish (it did not enter): { d, t, h, r, k (the kind), g (the place) }
 *   The time: the device's clock (time29's clock29 — and its test hook, __NOW29 / ?now= on a local page) in the calendar of where the
 *   phone is (time29's where29: its time zone); a day = a civil day there, from local MIDNIGHT to midnight (the brief's choice — not the
 *   Hebrew day's sunset: a child's "tomorrow"). It keeps running on Shabbat and Yom Tov — the lock locks the screen, not the count.
 *   Ready on d + 4 ("טָעוּן בִּיקּוּר אַרְבָּעָה יָמִים קוֹדֶם שְׁחִיטָה"); then it waits for him three more days (המחשה) — his next real morning
 *   offers the oldest ready one; if he does not come, the chamber's kohanim offer it on day d + 7 — nothing is lost, it is recorded.
 *   The chamber never has fewer than six: the court's lambs fill to six ("אֵין פּוֹחֲתִין מִשִּׁשָּׁה טְלָאִים הַמְבֻקָּרִין"); "וּמוֹסִיפִין עַד
 *   לְעוֹלָם" — his may be more. The reward for waiting is something seen in the world and his — never power: no speed, no bonus.
 * Every text a draft (טיוטה + source) or המחשה; never a Divine Name; no countdown in hours — "מחר", "בעוד 3 ימים". ── /fable32 ── */
import { civilDay, weekdayOnDay, hebrewOnDay } from '../../calendar.js';

const DAY = 864e5;
export const L33 = Object.freeze({
  v: 1,
  ready: 4,   // "טעון ביקור ארבעה ימים קודם שחיטה" (מנחות מט ע״ב): inspected on day d → ready on d + 4
  wait: 3,    // (המחשה) the ready lamb waits for his morning three more days; on d + 7 the chamber's kohanim offer it in its turn
  six: 6,     // "אין פוחתין מששה טלאים המבקרין בלשכת הטלאים" (ערכין ב, ה): the court fills the chamber to six
  stalls: 8,  // the chamber's stalls drawn (chamber33 / pen25: his lambs from the first, the court's from the last)
  keep: 60,   // the lambs kept in the list (the journal's tab): the oldest offered ones dropped beyond it
  keepB: 30,  // the blemished inspections kept
  // the tags (המחשה: the game's mark of HIS lamb — a colour, never a name — "בלי שם לטלה", the owner 22.10): no red
  tags: Object.freeze(['#4F8FE0', '#F2C14E', '#5DBB7A', '#9B7BD4', '#F4F1E8', '#F29A3E']),
  tagHe: Object.freeze(['כחול', 'זהוב', 'ירוק', 'סגול', 'לבן', 'כתום']),
});
// ── the sources (checked on Sefaria by Claude — the brief, 22.10), each a draft ──
export const SRC33 = Object.freeze({
  visit: Object.freeze({ quote: 'טָעוּן בִּיקּוּר אַרְבָּעָה יָמִים קוֹדֶם שְׁחִיטָה', ref: 'מנחות מט ע״ב' }),
  six: Object.freeze({ quote: 'אֵין פּוֹחֲתִין מִשִּׁשָּׁה טְלָאִים הַמְבֻקָּרִין בְּלִשְׁכַּת הַטְּלָאִים', ref: 'ערכין ב, ה' }),
  shabbat: Object.freeze({ quote: 'כְּדַי לַשַּׁבָּת וְלִשְׁנֵי יָמִים טוֹבִים שֶׁל רֹאשׁ הַשָּׁנָה', ref: 'ערכין ב, ה' }),
  more: Object.freeze({ quote: 'וּמוֹסִיפִין עַד לְעוֹלָם', ref: 'ערכין ב, ה' }),
  place: Object.freeze({ quote: 'מַעֲרָבִית דְּרוֹמִית, הִיא הָיְתָה לִשְׁכַּת טְלָאֵי קָרְבָּן', ref: 'מידות א, ו' }),
  torch: Object.freeze({ quote: 'בודקין אותו לאור האבוקות', ref: 'תמיד ג, ד' }),
});
/** the game's own choices, said as such (the journal's tab, the chamber's card) */
export const ILL33 = Object.freeze([
  'טלה אחד ביום — הקצב של המשחק',
  'הסימן הצבעוני — סימן המשחק לטלה שבדקת',
  'טלה מוכן מחכה לבוקר שלך שלושה ימים; אחר כך כהני הלשכה מעלים אותו',
  'מקום הלשכה והדירים בה — המחשה',
]);
/** the lamb chamber's places (Beit HaMoked's south-west chamber — places.js LAMBS_CHAMBER, its door east on the hall): the lamb brought to
 *  the hall before the chamber's door and the kohen beside it — the pen's own layout (P25: the lamb facing west, the kohen 1 west and 3.2
 *  south of it, so the pen's authored views read it the same); the way in from the azara through the hall's door (GATES.moked); the
 *  chamber's eight stalls (the first ones in the middle row — the way through the door is straight), the door's inside (the walk's
 *  bend), the stock's view from the south (the hall's south wall is cut away when the camera comes near — sanctuary.js roofs) */
export const CH33 = Object.freeze({
  door: Object.freeze({ x: -161.6, z: -63.2, yaw: -Math.PI / 2, s: 0.8 }),
  stand: Object.freeze({ x: -162.6, z: -60 }),
  side: Object.freeze({ x: -157.2, z: -63.4 }),
  via: Object.freeze({ x: -168.2, z: -62.6 }),
  start: Object.freeze({ x: -160, z: -53.5, yaw: Math.PI }),
  stalls: Object.freeze([[-170, -62.7], [-173, -62.7], [-169.8, -65.4], [-169.8, -60.2], [-172.8, -65.4], [-172.8, -60.2], [-175.6, -65.4], [-175.6, -60.2]].map((p) => Object.freeze({ x: p[0], z: p[1] }))),
  view: Object.freeze({ p: Object.freeze([-177.5, 22.4, -52.6]), t: Object.freeze([-177.5, 16.5, -62.6]) }),   // (the chamber in the screen's right half: the card stands on its left)
  walk: Object.freeze({ p: Object.freeze([-160, 26, -38]), t: Object.freeze([-161, 16.5, -57]) }),   // ── fable32 (build 34) ── (the walk in: from the azara's south, high — him, the hall's door ahead, the stalls through the cut-away wall; the follow camera stood 4 m behind him in the narrow strip, his head filling the screen) ── /fable32 ──
});
const obj = (v) => v && typeof v === 'object' && !Array.isArray(v);
/** the day number of the moment t where the phone is (its civil day: local midnight to midnight) */
export function day33n(t, w = null) {
  try {
    return civilDay(new Date(+t), (w && w.tz) || 'Asia/Jerusalem');
  } catch (e) {
    return Math.floor(+t / DAY);
  }
}
/** the hook's record (made once; repaired) */
export function lb33(save) {
  if (!obj(save)) return null;
  let b = save.lambs33;
  if (!obj(b)) b = save.lambs33 = { v: L33.v, last: 0, n: 0, list: [], blem: [] };
  if (!Array.isArray(b.list)) b.list = [];
  if (!Array.isArray(b.blem)) b.blem = [];
  b.list = b.list.filter(obj);
  b.last = +b.last || 0;
  b.n = b.n | 0;
  return b;
}
/** may he inspect a lamb today? (one a day) */
export const canInspect33 = (save, dn) => { const b = lb33(save); return !!b && b.last !== (dn | 0); };
export const readyDay33 = (L) => (L.d | 0) + L33.ready;
export const courtDay33 = (L) => (L.d | 0) + L33.ready + L33.wait;
/** the chamber's kohanim offer, on its day, a ready lamb he has not come for — nothing is lost (recorded: by 'court'); → how many */
export function settle33(save, dn) {
  const b = lb33(save);
  if (!b) return 0;
  let n = 0;
  for (const L of b.list)
    if (!L.at && (dn | 0) > courtDay33(L)) {
      L.at = courtDay33(L);
      L.by = 'court';
      n++;
    }
  return n;
}
/** his lambs in the chamber now (the court's offerings settled first), the oldest first */
export function inStock33(save, dn) {
  settle33(save, dn);
  const b = lb33(save);
  return b ? b.list.filter((L) => !L.at).sort((a, c) => a.d - c.d || a.i - c.i) : [];
}
/** the chamber now: his lambs with their days to ready (0 = ready), the court's that fill to six */
export function stock33(save, dn) {
  const mine = inStock33(save, dn).map((L) => ({ ...L, readyIn: Math.max(0, readyDay33(L) - (dn | 0)) }));
  return { mine, court: Math.max(0, L33.six - mine.length), total: Math.max(L33.six, mine.length), ready: mine.filter((L) => !L.readyIn).length };
}
/** his inspection's end in the chamber: out 'tamim' — the lamb gets a tag and enters; 'blem' — it does not. null if he already inspected
 *  today. o = { dn, t, h, out, r (the rating), q, k, g (a blemish's kind and place) } */
export function inspect33(save, o = {}) {
  const b = lb33(save),
    dn = o.dn | 0;
  if (!b || b.last === dn) return null;
  b.last = dn;
  b.n++;
  if (o.out === 'tamim') {
    const mine = b.list.length,
      L = { i: b.n, d: dn, t: +o.t || 0, h: String(o.h || ''), c: mine % L33.tags.length, r: o.r || null, q: Number.isFinite(+o.q) ? +o.q : null, at: 0, by: '' };
    b.list.push(L);
    if (b.list.length > L33.keep) {
      const old = b.list.findIndex((x) => x.at);
      if (old >= 0) b.list.splice(old, 1);
    }
    return { out: 'tamim', lamb: L };
  }
  const x = { d: dn, t: +o.t || 0, h: String(o.h || ''), r: o.r || null, k: o.k == null ? null : o.k | 0, g: o.g == null ? null : o.g | 0 };
  b.blem.push(x);
  if (b.blem.length > L33.keepB) b.blem.splice(0, b.blem.length - L33.keepB);
  return { out: 'blem', rec: x };
}
/** the morning's Tamid lamb: the oldest of his that is ready (the court's offerings settled first) — or null */
export function pick33(save, dn) {
  return inStock33(save, dn).find((L) => readyDay33(L) <= (dn | 0)) || null;
}
/** that lamb offered on his real morning: o = { dn, gd (the game's day), t, h } */
export function offer33(save, L, o = {}) {
  if (!L || L.at) return null;
  Object.assign(L, { at: o.dn | 0, by: 'me', gd: o.gd | 0, ot: +o.t || 0, oh: String(o.h || ''), seen: 0 });
  return L;
}
/** the lamb he offers on game day gd (assigned that morning), or null */
export function ofDay33(save, gd) {
  const b = lb33(save);
  if (!b) return null;
  let best = null;
  for (const L of b.list) if (L.by === 'me' && (L.gd | 0) === (gd | 0) && (!best || (+L.ot || 0) > (+best.ot || 0))) best = L;
  return best;
}
// ── the words (days only — never hours or a ticking clock) ──
/** a lamb's ready state: "מוכן" · "מוכן מחר" · "בעוד N ימים" */
export const readyHe33 = (n) => ((n | 0) <= 0 ? 'מוכן' : (n | 0) === 1 ? 'מוכן מחר' : `בעוד ${n | 0} ימים`);
const WD = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
/** "יום שני" / "שבת" of a day number */
export const weekdayHe33 = (dn) => { const w = weekdayOnDay(dn | 0); return w === 6 ? 'שבת' : `יום ${WD[w]}`; };
/** "26.10.2026" — the civil date of a day number */
export function dateHe33(dn) {
  const d = new Date((dn | 0) * DAY + 12 * 3600e3);
  return `${d.getUTCDate()}.${d.getUTCMonth() + 1}.${d.getUTCFullYear()}`;
}
/** the Hebrew date of a day number's daytime — "י״ד בחשוון תשפ״ז" */
export function hebDay33(dn) {
  try {
    const h = hebrewOnDay(dn | 0);
    return `${h.dayHe} ב${h.monthHe} ${String(h.yearHe).replace(/^[א-ת]׳/, '')}`;
  } catch (e) {
    return '';
  }
}
/** when he inspected it, as the morning's card says it: "ביום שני" (within the week), else "ביום שני, 26.10" */
export function whenHe33(d, dn) {
  const w = weekdayHe33(d),
    b = w === 'שבת' ? 'בשבת' : `ב${w}`;
  if ((dn | 0) - (d | 0) <= 6) return b;
  const x = new Date((d | 0) * DAY + 12 * 3600e3);
  return `${b}, ${x.getUTCDate()}.${x.getUTCMonth() + 1}`;
}
/** Thursday and Friday where the phone is: "יש די טלאים לשבת" — a fact, never a warning (the court keeps six) */
export const shabbat33 = (dn) => { const w = weekdayOnDay(dn | 0); return w === 4 || w === 5; };
export const SHABBAT33 = 'יש די טלאים לשבת';
/** the chamber's stalls: his lambs from the first, the court's from the last (the next of his walks in to a free one) */
export function stalls33(mine, court) {
  const S = CH33.stalls,
    m = Math.min(mine | 0, S.length),
    c = Math.min(court | 0, S.length - m);
  return { mine: S.slice(0, m), court: S.slice(S.length - c), next: S[Math.min(m, S.length - 1)] };
}
/** the line the morning's card says (and the journal's tab): "הטלה שבדקת ביום שני עולה היום לתמיד" */
export const upLine33 = (L, dn) => `הטלה שבדקת ${whenHe33(L.d, dn)} עולה היום לתמיד`;
// ── the inspection by day (the chamber at the real hour): the act's one line looks, it does not light (LINE30's "האירו" is the torch's) ──
export const LINE33 = Object.freeze({ scan: 'הביטו ומצאו כתם', false: 'יש בו מום', fals: 'יש בו מום', whole: 'הטלה תמים — הביטו שוב', dirt: 'זה לכלוך — לא מום' });
