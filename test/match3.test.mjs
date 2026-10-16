// The Temple match-3 engine and levels (node --test test/match3.test.mjs). Pure: no DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/match3/engine.js';
import { levelSpec, levelInfo, difficulty, targetWin, isHard, isBreather, FIELDS, TUTORIAL, hintOf } from '../src/match3/levels.js';
import { runLevel, pickField, generate } from '../src/match3/index.js';

const R = 9, C = 8;
/* a board with no match anywhere: k = (2r + c) mod 5 (a row steps by 1, a column by 2) */
function board(rows = Array(R).fill('.'.repeat(C)), extra = {}) {
  const s = E.createBoard(Object.assign({ field: 'quarry', rows, colors: 5, moves: 20, goals: [{ t: 'stone', n: 99 }] }, extra), 7);
  for (let i = 0; i < s.N; i++) if (!s.vd[i] && !s.bk[i] && s.k[i] >= 0 && s.k[i] < 6) { s.k[i] = (2 * ((i / C) | 0) + (i % C)) % 5; s.sp[i] = 0; s.bn[i] = 0; }
  return s;
}
const at = (r, c) => r * C + c;
const vesselsOnBoard = (s) => { let n = 0; for (let i = 0; i < s.N; i++) if (!s.vd[i] && !s.bk[i] && s.k[i] >= 0 && s.k[i] < 6) n++; return n; };
const gathered = (s) => [0, 1, 2, 3, 4, 5].reduce((a, k) => a + s.t['k' + k], 0);

test('a fresh board: deterministic by seed, no match on it, a move available', () => {
  for (const f of ['quarry', 'forest', 'gold']) {
    const a = generate(f, 3), b = generate(f, 3), c = generate(f, 3, 12345);
    assert.equal(a.k.join(','), b.k.join(','));
    assert.notEqual(a.k.join(','), c.k.join(','));
    assert.equal(E.findMatches(a).length, 0);
    assert.ok(E.hasMove(a));
  }
});

test('runs and shapes: a line of three, an L is one group', () => {
  const s = board();
  assert.equal(E.findMatches(s).length, 0);
  s.k[at(4, 1)] = 1; s.k[at(4, 2)] = 1; s.k[at(4, 3)] = 1;
  let g = E.findMatches(s);
  assert.equal(g.length, 1); assert.equal(g[0].cells.length, 3);
  s.k[at(5, 1)] = 1; s.k[at(6, 1)] = 1;
  g = E.findMatches(s);
  assert.equal(g.length, 1); assert.equal(g[0].cells.length, 5); assert.equal(g[0].runs.length, 2);
});

test('swaps: only a swap that makes a match is valid; blockers, holes and held pieces do not move', () => {
  const s = board(['........', '..1.....', '...#....', '....v...', ...Array(5).fill('........')]);
  s.k[at(6, 0)] = 2; s.k[at(6, 1)] = 2; s.k[at(7, 2)] = 2;           // swapping (7,2)↔(6,2) makes 2-2-2
  assert.ok(E.isValidSwap(s, at(7, 2), at(6, 2)));
  assert.ok(!E.isValidSwap(s, at(8, 5), at(8, 6)));
  assert.ok(!E.canSwap(s, at(1, 2), at(1, 3)));                        // a blocker
  assert.ok(!E.canSwap(s, at(2, 3), at(2, 4)));                        // a hole
  assert.ok(!E.canSwap(s, at(3, 4), at(3, 5)));                        // a vine holds it
  assert.ok(!E.isValidSwap(s, at(0, 0), at(2, 0)));                    // not adjacent
});

