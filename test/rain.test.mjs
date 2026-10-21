// Tests for src/weather.js (WORLD12, wave 12): the rain by the real Hebrew date. Run: node --test test/rain.test.mjs
// (add --table to print a year's months; the Hebrew dates come from calendar.js, itself tested against hebcal.com)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rainChance, dateHash, moonOf, eveningOf, nightOf, nightOfEvening, yearTable } from '../src/weather.js';
import { hebrewDate } from '../src/calendar.js';

const WINTER = ['Kislev', 'Tevet', 'Shevat'], ADAR = ['Adar', 'AdarI', 'AdarII'];
const share = (T, ms) => { let r = 0, n = 0; for (const m of ms) if (T.months[m]) { r += T.months[m].rain; n += T.months[m].nights; } return n ? r / n : 0; };

test('the rules: none from Pesach to after Shemini Atzeret, a third of winter, fewer in Adar and Nisan', () => {
  assert.equal(rainChance({ month: 'Nisan', day: 15 }), 0, 'Pesach');
  assert.equal(rainChance({ month: 'Iyar', day: 10 }), 0);
  assert.equal(rainChance({ month: 'Av', day: 9 }), 0);
  assert.equal(rainChance({ month: 'Elul', day: 29 }), 0);
  assert.equal(rainChance({ month: 'Tishrei', day: 15 }), 0, 'Sukkot');
  assert.equal(rainChance({ month: 'Tishrei', day: 22 }), 0, 'Shemini Atzeret');
  const early = rainChance({ month: 'Tishrei', day: 23 });
  assert.ok(early > 0 && early <= 0.1, 'after the festival: a small chance');
  assert.equal(rainChance({ month: 'Cheshvan', day: 7 }), early, 'until 7 Cheshvan (Taanit 1:3)');
  assert.ok(rainChance({ month: 'Cheshvan', day: 8 }) > early);
  for (const m of WINTER) assert.equal(rainChance({ month: m, day: 12 }), 0.35, m);
  for (const m of ADAR) assert.ok(rainChance({ month: m, day: 12 }) < 0.35 && rainChance({ month: m, day: 12 }) > 0, m);
  const nisan = rainChance({ month: 'Nisan', day: 5 });
  assert.ok(nisan > 0 && nisan < rainChance({ month: 'Adar', day: 5 }), 'Nisan before Pesach: fewer than Adar');
});

test('a whole Hebrew year, night by night (5787 and the nine after it)', () => {
  let wr = 0, wn = 0;
  for (let y = 5787; y <= 5796; y++) {
    const T = yearTable(y);
    assert.ok(T.nights.length >= 353 && T.nights.length <= 385, `${y}: ${T.nights.length} nights`);
    // never in the dry season, from Pesach through Shemini Atzeret
    for (const n of T.nights) {
      const dry = (n.month === 'Nisan' && n.day >= 15) || ['Iyar', 'Sivan', 'Tammuz', 'Av', 'Elul'].includes(n.month) || (n.month === 'Tishrei' && n.day <= 22);
      if (dry) assert.equal(n.rain, false, `${y} ${n.heb} (${n.civil})`);
    }
    const w = share(T, WINTER), a = share(T, ADAR), ni = share(T, ['Nisan']);
    assert.ok(w >= 0.22 && w <= 0.5, `${y}: winter ${Math.round(w * 100)}%`);
    assert.ok(a < w, `${y}: Adar ${Math.round(a * 100)}% < winter ${Math.round(w * 100)}%`);
    assert.ok(ni < w, `${y}: Nisan fewer than winter`);
    for (const m of WINTER) { wr += T.months[m].rain; wn += T.months[m].nights; }
    if (process.argv.includes('--table')) console.log(y, Object.entries(T.months).map(([m, v]) => `${m} ${v.rain}/${v.nights}`).join(' · '));
  }
  const avg = wr / wn;
  assert.ok(avg > 0.3 && avg < 0.4, `ten winters: ${Math.round(avg * 1000) / 10}% of the nights`);
});

