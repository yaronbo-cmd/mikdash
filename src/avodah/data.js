/* ─────────────────────────────────────────────────────────────────────────────
 * data.js: the ONLY module of Phase B that reads content/*.json (the Avodah database, all drafts).
 *
 * - Tolerant: a missing file field never throws; every accessor has a default.
 * - Every item keeps its `status`; `isDraft(item)` is true unless the owner approved it (PROJECT.md §2.2).
 *   The UI shows a "טיוטה" tag on every draft card; with options.production only approved items are shown.
 * - FALLBACK: the details the other content files do not hold, from content/avodah_fallbacks.json (verified on Sefaria
 *   in two passes by the content agent; docs/CONTENT-S3.md §4). They are drafts too.
 * - GAPS: content/avodah_gaps.json (CONTENT-S3 §5): the lottery's method, the song's three פרקים and the day's 21 blasts, the
 *   psalms of the musaf days and of the afternoon, the kiddush posture, Sukkah 5:2, the afternoon's eleven kohanim. Shown
 *   where the games touch them, as drafts with their source; an item with needs_check shows "בבדיקה".
 * - GARMENTS: content/garments.json (the priestly garments; the hooks read content only through this module).
 * - Divine Names are never written in full (PROJECT.md §2.3): the content writes ה׳, אלקים, א-ל.
 * ──────────────────────────────────────────────────────────────────────────── */
import tamidJson from '../../content/tamid.json' with { type: 'json' };
import korbanotJson from '../../content/korbanot.json' with { type: 'json' };
import calJson from '../../content/calendar_offerings.json' with { type: 'json' };
import shirJson from '../../content/shir_shel_yom.json' with { type: 'json' };
import memunimJson from '../../content/memunim.json' with { type: 'json' };
import fbJson from '../../content/avodah_fallbacks.json' with { type: 'json' };
import gapsJson from '../../content/avodah_gaps.json' with { type: 'json' };
import garmentsJson from '../../content/garments.json' with { type: 'json' };
import dayJson from '../../content/avodah_day.json' with { type: 'json' };   // ── avoda12 ── the day in detail (wave 12)
import ketoretJson from '../../content/ketoret.json' with { type: 'json' };   // ── service13 ── פיטום הקטורת (wave 13)

const arr = (x) => (Array.isArray(x) ? x : []);
const obj = (x) => (x && typeof x === 'object' && !Array.isArray(x) ? x : {});
const str = (x, d = '') => (typeof x === 'string' ? x : d);

/** true unless the owner approved the item (missing status = draft). */
export const isDraft = (item) => !item || item.status !== 'approved';

/* ───────── the 40 steps of the day (tamid.json) ───────── */
export const STEPS = arr(tamidJson).filter((s) => s && s.id).map((s, i) => ({
  ...s, order: typeof s.order === 'number' ? s.order : i + 1, name_he: str(s.name_he, s.id), summary_he: str(s.summary_he),
  quote: str(s.quote), quote_nikud: str(s.quote_nikud), source: str(s.source), status: str(s.status, 'draft'),
}));
const STEP_IX = Object.fromEntries(STEPS.map((s) => [s.id, s]));
export const step = (id) => STEP_IX[id] || null;

/* ───────── offerings (korbanot.json) ───────── */
export const KORBANOT = arr(korbanotJson).filter((k) => k && k.id).map((k) => ({
  ...k, name_he: str(k.name_he, k.id), category: str(k.category), slaughter_place: str(k.slaughter_place),
  blood_application: str(k.blood_application), blood_remnants: str(k.blood_remnants), burned: str(k.burned),
  eaten_by: str(k.eaten_by), eating_place: str(k.eating_place), eating_time: str(k.eating_time),
  quote: str(k.quote), source: str(k.source), status: str(k.status, 'draft'),
}));
export const korban = (id) => KORBANOT.find((k) => k.id === id) || null;

/* ───────── the calendar of offerings ───────── */
const CAL = obj(calJson);
export const DAILY_TAMID = obj(CAL.daily_tamid);
export const PER_ANIMAL = obj(CAL.per_animal);
export const MUSAF = arr(CAL.musaf).filter((m) => m && m.day_id);
export const RULES = arr(CAL.rules);
export const EVENTS = arr(CAL.events).filter((e) => e && e.id);
export const event = (id) => EVENTS.find((e) => e.id === id) || null;
export const rule = (id) => RULES.find((r) => r.id === id) || null;

