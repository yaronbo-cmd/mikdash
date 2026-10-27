// (GAMES13, wave 13) the rules of the three games a boy of the Second Temple played, without a browser:
//   חמש אבנים — the rounds (ones → twos → threes 3+1 → fours), the catch's ring, a drop is thrown again a little slower, the duel's turn;
//   שמונה אבוקות — a perfect juggler reaches eight, an idle one ends kindly after three falls, a masher is not a juggler, no two
//     torches land in one hand together, an even count rises and falls in each hand (a fountain), an odd one crosses;
//   מגדל האגוזים — the towers stand by themselves, every courtyard can be won in three nuts, a child's full flat pull fells one;
//   and for all three: facts with sources (טיוטה), the verified quotes, no Name letters, no chance or stakes, a small fixed pay,
//   each is some stage's own game, and חמש אבנים sits in the quarry's round.
//   node test/games13-rules.test.mjs
import assert from 'node:assert/strict';
import * as KN from '../src/games/knuckle.js';
import * as TO from '../src/games/torches.js';
import * as NU from '../src/games/nuts.js';
import { STAGE_GAMES, WHY, GAMES, pickFor } from '../src/games/index.js';
import { OTHERS, ahead } from '../src/games/cycle.js';
import { PLAYERS } from '../src/games/shell.js';

let n = 0, bad = 0;
const ok = (name, f) => { try { f(); n++; console.log('PASS ', name); } catch (e) { bad++; console.log('FAIL ', name, '—', e.message); } };
const NAME = new RegExp([0x5d9, 0x5d4, 0x5d5, 0x5d4].map((c) => String.fromCharCode(c)).join(''));

