// build 127 (rule 65): moving stage 05's and stage 01's numbers into the book moves no place. tools/snap127.mjs prints every data
// export of h120, every act's stand (the plan's and the free units'), the routes, the frames, the chamber's floor and ways, the pack's
// shots, and what build 126's snapshot of stage 01 did not hold; test/h127-snapshot.json was recorded from build 126's final commit
// (fb94fd8) before any stage file changed. The running code must give the same file, number for number.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { snapshot } from '../tools/snap127.mjs';

test('stage 05 (and stage 01\'s rest): every place is where build 126 put it (the snapshot of fb94fd8)', async () => {
  const want = JSON.parse(readFileSync(new URL('./h127-snapshot.json', import.meta.url), 'utf8'));
  const got = JSON.parse(JSON.stringify(await snapshot()));
  for (const s of Object.keys(want)) for (const k of Object.keys(want[s])) assert.deepEqual(got[s][k], want[s][k], `${s} ${k}`);
  for (const s of Object.keys(got)) for (const k of Object.keys(got[s])) assert.ok(k in want[s], `${s} ${k}: new in the snapshot`);
});
