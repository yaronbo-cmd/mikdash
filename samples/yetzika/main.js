// Stage 08 pour sample ("דגם היציקה"): one foundation segment, a cauldron of molten mix, two thumbs.
import * as THREE from 'three';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {
  createSim, NX, NZ, DX, W, D, H, X0, Z0, N, T, TARGETS, cellX, cellZ, mulberry32,
  stoneHeightAt, stoneRadiusScale,
} from './sim.js';

// ------------------------------------------------------------------------------------------
// root, renderer, overlay
// ------------------------------------------------------------------------------------------
let root = document.getElementById('yz-root');
if (!root) { root = document.createElement('div'); root.id = 'yz-root'; document.body.appendChild(root); }

const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.08;
root.appendChild(renderer.domElement);

const overlay = document.createElement('canvas');
overlay.className = 'yz-overlay';
root.appendChild(overlay);
const g2 = overlay.getContext('2d');

const againBtn = document.createElement('button');
againBtn.id = 'yz-again';
againBtn.setAttribute('aria-label', 'again');
againBtn.innerHTML = '<svg viewBox="0 0 48 48" width="40" height="40"><path d="M36 15a15 15 0 1 0 3 13" fill="none" stroke="#5a3a1c" stroke-width="5" stroke-linecap="round"/><path d="M38 5v12H26" fill="none" stroke="#5a3a1c" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
root.appendChild(againBtn);

let VW = 1, VH = 1, DPR = 1;
function resize() {
  VW = Math.max(1, window.innerWidth); VH = Math.max(1, window.innerHeight);
  DPR = Math.min(window.devicePixelRatio || 1, 1.5);
  renderer.setPixelRatio(DPR);
  renderer.setSize(VW, VH);
  overlay.width = Math.round(VW * DPR); overlay.height = Math.round(VH * DPR);
  overlay.style.width = VW + 'px'; overlay.style.height = VH + 'px';
  camera.aspect = VW / VH;
  camera.updateProjectionMatrix();
}

// ------------------------------------------------------------------------------------------
// scene, light
// ------------------------------------------------------------------------------------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf3dfb8);
scene.fog = new THREE.Fog(0xf3dfb8, 38, 75);
const camera = new THREE.PerspectiveCamera(31, 16 / 9, 1, 160);

const hemi = new THREE.HemisphereLight(0xfff0d8, 0x8a6a48, 0.95);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffd08a, 3.1);
sun.position.set(-9, 16, 7);
sun.target.position.set(0, 0, 0.5);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
const sc = sun.shadow.camera;
sc.left = -14; sc.right = 14; sc.top = 12; sc.bottom = -12; sc.near = 2; sc.far = 50;
sun.shadow.bias = -0.0008;
sun.shadow.normalBias = 0.06;
scene.add(sun, sun.target);

const col = (hex) => new THREE.Color(hex);  // linear working-space colour
const rnd = mulberry32(1234);

// ------------------------------------------------------------------------------------------
// helpers to build merged vertex-coloured geometry
// ------------------------------------------------------------------------------------------
function GeoBuilder() { this.p = []; this.c = []; this.i = []; }
GeoBuilder.prototype.box = function (x0, y0, z0, x1, y1, z1, color, jitter = 0, noBottom = true) {
  // 5 or 6 faces, flat
  const P = this.p, C = this.c, I = this.i;
  const faces = [
    [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], 1.0],   // top
    [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], 0.86],  // +z
    [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], 0.8],   // -z
    [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], 0.9],   // +x
    [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], 0.84],  // -x
  ];
  if (!noBottom) faces.push([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], 0.7]);
  for (const f of faces) {
    const b = P.length / 3;
    for (let v = 0; v < 4; v++) {
      P.push(f[v][0], f[v][1], f[v][2]);
      const j = 1 + (rnd() - 0.5) * jitter;
      C.push(color.r * f[4] * j, color.g * f[4] * j, color.b * f[4] * j);
    }
    I.push(b, b + 1, b + 2, b, b + 2, b + 3);
  }
};
GeoBuilder.prototype.build = function () {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(this.c, 3));
  g.setIndex(this.i);
  g.computeVertexNormals();
  return g;
};
// static/rigid parts are merged into a few vertex-coloured meshes (few draw calls on a tablet)
const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _v = new THREE.Vector3(), _s = new THREE.Vector3();
function Merger() { this.list = []; }
Merger.prototype.add = function (geo, color, pos, rot, scale) {
  let g = geo.index ? geo.toNonIndexed() : geo.clone();
  if (g.attributes.uv) g.deleteAttribute('uv');
  if (g.attributes.uv1) g.deleteAttribute('uv1');
  if (!g.attributes.normal) g.computeVertexNormals();
  if (pos || rot || scale) {
    _e.set(rot ? rot[0] : 0, rot ? rot[1] : 0, rot ? rot[2] : 0); _q.setFromEuler(_e);
    _v.set(pos ? pos[0] : 0, pos ? pos[1] : 0, pos ? pos[2] : 0);
    if (typeof scale === 'number') _s.set(scale, scale, scale); else _s.set(scale ? scale[0] : 1, scale ? scale[1] : 1, scale ? scale[2] : 1);
    g.applyMatrix4(_m4.compose(_v, _q, _s));
  }
  if (!g.attributes.color) {
    const n = g.attributes.position.count, a = new Float32Array(n * 3);
    for (let j = 0; j < n; j++) { a[j * 3] = color.r; a[j * 3 + 1] = color.g; a[j * 3 + 2] = color.b; }
    g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  }
  this.list.push(g);
  return this;
};
Merger.prototype.build = function () { const g = mergeGeometries(this.list, false); for (const x of this.list) x.dispose(); this.list.length = 0; return g; };

// ------------------------------------------------------------------------------------------
// court floor: pale stone slabs
// ------------------------------------------------------------------------------------------
{
  const gb = new GeoBuilder();
  const base = [col(0xe8dcc2), col(0xe1d2b4), col(0xece2cc), col(0xddcfb0)];
  let row = 0;
  for (let z = -16; z < 20; z += 1.6, row++) {
    const off = (row % 2) * 1.1;
    for (let x = -22 - off; x < 22; x += 2.2) {
      const c = base[Math.floor(rnd() * base.length)].clone().multiplyScalar(0.94 + rnd() * 0.1);
      gb.box(x + 0.04, -0.1, z + 0.04, x + 2.2 - 0.04, 0, z + 1.6 - 0.04, c, 0.04);
    }
  }
  const mg = new Merger();
  mg.add(gb.build());
  mg.add(new THREE.PlaneGeometry(60, 50), col(0xb8a684), [0, -0.04, 2], [-Math.PI / 2, 0, 0]);   // grout
  const floor = new THREE.Mesh(mg.build(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.94 }));
  floor.receiveShadow = true;
  scene.add(floor);
}
// frame, fire stones and logs: one static mesh (cast + receive shadows), finished after the fire is built
const staticMerge = new Merger();

// ------------------------------------------------------------------------------------------
// wooden frame: four thick boards, 1 amah high
// ------------------------------------------------------------------------------------------
const BT = 0.36;                 // board thickness
{
  const gb = new GeoBuilder();
  const wood = [col(0xa8743f), col(0x9b6936), col(0xb07c45)];
  const plank = (x0, z0, x1, z1) => {
    // two stacked planks with a dark seam
    gb.box(x0, 0, z0, x1, 0.49, z1, wood[0], 0.05);
    gb.box(x0, 0.5, z0, x1, H, z1, wood[1], 0.05);
    gb.box(x0 + 0.01, 0.48, z0 + 0.01, x1 - 0.01, 0.51, z1 - 0.01, col(0x5d3d1e), 0);
  };
  plank(X0 - BT, -D / 2 - BT, X0 + W + BT, -D / 2);       // far
  plank(X0 - BT, D / 2, X0 + W + BT, D / 2 + BT);         // near
  plank(X0 - BT, -D / 2, X0, D / 2);                      // left
  plank(X0 + W, -D / 2, X0 + W + BT, D / 2);              // right
  // corner stakes of the witness
  for (const [x, z] of [[X0 - BT, -D / 2 - BT], [X0 + W, -D / 2 - BT], [X0 - BT, D / 2], [X0 + W, D / 2]]) {
    gb.box(x - 0.06, 0, z - 0.06, x + BT + 0.06, H + 0.32, z + BT + 0.06, wood[2], 0.06);
  }
  staticMerge.add(gb.build());
}

// ------------------------------------------------------------------------------------------
// sim
// ------------------------------------------------------------------------------------------
const sim = createSim(8);

// ------------------------------------------------------------------------------------------
// field stones: rounded, whole, built from the same shape the simulation uses
// ------------------------------------------------------------------------------------------
{
  const P = [], C = [], I = [];
  const pal = [col(0xa89c8a), col(0x9d927f), col(0xb4a893), col(0x92897a)];
  const tintPal = col(0xa98c74);
  const US = [0, 0.36, 0.6, 0.77, 0.88, 0.95, 0.985, 1.0];
  const NT = 18;
  for (const s of sim.shapes) {
    const base = s.tint ? tintPal : pal[Math.floor(rnd() * pal.length)];
    const c = Math.cos(s.rot), sn = Math.sin(s.rot);
    const b0 = P.length / 3;
    for (let r = 0; r < US.length; r++) {
      for (let t = 0; t < NT; t++) {
        const th = (t / NT) * Math.PI * 2;
        const u = Math.min(US[r], 1.0);
        const rs = stoneRadiusScale(s, th);
        const ex = u * rs * Math.cos(th), ez = u * rs * Math.sin(th);
        const lx = ex * s.rx, lz = ez * s.rz;
        const wx = s.x + lx * c - lz * sn, wz = s.z + lx * sn + lz * c;
        let y = US[r] >= 1 ? -0.03 : stoneHeightAt(s, wx, wz);
        if (y > 0.9) y = 0.9 + (y - 0.9) * 1.4;     // above the mix line the big stones stand a little taller
        if (r > 0 && r < 4) y += (rnd() - 0.5) * 0.04 * s.h;
        P.push(wx, y, wz);
        const shade = 0.88 + rnd() * 0.16 + (y / s.h) * 0.08;
        C.push(base.r * shade, base.g * shade, base.b * shade);
      }
    }
    for (let r = 0; r < US.length - 1; r++) for (let t = 0; t < NT; t++) {
      const a = b0 + r * NT + t, b = b0 + r * NT + (t + 1) % NT;
      const c2 = b0 + (r + 1) * NT + t, d = b0 + (r + 1) * NT + (t + 1) % NT;
      I.push(a, b, c2, b, d, c2);
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(P, 3));
  g.setAttribute('color', new THREE.Float32BufferAttribute(C, 3));
  g.setIndex(I);
  g.computeVertexNormals();   // smooth: rounded, water-worn field stones
  const stones = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.82 }));
  stones.castShadow = true; stones.receiveShadow = false;   // no self-shadow acne on the steep flanks
  scene.add(stones);
}

