// build 128: stage 06's exports held to their snapshot (tools/snap128.mjs writes test/h128-snapshot.json): a later build that moves a
// stand, a camera, a table or the sea's flag must mean it and regenerate the snapshot.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { snap128 } from '../tools/snap128.mjs';

test('stage 06: the exports as the snapshot holds them', async () => {
  const want = JSON.parse(readFileSync(new URL('./h128-snapshot.json', import.meta.url), 'utf8'));
  const got = JSON.parse(JSON.stringify(await snap128()));
  for (const k of Object.keys(want)) assert.deepEqual(got[k], want[k], k);
  assert.deepEqual(Object.keys(got).sort(), Object.keys(want).sort());
});
test('stage 06: while the sea is out of play the stage starts at the capstan', async () => {
  const { createStage06, SEA_IN_PLAY } = await import('../src/game/h128/pack.js');
  if (SEA_IN_PLAY) return;
  const M = createStage06(null);
  assert.deepEqual(M.open().map((m) => m.id), ['capstan']);
  for (const id of ['sea1', 'sea2', 'sea3']) assert.equal(M.st.res[id].skip, 1);
});
