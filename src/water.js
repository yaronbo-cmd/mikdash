/* ─────────────────────────────────────────────────────────────────────────────
 * water.js — world.water (wave 6, WATER agent): water that flows, and the altar's drainage shown with dignity.
 *   const water = createWater({ scene, camera, life, stages, avodah, hemi, sun })   (main.js `// ── water ──`)
 *   water.kiyor({ spigots: 0…12 | [i, …], flow: 0…1, ms }) → P   Ben Katin's twelve spigots (Yoma 3:10) open/close one by
 *       one; a number opens that many in a fixed order (east half first). kiyor() → { spigots, flow, open: [i…] }.
 *   water.wash(kohen | {x, z} | [x, z], { spigot, hold }) → P<bool>   hands and feet under a spigot (Tamid 1:4; Zevachim 19b).
 *       A world.avodah kohen walks there and bends (its own .wash()); a position gets the water only.
 *   water.pour('water' | 'wine' | 'shirayim', { corner: 'W' | 'S', from: {x,y,z}, to: {x,y,z}, ms }) → P
 *       the libations into the silver bowls at the SW horn (Sukkah 4:9); the rest of the blood on the yesod, a thin trickle
 *       into the two holes at the SW corner (Middot 3:2; Yoma 5:6) — never a spray or a pool.
 *   water.mukhni(down) → P   the wheel lowers the kiyor for the night / raises it at dawn (Yoma 3:10; Tamid 3:8)
 *   water.channel(on)        the amah under the courts to the Kidron (Middot 3:2; Yoma 5:6); its course: illustration
 *   water.waterMaterial({ color, opacity, flow: [dx, dz], scale }) → a material for any flat water in world units
 *   water.firstFlow({ hold }) → P   Phase A: the kiyor's twelve spigots flow for the first time
 *   water.onEvent(cb) → off   cb('water', { kind, x, y, z, spigot?, strength? }) — kinds: tap-open tap-close wash-start
 *       wash-splash wash-end pour-start pour-end mukhni-start mukhni-end channel
 *   water.update(dt) (inside life.update) · setEnabled(bool) · state · stats · fx (its meshes)
 * Drawing: TWO draw calls at most, both ShaderMaterials with lights: false (night never recompiles): the streams (camera-facing
 * tubes along ballistic arcs, computed in the vertex shader) and the "flats" (water surfaces, foam, ripples, films, grates,
 * droplets as stateless particles). No per-frame allocation; each area is culled by distance and the view frustum.
 * Every Promise resolves (simulation time, ended early by the wall clock, with a setTimeout backstop); nothing throws.
 * Sources (drafting aids for CONTENT, PROJECT.md §2.1): Tamid 1:4, 3:8; Yoma 3:10, 5:6; Middot 3:2–3; Sukkah 4:9;
 * Zevachim 19b; Pesachim 65b (the amah through the azara). Illustration (illus, ⚑): where the washing water drains, the
 * amah's course and grates, the outlet and the stream down the Kidron slope, the libation bowls' outflow.
 * ──────────────────────────────────────────────────────────────────────────── */
import * as THREE from 'three';
import * as PL from './places.js';
import { groundY } from './avodah3d.js';
import { BLOOD, amahTint, gameMin, nextDawn } from './avodah/works/blood.js';   // ── blooda25 ── (the thread's colour; the amah's hue by x)

const G = 20.4;                                   // gravity in amot/s² (9.81 m/s² ÷ 0.48 m)
const K = PL.KIYOR, KX = K.x, KZ = K.z;
// the outer tip of each of Ben Katin's spouts (temple.js buildKiyor: r 2.08, tilted 20° down, 0.62 long)
const SPIG = [];
for (let k = 0; k < 12; k++) {
  const a = k / 12 * Math.PI * 2 + Math.PI / 12, c = Math.cos(a), s = Math.sin(a);
  SPIG.push({ k, a, c, s, x: KX + c * 2.37, y: K.rim - 1.186, z: KZ + s * 2.37 });
}
const ORDER = [0, 11, 1, 10, 2, 9, 3, 8, 4, 7, 5, 6];   // east half first (the steps rise to the west)
const WASH_R = 3.3;                                     // where a kohen stands (avodah3d kohen().wash)
// the drain by the altar's SW corner, near the marble slab with the ring (Middot 3:3) — its place: illustration
const DRAIN = { x: -54.6, z: 17.2 };
// the amah's course under the courts, east to the Kidron (Middot 3:2; Yoma 5:6): grates at these x, along z = AMAH_Z
const AMAH_Z = 17.2, GRATES = [-54.6, -49.6, -26, -16, -4, 30, 70, 125, 190, 226];
const OUTLET = { x: 277, z: AMAH_Z };

const KIND = { SURF: 0, FOAM: 1, RIPPLE: 2, FILM: 3, DROP: 4, CHAN: 5, GRATE: 6, TRICKLE: 7, WET: 8 };

