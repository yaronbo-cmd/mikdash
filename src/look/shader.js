/* ── look A ── src/look/shader.js — ONE material family for everything the player handles: dressed stone, paving slabs, rock skin and
 * fresh breaks, wood, rope, iron, cloth (docs/specs/look/A-things-in-hand.md). A MeshStandardMaterial patched in onBeforeCompile, so the
 * lighting, shadows, fog and tone mapping stay three.js's own; every kind is the SAME program (a uniform picks the kind), the variation
 * of each stone comes from its colour (material.color on a clone that shares the program, instanceColor, or vertex colours) — never a
 * texture per stone. Detail is mapped by box projection in object space multiplied by the object's scale (read from the model /
 * instance matrix), so the grain is the same size on a 1-amah stone and on the great stone, and never stretches.
 *
 *   lookMat(THREE, kind, { color, tex, set, margin, boss, fresh, rough, metal, side }) → MeshStandardMaterial
 *   lookClone(mat, color?) → a clone sharing the program (its own uniforms) · lookSet(mat, k) (dust at the foot 0..1) · lookFresh(mat, k)
 *   KIND = { stone, slab, rock, fresh, wood, rope, iron, cloth } · lookHi() → the fine relief on (Q.level 'high' only)
 * ── /look A ── */
export const KIND = Object.freeze({ stone: 0, slab: 1, rock: 2, fresh: 3, wood: 4, rope: 5, iron: 6, cloth: 7 });

/** the fine relief (bump from the detail, shader octaves) only at Q.level 'high'; 'low' and 'normal' keep colours, tints and shapes */
export function lookHi() {
  try { const q = globalThis.__LOOK_Q || globalThis.__FORCE_Q; return q === 'high'; } catch (e) { return false; }
}

const VERT_COMMON = /* glsl */`
uniform vec4 uLk; uniform vec4 uLk2;
varying vec3 vLkP; varying vec3 vLkU; varying vec3 vLkN; varying vec3 vLkS; varying vec3 vLkW; varying vec3 vLkG; varying vec3 vLkWN;`;

// (after begin_vertex: the scale from the matrices, the boss's margin in amot, the varyings)
const VERT_MAIN = /* glsl */`
#ifdef USE_INSTANCING
  mat4 lkM = modelMatrix * instanceMatrix;
#else
  mat4 lkM = modelMatrix;
#endif
  vec3 lkS = max(vec3(length(lkM[0].xyz), length(lkM[1].xyz), length(lkM[2].xyz)), vec3(1e-4));
  // a boss vertex of the ashlar (uv.x 2: its foot, 3: its top inset by the chamfer): the drafted margin is a fixed width in amot
  if (uLk.x < 0.5 && uv.x > 1.5 && uv.x < 3.5) {
    float lkRing = uv.x > 2.5 ? 1.0 : 0.0;
    vec2 lkMg = min((uLk.z + lkRing * 0.03) / lkS.xy, vec2(0.4 - lkRing * 0.02));
    transformed.x = sign(position.x) * (0.5 - lkMg.x); transformed.y = sign(position.y) * (0.5 - lkMg.y);
  }
  vLkU = transformed; vLkS = lkS; vLkP = transformed * lkS; vLkN = normal;
  vLkW = (lkM * vec4(transformed, 1.0)).xyz; vLkWN = mat3(lkM) * normal;   // (the world normal, for rock's up-facing facets)
  // (wood: the grain runs along the member's longest axis — every corner of a box or a beam's end agrees on it)
  vec3 lkE = abs(position) * lkS;
  vLkG = lkE.x >= lkE.y && lkE.x >= lkE.z ? vec3(1.0, 0.0, 0.0) : (lkE.y >= lkE.z ? vec3(0.0, 1.0, 0.0) : vec3(0.0, 0.0, 1.0));`;

