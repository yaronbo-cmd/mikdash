// Tests for src/avodah/schedule.js and src/avodah/data.js. Run: node --test test/avodah-schedule.test.mjs
// Fixed dates (Jerusalem): Wed 23.9.2026 = 12 Tishrei (weekday), Fri 25.9.2026 = 14 Tishrei (Erev Sukkot),
// Sat 26.9.2026 = 15 Tishrei (Shabbat + Sukkot I), Mon 28.9.2026 = 17 Tishrei (Chol HaMoed),
// Sat 17.10.2026 = 6 Cheshvan (a plain Shabbat), Mon 12.10.2026 = 1 Cheshvan (Rosh Chodesh).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as SC from '../src/avodah/schedule.js';
import * as D from '../src/avodah/data.js';
import { templeSchedule } from '../src/calendar.js';

const at = (s) => new Date(s);
const ids = (segs) => segs.map((s) => s.id);

test('weekday (12 Tishrei, Wednesday): shachar, private offerings, afternoon Tamid; the psalm of the 4th day', () => {
  const segs = SC.segmentsOf(at('2026-09-23T12:00:00+03:00'));
  assert.deepEqual(ids(segs), ['shachar', 'korbanot', 'erev']);
  for (let i = 1; i < segs.length; i++) assert.ok(segs[i].start >= segs[i - 1].start);
  const th = SC.dayTheme(at('2026-09-23T10:00:00+03:00'));
  assert.equal(th.kind, 'weekday');
  assert.equal(th.psalm.psalm, 94);
  assert.deepEqual(th.musaf, []);
  assert.equal(th.sukkot, null);
});

test('Friday noon (14 Tishrei, Erev Sukkot) is still a weekday; from sunset it is Sukkot and Shabbat', () => {
  const noon = SC.dayTheme(at('2026-09-25T12:00:00+03:00'));
  assert.equal(noon.kind, 'weekday');
  assert.equal(noon.psalm.psalm, 93);
  assert.equal(noon.hebrew.day, 14);
  const eve = SC.dayTheme(at('2026-09-25T20:00:00+03:00'));
  assert.equal(eve.evening, true);
  assert.equal(eve.kind, 'festival');
  assert.equal(eve.hebrew.day, 15);
  assert.match(eve.labelHe, /סוכות/);
  assert.match(eve.labelHe, /שבת/);
  assert.deepEqual(eve.musaf.map((m) => m.day_id), ['shabbat', 'sukkot_1']);   // התדיר קודם (Zevachim 10:1)
  assert.equal(eve.sukkot.day, 1);
  assert.equal(eve.sukkot.bulls, 13);
  assert.ok(eve.events.some((e) => e.id === 'nisuch_hamayim'));
  assert.ok(eve.events.some((e) => e.id === 'lechem_hapanim'));
  assert.equal(eve.psalm.psalm, 92);                                              // the Tamid on Shabbat
  // the aravah does not override Shabbat (Sukkah 4:1, 4:3); the water libation does
  assert.equal(eve.sukkot.aravot, false);
  assert.equal(eve.sukkot.water, true);
  // no Simchat Beit HaShoevah on the night of Yom Tov / Shabbat: the next one is on Saturday night
  assert.ok(eve.sukkot.shoevah);
  assert.equal(eve.sukkot.shoevahNow, false);
  assert.ok(eve.sukkot.shoevah.start > at('2026-09-26T17:00:00+03:00'));
});

test('15 Tishrei (Shabbat, Sukkot I): the altar is cleared from the first watch; musaf; no private offerings; Beit HaShoevah that night', () => {
  const segs = SC.segmentsOf(at('2026-09-26T12:00:00+03:00'));
  assert.deepEqual(ids(segs), ['shachar', 'musaf', 'erev', 'shoevah']);
  const sh = segs[0];
  assert.ok(sh.start < at('2026-09-26T00:00:00+03:00'), 'terumat hadeshen begins before midnight on a festival (Yoma 1:8)');
  assert.ok(sh.events.includes('nisuch-hamayim'));
  const live = SC.liveStatus(at('2026-09-26T01:00:00+03:00'));
  assert.equal(live.live && live.live.id, 'shachar');
});

