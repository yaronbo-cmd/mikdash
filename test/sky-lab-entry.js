/* sky-lab-entry.js — WORLD (wave 6): a small, fast scene for src/sky.js: the dome, the horizon cumulus, a ground with a
 * few boxes and gold/marble spheres lit by the preset's sun and the sky's PMREM environment. Bundled by test/sky-lab.cjs.
 * window.__S: { set(k, over), look(az, el), render() } */
import * as THREE from 'three';
import { createSky } from '../src/sky.js';

const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(1); renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#ffffff', 700, 7000);
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 4, 12000);
const pm = new THREE.PMREMGenerator(renderer);
const sky = createSky(); scene.add(sky.dome);
const hemi = new THREE.HemisphereLight('#BFD6EE', '#CDB894', 0.5); scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 3); scene.add(sun, sun.target);
const g = new THREE.Mesh(new THREE.PlaneGeometry(16000, 16000, 96, 96).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#B9A77F', roughness: 1 }));
{ const p = g.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, Math.max(0, 140 * Math.sin(x / 700) * Math.cos(z / 900)) + (Math.hypot(x, z) > 2600 ? 80 : 0)); } g.geometry.computeVertexNormals(); }
scene.add(g);
const box = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), stone = new THREE.MeshStandardMaterial({ color: '#D8C7A4', roughness: 0.9 });
for (let i = 0; i < 60; i++) { const m = new THREE.Mesh(box, stone); m.position.set((i % 10) * 40 - 200, 0, Math.floor(i / 10) * 40 - 120); m.scale.set(14, 8 + (i * 7) % 12, 14); scene.add(m); }
const gold = new THREE.Mesh(new THREE.SphereGeometry(30, 48, 24), new THREE.MeshStandardMaterial({ color: '#E9B949', metalness: 1, roughness: 0.24 }));
gold.position.set(0, 60, 0); scene.add(gold);
const marble = new THREE.Mesh(new THREE.SphereGeometry(30, 48, 24), new THREE.MeshStandardMaterial({ color: '#EDE5D6', roughness: 0.42 }));
marble.position.set(80, 60, 0); scene.add(marble);
const T = {
  dawn: { el: 24, az: 55, sun: '#FFD6A6', sunI: 2.9, hs: '#C4CCDD', hg: '#B69C78', hI: 0.5, envI: 0.45, exp: 0.92 },
  noon: { el: 62, az: 100, sun: '#FFF4E4', sunI: 3.1, hs: '#C8D6E8', hg: '#BCA887', hI: 0.55, envI: 0.5, exp: 0.85 },
  dusk: { el: 12, az: 195, sun: '#FFB07A', sunI: 2.8, hs: '#A9AFCB', hg: '#A88A6C', hI: 0.5, envI: 0.45, exp: 0.95 },
  night: { el: 52, az: 230, sun: '#9FB5E0', sunI: 0.3, hs: '#23355A', hg: '#1E1A24', hI: 0.35, envI: 0.35, exp: 1.1 },
};
let envRT = null, cur = 'dawn';
window.__S = {
  sky, T,
  set(k, over = 0) {
    const t = T[k]; cur = k;
    const el = THREE.MathUtils.degToRad(t.el), az = THREE.MathUtils.degToRad(t.az);
    const dir = new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
    sun.position.copy(dir).multiplyScalar(1600); sun.color.set(t.sun); sun.intensity = t.sunI;
    hemi.color.set(t.hs); hemi.groundColor.set(t.hg); hemi.intensity = t.hI;
    sky.set(k, dir); sky.setOvercast(over);
    scene.fog.color.copy(sky.fogColor);
    renderer.toneMappingExposure = t.exp; scene.environmentIntensity = t.envI;
    if (envRT) envRT.dispose(); envRT = pm.fromScene(sky.envScene, 0, 1, 1000); scene.environment = envRT.texture;
    return dir;
  },
  // look toward azimuth az (deg, 0 = +x/east, 90 = +z/south), elevation el (deg), from a point 60 up
  look(az, el = 6, y = 60, back = 0) {
    y = window.__LAB_Y || y;
    const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
    camera.position.set(-Math.cos(a) * back, y, -Math.sin(a) * back);
    camera.lookAt(camera.position.x + Math.cos(a) * Math.cos(e), y + Math.sin(e), camera.position.z + Math.sin(a) * Math.cos(e));
    sky.dome.position.copy(camera.position);
  },
  render() { sky.update(0); renderer.render(scene, camera); },
};
window.__S.set('dawn'); window.__S.look(55, 6); window.__S.render();
window.__ready = true;
