// Phase B hooks (src/avodah/hooks): pure rules. node --test test/hooks-avodah.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import * as HB from '../src/avodah/hooks/index.js';
import * as S from '../src/avodah/state.js';
import { hasDivineName, SHACHAR } from '../src/avodah/data.js';
import { dayTheme, isRestDay } from '../src/avodah/schedule.js';

const T0 = Date.parse('2026-09-25T09:00:00+03:00');
const fresh = () => { const A = S.fresh(T0, 'ptest'); A.mishmar = 8; HB.norm(A); return A; };
const lots = (o) => ({ day: '2026-09-25', deshen: false, role: 'zorek', ketoret: false, evarim: false, ...o });

test('norm: the hooks part of the save survives a save/load round trip', () => {
  const A = fresh();
  A.hk.perf.zerika = 2; A.hk.vessels['מזרק'] = '2026-09-25';
  const mem = new Map(), store = { get: (k) => mem.get(k) || null, set: (k, v) => { mem.set(k, v); return true; } };
  S.save(A, store, T0);
  const B = S.load(store, T0).A; HB.norm(B);
  assert.equal(B.hk.perf.zerika, 2);
  assert.equal(B.hk.vessels['מזרק'], '2026-09-25');
});

test('the daily ritual: the payis reveal, the role\'s own work, the ketoret when it is his, the song', () => {
  const A = fresh();
  assert.deepEqual(HB.mineList(A, lots()), ['payis2', 'zerika', 'shir']);
  assert.deepEqual(HB.mineList(A, lots({ role: 'dishun-menorah', deshen: true })), ['payis2', 'deshen', 'heichal', 'shir']);
  assert.deepEqual(HB.mineList(A, lots({ role: 'kerayim', ketoret: true })), ['payis2', 'evarim', 'payis3', 'ketoret', 'shir']);
  A.ketoret.done = true;
  assert.deepEqual(HB.mineList(A, lots({ role: 'kerayim', ketoret: true })), ['payis2', 'evarim', 'shir'], 'the ketoret once in a lifetime');
  // the reveal once a day: played today → not again
  A.games.payis2 = { n: 1, t: T0, live: false, best: 0 };
  assert.deepEqual(HB.mineList(A, lots()), ['zerika', 'shir']);
  // the song closes the ritual unless he already sang it today (a live morning's tail)
  const B = fresh(); B.games.shir = { n: 1, t: T0, live: true, best: 0 };
  assert.deepEqual(HB.mineList(B, lots()), ['payis2', 'zerika']);
  // every role leads to a real mini-game
  for (const r of S.ROLE_IDS) { const l = HB.mineList(fresh(), lots({ role: r })); assert.ok(l.length >= 2 && l.length <= 6, r); }
});

test('repeat pacing: a game seen before gets the short walk-in; the same day counts a little', () => {
  const A = fresh();
  assert.equal(HB.seenBefore(A, 'zerika'), false);
  assert.equal(HB.stageCap(A, 'zerika'), HB.PACE.stageFirst);
  S.learn(A, 'zerika', ['shechita', 'blood'], { now: T0 });
  assert.equal(HB.seenBefore(A, 'zerika'), true);
  assert.ok(HB.stageCap(A, 'zerika') < HB.PACE.stageFirst && HB.afterCap(A, 'zerika') < HB.PACE.afterFirst);
  assert.equal(HB.playedToday(A, 'zerika', '2026-09-25'), true);
  assert.equal(HB.playedToday(A, 'zerika', '2026-09-26'), false);
  const r = S.learn(A, 'zerika', ['shechita', 'blood'], { now: T0, live: true, forReal: true, perfect: true, again: true });
  assert.equal(r.points, S.POINTS.again, 'a same-day repeat: practice, a little');
});

test('ranks: the first morning meets two ממונים, not five; the ladder is long', () => {
  assert.equal(S.RANKS.length, 15);
  for (let i = 1; i < S.RANKS.length; i++) assert.ok(S.RANKS[i] > S.RANKS[i - 1]);
  assert.equal(S.rankOf(370).rank, 2, 'a first full morning (~370 points)');
  assert.ok(S.rankOf(370 + 270 * 5).rank <= 6, 'a regular\'s first week: about six');
  assert.ok(S.RANKS[14] >= 20 * 270, 'the fifteenth takes weeks, not days');
});

