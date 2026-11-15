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
test('stage 06: with the sea in play a fresh stage starts at the sea; an old save of the crews\' sea plays it again or keeps it', async () => {
  const { createStage06, seaSkip, SEA_IN_PLAY } = await import('../src/game/h128/pack.js');
  const { createH128 } = await import('../src/game/h128/model.js');
  assert.equal(SEA_IN_PLAY, true);
  assert.deepEqual(createStage06(null).open().map((m) => m.id), ['sea1']);
  // a save made while the sea was out of play, at the capstan: the sea plays from its start
  const a = seaSkip(createH128(null)).st, A = createStage06(JSON.parse(JSON.stringify(a)));
  assert.deepEqual(A.open().map((m) => m.id), ['sea1']); assert.equal(A.st.seaSkip, undefined); assert.equal(A.nDone(), 0);
  // one past the capstan keeps everything: the sea stays the crews' (0 points), open to play again, sea1 first
  const b = seaSkip(createH128(null)); b.pick('capstan'); b.done({ stars: 3, pts: 40 }); b.pick('ring1'); b.done({ stars: 2, pts: 20 });
  const B = createStage06(JSON.parse(JSON.stringify(b.st)));
  assert.ok(B.isDone('capstan') && B.isDone('ring1') && B.isDone('sea1'));
  assert.equal(B.st.res.sea1.pts, 0); assert.equal(B.st.res.capstan.pts, 40);
  assert.deepEqual(B.open().filter((m) => m.id.startsWith('sea')).map((m) => m.id), ['sea1']);
  B.pick('sea1'); B.done({ stars: 3, pts: 40 });
  assert.deepEqual(B.open().filter((m) => m.id.startsWith('sea')).map((m) => m.id), ['sea2']);
  assert.equal(B.st.res.sea1.skip, undefined); assert.equal(B.nDone(), 5);
});
