/* ─────────────────────────────────────────────────────────────────────────────
 * loop.js: the hooks of the new Phase A loop (FUN, wave 6). One door for BUILD; pure over G.fun, plus sheet renderers.
 *
 *   const beats = L.onEvent(G, name, data, now);   // every game event (BUILD's, MATCH3's, KINGS', the mini-games')
 *   // → [{ kind:'find'|'order'|'pb'|'crew'|'daily', he, sub?, icon, sfx }]  (BUILD toasts them; sfx is a sound name)
 *   L.ordersFor(G, now) · L.claimOrder(G, id, now) → { silver } | null   (BUILD adds the reward to G.res)
 *   L.dailyFor(now) · L.dailyState(G, now) · L.m3Daily(now) → { field, mult } | null   (MATCH3's ctx.daily)
 *   L.crewLevel(G, trade) · L.crewPerk(G, trade) · L.grade(q) · L.noteBest(G, kind, r) · L.album(G) · L.setFinds(list)
 *   L.nextGoal(G, now, act) → { he, sub, act }   (BUILD's nextAction + the nearest pleasant goal, never a timer)
 *   L.ordersHTML(G, now) · L.dailyHTML(G, now) · L.albumHTML(G) · L.onTap(G, el, now) → { claim } | { play } | null
 *
 * Our line: nothing expires with a penalty (an unfinished order rolls to tomorrow); surprises are earned and
 * deterministic (a find comes at a known count, and the album shows how); no purchases; Shabbat and Yom Tov bring
 * rest, never a loss. G.fun = { v, best, tier, finds, crew, orders, daily, stats } (BUILD keeps it in the save).
 * ──────────────────────────────────────────────────────────────────────────── */
import { dayInfo } from '../../calendar.js';
import FINDS_JSON from '../../../content/finds.json' with { type: 'json' };
import { openDig } from './dig.js';

export const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const REST = new Set(['rosh-hashana', 'yom-kippur', 'shemini-atzeret', 'shavuot']);
/** Shabbat, Yom Tov and Yom Kippur (the Jerusalem calendar): no daily, no new orders; nothing is lost. */
export function isRestDay(key) {
  try {
    const i = dayInfo(new Date(key + 'T12:00:00+03:00'));
    if (i.isShabbat) return true;
    const h = i.holiday;
    return !!h && (REST.has(h.id) || ((h.id === 'sukkot' || h.id === 'pesach') && (h.day === 1 || (h.id === 'pesach' && h.day === 7))));
  } catch (e) { return false; }
}
const hash = (s) => { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; };
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function ensureFun(G) {
  if (!G) return null;
  const f = G.fun && typeof G.fun === 'object' ? G.fun : (G.fun = {});
  f.v = 1;
  for (const k of ['best', 'tier', 'finds', 'crew', 'stats']) if (!f[k] || typeof f[k] !== 'object') f[k] = {};
  if (!f.orders || !Array.isArray(f.orders.list)) f.orders = { day: '', list: [], seq: 0, issued: 0 };
  if (!f.daily || typeof f.daily.done !== 'object') f.daily = { done: {} };
  return f;
}
const bump = (f, k, n = 1) => { f.stats[k] = (f.stats[k] || 0) + n; };

/* ── stone quality and personal bests ── */
export const GRADES = ['ג', 'ב', 'א'];
export const grade = (q) => ({ g: q >= 0.85 ? 'א' : q >= 0.6 ? 'ב' : 'ג', stars: q >= 0.9 ? 3 : q >= 0.75 ? 2 : q >= 0.55 ? 1 : 0 });
/** Remember a mini-game's best score; the very first score is a record, not a "new best". */
export function noteBest(G, kind, r) {
  const f = ensureFun(G), prev = f.best[kind] || 0, s = (r && r.score) | 0;
  if (r && r.tier != null) f.tier[kind] = Math.max(f.tier[kind] || 0, r.tier | 0);
  if (s > prev) f.best[kind] = s;
  return { best: Math.max(prev, s), isPB: prev > 0 && s > prev, prev };
}

/** The level (0–4) of a precision game follows the player's own recent quality: up after two strong tries, down after
 *  weak ones (flow, docs/FUN.md §2.4). BUILD passes it as runMinigame's `level`. */
export function mgLevel(G, kind) { const m = ensureFun(G).mg || {}; return (m[kind] && m[kind].lv) | 0; }
function noteLevel(G, kind, q) {
  const f = ensureFun(G); f.mg = f.mg || {};
  const m = f.mg[kind] || (f.mg[kind] = { lv: 0, r: [] });
  m.r.push(+q || 0); if (m.r.length > 3) m.r.shift();
  const avg = m.r.reduce((a, b) => a + b, 0) / m.r.length;
  if (m.r.length >= 2 && avg >= 0.85 && m.lv < 4) { m.lv++; m.r = []; return 1; }
  else if (m.r.length >= 2 && avg < 0.6 && m.lv > 0) { m.lv--; m.r = []; }     // easier, silently: never a guilt line
  return 0;
}

