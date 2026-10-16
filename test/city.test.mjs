// WORLD (wave 6): src/city.js — Jerusalem builds within budget, keeps clear of the Mount, the streets and the pools; every
// tap box has a card; the beauty cameras are well formed; terrainH's carved pits stay far from the platform.
//   node --test test/city.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { buildJerusalem, LANDMARKS, BEAUTY, PLAN } from '../src/city.js';
import { CARVE, terrainH } from '../src/world.js';
import { PLAT } from '../src/mount.js';
import { INFO } from '../src/info.js';

globalThis.innerHeight = 844; globalThis.devicePixelRatio = 1;
const B = { tris: 0, geo(k, g) { this.tris += g.attributes.position.count / 3; }, box() { this.tris += 12; }, slab() { this.tris += 12; }, cyl(k, a, b, c, d, e, f, seg = 16) { this.tris += seg * 4; } };
const picks = [];
const scene = new THREE.Scene();
const city = buildJerusalem(scene, B, (id, x0, y0, z0, x1, y1, z1) => picks.push({ id, x0, y0, z0, x1, y1, z1 }), {});
const houses = [];
scene.traverse((o) => {
  if (!o.isInstancedMesh || /pergola|awning/.test(o.name)) return;
  const m = new THREE.Matrix4(), p = new THREE.Vector3();
  for (let i = 0; i < o.count; i++) { o.getMatrixAt(i, m); p.setFromMatrixPosition(m); houses.push([p.x, p.y, p.z, o.name]); }
});
const dSeg = (px, pz, ax, az, bx, bz) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(px - ax - dx * t, pz - az - dz * t); };
const dLine = (L, x, z) => Math.min(...L.slice(1).map((b, i) => dSeg(x, z, ...L[i], ...b)));

test('the city builds within its budget', () => {
  let tris = 0;
  scene.traverse((o) => { if (o.isInstancedMesh) tris += o.count * o.geometry.attributes.position.count / 3; });
  assert.ok(houses.length > 3000 && houses.length < 7000, `houses ${houses.length}`);
  assert.ok(tris < 420000, `instanced triangles ${tris}`);
  assert.ok(B.tris < 110000, `batch triangles ${B.tris}`);
  const meshes = []; scene.traverse((o) => { if (o.isMesh || o.isPoints) meshes.push(o); });
  assert.ok(meshes.length <= 12, `the city's own draw calls ${meshes.length}`);
});

test('houses keep clear of the Mount, the stepped street and the pools', () => {
  for (const [x, , z, name] of houses) {
    assert.ok(!(x > PLAT.X0 - 40 && x < PLAT.X1 + 40 && z > PLAT.Z0 - 110 && z < PLAT.Z1 + 70), `${name} on the Mount's margin at ${x | 0},${z | 0}`);
    assert.ok(dLine(PLAN.STEPPED, x, z) > 10, `${name} on the stepped street at ${x | 0},${z | 0}`);
    for (const P of [PLAN.SIL, PLAN.BETH]) assert.ok(Math.abs(x - P.x) > P.hw || Math.abs(z - P.z) > P.hd, `${name} in a pool at ${x | 0},${z | 0}`);
  }
});

test('every tap box has a draft card; the landmark keys are CONTENT\'s', () => {
  for (const id of new Set(picks.map((p) => p.id))) {
    assert.ok(INFO[id], `no card for ${id}`);
    assert.match(INFO[id].s, /טיוטה/);
  }
  for (const k of ['tower_hippicus', 'tower_phasael', 'tower_mariamne', 'herod_palace', 'first_wall', 'second_wall', 'upper_city', 'lower_city', 'tyropoeon', 'xystus', 'siloam_pool', 'stepped_street', 'bethesda', 'mount_of_olives', 'kidron']) assert.ok(LANDMARKS[k], k);
  const text = JSON.stringify(INFO);
  assert.ok(!new RegExp('\\u05D9\\u05D4\\u05D5\\u05D4').test(text), 'a Divine Name in a card');   // (built from escapes: never written in the repo)
});

test('the beauty cameras are well formed', () => {
  assert.ok(Object.keys(BEAUTY).length >= 5);
  for (const [k, b] of Object.entries(BEAUTY)) {
    assert.ok(Array.isArray(b.p) && b.p.length === 3 && b.p.every(Number.isFinite), k);
    assert.ok(Array.isArray(b.t) && b.t.length === 3 && b.t.every(Number.isFinite), k);
    assert.ok(['dawn', 'noon', 'dusk', 'night', 'golden'].includes(b.time), k);
    assert.ok(b.he && b.he.length > 3, k);
    assert.ok(b.p[1] > terrainH(b.p[0], b.p[2]) + 10, `${k}: the camera is under the ground`);
  }
});

test('terrainH is unchanged on and near the platform (the carves are elsewhere)', () => {
  const X0 = PLAT.X0 - 150, X1 = PLAT.X1 + 150, Z0 = PLAT.Z0 - 150, Z1 = PLAT.Z1 + 150, carved = [];
  for (let x = X0; x <= X1; x += 10) for (let z = Z0; z <= Z1; z += 10) carved.push(terrainH(x, z));
  const saved = CARVE.splice(0);
  try {
    let i = 0;
    for (let x = X0; x <= X1; x += 10) for (let z = Z0; z <= Z1; z += 10) assert.equal(carved[i++], terrainH(x, z), `terrainH changed at ${x},${z}`);
  } finally { CARVE.push(...saved); }
});
