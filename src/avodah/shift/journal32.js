/* ── fable32 (build 32) ── journal32.js — "יומן הכהן": ONE journal for what was scattered (rohvi-he.md §11: "יומן אחד; כל פתיחה מוסיפה
 * עמוד עם המשנה"; future-unlocks-he.md "מה לוקחים" 2: "עמוד חדש ביומן הכהן עם המשנה"; hachraot-he.md "פתיחת תוכן" — the four keys, the
 * first of them the lot: "הפעם הראשונה שהוא עולה — רגע פתיחה"). The data, pure (no DOM, no three) — day33.js writes it, book32.js shows
 * it (the sheet and the unlock card), the lobby counts it, the tests read it:
 *   save.journal32 = { v, acts: { id: { d, t } }, seen: { key: 1 }, log: [{ d, t, h, r: [[id, rating] …], s }], hello }
 *     acts — every act whose end he has reached in a real morning (the lot's two, the laver, the roles): its pages are his from then on —
 *            "collected, never lost"; d the game's day, t the real time (0 for an older save's roles: see jr32)
 *     seen — the pages he has opened (a met page not in it is "חדש")
 *     log  — "הבקרים שלי": one entry a morning served, newest first (J32.logMax kept): the game's day, the real time, the Hebrew date
 *            (calendar.js's hebrewDateAt — the day turns at sunset where the phone is), the morning's acts and their ratings; s — the
 *            morning was served whole (served32, from day33's morning30)
 *     hello — the first-ever card ("היומן שלך נפתח") was shown (an older save: already true — it was not his first morning)
 *   pages: the act's source lines (end30's registry, rate30's SRC30[id].all — each module registers its own) that carry a quote; the
 *   המחשה notes stay in the act's end card. A page's key is its quote and reference, letters only — the same line in two acts (the great
 *   gate's, "חמש נרות") is one page, met in either.
 *   jr32(save)          — the journal, made once: an older save's roles already had (n − pr > 0), the laver had, the lots held → their
 *                         acts met (their pages count); no log entry is made up — the mornings before the journal are a number only
 *   meet32(save, id, o) — an act's end in a real morning (never a practice run): { fresh, hello, card } — card: a role of the lot never had
 *   log32(save, o, id, rating) — the morning's entry (made at its first rated act; the same day's acts added to it)
 *   pages32(id) · allPages32() · groups32(save, today) · count32(save) · seen32(save, key) · today32(ids) · parse32(line)
 *   hebDate32(t, where) · realDate32(t, tz)
 *   TABS32 — the journal's tabs; the four hooks' pages (time-gating-hooks-he.md: "הטלה שבדקת", "העצים שהבאת", the hides, the apple)
 *            and the incense's once-in-a-life page (future-unlocks-he.md, the fourth key) have their places here, off — nothing of
 *            them is built or shown
 * Every word a draft (טיוטה) or המחשה; never a Divine Name. ── /fable32 ── */
import { SRC30, ACT30, RATE30, draft30 } from './rate30.js';
import { hebrewDateAt } from '../../calendar.js';

export const J32 = Object.freeze({
  v: 1,
  logMax: 100,   // (the mornings kept in the log: ≈ 100 bytes each)
  // the morning's order (the journal's groups): the laver, the first lot, its three roles, the second lot, its four built roles
  order: Object.freeze(['kiyor', 'lot', 'deshen', 'm22', 'lamb', 'lot2', 'inner', 'menorah', 'shochet', 'zorek']),
  // the roles the lot gives (the first key): the first time one ends in a real morning — its card, "עמוד חדש ביומן"
  roles: Object.freeze(['deshen', 'm22', 'lamb', 'inner', 'menorah', 'shochet', 'zorek']),
  first: Object.freeze(['deshen', 'm22', 'lamb']),
  second: Object.freeze(['inner', 'menorah', 'shochet', 'zorek']),
  cardS: RATE30.wordS,   // the card as the act's rating word ends (the engine's seconds)
});
// ── the journal's tabs (book32.js draws those that are on; a later build turns its own on and gives it a page) ──
export const TABS32 = Object.freeze([
  Object.freeze({ id: 'roles', he: 'תפקידים', icon: '🎭', on: true }),
  Object.freeze({ id: 'mishna', he: 'משניות', icon: '📜', on: true }),
  Object.freeze({ id: 'mornings', he: 'הבקרים שלי', icon: '🌅', on: true }),
  Object.freeze({ id: 'badges', he: 'אותות', icon: '🏅', on: true }),
  // (the four hooks — not built: their places only) ── fable32 (build 33) ── the first is: "הטלאים שבדקתי" (book32's lambsTab, chamber33.js) ── /fable32 ──
  Object.freeze({ id: 'taleh', he: 'הטלאים שבדקתי', short: 'הטלאים', icon: '🐑', on: true }),   // (short: the tab's word on a narrow phone)
  Object.freeze({ id: 'etzim', he: 'העצים שהבאת', icon: '🪵', on: false }),
  Object.freeze({ id: 'orot', he: 'העורות', icon: '🧺', on: false }),
  Object.freeze({ id: 'tapuach', he: 'התפוח', icon: '⛰️', on: false }),
  // (the incense, once in a life — the fourth key: not built)
  Object.freeze({ id: 'ketoret', he: 'הקטורת', icon: '💨', on: false }),
]);
export const tabsOn32 = () => TABS32.filter((t) => t.on);

