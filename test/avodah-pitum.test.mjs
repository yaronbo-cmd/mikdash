// ── service13 ── (wave 13) פיטום הקטורת and the pens: the content, the store, the day's animals. Run: node --test test/avodah-pitum.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { SPICES, SPICE_WORDS, PITUM_LINES, KETORET_YEAR, KETORET, ketoretItem, needOf, needHe, cardsFor, GAMES, hasDivineName, isDraft } from '../src/avodah/data.js';
import * as S from '../src/avodah/state.js';
import { dayInfo } from '../src/calendar.js';

const info = (key) => dayInfo(new Date(key + 'T12:00:00+03:00'));

test('the eleven spices in the baraita\'s order and weights (כריתות ו ע״א): 4×70 + 4×16 + 12 + 3 + 9 = 368', () => {
  assert.equal(SPICES.length, 11);
  assert.deepEqual(SPICES.map((s) => s.manah), [70, 70, 70, 70, 16, 16, 16, 16, 12, 3, 9]);
  assert.deepEqual(SPICES.map((s) => s.label), ['צרי', 'ציפורן', 'חלבנה', 'לבונה', 'מור', 'קציעה', 'שיבולת נרד', 'כרכום', 'קושט', 'קילופה', 'קנמון']);
  assert.equal(SPICES.reduce((a, s) => a + s.manah, 0), KETORET_YEAR.manim);
  assert.equal(KETORET_YEAR.days + KETORET_YEAR.yk, KETORET_YEAR.manim);
  assert.equal(KETORET_YEAR.am + KETORET_YEAR.pm, 1);
});

test('each group\'s words are the verified baraita\'s (the content file\'s quote holds them, word for word)', () => {
  const q = ketoretItem('ketoret_spices').quote;
  for (const g of ['g70', 'g16', 'kosht', 'kilufah', 'kinamon']) assert.ok(q.includes(SPICE_WORDS[g]), g);
  assert.ok(SPICE_WORDS.g70.includes('שבעים של שבעים מנה'));
  assert.ok(SPICE_WORDS.g16.includes('ששה עשר של ששה עשר מנה'));
  // the chant and its reasons: the Bavli's words, and the Yerushalmi's "שהקול יפה לבשמים" (not "מפני שהקול", the siddur's)
  assert.equal(PITUM_LINES.chant.quote, 'וכשהוא שוחק אומר הדק היטב היטב הדק');
  assert.match(PITUM_LINES.chant.source, /כריתות ו ע״ב/);
  assert.equal(PITUM_LINES.why.quote, 'כשם שהדיבור רע ליין כן הדיבור יפה לבשמים');
  assert.match(PITUM_LINES.whyY.source, /ירושלמי יומא ד, ה/);
  assert.ok(!Object.values(PITUM_LINES).some((l) => /מפני שהקול/.test(l.quote)));
  assert.equal(PITUM_LINES.day.quote, 'פרס בשחרית ופרס בין הערבים');
  assert.match(PITUM_LINES.six.quote, /כְּדַי לַשַּׁבָּת וְלִשְׁנֵי יָמִים טוֹבִים שֶׁל רֹאשׁ הַשָּׁנָה/);
});

test('no Divine Name anywhere in the new lines, cards or game files; every line is a draft with a source', () => {
  for (const [k, l] of Object.entries(PITUM_LINES)) { assert.ok(!hasDivineName(l.quote), k); assert.ok(l.source, k); assert.equal(l.status, 'draft'); }
  for (const w of Object.values(SPICE_WORDS)) assert.ok(!hasDivineName(w));
  for (const c of [...cardsFor('pitum'), ...cardsFor('dir')]) { assert.ok(!hasDivineName(`${c.title} ${c.summary} ${c.quote}`), c.id); assert.ok(c.draft && c.source, c.id); }
  for (const f of ['pitum.js', 'dir.js']) assert.ok(!hasDivineName(readFileSync(new URL(`../src/avodah/minigames/${f}`, import.meta.url), 'utf8')), f);
  for (const it of Object.values(KETORET)) assert.ok(isDraft(it));
});

