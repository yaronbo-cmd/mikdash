/* ── build 129 ── h129/water.js — the Golah's water (brief §3), round 2: water that reads as water on a tablet.
 * Its own copies (nothing imported from h120 or h128): stage 06's idea of ONE small baked noise texture read by every water shader
 * (no per-pixel hashing, no white speckle), stage 05's running water and wet stone, rebuilt:
 *   flow     the channel's water: a thin clear layer over the stone (the stone seen through it, darker), highlights that travel WITH
 *            the flow (the baked noise scrolled along it), a round leading tongue with a small foam edge, the water piling at a sluice
 *   wet      the stone the water touched: dark while wet, its stain fading slowly from the edges after the water has gone; on the floor
 *            beside the trench, on its bed and up its two sides (to just above the water line)
 *   sheet    a pour: a curved sheet of water with thickness (bowed across, lit through), streaks moving down it, wider at the lip,
 *            breaking into strands lower down
 *   surface  standing water: slow swell and fine chop from the noise, rings from up to eight drops, the heave and foam where a stream
 *            lands, a fresnel mirror of what is really round it (WELL: the shaft, its sunlit crescent and the bright sky in its mouth;
 *            BOX: a basin's walls, its rim and the golden air above), the bottom seen through and shifting with the ripples, slow glints
 *   drops    falling drops as short streaks (their length from their speed), one instanced mesh
 *   line     a basin's inner walls: the water line climbing them, the wet mark above it
 * Colours are written in display space (as stage 05) and brought to linear before the renderer's tone mapping.
 *   createWater(THREE) → { U, along, strip, flow, wet, wetWalls, sheet, surface, drops, lines, spots, threads, tick, dispose }
 */
const OUT = /* glsl */`
  gl_FragColor.rgb = pow(max(gl_FragColor.rgb, vec3(0.0)), vec3(2.2));
  #include <tonemapping_fragment>
  #include <colorspace_fragment>`;
// the baked noise: r a value noise of 32 cells, g four octaves from 16 cells, b a the slope of g (scaled by uGradK); all tile
const NZ = /* glsl */`
  uniform sampler2D uNoise; uniform float uGradK;
  float vn(vec2 p) { return texture2D(uNoise, p * 0.03125).r; }
  float fb(vec2 p) { return texture2D(uNoise, p * 0.0625 + 0.37).g; }
  vec3 chop(vec2 p) { vec4 t = texture2D(uNoise, p * 0.0625); return vec3(t.g, (t.ba - 0.5) / uGradK * 0.0625); }`;
const CELLS = { N: 128, r: 32 }; CELLS.g = [CELLS.N / 8, CELLS.N / 4, CELLS.N / 2, CELLS.N];
const SEED = { r: 11, g: [23, 7, 13, 17] };
const NEVER = -99;   // (a ring that never was: its start long before the loop)

/** the one noise texture (stage 06's way, its own copy): seeded, the same every run */
function bakeNoise(T) {
  const N = CELLS.N, out = new Uint8Array(N * N * 4), G = new Float32Array(N * N), M = 2147483647;
  const lat = (c, seed) => { const a = new Float32Array(c * c); let x = seed; for (let i = 0; i < c * c; i++) { x = (x * 16807) % M; a[i] = x / M; } return a; };
  const S = (t) => t * t * (3 - 2 * t);
  const val = (L, c, px, py) => {
    const fx = (px * c) / N, fy = (py * c) / N, ix = Math.floor(fx), iy = Math.floor(fy), tx = S(fx - ix), ty = S(fy - iy);
    const g = (i, j) => L[(j % c) * c + (i % c)];
    const a = g(ix, iy) + (g(ix + 1, iy) - g(ix, iy)) * tx, b = g(ix, iy + 1) + (g(ix + 1, iy + 1) - g(ix, iy + 1)) * tx;
    return a + (b - a) * ty;
  };
  const r = lat(CELLS.r, SEED.r), g4 = CELLS.g.map((c, i) => lat(c, SEED.g[i])), wt = [0.5, 0.25, 0.125, 0.0625];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    out[(y * N + x) * 4] = 255 * val(r, CELLS.r, x, y);
    let s = 0; for (let k = 0; k < 4; k++) s += val(g4[k], CELLS.g[k], x, y) * wt[k]; G[y * N + x] = s / 0.9375;
  }
  const at = (x, y) => G[((y + N) % N) * N + ((x + N) % N)];
  let m = 1e-6; const dx = new Float32Array(N * N), dy = new Float32Array(N * N);
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x; dx[i] = ((at(x + 1, y) - at(x - 1, y)) * N) / 2; dy[i] = ((at(x, y + 1) - at(x, y - 1)) * N) / 2; m = Math.max(m, Math.abs(dx[i]), Math.abs(dy[i])); }
  const k = 0.49 / m;
  for (let i = 0; i < N * N; i++) { out[i * 4 + 1] = 255 * G[i]; out[i * 4 + 2] = 255 * (0.5 + dx[i] * k); out[i * 4 + 3] = 255 * (0.5 + dy[i] * k); }
  const t = new T.DataTexture(out, N, N, T.RGBAFormat);
  t.wrapS = t.wrapT = T.RepeatWrapping; t.magFilter = t.minFilter = T.LinearFilter; t.generateMipmaps = false; t.needsUpdate = true;
  return { tex: t, k };
}