// content month names → calendar.js keys
const MONTH = { Tishri: 'Tishrei', Tishrei: 'Tishrei', Nisan: 'Nisan', Sivan: 'Sivan', Adar: 'Adar', Iyar: 'Iyar', Av: 'Av', Elul: 'Elul', Kislev: 'Kislev', Tevet: 'Tevet' };
function matches(when, info) {
  const w = obj(when), h = obj(info && info.hebrew);
  if (typeof w.weekday === 'number') return info && info.weekday === w.weekday;
  if (w.rule === 'rosh_chodesh') return !!(info && info.isRoshChodesh);
  if (w.rule === 'daily') return true;
  if (w.hebrew_month) {
    const m = MONTH[w.hebrew_month] || w.hebrew_month;
    const month = h.month === 'AdarII' ? 'Adar' : h.month;
    if (m !== month) return false;
    if (Array.isArray(w.days)) return w.days.includes(h.day);
    if (typeof w.day === 'number') return w.day === h.day;
    return false;
  }
  return false;
}
/**
 * The musaf offerings of a day, in the order of "כל התדיר מחברו קודם" (Zevachim 10:1): Shabbat, then Rosh
 * Chodesh, then the festival. @param info calendar.dayInfo(...)
 */
export function musafOf(info) {
  if (!info) return [];
  const rank = (m) => (m.day_id === 'shabbat' ? 0 : m.day_id === 'rosh_chodesh' ? 1 : 2);
  // 1 Tishrei: its musaf entry already says "מלבד מוסף ראש חודש"; both are brought (Numbers 29:6)
  return MUSAF.filter((m) => matches(m.when, info)).sort((a, b) => rank(a) - rank(b));
}
/** Special events of a day (lechem hapanim, nisuch hamayim, simchat beit hashoevah, …). */
export const eventsOf = (info) => EVENTS.filter((e) => matches(e.when, info));

/* ───────── the song of the day (shir_shel_yom.json) ───────── */
export const SHIR = arr(shirJson).filter((s) => s && typeof s.js_weekday === 'number');
export const shirOf = (weekday) => SHIR.find((s) => s.js_weekday === weekday) || SHIR[0] || null;

/* ───────── ── avoda12 ── the day in detail: content/avodah_day.json (wave 12; drafts, each with its source) ─────────
 * The Levites' song every day (why today's psalm, RH 31a; the instruments and the chalil's twelve days, Arachin 2:3; the
 * ma'amad, Yoma 20b; Shabbat's Haazinu, RH 31a) and the new moments of the day: the gates' three blasts (Sukkah 5:5), the 93
 * vessels (Tamid 3:4), the chavitin (Rambam, Maaseh HaKorbanot 13:2–4), tomorrow's lamb (Tamid 3:4; Arachin 2:5), the closing
 * of the gates (Shekalim 5:1) and the fire that burns all night (Lev. 6:6). */
export const DAY = Object.fromEntries(arr(dayJson).filter((x) => x && typeof x.id === 'string').map((x) => [x.id, {
  ...x, name_he: str(x.name_he, x.id), summary_he: str(x.summary_he), quote: str(x.quote), quote_nikud: str(x.quote_nikud),
  source: str(x.source), status: str(x.status, 'draft'), needs_check: !!x.needs_check, note: str(x.note), game: obj(x.game),
}]));
export const dayItem = (id) => DAY[id] || null;
/** A day item as one verified line for a game's card (api.cite): { quote, source, needsCheck, status } or null. */
export function dayLine(id) {
  const d = DAY[id];
  if (!d) return null;
  const q = d.quote_nikud || d.quote;
  return q ? { quote: q, source: d.source, needsCheck: d.needs_check, status: d.status } : null;
}
/** Why the Levites sang this psalm today (Rosh Hashanah 31a): "על שם …", by js weekday (0 = Sunday), or ''. */
export function shirWhy(weekday) { const w = arr(obj((DAY.shir_why || {}).game).why_he); return str(w[weekday]); }
/**
 * "ובשנים עשר יום בשנה החליל מכה לפני המזבח" (Arachin 2:3): with the Tamid's song on the first day of Pesach, Shavuot and
 * the eight days of the Chag (15–22 Tishrei). (The two Pesach slaughters: at the slaughter, not with the Tamid's song.)
 * @param info calendar.dayInfo(...) (theme.info) → true when the chalil plays before the altar today
 */
export function chalilToday(info) {
  const h = info && info.holiday;
  if (!h) return false;
  return h.id === 'sukkot' || h.id === 'shemini-atzeret' || h.id === 'shavuot' || (h.id === 'pesach' && h.day === 1);
}
/** Shabbat's musaf song: one of Haazinu's six parts ("הזי״ו ל״ך", RH 31a; Rashi's openings) → { n: 1…6, he } or null.
 *  ⚑ which part on which Shabbat is not known: a six-Shabbat cycle counted from a fixed Shabbat (ours). */
export function haazinuPart(dayKey) {
  const parts = arr(obj((GAPS.shir_shabbat_musaf_mincha || {}).game).haazinu_parts_he);
  if (!parts.length) return null;
  const t = Date.parse(String(dayKey || '') + 'T12:00:00Z');
  const weeks = isFinite(t) ? Math.floor((t - Date.parse('2025-09-27T12:00:00Z')) / (7 * 864e5)) : 0;   // Shabbat 5 Tishrei 5786
  const n = ((weeks % 6) + 6) % 6;
  return { n: n + 1, he: str(parts[n]) };
}

