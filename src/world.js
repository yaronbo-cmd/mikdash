// Terrain of Jerusalem around the Mount, the city, trees, sky.
import * as THREE from 'three';
import { rng, makeNoise, smooth, lerp } from './util.js';
import { PLAT } from './mount.js';

const NA = makeNoise(11), NB = makeNoise(29), NC = makeNoise(47), ND = makeNoise(83);
function prof(xs, ys, x) {
  if (x <= xs[0]) return ys[0];
  for (let i = 1; i < xs.length; i++) if (x <= xs[i]) { const t = (x - xs[i - 1]) / (xs[i] - xs[i - 1]), s = t * t * (3 - 2 * t); return ys[i - 1] + (ys[i] - ys[i - 1]) * s; }
  return ys[ys.length - 1];
}
// east–west sections: beside the Mount · to the north · to the south (Upper City – Tyropoeon – City of David – Kidron – Mount of Olives)
const MX = [-4000, -1300, -800, -470, -440, -395, -345, -300, 277, 300, 345, 420, 560, 900, 1250, 1700, 4000];
const MY = [62, 62, 46, 0, -30, -50, -52, -48, -56, -58, -86, -112, -80, 60, 150, 110, 60];
const NX = [-4000, -1200, -600, -360, -300, 277, 330, 450, 760, 1250, 1700, 4000];
const NY = [70, 60, 34, 8, 2, -4, -12, -28, 70, 150, 110, 60];
const SX = [-4000, -1200, -700, -470, -330, -200, 0, 200, 330, 420, 600, 900, 1250, 1700, 4000];
const SY = [50, 50, 30, -10, -80, -60, -50, -62, -110, -135, -90, 50, 140, 100, 60];

export function terrainH(x, z) {
  let h = prof(MX, MY, x);
  h = lerp(h, prof(NX, NY, x), smooth(-420, -1000, z));
  h = lerp(h, prof(SX, SY, x), smooth(420, 950, z));
  const wc = smooth(-335, -300, x) * (1 - smooth(277, 300, x));
  let hc, wz = 1;
  if (z < -480) hc = lerp(-34, -2, smooth(-480, -760, z));
  else if (z > 400) { hc = -52; wz = 1 - smooth(410, 700, z); }
  else hc = -50;
  h = lerp(h, hc, wc * wz);
  if (z > 950) h -= (z - 950) * 0.04;
  const dPlat = Math.max(PLAT.X0 - x, x - PLAT.X1, PLAT.Z0 - z, z - PLAT.Z1, 0);
  h += ((NA(x / 260, z / 260, 4) - 0.5) * 26 + (NB(x / 60, z / 60, 3) - 0.5) * 5) * smooth(25, 280, dPlat);
  // ── world6 ── the ground under city.js's pools: a pit under the pool, the rim level round it, blending out (never raises)
  for (const C of CARVE) {
    const sd = Math.max(Math.abs(x - C.x) - C.hw, Math.abs(z - C.z) - C.hd);
    if (sd < C.m) h = Math.min(h, sd <= 0 ? C.pit : C.rim + (h - C.rim) * smooth(0, C.m, sd));
  }
  return h;
}
// ── world6 ── the Siloam Pool and the Pool of Bethesda (src/city.js SIL / BETH + their retaining walls). Both lie far outside
// the Mount's platform and its margins, where nothing but the city reads terrainH.
export const CARVE = [
  { x: -322, z: 1321, hw: 46, hd: 37, pit: -97, rim: -86.6, m: 36 },
  { x: 115, z: -735, hw: 75, hd: 55, pit: -12, rim: 2.4, m: 30 },
  { x: -520, z: -5, hw: 40, hd: 42, pit: 3.6, rim: 3.6, m: 26 },     // the Xystus (lowers only the hill west of x −480)
];

