/* ── build 128 ── h128/sea3d.js — stage 06's sea (brief §3): one Gerstner sea whose sum is the model's seaAt (the same WAVES, the same
 * swells, evaluated in the vertex shader here and in JS for the ship), the merchant ship (illustration) with the two bronze doors
 * lashed on her deck, Nicanor and six sailors at work, a sky that goes from a clear late afternoon to a green-grey storm and to a
 * cloud break with one shaft of light on the bronze, rain in the storm only, and one golden light (dimmed and cooled in the storm).
 *
 * Its own THREE.Scene, drawn by the game's renderer: nothing of the Mount is drawn or touched while the sea is on screen, so the
 * Mount needs no restoring. Every place on the ship is the book's (BOOK.s06.sea: hull, mast, deck, cam); the sea's frame has the
 * ship at its origin, x toward the bow, z to starboard, y up; the ship sails on through the waves (the sea's field slides past).
 *
 *   const S = createSea3d({ renderer });   S.set({ k, brk, swells, furl });   S.update(t, dt);   S.view('play'|'lift'|'round', u);
 *   S.render();   S.dbg() → { heave, pitch, roll, k, brk, scriptMs }
 */
import * as THREE from 'three';
import { BOOK } from '../world/grid.js';
import { WAVES, SWELL, H128, seaAt, headDir, swellPos } from './model.js';
import { createActors } from '../../actors.js';

const SEA = BOOK.s06.sea, HULL = SEA.hull, DECK = SEA.deck, MAST = SEA.mast, CAM = SEA.cam;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const mix = (a, b, u) => a + (b - a) * u;
const DEG = Math.PI / 180;
// sizes of the scene (no places): the sea's dense square, its far skirt, the sky's radius, the ship's way through the waves
const SEA_HALF = 200, SEA_FAR = 3200, SEA_SEG = 96, SEA_DENSE = 84, SKY_R = 4000, SAIL_V = 2.2;
const DECK_Y = HULL.free;             // the deck's planks: the hull's freeboard above the water at rest
const BRONZE = '#D49A50';             // Nicanor's bronze: yellow and bright, browner and less saturated than the gold of the vessels (#E3B64E)
// the light (one golden light: the world's dusk sun colour; cooled and dimmed in the storm) and the skies (illustration)
const SKY = {
  clear: { top: '#4C74B4', hor: '#F2C893', sea: '#1B4F63', deep: '#0C2F40', sun: '#FFBA6E', sunI: 2.7, hemiS: '#B4C4DC', hemiG: '#8A7660', hemiI: 1.7, fog: '#E9C9A2', cloud: '#F4E4CE', cover: 0.28 },
  storm: { top: '#27332F', hor: '#5E6B63', sea: '#24403A', deep: '#0F211D', sun: '#A8B8BC', sunI: 0.55, hemiS: '#7E8D88', hemiG: '#46504B', hemiI: 1.25, fog: '#55625B', cloud: '#3E4944', cover: 0.92 },
  brk: { top: '#3A4C58', hor: '#B9A88A', sea: '#22465A', deep: '#0E2A38', sun: '#FFC27A', sunI: 2.6, hemiS: '#9AA6AE', hemiG: '#6A6052', hemiI: 1.45, fog: '#8C8E84', cloud: '#59625E', cover: 0.7 },
};
const C = (h) => new THREE.Color(h);
// the sun's direction (toward the sun): low ahead-left in the late afternoon; in the break it shines through the gap above
const SUN_CLEAR = new THREE.Vector3(0.8, 0.3, -0.52).normalize(), SUN_BRK = new THREE.Vector3(0.8, 0.42, -0.45).normalize();

/* ─────────────── the sea's shaders: the model's sum (gerst + swells), the same constants ─────────────── */
const NW = WAVES.length;
const SEA_VS = /* glsl */`
  uniform float uT, uK, uFade0, uFade1;
  uniform vec2 uShip;
  uniform vec4 uW[${NW}];      // (k, omega, dir x, dir z)
  uniform vec4 uWA[${NW}];     // (A calm, A storm, Q, 0)
  uniform vec4 uSw[3];         // (dir x, dir z, the crest's distance past the ship, H)
  uniform float uSwW[3];
  varying vec3 vWP; varying vec3 vN; varying float vSteep; varying float vSw; varying float vBack; varying float vFront;
  float sech2(float v) { float c = cosh(v); return 1.0 / (c * c); }
  void main() {
    vec3 p = position;                       // the plane lies in x, z (rotated in JS); the sea's frame: the ship at the origin
    float d = length(p.xz), fade = 1.0 - smoothstep(uFade0, uFade1, d);
    vec2 g = p.xz + uShip;                   // the waves' own frame (the ship sails through it)
    float dx = 0.0, dz = 0.0, y = 0.0, sx = 0.0, sz = 0.0;
    for (int i = 0; i < ${NW}; i++) {
      vec4 W = uW[i]; vec4 WA = uWA[i];
      float A = mix(WA.x, WA.y, uK) * fade, th = W.x * dot(W.zw, g) - W.y * uT, c = cos(th), s = sin(th);
      float q = WA.z / ${NW.toFixed(1)};
      dx += q * W.z * A * c; dz += q * W.w * A * c; y += A * s;
      sx += A * W.x * W.z * c; sz += A * W.x * W.w * c;
    }
    float sw = 0.0, back = 0.0, front = 0.0, steep0 = length(vec2(sx, sz));
    for (int j = 0; j < 3; j++) {
      vec4 S = uSw[j]; if (S.w <= 0.0) continue;
      float u = dot(p.xz, S.xy) - S.z, k = u < 0.0 ? uSwW[j] * 1.6 : uSwW[j] * 0.7, v = u / k;
      float f = 1.0 - smoothstep(uFade0 * 1.3, uFade1, d);
      float h = S.w * sech2(v) * f, gr = -2.0 * S.w * sech2(v) * tanh(v) / k * f;
      y += h; sx += gr * S.x; sz += gr * S.y;
      sw = max(sw, h / S.w); back = max(back, u < 0.0 ? h / S.w : 0.0); front = max(front, u >= 0.0 ? h / S.w : 0.0);
    }
    vec3 wp = vec3(p.x + dx, y, p.z + dz);
    vN = normalize(vec3(-sx, 1.0, -sz)); vSteep = steep0; vSw = sw; vBack = back; vFront = front;
    vec4 w4 = modelMatrix * vec4(wp, 1.0); vWP = w4.xyz;
    gl_Position = projectionMatrix * viewMatrix * w4;
  }`;
