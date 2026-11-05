// ── build 77 ── stage 07 (הלשכות) in the building loop (docs/specs/shlav-alef-olam-he.md §6 "07": "מחוגה, ספסלים, הגלגל מעל הבור,
// הכיפה — בתוך כל לשכה, שקירותיה עולים בשלב — שלוש לשכות שנבנות מול העיניים"): the three chambers' first works open side by side (the
// compass, the hub, the dome), each chamber's next after its first (the benches, the buckets' wheel); a result shot after each; crews.js's
// people at the work. ?h77=0 one after another as before. GAME_BUILD 77. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEP63, open63 } from '../src/game/site63.js';
import { PARTS102 as PARTS50 } from '../src/game/lish102.js';   // (build 102: stage 07's parts)
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 77: GAME_BUILD 77; stage 07\'s order — three chambers side by side, each one\'s second work after its first, then the reveal', () => {
  assert.ok(GAME_BUILD >= 77);
  assert.deepEqual(Object.keys(DEP63.lishka).sort(), PARTS50.filter((p) => p !== 'open' && p !== 'reveal').sort(), 'every work of the stage');
  assert.deepEqual(open63('lishka', PARTS50, []), ['compass', 'wheel', 'dome']);
  assert.deepEqual(open63('lishka', PARTS50, ['compass']), ['wheel', 'dome']);
  assert.deepEqual(open63('lishka', PARTS50, ['compass', 'wheel', 'dome']), ['reveal']);
});

test('build 77 har42: wired — ON77 among the loop\'s stages', () => {
  assert.match(H, /const ON77 = MODE === 'stage' && STG === 'lishka' && qs\('h77'\) !== '0';/);
  assert.match(H, /const ONL73 = ON73 \|\| ON74 \|\| ON75 \|\| ON76 \|\| ON77( \|\| ON\d\d)*;/);
});

test('build 77: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/site63.js', 'src/game/har42.js', 'test/build77.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
