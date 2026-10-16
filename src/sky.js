// ── world6 ── The sky (wave 6, WORLD agent). ONE dome draw call draws everything behind the world: a tuned analytic sky
// per time preset (a Rayleigh-like zenith→horizon gradient whose horizon turns toward the sun's azimuth, a Mie glow, the sun
// disc, the anti-solar belt at dawn and dusk), the horizon haze that meets the fog colour, the far hills all round and the
// mountains of Moab in the east (they turn pink at dusk and stand dark against the dawn), a band of big cumulus heaps on the
// horizon (cauliflower tops, flat grey feet, bright rims toward the sun), and a sun-lit cloud layer overhead (fbm from a
// tiling noise texture made here, lit by a step toward the sun: bright rims, darker bellies, silver edges, a slow drift).
// Night: the moon (its own direction: the full moon of Sukkot, low in the east — Simchat Beit HaShoevah is on the 15th),
// the Milky Way, thin moonlit clouds; the stars are a second draw call (night only), depth-tested so hills hide them.
// Rain (Ta'anit 23a: at night, during the building) turns it overcast: setOvercast(k).
// Not a physical model: every preset is tuned for ACES on a phone. The same shader (ENV define: no disc, no stars) draws the
// PMREM environment, so gold, bronze and marble reflect this sky. Replaces world.js buildSky / buildClouds (66 sprites).
import * as THREE from 'three';
import { rng } from './util.js';

/* ───────── the noise (typed array → DataTexture: exact values, no canvas premultiply) ───────── */
// a tiling 256² noise: R fbm (periods 4…64), G billowy cells (inverted Worley, period 6), B fbm (8…64), A cells (period 12)
function noiseTex(seed = 7, S = 256) {
  const r = rng(seed), out = new Uint8Array(S * S * 4);
  const lattice = (p) => { const L = new Float32Array(p * p); for (let i = 0; i < L.length; i++) L[i] = r(); return L; };
  const vnoise = (L, p, x, y) => {   // x, y in [0, S): tiling value noise with period p cells
    const fx = x / S * p, fy = y / S * p, xi = Math.floor(fx), yi = Math.floor(fy), u = fx - xi, v = fy - yi;
    const x0 = xi % p, y0 = yi % p, x1 = (x0 + 1) % p, y1 = (y0 + 1) % p;
    const su = u * u * (3 - 2 * u), sv = v * v * (3 - 2 * v);
    const a = L[y0 * p + x0], b = L[y0 * p + x1], c = L[y1 * p + x0], d = L[y1 * p + x1];
    return a + (b - a) * su + (c - a) * sv + (a - b - c + d) * su * sv;
  };
  const cells = (p) => { const P = []; for (let j = 0; j < p; j++) for (let i = 0; i < p; i++) P.push([(i + 0.15 + r() * 0.7) / p * S, (j + 0.15 + r() * 0.7) / p * S]); return P; };
  const worley = (P, p, x, y) => {
    const cs = S / p, ci = Math.floor(x / cs), cj = Math.floor(y / cs);
    let d1 = 1e9;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const i = ci + di, j = cj + dj, ii = ((i % p) + p) % p, jj = ((j % p) + p) % p;
      const q = P[jj * p + ii], qx = q[0] + (i - ii) * cs, qy = q[1] + (j - jj) * cs;
      const d = (x - qx) * (x - qx) + (y - qy) * (y - qy);
      if (d < d1) d1 = d;
    }
    return Math.min(1, Math.sqrt(d1) / cs);
  };
  const fR = [4, 8, 16, 32, 64].map((p) => [p, lattice(p)]), fB = [8, 16, 32, 64].map((p) => [p, lattice(p)]);
  const W1 = cells(6), W2 = cells(12);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    let a = 0, n = 0, amp = 0.5;
    for (const [p, L] of fR) { a += vnoise(L, p, x, y) * amp; n += amp; amp *= 0.5; }
    let b = 0, m = 0; amp = 0.5;
    for (const [p, L] of fB) { b += vnoise(L, p, x, y) * amp; m += amp; amp *= 0.5; }
    const g = 1 - worley(W1, 6, x, y), w = 1 - worley(W2, 12, x, y), i = (y * S + x) * 4;
    // (the fbm channels are stretched from their narrow natural range to 0…1)
    out[i] = Math.round(Math.max(0, Math.min(1, (a / n - 0.5) * 1.9 + 0.5)) * 255); out[i + 1] = Math.round(g * 255);
    out[i + 2] = Math.round(Math.max(0, Math.min(1, (b / m - 0.5) * 1.9 + 0.5)) * 255); out[i + 3] = Math.round(w * 255);
  }
  const t = new THREE.DataTexture(out, S, S, THREE.RGBAFormat);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.magFilter = THREE.LinearFilter; t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true; t.colorSpace = THREE.NoColorSpace; t.needsUpdate = true;
  return t;
}

