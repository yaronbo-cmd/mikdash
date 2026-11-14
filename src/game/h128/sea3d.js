/* ── build 128 ── h128/sea3d.js — stage 06's sea (brief §3): one Gerstner sea whose sum is the model's seaAt (the same WAVES, the same
 * swells, evaluated in the vertex shader here and in JS for the ship), the merchant ship (illustration) with the two bronze doors
 * lashed on her deck, Nicanor and six sailors at work, a sky that goes from a clear late afternoon to a green-grey storm and to a
 * cloud break with the light on the bronze, rain in the storm only, and one golden light (dimmed and cooled in the storm).
 *
 * Its own THREE.Scene, drawn by the game's renderer: nothing of the Mount is drawn or touched while the sea is on screen, so the
 * Mount needs no restoring. Every place on the ship is the book's (BOOK.s06.sea: hull, mast, deck, cam); the sea's frame has the
 * ship at its origin, x toward the bow, z to starboard, y up; the ship sails on through the waves (the sea's field slides past).
 * The ship's static parts are merged into one mesh per material (about twenty draw calls in all).
 *
 *   const S = createSea3d({ renderer });   S.set({ k, brk, swells, furl });   S.update(t, dt);   S.view('play'|'lift'|'round', u);
 *   S.render();   S.dbg() → { heave, pitch, roll, lift, k, brk, scriptMs }
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { BOOK } from '../world/grid.js';
import { WAVES, SWELL, H128, seaAt, headDir, swellPos } from './model.js';
import { createActors } from '../../actors.js';

const SEA = BOOK.s06.sea, HULL = SEA.hull, DECK = SEA.deck, MAST = SEA.mast, CAM = SEA.cam, LIGHT = SEA.light;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const mix = (a, b, u) => a + (b - a) * u;
const DEG = Math.PI / 180, TAU = Math.PI * 2;
// sizes of the scene (no places): the sea's dense square, its far skirt, the sky's radius, the ship's way through the waves
const SEA_HALF = 200, SEA_FAR = 3200, SEA_SEG = 96, SEA_DENSE = 84, SKY_R = 4000, SAIL_V = 2.2;
const DECK_Y = HULL.free;             // the deck's planks: the hull's freeboard above the water at rest
const SIT = 0.6;                      // how far she sits below her rest line (the hull's draught under the doors' weight: illustration)
const DRY = 0.35;                     // the deck's edge is kept at least this far above the water under it (no sheet of sea on the deck)
const DUN = 0.3;                      // the timbers the leaves lie on (their thickness shows, with a dark gap under them)
// Nicanor's bronze: a yellow metal, paler and less saturated than the gold of the vessels (#E3B64E), never copper-orange
const BRONZE = '#D9AF5A', BRONZE_D = '#C59E52';
// the light (one golden light: the world's dusk sun colour; cooled and dimmed in the storm) and the skies (illustration)
const SKY = {
  clear: { top: '#4E78B6', hor: '#F0C690', sea: '#1D5868', deep: '#072634', scat: '#2C9A88', foam: '#F2F3EC', sun: '#FFBA6E', sunI: 2.7, hemiS: '#B4C4DC', hemiG: '#8A7660', hemiI: 1.7,
    fog: '#EBCCA4', fogSea: '#B9AE9C', cloud: '#FFF0DC', cloudD: '#A3949A', pale: '#EBCCA4', cover: 0.46 },
  storm: { top: '#2A3633', hor: '#56635C', sea: '#2B4F47', deep: '#06120F', scat: '#3C8C72', foam: '#D8E2DE', sun: '#B8C6CC', sunI: 0.75, hemiS: '#8494A0', hemiG: '#46504B', hemiI: 1.25,
    fog: '#5A665F', fogSea: '#46524C', cloud: '#4C5652', cloudD: '#121816', pale: '#A9B2A6', cover: 0.5 },
  brk: { top: '#5E86A6', hor: '#E6C28C', sea: '#22485A', deep: '#0A2230', scat: '#46A08C', foam: '#EEF0EA', sun: '#FFC27A', sunI: 2.6, hemiS: '#9AA6AE', hemiG: '#6A6052', hemiI: 1.45,
    fog: '#9A968A', fogSea: '#6E7270', cloud: '#5C666A', cloudD: '#1C2427', pale: '#D9C6A0', cover: 0.55 },
};
const C = (h) => new THREE.Color(h);
// the sun's direction (toward the sun). The light on the ship: low ahead-left in the late afternoon, through the gap at the break.
// The sun the sky and the water show: lower (a disk with its glow near the horizon in the calm; in the break it shines through the
// torn hole far ahead, its light a path on the water to the ship)
const SUN_CLEAR = new THREE.Vector3(0.8, 0.3, -0.52).normalize(), SUN_BRK = new THREE.Vector3(0.8, 0.42, -0.45).normalize();
const SKY_CLEAR = new THREE.Vector3(0.86, 0.1, -0.5).normalize(), SKY_BRK = new THREE.Vector3(0.9, 0.105, -0.42).normalize();
const _up = new THREE.Vector3(0, 0.05, 0);   // the hole's centre stands a little above the sun it shows

/* ─────────────── the sea's shaders: the model's sum (gerst + swells), the same constants ─────────────── */
const NW = WAVES.length;
// shared GLSL: a small value noise and its octaves (no texture: every asset inline)
const NOISE = /* glsl */`
  float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
  const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);
  float fbm2(vec2 p) { return vn(p) * 0.67 + vn(ROT * p + 5.2) * 0.33; }
  float fbm4(vec2 p) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * vn(p); p = ROT * p + 1.7; a *= 0.5; } return s / 0.9375; }
  // (the fine octaves weighed by w: toward the horizon they fade to their mean, so the far clouds do not crowd into streaks)
  float fbm4w(vec2 p, float w) { float s = 0.0, a = 0.5; for (int i = 0; i < 4; i++) { s += a * (i < 2 ? vn(p) : mix(0.5, vn(p), w)); p = ROT * p + 1.7; a *= 0.5; } return s / 0.9375; }`;
// the sky's look, shared by the dome and the water's mirror: the gradient, the sun, the clouds on a plane above the sea (two layers
// at their own speeds, lit from the sun's side), the storm's low ceiling that rolls in from port, its pale band at the horizon, and
// the break: a hole torn in the ceiling along the sun's ray to the bright patch on the water
const SKYFN = /* glsl */`
  uniform vec3 uTop, uHor, uSun, uFog, uCloud, uCloudD, uPale; uniform vec3 uSkyDir; uniform float uT, uK, uBrk, uCover, uFront;
  uniform vec3 uCam; uniform vec3 uHoleD; uniform float uHoleR;   // the hole: its direction (from the ship) and its angular radius
  const float HC = 650.0;                  // the cloud plane's height (amot): a low ceiling
  vec2 planeAt(vec3 d) { return uCam.xz + d.xz / max(d.y, 0.035) * HC; }
  // the storm's share at a point of the plane: the ceiling comes in from port (−z) and closes over the ship as uFront goes by
  float stormAt(vec2 P) { return 1.0 - smoothstep(uFront - 900.0, uFront + 900.0, P.y + (vn(P / 1700.0) - 0.5) * 2400.0); }
  // the hole torn in the ceiling: 1 inside (clear), a ragged edge
  float holeAt(vec3 d, float oct) { if (uBrk <= 0.0) return 0.0;
    vec3 ax = normalize(cross(uHoleD, vec3(0.0, 1.0, 0.0))), ay = cross(ax, uHoleD);
    vec2 q = vec2(dot(d, ax), dot(d, ay) * 1.15); float r = uHoleR * uBrk;
    float e = oct > 2.5 ? (fbm4(q * 9.0 + vec2(uT * 0.02, 0.0)) - 0.5) * r * 1.3 + (fbm2(q * 34.0) - 0.5) * r * 0.45 : (vn(q * 9.0) - 0.5) * r;
    return (1.0 - smoothstep(r * 0.35, r * 1.05, length(q) + e)) * step(0.0, dot(d, uHoleD)); }
  // the clouds at a plane point: cover c and thickness th. Calm: two layers (big and slow, small and quicker); the storm: a closed
  // ceiling stretched into rolls, its thickness in dark masses, low scud running under it
  float cloudsAt(vec2 P, float oct, float hd, out float th, out float st) {
    st = stormAt(P);
    vec2 a = P / 1500.0 + uT * vec2(0.0045, 0.0012), b = P / 520.0 + uT * vec2(0.014, 0.004) + 3.7;
    float fw = smoothstep(0.03, 0.25, hd), n1 = oct > 2.5 ? fbm4w(a, fw) : vn(a), n2 = oct > 2.5 ? fbm4w(b, fw) : vn(b);
    float n = n1 * 0.72 + n2 * 0.38 - 0.05;
    float calm = smoothstep(1.0 - uCover, 1.0 - uCover + 0.26, n), cth = smoothstep(1.0 - uCover + 0.06, 1.05, n);
    vec2 r = vec2(P.x / 1700.0, P.y / 800.0) + uT * vec2(0.008, 0.02);
    float roll = oct > 2.5 ? fbm4w(r, fw) : vn(r);
    float scud = oct > 2.5 ? mix(0.5, fbm2(P / 300.0 + uT * vec2(0.06, 0.035)), fw) : 0.5;
    float ceil = smoothstep(0.08, 0.38, roll + 0.12), sth = smoothstep(0.3, 0.78, roll * 0.65 + scud * 0.45);
    th = mix(cth, sth, st);
    return mix(calm, ceil, st);
  }
  vec3 skyGrad(vec3 d) {
    float h = d.y;
    vec3 col = mix(uHor, uTop, pow(clamp(h, 0.0, 1.0), 0.55));
    float sd = max(dot(d, uSkyDir), 0.0), calmS = 1.0 - uK * (1.0 - uBrk);
    col += uSun * (pow(sd, 10.0) * 0.32 + pow(sd, 160.0) * 0.7) * calmS;
    return col;
  }
  // the whole sky in direction d; oct > 2.5 the dome's full detail, else the water's mirror
  vec3 skyAt(vec3 d, float oct, float hb) {
    float h = d.y; vec3 col = skyGrad(d);
    float sd = max(dot(d, uSkyDir), 0.0);
    if (oct > 2.5) col += uSun * smoothstep(0.99955, 0.9998, sd) * 3.0 * (1.0 - uK * (1.0 - uBrk)) * smoothstep(-0.005, 0.02, h);   // the sun's disk
    if (h > 0.0) {
      vec2 P = planeAt(d); float th, st, th2, st2;
      float c = cloudsAt(P, oct, h, th, st);
      // lit from the sun's side: the cover a step toward the sun; thick bases dark, the sun-ward edges bright (less under the storm)
      vec2 toS = normalize(uSkyDir.xz + 1e-4) * 140.0;
      float c2 = oct > 2.5 ? cloudsAt(P + toS, 1.0, h, th2, st2) : c;
      float lit = clamp(0.5 + (c - c2) * 2.0, 0.0, 1.0), calmL = 1.0 - st * mix(uK, 0.6, uBrk);
      vec3 cc = mix(uCloud, uCloudD, th * mix(0.75, 1.0, st)) + uSun * lit * calmL * (0.15 + 0.85 * pow(sd, 2.0)) * 0.7;
      cc += uSun * pow(sd, 40.0) * 0.6 * (1.0 - th) * calmL;             // the sun's glow through thin cloud
      float ho = holeAt(d, oct);
      if (uBrk > 0.0) {   // the hole's torn rim, lit by the sun behind it
        float rim = smoothstep(0.0, 0.45, ho) * (1.0 - smoothstep(0.55, 1.0, ho));
        cc += uSun * uBrk * (rim * 0.9 * (1.0 - th * 0.6) + 0.3 * pow(sd, 5.0)) * (0.4 + 0.6 * c);
      }
      col = mix(col, cc, c * (1.0 - ho) * smoothstep(0.0, 0.1, h));
    }
    // the haze at the horizon: under the storm's ceiling a pale band, the light beyond the storm
    float band = smoothstep(oct > 2.5 ? 0.055 : 0.12, 0.0, abs(hb));
    vec3 haze = mix(uFog, uPale, uK * (1.0 - uBrk * 0.3));
    col = mix(col, haze, band * (0.8 + 0.15 * uK) * (oct > 2.5 ? 1.0 : 0.6));
    return col;
  }`;
