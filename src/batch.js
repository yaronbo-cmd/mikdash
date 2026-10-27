// Static geometry batching: every piece is authored in world coordinates (1 unit = 1 amah),
// gets world-projected UVs and a floor-level attribute for cheap ground occlusion,
// then all pieces sharing a material are merged into a single mesh.
// Geometry can be routed into named sets (build stages) with Batch.stage(id); each set is
// merged separately so a stage can be shown, hidden or revealed on its own.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

// shared animation clock for the construction shaders (gold shimmer on the cut line)
export const BUILD_TIME = { value: 0 };
// ── twin18 ── the see-through under two thumbs (PRINCIPLES §3: "קירות שמסתירים… הופך לשקוף למחצה"): what stands between the camera
// and the kohen, above his knees, inside a cone to him, is dithered away (screen-door half-transparency; shadows stay whole).
// uXr = his chest (xyz) and on (w); uXrC = the camera. stages.js fills them each frame while twin is ON.
export const XRAY = { uXr: { value: new THREE.Vector4(0, 0, 0, 0) }, uXrC: { value: new THREE.Vector3() },
  // ── fable32 (build 46) ── his stretch of the court wall (har42 wallStones45): the model's outer skin there (x0…x1, z0…z1, below yTop; below
  // gyTop west of gx1, the giant's slot) and the scaffold in front of it (zOut…z0) are not drawn — his own stones ARE the wall there
  uHole: { value: new THREE.Vector4(0, 0, 0, 0) }, uHole2: { value: new THREE.Vector4(0, 0, 0, 0) }, uHole3: { value: new THREE.Vector4(-1e6, 0, 0, 0) }, uHoleB: { value: new THREE.Vector4(0, 0, 0, 0) } };   // (uHoleB: stage 03 — the model's soreg where his lattice panels stand, below uHole3.y)
