// Unit tests of the engagement layer (src/game/hooks/*, docs/HOOKS.md). Run: node --test test/hooks.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../src/game/state.js';
const V5_ONLY = (S.SAVE_VERSION | 0) >= 6 ? 'v5 only: the caravan loop was replaced by the v6 building game (BUILD); the new loop is tested in hooks-loop.test.mjs' : false;
import { STAGES, stageById, ROUTES, START_RES } from '../src/game/content.js';
import * as N from '../src/game/hooks/next.js';
import * as R from '../src/game/hooks/rhythm.js';
import * as D from '../src/game/hooks/demo.js';
import { FESTIVALS } from '../src/game/hooks/index.js';

const T0 = Date.UTC(2026, 9, 4, 16, 30, 0);   // Sunday 4 Oct 2026, 19:30 in Jerusalem
const MIN = 60000, HOUR = 60 * MIN;
const finish = (G, id) => { if (!G.st[id]) G.st[id] = { w: 0, ph: 3 }; G.st[id].w = stageById(id).W; G.st[id].m = true; return S.completeStage(G, id); };
/** a player just after the Mount: two crews, the wagons and the cedar routes */
function afterHar() {
  const G = S.fresh(T0);
  G.ftue = 99; G.crews.push({ at: null });
  G.res.stone = 900;                                  // (the boulders' stone: finish() does not strike them)
  S.startBuild(G, 'har');
  finish(G, 'har');
  return G;
}

test('finding 1 (pacing): the first session can finish the wall, and every route has a short first trip', { skip: V5_ONLY }, () => {
  const wall = stageById('wall');
  const cedar = wall.cost.reduce((a, c) => a + (c.cedar || 0), 0);
  assert.ok(START_RES.cedar >= cedar, `the starting cedar (${START_RES.cedar}) covers the wall (${cedar})`);
  for (const R of ROUTES) {
    assert.ok(R.ftue, `${R.id} has a first trip`);
    assert.ok(R.ftue.min <= 15 && R.ftue.cost === 0, `${R.id}: the first trip returns inside a session and is free`);
    assert.ok(R.ftue.y <= R.long.y, `${R.id}: the taste is smaller than a long trip`);
  }
  // the first trip is offered once per route only
  const G = afterHar();
  assert.ok(S.startCaravan(G, 'cedar', 'ftue', T0).ok);
  S.collectCaravan(G, 0, T0 + 7 * MIN);
  assert.equal(S.startCaravan(G, 'cedar', 'ftue', T0 + 8 * MIN).ok, false);
});

test('appointments: caravans, trainees and crews, soonest first', { skip: V5_ONLY }, () => {
  const G = afterHar();
  S.startBuild(G, 'wall');
  S.startCaravan(G, 'cedar', 'short', T0);
  S.startCaravan(G, 'wagons', 'ftue', T0);
  const a = N.appointments(G, T0 + MIN);
  assert.equal(a[0].kind, 'caravan'); assert.equal(a[0].id, 'wagons');
  assert.ok(Math.abs(a[0].ms - 4 * MIN) < 1000);
  assert.ok(a.some((x) => x.kind === 'phase' && x.id === 'wall'), 'the crew on the wall reaches its next phase');
  for (let k = 1; k < a.length; k++) assert.ok(a[k].ms >= a[k - 1].ms);
  assert.ok(a.every((x) => x.ms >= 0));
});