const SEA_VS = /* glsl */`
  uniform float uT, uK, uFade0, uFade1;
  uniform vec2 uShip;
  uniform vec4 uW[${NW}];      // (k, omega, dir x, dir z)
  uniform vec4 uWA[${NW}];     // (A calm, A storm, Q, 0)
  uniform vec4 uSw[3];         // (dir x, dir z, the crest's distance past the ship, H)
  uniform float uSwW[3];
  varying vec3 vWP; varying vec3 vN; varying vec2 vP; varying float vSteep; varying float vH; varying float vFade;
  float sech2(float v) { float c = cosh(v); return 1.0 / (c * c); }
  void main() {
    vec3 p = position;                       // the plane lies in x, z; the sea's frame: the ship at the origin
    float d = length(p.xz), fade = 1.0 - smoothstep(uFade0, uFade1, d);
    vec2 g = p.xz + uShip;                   // the waves' own frame (the ship sails through it)
    float dx = 0.0, dz = 0.0, y = 0.0, sx = 0.0, sz = 0.0, am = 0.0;
    for (int i = 0; i < ${NW}; i++) {
      vec4 W = uW[i]; vec4 WA = uWA[i];
      float A = mix(WA.x, WA.y, uK) * fade, th = W.x * dot(W.zw, g) - W.y * uT, c = cos(th), s = sin(th);
      float q = WA.z / ${NW.toFixed(1)};
      dx += q * W.z * A * c; dz += q * W.w * A * c; y += A * s; am += A;
      sx += A * W.x * W.z * c; sz += A * W.x * W.w * c;
    }
    float hs = 0.0;
    for (int j = 0; j < 3; j++) {
      vec4 S = uSw[j]; if (S.w <= 0.0) continue;
      float u = dot(p.xz, S.xy) - S.z, k = u < 0.0 ? uSwW[j] * 1.6 : uSwW[j] * 0.7, v = u / k;
      float f = 1.0 - smoothstep(uFade0 * 1.3, uFade1, d);
      float h = S.w * sech2(v) * f, gr = -2.0 * S.w * sech2(v) * tanh(v) / k * f;
      y += h; sx += gr * S.x; sz += gr * S.y; hs = max(hs, h / S.w);
    }
    vec3 wp = vec3(p.x + dx, y, p.z + dz);
    vN = normalize(vec3(-sx, 1.0, -sz)); vSteep = length(vec2(sx, sz)); vP = p.xz; vFade = fade;
    vH = max(clamp(0.5 + 0.5 * (y - hs * 4.0) / max(am, 0.05), 0.0, 1.0) * fade, hs);   // the height in the waves' own range (0 trough … 1 crest)
    vec4 w4 = modelMatrix * vec4(wp, 1.0); vWP = w4.xyz;
    gl_Position = projectionMatrix * viewMatrix * w4;
  }`;
