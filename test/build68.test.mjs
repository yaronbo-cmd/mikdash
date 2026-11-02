// ── build 68 ── the crane station at the court wall (the owner, 1.11: "הגלגלת הפיסית שמורידה אבן על הקיר ומכוונת אותה"; his proposal: one place
// and one frame for the lift, the alignment and the course, stones of real sizes onto the real wall; the reports: "תזוזת האבן… באמצע שומקום").
// crane68.js: the hang, the alignment, the pile, the cart's way, the tap's pick, the slide. har42.js: the rig at his stretch (not 32 amot
// north), the pulley act = the station's first stone, the course acts through the station (no pile of buttons), the cart on its way in.
// GAME_BUILD 68. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CRANE68, PH68, hangY68, alignU68, pile68, cartAt68, pick68, slide68 } from '../src/game/crane68.js';
import { PULLEY45, PLACE42 } from '../src/game/fam42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

test('build 68: GAME_BUILD 68; the hang — on the ground at 0, over the course at the window\'s foot (its bottom clear of the course\'s top), higher past it, never below the ground', () => {
  assert.equal(GAME_BUILD, 73);
  const win = PULLEY45.L[1].win, gY = 2, cy = 7.5;
  assert.ok(near(hangY68(0, gY, cy, win), gY + CRANE68.lift), 'at 0: lying on the ground');
  assert.ok(near(hangY68(win[0], gY, cy, win), cy + CRANE68.over), 'at the window\'s foot: over the course');
  assert.ok(hangY68(win[1], gY, cy, win) > hangY68(win[0], gY, cy, win) && hangY68(win[0], gY, cy, win) - 0.48 > cy + 0.48, 'the window: above the course\'s top, rising');
  assert.ok(near(hangY68(-0.3, gY, cy, win), gY + CRANE68.lift), 'never under the ground');
  assert.ok(cy + CRANE68.over - 0.48 - (cy + 0.48) > 0.5, 'clear of the course by over half an amah');
});

test('build 68: the alignment — a drag moves the rig by the screen\'s measure of a course unit (its sign the course\'s way on the screen), kept inside his stretch for the stone\'s length', () => {
  assert.ok(near(alignU68(3, 40, 40, 2, 1, 7), 4)); assert.ok(near(alignU68(3, 40, -40, 2, 1, 7), 2), 'the course running right-to-left on the screen: the drag the other way');
  assert.ok(near(alignU68(3, 400, 40, 2, 1, 7), 6), 'no farther than the stretch\'s end less half the stone'); assert.ok(near(alignU68(3, -400, 40, 4, 1, 7), 3), 'no nearer than its start plus half');
  assert.ok(near(alignU68(3, 50, 0.5, 2, 1, 7), 3), 'no measure: no move');
  assert.deepEqual(PH68, ['wait', 'pick', 'hook', 'lift', 'swing', 'align', 'back', 'set']);   // (build 70: the swing and the way back)
});

test('build 68: the pile — one stone of each size and the corner stones, in a row north of the rig; the cart\'s way in from the east, stopped at its stand; the pick within reach; the slide eased', () => {
  const P = pile68(PLACE42.lens, ['a', 'b']);
  assert.equal(P.length, PLACE42.lens.length + 2); assert.deepEqual(P.map((p) => p.len), [...PLACE42.lens, 2, 2]); assert.deepEqual(P.map((p) => p.dir), [null, null, null, 'a', 'b']);
  for (let i = 1; i < P.length; i++) assert.ok(near(P[i].dx - P[i - 1].dx, CRANE68.pileDx) && P[i].dz === CRANE68.pileZ && P[i].dz < CRANE68.legsZ, 'spaced along the wall, north of the rig');
  assert.equal(pile68([3], []).length, 1);
  const c0 = cartAt68(0); assert.ok(near(c0.dx, CRANE68.cartFrom) && !c0.stopped); const c1 = cartAt68(3); assert.ok(c1.dx < c0.dx && !c1.stopped);
  const cE = cartAt68(c0.t + 0.01); assert.ok(near(cE.dx, CRANE68.cartX) && cE.stopped, 'stopped at its stand'); assert.ok(near(c0.t, (CRANE68.cartFrom - CRANE68.cartX) / CRANE68.cartS));
  const pts = [{ x: 100, y: 300 }, null, { x: 250, y: 310 }];
  assert.equal(pick68(pts, 240, 300), 2); assert.equal(pick68(pts, 110, 320), 0); assert.equal(pick68(pts, 175, 500), -1, 'too far from every stone');
  const s0 = slide68(0, 1, 2, 5, 8), s1 = slide68(1, 1, 2, 5, 8), sm = slide68(0.5, 1, 2, 5, 8);
  assert.ok(near(s0.x, 1) && near(s0.z, 2) && near(s1.x, 5) && near(s1.z, 8) && near(sm.x, 3) && near(sm.z, 5)); assert.ok(slide68(0.25, 0, 0, 1, 0).x < 0.25, 'eased: slow at the start');
});