test('blockedInfo and goalNote: a waiting goal says when its material comes, or what to do', { skip: V5_ONLY }, () => {
  const G = afterHar();
  S.startBuild(G, 'wall'); finish(G, 'wall');
  G.res.cedar = 0;
  G.routes.push('alexandria', 'beitkerem');
  assert.ok(S.startBuild(G, 'gates').ok);
  G.st.gates.w = stageById('gates').W * 0.15;                          // at the structure boundary: stone 50, cedar 110
  let r = S.recommend(G);
  assert.equal(r.kind, 'blocked');
  let n = N.goalNote(G, r, T0);
  assert.equal(n.action, 'caravans'); assert.match(n.text, /שלח משלחת/);
  // the first rafts (120) cover the structure's 110. With four minutes to wait and Ezrat Nashim ready to begin,
  // the pill offers the parallel start (the fork in the road); in the last two minutes it just counts down
  assert.ok(S.startCaravan(G, 'cedar', 'ftue', T0).ok);
  let info = N.blockedInfo(G, 'gates', T0);
  assert.equal(info.items.find((x) => x.res === 'cedar').covered, true);
  n = N.goalNote(G, S.recommend(G), T0);
  assert.equal(n.action, 'start'); assert.equal(n.id, 'nashim'); assert.match(n.text, /בינתיים אפשר להתחיל: עזרת הנשים/);
  n = N.goalNote(G, S.recommend(G), T0 + 3 * MIN);
  assert.match(n.text, /מגיע בעוד/); assert.ok(n.eta > 0 && n.eta <= 2 * MIN);
  n = N.goalNote(G, S.recommend(G), T0 + 5 * MIN);
  assert.match(n.text, /חזרה: אסוף/, 'back but not collected: collect it');
  // nothing else can start (Ezrat Nashim and the altar's base already begun, both waiting): the countdown
  G.st.nashim = { w: stageById('nashim').W * 0.15, ph: 1 }; G.st.yesod = { w: stageById('yesod').W * 0.15, ph: 1 };
  n = N.goalNote(G, S.recommend(G), T0);
  assert.match(n.text, /מגיע בעוד/); assert.equal(n.action, 'caravans');
  // not enough on its way: "another caravan is coming" (and the ETA of what comes)
  G.car[0].y = 50;
  n = N.goalNote(G, S.recommend(G), T0);
  assert.match(n.text, /עוד משלחת בדרך/);
  // nothing coming and every slot out on other routes: when does one come back
  G.car = [];
  S.startCaravan(G, 'wagons', 'short', T0); S.startCaravan(G, 'alexandria', 'short', T0);
  n = N.goalNote(G, S.recommend(G), T0 + MIN);
  assert.match(n.text, /כל המשלחות בדרך/); assert.ok(Math.abs(n.eta - 29 * MIN) < 1000);
});

test('restState: a natural stopping point only when nothing can be built, collected, started or sent', { skip: V5_ONLY }, () => {
  const G = afterHar();
  S.startBuild(G, 'wall'); finish(G, 'wall');
  let st = N.restState(G, T0);
  assert.equal(st.idle, false, 'three sites are open: go build');
  for (const id of ['gates', 'nashim']) S.startBuild(G, id);
  G.res.cedar = 0; G.res.wstone = 0;
  for (const id of ['gates', 'nashim']) G.st[id].w = stageById(id).W * 0.15;
  st = N.restState(G, T0);
  assert.equal(st.idle, false, 'the cedar route is free: sending a caravan is the thing to do');
  S.startCaravan(G, 'cedar', 'long', T0);
  S.startCaravan(G, 'beitkerem', 'ftue', T0);
  st = N.restState(G, T0);
  assert.equal(st.idle, true);
  assert.ok(st.appts.length >= 2 && st.blocked.length >= 2);
  // a caravan comes back: not idle any more (collect it)
  st = N.restState(G, T0 + 9 * MIN);
  assert.equal(st.idle, false);
});

test('hintFor: the first time the goal waits for a material nobody is bringing, once per material', { skip: V5_ONLY }, () => {
  const G = afterHar();
  S.startBuild(G, 'wall'); finish(G, 'wall');
  S.startBuild(G, 'gates'); G.res.cedar = 0; G.st.gates.w = stageById('gates').W * 0.15;
  const h = N.hintFor(G, T0);
  assert.ok(h && h.res === 'cedar' && h.route === 'cedar');
  assert.match(h.text, /ארז/); assert.match(h.text, /הפעם הראשונה קצרה/);
  G.story[h.key] = 1;
  assert.equal(N.hintFor(G, T0), null);
});

test('stoneNeeded: quarrying is useful only while the open sites need more stone than the stock', () => {
  const G = afterHar();
  S.startBuild(G, 'wall');
  G.res.stone = 0;
  assert.equal(N.stoneNeeded(G), 100, 'the wall still needs its structure (60) and finish (40)');
  G.res.stone = 900;
  assert.equal(N.stoneNeeded(G), 0);
});

test('chapterLadder (endowed progress) and opensAfter (the next-unlock preview)', { skip: V5_ONLY }, () => {
  const G = afterHar();
  S.startBuild(G, 'wall');
  G.st.wall.w = 24;
  const l = N.chapterLadder(G);
  assert.equal(l.id, 2); assert.equal(l.done, 0); assert.equal(l.total, 6);
  assert.ok(l.frac > 0.08 && l.frac < 0.09, 'a half-built wall already shows on the chapter bar');
  assert.deepEqual(N.opensAfter(G, 'wall').sort(), ['gates', 'nashim', 'yesod']);
  assert.deepEqual(N.opensAfter(G, 'sorag'), [], 'the Ulam needs more than the soreg');
});

