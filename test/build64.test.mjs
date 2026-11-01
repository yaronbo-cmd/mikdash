// ── build 64 ── the camera of the first stages, the player's (the owner, 1.11: "המצלמה שם יותר טובה כי הוא פותחת למעלה ולמטה הכול, אגודל
// ימין"; his reports: "אני השחקן צריך לבחור לאיזו פינה לפנות", "הכהן נעלם, המצלמה יצאה החוצה"). cam64.js: the orbit about the look point
// (bearing, elevation, distance) — a drag turns and tilts it, a pinch zooms it, it stays where left, and it is pulled in along its own line
// when the line to him is cut. har42.js: the right thumb owns it on the walk and the site; two fingers on the thing own it during an act.
// GAME_BUILD 64. Never a Divine Name.
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CAM64, orbit64, wrap64, drag64, pinch64, view64, fromView64, ease64, pull64, two64 } from '../src/game/cam64.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';

const ROOT = new URL('../', import.meta.url);
const read = (p) => fs.readFileSync(new URL(p, ROOT), 'utf8');
const H = read('src/game/har42.js');
const near = (a, b, e = 1e-6) => Math.abs(a - b) <= e;

test('build 64: GAME_BUILD 64; the orbit kept in range — the horizon and the top view its ends, never nearer than dMin nor farther than dMax', () => {
  assert.equal(GAME_BUILD, 66);
  const o = orbit64(4, 3, 1000); assert.ok(near(o.az, 4 - 2 * Math.PI)); assert.equal(o.el, CAM64.elMax); assert.equal(o.d, CAM64.dMax);
  const q = orbit64(-4, -1, 0); assert.ok(near(q.az, -4 + 2 * Math.PI)); assert.equal(q.el, CAM64.elMin); assert.equal(q.d, CAM64.dMin);
  assert.ok(near(wrap64(3 * Math.PI), Math.PI) || near(wrap64(3 * Math.PI), -Math.PI));
  assert.ok(CAM64.elMin > 0 && CAM64.elMin < 0.3, 'the horizon in the frame at the bottom of the range'); assert.ok(CAM64.elMax > 1.3 && CAM64.elMax < Math.PI / 2, 'the top view at the top');
});

test('build 64: a drag — right turns the camera round (az up), up tilts toward the horizon (el down), down toward the top view; the whole tilt in tiltPx', () => {
  const o = orbit64(0.9, 0.52, 17);
  const r = drag64(o, 100, 0); assert.ok(r.az > o.az && near(r.az - o.az, (100 / CAM64.turnPx) * Math.PI)); assert.equal(r.el, o.el); assert.equal(r.d, o.d);
  const u = drag64(o, 0, -80); assert.ok(u.el < o.el, 'up: toward the horizon'); const dn = drag64(o, 0, 80); assert.ok(dn.el > o.el, 'down: toward the top view');
  assert.equal(drag64(o, 0, -10000).el, CAM64.elMin); assert.equal(drag64(o, 0, 10000).el, CAM64.elMax);
  const full = drag64({ ...o, el: CAM64.elMin }, 0, CAM64.tiltPx); assert.ok(near(full.el, CAM64.elMax), 'tiltPx px for the whole range');
});

test('build 64: a pinch — the fingers apart bring the camera nearer, together farther; the ratio bounded; two64 the middle and the span', () => {
  const o = orbit64(0, 0.5, 30);
  assert.ok(near(pinch64(o, 2).d, 15)); assert.ok(near(pinch64(o, 0.5).d, 60)); assert.equal(pinch64(o, 100).d, CAM64.dMin); assert.equal(pinch64(o, 0.01).d, CAM64.dMax);
  assert.ok(near(pinch64(o, 0).d, 30) && near(pinch64(o, null).d, 30), 'no ratio: as it was');
  const m = two64({ x: 100, y: 200 }, { x: 160, y: 280 }); assert.deepEqual(m, { x: 130, y: 240, L: 100 });
});

test('build 64: the view of an orbit, and the orbit of a view — the one the other way round (an act\'s frame taken over by the thumb)', () => {
  const t = [10, 5, -20], o = orbit64(0.9, 0.52, 17), v = view64(o, t);
  assert.deepEqual(v.t, t); assert.ok(near(Math.hypot(v.p[0] - t[0], v.p[1] - t[1], v.p[2] - t[2]), 17)); assert.ok(near(v.p[1], 5 + Math.sin(0.52) * 17));
  const b = fromView64(v); assert.ok(near(b.az, o.az) && near(b.el, o.el) && near(b.d, o.d));
  const top = view64(orbit64(0, CAM64.elMax, 20), t); assert.ok(top.p[1] > t[1] + 19, 'the top view over him'); const hz = view64(orbit64(0, CAM64.elMin, 20), t); assert.ok(hz.p[1] - t[1] < 3, 'the horizon view near his level');
  const back = ease64(orbit64(3.0, 0.5, 20), orbit64(-3.0, 0.9, 40), 1 / CAM64.ease); assert.ok(near(back.az, -3.0, 1e-3), `the shortest way round, through π: ${back.az}`); assert.ok(back.el > 0.5 && back.d > 20);
});