/* ───────── the presets (sRGB hex; THREE converts to the linear working space) ─────────
 * zen/horA/horS: zenith, horizon away from / toward the sun's azimuth · fog: the haze the horizon melts into (= the fog)
 * belt: the anti-solar band · sun: the sun's colour in the sky · glow, disc: their strength · skyI: brightness under ACES
 * cov: cloud-layer cover 0…1 · cLit/cShd: its lit tops / shaded bellies · cA: its opacity
 * cum: the horizon cumulus heaps' height (sin of elevation; 0 = none) · cumLit/cumShd their colours
 * mtn: the far ranges' colour (mixed into the haze) · moab: the Moab wall's colour when the sun is behind the viewer
 * moon, star: night only · moonAz/moonEl: the moon's direction (deg; az 0 = east (+x), 90 = south (+z)) */
export const SKY = {
  dawn: { zen: '#3A6CB4', horA: '#C6CEDC', horS: '#FFC996', fog: '#E9D5BE', belt: '#6B4E5E', sun: '#FFD6A4', glow: 0.66, disc: 1, skyI: 1.12, cov: 0.48, cLit: '#FFEAD2', cShd: '#8D8FA8', cA: 0.95, cum: 0.095, cumLit: '#FFF0DE', cumShd: '#8F8EA6', mtn: '#7C7F9C', moab: '#9D86A0', moon: 0, star: 0 },
  noon: { zen: '#2E6BC0', horA: '#C3D8EC', horS: '#D6E4EF', fog: '#DCE6EE', belt: '#000000', sun: '#FFF6E8', glow: 0.7, disc: 1, skyI: 1.18, cov: 0.45, cLit: '#FFFFFF', cShd: '#9FAABE', cA: 0.94, cum: 0.1, cumLit: '#FFFFFF', cumShd: '#A2ADC2', mtn: '#8C9DB4', moab: '#98A3BC', moon: 0, star: 0 },
  dusk: { zen: '#2F4580', horA: '#B89EAE', horS: '#FFAE68', fog: '#E3BFA6', belt: '#5E3A55', sun: '#FFA060', glow: 1.3, disc: 1, skyI: 1.15, cov: 0.48, cLit: '#FFC39A', cShd: '#6B5D7E', cA: 0.95, cum: 0.1, cumLit: '#FFC8A2', cumShd: '#76678A', mtn: '#7A6A8C', moab: '#C98E9C', moon: 0, star: 0 },
  // ── world7 ── the golden hour (the opening vision and BEAUTY only; the game's real clock never selects it): the sun a few
  // degrees over the Mount of Olives, the east faces gilded, long shadows, a warm haze under a clear blue zenith
  golden: { zen: '#3A70C0', horA: '#F0CFA6', horS: '#FFB266', fog: '#EFCB9E', belt: '#C39487', sun: '#FFC27E', glow: 1.1, disc: 1, skyI: 1.12, cov: 0.42, cLit: '#FFD6A2', cShd: '#8C7E98', cA: 0.95, cum: 0.12, cumLit: '#FFE0B6', cumShd: '#94849A', mtn: '#9A8480', moab: '#BC8E80', moon: 0, star: 0 },
  night: { zen: '#081430', horA: '#23355F', horS: '#2B3D6A', fog: '#1D2A48', belt: '#000000', sun: '#CFDBFF', glow: 0.22, disc: 0, skyI: 1.05, cov: 0.26, cLit: '#6D7EA6', cShd: '#121A30', cA: 0.75, cum: 0.045, cumLit: '#4A5878', cumShd: '#141B30', mtn: '#16203A', moab: '#1F2B4A', moon: 1, star: 1, moonAz: 45, moonEl: 30 },   // ── world7 ── (the moon where its light comes from: south-east, 30° up — over the Mount of Olives from the city; was az 70, el 16) a readable night: a deep-blue gradient to a moonlit horizon, the far hills as silhouettes (was zen #040915, hor #162038)
  // ── polish23 ── the Temple day's dark night (Phase B): the same moon and stars, a deeper dome, the far hills as black cut-outs
  nightd: { zen: '#050B1E', horA: '#16213F', horS: '#1B2646', fog: '#121B33', belt: '#000000', sun: '#B7C6F0', glow: 0.14, disc: 0, skyI: 0.95, cov: 0.22, cLit: '#4A5878', cShd: '#0C1224', cA: 0.6, cum: 0.03, cumLit: '#34405E', cumShd: '#0C1224', mtn: '#0E1528', moab: '#151D36', moon: 1, star: 1.15, moonAz: 45, moonEl: 30 },
  // ── /polish23 ──
};
// the overcast of the building's night rain (and a grey day, should a preset ever ask for one)
const RAIN = { zen: '#565D68', horA: '#8C939B', horS: '#979EA6', fog: '#8A9098', belt: '#000000', glow: 0.1, disc: 0, cov: 0.98, cLit: '#8F969F', cShd: '#474C55', cA: 1, cum: 0.0, cumLit: '#8A9098', cumShd: '#4A4F57', mtn: '#6E747C', moab: '#6E747C', moon: 0, star: 0 };

