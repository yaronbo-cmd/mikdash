// ── fable32 (build 45) ── stage 02, חומת העזרה, the new way (docs/specs/shlav-alef-v2-he.md §7, §10 "02", §2 the pulley, §3 the ashlar,
// the giant, the corner, the retreat): taps alone never finish the pulley, the line or a course; a released stone settles by itself; the
// corners alternate course to course; the retreat; the pulley's catch and slip; the line's straightness; the wall's materials beyond one
// morning; the wiring (the wall taken over after the test, its fixture); the yard's new variants; GAME_BUILD 45. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F from '../src/game/fam42.js';
import { PARTS45, LINE42, SRC45, YARD44 } from '../src/game/har42.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');

test('build 45: TAPS ALONE NEVER FINISH the pulley, the line or a course — a hundred taps of every kind', () => {
  const P = F.createPulley(1);
  for (let k = 0; k < 100; k++) { P.grab(); P.pull(k % 11); P.hold(0.3); P.release(); P.step(0.2); }
  assert.equal(P.state().done, false); assert.equal(P.state().y, 0, 'a tap or a jiggle under 12 px lifts nothing');
  const Ln = F.createLine45(1);
  for (let k = 0; k < 100; k++) { Ln.down(0.05, 0); Ln.move(0.06, 0); Ln.up(); Ln.down(0.99, 0); Ln.move(0.99, 0); Ln.up(); }
  assert.equal(Ln.state().done, false, 'taps at the pins never stretch the line');
  for (const kind of ['', 'corner', 'top']) {
    const C = F.createCourse(kind ? F.wallSpec45(kind, 3, 1) : F.courseSpec(0, 1));
    for (let k = 0; k < 100; k++) { C.place(2 + (k % 3), { dragPx: k % 23, u: 7 }); C.placeCorner(k % 2 ? 'a' : 'b', { dragPx: k % 23 }); C.pushIn({ dragPx: k % 23 }); }
    assert.equal(C.state().done, false, `${kind || 'course'}: taps place nothing`); assert.equal(C.state().stones.length, 0);
  }
});