// ── /twin18 ──
// ── twin18 ── the see-through's shader code (a varying for the world position, a dithered discard in a cone to him); used by every
// patched building material here and by the cranes (stages.js)
export function xrayCode(vs, fs, sh) {
  if (!(fs.includes('#include <clipping_planes_fragment>') && vs.includes('#include <project_vertex>'))) return { vs, fs };
    sh.uniforms.uXr = XRAY.uXr; sh.uniforms.uXrC = XRAY.uXrC; sh.uniforms.uHole = XRAY.uHole; sh.uniforms.uHole2 = XRAY.uHole2; sh.uniforms.uHole3 = XRAY.uHole3; sh.uniforms.uHoleB = XRAY.uHoleB;
    vs = vs.replace('#include <common>', '#include <common>\nvarying vec3 vXrW;')
      .replace('#include <project_vertex>', `#include <project_vertex>
#ifdef USE_INSTANCING
  vXrW = (modelMatrix * instanceMatrix * vec4(transformed, 1.0)).xyz;
#else
  vXrW = (modelMatrix * vec4(transformed, 1.0)).xyz;
#endif`);
    fs = fs.replace('#include <common>', '#include <common>\nvarying vec3 vXrW; uniform vec4 uXr; uniform vec3 uXrC; uniform vec4 uHole; uniform vec4 uHole2; uniform vec4 uHole3; uniform vec4 uHoleB;')
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
  if (uHole.y > uHole.x && vXrW.x > uHole.x && vXrW.x < uHole.y && vXrW.z < uHole.w && ((vXrW.z > uHole.z && vXrW.y > uHole3.x && vXrW.y < (vXrW.x < uHole2.z ? uHole2.w : uHole2.y)) || (vXrW.z > uHole2.x && vXrW.z <= uHole.z))) discard;
  if (uHoleB.y > uHoleB.x && vXrW.x > uHoleB.x && vXrW.x < uHoleB.y && vXrW.z > uHoleB.z && vXrW.z < uHoleB.w && vXrW.y < uHole3.y) discard;
  if (uXr.w > 0.5 && vXrW.y > uXr.y - 0.9) {
    vec3 xrC = uXr.xyz - uXrC; float xrL = length(xrC); vec3 xrU = xrC / max(xrL, 0.001);
    vec3 xrP = vXrW - uXrC; float xrT = dot(xrP, xrU);
    if (xrT > 0.0 && xrT < xrL - 1.6) {
      float xrK = length(xrP - xrU * xrT) / ((1.8 + 2.4 * xrT / xrL) * (uXr.w > 1.5 ? 1.7 : 1.0));   // (craftb19: w 2 = a craft's box — wider, and fully clear)
      float xrN = fract(52.9829189 * fract(dot(gl_FragCoord.xy, vec2(0.06711056, 0.00583715))));
      if (xrK < 1.0 && (uXr.w > 1.5 ? xrK < 0.92 || xrN < 1.0 - smoothstep(0.92, 1.0, xrK) : xrN < 0.66 * (1.0 - smoothstep(0.55, 1.0, xrK)))) discard;
    }
  }`);
  return { vs, fs };
}
// ── /twin18 ──

const f3 = (x) => x.toFixed(3);

// One patch for everything: ground occlusion + macro variation (gao) and, behind the BCLIP define,
// the construction reveal (bc). Wave 6: the site rises STONE BY STONE and course by course. Each fragment of a jointed stone
// material (ash / ashBig / ash2 / marble, and the altar's field stones) finds its own stone from the texture's joint layout
// (row + block edges, uBcE), snaps to the stone's centre, and is shown iff the stone's course is below the current one, or it
// is in the current course and its crew's working front has passed it (per-front thresholds uBcTh). The fronts run along the
// footprint rects' perimeters (uBcRect / uBcRK). The next slots at the working front are drawn as thin gold outlines (ghost),
// the latest stone glows as it settles; back faces seen through the unfinished course are shaded as the stone cap (stepped).
// Without a footprint (uBcC.w = 0: the kiyor's pours) it is the old horizontal cut at uBuildY with a glowing melt line.
export const BC_RECTS = 6, BC_FRONTS = 32;
export function revealUniforms() {
  const v4 = (n) => Array.from({ length: n }, () => new THREE.Vector4());
  return {
    uY: { value: 1e6 }, uGlow: { value: new THREE.Color(0, 0, 0) },
    uC: { value: new THREE.Vector4(0, 2, 0, 0) },            // y0 (the first course's bottom), H (course height), current course, rects
    uRect: { value: v4(BC_RECTS) }, uRK: { value: v4(BC_RECTS) },   // rect x0 z0 x1 z1 · (sectors K, perimeter L, s0, first front)
    uTh: { value: v4(BC_FRONTS / 4) },                          // per front: the local threshold of the current course
    uW: { value: new THREE.Vector4(0, 0, 0, -9) },            // working front: ghost threshold, fresh stone p0, p1, its course
    uF: { value: new THREE.Vector4(0, 0, 0, -1e6) },          // fresh fade, field stones (0…1), finish (0…1), finish height
  };
}
const BC_FRONT_GLSL = `
vec2 bcFrontOf(vec2 q) {
  int nR = int(uBcC.w + 0.5), best = 0; float bs = 1e9;
  for (int i = 0; i < ${BC_RECTS}; i++) {
    if (i >= nR) break;
    vec4 R = uBcRect[i]; vec2 c = clamp(q, R.xy, R.zw); float dO = length(q - c);
    float dI = min(min(q.x - R.x, R.z - q.x), min(q.y - R.y, R.w - q.y));
    float sc = dO > 0.0 ? dO + 1000.0 : -1.0 / (1.0 + dI);
    if (sc < bs) { bs = sc; best = i; }
  }
  vec4 R = uBcRect[best], K = uBcRK[best]; vec2 c = clamp(q, R.xy, R.zw);
  float W = R.z - R.x, D = R.w - R.y, eN = c.y - R.y, eS = R.w - c.y, eW = c.x - R.x, eE = R.z - c.x, m = min(min(eN, eS), min(eW, eE)), s;
  if (m == eN) s = c.x - R.x; else if (m == eE) s = W + c.y - R.y; else if (m == eS) s = W + D + R.z - c.x; else s = 2.0 * W + D + R.w - c.y;
  float u = fract((s - K.z) / K.y) * K.x, f = min(floor(u), K.x - 1.0);
  return vec2(K.w + f, u - f);
}
float bcThOf(float fi) { int i = int(fi + 0.5); vec4 t = uBcTh[i / 4]; int k = i - (i / 4) * 4; return k == 0 ? t.x : k == 1 ? t.y : k == 2 ? t.z : t.w; }
`;
// ── site13 ── two more reveals: a finish-only material with a cut of its own (uBcJ.z; uBcJ.w 1 = a height, 2 = laid along +x:
// the House's finish step by step, the Ezrat Nashim's cedar gallery) and a cut per footprint rect (uBcC.w < 0 rects, the cut in
// uBcRK[i].x: the Ezrat Nashim's corner chambers rising one at a time); bcCutY is the height the glowing line follows.
function patchShader(sh, gao, bc) {
  if (bc) {
    const U = bc.U;
    sh.uniforms.uBuildY = U.uY;
    sh.uniforms.uBcGlow = U.uGlow;
    sh.uniforms.uBcTile = { value: bc.tile };
    sh.uniforms.uBcTime = BUILD_TIME;
    sh.uniforms.uBcC = U.uC; sh.uniforms.uBcRect = U.uRect; sh.uniforms.uBcRK = U.uRK; sh.uniforms.uBcTh = U.uTh;
    sh.uniforms.uBcW = U.uW; sh.uniforms.uBcF = U.uF;
    sh.uniforms.uBcJ = bc.J; sh.uniforms.uBcE = bc.E;
  }
  let vs = sh.vertexShader, fs = sh.fragmentShader;
  if (gao) {
    const { strength, range, macro } = gao;
    vs = vs
      .replace('#include <common>', '#include <common>\nattribute float aBase;\nvarying float vAoH;\nvarying vec2 vWXZ;')
      .replace('#include <worldpos_vertex>', '#include <worldpos_vertex>\nvWXZ = (modelMatrix * vec4(transformed, 1.0)).xz;')
      .replace('#include <begin_vertex>', gao.instanced
        ? '#include <begin_vertex>\nvAoH = position.y + aBase;'
        : '#include <begin_vertex>\nvAoH = (modelMatrix * vec4(transformed, 1.0)).y - aBase;');
    // (the reveal variant samples macro variation and occlusion at the cap point for back faces)
    const xz = bc ? `\n#ifdef BCLIP\n    vec2 gxz = bcFront ? vWXZ : bcP.xz;\n#else\n    vec2 gxz = vWXZ;\n#endif\n` : '\n    vec2 gxz = vWXZ;\n';
    fs = fs.replace('#include <common>', `#include <common>
        varying float vAoH; varying vec2 vWXZ;
        float gh21(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float gvn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
          return mix(mix(gh21(i), gh21(i + vec2(1.0, 0.0)), f.x), mix(gh21(i + vec2(0.0, 1.0)), gh21(i + vec2(1.0, 1.0)), f.x), f.y); }`)
      .replace('#include <map_fragment>', macro > 0 ? `#include <map_fragment>
        {${xz}    float mv = gvn(gxz / 55.0) * 0.65 + gvn(gxz / 13.0) * 0.35;
          diffuseColor.rgb *= mix(${f3(1 - macro)}, ${f3(1 + macro * 0.35)}, mv); }` : '#include <map_fragment>')
      .replace('#include <aomap_fragment>', `#include <aomap_fragment>
      {
        float gao = smoothstep(0.0, ${range.toFixed(2)}, vAoH);
        ${bc ? 'if (!bcFront) gao = 1.0;' : ''}
        reflectedLight.indirectDiffuse *= mix(${f3(1 - strength)}, 1.0, gao);
        reflectedLight.indirectSpecular *= mix(${f3(1 - strength)}, 1.0, gao);
        reflectedLight.directDiffuse *= mix(${f3(1 - strength * 0.4)}, 1.0, gao);
      }`);
  }
  if (bc) {
    vs = vs
      .replace('#include <common>', '#include <common>\n#ifdef BCLIP\nvarying vec3 vBcW; varying vec3 vBcN;\n#endif')
      // (wave 7) a building solid's bottom lies on the finished work below it (the sovev on the yesod): lifted a hair while it
      // builds, its back face — the cap of the course below — no longer z-fights with that top (the altar's striped top)
      .replace('#include <begin_vertex>', '#include <begin_vertex>\n#ifdef BCLIP\n  if (objectNormal.y < -0.5) transformed.y += 0.05;\n#endif')
      .replace('#include <project_vertex>', `#include <project_vertex>
#ifdef BCLIP
  { vec4 bcw = vec4(transformed, 1.0); vec3 bcn = objectNormal;
  #ifdef USE_INSTANCING
    bcw = instanceMatrix * bcw; bcn = mat3(instanceMatrix) * bcn;
  #endif
    vBcW = (modelMatrix * bcw).xyz; vBcN = mat3(modelMatrix) * bcn; }
#endif`);
    fs = fs
      .replace('#include <common>', `#include <common>
#ifdef BCLIP
varying vec3 vBcW; varying vec3 vBcN; uniform float uBuildY; uniform vec3 uBcGlow; uniform float uBcTile; uniform float uBcTime;
uniform vec4 uBcC; uniform vec4 uBcRect[${BC_RECTS}]; uniform vec4 uBcRK[${BC_RECTS}]; uniform vec4 uBcTh[${BC_FRONTS / 4}];
uniform vec4 uBcW; uniform vec4 uBcF; uniform vec4 uBcJ; uniform vec4 uBcE[24];
${BC_FRONT_GLSL}
#endif`)
      .replace('#include <clipping_planes_fragment>', `#include <clipping_planes_fragment>
  bool bcFront = true, bcWall = false;
#ifdef BCLIP
  bcFront = gl_FrontFacing;
  vec3 bcP = vBcW;
  float bcGhost = 0.0, bcFresh = 0.0, bcField = 0.0; vec4 bcBk = vec4(9.0); float bcId = 0.0;
  float bcGw = clamp(1.7 * max(fwidth(vBcW.x) + fwidth(vBcW.z), fwidth(vBcW.y)), 0.035, 0.5);
  float bcCutY = uBuildY;
  if (uBcJ.y > 0.5) {
    // gold plates / finish-only pieces: hidden until 'finish', then laid bottom-up
    bcCutY = uBcJ.w > 0.5 && uBcJ.w < 1.5 ? uBcJ.z : uBcF.w;
    if (uBcJ.w > 1.5) { if (vBcW.x > uBcJ.z) discard; bcCutY = 1e6; }
    else if (vBcW.y > bcCutY) discard;
  } else if (uBcC.w < -0.5) {
    int nR = int(0.5 - uBcC.w);
    for (int i = 0; i < ${BC_RECTS}; i++) {
      if (i >= nR) break;
      vec4 R = uBcRect[i];
      if (vBcW.x > R.x - 0.7 && vBcW.x < R.z + 0.7 && vBcW.z > R.y - 0.7 && vBcW.z < R.w + 0.7) { bcCutY = uBcRK[i].x; break; }
    }
    if (vBcW.y > bcCutY) discard;
    if (!bcFront) {
      vec3 bcRd = vBcW - cameraPosition;
      float bcT = abs(bcRd.y) > 1e-4 ? (bcCutY - cameraPosition.y) / bcRd.y : 1.0;
      bcP = cameraPosition + bcRd * clamp(bcT, 0.0, 1.0);
    }
  } else if (uBcC.w < 0.5) {
    if (vBcW.y > uBuildY) discard;
    if (!bcFront) {
      vec3 bcRd = vBcW - cameraPosition;
      float bcT = abs(bcRd.y) > 1e-4 ? (uBuildY - cameraPosition.y) / bcRd.y : 1.0;
      bcP = cameraPosition + bcRd * clamp(bcT, 0.0, 1.0);
    }
  } else {
    float bcH = uBcC.y, bcCur = uBcC.z, bcYB = uBcC.x + bcCur * bcH, bcYT = bcYB + bcH;
    if (bcFront) {
      vec3 bcN = normalize(vBcN);
      vec2 bxz = vBcW.xz; float by = vBcW.y; bool blk = false;
  #ifdef USE_MAP
      if (uBcJ.x > 0.5 && abs(bcN.y) < 0.5) {
        float rows = uBcJ.x, tl = uBcTile, fv = fract(vMapUv.y) * rows, rb = floor(fv), uu = fract(vMapUv.x);
        float eL = -1.0, eR = 2.0, e0 = 2.0, e1 = -1.0;
        int row = int(rb);
        for (int i = 0; i < 8; i++) {
          int j = row * 8 + i; vec4 t = uBcE[j / 4]; int k = j - (j / 4) * 4;
          float e = k == 0 ? t.x : k == 1 ? t.y : k == 2 ? t.z : t.w;
          if (e > 1.5) break;
          e0 = min(e0, e); e1 = max(e1, e);
          if (e <= uu && e > eL) eL = e;
          if (e > uu && e < eR) eR = e;
        }
        if (eL < -0.5) eL = e1 - 1.0;
        if (eR > 1.5) eR = e0 + 1.0;
        vec2 bT = abs(bcN.x) >= abs(bcN.z) ? vec2(0.0, bcN.x > 0.0 ? -1.0 : 1.0) : vec2(bcN.z > 0.0 ? 1.0 : -1.0, 0.0);
        bxz += bT * ((0.5 * (eL + eR) - uu) * tl);
        by += (rb + 0.5 - fv) * tl / rows;
        bcBk = vec4((uu - eL) * tl, (eR - uu) * tl, (fv - rb) * tl / rows, (rb + 1.0 - fv) * tl / rows);
        bcId = fract(sin(dot(floor(bxz * 4.0) + floor(by * 4.0), vec2(12.9898, 78.233))) * 43758.5453);
        blk = true;
      }
  #endif
      if (!blk && abs(bcN.y) >= 0.5) by -= 0.03;   // a top belongs to the course below it
      float cI = floor((by - uBcC.x) / bcH);
      vec2 fr = bcFrontOf(bxz);
      bool shown = cI < bcCur - 0.5 || (cI < bcCur + 0.5 && fr.y < bcThOf(fr.x));
      if (shown) {
        if (fr.x < 0.5 && abs(cI - uBcW.w) < 0.5 && fr.y >= uBcW.y && fr.y < uBcW.z) bcFresh = uBcF.x;
        if (blk) bcField = uBcF.y * (1.0 - uBcF.z);
      } else {
        float ed = min(min(bcBk.x, bcBk.y), min(bcBk.z, bcBk.w));
        if (blk && fr.x < 0.5 && abs(cI - bcCur) < 0.5 && fr.y < uBcW.x && ed < bcGw) bcGhost = 1.0;
        else discard;
      }
    } else {
      // back faces seen through the unfinished course: the top of the laid stones, else the top of the course below
      if (vBcW.y >= bcYT) discard;
      vec3 bcRd = vBcW - cameraPosition; bool bcDone = false;
      if (bcRd.y < -1e-4) {
        float t1 = (bcYT - cameraPosition.y) / bcRd.y;
        if (t1 > 0.0 && t1 < 1.0) { vec3 q = cameraPosition + bcRd * t1; vec2 f1 = bcFrontOf(q.xz); if (f1.y < bcThOf(f1.x)) { bcP = q; bcDone = true; } }
        if (!bcDone && vBcW.y < bcYB) { float t0 = (bcYB - cameraPosition.y) / bcRd.y; bcP = cameraPosition + bcRd * clamp(t0, 0.0, 1.0); bcDone = true; }
      }
      if (!bcDone && vBcW.y >= bcYB) {
        vec2 f2 = bcFrontOf(vBcW.xz); if (f2.y >= bcThOf(f2.x)) discard;
        // (wave 7) the inner side of a laid stone across the course, seen over the unlaid part: a vertical stone face with its own
        // map and normal — shading it as the cap smeared the planar map down the face (the stripes on the altar's wide top)
        bcWall = abs(normalize(vBcN).y) < 0.5;
      }
    }
  }
#endif`)
      .replace('#include <map_fragment>', `#ifdef BCLIP
#ifdef USE_MAP
  { vec2 bcUv = (bcFront || bcWall) && abs(normalize(vBcN).y) < 0.5 ? vMapUv : vec2(bcP.x, -bcP.z) / uBcTile; diffuseColor *= texture2D(map, bcUv); }   // tops: planar, like the caps (no stretched stripes)
#endif
  if (bcField > 0.0) {
    // whole field stones (Middot 3:4): rounded, unhewn, grey-brown, set in earth; the whitewash ('finish') covers them
    vec2 bq = vec2(min(bcBk.x, bcBk.y), min(bcBk.z, bcBk.w)); float rr = 0.28;
    float sd = (bq.x < rr && bq.y < rr) ? rr - length(vec2(rr) - bq) : min(bq.x, bq.y);
    float sm = smoothstep(0.03, 0.12, sd), sh2 = 0.78 + 0.22 * smoothstep(0.0, 0.4, sd);
    vec3 stc = mix(vec3(0.56, 0.52, 0.46), vec3(0.78, 0.74, 0.66), bcId) * sh2;
    diffuseColor.rgb = mix(diffuseColor.rgb, mix(vec3(0.33, 0.29, 0.24), stc, sm), bcField);
  }
#else
#include <map_fragment>
#endif`)
      .replace('#include <normal_fragment_maps>', `#include <normal_fragment_maps>
#ifdef BCLIP
  if (!bcFront && !bcWall) normal = normalize((viewMatrix * vec4(0.0, 1.0, 0.0, 0.0)).xyz);
#endif`)
      .replace('#include <emissivemap_fragment>', `#include <emissivemap_fragment>
#ifdef BCLIP
  if (uBcC.w < 0.5 || uBcJ.y > 0.5) {
    float bcY = bcCutY;
    float bcB = clamp(fwidth(vBcW.y) * 2.2, 0.55, 1.4);
    float bcE = bcFront ? smoothstep(bcY - bcB, bcY - bcB * 0.2, vBcW.y) : 0.035;
    float bcS = 0.78 + 0.22 * sin(uBcTime * 2.4 + (vBcW.x + vBcW.z) * 0.07);
    totalEmissiveRadiance += uBcGlow * bcE * bcS;
  } else {
    float bcS = 0.72 + 0.28 * sin(uBcTime * 3.2);
    if (bcGhost > 0.0) { diffuseColor.rgb *= 0.2; totalEmissiveRadiance += uBcGlow * 0.6 * bcS; }
    totalEmissiveRadiance += uBcGlow * bcFresh * 0.3;
  }
#endif`)
      .replace('#include <lights_fragment_begin>', THREE.ShaderChunk.lights_fragment_begin
        .split('( directLight.visible && receiveShadow )').join('( directLight.visible && receiveShadow && bcFront )'));
  }
  // ── twin18 ── the see-through (every patched building material)
  { const x = xrayCode(vs, fs, sh); vs = x.vs; fs = x.fs; }
  // ── /twin18 ──
  sh.vertexShader = vs; sh.fragmentShader = fs;
}

