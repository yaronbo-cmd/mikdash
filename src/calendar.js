/**
 * calendar.js: the Temple time engine ("what is happening in the Temple right now", by the real clock).
 *
 * - Dependency-free ES module. Hebrew dates come from Intl (the ICU Hebrew calendar). Solar times come from
 *   the NOAA solar-position equations (after Meeus), written here from the published formulas (NOAA's
 *   equations are a US-Government work in the public domain). No third-party code.
 * - The Temple day follows Jerusalem. A "day" is a civil date in Asia/Jerusalem. Its service runs from the
 *   clearing of the altar before dawn to the burning of limbs and fats through the night, which ends at the
 *   next dawn ("הקטר חלבים ואברים, מצותן עד שיעלה עמוד השחר", Mishnah Berakhot 1:1).
 * - The Land of Israel calendar is used (one-day festivals); the Temple was in Jerusalem.
 * - Sources are Sefaria refs, checked on Sefaria on 2026-09-23 (Mishnah: Torat Emet 357; Talmud: William
 *   Davidson ed.). Where a source fixes the ORDER of the service but not the clock time, the time here is an
 *   estimate and the event carries `approx: true`.
 * - Every event name is content. It carries status 'draft' until Yaron approves it (PROJECT.md §2.2).
 *   Divine Names are never written in full (PROJECT.md §2.3).
 */

/** @typedef {{lat: number, lon: number}} Loc  degrees; east longitude positive */
/**
 * @typedef {object} HebrewDate
 * @property {number} day
 * @property {string} month  'Tishrei'|'Cheshvan'|'Kislev'|'Tevet'|'Shevat'|'Adar'|'AdarI'|'AdarII'|'Nisan'|'Iyar'|'Sivan'|'Tammuz'|'Av'|'Elul'
 * @property {string} monthHe
 * @property {number} year
 * @property {boolean} isLeap
 * @property {string} dayHe   e.g. 'י״ב'
 * @property {string} yearHe  e.g. 'ה׳תשפ״ז'
 */
/**
 * @typedef {object} TempleEvent
 * @property {string} id
 * @property {string} nameHe
 * @property {Date} start
 * @property {Date} end
 * @property {string} source   Sefaria ref(s), '; '-separated
 * @property {boolean} [approx] true when the clock time is our estimate (the sources give the order only)
 * @property {'draft'|'approved'} status
 */

/** Default location: the Temple Mount. */
export const TEMPLE_MOUNT = Object.freeze({ lat: 31.7781, lon: 35.2354 });

/** Depression of the sun's centre below the horizon, in degrees. */
export const DEPRESSION = Object.freeze({
  sunrise: 0.833, // sunrise/sunset: 34′ standard refraction + 16′ solar radius (as NOAA and USNO use)
  alot: 16.1, // עלות השחר
  // "האיר פני כל המזרח" (Mishnah Tamid 3:2) is an observation, not a number. OUR ESTIMATE: nautical
  // dawn, when the horizon turns distinct. It lies between alot and sunrise. Tune here.
  eastLit: 12,
  tzeit: 8.5, // צאת הכוכבים
});

/** קריאת הגבר (cock-crow, Yoma 1:8) has no clock time in the sources. OUR ESTIMATE: the start of the
 *  last quarter of the night (sunset → sunrise). */
const COCKCROW = 3 / 4;
/** Estimated lengths (minutes) of acts whose order, but not duration, the Mishnah gives. */
const MINUTES = { tamid: 30, chamber: 15, ketoret: 15, blessing: 10, libations: 20, musaf: 60, showbread: 30, lamps: 15, omer: 60 };
/** The Levites' psalm of the day, Sunday … Shabbat (Mishnah Tamid 7:4). */
const PSALM_OF_DAY = [24, 48, 82, 94, 81, 93, 92];

/** The 24 priestly watches in lot order, spelled as in I Chronicles 24:7–18 (Masoretic; שערים = שְׂעֹרִים). */
export const MISHMAROT = Object.freeze([
  'יהויריב', 'ידעיה', 'חרם', 'שערים', 'מלכיה', 'מימן', 'הקוץ', 'אביה', 'ישוע', 'שכניהו', 'אלישיב', 'יקים',
  'חפה', 'ישבאב', 'בלגה', 'אמר', 'חזיר', 'הפצץ', 'פתחיה', 'יחזקאל', 'יכין', 'גמול', 'דליהו', 'מעזיהו',
]);

const TZ = 'Asia/Jerusalem';
const MIN = 60e3, HOUR = 60 * MIN, DAY = 24 * HOUR, RAD = Math.PI / 180;
const GERESH = '׳', GERSHAYIM = '״'; // Hebrew geresh ׳ and gershayim ״ (not ASCII quotes)
const mod = (a, n) => ((a % n) + n) % n;
const at = (d, minutes) => new Date(d.getTime() + minutes * MIN);

