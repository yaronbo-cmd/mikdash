// FUN (wave 6): the hooks of the new loop (src/game/hooks/loop.js): orders that roll and never expire, finds earned at a
// known count, crew mastery, personal bests, the Shabbat-safe daily, the one-door onEvent, the sheets and the taps.
// Run: node --test test/hooks-loop.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import * as L from '../src/game/hooks/loop.js';

const NAME = new RegExp(String.fromCharCode(0x5D9, 0x5D4, 0x5D5, 0x5D4));   // built from char codes: the Name is never written
const at = (key, h = 10) => new Date(`${key}T${String(h).padStart(2, '0')}:00:00`).getTime();
const opened = () => { const G = {}; L.onEvent(G, 'course', { c: 1 }, at('2026-10-05')); return G; };   // the board and the daily open after the first course
const TUE = at('2026-10-06'), WED = at('2026-10-07'), SAT = at('2026-10-10'), YK = at('2026-09-21');

test('G.fun is created, kept and repaired; onEvent never throws', () => {
  const G = {};
  const f = L.ensureFun(G);
  for (const k of ['best', 'tier', 'finds', 'crew', 'stats', 'orders', 'daily']) assert.ok(f[k], k);
  G.fun.orders = null; L.ensureFun(G); assert.ok(Array.isArray(G.fun.orders.list));
  assert.deepEqual(L.onEvent(null, 'stoneSet', {}), []);
  assert.ok(Array.isArray(L.onEvent({}, 'nope', null)));
  assert.ok(Array.isArray(L.onEvent({ fun: 5 }, 'minigame', { kind: 'crane', score: 3 })));
});

test('the orders board: three orders, progress, one "ready" beat, a claim, a refill; unfinished ones roll to tomorrow', () => {
  const G = opened();
  const o = L.ordersFor(G, TUE);
  assert.equal(o.length, 3);
  const worth = (rw) => Object.values(rw || {}).reduce((a, b) => a + b, 0);
  assert.ok(o.every((x) => x.he && x.n > 0 && worth(x.reward) > 0 && x.got === 0));
  assert.ok(!o.some((x) => x.key === 'deals'), 'no king orders before the kings open');
  const first = o[0];
  const feed = { stones: ['stoneSet', { n: 1, by: 'hero' }], keysA: ['keyStone', { quality: 0.9 }], m3wins: ['m3Won', { field: 'quarry', stars: 1 }],
    m3stars: ['m3Won', { field: 'gold', stars: 3 }], courses: ['course', { c: 1 }], perfects: ['stroke', { perfect: true }], m3forest: ['m3Won', { field: 'forest', stars: 2 }] };
  assert.equal(L.claimOrder(G, first.id, TUE), null, 'not claimable before it is done');
  let ready = 0;
  for (let i = 0; i < 40 && !L.ordersFor(G, TUE).find((x) => x.id === first.id).done; i++) {
    const [name, data] = feed[first.key];
    ready += L.onEvent(G, name, data, TUE).filter((b) => b.kind === 'order' && b.id === first.id).length;
  }
  assert.equal(ready, 1, 'exactly one ready beat');
  const reward = L.claimOrder(G, first.id, TUE);
  assert.ok(reward && worth(reward) > 0);
  assert.equal(L.claimOrder(G, first.id, TUE), null, 'claimed once');
  assert.equal(L.ordersFor(G, TUE).length, 3, 'refilled to three');
  const open = L.ordersFor(G, TUE).map((x) => x.id);
  const next = L.ordersFor(G, WED);
  for (const id of open) assert.ok(next.some((x) => x.id === id), 'an unfinished order rolls to the next day');
  assert.ok(L.ordersHTML(G, WED).includes('מאתמול'));
});