test('build 68 har42: wired — ON68 at the wall; the rig at his stretch; the pulley act the station\'s first stone; the course acts through the station (the pile of buttons gone, the course\'s own rules kept); the cart on its way; the tools', () => {
  assert.match(H, /const ON68 = MODE === 'stage' && STG === 'wall' && qs\('h68'\) !== '0';/);
  assert.match(H, /import \{ CRANE68, hangY68, alignU68, pile68, cartAt68, pick68, slide68 \} from '\.\/crane68\.js';/);
  assert.match(H, /if \(ON68\) \{ Object\.assign\(PL, \{ pulley: \{ x: PL\.course\.x \+ 1\.2 - 7, y: 6, z: PL\.course\.z \+ CRANE68\.legsZ \}, pstone: \{ x: PL\.course\.x \+ 1\.2 - 7, y: 6, z: PL\.course\.z \} \}\); Object\.assign\(STAND, \{ pulley: P\(6, 21\.5\) \}\); \}/);
  assert.match(H, /if \(ON68\) rig68\(add\); else \{/); assert.match(H, /function rig68\(add\) \{/); assert.match(H, /st\.props\.rig68 = \{ G8, hook, rope, sh, gY, Lh \};/);
  assert.match(H, /const cart = cart53\(\); cart\.rotation\.y = Math\.PI; const came = !!R\.cart68, c0 = cartAt68\(came \? 1e9 : 0\)/);
  assert.match(H, /pulley: \{ begin\(\) \{ st\.job = mkPulley68\(\); \} \},/); assert.match(H, /function mkPulley68\(\) \{\n    if \(!ON68\) return mkPulley\(\);/);
  assert.match(H, /g\.userData\.p68 = 1; st\.anims = \(st\.anims \|\| \[\]\)\.concat\(\[\{ m: m2, y0, y1, t: 0, T: CRANE68\.lowerT \}\]\);/, 'the first stone lowered onto the course');
  assert.match(H, /if \(ON68 && n === 0 && g\.userData\.p68 && x === 0\) continue;/, 'the crews skip the place it took');
  assert.match(H, /if \(!ON68\) for \(const len of F\.PLACE42\.lens\)/); assert.match(H, /if \(!ON68\) if \(spec\.corner\) for \(const dir of \['a', 'b'\]\)/);
  assert.match(H, /const K8 = ON68 \? crane68\(\) : null, cr = \{ ph: 'wait'/); assert.match(H, /acting: true, dragOnly: !K8, J, kind: 'course'/);
  assert.match(H, /J\.placeCorner\(cr\.dir, \{ dragPx: 200 \}\) : 'corner'\) : J\.place\(cr\.len, \{ dragPx: 200, u: cr\.u \}\);/, 'the course\'s rules at the rig\'s place');
  assert.match(H, /cr\.u = alignU68\(cr\.u, dx, pxU8\(\), cr\.len, spec\.a, spec\.b\); craneTo68\(cr\.u\);/);
  assert.match(H, /const i = pick68\(pts, a\.x, a\.y\); if \(i >= 0\) hookIt\(i\);/); assert.match(H, /if \(K8\) crFrame\(dt\);/); assert.match(H, /end\(\) \{ if \(K8\) crEnd\(\);/);
  assert.match(H, /if \(ON68\) cart68Frame\(dt\);/); assert.match(H, /on68: ON68, crane68: \(\) =>/);
  assert.match(H, /cart68: 'העגלה באה מהדרך עם האבנים · אלף עגלות — קדמוניות טו 390 · טיוטה',/);
});

test('build 68: no Divine Name (by code points)', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)];
  for (const f of ['src/game/crane68.js', 'src/game/har42.js', 'test/build68.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`);
  }
});
