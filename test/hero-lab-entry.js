/* ─────────────────────────────────────────────────────────────────────────────
 * hero-lab-entry.js — PEOPLE's lab for the builder hero (stages.js, the `// ── hero (PEOPLE) ──` fences): the real
 * construction layer (createStages) over the Mount and the Temple built with plain colours, no terrain/city/post, so
 * SwiftShader renders a close frame in a few seconds. Bundled by test/hero-lab.cjs into test/out/hero-lab.bundle.js.
 * window.__H: { THREE, scene, camera, renderer, stages, look(p, t), step(sec, dt), render(), drawCalls(), heroAt() }
 * ──────────────────────────────────────────────────────────────────────────── */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Batch } from '../src/batch.js';
import { buildTemple } from '../src/temple.js';
import { buildMount } from '../src/mount.js';
import { createStages } from '../src/stages.js';
import { createCrowd } from '../src/crowd.js';
import * as TX from '../src/tex.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#BFD3E6');
scene.fog = new THREE.Fog('#D9E2EA', 500, 2000);
const camera = new THREE.PerspectiveCamera(40, innerWidth / innerHeight, 0.3, 4000);
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
const hemi = new THREE.HemisphereLight('#C8D6E8', '#BCA887', 0.8); scene.add(hemi);
const sun = new THREE.DirectionalLight('#FFF4E4', 2.8); sun.position.set(160, 260, 120); scene.add(sun);

const T = { ground: TX.texGround(71, 256), rock: TX.texRock(91, 256), wood: TX.texWood(61, 128), puff: TX.texPuff() };
const std = (c, o = {}) => ({ mat: new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...o }), tile: 10 });
const base = {
  ash: std('#DCCFB4'), ashBig: std('#DCCFB4'), ash2: std('#D6C8AC'), pave: std('#E4D9C2'), marble: std('#EEE9DF'), marbleIn: std('#A89F92'),
  wmarble: std('#EDE5D6'), plaster: std('#F0EBDF'), gold: std('#E9B949', { metalness: 1, roughness: 0.3 }), bronze: std('#D9A060', { metalness: 1, roughness: 0.35 }),
  cedar: std('#B98D62'), oak: std('#B08A62'), roof: std('#B8664A'), dark: std('#2C2118'), red: std('#A3261F'), iron: std('#3D3935'),
  water: std('#5A8BA6', { roughness: 0.1 }), lattice: std('#EFE3C8'), clay: std('#B8784C'), ashpile: std('#B9B3AA'),
};
const mats = new Proxy(base, { get: (o, k) => o[k] || o.ash });
const B = new Batch(mats);
const P = () => {};
buildMount(B, P);
buildTemple(B, P);
B.stage('_');
const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000).rotateX(-Math.PI / 2).translate(0, -0.05, 0), new THREE.MeshStandardMaterial({ color: '#CDBE9F', roughness: 0.95 }));
scene.add(ground);
const life = { phase: 'build', night: false, workLights: [], setPhase(p) { this.phase = p === 'complete' ? 'complete' : 'build'; }, setFire() {}, setPilgrims() {} };
const stages = createStages({ scene, camera, B, mats, T, life, columns: null, renderer: null });
let t = 0;
let crowd = null;
function update(dt) { t += dt; stages.update(dt); if (crowd) crowd.update(dt); }
window.__H = {
  THREE, scene, camera, renderer, stages, life, sun, hemi,
  look(p, tg) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(tg[0], tg[1], tg[2]); camera.updateMatrixWorld(); },
  step(sec = 1, dt = 1 / 30) { for (let k = 0; k < sec; k += dt) update(dt); },
  render() { renderer.render(scene, camera); },
  resize(w, h) { renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); },
  drawCalls() { renderer.info.reset(); renderer.info.autoReset = false; renderer.render(scene, camera); const r = { calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }; renderer.info.autoReset = true; return r; },
};
window.__H.crowd = (kind) => { if (!crowd) { crowd = createCrowd({ scene, camera, stages, life, ground: (x, z) => stages.groundAt(x, z) }); stages.crowd = crowd; } crowd.setScene(kind); return crowd; };
window.__H.ready = true;
