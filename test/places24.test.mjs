// PLACES24: the works on their REAL places (anchors.js · places24.js · kit anchor mode), in node:
// the anchors (the ten places, their floors, their views, the markers on free floor); every anchored work played by taps alone through a
// real kit (three.js, no renderer): each frame every drawn piece stands within 3 amot of the place's footprint, none sunk below the floor
// there, the ramp's kohen on the slope; no red; no Divine Name in the new files; the errands re-pointed to the real spots.
//   node --test test/places24.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as THREE from 'three';
import { ANCHORS, placeGround, rampY, WORK_ANCHOR } from '../src/avodah/works/anchors.js';
import { createKit, isRed } from '../src/avodah/works/kit.js';
import { ANCHORED, TASK_ANCHOR, moveMarkers } from '../src/avodah/works/places24.js';
import { deshen, maaracha, taleh } from '../src/avodah/works/dawn.js';
import { shaarim, heichal, zerika, evarim } from '../src/avodah/works/dawn2.js';
import { ketoret, birkat, neirot, erev } from '../src/avodah/works/tamid.js';
import { shir, shir2 } from '../src/avodah/works/song.js';
import { night } from '../src/avodah/works/night.js';
import { free } from '../src/avodah/day/world22.js';
import { WALLS22 } from '../src/avodah3d.js';

const IDS = ['altar', 'ramp', 'menorah', 'golden', 'laver', 'duchan', 'steps', 'nikanor', 'pen', 'moked', 'rings'];
test('the ten real places: point, facing, area, view, the marker on free floor', () => {
  for (const id of IDS) {
    const A = ANCHORS[id]; assert.ok(A, id);
    for (const k of ['x', 'y', 'z', 'K']) assert.ok(Number.isFinite(A[k]), `${id}.${k}`);
    assert.equal(Math.round(Math.hypot(A.face[0], A.face[1]) * 1000), 1000, `${id} face is a unit`);
    assert.equal(A.area.length, 4); assert.ok(A.view && A.view.p.length === 3 && A.view.t.length === 3, `${id} view`);
    assert.ok(free(A.hero[0], A.hero[1]), `${id}: the marker ${A.hero} on free floor`);
    assert.ok(/[א-ת]/.test(A.he), `${id} Hebrew name`);
    const p = A.view.p;
    if (A.inside) assert.ok(p[0] < -98 && p[0] > -138 && Math.abs(p[2]) < 10 && p[1] > 22 && p[1] < 62, `${id}: the camera inside the Heichal room ${p}`);
    else for (const r of WALLS22) assert.ok(!(p[0] > r.x0 && p[0] < r.x1 && p[2] > r.z0 && p[2] < r.z1 && p[1] < placeGround(p[0], p[2]) + 2), `${id}: the view's camera ${p} not in a solid`);
  }
});
test('the real floors: the ramp slope, the altar top, the steps, the Heichal, Nikanor', () => {
  assert.equal(placeGround(-38, 42.5), 16); assert.equal(placeGround(-38, 26.5), rampY(26.5)); assert.ok(Math.abs(rampY(26.5) - 20.5) < 1e-9);
  assert.equal(placeGround(-33, 2), 25); assert.equal(placeGround(-70.5, 0), 21); assert.equal(placeGround(-74, 0), 22); assert.equal(placeGround(-121, 0), 22);
  assert.equal(placeGround(3, 0), 13.5); assert.equal(placeGround(-8.5, -8), 14.5);
});
test('the works → their anchors; the errands re-pointed to the real spots', () => {
  for (const w in ANCHORED) assert.ok(ANCHORS[ANCHORED[w].anchor], `${w}: anchor ${ANCHORED[w].anchor}`);
  for (const w in WORK_ANCHOR) assert.ok(ANCHORS[WORK_ANCHOR[w]], w);
  const P = {}, T = Object.keys(TASK_ANCHOR).map((id) => ({ id, place: 'old' }));
  moveMarkers(P, T);
  for (const t of T) { assert.equal(t.place, 'p24' + TASK_ANCHOR[t.id]); assert.ok(P[t.place] && free(P[t.place].x, P[t.place].z), t.id); }
});

