// ── build 82 ── stage 12 (הכיור) in the building loop (docs/specs/shlav-alef-olam-he.md §6: "יציקה, 12 דדים, הברגה, מוכני"): the cast first; the spigots and the wheel (מוכני) side by side after it; the screw after the spigots; a result shot after each;
// crews.js's people at the work. ?h82=0 one after another as before. GAME_BUILD 82. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEP63, open63 } from '../src/game/site63.js';
import { PARTS59 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 82: GAME_BUILD 82; the stage\'s order', () => {
  assert.equal(GAME_BUILD, 82);
  assert.deepEqual(Object.keys(DEP63.kiyor).sort(), PARTS59.filter((p) => p !== 'open' && p !== 'reveal').sort(), 'every work of the stage');
  assert.deepEqual(open63('kiyor', PARTS59, []), ['cast']);
  assert.deepEqual(open63('kiyor', PARTS59, ['cast']).sort(), ['mukhni', 'spigots']);
  assert.deepEqual(open63('kiyor', PARTS59, ['cast', 'spigots']).sort(), ['mukhni', 'screw']);
  assert.deepEqual(open63('kiyor', PARTS59, PARTS59.filter((p) => p !== 'open' && p !== 'reveal')), ['reveal']);
});

test('build 82 har42: wired — ON82 among the loop\'s stages', () => {
  assert.match(H, /const ON82 = MODE === 'stage' && STG === 'kiyor' && qs\('h82'\) !== '0';/);
  assert.match(H, /const ONL73 = ON73( \|\| ON\d\d)* \|\| ON82( \|\| ON\d\d)*;/);
});

test('build 82: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/site63.js', 'src/game/har42.js', 'test/build82.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
