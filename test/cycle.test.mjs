// test/cycle.test.mjs — (FUN12, wave 12) the quarry's cycle without a browser: the order (the board, two others, the board
// again longer; then three others …; never the same other twice in a row), where a new game and a v21 save begin, what moves the
// cycle and what does not (a declined start, the first-time flow's board), the save across a reload, the pill, the pay through
// the host's one accounting path (m3collect live + grantLevel + starBonus), and the board's longer round (MATCH3 levels).
//   node test/cycle.test.mjs
import assert from 'node:assert/strict';
import * as CY from '../src/games/cycle.js';
import { GAMES, STAGE_GAMES, cyclePlan, cyclePill } from '../src/games/index.js';
import * as SL from '../src/games/sling.js';
import { grantLevel, starBonus } from '../src/game/state.js';
import { levelInfo } from '../src/match3/levels.js';

let n = 0, bad = 0;
const ok = async (name, f) => { try { await f(); n++; console.log('PASS ', name); } catch (e) { bad++; console.log('FAIL ', name, '—', e.message); } };
const play = (G, need = { stone: 40 }) => ({ kind: 'play', field: 'quarry', need, id: 'har' });

await ok('the order: board → 2 others → board (longer) → 3 others → board → 4 others …; no other twice in a row', () => {
  const G = { ftue: 99, stats: { levels: 0 }, m3: {} };
  const seq = CY.ahead(G, 16);
  assert.deepEqual(seq.slice(0, 12), ['board', 'sling', 'knuckle', 'board', 'stack', 'quarry', 'sling', 'board', 'knuckle', 'stack', 'quarry', 'sling']);   // (GAMES13: חמש אבנים joined the round)
  for (let i = 1; i < seq.length; i++) assert.ok(seq[i] === 'board' || seq[i] !== seq[i - 1], `${i}: ${seq[i - 1]} → ${seq[i]}`);
  const gaps = []; let run = 0; for (const g of seq) { if (g === 'board') { if (run) gaps.push(run); run = 0; } else run++; }
  assert.deepEqual(gaps.slice(0, 3), [2, 3, 4]);
});
await ok('a new game begins with the board (the first-time flow teaches it); a v21 save that played boards begins with the sling', () => {
  assert.equal(CY.peek({ ftue: 0, stats: { levels: 0 }, m3: {} }), 'board');
  assert.equal(CY.peek({ ftue: 99, stats: { levels: 7 }, m3: { level: { quarry: 8 } } }), 'sling');
});
await ok('the plan: what moves the cycle (a played action) and what does not (a declined start, the first-time flow\'s board)', async () => {
  const G = { ftue: 99, stats: { levels: 3 }, m3: {} };
  let p = cyclePlan(G, play(G));
  assert.equal(p.game, 'sling'); assert.equal(p.name, 'הקלע של דוד');
  p.done({ quit: true, attempts: 0 }); assert.equal(CY.peek(G), 'sling', 'a declined start keeps the place');
  p.done({ won: true, attempts: 1 }); assert.equal(CY.peek(G), 'knuckle');
  p = cyclePlan(G, play(G)); p.done({ won: false, quit: true, attempts: 1 }); assert.equal(CY.peek(G), 'board', 'a quit mid-game counts as played');
  p = cyclePlan(G, play(G)); assert.equal(p.game, 'board'); assert.equal(p.round, 1, 'the board comes back in round 1');
  const F = { ftue: 5, stats: { levels: 3 }, m3: {}, games: { cycle: { k: 0, i: 1, j: 0, n: 1, last: 'board' } } };
  p = cyclePlan(F, play(F)); assert.equal(p.game, 'board'); p.done({ won: true, attempts: 1 }); assert.equal(CY.peek(F), 'sling', 'the first-time flow\'s board does not move the cycle');
});
await ok('the cycle takes the quarry\'s stone actions (the pill, the meter, the quarry\'s tap) — not the forest, the gold, the altar\'s whole stones, silver alone, the investor reel', () => {
  const G = { ftue: 99, stats: { levels: 3 }, m3: {} };
  assert.equal(cyclePlan(G, { kind: 'play', field: 'forest', need: { cedar: 30 } }), null);
  assert.equal(cyclePlan(G, { kind: 'play', field: 'quarry', need: { wstone: 12 } }), null);
  assert.equal(cyclePlan(G, { kind: 'play', field: 'quarry', need: { silver: 12 } }), null);
  assert.equal(cyclePlan({ ...G, demo: true, story: { ...(G.story || {}), reel: 1 } }, play(G)), null);   // the investor reel keeps the board alone
  assert.notEqual(cyclePlan({ ...G, demo: true, story: { ...(G.story || {}) } }, play(G)), null);   // (supervisor, 30.9) the demo as the owner's testing mode plays the cycle
  assert.equal(cyclePlan(G, { kind: 'build', need: { stone: 3 } }), null);
  assert.ok(cyclePlan(G, { kind: 'play', field: 'quarry', need: {} }), 'the meter\'s "▶ שחק" and a tap on the quarry (no need) go through the cycle too');
});
await ok('the place is saved in G and survives a reload (JSON)', () => {
  const G = { ftue: 99, stats: { levels: 3 }, m3: {} };
  for (let i = 0; i < 4; i++) cyclePlan(G, play(G)).done({ attempts: 1 });
  const before = CY.ahead(G, 6), R = JSON.parse(JSON.stringify(G));
  assert.deepEqual(CY.ahead(R, 6), before); assert.equal(R.games.cycle.n, 4);
  R.games.cycle.i = 99; assert.ok(CY.cycleOf(R).i <= CY.gapOf(R.games.cycle.k), 'a damaged place is clamped');
});
await ok('the intro\'s strip: the round from its board, the games played ticked, the one now lit (N73)', () => {
  const G = { ftue: 99, stats: { levels: 3 }, m3: {}, games: { cycle: { k: 0, i: 2, j: 1, n: 2, last: 'sling' } } };
  assert.deepEqual(CY.roundGames(G).map((o) => `${o.g}${o.done ? '✓' : ''}${o.on ? '*' : ''}`), ['board✓', 'sling✓', 'knuckle*']);
  const H = { ftue: 99, stats: { levels: 3 }, m3: {}, games: { cycle: { k: 1, i: 3, j: 4, n: 7, last: 'quarry' } } };
  assert.deepEqual(CY.roundGames(H).map((o) => `${o.g}${o.done ? '✓' : ''}${o.on ? '*' : ''}`), ['board✓', 'stack✓', 'quarry✓', 'sling*']);
});
await ok('the pill names the next game; the board back in a longer round promises more', () => {
  const G = { ftue: 99, stats: { levels: 3 }, m3: {} };
  assert.deepEqual(cyclePill(G, play(G)), { game: 'sling', name: 'הקלע של דוד', mult: 1 });
  cyclePlan(G, play(G)).done({ attempts: 1 }); cyclePlan(G, play(G)).done({ attempts: 1 });
  const pl = cyclePill(G, play(G)); assert.equal(pl.game, 'board'); assert.ok(pl.mult > 1.05 && pl.mult < 1.3, String(pl.mult));
});
await ok('the pay: a game in the cycle reports its stones live and answers in the board\'s shape; the host\'s path grants the rest', async () => {
  const G = { ftue: 99, stats: { levels: 3 }, m3: {}, res: { stone: 0, silver: 0 } };
  const p = cyclePlan(G, play(G, { stone: 40, silver: 6 })), got = [];
  const r = await p.run({ demo: true, need: { stone: 40, silver: 6 }, onEvent: (t, d) => got.push([t, d]) }, { pay: 45 });
  const live = got.filter(([t]) => t === 'm3collect').reduce((o, [, d]) => ({ ...o, [d.res]: (o[d.res] || 0) + d.n }), {});
  assert.equal(r.collected.stone, 45); assert.equal(live.stone, 45); assert.equal(r.collected.silver, 6); assert.equal(live.silver, 6);
  assert.ok(got.some(([t, d]) => t === 'cycle' && d.game === 'sling'), 'the log names the game');
  assert.ok(got.some(([t]) => t === 'm3open') && got.some(([t]) => t === 'm3close'), 'the music hears it open and close');
  // the host: what was credited live is taken off, grantLevel adds the rest (here nothing), a 3★ result may bring the third segment
  const rest = { ...r, collected: { stone: r.collected.stone - live.stone, silver: r.collected.silver - live.silver } };
  const add = grantLevel(G, rest, { stone: 40 }, null, { bonus: false });
  assert.deepEqual(add, {}); assert.equal(starBonus(G, { won: true, stars: 2, collected: { stone: 45 } }), null);
});
await ok('the board goes through MATCH3 with its round; the other games never open it', async () => {
  const G = { ftue: 99, stats: { levels: 3 }, m3: {}, games: { cycle: { k: 1, i: 0, j: 2, n: 3, last: 'stack' } } };
  const p = cyclePlan(G, play(G)); let seen = null;
  await p.run({ root: null, need: { stone: 40 } }, { board: (c) => { seen = c; return Promise.resolve({ won: true, stars: 1, collected: { stone: 50 }, attempts: 1 }); } });
  assert.equal(seen.round, 1);
});
await ok('the board comes back longer and harder: more moves, a longer goal (MATCH3 levelSpec round)', () => {
  const a = levelInfo('quarry', 4), b = levelInfo('quarry', 4, { round: 1 }), c = levelInfo('quarry', 4, { round: 2 });
  assert.ok(b.moves > a.moves && c.moves > b.moves, `${a.moves} ${b.moves} ${c.moves}`);
  assert.ok(b.goals[0].n > a.goals[0].n && c.goals[0].n > b.goals[0].n, `${a.goals[0].n} ${b.goals[0].n} ${c.goals[0].n}`);
});
await ok('the sling: in the hub, the Mount\'s own game, 10 levels (the last Goliath), facts sourced and drafts, no Name letters', () => {
  assert.ok(GAMES.some((g) => g.id === 'sling')); assert.equal(STAGE_GAMES.har[0], 'sling');
  assert.ok(SL.LEVELS.length >= 8 && SL.LEVELS.length <= 12); assert.ok(SL.LEVELS[SL.LEVELS.length - 1].goliath);
  const NAME = new RegExp([0x5d9, 0x5d4, 0x5d5, 0x5d4].map((c) => String.fromCharCode(c)).join(''));
  assert.ok(SL.FACTS.length >= 4 && SL.FACTS.every((f) => f.he.length > 30 && /\S/.test(f.ref) && !NAME.test(f.he + f.ref)));
  for (const t of [JSON.stringify(SL.GAME.how), SL.GAME.quote.he, JSON.stringify(CY.WHY)]) assert.ok(!NAME.test(t));
  const refs = SL.FACTS.map((f) => f.ref).join(' | ');
  for (const r of ['שופטים כ, טז', 'שמואל ב ח, יא', 'שמואל ב כד', 'שמואל א כא, י']) assert.ok(refs.includes(r), r);
});
await ok('the sling\'s progress: a win opens the next level; after Goliath, the valley again', () => {
  const G = {};
  SL.record(G, 1, { won: true, stars: 3 }); assert.equal(SL.levelOf(G), 2);
  SL.record(G, 2, { won: false }); assert.equal(SL.levelOf(G), 2);
  G.games.sling.lv = SL.LEVELS.length; SL.record(G, SL.LEVELS.length, { won: true, stars: 1 }); assert.equal(SL.levelOf(G), 1);
});
// (GAMES13, wave 13) חמש אבנים in the quarry's round: it answers in the board's shape, each round passed pays live
await ok('חמש אבנים in the cycle: its name on the pill, its line, and the demo\'s quick pay in the board\'s shape', async () => {
  const G = { ftue: 99, stats: { levels: 3 }, m3: {}, games: { cycle: { k: 0, i: 2, j: 1, n: 2, last: 'sling' } } };
  assert.deepEqual(cyclePill(G, play(G)), { game: 'knuckle', name: 'חמש אבנים', mult: 1 });
  assert.ok(CY.WHY.knuckle.length > 20 && CY.SHORT.knuckle);
  const got = [], r = await cyclePlan(G, play(G)).run({ demo: true, need: { stone: 40 }, onEvent: (t, d) => got.push([t, d]) }, { pay: 40 });
  assert.equal(r.collected.stone, 40); assert.equal(r.game, 'knuckle');
  assert.ok(got.some(([t, d]) => t === 'cycle' && d.game === 'knuckle'));
});
console.log(bad ? `${bad} FAILED of ${n + bad}` : `all ${n} ok`);
process.exit(bad ? 1 : 0);