/* ───────── the 15 ממונים (memunim.json): the rank ladder, in the Mishnah's order (Shekalim 5:1) ───────── */
export const MEMUNIM = arr(memunimJson).filter((m) => m && m.id).sort((a, b) => (a.order || 0) - (b.order || 0));

/* (mishmarot.json is not read yet: the names come from calendar.js MISHMAROT; the rotation rules are for Sprint 4.) */

/* ───────── fallback texts: content/avodah_fallbacks.json (the CONTENT agent, verified in two passes; drafts) ─────────
 * The 20 details the other content files do not hold (the lottery, the kiyor, the ashes, the wood, the Menorah stone, the red
 * line, the aravot, Beit HaShoevah, Kelim 1:9, the bowls, the mukhni, the six lambs, the Levites, the Gazit). Same ids as
 * before; each item keeps its status, needs_check and note. card() prefers quote_nikud and falls back to quote (Bavli: none). */
export const FALLBACK = Object.fromEntries(arr(fbJson).filter((x) => x && x.id).map((x) => [x.id, { ...x, status: str(x.status, 'draft'), fallback: true }]));

/* ───────── the Avodah gaps: content/avodah_gaps.json (CONTENT-S3 §5; drafts; missing fields tolerated) ───────── */
export const GAPS = Object.fromEntries(arr(gapsJson).filter((x) => x && typeof x.id === 'string').map((x) => [x.id, {
  ...x, name_he: str(x.name_he, x.id), summary_he: str(x.summary_he), quote: str(x.quote), quote_nikud: str(x.quote_nikud),
  source: str(x.source), status: str(x.status, 'draft'), needs_check: !!x.needs_check, note: str(x.note), views: arr(x.views).filter((v) => v && (v.quote || v.quote_nikud)), game: obj(x.game),
}]));
export const gap = (id) => GAPS[id] || null;
/** a gap item's game numbers with a default: gapGame('shir_perakim', 'perakim', 3) → 3 */
export function gapGame(id, key, d) { const g = GAPS[id]; const v = g && g.game ? g.game[key] : undefined; return v === undefined || v === null ? d : v; }
/** One verified line of a gap item, for a mini-game's own card: { quote, source, needsCheck } (the item's quote, or its view
 *  `who` / index), or null. The game shows it with the draft tag, the source, and "בבדיקה" when needs_check. */
export function gapLine(id, view) {
  const g = GAPS[id];
  if (!g) return null;
  const v = view === undefined ? g : typeof view === 'number' ? g.views[view] : g.views.find((x) => str(x.who_he) === view);
  if (!v) return null;
  const q = str(v.quote_nikud) || str(v.quote);
  return q ? { quote: q, source: str(v.source, g.source), needsCheck: g.needs_check, status: g.status } : null;
}

/* ───────── the priestly garments: content/garments.json (for the hooks' collection; docs/HOOKS.md §13) ───────── */
export const GARMENT_ITEMS = arr(garmentsJson).filter((x) => x && typeof x.id === 'string').map((x) => ({
  ...x, name_he: str(x.name_he, x.id), summary_he: str(x.summary_he), quote: str(x.quote), quote_nikud: str(x.quote_nikud),
  source: str(x.source), status: str(x.status, 'draft'), needs_check: !!x.needs_check,
})).sort((a, b) => (a.order || 0) - (b.order || 0));
export const garmentItem = (id) => GARMENT_ITEMS.find((x) => x.id === id) || null;
/** The eight garments in the Mishnah's order (Yoma 7:5): the four of every kohen, then the four the Kohen Gadol adds →
 *  [{ id, he, gadol, n, source, status }] (from four_and_eight.garments; [] when the file lacks it) */
export const GARMENTS = (() => {
  const it = garmentItem('four_and_eight'), g = obj(it && it.garments);
  const list = [...arr(g.kohen).map((x) => ({ x, gadol: false })), ...arr(g.gadol_adds).map((x) => ({ x, gadol: true }))];
  return list.filter((o) => o.x && typeof o.x.id === 'string').map((o, i) => ({ id: o.x.id, he: str(o.x.he, o.x.id), gadol: o.gadol, n: i + 1, source: it ? it.source : '', status: it ? it.status : 'draft' }));
})();

/* Visible blemishes of a lamb (Mishnah Bekhorot 6; verified 2026-09-25): the inspection by torchlight (Tamid 3:4).
 * `blemish: false` items are the Mishnah's own "not a blemish" cases: they make the check a real judgement. */