const SEA_FS = /* glsl */`
  uniform vec3 uSea, uDeep, uTop, uHor, uSun, uFog; uniform vec3 uSunDir; uniform float uSunI, uT, uK, uFogD;
  varying vec3 vWP; varying vec3 vN; varying float vSteep; varying float vSw; varying float vBack; varying float vFront;
  void main() {
    // a little ripple on top of the waves (three sines: no texture)
    vec2 q = vWP.xz;
    float dist = length(cameraPosition - vWP), near = exp(-dist / 55.0) * (0.6 + 0.8 * uK);
    vec2 rp = vec2(sin(dot(q, vec2(0.83, 0.31)) + uT * 1.9) + sin(dot(q, vec2(-0.37, 1.13)) * 1.31 - uT * 1.4) * 0.7,
                   sin(dot(q, vec2(0.21, -0.97)) * 1.17 + uT * 1.6) + sin(dot(q, vec2(1.41, 0.63)) * 0.93 - uT * 2.2) * 0.6);
    vec3 n = normalize(vN + vec3(rp.x, 0.0, rp.y) * 0.035 * near);
    vec3 V = normalize(cameraPosition - vWP);
    float fr = 0.03 + 0.97 * pow(1.0 - max(dot(n, V), 0.0), 5.0);
    vec3 R = reflect(-V, n);
    vec3 sky = mix(uHor, uTop, pow(clamp(R.y, 0.0, 1.0), 0.6));
    vec3 body = mix(uDeep, uSea, clamp(0.5 + vWP.y * 0.12, 0.0, 1.0));
    body = mix(body, uDeep * 0.6, vBack * 0.55);                              // a swell's long back: dark
    vec3 col = mix(body, sky, fr);
    float sp = pow(max(dot(R, uSunDir), 0.0), mix(180.0, 60.0, uK));
    col += uSun * sp * uSunI * 0.9;
    // foam: where the waves are steep, and on a swell's crest and front (pale)
    float br = 0.5 + 0.5 * sin(dot(q, vec2(0.13, 0.29)) + uT * 0.5) * sin(dot(q, vec2(-0.23, 0.11)) - uT * 0.3);
    float foam = smoothstep(0.38, 0.62, vSteep) * (0.25 + 0.75 * uK) * (0.5 + 0.5 * br) + smoothstep(0.86, 0.99, vFront) * (0.55 + 0.35 * br);
    col = mix(col, vec3(0.86, 0.9, 0.88) * (0.55 + 0.45 * uSunI / 3.0), clamp(foam, 0.0, 0.9));
    float fg = 1.0 - exp(-dist * uFogD);
    col = mix(col, uFog, clamp(fg, 0.0, 1.0));
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;
/* the sky: a gradient, the sun, and clouds by a small value noise (3 octaves); in the break a gap round the sun with a bright rim */
const SKY_VS = /* glsl */`varying vec3 vD; void main() { vD = normalize(position); vec4 p = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }`;
const SKY_FS = /* glsl */`
  uniform vec3 uTop, uHor, uSun, uFog, uCloud; uniform vec3 uSunDir; uniform float uT, uCover, uBrk, uK;
  varying vec3 vD;
  float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float vn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h21(i), h21(i + vec2(1.0, 0.0)), f.x), mix(h21(i + vec2(0.0, 1.0)), h21(i + vec2(1.0, 1.0)), f.x), f.y); }
  void main() {
    vec3 d = normalize(vD); float h = d.y;
    vec3 col = mix(uHor, uTop, pow(clamp(h, 0.0, 1.0), 0.5));
    if (h < 0.0) col = mix(uHor, uFog, clamp(-h * 6.0, 0.0, 1.0));
    float sd = max(dot(d, uSunDir), 0.0);
    col += uSun * (pow(sd, 900.0) * 6.0 + pow(sd, 12.0) * 0.35) * (1.0 - uK * 0.85);
    // clouds on a plane above: a slow drift, thicker in the storm; a gap round the sun in the break
    vec2 uv = d.xz / (max(h, 0.0) + 0.14) * 1.3 + vec2(uT * 0.012, uT * 0.004);
    float n = vn(uv) * 0.55 + vn(uv * 2.3 + 3.1) * 0.3 + vn(uv * 5.1 - 1.7) * 0.15;
    float gap = uBrk * smoothstep(0.86, 0.97, sd);
    float cover = clamp(uCover - gap * 1.2, 0.0, 1.0);
    float c = smoothstep(1.0 - cover, 1.0 - cover + 0.28, n) * smoothstep(-0.02, 0.12, h);
    vec3 cc = mix(uCloud, uCloud * 0.62, smoothstep(0.5, 1.0, n));
    cc += uSun * pow(sd, 6.0) * (0.25 + 0.9 * uBrk) * (1.0 - c * 0.5);           // lit edges toward the sun (the break's rim)
    col = mix(col, cc, c * 0.92);
    col = mix(col, uFog, smoothstep(0.08, -0.02, h) * 0.85);                     // the haze at the horizon
    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;
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
/* the shaft of light through the break: a tapered open cone, added light, soft at its edges and its ends */
const SHAFT_VS = /* glsl */`varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const SHAFT_FS = /* glsl */`uniform float uI; uniform vec3 uCol; varying vec2 vUv;
  void main() { float e = sin(vUv.x * 3.14159 * 2.0) * 0.5 + 0.5; float a = smoothstep(0.0, 0.12, vUv.y) * smoothstep(1.0, 0.5, vUv.y) * (0.35 + 0.65 * e);
    gl_FragColor = vec4(uCol * a * uI * 0.11, 1.0); }`;

/* ─────────────── the ship (illustration): lofted hull, posts, wales, deck, rail, mast, yard, sail, steering oars ─────────────── */
function hullAt(x) {
  // the half-beam, the sheer (the gunwale's height) and the keel at station x
  const fore = x > HULL.wide, t = fore ? (x - HULL.wide) / (HULL.stem - HULL.wide) : (HULL.wide - x) / (HULL.wide - HULL.stern);
  const hb = (HULL.beam / 2) * Math.pow(Math.max(0, 1 - Math.pow(t, fore ? 2.0 : 2.4)), fore ? 0.62 : 0.5);
  const sheer = HULL.free + (fore ? HULL.sheer[1] : HULL.sheer[0]) * t * t + 0.9;
  const keel = HULL.free - HULL.depth + (HULL.depth - 1.2) * Math.pow(t, 2.6);
  return { hb: Math.max(0.12, hb), sheer, keel };
}
function woodTex(n, base, line, w, h, plank) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h; const g = cv.getContext('2d');
  g.fillStyle = base; g.fillRect(0, 0, w, h);
  for (let i = 0; i < n; i++) {
    const y = (i / n) * h; g.fillStyle = `rgba(0,0,0,${0.05 + ((i * 37) % 7) / 70})`; g.fillRect(0, y, w, h / n);
    g.fillStyle = line; g.fillRect(0, y, w, 1.5);
    for (let k = 0; k < 3; k++) { const x = (((i * 53 + k * 97) % 100) / 100) * w; g.fillRect(x, y, 1.5, h / n); }   // the plank ends
    if (plank) for (let k = 0; k < 6; k++) { g.fillStyle = 'rgba(40,25,10,0.08)'; g.fillRect(((i * 31 + k * 41) % 100) / 100 * w, y + 2, 18, 1); }
  }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t;
}
function buildHull() {
  const N = 40, M = 10, pos = [], col = [], uv = [], idx = [];
  const cBelow = C('#2B2119'), cSide = C('#6A4A32'), cBand = C('#8A3F2A'), cTop = C('#4E3826'), tmp = new THREE.Color();
  for (let i = 0; i <= N; i++) {
    const x = mix(HULL.stern, HULL.stem, i / N), H = hullAt(x);
    for (const s of [-1, 1]) for (let j = 0; j <= M; j++) {
      const a = j / M, ph = a * Math.PI / 2;
      const z = s * H.hb * Math.sin(ph) * (1 + 0.05 * a), y = H.keel + (H.sheer - H.keel) * (1 - Math.cos(ph));
      pos.push(x, y, z); uv.push(x / 6, y / 3);
      tmp.copy(y < 0.2 ? cBelow : y > H.sheer - 0.9 ? cTop : y > H.sheer - 1.7 ? cBand : cSide); col.push(tmp.r, tmp.g, tmp.b);
    }
  }
  const row = 2 * (M + 1);
  for (let i = 0; i < N; i++) for (let s = 0; s < 2; s++) for (let j = 0; j < M; j++) {
    const a = i * row + s * (M + 1) + j, b = a + row;
    if (s === 1) idx.push(a, b, a + 1, b, b + 1, a + 1); else idx.push(a, a + 1, b, b, a + 1, b + 1);
  }
  // the inner face of the bulwark (above the deck), so the hull reads from the deck too
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
  return g;
}
/** a hammered metal's normal map, drawn here (no file): soft dents of a seeded noise */
function hammeredNormals(n, seed) {
  let s = seed; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
  const h = new Float32Array(n * n);
  for (let k = 0; k < 160; k++) { const cx = r() * n, cy = r() * n, R = 3 + r() * 7, d = 0.5 + r() * 0.5;
    for (let y = Math.floor(cy - R); y <= cy + R; y++) for (let x = Math.floor(cx - R); x <= cx + R; x++) { const q = ((x - cx) ** 2 + (y - cy) ** 2) / (R * R); if (q < 1) h[((y + n) % n) * n + ((x + n) % n)] -= d * (1 - q) ** 2; } }
  const cv = document.createElement('canvas'); cv.width = cv.height = n; const g = cv.getContext('2d'), im = g.createImageData(n, n);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = h[y * n + ((x + 1) % n)] - h[y * n + ((x - 1 + n) % n)], dy = h[((y + 1) % n) * n + x] - h[((y - 1 + n) % n) * n + x], L = Math.hypot(dx, dy, 1), i = (y * n + x) * 4;
    im.data[i] = (0.5 - dx / L / 2) * 255; im.data[i + 1] = (0.5 - dy / L / 2) * 255; im.data[i + 2] = (0.5 + 0.5 / L) * 255; im.data[i + 3] = 255;
  }
  g.putImageData(im, 0, 0); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; return t;
}
function tubeOf(pts, r, seg = 24, rs = 6) { return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p))), seg, r, rs, false); }

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
  const W = WAVES.map((w) => { const k = (2 * Math.PI) / w.L; return new THREE.Vector4(k, Math.sqrt(H128.G * k), Math.cos(w.dir * DEG), Math.sin(w.dir * DEG)); });
  const WA = WAVES.map((w) => new THREE.Vector4(w.A[0], w.A[1], w.Q, 0));
  const seaU = {
    uT: { value: 0 }, uK: { value: 0 }, uShip: { value: new THREE.Vector2() }, uW: { value: W }, uWA: { value: WA },
    uSw: { value: [new THREE.Vector4(), new THREE.Vector4(), new THREE.Vector4()] }, uSwW: { value: [SWELL.w, SWELL.w, SWELL.w] },
    uFade0: { value: SEA_HALF * 1.2 }, uFade1: { value: SEA_HALF * 2.6 },
    uSea: { value: C(SKY.clear.sea) }, uDeep: { value: C(SKY.clear.deep) }, uTop: { value: C(SKY.clear.top) }, uHor: { value: C(SKY.clear.hor) },
    uSun: { value: C(SKY.clear.sun) }, uSunDir: { value: SUN_CLEAR.clone() }, uSunI: { value: 1 }, uFog: { value: C(SKY.clear.fog) }, uFogD: { value: 0.0011 },
  };
  const seaM = keep(new THREE.ShaderMaterial({ uniforms: seaU, vertexShader: SEA_VS, fragmentShader: SEA_FS }));
  const seaMesh = new THREE.Mesh(sg, seaM); seaMesh.frustumCulled = false; seaMesh.name = 'h128-sea'; scene.add(seaMesh);

  /* the sky */
  const skyU = { uTop: seaU.uTop, uHor: seaU.uHor, uSun: seaU.uSun, uFog: seaU.uFog, uSunDir: seaU.uSunDir, uT: seaU.uT, uK: seaU.uK,
    uCloud: { value: C(SKY.clear.cloud) }, uCover: { value: SKY.clear.cover }, uBrk: { value: 0 } };
  const skyM = keep(new THREE.ShaderMaterial({ uniforms: skyU, vertexShader: SKY_VS, fragmentShader: SKY_FS, side: THREE.BackSide, depthWrite: false, fog: false }));
  const sky = new THREE.Mesh(keep(new THREE.SphereGeometry(SKY_R, 32, 16)), skyM); sky.frustumCulled = false; sky.renderOrder = -1; scene.add(sky);

  /* the rain */
  const RN = Math.round(420 * quality), rp = new Float32Array(RN * 6), re = new Float32Array(RN * 2);
  { let s = 11; const r = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    for (let i = 0; i < RN; i++) { const x = (r() - 0.5) * 140, y = r() * 60, z = (r() - 0.5) * 140; rp.set([x, y, z, x, y, z], i * 6); re[i * 2] = 0; re[i * 2 + 1] = 1; } }
  const rg = keep(new THREE.BufferGeometry()); rg.setAttribute('position', new THREE.BufferAttribute(rp, 3)); rg.setAttribute('aEnd', new THREE.BufferAttribute(re, 1));
  const rainU = { uT: seaU.uT, uCam: { value: new THREE.Vector3() }, uLen: { value: 2.2 }, uK: { value: 0 } };
  const rain = new THREE.LineSegments(rg, keep(new THREE.ShaderMaterial({ uniforms: rainU, vertexShader: RAIN_VS, fragmentShader: RAIN_FS, transparent: true, depthWrite: false })));
  rain.frustumCulled = false; rain.visible = false; scene.add(rain);

  /* the hull and her fittings */
  const hullTex = keep(woodTex(14, '#B08A62', 'rgba(30,18,8,0.55)', 256, 256, false));
  const hullM = keep(new THREE.MeshLambertMaterial({ vertexColors: true, map: hullTex, side: THREE.DoubleSide }));
  const hull = new THREE.Mesh(keep(buildHull()), hullM); hull.name = 'h128-hull'; ship.add(hull);
  const darkM = keep(new THREE.MeshLambertMaterial({ color: '#3B2A1C' }));
  const woodM = keep(new THREE.MeshLambertMaterial({ color: '#7A5A3C' }));
  const ropeM = keep(new THREE.MeshLambertMaterial({ color: '#A88A5C' }));
  // the stem and the stern posts (the stern's swan neck: illustration)
  { const hs = hullAt(HULL.stern + 0.01), he = hullAt(HULL.stem - 0.01);
    const stern = [[HULL.stern + 2, hs.keel, 0], [HULL.stern, hs.keel + 2, 0], [HULL.stern - 1.2, hs.sheer, 0], [HULL.stern - 2.2, hs.sheer + 1.8, 0], [HULL.stern - 2.4, hs.sheer + 3.0, 0], [HULL.stern - 1.7, hs.sheer + 3.4, 0], [HULL.stern - 1.3, hs.sheer + 2.9, 0]];
    const stem = [[HULL.stem - 2, he.keel, 0], [HULL.stem, he.keel + 1.5, 0], [HULL.stem + 1.1, he.sheer, 0], [HULL.stem + 1.6, he.sheer + 1.6, 0]];
    ship.add(new THREE.Mesh(keep(tubeOf(stern, 0.42, 30, 7)), darkM), new THREE.Mesh(keep(tubeOf(stem, 0.4, 20, 7)), darkM));
    // the keel along the bottom
    const kp = []; for (let i = 0; i <= 16; i++) { const x = mix(HULL.stern + 2, HULL.stem - 2, i / 16); kp.push([x, hullAt(x).keel - 0.2, 0]); }
    ship.add(new THREE.Mesh(keep(tubeOf(kp, 0.3, 32, 5)), darkM));
    // the wales: two heavy strakes along each side
    for (const s of [-1, 1]) for (const a of [0.78, 0.92]) {
      const wp = []; for (let i = 0; i <= 20; i++) { const x = mix(HULL.stern + 1.5, HULL.stem - 1.2, i / 20), H = hullAt(x), ph = a * Math.PI / 2;
        wp.push([x, H.keel + (H.sheer - H.keel) * (1 - Math.cos(ph)), s * (H.hb * Math.sin(ph) * (1 + 0.05 * a) + 0.12)]); }
      ship.add(new THREE.Mesh(keep(tubeOf(wp, 0.2, 40, 5)), darkM));
    }
  }
  // the deck: planks along her length, inside the hull's line
  { const sh = new THREE.Shape(), n = 30;
    for (let i = 0; i <= n; i++) { const x = mix(HULL.stern + 0.6, HULL.stem - 0.6, i / n); const z = hullAt(x).hb * 0.98; i ? sh.lineTo(x, z) : sh.moveTo(x, z); }
    for (let i = n; i >= 0; i--) { const x = mix(HULL.stern + 0.6, HULL.stem - 0.6, i / n); sh.lineTo(x, -hullAt(x).hb * 0.98); }
    const dg = keep(new THREE.ShapeGeometry(sh, 2)); dg.rotateX(Math.PI / 2);
    const U = dg.attributes.position, uvA = dg.attributes.uv; for (let i = 0; i < U.count; i++) uvA.setXY(i, U.getX(i) / 24, U.getZ(i) / 6);
    const dt = keep(woodTex(12, '#C9A577', 'rgba(60,38,18,0.6)', 512, 256, true));
    const dm = new THREE.Mesh(dg, keep(new THREE.MeshLambertMaterial({ map: dt, side: THREE.DoubleSide }))); dm.position.y = DECK_Y; dm.name = 'h128-deck'; ship.add(dm);
  }
  // the rail: posts and a cap rail on the gunwale
  { const posts = []; for (const s of [-1, 1]) for (let x = HULL.stern + 3; x < HULL.stem - 2; x += 2.2) { const H = hullAt(x); posts.push([x, H.sheer, s * H.hb * 1.04]); }
    const pm = new THREE.InstancedMesh(keep(new THREE.BoxGeometry(0.16, 1.0, 0.16).translate(0, 0.5, 0)), woodM, posts.length); const m = new THREE.Matrix4();
    posts.forEach((p, i) => pm.setMatrixAt(i, m.makeTranslation(p[0], p[1], p[2]))); ship.add(pm);
    for (const s of [-1, 1]) { const rp2 = []; for (let i = 0; i <= 20; i++) { const x = mix(HULL.stern + 3, HULL.stem - 2.2, i / 20), H = hullAt(x); rp2.push([x, H.sheer + 1.0, s * H.hb * 1.04]); }
      ship.add(new THREE.Mesh(keep(tubeOf(rp2, 0.1, 40, 4)), woodM)); }
  }
  // the mast, the yard, the sail (furled to a strip in the storm), the stays and the sheets
  const mastAt = new THREE.Vector3(MAST.at[0], DECK_Y, MAST.at[1]);
  { const mm = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.32, 0.55, MAST.h, 10).translate(0, MAST.h / 2, 0)), woodM); mm.position.copy(mastAt); ship.add(mm); }
  const yardY = DECK_Y + MAST.h - 2.5;
  const yard = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.22, 0.3, MAST.yard, 8).rotateX(Math.PI / 2)), woodM); yard.position.set(MAST.at[0] + 0.5, yardY, MAST.at[1]); ship.add(yard);
  const sailG = keep(new THREE.PlaneGeometry(MAST.yard - 2, 1, 12, 8)); sailG.rotateY(Math.PI / 2);
  { const P = sailG.attributes.position; for (let i = 0; i < P.count; i++) { const z = P.getZ(i), y = P.getY(i) - 0.5, u = z / ((MAST.yard - 2) / 2);
      P.setXYZ(i, 1.6 * Math.sin(Math.PI * (-y)) * (1 - u * u * 0.6) + 0.6, y, z); } sailG.computeVertexNormals(); }
  const sailTex = (() => { const cv = document.createElement('canvas'); cv.width = 128; cv.height = 128; const g = cv.getContext('2d'); g.fillStyle = '#E9DCC0'; g.fillRect(0, 0, 128, 128);
    g.fillStyle = 'rgba(120,90,60,0.18)'; for (let i = 0; i < 8; i++) g.fillRect(0, i * 16, 128, 1.5); for (let i = 0; i < 8; i++) g.fillRect(i * 16, 0, 1.5, 128);   // the sewn cloths and the brail lines
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; })(); keep(sailTex);
  const sail = new THREE.Mesh(sailG, keep(new THREE.MeshLambertMaterial({ map: sailTex, side: THREE.DoubleSide }))); sail.position.set(MAST.at[0] + 0.6, yardY - 0.2, MAST.at[1]); ship.add(sail);
  const lineM = keep(new THREE.LineBasicMaterial({ color: '#5A4632' }));
  const stays = keep(new THREE.BufferGeometry()); ship.add(new THREE.LineSegments(stays, lineM));
  const setStays = (sailH) => {
    const top = [MAST.at[0], DECK_Y + MAST.h, MAST.at[1]], hs = hullAt(HULL.stern + 4), he = hullAt(HULL.stem - 1), yz = (MAST.yard - 2) / 2, by = yardY - 0.2 - sailH;
    const L = [...top, HULL.stem, he.sheer + 1, 0, ...top, HULL.stern + 4, hs.sheer + 1, 0];
    for (const s of [-1, 1]) { const H = hullAt(MAST.at[0] - 2); L.push(...top, MAST.at[0] - 2, H.sheer, s * H.hb, MAST.at[0] + 0.6, by, s * yz, MAST.at[0] - 6, hullAt(MAST.at[0] - 6).sheer, s * hullAt(MAST.at[0] - 6).hb * 0.95); }
    stays.setAttribute('position', new THREE.Float32BufferAttribute(L, 3)); stays.attributes.position.needsUpdate = true;
  };
  // the two steering oars lashed at the stern quarters (nobody steers in play)
  for (const [x, z] of DECK.steer) {
    const s = Math.sign(z), a = [x + 3, DECK_Y + 3.4, z * 1.02], b = [x - 6.5, -3.2, z * 1.12 + s * 0.6];
    ship.add(new THREE.Mesh(keep(tubeOf([a, b], 0.22, 2, 6)), woodM));
    const bl = new THREE.Mesh(keep(new THREE.BoxGeometry(3.6, 0.2, 1.3)), woodM); bl.position.set(b[0] + 1.2, b[1] + 1.4, b[2]); bl.rotation.z = Math.atan2(a[1] - b[1], a[0] - b[0]); bl.rotation.x = Math.PI / 2; ship.add(bl);
    const lash = new THREE.Mesh(keep(new THREE.TorusGeometry(0.4, 0.08, 4, 10)), ropeM); lash.position.set(x, DECK_Y + 1.4, z * 1.0); lash.rotation.y = Math.PI / 2; ship.add(lash);
  }

  /* the two bronze doors, lashed with four ropes from rings in the deck to cleats */
  const hammer = keep(hammeredNormals(128, 7));
  const bronzeM = keep(new THREE.MeshStandardMaterial({ color: BRONZE, metalness: 0.78, roughness: 0.32, envMapIntensity: 1.5, normalMap: hammer, normalScale: new THREE.Vector2(0.1, 0.1) }));
  const bronzeD = keep(new THREE.MeshStandardMaterial({ color: '#C99A52', metalness: 0.66, roughness: 0.32, envMapIntensity: 1.3 }));
  const D = DECK.doors, rivetG = keep(new THREE.SphereGeometry(0.1, 6, 3, 0, Math.PI * 2, 0, Math.PI / 2));
  const rivetsPer = 3 * 13, rivets = new THREE.InstancedMesh(rivetG, bronzeD, rivetsPer * 2); let ri = 0; const m4 = new THREE.Matrix4();
  for (const side of ['port', 'stbd']) {
    const [cx, cz] = D[side], g = new THREE.Group(); g.position.set(cx, D.T / 2, cz); g.name = 'h128-door-' + side; deck.add(g);
    { const bg = keep(new THREE.BoxGeometry(D.L, D.T, D.W)), U = bg.attributes.uv, P = bg.attributes.position; for (let i = 0; i < U.count; i++) U.setXY(i, (P.getX(i) + P.getZ(i) * 0.5) / 9, (P.getZ(i) + P.getY(i)) / 9);
      g.add(new THREE.Mesh(bg, bronzeM)); }
    // a raised frame round the leaf's face
    for (const [w, d, x, z] of [[D.L, 0.35, 0, D.W / 2 - 0.18], [D.L, 0.35, 0, -D.W / 2 + 0.18], [0.35, D.W, D.L / 2 - 0.18, 0], [0.35, D.W, -D.L / 2 + 0.18, 0]]) { const f = new THREE.Mesh(keep(new THREE.BoxGeometry(w, 0.06, d)), bronzeD); f.position.set(x, D.T / 2 + 0.03, z); g.add(f); }
    for (const bx of [-D.L / 3, 0, D.L / 3]) { const b = new THREE.Mesh(keep(new THREE.BoxGeometry(0.55, 0.08, D.W - 0.1)), bronzeD); b.position.set(bx, D.T / 2 + 0.04, 0); g.add(b); }   // the three cross bands
    for (let i = 0; i < 13; i++) for (let j = 0; j < 3; j++) {
      rivets.setMatrixAt(ri++, m4.makeTranslation(cx - D.L / 2 + 1.2 + i * ((D.L - 2.4) / 12), D.T, cz - D.W / 2 + 0.9 + j * ((D.W - 1.8) / 2)));
    }
    for (const [hx, hz] of DECK.handles[side]) {   // two big ring handles on each leaf, each on a boss
      const boss = new THREE.Mesh(keep(new THREE.CylinderGeometry(0.32, 0.36, 0.14, 10)), bronzeD); boss.position.set(hx - cx, D.T / 2 + 0.07, hz - cz); g.add(boss);
      const ring = new THREE.Mesh(keep(new THREE.TorusGeometry(0.55, 0.08, 6, 16)), bronzeM); ring.rotation.x = Math.PI / 2; ring.position.set(hx - cx, D.T / 2 + 0.16, hz - cz + 0.35); g.add(ring);
    }
  }
  deck.add(rivets);
  // the rings in the deck, the cleats, and the four ropes that cross over the leaves; their free tails coiled toward the player
  const ropes = {};
  for (const k of Object.keys(DECK.rings)) {
    const [rx, rz] = DECK.rings[k], [cx, cz] = DECK.cleats[k], [tx, tz] = DECK.tails[k], s = Math.sign(cz);
    const dr = new THREE.Mesh(keep(new THREE.TorusGeometry(0.28, 0.06, 5, 12)), darkM); dr.rotation.y = Math.PI / 2; dr.position.set(rx, 0.2, rz); deck.add(dr);
    const cl = new THREE.Mesh(keep(new THREE.BoxGeometry(1.2, 0.22, 0.3)), woodM); cl.position.set(cx, 0.35, cz); deck.add(cl);
    const cp = new THREE.Mesh(keep(new THREE.BoxGeometry(0.25, 0.3, 0.25)), woodM); cp.position.set(cx, 0.15, cz); deck.add(cp);
    const edgeIn = s * (Math.abs(D.port[1]) - D.W / 2), edgeOut = s * (Math.abs(D.port[1]) + D.W / 2), top = D.T + 0.12;
    const path = [[rx, 0.2, rz], [rx, top, edgeIn], [rx, top + 0.05, (edgeIn + edgeOut) / 2], [rx, top, edgeOut], [rx, 0.45, cz - s * 0.2], [cx, 0.42, cz]];
    const tail = [[cx, 0.42, cz], [cx - 1, 0.1, cz - s * 0.2], [tx + 1, 0.08, tz], [tx, 0.08, tz], [tx - 0.6, 0.08, tz + s * 0.5]];
    const mesh = new THREE.Mesh(keep(tubeOf(path, 0.09, 24, 5)), ropeM), tm = new THREE.Mesh(keep(tubeOf(tail, 0.08, 16, 5)), ropeM);
    deck.add(mesh, tm); ropes[k] = { mesh, tail: tm };
  }

  /* the people: Nicanor (a merchant's robe and head cloth, large) aft of the doors facing forward; six sailors at work */
  const actors = createActors({ scene: deck, ground: () => 0, max: 12, maxItems: 12 });
  const nic = actors.add('pilgrim', DECK.nicanor[0], DECK.nicanor[1], { y: 0, yaw: Math.PI / 2, scale: 1.18, col: '#6E4A2E', col2: '#D9C9A3', young: false });
  const crew = DECK.sailors.map(([x, z, item], i) => {
    const a = actors.add('worker', x, z, { y: 0, item, scale: 0.98 + (i % 3) * 0.03, col: ['#8C6A4E', '#6F5A44', '#A0805C', '#5E4C3A', '#7E6248', '#94765A'][i] });
    // the rope men face their rope's cleat; the bailer faces the bilge; the oarsman faces outboard aft
    const face = item === 'oar' ? [x - 4, z * 1.6] : item === 'bucket' ? [x + 3, z * 1.4] : [x + 0.5, z * 1.5];
    a.yaw = Math.atan2(face[0] - x, face[1] - z); return a;
  });

  /* the shaft of light through the break */
  const shaftU = { uI: { value: 0 }, uCol: { value: C('#FFD59A') } };
  const shaft = new THREE.Mesh(keep(new THREE.CylinderGeometry(2, 7, 1, 20, 1, true).translate(0, -0.5, 0)), keep(new THREE.ShaderMaterial({ uniforms: shaftU, vertexShader: SHAFT_VS, fragmentShader: SHAFT_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, fog: false })));
  shaft.frustumCulled = false; shaft.visible = false; scene.add(shaft);

  /* the environment (the bronze reflects a sky): one capture of the clear sky, its strength follows the weather */
  let envRT = null;
  try {
    const pm = new THREE.PMREMGenerator(renderer); const es = new THREE.Scene(); const ed = new THREE.Mesh(new THREE.SphereGeometry(100, 24, 12), skyM); es.add(ed);
    envRT = pm.fromScene(es, 0, 0.5, 400); bronzeM.envMap = bronzeD.envMap = envRT.texture;   // (the bronze only: the wood and the figures need none) ed.geometry.dispose(); pm.dispose();
  } catch (e) { /* no environment: the bronze is lit by the sun and the fill only */ }

  /* the weather and the state */
  const st = { t: 0, k: 0, brk: 0, furl: 0, swells: [], shipX: 0, heave: 0, pitch: 0, roll: 0, vh: 0, cam: 'play', camU: 0, round: 0, scriptMs: 0, sailH: 0 };
  const cA = new THREE.Color(), cB = new THREE.Color();
  function blend(key, u) {
    // clear → storm by k, then toward the break's palette by brk
    cA.set(SKY.clear[key]).lerp(cB.set(SKY.storm[key]), st.k); if (st.brk > 0) cA.lerp(cB.set(SKY.brk[key]), st.brk); return u ? u.copy(cA) : cA;
  }
  const num = (key) => mix(mix(SKY.clear[key], SKY.storm[key], st.k), SKY.brk[key], st.brk);
  function applyWeather() {
    blend('top', seaU.uTop.value); blend('hor', seaU.uHor.value); blend('sea', seaU.uSea.value); blend('deep', seaU.uDeep.value);
    blend('sun', seaU.uSun.value); blend('fog', seaU.uFog.value); blend('cloud', skyU.uCloud.value);
    skyU.uCover.value = num('cover'); skyU.uBrk.value = st.brk;
    seaU.uSunDir.value.copy(SUN_CLEAR).lerp(SUN_BRK, clamp(st.brk + st.k * 0.4, 0, 1)).normalize();
    seaU.uSunI.value = num('sunI') / 3; seaU.uK.value = st.k;
    sun.color.copy(seaU.uSun.value); sun.intensity = num('sunI');
    hemi.color.copy(blend('hemiS')); hemi.groundColor.copy(blend('hemiG')); hemi.intensity = num('hemiI');
    scene.fog.color.copy(seaU.uFog.value); scene.fog.near = mix(160, 60, st.k); scene.fog.far = mix(1600, 520, st.k * (1 - st.brk * 0.5));
    seaU.uFogD.value = mix(0.0009, 0.0042, st.k * (1 - st.brk * 0.4));
    bronzeM.envMapIntensity = 1.5 * (mix(1, 0.35, st.k) + st.brk * 0.25); bronzeD.envMapIntensity = bronzeM.envMapIntensity * 0.85;
    renderer.toneMappingExposure = mix(0.95, 1.15, st.k);
  }
  const sOpt = { k: 0, swells: null, ship: [0, 0] };
  const sample = (x, z) => seaAt(x + st.shipX, z, st.t, sOpt).y;
  const smp = { bow: [HULL.stem - 8, 0], stern: [HULL.stern + 8, 0], port: [HULL.wide, -HULL.beam / 2 + 1], stbd: [HULL.wide, HULL.beam / 2 - 1], mid: [HULL.wide, 0] };
  function pose(dt) {
    sOpt.k = st.k; sOpt.swells = st.swells; sOpt.ship = [st.shipX, 0];
    const yb = sample(...smp.bow), ys = sample(...smp.stern), yp = sample(...smp.port), yq = sample(...smp.stbd), ym = sample(...smp.mid);
    const heave = (yb + ys + yp + yq + 2 * ym) / 6, pitch = Math.atan2(yb - ys, smp.bow[0] - smp.stern[0]), roll = Math.atan2(yq - yp, smp.stbd[1] - smp.port[1]);
    const a = dt > 0 ? 1 - Math.exp(-dt / 0.45) : 1;   // the hull's inertia: she follows the water a little late
    st.heave += (heave - st.heave) * a; st.pitch += (pitch - st.pitch) * a; st.roll += (roll - st.roll) * a;
    ship.position.set(0, st.heave - 0.6, 0); ship.rotation.set(-st.roll, 0, st.pitch, 'YZX');
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
  /* the crew at work: the rope men lean on their ropes as a swell comes, the bailer bails on the low side, the oarsman braces */
  const crewPose = {};
  function work(dt) {
    const near = (st.swells || []).reduce((m, s) => Math.max(m, Math.exp(-Math.pow(swellPos(s, st.t) / 30, 2))), 0);
    crew.forEach((a, i) => {
      const item = DECK.sailors[i][2], z = DECK.sailors[i][1];
      let p = 'stand';
      if (item === 'rope') p = near > 0.25 || st.k > 0.6 ? 'lean' : 'carry';
      else if (item === 'oar') p = near > 0.2 ? 'lean' : 'carry';
      else if (item === 'bucket') { const low = Math.sign(z) === Math.sign(st.roll) ? 1 : 0; p = st.k > 0.3 && low ? 'wash' : 'carry'; }
      if (crewPose[i] !== p) { crewPose[i] = p; actors.pose(a, p); }
    });
    const hold = st.k > 0.5 || near > 0.3 ? 'lean' : 'stand';
    if (crewPose.nic !== hold) { crewPose.nic = hold; actors.pose(nic, hold); }
    actors.update(dt);
  }
  /* the cameras: play (behind and above Nicanor, along the deck), lift (back and up: the whole ship and the next swell), round */
  const rig = new THREE.Object3D(); scene.add(rig);
  const vP = new THREE.Vector3(), vT = new THREE.Vector3(), vP2 = new THREE.Vector3(), vT2 = new THREE.Vector3();
  function camPose(name, out, tgt) {
    if (name === 'round') {
      const R = CAM.round, a = st.round;
      out.set(R.t[0] + Math.cos(a) * -R.R, R.y + st.heave * 0.3, R.t[2] + Math.sin(a) * R.R); tgt.set(R.t[0], R.t[1] + st.heave * 0.5, R.t[2]); return;
    }
    const c = name === 'lift' ? CAM.lift : CAM.play, f = name === 'lift' ? 0.25 : 0.6;
    rig.position.set(0, st.heave * (name === 'lift' ? 0.4 : 0.85), 0); rig.rotation.set(-st.roll * f * 0.4, 0, st.pitch * f, 'YZX'); rig.updateMatrixWorld();
    out.set(...c[0]); tgt.set(...c[1]);
    if (name === 'lift' && st.head) {   // turned round the ship to the side the swell runs to, looking back at where it comes from
      const d = headDir(st.head), f = Math.atan2(d[1], d[0]) - Math.PI, cs = Math.cos(f), sn = Math.sin(f);
      for (const v of [out, tgt]) { const x = v.x, z = v.z; v.x = x * cs - z * sn; v.z = x * sn + z * cs; }
    }
    out.y += DECK_Y; rig.localToWorld(out); tgt.y += DECK_Y; rig.localToWorld(tgt);
  }
  function placeCam() {
    camPose(st.cam, vP, vT);
    if (st.camU > 0 && st.cam !== 'lift') { camPose('lift', vP2, vT2); vP.lerp(vP2, st.camU); vT.lerp(vT2, st.camU); }
    camera.position.copy(vP); camera.lookAt(vT);
    sky.position.copy(camera.position); rainU.uCam.value.copy(camera.position);
  }

  applyWeather(); setStays(0); placeCam();
  const api = {
    scene, camera, ship, deck, actors, nicanor: nic, crew, ropes,
    get state() { return st; },
    /** the weather and the play: k the storm (0..1), brk the cloud break (0..1), swells [{ head, t0, H?, w?, c? }] */
    set(o = {}) {
      if (o.k != null) st.k = clamp(o.k, 0, 1); if (o.brk != null) st.brk = clamp(o.brk, 0, 1); if (o.swells) st.swells = o.swells;
      if (o.furl != null) st.furl = clamp(o.furl, 0, 1);
      applyWeather();
    },
    view(name, u = 0, round = 0, head = null) { st.cam = name; st.camU = clamp(u, 0, 1); st.round = round; st.head = head; },
    resize(w, h) { camera.aspect = w / Math.max(1, h); camera.updateProjectionMatrix(); },
    /** t: the sea's clock (s); dt: the step (s) for the ship's inertia and the figures (0: snap) */
    update(t, dt) {
      const t0 = performance.now();
      st.t = t; st.shipX = t * SAIL_V; seaU.uT.value = t; seaU.uShip.value.set(st.shipX, 0);
      swellsToShader(); pose(dt);
      // the sail: set in the calm, furled to a strip under the yard in the storm
      const sh = mix(MAST.h * 0.6, 1.4, st.furl); if (Math.abs(sh - st.sailH) > 0.05) { st.sailH = sh; sail.scale.y = sh; setStays(sh); }
      rain.visible = st.k > 0.35 && st.brk < 0.6; rainU.uK.value = clamp((st.k - 0.35) / 0.4, 0, 1) * (1 - st.brk);
      shaft.visible = st.brk > 0.02; shaftU.uI.value = st.brk;
      if (shaft.visible) {   // from the gap above down onto the doors
        const at = new THREE.Vector3(D.port[0], DECK_Y, 0); ship.localToWorld(at); const L = 170, dir = seaU.uSunDir.value;
        shaft.position.copy(at).addScaledVector(dir, L); shaft.scale.set(1, L, 1); shaft.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      }
      sun.position.copy(seaU.uSunDir.value).multiplyScalar(200); sun.target.position.set(0, 0, 0);
      work(dt || 0); placeCam();
      st.scriptMs = performance.now() - t0;
    },
    render() { renderer.render(scene, camera); },
    /** the water's height under a point of the sea's frame, now (the ship, the doors and the camera use the same) */
    waterAt(x, z) { return seaAt(x + st.shipX, z, st.t, { k: st.k, swells: st.swells, ship: [st.shipX, 0] }).y; },
    dbg() { return { t: +st.t.toFixed(2), k: +st.k.toFixed(2), brk: +st.brk.toFixed(2), heave: +st.heave.toFixed(2), pitch: +(st.pitch / DEG).toFixed(2), roll: +(st.roll / DEG).toFixed(2), cam: st.cam, scriptMs: +st.scriptMs.toFixed(3) }; },
    dispose() { for (const o of own) o.dispose && o.dispose(); if (envRT) envRT.dispose(); scene.clear(); },
  };
  return api;
}
