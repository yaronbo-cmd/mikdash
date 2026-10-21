/* ─────────────────────────────────────────────────────────────────────────────
 * avodah/hooks: the engagement layer of Phase B (HOOKS agent; docs/HOOKS.md §10–§11, docs/PLAYTEST.md "Phase B").
 * Pure functions over the Phase B save `A` (its own sub-object A.hk) + small HTML builders the HUD inserts.
 * No timers, no clock reads: every function takes `now`/`day`. What the playtest bots measured and what each
 * piece answers:
 *   pacing      a repeat of a mini-game gets a brief source card (tap for the source; it moves on by itself after
 *               a few seconds) and shorter walk-in/after waits: reading was 56–60% of a first session.
 *   points      the first play of a game on a Jerusalem day counts in full, a repeat the same day counts a little
 *               (POINTS.again): the binger no longer meets a third of the ממונים in one evening.
 *   ranks       one ממונה card per service (several met → one card), a longer RANKS ladder (state.js).
 *   mine        "העבודה שלך היום": the payis reveal → your role's work "בפועל" → the song: a 3-minute daily ritual
 *               (Wordle-sized) next to the full 14-game morning; a different role every day for 13 days.
 *   tiers       mastery per mini-game (למד · מיומן · בקי · מומחה): a reason to replay that is not points.
 *   today       the home's day panel: the payis, the work "בפועל", "נכחת בזמן", the morning x/14, the next
 *               appointment and what tomorrow brings.
 *   festival    Sukkot as a live event: the bulls 13 → 7 (70, Sukkah 55b), the water libation, Beit HaShoevah
 *               nights, "all the mishmarot serve" (Sukkah 5:7), the seven days of the festival (Shabbat counts).
 *   vessels     a collection from the steps played (content/tamid.json `vessels`, each with its source).
 *   streak      Shabbat and Yom Tov never count; one missed weekday a week is covered by itself (no purchase).
 *   phase A     Phase A's progress (read-only): the altar complete → "offerings before the Heichal" (Ezra 3:6).
 * Every text is a draft ("טיוטה") with its source; Divine Names are written ה׳.
 * ──────────────────────────────────────────────────────────────────────────── */
import { SHACHAR, GAMES, ROLES, role as roleById, STEPS, MEMUNIM } from '../data.js';
export { homeHTML as scenesHomeHTML, nextYomKippur } from './tour.js';   // (round 3) the tour's stamps and the coming Yom Kippur on the home

const DAY = 864e5;
const isObj = (o) => !!o && typeof o === 'object' && !Array.isArray(o);
const num = (v, d) => (typeof v === 'number' && Number.isFinite(v) ? v : d);
const LRI = '⁦', PDI = '⁩';
const iso = (n) => LRI + n + PDI;
export const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const civil = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' });
const jDay = (t) => civil.format(new Date(t));
export const addDays = (key, n) => new Date(Date.parse(key + 'T12:00:00Z') + n * DAY).toISOString().slice(0, 10);
const DRAFT = '<span class="av-draft">טיוטה</span>';

/** The hooks' own part of the save (kept by state.migrate: it spreads unknown keys). */
export function norm(A) {
  const h = isObj(A.hk) ? A.hk : {};
  A.hk = {
    ...h, v: 1, reveal: typeof h.reveal === 'string' ? h.reveal : '', perf: isObj(h.perf) ? h.perf : {}, days: isObj(h.days) ? h.days : {}, vessels: isObj(h.vessels) ? h.vessels : {},
    fest: isObj(h.fest) ? h.fest : {}, grace: typeof h.grace === 'string' ? h.grace : '', invite: typeof h.invite === 'string' ? h.invite : '',
    mine: isObj(h.mine) ? h.mine : {},
  };
  // keep the day log short (the last 60 days)
  const ks = Object.keys(A.hk.days).sort();
  while (ks.length > 60) delete A.hk.days[ks.shift()];
  return A.hk;
}

