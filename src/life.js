// People, priests, Levites, doves, fire and the column of smoke. Also the shared animal herd (animals.js) and blob
// shadows, and the hook through which the service layer (avodah3d.js) is advanced every frame (addUpdater).
import * as THREE from 'three';
import { mergeGeometries, mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { rng } from './util.js';
import { MENOROT } from './temple.js';
import { createAnimals, Blobs } from './animals.js';
import { setCam } from './light28.js';   // ── light28 ── ── /light28 ──


// one crowd figure (robe, sleeves and hands, sash, face with a beard, head covering) as a single indexed geometry;
// aPart: 0 robe (instance colour) · 1 skin (shade) · 2 head covering (iHead) · 3 sash (priests: the avnet's colours) · 4 fixed
function figureGeo() {
  const parts = [];
  const add = (g, hex, part, fn) => {
    for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a);
    if (!g.index) g = mergeVertices(g);
    const n = g.attributes.position.count, P = g.attributes.position.array, col = new Float32Array(n * 3), c = new THREE.Color();
    for (let i = 0; i < n; i++) { c.set(hex); if (fn) fn(P[i * 3 + 1], c); col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b; }
    g.setAttribute('color', new THREE.BufferAttribute(col, 3));
    g.setAttribute('aPart', new THREE.BufferAttribute(new Float32Array(n).fill(part), 1));
    parts.push(g);
  };
  const v2 = ([a, b]) => new THREE.Vector2(a, b);
  add(new THREE.LatheGeometry([[0.001, 0.12], [0.5, 0.13], [0.44, 0.85], [0.38, 1.55], [0.43, 2.3], [0.22, 2.64], [0.001, 2.69]].map(v2), 7), '#ffffff', 0);
  for (const s of [1, -1]) {
    const g = new THREE.CylinderGeometry(0.09, 0.12, 0.85, 4, 1, true); g.translate(0, -0.42, 0); g.rotateZ(s * 0.09); g.translate(0.44 * s, 2.52, 0.02);
    add(g, '#ffffff', 0);
  }
  add(new THREE.CylinderGeometry(0.42, 0.415, 0.15, 7, 3, true).translate(0, 2.02, 0), '#ffffff', 3,
    (y, c) => { const k = Math.floor((y - 1.945) / 0.05); c.set(['#2C5CA6', '#7A2D6C', '#B8222C'][Math.max(0, Math.min(2, k))]); });
  add(new THREE.SphereGeometry(0.27, 6, 4).scale(0.95, 1.04, 1).translate(0, 2.95, 0.02), '#C99466', 1);
  add(new THREE.SphereGeometry(0.23, 5, 2, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5).scale(1, 1.1, 0.9).translate(0, 2.92, 0.07), '#33241A', 4);
  add(new THREE.SphereGeometry(0.3, 6, 3, 0, Math.PI * 2, 0, Math.PI * 0.55).scale(1, 1.12, 1).translate(0, 2.97, -0.01), '#ffffff', 2);
  const g = mergeGeometries(parts); g.computeBoundingSphere(); return g;
}

function particleMat(tex, color, additive) {
  return new THREE.ShaderMaterial({
    uniforms: { map: { value: tex }, color: { value: color }, scale: { value: 600 }, uNear: { value: additive ? 1 : 0 } },   // ── light28 ── (uNear) ── /light28 ──
    // ── light28 ── an additive glow dims with the camera's distance, per particle (light28.js nearDim: full at 40 amot, 0.12 at 6 and nearer):
    // a torch's or a lamp's sprites seen from a close camera no longer stack into a white blob (the owner's shot 2, the pen at dawn)
    vertexShader: `attribute float size; attribute float alpha; varying float vA; uniform float scale; uniform float uNear;
      void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vA = alpha * mix(1.0, 0.12 + 0.88 * clamp((length(mv.xyz) - 6.0) / 34.0, 0.0, 1.0), uNear);
        gl_PointSize = size * scale / max(1.0, -mv.z); gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D map; uniform vec3 color; varying float vA;
      void main(){ vec4 t = texture2D(map, vec2(gl_PointCoord.x, 1.0 - gl_PointCoord.y)); gl_FragColor = vec4(color * t.rgb, t.a * vA); }`,
    transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
  });
}