const SEA_FS = /* glsl */`
  ${NOISE}
  ${SKYFN}
  uniform vec3 uSea, uDeep, uScat, uFoam, uFogSea; uniform float uSunI, uFogD, uG, uBow, uPatchI;
  uniform vec4 uW[${NW}]; uniform vec4 uWA[${NW}];
  uniform vec4 uSw[3]; uniform float uSwW[3];
  uniform vec4 uHA; uniform vec3 uPatch; uniform vec2 uShip;
  varying vec3 vWP; varying vec3 vN; varying vec2 vP; varying float vSteep; varying float vH; varying float vFade;
  // the hull's half beam at the waterline at x (the ship's lines: h128 hullAt)
  float hbAt(float x) { bool fore = x > uHA.z; float t = clamp(fore ? (x - uHA.z) / (uHA.y - uHA.z) : (uHA.z - x) / (uHA.z - uHA.x), 0.0, 1.0);
    return uHA.w * pow(max(0.0, 1.0 - pow(t, fore ? 2.0 : 2.4)), fore ? 0.62 : 0.5); }
  void main() {
    vec2 P = vP, g = P + uShip;                      // P: the ship's frame; g: the water's own frame (foam stays in the water)
    vec3 V = normalize(cameraPosition - vWP);
    float dist = length(cameraPosition - vWP);
    // the second layer: a fine chop riding the big waves (six short waves of their own, by the same dispersion), faded with distance
    vec2 sl = vec2(0.0); float ch = 0.0;
    for (int i = 0; i < 6; i++) {
      float fi = float(i), L = 1.7 + 1.5 * fi + mod(fi * 2.7, 1.9), a = fi * 2.399 + 0.6;
      vec2 dir = vec2(cos(a), sin(a)); float k = 6.2832 / L, w = sqrt(uG * k);
      float th = k * dot(dir, g) - w * uT + fi * 1.7, A = 0.0065 * L * (1.0 + 1.6 * uK) * exp(-dist / (L * 18.0));
      sl += dir * (A * k * cos(th)); ch += A * sin(th);
    }
    vec2 nn = vec2(vn(g * 0.9 + uT * 0.35), vn(g * 0.9 - uT * 0.3 + 9.1)) - 0.5;
    sl += nn * (0.05 + 0.05 * uK) * exp(-dist / 25.0);
    vec3 n = normalize(vN + vec3(-sl.x, 0.0, -sl.y));
    float nv = max(dot(n, V), 0.0);
    float fr = 0.02 + 0.98 * pow(1.0 - nv, 5.0);
    vec3 R = reflect(-V, n), R2 = reflect(-V, normalize(vN)); R.y = abs(R.y) + 0.01;
    vec3 refl = skyAt(normalize(R), 1.0, abs(R2.y) + 0.01);   // (the horizon's band read off the big waves alone: no rings or flakes from the chop)
    // the body of the water: deep and clear looking down, lit backs, darker troughs (more so in the storm)
    float hh = vH;
    float lam = max(dot(n, uSkyDir), 0.0);
    vec3 body = mix(uDeep, uSea, smoothstep(0.0, 1.0, hh) * (0.6 + 0.4 * lam));
    body *= mix(1.0, 0.55, (1.0 - hh) * uK);
    body *= 0.75 + 0.5 * min(uSunI, 1.0) * lam;
    // light through the thin top of a steep crest: the sun behind the wave, and a little of the sky's light in any case
    float back = pow(clamp(dot(-V, uSkyDir) * 0.6 + 0.4, 0.0, 1.0), 3.0);
    float thin = smoothstep(0.55, 1.0, hh) * smoothstep(0.08, 0.5, vSteep + ch * 0.3) * exp(-dist / 260.0);
    body += uScat * thin * (back * min(uSunI, 1.2) * 1.1 + 0.12);
    vec3 col = mix(body, refl, fr * (1.0 - 0.3 * uK));
    float sp = pow(max(dot(R, uSkyDir), 0.0), mix(420.0, 90.0, uK));
    col += uSun * sp * uSunI * mix(2.6, 0.8, uK);
    // foam. Its pattern sits in the water: lace that thins into streaks along the waves' way as it ages
    vec2 wd = normalize(uW[0].zw + uW[1].zw * 0.5), wp2 = vec2(-wd.y, wd.x);
    vec2 sg = vec2(dot(g, wd) * 0.22, dot(g, wp2) * 1.1);
    float fine = exp(-dist / 70.0), lace = vn(g * 0.7) * 0.45 + vn(g * 1.9 + 3.3) * 0.27 + vn(sg * 1.7) * 0.18 + mix(0.5, vn(g * 5.3 + 7.7), fine) * 0.2;
    float streak = vn(sg) * 0.6 + vn(sg * 2.3 + 1.1) * 0.4;
    float fo = 0.0;
    // the waves' crests break (some, more in the storm): white on the crest, left on its back as streaks that fade
    for (int i = 0; i < 3; i++) {
      vec4 W = uW[i]; float A = mix(uWA[i].x, uWA[i].y, uK) * vFade;
      float th = W.x * dot(W.zw, g) - W.y * uT, ag = 1.5708 - th;
      float id = floor(ag / 6.2832), age = ag / 6.2832 - id;                // age: 0 at the crest, growing behind it
      float lat = dot(g, vec2(-W.w, W.z));
      float gate = smoothstep(0.66 - 0.2 * uK, 0.9 - 0.2 * uK, vn(vec2(id * 3.7 + float(i) * 11.0, lat / 30.0)));
      float brk = smoothstep(0.045, 0.11, A * W.x) * gate;                  // how hard this crest breaks (its own steepness)
      float life = exp(-age / mix(0.05, 0.11, uK)) * smoothstep(0.0, 0.02, age);
      float tex = mix(smoothstep(0.46, 0.72, lace), smoothstep(0.5, 0.78, streak * 0.7 + lace * 0.3) * 0.8, smoothstep(0.0, 0.08, age));
      fo = max(fo, brk * life * tex * 0.8);
    }
    // the big swells: a thick breaking crest in the storm, its foam left behind on the long back
    for (int j = 0; j < 3; j++) {
      vec4 S = uSw[j]; if (S.w <= 0.0) continue;
      float u = dot(P, S.xy) - S.z, w = uSwW[j]; if (u < -w * 4.6 || u > 4.0) continue;
      float crestB = smoothstep(-6.0, -0.5, u) * smoothstep(3.5, 0.0, u);
      float a = clamp(-u / (w * 4.5), 0.0, 1.0);
      float trail = (1.0 - a) * (1.0 - a) * (1.0 - a) * step(u, 0.0);
      vec2 sd = vec2(dot(g, S.xy) * 0.32, dot(g, vec2(-S.y, S.x)) * 0.62);
      float sstr = vn(sd) * 0.6 + vn(sd * 2.2 + 4.0) * 0.4;
      float f = max(crestB * smoothstep(0.25, 0.5, lace), trail * smoothstep(0.48, 0.72, sstr * 0.6 + lace * 0.4));
      fo = max(fo, f * (0.25 + 0.75 * uK) * smoothstep(1.0, 3.0, S.w) * vFade);
    }
    // the hull: a wash along her sides, the bow's wave, the foam thrown where the bow comes down, the wake behind her
    float hb = hbAt(P.x) * 0.86, side = abs(P.y) - hb;
    float inLen = step(uHA.x + 3.0, P.x) * step(P.x, uHA.y - 1.0);
    float bowS = smoothstep(uHA.z, uHA.y, P.x);
    float wash = inLen * smoothstep(-0.2, 0.3, side) * smoothstep(1.2 + 2.5 * bowS + 2.0 * uBow * bowS, 0.2, side) * (0.35 + 0.4 * bowS + 0.25 * uK);
    vec2 bp = P - vec2(uHA.y - 2.0, 0.0); float br = length(bp);
    float bowF = smoothstep(4.0 + 6.0 * uBow, 1.5, br) * (0.35 + 0.65 * uBow) * step(-1.0, bp.x + 4.0);
    float s = uHA.x + 2.0 - P.x;                                          // behind the stern
    float wake = 0.0;
    if (s > 0.0) {
      float tw = 2.6 + s * 0.09, arm = s * 0.34, aw = 0.9 + s * 0.025;
      wake = smoothstep(tw, tw * 0.3, abs(P.y)) * exp(-s / 24.0) * 0.4;
      wake += exp(-pow((abs(P.y) - arm) / aw, 2.0)) * exp(-s / 45.0) * 0.35 * smoothstep(0.0, 6.0, s);
    }
    float hullF = max(max(wash, bowF), wake) * smoothstep(0.3, 0.55, lace * 0.6 + streak * 0.5);
    fo = max(fo, hullF);
    fo = clamp(fo, 0.0, 1.0);
    vec3 foamC = uFoam * (0.6 + 0.4 * lam) * (0.55 + 0.45 * min(uSunI, 1.0));
    col = mix(col, foamC, fo * 0.85);
    // the break: the bright patch on the water where the light comes through the hole
    vec2 pd = P - uPatch.xy; float pt = exp(-dot(pd, pd) / (uPatch.z * uPatch.z)) * uPatchI;
    col = col * (1.0 - 0.3 * uPatchI * (1.0 - pt)) + uSun * pt * (0.18 + 0.45 * fr + 1.2 * sp);
    float fg = 1.0 - exp(-dist * uFogD);
    col = mix(col, uFogSea, clamp(fg, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;
/* the sky: the shared sky (clouds, sun, storm, break); the sun's disk with a soft glow; the light's rays under the hole */
const SKY_VS = /* glsl */`varying vec3 vD; void main() { vD = normalize(position); vec4 p = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }`;
const SKY_FS = /* glsl */`
  ${NOISE}
  ${SKYFN}
  varying vec3 vD;
  void main() {
    vec3 d = normalize(vD); float h = d.y;
    if (h < -0.02) { gl_FragColor = vec4(uFog, 1.0);
      #include <tonemapping_fragment>
      #include <colorspace_fragment>
      return; }
    float sd = max(dot(d, uSkyDir), 0.0);
    vec3 col = skyAt(d, 3.0, d.y);
    // the light's rays below the hole: they fan from the sun through the haze under the ceiling
    if (uBrk > 0.0) {
      vec3 sp = normalize(d - uSkyDir * dot(d, uSkyDir));
      vec3 ax = normalize(cross(uSkyDir, vec3(0.0, 1.0, 0.0))), ay = cross(ax, uSkyDir);
      float ang = atan(dot(sp, ay), dot(sp, ax));
      float rays = smoothstep(0.35, 0.9, vn(vec2(ang * 9.0, uT * 0.05)) * 0.7 + vn(vec2(ang * 23.0, 2.0)) * 0.3);
      float below = smoothstep(0.0, -0.25, dot(d - uSkyDir, vec3(0.0, 1.0, 0.0)));   // only under the sun
      col += uSun * rays * below * uBrk * 0.22 * pow(sd, 6.0) * smoothstep(0.0, 0.05, h);
    }
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;
/* the storm's spray: points blown flat off the crests (the shader places them: no per-frame JS), only where the water stands high */
const SPRAY_VS = /* glsl */`
  attribute vec3 aSeed;
  uniform float uT, uK, uFade0, uFade1, uPx; uniform vec2 uShip, uWind;
  uniform vec4 uW[${NW}]; uniform vec4 uWA[${NW}]; uniform vec4 uSw[3]; uniform float uSwW[3];
  varying float vA;
  float sech2(float v) { float c = cosh(v); return 1.0 / (c * c); }
  float hs(float n) { return fract(sin(n * 91.3458) * 47453.5453); }
  void main() {
    float L = 1.1 + aSeed.z * 0.6, cyc = uT / L + aSeed.x, ci = floor(cyc), age = cyc - ci;
    float r1 = hs(aSeed.y * 13.1 + ci * 1.37), r2 = hs(aSeed.x * 7.7 + ci * 2.11), r3 = hs(aSeed.z * 5.3 + ci * 0.73);
    vec2 p = (vec2(r1, r2) - 0.5) * 300.0;
    // a third of them start on the nearest big swell's crest line
    if (r3 < 0.4 && uSw[0].w > 0.0) { vec4 S = uSw[0]; vec2 pr = vec2(-S.y, S.x); p = S.xy * (S.z - 1.0) + pr * (r1 - 0.5) * 300.0; }
    vec2 g = p + uShip; float y = 0.0, am = 0.0;
    for (int i = 0; i < ${NW}; i++) { vec4 W = uW[i]; float A = mix(uWA[i].x, uWA[i].y, uK); y += A * sin(W.x * dot(W.zw, g) - W.y * (uT - age * L)); am += A; }
    float hi = 0.0;
    for (int j = 0; j < 3; j++) { vec4 S = uSw[j]; if (S.w <= 0.0) continue; float u = dot(p, S.xy) - S.z; float k = u < 0.0 ? uSwW[j] * 1.6 : uSwW[j] * 0.7;
      float h = S.w * sech2(u / k); y += h; hi = max(hi, h / S.w); }
    float crest = max(smoothstep(0.32, 0.7, y / max(am, 0.1)), smoothstep(0.8, 0.96, hi));
    float t = age * L;
    vec3 wp = vec3(p.x, y + 0.5, p.y) + vec3(uWind.x, 0.0, uWind.y) * (t * 17.0) + vec3(0.0, 1.0, 0.0) * (t * 3.0 - t * t * 2.2);
    vec4 mv = modelViewMatrix * vec4(wp, 1.0);
    vA = crest * (1.0 - age) * smoothstep(0.0, 0.08, age) * uK * (1.0 - smoothstep(130.0, 150.0, length(p)));
    gl_PointSize = uPx * (0.9 + age * 2.6) * (0.6 + r3) / max(-mv.z, 1.0);
    gl_Position = projectionMatrix * mv;
  }`;
const SPRAY_FS = /* glsl */`uniform vec3 uFoam; varying float vA;
  void main() { vec2 c = gl_PointCoord - 0.5; float r = dot(c, c) * 4.0; if (r > 1.0) discard; gl_FragColor = vec4(uFoam, vA * (1.0 - r) * (1.0 - r) * 0.8); }`;
/* what the bronze reflects: a neutral sky (grey above, a bright band at the horizon, the dark sea below, a warm sun), so the
 * metal's own yellow carries its colour and its sheen slides across the leaf as she rolls */
const ENV_FS = /* glsl */`
  uniform vec3 uSunDir; varying vec3 vD;
  void main() { vec3 d = normalize(vD); float h = d.y;
    vec3 c = h < 0.0 ? mix(vec3(0.22, 0.24, 0.24), vec3(0.05, 0.06, 0.06), clamp(-h * 4.0, 0.0, 1.0)) : mix(vec3(0.66, 0.68, 0.7), vec3(0.34, 0.36, 0.4), pow(h, 0.6));
    c += vec3(1.2, 1.17, 1.08) * exp(-pow(h / 0.07, 2.0));
    c += vec3(0.8, 0.68, 0.5) * pow(max(dot(d, uSunDir), 0.0), 24.0);
    gl_FragColor = vec4(c, 1.0); }`;
/* rain: a few hundred streaks round the camera, falling in the shader (no per-frame JS) */
const RAIN_VS = /* glsl */`
  attribute float aEnd; uniform float uT; uniform vec3 uCam; uniform float uLen;
  varying float vA;
  void main() {
    vec3 b = position; float H = 60.0;
    float y = mod(b.y - uT * 38.0, H) - H * 0.5;
    vec3 p = vec3(uCam.x + b.x + y * 0.25, uCam.y + y, uCam.z + b.z);
    p += vec3(0.25, 1.0, 0.0) * aEnd * uLen;
    vA = 1.0 - aEnd * 0.7;
    gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0);
  }`;
const RAIN_FS = /* glsl */`uniform float uK; varying float vA; void main() { gl_FragColor = vec4(0.78, 0.82, 0.82, 0.32 * vA * uK); }`;

/* ─────────────── the ship (illustration): lofted hull, posts, wales, deck, rail, mast, yard, sail, steering oars ─────────────── */
function hullAt(x) {
  // the half-beam, the sheer (the gunwale's height) and the keel at station x
  const fore = x > HULL.wide, t = fore ? (x - HULL.wide) / (HULL.stem - HULL.wide) : (HULL.wide - x) / (HULL.wide - HULL.stern);
  const hb = (HULL.beam / 2) * Math.pow(Math.max(0, 1 - Math.pow(t, fore ? 2.0 : 2.4)), fore ? 0.62 : 0.5);
  const sheer = HULL.free + (fore ? HULL.sheer[1] : HULL.sheer[0]) * t * t + 0.9;
  const keel = HULL.free - HULL.depth + (HULL.depth - 1.2) * Math.pow(t, 2.6);
  return { hb: Math.max(0.12, hb), sheer, keel };
}
function canvasTex(w, h, draw, srgb = true, rep = true) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(cv); if (rep) t.wrapS = t.wrapT = THREE.RepeatWrapping; if (srgb) t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function woodTex(n, base, line, w, h, plank) {
  return canvasTex(w, h, (g) => {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < n; i++) {
      const y = (i / n) * h; g.fillStyle = `rgba(0,0,0,${0.05 + ((i * 37) % 7) / 70})`; g.fillRect(0, y, w, h / n);
      g.fillStyle = line; g.fillRect(0, y, w, 1.5);
      for (let k = 0; k < 3; k++) { const x = (((i * 53 + k * 97) % 100) / 100) * w; g.fillRect(x, y, 1.5, h / n); }   // the plank ends
      if (plank) for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(40,25,10,0.08)'; g.fillRect(((i * 31 + k * 41) % 100) / 100 * w, y + 2, 18, 1); }
    }
  });
}
function buildHull() {
  const N = 40, M = 18, pos = [], col = [], uv = [], idx = [];
  const cBelow = C('#2B2119'), cWet = C('#17120D'), cSide = C('#6A4A32'), cBand = C('#8A3F2A'), cTop = C('#4E3826'), tmp = new THREE.Color();
  for (let i = 0; i <= N; i++) {
    const x = mix(HULL.stern, HULL.stem, i / N), H = hullAt(x);
    for (const s of [-1, 1]) for (let j = 0; j <= M; j++) {
      const a = j / M, ph = a * Math.PI / 2;
      const z = s * H.hb * Math.sin(ph) * (1 + 0.05 * a), y = H.keel + (H.sheer - H.keel) * (1 - Math.cos(ph));
      pos.push(x, y, z); uv.push(x / 6, y / 3);
      // the bottom, a dark wet band where she meets the water (SIT above her rest line, splashed higher), the sides, the painted strake, the cap
      tmp.copy(y > H.sheer - 0.9 ? cTop : y > H.sheer - 1.7 ? cBand : cSide);
      if (y < SIT + 1.3) tmp.lerp(cWet, clamp((SIT + 1.3 - y) / 0.5, 0, 1));
      if (y < SIT - 0.6) tmp.lerp(cBelow, clamp((SIT - 0.6 - y) / 0.6, 0, 1));
      col.push(tmp.r, tmp.g, tmp.b);
    }
  }
  const row = 2 * (M + 1);
  for (let i = 0; i < N; i++) for (let s = 0; s < 2; s++) for (let j = 0; j < M; j++) {
    const a = i * row + s * (M + 1) + j, b = a + row;
    if (s === 1) idx.push(a, b, a + 1, b, b + 1, a + 1); else idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
function tubeOf(pts, r, seg = 24, rs = 6) { return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), seg, r, rs, false); }
const _m = new THREE.Matrix4(), _q = new THREE.Quaternion(), _e = new THREE.Euler(), _s = new THREE.Vector3(1, 1, 1), _p = new THREE.Vector3();
/** a geometry placed (position, Euler rotation) — for the merged meshes */
const at = (g, p = [0, 0, 0], r = [0, 0, 0]) => g.applyMatrix4(_m.compose(_p.set(...p), _q.setFromEuler(_e.set(r[0], r[1], r[2])), _s));