// ------------------------------------------------------------------------------------------
// the mix: one dynamic height-field mesh
// ------------------------------------------------------------------------------------------
const fluidU = { uTime: { value: 0 }, uHL: { value: 0 }, uGleam: { value: 0 }, uGleamPos: { value: -20 } };
const fluidGeo = new THREE.BufferGeometry();
const fPos = new Float32Array(N * 3), fNor = new Float32Array(N * 3), fCol = new Float32Array(N * 3), fMat = new Float32Array(N * 4);
const fH = new Float32Array(N), fSurf = new Float32Array(N), bS = new Float32Array(N), bN = new Float32Array(N), bM = new Float32Array(N);
const RELIEF = 1.2, MOUND_VIS = 0.42;
for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
  const c = k * NX + i;
  fPos[c * 3] = i === 0 ? X0 + 0.02 : i === NX - 1 ? X0 + W - 0.02 : cellX(i);
  fPos[c * 3 + 2] = k === 0 ? Z0 + 0.02 : k === NZ - 1 ? Z0 + D - 0.02 : cellZ(k);
  fNor[c * 3 + 1] = 1;
}
{
  const idx = new Uint16Array((NX - 1) * (NZ - 1) * 6);
  let n = 0;
  for (let k = 0; k < NZ - 1; k++) for (let i = 0; i < NX - 1; i++) {
    const a = k * NX + i, b = a + 1, c = a + NX, d = c + 1;
    if ((i + k) & 1) { idx[n++] = a; idx[n++] = c; idx[n++] = b; idx[n++] = b; idx[n++] = c; idx[n++] = d; }
    else { idx[n++] = a; idx[n++] = c; idx[n++] = d; idx[n++] = a; idx[n++] = d; idx[n++] = b; }
  }
  fluidGeo.setIndex(new THREE.BufferAttribute(idx, 1));
}
const aPos = new THREE.BufferAttribute(fPos, 3).setUsage(THREE.DynamicDrawUsage);
const aNor = new THREE.BufferAttribute(fNor, 3).setUsage(THREE.DynamicDrawUsage);
const aCol = new THREE.BufferAttribute(fCol, 3).setUsage(THREE.DynamicDrawUsage);
const aMat = new THREE.BufferAttribute(fMat, 4).setUsage(THREE.DynamicDrawUsage);
fluidGeo.setAttribute('position', aPos);
fluidGeo.setAttribute('normal', aNor);
fluidGeo.setAttribute('color', aCol);
fluidGeo.setAttribute('aMat', aMat);
fluidGeo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, 0.5, 0), 8);
fluidGeo.boundingBox = new THREE.Box3(new THREE.Vector3(X0, -1, Z0), new THREE.Vector3(X0 + W, 2, Z0 + D));
const fluidMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.5, metalness: 0, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 });
fluidMat.onBeforeCompile = (sh) => {
  Object.assign(sh.uniforms, fluidU);
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nattribute vec4 aMat;\nvarying vec4 vMat;\nvarying vec3 vWP;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\nvMat = aMat;\nvWP = (modelMatrix * vec4(position, 1.0)).xyz;');
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', '#include <common>\nuniform float uTime, uHL, uGleam, uGleamPos;\nvarying vec4 vMat;\nvarying vec3 vWP;')
    .replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(0.95, 0.1, clamp(vMat.x, 0.0, 1.0));')
    .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
      float shim = 0.78 + 0.22 * sin(uTime * 3.3 + vWP.x * 5.0 + sin(vWP.z * 4.2 + uTime * 1.9) * 2.2);
      totalEmissiveRadiance += diffuseColor.rgb * vMat.y * shim * 1.25;
      float pulse = 0.5 + 0.5 * sin(uTime * 5.5);
      // air left inside (pale blue): pulses at the result, follows the attribute during play (one pulse at a seal)
      totalEmissiveRadiance += vec3(0.42, 0.68, 1.0) * vMat.z * mix(1.0, 0.1 + 0.9 * pulse, uHL) * 0.9;
      // the closed passage: warm ochre mark
      totalEmissiveRadiance += vec3(0.95, 0.55, 0.12) * vMat.w * (0.25 + 0.75 * pulse) * uHL * 0.8;
      float gb = exp(-pow(vWP.x * 0.8 + vWP.z * 0.45 - uGleamPos, 2.0) * 1.5);
      totalEmissiveRadiance += vec3(1.0, 0.92, 0.7) * gb * uGleam;`);
};
const fluid = new THREE.Mesh(fluidGeo, fluidMat);
fluid.receiveShadow = true;
fluid.frustumCulled = false;
scene.add(fluid);

// colour palettes (linear)
const LUT_N = 64;
const liqLUT = new Float32Array(LUT_N * 3);
{
  const stops = [[0.0, 0x3a2a20], [0.2, 0x4a2a1c], [0.32, 0x6b2a12], [0.45, 0x9a3210], [0.6, 0xd9550f], [0.78, 0xff7a12], [0.92, 0xffa232], [1.0, 0xffc458]];
  const a = new THREE.Color(), b = new THREE.Color();
  for (let j = 0; j < LUT_N; j++) {
    const h = j / (LUT_N - 1);
    let s = 0; while (s < stops.length - 2 && h > stops[s + 1][0]) s++;
    const f = (h - stops[s][0]) / (stops[s + 1][0] - stops[s][0]);
    a.setHex(stops[s][1]); b.setHex(stops[s + 1][1]); a.lerp(b, Math.min(1, Math.max(0, f)));
    liqLUT[j * 3] = a.r; liqLUT[j * 3 + 1] = a.g; liqLUT[j * 3 + 2] = a.b;
  }
}
const cPlug = col(0x5a3812), cHard = col(0x7b6d5f), cHardPatch = col(0x8f7458), cFresh = col(0x4b3025), cAir = col(0x8ec3f7);
const cSealFlash = col(0xc9bfae), cDryFloor = col(0xd8cbb0);
// per-cell visual state for the moment a passage closes
const sealGlow = new Float32Array(N);      // 1 -> 0: the plug cells just turned to stone
const pocketMask = new Uint8Array(N);      // the dry pocket that was just cut off
const pocketDone = new Uint8Array(N);      // already pulsed once
const FX = { pocketPulse: 0, pulseT: 9, glowOn: false, settle: 0 };

function updateFluidMesh(sink, hlOn) {
  const vol = sim.vol, solid = sim.solid, ground = sim.ground, heat = sim.heat, hol = sim.hollow, plug = sim.plug, fa = sim.freezeAge, patch = sim.patch;
  // pass 1: surfaces of wet cells
  for (let c = 0; c < N; c++) {
    const m = (vol[c] + solid[c]) * sink;
    if (sink < 0.999 && (ground[c] > 0.2 || sink < 0.05)) { fSurf[c] = -9; continue; }
    fSurf[c] = (m > 0.0015 || (hlOn && hol[c]) || (FX.pocketPulse > 0.01 && pocketMask[c] && hol[c])) ? ground[c] + m + 0.006 : -9;
  }
  // the falling stream stands up a heap where it lands (more tilt, bigger heap)
  const sp = sim.spout;
  if (sp.q > 0.001) {
    const amp = MOUND_VIS * Math.pow(sp.q / T.QMAX, 0.8);
    const i0 = Math.max(0, Math.floor((sp.lx - 1.2 - X0) / DX)), i1 = Math.min(NX - 1, Math.ceil((sp.lx + 1.2 - X0) / DX));
    const k0 = Math.max(0, Math.floor((sp.lz - 1.2 - Z0) / DX)), k1 = Math.min(NZ - 1, Math.ceil((sp.lz + 1.2 - Z0) / DX));
    for (let k = k0; k <= k1; k++) for (let i = i0; i <= i1; i++) {
      const c = k * NX + i;
      if (fSurf[c] < -1 || vol[c] < 0.01) continue;
      const dx = cellX(i) - sp.lx, dz = cellZ(k) - sp.lz;
      fSurf[c] += amp * Math.exp(-(dx * dx + dz * dz) / 0.6);
    }
  }
  // pass 1b: bring out the relief of the liquid (heaps, fronts): deviations from the local mean, x(1 + RELIEF)
  for (let k = 0; k < NZ; k++) {
    const row = k * NX;
    for (let i = 0; i < NX; i++) {
      let sm = 0, n = 0;
      for (let d = -2; d <= 2; d++) { const ii = i + d; if (ii < 0 || ii >= NX) continue; const v = fSurf[row + ii]; if (v > -1) { sm += v; n++; } }
      bS[row + i] = sm; bN[row + i] = n;
    }
  }
  for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
    let sm = 0, n = 0;
    for (let d = -2; d <= 2; d++) { const kk = k + d; if (kk < 0 || kk >= NZ) continue; sm += bS[kk * NX + i]; n += bN[kk * NX + i]; }
    const c = k * NX + i;
    bM[c] = n > 0 ? sm / n : 0;
  }
  for (let c = 0; c < N; c++) {
    if (fSurf[c] > -1 && vol[c] > 0.003) {
      const y = fSurf[c] + RELIEF * (fSurf[c] - bM[c]) * Math.min(1, vol[c] / 0.08);
      const floorY = ground[c] + solid[c] * sink + 0.006;
      fSurf[c] = y > floorY ? y : floorY;
    }
  }
  // pass 2: heights (dry cells are tucked just under the floor/stone next to them)
  for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
    const c = k * NX + i;
    let y = fSurf[c];
    if (y < -1) {
      let m = -9;
      if (i > 0 && fSurf[c - 1] > m) m = fSurf[c - 1];
      if (i < NX - 1 && fSurf[c + 1] > m) m = fSurf[c + 1];
      if (k > 0 && fSurf[c - NX] > m) m = fSurf[c - NX];
      if (k < NZ - 1 && fSurf[c + NX] > m) m = fSurf[c + NX];
      y = m > -1 ? Math.min(ground[c], m) - 0.08 : -0.25;   // far from any mix: well under the floor
    }
    fH[c] = y;
    fPos[c * 3 + 1] = y;
  }
  // pass 3: normals, colours, material channels
  const inv = 1 / (2 * DX);
  for (let k = 0; k < NZ; k++) for (let i = 0; i < NX; i++) {
    const c = k * NX + i;
    const hl = fH[i > 0 ? c - 1 : c], hr = fH[i < NX - 1 ? c + 1 : c];
    const hd = fH[k > 0 ? c - NX : c], hu = fH[k < NZ - 1 ? c + NX : c];
    let nx = (hl - hr) * inv, nz = (hd - hu) * inv;
    const l = 1 / Math.sqrt(nx * nx + 1 + nz * nz);
    fNor[c * 3] = nx * l; fNor[c * 3 + 1] = l; fNor[c * 3 + 2] = nz * l;
    const v = vol[c];
    let r, g, b, gloss, emi;
    if (v > 0.0015) {
      const h = heat[c];
      const j = Math.max(0, Math.min(LUT_N - 1, Math.round(h * (LUT_N - 1)))) * 3;
      r = liqLUT[j]; g = liqLUT[j + 1]; b = liqLUT[j + 2];
      gloss = 0.62 + 0.38 * Math.min(1, h * 1.3);
      const e = Math.max(0, (h - 0.33) / 0.67);
      emi = e * e * 0.42 + (h > 0.25 ? 0.03 : 0);
    } else if (solid[c] > 0.0015) {
      // hardened: fresh dark crust settles to one matte stone colour (the repour patch keeps its own tint)
      const f = Math.max(Math.min(1, fa[c] / 2.2), FX.settle);
      const hc = patch[c] ? cHardPatch : cHard;
      r = cFresh.r + (hc.r - cFresh.r) * f; g = cFresh.g + (hc.g - cFresh.g) * f; b = cFresh.b + (hc.b - cFresh.b) * f;
      gloss = 0.5 * (1 - f) + 0.05; emi = 0;
      const sg = sealGlow[c];
      if (sg > 0) { r += (cSealFlash.r - r) * sg; g += (cSealFlash.g - g) * sg; b += (cSealFlash.b - b) * sg; gloss = 0.05; }
    } else { r = cDryFloor.r; g = cDryFloor.g; b = cDryFloor.b; gloss = 0.1; emi = 0; }
    let hh = 0, hp = 0;
    if (!hlOn && FX.pocketPulse > 0.01 && pocketMask[c] && hol[c] && v <= 0.0015) {
      const pp = FX.pocketPulse;
      r += (cAir.r - r) * pp; g += (cAir.g - g) * pp; b += (cAir.b - b) * pp; hh = pp * 0.8;
    }
    if (hlOn) {
      if (hol[c]) { hh = 1; r = cAir.r; g = cAir.g; b = cAir.b; gloss = 0.3; emi = 0; }
      if (plug[c]) { hp = 1; r = cPlug.r; g = cPlug.g; b = cPlug.b; gloss = 0.2; emi = 0; }
    }
    fCol[c * 3] = r; fCol[c * 3 + 1] = g; fCol[c * 3 + 2] = b;
    fMat[c * 4] = gloss; fMat[c * 4 + 1] = emi; fMat[c * 4 + 2] = hh; fMat[c * 4 + 3] = hp;
  }
  aPos.needsUpdate = true; aNor.needsUpdate = true; aCol.needsUpdate = true; aMat.needsUpdate = true;
}

// ------------------------------------------------------------------------------------------
// low-poly figures
// ------------------------------------------------------------------------------------------
// each figure is five rigid merged meshes (body, two legs, two arms) sharing one vertex-coloured material
const figMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.88, flatShading: true });
const skinCol = col(0xc58b5e);
function makeFigure(robeHex, clothHex, sashHex) {
  const robeC = col(robeHex), clothC = col(clothHex), sashC = col(sashHex);
  const g = new THREE.Group();
  const body = new THREE.Group(); g.add(body);
  const part = (mg, parent, x, y) => {
    const m = new THREE.Mesh(mg.build(), figMat); m.castShadow = true;
    const p = new THREE.Group(); p.position.set(x, y, 0); p.add(m); parent.add(p); return p;
  };
  const legM = () => new Merger()
    .add(new THREE.CylinderGeometry(0.12, 0.11, 1.3, 6), skinCol, [0, -0.65, 0])
    .add(new THREE.BoxGeometry(0.22, 0.12, 0.38), clothC, [0, -1.3, 0.08]);
  const legL = part(legM(), body, -0.2, 1.38), legR = part(legM(), body, 0.2, 1.38);
  const torso = new Merger()
    .add(new THREE.CylinderGeometry(0.42, 0.66, 1.65, 8), robeC, [0, 1.32, 0])
    .add(new THREE.CylinderGeometry(0.44, 0.44, 0.62, 8), robeC, [0, 2.35, 0])
    .add(new THREE.CylinderGeometry(0.47, 0.5, 0.16, 8), sashC, [0, 1.98, 0])
    .add(new THREE.CylinderGeometry(0.12, 0.14, 0.2, 6), skinCol, [0, 2.72, 0])
    .add(new THREE.IcosahedronGeometry(0.3, 1), skinCol, [0, 2.98, 0])
    .add(new THREE.SphereGeometry(0.33, 8, 6, 0, Math.PI * 2, 0, Math.PI * 0.55), clothC, [0, 3.0, -0.03], [-0.25, 0, 0])
    .add(new THREE.BoxGeometry(0.5, 0.5, 0.08), clothC, [0, 2.72, -0.28], [0.2, 0, 0]);
  part(torso, body, 0, 0);
  const armM = () => new Merger()
    .add(new THREE.CylinderGeometry(0.1, 0.085, 1.05, 6), skinCol, [0, -0.52, 0])
    .add(new THREE.CylinderGeometry(0.15, 0.13, 0.55, 6), robeC, [0, -0.25, 0])
    .add(new THREE.IcosahedronGeometry(0.11, 0), skinCol, [0, -1.08, 0]);
  const armL = part(armM(), body, -0.52, 2.55), armR = part(armM(), body, 0.52, 2.55);
  return { g, body, legL, legR, armL, armR, walk: 0 };
}
function poseWalk(f, phase, amt) {
  const s = Math.sin(phase) * 0.55 * amt;
  f.legL.rotation.x = s; f.legR.rotation.x = -s;
  f.body.position.y = Math.abs(Math.cos(phase)) * 0.06 * amt;
}

// ------------------------------------------------------------------------------------------
// fire with the next cauldron, the pour rig (crew + cauldron + pole), the spout, the knocker
// ------------------------------------------------------------------------------------------
const FIRE = new THREE.Vector3(-8.3, 0, 4.4);
const RIG_Z = 6.45, POLE_Y = 1.82;
const clayHex = 0xa4573a;
function cauldronGeometry() {
  const pts = [];
  const prof = [[0.0, -1.0], [0.3, -0.99], [0.52, -0.9], [0.68, -0.68], [0.72, -0.42], [0.66, -0.15], [0.52, 0.02], [0.5, 0.08], [0.57, 0.12], [0.55, 0.16], [0.47, 0.13], [0.45, 0.04]];
  for (const [r, y] of prof) pts.push(new THREE.Vector2(r, y));
  return new THREE.LatheGeometry(pts, 14);
}
function cauldronRadiusAt(y) { // inner radius of the profile at local height y (-1..0.05)
  const prof = [[-1.0, 0.0], [-0.99, 0.3], [-0.9, 0.52], [-0.68, 0.68], [-0.42, 0.72], [-0.15, 0.66], [0.02, 0.52], [0.08, 0.5]];
  for (let j = 0; j < prof.length - 1; j++) if (y <= prof[j + 1][0]) {
    const f = (y - prof[j][0]) / (prof[j + 1][0] - prof[j][0]);
    return prof[j][1] + (prof[j + 1][1] - prof[j][1]) * f;
  }
  return 0.5;
}
const cauldronGeo = (() => {
  const mg = new Merger(), w = col(0xffffff);
  mg.add(cauldronGeometry(), w);
  const hg = new THREE.TorusGeometry(0.13, 0.04, 5, 8);
  for (const s of [-1, 1]) mg.add(hg, w, [s * 0.55, 0.02, 0], [0, Math.PI / 2, 0]);   // handles (loops)
  return mg.build();
})();

function makeCauldron() {
  const mat = new THREE.MeshStandardMaterial({ color: clayHex, roughness: 0.85, flatShading: true, side: THREE.DoubleSide, emissive: 0xff4a10, emissiveIntensity: 0 });
  const pot = new THREE.Mesh(cauldronGeo, mat); pot.castShadow = true;
  const mixMat = new THREE.MeshStandardMaterial({ color: 0xffa040, emissive: 0xff7a18, emissiveIntensity: 1, roughness: 0.25 });
  const mix = new THREE.Mesh(new THREE.CircleGeometry(1, 16), mixMat); mix.rotation.x = -Math.PI / 2;
  const g = new THREE.Group(); g.add(pot, mix);
  return { g, pot, mat, mix, mixMat };
}
function setCauldronLook(cd, amountFrac, heat) {
  const y = -0.95 + 0.97 * Math.max(0, Math.min(1, amountFrac));
  cd.mix.visible = amountFrac > 0.01;
  cd.mix.position.y = y;
  const r = cauldronRadiusAt(y) - 0.02; cd.mix.scale.set(r, r, 1);
  const j = Math.max(0, Math.min(LUT_N - 1, Math.round(heat * (LUT_N - 1)))) * 3;
  const j2 = Math.max(0, Math.min(LUT_N - 1, Math.round(heat * 0.82 * (LUT_N - 1)))) * 3;
  cd.mixMat.color.setRGB(liqLUT[j2], liqLUT[j2 + 1], liqLUT[j2 + 2]);
  cd.mixMat.emissive.setRGB(liqLUT[j2], liqLUT[j2 + 1], liqLUT[j2 + 2]);
  const e = Math.max(0, (heat - 0.3) / 0.7);
  cd.mixMat.emissiveIntensity = e * e * 0.55;
  cd.mat.emissiveIntensity = e * e * 0.35;   // the clay itself glows less as it cools
}

// fire
const flames = [];
{
  const fire = new THREE.Group(); fire.position.copy(FIRE); scene.add(fire);
  const stoneCol = col(0x9c8f7c), logCol = col(0x5a3a20);
  const fx0 = FIRE.x, fz0 = FIRE.z;
  for (let j = 0; j < 9; j++) {
    const a = (j / 9) * Math.PI * 2;
    staticMerge.add(new THREE.IcosahedronGeometry(0.22 + rnd() * 0.08, 0), stoneCol.clone().multiplyScalar(0.9 + rnd() * 0.2),
      [fx0 + Math.cos(a) * 0.95, 0.12, fz0 + Math.sin(a) * 0.95], null, [1, 0.7, 1]);
  }
  const logGeo = new THREE.CylinderGeometry(0.09, 0.1, 1.4, 6).toNonIndexed(); logGeo.computeVertexNormals();
  for (let j = 0; j < 4; j++) staticMerge.add(logGeo, logCol, [fx0, 0.12 + j * 0.05, fz0], [0, j * Math.PI / 4, Math.PI / 2]);
  const ember = new THREE.Mesh(new THREE.CircleGeometry(0.75, 12), new THREE.MeshBasicMaterial({ color: 0xff7a2a }));
  ember.rotation.x = -Math.PI / 2; ember.position.y = 0.03; fire.add(ember);
  const fm = [new THREE.MeshBasicMaterial({ color: 0xffb030 }), new THREE.MeshBasicMaterial({ color: 0xff6a14 })];
  for (let j = 0; j < 5; j++) {
    const f = new THREE.Mesh(new THREE.ConeGeometry(0.2 + rnd() * 0.1, 0.9, 5), fm[j % 2]);
    const a = j * 1.3; f.position.set(Math.cos(a) * 0.3, 0.45, Math.sin(a) * 0.3); fire.add(f); flames.push(f);
  }
  // three stones holding the next cauldron
  for (let j = 0; j < 3; j++) {
    const a = j * 2.1 + 0.3;
    staticMerge.add(new THREE.IcosahedronGeometry(0.28, 0), stoneCol, [fx0 + Math.cos(a) * 0.55, 0.28, fz0 + Math.sin(a) * 0.55]);
  }
  const statics = new THREE.Mesh(staticMerge.build(), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.84, flatShading: true }));
  statics.castShadow = true; statics.receiveShadow = true;
  scene.add(statics);
}
const nextCauldron = makeCauldron();
nextCauldron.g.position.set(FIRE.x, 1.55, FIRE.z);
scene.add(nextCauldron.g);
setCauldronLook(nextCauldron, 0.9, 1);

// rig
const rig = new THREE.Group(); scene.add(rig);
const poleMat = new THREE.MeshStandardMaterial({ color: 0x8a5a2e, roughness: 0.85, flatShading: true });
const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.6, 6), poleMat);
pole.rotation.z = Math.PI / 2; pole.position.set(0, POLE_Y, 0); pole.castShadow = true; rig.add(pole);
const tiltGroup = new THREE.Group(); tiltGroup.position.set(0, POLE_Y, 0); rig.add(tiltGroup);
const potA = makeCauldron(); potA.g.position.set(0, -0.05, 0); tiltGroup.add(potA.g);
const crewL = makeFigure(0xd9c9a6, 0xa65a38, 0x7d5a3a), crewR = makeFigure(0xc9b48c, 0x5f7391, 0x6b4a2e);
crewL.g.position.set(-1.6, 0, 0); crewL.g.rotation.y = Math.PI / 2;
crewR.g.position.set(1.6, 0, 0); crewR.g.rotation.y = -Math.PI / 2;
rig.add(crewL.g, crewR.g);

// spout (wooden trough) + trestle
const spout = new THREE.Group(); scene.add(spout);
const troughLen = 2.2;
const trough = new THREE.Group(); spout.add(trough);
{
  const wc = col(0xa06c3a), wc2 = col(0x94622f);
  const tm = new Merger()
    .add(new THREE.BoxGeometry(0.42, 0.06, troughLen), wc, [0, 0, -troughLen / 2])
    .add(new THREE.BoxGeometry(0.06, 0.2, troughLen), wc2, [-0.21, 0.08, -troughLen / 2])
    .add(new THREE.BoxGeometry(0.06, 0.2, troughLen), wc2, [0.21, 0.08, -troughLen / 2]);
  const tmesh = new THREE.Mesh(tm.build(), figMat); tmesh.castShadow = true; trough.add(tmesh);
  const leg = new THREE.BoxGeometry(0.08, 1.4, 0.08);
  const sm = new Merger()
    .add(leg, wc2, [-0.3, 0.62, 5.55], [0, 0, -0.12]).add(leg, wc2, [0.3, 0.62, 5.55], [0, 0, 0.12])
    .add(new THREE.BoxGeometry(0.75, 0.08, 0.1), wc, [0, 1.28, 5.55]);
  const trestle = new THREE.Mesh(sm.build(), figMat); trestle.castShadow = true; spout.add(trestle);
}
const troughMixMat = new THREE.MeshBasicMaterial({ color: 0xffa040 });
const troughMix = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.02, troughLen - 0.1), troughMixMat);
troughMix.position.set(0, 0.04, -troughLen / 2); trough.add(troughMix);

// knocker with a wooden mallet
const KNOCK_HOME = new THREE.Vector3(8.3, 0, 3.9);
const knocker = makeFigure(0xb9a27a, 0x6f8450, 0x5d7a4a);
knocker.g.position.copy(KNOCK_HOME); knocker.g.rotation.y = -2.3; scene.add(knocker.g);
const mallet = new THREE.Group();
{
  const mm = new Merger()
    .add(new THREE.CylinderGeometry(0.045, 0.05, 1.5, 6), col(0x8c5f34), [0, -0.75, 0])
    .add(new THREE.CylinderGeometry(0.2, 0.2, 0.55, 8), col(0x6e4a2a), [0, -1.5, 0], [0, 0, Math.PI / 2]);
  const mm2 = new THREE.Mesh(mm.build(), figMat); mm2.castShadow = true;
  mallet.add(mm2);
  mallet.position.set(0, -1.05, 0.05);
  knocker.armR.add(mallet);
}
knocker.armR.rotation.x = -0.25;

// stream ribbon
const STREAM_SEG = 18;
const sPos = new Float32Array((STREAM_SEG + 1) * 2 * 3), sCol = new Float32Array((STREAM_SEG + 1) * 2 * 3);
const streamGeo = new THREE.BufferGeometry();
{
  const idx = [];
  for (let j = 0; j < STREAM_SEG; j++) { const a = j * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
  streamGeo.setIndex(idx);
}
const aSPos = new THREE.BufferAttribute(sPos, 3).setUsage(THREE.DynamicDrawUsage);
const aSCol = new THREE.BufferAttribute(sCol, 3).setUsage(THREE.DynamicDrawUsage);
streamGeo.setAttribute('position', aSPos); streamGeo.setAttribute('color', aSCol);
const stream = new THREE.Mesh(streamGeo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }));
stream.frustumCulled = false; scene.add(stream);
// short stream from the cauldron lip into the trough
const lipStream = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.05, 1, 6), troughMixMat);
lipStream.geometry.translate(0, -0.5, 0); scene.add(lipStream);

// instanced bubbles and droplets
const MAXB = 48, MAXD = 48;
const bubbleMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), new THREE.MeshStandardMaterial({ color: 0xe6ddd2, roughness: 0.1, transparent: true, opacity: 0.92, emissive: 0x7a4a2a, emissiveIntensity: 0.3 }), MAXB);
bubbleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); bubbleMesh.frustumCulled = false; bubbleMesh.count = 0; scene.add(bubbleMesh);
const dropMesh = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 0), new THREE.MeshBasicMaterial({ color: 0xffa23a }), MAXD);
dropMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage); dropMesh.frustumCulled = false; dropMesh.count = 0; scene.add(dropMesh);
const bubbles = [], drops = [];
for (let j = 0; j < MAXB; j++) bubbles.push({ on: false, x: 0, y: 0, z: 0, vy: 0, r: 0, t: 0, life: 1 });
for (let j = 0; j < MAXD; j++) drops.push({ on: false, x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, t: 0, s: 0 });

// chunks for the teardown
const chunks = [];
{
  const cm = new THREE.MeshStandardMaterial({ color: 0x7b6d5f, roughness: 0.95, flatShading: true });
  const cg = new THREE.DodecahedronGeometry(1, 0);
  for (let j = 0; j < 8; j++) {
    const m = new THREE.Mesh(cg, cm);
    m.visible = false; m.castShadow = true; scene.add(m);
    chunks.push({ m, x: 0, z: 0, sx: 1, sz: 1, delay: 0, owner: 0, px: 0, pz: 0, hx: 0, hy: 0, hz: 0 });
  }
}

// ------------------------------------------------------------------------------------------
// sound: everything synthesised, wood, stone, fire, bubbling. Nothing metallic.
// ------------------------------------------------------------------------------------------
let actx = null, master = null, noiseBuf = null, pourGain = null, pourFilt = null, pourGain2 = null;
function makeBuffer(sec, fill) {
  const n = Math.floor(actx.sampleRate * sec), b = actx.createBuffer(1, n, actx.sampleRate), d = b.getChannelData(0);
  fill(d, actx.sampleRate); return b;
}
function initAudio() {
  if (actx) { if (actx.state === 'suspended') actx.resume(); return; }
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try { actx = new AC(); } catch (e) { actx = null; return; }
  master = actx.createGain(); master.gain.value = 0.8;
  const comp = actx.createDynamicsCompressor();
  master.connect(comp); comp.connect(actx.destination);
  noiseBuf = makeBuffer(2, (d) => { for (let j = 0; j < d.length; j++) d[j] = Math.random() * 2 - 1; });
  // fire crackle: quiet roar + sparse pops
  const fireBuf = makeBuffer(5, (d, sr) => {
    let br = 0;
    for (let j = 0; j < d.length; j++) { br = br * 0.985 + (Math.random() * 2 - 1) * 0.015; d[j] = br * 0.9; }
    for (let p = 0; p < 60; p++) {
      const at = Math.floor(Math.random() * (d.length - sr * 0.02)), amp = 0.2 + Math.random() * 0.6, len = Math.floor(sr * (0.002 + Math.random() * 0.01));
      for (let j = 0; j < len; j++) d[at + j] += (Math.random() * 2 - 1) * amp * Math.exp(-j / (len * 0.3));
    }
  });
  const fs = actx.createBufferSource(); fs.buffer = fireBuf; fs.loop = true;
  const ff = actx.createBiquadFilter(); ff.type = 'lowpass'; ff.frequency.value = 2600;
  const fg = actx.createGain(); fg.gain.value = 0.22;
  fs.connect(ff); ff.connect(fg); fg.connect(master); fs.start();
  // pouring: thick brown noise, gurgling filter
  const brown = makeBuffer(4, (d) => { let b = 0; for (let j = 0; j < d.length; j++) { b = (b + 0.02 * (Math.random() * 2 - 1)) / 1.02; d[j] = b * 3.5; } });
  const ps = actx.createBufferSource(); ps.buffer = brown; ps.loop = true;
  pourFilt = actx.createBiquadFilter(); pourFilt.type = 'lowpass'; pourFilt.frequency.value = 400; pourFilt.Q.value = 4;
  const lfo = actx.createOscillator(); lfo.frequency.value = 6.5; const lfoG = actx.createGain(); lfoG.gain.value = 140;
  lfo.connect(lfoG); lfoG.connect(pourFilt.frequency); lfo.start();
  pourGain = actx.createGain(); pourGain.gain.value = 0;
  ps.connect(pourFilt); pourFilt.connect(pourGain); pourGain.connect(master); ps.start();
  // a soft hiss on top (molten mix meeting the cool floor)
  const hs = actx.createBufferSource(); hs.buffer = noiseBuf; hs.loop = true;
  const hf = actx.createBiquadFilter(); hf.type = 'bandpass'; hf.frequency.value = 2200; hf.Q.value = 0.7;
  pourGain2 = actx.createGain(); pourGain2.gain.value = 0;
  hs.connect(hf); hf.connect(pourGain2); pourGain2.connect(master); hs.start();
}
function env(g, t, a, peak, d) { g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d); }
function tone(type, f0, f1, t, a, d, vol, dest) {
  const o = actx.createOscillator(), g = actx.createGain();
  o.type = type; o.frequency.setValueAtTime(f0, t); if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(f1, t + a + d);
  env(g, t, a, vol, d); o.connect(g); g.connect(dest || master); o.start(t); o.stop(t + a + d + 0.05);
}
function noiseHit(t, type, freq, q, a, d, vol) {
  const s = actx.createBufferSource(); s.buffer = noiseBuf;
  const f = actx.createBiquadFilter(); f.type = type; f.frequency.value = freq; f.Q.value = q;
  const g = actx.createGain(); env(g, t, a, vol, d);
  s.connect(f); f.connect(g); g.connect(master); s.start(t, Math.random() * 1.5); s.stop(t + a + d + 0.05);
}
function marimba(freq, t, vol) {   // wooden bar: fundamental + 4th partial, short
  tone('sine', freq, freq, t, 0.004, 0.45, vol);
  tone('sine', freq * 4, freq * 4, t, 0.002, 0.08, vol * 0.18);
  noiseHit(t, 'bandpass', freq * 2, 2, 0.001, 0.02, vol * 0.25);
}
const sfx = {
  knockFull() { if (!actx) return; const t = actx.currentTime + 0.01;
    tone('sine', 105, 62, t, 0.003, 0.42, 0.95); tone('sine', 168, 120, t, 0.002, 0.16, 0.35);
    noiseHit(t, 'lowpass', 900, 0.7, 0.001, 0.06, 0.8); noiseHit(t, 'lowpass', 260, 1, 0.002, 0.25, 0.6); },
  knockHollow() { if (!actx) return; const t = actx.currentTime + 0.01;
    tone('sine', 330, 300, t, 0.002, 0.16, 0.5); tone('triangle', 520, 500, t, 0.002, 0.07, 0.12);
    noiseHit(t, 'bandpass', 470, 7, 0.001, 0.16, 1.1); noiseHit(t, 'bandpass', 760, 6, 0.001, 0.1, 0.6);
    noiseHit(t, 'highpass', 1500, 0.7, 0.001, 0.02, 0.25); },
  thud() { if (!actx) return; const t = actx.currentTime + 0.01;
    tone('sine', 80, 50, t, 0.003, 0.22, 0.6); noiseHit(t, 'lowpass', 500, 0.8, 0.002, 0.08, 0.5); },
  bubble() { if (!actx) return; const t = actx.currentTime + 0.005, f = 160 + Math.random() * 140;
    tone('sine', f, f * (2.2 + Math.random()), t, 0.004, 0.07 + Math.random() * 0.05, 0.22 + Math.random() * 0.15); },
  reach(n) { if (!actx) return; const t = actx.currentTime + 0.01; const base = 392 * Math.pow(1.122, n);
    marimba(base, t, 0.32); marimba(base * 1.26, t + 0.08, 0.32); marimba(base * 1.5, t + 0.16, 0.3); },
  chime() { if (!actx) return; const t = actx.currentTime + 0.02; const ns = [523, 659, 784, 1047, 1319];
    ns.forEach((f, j) => marimba(f, t + j * 0.09, 0.34)); marimba(523, t + 0.5, 0.25); marimba(784, t + 0.5, 0.2); marimba(1047, t + 0.5, 0.2); },
  crumble() { if (!actx) return; const t = actx.currentTime + 0.01;
    for (let j = 0; j < 7; j++) noiseHit(t + j * 0.06 + Math.random() * 0.04, 'lowpass', 700 + Math.random() * 500, 0.8, 0.002, 0.07, 0.5); },
  tock() { if (!actx) return; const t = actx.currentTime + 0.01;   // dull wood: a passage has closed
    tone('sine', 210, 150, t, 0.002, 0.13, 0.6); tone('triangle', 340, 300, t, 0.001, 0.04, 0.12);
    noiseHit(t, 'bandpass', 620, 3, 0.001, 0.05, 0.55); noiseHit(t, 'lowpass', 300, 0.8, 0.002, 0.1, 0.35); },
  down() { if (!actx) return; const t = actx.currentTime + 0.01; marimba(330, t, 0.18); marimba(262, t + 0.12, 0.18); },
};
function vibrate(p) { try { if (navigator.vibrate) navigator.vibrate(p); } catch (e) { /* ignore */ } }

// ------------------------------------------------------------------------------------------
// input: two thumbs (Pointer Events), mouse, wheel
// ------------------------------------------------------------------------------------------
const ctl = { t: 0.5, tilt: 0, spoutId: -1, sx: 0, sy: 0, t0: 0, tilt0: 0, camId: -1, cx: 0, cy: 0, pitch0: 0, yaw0: 0, touched: false };
const cam = { pitch: 50, yaw: 0 };
const el = renderer.domElement;
el.style.touchAction = 'none';
overlay.style.pointerEvents = 'none';
function onDown(e) {
  initAudio();
  ctl.touched = true;
  const right = e.button === 2;
  if (!right && e.clientX < VW / 2 && ctl.spoutId === -1) {
    ctl.spoutId = e.pointerId; ctl.sx = e.clientX; ctl.sy = e.clientY; ctl.t0 = ctl.t; ctl.tilt0 = sim.spout.tilt;
  } else if (ctl.camId === -1) {
    ctl.camId = e.pointerId; ctl.cx = e.clientX; ctl.cy = e.clientY; ctl.pitch0 = cam.pitch; ctl.yaw0 = cam.yaw;
  }
  try { el.setPointerCapture(e.pointerId); } catch (er) { /* ignore */ }
  e.preventDefault();
}
function onMove(e) {
  if (e.pointerId === ctl.spoutId) {
    ctl.t = Math.min(1, Math.max(0, ctl.t0 + (e.clientX - ctl.sx) / (0.42 * VW)));
    ctl.tilt = Math.min(1, Math.max(0, ctl.tilt0 + (ctl.sy - e.clientY) / (0.3 * VH)));
  } else if (e.pointerId === ctl.camId) {
    cam.pitch = Math.min(80, Math.max(35, ctl.pitch0 + (ctl.cy - e.clientY) * 0.16));
    cam.yaw = Math.min(35, Math.max(-35, ctl.yaw0 - (e.clientX - ctl.cx) * 0.14));
  }
}
function onUp(e) {
  if (e.pointerId === ctl.spoutId) { ctl.spoutId = -1; ctl.tilt = 0; }
  if (e.pointerId === ctl.camId) ctl.camId = -1;
}
el.addEventListener('pointerdown', onDown);
el.addEventListener('pointermove', onMove);
el.addEventListener('pointerup', onUp);
el.addEventListener('pointercancel', onUp);
el.addEventListener('lostpointercapture', onUp);
el.addEventListener('contextmenu', (e) => e.preventDefault());
root.addEventListener('contextmenu', (e) => e.preventDefault());
el.addEventListener('wheel', (e) => { cam.pitch = Math.min(80, Math.max(35, cam.pitch - e.deltaY * 0.03)); e.preventDefault(); }, { passive: false });

// ------------------------------------------------------------------------------------------
// overlay effects: score, floating words, flash rings, burst, ghost hand
// ------------------------------------------------------------------------------------------
const words = [], rings = [], parts = [];
for (let j = 0; j < 8; j++) words.push({ on: false, x: 0, y: 0, z: 0, text: '', t: 0, big: false });
for (let j = 0; j < 10; j++) rings.push({ on: false, x: 0, y: 0, z: 0, t: 0, dur: 1, hue: 0 });
for (let j = 0; j < 160; j++) parts.push({ on: false, x: 0, y: 0, vx: 0, vy: 0, t: 0, life: 1, c: 0, s: 1 });
const partCols = ['#ffcf5a', '#ff9a2e', '#fff1c4', '#e8b06a', '#ffd98a'];
function addWord(x, y, z, text, big) {
  for (const w of words) if (!w.on) { w.on = true; w.x = x; w.y = y; w.z = z; w.text = text; w.t = 0; w.big = !!big; return; }
}
function addRing(x, y, z, dur, hue) {
  for (const r of rings) if (!r.on) { r.on = true; r.x = x; r.y = y; r.z = z; r.t = 0; r.dur = dur; r.hue = hue; return; }
}
function burst(n) {
  let made = 0;
  for (const p of parts) {
    if (p.on) continue;
    p.on = true; p.x = VW / 2 + (Math.random() - 0.5) * 80; p.y = VH * 0.45;
    const a = Math.random() * Math.PI * 2, s = 250 + Math.random() * 650;
    p.vx = Math.cos(a) * s; p.vy = Math.sin(a) * s - 250; p.t = 0; p.life = 1.4 + Math.random() * 1.2;
    p.c = Math.floor(Math.random() * partCols.length); p.s = 3 + Math.random() * 6;
    if (++made >= n) break;
  }
}
let score = 0, scorePop = 0, scoreStr = '0';
function addScore(d) {
  const ns = Math.max(0, score + d);
  if (ns !== score) { score = ns; scoreStr = String(score); scorePop = 1; }
}
const pv = new THREE.Vector3();
function project(x, y, z) { pv.set(x, y, z).project(camera); pv.x = (pv.x * 0.5 + 0.5) * VW; pv.y = (-pv.y * 0.5 + 0.5) * VH; return pv.z < 1; }

let startTime = 0;
const FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
const SCORE_FONT = `700 30px ${FONT}`;
function drawOverlay(dt, now) {
  const ctx = g2;
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, VW, VH);
  // score: top centre, plain
  scorePop = Math.max(0, scorePop - dt * 2.5);
  const sz = 30 * (1 + 0.45 * scorePop);
  ctx.font = scorePop > 0 ? `700 ${sz.toFixed(1)}px ${FONT}` : SCORE_FONT;
  ctx.textAlign = 'center'; ctx.textBaseline = 'top';
  ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(70,40,15,0.55)'; ctx.fillStyle = scorePop > 0.05 ? '#fff4c8' : '#fffaf0';
  ctx.strokeText(scoreStr, VW / 2, 12); ctx.fillText(scoreStr, VW / 2, 12);
  // rings
  for (const r of rings) {
    if (!r.on) continue;
    r.t += dt; if (r.t > r.dur) { r.on = false; continue; }
    if (!project(r.x, r.y, r.z)) continue;
    const f = r.t / r.dur;
    ctx.beginPath(); ctx.arc(pv.x, pv.y, 12 + f * 70, 0, Math.PI * 2);
    ctx.lineWidth = 6 * (1 - f) + 1;
    ctx.globalAlpha = 1 - f;
    ctx.strokeStyle = r.hue === 1 ? '#d8952a' : '#ffeba0';
    ctx.stroke();
    if (r.hue === 0 && f < 0.35) { ctx.globalAlpha = 0.6 * (1 - f / 0.35); ctx.fillStyle = '#fffadc'; ctx.beginPath(); ctx.arc(pv.x, pv.y, 30 + f * 60, 0, Math.PI * 2); ctx.fill(); }
    ctx.globalAlpha = 1;
  }
  // words (Hebrew, right to left)
  ctx.textBaseline = 'middle';
  ctx.direction = 'rtl';
  for (const w of words) {
    if (!w.on) continue;
    w.t += dt; const dur = w.big ? 2.6 : 1.5;
    if (w.t > dur) { w.on = false; continue; }
    let x, y;
    if (w.big) { x = VW / 2; y = VH * 0.42; }
    else { if (!project(w.x, w.y, w.z)) continue; x = pv.x; y = pv.y - 20 - w.t * 50; }
    const a = Math.min(1, (dur - w.t) / 0.4), s = w.big ? Math.min(1, w.t * 5) * (110 + 10 * Math.sin(w.t * 6)) : 30 + 10 * Math.max(0, 1 - w.t * 4);
    ctx.font = `800 ${s.toFixed(1)}px ${FONT}`;
    ctx.globalAlpha = a; ctx.lineWidth = w.big ? 10 : 5; ctx.strokeStyle = 'rgba(90,45,10,0.75)'; ctx.fillStyle = w.big ? '#ffe7a0' : '#fff3c8';
    ctx.strokeText(w.text, x, y); ctx.fillText(w.text, x, y); ctx.globalAlpha = 1;
  }
  ctx.direction = 'ltr';
  // burst particles
  for (const p of parts) {
    if (!p.on) continue;
    p.t += dt; if (p.t > p.life) { p.on = false; continue; }
    p.vy += 500 * dt; p.vx *= 1 - dt * 0.6; p.x += p.vx * dt; p.y += p.vy * dt;
    ctx.globalAlpha = Math.min(1, (p.life - p.t) * 2); ctx.fillStyle = partCols[p.c];
    ctx.fillRect(p.x - p.s / 2, p.y - p.s / 2, p.s, p.s * 1.6);
  }
  ctx.globalAlpha = 1;
  // ghost hand hint: first seconds, left half, until the first touch
  const gt = now - startTime;
  if (!ctl.touched && gt < 4.5) {
    const a = Math.min(1, gt * 2, (4.5 - gt) * 2) * 0.75;
    const cyc = (gt % 1.6) / 1.6, e = cyc < 0.7 ? cyc / 0.7 : 1;
    const hx = VW * 0.24 + Math.sin(gt * 1.2) * VW * 0.03, hy = VH * 0.78 - e * VH * 0.2;
    ctx.globalAlpha = a * (cyc < 0.85 ? 1 : (1 - cyc) / 0.15);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 4; ctx.setLineDash([8, 10]);
    ctx.beginPath(); ctx.moveTo(hx, VH * 0.8); ctx.lineTo(hx, hy + 30); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = 'rgba(255,255,255,0.85)'; ctx.strokeStyle = 'rgba(80,50,20,0.45)'; ctx.lineWidth = 2;
    // a pointing hand: fingertip at (hx, hy)
    ctx.beginPath();
    ctx.moveTo(hx - 11, hy + 50); ctx.lineTo(hx - 11, hy + 2); ctx.arc(hx, hy + 2, 11, Math.PI, 0); ctx.lineTo(hx + 11, hy + 44);
    ctx.lineTo(hx + 30, hy + 42); ctx.arc(hx + 38, hy + 50, 9, -Math.PI / 2, Math.PI / 2, false);
    ctx.lineTo(hx + 44, hy + 64); ctx.quadraticCurveTo(hx + 46, hy + 100, hx + 18, hy + 104); ctx.lineTo(hx - 6, hy + 104);
    ctx.quadraticCurveTo(hx - 30, hy + 96, hx - 34, hy + 70); ctx.lineTo(hx - 30, hy + 56); ctx.quadraticCurveTo(hx - 24, hy + 48, hx - 11, hy + 56);
    ctx.closePath(); ctx.fill(); ctx.stroke();
    // touch ring and an arrow up
    ctx.beginPath(); ctx.arc(hx, hy, 24 + 12 * (1 - e), 0, Math.PI * 2); ctx.strokeStyle = 'rgba(255,240,200,0.7)'; ctx.lineWidth = 3; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(hx - 14, hy - 40); ctx.lineTo(hx, hy - 56); ctx.lineTo(hx + 14, hy - 40); ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.lineWidth = 5; ctx.lineCap = 'round'; ctx.stroke(); ctx.lineCap = 'butt';
    ctx.globalAlpha = 1;
  }
}

// ------------------------------------------------------------------------------------------
// game state
// ------------------------------------------------------------------------------------------
const G = {
  phase: 'pour', phaseT: 0, result: '', patches: 0, regions: null, knockX: 0, taps: 0, knockSoundFull: true,
  reached: [false, false, false, false], pocketsReached: 0, seals: [], lastSealT: -99,
  shake: 0, sink: 1, wasSwapping: false, bubbleClock: 0, swapAnim: 0, gleam: 0,
};
for (let j = 0; j < 6; j++) G.seals.push({ on: false, x: 0, z: 0, t: 0 });

function surfaceAt(x, z) {
  const i = Math.max(0, Math.min(NX - 1, Math.floor((x - X0) / DX))), k = Math.max(0, Math.min(NZ - 1, Math.floor((z - Z0) / DX)));
  const c = k * NX + i; return sim.ground[c] + sim.solid[c] + sim.vol[c];
}
function spawnBubble(x, z) {
  for (const b of bubbles) if (!b.on) {
    b.on = true; b.x = x + (Math.random() - 0.5) * 0.45; b.z = z + (Math.random() - 0.5) * 0.45;
    b.y = surfaceAt(b.x, b.z) + 0.02; b.vy = 0.3 + Math.random() * 0.35; b.r = 0.09 + Math.random() * 0.09; b.t = 0; b.life = 0.9 + Math.random() * 0.8;
    return;
  }
}
function spawnDrop(x, y, z, heat) {
  for (const d of drops) if (!d.on) {
    d.on = true; d.x = x; d.y = y; d.z = z; const a = Math.random() * Math.PI * 2, s = 0.6 + Math.random() * 1.4;
    d.vx = Math.cos(a) * s; d.vz = Math.sin(a) * s - 0.6; d.vy = 1.2 + Math.random() * 1.6; d.t = 0; d.s = 0.035 + Math.random() * 0.04;
    return;
  }
}

function startKnock() {
  G.phase = 'knock'; G.phaseT = 0; G.taps = 0;
  ctl.tilt = 0; ctl.spoutId = -1;
  sim.freezeAll();          // whatever liquid is left sets now: one stone colour before the knock
  FX.settle = 0;
  G.regions = sim.markPlugsForHollows();
  G.result = G.regions.length ? 'hollow' : 'full';
  // the knocker goes where the air is (or the middle when the segment is full)
  let kx = 3.2;
  if (G.regions.length) { let best = G.regions[0]; for (const r of G.regions) if (r.cells > best.cells) best = r; kx = best.plug ? best.plug.x : best.x; }
  G.knockX = Math.max(-5, Math.min(5, kx));
}
function onTap() {
  G.taps++;
  const full = G.result === 'full';
  if (full) sfx.knockFull(); else sfx.knockHollow();
  G.shake = Math.max(G.shake, 0.22); vibrate(35);
  if (G.taps === 3) {
    if (full) {
      G.phase = 'full'; G.phaseT = 0;
      sfx.chime(); G.shake = 0.7; vibrate([80, 40, 160]);
      const bonus = sim.cauldron.used <= 2 ? 20 : 0;
      addScore(40 + bonus);
      addWord(0, 0, 0, 'מלא!', true); burst(150);
      G.gleam = 1;
    } else {
      G.phase = 'hollow'; G.phaseT = 0;
      G.regions = sim.markPlugsForHollows();
      addScore(-20);
      for (const r of G.regions) { const px = r.plug ? r.plug.x : r.x, pz = r.plug ? r.plug.z : r.z; addRing(px, surfaceAt(px, pz) + 0.1, pz, 1.1, 1); addRing(px, surfaceAt(px, pz) + 0.1, pz, 2.2, 1); }
    }
  }
}
// teardown: the two crew walk to the near board, lift the hardened chunks out one by one and toss them on two heaps
const TD = { first: 1.25, gap: 0.34, carry: 1.2, back: 1.1 };
const TD_END = TD.first + 7 * TD.gap + TD.carry + TD.back + 0.2;
const CHUNK_SPOTS = [[-4.3, 2.5], [4.3, 2.5], [-1.6, 3.0], [1.6, 3.0], [-3.7, 0.3], [3.7, 0.3], [-3.9, -2.8], [3.9, -2.8]];
function startTeardown() {
  G.phase = 'teardown'; G.phaseT = 0; sfx.crumble();
  for (let j = 0; j < chunks.length; j++) {
    const ch = chunks[j];
    ch.x = CHUNK_SPOTS[j][0] + (rnd() - 0.5) * 0.5; ch.z = CHUNK_SPOTS[j][1] + (rnd() - 0.5) * 0.4;
    ch.owner = ch.x < 0 ? 0 : 1;
    ch.delay = TD.first + j * TD.gap; ch.sx = 0.75 + rnd() * 0.3; ch.sz = 0.6 + rnd() * 0.25;
    ch.px = (ch.owner ? 1 : -1) * (9.6 + rnd() * 0.9); ch.pz = 5.4 + (rnd() - 0.5) * 1.6;   // heap beside the frame
    ch.tossed = false;
    ch.m.visible = true; ch.m.position.set(ch.x, 0.45, ch.z); ch.m.scale.set(ch.sx, 0.28, ch.sz); ch.m.rotation.set(0, rnd() * 3, 0);
  }
}
function crewSpot(fi) { return fi === 0 ? -2.7 : 2.7; }
function updateTeardown(dt) {
  const t = G.phaseT;
  // the mix in the frame goes down as the chunks come out
  G.sink = Math.max(0, 1 - Math.max(0, t - TD.first) / (7 * TD.gap + 0.5));
  for (const ch of chunks) {
    const u = (t - ch.delay) / TD.carry;
    const f = ch.owner === 0 ? crewL : crewR;
    if (u <= 0) continue;
    const hx = rig.position.x + f.g.position.x, hz = rig.position.z + f.g.position.z - 0.45, hy = 3.35;
    if (u < 0.45) {        // lifted up into the hands
      const e = u / 0.45, k = e * e * (3 - 2 * e);
      ch.m.position.set(ch.x + (hx - ch.x) * k, 0.45 + (hy - 0.45) * k + Math.sin(e * Math.PI) * 0.6, ch.z + (hz - ch.z) * k);
      ch.m.rotation.x = e * 0.6;
    } else if (u < 1) {    // tossed onto the heap
      const e = (u - 0.45) / 0.55;
      ch.m.position.set(hx + (ch.px - hx) * e, hy + (0.35 - hy) * e + Math.sin(e * Math.PI) * 1.6, hz + (ch.pz - hz) * e);
      ch.m.rotation.x = 0.6 + e * 2.2; ch.m.rotation.z = e * 1.4;
    } else {
      if (!ch.tossed) { ch.tossed = true; sfx.crumble(); G.shake = Math.max(G.shake, 0.06); }
      ch.m.position.set(ch.px, 0.35, ch.pz);
    }
  }
}
// crew pose during the teardown (overrides the pour rig pose)
function crewTeardown(dt) {
  const t = G.phaseT;
  const out = t < TD_END - TD.back;
  tiltGroup.position.y += ((out ? 1.07 : POLE_Y) - tiltGroup.position.y) * Math.min(1, dt * 5);   // the pot is set down
  pole.position.y = tiltGroup.position.y;
  for (let fi = 0; fi < 2; fi++) {
    const f = fi === 0 ? crewL : crewR;
    const p = f.g.position;
    let tx = fi === 0 ? -1.6 : 1.6, tz = 0, face = fi === 0 ? Math.PI / 2 : -Math.PI / 2;
    if (out) { tx = crewSpot(fi) - rig.position.x; tz = D / 2 + BT + 0.75 - rig.position.z; face = Math.PI; }
    const dx = tx - p.x, dz = tz - p.z, dist = Math.hypot(dx, dz);
    let walking = 0;
    if (dist > 0.04) {
      const m = Math.min(dist, 4.8 * dt); p.x += dx / dist * m; p.z += dz / dist * m;
      f.g.rotation.y += angDiff(Math.atan2(dx, dz), f.g.rotation.y) * Math.min(1, dt * 10); walking = 1;
    } else f.g.rotation.y += angDiff(face, f.g.rotation.y) * Math.min(1, dt * 8);
    f.walk += dt * 11 * walking;
    poseWalk(f, f.walk, walking);
    let lift = 0;
    for (const ch of chunks) if (ch.owner === fi) {
      const u = (t - ch.delay) / TD.carry;
      if (u > 0.1 && u < 0.7) lift = Math.max(lift, Math.sin((u - 0.1) / 0.6 * Math.PI));
    }
    const bend = out && !walking ? 0.35 * (1 - lift) : 0;   // bend down to grip, straighten to lift
    f.armL.rotation.x = -0.4 - 2.4 * lift - bend * 2; f.armR.rotation.x = -0.4 - 2.4 * lift - bend * 2;
    f.armL.rotation.z = 0; f.armR.rotation.z = 0;
    f.body.rotation.x = bend;
  }
}
function finishTeardown() {
  for (const ch of chunks) ch.m.visible = false;
  crewL.g.position.set(-1.6, 0, 0); crewL.g.rotation.y = Math.PI / 2; crewR.g.position.set(1.6, 0, 0); crewR.g.rotation.y = -Math.PI / 2;
  tiltGroup.position.y = POLE_Y; pole.position.y = POLE_Y;
  sim.clearMix();
  G.patches++;
  G.sink = 1;
  resetRound();
  G.phase = 'pour'; G.phaseT = 0;
  sfx.thud(); G.shake = Math.max(G.shake, 0.12); vibrate(20);
}
function resetRound() {
  for (let j = 0; j < 4; j++) G.reached[j] = false;
  sealGlow.fill(0); pocketMask.fill(0); pocketDone.fill(0); FX.pulseT = 9; FX.pocketPulse = 0; FX.glowOn = false;
  G.pocketsReached = 0;
  for (const s of G.seals) s.on = false;
  sim.sealEvents.length = 0;
  fluidU.uHL.value = 0;
}
againBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  againBtn.classList.remove('show');
  sim.reset(); G.patches = 0; resetRound(); G.gleam = 0;
  G.phase = 'pour'; G.phaseT = 0; ctl.t = 0.5; ctl.tilt = 0;
  sfx.thud();
});
againBtn.addEventListener('pointerdown', (e) => { e.stopPropagation(); initAudio(); });

function checkTargets() {
  for (let j = 0; j < TARGETS.length; j++) {
    if (G.reached[j]) continue;
    const tg = TARGETS[j];
    const i0 = Math.max(0, Math.floor((tg.x - tg.r - X0) / DX)), i1 = Math.min(NX - 1, Math.floor((tg.x + tg.r - X0) / DX));
    const k0 = Math.max(0, Math.floor((tg.z - tg.r - Z0) / DX)), k1 = Math.min(NZ - 1, Math.floor((tg.z + tg.r - Z0) / DX));
    let hit = false;
    for (let k = k0; k <= k1 && !hit; k++) for (let i = i0; i <= i1; i++) { const c = k * NX + i; if (sim.floor[c] && sim.vol[c] + sim.solid[c] > 0.1) { hit = true; break; } }
    if (!hit) continue;
    G.reached[j] = true;
    let word = tg.word;
    if (j < 2) { G.pocketsReached++; if (G.pocketsReached === 2) word = 'יפה!'; }
    const y = surfaceAt(tg.x, tg.z) + 0.3;
    addRing(tg.x, y, tg.z, 0.9, 0); addWord(tg.x, y + 0.4, tg.z, word, false);
    addScore(10); sfx.reach(j); vibrate(15);
  }
}

// ------------------------------------------------------------------------------------------
// per-frame scene update
// ------------------------------------------------------------------------------------------
const tmpV = new THREE.Vector3(), tmpV2 = new THREE.Vector3(), tmpV3 = new THREE.Vector3(), mouth = new THREE.Vector3(), lip = new THREE.Vector3();
const tmpM = new THREE.Matrix4(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3(), ident = new THREE.Quaternion();
let rigX = 0, walkPhase = 0, knockWalk = 0;
const camTarget = new THREE.Vector3(0, 0.15, 0.9);

function spoutX() { return X0 + 0.4 + sim.spout.t * (W - 0.8); }

function updateRig(dt, time) {
  const ca = sim.cauldron, sp = sim.spout;
  const sx = spoutX();
  // the spout follows the thumb (via the sim's lag)
  const mz = 3.75 - 0.3 * sp.tilt;
  spout.position.set(sx, 0, 0);
  const topY = 1.42, topZ = 5.55, mouthY = 1.1;
  const dz = topZ - mz, dy = topY - mouthY;
  trough.position.set(0, topY, topZ);
  trough.rotation.x = Math.atan2(dy, dz) * -1;
  trough.scale.z = Math.hypot(dz, dy) / troughLen;
  mouth.set(sx, mouthY + 0.05, mz);

  // rig: goes to the fire and back while the cauldron is swapped
  let rx = sx, rz = RIG_Z, walking = Math.abs(sx - rigX) > 0.02 ? 1 : 0;
  if (ca.swapping > 0) {
    const p = 1 - ca.swapping / T.SWAP_TIME;            // 0..1
    const f = p < 0.5 ? p * 2 : (1 - p) * 2;             // out and back
    const e = f * f * (3 - 2 * f);
    rx = sx + (FIRE.x + 2.2 - sx) * e; rz = RIG_Z + (FIRE.z + 0.2 - RIG_Z) * e;
    walking = 1;
    if (p >= 0.5 && G.swapAnim === 0) { G.swapAnim = 1; } // halfway: the pot is exchanged at the fire
  } else if (G.swapAnim === 1) { G.swapAnim = 0; }
  rigX += (rx - rigX) * Math.min(1, dt * 6);
  rig.position.set(rigX, 0, rig.position.z + (rz - rig.position.z) * Math.min(1, dt * 6));
  walkPhase += dt * (6 + 6 * walking) * (walking ? 1 : 0);
  poseWalk(crewL, walkPhase, walking); poseWalk(crewR, walkPhase + Math.PI, walking);
  // tilt: the crew roll the cauldron on the pole toward the trough
  const tiltAng = ca.swapping > 0 ? 0 : sp.tilt * 1.15;
  tiltGroup.rotation.x = -tiltAng;
  for (let fi = 0; fi < 2; fi++) {
    const f = fi === 0 ? crewL : crewR;
    const lean = 0.85 + sp.tilt * 0.35;
    f.armL.rotation.x = -lean; f.armR.rotation.x = -lean;
    f.body.rotation.x = sp.tilt * 0.12;
  }
  // cauldron look
  const amountFrac = ca.swapping > 0 ? (G.swapAnim ? 1 : ca.amount / ca.cap) : ca.amount / ca.cap;
  const heatShown = ca.swapping > 0 && G.swapAnim ? 1 : ca.heat;
  setCauldronLook(potA, amountFrac, heatShown);
  potA.mix.rotation.x = -Math.PI / 2 + tiltAng; // the surface stays level
  // the next pot on the fire empties while the old one is put down, then is hot again
  setCauldronLook(nextCauldron, ca.swapping > 0 && G.swapAnim ? 0.15 : 0.9, 1);

  // lip stream into the trough + mix in the trough + main stream
  const pouring = sp.q > 0.001;
  tmpV.set(0, 0.08, -0.5); tiltGroup.localToWorld(tmpV); lip.copy(tmpV);
  const j = Math.max(0, Math.min(LUT_N - 1, Math.round(ca.heat * (LUT_N - 1)))) * 3;
  troughMixMat.color.setRGB(liqLUT[j] * 1.4, liqLUT[j + 1] * 1.4, liqLUT[j + 2] * 1.4);
  lipStream.visible = pouring; troughMix.visible = pouring;
  if (pouring) {
    const topW = tmpV2.set(sx, topY + 0.05, topZ - 0.2);
    lipStream.position.copy(lip);
    const len = Math.max(0.05, lip.distanceTo(topW));
    lipStream.scale.set(0.6 + sp.tilt, len, 0.6 + sp.tilt);
    tmpV3.subVectors(topW, lip).normalize();
    lipStream.quaternion.setFromUnitVectors(tmpV.set(0, -1, 0), tmpV3);
  }
  updateStream(pouring, sp, ca.heat, time);
}

function updateStream(pouring, sp, heat, time) {
  stream.visible = pouring;
  if (!pouring) return;
  const lx = sp.lx, lz = sp.lz, ly = surfaceAt(lx, lz) + 0.01;
  const mx = mouth.x, my = mouth.y, mz = mouth.z;
  // quadratic curve: leaves the mouth going inward, falls onto the landing cell
  const cx = mx, cy = my + 0.12, cz = mz - (mz - lz) * 0.7;
  const wTop = 0.06 + 0.2 * sp.tilt;
  const j = Math.max(0, Math.min(LUT_N - 1, Math.round(heat * (LUT_N - 1)))) * 3;
  const br = 1.25 + 0.6 * Math.max(0, heat - 0.4);
  for (let s = 0; s <= STREAM_SEG; s++) {
    const u = s / STREAM_SEG, a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, c = u * u;
    const px = a * mx + b * cx + c * lx, py = a * my + b * cy + c * ly, pz = a * mz + b * cz + c * lz;
    // tangent
    const tx = 2 * (1 - u) * (cx - mx) + 2 * u * (lx - cx), ty = 2 * (1 - u) * (cy - my) + 2 * u * (ly - cy), tz = 2 * (1 - u) * (cz - mz) + 2 * u * (lz - cz);
    tmpV.set(tx, ty, tz).normalize();
    tmpV2.subVectors(camera.position, tmpV3.set(px, py, pz)).normalize();
    tmpV2.crossVectors(tmpV, tmpV2).normalize();
    const w = wTop * (1 - 0.35 * u) * (u > 0.92 ? 1.6 : 1);
    const o = s * 6;
    sPos[o] = px - tmpV2.x * w; sPos[o + 1] = py - tmpV2.y * w; sPos[o + 2] = pz - tmpV2.z * w;
    sPos[o + 3] = px + tmpV2.x * w; sPos[o + 4] = py + tmpV2.y * w; sPos[o + 5] = pz + tmpV2.z * w;
    const band = 0.85 + 0.25 * Math.sin(u * 22 - time * 14);
    const r = liqLUT[j] * br * band, g = liqLUT[j + 1] * br * band, bb = liqLUT[j + 2] * br * band;
    sCol[o] = r * 0.85; sCol[o + 1] = g * 0.85; sCol[o + 2] = bb * 0.85;
    sCol[o + 3] = r; sCol[o + 4] = g; sCol[o + 5] = bb;
  }
  aSPos.needsUpdate = true; aSCol.needsUpdate = true;
}

function updateParticles(dt, time) {
  // droplets at the landing spot
  const sp = sim.spout;
  if (sp.q > 0.001 && Math.random() < sp.q * dt * 14) spawnDrop(sp.lx, surfaceAt(sp.lx, sp.lz) + 0.03, sp.lz, sim.cauldron.heat);
  let n = 0;
  for (const d of drops) {
    if (!d.on) continue;
    d.t += dt; d.vy -= 9 * dt; d.x += d.vx * dt; d.y += d.vy * dt; d.z += d.vz * dt;
    if (d.t > 1.2 || d.y < 0) { d.on = false; continue; }
    tmpS.set(d.s, d.s, d.s); tmpV.set(d.x, d.y, d.z); tmpM.compose(tmpV, ident, tmpS); dropMesh.setMatrixAt(n++, tmpM);
  }
  dropMesh.count = n; dropMesh.instanceMatrix.needsUpdate = true;
  // bubbles from sealed entrances
  for (const s of G.seals) {
    if (!s.on) continue;
    s.t += dt;
    const rate = s.t < 6 ? 10 : 1.2;   // strong right after it closes, then now and then
    if (Math.random() < rate * dt) { spawnBubble(s.x, s.z); if (s.t < 6 || Math.random() < 0.5) sfx.bubble(); }
  }
  n = 0;
  for (const b of bubbles) {
    if (!b.on) continue;
    b.t += dt; b.y += b.vy * dt; b.vy *= 1 - dt * 0.5;
    const f = b.t / b.life;
    if (f >= 1) { b.on = false; continue; }
    let r = b.r * (0.4 + f * 1.2); if (f > 0.85) r *= 1 + (f - 0.85) * 8;
    tmpS.set(r, r, r); tmpV.set(b.x + Math.sin(b.t * 9 + b.z * 7) * 0.03, b.y, b.z); tmpM.compose(tmpV, ident, tmpS); bubbleMesh.setMatrixAt(n++, tmpM);
  }
  bubbleMesh.count = n; bubbleMesh.instanceMatrix.needsUpdate = true;
}

function updateKnocker(dt) {
  const k = knocker;
  let tx = KNOCK_HOME.x, tz = KNOCK_HOME.z, face = -2.3;
  if (G.phase === 'knock' || G.phase === 'hollow' || G.phase === 'full') {
    tx = G.knockX + 0.6; tz = D / 2 + BT + 1.05; face = Math.PI;
  }
  const dx = tx - k.g.position.x, dz = tz - k.g.position.z, dist = Math.hypot(dx, dz);
  const sp = 4.2 * dt;
  let walking = 0;
  if (dist > 0.03) {
    const m = Math.min(dist, sp); k.g.position.x += dx / dist * m; k.g.position.z += dz / dist * m;
    const want = Math.atan2(dx, dz); k.g.rotation.y += angDiff(want, k.g.rotation.y) * Math.min(1, dt * 8); walking = 1;
  } else {
    k.g.rotation.y += angDiff(face, k.g.rotation.y) * Math.min(1, dt * 6);
  }
  knockWalk += dt * 10 * walking;
  poseWalk(k, knockWalk, walking);
  // mallet swing: three taps once he stands in place
  if (G.phase === 'knock') {
    if (dist <= 0.03) {
      G.phaseT += dt;
      const tt = G.phaseT - 0.35;
      if (tt > 0) {
        const per = 0.62, ph = (tt % per) / per, n = Math.floor(tt / per);
        // raise slowly, strike fast
        const ang = ph < 0.7 ? -0.25 - 1.6 * (ph / 0.7) : -1.85 + 1.85 * ((ph - 0.7) / 0.3) * 1.05;
        k.armR.rotation.x = ang; k.armL.rotation.x = ang * 0.6;
        k.body.rotation.x = 0.25;
        if (n > G.taps && G.taps < 3) onTap();
      }
    }
  } else {
    k.armR.rotation.x += (-0.25 - k.armR.rotation.x) * Math.min(1, dt * 5);
    k.armL.rotation.x += (0 - k.armL.rotation.x) * Math.min(1, dt * 5);
    k.body.rotation.x *= 1 - Math.min(1, dt * 5);
  }
}
function angDiff(a, b) { let d = a - b; while (d > Math.PI) d -= Math.PI * 2; while (d < -Math.PI) d += Math.PI * 2; return d; }

function updateCamera(dt) {
  const p = cam.pitch * Math.PI / 180, y = cam.yaw * Math.PI / 180;
  const aspect = VW / VH;
  let dist = 21.5 + (cam.pitch - 35) / 45 * 3.5;
  if (aspect < 1.75) dist *= Math.pow(1.75 / aspect, 0.85);
  camera.position.set(camTarget.x + Math.sin(y) * Math.cos(p) * dist, camTarget.y + Math.sin(p) * dist, camTarget.z + Math.cos(y) * Math.cos(p) * dist);
  if (G.shake > 0.001) {
    const s = G.shake * G.shake * 0.9;
    camera.position.x += (Math.random() - 0.5) * s; camera.position.y += (Math.random() - 0.5) * s; camera.position.z += (Math.random() - 0.5) * s;
    G.shake *= Math.exp(-dt * 5);
  }
  camera.lookAt(camTarget);
}

// ------------------------------------------------------------------------------------------
// main loop
// ------------------------------------------------------------------------------------------
const STEP = 1 / 60;
let acc = 0, last = performance.now(), frame = 0, simTime = 0, fpsEst = 60;
function tick(nowMs) {
  const now = nowMs / 1000;
  let dt = (nowMs - last) / 1000; last = nowMs;
  if (!(dt > 0)) dt = STEP;
  if (dt > 0.1) dt = 0.1;
  frame++;
  fpsEst += (1 / Math.max(dt, 0.001) - fpsEst) * 0.05;

  // ---- simulation (fixed step)
  acc += dt;
  let steps = 0;
  const pourPhase = G.phase === 'pour';
  const simRuns = pourPhase || G.phase === 'knock';
  sim.hold = !pourPhase;   // no cauldron change once the knocker is on his way
  while (simRuns && acc >= STEP && steps < 6) {
    sim.step(STEP, ctl.t, pourPhase ? ctl.tilt : 0);
    acc -= STEP; steps++; simTime += STEP;
  }
  if (steps === 6 || !simRuns) acc = 0;
  if (!simRuns) simTime += dt;   // the test clock keeps running through the results

  // ---- events from the sim
  if (sim.newCauldron) { sim.newCauldron = false; sfx.thud(); G.shake = Math.max(G.shake, 0.12); vibrate(15); }
  if (sim.cauldron.swapping > 0 && !G.wasSwapping) sfx.down();
  G.wasSwapping = sim.cauldron.swapping > 0;
  while (sim.sealEvents.length) {
    const e = sim.sealEvents.shift();
    if (!pourPhase) continue;
    // ignore a re-close of the same entrance
    let dup = false;
    for (const s of G.seals) if (s.on && Math.hypot(s.x - e.x, s.z - e.z) < 1.3) { dup = true; s.t = Math.min(s.t, 3); }
    if (dup) continue;
    let slot = null; for (const s of G.seals) if (!s.on) { slot = s; break; }
    if (!slot) slot = G.seals[0];
    slot.on = true; slot.x = e.x; slot.z = e.z; slot.t = 0;
    addRing(e.x, surfaceAt(e.x, e.z) + 0.15, e.z, 1.6, 1);
    for (let j = 0; j < 8; j++) spawnBubble(e.x, e.z);
    sfx.bubble(); sfx.tock();
    G.shake = Math.max(G.shake, 0.16); vibrate(25);
    // the plug turns to hard stone now, and the dry pocket it cut off pulses once
    const r2 = (T.PLUG_R + 0.4) * (T.PLUG_R + 0.4);
    pocketMask.fill(0);
    for (let c = 0; c < N; c++) {
      const i = c % NX, dx = cellX(i) - e.x, dz = cellZ((c - i) / NX) - e.z;
      if (sim.plug[c] && dx * dx + dz * dz < r2) { sealGlow[c] = 1; if (sim.freezeAge[c] < 3) sim.freezeAge[c] = 3; }
      if (sim.hollow[c] && !pocketDone[c]) { pocketMask[c] = 1; pocketDone[c] = 1; }
    }
    FX.glowOn = true; FX.pulseT = 0;
  }
  // seal fx decay (no allocation)
  FX.pulseT += dt;
  FX.pocketPulse = FX.pulseT < 1.7 ? Math.sin(Math.PI * FX.pulseT / 1.7) : 0;
  if (FX.glowOn) {
    let any = false; const d = dt / 1.4;
    for (let c = 0; c < N; c++) if (sealGlow[c] > 0) { sealGlow[c] = Math.max(0, sealGlow[c] - d); any = true; }
    FX.glowOn = any;
  }
  // a seal whose region filled again (mix flowed over) stops bubbling
  if (frame % 30 === 0) for (const s of G.seals) if (s.on && sim.hollowCells === 0) s.on = false;

  if (pourPhase) {
    if (frame % 8 === 0) checkTargets();
    const settled = sim.stillTime > 1.0;
    const done = (sim.isFull() && sim.noPourTime > 1.5) || settled && (sim.noPourTime > 4 && sim.hollowCells > 0 || sim.exhausted)
      || (sim.exhausted && sim.noPourTime > 6);   // the last cauldron is done: never wait forever
    // when the segment is done, the last liquid sets quickly (darkens), then the knocker comes
    sim.setting = done || (sim.setting && sim.spout.q <= 0);
    if (sim.setting && frame % 6 === 0 && sim.hotLiquid() === 0) { sim.setting = false; startKnock(); }
  } else if (G.phase === 'hollow') {
    G.phaseT += dt;
    fluidU.uHL.value = G.phaseT < 2.2 ? 1 : Math.max(0, 1 - (G.phaseT - 2.2) * 3);
    if (G.phaseT > 2.5) { fluidU.uHL.value = 0; startTeardown(); }
  } else if (G.phase === 'teardown') {
    G.phaseT += dt;
    updateTeardown(dt);
    if (G.phaseT > TD_END) finishTeardown();
  } else if (G.phase === 'full') {
    G.phaseT += dt;
    fluidU.uGleamPos.value = -9 + G.phaseT * 9;
    fluidU.uGleam.value = G.phaseT < 2.4 ? 1.2 : Math.max(0, 1.2 - (G.phaseT - 2.4));
    if (G.phaseT > 3 && !againBtn.classList.contains('show')) againBtn.classList.add('show');
  }

  // ---- visuals
  FX.settle = G.phase === 'pour' ? 0 : Math.min(1, FX.settle + dt / 0.8);
  fluidU.uTime.value = now;
  const hlOn = G.phase === 'hollow';
  updateFluidMesh(G.sink, hlOn);
  updateRig(dt, now);
  if (G.phase === 'teardown') crewTeardown(dt);
  updateKnocker(dt);
  updateParticles(dt, now);
  for (let j = 0; j < flames.length; j++) { const f = flames[j]; const s = 0.8 + 0.3 * Math.sin(now * (9 + j * 2.3) + j); f.scale.set(1, s, 1); f.position.y = 0.2 + s * 0.45; }

  // ---- sound follows the flow
  if (actx) {
    const q = sim.spout.q / T.QMAX, t = actx.currentTime;
    pourGain.gain.setTargetAtTime(Math.min(0.9, q * 1.2), t, 0.08);
    pourGain2.gain.setTargetAtTime(Math.min(0.08, q * 0.12) * sim.cauldron.heat, t, 0.1);
    pourFilt.frequency.setTargetAtTime(260 + 520 * q, t, 0.1);
  }

  updateCamera(dt);
  renderer.render(scene, camera);
  drawOverlay(dt, now);
  requestAnimationFrame(tick);
}

// ------------------------------------------------------------------------------------------
// test hook
// ------------------------------------------------------------------------------------------
// what a watching player can see, for scripted test players: how full each back pocket looks, and where it is still low
function testView() {
  let nl = 0, fl = 0, nr = 0, fr = 0, best = -1, bx = 0;
  for (let k = 0; k < 11; k++) for (let i = 0; i < NX; i++) {
    const c = k * NX + i, x = cellX(i);
    if (!sim.floor[c] || cellZ(k) > -1.9 || Math.abs(x) < 1.5) continue;
    const f = sim.ground[c] + sim.solid[c] + sim.vol[c] >= T.FULL_LEVEL ? 1 : 0;
    if (x < 0) { nl++; fl += f; } else { nr++; fr += f; }
  }
  for (let i = 2; i < NX - 2; i++) {
    let n = 0;
    for (let k = 0; k < NZ; k++) { const c = k * NX + i; if (sim.floor[c] && sim.reach[c] && sim.ground[c] + sim.solid[c] + sim.vol[c] < T.FULL_LEVEL) n++; }
    if (n > best) { best = n; bx = cellX(i); }
  }
  return { pocketL: +(fl / Math.max(1, nl)).toFixed(3), pocketR: +(fr / Math.max(1, nr)).toFixed(3), lowX: +bx.toFixed(2) };
}
window.__yetzika = {
  state() {
    const ca = sim.cauldron;
    return {
      phase: G.phase,
      filledFraction: +sim.filledFraction.toFixed(4),
      hollowCells: G.phase === 'pour' ? sim.hollowCells : (G.regions ? G.regions.reduce((a, r) => a + r.cells, 0) : sim.hollowCells),
      cauldron: { amount: +(ca.amount / ca.cap).toFixed(3), heat: +ca.heat.toFixed(3), used: ca.used, swapping: ca.swapping > 0 },
      score,
      spout: { t: +sim.spout.t.toFixed(3), tilt: +sim.spout.tilt.toFixed(3) },
      patches: G.patches,
      result: G.result,
      missingCells: sim.missingCells,
      simTime: +simTime.toFixed(2),
      camera: { pitch: +cam.pitch.toFixed(1), yaw: +cam.yaw.toFixed(1) },
      fps: +fpsEst.toFixed(1),
      view: testView(),
      flow: { q: +sim.spout.q.toFixed(3), noPour: +sim.noPourTime.toFixed(1), still: +sim.stillTime.toFixed(1), setting: sim.setting },
      render: { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, pixelRatio: renderer.getPixelRatio() },
      fx: { pocketPulse: +FX.pocketPulse.toFixed(2), bubbles: bubbleMesh.count, seals: G.seals.filter((x) => x.on).map((x) => [+x.x.toFixed(2), +x.z.toFixed(2), +x.t.toFixed(1)]) },
    };
  },
};

window.addEventListener('resize', resize);
resize();
startTime = performance.now() / 1000;
requestAnimationFrame((t) => { last = t; tick(t); });
