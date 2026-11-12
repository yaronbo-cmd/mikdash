/* ── look C ── src/look/air.js — the air over the world (docs/specs/look/C-light-sky-air.md §C4, C6), as ONE shared chunk in the patches that
 * already exist (look A's family, the ground, the buildings' groundAO, the city): no program of its own.
 *   Cloud shadows: the dome's own cloud noise (sky.js noiseTex, the same texture), projected from the cloud layer down the sun's direction
 *   onto every lit surface, drifting with the clouds' wind; a multiply on the DIRECT light only (never below 1 − strength, at most 0.25), so
 *   the shade under a cloud is still lit by the sky. Off on 'low' (the chunk is not compiled in), off at night and under the rain.
 *   Wind: the olive crowns and the scrub (one patch, one program for both) sway under 0.1 amah (the stake's cloth already waves: props.js).
 *
 *   airUniforms() → the shared uniforms (one object for every program) · airPatch(sh) → a MeshStandardMaterial's onBeforeCompile part
 *   airTick(sky, dir, k) every frame (sky: sky.js's object, dir: toward the sun, k: 0..1 how much cloud shadow now)
 *   airMat(mat, key) → a plain material given the chunk (the city) · windMat(mat) → swaying (olive crowns, scrub) · AIR_ON(): not 'low'
 *   CLOUD: the layer's height and scale (the dome draws its clouds as a plane ~1400 amot up: uv = xz / height × 0.28)
 * ── /look C ── */
export const CLOUD = Object.freeze({ h: 1400, uv: 0.28, max: 0.25, drift: [0.0012, 0.0005] });
export const AIR_ON = () => { try { return (globalThis.__LOOK_Q || globalThis.__FORCE_Q) !== 'low'; } catch (e) { return true; } };

// (plain objects: the same { value } objects in every program; three.js reads .value at each draw)
const U = {
  uAirN: { value: null },
  uAirC: { value: [0, 0, 0, 0.45] },   // xy: the drift (uv), z: the strength (0 = none), w: the cover (sky.js cov)
  uAirS: { value: [0, 1, 0] },         // toward the sun
  uAirT: { value: 0 },                 // seconds (the wind)
};
// (three.js uploads a 4- or 3-array as a vec4 / vec3 when the uniform is declared so)
export function airUniforms() { return U; }

const AIR_COMMON = /* glsl */`
uniform sampler2D uAirN; uniform vec4 uAirC; uniform vec3 uAirS;
// the cloud layer's cover over the world point W (the dome's own noise, its big shapes only: soft-edged patches)
float airShade(vec3 W) {
  if (uAirC.z <= 0.0) return 1.0;
  vec2 q = W.xz + uAirS.xz / max(uAirS.y, 0.2) * (${CLOUD.h.toFixed(1)} - W.y);
  vec4 a = texture2D(uAirN, q * ${(CLOUD.uv / CLOUD.h).toExponential(4)} + uAirC.xy, 2.5);
  float n = a.r * 0.5 + a.g * 0.2 + 0.17;
  return 1.0 - uAirC.z * smoothstep(1.0 - uAirC.w - 0.04, 1.0 - uAirC.w + 0.3, n);
}`;
const AIR_LIGHT = /* glsl */`
  { float airK = airShade(cameraPosition + (vec4(-vViewPosition, 0.0) * viewMatrix).xyz);
    reflectedLight.directDiffuse *= airK; reflectedLight.directSpecular *= airK; }`;
/** the cloud shadows in a MeshStandardMaterial's shader (call inside its onBeforeCompile, after its own replaces) */
export function airPatch(sh) {
  if (!AIR_ON() || sh.fragmentShader.includes('airShade(')) return sh;
  Object.assign(sh.uniforms, { uAirN: U.uAirN, uAirC: U.uAirC, uAirS: U.uAirS });
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', '#include <common>\n' + AIR_COMMON)
    .replace('#include <lights_fragment_end>', '#include <lights_fragment_end>\n' + AIR_LIGHT);
  return sh;
}
/** a material of its own (the city) given the cloud shadows: its own program, keyed */
export function airMat(m, key) {
  m.onBeforeCompile = (sh) => airPatch(sh);
  m.customProgramCacheKey = () => key + (AIR_ON() ? '-air' : '');
  return m;
}

/** every frame: the noise, the drift with the clouds' wind, the cover, the sun; k: 0..1 (night, rain, 'low' → 0) */
export function airTick(sky, dir, k) {
  if (!sky || !sky.uniforms) return;
  const su = sky.uniforms, t = su.uTime.value;
  U.uAirN.value = su.uNoise.value;
  const c = U.uAirC.value; c[0] = t * CLOUD.drift[0]; c[1] = t * CLOUD.drift[1]; c[2] = CLOUD.max * Math.max(0, Math.min(1, k)); c[3] = su.uCov.value;
  if (dir) { const s = U.uAirS.value; s[0] = dir.x; s[1] = dir.y; s[2] = dir.z; }
  U.uAirT.value = t;
}

/* ───────── the wind ───────── */
const WIND_V = /* glsl */`
  { // (the crown sways about its foot: the higher the vertex, the more; its phase by where the plant stands; under 0.1 amah)
#ifdef USE_INSTANCING
    vec2 wP = instanceMatrix[3].xz; float wS = length(instanceMatrix[0].xyz);
#else
    vec2 wP = vec2(0.0); float wS = 1.0;
#endif
    float wH = clamp(position.y, 0.0, 1.0), wPh = dot(wP, vec2(0.071, 0.053));
    float wA = (0.075 / max(wS, 0.5)) * wH * wH;
    transformed.x += wA * (sin(uAirT * 1.3 + wPh) + 0.35 * sin(uAirT * 2.9 + wPh * 1.7));
    transformed.z += wA * 0.6 * sin(uAirT * 1.1 + wPh * 1.3 + 1.0); }`;
export function windPatch(sh) {
  sh.uniforms.uAirT = U.uAirT;
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nuniform float uAirT;')
    .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + WIND_V);
  return sh;
}
/** a plain material (the olive crowns, the scrub: the same program) swaying in the wind, with the cloud shadows */
export function windMat(m) {
  m.onBeforeCompile = (sh) => { windPatch(sh); airPatch(sh); };
  m.customProgramCacheKey = () => 'wind' + (AIR_ON() ? '-air' : '');
  return m;
}
