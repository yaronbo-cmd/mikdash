/* ── build 131 ── h131/pour3d.js — the pour's look in the world: the approved sample's (samples/yetzika/main.js) as it is, set on the court
 * at the level's section (pourlv.js frameOf: one group at the section's middle, turned so the near board faces the player). From the
 * sample, kept: the mix as one height field coloured by its heat (dark, hot orange, gold; glossy while liquid, a matte stone colour as it
 * sets), the closed passage's ochre ring and its glow, the pale pulse of the dry pocket it cut off, the bubbles that rise from it, the
 * stream from the trough, the cauldron rig (two crew on a pole, the cauldron that tilts, the next one on the fire), the knocker with his
 * wooden mallet, the teardown's chunks, the full section's gleam and "מלא!"; its sounds (wood, stone, fire, bubbling — nothing metal),
 * now through the game's own audio context. New for the game: the stones fall in one by one; level 3's timber and reeds (a clogged reed
 * goes dark); the spill's stream over the timber and its stain on the floor; the overlay's words and rings at the world's points.
 *   createPourView(X, lv, sim, o) → { G, frame(dt, S), word, ring, burst, sfx, dropStone(i), stoneUp(i), setReed(j, clogged), dispose }
 *   POUR3D = { init, sync, frame, rest, owns }   the world's hooks (world.js): the patches and stains he left, from the save's marks
 */
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { NX, NZ, DX, W, D, H, X0, Z0, N, T, cellX, cellZ, mulberry32, stoneHeightAt, stoneRadiusScale } from './sim.js';
import { LEVELS, frameOf, yawOf, toWorld, REED_R, REED_H, patchR, patchSeed, patchK } from './pourlv.js';
import { BOOK } from '../world/grid.js';

const S8 = BOOK.s08;
const BT = 0.36;                       // (the sample's board thickness)
/** b131 look round 2: what went over the timber is a stain on the floor and a loss from this much on (pour.js SPILL_MARK): the spec's table */
export const SPILL_SEEN = 0.05;
const RIG_Z = 6.45, POLE_Y = 1.82, TROUGH_LEN = 2.2, KNOCK_HOME = [6.9, 4.7];   // (b131 fix round 1: at [7.6, 5.6] the frame's bottom-right edge cut him in every first frame: at the near corner, whole)
const RELIEF = 1.2, MOUND_VIS = 0.42, LUT_N = 64, STREAM_SEG = 18, MAXB = 48, MAXD = 48;