class Emitter {
  constructor(n, mat, spawn, step) {
    this.n = n; this.spawn = spawn; this.step = step;
    this.pos = new Float32Array(n * 3); this.size = new Float32Array(n); this.alpha = new Float32Array(n);
    this.age = new Float32Array(n); this.life = new Float32Array(n); this.seed = new Float32Array(n);
    this.v = new Float32Array(n * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute('size', new THREE.BufferAttribute(this.size, 1));
    g.setAttribute('alpha', new THREE.BufferAttribute(this.alpha, 1));
    this.points = new THREE.Points(g, mat); this.points.frustumCulled = false;
    for (let i = 0; i < n; i++) { this.spawn(this, i); this.age[i] = Math.random() * this.life[i]; }
  }
  update(dt, t) {
    for (let i = 0; i < this.n; i++) {
      this.age[i] += dt;
      if (this.age[i] >= this.life[i]) { this.spawn(this, i); this.age[i] = 0; }
      this.step(this, i, dt, t);
    }
    const a = this.points.geometry.attributes;
    a.position.needsUpdate = true; a.size.needsUpdate = true; a.alpha.needsUpdate = true;
  }
}

export function buildLife(scene, tex) {
  const r = rng(2024);
  const PIL = ['#8C5A3C', '#3F5F8C', '#7A3E3E', '#C9A66B', '#556B3A', '#E0D7C5', '#6B4E7A', '#B55A3A', '#D8C9A8', '#2F4F4F', '#9E7B4F', '#4E6E8E'].map((c) => new THREE.Color(c));
  const WHITE = new THREE.Color('#FBF9F2'), LEVI = new THREE.Color('#EFE9DB');
  const pil = () => PIL[Math.floor(r() * PIL.length)];
  const SKIN = ['#D6A47A', '#C58C60', '#E2B48A', '#B97F55'].map((c) => new THREE.Color(c));
  const CLOTH = ['#EDE6D6', '#D9CBAE', '#B8A07A', '#8C6E4E', '#F2EEE6'].map((c) => new THREE.Color(c));
  const rect = (x0, x1, z0, z1) => [x0 + r() * (x1 - x0), z0 + r() * (z1 - z0)];
  const gauss = () => (r() + r() + r() - 1.5) * 1.4;

  /* ── static crowd ── */
  const st = [];   // [x,y,z,rot,color]
  const add = (x, y, z, c) => st.push([x, y, z, r() * 6.28, c]);
  for (let i = 0; i < 300; i++) {
    let x, z;
    if (i < 140) { const c = i % 2 ? [-101, 316] : [31, 316]; x = c[0] + gauss() * 22; z = c[1] - Math.abs(gauss()) * 30; }
    else[x, z] = rect(-256, 234, 100, 322);
    add(x, 0, z, pil());
  }
  for (let i = 0; i < 90; i++) { const [x, z] = rect(172, 236, -436, 318); if (Math.abs(z) < 95 && x < 172) continue; add(x, 0, z, pil()); }
  for (let i = 0; i < 110; i++) { const [x, z] = rect(-256, 232, -438, -100); add(x, 0, z, pil()); }
  for (let i = 0; i < 50; i++) { const [x, z] = rect(-257, -216, -436, 318); add(x, 0, z, pil()); }
  for (let i = 0; i < 90; i++) {
    const k = i % 3;
    const [x, z] = k === 0 ? rect(-291, -267, -460, 315) : k === 1 ? rect(244, 268, -460, 315) : rect(-280, 255, -471, -447);
    add(x, 0, z, pil());
  }
  for (let i = 0; i < 110; i++) { const [x, z] = rect(-290, 268, 336, 391); add(x, 0, z, pil()); }
  for (let i = 0; i < 50; i++) { const s = r() < 0.5 ? -1 : 1; add(-200 + r() * 354, 6, s * (75.5 + r() * 7.5), pil()); }
  for (let i = 0; i < 150; i++) { const [x, z] = rect(48, 99, -60, 60); add(x, 6, z, pil()); }
  for (let i = 0; i < 8; i++) { const [x, z] = rect(106, 138, 32, 64); add(x, 6, z, pil()); }
  // Levites on the fifteen steps
  for (const j of [1, 4, 7, 10, 13]) for (let q = 0; q < 8; q++) { const R = 6 + 0.5 * j + 0.25, ph = -1.2 + q * (2.4 / 7); add(10 + R * Math.cos(ph), 13.5 - 0.5 * j, R * Math.sin(ph), LEVI); }
  // Israelites in Ezrat Yisrael, Levites on the Duchan
  for (let i = 0; i < 44; i++) { const [x, z] = rect(-7.4, -0.8, -62, 62); add(x, 13.5, z, pil()); }
  for (let z = -42; z <= 42; z += 4.2) add(-11.4, 16, z, LEVI);
  // priests in the Azara — standing by the walls and on the south side, off the paths of the service (world.avodah):
  // the rings and tables, the kevesh, the altar and the kiyor are left to the kohanim at work
  for (let i = 0; i < 12; i++) { const [x, z] = rect(-150, -100, 45, 62); add(x, 16, z, WHITE); }
  for (let i = 0; i < 8; i++) { const [x, z] = rect(-145, -100, -65, -59); add(x, 16, z, WHITE); }
  for (let i = 0; i < 8; i++) { const [x, z] = rect(-24, -13, 48, 63); add(x, 16, z, WHITE); }
  for (const [x, z] of [[-26, -11], [-33, -13]]) add(x, 25, z, WHITE);            // tending the great fire
  for (const [x, z, y] of [[-74, -22, 22], [-74, 22, 22], [-73, -40, 22]]) add(x, y, z, WHITE);
  for (let i = 0; i < 4; i++) { const [x, z] = rect(-112, -76, -100, -92); add(x, 0, z, pil()); }   // shepherds with their flock
  // while the Temple is being built only a few pilgrims wander the new platform: put a sparse subset first
  st.forEach((a, i) => { a.push(i < 750 && i % 14 === 3); });
  st.sort((a, b) => (b[5] ? 1 : 0) - (a[5] ? 1 : 0));
  const FEW = st.filter((a) => a[5]).length;

  const fg = figureGeo(), pm = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
  // prostration (world.avodah.bow): people in the courts kneel and bow their heads to the floor — in the shader,
  // from one uniform and a per-instance flag (aCourt), so the whole crowd bows without touching a matrix
  const uBow = { value: 0 };
  pm.onBeforeCompile = (sh) => {
    sh.uniforms.uBow = uBow;
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aPart; attribute float aCourt; attribute vec3 iHead; attribute vec2 iMisc; uniform float uBow;')
      .replace('#include <color_vertex>', `vColor = vec4(1.0);
        vec3 cc = color.rgb;
        #ifdef USE_INSTANCING_COLOR
          if (aPart < 0.5) cc *= instanceColor.rgb;
          else if (aPart > 2.5 && aPart < 3.5 && iMisc.y < 0.5) cc = instanceColor.rgb * 0.62;
        #endif
        if (aPart > 0.5 && aPart < 1.5) cc *= iMisc.x;
        if (aPart > 1.5 && aPart < 2.5) cc = iHead;
        vColor.rgb = cc;`)
      .replace('#include <begin_vertex>', `#include <begin_vertex>
        { float k = uBow * aCourt;
          if (k > 0.0) {
            float y = transformed.y;
            if (y < 1.4) transformed.y = y * (1.0 - 0.45 * k);
            else { float a = 1.25 * k, c = cos(a), s = sin(a); float dy = y - 1.4; transformed.y = 1.4 * (1.0 - 0.45 * k) + dy * c; transformed.z += dy * s; }
          } }`);
  };
  pm.customProgramCacheKey = () => 'crowd';
  const HAIR = ['#2A1E16', '#3B2A1E', '#1E1712'].map((c) => new THREE.Color(c)), PRIEST_CAP = new THREE.Color('#F4F1E8'), LEVI_CAP = new THREE.Color('#E4D8BF');
  const capFor = (c) => (c === WHITE ? PRIEST_CAP : c === LEVI ? LEVI_CAP : r() < 0.5 ? HAIR[Math.floor(r() * HAIR.length)] : CLOTH[Math.floor(r() * CLOTH.length)]);
  // one InstancedMesh per crowd: robe colour, head covering, skin shade, priest flag and the court flag per instance
  const crowdMesh = (list) => {
    const g = fg.clone(), n = list.length, court = new Float32Array(n), head = new Float32Array(n * 3), misc = new Float32Array(n * 2);
    list.forEach((e, i) => { court[i] = e.court ? 1 : 0; const h = capFor(e.c); head.set([h.r, h.g, h.b], i * 3); misc[i * 2] = 0.8 + r() * 0.35; misc[i * 2 + 1] = e.c === WHITE ? 1 : 0; });
    g.setAttribute('aCourt', new THREE.InstancedBufferAttribute(court, 1)); g.setAttribute('iHead', new THREE.InstancedBufferAttribute(head, 3)); g.setAttribute('iMisc', new THREE.InstancedBufferAttribute(misc, 2));
    const m = new THREE.InstancedMesh(g, pm, n); m.frustumCulled = false; m.receiveShadow = true; scene.add(m);
    list.forEach((e, i) => m.setColorAt(i, e.c));
    return m;
  };
  // (in the courts: the Chel, Ezrat Nashim and the azara, but not the Levites singing on the steps)
  const inCourts = (x, y, z, c) => y >= 5.9 && x > -205 && x < 160 && Math.abs(z) < 86 && c !== LEVI;
  const people = crowdMesh(st.map(([x, y, z, rot, c]) => ({ court: inCourts(x, y, z, c), c })));
  const M = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1), up = new THREE.Vector3(0, 1, 0);
  st.forEach(([x, y, z, rot], i) => { q.setFromAxisAngle(up, rot); p.set(x, y, z); M.compose(p, q, one); people.setMatrixAt(i, M); });

