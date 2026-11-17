// build 130: a finger holding a thing that is put away lets go of it (h113/acts.js fingers().letGo) — the light station's taper,
// removed once the wick is lit, no longer receives the moves of a mouse still pressed (the PC run's caught warning at the end card)
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fingers } from '../src/game/h113/acts.js';

test('fingers: letGo drops the held kind from every finger on it, and the later moves carry no hold', () => {
  const seen = [];
  const FG = fingers({}, { down(f) { if (f.id === 1) f.k = 'taper'; if (f.id === 2) f.k = 'jar'; }, move(f) { seen.push([f.id, f.k]); } });
  FG.down({ id: 1, x: 10, y: 10 }); FG.down({ id: 2, x: 50, y: 50 });
  FG.move({ id: 1, x: 12, y: 12 });
  assert.deepEqual(seen.pop(), [1, 'taper']);
  assert.equal(FG.letGo('taper'), 1);
  FG.move({ id: 1, x: 20, y: 20 }); FG.move({ id: 2, x: 52, y: 52 });
  assert.deepEqual(seen, [[1, null], [2, 'jar']], 'the taper finger holds nothing; the jar finger keeps its jar');
  assert.equal(FG.letGo('taper'), 0);
});