test('build 45: the settle — a released stone settles by itself (no hold), precision still counts (a release far from its landing: every second one a fault)', () => {
  assert.equal(F.PLACE42.settle, 0);
  const sp = F.courseSpec(0, 1), C = F.createCourse(sp);
  assert.equal(C.place(3, { dragPx: 60 }), 'ok', 'no settleS at all — it settles');
  const D = F.createCourse(sp); D.place(2, { dragPx: 60, u: sp.a + 1 }); assert.equal(D.state().loose, 0, 'let go on its place: precise');
  D.place(2, { dragPx: 60, u: sp.a - 3 }); assert.equal(D.state().loose, 1, 'let go off the wall\'s end, it lands on the next free place 6 units away: imprecise');
  const h = read('src/game/har42.js'); assert.match(h, /const settle = \(m\) => \{ if \(!m\) return; const y1 = m\.position\.y; m\.position\.y = y1 \+ 0\.7;/); assert.match(h, /buzz42\('settle'\); o\.emit && o\.emit\('h45thud', \{\}\);/);
});

test('build 45: the corner rule — corner stones alternate course to course; the same way as below is a fault (counted, never corrected); the top course all his; the retreat at level 3', () => {
  assert.equal(F.wallSpec45('corner', 1, 2).corner.want, 'a'); assert.equal(F.wallSpec45('corner', 1, 3).corner.want, 'b', 'the next course: the other way');
  const fill = (C, rb) => { let at = C.state().a; while (at < rb) { const n = rb - at >= 4 && rb - at !== 5 ? (rb - at === 6 ? 3 : 4) : rb - at === 5 ? 3 : rb - at; assert.equal(C.place(n, { dragPx: 60 }), 'ok'); at += n; } };
  const sp = F.wallSpec45('corner', 1, 2), A = F.createCourse(sp); fill(A, sp.b - 2); assert.equal(A.state().done, false, 'the corner still open');
  assert.equal(A.placeCorner('a', { dragPx: 60 }), 'ok'); assert.equal(A.state().done, true);
  const B = F.createCourse(sp); fill(B, sp.b - 2); B.placeCorner('b', { dragPx: 60 }); assert.equal(B.state().done, true); assert.ok(B.state().faults >= 1, 'the wrong way: a fault');
  assert.ok(B.result().q < A.result().q);
  const T = F.wallSpec45('top', 1, 3); assert.equal(T.a, 0); assert.equal(T.b, 15); assert.equal(T.retreat, false);
  const T3 = F.wallSpec45('top', 3, 3), R3 = F.createCourse(T3); fill(R3, 13); R3.placeCorner(T3.corner.want, { dragPx: 60 });
  assert.equal(R3.state().done, false, 'level 3: the plumb — the stones that stand out'); assert.ok(R3.state().prot.length > 0);
  while (R3.state().prot.length) assert.equal(R3.pushIn({ dragPx: 40 }), 'ok'); assert.equal(R3.state().done, true);
});

test('build 45: the pulley — pulls in rhythm with a catch lift it; let go uncaught, it slips back; it stops in the window (מהודר); past it a correction, and left alone it is let out — never stuck', () => {
  const run = (P, catchIt, pulls) => { for (let k = 0; k < pulls && !P.state().done; k++) { P.grab(); for (let i = 0; i < 6; i++) P.pull(10); if (catchIt) P.hold(0.2); P.release(); for (let i = 0; i < 4; i++) P.step(0.05); } };
  const A = F.createPulley(1); run(A, true, 5); for (let i = 0; i < 40 && !A.state().done; i++) A.step(0.05); assert.equal(A.state().done, true); assert.equal(A.result().rating, 'mehudar'); assert.equal(A.state().slips, 0);
  const B = F.createPulley(1); B.grab(); for (let i = 0; i < 6; i++) B.pull(10); const up = B.state().y; B.release(); assert.ok(B.state().y < up, 'uncaught: it slips back'); assert.equal(B.state().slips, 1);
  const C = F.createPulley(1); run(C, true, 7); assert.ok(C.state().fix >= 1 || C.state().y > C.P.win[1], 'pulled too far: over the window');
  for (let i = 0; i < 400 && !C.state().done; i++) C.step(0.05); assert.equal(C.state().done, true, 'left alone over the window: let out to it'); assert.notEqual(C.result().rating, 'mehudar');
  assert.ok(F.PULLEY45.L[4].win[1] - F.PULLEY45.L[4].win[0] < F.PULLEY45.L[1].win[1] - F.PULLEY45.L[1].win[0], 'the levels narrow the window');
});

test('build 45: the line — from the near pin to the far, straight within 4 % מהודר, wavering כשר, a wide curve טעון תיקון; a let-go midway is a correction', () => {
  const draw = (Ln, w) => { Ln.down(0.02, 0); for (let i = 1; i <= 20; i++) { const u = i / 20; Ln.move(u, w * Math.sin(Math.PI * u)); } };
  const A = F.createLine45(1); draw(A, 0.02); assert.equal(A.state().done, true); assert.equal(A.result().rating, 'mehudar');
  const B = F.createLine45(1); draw(B, 0.07); assert.equal(B.result().rating, 'kasher');
  const C = F.createLine45(1); draw(C, 0.2); assert.equal(C.result().rating, 'tikkun');
  const D = F.createLine45(1); D.down(0.02, 0); D.move(0.5, 0); D.up(); assert.equal(D.state().fix, 1); draw(D, 0.01); assert.equal(D.result().rating, 'kasher', 'one correction');
  assert.ok(F.LINE45.L[4] < F.LINE45.L[1], 'the levels: a tighter line');
});

test('build 45: the stage — its parts in the order of §7, its lines with their sources, its card, its materials beyond one morning, its wiring; the yard\'s new variants; GAME_BUILD 45', () => {
  assert.deepEqual([...PARTS45], ['open', 'line', 'pulley', 'wcourse0', 'wcourse1', 'giant', 'wcorner', 'top', 'reveal']);
  for (const k of ['line', 'pulley', 'giant', 'wcorner', 'top', 'retreat', 'yishar', 'wet']) assert.match(LINE42[k], /טיוטה|המחשה/, k);
  assert.match(LINE42.line, /זכריה א, טז/); assert.match(LINE42.wet, /תענית כג ע"א/); assert.match(LINE42.yishar, /יישר כח/);
  assert.ok(SRC45.some((x) => /מדות ה, א/.test(x)));
  const cost = F.MAT42.cost, wall = cost.pulley + cost.wstone * 3 + cost.giant + cost.top; assert.ok(wall > F.MAT42.daily + 7, `the wall (${wall}) beyond a morning and stage 01's leftover: "מחר" in normal play`);
  const g = read('src/game/index.js');
  assert.match(g, /function wanted45\(\) \{\n    if \(!G \|\| G\.demo \|\| !S\.isDone\(G, 'har'\) \|\| S\.isDone\(G, 'wall'\) \|\| globalThis\.__H45_OFF\) return false;/);
  assert.match(g, /\(wall45=0\|stick=1\|har42=0\)/, 'the old wall behind the same switches'); assert.match(g, /complete: \(\) => \{ const out = S\.completeStage\(G, 'wall'\);/);
  assert.match(g, /else if \(wanted45\(\)\) startHar45\(\);/); assert.match(g, /h45go=1/);
  const h = read('src/game/har42.js');
  assert.match(h, /const STG = o\.stage === 'wall' \? 'wall' : 'har';/); assert.match(h, /CW45 = \{ x: -85, z: 0, w: 187, d: 135 \}/, 'the court 187 × 135');
  assert.match(h, /if \(R\.streak >= 3\) \{ R\.streak = 0;/, 'three מהודר in a row: יישר כח'); assert.match(h, /if \(came > 0 \|\| qs\('h45wet'\) === '1'\) wetMorning\(\);/);
  assert.match(read('src/stages.js'), /function setWet\(k\) \{ rain\.wetM = /);
  assert.deepEqual(YARD44.slice(6).map((v) => v.part), ['pulley', 'line', 'wcorner']);
  assert.equal(GAME_BUILD, 45);
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], Pp = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/fam42.js', 'src/game/har42.js', 'src/game/index.js', 'src/stages.js', 'tools/auto42.js', 'PROJECT.md']) { const s = read(f); for (const n of N) assert.ok(!s.includes(n), `${f}: a Name`); assert.ok(!s.includes(Pp), `${f}: עולי רגל`); }
});
