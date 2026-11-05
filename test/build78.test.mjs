// ── build 78 ── stage 08 (היסוד) in the building loop (docs/specs/shlav-alef-olam-he.md §6 "08": "בדיקה, אבני שדה, ציפורן, בלי ברזל —
// עמדת בדיקה לצד המזבח — כל אבן כשרה עולה ליסוד לנגד עיניו"): the first inspection first; the field stones, the nail's test and "no
// iron" side by side; the last row once the three are done; a result shot after each; crews.js's people at the work. ?h78=0 one after
// another as before. GAME_BUILD 78. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEP63, open63 } from '../src/game/site63.js';
import { PARTS55 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 78: GAME_BUILD 78; stage 08\'s order — the inspection, then three side by side, the last row, the reveal', () => {
  assert.ok(GAME_BUILD >= 78);
  assert.deepEqual(Object.keys(DEP63.yesod).sort(), PARTS55.filter((p) => p !== 'open' && p !== 'reveal').concat(['bench', 'course']).sort(), 'every work of the stage (build 103: and the new stage\'s two)');
  assert.deepEqual(open63('yesod', PARTS55, []), ['inspect']);
  assert.deepEqual(open63('yesod', PARTS55, ['inspect']), ['field', 'nail', 'iron']);
  assert.deepEqual(open63('yesod', PARTS55, ['inspect', 'field', 'nail', 'iron']), ['last']);
  assert.deepEqual(open63('yesod', PARTS55, ['inspect', 'field', 'nail', 'iron', 'last']), ['reveal']);
});

test('build 78 har42: wired — ON78 among the loop\'s stages', () => {
  assert.match(H, /const ON78 = MODE === 'stage' && STG === 'yesod' && qs\('h78'\) !== '0';/);
  assert.match(H, /const ONL73 = ON73 \|\| ON74 \|\| ON75 \|\| ON76 \|\| ON77 \|\| ON78( \|\| ON\d\d)*;/);
});

test('build 78: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/site63.js', 'src/game/har42.js', 'test/build78.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
