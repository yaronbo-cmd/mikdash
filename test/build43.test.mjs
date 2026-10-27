// ── fable32 (build 43) ── stage 01 "שיטוח ההר" polished to the owner's bar (the coordinator's build-43 brief): the act's camera, the reveal
// to the opening's own viewpoint, the props' look, one short line and a source chip, the crowbar flick for the giant corner stone, the
// course's drop anywhere over the stretch, the paving's gap on its row, the card's Mount source; GAME_BUILD 43. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/fam42.js';
import { LINE42, SRC42, PARTS42, load42, H42KEY } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');

test('build 43: the crowbar flick — taps alone never move it; a flick as long as the gap sets it home (מהודר); too strong overshoots (a fault), a nudge back sets it (כשר); level 1 shows the ghost', () => {
  const T = F.createFlick(1); for (let k = 0; k < 100; k++) assert.equal(T.flick({ dragPx: 10 + (k % 13), dir: 1 }), 'tap');
  assert.equal(T.state().done, false); assert.equal(T.state().flicks, 0);
  const P = F.FLICK42.L[1], need = (d) => d / P.gain + F.DRAG42 / 2;
  const A = F.createFlick(1, 0.5); assert.equal(A.flick({ dragPx: need(0.5), dir: 1 }), 'home'); assert.equal(A.result().rating, 'mehudar');
  const B = F.createFlick(1, 0.4); assert.equal(B.flick({ dragPx: need(0.4 + 0.2), dir: 1 }), 'over'); assert.equal(B.state().overs, 1);
  assert.equal(B.flick({ dragPx: need(0.2), dir: -1 }), 'home'); assert.equal(B.result().rating, 'kasher');
  const C = F.createFlick(1, 0.75); let r = ''; for (let k = 0; k < 6 && r !== 'home'; k++) r = C.flick({ dragPx: need(Math.min(F.FLICK42.cap, Math.abs(C.state().x))), dir: C.state().x < 0 ? 1 : -1 });
  assert.equal(r, 'home', 'past the cap: two flicks'); assert.equal(C.result().rating, 'mehudar');
  assert.equal(F.createFlick(1).state().ghost, true); assert.equal(F.createFlick(2).state().ghost, false);
  assert.ok(F.FLICK42.L[4].win < F.FLICK42.L[1].win, 'the levels narrow the window');
});

test('build 43: the course — a stone let go anywhere over the stretch goes to the free place nearest; joints over joints counted, never corrected; every course ends', () => {
  const sp = F.courseSpec(0, 1);   // (a 1…7, the joints below at 3 and 6)
  const C = F.createCourse(sp); assert.equal(C.place(2, { dragPx: 60, settleS: 0.6, u: 6.4 }), 'ok'); assert.deepEqual(C.state().last, [5, 2]);
  assert.equal(C.place(4, { dragPx: 60, settleS: 0.6, u: 1.2 }), 'ok'); assert.deepEqual(C.state().last, [1, 4]); assert.equal(C.state().done, true); assert.equal(C.result().rating, 'mehudar');
  const D = F.createCourse(sp); D.place(2, { dragPx: 60, settleS: 0.6, u: 2 }); assert.equal(D.state().faults, 1, 'ending at 3: over a joint — counted'); assert.deepEqual(D.state().last, [1, 2]);
  assert.equal(D.place(4, { dragPx: 60, settleS: 0.6, u: 3 }), 'ok'); assert.equal(D.state().done, true); assert.equal(D.result().rating, 'kasher');
  const E = F.createCourse(sp); assert.equal(E.place(2, { dragPx: 60, settleS: 0.6, u: 3.5 }), 'gap', 'a place leaving 1 unit each side is refused');
  for (let seed = 1; seed <= 300; seed++) { let a = seed; const rnd = () => ((a = (a * 16807) % 2147483647) / 2147483647); for (const n of [0, 1]) for (const L of [1, 3]) { const sp2 = F.courseSpec(n, L), K = F.createCourse(sp2); for (let k = 0; k < 80 && !K.state().done; k++) K.place([2, 3, 4][Math.floor(rnd() * 3)], { dragPx: 60, settleS: 0.6, u: sp2.a + rnd() * (sp2.b - sp2.a) }); assert.ok(K.state().done, `seed ${seed}: the course ends`); } }
  for (let k = 0; k < 100; k++) assert.equal(F.createCourse(sp).place(3, { dragPx: 8, settleS: 2, u: 3 }), 'tap');
});

test('build 43: the corner stone after the wheel; a build-42 save moves on by one; its family is PLACE', () => {
  assert.deepEqual(PARTS42.slice(0, 5), ['open', 'rope', 'lift', 'corner', 'rock0']);
  const mem = {}; globalThis.localStorage = { getItem: (k) => mem[k] ?? null, setItem: (k, v) => { mem[k] = String(v); }, removeItem: (k) => { delete mem[k]; } };
  try {
    mem[H42KEY] = JSON.stringify({ v: 1, part: 5, open: 1, fam: {}, mat: {}, grades: [], hands: 0 }); const S = load42(); assert.equal(S.v, 2); assert.equal(S.part, 6, 'rock1 stays rock1');
    mem[H42KEY] = JSON.stringify({ v: 1, part: 2, open: 1, fam: {}, mat: {}, grades: [], hands: 0 }); assert.equal(load42().part, 2, 'the wheel stays the wheel');
  } finally { delete globalThis.localStorage; }
  const h = read('src/game/har42.js'); assert.match(h, /const FAMOF = \{[^}]*lift: 'lift', corner: 'place',/);   // (build 45: the wall's parts first) assert.match(h, /corner: \{ begin\(\) \{ st\.job = mkCorner\(\); \} \}/);
});

