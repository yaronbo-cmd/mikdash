// build 128 (B1): an act that ends with a point of its own screen (the sea: res.at = { sx, sy }, its own camera) must not aim the
// world's pull-back at it. The screen point taken as a world point gave the pull-back the aim (undefined, undefined, z): the world
// camera went NaN under the sea, and every later shot eased from that NaN (the caravan, the capstan and the rest drew nothing).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { endAt } from '../src/game/h109/director.js';

test('the end of an act: a screen point stands for the stars only; the pull-back takes a world point', () => {
  const gate = { x: 134, y: 8, z: 0 };
  // the sea's ending: its own screen point, the act's at() the court's east gate
  let E = endAt({ sx: 412, sy: 260 }, gate);
  assert.deepEqual(E.world, gate); assert.deepEqual(E.stars, { x: 412, y: 260 });
  // a screen point and no world point at all: no pull-back aim (the director then aims at the kohen), never a NaN one
  E = endAt({ sx: 412, sy: 260 }, null);
  assert.equal(E.world, null); assert.deepEqual(E.stars, { x: 412, y: 260 });
  // a world point given by the act wins over its at()
  E = endAt({ x: 1, y: 2, z: 3 }, gate);
  assert.deepEqual(E.world, { x: 1, y: 2, z: 3 }); assert.deepEqual(E.stars, { x: 1, y: 2, z: 3 });
  // nothing given: the act's at()
  E = endAt(undefined, gate); assert.deepEqual(E.world, gate);
  // a point with a hole in it is no place
  E = endAt({ x: NaN, y: 2, z: 3 }, null); assert.equal(E.world, null); assert.equal(E.stars, null);
});

