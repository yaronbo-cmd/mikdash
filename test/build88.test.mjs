// build 88: the owner, 3.11 — "הדמויות, העגלה ומתקן הורדה נראות רחוק מאוד ממצב יפה … בוא נבנה עולם טוב יותר. יפה יותר. מעניין יותר":
// every man (the kohen, the crews, the acts' people) is people88's — a real body (Quaternius CC0) dressed at load in the clothes of the time;
// the hand cart and the crane's timbers in the kit's real wood. Never a Divine Name.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { GAME_BUILD } from '../src/avodah/shift/lobby35.js';
import { PEOPLE88, clipName88, partOf88, tailor88, skirt88 } from '../src/game/people88.js';
import { grain88, PROPS88 } from '../src/game/props88.js';

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), 'utf8');

test('build 88: GAME_BUILD 88', () => { assert.equal(GAME_BUILD, 101); });

test('build 88: the old clip and bone names map onto the new body', () => {
  for (const k of ['Idle', 'Walking_A', 'Running_A', 'PickUp', 'Interact', '2H_Melee_Attack_Chop', 'Cheer', 'Sit_Floor_Idle']) assert.ok(/_/.test(clipName88(k)) || clipName88(k) === 'Interact', k);
  assert.equal(clipName88('Walking_A'), 'Walk_Loop'); assert.equal(clipName88('Walk_Loop'), 'Walk_Loop');
  for (const k of ['head', 'spine', 'chest', 'hips', 'upperlegl', 'lowerlegr', 'footl', 'handr', 'upperarml']) assert.ok(PEOPLE88.bones[k], k);
});

test('build 88: the tailor — the cloth is the body copied where it covers, pushed out, the same weights; the skirt hangs to the hem', () => {
  // a tiny "body": two triangles on the spine (cloth), one on the head (not)
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([0, 1, 0, 1, 1, 0, 0, 2, 0, 1, 2, 0, 0, 3, 0, 1, 3, 0], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute([0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1], 3));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4));
  g.setAttribute('skinWeight', new THREE.Float32BufferAttribute([1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0], 4));
  g.setIndex([0, 1, 2, 1, 3, 2, 2, 3, 4, 3, 5, 4]);
  const names = ['spine_02', 'Head'];
  const W = new Float32Array([1, 0, 0, 0]); assert.equal(partOf88(names, new Float32Array([0, 0, 0, 0]), W, 0), 'shirt'); assert.equal(partOf88(names, new Float32Array([1, 0, 0, 0]), W, 0), 'head');
  const c = tailor88(g, names, (p) => p === 'shirt', 0.02, 0);
  assert.ok(c.index.count >= 6 && c.index.count < 12, 'the shirt, not the head');
  const P = c.getAttribute('position'); for (let i = 0; i < P.count; i++) assert.ok(Math.abs(P.getZ(i) - 0.02) < 1e-6, 'off the skin');
  const s = skirt88({ x: 0, y: 1, z: 0 }, 1, 0.1, 0.2, 0.25, { spine: 0, pelvis: 1, thighL: 2, thighR: 3 });
  const SP = s.getAttribute('position'), SW = s.getAttribute('skinWeight'); let lo = Infinity; for (let i = 0; i < SP.count; i++) { lo = Math.min(lo, SP.getY(i)); const w = SW.getX(i) + SW.getY(i) + SW.getZ(i) + SW.getW(i); assert.ok(Math.abs(w - 1) < 1e-5); }
  assert.ok(Math.abs(lo - 0.1) < 1e-6, 'to the hem');
});

test('build 88: wiring — the acts, the crews and the kohen are people88; the KayKit body is gone from the page; the cart and the crane in wood', () => {
  assert.match(read('src/game/fig84.js'), /createPeople88\(o\)/);
  const c = read('src/crew71.js'); assert.match(c, /createPeople88\(\{\}\)/); assert.match(c, /f\.pf\.dress\(/); assert.match(c, /\n\s+f\.m\.rotation\.y = c\.yaw; f\.m\.scale\.setScalar\(/, 'his facing and size in code, not in a comment');
  const h = read('src/avodah/shift/hero35.js'); assert.match(h, /P88\.make\(\{ white: true/);
  for (const f of ['src/game/fig84.js', 'src/crew71.js', 'src/avodah/shift/hero35.js']) assert.doesNotMatch(read(f), /import KOHEN_URL/, f);
  const H = read('src/game/har42.js'); assert.match(H, /P88w\.wagon88\(/); assert.match(H, /P88w\.wood88\('a'/);
  const geo = grain88(new THREE.BoxGeometry(0.2, 3.2, 0.2), 3.2), uv = geo.getAttribute('uv'); let mx = 0; for (let i = 0; i < uv.count; i++) mx = Math.max(mx, uv.getY(i)); assert.ok(Math.abs(mx - 3.2 / PROPS88.grainLen) < 1e-6, 'the grain repeats along the timber');
  assert.match(read('docs/PEOPLE88.md'), /CC0 1\.0/);
});

test('build 88: stage 03 after the owner\'s playtest of 87 — the hold, the gentle touch, the walk back, no bows in the building', async () => {
  const F84 = await import('../src/game/soreg84.js'); const { DEP63, open63 } = await import('../src/game/site63.js'); const C = F84.SOREG84;
  assert.equal(F84.hold88(0), 0); assert.ok(F84.hold88(0.05) < 0.2, 'a short hold: slow'); assert.ok(F84.hold88(C.holdRamp) >= 0.99, 'held: full speed');
  assert.ok(F84.hold88(10) === C.holdMax && C.holdMax * C.vDown > C.vChip[0] * C.vBreakK, 'held too long: past the break');
  const spec = { tol: 0.01, tolZ: 0.01, tolR: 0.01, damp: 3, sway0: 0.3, swayZ0: 0, twist0: 0, r0: 0, vChip: 1, vBreak: 1.8, wind: 0 };
  const J = F84.createHoist84(spec); J.state().yb = C.postH + 0.01; let s = null; for (let n = 0; n < 3; n++) s = J.step(1 / 60, 0.3 / 60, 0, false);
  assert.equal(s.jams, 0, 'slow onto the post top: a touch, not a knock');
  const K = F84.createHoist84(spec); K.state().yb = C.postH + 0.05; for (let n = 0; n < 6; n++) s = K.step(1 / 60, 2.5 / 60, 0, false);
  assert.ok(s.jams >= 1, 'fast: a knock');
  const W = F84.createWalk85(F84.warn85(1, () => 0.5)); for (let n = 0; n < 120; n++) W.step(1 / 60, true, false); const x1 = W.state().x; for (let n = 0; n < 60; n++) W.step(1 / 60, false, true); assert.ok(W.state().x < x1 - 0.5, 'he walks back');
  assert.match(read('src/game/har42.js'), /w8\.backH = dd < 0/);
  assert.ok(!('bows' in DEP63.soreg)); assert.deepEqual(open63('soreg', ['open', 'lattice0', 'lattice1', 'lattice2', 'warn', 'bows', 'reveal'], ['lattice0', 'lattice1', 'lattice2', 'warn']), ['reveal']);
});
