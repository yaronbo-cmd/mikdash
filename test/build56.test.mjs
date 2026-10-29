// ── build 56 ── stage 09, הסובב וחוט הסיקרא (docs/specs/shlav-alef-08-16-he.md §1, §3 "09"): the raking light (the lamp dragged round the
// stone on its arc — a hidden crack shows only when the light comes from the side), the mallet and the witness stone (a whole stone rings long
// and wide, a cracked one short and broken — drawn, so it works without sound), the sovev's course (each stone true to the plumb line: "עלה
// חמש וכנס אמה", מדות ג, א), the red line in three steps (the reed, the level, the snap: "להבדיל בין דמים העליונים לדמים התחתונים"); the
// yesod after stage 08 the ר alone; stage 08's card its own sources; GAME_BUILD 56. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/fam42.js';
import { PARTS56, SRC56, SRC55, LINE42 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');
const head = (l) => String(l).split(' · ')[0];
const words = (l) => head(l).replace(/[↔➡⬅⤵⟳⟲⬍∙!—]/g, ' ').split(/\s+/).filter((w) => w && !/^[←-⇿⬀-⯿]$/.test(w)).length;

test('build 56: GAME_BUILD 56; stage 09\'s parts in the spec\'s order; its sources (מדות ג, א; ג, ד)', () => {
  assert.equal(GAME_BUILD, 56);
  assert.deepEqual([...PARTS56], ['open', 'light', 'tap', 'sovev', 'thread', 'reveal']);
  assert.ok(SRC56.some((s) => /עלה חמש וכנס אמה, זה הסובב — מדות ג, א/.test(s)));
  assert.ok(SRC56.some((s) => /להבדיל בין דמים העליונים לדמים התחתונים — מדות ג, א/.test(s)));
  assert.ok(SRC56.every((s) => /טיוטה|המחשה/.test(s)));
  assert.match(H, /const FAMOF = \{ rope: 'rope', light: 'inspect', tap: 'inspect', sovev: 'place', thread: 'fit',/);
  assert.match(H, /o\.stage === 'yesod' \? 'yesod' : o\.stage === 'sovev' \? 'sovev' : 'har';/);
  assert.match(H, /const PARTS = STG === 'sovev' \? PARTS56 : STG === 'yesod' \? PARTS55 :/);
});

test('build 56: the lines — a verb and the gesture\'s arrow, five words at most (§1 rule 4); kasher ➡ pasul ⬅ (rule 13)', () => {
  for (const k of ['lamp56', 'rakeSeen56', 'rakeWhole56', 'tap56', 'tapFirst56', 'tapNew56', 'tapDecide56', 'course56', 'courseOut56', 'courseIn56', 'courseTrue56', 'thread1_56', 'thread2_56', 'thread3_56', 'threadWash56']) {
    assert.ok(words(LINE42[k]) <= 5, `${k}: "${head(LINE42[k])}" ${words(LINE42[k])} words`);
    assert.ok(/[↔➡⬅⤵⟳⟲⬍👆]/u.test(head(LINE42[k])), `${k}: an arrow`);
    assert.match(LINE42[k], /טיוטה|המחשה/, `${k}: its chip`);
  }
  assert.equal(head(LINE42.lamp56), 'הזיזו את האור ⟲');
  assert.equal(head(LINE42.tap56), 'הקישו 👆 ∙ השוו לעדות');
  assert.equal(head(LINE42.course56), 'גררו ⤵ ∙ יישרו לאנך ⬅');
  assert.equal(head(LINE42.thread1_56), 'גררו את היתד ⬍');
  assert.equal(head(LINE42.thread2_56), 'ימין — לאותו גובה ⬍');
  assert.equal(head(LINE42.thread3_56), 'מתחו ↔ ושחררו');
  assert.match(head(LINE42.rakeSeen56), /פסול ⬅$/); assert.match(head(LINE42.rakeWhole56), /כשר ➡$/); assert.match(head(LINE42.tapDecide56), /כשר ➡ פסול ⬅/);
});

test('build 56: the raking light — the hidden crack only from the side (level 2 from ~54°), never from the front; the stone pasul', () => {
  assert.equal(F.rake56(0, 2), 0); assert.equal(F.rake56(0.5, 2), 0);
  assert.ok(F.rake56(1.3, 2) >= 0.99 && F.rake56(-1.3, 2) >= 0.99, 'from either side');
  assert.ok(F.rake56(1.0, 2) > 0 && F.rake56(1.0, 2) < 0.6);
  assert.ok(F.rake56(0, 1) >= 0.25, 'level 1: a faint line even from the front');
  assert.ok(F.rake56(1.1, 4) < F.rake56(1.1, 2), 'higher levels: the light must be lower');
  assert.equal(F.STONE55.hair.bad, true); assert.equal(F.STONE55.deep.bad, true);
  const s = F.createStone55('hair', () => 0.5, 2); assert.equal(s.state().bad, true);
  assert.notEqual(s.decide(true, 200), 'ok', 'a hidden crack to the altar is wrong'); const s2 = F.createStone55('hair', () => 0.5, 2); assert.equal(s2.decide(false, 200), 'ok');
  assert.match(H, /data-lamp/); assert.match(H, /lampDrag = true/);
  assert.match(H, /const bk = new THREE\.Mesh\(new THREE\.PlaneGeometry\(9, 5\), new THREE\.MeshBasicMaterial\(\{ color: '#120D0A' \}\)\)/, 'the dark cloth behind (macro, dark background)');
});

test('build 56: the mallet — the witness first; a whole stone rings long and wide, a cracked one short and broken (drawn); level 4 deep: a little shorter', () => {
  const w = F.ring56(false, 3), c = F.ring56(true, 3), d4 = F.ring56(true, 4);
  assert.ok(w.T > c.T * 2 && w.reach > c.reach * 2 && w.rings > c.rings && !w.broken && c.broken);
  assert.ok(d4.T > c.T && d4.T < w.T && d4.reach < w.reach, 'level 4: the deep crack changes the ring only a little');
  assert.match(H, /if \(!tapW\) \{ wGlow = 2; line\(LINE42\.tapFirst56/, 'the new stone before the witness: "the witness first"');
  assert.match(H, /אבן העדות/);
});

test('build 56: the sovev\'s course — laid, then pushed in to the plumb line; level 1 seats a push the right way; graded by the pushes', () => {
  const J = F.createCourse56(4, 1);
  assert.equal(J.lay(0.45), 'out'); assert.equal(J.nudge(0.45), 'true');
  assert.equal(J.lay(0.4), 'out'); assert.equal(J.nudge(0.1), 'out'); assert.equal(J.nudge(0.3), 'true');
  assert.equal(J.lay(0.02), 'true'); assert.equal(J.lay(-0.3), 'in'); assert.equal(J.nudge(-0.3), 'true');
  const k = J.state(); assert.equal(k.done, true); assert.equal(k.q, 1, '4 pushes for 4 stones: מהודר');
  const J2 = F.createCourse56(2, 2); J2.lay(0.5); for (const d of [0.1, 0.1, 0.1, 0.1, 0.1]) J2.nudge(d); assert.equal(J2.state().cur, -1); J2.lay(0.5); J2.nudge(0.5); assert.equal(J2.state().q, 0.3, 'six pushes for two: טעון תיקון');
  assert.match(H, /if \(L <= 1 && Math\.sign\(d\) === Math\.sign\(n0\.e0\) && Math\.abs\(d\) >= Math\.abs\(n0\.e0\) \* 0\.4\) d = n0\.e0;/);
  assert.match(H, /const BAG56 = \[null, \[0\.6, 0\.5, 0\.65, 0\.55\]/, 'level 1: every stone juts — the line\'s ⬅');
  assert.match(H, /view\(\) \{ return \{ p: \[-17, 19\.6, -26\.5\], t: \[-27\.5, 19\.6, -18\.5\] \}; \}/, 'low, from the north-east, level');
  assert.match(H, /plumb\.position\.z = cur\.position\.z - 0\.53;/, 'the plumb line from the stone\'s face');
});

test('build 56: the red line — the reed\'s middle, the level, the snap; מהודר within half a tefach, כשר a small tilt, else washed off (free)', () => {
  const k = F.createThread56(1), s = k.state();
  assert.equal(s.step, 1); k.setL(4); assert.equal(k.releaseL(), 'again'); k.setL(5); assert.equal(k.releaseL(), 'next');
  k.setR(5.05); assert.ok(Math.abs(k.bubble()) < 0.15); assert.equal(k.releaseR(), 'next'); assert.equal(k.snap(), 'mehudar');
  const k2 = F.createThread56(2); k2.setL(5); k2.releaseL(); k2.setR(5.25); k2.releaseR(); assert.equal(k2.snap(), 'kasher');
  const k3 = F.createThread56(2); k3.setL(5); k3.releaseL(); k3.setR(6); k3.releaseR(); assert.equal(k3.snap(), 'wash'); assert.equal(k3.state().step, 1); assert.equal(k3.state().washes, 1);
  const k4 = F.createThread56(2); k4.setL(5); k4.releaseL(); k4.setR(6); k4.releaseR(); k4.setR(5); assert.equal(k4.snap(), 'mehudar', 'before the snap the right peg may be set again');
  assert.ok(F.THREAD56.hi <= 1 / 12 + 1e-9, 'half a tefach');
  assert.match(H, /r="24" fill="rgba\(255,214,110,\.25\)" stroke="#FFD66E" stroke-width="3" data-peg=/, 'the pegs\' handles 48 px');
  assert.match(H, /D = \(NF56\.x1 - NF56\.x0\) \/ \(2 \* 0\.64 \* t2\)/, 'the wall 64 % of the width, level');
  assert.match(H, /thread: A\(-20\.8, -21\.5\)/, 'he by the east end: the left third');
});

test('build 56: the end card — stage 09\'s sources and the zorek (blood above the line and below it); stage 08\'s card its own sources', () => {
  assert.match(H, /\.\.\.\(STG === 'sovev' \? SRC56 : STG === 'yesod' \? SRC55 : STG === 'lishka' \? SRC50/);
  assert.match(H, /if \(STG === 'sovev' && fc\) zorek56\(fc\);/);
  assert.match(H, /דמים עליונים<\/text>/); assert.match(H, /דמים תחתונים<\/text>/);
  assert.ok(!SRC55.some((s) => /הר הבית|אריח|לבית התקיעה|אלף עגלות|גלגל הדריכה/.test(s)), 'stage 08\'s card: not stage 01\'s lines');
  assert.match(H, /if \(STG === 'sovev' && !r\.rl && k > 5\.2\) \{ r\.rl = 1; try \{ if \(stages\.redLine\) stages\.redLine\(0\.5\);/, 'the reveal: the red line round the altar\'s middle');
});

test('build 56: the yesod after stage 08 is the ר — all the north and the west, one amah into the south and the east; noon at the reveal', () => {
  const T = read('src/temple.js');
  assert.match(T, /A\(-54, 16, -19\.5, -22, 17, -18\.5\);/); assert.match(T, /A\(-54, 16, -18\.5, -53, 17, 12\.5\);/);
  assert.match(T, /A\(-53, 16, 11\.5, -52, 17, 12\.5\);/); assert.match(T, /A\(-23, 16, -18\.5, -22, 17, -17\.5\);/);
  assert.match(T, /S\('sovev'\);\n\s+A\(-53, 16, -18\.5, -23, 22, 11\.5\);/, 'the body from the court\'s floor is the sovev\'s');
  assert.ok(!/A\(-54, 16, -19\.5, -22, 17, 12\.5\)/.test(T), 'no full slab');
  const S = read('src/stages.js'); assert.match(S, /const yes = \(z <= -18\.5\) \|\| \(x <= -53\) \|\| \(x >= -23 && z <= -17\.5\) \|\| \(x <= -52 && z >= 11\.5\);/);
  assert.match(H, /o\.timeOfDay\(STG === 'yesod' \|\| STG === 'sovev' \? 'noon' : 'golden'\)/);
});

test('build 56: the wiring — after stage 08, on resume, the fixture ?h56go=1; the old flow behind ?sovev56=0; the tools\' hands', () => {
  const G = read('src/game/index.js');
  assert.match(G, /function wanted56\(\)/); assert.match(G, /function startHar56\(\)/); assert.match(G, /stage: 'sovev'/);
  assert.match(G, /if \(done && wanted56\(\)\) setTimeout\(\(\) => \{ if \(!H42\) startHar56\(\); \}, 400\);/);
  assert.match(G, /else if \(wanted56\(\)\) startHar56\(\);/); assert.match(G, /\[\?&\]h56go=1/); assert.match(G, /sovev56=0\|stick=1\|har42=0/);
  const A = read('tools/auto42.js'); assert.match(A, /async function course56\(\)/); assert.match(A, /async function thread56\(\)/); assert.match(A, /R\.mode === 'lamp'/); assert.match(A, /R\.mode === 'tap'/);
  const K = read('tools/kid34/kidmodes.cjs'); for (const f of ['lamp56k', 'tap56k', 'course56k', 'thread56k']) assert.match(K, new RegExp(`async function ${f}\\(K\\)`));
  assert.match(K, /h\.stg === 'sovev' && h\.part === 'done'/);
});

test('build 56: never a Divine Name; "עולי רגל"', () => {
  const add = [H, read('src/game/fam42.js'), read('src/game/index.js'), read('tools/kid34/kidmodes.cjs'), read('tools/auto42.js')].join('\n');
  const DN = String.fromCharCode(0x5d9, 0x5d4, 0x5d5, 0x5d4);   // (built, never written)
  assert.ok(!add.includes(DN), 'no Divine Name');
  assert.ok(!add.includes(String.fromCharCode(0x5e6, 0x5dc, 0x5d9, 0x5d9, 0x5e0, 0x5d9, 0x5dd)), 'עולי רגל, never the other word');
});