const obj = (v) => v && typeof v === 'object' && !Array.isArray(v);
/** the mornings he had a role (a practice run apart — pr); the laver had; the first lot held (roles23.m), the second (roles26.m).
 *  skip: an act whose end is being counted right now (its n already has it) */
function had32(save, id, skip) {
  const r = obj(save && save.roles23) ? save.roles23 : {},
    less = id === skip ? 1 : 0;
  if (id === 'lot') return (r.m | 0) - less > 0;
  if (id === 'lot2') return obj(save.roles26) && (save.roles26.m | 0) - less > 0;
  const a = r[id];
  return obj(a) ? Math.max(0, (a.n | 0) - (a.pr | 0)) - less > 0 : false;
}
/** the journal (made once; an older save: what it had counts as met — no made-up mornings) */
export function jr32(save, skip = null) {
  if (!obj(save)) return null;
  let j = save.journal32;
  if (!obj(j)) {
    j = save.journal32 = { v: J32.v, acts: {}, seen: {}, log: [], hello: false };
    for (const id of J32.order) if (had32(save, id, skip)) j.acts[id] = { d: 0, t: 0, old: 1 };
    j.hello = Object.keys(j.acts).length > 0;   // (not his first morning: no "היומן שלך נפתח")
  }
  if (!obj(j.acts)) j.acts = {};
  if (!obj(j.seen)) j.seen = {};
  if (!Array.isArray(j.log)) j.log = [];
  return j;
}
/** an act's end in a real morning: its pages are his. card — a role of the lot never had before (its "עמוד חדש ביומן"); hello — the
 *  journal's first page ever ("היומן שלך נפתח") */
export function meet32(save, id, o = {}) {
  if (!J32.order.includes(id)) return null;
  const j = jr32(save, id);
  if (!j) return null;
  const was = !!j.acts[id];
  if (!was) j.acts[id] = { d: o.d | 0, t: Number.isFinite(+o.t) ? +o.t : 0 };
  return { id, fresh: !was, hello: !j.hello, card: !was && J32.roles.includes(id) };
}
/** the morning's entry in "הבקרים שלי": made at its first rated act (the real time, the Hebrew date), the same day's acts added */
export function log32(save, o = {}, id, rating) {
  const j = jr32(save);
  if (!j || !id) return null;
  const d = o.d | 0;
  let e = j.log[0];
  if (!obj(e) || e.d !== d) {
    e = { d, t: Number.isFinite(+o.t) ? +o.t : 0, h: String(o.h || ''), r: [] };
    j.log.unshift(e);
    if (j.log.length > J32.logMax) j.log.length = J32.logMax;
  }
  if (!Array.isArray(e.r)) e.r = [];
  e.r = e.r.filter((x) => Array.isArray(x) && x[0] !== id).concat([[id, RATE30.ids.includes(rating) ? rating : null]]);
  return e;
}