/* ───────── pacing: first time vs repeat ───────── */
export const PACE = { stageFirst: 2600, stageAgain: 1200, afterFirst: 2200, afterAgain: 900, autoMs: 4000 };
/** He finished this mini-game before (at any time): the repeat pacing applies. */
export const seenBefore = (A, id) => !!(A.games[id] && A.games[id].n > 0);
/** He already played this mini-game today (Jerusalem day): a repeat the same day counts a little. */
export const playedToday = (A, id, day) => !!(A.games[id] && A.games[id].t && jDay(A.games[id].t) === day);
export const stageCap = (A, id) => (seenBefore(A, id) ? PACE.stageAgain : PACE.stageFirst);
export const afterCap = (A, id) => (seenBefore(A, id) ? PACE.afterAgain : PACE.afterFirst);

/* ───────── mastery tiers per mini-game ───────── */
export const TIERS = [
  { k: 1, he: 'למד', n: 1, p: 0 },
  { k: 2, he: 'מיומן', n: 3, p: 1 },
  { k: 3, he: 'בקי', n: 7, p: 3 },
  { k: 4, he: 'מומחה', n: 15, p: 7 },
];
export function tierOf(A, id) {
  const g = A.games[id], n = g ? g.n : 0, p = num(A.hk && A.hk.perf[id], 0);
  let t = 0;
  for (const x of TIERS) if (n >= x.n && p >= x.p) t = x.k;
  return t;
}
export const tierHe = (k) => (TIERS[k - 1] || {}).he || '';
/** '2 פעמים עוד (אחת בלי טעויות) ל"בקי"' or '' at the top */
export function tierNextHe(A, id) {
  const k = tierOf(A, id), nx = TIERS[k];
  if (!nx) return '';
  const g = A.games[id], n = g ? g.n : 0, p = num(A.hk && A.hk.perf[id], 0);
  const dn = Math.max(0, nx.n - n), dp = Math.max(0, nx.p - p);
  const parts = [];
  if (dn) parts.push(dn === 1 ? 'עוד פעם אחת' : `עוד ${dn} פעמים`);
  if (dp) parts.push(dp === 1 ? 'פעם אחת בלי טעויות' : `${dp} פעמים בלי טעויות`);
  return parts.length ? `${parts.join(', ')} — ל"${nx.he}"` : '';
}
/** after a game: count a clean run; → the new tier when it went up (else 0) */
const TIER_BEFORE = new WeakMap();   // A → { id, tier } (not saved)
export function afterGame(A, id, r, day) {
  norm(A);
  const tb = TIER_BEFORE.get(A);
  const before = tb && tb.id === id ? tb.tier : tierOf(A, id);
  TIER_BEFORE.delete(A);
  if (r && r.perfect && !r.skipped) A.hk.perf[id] = num(A.hk.perf[id], 0) + 1;
  const d = A.hk.days[day] || (A.hk.days[day] = { g: 0, real: 0 });
  if (!(r && r.skipped)) d.g += 1;
  if (r && r.forReal && !r.skipped) d.real += 1;
  const vs = r && r.skipped ? [] : collectVessels(A, id, day);
  const after = tierOf(A, id);
  return { tierUp: after > before ? after : 0, vessels: vs };
}
/** call before learn(): remembers the tier before this play */
export function beforeGame(A, id) { norm(A); TIER_BEFORE.set(A, { id, tier: tierOf(A, id) }); }

/* ───────── "העבודה שלך היום": the daily ritual ───────── */
/** payis (the reveal, once a day) → [the ashes, when the first lot fell on him] → the role's own work → [the ketoret,
 *  when today is his] → the song and the prostration (Tamid 7:3). About three minutes. */
