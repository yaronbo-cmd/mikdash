// (GAMES10) the pure rules of the classic games (node, no browser): four-in-a-row's wins and full wall, the gentle builder
// (takes a win, blocks, never an illegal column), every game's facts carry a source and no Name letters, the pay is small and
// fixed. node test/games-rules.test.mjs
import assert from 'node:assert/strict';
import { emptyBoard, rowFor, validCols, winAt, gentleMove, GAME as FOUR } from '../src/games/four.js';
import { GAME as RACE } from '../src/games/race.js';
import { GAME as STACK } from '../src/games/stack.js';
import { GAME as LEVITES } from '../src/games/levites.js';
import { GAME as SLING } from '../src/games/sling.js';   // (FUN12, wave 12) הקלע של דוד
import { STAGE_GAMES, WHY, GAMES, pickFor, tableInfo, menuHTML } from '../src/games/index.js';
import { STAGES } from '../src/game/content.js';
let n = 0; const ok = (name, f) => { f(); n++; console.log('PASS ', name); };
const rng = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647);
ok('four: a column fills from the bottom; a full column is not valid', () => {
  const b = emptyBoard();
  for (let i = 0; i < 6; i++) { const r = rowFor(b, 2); assert.equal(r, 5 - i); b[r][2] = i % 2; }
  assert.equal(rowFor(b, 2), -1); assert.ok(!validCols(b).includes(2));
});
ok('four: four across, up and on both slants win; three do not', () => {
  for (const cells of [[[5, 0], [5, 1], [5, 2], [5, 3]], [[5, 6], [4, 6], [3, 6], [2, 6]], [[5, 0], [4, 1], [3, 2], [2, 3]], [[5, 6], [4, 5], [3, 4], [2, 3]]]) {
    const b = emptyBoard(); for (const [r, c] of cells) b[r][c] = 1;
    const w = winAt(b, cells[2][0], cells[2][1]); assert.ok(w && w.length >= 4);
    b[cells[0][0]][cells[0][1]] = -1; assert.equal(winAt(b, cells[2][0], cells[2][1]), null);
  }
});
ok('four: the gentle builder takes a win when it sees one (≥ 45 of 100) and blocks a threat (≥ 35 of 100), but not always (a child can win)', () => {
  let win = 0, block = 0; const R = rng(7);
  for (let i = 0; i < 100; i++) {
    const b = emptyBoard(); b[5][0] = b[5][1] = b[5][2] = 1; b[5][6] = b[4][6] = 0;
    if (gentleMove(b, 1, R) === 3) win++;
    const c = emptyBoard(); c[5][0] = c[4][0] = c[3][0] = 0; c[5][4] = 1;
    if (gentleMove(c, 1, R) === 0) block++;
  }
  assert.ok(win >= 45 && win <= 80, `win ${win}`); assert.ok(block >= 35 && block <= 70, `block ${block}`);
});
ok('four: a whole game of two gentle builders always ends (a course or a full wall), never an illegal move', () => {
  const R = rng(11);
  for (let g = 0; g < 200; g++) {
    const b = emptyBoard(); let p = 0, end = false;
    for (let m = 0; m < 42 && !end; m++) { const c = gentleMove(b, p, R); assert.ok(validCols(b).includes(c)); const r = rowFor(b, c); b[r][c] = p; end = !!winAt(b, r, c) || !validCols(b).length; p = 1 - p; }
    assert.ok(end);
  }
});
ok('facts: every game ends on a fact with its source; no Name letters anywhere; the pay is small and fixed', () => {
  const NAME = new RegExp([0x5d9, 0x5d4, 0x5d5, 0x5d4].map((c) => String.fromCharCode(c)).join(''));
  for (const G of [FOUR, RACE, STACK, LEVITES, SLING]) {
    assert.ok(G.facts.length >= 3);
    for (const f of G.facts) { assert.ok(f.he && f.he.length > 20 && f.ref && f.ref.length > 4, f.id); assert.ok(!NAME.test(f.he + f.ref)); }
    assert.ok(!NAME.test(JSON.stringify(G.how) + (G.quote ? G.quote.he : '')));
    const [k, v] = Object.entries(G.pay)[0]; assert.ok(['stone', 'gold', 'silver'].includes(k) && v > 0 && v <= 12);
    assert.ok(G.how.length === 3 && G.title && G.sub && typeof G.run === 'function' && typeof G.icon === 'function', G.id);
  }
  assert.equal(RACE.facts[0].id, 'f_guf_race');
  assert.ok(!/נשברה|דחף/.test(RACE.facts.map((f) => f.he).join(' ') + JSON.stringify(RACE.how)), 'the race is told without its injury');
});
// (FUN11, wave 11) variety with a reason: every stage has its game; all five games are some stage's own; the one just offered
// steps aside for the next; the invitation's lines keep the rules (a source where they state a fact, no Name, the race uninjured)
ok('the game of the stage: every stage has one, every game is some stage\'s own, and the last offered steps aside', () => {
  const ids = GAMES.map((g) => g.id);
  for (const s of STAGES) { const l = STAGE_GAMES[s.id]; assert.ok(Array.isArray(l) && l.length >= 2 && l.every((g) => ids.includes(g)), s.id); }
  for (const g of ids) if (g !== 'torches') assert.ok(STAGES.some((s) => STAGE_GAMES[s.id][0] === g), `${g} is some stage's own game`);   // (build 48: torches — שמחת בית השואבה's — no stage's: it opens on its date in Phase B)
  const G = { games: {} };
  for (const s of STAGES) {
    const a = pickFor(G, s.id); assert.equal(a, STAGE_GAMES[s.id][0]);
    G.games.lastOffer = a; const b = pickFor(G, s.id); assert.notEqual(b, a, `${s.id}: not the same game twice in a row`);
    G.games.lastOffer = '';
  }
  const t = tableInfo({ games: {}, focus: 'nikanor' });
  assert.equal(t.game, 'levites'); assert.ok(/שולחן המשחקים/.test(t.title) && /שיר הלויים/.test(t.sub), JSON.stringify(t));
  const NAME = new RegExp([0x5d9, 0x5d4, 0x5d5, 0x5d4].map((c) => String.fromCharCode(c)).join(''));
  for (const [k, line] of Object.entries(WHY)) { assert.ok(ids.includes(k) && line.length > 20 && !NAME.test(line), k); }
  assert.ok(/\(משנה יומא ב, א\)/.test(WHY.race) && /\(משנה מדות ב, ה\)/.test(WHY.levites), 'a fact in a line carries its source');
  assert.ok(!/נשברה|דחף/.test(WHY.race), 'the race is told without its injury');
  // the menu marks the stage's own game (gold ✦), one at most; none before the first-time flow ends or without a stage
  const gold = (h) => (h.match(/gm-btn gm-btn-gold" data-g10="(\w+)"/g) || []).map((m) => m.replace(/.*data-g10="/, '').replace('"', ''));
  assert.deepEqual(gold(menuHTML({ games: {}, ftue: 99, focus: 'nikanor', st: {} })), ['levites']);
  assert.deepEqual(gold(menuHTML({ games: {}, ftue: 99, focus: 'guf', st: {} })), ['race']);
  assert.deepEqual(gold(menuHTML({ games: {}, ftue: 3, focus: 'nikanor', st: {} })), [], 'not in the first-time flow');
  assert.deepEqual(gold(menuHTML({ games: {}, ftue: 99, st: {} })), [], 'no stage, no mark');
});
console.log(`\n${n}/${n} passed`);