/* ── crew mastery: each trade grows by the work done, the player's and the crews'; perks are speed only ── */
export const TRADES = { quarry: 'החוצבים', mason: 'הסתתים', setter: 'הבנאים', carpenter: 'הנגרים' };
export const CREW_LV = ['שוליות', 'אומנים', 'רבי אומנים', 'מופת'];
const CREW_XP = [0, 40, 150, 400];
export function crewLevel(G, trade) { const xp = (ensureFun(G).crew[trade] || 0); let l = 0; while (l < 3 && xp >= CREW_XP[l + 1]) l++; return { lv: l, he: CREW_LV[l], xp, next: CREW_XP[l + 1] || null }; }
export const crewPerk = (G, trade) => 1 + 0.1 * crewLevel(G, trade).lv;          // ≤ ×1.3 speed, never a paywall
function crewXP(G, trade, n, beats) {
  const before = crewLevel(G, trade).lv;
  const f = ensureFun(G); f.crew[trade] = (f.crew[trade] || 0) + n;
  const after = crewLevel(G, trade);
  if (after.lv > before) beats.push({ kind: 'crew', icon: 'crew', sfx: 'tier', he: `${TRADES[trade]} עלו לדרגת ${after.he}!`, sub: `מהירות עבודה ×${crewPerk(G, trade).toFixed(1)}` });
}

/* ── finds: real archaeology, earned at a known count (keys and facts from bus/SOURCES.md §3.10, paraphrased; drafts until
 *    the owner approves; CONTENT's finds.json replaces the texts via setFinds, keeping these triggers) ── */
export let FINDS = [
  { id: 'quarry_tools', he: 'כלי החוצבים', text: 'במחצבה מימי הבית השני ברמת שלמה נמצאו מכושים, יתדות ומפתח ברזל שהחוצבים השאירו מאחור.', ref: 'רשות העתיקות, חפירת אירינה זילברבוד, 2013', how: 'נצח בלוח המחצבה', when: ['m3quarry', 1] },
  { id: 'margins', he: 'השוליים המסותתים', text: 'לאבני הורדוס שוליים שקועים ברוחב כ־8 ס״מ סביב בליטה שטוחה, והנדבכים הונחו בלי טיט.', ref: 'הנדבכים ההרודיאניים בכותל המערבי ובכותל הדרומי', how: 'השלם את הנדבך הראשון', when: ['courses', 1] },
  { id: 'coins', he: 'שקל ישראל', text: 'שקלי כסף מימי המרד הגדול: גביע, ענף ובו שלושה רימונים, והכתובת "ירושלים הקדושה" בכתב עברי קדום.', ref: 'מוזיאון ישראל', how: 'חפירת היום', dig: true },
  { id: 'quarry_ramat_shlomo', he: 'המחצבה ברמת שלמה', text: 'כ־3 ק״מ צפונית להר הבית נחשפה ב־2007 מחצבה מימי הבית השני, ובה נחצבו אבנים באורך של עד כ־8 מטרים.', ref: 'רשות העתיקות, 2007', how: 'חפירת היום', dig: true },
  { id: 'stepped_street', he: 'רחוב המדרגות', text: 'רחוב מדרגות באורך כ־600 מטר עלה מבריכת השילוח אל הר הבית; מתחת לריצוף נמצאו יותר ממאה מטבעות.', ref: 'שנטון, חגבי, עוזיאל ואריאל, Tel Aviv 46:2 (2019)', how: 'חפירת היום', dig: true },
  { id: 'master_course', he: 'האבן הגדולה', text: 'בנדבך הגדול שבמנהרות הכותל יש אבן שאורכה כ־13.5 מטר וגובהה 3.3 מטר; משקלה — מאות טונות.', ref: 'ד. בהט, מנהרת הכותל המערבי (2013)', how: 'חפירת היום', dig: true },
  { id: 'trumpeting', he: '"לבית התקיעה"', text: 'אבן מראש הפינה הדרומית־מערבית ועליה חרות "לבית התקיעה"; משם הודיע כהן בתקיעה על כניסת השבת ויציאתה.', ref: 'חפירות בנימין מזר, 1968; יוספוס, מלחמת היהודים ד, 582', how: 'השלם את חומת העזרה', when: ['stage_wall', 1] },
  { id: 'soreg_inscription', he: 'כתובת הסורג', text: 'כתובת ביוונית הזהירה נכרים שלא להיכנס פנימה מן הסורג; לוח שלם נמצא ב־1871.', ref: 'ש׳ קלרמון־גנו, 1871; יוספוס, מלחמת היהודים ה, 194', how: 'השלם את הסורג והחיל', when: ['stage_sorag', 1] },
  { id: 'siloam_pool', he: 'בריכת השילוח', text: 'בריכת השילוח מימי הבית השני נחשפה ב־2004 בעבודות ביוב; מדרגות אבן ירדו אליה משלושה צדדים לפחות.', ref: 'רייך ושוקרון, 2004–2005', how: 'השלם את הכיור', when: ['stage_kiyor', 1] },
  { id: 'nikanor_ossuary', he: 'תיבת ניקנור', text: 'על הר הצופים נמצאה תיבת אבן ועליה כתוב ביוונית: של בני משפחת ניקנור האלכסנדרוני, שעשה את הדלתות.', ref: 'המוזיאון הבריטי', how: 'השלם את שער ניקנור', when: ['stage_nikanor', 1] },
].map((x) => ({ status: 'draft', ...x }));
/** CONTENT's finds.json (via BUILD): same ids keep my triggers; new ids need `when` or they are album-only. */
/* CONTENT's finds.json ids (s6-content) → mine, so its verified texts and sources replace mine and my triggers stay */
const FIND_ALIAS = { find_quarry_key: 'quarry_tools', find_quarry_block: 'quarry_ramat_shlomo', find_trumpeting: 'trumpeting', find_soreg: 'soreg_inscription', find_nikanor_ossuary: 'nikanor_ossuary', find_revolt_shekel: 'coins', find_pilate_coins: 'stepped_street', find_siloam_coin: 'siloam_pool' };
export function setFinds(list) {
  if (!Array.isArray(list) || !list.length) return FINDS;
  const txt = (x, m = {}) => ({ he: x.he || x.title_he || m.he, text: x.text || x.text_he || m.text, ref: x.ref || x.source || m.ref, status: x.status || m.status || 'draft', ...(x.draw_en ? { draw: x.draw_en } : {}) });
  const byId = new Map(list.filter((x) => x && x.id).map((x) => [FIND_ALIAS[x.id] || x.id, x]));
  const out = FINDS.map((m) => (byId.has(m.id) ? { ...m, ...txt(byId.get(m.id), m), src: byId.get(m.id).id } : m));
  for (const [id, x] of byId) if (!out.some((m) => m.id === id)) out.push({ id, ...txt(x), src: x.id, ...(x.when ? { when: x.when } : { how: 'חפירת היום', dig: true }) });   // (wave 7) a new find comes by the dig of the day
  FINDS = out;
  return FINDS;
}
/** The album: every find that can be earned (a find with no trigger stays hidden: never a goal that cannot be reached). */
export const album = (G) => { const f = ensureFun(G); return FINDS.filter((x) => x.when || x.dig || f.finds[x.id]).map((x) => ({ ...x, got: !!f.finds[x.id], at: f.finds[x.id] || 0 })); };
function checkFinds(G, now, beats) {
  const f = ensureFun(G);
  for (const x of FINDS) {
    if (f.finds[x.id] || !x.when) continue;
    const [k, n] = x.when;
    if ((f.stats[k] || 0) >= n) {
      f.finds[x.id] = now || 1;
      const got = FINDS.filter((y) => f.finds[y.id]).length;
      beats.push({ kind: 'find', icon: 'find', sfx: 'find', id: x.id, he: `מצאת: ${x.he}`, sub: `${got} מתוך ${FINDS.length} באלבום` });
    }
  }
}

