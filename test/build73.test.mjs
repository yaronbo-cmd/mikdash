// ── build 73 ── stage 03 (הסורג והחיל) in the building loop (docs/specs/shlav-alef-olam-he.md §6 "03": "לוחות סריג, אבני האזהרה,
// ההשתחוויות — בחיל, סביב החומה שהוא בנה — הסורג נסגר לוח אחרי לוח"): its works open side by side on the site (the first panel and the
// warning stones; each panel after the one beside it; the bows once the soreg is closed and the warning stands), a result shot after each,
// crews.js's people at the work; the soreg's share by the works done. ?h73=0 one after another as before. GAME_BUILD 73. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEP63, open63 } from '../src/game/site63.js';
import { PARTS46 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 73: GAME_BUILD 73; stage 03\'s order — two works open at the start, the panels one after another, the bows last, then the reveal', () => {
  assert.ok(GAME_BUILD >= 73);
  assert.deepEqual(Object.keys(DEP63.soreg).sort(), PARTS46.filter((p) => p !== 'open' && p !== 'reveal').sort(), 'every work of the stage');
  assert.deepEqual(open63('soreg', PARTS46, []), ['lattice0', 'warn']);
  assert.deepEqual(open63('soreg', PARTS46, ['lattice0']), ['lattice1', 'warn']);
  assert.deepEqual(open63('soreg', PARTS46, ['lattice0', 'lattice1', 'lattice2']), ['warn'], 'the bows wait for the warning stones');
  assert.deepEqual(open63('soreg', PARTS46, ['lattice0', 'lattice1', 'lattice2', 'warn']), ['bows']);
  assert.deepEqual(open63('soreg', PARTS46, ['lattice0', 'lattice1', 'lattice2', 'warn', 'bows']), ['reveal']);
});

test('build 73 har42: wired — ON73 in the loop and the crews; the soreg\'s share by the works done; he starts where he stood', () => {
  assert.match(H, /const ON73 = MODE === 'stage' && STG === 'soreg' && qs\('h73'\) !== '0';/);
  assert.match(H, /const ONL73 = ON73 \|\| ON74( \|\| ON\d\d)*;/); assert.match(H, /const ON63 = MODE === 'stage' && \(ON62 \|\| STG === 'wall' \|\| ONL73\) && qs\('h63'\) !== '0' && !!DEP63\[STG\];/);
  assert.match(H, /const ON65 = MODE === 'stage' && \(ON62 \|\| STG === 'wall' \|\| ONL73\) && qs\('h65'\) !== '0';/);
  assert.match(H, /ONL73 \? wShare63\(part\) : \(PARTS\.indexOf\(part\) \+ 1\) \/ \(PARTS\.length - 1\)/);
  assert.match(H, /ON73 \? n63\(\) \/ \(PARTS\.length - 2\) : \(R\.part - 1\) \/ \(PARTS\.length - 1\)/);
  assert.match(H, /\(STG === 'wall' \|\| ON62 \|\| ONL73\) \? at61\(W61, STG\)/);
});

test('build 73 crew71: a man in the camera\'s lap is not drawn (the warning stones\' view stood among a crew)', () => {
  const C = read('src/crew71.js');
  assert.match(C, /clear: 7,/);
  const Ac = read('src/actors.js'); assert.match(Ac, /export const NEAR73 = 9;/); assert.match(Ac, /const near73 = camera && globalThis\.__H42 && globalThis\.__H42\.on \? NEAR73 : 0;/); assert.match(Ac, /if \(near73 && \(a\.x - cx\) \*\* 2 \+ \(a\.z - cz\) \*\* 2 < near73 \* near73 && cy - a\.y < 7\) continue;/);
  assert.match(C, /f\.m\.visible = Math\.hypot\(c\.x - camera\.position\.x, c\.z - camera\.position\.z\) >= CREW71\.clear;/);
});

test('build 73: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/site63.js', 'src/game/har42.js', 'src/crew71.js', 'test/build73.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
