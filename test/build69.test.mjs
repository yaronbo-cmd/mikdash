// ── build 69 ── the free play at the wall (spec §10; the owner, 1.11: "אם ילד ירצה להמשיך לשחק… שימשיך. כל בנייה יצבור נקודות, כשיימאס לו
// שימשיך הלאה"): after the stage's works and its reveal the wall stays open — the site offers another course through the station and the
// way on; every course over the top course grows the hole in the model's skin; his stones are counted in the world. GAME_BUILD 69. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { courseSpec } from '../src/game/fam42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');

test('build 69: GAME_BUILD 69; ON69 at the wall under the site; the works done → the wall open, not the stage\'s end; the chips: another course, the way on, the count', () => {
  assert.equal(GAME_BUILD, 70);
  assert.match(H, /const ON69 = MODE === 'stage' && STG === 'wall' && ON63 && qs\('h69'\) !== '0' && qs\('h68'\) !== '0';/);
  assert.match(H, /if \(ON69 && D63\(\)\.includes\('reveal'\)\) \{ site69\(\); return; \}/, 'the reveal done: the open wall, not the reveal again');
  assert.match(H, /if \(ON69\) \{ const D = D63\(\); if \(!D\.includes\('reveal'\)\) D\.push\('reveal'\); save42\(S\); \}/, 'the reveal counted as done');
  assert.match(H, /'המשך', \(\) => stop\(true\), \.\.\.\(ON69 \? \['עוד נדבך', \(\) => freeBack69\(\)\] : \[\]\)\);/, 'the end card offers another course');
  assert.match(H, /function freeBack69\(\) \{\n    try \{ wallStones45\(\{ list: \[\], scene: scene\(\) \}\); \} catch \(e\) \{ \/\* \*\/ \}\n    if \(st\.props\.root\) st\.props\.root\.visible = true;/, 'back to the open wall: the copy off, the station back');
  assert.match(H, /function close69\(\) \{[\s\S]{0,400}st\.part = 'done'; finishCard\(\);/, 'the way on: the end card');
  assert.match(H, /function site69\(\) \{/); assert.match(H, /\[\['free69', 'עוד נדבך'\], \['next69', 'הלאה לשלב הבא'\]\]/);
  assert.match(H, /const his69 = \(\) => \{ try \{ const L = STG === 'wall' && st\.props\.course \? stones45\(\) : R\.stones \|\| \[\]; return L\.filter\(\(q\) => q\[6\]\)\.length; \}/, 'his stones in the wall, counted in the world');
  assert.match(H, /if \(ON69\) bar\.appendChild\(el\('h63-chip h69-count'/, 'the count on the site bar too');
  assert.match(H, /\.h63-chip\.h69-count\{pointer-events:none;border-style:dashed;opacity:\.85\}/);
});

test('build 69: the choice — another course walks him to the station (a free course over the top course, the hole a course taller); the way on ends the stage', () => {
  assert.match(H, /if \(ON69 && st\.part === 'site' && \(part === 'free69' \|\| part === 'next69'\)\) \{ drop63\(\); R\.site63 = 0; save42\(S\); if \(part === 'next69'\) \{ close69\(\); return true; \} startFree69\(\);/);
  assert.match(H, /free69: \{ begin\(\) \{ R\.free69 = \(R\.free69 \| 0\) \+ 1; R\.hole = H45\(\); hole45\(true, R\.hole\); save42\(S\); st\.job = mkCourse\(3 \+ R\.free69, '', 'free69'\); \} \},/);
  assert.match(H, /y0 \+ 5\.0 \+ \(ON69 \? \(R\.free69 \| 0\) : 0\), gx \+ 3\.05/, 'the hole grows a course for each free course');
  assert.match(H, /function startFree69\(\) \{/); assert.match(H, /st\.target = standOf\('wcourse0'\); G39\.reset\(\);\n    if \(st\.target && glide62\(hero\(\), st\.target\)\) glideTo62\(st\.target\);/);
  assert.match(H, /part === 'free69' \? 'עוד נדבך' : null/);
  assert.match(H, /kind: 'course', fullPad: !!K8, slot: slotBox,/, 'the station: the whole screen is the thing (the pile\'s stones were outside touch40\'s box)');
  assert.match(H, /if \(cr\.mt\) cr\.mt\.remove\(\); if \(st\.ui\.pad\) st\.ui\.pad\.classList\.remove\('full'\); \};/);
  assert.match(H, /px = C\.x - 7 \+ CRANE68\.pileX0 \+ 2 \* CRANE68\.pileDx, m2 = \(mx \+ px\) \/ 2; return \{ p: \[m2 \+ 12, C\.y \+ 23, C\.z - 32\]/, 'the frame between his stretch and the pile');
  assert.match(H, /if \(fx === 'free69' && ON69\) \{ R\.done63 = PARTS\.filter\(\(q\) => q !== 'open'\); R\.site63 = 1; R\.part = PARTS\.indexOf\('top'\); return; \}/, 'the fixture');
  // the free courses: over the top course (n 3) — the fourth course's stretch and the joints below, as the course rules give them
  const c4 = courseSpec(4, 1), c5 = courseSpec(5, 1);
  assert.deepEqual(c4.below, [3, 6, 9, 12]); assert.equal(c4.a, 1); assert.equal(c4.b, 7); assert.deepEqual(c5.below, [2, 5, 8, 11]); assert.equal(c5.a, 4);
  assert.match(H, /on69: ON69, free69: \(\) => \(\{ n: R\.free69 \| 0, his: his69\(\), hole: STG === 'wall' \? H45\(\) : null \}\),/);
});

test('build 69: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/har42.js', 'test/build69.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