/* ── the overseer's orders board (לוח המשגיח): three short orders, chosen; unfinished ones roll, never expire ── */
const ORDER_T = [   // rewards are modest (≤ 5 a day) and mostly the scarce materials (cedar, gold): silver piles up already (PLAYTEST-S6 fix 2)
  { key: 'stones', n: [12, 20, 30], rw: { cedar: 10 }, he: (n) => `קבע ${n} אבנים` },
  { key: 'keysA', n: [1, 2, 3], rw: { gold: 10 }, he: (n) => (n === 1 ? 'אבן מפתח אחת בדרגה א׳' : `${n} אבני מפתח בדרגה א׳`) },
  { key: 'm3wins', n: [1, 2, 3], rw: { cedar: 10 }, he: (n) => (n === 1 ? 'נצח בלוח אחד' : `נצח ב־${n} לוחות`) },
  { key: 'm3stars', n: [3, 5, 8], rw: { cedar: 10 }, he: (n) => `אסוף ${n} כוכבים בלוחות` },
  { key: 'courses', n: [1, 2, 3], rw: { cedar: 15 }, he: (n) => (n === 1 ? 'השלם נדבך' : `השלם ${n} נדבכים`) },
  { key: 'perfects', n: [10, 20, 30], rw: { silver: 10 }, he: (n) => `${n} מכות מושלמות` },
  { key: 'm3forest', n: [1, 1, 2], rw: { cedar: 20 }, he: () => 'נצח בלוח יער הלבנון' },
  { key: 'deals', n: [1, 1, 1], rw: { bronze: 10 }, he: () => 'סגור עסקה עם אחד המלכים', kings: true },
];
const RES_HE = { silver: 'כסף', gold: 'זהב', cedar: 'ארז', stone: 'אבן', bronze: 'נחושת' };
/** "+15 כסף" */
export const rewardHe = (rw) => Object.keys(rw || {}).map((k) => `+${rw[k]} ${RES_HE[k] || k}`).join(' · ');
const PER_DAY = 5;
export function ordersFor(G, now = Date.now()) {
  const f = ensureFun(G), O = f.orders, key = dayKey(now);
  if (O.day !== key && !isRestDay(key)) { O.day = key; O.issued = 0; }
  const kingsOn = (G.kings && typeof G.kings === 'object' && Object.keys(G.kings).length > 0) || (f.stats.deals || 0) > 0;
  const rank = Math.min(2, Math.floor((f.stats.stones || 0) / 150));
  let guard = 0;
  const open = (f.stats.courses || 0) >= 1;             // the board opens after the first course (the first minutes stay clean)
  while (open && O.day === key && O.list.filter((o) => !o.claimed).length < 3 && O.issued < PER_DAY && guard++ < 20) {
    const pool = ORDER_T.filter((t) => (!t.kings || kingsOn) && !O.list.some((o) => !o.claimed && o.key === t.key));
    if (!pool.length) break;
    const t = pool[hash(key + ':' + O.seq) % pool.length], n = t.n[rank];
    const reward = {}; for (const k of Object.keys(t.rw)) reward[k] = t.rw[k] + rank * 5;
    O.list.push({ id: 'o' + (++O.seq), key: t.key, n, base: f.stats[t.key] || 0, reward, he: t.he(n), day: key });
    O.issued++;
  }
  O.list = O.list.filter((o) => !o.claimed).slice(-6);
  return O.list.map((o) => { const got = Math.min(o.n, (f.stats[o.key] || 0) - o.base); return { ...o, got, done: got >= o.n }; });
}
export function claimOrder(G, id, now = Date.now()) {
  const f = ensureFun(G), o = f.orders.list.find((x) => x.id === id);
  if (!o || o.claimed || (f.stats[o.key] || 0) - o.base < o.n) return null;
  o.claimed = true; bump(f, 'orders');
  ordersFor(G, now);
  return { ...o.reward };
}
function checkOrders(G, before, beats) {
  const f = ensureFun(G);
  for (const o of f.orders.list) {
    if (o.claimed || o.told) continue;
    if ((f.stats[o.key] || 0) - o.base >= o.n && (before[o.key] || 0) - o.base < o.n) { o.told = true; beats.push({ kind: 'order', icon: 'order', sfx: 'order', id: o.id, he: `הזמנה מוכנה: ${o.he}`, sub: `${rewardHe(o.reward)} — אסוף בלוח המשגיח` }); }
  }
}

