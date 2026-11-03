// ── build 76 ── stage 06 (שער ניקנור והמעלות) in the building loop (docs/specs/shlav-alef-olam-he.md §6 "06": "מסע הדלתות, מוט ויתדות,
// תלייה, 15 מעלות — המסע — החריג; השאר בשער — בית השער עולה עם הצוותים; המעלות אחת אחת"): one after another (the voyage, the lever,
// the leaves hung, the steps), with the loop's result shot and walk between them; crews.js's people at the work; the leaves and the hole
// by the works done. ?h76=0 one after another as before. GAME_BUILD 76. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { DEP63, open63 } from '../src/game/site63.js';
import { PARTS49 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 76: GAME_BUILD 76; stage 06\'s order — the voyage, the lever, the hanging, the steps, the reveal', () => {
  assert.equal(GAME_BUILD, 76);
  assert.deepEqual(Object.keys(DEP63.nikanor).sort(), PARTS49.filter((p) => p !== 'open' && p !== 'reveal').sort(), 'every work of the stage');
  assert.deepEqual(open63('nikanor', PARTS49, []), ['voyage']);
  assert.deepEqual(open63('nikanor', PARTS49, ['voyage']), ['lever']);
  assert.deepEqual(open63('nikanor', PARTS49, ['voyage', 'lever', 'hang']), ['steps']);
  assert.deepEqual(open63('nikanor', PARTS49, ['voyage', 'lever', 'hang', 'steps']), ['reveal']);
});

test('build 76 har42: wired — ON76 among the loop\'s stages; the leaves hung and the hole by the works done', () => {
  assert.match(H, /const ON76 = MODE === 'stage' && STG === 'nikanor' && qs\('h76'\) !== '0';/);
  assert.match(H, /const ONL73 = ON73 \|\| ON74 \|\| ON75 \|\| ON76( \|\| ON\d\d)*;/);
  assert.match(H, /const hung = STG === 'nikanor' && MODE === 'stage' && past63\('hang'\);/);
  assert.match(H, /hole49\(past63\('hang'\) \? 'steps' : 'door'\);/);
});

test('build 76: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/site63.js', 'src/game/har42.js', 'test/build76.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