// ─── Jerusalem civil days ─────────────────────────────────────────────────────────────────────────

const civilFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, year: 'numeric', month: 'numeric', day: 'numeric' });
const partsOf = (fmt, d) => Object.fromEntries(fmt.formatToParts(d).map((p) => [p.type, p.value]));
// ── fable32 (build 29) ── the civil date in another time zone (the phone's: rule 16 — the sun and the festivals by where the phone
// is). Every function below keeps Jerusalem as its default; a bad zone name throws (Intl's RangeError) ── /fable32 ──
const civilFmts = { [TZ]: civilFmt };
const civilFmtOf = (tz) => civilFmts[tz] || (civilFmts[tz] = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric' }));

function toDate(d) {
  const x = d === undefined ? new Date() : d instanceof Date ? d : new Date(d);
  if (Number.isNaN(x.getTime())) throw new TypeError('calendar.js: invalid date');
  return x;
}

/** Day number (days since 1970-01-01) of the civil date at instant `d` in Jerusalem (or in time zone `tz`). */
function dayOf(d, tz = TZ) {
  const p = partsOf(civilFmtOf(tz), d), t = new Date(0);
  t.setUTCFullYear(+p.year, +p.month - 1, +p.day); // setUTCFullYear keeps years < 100 literal (70 CE)
  return Math.round(t.getTime() / DAY);
}
/** 0 = Sunday … 6 = Shabbat (day 0, 1970-01-01, was a Thursday). */
const weekdayOf = (dn) => mod(dn + 4, 7);

// ─── Hebrew dates ─────────────────────────────────────────────────────────────────────────────────

const hebFmt = new Intl.DateTimeFormat('en-u-ca-hebrew', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' });
const HAS_HEBREW = hebFmt.resolvedOptions().calendar === 'hebrew';

/** ICU/CLDR English month name (normalised) → [our key, Hebrew name]. Aliases cover other spellings. */
const MONTHS = {};
for (const [key, he, ...aliases] of [
  ['Tishrei', 'תשרי', 'tishri'], ['Cheshvan', 'חשוון', 'heshvan', 'marcheshvan'], ['Kislev', 'כסלו'],
  ['Tevet', 'טבת', 'teveth'], ['Shevat', 'שבט', 'shvat'], ['AdarI', 'אדר א' + GERESH, 'adar1'], ['Adar', 'אדר'],
  ['AdarII', 'אדר ב' + GERESH, 'adar2'], ['Nisan', 'ניסן'], ['Iyar', 'אייר', 'iyyar'], ['Sivan', 'סיוון'],
  ['Tammuz', 'תמוז', 'tamuz'], ['Av', 'אב'], ['Elul', 'אלול'],
]) for (const k of [key, ...aliases]) MONTHS[k.toLowerCase()] = [key, he];

/** Leap years are years 3, 6, 8, 11, 14, 17, 19 of the 19-year cycle of the fixed calendar. */
export const isLeapYear = (year) => mod(7 * year + 1, 19) < 7;

const ONES = ['', ...'אבגדהוזחט'], TENS = ['', ...'יכלמנסעפצ'], HUNDREDS = ['', ...'קרשת'];
function letters(n) { // 1..999 → Hebrew letters, without punctuation
  let s = 'ת'.repeat(Math.floor(n / 400));
  n %= 400;
  s += HUNDREDS[Math.floor(n / 100)];
  n %= 100;
  if (n === 15 || n === 16) return s + 'ט' + ONES[n - 9]; // ט״ו, ט״ז: never spell a Divine Name
  return s + TENS[Math.floor(n / 10)] + ONES[n % 10];
}
const punctuate = (s) => (s.length === 1 ? s + GERESH : s.slice(0, -1) + GERSHAYIM + s.slice(-1));
/** Hebrew numeral with geresh/gershayim: 1 → 'א׳', 12 → 'י״ב', 15 → 'ט״ו'. For 1..999. */
export const gematria = (n) => punctuate(letters(n));
const yearHe = (y) => (y >= 1000 ? letters(Math.floor(y / 1000)) + GERESH : '') + (y % 1000 ? gematria(y % 1000) : '');

/** Hebrew date of Jerusalem civil day `dn`: ICU evaluated at noon of that date (formatted in UTC so no
 *  DST or old-offset arithmetic is involved; the civil date is the same as noon in Jerusalem). */
function hebrewOfDay(dn) {
  if (!HAS_HEBREW) throw new Error('calendar.js: this Intl has no Hebrew calendar (needs full ICU)');
  const p = partsOf(hebFmt, new Date(dn * DAY + 12 * HOUR));
  const m = MONTHS[String(p.month).toLowerCase().replace(/[^a-z0-9]/g, '')];
  if (!m) throw new Error(`calendar.js: unknown Hebrew month name "${p.month}"`);
  const day = +p.day, year = +p.year;
  return { day, month: m[0], monthHe: m[1], year, isLeap: isLeapYear(year), dayHe: gematria(day), yearHe: yearHe(year) };
}

/**
 * Hebrew date of the Jerusalem civil date of `date` (the daytime date; it does NOT roll over at sunset).
 * @param {Date|number|string} [date=now]
 * @returns {HebrewDate}
 */
export function hebrewDate(date) {
  return hebrewOfDay(dayOf(toDate(date)));
}

/**
 * Hebrew date at the instant `date`: like hebrewDate, but the day advances at Jerusalem sunset. The Hebrew
 * day runs from evening to evening ("ויהי ערב ויהי בקר", Genesis 1:5).
 * @param {Date|number|string} [date=now]
 * @param {Loc} [loc=TEMPLE_MOUNT] where sunset is taken
 * @returns {HebrewDate}
 */
export function hebrewDateAt(date, loc = TEMPLE_MOUNT) {
  const d = toDate(date), dn = dayOf(d), sunset = sunAt(dn, loc, DEPRESSION.sunrise, false);
  return hebrewOfDay(sunset && d >= sunset ? dn + 1 : dn);
}

// ─── The sun (NOAA / Meeus) ───────────────────────────────────────────────────────────────────────

/** Solar declination (radians) and equation of time (minutes) at Julian Day `jd`. */
function solar(jd) {
  const T = (jd - 2451545) / 36525; // Julian centuries since J2000.0
  const L0 = mod(280.46646 + T * (36000.76983 + T * 0.0003032), 360) * RAD; // geometric mean longitude
  const M = (357.52911 + T * (35999.05029 - 0.0001537 * T)) * RAD; // mean anomaly
  const e = 0.016708634 - T * (0.000042037 + 0.0000001267 * T); // orbital eccentricity
  const C = Math.sin(M) * (1.914602 - T * (0.004817 + 0.000014 * T)) + Math.sin(2 * M) * (0.019993 - 0.000101 * T)
    + Math.sin(3 * M) * 0.000289; // equation of centre (degrees)
  const omega = (125.04 - 1934.136 * T) * RAD;
  const lambda = L0 + (C - 0.00569 - 0.00478 * Math.sin(omega)) * RAD; // apparent longitude
  const eps0 = 23 + (26 + (21.448 - T * (46.815 + T * (0.00059 - T * 0.001813))) / 60) / 60;
  const eps = (eps0 + 0.00256 * Math.cos(omega)) * RAD; // corrected obliquity
  const y = Math.tan(eps / 2) ** 2;
  const eqTime = (4 / RAD) * (y * Math.sin(2 * L0) - 2 * e * Math.sin(M) + 4 * e * y * Math.sin(M) * Math.cos(2 * L0)
    - 0.5 * y * y * Math.sin(4 * L0) - 1.25 * e * e * Math.sin(2 * M));
  return { decl: Math.asin(Math.sin(eps) * Math.sin(lambda)), eqTime };
}
const julian = (dn, minutesUTC) => 2440587.5 + dn + minutesUTC / 1440;

/** Moment on day `dn` when the sun's centre is `dep`° below the horizon, rising (morning) or setting;
 *  null where it never gets that low. Iterated so the sun's position is taken at the event itself. */
function sunAt(dn, loc, dep, rising) {
  const phi = loc.lat * RAD;
  let t = 720 - 4 * loc.lon; // first guess: local mean noon, minutes after 00:00 UTC
  for (let i = 0; i < 3; i++) {
    const { decl, eqTime } = solar(julian(dn, t));
    const cosH = (Math.cos((90 + dep) * RAD) - Math.sin(phi) * Math.sin(decl)) / (Math.cos(phi) * Math.cos(decl));
    if (cosH < -1 || cosH > 1) return null;
    t = 720 - 4 * loc.lon - eqTime + (rising ? -4 : 4) * (Math.acos(cosH) / RAD);
  }
  return new Date(dn * DAY + t * MIN);
}

function noonOf(dn, loc) {
  let t = 720 - 4 * loc.lon;
  for (let i = 0; i < 2; i++) t = 720 - 4 * loc.lon - solar(julian(dn, t)).eqTime;
  return new Date(dn * DAY + t * MIN);
}

function sunOfDay(dn, loc) {
  return {
    alotHaShachar: sunAt(dn, loc, DEPRESSION.alot, true),
    sunrise: sunAt(dn, loc, DEPRESSION.sunrise, true),
    solarNoon: noonOf(dn, loc),
    sunset: sunAt(dn, loc, DEPRESSION.sunrise, false),
    tzeit: sunAt(dn, loc, DEPRESSION.tzeit, false),
  };
}

/**
 * Sun times for the Jerusalem civil date of `date`, by the NOAA solar algorithm. Sunrise and sunset use the
 * standard −0.833°. alotHaShachar is the sun 16.1° below the horizon, and tzeit is 8.5° below.
 * Works where the sun reaches those depressions (not in polar summers).
 * @param {Date|number|string} [date=now]
 * @param {Loc} [loc=TEMPLE_MOUNT]
 * @returns {{alotHaShachar: Date, sunrise: Date, solarNoon: Date, sunset: Date, tzeit: Date}}
 */
export function sunTimes(date, loc = TEMPLE_MOUNT, tz = TZ) {
  return sunOfDay(dayOf(toDate(date), tz), loc);   // ── fable32 (build 29) ── (tz: the civil date where the phone is) ── /fable32 ──
}

// ── fable32 (build 29) ── by civil day number (the Shabbat and Yom Tov lock, src/avodah/shift/time29.js): a day number is the civil
// date itself, the same in every zone, so these need no zone. sunOnDay works wherever local noon is within ±12 h of 12:00 UTC.
/** Day number (days since 1970-01-01) of the civil date at `date` in time zone `tz` (default Jerusalem). */
export function civilDay(date, tz = TZ) { return dayOf(toDate(date), tz); }
/** Sun times (as sunTimes) of civil day number `dn` at `loc`. */
export function sunOnDay(dn, loc = TEMPLE_MOUNT) { return sunOfDay(dn, loc); }
/** Hebrew date of the daytime of civil day number `dn` (it does not roll over at sunset). */
export function hebrewOnDay(dn) { return hebrewOfDay(dn); }
/** 0 = Sunday … 6 = Shabbat, of civil day number `dn`. */
export function weekdayOnDay(dn) { return weekdayOf(dn); }
/** The Temple service (as templeSchedule) of civil day number `dn`, by the sun at `loc`. */
export function scheduleOnDay(dn, loc = TEMPLE_MOUNT) { return scheduleOfDay(dn, loc); }
// ── /fable32 ──

const hourOf = (sun, n) => new Date(sun.sunrise.getTime() + (n * (sun.sunset - sun.sunrise)) / 12);

/**
 * The moment n "שעות זמניות" (seasonal hours) after sunrise, following the GR"A: an hour is
 * (sunset − sunrise) / 12. The Mishnah's hours (e.g. Pesachim 5:1) are counted this way here.
 * @param {Date|number|string} date
 * @param {number} n  may be fractional, e.g. 8.5
 * @param {Loc} [loc=TEMPLE_MOUNT]
 * @returns {Date}
 */
export function halachicHour(date, n, loc = TEMPLE_MOUNT) {
  return hourOf(sunOfDay(dayOf(toDate(date)), loc), n);
}

// ─── The day in the Land of Israel calendar ──────────────────────────────────────────────────────

const FESTIVALS = new Set(['pesach', 'shavuot', 'sukkot', 'shemini-atzeret']); // רגלים
const MUSAF_OF = { 'rosh-hashana': 'ראש השנה', 'yom-kippur': 'יום הכיפורים', sukkot: 'סוכות', 'shemini-atzeret': 'שמיני עצרת', pesach: 'פסח', shavuot: 'שבועות' };
const special = (id, nameHe, source) => ({ id, nameHe, source, status: 'draft' });

function infoOfDay(dn) {
  const hebrew = hebrewOfDay(dn), { day, month } = hebrew, weekday = weekdayOf(dn);
  const isShabbat = weekday === 6;
  // New-moon day: day 30 and day 1. That includes 1 Tishrei, whose Musaf in the Temple added the new-moon
  // offerings ("מלבד עלת החדש", Numbers 29:6).
  const isRoshChodesh = day === 1 || day === 30;
  let holiday = null, omerDay = null, sukkotDay = null;
  const set = (id, nameHe, d = 1) => { holiday = { id, nameHe, day: d }; };
  const specials = [];

  if (month === 'Tishrei') {
    if (day <= 2) set('rosh-hashana', 'ראש השנה', day);
    else if (day === 10) set('yom-kippur', 'יום הכיפורים');
    else if (day >= 15 && day <= 21) {
      sukkotDay = day - 14;
      set('sukkot', day === 15 ? 'סוכות' : day === 21 ? 'הושענא רבה' : 'חול המועד סוכות', sukkotDay);
    } else if (day === 22) set('shemini-atzeret', 'שמיני עצרת');
  } else if (month === 'Kislev' && day >= 25) set('chanukah', 'חנוכה', day - 24);
  else if (month === 'Tevet') {
    const d = hebrewOfDay(dn - day).day - 24 + day; // Kislev has 29 or 30 days
    if (d <= 8) set('chanukah', 'חנוכה', d);
  } else if (month === 'Adar' || month === 'AdarII') { // in a leap year: Adar II
    if (day === 1) specials.push(special('shekalim', 'משמיעין על השקלים', 'Mishnah Shekalim 1:1'));
    if (day === 14) set('purim', 'פורים');
    // Jerusalem is a walled city: it reads the Megillah on the 15th (Mishnah Megillah 1:1).
    if (day === 15) set('shushan-purim', 'שושן פורים');
  } else if (month === 'Nisan') {
    if (day === 14) set('erev-pesach', 'ערב פסח');
    if (day >= 15 && day <= 21) set('pesach', day === 15 ? 'פסח' : day === 21 ? 'שביעי של פסח' : 'חול המועד פסח', day - 14);
    if (day >= 16) omerDay = day - 15; // the Omer is brought on 16 Nisan (Mishnah Menachot 10:3)
  } else if (month === 'Iyar') omerDay = day + 15; // Nisan has 30 days
  else if (month === 'Sivan') {
    if (day <= 5) omerDay = day + 44; // Iyar has 29 days → 5 Sivan is day 49
    if (day === 6) {
      set('shavuot', 'שבועות');
      specials.push(special('shtei-halechem', 'שתי הלחם', 'Leviticus 23:17'));
    }
  } else if (month === 'Av' && day === 9) set('tisha-bav', 'תשעה באב'); // Mishnah Taanit 4:6

  if (isRoshChodesh) specials.unshift(special('rosh-chodesh', 'ראש חודש', 'Numbers 28:11'));
  const musafOf = [isShabbat && 'שבת', isRoshChodesh && 'ראש חודש', MUSAF_OF[holiday?.id]].filter(Boolean);
  return { hebrew, weekday, isShabbat, isRoshChodesh, holiday, omerDay, sukkotDay, specials, musafOf, hasMusaf: musafOf.length > 0 };
}

/**
 * What kind of day it is in the Temple (Land of Israel calendar; the daytime Hebrew date of the Jerusalem
 * civil date). holiday.day counts festival days (Rosh Hashana 1–2, Sukkot 1–7, Pesach 1–7, Chanukah 1–8).
 * Covered: Rosh Hashana, Yom Kippur, Sukkot (7), Shemini Atzeret, Chanukah, Purim + Shushan Purim (the
 * Jerusalem Purim), Erev Pesach, Pesach (7), Omer 16 Nisan–5 Sivan, Shavuot, 9 Av, and 1 Adar (1 Adar II in
 * a leap year): the half-shekel announcement, "באחד באדר משמיעין על השקלים" (Mishnah Shekalim 1:1).
 * @param {Date|number|string} [date=now]
 * @returns {{hebrew: HebrewDate, weekday: number, isShabbat: boolean, isRoshChodesh: boolean,
 *   holiday: {id: string, nameHe: string, day: number}|null, omerDay: number|null, sukkotDay: number|null,
 *   specials: {id: string, nameHe: string, source: string, status: string}[], musafOf: string[], hasMusaf: boolean}}
 */
export function dayInfo(date) {
  return infoOfDay(dayOf(toDate(date)));
}

// ─── The Temple service ──────────────────────────────────────────────────────────────────────────

/**
 * The afternoon Tamid in seasonal hours [slaughtered, offered], Mishnah Pesachim 5:1: "תמיד נשחט בשמונה
 * ומחצה וקרב בתשע ומחצה. בערבי פסחים נשחט בשבע ומחצה וקרב בשמונה ומחצה, בין בחול בין בשבת. חל ערב פסח
 * להיות בערב שבת, נשחט בשש ומחצה וקרב בשבע ומחצה, והפסח אחריו."
 */
function tamidHours(info) {
  if (info.holiday?.id !== 'erev-pesach') return [8.5, 9.5];
  return info.weekday === 5 ? [6.5, 7.5] : [7.5, 8.5];
}

function scheduleOfDay(dn, loc) {
  const info = infoOfDay(dn), hol = info.holiday?.id;
  const sun = sunOfDay(dn, loc), prev = sunOfDay(dn - 1, loc), next = sunOfDay(dn + 1, loc);
  const events = [];
  const add = (id, nameHe, start, end, source, extra) => events.push({ id, nameHe, start, end, source, status: 'draft', ...extra });
  const nightPart = (from, to, fraction) => new Date(from.getTime() + fraction * (to - from));

  // תרומת הדשן. Yoma 1:8: "בכל יום תורמין את המזבח בקריאת הגבר או סמוך לו ... ביום הכפורים מחצות,
  // וברגלים מאשמורה הראשונה". Bartenura: the first watch is "שליש הלילה". Tamid 1:2: the first lottery.
  const fraction = hol === 'yom-kippur' ? 1 / 2 : FESTIVALS.has(hol) ? 1 / 3 : COCKCROW;
  add('terumat-hadeshen', 'תרומת הדשן', nightPart(prev.sunset, sun.sunrise, fraction), sun.alotHaShachar,
    'Mishnah Yoma 1:8; Mishnah Tamid 1:2', { approx: fraction === COCKCROW });

  // With the pyres lit, "ובאו להם ללשכת הגזית" (Tamid 2:5) for the lottery for the Tamid's tasks (3:1). On
  // Yom Kippur the High Priest does the service himself, so there is no lottery.
  const lit = sunAt(dn, loc, DEPRESSION.eastLit, true);
  if (hol !== 'yom-kippur') add('payis', 'הפייס בלשכת הגזית', sun.alotHaShachar, lit, 'Mishnah Tamid 2:5; Mishnah Tamid 3:1', { approx: true });

  // The morning sequence. Its order is from the sources; its minutes are our estimates.
  let t = lit;
  const step = (id, nameHe, minutes, source, extra) => {
    const start = t;
    t = at(t, minutes);
    add(id, nameHe, start, t, source, { approx: true, ...extra });
  };
  // Slaughter once "האיר פני כל המזרח" (Tamid 3:2); then the blood, flaying, and limbs laid on the ramp.
  step('tamid-shachar', 'שחיטת תמיד של שחר', MINUTES.tamid, 'Mishnah Tamid 3:2');
  t = at(t, MINUTES.chamber); // blessing and Shema in the Chamber, then the lottery for the ketoret (Tamid 5:1–2)
  // The ketoret "בין דם לאברים" (Yoma 3:5).
  step('ketoret-shachar', 'קטורת של שחר', MINUTES.ketoret, 'Mishnah Tamid 6:3; Mishnah Yoma 3:5');
  step('birkat-kohanim', 'ברכת כהנים', MINUTES.blessing, 'Mishnah Tamid 7:2'); // on the steps of the Ulam
  const libation = t;
  // The limbs, minchah, chavitin and wine, with the Levites' song of the day (Tamid 7:3–4; Yoma 33a).
  step('nesachim', 'הקטרת האיברים, נסכים ושיר של יום', MINUTES.libations, 'Mishnah Tamid 7:3-4; Yoma 33a',
    { psalm: PSALM_OF_DAY[info.weekday] });
  // Water libation: all 7 days of Sukkot, Shabbat included ("סכה ונסוך המים, שבעה", Sukkah 4:1, unlike
  // "לולב וערבה, ששה ושבעה"). It is poured beside the wine at the altar (4:9). R. Yehuda: all eight days;
  // we follow the Tanna Kamma.
  if (info.sukkotDay) add('nisuch-hamayim', 'ניסוך המים', libation, t, 'Mishnah Sukkah 4:1; Mishnah Sukkah 4:9', { approx: true });
  // Abaye's order (Yoma 33a): "... ונסכין למוספין, ומוספין לבזיכין, ובזיכין לתמיד של בין הערבים".
  if (info.hasMusaf) step('musaf', 'קרבן מוסף', MINUTES.musaf, 'Numbers 28-29; Yoma 33a', { of: info.musafOf });
  if (info.isShabbat) step('lechem-hapanim', 'החלפת לחם הפנים והקטרת הבזיכים', MINUTES.showbread, 'Mishnah Menachot 11:7; Yoma 33a');

  const [slaughter, offer] = tamidHours(info);
  const pmStart = hourOf(sun, slaughter), pmOffered = hourOf(sun, offer);
  // Private offerings: after the morning Tamid ("שלא יהא דבר קודם לתמיד של שחר", Pesachim 58b) and before the
  // afternoon one (Pesachim 59a). None on Shabbat or Yom Kippur: "קרבנות היחיד אינן דוחים לא את השבת"
  // (Temurah 2:1). No vows or gifts on Yom Tov: "נדרים ונדבות אין קריבין ביום טוב" (Beitzah 19a), so Rosh
  // Hashana has none. The festival offerings (olot re'iyah, chagigah) are brought on the pilgrimage
  // festivals (Beit Hillel, Beitzah 2:4).
  if (!info.isShabbat && hol !== 'yom-kippur' && hol !== 'rosh-hashana') {
    const pilgrims = FESTIVALS.has(hol);
    add('korbanot-yachid', pilgrims ? 'קרבנות העולים לרגל' : 'קרבנות יחיד', t, pmStart,
      pilgrims ? 'Pesachim 58b; Pesachim 59a; Mishnah Beitzah 2:4' : 'Pesachim 58b; Pesachim 59a; Mishnah Temurah 2:1', { approx: true });
  }
  add('tamid-bein-haarbayim', 'תמיד של בין הערביים', pmStart, pmOffered, 'Mishnah Pesachim 5:1');
  // The afternoon ketoret goes "בין אברים לנסכים" (Yoma 3:5), with the lamps (Exodus 30:8). After the
  // afternoon Tamid there is only "קטורת, ונרות, ופסח" (Pesachim 59a).
  add('ketoret-erev', 'קטורת של בין הערביים', pmOffered, at(pmOffered, MINUTES.ketoret), 'Mishnah Yoma 3:5', { approx: true });
  const lampsEnd = at(pmOffered, MINUTES.ketoret + MINUTES.lamps);
  add('hadlakat-haneirot', 'הדלקת הנרות', at(pmOffered, MINUTES.ketoret), lampsEnd, 'Exodus 30:8', { approx: true });
  // The Pesach offering "אחריו" (Pesachim 5:1), in three groups (5:5). Rambam: after the afternoon ketoret and
  // the lamps "מתחילין לשחט את הפסחים עד סוף היום" (Korban Pesach 1:4).
  if (hol === 'erev-pesach') add('korban-pesach', 'שחיטת הפסח', lampsEnd, sun.sunset,
    'Mishnah Pesachim 5:1; Mishnah Pesachim 5:5; Mishneh Torah, Paschal Offering 1:4', { approx: true });

  // The night belongs to the day just ended: "כל הלילה כשר לקצירת העמר ולהקטר חלבים ואברים" (Megillah 2:6),
  // until dawn (Berakhot 1:1).
  add('haktarat-halaila', 'הקטר חלבים ואיברים', sun.sunset, next.alotHaShachar, 'Mishnah Berakhot 1:1; Mishnah Megillah 2:6');
  // The Omer is reaped at nightfall after the first day of Pesach: "כיון שחשכה, אומר להם, בא השמש"
  // (Menachot 10:3), even on Shabbat.
  if (hol === 'pesach' && info.holiday.day === 1) {
    add('omer', 'קצירת העומר', sun.tzeit, at(sun.tzeit, MINUTES.omer), 'Mishnah Menachot 10:3; Mishnah Megillah 2:6', { approx: true });
  }
  // Simchat Beit HaShoevah: "במוצאי יום טוב הראשון של חג" (Sukkah 5:2), on the nights of 16–21 Tishrei. The
  // flute of Beit HaShoevah is the one "שאינה דוחה לא את השבת ולא את יום טוב" (5:1), so there is none on a
  // Friday night. It lasts until cock-crow, "קרא הגבר" (5:4).
  const { day, month } = info.hebrew;
  if (month === 'Tishrei' && day >= 15 && day <= 20 && info.weekday !== 5) {
    add('simchat-beit-hashoevah', 'שמחת בית השואבה', sun.tzeit, nightPart(sun.sunset, next.sunrise, COCKCROW),
      'Mishnah Sukkah 5:1-4', { approx: true });
  }
  return events.sort((a, b) => a.start - b.start); // stable: ties keep the order above
}

/**
 * The day's Temple service in order, for the Jerusalem civil date of `date`. It runs from the clearing of the
 * altar (before dawn, or earlier on Yom Kippur and festivals) to the night burning, which ends at the next
 * dawn. Ids: terumat-hadeshen, payis, tamid-shachar, ketoret-shachar, birkat-kohanim, nesachim,
 * [nisuch-hamayim], [musaf], [lechem-hapanim], [korbanot-yachid], tamid-bein-haarbayim, ketoret-erev,
 * hadlakat-haneirot, [korban-pesach], haktarat-halaila, [omer], [simchat-beit-hashoevah].
 * Exact by the sources: the afternoon Tamid (Pesachim 5:1), the night burning (sunset → next alot), and the
 * clearing of the altar on Yom Kippur and festivals. Everything else is `approx`.
 * @param {Date|number|string} [date=now]
 * @param {Loc} [loc=TEMPLE_MOUNT]
 * @returns {TempleEvent[]}
 */
export function templeSchedule(date, loc = TEMPLE_MOUNT, tz = TZ) {
  return scheduleOfDay(dayOf(toDate(date), tz), loc);   // ── fable32 (build 29) ── (tz: the civil date where the phone is) ── /fable32 ──
}

/** 'עוד 42 דקות', 'עוד שעה ודקה', 'עוד שעתיים ו־5 דקות'. */
function untilHe(m) {
  if (m < 60) return m === 1 ? 'עוד דקה' : `עוד ${m} דקות`;
  const h = Math.floor(m / 60), r = m % 60;
  const hours = h === 1 ? 'שעה' : h === 2 ? 'שעתיים' : `${h} שעות`;
  return `עוד ${hours}${r === 0 ? '' : r === 1 ? ' ודקה' : ` ו־${r} דקות`}`;
}

/**
 * What is happening in the Temple at `date`, and what comes next. Yesterday's night burning and tomorrow's
 * early events are included. `active` lists every ongoing event, oldest first; `current` is the one that
 * began last (the most specific). On a Sukkot night, for example, the altar clearing runs during Simchat Beit
 * HaShoevah, and both are in `active`.
 * @param {Date|number|string} [date=now]
 * @param {Loc} [loc=TEMPLE_MOUNT]
 * @returns {{current: TempleEvent|null, active: TempleEvent[],
 *   next: {event: TempleEvent, inMinutes: number, textHe: string}|null}}  textHe, e.g. 'עוד 42 דקות: תמיד של בין הערביים'
 */
export function nowInTemple(date, loc = TEMPLE_MOUNT, tz = TZ) {
  const now = toDate(date), dn = dayOf(now, tz);   // ── fable32 (build 29) ── (tz) ── /fable32 ──
  const all = [dn - 1, dn, dn + 1].flatMap((d) => scheduleOfDay(d, loc)).sort((a, b) => a.start - b.start);
  const active = all.filter((e) => e.start <= now && now < e.end);
  const next = all.find((e) => e.start > now) ?? null;
  const current = active.length ? active[active.length - 1] : null; // (no .at(): the build targets es2020)
  if (!next) return { current, active, next: null };
  const inMinutes = Math.ceil((next.start - now) / MIN);
  return { current, active, next: { event: next, inMinutes, textHe: `${untilHe(inMinutes)}: ${next.nameHe}` } };
}

// ─── Priestly watches ─────────────────────────────────────────────────────────────────────────────

/** Shabbat 2 Aug 70 CE (proleptic Gregorian) as a day number. It is 9 Av 3830 in the calculated calendar. */
const ANCHOR_SHABBAT = -693747;
const MISHMAR_NOTE = "Computed continuation, not a tradition. The watches changed on Shabbat: the outgoing watch offered the morning Tamid and Musaf, the incoming one the afternoon Tamid and the bazichin (Sukkah 56b; Mishnah Sukkah 5:8), so weekStart = the Shabbat afternoon Tamid. Anchor: the Temple burned on מוצאי שבת of 9 Av while the watch of יהויריב served (Ta'anit 29a, 'וכן בשניה'). Taking the destruction as 3830 (70 CE), יהויריב's week starts on Shabbat 2 Aug 70 CE (proleptic Gregorian; 9 Av 3830 in the calculated calendar). From there weeks are counted without a break, mod 24, ignoring the festival weeks when all watches served (Mishnah Sukkah 5:7) and any historical calendar irregularities.";
const MISHMAR_NOTE_HE = 'חישוב משוער. המשמרות התחלפו בשבת: היוצאת עושה תמיד של שחר ומוספין, והנכנסת עושה תמיד של בין הערביים ובזיכין (סוכה נו ע״ב). העוגן: הבית חרב במוצאי שבת, בט׳ באב, ו"משמרתה של יהויריב היתה" (תענית כט ע״א). זה חושב לשנת ג׳תת״ל (70 לספירה), ומשם נספרו השבועות ברצף, 24 משמרות במחזור.';

/** Handover moment on Shabbat day-number `sat`: the afternoon Tamid (by the incoming watch, Sukkah 56b). */
const handover = (sat, loc) => hourOf(sunOfDay(sat, loc), tamidHours(infoOfDay(sat))[0]);

/**
 * The priestly watch (משמר) on duty at `date`: a computed continuation of the weekly rotation of the 24 watches
 * (I Chronicles 24:7–18), anchored on Ta'anit 29a ("ומשמרתה של יהויריב היתה ... וכן בשניה"). See `note`.
 * @param {Date|number|string} [date=now]
 * @param {Loc} [loc=TEMPLE_MOUNT] for the handover time
 * @returns {{index: number, nameHe: string, weekStart: Date, note: string, noteHe: string, status: string}}
 *   index is 1..24; weekStart is when this watch took over (its Shabbat's afternoon Tamid)
 */
export function currentMishmar(date, loc = TEMPLE_MOUNT) {
  const now = toDate(date), dn = dayOf(now);
  let sat = dn - mod(dn - 2, 7); // this week's Shabbat (day 2 = Saturday 1970-01-03)
  let weekStart = handover(sat, loc);
  if (now < weekStart) weekStart = handover((sat -= 7), loc);
  const index = mod((sat - ANCHOR_SHABBAT) / 7, 24) + 1;
  return { index, nameHe: MISHMAROT[index - 1], weekStart, note: MISHMAR_NOTE, noteHe: MISHMAR_NOTE_HE, status: 'draft' };
}