/* ── the daily challenge: seeded by the day; none on Shabbat and Yom Tov; counted per week, never a chain ── */
const MG_HE = { crane: 'המנוף', dress: 'הסיתות', plumb: 'האנך והפלס', whole: 'אבנים שלמות', quarry: 'המחצבה' };
const FIELD_HE = { quarry: 'אבן', forest: 'ארז', gold: 'זהב' };
export function dailyFor(now = Date.now()) {
  const key = dayKey(now);
  if (isRestDay(key)) return { key, rest: true, he: 'יום מנוחה', sub: 'אין אתגר היום, ושום דבר לא הולך לאיבוד' };
  const h = hash('daily:' + key), mg = ['crane', 'dress', 'plumb', 'whole', 'quarry'][h % 5], level = 2 + ((h >>> 4) % 2), field = ['quarry', 'forest', 'gold'][(h >>> 7) % 3];
  return { key, rest: false, mg, level, seed: h & 0xffff, field, mult: 2, he: `אתגר היום: ${MG_HE[mg]}, רמה ${level + 1}`, sub: `ובלוחות היום: כפל ${FIELD_HE[field]}` };
}
/** MATCH3's ctx.daily: today's field bonus; with G, none before the first course (the first boards stay calibrated) */
export const m3Daily = (now = Date.now(), G = null) => { const d = dailyFor(now); if (d.rest || (G && ((ensureFun(G).stats.courses || 0) < 1))) return null; return { field: d.field, mult: d.mult, he: `היום: כפל ${FIELD_HE[d.field]}` }; };
const weekStart = (now) => { const d = new Date(now); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() - d.getDay()); return dayKey(d.getTime()); };
/* the day's game, for this player: a game they have not met yet (the altar's whole stones on the Mount) becomes one they have */
function dailyOf(G, now) {
  const d = dailyFor(now), f = ensureFun(G);
  if (d.rest) return d;
  const met = (k) => !!((f.mg && f.mg[k]) || (f.best && f.best[k]));
  const played = ['crane', 'dress', 'plumb', 'whole', 'quarry'].filter(met);
  if (!played.length || met(d.mg)) return d;
  const mg = played[d.seed % played.length];
  return { ...d, mg, he: `אתגר היום: ${MG_HE[mg]}, רמה ${d.level + 1}` };
}
export function dailyState(G, now = Date.now()) {
  const f = ensureFun(G), d = dailyOf(G, now), ws = weekStart(now);
  const week = Object.keys(f.daily.done).filter((k) => k >= ws).length;
  return { ...d, done: !!f.daily.done[d.key], week, locked: (f.stats.courses || 0) < 1 };   // opens after the first course
}
function checkDaily(G, data, now, beats) {
  const f = ensureFun(G), d = dailyOf(G, now);
  if (d.rest || f.daily.done[d.key] || (f.stats.courses || 0) < 1 || !data || data.skipped || data.kind !== d.mg || (data.level | 0) < d.level) return;
  f.daily.done[d.key] = true;
  const keys = Object.keys(f.daily.done).sort(); if (keys.length > 60) for (const k of keys.slice(0, keys.length - 60)) delete f.daily.done[k];
  beats.push({ kind: 'daily', icon: 'daily', sfx: 'daily', he: 'אתגר היום הושלם!', sub: `${dailyState(G, now).week} ימים השבוע` });
}