ok('חמש אבנים: ones, twos, threes (3 + 1), fours — nine good throws; the round\'s need is what is picked', () => {
  assert.deepEqual(KN.ROUNDS.map((r) => r.groups), [[1, 1, 1, 1], [2, 2], [3, 1], [4]]);
  const p = KN.newPlayer(), needs = [];
  while (p.round < KN.ROUNDS.length && p.throws < 30) { needs.push(KN.need(p)); KN.advance(p, 'ok', KN.need(p)); }
  assert.deepEqual(needs, [1, 1, 1, 1, 2, 2, 3, 1, 4]); assert.equal(p.throws, 9); assert.equal(p.misses, 0);
});
ok('חמש אבנים: the catch — too early closes the hand, the gold ring catches (its middle is perfect), past it the bone is on the mat', () => {
  assert.equal(KN.judgeCatch(0.3), 'early'); assert.equal(KN.judgeCatch(0.7), 'early');
  assert.equal(KN.judgeCatch(0.9), 'ok'); assert.equal(KN.judgeCatch(1.0), 'perfect'); assert.equal(KN.judgeCatch(1.04), 'ok');
  assert.equal(KN.judgeCatch(KN.U_CLOTH + 0.01), 'drop');
  const T = KN.FLIGHT[0], win = (KN.U_CLOTH - 0.887) * T;   // the ring's time, at the first round: about a third of a second
  assert.ok(win > 0.3 && win < 0.45, `window ${win.toFixed(2)} s`);
});
ok('חמש אבנים: a drop or a short hand is thrown again (nothing lost), a little slower each time, up to 1.4×', () => {
  const p = KN.newPlayer(), f0 = KN.flightOf(p);
  let r = KN.advance(p, 'drop', 1); assert.equal(r.ok, false); assert.equal(r.why, 'drop');
  r = KN.advance(p, 'ok', 0); assert.equal(r.ok, false); assert.equal(r.why, 'short');
  assert.equal(p.round, 0); assert.equal(p.group, 0); assert.ok(KN.flightOf(p) > f0);
  for (let i = 0; i < 9; i++) KN.advance(p, 'drop', 0);
  assert.ok(KN.flightOf(p) <= f0 * 1.4 + 1e-9);
  KN.advance(p, 'perfect', 1); assert.equal(KN.flightOf(p), f0, 'a good throw: the flight is its own again'); assert.equal(p.perfect, 1);
});
ok('חמש אבנים: four bones scattered on the mat, apart from each other (each a ≥ 44 px target)', () => {
  let s = 7; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  for (let k = 0; k < 50; k++) {
    const b = KN.scatter(4, rnd); assert.equal(b.length, 4);
    for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) assert.ok(Math.hypot((b[i].x - b[j].x) * 354, (b[i].y - b[j].y) * 300) > 50);
  }
});
ok('שמונה אבוקות: a juggler on the beat reaches eight torches ("שמונה אבוקות") in under a minute', () => {
  const J = TO.makeJuggler({}); const adds = [];
  while (!J.over && J.t < 90) {
    for (const hd of [0, 1]) { const q = J.due(hd); if (q && Math.abs(J.t - q.t1) < 1 / 240) J.tap(hd); }
    for (const e of J.step(1 / 120)) if (e.k === 'add') adds.push(e.n);
  }
  assert.ok(J.eight && J.best === TO.MAX && J.drops === 0, JSON.stringify({ best: J.best, drops: J.drops }));
  assert.deepEqual(adds, [4, 5, 6, 7, 8]); assert.ok(J.t < 60, `${J.t.toFixed(1)} s`);
});
ok('שמונה אבוקות: an idle player ends kindly after three fallen torches; a masher is answered, not rewarded', () => {
  const I = TO.makeJuggler({}); while (!I.over && I.t < 30) I.step(1 / 60);
  assert.ok(I.over && I.drops === TO.LIVES && I.best === TO.START);
  const M = TO.makeJuggler({}); let k = 0;
  while (!M.over && M.t < 60) { if (++k % 5 === 0) { M.tap(0); M.tap(1); } M.step(1 / 60); }
  assert.ok(M.over && M.best === TO.START, `the masher reached ${M.best}`);
});
ok('שמונה אבוקות: "ואין נוגעות זו בזו" — never two landings in one hand within 0.7 s; odd counts cross, even ones rise in each hand', () => {
  const J = TO.makeJuggler({}); const last = [-9, -9]; let gap = 9, cross = { odd: 0, oddN: 0, even: 0, evenN: 0 };
  while (!J.over && J.t < 90) {
    for (const hd of [0, 1]) { const q = J.due(hd); if (q && Math.abs(J.t - q.t1) < 1 / 240) { gap = Math.min(gap, J.t - last[hd]); last[hd] = J.t; J.tap(hd); } }
    J.step(1 / 120);
    for (const v of J.view()) if (v.from >= 0 && v.fall < 0 && v.u < 0.05) { const o = J.n % 2 ? 'odd' : 'even'; cross[o + 'N']++; if (v.from !== v.to) cross[o]++; }
  }
  assert.ok(gap >= 0.7, `gap ${gap.toFixed(2)}`);
  assert.ok(cross.odd / cross.oddN > 0.95 && cross.even / cross.evenN < 0.05, JSON.stringify(cross));
});
ok('מגדל האגוזים: the towers stand by themselves (ten seconds, no nut)', () => {
  for (let lv = 1; lv <= NU.LEVELS.length; lv++) { const W = NU.makeWorld(lv); for (let i = 0; i < 600; i++) NU.stepWorld(W); assert.equal(W.down, 0, `courtyard ${lv}`); }
});
ok('מגדל האגוזים: every courtyard can be won in three nuts (the planner\'s pulls replayed); a child\'s full flat pull fells a tower', () => {
  for (let lv = 1; lv <= NU.LEVELS.length; lv++) {
    const W = NU.makeWorld(lv); for (let k = 0; k < 60; k++) NU.stepWorld(W);
    for (let s = 0; s < NU.NUTS && !NU.allDown(W); s++) {
      const i = W.towers.findIndex((T) => !T.down), pull = NU.plan(W, i); assert.ok(pull, `courtyard ${lv}: a pull for tower ${i}`);
      NU.launch(W, NU.velOf(pull)); for (let k = 0; k < 520; k++) NU.stepWorld(W);
    }
    assert.ok(NU.allDown(W), `courtyard ${lv} (${NU.LEVELS[lv - 1].n}): ${W.down}/${W.towers.length}`);
  }
  const C = NU.makeWorld(1); NU.launch(C, NU.velOf({ x: 96, y: 8 })); for (let k = 0; k < 480; k++) NU.stepWorld(C);
  assert.equal(C.down, 1);
});
ok('מגדל האגוזים: the progress — a won courtyard opens the next; after the fifth, the first again', () => {
  const G = {}; NU.record(G, 1, { won: true }); assert.equal(NU.levelOf(G), 2);
  NU.record(G, 2, { won: false }); assert.equal(NU.levelOf(G), 2);
  G.games.nuts.lv = NU.LEVELS.length; NU.record(G, NU.LEVELS.length, { won: true }); assert.equal(NU.levelOf(G), 1);
});
ok('the facts: sources on every one, the verified quotes word for word, drafts; no Name letters; no chance or stakes; the nut tower an illustration', () => {
  for (const G of [KN.GAME, TO.GAME, NU.GAME]) {
    assert.ok(G.facts.length >= 3, G.id);
    for (const f of G.facts) { assert.ok(f.he.length > 30 && f.ref.length > 4, f.id); assert.ok(!NAME.test(f.he + f.ref), f.id); }
    const all = JSON.stringify(G.how) + (G.quote ? G.quote.he + G.quote.src : '') + G.title + G.sub + JSON.stringify(G.facts) + (WHY[G.id] || '');
    assert.ok(!NAME.test(all), G.id);
    assert.ok(!/הימור|מזל|קוביי?ה|להמר|פרס|לזכות ב/.test(all), `${G.id}: a game of skill, nothing at stake`);
    const [k, v] = Object.entries(G.pay)[0]; assert.ok(['stone', 'gold', 'silver'].includes(k) && v > 0 && v <= 12, G.id);
    assert.ok(G.how.length === 3 && typeof G.run === 'function' && typeof G.icon === 'function' && typeof G.words === 'function', G.id);
  }
  const T = TO.FACTS.find((f) => f.id === 'to_rashbag');
  assert.ok(T.he.includes('הָיָה נוֹטֵל שְׁמֹנֶה אֲבוּקוֹת שֶׁל אוֹר, וְזוֹרֵק אַחַת וְנוֹטֵל אַחַת וְאֵין נוֹגְעוֹת זוֹ בָּזוֹ') && T.ref === 'בבלי סוכה נג, א');
  assert.ok(TO.FACTS.some((f) => f.ref === 'משנה סוכה ה, ב' && /פרחי הכהונה/.test(f.he)));
  assert.ok(NU.FACTS.some((f) => f.ref === 'בבלי פסחים קט, א' && /רבי עקיבא/.test(f.he)) && NU.FACTS.some((f) => f.ref === 'משנה בבא מציעא ד, יב'));
  assert.ok(KN.FACTS.some((f) => /tmsifting\.org/.test(f.ref) && /2017/.test(f.ref)) && KN.FACTS.some((f) => f.ref === 'זכריה ח, ה'));
  assert.ok(/המחשה/.test(JSON.stringify(NU.GAME.how)), 'the nut tower is marked an illustration');
  assert.ok(/\(סוכה נג, א\)/.test(WHY.torches) && /\(פסחים קט, א\)/.test(WHY.nuts) && /tmsifting\.org, 2017/.test(WHY.knuckle), 'a fact in a line carries its source');
});
ok('the words at the end are kind (solo and duel, every outcome); nothing says lost or failed', () => {
  const texts = [];
  texts.push(...KN.GAME.words(false, { misses: [0, 0], throws: 9 }), ...KN.GAME.words(false, { misses: [3, 0], throws: 12 }));
  for (const w of [0, 1, -1]) for (const x of KN.GAME.words(true, { winner: w, misses: [2, 3], perfect: [1, 0], rounds: [4, 2] }, PLAYERS)) texts.push(...x);
  texts.push(...TO.GAME.words(false, { best: [5, 0], catches: [30, 0] }), ...TO.GAME.words(false, { eight: true, best: [8, 0], catches: [71, 0] }));
  for (const w of [0, 1, -1]) for (const x of TO.GAME.words(true, { winner: w, best: [5, 4], catches: [30, 20] }, PLAYERS)) texts.push(...x);
  texts.push(...NU.GAME.words(false, { won: true, used: 2, targets: 2, level: 2 }), ...NU.GAME.words(false, { won: false, down: 1, targets: 2, level: 2 }));
  for (const w of [0, 1, -1]) for (const x of NU.GAME.words(true, { winner: w, down: [2, 1], used: [2, 3], targets: 2 }, PLAYERS)) texts.push(...x);
  for (const t of texts) { assert.ok(typeof t === 'string' && t.length > 3, t); assert.ok(!/הפסדת|נכשלת|לא הצלחת|גרוע/.test(t), t); assert.ok(!/undefined|NaN/.test(t), t); }
});
ok('where they appear: each is some stage\'s own game (נשים · הסורג · היסוד) and another\'s second; the hub has nine; חמש אבנים in the quarry\'s round', () => {
  assert.equal(GAMES.length, 9);
  assert.ok(!Object.values(STAGE_GAMES).some((l) => l.includes('torches')), 'build 48: no stage offers "שמונה אבוקות" (שמחת בית השואבה opens on its date in Phase B — the owner)'); assert.equal(STAGE_GAMES.sorag[0], 'knuckle'); assert.equal(STAGE_GAMES.yesod[0], 'nuts');
  for (const id of ['knuckle', 'nuts']) assert.ok(Object.values(STAGE_GAMES).filter((l) => l.includes(id)).length >= 2, id);
  assert.equal(pickFor({ games: {} }, 'nashim'), 'levites');   // (build 48: was torches)
  assert.ok(OTHERS.includes('knuckle')); assert.ok(ahead({ ftue: 99, stats: { levels: 0 }, m3: {} }, 4).includes('knuckle'), 'in the first round');
});
console.log(bad ? `${bad} FAILED of ${n + bad}` : `all ${n} ok`);
process.exit(bad ? 1 : 0);