const VS = 'varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }';
const FS = /* glsl */`
uniform vec3 uZen, uHorA, uHorS, uFog, uBelt, uSunCol, uSunDir, uMoonDir, uCLit, uCShd, uCumLit, uCumShd, uMtn, uMoab;
uniform float uGlow, uDisc, uSkyI, uCov, uCA, uCum, uTime, uMoon, uStar;
uniform vec3 uMoonPh, uMoonSun;   // ── world12 ── the moon's phase: (cos of the phase angle, +1 waxing / −1 waning, the lit fraction); the sun's side
uniform sampler2D uNoise;
varying vec3 vP;
// the cloud layer's density at uv: big fbm shapes, billows, eroded by small cells
float layer(vec2 uv) {
  vec4 a = texture2D(uNoise, uv);
  vec4 b = texture2D(uNoise, uv * 2.63 + vec2(0.37, 0.71));
  vec4 e = texture2D(uNoise, uv * 7.1 + vec2(0.13, 0.41));
  return a.r * 0.5 + a.g * 0.2 + b.b * 0.18 + b.a * 0.12 - (1.0 - e.g) * 0.12 + 0.04;
}
void main() {
  vec3 d = normalize(vP);
  float h = d.y, hu = max(h, 0.0);
  vec2 sxz = uSunDir.xz / max(length(uSunDir.xz), 1e-4);
  vec2 dxz = d.xz / max(length(d.xz), 1e-4);
  float tw = dot(dxz, sxz) * 0.5 + 0.5;                        // 1 = toward the sun's azimuth
  float A = atan(d.z, d.x) * 0.15915494;                       // azimuth / 2π: -0.5…0.5 (sampled at integer multiples: seamless)
  // the gradient: the horizon's colour turns toward the sun; the zenith; the haze band meets the fog at the horizon
  vec3 hor = mix(uHorA, uHorS, tw * tw);
  vec3 c = mix(hor, uZen, pow(hu, 0.5));
  c += uBelt * (1.0 - tw) * smoothstep(0.0, 0.05, hu) * (1.0 - smoothstep(0.1, 0.3, hu));
  c = mix(c, uFog, exp(-hu * 26.0) * 0.9);
  // the sun (or at night the moon's light) — its glow and disc
  float cs = dot(d, uSunDir);
  float g1 = pow(max(cs, 0.0), 5.0), g2 = pow(max(cs, 0.0), 48.0), g3 = pow(max(cs, 0.0), 900.0);
  vec3 glow = uSunCol * (g1 * 0.22 + g2 * 0.55 + g3 * 1.6) * uGlow;
  float disc = smoothstep(0.99993, 0.99996, cs) * uDisc;
  float cover = 0.0;
#ifndef ENV
  // the Milky Way and the moon (night)
  if (uStar > 0.0 && h > 0.0) {
    vec3 gp = normalize(vec3(0.62, 0.38, -0.69));
    float band = exp(-pow(dot(d, gp) * 5.5, 2.0));
    float mw = texture2D(uNoise, d.xz / (h + 0.4) * 0.35 + 0.2).r;
    c += vec3(0.035, 0.042, 0.065) * band * smoothstep(0.3, 0.8, mw) * uStar * smoothstep(0.02, 0.3, h);
  }
  if (uMoon > 0.0) {
    float md = dot(d, uMoonDir);
    float moon = smoothstep(0.99962, 0.99972, md);
    float mare = texture2D(uNoise, (d.xz - uMoonDir.xz) * 60.0 + 0.5).r;
    // ── world12 ── the phase by the Hebrew date (full on the 15th): the disc is lit on the sun's side and the terminator is an
    // ellipse (x = cos(phase) · √(1 − y²) on the unit disc); the dark part hides the stars behind it; the glow follows the light
    vec3 e1 = normalize(uMoonSun - dot(uMoonSun, uMoonDir) * uMoonDir), e2 = cross(uMoonDir, e1);
    vec2 mq = vec2(dot(d, e1), dot(d, e2)) / 0.0257;
    float ml = smoothstep(-0.07, 0.07, mq.x * uMoonPh.y - uMoonPh.x * sqrt(max(0.0, 1.0 - mq.y * mq.y)));
    c += vec3(0.10, 0.12, 0.18) * (pow(max(md, 0.0), 400.0) * 0.9 + pow(max(md, 0.0), 24.0) * 0.18) * uMoon * (0.12 + 0.88 * uMoonPh.z);
    c = mix(c, c * 0.8 + vec3(0.004, 0.005, 0.008), moon * uMoon * (1.0 - ml));
    c = mix(c, vec3(1.9, 1.88, 1.8) * (0.78 + 0.32 * mare), moon * uMoon * ml);
  }
#endif
  // the cloud layer overhead (a plane ~1.4 km up, projected per pixel)
  if (h > 0.0 && uCA > 0.0) {
    vec2 uv = d.xz / (h + 0.06) * 0.28 + vec2(uTime * 0.0012, uTime * 0.0005);   // (bigger clouds than the first cut: they read on a phone)
    float n = layer(uv);
    float dens = smoothstep(1.0 - uCov, 1.0 - uCov + 0.24, n);
    float nl = layer(uv + sxz * 0.025 * (1.0 - 0.6 * max(uSunDir.y, 0.0)));
    float lit = clamp(0.62 + (n - nl) * 6.0, 0.0, 1.0);
    vec3 cc = mix(uCShd, uCLit, lit) * mix(1.0, 0.8, smoothstep(0.55, 1.0, dens));
    cc = mix(cc, uFog, 0.5 * exp(-h * 7.0));                     // far clouds sink into the haze
    float thin = 1.0 - smoothstep(0.05, 0.55, dens);
    cc += uSunCol * (g1 * 0.9 + g2 * 1.8) * thin * uGlow;        // silver edges toward the sun
    cover = dens * smoothstep(0.02, 0.12, h) * uCA;
    c = mix(c, cc, cover);
  }
  // the big cumulus heaps on the horizon: where banks are, a noisy top line; cauliflower cells; flat hazy feet
  if (uCum > 0.0 && h > -0.01 && h < 0.2) {
    float bank = smoothstep(0.3, 0.6, texture2D(uNoise, vec2(A * 3.0, 0.61)).b);
    vec4 m2 = texture2D(uNoise, vec2(A * 13.0, 0.29));
    float top = uCum * bank * (0.3 + 0.95 * m2.r * m2.r);
    float base = 0.004 + 0.008 * m2.a;
    vec2 q = vec2(A * 48.0, h * 7.6 - uTime * 0.0004);
    vec4 b1 = texture2D(uNoise, q), b2 = texture2D(uNoise, q * 2.0 + vec2(0.3, 0.1));
    float bill = b1.g * 0.55 + b2.a * 0.45;                      // cells: bright centres, dark creases
    float edge = top * (0.72 + 0.5 * bill) - (h - base);
    float dC = smoothstep(0.0, 0.004, edge) * smoothstep(base - 0.004, base + 0.004, h) * step(0.004, top);
    if (dC > 0.0) {
      float f = clamp((h - base) / max(top, 1e-3), 0.0, 1.0);
      float sh = mix(0.5, 1.0, smoothstep(0.0, 0.55, f)) * (0.62 + 0.38 * bill);
      vec3 body = mix(uCumShd, uCumLit, sh * mix(1.0, 0.72, tw * tw));   // toward the sun the heaps stand backlit
      body += uSunCol * smoothstep(0.004, 0.0, edge) * tw * tw * 0.9 * uGlow;  // bright rims toward the sun
      body = mix(body, uFog, 0.18 + 0.45 * (1.0 - f) * (1.0 - f));
      c = mix(c, body, dC);
      cover = max(cover, dC);
    }
  }
  // the far ranges: the Judean hills all round, and in the east (+x) the long wall of the mountains of Moab
  if (h < 0.035) {
    float east = smoothstep(0.35, 0.95, dxz.x);
    vec4 r1 = texture2D(uNoise, vec2(A * 4.0, 0.83)), r2 = texture2D(uNoise, vec2(A * 19.0, 0.47));
    float far = 0.004 + 0.009 * r1.r + 0.003 * r2.b + east * (0.012 + 0.003 * r2.r);
    float near = 0.0015 + 0.007 * r1.b * r2.r;
    vec3 mt = mix(uMtn, uMoab, east * (1.0 - tw));                 // Moab lit by the sun behind the viewer (pink at dusk)
    mt = mix(mt, uMtn * 0.75, east * tw * tw);                      // …and dark against the dawn
    float kf = smoothstep(far + 0.0015, far - 0.0005, h), kn = smoothstep(near + 0.001, near - 0.0005, h);
    c = mix(c, mix(uFog, mt, 0.42), kf);
    c = mix(c, mix(uFog, mt * 0.92, 0.6), kn);
    cover = max(cover, kf);
  }
  if (h < 0.0) c = mix(c, uFog, smoothstep(0.0, -0.03, h));
  c = c * uSkyI + glow * (1.0 - 0.85 * cover) + uSunCol * disc * 24.0 * (1.0 - cover);
  gl_FragColor = vec4(c, 1.0);
}`;

