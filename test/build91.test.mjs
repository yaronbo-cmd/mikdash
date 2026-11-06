// build 91: stage 01's crane made like the world's treadwheel crane (the owner, 3.11 21:09, a picture of it: "המנוף הזה ברקע עובד יפה.
// צריך שגם המנוף של המשחק ייראה ויעבוד אותו דבר"); the corner stone comes up from below, outside the Mount ("מאחורי ההר מלמטה למעלה"),
// into its gap in the east wall's top course ("להתחבר לקיר שנבנה"); the walk pulls toward the open works ("ההליכה… לא מגנטית"). Never a Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as F91 from '../src/game/crane91.js';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { LINE42 } from '../src/game/har42.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');
const C = F91.CRANE91, win = [0.6, 0.8], pickY = -51.6, topY = F91.top91() + C.clear;

test('build 91: GAME_BUILD 91', () => { assert.equal(GAME_BUILD, 107); });

test('build 91: the pole\'s angle puts its head over the place asked; leaning out over the slope, near upright over the wall', () => {
  for (const x of [C.pickX, C.slotX]) assert.ok(Math.abs(C.bx + F91.reach91(F91.angleFor91(x)) - x) < 1e-9);
  assert.ok(F91.angleFor91(C.pickX) > F91.angleFor91(C.slotX) + 0.2, 'out further over the slope');
  assert.ok(C.bx + F91.reach91(F91.angleFor91(C.pickX)) > 277 + 4, 'the stone lies outside the wall (outer face x 277)');
  for (const x of [C.pickX, C.slotX]) assert.ok(C.floor + F91.poleAt91(C.backX - 1.2, F91.angleFor91(x)) > F91.top91() + 0.8, 'the pole passes over the wall\'s top, not through it');
});

test('build 91: the stone comes up from below outside, then the pole swings it in; over its gap in the window, past it above the window', () => {
  const p0 = F91.path91(0, win, pickY, topY), pUp = F91.path91(C.rise, win, pickY, topY), pW = F91.path91(0.7, win, pickY, topY), pHi = F91.path91(1.0, win, pickY, topY);
  assert.ok(Math.abs(p0.hy - pickY) < 1e-9 && Math.abs(p0.x - C.pickX) < 1e-6, 'at first: where it lies, under the head');
  assert.ok(Math.abs(pUp.hy - topY) < 1e-9 && Math.abs(pUp.x - C.pickX) < 1e-6, 'up first, straight up, outside');
  for (let y = 0; y < C.rise; y += 0.02) assert.ok(F91.path91(y, win, pickY, topY).x > 277 + 1, 'outside the wall while it rises');
  assert.ok(Math.abs(pW.x - C.slotX) < 1e-6 && pW.over, 'over its gap at the window\'s middle');
  assert.ok(pHi.x < C.slotX - 4 && !pHi.over, 'past it: over the floor inside');
  for (const y of [0.6, 0.8]) assert.ok(F91.path91(y, win, pickY, topY).over, `the window's edge ${y} still over the wall's top`);
  assert.ok(topY - 0.9 > F91.top91() + 0.5, 'its foot clears the wall\'s top as it swings in');
});

test('build 91: his stretch of the east wall — courses from the trench to the floor, his gap in the top course, nothing in it', () => {
  const W = F91.wall91(), top = W.filter((q) => q[1] > F91.base91()), face = top.filter((q) => q[6]);
  assert.ok(W.length > 60);
  for (const q of face) assert.ok(q[2] + q[3] / 2 <= C.z - C.len / 2 + 0.05 || q[2] - q[3] / 2 >= C.z + C.len / 2 - 0.05, `no stone in the gap (${q[2]})`);
  assert.ok(face.some((q) => Math.abs(q[2] + q[3] / 2 - (C.z - C.len / 2)) < 0.05) && face.some((q) => Math.abs(q[2] - q[3] / 2 - (C.z + C.len / 2)) < 0.05), 'its neighbours meet it on both sides');
  assert.ok(Math.abs(Math.max(...W.map((q) => q[1] + q[4] / 2)) - F91.top91()) < 0.05 && F91.top91() > C.floor + 5, 'the top over the floor: a wall from inside too');
  assert.ok(Math.abs(Math.min(...W.map((q) => q[1] - q[4] / 2)) - C.trench) < 0.05, 'the foot in the trench');
});

test('build 91: the walk\'s pull — toward the nearest open work in front, from 14 amot; not one behind, not one far', () => {
  const h = { x: 0, z: 0 }, d = { x: 1, z: 0 };
  const p = F91.pull91(d, h, [{ x: 8, z: 5 }, { x: 30, z: 0 }]); assert.ok(p.z > 0.2, 'bent toward the near work');
  assert.deepEqual(F91.pull91(d, h, [{ x: -6, z: 0 }]), d, 'not one behind');
  assert.deepEqual(F91.pull91(d, h, [{ x: 20, z: 3 }]), d, 'not one far');
  const close = F91.pull91(d, h, [{ x: 2, z: 2 }]); assert.ok(Math.abs(close.x - Math.SQRT1_2) < 0.05, 'close: straight to it');
});

test('build 91: wiring — the crane, the wall, the lift and the corner along the wall, the pull; lines sourced', () => {
  const h = read('src/game/har42.js');
  assert.match(h, /const ON91 = ON62 && qs\('h91'\) !== '0'/);
  assert.match(h, /if \(STG === 'har' && ON91\) props91\(add\); else if \(STG === 'har'\)/);
  assert.match(h, /if \(ON91 && st\.props\.c91\) \{ st\.job = mkLift91\(L\); return; \}/);
  assert.match(h, /function pose91\(a, hx, hy, hz\)/); assert.match(h, /F91\.wall91\(C\)/); assert.match(h, /Kh\.lift\(C\.tread\)/);
  assert.match(h, /const at91 = \(u\) => \(Z91 \?/); assert.match(h, /F91\.pull91\(d0, h, st\.site63\.map/);
  for (const k of ['lift91', 'lift91b']) { const t = LINE42[k]; assert.ok(/המחשה/.test(t), k); assert.ok(t.split(' · ')[0].length <= 50, `${k} head`); }
});