export function createSea3d({ renderer, quality = 1 } = {}) {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 16 / 10, 0.5, SKY_R * 1.6);
  scene.fog = new THREE.Fog('#E9C9A2', 120, 1500);
  const ship = new THREE.Group(); ship.name = 'h128-ship'; scene.add(ship);
  const deck = new THREE.Group(); deck.position.y = DECK_Y; ship.add(deck);   // the deck's frame: (x, z) of the book's deck table
  const own = [];   // geometries and materials to dispose
  const keep = (o) => { own.push(o); return o; };

  /* the light: one golden light and the sky's fill */
  const sun = new THREE.DirectionalLight('#FFBA6E', 2.7); scene.add(sun, sun.target);
  const hemi = new THREE.HemisphereLight('#B4C4DC', '#8A7660', 1.7); scene.add(hemi);

  /* the sea */
  const sg = keep(new THREE.PlaneGeometry(2, 2, SEA_SEG, SEA_SEG)); sg.rotateX(-Math.PI / 2);
  {
    // the dense square (SEA_DENSE of the segments over ±SEA_HALF) and a far skirt out to the horizon (the rest)
    const P = sg.attributes.position, half = SEA_SEG / 2, dh = SEA_DENSE / 2;
    const map = (v) => { const i = v * half, a = Math.abs(i), s = Math.sign(i); return a <= dh ? s * (a / dh) * SEA_HALF : s * (SEA_HALF + (SEA_FAR - SEA_HALF) * Math.pow((a - dh) / (half - dh), 1.6)); };
    for (let i = 0; i < P.count; i++) P.setXYZ(i, map(P.getX(i)), 0, map(P.getZ(i)));
    sg.computeBoundingSphere(); sg.boundingSphere.radius = SEA_FAR * 1.5;
  }
  const W = WAVES.map((w) => { const k = TAU / w.L; return new THREE.Vector4(k, Math.sqrt(H128.G * k), Math.cos(w.dir * DEG), Math.sin(w.dir * DEG)); });
  const WA = WAVES.map((w) => new THREE.Vector4(w.A[0], w.A[1], w.Q, 0));
  const seaU = {
    uT: { value: 0 }, uK: { value: 0 }, uShip: { value: new THREE.Vector2() }, uW: { value: W }, uWA: { value: WA }, uG: { value: H128.G },
    uSw: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] }, uSwW: { value: [SWELL.w, SWELL.w, SWELL.w] },
    uFade0: { value: SEA_HALF * 1.2 }, uFade1: { value: SEA_HALF * 2.6 },
    uSea: { value: C(SKY.clear.sea) }, uDeep: { value: C(SKY.clear.deep) }, uScat: { value: C(SKY.clear.scat) }, uFoam: { value: C(SKY.clear.foam) },
    uTop: { value: C(SKY.clear.top) }, uHor: { value: C(SKY.clear.hor) }, uSun: { value: C(SKY.clear.sun) }, uSkyDir: { value: SKY_CLEAR.clone() }, uSunI: { value: 1 },
    uFog: { value: C(SKY.clear.fog) }, uFogSea: { value: C(SKY.clear.fogSea) }, uFogD: { value: 0.0011 },
    uCloud: { value: C(SKY.clear.cloud) }, uCloudD: { value: C(SKY.clear.cloudD) }, uPale: { value: C(SKY.clear.pale) }, uCover: { value: SKY.clear.cover },
    uFront: { value: -1e5 }, uCam: { value: new THREE.Vector3() }, uHoleD: { value: SKY_BRK.clone() }, uHoleR: { value: LIGHT.hole }, uBrk: { value: 0 },
    // the hull's lines for the wash, the bow's wave and the wake (stern, stem, the widest station, the half beam); the bow coming down;
    // the break's bright patch on the water (x, z, radius) and its strength
    uHA: { value: new THREE.Vector4(HULL.stern, HULL.stem, HULL.wide, HULL.beam / 2) }, uBow: { value: 0 },
    uPatch: { value: new THREE.Vector3(DECK.doors.port[0], 0, LIGHT.r) }, uPatchI: { value: 0 },
  };
  const seaM = keep(new THREE.ShaderMaterial({ uniforms: seaU, vertexShader: SEA_VS, fragmentShader: SEA_FS }));
  const seaMesh = new THREE.Mesh(sg, seaM); seaMesh.frustumCulled = false; seaMesh.renderOrder = 5; seaMesh.name = 'h128-sea'; scene.add(seaMesh);   // (after the ship: none of its costly light is spent under her)

  /* the sky (the same uniforms: the water mirrors this very sky) */
  const skyM = keep(new THREE.ShaderMaterial({ uniforms: seaU, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false, fog: false }));
  const sky = new THREE.Mesh(keep(new THREE.SphereGeometry(SKY_R, 48, 24)), skyM); sky.frustumCulled = false; sky.renderOrder = 10; sky.name = 'h128-sky'; scene.add(sky);   // (drawn last of the solid things, at the far plane: only where nothing stands in front of it)

  /* the storm's spray: blown flat off the crests (points the shader places) */
  const SPN = Math.round(1400 * quality), spS = new Float32Array(SPN * 3);
  { let s = 29; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; for (let i = 0; i < SPN * 3; i++) spS[i] = r(); }
  const sprG = keep(new THREE.BufferGeometry()); sprG.setAttribute('position', new THREE.BufferAttribute(new Float32Array(SPN * 3), 3)); sprG.setAttribute('aSeed', new THREE.BufferAttribute(spS, 3));
  const wd = WAVES[0].dir * DEG;
  const sprU = { uT: seaU.uT, uK: seaU.uK, uFade0: seaU.uFade0, uFade1: seaU.uFade1, uShip: seaU.uShip, uW: seaU.uW, uWA: seaU.uWA, uSw: seaU.uSw, uSwW: seaU.uSwW,
    uFoam: seaU.uFoam, uPx: { value: 300 }, uWind: { value: new THREE.Vector2(Math.cos(wd), Math.sin(wd)) } };
  const spray2 = new THREE.Points(sprG, keep(new THREE.ShaderMaterial({ uniforms: sprU, vertexShader: SPRAY_VS, fragmentShader: SPRAY_FS, transparent: true, depthWrite: false })));
  spray2.frustumCulled = false; spray2.visible = false; spray2.name = 'h128-spray'; scene.add(spray2);

  /* the rain */
  const RN = Math.round(420 * quality), rp = new Float32Array(RN * 6), re = new Float32Array(RN * 2);
  { let s = 11; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < RN; i++) { const x = (r() - 0.5) * 140, y = r() * 60, z = (r() - 0.5) * 140; rp.set([x, y, z, x, y, z], i * 6); re[i * 2] = 0; re[i * 2 + 1] = 1; } }
  const rg = keep(new THREE.BufferGeometry()); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3)); rg.setAttribute('aEnd', new THREE.BufferAttribute(re, 1));
  const rainU = { uT: seaU.uT, uCam: { value: new THREE.Vector3() }, uLen: { value: 2.2 }, uK: { value: 0 } };
  const rain = new THREE.LineSegments(rg, keep(new THREE.ShaderMaterial({ uniforms: rainU, vertexShader: RAIN_VS, fragmentShader: RAIN_FS, transparent: true, depthWrite: false })));
  rain.frustumCulled = false; rain.visible = false; rain.name = 'h128-rain'; scene.add(rain);

  /* materials (the wood cheap; the bronze a lit metal with its own reflection) */
  const hullM = keep(new THREE.MeshLambertMaterial({ vertexColors: true, map: keep(woodTex(14, '#B08A62', 'rgba(30,18,8,0.55)', 256, 256, false)), side: THREE.DoubleSide }));
  const darkM = keep(new THREE.MeshLambertMaterial({ color: '#3B2A1C' }));
  const woodM = keep(new THREE.MeshLambertMaterial({ color: '#7A5A3C' }));
  const ropeM = keep(new THREE.MeshLambertMaterial({ color: '#A88A5C' }));
  const grooveM = keep(new THREE.MeshBasicMaterial({ color: '#1E150A' }));
  const bronzeM = keep(new THREE.MeshStandardMaterial({ color: BRONZE, metalness: 0.92, roughness: 0.2, envMapIntensity: 1.6 }));
  const bronzeD = keep(new THREE.MeshStandardMaterial({ color: BRONZE_D, metalness: 0.92, roughness: 0.26, envMapIntensity: 1.8 }));
  // a sun glint on the bronze stays bright metal, never a blank white: the light it sends is capped, its hue kept (before the tone map)
  for (const m of [bronzeM, bronzeD]) m.onBeforeCompile = (sh) => { sh.fragmentShader = sh.fragmentShader.replace('#include <tonemapping_fragment>',
    'gl_FragColor.rgb *= min(1.0, 1.25 / max(max(gl_FragColor.r, gl_FragColor.g), max(gl_FragColor.b, 1e-3)));\n#include <tonemapping_fragment>'); };
  const parts = new Map();   // material → geometries in the ship's frame, merged at the end
  const put = (mat, g) => { if (!parts.has(mat)) parts.set(mat, []); parts.get(mat).push(g); return g; };
  const onDeck = (p) => [p[0], p[1] + DECK_Y, p[2]];

  /* the hull and her fittings */
  const hull = new THREE.Mesh(keep(buildHull()), hullM); hull.name = 'h128-hull'; ship.add(hull);
  { const hs = hullAt(HULL.stern + 0.01), he = hullAt(HULL.stem - 0.01);
    const stern = [[HULL.stern + 2, hs.keel, 0], [HULL.stern, hs.keel + 2, 0], [HULL.stern - 1.2, hs.sheer, 0], [HULL.stern - 2.2, hs.sheer + 1.8, 0], [HULL.stern - 2.4, hs.sheer + 3.0, 0], [HULL.stern - 1.7, hs.sheer + 3.4, 0], [HULL.stern - 1.3, hs.sheer + 2.9, 0]];
    const stem = [[HULL.stem - 2, he.keel, 0], [HULL.stem, he.keel + 1.5, 0], [HULL.stem + 1.1, he.sheer, 0], [HULL.stem + 1.6, he.sheer + 1.6, 0]];
    put(darkM, tubeOf(stern, 0.42, 20, 7)); put(darkM, tubeOf(stem, 0.4, 12, 7));
    const kp = []; for (let i = 0; i <= 16; i++) { const x = mix(HULL.stern + 2, HULL.stem - 2, i / 16); kp.push([x, hullAt(x).keel - 0.2, 0]); }
    put(darkM, tubeOf(kp, 0.3, 20, 5));
    for (const s of [-1, 1]) for (const a of [0.78, 0.92]) {   // the wales: two heavy strakes along each side
      const wp = []; for (let i = 0; i <= 20; i++) { const x = mix(HULL.stern + 1.5, HULL.stem - 1.2, i / 20), H = hullAt(x), ph = a * Math.PI / 2;
        wp.push([x, H.keel + (H.sheer - H.keel) * (1 - Math.cos(ph)), s * (H.hb * Math.sin(ph) * (1 + 0.05 * a) + 0.12)]); }
      put(darkM, tubeOf(wp, 0.2, 30, 5));
    }
  }
  // the deck: planks along her length, inside the hull's line
  { const sh = new THREE.Shape(), n = 30;
    for (let i = 0; i <= n; i++) { const x = mix(HULL.stern + 0.6, HULL.stem - 0.6, i / n); const z = hullAt(x).hb * 0.98; i ? sh.lineTo(x, z) : sh.moveTo(x, z); }
    for (let i = n; i >= 0; i--) { const x = mix(HULL.stern + 0.6, HULL.stem - 0.6, i / n); sh.lineTo(x, -hullAt(x).hb * 0.98); }
    const dg = keep(new THREE.ShapeGeometry(sh, 2)); dg.rotateX(Math.PI / 2);
    const U = dg.attributes.position, uvA = dg.attributes.uv; for (let i = 0; i < U.count; i++) uvA.setXY(i, U.getX(i) / 24, U.getZ(i) / 6);
    const dm = new THREE.Mesh(dg, keep(new THREE.MeshLambertMaterial({ map: keep(woodTex(12, '#C9A577', 'rgba(60,38,18,0.6)', 512, 256, true)), side: THREE.DoubleSide }))); dm.position.y = DECK_Y; dm.name = 'h128-deck'; ship.add(dm);
  }
  // the rail: posts and a cap rail on the gunwale
  for (const s of [-1, 1]) {
    for (let x = HULL.stern + 3; x < HULL.stem - 2; x += 2.2) { const H = hullAt(x); put(woodM, at(new THREE.BoxGeometry(0.16, 1.0, 0.16), [x, H.sheer + 0.5, s * H.hb * 1.04])); }
    const rp2 = []; for (let i = 0; i <= 20; i++) { const x = mix(HULL.stern + 3, HULL.stem - 2.2, i / 20), H = hullAt(x); rp2.push([x, H.sheer + 1.0, s * H.hb * 1.04]); }
    put(woodM, tubeOf(rp2, 0.1, 30, 4));
  }
  // the mast and the yard
  put(woodM, at(new THREE.CylinderGeometry(0.32, 0.55, MAST.h, 10), [MAST.at[0], DECK_Y + MAST.h / 2, MAST.at[1]]));
  put(woodM, at(new THREE.CylinderGeometry(0.55, 0.75, 0.6, 10), [MAST.at[0], DECK_Y + 0.3, MAST.at[1]]));   // the mast's partner at the deck
  const yardY = DECK_Y + MAST.h - 2.5;
  put(woodM, at(new THREE.CylinderGeometry(0.22, 0.3, MAST.yard, 8), [MAST.at[0] + 0.5, yardY, MAST.at[1]], [Math.PI / 2, 0, 0]));
  // the rudder's housings: a heavy timber through the bulwark on each quarter, the post's lashing round it (the turns the sailor keeps tight)
  const steerLash = [], HOUSE_Y = 2.0;   // the housing's height over the deck (the post passes it there)
  for (const [x, z] of DECK.steer) {
    const s = Math.sign(z), hb = hullAt(x).hb, zin = s * (hb - 0.5), w = Math.abs(z - zin) + 0.9;
    put(darkM, at(new THREE.BoxGeometry(1.9, 0.9, w), onDeck([x, HOUSE_Y, (zin + z + s * 0.9) / 2])));
    put(darkM, at(new THREE.BoxGeometry(0.5, 1.8, 0.5), onDeck([x + 0.7, HOUSE_Y - 1.1, s * (hb + 0.15)])));   // its knee against the hull
    for (const dy of [-0.3, 0.05, 0.4]) put(ropeM, at(new THREE.TorusGeometry(0.5, 0.09, 5, 12), onDeck([x + 0.2 * dy, HOUSE_Y + 0.6 + dy, z]), [Math.PI / 2, 0, 0]));
    steerLash.push([x, HOUSE_Y + 0.6, z]);
  }

  /* the sail: cream cloth, bellied by the wind, a few sewn seams; furled to a strip under the yard in the storm */
  const sailW = MAST.yard - 2, sailG = keep(new THREE.PlaneGeometry(sailW, 1, 16, 12)); sailG.rotateY(Math.PI / 2);
  { const P = sailG.attributes.position; for (let i = 0; i < P.count; i++) { const z = P.getZ(i), y = P.getY(i) - 0.5, u = z / (sailW / 2);
      P.setXYZ(i, 2.6 * Math.sin(Math.PI * Math.pow(-y, 0.8)) * (1 - u * u * 0.75) + 0.6, y, z); } sailG.computeVertexNormals(); }
  const sailTex = keep(canvasTex(256, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#F1E6CB'); gr.addColorStop(1, '#E6D6B4'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = 'rgba(120,95,60,0.22)'; for (let i = 1; i < 6; i++) g.fillRect((i / 6) * w, 0, 1.2, h);   // the sewn cloths: a few thin seams
    g.fillStyle = 'rgba(120,95,60,0.12)'; g.fillRect(0, 2, w, 2);                                         // the head's bolt rope
  }, true, false));
  const sail = new THREE.Mesh(sailG, keep(new THREE.MeshLambertMaterial({ map: sailTex, side: THREE.DoubleSide, emissive: '#6E5E40', emissiveIntensity: 0.55 })));   // (emissive: the light through the cloth)
  sail.position.set(MAST.at[0] + 0.6, yardY - 0.2, MAST.at[1]); ship.add(sail);
  const lineM = keep(new THREE.LineBasicMaterial({ color: '#4E3C2A' }));
  const stays = keep(new THREE.BufferGeometry()); ship.add(new THREE.LineSegments(stays, lineM));
  const setStays = (sailH) => {
    const top = [MAST.at[0], DECK_Y + MAST.h, MAST.at[1]], hs = hullAt(HULL.stern + 4), he = hullAt(HULL.stem - 1), yz = sailW / 2, by = yardY - 0.2 - sailH;
    const L = [...top, HULL.stem, he.sheer + 1, 0, ...top, HULL.stern + 4, hs.sheer + 1, 0];
    for (const s of [-1, 1]) { const H = hullAt(MAST.at[0] - 2); L.push(...top, MAST.at[0] - 2, H.sheer, s * H.hb, MAST.at[0] + 0.6, by, s * yz, MAST.at[0] - 6, hullAt(MAST.at[0] - 6).sheer, s * hullAt(MAST.at[0] - 6).hb * 0.95); }
    stays.setAttribute('position', new THREE.Float32BufferAttribute(L, 3)); stays.attributes.position.needsUpdate = true;
  };

  /* the two bronze doors on their timbers, lashed with four ropes from rings in the deck to cleats */
  const D = DECK.doors, top = DUN + D.T;   // the leaf's face, over the deck
  for (const side of ['port', 'stbd']) {
    const [cx, cz] = D[side];
    for (const dx of [-D.L * 0.38, 0, D.L * 0.38]) put(woodM, at(new THREE.BoxGeometry(0.7, DUN, D.W + 0.6), onDeck([cx + dx, DUN / 2, cz])));   // the timbers under it
    put(bronzeM, at(new THREE.BoxGeometry(D.L, D.T, D.W), onDeck([cx, DUN + D.T / 2, cz])));   // the leaf: its thickness shows at the edges
    // a raised frame round the face, the three cross bands, each with a dark line where it meets the face
    const fw = 0.42, fh = 0.12;
    for (const [w, d, x, z] of [[D.L, fw, 0, D.W / 2 - fw / 2], [D.L, fw, 0, -D.W / 2 + fw / 2], [fw, D.W - 2 * fw, D.L / 2 - fw / 2, 0], [fw, D.W - 2 * fw, -D.L / 2 + fw / 2, 0]]) {
      put(bronzeD, at(new THREE.BoxGeometry(w, fh, d), onDeck([cx + x, top + fh / 2, cz + z])));
      put(grooveM, at(new THREE.BoxGeometry(w + (w > d ? 0 : 0.1), 0.02, d + (w > d ? 0.1 : 0)), onDeck([cx + x, top + 0.005, cz + z])));
    }
    for (const bx of [-D.L / 3, 0, D.L / 3]) {
      put(bronzeD, at(new THREE.BoxGeometry(0.6, 0.15, D.W - 2 * fw), onDeck([cx + bx, top + 0.075, cz])));
      put(grooveM, at(new THREE.BoxGeometry(0.75, 0.02, D.W - 2 * fw), onDeck([cx + bx, top + 0.005, cz])));
    }
    // the rivets: rows between the bands, catching the light
    for (let i = 0; i < 12; i++) for (let j = 0; j < 3; j++) {
      const x = cx - D.L / 2 + 1.3 + i * ((D.L - 2.6) / 11); if ([-D.L / 3, 0, D.L / 3].some((b) => Math.abs(cx + b - x) < 0.6)) continue;
      put(bronzeD, at(new THREE.SphereGeometry(0.14, 6, 3, 0, TAU, 0, Math.PI / 2), onDeck([x, top, cz - D.W / 2 + 1.1 + j * ((D.W - 2.2) / 2)])));
    }
    // two thick ring handles on each leaf, each standing off its boss
    for (const [hx, hz] of DECK.handles[side]) {
      put(bronzeD, at(new THREE.CylinderGeometry(0.34, 0.42, 0.24, 12), onDeck([hx, top + 0.12, hz])));
      put(grooveM, at(new THREE.CylinderGeometry(0.47, 0.47, 0.02, 12), onDeck([hx, top + 0.005, hz])));
      put(bronzeM, at(new THREE.TorusGeometry(0.62, 0.13, 8, 18), onDeck([hx, top + 0.38, hz + 0.5 * Math.sign(cz)]), [Math.PI / 2 - 0.45 * Math.sign(cz), 0, 0]));
    }
  }
  // the rings in the deck, the cleats, and the four ropes that cross over the leaves; their free tails coiled toward the player
  const cleatAt = {};
  for (const k of Object.keys(DECK.rings)) {
    const [rx, rz] = DECK.rings[k], [cx, cz] = DECK.cleats[k], [tx, tz] = DECK.tails[k], s = Math.sign(cz);
    put(darkM, at(new THREE.TorusGeometry(0.28, 0.07, 5, 12), onDeck([rx, 0.2, rz]), [0, Math.PI / 2, 0]));
    put(woodM, at(new THREE.BoxGeometry(1.2, 0.22, 0.3), onDeck([cx, 0.35, cz]))); put(woodM, at(new THREE.BoxGeometry(0.25, 0.3, 0.25), onDeck([cx, 0.15, cz])));
    const edgeIn = s * (Math.abs(D.port[1]) - D.W / 2), edgeOut = s * (Math.abs(D.port[1]) + D.W / 2), ty = top + 0.2;
    const path = [[rx, 0.2, rz], [rx, ty, edgeIn], [rx, ty + 0.05, (edgeIn + edgeOut) / 2], [rx, ty, edgeOut], [rx, 0.45, cz - s * 0.2], [cx, 0.42, cz]];
    const tail = [[cx, 0.42, cz], [cx - 1, 0.1, cz - s * 0.2], [tx + 1, 0.08, tz], [tx, 0.08, tz], [tx - 0.6, 0.08, tz + s * 0.5]];
    put(ropeM, tubeOf(path.map(onDeck), 0.1, 18, 5)); put(ropeM, tubeOf(tail.map(onDeck), 0.08, 12, 5));
    cleatAt[k] = [cx, 0.42, cz];
  }
  // merge the ship's static parts: one mesh per material
  for (const [mat, list] of parts) { const g = keep(mergeGeometries(list, false)); for (const x of list) x.dispose(); const m = new THREE.Mesh(g, mat); m.name = 'h128-ship-' + (mat === bronzeM ? 'bronze' : mat === bronzeD ? 'bronze2' : mat.type); ship.add(m); }

  /* the rudder (illustration): two broad-bladed quarter rudders, each on its stout post through its housing, raked aft (the head leans
   * forward, the blade trails under the quarter); their tillers joined by a cross tiller the helmsman holds. Each rudder turns on its
   * post's axis as he leans on the bar: one instanced mesh for the two rudders, one for the three sticks (two tillers, the bar) */
  const gearM = keep(new THREE.MeshLambertMaterial({ color: '#5C4129', map: hullM.map }));
  const rudG = (() => {
    const L = [at(new THREE.CylinderGeometry(0.3, 0.38, 8.4, 9), [0, -2.0, 0]),            // the post: from its head down into the blade
      at(new THREE.CylinderGeometry(0.44, 0.44, 0.45, 9), [0, 2.25, 0]),                     // the head's cap
      at(new THREE.CylinderGeometry(0.4, 0.4, 0.4, 9), [0, 1.75, 0]),                        // the tiller's socket collar
      at(new THREE.BoxGeometry(0.3, 3.2, 0.5), [0, -3.6, 0])];                                // the blade's stock along the post
    // the blade: broad and thin, in the post's own frame (y along the post, x fore and aft), its edge rounded at the foot
    const sh = new THREE.Shape(); sh.moveTo(-0.36, 0); sh.bezierCurveTo(-1.15, -0.7, -1.3, -2.9, -1.2, -4.9); sh.quadraticCurveTo(0, -6.0, 1.2, -4.9);
    sh.bezierCurveTo(1.3, -2.9, 1.15, -0.7, 0.36, 0); sh.lineTo(-0.36, 0);
    const bg = new THREE.ExtrudeGeometry(sh, { depth: 0.22, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.07, bevelSegments: 1, curveSegments: 7 });
    bg.translate(0, -4.1, -0.11);
    const g = mergeGeometries([...L.map((x) => x.toNonIndexed()), bg.toNonIndexed()].map((x) => { x.clearGroups(); for (const k of Object.keys(x.attributes)) if (k !== 'position' && k !== 'normal' && k !== 'uv') x.deleteAttribute(k); return x; }), false);
    for (const x of L) x.dispose(); bg.dispose(); return keep(g);
  })();
  const rudders = new THREE.InstancedMesh(rudG, gearM, 2); rudders.frustumCulled = false; rudders.name = 'h128-rudders'; deck.add(rudders);
  const sticks = new THREE.InstancedMesh(keep(new THREE.CylinderGeometry(1, 1, 1, 7, 1)), gearM, 3); sticks.frustumCulled = false; sticks.name = 'h128-tiller'; deck.add(sticks);
  const TIL = DECK.tiller, BAR_Y = 2.45, TIL_UP = 1.75, TIL_L = Math.hypot(TIL[0] - DECK.steer[0][0], Math.abs(DECK.steer[0][1]) - Math.abs(TIL[1]));
  const gear = DECK.steer.map(([x, z]) => {
    const s = Math.sign(z), axis = new THREE.Vector3(0.5, 1, -s * 0.06).normalize();
    const q0 = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis);
    return { s, axis, q0, at: new THREE.Vector3(x, HOUSE_Y, z), root: new THREE.Vector3(x, HOUSE_Y, z).addScaledVector(axis, TIL_UP) };
  });
  const gm = new THREE.Matrix4(), gq = new THREE.Quaternion(), gv = new THREE.Vector3(), gs = new THREE.Vector3(), gy = new THREE.Vector3(0, 1, 0);
  const barA = new THREE.Vector3(), barB = new THREE.Vector3();
  const stick = (i, a, b, r) => { gv.subVectors(b, a); const L = gv.length(); gq.setFromUnitVectors(gy, gv.multiplyScalar(1 / L)); gm.compose(gs.addVectors(a, b).multiplyScalar(0.5), gq, _s.set(r, L, r)); sticks.setMatrixAt(i, gm); _s.set(1, 1, 1); };
  /** the gear at bar (x, y): each rudder turned on its post so its tiller meets the bar's end */
  function setGear(bx, by) {
    const th = clamp((bx - TIL[0]) / TIL_L, -0.45, 0.45);
    gear.forEach((G, i) => { gq.setFromAxisAngle(G.axis, -G.s * th).multiply(G.q0); gm.compose(G.at, gq, _s.set(1, 1, 1)); rudders.setMatrixAt(i, gm); });
    barA.set(bx, by, TIL[1]); barB.set(bx, by, TIL[2]);
    stick(0, gear[0].root, barA, 0.15); stick(1, gear[1].root, barB, 0.15);
    gv.set(0, 0, 0.35); stick(2, barA.clone().sub(gv), barB.clone().add(gv), 0.17);
    rudders.instanceMatrix.needsUpdate = true; sticks.instanceMatrix.needsUpdate = true; st.bar = bx; st.th = th;
  }

  /* contact shadows: soft dark quads on the deck (one mesh): under the leaves, each figure, the mast's foot, along the rails */
  const shadowTex = keep(canvasTex(128, 64, (g) => {
    const r = g.createRadialGradient(32, 32, 2, 32, 32, 31); r.addColorStop(0, 'rgba(0,0,0,0.75)'); r.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64);
    for (let i = 0; i < 14; i++) { g.fillStyle = `rgba(0,0,0,${0.06 + i * 0.008})`; g.fillRect(64 + i, i, 64 - 2 * i, 64 - 2 * i); }   // a soft-edged rectangle
  }, false, false));
  const sq = [], suv = [], sidx = [];
  const quad = (x, z, sx, sz, rect, yaw = 0) => {
    const n = sq.length / 3, c = Math.cos(yaw), s = Math.sin(yaw), u0 = rect ? 0.5 : 0, u1 = rect ? 1 : 0.5;
    for (const [a, b, u, v] of [[-1, -1, u0, 0], [1, -1, u1, 0], [1, 1, u1, 1], [-1, 1, u0, 1]]) { const lx = a * sx / 2, lz = b * sz / 2; sq.push(x + lx * c - lz * s, 0.03, z + lx * s + lz * c); suv.push(u, v); }
    sidx.push(n, n + 2, n + 1, n, n + 3, n + 2);
  };
  for (const side of ['port', 'stbd']) quad(D[side][0], D[side][1], D.L + 1.4, D.W + 1.4, true);
  quad(MAST.at[0], MAST.at[1], 3, 3, false);
  for (const p of [DECK.nicanor, DECK.helm, ...DECK.sailors]) quad(p[0], p[1], 2.6, 2.6, false);
  for (const s of [-1, 1]) for (let x = HULL.stern + 4; x < HULL.stem - 3; x += 4) { const hb = hullAt(x).hb; quad(x, s * (hb - 0.5), 4.4, 1.6, true); }
  const shG = keep(new THREE.BufferGeometry()); shG.setAttribute('position', new THREE.Float32BufferAttribute(sq, 3)); shG.setAttribute('uv', new THREE.Float32BufferAttribute(suv, 2)); shG.setIndex(sidx);
  const shadows = new THREE.Mesh(shG, keep(new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false, color: '#000000', polygonOffset: true, polygonOffsetFactor: -2 })));
  shadows.renderOrder = 1; shadows.name = 'h128-contact'; deck.add(shadows);

  /* the people: Nicanor (a merchant's robe and head cloth, large) aft of the doors facing forward; six sailors at work */
  const actors = createActors({ scene: deck, ground: () => 0, max: 12, maxItems: 8 });
  const nic = actors.add('pilgrim', DECK.nicanor[0], DECK.nicanor[1], { y: 0, yaw: Math.PI / 2, scale: 1.18, col: '#6E4A2E', col2: '#D9C9A3', young: false });
  const yardDeck = [MAST.at[0] + 0.6, yardY - DECK_Y - 0.4, 1.2];   // where the brail the hauler pulls comes down from the yard
  const crew = DECK.sailors.map(([x, z, job], i) => {
    const a = actors.add('worker', x, z, { y: 0, scale: 0.98 + (i % 3) * 0.03, col: ['#8C6A4E', '#6F5A44', '#A0805C', '#5E4C3A', '#7E6248', '#94765A'][i] });
    const to = job === 'lash' ? cleatAt[z < 0 ? 'portAft' : 'stbdAft'] : job === 'steer' ? steerLash[z < 0 ? 0 : 1] : job === 'haul' ? yardDeck : [x, 0, z * 2];   // the bailers face the rail
    a.yaw = Math.atan2(to[0] - x, to[2] - z); a.job = job; a.to = to; a.off = i * 0.37;
    return a;
  });
  // the seventh sailor: the helmsman at the cross tiller, both hands on the bar, facing forward
  const helm = actors.add('worker', DECK.helm[0], DECK.helm[1], { y: 0, yaw: Math.PI / 2, scale: 1.02, col: '#7B5A3E' });
  helm.job = 'helm'; helm.pit = 1.15;
  // the bailers' buckets (one instanced mesh) and the water they throw (points), the lines in the working hands (one line mesh)
  const bucketG = keep(mergeGeometries([
    new THREE.LatheGeometry([[0.001, -0.45], [0.2, -0.45], [0.25, -0.05], [0.23, -0.04], [0.18, -0.42], [0.001, -0.42]].map(([a, b]) => new THREE.Vector2(a, b)), 9),
    at(new THREE.TorusGeometry(0.24, 0.025, 4, 10, Math.PI), [0, -0.05, 0])]));
  const buckets = new THREE.InstancedMesh(bucketG, keep(new THREE.MeshLambertMaterial({ color: '#6E5232' })), 2); buckets.frustumCulled = false; deck.add(buckets);
  const NSP = 90, spP = new Float32Array(NSP * 3).fill(-999), spV = new Float32Array(NSP * 3), spL = new Float32Array(NSP);
  const spG = keep(new THREE.BufferGeometry()); spG.setAttribute('position', new THREE.BufferAttribute(spP, 3));
  const spray = new THREE.Points(spG, keep(new THREE.PointsMaterial({ color: '#D7E7EA', size: 0.32, transparent: true, opacity: 0.85, depthWrite: false })));
  spray.frustumCulled = false; deck.add(spray);
  const hl = new Float32Array(5 * 6), hlG = keep(new THREE.BufferGeometry()); hlG.setAttribute('position', new THREE.BufferAttribute(hl, 3));
  const handLines = new THREE.LineSegments(hlG, keep(new THREE.LineBasicMaterial({ color: '#8A6E46' }))); handLines.frustumCulled = false; deck.add(handLines);

  /* the environment the bronze reflects (a neutral sky, captured once); its strength follows the weather */
  let envRT = null;
  try {
    const pm = new THREE.PMREMGenerator(renderer), es = new THREE.Scene();
    const em = new THREE.ShaderMaterial({ uniforms: { uSunDir: { value: SUN_BRK.clone() } }, vertexShader: SKY_VS, fragmentShader: ENV_FS, side: THREE.BackSide, depthWrite: false });
    const ed = new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), em); es.add(ed);
    envRT = pm.fromScene(es, 0, 0.5, 400); bronzeM.envMap = bronzeD.envMap = envRT.texture;   // (the bronze only: the wood and the figures need none)
    ed.geometry.dispose(); em.dispose(); pm.dispose();
  } catch (e) { /* no environment: the bronze is lit by the sun and the fill only */ }

  /* the weather and the state */
  const lightDir = SUN_CLEAR.clone();
  const st = { t: 0, k: 0, brk: 0, hole: 0, furl: 0, bow: 0, bowImm: 0, push: 0, bar: 0, th: 0, swells: [], shipX: 0, heave: 0, pitch: 0, roll: 0, lift: 0, cam: 'play', camU: 0, round: 0, scriptMs: 0, sailH: 0, head: null };
  const cA = new THREE.Color(), cB = new THREE.Color();
  function blend(key, u) {
    // clear → storm by k, then toward the break's palette by brk
    cA.set(SKY.clear[key]).lerp(cB.set(SKY.storm[key]), st.k); if (st.brk > 0) cA.lerp(cB.set(SKY.brk[key]), st.brk); return u ? u.copy(cA) : cA;
  }
  const num = (key) => mix(mix(SKY.clear[key], SKY.storm[key], st.k), SKY.brk[key], st.brk);
  function applyWeather() {
    blend('top', seaU.uTop.value); blend('hor', seaU.uHor.value); blend('sea', seaU.uSea.value); blend('deep', seaU.uDeep.value);
    blend('sun', seaU.uSun.value); blend('fog', seaU.uFog.value); blend('cloud', seaU.uCloud.value); blend('cloudD', seaU.uCloudD.value);
    blend('scat', seaU.uScat.value); blend('foam', seaU.uFoam.value); blend('fogSea', seaU.uFogSea.value); blend('pale', seaU.uPale.value);
    seaU.uCover.value = num('cover'); seaU.uBrk.value = st.brk;
    // the storm's ceiling: its front comes in from port and passes over the ship as the storm grows (and stays closed in the break)
    const kf = clamp(st.k + st.brk, 0, 1); seaU.uFront.value = mix(-30000, 14000, kf * kf * (3 - 2 * kf));
    const sd = clamp(st.brk + st.k * 0.4, 0, 1);
    lightDir.copy(SUN_CLEAR).lerp(SUN_BRK, sd).normalize(); seaU.uSkyDir.value.copy(SKY_CLEAR).lerp(SKY_BRK, sd).normalize();
    // the break: the bright patch runs over the water from under the hole to the doors; the hole stands on the sun's ray above it
    const u = st.hole, P = seaU.uPatch.value, sk = seaU.uSkyDir.value;
    P.x = mix(LIGHT.from[0], DECK.doors.port[0], u); P.y = mix(LIGHT.from[1], 0, u);
    seaU.uHoleD.value.copy(sk).add(_up).normalize(); seaU.uPatchI.value = st.brk;
    const ox = P.x - DECK.doors.port[0], onShip = Math.exp(-(ox * ox + P.y * P.y) / (LIGHT.r * LIGHT.r * 1.4));
    seaU.uSunI.value = num('sunI') / 3 * (st.brk > 0 ? mix(1, 0.45 + 0.55 * onShip, st.brk) : 1); seaU.uK.value = st.k;
    sun.color.copy(seaU.uSun.value); sun.intensity = num('sunI') * (st.brk > 0 ? mix(1, 0.4 + 0.6 * onShip, st.brk) : 1);
    hemi.color.copy(blend('hemiS')); hemi.groundColor.copy(blend('hemiG')); hemi.intensity = num('hemiI');
    scene.fog.color.copy(seaU.uFog.value); scene.fog.near = mix(160, 60, st.k); scene.fog.far = mix(1600, 520, st.k * (1 - st.brk * 0.5));
    seaU.uFogD.value = mix(0.0009, 0.0042, st.k * (1 - st.brk * 0.4));
    // the bronze: in the storm darker and wet (a sharper, colder sheen), in the break bright but never blank
    const wet = st.k * (1 - st.brk * 0.6);
    bronzeM.envMapIntensity = mix(0.95, 0.62, wet) + st.brk * 0.08; bronzeD.envMapIntensity = bronzeM.envMapIntensity * 1.1;
    bronzeM.roughness = mix(0.27, 0.15, wet) + st.brk * 0.05; bronzeD.roughness = mix(0.3, 0.19, wet);
    bronzeM.color.set(BRONZE).multiplyScalar(mix(1, 0.8, wet)); bronzeD.color.set(BRONZE_D).multiplyScalar(mix(1, 0.8, wet));
    renderer.toneMappingExposure = mix(0.95, 1.15, st.k) - st.brk * 0.08;
  }
  const sOpt = { k: 0, swells: null, ship: [0, 0] };
  const sample = (x, z) => seaAt(x + st.shipX, z, st.t, sOpt).y;
  const smp = { bow: [HULL.stem - 8, 0], stern: [HULL.stern + 8, 0], port: [HULL.wide, -HULL.beam / 2 + 1], stbd: [HULL.wide, HULL.beam / 2 - 1], mid: [HULL.wide, 0] };
  // the deck's edge, all round: kept above the water under it
  const rim = []; for (let i = 0; i <= 12; i++) { const x = mix(HULL.stern + 2, HULL.stem - 1.5, i / 12), hb = hullAt(x).hb * 0.96; rim.push(new THREE.Vector3(x, DECK_Y, -hb), new THREE.Vector3(x, DECK_Y, hb)); }
  const _v = new THREE.Vector3();
  function pose(dt) {
    sOpt.k = st.k; sOpt.swells = st.swells; sOpt.ship = [st.shipX, 0];
    const yb = sample(...smp.bow), ys = sample(...smp.stern), yp = sample(...smp.port), yq = sample(...smp.stbd), ym = sample(...smp.mid);
    const heave = (yb + ys + yp + yq + 2 * ym) / 6, pitch = Math.atan2(yb - ys, smp.bow[0] - smp.stern[0]), roll = Math.atan2(yq - yp, smp.stbd[1] - smp.port[1]);
    const a = dt > 0 ? 1 - Math.exp(-dt / 0.45) : 1;   // the hull's inertia: she follows the water a little late
    st.heave += (heave - st.heave) * a; st.pitch += (pitch - st.pitch) * a; st.roll += (roll - st.roll) * a;
    ship.position.set(0, st.heave - SIT, 0); ship.rotation.set(-st.roll, 0, st.pitch, 'YZX'); ship.updateMatrixWorld();
    // no sheet of sea on the deck: where the water would stand over the deck's edge she rides up on it (her buoyancy, at once)
    let lift = 0;
    for (const p of rim) { _v.copy(p).applyMatrix4(ship.matrixWorld); lift = Math.max(lift, sample(_v.x, _v.z) + DRY - _v.y); }
    st.lift = lift > 0 ? lift : 0; if (lift > 0) { ship.position.y += lift; ship.updateMatrixWorld(); }
    // the bow coming down: how fast her forefoot drops toward the water under it (foam thrown out where it slams)
    _v.set(HULL.stem - 3, 0, 0).applyMatrix4(ship.matrixWorld); const imm = sample(_v.x, _v.z) - _v.y;
    if (dt > 0) { const v = (imm - st.bowImm) / dt; st.bow = Math.max(st.bow * Math.exp(-dt / 0.7), clamp(v / 3, 0, 1) * clamp(imm + 2.5, 0, 1)); }
    st.bowImm = imm; seaU.uBow.value = st.bow;
  }
  /* the swells in the shader: up to three, the nearest first */
  function swellsToShader() {
    const L = (st.swells || []).map((s) => ({ s, p: swellPos(s, st.t) })).filter((o) => o.p > -SEA_HALF * 2.2 && o.p < SEA_HALF * 1.8).sort((a, b) => Math.abs(a.p) - Math.abs(b.p)).slice(0, 3);
    for (let i = 0; i < 3; i++) {
      const o = L[i], v = seaU.uSw.value[i];
      if (!o) { v.set(0, 0, 0, 0); continue; }
      const d = headDir(o.s.head); v.set(d[0], d[1], o.p, o.s.H || SWELL.H); seaU.uSwW.value[i] = o.s.w || SWELL.w;
    }
  }
  /* the crew at work: motion cycles on the sea's clock (rule: whole figures working for real, no idle loop of a canned pose)
   *   lash  — two at the doors' aft lashings: they heave on the tail as a swell comes, and check it now and then between
   *   bail  — two bailing over the rail: scoop, lift, throw (the water leaves the bucket), back
   *   steer — one at the steering oars' lashing: pulling the turns tight, hand after hand
   *   haul  — one hauling the brail hand over hand */
  const L2 = new THREE.Vector3(), R2 = new THREE.Vector3(), M2 = new THREE.Vector3();
  const bm = new THREE.Matrix4(), bq = new THREE.Quaternion(), be = new THREE.Euler(0, 0, 0, 'YXZ'), bs = new THREE.Vector3(1.1, 1.1, 1.1);
  let spN = 0;
  const throwWater = (a, p) => {
    const fx = Math.sin(a.yaw), fz = Math.cos(a.yaw);
    for (let k = 0; k < 22; k++) { const i = spN++ % NSP, r = Math.sin(i * 12.9898 + st.t) * 0.5 + 0.5, r2 = Math.sin(i * 78.233 + st.t * 3) * 0.5 + 0.5;
      spP.set([p.x + fx * 0.3, p.y + 0.1, p.z + fz * 0.3], i * 3); spV.set([fx * (3 + 2 * r) + (r2 - 0.5) * 1.4, 2.5 + 2 * r2, fz * (3 + 2 * r) + (r - 0.5) * 1.4], i * 3); spL[i] = 0.7 + 0.5 * r; }
  };
  const set4 = (A, a, b, c, d) => { A[0] = a; A[1] = b; A[2] = c; A[3] = d; };
  let nicPose = '';
  const SIDE = { port: 1, stbd: -1, bow: 0.6, stern: -0.6 };   // which way he leans on the bar for a swell from each side
  function work(dt) {
    const T = st.t, near = (st.swells || []).reduce((m, s) => Math.max(m, Math.exp(-Math.pow(swellPos(s, T) / 30, 2))), 0), hard = Math.max(near, st.k * 0.6);
    let bi = 0, li = 0;
    for (const a of crew) {
      if (a.job === 'lash') {
        const P = hard > 0.3 ? 1.3 : 3.6, ph = (T / P + a.off) % 1, pull = ph < 0.4 ? Math.sin((ph / 0.4) * Math.PI) : 0, f = hard > 0.3 ? 1 : 0.5;
        set4(a.armT, 1.0 + 0.35 * pull * f, -0.22, 1.05 + 0.45 * pull * f, -0.22); a.bowT = 0.3 - 0.45 * pull * f; a.knT = 0.15 + 0.2 * hard;
      } else if (a.job === 'bail') {
        const P = 2.6, ph = (T / P + a.off) % 1, prev = ((T - dt) / P + a.off) % 1;
        let arms = 1.2, bow = 0.15, kn = 0, tilt = 0.2;
        if (ph < 0.35) { const u = ph / 0.35; arms = mix(1.2, 0.55, Math.sin(u * Math.PI / 2)); bow = mix(0.2, 1.05, Math.sin(u * Math.PI)); kn = 0.45 * Math.sin(u * Math.PI); tilt = 0.9 * Math.sin(u * Math.PI); }   // scoop
        else if (ph < 0.6) { const u = (ph - 0.35) / 0.25; arms = mix(0.7, 1.7, u); bow = mix(0.5, 0.05, u); }                                                                   // lift
        else if (ph < 0.8) { const u = (ph - 0.6) / 0.2; arms = mix(1.7, 2.4, Math.sin(u * Math.PI / 2)); bow = -0.05; tilt = mix(0.1, 1.9, u); }                             // throw
        else { const u = (ph - 0.8) / 0.2; arms = mix(2.2, 1.2, u); tilt = mix(1.6, 0.2, u); }                                                                                 // back
        set4(a.armT, arms, -0.3, arms, -0.3); a.bowT = bow; a.knT = kn;
        actors.handWorld(a, 1, L2); actors.handWorld(a, -1, R2); M2.copy(L2).add(R2).multiplyScalar(0.5);
        if (prev < 0.68 && ph >= 0.68 && st.k > 0.15) throwWater(a, M2);
        be.set(tilt, a.yaw, 0); bm.compose(M2, bq.setFromEuler(be), bs); buckets.setMatrixAt(bi++, bm);
        continue;
      } else if (a.job === 'steer') {
        const ph = T / 1.8 + a.off, s = Math.sin(ph * TAU);
        set4(a.armT, 1.0 + 0.45 * s, -0.25, 1.0 - 0.45 * s, -0.25); a.bowT = 0.4 + 0.12 * Math.abs(s); a.knT = 0.2;
      } else if (a.job === 'haul') {
        const ph = T / 1.1 + a.off, s = Math.sin(ph * TAU);
        set4(a.armT, 1.9 + 0.75 * s, -0.12, 1.9 - 0.75 * s, -0.12); a.bowT = 0.12 + 0.1 * Math.sin(ph * TAU * 2); a.knT = 0.1;
      }
      // the line in his hands, to what he works on
      actors.handWorld(a, 1, L2); actors.handWorld(a, -1, R2); M2.copy(L2).add(R2).multiplyScalar(0.5);
      hl.set([M2.x, M2.y, M2.z, a.to[0], a.to[1], a.to[2]], li * 6); li++;
    }
    buckets.count = bi; buckets.instanceMatrix.needsUpdate = true;
    hlG.attributes.position.needsUpdate = true; hlG.setDrawRange(0, li * 2);
    // the water thrown: it flies out over the rail and falls
    for (let i = 0; i < NSP; i++) { if (spL[i] <= 0) continue; spL[i] -= dt; const j = i * 3; spV[j + 1] -= H128.G * dt;
      spP[j] += spV[j] * dt; spP[j + 1] += spV[j + 1] * dt; spP[j + 2] += spV[j + 2] * dt; if (spL[i] <= 0) spP[j + 1] = -999; }
    spG.attributes.position.needsUpdate = true;
    // the helmsman: he leans on the bar against each swell (pushing as it lifts her quarter, easing back after), and with the roll
    let push = 0.3 * Math.sin(T * 0.47 + 0.6) * (0.35 + 0.65 * st.k) + clamp(st.roll * 3, -0.4, 0.4);
    for (const sw of st.swells || []) { const p = swellPos(sw, T) + 8, sd = SIDE[sw.head] || 0; push += sd * Math.exp(-(p * p) / 676) * (p < 0 ? 1 : -0.5); }
    push = clamp(push, -1, 1); st.push += (push - st.push) * Math.min(1, dt * 2.5);
    const P = st.push;
    helm.bowT = 0.16 + 0.42 * Math.max(0, P) - 0.14 * Math.max(0, -P) + 0.08 * st.k; helm.knT = 0.22 + 0.22 * Math.abs(P) + 0.1 * st.k;
    set4(helm.armT, helm.pit, 0.02, helm.pit, 0.02);
    const want = hard > 0.3 ? 'lean' : 'stand'; if (nicPose !== want) { nicPose = want; actors.pose(nic, want); }
    actors.update(dt);
    // his hands hold the bar: it lies where they are (the arms find the bar's height), and the rudders turn with it
    actors.handWorld(helm, 1, L2); actors.handWorld(helm, -1, R2); M2.copy(L2).add(R2).multiplyScalar(0.5);
    helm.pit = clamp(helm.pit + (BAR_Y - M2.y) * (dt > 0 ? 0.9 : 0), 0.4, 1.7);
    setGear(M2.x + 0.12, clamp(M2.y, BAR_Y - 0.3, BAR_Y + 0.3));
  }
  /* the cameras: play (behind and above Nicanor, along the deck), lift (back and up: the whole ship and the next swell), round */
  const rig = new THREE.Object3D(); scene.add(rig);
  const vP = new THREE.Vector3(), vT = new THREE.Vector3(), vP2 = new THREE.Vector3(), vT2 = new THREE.Vector3();
  function camPose(name, out, tgt) {
    const y0 = st.heave + st.lift;
    if (name === 'round') {
      const R = CAM.round, a = st.round;
      out.set(R.t[0] + Math.cos(a) * -R.R, R.y + y0 * 0.3, R.t[2] + Math.sin(a) * R.R); tgt.set(R.t[0], R.t[1] + y0 * 0.5, R.t[2]); return;
    }
    const c = name === 'lift' ? CAM.lift : CAM.play, f = name === 'lift' ? 0.25 : 0.6;
    rig.position.set(0, y0 * (name === 'lift' ? 0.4 : 0.85), 0); rig.rotation.set(-st.roll * f * 0.4, 0, st.pitch * f, 'YZX'); rig.updateMatrixWorld();
    out.set(...c[0]); tgt.set(...c[1]);
    if (name === 'lift' && st.head) {   // turned round the ship to the side the swell runs to, looking back at where it comes from
      const d = headDir(st.head), r = Math.atan2(d[1], d[0]) - Math.PI, cs = Math.cos(r), sn = Math.sin(r);
      for (const v of [out, tgt]) { const x = v.x, z = v.z; v.x = x * cs - z * sn; v.z = x * sn + z * cs; }
    }
    out.y += DECK_Y; rig.localToWorld(out); tgt.y += DECK_Y; rig.localToWorld(tgt);
  }
  function placeCam() {
    camPose(st.cam, vP, vT);
    if (st.camU > 0 && st.cam !== 'lift') { camPose('lift', vP2, vT2); vP.lerp(vP2, st.camU); vT.lerp(vT2, st.camU); }
    camera.position.copy(vP); camera.lookAt(vT);
    sky.position.copy(camera.position); rainU.uCam.value.copy(camera.position); seaU.uCam.value.copy(camera.position);
  }

  applyWeather(); setStays(0); placeCam();
  const api = {
    scene, camera, ship, deck, actors, nicanor: nic, crew,
    get state() { return st; },
    /** the weather and the play: k the storm (0..1), brk the cloud break (0..1), swells [{ head, t0, H?, w?, c? }] */
    set(o = {}) {
      if (o.k != null) st.k = clamp(o.k, 0, 1); if (o.brk != null) st.brk = clamp(o.brk, 0, 1); if (o.swells) st.swells = o.swells;
      if (o.furl != null) st.furl = clamp(o.furl, 0, 1); if (o.hole != null) st.hole = clamp(o.hole, 0, 1);
      applyWeather();
    },
    view(name, u = 0, round = 0, head = null) { st.cam = name; st.camU = clamp(u, 0, 1); st.round = round; st.head = head; },
    resize(w, h) { camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix();
      sprU.uPx.value = 0.55 * h * renderer.getPixelRatio() / (2 * Math.tan(camera.fov * DEG / 2)); },
    /** t: the sea's clock (s); dt: the step (s) for the ship's inertia and the figures (0: snap) */
    update(t, dt) {
      const t0 = performance.now();
      st.t = t; st.shipX = t * SAIL_V; seaU.uT.value = t; seaU.uShip.value.set(st.shipX, 0);
      swellsToShader(); pose(dt);
      const sh = mix(MAST.h * 0.6, 1.4, st.furl); if (Math.abs(sh - st.sailH) > 0.05) { st.sailH = sh; sail.scale.y = sh; setStays(sh); }
      spray2.visible = st.k > 0.3;
      rain.visible = st.k > 0.35 && st.brk < 0.6; rainU.uK.value = clamp((st.k - 0.35) / 0.4, 0, 1) * (1 - st.brk);
      sun.position.copy(lightDir).multiplyScalar(200); sun.target.position.set(0, 0, 0);
      work(dt || 0); placeCam();
      st.scriptMs = performance.now() - t0;
    },
    render() { renderer.render(scene, camera); },
    /** the water's height under a point of the sea's frame, now (the ship, the doors and the camera use the same) */
    waterAt(x, z) { return seaAt(x + st.shipX, z, st.t, { k: st.k, swells: st.swells, ship: [st.shipX, 0] }).y; },
    /** the lowest margin of the deck's edge over the water now (amot; ≥ DRY when nothing stands on the deck) */
    deckMargin() { let m = Infinity; for (const p of rim) { _v.copy(p).applyMatrix4(ship.matrixWorld); m = Math.min(m, _v.y - api.waterAt(_v.x, _v.z)); } return m; },
    dbg() { return { t: +st.t.toFixed(2), k: +st.k.toFixed(2), brk: +st.brk.toFixed(2), heave: +st.heave.toFixed(2), lift: +st.lift.toFixed(2), pitch: +(st.pitch / DEG).toFixed(2), roll: +(st.roll / DEG).toFixed(2), cam: st.cam, scriptMs: +st.scriptMs.toFixed(3) }; },
    dispose() { for (const o of own) o.dispose && o.dispose(); if (envRT) envRT.dispose(); scene.clear(); },
  };
  return api;
}
