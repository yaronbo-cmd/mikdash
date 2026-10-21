/* ─────────────────────────────────────────────────────────────────────────────
 * life-lab-entry.js — a small, fast scene for the Life agent's modules (animals, actors, avodah3d, pens).
 * Bundled by test/life-lab.cjs into test/out/life-lab.bundle.js and loaded by test/life-lab.html.
 * It builds the inner Temple (temple.js) with plain colours — no terrain, city, textures or post-processing —
 * so SwiftShader renders a frame in about a second. URL: ?temple=0 skips the Temple (animals on a plain floor).
 * window.__L: { THREE, scene, camera, renderer, animals, actors, avodah, look(p, t), step(sec), render(), drawCalls() }
 * ──────────────────────────────────────────────────────────────────────────── */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Batch } from '../src/batch.js';
import { buildTemple } from '../src/temple.js';
import { createAnimals, Blobs } from '../src/animals.js';
import * as PL from '../src/places.js';
import { buildTerrain, terrainH } from '../src/world.js';
import { buildPens, buildLambsChamber } from '../src/pens.js';
import { ITEMS } from '../src/actors.js';
import { createAvodah3D, groundY } from '../src/avodah3d.js';

const Q = new URLSearchParams(location.search);
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#BFD3E6');
scene.fog = new THREE.Fog('#D9E2EA', 400, 1600);
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.5, 4000);
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
scene.add(new THREE.HemisphereLight('#C8D6E8', '#BCA887', 0.7));
const sun = new THREE.DirectionalLight('#FFF4E4', 2.6); sun.position.set(120, 260, 90); scene.add(sun);

// ground (the Mount's paving) and, unless ?temple=0, the inner Temple with plain materials
const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#D9CDB4', roughness: 0.95 }));
scene.add(ground);
if (Q.get('terrain') === '1') { ground.visible = false; scene.add(buildTerrain(null)); }
if (Q.get('temple') !== '0') {
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
}

const G = Q.get('temple') !== '0' ? groundY : () => 0;
const blobs = new Blobs(scene, 512);
const animals = createAnimals({ scene, camera, blobs, ground: G });
const avodah = createAvodah3D({ scene, camera, animals, blobs, ground: G });
const actors = avodah._actors;
let T = 0;
const updaters = [];
function update(dt) {
  T += dt;
  blobs.begin();
  animals.update(dt);
  avodah.update(dt);
  for (const f of updaters) f(dt);
  blobs.end();
}
function render() { update(0.001); renderer.render(scene, camera); }
window.__L = {
  THREE, scene, camera, renderer, animals, actors, avodah, ITEMS, blobs, PL, updaters, terrainH, buildPens, buildLambsChamber,
  look(p, t) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(t[0], t[1], t[2]); camera.updateMatrixWorld(); },
  step(sec = 1, dt = 1 / 30) { for (let t = 0; t < sec; t += dt) update(dt); },
  render,
  resize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); },
  drawCalls() { renderer.info.reset(); renderer.info.autoReset = false; renderer.render(scene, camera); const r = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }; renderer.info.autoReset = true; return r; },
};
window.__L.ready = true;