const ZONES = [
  { x0: -1500, x1: -485, z0: -600, z1: 900, dens: 0.8, cell: 23 },    // Upper City
  { x0: -470, x1: -262, z0: 440, z1: 1300, dens: 0.66, cell: 22 },    // Lower City / Tyropoeon
  { x0: -255, x1: 300, z0: 470, z1: 1400, dens: 0.72, cell: 22 },     // City of David / Ophel
  { x0: -900, x1: 420, z0: -1500, z1: -660, dens: 0.6, cell: 26 },    // Bezetha
];
export function cityMask(x, z) {
  let m = 0;
  for (const Z of ZONES) { const d = Math.max(Z.x0 - x, x - Z.x1, Z.z0 - z, z - Z.z1); m = Math.max(m, smooth(40, -20, d)); }
  if (extraMask) m = Math.max(m, extraMask(x, z));   // ── world6 ── the new city's quarters (city.js), so no lawns between its houses
  return m;
}
// ── world6 ── city.js registers its quarters here (called before buildTerrain / buildTrees)
let extraMask = null;
export function setCityMask(f) { extraMask = typeof f === 'function' ? f : null; }
const EXCL = [[PLAT.X0 - 40, PLAT.X1 + 40, PLAT.Z0 - 110, PLAT.Z1 + 70], [-480, -290, -85, -33], [-360, -290, 340, 500], [-160, 80, 395, 445], [280, 310, -20, 140]];
const inEx = (x, z, m = 0) => EXCL.some(([a, b, c, d]) => x > a - m && x < b + m && z > c - m && z < d + m);

// terrain vertex colour at (x, z) with height h and normal.y ny (also used to blend the natural hill into it)
// ── world6 ── the hills as they are from spring's end to the first rains (the game's Sukkot): golden and olive-dry, greener only
// in the valley bottoms and the orchards (was a spring green)
const TC = { gA: new THREE.Color('#A3A064'), gB: new THREE.Color('#B9AE74'), dry: new THREE.Color('#C9B684'), rock: new THREE.Color('#D2C29D'), dust: new THREE.Color('#D3C3A0'), lush: new THREE.Color('#7C9049'), orchard: new THREE.Color('#99A15C') };
export function terrainColor(x, z, h, ny, c) {
  c.copy(TC.gA).lerp(TC.gB, NC(x / 150, z / 150, 3));
  c.lerp(TC.dry, smooth(0.45, 0.72, ND(x / 420 + 3, z / 420 - 2, 2)) * 0.8);
  c.lerp(TC.rock, smooth(0.10, 0.32, 1 - ny) * 0.85);
  c.lerp(TC.lush, smooth(-95, -135, h) * 0.55);
  if (x > 480) c.lerp(TC.orchard, 0.35 * smooth(480, 700, x));
  c.lerp(TC.dust, cityMask(x, z) * 0.78);
  const dPlat = Math.max(PLAT.X0 - x, x - PLAT.X1, PLAT.Z0 - z, z - PLAT.Z1, 0);
  c.lerp(TC.dust, smooth(90, 5, dPlat) * 0.7);
  return c;
}

