// ── build 72 ── the giant stone on the station's own rig, and the inscription "לבית התקיעה" carved in the parapet stone as he traces it
// (the plan told the owner 2.11: "72: המנוף של אבן הענק בתחנה, וסימון 'לבית התקיעה' על האבן בעולם"). har42.js: mkCorner's giant
// part slides the crane68 rig to the giant's place, its arm over the course, the hook on the stone while it comes down, then up; the rig
// back to his stretch at the act's end. insc72: a canvas plane on the parapet's face, shown from its right end as the dots are traced,
// whole for good once the trace is done. The words: ב. מזר, 1968 (the stone: the Israel Museum). GAME_BUILD 72. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 72: GAME_BUILD (72 or later)', () => { assert.ok(GAME_BUILD >= 72); });

test('build 72 har42: the giant comes down on the station\'s rig — the rig to the giant, the arm over the course, the hook on the stone, then up; back at the end', () => {
  assert.match(H, /const K8g = ON68 && part === 'giant' \? crane68\(\) : null;/);
  assert.match(H, /if \(K8g\) \{ K8g\.G8\.position\.x = S0\.x; armTo68\(0\); \}/, 'the rig slides to the giant, its arm in');
  assert.match(H, /if \(K8g\) \{ const top = yy \+ 0\.95; if \(lowT < 1\.6\) hookTo72\(top\);/, 'the hook on the stone while it comes down');
  assert.match(H, /if \(K8g\) \{ K8g\.G8\.position\.x = PL\.pulley\.x; armTo68\(Math\.PI\); unhook68\(null\);/, 'the rig back to his stretch, the arm out');
});

test('build 72 har42: the inscription — its words, on the parapet\'s face, carved as he traces, whole once traced, cleared on a restart', () => {
  assert.match(H, /const INSC72 = 'לבית התקיעה';/);
  assert.match(H, /function insc72\(stone, k\) \{/);
  assert.match(H, /try \{ insc72\(st\.props\.parapet, past63\('trace'\) \? 1 : 0\); \}/, 'there for good once traced');
  assert.match(H, /hit\+\+; lastT = now\(\); buzz42\('tick'\); try \{ insc72\(st\.props\.parapet, hit \/ N\); \}/, 'carved dot by dot');
  assert.match(H, /hit = 0; try \{ insc72\(st\.props\.parapet, 0\); \}/, 'a restart clears it');
  assert.match(H, /x\.rect\(cv\.width \* \(1 - k\), 0, cv\.width \* k, cv\.height\); x\.clip\(\);/, 'from its right end (Hebrew reads right to left)');
  assert.match(H, /m2\.rotation\.y = Math\.PI; m2\.position\.set\(0, 0, -1\.114\); m\.add\(m2\);/, 'the same letters on its other face');
});

test('build 72 har42: the trace macro sees the stone — the first clear line (the Mount\'s built stones stood in the old one), the dots on the face it sees, right to left on the screen', () => {
  assert.match(H, /const DIRS72 = \[\[0, 0\.16, 1\], \[0, 0\.16, -1\],/);
  assert.match(H, /function clear72\(T, D\) \{/);
  assert.match(H, /if \(!hits\.some\(\(h\) => seen\(h\.object\)/);
  assert.match(H, /v72 = \{ D, d, fz: d\[2\] < 0 \? -1 : 1 \};/);
  assert.match(H, /a = proj\(PL\.trace\.x \+ fz \* 1\.4, PL\.trace\.y \+ 0\.9, PL\.trace\.z \+ fz \* 0\.55\), b = proj\(PL\.trace\.x - fz \* 1\.4,/, 'the first dot at the screen\'s right from either face');
  assert.match(H, /view\(\) \{ const \{ D, d: \[dx, dy, dz\], fz \} = side\(\), T = T72\(fz\); return \{ p: \[T\[0\] \+ D \* dx, T\[1\] \+ D \* dy, T\[2\] \+ D \* dz\], t: T \}; \},/);
});

test('build 72: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/har42.js', 'test/build72.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
