/* ── look A ── src/look/rock.js — rocks, their fresh breaks, the waste lumps, and the hill's cut cells and waste pits
 * (docs/specs/look/A-things-in-hand.md §A3). The rock: the Mount's own rock texture box-projected by scale, a weathered skin (darker
 * grey-brown up-facing facets with lichen flecks, soft bedding lines by height), flat facets, a tone of its own; a fresh break: near-white
 * cream, clean, a sharper grain. The same program as the stones (src/look/shader.js).
 *
 *   rockMat(THREE, map, o) (o.vertexColors: the big rock's bands) · freshMat(THREE, map, o) · rockTint(seed) / freshTint(seed) → '#rrggbb'
 *   cutCellPatch(sh, { pits, nc, fill }) — the hill's shader: a cut cell's walls are quarried rock mapped by world position with pick
 *   marks, its floor levelled rock with dressing strokes; an open waste pit's floor is rubble in earth, a covered one a packed-earth cap
 *   with a few stones showing, its edge blended into the ground ── /look A ── */
import { KIND, lookMat, lookClone } from './shader.js';
import { hsl2hex } from './stone.js';

const hh = (n) => { const v = Math.sin(n * 91.7 + 13.1) * 43758.5453; return v - Math.floor(v); };
/** the skin's tones: hsl 30..42, 10..18 %, 52..66 % (no two rocks alike) */
export function rockTint(seed) { return hsl2hex(30 + hh(seed) * 12, 10 + hh(seed * 1.7) * 8, 52 + hh(seed * 2.3) * 14); }
/** the fresh break: a hair under hsl(42, 14 %, 86 %), each a hair of its own */
export function freshTint(seed) { return hsl2hex(40 + hh(seed) * 4, 15 + hh(seed * 1.9) * 5, 68 + hh(seed * 3.1) * 6); }   // (the sun lifts it to the near-white of a fresh break)

const C = new WeakMap();
const cache = (THREE) => { let c = C.get(THREE); if (!c) { c = {}; C.set(THREE, c); } return c; };
export function rockMat(THREE, map, o = {}) {
  const c = cache(THREE), k = o.vertexColors ? 'rockVc' : 'rock';
  if (c[k]) return c[k];
  const m = c[k] = lookMat(THREE, KIND.rock, { color: o.color || (o.vertexColors ? '#B5A68C' : '#ffffff'), tex: map, vertexColors: !!o.vertexColors, rough: 0.93 });
  if (o.vertexColors) m.userData.look.mseed = 1;   // (the big rock's bands shade across a face: its seed from the material alone)
  return m;
}
export function freshMat(THREE, map, o = {}) {
  const c = cache(THREE), k = 'fresh' + (o.side ? 'D' : '');
  return c[k] || (c[k] = lookMat(THREE, KIND.fresh, { color: o.color || freshTint(1), tex: map, side: o.side, rough: 0.88 }));
}
export { lookClone as rockClone };

const PIT_N = 8;
/** the hill's shader (stages.js makeHill): cut cells and waste pits. o.THREE, o.pits: [{ x, z, w, d }], o.nc: the first pit's cell id, o.fill():
 *  the pits' fill 0..1 (1: covered) */
