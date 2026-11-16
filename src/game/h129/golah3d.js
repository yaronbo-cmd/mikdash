/* ── build 129 ── h129/golah3d.js — the Golah's water look sample's stage (brief §3): the Golah chamber without its roof on the Azarah's
 * floor, the well and its shaft down to the water, the wheel on its timber frame with the two buckets and the wet rope, the trough by the
 * well, the channel cut in the floor out through the door and along the court with its sluice stones (the first lowered, the second
 * raised) and the three troughs sunk in the court's floor; round it what the built world has there (the south wall, two gate houses,
 * the House's south face and the Ulam), under one golden light. The water itself is h129/water.js.
 *
 * Its own THREE.Scene drawn by the game's renderer (as stage 06's sea sample): nothing of the Mount is touched. Every place is the
 * book's (BOOK.s07.golah, .around, .cam). The static stone is merged into one mesh per material; the shadows are drawn once.
 *   const G = createGolah3d({ renderer });   G.set(F);   G.view(eye, aim);   G.update(t, dt);   G.render();   G.dbg()
 *   F (a frame of the look's script): { full: { x, y, z, tilt, fill, swing }, empty: { x, y, z, swing }, wheel, head, front, trough,
 *   pour, threads: [...], drips: [[x, y, z, s]...], wells: [[x, z, t0, amp]...], spots, light }
 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { BOOK } from '../world/grid.js';
import { texAshlar, texPaving, texWood } from '../../tex.js';
import { createWater } from './water.js';
import { GOLAH, H129 } from './model.js';
import { createActors } from '../../actors.js';

const S7 = BOOK.s07, GL = S7.golah, AR = S7.around, F0 = GL.floor, DEG = Math.PI / 180;
// sizes of the scene (no places): the sky's radius, the trench's depth, the shaft's water below the floor, the bucket
const SKY_R = 420, FOV = 50, SHADOW = 2048, FOG = { near: 160, far: 700 }, SKY_SEG = { w: 32, h: 16 }, RING_SEG = 36, TRENCH = 0.3, BUCKET = { r0: 0.4, r1: 0.5, h: 0.8, bail: 0.55 };
export const DEPTH = GL.depth[0];
const GOLAH_RUN = GOLAH.RUN;
const CUT_H = 2.2;
export const LINE_D = 0.34;   // (play: the mason's line in each trough, its measure, this far under the floor; above it the water climbs to the rim)   // (the cut-away walls' height over the floor)
const MOUTH_CUT = { margin: 0.02, seg: 40 };   // (world: the mask over the well's mouth — a hair wider than the shaft, its circle's segments)
const RINGS_N = 10, SEG ={ well: [RING_SEG + 20, RINGS_N], head: [28, 16], basin: [RING_SEG, RINGS_N * 2] };   // (the water planes' subdivisions: they heave)

/* ───────── geometry helpers: boxes and plates with world-planar UVs (the world's tiling) and a vertex colour ───────── */
function planarUV(g, tile) {
  const P = g.attributes.position, N = g.attributes.normal, uv = new Float32Array(P.count * 2);
  for (let i = 0; i < P.count; i++) {
    const x = P.getX(i), y = P.getY(i), z = P.getZ(i), nx = Math.abs(N.getX(i)), ny = Math.abs(N.getY(i));
    const [u, v] = ny > 0.5 ? [x, z] : nx > 0.5 ? [z, y] : [x, y];
    uv[i * 2] = u / tile; uv[i * 2 + 1] = v / tile;
  }
  g.setAttribute('uv', new THREE.BufferAttribute(uv, 2)); return g;
}
function tint(g, c) {
  const col = new THREE.Color(c), n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = col.r; a[i * 3 + 1] = col.g; a[i * 3 + 2] = col.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3)); return g;
}
const clean = (g) => { g = g.index ? g.toNonIndexed() : g; for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'uv', 'color'].includes(k)) g.deleteAttribute(k); return g; };
function box(x0, y0, z0, x1, y1, z1, tile = 24, c = '#ffffff') {
  const g = new THREE.BoxGeometry(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)); g.translate((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  return clean(tint(planarUV(g, tile), c));
}
/** a flat floor from a polygon [(x, z)...] with holes, at height y, its face up */
function plate(outer, holes, y, tile = 24, c = '#ffffff') {
  const sh = new THREE.Shape(outer.map(([x, z]) => new THREE.Vector2(x, -z)));
  for (const h of holes || []) sh.holes.push(new THREE.Path(h.map(([x, z]) => new THREE.Vector2(x, -z))));
  const g = new THREE.ShapeGeometry(sh, 24); g.rotateX(-Math.PI / 2); g.translate(0, y, 0);
  return clean(tint(planarUV(g, tile), c));
}
/** a vertical face from (x0, z0) to (x1, z1), y from a to b (both sides drawn by its material) */
function face(x0, z0, x1, z1, a, b, tile = 24, c = '#ffffff') {
  const g = new THREE.BufferGeometry(), L = Math.hypot(x1 - x0, z1 - z0), nx = (z1 - z0) / L, nz = -(x1 - x0) / L;
  g.setAttribute('position', new THREE.Float32BufferAttribute([x0, a, z0, x1, a, z1, x1, b, z1, x0, a, z0, x1, b, z1, x0, b, z0], 3));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(Array(6).fill([nx, 0, nz]).flat(), 3));
  return clean(tint(planarUV(g, tile), c));
}
const circle = (cx, cz, r, n = 28) => Array.from({ length: n }, (_, i) => { const a = (-i / n) * Math.PI * 2; return [cx + r * Math.cos(a), cz + r * Math.sin(a)]; });