test('apptLine: readable lines with LTR-isolated times', { skip: V5_ONLY }, () => {
  const G = afterHar();
  S.startCaravan(G, 'cedar', 'ftue', T0);
  const [a] = N.appointments(G, T0 + MIN);
  const line = N.apptLine(a, G);
  assert.match(line, /ארזים מן הלבנון/); assert.match(line, /⁦\d+:\d\d⁩/);
  assert.equal(N.fmtClock(65 * MIN), '1:05:00');
});

test('honest rhythm: a burst of taps is not an aimed tap; combo milestones', () => {
  const m = R.createTapMeter();
  // aimed: one tap for each strike
  m.tap(); assert.equal(R.isMash(m.take()), false);
  // a nervous double tap is still aimed
  m.tap(); m.tap(); assert.equal(R.isMash(m.take()), false);
  // mashing: 5 taps a second over one 0.86 s swing
  for (let k = 0; k < 4; k++) m.tap();
  assert.equal(R.isMash(m.take()), true);
  assert.equal(m.take(), 0, 'take() starts counting again');
  assert.equal(R.milestone(2, 3), 1); assert.equal(R.milestone(5, 6), 2); assert.equal(R.milestone(9, 10), 3);
  assert.equal(R.milestone(3, 4), 0); assert.equal(R.milestone(0, 0), 0);
  assert.equal(R.MILESTONE_TEXT.length, 4);
});

test('the highlight reel (demo): eight highlights in order, each playable, ending in the finale', () => {
  const G = S.fresh(T0, { demo: true });
  const seen = [];
  for (let guard = 0; guard < 12; guard++) {
    const p = D.prepareHighlight(G);
    if (!p) break;
    seen.push(p.h.id);
    const s = G.st[p.h.id];
    assert.equal(s.w, stageById(p.h.id).W);
    for (const d of stageById(p.h.id).deps) assert.ok(S.isDone(G, d), `${p.h.id}: ${d} is done first`);
    if (p.h.how === 'moment') { assert.equal(s.ready, true); assert.ok(stageById(p.h.id).moment); S.momentDone(G, p.h.id); }
    else S.completeStage(G, p.h.id);
    if (stageById(p.h.id).ch === 4) assert.ok(G.priests >= 10, 'no stall on trained priests in the demo');
  }
  assert.deepEqual(seen, D.HIGHLIGHTS.map((h) => h.id));
  assert.ok(S.allDone(G), 'the last highlight completes the House');
});

test('festival card: sourced, no Divine Name, and Sukkot uses the verified Middot 2:6 text', () => {
  const F = FESTIVALS.sukkot;
  assert.equal(F.ref, 'משנה מדות ב, ו');
  assert.ok(F.q.startsWith('וְלָמָּה נִקְרָא שְׁמוֹ שַׁעַר הַמַּיִם'));
  const plain = (s) => s.replace(/[֑-ׇ]/g, '');
  assert.ok(!/\u05d9\u05d4\u05d5\u05d4|\u05d0\u05dc\u05d4\u05d9\u05dd/.test(plain(F.q + F.d + F.t)));
});