export function buildTerrain(groundMap) {
  const N = 260, a = 910, b = 2730, n1 = N + 1;
  const xs = new Float32Array(n1);
  for (let i = 0; i <= N; i++) { const t = i / N * 2 - 1; xs[i] = a * t + b * t * t * t; }
  const pos = new Float32Array(n1 * n1 * 3), uv = new Float32Array(n1 * n1 * 2);
  for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
    const k = j * n1 + i, x = xs[i], z = xs[j];
    pos[k * 3] = x; pos[k * 3 + 1] = terrainH(x, z); pos[k * 3 + 2] = z;
    uv[k * 2] = x / 30; uv[k * 2 + 1] = -z / 30;
  }
  const idx = [];
  for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { const a0 = j * n1 + i, b0 = a0 + 1, c0 = a0 + n1, d0 = c0 + 1; idx.push(a0, c0, b0, b0, c0, d0); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  const nor = g.attributes.normal.array, col = new Float32Array(n1 * n1 * 3);
  const c = new THREE.Color();
  for (let k = 0; k < n1 * n1; k++) {
    terrainColor(pos[k * 3], pos[k * 3 + 2], pos[k * 3 + 1], nor[k * 3 + 1], c);
    col[k * 3] = c.r; col[k * 3 + 1] = c.g; col[k * 3 + 2] = c.b;
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  const mat = new THREE.MeshStandardMaterial({ vertexColors: true, map: groundMap, roughness: 1, metalness: 0 });
  const mesh = new THREE.Mesh(g, mat);
  mesh.receiveShadow = true; mesh.matrixAutoUpdate = false;
  return mesh;
}

export function buildCity(scene, B) {
  const r = rng(909);
  const pal = ['#D6C29B', '#CBB48C', '#DDCBA6', '#C2A87F', '#D1BB93', '#BCA27A', '#E0CFAC', '#C8AE86', '#B99D74', '#D8C4A0'].map((h) => new THREE.Color(h));
  const bodies = [], uppers = [], lights = [];
  for (const Z of ZONES) {
    const cell = Z.cell;
    for (let gx = Z.x0; gx < Z.x1; gx += cell) for (let gz = Z.z0; gz < Z.z1; gz += cell) {
      if (r() > Z.dens) continue;
      const w = 9 + r() * 9, d = 9 + r() * 9, x = gx + cell / 2 + (r() - 0.5) * (cell - w) * 0.6, z = gz + cell / 2 + (r() - 0.5) * (cell - d) * 0.6;
      if (inEx(x, z, 12)) continue;
      const hs = [terrainH(x - w / 2, z - d / 2), terrainH(x + w / 2, z - d / 2), terrainH(x - w / 2, z + d / 2), terrainH(x + w / 2, z + d / 2)];
      const lo = Math.min(...hs), hi = Math.max(...hs);
      if (hi - lo > 10) continue;
      const H = 5.5 + r() * 6 + (r() < 0.18 ? 5 : 0), y0 = lo - 2, y1 = hi + H, rot = (r() - 0.5) * 0.12;
      const c = pal[Math.floor(r() * pal.length)];
      bodies.push([x, z, w, d, y0, y1, rot, c]);
      if (r() < 0.38) uppers.push([x + (r() - 0.5) * w * 0.4, z + (r() - 0.5) * d * 0.4, w * 0.42, d * 0.42, y1, y1 + 4.5 + r() * 2, rot, c]);
      if (r() < 0.55) lights.push([x + (r() - 0.5) * w * 0.8, y1 + 1.5, z + (r() - 0.5) * d * 0.8]);
    }
  }
  const geo = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const mat = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.93 });
  const mk = (list, lip) => {
    const m = new THREE.InstancedMesh(geo, mat, list.length);
    const q = new THREE.Quaternion(), s = new THREE.Vector3(), p = new THREE.Vector3(), M = new THREE.Matrix4(), up = new THREE.Vector3(0, 1, 0);
    const cc = new THREE.Color();
    list.forEach(([x, z, w, d, y0, y1, rot, c], i) => {
      q.setFromAxisAngle(up, rot);
      if (lip) { p.set(x, y1 - 0.3, z); s.set(w + 0.7, 1.2, d + 0.7); cc.copy(c).offsetHSL(0, -0.03, -0.06); }
      else { p.set(x, y0, z); s.set(w, y1 - y0, d); cc.copy(c); }
      M.compose(p, q, s); m.setMatrixAt(i, M); m.setColorAt(i, cc);
    });
    m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
    scene.add(m); return m;
  };
  mk(bodies, false); mk(bodies, true); mk(uppers, false);
  // doors and small windows
  {
    const dm = new THREE.MeshStandardMaterial({ color: '#3A2C20', roughness: 1 });
    const doors = new THREE.InstancedMesh(geo, dm, bodies.length * 3);
    const M = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3(), off = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0);
    let n = 0;
    const rr = rng(4242);
    for (const [x, z, w, d, y0, y1, rot] of bodies) {
      q.setFromAxisAngle(up, rot);
      const face = rr() < 0.5 ? 1 : -1, ground = terrainH(x, z + face * d / 2);
      off.set((rr() - 0.5) * w * 0.5, 0, face * (d / 2 + 0.03)).applyQuaternion(q);
      p.set(x + off.x, Math.max(ground, y0) , z + off.z); sc.set(1.5, 2.6, 0.12); M.compose(p, q, sc); doors.setMatrixAt(n++, M);
      for (let k = 0; k < 2; k++) {
        const wx = (rr() - 0.5) * w * 0.7, wy = y1 - 3.2;
        if (wy - ground < 4) continue;
        off.set(wx, 0, -face * (d / 2 + 0.03)).applyQuaternion(q);
        p.set(x + off.x, wy, z + off.z); sc.set(0.9, 1.1, 0.12); M.compose(p, q, sc); doors.setMatrixAt(n++, M);
      }
    }
    doors.count = n; doors.frustumCulled = false; scene.add(doors);
  }

  // Herod's towers on the western edge — Hippicus 80, Phasael 90, Mariamne 55 (War 5.4.3)
  for (const [x, z, s, h] of [[-1330, 30, 26, 80], [-1330, 80, 30, 90], [-1330, 128, 22, 55]]) {
    const base = Math.min(terrainH(x - s / 2, z - s / 2), terrainH(x + s / 2, z + s / 2), terrainH(x - s / 2, z + s / 2), terrainH(x + s / 2, z - s / 2)) - 3;
    B.box('ash', x - s / 2, base, z - s / 2, x + s / 2, base + h, z + s / 2);
    B.box('ash', x - s / 2 - 0.8, base + h - 1.5, z - s / 2 - 0.8, x + s / 2 + 0.8, base + h + 0.3, z + s / 2 + 0.8, -999);
    for (let k = 0; k < 6; k++) { const t = -s / 2 + 1 + k * (s - 2) / 5; B.box('ash', x + t - 0.8, base + h + 0.3, z - s / 2 - 0.8, x + t + 0.8, base + h + 2.6, z - s / 2 + 0.8, -999); B.box('ash', x + s / 2 - 0.8, base + h + 0.3, z + t - 0.8, x + s / 2 + 0.8, base + h + 2.6, z + t + 0.8, -999); }
  }
  { const x0 = -1318, x1 = -1210, z0 = 150, z1 = 390, base = terrainH(-1264, 270) - 4; B.box('ash', x0, base, z0, x1, base + 30, z1); B.box('pave', x0, base + 30, z0, x1, base + 30.3, z1, -999); }

  // night lamps
  const lp = new Float32Array(lights.length * 3);
  lights.forEach(([x, y, z], i) => lp.set([x, y, z], i * 3));
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.BufferAttribute(lp, 3));
  return { lampGeo: lg };
}