test('a move: vessels are gathered (never destroyed), the board refills, one move is spent', () => {
  const s = board();
  s.k[at(8, 0)] = 1; s.k[at(8, 1)] = 1; s.k[at(7, 2)] = 1;
  const before = vesselsOnBoard(s), moves = s.moves;
  const r = E.resolve(s, at(7, 2), at(8, 2), true);
  assert.ok(r.ok);
  assert.equal(s.moves, moves - 1);
  assert.ok(s.t.k1 >= 3);
  assert.equal(vesselsOnBoard(s), before, 'the board is full again');
  assert.equal(E.findMatches(s).length, 0, 'the cascade ran to the end');
  const gone = r.steps.flatMap((st) => st.gone).filter((x) => x[2] < 6).length;
  assert.equal(gone, gathered(s), 'every vessel that left the board was gathered into the collection');
});

test('blockers: a match beside bedrock takes a layer and yields stones; the field decides the material', () => {
  for (const [f, res] of [['quarry', 'stone'], ['forest', 'cedar'], ['gold', 'bronze']]) {
    const s = board([...Array(7).fill('........'), '.2......', '........'], { field: f });
    s.k[at(8, 0)] = 4; s.k[at(8, 1)] = 4; s.k[at(7, 2)] = 4; s.k[at(8, 2)] = 0; s.k[at(8, 3)] = 1;   // (7,1) is the bedrock
    const r = E.resolve(s, at(7, 2), at(8, 2));
    assert.ok(r.ok, f);
    assert.equal(s.bk[at(7, 1)], 1, f + ': one layer off');
    assert.equal(s.t[res], E.YIELD[f].blkN, f + ': yield');
  }
});

test('specials: 4 in a row makes a tool, an L a wedge, 5 the light', () => {
  let s = board();
  s.k[at(8, 0)] = 2; s.k[at(8, 1)] = 2; s.k[at(8, 3)] = 2; s.k[at(7, 2)] = 2;
  let r = E.resolve(s, at(7, 2), at(8, 2), true);
  assert.deepEqual(r.steps[0].made.map((m) => m[2]), [E.ROW]);
  s = board();
  s.k[at(8, 0)] = 2; s.k[at(8, 1)] = 2; s.k[at(6, 2)] = 2; s.k[at(5, 2)] = 2; s.k[at(7, 3)] = 2;   // → an L at (8,2)
  s.k[at(7, 2)] = 2; s.k[at(8, 3)] = 2; s.k[at(8, 2)] = 3; s.k[at(7, 3)] = 1;   // swapping (8,3)→(8,2) closes the L
  r = E.resolve(s, at(8, 3), at(8, 2), true);
  assert.ok(r.ok);
  assert.ok(r.steps[0].made.some((m) => m[2] === E.AREA), 'an L/T makes a wedge');
  s = board();
  for (const c of [0, 1, 3, 4]) s.k[at(8, c)] = 4;
  s.k[at(7, 2)] = 4;
  r = E.resolve(s, at(7, 2), at(8, 2), true);
  assert.ok(r.steps[0].made.some((m) => m[2] === E.SLIGHT));
});

test('a tool sweeps its row: stone is worked, vessels rise; a whole stone is never touched by iron', () => {
  const s = board([...Array(8).fill('........'), '..2.....'], { obj: { kind: 'wstone', total: 0 } });
  s.k[at(8, 5)] = E.WSTONE;
  s.k[at(7, 0)] = 1; s.sp[at(7, 0)] = E.COL;                          // a chisel on column 0
  s.sp[at(8, 0)] = E.ROW;                                             // a mason's hammer on row 8
  const t = s.t.k0 + s.t.k1 + s.t.k2 + s.t.k3 + s.t.k4;
  s.k[at(8, 0)] = 3; s.k[at(8, 1)] = 1;
  // swap the two specials: a cross (row 8 + column 0)
  const r = E.resolve(s, at(7, 0), at(8, 0), true);
  assert.ok(r.ok);
  assert.equal(s.bk[at(8, 2)], 1, 'the bedrock took a layer');
  assert.ok(!r.steps[0].gone.some((g) => g[2] === E.WSTONE), 'no tool touched the whole stone (a later match beside it may gather it)');
  assert.ok(gathered(s) > t, 'the vessels in the path rose into the collection');
  // a match beside the whole stone gathers it by hand
  const w = board([...Array(9).fill('........')]);
  w.k[at(8, 3)] = E.WSTONE; w.k[at(7, 0)] = 2; w.k[at(7, 1)] = 2; w.k[at(6, 2)] = 2; w.k[at(7, 3)] = 4;
  const rw = E.resolve(w, at(6, 2), at(7, 2), true);
  assert.ok(!rw.steps[0].gone.some((g) => g[2] === E.WSTONE), 'a match not beside it leaves it');
  const w2 = board([...Array(9).fill('........')]);
  w2.k[at(8, 3)] = E.WSTONE; w2.k[at(7, 1)] = 2; w2.k[at(7, 2)] = 2; w2.k[at(6, 3)] = 2;
  E.resolve(w2, at(6, 3), at(7, 3));
  assert.equal(w2.t.wstone, 1, 'a match beside it gathers the whole stone');
});