export function mineList(A, lots) {
  const L = lots || {}, r = roleById(L.role), list = [];
  if (!playedToday(A, 'payis2', L.day)) list.push('payis2');
  if (L.deshen) list.push('deshen');
  list.push(r && r.game && GAMES[r.game] ? r.game : 'zerika');
  if (L.ketoret === true && !(A.ketoret && A.ketoret.done)) list.push('payis3', 'ketoret');
  // the song closes the ritual — unless he already sang it today (a live morning's tail)
  if (!list.includes('shir') && !playedToday(A, 'shir', L.day)) list.push('shir');
  return list;
}
export const MINE_HE = 'העבודה שלך היום';
/** mark the ritual done for the day */
export function mineDone(A, day) { norm(A); A.hk.mine[day] = 1; const ks = Object.keys(A.hk.mine).sort(); while (ks.length > 30) delete A.hk.mine[ks.shift()]; }

/* ───────── ranks: one ממונה card per service ───────── */
/** → a card spec for the HUD ({kicker, cards, button}) or null */
export function memunimCard(before, after, toCard) {
  const met = [];
  for (let k = before; k < after; k++) if (MEMUNIM[k]) met.push(MEMUNIM[k]);
  if (!met.length) return null;
  const cards = met.map((m) => toCard({ ...m, summary_he: m.role_he })).filter(Boolean);
  return { kicker: met.length > 1 ? `פגשת ממונה · ${after}/15 (${met.length} חדשים)` : `פגשת ממונה · ${after}/15`, cards, button: 'המשך' };
}

/* ───────── vessels (content/tamid.json: each step's `vessels`, sourced by the step) ───────── */
const VESSEL_SKIP = new Set(['יין', 'גזרי עצים', 'שני גזירי עצים', 'עצי תאנה', 'מחתה']);   // wood and wine: materials; "מחתה" alone: the silver or the gold one
// the same thing named twice in the steps → one collectible
const VESSEL_ALIAS = { 'מחתת הכסף': 'מחתת כסף', 'שתי אבוקות של אור': 'אבוקות', 'מפתח': 'מפתחות העזרה', 'כף וכסויה': 'כף' };
const vKey = (v) => { const k = String(v).replace(/\s*\(.*?\)\s*/g, '').trim(); return VESSEL_ALIAS[k] || k; };
export const VESSELS = (() => {
  const out = new Map();
  for (const s of STEPS) for (const v of Array.isArray(s.vessels) ? s.vessels : []) {
    if (typeof v !== 'string') continue;
    const k = vKey(v);
    if (!k || VESSEL_SKIP.has(k) || out.has(k)) continue;
    out.set(k, { id: k, he: k, step: s.id, stepHe: s.name_he, source: s.source });
  }
  return [...out.values()];
})();
const STEP_GAME = Object.fromEntries(Object.entries(GAMES).flatMap(([g, d]) => (d.steps || []).map((s) => [s, g])));
/** the vessels of a game's steps: newly collected ones → [{he, source}] */
export function collectVessels(A, gameId, day) {
  norm(A);
  const got = [];
  for (const v of VESSELS) if (STEP_GAME[v.step] === gameId && !A.hk.vessels[v.id]) { A.hk.vessels[v.id] = day || 1; got.push(v); }
  return got;
}
export const vesselsCount = (A) => VESSELS.filter((v) => A.hk && A.hk.vessels[v.id]).length;

/* ───────── the streak: one missed weekday a week is covered by itself ───────── */
const weekOf = (key) => { const d = new Date(Date.parse(key + 'T12:00:00Z')); return addDays(key, -d.getUTCDay()); };   // the week's Sunday
/** for state.touchStreak: the days strictly between `last` and `day` that are not rest days are exactly one, and this
 *  week's cover is unused → true (and the cover is spent). Shabbat and Yom Tov never needed it. */
export function graceCovers(A, last, day, isRest = () => false) {
  norm(A);
  const missed = [];
  for (let k = addDays(last, 1), g = 0; k < day && g < 40; k = addDays(k, 1), g++) if (!isRest(k)) missed.push(k);
  if (missed.length !== 1) return false;
  const w = weekOf(missed[0]);
  if (A.hk.grace === w) return false;
  A.hk.grace = w;
  return true;
}