/* ── the dig of the day (wave 7): one real find a day, in a fixed order per player; a missed day loses nothing; none on
 *    Shabbat and Yom Tov; counted per week, never a chain. The find and its reward are given at the tap; the brush game
 *    (dig.js) is the pleasure of uncovering it. The facts are CONTENT's (content/finds.json: found, publication, source),
 *    put in Hebrew here; the two finds of mine (margins, master_course) keep their bus/SOURCES.md §3.10 refs. ── */
export const DIG_ORDER = ['coins', 'quarry_ramat_shlomo', 'master_course', 'stepped_street', 'trumpeting', 'siloam_pool', 'soreg_inscription', 'nikanor_ossuary', 'quarry_tools', 'margins'];
export const DIG_AT = {
  coins: { art: 'shekel', where: 'ירושלים', date: '66–70 לספירה', found: 'נטבע בירושלים בימי המרד הגדול; דוגמאות רבות שמורות במוזיאונים', shown: 'מוזיאון ישראל' },
  quarry_ramat_shlomo: { art: 'block', where: 'רמת שלמה', date: 'ימי הבית השני', found: 'רמת שלמה, ירושלים · רשות העתיקות, 2007' },
  master_course: { art: 'giant', where: 'מנהרות הכותל', date: 'ימי הורדוס', found: 'הנדבך הגדול, במנהרות הכותל המערבי', shown: 'במקומה, במנהרות הכותל' },
  stepped_street: { art: 'coins', where: 'עיר דוד, רחוב המדרגות', date: '17–31 לספירה', found: 'מתחת לריצוף רחוב המדרגות · רשות העתיקות ואוניברסיטת תל אביב, 2013–2019' },
  trumpeting: { art: 'inscr', where: 'הפינה הדרומית־מערבית של הר הבית', date: 'המאה הראשונה לספירה', found: 'הפינה הדרומית־מערבית של הר הבית · חפירות ב׳ מזר, 1968', shown: 'מוזיאון ישראל' },
  siloam_pool: { art: 'plaster', where: 'בריכת השילוח', date: 'המאה הראשונה לפני הספירה', found: 'בטיח של בריכת השילוח · ר׳ רייך וא׳ שוקרון, 2004' },
  soreg_inscription: { art: 'slab', where: 'ירושלים, ליד הר הבית', date: 'ימי הבית השני', found: 'לוח שלם ב־1871 (ש׳ קלרמון־גנו), ושבר של לוח אחר ב־1936 (ג׳ איליף)', shown: 'מוזיאוני הארכאולוגיה של איסטנבול; מוזיאון ישראל' },
  nikanor_ossuary: { art: 'box', where: 'הר הצופים', date: 'אמצע המאה הראשונה לספירה', found: 'מערת ניקנור בהר הצופים, 1902', shown: 'המוזיאון הבריטי' },
  quarry_tools: { art: 'key', where: 'רמת שלמה', date: 'ימי הבית השני', found: 'המחצבה ברמת שלמה · רשות העתיקות, 2013 (אירינה זילברבוד)' },
  margins: { art: 'margins', where: 'הכותל המערבי', date: 'ימי הורדוס', found: 'בנדבכים ההרודיאניים של הכותל המערבי והכותל הדרומי', shown: 'במקומן, בכותל' },
};
const DIG_RW = { cedar: 10 };
const WEEKDAY = ['ראשון', 'שני', 'שלישי', 'רביעי', 'חמישי', 'שישי', 'שבת'];
function ensureDig(G) { const f = ensureFun(G); if (!f.dig || typeof f.dig !== 'object' || !f.dig.done || typeof f.dig.done !== 'object') f.dig = { done: {}, best: (f.dig && f.dig.best) || 0 }; return f.dig; }
const digQueue = (G) => { const f = ensureFun(G); return DIG_ORDER.map((id) => FINDS.find((x) => x.id === id)).filter((x) => x && !f.finds[x.id]); };
/** When the next dig comes: "מחר", or the weekday after a rest day ("ביום ראשון"). */
export function nextDigWhen(now = Date.now()) {
  const d = new Date(now); d.setHours(12, 0, 0, 0);
  for (let i = 1; i <= 8; i++) { d.setDate(d.getDate() + 1); if (!isRestDay(dayKey(d.getTime()))) return i === 1 ? 'מחר' : `ביום ${WEEKDAY[d.getDay()]}`; }
  return 'בקרוב';
}
/** { key, rest, locked, done, ready, find, next, week, left, total } — find = today's (dug or waiting), next = the one after */
export function digState(G, now = Date.now()) {
  const f = ensureFun(G), D = ensureDig(G), key = dayKey(now), doneId = D.done[key];
  const q = digQueue(G), today = doneId ? FINDS.find((x) => x.id === doneId) || null : q[0] || null;
  const rest = isRestDay(key), locked = (f.stats.courses || 0) < 1;
  return { key, rest, locked, done: !!doneId, ready: !rest && !locked && !doneId && !!q[0], find: today, next: doneId ? q[0] || null : q[1] || null,
    week: Object.keys(D.done).filter((k) => k >= weekStart(now)).length, left: q.length, total: DIG_ORDER.length };
}
/** Dig today's find: into the album, the reward to give, the tease. null when there is nothing to dig today. */
export function dig(G, now = Date.now()) {
  const d = digState(G, now); if (!d.ready) return null;
  const f = ensureFun(G), D = ensureDig(G);
  D.done[d.key] = d.find.id; f.finds[d.find.id] = now || 1; bump(f, 'digs');
  const keys = Object.keys(D.done).sort(); if (keys.length > 60) for (const k of keys.slice(0, keys.length - 60)) delete D.done[k];
  const a = album(G);
  return { find: d.find, at: DIG_AT[d.find.id] || {}, reward: { ...DIG_RW }, next: d.next, nextAt: d.next ? DIG_AT[d.next.id] || {} : null, nextWhen: nextDigWhen(now), n: a.filter((x) => x.got).length, of: a.length };
}
/** The brush time: a personal best (lower is better); the first time is a record, not a "new best". */
export function digTime(G, ms) { const D = ensureDig(G), prev = D.best || 0; if (!(ms > 0)) return { best: prev, isPB: false }; if (!prev || ms < prev) D.best = ms; return { best: D.best, isPB: prev > 0 && ms < prev, prev }; }
/** The "היום" dot (BUILD's ui.js badges): today's dig waiting + the orders ready to claim. */
export function badge(G, now = Date.now()) { try { return (digState(G, now).ready ? 1 : 0) + ordersFor(G, now).filter((o) => o.done).length; } catch (e) { return 0; } }
export function digHTML(G, now = Date.now()) {
  const d = digState(G, now);
  if (d.locked) return '';
  const at = (x) => (x && DIG_AT[x.id]) || {};
  if (d.rest) return `<div class="fx-card fx-digc"><div class="fx-grow"><b>חפירת היום</b><small>יום מנוחה: החפירה נחה, והממצא הבא מחכה ל${esc(nextDigWhen(now).replace(/^ב/, ''))}. שום דבר לא הולך לאיבוד.</small></div></div>`;
  if (d.ready) return `<div class="fx-card fx-digc done"><div class="fx-grow"><b>חפירת היום · ${esc(at(d.find).where || '')}</b><small>מה מסתתר מתחת לעפר? ממצא אמיתי לאלבום, ו־${esc(rewardHe(DIG_RW))}${d.week ? ` · ${d.week} השבוע` : ''}</small></div><button type="button" data-fun="dig">חפור</button></div>`;
  if (d.done && d.find) return `<div class="fx-card fx-digc"><div class="fx-grow"><b>חפירת היום ✓ ${esc(d.find.he)}</b><small>${d.next ? `${esc(nextDigWhen(now))} בחפירה: ${esc(at(d.next).where || '')}` : 'כל הממצאים של העונה באלבום שלך'}</small></div></div>`;
  return `<div class="fx-card fx-digc"><div class="fx-grow"><b>חפירת היום</b><small>כל ${d.total} הממצאים של העונה באלבום שלך ✓</small></div></div>`;
}
/* #demo (the owner's reel opens the "היום" sheet at its album beat): the dig plays itself once — a tap through BUILD's own
   funTap path (so the reward is applied as for a player), the brush sweeps by itself, the card closes after a few seconds */