export const BLEMISHES = [
  { id: 'ear-cartilage', part: 'ear', blemish: true, he: 'האוזן נפגמה מן הסחוס', quote: 'נִפְגְּמָה אָזְנוֹ מִן הַסְּחוּס', source: 'בכורות ו, א' },
  { id: 'ear-skin', part: 'ear', blemish: false, he: 'שריטה בעור האוזן בלבד — לא בסחוס', quote: 'אֲבָל לֹא מִן הָעוֹר', source: 'בכורות ו, א' },
  { id: 'ear-split', part: 'ear', blemish: true, he: 'האוזן נסדקה', quote: 'נִסְדְּקָה אַף עַל פִּי שֶׁלֹּא חָסְרָה', source: 'בכורות ו, א' },
  { id: 'eyelid', part: 'eye', blemish: true, he: 'ריס העין נקוב או פגום', quote: 'רִיס שֶׁל עַיִן שֶׁנִּקַּב, שֶׁנִּפְגַּם, שֶׁנִּסְדַּק', source: 'בכורות ו, ב' },
  { id: 'eye-white', part: 'eye', blemish: false, he: 'סימן בלובן העין — לא בשחור', quote: 'שֶׁאֵין מוּמִים בַּלָּבָן', source: 'בכורות ו, ב' },
  { id: 'nose', part: 'nose', blemish: true, he: 'החוטם נקוב או פגום', quote: 'חָטְמוֹ שֶׁנִּקַּב, שֶׁנִּפְגַּם, שֶׁנִּסְדַּק', source: 'בכורות ו, ד' },
  { id: 'lip', part: 'lip', blemish: true, he: 'השפה נפגמה', quote: 'שְׂפָתוֹ שֶׁנִּקְּבָה, שֶׁנִּפְגְּמָה, שֶׁנִּסְדְּקָה', source: 'בכורות ו, ד' },
].map((b) => ({ ...b, status: 'draft', fallback: true }));

/* Wood for the pyre (Tamid 2:3). */
export const WOODS = [
  { id: 'fig', he: 'תאנה', ok: true, fig: true, color: '#9A7B55', leaf: 'fig' },
  { id: 'nut', he: 'אגוז', ok: true, color: '#6E4E33', leaf: 'nut' },
  { id: 'shemen', he: 'עץ שמן', ok: true, color: '#8C6A3F', leaf: 'pine' },
  { id: 'olive', he: 'זית', ok: false, color: '#7C7A55', leaf: 'olive' },
  { id: 'vine', he: 'גפן', ok: false, color: '#5E3F2E', leaf: 'vine' },
];

/* ───────── the 13 roles of the second lottery (Tamid 3:1), from payis_2.decides_he ───────── */
const DECIDES = arr((step('payis_2') || {}).decides_he);
const ROLE_DEFS = [
  ['shochet', 'zerika'], ['zorek', 'zerika'], ['dishun-mizbeach', 'heichal'], ['dishun-menorah', 'heichal'],
  ['rosh-regel', 'evarim'], ['yadayim', 'evarim'], ['oketz-regel', 'evarim'], ['chaze-gera', 'evarim'],
  ['dofanot', 'evarim'], ['kerayim', 'evarim'], ['solet', 'evarim'], ['chavitin', 'evarim'], ['yayin', 'evarim'],
];
const ROLE_FALLBACK_HE = ['מי שוחט', 'מי זורק את הדם', 'מי מדשן את המזבח הפנימי', 'מי מדשן את המנורה', 'הראש והרגל', 'שתי הידיים', 'העוקץ והרגל', 'החזה והגרה', 'שתי הדפנות', 'הקרביים', 'הסולת', 'החביתין', 'היין'];
/** role names as the winner hears them ("זכית ב…") */
const ROLE_WIN_HE = ['שחיטת התמיד', 'זריקת הדם', 'דישון מזבח הזהב', 'דישון המנורה', 'הראש והרגל הימנית', 'שתי הידיים', 'העוקץ והרגל השמאלית', 'החזה והגרה', 'שתי הדפנות', 'הקרביים והכרעיים', 'הסולת', 'החביתין', 'היין'];
export const ROLES = ROLE_DEFS.map(([id, game], i) => ({ id, game, n: i + 1, he: str(DECIDES[i], ROLE_FALLBACK_HE[i]), win: ROLE_WIN_HE[i], limb: i >= 4 ? i - 3 : 0 }));
export const role = (id) => ROLES.find((r) => r.id === id) || null;

/* The nine carriers in a row, in the Mishnah's order (Tamid 4:3), from limbs_row.carriers. */
const CARRIER_FALLBACK = ['הראש בימינו והרגל הימנית בשמאלו', 'שתי הידיים', 'העוקץ בימינו והרגל השמאלית בשמאלו', 'החזה בימינו והגרה בשמאלו', 'שתי הדפנות', 'הקרביים בבזך, והכרעיים עליהם', 'הסולת', 'החביתין', 'היין'];
const CARRIER_SHORT = ['ראש ורגל ימין', 'שתי הידיים', 'עוקץ ורגל שמאל', 'חזה וגרה', 'שתי הדפנות', 'קרביים וכרעיים', 'סולת', 'חביתין', 'יין'];
export const CARRIERS = CARRIER_FALLBACK.map((d, i) => {
  const c = arr((step('limbs_row') || {}).carriers).find((x) => x && x.n === i + 1);
  return { n: i + 1, he: str(c && c.carries_he, d), short: CARRIER_SHORT[i], role: ROLES[4 + i] ? ROLES[4 + i].id : null };
});

