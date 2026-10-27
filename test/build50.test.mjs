// ── fable32 (build 50) ── stage 07, הלשכות, the new way — "קשתות ועיגולים" (docs/specs/shlav-alef-v2-he.md §10 "07", §3 the compass and the
// arch, §2/§5 the wheel): taps alone never finish the compass, the wheel (its hub or its buckets) or the dome; the alternation/balance rule;
// the dome holds only with its keystone; no chisel in the courts (the chambers stand while he works); the craftsman's test before chapter ג׳
// (the INSPECT family; its gate); the wiring; the yard; GAME_BUILD 50. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/fam42.js';
import { PARTS50, LINE42, SRC50, FIND50, YARD44, TEST50, TEST44, testEnd44, testTry44 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');

test('build 50: TAPS ALONE NEVER FINISH the compass, the wheel (its hub, its buckets) or the dome', () => {
  for (const L of [1, 4]) {
    const C = F.createCompass50(L); for (let k = 0; k < 200; k++) { C.hold(0.1, k % 3 === 0); C.hold(0.1, false); C.lift(); } assert.equal(C.state().planted, false, 'a tap does not plant the peg');
    const C2 = F.createCompass50(L); for (let k = 0; k < 10; k++) C2.hold(0.1, true); assert.equal(C2.state().planted, true); for (let k = 0; k < 300; k++) { C2.sweep(k * 1.3, 0); C2.lift(); } assert.equal(C2.state().done, false, 'taps here and there: no sweep');
    const Hb = F.createHub50(L); for (let k = 0; k < 100; k++) { Hb.turn(k % 3); assert.ok(['tap', 'done'].includes(Hb.insert({ dragPx: k % F.DRAG42 }))); } assert.ok(Hb.state().filled.every((f) => !f));
    const Wn = F.createWinch50(L); for (let k = 0; k < 3000; k++) { Wn.hold(k % 4 === 0); Wn.step(0.05); } assert.equal(Wn.state().done, false, 'tapped, the wheel never brings a bucket up'); assert.equal(Wn.state().i, 0);
    const A = F.createArch50(L); for (let k = 0; k < 100; k++) { assert.equal(A.place(k % 2 ? 'L' : 'R', { dragPx: k % F.DRAG42 }), 'tap'); assert.equal(A.keystone({ dragPx: 3 }), 'tap'); assert.equal(A.strike(), 'no'); } assert.equal(A.state().done, false);
  }
});

test('build 50: the ALTERNATION — a stone that would put one side two ahead tilts the centering (refused, counted); the keystone LAST; the dome HOLDS ONLY WITH ITS KEYSTONE', () => {
  const A = F.createArch50(2), n = A.state().n, d = { dragPx: 60 };
  assert.equal(A.place('L', d), 'ok'); assert.equal(A.place('L', d), 'tilt'); assert.equal(A.state().left, 1); assert.equal(A.state().tilts, 1);
  assert.equal(A.keystone(d), 'early', 'the keystone before the sides are full: refused'); assert.equal(A.state().early, 1);
  for (let i = 0; i < 30 && !(A.state().left >= n && A.state().right >= n); i++) A.place(A.state().left > A.state().right ? 'R' : 'L', d);
  assert.equal(A.state().left, n); assert.equal(A.state().right, n);
  for (let k = 0; k < 10; k++) assert.equal(A.strike(), 'no', 'no keystone: the wedges stay — the dome would not hold');
  assert.equal(A.keystone(d), 'ok'); let r = null; for (let k = 0; k < A.state().wedges; k++) r = A.strike(); assert.equal(r, 'holds'); assert.equal(A.state().holds, true);
  assert.equal(A.result().rating, 'kasher', 'a tilt and an early keystone: two corrections — כשר');
  const B = F.createArch50(1); for (let i = 0; i < 2 * B.state().n; i++) assert.equal(B.place(i % 2 ? 'R' : 'L', d), 'ok'); B.keystone(d); for (let k = 0; k < 4; k++) B.strike(); assert.equal(B.result().rating, 'mehudar', 'strict alternation, the keystone last: מהודר');
});

test('build 50: the compass grades its arc by the radius kept; the hub fits only at the top; the wheel spills when turned too fast', () => {
  const C = F.createCompass50(1); for (let k = 0; k < 10; k++) C.hold(0.06, true); for (let a = 0; a < 3.3 && !C.state().done; a += 0.03) C.sweep(a, 0.01 * Math.sin(a * 9)); assert.equal(C.result().rating, 'mehudar');
  const C2 = F.createCompass50(1); for (let k = 0; k < 10; k++) C2.hold(0.06, true); for (let a = 0; a < 3.3 && !C2.state().done; a += 0.03) C2.sweep(a, 0.3 * Math.sin(a * 9)); assert.equal(C2.result().rating, 'tikkun');
  assert.equal(C2.sweep(0, -0.2), null, 'done'); const C3 = F.createCompass50(1); for (let k = 0; k < 10; k++) C3.hold(0.06, true); assert.equal(C3.sweep(0, -0.2), 'slack'); assert.equal(C3.sweep(0.03, 0.2), 'strain'); assert.equal(C3.sweep(0.06, 0.01), 'taut');
  const Hb = F.createHub50(1); Hb.turn(-20 / Hb.P.gain); assert.equal(Hb.insert({ dragPx: 60 }), 'jam'); Hb.turn(20 / Hb.P.gain); assert.equal(Hb.insert({ dragPx: 60 }), 'ok');
  const fast = F.createWinch50(1); fast.hold(true); for (let k = 0; k < 2000 && !fast.state().done; k++) fast.step(0.05); assert.equal(fast.result().rating, 'tikkun', 'held all the way: the water spilled');
  const calm = F.createWinch50(1); for (let k = 0; k < 4000 && !calm.state().done; k++) { const s = calm.state(); calm.hold(s.v < s.spill * 0.85); calm.step(0.05); } assert.equal(calm.result().rating, 'mehudar', 'let go before the red: full buckets');
});

test('build 50: the craftsman\'s test before chapter ג׳ — the INSPECT family at level 2; pass at כשר; the seal; the master\'s hand after 5', () => {
  assert.deepEqual([...TEST50.jobs], ['log', 'rock', 'log2']); assert.equal(TEST50.L, 2); assert.equal(TEST50.demoAfter, 5);
  const jobs = {}; for (const j of TEST50.jobs) jobs[j] = testTry44(null, 'mehudar').rec; assert.deepEqual(testEnd44(jobs, TEST50.jobs), { passed: true, seal: true, shown: false });
  jobs.rock = testTry44(null, 'kasher').rec; assert.equal(testEnd44(jobs, TEST50.jobs).seal, false);
  let r = null; for (let k = 0; k < 5; k++) r = testTry44(r && r.rec, 'tikkun'); assert.equal(r.next, 'demo');
  assert.equal(testEnd44({ log: jobs.log }, TEST50.jobs), null, 'not all done: no end'); assert.deepEqual([...TEST44.jobs], ['lift', 'course0', 'corner'], 'chapter ב׳\'s test unchanged');
  const h = read('src/game/har42.js');
  assert.match(h, /const t50 = o\.test === 50, TT = t50 \? TEST50 : TEST44, key = t50 \? 'test50' : 'test44';/); assert.match(h, /'מבחן אומן — לפני פרק ג׳'/); assert.match(h, /'נפתח: פרק ג׳ — המזבח'/);
  assert.match(h, /\} else if \(j\.kind === 'wood'\) \{/, 'the master\'s hand knows the log check'); assert.match(h, /\} else if \(j\.kind === 'rock'\) \{/, 'and the rock reading');
  assert.match(h, /if \(STG === 'nashim' \|\| MODE === 'yard' \|\| MODE === 'test'\) props48\(add\);/, 'the test has its logs');
  const g = read('src/game/index.js'); assert.match(g, /function wantedTest50\(\)/); assert.match(g, /if \(done && wantedTest50\(\)\) setTimeout\(\(\) => \{ if \(!H42\) startH44\('test', '', 50\); \}, 400\);/); assert.match(g, /else if \(wantedTest50\(\)\) startH44\('test', '', 50\);/);
  assert.match(g, /for \(const id of \['yesod', 'sovev', 'guf', 'karnot'\]\)/, 'only before the altar is begun');
});

test('build 50: the stage — its parts and lines, no chisel in the courts, the wiring, the yard, the card, GAME_BUILD 50', () => {
  assert.deepEqual([...PARTS50], ['open', 'compass', 'benches', 'hub', 'wheel', 'dome', 'reveal']);
  assert.match(LINE42.compass, /"כחצי גורן עגולה" — סנהדרין ד, ג · טיוטה/); assert.match(LINE42.half, /חציה בקודש וחציה בחול · יומא כה ע"א · טיוטה/);
  assert.match(LINE42.wheel, /"ומשם מספקים מים לכל העזרה" — מדות ה, ד · טיוטה/); assert.match(LINE42.dome, /"בית המוקד כפה" — מדות א, ח · טיוטה/);
  for (const k of ['compass', 'compass2', 'slack', 'strain', 'half', 'benches', 'hub', 'hubJam', 'wheel', 'spill', 'dome', 'tilt', 'key', 'early', 'strike', 'holds']) { const head = LINE42[k].split(' · ')[0]; assert.ok(head.length <= 50, `${k}: ${head}`); assert.match(LINE42[k], /טיוטה|המחשה/, k); }
  assert.ok(SRC50.some((x) => /מדות ה, ד/.test(x)) && SRC50.some((x) => /מדות א, ח/.test(x)) && SRC50.some((x) => /המחשה/.test(x))); assert.match(FIND50, /קשת רובינסון וקשת וילסון/);
  assert.deepEqual(YARD44.slice(18).map((v) => v.part), ['compass', 'wheel', 'arch']);
  const c = F.MAT42.cost; assert.ok(c.compass > 0 && c.benches > 0 && c.hub > 0 && c.wheel > 0 && c.dome > 0);
  const h = read('src/game/har42.js');
  assert.match(h, /o\.stage === 'lishka' \? 'lishka' : 'har';/); assert.match(h, /STG === 'lishka' \? PARTS50 :/);
  for (const k of ['compass', 'benches', 'hub', 'wheel', 'dome', 'arch', 'log2']) assert.match(h, new RegExp(`\\n    ${k}: \\{ begin\\(\\) \\{ st\\.job = mk`), k);
  assert.match(h, /if \(STG === 'lishka' && R\.part > 0\) \{ try \{ if \(stages\.setStage\) stages\.setStage\('lishka', 'done', 1, \{ instant: true \}\); \}/, 'the chambers stand while he works: no saw or chisel in the courts');
  assert.ok(!/אזמל|מסתת|לסתת/.test(h.slice(h.indexOf('/* ── build 50 ── stage 07\'s acts'), h.indexOf('/* ── build 47 ── stage 04\'s acts'))), 'no chisel in stage 07\'s acts');
  assert.match(h, /ctl\.maxPolarAngle = Math\.PI - 0\.05;/, 'from inside, looking up'); assert.match(h, /if \(ctl && polar0 != null\) ctl\.maxPolarAngle = polar0;/, 'and the orbit\'s floor back');
  for (const line of [h, read('src/game/fam42.js')].join('\n').split('\n')) { const i = line.indexOf('//'); if (i < 0 || /https?:|'[^']*\/\/|`[^`]*\/\//.test(line)) continue; assert.ok(!/\b(target|frame|view|begin|end|down|up|move): \(/.test(line.slice(i)), `code after a comment: ${line.slice(i, i + 120)}`); }
  const g = read('src/game/index.js'); assert.match(g, /else if \(wanted50\(\)\) startHar50\(\);/); assert.match(g, /\(lishka50=0\|stick=1\|har42=0\)/); assert.match(g, /h50go=1/); assert.match(g, /if \(done && wanted50\(\)\) setTimeout\(\(\) => \{ if \(!H42\) startHar50\(\); \}, 400\);/);
  assert.equal(GAME_BUILD, 50);
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], Pp = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/fam42.js', 'src/game/har42.js', 'src/game/index.js', 'tools/auto42.js', 'tools/kid34/kidmodes.cjs', 'PROJECT.md']) { const s = read(f); for (const n of N) assert.ok(!s.includes(n), `${f}: a Name`); assert.ok(!s.includes(Pp), `${f}: עולי רגל`); }
});