test('one ממונה card per service (several met → one card, the rest folded)', () => {
  const toCard = (m) => ({ title: m.name_he, source: m.source, draft: true });
  assert.equal(HB.memunimCard(2, 2, toCard), null);
  const one = HB.memunimCard(0, 1, toCard);
  assert.match(one.kicker, /פגשת ממונה · 1\/15/);
  const three = HB.memunimCard(0, 3, toCard);
  assert.equal(three.cards.length, 3);
  assert.match(three.kicker, /פגשת ממונה/);
});

test('mastery tiers: למד → מיומן → בקי → מומחה; a mistake never lowers a tier', () => {
  const A = fresh();
  assert.equal(HB.tierOf(A, 'barkai'), 0);
  const play = (perfect) => { HB.beforeGame(A, 'barkai'); S.learn(A, 'barkai', ['dawn_check'], { now: T0 }); return HB.afterGame(A, 'barkai', { perfect, skipped: false }, '2026-09-25'); };
  assert.equal(play(false).tierUp, 1);
  play(false);
  assert.equal(play(true).tierUp, 2, 'three plays, one clean');
  for (let i = 0; i < 3; i++) play(false);
  assert.equal(HB.tierOf(A, 'barkai'), 2, 'seven plays but one clean: still מיומן');
  assert.match(HB.tierNextHe(A, 'barkai'), /בלי טעויות/);
  play(true); play(true);
  assert.equal(HB.tierOf(A, 'barkai'), 3);
});

test('vessels: collected from the steps played, each with its source (content/tamid.json)', () => {
  assert.ok(HB.VESSELS.length >= 20, `${HB.VESSELS.length} vessels`);
  for (const v of HB.VESSELS) { assert.ok(v.source, v.he); assert.ok(!/יין|עצים/.test(v.he), v.he); }
  const A = fresh();
  const got = HB.collectVessels(A, 'deshen', '2026-09-25').map((v) => v.he);
  assert.ok(got.includes('מחתת כסף') && got.includes('הכיור'), got.join(','));
  assert.equal(HB.collectVessels(A, 'deshen', '2026-09-26').length, 0, 'once each');
  assert.ok(HB.vesselsCount(A) >= 2);
  const all = new Set(); for (const g of SHACHAR) HB.collectVessels(A, g, 'x');
  assert.ok(HB.vesselsCount(A) >= HB.VESSELS.length - 4, 'the morning service holds nearly all of them');
});

test('streak: Shabbat and Yom Tov never count; one missed weekday a week is covered by itself, a second one is not', () => {
  const A = fresh();
  const g = (last, d) => HB.graceCovers(A, last, d, isRestDay);
  S.touchStreak(A, '2026-09-27', isRestDay, g);             // Sunday (Chol HaMoed)
  assert.equal(S.touchStreak(A, '2026-09-29', isRestDay, g).n, 2, 'Monday missed: covered');
  assert.equal(S.touchStreak(A, '2026-10-01', isRestDay, g).n, 1, 'Wednesday missed the same week: reset');
  const B = fresh();
  S.touchStreak(B, '2026-09-25', isRestDay, (l, d) => HB.graceCovers(B, l, d, isRestDay));   // Friday
  assert.equal(S.touchStreak(B, '2026-09-27', isRestDay, (l, d) => HB.graceCovers(B, l, d, isRestDay)).n, 2, 'Shabbat + Yom Tov between: no cover needed');
  assert.equal(B.hk.grace, '', 'the cover was not spent');
  // without a grace function the old rule holds (state tests)
  const C = fresh();
  S.touchStreak(C, '2026-09-27', isRestDay);
  assert.equal(S.touchStreak(C, '2026-09-29', isRestDay).n, 1);
});

test('Sukkot: the bulls 13 → 7 (70), the mishmarot, the seven days; tomorrow\'s line; no Divine Name', () => {
  assert.equal(HB.BULLS.reduce((a, b) => a + b, 0), 70);
  const th = dayTheme(Date.parse('2026-09-28T09:00:00+03:00'));
  assert.ok(th.sukkot && th.sukkot.day === 3, JSON.stringify(th.sukkot && th.sukkot.day));
  const A = fresh();
  assert.equal(HB.festMark(A, th, '2026-09-28'), 1);
  // the first day (26.9: Shabbat and Yom Tov) counts by itself: 2 of 7 on the third day
  assert.equal(HB.festCount(A, th, { day: '2026-09-28', isRest: isRestDay }), 2);
  // Friday evening 25.9 after sunset: the first day of the festival (and Shabbat) → it counts
  const eve = dayTheme(Date.parse('2026-09-25T20:00:00+03:00'));
  assert.ok(eve.evening && eve.sukkot.day === 1);
  assert.equal(HB.festCount(fresh(), eve, { day: '2026-09-25', isRest: isRestDay }), 1);
  const html = HB.sukkotHTML(th, A, { mishmarHe: 'חזיר' });
  assert.match(html, /70/); assert.match(html, /סוכה ה, ז/); assert.match(html, /עזרא ג, ד/); assert.match(html, /טיוטה/);
  assert.equal(hasDivineName(html.replace(/<[^>]+>/g, ' ')), false);
  // Friday 25.9: tomorrow is Shabbat and the first day of Sukkot
  const tk = '2026-09-26', t1 = dayTheme(Date.parse(tk + 'T09:00:00+03:00'));
  const tm = HB.tomorrowHe(A, t1, tk, isRestDay).join(' · ');
  assert.match(tm, /שבת/); assert.match(tm, /הרצף שמור/); assert.match(tm, /13 פרים/); assert.match(tm, /פיס חדש/);
});

