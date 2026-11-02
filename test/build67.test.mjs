// ── build 67 ── the physical works of 01–02, part one (the owner's reports, 1.11: "מה זו התאורה הזו?", "האבנים לא נראות כמו אבני הבית… חומה
// מעפנה", "לחוץ על נקודות ואז עובר זרם שחור בתוך הסלע… לא קשור לעולם", "תזוזת האבן… באמצע שומקום"): the works by day (index.js's clock yields
// to har42's day67), the Herodian ashlar's look (a warm margin, a flat lighter boss, no white frame), the rock's wedges standing in it and
// its split into chunks that the hammer breaks down, the corner's wall. GAME_BUILD 67. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js'), I = read('src/game/index.js');

test('build 67: GAME_BUILD 67; the works by day — har42 asks for noon at the start of 01/02, tells the clock (day67) while a working part runs, nothing at the reveal; index.js\'s clock yields', () => {
  assert.equal(GAME_BUILD, 71);
  assert.match(H, /const ON67 = MODE === 'stage' && qs\('h67'\) !== '0';/);
  assert.match(H, /if \(ON67 && \(STG === 'har' \|\| STG === 'wall'\)\) \{ try \{ if \(o\.timeOfDay\) o\.timeOfDay\('noon'\); \} catch \(e\) \{ \/\* \*\/ \} \}/);
  assert.match(H, /get day67\(\) \{ return ON67 && st\.on && \(STG === 'har' \|\| STG === 'wall'\) && st\.part !== 'reveal' && st\.part !== 'done' && st\.part !== 'out' \? 'noon' : null; \}, on67: ON67,/);
  assert.match(I, /if \(H42 && H42\.on && typeof opt\.fixedTime !== 'string'\) \{ const d = H42\.day67; if \(!d\) return; k = d; \}/);
});

test('build 67: the ashlar — a warm limestone margin and a flat lighter boss without the rock\'s blotches, a narrow margin; the saved wall stones the same', () => {
  assert.match(H, /const STONE = mat\('#D3C3A0', 0\.9\), BOSS = mat\('#E9DDC0', 0\.95\), ROCK = mat\('#DACBAE', 0\.95\)/);
  assert.match(H, /\[\[STONE, 0\.45\], \[BOSS, 0\.5\], \[ROCK, 1\.7\], \[BED, 0\.8\]\]\) \{ if \(m !== STONE && m !== BOSS\) m\.map = r\.map;/);
  assert.match(H, /m\.emissive = new THREE\.Color\('#2A2218'\); m\.emissiveIntensity = 0\.25;/);
  assert.match(H, /const m = Math\.min\(0\.2, Math\.min\(w, h\) \* 0\.1\), bw = Math\.max\(0\.1, w - 2 \* m\), bh = Math\.max\(0\.1, h - 2 \* m\), bd = Math\.min\(0\.1, d \* 0\.05\);/);
  assert.match(H, /const ST = mk\('#D3C3A0', 0\.9\), BS = mk\('#E9DDC0', 0\.95\), HB = mk\('#E9DDC0', 0\.95\)/);
  assert.match(H, /\[\[ST, 0\.45\], \[BS, 0\.5\], \[HB, 0\.5\]\]\) \{ m\.normalMap/);
  assert.doesNotMatch(H, /'#FFF7E6'/, 'the white frame is gone');
});

test('build 67: the rock — a tapped wedge stands in its top along the line; read to its end it parts into four chunks (its mesh off, dust); the hammer breaks the chunks down; a reload shows chunks for a read rock', () => {
  assert.match(H, /function chunks67\(i, burst\) \{/);
  assert.match(H, /for \(let k = 0; k < 4; k\+\+\) \{\n      const m = new THREE\.Mesh\(rockGeo\(1\.05 \+ \(k % 2\) \* 0\.25, i \* 7 \+ k \+ 11\), ROCK\)/);
  assert.match(H, /const W67 = \[\]; const wedgeAt = \(t\) => \{ if \(!ON67 \|\| !st\.props\.root\) return; const g = new THREE\.Mesh\(new THREE\.ConeGeometry\(0\.17, 0\.75, 5\), mat\('#4A4A50', 0\.5\)\); g\.rotation\.x = Math\.PI; g\.position\.set\(C\.x - 2\.8 \+ 5\.6 \* t, C\.y \+ 1\.45, C\.z\);/);
  assert.match(H, /if \(r === 'ok'\) \{ buzz42\('mallet'\); wedgeAt\(best\.t\); \}/);
  assert.match(H, /if \(ON67\) \{ wedgesOff\(\); chunks67\(i, true\); o\.sound && o\.sound\('crack'\); \} else if \(st\.props\.rocks && st\.props\.rocks\[i\]\) st\.props\.rocks\[i\]\.scale\.set\(1\.3, 0\.35, 1\);/);
  assert.match(H, /const rock = st\.props\.rocks && st\.props\.rocks\[n\], chunks = ON67 \? chunks67\(n, false\) : null;/);
  assert.match(H, /if \(chunks\) \{ const sc = Math\.max\(0\.05, 1 - s\.k \* 1\.4\); chunks\.forEach\(\(m, j\) => \{ m\.scale\.set\(sc, 0\.72 \* sc, sc\); m\.visible = s\.k < 0\.7 - j \* 0\.07; \}\); if \(rock\) rock\.visible = false; \}/);
  assert.match(H, /if \(ON67\) \{ const ch = chunks67\(n, false\); if \(ch && kk > 0\.7\) ch\.forEach\(\(c\) => \{ c\.visible = false; \}\); \} else m\.scale\.set\(1\.3, 0\.35, 1\);/);
  assert.match(H, /end\(\) \{ wedgesOff\(\); try \{ beam\.parent/);
});

test('build 67: the corner is a corner — the crews\' first course west and north of the stone\'s place on the Mount, once', () => {
  assert.match(H, /if \(ON67 && STG === 'har' && st\.props\.root && !st\.props\.cornerWall67\) \{ const g = new THREE\.Group\(\); st\.props\.cornerWall67 = g; st\.props\.root\.add\(g\); for \(let k = 0; k < 3; k\+\+\) \{/);
  assert.match(H, /b\.rotation\.y = Math\.PI \/ 2; b\.position\.set\(bx, gy\(bx, bz\) \+ 0\.9, bz\); g\.add\(b\);/);
});

test('build 67: no Divine Name (by code points); עולי רגל', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/har42.js', 'src/game/index.js', 'test/build67.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