/* ───────── Sukkot, the live event ───────── */
export const BULLS = [13, 12, 11, 10, 9, 8, 7];   // Numbers 29:13–32 (70 in all)
/** the seven days of the festival he was there (Shabbat and Yom Tov count by themselves) */
export function festMark(A, th, day) {
  norm(A);
  if (!th || !th.sukkot) return 0;
  const f = A.hk.fest.sukkot || (A.hk.fest.sukkot = {});
  f[th.sukkot.day] = day || 1;
  return festCount(A, th);
}
/** o: { day: the Jerusalem civil day of now, isRest(key) } → Shabbat and Yom Tov days of the festival so far count by
 *  themselves (after sunset th is already tomorrow's Hebrew day: th.evening) */
export function festCount(A, th, o = {}) {
  const f = (A.hk && A.hk.fest.sukkot) || {};
  const cur = th && th.sukkot ? th.sukkot.day : 0;
  let n = 0;
  for (let d = 1; d <= 7; d++) {
    let rest = false;
    if (o.day && o.isRest && d <= cur) { try { rest = !!o.isRest(addDays(o.day, d - cur + (th.evening ? 1 : 0))); } catch (e) { rest = false; } }
    if (f[d] || rest) n++;
  }
  return n;
}

/* ───────── Phase A (read-only): where the builder is ───────── */
/** → { altar: bool (the horns done: the altar complete), done: bool (Chanukat HaBayit) } or null */
export function phaseAProgress(store) {
  try {
    const raw = store && store.get ? store.get('bh_beta2') : null;
    if (!raw) return null;
    const p = JSON.parse(raw);
    if (!isObj(p)) return null;
    const st = isObj(p.st) ? p.st : {};
    return { altar: !!(st.karnot && st.karnot.done), done: !!p.celeb };
  } catch (e) { return null; }
}
/** a one-shot "open Phase B at …" left by Phase A's invitation (the altar's first fire / the finale) */
export function takeIntent(store) {
  try {
    const v = store && store.get ? store.get('bh_avodah_intent') : null;
    if (v && store.set) store.set('bh_avodah_intent', '');
    // ── service13 ── (wave 13) Phase A may also invite straight into פיטום הקטורת or the pens (Beit Avtinas after the chambers)
    return v === 'mine' || v === 'shachar' || v === 'home' || v === 'pitum' || v === 'dir' ? v : null;
  } catch (e) { return null; }
}

/* ───────── what tomorrow brings (the reason to come back, no pressure) ───────── */
/** th1: dayTheme of tomorrow morning; rest(key) → Shabbat/Yom Tov */
export function tomorrowHe(A, th1, tomorrowKey, isRest) {
  const out = [];
  // (the callers print "מחר: " before the items)
  if (isRest && isRest(tomorrowKey)) out.push(`${th1 && th1.info && th1.info.isShabbat ? 'שבת' : 'יום טוב'} — מנוחה; הרצף שמור`);
  const done = Object.keys(A.roles || {}).filter((k) => A.roles[k] > 0).length;
  if (done < 13) out.push(`פיס חדש — ${13 - done === 1 ? 'נשאר תפקיד אחד' : `${13 - done} תפקידים`} שעוד לא עשית`);
  else out.push('פיס חדש — סבב שני של שלושה עשר התפקידים');
  if (th1 && th1.sukkot) out.push(`${th1.sukkot.day === 7 ? 'הושענא רבה: ' : ''}${th1.sukkot.bulls || BULLS[th1.sukkot.day - 1]} פרים במוסף`);
  if (th1 && th1.psalm && th1.psalm.first_words_he) out.push(`הלויים ישירו "${th1.psalm.first_words_he}"`);   // ── avoda12 ── the song of the day, every day
  return out;
}

