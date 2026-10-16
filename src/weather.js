/* ─────────────────────────────────────────────────────────────────────────────
 * weather.js (WORLD12, wave 12): the nights of the building — which night it rains, and the moon's phase — by the real
 * Hebrew date. Pure, dependency-free except calendar.js (read only, AVODA12's). Node-testable (test/rain.test.mjs).
 *
 * The owner, 29.9: "ותמיד גשום בערב. זה נכון שירד גשם רק בלילה אבל לא כל לילה ירד גשם".
 *   - Rain only at night while the House was built: "וְהָיוּ יוֹרְדִין גְּשָׁמִים בַּלַּיְלָה…" (Bavli Taanit 23a); "it did not rain
 *     by day, but the showers fell in the nights" (Josephus, Ant. 15.425).
 *   - Which nights: the Land's rainy season. None from Pesach until after Shemini Atzeret (rain after Nisan is a curse,
 *     Mishnah Taanit 1:7; the request for rain starts after the festival, Taanit 1:1–3); a small chance until 7 Cheshvan
 *     (the day Rabban Gamliel sets for the request, Taanit 1:3); the winter (Kislev–Shevat) about a third of the nights;
 *     fewer in Adar and in Nisan before Pesach. The percentages are an illustration (⚑), not a record.
 *   - Each night is decided by a seeded hash of its date: every player sees the same night, a reload never flips it.
 *
 *   nightOf(date?)  → { civil:'YYYY-MM-DD', heb, day, month, rain, chance, moon:{ age, lit, waxing } }
 *   rainChance(heb) → 0…1 (heb: calendar.js hebrewDate's { day, month })
 *   moonOf(day)     → { age (days), lit (0…1), waxing }
 *   yearTable(year) → per-month counts of a Hebrew year's nights (the test, the producer)
 *   window.__FORCE_DATE = 'YYYY-MM-DD' (set before load): the evening of that civil date is the night shown.
 *
 * A night belongs to the civil evening it starts on (before noon it is still last night) and takes the Hebrew date that
 * begins at that sunset ("וַיְהִי עֶרֶב וַיְהִי בֹקֶר", Genesis 1:5).
 * ──────────────────────────────────────────────────────────────────────────── */
import { hebrewDate } from './calendar.js';

const DAY_MS = 86400000;
const pad = (n) => String(n).padStart(2, '0');
const isoOf = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const MONTH_HE = { Tishrei: 'תשרי', Cheshvan: 'חשון', Kislev: 'כסלו', Tevet: 'טבת', Shevat: 'שבט', Adar: 'אדר', AdarI: 'אדר א׳', AdarII: 'אדר ב׳', Nisan: 'ניסן', Iyar: 'אייר', Sivan: 'סיון', Tammuz: 'תמוז', Av: 'אב', Elul: 'אלול' };

/** the chance of rain on the night that begins Hebrew day `h` ({ day, month }) */
export function rainChance(h) {
  if (!h) return 0;
  const m = h.month, d = h.day;
  if (m === 'Tishrei') return d <= 22 ? 0 : 0.06;                    // through Shemini Atzeret: none; then a first shower now and then
  if (m === 'Cheshvan') return d <= 7 ? 0.06 : 0.2;                  // the request for rain from 7 Cheshvan (Taanit 1:3)
  if (m === 'Kislev' || m === 'Tevet' || m === 'Shevat') return 0.35; // the winter
  if (m === 'Adar' || m === 'AdarI' || m === 'AdarII') return 0.2;
  if (m === 'Nisan') return d < 15 ? 0.1 : 0;                        // from Pesach (15 Nisan): none
  return 0;                                                           // Iyar … Elul: the dry season
}

