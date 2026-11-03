// ── build 70 ── the station's puzzle rules and the arm's swing (the owner's play of build 69, 2.11: "אם שמתי אבן קטנה ואז הרמתי אבן גדולה
// ואין לה מקום היא נשארת תקועה באוויר על המנוף… היא לא יכולה להישאר באוויר"; "האבן מתרוממת בתוך הקיר"; "מה זו העגלה המעפנה הזו?").
// crane68.js: fitRuns68 / fitsAny68 (a stone fits only where a run holds it without a gap too small for any stone), armRot68 / sheaveZ68
// (the arm out while lifting, over the course for the alignment). har42.js: a stone with no place is dimmed and not hooked; one hanging
// with no place anywhere comes back down to the pile; the stone rises outside the wall's face and swings over the course; the oxen.
// GAME_BUILD 70. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CRANE68, PH68, fitRuns68, fitsAny68, armRot68, sheaveZ68 } from '../src/game/crane68.js';
import { createCourse, courseSpec } from '../src/game/fam42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

test('build 70: GAME_BUILD 70; the fit — a run holds the stone with nothing or at least a small stone left; the owner\'s case: a small stone laid, the big one has no place', () => {
  assert.equal(GAME_BUILD, 92);
  assert.deepEqual(fitRuns68([[1, 3], [5, 2], [8, 5]], 3), [[1, 3], [8, 5]]);
  assert.deepEqual(fitRuns68([[1, 3]], 2), [], 'a 2 in a 3 leaves 1: no stone fills it');
  assert.deepEqual(fitRuns68([[1, 4]], 2), [[1, 4]]); assert.deepEqual(fitRuns68([[1, 6]], 4), [[1, 6]]);
  const J = createCourse(courseSpec(0, 1));   // his stretch 1…7 (6 units)
  assert.equal(J.place(2, { dragPx: 200, u: 2 }), 'ok', 'the small stone first');
  assert.equal(fitsAny68(J.runs(), 4, null, J.state().corner), true, 'a 4 in the 4 left');
  assert.equal(J.place(3, { dragPx: 200, u: 5 }), 'gap', 'a 3 would leave 1');
  assert.equal(fitsAny68(J.runs(), 3, null, J.state().corner), false, 'so the 3 is not hooked at all');
  assert.equal(J.place(2, { dragPx: 200, u: 4 }), 'ok'); assert.equal(fitsAny68(J.runs(), 4, null, J.state().corner), false); assert.equal(fitsAny68(J.runs(), 2, null, J.state().corner), true);
  assert.equal(fitsAny68([], 2, 'a', { want: 'a', dir: null }), true, 'the corner stone while the corner is open'); assert.equal(fitsAny68([], 2, 'a', { want: 'a', dir: 'a' }), false); assert.equal(fitsAny68([[1, 3]], 2, 'b', null), false, 'no corner in this course');
});

test('build 70: the arm — out (π) at 0, over the course (0) at 1, eased; the sheave outside the wall when out, over the course when in; the phases', () => {
  assert.ok(near(armRot68(0), Math.PI) && near(armRot68(1), 0) && near(armRot68(0.5), Math.PI / 2)); assert.ok(armRot68(0.25) > Math.PI * 0.8, 'slow at the start');
  assert.ok(near(sheaveZ68(Math.PI), -CRANE68.boom) && near(sheaveZ68(0), CRANE68.boom));
  assert.ok(CRANE68.legsZ - CRANE68.boom < CRANE68.legsZ && CRANE68.legsZ + CRANE68.boom === 0, 'out: north of the legs; in: over the course');
  assert.ok(CRANE68.pileZ < CRANE68.legsZ - CRANE68.boom + 1.5, 'the pile lies by the sheave\'s outer place');
  assert.deepEqual(PH68, ['wait', 'pick', 'hook', 'lift', 'swing', 'align', 'back', 'set']); assert.ok(CRANE68.swingT > 0 && CRANE68.backS > 0 && CRANE68.armS > 0 && CRANE68.dim > 0 && CRANE68.dim < 1);
});

