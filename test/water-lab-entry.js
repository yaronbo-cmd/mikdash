/* water-lab-entry.js — WATER's small, fast scene (wave 6): the inner Temple (temple.js, plain colours, no terrain, city or
 * post-processing), the kohanim and the service (avodah3d.js) and world.water (src/water.js), wired as in main.js.
 * Bundled by test/water-lab.cjs into test/out/water-lab.bundle.js and loaded by test/water-lab.html.
 * window.__L: { THREE, scene, camera, renderer, avodah, actors, water, look(p, t), step(sec), run(sec), settle(p, sec),
 *   render(), drawCalls() } */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { Batch } from '../src/batch.js';
import { buildTemple } from '../src/temple.js';
import { createAnimals, Blobs } from '../src/animals.js';
import * as PL from '../src/places.js';
import { createAvodah3D, groundY } from '../src/avodah3d.js';
import { createWater } from '../src/water.js';

// the lab runs on simulation time: performance.now and the long timers (the layers' wall-clock backstops) follow
// __L.step, so a slow software render between two shots does not end the layers' waits early
let simMs = 0;
performance.now = () => simMs;
const realST = window.setTimeout.bind(window), realCT = window.clearTimeout.bind(window), pend = [];
window.setTimeout = (fn, ms = 0, ...a) => { if (!(ms >= 1000)) return realST(fn, ms, ...a); const o = { at: simMs + ms, fn, a }; pend.push(o); return o; };
window.clearTimeout = (id) => { const i = pend.indexOf(id); if (i >= 0) pend.splice(i, 1); else realCT(id); };
function simClock(dt) { simMs += dt * 1000; for (let i = pend.length - 1; i >= 0; i--) if (pend[i].at <= simMs) { const o = pend.splice(i, 1)[0]; try { o.fn(...o.a); } catch (e) { console.error(e); } } }
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.95;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#BFD3E6');
const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, 0.2, 4000);
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.45;
const hemi = new THREE.HemisphereLight('#C8D6E8', '#BCA887', 1.0); scene.add(hemi);
const sun = new THREE.DirectionalLight('#FFF4E4', 2.8); sun.position.set(120, 260, 90); scene.add(sun);
const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#D9CDB4', roughness: 0.95 }));
scene.add(ground);
const std = (c, o = {}) => ({ mat: new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, ...o }), tile: 10 });
const base = {
  ash: std('#DCCFB4'), pave: std('#E4D9C2'), marble: std('#EEE9DF'), wmarble: std('#EDE5D6'), plaster: std('#F0EBDF'),
  gold: std('#E9B949', { metalness: 1, roughness: 0.3 }), bronze: std('#B98A52', { metalness: 0.9, roughness: 0.35 }), silver: std('#D8D8D8', { metalness: 1, roughness: 0.25 }),
  cedar: std('#B98D62'), oak: std('#9C7A55'), dark: std('#2C2118'), red: std('#A3261F'), water: std('#4E7F95', { roughness: 0.1 }), ashpile: std('#B9B3AA'), ember: std('#C4502A'),
};
const mats = new Proxy(base, { get: (o, k) => o[k] || o.ash });
const B = new Batch(mats);
buildTemple(B, () => {});
const MOVING = ['kiyor-basin', 'kiyor-wheel', 'kiyor-chains'];   // (world.water builds and moves these)
for (const id of Object.keys(B.sets)) if (!MOVING.includes(id)) B.build(scene, id);

const blobs = new Blobs(scene, 512);
const animals = createAnimals({ scene, camera, blobs, ground: groundY });
const avodah = createAvodah3D({ scene, camera, animals, blobs, ground: groundY });
const water = createWater({ scene, camera, avodah, hemi, sun, B });
avodah.useWater(water);
// WORLD's use of waterMaterial(): a pool (a plain plane in world units), south of the altar
{ const pool = new THREE.Mesh(new THREE.PlaneGeometry(9, 5).rotateX(-Math.PI / 2), water.waterMaterial({ color: '#3F6F78', opacity: 0.92, flow: [0.4, 0], scale: 1.4 })); pool.position.set(-24, 16.04, 52); scene.add(pool); }
const actors = avodah._actors;
function update(dt) { simClock(dt); blobs.begin(); animals.update(dt); avodah.update(dt); water.update(dt); blobs.end(); }
const tick = () => new Promise((r) => setTimeout(r, 0));
window.__L = {
  THREE, scene, camera, renderer, avodah, actors, water, PL, groundY, hemi, sun,
  look(p, t) { camera.position.set(p[0], p[1], p[2]); camera.lookAt(t[0], t[1], t[2]); camera.updateMatrixWorld(); },
  step(sec = 1, dt = 1 / 30) { for (let t = 0; t < sec; t += dt) update(dt); },
  async run(sec, dt = 1 / 30) { for (let t = 0; t < sec; t += dt) { update(dt); await tick(); } },
  async settle(p, sec = 30, dt = 1 / 30) { let v = 'pending'; Promise.resolve(p).then((x) => { v = x; }); for (let t = 0; t < sec && v === 'pending'; t += dt) { update(dt); await tick(); } return v; },
  render() { update(0.0001); renderer.render(scene, camera); },
  night(on) { hemi.intensity = on ? 0.12 : 1; sun.intensity = on ? 0.15 : 2.8; scene.background.set(on ? '#0B1320' : '#BFD3E6'); },
  drawCalls() { renderer.info.autoReset = false; renderer.info.reset(); renderer.render(scene, camera); const r = { calls: renderer.info.render.calls, tris: renderer.info.render.triangles, programs: renderer.info.programs.length }; renderer.info.autoReset = true; return r; },
};
window.__L.ready = true;