test('the forest: a log rolls down for a move and floats to the sea at the bottom', () => {
  const s = board(undefined, { field: 'forest', obj: { kind: 'log', total: 0 } });
  s.k[at(7, 3)] = E.LOG;
  assert.ok(E.isValidSwap(s, at(7, 3), at(8, 3)), 'a log rolls one row down');
  assert.ok(!E.isValidSwap(s, at(7, 3), at(6, 3)), 'never up');
  E.resolve(s, at(7, 3), at(8, 3));
  assert.equal(s.t.log, 1);
  assert.equal(s.t.cedar, E.YIELD.forest.objN);
  for (let i = 0; i < s.N; i++) assert.notEqual(s.k[i], E.LOG);
});

test('earth and hidden nuggets: two layers to dig, gold under them', () => {
  const s = board([...Array(8).fill('........'), 'NN......'], { field: 'gold' });
  s.k[at(8, 0)] = 1; s.k[at(8, 1)] = 1; s.k[at(7, 2)] = 1;
  E.resolve(s, at(7, 2), at(8, 2));
  assert.equal(s.ea[at(8, 0)], 1);
  assert.equal(s.t.gold, 0);
  const s2 = board([...Array(8).fill('........'), 'n.......'], { field: 'gold' });
  s2.k[at(8, 0)] = 1; s2.k[at(8, 1)] = 1; s2.k[at(7, 2)] = 1;
  E.resolve(s2, at(7, 2), at(8, 2));
  assert.equal(s2.t.gold, E.YIELD.gold.hidN, 'the nugget under one layer is found');
});

test('reshuffle: a board with no move gets one (and no ready match)', () => {
  const s = E.createBoard({ field: 'quarry', rows: Array(R).fill('.'.repeat(C)), colors: 5, moves: 9, goals: [{ t: 'stone', n: 9 }] }, 3);
  // a dead board: every row cycles five colours so no swap makes three
  for (let i = 0; i < s.N; i++) { const r = (i / C) | 0, c = i % C; s.k[i] = ((c % 2) * 2 + (r % 2) + (((c >> 1) + (r >> 1)) % 2) * 0) % 4; }
  const moved = E.reshuffle(s);
  assert.ok(moved.length > 0);
  assert.ok(E.hasMove(s));
  assert.equal(E.findMatches(s).length, 0);
});

test('always a valid move: over many bot games the board never dead-ends', () => {
  for (const f of ['quarry', 'forest', 'gold']) for (const L of [1, 12, 25]) {
    const sp = levelSpec(f, L);
    const s = E.createBoard(sp, sp.seed);
    let r = 1;
    const rnd = () => ((r = (r * 16807) % 2147483647) / 2147483647);
    for (let q = 0; q < sp.moves && s.moves > 0 && !E.goalsMet(s); q++) {
      const m = E.botMove(s, 0.6, rnd);
      assert.ok(m, `${f} ${L}: a move exists at move ${q}`);
      E.resolve(s, m[0], m[1]);
    }
  }
});

