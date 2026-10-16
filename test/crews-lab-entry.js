/* ─────────────────────────────────────────────────────────────────────────────
 * crews-lab-entry.js — a small, fast scene for src/crews.js (the CREWS agent's lab).
 * Bundled by test/crews.cjs into test/out/crews-lab.bundle.js and loaded by test/crews-lab.html.
 * A plain floor (or the inner Temple with plain colours: ?temple=1) and a stand-in for the construction layer (stages):
 * the ground of the courts, each site's status and progress, the crane and its block, the boulders, the hero.
 * window.__C: { THREE, scene, camera, renderer, crews, stages, look(p, t), step(sec), render(), drawCalls(), setPhase(id, p) }
 * ──────────────────────────────────────────────────────────────────────────── */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Batch } from '../src/batch.js';
import { buildTemple } from '../src/temple.js';
import { Blobs } from '../src/animals.js';
import { createCrews } from '../src/crews.js';

const Q = new URLSearchParams(location.search);
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#BFD3E6');
scene.fog = new THREE.Fog('#D9E2EA', 500, 2200);
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.5, 4000);
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
scene.add(new THREE.HemisphereLight('#C8D6E8', '#BCA887', 0.7));
const sun = new THREE.DirectionalLight('#FFF4E4', 2.6); sun.position.set(120, 260, 90); scene.add(sun);

const temple = Q.get('temple') === '1';
const floor = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#D9CDB4', roughness: 0.95 }));
scene.add(floor);
if (temple) {
  const std = (c, o = {}) => ({ mat: new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...o }), tile: 10 });
  const base = {
    ash: std('#DCCFB4'), ashBig: std('#DCCFB4'), ash2: std('#D6C8AC'), pave: std('#E4D9C2'), marble: std('#EEE9DF'), marbleIn: std('#A89F92'),
    wmarble: std('#EDE5D6'), plaster: std('#F0EBDF'), gold: std('#E9B949', { metalness: 1, roughness: 0.3 }), bronze: std('#D9A060', { metalness: 1, roughness: 0.35 }),
    cedar: std('#B98D62'), oak: std('#B08A62'), roof: std('#B8664A'), dark: std('#2C2118'), red: std('#A3261F'), iron: std('#3D3935'),
    water: std('#5A8BA6', { roughness: 0.1 }), lattice: std('#EFE3C8'), clay: std('#B8784C'), ashpile: std('#B9B3AA'),
  };
  const mats = new Proxy(base, { get: (o, k) => o[k] || o.ash });
  const B = new Batch(mats);
  buildTemple(B, () => {});
  for (const id of Object.keys(B.sets)) B.build(scene, id);
} else {
  // stand-ins for the walls the crews face: the azara's north wall (wall site), the altar block, the east gate
  const m = new THREE.MeshStandardMaterial({ color: '#E1D4B8', roughness: 0.9 });
  const box = (x0, y0, z0, x1, y1, z1) => { const g = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, y1 - y0, z1 - z0), m); g.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2); scene.add(g); };
  box(-193, 0, -79.5, 147, 18, -73.5);
  box(-54, 0, -19.5, -22, 6, 12.5);
}
// the crane's block (a stand-in): it rises and falls over the wall
const block = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1, 1.3), new THREE.MeshStandardMaterial({ color: '#D8C9A6' }));
block.position.set(44, 12, -80); scene.add(block);