  /* ── walkers ── */
  const zones = [
    { x0: -256, x1: 234, z0: 100, z1: 322, y: 0, n: 64 },
    { x0: 172, x1: 236, z0: -436, z1: 318, y: 0, n: 22 },
    { x0: -256, x1: 232, z0: -438, z1: -100, y: 0, n: 30 },
    { x0: -257, x1: -216, z0: -436, z1: 318, y: 0, n: 10 },
    { x0: 48, x1: 99, z0: -60, z1: 60, y: 6, n: 26 },
    { x0: -20.5, x1: -12, z0: 20, z1: 62, y: 16, n: 6, priest: true },
  ];
  const W = [];
  const lane = { dx: 0, off: false, zero: new THREE.Vector3(0, 0, 0) };   // ── recovered (16–26c) ── rampLane(): the kevesh's kohanim stepped aside by dx, or hidden ('off')
  zones.forEach((Z, zi) => { for (let k = 0; k < Z.n; k++) { const [x, z] = rect(Z.x0, Z.x1, Z.z0, Z.z1); W.push({ zi, x, z, y: Z.y, tx: x, tz: z, sp: 1.6 + r() * 1.1, ph: r() * 6.28, c: Z.priest ? WHITE : pil(), kev: false }); } });
  // (on the eastern half of the kevesh only: the limbs lie on its lower western half, Tamid 4:3)
  for (let k = 0; k < 4; k++) W.push({ kev: true, x: -35.5 + r() * 4.5, z: 12 + r() * 30, dir: r() < 0.5 ? 1 : -1, sp: 1.3 + r() * 0.6, ph: r() * 6.28, c: WHITE });
  W.forEach((w, i) => { w.few = !w.kev && w.zi <= 3 && i % 5 === 1; });
  W.sort((a, b) => (b.few ? 1 : 0) - (a.few ? 1 : 0));
  const WFEW = W.filter((w) => w.few).length;
  const walkers = crowdMesh(W.map((w) => ({ court: w.y >= 5.9 || w.kev, c: w.c })));