export function createSky() {
  const noise = noiseTex();
  const U = () => ({
    uZen: { value: new THREE.Color() }, uHorA: { value: new THREE.Color() }, uHorS: { value: new THREE.Color() }, uFog: { value: new THREE.Color() },
    uBelt: { value: new THREE.Color() }, uSunCol: { value: new THREE.Color() }, uSunDir: { value: new THREE.Vector3(0, 1, 0) }, uMoonDir: { value: new THREE.Vector3(1, 0.3, 0).normalize() },
    uCLit: { value: new THREE.Color() }, uCShd: { value: new THREE.Color() }, uCumLit: { value: new THREE.Color() }, uCumShd: { value: new THREE.Color() },
    uMtn: { value: new THREE.Color() }, uMoab: { value: new THREE.Color() },
    uGlow: { value: 1 }, uDisc: { value: 1 }, uSkyI: { value: 1 }, uCov: { value: 0.4 }, uCA: { value: 1 }, uCum: { value: 0 },
    uTime: { value: 0 }, uMoon: { value: 0 }, uStar: { value: 0 }, uNoise: { value: noise },
    uMoonPh: { value: new THREE.Vector3(-1, 1, 1) }, uMoonSun: { value: new THREE.Vector3(-1, -0.25, 0.1).normalize() },   // ── world12 ── (full until told)
  });
  const uniforms = U(), envU = U();
  const mat = (u, env) => new THREE.ShaderMaterial({ uniforms: u, vertexShader: VS, fragmentShader: FS, defines: env ? { ENV: 1 } : {}, side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false });
  const dome = new THREE.Mesh(new THREE.SphereGeometry(5000, 48, 32), mat(uniforms, false));
  dome.renderOrder = -10; dome.frustumCulled = false; dome.name = 'sky';
  const envScene = new THREE.Scene();
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(100, 32, 16), mat(envU, true)));

  // stars: brightness and tint vary, fainter near the horizon; night only; depth-tested (hills hide them)
  const r = rng(12), n = 1600, sp = new Float32Array(n * 3), sc = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const a = r() * Math.PI * 2, s = 0.035 + r() * 0.965, e = Math.asin(s), t = r();
    const b = (Math.pow(r(), 3) * 0.85 + 0.15) * Math.min(1, 0.25 + s * 3);
    sp.set([Math.cos(a) * Math.cos(e) * 4600, Math.sin(e) * 4600, Math.sin(a) * Math.cos(e) * 4600], i * 3);
    sc.set([b * (t < 0.2 ? 1 : 0.86), b * 0.92, b * (t > 0.8 ? 1 : 0.86)], i * 3);
  }
  const sg = new THREE.BufferGeometry(); sg.setAttribute('position', new THREE.BufferAttribute(sp, 3)); sg.setAttribute('color', new THREE.BufferAttribute(sc, 3));
  const stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 1.8, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.95, depthWrite: false, depthTest: true, fog: false }));
  stars.renderOrder = -9; stars.frustumCulled = false; stars.visible = false;
  dome.add(stars);

  const cur = {}, fog = new THREE.Color(), tmp = new THREE.Color(), tmp2 = new THREE.Color(), moonDir = new THREE.Vector3();
  let key = 'dawn', over = 0;
  let clearK = 0, moonLit = 1;   // ── world12 ── the night's clear sky and the moon's lit fraction (setMoon)
  const COLS = ['zen', 'horA', 'horS', 'fog', 'belt', 'cLit', 'cShd', 'cumLit', 'cumShd', 'mtn', 'moab'], NUMS = ['glow', 'disc', 'skyI', 'cov', 'cA', 'cum', 'moon', 'star'];
  function apply() {
    const P = SKY[key] || SKY.dawn, night = !!P.moon;
    for (const k of COLS) {
      tmp.set(P[k]);
      if (over > 0) { tmp2.set(RAIN[k]); if (night) tmp2.multiplyScalar(0.1); tmp.lerp(tmp2, over); }
      (cur[k] || (cur[k] = new THREE.Color())).copy(tmp);
    }
    for (const k of NUMS) cur[k] = P[k] + ((RAIN[k] !== undefined ? RAIN[k] : P[k]) - P[k]) * over;
    if (night) { cur.moon = P.moon * (1 - over); cur.star = P.star * (1 - over); cur.glow = P.glow * (1 - over); }
    // ── world12 ── a dry night by the calendar is clear: thinner clouds, and more stars when the moon is thin
    if (night && clearK > 0) { cur.cov *= 1 - 0.45 * clearK; cur.cA *= 1 - 0.2 * clearK; cur.star *= 1 + 0.3 * clearK * (1 - moonLit); cur.glow *= 0.3 + 0.7 * moonLit; }
    if (P.moonAz !== undefined) {
      const a = THREE.MathUtils.degToRad(P.moonAz), e = THREE.MathUtils.degToRad(P.moonEl);
      moonDir.set(Math.cos(e) * Math.cos(a), Math.sin(e), Math.cos(e) * Math.sin(a));
    }
    for (const [u, env] of [[uniforms, false], [envU, true]]) {
      u.uZen.value.copy(cur.zen); u.uHorA.value.copy(cur.horA); u.uHorS.value.copy(cur.horS); u.uFog.value.copy(cur.fog); u.uBelt.value.copy(cur.belt);
      u.uCLit.value.copy(cur.cLit); u.uCShd.value.copy(cur.cShd); u.uCumLit.value.copy(cur.cumLit); u.uCumShd.value.copy(cur.cumShd);
      u.uMtn.value.copy(cur.mtn); u.uMoab.value.copy(cur.moab); u.uSunCol.value.set(P.sun); u.uMoonDir.value.copy(moonDir);
      u.uGlow.value = cur.glow * (env ? 0.5 : 1); u.uDisc.value = env ? 0 : cur.disc; u.uSkyI.value = cur.skyI; u.uCov.value = cur.cov;
      u.uCA.value = cur.cA * (env ? 0.7 : 1); u.uCum.value = cur.cum; u.uMoon.value = cur.moon; u.uStar.value = cur.star;
    }
    // the fog (aerial perspective) is the haze the horizon melts into, as bright as the sky shows it
    fog.copy(cur.fog).multiplyScalar(cur.skyI);
    stars.visible = cur.star > 0.02;
    stars.material.opacity = Math.min(1, 0.95 * cur.star);
  }
  return {
    dome, uniforms, envScene, envU, stars, noise, fogColor: fog,
    /** cloud meshes drawn without depth test (sanctuary.js hides them inside the rooms): none now — the clouds are in the dome */
    clouds: [],
    /** the preset (dawn|noon|dusk|night|golden) and the sun's (at night: the moonlight's) direction */
    set(k, dir) { key = SKY[k] ? k : 'dawn'; if (dir) { uniforms.uSunDir.value.copy(dir).normalize(); envU.uSunDir.value.copy(uniforms.uSunDir.value); } apply(); },
    /** 0 clear … 1 overcast (the building's night rain); true when it changed */
    setOvercast(k) { const v = Math.max(0, Math.min(1, +k || 0)); if (Math.abs(v - over) < 1e-3 && !(v === 0 && over !== 0)) return false; over = v; apply(); return true; },
    get overcast() { return over; },
    // ── world12 ── the moon at its phase by the Hebrew date (weather.js moonOf → { age, lit, waxing }) and a clear dry night
    setMoon(m, clear = true) {
      const SYN = 29.530589, age = m && isFinite(m.age) ? m.age : 14.75, a = 2 * Math.PI * age / SYN;
      moonLit = m && isFinite(m.lit) ? m.lit : (1 - Math.cos(a)) / 2; clearK = clear ? 1 : 0;
      for (const u of [uniforms, envU]) u.uMoonPh.value.set(Math.cos(a), age < SYN / 2 ? 1 : -1, moonLit);
      apply();
      return { age, lit: moonLit, clear: !!clear };
    },
    get moon() { return { lit: moonLit, clear: clearK > 0, ph: uniforms.uMoonPh.value.toArray() }; },
    get key() { return key; },
    update(dt) { uniforms.uTime.value += dt; },
  };
}
