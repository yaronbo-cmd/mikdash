// "הוצאת הטלה מהדיר" — the sliding-block pen engine (node --test test/pen.test.mjs). Pure: no DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/pen/engine.js';

const P = (id, kind, x, y, dir = 'h') => ({ id, kind, x, y, len: E.KINDS[kind].len, dir });
/* a tiny known pen: the lamb at x=3 with one goat standing in the lane; two moves (the goat down, the lamb out) */
const TINY = { w: 6, h: 6, exitRow: 2, pieces: [P('lamb', 'lamb', 3, 2), P('goat1', 'goat', 1, 2, 'v')] };
const cellsOf = (p) => { const out = []; for (let k = 0; k < p.len; k++) out.push(p.dir === 'h' ? `${p.x + k},${p.y}` : `${p.x},${p.y + k}`); return out; };
const noOverlap = (lv) => { const seen = new Set(); for (const p of lv.pieces) for (const c of cellsOf(p)) { const [x, y] = c.split(',').map(Number); if (x < 0 || y < 0 || x >= lv.w || y >= lv.h || seen.has(c)) return false; seen.add(c); } return true; };
const play = (s, moves) => { for (const [id, d] of moves) { const n = E.move(s, id, d); assert.ok(n, `move ${id} ${d} is legal`); s = n; } return s; };