// ── every anchored work, played by taps alone through a real kit ──
const WORKS = { deshen, maaracha, taleh, shaarim, heichal, ketoret, birkat, neirot, shir, shir2, night, zerika, evarim, erev };
function kitNode() {
  const scene = new THREE.Scene();
  const k = createKit({ scene, camera: null, ground: placeGround, hero: () => ({ x: 0, y: 16, z: 0, yaw: 0 }) });
  k.label = () => {}; k.darkNow = () => 0.5;   // (no canvas in node)
  return k;
}
for (const id in WORKS) {
  test(`${id}: on its real place — every piece within 3 amot, none sunk, taps alone finish it`, () => {
    const W = WORKS[id], A = ANCHORED[id]; assert.ok(A, id);
    const k = kitNode(); k.place({ anchor: typeof A.anchor === 'function' ? A.anchor() : A.anchor }); if (A.begin) A.begin(k);
    const M = W.model({});
    let t = 0, since = 0, frames = 0, far = 0, farMax = 0, sunk = 0, onRamp = 0, below = 0, reds = 0; const seen = new Set();
    while (!M.done && t < 120) {
      M.step(0.05); t += 0.05; since += 0.05;
      if (since >= 0.35) { since = 0; M.touch(true); M.step(0.05); t += 0.05; M.touch(false); M.twinTap(); }
      k.begin(); A.draw(k, M, t, 0.05); k.end(); frames++; seen.add(k.F.anchor);
      const ar = k.F.A.area;
      for (const p of k.points()) {
        const dx = Math.max(ar[0] - p[0], 0, p[0] - ar[1]), dz = Math.max(ar[2] - p[2], 0, p[2] - ar[3]), d = Math.hypot(dx, dz);
        if (d > 3) far++; farMax = Math.max(farMax, d);
        if (p[3][0] !== 'g' && p[1] < placeGround(p[0], p[2]) - 0.45) sunk++;
        if (id === 'deshen' && p[3] === 'cyl' && p[0] > -45.5 && p[0] < -30.5 && p[2] > 12 && p[2] < 42) { onRamp++; if (p[1] < rampY(p[2]) - 0.4) below++; }
      }
      reds += k.reds();
      const tg = A.target(M, k); assert.ok(tg.every(Number.isFinite), `${id} target`);
    }
    assert.ok(M.done, `${id} done by taps (i ${M.i}/${M.n})`); assert.ok(t <= 60, `${id} ${t.toFixed(1)} s`);
    assert.equal(far, 0, `${id}: ${far} pieces beyond 3 amot of the place (max ${farMax.toFixed(2)})`);
    assert.equal(sunk, 0, `${id}: ${sunk} pieces sunk below the floor`);
    assert.equal(reds, 0, `${id}: red pieces`);
    assert.ok(k.F.view && k.F.view.p.every(Number.isFinite), `${id}: the camera wish`);
    if (id === 'deshen') { assert.ok(onRamp > 20, `the kohen sampled on the ramp (${onRamp})`); assert.equal(below, 0, 'the kohen walks on the slope, never in it'); }
    if (id === 'ketoret') for (const a of ['steps', 'altar', 'golden']) assert.ok(seen.has(a), `ketoret passes the ${a}`);
    if (A.end) A.end(k, M);
  });
}
test('no Divine Name, no red hex in the new files', () => {
  const NAME = new RegExp(['ה׳', 'אלקים', 'א-ל', String.fromCharCode(0x05D9, 0x05D4, 0x05D5, 0x05D4)].join('|'))   /* (the Name's pattern from \u escapes: never written in full, even in a test) */;
  for (const f of ['src/avodah/works/anchors.js', 'src/avodah/works/places24.js']) {
    const src = fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
    assert.ok(!NAME.test(src), `${f}: no Name`);
    for (const m of src.matchAll(/'!?#([0-9A-Fa-f]{6})'/g)) assert.ok(!isRed(m[1]), `${f}: ${m[1]} is red`);
  }
});