test('the same night for everyone: a hash of the date, never flipped by a reload', () => {
  for (const c of ['2026-12-01', '2027-01-15', '2027-02-02']) {
    assert.deepEqual(nightOfEvening(c), nightOfEvening(c));
    assert.equal(dateHash(c), dateHash(c));
  }
  // neighbouring dates are unrelated (no long runs from a weak hash): the longest wet run of 5787's winter is short
  const T = yearTable(5787); let run = 0, best = 0;
  for (const n of T.nights) { run = n.rain ? run + 1 : 0; best = Math.max(best, run); }
  assert.ok(best <= 6, `longest run ${best}`);
});

test('a night belongs to its evening: after midnight it is still last night; the Hebrew day begins at sunset', () => {
  assert.equal(eveningOf(new Date(2026, 11, 10, 21, 0)), '2026-12-10');
  assert.equal(eveningOf(new Date(2026, 11, 11, 3, 0)), '2026-12-10');
  assert.equal(nightOf(new Date(2026, 11, 11, 3, 0)).civil, '2026-12-10');
  // the evening of 1 October 2026 begins Hoshana Rabbah, 21 Tishrei 5787 (1 Tishrei = 12 September 2026)
  const n = nightOfEvening('2026-10-01');
  assert.equal(n.month, 'Tishrei'); assert.equal(n.day, 21); assert.equal(n.rain, false);
  const h = hebrewDate(new Date(Date.UTC(2026, 9, 2, 12)));
  assert.equal(h.day, 21);
});

test('the forced date (the producer\'s hook)', () => {
  globalThis.__FORCE_DATE = '2027-01-05';
  try {
    assert.equal(nightOf(new Date(2026, 5, 1, 22)).civil, '2027-01-05');
    assert.equal(nightOf().civil, '2027-01-05');
  } finally { delete globalThis.__FORCE_DATE; }
  globalThis.__FORCE_DATE = 'nonsense';
  try { assert.notEqual(nightOf(new Date(2026, 5, 1, 22)).civil, 'nonsense'); } finally { delete globalThis.__FORCE_DATE; }
});

test('the moon by the Hebrew day: new on the 1st, full on the 15th', () => {
  assert.ok(moonOf(1).lit < 0.03);
  assert.ok(moonOf(15).lit > 0.99);
  assert.ok(moonOf(14).lit > 0.95);
  const q = moonOf(8); assert.ok(q.lit > 0.35 && q.lit < 0.65 && q.waxing);
  const w = moonOf(23); assert.ok(w.lit > 0.35 && w.lit < 0.65 && !w.waxing);
  assert.ok(moonOf(3).lit < 0.12 && moonOf(3).waxing, 'a thin crescent');
  // the evening of 25 October 2026 begins 15 Cheshvan: full
  assert.ok(nightOfEvening('2026-10-25').moon.lit > 0.99);
});

test('the producer\'s nights (Sukkot, 10 Cheshvan, 1 Tevet, 20 Nisan) and the wet nights of winter 5787', () => {
  const pick = (m, d) => yearTable(5787).nights.find((n) => n.month === m && n.day === d);
  const rows = [pick('Tishrei', 16), pick('Cheshvan', 10), pick('Tevet', 1), pick('Nisan', 20)];
  for (const n of rows) assert.ok(n, 'found');
  assert.equal(rows[0].rain, false); assert.equal(rows[3].rain, false);
  const wet = yearTable(5787).nights.filter((n) => n.rain && WINTER.includes(n.month)).slice(0, 6);
  assert.ok(wet.length >= 5);
  if (process.argv.includes('--table')) {
    for (const n of rows) console.log(`${n.civil} evening → ${n.heb}: ${n.rain ? 'rain' : 'dry'} (${Math.round(n.chance * 100)}%), moon ${Math.round(n.moon.lit * 100)}%`);
    console.log('wet:', wet.map((n) => `${n.civil} (${n.heb})`).join(', '));
  }
});