test('Shabbat and Yom Tov: no daily, no new orders, nothing lost', () => {
  assert.equal(L.isRestDay(L.dayKey(SAT)), true);
  assert.equal(L.isRestDay(L.dayKey(YK)), true, 'Yom Kippur');
  assert.equal(L.isRestDay(L.dayKey(TUE)), false);
  const d = L.dailyFor(SAT);
  assert.equal(d.rest, true);
  assert.equal(L.m3Daily(SAT), null);
  const G = opened();
  assert.equal(L.ordersFor(G, SAT).length, 0, 'no orders issued on Shabbat');
  L.ordersFor(G, TUE);
  assert.equal(L.ordersFor(G, SAT).length, 3, 'Tuesday\'s orders are still there on Shabbat');
  assert.ok(L.dailyHTML(G, SAT).includes('יום מנוחה'));
});

test('the daily challenge: seeded by the day, done by playing its game at its level, counted per week', () => {
  const G = opened();
  const d = L.dailyFor(TUE);
  assert.equal(d.rest, false);
  assert.ok(['crane', 'dress', 'plumb', 'whole', 'quarry'].includes(d.mg) && d.level >= 2);
  assert.deepEqual(L.dailyFor(TUE + 3600e3), d, 'the same all day');
  assert.deepEqual(L.m3Daily(TUE), { field: d.field, mult: 2, he: L.m3Daily(TUE).he });
  assert.equal(L.onEvent(G, 'minigame', { kind: d.mg, level: d.level - 1, score: 100 }, TUE).filter((b) => b.kind === 'daily').length, 0, 'too easy a level');
  const b = L.onEvent(G, 'minigame', { kind: d.mg, level: d.level, score: 120 }, TUE).filter((x) => x.kind === 'daily');
  assert.equal(b.length, 1);
  assert.equal(L.dailyState(G, TUE).done, true);
  assert.equal(L.dailyState(G, TUE).week, 1);
  const r = L.onTap(G, { closest: () => ({ getAttribute: () => 'daily' }) }, WED);
  assert.ok(r.play && r.play.mg && r.play.daily);
});

test('the first minutes stay clean: no orders, no daily, no field bonus before the first course', () => {
  const G = {};
  assert.equal(L.ordersFor(G, TUE).length, 0);
  assert.equal(L.dailyState(G, TUE).locked, true);
  assert.equal(L.m3Daily(TUE, G), null);
  assert.ok(L.dailyHTML(G, TUE).includes('אחרי הנדבך הראשון'));
  L.onEvent(G, 'course', { c: 1 }, TUE);
  assert.equal(L.ordersFor(G, TUE).length, 3);
  assert.ok(L.m3Daily(TUE, G));
});

test('finds come at a known count; the album shows how to earn the rest; CONTENT\'s list merges by id', () => {
  const G = {};
  const b = L.onEvent(G, 'course', { c: 1 }, TUE).filter((x) => x.kind === 'find');
  assert.equal(b.length, 1);
  assert.equal(b[0].id, 'margins');
  const a = L.album(G);
  assert.equal(a.filter((x) => x.got).length, 1);
  assert.ok(a.filter((x) => !x.got).every((x) => x.how));
  assert.ok(L.albumHTML(G).includes('איך מוצאים'));
  L.setFinds([{ id: 'margins', title_he: 'השוליים (CONTENT)', text_he: 'נוסח מאומת', source: 'מקור', status: 'approved' }, { id: 'new_one', title_he: 'חדש', text_he: 'x', source: 'y' }]);
  const m = L.album(G).find((x) => x.id === 'margins');
  assert.equal(m.he, 'השוליים (CONTENT)'); assert.deepEqual(m.when, ['courses', 1]); assert.equal(m.status, 'approved');
  assert.ok(!L.albumHTML(G).includes('undefined'));
  // CONTENT's real finds.json ids (s6-content): its verified texts replace mine, my triggers stay, its new finds are earnable
  L.setFinds([{ id: 'find_quarry_key', title_he: 'מפתח במחצבה', text_he: 'נוסח CONTENT', source: 'רשות העתיקות, 2013', status: 'draft' }, { id: 'find_pilate_coins', title_he: 'מטבעות', text_he: 'y', source: 'z' }]);
  const q = L.FINDS.find((x) => x.id === 'quarry_tools'), p = L.FINDS.find((x) => x.src === 'find_pilate_coins'), n = L.FINDS.find((x) => x.id === 'new_one');
  assert.equal(q.text, 'נוסח CONTENT'); assert.deepEqual(q.when, ['m3quarry', 1]); assert.equal(q.src, 'find_quarry_key');
  assert.equal(p && p.id, 'stepped_street', '(wave 7) the coins under the stepped street are one find with the street');
  assert.ok(n && (Array.isArray(n.when) || n.dig), 'a new find is earnable (the dig of the day): never a goal that cannot be reached');
  assert.ok(L.FINDS.length >= 10 && L.FINDS.some((x) => x.id === 'master_course'), 'mine stay beside CONTENT\'s');
});

