/* ─────────────────────────────────────────────────────────────────────────────
 * schedule.js: calendar.js → the playable segments of the Temple day, their live windows, and the next
 * appointment. Pure: every function takes the instant `now` (a Date or ms); nothing reads the clock.
 *
 * Segments (ids): shachar (the morning Tamid, from the lifting of the ashes to the wine and the song),
 *   musaf (Shabbat / Rosh Chodesh / festivals), korbanot (the pilgrims' and private offerings), erev (the
 *   afternoon Tamid with the ketoret and the lamps), shoevah (Simchat Beit HaShoevah, Sukkot nights).
 * The clock times come from calendar.templeSchedule (the order is the Mishnah's; most minutes are estimates
 * and carry approx: true there).
 * ──────────────────────────────────────────────────────────────────────────── */
import { templeSchedule, nowInTemple, dayInfo, hebrewDateAt, sunTimes, currentMishmar, TEMPLE_MOUNT, DEPRESSION } from '../calendar.js';
import { musafOf, eventsOf, shirOf } from './data.js';

const MIN = 60e3, DAY = 864e5;
const T = (d) => (d instanceof Date ? d.getTime() : typeof d === 'number' ? d : Date.parse(d));
const find = (evs, id) => evs.find((e) => e.id === id) || null;

export const SEGMENTS = {
  shachar: { he: 'התמיד של שחר', short: 'תמיד של שחר' },
  musaf: { he: 'קרבן מוסף', short: 'מוסף' },
  korbanot: { he: 'קרבנות העולים לרגל', short: 'קרבנות' },
  erev: { he: 'התמיד של בין הערביים', short: 'בין הערביים' },
  shoevah: { he: 'שמחת בית השואבה', short: 'בית השואבה' },
};

/** Jerusalem civil date 'YYYY-MM-DD' of an instant. */
const civil = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit' });
export const jerusalemDay = (now) => civil.format(new Date(T(now)));
const clockFmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', hour12: false });
/** '05:52' in Jerusalem time. */
export const clockHe = (d) => clockFmt.format(new Date(T(d)));

/**
 * The playable segments of the Temple day of the Jerusalem civil date of `now`, with their windows.
 * @returns {{id, he, start: Date, end: Date, events: string[]}[]} ordered by start
 */
export function segmentsOf(date, loc = TEMPLE_MOUNT) {
  const evs = templeSchedule(new Date(T(date)), loc);
  const out = [];
  const seg = (id, start, end, events) => { if (start && end && end > start) out.push({ id, he: SEGMENTS[id].he, start, end, events }); };
  const td = find(evs, 'terumat-hadeshen'), nes = find(evs, 'nesachim'), water = find(evs, 'nisuch-hamayim');
  if (td && nes) seg('shachar', td.start, water && water.end > nes.end ? water.end : nes.end, ['terumat-hadeshen', 'payis', 'tamid-shachar', 'ketoret-shachar', 'birkat-kohanim', 'nesachim'].concat(water ? ['nisuch-hamayim'] : []));
  const musaf = find(evs, 'musaf');
  if (musaf) seg('musaf', musaf.start, musaf.end, ['musaf']);
  const ky = find(evs, 'korbanot-yachid');
  if (ky) seg('korbanot', ky.start, ky.end, ['korbanot-yachid']);
  const pm = find(evs, 'tamid-bein-haarbayim'), lamps = find(evs, 'hadlakat-haneirot');
  if (pm) seg('erev', pm.start, lamps ? lamps.end : pm.end, ['tamid-bein-haarbayim', 'ketoret-erev', 'hadlakat-haneirot']);
  const sh = find(evs, 'simchat-beit-hashoevah');
  if (sh) seg('shoevah', sh.start, sh.end, ['simchat-beit-hashoevah']);
  return out.sort((a, b) => a.start - b.start);
}

/** Segments of yesterday, today and tomorrow (Jerusalem), for "now" and "next". */
function around(now, loc) {
  const t = T(now);
  return [t - DAY, t, t + DAY].flatMap((x) => segmentsOf(x, loc)).sort((a, b) => a.start - b.start);
}

/** 'בעוד 2:14' (h:mm) or 'בעוד 42 דק׳'. */
export function inHe(ms) {
  const m = Math.max(0, Math.ceil(ms / MIN));
  if (m < 60) return `בעוד ${m} דק׳`;
  const h = Math.floor(m / 60), r = m % 60;
  return `בעוד ${h}:${String(r).padStart(2, '0')}`;
}
/** 'היום ב-05:52' / 'מחר ב-05:52' / a weekday name. */
export function whenHe(date, now) {
  const a = jerusalemDay(now), b = jerusalemDay(date);
  const d = Math.round((Date.parse(b) - Date.parse(a)) / DAY);
  const at = `ב-${clockHe(date)}`;
  if (d === 0) return `היום ${at}`;
  if (d === 1) return `מחר ${at}`;
  return `${['ביום ראשון', 'ביום שני', 'ביום שלישי', 'ביום רביעי', 'ביום חמישי', 'ביום שישי', 'בשבת'][new Date(T(date) + 3 * 3600e3).getUTCDay()]} ${at}`;
}

