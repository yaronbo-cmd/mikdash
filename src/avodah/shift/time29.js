/* ── fable32 (build 29) ── time29.js — where the phone is, the Shabbat and Yom Tov lock, the real hour's sky and "what is happening in
 * the Temple now" (HANDOFF rule 16; docs/specs/rohvi-he.md §1–§2; hachraot-he.md "שבת וחג"; realtime-dual-timeline-he.md, the owner's
 * decisions 22.10 08:15, 08:18, 08:59). On calendar.js's engine (the NOAA sun, the Intl Hebrew calendar, templeSchedule) — no new astronomy.
 *   - where29(): {lat, lon, israel, source:'tz'|'gps'|'default', city, tz} — WITHOUT asking: the device's time zone (Intl) → a city of the
 *     table below (Israel → Jerusalem); a zone not in it → its UTC offset (lon = 15° an hour); no zone → Jerusalem. With the player's
 *     "מיקום מדויק" (off by default): the position asked once, kept ROUNDED (2 decimals) in bh_loc29 with the Israel flag — never sent.
 *   - status29(now, w): the lock — from one hour before candle-lighting (18 min before sunset; 40 in Jerusalem) of Shabbat and Yom Tov to
 *     צאת הכוכבים (the sun 8.5° down) at the end; consecutive days one lock. Yom Tov in Israel: Rosh HaShana (2), Yom Kippur, Sukkot 1,
 *     Shemini Atzeret, Pesach 1 and 7, Shavuot; abroad also Sukkot 2, Simchat Torah, Pesach 2 and 8, Shavuot 2; Chol HaMoed open.
 *     soft = the last 15 minutes before the lock (a calm line, no countdown).
 *   - sky29(now, w): 'dawn' | 'noon' | 'dusk' | 'night' by the sun where the phone is (schedule.js skyOf's thresholds, the local date).
 *   - templeNow29(now, w): the Temple's service now and next by the same sun (calendar.js nowInTemple / templeSchedule; drafts).
 *   - clock29(): the clock — the test hook: globalThis.__NOW29 (ms, ISO or a function); on file: / localhost also ?now=ISO[&rate=n]
 *     (the clock runs on from it), ?tz=Zone, ?lat=&lon= (a stand-in position); globalThis.__TZ29, __LOC29 likewise.
 * Every text a draft; never a Divine Name. ── /fable32 ── */
import { civilDay, sunOnDay, hebrewOnDay, weekdayOnDay, nowInTemple, scheduleOnDay, gematria, TEMPLE_MOUNT } from '../../calendar.js';

const MIN = 60e3, HOUR = 60 * MIN;
export const LOC29_KEY = 'bh_loc29';
export const JERUSALEM29 = Object.freeze({ lat: TEMPLE_MOUNT.lat, lon: TEMPLE_MOUNT.lon });
/** the lock's numbers (minutes): candle-lighting before sunset (Jerusalem's custom: 40), the lock an hour before it, the calm line 15
 *  minutes before the lock; a place where the sun never reaches 8.5° (a far-north summer) opens 72 minutes after sunset */
export const LOCK29 = Object.freeze({ candle: 18, candleJer: 40, jerKm: 20, before: 60, soft: 15, noTzeit: 72 });