  /* ── the herd (animals.js): lambs brought for offerings wait with their shepherds on the Mount, north of the Chel ── */
  const blobs = new Blobs(scene, 512);
  const animals = createAnimals({ scene, blobs, ground: () => 0 });
  for (let i = 0; i < 26; i++) { const [x, z] = rect(-110, -78, -100, -93); animals.add(i % 9 === 4 ? 'ram' : i % 7 === 3 ? 'goat' : 'lamb', x, z, { y: 0, calm: true, wander: { x0: -110, x1: -78, z0: -100, z1: -93 } }); }

  /* ── doves ── */
  // ── people7 ── a rock dove that reads from above as well as against the sky: pale wings darkening to grey tips, a grey tail
  // fan and a small head (still one draw call; vertex colours)
  const dg = new THREE.BufferGeometry();
  dg.setAttribute('position', new THREE.BufferAttribute(new Float32Array([
    0, 0, -0.9, -2.2, 0.35, 0.2, 0, 0, 0.7, 0, 0, -0.9, 0, 0, 0.7, 2.2, 0.35, 0.2,          // the wings
    0, 0.02, -0.7, -0.45, 0.02, -1.7, 0.45, 0.02, -1.7,                                       // the tail
    -0.16, 0.05, 0.6, 0.16, 0.05, 0.6, 0, 0.1, 1.2]), 3));                                    // the head
  const DC = (h) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; }, dW = DC('#F4F2EE'), dT = DC('#6F777F'), dB = DC('#D8DADC'), dH = DC('#8C949C');
  dg.setAttribute('color', new THREE.BufferAttribute(new Float32Array([...dB, ...dT, ...dW, ...dB, ...dW, ...dT, ...dB, ...dT, ...dT, ...dH, ...dH, ...dH]), 3));
  dg.computeVertexNormals();
  const doves = new THREE.InstancedMesh(dg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.DoubleSide }), 16);
  const D = [...Array(16)].map(() => ({ cx: -110 + (r() - 0.5) * 120, cz: (r() - 0.5) * 140, R: 90 + r() * 170, y: 122 + r() * 50, w: (0.07 + r() * 0.07) * (r() < 0.5 ? -1 : 1), a: r() * 6.28, f: r() * 6.28 }));
  doves.frustumCulled = false; scene.add(doves);

  /* ── fire, smoke ── */
  const FIRE = [-29.5, 25.4, -3.5], KET = [-49.5, 25.3, 6.5], NAZ = [121, 9.3, 50];
  const smokeCol = new THREE.Color('#DDD4C9');
  const smokeBase = smokeCol.clone(), smokeLow = new THREE.Color('#8A8279');   // ── recovered (16–26c) ── (setNight's smoke, and a low fire's grey)
  // "ולא נצחה הרוח את עמוד העשן" — a straight column
  const smoke = new Emitter(120, particleMat(tex.puff, smokeCol, false), (e, i) => {
    e.pos.set([FIRE[0] + (r() - 0.5) * 1.4, FIRE[1] + 1.5, FIRE[2] + (r() - 0.5) * 1.4], i * 3);
    e.life[i] = 26 + r() * 8; e.seed[i] = r();
  }, (e, i, dt, t) => {
    const k = e.age[i] / e.life[i], sm = LV.smoke;
    e.pos[i * 3 + 1] += dt * (7.2 - k * 1.8) * (0.8 + 0.2 * sm);
    e.pos[i * 3] += dt * Math.sin(t * 0.3 + e.seed[i] * 6.28) * 0.35;
    e.size[i] = (2.4 + k * 26 + e.seed[i] * 2) * (0.7 + 0.3 * sm) * fireLv.sm;   // ── recovered (16–26c) ── (× fireLv.sm)
    e.alpha[i] = Math.min(1, e.age[i] / 3.5) * Math.pow(1 - k, 1.0) * Math.min(0.95, 0.62 * sm) * Math.min(1.25, fireLv.sm);
  });
  const flameCol = new THREE.Color(3.2, 1.55, 0.55);
  const spawnAt = (P, spread, life) => (e, i) => {
    e.pos.set([P[0] + (r() - 0.5) * spread, P[1], P[2] + (r() - 0.5) * spread], i * 3);
    e.life[i] = life * (0.6 + r() * 0.6); e.seed[i] = 0.6 + r() * 0.8;
  };
  const flameStep = (h, s) => (e, i, dt) => { const k = e.age[i] / e.life[i]; e.pos[i * 3 + 1] += dt * h; e.size[i] = s * e.seed[i] * (1 - k * 0.6); e.alpha[i] = Math.sin(Math.PI * k) * 0.95; };
  const fm = particleMat(tex.flame, flameCol, true);
  // ── recovered (16–26c) ── the great fire's live scale (update(): the day's fire meter, a flare, a low fire): height, size, alpha, smoke
  const fireLv = { h: 1, s: 1, a: 1, sm: 1, lo: 0 };
  const greatStep = (e, i, dt) => { const k = e.age[i] / e.life[i], f = LV.fire; e.pos[i * 3 + 1] += dt * 6.5 * (0.7 + 0.3 * f) * fireLv.h; e.size[i] = 5.2 * e.seed[i] * (1 - k * 0.6) * (0.55 + 0.45 * f) * fireLv.s; e.alpha[i] = Math.sin(Math.PI * k) * Math.min(1, 0.95 * f) * fireLv.a; };
  // the great fire has its own material so that at night its HDR flames can burn less white-hot: at night the bloom is
  // strong (0.6, threshold 1.0) and a close view of the altar (the whole view's "המזבח", Phase B at night) went all orange
  const fireCol = flameCol.clone(), fmGreat = particleMat(tex.flame, fireCol, true);
  fmGreat.uniforms.uNear.value = 0;   // ── light28 ── (the pyre keeps fable27's own dim, by its centre) ── /light28 ──
  const flames = [
    new Emitter(46, fmGreat, spawnAt(FIRE, 4.5, 0.9), greatStep),
    new Emitter(14, fm, spawnAt(KET, 1.6, 0.7), flameStep(3.5, 2.6)),
    new Emitter(10, fm, spawnAt(NAZ, 1.4, 0.7), flameStep(3, 2.2)),
  ];
  const nightFlames = [];
  for (const [x, z] of MENOROT) for (const [dx, dz] of [[3, 0], [-3, 0], [0, 3], [0, -3]]) nightFlames.push([x + dx, 55.4, z + dz]);
  const menFl = new Emitter(nightFlames.length * 4, fm, (e, i) => { const P = nightFlames[Math.floor(i / 4)]; e.pos.set([P[0] + (r() - 0.5) * 1.2, P[1], P[2] + (r() - 0.5) * 1.2], i * 3); e.life[i] = 0.6 + r() * 0.5; e.seed[i] = 0.8 + r() * 0.6; }, flameStep(4, 4.2));
  const torchPos = [[-95, 27, -78.8], [-38, 27, -78.8], [-160, 27, 78.8], [-118, 27, 78.8], [-38, 27, 78.8], [10.9, 34.5, -6], [10.9, 34.5, 6], [150.9, 27, -6], [150.9, 27, 6], [-160, 25, -83.8], [285.9, 21, -7], [285.9, 21, 7]];
  const torches = new Emitter(torchPos.length * 3, fm, (e, i) => { const P = torchPos[Math.floor(i / 3)]; e.pos.set([P[0] + (r() - 0.5) * 0.4, P[1], P[2] + (r() - 0.5) * 0.4], i * 3); e.life[i] = 0.5 + r() * 0.4; e.seed[i] = 0.7 + r() * 0.5; }, flameStep(2.4, 2.4));
  for (const e of [smoke, ...flames]) scene.add(e.points);
  const nightG = new THREE.Group(); nightG.add(menFl.points, torches.points); nightG.visible = false; scene.add(nightG);

  const fireLight = new THREE.PointLight('#FF8A3A', 120, 0, 2); fireLight.position.set(FIRE[0], FIRE[1] + 5, FIRE[2]);
  scene.add(fireLight);
  const menLights = MENOROT.map(([x, z]) => { const L = new THREE.PointLight('#FFB35A', 0, 0, 2); L.position.set(x, 58, z); L.visible = false; scene.add(L); return L; });
  const menHome = menLights.map((L) => L.position.clone());

  // ── world12 ── the lamps hung for Chanukat HaBayit (the owner, 29.9 20:37: "והרבה אור"): little oil lamps along the courts'
  // walls, the Ezrat Nashim's east face and the Mount's eastern wall — hung one by one as the last stages near their end
  // (setFest(n): the first n), lit at night; on the celebration's night all of them, in the manner of Simchat Beit HaShoeva
  // ("לא היתה חצר בירושלים שאינה מאירה מאור בית השואבה", Sukkah 5:3; an illustration). One draw call.
  const festPos = [];
  for (let x = -185; x <= 146; x += 11) for (const z of [-78.8, 78.8]) festPos.push([x, 27.4, z]);
  for (let z = -66; z <= 66; z += 11) if (Math.abs(z) > 9) festPos.push([151.4, 27.4, z]);
  for (let z = -150; z <= 150; z += 15) if (Math.abs(z) > 12) festPos.push([286.4, 21.4, z]);
  // (the order they are hung in: spread over the whole length, not wall by wall)
  const festOrd = festPos.map((_, i) => i).sort((a, b) => ((a * 37) % festPos.length) - ((b * 37) % festPos.length));
  let festN = 0, festOn = false;
  const festFl = new Emitter(festPos.length * 2, fm, (e, i) => {
    const k = festN > 0 ? festOrd[Math.floor(i / 2) % festN] : 0, P = festPos[k];
    e.pos.set([P[0] + (r() - 0.5) * 0.3, P[1], P[2] + (r() - 0.5) * 0.3], i * 3); e.life[i] = 0.45 + r() * 0.35; e.seed[i] = 0.7 + r() * 0.5;
  }, (e, i, dt) => { const k = e.age[i] / e.life[i]; e.pos[i * 3 + 1] += dt * 1.6; e.size[i] = (Math.floor(i / 2) < festN ? 1.7 : 0) * e.seed[i] * (1 - k * 0.5); e.alpha[i] = Math.sin(Math.PI * k) * 0.95; });
  // the golden house lit on the celebration's night: a soft warm glow over the Ulam's gold front (the lamps' and the fires'
  // light on it), breathing a little
  const glowCol = new THREE.Color(0.55, 0.36, 0.12), GLOW = [];
  for (const y of [42, 68, 94]) for (const z of [-30, 0, 30]) GLOW.push([-64, y, z]);
  const glow = new Emitter(GLOW.length, particleMat(tex.puff, glowCol, true), (e, i) => { e.pos.set(GLOW[i], i * 3); e.life[i] = 1e9; e.seed[i] = r(); }, (e, i, dt, t) => { e.size[i] = 46 + 6 * Math.sin(t * 0.7 + e.seed[i] * 6.28); e.alpha[i] = 0.34 + 0.08 * Math.sin(t * 1.3 + e.seed[i] * 6.28); });
  glow.points.visible = false;
  const festG = new THREE.Group(); festG.add(festFl.points, glow.points); festG.visible = false; scene.add(festG);
  const festSync = () => { festG.visible = festN > 0 && (S.night || festOn); glow.points.visible = festOn; };
  // ── /world12 ──

  const particles = [smoke, ...flames, menFl, torches];
  const setScale = (s) => [...particles, festFl, glow].forEach((e) => { e.points.material.uniforms.scale.value = s; });   // (world12: + the lamps, the glow)

  let T = 0;
  // ── fable27 ── the pyre seen from close (a work on the altar or the ramp: the camera at 10 amot) blew out to a white blot over the kohen
  // (SLICE27's deshen-4hold shot): the 46 additive sprites dim with the camera's distance — full at 40 amot, 0.14 at 10 and nearer
  const fireK = { night: 1, near: 1, cam: null };
  const fireSync = () => { fireCol.copy(flameCol).multiplyScalar(fireK.night * fireK.near); };
  function fireNear() {
    const c = fireK.cam; if (!c || !c.position) return;
    const d = Math.hypot(c.position.x - FIRE[0], c.position.y - FIRE[1], c.position.z - FIRE[2]);
    // ── light28 ── (+ the camera's steepness over the pyre: looked down on from above, its rising sprites stack along the line of sight into one
    // white-orange cloud over a third of the frame — the owner's shot 4, the תפוח beside it; from 30° up it dims to 0.35 at 70°)
    const el = Math.asin(Math.max(-1, Math.min(1, (c.position.y - FIRE[1]) / Math.max(1e-3, d)))) * 180 / Math.PI, kEl = 1 - 0.65 * Math.max(0, Math.min(1, (el - 30) / 40));
    const kf = Number.isFinite(globalThis.__FIRE33) ? Math.max(0.25, Math.min(1.6, globalThis.__FIRE33)) : 1;   // ── fable32 (build 10) ── (the day's fire meter: embers at 0.25, full at 1, a high level up to 1.6) ── /fable32 ──
    const k = Math.max(0.14, Math.min(1, (d - 6) / 34)) * kEl * (d < 30 ? Math.min(1, kf) : kf);   // ── recovered (16–26c) ── (near, a high level no brighter)
    // ── /light28 ──
    if (Math.abs(k - fireK.near) > 0.01) { fireK.near = k; fireSync(); }
  }
  // ── /fable27 ──
  function update(dt) {
    T += dt; fireNear();   // ── fable27 ── ── /fable27 ──
    // ── recovered (16–26c) ── the great fire follows the day: its level (__FIRE33), a flare for 0.7 s when wood lands (__FLARE33, a
    // time), and a low fire (__FIRELOW33 0…1): smaller, dimmer, its smoke heavier and grey
    {
      const kf = Number.isFinite(globalThis.__FIRE33) ? Math.max(0.25, Math.min(1.6, globalThis.__FIRE33)) : 1, ago = Number.isFinite(globalThis.__FLARE33) ? performance.now() - globalThis.__FLARE33 : 1e9, fl = ago >= 0 && ago < 700 ? 1 - ago / 700 : 0;
      fireLv.h = (0.45 + 0.65 * kf) * (1 + 0.5 * fl); fireLv.s = (0.55 + 0.4 * Math.min(1.2, kf)) * (1 + 0.25 * fl); fireLv.a = Math.min(0.9, 0.5 + 0.4 * Math.min(1, kf) + 0.2 * fl);
      fireLv.sm = (0.45 + 0.55 * Math.min(1.4, kf)) * (Number.isFinite(globalThis.__FIRE33) ? 1 + 0.5 * Math.max(0, Math.min(1, (kf - 0.85) / 0.4)) : 1);
      const lo = Number.isFinite(globalThis.__FIRELOW33) ? Math.max(0, Math.min(1, globalThis.__FIRELOW33)) : 0;
      if (lo > 0 || fireLv.lo > 0) { fireLv.h *= 1 - 0.5 * lo; fireLv.s *= 1 - 0.3 * lo; fireLv.a *= 1 - 0.4 * lo; fireLv.sm = fireLv.sm * (1 - lo) + 1.35 * lo; smokeCol.copy(smokeBase).lerp(smokeLow, 0.75 * lo); fireLv.lo = lo; }
    }
    // walkers
    const nW = walkers.count;
    for (let i = 0; i < nW; i++) {
      const w = W[i];
      if (w.kev) {
        w.z += w.dir * w.sp * dt;
        if (w.z < 12) { w.z = 12; w.dir = 1; } if (w.z > 44) { w.z = 44; w.dir = -1; }
        const y = w.z > 42.5 ? 16 : 16 + (42.5 - w.z) / 32 * 9;
        q.setFromAxisAngle(up, w.dir > 0 ? 0 : Math.PI);
        p.set(w.x + lane.dx, y + Math.abs(Math.sin(T * 6 + w.ph)) * 0.12, w.z);   // ── recovered (16–26c) ── (+ lane.dx; 'off': scaled to nothing)
        if (lane.off) { M.compose(p, q, lane.zero); walkers.setMatrixAt(i, M); continue; }
      } else {
        const Z = zones[w.zi], dx = w.tx - w.x, dz = w.tz - w.z, d = Math.hypot(dx, dz);
        if (d < 1) { [w.tx, w.tz] = rect(Z.x0, Z.x1, Z.z0, Z.z1); }
        else { w.x += dx / d * w.sp * dt; w.z += dz / d * w.sp * dt; }
        q.setFromAxisAngle(up, Math.atan2(dx, dz));
        p.set(w.x, w.y + Math.abs(Math.sin(T * 6 + w.ph)) * 0.12, w.z);
      }
      M.compose(p, q, one); walkers.setMatrixAt(i, M);
    }
    walkers.instanceMatrix.needsUpdate = true;
    // doves
    D.forEach((d, i) => {
      d.a += d.w * dt;
      const x = d.cx + Math.cos(d.a) * d.R, z = d.cz + Math.sin(d.a) * d.R;
      q.setFromAxisAngle(up, -d.a + (d.w > 0 ? 0 : Math.PI));
      s3.set(1.4, 0.35 + Math.abs(Math.sin(T * 9 + d.f)) * 1.3, 1.4);
      p.set(x, d.y + Math.sin(T * 0.7 + d.f) * 3, z);
      M.compose(p, q, s3); doves.setMatrixAt(i, M);
    });
    doves.instanceMatrix.needsUpdate = true;
    for (const e of particles) if (e.points.visible && (e.points.parent === scene || nightG.visible)) e.update(dt, T);
    if (festG.visible) { festFl.update(dt, T); if (glow.points.visible) glow.update(dt, T); }   // ── world12 ──
    fireLight.intensity = S.fire ? fireLight.userData.base * LV.fire * (0.85 + 0.15 * Math.sin(T * 13) * Math.sin(T * 7.3)) : 0;
    // the herd, the service layer, blob shadows
    blobs.begin();
    animals.update(dt);
    for (let i = 0; i < updaters.length; i++) updaters[i](dt);
    blobs.end();
    // prostration eases in and out
    uBow.value += (LV.bow - uBow.value) * Math.min(1, dt * 3);
  }
  const updaters = [];
  // levels for world.avodah.fire / smoke (1 = as it burns every day) and the crowd's prostration
  const LV = { fire: 1, smoke: 1, bow: 0 };
  fireLight.userData.base = 120;
  const s3 = new THREE.Vector3();

  // 'complete': the full crowd, priests, Levites, sheep. 'build': the Temple is under construction —
  // no priests or Levites, no sheep, only a few pilgrims once the platform exists (setPilgrims).
  const S = { phase: 'complete', fire: true, pilgrims: true, night: false, menK: 1 };   // ── polish23 ── (menK)
  function apply() {
    const full = S.phase === 'complete';
    people.count = full ? st.length : S.pilgrims ? FEW : 0;
    walkers.count = full ? W.length : S.pilgrims ? WFEW : 0;
    animals.setEnabled(full);
    smoke.points.visible = S.fire && LV.smoke > 0.01; flames[0].points.visible = S.fire && LV.fire > 0.01; flames[1].points.visible = S.fire;
    // (the light stays in the scene with zero intensity: toggling visibility would change the light count and recompile every material)
    flames[2].points.visible = full;
    nightG.visible = S.night && full;
    festSync();   // ── world12 ──
    // While the Temple is being built, lights [0] and [1] are lent to the construction layer at night (stages.js work
    // lights: the site, the builder's lantern); [2] and [3] light only the finished Temple's menorot.
    menLights.forEach((L, i) => {
      L.visible = S.night && (full || i < 2);
      if (full) { L.position.copy(menHome[i]); L.color.set('#FFB35A'); L.distance = 0; L.decay = 2; L.intensity = S.night ? 5200 * S.menK : 0; }   // ── polish23 ── (menK: the Temple day's dark night lets the menorot light the House, not the whole court)
      else if (i > 1) L.intensity = 0;
    });
  }
  function setNight(on, fireBase, smokeHex, menK = 1) {
    S.night = on; S.menK = menK;   // ── polish23 ──
    fireLight.userData.base = fireBase;
    smokeCol.set(smokeHex); smokeBase.copy(smokeCol);   // ── recovered (16–26c) ── (smokeBase)
    fireK.night = on ? 0.1 : 1; fireSync();   // ── fable27 ── (× the near-camera dim) ── /fable27 ──   // 46 additive sprites overlap: at night even a tenth still blooms into a glow, without flooding a close view
    apply();
  }
  const setPhase = (ph) => { S.phase = ph === 'build' ? 'build' : 'complete'; apply(); };
  // the altar fire and the column of smoke burn only once the altar is complete
  const setFire = (on) => {
    const lit = !S.fire && on;
    S.fire = !!on; apply();
    // re-lit: let the column of smoke rise at once instead of starting as a heap at the pyre
    if (lit) for (let k = 0; k < 64; k++) { smoke.update(0.5, T + k * 0.5); for (const f of flames) f.update(0.05, T); }
  };
  const setPilgrims = (on) => { S.pilgrims = !!on; apply(); };
  return {
    update, setNight, setScale, setPhase, setFire, setPilgrims, get phase() { return S.phase; }, get night() { return S.night; },
    animals, blobs,
    // ── recovered (16–26c) ── the kohanim walking on the kevesh step aside by dx amot (a number), or vanish ('off'); 0 → back
    rampLane(v) { lane.off = v === 'off'; lane.dx = Number.isFinite(v) ? v : 0; return lane.off ? 'off' : lane.dx; },
    // ── flow31 ── the shift's open field (WAVE31 FLOW31 (1)): the day's crowd steps out of a rect of the court while a shift runs (scale 0),
    // and back (rect null) — the field east of the altar holds only the shift's own people; the camera behind the kohen never stands in a head ── /flow31 ──
    clearField(r) {
      const z0 = new THREE.Vector3(0, 0, 0); let n = 0;
      st.forEach(([x, y, z, rot], i) => { const inR = r && x > r.x0 && x < r.x1 && z > r.z0 && z < r.z1 && y > (r.y0 == null ? -1e9 : r.y0); q.setFromAxisAngle(up, rot); p.set(x, y, z); M.compose(p, q, inR ? z0 : one); people.setMatrixAt(i, M); if (inR) n++; });
      people.instanceMatrix.needsUpdate = true; return n;
    },
    addUpdater(fn) { if (typeof fn === 'function' && !updaters.includes(fn)) updaters.push(fn); },
    setCamera(c) { animals.setCamera(c); fireK.cam = c; setCam(c); },   // ── fable27 ── ── /fable27 ── ── light28 ── (setCam) ── /light28 ──
    setFireLevel(k) { LV.fire = Math.max(0, Math.min(3, Number(k) || 0)); flames[0].points.visible = S.fire && LV.fire > 0.01; },
    setSmokeLevel(k) { LV.smoke = Math.max(0, Math.min(3, Number(k) || 0)); smoke.points.visible = S.fire && LV.smoke > 0.01; },
    setBow(k) { LV.bow = Math.max(0, Math.min(1, Number(k) || 0)); },
    // ── world12 ── the festival lamps: n hung (0…all), on = lit even by day (the celebration); all lit and the great night
    setFest(n, on) {
      festN = Math.max(0, Math.min(festPos.length, n === true ? festPos.length : n | 0)); festOn = !!on; festSync();
      if (festG.visible) for (let k = 0; k < 24; k++) festFl.update(0.05, T + k * 0.05);   // (lit at once, not from nothing)
      return festN;
    },
    get fest() { return { n: festN, of: festPos.length, on: festOn, visible: festG.visible }; },
    workLights: menLights.slice(0, 2),       // build phase, at night: positioned and dimmed by stages.js
    fx: [smoke.points, ...flames.map((f) => f.points), nightG, doves, blobs.m, festG],   // (world12: + the festival lamps)
  };
}