test('the day panel and the path render with the ritual, the next appointment, tiers and vessels', () => {
  const A = fresh();
  A.lots = S.lotsFor(A, '2026-09-25');
  const m = { A, day: '2026-09-25', todayDone: 3, shachar: SHACHAR };
  const h = HB.todayHTML(m, { next: 'התמיד של בין הערביים היום ב-15:01', tomorrow: ['פיס חדש'] });
  assert.match(h, /מחר: פיס חדש/);
  assert.match(h, /data-play="mine"/); assert.match(h, /הבא במקדש/); assert.ok(h.includes(`3/${SHACHAR.length}`), "3 of the morning chain");   // (wave 12: 17 games)
  assert.match(HB.todayHTML(m, { live: true }), /class="av-btn hk-mine" data-play="mine"/, 'while live, the ritual is there but "join" is the gold one');
  assert.match(h, /class="av-btn gold hk-mine"/);
  HB.mineDone(A, '2026-09-25');
  assert.match(HB.todayHTML(m, {}), /class="av-btn hk-mine" data-play="mine">שוב:/, 'done today: an offer, not the call to action');
  S.learn(A, 'zerika', ['shechita', 'blood'], { now: T0 }); HB.collectVessels(A, 'zerika', '2026-09-25');
  const p = HB.pathHTML(A, { mishmar: 'x' });
  assert.match(p, /שליטה בעבודות/); assert.match(p, /מזרק/); assert.match(p, /כלי העבודה/);
  for (const s of [h, p, HB.phaseAHTML({ altar: true, done: false }), HB.phaseAHTML({ altar: false, done: false })]) assert.equal(hasDivineName(s.replace(/<[^>]+>/g, ' ')), false);
  assert.equal(HB.phaseAHTML({ altar: true, done: true }), '');
});

test('Phase A progress (read-only) and the one-shot intent of its invitation', () => {
  const mem = new Map(), store = { get: (k) => (mem.has(k) ? mem.get(k) : null), set: (k, v) => { mem.set(k, v); return true; } };
  assert.equal(HB.phaseAProgress(store), null);
  mem.set('bh_beta2', JSON.stringify({ v: 5, st: { karnot: { done: true } }, celeb: false }));
  assert.deepEqual(HB.phaseAProgress(store), { altar: true, done: false });
  mem.set('bh_beta2', '{bad json');
  assert.equal(HB.phaseAProgress(store), null);
  mem.set('bh_avodah_intent', 'mine');
  assert.equal(HB.takeIntent(store), 'mine');
  assert.equal(HB.takeIntent(store), null, 'one shot');
  mem.set('bh_avodah_intent', 'evil()');
  assert.equal(HB.takeIntent(store), null);
  mem.set('bh_avodah_intent', 'pitum');   // ── service13 ── Phase A's invitation to Beit Avtinas
  assert.equal(HB.takeIntent(store), 'pitum');
});

test('mishmar: his week (or a festival) doubles the live mark; the turn is counted in weeks', () => {
  const A = fresh(); A.mishmar = 5;
  assert.equal(HB.mishmarWeek(A, { index: 5 }, { kind: 'weekday' }), true);
  assert.equal(HB.mishmarWeek(A, { index: 6 }, { kind: 'weekday' }), false);
  assert.equal(HB.mishmarWeek(A, { index: 6 }, { kind: 'festival' }), true, 'Sukkah 5:7: on the festivals all the mishmarot serve');
  assert.match(HB.mishmarHe(A, { index: 6, weekStart: new Date(T0) }, null, T0), /בעוד 23 שבועות/);
  assert.match(HB.mishmarHe(A, { index: 4, weekStart: new Date(T0) }, null, T0), /בעוד שבוע/);
});