// the zones Israeli and Jewish families use most → a representative city [name, lat, lon, Israel]
export const ZONES29 = Object.freeze({
  'Asia/Jerusalem': ['ירושלים', 31.778, 35.235, 1], 'Asia/Tel_Aviv': ['ירושלים', 31.778, 35.235, 1], 'Asia/Hebron': ['ירושלים', 31.778, 35.235, 1],
  'America/New_York': ['ניו יורק', 40.71, -74.01], 'America/Detroit': ['דטרויט', 42.33, -83.05], 'America/Toronto': ['טורונטו', 43.65, -79.38],
  'America/Montreal': ['מונטריאול', 45.5, -73.57], 'America/Halifax': ['הליפקס', 44.65, -63.57], 'America/Chicago': ['שיקגו', 41.88, -87.63],
  'America/Winnipeg': ['וויניפג', 49.9, -97.14], 'America/Denver': ['דנוור', 39.74, -104.99], 'America/Phoenix': ['פיניקס', 33.45, -112.07],
  'America/Edmonton': ['אדמונטון', 53.55, -113.49], 'America/Los_Angeles': ['לוס אנג׳לס', 34.05, -118.24], 'America/Vancouver': ['ונקובר', 49.28, -123.12],
  'Pacific/Honolulu': ['הונולולו', 21.31, -157.86], 'America/Mexico_City': ['מקסיקו סיטי', 19.43, -99.13], 'America/Panama': ['פנמה', 8.98, -79.52],
  'America/Sao_Paulo': ['סאו פאולו', -23.55, -46.63], 'America/Argentina/Buenos_Aires': ['בואנוס איירס', -34.6, -58.38], 'America/Buenos_Aires': ['בואנוס איירס', -34.6, -58.38],
  'America/Montevideo': ['מונטווידאו', -34.9, -56.16], 'America/Santiago': ['סנטיאגו', -33.45, -70.67],
  'Europe/London': ['לונדון', 51.51, -0.13], 'Europe/Dublin': ['דבלין', 53.35, -6.26], 'Europe/Paris': ['פריז', 48.86, 2.35],
  'Europe/Brussels': ['אנטוורפן', 51.22, 4.4], 'Europe/Amsterdam': ['אמסטרדם', 52.37, 4.9], 'Europe/Berlin': ['ברלין', 52.52, 13.4],
  'Europe/Zurich': ['ציריך', 47.38, 8.54], 'Europe/Vienna': ['וינה', 48.21, 16.37], 'Europe/Rome': ['רומא', 41.9, 12.5], 'Europe/Madrid': ['מדריד', 40.42, -3.7],
  'Europe/Budapest': ['בודפשט', 47.5, 19.04], 'Europe/Prague': ['פראג', 50.08, 14.44], 'Europe/Warsaw': ['ורשה', 52.23, 21.01],
  'Europe/Moscow': ['מוסקבה', 55.76, 37.62], 'Europe/Kiev': ['קייב', 50.45, 30.52], 'Europe/Kyiv': ['קייב', 50.45, 30.52], 'Europe/Minsk': ['מינסק', 53.9, 27.56],
  'Africa/Johannesburg': ['יוהנסבורג', -26.2, 28.05], 'Australia/Sydney': ['סידני', -33.87, 151.21], 'Australia/Melbourne': ['מלבורן', -37.81, 144.96],
  'Australia/Perth': ['פרת׳', -31.95, 115.86], 'Pacific/Auckland': ['אוקלנד', -36.85, 174.76],
  // (more of Europe and Asia, so fewer phones fall to the offset's estimate below)
  'Europe/Lisbon': ['ליסבון', 38.72, -9.14], 'Europe/Gibraltar': ['גיברלטר', 36.14, -5.35], 'Europe/Copenhagen': ['קופנהגן', 55.68, 12.57],
  'Europe/Stockholm': ['שטוקהולם', 59.33, 18.07], 'Europe/Oslo': ['אוסלו', 59.91, 10.75], 'Europe/Helsinki': ['הלסינקי', 60.17, 24.94],
  'Europe/Riga': ['ריגה', 56.95, 24.11], 'Europe/Vilnius': ['וילנה', 54.69, 25.28], 'Europe/Athens': ['אתונה', 37.98, 23.73],
  'Europe/Bucharest': ['בוקרשט', 44.43, 26.1], 'Europe/Sofia': ['סופיה', 42.7, 23.32], 'Europe/Istanbul': ['איסטנבול', 41.01, 28.98],
  'Asia/Nicosia': ['ניקוסיה', 35.17, 33.36], 'Asia/Tbilisi': ['טביליסי', 41.72, 44.79], 'Asia/Baku': ['באקו', 40.41, 49.87],
  'Asia/Dubai': ['דובאי', 25.2, 55.27], 'Asia/Kolkata': ['מומבאי', 19.08, 72.88], 'Asia/Bangkok': ['בנגקוק', 13.76, 100.5],
  'Asia/Singapore': ['סינגפור', 1.35, 103.82], 'Asia/Hong_Kong': ['הונג קונג', 22.32, 114.17], 'Asia/Shanghai': ['שנחאי', 31.23, 121.47],
  'Asia/Tokyo': ['טוקיו', 35.68, 139.69],
});
const SOUTH = /^(Australia|Antarctica)\/|^Pacific\/(Auckland|Chatham|Fiji)|^America\/(Argentina|Santiago|Montevideo|Sao_Paulo|Asuncion|La_Paz|Lima)|^Africa\/(Johannesburg|Maputo|Harare|Windhoek|Lusaka)|^Indian\/(Mauritius|Reunion)/;

