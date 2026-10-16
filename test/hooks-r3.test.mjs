// Unit tests of the hooks' round 3 (docs/HOOKS.md §14, docs/PLAYTEST.md round 3). Run: node --test test/hooks-r3.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as S from '../src/game/state.js';
const V5_ONLY = (S.SAVE_VERSION | 0) >= 6 ? 'v5 only: the caravan loop was replaced by the v6 building game (BUILD); the new loop is tested in hooks-loop.test.mjs' : false;
import { stageById } from '../src/game/content.js';
import * as N from '../src/game/hooks/next.js';
import * as D from '../src/game/hooks/demo.js';
import * as TR from '../src/avodah/hooks/tour.js';

const T0 = Date.UTC(2026, 9, 4, 16, 30, 0);   // Sunday 4 Oct 2026, 19:30 in Jerusalem
const MIN = 60000;
const NAME = /י[֑-ׇ]*ה[֑-ׇ]*ו[֑-ׇ]*ה/;
const finish = (G, id) => { if (!G.st[id]) G.st[id] = { w: 0, ph: 3 }; G.st[id].w = stageById(id).W; G.st[id].m = true; return S.completeStage(G, id); };
function afterHar() {
  const G = S.fresh(T0);
  G.ftue = 99; G.crews.push({ at: null });
  G.res.stone = 900;
  S.startBuild(G, 'har'); finish(G, 'har');
  return G;
}
function memStore() { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)) }; }

test('idle crews: a crew at a site that waits for a material is listed, and has somewhere useful to go', { skip: V5_ONLY }, () => {
  const G = afterHar();
  assert.ok(S.startBuild(G, 'wall').ok);
  G.crews.forEach((c) => { c.at = 'wall'; });
  assert.deepEqual(N.idleCrews(G), [], 'a site that can take work: nobody waits');
  G.st.wall.w = stageById('wall').W * 0.7; G.st.wall.ph = 2; G.res.cedar = 0; G.res.stone = 0;
  const b = S.blockOf(G, 'wall');
  assert.ok(b && b.lack, 'the wall waits at its finishing phase');
  const idle = N.idleCrews(G);
  assert.equal(idle.length, G.crews.length);
  assert.equal(idle[0].at, 'wall');
  assert.equal(N.crewTarget(G), 'quarry', 'no other site takes work: the quarry');
  // another site that can take work is preferred over the quarry
  const H = afterHar();
  finish(H, 'wall');
  Object.assign(H.res, { stone: 5000, cedar: 5000, bronze: 5000, gold: 5000, silver: 5000, wstone: 5000 });
  const two = ['gates', 'nashim', 'yesod'].filter((id) => S.statusOf(H, id) === 'avail').slice(0, 2);
  assert.equal(two.length, 2, 'two sites open after the wall');
  for (const id of two) assert.ok(S.startBuild(H, id).ok);
  H.crews.forEach((c) => { c.at = two[0]; });
  H.st[two[0]].w = stageById(two[0]).W * 0.15; H.st[two[0]].ph = 1; Object.assign(H.res, { stone: 0, cedar: 0, bronze: 0, gold: 0, wstone: 0 });
  assert.ok(S.blockOf(H, two[0]) && S.blockOf(H, two[0]).lack);
  if (!S.blockOf(H, two[1])) assert.equal(N.crewTarget(H), two[1], 'a site that can take work comes before the quarry');
  assert.ok(N.idleCrews(H).length >= 1);
});

test('arrivals: the caravans whose timer ends inside the window, once', { skip: V5_ONLY }, () => {
  const G = afterHar();
  assert.ok(S.startCaravan(G, 'wagons', 'ftue', T0).ok);
  const t1 = G.car[0].t1;
  assert.deepEqual(N.arrivals(G, T0, t1 - 1), []);
  const a = N.arrivals(G, t1 - 1000, t1);
  assert.equal(a.length, 1); assert.equal(a[0].r, 'wagons'); assert.equal(a[0].res, 'stone'); assert.ok(a[0].n > 0 && a[0].name);
  assert.deepEqual(N.arrivals(G, t1, t1 + 1000), [], 'not twice');
});

test('demo reel: the button counts the highlights; the reel has an end (QA P1-4)', () => {
  const G = S.fresh(T0, { demo: true });
  assert.equal(D.highlightsLeft(G), D.HIGHLIGHTS.length);
  for (let k = 0; k < 20 && D.prepareHighlight(G); k++) { const h = D.nextHighlight(G); finish(G, h.id); }
  assert.equal(D.highlightsLeft(G), 0);
  assert.equal(D.prepareHighlight(G), null, 'after the last highlight there is nothing to prepare: the outro takes over');
});