const gaoKey = (g) => (g ? `gao_${g.strength}_${g.range}_${g.instanced}_${g.macro}` : 'plain');

export function groundAO(mat, { strength = 0.5, range = 8, instanced = false, macro = 0 } = {}) {
  const gao = { strength, range, instanced, macro };
  mat.userData.gao = gao;
  mat.onBeforeCompile = (sh) => patchShader(sh, gao, null);
  mat.customProgramCacheKey = () => gaoKey(gao);
  return mat;
}

// A per-stage copy of a material that can be revealed from the bottom up.
// Material.clone() does not copy onBeforeCompile / customProgramCacheKey, so the patch is re-applied.
// The cache key equals the source material's key: with BCLIP undefined the program is identical and
// shared; while a stage is building, BCLIP (+ DoubleSide for the cap) selects the reveal variant.
// `U` is the stage's shared reveal uniforms (revealUniforms(); older callers' { uY, uGlow } are completed in place);
// `per` = this material's own { J: {value: Vector4(rows, finishOnly)}, E: {value: Vector4[24]} } (the texture's joints).
export function jointUniforms(rows = 0, edgesBottomFirst = null, finishOnly = false) {
  const E = Array.from({ length: 24 }, () => new THREE.Vector4(9, 9, 9, 9)), flat = [];
  for (let r = 0; r < 12; r++) for (let i = 0; i < 8; i++) flat.push(edgesBottomFirst && edgesBottomFirst[r] && i < edgesBottomFirst[r].length ? edgesBottomFirst[r][i] : 9);
  for (let i = 0; i < 24; i++) E[i].set(flat[i * 4], flat[i * 4 + 1], flat[i * 4 + 2], flat[i * 4 + 3]);
  return { J: { value: new THREE.Vector4(edgesBottomFirst ? rows : 0, finishOnly ? 1 : 0, 0, 0) }, E: { value: E } };
}
export function buildMaterial(src, U, tile = 10, per = null) {
  const m = src.clone();
  const gao = src.userData.gao || null;
  m.userData.gao = gao;
  if (!U.uC) { const d = revealUniforms(); for (const k of Object.keys(d)) if (!U[k]) U[k] = d[k]; }
  const pj = per || jointUniforms();
  const bc = { U, tile, J: pj.J, E: pj.E };
  m.userData.bcJ = pj;
  m.onBeforeCompile = (sh) => patchShader(sh, gao, bc);
  m.customProgramCacheKey = () => gaoKey(gao);
  if (src.side === THREE.FrontSide) m.shadowSide = THREE.BackSide;   // same shadow pass whether FrontSide or DoubleSide (reveal)
  m.userData.bcSide = src.side;
  m.userData.bcCap = src.side !== THREE.DoubleSide && !src.transparent && !src.alphaTest;
  return m;
}

