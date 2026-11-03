// ── build 80 ── stage 10 (גוף המזבח והכבש) in the building loop (docs/specs/shlav-alef-olam-he.md §6: "בדיקה עם הטעיות, שיפוע, סיד — לצד המזבח; הכבש בדרום — המזבח לגובהו, הכבש מתארך, הסיד נשאר לבן"): the check with its decoys and the ramp side by side; the lime after both; a result shot after each;
// crews.js's people at the work. ?h80=0 one after another as before. GAME_BUILD 80. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEP63, open63 } from '../src/game/site63.js';
import { PARTS57 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 80: GAME_BUILD 80; the stage\'s order', () => {
  assert.ok(GAME_BUILD >= 80);
  assert.deepEqual(Object.keys(DEP63.guf).sort(), PARTS57.filter((p) => p !== 'open' && p !== 'reveal').sort(), 'every work of the stage');
  assert.deepEqual(open63('guf', PARTS57, []), ['decoy', 'kevesh']);
  assert.deepEqual(open63('guf', PARTS57, ['decoy', 'kevesh']), ['sid']);
  assert.deepEqual(open63('guf', PARTS57, PARTS57.filter((p) => p !== 'open' && p !== 'reveal')), ['reveal']);
});

test('build 80 har42: wired — ON80 among the loop\'s stages', () => {
  assert.match(H, /const ON80 = MODE === 'stage' && STG === 'guf' && qs\('h80'\) !== '0';/);
  assert.match(H, /const ONL73 = ON73( \|\| ON\d\d)* \|\| ON80( \|\| ON\d\d)*;/);
});

test('build 80: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/site63.js', 'src/game/har42.js', 'test/build80.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