/* ───────── HTML for the HUD (ui.js inserts these; ui.css.js holds the .hk-* styles) ───────── */
/** the day panel at the top of "היום" */
export function todayHTML(m, o = {}) {
  const A = m.A, L = A.lots && A.lots.day === m.day ? A.lots : null, R = L && roleById(L.role);
  norm(A);
  const d = A.hk.days[m.day] || { g: 0, real: 0 };
  const live = !!(A.live && A.live[m.day] && A.live[m.day].length);
  const mine = !!A.hk.mine[m.day];
  const pip = (on, label, sub) => `<div class="hk-pip ${on ? 'on' : ''}"><i></i><b>${esc(label)}</b><small>${esc(sub)}</small></div>`;
  let h = '<div class="av-box hk-today">';
  h += `<div class="hk-pips">${pip(!!L, 'הפייס', R ? R.win : 'מחכה לך')}${pip(d.real > 0, 'בפועל', d.real ? 'עשית היום' : R ? 'עוד לא' : '—')}${pip(live, 'נכחת בזמן', live ? 'היום' : 'בחלון חי')}</div>`;
  h += `<div class="av-bar"><i style="width:${Math.round((m.todayDone / m.shachar.length) * 100)}%"></i></div><small class="hk-line">התמיד של שחר היום: ${iso(`${m.todayDone}/${m.shachar.length}`)}${mine ? ' · העבודה שלך היום — נעשתה' : ''}</small>`;
  // always there; gold unless a live segment he has not joined yet is on (then "הצטרף עכשיו" is the gold one) or it is
  // already done today (then it is only an offer to practise again)
  h += `<button class="av-btn${o.live || mine ? '' : ' gold'} hk-mine" data-play="mine">${mine ? 'שוב: ' : ''}${MINE_HE}<small>${R ? `הפייס כבר נפל: ${esc(R.win)}` : 'הפייס, התפקיד שלך בפועל, והשיר'} · כ־3 דקות</small></button>`;
  if (o.next) h += `<small class="hk-line">הבא במקדש: <b>${esc(o.next)}</b></small>`;
  if (o.tomorrow && o.tomorrow.length) h += `<small class="hk-line hk-soft">מחר: ${esc(o.tomorrow.join(' · '))}</small>`;
  return h + '</div>';
}
/** a line under the home header when Phase A is not finished yet (the owner's order: the service after Chanukat HaBayit) */
export function phaseAHTML(pa) {
  if (!pa || pa.done) return '';
  return `<div class="av-box hk-pa"><small>${pa.altar ? 'המזבח שלם, והבית עוד נבנה: מקריבים עוד לפני שיש היכל — "וְהֵיכַל ה׳ לֹא יֻסָּד" (עזרא ג, ו).' : 'הבית עדיין בבנייה (שלב א׳): זו הצצה לעבודה שתתחיל בחנוכת הבית.'} ${DRAFT}</small></div>`;
}
/** Sukkot: the bulls strip, the mishmarot, the festival days */
export function sukkotHTML(th, A, o = {}) {
  if (!th || !th.sukkot) return '';
  const day = th.sukkot.day, sofar = BULLS.slice(0, day).reduce((a, b) => a + b, 0);
  let h = '<div class="hk-fest">';
  h += `<div class="hk-bulls" aria-label="פרי החג">${BULLS.map((b, i) => `<span class="${i + 1 < day ? 'past' : i + 1 === day ? 'now' : ''}">${iso(b)}</span>`).join('')}</div>`;
  h += `<small>פרי החג: היום ${iso(th.sukkot.bulls || BULLS[day - 1])} · ${iso(sofar)} מתוך ${iso(70)} עד היום — "שבעים פרים כנגד מי? כנגד שבעים אומות" (סוכה נה, ב) ${DRAFT}</small>`;
  h += `<small>"וַיַּעֲשׂוּ אֶת חַג הַסֻּכּוֹת כַּכָּתוּב וְעֹלַת יוֹם בְּיוֹם בְּמִסְפָּר" (עזרא ג, ד) ${DRAFT}</small>`;
  h += `<small><b>ברגל כל המשמרות עולות</b>${o.mishmarHe ? ` — גם משמר ${esc(o.mishmarHe)} שלך` : ''}: "בִּשְׁלשָׁה פְרָקִים בַּשָּׁנָה הָיוּ כָּל מִשְׁמָרוֹת שָׁווֹת" (סוכה ה, ז) ${DRAFT}</small>`;
  const n = festCount(A, th, o);
  h += `<small>שבעת ימי החג שלך: ${iso(`${n}/7`)} (שבת ויום טוב נחשבים מעצמם)</small>`;
  return h + '</div>';
}
/** "הדרך שלי": mastery and the vessels */
export function pathHTML(A, o = {}) {
  norm(A);
  let h = '';
  const played = SHACHAR.concat(['korbanot', 'musaf', 'erev', 'neirot', 'aravot', 'shoevah', 'lechem']).filter((g) => A.games[g]);
  if (played.length) {
    h += `<div class="av-sec">שליטה בעבודות</div><div class="hk-tiers">`;
    for (const g of played) { const k = tierOf(A, g); h += `<span title="${esc(tierNextHe(A, g))}"><b>${esc(GAMES[g] ? GAMES[g].he : g)}</b><i class="hk-t${k}">${esc(tierHe(k))}</i></span>`; }
    h += `</div><small class="hk-line hk-soft">למד · מיומן (3, אחת בלי טעויות) · בקי (7, שלוש) · מומחה (15, שבע). טעות לעולם אינה מורידה דרגה.</small>`;
  }
  const n = vesselsCount(A);
  h += `<div class="av-sec">כלי העבודה (${iso(`${n}/${VESSELS.length}`)})</div><div class="hk-vessels">`;
  for (const v of VESSELS) { const got = !!A.hk.vessels[v.id]; h += `<span class="${got ? 'got' : ''}" title="${got ? esc(`${v.stepHe} · ${v.source}`) : ''}">${got ? esc(v.he) : '?'}</span>`; }
  h += `</div><small class="hk-line hk-soft">כל כלי נאסף בעבודה שבה משתמשים בו, לפי המשנה (בעיקר מסכת תמיד). ${DRAFT}</small>`;
  if (o.mishmar) h += `<div class="av-box"><h3>המשמר שלך</h3><small>${esc(o.mishmar)}</small></div>`;
  return h;
}
/** "משמר X עולה בעוד N שבועות" from calendar.currentMishmar (a 24-week turn) */
export function mishmarHe(A, cur, MISHMAROT, now) {
  if (!A.mishmar || !cur || !cur.index) return '';
  const w = (((A.mishmar - cur.index) % 24) + 24) % 24;
  const name = MISHMAROT ? MISHMAROT[A.mishmar - 1] : '';
  if (w === 0) return `משמר ${name} עובד השבוע! כל עבודה בזמן אמת השבוע — "נכחת בזמן" כפול.`;
  const at = cur.weekStart ? new Date(+cur.weekStart + w * 7 * DAY) : null;
  return `משמר ${name} עולה לירושלים בעוד ${w === 1 ? 'שבוע' : `${w} שבועות`}${at ? ` (משבת ${at.toLocaleDateString('he-IL', { timeZone: 'Asia/Jerusalem', day: 'numeric', month: 'numeric' })})` : ''}. בשלושת הרגלים כל המשמרות עולות (סוכה ה, ז).`;
}
/** his mishmar's week, or a festival (all the mishmarot serve): the live mark counts double */
export const mishmarWeek = (A, cur, th) => !!((cur && A.mishmar && cur.index === A.mishmar) || (th && th.kind === 'festival'));

/* ───────── the brief source card of a repeat ───────── */
/** the first card's title as one line + its source; the whole card folded under "למקור" */
export function briefHTML(first, cardHTML) {
  if (!first) return '';
  return `<div class="hk-brief"><b>${esc(first.title)}</b>${first.source ? ` <span class="av-ref">${esc(first.source)}</span>` : ''}</div><details class="hk-src"><summary>למקור ולהסבר</summary><div class="av-sub">${cardHTML(first)}</div></details>`;
}
