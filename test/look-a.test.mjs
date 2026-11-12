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
test('the paving: a slab is its cell less the joint, chamfered; a laid quarter is one mesh with a tone per slab and the dust under it', async () => {
  const { paveSlab, paveQuarter, JOINT } = await import('../src/look/paving.js');
  // (a no-op canvas: the detail texture is drawn on one, and node has none)
  const ctx = new Proxy({}, { get: (o, k) => (k in o ? o[k] : (k === 'createRadialGradient' || k === 'createLinearGradient' ? () => ({ addColorStop() {} }) : k === 'getImageData' ? (x, y, w, h) => ({ data: new Uint8ClampedArray(w * h * 4) }) : () => {})), set: (o, k, v) => { o[k] = v; return true; } });
  const had = globalThis.document; globalThis.document = { createElement: () => ({ width: 0, height: 0, getContext: () => ctx }) };
  try {
  const s = paveSlab(THREE, 2 - JOINT, 1 - JOINT, { cracked: true }), b = s.userData.body; b.geometry.computeBoundingBox();
  const bb = b.geometry.boundingBox; assert.ok(Math.abs(bb.max.x - bb.min.x - (2 - JOINT)) < 1e-6 && Math.abs(bb.max.z - bb.min.z - (1 - JOINT)) < 1e-6);
  assert.equal(s.children.length, 2, 'the crack');
  assert.ok(b.geometry.attributes.position.count / 3 <= 40);
  const q = paveQuarter(THREE, [[0.5, 0.5, 1 - JOINT, 1 - JOINT], [1.5, 0.5, 1 - JOINT, 1 - JOINT]], { y: 0, box: [0, 0, 2], seed: 3 });
  const C = q.geometry.attributes.color, n = C.count / 2; assert.ok(C.getX(0) !== C.getX(n) || C.getY(0) !== C.getY(n) || C.getZ(0) !== C.getZ(n), 'two tones');
  assert.ok(q.userData.dust && q.userData.dust.position.y < 0.17);
  } finally { if (had === undefined) delete globalThis.document; else globalThis.document = had; }
});
test('the rocks: each its own tone in hsl 30..42, 10..18 %, 52..66 %; the fresh breaks lighter than the skins', async () => {
  const { rockTint, freshTint } = await import('../src/look/rock.js');
  const seen = new Set(); let sumF = 0, sumS = 0;
  for (let i = 0; i < 64; i++) {
    const hex = rockTint(i * 3.7 + 1.3); seen.add(hex); const [h, s, l] = hexHsl(hex);
    assert.ok(h > 29 && h < 43 && s > 9 && s < 19 && l > 51 && l < 67, hex);
    const [, , lf] = hexHsl(freshTint(i * 1.91 + 0.4)); assert.ok(lf > 61 && lf < 80, 'fresh ' + lf); sumF += lf; sumS += l;
  }
  assert.ok(seen.size >= 60, 'no two alike: ' + seen.size);
  assert.ok(sumF > sumS + 64 * 5, 'the fresh breaks lighter than the skins');
});