test('build 43: one short instruction and a small source chip; the long explanations on the card; the card\'s source is the Mount\'s (מדות ב, א)', () => {
  for (const [k, v] of Object.entries(LINE42)) {
    const head = v.split(' · ')[0]; assert.ok(head.length <= 50, `${k}: "${head}" (${head.length})`);
    if (!['walk', 'courseEnd'].includes(k)) assert.match(v, /טיוטה|המחשה/, `${k}: its chip`);
  }
  assert.ok(SRC42.some((x) => x.includes('הר הבית היה חמש מאות אמה על חמש מאות אמה') && x.includes('מדות ב, א')));
  const h = read('src/game/har42.js'); assert.ok(!h.includes('מכוסה שלג'), 'the House\'s snow (War 5.222) is gone from the Mount\'s card');
  assert.match(h, /\.\.\.\(STG === 'nashim' \? SRC48 : STG === 'gates' \? SRC47 : STG === 'soreg' \? SRC46 : STG === 'wall' \? SRC45 : SRC42\)\.map\(\(x\) => `~\$\{x\}`\)/, 'the sources on the card');   // (build 45: each stage's; build 46: stage 03's; build 47: stage 04's; build 48: stage 05's)
  assert.match(h, /\.h42-line b\{display:block;[^}]*white-space:nowrap/); assert.match(h, /\.h42-line i\{font-style:normal;/);
});

test('build 43: the reveal ends where the opening began (VIEWS.olives), in the late sun, with a quick before/after crossfade; skippable; the before taken from the opening\'s own first frame', () => {
  const h = read('src/game/har42.js');
  assert.match(h, /if \(!f\.snap && f\.t > 0\.05 && STG === 'har'\) \{ f\.snap = true; try \{ if \(o\.snapshot\) st\.snapshot = o\.snapshot\(\);/);   // (build 45: stage 01's before only)
  assert.match(h, /if \(o\.timeOfDay\) o\.timeOfDay\('golden'\);/); assert.match(h, /globalThis\.__T\.VIEWS\.olives/);
  assert.match(h, /const r = st\.rev; r\.t \+= dt; const T = 6\.5,/); assert.match(h, /return r\.t > 9\.5;/); assert.match(h, /st\.rev\.t = Math\.max\(st\.rev\.t, 8\.9\)/);
  assert.match(h, /\.h42-before\{position:fixed;left:0;top:0;width:100vw;height:100vh;object-fit:cover;/);
  const g = read('src/game/index.js'); assert.match(g, /timeOfDay: \(k\) => \{ try \{ if \(W\.setTimeOfDay\) W\.setTimeOfDay\(k\);/);
});

test('build 43: the props — rocks of displaced geometry, ashlars with drafted margins and a raised boss, a wooden treadwheel, wooden wedges, paving in slabs with joints; the game\'s procedural textures, no assets', () => {
  const h = read('src/game/har42.js');
  assert.match(h, /import \* as TX from '\.\.\/tex\.js';/); assert.match(h, /const r = TX\.texRock\(91, 256\), w = TX\.texWood\(61, 128\)/);
  assert.match(h, /function ashlar\(w, h, d\)/); assert.match(h, /function rockGeo\(r, seed\)/); assert.match(h, /new THREE\.IcosahedronGeometry\(r, 3\)/);
  assert.match(h, /st\.props\.big = add\(ashlar\(12, 3, 3\.6\)/, 'the great stone huge'); assert.match(h, /const GW = STG === 'wall' \? 6 : 4\.2;[^\n]*\n    st\.props\.stone0 = add\(ashlar\(GW, 1\.8, 2\)/);   // (build 45: the wall's giant 6 amot)
  assert.match(h, /for \(let i = 0; i < 30; i\+\+\) \{ const a = \(i \/ 30\) \* Math\.PI \* 2, b = new THREE\.Mesh\(new THREE\.BoxGeometry\(0\.5, 0\.07, 2\.15\), WOOD\)/, 'the wheel\'s boards');
  assert.match(h, /\(wooden wedges, driven into the line\)/); assert.match(h, /the laid paving in slabs with their joints/);
  assert.match(h, /the gap's outline on its row — #7/);
});

test('build 43: Phase B — by a wall of the stages\' buildings the follow camera keeps its pose and the wall between is dithered (the see-through), instead of the pull from above', () => {
  const c = read('src/avodah/day/cam28.js'), st = read('src/stages.js');
  assert.match(c, /function segWorldOnly\(ax, ay, az, bx, by, bz\)/); assert.match(c, /segWorldOnly\(ax, ay, az, ax \+ vx, ay \+ vy, az \+ vz\)\) \{ got = true; mode = 'xray'; tA = 0; tE = 0; tK = 1; \}/);
  assert.match(c, /S\.xrayAt\(mode === 'xray', ax, ay - 0\.1, az\)/);
  assert.match(st, /xrayAt: \(on, x, y, z\) => \{ xrW = on && Number\.isFinite\(x\) \? \[x, y, z\] : null; \}/); assert.match(st, /else if \(xrW\) \{ XRAY\.uXr\.value\.set\(xrW\[0\], xrW\[1\], xrW\[2\], 1\);/);
});

test('build 43: GAME_BUILD 43; no Divine Name (by code points); עולי רגל', () => {
  assert.equal(GAME_BUILD, 48);   // (build 44: the constant moved on) (build 45: again) (build 46: again) (build 47: again) (build 48: again)
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/fam42.js', 'src/game/har42.js', 'src/game/index.js', 'tools/auto42.js', 'tools/auto42-run.cjs', 'tools/cam41.js', 'tools/kid34/kidmodes.cjs', 'tools/kid34/kidpage.js', 'PROJECT.md']) {
    const s = read(f); for (const n of N) assert.ok(!s.includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