const FRAG_COMMON = /* glsl */`
uniform vec4 uLk; uniform vec4 uLk2; uniform sampler2D uDet;
varying vec3 vLkP; varying vec3 vLkU; varying vec3 vLkN; varying vec3 vLkS; varying vec3 vLkW; varying vec3 vLkG; varying vec3 vLkWN;
float lkH1(float n) { return fract(sin(n) * 43758.5453); }
// (a hash without sin: cheap on a software renderer)
float lkH3(vec3 p) { p = fract(p * 0.1031); p += dot(p, p.zyx + 31.32); return fract((p.x + p.y) * p.z); }
float lkN3(vec3 p) { vec3 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(lkH3(i), lkH3(i + vec3(1, 0, 0)), f.x), mix(lkH3(i + vec3(0, 1, 0)), lkH3(i + vec3(1, 1, 0)), f.x), f.y),
             mix(mix(lkH3(i + vec3(0, 0, 1)), lkH3(i + vec3(1, 0, 1)), f.x), mix(lkH3(i + vec3(0, 1, 1)), lkH3(i + vec3(1, 1, 1)), f.x), f.y), f.z); }
vec2 lkTurn(vec2 p, float q) { return q < 0.5 ? p : q < 1.5 ? vec2(-p.y, p.x) : q < 2.5 ? -p : vec2(p.y, -p.x); }
// box projection of the detail by object position × scale (tile in amot), turned and offset by the stone's own seed
// (bias: a coarser mip — the rock texture's per-texel grain, at the rock's full contrast, read as a screen grid)
vec3 lkTri(vec3 p, vec3 n, float tile, float s, float bias) {
  vec3 w = pow(abs(n), vec3(4.0)); w /= max(1e-4, w.x + w.y + w.z);
  vec2 o = vec2(fract(s * 7.31), fract(s * 3.17)); float q = floor(fract(s * 5.13) * 4.0);
  // (only the faces that weigh: one sample on a box's face, not three; the gradients taken before the branches)
  vec2 ua = lkTurn(p.zy / tile, q) + o, ub = lkTurn(p.xz / tile, q) + o.yx, uc = lkTurn(p.xy / tile, q) + o * 1.7, k = vec2(exp2(bias));
  vec2 ax = dFdx(ua) * k, ay = dFdy(ua) * k, bx = dFdx(ub) * k, by = dFdy(ub) * k, cx = dFdx(uc) * k, cy = dFdy(uc) * k;
  vec3 r = vec3(0.0);
  if (w.x > 0.02) r += textureGrad(uDet, ua, ax, ay).rgb * w.x;
  if (w.y > 0.02) r += textureGrad(uDet, ub, bx, by).rgb * w.y;
  if (w.z > 0.02) r += textureGrad(uDet, uc, cx, cy).rgb * w.z;
  return r / max(1e-4, (w.x > 0.02 ? w.x : 0.0) + (w.y > 0.02 ? w.y : 0.0) + (w.z > 0.02 ? w.z : 0.0));
}
float lkLum(vec3 c) { return dot(c, vec3(0.333)); }
float lkHt = 0.5;   // (the height for the relief, 'high' only)
vec3 lkLook(vec3 base) {
  float kind = uLk.x, set = uLk.y, fresh = uLk.w;
  // (the stone's own seed, from its colour; uLk2.z: from the material's alone, when vertex colours shade across a face)
  float s = fract(sin(dot(uLk2.z > 0.5 ? diffuse : base, vec3(12.9898, 78.233, 37.719)) * 1.37) * 43758.5453);
  vec3 P = vLkP, U = vLkU, S = vLkS, N = normalize(vLkN);
  vec3 col = base;
  if (kind < 1.5) {
    // ── dressed limestone (0: an ashlar · 1: a paving slab) ──
    float val = 1.0 + (fract(s * 13.7) - 0.5) * 0.06;
    float d = lkLum(lkTri(P, N, 2.5, s, 0.0)), amp = 1.0;
    bool side = abs(N.z) > 0.7, top = N.y > 0.7, vert = abs(N.y) < 0.5;
    float boss = 0.0, strokes = 0.0;
    if (kind < 0.5) {
      if (side && uLk2.x > 0.5) {
        vec2 e = vec2((0.5 - abs(U.x)) * S.x, (0.5 - abs(U.y)) * S.y);
        boss = smoothstep(uLk.z - 0.02, uLk.z + 0.02, min(e.x, e.y));
        amp = mix(1.0, 1.6, boss);
        // the drafted margin: fine diagonal chisel strokes, 14 to the amah, faint
        strokes = (1.0 - boss) * smoothstep(0.55, 1.0, 0.5 + 0.5 * sin(6.2832 * 14.0 * (P.x + P.y) * 0.7071 + 2.0 * lkN3(P * 3.0))) * smoothstep(0.3, 0.6, lkN3(P * 1.7 + 4.0));
        col *= mix(1.03, 0.92, boss) * (1.0 - 0.05 * strokes);
      } else {
        // the comb chisel: parallel strokes across the top, the bottom and the ends
        float a = abs(N.x) > 0.7 ? P.z + 0.3 * P.y : P.x + 0.15 * P.z;
        strokes = smoothstep(0.6, 1.0, 0.5 + 0.5 * sin(6.2832 * 9.0 * a + 2.5 * lkN3(P * 2.3))) * smoothstep(0.3, 0.65, lkN3(P * 1.3 + 9.0));
        col *= 1.0 - 0.035 * strokes;
      }
      // the dust at its foot once it is laid (fresh stones on the pile or the rope: 4 % lighter and clean)
      if (vert) { float foot = 1.0 - smoothstep(0.0, 0.12, U.y + 0.5); col = mix(col, col * vec3(0.84, 0.78, 0.68), foot * set * 0.75); }
      col *= mix(1.04, 1.0, set);
    } else {
      // a paving slab: the top smooth-worn (weaker detail, fine chisel, soft clouds), the sides rough-pecked
      if (top) { float cl = lkN3(P * 0.55 + s * 9.0), wr = lkN3(P * 2.1 + s * 3.0); amp = 0.75; col *= (0.9 + 0.18 * cl) * (0.97 + 0.06 * wr);
        strokes = smoothstep(0.7, 1.0, 0.5 + 0.5 * sin(6.2832 * 14.0 * (P.x * 0.94 + P.z * 0.34) + 2.0 * lkN3(P * 2.0))); col *= 1.0 - 0.03 * strokes; }
      else { amp = 1.4; col *= 0.93; }
    }
    // (a warm hair: the sky's blue fill otherwise greys the cream)
    col *= val * mix(1.0, mix(0.78, 1.16, d), amp) * vec3(1.03, 1.0, 0.93);
    lkHt = d * amp + strokes * 0.4;
  } else if (kind < 3.5) {
    // ── rock (2: the weathered skin, lerped to the fresh break by uLk.w · 3: a fresh break) ──
    // (the world normal from the interpolated one: screen derivatives here gave a 2 × 2-pixel grain on SwiftShader)
    vec3 wN = normalize(vLkWN);
    float f = kind > 2.5 ? 1.0 : clamp(fresh, 0.0, 1.0);
    // (3 amot to the tile, a coarser mip: the grain soft; each sampled only when it shows — f is the material's, a uniform branch)
    vec3 t = vec3(0.43), tf = vec3(0.43);
    if (f < 0.999) t = lkTri(P, N, 3.0, s, 1.6);
    if (f > 0.001) tf = lkTri(P * 1.7, N, 3.0, s + 0.5, 0.8);
    // the skin: grey-brown, darker on the up-facing facets, lichen flecks there, soft bedding lines by height (3 to the amah)
    float up = smoothstep(0.25, 0.9, wN.y);
    vec3 skin = base * mix(vec3(1.0), t / 0.43, 0.85) * mix(1.0, 0.82, up);   // (0.43: the rock texture's mean, linear)
    skin = mix(skin, skin * vec3(0.92, 0.9, 0.88), up * 0.6);
    if (f < 0.999) {
      float li = smoothstep(0.72, 0.78, lkN3(vLkW * 2.6)) * up;
      skin = mix(skin, vec3(0.62, 0.62, 0.55) * lkLum(skin) * 1.5, li * 0.55);
      float bed = smoothstep(0.82, 1.0, abs(fract(vLkW.y * 3.0 + 0.6 * lkN3(vLkW * 0.6)) * 2.0 - 1.0));
      skin *= 1.0 - 0.09 * bed * (1.0 - up);
    }
    // the fresh break: near-white cream, clean, a sharper grain
    vec3 fr = (kind > 2.5 ? base : vec3(0.73, 0.69, 0.61)) * mix(0.8, 1.14, lkLum(tf) / 0.43) * (1.0 + (fract(s * 7.7) - 0.5) * 0.05);
    col = mix(skin, fr, f);
    lkHt = lkLum(mix(t, tf, f));
  } else if (kind < 4.5) {
    // ── wood: the grain along the member's longest axis, lighter end grain with rings ──
    vec3 G = vLkG; float along = dot(P, G);
    vec3 b1 = G.x > 0.5 ? vec3(0, 1, 0) : vec3(1, 0, 0), b2 = cross(G, b1);
    float across = dot(P, b1) + dot(P, b2);
    if (abs(dot(N, G)) > 0.7) {
      float r = length(P - G * along);
      float ring = 0.5 + 0.5 * sin(r * 55.0 + 3.0 * lkN3(P * 4.0));
      col *= 1.12 * (0.9 + 0.1 * ring); lkHt = ring;
    } else {
      vec3 w = texture2D(uDet, vec2(along / 2.2 + s * 3.1, across / 0.55 + s * 1.3)).rgb;
      col *= mix(0.78, 1.16, lkLum(w)); lkHt = lkLum(w);
    }
  } else if (kind < 5.5) {
    // ── rope: twisted strands, slightly fuzzy ──
    float st = 0.5 + 0.5 * sin(6.2832 * (P.x + P.y + P.z) / 0.25 * 0.577);
    col *= (0.8 + 0.22 * st) * (0.94 + 0.08 * lkN3(P * 30.0)); lkHt = st;
  } else if (kind < 6.5) {
    // ── iron: dark grey, small bright wear on the edges ──
    float e = smoothstep(0.78, 0.86, lkN3(P * 18.0 + s * 5.0));
    col = mix(col * (0.9 + 0.15 * lkN3(P * 12.0)), col * 2.1, e * 0.7); lkHt = 0.5 + 0.3 * e;
  } else {
    // ── cloth: the weave and soft folds ──
    float wv = 0.5 + 0.25 * (sin(P.x * 140.0) + sin(P.y * 140.0));
    col *= (0.9 + 0.1 * wv) * (0.88 + 0.12 * (0.5 + 0.5 * sin(P.x * 5.0 + P.y * 2.0))); lkHt = wv * 0.3;
  }
  return col;
}
vec3 lkBump(vec3 surfPos, vec3 surfNorm, float h, float k, float faceDir) {
  vec2 dH = vec2(dFdx(h), dFdy(h)) * k;
  vec3 sx = dFdx(surfPos), sy = dFdy(surfPos), r1 = cross(sy, surfNorm), r2 = cross(surfNorm, sx);
  float det = dot(sx, r1) * faceDir;
  vec3 g = sign(det) * (dH.x * r1 + dH.y * r2);
  return normalize(abs(det) * surfNorm - g);
}`;