test('build 70 har42: wired — no hook for a stone with no place (dimmed); no place anywhere → back to the pile; the hang in the arm; the swing before the alignment, in the course act and the first stone\'s; the oxen', () => {
  assert.match(H, /import \{ fitRuns68, fitsAny68, armRot68, sheaveZ68 \} from '\.\/crane68\.js';/);
  assert.match(H, /const fitsP = \(p\) => fitsAny68\(J\.runs\(\), p\.len, p\.dir, J\.state\(\)\.corner\);/);
  assert.match(H, /const hookIt = \(i\) => \{ const p = cr\.pile\[i\]; if \(!p \|\| !p\.m\) return; if \(!fitsP\(p\)\) \{ buzz42\('retry'\); say8\(LINE42\.nofit70, 2\.6\); return; \}/, 'not hooked');
  assert.match(H, /if \(cr\.ph === 'pick' \|\| cr\.ph === 'wait'\) \{ armStep68\(Math\.PI, dt\); for \(const p of cr\.pile\) dimP\(p, !fitsP\(p\)\); \}/, 'dimmed');
  assert.match(H, /if \(!fitsAny68\(J\.runs\(\), cr\.len, cr\.dir, J\.state\(\)\.corner\)\) \{ cr\.ph = 'back'; say8\(LINE42\.back70, 4\); return; \}/, 'back');
  assert.match(H, /else if \(cr\.ph === 'back'\) \{ if \(armStep68\(Math\.PI, dt\) && lower68\(cr\.m, dt\)\) \{ unhook68\(cr\.m\); cr\.m = null; cr\.J2 = null; cr\.pile\.push\(\{ \.\.\.cr\.slot, m: null \}\); cr\.ph = 'pick'; \} \}/);
  assert.match(H, /const arm = new THREE\.Group\(\); arm\.position\.set\(0, Lh, 0\); arm\.rotation\.y = Math\.PI; G8\.add\(arm\);/); assert.match(H, /st\.props\.rig68\.arm = arm;/);
  assert.match(H, /if \(m\.parent !== K\.arm\) \{ if \(m\.parent\) m\.parent\.remove\(m\); K\.arm\.add\(m\);/, 'the stone hangs in the arm'); assert.match(H, /m\.position\.y = hangY68\(sy, K\.gY, cy, win\) - K\.gY - K\.Lh;/);
  assert.match(H, /sv = sheaveAt68\(\), q = slide68\(k, cr\.from\.x, cr\.from\.z, sv\.x, sv\.z\);/, 'the slide to under the sheave, outside');
  assert.match(H, /if \(s\.done\) \{ cr\.ph = 'swing'; cr\.t = 0; cr\.mt\.hidden = true; buzz42\('ok'\); say8\(LINE42\.swing70, 0\); \}/);
  assert.match(H, /else if \(cr\.ph === 'swing'\) \{ cr\.t \+= dt; armTo68\(armRot68\(cr\.t \/ CRANE68\.swingT\)\); if \(cr\.t >= CRANE68\.swingT\) \{ cr\.ph = 'align'; say8\(LINE42\.align68, 0\); \} \}/);
  assert.match(H, /if \(s\.done && K8 && cr\.ph === 'lift'\) \{ cr\.ph = 'swing'; cr\.t = 0; mt\.hidden = true; cr\.q = q; buzz42\('ok'\);/, 'the first stone swings too');
  assert.match(H, /const y1 = 1\.5 \+ nn \* 1\.0, y0 = hangWorldY68\(cr\.m\) - PL\.course\.y; let m2;/);
  assert.match(H, /runs70 = need70 \? fitRuns68\(J\.runs\(\), need70\) : K8 && cr\.m && cr\.dir \? \[\[spec\.b - 2, 2\]\] : J\.runs\(\);/, 'only the places it fits are shown while it hangs');
  assert.match(H, /const yoke = new THREE\.Mesh\(new THREE\.BoxGeometry\(0\.22, 0\.22, 2\.6\), G\.M\.wood\);/); assert.match(H, /const horn = new THREE\.Mesh\(new THREE\.CylinderGeometry\(0\.04, 0\.08, 0\.7, 6\), HORN\);/); assert.match(H, /\(the wheels spoked\)/);
  assert.match(H, /nofit70: 'אין לה מקום בנדבך — בחרו אבן אחרת · המחשה', back70: 'אין לה מקום בשום מקום — חוזרת לערימה · המחשה', swing70: 'הזרוע מסתובבת מעל הנדבך · המחשה',/);
});

test('build 70: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/crane68.js', 'src/game/har42.js', 'test/build70.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