test('build 64: the pull-in — the camera comes nearer along its own line until the look point is seen, never under dMin; a clear line keeps its distance', () => {
  const t = [0, 3, 0], o = orbit64(0.5, 0.4, 40);
  assert.equal(pull64(o, t, () => false), 40);
  const wallAt = 25, d1 = pull64(o, t, (p) => Math.hypot(p[0] - t[0], p[1] - t[1], p[2] - t[2]) > wallAt); assert.ok(d1 <= wallAt && d1 > wallAt * CAM64.pull - 1e-9, `pulled in to under the wall's distance: ${d1}`);
  assert.equal(pull64(o, t, () => true), CAM64.dMin);
  let calls = 0; pull64(o, t, () => { calls++; return true; }); assert.ok(calls <= CAM64.pullSteps + 1);
});

test('build 64 har42: wired — the orbit from the save or the follow\'s pose; the right thumb\'s drag and the pinch on the walk; two fingers on the thing during an act; the act\'s own frame first; kept in the save', () => {
  assert.match(H, /import \{ CAM64, orbit64, drag64, pinch64, view64, fromView64, pull64, two64 \} from '\.\/cam64\.js';/);
  assert.match(H, /st\.cam64 = R\.cam64 && typeof R\.cam64 === 'object' \? orbit64\(\+R\.cam64\.az \|\| FOLLOW\.az, \+R\.cam64\.el \|\| FOLLOW\.el, \+R\.cam64\.d \|\| FOLLOW\.d\) : orbit64\(FOLLOW\.az, FOLLOW\.el, FOLLOW\.d\);/);
  assert.match(H, /if \(f\.side === 'R' && f\.px > WALK61\.dead && !st\.job\) \{ st\.cam64 = drag64\(st\.cam64, f\.x - f\.lx, f\.y - f\.ly\); st\.turned64 = 1; \}/);
  assert.match(H, /if \(sd === 'R' && st\.look61 && !st\.pinch64\) \{ st\.pinch64 = /);
  assert.match(H, /function pinchMove64\(a, b\)/);
  assert.match(H, /function followView\(h\) \{ const t = \[h\.x, h\.y \+ heroHeight\(\) \* 0\.45, h\.z\], o = \{ \.\.\.st\.cam64, d: Math\.max\(st\.cam64\.d, needD\(\) \+ 1\) \}; return view64\(\{ \.\.\.o, d: pull64\(o, t, blocked64\) \}, t\); \}/);
  assert.match(H, /function blocked64\(p, t\)/); assert.match(H, /stages\.occluded\(t\[0\], t\[1\], t\[2\], \{ x: p\[0\], y: p\[1\], z: p\[2\] \}\)/); assert.match(H, /stages\.frameBlocked\(p\[0\], p\[1\], p\[2\], t\[0\], t\[1\], t\[2\], STG\)/);
  assert.match(H, /if \(st\.act && st\.act\.down && st\.act\.id !== e\.pointerId && !\(st\.job && st\.job\.raw\)\) \{/, 'a second finger on the thing ends the first finger\'s gesture and takes the frame');
  assert.match(H, /if \(!st\.act64\) st\.act64 = fromView64\(\{ p: \[cq\.p\.x, cq\.p\.y, cq\.p\.z\], t: \[cq\.t\.x, cq\.t\.y, cq\.t\.z\] \}\);/);
  assert.match(H, /if \(st\.act64\) \{ const o = \{ \.\.\.st\.act64, d: pull64\(st\.act64, v\.t, blocked64\) \}; v = view64\(o, v\.t\); camTo\(v\.p, v\.t, Math\.min\(1, dt \* CAM64\.ease\)\); \}/);
  assert.match(H, /st\.lock54 = null; st\.act64 = null; st\.two64 = null; svgClear\(\);/, 'a new act: its own frame first');
  assert.match(H, /if \(st\.turned64\) \{ R\.cam64 = \{ \.\.\.st\.cam64 \}; save42\(S\); \}/);
  assert.doesNotMatch(H, /liftView61|lift61\(/, 'the lift of build 61 is gone');
  assert.match(H, /cam64: \(\) => \(\{ \.\.\.st\.cam64, act: st\.act64/);
});

test('build 64 har42: the owner\'s reports — a short beacon post (not a 16-amah column); the hammer works named in Hebrew on the site', () => {
  assert.match(H, /new THREE\.CylinderGeometry\(0\.35, 0\.5, 5, 12, 1, true\), gm\); col\.position\.y = 2\.5;/);
  assert.doesNotMatch(H, /CylinderGeometry\(0\.9, 0\.9, 16, 14, 1, true\)/);
  assert.match(H, /hammer0: 'הפטיש בסלע הראשון', hammer1: 'הפטיש בסלע השני'/);
});

test('build 64: no Divine Name (by code points); עולי רגל', () => {
  const N = [String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05d4), String.fromCharCode(0x05d9, 0x05d4, 0x05d5, 0x05bc, 0x05d4)], P = String.fromCharCode(0x05e6, 0x05dc, 0x05d9, 0x05d9, 0x05e0);
  for (const f of ['src/game/cam64.js', 'src/game/har42.js', 'test/build64.test.mjs']) {
    const s = read(f).normalize('NFC').replace(/[֑-ׇ]/g, (c) => (c === 'ּ' ? c : ''));
    for (const n of N) assert.ok(!s.includes(n) && !read(f).includes(n), `${f}: a Name`); assert.ok(!s.includes(P), `${f}: עולי רגל`);
  }
});