const TEX = new WeakMap();
/** the grey detail for the kinds without their own: a 4 × 4 mid-grey (a flat detail) */
function flatTex(THREE) {
  let t = TEX.get(THREE); if (t) return t;
  t = new THREE.DataTexture(new Uint8Array(16 * 4).fill(160), 4, 4); t.needsUpdate = true; t.wrapS = t.wrapT = THREE.RepeatWrapping;
  TEX.set(THREE, t); return t;
}

/** a material of the family. o.tex: the detail (stone / rock / wood); o.set: dust at the foot; o.margin: the drafted margin (amot);
 *  o.boss: false for a plain block (no margin); o.fresh: rock → fresh break 0..1 */
export function lookMat(THREE, kind, o = {}) {
  const K = typeof kind === 'number' ? kind : KIND[kind];
  const m = new THREE.MeshStandardMaterial({
    color: o.color || '#D4CDC0',
    roughness: o.rough ?? (K === KIND.iron ? 0.5 : K === KIND.wood ? 0.82 : K === KIND.cloth ? 0.9 : 0.9),
    metalness: o.metal ?? (K === KIND.iron ? 0.6 : 0),
    side: o.side || THREE.FrontSide, vertexColors: !!o.vertexColors,
  });
  m.userData.look = { kind: K, set: o.set || 0, margin: o.margin ?? 0.22, fresh: o.fresh || 0, boss: o.boss === false ? 0 : 1, flat: K === KIND.rock || K === KIND.fresh ? 1 : 0 };
  m.userData.lookTex = o.tex || flatTex(THREE); m.userData.lookBase = true;   // (a shared base: never disposed by a prop's removal)
  install(THREE, m);
  return m;
}
const HI = () => lookHi();
function install(THREE, m) {
  const hi = HI();
  if (hi) m.defines = Object.assign({}, m.defines, { LOOK_HI: '' });
  // (the uniforms read the material's own userData every frame: a clone gets its own values on the shared program)
  m.onBeforeCompile = function (sh) {
    const mat = this, v1 = new THREE.Vector4(), v2 = new THREE.Vector4();
    sh.uniforms.uLk = { get value() { const L = mat.userData.look; return v1.set(L.kind, L.set, L.margin, L.fresh); } };
    sh.uniforms.uLk2 = { get value() { const L = mat.userData.look; return v2.set(L.boss, L.flat, L.mseed || 0, 0); } };
    sh.uniforms.uDet = { get value() { return mat.userData.lookTex; } };
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\n' + VERT_COMMON)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n' + VERT_MAIN);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\n' + FRAG_COMMON)
      .replace('#include <color_fragment>', '#include <color_fragment>\n  diffuseColor.rgb = lkLook(diffuseColor.rgb);')
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
  // (rock: its flat facets, from the screen derivatives — the program stays the one of the whole family)
  if (uLk2.y > 0.5) { vec3 lkFn = normalize(cross(dFdx(vViewPosition), dFdy(vViewPosition))); normal = lkFn; }
#ifdef LOOK_HI
  normal = lkBump(-vViewPosition, normal, lkHt, uLk.x < 1.5 ? 0.035 : uLk.x < 3.5 ? 0.05 : 0.02, faceDirection);
#endif`);
  };
  m.customProgramCacheKey = () => 'look-a' + (hi ? '-hi' : '');
}
/** a clone that shares the program, with its own colour and values */
export function lookClone(mat, color) {
  const c = mat.clone();
  c.userData.look = Object.assign({}, mat.userData.look); c.userData.lookTex = mat.userData.lookTex; delete c.userData.lookBase;   // (userData is JSON-copied by clone: the texture back by reference)
  c.onBeforeCompile = mat.onBeforeCompile; c.customProgramCacheKey = mat.customProgramCacheKey;
  if (color !== undefined && color !== null) c.color.set(color);
  return c;
}
export function lookSet(mat, k) { if (mat && mat.userData.look) mat.userData.look.set = k; }
export function lookFresh(mat, k) { if (mat && mat.userData.look) mat.userData.look.fresh = k; }