test('crew mastery rises with work and speaks once per level; bests speak only when beaten', () => {
  const G = {};
  let crew = [];
  for (let i = 0; i < 40; i++) crew = crew.concat(L.onEvent(G, 'stoneSet', { n: 1, by: 'crew' }, TUE).filter((x) => x.kind === 'crew'));
  assert.equal(crew.length, 1);
  assert.equal(L.crewLevel(G, 'setter').lv, 1);
  assert.ok(L.crewPerk(G, 'setter') > 1 && L.crewPerk(G, 'setter') <= 1.3);
  assert.equal(L.onEvent(G, 'minigame', { kind: 'crane', score: 300, tier: 2 }, TUE).filter((x) => x.kind === 'pb').length, 0, 'the first score is a record, not a new best');
  assert.equal(L.onEvent(G, 'minigame', { kind: 'crane', score: 280 }, TUE).filter((x) => x.kind === 'pb').length, 0);
  assert.equal(L.onEvent(G, 'minigame', { kind: 'crane', score: 350 }, TUE).filter((x) => x.kind === 'pb').length, 1);
  assert.equal(L.onEvent(G, 'minigame', { kind: 'crane', score: 999, skipped: true }, TUE).length, 0, 'a skip is not a record');
  assert.equal(G.fun.best.crane, 350);
  assert.deepEqual(L.grade(0.9), { g: 'א', stars: 3 });
  assert.equal(L.grade(0.5).g, 'ג');
});

test('nextGoal: a ready order first, then the nearest one, then the daily; the sheets never show the Name', () => {
  const G = opened();
  const o = L.ordersFor(G, TUE)[0];
  const g0 = L.nextGoal(G, TUE, { label: 'חסרות 12 אבנים — למחצבה ▶' });
  assert.equal(g0.he, 'חסרות 12 אבנים — למחצבה ▶');
  for (let i = 0; i < 60; i++) L.onEvent(G, 'stoneSet', { n: 1 }, TUE), L.onEvent(G, 'course', {}, TUE), L.onEvent(G, 'stroke', { perfect: true }, TUE),
    L.onEvent(G, 'm3Won', { field: 'forest', stars: 3 }, TUE), L.onEvent(G, 'keyStone', { quality: 0.9 }, TUE);
  const g = L.nextGoal(G, TUE, null);
  assert.equal(g.act.kind, 'order');
  const html = L.ordersHTML(G, TUE) + L.dailyHTML(G, TUE) + L.albumHTML(G);
  assert.ok(html.includes('data-fun="claim:'));
  assert.ok(!NAME.test(html));
  const r = L.onTap(G, { closest: () => ({ getAttribute: () => 'claim:' + o.id }) }, TUE);
  assert.ok(r && Object.values(r.claim).reduce((a, b) => a + b, 0) > 0);
});