export function createGolah3d({ renderer, play = false, world = false, camera: cam0 = null }) {
  // (build 129 G5, world: the station's things only — a Group the built world's scene holds at their book places: no sky, no light,
  //  no fog, no walls or court of its own; the trench and the basins cut into the world's floor by a depth mask)
  const scene = world ? new THREE.Group() : new THREE.Scene(), own = [], keep = (o) => { own.push(o); return o; };
  if (world) scene.name = 'h129-golah';
  const camera = cam0 || new THREE.PerspectiveCamera(FOV, 16 / 10, 0.1, SKY_R * 1.5);
  const W = createWater(THREE), U = W.U;

  /* ── the light: one golden light (light B's colour, as stage 06's sea) and the sky's fill; the shadows drawn once ── */
  const SUN = S7.cam.sun, sunDir = new THREE.Vector3(Math.cos(SUN.el * DEG) * Math.cos(SUN.az * DEG), Math.sin(SUN.el * DEG), Math.cos(SUN.el * DEG) * Math.sin(SUN.az * DEG)).normalize();
  const sun = new THREE.DirectionalLight('#FFBA6E', 3.0), hemi = new THREE.HemisphereLight('#A9BBDA', '#8A7660', 1.25);
  const mid = new THREE.Vector3((AR.gateHouses[0][0] + AR.gateHouses[1][2]) / 2, F0, (AR.house.z + AR.southWall.z[1]) / 2);
  sun.target.position.copy(mid); sun.position.copy(mid).addScaledVector(sunDir, 260); sun.castShadow = true;
  { const c = sun.shadow.camera, h = (AR.gateHouses[1][2] - AR.gateHouses[0][0]) / 2 + 6; c.left = -h; c.right = h; c.top = h; c.bottom = -h; c.near = 60; c.far = 520; sun.shadow.mapSize.set(SHADOW, SHADOW); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; }
  if (!world) scene.add(sun, sun.target, hemi);
  U.sun.value.copy(sunDir); U.sunCol.value.set('#FFBA6E'); U.sky.value.set('#86A8D8'); U.skyLo.value.set('#F4C99A');
  if (!world) scene.fog = new THREE.Fog('#EBCCA4', FOG.near, FOG.far);

  /* ── the sky: a gradient, the sun's glow (one mesh) ── */
  const skyM = keep(new THREE.ShaderMaterial({
    side: THREE.BackSide, depthWrite: false, fog: false,
    uniforms: { uTop: { value: new THREE.Color('#4E78B6') }, uHor: { value: new THREE.Color('#F0C690') }, uLow: { value: new THREE.Color('#D9B88E') }, uSun: { value: sunDir }, uSunC: U.sunCol },
    vertexShader: 'varying vec3 vD; void main(){ vD = normalize(position); vec4 p = modelViewMatrix * vec4(position, 1.0); gl_Position = projectionMatrix * p; gl_Position.z = gl_Position.w; }',
    fragmentShader: `uniform vec3 uTop, uHor, uLow, uSun, uSunC; varying vec3 vD;
      void main(){ vec3 d = normalize(vD); float h = d.y;
        vec3 c = h > 0.0 ? mix(uHor, uTop, pow(clamp(h, 0.0, 1.0), 0.5)) : mix(uHor, uLow, clamp(-h * 6.0, 0.0, 1.0));
        float sd = max(dot(d, normalize(uSun)), 0.0); c += uSunC * (pow(sd, 8.0) * 0.18 + pow(sd, 200.0) * 0.9);
        gl_FragColor = vec4(c, 1.0);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
  }));
  const sky = new THREE.Mesh(keep(new THREE.SphereGeometry(SKY_R, SKY_SEG.w, SKY_SEG.h)), skyM); sky.frustumCulled = false; sky.renderOrder = -1; sky.name = 'h129-sky'; if (!world) scene.add(sky);

  /* ── materials: the world's ashlar, paving and wood (its own procedural textures, tex.js), vertex colours for the shaft's dark ── */
  const TA = texAshlar(7), TP = texPaving(17), TW = texWood(61);
  for (const t of [TA.map, TA.normalMap, TP.map, TP.normalMap, TW.map]) { keep(t); t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); }
  const stoneM = keep(new THREE.MeshStandardMaterial({ map: TA.map, normalMap: TA.normalMap, normalScale: new THREE.Vector2(1.1, 1.1), roughness: 0.86, vertexColors: true }));
  const paveM = keep(new THREE.MeshStandardMaterial({ map: TP.map, normalMap: TP.normalMap, normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.9, vertexColors: true, side: THREE.DoubleSide }));
  const woodM = keep(new THREE.MeshStandardMaterial({ map: TW.map, color: '#C9A27A', roughness: 0.74, vertexColors: true }));
  const ropeM = keep(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.62, vertexColors: true }));
  // (the wet rope glistens: its roughness falls where it is wet, so the low sun catches it)
  ropeM.onBeforeCompile = (sh) => {
    sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nattribute float aWet; varying float vWet;').replace('#include <begin_vertex>', '#include <begin_vertex>\nvWet = aWet;');
    sh.fragmentShader = sh.fragmentShader.replace('#include <common>', '#include <common>\nvarying float vWet;').replace('#include <roughnessmap_fragment>', '#include <roughnessmap_fragment>\nroughnessFactor = mix(roughnessFactor, 0.16, vWet);');
  };

  /* ── the stone: the room's walls (no roof; the door to the Azarah where the channel goes out), the south wall beside it, the gate
   *    houses, the House's face and the Ulam, the well's rim and shaft, the trough by the well, the sluice stones ── */
  const [rx0, rz0, rx1, rz1] = GL.room, T1 = GL.wallT, TOP = GL.top, [dx, dz] = GL.door, dw = GL.doorW / 2, dh = GL.doorH;
  const SW = AR.southWall, chel = AR.chel;
  const stone = [];
  // (a cut-away for the sample: the west wall, toward the low sun, and the north wall, toward the court and the channel, are cut down to
  //  a low course, so the golden light reaches the well and the eye can pass over; the east and south walls stand to their height; dh
  //  the door's height is not drawn)
  const CUT = F0 + CUT_H; void dh;
  if (!world) {
  stone.push(box(rx0, chel, rz0, rx0 + T1, CUT, rz1), box(rx1 - T1, chel, rz0, rx1, TOP, rz1), box(rx0 + T1, chel, rz1 - T1, rx1 - T1, TOP, rz1));   // west (cut), east, south
  stone.push(box(rx0 + T1, F0 - 1, rz0, dx - dw, CUT, rz0 + T1), box(dx + dw, F0 - 1, rz0, rx1 - T1, CUT, rz0 + T1));   // north (cut), the door's gap
  // (the cut's top: a coping course, so the cut reads as a cut)
  stone.push(box(rx0 - 0.06, CUT, rz0 - 0.06, rx0 + T1 + 0.06, CUT + 0.16, rz1, 6, '#D6C9B2'), box(rx0 + T1, CUT, rz0 - 0.06, dx - dw, CUT + 0.16, rz0 + T1 + 0.06, 6, '#D6C9B2'), box(dx + dw, CUT, rz0 - 0.06, rx1 - T1, CUT + 0.16, rz0 + T1 + 0.06, 6, '#D6C9B2'));
  // the south wall of the Azarah each side of the room (cut inside it), as far as the gate houses
  stone.push(box(AR.gateHouses[0][2], SW.y[0], SW.z[0], rx0, SW.y[1], SW.z[1]), box(rx1, SW.y[0], SW.z[0], AR.gateHouses[1][0], SW.y[1], SW.z[1]));
  for (const [a, b, c, d] of AR.gateHouses) stone.push(box(a, chel, b, c, AR.gateTop, d));
  stone.push(box(AR.house.x[0], F0, AR.house.z - 4, AR.house.x[1], AR.house.top, AR.house.z, 30, '#F1E6D2'));
  { const [a, b, c, d] = AR.ulam; stone.push(box(a, F0, b, c, AR.house.top, d, 30, '#F1E6D2')); }
  }   // (world: the room's walls, the south wall, the gate houses and the House are the world's own)
  // the well: its rim of twelve stones, its shaft down to the water and below (darker as it goes down)
  const [wx, wz] = GL.well, R = GL.shaftR;
  // (play: the rim is a mesh of its own, rebuilt when a stone of it breaks — golah.rim)
  const rimStone = (i, broken) => {
    const a = (i / 12) * Math.PI * 2, a1 = ((i + 1) / 12) * Math.PI * 2, r0 = R, r1 = R + GL.rimT, h = broken ? GL.rimH * 0.45 : GL.rimH, g = new THREE.BufferGeometry();
    const P = (r, aa, y) => [wx + r * Math.cos(aa), F0 + y, wz + r * Math.sin(aa)], gap = 0.012;
    const A0 = a + gap, A1 = a1 - gap, q = [P(r0, A0, 0), P(r1, A0, 0), P(r1, A1, 0), P(r0, A1, 0), P(r0, A0, h), P(r1, A0, h), P(r1, A1, h), P(r0, A1, h)];
    const tri = [[4, 5, 6], [4, 6, 7], [1, 2, 6], [1, 6, 5], [0, 4, 7], [0, 7, 3], [0, 1, 5], [0, 5, 4], [3, 7, 6], [3, 6, 2]], pos = [];
    for (const t of tri) for (const k of [t[0], t[2], t[1]]) pos.push(...q[k]);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    return clean(tint(planarUV(g, 6), broken ? '#BFB09A' : i % 3 ? '#E8DDCC' : '#D9CDBA'));
  };
  if (!play) for (let i = 0; i < 12; i++) stone.push(rimStone(i, false));
  {
    const SH = play ? Math.max(...GL.depth) + 2 : DEPTH + 2;   // (play: down to the deepest level's water)
    const g = new THREE.CylinderGeometry(R, R, SH, 28, play ? 16 : 6, true); g.translate(wx, F0 - SH / 2, wz);
    const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), 0, -n.getZ(i));
    const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = t; }
    const P = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < P.count; i++) uv.setXY(i, uv.getX(i) * (2 * Math.PI * R) / 8, P.getY(i) / 8);
    const c = new Float32Array(P.count * 3); for (let i = 0; i < P.count; i++) { const k = 0.9 * Math.exp(-(F0 - P.getY(i)) / 7) + 0.16; c[i * 3] = k; c[i * 3 + 1] = k * 0.96; c[i * 3 + 2] = k * 0.9; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); stone.push(clean(g));
  }
  // the trough by the well: a stone box, its outlet at the foot of its north side into the channel
  const [hx, hz] = GL.head, [hw, hd, hh] = GL.headSize, th = 0.15, out = 0.22, HB = F0 + th;
  stone.push(box(hx - hw / 2, F0, hz - hd / 2, hx + hw / 2, HB, hz + hd / 2, 6, '#E2D6C2'));
  stone.push(box(hx - hw / 2, F0, hz + hd / 2 - th, hx + hw / 2, F0 + hh, hz + hd / 2, 6, '#E2D6C2'), box(hx - hw / 2, F0, hz - hd / 2 + th, hx - hw / 2 + th, F0 + hh, hz + hd / 2 - th, 6, '#E2D6C2'), box(hx + hw / 2 - th, F0, hz - hd / 2 + th, hx + hw / 2, F0 + hh, hz + hd / 2 - th, 6, '#E2D6C2'));
  stone.push(box(hx - hw / 2, F0, hz - hd / 2, hx - out, F0 + hh, hz - hd / 2 + th, 6, '#E2D6C2'), box(hx + out, F0, hz - hd / 2, hx + hw / 2, F0 + hh, hz - hd / 2 + th, 6, '#E2D6C2'), box(hx - out, HB + 0.18, hz - hd / 2, hx + out, F0 + hh, hz - hd / 2 + th, 6, '#E2D6C2'));
  // the sluice stones in their guide posts: the first (A) lowered across its spur's mouth, the second (B) raised, the third (C) lowered
  const slabs = {}, cw = GL.channel.w, sl = (k, up) => {
    const [x, z] = GL.sluice[k], zz = z - cw / 2 - 0.1, b = up ? F0 + 0.55 : F0 - TRENCH;
    if (play) slabs[k] = box(x - cw / 2 - 0.12, 0, zz - 0.08, x + cw / 2 + 0.12, 0.95, zz + 0.08, 4, '#D8CCB6');   // (play: each stone its own mesh, it rises and falls)
    else stone.push(box(x - cw / 2 - 0.12, b, zz - 0.08, x + cw / 2 + 0.12, b + 0.95, zz + 0.08, 4, '#D8CCB6'));
    for (const s of [-1, 1]) stone.push(box(x + s * (cw / 2 + 0.17) - 0.07, F0 - TRENCH, zz - 0.13, x + s * (cw / 2 + 0.17) + 0.07, F0 + 1.6, zz + 0.13, 4, '#CDBFA6'));
  };
  sl('A', false); sl('B', true); sl('C', false);
  const stoneMesh = new THREE.Mesh(keep(mergeGeometries(stone)), stoneM); stoneMesh.castShadow = true; stoneMesh.receiveShadow = true; stoneMesh.name = 'h129-stone'; scene.add(stoneMesh);
  // (play) the sluice stones, each a mesh that rises (open) and falls (closed); the rim, its broken stones lower and darker
  const sluiceM = {};
  for (const k of Object.keys(slabs)) { const m = new THREE.Mesh(keep(slabs[k]), stoneM); m.castShadow = false; m.receiveShadow = true; m.name = 'h129-sluice' + k; scene.add(m); sluiceM[k] = m; }
  let rimMesh = null;
  function rimBuild(broken = []) {
    if (!play) return;
    if (rimMesh) { scene.remove(rimMesh); rimMesh.geometry.dispose(); }
    const parts = []; for (let i = 0; i < 12; i++) parts.push(rimStone(i, broken.includes(i)));
    // a broken stone's pieces lie on the floor outside the rim
    for (const i of broken) { const a = ((i + 0.5) / 12) * Math.PI * 2, r = R + GL.rimT + 0.45, x = wx + r * Math.cos(a), z = wz + r * Math.sin(a); parts.push(box(x - 0.2, F0, z - 0.16, x + 0.18, F0 + 0.26, z + 0.17, 4, '#CFC2AC'), box(x + 0.25, F0, z + 0.1, x + 0.47, F0 + 0.15, z + 0.3, 4, '#C6B8A0')); }
    rimMesh = new THREE.Mesh(mergeGeometries(parts), stoneM); rimMesh.castShadow = true; rimMesh.receiveShadow = true; rimMesh.name = 'h129-rim'; scene.add(rimMesh);
  }
  rimBuild();

  /* ── the floors: the Azarah's (the channel and the troughs cut in it), the room's (the well's mouth open), the door's sill; the
   *    trench's sides and bottom and the troughs' basins, all in the paving ── */
  const h = cw / 2, [m0, m1, m2] = GL.channel.main, TS = GL.troughSize, bx = TS[0] / 2, bz = TS[1] / 2, TD = TS[2];
  const basin = (k) => { const [x, z] = GL.troughs[k]; return [x - bx, z - bz, x + bx, z + bz]; };
  const spurs = GL.channel.spurs.map(([x]) => x);
  // the notch the channel cuts into the Azarah's floor from the door's sill: down the first leg to the bend, east along the second, the
  // spurs into the basins (one outline: the trench and the three basins together)
  const notch = [];
  {
    const eastX = m2[0], zN = m1[1] - h, zS = m1[1] + h;
    notch.push([m0[0] - h, rz0]);
    const sp = spurs.slice().sort((a, b) => a - b), lastI = sp.length - 1;
    sp.forEach((x, i) => {
      const k = Object.keys(GL.troughs).find((q) => GL.troughs[q][0] === x), [a, b, c, d] = basin(k);
      if (i === 0) notch.push([x - h, d]); else notch.push([x - h, zN], [x - h, d]);
      notch.push([a, d], [a, b], [c, b], [c, d], [x + h, d]);
      if (i < lastI) notch.push([x + h, zN]); else notch.push([x + h, zS]);
    });
    void eastX;
    notch.push([m1[0] + h, zS], [m1[0] + h, rz0]);
  }
  const AZ = { x0: AR.gateHouses[0][0] + 2, x1: AR.gateHouses[1][2] + 2, z0: AR.house.z, z1: SW.z[0] };
  const floors = [];
  const ho = hz - hd / 2;
  if (!world) {
  floors.push(plate([[AZ.x0, AZ.z0], [AZ.x1, AZ.z0], [AZ.x1, rz0], ...notch.slice().reverse(), [AZ.x0, rz0]], null, F0));
  floors.push(plate([[AZ.x0, rz0], [rx0, rz0], [rx0, AZ.z1], [AZ.x0, AZ.z1]], null, F0), plate([[rx1, rz0], [AZ.x1, rz0], [AZ.x1, AZ.z1], [rx1, AZ.z1]], null, F0));
  floors.push(plate([[dx - dw, rz0], [m0[0] - h, rz0], [m0[0] - h, rz0 + T1], [dx - dw, rz0 + T1]], null, F0), plate([[m0[0] + h, rz0], [dx + dw, rz0], [dx + dw, rz0 + T1], [m0[0] + h, rz0 + T1]], null, F0));
  // the room: its floor round the well's mouth; the channel's first short leg from the trough's outlet to the door
  floors.push(plate([[rx0 + T1, rz0 + T1], [m0[0] - h, rz0 + T1], [m0[0] - h, ho], [m0[0] + h, ho], [m0[0] + h, rz0 + T1], [rx1 - T1, rz0 + T1], [rx1 - T1, rz1 - T1], [rx0 + T1, rz1 - T1]], [circle(wx, wz, R)], F0));
  }
  // the trench: its bottom and its sides (the outline's edges, down TRENCH); the basins: their bottoms and walls (down TD)
  const tb = F0 - TRENCH;
  floors.push(plate([[m0[0] - h, ho], [m0[0] + h, ho], [m0[0] + h, m1[1] + h], [m0[0] - h, m1[1] + h]], null, tb));
  floors.push(plate([[m1[0] - h, m1[1] - h], [m2[0] + h, m1[1] - h], [m2[0] + h, m1[1] + h], [m1[0] - h, m1[1] + h]], null, tb));
  for (const x of spurs) floors.push(plate([[x - h, basin('A')[3]], [x + h, basin('A')[3]], [x + h, m1[1]], [x - h, m1[1]]], null, tb));
  const inBasin = (x, z) => Object.keys(GL.troughs).some((k) => { const [a, b, c, d] = basin(k); return x >= a - 1e-6 && x <= c + 1e-6 && z >= b - 1e-6 && z <= d + 1e-6; });
  const ring = [[m0[0] - h, ho], ...notch.slice(1, -1), [m0[0] + h, ho]];
  for (let i = 0; i + 1 < ring.length; i++) {
    const [x0, z0] = ring[i], [x1, z1] = ring[i + 1], deep = inBasin((x0 + x1) / 2, (z0 + z1) / 2) && !(Math.abs(z0 - z1) < 1e-6 && Math.abs(z0 - basin('A')[3]) < 1e-6 && Math.abs(x1 - x0) <= cw + 1e-6);
    floors.push(face(x0, z0, x1, z1, deep ? F0 - TD : tb, F0, 6, '#B8AA92'));
  }
  floors.push(face(m0[0] - h, ho, m0[0] + h, ho, tb, F0, 6, '#B8AA92'));
  for (const k of Object.keys(GL.troughs)) {
    const [a, b, c, d] = basin(k); floors.push(plate([[a, b], [c, b], [c, d], [a, d]], null, F0 - TD, 6, '#A79A82'));
    const x = GL.troughs[k][0]; floors.push(face(x - h, d, x + h, d, F0 - TD, tb, 6, '#B8AA92'));   // (the drop from the spur's bed into the basin)
  }
  const floorMesh = new THREE.Mesh(keep(mergeGeometries(floors)), paveM); floorMesh.receiveShadow = !world; floorMesh.castShadow = !world; floorMesh.name = 'h129-floor'; scene.add(floorMesh);
  // (world) the cut in the world's floor: the trench and the basins are drawn first (CAV), then their opening writes the depth of a
  // floor a hair above the world's (MASK: no colour) — the world's own floor, drawn after it, fails there and the cut shows. The room's
  // square hole round the mouth (temple.js h129Golah) closed by a plate to the circle of the shaft.
  const CAV = -7.5, MASK = -5;   // (after the world's sky dome, -10, and its stars, -9: they are drawn without a depth test)
  if (world) {
    floorMesh.renderOrder = CAV;
    const ring0 = [[m0[0] - h, ho], ...notch.slice(1, -1), [m0[0] + h, ho]];
    const maskM = keep(new THREE.MeshBasicMaterial({ colorWrite: false, side: THREE.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 }));
    const mask = new THREE.Mesh(keep(plate(ring0, null, F0)), maskM); mask.renderOrder = MASK; mask.name = 'h129-cut'; scene.add(mask);
    // (the well's mouth the same: the world's room floor is whole over it — the shaft, its water, the buckets and the rope are drawn
    //  before the mask)
    const mouth = new THREE.Mesh(keep(plate(circle(wx, wz, R + MOUTH_CUT.margin, MOUTH_CUT.seg), null, F0)), maskM); mouth.renderOrder = MASK; mouth.name = 'h129-mouth-cut'; scene.add(mouth);
  }
  /** (world) a transparent thing in the cut: drawn with the cut, before the mask (the opaque list, its blending kept) */
  const inCut = (m, k = 0) => {
    if (!world || !m) return m;
    const M = m.material; M.transparent = false; M.blending = THREE.CustomBlending; M.blendSrc = THREE.SrcAlphaFactor; M.blendDst = THREE.OneMinusSrcAlphaFactor; M.blendEquation = THREE.AddEquation;
    m.renderOrder = CAV + 0.5 + 0.2 * k; return m;
  };

  /* ── the timber: the frame over the well (two posts, braces, the axle) and the wheel (its own mesh: it turns) ── */
  const WH = GL.wheel, ay = F0 + WH.axle, [ax, az] = WH.at, wood = [];
  for (const s of [-1, 1]) {
    const px = ax + s * WH.post;
    wood.push(box(px - 0.2, F0, az - 0.2, px + 0.2, ay + 0.75, az + 0.2, 4, '#E6CFAE'));
    for (const t of [-1, 1]) { const g = new THREE.BoxGeometry(0.18, 3.4, 0.18); g.rotateX(t * 0.55); g.translate(px, F0 + 1.45, az + t * 0.86); wood.push(clean(tint(planarUV(g, 4), '#D9BE98'))); }
  }
  wood.push(box(ax - WH.post - 0.25, ay + 0.75, az - 0.25, ax + WH.post + 0.25, ay + 1.1, az + 0.25, 4, '#E6CFAE'));
  { const g = new THREE.CylinderGeometry(0.11, 0.11, WH.post * 2 + 0.3, 10); g.rotateZ(Math.PI / 2); g.translate(ax, ay, az); wood.push(clean(tint(planarUV(g, 4), '#5A4A3A'))); }
  const frame = new THREE.Mesh(keep(mergeGeometries(wood)), woodM); frame.castShadow = true; frame.receiveShadow = true; frame.name = 'h129-frame'; scene.add(frame);
  const wheelG = [];
  { const g = new THREE.TorusGeometry(WH.R, 0.09, 8, RING_SEG); g.rotateY(Math.PI / 2); wheelG.push(clean(tint(planarUV(g, 2), '#D2B48C'))); }
  for (const s of [-1, 1]) { const g = new THREE.TorusGeometry(WH.R + 0.06, 0.05, 6, RING_SEG); g.rotateY(Math.PI / 2); g.translate(s * 0.1, 0, 0); wheelG.push(clean(tint(planarUV(g, 2), '#B89870'))); }
  for (let i = 0; i < 6; i++) { const g = new THREE.BoxGeometry(0.08, WH.R * 2, 0.1); g.rotateX((i / 6) * Math.PI); wheelG.push(clean(tint(planarUV(g, 2), '#C8A57C'))); }
  { const g = new THREE.CylinderGeometry(0.2, 0.2, 0.32, 12); g.rotateZ(Math.PI / 2); wheelG.push(clean(tint(planarUV(g, 2), '#7A6450'))); }
  const wheel = new THREE.Mesh(keep(mergeGeometries(wheelG)), woodM); wheel.position.set(ax, ay, az); wheel.castShadow = true; wheel.name = 'h129-wheel'; scene.add(wheel);

  /* ── the two buckets (wood and iron hoops, the bail), each its own mesh; the full one's water ── */
  function bucketGeo() {
    const B = BUCKET, prof = [[0, 0.02], [B.r0, 0.02], [B.r0 + 0.02, 0], [B.r1, B.h], [B.r1 - 0.06, B.h], [B.r0 - 0.04, 0.08], [0, 0.08]].map(([r, y]) => new THREE.Vector2(r, y));
    const parts = [clean(tint(planarUV(new THREE.LatheGeometry(prof, 16), 1.2), '#E4C8A0'))];
    for (const [y, r] of [[0.14, B.r0 + 0.035], [0.66, B.r1 - 0.01]]) { const g = new THREE.TorusGeometry(r, 0.035, 5, 20); g.rotateX(Math.PI / 2); g.translate(0, y, 0); parts.push(clean(tint(planarUV(g, 1), '#3A332C'))); }
    { const g = new THREE.TorusGeometry(B.r1 + 0.02, 0.03, 5, 16, Math.PI); g.translate(0, B.h, 0); parts.push(clean(tint(planarUV(g, 1), '#3A332C'))); }
    const g = mergeGeometries(parts); g.translate(0, -(B.h + B.r1 + 0.02), 0); return keep(g);   // (the origin at the bail's top, where the rope is tied)
  }
  const bg = bucketGeo();
  const buckets = [0, 1].map((i) => { const m = new THREE.Mesh(bg, woodM); m.name = 'h129-bucket' + i; scene.add(m); return m; });
  const bWater = new THREE.Mesh(keep(new THREE.CircleGeometry(BUCKET.r1 - 0.07, 20)), W.surface({ deep: '#1A4450', bed: '#7A6446', alpha: 0.96, chop: 1.4 }));
  bWater.rotation.x = -Math.PI / 2; bWater.renderOrder = 5; buckets[0].add(bWater);

  /* ── the rope: one tube over the wheel from bail to bail, rebuilt each frame (its lower parts dark with the water they were in) ── */
  const RN = 44, RS = 6, ropeG = keep(new THREE.BufferGeometry());
  {
    const pos = new Float32Array(RN * RS * 3), nor = new Float32Array(RN * RS * 3), col = new Float32Array(RN * RS * 3), idx = [];
    for (let i = 0; i + 1 < RN; i++) for (let j = 0; j < RS; j++) { const a = i * RS + j, b = i * RS + ((j + 1) % RS), c = a + RS, d = b + RS; idx.push(a, c, b, b, c, d); }
    ropeG.setAttribute('position', new THREE.BufferAttribute(pos, 3)); ropeG.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); ropeG.setAttribute('color', new THREE.BufferAttribute(col, 3)); ropeG.setAttribute('aWet', new THREE.BufferAttribute(new Float32Array(RN * RS), 1)); ropeG.setIndex(idx);
  }
  const rope = new THREE.Mesh(ropeG, ropeM); rope.frustumCulled = false; rope.name = 'h129-rope'; scene.add(rope);
  const _p = new THREE.Vector3(), _t = new THREE.Vector3(), _n = new THREE.Vector3(), _b = new THREE.Vector3(), _up = new THREE.Vector3(1, 0, 0);
  function ropeTo(fullBail, emptyBail, wet) {
    // the path: the full bucket's bail up to the wheel's north side, over its top, down its south side to the empty bucket's bail
    const pts = [], nA = 10, nS = 14;
    const north = new THREE.Vector3(ax, ay, az - WH.R - 0.04), south = new THREE.Vector3(ax, ay, az + WH.R + 0.04);
    // (where the rope leaves the wheel: the tangent toward the bucket, near enough the side for a bucket that hangs under it)
    const leave = (bail, side) => { const dy = bail.y - ay, dz2 = bail.z - az, L = Math.hypot(dy, dz2), r = WH.R + 0.04, ang = Math.atan2(dy, dz2) + side * Math.acos(Math.min(1, r / Math.max(r, L))); return [ang, new THREE.Vector3(ax, ay + r * Math.sin(ang), az + r * Math.cos(ang))]; };
    const [aN, pN] = leave(fullBail, -1), [aS, pS] = leave(emptyBail, 1);
    void north; void south;
    for (let i = 0; i <= nS; i++) pts.push(new THREE.Vector3().lerpVectors(fullBail, pN, i / nS));
    let a0 = aN, a1 = aS; while (a1 > a0) a1 -= Math.PI * 2;
    for (let i = 1; i < nA; i++) { const a = a0 + (a1 - a0) * (i / nA), r = WH.R + 0.04; pts.push(new THREE.Vector3(ax, ay + r * Math.sin(a), az + r * Math.cos(a))); }
    for (let i = 0; i <= nS; i++) pts.push(new THREE.Vector3().lerpVectors(pS, emptyBail, i / nS));
    while (pts.length > RN) pts.splice(nS + 1, 1); while (pts.length < RN) pts.splice(nS + 1, 0, pts[nS + 1].clone());
    const P = ropeG.attributes.position.array, N = ropeG.attributes.normal.array, C = ropeG.attributes.color.array, WT = ropeG.attributes.aWet.array;
    let s = 0; const L = []; for (let i = 0; i < RN; i++) { if (i) s += pts[i].distanceTo(pts[i - 1]); L.push(s); }
    for (let i = 0; i < RN; i++) {
      const p = pts[i]; _t.subVectors(pts[Math.min(RN - 1, i + 1)], pts[Math.max(0, i - 1)]).normalize();
      _n.crossVectors(_t, _up); if (_n.lengthSq() < 1e-6) _n.set(0, 1, 0); _n.normalize(); _b.crossVectors(_t, _n);
      // wet: the length that went down the shaft, from each end (a little lighter where it has begun to dry)
      const d = Math.min(L[i], s - L[i]), w = wet * (1 - Math.min(1, Math.max(0, (d - 2.5) / 3.5)));
      const r = 0.045 + 0.006 * w, cr = 0.62 - 0.36 * w, cg = 0.5 - 0.31 * w, cb = 0.36 - 0.24 * w;
      for (let j = 0; j < RS; j++) {
        const a = (j / RS) * Math.PI * 2, cx = Math.cos(a), cy = Math.sin(a), k = (i * RS + j) * 3;
        _p.copy(p).addScaledVector(_n, cx * r).addScaledVector(_b, cy * r);
        P[k] = _p.x; P[k + 1] = _p.y; P[k + 2] = _p.z;
        N[k] = _n.x * cx + _b.x * cy; N[k + 1] = _n.y * cx + _b.y * cy; N[k + 2] = _n.z * cx + _b.z * cy;
        const twist = 0.88 + 0.12 * Math.sin(L[i] * 22 + a * 2); C[k] = cr * twist; C[k + 1] = cg * twist; C[k + 2] = cb * twist; WT[k / 3] = w;
      }
    }
    ropeG.attributes.position.needsUpdate = true; ropeG.attributes.normal.needsUpdate = true; ropeG.attributes.color.needsUpdate = true; ropeG.attributes.aWet.needsUpdate = true;
    ropeG.computeBoundingSphere();
  }

  /* ── the water: the well's (the shaft round it mirrored), the trough by the well's and the basin's (heaving where the stream lands,
   *    their walls and bottoms mirrored and seen through), their water lines; the channel's running water, the wet stone of its floor,
   *    bed and sides; the pour and the fall into the basin (sheets), the dribble off the bucket; the drops in the air; the wet spots ── */
  const wellM = W.surface({ kind: 'well', deep: '#071418', wall: '#D9C6A6', alpha: 0.97, chop: 0.7, heave: 1, glint: 0.8 });
  wellM.uniforms.uBox.value.set(wx, wz, R, R); wellM.uniforms.uRim.value = DEPTH + GL.rimH;
  const wellW = new THREE.Mesh(keep(new THREE.RingGeometry(0, R - 0.01, ...SEG.well)), wellM); wellW.rotation.x = -Math.PI / 2; wellW.position.set(wx, F0 - DEPTH, wz); wellW.renderOrder = 5; wellW.name = 'h129-well-water'; scene.add(wellW);
  const iw = hw - 2 * th, id = hd - 2 * th;
  const headM = W.surface({ kind: 'box', deep: '#163C46', bed: '#B4A282', wall: '#E2D6C2', alpha: 0.95, chop: 0.9, heave: 1 });
  const headW = new THREE.Mesh(keep(new THREE.PlaneGeometry(iw - 0.01, id - 0.01, ...SEG.head)), headM); headW.rotation.x = -Math.PI / 2; headW.renderOrder = 5; scene.add(headW);
  headM.uniforms.uBox.value.set(hx, hz, iw / 2, id / 2);
  const headLine = W.lines(hx - iw / 2, hz - id / 2, hx + iw / 2, hz + id / 2, HB, F0 + hh); scene.add(headLine.mesh);
  const trM = W.surface({ kind: 'box', deep: '#143A46', bed: '#B09E80', wall: '#C9BA9E', alpha: 0.96, chop: 0.6, heave: 1, glint: 1.2 });
  const [tbx, tbz] = GL.troughs.B, trW = new THREE.Mesh(keep(new THREE.PlaneGeometry(TS[0] - 0.02, TS[1] - 0.02, ...SEG.basin)), trM); trW.rotation.x = -Math.PI / 2; trW.renderOrder = 5; scene.add(inCut(trW, 3));
  trM.uniforms.uBox.value.set(tbx, tbz, TS[0] / 2, TS[1] / 2);
  const trLine = W.lines(tbx - bx, tbz - bz, tbx + bx, tbz + bz, F0 - TD, F0); scene.add(inCut(trLine.mesh, 1));
  // the way the water runs in the sample: from the outlet, out by the door to the bend, where the lowered stone (A) turns it east, on to
  // the raised one (B), where it heaps and turns into its spur, and over the lip into the basin
  const wayPts = play ? [[m0[0], ho], [m1[0], m1[1]], [m2[0], m1[1]]] : [[m0[0], ho], [m1[0], m1[1]], [GL.sluice.B[0], m1[1]], [GL.sluice.B[0], basin('B')[3] + 0.02]];   // (play: the main line, to its east end; the spurs are their own)
  const legA = ho - m1[1], legB = legA + Math.abs(GL.sluice.B[0] - m1[0]);
  const heap = (u) => (play ? 0 : 0.05 * (Math.exp(-(((u - legA) / 0.5) ** 2)) + Math.exp(-(((u - legB) / 0.5) ** 2))));
  const WL = 0.2;   // (the water's height over the trench's bed)
  const run = W.flow(wayPts, { w: cw - 0.01, y: (p, i, u) => tb + WL + heap(u), speed: GOLAH_RUN }); scene.add(inCut(run.mesh, 2));
  run.mat.uniforms.uPile.value.set(legA, legB, 0, 0);
  const wet = W.wet(wayPts, { w: cw + 0.9, y: () => F0 + 0.006, hole: cw / (cw + 0.9), alpha: 0.55 }); scene.add(wet.mesh);
  const wetBed = W.wet(wayPts, { w: cw, y: () => tb + 0.004, alpha: 0.6 }); scene.add(inCut(wetBed.mesh, 0));
  const wetSides = W.wetWalls(wayPts, { w: cw, y0: tb, h: TRENCH, line: WL }); scene.add(inCut(wetSides.mesh, 0));
  const pour = W.sheet({ nt: 40, ns: 12, brk: 0.5 }); pour.mesh.name = 'h129-pour'; scene.add(pour.mesh);
  const inflow = W.sheet({ nt: 16, ns: 8, brk: 0.7 }); scene.add(inflow.mesh); if (play) inflow.mesh.visible = false;
  const thr = W.threads(1); scene.add(thr.mesh);
  const drops = W.drops(220); scene.add(drops.mesh);
  const spots = W.spots(200); scene.add(spots.mesh);
  const P = play ? playParts() : null;
  // (world) what goes down the well's mouth is drawn with the cut, before the mask
  if (world) {
    stoneMesh.renderOrder = CAV; rope.renderOrder = CAV + 0.05; for (const b of buckets) b.renderOrder = CAV + 0.05;
    inCut(wellW, 3); inCut(bWater, 3); inCut(drops.mesh, 4); inCut(thr.mesh, 4);
  }

  /* ── play (golah.js): the three troughs' water, each spur's running water and wet bed, each basin's inflow; the plank over the
   *    mouth the crew stand on, the crew and the kohen (their own figures in this scene), the puddles and stains a flood leaves, the
   *    crack of a bucket ── */
  function playParts() {
    const Q = { tr: {}, spur: {}, inflow: {}, puddle: {}, crack: [null, null] };
    for (const k of Object.keys(GL.troughs)) {
      const [x, z] = GL.troughs[k];
      if (k === 'B') { Q.tr.B = { W: trW, M: trM, line: trLine }; continue; }
      const M2 = W.surface({ kind: 'box', deep: '#143A46', bed: '#B09E80', wall: '#C9BA9E', alpha: 0.96, chop: 0.6, heave: 1, glint: 1.2 });
      const W2 = new THREE.Mesh(keep(new THREE.PlaneGeometry(TS[0] - 0.02, TS[1] - 0.02, ...SEG.basin)), M2); W2.rotation.x = -Math.PI / 2; W2.renderOrder = 5; W2.visible = false; scene.add(inCut(W2, 3));
      M2.uniforms.uBox.value.set(x, z, TS[0] / 2, TS[1] / 2);
      const L2 = W.lines(x - bx, z - bz, x + bx, z + bz, F0 - TD, F0); scene.add(inCut(L2.mesh, 1));
      Q.tr[k] = { W: W2, M: M2, line: L2 };
    }
    trW.visible = false;
    // the mason's line in each trough at its measure ("כמידתה"): a dark cord round its four walls, two pegs at its ends
    const cordM = keep(new THREE.MeshStandardMaterial({ color: '#2A1D12', roughness: 0.8 }));
    for (const k of Object.keys(GL.troughs)) {
      const [x, z] = GL.troughs[k], y = F0 - LINE_D, e = 0.022, r = 0.02, g = [];
      g.push(box(x - bx, y - r, z - bz, x + bx, y + r, z - bz + e, 2), box(x - bx, y - r, z + bz - e, x + bx, y + r, z + bz, 2), box(x - bx, y - r, z - bz, x - bx + e, y + r, z + bz, 2), box(x + bx - e, y - r, z - bz, x + bx, y + r, z + bz, 2));
      for (const s of [-1, 1]) g.push(box(x + s * (bx - 0.05) - 0.04, y - 0.05, z - bz - 0.06, x + s * (bx - 0.05) + 0.04, F0 + 0.12, z - bz + 0.03, 2, '#8A6A48'));
      const m = new THREE.Mesh(keep(mergeGeometries(g)), cordM); m.visible = false; m.name = 'h129-measure' + k; m.renderOrder = CAV + 0.1; m.castShadow = false; scene.add(m);
      Q.tr[k].mark = m;
    }
    for (const k of Object.keys(GL.sluice)) {
      const x = GL.sluice[k][0], pts = [[x, m1[1]], [x, basin(k)[3] + 0.02]];
      const f = W.flow(pts, { w: cw - 0.01, y: () => tb + WL, speed: GOLAH_RUN }); f.mesh.visible = false; scene.add(inCut(f.mesh, 2));
      const b2 = W.wet(pts, { w: cw, y: () => tb + 0.004, alpha: 0.6 }); b2.mesh.visible = false; scene.add(inCut(b2.mesh, 0));
      const sh = W.sheet({ nt: 16, ns: 8, brk: 0.7 }); sh.mesh.visible = false; scene.add(inCut(sh.mesh, 4));
      Q.spur[k] = { flow: f, wet: b2, len: f.len }; Q.inflow[k] = sh;
    }
    // the plank laid over the mouth along the wheel's axle, between the two ropes: the crew stand on it to haul (illustration)
    const pk = GL.plank, pg = box(wx - pk.L / 2, F0 + GL.rimH, wz - pk.w / 2, wx + pk.L / 2, F0 + GL.rimH + pk.h, wz + pk.w / 2, 3, '#CDA982');
    Q.plank = new THREE.Mesh(keep(pg), woodM); Q.plank.castShadow = true; Q.plank.receiveShadow = true; Q.plank.name = 'h129-plank'; scene.add(Q.plank);
    Q.actors = createActors({ scene, ground: () => F0, max: 6, maxItems: 6 });
    Q.actors.setCamera(camera); Q.actors.setInstantVis(true);
    // a flood's puddle on the court's floor beside the basin (its water a standing surface) and the wet stain round it
    Q.puddleAt = (k) => { const [x, z] = GL.troughs[k], o = GL.puddle; return [x + o[0], z + o[1]]; };
    return Q;
  }
  function puddle(k) {
    if (!P || P.puddle[k]) return;
    const [x, z] = P.puddleAt(k), m = W.surface({ deep: '#2E4A50', bed: '#8E7E62', alpha: 0.8, chop: 0.5, glint: 1.4 });
    const g = keep(new THREE.CircleGeometry(1, 18)); g.scale(1.3, 0.8, 1);
    const q = new THREE.Mesh(g, m); q.rotation.x = -Math.PI / 2; q.position.set(x, F0 + 0.012, z); q.renderOrder = 5; scene.add(q); P.puddle[k] = q;
    for (let i = 0; i < 9; i++) { const a = (i / 9) * Math.PI * 2, r = 1.2 + 0.35 * ((i * 0.618) % 1); spots.add(x + Math.cos(a) * r * 1.2, F0 + 0.011, z + Math.sin(a) * r * 0.8, 0.35 + 0.2 * ((i * 0.37) % 1)); }
  }
  function crack(i) {
    if (!P || P.crack[i]) return;
    const g = new THREE.Group(), m = keep(new THREE.MeshBasicMaterial({ color: '#1A120A' }));
    for (const [y, a, l] of [[-1.05, 0.5, 0.34], [-0.86, -0.4, 0.24], [-0.7, 0.3, 0.2]]) { const c = new THREE.Mesh(keep(new THREE.BoxGeometry(0.035, l, 0.02)), m); c.position.set(0.12, y, BUCKET.r1 - 0.02); c.rotation.z = a; g.add(c); }
    buckets[i].add(g); P.crack[i] = g;
  }

  const state = { scriptMs: 0, t: 0 };
  // (world: the water's clock is the page's — it runs while the act waits, the look away or the overview)
  const T0 = performance.now() / 1000, clock = () => performance.now() / 1000 - T0;
  if (world) rope.onBeforeRender = () => { const t = clock(); U.t.value = t; state.t = t; };
  const _a = new THREE.Vector3(), _v = new THREE.Vector3(), _x = new THREE.Vector3(), _fb = new THREE.Vector3(), _eb = new THREE.Vector3();
  function set(F) {
    const t0 = performance.now();
    // the buckets and the rope; the full bucket's water to its brim, kept level as it swings and sloshing behind the swing
    const place = (m, b) => { m.position.set(b.x, b.y, b.z); m.rotation.set(b.tilt || 0, 0, b.swing || 0); };
    place(buckets[0], F.full); place(buckets[1], F.empty);
    bWater.visible = F.full.fill > 0.02 && (F.full.tilt || 0) > -0.7;
    bWater.position.y = -(BUCKET.h + BUCKET.r1 + 0.02) + 0.09 + (BUCKET.h - 0.15) * Math.min(1, F.full.fill);
    bWater.rotation.set(-Math.PI / 2 - (F.full.tilt || 0) * 0.85, -(F.full.swing || 0) + (F.full.slosh || 0), 0);
    wheel.rotation.x = F.wheel;
    ropeTo(_fb.set(F.full.x, F.full.y, F.full.z), _eb.set(F.empty.x, F.empty.y, F.empty.z), F.ropeWet != null ? F.ropeWet : 1);
    // the trough by the well and its line; the basin and its line
    const hy = HB + 0.02 + Math.max(0.001, F.head) * (hh - th - 0.12);
    headW.position.set(hx, hy, hz); headW.visible = F.head > 0.01;
    headM.uniforms.uRim.value = F0 + hh - hy; headM.uniforms.uDepth.value = hy - HB;
    headLine.set(F.head > 0.01 ? hy : HB - 1, F.headWet != null ? HB + 0.02 + F.headWet * (hh - th - 0.12) : hy);
    const ty = F0 - TD + 0.03 + Math.max(0.001, F.trough) * (TD - 0.18);
    trW.position.set(tbx, ty, tbz); trW.visible = F.trough > 0.005;
    trM.uniforms.uRim.value = F0 - ty; trM.uniforms.uDepth.value = ty - (F0 - TD);
    trLine.set(F.trough > 0.005 ? ty : F0 - TD - 1, ty);
    // the channel
    run.set(F.front, F.tail == null ? -1 : F.tail, F.flow == null ? 1 : F.flow);
    run.mat.uniforms.uPile.value.z = F.pileA || 0; run.mat.uniforms.uPile.value.w = F.pileB || 0;
    for (const w of [wet, wetBed]) { w.set(F.front, F.tail == null ? -1 : F.tail); w.mat.uniforms.uDryV.value = F.tailV || 3; }
    wetSides.set(F.front, F.tail == null ? -1 : F.tail); wetSides.mat.uniforms.uDryV.value = F.tailV || 3;
    headM.uniforms.uFoam.value.set(F.pourAt ? F.pourAt[0] : 0, F.pourAt ? F.pourAt[1] : 0, 0.32, F.pourAt ? F.pourAt[2] : 0);
    trM.uniforms.uFoam.value.set(F.inAt ? F.inAt[0] : 0, F.inAt ? F.inAt[1] : 0, 0.22, F.inAt ? F.inAt[2] : 0);
    // the sheets: the pour, the fall into the basin
    for (const [sh, q] of [[pour, F.pour], [inflow, F.inflow]]) {
      if (q && q.on > 0.01) { sh.mesh.visible = true; sh.set(_a.fromArray(q.p0), _v.fromArray(q.v0), _x.fromArray(q.ax), q.tt, q.w0, q.w1, q.bow, q.on); } else { sh.mesh.visible = false; sh.off(); }
    }
    // the dribble off the bucket as it leaves the water
    const q = F.dribble; if (q) { thr.mesh.visible = true; thr.set(0, _a.fromArray(q[0]), _v.fromArray(q[1]), _x.fromArray(q[2]), q[3], q[4], q[5]); } else { thr.mesh.visible = false; thr.off(0); }
    // the rings on the well's, the trough's and the basin's water
    W.rings(wellM, F.wellRings); W.rings(headM, F.headRings); W.rings(trM, F.trRings);
    drops.set(F.drips || []);
    if (F.spots && F.spots.length !== spots.mesh.count) { spots.clear(); for (const sp of F.spots) spots.add(sp[0], sp[1], sp[2], sp[3]); }
    state.scriptMs = performance.now() - t0;
  }
  /** (play) a frame of the station: F = { b: [two buckets {x, y, z, tilt, swing}], full (the bucket with water, or −1), fill, slosh,
   *  wheel, ropeWet, depth, head, headWet, pour, pourAt, headRings, wellRings, drips, dribble,
   *  main: { front, tail, wetTo, wetTail, pile }, spur: { k: { front, tail, wetTo, wetTail } }, inflow: { k: sheet }, inAt: { k },
   *  tr: { k: { level, wet, rings } }, sluice: { k: 0 … 1 } } */
  function playSet(F) {
    const t0 = performance.now();
    for (let i = 0; i < 2; i++) { const q = F.b[i]; buckets[i].position.set(q.x, q.y, q.z); buckets[i].rotation.set(q.tilt || 0, 0, q.swing || 0); }
    if (F.full >= 0 && bWater.parent !== buckets[F.full]) buckets[F.full].add(bWater);
    const fq = F.full >= 0 ? F.b[F.full] : null;
    bWater.visible = !!fq && F.fill > 0.02 && (fq.tilt || 0) > -0.7;
    if (fq) { bWater.position.y = -(BUCKET.h + BUCKET.r1 + 0.02) + 0.09 + (BUCKET.h - 0.15) * Math.min(1, F.fill); bWater.rotation.set(-Math.PI / 2 - (fq.tilt || 0) * 0.85, -(fq.swing || 0) + (F.slosh || 0), 0); }
    wheel.rotation.x = F.wheel;
    ropeTo(_fb.set(F.b[0].x, F.b[0].y, F.b[0].z), _eb.set(F.b[1].x, F.b[1].y, F.b[1].z), F.ropeWet != null ? F.ropeWet : 1);
    // the well's water at the level's depth
    wellW.position.y = F0 - F.depth; wellM.uniforms.uRim.value = F.depth + GL.rimH;
    // the trough by the well
    const hy = HB + 0.02 + Math.max(0.001, F.head) * (hh - th - 0.12);
    headW.position.set(hx, hy, hz); headW.visible = F.head > 0.01;
    headM.uniforms.uRim.value = F0 + hh - hy; headM.uniforms.uDepth.value = hy - HB;
    headLine.set(F.head > 0.01 ? hy : HB - 1, HB + 0.02 + (F.headWet || 0) * (hh - th - 0.12));
    headM.uniforms.uFoam.value.set(F.pourAt ? F.pourAt[0] : 0, F.pourAt ? F.pourAt[1] : 0, 0.32, F.pourAt ? F.pourAt[2] : 0);
    // the basins
    // (the level: 0 … 1 the bottom to the mason's line, its measure; over: 0 … 1 the line to the rim — the flood's risk, seen)
    const yB = F0 - TD + 0.03, yL = F0 - LINE_D, yR = F0 - 0.025, yOf = (l, o) => yB + Math.max(0.001, Math.min(1, l)) * (yL - yB) + Math.max(0, Math.min(1, o || 0)) * (yR - yL);
    for (const k of Object.keys(P.tr)) {
      const T = P.tr[k], q = (F.tr && F.tr[k]) || { level: 0, wet: 0 }, [x, z] = GL.troughs[k];
      const ty = yOf(q.level, q.over);
      T.W.position.set(x, ty, z); T.W.visible = q.level > 0.005;
      if (T.mark) T.mark.visible = !!(F.tr && F.tr[k]);
      T.M.uniforms.uRim.value = F0 - ty; T.M.uniforms.uDepth.value = ty - (F0 - TD);
      // (at the line the surface brims: the glints of the low sun come up on it)
      const brim = Math.max(0, Math.min(1, (q.level - 0.96) / 0.04)); T.M.uniforms.uGlint.value = 1.2 + 3.2 * brim + 1.5 * Math.min(1, q.over || 0);
      T.line.set(q.level > 0.005 ? ty : F0 - TD - 1, yOf(Math.max(q.level, q.wet || 0), Math.max(q.over || 0, q.wetOver || 0)));
      const ia = F.inAt && F.inAt[k]; T.M.uniforms.uFoam.value.set(ia ? ia[0] : 0, ia ? ia[1] : 0, 0.22, ia ? ia[2] : 0);
      W.rings(T.M, q.rings);
    }
    // the channel: the main line and the spurs, the wet stone
    const mn = F.main || {};
    run.set(mn.front == null ? -1 : mn.front, mn.tail == null ? -1 : mn.tail, mn.flow == null ? 1 : mn.flow);
    run.mesh.visible = mn.front > mn.tail;
    run.mat.uniforms.uPile.value.set(mn.pile ? mn.pile[0] : -9, -9, mn.pile ? mn.pile[1] : 0, 0);
    for (const w of [wet, wetBed]) { w.set(mn.wetTo == null ? 0 : mn.wetTo, mn.wetTail == null ? -1 : mn.wetTail); w.mat.uniforms.uDryV.value = 4.2; }
    wetSides.set(mn.wetTo == null ? 0 : mn.wetTo, mn.wetTail == null ? -1 : mn.wetTail); wetSides.mat.uniforms.uDryV.value = 4.2;
    for (const k of Object.keys(P.spur)) {
      const S2 = P.spur[k], q = (F.spur && F.spur[k]) || null;
      S2.flow.mesh.visible = !!q && q.front > q.tail; S2.wet.mesh.visible = !!q && q.wetTo > 0;
      if (q) { S2.flow.set(q.front, q.tail, 1); S2.wet.set(q.wetTo, q.wetTail); S2.wet.mat.uniforms.uDryV.value = 4.2; }
      const sh = P.inflow[k], iq = F.inflow && F.inflow[k];
      if (iq && iq.on > 0.01) { sh.mesh.visible = true; sh.set(_a.fromArray(iq.p0), _v.fromArray(iq.v0), _x.fromArray(iq.ax), iq.tt, iq.w0, iq.w1, iq.bow, iq.on); } else { sh.mesh.visible = false; sh.off(); }
    }
    for (const k of Object.keys(sluiceM)) { const h = F.sluice ? F.sluice[k] || 0 : 0; sluiceM[k].position.y = (F0 - TRENCH) + h * (0.55 + TRENCH); }
    // the pour, the dribble, the drops, the rings
    const q = F.pour; if (q && q.on > 0.01) { pour.mesh.visible = true; pour.set(_a.fromArray(q.p0), _v.fromArray(q.v0), _x.fromArray(q.ax), q.tt, q.w0, q.w1, q.bow, q.on); } else { pour.mesh.visible = false; pour.off(); }
    const d = F.dribble; if (d) { thr.mesh.visible = true; thr.set(0, _a.fromArray(d[0]), _v.fromArray(d[1]), _x.fromArray(d[2]), d[3], d[4], d[5]); } else { thr.mesh.visible = false; thr.off(0); }
    W.rings(wellM, F.wellRings); W.rings(headM, F.headRings);
    drops.set(F.drips || []);
    state.scriptMs = performance.now() - t0;
  }
  /** (play) the station as the save leaves it, in the world between the works: the troughs' water (st.tr: each its measure's
   *  fraction), the broken rim stones, the cracked buckets, the puddles; one bucket up at the rim, the other in the water */
  function still(st) {
    if (!P) return;
    rimBuild(st.rim || []); for (const i of st.cracked || []) crack(i); for (const k of st.puddles || []) if (GL.troughs[k]) puddle(k);
    const d = st.depth || GL.depth[0], oz = H129.ROPE_OFF, bot = 1.32;
    const F = { b: [{ x: wx, y: F0 + GL.rimH + 0.35 + bot, z: wz - oz }, { x: wx, y: F0 - d - 0.15 + bot, z: wz + oz }], full: -1, fill: 0, wheel: 0, ropeWet: 0.5, depth: d,
      head: 0, headWet: 0, main: { front: -1, tail: -1, wetTo: 0, wetTail: -1 }, spur: {}, inflow: {}, inAt: {}, tr: {}, sluice: {}, drips: [] };
    for (const k of Object.keys(st.tr || {})) { const v = +st.tr[k] || 0; F.tr[k] = { level: Math.min(1, v), over: Math.max(0, Math.min(1, (v - 1) / 0.05)), wet: Math.min(1, v) }; }
    playSet(F);
  }
  function view(eye, aim) { camera.position.set(eye[0], eye[1], eye[2]); camera.lookAt(aim[0], aim[1], aim[2]); }
  let shadowDone = false;
  return {
    scene, camera, state, W, clock,
    set, view,
    /** (play) the station's own: its frame, the parts golah.js drives, the marks that stay */
    play: P ? { set: playSet, still, P, rim: rimBuild, puddle, crack, spot: (x, y, z, r) => spots.add(x, y, z, r), buckets, bWater, sluiceM, wheel, camera, BUCKET, wellY: (d) => F0 - d } : null,
    /** the clock of every water material */
    update(t) { U.t.value = t; state.t = t; },
    render() { if (!shadowDone) { renderer.shadowMap.needsUpdate = true; shadowDone = true; } renderer.render(scene, camera); },
    resize(w, h2) { camera.aspect = w / Math.max(1, h2); camera.updateProjectionMatrix(); },
    redrawShadow() { shadowDone = false; },
    dbg: () => ({ scriptMs: +state.scriptMs.toFixed(3), cam: camera.position.toArray().map((v) => +v.toFixed(2)) }),
    dispose() { W.dispose(); for (const o of own) try { o.dispose(); } catch (e) { /* */ } },
  };
}

/* ───────── (build 129 G5) the station's things in the built world: one, kept in the world's scene — the act plays it, the world shows
 * it as the save leaves it (world.js's Golah) ───────── */
let GW = null;
export function golahInWorld(X) {
  try {
    if (!X || !X.scene) return null;
    if (!GW) { const R = globalThis.__T && globalThis.__T.renderer; if (!R) return null; GW = createGolah3d({ renderer: R, play: true, world: true, camera: X.camera }); GW.scene.visible = false; }
    if (GW.scene.parent !== X.scene) X.scene.add(GW.scene);
    return GW;
  } catch (e) { console.warn('[h129] golah in the world', e && e.message); return null; }
}
export const golahWorldNow = () => GW;