export function buildTrees(scene, extra = [], rows = null, courts = []) {   // ── world6 ── extra: [x, y, z] cypresses (the palace gardens); rows: [x, z] olives on the Mount of Olives' terraces (city.js)
  const r = rng(313), olives = [], cyp = [];
  const addOlive = (x, z, s = 1) => { if (inEx(x, z, 8) || cityMask(x, z) > 0.35) return false; olives.push([x, terrainH(x, z), z, s * (0.8 + r() * 0.5), r() * 6.28]); return true; };
  let tries = 0;
  if (rows) for (const [x, z] of rows) if (olives.length < 1500) addOlive(x, z);   // ── world6 ──
  for (const [x, z] of courts) olives.push([x, terrainH(x, z), z, 0.62 + r() * 0.25, r() * 6.28]);   // ── world6 ── trees in the city's courts
  while (olives.length < 1700 && tries < 60000) { tries++; const x = 470 + r() * 1900, z = -1700 + r() * 3400; if (rows && x < 1250 && Math.abs(z) < 1100) continue; if (NA(x / 300 + 7, z / 300 - 3, 3) < 0.44) continue; addOlive(x, z); }
  for (let i = 0; i < 150; i++) addOlive(440 + r() * 150, -260 + r() * 380, 1.1);          // Gethsemane
  for (let i = 0; i < 1400 && olives.length < 2300; i++) { const x = -2600 + r() * 5200, z = -2600 + r() * 5200; if (NB(x / 200, z / 200, 2) < 0.52) continue; addOlive(x, z); }
  for (let i = 0; i < 700 && cyp.length < 230; i++) {
    const x = -1500 + r() * 1900, z = -1500 + r() * 2900;
    if (cityMask(x, z) < 0.6 || inEx(x, z, 14)) continue;
    cyp.push([x, terrainH(x, z) - 1, z, 0.8 + r() * 0.5]);
  }
  for (const [x, y, z] of extra) cyp.push([x, y - 1, z, 0.7 + r() * 0.4]);   // ── world6 ──
  // olive canopy — irregular low-poly blob
  const cg = new THREE.IcosahedronGeometry(1, 1);
  { const p = cg.attributes.position, jr = rng(4); for (let i = 0; i < p.count; i++) { const k = 0.82 + jr() * 0.3; p.setXYZ(i, p.getX(i) * k, p.getY(i) * k, p.getZ(i) * k); } cg.computeVertexNormals(); }
  const leaf = new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.9, flatShading: true });
  const bark = new THREE.MeshStandardMaterial({ color: '#6B5942', roughness: 1 });
  const can = new THREE.InstancedMesh(cg, leaf, olives.length), trunk = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.35, 0.6, 3.2, 5).translate(0, 1.6, 0), bark, olives.length);
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s = new THREE.Vector3(), up = new THREE.Vector3(0, 1, 0), cc = new THREE.Color();
  const leafPal = ['#7D8F57', '#6F824B', '#8A9A60', '#76884F', '#839552'].map((h) => new THREE.Color(h));
  olives.forEach(([x, y, z, k, rot], i) => {
    q.setFromAxisAngle(up, rot);
    p.set(x, y + 2.4 * k + 1.6, z); s.set(4.8 * k, 3.4 * k, 4.8 * k); M.compose(p, q, s); can.setMatrixAt(i, M);
    cc.copy(leafPal[i % leafPal.length]); can.setColorAt(i, cc);
    p.set(x, y - 0.5, z); s.set(k, k * 1.2, k); M.compose(p, q, s); trunk.setMatrixAt(i, M);
  });
  const cone = new THREE.InstancedMesh(new THREE.ConeGeometry(1.7, 12, 7).translate(0, 7, 0), new THREE.MeshStandardMaterial({ color: '#3E5C37', roughness: 0.9, flatShading: true }), cyp.length);
  cyp.forEach(([x, y, z, k], i) => { p.set(x, y, z); s.set(k, k * (1 + (i % 3) * 0.15), k); q.identity(); M.compose(p, q, s); cone.setMatrixAt(i, M); });
  for (const m of [can, trunk, cone]) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; scene.add(m); }
}