test('load: a state from a level, the optimal solved when missing; the lamb must lie in the lane', () => {
  const s = E.load(TINY);
  assert.equal(s.w, 6); assert.equal(s.h, 6); assert.equal(s.exitRow, 2); assert.equal(s.moves, 0); assert.equal(s.hints, E.HINTS);
  assert.equal(s.optimal, 2); assert.equal(s.won, false);
  assert.throws(() => E.load({ w: 6, h: 6, exitRow: 2, pieces: [P('lamb', 'lamb', 3, 1)] }));
  assert.throws(() => E.load({ w: 6, h: 6, exitRow: 2, pieces: [P('goat1', 'goat', 3, 2)] }));
});
test('range / canMove: along the axis only, up to the fence or the next piece', () => {
  const s = E.load(TINY);
  assert.deepEqual(E.range(s, 'lamb'), { min: -1, max: 1 });      // x=3..4: left to 2 (the goat is at 1), right to 4 (the fence)
  assert.deepEqual(E.range(s, 'goat1'), { min: -2, max: 2 });     // y=2..3: up to 0, down to 4
  assert.ok(E.canMove(s, 'lamb', -1) && E.canMove(s, 'lamb', 1) && !E.canMove(s, 'lamb', -2) && !E.canMove(s, 'lamb', 2));
  assert.ok(!E.canMove(s, 'lamb', 0) && !E.canMove(s, 'nobody', 1));
  assert.ok(E.canMove(s, 'goat1', 2) && !E.canMove(s, 'goat1', 3));
});
test('move: a new state, moves+1, history kept; the old state untouched; an illegal move is null', () => {
  const s0 = E.load(TINY), json = JSON.stringify(s0);
  const s1 = E.move(s0, 'goat1', 2);
  assert.equal(JSON.stringify(s0), json);
  assert.equal(s1.moves, 1); assert.equal(s1.hist.length, 1); assert.equal(s1.pieces[1].y, 4); assert.deepEqual(s1.last, ['goat1', 2]);
  assert.equal(E.move(s0, 'lamb', -3), null, 'through the goat');
  assert.equal(E.move(s0, 'goat1', 'x'), null);
  const s2 = E.move(s1, 'lamb', -3);
  assert.ok(s2 && s2.won && E.isWon(s2)); assert.equal(s2.moves, 2);
  assert.equal(E.move(s2, 'goat1', -1), null, 'no moves after the win');
});
test('blocking: nothing passes through, nothing leaves the pen; a vertical piece never slides sideways', () => {
  const s = E.load(E.HAND[1]);
  for (const p of s.pieces) {
    const r = E.range(s, p.id);
    for (let d = r.min; d <= r.max; d++) { if (!d) continue; const n = E.move(s, p.id, d); assert.ok(n && noOverlap(n)); }
    assert.equal(E.move(s, p.id, r.min - 1), null); assert.equal(E.move(s, p.id, r.max + 1), null);
  }
  // the lamb cannot go left at all on hand level 1 (the cow stands at x=1 across the lane)
  assert.equal(E.range(s, 'lamb').min, 0);
});
test('win detection: the lamb at x=0 of the exit row', () => {
  const s = E.load({ w: 6, h: 6, exitRow: 2, pieces: [P('lamb', 'lamb', 1, 2)] });
  assert.equal(s.optimal, 1); assert.ok(!E.isWon(s));
  assert.ok(E.isWon(E.move(s, 'lamb', -1)));
  const w = E.load({ w: 6, h: 6, exitRow: 2, pieces: [P('lamb', 'lamb', 0, 2)] });
  assert.ok(w.won); assert.equal(w.optimal, 0);
});
test('undo: back one move, unlimited; reset: the dealt board', () => {
  let s = E.load(TINY);
  s = play(s, [['goat1', 2], ['lamb', -1], ['lamb', 1]]);
  assert.equal(s.moves, 3);
  const u = E.undo(s); assert.equal(u.moves, 2); assert.equal(u.pieces[0].x, 2);
  const u2 = E.undo(E.undo(u)); assert.equal(u2.moves, 0); assert.equal(u2.pieces[1].y, 2); assert.equal(E.undo(u2), null);
  const r = E.reset(s); assert.equal(r.moves, 0); assert.deepEqual(r.pieces, E.load(TINY).pieces); assert.equal(E.reset(r), r);
  // undoing a winning move un-wins
  const w = play(E.load(TINY), [['goat1', -2], ['lamb', -3]]); assert.ok(w.won); assert.ok(!E.undo(w).won);
});
test('solver: optimal lengths on known pens; the moves it gives really win', () => {
  assert.equal(E.solve(TINY).n, 2);
  assert.deepEqual(E.solve(TINY).moves.map((m) => m[0]), ['goat1', 'lamb']);
  assert.equal(E.solve({ w: 6, h: 6, exitRow: 2, pieces: [P('lamb', 'lamb', 3, 2), P('goat1', 'goat', 1, 2, 'v'), P('hay1', 'hay', 1, 0, 'v'), P('hay2', 'hay', 1, 4, 'v')] }), null, 'the goat is wedged between two bales: no way out');
  for (let L = 1; L <= E.HAND_MAX; L++) {
    const lv = E.HAND[L], r = E.solve(lv);
    assert.ok(r, `hand level ${L} solvable`); assert.equal(r.n, lv.optimal, `hand level ${L} optimal ${lv.optimal}`);
    assert.ok(noOverlap(lv), `hand level ${L} has no overlap`);
    assert.equal(new Set(lv.pieces.map((p) => p.id)).size, lv.pieces.length, `hand level ${L} ids unique`);
    const end = play(E.load(lv), r.moves); assert.ok(end.won); assert.equal(end.moves, r.n);
    // no shorter solution: a BFS already guarantees it; the band of each level holds
    const b = E.bandOf(L); assert.ok(r.n >= b.min && r.n <= b.max, `hand level ${L}: ${r.n} in ${b.min}–${b.max}`);
  }
});
test('hint: the first optimal move, two a level, none after the win', () => {
  let s = E.load(TINY);
  const h1 = E.hint(s); assert.deepEqual(h1.move, E.solve(s).moves[0]); assert.equal(h1.s.hints, 1); assert.equal(s.hints, 2);
  s = E.move(h1.s, h1.move[0], h1.move[1]);
  const h2 = E.hint(s); assert.deepEqual(h2.move, ['lamb', -3]); assert.equal(h2.s.hints, 0);
  assert.equal(E.hint(h2.s).move, null);
  const w = E.move(h2.s, 'lamb', -3); assert.equal(E.hint(Object.assign({}, w, { hints: 2 })).move, null);
});
test('generator: deterministic by seed, solvable, in the band of the level, no overlap', () => {
  const a = E.generate(7, 5), b = E.generate(7, 5), c = E.generate(7, 6);
  assert.deepEqual(a, b); assert.notEqual(JSON.stringify(a.pieces), JSON.stringify(c.pieces));
  for (const L of [1, 2, 3, 4, 5, 6, 7, 8, 10]) {
    for (const seed of [1, 2]) {
      const lv = E.generate(L, seed), band = E.bandOf(L), r = E.solve(lv);
      assert.ok(r, `level ${L} seed ${seed} solvable`);
      assert.equal(r.n, lv.optimal, `level ${L} seed ${seed}: the declared optimal is the solver's`);
      assert.ok(r.n >= band.min && r.n <= band.max, `level ${L} seed ${seed}: ${r.n} moves in ${band.min}–${band.max}`);
      assert.ok(lv.pieces.length >= band.pMin - 1 && lv.pieces.length <= band.pMax + 1, `level ${L}: ${lv.pieces.length} pieces`);
      assert.ok(noOverlap(lv)); assert.equal(lv.pieces[0].kind, 'lamb'); assert.equal(lv.pieces[0].y, lv.exitRow);
      assert.ok(lv.pieces.every((p, i) => i === 0 || p.dir === 'v' || p.y !== lv.exitRow), 'only the lamb lies along the lane');
      assert.equal(new Set(lv.pieces.map((p) => p.id)).size, lv.pieces.length);
      const end = play(E.load(lv), r.moves); assert.ok(end.won);
    }
  }
});
test('puzzle: hand levels for 1–6, generated from 7; load() keeps the level and the seed', () => {
  for (let L = 1; L <= 6; L++) { const p = E.puzzle(L, 9); assert.deepEqual(p.pieces, E.HAND[L].pieces); assert.equal(p.seed, 9); assert.notEqual(p.pieces, E.HAND[L].pieces, 'a copy'); }
  const p7 = E.puzzle(7, 9); assert.deepEqual(p7, E.generate(7, 9));
  const s = E.load(E.puzzle(3, 4)); assert.equal(s.level, 3); assert.equal(s.seed, 4); assert.equal(s.optimal, 6);
});
test('bands rise with the level', () => {
  let prev = 0;
  for (let L = 1; L <= 12; L++) { const b = E.bandOf(L); assert.ok(b.min >= prev && b.max >= b.min && b.pMax >= b.pMin); prev = b.min; }
  assert.deepEqual(E.bandOf(1), { min: 3, max: 5, pMin: 4, pMax: 5 });
  assert.deepEqual(E.bandOf(5), { min: 8, max: 12, pMin: 8, pMax: 10 });
  assert.equal(E.bandOf(10).min, 15); assert.equal(E.bandOf(30).max, 25);
});
test('scoring: stars by moves vs optimal; פרוטות = (3 + 2×stars) × level', () => {
  assert.equal(E.stars(10, 10), 3); assert.equal(E.stars(12, 10), 3); assert.equal(E.stars(13, 10), 2); assert.equal(E.stars(15, 10), 2); assert.equal(E.stars(16, 10), 1);
  assert.equal(E.stars(4, 4), 3); assert.equal(E.stars(6, 4), 3); assert.equal(E.stars(7, 4), 1, '7 > 4×1.5');
  assert.equal(E.gain(3, 1), 9); assert.equal(E.gain(2, 1), 7); assert.equal(E.gain(1, 1), 5); assert.equal(E.gain(0, 1), 3);
  assert.equal(E.gain(3, 4), 36); assert.equal(E.gain(3, 25), 90, 'the level factor is capped at 10');
  assert.equal(E.hashSeed('pen', 2, 1), E.hashSeed('pen', 2, 1)); assert.notEqual(E.hashSeed('pen', 2, 1), E.hashSeed('pen', 2, 2));
});