/**
 * Live status: which segment is live now, what the Temple is doing, and the next appointment.
 * @returns {{live: object|null, current: object|null, next: {seg, id, he, start: Date, inMs, textHe, whenHe}|null,
 *   barkai: Date|null}}
 */
export function liveStatus(now, loc = TEMPLE_MOUNT) {
  const t = T(now), segs = around(t, loc);
  const live = segs.find((s) => s.start <= t && t < s.end) || null;
  const nxt = segs.find((s) => s.start > t) || null;
  let cur = null;
  try { cur = nowInTemple(new Date(t), loc).current; } catch (e) { cur = null; }
  const next = nxt ? {
    seg: nxt.id, id: nxt.id, he: nxt.he, start: nxt.start, inMs: nxt.start - t,
    textHe: `${nxt.he} ${inHe(nxt.start - t)}`, whenHe: `${nxt.he} ${whenHe(nxt.start, t)}`,
  } : null;
  return { live, current: cur, next, barkai: barkaiOf(t, loc), segments: segs };
}

/** The next "האיר פני כל המזרח" (calendar.js: the sun 12° below the horizon; our estimate) after `now`. */
export function barkaiOf(now, loc = TEMPLE_MOUNT) {
  const t = T(now);
  for (const d of [t, t + DAY]) {
    const evs = templeSchedule(new Date(d), loc), ts = find(evs, 'tamid-shachar');
    if (ts && ts.start > t) return ts.start;
  }
  return null;
}

/** The sky of the world by the real Jerusalem sun: night · dawn (alot → an hour after sunrise) · noon · dusk (the last
 *  ninety minutes before sunset → tzeit) · night. */
export function skyOf(now, loc = TEMPLE_MOUNT) {
  const t = T(now), s = sunTimes(new Date(t), loc), H = 3600e3;
  if (!s.alotHaShachar || !s.tzeit) return 'noon';
  if (t < +s.alotHaShachar || t >= +s.tzeit) return 'night';
  if (t < +s.sunrise + H) return 'dawn';
  if (t >= +s.sunset - 1.5 * H) return 'dusk';
  return 'noon';
}
/** Where the camera looks for each event of calendar.templeSchedule (places.SHOTS keys, or {p, t}). */
export const EVENT_SHOT = {
  'terumat-hadeshen': 'keveshWide', payis: { p: [0, 75, -12], t: [-81, 22, 64] }, 'tamid-shachar': 'slaughterWide', 'ketoret-shachar': 'houseWide',
  'birkat-kohanim': 'ulamSteps', nesachim: 'altarWide', 'nisuch-hamayim': 'altarWide', musaf: 'altarWide', 'lechem-hapanim': 'houseWide',
  'korbanot-yachid': 'slaughterWide', 'tamid-bein-haarbayim': 'slaughterWide', 'ketoret-erev': 'houseWide', 'hadlakat-haneirot': 'houseWide',
  'haktarat-halaila': 'altarWide', 'simchat-beit-hashoevah': { p: [200, 60, 60], t: [75, 20, 0] }, 'korban-pesach': 'slaughterWide', omer: 'altarWide',
};

/** The home on a narrow portrait phone: its panel covers two thirds of the screen and the world is seen only in the strip
 * above it (main.js shifts the view into that strip at the same scale), so the camera stands about three times farther
 * than in EVENT_SHOT to show the place in its setting. Measured at 390×844 (2026-09-26): the altar with its fire and the
 * rings; the Gazit with the altar and the Ulam behind; the Ulam's doors with the vine. */
const HOME_ALTAR = { p: [68.8, 150.4, 196.4], t: [-40, 16, -34] };   // slaughterWide ×3.2: the altar, its fire, the rings north of it
const HOME_HOUSE = { p: [101.2, 63.2, 105.6], t: [-86, 44, 0] };     // houseWide ×2.4: the Ulam's doors and the golden vine
const HOME_GAZIT = { p: [178.2, 191.6, -179.2], t: [-81, 22, 64] };  // the Gazit, with the altar and the Ulam behind it
const HOME_ULAM = { p: [30.8, 42.8, 70.4], t: [-78, 30, 0] };        // ulamSteps ×3.2: the Ulam steps from the court
export const EVENT_SHOT_TALL = {
  'terumat-hadeshen': HOME_ALTAR, payis: HOME_GAZIT, 'tamid-shachar': HOME_ALTAR, 'ketoret-shachar': HOME_HOUSE,
  'birkat-kohanim': HOME_ULAM, nesachim: HOME_ALTAR, 'nisuch-hamayim': HOME_ALTAR, musaf: HOME_ALTAR, 'lechem-hapanim': HOME_HOUSE,
  'korbanot-yachid': HOME_ALTAR, 'tamid-bein-haarbayim': HOME_ALTAR, 'ketoret-erev': HOME_HOUSE, 'hadlakat-haneirot': HOME_HOUSE,
  'haktarat-halaila': HOME_ALTAR, 'simchat-beit-hashoevah': { p: [200, 60, 60], t: [75, 20, 0] }, 'korban-pesach': HOME_ALTAR, omer: HOME_ALTAR,
};