export function createPourView(X, lv, sim, o = {}) {
  const THREE = X.THREE, L = LEVELS[lv], F = frameOf(lv), rnd = mulberry32(1234 + lv), R = mulberry32(77 + lv);
  const col = (hex) => new THREE.Color(hex);
  const G = new THREE.Group(); G.name = 'h131-pour'; G.position.set(F.cx, F.y, F.cz);
  const B0 = o.base || 0;   // (level 2: the crew, the spout and the knocker stand on section 1, set an amah high)
  G.rotation.y = yawOf(lv);
  X.props.root.add(G);
  const disposables = [];
  const keep = (x) => { disposables.push(x); return x; };

  /* ── the sample's merged vertex-coloured geometry ── */
  function GeoBuilder() { this.p = []; this.c = []; this.i = []; }
  GeoBuilder.prototype.box = function (x0, y0, z0, x1, y1, z1, color, jitter = 0) {
    const P = this.p, C = this.c, I = this.i;
    const faces = [[[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], 1.0], [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], 0.86], [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], 0.8], [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], 0.9], [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], 0.84]];
    for (const f of faces) { const b = P.length / 3; for (let v = 0; v < 4; v++) { P.push(f[v][0], f[v][1], f[v][2]); const j = 1 + (rnd() - 0.5) * jitter; C.push(color.r * f[4] * j, color.g * f[4] * j, color.b * f[4] * j); } I.push(b, b + 1, b + 2, b, b + 2, b + 3); }
  };
  GeoBuilder.prototype.build = function () { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3)); g.setIndex(this.i); g.computeVertexNormals(); return g; };
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
  function Merger() { this.list = []; }
  Merger.prototype.add = function (geo, color, pos, rot, scale) {
    const g = geo.index ? geo.toNonIndexed() : geo.clone();
    if (g.attributes.uv) g.deleteAttribute('uv'); if (g.attributes.uv1) g.deleteAttribute('uv1'); if (!g.attributes.normal) g.computeVertexNormals();
    if (pos || rot || scale) { _e.set(rot ? rot[0] : 0, rot ? rot[1] : 0, rot ? rot[2] : 0); _q.setFromEuler(_e); _v.set(pos ? pos[0] : 0, pos ? pos[1] : 0, pos ? pos[2] : 0); if (typeof scale === 'number') _s.set(scale, scale, scale); else _s.set(scale ? scale[0] : 1, scale ? scale[1] : 1, scale ? scale[2] : 1); g.applyMatrix4(_m4.compose(_v, _q, _s)); }
    if (!g.attributes.color) { const n = g.attributes.position.count, a = new Float32Array(n * 3); for (let j = 0; j < n; j++) { a[j * 3] = color.r; a[j * 3 + 1] = color.g; a[j * 3 + 2] = color.b; } g.setAttribute('color', new THREE.BufferAttribute(a, 3)); }
    this.list.push(g); return this;
  };
  Merger.prototype.build = function () { const g = mergeGeometries(this.list, false); for (const x of this.list) x.dispose(); this.list.length = 0; return keep(g); };
  const vcMat = keep(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.84, flatShading: true }));
  const figMat = keep(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, flatShading: true }));

  /* ── the segment's boards (four, an amah high; a side that lies on the frame or on a set section is that one's and is not drawn) ── */
  {
    const gb = new GeoBuilder(), wood = [col(0xa8743f), col(0x9b6936), col(0xb07c45)];
    const plank = (x0, z0, x1, z1) => { gb.box(x0, 0, z0, x1, 0.49, z1, wood[0], 0.05); gb.box(x0, 0.5, z0, x1, H, z1, wood[1], 0.05); gb.box(x0 + 0.01, 0.48, z0 + 0.01, x1 - 0.01, 0.51, z1 - 0.01, col(0x5d3d1e), 0); };
    const skip = o.skipSides || {};
    if (!skip.far) plank(X0 - BT, -D / 2 - BT, X0 + W + BT, -D / 2);
    if (!skip.near) plank(X0 - BT, D / 2, X0 + W + BT, D / 2 + BT);
    if (!skip.left) plank(X0 - BT, -D / 2, X0, D / 2);
    if (!skip.right) plank(X0 + W, -D / 2, X0 + W + BT, D / 2);
    const m = new THREE.Mesh(gb.build(), vcMat); m.castShadow = true; m.receiveShadow = true; G.add(m); keep(m.geometry);
  }

  /* ── the field stones (one mesh each: they fall in one by one) ── */
  const stones = [];
  {
    const pal = [col(0xa89c8a), col(0x9d927f), col(0xb4a893), col(0x92897a)], tintPal = col(0xa98c74);
    const US = [0, 0.36, 0.6, 0.77, 0.88, 0.95, 0.985, 1.0], NT = 18;
    const smat = keep(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82 }));
    for (const s of sim.shapes) {
      const P = [], C = [], I = [], base = s.tint ? tintPal : pal[Math.floor(rnd() * pal.length)], c = Math.cos(s.rot), sn = Math.sin(s.rot);
      for (let r = 0; r < US.length; r++) for (let t = 0; t < NT; t++) {
        const th = (t / NT) * Math.PI * 2, u = Math.min(US[r], 1.0), rs = stoneRadiusScale(s, th), ex = u * rs * Math.cos(th), ez = u * rs * Math.sin(th), lx = ex * s.rx, lz = ez * s.rz;
        const wx = Math.max(-5.95, Math.min(5.95, s.x + lx * c - lz * sn)), wz = Math.max(-3.95, Math.min(3.95, s.z + lx * sn + lz * c));   // (inside the boards: none crosses a beam)
        let y = US[r] >= 1 ? -0.03 : stoneHeightAt(s, wx, wz); y = y * Math.min(1, 0.72 / Math.max(0.1, s.h));   // (b131 look round 2: a stone two men carry, its top under the mix — the sim keeps its own heights) if (r > 0 && r < 4) y += (rnd() - 0.5) * 0.04 * s.h;
        P.push(wx - s.x, y, wz - s.z); const shade = 0.88 + rnd() * 0.16 + (y / s.h) * 0.08; C.push(base.r * shade, base.g * shade, base.b * shade);
      }
      for (let r = 0; r < US.length - 1; r++) for (let t = 0; t < NT; t++) { const a = r * NT + t, b = r * NT + (t + 1) % NT, c2 = (r + 1) * NT + t, d = (r + 1) * NT + (t + 1) % NT; I.push(a, b, c2, b, d, c2); }
      const g = keep(new THREE.BufferGeometry()); g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3)); g.setIndex(I); g.computeVertexNormals();
      const m = new THREE.Mesh(g, smat); m.castShadow = true; m.position.set(s.x, 0, s.z); G.add(m);
      stones.push({ m, s, fall: -1, y0: 4 + rnd() * 1.5 });
    }
  }
  /* ── level 3: the south timber (its end in the segment) and the two reeds ── */
  const reeds = [];
  if (L.timber) {   // (the south timber itself is the world's: world.js draws it from the prep on)
    const rmat = keep(new THREE.MeshStandardMaterial({ color: 0xb7a76a, roughness: 0.7 })), hole = keep(new THREE.MeshBasicMaterial({ color: 0x1d140c }));
    for (const [x, z] of L.reeds) {
      const g = new THREE.Group(); g.position.set(x, 0, z); G.add(g);
      const tube = new THREE.Mesh(keep(new THREE.CylinderGeometry(REED_R, REED_R, REED_H, 10, 1, true)), rmat); tube.position.y = REED_H / 2; tube.castShadow = true; g.add(tube);
      const mouth = new THREE.Mesh(keep(new THREE.CircleGeometry(REED_R * 0.85, 10)), hole); mouth.rotation.x = -Math.PI / 2; mouth.position.y = REED_H - 0.02; g.add(mouth);
      const knot = new THREE.Mesh(keep(new THREE.TorusGeometry(REED_R * 1.02, 0.02, 4, 10)), rmat); knot.rotation.x = Math.PI / 2; knot.position.y = REED_H * 0.55; g.add(knot);
      const plugM = new THREE.Mesh(keep(new THREE.CircleGeometry(REED_R * 0.86, 10)), keep(new THREE.MeshStandardMaterial({ color: 0x4b3025, roughness: 0.6 }))); plugM.rotation.x = -Math.PI / 2; plugM.position.y = REED_H - 0.01; plugM.visible = false; g.add(plugM);
      reeds.push({ g, plugM });
    }
  }

  /* ── the mix: one dynamic height field (the sample's, cell for cell) ── */
  const fluidU = { uTime: { value: 0 }, uHL: { value: 0 }, uGleam: { value: 0 }, uGleamPos: { value: -20 } };
  const fluidGeo = keep(new THREE.BufferGeometry());
  const fPos = new Float32Array(N * 3), fNor = new Float32Array(N * 3), fCol = new Float32Array(N * 3), fMat = new Float32Array(N * 4);
  const fH = new Float32Array(N), fSurf = new Float32Array(N), bS = new Float32Array(N), bN = new Float32Array(N), bM = new Float32Array(N);
  for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) { const c = k * NX + i; fPos[c * 3] = i === 0 ? X0 + 0.02 : i === NX - 1 ? X0 + W - 0.02 : cellX(i); fPos[c * 3 + 2] = k === 0 ? Z0 + 0.02 : k === NZ - 1 ? Z0 + D - 0.02 : cellZ(k); fNor[c * 3 + 1] = 1; }
  {
    const idx = new Uint16Array((NX - 1) * (NZ - 1) * 6); let n = 0;
    for (let k = 0; k < NZ - 1; k++) for (let i = 0; i < NX - 1; i++) { const a = k * NX + i, b = a + 1, c = a + NX, d = c + 1; if ((i + k) & 1) { idx[n++] = a; idx[n++] = c; idx[n++] = b; idx[n++] = b; idx[n++] = c; idx[n++] = d; } else { idx[n++] = a; idx[n++] = c; idx[n++] = d; idx[n++] = a; idx[n++] = d; idx[n++] = b; } }
    fluidGeo.setIndex(new THREE.BufferAttribute(idx, 1));
  }
  const aPos = new THREE.BufferAttribute(fPos, 3).setUsage(THREE.DynamicDrawUsage), aNor = new THREE.BufferAttribute(fNor, 3).setUsage(THREE.DynamicDrawUsage);
  const aCol = new THREE.BufferAttribute(fCol, 3).setUsage(THREE.DynamicDrawUsage), aMat = new THREE.BufferAttribute(fMat, 4).setUsage(THREE.DynamicDrawUsage);
  fluidGeo.setAttribute('position', aPos); fluidGeo.setAttribute('normal', aNor); fluidGeo.setAttribute('color', aCol); fluidGeo.setAttribute('aMat', aMat);
  fluidGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 8);
  const fluidMat = keep(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2, envMapIntensity: 0.15 }));   // (the sample has no sky in its glass: the world's would whiten the hot mix's steep edges)
  fluidMat.onBeforeCompile = (sh) => {
    Object.assign(sh.uniforms, fluidU);
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute vec4 aMat;\nvarying vec4 vMat;\nvarying vec3 vLP;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvMat = aMat;\nvLP = position;');
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nuniform float uTime, uHL, uGleam, uGleamPos;\nvarying vec4 vMat;\nvarying vec3 vLP;')
      .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(0.95, 0.1, clamp(vMat.x, 0.0, 1.0));')
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float shim = 0.78 + 0.22 * sin(uTime * 3.3 + vLP.x * 5.0 + sin(vLP.z * 4.2 + uTime * 1.9) * 2.2);
      totalEmissiveRadiance += diffuseColor.rgb * vMat.y * shim * 1.25;
      float pulse = 0.5 + 0.5 * sin(uTime * 5.5);
      totalEmissiveRadiance += vec3(0.42, 0.68, 1.0) * vMat.z * mix(1.0, 0.1 + 0.9 * pulse, uHL) * 0.9;
      totalEmissiveRadiance += vec3(0.95, 0.55, 0.12) * vMat.w * (0.25 + 0.75 * pulse) * uHL * 0.8;
      float gb = exp(-pow(vLP.x * 0.8 + vLP.z * 0.45 - uGleamPos, 2.0) * 1.5);
      totalEmissiveRadiance += vec3(1.0, 0.92, 0.7) * gb * uGleam;`);
  };
  const fluid = new THREE.Mesh(fluidGeo, fluidMat); fluid.receiveShadow = true; fluid.frustumCulled = false; G.add(fluid);
  const liqLUT = new Float32Array(LUT_N * 3);
  {
    const stops = [[0.0, 0x3a2a20], [0.2, 0x4a2a1c], [0.32, 0x6b2a12], [0.45, 0x9a3210], [0.6, 0xd9550f], [0.78, 0xff7a12], [0.92, 0xffa232], [1.0, 0xffc458]], a = new THREE.Color(), b = new THREE.Color();
    for (let j = 0; j < LUT_N; j++) { const h = j / (LUT_N - 1); let s = 0; while (s < stops.length - 2 && h > stops[s + 1][0]) s++; const f = (h - stops[s][0]) / (stops[s + 1][0] - stops[s][0]); a.setHex(stops[s][1]); b.setHex(stops[s + 1][1]); a.lerp(b, Math.min(1, Math.max(0, f))); liqLUT[j * 3] = a.r; liqLUT[j * 3 + 1] = a.g; liqLUT[j * 3 + 2] = a.b; }
  }
  const cPlug = col(0x5a3812), cHard = col(0x7b6d5f), cHardPatch = col(0x8f7458), cFresh = col(0x4b3025), cAir = col(0x8ec3f7), cSealFlash = col(0xc9bfae), cDryFloor = col(0xd8cbb0);
  const sealGlow = new Float32Array(N), pocketMask = new Uint8Array(N), pocketDone = new Uint8Array(N);
  const FX = { pocketPulse: 0, pulseT: 9, glowOn: false, settle: 0 };
  function updateFluidMesh(sink, hlOn) {
    const vol = sim.vol, solid = sim.solid, ground = sim.ground, heat = sim.heat, hol = sim.hollow, plug = sim.plug, fa = sim.freezeAge, patch = sim.patch;
    for (let c = 0; c < N; c++) { const m = (vol[c] + solid[c]) * sink; if (sink < 0.999 && (ground[c] > 0.2 || sink < 0.05)) { fSurf[c] = -9; continue; } fSurf[c] = (m > 0.0015 || (hlOn && hol[c]) || (FX.pocketPulse > 0.01 && pocketMask[c] && hol[c])) ? ground[c] + m + 0.006 : -9; }
    const sp = sim.spout;
    if (sp.q > 0.001) {
      const amp = MOUND_VIS * Math.pow(sp.q / T.QMAX, 0.8), i0 = Math.max(0, Math.floor((sp.lx - 1.2 - X0) / DX)), i1 = Math.min(NX - 1, Math.ceil((sp.lx + 1.2 - X0) / DX)), k0 = Math.max(0, Math.floor((sp.lz - 1.2 - Z0) / DX)), k1 = Math.min(NZ - 1, Math.ceil((sp.lz + 1.2 - Z0) / DX));
      for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) { const c = k * NX + i; if (fSurf[c] < -1 || vol[c] < 0.01) continue; const dx = cellX(i) - sp.lx, dz = cellZ(k) - sp.lz; fSurf[c] += amp * Math.exp(-(dx * dx + dz * dz) / 0.6); }
    }
    for (let k = 0; k < NZ; k++) { const row = k * NX; for (let i = 0; i < NX; i++) { let sm = 0, n = 0; for (let d = -2; d <= 2; d++) { const ii = i + d; if (ii < 0 || ii >= NX) continue; const v = fSurf[row + ii]; if (v > -1) { sm += v; n++; } } bS[row + i] = sm; bN[row + i] = n; } }
    for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) { let sm = 0, n = 0; for (let d = -2; d <= 2; d++) { const kk = k + d; if (kk < 0 || kk >= NZ) continue; sm += bS[kk * NX + i]; n += bN[kk * NX + i]; } bM[k * NX + i] = n > 0 ? sm / n : 0; }
    for (let c = 0; c < N; c++) if (fSurf[c] > -1 && vol[c] > 0.003) { const y = fSurf[c] + RELIEF * (fSurf[c] - bM[c]) * Math.min(1, vol[c] / 0.08), floorY = ground[c] + solid[c] * sink + 0.006; fSurf[c] = y > floorY ? y : floorY; }
    for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
      const c = k * NX + i; let y = fSurf[c];
      if (y < -1) { let m = -9; if (i > 0 && fSurf[c - 1] > m) m = fSurf[c - 1]; if (i < NX - 1 && fSurf[c + 1] > m) m = fSurf[c + 1]; if (k > 0 && fSurf[c - NX] > m) m = fSurf[c - NX]; if (k < NZ - 1 && fSurf[c + NX] > m) m = fSurf[c + NX]; y = m > -1 ? Math.min(ground[c], m) - 0.08 : -0.25; }
      fH[c] = y; fPos[c * 3 + 1] = y;
    }
    const inv = 1 / (2 * DX);
    for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
      const c = k * NX + i, hl = fH[i > 0 ? c - 1 : c], hr = fH[i < NX - 1 ? c + 1 : c], hd = fH[k > 0 ? c - NX : c], hu = fH[k < NZ - 1 ? c + NX : c];
      const nx = (hl - hr) * inv, nz = (hd - hu) * inv, l = 1 / Math.sqrt(nx * nx + 1 + nz * nz); fNor[c * 3] = nx * l; fNor[c * 3 + 1] = l; fNor[c * 3 + 2] = nz * l;
      const v = vol[c]; let r, g, b, gloss, emi;
      if (v > 0.0015) { const h = heat[c], j = Math.max(0, Math.min(LUT_N - 1, Math.round(h * (LUT_N - 1)))) * 3; r = liqLUT[j]; g = liqLUT[j + 1]; b = liqLUT[j + 2]; gloss = 0.62 + 0.38 * Math.min(1, h * 1.3); const e = Math.max(0, (h - 0.33) / 0.67); emi = e * e * 0.42 + (h > 0.25 ? 0.03 : 0); }
      else if (solid[c] > 0.0015) { const f = Math.max(Math.min(1, fa[c] / 2.2), FX.settle), hc = patch[c] ? cHardPatch : cHard; r = cFresh.r + (hc.r - cFresh.r) * f; g = cFresh.g + (hc.g - cFresh.g) * f; b = cFresh.b + (hc.b - cFresh.b) * f; gloss = 0.5 * (1 - f) + 0.05; emi = 0; const sg = sealGlow[c]; if (sg > 0) { r += (cSealFlash.r - r) * sg; g += (cSealFlash.g - g) * sg; b += (cSealFlash.b - b) * sg; gloss = 0.05; } }
      else { r = cDryFloor.r; g = cDryFloor.g; b = cDryFloor.b; gloss = 0.1; emi = 0; }
      let hh = 0, hp = 0;
      if (!hlOn && FX.pocketPulse > 0.01 && pocketMask[c] && hol[c] && v <= 0.0015) { const pp = FX.pocketPulse; r += (cAir.r - r) * pp; g += (cAir.g - g) * pp; b += (cAir.b - b) * pp; hh = pp * 0.8; }
      if (hlOn) { if (hol[c]) { hh = 1; r = cAir.r; g = cAir.g; b = cAir.b; gloss = 0.3; emi = 0; } if (plug[c]) { hp = 1; r = cPlug.r; g = cPlug.g; b = cPlug.b; gloss = 0.2; emi = 0; } }
      fCol[c * 3] = r; fCol[c * 3 + 1] = g; fCol[c * 3 + 2] = b; fMat[c * 4] = gloss; fMat[c * 4 + 1] = emi; fMat[c * 4 + 2] = hh; fMat[c * 4 + 3] = hp;
    }
    aPos.needsUpdate = true; aNor.needsUpdate = true; aCol.needsUpdate = true; aMat.needsUpdate = true;
  }

  /* ── the sample's low-poly figures (whole, a tool in hand) ── */
  const skinCol = col(0xc58b5e);
  function makeFigure(robeHex, clothHex, sashHex) {
    const robeC = col(robeHex), clothC = col(clothHex), sashC = col(sashHex), g = new THREE.Group(), body = new THREE.Group(); g.add(body);
    const part = (mg, parent, x, y) => { const m = new THREE.Mesh(mg.build(), figMat); m.castShadow = true; const p = new THREE.Group(); p.position.set(x, y, 0); p.add(m); parent.add(p); return p; };
    const legM = () => new Merger().add(new THREE.CylinderGeometry(0.12, 0.11, 1.3, 6), skinCol, [0, -0.65, 0]).add(new THREE.BoxGeometry(0.22, 0.12, 0.38), clothC, [0, -1.3, 0.08]);
    const legL = part(legM(), body, -0.2, 1.38), legR = part(legM(), body, 0.2, 1.38);
    part(new Merger().add(new THREE.CylinderGeometry(0.42, 0.66, 1.65, 8), robeC, [0, 1.32, 0]).add(new THREE.CylinderGeometry(0.44, 0.44, 0.62, 8), robeC, [0, 2.35, 0]).add(new THREE.CylinderGeometry(0.47, 0.5, 0.16, 8), sashC, [0, 1.98, 0]).add(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 6), skinCol, [0, 2.72, 0]).add(new THREE.IcosahedronGeometry(0.3, 1), skinCol, [0, 2.98, 0]).add(new THREE.SphereGeometry(0.33, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), clothC, [0, 3.0, -0.03], [-0.25, 0, 0]).add(new THREE.BoxGeometry(0.5, 0.5, 0.08), clothC, [0, 2.72, -0.28], [0.2, 0, 0]), body, 0, 0);
    const armM = () => new Merger().add(new THREE.CylinderGeometry(0.1, 0.085, 1.05, 6), skinCol, [0, -0.52, 0]).add(new THREE.CylinderGeometry(0.15, 0.13, 0.55, 6), robeC, [0, -0.25, 0]).add(new THREE.IcosahedronGeometry(0.11, 0), skinCol, [0, -1.08, 0]);
    const armL = part(armM(), body, -0.52, 2.55), armR = part(armM(), body, 0.52, 2.55);
    return { g, body, legL, legR, armL, armR, walk: 0 };
  }
  function poseWalk(f, phase, amt) { const s = Math.sin(phase) * 0.55 * amt; f.legL.rotation.x = s; f.legR.rotation.x = -s; f.body.position.y = Math.abs(Math.cos(phase)) * 0.06 * amt; }
  const angDiff = (a, b) => { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; };

  /* ── the fire with the next cauldron (the book's hearth: S8.fire, in the section's frame), the rig, the spout, the knocker ── */
  const fireL = S8.pourAt ? S8.pourAt.hearth.slice() : (() => { const [x, z] = S8.fire, f = F; return [(x - f.cx) * f.s, (z - f.cz) * f.s]; })();   // (b131 look round: the hearth by the near board, as the approved sample: the cauldron over its fire in the picture)
  const FIRE = new THREE.Vector3(fireL[0], 0, fireL[1]);
  const fireNear = Math.hypot(fireL[0], fireL[1] - RIG_Z) < 20;   // (a far hearth: the crew walk toward it out of the picture and come back)
  const SWAP_TO = fireNear ? new THREE.Vector3(FIRE.x + 2.2, 0, FIRE.z + 0.2) : new THREE.Vector3((fireL[0] < 0 ? -1 : 1) * 11, 0, RIG_Z + 1.2);   // (a far hearth: out along the near board, never across the segment)
  const clayHex = 0xa4573a;
  const cauldronRadiusAt = (y) => { const prof = [[-1.0, 0.0], [-0.99, 0.3], [-0.9, 0.52], [-0.68, 0.68], [-0.42, 0.72], [-0.15, 0.66], [0.02, 0.52], [0.08, 0.5]]; for (let j = 0; j < prof.length - 1; j++) if (y <= prof[j + 1][0]) { const f = (y - prof[j][0]) / (prof[j + 1][0] - prof[j][0]); return prof[j][1] + (prof[j + 1][1] - prof[j][1]) * f; } return 0.5; };
  const cauldronGeo = (() => { const pts = [[0.0, -1.0], [0.3, -0.99], [0.52, -0.9], [0.68, -0.68], [0.72, -0.42], [0.66, -0.15], [0.52, 0.02], [0.5, 0.08], [0.57, 0.12], [0.55, 0.16], [0.47, 0.13], [0.45, 0.04]].map(([r, y]) => new THREE.Vector2(r, y)); const mg = new Merger(), w = col(0xffffff); mg.add(new THREE.LatheGeometry(pts, 14), w); const hg = new THREE.TorusGeometry(0.13, 0.04, 5, 8); for (const s of [-1, 1]) mg.add(hg, w, [s * 0.55, 0.02, 0], [0, Math.PI / 2, 0]); return mg.build(); })();
  function makeCauldron() {
    const mat = keep(new THREE.MeshStandardMaterial({ color: clayHex, roughness: 0.85, flatShading: true, side: THREE.DoubleSide, emissive: 0xff4a10, emissiveIntensity: 0 }));
    const pot = new THREE.Mesh(cauldronGeo, mat); pot.castShadow = true;
    const mixMat = keep(new THREE.MeshStandardMaterial({ color: 0xffa040, emissive: 0xff7a18, emissiveIntensity: 1, roughness: 0.25 }));
    const mix = new THREE.Mesh(keep(new THREE.CircleGeometry(1, 16)), mixMat); mix.rotation.x = -Math.PI / 2;
    const g = new THREE.Group(); g.add(pot, mix); return { g, pot, mat, mix, mixMat };
  }
  function setCauldronLook(cd, amountFrac, heat) {
    const y = -0.95 + 0.97 * Math.max(0, Math.min(1, amountFrac)); cd.mix.visible = amountFrac > 0.01; cd.mix.position.y = y;
    const r = cauldronRadiusAt(y) - 0.02; cd.mix.scale.set(r, r, 1);
    const j2 = Math.max(0, Math.min(LUT_N - 1, Math.round(heat * 0.82 * (LUT_N - 1)))) * 3;
    cd.mixMat.color.setRGB(liqLUT[j2], liqLUT[j2 + 1], liqLUT[j2 + 2]); cd.mixMat.emissive.setRGB(liqLUT[j2], liqLUT[j2 + 1], liqLUT[j2 + 2]);
    const e = Math.max(0, (heat - 0.3) / 0.7); cd.mixMat.emissiveIntensity = e * e * 0.3; cd.mat.emissiveIntensity = e * e * 0.35;
  }
  const flames = [];
  const fireG = new THREE.Group(); fireG.position.copy(FIRE); G.add(fireG);
  {
    const fm = [keep(new THREE.MeshBasicMaterial({ color: 0xffb030 })), keep(new THREE.MeshBasicMaterial({ color: 0xff6a14 }))];
    const logs = new Merger(), logCol = col(0x5a3a20), lg = new THREE.CylinderGeometry(0.09, 0.1, 1.4, 6);
    for (let j = 0; j < 4; j++) logs.add(lg, logCol, [0, 0.12 + j * 0.05, 0], [0, j * Math.PI / 4, Math.PI / 2]);
    const st = new Merger(), stoneCol = col(0x9c8f7c); for (let j = 0; j < 3; j++) { const a = j * 2.1 + 0.3; st.add(new THREE.IcosahedronGeometry(0.28, 0), stoneCol, [Math.cos(a) * 0.55, 0.28, Math.sin(a) * 0.55]); }
    fireG.add(new THREE.Mesh(logs.build(), vcMat), new THREE.Mesh(st.build(), vcMat));
    const ember = new THREE.Mesh(keep(new THREE.CircleGeometry(0.75, 12)), keep(new THREE.MeshBasicMaterial({ color: 0xff7a2a }))); ember.rotation.x = -Math.PI / 2; ember.position.y = 0.03; fireG.add(ember);
    for (let j = 0; j < 5; j++) { const f = new THREE.Mesh(keep(new THREE.ConeGeometry(0.2 + rnd() * 0.1, 0.9, 5)), fm[j % 2]); const a = j * 1.3; f.position.set(Math.cos(a) * 0.3, 0.45, Math.sin(a) * 0.3); fireG.add(f); flames.push(f); }
  }
  const nextCauldron = makeCauldron(); nextCauldron.g.position.set(0, 1.55, 0); fireG.add(nextCauldron.g);
  const rig = new THREE.Group(); G.add(rig); rig.position.set(0, B0, RIG_Z);
  const pole = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.07, 0.07, 3.6, 6)), keep(new THREE.MeshStandardMaterial({ color: 0x8a5a2e, roughness: 0.85, flatShading: true })));
  pole.rotation.z = Math.PI / 2; pole.position.set(0, POLE_Y, 0); pole.castShadow = true; rig.add(pole);
  const tiltGroup = new THREE.Group(); tiltGroup.position.set(0, POLE_Y, 0); rig.add(tiltGroup);
  const potA = makeCauldron(); potA.g.position.set(0, -0.05, 0); tiltGroup.add(potA.g);
  const crewL = makeFigure(0xd9c9a6, 0xa65a38, 0x7d5a3a), crewR = makeFigure(0xc9b48c, 0x5f7391, 0x6b4a2e);
  crewL.g.position.set(-1.6, 0, 0); crewL.g.rotation.y = Math.PI / 2; crewR.g.position.set(1.6, 0, 0); crewR.g.rotation.y = -Math.PI / 2; rig.add(crewL.g, crewR.g);
  const spout = new THREE.Group(); G.add(spout); spout.position.y = B0;
  const trough = new THREE.Group(); spout.add(trough);
  {
    const wc = col(0xa06c3a), wc2 = col(0x94622f);
    const tmesh = new THREE.Mesh(new Merger().add(new THREE.BoxGeometry(0.42, 0.06, TROUGH_LEN), wc, [0, 0, -TROUGH_LEN / 2]).add(new THREE.BoxGeometry(0.06, 0.2, TROUGH_LEN), wc2, [-0.21, 0.08, -TROUGH_LEN / 2]).add(new THREE.BoxGeometry(0.06, 0.2, TROUGH_LEN), wc2, [0.21, 0.08, -TROUGH_LEN / 2]).build(), figMat); tmesh.castShadow = true; trough.add(tmesh);
    const leg = new THREE.BoxGeometry(0.08, 1.4, 0.08);
    const trestle = new THREE.Mesh(new Merger().add(leg, wc2, [-0.3, 0.62, 5.55], [0, 0, -0.12]).add(leg, wc2, [0.3, 0.62, 5.55], [0, 0, 0.12]).add(new THREE.BoxGeometry(0.75, 0.08, 0.1), wc, [0, 1.28, 5.55]).build(), figMat); trestle.castShadow = true; spout.add(trestle);
  }
  const troughMixMat = keep(new THREE.MeshBasicMaterial({ color: 0xffa040 }));
  const troughMix = new THREE.Mesh(keep(new THREE.BoxGeometry(0.3, 0.02, TROUGH_LEN - 0.1)), troughMixMat); troughMix.position.set(0, 0.04, -TROUGH_LEN / 2); trough.add(troughMix);
  const knocker = makeFigure(0xb9a27a, 0x6f8450, 0x5d7a4a); knocker.g.position.set(KNOCK_HOME[0], B0, KNOCK_HOME[1]); knocker.g.rotation.y = -2.3; G.add(knocker.g);
  { const mallet = new THREE.Group(), mm = new THREE.Mesh(new Merger().add(new THREE.CylinderGeometry(0.045, 0.05, 1.5, 6), col(0x8c5f34), [0, -0.75, 0]).add(new THREE.CylinderGeometry(0.2, 0.2, 0.55, 8), col(0x6e4a2a), [0, -1.5, 0], [0, 0, Math.PI / 2]).build(), figMat); mm.castShadow = true; mallet.add(mm); mallet.position.set(0, -1.05, 0.05); knocker.armR.add(mallet); }
  knocker.armR.rotation.x = -0.25;
  // the stream ribbon, the short stream from the lip, the spill's stream over the timber
  const sPos = new Float32Array((STREAM_SEG + 1) * 6), sCol = new Float32Array((STREAM_SEG + 1) * 6), streamGeo = keep(new THREE.BufferGeometry());
  { const idx = []; for (let j = 0; j < STREAM_SEG; j++) { const a = j * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } streamGeo.setIndex(idx); }
  const aSPos = new THREE.BufferAttribute(sPos, 3).setUsage(THREE.DynamicDrawUsage), aSCol = new THREE.BufferAttribute(sCol, 3).setUsage(THREE.DynamicDrawUsage);
  streamGeo.setAttribute('position', aSPos); streamGeo.setAttribute('color', aSCol);
  const stream = new THREE.Mesh(streamGeo, keep(new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }))); stream.frustumCulled = false; G.add(stream);
  const lipStream = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.07, 0.05, 1, 6)), troughMixMat); lipStream.geometry.translate(0, -0.5, 0); G.add(lipStream);
  // bubbles and droplets
  const bubbleMesh = new THREE.InstancedMesh(keep(new THREE.IcosahedronGeometry(1, 1)), keep(new THREE.MeshStandardMaterial({ color: 0xe6ddd2, roughness: 0.1, transparent: true, opacity: 0.92, emissive: 0x7a4a2a, emissiveIntensity: 0.3 })), MAXB);
  bubbleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); bubbleMesh.frustumCulled = false; bubbleMesh.count = 0; G.add(bubbleMesh);
  const dropMesh = new THREE.InstancedMesh(keep(new THREE.IcosahedronGeometry(1, 0)), keep(new THREE.MeshBasicMaterial({ color: 0xffa23a })), MAXD);
  dropMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); dropMesh.frustumCulled = false; dropMesh.count = 0; G.add(dropMesh);
  const bubbles = [], drops = []; for (let j = 0; j < MAXB; j++) bubbles.push({ on: false }); for (let j = 0; j < MAXD; j++) drops.push({ on: false });
  // the teardown's chunks
  const chunks = [];
  { const cm = keep(new THREE.MeshStandardMaterial({ color: 0x7b6d5f, roughness: 0.95, flatShading: true })), cg = keep(new THREE.DodecahedronGeometry(1, 0)); for (let j = 0; j < 8; j++) { const m = new THREE.Mesh(cg, cm); m.visible = false; m.castShadow = true; G.add(m); chunks.push({ m }); } }
  // the spill's stain on the floor beyond the timber (level 3): a dark flat patch that grows with what went over
  let stain = null;
  if (L.timber) { stain = new THREE.Mesh(keep(patchGeo(THREE, 1, 7.3)), keep(new THREE.MeshStandardMaterial({ color: 0x8c8172, roughness: 0.95, transparent: true, opacity: 0.95, polygonOffset: true, polygonOffsetFactor: -2 }))); stain.rotation.x = -Math.PI / 2; stain.position.set(0, 0.02, D / 2 + BT + 0.9); stain.scale.set(0.01, 0.01, 1); stain.visible = false; G.add(stain); }

  /* ── the sounds (the sample's, synthesized; through the game's audio context and its mute) ── */
  let actx = null, master = null, noiseBuf = null, pourGain = null, pourFilt = null, pourGain2 = null, fireGain = null;
  const muted = () => { try { return !!(X.sfx && X.sfx.muted); } catch (e) { return true; } };
  function initAudio() {
    if (actx) return actx.state === 'running';
    try { actx = X.sfx && X.sfx.context; } catch (e) { actx = null; } if (!actx) return false;
    const mk = (sec, fill) => { const n = Math.floor(actx.sampleRate * sec), b = actx.createBuffer(1, n, actx.sampleRate); fill(b.getChannelData(0), actx.sampleRate); return b; };
    master = actx.createGain(); master.gain.value = muted() ? 0 : 0.8; master.connect(actx.__bhOut || actx.destination);
    noiseBuf = mk(2, (d) => { for (let j = 0; j < d.length; j++) d[j] = R() * 2 - 1; });
    const fireBuf = mk(5, (d, sr) => { let br = 0; for (let j = 0; j < d.length; j++) { br = br * 0.985 + (R() * 2 - 1) * 0.015; d[j] = br * 0.9; } for (let p = 0; p < 60; p++) { const at = Math.floor(R() * (d.length - sr * 0.02)), amp = 0.2 + R() * 0.6, len = Math.floor(sr * (0.002 + R() * 0.01)); for (let j = 0; j < len; j++) d[at + j] += (R() * 2 - 1) * amp * Math.exp(-j / (len * 0.3)); } });
    const fs = actx.createBufferSource(); fs.buffer = fireBuf; fs.loop = true; const ff = actx.createBiquadFilter(); ff.type = 'lowpass'; ff.frequency.value = 2600; fireGain = actx.createGain(); fireGain.gain.value = fireNear ? 0.22 : 0.08; fs.connect(ff); ff.connect(fireGain); fireGain.connect(master); fs.start();
    const brown = mk(4, (d) => { let b = 0; for (let j = 0; j < d.length; j++) { b = (b + 0.02 * (R() * 2 - 1)) / 1.02; d[j] = b * 3.5; } });
    const ps = actx.createBufferSource(); ps.buffer = brown; ps.loop = true; pourFilt = actx.createBiquadFilter(); pourFilt.type = 'lowpass'; pourFilt.frequency.value = 400; pourFilt.Q.value = 4;
    const lfo = actx.createOscillator(); lfo.frequency.value = 6.5; const lfoG = actx.createGain(); lfoG.gain.value = 140; lfo.connect(lfoG); lfoG.connect(pourFilt.frequency); lfo.start();
    pourGain = actx.createGain(); pourGain.gain.value = 0; ps.connect(pourFilt); pourFilt.connect(pourGain); pourGain.connect(master); ps.start();
    const hs = actx.createBufferSource(); hs.buffer = noiseBuf; hs.loop = true; const hf = actx.createBiquadFilter(); hf.type = 'bandpass'; hf.frequency.value = 2200; hf.Q.value = 0.7; pourGain2 = actx.createGain(); pourGain2.gain.value = 0; hs.connect(hf); hf.connect(pourGain2); pourGain2.connect(master); hs.start();
    master.__src = [fs, ps, hs, lfo];
    return actx.state === 'running';
  }
  const on = () => initAudio() && !muted();
  function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
  function tone(type, f0, f1, t, a, d, vol) { const oo = actx.createOscillator(), g = actx.createGain(); oo.type = type; oo.frequency.setValueAtTime(f0, t); if (f1 !== f0) oo.frequency.exponentialRampToValueAtTime(f1, t + a + d); env(g, t, a, vol, d); oo.connect(g); g.connect(master); oo.start(t); oo.stop(t + a + d + 0.05); }
  function noiseHit(t, type, freq, q, a, d, vol) { const s = actx.createBufferSource(); s.buffer = noiseBuf; const f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q; const g = actx.createGain(); env(g, t, a, vol, d); s.connect(f); f.connect(g); g.connect(master); s.start(t, R() * 1.5); s.stop(t + a + d + 0.05); }
  function marimba(freq, t, vol) { tone('sine', freq, freq, t, 0.004, 0.45, vol); tone('sine', freq * 4, freq * 4, t, 0.002, 0.08, vol * 0.18); noiseHit(t, 'bandpass', freq * 2, 2, 0.001, 0.02, vol * 0.25); }
  const T0 = () => actx.currentTime + 0.01;
  const sfx = {
    knockFull() { if (!on()) return; const t = T0(); tone('sine', 105, 62, t, 0.003, 0.42, 0.95); tone('sine', 168, 120, t, 0.002, 0.16, 0.35); noiseHit(t, 'lowpass', 900, 0.7, 0.001, 0.06, 0.8); noiseHit(t, 'lowpass', 260, 1, 0.002, 0.25, 0.6); },
    knockHollow() { if (!on()) return; const t = T0(); tone('sine', 330, 300, t, 0.002, 0.16, 0.5); tone('triangle', 520, 500, t, 0.002, 0.07, 0.12); noiseHit(t, 'bandpass', 470, 7, 0.001, 0.16, 1.1); noiseHit(t, 'bandpass', 760, 6, 0.001, 0.1, 0.6); noiseHit(t, 'highpass', 1500, 0.7, 0.001, 0.02, 0.25); },
    thud() { if (!on()) return; const t = T0(); tone('sine', 80, 50, t, 0.003, 0.22, 0.6); noiseHit(t, 'lowpass', 500, 0.8, 0.002, 0.08, 0.5); },
    bubble() { if (!on()) return; const t = actx.currentTime + 0.005, f = 160 + R() * 140; tone('sine', f, f * (2.2 + R()), t, 0.004, 0.07 + R() * 0.05, 0.22 + R() * 0.15); },
    reach(n) { if (!on()) return; const t = T0(), base = 392 * Math.pow(1.122, n); marimba(base, t, 0.32); marimba(base * 1.26, t + 0.08, 0.32); marimba(base * 1.5, t + 0.16, 0.3); },
    chime() { if (!on()) return; const t = actx.currentTime + 0.02; [523, 659, 784, 1047, 1319].forEach((f, j) => marimba(f, t + j * 0.09, 0.34)); marimba(523, t + 0.5, 0.25); marimba(784, t + 0.5, 0.2); marimba(1047, t + 0.5, 0.2); },
    crumble() { if (!on()) return; const t = T0(); for (let j = 0; j < 7; j++) noiseHit(t + j * 0.06 + R() * 0.04, 'lowpass', 700 + R() * 500, 0.8, 0.002, 0.07, 0.5); },
    tock() { if (!on()) return; const t = T0(); tone('sine', 210, 150, t, 0.002, 0.13, 0.6); tone('triangle', 340, 300, t, 0.001, 0.04, 0.12); noiseHit(t, 'bandpass', 620, 3, 0.001, 0.05, 0.55); noiseHit(t, 'lowpass', 300, 0.8, 0.002, 0.1, 0.35); },
    down() { if (!on()) return; const t = T0(); marimba(330, t, 0.18); marimba(262, t + 0.12, 0.18); },
    splat() { if (!on()) return; const t = T0(); noiseHit(t, 'lowpass', 380, 0.9, 0.004, 0.3, 0.55); tone('sine', 120, 70, t, 0.004, 0.2, 0.3); },
    start: () => initAudio(),
  };

  /* ── the overlay: the sample's words, rings and burst, at the world's points on the game's canvas ── */
  const cv = document.createElement('canvas'); cv.className = 'h131-pour-fx'; cv.style.cssText = 'position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:40';
  document.body.appendChild(cv); const g2 = cv.getContext('2d');
  const words = [], rings = [], parts = [], partCols = ['#ffcf5a', '#ff9a2e', '#fff1c4', '#e8b06a', '#ffd98a'];
  for (let j = 0; j < 8; j++) words.push({ on: false }); for (let j = 0; j < 10; j++) rings.push({ on: false }); for (let j = 0; j < 160; j++) parts.push({ on: false });
  const wv = new THREE.Vector3();
  const proj = (lx, ly, lz) => { wv.set(lx, ly, lz); G.localToWorld(wv); const q = X.scr(wv.x, wv.y, wv.z); return q && q.on !== false ? q : null; };
  function word(lx, ly, lz, text, big) { for (const w of words) if (!w.on) { Object.assign(w, { on: true, x: lx, y: ly, z: lz, text, t: 0, big: !!big }); return; } }
  function ring(lx, ly, lz, dur, hue) { for (const r of rings) if (!r.on) { Object.assign(r, { on: true, x: lx, y: ly, z: lz, t: 0, dur, hue }); return; } }
  function burst(n) { const VW = innerWidth, VH = innerHeight; let made = 0; for (const p of parts) { if (p.on) continue; const a = R() * Math.PI * 2, s = 250 + R() * 650; Object.assign(p, { on: true, x: VW / 2 + (R() - 0.5) * 80, y: VH * 0.45, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 250, t: 0, life: 1.4 + R() * 1.2, c: Math.floor(R() * partCols.length), s: 3 + R() * 6 }); if (++made >= n) break; } }
  const FONT = 'Heebo, system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
  function drawOverlay(dt) {
    const DPR = Math.min(devicePixelRatio || 1, 1.5), VW = innerWidth, VH = innerHeight;
    if (cv.width !== Math.round(VW * DPR) || cv.height !== Math.round(VH * DPR)) { cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR); }
    const ctx = g2; ctx.setTransform(DPR, 0, 0, DPR, 0, 0); ctx.clearRect(0, 0, VW, VH);
    for (const r of rings) {
      if (!r.on) continue; r.t += dt; if (r.t > r.dur) { r.on = false; continue; }
      const q = proj(r.x, r.y, r.z); if (!q) continue; const f = r.t / r.dur;
      ctx.beginPath(); ctx.arc(q.x, q.y, 12 + f * 70, 0, Math.PI * 2); ctx.lineWidth = 6 * (1 - f) + 1; ctx.globalAlpha = 1 - f; ctx.strokeStyle = r.hue === 1 ? '#d8952a' : '#ffeba0'; ctx.stroke();
      if (r.hue === 0 && f < 0.35) { ctx.globalAlpha = 0.6 * (1 - f / 0.35); ctx.fillStyle = '#fffadc'; ctx.beginPath(); ctx.arc(q.x, q.y, 30 + f * 60, 0, Math.PI * 2); ctx.fill(); }
      ctx.globalAlpha = 1;
    }
    ctx.textBaseline = 'middle'; ctx.textAlign = 'center'; ctx.direction = 'rtl';
    for (const w of words) {
      if (!w.on) continue; w.t += dt; const dur = w.big ? 2.6 : 1.5; if (w.t > dur) { w.on = false; continue; }
      let x, y; if (w.big) { x = VW / 2; y = VH * 0.42; } else { const q = proj(w.x, w.y, w.z); if (!q) continue; x = q.x; y = q.y - 20 - w.t * 50; }
      const a = Math.min(1, (dur - w.t) / 0.4), s = w.big ? Math.min(1, w.t * 5) * (110 + 10 * Math.sin(w.t * 6)) * Math.min(1, VH / 700) : 30 + 10 * Math.max(0, 1 - w.t * 4);
      ctx.font = `800 ${s.toFixed(1)}px ${FONT}`; ctx.globalAlpha = a; ctx.lineWidth = w.big ? 10 : 5; ctx.strokeStyle = 'rgba(90,45,10,0.75)'; ctx.fillStyle = w.big ? '#ffe7a0' : '#fff3c8';
      ctx.strokeText(w.text, x, y); ctx.fillText(w.text, x, y); ctx.globalAlpha = 1;
    }
    ctx.direction = 'ltr';
    for (const p of parts) { if (!p.on) continue; p.t += dt; if (p.t > p.life) { p.on = false; continue; } p.vy += 500 * dt; p.vx *= 1 - dt * 0.6; p.x += p.vx * dt; p.y += p.vy * dt; ctx.globalAlpha = Math.min(1, (p.life - p.t) * 2); ctx.fillStyle = partCols[p.c]; ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s * 1.6); }
    ctx.globalAlpha = 1;
  }

  /* ── per frame ── */
  const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpV3 = new THREE.Vector3(), mouth = new THREE.Vector3(), lip = new THREE.Vector3(), camL = new THREE.Vector3();
  const tmpM = new THREE.Matrix4(), tmpS = new THREE.Vector3(), ident = new THREE.Quaternion();
  const V = { rigX: 0, walkPhase: 0, knockWalk: 0, swapAnim: 0, sink: 1, time: 0, spill: 0, spillQ: 0 };
  const surfaceAt = (x, z) => { const i = Math.max(0, Math.min(NX - 1, Math.floor((x - X0) / DX))), k = Math.max(0, Math.min(NZ - 1, Math.floor((z - Z0) / DX))), c = k * NX + i; return sim.ground[c] + sim.solid[c] + sim.vol[c]; };
  const spoutX = () => X0 + 0.4 + sim.spout.t * (W - 0.8);
  function spawnBubble(x, z) { for (const b of bubbles) if (!b.on) { b.on = true; b.x = x + (R() - 0.5) * 0.45; b.z = z + (R() - 0.5) * 0.45; b.y = surfaceAt(b.x, b.z) + 0.02; b.vy = 0.3 + R() * 0.35; b.r = 0.09 + R() * 0.09; b.t = 0; b.life = 0.9 + R() * 0.8; return; } }
  function spawnDrop(x, y, z) { for (const d of drops) if (!d.on) { d.on = true; d.x = x; d.y = y; d.z = z; const a = R() * Math.PI * 2, s = 0.6 + R() * 1.4; d.vx = Math.cos(a) * s; d.vz = Math.sin(a) * s - 0.6; d.vy = 1.2 + R() * 1.6; d.t = 0; d.s = 0.035 + R() * 0.04; return; } }
  function updateStream(pouring, heat, time, lx, lz, ly) {
    stream.visible = pouring; if (!pouring) return;
    G.worldToLocal(camL.copy(X.camera.position));
    const mx = mouth.x, my = mouth.y, mz = mouth.z, cx = mx, cy = my + 0.12, cz = mz - (mz - lz) * 0.7, wTop = 0.06 + 0.2 * sim.spout.tilt;
    const j = Math.max(0, Math.min(LUT_N - 1, Math.round(heat * (LUT_N - 1)))) * 3, br = 1.25 + 0.6 * Math.max(0, heat - 0.4);
    for (let s = 0; s <= STREAM_SEG; s++) {
      const u = s / STREAM_SEG, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
      const px = a * mx + b * cx + c * lx, py = a * my + b * cy + c * ly, pz = a * mz + b * cz + c * lz;
      tmpV.set(2 * (1 - u) * (cx - mx) + 2 * u * (lx - cx), 2 * (1 - u) * (cy - my) + 2 * u * (ly - cy), 2 * (1 - u) * (cz - mz) + 2 * u * (lz - cz)).normalize();
      tmpV2.subVectors(camL, tmpV3.set(px, py, pz)).normalize(); tmpV2.crossVectors(tmpV, tmpV2).normalize();
      const w = wTop * (1 - 0.35 * u) * (u > 0.92 ? 1.6 : 1), oo = s * 6;
      sPos[oo] = px - tmpV2.x * w; sPos[oo + 1] = py - tmpV2.y * w; sPos[oo + 2] = pz - tmpV2.z * w; sPos[oo + 3] = px + tmpV2.x * w; sPos[oo + 4] = py + tmpV2.y * w; sPos[oo + 5] = pz + tmpV2.z * w;
      const band = 0.85 + 0.25 * Math.sin(u * 22 - time * 14), r = liqLUT[j] * br * band, g = liqLUT[j + 1] * br * band, bb = liqLUT[j + 2] * br * band;
      sCol[oo] = r * 0.85; sCol[oo + 1] = g * 0.85; sCol[oo + 2] = bb * 0.85; sCol[oo + 3] = r; sCol[oo + 4] = g; sCol[oo + 5] = bb;
    }
    aSPos.needsUpdate = true; aSCol.needsUpdate = true;
  }
  /** S: { phase, phaseT, seals, knockX, taps, teardownT, td (chunks), crewOn } from the act */
  // rule 59: where the stream will land, always in sight (green; amber over the timber or a reed); rule 34: level 1's goals as faint
  // shadows until the mix reaches them
  const aimM = keep(new THREE.MeshBasicMaterial({ color: 0x4cd964, transparent: true, opacity: 0.85, depthWrite: false, side: THREE.DoubleSide }));
  const aim = new THREE.Mesh(keep(new THREE.RingGeometry(0.26, 0.4, 28)), aimM); aim.rotation.x = -Math.PI / 2; aim.renderOrder = 6; aim.visible = false; G.add(aim);
  const goalM = keep(new THREE.MeshBasicMaterial({ color: 0xfff2c8, transparent: true, opacity: 0.4, depthWrite: false, side: THREE.DoubleSide }));
  const goals = lv === 1 ? L.targets.map((tg) => { const m = new THREE.Mesh(keep(new THREE.RingGeometry(tg.r * 0.75, tg.r, 32)), goalM); m.rotation.x = -Math.PI / 2; m.renderOrder = 5; m.visible = false; G.add(m); return { m, tg }; }) : [];
  function frame(dt, S) {
    V.time += dt; const time = V.time, ca = sim.cauldron, sp = sim.spout;
    { const on = S.phase === 'pour' && !(ca.swapping > 0) && Number.isFinite(sp.lx); aim.visible = on;
      if (on) { aim.position.set(sp.lx, surfaceAt(sp.lx, sp.lz) + 0.05, sp.lz); aimM.color.setHex(S.aimBad ? 0xffb020 : 0x4cd964); aimM.opacity = sp.q > 0.001 ? 0.45 : 0.85 + 0.12 * Math.sin(time * 5); }
      for (let j = 0; j < goals.length; j++) { const g = goals[j], vis = (S.phase === 'pour' || S.phase === 'stones') && !(S.reached && S.reached[j]); g.m.visible = vis; if (vis) g.m.position.set(g.tg.x, surfaceAt(g.tg.x, g.tg.z) + 0.04, g.tg.z); } }
    // the seals' visuals (fade)
    FX.pulseT += dt; FX.pocketPulse = FX.pulseT < 1.7 ? Math.sin(Math.PI * FX.pulseT / 1.7) : 0;
    if (FX.glowOn) { let any = false; const d = dt / 1.4; for (let c = 0; c < N; c++) if (sealGlow[c] > 0) { sealGlow[c] = Math.max(0, sealGlow[c] - d); any = true; } FX.glowOn = any; }
    FX.settle = S.phase === 'pour' || S.phase === 'stones' || S.phase === 'prep' ? 0 : Math.min(1, FX.settle + dt / 0.8);
    fluidU.uTime.value = time;
    updateFluidMesh(V.sink, S.phase === 'hollow');
    // stones falling in
    for (const st of stones) {
      if (st.carry) continue;   // (b131 look round: a stone in the porters' hands is the act's)
      if (st.fall < 0) { st.m.visible = S.stonesIn == null || S.stonesIn > stones.indexOf(st); if (!st.m.visible) continue; st.m.position.y = 0; continue; }
      st.fall += dt; const u = Math.min(1, st.fall / 0.45); st.m.visible = true; st.m.position.y = st.y0 * (1 - u * u); if (u >= 1) st.fall = -1;
    }
    // the rig: the spout follows the thumb (the sim's lag), the crew fetch a new cauldron, the pole tilts
    const sx = spoutX(), mz = 3.75 - 0.3 * sp.tilt, topY = 1.42, topZ = 5.55, mouthY = 1.1, dz = topZ - mz, dy = topY - mouthY;
    spout.position.set(sx, B0, 0); trough.position.set(0, topY, topZ); trough.rotation.x = -Math.atan2(dy, dz); trough.scale.z = Math.hypot(dz, dy) / TROUGH_LEN; mouth.set(sx, B0 + mouthY + 0.05, mz);
    const crewOn = S.crewOn !== false;
    rig.visible = crewOn; spout.visible = crewOn;
    if (S.phase !== 'teardown') {
      let rx = sx, rz = RIG_Z, walking = Math.abs(sx - V.rigX) > 0.02 ? 1 : 0;
      if (ca.swapping > 0) { const p = 1 - ca.swapping / T.SWAP_TIME, f = p < 0.5 ? p * 2 : (1 - p) * 2, e = f * f * (3 - 2 * f); rx = sx + (SWAP_TO.x - sx) * e; rz = RIG_Z + (SWAP_TO.z - RIG_Z) * e; walking = 1; if (p >= 0.5 && V.swapAnim === 0) V.swapAnim = 1; }
      else if (V.swapAnim === 1) V.swapAnim = 0;
      V.rigX += (rx - V.rigX) * Math.min(1, dt * 6); rig.position.set(V.rigX, rig.position.y, rig.position.z + (rz - rig.position.z) * Math.min(1, dt * 6));
      V.walkPhase += dt * (6 + 6 * walking) * (walking ? 1 : 0); poseWalk(crewL, V.walkPhase, walking); poseWalk(crewR, V.walkPhase + Math.PI, walking);
      const tiltAng = ca.swapping > 0 ? 0 : sp.tilt * 1.15; tiltGroup.rotation.x = -tiltAng;
      for (const f of [crewL, crewR]) { const lean = 0.85 + sp.tilt * 0.35; f.armL.rotation.x = -lean; f.armR.rotation.x = -lean; f.body.rotation.x = sp.tilt * 0.12; }
      const amountFrac = ca.swapping > 0 ? (V.swapAnim ? 1 : ca.amount / ca.cap) : ca.amount / ca.cap, heatShown = Math.max(0.6, Math.min(0.78, ca.swapping > 0 && V.swapAnim ? 1 : ca.heat));   // (b131 look round 2: the mix in the pot reads orange — at full heat its glow washed out to a pale disc in a red pot, read as a button)
      setCauldronLook(potA, amountFrac, heatShown); potA.mix.rotation.x = -Math.PI / 2 + tiltAng;
      setCauldronLook(nextCauldron, ca.swapping > 0 && V.swapAnim ? 0.15 : 0.9, 1);
    } else teardownFrame(dt, S);
    // the stream: into the section, or over the timber (the spill)
    const spilling = S.spillQ > 0.001, pouring = sp.q > 0.001 || spilling;
    tmpV.set(0, 0.08, -0.5); tiltGroup.localToWorld(tmpV); G.worldToLocal(tmpV); lip.copy(tmpV);
    const j = Math.max(0, Math.min(LUT_N - 1, Math.round(ca.heat * (LUT_N - 1)))) * 3; troughMixMat.color.setRGB(liqLUT[j] * 1.4, liqLUT[j + 1] * 1.4, liqLUT[j + 2] * 1.4);
    lipStream.visible = pouring && crewOn; troughMix.visible = pouring && crewOn;
    if (pouring) { const topW = tmpV2.set(sx, B0 + topY + 0.05, topZ - 0.2); lipStream.position.copy(lip); const len = Math.max(0.05, lip.distanceTo(topW)); lipStream.scale.set(0.6 + sp.tilt, len, 0.6 + sp.tilt); tmpV3.subVectors(topW, lip).normalize(); lipStream.quaternion.setFromUnitVectors(tmpV.set(0, -1, 0), tmpV3); }
    if (spilling) { const lz = D / 2 + BT + 0.5; updateStream(true, ca.heat, time, sp.lx, lz, -(o.base || 0) + 0.02); }
    else updateStream(sp.q > 0.001, ca.heat, time, sp.lx, sp.lz, surfaceAt(sp.lx, sp.lz) + 0.01);
    if (stain) { const k = Math.min(2.2, Math.sqrt(S.spilled || 0) * 2.4); stain.visible = (S.spilled || 0) >= SPILL_SEEN; stain.scale.set(k * 1.4, k, 1); if (S.stainX != null) stain.position.x = S.stainX; }
    // drops at the landing, bubbles from the sealed entrances
    if (sp.q > 0.001 && R() < sp.q * dt * 14) spawnDrop(sp.lx, surfaceAt(sp.lx, sp.lz) + 0.03, sp.lz);
    let n = 0;
    for (const d of drops) { if (!d.on) continue; d.t += dt; d.vy -= 9 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt; if (d.t > 1.2 || d.y < 0) { d.on = false; continue; } tmpS.set(d.s, d.s, d.s); tmpV.set(d.x, d.y, d.z); tmpM.compose(tmpV, ident, tmpS); dropMesh.setMatrixAt(n++, tmpM); }
    dropMesh.count = n; dropMesh.instanceMatrix.needsUpdate = true;
    for (const s of S.seals || []) { if (!s.on) continue; s.t += dt; const rate = s.t < 6 ? 10 : 1.2; if (R() < rate * dt) { spawnBubble(s.x, s.z); if (s.t < 6 || R() < 0.5) sfx.bubble(); } }
    n = 0;
    for (const b of bubbles) { if (!b.on) continue; b.t += dt; b.y += b.vy * dt; b.vy *= 1 - dt * 0.5; const f = b.t / b.life; if (f >= 1) { b.on = false; continue; } let r = b.r * (0.4 + f * 1.2); if (f > 0.85) r *= 1 + (f - 0.85) * 8; tmpS.set(r, r, r); tmpV.set(b.x + Math.sin(b.t * 9 + b.z * 7) * 0.03, b.y, b.z); tmpM.compose(tmpV, ident, tmpS); bubbleMesh.setMatrixAt(n++, tmpM); }
    bubbleMesh.count = n; bubbleMesh.instanceMatrix.needsUpdate = true;
    knockerFrame(dt, S);
    for (let k = 0; k < flames.length; k++) { const f = flames[k], s = 0.8 + 0.3 * Math.sin(time * (9 + k * 2.3) + k); f.scale.set(1, s, 1); f.position.y = 0.2 + s * 0.45; }
    if (actx && pourGain && !muted()) { const q = Math.max(sp.q, S.spillQ || 0) / T.QMAX, t = actx.currentTime; pourGain.gain.setTargetAtTime(Math.min(0.9, q * 1.2), t, 0.08); pourGain2.gain.setTargetAtTime(Math.min(0.08, q * 0.12) * ca.heat, t, 0.1); pourFilt.frequency.setTargetAtTime(260 + 520 * q, t, 0.1); }
    if (master) master.gain.value = muted() ? 0 : 0.8;
    drawOverlay(dt);
  }
  // the knocker: home, then to the place of the air (or the middle) and three taps of his wooden mallet
  function knockerFrame(dt, S) {
    const k = knocker; let tx = KNOCK_HOME[0], tz = KNOCK_HOME[1], face = -2.3; k.g.position.y = B0;
    const at = S.phase === 'knock' || S.phase === 'hollow' || S.phase === 'full';
    if (at) { tx = S.knockX + 0.6; tz = D / 2 + BT + 1.05; face = Math.PI; const rx = rig.position.x; if (Math.abs(tx - rx) < 4.4) tx = rx + (tx >= rx ? 4.4 : -4.4); tx = Math.max(-6.2, Math.min(6.2, tx)); if (Math.abs(tx - rx) < 4.4) tx = rx + (rx > 0 ? -4.4 : 4.4); }   // (b131 look round: never inside the cauldron's crew)
    const dx = tx - k.g.position.x, dz = tz - k.g.position.z, dist = Math.hypot(dx, dz); let walking = 0;
    if (dist > 0.03) { const m = Math.min(dist, 4.2 * dt); k.g.position.x += dx / dist * m; k.g.position.z += dz / dist * m; k.g.rotation.y += angDiff(Math.atan2(dx, dz), k.g.rotation.y) * Math.min(1, dt * 8); walking = 1; }
    else k.g.rotation.y += angDiff(face, k.g.rotation.y) * Math.min(1, dt * 6);
    V.knockWalk += dt * 10 * walking; poseWalk(k, V.knockWalk, walking);
    S.knockerThere = at && dist <= 0.03;
    if (S.phase === 'knock' && S.knockerThere && S.swingT > 0) { const per = 0.62, ph = (S.swingT % per) / per, ang = ph < 0.7 ? -0.25 - 1.6 * (ph / 0.7) : -1.85 + 1.85 * ((ph - 0.7) / 0.3) * 1.05; k.armR.rotation.x = ang; k.armL.rotation.x = ang * 0.6; k.body.rotation.x = 0.25; }
    else { k.armR.rotation.x += (-0.25 - k.armR.rotation.x) * Math.min(1, dt * 5); k.armL.rotation.x += (0 - k.armL.rotation.x) * Math.min(1, dt * 5); k.body.rotation.x *= 1 - Math.min(1, dt * 5); }
  }
  // the teardown (the sample's): the two crew lift the hardened chunks out one by one onto two heaps beside the boards
  const TD = { first: 1.25, gap: 0.34, carry: 1.2, back: 1.1 }, TD_END = TD.first + 7 * TD.gap + TD.carry + TD.back + 0.2;
  const SPOTS = [[-4.3, 2.5], [4.3, 2.5], [-1.6, 3.0], [1.6, 3.0], [-3.7, 0.3], [3.7, 0.3], [-3.9, -2.8], [3.9, -2.8]];
  function startTeardown() {
    sfx.crumble();
    chunks.forEach((ch, j) => { ch.x = SPOTS[j][0] + (rnd() - 0.5) * 0.5; ch.z = SPOTS[j][1] + (rnd() - 0.5) * 0.4; ch.owner = ch.x < 0 ? 0 : 1; ch.delay = TD.first + j * TD.gap; ch.sx = 0.75 + rnd() * 0.3; ch.sz = 0.6 + rnd() * 0.25; ch.px = (ch.owner ? 1 : -1) * (7.4 + rnd() * 0.9); ch.pz = 5.4 + (rnd() - 0.5) * 1.6; ch.py = B0 + 0.35; ch.tossed = false; ch.m.visible = true; ch.m.position.set(ch.x, 0.45, ch.z); ch.m.scale.set(ch.sx, 0.28, ch.sz); ch.m.rotation.set(0, rnd() * 3, 0); });
  }
  function teardownFrame(dt, S) {
    const t = S.phaseT; V.sink = Math.max(0, 1 - Math.max(0, t - TD.first) / (7 * TD.gap + 0.5));
    for (const ch of chunks) {
      const u = (t - ch.delay) / TD.carry, f = ch.owner === 0 ? crewL : crewR; if (u <= 0) continue;
      const hx = rig.position.x + f.g.position.x, hz = rig.position.z + f.g.position.z - 0.45, hy = B0 + 3.35;
      if (u < 0.45) { const e = u / 0.45, k = e * e * (3 - 2 * e); ch.m.position.set(ch.x + (hx - ch.x) * k, 0.45 + (hy - 0.45) * k + Math.sin(e * Math.PI) * 0.6, ch.z + (hz - ch.z) * k); ch.m.rotation.x = e * 0.6; }
      else if (u < 1) { const e = (u - 0.45) / 0.55; ch.m.position.set(hx + (ch.px - hx) * e, hy + (ch.py - hy) * e + Math.sin(e * Math.PI) * 1.6, hz + (ch.pz - hz) * e); ch.m.rotation.x = 0.6 + e * 2.2; ch.m.rotation.z = e * 1.4; }
      else { if (!ch.tossed) { ch.tossed = true; sfx.crumble(); X.shake(0.06, 0.08); } ch.m.position.set(ch.px, ch.py, ch.pz); }
    }
    const out = t < TD_END - TD.back;
    tiltGroup.position.y += ((out ? 1.07 : POLE_Y) - tiltGroup.position.y) * Math.min(1, dt * 5); pole.position.y = tiltGroup.position.y;
    [crewL, crewR].forEach((f, fi) => {
      const p = f.g.position; let tx = fi === 0 ? -1.6 : 1.6, tz = 0, face = fi === 0 ? Math.PI / 2 : -Math.PI / 2;
      if (out) { tx = (fi === 0 ? -2.7 : 2.7) - rig.position.x; tz = D / 2 + BT + 0.75 - rig.position.z; face = Math.PI; }
      const dx = tx - p.x, dz = tz - p.z, dist = Math.hypot(dx, dz); let walking = 0;
      if (dist > 0.04) { const m = Math.min(dist, 4.8 * dt); p.x += dx / dist * m; p.z += dz / dist * m; f.g.rotation.y += angDiff(Math.atan2(dx, dz), f.g.rotation.y) * Math.min(1, dt * 10); walking = 1; } else f.g.rotation.y += angDiff(face, f.g.rotation.y) * Math.min(1, dt * 8);
      f.walk += dt * 11 * walking; poseWalk(f, f.walk, walking);
      let lift = 0; for (const ch of chunks) if (ch.owner === fi) { const u = (t - ch.delay) / TD.carry; if (u > 0.1 && u < 0.7) lift = Math.max(lift, Math.sin((u - 0.1) / 0.6 * Math.PI)); }
      const bend = out && !walking ? 0.35 * (1 - lift) : 0; f.armL.rotation.x = -0.4 - 2.4 * lift - bend * 2; f.armR.rotation.x = -0.4 - 2.4 * lift - bend * 2; f.body.rotation.x = bend;
    });
  }
  function finishTeardown() {
    for (const ch of chunks) ch.m.visible = false;
    crewL.g.position.set(-1.6, 0, 0); crewL.g.rotation.y = Math.PI / 2; crewR.g.position.set(1.6, 0, 0); crewR.g.rotation.y = -Math.PI / 2;
    tiltGroup.position.y = POLE_Y; pole.position.y = POLE_Y; V.sink = 1; resetFx();
  }
  function resetFx() { sealGlow.fill(0); pocketMask.fill(0); pocketDone.fill(0); FX.pulseT = 9; FX.pocketPulse = 0; FX.glowOn = false; fluidU.uHL.value = 0; }
  /** a passage closed (the sample's seal): the plug turns to hard stone, the pocket it cut off pulses once */
  function sealFx(e) {
    ring(e.x, surfaceAt(e.x, e.z) + 0.15, e.z, 1.6, 1);
    for (let j = 0; j < 8; j++) spawnBubble(e.x, e.z);
    sfx.bubble(); sfx.tock();
    const r2 = (T.PLUG_R + 0.4) * (T.PLUG_R + 0.4); pocketMask.fill(0);
    for (let c = 0; c < N; c++) { const i = c % NX, dx = cellX(i) - e.x, dz = cellZ((c - i) / NX) - e.z; if (sim.plug[c] && dx * dx + dz * dz < r2) { sealGlow[c] = 1; if (sim.freezeAge[c] < 3) sim.freezeAge[c] = 3; } if (sim.hollow[c] && !pocketDone[c]) { pocketMask[c] = 1; pocketDone[c] = 1; } }
    FX.glowOn = true; FX.pulseT = 0;
  }
  function setReed(j, clogged) { const r = reeds[j]; if (r) r.plugM.visible = !!clogged; }
  function dropStone(i) { const s = stones[i]; if (!s) return; s.fall = 0; s.m.visible = true; }
  /** the local point → the world (for the director's words, the stars, the camera) */
  const world = (lx, ly, lz) => { const v = new THREE.Vector3(lx, ly, lz); G.localToWorld(v); return v; };
  function dispose() {
    try { if (master) { for (const s of master.__src || []) { try { s.stop(); } catch (e) { /* */ } } master.disconnect(); } } catch (e) { /* */ }
    try { cv.remove(); } catch (e) { /* */ }
    try { X.props.root.remove(G); } catch (e) { /* */ }
    for (const d of disposables) { try { d.dispose(); } catch (e) { /* */ } }
  }
  return { G, frame, word, ring, burst, sfx, sealFx, startTeardown, finishTeardown, TD_END, resetFx, setReed, dropStone, world, surfaceAt, fluidU, FX, stones, reeds, V, dispose };
}

/* ═════════ the world's hooks: what his pours left, from the save (the patches of a section poured again, the stain beside the timber) ═════════ */
const W8 = { g: null, key: '' };
/** a patch's outline: a ragged disc (a re-poured place is not a compass circle) */
function patchGeo(T, r, seed) {
  // (the circle lies in x, y and is turned flat by −90° about x: its y is the world's −z, so the angle is taken as the world's)
  const g = new T.CircleGeometry(r, 36), p = g.attributes.position;
  for (let i = 1; i < p.count; i++) { const k = patchK(Math.atan2(-p.getY(i), p.getX(i)), seed); p.setXY(i, p.getX(i) * k, p.getY(i) * k); }
  return g;
}
/** a pour mark's place: [x, z] with the radius in n (tenths of an amah); a save from before build 131's part 3 kept {x, z, r} */
export function markAt(k) {
  const a = k && k.at; if (!a) return null;
  if (Array.isArray(a)) return Number.isFinite(+a[0]) && Number.isFinite(+a[1]) ? { f: k.f, x: +a[0], z: +a[1], r: k.n > 0 ? k.n / 10 : null } : null;
  return Number.isFinite(+a.x) && Number.isFinite(+a.z) ? { f: k.f, x: +a.x, z: +a.z, r: +a.r || null } : null;
}
function marksDraw(X, M) {
  if (!M || !X || !X.THREE) return;
  // (a patch in the section being poured is not drawn: the act's own segment shows it, and a flat disc over its stones would not)
  const live = POUR3D.act && S8.sections[POUR3D.act], inLive = (at) => live && at.x >= live[0] && at.x <= live[2] && at.z >= live[1] && at.z <= live[3];
  const marks = M.marksOf().filter((k) => k.f === 'pour.hollow' || k.f === 'pour.spill').map(markAt).filter((k) => k && !(k.f === 'pour.hollow' && inLive(k)));
  const key = marks.map((k) => k.f + k.x + ',' + k.z).join('|') + '|' + (M.isDone('finale') ? 1 : 0) + '|' + (POUR3D.act || 0); if (key === W8.key && W8.g) return; W8.key = key;
  const T = X.THREE; if (W8.g) { X.props.root.remove(W8.g); W8.g = null; }
  if (!marks.length) return;
  const g = new T.Group(); g.name = 'h131-pour-marks'; X.props.root.add(g); W8.g = g;
  const white = M.isDone('finale');
  const patchM = new T.MeshStandardMaterial({ color: white ? 0xDCD3C2 : 0x9a8f80, roughness: 0.95, polygonOffset: true, polygonOffsetFactor: -2 });   // (a fresher mix, a shade off the set one)
  const stainM = new T.MeshStandardMaterial({ color: 0x8c8172, roughness: 0.95, transparent: true, opacity: 0.95, polygonOffset: true, polygonOffsetFactor: -2 });
  for (const k of marks) {
    if (k.f === 'pour.hollow') { const m = new T.Mesh(patchGeo(T, patchR(k.r * 10), patchSeed(k.x, k.z)), patchM); m.rotation.x = -Math.PI / 2; m.position.set(k.x, S8.top + 0.012, k.z); g.add(m); }
    else { const m = new T.Mesh(patchGeo(T, 1, patchSeed(k.x, k.z)), stainM); m.rotation.x = -Math.PI / 2; m.scale.set(Math.max(0.6, k.r || 1) * 1.4, Math.max(0.6, k.r || 1), 1); m.position.set(k.x, S8.floor + 0.015, k.z); g.add(m); }
  }
}
export const POUR3D = {
  init(X, M) { marksDraw(X, M); },
  sync(X, M) { marksDraw(X, M); },
  rest(X, M) { W8.key = ''; marksDraw(X, M); },
  owns: () => false,
  /** the level of the pour act on now (0: none): its section's reeds are the act's own while it plays */
  act: 0,
};
export { toWorld };
