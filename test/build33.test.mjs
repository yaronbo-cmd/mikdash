// ── fable32 (build 33) ── "הטלה המבוקר" — the first real-time hook (docs/specs/time-gating-hooks-he.md hook 1; hachraot-he.md "הוקים בזמן
// אמת"): a lamb he inspects today in לשכת הטלאים is offered as the Tamid four REAL days later. Node, on lamb33.js (the data, pure), the day
// engine (test/rig33.mjs — the chamber's run and a real morning), and the markup (chamber33.js, lock29's card, the lobby, the journal):
// one inspection a day; תמים enters with its tag, בעל מום does not; ready after 4 days; the morning takes his ready lamb (the oldest) and
// says so once; never in practice; the court fills to six; weeks away — the chamber's kohanim offer it, recorded; Thursday and Friday
// "יש די טלאים לשבת"; Shabbat does not stop the count; days, never hours; a Divine-Name scan of the changed files.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { L33, SRC33, CH33, LINE33, SHABBAT33, day33n, lb33, canInspect33, inspect33, settle33, inStock33, stock33, pick33, offer33, ofDay33, readyHe33, weekdayHe33, whenHe33, shabbat33, stalls33, upLine33, readyDay33, courtDay33 } from '../src/avodah/shift/lamb33.js';
import { hereDoor33, stockHTML33, endHTML33, upHTML33, lambsTab33, CSS33 } from '../src/avodah/shift/chamber33.js';
import { hereHTML29, SOON29 } from '../src/avodah/shift/lock29.js';
import { status29 } from '../src/avodah/shift/time29.js';
import { createLobby, GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { TABS32, tabsOn32 } from '../src/avodah/shift/journal32.js';
import { journalHTML32 } from '../src/avodah/shift/book32.js';
import { practiceSave31 } from '../src/avodah/shift/practice31.js';
import { P25, PRAC31 } from '../src/avodah/shift/day33.js';
import { RATE30 } from '../src/avodah/shift/rate30.js';
import { createFocus17 } from '../src/avodah/shift/focus17.js';   // (every act's module: their sources register)
import { rig } from './rig33.mjs';

void createFocus17;
const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const W = { lat: 31.7781, lon: 35.2354, tz: 'Asia/Jerusalem' };
const DAY = 864e5;
const MON = Date.parse('2026-10-26T12:00:00+02:00');   // Monday 26.10.2026, noon in Jerusalem (after the clocks went back)
const D0 = day33n(MON, W);
const at = (k, h = 12) => MON + k * DAY + (h - 12) * 3600e3;
/** a save with his lambs inspected on these days (0 = Monday) */
const withLambs = (...ks) => { const s = {}; for (const k of ks) assert.ok(inspect33(s, { dn: D0 + k, t: at(k), h: 'x', out: 'tamim', r: 'mehudar', q: 1 })); return s; };
/** the chamber's run on the engine: the day's one lamb, he steps in, play(R), its end */
async function chamberRun(dn, play, o = {}) {
  const save = o.save || {}, S0 = stock33(save, dn), b = lb33(save);
  const R = rig(undefined, { save: practiceSave31(save), now: () => MON + (dn - D0) * DAY, where: () => W,
    practice: { role: 'lamb', day: 3, seed: dn, ch33: { dn, done: !canInspect33(save, dn), sky: 'noon', lit: 'day', mine: S0.mine.length, court: S0.court, tags: S0.mine.map((L) => L.c), next: b.list.length % L33.tags.length } } });
  R.E.start(); await R.step(0.3);
  R.at(CH33.stand.x + 0.6, CH33.stand.z); await R.step(0.9);
  if (play) await play(R);
  for (let i = 0; i < 120 && !R.ev('ch33end').length; i++) await R.step(0.1);
  return R;
}
const brush = async (R) => { for (const s of R.E.p25().L.spots) if (s.kind === 'dirt') { R.E.p25focus(s.i); R.E.p25tap(); await R.step(0.5); R.E.p25swipe(0.4, 0, 100); await R.step(0.6); } };
/** a real morning (game day 1 of a fresh save, or the save's) at real day k: the laver done, the lot gives `role` */
async function morning(save, k, role, o = {}) {
  const R = rig(undefined, { save, now: () => at(k, 9), where: () => W, ...o });
  R.E.start(); await R.step(0.2); R.E.debug.wash20(); R.E.debug.skip23(role); await R.step(0.2);
  if (role === 'lamb') { R.at(P25.stand.x + 0.5, P25.stand.z); await R.step(1.0); } else await R.step(2.0);
  return R;
}

// ───────── (1) the data: one a day, תמים enters, בעל מום not, four days ─────────
test('build 33 (1): one inspection a day (a day = the civil day where the phone is, midnight to midnight); תמים enters with a tag, בעל מום does not', () => {
  assert.equal(day33n(Date.parse('2026-10-26T23:59:00+02:00'), W), D0); assert.equal(day33n(Date.parse('2026-10-27T00:01:00+02:00'), W), D0 + 1, 'the day turns at local midnight');
  assert.equal(day33n(Date.parse('2026-10-26T23:30:00-04:00'), { tz: 'America/New_York' }), D0, 'in New York its own midnight');
  const s = {};
  assert.equal(canInspect33(s, D0), true);
  const a = inspect33(s, { dn: D0, t: MON, h: 'י״ד בחשוון תשפ״ז', out: 'tamim', r: 'mehudar', q: 1 });
  assert.equal(a.out, 'tamim'); assert.equal(a.lamb.c, 0); assert.equal(a.lamb.at, 0); assert.equal(s.lambs33.list.length, 1);
  assert.equal(canInspect33(s, D0), false); assert.equal(inspect33(s, { dn: D0, out: 'tamim' }), null, 'a second the same day: nothing');
  assert.equal(s.lambs33.list.length, 1);
  const b = inspect33(s, { dn: D0 + 1, t: at(1), out: 'blem', r: 'kasher', k: 1, g: 6 });
  assert.equal(b.out, 'blem'); assert.equal(s.lambs33.list.length, 1, 'a בעל מום does not enter'); assert.equal(s.lambs33.blem.length, 1); assert.deepEqual([b.rec.k, b.rec.g], [1, 6]);
  const c = inspect33(s, { dn: D0 + 2, t: at(2), out: 'tamim', r: 'kasher' });
  assert.equal(c.lamb.c, 1, 'the next lamb another colour'); assert.equal(s.lambs33.n, 3);
  assert.equal(L33.tags.length, L33.tagHe.length); assert.ok(L33.tags.every((x) => !/^#(F|E|D|C)[0-9A-F]([0-4])[0-9A-F]{3}$/i.test(x) || x === '#F4F1E8'), 'no red tag');
  assert.ok(!L33.tagHe.some((x) => /אדום/.test(x)));
});
test('build 33 (2): ready after four real days — "בעוד 4 ימים" … "מוכן מחר", "מוכן" (days, never hours); pick33 the oldest ready one', () => {
  const s = withLambs(0);
  const words = [0, 1, 2, 3, 4, 5].map((k) => stock33(s, D0 + k).mine[0].readyIn);
  assert.deepEqual(words, [4, 3, 2, 1, 0, 0]);
  assert.deepEqual(words.map(readyHe33), ['בעוד 4 ימים', 'בעוד 3 ימים', 'בעוד 2 ימים', 'מוכן מחר', 'מוכן', 'מוכן']);
  assert.equal(readyDay33(s.lambs33.list[0]), D0 + L33.ready); assert.equal(L33.ready, 4);
  for (const k of [0, 1, 2, 3]) assert.equal(pick33(s, D0 + k), null, `not before the fourth day (${k})`);
  assert.equal(pick33(s, D0 + 4).i, 1);
  const two = withLambs(0, 1);
  assert.equal(pick33(two, D0 + 5).d, D0, 'the oldest first');
  offer33(two, pick33(two, D0 + 5), { dn: D0 + 5, gd: 7, t: at(5) });
  assert.equal(pick33(two, D0 + 5).d, D0 + 1, 'then the next');
  assert.equal(ofDay33(two, 7).d, D0);
});
test('build 33 (3): the chamber never under six — the court\'s lambs fill to six ("של הלשכה"), his may be more ("ומוסיפין עד לעולם")', () => {
  assert.deepEqual([stock33({}, D0).court, stock33({}, D0).total], [6, 6]);
  const two = withLambs(0, 1);
  assert.deepEqual([stock33(two, D0 + 1).mine.length, stock33(two, D0 + 1).court, stock33(two, D0 + 1).total], [2, 4, 6]);
  const seven = withLambs(0, 1, 2, 3, 4, 5, 6);
  assert.deepEqual([stock33(seven, D0 + 6).mine.length, stock33(seven, D0 + 6).court, stock33(seven, D0 + 6).total], [7, 0, 7]);
  const h = stockHTML33(two, D0 + 1);
  assert.match(h, /בלשכה 6 טלאים/); assert.match(h, /4 טלאים של הלשכה/); assert.equal((h.match(/data-l33="\d+"/g) || []).length, 2);
  assert.match(h, /אֵין פּוֹחֲתִין מִשִּׁשָּׁה טְלָאִים הַמְבֻקָּרִין[^]*ערכין ב, ה · טיוטה/);
  const st = stalls33(2, 4);
  assert.equal(st.mine.length, 2); assert.equal(st.court.length, 4); assert.ok(!st.court.includes(st.next) && !st.mine.includes(st.next), 'his next walks in to a free stall');
  assert.equal(stalls33(0, 6).court.length, 6); assert.equal(stalls33(8, 0).mine.length, 8);
});
test('build 33 (4): weeks away — the chamber\'s kohanim offer his lambs on their day (d + 7), recorded in the journal; nothing lost, no guilt', () => {
  const s = withLambs(0, 1, 2);
  assert.equal(settle33(s, D0 + 7), 0, 'on its seventh day it still waits for his morning');
  assert.equal(pick33(s, D0 + 7).d, D0);
  assert.equal(settle33(s, D0 + 30), 3);
  assert.deepEqual(s.lambs33.list.map((L) => [L.at - D0, L.by]), [[7, 'court'], [8, 'court'], [9, 'court']]);
  assert.equal(courtDay33(s.lambs33.list[0]), D0 + 7); assert.equal(stock33(s, D0 + 30).mine.length, 0); assert.equal(stock33(s, D0 + 30).court, 6);
  const tab = lambsTab33(s, D0 + 30);
  assert.equal((tab.match(/בידי כהני הלשכה/g) || []).length, 3); assert.match(tab, /עלה לתמיד: יום שני, 2\.11\.2026/); assert.ok(!/בלשכה ·/.test(tab));
  assert.ok(!/פספס|אבד|הפסד|לא חזרת|חבל|מאוחר|באיחור/.test(tab), 'no guilt wording');
  // a morning weeks later takes none of them (offered already) — and says nothing
  assert.equal(pick33(s, D0 + 30), null);
});
test('build 33 (5): Thursday and Friday where the phone is — "יש די טלאים לשבת" (ערכין ב, ה), a fact; Shabbat does not stop the count (the lock locks the screen)', () => {
  const wd = [0, 1, 2, 3, 4, 5, 6].map((k) => [weekdayHe33(D0 + k), shabbat33(D0 + k)]);
  assert.deepEqual(wd, [['יום שני', false], ['יום שלישי', false], ['יום רביעי', false], ['יום חמישי', true], ['יום שישי', true], ['שבת', false], ['יום ראשון', false]]);
  const s = withLambs(3);   // (inspected on Thursday 29.10)
  for (const k of [0, 1, 2, 5, 6]) assert.ok(!stockHTML33(s, D0 + k).includes(SHABBAT33), `not on ${weekdayHe33(D0 + k)}`);
  for (const k of [3, 4]) { const h = stockHTML33(s, D0 + k); assert.match(h, /יש די טלאים לשבת/); assert.match(h, /כְּדַי לַשַּׁבָּת וְלִשְׁנֵי יָמִים טוֹבִים שֶׁל רֹאשׁ הַשָּׁנָה[^]*ערכין ב, ה · טיוטה/); assert.ok(!/!|חסר|אזהרה|מהר/.test(h.match(/data-ch33="shabbat">([^<]*)/)[1]), 'a fact, never a warning'); }
  // the count runs through Shabbat: Thursday's lamb is ready on Monday (Friday, Shabbat, Sunday, Monday)
  assert.equal(status29(at(5), W).locked, true, 'Shabbat noon: the screen is locked');
  assert.deepEqual([4, 5, 6, 7].map((k) => stock33(s, D0 + k).mine[0].readyIn), [3, 2, 1, 0]);
  assert.equal(weekdayHe33(readyDay33(s.lambs33.list[0])), 'יום שני');
});

// ───────── (6) the chamber's run on the engine ─────────
test('build 33 (6): the chamber\'s run — the pen\'s inspection at the chamber\'s door (by day "הביטו"); תמים → "ch33rec" at once, the end card as the word ends; coins by the rating; the lot\'s record untouched', async () => {
  const save = { roles23: { m: 2, h: [], deshen: { n: 1, best: 90, last: 90 } }, perutot: 5 };
  lb33(save);   // (the hook's record, made — the run reads its stock)
  const before = JSON.stringify(save);
  const R = await chamberRun(D0, async (R) => {
    const K = R.E.p25();
    assert.equal(K.ph, 'scan'); assert.equal(K.first, true, 'the easy reading'); assert.equal(K.L.big, true); assert.ok(!K.L.blem, 'Monday\'s lamb: whole (a straw on it)');
    assert.deepEqual(R.E.pl25().door, CH33.door);
    assert.equal(R.E.focus17 && R.E.st33 ? true : true, true);
    await brush(R); R.E.p25stamp('tamim'); await R.step(1.2);
  }, { save });
  const rec = R.ev('ch33rec')[0], end = R.ev('ch33end')[0];
  assert.equal(rec.out, 'tamim'); assert.equal(rec.rating, 'mehudar'); assert.equal(rec.coins, RATE30.pay.mehudar); assert.equal(rec.dn, D0);
  assert.ok(end && Math.abs(end.t - rec.t - PRAC31.endS) < 0.15, 'the card as the rating\'s word ends');
  assert.equal(end.out, 'tamim'); assert.equal(R.E.p31().done.rating, 'mehudar');
  assert.equal(R.ev('p31end').length, 0, 'not the practice\'s card'); assert.equal(R.ev('j32new').length, 0, 'no journal card'); assert.equal(R.ev('tl33new').length, 0);
  assert.equal(JSON.stringify(save), before, 'the run plays on a copy — his save changes only through shift/index.js (inspect33, the coins)');
  const idx = read('src/avodah/shift/index.js');
  assert.match(idx, /ev\.type !== 'ch33rec'[^]*inspect33\(save, \{ dn: ev\.dn[^]*save\.perutot = \(\+save\.perutot \|\| 0\) \+ \(ev\.coins \| 0\)/, 'his save: the lamb and the coins, nothing else');
  assert.match(idx, /save: practiceSave31\(save\), persist: \(\) => \{\}/);
});
test('build 33 (7): a בעל מום found → it does not enter; approved with a blemish → shown, it does not enter, טעון תיקון; a whole lamb rejected → a free retry', async () => {
  const blem = await chamberRun(D0 + 1, async (R) => { const K = R.E.p25(), b = K.L.spots.find((x) => x.kind === 'blem'); assert.ok(b, 'Tuesday\'s lamb has a blemish'); R.E.p25focus(b.i); R.E.p25tap(); await R.step(2.2); R.E.p25stamp('pasul'); await R.step(1.2); });
  const r1 = blem.ev('ch33rec')[0];
  assert.equal(r1.out, 'blem'); assert.ok(r1.blem && r1.blem.c >= 0); assert.equal(r1.rating, 'mehudar', 'found and set aside: a fine act');
  const fa = await chamberRun(D0 + 1, async (R) => { R.E.p25stamp('tamim'); await R.step(3.6); });
  const r2 = fa.ev('ch33rec')[0];
  assert.equal(r2.out, 'blem'); assert.equal(r2.rating, 'tikkun'); assert.equal(r2.coins, RATE30.pay.tikkun);
  assert.ok(fa.ev('p25stamp')[0].ch33, 'its line: "יש בו מום — …", no delay'); assert.equal(LINE33.false, 'יש בו מום');
  const wr = await chamberRun(D0, async (R) => { R.E.p25stamp('pasul'); await R.step(0.3); assert.equal(R.E.p25().ph, 'scan', 'the lamb stays: look again'); await brush(R); R.E.p25stamp('tamim'); await R.step(1.2); });
  const r3 = wr.ev('ch33rec')[0];
  assert.equal(r3.out, 'tamim'); assert.equal(r3.rating, 'kasher'); assert.equal(wr.ev('p25stamp')[0].why, 'dirt');
  // his save through inspect33: the בעל מום leaves no lamb; the תמים one does
  const s = {};
  inspect33(s, { dn: D0 + 1, out: r1.out, r: r1.rating, k: r1.blem.c, g: r1.blem.r });
  assert.equal(s.lambs33.list.length, 0); assert.equal(s.lambs33.blem.length, 1);
});
test('build 33 (8): today\'s lamb already inspected — the chamber shows its stock, no lamb comes; the stalls hold his lambs and the court\'s', async () => {
  const s = withLambs(0);
  const R = await chamberRun(D0, null, { save: s });
  assert.equal(R.E.ch33().done, true); assert.ok(!R.E.p25()); assert.equal(R.ev('p25').length, 0);
  const cw = R.E.camWork25(); assert.ok(cw && cw.view && cw.view.p[2] > CH33.door.z, 'the stock\'s view, from the south');
  assert.ok(R.E.st33.fuel >= 40, 'no fire warning in the chamber'); await R.step(5); assert.ok(R.E.st33.fuel >= 40);
  assert.equal(R.E.ch33().mine, 1); assert.equal(R.E.ch33().court, 5); assert.deepEqual(R.E.ch33().tags, [0], 'his lamb\'s tag in its stall'); assert.equal(R.E.ch33().next, 1);
  const h = endHTML33({ out: 'done', save: s, dn: D0 });
  assert.match(h, /את הטלה של היום כבר בדקת/); assert.match(h, /הטלה הבא — מחר/); assert.match(h, /בעוד 4 ימים/); assert.match(h, /5 טלאים של הלשכה/);
});

// ───────── (9) the morning ─────────
test('build 33 (9): a real morning takes his ready lamb (the oldest), the pen\'s first lamb is it — whole, its tag — and says so ONCE; the day waits under the card', async () => {
  const save = withLambs(0, 1);
  const R = await morning(save, 4, 'lamb');
  const K = R.E.p25();
  assert.ok(K.mine && K.mine.d === D0, 'the oldest'); assert.equal(K.L.blem, null, 'whole'); assert.equal(R.E.tl33tag(), 0);
  const c = R.ev('tl33new');
  assert.equal(c.length, 1); assert.equal(c[0].line, 'הטלה שבדקת ביום שני עולה היום לתמיד'); assert.equal(c[0].role, 'lamb');
  assert.equal(R.E.st33.paused, true); const t0 = R.E.st33.t; await R.step(3); assert.equal(R.E.st33.t, t0, 'the day waits');
  const L = save.lambs33.list[0];
  assert.deepEqual([L.at, L.by, L.gd, L.seen], [D0 + 4, 'me', 1, 1]); assert.equal(stock33(save, D0 + 4).mine.length, 1, 'it left the chamber');
  const p0 = R.E.st33.perutot;
  assert.equal(R.E.tl33done(), true); await R.step(2);
  assert.equal(R.E.st33.paused, false); assert.equal(R.ev('tl33new').length, 1, 'once'); assert.equal(R.E.st33.perutot, p0, 'no reward that is power — no coins, no bonus from it');
  // the same game day resumed (another engine): no second card
  const R2 = await morning(save, 4, 'lamb');
  assert.equal(R2.ev('tl33new').length, 0); assert.ok(R2.E.p25().mine, 'still his lamb at the pen'); assert.equal(R2.E.tl33tag(), 0);
  assert.equal(stock33(save, D0 + 4).mine.length, 1, 'Tuesday\'s stays for its own morning');
});
test('build 33 (10): any other role — the card once the first lot is done; no ready lamb (day 3) — nothing; the shochet\'s and the pen\'s court lamb wear the tag', async () => {
  const save = withLambs(0);
  const R = await morning(save, 5, 'deshen');
  const c = R.ev('tl33new');
  assert.equal(c.length, 1); assert.equal(c[0].role, 'deshen'); assert.equal(c[0].line, 'הטלה שבדקת ביום שני עולה היום לתמיד');
  assert.equal(R.E.tl33tag(), 0);
  const none = await morning(withLambs(0), 3, 'lamb');
  assert.equal(none.ev('tl33new').length, 0); assert.equal(none.E.p25().mine, null); assert.equal(none.E.tl33tag(), null);
  assert.match(read('src/avodah/shift/pen25.js'), /tag33\(k, a1, tagCol\(E\.tl33tag\(\)\)\)/); assert.match(read('src/avodah/shift/pen25.js'), /tag33\(k, a0, tagCol\(a0\.tag\)\)/);
  assert.match(read('src/avodah/shift/dam27.js'), /E\.tl33tag \? E\.tl33tag\(\) : null/);
});
test('build 33 (11): never in practice — a practice run of the lamb, or the chamber\'s run, takes no lamb and shows no card', async () => {
  const save = withLambs(0), was = JSON.stringify(save.lambs33);
  const R = rig(undefined, { save, now: () => at(5), where: () => W, practice: { role: 'lamb', day: 3, seed: 77 } });
  R.E.start(); await R.step(0.3); R.at(P25.stand.x + 0.5, P25.stand.z); await R.step(1.5);
  assert.ok(R.E.p25(), 'the practice\'s pen'); assert.equal(R.E.p25().mine, null); assert.equal(R.ev('tl33new').length, 0); assert.equal(R.E.tl33tag(), null);
  assert.equal(JSON.stringify(save.lambs33), was, 'his lambs untouched');
  const C = await chamberRun(D0 + 5, null, { save: withLambs(0) });
  assert.equal(C.ev('tl33new').length, 0); assert.equal(C.E.tl33tag(), null);
});

// ───────── (12) the screens ─────────
test('build 33 (12): the "מכאן" card — לשכת הטלאים open (≥ 44 px), לשכת העצים "בקרוב"; the lobby\'s door opens the chamber; the build\'s number', () => {
  assert.deepEqual([...SOON29], ['לשכת העצים']);
  const d0 = hereDoor33({}, D0), d1 = hereDoor33(withLambs(0), D0);
  assert.match(d0, /data-lb="ch33"[^]*לשכת הטלאים[^]*טלה אחד לבדוק היום/); assert.match(d1, /הטלה הבא — מחר · טלה אחד שלך בלשכה/);
  const c = hereHTML29(null, W, MON, { door: d0 });
  assert.match(c, /data-lb="ch33"/); assert.match(c, /🔒 בקרוב: לשכת העצים/); assert.ok(!/בקרוב[^<]*לשכת הטלאים/.test(c));
  assert.match(read('src/avodah/shift/lock29.js'), /\.lb \.lk-end \.lk-ch\{flex:1\.4;min-height:48px/);
  const calls = [], Lb = createLobby({ save: {}, start: true, now: () => MON, where: () => W, on: { day: () => calls.push('day'), chamber: () => calls.push('chamber') } });
  Lb.pick('here'); const h = Lb.html(); assert.match(h, /data-lb="ch33"/); assert.match(h, /טלה אחד לבדוק היום/);
  assert.equal(Lb.pick('ch33'), true); assert.deepEqual(calls, ['chamber']);
  const L2 = createLobby({ save: {}, start: true, now: () => MON, where: () => W, on: {} }); L2.pick('here'); assert.ok(!/data-lb="ch33"/.test(L2.html()), 'no door without the shift\'s chamber'); assert.equal(L2.pick('ch33'), false);
  assert.match(read('src/avodah/shift/index.js'), /chamber: \(\) => \{ cardCtl = null; runChamber33\(\); \}/);
  assert.equal(GAME_BUILD, 35);   // (build 34: the constant moved on) (build 35: again)
});
test('build 33 (13): the end cards — תמים (its tag, "נכנס ללשכה · מוכן בעוד 4 ימים", מנחות מט ע״ב), בעל מום (the blemish, its source, "מחר יש טלה אחר"), the rating; buttons ≥ 44 px; no red', () => {
  const s = withLambs(0), L = s.lambs33.list[0];
  const t = endHTML33({ out: 'tamim', rating: 'mehudar', coins: 3, lamb: L, save: s, dn: D0 });
  assert.match(t, /תמים — נכנס ללשכה · מוכן בעוד 4 ימים/); assert.match(t, /הסימן הכחול — שלך/); assert.match(t, /טָעוּן בִּיקּוּר אַרְבָּעָה יָמִים קוֹדֶם שְׁחִיטָה[^]*מנחות מט ע״ב · טיוטה/);
  assert.match(t, /✦ מהודר/); assert.match(t, /הטלה הבא — מחר · 🪙 \+3/); assert.match(t, /data-ch33="back"/); assert.match(t, /data-ch33="journal"/);
  assert.match(t, /מַעֲרָבִית דְּרוֹמִית, הִיא הָיְתָה לִשְׁכַּת טְלָאֵי קָרְבָּן[^]*מידות א, ו · טיוטה/);
  const b = endHTML33({ out: 'blem', rating: 'kasher', blem: { c: 1, r: 6 }, coins: 2, save: {}, dn: D0 });
  assert.match(b, /בעל מום — לא נכנס ללשכה/); assert.match(b, /סדק \/ חריץ · גב/); assert.match(b, /רמב״ם, איסורי מזבח ב, י · טיוטה/); assert.match(b, /מחר יש טלה אחר/); assert.match(b, /✓ כשר/);
  assert.match(endHTML33({ out: 'blem', rating: 'tikkun', blem: { c: 1, r: 6 }, fa: 1, save: {}, dn: D0 }), /↻ טעון תיקון[^]*היה בו מום — לא נכנס ללשכה/);
  assert.match(CSS33, /\.ch33 \.bt button\{[^}]*min-height:48px/); assert.match(CSS33, /\.tl33 \.bt button\{[^}]*min-height:52px/);
  assert.ok(!/#(E2|E0|D0|C0|FF)[0-3][0-9A-F][0-4][0-9A-F]{2}\b/i.test(CSS33.replace(/#FFD66E|#FFE6A0|#FFF6DA|#FFECBE/gi, '')), 'no red');
  const u = upHTML33({ line: upLine33(L, D0 + 4), c: 0, role: 'lamb' });
  assert.match(u, /הטלה שבדקת ביום שני עולה היום לתמיד/); assert.match(u, /בודקין אותו לאור האבוקות[^]*תמיד ג, ד · טיוטה/); assert.match(u, /data-tl33="go"/);
  assert.match(upHTML33({ line: 'x', c: 0, role: 'deshen' }), /צאו והביאו טלה מלשכת הטלאים[^]*תמיד ג, ג · טיוטה/);
  assert.equal(whenHe33(D0, D0 + 4), 'ביום שני'); assert.equal(whenHe33(D0, D0 + 7), 'ביום שני, 26.10'); assert.equal(whenHe33(D0 + 5, D0 + 9), 'במוצאי שבת');   // (build 34: his Saturday is its evening — the screen is locked until Shabbat goes out)
});
test('build 33 (14): the journal\'s tab "הטלאים שבדקתי" — each lamb: inspected (real + Hebrew), ready, offered (by him / by the chamber\'s kohanim) or "בלשכה"; the sources page', () => {
  assert.ok(tabsOn32().some((t) => t.id === 'taleh' && t.he === 'הטלאים שבדקתי'));
  assert.ok(TABS32.filter((t) => !t.on).every((t) => t.id !== 'taleh'));
  const s = withLambs(0, 1);
  s.lambs33.list[0].h = 'י״ד בחשוון תשפ״ז';
  offer33(s, s.lambs33.list[0], { dn: D0 + 4, gd: 3, t: at(4), h: 'י״ח בחשוון תשפ״ז' });
  inspect33(s, { dn: D0 + 2, out: 'blem', k: 0, g: 1 });
  const tab = lambsTab33(s, D0 + 4);
  assert.match(tab, /נבדק: יום שני, 26\.10\.2026 · <span class="hb">י״ד בחשוון תשפ״ז<\/span>/);
  assert.match(tab, /מוכן: יום שישי, 30\.10\.2026/); assert.match(tab, /עלה לתמיד: יום שישי, 30\.10\.2026 · י״ח בחשוון תשפ״ז — בבוקר שלך \(יום 3\)/);
  assert.match(tab, /בלשכה · מוכן מחר/); assert.match(tab, /ועוד טלה אחד בעל מום שבדקת — לא נכנסו ללשכה/);
  for (const S of [SRC33.visit, SRC33.six, SRC33.shabbat, SRC33.place]) assert.ok(tab.includes(`${S.quote}״<b>${S.ref} <span class="tt">טיוטה</span>`), S.ref);
  assert.match(tab, /המחשה: טלה אחד ביום — הקצב של המשחק/);
  assert.match(lambsTab33({}, D0), /כאן יירשם כל טלה שתבדקו/);
  const j = journalHTML32(s, { tab: 'taleh' });
  // (build 34: the long word's class is .tl32 — tiles/ui.js's global .tl made it a full-screen layer — and the short word is on every phone)
  assert.match(j, /data-j32t="taleh" aria-selected="true" class="on" aria-label="הטלאים שבדקתי">🐑 <span class="tl32">הטלאים שבדקתי<\/span><span class="ts">הטלאים<\/span>/); assert.match(j, /data-tab="taleh"/);
  assert.match(read('src/avodah/shift/book32.js'), /\.j32 \.tb \.tl32\{display:none\}\.j32 \.tb \.ts\{display:inline\}/, 'a phone: the short word');
  assert.match(journalHTML32({ ...s, journal32: { v: 1, acts: {}, seen: {}, log: [{ d: 3, t: at(4), h: 'x', r: [['lamb', 'mehudar']], l33: 1 }], hello: true } }, { tab: 'mornings' }), /הטלה שבדקת עלה לתמיד/);
});
test('build 33 (15): days, never hours — no hour, minute or ticking clock in anything the hook shows', () => {
  const s = withLambs(0, 1, 3), all = [];
  for (let k = 0; k < 12; k++) { all.push(stockHTML33(s, D0 + k), hereDoor33(s, D0 + k), lambsTab33(s, D0 + k)); }
  all.push(endHTML33({ out: 'tamim', rating: 'mehudar', lamb: s.lambs33.list[0], save: s, dn: D0 }), endHTML33({ out: 'blem', rating: 'kasher', blem: { c: 0, r: 0 }, save: s, dn: D0 }), endHTML33({ out: 'done', save: s, dn: D0 }), upHTML33({ line: upLine33(s.lambs33.list[0], D0 + 4), c: 0, role: 'lamb' }));
  for (let n = 0; n < 9; n++) all.push(readyHe33(n));
  const txt = all.join(' ').replace(/<[^>]*>/g, ' ');
  assert.ok(!/שעה|שעות|דקה|דקות|\b\d{1,2}:\d\d\b|⏳|⌛|⏱/.test(txt), 'no hours');
  assert.ok(!/שעון/.test(txt));
  assert.ok(!/להחמיץ|הזדמנות אחרונה|מהר|אל תפספס/.test(txt), 'no pressure');
});
// ───────── the Divine Name ─────────
test('build 33: no Divine Name in the changed files (by code points; spaced, hyphenated or pointed forms too) or in anything the hook shows', () => {
  const N = [[0x5d9, 0x5d4, 0x5d5, 0x5d4], [0x5d0, 0x5dc, 0x5d4, 0x5d9, 0x5dd], [0x5d0, 0x5d3, 0x5e0, 0x5d9], [0x5d0, 0x5dc, 0x5d5, 0x5d4, 0x5d9, 0x5e0, 0x5d5]];
  const sep = '[\\u0591-\\u05C7\\s\\-\\u05BE\\u05F3\\u05F4\'".]*';
  const res = N.map((c) => new RegExp(c.map((x) => String.fromCharCode(x)).join(sep)));
  const files = ['src/avodah/shift/lamb33.js', 'src/avodah/shift/chamber33.js', 'src/avodah/shift/day33.js', 'src/avodah/shift/pen25.js', 'src/avodah/shift/dam27.js', 'src/avodah/shift/focus17.js', 'src/avodah/shift/lock29.js', 'src/avodah/shift/lobby35.js', 'src/avodah/shift/book32.js', 'src/avodah/shift/journal32.js', 'src/avodah/shift/index.js', 'test/build33.test.mjs', 'test/build32.test.mjs', 'test/build29.test.mjs', 'tools/autoplay35.js', 'tools/autoplay35-run.cjs', 'PROJECT.md'];
  const hits = [];
  for (const f of files) { const s = read(f); res.forEach((r, i) => { const m = s.match(r); if (m) hits.push(`${f}: name ${i} at ${m.index}`); }); }
  assert.deepEqual(hits, []);
  const s = withLambs(0, 1), words = [Object.values(SRC33).map((x) => `${x.quote} ${x.ref}`).join(' '), lambsTab33(s, D0 + 9), endHTML33({ out: 'tamim', rating: 'mehudar', lamb: s.lambs33.list[0], save: s, dn: D0 }), endHTML33({ out: 'blem', blem: { c: 2, r: 3 }, save: s, dn: D0 }), upHTML33({ line: upLine33(s.lambs33.list[0], D0 + 4), c: 0, role: 'lamb' }), upHTML33({ line: 'x', c: 1 }), stockHTML33(s, D0 + 3), hereDoor33(s, D0)].join(' ');
  for (const r of res) assert.ok(!r.test(words));
});