/** The dawn of the Jerusalem civil date of `now`, for the ברקאי mini-game: alot → east lit → sunrise. */
export function dawnOf(now, loc = TEMPLE_MOUNT) {
  const s = sunTimes(new Date(T(now)), loc), evs = templeSchedule(new Date(T(now)), loc), ts = find(evs, 'tamid-shachar');
  return { alot: s.alotHaShachar, lit: ts ? ts.start : null, sunrise: s.sunrise, depression: DEPRESSION.eastLit };
}

const REST = new Set(['rosh-hashana', 'yom-kippur', 'shemini-atzeret', 'shavuot']);
/** Shabbat and Yom Tov (Jerusalem calendar) never break a streak. key: 'YYYY-MM-DD'. */
export function isRestDay(key) {
  try {
    const i = dayInfo(new Date(key + 'T12:00:00+03:00'));
    if (i.isShabbat) return true;
    const h = i.holiday;
    if (!h) return false;
    return REST.has(h.id) || ((h.id === 'sukkot' || h.id === 'pesach') && (h.day === 1 || (h.id === 'pesach' && h.day === 7)));
  } catch (e) { return false; }
}

/**
 * What kind of day it is for the service — the HEBREW day at `now` (it begins at Jerusalem sunset, so from
 * Friday evening 25.9.2026 it is Sukkot). The Tamid's psalm is the weekday's (Tamid 7:4).
 */
export function dayTheme(now, loc = TEMPLE_MOUNT) {
  const t = T(now);
  const civilInfo = dayInfo(new Date(t));
  let heb, info;
  try {
    heb = hebrewDateAt(new Date(t), loc);
    // after sunset the Hebrew date is tomorrow's: take tomorrow's day info
    info = heb.day === civilInfo.hebrew.day && heb.month === civilInfo.hebrew.month ? civilInfo : dayInfo(new Date(t + DAY));
  } catch (e) { heb = civilInfo.hebrew; info = civilInfo; }
  const evening = info !== civilInfo;
  const musaf = musafOf(info), events = eventsOf(info);
  const hol = info.holiday;
  const kind = hol && ['sukkot', 'pesach', 'shavuot', 'shemini-atzeret', 'rosh-hashana', 'yom-kippur'].includes(hol.id) ? 'festival'
    : info.isShabbat ? 'shabbat' : info.isRoshChodesh ? 'rosh_chodesh' : 'weekday';
  const labels = [];
  if (hol) labels.push(hol.nameHe);
  if (info.isShabbat) labels.push('שבת');
  if (info.isRoshChodesh && !(hol && hol.id === 'rosh-hashana')) labels.push('ראש חודש');
  // Simchat Beit HaShoevah: tonight's (or the current) night from calendar.js, never on Shabbat or Yom Tov nights
  const shoevah = around(t, loc).find((s) => s.id === 'shoevah' && s.end > t && s.start - t < DAY) || null;
  // "לולב וערבה, ששה ושבעה … סכה ונסוך המים, שבעה" (Sukkah 4:1): the water every day, Shabbat too; the aravah not on
  // Shabbat unless it is the seventh day (Sukkah 4:3)
  const sukkot = info.sukkotDay ? {
    day: info.sukkotDay, water: true, aravot: !info.isShabbat || info.sukkotDay === 7,
    bulls: (musaf.find((m) => /^sukkot_/.test(m.day_id)) || {}).bulls || 0,
    shoevah, shoevahNow: !!(shoevah && shoevah.start <= t),
  } : null;
  let mishmar = null;
  try { mishmar = currentMishmar(new Date(t), loc); } catch (e) { mishmar = null; }
  return {
    kind, evening, info, hebrew: heb, labelHe: labels.join(' · ') || ['יום ראשון', 'יום שני', 'יום שלישי', 'יום רביעי', 'יום חמישי', 'יום שישי', 'שבת'][info.weekday],
    dateHe: `${heb.dayHe} ${heb.monthHe} ${heb.yearHe}`, psalm: shirOf(info.weekday), musaf, events, sukkot, mishmar,
  };
}

/** Total bulls of the seven days of Sukkot, from the content (13 + 12 + … + 7). */
export function sukkotBullsTotal(musafList) {
  return (musafList || []).filter((m) => /^sukkot_\d$/.test(m.day_id)).reduce((a, m) => a + (m.bulls || 0), 0);
}
