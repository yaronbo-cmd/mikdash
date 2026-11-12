/* ── build 120 ── h120/water120.js — the water of stage 05's mikveh (brief §7 "The water"), its own and nobody else's: the chamber's
 * stone floor with its real relief (large slabs; the fall too slight to read by eye), the channels as cut, the running ribbon (moving
 * streaks, sparkles, a clear leading front, the turn at a bend), the stone it wets (dark for about a minute; the test pour's for a few
 * seconds), the thin fall into the basin and its splash rings, the basin's surface (slow ripples, the sky's colour, a bright reflection
 * toward the camera, the plaster under it darker), a puddle where the water stands, the hollow's pool, a short shower of rain.
 * Shaders and meshes only: the lights and the sky are read from the scene, never changed. One clock (tick) drives every material.
 *   floorY(x, z) — where the drawn floor is (the field where it stands over the court's paving, the paving's level where it dips under)
 *   floorMesh · grooveMesh · ribbon · wetTrail · fall · rings · surface · puddle · rain · tick(dt, X)
 */
import { H120, MIK, CHAMBER, floorH, resample } from './model.js';

const FL = H120.FLOOR, F = H120.FINGER;
/** the drawn floor: the field itself where it lies over the court's paving (top 6); where the field dips under the paving (the strip
 *  toward the lime pit and the door) it is drawn at the paving's own level — the model runs on the true field either way */
export const floorY = (x, z) => Math.max(floorH(x, z), FL) + 0.004;
const inChamber = (x, z) => x >= CHAMBER.x0 && x <= CHAMBER.x1 && z >= CHAMBER.z0 && z <= CHAMBER.z1;
const inBasin = (x, z) => x > MIK.x0 - 0.02 && x < MIK.stair + 0.02 && z > MIK.z0 - 0.02 && z < MIK.z1 + 0.02;

/* ───────── the shared clock and the sky read from the scene ───────── */
const U = { t: { value: 0 }, sky: { value: null }, skyLo: { value: null }, sun: { value: null } };
let skyT = -9;
function readSky(X) {
  const T = X.THREE;
  if (!U.sky.value) { U.sky.value = new T.Color('#9CC3DE'); U.skyLo.value = new T.Color('#DCE6EA'); U.sun.value = new T.Vector3(0.4, 0.8, 0.3).normalize(); }
  if (U.t.value - skyT < 1) return; skyT = U.t.value;
  let hemi = null, dir = null;
  try { X.scene.traverse((o) => { if (!hemi && o.isHemisphereLight && o.visible) hemi = o; if (!dir && o.isDirectionalLight && o.visible && o.intensity > 0.05) dir = o; }); } catch (e) { /* */ }
  if (hemi) U.sky.value.copy(hemi.color);
  try { if (X.scene.fog && X.scene.fog.color) U.skyLo.value.copy(X.scene.fog.color); } catch (e) { /* */ }
  if (dir) { const p = dir.position.clone(); if (dir.target) p.sub(dir.target.position); if (p.lengthSq() > 1e-6) U.sun.value.copy(p.normalize()); }
}
let ticked = 0;
/** every frame (the world's beat): the clock and the sky */
export function tick(dt, X) { U.t.value += Math.min(0.1, Math.max(0, dt)); ticked++; readSky(X); }
export const now = () => U.t.value;

const OUT = `
  gl_FragColor.rgb = pow(max(gl_FragColor.rgb, vec3(0.0)), vec3(2.2));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>`;
const HASH = `
  float h12(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float n12(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h12(i), h12(i + vec2(1.0, 0.0)), f.x), mix(h12(i + vec2(0.0, 1.0)), h12(i + vec2(1.0, 1.0)), f.x), f.y); }`;

