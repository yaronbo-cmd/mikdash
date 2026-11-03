// ── build 75 ── stage 05 (עזרת הנשים) in the building loop (docs/specs/shlav-alef-olam-he.md §6 "05": "מיון עצים, קורות הגזוזטרא, יתדות,
// פינה — לשכת העצים שבפינה; הקיר עצמו — הגזוזטרא מתארכת"): the wood's sorting and the gallery's beams open side by side; the pegs in
// the beams; the corner after the pegs; the walk on the gallery once its corner is closed; a result shot after each; crews.js's people at
// the work; the court's share by the works done. ?h75=0 one after another as before. GAME_BUILD 75. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEP63, open63 } from '../src/game/site63.js';
import { PARTS48 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 75: GAME_BUILD 75; stage 05\'s order — the wood and the beams first, then the pegs, the corner, the walk, the reveal', () => {
  assert.equal(GAME_BUILD, 75);
  assert.deepEqual(Object.keys(DEP63.nashim).sort(), PARTS48.filter((p) => p !== 'open' && p !== 'reveal').sort(), 'every work of the stage');
  assert.deepEqual(open63('nashim', PARTS48, []), ['wood', 'beams']);
  assert.deepEqual(open63('nashim', PARTS48, ['beams']), ['wood', 'pegs']);
  assert.deepEqual(open63('nashim', PARTS48, ['wood', 'beams', 'pegs', 'corner']), ['walk']);
  assert.deepEqual(open63('nashim', PARTS48, ['wood', 'beams', 'pegs', 'corner', 'walk']), ['reveal']);
});

test('build 75 har42: wired — ON75 among the loop\'s stages; the court\'s share by the works done', () => {
  assert.match(H, /const ON75 = MODE === 'stage' && STG === 'nashim' && qs\('h75'\) !== '0';/);
  assert.match(H, /const ONL73 = ON73 \|\| ON74 \|\| ON75( \|\| ON\d\d)*;/);
  assert.match(H, /stages\.setStage\('nashim', 'building', Math\.max\(0\.3, Math\.min\(0\.62, ON75 \? n63\(\) \/ \(PARTS\.length - 2\) : \(R\.part - 1\) \/ \(PARTS\.length - 1\)\)\)/);
});

test('build 75: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/site63.js', 'src/game/har42.js', 'test/build75.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