let demoDigKey = '', demoAlbumAt = -1e15;          // BUILD's reel emits 'demoBeat' {at:'album'} (→ onEvent): only then
function demoDig(G, now) {
  try {
    if (!G || !G.demo || typeof document === 'undefined' || typeof setTimeout !== 'function' || Math.abs(now - demoAlbumAt) > 20000) return;
    const d = digState(G, now); if (!d.ready || demoDigKey === d.key) return;
    demoDigKey = d.key;
    setTimeout(() => { try { const b = document.querySelector('[data-fun="dig"]'); if (b && G.demo) b.click(); } catch (e) { /* the reel goes on */ } }, 1200);
  } catch (e) { /* never in the way */ }
}
/* the kit the dig speaks with (hooks/index.js passes BUILD's sfx and emit once) */
let KIT = { sfx: null, emit: null };
export function useKit(k = {}) { KIT = { ...KIT, ...k }; }

/* ── the one door: every event updates the counters, then orders, finds, crews, bests and the daily speak once ── */
export function onEvent(G, name, data = {}, now = Date.now()) {
  const beats = [];
  try {
    if (!G) return beats;
    const f = ensureFun(G);
    ordersFor(G, now);                                   // today's board exists before the event counts toward it
    const before = { ...f.stats };
    const d = data || {};
    switch (name) {
      case 'stroke': if (d.perfect) bump(f, 'perfects'); if (d.job === 'dress') crewXP(G, 'mason', 1, beats); break;
      case 'stoneSet': { const n = d.n || 1; bump(f, 'stones', n); if (d.by === 'hero') bump(f, 'heroStones', n); crewXP(G, 'setter', n, beats); break; }
      case 'course': bump(f, 'courses'); break;
      case 'keyStone': bump(f, 'keys'); if ((d.quality || 0) >= 0.85) bump(f, 'keysA'); break;
      case 'minigame': {
        if (d.skipped) break;
        const r = noteBest(G, d.kind, d);
        if (r.isPB) beats.push({ kind: 'pb', icon: 'pb', sfx: 'pb', he: `שיא אישי ב${MG_HE[d.kind] || 'משחק'}: ${d.score}`, sub: `הקודם: ${r.prev}` });
        if (noteLevel(G, d.kind, d.quality)) beats.push({ kind: 'pb', icon: 'pb', sfx: 'tier', he: `${MG_HE[d.kind] || 'המשחק'}: רמה ${mgLevel(G, d.kind) + 1}!`, sub: 'מהיר יותר ומדויק יותר — הדרגות שלך נשמרות' });   // (wave 7) mastery made visible
        crewXP(G, d.kind === 'dress' ? 'mason' : d.kind === 'whole' ? 'quarry' : 'setter', 3, beats);
        checkDaily(G, d, now, beats);
        break;
      }
      case 'm3Won': {
        bump(f, 'm3wins'); bump(f, 'm3stars', d.stars | 0); if ((d.stars | 0) >= 3) bump(f, 'm3three');
        if (d.field) bump(f, 'm3' + d.field);
        crewXP(G, d.field === 'forest' ? 'carpenter' : 'quarry', 2 + (d.stars | 0), beats);
        break;
      }
      case 'deal': bump(f, 'deals'); break;
      case 'demoBeat': if (d.at === 'album') demoAlbumAt = now; break;   // (wave 7) the owner's reel is at the album: the dig may play itself
      case 'stageDone': bump(f, 'stages'); if (d.id) bump(f, 'stage_' + d.id); break;
      default: break;
    }
    checkOrders(G, before, beats);
    checkFinds(G, now, beats);
  } catch (e) { /* hooks never break the game */ }
  return beats;
}