/* ───────── the floor: large slabs (one canvas, drawn once from a fixed pattern) on the true relief ───────── */
let slabTex = null;
function slabs(T) {
  if (slabTex) return slabTex;
  const N = 512, c = document.createElement('canvas'); c.width = c.height = N; const g = c.getContext('2d');
  // 4 × 4 slabs of 2.5 amot over 10 amot; the rows offset by half a slab; each slab its own shade (a fixed hash, rule 56)
  const S = N / 4, hs = (i, j) => { const v = Math.sin(i * 127.1 + j * 311.7) * 43758.5453; return v - Math.floor(v); };
  g.fillStyle = '#CDBF9E'; g.fillRect(0, 0, N, N);
  for (let j = 0; j < 4; j++) for (let i = -1; i < 5; i++) {
    const x = i * S + (j % 2 ? S / 2 : 0), y = j * S, k = hs(i + 9, j + 3), l = 196 + Math.round(k * 22);
    g.fillStyle = `rgb(${l + 18},${l + 6},${l - 22})`; g.fillRect(x + 2, y + 2, S - 4, S - 4);
    for (let q = 0; q < 26; q++) { const a = hs(i * 7 + q, j * 13 + q * 3), b = hs(q * 5 + i, j + q), r = 4 + 18 * hs(q, i + j); g.fillStyle = `rgba(${a > 0.5 ? 120 : 250},${a > 0.5 ? 104 : 240},${a > 0.5 ? 80 : 220},0.06)`; g.beginPath(); g.arc(x + a * S, y + b * S, r, 0, 6.283); g.fill(); }
  }
  g.strokeStyle = 'rgba(96,82,60,0.55)'; g.lineWidth = 2.2;
  for (let j = 0; j <= 4; j++) { g.beginPath(); g.moveTo(0, j * S); g.lineTo(N, j * S); g.stroke(); }
  for (let j = 0; j < 4; j++) for (let i = -1; i < 5; i++) { const x = i * S + (j % 2 ? S / 2 : 0); g.beginPath(); g.moveTo(x, j * S); g.lineTo(x, (j + 1) * S); g.stroke(); }
  slabTex = new T.CanvasTexture(c); slabTex.wrapS = slabTex.wrapT = T.RepeatWrapping; slabTex.anisotropy = 4;
  try { slabTex.colorSpace = T.SRGBColorSpace; } catch (e) { /* */ }
  return slabTex;
}
/** the chamber's floor (the basin's cut left open), every half amah on the field */
export function floorMesh(X) {
  const T = X.THREE, s = 0.5, nx = Math.round((CHAMBER.x1 - CHAMBER.x0) / s), nz = Math.round((CHAMBER.z1 - CHAMBER.z0) / s);
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) { const x = CHAMBER.x0 + i * s, z = CHAMBER.z0 + j * s; pos.push(x, floorY(x, z) - 0.002, z); uv.push(x / 10, -z / 10); }
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const cx = CHAMBER.x0 + (i + 0.5) * s, cz = CHAMBER.z0 + (j + 0.5) * s; if (inBasin(cx, cz)) continue;
    const a = j * (nx + 1) + i, b = a + 1, c = a + nx + 1, d = c + 1; idx.push(a, c, b, b, c, d);
  }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  const m = new T.Mesh(g, new T.MeshStandardMaterial({ map: slabs(T), roughness: 0.93, color: '#FFFFFF' }));
  m.receiveShadow = true; m.name = 'h120-chamber-floor'; return m;
}

/* ───────── a strip along a polyline on the floor: the groove, the ribbon, the wet stone, the thread ───────── */
function strip(T, P, w, lift, o = {}) {
  // P: [[x, z, depth?]...] already resampled; attributes aU (amot along), aV (−1…1 across), aB (the bend: signed, per amah), aD (depth)
  const n = P.length, pos = new Float32Array(n * 6), aU = new Float32Array(n * 2), aV = new Float32Array(n * 2), aB = new Float32Array(n * 2), aD = new Float32Array(n * 2), idx = [];
  let u = 0;
  for (let i = 0; i < n; i++) {
    const p = P[i], a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
    if (i) u += Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]);
    let tx = b[0] - a[0], tz = b[1] - a[1]; const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
    // the bend: the turn of the heading over the two neighbours
    let bend = 0; if (i > 0 && i < n - 1) { const t0 = Math.atan2(p[1] - a[1], p[0] - a[0]), t1 = Math.atan2(b[1] - p[1], b[0] - p[0]); let d = t1 - t0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; bend = d / Math.max(0.1, tl / 2); }
    const ww = (typeof w === 'function' ? w(p, i) : w) / 2, nx = -tz * ww, nz = tx * ww, y = (o.y ? o.y(p, i) : floorY(p[0], p[1])) + lift;
    pos.set([p[0] + nx, y, p[1] + nz, p[0] - nx, y, p[1] - nz], i * 6);
    aU[i * 2] = aU[i * 2 + 1] = u; aV[i * 2] = 1; aV[i * 2 + 1] = -1; aB[i * 2] = aB[i * 2 + 1] = bend; aD[i * 2] = aD[i * 2 + 1] = p[2] || 1;
    if (i) { const k = (i - 1) * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aU', new T.BufferAttribute(aU, 1)); g.setAttribute('aV', new T.BufferAttribute(aV, 1)); g.setAttribute('aB', new T.BufferAttribute(aB, 1)); g.setAttribute('aD', new T.BufferAttribute(aD, 1));
  g.setIndex(idx); g.userData.len = u; return g;
}
/** a channel's points every quarter amah (the depth carried) */
export const along = (pts, step = 0.25) => resample(pts, step).map((p) => [p[0], p[1], p[2]]);