/* ───────── mini-games → the steps of the day they teach (the 40 of ספר העבודה) ───────── */
export const GAMES = {
  payis1: { he: 'הפיס הראשון', steps: ['night_watch', 'immersion', 'payis_1'], fb: ['payis_race', 'payis_fingers', 'payis_count'], gaps: ['payis_method'] },
  kiddush: { he: 'קידוש ידיים ורגליים', steps: ['patrol'], fb: ['mukhni', 'kiyor'], gaps: ['kiddush_posture'] },
  deshen: { he: 'תרומת הדשן', steps: ['terumat_hadeshen'], fb: ['deshen_walk', 'deshen_place'] },
  maaracha: { he: 'סידור המערכה', steps: ['clearing_altar', 'maarachah_gedolah', 'maarachah_ketoret'], fb: ['wood'] },
  payis2: { he: 'הפיס השני', steps: ['payis_2'], fb: ['gazit', 'payis_circle'] },
  barkai: { he: 'ברקאי', steps: ['dawn_check'], fb: [] },
  taleh: { he: 'בדיקת הטלה', steps: ['lamb', 'to_slaughterhouse'], fb: ['six_lambs'] },
  heichal: { he: 'בהיכל: דישון והטבה', steps: ['heichal_gate', 'dishun_inner_altar', 'hatavat_5'], fb: ['menorah_stone', 'kelim_1_9'] },
  zerika: { he: 'שחיטה, קבלה וזריקה', steps: ['shechita', 'blood'], fb: ['red_line'] },
  evarim: { he: 'האברים לכבש', steps: ['hafshet', 'limbs_row', 'shema'], fb: [] },
  payis3: { he: 'חדשים לקטורת', steps: ['payis_3', 'payis_4'], fb: ['ketoret_once'] },
  ketoret: { he: 'הקטורת', steps: ['ketoret_machta', 'magrefa', 'ulam_steps', 'hatavat_2', 'machta_inner', 'ketoret', 'prostration_heichal'], fb: [] },
  birkat: { he: 'ברכת כהנים', steps: ['birkat_kohanim'], fb: [] },
  shir: { he: 'נסכים ושיר של יום', steps: ['limbs_to_altar', 'mincha_chavitin', 'nesachim', 'shir', 'hishtachavaya'], fb: ['bowls', 'levites_instruments'], gaps: ['shir_perakim', 'trumpets_count'], day: ['shir_why', 'chalil_days', 'maamad'] },
  // ── avoda12 ── the day in detail (wave 12): short moments with no step of their own in ספר העבודה (its 40 stay as they are)
  chavitin: { he: 'החביתין', steps: [], fb: [], day: ['chavitin_make', 'chavitin_split'] },
  shaarim: { he: 'פתיחת השערים', steps: [], fb: [], gaps: ['trumpets_count'], day: ['gates_blasts', 'azara_gates'] },
  kelim: { he: 'תשעים ושלשה כלים', steps: [], fb: [], day: ['kelim_93'] },
  machar: { he: 'הטלה של מחר', steps: [], fb: ['six_lambs'], day: ['machar_lamb'] },
  neilah: { he: 'נעילת השערים', steps: [], fb: [], day: ['neilat_shearim', 'esh_tamid'] },
  // ── /avoda12 ──
  // ── service13 ── wave 13: פיטום הקטורת at Beit Avtinas (ketoret.json items: ket), and the pens and the lambs' chamber
  pitum: { he: 'פיטום הקטורת', steps: [], fb: [], ket: ['ketoret_spices', 'grinding_chant', 'ketoret_total', 'beit_avtinas', 'chelbenah_lesson'] },
  dir: { he: 'הדיר ולשכת הטלאים', steps: [], fb: ['six_lambs'] },
  // ── /service13 ──
  korbanot: { he: 'קרבנות העולים לרגל', steps: [], fb: [] },
  musaf: { he: 'מוסף היום', steps: ['musafim'], fb: [], ev: [], gaps: ['shir_shabbat_musaf_mincha', 'shir_musaf_days'] },
  erev: { he: 'התמיד של בין הערביים', steps: ['tamid_erev', 'erev_limbs'], fb: [], gaps: ['erev_eleven', 'shir_afternoon'] },
  neirot: { he: 'קטורת והדלקת הנרות', steps: ['ketoret_erev', 'night_burning'], fb: [] },
  aravot: { he: 'ערבות סביב המזבח', steps: [], fb: ['aravot', 'aravot_shabbat'], gaps: ['aravot_timing'] },
  shoevah: { he: 'שמחת בית השואבה', steps: [], fb: ['shoevah_dance'], ev: ['simchat_beit_hashoevah'], gaps: ['shoevah_when_where'] },
  lechem: { he: 'לחם הפנים', steps: [], fb: [], ev: ['lechem_hapanim'] },
};