// switch a build material between the plain (finished) and the reveal variant
export function setBuilding(m, on) {
  const has = !!(m.defines && m.defines.BCLIP !== undefined);
  if (has === on) return;
  m.defines = m.defines || {};
  if (on) { m.defines.BCLIP = ''; if (m.userData.bcCap) m.side = THREE.DoubleSide; }
  else { delete m.defines.BCLIP; m.side = m.userData.bcSide; }
  m.needsUpdate = true;
}

// shadow-pass material for a revealing stage (discards above the cut like the colour pass)
export function buildDepthMaterial(U) {
  const m = new THREE.MeshDepthMaterial();
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uBuildY = U.uY;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vBcY;')
      .replace('#include <project_vertex>', `#include <project_vertex>
  { vec4 bcw = vec4(transformed, 1.0);
  #ifdef USE_INSTANCING
    bcw = instanceMatrix * bcw;
  #endif
    vBcY = (modelMatrix * bcw).y; }`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', '#include <common>\nvarying float vBcY; uniform float uBuildY;')
      .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n  if (vBcY > uBuildY) discard;');
  };
  m.customProgramCacheKey = () => 'bcdepth';
  return m;
}

export class Batch {
  constructor(mats) { this.mats = mats; this.sets = { _: {} }; this.cur = '_'; this.lists = this.sets._; }

