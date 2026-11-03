// ── build 81 ── stage 11 (הקרנות) in the building loop (docs/specs/shlav-alef-olam-he.md §6: "ארבע קרנות, שני נקבים, האש — על ראש המזבח — הקרנות; האש ועמוד העשן נראים מכל ההר"): the horns and the holes side by side; the fire after both; a result shot after each;
// crews.js's people at the work. ?h81=0 one after another as before. GAME_BUILD 81. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEP63, open63 } from '../src/game/site63.js';
import { PARTS58 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 81: GAME_BUILD 81; the stage\'s order', () => {
  assert.equal(GAME_BUILD, 81);
  assert.deepEqual(Object.keys(DEP63.karnot).sort(), PARTS58.filter((p) => p !== 'open' && p !== 'reveal').sort(), 'every work of the stage');
  assert.deepEqual(open63('karnot', PARTS58, []), ['horns', 'holes']);
  assert.deepEqual(open63('karnot', PARTS58, ['horns', 'holes']), ['fire']);
  assert.deepEqual(open63('karnot', PARTS58, PARTS58.filter((p) => p !== 'open' && p !== 'reveal')), ['reveal']);
});

test('build 81 har42: wired — ON81 among the loop\'s stages', () => {
  assert.match(H, /const ON81 = MODE === 'stage' && STG === 'karnot' && qs\('h81'\) !== '0';/);
  assert.match(H, /const ONL73 = ON73( \|\| ON\d\d)* \|\| ON81( \|\| ON\d\d)*;/);
});

test('build 81: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/site63.js', 'src/game/har42.js', 'test/build81.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
