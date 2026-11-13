// build 126 (rule 65): moving the stages' numbers into the book moves no place. tools/snap126.mjs prints every exported table, every
// act's stand for every mission and the frames of stages 01–04; test/h126-snapshot.json was recorded from build 125's final commit
// (0b55bca) before any stage file changed. The running code must give the same file, number for number.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { snapshot } from '../tools/snap126.mjs';

test('stages 01–04: every place is where build 125 put it (the snapshot of 0b55bca)', async () => {
  const want = JSON.parse(readFileSync(new URL('./h126-snapshot.json', import.meta.url), 'utf8'));
  const got = JSON.parse(JSON.stringify(await snapshot()));
  for (const s of Object.keys(want)) for (const k of Object.keys(want[s])) assert.deepEqual(got[s][k], want[s][k], `${s} ${k}`);
  for (const s of Object.keys(got)) for (const k of Object.keys(got[s])) assert.ok(k in want[s], `${s} ${k}: new in the snapshot`);
});