test('the cards after the games: the eleven, the chant, the 368, Beit Avtinas; the pens: the six lambs (ערכין ב, ה)', () => {
  const p = cardsFor('pitum').map((c) => c.id);
  assert.deepEqual(p, ['ketoret_spices', 'grinding_chant', 'ketoret_total', 'beit_avtinas', 'chelbenah_lesson']);
  assert.ok(ketoretItem('chelbenah_lesson').quote.includes(PITUM_LINES.chelbenah.quote.replace('שהרי ', '')));
  assert.ok(cardsFor('dir').some((c) => c.id === 'six_lambs' && /ערכין ב, ה/.test(c.source)));
  assert.equal(GAMES.pitum.he, 'פיטום הקטורת');
  assert.deepEqual(GAMES.pitum.steps, []);   // the forty of ספר העבודה stay as they are
});

test('the store: a batch is the year\'s 368; ½ in the morning and ½ in the evening, once a day each; never below 0, never above a year', () => {
  const A = S.migrate({});
  assert.equal(S.pitumManim(A), 0);
  // an empty store never stops the service: the half is "used" (the Temple burns its own), nothing is taken from him
  assert.deepEqual(S.pitumUse(A, '2026-09-30', 'am'), { used: true, fromStore: false, manim: 0 });
  assert.equal(S.pitumManim(A), 0);
  const add = S.pitumAdd(A, '2026-09-30');
  assert.equal(add.added, 368); assert.equal(add.manim, 368); assert.equal(add.full, true);
  assert.equal(S.pitumUse(A, '2026-10-01', 'am').manim, 367.5);
  assert.equal(S.pitumUse(A, '2026-10-01', 'am').used, false);   // the morning's once a day
  assert.equal(S.pitumUse(A, '2026-10-01', 'pm').manim, 367);
  assert.equal(S.pitumAdd(A, '2026-10-01').added, 1);             // up to one year's store
  assert.equal(S.pitumManim(A), 368);
  // a save survives a reload (migrate), and an old save without it gets an empty store
  const B = S.migrate(JSON.parse(JSON.stringify(A)));
  assert.equal(S.pitumManim(B), 368); assert.equal(B.pitum.batches, 2);
  const C = S.migrate({ pitum: { half: -5, used: 'x' } });
  assert.equal(S.pitumManim(C), 0); assert.deepEqual(C.pitum.used, {});
});

test('the pens: tending only adds; a day not tended costs nothing', () => {
  const A = S.migrate({});
  assert.equal(S.dirToday(A, '2026-09-30'), null);
  S.dirTend(A, '2026-09-30', { w: 1, f: 1, n: 2 });
  S.dirTend(A, '2026-09-30', { n: 1 });
  assert.deepEqual(S.dirToday(A, '2026-09-30'), { w: 1, f: 1, n: 3 });
  assert.equal(A.dir.checked, 3);
  assert.equal(S.dirToday(A, '2026-10-01'), null);   // nothing is lost for the day after
  const B = S.migrate(JSON.parse(JSON.stringify(A)));
  assert.equal(B.dir.checked, 3);
});

test('the day\'s animals from the calendar: the two tamid lambs, Shabbat, Rosh Chodesh, Sukkot\'s bulls 13 → 7', () => {
  const tue = needOf(info('2026-10-06'));   // 25 Tishrei, a Tuesday
  assert.deepEqual([tue.lambs, tue.bulls, tue.rams, tue.goats, tue.tamid], [2, 0, 0, 0, 2]);
  assert.equal(needHe(tue), '2 כבשי תמיד');
  const sat = needOf(info('2026-10-10'));   // Shabbat 29 Tishrei
  assert.deepEqual([sat.lambs, sat.bulls, sat.musafLambs], [4, 0, 2]);
  const rc = needOf(info('2026-10-11'));    // 30 Tishrei, Rosh Chodesh Cheshvan
  assert.deepEqual([rc.bulls, rc.rams, rc.musafLambs, rc.goats, rc.lambs], [2, 1, 7, 1, 9]);
  // Sukkot 5787: 15 Tishrei = Shabbat 26.9.2026 … 21 Tishrei = Friday 2.10.2026
  const days = ['2026-09-26', '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30', '2026-10-01', '2026-10-02'];
  assert.deepEqual(days.map((d) => needOf(info(d)).bulls), [13, 12, 11, 10, 9, 8, 7]);
  const d6 = needOf(info('2026-10-01'));
  assert.equal(needHe(d6), '2 כבשי תמיד · מוסף: 8 פרים, 2 אילים, 14 כבשים, שעיר');
  assert.equal(needOf(info('2026-09-26')).musafLambs, 16);   // the first day on Shabbat: 14 + Shabbat's 2
});