test('pacing guard: the regular player still takes 8–16 days (the long arc stays)', async () => {
  const { execFileSync } = await import('node:child_process');
  const out = execFileSync(process.execPath, ['test/game-sim.mjs', '--check'], { cwd: new URL('..', import.meta.url).pathname, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  assert.match(out, /pacing OK/);
});

test('the weekly goal: Sunday to Friday, a cluster for the vine, nothing counted or asked on Shabbat', async () => {
  const W = await import('../src/game/hooks/week.js');
  const sun = new Date('2026-10-04T10:00:00+03:00').getTime();       // Sunday
  const G = S.fresh(sun);
  assert.equal(W.weekKey(sun), '2026-10-04');
  assert.equal(W.weekKey(sun + 5 * 24 * HOUR), '2026-10-04', 'Friday is the same week');
  assert.equal(W.weekKey(sun + 7 * 24 * HOUR), '2026-10-11');
  const sat = sun + 6 * 24 * HOUR;
  assert.equal(W.noteWeek(G, 'site', sat), null, 'Shabbat: not counted');
  let r = null;
  for (let k = 0; k < W.WEEK.sites; k++) r = W.noteWeek(G, 'site', sun + HOUR) || r;
  assert.equal(r, null);
  const clusters = G.vine.clusters, silver = G.res.silver;
  for (let k = 0; k < W.WEEK.caravans; k++) r = W.noteWeek(G, 'caravan', sun + 2 * HOUR) || r;
  assert.ok(r && r.done);
  assert.equal(G.vine.clusters, clusters + 1); assert.equal(G.res.silver, silver + W.WEEK.reward.silver);
  assert.equal(W.noteWeek(G, 'site', sun + 3 * HOUR), null, 'once a week');
  // a new week starts clean; the old one is not held against anybody
  const v = W.weekView(G, sun + 7 * 24 * HOUR);
  assert.equal(v.done, false); assert.equal(v.sites, 0);
  assert.equal(W.weekView(G, sat + 7 * 24 * HOUR).shabbat, true);
});

/* ── Sprint 3: the Phase A → Phase B handoff (src/game/hooks/avodah.js) ── */
import * as AV from '../src/game/hooks/avodah.js';
import { hasDivineName } from '../src/avodah/data.js';

test('Phase A → B: the menu button follows the building (preview → the altar → Chanukat HaBayit); soft gate by default', () => {
  const G = S.fresh(T0);
  assert.equal(AV.avodahStage(G), 'building');
  assert.equal(AV.menuLabel(G), null);   // ── fable32 (build 44) ── (v2 §12: no gold button for players before Chanukat HaBayit; the labels below: the hidden test switch) ── /fable32 ──
  globalThis.__FORCE_SHIFT = 'card';
  assert.match(AV.menuLabel(G).t, /הצצה/);
  G.st.karnot = { done: true };
  assert.equal(AV.avodahStage(G), 'altar');
  assert.match(AV.menuLabel(G).sub, /עזרא ג, ו/);
  G.celeb = true;
  assert.equal(AV.avodahStage(G), 'done');
  assert.doesNotMatch(AV.menuLabel(G).t, /הצצה/);
  // ⚑ a hard gate hides the button before the altar, except in the demo (the investors' bypass)
  const H = S.fresh(T0);
  assert.equal(AV.menuLabel(H, 'hard'), null);
  H.demo = true;
  assert.ok(AV.menuLabel(H, 'hard'));
  delete globalThis.__FORCE_SHIFT;   // ── fable32 (build 44) ── ── /fable32 ──
  assert.equal(AV.GATE, 'soft', 'the owner decides (⚑); everything stays reachable meanwhile');
});

test('Phase A → B invitations: sourced, drafts, no Divine Name, a known intent', () => {
  for (const k of ['altar', 'finale']) {
    const I = AV.invite(k);
    assert.ok(I.q && I.ref && I.title && I.go && I.stay, k);
    assert.match(I.ref, /^עזרא ג, [ד-ו]$/);
    assert.ok(['mine', 'home'].includes(I.intent));
    for (const t of [I.q, I.title, I.d, I.kick]) assert.equal(hasDivineName(t), false, t);
  }
  assert.match(AV.invite('altar').q, /וְהֵיכַל ה׳ לֹא יֻסָּד/);
});

test('Phase A → B: the altar invitation shows once, and "go" hands over to Phase B with the ritual as the intent', async () => {
  const { createHooks } = await import('../src/game/hooks/index.js');
  const G = S.fresh(T0); G.st.karnot = { done: true };
  let entered = 0, shown = 0, answer = 'go';
  const store = new Map();
  globalThis.localStorage = { setItem: (k, v) => store.set(k, v), getItem: (k) => store.get(k) ?? null, removeItem: (k) => store.delete(k) };
  store.set('bh_tester44', '1');   // ── fable32 (build 44) ── (the altar's invitation: testers only — v2 §12) ── /fable32 ──
  const HK = createHooks({ G: () => G, now: () => T0, ui: { modal: async (html) => { shown++; assert.match(html, /עזרא ג, [דו]/); return answer; } }, act: { canAvodah: true, enterAvodah: () => { entered++; } } });
  assert.equal(await HK.avodahInvite('altar'), true);
  assert.equal(entered, 1); assert.equal(shown, 1);
  assert.equal(store.get('bh_avodah_intent'), 'mine');
  assert.equal(await HK.avodahInvite('altar'), false, 'once');
  answer = 'stay';
  assert.equal(await HK.avodahInvite('finale'), false, '"אחר כך": stays in Phase A');
  assert.equal(entered, 1); assert.equal(shown, 2);
  const H2 = createHooks({ G: () => S.fresh(T0), now: () => T0, ui: { modal: async () => 'go' }, act: {} });
  assert.equal(await H2.avodahInvite('altar'), false, 'no Phase B in this build (the harness): no card');
  delete globalThis.localStorage;
});
