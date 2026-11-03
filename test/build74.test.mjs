// ── build 74 ── stage 04 (שערי העזרה) in the building loop (docs/specs/shlav-alef-olam-he.md §6 "04": "משקוף בשני מנופים, כנף על ציר,
// שמות — בפתחים שהוא השאיר בחומה — כל שער מקבל משקוף וכנפיים במקומו"): the lintel and the gates' names open side by side; the two
// leaves once the lintel is up; a result shot after each; crews.js's people at the work; the gatehouse's share by the works done.
// ?h74=0 one after another as before. GAME_BUILD 74. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEP63, open63 } from '../src/game/site63.js';
import { PARTS47 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 74: GAME_BUILD 74; stage 04\'s order — the lintel and the names first, the leaves after the lintel, then the reveal', () => {
  assert.equal(GAME_BUILD, 74);
  assert.deepEqual(Object.keys(DEP63.gates).sort(), PARTS47.filter((p) => p !== 'open' && p !== 'reveal').sort(), 'every work of the stage');
  assert.deepEqual(open63('gates', PARTS47, []), ['lintel', 'names']);
  assert.deepEqual(open63('gates', PARTS47, ['lintel']), ['leaf', 'leaf7', 'names']);
  assert.deepEqual(open63('gates', PARTS47, ['lintel', 'leaf', 'leaf7', 'names']), ['reveal']);
});

test('build 74 har42: wired — ON74 among the loop\'s stages; the gatehouse\'s share by the works done', () => {
  assert.match(H, /const ON74 = MODE === 'stage' && STG === 'gates' && qs\('h74'\) !== '0';/);
  assert.match(H, /const ONL73 = ON73 \|\| ON74;/);
  assert.match(H, /stages\.setStage\('gates', 'building', Math\.max\(0\.04, Math\.min\(0\.92, ON74 \? n63\(\) \/ \(PARTS\.length - 2\) : \(R\.part - 1\) \/ \(PARTS\.length - 1\)\)\), \{ instant: true \}\);/);
});

test('build 74: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/site63.js', 'src/game/har42.js', 'test/build74.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
