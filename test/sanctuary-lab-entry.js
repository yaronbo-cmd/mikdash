// Sanctuary lab: the inner complex (temple.js) + sanctuary.js only, with main.js's materials, sky and time presets,
// for fast iteration in SwiftShader. Built by test/sanctuary-lab.mjs → test/out/sanctuary-lab.html. Hooks: window.__L.
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { Batch, groundAO } from '../src/batch.js';
import * as TX from '../src/tex.js';
import { buildTemple } from '../src/temple.js';
import { buildSky } from '../src/world.js';
import { createSanctuary } from '../src/sanctuary.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap; renderer.shadowMap.autoUpdate = false;
const scene = new THREE.Scene(); scene.fog = new THREE.Fog('#EAD6BA', 950, 4600);
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 0.5, 12000);
const controls = new OrbitControls(camera, canvas); controls.minDistance = 35; controls.maxDistance = 2400;
const pmrem = new THREE.PMREMGenerator(renderer);
function makeMats() {
  const T = { ash: TX.texAshlar(7), pave: TX.texPaving(17), marble: TX.texMarble(23), plaster: TX.texPlaster(41), roof: TX.texRoof(53), wood: TX.texWood(61), lattice: TX.texLattice() };
  const std = (o) => new THREE.MeshStandardMaterial(o), n = (a) => new THREE.Vector2(a, a);
  return {
    ash: { mat: groundAO(std({ map: T.ash.map, normalMap: T.ash.normalMap, normalScale: n(1.1), roughness: 0.86 }), { macro: 0.1 }), tile: 24 },
    pave: { mat: groundAO(std({ map: T.pave.map, normalMap: T.pave.normalMap, normalScale: n(0.7), roughness: 0.9 }), { macro: 0.14 }), tile: 24 },
    marble: { mat: groundAO(std({ map: T.marble.map, normalMap: T.marble.normalMap, normalScale: n(1.35), roughness: 0.34 })), tile: 19.2 },
    marbleIn: { mat: groundAO(std({ map: T.marble.map, normalMap: T.marble.normalMap, color: '#A89F92', roughness: 0.5 })), tile: 19.2 },
    wmarble: { mat: groundAO(std({ color: '#EDE5D6', roughness: 0.42 })), tile: 10 },
    plaster: { mat: groundAO(std({ map: T.plaster.map, normalMap: T.plaster.normalMap, normalScale: n(0.8), roughness: 0.95 })), tile: 10 },
    gold: { mat: std({ color: '#E9B949', metalness: 1, roughness: 0.24 }), tile: 5 },
    bronze: { mat: std({ color: '#D9A060', metalness: 1, roughness: 0.3 }), tile: 5 },
    cedar: { mat: groundAO(std({ map: T.wood.map, color: '#E8BE93', roughness: 0.72 })), tile: 4 },
    oak: { mat: std({ map: T.wood.map, color: '#B08A62', roughness: 0.7 }), tile: 4 },
    roof: { mat: std({ map: T.roof.map, normalMap: T.roof.normalMap, roughness: 0.78 }), tile: 8 },
    dark: { mat: std({ color: '#2C2118', roughness: 1 }), tile: 10, cast: false },
    red: { mat: std({ color: '#A3261F', roughness: 0.7 }), tile: 10, cast: false },
    iron: { mat: std({ color: '#3D3935', metalness: 0.6, roughness: 0.5 }), tile: 10, cast: false },
    water: { mat: std({ color: '#5A8BA6', roughness: 0.06, metalness: 0.1 }), tile: 10, cast: false },
    lattice: { mat: std({ color: '#EFE3C8', alphaMap: T.lattice, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 }), tile: 2, cast: false },
    clay: { mat: std({ color: '#B8784C', roughness: 0.8 }), tile: 10 },
    ashpile: { mat: std({ color: '#B9B3AA', roughness: 1 }), tile: 10, cast: false },
  };
}
const hemi = new THREE.HemisphereLight('#BFD6EE', '#CDB894', 1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff', 3); sun.castShadow = true; sun.target.position.set(-80, 0, 0); scene.add(sun, sun.target);
{ const sc = sun.shadow.camera; sc.left = -260; sc.right = 260; sc.top = 260; sc.bottom = -260; sc.near = 100; sc.far = 3400; sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.5; }
const sky = buildSky(); scene.add(sky.dome);
const TIMES = {
  dawn: { el: 24, az: 55, sun: '#FFD6A6', sunI: 2.9, hs: '#C4CCDD', hg: '#B69C78', hI: 0.5, envI: 0.45, top: '#5A84C2', hor: '#F2D2AC', bot: '#CDB38F', exp: 0.92, bloom: 0.22, bloomT: 1.8, night: false },
  noon: { el: 62, az: 100, sun: '#FFF4E4', sunI: 3.1, hs: '#C8D6E8', hg: '#BCA887', hI: 0.55, envI: 0.5, top: '#4A7FC3', hor: '#D9E6F0', bot: '#CFBC99', exp: 0.85, bloom: 0.18, bloomT: 1.9, night: false },
  dusk: { el: 12, az: 195, sun: '#FFB07A', sunI: 2.8, hs: '#A9AFCB', hg: '#A88A6C', hI: 0.5, envI: 0.45, top: '#4A5D99', hor: '#F2B385', bot: '#B89A78', exp: 0.95, bloom: 0.28, bloomT: 1.6, night: false },
  night: { el: 52, az: 230, sun: '#9FB5E0', sunI: 0.3, hs: '#23355A', hg: '#1E1A24', hI: 0.35, envI: 0.35, top: '#060B1A', hor: '#1B2749', bot: '#12151D', exp: 1.1, bloom: 0.6, bloomT: 1.0, night: true },
};
let cur = 'dawn', envRT = null, bloom;
function setTime(k) {
  const t = TIMES[k]; cur = k;
  const el = THREE.MathUtils.degToRad(t.el), az = THREE.MathUtils.degToRad(t.az);
  const dir = new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  sun.position.copy(sun.target.position).addScaledVector(dir, 1600); sun.color.set(t.sun); sun.intensity = t.sunI;
  hemi.color.set(t.hs); hemi.groundColor.set(t.hg); hemi.intensity = t.hI;
  for (const U of [sky.uniforms, sky.envU]) { U.top.value.set(t.top); U.horizon.value.set(t.hor); U.bottom.value.set(t.bot); U.sunDir.value.copy(dir); U.sunCol.value.set(t.night ? '#DCE6FF' : t.sun); }
  sky.uniforms.sunI.value = t.night ? 0.22 : 1; sky.envU.sunI.value = t.night ? 0.05 : 0.35;
  renderer.toneMappingExposure = t.exp; scene.environmentIntensity = t.envI;
  if (envRT) envRT.dispose(); envRT = pmrem.fromScene(sky.envScene, 0, 1, 1000); scene.environment = envRT.texture;
  if (bloom) { bloom.strength = t.bloom; bloom.threshold = t.bloomT; }
  renderer.shadowMap.needsUpdate = true;
}
const mats = makeMats(), B = new Batch(mats), picks = [];
buildTemple(B, (id, ...b) => picks.push({ id, b }));
for (const id of Object.keys(B.sets)) { const g = new THREE.Group(); g.name = 'stage-' + id; B.build(g, id); scene.add(g); }
const ground = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#CDBB98', roughness: 1 })); ground.receiveShadow = true; scene.add(ground);
const sanct = createSanctuary({ scene, camera, controls, renderer, hemi, getTime: () => TIMES[cur], requestShadow: () => { renderer.shadowMap.needsUpdate = true; } });
const composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(innerWidth, innerHeight, { type: THREE.HalfFloatType, samples: 2 }));
composer.addPass(new RenderPass(scene, camera));
bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), 0.22, 0.45, 1.8); composer.addPass(bloom);
composer.addPass(new OutputPass());
setTime('dawn');
camera.position.set(-20, 60, 60); controls.target.set(-90, 30, 0); controls.update();
window.__L = {
  THREE, scene, camera, controls, renderer, sanct, setTime, picks,
  look(p, t) { camera.position.set(...p); controls.target.set(...t); controls.update(); },
  update(dt = 0.016, n = 1) { for (let i = 0; i < n; i++) sanct.update(dt); },
  render() { sky.dome.position.copy(camera.position); composer.render(0.016); },
  calls() { const i = renderer.info; i.autoReset = false; i.reset(); renderer.shadowMap.needsUpdate = false; composer.render(0.016); const r = { total: i.render.calls, tris: i.render.triangles }; i.autoReset = true; return r; },
  ready: true,
};