/* ───────── shaders ───────── */
const COMMON = /* glsl */`
uniform float uTime; uniform vec3 uSun, uSunC, uSky, uGnd, uLamp;
float h21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
// a gently moving water surface: the normal from a few directional waves (world xz, amot), drifting with the flow
vec3 waveN(vec2 xz, vec2 flow, float sc, float amp) {
  vec2 p = (xz - flow * uTime) * sc; vec2 g = vec2(0.0);
  g += vec2(0.8, 0.6) * cos(dot(p, vec2(0.8, 0.6)) * 3.1 + uTime * 1.6) * 0.5;
  g += vec2(-0.5, 0.86) * cos(dot(p, vec2(-0.5, 0.86)) * 4.9 + uTime * 2.2) * 0.33;
  g += vec2(0.2, -0.98) * cos(dot(p, vec2(0.2, -0.98)) * 8.3 - uTime * 2.9) * 0.22;
  g += vec2(vn(p * 2.3 + uTime * 0.4) - 0.5, vn(p * 2.3 - uTime * 0.37 + 7.1) - 0.5) * 0.5;
  return normalize(vec3(-g.x * amp, 1.0, -g.y * amp));
}
// water's look: the sky and the ground mirrored by Fresnel over a tinted body, the sun's glints on top
vec4 waterLook(vec3 W, vec3 N, vec3 deep, float op) {
  vec3 V = normalize(cameraPosition - W), L = normalize(uSun), R = reflect(-V, N);
  float F = 0.02 + 0.98 * pow(1.0 - max(dot(N, V), 0.0), 5.0);
  vec3 env = mix(uGnd * 0.55, uSky * 1.05, smoothstep(-0.25, 0.55, R.y)) + uLamp * (0.6 + 0.4 * smoothstep(0.2, -0.2, R.y));
  float rl = max(dot(R, L), 0.0);
  vec3 body = deep * (uSky * 0.5 + uSunC * 0.16 * max(L.y, 0.0));
  vec3 c = mix(body, env, F) + uSunC * (pow(rl, 220.0) * 5.0 + pow(rl, 28.0) * 0.12);
  return vec4(c, mix(op, 1.0, F));
}
`;
const STREAM_VS = /* glsl */`
uniform float uG;
attribute vec3 iO; attribute vec3 iV; attribute vec4 iP; attribute vec4 iC; attribute vec4 iX;
varying float vU, vS, vA, vK, vPh; varying vec3 vW, vSide, vCol;
${COMMON}
void main() {
  float s = position.x, t = mix(iP.x, iP.y, s);
  vec3 P = iO + iV * t + vec3(0.0, -0.5 * uG * t * t, 0.0);
  vec3 D = iV + vec3(0.0, -uG * t, 0.0);
  float sp = max(length(D), 0.05);
  vec3 dir = D / sp, toCam = normalize(cameraPosition - P), side = cross(dir, toCam);
  float sl = length(side); side = sl > 1e-4 ? side / sl : vec3(1.0, 0.0, 0.0);
  // it thins as it speeds up (the flux is kept), it wobbles; the free ends taper (the head falling, the tail after the tap closes)
  float ph = iC.w * 6.2832;
  float w = iP.z * sqrt(max(length(iV), 0.3) / max(sp, 0.3));
  w *= 1.0 + 0.16 * sin(t * 26.0 - uTime * 11.0 + ph) + 0.08 * sin(t * 57.0 - uTime * 23.0 + ph * 1.7);
  w *= mix(1.0, smoothstep(0.0, 0.3, s), iX.y) * mix(1.0, 0.45 + 0.55 * smoothstep(1.0, 0.75, s), iX.x);
  P += side * (position.y * w + 0.035 * t * sin(t * 14.0 - uTime * 8.0 + ph));
  vU = position.y; vS = t; vA = iP.w; vK = iX.w; vPh = ph; vW = P; vSide = side; vCol = iC.rgb;
  gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
}`;
const STREAM_FS = /* glsl */`
varying float vU, vS, vA, vK, vPh; varying vec3 vW, vSide, vCol;
${COMMON}
void main() {
  float x = vU, nz = sqrt(max(1.0 - x * x, 0.0));
  vec3 V = normalize(cameraPosition - vW), N = normalize(vSide * x + V * nz), L = normalize(uSun), R = reflect(-V, N);
  float fres = pow(1.0 - nz, 2.5);
  // streaks ride down with the water itself: the pattern is a function of the moment the water left the spout
  float e = uTime - vS;
  float str = 0.5 + 0.5 * sin(e * 31.0 + x * 2.6 + vPh) * sin(e * 12.7 - x * 1.9 + vPh * 2.3);
  float rl = max(dot(R, L), 0.0), spec = pow(rl, 70.0) * 2.2 + pow(rl, 12.0) * 0.12;
  vec3 env = mix(uGnd * 0.6, uSky * 1.05, smoothstep(-0.3, 0.6, R.y)) + uLamp;
  vec3 col; float a;
  if (vK < 0.5) {
    // clear water: a tinted, see-through core (the refraction), bright mirrored edges, a bright core line, glints
    vec3 body = vCol * (uSky * 0.42 + uSunC * 0.2 * max(dot(N, L), 0.0));
    col = mix(body, env, 0.2 + 0.7 * fres) + uSunC * spec;
    float core = exp(-pow((x + 0.28) / 0.2, 2.0));
    // air caught in the falling water: white flecks riding down, more of them lower down where the stream breaks up
    float aer = smoothstep(0.62, 0.92, vn(vec2(e * 23.0 + vPh, x * 2.2 + vPh * 3.0))) * (0.35 + 0.65 * smoothstep(0.05, 0.45, vS));
    col += (uSky * 0.55 + uSunC * 0.22) * core * (0.55 + 0.45 * str) + (uSky * 0.9 + uSunC * 0.3) * aer * 0.55;
    a = 0.44 + 0.46 * fres + 0.3 * core + 0.14 * str + 0.3 * aer;
  } else {
    // wine or the rest of the blood: a thin, dark, glossy thread (never a spray)
    col = vCol * (uSky * 0.55 + uSunC * 0.3 * max(dot(N, L), 0.0)) + uSunC * spec * 0.5 + env * fres * 0.18;
    a = 0.9;
  }
  a *= vA * smoothstep(1.0, 0.72, abs(x));
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
const FLAT_VS = /* glsl */`
uniform float uG;
attribute vec4 iC; attribute vec4 iU; attribute vec4 iV; attribute vec4 iT;
varying vec2 vXY; varying vec3 vW, vN; varying float vK, vSeed, vP, vUl; varying vec4 vT;
${COMMON}
void main() {
  float k = iC.w; vec3 P;
  if (abs(k - 4.0) < 0.5) {
    // a droplet of a splash: a stateless particle, reborn every life with a new random direction
    float life = iU.z, c0 = (uTime + iV.w * 13.7) / life, cyc = floor(c0), ph = fract(c0);
    float h1 = h21(vec2(cyc, iV.w * 91.7)), h2 = h21(vec2(iV.w * 37.1, cyc + 3.3)), h3 = h21(vec2(cyc * 1.7, iV.w + 11.0));
    float ang = h1 * 6.2832, spd = iU.x * (0.35 + 0.65 * h2), up = iU.y * (0.45 + 0.55 * h3), tt = ph * life;
    vec3 c = iC.xyz + vec3(cos(ang) * spd * tt, up * tt - 0.5 * uG * tt * tt, sin(ang) * spd * tt);
    vec3 rt = vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]), upv = vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]);
    P = c + (rt * position.x + upv * position.y) * iV.x * (1.0 - 0.45 * ph);
    vP = ph; vN = vec3(0.0, 1.0, 0.0); vUl = 1.0;
  } else {
    P = iC.xyz + iU.xyz * position.x + iV.xyz * position.y;
    vP = iU.w; vN = normalize(cross(iV.xyz, iU.xyz)); vUl = length(iU.xyz);
  }
  vXY = position.xy; vW = P; vK = k; vSeed = iV.w; vT = iT;
  gl_Position = projectionMatrix * viewMatrix * vec4(P, 1.0);
}`;
const FLAT_FS = /* glsl */`
varying vec2 vXY; varying vec3 vW, vN; varying float vK, vSeed, vP, vUl; varying vec4 vT;
${COMMON}
void main() {
  float k = vK, r = length(vXY); vec3 col = vec3(0.0); float a = 0.0;
  vec3 L = normalize(uSun), lit = uSky * 0.55 + uSunC * 0.3 * max(L.y, 0.0);
  if (k < 0.5) {                                   // a basin's surface (a disc), moving gently
    vec4 w = waterLook(vW, waveN(vW.xz, vec2(0.0), 2.2, 0.16), vT.rgb, 0.82);
    col = w.rgb; a = w.a * smoothstep(1.0, 0.97, r);
  } else if (k < 1.5) {                            // foam where a stream lands
    vec2 q = vXY * 2.6 + vSeed * 17.0;
    float n = vn(q + vec2(uTime * 1.9, -uTime * 1.3)) * 0.6 + vn(q * 2.3 - uTime * 2.7) * 0.4;
    float m = smoothstep(1.0, 0.3, r + (n - 0.5) * 0.55), b = smoothstep(0.5, 0.78, n);
    col = lit * (1.6 + 0.6 * b); a = m * (0.45 + 0.5 * b) * vT.a;
  } else if (k < 2.5) {                            // ripple rings on water
    float p1 = fract(uTime * 1.4 + vSeed), p2 = fract(uTime * 1.4 + vSeed + 0.5);
    float g = exp(-pow((r - p1) / 0.07, 2.0)) * (1.0 - p1) + exp(-pow((r - p2) / 0.07, 2.0)) * (1.0 - p2);
    col = uSky * 1.0 + uSunC * 0.25; a = g * 0.55 * vT.a;
  } else if (k < 3.5 || abs(k - 7.0) < 0.5) {      // a thin film running along U (3: water; 7: a coloured trickle)
    float s = vXY.x * vUl - uTime * vP;
    float across = abs(vXY.y), edge = smoothstep(1.0, 0.45 + 0.3 * vn(vec2(vXY.x * vUl * 1.7, vSeed * 9.0)), across);
    float st = vn(vec2(s * 2.4, vXY.y * 2.5 + vSeed * 7.0)), st2 = vn(vec2(s * 7.0, vXY.y * 6.0 + 3.0));
    vec3 N = normalize(vN + vec3(st - 0.5, 0.0, st2 - 0.5) * 0.35);
    if (k < 3.5) {
      // wet stone (darker) under bright streaks of the sky that run with the water
      vec4 w = waterLook(vW, N, vT.rgb, 0.0); float vert = 1.0 - abs(vN.y);
      float hl = smoothstep(0.52, 0.86, st) * 0.55 + smoothstep(0.68, 0.92, st2) * 0.65;
      col = mix(vec3(0.05, 0.045, 0.04) * lit, w.rgb * 0.6 + (uSky * 0.95 + uSunC * 0.25) * hl, clamp(hl * 1.5 + w.a * 0.4, 0.0, 1.0));
      a = mix(0.24 + 0.5 * hl, 0.1 + 0.6 * hl, vert); }
    else { vec3 V = normalize(cameraPosition - vW); float rl = max(dot(reflect(-V, N), L), 0.0);
      col = vT.rgb * lit * (0.8 + 0.3 * st) + uSunC * vT.rgb * pow(rl, 30.0) * 0.5; a = 0.95; }
    a *= edge * vT.a * smoothstep(1.0, 0.9, abs(vXY.x));
  } else if (k < 4.5) {                            // a droplet
    col = uSky * 1.1 + uSunC * 0.5; a = smoothstep(1.0, 0.35, r) * 0.85 * (1.0 - 0.7 * vP) * vT.a;
  } else if (k < 5.5) {                            // running water in a channel (flow along U), darker at its walls
    vec3 N = waveN(vW.xz, vec2(0.0), 3.0, 0.22);
    vec4 w = waterLook(vW, N, vT.rgb, 0.9);
    float s = vXY.x * vUl - uTime * vP, st = vn(vec2(s * 3.0, vXY.y * 3.0 + vSeed * 5.0));
    col = w.rgb * (0.55 + 0.45 * smoothstep(1.0, 0.4, abs(vXY.y))) + uSky * 0.2 * smoothstep(0.72, 0.9, st);
    a = w.a * smoothstep(1.0, 0.9, abs(vXY.y)) * smoothstep(1.0, 0.95, abs(vXY.x)) * vT.a;
  } else if (k < 6.5) {                            // a bronze grate over the channel; the water runs below it (vP: flowing)
    vec2 q = vXY * 0.5 + 0.5;
    float frame = step(0.86, max(abs(vXY.x), abs(vXY.y))), bar = step(0.74, fract(q.y * 5.0 + 0.13));
    if (frame + bar > 0.5) { col = vec3(0.30, 0.20, 0.11) * lit * (0.8 + 0.4 * vn(vXY * 9.0)) + uSunC * 0.05; }
    else {
      float s = vXY.x * vUl - uTime * 1.6, st = vn(vec2(s * 3.0, vXY.y * 4.0 + vSeed * 3.0));
      vec4 w = waterLook(vW - vec3(0.0, 0.5, 0.0), waveN(vW.xz, vec2(1.6, 0.0), 3.0, 0.3), vT.rgb, 0.95);
      col = mix(vec3(0.012, 0.011, 0.01), w.rgb * 0.5 + uSky * 0.12 * smoothstep(0.7, 0.9, st), vP);
    }
    a = vT.a;
  } else {                                         // a wet patch on the paving: darker, a little glossy, drying at its edge
    float n = vn(vXY * 2.2 + vSeed * 11.0);
    float m = smoothstep(1.0, 0.55, r + (n - 0.5) * 0.6);
    col = vec3(0.03, 0.028, 0.025) * lit + uSky * 0.06; a = m * 0.35 * vT.a;
  }
  gl_FragColor = vec4(col, a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
// WORLD's pools (Siloam, Bethesda): any mesh, world units, one shared program
const POOL_VS = /* glsl */`
#include <fog_pars_vertex>
varying vec3 vW;
void main() { vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; vec4 mvPosition = viewMatrix * w; gl_Position = projectionMatrix * mvPosition;
  #include <fog_vertex>
}`;
const POOL_FS = /* glsl */`
uniform vec3 uDeep; uniform float uOp, uScale; uniform vec2 uFlow;
varying vec3 vW;
#include <fog_pars_fragment>
${COMMON}
void main() { vec4 w = waterLook(vW, waveN(vW.xz, uFlow, 0.9 / max(uScale, 0.05), 0.2), uDeep, uOp); gl_FragColor = w;
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
}`;

/* ───────── the layer ───────── */
export function createWater(ctx = {}) {
  const { scene, camera, stages = null, life = null } = ctx;
  let avodah = ctx.avodah || null, hemi = ctx.hemi || null, sun = ctx.sun || null;
  if (scene && (!hemi || !sun)) scene.traverse((o) => { if (!hemi && o.isHemisphereLight) hemi = o; if (!sun && o.isDirectionalLight) sun = o; });
  const warn = (e) => { if (typeof console !== 'undefined') console.warn('[water]', e); };
  const built = (id) => { try { return !stages || typeof stages.isDone !== 'function' || !!stages.isDone(id); } catch (e) { return true; } };
  const ground = (x, z) => {
    const dx = Math.abs(x - KX), dz = Math.abs(z - KZ);
    if (dx <= 1.45 && dz <= 2.4) return dx < 1.05 && dz < 1.9 ? 17.2 : 19.2;   // the pit's curb / the water in its shaft
    return (ctx.ground || groundY)(x, z);
  };

  const U = {
    uTime: { value: 0 }, uG: { value: G },
    uSun: { value: new THREE.Vector3(0.4, 0.8, 0.3) }, uSunC: { value: new THREE.Color(2.4, 2.3, 2.1) },
    uSky: { value: new THREE.Color(0.7, 0.8, 0.9) }, uGnd: { value: new THREE.Color(0.5, 0.45, 0.38) }, uLamp: { value: new THREE.Color(0, 0, 0) },
  };
  const lin = (hex) => new THREE.Color(hex);
  const C_WATER = lin('#9CC4D2'), C_WINE = lin('#5E1022'), C_BLOOD = lin(BLOOD.wet), C_DEEP = lin('#2F5561'), C_BASIN = lin('#3E6E78');
  const C_CHAN = lin('#27454C');

  /* streams: one instanced strip */
  const MAXS = 32, SEG = 14;
  const sGeo = new THREE.InstancedBufferGeometry();
  { const pos = [], idx = [];
    for (let i = 0; i <= SEG; i++) pos.push(i / SEG, -1, 0, i / SEG, 1, 0);
    for (let i = 0; i < SEG; i++) { const a = i * 2; idx.push(a, a + 1, a + 2, a + 2, a + 1, a + 3); }
    sGeo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); sGeo.setIndex(idx); }
  const sAttr = {};
  for (const [n, sz] of [['iO', 3], ['iV', 3], ['iP', 4], ['iC', 4], ['iX', 4]]) {
    const at = new THREE.InstancedBufferAttribute(new Float32Array(MAXS * sz), sz); at.setUsage(THREE.DynamicDrawUsage);
    sGeo.setAttribute(n, at); sAttr[n] = at;
  }
  sGeo.instanceCount = 0;
  const sMat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: STREAM_VS, fragmentShader: STREAM_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  sMat.name = 'water-streams';
  const sMesh = new THREE.Mesh(sGeo, sMat); sMesh.frustumCulled = false; sMesh.renderOrder = 6; sMesh.name = 'water-streams';

  /* flats: one instanced quad */
  const MAXF = 400;
  const fGeo = new THREE.InstancedBufferGeometry();
  fGeo.setAttribute('position', new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0], 3)); fGeo.setIndex([0, 1, 2, 2, 1, 3]);
  const fAttr = {};
  for (const n of ['iC', 'iU', 'iV', 'iT']) {
    const at = new THREE.InstancedBufferAttribute(new Float32Array(MAXF * 4), 4); at.setUsage(THREE.DynamicDrawUsage);
    fGeo.setAttribute(n, at); fAttr[n] = at;
  }
  fGeo.instanceCount = 0;
  const fMat = new THREE.ShaderMaterial({ uniforms: U, vertexShader: FLAT_VS, fragmentShader: FLAT_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide });
  fMat.name = 'water-flats';
  const fMesh = new THREE.Mesh(fGeo, fMat); fMesh.frustumCulled = false; fMesh.renderOrder = 5; fMesh.name = 'water-flats';
  if (scene) { scene.add(fMesh); scene.add(sMesh); }
  if (life && Array.isArray(life.fx)) life.fx.push(fMesh, sMesh);

  let nF = 0;
  const pushF = (kind, cx, cy, cz, ux, uy, uz, p, vx, vy, vz, seed, col, alpha) => {
    if (nF >= MAXF) return;
    const i = nF++ * 4, C = fAttr.iC.array, Uu = fAttr.iU.array, Vv = fAttr.iV.array, T = fAttr.iT.array;
    C[i] = cx; C[i + 1] = cy; C[i + 2] = cz; C[i + 3] = kind;
    Uu[i] = ux; Uu[i + 1] = uy; Uu[i + 2] = uz; Uu[i + 3] = p;
    Vv[i] = vx; Vv[i + 1] = vy; Vv[i + 2] = vz; Vv[i + 3] = seed;
    T[i] = col.r; T[i + 1] = col.g; T[i + 2] = col.b; T[i + 3] = alpha;
  };
  const disc = (kind, x, y, z, r, seed, col, alpha, p = 0) => pushF(kind, x, y, z, r, 0, 0, p, 0, 0, r, seed, col, alpha);
  // a flat strip from (x0,y0,z0) to (x1,y1,z1), half-width hw, flowing at `speed` toward the second point
  const strip = (kind, x0, y0, z0, x1, y1, z1, hw, speed, seed, col, alpha, vertical = false) => {
    const dx = x1 - x0, dy = y1 - y0, dz = z1 - z0, hl = Math.hypot(dx, dy, dz) / 2 || 1e-3;
    let vx, vy, vz;
    if (vertical) { const h = Math.hypot(dx, dz) > 1e-4 ? 1 : 0; vx = h ? -dz : 1; vy = 0; vz = h ? dx : 0; const l = Math.hypot(vx, vz) || 1; vx *= hw / l; vz *= hw / l; }
    else { const l = Math.hypot(dx, dz) || 1; vx = -dz / l * hw; vy = 0; vz = dx / l * hw; if (vx * dz - vz * dx > 0) { vx = -vx; vz = -vz; } }
    pushF(kind, (x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2, dx / 2, dy / 2, dz / 2, speed, vx, vy, vz, seed, col, alpha);
    return hl;
  };
  const drops = (x, y, z, n, strength, seed) => {
    for (let j = 0; j < n; j++) pushF(KIND.DROP, x, y, z, 0.9 + 0.5 * strength, 1.5 + 1.1 * strength, 0.42 + 0.1 * (j % 3), 0, 0.045 + 0.02 * strength, 0, 0, seed + j * 0.137, C_WATER, 1);
  };

  /* ───────── streams (CPU side: a few numbers each) ───────── */
  const streams = [];
  for (let i = 0; i < MAXS; i++) streams.push({ live: false, open: false, O: new THREE.Vector3(), V: new THREE.Vector3(), age: 0, cage: 0, tl: 0.5,
    w: 0.05, a: 1, col: C_WATER, kind: 0, seed: i * 0.618 % 1, aim: null, grp: 'kiyor', flow: 1, splash: true, land: new THREE.Vector3(), onWater: false });
  const take = (grp) => { const s = streams.find((q) => !q.live); if (!s) return null; s.live = true; s.open = true; s.age = 0; s.cage = 0; s.flow = 1; s.w = 0.05; s.grp = grp; s.aim = null; s.splash = true; s.kind = 0; s.col = C_WATER; s.a = 1; s.onWater = false; return s; };
  const close = (s) => { if (s && s.live && s.open) { s.open = false; s.cage = 0; } };
  // aim a stream from its origin to a target point, leaving its spout at a fixed downward slope k
  const aimAt = (s, tx, ty, tz, k = 0.365) => {
    const dx = tx - s.O.x, dz = tz - s.O.z, d = Math.max(0.02, Math.hypot(dx, dz)), h = s.O.y - ty;
    const den = Math.max(0.06, h - k * d), vh = d * Math.sqrt(G / (2 * den));
    s.V.set(dx / d * vh, -k * vh, dz / d * vh); s.tl = d / vh; s.land.set(tx, ty, tz);
  };
  // the time a stream falls from its origin to the height y
  const fallTime = (s, y) => { const vy = s.V.y, h = s.O.y - y; return Math.max(0.02, (vy + Math.sqrt(Math.max(0, vy * vy + 2 * G * h))) / G); };

  /* ───────── the kiyor ───────── */
  const spig = SPIG.map((p) => ({ ...p, s0: p.s, s: null, flow: 0, wet: 0, target: null }));
  const kiyorSt = { flow: 1, n: 0, down: false, lower: 0, moving: false, seq: 0, twelve: false };
  function spigotAim(sp) {
    const s = sp.s; if (!s) return;
    s.O.set(sp.x, sp.y - kiyorSt.lower, sp.z);
    if (sp.target) {
      const t = sp.target(); if (t) { aimAt(s, t.x, t.y, t.z); s.onWater = false; return; }
    }
    const r = 2.37 + 0.35 + 0.6 * sp.flow, x = KX + sp.c * r, z = KZ + sp.s0 * r;
    aimAt(s, x, ground(x, z) + 0.02, z);
    s.onWater = false;
  }
  function openSpigot(sp, flow = 1) {
    if (kiyorSt.down || kiyorSt.moving) return;   // (lowered for the night: its spigots stay shut)
    sp.flow = Math.max(0.05, Math.min(1, flow));
    if (sp.s && sp.s.open) { sp.s.flow = sp.flow; sp.s.w = 0.042 + 0.03 * sp.flow; return; }
    const s = take('kiyor'); if (!s) return;
    s.flow = sp.flow; s.w = 0.042 + 0.03 * sp.flow; s.seed = sp.k * 0.0833 + 0.01; sp.s = s;
    spigotAim(sp);
    emit('tap-open', { x: sp.x, y: sp.y, z: sp.z, spigot: sp.k, strength: sp.flow });
  }
  function closeSpigot(sp) {
    if (!sp.s || !sp.s.open) return;
    close(sp.s); sp.target = null;
    emit('tap-close', { x: sp.x, y: sp.y, z: sp.z, spigot: sp.k });
  }
  const openList = () => spig.filter((sp) => sp.s && sp.s.open).map((sp) => sp.k);

  const kiyorState = () => ({ spigots: openList().length, flow: kiyorSt.flow, open: openList(), washing: spig.filter((sp) => sp.s && sp.s.open && sp.target).length /* ── fix26 ── (a washer's own spout, open while he washes) ── /fix26 ── */ });
  const kiyor = (opts) => (opts === undefined ? kiyorState() : kiyorSet(opts));
  const kiyorSet = safe(async (opts) => {
    const o = typeof opts === 'number' ? { spigots: opts } : (opts || {});
    const flow = o.flow === undefined ? kiyorSt.flow : Math.max(0, Math.min(1, +o.flow || 0));
    let want;
    if (Array.isArray(o.spigots)) want = o.spigots.map((i) => ((i | 0) % 12 + 12) % 12);
    else { const n = o.spigots === undefined ? (flow > 0 ? 12 : 0) : Math.max(0, Math.min(12, o.spigots | 0)); want = ORDER.slice(0, flow > 0 ? n : 0); }
    kiyorSt.flow = flow || kiyorSt.flow;
    const set = new Set(want), ms = o.ms === undefined ? 1200 : Math.max(0, +o.ms || 0);
    for (const sp of spig) sp.want = set.has(sp.k);   // ── fix26 ── (a washer at a spigot the kiyor's work closed must not re-open it when he is done) ── /fix26 ──
    const toClose = spig.filter((sp) => sp.s && sp.s.open && !set.has(sp.k) && !sp.target);
    const toOpen = want.map((i) => spig[i]).filter((sp) => !(sp.s && sp.s.open) || Math.abs(sp.flow - flow) > 0.01);
    const steps = toClose.length + toOpen.length, dt = steps > 1 ? ms / 1000 / (steps - 1) : 0;
    for (const sp of toClose) { closeSpigot(sp); if (dt) await wait(dt); }
    for (const sp of toOpen) { openSpigot(sp, flow); if (dt) await wait(dt); }
    await wait(0.6);
    kiyorSt.n = openList().length;
    return true;
  });

  /* ───────── washing: hands and feet under a spigot ───────── */
  const HANDL = new THREE.Vector3();
  const actorsOf = () => (avodah && avodah._actors) || null;
  // one hand of a kohen (side 1 = left, −1 = right), wherever the rig puts it (actors.handWorld), else a guess in front of him
  function handOf(a, side, out) {
    const A = actorsOf();
    if (A && typeof A.handWorld === 'function') {
      try { A.handWorld(a, side, out); if (Number.isFinite(out.y) && Number.isFinite(out.x)) return out; } catch (e) { /* fall back */ }
    }
    const fx = Math.sin(a.yaw || 0), fz = Math.cos(a.yaw || 0);
    return out.set(a.x + fx * 0.45 - fz * side * 0.2, (a.y || ground(a.x, a.z)) + 0.4, a.z + fz * 0.45 + fx * side * 0.2);
  }
  const nearestSpigot = (x, z) => { let b = spig[0], bd = 1e9; for (const sp of spig) { const d = Math.hypot(sp.x - x, sp.z - z); if (d < bd) { bd = d; b = sp; } } return b; };
  const washSpot = (i) => { const sp = spig[((i | 0) % 12 + 12) % 12]; return { x: KX + sp.c * WASH_R, z: KZ + sp.s0 * WASH_R, face: [KX, KZ], spigot: sp.k }; };
  // the washings in progress: the stream is aimed at one hand, then the other (both hands on the feet, Zevachim 19b as
  // CONTENT verifies it), a little in front of the body; the water runs off the hands onto the feet (a drip stream)
  const washes = [];
  function washAim(W, dt) {
    if (W.a) {
      const side = Math.floor((T - W.t0) / 1.1) % 2 ? 1 : -1;
      handOf(W.a, side, HANDL);
      const fx = Math.sin(W.a.yaw || 0), fz = Math.cos(W.a.yaw || 0);
      HANDL.x += fx * 0.1; HANDL.z += fz * 0.1; HANDL.y += 0.04;
    } else HANDL.copy(W.fixed);
    if (!W.init) { W.pt.copy(HANDL); W.init = true; } else W.pt.lerp(HANDL, Math.min(1, dt * 7));
    const d = W.drip;
    if (d && d.live) {
      d.O.set(W.pt.x, W.pt.y - 0.04, W.pt.z);
      const fx = W.a ? Math.sin(W.a.yaw || 0) : 0, fz = W.a ? Math.cos(W.a.yaw || 0) : 0;
      d.V.set(-fx * 0.3, -0.25, -fz * 0.3);
      const gy = ground(W.pt.x, W.pt.z) + 0.02; d.tl = fallTime(d, gy);
      d.land.set(d.O.x + d.V.x * d.tl, gy, d.O.z + d.V.z * d.tl);
    }
  }
  // the water part of the washing: the spigot opens, its stream falls on the hands, runs off over the feet onto the
  // paving, then it closes
  const washAt = safe(async (who, i, opts = {}) => {
    const sp = spig[((i | 0) % 12 + 12) % 12], hold = opts.hold === undefined ? 2.6 : Math.max(0.4, +opts.hold || 0);
    const a0 = who && who._a ? who._a : who;
    const isActor = !!(a0 && typeof a0 === 'object' && 'x' in a0 && 'z' in a0 && ('yaw' in a0 || 'alive' in a0));
    const W = { a: isActor ? a0 : null, t0: T, pt: new THREE.Vector3(), fixed: new THREE.Vector3(), init: false, drip: null, sp };
    if (!isActor) { const p = Array.isArray(who) ? { x: who[0], z: who[1] } : who || washSpot(i); W.fixed.set(p.x, ground(p.x, p.z) + 0.55, p.z); }
    // (lowered for the night: the wheel raises it first — "the sound of the wood of Ben Katin's mukhni", Tamid 1:4)
    if (kiyorSt.down) await mukhni(false, { sec: 3 });
    for (let n = 0; kiyorSt.moving && n < 80; n++) await wait(0.1);
    washAim(W, 1);
    washes.push(W);
    const was = sp.s && sp.s.open ? sp.flow : 0;   // (a spigot already running keeps running after the washing)
    sp.target = () => W.pt;
    openSpigot(sp, opts.flow || 0.8);
    emit('wash-start', { x: W.pt.x, y: W.pt.y, z: W.pt.z, spigot: sp.k });
    await wait(0.35);
    const d = take('kiyor');
    if (d) { d.w = 0.02; d.a = 0.85; d.seed = sp.k * 0.0833 + 0.5; d.splash = true; d.flow = 0.6; W.drip = d; washAim(W, 0); }
    emit('wash-splash', { x: W.pt.x, y: W.pt.y, z: W.pt.z, spigot: sp.k, strength: sp.flow });
    if (typeof opts.until === 'function') { for (let t = 0; t < hold && !opts.until(); t += 0.1) await wait(0.1); } else await wait(hold);
    if (was && sp.want !== false) { sp.target = null; openSpigot(sp, was); } else closeSpigot(sp);   // ── fix26 ── (sp.want: the last kiyor() call's wish) ── /fix26 ──
    close(W.drip);
    await wait(0.45);
    washes.splice(washes.indexOf(W), 1);
    emit('wash-end', { x: W.pt.x, y: W.pt.y, z: W.pt.z, spigot: sp.k });
    return true;
  });
  const wash = safe(async (who, opts = {}) => {
    if (who === 'twelve' || who === 'all') return washTogether(opts);
    if (who && typeof who.wash === 'function' && who._a) return who.wash(opts);   // a kohen: he walks there and bends (avodah3d)
    let p = who;
    if (Array.isArray(p)) p = { x: p[0], z: p[1] };
    if (!p || typeof p.x !== 'number') p = washSpot(opts.spigot || 0);
    const sp = opts.spigot !== undefined ? spig[((opts.spigot | 0) % 12 + 12) % 12] : nearestSpigot(p.x, p.z);
    return washAt(p, sp.k, opts);
  });
  // Phase B's kiddush (the player's own washing): approach(kohen, i) → P steps him to spigot i and turns him to the kiyor;
  // hold(kohen, i, on) → P: while on, he is bent and spigot i pours on his hands and feet; off → it closes, he straightens
  // (at most 20 s). kohen = a world.avodah handle; without one, the water falls at that spigot's place.
  const held = [];
  const kohenOf = (who) => (who && who._a && typeof who.pose === 'function' ? who : null);
  const approach = safe(async (who, i, maxSec = 1.6) => {
    const h = kohenOf(who), p = washSpot(i); if (!h) return false;
    const a = h._a;
    if (Math.hypot(a.x - p.x, a.z - p.z) > 0.35) await h.walkTo([p.x, p.z], maxSec > 0 ? { maxSec } : {});
    await h.face([KX, KZ]);
    return true;
  });
  const hold = safe(async (who, i, on = true) => {
    const k = ((i | 0) % 12 + 12) % 12, h = kohenOf(who);
    if (!on) { if (held[k]) held[k].on = false; return true; }
    if (held[k] && held[k].on) return true;
    const H = { on: true }; held[k] = H;
    if (h) { await approach(h, k); if (!H.on) return true; h.pose('wash'); await wait(0.4); }
    await washAt(h || washSpot(k), k, { hold: 20, flow: 0.85, until: () => !H.on });
    if (h && held[k] === H) h.pose('stand');
    return true;
  });

  /* ───────── the altar: the libations and the rest of the blood ───────── */
  const altarBusy = { water: false, wine: false };
  const bowlLevel = { water: 0, wine: 0 }, drainGlow = { water: 0, wine: 0 };
  const bowlAt = { water: new THREE.Vector3(...PL.LIBATION_BOWLS.water), wine: new THREE.Vector3(...PL.LIBATION_BOWLS.wine) };
  const bowlPos = { water: bowlAt.water.clone(), wine: bowlAt.wine.clone() };
  const trickles = [];   // { pts: [[x,y,z]…], hw, col, t, life, grow }
  const pour = safe(async (kind, opts = {}) => {
    const k = String(kind || '').toLowerCase();
    if (k === 'shirayim' || k === 'blood' || k === 'shirayim-s' || k === 'shirayim-w') return shirayim(opts, k);
    const wine = k === 'wine', key = wine ? 'wine' : 'water';
    const bowl = bowlPos[key].copy(opts.to ? opts.to : bowlAt[key]);
    const from = opts.from ? new THREE.Vector3(opts.from.x, opts.from.y, opts.from.z) : bowl.clone().add(new THREE.Vector3(0.25, 1.05, 0.5));
    const ms = opts.ms === undefined ? 2600 : Math.max(300, +opts.ms);
    altarBusy[key] = true;
    emit('pour-start', { x: bowl.x, y: bowl.y, z: bowl.z, what: key });
    const s = take('altar');
    if (s) {
      s.O.copy(from); s.kind = wine ? 1 : 0; s.col = wine ? C_WINE : C_WATER; s.w = wine ? 0.024 : 0.028; s.seed = wine ? 0.71 : 0.29; s.splash = !wine;
      s.aim = () => aimAt(s, bowl.x, bowl.y + 0.22, bowl.z, 0.9);
      s.aim();
    }
    const t0 = ms / 1000;
    for (let t = 0; t < t0; t += 0.1) { bowlLevel[key] = Math.min(1, bowlLevel[key] + 0.1 / t0 * 1.3); await wait(0.1); }
    close(s);
    // both bowls empty together (one hole wide, one narrow: Sukkah 4:9) — down through the altar into the shitin
    const out = take('altar');
    if (out) {
      out.O.set(bowl.x, bowl.y + 0.02, bowl.z); out.kind = wine ? 1 : 0; out.col = wine ? C_WINE : C_WATER; out.w = wine ? 0.012 : 0.016; out.splash = false; out.seed = 0.4;
      out.V.set(0, -0.3, 0); out.tl = 0.06; out.land.set(bowl.x, bowl.y - 0.05, bowl.z);
    }
    for (let t = 0; t < 2.2; t += 0.1) { bowlLevel[key] = Math.max(0, bowlLevel[key] - 0.1 / 2.2); drainGlow[key] = Math.min(1, t * 2) * Math.min(1, (2.2 - t) * 2); await wait(0.1); }
    drainGlow[key] = 0;
    close(out); bowlLevel[key] = 0; altarBusy[key] = false;
    chanPulse = Math.max(chanPulse, 1);
    emit('pour-end', { x: bowl.x, y: bowl.y, z: bowl.z, what: key });
    return true;
  });
  // the rest of the blood poured on the yesod runs, a thin dark trickle, into the two holes at the SW corner (Middot 3:2)
  const HOLES = PL.LIBATION_BOWLS.holes;
  // where the kohen stands to pour it: on the floor at the yesod's edge, facing the place he pours on (avodah3d sprinkle)
  const shirayimSpot = (corner = 'S') => (String(corner).toUpperCase().startsWith('W') ? { x: -54.55, z: 6.6, face: [-52, 6.6] } : { x: -52.2, z: 13.05, face: [-52.2, 11] });
  const shirayim = safe(async (opts = {}, k = '') => {
    const west = String(opts.corner || (k === 'shirayim-w' ? 'W' : 'S')).toUpperCase().startsWith('W');
    const [hx, hy, hz] = west ? HOLES[0] : HOLES[1];
    const y = hy + 0.018;
    // from where it is poured along the top of the yesod to its hole
    // (south: the one amah of the yesod on the south, x −53…−52, z 11.5…12.5 — temple.js; west: along the west yesod)
    const pts = west ? [[-53.7, y, 6.6], [-53.62, y, 9.2], [-53.58, y, 11.2], [hx, y, hz - 0.12]] : [[-52.14, y, 12.3], [-52.28, y, 12.14], [hx + 0.08, y, hz + 0.02]];
    // poured, never thrown: the stream leaves the vessel's lip just above the place (at most 0.3 amah across from it), falling
    // gently; given the kohen's hand (avodah3d), the lip is taken from it toward that place
    const P0 = new THREE.Vector3(pts[0][0], y, pts[0][2]);
    const from = opts.from ? new THREE.Vector3(opts.from.x, opts.from.y, opts.from.z) : new THREE.Vector3(pts[0][0] + (west ? -0.3 : 0), y + 0.6, pts[0][2] + (west ? 0 : 0.3));
    { const dx = from.x - P0.x, dz = from.z - P0.z, d = Math.hypot(dx, dz); if (d > 0.3) { from.x = P0.x + dx / d * 0.3; from.z = P0.z + dz / d * 0.3; } from.y = Math.max(from.y, y + 0.3); }
    emit('pour-start', { x: pts[0][0], y, z: pts[0][2], what: 'shirayim' });
    const s = take('altar');
    if (s) { s.O.copy(from); s.kind = 2; s.col = C_BLOOD; s.w = 0.011; s.splash = false; s.seed = 0.13; s.aim = () => aimAt(s, P0.x, y, P0.z, 0.25); s.aim(); }
    const tr = { pts, hw: 0.055, col: C_BLOOD, t: 0, grow: 0, life: 1 };
    trickles.push(tr);
    const ms = opts.ms === undefined ? 1800 : Math.max(300, +opts.ms);
    for (let t = 0; t < ms / 1000; t += 0.1) { tr.grow = Math.min(1, tr.grow + 0.1 / 1.1); await wait(0.1); }
    close(s);
    await wait(0.8);
    // it thins and is gone; the clear water of the amah carries it away (Yoma 5:6)
    for (let t = 0; t < 1.6; t += 0.1) { tr.life = Math.max(0, 1 - t / 1.6); await wait(0.1); }
    trickles.splice(trickles.indexOf(tr), 1);
    chanPulse = Math.max(chanPulse, 1);
    emit('pour-end', { x: hx, y: hy, z: hz, what: 'shirayim' });
    return true;
  });

  /* ───────── the amah and its outlet ───────── */
  let chanOn = null, chanPulse = 0;
  const channelOn = () => (chanOn === null ? built('yesod') : chanOn) && built('yesod');
  const channel = safeSync((on = true) => { chanOn = !(on === false || on === 0); emit('channel', { x: OUTLET.x, y: 0, z: OUTLET.z, on: chanOn }); return chanOn; }, false);
  // ── blooda25 ── the amah's hue (DAM25 §2.2): after the rest of the blood went down the two holes, the grates nearest them run a little
  // brown-dark — 35 % of the palette's wet at x −54.6, 12 % at −26, 4 % at −4, none east of it; the outlet and the Kidron always clear.
  // channelTint(k) sets it (blood.js worldShirayim); it eases to a quarter over 90 game minutes and is gone at the next dawn
  let tintK = 0, tintBorn = null, tintRT = 0; const GR_COL = GRATES.map(() => new THREE.Color());
  const channelTint = safeSync((k = 1) => { tintK = Math.max(0, Math.min(1, +k || 0)); tintBorn = gameMin(); tintRT = 0; return tintK; }, 0);
  const tintNow = () => {
    if (!(tintK > 0)) return 0;
    const gm = gameMin();
    if (tintBorn == null || gm == null) return tintK * Math.max(0.25, 1 - tintRT / 240);
    if (gm >= nextDawn(tintBorn) || gm < tintBorn - 1) { tintK = 0; return 0; }
    return tintK * Math.max(0.25, 1 - (gm - tintBorn) / 90 * 0.75);
  };
  const gradeAt = (x) => tintNow() * amahTint(x);
  // ── /blooda25 ──
  // the outlet: an opening at the foot of the platform's east wall and a stream down the Kidron slope (illustration)
  const outlet = { pts: [], y0: 0 };
  {
    const H = (x, z) => (ctx.terrainH ? ctx.terrainH(x, z) : groundY(x, z));
    let x = OUTLET.x + 1.2, y = H(x, OUTLET.z);
    outlet.y0 = y + 1.4; outlet.pts.push([x + 0.6, y + 0.06, OUTLET.z]);
    for (let i = 1; i < 26; i++) { const nx = x + i * 4, ny = H(nx, OUTLET.z + Math.sin(i * 0.9) * 1.5); outlet.pts.push([nx, ny + 0.08, OUTLET.z + Math.sin(i * 0.9) * 1.5]); if (i > 6 && Math.abs(ny - outlet.pts[i - 1][1]) < 0.15) break; }
  }
  let outS = null;

  /* ───────── the mukhni: the wheel lowers the kiyor into its pit for the night and raises it at dawn ─────────
   * The moving parts are the Batch sets temple.js puts in its `// ── water ──` block: 'kiyor-basin' (stand, basin, water,
   * spigots, lugs), 'kiyor-wheel' (the wheel), 'kiyor-chains'. They are built here into the kiyor stage's group with that
   * stage's own materials (ST.kiyor.cache: SITE's reveal and cast-bronze look apply) and join ST.kiyor.meshes. How deep: the
   * stand goes down into the water of the pit and the basin comes to rest on its curb (2 amot; the pit's size and depth are
   * an illustration). The drum (r 0.42) pays out the chains: the wheel turns d / 0.42. */
  const M = PL.KIYOR_MECHANISM, DROP = 2.05, DRUM_R = 0.42, CH_TOP = M.axleY - DRUM_R;
  const kparts = { basin: null, wheel: null, chains: null, st: null };
  function attachKiyor() {
    const B = ctx.B; if (!B || !B.sets) return false;
    const ST = stages && stages._dbg && stages._dbg.ST, st = (ST && ST.kiyor) || null;
    const parent = st && st.group ? st.group : scene;
    if (!parent) return false;
    const matFor = (k) => (st && st.cache && st.cache[k]) || (B.mats && B.mats[k] && B.mats[k].mat) || null;
    for (const [key, id] of [['basin', 'kiyor-basin'], ['wheel', 'kiyor-wheel'], ['chains', 'kiyor-chains']]) {
      const lists = B.sets[id]; if (!lists || !Object.keys(lists).length) continue;
      const g = new THREE.Group(), inner = new THREE.Group(); g.name = id; g.add(inner);
      if (key === 'wheel') { g.position.set(KX, M.axleY, 0); inner.position.set(-KX, -M.axleY, 0); }
      const meshes = B.build(inner, id, matFor);
      if (st && Array.isArray(st.meshes)) st.meshes.push(...meshes);
      parent.add(g); kparts[key] = g;
    }
    kparts.st = st;
    return !!kparts.basin;
  }
  const attached = safeSync(attachKiyor, false)();
  function poseKiyor() {
    const d = kiyorSt.lower;
    if (kparts.basin) kparts.basin.position.y = -d;
    if (kparts.wheel) kparts.wheel.rotation.z = d / DRUM_R;
    if (kparts.chains) { const L = CH_TOP - (K.rim + 0.3), sc = (L + d) / L; kparts.chains.scale.y = sc; kparts.chains.position.y = CH_TOP * (1 - sc); }
    if (ctx.requestShadow) ctx.requestShadow();
  }
  const mukhni = safe(async (down = true, opts = {}) => {
    const want = !(down === false || down === 0);
    if (!attached) return false;   // (the kiyor's moving parts are not its own meshes here: it stays as it is)
    if (want === kiyorSt.down && !kiyorSt.moving) return true;
    kiyorSt.down = want; const my = ++kiyorSt.seq;
    if (want) for (const sp of spig) closeSpigot(sp);
    if (opts.instant) { kiyorSt.lower = want ? DROP : 0; kiyorSt.moving = false; poseKiyor(); return true; }   // (night falls at once)
    emit('mukhni-start', { x: KX, y: M.axleY, z: M.wheel.z, down: want });
    // "its sound was heard in Jericho" (Tamid 3:8): a slow, heavy turn of the wheel
    const sec = opts.sec === undefined ? 6 : Math.max(0.5, +opts.sec), from = kiyorSt.lower, to = want ? DROP : 0;
    kiyorSt.moving = true;
    for (let t = 0; t <= sec + 1e-6; t += 0.05) {
      if (my !== kiyorSt.seq) return false;
      const u = Math.min(1, t / sec), e = u * u * (3 - 2 * u);
      kiyorSt.lower = from + (to - from) * e; poseKiyor();
      await wait(0.05);
    }
    kiyorSt.lower = to; poseKiyor(); kiyorSt.moving = false;
    emit('mukhni-end', { x: KX, y: M.axleY, z: M.wheel.z, down: want });
    return true;
  });

  /* ───────── Phase A: the first flow ───────── */
  // "so that his twelve brothers the kohanim busy with the Tamid sanctify hands and feet at once" (Yoma 37a): washTogether
  // ({ n: 12, hold }) → P — twelve kohanim come to the kiyor, each walks to his own spigot and turns to it; when all stand
  // there they bend together, the twelve spigots open (a quick ripple round the basin), and the water runs over their hands and
  // feet; then they straighten, walk a few steps out to their work, and go. Kohanim already washing keep their spigots.
  const washTogether = safe(async (opts = {}) => {
    if (!avodah || typeof avodah.kohen !== 'function' || kiyorSt.twelve || !built('kiyor')) return false;
    kiyorSt.twelve = true;
    const hs = [];
    try {
      if (kiyorSt.down) await mukhni(false);
      const want = Math.max(1, Math.min(12, opts.n === undefined ? 12 : opts.n | 0));
      for (const k of ORDER) {
        if (hs.length >= want) break;
        const sp = spig[k]; if (sp.target) continue;
        const r = WASH_R + 1.7 + (hs.length % 2) * 0.8;
        const h = avodah.kohen('kiyor-tamid-' + hs.length, { at: [KX + sp.c * r, KZ + sp.s0 * r] });
        if (h && h._a) { h._a.ambient = true; hs.push({ h, k }); }
      }
      if (!hs.length) return false;
      await wait(0.5);
      await Promise.all(hs.map(({ h, k }, i) => wait(i * 0.1).then(() => Promise.race([approach(h, k, 0), wait(6)]))));
      for (const { h } of hs) h.pose('wash');
      await wait(0.55);
      const hold = opts.hold === undefined ? 3.6 : Math.max(0.5, +opts.hold || 0);
      const res = await Promise.all(hs.map(({ h, k }, i) => wait(i * 0.07).then(() => washAt(h, k, { hold }))));
      for (const { h } of hs) h.pose('stand');
      await wait(0.7);
      if (opts.stay !== true) {
        await Promise.all(hs.map(({ h }, i) => {
          const a = h._a, dx = a.x - KX, dz = a.z - KZ, l = Math.hypot(dx, dz) || 1;
          return wait(i * 0.12).then(() => Promise.race([h.walkTo([a.x + dx / l * 4.5, a.z + dz / l * 4.5]), wait(2.4)])).then(() => h.remove());
        }));
      }
      return res.every(Boolean);
    } catch (e) { warn(e); for (const { h } of hs) h.remove(); return false; } finally { kiyorSt.twelve = false; }
  });
  const firstFlow = safe(async (opts = {}) => {
    if (kiyorSt.down) await mukhni(false);
    await kiyor({ spigots: 12, flow: 1, ms: opts.ms === undefined ? 4000 : opts.ms });
    const hold = opts.hold === undefined ? 12 : +opts.hold;
    if (hold > 0) wait(hold).then(() => { if (!spig.some((sp) => sp.target)) kiyor({ spigots: 0, ms: 2400 }); });
    return true;
  });

  /* ───────── waterMaterial (WORLD: Siloam, Bethesda) ───────── */
  const pools = [];
  const waterMaterial = safeSync((o = {}) => {
    const m = new THREE.ShaderMaterial({
      // (the scene's fog applies: the pools are seen from far, from the Mount of Olives and the city's views)
      uniforms: { ...U, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog), uDeep: { value: new THREE.Color(o.color || '#2F5561') }, uOp: { value: o.opacity === undefined ? 0.88 : +o.opacity },
        uFlow: { value: new THREE.Vector2(...(Array.isArray(o.flow) ? o.flow : [0, 0])) }, uScale: { value: o.scale === undefined ? 1 : +o.scale } },
      vertexShader: POOL_VS, fragmentShader: POOL_FS, transparent: true, depthWrite: false, fog: true,
    });
    m.name = 'water-pool'; pools.push(m); return m;
  }, null);

  /* ───────── events, waits ───────── */
  const subs = new Set();
  function emit(kind, o = {}) { const e = Object.assign({ kind }, o); for (const cb of subs) { try { cb('water', e); } catch (err) { warn(err); } } }
  const onEvent = (cb) => { if (typeof cb === 'function') subs.add(cb); return () => subs.delete(cb); };
  const nowMs = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const timers = [];
  function wait(sec) {
    return new Promise((res) => {
      const T = { t: Math.max(0, sec), res, w0: nowMs(), sec: Math.max(0, sec) };
      T.bk = setTimeout(() => { const i = timers.indexOf(T); if (i >= 0) { timers.splice(i, 1); res(true); } }, (T.sec * 1.6 + 2.5) * 1000);
      timers.push(T);
    });
  }
  function safe(fn) { return (...a) => { try { const r = fn(...a); return r && typeof r.then === 'function' ? r.then((v) => v, (e) => { warn(e); return false; }) : Promise.resolve(r); } catch (e) { warn(e); return Promise.resolve(false); } }; }
  function safeSync(fn, dflt = null) { return (...a) => { try { return fn(...a); } catch (e) { warn(e); return dflt; } }; }

  /* ───────── the frame ───────── */
  let enabled = true, T = 0, lastCount = 0, wasNight = false;
  const frustum = new THREE.Frustum(), PV = new THREE.Matrix4(), SPH = new THREE.Sphere(), TMP = new THREE.Vector3();
  const seen = (x, y, z, r, far) => {
    if (!camera) return true;
    const d = camera.position.distanceTo(TMP.set(x, y, z));
    if (d - r > far) return false;
    SPH.center.set(x, y, z); SPH.radius = r; return frustum.intersectsSphere(SPH);
  };
  // the washing water runs east down the steps and over the paving to the drain (illustration)
  const RUN = [];
  {
    const zz = (x) => KZ + 0.9 - (x + 62) * 0.06;
    let prevX = -62.2, prevY = 19;
    const edges = [-62, -61, -60, -57, -56, -55];
    for (const ex of edges) {
      const yTop = ground(ex - 0.01, zz(ex)), yBot = ground(ex + 0.01, zz(ex));
      RUN.push({ a: [prevX, yTop + 0.015, zz(prevX)], b: [ex - 0.02, yTop + 0.015, zz(ex)], v: false });
      RUN.push({ a: [ex + 0.03, yTop + 0.01, zz(ex)], b: [ex + 0.05, yBot + 0.01, zz(ex)], v: true });
      prevX = ex + 0.05; prevY = yBot;
    }
    RUN.push({ a: [prevX, prevY + 0.015, zz(prevX)], b: [DRAIN.x + 0.1, 16.015, DRAIN.z + 0.5], v: false });
  }
  let runoff = 0, wetK = 0;
  const vis = { kiyor: false, altar: false, outlet: false }, BOWL_KEYS = ['water', 'wine'];

  function update(dt) {
    try {
      dt = Math.max(0, Math.min(0.1, dt || 0)); T += dt; U.uTime.value = T; tintRT += dt;   // ── blooda25 ── (the tint's real clock without the day)
      for (let i = timers.length - 1; i >= 0; i--) { const tm = timers[i]; tm.t -= dt; if (tm.t <= 0 || nowMs() - tm.w0 >= tm.sec * 1000) { timers.splice(i, 1); clearTimeout(tm.bk); tm.res(true); } }
      // light follows the sky preset (no allocation)
      if (sun) { U.uSun.value.copy(sun.position); if (sun.target) U.uSun.value.sub(sun.target.position); U.uSun.value.normalize(); U.uSunC.value.copy(sun.color).multiplyScalar(sun.visible === false ? 0 : sun.intensity); }
      if (hemi) { U.uSky.value.copy(hemi.color).multiplyScalar(hemi.intensity); U.uGnd.value.copy(hemi.groundColor).multiplyScalar(hemi.intensity); }
      { const c = U.uSunC.value, lum = 0.3 * c.r + 0.55 * c.g + 0.15 * c.b, k = Math.max(0, Math.min(1, 1 - lum / 0.9)); U.uLamp.value.setRGB(0.55 * k, 0.33 * k, 0.14 * k); }
      // streams: heads fall from the spout, tails fall away after closing
      for (const W of washes) washAim(W, dt);
      for (const sp of spig) if (sp.s) { if (sp.s.live && (sp.s.open || sp.target)) spigotAim(sp); if (!sp.s.live) sp.s = null; }
      let flowSum = 0;
      for (const s of streams) {
        if (!s.live) continue;
        if (s.aim) s.aim();
        if (s.open) s.age += dt; else { s.cage += dt; if (s.cage >= s.tl) { s.live = false; continue; } }
        if (s.grp === 'kiyor' && s.open) flowSum += s.flow;
      }
      for (const sp of spig) { sp.wet = Math.max(0, Math.min(1, sp.wet + (sp.s && sp.s.open ? dt * 0.6 : -dt * 0.02))); }
      runoff += ((flowSum > 0 ? Math.min(1, 0.35 + flowSum * 0.12) : 0) - runoff) * Math.min(1, dt * (flowSum > 0 ? 0.8 : 0.25));
      wetK = Math.max(0, Math.min(1, wetK + (flowSum > 0 ? dt * 0.25 : -dt * 0.012)));
      chanPulse = Math.max(0, chanPulse - dt * 0.15);
      // the mukhni follows the night (main.js's time presets, read through life.night): when night falls the kiyor is in its
      // pit at once; at dawn the wheel raises it ("its sound was heard in Jericho", Tamid 3:8). Phase B's kiddush raises it
      // itself, at the creak, before the first washing; a washing at night raises it first.
      const night = !!(life && life.night);
      if (night !== wasNight) { wasNight = night; if (attached && built('kiyor')) { if (night && !washes.length && !kiyorSt.twelve) mukhni(true, { instant: true }); else if (!night && kiyorSt.down) mukhni(false); } }
      // the outlet's stream
      const chOn = channelOn();
      if (chOn && !outS) { outS = take('outlet'); if (outS) { const o = outS; o.O.set(OUTLET.x + 0.35, outlet.y0, OUTLET.z); o.w = 0.07; o.seed = 0.9; o.flow = 0.8; o.aim = () => aimAt(o, outlet.pts[0][0], outlet.pts[0][1], outlet.pts[0][2], 0.1); o.aim(); } }
      else if (!chOn && outS) { close(outS); outS = null; }

      if (!enabled || !camera) { sMesh.visible = fMesh.visible = false; return; }
      camera.updateMatrixWorld(); PV.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse); frustum.setFromProjectionMatrix(PV);
      vis.kiyor = built('kiyor') && seen(KX, 20.5, KZ + 1, 14, 260);
      vis.altar = built('yesod') && seen(-51, 20, 9, 10, 240);
      vis.outlet = chOn && seen(OUTLET.x + 40, outlet.y0 - 15, OUTLET.z, 60, 420);
      writeStreams(vis);
      nF = 0;
      if (vis.kiyor) writeKiyor();
      if (vis.altar) writeAltar();
      writeAmah(chOn);
      if (vis.outlet) writeOutlet();
      fGeo.instanceCount = nF; fMesh.visible = nF > 0;
      for (const n in fAttr) { const at = fAttr[n]; at.clearUpdateRanges(); at.addUpdateRange(0, Math.max(1, nF) * 4); at.needsUpdate = true; }
    } catch (e) { warn(e); }
  }
  function writeStreams(vis) {
    let n = 0;
    const O = sAttr.iO.array, V = sAttr.iV.array, P = sAttr.iP.array, C = sAttr.iC.array, X = sAttr.iX.array;
    for (const s of streams) {
      if (!s.live || !vis[s.grp]) continue;
      const t1 = Math.min(s.tl, s.open ? s.age : s.tl), t0 = s.open ? 0 : Math.min(s.cage, s.tl);
      if (t1 - t0 < 0.004) continue;
      O[n * 3] = s.O.x; O[n * 3 + 1] = s.O.y; O[n * 3 + 2] = s.O.z;
      V[n * 3] = s.V.x; V[n * 3 + 1] = s.V.y; V[n * 3 + 2] = s.V.z;
      P[n * 4] = t0; P[n * 4 + 1] = t1; P[n * 4 + 2] = s.w; P[n * 4 + 3] = s.a;
      C[n * 4] = s.col.r; C[n * 4 + 1] = s.col.g; C[n * 4 + 2] = s.col.b; C[n * 4 + 3] = s.seed;
      X[n * 4] = s.open && s.age < s.tl ? 1 : 0; X[n * 4 + 1] = s.open ? 0 : 1; X[n * 4 + 2] = 0; X[n * 4 + 3] = s.kind;
      n++;
    }
    sGeo.instanceCount = n; sMesh.visible = n > 0;
    if (n || lastCount) for (const k in sAttr) { const at = sAttr[k]; at.clearUpdateRanges(); at.addUpdateRange(0, Math.max(1, n) * at.itemSize); at.needsUpdate = true; }
    lastCount = n;
  }
  const landedPt = (s) => (s.open ? s.age >= s.tl : s.cage < s.tl);
  function writeKiyor() {
    // the basin's surface, moving gently (the batch's flat disc lies under it)
    disc(KIND.SURF, KX, K.rim - 0.13 - kiyorSt.lower, KZ, 2.2, 0.3, C_BASIN, 1);
    // wet paving where the streams fall, drying slowly
    for (const sp of spig) if (sp.wet > 0.01) { const r = 2.37 + 0.35 + 0.6 * sp.flow, x = KX + sp.c * r, z = KZ + sp.s0 * r; disc(KIND.WET, x, ground(x, z) + 0.006, z, 0.55 + 0.35 * sp.wet, sp.k * 0.37, C_WATER, sp.wet); }
    // splashes: foam and droplets where each stream lands (on the paving, or on the hands)
    for (const s of streams) {
      if (!s.live || s.grp !== 'kiyor' || !s.splash || !landedPt(s)) continue;
      const L = s.land, st = s.open ? 1 : Math.max(0, 1 - s.cage / s.tl);
      disc(KIND.FOAM, L.x, L.y + 0.02, L.z, 0.3 + 0.24 * s.flow, s.seed * 7.1, C_WATER, st);
      drops(L.x, L.y + 0.02, L.z, 5, s.flow * st, s.seed * 13.3);
    }
    // the runoff: a thin film east down the steps to the drain
    if (runoff > 0.01 || wetK > 0.01) {
      let i = 0;
      for (const r of RUN) { strip(KIND.FILM, r.a[0], r.a[1], r.a[2], r.b[0], r.b[1], r.b[2], r.v ? 0.3 : 0.34 + 0.05 * Math.sin(i * 2.1), r.v ? 1.6 : 0.9, i * 0.31, C_DEEP, Math.max(runoff, wetK * 0.4), r.v); i++; }
      if (runoff > 0.05) disc(KIND.FOAM, DRAIN.x + 0.05, 16.03, DRAIN.z + 0.35, 0.3, 0.77, C_WATER, runoff * 0.7);
    }
  }
  function writeAltar() {
    for (const key of BOWL_KEYS) if (bowlLevel[key] > 0.01) { const b = bowlPos[key]; disc(KIND.SURF, b.x, b.y + 0.12 + 0.14 * bowlLevel[key], b.z, 0.13 + 0.15 * bowlLevel[key], 0.5, key === 'wine' ? C_WINE : C_BASIN, 1); }
    for (const tr of trickles) {
      // the trickle grows along its path, then thins away
      let total = 0; for (let i = 1; i < tr.pts.length; i++) total += Math.hypot(tr.pts[i][0] - tr.pts[i - 1][0], tr.pts[i][2] - tr.pts[i - 1][2]);
      let left = total * tr.grow;
      for (let i = 1; i < tr.pts.length && left > 0.001; i++) {
        const a = tr.pts[i - 1], b = tr.pts[i], l = Math.hypot(b[0] - a[0], b[2] - a[2]), f = Math.min(1, left / l); left -= l;
        strip(KIND.TRICKLE, a[0], a[1], a[2], a[0] + (b[0] - a[0]) * f, a[1], a[2] + (b[2] - a[2]) * f, tr.hw * (0.5 + 0.5 * tr.life), 0.6, i * 0.21, tr.col, tr.life);
      }
    }
    for (const s of streams) if (s.live && s.grp === 'altar' && s.splash && landedPt(s)) { disc(KIND.RIPPLE, s.land.x, s.land.y + 0.01, s.land.z, 0.28, 0.2, C_WATER, 0.8); }
    // the libations run down into the shitin (Me'ilah 3:3): a glimmer of liquid going down inside the two holes at the corner
    const dr = Math.max(drainGlow.water, drainGlow.wine);
    if (dr > 0.01) for (let i = 0; i < 2; i++) { const [x, y, z] = HOLES[i]; disc(KIND.RIPPLE, x, y + 0.02, z, 0.19, 0.6 + i * 0.3, drainGlow.wine > drainGlow.water ? C_WINE : C_WATER, dr); }
  }
  function writeAmah(on) {
    if (!built('yesod')) return;
    const flowA = on ? 1 : 0;
    for (let i = 0; i < GRATES.length; i++) {
      const x = GRATES[i], y = (ctx.ground || groundY)(x, AMAH_Z) + 0.014;
      if (!seen(x, y, AMAH_Z, 1.2, i === 0 ? 240 : 170)) continue;
      const hw = i === 0 ? 0.45 : 0.36;
      const gc = GR_COL[i].copy(chanPulse > 0 && i < 5 ? C_WATER : C_CHAN), gk = gradeAt(x); if (gk > 0) gc.lerp(C_BLOOD, gk);   // ── blooda25 ── (the hue by x)
      pushF(KIND.GRATE, x, y, AMAH_Z, hw * 1.35, 0, 0, flowA, 0, 0, hw, i * 0.19, gc, 1);
    }
  }
  // ── fix26 ── mukhniAt(u): the player's own hold on the mukhni (u 0 = down in its pit … 1 = up at the spouts' height); any running
  // mukhni() glide is cancelled; below the top the spouts stay shut (openSpigot's rule)
  const mukhniAt = safeSync((u) => { if (!attached) return false; const v = Math.max(0, Math.min(1, +u || 0)); ++kiyorSt.seq; kiyorSt.moving = false;
    kiyorSt.lower = DROP * (1 - v); kiyorSt.down = v < 0.999; if (kiyorSt.down) for (const sp of spig) closeSpigot(sp); poseKiyor(); return true; }, false);
  // ── /fix26 ──
  function writeOutlet() {
    // the opening in the wall and the stream down the slope to the Kidron
    pushF(KIND.GRATE, OUTLET.x + 0.02, outlet.y0 + 0.25, OUTLET.z, 0, 0, 0.9, 1, 0, 0.5, 0, 0.55, C_CHAN, 1);
    const p = outlet.pts;
    disc(KIND.FOAM, p[0][0], p[0][1] + 0.03, p[0][2], 0.5, 0.33, C_WATER, 0.8);
    drops(p[0][0], p[0][1] + 0.03, p[0][2], 4, 0.7, 5.5);
    for (let i = 1; i < p.length; i++) strip(KIND.FILM, p[i - 1][0], p[i - 1][1], p[i - 1][2], p[i][0], p[i][1], p[i][2], 0.55, 2.2, i * 0.41, C_DEEP, 0.95);
  }

  const api = {
    kiyor, wash, pour, mukhni, mukhniAt /* ── fix26 ── */, channel, waterMaterial, channelTint, gradeAt, get tint() { return tintNow(); }, AMAH_Z,   // ── blooda25 ──
     firstFlow, washTogether, onEvent, update,
    setEnabled: safeSync((v) => { enabled = !!v; if (!enabled) { sMesh.visible = fMesh.visible = false; } return enabled; }, false),
    // for avodah3d's wash (the kohen walks, bends, then the water): where to stand at spigot i, and the water part
    washSpot, _washAt: washAt, shirayim, shirayimSpot, hold, approach,
    // cheap per-frame reads (no allocation): the kiyor is lowered / the twelve are washing / how many spigots run
    get down() { return kiyorSt.down; }, get twelve() { return !!kiyorSt.twelve; },
    get holding() { for (let i = 0; i < held.length; i++) if (held[i] && held[i].on) return true; return false; },
    get flowing() { let n = 0; for (const sp of spig) if (sp.s && sp.s.open) n++; return n; },
    get state() { return { spigots: openList(), flow: kiyorSt.flow, down: kiyorSt.down, lower: kiyorSt.lower, attached, twelve: !!kiyorSt.twelve, channel: channelOn(), pours: { ...altarBusy }, trickles: trickles.length }; },
    get stats() { return { streams: sGeo.instanceCount, flats: fGeo.instanceCount, draws: (sMesh.visible ? 1 : 0) + (fMesh.visible ? 1 : 0), pools: pools.length }; },
    fx: [fMesh, sMesh], SPIGOTS: SPIG, GRATES, DRAIN, OUTLET,
    setAvodah(a) { avodah = a || null; },
  };
  return api;
}