export function buildSky() {
  const uniforms = {
    top: { value: new THREE.Color() }, horizon: { value: new THREE.Color() }, bottom: { value: new THREE.Color() },
    sunDir: { value: new THREE.Vector3(0, 1, 0) }, sunCol: { value: new THREE.Color() }, sunI: { value: 1 },
  };
  const mk = (u) => new THREE.ShaderMaterial({
    uniforms: u,
    vertexShader: 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `uniform vec3 top, horizon, bottom, sunCol, sunDir; uniform float sunI; varying vec3 vP;
      void main(){ vec3 d = normalize(vP); float h = d.y;
        vec3 c = h > 0.0 ? mix(horizon, top, pow(clamp(h, 0.0, 1.0), 0.42)) : mix(horizon, bottom, clamp(-h * 5.0, 0.0, 1.0));
        float s = max(dot(d, normalize(sunDir)), 0.0);
        c += sunCol * (pow(s, 1600.0) * 30.0 + pow(s, 28.0) * 0.5 + pow(s, 4.0) * 0.14) * sunI;
        gl_FragColor = vec4(c, 1.0); }`,
    side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
  });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(5000, 32, 16), mk(uniforms));
  dome.renderOrder = -10; dome.frustumCulled = false;
  const envU = THREE.UniformsUtils.clone(uniforms);
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), mk(envU)));
  // stars
  const r = rng(12), sp = new Float32Array(1400 * 3);
  for (let i = 0; i < 1400; i++) { const a = r() * Math.PI * 2, e = Math.asin(0.05 + r() * 0.95); sp.set([Math.cos(a) * Math.cos(e) * 4600, Math.sin(e) * 4600, Math.sin(a) * Math.cos(e) * 4600], i * 3); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.7, sizeAttenuation: false, color: '#ffffff', transparent: true, opacity: 0.9, depthWrite: false, depthTest: false, fog: false }));
  stars.renderOrder = -9; stars.frustumCulled = false; stars.visible = false;
  dome.add(stars);
  return { dome, uniforms, envScene, envU, stars };
}

export function buildClouds(dome, puff) {
  const r = rng(77), clouds = [];
  for (let c = 0; c < 11; c++) {
    const a = r() * Math.PI * 2, e = 0.09 + r() * 0.12, R = 4200;
    const g = new THREE.Group();
    g.position.set(Math.cos(a) * Math.cos(e) * R, Math.sin(e) * R, Math.sin(a) * Math.cos(e) * R);
    for (let k = 0; k < 6; k++) {
      const m = new THREE.SpriteMaterial({ map: puff, color: '#ffffff', transparent: true, opacity: 0.9, depthWrite: false, depthTest: false, fog: false });
      const s = new THREE.Sprite(m);
      s.position.set((r() - 0.5) * 900, (r() - 0.5) * 120, (r() - 0.5) * 300);
      const sc = 380 + r() * 420; s.scale.set(sc * 1.6, sc * 0.7, 1); s.renderOrder = -8;
      g.add(s); clouds.push(s);
    }
    dome.add(g);
  }
  return clouds;
}
