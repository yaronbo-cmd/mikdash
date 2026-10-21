// "זיכרון המקדש" — the memory tile-flip engine (node --test test/tiles.test.mjs). Pure: no DOM.
import test from 'node:test';
import assert from 'node:assert/strict';
import * as E from '../src/tiles/engine.js';

const pairOf = (s) => { const by = {}; s.tiles.forEach((t, i) => { if (!t.done) (by[t.pic] = by[t.pic] || []).push(i); }); return Object.values(by).find((v) => v.length === 2); };
const missPair = (s) => { const a = s.tiles.findIndex((t) => !t.done); const b = s.tiles.findIndex((t, i) => !t.done && i !== a && t.pic !== s.tiles[a].pic); return [a, b]; };
const match = (s) => { const [a, b] = pairOf(s); const r1 = E.flip(s, a); assert.equal(r1.ev, 'flip'); const r2 = E.flip(r1.s, b); assert.equal(r2.ev, 'match'); return r2; };
const miss = (s) => { const [a, b] = missPair(s); const r = E.flip(E.flip(s, a).s, b); assert.equal(r.ev, 'miss'); return r; };

test('deal: the grid and the pair count per level', () => {
  const want = { 1: [4, 3], 2: [5, 4], 3: [6, 4], 4: [6, 5], 5: [6, 5], 9: [6, 5] };
  for (const [L, [c, r]] of Object.entries(want)) {
    const s = E.deal(+L, 11);
    assert.equal(s.cols, c); assert.equal(s.rows, r); assert.equal(s.n, c * r); assert.equal(s.tiles.length, c * r);
    assert.equal(s.pairs, (c * r) / 2);
    const by = {}; for (const t of s.tiles) by[t.pic] = (by[t.pic] || 0) + 1;
    assert.ok(Object.values(by).every((n) => n === 2), 'every picture exactly twice');
    assert.ok(Object.keys(by).every((p) => E.PICS.includes(p) && E.PIC_HE[p]));
    assert.ok(s.tiles.every((t) => !t.up && !t.done));
  }
});
test('deal: connected pairs (a picture and its name card) from level 3 only', () => {
  const names = (s) => s.tiles.filter((t) => t.kind === 'name').length;
  assert.equal(names(E.deal(1, 3)), 0); assert.equal(names(E.deal(2, 3)), 0);
  assert.equal(names(E.deal(3, 3)), E.connectedOf(3, 12)); assert.ok(names(E.deal(3, 3)) >= 3);
  assert.equal(names(E.deal(4, 3)), 7); assert.equal(names(E.deal(5, 3)), 10);
  const s = E.deal(4, 5);
  for (const t of s.tiles) if (t.kind === 'name') assert.ok(s.tiles.some((u) => u !== t && u.pic === t.pic && u.kind === 'pic'), 'a name card pairs with a picture');
});
test('deal: deterministic by seed; another seed, another board', () => {
  assert.deepEqual(E.deal(3, 42), E.deal(3, 42));
  const a = E.deal(3, 42), b = E.deal(3, 43);
  assert.notEqual(JSON.stringify(a.tiles), JSON.stringify(b.tiles));
  assert.equal(E.hashSeed('tiles', 2, 1), E.hashSeed('tiles', 2, 1));
  assert.notEqual(E.hashSeed('tiles', 2, 1), E.hashSeed('tiles', 2, 2));
});
test('flip: a first tile, a match, a miss that settles; states are never mutated', () => {
  const s0 = E.deal(1, 7);
  const json = JSON.stringify(s0);
  const r = match(s0);
  assert.equal(JSON.stringify(s0), json, 'the old state is untouched');
  assert.equal(r.s.matches, 1); assert.equal(r.s.streak, 1); assert.equal(r.s.open.length, 0);
  assert.ok(r.s.tiles[r.a].done && r.s.tiles[r.b].done && r.s.tiles[r.a].up);
  assert.equal(r.gain, E.gain(1, 1)); assert.equal(r.s.perutot, 2);
  // a miss keeps both face up until settle()
  const m = miss(r.s);
  assert.equal(m.s.misses, 1); assert.equal(m.s.streak, 0); assert.deepEqual(m.s.pending, [m.a, m.b]);
  assert.ok(m.s.tiles[m.a].up && m.s.tiles[m.b].up);
  assert.equal(E.flip(m.s, pairOf(m.s)[0]).ev, 'noop', 'no flip while a miss is showing');
  const t = E.settle(m.s);
  assert.ok(!t.tiles[m.a].up && !t.tiles[m.b].up && !t.pending && t.open.length === 0);
  assert.equal(E.settle(t), t, 'settle with nothing pending is a no-op');
  // taps that do nothing
  assert.equal(E.flip(t, -1).ev, 'noop'); assert.equal(E.flip(t, 99).ev, 'noop');
  assert.equal(E.flip(t, r.a).ev, 'noop', 'a matched tile does not flip');
  const one = E.flip(t, pairOf(t)[0]).s; assert.equal(E.flip(one, one.open[0]).ev, 'noop', 'the same tile twice is a no-op');
});
test('scoring: +2 a pair, +5 from a streak of 2, × level; the streak breaks on a miss', () => {
  assert.equal(E.gain(1, 1), 2); assert.equal(E.gain(2, 1), 7); assert.equal(E.gain(3, 4), 28);
  let s = E.deal(2, 9);
  s = match(s).s; assert.equal(s.perutot, 4);
  s = match(s).s; assert.equal(s.perutot, 4 + 14); assert.equal(s.streak, 2);
  s = E.settle(miss(s).s); assert.equal(s.streak, 0); assert.equal(s.bestStreak, 2);
  s = match(s).s; assert.equal(s.perutot, 18 + 4);
});
test('undo: one per round, cancels the last miss and restores the streak; returns the pair for a peek', () => {
  let s = E.deal(1, 5);
  assert.equal(E.undo(s).pair, null, 'nothing to undo');
  s = match(s).s; s = match(s).s;
  const m = miss(s).s;
  const u = E.undo(m);
  assert.ok(Array.isArray(u.pair) && u.pair.length === 2);
  assert.equal(u.s.misses, 0); assert.equal(u.s.streak, 2); assert.equal(u.s.undos, 0); assert.equal(u.s.last, null);
  assert.ok(!u.s.tiles[u.pair[0]].up && !u.s.pending, 'the missed tiles are face down again');
  const m2 = E.settle(miss(u.s).s);
  assert.equal(E.undo(m2).pair, null, 'the one undo is spent'); assert.equal(E.undo(m2).s, m2);
});
test('hint: two tiles that match, two a round, never a matched one', () => {
  let s = E.deal(2, 3);
  const h1 = E.hint(s);
  assert.ok(h1.pair && h1.pair.length === 2 && s.tiles[h1.pair[0]].pic === s.tiles[h1.pair[1]].pic && h1.pair[0] !== h1.pair[1]);
  assert.equal(h1.s.hints, 1);
  s = match(h1.s).s;
  const h2 = E.hint(s);
  assert.ok(h2.pair && !s.tiles[h2.pair[0]].done && !s.tiles[h2.pair[1]].done);
  assert.equal(h2.s.hints, 0);
  assert.equal(E.hint(h2.s).pair, null);
  // with one tile open the hint prefers another pair
  const o = E.flip(s, pairOf(s)[0]).s; const o2 = Object.assign({}, o, { hints: 1 });
  const h3 = E.hint(o2); assert.ok(h3.pair && !h3.pair.includes(o.open[0]));
});
test('shuffle: the unmatched set is the same, the matched tiles stay put, open tiles go down', () => {
  let s = E.deal(3, 8);
  s = match(s).s; s = match(s).s;
  s = E.flip(s, pairOf(s)[0]).s;
  const before = s.tiles.map((t, i) => (t.done ? `${i}:${t.pic}:${t.kind}` : null)).filter(Boolean);
  const key = (t) => `${t.pic}:${t.kind}`;
  const setBefore = s.tiles.filter((t) => !t.done).map(key).sort();
  const z = E.shuffle(s);
  assert.deepEqual(z.tiles.map((t, i) => (t.done ? `${i}:${t.pic}:${t.kind}` : null)).filter(Boolean), before);
  assert.deepEqual(z.tiles.filter((t) => !t.done).map(key).sort(), setBefore);
  assert.ok(z.tiles.every((t) => t.done || !t.up)); assert.equal(z.open.length, 0);
  assert.notEqual(JSON.stringify(z.tiles), JSON.stringify(s.tiles), 'something moved');
  assert.deepEqual(E.shuffle(s), z, 'deterministic');
  assert.equal(z.misses, s.misses); assert.equal(z.perutot, s.perutot);
});
test('win: all pairs matched; stars by misses and time; the clock is generous', () => {
  let s = E.deal(1, 2);
  for (let q = 0; q < 6; q++) { assert.ok(!E.isWon(s)); s = match(s).s; }
  assert.ok(E.isWon(s) && s.won);
  assert.equal(E.flip(s, 0).ev, 'noop');
  assert.equal(E.stars(s, 10000), 3);
  assert.equal(E.stars(s, s.limit * 0.9), 2);
  assert.equal(E.stars(s, s.limit * 2), 1);
  const bad = Object.assign({}, s, { misses: 12 }); assert.equal(E.stars(bad, 1000), 1);
  const ok = Object.assign({}, s, { misses: 6 }); assert.equal(E.stars(ok, 1000), 2);
  assert.equal(E.stars(E.deal(1, 2), 1000), 0);
  assert.equal(E.timeLimit(1), 74000); assert.equal(E.timeLimit(4), 155000);
  assert.equal(E.fmtTime(74000), '1:14'); assert.equal(E.fmtTime(0), '0:00');
});
test('every picture has a Hebrew name and 16 pictures cover the biggest board', () => {
  assert.equal(E.PICS.length, 16);
  for (const p of E.PICS) assert.ok(E.PIC_HE[p] && E.PIC_HE[p].length >= 2);
  assert.ok(E.gridOf(4).pairs <= E.PICS.length);
});