export function cutCellPatch(sh, o) {
  const R = Array.from({ length: PIT_N }, () => new o.THREE.Vector4()), F = new Float32Array(PIT_N).fill(-1);
  (o.pits || []).slice(0, PIT_N).forEach((P, i) => R[i].set(P.x, P.z, P.w / 2, P.d / 2));
  sh.uniforms.uLkPitR = { value: R };
  sh.uniforms.uLkPitF = { get value() { const f = o.fill() || []; for (let i = 0; i < PIT_N; i++) F[i] = f[i] == null ? -1 : f[i]; return F; } };
  sh.uniforms.uLkNC = { value: o.nc };
  // (all the pits' box, 2.4 amot wider: the hill elsewhere skips the pits' loop)
  const B = new o.THREE.Vector4(1e9, 1e9, -1e9, -1e9);
  (o.pits || []).slice(0, PIT_N).forEach((P) => { B.x = Math.min(B.x, P.x - P.w / 2 - 2.4); B.y = Math.min(B.y, P.z - P.d / 2 - 2.4); B.z = Math.max(B.z, P.x + P.w / 2 + 2.4); B.w = Math.max(B.w, P.z + P.d / 2 + 2.4); });
  sh.uniforms.uLkPitB = { value: B };
  sh.vertexShader = sh.vertexShader
    .replace('#include <common>', '#include <common>\nvarying float vLkY; varying float vLkCid;')
    .replace('vec3 transformed = vec3(position.x, hY, position.z);', 'vec3 transformed = vec3(position.x, hY, position.z); vLkY = hY; vLkCid = aCid;');
  sh.fragmentShader = sh.fragmentShader
    .replace('#include <common>', `#include <common>
      varying float vLkY; varying float vLkCid; uniform vec4 uLkPitR[${PIT_N}]; uniform float uLkPitF[${PIT_N}]; uniform float uLkNC; uniform vec4 uLkPitB;`)
    .replace('void main() {', `
      // (rubble: a lump in each cell of a jittered grid, lit on its sun side, a dark rim; .x: inside it 0..1, .y: its shade)
      vec2 lkRubble(vec2 p, float dens) {
        vec2 i = floor(p), f = fract(p); float best = 9.0; vec2 bo = vec2(0.0); float on = 0.0;
        for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
          vec2 n = vec2(float(x), float(y)), c = i + n;
          if (hh(c + 31.0) > dens) continue;
          vec2 o = n + 0.05 + 0.9 * vec2(hh(c), hh(c + 17.0)) - f; float r = 0.3 + 0.45 * hh(c + 5.0), a = hh(c + 9.0) * 1.57;
          vec2 oa = mat2(cos(a), -sin(a), sin(a), cos(a)) * o; float d = mix(length(o), max(abs(oa.x), abs(oa.y)) * 1.12, 0.3 + 0.4 * hh(c + 13.0)) / r;   // (angular, not pebbles)
          if (d < best) { best = d; bo = -o / r; on = 1.0; }
        }
        float k = (1.0 - smoothstep(0.82, 1.0, best)) * on;
        return vec2(k, clamp(0.75 + 0.35 * dot(bo, vec2(-0.55, -0.45)) - 0.3 * smoothstep(0.7, 1.0, best), 0.3, 1.1));
      }
      void main() {`)
    .replace('#include <roughnessmap_fragment>', `
      // ── look A ── the cut cells and the waste pits ── /look A ──
      { vec3 W = vec3(vHXZ.x, vLkY, vHXZ.y), lkDx = dFdx(vViewPosition), lkDy = dFdy(vViewPosition), lkWx = dFdx(W), lkWy = dFdy(W);
        // (the work only where it shows: a cut cell, or near a pit — the rest of the hill pays a few comparisons; the texture's
        // derivatives taken here, outside the branch)
        bool lkCell = vWk > 0.5 && vPv < 0.5 && vLkCid > -0.5 && vLkCid < uLkNC - 0.5; float lkNear = 9.0;   // (a paved cell keeps the hill's paving)
        bool lkPits = vHXZ.x > uLkPitB.x && vHXZ.y > uLkPitB.y && vHXZ.x < uLkPitB.z && vHXZ.y < uLkPitB.w;
        if (lkPits) for (int i = 0; i < ${PIT_N}; i++) { if (uLkPitF[i] < -0.5) continue; vec2 q = abs(vHXZ - uLkPitR[i].xy) - uLkPitR[i].zw; lkNear = min(lkNear, max(q.x, q.y)); }
        if (lkCell || lkNear < 2.4) {
        vec3 lkFn = normalize((vec4(normalize(cross(lkDx, lkDy)), 0.0) * viewMatrix).xyz);
        // (one sample, from the face's own axis: x, y or z; its gradients from W's, taken outside the branch)
        vec3 an = abs(lkFn); bool ay = an.y >= an.x && an.y >= an.z, axx = an.x >= an.z;
        vec2 u1 = (ay ? vec2(W.x, -W.z) : axx ? W.zy : W.xy) / 7.0;
        vec2 g1x = (ay ? vec2(lkWx.x, -lkWx.z) : axx ? lkWx.zy : lkWx.xy) / 7.0, g1y = (ay ? vec2(lkWy.x, -lkWy.z) : axx ? lkWy.zy : lkWy.xy) / 7.0;
        float wall = 1.0 - smoothstep(0.45, 0.8, abs(lkFn.y));
        // (the rock texture by world position, box-projected: no stretch down a wall)
        float tl = dot(textureGrad(map, u1, g1x, g1y).rgb, vec3(0.333)) / 0.5;
        float vn = hn(W.xz / 6.0 + W.y * 0.3);
        float along = abs(lkFn.x) > abs(lkFn.z) ? W.z : W.x;
        // (linear colours, as the hill's own) the walls: quarried rock, vertical pick marks (8 to the amah, irregular), a little darker
        // toward the top edge; the floor: levelled rock, faint parallel dressing strokes
        vec3 wc = vec3(0.5, 0.44, 0.34);
        if (wall > 0.01) {
          float pn = hn(vec2(along * 2.0, W.y * 1.2));
          float pk = smoothstep(0.55, 1.0, sin(6.2832 * 8.0 * (along + 0.12 * pn)) * 0.5 + 0.5) * smoothstep(0.3, 0.7, fract(pn * 7.3));
          float topD = 1.0 - smoothstep(0.0, 1.6, vH0 - vLkY);
          wc *= (0.8 + 0.25 * tl) * (1.0 - 0.16 * pk) * (1.0 - 0.14 * topD) * (0.92 + 0.1 * vn);
        }
        if (lkCell) {
          float dn = hn(W.xz * 0.8), ds = smoothstep(0.75, 1.0, sin(6.2832 * 3.0 * (W.x + 0.25 * dn)) * 0.5 + 0.5);
          vec3 fc = vec3(0.53, 0.47, 0.36) * (0.74 + 0.3 * tl) * (1.0 - 0.12 * ds) * (0.86 + 0.18 * vn) * (0.96 + 0.06 * dn);
          diffuseColor.rgb = mix(diffuseColor.rgb, mix(fc, wc, wall), 0.94);
        }
        // the waste pits: rubble in earth while it fills (its walls dug rock); covered, a packed-earth cap in the ground's tone with a
        // few stones, its edge blended into the ground
        if (lkPits) for (int i = 0; i < ${PIT_N}; i++) {
          float f = uLkPitF[i]; if (f < -0.5) continue;
          vec4 P = uLkPitR[i]; vec2 q = abs(vHXZ - P.xy) - P.zw; float out_ = max(q.x, q.y);
          if (out_ > 2.4) continue;
          float inside = wall > 0.5 ? 1.0 - smoothstep(0.15, 0.45, out_) : 1.0 - smoothstep(-0.05, 0.05, out_);   // (its walls stand on the edge itself)
          vec3 earth = vec3(0.2, 0.15, 0.1) * (0.85 + 0.25 * hn(vHXZ * 1.3)) * (0.9 + 0.15 * tl);
          // (small lumps of rubble, lit on their sun side)
          vec2 lq = vHXZ * 1.5 + float(i) * 7.0, rb0 = lkRubble(lq, f >= 0.999 ? 0.12 : 0.85);
          vec3 stone = vec3(0.4, 0.36, 0.28) * rb0.y * (0.85 + 0.25 * hh(floor(lq))) * (0.9 + 0.15 * tl);
          if (f >= 0.999) {
            float ring = (1.0 - smoothstep(0.0, 2.2, out_ + 0.5 * (hn(vHXZ * 0.9) - 0.5))) * (1.0 - inside);
            vec3 cap = mix(mix(diffuseColor.rgb, vec3(0.2, 0.18, 0.085) * (0.88 + 0.22 * hn(vHXZ * 0.7)), 0.92), stone * 1.2, rb0.x * 0.7 * inside * (1.0 - wall));   // (the ground's tone)
            diffuseColor.rgb = mix(diffuseColor.rgb, cap, max(inside, ring * 0.7));
          } else if (inside > 0.0) {
            vec3 rb = wall > 0.5 ? mix(wc, earth, 0.25) : mix(earth * (0.8 + 0.2 * rb0.y), stone, rb0.x);
            diffuseColor.rgb = mix(diffuseColor.rgb, rb, inside * 0.95);
          }
        }
        }
      }
      #include <roughnessmap_fragment>`);
}