test('mgLevel follows the player: up after strong tries, down after weak ones; the hooks self-register for BUILD', () => {
  const G = {};
  assert.equal(L.mgLevel(G, 'crane'), 0);
  L.onEvent(G, 'minigame', { kind: 'crane', quality: 0.95, score: 300 }, TUE); L.onEvent(G, 'minigame', { kind: 'crane', quality: 0.9, score: 310 }, TUE);
  assert.equal(L.mgLevel(G, 'crane'), 1);
  L.onEvent(G, 'minigame', { kind: 'crane', quality: 0.4, score: 100 }, TUE); L.onEvent(G, 'minigame', { kind: 'crane', quality: 0.5, score: 120 }, TUE);
  assert.equal(L.mgLevel(G, 'crane'), 0);
  assert.equal(L.mgLevel(G, 'dress'), 0);
  const P = globalThis.__BH_PARTS.fun;
  for (const k of ['onEvent', 'onTap', 'm3Daily', 'mgLevel', 'ordersHTML', 'dailyHTML', 'albumHTML', 'nextGoal']) assert.equal(typeof P[k], 'function', k);
});

test('the daily picks a game the player has met (never the altar\'s whole stones on the Mount)', () => {
  let t = TUE; while (L.dailyFor(t).rest || L.dailyFor(t).mg === 'crane') t += 864e5;
  const G = {}; L.ensureFun(G).best.crane = 120; L.ensureFun(G).stats.courses = 1;
  const d = L.dailyState(G, t);
  assert.equal(d.mg, 'crane'); assert.ok(d.he.includes('המנוף'));
  const b = L.onEvent(G, 'minigame', { kind: 'crane', level: d.level, score: 130 }, t).filter((x) => x.kind === 'daily');
  assert.equal(b.length, 1, 'playing the met game completes it');
});

test('(wave 7) the dig of the day: one real find a day in order, CONTENT\'s texts, Shabbat rests, nothing lost, the badge', () => {
  const G = {};
  assert.equal(L.digState(G, TUE).ready, false, 'locked before the first course (the first minutes stay clean)');
  assert.equal(L.digHTML(G, TUE), '');
  L.onEvent(G, 'course', { c: 1 }, TUE);
  const d0 = L.digState(G, TUE);
  assert.ok(d0.ready && d0.find && d0.next && d0.find.id !== d0.next.id);
  assert.equal(d0.find.id, L.DIG_ORDER.find((id) => !G.fun.finds[id]));
  assert.ok(/data-fun="dig"/.test(L.ordersHTML(G, TUE)), 'the dig card leads the "היום" sheet');
  assert.equal(L.badge(G, TUE) >= 1, true);
  const r = L.onTap(G, { closest: () => ({ getAttribute: () => 'dig' }) }, TUE);   // no DOM here: the card is skipped, the find is given
  assert.ok(r && r.claim && r.claim.cedar > 0 && r.dig === d0.find.id);
  assert.ok(G.fun.finds[d0.find.id], 'into the album at the tap');
  assert.equal(L.dig(G, TUE), null, 'one dig a day');
  assert.equal(L.digState(G, TUE).done, true);
  assert.ok(/מחר בחפירה/.test(L.digHTML(G, TUE)), 'the tease: tomorrow\'s site');
  assert.equal(L.badge(G, TUE), L.ordersFor(G, TUE).filter((o) => o.done).length);
  // a missed day loses nothing: two days later the NEXT find in order waits
  const d2 = L.digState(G, TUE + 2 * 864e5);
  assert.equal(d2.find.id, d0.next.id);
  // Shabbat: no dig, a calm line, the badge stays quiet; Friday's tease names Sunday
  assert.equal(L.digState(G, SAT).ready, false); assert.equal(L.digState(G, SAT).rest, true);
  assert.ok(/יום מנוחה/.test(L.digHTML(G, SAT)) && /שום דבר לא הולך לאיבוד/.test(L.digHTML(G, SAT)));
  assert.equal(L.nextDigWhen(SAT - 864e5), 'ביום ראשון');
  assert.equal(L.nextDigWhen(TUE), 'מחר');
  // every find of the season has its true archaeology in Hebrew, and CONTENT's texts reached the album
  for (const id of L.DIG_ORDER) { const a = L.DIG_AT[id]; assert.ok(a && a.where && a.found && a.art, id); assert.ok(L.FINDS.some((x) => x.id === id), id); }
  assert.equal(L.FINDS.find((x) => x.id === 'coins').src, 'find_revolt_shekel');
  // the whole season: ten days of digs, then "the album is whole", never an empty promise
  let t = TUE; for (let i = 0; i < 30; i++) { t += 864e5; L.dig(G, t); }
  assert.equal(L.digState(G, t).left, 0);
  assert.ok(/כל 10 הממצאים/.test(L.digHTML(G, t + 864e5)) || /כל הממצאים/.test(L.digHTML(G, t + 864e5)));
  // the brush time: the first is a record, a faster one a personal best
  assert.equal(L.digTime(G, 9000).isPB, false); assert.equal(L.digTime(G, 7000).isPB, true); assert.equal(L.digTime(G, 8000).isPB, false);
  const html = L.ordersHTML(G, t) + L.albumHTML(G);
  assert.ok(!NAME.test(html) && !html.includes('undefined'));
});