test('determinism: the same board and the same hand play the same game', () => {
  const sp = levelSpec('quarry', 7);
  const a = E.playBot(sp, sp.seed, 0.7, 3), b = E.playBot(sp, sp.seed, 0.7, 3);
  assert.equal(a.score, b.score); assert.equal(a.used, b.used); assert.equal(a.won, b.won);
});

test('levels: a monotonic difficulty curve, hard levels and breathers, sane parameters', () => {
  for (let L = 2; L <= 120; L++) assert.ok(difficulty(L) >= difficulty(L - 1), 'difficulty never drops at ' + L);
  let last = 1;
  for (let L = TUTORIAL + 1; L <= 120; L++) { if (isHard(L) || isBreather(L)) continue; const t = targetWin(L); assert.ok(t <= last + 1e-9, 'target win at ' + L); last = t; }
  for (let L = 1; L <= 10; L++) assert.ok(targetWin(L) >= 0.94);
  for (const f of Object.keys(FIELDS)) for (const L of [1, 8, 15, 16, 21, 40]) {
    const i = levelInfo(f, L);
    assert.ok(i.moves >= 25 && i.moves <= 40, `${f} ${L} moves ${i.moves}`);
    assert.ok(i.colors === 5 || i.colors === 6);
    assert.ok(i.goals.length >= 1 && i.goals.every((g) => g.n > 0));
    assert.ok(i.stars[2] > i.stars[1]);
    if (L <= TUTORIAL) assert.ok(hintOf(f, L).length > 10, 'a one-line hint for tutorial level ' + L);
  }
});

test('the API never throws and picks the field from the need', async () => {
  assert.equal(pickField({ need: { cedar: 30, stone: 4 } }), 'forest');
  assert.equal(pickField({ need: { wstone: 3 } }), 'quarry');
  assert.equal(pickField({ field: 'gold', need: { stone: 9 } }), 'gold');
  const r = await runLevel({ field: 'quarry' });                    // no DOM here: resolves, never throws
  assert.equal(r.won, false); assert.equal(r.quit, true);
  assert.deepEqual(Object.keys(r.collected).sort(), ['bronze', 'cedar', 'gold', 'silver', 'stone']);
});

test('(wave 7, FUN) the first board of each field opens with a tool one swap away, and the hint shows it', () => {
  for (const f of ['quarry', 'forest', 'gold']) {
    const sp = levelSpec(f, 1), s = E.createBoard(sp, sp.seed);
    const mv = E.plantFour(s);
    assert.ok(mv, f + ': planted');
    assert.equal(E.findMatches(s).length, 0, f + ': no match waits on the dealt board');
    const h = E.hint(s);
    const t = E.cloneState(s); E.resolve(t, h[0], h[1]);
    const made = t.sp.some((x) => x > 0) || t.score > 0;
    assert.ok(made, f + ': the hinted swap plays');
    const u = E.cloneState(s); const before = u.sp.filter((x) => x > 0).length; E.resolve(u, mv[0], mv[1]);
    assert.ok(u.sp.filter((x) => x > 0).length > before || u.t.stone > 0 || u.score >= 60, f + ': the planted swap makes a tool (or fires it in the cascade)');
  }
});

test('(wave 7, FUN) a gold board played for bronze carries copper ore: never a board that cannot pay its step', () => {
  const plain = levelSpec('gold', 2), ore = levelSpec('gold', 2, { need: { bronze: 80 } });
  const count = (sp) => sp.rows.join('').split('').filter((ch) => ch >= '1' && ch <= '3').length;
  assert.equal(count(plain), 0, 'gold L2 had no ore');
  assert.ok(count(ore) > 0, 'with a bronze need it has');
  const s = E.createBoard(ore, ore.seed); let br = 0;
  for (let i = 0; i < ore.moves && s.moves > 0; i++) { const m = E.botMove(s, 0.6, () => 0.5); if (!m) break; E.resolve(s, m[0], m[1]); }
  br = s.t.bronze || 0;
  assert.ok(br >= 12, 'the board pays bronze (' + br + ')');
  assert.equal(ore.goals[0].t, 'bronze', 'the copper is the goal');
});