/** The morning service in the Mishnah's order (Tamid 1–7). */
export const SHACHAR = ['payis1', 'kiddush', 'chavitin', 'deshen', 'maaracha', 'payis2', 'barkai', 'shaarim', 'kelim', 'taleh', 'heichal', 'zerika', 'evarim', 'payis3', 'ketoret', 'birkat', 'shir'];
/** The afternoon Tamid: "as in the morning, except the lifting of the ashes, the pyres and the lotteries" (Rambam).
 *  ── avoda12 ── then the other half of the chavitin before the wine ("חביתין לנסכין"), tomorrow's lamb and the gates closed. */
export const EREV = ['erev', 'zerika', 'evarim', 'neirot', 'chavitin', 'shir', 'machar', 'neilah'];
/** ── avoda12 ── the moments added in wave 12 (the day in detail; docs/AVODAH.md §0.12) */
export const DETAIL = ['chavitin', 'shaarim', 'kelim', 'machar', 'neilah'];

/** "בבדיקה" — the chip of an item the content agent still checks (needs_check) */
export const CHECK_HE = 'בבדיקה';
/** A content card: title, plain summary, verbatim quote, source, draft flag. Tolerant of any item shape.
 *  needs_check: the source line ends with " · בבדיקה" (the card shows it until the HUD draws its own chip for needsCheck).
 *  The fallbacks are in the content files now (content/avodah_fallbacks.json), so they no longer carry the "waiting for the
 *  content agent" note (`fallback` false; `fromFallbacks` keeps where they came from). */
export function card(item) {
  if (!item) return null;
  const needsCheck = !!item.needs_check, source = str(item.source);   // (the "בבדיקה" chip is drawn by ui.js cardHTML)
  return {
    id: item.id || '', title: str(item.name_he || item.nameHe || item.title), summary: str(item.summary_he || item.he),
    quote: str(item.quote_nikud || item.quote), source, draft: isDraft(item), note: str(item.note),
    needsCheck, fallback: !!item.fallback && !FALLBACK[item.id], fromFallbacks: !!FALLBACK[item.id],
  };
}
/** Cards shown after a mini-game: its tamid.json steps, then its fallback items, then its gap items (avodah_gaps.json). */
export function cardsFor(gameId) {
  const g = GAMES[gameId];
  if (!g) return [];
  // ── avoda12 ── a new moment (no step of the 40) leads with its own items; a game with steps keeps them first
  const day = [...(g.ket || []).map((k) => KETORET[k]), ...(g.day || []).map(dayItem)], first = g.steps.length ? [] : day, last = g.steps.length ? day : [];   // ── service13 ── (ket)
  return [...first, ...(g.ev || []).map(event), ...g.steps.map(step), ...g.fb.map((k) => FALLBACK[k]), ...(g.gaps || []).map((k) => GAPS[k]), ...last].filter(Boolean).map(card);
}
/** Every step of the day (for ספר העבודה) with its game. */
export const BOOK = STEPS.map((s) => ({ id: s.id, order: s.order, he: s.name_he, game: Object.keys(GAMES).find((g) => GAMES[g].steps.includes(s.id)) || null }));

/** Scan a string for a Divine Name written in full (Tetragrammaton, full Elokim/El spellings with the letter ה). */
const NK = '[\\u0591-\\u05C7]*', HL = '\\u05D0-\\u05EA', NR = '\\u0591-\\u05C7';
const L = (c) => c + NK;   // a letter followed by any nikud
// letters: yod 05D9, he 05D4, vav 05D5, alef 05D0, lamed 05DC, mem-sofit 05DD, dalet 05D3, nun 05E0
const NAMES = [
  new RegExp(L('\\u05D9') + L('\\u05D4') + L('\\u05D5') + '\\u05D4'),
  new RegExp(L('\\u05D0') + L('\\u05DC') + L('\\u05D4') + L('\\u05D9') + '\\u05DD'),
  new RegExp(L('\\u05D0') + L('\\u05D3') + L('\\u05E0') + '\\u05D9' + `(?![${HL}${NR}])`),
  new RegExp(`(^|[^${HL}${NR}])` + L('\\u05DC?') + L('\\u05D9') + '\\u05D4' + NK + `(?![${HL}${NR}])`),
  /\bYHWH\b|\bJehovah\b|\bYahweh\b/i,
];
export function hasDivineName(s) {
  const t = String(s || '');
  return NAMES.some((re) => re.test(t));
}