test('Chol HaMoed (17 Tishrei, Monday): musaf with 11 bulls, pilgrims, Beit HaShoevah at night', () => {
  const segs = SC.segmentsOf(at('2026-09-28T12:00:00+03:00'));
  assert.deepEqual(ids(segs), ['shachar', 'musaf', 'korbanot', 'erev', 'shoevah']);
  const th = SC.dayTheme(at('2026-09-28T09:00:00+03:00'));
  assert.equal(th.sukkot.day, 3);
  assert.equal(th.sukkot.bulls, 11);
  assert.equal(th.sukkot.aravot, true);
  assert.equal(th.psalm.psalm, 48);
  const night = SC.liveStatus(at('2026-09-28T21:00:00+03:00'));
  assert.equal(night.live && night.live.id, 'shoevah');
});

test('a plain Shabbat (6 Cheshvan): musaf of Shabbat, showbread, psalm 92, no private offerings', () => {
  const th = SC.dayTheme(at('2026-10-17T10:00:00+03:00'));
  assert.equal(th.kind, 'shabbat');
  assert.deepEqual(th.musaf.map((m) => m.day_id), ['shabbat']);
  assert.ok(th.events.some((e) => e.id === 'lechem_hapanim'));
  assert.equal(th.psalm.psalm, 92);
  assert.deepEqual(ids(SC.segmentsOf(at('2026-10-17T12:00:00+03:00'))), ['shachar', 'musaf', 'erev']);
});

test('Rosh Chodesh (1 Cheshvan, Monday): musaf of Rosh Chodesh (2 bulls, 1 ram, 7 lambs, 1 goat)', () => {
  const th = SC.dayTheme(at('2026-10-12T10:00:00+03:00'));
  assert.equal(th.kind, 'rosh_chodesh');
  assert.equal(th.musaf.length, 1);
  const m = th.musaf[0];
  assert.deepEqual([m.bulls, m.rams, m.lambs, m.goats], [2, 1, 7, 1]);
  assert.ok(ids(SC.segmentsOf(at('2026-10-12T12:00:00+03:00'))).includes('musaf'));
});

test('live status: the next appointment is always given, with a countdown', () => {
  const noon = SC.liveStatus(at('2026-09-23T12:00:00+03:00'));
  assert.equal(noon.live.id, 'korbanot');
  assert.equal(noon.next.id, 'erev');
  assert.match(noon.next.textHe, /^התמיד של בין הערביים בעוד \d+:\d\d$/);
  assert.match(noon.next.whenHe, /היום ב-\d\d:\d\d/);
  const late = SC.liveStatus(at('2026-09-23T22:00:00+03:00'));
  assert.equal(late.live, null);
  assert.equal(late.next.id, 'shachar');
  assert.match(late.next.whenHe, /מחר ב-0\d:\d\d/);
  assert.ok(late.barkai > at('2026-09-24T04:00:00+03:00') && late.barkai < at('2026-09-24T07:00:00+03:00'));
});

test('dawn: alot < "the east is lit" (ברקאי) < sunrise', () => {
  const d = SC.dawnOf(at('2026-09-25T12:00:00+03:00'));
  assert.ok(d.alot < d.lit && d.lit < d.sunrise);
});

test('rest days: Shabbat and Yom Tov (never break the streak); Chol HaMoed is not', () => {
  assert.equal(SC.isRestDay('2026-09-26'), true);
  assert.equal(SC.isRestDay('2026-09-28'), false);
  assert.equal(SC.isRestDay('2026-09-21'), true);     // Yom Kippur
  assert.equal(SC.isRestDay('2026-09-24'), false);
});

