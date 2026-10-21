// Tests for src/calendar.js. Run: node --test test/calendar.test.mjs
//
// External references (read on 2026-09-23 through WebFetch; only their published values are used here):
// - hebcal.com converter:      https://www.hebcal.com/converter?cfg=json&gy=Y&gm=M&gd=D&g2h=1
// - hebcal.com Israel holidays: https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&i=on&year=Y&month=x
// - USNO sun table (Temple Mount): https://aa.usno.navy.mil/api/rstt/oneday?date=D&coords=31.7781,35.2354&tz=Z
// - hebcal.com zmanim (Temple Mount, seconds):
//   https://www.hebcal.com/zmanim?cfg=json&latitude=31.7781&longitude=35.2354&tzid=Asia/Jerusalem&start=D&end=D&sec=1
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import {
  MISHMAROT, hebrewDate, hebrewDateAt, sunTimes, halachicHour, dayInfo, templeSchedule, nowInTemple,
  currentMishmar, isLeapYear, gematria,
} from '../src/calendar.js';

const MIN = 60e3, DAY = 864e5;
/** Hebrew geresh/gershayim from ASCII ' and " (so the test file cannot contain look-alike quotes). */
const H = (s) => s.replace(/"/g, '״').replace(/'/g, '׳');
/** A moment inside the Jerusalem civil date `ymd` (12:00 at +02:00 is 12:00 or 13:00 local time). */
const noon = (ymd) => new Date(`${ymd}T12:00:00+02:00`);
const plusDays = (ymd, n) => new Date(Date.parse(`${ymd}T00:00:00Z`) + n * DAY).toISOString().slice(0, 10);
const ids = (events) => events.map((e) => e.id);
const find = (events, id) => events.find((e) => e.id === id);
const clock = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', hour: '2-digit', minute: '2-digit', second: '2-digit' });
function near(actual, expected, toleranceMin, label) {
  const diff = Math.abs(actual - expected) / MIN;
  assert.ok(diff <= toleranceMin, `${label}: got ${clock.format(actual)}, expected ${clock.format(expected)} (Δ ${diff.toFixed(2)} min)`);
}
const same = (a, b, label) => assert.ok(Math.abs(a - b) <= 1, `${label}: ${a.toISOString()} vs ${b.toISOString()}`);

// ─── Hebrew dates ────────────────────────────────────────────────────────────────────────────────

test('hebrewDate matches hebcal.com for known days', () => {
  const cases = [
    // Gregorian     day  month     year  dayHe    hebcal says
    ['2026-09-12', 1, 'Tishrei', 5787, `א'`, 'Rosh Hashana 5787'],
    ['2026-09-21', 10, 'Tishrei', 5787, `י'`, 'Yom Kippur'],
    ['2026-09-26', 15, 'Tishrei', 5787, `ט"ו`, 'Sukkot I'],
    ['2027-04-22', 15, 'Nisan', 5787, `ט"ו`, 'Pesach I'],
    ['2027-03-23', 14, 'AdarII', 5787, `י"ד`, 'Purim, 14 Adar II (leap year)'],
    ['2024-03-24', 14, 'AdarII', 5784, `י"ד`, 'Purim, 14 Adar II (leap year)'],
    ['2026-03-03', 14, 'Adar', 5786, `י"ד`, 'Purim (common year)'],
    ['2015-04-03', 14, 'Nisan', 5775, `י"ד`, 'Erev Pesach on a Friday'],
    ['2025-04-12', 14, 'Nisan', 5785, `י"ד`, 'Erev Pesach on Shabbat'],
  ];
  for (const [g, day, month, year, dayHe, what] of cases) {
    const h = hebrewDate(noon(g));
    assert.deepEqual({ day: h.day, month: h.month, year: h.year, dayHe: h.dayHe }, { day, month, year, dayHe: H(dayHe) }, `${g}: ${what}`);
  }
  assert.deepEqual(hebrewDate(noon('2026-09-12')),
    { day: 1, month: 'Tishrei', monthHe: 'תשרי', year: 5787, isLeap: true, dayHe: H(`א'`), yearHe: H(`ה'תשפ"ז`) });
  const adar2 = hebrewDate(noon('2027-03-23'));
  assert.equal(adar2.monthHe, H(`אדר ב'`));
  assert.equal(adar2.isLeap, true);
  assert.equal(hebrewDate(noon('2027-02-08')).month, 'AdarI'); // hebcal: Rosh Chodesh Adar I, 7–8 Feb 2027
  assert.equal(hebrewDate(noon('2026-03-03')).isLeap, false);
  assert.equal(hebrewDate(noon('2026-09-23')).dayHe, H(`י"ב`));
  assert.equal(hebrewDate(noon('2026-09-27')).dayHe, H(`ט"ז`));
});

test('isLeapYear agrees with ICU (a year has Adar II exactly when it is leap), 5700–5900', () => {
  for (let gy = 1940; gy <= 2140; gy++) {
    let year = 0, hasAdarII = false;
    for (let d = 0; d < 60; d++) { // 10 Feb – 10 Apr always holds part of Adar II when there is one
      const h = hebrewDate(new Date(Date.UTC(gy, 1, 10 + d, 10)));
      year = h.year;
      if (h.month === 'AdarII') hasAdarII = true;
    }
    assert.equal(isLeapYear(year), hasAdarII, `Hebrew year ${year}`);
  }
});

test('gematria: geresh, gershayim, and 15/16 written ט״ו/ט״ז', () => {
  assert.equal(gematria(1), H(`א'`));
  assert.equal(gematria(12), H(`י"ב`));
  assert.equal(gematria(15), H(`ט"ו`));
  assert.equal(gematria(16), H(`ט"ז`));
  assert.equal(gematria(30), H(`ל'`));
  assert.equal(gematria(787), H(`תשפ"ז`));
});

test('hebrewDateAt: the Hebrew day begins at Jerusalem sunset', () => {
  const { sunset } = sunTimes(noon('2026-09-11')); // Erev Rosh Hashana 5787
  const before = hebrewDateAt(new Date(sunset - MIN)), after = hebrewDateAt(new Date(+sunset + MIN));
  assert.deepEqual([before.day, before.month, before.year], [29, 'Elul', 5786]);
  assert.deepEqual([after.day, after.month, after.year], [1, 'Tishrei', 5787]);
  assert.equal(hebrewDate(new Date(+sunset + MIN)).day, 29, 'hebrewDate stays on the civil day');
  assert.equal(hebrewDateAt(new Date('2026-09-12T01:30:00+03:00')).day, 1, 'after midnight');
});

// ─── Sun ─────────────────────────────────────────────────────────────────────────────────────────

const SUN = [
  // date, UTC offset, USNO rise / transit / set (hh:mm), hebcal rise / set / alot 16.1° / tzeit 8.5° (hh:mm:ss)
  ['2026-03-20', '+02:00', '05:43', '11:47', '17:50', '05:43:06', '17:50:25', '04:30:58', '18:26:33'],
  ['2026-06-21', '+03:00', '05:34', '12:41', '19:48', '05:34:03', '19:47:40', '04:06:18', '20:29:59'],
  ['2026-12-21', '+02:00', '06:35', '11:37', '16:39', '06:34:50', '16:39:19', '05:16:59', '17:19:04'],
];

test('sunTimes: Temple Mount within ±2 min of USNO and hebcal.com', () => {
  for (const [d, off, rise, transit, set, hRise, hSet, alot, tzeit] of SUN) {
    const s = sunTimes(new Date(`${d}T12:00:00${off}`));
    const t = (hms) => new Date(`${d}T${hms.length === 5 ? `${hms}:00` : hms}${off}`);
    near(s.sunrise, t(rise), 2, `${d} sunrise vs USNO`);
    near(s.solarNoon, t(transit), 2, `${d} solar noon vs USNO`);
    near(s.sunset, t(set), 2, `${d} sunset vs USNO`);
    near(s.sunrise, t(hRise), 1, `${d} sunrise vs hebcal`);
    near(s.sunset, t(hSet), 1, `${d} sunset vs hebcal`);
    near(s.alotHaShachar, t(alot), 2, `${d} alot 16.1° vs hebcal`);
    near(s.tzeit, t(tzeit), 2, `${d} tzeit 8.5° vs hebcal`);
  }
});

test('halachicHour: GR"A seasonal hours from sunrise to sunset', () => {
  const d = noon('2026-06-21'), s = sunTimes(d);
  same(halachicHour(d, 0), s.sunrise, 'hour 0');
  same(halachicHour(d, 12), s.sunset, 'hour 12');
  same(halachicHour(d, 8.5), new Date(+s.sunrise + (8.5 * (s.sunset - s.sunrise)) / 12), 'hour 8½');
  near(halachicHour(d, 6), s.solarNoon, 1, 'hour 6 ≈ solar noon');
});

// ─── The day ─────────────────────────────────────────────────────────────────────────────────────

test('dayInfo: Land-of-Israel festivals on the dates hebcal.com lists (Israel schedule)', () => {
  const cases = [
    ['2026-09-12', 'rosh-hashana', 1], ['2026-09-13', 'rosh-hashana', 2], ['2026-09-21', 'yom-kippur', 1],
    ['2026-09-26', 'sukkot', 1], ['2026-09-27', 'sukkot', 2], ['2026-10-02', 'sukkot', 7],
    ['2026-10-03', 'shemini-atzeret', 1], ['2026-12-05', 'chanukah', 1], ['2026-12-10', 'chanukah', 6],
    ['2026-12-12', 'chanukah', 8], ['2027-03-23', 'purim', 1], ['2027-03-24', 'shushan-purim', 1],
    ['2027-04-21', 'erev-pesach', 1], ['2027-04-22', 'pesach', 1], ['2027-04-23', 'pesach', 2],
    ['2027-04-28', 'pesach', 7], ['2027-06-11', 'shavuot', 1], ['2027-08-12', 'tisha-bav', 1],
  ];
  for (const [d, id, day] of cases) {
    const h = dayInfo(noon(d)).holiday;
    assert.deepEqual(h && [h.id, h.day], [id, day], d);
  }
  // 12 Tishrei, 3 Tevet (after Chanukah), 22 Nisan, 23 Tishrei (no second festival day in the Land)
  for (const d of ['2026-09-23', '2026-12-13', '2027-04-29', '2026-10-04']) assert.equal(dayInfo(noon(d)).holiday, null, d);

  const rh = dayInfo(noon('2026-09-12'));
  assert.deepEqual([rh.isShabbat, rh.isRoshChodesh, rh.hasMusaf], [true, true, true]);
  assert.deepEqual(rh.musafOf, ['שבת', 'ראש חודש', 'ראש השנה']); // 1 Tishrei: "מלבד עלת החדש" (Numbers 29:6)
  assert.equal(dayInfo(noon('2026-09-13')).isRoshChodesh, false);
  assert.equal(dayInfo(noon('2026-09-26')).sukkotDay, 1);
  assert.equal(dayInfo(noon('2026-10-02')).sukkotDay, 7);
  assert.equal(dayInfo(noon('2026-10-02')).holiday.nameHe, 'הושענא רבה');
  assert.equal(dayInfo(noon('2026-10-03')).sukkotDay, null);
  assert.equal(dayInfo(noon('2026-12-10')).isRoshChodesh, true); // 30 Kislev: Chanukah and Rosh Chodesh
  const weekday = dayInfo(noon('2026-09-23'));
  assert.deepEqual([weekday.isShabbat, weekday.isRoshChodesh, weekday.hasMusaf, weekday.omerDay, weekday.sukkotDay, weekday.specials],
    [false, false, false, null, null, []]);
});

test('dayInfo: the half-shekel announcement on 1 Adar, or 1 Adar II in a leap year (Shekalim 1:1)', () => {
  const announces = (d) => dayInfo(noon(d)).specials.some((s) => s.id === 'shekalim');
  assert.equal(announces('2026-02-18'), true); // 1 Adar 5786 (hebcal: Rosh Chodesh Adar 17–18 Feb)
  assert.equal(announces('2027-03-10'), true); // 1 Adar II 5787 (hebcal: Rosh Chodesh Adar II 9–10 Mar)
  assert.equal(announces('2027-02-08'), false); // 1 Adar I 5787
  assert.equal(announces('2027-03-09'), false); // 30 Adar I 5787
});

test('dayInfo.omerDay counts 1..49 from 16 Nisan to 5 Sivan', () => {
  const omer = (d) => dayInfo(noon(d)).omerDay;
  assert.equal(omer('2027-04-22'), null); // 15 Nisan
  for (let i = 0; i < 49; i++) assert.equal(omer(plusDays('2027-04-23', i)), i + 1);
  assert.equal(omer('2027-05-08'), 16); // 1 Iyar
  assert.equal(omer('2027-06-10'), 49); // 5 Sivan
  assert.equal(omer('2027-06-11'), null); // Shavuot
});

// ─── The service ─────────────────────────────────────────────────────────────────────────────────

const CORE = ['terumat-hadeshen', 'tamid-shachar', 'ketoret-shachar', 'birkat-kohanim', 'nesachim',
  'tamid-bein-haarbayim', 'ketoret-erev', 'hadlakat-haneirot', 'haktarat-halaila'];

test('templeSchedule: an ordinary weekday, in the order of the service', () => {
  const d = noon('2026-09-23'), ev = templeSchedule(d), s = sunTimes(d); // Wednesday 12 Tishrei 5787
  assert.deepEqual(ids(ev), ['terumat-hadeshen', 'payis', 'tamid-shachar', 'ketoret-shachar', 'birkat-kohanim',
    'nesachim', 'korbanot-yachid', 'tamid-bein-haarbayim', 'ketoret-erev', 'hadlakat-haneirot', 'haktarat-halaila']);
  assert.ok(find(ev, 'terumat-hadeshen').start < s.alotHaShachar, 'the altar is cleared before dawn');
  const tamid = find(ev, 'tamid-shachar');
  assert.ok(tamid.start > s.alotHaShachar && tamid.start < s.sunrise, 'the Tamid is slaughtered after first light, before sunrise');
  const pm = find(ev, 'tamid-bein-haarbayim');
  same(pm.start, halachicHour(d, 8.5), 'slaughtered at 8½ hours');
  same(pm.end, halachicHour(d, 9.5), 'offered at 9½ hours');
  assert.equal(pm.approx, undefined, 'fixed by the Mishnah, not estimated');
  assert.equal(+find(ev, 'korbanot-yachid').end, +pm.start);
  assert.equal(+find(ev, 'haktarat-halaila').start, +s.sunset);
  assert.equal(+find(ev, 'haktarat-halaila').end, +sunTimes(noon('2026-09-24')).alotHaShachar);
  assert.equal(find(ev, 'nesachim').psalm, 94); // Wednesday (Tamid 7:4)
});

test('templeSchedule: every day for a year is ordered and complete', () => {
  for (let i = 0; i < 366; i++) {
    const ymd = plusDays('2026-09-01', i), d = noon(ymd), ev = templeSchedule(d), info = dayInfo(d);
    ev.forEach((e, k) => {
      assert.ok(e.end > e.start, `${ymd} ${e.id}: end after start`);
      assert.ok(e.nameHe && e.source && e.status === 'draft', `${ymd} ${e.id}: name, source, draft`);
      if (k) assert.ok(e.start >= ev[k - 1].start, `${ymd}: ordered`);
    });
    assert.deepEqual(ids(ev).filter((x) => CORE.includes(x)), CORE, ymd);
    assert.equal(!!find(ev, 'musaf'), info.hasMusaf, `${ymd} musaf`);
    assert.equal(!!find(ev, 'lechem-hapanim'), info.isShabbat, `${ymd} showbread`);
  }
});

test('templeSchedule: Erev Pesach moves the afternoon Tamid (Mishnah Pesachim 5:1)', () => {
  const check = (ymd, slaughter, offer) => {
    const d = noon(ymd), ev = templeSchedule(d), pm = find(ev, 'tamid-bein-haarbayim');
    same(pm.start, halachicHour(d, slaughter), `${ymd} slaughtered at ${slaughter}`);
    same(pm.end, halachicHour(d, offer), `${ymd} offered at ${offer}`);
    const pesach = find(ev, 'korban-pesach');
    assert.ok(pesach.start >= find(ev, 'hadlakat-haneirot').end, 'after the ketoret and the lamps (Rambam, Korban Pesach 1:4)');
    assert.equal(+pesach.end, +sunTimes(d).sunset);
    return ev;
  };
  check('2027-04-21', 7.5, 8.5); // Wednesday: "בערבי פסחים נשחט בשבע ומחצה וקרב בשמונה ומחצה"
  check('2015-04-03', 6.5, 7.5); // Friday: "חל ערב פסח להיות בערב שבת, נשחט בשש ומחצה וקרב בשבע ומחצה"
  const shabbat = check('2025-04-12', 7.5, 8.5); // Shabbat: "בין בחול בין בשבת"
  assert.ok(find(shabbat, 'musaf') && find(shabbat, 'lechem-hapanim') && !find(shabbat, 'korbanot-yachid'));
  const friday = noon('2026-09-25'), ev = templeSchedule(friday); // an ordinary Friday keeps 8½ / 9½
  same(find(ev, 'tamid-bein-haarbayim').start, halachicHour(friday, 8.5), 'ordinary Friday');
  assert.equal(find(ev, 'korban-pesach'), undefined);
});

test('templeSchedule: Shabbat Musaf and showbread in Abaye\'s order, with no private offerings', () => {
  const ev = templeSchedule(noon('2026-09-19')); // Shabbat 8 Tishrei 5787
  const libations = find(ev, 'nesachim'), musaf = find(ev, 'musaf'), bread = find(ev, 'lechem-hapanim');
  assert.deepEqual(musaf.of, ['שבת']);
  assert.ok(musaf.start >= libations.end, 'ונסכין למוספין (Yoma 33a)');
  assert.ok(bread.start >= musaf.end, 'ומוספין לבזיכין (Yoma 33a)');
  assert.ok(bread.end <= find(ev, 'tamid-bein-haarbayim').start, 'ובזיכין לתמיד של בין הערבים');
  assert.equal(find(ev, 'korbanot-yachid'), undefined, 'Temurah 2:1');
  assert.equal(libations.psalm, 92);
  const rc = templeSchedule(noon('2026-10-12')); // Monday 1 Cheshvan 5787 (hebcal: Rosh Chodesh Cheshvan)
  assert.deepEqual(find(rc, 'musaf').of, ['ראש חודש']);
  assert.equal(find(rc, 'lechem-hapanim'), undefined);
  assert.equal(find(templeSchedule(noon('2026-09-23')), 'musaf'), undefined, 'no Musaf on a weekday');
});

test('templeSchedule: the altar is cleared at cock-crow, at midnight on Yom Kippur, at a third of the night on festivals (Yoma 1:8)', () => {
  const nightAt = (ymd, fraction) => {
    const dusk = sunTimes(noon(plusDays(ymd, -1))).sunset, dawn = sunTimes(noon(ymd)).sunrise;
    return new Date(+dusk + fraction * (dawn - dusk));
  };
  const clearing = (ymd) => find(templeSchedule(noon(ymd)), 'terumat-hadeshen');
  same(clearing('2026-09-21').start, nightAt('2026-09-21', 1 / 2), 'Yom Kippur: מחצות');
  same(clearing('2026-09-26').start, nightAt('2026-09-26', 1 / 3), 'Sukkot: מאשמורה הראשונה');
  same(clearing('2027-06-11').start, nightAt('2027-06-11', 1 / 3), 'Shavuot');
  const weekday = clearing('2026-09-23');
  assert.equal(weekday.approx, true);
  assert.ok(weekday.start > nightAt('2026-09-23', 1 / 2) && weekday.start < sunTimes(noon('2026-09-23')).alotHaShachar);
  const yk = templeSchedule(noon('2026-09-21'));
  assert.equal(find(yk, 'payis'), undefined);
  assert.equal(find(yk, 'korbanot-yachid'), undefined);
  assert.deepEqual(find(yk, 'musaf').of, ['יום הכיפורים']);
  assert.equal(find(templeSchedule(noon('2026-09-13')), 'korbanot-yachid'), undefined, 'Rosh Hashana: no vows on Yom Tov (Beitzah 19a)');
  assert.equal(find(templeSchedule(noon('2027-06-11')), 'korbanot-yachid').nameHe, 'קרבנות העולים לרגל');
});

test('templeSchedule: Sukkot water libation for 7 days; Simchat Beit HaShoevah on the nights, never on Shabbat', () => {
  for (let i = 0; i < 7; i++) assert.ok(find(templeSchedule(noon(plusDays('2026-09-26', i))), 'nisuch-hamayim'), `Sukkot day ${i + 1}`);
  assert.equal(find(templeSchedule(noon('2026-10-03')), 'nisuch-hamayim'), undefined, 'Shemini Atzeret');
  const sbh = (ymd) => find(templeSchedule(noon(ymd)), 'simchat-beit-hashoevah');
  assert.equal(sbh('2026-09-25'), undefined, 'eve of Sukkot');
  const first = sbh('2026-09-26'); // Shabbat 15 Tishrei, whose night is the 16th: "במוצאי יום טוב הראשון של חג"
  assert.ok(first.start > sunTimes(noon('2026-09-26')).sunset && first.end < sunTimes(noon('2026-09-27')).sunrise);
  for (const ymd of ['2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01']) assert.ok(sbh(ymd), ymd);
  assert.equal(sbh('2026-10-02'), undefined, 'the night of Shemini Atzeret');
  assert.equal(sbh('2025-10-10'), undefined, 'Friday 18 Tishrei 5786: that night is Shabbat');
  assert.ok(sbh('2025-10-11'), 'motzaei Shabbat 19 Tishrei 5786');
});

test('templeSchedule: the Omer is reaped at nightfall after the first day of Pesach (Menachot 10:3)', () => {
  const d = noon('2027-04-22'), omer = find(templeSchedule(d), 'omer');
  assert.equal(+omer.start, +sunTimes(d).tzeit);
  assert.equal(hebrewDateAt(new Date(+omer.start + MIN)).day, 16);
  assert.equal(find(templeSchedule(noon('2027-04-23')), 'omer'), undefined);
});

test('nowInTemple: the current event and the countdown to the next', () => {
  const pm = halachicHour(noon('2026-09-23'), 8.5);
  const r = nowInTemple(new Date(+pm - 42 * MIN));
  assert.equal(r.current.id, 'korbanot-yachid');
  assert.equal(r.next.event.id, 'tamid-bein-haarbayim');
  assert.equal(r.next.inMinutes, 42);
  assert.equal(r.next.textHe, 'עוד 42 דקות: תמיד של בין הערביים');
  assert.equal(nowInTemple(new Date(+pm - 125 * MIN)).next.textHe, 'עוד שעתיים ו־5 דקות: תמיד של בין הערביים');
  assert.equal(nowInTemple(new Date(+pm - 60 * MIN)).next.textHe, 'עוד שעה: תמיד של בין הערביים');
  assert.equal(nowInTemple(new Date(+pm - MIN)).next.textHe, 'עוד דקה: תמיד של בין הערביים');

  const late = nowInTemple(new Date('2026-09-23T23:30:00+03:00'));
  assert.equal(late.current.id, 'haktarat-halaila');
  assert.equal(late.next.event.id, 'terumat-hadeshen');
  assert.equal(dayInfo(late.next.event.start).hebrew.day, 13, "tomorrow's service");

  const sukkotNight = nowInTemple(new Date('2026-09-26T23:00:00+03:00'));
  assert.deepEqual(ids(sukkotNight.active), ['haktarat-halaila', 'simchat-beit-hashoevah', 'terumat-hadeshen']);
  assert.equal(sukkotNight.current.id, 'terumat-hadeshen');
});

// ─── Priestly watches ────────────────────────────────────────────────────────────────────────────

test('MISHMAROT: 24 watches in the order of I Chronicles 24:7–18', () => {
  assert.equal(MISHMAROT.length, 24);
  assert.equal(new Set(MISHMAROT).size, 24);
  assert.deepEqual([MISHMAROT[0], MISHMAROT[1], MISHMAROT[14], MISHMAROT[23]], ['יהויריב', 'ידעיה', 'בלגה', 'מעזיהו']);
});

test("currentMishmar: anchored on Ta'anit 29a (the watch of יהויריב at the destruction, 3830 / 70 CE)", () => {
  const m = currentMishmar(new Date('0070-08-03T12:00:00+02:00')); // Sunday, the day after Shabbat 9 Av 3830
  assert.equal(m.index, 1);
  assert.equal(m.nameHe, 'יהויריב');
  const h = hebrewDate(m.weekStart);
  assert.deepEqual([h.day, h.month, h.year, h.yearHe], [9, 'Av', 3830, H(`ג'תת"ל`)]);
  assert.equal(dayInfo(m.weekStart).isShabbat, true);
  assert.match(m.note, /Ta'anit 29a/);
  assert.match(m.note, /proleptic Gregorian/);
});

test('currentMishmar: next week = next watch, and the cycle closes after 24 weeks', () => {
  for (let i = 0; i < 400; i++) {
    const d = noon(plusDays('2026-01-01', i)); // before the Shabbat handover even on Saturdays
    const a = currentMishmar(d).index;
    assert.equal(currentMishmar(new Date(+d + 7 * DAY)).index, (a % 24) + 1, `week after ${d.toISOString()}`);
    assert.equal(currentMishmar(new Date(+d + 24 * 7 * DAY)).index, a);
  }
});

test('currentMishmar: the incoming watch takes over at the Shabbat afternoon Tamid (Sukkah 56b)', () => {
  const shabbat = noon('2026-09-19'), handover = halachicHour(shabbat, 8.5);
  const before = currentMishmar(new Date(+handover - MIN)), after = currentMishmar(new Date(+handover + MIN));
  assert.equal(after.index, (before.index % 24) + 1);
  same(after.weekStart, handover, 'weekStart');
  assert.equal(currentMishmar(noon('2026-09-23')).index, after.index, 'same watch on Wednesday');
  const erevPesach = noon('2025-04-12'), early = halachicHour(erevPesach, 7.5); // Shabbat Erev Pesach: 7½ hours
  same(currentMishmar(new Date(+early + MIN)).weekStart, early, 'Erev Pesach on Shabbat');
});

// ─── Content rule ────────────────────────────────────────────────────────────────────────────────

test('content rule: no Divine Name written in full (PROJECT.md §2.3)', () => {
  // Built from code points so that this file does not write the Names either.
  const names = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd],
    [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5e0, 0x5d5]].map((cp) => String.fromCodePoint(...cp));
  const texts = [
    readFileSync(new URL('../src/calendar.js', import.meta.url), 'utf8'),
    readFileSync(new URL(import.meta.url), 'utf8'),
    JSON.stringify([templeSchedule(noon('2027-04-21')), templeSchedule(noon('2026-09-26')), dayInfo(noon('2026-09-12')),
      currentMishmar(noon('2026-09-23')), nowInTemple(noon('2026-09-23'))]),
  ];
  for (const text of texts) for (const name of names) assert.ok(!text.includes(name), 'a Divine Name is written in full');
});
