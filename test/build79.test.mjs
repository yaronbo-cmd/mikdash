// ── build 79 ── stage 09 (הסובב וחוט הסיקרא) in the building loop (docs/specs/shlav-alef-olam-he.md §6: "אור צד, הקשה, החוט — על המזבח בגובה היסוד — הסובב עולה; הקו האדום נשאר"): the side light and the tap side by side; the sovev once both are done; the red line last; a result shot after each;
// crews.js's people at the work. ?h79=0 one after another as before. GAME_BUILD 79. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEP63, open63 } from '../src/game/site63.js';
import { PARTS56 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 79: GAME_BUILD 79; the stage\'s order', () => {
  assert.ok(GAME_BUILD >= 79);
  assert.deepEqual(Object.keys(DEP63.sovev).sort(), PARTS56.filter((p) => p !== 'open' && p !== 'reveal').concat(['plumb', 'sikra']).sort(), 'every work of the stage (build 104: its two acts too)');
  assert.deepEqual(open63('sovev', PARTS56, []), ['light', 'tap']);
  assert.deepEqual(open63('sovev', PARTS56, ['light', 'tap']), ['sovev']);
  assert.deepEqual(open63('sovev', PARTS56, ['light', 'tap', 'sovev']), ['thread']);
  assert.deepEqual(open63('sovev', PARTS56, PARTS56.filter((p) => p !== 'open' && p !== 'reveal')), ['reveal']);
});

test('build 79 har42: wired — ON79 among the loop\'s stages', () => {
  assert.match(H, /const ON79 = MODE === 'stage' && STG === 'sovev' && qs\('h79'\) !== '0';/);
  assert.match(H, /const ONL73 = ON73( \|\| ON\d\d)* \|\| ON79( \|\| ON\d\d)*;/);
});

test('build 79: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/site63.js', 'src/game/har42.js', 'test/build79.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