// ─── the test hook and the clock ────────────────────────────────────────────────────────────────────
const T0 = Date.now();
let urlQ, urlAt = null;
/** ?now / ?tz / ?lat / ?lon / ?rate — only on a local page (file:, localhost): the published page never takes them */
export function query29() {
  const href = typeof location === 'undefined' || !location ? '' : String(location.href || '');
  if (urlQ !== undefined && urlAt === href) return urlQ;
  urlQ = null; urlAt = href;
  try {
    if (!/^(file:|https?:\/\/(localhost|127\.0\.0\.1)[:/])/.test(href)) return urlQ;
    const p = new URLSearchParams(location.search || '');
    const q = {}; for (const k of ['now', 'tz', 'lat', 'lon', 'rate']) if (p.get(k) != null && p.get(k) !== '') q[k] = p.get(k);
    if (Object.keys(q).length) urlQ = q;
  } catch (e) { urlQ = null; }
  return urlQ;
}
export function clock29() {
  const g = globalThis.__NOW29;
  if (typeof g === 'function') { const t = +g(); if (Number.isFinite(t)) return t; }
  if (typeof g === 'number' && Number.isFinite(g)) return g;
  if (typeof g === 'string') { const t = Date.parse(g); if (Number.isFinite(t)) return t; }
  const q = query29();
  if (q && q.now) { const t = Date.parse(q.now); if (Number.isFinite(t)) return t + (Date.now() - T0) * (+q.rate > 0 ? +q.rate : 1); }
  return Date.now();
}