// the construction layer's stand-in: ground, status, crane, boulders, hero
const P = {};
const inAzara = (x, z) => x >= -187 && x <= -11.5 && Math.abs(z) < 67.5;
const stages = {
  groundAt: (x, z) => (temple ? (inAzara(x, z) ? 16 : x > -11.5 && x < 0 && Math.abs(z) < 67.5 ? 13.5 : x >= 0 && x <= 147 && Math.abs(z) < 73.5 ? 6 : 0) : 0),
  status: (id) => ({ status: 'building', progress: P[id] !== undefined ? P[id] : 0.5, shown: P[id] !== undefined ? P[id] : 0.5 }),
  get boulders() { return [2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2]; },
  hero: { at: null, position: new THREE.Vector3(150, 0, -96) },
  _dbg: { crane: { st: { id: 'wall' }, block } },
  // (the public read-only API the real stages.js gives since wave 4: the crane's site and its hanging block)
  crane(out) { const c = stages._dbg.crane; if (!c.st) return null; const o = out || {}; o.site = c.st.id; o.carry = true; o.x = block.position.x; o.y = block.position.y; o.z = block.position.z; return o; },
};
const blobs = new Blobs(scene, 512);
const life = { phase: 'build', blobs, fx: [] };
const crews = createCrews({ scene, camera, life, stages, terrainH: () => 0 });
let T = 0;
function update(dt) {
  T += dt;
  block.position.y = 12 + Math.sin(T * 0.6) * 5;
  blobs.begin();
  crews.update(dt);
  blobs.end();
}
window.__C = {
  THREE, scene, camera, renderer, crews, stages, life, P, block,
  look(p, t) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(t[0], t[1], t[2]); camera.updateMatrixWorld(); },
  step(sec = 1, dt = 1 / 30) { for (let t = 0; t < sec; t += dt) update(dt); },
  render() { update(0.001); renderer.render(scene, camera); },
  resize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); },
  drawCalls() { renderer.info.reset(); renderer.info.autoReset = false; renderer.render(scene, camera); const r = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }; renderer.info.autoReset = true; return r; },
  setCrane(id, x, z) { stages._dbg.crane.st = id ? { id } : null; if (x !== undefined) block.position.set(x, 12, z); },
};
// ── people6 ── (PEOPLE) SITE's dressing yard as s6-site draws it (the stock pile of the wall at (78, −106), the row of
// bankers east of it: the builder's at 7 amot, the yard's at 11.5 + 3.8·i with stones dressed / drafted / rough), and
// SITE's workSpot + siteInfo for it: the crews' masons work there on these very stones
window.__C.yardOn = () => {
  const px = 78, pz = -106, rx = 1, rz = 0, fx = 0, fz = 1, mB = new THREE.MeshStandardMaterial({ color: '#8B6A45' }), mS = new THREE.MeshStandardMaterial({ color: '#D8C9A6' });
  const yard = [];
  ['dressed', 'drafted', 'rough'].forEach((state, i) => {
    const bx = px + rx * (11.5 + i * 3.8) + fx * 0.5, bz = pz + rz * (11.5 + i * 3.8) + fz * 0.5, rough = state === 'rough';
    const b = new THREE.Mesh(new THREE.BoxGeometry(1.35, 0.28, 2.7), mB); b.position.set(bx, 1.0, bz); scene.add(b);
    const st = { x: bx, y: rough ? 1.66 : 1.62, z: bz, w: 2.1, h: rough ? 1.05 : 0.95, d: rough ? 1.3 : 1.25, yaw: Math.atan2(fx, fz) + Math.PI / 2 };
    const m = new THREE.Mesh(new THREE.BoxGeometry(st.d, st.h, st.w), mS); m.position.set(bx, st.y, bz); scene.add(m);
    yard.push({ x: bx, y: 0, z: bz, stone: st, state });
  });
  stages.siteInfo = (id) => (id === 'wall' ? { id, kind: 'ashlar', status: 'building', phase: 'courses', base: 0 } : null);
  stages.workSpot = (id, kind) => {
    if (id !== 'wall') return null;
    if (kind === 'stock') return { x: px - fx * 3.2, y: 0, z: pz - fz * 3.2, face: [px, pz] };
    if (kind === 'dress') { const sx = px + rx * 7, sz = pz + rz * 7; return { x: sx + rx * 1.9, y: 0, z: sz + rz * 1.9, face: [sx, sz], stone: { x: sx, y: 1.55, z: sz, w: 1.8, h: 0.9, d: 1.0, yaw: Math.atan2(-rx, -rz) } }; }
    if (kind === 'yard' && window.__C.yardKind) return yard;
    return null;
  };
  return yard;
};
window.__C.ready = true;