/** The pill's line: BUILD's one action, and under it the nearest pleasant goal (an order, the daily). Never a timer. */
export function nextGoal(G, now = Date.now(), act = null) {
  const list = ordersFor(G, now), ready = list.find((o) => o.done);
  if (ready) return { he: `הזמנה מוכנה: ${ready.he}`, sub: rewardHe(ready.reward), act: { kind: 'order', id: ready.id } };
  const near = list.filter((o) => !o.done).sort((a, b) => (b.got / b.n) - (a.got / a.n))[0];
  const d = dailyState(G, now);
  const sub = near && near.got > 0 ? `עוד ${near.n - near.got} — ${near.he}` : !d.rest && !d.done && !d.locked ? d.he : '';
  return { he: act && act.label ? act.label : '', sub, act };
}

/* ── the sheets (BUILD opens them; buttons carry data-fun, BUILD passes the tap to onTap) ── */
const CSS = `
.fx-list{display:flex;flex-direction:column;gap:10px;direction:rtl}
.fx-card{display:flex;align-items:center;gap:10px;background:#FFF8E6;color:#2A1F12;border-radius:14px;padding:10px 12px;border:1px solid #E6D3A6}
.fx-card b{font-size:16px}.fx-card small{display:block;color:#6B5436;font-size:13px}.fx-card .fx-grow{flex:1;min-width:0}
.fx-bar{height:8px;border-radius:5px;background:#E9DDBF;overflow:hidden;margin-top:6px}.fx-bar i{display:block;height:100%;background:#C8962E}
.fx-card button{min-height:44px;min-width:88px;border:0;border-radius:12px;background:#C8962E;color:#1C140A;font:700 15px "Heebo",system-ui,sans-serif;cursor:pointer}
.fx-card .fx-rw{font-weight:800;color:#7A5A12;white-space:nowrap}.fx-card.done{border-color:#C8962E;box-shadow:0 0 0 2px #F3D27A inset}
.fx-album{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;direction:rtl}
.fx-find{background:#FFF8E6;color:#2A1F12;border-radius:14px;padding:10px;border:1px solid #E6D3A6;min-height:96px}
.fx-find.no{background:#EFE6D2;color:#6B5436;border-style:dashed}.fx-find b{display:block;font-size:15px}.fx-find p{margin:4px 0 0;font-size:13px;line-height:1.4}
.fx-find small{display:block;margin-top:4px;color:#7A6541;font-size:11px}.fx-draft{font-size:11px;background:#E8C77A;border-radius:6px;padding:0 5px;color:#1C140A}
`;
function ensureCSS() {
  try { if (typeof document === 'undefined' || document.getElementById('fx-loop-css')) return; const s = document.createElement('style'); s.id = 'fx-loop-css'; s.textContent = CSS; document.head.appendChild(s); } catch (e) { /* no DOM */ }
}
export function ordersHTML(G, now = Date.now()) {
  ensureCSS();
  const key = dayKey(now), list = ordersFor(G, now);
  demoDig(G, now);
  const head = digHTML(G, now) + (isRestDay(key) ? '<p class="fx-rest">יום מנוחה: המשגיח לא מוסיף הזמנות היום. מה שהתחלת מחכה לך.</p>' : '');
  if (!list.length) return head + ((ensureFun(G).stats.courses || 0) < 1 ? '<p>לוח המשגיח נפתח אחרי הנדבך הראשון.</p>' : '<p>כל ההזמנות של היום נאספו. הזמנות חדשות מחר.</p>');
  return head + '<div class="fx-list">' + list.map((o) => `<div class="fx-card${o.done ? ' done' : ''}"><div class="fx-grow"><b>${esc(o.he)}</b>
    <small>${o.got}/${o.n}${o.day !== key ? ' · מאתמול' : ''}</small><div class="fx-bar"><i style="width:${Math.round((100 * o.got) / o.n)}%"></i></div></div>
    ${o.done ? `<button type="button" data-fun="claim:${esc(o.id)}">אסוף ${esc(rewardHe(o.reward))}</button>` : `<span class="fx-rw">${esc(rewardHe(o.reward))}</span>`}</div>`).join('') + '</div>';
}
export function dailyHTML(G, now = Date.now()) {
  ensureCSS();
  const d = dailyState(G, now);
  if (d.rest) return `<div class="fx-card"><div class="fx-grow"><b>${esc(d.he)}</b><small>${esc(d.sub)}</small></div></div>`;
  if (d.locked) return '<div class="fx-card"><div class="fx-grow"><b>אתגר היום</b><small>נפתח אחרי הנדבך הראשון שלך</small></div></div>';
  return `<div class="fx-card${d.done ? ' done' : ''}"><div class="fx-grow"><b>${esc(d.he)}</b><small>${esc(d.sub)} · ${d.week} ימים השבוע</small></div>
    ${d.done ? '<span class="fx-rw">הושלם ✓</span>' : '<button type="button" data-fun="daily">שחק</button>'}</div>`;
}
export function albumHTML(G) {
  ensureCSS();
  const a = album(G);
  return `<p>${a.filter((x) => x.got).length} מתוך ${a.length} ממצאים</p><div class="fx-album">` + a.map((x) => (x.got
    ? `<div class="fx-find"><b>${esc(x.he)}</b><p>${esc(x.text)}</p><small>${esc(x.ref || '')}${x.status === 'approved' ? '' : ' · <span class="fx-draft">טיוטה</span>'}</small></div>`
    : `<div class="fx-find no"><b>?</b><p>איך מוצאים: ${esc(x.how || 'בהמשך הבנייה')}</p></div>`)).join('') + '</div>';
}
/** A tap inside one of the sheets → what BUILD should do. */
export function onTap(G, el, now = Date.now()) {
  const t = el && el.closest ? el.closest('[data-fun]') : null;
  if (!t) return null;
  const v = t.getAttribute('data-fun') || '';
  if (v.startsWith('claim:')) { const reward = claimOrder(G, v.slice(6), now); return reward ? { claim: reward, sfx: 'coinsIn' } : null; }
  if (v === 'dig') {
    const r = dig(G, now); if (!r) return null;
    try { openDig({ find: r.find, at: r.at, next: r.nextAt ? { ...r.next, where: r.nextAt.where } : null, nextWhen: r.nextWhen, reward: rewardHe(r.reward), n: r.n, of: r.of, sfx: KIT.sfx, emit: KIT.emit, onTime: (ms) => digTime(G, ms), auto: !!G.demo, autoClose: !!G.demo }); } catch (e) { /* the card is a bonus; the find is already yours */ }
    return { claim: r.reward, sfx: 'whoosh', dig: r.find.id };
  }
  if (v === 'daily') { const d = dailyState(G, now); return d.rest || d.locked ? null : { play: { mg: d.mg, level: d.level, seed: d.seed, daily: true } }; }
  return null;
}

