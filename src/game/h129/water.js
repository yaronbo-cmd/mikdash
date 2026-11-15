/* ── build 129 ── h129/water.js — the Golah's water (brief §3): its own copy of the best of stage 05's mikveh water (h120/water120.js,
 * build 120: the running ribbon with its streaks and bright front, the wet stone that darkens where the water ran, the thin falling
 * stream, the still surface with its ripples, rings, sky and sun) and of stage 06's sea (the sun's glint as a hard core and a soft band,
 * the fresnel mix of the water's body and the sky it mirrors). Nothing is imported from h120 (that folder goes in the next build).
 * Shaders and meshes only. One clock and one light for every material: kit.U { t, sky, skyLo, sun (toward the sun), sunCol }.
 *   createWater(THREE) → { U, tick(dt), strip, ribbon, wetTrail, threads, surface, drips, spots }
 */
const HASH = /* glsl */`
  float h12(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float n12(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(h12(i), h12(i + vec2(1.0, 0.0)), f.x), mix(h12(i + vec2(0.0, 1.0)), h12(i + vec2(1.0, 1.0)), f.x), f.y); }`;
// (the colours below are written in display space, as in stage 05: brought to linear before the renderer's tone mapping)
const OUT = /* glsl */`
  gl_FragColor.rgb = pow(max(gl_FragColor.rgb, vec3(0.0)), vec3(2.2));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>`;