test('skyOf: the sky of the world by the real Jerusalem sun; every calendar event has a camera place', () => {
  assert.equal(SC.skyOf(at('2026-09-25T12:00:00+03:00')), 'noon');
  assert.equal(SC.skyOf(at('2026-09-25T20:00:00+03:00')), 'night');
  assert.equal(SC.skyOf(at('2026-09-25T06:00:00+03:00')), 'dawn');
  assert.equal(SC.skyOf(at('2026-09-25T17:45:00+03:00')), 'dusk');
  assert.equal(SC.skyOf(at('2026-09-25T03:00:00+03:00')), 'night');
  for (const d of ['2026-09-23', '2026-09-26', '2026-09-28']) for (const e of templeSchedule(at(d + 'T12:00:00+03:00'))) assert.ok(SC.EVENT_SHOT[e.id], e.id);
});

test('inHe / whenHe formatting', () => {
  assert.equal(SC.inHe(42 * 60e3), 'בעוד 42 דק׳');
  assert.equal(SC.inHe((2 * 60 + 14) * 60e3), 'בעוד 2:14');
  assert.match(SC.whenHe(at('2026-09-24T05:52:00+03:00'), at('2026-09-23T22:00:00+03:00')), /^מחר ב-05:52$/);
});

test('Sukkot: the seven days bring 70 bulls (13 … 7), from the content', () => {
  assert.equal(SC.sukkotBullsTotal(D.MUSAF), 70);
});

test('data: 40 steps, 13 roles, 9 carriers, the morning chain covers the Mishnah in order', () => {
  assert.equal(D.STEPS.length, 40);
  assert.equal(D.ROLES.length, 13);
  assert.equal(D.CARRIERS.length, 9);
  assert.equal(D.CARRIERS[8].short, 'יין');
  // every book step is taught by exactly one game
  const taught = Object.values(D.GAMES).flatMap((g) => g.steps);
  assert.equal(new Set(taught).size, taught.length);
  assert.equal(taught.length, 40);
  for (const s of D.STEPS) assert.ok(taught.includes(s.id), s.id);
  // the morning chain follows the Mishnah's order of steps
  const orders = D.SHACHAR.flatMap((g) => D.GAMES[g].steps).map((id) => D.step(id).order);
  for (let i = 1; i < orders.length; i++) assert.ok(orders[i] > orders[i - 1], `order breaks at ${i}`);
});

test('data: every card is a draft with a source; fallbacks too; no Divine Name in any content text', () => {
  for (const g of Object.keys(D.GAMES)) for (const c of D.cardsFor(g)) {
    assert.equal(c.draft, true, c.id);
    assert.ok(c.source, c.id);
  }
  const all = JSON.stringify([D.STEPS, D.KORBANOT, D.MUSAF, D.EVENTS, D.SHIR, D.MEMUNIM, D.FALLBACK, D.BLEMISHES, D.ROLES, D.CARRIERS]);
  assert.equal(D.hasDivineName(all), false);
  assert.equal(D.hasDivineName(['\u05D9', '\u05D4', '\u05D5', '\u05D4'].join('')), true);   // (built at run time: never written in full)
  assert.equal(D.hasDivineName(['\u05D0', '\u05DC', '\u05D4', '\u05D9', '\u05DD'].join('')), true);
  assert.equal(D.hasDivineName('ה׳ מלך'), false);
  assert.equal(D.hasDivineName('יהודה ויהויריב'), false);
});

test('data: blemishes include the Mishnah\'s own "not a blemish" cases', () => {
  assert.ok(D.BLEMISHES.some((b) => b.blemish === false && b.part === 'ear'));
  assert.ok(D.BLEMISHES.every((b) => b.source && b.quote));
  assert.deepEqual(D.WOODS.filter((w) => !w.ok).map((w) => w.id).sort(), ['olive', 'vine']);
});