  // route the following pieces into set `id` ('_' = always-visible world)
  stage(id) { this.cur = id; this.lists = this.sets[id] || (this.sets[id] = {}); return this; }

  add(key, geo, base, opt = {}) {
    const m = this.mats[key];
    if (!m) throw new Error('unknown material ' + key);
    let g = geo.index ? geo.toNonIndexed() : geo;
    if (!g.attributes.normal) g.computeVertexNormals();
    for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a);
    const pos = g.attributes.position.array, nor = g.attributes.normal.array, n = pos.length / 3, tile = m.tile || 10;
    let b = base;
    if (b === undefined) { b = Infinity; for (let i = 1; i < pos.length; i += 3) if (pos[i] < b) b = pos[i]; }
    const uv = new Float32Array(n * 2), ab = new Float32Array(n).fill(b);
    const D = opt.down, dx = D ? D[0] : 0, dz = D ? D[1] : 1, rx = dz, rz = -dx;
    const uo = opt.uo || 0, vo = opt.vo || 0;
    for (let i = 0; i < n; i++) {
      const x = pos[3 * i], y = pos[3 * i + 1], z = pos[3 * i + 2];
      const nx = nor[3 * i], ny = nor[3 * i + 1], nz = nor[3 * i + 2];
      const ax = Math.abs(nx), ay = Math.abs(ny), az = Math.abs(nz);
      let u, v;
      if (ay >= ax && ay >= az) { u = x * rx + z * rz; v = -(x * dx + z * dz); if (ny < 0) u = -u; }
      else if (ax >= az) { u = nx > 0 ? -z : z; v = y; }
      else { u = nz > 0 ? x : -x; v = y; }
      uv[2 * i] = u / tile + uo; uv[2 * i + 1] = v / tile + vo;
    }
    g.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
    g.setAttribute('aBase', new THREE.BufferAttribute(ab, 1));
    g.clearGroups();
    (this.lists[key] || (this.lists[key] = [])).push(g);
  }

  box(key, x0, y0, z0, x1, y1, z1, base, opt) {
    const w = Math.abs(x1 - x0), h = Math.abs(y1 - y0), d = Math.abs(z1 - z0);
    if (w < 1e-4 || h < 1e-4 || d < 1e-4) return;
    const g = new THREE.BoxGeometry(w, h, d);
    g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
    this.add(key, g, base === undefined ? Math.min(y0, y1) : base, opt);
  }

  // p: 8 points — bottom quad then top quad, each ordered (x0,z0),(x0,z1),(x1,z1),(x1,z0)
  hexa(key, p, base, opt) {
    const q = (a, b, c, d) => [a, b, c, a, c, d];
    const idx = [...q(0, 3, 2, 1), ...q(4, 5, 6, 7), ...q(0, 1, 5, 4), ...q(1, 2, 6, 5), ...q(2, 3, 7, 6), ...q(3, 0, 4, 7)];
    const pos = new Float32Array(idx.length * 3);
    idx.forEach((k, i) => { pos[i * 3] = p[k][0]; pos[i * 3 + 1] = p[k][1]; pos[i * 3 + 2] = p[k][2]; });
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.computeVertexNormals();
    this.add(key, g, base, opt);
  }

  // slab under 4 top corners (same ordering as hexa)
  slab(key, t, th, opt) {
    const b = t.map(([x, y, z]) => [x, y - th, z]);
    this.hexa(key, [...b, ...t], -999, opt);
  }

  tri(key, a, b, c, opt) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array([...a, ...b, ...c]), 3));
    g.computeVertexNormals();
    this.add(key, g, -999, opt);
  }

  cyl(key, cx, y0, cz, rt, rb, h, seg = 16, base, opt, t0 = 0, tl = Math.PI * 2) {
    const g = new THREE.CylinderGeometry(rt, rb, h, seg, 1, false, t0, tl);
    g.translate(cx, y0 + h / 2, cz);
    this.add(key, g, base === undefined ? y0 : base, opt);
  }

  geo(key, g, base, opt) { this.add(key, g, base, opt); }

  // merge set `id` (default: the current one) per material into `parent`; `matFor(key)` may swap materials
  build(parent, id = this.cur, matFor = null) {
    const meshes = [], lists = this.sets[id] || {};
    for (const [k, list] of Object.entries(lists)) {
      const m = this.mats[k];
      const merged = mergeGeometries(list, false);
      merged.computeBoundingSphere(); merged.computeBoundingBox();
      const mesh = new THREE.Mesh(merged, matFor ? matFor(k) : m.mat);
      mesh.castShadow = m.cast !== false;
      mesh.receiveShadow = m.receive !== false;
      mesh.matrixAutoUpdate = false;
      mesh.name = k;
      parent.add(mesh);
      meshes.push(mesh);
    }
    this.sets[id] = {};
    if (id === this.cur) this.lists = this.sets[id];
    return meshes;
  }
}