// (FUN11, wave 11) engagement without pressure: the days of Tishrei 5787 as a player lives them — the streak rests on Rosh
// HaShana (Sat–Sun), on Shabbat, on Yom Kippur (a Monday) and on the first day of Sukkot, and breaks only on a weekday missed;
// a break says nothing (no guilt line exists to say it) and takes nothing back
test('the streak rests on Shabbat and Yom Tov (Tishrei 5787), and a weekday missed only starts it again, taking nothing', async () => {
  const S = await import('../src/game/state.js');
  const at = (d) => Date.parse(d + 'T09:00:00+03:00');
  const G = S.fresh(at('2026-09-10'));
  const walk = (days) => days.map((d) => { const r = S.dailyCheck(G, at(d), L.isRestDay); return r ? r.streak : null; });
  // Thu 10, Fri 11 → (RH Sat 12, Sun 13) → Mon 14 … Fri 18 → (Shabbat 19) → Sun 20 → (Yom Kippur Mon 21) → Tue 22 … Fri 25 → (Sukkot, Sat 26) → Sun 27
  const s = walk(['2026-09-10', '2026-09-11', '2026-09-14', '2026-09-15', '2026-09-16', '2026-09-17', '2026-09-18', '2026-09-20', '2026-09-22', '2026-09-23', '2026-09-24', '2026-09-25', '2026-09-27']);
  assert.deepEqual(s.slice(1), [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13], `the rest days never break it: ${s}`);
  const silver = G.res.silver;
  const r = S.dailyCheck(G, at('2026-09-29'), L.isRestDay);   // Mon 28 (Chol HaMoed, a weekday) missed
  assert.equal(r.streak, 1, 'a weekday missed starts it again');
  assert.ok(G.res.silver >= silver, 'nothing is taken back');
  for (const k of ['2026-09-12', '2026-09-13', '2026-09-19', '2026-09-21', '2026-09-26', '2026-10-03']) assert.ok(L.isRestDay(k), k);
  for (const k of ['2026-09-14', '2026-09-28', '2026-09-29']) assert.ok(!L.isRestDay(k), k);
  // no line anywhere in the engagement layer shames a missed day
  const fs = await import('node:fs');
  for (const f of ['src/game/hooks/index.js', 'src/game/hooks/loop.js', 'src/game/hooks/dig.js', 'src/game/hooks/week.js', 'src/games/index.js', 'src/game/middot-ui.js']) {
    const t = fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
    assert.ok(!/פספסת|הפסדת|איבדת|אל תפספס|רק היום|לפני שייגמר/.test(t), `${f}: no guilt or pressure words`);
  }
});