export function createWater(T) {
  const U = { t: { value: 0 }, sky: { value: new T.Color('#9CB4D8') }, skyLo: { value: new T.Color('#EBCCA4') }, sun: { value: new T.Vector3(0.4, 0.8, 0.3).normalize() }, sunCol: { value: new T.Color('#FFBA6E') } };
  const own = [];
  const keep = (o) => { own.push(o); return o; };

  /* ── a strip along a polyline: attributes aU (amot along), aV (−1 … 1 across), aB (the bend, signed, per amah) ── */
  function strip(P, w, yOf) {
    const n = P.length, pos = new Float32Array(n * 6), aU = new Float32Array(n * 2), aV = new Float32Array(n * 2), aB = new Float32Array(n * 2), idx = [];
    let u = 0;
    for (let i = 0; i < n; i++) {
      const p = P[i], a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
      if (i) u += Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]);
      let tx = b[0] - a[0], tz = b[1] - a[1]; const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
      let bend = 0; if (i > 0 && i < n - 1) { const t0 = Math.atan2(p[1] - a[1], p[0] - a[0]), t1 = Math.atan2(b[1] - p[1], b[0] - p[0]); let d = t1 - t0; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; bend = d / Math.max(0.1, tl / 2); }
      const ww = (typeof w === 'function' ? w(p, i) : w) / 2, nx = -tz * ww, nz = tx * ww, y = yOf(p, i);
      pos.set([p[0] + nx, y, p[1] + nz, p[0] - nx, y, p[1] - nz], i * 6);
      aU[i * 2] = aU[i * 2 + 1] = u; aV[i * 2] = 1; aV[i * 2 + 1] = -1; aB[i * 2] = aB[i * 2 + 1] = bend;
      if (i) { const k = (i - 1) * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    }
    const g = keep(new T.BufferGeometry());
    g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aU', new T.BufferAttribute(aU, 1)); g.setAttribute('aV', new T.BufferAttribute(aV, 1)); g.setAttribute('aB', new T.BufferAttribute(aB, 1));
    g.setIndex(idx); g.userData.len = u; return g;
  }
  /** a polyline resampled every `step` amot (corners kept) */
  function along(pts, step = 0.25) {
    const out = [pts[0]];
    for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step)); for (let q = 1; q <= n; q++) out.push([a[0] + ((b[0] - a[0]) * q) / n, a[1] + ((b[1] - a[1]) * q) / n]); }
    return out;
  }

  /** the running water along a channel (from the mikveh's ribbon): the water lies between uTail and uFront (amot along); streaks in
   *  lanes, sparkles, a bright foamy front, the stream crowding to the outer bank at a bend; uSun lights it, the sky tints it */
  function ribbon(pts, o = {}) {
    const P = along(pts, 0.2), g = strip(P, o.w || 0.42, o.y);
    const mat = keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
      uniforms: { uT: U.t, uSky: U.sky, uSunC: U.sunCol, uFront: { value: 0 }, uTail: { value: -1 }, uFlow: { value: 1 }, uSpeed: { value: o.speed || 3.2 }, uLit: { value: 1 } },
      vertexShader: 'attribute float aU, aV, aB; varying float vU, vV, vB; void main(){ vU = aU; vV = aV; vB = aB; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
      fragmentShader: `${HASH} uniform float uT, uFront, uTail, uFlow, uSpeed, uLit; uniform vec3 uSky, uSunC; varying float vU, vV, vB;
        void main(){
          if (vU > uFront || vU < uTail) discard;
          float toF = uFront - vU, toT = vU - uTail;
          float tongue = clamp(toF / 0.3, 0.0, 1.0), wid = mix(0.4, 1.0, sqrt(tongue)) * mix(0.55, 1.0, uFlow);
          float e = abs(vV) / max(0.05, wid); if (e > 1.0) discard;
          float outer = clamp(-vB * vV * 0.6, -1.0, 1.0), sp = uSpeed * (1.0 + 0.25 * outer);
          float body = n12(vec2(vU * 1.3 - uT * sp * 1.3, vV * 1.5 + 4.0));
          float lv = (vV * 0.5 + 0.5) * 5.0, li = floor(lv), lf = fract(lv);
          float lsp = sp * (0.75 + 0.6 * h12(vec2(li, 1.7)));
          float sd = vU * 1.6 - uT * lsp * 1.6 + h12(vec2(li, 2.9)) * 17.0 + 0.4 * sin(vU * 2.3 + li);
          float di = floor(sd), df = fract(sd), dl = 0.2 + 0.6 * h12(vec2(di, li + 5.1));
          float dash = step(0.4, h12(vec2(di, li + 8.3))) * smoothstep(0.0, 0.1, df) * (1.0 - smoothstep(dl - 0.12, dl, df));
          float streak = dash * (1.0 - smoothstep(0.12, 0.42, abs(lf - 0.5))) * (0.55 + 0.45 * h12(vec2(di, li + 3.7)));
          float spark = step(0.985, h12(vec2(floor(vU * 20.0 - uT * sp * 20.0), floor(vV * 3.0 + 3.0) + floor(uT * 8.0))));
          vec3 deep = vec3(0.16, 0.30, 0.33), shallow = vec3(0.46, 0.58, 0.58), sky = pow(uSky, vec3(1.0 / 2.2)), sunc = pow(uSunC, vec3(1.0 / 2.2));
          vec3 c = mix(deep, mix(shallow, sky, 0.4), 0.25 + 0.45 * e * e + 0.2 * body);
          c += mix(vec3(0.9), sunc, 0.4) * (streak * 0.45 * (0.55 + 0.45 * uLit)) + sunc * spark * 0.9 * uLit;
          c += vec3(0.6, 0.7, 0.72) * max(outer, 0.0) * 0.18;
          float fn = n12(vec2(vV * 5.0 + uT * 3.0, vU * 6.0)), lip = 1.0 - smoothstep(0.0, 0.34 + 0.14 * fn, toF);
          float bub = smoothstep(0.45, 0.75, n12(vec2(vU * 14.0 - uT * 4.0, vV * 6.0)));
          c = mix(c, vec3(0.97, 0.98, 0.95), lip * (0.7 + 0.3 * bub));
          c *= mix(0.62, 1.0, uLit);
          float a = (0.84 + 0.14 * streak + 0.1 * lip) * (1.0 - smoothstep(0.82, 1.0, e)) * smoothstep(0.0, 0.25, toT + 0.25) * mix(0.75, 1.0, uFlow);
          gl_FragColor = vec4(c, a); ${OUT} }`,
    }));
    const m = new T.Mesh(g, mat); m.renderOrder = 4; m.frustumCulled = false;
    return { mesh: m, len: g.userData.len, mat, set(front, tail = -1, flow = 1) { mat.uniforms.uFront.value = front; mat.uniforms.uTail.value = tail; mat.uniforms.uFlow.value = flow; } };
  }

  /** the stone the water touched: dark while wet, with a faint wet sheen (the sky in it at a low angle); uWetTo the front so far */
  function wetTrail(pts, o = {}) {
    const P = along(pts, 0.25), g = strip(P, o.w || 1.0, o.y);
    const mat = keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
      uniforms: { uT: U.t, uSky: U.sky, uWetTo: { value: 0 }, uFrom: { value: -1 }, uHole: { value: o.hole || 0 } },
      vertexShader: 'attribute float aU, aV; varying float vU, vV; varying vec3 vW; void main(){ vU = aU; vV = aV; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `${HASH} uniform float uT, uWetTo, uFrom, uHole; uniform vec3 uSky; varying float vU, vV; varying vec3 vW;
        void main(){
          if (vU > uWetTo + 0.1 || vU < uFrom || abs(vV) < uHole) discard;
          // the wet edge creeps out a little behind the front and is ragged; splashes darken the stone in spots
          float age = clamp((uWetTo - vU) / 2.5, 0.0, 1.0);
          float edge = 0.42 + 0.3 * age + 0.22 * n12(vec2(vU * 3.0, vV * 2.0 + 3.0)) + 0.1 * n12(vW.xz * 7.0);
          float a = (1.0 - smoothstep(edge, edge + 0.18, abs(vV))) * 0.58 * smoothstep(-0.1, 0.25, uWetTo - vU);
          if (a < 0.004) discard;
          vec3 v = normalize(cameraPosition - vW); float fr = pow(1.0 - max(v.y, 0.0), 4.0);
          vec3 c = mix(vec3(0.13, 0.10, 0.07), pow(uSky, vec3(1.0 / 2.2)) * 0.8, fr * 0.5);
          gl_FragColor = vec4(c, a + fr * 0.1); ${OUT} }`,
    }));
    const m = new T.Mesh(g, mat); m.renderOrder = 3; m.frustumCulled = false;
    return { mesh: m, len: g.userData.len, mat, set(wetTo, from = -1) { mat.uniforms.uWetTo.value = wetTo; mat.uniforms.uFrom.value = from; } };
  }

  /** falling threads of water in ONE mesh (one draw call): each a strip facing the camera along a quadratic curve (p0 the lip, p1 the
   *  bend, p2 where it lands), its width from w0 to w1; the stream's own moving streaks (the mikveh's fall). up to N threads */
  function threads(N = 3, SEG = 20) {
    const pos = [], aI = [], idx = [];
    for (let k = 0; k < N; k++) for (let i = 0; i <= SEG; i++) { for (const s of [-1, 1]) { pos.push(i / SEG, s, 0); aI.push(k); } if (i) { const b = (k * (SEG + 1) + i - 1) * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); } }
    const g = keep(new T.BufferGeometry()); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('aI', new T.Float32BufferAttribute(aI, 1)); g.setIndex(idx);
    const P = Array.from({ length: N * 3 }, () => new T.Vector3()), W = Array.from({ length: N }, () => new T.Vector3());
    const mat = keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false, side: T.DoubleSide,
      uniforms: { uT: U.t, uSky: U.sky, uSunC: U.sunCol, uP: { value: P }, uW: { value: W } },
      vertexShader: `uniform vec3 uP[${N * 3}]; uniform vec3 uW[${N}]; attribute float aI; varying vec2 vUv; varying float vOn;
        void main(){
          int k = int(aI + 0.5); vec3 p0 = uP[k * 3], p1 = uP[k * 3 + 1], p2 = uP[k * 3 + 2]; float t = position.x, s = position.y;
          vec3 p = mix(mix(p0, p1, t), mix(p1, p2, t), t), tg = normalize(mix(p1 - p0, p2 - p1, t) + 1e-5);
          vec3 vd = normalize(cameraPosition - p), side = normalize(cross(tg, vd) + 1e-5);
          float w = mix(uW[k].x, uW[k].y, t) * 0.5; vOn = uW[k].z; vUv = vec2(s, t * length(p2 - p0));
          gl_Position = projectionMatrix * viewMatrix * vec4(p + side * w * s, 1.0); }`,
      fragmentShader: `${HASH} uniform float uT; uniform vec3 uSky, uSunC; varying vec2 vUv; varying float vOn;
        void main(){
          if (vOn <= 0.0) discard;
          float e = abs(vUv.x);
          float s = n12(vec2(vUv.y * 3.0 - uT * 14.0, vUv.x * 2.0)) * 0.6 + n12(vec2(vUv.y * 7.0 - uT * 22.0, vUv.x * 4.0 + 3.0)) * 0.4;
          vec3 c = mix(vec3(0.50, 0.64, 0.66), pow(uSky, vec3(1.0 / 2.2)), 0.35) + mix(vec3(0.95), pow(uSunC, vec3(1.0 / 2.2)), 0.35) * smoothstep(0.55, 0.85, s) * 0.55;
          c += vec3(0.25) * (1.0 - e);
          float a = (0.5 + 0.4 * s) * (1.0 - smoothstep(0.55, 1.0, e)) * vOn;
          gl_FragColor = vec4(c, a); ${OUT} }`,
    }));
    const m = new T.Mesh(g, mat); m.renderOrder = 6; m.frustumCulled = false;
    return { mesh: m, set(k, p0, p1, p2, w0, w1, on) { if (k >= N) return; P[k * 3].copy(p0); P[k * 3 + 1].copy(p1); P[k * 3 + 2].copy(p2); W[k].set(w0, w1, on); }, off(k) { W[k].z = 0; } };
  }

  /** a still surface (a trough's, the well's, the bucket's): slow ripples and a fine chop, rings from up to four drops (x, z, t0, amp),
   *  a foam patch where a stream lands (uFoam: x, z, r, on), the sky by fresnel, the sun's glint (a hard core and a soft band) and
   *  sparkles where the ripples turn to the sun, the bed seen through (uBed: its colour, uClear 0 … 1 how much shows) */
  function surface(o = {}) {
    const never = -99, drops = Array.from({ length: 4 }, () => new T.Vector4(0, 0, never, 0));
    return keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uT: U.t, uSky: U.sky, uSkyLo: U.skyLo, uSun: U.sun, uSunC: U.sunCol, uDrops: { value: drops }, uFoam: { value: new T.Vector4(0, 0, 0, 0) },
        uDeep: { value: new T.Color(o.deep || '#1C4250') }, uBed: { value: new T.Color(o.bed || '#8E7E62') }, uClear: { value: o.clear != null ? o.clear : 0.4 },
        uA: { value: o.alpha || 0.9 }, uChop: { value: o.chop || 1 }, uLit: { value: 1 }, uGlint: { value: o.glint != null ? o.glint : 1 } },
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `${HASH} uniform float uT, uA, uClear, uChop, uLit, uGlint; uniform vec3 uSky, uSkyLo, uSun, uSunC, uDeep, uBed; uniform vec4 uDrops[4]; uniform vec4 uFoam; varying vec3 vW;
        void main(){
          vec2 p = vW.xz;
          vec2 g = vec2(0.0);
          g += vec2(0.7, 0.3) * cos(dot(p, vec2(2.3, 1.0)) + uT * 1.6) * 0.045;
          g += vec2(-0.25, 0.9) * cos(dot(p, vec2(-0.7, 2.8)) + uT * 2.1) * 0.04;
          g += (vec2(n12(p * 6.0 + uT * 0.9), n12(p * 6.0 - uT * 0.8 + 9.0)) - 0.5) * 0.12 * uChop;
          float ringW = 0.0;
          for (int i = 0; i < 4; i++) { vec4 d = uDrops[i]; float age = uT - d.z; if (age < 0.0 || age > 2.4 || d.w <= 0.0) continue;
            vec2 q = p - d.xy; float r = length(q) + 1e-3, front = age * 1.6, k = exp(-pow((r - front) * 4.0, 2.0)) * d.w * (1.0 - age / 2.4);
            g += (q / r) * sin((r - front) * 18.0) * 0.22 * k; ringW += k; }
          float foam = 0.0;
          if (uFoam.w > 0.0) { vec2 q = p - uFoam.xy; float r = length(q);
            g += (q / (r + 1e-3)) * sin(r * 16.0 - uT * 9.0) * 0.08 * uFoam.w * exp(-r * 1.8);
            foam = (1.0 - smoothstep(uFoam.z * 0.4, uFoam.z * (1.0 + 0.35 * n12(q * 5.0 + uT * 2.0)), r)) * uFoam.w * (0.55 + 0.45 * n12(q * 9.0 - uT * 3.0)); }
          vec3 n = normalize(vec3(-g.x, 1.0, -g.y)), v = normalize(cameraPosition - vW);
          float fr = 0.03 + 0.97 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
          vec3 r = reflect(-v, n), L = normalize(uSun);
          vec3 sky = pow(mix(uSkyLo, uSky, smoothstep(0.0, 0.7, r.y)), vec3(1.0 / 2.2)), sunc = pow(uSunC, vec3(1.0 / 2.2));
          float sd = max(dot(r, L), 0.0);
          float glint = (pow(sd, 900.0) * 6.0 + pow(sd, 90.0) * 0.9 + pow(sd, 12.0) * 0.16) * uGlint * uLit;
          float sparkle = step(0.93, h12(floor(p * 18.0) + floor(uT * 7.0))) * pow(sd, 4.0) * 1.6 * uGlint * uLit;
          vec3 body = mix(pow(uBed, vec3(1.0 / 2.2)) * mix(0.55, 1.0, uLit), pow(uDeep, vec3(1.0 / 2.2)), 1.0 - uClear);
          vec3 c = mix(body, sky * mix(0.7, 1.0, uLit), clamp(fr * 1.6 + 0.18, 0.0, 1.0)) + sunc * (glint + sparkle);
          c += vec3(0.9, 0.95, 0.95) * ringW * 0.22;
          c = mix(c, vec3(0.95, 0.97, 0.95), clamp(foam, 0.0, 1.0) * 0.85);
          float a = clamp(uA + fr * 0.2 + glint * 0.5 + foam * 0.4, 0.0, 1.0);
          gl_FragColor = vec4(c, a); ${OUT} }`,
    }));
  }
  /** add a drop's ring to a surface material (the oldest of the four is replaced) */
  function drop(mat, x, z, t0, amp = 1) {
    const D = mat.uniforms.uDrops.value; let o = 0; for (let i = 1; i < D.length; i++) if (D[i].z < D[o].z) o = i; D[o].set(x, z, t0, amp);
  }

  /** drops in the air: one Points mesh; positions written by the caller each frame (xyz, size in amot) */
  function drips(N = 96) {
    const g = keep(new T.BufferGeometry()), pos = new Float32Array(N * 3), sz = new Float32Array(N);
    g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aS', new T.BufferAttribute(sz, 1));
    const mat = keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uSky: U.sky, uSunC: U.sunCol, uH: { value: 600 } },
      vertexShader: 'attribute float aS; uniform float uH; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aS * uH / max(0.5, -mv.z); vA = step(0.001, aS); gl_Position = projectionMatrix * mv; }',
      fragmentShader: `uniform vec3 uSky, uSunC; varying float vA; void main(){
          vec2 q = gl_PointCoord * 2.0 - 1.0; q.x *= 1.9; q.y = q.y * 1.0 + 0.25 * (1.0 - q.y);   // (a drop: narrow, its round foot down)
          float r = length(q); if (r > 1.0 || vA <= 0.0) discard;
          vec3 c = mix(vec3(0.62, 0.76, 0.80), pow(uSky, vec3(1.0 / 2.2)), 0.3) + pow(uSunC, vec3(1.0 / 2.2)) * smoothstep(0.55, 0.0, length(q - vec2(-0.25, 0.3))) * 0.9;
          gl_FragColor = vec4(c, (1.0 - smoothstep(0.6, 1.0, r)) * 0.9); ${OUT} }`,
    }));
    const m = new T.Points(g, mat); m.frustumCulled = false; m.renderOrder = 7;
    return { mesh: m, pos, sz, mat, N, update(n) { g.attributes.position.needsUpdate = true; g.attributes.aS.needsUpdate = true; g.setDrawRange(0, n); } };
  }

  /** wet spots on the stone (where drops and splashes fell): one instanced mesh of small dark discs, added in order */
  function spots(N = 160) {
    const geo = keep(new T.CircleGeometry(1, 10)); geo.rotateX(-Math.PI / 2);
    const mat = keep(new T.MeshBasicMaterial({ color: '#1E170F', transparent: true, opacity: 0.42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }));
    const m = new T.InstancedMesh(geo, mat, N); m.count = 0; m.renderOrder = 3; m.frustumCulled = false;
    const M = new T.Matrix4(), Q = new T.Quaternion(), S = new T.Vector3(), P = new T.Vector3();
    return { mesh: m, add(x, y, z, r) { if (m.count >= N) return; P.set(x, y, z); S.set(r, 1, r * (0.75 + 0.5 * ((m.count * 0.618) % 1))); M.compose(P, Q, S); m.setMatrixAt(m.count++, M); m.instanceMatrix.needsUpdate = true; }, clear() { m.count = 0; } };
  }

  return {
    U, along, strip, ribbon, wetTrail, threads, surface, drop, drips, spots,
    tick(dt) { U.t.value += Math.min(0.1, Math.max(0, dt)); },
    dispose() { for (const o of own) try { o.dispose(); } catch (e) { /* */ } },
  };
}