/** a seeded hash of a date string → 0…1 (FNV-1a, then an avalanche so neighbouring dates are unrelated) */
export function dateHash(s, salt = 'bh-rain-5787') {
  let h = 0x811c9dc5;
  const t = salt + ':' + s;
  for (let i = 0; i < t.length; i++) { h ^= t.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** does it rain on the night that begins Hebrew day `h` ({ year, month, day })? The nights of a month that share a chance
 *  form a group; its number of rainy nights is the chance × its nights, rounded by a hash of the month (so the months keep
 *  their shares: a winter month has 10–11 wet nights, Adar 5–6), and the wet ones are the nights whose date hashes lowest */
export function rainsOn(h) {
  const c = rainChance(h);
  if (!(c > 0)) return false;
  const days = []; for (let d = 1; d <= 30; d++) if (rainChance({ month: h.month, day: d }) === c) days.push(d);
  const k = Math.floor(c * days.length + dateHash(`${h.year}-${h.month}-${c}`, 'bh-rain-k'));
  if (k <= 0) return false;
  const u = (d) => dateHash(`${h.year}-${h.month}-${d}`);
  const me = u(h.day);
  let below = 0; for (const d of days) if (d !== h.day && u(d) < me) below++;
  return below < k;
}

/** the moon on the night that begins Hebrew day `day`: the month starts at the new moon, full on the 15th */
export function moonOf(day) {
  const SYN = 29.530589, age = Math.max(0, (+day || 1) - 0.25);
  return { age, lit: (1 - Math.cos(2 * Math.PI * age / SYN)) / 2, waxing: age < SYN / 2 };
}

/** the civil evening a moment belongs to (local clock: before noon it is still last night), or the forced date */
export function eveningOf(date) {
  const f = typeof globalThis !== 'undefined' ? globalThis.__FORCE_DATE : null;
  if (typeof f === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(f)) return f;
  const d = date instanceof Date ? date : new Date(date == null ? Date.now() : date);
  const e = d.getHours() < 12 ? new Date(d.getTime() - DAY_MS) : d;
  return isoOf(e.getFullYear(), e.getMonth() + 1, e.getDate());
}

/** the night that starts on the civil evening `civil` ('YYYY-MM-DD') */
export function nightOfEvening(civil) {
  const [y, m, d] = civil.split('-').map(Number);
  // the Hebrew day that begins at this sunset is the next civil day's (noon UTC of it is that day in Jerusalem)
  let heb = null;
  try { heb = hebrewDate(new Date(Date.UTC(y, m - 1, d + 1, 12))); } catch (e) { heb = null; }
  const chance = rainChance(heb);
  const rain = rainsOn(heb);
  const moon = moonOf(heb ? heb.day : 15);
  return {
    civil, rain, chance, moon,
    day: heb ? heb.day : 0, month: heb ? heb.month : '', year: heb ? heb.year : 0,
    heb: heb ? `${heb.dayHe} ${MONTH_HE[heb.month] || heb.monthHe}` : '',
  };
}

/** the night of a moment (default: now) */
export function nightOf(date) { return nightOfEvening(eveningOf(date)); }

/** every night of Hebrew year `year` (from the evening that begins 1 Tishrei): per-month rain counts, for the test and the producer */
export function yearTable(year) {
  // find the civil evening that begins 1 Tishrei of `year`: search around late September
  const g = year - 3761;
  let t = Date.UTC(g, 7, 25, 12);
  for (let i = 0; i < 60; i++, t += DAY_MS) { const h = hebrewDate(new Date(t)); if (h.month === 'Tishrei' && h.day === 1 && h.year === year) break; }
  const months = {}, nights = [];
  for (let i = 0; i < 390; i++) {
    const ev = new Date(t - DAY_MS + i * DAY_MS), civil = isoOf(ev.getUTCFullYear(), ev.getUTCMonth() + 1, ev.getUTCDate());
    const n = nightOfEvening(civil);
    if (n.year !== year) break;
    const M = months[n.month] || (months[n.month] = { nights: 0, rain: 0, chance: 0 });
    M.nights++; if (n.rain) M.rain++; M.chance += n.chance;
    nights.push(n);
  }
  return { year, months, nights };
}

// the page's hook (the producer, the tests): globalThis.__BH_WEATHER.night() · .of('YYYY-MM-DD')
if (typeof globalThis !== 'undefined' && typeof window !== 'undefined') {
  globalThis.__BH_WEATHER = { night: (d) => nightOf(d), of: (civil) => nightOfEvening(civil) };   // (yearTable: node only — the budget)
}