// ── the pages ──
const NIQ = /[֑-ׇ]/g;
/** letters only (no points, no marks, no spaces): the same quote and reference is the same page */
const letters = (s) => String(s || '').replace(NIQ, '').replace(/[^א-ת0-9]/g, '');
const fnv = (s) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h.toString(36);
};
// (a quote: "…" or ״…״ — its opening mark at the line's start or after a space or a colon, so a reference's gershayim — רמב״ם, ע״ב — is no quote)
const QRE = /(^|[\s:])["“״]([^"”״]+)["”״]/;
/** a source line → its page { key, quote, lead, gloss, ref, note, line } — or null (a line without a quote: an המחשה note) */
export function parse32(line) {
  const s = draft30(String(line || '')),
    m = s.match(QRE);
  if (!m) return null;
  const at = m.index + m[1].length,
    lead = s.slice(0, at).replace(/[\s:—-]+$/, '').trim(),
    parts = s
      .slice(at + m[0].length - m[1].length)
      .split(' · ')
      .map((x) => x.trim())
      .filter(Boolean),
    note = parts.filter((x) => /^המחשה/.test(x)).join(' · '),
    rest = parts
      .filter((x) => x !== 'טיוטה' && !/^המחשה/.test(x))
      .map((x) => x.replace(/^—\s*/, '').trim())
      .filter(Boolean),
    ref = rest.length ? rest[rest.length - 1] : '',
    quote = m[2].trim();
  return { key: fnv(`${letters(quote)}|${letters(ref)}`), quote, lead, gloss: rest.slice(0, -1).join(' · '), ref, note, line: s };
}
/** an act's pages (its registered lines that carry a quote; one page per quote) */
export function pages32(id) {
  const S = SRC30[id];
  if (!S) return [];
  const out = [],
    keys = new Set();
  for (const x of S.all) {
    const p = parse32(x);
    if (p && !keys.has(p.key)) {
      keys.add(p.key);
      out.push(p);
    }
  }
  return out;
}
/** every page there is (M): key → { page, acts } in the morning's order */
export function allPages32() {
  const all = new Map();
  for (const id of J32.order)
    for (const p of pages32(id)) {
      const a = all.get(p.key);
      if (a) a.acts.push(id);
      else all.set(p.key, { page: p, acts: [id] });
    }
  return all;
}
/** the act ids of a day (the summary's rated acts) and the lots that gave them */
export function today32(ids) {
  const set = new Set((ids || []).filter((x) => J32.order.includes(x)));
  if (J32.first.some((x) => set.has(x))) set.add('lot');
  if (J32.second.some((x) => set.has(x))) set.add('lot2');
  return J32.order.filter((x) => set.has(x));
}
/** the journal's groups: each act met (or, with today, only today's), its pages and which are new */
export function groups32(save, today = null) {
  const j = jr32(save) || { acts: {}, seen: {} },
    only = Array.isArray(today) ? new Set(today32(today)) : null;
  return J32.order
    .filter((id) => j.acts[id] && SRC30[id] && (!only || only.has(id)))
    .map((id) => {
      const A = ACT30[id] || { he: id, icon: '•' };
      return { id, he: A.he, icon: A.icon, d: j.acts[id].d | 0, t: +j.acts[id].t || 0, old: !!j.acts[id].old, pages: pages32(id).map((p) => ({ ...p, isNew: !j.seen[p.key] })) };
    })
    .filter((g) => g.pages.length);
}
/** "N מתוך M": the pages he has (n), all there are (m), the new ones not yet opened (fresh) */
export function count32(save) {
  const all = allPages32(),
    have = new Map();
  for (const g of groups32(save)) for (const p of g.pages) have.set(p.key, p.isNew);
  let fresh = 0;
  for (const v of have.values()) if (v) fresh++;
  return { n: have.size, m: all.size, fresh };
}
/** the morning served (day33's morning30): its entry counts as a whole morning — the mornings before the journal are served30 less these */
export function served32(save, d) {
  const j = jr32(save),
    e = j && j.log.find((x) => obj(x) && x.d === (d | 0));
  if (!e || e.s) return false;
  e.s = 1;
  return true;
}
/** a page opened: no longer "חדש" */
export function seen32(save, key) {
  const j = jr32(save);
  if (!j || !key || j.seen[key]) return false;
  j.seen[key] = 1;
  return true;
}
/** the first page of an act — its end line's (SRC30[id].chip), the unlock card's and "לפתוח ביומן"'s */
export function mainPage32(id) {
  const S = SRC30[id],
    p = S && S.chip ? parse32(S.chip) : null;
  return p || pages32(id)[0] || null;
}

// ── the dates ──
/** the Hebrew date at the moment t (the day turns at sunset where the phone is: calendar.js hebrewDateAt) — "י״א בחשוון תשפ״ז" */
export function hebDate32(t, w = null) {
  try {
    const h = hebrewDateAt(new Date(+t), w && Number.isFinite(+w.lat) && Number.isFinite(+w.lon) ? { lat: +w.lat, lon: +w.lon } : undefined);
    return `${h.dayHe} ב${h.monthHe} ${String(h.yearHe).replace(/^[א-ת]׳/, '')}`;   // (the year without its thousands: תשפ״ז)
  } catch (e) {
    return '';
  }
}
/** the real date where the phone is — "יום חמישי, 22.10.2026" */
export function realDate32(t, tz) {
  if (!(+t > 0)) return '';
  const o = { weekday: 'long', day: 'numeric', month: 'numeric', year: 'numeric' };
  try {
    return new Intl.DateTimeFormat('he-IL', tz ? { ...o, timeZone: tz } : o).format(new Date(+t));
  } catch (e) {
    try {
      return new Intl.DateTimeFormat('he-IL', o).format(new Date(+t));
    } catch (e2) {
      return '';
    }
  }
}