/** the channel as cut: a narrow groove in the slabs, its bottom darker the deeper it goes, chisel-rough edges */
export function grooveMesh(X, pts) {
  const T = X.THREE, P = along(pts, 0.25); if (P.length < 2) return null;
  const g = strip(T, P, (p) => 0.2 + 0.018 * (p[2] || 1), 0.004);
  const m = new T.Mesh(g, new T.ShaderMaterial({
    transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2,
    vertexShader: 'attribute float aU, aV, aD; varying float vU, vV, vD; void main(){ vU = aU; vV = aV; vD = aD; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `${HASH} varying float vU, vV, vD; void main(){
      float e = abs(vV), rough = n12(vec2(vU * 9.0, vV * 3.0));
      float wall = smoothstep(0.55 + 0.25 * rough, 1.0, e);
      vec3 bed = mix(vec3(0.46, 0.40, 0.31), vec3(0.24, 0.20, 0.15), clamp((vD - 1.0) / 3.0, 0.0, 1.0));
      vec3 c = mix(bed * (0.9 + 0.2 * rough), vec3(0.93, 0.89, 0.80), wall * 0.65);
      float a = (1.0 - smoothstep(0.9, 1.0, e)) * 0.92;
      gl_FragColor = vec4(c, a); ${OUT} }`,
  }));
  m.renderOrder = 2; m.name = 'h120-groove'; return m;
}

/* ───────── the running water ───────── */
/** the ribbon along a channel: uniforms uFront / uTail (amot along it: the water is between them), uFlow (0…1: how full) */
export function ribbon(X, pts, o = {}) {
  const T = X.THREE, P = o.raw ? pts : along(pts, 0.25); if (P.length < 2) return null;
  const g = strip(T, P, o.w || 0.24, o.lift != null ? o.lift : 0.014, o);
  const mat = new T.ShaderMaterial({
    transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
    uniforms: { uT: U.t, uSky: U.sky, uSkyLo: U.skyLo, uFront: { value: 0 }, uTail: { value: -1 }, uFlow: { value: 1 }, uSpeed: { value: o.speed || 1.7 }, uThin: { value: o.thin || 0 } },
    vertexShader: 'attribute float aU, aV, aB; varying float vU, vV, vB; void main(){ vU = aU; vV = aV; vB = aB; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `${HASH} uniform float uT, uFront, uTail, uFlow, uSpeed, uThin; uniform vec3 uSky, uSkyLo; varying float vU, vV, vB;
      void main(){
        if (vU > uFront || vU < uTail) discard;
        float toF = uFront - vU, toT = vU - uTail;
        // the width the water takes: full behind the front, a rounded tongue at it, thinner as it drains (uFlow); a thread (uThin)
        float tongue = clamp(toF / 0.22, 0.0, 1.0), wid = mix(0.35, 1.0, sqrt(tongue)) * mix(0.45, 1.0, uFlow) * (1.0 - 0.55 * uThin);
        float e = abs(vV) / max(0.05, wid); if (e > 1.0) discard;
        // the bend: the stream crowds to the outer bank (brighter, a little faster there)
        float outer = clamp(-vB * vV * 0.6, -1.0, 1.0);
        float sp = uSpeed * (1.0 + 0.25 * outer);
        float w1 = n12(vec2(vU * 3.0 - uT * sp * 3.0, vV * 2.1 + 0.3 * sin(vU * 1.7)));
        float w2 = n12(vec2(vU * 7.0 - uT * sp * 6.0, vV * 4.0 + 7.0));
        float streak = smoothstep(0.55, 0.85, w1 * 0.65 + w2 * 0.45);
        float spark = step(0.985, h12(vec2(floor(vU * 26.0 - uT * sp * 26.0), floor(vV * 3.0 + 3.0) + floor(uT * 9.0))));
        vec3 deep = vec3(0.16, 0.34, 0.40), shallow = vec3(0.42, 0.58, 0.60), sky = pow(uSky, vec3(1.0 / 2.2));
        vec3 c = mix(deep, mix(shallow, sky, 0.35), 0.35 + 0.45 * e * e);
        c += vec3(0.85, 0.92, 0.95) * streak * 0.32 + vec3(1.0) * spark * 0.8;
        c += vec3(0.6, 0.7, 0.72) * max(outer, 0.0) * 0.18;
        // the leading front: a bright foam lip, its edge clear
        float lip = 1.0 - smoothstep(0.0, 0.16, toF);
        c = mix(c, vec3(0.95, 0.97, 0.96), lip * 0.75);
        float a = (0.80 + 0.15 * streak) * (1.0 - smoothstep(0.82, 1.0, e)) * smoothstep(0.0, 0.25, toT + 0.25) * mix(0.75, 1.0, uFlow);
        gl_FragColor = vec4(c, a); ${OUT} }`,
  });
  const m = new T.Mesh(g, mat); m.renderOrder = 4; m.frustumCulled = false;
  return { mesh: m, len: g.userData.len, set(front, tail = -1, flow = 1) { mat.uniforms.uFront.value = front; mat.uniforms.uTail.value = tail; mat.uniforms.uFlow.value = flow; }, mat };
}
/** the stone the water has touched: dark while wet, drying `dry` seconds after the water left (uniform uWetTo: the front so far,
 *  uLeft: the time the water left, −1 while it runs) */
export function wetTrail(X, pts, o = {}) {
  const T = X.THREE, P = o.raw ? pts : along(pts, 0.25); if (P.length < 2) return null;
  const g = strip(T, P, o.w || 0.42, 0.007, o);
  const mat = new T.ShaderMaterial({
    transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
    uniforms: { uT: U.t, uWetTo: { value: 0 }, uLeft: { value: -1 }, uDry: { value: o.dry || 60 }, uFrom: { value: -1 } },
    vertexShader: 'attribute float aU, aV; varying float vU, vV; void main(){ vU = aU; vV = aV; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `${HASH} uniform float uT, uWetTo, uLeft, uDry, uFrom; varying float vU, vV;
      void main(){
        if (vU > uWetTo + 0.05 || vU < uFrom) discard;
        float age = uLeft < 0.0 ? 0.0 : uT - uLeft;
        // it dries from the edges in: the wet patch narrows and pales over uDry seconds
        float k = 1.0 - smoothstep(uDry * 0.5, uDry, age + (1.0 - (1.0 - abs(vV))) * uDry * 0.3);
        float edge = 0.55 + 0.3 * n12(vec2(vU * 4.0, vV * 2.0 + 3.0));
        float a = k * (1.0 - smoothstep(edge, edge + 0.25, abs(vV))) * 0.42;
        if (a < 0.004) discard;
        gl_FragColor = vec4(vec3(0.20, 0.16, 0.11), a); ${OUT} }`,
  });
  const m = new T.Mesh(g, mat); m.renderOrder = 3; m.frustumCulled = false;
  return { mesh: m, len: g.userData.len, set(wetTo, left = -1, from = -1) { mat.uniforms.uWetTo.value = wetTo; mat.uniforms.uLeft.value = left; mat.uniforms.uFrom.value = from; }, mat };
}

/* ───────── the fall into the basin: a thin stream off the inlet's lip down to the water (or the bottom), and its rings ───────── */
export function fall(X) {
  const T = X.THREE, g = new T.Group();
  const mat = new T.ShaderMaterial({
    transparent: true, depthWrite: false, side: T.DoubleSide,
    uniforms: { uT: U.t, uSky: U.sky, uOn: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
    fragmentShader: `${HASH} uniform float uT, uOn; uniform vec3 uSky; varying vec2 vUv;
      void main(){
        float s = n12(vec2(vUv.y * 2.0 + uT * 7.0, vUv.x * 6.0)) * 0.6 + n12(vec2(vUv.y * 5.0 + uT * 12.0, vUv.x * 9.0)) * 0.4;
        vec3 c = mix(vec3(0.55, 0.70, 0.74), pow(uSky, vec3(1.0 / 2.2)), 0.3) + vec3(0.9) * smoothstep(0.55, 0.8, s) * 0.45;
        float a = (0.55 + 0.35 * s) * uOn;
        gl_FragColor = vec4(c, a); ${OUT} }`,
  });
  let tube = null; const ringM = [], foamM = new T.MeshBasicMaterial({ color: 0xF4F8F6, transparent: true, opacity: 0.0, depthWrite: false });
  const rg = new T.RingGeometry(0.8, 1.0, 28);
  for (let i = 0; i < 4; i++) { const r = new T.Mesh(rg, new T.MeshBasicMaterial({ color: 0xF2F7F6, transparent: true, opacity: 0, depthWrite: false })); r.rotation.x = -Math.PI / 2; r.renderOrder = 6; g.add(r); ringM.push(r); }
  const foam = new T.Mesh(new T.CircleGeometry(0.16, 16), foamM); foam.rotation.x = -Math.PI / 2; foam.renderOrder = 6; g.add(foam);
  let lastY = null, on = 0;
  const lip = { x: MIK.inlet[0], y: FL + 0.01, z: MIK.z0 + 0.02 };
  return {
    g,
    /** k: 0…1 how much is falling; y: the surface (or the bottom) it lands on */
    set(k, y) {
      on = k; mat.uniforms.uOn.value = Math.min(1, k * 1.4);
      if (k <= 0.01) { if (tube) tube.visible = false; for (const r of ringM) r.visible = false; foam.visible = false; return; }
      if (lastY == null || Math.abs(lastY - y) > 0.03 || !tube) {
        lastY = y; if (tube) { g.remove(tube); tube.geometry.dispose(); }
        const h = Math.max(0.05, lip.y - y), out = 0.12 + 0.1 * Math.min(1, h / 3);
        const C = new T.QuadraticBezierCurve3(new T.Vector3(lip.x, lip.y, lip.z), new T.Vector3(lip.x, lip.y - 0.02, lip.z + out * 1.4), new T.Vector3(lip.x, y, lip.z + out));
        tube = new T.Mesh(new T.TubeGeometry(C, 18, 0.045, 6, false), mat); tube.renderOrder = 5; tube.frustumCulled = false; g.add(tube);
      }
      tube.visible = true; tube.scale.set(0.6 + 0.4 * k, 1, 0.6 + 0.4 * k);
    },
    frame() {
      if (on <= 0.01 || lastY == null) return;
      const t = U.t.value, x = lip.x, z = lip.z + 0.12 + 0.1 * Math.min(1, (lip.y - lastY) / 3);
      ringM.forEach((r, i) => { const ph = (t * 1.1 + i / ringM.length) % 1; r.visible = true; const s = 0.12 + ph * 0.75; r.scale.set(s, s, 1); r.position.set(x, lastY + 0.006, z); r.material.opacity = (1 - ph) * 0.55 * Math.min(1, on * 1.5); });
      foam.visible = true; foam.position.set(x, lastY + 0.008, z); foamM.opacity = 0.55 * Math.min(1, on * 1.5); const fs = 1 + 0.15 * Math.sin(t * 17); foam.scale.set(fs, fs, 1);
    },
  };
}

/* ───────── a still surface: the basin's, a puddle's, the hollow's pool ───────── */
export function surfaceMat(X, o = {}) {
  const T = X.THREE;
  return new T.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uT: U.t, uSky: U.sky, uSkyLo: U.skyLo, uSun: U.sun, uDrop: { value: new T.Vector3(0, 0, -1) }, uDeep: { value: new T.Color(o.deep || '#1F4A55') }, uA: { value: o.alpha || 0.86 }, uShallow: { value: o.shallow || 0 } },
    vertexShader: 'varying vec3 vW; varying vec2 vUv; void main(){ vUv = uv; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
    fragmentShader: `${HASH} uniform float uT, uA, uShallow; uniform vec3 uSky, uSkyLo, uSun, uDrop, uDeep; varying vec3 vW; varying vec2 vUv;
      void main(){
        vec2 p = vW.xz;
        // slow ripples: two long swells and a fine chop; rings from the fall (uDrop: x, z, on)
        vec2 g = vec2(0.0);
        g += vec2(0.7, 0.3) * cos(dot(p, vec2(2.1, 0.9)) + uT * 1.3) * 0.05;
        g += vec2(-0.2, 0.9) * cos(dot(p, vec2(-0.6, 2.6)) + uT * 1.7) * 0.04;
        g += (vec2(n12(p * 5.0 + uT * 0.6), n12(p * 5.0 - uT * 0.5 + 9.0)) - 0.5) * 0.08;
        if (uDrop.z > 0.0) { vec2 d = p - uDrop.xy; float r = length(d) + 1e-3; g += (d / r) * sin(r * 22.0 - uT * 9.0) * 0.09 * uDrop.z * exp(-r * 1.8); }
        vec3 n = normalize(vec3(-g.x, 1.0, -g.y));
        vec3 v = normalize(cameraPosition - vW);
        float fr = pow(1.0 - max(dot(n, v), 0.0), 3.0);
        vec3 r = reflect(-v, n);
        // the sky it takes: pale at the horizon, the sky's own colour higher up; the sun's glint; a bright band toward the camera
        vec3 sky = pow(mix(uSkyLo, uSky, smoothstep(0.0, 0.6, r.y)), vec3(1.0 / 2.2));
        float glint = pow(max(dot(r, normalize(uSun)), 0.0), 220.0) * 2.2;
        float band = pow(max(dot(r, normalize(uSun)), 0.0), 10.0) * 0.45 + smoothstep(0.75, 1.0, r.y) * 0.12;
        vec3 c = mix(pow(uDeep, vec3(1.0 / 2.2)), sky, 0.28 + 0.6 * fr) + vec3(1.0, 0.98, 0.92) * glint + sky * band;
        c = mix(c, vec3(0.62, 0.66, 0.62), uShallow * 0.4);
        float a = clamp(uA + fr * 0.12 + glint, 0.0, 1.0);
        gl_FragColor = vec4(c, a); ${OUT} }`,
  });
}
/** the court's under-floor slabs (the soreg stage's stacked step slabs reach under the women's court, half an amah apart):
 *  unseen until the basin is cut, where they would close the cut. The stage's mesh gets its own copy of its material that
 *  leaves out what lies under the court floor inside the chamber; the original is kept on the mesh (userData.h120mat). */
export function carveUnder(X) {
  try {
    const st = X.scene && X.scene.getObjectByName('stage-sorag'); if (!st) return 0;
    let n = 0;
    st.traverse((o) => {
      if (!o.isMesh || o.userData.h120mat || !o.material || Array.isArray(o.material)) return;
      const m = o.material.clone(); o.userData.h120mat = o.material;
      const C = CHAMBER;
      m.onBeforeCompile = (sh) => {
        sh.vertexShader = 'varying vec3 vH120W;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  vH120W = (modelMatrix * vec4(transformed, 1.0)).xyz;');
        sh.fragmentShader = 'varying vec3 vH120W;\n' + sh.fragmentShader.replace('void main() {', `void main() {\n  if (vH120W.y < ${(H120.FLOOR - 0.03).toFixed(3)} && vH120W.x > ${C.x0.toFixed(2)} && vH120W.x < ${C.x1.toFixed(2)} && vH120W.z > ${C.z0.toFixed(2)} && vH120W.z < ${C.z1.toFixed(2)}) discard;`);
      };
      m.customProgramCacheKey = () => 'h120carve';
      o.material = m; n++;
    });
    return n;
  } catch (e) { return 0; }
}
/** the basin's water: a surface over the deep part and the steps (x0…stair), its level y; the plaster under it darkened */
export function basinWater(X) {
  const T = X.THREE, K = MIK, g = new T.Group();
  const mat = surfaceMat(X, { deep: '#1E4954', alpha: 0.8 });
  const surf = new T.Mesh(new T.PlaneGeometry(K.stair - K.x0 - 0.02, K.z1 - K.z0 - 0.02, 1, 1), mat); surf.rotation.x = -Math.PI / 2; surf.renderOrder = 5; g.add(surf);
  // the wet plaster: the inside of the cut, darker up to the water (seen through it and at its edge)
  const wet = new T.Mesh(new T.BoxGeometry(K.stair - K.x0 - 0.008, 1, K.z1 - K.z0 - 0.008), new T.MeshBasicMaterial({ color: 0x2C2A22, transparent: true, opacity: 0.32, depthWrite: false, side: T.BackSide }));
  wet.renderOrder = 3; g.add(wet);
  const cx = (K.x0 + K.stair) / 2, cz = (K.z0 + K.z1) / 2;
  let h = -1;
  const api = {
    g, surf, mat,
    /** the water h amot over the bottom */
    set(hh) {
      if (Math.abs(hh - h) < 1e-4) return; h = hh;
      const on = h > 0.004; surf.visible = on; wet.visible = on;
      surf.position.set(cx, K.bottom + h, cz); wet.scale.set(1, Math.max(0.01, h), 1); wet.position.set(cx, K.bottom + h / 2, cz);
      // (the steps rise out of the water: the surface only over the water — the plane over the stair is hidden by the steps' tops)
    },
    drop(x, z, k) { mat.uniforms.uDrop.value.set(x, z, k); },
    get h() { return h; },
  };
  return api;
}
/** a puddle where the water stands: a rough disc on the floor (r grows), the surface material */
export function puddle(X, x, z, dirX = 1, dirZ = 0) {
  const T = X.THREE, n = 22, pos = [0, 0, 0], idx = [];
  for (let i = 0; i <= n; i++) { const a = (i / n) * Math.PI * 2, k = 1 + 0.18 * Math.sin(a * 3 + x) + 0.1 * Math.sin(a * 5 + z); pos.push(Math.cos(a) * k, 0, Math.sin(a) * k); if (i) idx.push(0, i, i + 1); }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new T.Float32BufferAttribute(new Array((n + 2) * 2).fill(0), 2)); g.setIndex(idx);
  const m = new T.Mesh(g, surfaceMat(X, { deep: '#3B5A5C', alpha: 0.78, shallow: 0.6 })); m.renderOrder = 4; m.frustumCulled = false;
  m.position.set(x, floorY(x, z) + 0.016, z); m.rotation.y = -Math.atan2(dirZ, dirX);
  let r = 0; m.scale.set(0.001, 1, 0.001);
  return { mesh: m, set(rr) { r = rr; m.scale.set(Math.max(0.001, r * 1.35), 1, Math.max(0.001, r * 0.8)); m.visible = r > 0.01; }, get r() { return r; } };
}
/** the hollow's pool: a disc the plug holds (r: 0…1.15), lower as it drains */
export function pool(X, x, z) {
  const T = X.THREE, m = new T.Mesh(new T.CircleGeometry(1, 28), surfaceMat(X, { deep: '#244E58', alpha: 0.84 }));
  m.rotation.x = -Math.PI / 2; m.renderOrder = 4; const y0 = floorY(x, z);
  return { mesh: m, set(k) { const r = 1.15 * Math.max(0, k); m.visible = r > 0.02; m.scale.set(Math.max(0.01, r), Math.max(0.01, r), 1); m.position.set(x, y0 + 0.09 - 0.02 * (1 - k), z); } };   // (over the floor's slope across the hollow, lower as it drains)
}

/* ───────── a short shower into the roofless chamber (the hollow refilled): streaks falling, rings on the pool ───────── */
export function rain(X, cx, cz, R = 7) {
  const T = X.THREE, N = 260, pos = new Float32Array(N * 6), g = new T.BufferGeometry();
  g.setAttribute('position', new T.BufferAttribute(pos, 3));
  const m = new T.LineSegments(g, new T.LineBasicMaterial({ color: 0xF2F7FA, transparent: true, opacity: 0.8, depthWrite: false })); m.frustumCulled = false; m.renderOrder = 7;
  const seeds = Array.from({ length: N }, (_, i) => { const a = Math.sin(i * 12.9898) * 43758.5453, b = Math.sin(i * 78.233) * 12345.678, c = Math.sin(i * 39.425) * 9876.54; return [a - Math.floor(a), b - Math.floor(b), c - Math.floor(c)]; });
  let k = 0;
  return {
    mesh: m,
    set(kk) { k = kk; m.visible = k > 0.01; m.material.opacity = 0.8 * Math.min(1, k); },
    frame() {
      if (k <= 0.01) return; const t = U.t.value;
      for (let i = 0; i < N; i++) {
        const [a, b, c] = seeds[i], x = cx + (a - 0.5) * 2 * R, z = cz + (b - 0.5) * 2 * R, y0 = floorY(x, z), H = 14, y = y0 + ((c * H - t * 22) % H + H) % H;
        pos.set([x, y, z, x + 0.05, y + 1.3, z + 0.03], i * 6);
      }
      g.attributes.position.needsUpdate = true;
    },
  };
}
export { inChamber, F };
