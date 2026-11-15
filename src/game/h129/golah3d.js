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

const S7 = BOOK.s07, GL = S7.golah, AR = S7.around, F0 = GL.floor, DEG = Math.PI / 180;
// sizes of the scene (no places): the sky's radius, the trench's depth, the shaft's water below the floor, the bucket
const SKY_R = 420, FOV = 50, SHADOW = 2048, FOG = { near: 160, far: 700 }, SKY_SEG = { w: 32, h: 16 }, RING_SEG = 36, TRENCH = 0.3, BUCKET = { r0: 0.4, r1: 0.5, h: 0.8, bail: 0.55 };
export const DEPTH = GL.depth[0];
const NONE = -99;   // (a ring that never was: its start long before the loop)

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

export function createGolah3d({ renderer }) {
  const scene = new THREE.Scene(), own = [], keep = (o) => { own.push(o); return o; };
  const camera = new THREE.PerspectiveCamera(FOV, 16 / 10, 0.1, SKY_R * 1.5);
  const W = createWater(THREE), U = W.U;

  /* ── the light: one golden light (light B's colour, as stage 06's sea) and the sky's fill; the shadows drawn once ── */
  const SUN = S7.cam.sun, sunDir = new THREE.Vector3(Math.cos(SUN.el * DEG) * Math.cos(SUN.az * DEG), Math.sin(SUN.el * DEG), Math.cos(SUN.el * DEG) * Math.sin(SUN.az * DEG)).normalize();
  const sun = new THREE.DirectionalLight('#FFBA6E', 2.7), hemi = new THREE.HemisphereLight('#B4C4DC', '#8A7660', 1.45);
  const mid = new THREE.Vector3((AR.gateHouses[0][0] + AR.gateHouses[1][2]) / 2, F0, (AR.house.z + AR.southWall.z[1]) / 2);
  sun.target.position.copy(mid); sun.position.copy(mid).addScaledVector(sunDir, 260); sun.castShadow = true;
  { const c = sun.shadow.camera, h = (AR.gateHouses[1][2] - AR.gateHouses[0][0]) / 2 + 6; c.left = -h; c.right = h; c.top = h; c.bottom = -h; c.near = 60; c.far = 520; sun.shadow.mapSize.set(SHADOW, SHADOW); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.04; }
  scene.add(sun, sun.target, hemi);
  U.sun.value.copy(sunDir); U.sunCol.value.set('#FFBA6E'); U.sky.value.set('#8FB0DC'); U.skyLo.value.set('#F2CFA2');
  scene.fog = new THREE.Fog('#EBCCA4', FOG.near, FOG.far);

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
  const sky = new THREE.Mesh(keep(new THREE.SphereGeometry(SKY_R, SKY_SEG.w, SKY_SEG.h)), skyM); sky.frustumCulled = false; sky.renderOrder = -1; sky.name = 'h129-sky'; scene.add(sky);

  /* ── materials: the world's ashlar, paving and wood (its own procedural textures, tex.js), vertex colours for the shaft's dark ── */
  const TA = texAshlar(7), TP = texPaving(17), TW = texWood(61);
  for (const t of [TA.map, TA.normalMap, TP.map, TP.normalMap, TW.map]) { keep(t); t.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy()); }
  const stoneM = keep(new THREE.MeshStandardMaterial({ map: TA.map, normalMap: TA.normalMap, normalScale: new THREE.Vector2(1.1, 1.1), roughness: 0.86, vertexColors: true }));
  const paveM = keep(new THREE.MeshStandardMaterial({ map: TP.map, normalMap: TP.normalMap, normalScale: new THREE.Vector2(0.7, 0.7), roughness: 0.9, vertexColors: true, side: THREE.DoubleSide }));
  const woodM = keep(new THREE.MeshStandardMaterial({ map: TW.map, color: '#C9A27A', roughness: 0.74, vertexColors: true }));
  const ropeM = keep(new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.62, vertexColors: true }));

  /* ── the stone: the room's walls (no roof; the door to the Azarah where the channel goes out), the south wall beside it, the gate
   *    houses, the House's face and the Ulam, the well's rim and shaft, the trough by the well, the sluice stones ── */
  const [rx0, rz0, rx1, rz1] = GL.room, T1 = GL.wallT, TOP = GL.top, [dx, dz] = GL.door, dw = GL.doorW / 2, dh = GL.doorH;
  const SW = AR.southWall, chel = AR.chel;
  const stone = [];
  stone.push(box(rx0, chel, rz0, rx0 + T1, TOP, rz1), box(rx1 - T1, chel, rz0, rx1, TOP, rz1), box(rx0 + T1, chel, rz1 - T1, rx1 - T1, TOP, rz1));   // west, east, south
  stone.push(box(rx0 + T1, F0 - 1, rz0, dx - dw, TOP, rz0 + T1), box(dx + dw, F0 - 1, rz0, rx1 - T1, TOP, rz0 + T1), box(dx - dw, F0 + dh, rz0, dx + dw, TOP, rz0 + T1));   // north, the door
  stone.push(box(dx - dw - 0.25, F0 + dh, rz0 - 0.2, dx + dw + 0.25, F0 + dh + 0.6, rz0 + T1 + 0.2, 6));   // the door's lintel
  // the south wall of the Azarah each side of the room (cut inside it), as far as the gate houses
  stone.push(box(AR.gateHouses[0][2], SW.y[0], SW.z[0], rx0, SW.y[1], SW.z[1]), box(rx1, SW.y[0], SW.z[0], AR.gateHouses[1][0], SW.y[1], SW.z[1]));
  for (const [a, b, c, d] of AR.gateHouses) stone.push(box(a, chel, b, c, AR.gateTop, d));
  stone.push(box(AR.house.x[0], F0, AR.house.z - 4, AR.house.x[1], AR.house.top, AR.house.z, 30, '#F1E6D2'));
  { const [a, b, c, d] = AR.ulam; stone.push(box(a, F0, b, c, AR.house.top, d, 30, '#F1E6D2')); }
  // the well: its rim of twelve stones, its shaft down to the water and below (darker as it goes down)
  const [wx, wz] = GL.well, R = GL.shaftR;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2, a1 = ((i + 1) / 12) * Math.PI * 2, r0 = R, r1 = R + GL.rimT, h = GL.rimH, g = new THREE.BufferGeometry();
    const P = (r, aa, y) => [wx + r * Math.cos(aa), F0 + y, wz + r * Math.sin(aa)], gap = 0.012;
    const A0 = a + gap, A1 = a1 - gap, q = [P(r0, A0, 0), P(r1, A0, 0), P(r1, A1, 0), P(r0, A1, 0), P(r0, A0, h), P(r1, A0, h), P(r1, A1, h), P(r0, A1, h)];
    const tri = [[4, 5, 6], [4, 6, 7], [1, 2, 6], [1, 6, 5], [0, 4, 7], [0, 7, 3], [0, 1, 5], [0, 5, 4], [3, 7, 6], [3, 6, 2]], pos = [];
    for (const t of tri) for (const k of [t[0], t[2], t[1]]) pos.push(...q[k]);
    g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.computeVertexNormals();
    stone.push(clean(tint(planarUV(g, 6), i % 3 ? '#E8DDCC' : '#D9CDBA')));
  }
  {
    const g = new THREE.CylinderGeometry(R, R, DEPTH + 2, 28, 6, true); g.translate(wx, F0 - (DEPTH + 2) / 2, wz);
    const n = g.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, -n.getX(i), 0, -n.getZ(i));
    const ix = g.index.array; for (let i = 0; i < ix.length; i += 3) { const t = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = t; }
    const P = g.attributes.position, uv = g.attributes.uv; for (let i = 0; i < P.count; i++) uv.setXY(i, uv.getX(i) * (2 * Math.PI * R) / 8, P.getY(i) / 8);
    const c = new Float32Array(P.count * 3); for (let i = 0; i < P.count; i++) { const k = 0.85 * Math.exp(-(F0 - P.getY(i)) / 4.5) + 0.07; c[i * 3] = k; c[i * 3 + 1] = k * 0.96; c[i * 3 + 2] = k * 0.9; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); stone.push(clean(g));
  }
  // the trough by the well: a stone box, its outlet at the foot of its north side into the channel
  const [hx, hz] = GL.head, [hw, hd, hh] = GL.headSize, th = 0.15, out = 0.22, HB = F0 + th;
  stone.push(box(hx - hw / 2, F0, hz - hd / 2, hx + hw / 2, HB, hz + hd / 2, 6, '#E2D6C2'));
  stone.push(box(hx - hw / 2, F0, hz + hd / 2 - th, hx + hw / 2, F0 + hh, hz + hd / 2, 6, '#E2D6C2'), box(hx - hw / 2, F0, hz - hd / 2 + th, hx - hw / 2 + th, F0 + hh, hz + hd / 2 - th, 6, '#E2D6C2'), box(hx + hw / 2 - th, F0, hz - hd / 2 + th, hx + hw / 2, F0 + hh, hz + hd / 2 - th, 6, '#E2D6C2'));
  stone.push(box(hx - hw / 2, F0, hz - hd / 2, hx - out, F0 + hh, hz - hd / 2 + th, 6, '#E2D6C2'), box(hx + out, F0, hz - hd / 2, hx + hw / 2, F0 + hh, hz - hd / 2 + th, 6, '#E2D6C2'), box(hx - out, HB + 0.18, hz - hd / 2, hx + out, F0 + hh, hz - hd / 2 + th, 6, '#E2D6C2'));
  // the sluice stones in their guide posts: the first (A) lowered across its spur's mouth, the second (B) raised, the third (C) lowered
  const cw = GL.channel.w, sl = (k, up) => {
    const [x, z] = GL.sluice[k], zz = z - cw / 2 - 0.1, b = up ? F0 + 0.55 : F0 - TRENCH;
    stone.push(box(x - cw / 2 - 0.12, b, zz - 0.08, x + cw / 2 + 0.12, b + 0.95, zz + 0.08, 4, '#D8CCB6'));
    for (const s of [-1, 1]) stone.push(box(x + s * (cw / 2 + 0.17) - 0.07, F0 - TRENCH, zz - 0.13, x + s * (cw / 2 + 0.17) + 0.07, F0 + 1.6, zz + 0.13, 4, '#CDBFA6'));
  };
  sl('A', false); sl('B', true); sl('C', false);
  const stoneMesh = new THREE.Mesh(keep(mergeGeometries(stone)), stoneM); stoneMesh.castShadow = true; stoneMesh.receiveShadow = true; stoneMesh.name = 'h129-stone'; scene.add(stoneMesh);

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
  floors.push(plate([[AZ.x0, AZ.z0], [AZ.x1, AZ.z0], [AZ.x1, rz0], ...notch.slice().reverse(), [AZ.x0, rz0]], null, F0));
  floors.push(plate([[AZ.x0, rz0], [rx0, rz0], [rx0, AZ.z1], [AZ.x0, AZ.z1]], null, F0), plate([[rx1, rz0], [AZ.x1, rz0], [AZ.x1, AZ.z1], [rx1, AZ.z1]], null, F0));
  floors.push(plate([[dx - dw, rz0], [m0[0] - h, rz0], [m0[0] - h, rz0 + T1], [dx - dw, rz0 + T1]], null, F0), plate([[m0[0] + h, rz0], [dx + dw, rz0], [dx + dw, rz0 + T1], [m0[0] + h, rz0 + T1]], null, F0));
  // the room: its floor round the well's mouth; the channel's first short leg from the trough's outlet to the door
  const ho = hz - hd / 2;
  floors.push(plate([[rx0 + T1, rz0 + T1], [m0[0] - h, rz0 + T1], [m0[0] - h, ho], [m0[0] + h, ho], [m0[0] + h, rz0 + T1], [rx1 - T1, rz0 + T1], [rx1 - T1, rz1 - T1], [rx0 + T1, rz1 - T1]], [circle(wx, wz, R)], F0));
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
  const floorMesh = new THREE.Mesh(keep(mergeGeometries(floors)), paveM); floorMesh.receiveShadow = true; floorMesh.name = 'h129-floor'; scene.add(floorMesh);

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
  const bWater = new THREE.Mesh(keep(new THREE.CircleGeometry(BUCKET.r1 - 0.07, 20)), W.surface({ deep: '#24505C', bed: '#6E5A40', clear: 0.25, alpha: 0.92, chop: 1.6 }));
  bWater.rotation.x = -Math.PI / 2; bWater.renderOrder = 5; buckets[0].add(bWater);

  /* ── the rope: one tube over the wheel from bail to bail, rebuilt each frame (its lower parts dark with the water they were in) ── */
  const RN = 44, RS = 6, ropeG = keep(new THREE.BufferGeometry());
  {
    const pos = new Float32Array(RN * RS * 3), nor = new Float32Array(RN * RS * 3), col = new Float32Array(RN * RS * 3), idx = [];
    for (let i = 0; i + 1 < RN; i++) for (let j = 0; j < RS; j++) { const a = i * RS + j, b = i * RS + ((j + 1) % RS), c = a + RS, d = b + RS; idx.push(a, c, b, b, c, d); }
    ropeG.setAttribute('position', new THREE.BufferAttribute(pos, 3)); ropeG.setAttribute('normal', new THREE.BufferAttribute(nor, 3)); ropeG.setAttribute('color', new THREE.BufferAttribute(col, 3)); ropeG.setIndex(idx);
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
    const P = ropeG.attributes.position.array, N = ropeG.attributes.normal.array, C = ropeG.attributes.color.array;
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
        const twist = 0.88 + 0.12 * Math.sin(L[i] * 22 + a * 2); C[k] = cr * twist; C[k + 1] = cg * twist; C[k + 2] = cb * twist;
      }
    }
    ropeG.attributes.position.needsUpdate = true; ropeG.attributes.normal.needsUpdate = true; ropeG.attributes.color.needsUpdate = true;
    ropeG.computeBoundingSphere();
  }

  /* ── the water: the well's, the trough by the well's, the basin's; the channel's ribbon and the wet stone; the falling threads; the
   *    drops in the air; the wet spots ── */
  const wellM = W.surface({ deep: '#0E2229', bed: '#1C2A26', clear: 0.1, alpha: 0.95, chop: 0.8, glint: 0.6 });
  const wellW = new THREE.Mesh(keep(new THREE.CircleGeometry(R - 0.01, 28)), wellM); wellW.rotation.x = -Math.PI / 2; wellW.position.set(wx, F0 - DEPTH, wz); wellW.renderOrder = 5; scene.add(wellW);
  const headM = W.surface({ deep: '#24505C', bed: '#9C8A6C', clear: 0.55, alpha: 0.88, chop: 1.2 });
  const headW = new THREE.Mesh(keep(new THREE.PlaneGeometry(hw - 2 * th - 0.01, hd - 2 * th - 0.01)), headM); headW.rotation.x = -Math.PI / 2; headW.renderOrder = 5; scene.add(headW);
  const trM = W.surface({ deep: '#1F4A57', bed: '#9C8B6E', clear: 0.6, alpha: 0.86, chop: 1 });
  const [tbx, tbz] = GL.troughs.B, trW = new THREE.Mesh(keep(new THREE.PlaneGeometry(TS[0] - 0.02, TS[1] - 0.02)), trM); trW.rotation.x = -Math.PI / 2; trW.renderOrder = 5; scene.add(trW);
  // the way the water runs in the sample: from the outlet, out by the door to the bend, past the lowered stone (A) east to the raised one
  // (B), into its spur and over the lip into its basin
  const wayPts = [[m0[0], ho], [m1[0], m1[1]], [GL.sluice.B[0], m1[1]], [GL.sluice.B[0], basin('B')[3] + 0.02]];
  const run = W.ribbon(wayPts, { w: cw * 0.86, y: () => tb + 0.13, speed: 3.4 }); scene.add(run.mesh);
  const wet = W.wetTrail(wayPts, { w: cw + 0.62, y: () => F0 + 0.006, hole: cw / (cw + 0.62) }); scene.add(wet.mesh);
  const wetBed = W.wetTrail(wayPts, { w: cw, y: () => tb + 0.004 }); scene.add(wetBed.mesh);
  const thr = W.threads(3); scene.add(thr.mesh);
  const drops = W.drips(120); scene.add(drops.mesh);
  const spots = W.spots(180); scene.add(spots.mesh);

  const state = { scriptMs: 0, t: 0 };
  const zero = new THREE.Vector3();
  function set(F) {
    const t0 = performance.now();
    // the buckets and the rope
    const place = (m, b) => { m.position.set(b.x, b.y, b.z); m.rotation.set(b.tilt || 0, 0, b.swing || 0); };
    place(buckets[0], F.full); place(buckets[1], F.empty);
    bWater.visible = F.full.fill > 0.02 && (F.full.tilt || 0) < 0.7;
    bWater.position.y = -(BUCKET.h + BUCKET.r1 + 0.02) + 0.09 + (BUCKET.h - 0.16) * Math.min(1, F.full.fill);
    bWater.rotation.x = -Math.PI / 2 - (F.full.tilt || 0); bWater.rotation.y = -(F.full.swing || 0);
    wheel.rotation.x = F.wheel;
    ropeTo(new THREE.Vector3(F.full.x, F.full.y, F.full.z), new THREE.Vector3(F.empty.x, F.empty.y, F.empty.z), 1);
    // the trough by the well, the channel, the basin
    headW.position.set(hx, HB + 0.02 + Math.max(0.001, F.head) * (hh - th - 0.12), hz); headW.visible = F.head > 0.01;
    run.set(F.front, F.tail == null ? -1 : F.tail, F.flow == null ? 1 : F.flow);
    wet.set(F.wetTo != null ? F.wetTo : F.front); wetBed.set(F.wetTo != null ? F.wetTo : F.front);
    trW.position.set(tbx, F0 - TD + 0.03 + Math.max(0.001, F.trough) * (TD - 0.18), tbz); trW.visible = F.trough > 0.005;
    headM.uniforms.uFoam.value.set(F.pourAt ? F.pourAt[0] : 0, F.pourAt ? F.pourAt[1] : 0, 0.22, F.pourAt ? F.pourAt[2] : 0);
    trM.uniforms.uFoam.value.set(F.inAt ? F.inAt[0] : 0, F.inAt ? F.inAt[1] : 0, 0.2, F.inAt ? F.inAt[2] : 0);
    // the threads (the pour, the dribble off the rising bucket, the fall into the basin)
    for (let k = 0; k < 3; k++) { const q = F.threads && F.threads[k]; if (q) thr.set(k, q[0], q[1], q[2], q[3], q[4], q[5]); else thr.off(k); }
    // the rings on the well's, the trough's and the basin's water
    for (const [mat, list] of [[wellM, F.wellRings], [headM, F.headRings], [trM, F.trRings]]) { const D = mat.uniforms.uDrops.value; for (let i = 0; i < 4; i++) { const r = list && list[i]; if (r) D[i].set(r[0], r[1], r[2], r[3]); else D[i].set(0, 0, NONE, 0); } }
    // the drops in the air
    const n = Math.min(drops.N, (F.drips || []).length);
    for (let i = 0; i < n; i++) { const d = F.drips[i]; drops.pos[i * 3] = d[0]; drops.pos[i * 3 + 1] = d[1]; drops.pos[i * 3 + 2] = d[2]; drops.sz[i] = d[3]; }
    drops.update(n);
    if (F.spots && F.spots.length !== spots.mesh.count) { spots.clear(); for (const s of F.spots) spots.add(s[0], s[1], s[2], s[3]); }
    state.scriptMs = performance.now() - t0;
    void zero;
  }
  function view(eye, aim) { camera.position.set(eye[0], eye[1], eye[2]); camera.lookAt(aim[0], aim[1], aim[2]); }
  let shadowDone = false;
  return {
    scene, camera, state, W,
    set, view,
    /** the clock of every water material */
    update(t) { U.t.value = t; state.t = t; },
    render() { if (!shadowDone) { renderer.shadowMap.needsUpdate = true; shadowDone = true; } renderer.render(scene, camera); },
    resize(w, h2) { camera.aspect = w / Math.max(1, h2); camera.updateProjectionMatrix(); drops.mat.uniforms.uH.value = (h2 / 2) / Math.tan((camera.fov * DEG) / 2); },
    redrawShadow() { shadowDone = false; },
    dbg: () => ({ scriptMs: +state.scriptMs.toFixed(3), cam: camera.position.toArray().map((v) => +v.toFixed(2)) }),
    dispose() { W.dispose(); for (const o of own) try { o.dispose(); } catch (e) { /* */ } },
  };
}