export function mkParts(B) {
  const box = (k, ...a) => B.box(k, ...a);
  const cornice = (x0, z0, x1, z1, y, o = 0.5, k = 'ash') => box(k, x0 - o, y - 1.3, z0 - o, x1 + o, y + 0.25, z1 + o, -999);
  const wall = (x0, z0, x1, z1, y0, y1, k = 'ash') => { box(k, x0, y0, z0, x1, y1, z1); cornice(x0, z0, x1, z1, y1, 0.5, k); };
  // face-local box: face N/S/E/W at plane f; a0..a1 along the face; n0..n1 outward
  const fbox = (k, face, f, a0, a1, y0, y1, n0, n1) => {
    const s = (face === 'S' || face === 'E') ? 1 : -1;
    const o0 = f + s * n0, o1 = f + s * n1, lo = Math.min(o0, o1), hi = Math.max(o0, o1);
    if (face === 'N' || face === 'S') box(k, a0, y0, lo, a1, y1, hi, -999);
    else box(k, lo, y0, a0, hi, y1, a1, -999);
  };
  const door = (face, f, c, w, y0, y1, mat = 'gold', frame = 'ash') => {
    const hw = w / 2, jw = 1.3;
    fbox(frame, face, f, c - hw - jw, c - hw, y0, y1, 0, 0.7);
    fbox(frame, face, f, c + hw, c + hw + jw, y0, y1, 0, 0.7);
    fbox(frame, face, f, c - hw - jw, c + hw + jw, y1, y1 + 1.8, 0, 0.8);
    fbox('dark', face, f, c - hw, c + hw, y0, y1, 0, 0.06);
    fbox(mat, face, f, c - hw + 0.12, c - 0.07, y0, y1 - 0.15, 0.06, 0.34);
    fbox(mat, face, f, c + 0.07, c + hw - 0.12, y0, y1 - 0.15, 0.06, 0.34);
    for (const t of [0.28, 0.6]) {
      const yy = y0 + (y1 - y0) * t;
      fbox(mat, face, f, c - hw + 0.4, c - 0.35, yy, yy + 0.45, 0.34, 0.46);
      fbox(mat, face, f, c + 0.35, c + hw - 0.4, yy, yy + 0.45, 0.34, 0.46);
    }
  };
  const gate = (face, x0, z0, x1, z1, y0, yT, c, w, dy0, dy1, mat) => {
    wall(x0, z0, x1, z1, y0, yT);
    const f = face === 'N' ? z0 : face === 'S' ? z1 : face === 'E' ? x1 : x0;
    door(face, f, c, w, dy0, dy1, mat);
  };
  return { box, cornice, wall, fbox, door, gate };
}
