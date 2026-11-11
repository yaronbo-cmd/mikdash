// look round A: the stone system's pure parts and its geometry (docs/specs/look/A-things-in-hand.md)
import test from 'node:test';
import assert from 'node:assert/strict';
import * as THREE from 'three';
import { TONES, stoneTint, neighbourTint, toneIndex, hsl2hex, ashlarGeo, plainGeo, chipGeo, chipOf, ASH_HEX } from '../src/look/stone.js';

const hexHsl = (hex) => { const c = new THREE.Color(hex), o = {}; c.getHSL(o, THREE.SRGBColorSpace); return [o.h * 360, o.s * 100, o.l * 100]; };

test('the 8 tones: cream-white limestone, hue 34..46, saturation 10..22 %, lightness 76..84 %', () => {
  assert.equal(TONES.length, 8);
  for (const [h, s, l] of TONES) { assert.ok(h >= 34 && h <= 46); assert.ok(s >= 10 && s <= 22); assert.ok(l >= 76 && l <= 84); }
  for (let i = 0; i < 200; i++) { const [h, s, l] = hexHsl(stoneTint(i * 1.37)); assert.ok(h > 31 && h < 49, 'hue ' + h); assert.ok(s > 7 && s < 26, 'sat ' + s); assert.ok(l > 74 && l < 87, 'light ' + l); }
  const [h, s, l] = hexHsl(ASH_HEX); assert.ok(Math.abs(h - 40) < 2 && Math.abs(s - 16) < 2 && Math.abs(l - 80) < 1.5);
  assert.equal(hsl2hex(0, 0, 100), '#ffffff');
});
test('a row never repeats its neighbour\'s tone, and every tone is used', () => {
  let prev = -1; const seen = new Set();
  for (let i = 0; i < 500; i++) { const t = neighbourTint(prev, i * 0.731 + 2); assert.notEqual(t.i, prev); seen.add(t.i); prev = t.i; }
  assert.equal(seen.size, 8);
  const idx = new Set(); for (let i = 0; i < 200; i++) idx.add(toneIndex(i)); assert.equal(idx.size, 8);
});
test('the ashlar: unit size, ≤ 140 triangles, chamfered; the chipped ones keep the bounding box and the bearing faces', () => {
  const g = ashlarGeo(THREE), n = g.attributes.position.count / 3;
  assert.ok(n <= 140, n + ' triangles');
  const bb = g.boundingBox; for (const k of ['x', 'y', 'z']) { assert.ok(Math.abs(bb.min[k] + 0.5) < 1e-6); assert.ok(Math.abs(bb.max[k] - 0.5) < 1e-6); }
  assert.ok(plainGeo(THREE).attributes.position.count / 3 <= 140);
  for (let k = 0; k < 3; k++) {
    const c = chipGeo(THREE, k); c.computeBoundingBox();
    for (const a of ['x', 'y', 'z']) { assert.ok(Math.abs(c.boundingBox.min[a] + 0.5) < 1e-6); assert.ok(Math.abs(c.boundingBox.max[a] - 0.5) < 1e-6); }
    // (the bottom face untouched: every vertex at y = −0.5 of the plain ashlar is still there)
    const P = c.attributes.position, P0 = g.attributes.position; let moved = 0;
    for (let i = 0; i < P.count; i++) if (P0.getY(i) < -0.49 && (P.getX(i) !== P0.getX(i) || P.getY(i) !== P0.getY(i) || P.getZ(i) !== P0.getZ(i))) moved++;
    assert.equal(moved, 0);
  }
  let chipped = 0; for (let i = 0; i < 1000; i++) if (chipOf(i * 3.77 + 0.25) >= 0) chipped++;
  assert.ok(chipped > 140 && chipped < 260, 'about one in five: ' + chipped);
});
test('every triangle of the ashlar faces outward', () => {
  const g = ashlarGeo(THREE), P = g.attributes.position, a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3();
  for (let t = 0; t < P.count; t += 3) {
    a.fromBufferAttribute(P, t); b.fromBufferAttribute(P, t + 1); c.fromBufferAttribute(P, t + 2);
    const n = b.clone().sub(a).cross(c.clone().sub(a)), cen = a.clone().add(b).add(c).multiplyScalar(1 / 3);
    assert.ok(n.dot(cen) > -1e-9);
  }
});