// ─── where the phone is ─────────────────────────────────────────────────────────────────────────────
const tzOk = (tz) => { if (!tz || typeof tz !== 'string') return false; try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch (e) { return false; } };
export const deviceZone = () => { try { return Intl.DateTimeFormat().resolvedOptions().timeZone || null; } catch (e) { return null; } };
/** Israel, roughly (the Golan to Eilat, the Mediterranean to the Jordan) */
export const inIsrael29 = (lat, lon) => lat >= 29.45 && lat <= 33.35 && lon >= 34.2 && lon <= 35.92;
const round2 = (x) => Math.round(x * 100) / 100;
const lsGet = (k) => { try { return globalThis.localStorage ? globalThis.localStorage.getItem(k) : null; } catch (e) { return null; } };
const lsSet = (k, v) => { try { if (!globalThis.localStorage) return false; if (v == null) globalThis.localStorage.removeItem(k); else globalThis.localStorage.setItem(k, v); return true; } catch (e) { return false; } };
/** the player's precise location, if he switched it on: {lat, lon, israel} rounded, or null */
export function readLoc29() {
  try { const v = JSON.parse(lsGet(LOC29_KEY) || 'null'); if (v && v.on && Number.isFinite(v.lat) && Number.isFinite(v.lon)) return { lat: v.lat, lon: v.lon, israel: !!v.israel }; } catch (e) { /* */ }
  return null;
}
/** keep it (rounded to 2 decimals, ≈ 1 km) — or, with null, forget it */
export function saveLoc29(lat, lon) {
  if (lat == null) { lsSet(LOC29_KEY, null); return null; }
  const v = { on: true, lat: round2(+lat), lon: round2(+lon) };
  v.israel = inIsrael29(v.lat, v.lon);
  lsSet(LOC29_KEY, JSON.stringify(v));
  return v;
}
/** the current UTC offset of a zone, minutes (east +) */
function offsetMin(tz, at = Date.now()) {
  try {
    const p = Object.fromEntries(new Intl.DateTimeFormat('en-US', { timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric' }).formatToParts(new Date(at)).map((x) => [x.type, x.value]));
    return Math.round((Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute) - Math.floor(at / MIN) * MIN) / MIN);
  } catch (e) { return 0; }
}
/**
 * Where the phone is — no permission asked unless the player switched "מיקום מדויק" on.
 * @param {{tz?: string, loc?: {lat, lon, israel?}, query?: object|null}} [o]  tests: a zone and/or a position
 */
export function where29(o = {}) {
  const q = o.query === undefined ? query29() : o.query;
  const hookLoc = o.loc || globalThis.__LOC29 || (q && q.lat != null && q.lon != null ? { lat: +q.lat, lon: +q.lon } : null);
  const want = o.tz || globalThis.__TZ29 || (hookLoc && hookLoc.tz) || (q && q.tz) || deviceZone();
  const known = tzOk(want), tz = known ? want : 'Asia/Jerusalem';
  const pos = hookLoc && Number.isFinite(+hookLoc.lat) && Number.isFinite(+hookLoc.lon) ? hookLoc : readLoc29();
  if (pos) {
    const lat = +pos.lat, lon = +pos.lon, israel = pos.israel != null ? !!pos.israel : inIsrael29(lat, lon);
    return { lat, lon, israel, source: 'gps', city: 'מיקום הטלפון', tz };
  }
  const z = known ? ZONES29[want] : null;
  if (z) return { lat: z[1], lon: z[2], israel: !!z[3], source: 'tz', city: z[0], tz };
  // a zone not in the table: the sun of its UTC offset (15° of longitude an hour; latitude 40° north, or 33° south) — abroad (rule 16:
  // its second Yom Tov); 'UTC' / 'GMT' (no zone set) is no place: Jerusalem
  if (known && !/^(Etc\/)?(UTC|GMT|Universal|Zulu)(\+0|-0|0)?$/.test(want)) return { lat: SOUTH.test(want) ? -33 : 40, lon: Math.max(-180, Math.min(180, offsetMin(want) / 4)), israel: false, source: 'tz', city: want.split('/').pop().replace(/_/g, ' '), tz, approx: true };
  return { lat: JERUSALEM29.lat, lon: JERUSALEM29.lon, israel: true, source: 'default', city: 'ירושלים', tz };
}
/** km between two points (haversine) */
const km = (a, b) => { const R = Math.PI / 180, x = Math.sin(((b.lat - a.lat) * R) / 2) ** 2 + Math.cos(a.lat * R) * Math.cos(b.lat * R) * Math.sin(((b.lon - a.lon) * R) / 2) ** 2; return 12742 * Math.asin(Math.sqrt(x)); };
export const atJerusalem29 = (w) => km(w, JERUSALEM29) <= LOCK29.jerKm;

// ─── HH:MM where the phone is ───────────────────────────────────────────────────────────────────────
const hmFmts = {};
export function hm29(ms, tz) {
  try { const f = hmFmts[tz] || (hmFmts[tz] = new Intl.DateTimeFormat('en-GB', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })); return f.format(new Date(ms)); } catch (e) { const d = new Date(ms); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; }
}

// ─── Shabbat and Yom Tov ────────────────────────────────────────────────────────────────────────────
// [id, name] by the Hebrew date of the day (Israel; abroad adds GOLA's)
const YT_IL = { Tishrei: { 1: ['rh', 'ראש השנה'], 2: ['rh', 'ראש השנה'], 10: ['yk', 'יום הכיפורים'], 15: ['yt', 'סוכות'], 22: ['yt', 'שמיני עצרת · שמחת תורה'] }, Nisan: { 15: ['yt', 'פסח'], 21: ['yt', 'שביעי של פסח'] }, Sivan: { 6: ['yt', 'שבועות'] } };
const YT_GOLA = { Tishrei: { 16: ['yt', 'סוכות'], 22: ['yt', 'שמיני עצרת'], 23: ['yt', 'שמחת תורה'] }, Nisan: { 16: ['yt', 'פסח'], 22: ['yt', 'אחרון של פסח'] }, Sivan: { 7: ['yt', 'שבועות'] } };
/** the Yom Tov of civil day `dn` — {id: 'rh'|'yk'|'yt', name} — or null (Chol HaMoed, Chanukah, Purim: open) */
export function yomTov29(dn, israel = true) {
  const h = hebrewOnDay(dn), m = h.month;
  const g = !israel && YT_GOLA[m] && YT_GOLA[m][h.day];
  const il = YT_IL[m] && YT_IL[m][h.day];
  const x = g || il;
  return x ? { id: x[0], name: x[1] } : null;
}
/** a day of rest (Shabbat or Yom Tov), or null */
export function restDay29(dn, israel = true) {
  const shabbat = weekdayOnDay(dn) === 6, yt = yomTov29(dn, israel);
  if (!shabbat && !yt) return null;
  return { dn, shabbat, yt, name: yt ? (shabbat ? `שבת · ${yt.name}` : yt.name) : 'שבת' };
}
const sunOr = (dn, w) => { const s = sunOnDay(dn, w); if (s.sunset) return s; return sunOnDay(dn, JERUSALEM29); };   // (no sunset at all — a polar day: Jerusalem's)
const tzeitOf = (dn, w) => { const s = sunOr(dn, w); return s.tzeit ? +s.tzeit : +s.sunset + LOCK29.noTzeit * MIN; };
/** the runs of rest days around civil day `dn0`, each with its times */
export function runs29(dn0, w) {
  const out = [];
  let cur = null;
  for (let d = dn0 - 6; d <= dn0 + 10; d++) {   // (a run is at most three days: one cut by the window's start ended days before dn0)
    const r = restDay29(d, !!w.israel);
    if (!r) { cur = null; continue; }
    if (cur && cur.last === d - 1) { cur.days.push(r); cur.last = d; } else { cur = { first: d, last: d, days: [r] }; out.push(cur); }
  }
  const candleMin = atJerusalem29(w) ? LOCK29.candleJer : LOCK29.candle;
  for (const r of out) {
    r.sunsets = {};
    for (let d = r.first - 1; d <= r.last; d++) r.sunsets[d] = +sunOr(d, w).sunset;
    r.candle = r.sunsets[r.first - 1] - candleMin * MIN;
    r.locksAt = r.candle - LOCK29.before * MIN;
    r.softAt = r.locksAt - LOCK29.soft * MIN;
    r.opensAt = tzeitOf(r.last, w);
    // Jerusalem's own entry for the same first day (its candle-lighting, 40 minutes before its sunset) — "בירושלים כבר נכנסה השבת" — and
    // its end (Jerusalem keeps one day of Yom Tov: in New York's Sukkot 2 Jerusalem's festival day is over, and so is the line)
    r.jerAt = +sunOnDay(r.first - 1, JERUSALEM29).sunset - LOCK29.candleJer * MIN;
    let jl = r.first; while (restDay29(jl + 1, true)) jl++;
    r.jerEnd = restDay29(r.first, true) ? tzeitOf(jl, JERUSALEM29) : r.jerAt;
  }
  return out;
}
const kindOf = (day) => (day.yt ? 'yomtov' : 'shabbat');
function greetOf(day) {
  if (day.yt && day.yt.id === 'yk') return 'גמר חתימה טובה';
  if (day.yt && day.yt.id === 'rh') return day.shabbat ? 'שבת שלום ושנה טובה' : 'שנה טובה';
  if (day.yt) return day.shabbat ? 'שבת שלום וחג שמח' : 'חג שמח';
  return 'שבת שלום';
}
// the lock screen's verse (טיוטה; checked against the Masoretic text — Sefaria): Shabbat, Yom Tov, Rosh HaShana, Yom Kippur
export const VERSE29 = Object.freeze({
  shabbat: ['וְשָׁמְרוּ בְנֵי יִשְׂרָאֵל אֶת הַשַּׁבָּת', 'שמות לא, טז'],
  yt: ['וְשָׂמַחְתָּ בְּחַגֶּךָ', 'דברים טז, יד'],
  rh: ['יוֹם תְּרוּעָה יִהְיֶה לָכֶם', 'במדבר כט, א'],
  yk: ['כִּי בַיּוֹם הַזֶּה יְכַפֵּר עֲלֵיכֶם לְטַהֵר אֶתְכֶם', 'ויקרא טז, ל'],
});
/**
 * The lock at `now` where the phone is.
 * @returns {{locked: boolean, soft: boolean, kind: 'shabbat'|'yomtov'|null, name: string, greet: string, verse: string[],
 *   locksAt: number, softAt: number, opensAt: number, candle: number, outHe: string, israel: boolean, tz: string,
 *   jerusalem: {entered: boolean, at: number, earlier: boolean}}}
 *   locked → the run now; otherwise the next run (its kind/name for the calm line); times in ms
 */
export function status29(now = clock29(), w = where29()) {
  const t = +now, dn = civilDay(new Date(t), w.tz), runs = runs29(dn, w);
  const cur = runs.find((r) => r.locksAt <= t && t < r.opensAt) || null;
  const r = cur || runs.find((x) => x.locksAt > t) || null;
  if (!r) return { locked: false, soft: false, kind: null, name: '', greet: '', verse: null, locksAt: NaN, softAt: NaN, opensAt: NaN, candle: NaN, outHe: '', israel: !!w.israel, tz: w.tz, jerusalem: { entered: false, at: NaN, earlier: false } };
  // the day of the run now: before its eve's sunset the first; then the day whose evening has come
  let day = r.days[0];
  if (cur) for (const d of r.days) if (t >= r.sunsets[d.dn - 1]) day = d;
  const last = r.days[r.days.length - 1];
  const outHe = last.shabbat ? 'במוצאי שבת' : last.yt && last.yt.id === 'yk' ? 'במוצאי יום הכיפורים' : 'במוצאי החג';
  const vk = day.yt ? (day.yt.id === 'yk' || day.yt.id === 'rh' ? day.yt.id : 'yt') : 'shabbat';
  return {
    locked: !!cur, soft: !cur && t >= r.softAt, kind: kindOf(day), name: day.name, greet: greetOf(day), verse: VERSE29[vk],
    yk: !!(day.yt && day.yt.id === 'yk'), locksAt: r.locksAt, softAt: r.softAt, opensAt: r.opensAt, candle: r.candle, outHe,
    israel: !!w.israel, tz: w.tz, days: r.days.map((d) => d.name),
    jerusalem: { entered: t >= r.jerAt && t < r.jerEnd, at: r.jerAt, end: r.jerEnd, earlier: r.jerAt < r.candle - MIN },
  };
}
/** the calm line, 15 minutes before the lock (no countdown) */
export function softLine29(s) {
  if (!s || !s.soft) return '';
  const what = s.kind === 'shabbat' ? 'שבת' : s.yk ? 'יום הכיפורים' : 'חג';
  return `עוד מעט ${what} — המקדש ייסגר ב-${hm29(s.locksAt, s.tz)}`;
}
/** the lock screen's words */
export function lockText29(s, w = null) {
  if (!s || !s.locked) return null;
  const jer = s.jerusalem && s.jerusalem.entered && s.jerusalem.earlier && !(w && atJerusalem29(w)) ? (s.kind === 'shabbat' ? 'בירושלים כבר נכנסה השבת' : s.yk ? 'בירושלים כבר נכנס יום הכיפורים' : 'בירושלים כבר נכנס החג') : '';
  return { greet: s.greet, name: s.name, open: `המקדש ייפתח ${s.outHe}, בשעה ${hm29(s.opensAt, s.tz)}`, jer, verse: s.verse ? s.verse[0] : '', src: s.verse ? s.verse[1] : '' };
}

// ─── the sky and the Temple now, where the phone is ─────────────────────────────────────────────────
/** schedule.js skyOf's thresholds (night · dawn = alot → an hour after sunrise · noon · dusk = the last 90 minutes before sunset → tzeit),
 *  by the sun of the LOCAL civil date (skyOf takes Jerusalem's date, wrong for New York in its evening) */
export function sky29(now = clock29(), w = where29()) {
  const t = +now, s = sunOnDay(civilDay(new Date(t), w.tz), w);
  if (!s.alotHaShachar || !s.tzeit) return s.sunset && t >= +s.sunset - 1.5 * HOUR && t < +s.sunset + LOCK29.noTzeit * MIN ? 'dusk' : 'noon';
  if (t < +s.alotHaShachar || t >= +s.tzeit) return 'night';
  if (t < +s.sunrise + HOUR) return 'dawn';
  if (t >= +s.sunset - 1.5 * HOUR) return 'dusk';
  return 'noon';
}
// Sefaria refs (calendar.js) → Hebrew: "Mishnah Tamid 3:2" → "תמיד ג, ב"; "Yoma 33a" → "יומא לג ע״א"; "Numbers 28:11" → "במדבר כח, יא"
const BOOKS = { Genesis: 'בראשית', Exodus: 'שמות', Leviticus: 'ויקרא', Numbers: 'במדבר', Deuteronomy: 'דברים', Berakhot: 'ברכות', Yoma: 'יומא', Tamid: 'תמיד', Pesachim: 'פסחים', Sukkah: 'סוכה', Megillah: 'מגילה', Menachot: 'מנחות', Temurah: 'תמורה', Beitzah: 'ביצה', Shekalim: 'שקלים', Taanit: 'תענית', "Ta'anit": 'תענית', Middot: 'מידות' };
const G = (n) => gematria(+n).replace(/[׳״]/g, '');   // (as the game cites: "תמיד ג, ב", "יומא לג ע״א")
export function srcHe29(ref) {
  return String(ref || '').split(/;\s*/).filter(Boolean).map((one) => {
    let m = one.match(/^Mishneh Torah, Paschal Offering (\d+):(\d+)$/);
    if (m) return `רמב״ם, קרבן פסח ${G(m[1])}, ${G(m[2])}`;
    m = one.match(/^(?:Mishnah )?([A-Za-z']+) (\d+):(\d+)(?:-(\d+))?$/);
    if (m && BOOKS[m[1]]) return `${BOOKS[m[1]]} ${G(m[2])}, ${G(m[3])}${m[4] ? '–' + G(m[4]) : ''}`;
    m = one.match(/^([A-Za-z']+) (\d+)-(\d+)$/);
    if (m && BOOKS[m[1]]) return `${BOOKS[m[1]]} ${G(m[2])}–${G(m[3])}`;
    m = one.match(/^([A-Za-z']+) (\d+)([ab])$/);
    if (m && BOOKS[m[1]]) return `${BOOKS[m[1]]} ${G(m[2])} ע״${m[3] === 'a' ? 'א' : 'ב'}`;
    return one;
  }).join('; ');
}
// the night's line when the Temple's service is the night burning only — Middot 1:1 (טיוטה)
export const NIGHT29 = Object.freeze({ text: 'בלילה הכהנים שומרים בשלשה מקומות — בית אבטינס, בית הניצוץ ובית המוקד', quote: 'בִּשְׁלֹשָׁה מְקוֹמוֹת הַכֹּהֲנִים שׁוֹמְרִים בְּבֵית הַמִּקְדָּשׁ', src: 'מידות א, א' });
const evOut = (e, tz) => ({ id: e.id, name: e.nameHe, at: +e.start, end: +e.end, hm: hm29(+e.start, tz), approx: !!e.approx, src: srcHe29(e.source) });
/**
 * The Temple's service now and next, by the sun where the phone is ("the Temple here, now" — realtime-dual-timeline-he.md).
 * @returns {{sky, current: object|null, next: object[], night: object|null, line: string, src: string}}
 */
export function templeNow29(now = clock29(), w = where29(), n = 3) {
  const t = +now;
  let cur = null, next = [];
  try {
    const it = nowInTemple(new Date(t), w, w.tz);
    cur = it.current ? evOut(it.current, w.tz) : null;
    const dn = civilDay(new Date(t), w.tz);
    next = [dn, dn + 1].flatMap((d) => scheduleOnDay(d, w)).filter((e) => +e.start > t).sort((a, b) => a.start - b.start).slice(0, n).map((e) => evOut(e, w.tz));
  } catch (e) { cur = null; next = []; }
  const sky = (() => { try { return sky29(t, w); } catch (e) { return 'noon'; } })();
  const night = sky === 'night' ? NIGHT29 : null;
  return { sky, current: cur, next, night, line: cur ? `עכשיו במקדש: ${cur.name}` : next[0] ? `עכשיו במקדש: בין העבודות · ${next[0].name} ב-${next[0].hm}` : 'עכשיו במקדש', src: cur ? cur.src : next[0] ? next[0].src : '' };
}
