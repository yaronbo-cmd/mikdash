// ── build 83 ── stage 13 (האולם) in the building loop (docs/specs/shlav-alef-olam-he.md §6: "גלי הים, נדבכים ופינה, מלתראות, הגפן"): one after another as the façade rises: the waves' courses, the courses, the lintels, the fifth, the vine; a result shot after each;
// crews.js's people at the work. ?h83=0 one after another as before. GAME_BUILD 83. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEP63, open63 } from '../src/game/site63.js';
import { PARTS60 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 83: GAME_BUILD 83; the stage\'s order', () => {
  assert.equal(GAME_BUILD, 84);
  assert.deepEqual(Object.keys(DEP63.ulam).sort(), PARTS60.filter((p) => p !== 'open' && p !== 'reveal').sort(), 'every work of the stage');
  assert.deepEqual(open63('ulam', PARTS60, []), ['waves']);
  assert.deepEqual(open63('ulam', PARTS60, ['waves', 'courses']), ['lintels']);
  assert.deepEqual(open63('ulam', PARTS60, ['waves', 'courses', 'lintels', 'fifth']), ['vine']);
  assert.deepEqual(open63('ulam', PARTS60, PARTS60.filter((p) => p !== 'open' && p !== 'reveal')), ['reveal']);
});

test('build 83 har42: wired — ON83 among the loop\'s stages', () => {
  assert.match(H, /const ON83 = MODE === 'stage' && STG === 'ulam' && qs\('h83'\) !== '0';/);
  assert.match(H, /const ONL73 = ON73( \|\| ON\d\d)* \|\| ON83( \|\| ON\d\d)*;/);
});

test('build 83: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/site63.js', 'src/game/har42.js', 'test/build83.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});

test('build 83 har42: the Ulam\'s world by the works done, not by R.part', () => {
  assert.match(H, /const done = past63\('courses'\) \? 3 : past63\('waves'\) \? 1 : 0;/);
  assert.match(H, /const n0 = past63\('lintels'\) \? 4 : 0;/);
  assert.match(H, /world60\(ON83 \? \(PARTS60\.find\(\(q\) => q !== 'open' && q !== 'reveal' && !past63\(q\)\) \|\| 'reveal'\) : PARTS60\[R\.part\] \|\| 'open'\)/);
});