export function createWater(T) {
  const own = [], keep = (o) => { own.push(o); return o; };
  const NZT = bakeNoise(T); keep(NZT.tex);
  const U = {
    t: { value: 0 }, sky: { value: new T.Color('#9CB4D8') }, skyLo: { value: new T.Color('#EBCCA4') }, sun: { value: new T.Vector3(0.4, 0.8, 0.3).normalize() },
    sunCol: { value: new T.Color('#FFBA6E') }, uNoise: { value: NZT.tex }, uGradK: { value: NZT.k },
  };
  const base = () => ({ uT: U.t, uSky: U.sky, uSkyLo: U.skyLo, uSun: U.sun, uSunC: U.sunCol, uNoise: U.uNoise, uGradK: U.uGradK });
  // shared GLSL: the sky a ray sees (the golden air low, the blue high), the sun's colour
  const SKY = /* glsl */`
    uniform vec3 uSky, uSkyLo, uSun, uSunC;
    vec3 skyOf(vec3 r) { vec3 lo = pow(uSkyLo, vec3(1.0 / 2.2)), hi = pow(uSky, vec3(1.0 / 2.2)); return mix(lo * 1.08, hi, smoothstep(0.02, 0.6, r.y)); }
    vec3 sunc() { return pow(uSunC, vec3(1.0 / 2.2)); }`;

  /* ── a strip along a polyline: aU (amot along), aV (−1 … 1 across), aT (the tangent's x, z) ── */
  function strip(P, w, yOf) {
    const n = P.length, pos = new Float32Array(n * 6), aU = new Float32Array(n * 2), aV = new Float32Array(n * 2), aT = new Float32Array(n * 4), idx = [];
    let u = 0;
    for (let i = 0; i < n; i++) {
      const p = P[i], a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
      if (i) u += Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]);
      let tx = b[0] - a[0], tz = b[1] - a[1]; const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
      const ww = (typeof w === 'function' ? w(p, i) : w) / 2, nx = -tz * ww, nz = tx * ww, y = yOf(p, i, u);
      pos.set([p[0] + nx, y, p[1] + nz, p[0] - nx, y, p[1] - nz], i * 6);
      aU[i * 2] = aU[i * 2 + 1] = u; aV[i * 2] = 1; aV[i * 2 + 1] = -1; aT.set([tx, tz, tx, tz], i * 4);
      if (i) { const k = (i - 1) * 2; idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
    }
    const g = keep(new T.BufferGeometry());
    g.setAttribute('position', new T.BufferAttribute(pos, 3)); g.setAttribute('aU', new T.BufferAttribute(aU, 1)); g.setAttribute('aV', new T.BufferAttribute(aV, 1)); g.setAttribute('aT', new T.BufferAttribute(aT, 2));
    g.setIndex(idx); g.userData.len = u; return g;
  }
  /** a polyline resampled every `step` amot (corners kept) */
  function along(pts, step = 0.25) {
    const out = [pts[0]];
    for (let i = 0; i + 1 < pts.length; i++) { const a = pts[i], b = pts[i + 1], L = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(1, Math.round(L / step)); for (let q = 1; q <= n; q++) out.push([a[0] + ((b[0] - a[0]) * q) / n, a[1] + ((b[1] - a[1]) * q) / n]); }
    return out;
  }

  /** the channel's running water: between uTail and uFront (amot along the way); uPile the places (amot along) where it piles at a
   *  stone and turns; o.w its width, o.y its height (p, i, u) */
  function flow(pts, o = {}) {
    const P = along(pts, 0.1), g = strip(P, o.w || 0.5, o.y);
    const mat = keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
      uniforms: { ...base(), uFront: { value: 0 }, uTail: { value: -1 }, uFlow: { value: 1 }, uSpeed: { value: o.speed || 3.4 }, uPile: { value: new T.Vector4(-9, -9, 0, 0) }, uW: { value: o.w || 0.5 } },
      vertexShader: `attribute float aU, aV; attribute vec2 aT; varying float vU, vV; varying vec2 vT; varying vec3 vW;
        void main(){ vU = aU; vV = aV; vT = aT; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `${NZ} ${SKY} uniform float uT, uFront, uTail, uFlow, uSpeed, uW; uniform vec4 uPile; varying float vU, vV; varying vec2 vT; varying vec3 vW;
        void main(){
          float across = vV * uW * 0.5;
          // the round tongue and its ragged foam edge; the tail drawn out thin
          float tip = uFront - 0.55 * vV * vV * uW - 0.06 * vn(vec2(vV * 3.0, uT * 2.0));
          float toF = tip - vU, toT = vU - uTail;
          if (toF < 0.0 || toT < 0.0) discard;
          // the piles at the stones: where the water heaps and turns
          float pile = max(exp(-pow((vU - uPile.x) / 0.45, 2.0)) * uPile.z, exp(-pow((vU - uPile.y) / 0.45, 2.0)) * uPile.w);
          // the flow: the baked chop scrolled along the way at the water's speed (two scales, the second slower and turned)
          vec2 q = vec2(vU, across);
          vec3 c1 = chop(vec2(q.x * 3.0 - uT * uSpeed * 3.0, q.y * 5.0));
          vec3 c2 = chop(vec2(q.y * 7.0 + 9.0, q.x * 4.5 - uT * uSpeed * 3.6) );
          float amp = (0.55 + 1.6 * pile) * uFlow;
          vec2 sl = (vec2(c1.y * 3.0, c1.z * 5.0) * 0.6 + vec2(c2.z * 4.5, c2.y * 7.0) * 0.4) * 0.05 * amp;   // (slope along, across)
          sl.y += across * 0.6;   // (the meniscus: the water rounds up to its banks)
          vec2 N = vec2(-vT.y, vT.x);
          vec2 gxz = vT * sl.x + N * sl.y;
          vec3 n = normalize(vec3(-gxz.x, 1.0, -gxz.y)), v = normalize(cameraPosition - vW), L = normalize(uSun);
          float fr = 0.02 + 0.98 * pow(1.0 - max(dot(n, v), 0.0), 5.0);
          vec3 r = reflect(-v, n);
          float sd = max(dot(r, L), 0.0);
          vec3 spec = sunc() * (pow(sd, 800.0) * 1.8 + pow(sd, 60.0) * 0.05) + skyOf(r) * (0.12 + fr) * 0.8;
          // the stone seen through: darkened and warmed (wet), a faint light netting on it
          float caus = smoothstep(0.55, 0.85, fb(vec2(vU * 2.2 - uT * uSpeed * 2.0, across * 2.2 + 3.0))) * 0.35;
          vec3 tint = mix(vec3(0.10, 0.20, 0.21), skyOf(r) * 0.55, 0.35);
          float a0 = 0.55 + 0.15 * pile;
          float edge = 1.0 - smoothstep(0.82, 1.0, abs(vV));
          // the foam: at the tongue's edge, in the pile
          float fn = fb(vec2(vU * 9.0 - uT * 5.0, vV * 3.0));
          float foam = (1.0 - smoothstep(0.0, 0.1 + 0.08 * fn, toF)) * 0.9 + pile * smoothstep(0.45, 0.8, fb(vec2(vU * 6.0 - uT * 4.0, vV * 5.0 + uT))) * 0.8;
          foam *= mix(0.6, 1.0, fn);
          vec3 add = spec + sunc() * caus * 0.12;
          float a = clamp(a0 * edge + dot(add, vec3(0.33)) + foam * 0.85, 0.0, 1.0) * smoothstep(0.0, 0.4, toT + 0.05);
          vec3 c = (tint * a0 * edge + add) / max(a, 1e-3);
          c = mix(c, vec3(0.96, 0.97, 0.95), clamp(foam, 0.0, 1.0));
          gl_FragColor = vec4(c, a); ${OUT} }`,
    }));
    const m = new T.Mesh(g, mat); m.renderOrder = 4; m.frustumCulled = false;
    return { mesh: m, len: g.userData.len, mat, set(front, tail = -1, fl = 1) { mat.uniforms.uFront.value = front; mat.uniforms.uTail.value = tail; mat.uniforms.uFlow.value = fl; } };
  }

  // the wetness of the stone at (u along, a ragged edge), shared by the floor, the bed and the walls: wet behind the front, after the
  // tail has passed the stain dries slowly, from its edges in (uDryV the tail's speed, so its age is the time since the water went)
  const WETF = /* glsl */`
    uniform float uWetTo, uFrom, uTail, uDryV, uDryT;
    float wetAt(float u, float edgeIn, float rag) {
      if (u > uWetTo + 0.05 || u < uFrom) return 0.0;
      float on = smoothstep(-0.05, 0.3, uWetTo - u);
      float age = u < uTail ? (uTail - u) / max(uDryV, 0.1) : 0.0;
      float k = clamp(age / uDryT, 0.0, 1.0);
      float e = edgeIn - 0.55 * k * (0.7 + 0.6 * rag);
      return on * smoothstep(0.0, 0.12, e) * (1.0 - 0.55 * k);
    }`;
  /** the wet stone of the floor along the trench and of its bed (o.hole: |aV| below it is the trench, not floor) */
  function wet(pts, o = {}) {
    const P = along(pts, 0.25), g = strip(P, o.w || 1.0, o.y);
    const mat = keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
      uniforms: { ...base(), uWetTo: { value: 0 }, uFrom: { value: -1 }, uTail: { value: -1 }, uDryV: { value: 3 }, uDryT: { value: 8 }, uHole: { value: o.hole || 0 }, uA: { value: o.alpha || 0.6 } },
      vertexShader: 'attribute float aU, aV; varying float vU, vV; varying vec3 vW; void main(){ vU = aU; vV = aV; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `${NZ} ${SKY} ${WETF} uniform float uT, uHole, uA; varying float vU, vV; varying vec3 vW;
        void main(){
          if (abs(vV) < uHole) discard;
          float rag = fb(vW.xz * 3.0);
          // on the floor: the splash band beside the trench, ragged; on the bed: all of it
          float edge = uHole > 0.0 ? (0.5 + 0.25 * rag + 0.2 * vn(vec2(vU * 2.0, vV))) - (abs(vV) - uHole) / (1.0 - uHole) : 1.0;
          float w = wetAt(vU, edge, rag);
          if (w < 0.004) discard;
          vec3 v = normalize(cameraPosition - vW); float fr = pow(1.0 - max(v.y, 0.0), 4.0);
          vec3 c = mix(vec3(0.12, 0.09, 0.06), skyOf(reflect(-v, vec3(0.0, 1.0, 0.0))) * 0.7, fr * 0.45);
          gl_FragColor = vec4(c, w * uA + fr * 0.08 * w); ${OUT} }`,
    }));
    const m = new T.Mesh(g, mat); m.renderOrder = 3; m.frustumCulled = false;
    return { mesh: m, len: g.userData.len, mat, set(wetTo, tail = -1, from = -1) { mat.uniforms.uWetTo.value = wetTo; mat.uniforms.uTail.value = tail; mat.uniforms.uFrom.value = from; } };
  }
  /** the trench's two sides, wet-dark from the bed to a little above the water line (o.w the trench's width, o.y0 the bed, o.h its depth,
   *  o.line the water's height over the bed) */
  function wetWalls(pts, o = {}) {
    const P = along(pts, 0.25), n = P.length, pos = [], aU = [], aH = [], idx = [];
    let u = 0;
    for (const s of [-1, 1]) {
      u = 0;
      for (let i = 0; i < n; i++) {
        const p = P[i], a = P[Math.max(0, i - 1)], b = P[Math.min(n - 1, i + 1)];
        if (i) u += Math.hypot(p[0] - P[i - 1][0], p[1] - P[i - 1][1]);
        let tx = b[0] - a[0], tz = b[1] - a[1]; const tl = Math.hypot(tx, tz) || 1; tx /= tl; tz /= tl;
        const k = s * (o.w / 2 - 0.004), x = p[0] - tz * k, z = p[1] + tx * k, base = pos.length / 3;
        pos.push(x, o.y0, z, x, o.y0 + o.h, z); aU.push(u, u); aH.push(0, o.h);
        if (i) idx.push(base - 2, base, base - 1, base - 1, base, base + 1);
      }
    }
    const g = keep(new T.BufferGeometry());
    g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('aU', new T.Float32BufferAttribute(aU, 1)); g.setAttribute('aH', new T.Float32BufferAttribute(aH, 1)); g.setIndex(idx);
    const mat = keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
      uniforms: { ...base(), uWetTo: { value: 0 }, uFrom: { value: -1 }, uTail: { value: -1 }, uDryV: { value: 3 }, uDryT: { value: 8 }, uLine: { value: o.line || 0.13 } },
      vertexShader: 'attribute float aU, aH; varying float vU, vH; varying vec3 vW; void main(){ vU = aU; vH = aH; vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `${NZ} ${SKY} ${WETF} uniform float uT, uLine; varying float vU, vH; varying vec3 vW;
        void main(){
          float rag = fb(vec2(vU * 4.0, vH * 9.0));
          float top = uLine + 0.05 + 0.05 * rag;
          float w = wetAt(vU, (top - vH) * 6.0, rag);
          if (w < 0.004) discard;
          gl_FragColor = vec4(vec3(0.11, 0.085, 0.06), w * 0.62); ${OUT} }`,
    }));
    const m = new T.Mesh(g, mat); m.renderOrder = 3; m.frustumCulled = false;
    return { mesh: m, mat, set(wetTo, tail = -1) { mat.uniforms.uWetTo.value = wetTo; mat.uniforms.uTail.value = tail; } };
  }

  /** a pour: one curved sheet of water from a lip (the centre of its edge p0, its first velocity v0, the across axis ax), falling under
   *  gravity for tt seconds; w0 its width at the lip, w1 at the foot; bowed across (thickness), streaks down it, strands below */
  function sheet(o = {}) {
    const NT = o.nt || 36, NS = o.ns || 10, pos = [], idx = [];
    for (let i = 0; i <= NT; i++) for (let j = 0; j <= NS; j++) { pos.push(i / NT, (j / NS) * 2 - 1, 0); if (i && j) { const a = (i - 1) * (NS + 1) + j - 1, b = a + 1, c = a + NS + 1, d = c + 1; idx.push(a, c, b, b, c, d); } }
    const g = keep(new T.BufferGeometry()); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
    const mat = keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false, side: T.DoubleSide,
      uniforms: { ...base(), uP0: { value: new T.Vector3() }, uV0: { value: new T.Vector3() }, uAx: { value: new T.Vector3(1, 0, 0) }, uTT: { value: 0.3 }, uW: { value: new T.Vector3(0.5, 0.2, 0) }, uG: { value: o.g || 20.4 }, uOn: { value: 0 }, uBreak: { value: o.brk != null ? o.brk : 0.55 } },
      vertexShader: `uniform vec3 uP0, uV0, uAx, uW; uniform float uTT, uG; varying vec3 vW, vN; varying vec2 vQ; varying float vSp;
        void main(){
          float t = position.x, s = position.y, tau = t * uTT;
          vec3 c = uP0 + uV0 * tau + vec3(0.0, -0.5 * uG * tau * tau, 0.0), tg = normalize(uV0 + vec3(0.0, -uG * tau, 0.0));
          vec3 nn = normalize(cross(tg, uAx));
          float w = mix(uW.x, uW.y, pow(t, 0.6)) * 0.5, bow = uW.z * w;
          vec3 p = c + uAx * s * w + nn * bow * (1.0 - s * s);
          vN = normalize(nn + uAx * s * 1.4 * (bow / max(w, 1e-3)));
          vQ = vec2(s * w, tau); vSp = length(uV0 + vec3(0.0, -uG * tau, 0.0));
          vW = p; gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }`,
      fragmentShader: `${NZ} ${SKY} uniform float uT, uTT, uOn, uBreak, uG; uniform vec3 uW, uV0; varying vec3 vW, vN; varying vec2 vQ; varying float vSp;
        void main(){
          if (uOn <= 0.0) discard;
          float t = vQ.y / max(uTT, 1e-3), s = vQ.x / max(0.5 * mix(uW.x, uW.y, pow(t, 0.6)), 1e-3);
          // the distance the water has fallen (amot), scrolled by time: streaks move down with it
          float sp0 = length(uV0), dist = sp0 * vQ.y + 0.25 * uG * vQ.y * vQ.y;
          float L = dist - uT * (sp0 + 0.5 * uG * uTT) * 0.9;
          float st = fb(vec2(vQ.x * 9.0, L * 1.2)), st2 = vn(vec2(vQ.x * 16.0 + 5.0, L * 2.6));
          // the break-up below: holes open between strands; the edges ragged
          float brk = smoothstep(uBreak, 1.0, t);
          float keepS = smoothstep(brk * 0.75 - 0.06, brk * 0.75 + 0.06, st2 * 0.7 + st * 0.3);
          float edge = 1.0 - smoothstep(0.7 - 0.25 * brk, 1.0, abs(s) + 0.15 * (vn(vec2(L * 3.0, s)) - 0.5));
          float a = edge * keepS * uOn;
          if (a < 0.01) discard;
          vec3 v = normalize(cameraPosition - vW), n = normalize(vN); if (dot(n, v) < 0.0) n = -n;
          vec3 Ls = normalize(uSun);
          float nv = max(dot(n, v), 0.0), fr = 0.04 + 0.96 * pow(1.0 - nv, 4.0);
          vec3 r = reflect(-v, n);
          float sd = max(dot(r, Ls), 0.0), back = pow(max(dot(-v, Ls), 0.0), 3.0);
          vec3 body = vec3(0.16, 0.30, 0.32);
          vec3 c = mix(body, skyOf(r) * 0.85, 0.25 + 0.55 * fr);
          c += sunc() * (pow(sd, 40.0) * 0.8 + back * 0.45 + 0.05);
          c += vec3(0.85, 0.9, 0.9) * smoothstep(0.6, 0.85, st) * 0.35;   // (the streaks)
          c += vec3(0.16) * (1.0 - nv);                                    // (the thick edge of the sheet, brighter)
          c = mix(c, vec3(0.95, 0.97, 0.96), 0.35 * brk * smoothstep(0.4, 0.7, st));   // (the strands go white as they break)
          gl_FragColor = vec4(c, clamp(a * (0.58 + 0.35 * fr + 0.25 * st), 0.0, 0.93)); ${OUT} }`,
    }));
    const m = new T.Mesh(g, mat); m.renderOrder = 6; m.frustumCulled = false;
    const u = mat.uniforms;
    return { mesh: m, mat, set(p0, v0, ax, tt, w0, w1, bow, on) { u.uP0.value.copy(p0); u.uV0.value.copy(v0); u.uAx.value.copy(ax).normalize(); u.uTT.value = tt; u.uW.value.set(w0, w1, bow); u.uOn.value = on; }, off() { u.uOn.value = 0; } };
  }

  /** a thin falling stream (the dribble off the bucket's bottom as it leaves the water): one strip facing the camera on a curve */
  function threads(N = 1, SEG = 20) {
    const pos = [], aI = [], idx = [];
    for (let k = 0; k < N; k++) for (let i = 0; i <= SEG; i++) { for (const s of [-1, 1]) { pos.push(i / SEG, s, 0); aI.push(k); } if (i) { const b = (k * (SEG + 1) + i - 1) * 2; idx.push(b, b + 1, b + 2, b + 1, b + 3, b + 2); } }
    const g = keep(new T.BufferGeometry()); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setAttribute('aI', new T.Float32BufferAttribute(aI, 1)); g.setIndex(idx);
    const P = Array.from({ length: N * 3 }, () => new T.Vector3()), W = Array.from({ length: N }, () => new T.Vector3());
    const mat = keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false, side: T.DoubleSide,
      uniforms: { ...base(), uP: { value: P }, uW: { value: W } },
      vertexShader: `uniform vec3 uP[${N * 3}]; uniform vec3 uW[${N}]; attribute float aI; varying vec2 vUv; varying float vOn;
        void main(){
          int k = int(aI + 0.5); vec3 p0 = uP[k * 3], p1 = uP[k * 3 + 1], p2 = uP[k * 3 + 2]; float t = position.x, s = position.y;
          vec3 p = mix(mix(p0, p1, t), mix(p1, p2, t), t), tg = normalize(mix(p1 - p0, p2 - p1, t) + 1e-5);
          vec3 vd = normalize(cameraPosition - p), side = normalize(cross(tg, vd) + 1e-5);
          float w = mix(uW[k].x, uW[k].y, t) * 0.5; vOn = uW[k].z; vUv = vec2(s, t * length(p2 - p0));
          gl_Position = projectionMatrix * viewMatrix * vec4(p + side * w * s, 1.0); }`,
      fragmentShader: `${NZ} ${SKY} uniform float uT; varying vec2 vUv; varying float vOn;
        void main(){
          if (vOn <= 0.0) discard;
          float e = abs(vUv.x), s = fb(vec2(vUv.x * 2.0, vUv.y * 2.0 - uT * 16.0));
          float keepS = smoothstep(0.35, 0.5, vn(vec2(vUv.x * 3.0, vUv.y * 3.0 - uT * 18.0)) + 0.25 - 0.06 * vUv.y);
          vec3 c = mix(vec3(0.55, 0.68, 0.70), skyOf(vec3(0.0, 0.5, 0.0)), 0.35) + vec3(0.5) * smoothstep(0.55, 0.8, s);
          float a = (0.55 + 0.35 * s) * (1.0 - smoothstep(0.5, 1.0, e)) * vOn * keepS;
          if (a < 0.01) discard;
          gl_FragColor = vec4(c, a); ${OUT} }`,
    }));
    const m = new T.Mesh(g, mat); m.renderOrder = 6; m.frustumCulled = false;
    return { mesh: m, set(k, p0, p1, p2, w0, w1, on) { if (k >= N) return; P[k * 3].copy(p0); P[k * 3 + 1].copy(p1); P[k * 3 + 2].copy(p2); W[k].set(w0, w1, on); }, off(k) { W[k].z = 0; } };
  }

  /** standing water. o.kind 'well' (a round shaft: uBox.xy its centre, uBox.z its radius, uRim the mouth's height over the water),
   *  'box' (a basin: uBox the centre xz and the half sizes, uRim the rim's height over the water, uDepth the water's depth), or plain
   *  (a bucket's). Its geometry should be subdivided where it heaves (o.heave) */
  function surface(o = {}) {
    const drops = Array.from({ length: 8 }, () => new T.Vector4(0, 0, NEVER, 0));
    const kind = o.kind || 'plain';
    const mat = keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      defines: { WELL: kind === 'well' ? 1 : 0, BOX: kind === 'box' ? 1 : 0 },
      uniforms: { ...base(), uDrops: { value: drops }, uFoam: { value: new T.Vector4(0, 0, 0, 0) }, uBox: { value: new T.Vector4(0, 0, 1, 1) }, uRim: { value: 1 }, uDepth: { value: 0.5 },
        uDeep: { value: new T.Color(o.deep || '#123038') }, uBed: { value: new T.Color(o.bed || '#8E7E62') }, uWall: { value: new T.Color(o.wall || '#CDBB9C') },
        uA: { value: o.alpha || 0.94 }, uChop: { value: o.chop != null ? o.chop : 1 }, uHeave: { value: o.heave || 0 }, uGlint: { value: o.glint != null ? o.glint : 1 }, uShaft: { value: o.shaft || 10 } },
      vertexShader: `uniform float uT, uHeave; uniform vec4 uFoam; uniform vec4 uDrops[8]; varying vec3 vW;
        void main(){ vec4 w = modelMatrix * vec4(position, 1.0);
          if (uHeave > 0.0) {
            float y = 0.0;
            if (uFoam.w > 0.0) { float r = length(w.xz - uFoam.xy); y += sin(r * 9.0 - uT * 11.0) * exp(-r * 2.2) * 0.035 * uFoam.w + exp(-r * r * 12.0) * 0.03 * uFoam.w; }
            for (int i = 0; i < 8; i++) { vec4 d = uDrops[i]; float age = uT - d.z; if (age < 0.0 || age > 3.0 || d.w <= 0.0) continue;
              float r = length(w.xz - d.xy), f = age * 1.3; y += sin((r - f) * 14.0) * exp(-pow((r - f) * 3.5, 2.0)) * 0.012 * d.w * (1.0 - age / 3.0); }
            w.y += y * uHeave;
          }
          vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
      fragmentShader: `${NZ} ${SKY} uniform float uT, uA, uChop, uGlint, uRim, uDepth, uShaft; uniform vec3 uDeep, uBed, uWall; uniform vec4 uDrops[8], uFoam, uBox; varying vec3 vW;
        void main(){
          vec2 p = vW.xz;
          // the slope: a slow swell, a fine chop from the baked noise (two drifting scales), the rings, the stir where a stream lands
          vec2 g = vec2(0.0);
          g += vec2(0.6, 0.35) * cos(dot(p, vec2(2.1, 1.2)) + uT * 1.3) * 0.02;
          g += vec2(-0.3, 0.8) * cos(dot(p, vec2(-0.9, 2.6)) + uT * 1.7) * 0.018;
          vec3 c1 = chop(p * 1.6 + vec2(uT * 0.35, uT * 0.12)), c2 = chop(p.yx * 2.7 - vec2(uT * 0.22, uT * 0.4) + 7.0);
          g += (c1.yz * 1.6 + c2.zy * 2.7) * 0.012 * uChop;
          float ringW = 0.0;
          for (int i = 0; i < 8; i++) { vec4 d = uDrops[i]; float age = uT - d.z; if (age < 0.0 || age > 3.0 || d.w <= 0.0) continue;
            vec2 q = p - d.xy; float r = length(q) + 1e-3, f = age * 1.3, k = exp(-pow((r - f) * 3.5, 2.0)) * d.w * (1.0 - age / 3.0);
            g += (q / r) * cos((r - f) * 14.0) * 0.16 * k; ringW += k * max(0.0, cos((r - f) * 14.0)); }
          float foam = 0.0;
          if (uFoam.w > 0.0) { vec2 q = p - uFoam.xy; float r = length(q);
            vec3 cf = chop(q * 5.0 - vec2(0.0, uT * 2.5));
            g += (q / (r + 1e-3)) * sin(r * 9.0 - uT * 11.0) * 0.2 * uFoam.w * exp(-r * 2.2) + cf.yz * 0.05 * uFoam.w * exp(-r * 1.5);
            foam = (1.0 - smoothstep(uFoam.z * 0.3, uFoam.z * (1.0 + 0.5 * cf.x), r)) * uFoam.w * smoothstep(0.3, 0.6, fb(q * 6.0 + vec2(uT * 1.5, -uT * 2.0)) + 0.2); }
          vec3 n = normalize(vec3(-g.x, 1.0, -g.y)), v = normalize(cameraPosition - vW), L = normalize(uSun);
          float nv = max(dot(n, v), 0.0), fr = 0.02 + 0.98 * pow(1.0 - nv, 5.0);
          vec3 r = reflect(-v, n); if (r.y < 0.02) r.y = 0.02; r = normalize(r);
          vec3 sk = skyOf(r), sun = sunc();
          vec3 refl = sk; float reflK = fr;
          vec3 body = pow(uDeep, vec3(1.0 / 2.2));
#if WELL
          // the shaft round the water: where the mirrored ray leaves the circle; above the mouth the bright sky
          vec2 q = p - uBox.xy; vec2 rh = r.xz; float a2 = dot(rh, rh) + 1e-6, b2 = dot(q, rh), c2r = dot(q, q) - uBox.z * uBox.z;
          float lam = (-b2 + sqrt(max(b2 * b2 - a2 * c2r, 0.0))) / a2, hW = r.y * lam;
          vec2 hit = q + rh * lam; vec2 dirW = normalize(hit);
          if (hW < uRim) {
            float d = uRim - hW;
            vec2 sH = normalize(L.xz); float chord = max(0.0, -2.0 * uBox.z * dot(dirW, sH)), lit = smoothstep(-0.25, 0.25, chord * L.y / max(length(L.xz), 1e-3) - d);
            float amb = 0.9 * exp(-d / 7.0) + 0.12;
            float joint = 1.0 - 0.35 * (1.0 - smoothstep(0.02, 0.07, abs(fract(hW * 2.0 + 0.5) - 0.5)));
            vec3 wall = pow(uWall, vec3(1.0 / 2.2)) * (amb * 0.55 + lit * sun * 1.15) * joint * (0.85 + 0.3 * vn(hit * 4.0 + hW));
            refl = wall; reflK = 0.22 + 0.5 * fr;
          } else { refl = sk * 1.25 + sun * 0.15; reflK = 0.55 + 0.4 * fr; }
          body = body * (0.6 + 0.4 * smoothstep(uBox.z, 0.0, length(q)));
#elif BOX
          vec2 q = p - uBox.xy; vec2 rh = r.xz + 1e-5;
          vec2 lamv = (sign(rh) * uBox.zw - q) / rh; float lam = min(lamv.x, lamv.y), hW = r.y * lam;
          if (hW < uRim) {
            float d = uRim - hW;
            vec2 nIn = lamv.x < lamv.y ? vec2(-sign(rh.x), 0.0) : vec2(0.0, -sign(rh.y));
            float facing = max(dot(nIn, normalize(L.xz)), 0.0);
            vec3 wall = pow(uWall, vec3(1.0 / 2.2)) * (0.35 + 0.65 * facing * sun * smoothstep(0.0, 0.3, 1.0 - d / max(uRim, 1e-3) + 0.3));
            refl = wall * (0.8 + 0.25 * vn((q + rh * lam) * 6.0 + hW * 3.0)); reflK = 0.18 + 0.6 * fr;
          } else { refl = mix(vec3(0.86, 0.70, 0.50), sk, smoothstep(0.05, 0.35, r.y)) * 0.85; reflK = 0.08 + 0.75 * fr; }
          // the bottom seen through, moved by the ripples (refraction), its stones and joints, the light netting on it
          vec2 bp = p + (n.xz * 0.9 - v.xz / max(v.y, 0.25) * 0.75) * uDepth;
          vec2 cell = bp / vec2(0.8, 0.55); cell.x += 0.5 * mod(floor(cell.y), 2.0) + 0.15 * vn(floor(cell.yy) * 3.1); vec2 fc = abs(fract(cell) - 0.5);
          float jt = smoothstep(0.44, 0.49, max(fc.x, fc.y)) * 0.6;
          vec3 bed = pow(uBed, vec3(1.0 / 2.2)) * (0.85 + 0.3 * vn(floor(cell) * 7.0)) * (1.0 - 0.45 * jt);
          float caus = smoothstep(0.5, 0.75, fb(bp * 2.5 + vec2(uT * 0.2, -uT * 0.15))) * 0.6;
          bed += sun * caus * 0.25;
          float att = 1.0 - exp(-uDepth * 2.2 / max(v.y, 0.2));
          body = mix(bed, body, clamp(att, 0.0, 0.85));
#else
          body = mix(pow(uBed, vec3(1.0 / 2.2)), body, 0.6);
#endif
          float sd = max(dot(r, L), 0.0);
          float glint = (pow(sd, 900.0) * 6.0 + pow(sd, 120.0) * 0.05) * uGlint;
          vec3 c = mix(body, refl, clamp(reflK, 0.0, 1.0)) + sun * glint;
          c += vec3(0.9, 0.95, 0.95) * ringW * 0.08;
          c = mix(c, vec3(0.95, 0.97, 0.95), clamp(foam, 0.0, 1.0) * 0.9);
          float a = clamp(uA + glint * 0.5 + foam * 0.4, 0.0, 1.0);
          gl_FragColor = vec4(c, a); ${OUT} }`,
    }));
    return mat;
  }
  /** set a surface's rings from a list [[x, z, t0, amp]...] (up to eight) */
  function rings(mat, list) { const D = mat.uniforms.uDrops.value; for (let i = 0; i < D.length; i++) { const r = list && list[i]; if (r) D[i].set(r[0], r[1], r[2], r[3]); else D[i].set(0, 0, NEVER, 0); } }

  /** falling drops as short streaks (instanced quads facing the camera): set each frame, (x, y, z, size, speed) */
  function drops(N = 160) {
    const g = keep(new T.InstancedBufferGeometry());
    g.setAttribute('position', new T.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3)); g.setIndex([0, 1, 2, 0, 2, 3]);
    const iP = new T.InstancedBufferAttribute(new Float32Array(N * 4), 4), iV = new T.InstancedBufferAttribute(new Float32Array(N * 3), 3);
    iP.setUsage(T.DynamicDrawUsage); iV.setUsage(T.DynamicDrawUsage); g.setAttribute('iP', iP); g.setAttribute('iV', iV); g.instanceCount = 0;
    const mat = keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { ...base(), uBlur: { value: 0.03 } },
      vertexShader: `attribute vec4 iP; attribute vec3 iV; uniform float uBlur; varying vec2 vQ; varying float vL;
        void main(){
          vec3 c = iP.xyz; float r = iP.w; vec3 vel = iV; float sp = length(vel);
          vec3 ax = sp > 0.01 ? -vel / sp : vec3(0.0, 1.0, 0.0);
          float L = r * 1.3 + sp * uBlur;
          vec3 side = normalize(cross(ax, cameraPosition - c) + 1e-5) * r * 0.8;
          vec3 p = c + side * position.x + ax * (position.y * 0.5 + 0.5) * L - ax * r * 0.6;
          vQ = position.xy; vL = L / max(r, 1e-3);
          gl_Position = projectionMatrix * viewMatrix * vec4(p, 1.0); }`,
      fragmentShader: `${SKY} varying vec2 vQ; varying float vL;
        void main(){
          float y = vQ.y * 0.5 + 0.5;   // (0 the drop's head, 1 the end of its trail)
          float w = mix(1.0, 0.25, y);
          float e = abs(vQ.x) / w; if (e > 1.0) discard;
          float a = (1.0 - smoothstep(0.5, 1.0, e)) * mix(0.95, 0.15, y);
          vec3 c = mix(vec3(0.66, 0.78, 0.80), skyOf(vec3(0.0, 0.6, 0.0)), 0.4) + sunc() * 0.35 * (1.0 - y) + vec3(0.3) * (1.0 - e) * (1.0 - y);
          gl_FragColor = vec4(c, a); ${OUT} }`,
    }));
    const m = new T.Mesh(g, mat); m.frustumCulled = false; m.renderOrder = 7;
    return { mesh: m, N, set(list) { const n = Math.min(N, list.length); for (let i = 0; i < n; i++) { const d = list[i]; iP.setXYZW(i, d[0], d[1], d[2], d[3]); iV.setXYZ(i, d[4] || 0, d[5] || 0, d[6] || 0); } g.instanceCount = n; iP.needsUpdate = true; iV.needsUpdate = true; } };
  }

  /** a basin's inner walls (the box x0, z0, x1, z1 from y0 to y1): the water line (a bright thin line, the meniscus) at the level, the
   *  wet stone above it as high as the water has wetted (uWetTop) */
  function lines(x0, z0, x1, z1, y0, y1) {
    const e = 0.004, pos = [];
    const quad = (ax, az, bx, bz) => { pos.push(ax, y0, az, bx, y0, bz, bx, y1, bz, ax, y0, az, bx, y1, bz, ax, y1, az); };
    quad(x0 + e, z0 + e, x1 - e, z0 + e); quad(x1 - e, z0 + e, x1 - e, z1 - e); quad(x1 - e, z1 - e, x0 + e, z1 - e); quad(x0 + e, z1 - e, x0 + e, z0 + e);
    const g = keep(new T.BufferGeometry()); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
    const mat = keep(new T.ShaderMaterial({
      transparent: true, depthWrite: false, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -3, polygonOffsetUnits: -3,
      uniforms: { ...base(), uLevel: { value: y0 - 1 }, uWetTop: { value: y0 - 1 } },
      vertexShader: 'varying vec3 vW; void main(){ vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }',
      fragmentShader: `${NZ} ${SKY} uniform float uT, uLevel, uWetTop; varying vec3 vW;
        void main(){
          float s = vW.x + vW.z;
          float wob = 0.006 * sin(s * 7.0 + uT * 2.3) + 0.004 * sin(s * 13.0 - uT * 3.1);
          float lv = uLevel + wob, dy = vW.y - lv;
          if (dy < -0.004) discard;
          float top = max(uWetTop, uLevel) + 0.04 + 0.05 * fb(vec2(s * 3.0, 1.0));
          float wetA = (1.0 - smoothstep(top - 0.03, top, vW.y)) * 0.55;
          float line = 1.0 - smoothstep(0.0, 0.012, abs(dy));
          vec3 c = mix(vec3(0.12, 0.09, 0.06), mix(skyOf(vec3(0.0, 0.3, 0.0)), sunc(), 0.5) * 1.1, line);
          float a = max(wetA, line * 0.85);
          if (a < 0.01) discard;
          gl_FragColor = vec4(c, a); ${OUT} }`,
    }));
    const m = new T.Mesh(g, mat); m.renderOrder = 4; m.frustumCulled = false;
    return { mesh: m, mat, set(level, wetTop) { mat.uniforms.uLevel.value = level; mat.uniforms.uWetTop.value = wetTop; } };
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
    U, along, strip, flow, wet, wetWalls, sheet, threads, surface, rings, drops, lines, spots,
    tick(dt) { U.t.value += Math.min(0.1, Math.max(0, dt)); },
    dispose() { for (const o of own) try { o.dispose(); } catch (e) { /* */ } },
  };
}