/* ───────── ── service13 ── פיטום הקטורת, and the day's animals (wave 13; the owner, 30.9: "קטורת - פיטום הקטרת, עדיין לדעתי
 * לא נכנס למשחק" · "צריך לנהל את הדירים והאורוות מסביב לבית"). content/ketoret.json (the content agent's, drafts) and the
 * lines the games quote, each read on Sefaria on 30.9.2026 (Bavli: Wikisource/Vilna; Yerushalmi: Guggenheimer):
 *   כריתות ו ע״א — "פיטום הקטרת הצרי והציפורן והחלבנה והלבונה משקל שבעי׳ של שבעים מנה מור וקציעה שיבולת נרד וכרכום משקל ששה
 *     עשר של ששה עשר מנה הקושט שנים עשר קילופה שלשה וקנמון תשעה" · "קטרת היתה נעשית שס״ח מנה שס״ה כנגד ימות החמה שלשה מנין
 *     יתירין שמהן מכניס כהן גדול מלא חפניו ביום הכיפורים" · "ואם נתן בה דבש פסלה";
 *   כריתות ו ע״ב — "פרס בשחרית ופרס בין הערבים" · "היו מחזירין אותה למכתשת פעמים בשנה … וכשהוא שוחק אומר הדק היטב היטב
 *     הדק דברי אבא יוסי בן יוחנן" · "כשם שהדיבור רע ליין כן הדיבור יפה לבשמים";
 *   ירושלמי יומא ד, ה — "שהקול יפה לבשמים" (the words "מפני שהקול יפה לבשמים" are the siddur's, not the Bavli's: ⚑ in the brief);
 *   יומא לח ע״א — "של הללו מתמר ועולה כמקל של הללו מפציע לכאן ולכאן" (Beit Avtinas' smoke; the Alexandrians');
 *   מדות א, ו — "מערבית דרומית, היא היתה לשכת טלאי קרבן"; תמיד ג, ג — "צאו והביאו טלה מלשכת הטלאים".
 * No Divine Name in any of them (the tests scan every line). ─────────────────────────────────────────────────────────── */
export const KETORET = Object.fromEntries(arr(ketoretJson).filter((x) => x && typeof x.id === 'string').map((x) => [x.id, {
  ...x, name_he: str(x.name_he, x.id), summary_he: str(x.summary_he), quote: str(x.quote), quote_nikud: str(x.quote_nikud),
  source: str(x.source), status: str(x.status, 'draft'), needs_check: !!x.needs_check, note: str(x.note), views: arr(x.views),
}]));
export const ketoretItem = (id) => KETORET[id] || null;
/** the eleven spices in the baraita's order, with their weights in manim (כריתות ו ע״א): [{ id, he, label, manah, group }]
 *  (from ketoret.json's ketoret_spices; the verified list when the file lacks it). group: the baraita's own groups —
 *  'g70' the four of seventy, 'g16' the four of sixteen, then the kosht, the kilufah and the kinamon, each alone */
const SPICE_FALLBACK = [['tzori', 'הצרי', 70], ['tziporen', 'הציפורן', 70], ['chelbenah', 'החלבנה', 70], ['levonah', 'הלבונה', 70], ['mor', 'מור', 16], ['ketziah', 'קציעה', 16], ['shibolet_nerd', 'שיבולת נרד', 16], ['karkom', 'כרכום', 16], ['kosht', 'הקושט', 12], ['kilufah', 'קילופה', 3], ['kinamon', 'קנמון', 9]];
export const SPICES = (() => {
  const src = arr(obj(KETORET.ketoret_spices).spices).filter((s) => s && typeof s.id === 'string' && typeof s.manah === 'number');
  const list = src.length === 11 ? src.map((s) => [s.id, str(s.he, s.id), s.manah]) : SPICE_FALLBACK;
  return list.map(([id, he, manah], i) => ({ id, he, label: he.replace(/^ה(?=[צחלק])/, ''), manah, n: i + 1, group: i < 4 ? 'g70' : i < 8 ? 'g16' : id }));
})();
/** the baraita's words for each group, exactly as read (כריתות ו ע״א, Vilna, unvocalized; "שבעי׳" written out), 30.9:
 *  a wrong weight explains itself with these */
export const SPICE_WORDS = {
  g70: 'הצרי והציפורן והחלבנה והלבונה משקל שבעים של שבעים מנה',
  g16: 'מור וקציעה שיבולת נרד וכרכום משקל ששה עשר של ששה עשר מנה',
  kosht: 'הקושט שנים עשר', kilufah: 'קילופה שלשה', kinamon: 'וקנמון תשעה',
};
export const SPICE_SRC = 'כריתות ו ע״א';
/** the year's ketoret (כריתות ו ע״א–ע״ב): 368 manim = 365 for the days (a maneh a day: half in the morning, half in the
 *  evening) + 3 for the Kohen Gadol's handfuls on Yom Kippur */