/** The demo reel of the new loop (BUILD's #demo may walk it): the board, a course, the hands, a king, the album. */
export const DEMO6 = [
  { at: 'm3', field: 'quarry', s: 25 }, { at: 'build', s: 15 }, { at: 'mg', kind: 'crane', s: 15 }, { at: 'mg', kind: 'dress', s: 20 },
  { at: 'kings', s: 20 }, { at: 'mg', kind: 'whole', s: 15 }, { at: 'album', s: 8 },
];

/* (wave 7) CONTENT's finds.json was never passed in (nobody called setFinds): its texts and sources replace mine here */
try { setFinds(FINDS_JSON); } catch (e) { /* mine stay */ }

/* BUILD finds these hooks as globalThis.__BH_PARTS.fun (bus/BUILD.md); hooks/index.js imports this module */
try {
  const P = globalThis.__BH_PARTS || (globalThis.__BH_PARTS = {});
  P.fun = { onEvent, onTap, m3Daily, mgLevel, nextGoal, ordersHTML, dailyHTML, albumHTML, ordersFor, claimOrder, dailyFor, dailyState, album, setFinds, crewLevel, crewPerk, grade, noteBest, ensureFun, isRestDay, DEMO6, badge, digState, dig, digHTML, useKit };
} catch (e) { /* no global */ }