test('tour stamps: one per stop, kept, and the tab is done once', () => {
  const st = memStore();
  const o = TR.load(st);
  assert.equal(TR.count(o), 0);
  assert.equal(TR.stamp(o, 'ark', 'bows', 5), 'new');
  assert.equal(TR.stamp(o, 'ark', 'bows', 5), null, 'a stop stamps once');
  for (const id of ['stone', 'views', 'find']) TR.stamp(o, 'ark', id, 5);
  assert.equal(TR.stamp(o, 'ark', 'end', 5), 'done', 'the fifth stamp completes the tab');
  assert.equal(TR.stamp(o, 'nope', 'x', 5), null, 'unknown tabs are ignored');
  TR.save(o, st);
  const back = TR.load(st);
  assert.equal(TR.count(back, 'ark'), 5); assert.equal(back.done.ark, 1);
  assert.equal(TR.TOTAL, 25);
});

test('the doors: the tour opens the Ark mystery (Yoma 5:2), the Ark the service (Kelim 1:9), the service the real calendar', () => {
  const o = TR.blank();
  const tour = TR.doorHTML('tour', o);
  assert.match(tour, /data-k="ark"/); assert.match(tour, /יומא ה, ב/); assert.match(tour, /טיוטה/);
  const ark = TR.doorHTML('ark', o);
  assert.match(ark, /data-k="yk"/); assert.match(ark, /כלים א, ט/);
  const yk = TR.doorHTML('yk', o, new Date('2026-09-27T12:00:00+03:00'));
  assert.match(yk, /יום הכיפורים הבא/); assert.doesNotMatch(yk, /data-hk="door"/);
  for (const h of [tour, ark, yk]) assert.doesNotMatch(h, NAME, 'no Divine Name is written');
});

test('Yom Kippur on the real calendar: the next one, and the home announces it only near the day', () => {
  const y = TR.nextYomKippur(new Date('2026-09-27T12:00:00+03:00'));
  assert.ok(y && y.days > 300, 'after Sukkot 5787 the next Yom Kippur is a year away');
  assert.equal(new Date(y.date).toISOString().slice(0, 10), '2027-10-11');
  const near = TR.nextYomKippur(new Date('2027-10-01T12:00:00+03:00'));
  assert.equal(near.days, 10);
  const day = TR.nextYomKippur(new Date('2027-10-11T12:00:00+03:00'));
  assert.equal(day.days, 0); assert.ok(day.today);
  const st = memStore();
  assert.doesNotMatch(TR.homeHTML(new Date('2026-09-27T12:00:00+03:00'), st), /יום הכיפורים/, 'a year away: not on the home');
  assert.match(TR.homeHTML(new Date('2027-10-01T12:00:00+03:00'), st), /בעוד .*10.* ימים: יום הכיפורים/);
  assert.match(TR.homeHTML(new Date('2027-10-11T12:00:00+03:00'), st), /היום: יום הכיפורים/);
  assert.match(TR.homeHTML(new Date('2027-10-11T12:00:00+03:00'), st), /data-a="scenes" data-k="yk"/);
});

test('round 3 texts: drafts, sourced, and never a Divine Name', () => {
  for (const f of ['src/game/hooks/index.js', 'src/avodah/hooks/tour.js', 'src/game/hooks/next.js']) {
    const src = fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
    assert.doesNotMatch(src, NAME, `${f}: no Divine Name`);
  }
  const hk = fs.readFileSync(new URL('../src/game/hooks/index.js', import.meta.url), 'utf8');
  assert.match(hk, /שקלים ו, ב/); assert.match(hk, /סוף ההדגמה/);
  for (const k of Object.keys(TR.DOORS)) if (TR.DOORS[k].to) assert.ok(TR.DOORS[k].ref, `${k}: the door has a source`);
});

test('the Ark mystery on the Phase B home: from the second day of service, until the first Ark stamp', () => {
  const st = memStore();
  const now = new Date('2026-09-28T12:00:00+03:00');
  const A1 = { hk: { days: { '2026-09-27': { g: 3, real: 1 } } } };
  const A2 = { hk: { days: { '2026-09-27': { g: 3, real: 1 }, '2026-09-28': { g: 1, real: 0 } } } };
  assert.doesNotMatch(TR.homeHTML(now, st, A1), /איפה הארון/, 'day 1: not yet');
  const h = TR.homeHTML(now, st, A2);
  assert.match(h, /איפה הארון/); assert.match(h, /data-a="scenes" data-k="ark"/); assert.match(h, /שקלים ו, א–ב/); assert.match(h, /טיוטה/);
  const o = TR.load(st); TR.stamp(o, 'ark', 'bows', 5); TR.save(o, st);
  assert.doesNotMatch(TR.homeHTML(now, st, A2), /תעלומה: איפה הארון/, 'once the Ark was opened, the line goes');
});