export const KETORET_YEAR = { manim: 368, days: 365, yk: 3, am: 0.5, pm: 0.5 };
/** the lines the pitum and dir games and the home quote, exactly as read on Sefaria 30.9 (the Bavli unvocalized, as the
 *  Vilna prints it; the Mishnah and the Yerushalmi with the nikud Sefaria shows): { quote, source, needsCheck, status } */
export const PITUM_LINES = {
  year: { quote: 'קטרת היתה נעשית שס״ח מנה שס״ה כנגד ימות החמה שלשה מנין יתירין שמהן מכניס כהן גדול מלא חפניו ביום הכיפורים', source: 'כריתות ו ע״א' },
  day: { quote: 'פרס בשחרית ופרס בין הערבים', source: 'כריתות ו ע״ב' },
  chant: { quote: 'וכשהוא שוחק אומר הדק היטב היטב הדק', source: 'כריתות ו ע״ב · דברי אבא יוסי בן יוחנן' },
  why: { quote: 'כשם שהדיבור רע ליין כן הדיבור יפה לבשמים', source: 'כריתות ו ע״ב' },
  whyY: { quote: 'שֶׁהַקּוֹל יָפֶה לַבְּשָׂמִים', source: 'ירושלמי יומא ד, ה' },
  mortar: { quote: 'היו מחזירין אותה למכתשת פעמים בשנה', source: 'כריתות ו ע״ב' },
  honey: { quote: 'ואם נתן בה דבש פסלה', source: 'כריתות ו ע״א' },
  chelbenah: { quote: 'שהרי חלבנה ריחה רע ומנאה הכתוב עם סממני קטרת', source: 'כריתות ו ע״ב' },
  ashan: { quote: 'מעלה עשן כל שהוא', source: 'כריתות ו ע״א' },
  stick: { quote: 'של הללו מתמר ועולה כמקל של הללו מפציע לכאן ולכאן', source: 'יומא לח ע״א' },
  avtinas: { quote: 'בֵית אַבְטִינָס עַל מַעֲשֵׂה הַקְּטֹרֶת', source: 'שקלים ה, א' },
  chamber: { quote: 'מַעֲרָבִית דְּרוֹמִית, הִיא הָיְתָה לִשְׁכַּת טְלָאֵי קָרְבָּן', source: 'מדות א, ו' },
  bring: { quote: 'צְאוּ וְהָבִיאוּ טָלֶה מִלִּשְׁכַּת הַטְּלָאִים', source: 'תמיד ג, ג' },
  six: { quote: str(obj(FALLBACK.six_lambs).quote_nikud, 'אין פוחתין מששה טלאים המבקרין בלשכת הטלאים, כדי לשבת ולשני ימים טובים של ראש השנה'), source: 'ערכין ב, ה' },
  more: { quote: 'וּמוֹסִיפִין עַד לְעוֹלָם', source: 'ערכין ב, ה' },
};
Object.values(PITUM_LINES).forEach((l) => { l.status = 'draft'; l.needsCheck = false; });
/** the cards after the two games (ketoret.json items, then the fallbacks) */
export const PITUM_CARDS = ['ketoret_spices', 'grinding_chant', 'ketoret_total', 'beit_avtinas', 'chelbenah_lesson'];
/**
 * The day's animals: the two lambs of the Tamid (Num. 28:3; calendar_offerings.json daily_tamid) and the day's musaf
 * (musafOf: Shabbat, Rosh Chodesh, the festivals — Sukkot's bulls 13 → 7).
 * @param info calendar.dayInfo(...) (theme.info) → { lambs, bulls, rams, goats, tamid, musaf: [names], rest }
 */
export function needOf(info) {
  const T = DAILY_TAMID, tamid = typeof T.lambs === 'number' ? T.lambs : 2;
  const out = { lambs: tamid, bulls: 0, rams: 0, goats: 0, tamid, musaf: [], musafLambs: 0 };
  for (const m of musafOf(info)) {
    const n = (k) => (typeof m[k] === 'number' && m[k] > 0 ? m[k] : 0);
    out.bulls += n('bulls'); out.rams += n('rams'); out.lambs += n('lambs'); out.goats += n('goats'); out.musafLambs += n('lambs');
    out.musaf.push(str(m.name_he, m.day_id));
  }
  return out;
}
/** "2 כבשי תמיד · מוסף: 8 פרים, 2 אילים, 14 כבשים, שעיר" — one line for the home and the pens */
export function needHe(nd) {
  if (!nd) return '';
  const num = (n, one, many) => (n === 1 ? one : `${n} ${many}`);
  const mus = [nd.bulls && num(nd.bulls, 'פר', 'פרים'), nd.rams && num(nd.rams, 'איל', 'אילים'), nd.musafLambs && num(nd.musafLambs, 'כבש', 'כבשים'), nd.goats && num(nd.goats, 'שעיר', 'שעירים')].filter(Boolean);
  return `${nd.tamid} כבשי תמיד${mus.length ? ` · מוסף: ${mus.join(', ')}` : ''}`;
}
// ── /service13 ──
