import './fix56.js';   // ── build 56ב ── FIRST: the tester's chosen stage into the page's address, before any module reads it ── /build 56ב ──
import { installTester56 } from './tester56.js';   // ── build 56ב ── the tester's stage menu ── /build 56ב ──
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { Pass } from 'three/addons/postprocessing/Pass.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { Batch, groundAO } from './batch.js';
import * as TX from './tex.js';
import { buildTemple, buildMenorot, MENOROT } from './temple.js';
import { buildMount, buildStreet, SQUARE } from './mount.js';
import { terrainH, buildTerrain, buildTrees } from './world.js';
import { createSky } from './sky.js';   // ── world6 ── the sky, the clouds, the far hills (one dome draw call)
import { buildJerusalem, BEAUTY } from './city.js';   // ── world6 ── Jerusalem: walls, towers, palace, pools, stepped street, houses
import { buildLife } from './life.js';
import { setCam as setCam28 } from './light28.js';   // ── light28 ── ── /light28 ──
import { PROF } from './prof30.js';   // ── shift30 ── ── /shift30 ──
import { createStages } from './stages.js';
import { createAvodah3D } from './avodah3d.js';
import { BLOOD } from './avodah/works/blood.js';   // ── blooda25 ── (the red line's colour: the palette's one source)   // ── avodah3d ── (Life agent; used in the marked block in boot)
import { createWater } from './water.js';   // ── water ──
import { INFO } from './info.js';
import { createGame } from './game/index.js';
// ── build6 ── (BUILD, wave 6) the Phase A parts: MATCH3's boards, KINGS' courts, FUN's precision games (FUN's loop hooks come
// through game/hooks). build.mjs stubs a part whose files are absent (a branch built alone); the game guards every call.
import * as match3 from './match3/index.js';
import * as kings from './kings/index.js';
import * as minigames from './game/minigames/index.js';
// ── /build6 ──
// ── games10 ── (GAMES10, wave 10) the classic in-between games, each also a duel on one phone (src/games): the menu's section
// opens them (ui.js `// ── games10 ──`); they pay through the game's own api (state · save · ui) and hold the 3D loop while open
import * as games from './games/index.js';
games.bindHost({ game: () => game, pause: (on) => pauseWorld(on), world: () => (avodah ? null : stages), project: (x, y, z) => view.project(x, y, z), camPos: () => camera.position });   // (FUN11: the game table's sign)
// ── /games10 ──
import { createSanctuary } from './sanctuary.js';   // ── sanctuary ──
import { createCrews } from './crews.js';   // ── crews ──
import { createCrowd } from './crowd.js';   // ── crowd ──
// ── build8 ── (FLOW8B, wave 8B) true facts in rotation: FACTS8B's content/facts.json (on a lone branch build.mjs stubs it as
// []: the game's own verified texts stand in). The loading screen shows one the save has not seen: a new one on every open.
import FACTS from '../content/facts.json';
import { setFacts, bootFact } from './game/facts.js';
setFacts(FACTS);
try { bootFact(document.getElementById('load')); } catch (e) { /* no loader (a test page) */ }
// ── /build8 ──

const $ = (id) => document.getElementById(id);
const canvas = $('c');
const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || Math.min(screen.width, screen.height) < 700;
const Q = { level: window.__FORCE_Q || (isMobile ? 'normal' : 'high') };
let paused = false;
const reducedMotion = typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
// game mode (default): the Phase A game drives the construction layer; the whole-Temple view is visual only
let game = null, wholeView = false;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, powerPreference: 'high-performance', stencil: false });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, Q.level === 'high' ? 2 : 1.5));
renderer.setSize(innerWidth, innerHeight, false);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.shadowMap.autoUpdate = false;

const scene = new THREE.Scene();
scene.fog = new THREE.Fog('#EAD6BA', 500, 7000);   // ── world6 ── aerial perspective: near/far and colour per time preset (setTime)
const camera = new THREE.PerspectiveCamera(32, innerWidth / innerHeight, 4, 12000);
camera.position.set(1500, 700, -700);
setCam28(camera);   // ── light28 ── (nearDim: the glows and the torches by the camera's distance) ── /light28 ──
const controls = new OrbitControls(camera, canvas);
controls.target.set(-60, 20, 0);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.minDistance = 35; controls.maxDistance = 2400;
controls.maxPolarAngle = 1.46;
controls.screenSpacePanning = false;
controls.autoRotateSpeed = 0.35;
controls.rotateSpeed = 0.7; controls.zoomSpeed = 1.1;

const pmrem = new THREE.PMREMGenerator(renderer);
const tick = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));
const prog = (p, txt) => { const b = $('lb'), t = $('lt'); if (b) b.style.width = (p * 100).toFixed(0) + '%'; if (txt && t) t.textContent = txt; };

/* ───────── materials ───────── */
function makeMats() {
  const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  const T = {
    ash: TX.texAshlar(7), ashBig: TX.texAshlar(13, 1024, [36, 28, 73], 11, [0.16, 0.42]), ash2: TX.texAshlar(9, 1024, [34, 16, 68]), pave: TX.texPaving(17), marble: TX.texMarble(23),
    plaster: TX.texPlaster(41), roof: TX.texRoof(53), wood: TX.texWood(61), ground: TX.texGround(71), lattice: TX.texLattice(),
    puff: TX.texPuff(), flame: TX.texFlame(), rock: TX.texRock(91),
  };
  for (const v of Object.values(T)) for (const t of (v.isTexture ? [v] : Object.values(v))) t.anisotropy = aniso;
  const std = (o) => new THREE.MeshStandardMaterial(o), n = (a) => new THREE.Vector2(a, a);
  const mats = {
    ash: { mat: groundAO(std({ map: T.ash.map, normalMap: T.ash.normalMap, normalScale: n(1.1), roughness: 0.86 }), { macro: 0.1 }), tile: 24 },
    ashBig: { mat: groundAO(std({ map: T.ashBig.map, normalMap: T.ashBig.normalMap, normalScale: n(1.2), roughness: 0.88 }), { macro: 0.12 }), tile: 30 },
    ash2: { mat: groundAO(std({ map: T.ash2.map, normalMap: T.ash2.normalMap, normalScale: n(1.1), roughness: 0.92 })), tile: 22 },
    pave: { mat: groundAO(std({ map: T.pave.map, normalMap: T.pave.normalMap, normalScale: n(0.7), roughness: 0.9 }), { macro: 0.14 }), tile: 24 },
    marble: { mat: groundAO(std({ map: T.marble.map, normalMap: T.marble.normalMap, normalScale: n(1.35), roughness: 0.34, envMapIntensity: 0.9 })), tile: 19.2 },
    marbleIn: { mat: groundAO(std({ map: T.marble.map, normalMap: T.marble.normalMap, color: '#A89F92', roughness: 0.5, envMapIntensity: 0.4 })), tile: 19.2 },
    wmarble: { mat: groundAO(std({ color: '#EDE5D6', roughness: 0.42, envMapIntensity: 0.7 })), tile: 10 },
    plaster: { mat: groundAO(std({ map: T.plaster.map, normalMap: T.plaster.normalMap, normalScale: n(0.8), roughness: 0.95 })), tile: 10 },
    gold: { mat: std({ color: '#E9B949', metalness: 1, roughness: 0.24, envMapIntensity: 1.3 }), tile: 5 },
    bronze: { mat: std({ color: '#D9A060', metalness: 1, roughness: 0.3, envMapIntensity: 1.2 }), tile: 5 },
    cedar: { mat: groundAO(std({ map: T.wood.map, color: '#E8BE93', roughness: 0.72 })), tile: 4 },
    oak: { mat: std({ map: T.wood.map, color: '#B08A62', roughness: 0.7 }), tile: 4 },
    roof: { mat: std({ map: T.roof.map, normalMap: T.roof.normalMap, roughness: 0.78 }), tile: 8 },
    dark: { mat: std({ color: '#2C2118', roughness: 1 }), tile: 10, cast: false },
    red: { mat: std({ color: BLOOD.line, roughness: 0.93 }), tile: 10, cast: false },   // ── blooda25 ── the חוט הסיקרא: matte, the palette's line (DAM25 §2.1) ── /blooda25 ──
    iron: { mat: std({ color: '#3D3935', metalness: 0.6, roughness: 0.5 }), tile: 10, cast: false },
    water: { mat: std({ color: '#5A8BA6', roughness: 0.06, metalness: 0.1, envMapIntensity: 1.3 }), tile: 10, cast: false },
    lattice: { mat: std({ color: '#EFE3C8', alphaMap: T.lattice, alphaTest: 0.5, side: THREE.DoubleSide, roughness: 0.8 }), tile: 2, cast: false },
    clay: { mat: std({ color: '#B8784C', roughness: 0.8 }), tile: 10 },
    ashpile: { mat: std({ color: '#B9B3AA', roughness: 1 }), tile: 10, cast: false },
    // ── light28 ── the תפוח: grey-brown ash, its darker rim, the dust at its foot (the owner's shot 4: a white blob) ── /light28 ──
    tapuach28: { mat: std({ color: '#8C867E', roughness: 1 }), tile: 10, cast: true }, tapuachRim28: { mat: std({ color: '#55504A', roughness: 1 }), tile: 10, cast: false }, tapuachDust28: { mat: std({ color: '#A9A49D', roughness: 1 }), tile: 10, cast: false },
  };
  return { mats, T };
}

function columnGeo() {
  const parts = [
    new THREE.CylinderGeometry(1.6, 1.75, 1.2, 14).translate(0, 0.6, 0),
    new THREE.CylinderGeometry(1.1, 1.22, 22, 14).translate(0, 12.2, 0),
    new THREE.CylinderGeometry(1.75, 1.12, 1.6, 14).translate(0, 24, 0),
    new THREE.BoxGeometry(3.6, 0.8, 3.6).translate(0, 25.2, 0),
  ].map((g) => { g = g.toNonIndexed(); for (const a of Object.keys(g.attributes)) if (a !== 'position' && a !== 'normal') g.deleteAttribute(a); return g; });
  const g = mergeGeometries(parts);
  g.setAttribute('aBase', new THREE.BufferAttribute(new Float32Array(g.attributes.position.count), 1));
  return g;
}

/* ───────── lights, sky ───────── */
const hemi = new THREE.HemisphereLight('#BFD6EE', '#CDB894', 1.0);
scene.add(hemi);
const sun = new THREE.DirectionalLight('#ffffff', 3);
sun.castShadow = true;
sun.target.position.set(-12, 0, -40);
scene.add(sun, sun.target);
{
  const sc = sun.shadow.camera; sc.left = -600; sc.right = 600; sc.top = 600; sc.bottom = -600; sc.near = 100; sc.far = 3400;
  const S = Q.level === 'high' ? 4096 : 2048; sun.shadow.mapSize.set(S, S);
  sun.shadow.bias = -0.0003; sun.shadow.normalBias = 0.5;
}
// ── world6 ── the sky (src/sky.js): gradient, sun, haze, far hills and Moab, horizon cumulus, a lit cloud layer, the moon
const sky = createSky();
scene.add(sky.dome);
// ── end world6 ──

const TIMES = {
  dawn: { el: 14, az: 20, sun: '#FFC792', sunI: 3.05, hs: '#B9C4DA', hg: '#B69C78', hI: 0.45, envI: 0.45, top: '#5A84C2', hor: '#F2D2AC', bot: '#CDB38F', fog: '#E8D5BC', exp: 0.92, smoke: '#DED5CA', fire: 110, bloom: 0.22, bloomT: 1.8, night: false },   // ── world6 ── an hour after sunrise (Sukkot: the sun low in the east-south-east; was el 24, az 55): warm, long shadows, the Heichal's face lit
  noon: { el: 62, az: 100, sun: '#FFF4E4', sunI: 2.95, hs: '#C8D6E8', hg: '#BCA887', hI: 0.55, envI: 0.5, top: '#4A7FC3', hor: '#D9E6F0', bot: '#CFBC99', fog: '#DCE4EA', exp: 0.72, smoke: '#E8E4DD', fire: 80, bloom: 0.18, bloomT: 1.9, night: false },   // ── world6 ── exp 0.85 → 0.8: the white marble and the pale paving kept their courses at noon   // ── world7 ── sunI 3.1 → 2.95, exp 0.8 → 0.72: the pale paving of the site no longer burns to white on a phone at noon
  dusk: { el: 12, az: 195, sun: '#FFBA6E', sunI: 2.8, hs: '#A3B0D2', hg: '#A88A6C', hI: 0.6, envI: 0.5, top: '#4A5D99', hor: '#F2B385', bot: '#B89A78', fog: '#E4B894', exp: 0.95, smoke: '#CBB9A9', fire: 160, bloom: 0.28, bloomT: 1.6, night: false },   // ── world7 ── a fuller sky fill (hI 0.5 → 0.6, envI 0.45 → 0.5) and a less pink sun: the slopes and courts turned from the sun no longer sink into maroon
  golden: { el: 6.5, az: 16, sun: '#FFA24E', sunI: 3.1, hs: '#9AADDA', hg: '#A27A58', hI: 0.36, envI: 0.4, top: '#3A70C0', hor: '#FFB266', bot: '#C8A884', fog: '#EFCB9E', exp: 0.93, smoke: '#E0CFC0', fire: 110, bloom: 0.26, bloomT: 1.7, night: false },   // ── world7 ── the golden hour: the opening vision + BEAUTY only (the real clock never selects it); the sun just over the Mount of Olives
  night: { el: 38, az: 40, sun: '#A8BEEA', sunI: 0.9, hs: '#2E4576', hg: '#27232E', hI: 0.5, envI: 0.48, top: '#081430', hor: '#23355F', bot: '#141822', fog: '#1D2A48', exp: 1.22, smoke: '#5E5A58', fire: 900, bloom: 0.6, bloomT: 1.0, night: true },   // ── world7 ── the night reads on a phone: the full moon of Sukkot, up in the south-east, lights the stone and the Ulam's face (was el 52, az 230 — from the north-west —, sunI 0.3, hI 0.35, exp 1.1)
  // ── polish23 ── the Temple day's night (Phase B under two thumbs): dark — the moon only a pale edge, the altar fire, the menorot and the אמרכל's torch the only lights (skyFor → 'nightd'; the Phase A / portrait night above is unchanged)
  nightd: { el: 38, az: 40, sun: '#8FA6D8', sunI: 0.1, hs: '#22345C', hg: '#1B1A24', hI: 0.1, envI: 0.08, top: '#050B1E', hor: '#16213F', bot: '#0E1118', fog: '#121B33', exp: 1.05, smoke: '#4A4846', fire: 230, menK: 0.12, bloom: 0.7, bloomT: 0.9, night: true },
  // ── /polish23 ──
  // ── recovered (16–26c) ── before dawn (reached by mixTime from the dark night): the sun's grey-blue first light low in the east, the fire small
  predawn: { el: 9, az: 8, sun: '#93A6D6', sunI: 0.75, hs: '#40527E', hg: '#2C2832', hI: 0.42, envI: 0.2, exp: 1.1, smoke: '#5A5652', fire: 70, menK: 0.12, bloom: 0.6, bloomT: 0.95, night: true },
};
// ── world6 ── per preset: the aerial perspective (fog near/far, amot; its colour is the sky's haze) and the colour grade folded
// into the OutputPass (after ACES, linear): sat = saturation, gain = highlights' tint, lift = shadows' tint, vig = vignette
const GRADE = {
  dawn: { fogN: 480, fogF: 7400, sat: 1.08, gain: [1.035, 1.0, 0.955], lift: [0.004, 0.005, 0.011], vig: 0.2 },
  noon: { fogN: 650, fogF: 8200, sat: 1.07, gain: [1.0, 1.0, 0.985], lift: [0.002, 0.003, 0.006], vig: 0.14 },
  dusk: { fogN: 520, fogF: 7800, sat: 1.12, gain: [1.05, 1.0, 0.9], lift: [0.01, 0.003, 0.016], vig: 0.24 },   // ── world7 ── gain G 0.985 → 1.0: the evening stone golden rather than salmon
  golden: { fogN: 700, fogF: 9500, sat: 1.15, gain: [1.07, 1.0, 0.91], lift: [0.004, 0.006, 0.02], vig: 0.25 },   // ── world7 ──
  night: { fogN: 420, fogF: 6800, sat: 0.95, gain: [0.95, 0.99, 1.07], lift: [0.006, 0.01, 0.022], vig: 0.26 },   // ── world7 ── (was fogN 300, fogF 5200, lift 0/.003/.01, vig .3: the far city and hills melted into black)
  nightd: { fogN: 380, fogF: 6200, sat: 0.92, gain: [0.95, 0.99, 1.07], lift: [0.003, 0.006, 0.016], vig: 0.34 },   // ── polish23 ──
  predawn: { fogN: 420, fogF: 6600, sat: 0.95, gain: [1.0, 0.98, 1.05], lift: [0.008, 0.008, 0.02], vig: 0.3 },   // ── recovered (16–26c) ──
};
const RAIN_FOG = { fogN: 120, fogF: 2600 };
// ── end world6 ──
const VIEWS = {
  olives: { p: [601, 301, -215], t: [-60, 20, 0] },
  facade: { p: [58, 86, 40], t: [-80, 52, 0] },
  altar: { p: [-2, 44, 44], t: [-40, 21, -5] },
  kotel: { p: [-660, 64, 560], t: [-300, -18, 250] },
  royal: { p: [200, 120, 790], t: [-40, -12, 380] },
  top: { p: [-30, 1000, 60], t: [-30, 0, -20] },
  // ── sanctuary ── inside the Heichal, looking west (≥ 35 amot to the target: the orbit's minimum outside)
  heichal: { p: [-100, 26.5, 0], t: [-136, 23.5, 0] },
};
let composer, bloom, aoWrap, life, stages, clouds = [], nightG, lamps, squareG, picks = [], envRT = null, curTime = 'dawn', phase = 'complete';
let grade = null, city = null, poolsWet = false, torches = null;   // ── world6 ── the OutputPass's grade uniforms; Jerusalem (src/city.js); WATER's pools
let sanct = null;   // ── sanctuary ── the house inside (sanctuary.js, PROJECT.md §12 world.sanctuary)

class HideDuring extends Pass {
  constructor(inner, objs) { super(); this.inner = inner; this.objs = objs; this.needsSwap = inner.needsSwap; this.clear = inner.clear; }
  setSize(w, h) { this.inner.setSize(w, h); }
  render(r, wb, rb, dt, m) {
    const v = this.objs.map((o) => o.visible);
    this.objs.forEach((o) => { o.visible = false; });
    this.inner.render(r, wb, rb, dt, m);
    this.objs.forEach((o, i) => { o.visible = v[i]; });
  }
  dispose() { this.inner.dispose(); }
}

function makeComposer(fxObjs) {
  const w = innerWidth, h = innerHeight, pr = renderer.getPixelRatio();
  const rt = new THREE.WebGLRenderTarget(w * pr, h * pr, { type: THREE.HalfFloatType, samples: Q.level === 'high' ? 4 : 2 });
  composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(pr); composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, camera));
  if (Q.level === 'high') {
    const gtao = new GTAOPass(scene, camera, w, h);
    gtao.updateGtaoMaterial({ radius: 7, distanceExponent: 1.4, thickness: 3, scale: 1.1, samples: 12, distanceFallOff: 1 });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 12 });
    gtao.blendIntensity = 0.8;
    aoWrap = new HideDuring(gtao, fxObjs);
    composer.addPass(aoWrap);
  }
  bloom = new UnrealBloomPass(new THREE.Vector2(w, h), TIMES[curTime].bloom, 0.45, TIMES[curTime].bloomT);
  composer.addPass(bloom);
  // ── world6 ── the colour grade, folded into the OutputPass (no extra pass): saturation, split toning, a soft vignette
  const out = new OutputPass();
  grade = { uSat: { value: 1 }, uGain: { value: new THREE.Vector3(1, 1, 1) }, uLift: { value: new THREE.Vector3() }, uVig: { value: 0 } };
  Object.assign(out.uniforms, grade);
  out.material.fragmentShader = out.material.fragmentShader
    .replace('varying vec2 vUv;', 'varying vec2 vUv;\nuniform float uSat, uVig; uniform vec3 uGain, uLift;')
    .replace('// color space', `{ vec3 g = gl_FragColor.rgb; float l = dot(g, vec3(0.2126, 0.7152, 0.0722));
        g = max(mix(vec3(l), g, uSat), 0.0); g = g * uGain + uLift * (1.0 - clamp(g, 0.0, 1.0));
        vec2 q = vUv - 0.5; gl_FragColor.rgb = g * (1.0 - uVig * dot(q, q) * 1.5); }
      // color space`);
  composer.addPass(out);
  applyGrade();
  // ── end world6 ──
}
// ── world6 ── the grade and the fog of the current preset (the rain thickens both)
function applyGrade() {
  const G = GRADE[curTime] || GRADE.dawn, k = sky.overcast;
  scene.fog.near = G.fogN + (RAIN_FOG.fogN - G.fogN) * k; scene.fog.far = G.fogF + (RAIN_FOG.fogF - G.fogF) * k;
  scene.fog.color.copy(sky.fogColor);
  if (!grade) return;
  grade.uSat.value = G.sat - 0.2 * k; grade.uGain.value.set(...G.gain); grade.uLift.value.set(...G.lift); grade.uVig.value = G.vig;
}
// ── end world6 ──

function setTime(k) {
  const t = TIMES[k]; curTime = k;
  const el = THREE.MathUtils.degToRad(t.el), az = THREE.MathUtils.degToRad(t.az);
  const dir = new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  sun.position.copy(sun.target.position).addScaledVector(dir, 1600);
  sun.color.set(t.sun); sun.intensity = t.sunI;
  hemi.color.set(t.hs); hemi.groundColor.set(t.hg); hemi.intensity = t.hI;
  sky.set(k, dir); applyGrade();   // ── world6 ── the sky, its haze = the fog, the grade
  if (t.night) nightSky();   // ── world12 ── the moon at its phase by the Hebrew date, a clear sky on a dry night ── /world12 ──
  renderer.toneMappingExposure = t.exp;
  scene.environmentIntensity = t.envI;
  if (envRT) envRT.dispose();
  envRT = pmrem.fromScene(sky.envScene, 0, 1, 1000);
  scene.environment = envRT.texture;
  if (city) city.setTime(k);   // ── world6 ── the city's lamps, oven smoke
  life.setNight(t.night, t.fire, t.smoke, t.menK);   // ── polish23 ── (t.menK: the dark night's)
  nightG.visible = t.night && phase === 'complete'; lamps.visible = t.night;
  if (k === 'dusk') { lamps.visible = true; lamps.material.opacity = 0.5; } else lamps.material.opacity = 1;   // ── world6 ── the city's first lamps at dusk
  lamps.material.size = t.night ? 4.6 : 3.2;   // ── world7 ── at night the lamps and torches read as lights on a phone (the bloom haloes them)
  if (bloom) { bloom.strength = t.bloom; bloom.threshold = t.bloomT; }
  renderer.shadowMap.needsUpdate = true;
  document.querySelectorAll('[data-time]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.time === k ? 'true' : 'false'));
}

// ── recovered (16–26c) ── a time between two presets, a → b by k (0…1; k ≥ 1 is setTime(b)): the sun, the hemisphere, the
// exposure, the sky (sky.mix), the fog and the grade, the bloom; the environment map is re-rendered at each fifth of the way
const mixCol = new THREE.Color();
let mixEnvK = -1;
function mixTime(a, b, k) {
  const A = TIMES[a], B = TIMES[b], GA = GRADE[a], GB = GRADE[b];
  if (!A || !B || !GA || !GB) return false;
  if (!(k < 1)) { mixEnvK = -1; setTime(b); return true; }
  if (curTime !== a) setTime(a);
  const at = (x, y) => x + (y - x) * k, col = (c, x, y) => c.set(x).lerp(mixCol.set(y), k), arr = (f) => GA[f].map((v, i) => at(v, GB[f][i]));
  const el = THREE.MathUtils.degToRad(at(A.el, B.el)), az = THREE.MathUtils.degToRad(at(A.az, B.az));
  const dir = new THREE.Vector3(Math.cos(el) * Math.cos(az), Math.sin(el), Math.cos(el) * Math.sin(az));
  sun.position.copy(sun.target.position).addScaledVector(dir, 1600);
  col(sun.color, A.sun, B.sun); sun.intensity = at(A.sunI, B.sunI);
  col(hemi.color, A.hs, B.hs); col(hemi.groundColor, A.hg, B.hg); hemi.intensity = at(A.hI, B.hI);
  renderer.toneMappingExposure = at(A.exp, B.exp);
  scene.environmentIntensity = at(A.envI, B.envI);
  sky.mix(b, k, dir);
  scene.fog.near = at(GA.fogN, GB.fogN); scene.fog.far = at(GA.fogF, GB.fogF); scene.fog.color.copy(sky.fogColor);
  if (grade) { grade.uSat.value = at(GA.sat, GB.sat); grade.uGain.value.set(...arr('gain')); grade.uLift.value.set(...arr('lift')); grade.uVig.value = at(GA.vig, GB.vig); }
  if (bloom) { bloom.strength = at(A.bloom, B.bloom); bloom.threshold = at(A.bloomT, B.bloomT); }
  if (((k * 5) | 0) !== mixEnvK) { mixEnvK = (k * 5) | 0; envRT.dispose(); envRT = pmrem.fromScene(sky.envScene, 0, 1, 1000); scene.environment = envRT.texture; renderer.shadowMap.needsUpdate = true; }
  return true;
}

/* ───────── camera flights ───────── */
let fly = null, lastInput = performance.now();
let twinCam = false;   // ── twin17 ── the follow camera is on (src/game/twin.js writes the camera; the director's flights wait) ── /twin17 ──
// generic flight to a camera position / target (used by the views and by stages.focus)
function flyToPos(p1, c1, dur = 2300) {
  if (twinCam) return;   // ── twin17 ── (workFrame, dealFrame, lookAt, focus: not while it follows him — twin.js lets go for a moment) ── /twin17 ──
  fly = { s: performance.now(), dur, p0: camera.position.clone(), c0: controls.target.clone(), p1: p1.clone(), c1: c1.clone() };
  controls.autoRotate = false; lastInput = performance.now();
}
function flyTo(k, dur = 2300) {
  const v = VIEWS[k];
  flyToPos(new THREE.Vector3(...v.p), new THREE.Vector3(...v.t), dur);
  if (squareG) squareG.visible = k === 'top';
  document.querySelectorAll('[data-view]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === k ? 'true' : 'false'));
  if (k === 'top') showInfo('har'); else hideInfo();
}
function stepFly(now) {
  if (!fly) return;
  let u = (now - fly.s) / fly.dur; if (u > 1) u = 1;
  const e = u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
  camera.position.lerpVectors(fly.p0, fly.p1, e);
  camera.position.y += Math.sin(Math.PI * e) * fly.p0.distanceTo(fly.p1) * 0.12;
  controls.target.lerpVectors(fly.c0, fly.c1, e);
  if (u >= 1) fly = null;
}
function clampCam() {
  const p = camera.position, onMount = p.x > -310 && p.x < 290 && p.z > -490 && p.z < 410;
  const minY = onMount ? (stages && typeof stages.camFloor === 'function' ? stages.camFloor(p.x, p.z) : 7) : terrainH(p.x, p.z) + 14;   // ── site9 ── (the Mount's walls: 8 over the ground there)
  if (p.y < minY) p.y = minY;
  const t = controls.target;
  t.x = THREE.MathUtils.clamp(t.x, -1800, 1800); t.z = THREE.MathUtils.clamp(t.z, -1800, 1800); t.y = THREE.MathUtils.clamp(t.y, -60, 160);
}

/* ───────── picking + info card ───────── */
let sel = null;
function showInfo(id, box) {
  const I = INFO[id]; if (!I) return;
  $('ct').textContent = I.t; $('cd').textContent = I.d;
  // every content card is a draft until the owner approves it (PROJECT.md §2.2): the pill is always shown (QA P1-1)
  $('cs').textContent = String(I.s || '').replace(/\s*·\s*טיוטה$/, ''); const pill = document.createElement('span'); pill.className = 'pill'; pill.textContent = 'טיוטה'; $('cs').appendChild(pill);
  measureDock();   // ── ui ── (QA P2-1) above the panel docked at the bottom, from the first frame
  $('card').classList.add('on'); $('card').setAttribute('aria-hidden', 'false');
  sel = box || null;
}
function hideInfo() { $('card').classList.remove('on'); $('card').setAttribute('aria-hidden', 'true'); sel = null; }
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), hit = new THREE.Vector3();
function pickAt(cx, cy) {
  // Phase B: while a mini-game or a key moment is on screen, a tap belongs to it — never open an info card under it
  if (avodah && avodah.busy) return;
  if (document.body.classList.contains('sh-on')) return;   // ── shift29 ── (in a shift a tap on the court is a miss, never a card over the round) ── /shift29 ──
  ndc.set(cx / innerWidth * 2 - 1, -(cy / innerHeight) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const inGame = game && !wholeView;
  // ── site16 ── a tap on a worker (before the sites' boxes: he stands in front of them): the player's crew by his name, or
  // Herod's workers (the life layer: fiction, marked)
  if (inGame && typeof stages.pickPerson === 'function') {
    {
      const pp = stages.pickPerson(ray);
      if (pp) {
        const G = game.state, name = G && typeof G.name === 'string' && G.name.trim() ? G.name.trim() : null;
        if (pp.kind === 'crew') INFO.crew16 = { t: name ? `הצוות של ${name}` : 'הצוות שלך', d: 'אחד הצוותים שלך בבניין: בנאים, סבלים ואנשי החבלים של המנוף. צבע הצעיף — צבע הצוות.', s: 'המחשה · טיוטה' };
        else INFO.crew16 = { t: 'פועלי הורדוס · המחשה', d: 'פועלים מכל הארץ עובדים בבניין — אלפי פועלים, ובהם כוהנים שלמדו את מלאכת האבן. הדמויות כאן: המחשה.', s: 'יוספוס, קדמוניות היהודים טו, יא, ב · המחשה' };
        hideInfo(); showInfo('crew16', null); return;
      }
    }
  }
  // ── /site16 ──
  if (inGame) {
    const g = stages.pick(ray);
    if (g && g.kind === 'boulder') { hideInfo(); game.onBoulderTap(g.index); return; }
    if (g && g.kind === 'site') { hideInfo(); game.onSiteTap(g.id); return; }
    if (g && g.kind === 'quarry') { hideInfo(); game.onQuarryTap(); return; }
    // ── site11 ── (PRODUCER10 top-10 #6) the game table by the quarry opens the in-between games (FUN11's opener, guarded)
    if (g && g.kind === 'table') { const T = globalThis.__BH_PARTS && globalThis.__BH_PARTS.games; if (T && typeof T.table === 'function' && !game.busy) { hideInfo(); try { Promise.resolve(T.table()).catch(() => {}); } catch (e) { /* FUN11's */ } return; } }
    // ── /site11 ──
    if (typeof game.onMissTap === 'function' && game.onMissTap()) { hideInfo(); return; }   // ── build8 ── (FLOW8B) a tap beside the target strikes it
  }
  // ── sanctuary ── the vessels and the places of the service (the nearer of it and the world's picks wins)
  const sv = sanct ? sanct.pick(ray) : null;
  let best = null, bd = Infinity;
  for (const p of picks) {
    if (p.night && curTime !== 'night') continue;
    if (inGame && !p.stage) continue;                               // game mode: only finished build stages
    if (p.stage && stages && !stages.isDone(p.stage)) continue;   // nothing to identify on an unbuilt site
    if (ray.ray.intersectBox(p.box, hit)) { const d = hit.distanceTo(ray.ray.origin); if (d < bd) { bd = d; best = p; } }
  }
  if (sv && INFO[sv.id] && (!best || sv.dist <= bd + 0.5)) { tapInfo(sv.id, sv.box || null); return; }   // ── sanctuary ──
  if (best) tapInfo(best.id, best.box); else hideInfo();
}
// ── land17 ── (PRINCIPLES §0.5) a tap on a place: with the setting "חלונות מידע: רק בספר" no card opens — a float "נוסף לספר" and the
// place's text is kept in the book (game.noteInfo, src/game/index.js). A place link from the book itself (hooks.showInfo) still opens its card.
function tapInfo(id, box) {
  try { if (game && !wholeView && typeof game.noteInfo === 'function' && game.noteInfo(id, INFO[id])) { hideInfo(); return; } } catch (e) { /* the game's */ }
  showInfo(id, box);
}
// ── /land17 ──
const mk = $('mk'), mv = new THREE.Vector3();
const projV = new THREE.Vector3(), projOut = { x: 0, y: 0, on: false };
const view = {
  project(x, y, z) {
    projV.set(x, y, z).project(camera);
    projOut.on = projV.z > -1 && projV.z < 1;
    projOut.x = (projV.x * 0.5 + 0.5) * innerWidth; projOut.y = (-projV.y * 0.5 + 0.5) * innerHeight;
    return projOut;
  },
  /** distance from the camera (where a flight in progress will end) to (x, y, z) */
  dist(x, y, z) { return (fly ? fly.p1 : camera.position).distanceTo(projV.set(x, y, z)); },
  /** fly the camera to look at (x, y, z) from `dist` away, azimuth/elevation in degrees (0° az = from +x/east) */
  lookAt(x, y, z, dist = 120, az = 20, el = 28, dur = 1800) {
    const a = THREE.MathUtils.degToRad(az), e = THREE.MathUtils.degToRad(el);
    const d = camera.aspect < 0.8 ? dist * 1.35 : dist;          // portrait phones need a little more room
    flyToPos(new THREE.Vector3(x + Math.cos(e) * Math.cos(a) * d, y + Math.sin(e) * d, z + Math.cos(e) * Math.sin(a) * d), new THREE.Vector3(x, y, z), dur);
  },
};
view.projectRaw = view.project;   // ── twin17 ── (the markers over the Mount's bay: no rough-hill occlusion test from the follow camera's height) ── /twin17 ──
// ── site8 ── (SITE8B, wave 8B) the camera never frames a rock through the rough Mount (the owner, 28.9: "the last two stones are
// hidden, you can't see what you strike"). The game frames a boulder with lookAt(rock, 95, 25, 30) and re-aims only when the rock
// leaves the screen (game/index.js followTarget / lookAtBoulder): here a lookAt at a boulder takes the world's boulder camera
// (stages.boulderView: the rock, the builder where he will stand and the gang, close, with a clear line of sight); any other
// lookAt on the rough Mount turns / rises until its line of sight clears (stages.clearView); and project() says `on: false`
// for a point the hill or a standing rock hides, so followTarget re-aims at a hidden rock too. Phase A only; the Mount done →
// both are as before.
{
  const lookAt0 = view.lookAt, project0 = view.project;
  // ── site9 ── (the boulder field, wave 9) the rocks where the world has them (read once the world exists)
  const BXZ = [[-172, -122], [-96, -132], [-24, -118], [60, -110], [128, -84], [178, -30], [186, 40], [124, 112], [34, 124], [-58, 118], [-142, 124], [-240, -30]];
  let bxzRead = false;
  const bxz = () => {
    if (!bxzRead && stages) { bxzRead = true; try { const bs = typeof stages.boulderSpots === 'function' ? stages.boulderSpots() : null; if (Array.isArray(bs) && bs.length === 12) bs.forEach((b, i) => { BXZ[i] = [+b[0], +b[1]]; }); } catch (e) { /* */ } }
    return BXZ;
  };
  const onRough = () => !!(stages && game && !avodah && !wholeView && typeof stages.clearView === 'function' && !stages.isDone('har'));
  view.lookAt = function (x, y, z, dist = 120, az = 20, el = 28, dur = 1800) {
    if (onRough()) {
      const bi = bxz().findIndex(([bx, bz]) => Math.abs(bx - x) < 0.6 && Math.abs(bz - z) < 0.6);
      const v = bi >= 0 && (stages.boulders || [])[bi] > 0 ? stages.boulderView(bi) : null;
      if (v) { flyToPos(new THREE.Vector3(...v.p), new THREE.Vector3(...v.t), dur); return; }
      const c = stages.clearView(x, y, z, camera.aspect < 0.8 ? dist * 1.35 : dist, az, el);
      if (c) { az = c.az; el = c.el; }
    }
    lookAt0.call(view, x, y, z, dist, az, el, dur);
  };
  view.project = function (x, y, z) {
    const o = project0.call(view, x, y, z);
    if (o.on && onRough() && stages.occluded(x, y, z, camera.position)) o.on = false;
    return o;
  };
}
// ── end site8 ──
// ── twin17 ── the follow camera (PRINCIPLES §3; src/game/twin.js): one fixed bearing, 55–60° down, soft, a small lead. twin.js
// computes it and writes it here every frame; OrbitControls' one-finger rotate (and its pan and zoom: twin.js has its own pinch)
// are off while it follows. cam: 'director' never turns it on — today's frames, untouched.
view.twinCam = (on) => {
  on = !!on; if (on === twinCam) return;
  twinCam = on; if (on) { fly = null; controls.autoRotate = false; }
  controls.enableRotate = !on; controls.enablePan = !on; controls.enableZoom = !on;
};
view.camSet = (px, py, pz, tx, ty, tz) => { fly = null; camera.position.set(px, py, pz); controls.target.set(tx, ty, tz); };
view.pickAt = (x, y) => { try { pickAt(x, y); } catch (e) { /* */ } };   // ── cam28 ── (twin.js: a single tap on the right half picks after the double-tap's window) ── /cam28 ──
view.camNow = (out) => { const o = out || {}; o.px = camera.position.x; o.py = camera.position.y; o.pz = camera.position.z; o.tx = controls.target.x; o.ty = controls.target.y; o.tz = controls.target.z; return o; };
// ── figures24 ── the works' render scale (WAVE24 "רזולוציה כללית מדי"): while a work of Phase B is on, the pixel ratio rises to
// min(devicePixelRatio, 2) unless the quality level is 'low' (or the frame-time guard, perf(), already brought it down: never above its
// last step down); back to the ratio it had when the work ends. Gated by Q.level only (SwiftShader's frame times say nothing).
let f24PR = 0;
view.workRes = (on) => {
  view.workResLog = (view.workResLog || []).slice(-9).concat([on ? 1 : 0]);   // (tests)
  if (on) {
    if (f24PR || Q.level === 'low') return renderer.getPixelRatio();
    const want = Math.min(devicePixelRatio || 1, 2); f24PR = renderer.getPixelRatio();
    if (want > f24PR + 0.01) { renderer.setPixelRatio(want); resize(); }
  } else if (f24PR) {
    const back = f24PR; f24PR = 0;
    if (Math.abs(renderer.getPixelRatio() - back) > 0.01) { renderer.setPixelRatio(Math.min(back, renderer.getPixelRatio())); resize(); }
  }
  return renderer.getPixelRatio();
};
view.pixelRatio = () => renderer.getPixelRatio();
// (the close-up, closeup.js: OrbitControls keeps the camera 35 amot from its target and the near plane is at 4 — both give way while a
// close-up holds the camera; closeCam(true) → the distance the follow camera keeps, to blend from it)
let f24Cam = null;
view.closeCam = (on) => {
  if (on && !f24Cam) { f24Cam = [controls.minDistance, camera.near]; controls.minDistance = 0.5; camera.near = 1.5; camera.updateProjectionMatrix(); }
  else if (!on && f24Cam) { [controls.minDistance, camera.near] = f24Cam; f24Cam = null; camera.updateProjectionMatrix(); }
  return f24Cam ? f24Cam[0] : controls.minDistance;
};
// ── /figures24 ──
// ── /twin17 ──
function updateMarker() {
  if (!sel) { mk.style.opacity = '0'; return; }
  sel.getCenter(mv); mv.y = sel.max.y; mv.project(camera);
  if (mv.z > 1) { mk.style.opacity = '0'; return; }
  mk.style.opacity = '1';
  mk.style.transform = `translate(${((mv.x * 0.5 + 0.5) * innerWidth).toFixed(1)}px,${((-mv.y * 0.5 + 0.5) * innerHeight).toFixed(1)}px)`;
}
let down = null, maxPtr = 0;
const active = new Set();
// ── build8 ── (FLOW8B) in the game a TAP no longer cancels the camera's glide (a strike run kept stopping the camera halfway to the
// next boulder); a drag (≥ 7 px) or a second finger still does, and outside the game (the views) any touch does, as before
// ── play ── (the owner, 6.10: "קישור שייפתח רק המשחק בנייד") opened on its own page on a phone (not inside a viewer's frame,
// not under a test driver), the first touch asks for the whole screen and, where the phone allows it, holds it sideways
{
  const fsOn = () => { try { if (window.top !== window || navigator.webdriver || document.fullscreenElement || !document.fullscreenEnabled || !matchMedia('(pointer: coarse)').matches) return; const r = document.documentElement.requestFullscreen({ navigationUI: 'hide' }); if (r && r.then) r.then(() => { try { const o = screen.orientation; if (o && o.lock) o.lock('landscape').catch(() => {}); } catch (e) { /* */ } }, () => {}); } catch (e) { /* not allowed here */ } };
  addEventListener('pointerup', fsOn, { passive: true });
}
// ── /play ──
canvas.addEventListener('pointerdown', (e) => { active.add(e.pointerId); maxPtr = Math.max(maxPtr, active.size); if (active.size === 1) { down = { x: e.clientX, y: e.clientY, t: performance.now() }; maxPtr = 1; } if (!(game && game.state && !wholeView && active.size === 1)) fly = null; controls.autoRotate = false; lastInput = performance.now(); });
canvas.addEventListener('pointermove', (e) => { if (fly && down && active.size && Math.hypot(e.clientX - down.x, e.clientY - down.y) >= 7) fly = null; });   // ── build8 ── a drag takes the camera
const up = (e) => {
  active.delete(e.pointerId);
  if (down && active.size === 0) {
    if (maxPtr === 1 && Math.hypot(e.clientX - down.x, e.clientY - down.y) < 7 && performance.now() - down.t < 450 && !(performance.now() - (globalThis.__TW_GEST || -1e9) < 700)) pickAt(e.clientX, e.clientY);   // ── fix26 ── (a two-finger gesture — one finger on the walk zone — is not a pick) ── /fix26 ──
    down = null;
  }
  lastInput = performance.now();
};
canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
canvas.addEventListener('wheel', () => { fly = null; controls.autoRotate = false; lastInput = performance.now(); }, { passive: true });

/* ───────── resize + adaptive quality ───────── */
/* ───────── the part of the screen the world can use (Phase B panels dock at the bottom on phones) ─────────
 * A bottom panel hides the lower part of the screen, so the camera's principal point moves up (a view offset): what
 * the camera looks at sits in the middle of the part that is still visible. Only while Phase B is on screen. */
let viewOff = 0, viewOffGoal = 0;
let viewOffX = 0, viewOffXGoal = 0;   // ── world ── (wave 4) a panel docked at the right of a wide screen: the principal point moves left
function measureSafeArea() {
  const H = innerHeight;
  let goal = 0;
  if ((document.body.classList.contains('av-on') || document.body.classList.contains('sc-on')) && innerWidth < 760 && innerHeight > innerWidth) {
    const el = document.querySelector('.sc-root .sc-panel, .av-mg.on .av-mg-card, .av-modal.on .av-card, .av-home.on');
    if (el) { const top = el.getBoundingClientRect().top; if (top > H * 0.22) goal = Math.max(0, H - top); }
  }
  // ── world ── (World agent, wave 4; QA P2-18) the scenes panel in any other layout: docked at the right of a wide screen
  // (src/avodah/scenes: the tour, the Ark, Yom Kippur), the subject moves to the middle of the part left of it; docked at the
  // bottom over the middle of the screen, the subject is lifted above it, as on a phone
  let gx = 0;
  if (!goal) {
    const el = document.querySelector('.sc-root .sc-panel');
    if (el) {
      const r = el.getBoundingClientRect(), W = innerWidth;
      if (r.left > W * 0.45 && r.height > H * 0.5) gx = Math.max(0, W - r.left + 8);
      else if (r.left < W * 0.5 && r.right > W * 0.5 && r.top > H * 0.22 && r.bottom > H - 4) goal = Math.max(0, H - r.top);
    }
  }
  // ── build 51 ── (the inspector's review §4 item 17; the build-51 brief, item 11) Phase B's practice end card on a wide screen
  // stands on its right two-thirds (practice31): the subject — him — to the middle of the third left of it, as for a side panel
  if (!goal && !gx && innerWidth > innerHeight) {
    const c = document.querySelector('.p31-end .c');
    if (c) { const r = c.getBoundingClientRect(), W = innerWidth; if (r.left > W * 0.2 && r.height > H * 0.4) gx = Math.max(0, W - r.left + 8); }
  }
  viewOffXGoal = gx;
  // ── end world ──
  viewOffGoal = goal;
}
setInterval(measureSafeArea, 250);
// ── ui ── (QA P2-1) the tap-to-identify card (#card, page.html) sits above whatever panel is docked at the bottom under it:
// the Phase B home and cards, the tour panel, a Phase A sheet. --ui-dock is that panel's height in px (0 when none); a side
// panel on a wide screen (the Phase B home, a Phase A sheet) is not under the card, so it does not count.
// On a wide screen the card is on the right; a side panel at the left (the Phase B home, a Phase A sheet) is beside it, and
// on a tablet it reaches under it: --ui-side is that panel's right edge, and the card starts right of it.
let dockPx = -1, sidePx = -1;
function measureDock() {
  const H = innerHeight, W = innerWidth, wide = W >= 760;
  let side = 0;
  if (wide) for (const el of document.querySelectorAll('.av-home.on, .gm-sheet.on')) { const r = el.getBoundingClientRect(); if (r.height > 2 && r.left < 40 && r.bottom < H - 6) side = Math.max(side, Math.round(r.right)); }
  const cardL = wide ? Math.max(side + 12, W - 16 - 540) : 0;
  let dock = 0;
  for (const el of document.querySelectorAll('.sc-root .sc-panel, .av-mg.on .av-mg-card, .av-modal.on .av-card, .av-home.on, .gm-sheet.on')) {
    const r = el.getBoundingClientRect();
    if (r.height < 2 || r.bottom < H - 6 || r.right <= cardL || r.top < H * 0.12) continue;
    dock = Math.max(dock, Math.round(H - r.top));
  }
  if (dock !== dockPx) { dockPx = dock; document.documentElement.style.setProperty('--ui-dock', dock + 'px'); }
  if (side !== sidePx) { sidePx = side; document.documentElement.style.setProperty('--ui-side', side + 'px'); }
}
setInterval(measureDock, 250);
// ── ui ── (QA P2-10) shader programs ahead of time. A material's program depends on the target it is drawn into (the
// composer's HDR buffer: no tone mapping, linear output; compiling while the canvas is bound makes tone-mapped variants no
// frame uses) and on the number of lights. compile() covers every material in the scene, the hidden house interior and
// the service's layers included, but it counts only the lights that are on. The service's first games run before dawn,
// when the menorot's point lights come on (life.js), and every material then needs a new program: 79 at once, a hitch
// at the first game. So the Phase B entry compiles the scene once more with every light on, behind its first card
// (compileAsync: where the driver compiles in parallel nothing waits; nothing is drawn). window.__UI_COMPILE logs each run.
function precompile(label, { allLights = false } = {}) {
  const t0 = performance.now(), n0 = (renderer.info.programs || []).length, lit = [];
  if (allLights) scene.traverse((o) => { if (o.isLight && !o.visible) { lit.push(o); o.visible = true; } });
  const prev = renderer.getRenderTarget();
  let p = null;
  try {
    if (composer) renderer.setRenderTarget(composer.renderTarget1);
    // (compileAsync only where the driver compiles in parallel: asking three for a missing extension logs a warning)
    const par = renderer.compileAsync && renderer.extensions && renderer.extensions.has('KHR_parallel_shader_compile');
    p = par ? renderer.compileAsync(scene, camera) : renderer.compile(scene, camera);
  } catch (e) { console.warn('[ui] precompile', e); } finally {
    renderer.setRenderTarget(prev);
    for (const o of lit) o.visible = false;
  }
  const rec = { label, programs: [n0, (renderer.info.programs || []).length], ms: Math.round(performance.now() - t0) };
  (window.__UI_COMPILE = window.__UI_COMPILE || []).push(rec);
  return Promise.resolve(p).then(() => { rec.readyMs = Math.round(performance.now() - t0); }, () => {});
}
// ── end ui ──
function applyViewOffset() {
  const W = innerWidth, H = innerHeight, o = Math.round(viewOff), ox = Math.round(viewOffX);   // ── world ── (ox: the side panel)
  // the virtual frame is taller by o (and wider by ox); zoom out by the height's factor so the scale on screen stays the same
  if (o > 2 || ox > 2) { camera.aspect = (W + ox) / (H + o); camera.zoom = H / (H + o); camera.setViewOffset(W + ox, H + o, ox, o, W, H); } else { camera.aspect = W / H; camera.zoom = 1; camera.clearViewOffset(); }
  camera.updateProjectionMatrix();
}
function stepViewOffset(dt) {
  // ── world ── the side panel's horizontal offset eases in with the vertical one
  const nearY = Math.abs(viewOffGoal - viewOff) < 0.75, nearX = Math.abs(viewOffXGoal - viewOffX) < 0.75;
  if (nearY && nearX) { if (viewOff !== viewOffGoal || viewOffX !== viewOffXGoal) { viewOff = viewOffGoal; viewOffX = viewOffXGoal; applyViewOffset(); } return; }
  const k = Math.min(1, dt * 5);
  viewOff = nearY ? viewOffGoal : viewOff + (viewOffGoal - viewOff) * k;
  viewOffX = nearX ? viewOffXGoal : viewOffX + (viewOffXGoal - viewOffX) * k;
  // ── end world ──
  applyViewOffset();
}
function resize() {
  const w = innerWidth, h = innerHeight;
  applyViewOffset();
  renderer.setSize(w, h, false);
  if (composer) { composer.setPixelRatio(renderer.getPixelRatio()); composer.setSize(w, h); }
  const ps = h * renderer.getPixelRatio() / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)));
  if (life) life.setScale(ps);
  if (stages) stages.setScale(ps);
}
addEventListener('resize', resize);
let ft = [];
function perf(dt) {
  ft.push(dt);
  if (ft.length < 90) return;
  const avg = ft.reduce((a, b) => a + b, 0) / ft.length; ft = [];
  if (avg > 1 / 24) {
    if (aoWrap && aoWrap.enabled) aoWrap.enabled = false;
    else if (renderer.getPixelRatio() > 1) { renderer.setPixelRatio(Math.max(1, renderer.getPixelRatio() - 0.5)); resize(); }
  }
}

/* ───────── build ───────── */
async function boot() {
  prog(0.04, 'חוצבים אבנים…'); await tick();
  const { mats, T } = makeMats();
  // ── world6 ── materials up close: the marble courses read as stone, not glass; gold and bronze take more of the sky
  mats.marble.mat.roughness = 0.5; mats.marble.mat.envMapIntensity = 0.7; mats.marble.mat.normalScale.set(1, 1);   // (the courses' relief — כאדוותא דימא — kept, the colour contrast softer: white from afar, War 5.223)
  mats.gold.mat.roughness = 0.22; mats.gold.mat.envMapIntensity = 1.6; mats.gold.mat.color.set('#E2AB3A'); mats.gold.mat.emissive.set('#3A2404');   // ── world7 ── gold reads as gold: a deeper yellow, and its shaded side stays warm (not grey) under a blue sky
  mats.bronze.mat.envMapIntensity = 1.35;
  // ── end world6 ──
  prog(0.3, 'מיישרים את הר הבית…'); await tick();
  const B = new Batch(mats);
  // picks remember the build stage they belong to (B.cur) so unbuilt sites are not identified
  const P = (id, x0, y0, z0, x1, y1, z1, night) => picks.push({ id, night, stage: B.cur === '_' ? null : B.cur, box: new THREE.Box3(new THREE.Vector3(Math.min(x0, x1), Math.min(y0, y1), Math.min(z0, z1)), new THREE.Vector3(Math.max(x0, x1), Math.max(y0, y1), Math.max(z0, z1))) });
  const { cols, royal } = buildMount(B, P);
  buildStreet(B, terrainH);
  prog(0.45, 'בונים את העזרות ואת ההיכל…'); await tick();
  buildTemple(B, P);
  B.stage('_');
  city = buildJerusalem(scene, B, P, { houseTex: T.plaster });   // ── world6 ── (replaces world.js buildCity)
  B.build(scene);
  const cg = columnGeo(), cm = groundAO(new THREE.MeshStandardMaterial({ color: '#EDE5D6', roughness: 0.42, envMapIntensity: 0.7 }), { instanced: true, strength: 0.45, range: 6 });
  const columns = [{ geo: cg, mat: cm, list: cols, sxz: 1, sy: 1 }, { geo: cg, mat: cm, list: royal, sxz: 1.45, sy: 20 / 25.6 }];
  const BN = new Batch(mats); buildMenorot(BN);
  nightG = new THREE.Group(); BN.build(nightG); nightG.visible = false; scene.add(nightG);
  for (const [x, z] of MENOROT) P('menorot', x - 3.5, 6, z - 3.5, x + 3.5, 56, z + 3.5, true);
  prog(0.62, 'שותלים זיתים בהר המשחה…'); await tick();
  scene.add(buildTerrain(T.ground.map));
  buildTrees(scene, city.trees, city.olives, city.courtTrees);   // ── world6 ── (+ the palace gardens' cypresses, the olive rows on the terraces)
  lamps = new THREE.Points(city.lampGeo, new THREE.PointsMaterial({ size: 3.2, sizeAttenuation: false, color: new THREE.Color(2.6, 1.5, 0.6), map: TX.texGlow(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  lamps.visible = false; lamps.frustumCulled = false; scene.add(lamps);
  // ── world6 ── the guards' torches at the gates of the Temple Mount, with the House complete (Middot 1:1–2: the Levites keep
  // watch at its five gates; the man of the Temple Mount goes round the watches with torches before him). Where exactly: ⚑ illustration
  { const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute([285.8, 13, -8.5, 285.8, 13, 8.5, -116, -35, 400.9, -86, -35, 400.9, 10, -36, 400.9, 52, -36, 400.9, -300.9, 14, -70, -300.9, 14, -48], 3));
    torches = new THREE.Points(g, lamps.material); torches.frustumCulled = false; torches.name = 'mount-torches'; nightG.add(torches); }
  // ── end world6 ──
  clouds = sky.clouds;   // ── world6 ── (the clouds are in the sky dome now)
  // the halachic 500-amah square, shown in the plan view
  squareG = new THREE.Group();
  const sqMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.7, 1.15, 0.35), transparent: true, opacity: 0.85, depthTest: false, depthWrite: false });
  const band = (x0, z0, x1, z1) => { const g = new THREE.PlaneGeometry(Math.abs(x1 - x0), Math.abs(z1 - z0)); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, 2, (z0 + z1) / 2); const m = new THREE.Mesh(g, sqMat); m.renderOrder = 20; squareG.add(m); };
  const { x0, x1, z0, z1 } = SQUARE, W2 = 2.2;
  band(x0 - W2, z0 - W2, x1 + W2, z0 + W2); band(x0 - W2, z1 - W2, x1 + W2, z1 + W2); band(x0 - W2, z0, x0 + W2, z1); band(x1 - W2, z0, x1 + W2, z1);
  squareG.visible = false; scene.add(squareG);
  prog(0.78, 'עולי הרגל מגיעים…'); await tick();
  life = buildLife(scene, T);
  // the 15 build stages (each its own group), the hill, boulders, construction and the builder hero
  stages = createStages({
    scene, camera, controls, renderer, B, mats, T, life, columns, flyToPos,
    renderTarget: () => (composer ? composer.renderTarget1 : null),
    requestShadow: () => { renderer.shadowMap.needsUpdate = true; },
    setPhase: (ph) => { phase = ph; life.setPhase(ph); if (nightG) nightG.visible = TIMES[curTime].night && ph === 'complete'; },
  });
  // ── avodah3d ── (Life agent) world.avodah, PROJECT.md §12: kohanim, Levites, pilgrims, animals, pens and the service.
  // It is advanced inside life.update (so the loop, __T.step and __T.render all move it); its transparent helpers join
  // life.fx (hidden during the AO pass). Exposed as stages.avodah (the game reaches it through the world) and __T.avodah.
  {
    const avodah = createAvodah3D({ scene, camera, life });
    stages.avodah = avodah; window.__T.avodah = avodah;
  }
  // ── end avodah3d ──
  // ── water ── (WATER, wave 6) world.water (src/water.js): the kiyor's twelve spigots, the washing of hands and feet, the
  // drainage, the libations and the altar's shitin, the amah to the Kidron. Advanced inside life.update; its two meshes join
  // life.fx (hidden during the AO pass). Reached as stages.water (so world.water in Phase A and Phase B) and __T.water.
  // It also builds the kiyor's moving parts (temple.js sets 'kiyor-basin', 'kiyor-wheel', 'kiyor-chains') into the kiyor stage.
  try {
    const water = createWater({ scene, camera, life, stages, avodah: stages.avodah, hemi, sun, B, requestShadow: () => { renderer.shadowMap.needsUpdate = true; } });
    stages.water = water; window.__T.water = water;
    life.addUpdater(water.update);
    if (stages.avodah && stages.avodah.useWater) stages.avodah.useWater(water);
  } catch (e) {
    console.warn('[water]', e);   // the kiyor stays whole without the water layer
    const st = stages._dbg && stages._dbg.ST && stages._dbg.ST.kiyor;
    for (const id of ['kiyor-basin', 'kiyor-wheel', 'kiyor-chains']) if (B.sets[id] && Object.keys(B.sets[id]).length) B.build(st ? st.group : scene, id);
  }
  // ── end water ──
  // ── crews ── (CREWS agent) the Phase A building crews, seen at work (src/crews.js, docs/CREWS.md): people at every
  // building site by its number of crews, quarrymen, the caravans' ox-cart trains, the priests' training yard. Advanced
  // inside life.update (so the loop, __T.step and __T.render all move it); shown only while the world is in its building
  // phase, so stages.demoMode() (the whole view, Phase B, the tour) hides it and Phase A brings it back. The game reaches
  // it through the world: stages.setCrews / setQuarry / caravan / trainees / crewsCheer; tests through __T.crews.
  {
    const crews = createCrews({ scene, camera, life, stages, terrainH });
    life.addUpdater(crews.update);
    Object.assign(stages, { setCrews: crews.setCrews, setQuarry: crews.setQuarry, caravan: crews.caravan, trainees: crews.trainees, crewsCheer: crews.cheer });
    window.__T.crews = crews;
    // ── site9 ── (SITE9, wave 9) the key stone's cart for stages.deliverKeyStone (DESIGN8B M11: hewn → the cart → the crane)
    if (typeof crews.keyCart === 'function') stages.keyCart = crews.keyCart;
    // ── site16 ── the life layer and the tap card (crews.lifeCount / lifeList / pickPerson)
    Object.assign(stages, { lifeCount: crews.lifeCount, lifeList: crews.lifeList, pickPerson: crews.pickPerson, setLife: crews.setLife });
    // the Mount's working bay (stages.js harBay) is dug below the world terrain's floor under the Mount (−50): the terrain is
    // lowered there too, a little wider than the bay (its slopes stay under the hill), so the bay and its course are seen
    try {
      const HU = stages._dbg && stages._dbg.hill && stages._dbg.hill.U;
      const ter = HU && HU.uPit && scene.children.find((o) => o.isMesh && o.geometry && o.geometry.attributes.position && o.geometry.attributes.position.count === 261 * 261 && o.material && !o.material.onBeforeCompile.toString().includes('uPit'));
      if (ter) {
        ter.material.onBeforeCompile = (sh) => {
          sh.uniforms.uPit = HU.uPit; sh.uniforms.uPitK = HU.uPitK; sh.uniforms.uFill = HU.uFill;
          sh.vertexShader = sh.vertexShader.replace('#include <common>', '#include <common>\nuniform vec4 uPit; uniform float uPitK; uniform float uFill;')
            .replace('#include <begin_vertex>', `#include <begin_vertex>
              if (uPitK > 0.0 && uPit.z > uPit.x) { vec2 pq = max(uPit.xy - 8.0 - position.xz, position.xz - uPit.zw - 8.0);
                if (max(pq.x, pq.y) < 0.0) transformed.y = mix(transformed.y, min(transformed.y, uFill - 0.3), uPitK); }`);
        };
        ter.material.customProgramCacheKey = () => 'terrain-site9';
        ter.material.needsUpdate = true;
      }
    } catch (e) { console.warn('[site9] terrain bay', e); }
    // ── end site9 ──
  }
  // ── end crews ──
  // ── crowd ── (PEOPLE, wave 6) people doing real things on the Mount (src/crowd.js): activity stations chosen by the
  // world's state (the building site in Phase A; the plaza, Sukkot and the night on the finished Mount). One actors.js
  // instance: a draw call per dress kind in view + one for the items. Advanced inside life.update; stages.crowd and
  // __T.crowd for the game and the tests (crowd.setScene('site'|'plaza'|'festival'|'night'|'auto')).
  {
    const crowd = createCrowd({ scene, camera, stages, life, ground: (x, z) => stages.groundAt(x, z) });
    life.addUpdater(crowd.update);
    stages.crowd = crowd; window.__T.crowd = crowd;
  }
  // ── end crowd ──
  // ── site13 ── (the owner, 30.9 11:12: "בעזרת נשים ומצורעים לא בטוח שראיתי את זה") the name of the Ezrat Nashim's corner chamber
  // rising now (stages.finishLabel), over it on the screen: its name, what it was for, the source (טיוטה). Not a button: a
  // tap passes through. It fades out after ~7 s, and hides while it is off screen or behind the camera.
  {
    const el = document.createElement('div');
    el.className = 's13-lc'; el.dir = 'rtl'; el.setAttribute('aria-live', 'polite');
    el.style.cssText = 'position:fixed;left:0;top:0;z-index:4;pointer-events:none;transform:translate(-50%,-100%);max-width:78vw;padding:8px 14px 7px;' +
      'border-radius:14px;background:rgba(32,24,12,.72);color:#FFF4DA;text-align:center;font-family:"Frank Ruhl Libre","Heebo",serif;' +
      'box-shadow:0 2px 10px rgba(0,0,0,.35);opacity:0;transition:opacity .45s;white-space:normal;line-height:1.2';
    document.body.appendChild(el);
    let cur = -1;
    life.addUpdater(() => {
      const L = typeof stages.finishLabel === 'function' ? stages.finishLabel() : null;
      if (!L) { if (cur !== -1) { el.style.opacity = '0'; cur = -1; } return; }
      if (cur !== L.i) {
        cur = L.i;
        el.innerHTML = `<div style="font-weight:900;font-size:21px">${L.text}</div><div style="font:500 13px Heebo,sans-serif;opacity:.92;margin-top:2px">${L.sub}</div>` +
          `<div style="font:500 11px Heebo,sans-serif;opacity:.7;margin-top:2px">${L.src}</div>`;
      }
      const p = view.project(L.x, L.y, L.z), vis = p.on;
      const x = clampN(p.x, innerWidth * 0.42, innerWidth * 0.58), y = clampN(p.y, 300, innerHeight * 0.62);   // (below the game's pill, the demo strip and the coach's hand)
      el.style.left = x.toFixed(1) + 'px'; el.style.top = y.toFixed(1) + 'px';
      el.style.opacity = vis && L.t < 7 ? '1' : '0';
    });
    function clampN(v, a, b) { return v < a ? a : v > b ? b : v; }
    window.__T.lcLabel = el;
  }
  // ── /site13 ──
  stages.update(0);
  // ── sanctuary ── the Ulam, the Heichal and the Kodesh HaKodashim inside, with their vessels (world.sanctuary)
  sanct = createSanctuary({
    scene, camera, controls, renderer, stages, hemi, flyToPos, getTime: () => TIMES[curTime], clouds, stars: sky.stars,
    requestShadow: () => { renderer.shadowMap.needsUpdate = true; },
    cancelFly: () => { fly = null; },   // the sanctuary's own walks and moves replace a flight in progress
  });
  stages.sanctuary = sanct;
  // ── end sanctuary ──
  makeComposer([sky.dome, squareG, lamps, ...life.fx, ...stages.fx]);
  if (aoWrap) aoWrap.objs.push(...sanct.fx);   // ── sanctuary ──
  if (aoWrap && city && city.smoke) aoWrap.objs.push(city.smoke, ...(torches ? [torches] : []));   // ── world6 ── the oven smoke and the torches stay out of the AO pass
  // ── world7 ── the opening vision for the game (BUILD7 calls it guarded: W.vision(opts) → Promise<{ skipped }>, W.visionSkip()):
  // the game's world is Object.create(stages), so it inherits these two
  stages.vision = runVision; stages.visionSkip = skipVision;
  // ── end world7 ──
  resize();
  prog(0.9, 'מדליקים את המערכה…'); await tick();
  setTime(window.__FORCE_TIME || 'dawn');
  precompile('boot');   // ── ui ── (QA P2-10) for the composer's target (a plain renderer.compile made variants no frame used)
  composer.render(0.016);
  // game mode: compile the construction shaders behind the loader, not on the first tap
  if (!window.__NO_GAME) { prog(0.96, 'מכינים את אתר הבנייה…'); await tick(); try { await stages.prewarm(); } catch (e) { /* compiled on demand */ } }
  prog(1, 'ברוך הבא לירושלים'); await tick();
  const ld = $('load'); if (ld) { ld.classList.add('gone'); setTimeout(() => ld.remove(), 900); }
  flyTo('olives', 3600);
  if (window.__NO_GAME) { $('hint').classList.add('on'); setTimeout(() => $('hint').classList.remove('on'), 7000); }
  else startGame();
  let last = performance.now();
  const loop = (now) => {
    requestAnimationFrame(loop);
    if (paused) { last = now; return; }
    const dt = Math.min(window.__DT_MAX || 0.05, (now - last) / 1000); last = now;   // (tests on a software renderer may raise __DT_MAX so walks finish)
    PROF.frame(now);   // ── shift30 ── the frame-time log (prof30.js; off unless started) ── /shift30 ──
    stepFly(now);
    const busy = game && game.busy;
    if (busy && controls.autoRotate) controls.autoRotate = false;      // no idle rotation under a sheet or a modal
    if (!fly && !controls.autoRotate && now - lastInput > 16000 && !busy && !twinCam) controls.autoRotate = true;   // ── twin17 ── (!twinCam) ── /twin17 ──
    controls.update(dt);
    clampCam();
    let p0 = PROF.on ? PROF.t() : 0;   // ── shift30 ── (each part timed while the log runs) ── /shift30 ──
    if (view.guard) view.guard(dt);   // ── cam28 ── (Phase B: the camera never inside a solid — src/avodah/day/cam28.js) ── /cam28 ──
    if (PROF.on) { const t = PROF.t(); PROF.add('guard', t - p0); PROF.camAt(camera.position.x, camera.position.y, camera.position.z); p0 = t; }   // ── shift30 ── ── /shift30 ──
    sky.dome.position.copy(camera.position);
    worldTick(dt);   // ── world6 ──
    if (PROF.on) { const t = PROF.t(); PROF.add('world', t - p0); p0 = t; }   // ── shift30 ── ── /shift30 ──
    life.update(dt);
    if (PROF.on) { const t = PROF.t(); PROF.add('light', t - p0); p0 = t; }   // ── shift30 ── ── /shift30 ──
    stages.update(dt);
    if (sanct) sanct.update(dt);   // ── sanctuary ──
    stepViewOffset(dt);
    if (PROF.on) { const t = PROF.t(); PROF.add('world', t - p0); p0 = t; }   // ── shift30 ── ── /shift30 ──
    const pc0 = PROF.on && renderer.info.programs ? renderer.info.programs.length : 0;   // ── shift30 ── (a new shader program this frame: a compile — the hitch a first look costs) ── /shift30 ──
    renderFrame(dt);
    if (PROF.on) { const t = PROF.t(); PROF.add('render', t - p0); PROF.add('compiles', (renderer.info.programs ? renderer.info.programs.length : 0) - pc0); p0 = t; }   // ── shift30 ── ── /shift30 ──
    updateMarker();
    if (game) game.frame(now);
    if (PROF.on) { const t = PROF.t(); PROF.add('game', t - p0); p0 = t; }   // ── shift30 ── ── /shift30 ──
    perf(dt);
  };
  requestAnimationFrame(loop);
  if (window.__START_PAUSED) { paused = true; window.__T.simulate(true); }   // tests: SwiftShader frames are too slow to run the loop
  window.__T.booted = true;
}

// ── world6 ── the sky's drift, the rain's overcast (stages' night rain), the city's smoke and far/near detail
function worldTick(dt) {
  sky.update(dt);
  const rk = stages && stages._dbg && stages._dbg.rain ? stages._dbg.rain.k : 0;
  if (sky.setOvercast(rk)) applyGrade();
  if (city) city.update(dt, camera);
  // WATER's material for the pools, once it exists (guarded: the pools keep the plain water without it)
  if (city && !poolsWet && stages && stages.water && typeof stages.water.waterMaterial === 'function') {
    poolsWet = true;
    try { city.setWaterMaterial(stages.water.waterMaterial({ color: '#3F6F78', opacity: 0.92, flow: [0, 0.05], scale: 3 })); } catch (e) { /* keep the plain water */ }
  }
}
// ── end world6 ──
// ── world12 ── (WORLD12, wave 12) the night's sky by the real Hebrew date (src/weather.js): the moon at its phase (full on the
// 15th, a thin crescent on the 2nd–3rd, none at the new moon) and, on a night without rain, a clear sky with more stars.
// window.__FORCE_DATE = 'YYYY-MM-DD' (before load) shows that evening's night; globalThis.__BH_WEATHER.night() says what it is.
import { nightOf } from './weather.js';
function nightSky() { try { const n = nightOf(); sky.setMoon(n.moon, !n.rain); } catch (e) { /* the default: a full moon */ } }
// ── /world12 ──
// the construction layer may shake the camera a little on impacts; the offset is applied only for the render
function renderFrame(dt) {
  const o = stages && !reducedMotion ? stages.shakeOffset : null, sh = o && (o.x || o.y || o.z);
  if (sh) camera.position.add(o);
  composer.render(dt);
  if (sh) camera.position.sub(o);
}

/* ───────── the game (Phase A) ───────── */
// ── build6 ── the parts handed to the game: a part that is absent, or lacks its entry point, is left out (the flow then shows
// its card and goes on); a full-screen board or court holds the 3D loop (battery), and the tests' own pause is kept
function gameParts() {
  const has = (m, fn) => !!m && typeof m[fn] === 'function';
  const reg = globalThis.__BH_PARTS || {};   // the module's exports plus what the part registered itself (e.g. FUN's bindSound)
  const p = {};
  for (const [k, mod, fn] of [['match3', match3, 'runLevel'], ['kings', kings, 'openCourt'], ['minigames', minigames, 'runMinigame']]) {
    if (has(mod, fn) || has(reg[k], fn)) p[k] = { ...(mod || {}), ...(reg[k] || {}) };
  }
  if (has(games, 'openGames') || has(reg.games, 'openGames')) p.games = { ...(games || {}), ...(reg.games || {}) };   // ── games10 ── (parts().games.invite: FLOW10's optional hook) ── /games10 ──
  return p;
}
let heldByGame = false;
function pauseWorld(on) {
  if (on) { if (!paused) { paused = true; heldByGame = true; } } else if (heldByGame) { paused = false; heldByGame = false; }
}
// ── build7 ── (BUILD7) the opening's fallback camera — WORLD7's world.vision is preferred when present (src/game/index.js
// runOpening). The first shot is BEAUTY.vision (else templeFromOlives) with the boot's finished House at its light; a slow drift,
// then one flight down to `to` (the first boulder); a warm veil covers the swap to the rough Mount (restore, exactly once).
// A tap skips: openingSkip() cuts to `to`.
let opening7 = null;
function opening({ ms = 6000, restore, to } = {}) {
  const b = BEAUTY.vision || BEAUTY.templeFromOlives || BEAUTY.heichalSunrise;
  let swapped = false;
  const swap = () => { if (swapped) return; swapped = true; try { if (restore) restore(); } catch (e) { console.warn('[opening] restore', e); } };
  if (!b || !to) { swap(); return Promise.resolve({ skipped: false }); }
  return new Promise((resolve) => {
    const timers = [], at = (t, f) => timers.push(setTimeout(f, t));
    const veil = document.createElement('div');
    veil.setAttribute('aria-hidden', 'true');
    veil.style.cssText = 'position:fixed;inset:0;pointer-events:none;opacity:0;transition:opacity .36s ease;z-index:5;background:radial-gradient(120% 90% at 50% 42%,rgba(255,240,208,.97),rgba(246,206,138,.95) 58%,rgba(222,168,92,.94))';
    document.body.appendChild(veil);
    let done = false;
    const end = (skipped) => {
      if (done) return; done = true;
      timers.forEach(clearTimeout); opening7 = null;
      swap();
      if (skipped) { fly = null; camera.position.set(...to.p); controls.target.set(...to.t); controls.update(); }
      veil.style.opacity = '0'; setTimeout(() => veil.remove(), 420);
      resolve({ skipped });
    };
    opening7 = { skip: () => end(true) };
    if (TIMES[b.time] && b.time !== curTime) setTime(b.time);
    fly = null; camera.position.set(...b.p); controls.target.set(...b.t); controls.update();
    const hold = Math.round(ms * 0.45), down = ms - hold - 250, P = new THREE.Vector3(...b.p), Tg = new THREE.Vector3(...b.t);
    flyToPos(P.clone().lerp(Tg, 0.07), Tg.clone(), hold);                                     // the vision: a slow drift in
    at(hold - 380, () => { veil.style.opacity = '1'; });
    at(hold, () => { swap(); veil.style.opacity = '0'; });                                  // the swap under the veil: the bare Mount, same view
    at(hold + 250, () => flyToPos(new THREE.Vector3(...to.p), new THREE.Vector3(...to.t), down));   // …then down to the hero (`to` is set at the swap)
    at(ms + 80, () => end(false));
  });
}
function openingSkip() { if (opening7) opening7.skip(); }
// ── /build6 ──
// ── music ── (MUSIC8B, wave 8B) the original adaptive score (src/game/music.js, docs/MUSIC.md): it starts on the first
// gesture and follows the game's events (the two `onEvent` lines marked ── music ──), the existing mute (the sound kit's:
// Phase A's, or Phase B's), ducks under the modal cards (.gm-modal, .av-modal) and the mentor's speech (.coach-on), plays the
// precision state while a precision game's sheet is open (.fx-mg), the solemn one on the Temple tour (body.sc-on), the
// swell over the whole finished House (wholeView), and pauses while the page is hidden.
// FLOW's menu (guarded): globalThis.__BH_MUSIC.set({ volume: 0…1 }) · .get().volume
import { createMusic } from './game/music.js';
const musicEls = { modal: document.getElementsByClassName('gm-modal'), avModal: document.getElementsByClassName('av-modal'), coach: document.getElementsByClassName('coach-on'), mg: document.getElementsByClassName('fx-mg'), tw: document.getElementsByClassName('tw-on') /* ── land17 ── */ };
const music = createMusic({
  context: () => { try { return (game && game.sfx && game.sfx.context) || (avodah && avodah.sfx && avodah.sfx.context) || null; } catch (e) { return null; } },   // ── recovered (build 26c) ── (|| Phase B's: the music shares its one context)   // share the sound kit's context when it offers it
  watch: () => {
    const kit = avodah && avodah.sfx ? avodah.sfx : game && game.sfx ? game.sfx : null;
    return { muted: !!(kit && kit.muted), hidden: document.hidden, duck: musicEls.modal.length || musicEls.avModal.length ? 0.15 : musicEls.coach.length ? 0.6 : 1, precision: musicEls.mg.length > 0, scenes: document.body.classList.contains('sc-on'), whole: wholeView, twin: musicEls.tw.length > 0 /* ── land17 ── the walking-and-working mode: the work state's tempo (120–126) */ };
  },
}).start();
globalThis.__BH_MUSIC = music;
document.addEventListener('visibilitychange', () => { if (document.hidden) music.pause(); else music.resume(); });
// ── end music ──
// ── net10 ── (NET10, wave 10) "כהנים יחד": two kohanim building together from two devices (src/net/*; the owner, 28.9 21:33).
// The artifact's room (+ db) links the devices, a BroadcastChannel mock the tabs of one browser (tests, dist/test.html); with
// neither the game is untouched. The game's events reach it through the score's event call (both phases report there); the
// other kohen is an actors.js figure in this world. globalThis.__BH_NET: the menu's hook (menuHTML) and the tests.
import { createTogether } from './net/index.js';
const together = createTogether({ game: () => game, stages: () => stages, life: () => life, scene, camera, view, mock: window.__NET_MOCK });
{ const ev = music.event; music.event = function (t, d, ph) { together.event(t, d, ph); return ev.apply(this, arguments); }; }
globalThis.__BH_NET = together;
// ── /net10 ──
// ── world12 ── (WORLD12, wave 12) the finale (src/finale.js): the build-up to Chanukat HaBayit — pilgrims of every land with
// their gifts, lamps hung along the courts — and its night of light (the moment 'chanukat', the chag music). The game's events
// reach it through the score's event call, like the net's; index.js finale() calls hooks.celebrate (below) after its story card.
import { createFinale } from './finale.js';
const finale = createFinale({
  game: () => game, life: () => life, crowd: () => stages && stages.crowd, music, lamps: () => lamps,
  time: () => curTime, setTime: (k) => { if (TIMES[k]) setTime(k); },
  fly: (p, t, ms) => flyToPos(new THREE.Vector3(...p), new THREE.Vector3(...t), ms),
});
{ const ev = music.event; music.event = function (t, d, ph) { try { finale.event(t, d, ph); } catch (e) { /* the finale's */ } return ev.apply(this, arguments); }; }
globalThis.__BH_FINALE = finale;
// ── /world12 ──
try { installTester56(); } catch (e) { /* */ }   // ── build 56ב ── (five taps in the top-right corner) ── /build 56ב ──
function startGame() {
  // ── fable32 (build 28) ── the shipped page (__FORCE_SHIFT, tools/mkout.cjs) is the day alone: whatever the link says ('#shift=N' — the
  // 90 s "משמרת"; '#avodah…' — the old Phase B home, the engine22 day where the player is the אמרכל) it opens the lobby, or the day itself
  // for '#shift=day'. The plain dist keeps every link (the tests' and the tools') ── /fable32 ──
  if (globalThis.__FORCE_SHIFT) { const f = String(globalThis.__FORCE_SHIFT); startAvodah(f === 'day' || /^#shift=day\b/.test(location.hash) ? 'shift:day' : 'shift:card'); return; }
  // a link with '#avodah' opens Phase B directly: '#avodah' = its home · '#avodah=live' · '#avodah=<segment or game id>'
  if (/^#avodah/.test(location.hash)) { startAvodah((location.hash.split('=')[1] || '').trim()); return; }
  if (/^#shift\b/.test(location.hash)) { startAvodah('shift:' + (location.hash.split('=')[1] || 'card').trim()); return; }
  if (globalThis.__FORCE_SHIFT) { startAvodah('shift:' + (globalThis.__FORCE_SHIFT === true ? 'card' : String(globalThis.__FORCE_SHIFT))); return; }   // ── fable31 ── (the "mishmeret" build: a flag set in <head> — hosts that ignore a hash, such as an artifact frame on a phone, still open the shift) ── /fable31 ──   // ── shift29 ── (#shift: the entry card · #shift=N: a round of level N) ── /shift29 ──
  // the world the game drives: the construction layer plus the real-clock time of day
  const world = Object.create(stages);
  world.setTimeOfDay = (k) => { if (!wholeView && TIMES[k] && k !== curTime) setTime(k); };
  // ── world ── (World agent, wave 4; QA P1-3) the golden vine grows with the player's own leaves, grapes and clusters
  // (the game's G.vine), and the investor demo (G.demo) shows it grown once its Ulam is finished
  world.setVine = (n) => { const G = game && game.state; return stages.setVine(n, G && G.vine, { demo: !!(G && G.demo) }); };
  // ── end world ──
  game = createGame({
    world, root: document.body, view,
    parts: gameParts(),   // ── build6 ──
    options: { fixedTime: window.__FORCE_TIME || false },
    hooks: {
      showInfo: (id) => showInfo(id), hideInfo: () => hideInfo(),   // (wave 10, MIDDOT10: the book's place links open the world's own card)
      enterWhole() {
        wholeView = true;
        stages.demoMode(); stages.update(0);
        flyTo('olives', 2600);
      },
      exitWhole() {
        wholeView = false;
        hideInfo(); if (squareG) squareG.visible = false;
      },
      setAutoRotate(v) { if (!v) controls.autoRotate = false; lastInput = performance.now(); },
      enterAvodah() { startAvodah(''); },
      enterVision() { startAvodah('shift:vision'); },   // ── fable32 (build 44) ── the one-time vision after stage 01 (the shift's runVision) ── /fable32 ──
      pauseWorld,   // ── build6 ──
      opening, openingSkip,   // ── build7 ── the opening's fallback (WORLD7's world.vision first)
      celebrate: () => finale.celebrate(),   // ── world12 ── Chanukat HaBayit's night of light (src/finale.js) ── /world12 ──
    },
    onEvent: (type, d) => { if (window.__GAME_LOG) window.__GAME_LOG.push({ t: performance.now(), type, d }); music.event(type, d, 'A'); },   // ── music ── (the score follows the game)
  });
  game.start();
}

/* ───────── Phase B, "העבודה בבית" (src/avodah; PROJECT.md §12) ─────────
 * The finished Temple, the builder hidden, the service's world layers (world.sanctuary, world.avodah) reached through
 * the stages object, plus the camera and the real-clock sky. Phase A's save is kept; "back to building" resumes it. */
let avodah = null;
function avodahWorld() {
  const world = Object.create(stages);
  world.setTimeOfDay = (k) => { if (TIMES[k] && k !== curTime) setTime(k); };
  world.look = (p, t, ms = 1800) => new Promise((res) => {
    if (sanct && sanct.state && sanct.state.room !== 'out' && sanct.exit) sanct.exit({ ms: 0 });
    const P = new THREE.Vector3(...p), T = new THREE.Vector3(...t);
    if (innerHeight > innerWidth) {
      const d = P.distanceTo(T), inAzara = p[0] > -187 && p[0] < 0 && Math.abs(p[2]) < 67.5;
      P.sub(T).multiplyScalar(1.2).add(T); P.y += d * 0.1;
      if (inAzara) { P.x = Math.min(Math.max(P.x, -185), -1.5); P.z = Math.min(Math.max(P.z, -66), 66); }   // not into the azara's walls
    }
    flyToPos(P, T, ms); setTimeout(() => res(true), ms);
  });
  // ── avodah interact ── (Avodah agent) the mini-games' touch targets are DOM rings placed over the world each frame:
  // project a world point (amot) to CSS px on the canvas, with the current view offset (no raycasting needed).
  world.project = (x, y, z) => { const o = view.project(x, y, z); return { x: o.x, y: o.y, on: o.on }; };
  world.camera = camera;
  // ── end avodah interact ──
  return world;
}
async function startAvodah(arg = '') {
  if (avodah) return;
  if (game && game.destroy) { try { game.destroy(); } catch (e) { console.warn('[avodah] phase A destroy', e); } }
  game = null;
  if (wholeView) { wholeView = false; hideInfo(); if (squareG) squareG.visible = false; }
  stages.demoMode(); stages.update(0);                                         // the finished Temple
  try { stages.hero.show(false); } catch (e) { /* no builder in Phase B */ }
  flyToPos(new THREE.Vector3(-2, 60, 90), new THREE.Vector3(-60, 20, 0), 2600);  // the altar and the House
  const { createAvodah } = await import('./avodah/index.js');
  const av = createAvodah({
    world: avodahWorld(), root: document.body,
    options: { now: window.__AV_NOW ? () => window.__AV_NOW + (performance.now() - window.__AV_T0) : undefined, onExit: backToBuild, rig: { stages, view, camera, scene } /* ── engine22 ── */ },
    onEvent: (type, d) => { if (window.__GAME_LOG) window.__GAME_LOG.push({ t: performance.now(), type, d }); music.event(type, d, 'B'); },   // ── music ── (Phase B: solemn)
  });
  avodah = av; window.__AVODAH = av;
  game = { frame: (t) => av.frame(t), get busy() { return av.busy; }, onSiteTap() {}, onBoulderTap() {}, onQuarryTap() {}, destroy() { av.stop(); } };
  av.start(arg === 'live' ? { mode: 'live' } : /^shift:/.test(arg) ? { shift: arg.slice(6) } /* ── shift29 ── ── /shift29 ── */ : arg ? { mode: 'practice', segment: arg } : {});
  setTimeout(() => { if (avodah === av) precompile('phaseB entry: every light on (the night)', { allLights: true }); }, 700);   // ── ui ── (QA P2-10)
}
// ── scenes ── the Temple tour, the Ark mystery and the Yom Kippur service (src/avodah/scenes; watch-only where required)
let scenes = null;
let tourFromA = false;   // the tour was opened from Phase A: it shows the finished Temple, and closing it returns to building
window.__openScenes = async (kind = 'tour', ms) => {
  if (!avodah && !tourFromA) {
    tourFromA = true;
    if (game && game.destroy) { try { game.destroy(); } catch (e) { console.warn('[scenes] phase A destroy', e); } }
    game = null;
    if (wholeView) { wholeView = false; hideInfo(); if (squareG) squareG.visible = false; }
    stages.demoMode(); stages.update(0);                                         // the finished Temple
    try { stages.hero.show(false); } catch (e) { /* no builder on the tour */ }
    if (!document.getElementById('sc-on-css')) { const st = document.createElement('style'); st.id = 'sc-on-css'; st.textContent = 'body.sc-on .top,body.sc-on .dock,body.sc-on #hint,body.sc-on #mk{display:none!important}'; document.head.appendChild(st); }
    document.body.classList.add('sc-on');
  }
  const { createScenes } = await import('./avodah/scenes/index.js');
  if (!scenes) {
    scenes = createScenes({
      world: avodahWorld(), root: document.body,
      onClose: () => {
        if (tourFromA) {
          tourFromA = false; document.body.classList.remove('sc-on');
          try { if (sanct && sanct.exit) sanct.exit({ ms: 0 }); } catch (e) { /* already outside */ }
          startGame();                                                          // Phase A comes back from its save
        } else if (avodah && avodah.showHome) avodah.showHome();
      },
    });
    window.__SCENES = scenes;
  }
  try { if (avodah && avodah.ui && avodah.ui.showHome) avodah.ui.showHome(false); } catch (e) { /* the home may not be up yet */ }
  return scenes.open(kind, ms);
};
function backToBuild() {
  if (!avodah) return;
  const av = avodah; avodah = null; window.__AVODAH = null; game = null;
  av.stop();
  try { if (sanct && sanct.exit) sanct.exit({ ms: 0 }); } catch (e) { /* already outside */ }
  try { if (stages.avodah && stages.avodah.ambient) stages.avodah.ambient(true); } catch (e) { /* optional */ }
  if (/^#avodah/.test(location.hash)) history.replaceState(null, '', location.pathname + location.search);
  startGame();
}

/* ───────── UI ───────── */
document.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => { lastInput = performance.now(); flyTo(b.dataset.view); }));
document.querySelectorAll('[data-time]').forEach((b) => b.addEventListener('click', () => { lastInput = performance.now(); setTime(b.dataset.time); if (b.dataset.time === 'night') setTimeout(() => showInfo('menorot'), 400); }));
$('about').addEventListener('click', () => showInfo('about'));
$('cx').addEventListener('click', hideInfo);
$('q').addEventListener('click', () => {
  if (aoWrap) { aoWrap.enabled = !aoWrap.enabled; $('q').textContent = aoWrap.enabled ? 'איכות: גבוהה' : 'איכות: רגילה'; }
  else { renderer.setPixelRatio(renderer.getPixelRatio() > 1 ? 1 : Math.min(devicePixelRatio || 1, 2)); resize(); $('q').textContent = renderer.getPixelRatio() > 1 ? 'איכות: גבוהה' : 'איכות: רגילה'; }
});
$('q').textContent = Q.level === 'high' ? 'איכות: גבוהה' : 'איכות: רגילה';

// ── places24 ── one shared hold on the camera's near limits: OrbitControls keeps the camera 35 amot from its target and the near plane
// at 4 — a work on its real place (twin.js: the place's view) and FIGURES24's close-up each hold them by a key (closeCam(on, key)); they
// come back only when no one holds them. closeCam(true) → the distance the follow camera keeps (to blend from it), as FIGURES24's.
{ const held = new Set(); let saved = null;
  view.closeCam = (on, key = 'f24') => {
    if (on) held.add(key); else held.delete(key);
    if (held.size && !saved) { saved = [controls.minDistance, camera.near]; controls.minDistance = 0.5; camera.near = 1.5; camera.updateProjectionMatrix(); }
    else if (!held.size && saved) { [controls.minDistance, camera.near] = saved; saved = null; camera.updateProjectionMatrix(); }
    return saved ? saved[0] : controls.minDistance;
  };
}
// ── /places24 ──
window.__T = {
  flyTo, flyToPos, setTime, mixTime /* ── recovered (16–26c) ── */, camera, controls, VIEWS, renderer, scene,
  Raycaster: THREE.Raycaster, Vector3: THREE.Vector3,   // (not the whole namespace: that would defeat tree-shaking)
  get life() { return life; },
  jump: (k) => { const v = VIEWS[k]; fly = null; camera.position.set(...v.p); controls.target.set(...v.t); controls.update(); if (squareG) squareG.visible = k === 'top'; },
  // look from p at t (arrays), for test shots
  look: (p, t) => { fly = null; camera.position.set(...p); controls.target.set(...t); controls.update(); },
  // ── world ── (World agent, wave 4) the camera moves first — the flight, the controls, the construction layer's orbit and the
  // sanctuary's walks — and only then do the people, animals and crews cull themselves against it (life.update), so a shot
  // taken right after a camera move no longer shows the actors culled against the previous view
  render: () => { const r0 = PROF.on ? PROF.t() : 0, pc0 = PROF.on && renderer.info.programs ? renderer.info.programs.length : 0; try { window.__T.render0(); } finally { if (PROF.on) PROF.rendered(PROF.t() - r0, (renderer.info.programs ? renderer.info.programs.length : 0) - pc0); } },   // ── shift30 ── (a test's render, timed) ── /shift30 ──
  render0: () => { measureSafeArea(); stepViewOffset(1); stepFly(performance.now()); controls.update(); if (view.guard) view.guard(0.016); /* ── cam28 ── */ stages.update(0.016); if (sanct) sanct.update(0.016); life.update(0.016); sky.dome.position.copy(camera.position); worldTick(0.016); renderFrame(0.016); },   // ── world6 ── (+ worldTick)
  // ── end world ──
  // advance the simulation (construction, crowd, flights) without rendering
  step: (sec = 1, dt = 1 / 30) => { for (let t = 0; t < sec; t += dt) { life.update(dt); stages.update(dt); if (sanct) sanct.update(dt); } },
  pause: (v) => { paused = v; }, showInfo, get ready() { return !!life; },
  get stages() { return stages; },
  get game() { return game; },
  // tests: advance the world in real time without rendering (the loop is paused; renders come from render())
  simulate: (on, dt = 0.05) => {
    clearInterval(window.__simT);
    // (__HUD_HOLD: the HUD anchors stay on the frame last rendered, while a screenshot is taken)
    if (on) window.__simT = setInterval(() => {
      if (PROF.on) { PROF.frame(performance.now()); let t = PROF.t(), t1; life.update(dt); PROF.add('light', (t1 = PROF.t()) - t); t = t1; stages.update(dt); if (sanct) sanct.update(dt); stepFly(performance.now()); controls.update(dt); PROF.add('world', (t1 = PROF.t()) - t); t = t1; if (game && !window.__HUD_HOLD) game.frame(performance.now()); PROF.add('game', (t1 = PROF.t()) - t); t = t1; if (view.guard && !window.__HUD_HOLD) view.guard(dt); PROF.add('guard', PROF.t() - t); PROF.camAt(camera.position.x, camera.position.y, camera.position.z); return; }   // ── shift30 ── (the frame-time log in the tests' simulated loop: every part but the render) ── /shift30 ──
      life.update(dt); stages.update(dt); if (sanct) sanct.update(dt); stepFly(performance.now()); controls.update(dt); if (game && !window.__HUD_HOLD) game.frame(performance.now()); if (view.guard && !window.__HUD_HOLD) view.guard(dt); /* ── cam28 ── (after the game's frame: the pose a render would show) */ }, dt * 1000);
  },
  view,
  // test mode: every stage locked, the Mount available, hill + boulders + the builder on the hill
  buildMode: () => { stages.buildMode(); stages.update(0); },
  demoMode: () => { stages.demoMode(); stages.update(0); },
  // draw calls of one full frame (scene + post), and of the scene pass alone
  drawCalls: () => {
    const info = renderer.info, su = renderer.shadowMap.needsUpdate; info.autoReset = false; info.reset();
    renderer.shadowMap.needsUpdate = false;
    composer.render(0.016); const total = info.render.calls, tris = info.render.triangles;
    info.reset(); renderer.setRenderTarget(null); renderer.render(scene, camera); const sceneOnly = info.render.calls;
    info.autoReset = true; renderer.shadowMap.needsUpdate = su;
    const r = { total, scene: sceneOnly, triangles: tris }; console.log('[calls] ' + JSON.stringify(r)); return r;
  },
};

Object.defineProperty(window.__T, 'sanctuary', { get: () => sanct });   // ── sanctuary ──
for (const [k, f] of [['city', () => city], ['grade', () => grade]]) Object.defineProperty(window.__T, k, { get: f, configurable: true });   // ── world6 ── (live getters: Object.assign copied the boot-time nulls)
// ── world6 ── tests: the sky, the city, the grade
Object.assign(window.__T, {
  sky, GRADE, BEAUTY,
  // a beauty camera (src/city.js BEAUTY): its time preset and its view; without a name, the list
  // (the shadow map is centred on the shot's target, and a shot may look a little up: b.polar; tests only, the game never calls it)
  beauty: (k) => {
    const b = BEAUTY[k]; if (!b) return Object.keys(BEAUTY);
    sun.target.position.set(b.t[0], 0, b.t[2]); sun.target.updateMatrixWorld(); setTime(b.time || curTime);
    controls.maxPolarAngle = b.polar || 1.46; fly = null; camera.position.set(...b.p); controls.target.set(...b.t); controls.update(); return b.he;
  },
});
// ── end world6 ──

// ── world7 ── the opening vision: the finished House over the Old City at the golden hour (src/city.js BEAUTY.vision), a slow
// push-in, a warm veil while the game puts its own site back (opts.restore; default: the rough Mount of a new game), then the
// flight down to the Mount (opts.to (or opts.end) = { p, t }, default BEAUTY.vision.end). ms = the whole run (default 7000). Always resolves;
// visionSkip() ends it at once (restore runs exactly once). Same materials and programs as any frame: only uniforms change.
let vis = null;
function visionVeil() {
  let v = document.getElementById('w7-veil');
  if (!v) {
    v = document.createElement('div'); v.id = 'w7-veil';
    v.style.cssText = 'position:fixed;inset:0;z-index:2;pointer-events:none;opacity:0;transition:opacity 0.42s ease;background:radial-gradient(120% 80% at 50% 36%,#FFF7E8 0%,#F8DEB2 55%,#EEC690 100%)';
    document.body.appendChild(v);
  }
  return v;
}
const v3 = (a) => new THREE.Vector3(a[0], a[1], a[2]);
function runVision(o = {}) {
  if (vis) visionEnd(vis, true);
  const V = BEAUTY.vision, ms = Math.max(2500, +o.ms || 7000), tSwap = ms * 0.46, veilMs = 430;
  const st = vis = { restore: typeof o.restore === 'function' ? o.restore : null, restored: false, timers: [], prev: curTime, end: o.to || o.end || V.end, veil: visionVeil(), res: null };
  stages.demoMode(); stages.update(0);
  setTime(V.time);
  fly = null; controls.autoRotate = false; lastInput = performance.now();
  camera.position.set(...V.p); controls.target.set(...V.t); controls.update();
  flyToPos(v3(V.p2 || V.p), v3(V.t2 || V.t), tSwap + veilMs);   // the slow push-in (the veil comes over its last part)
  const p = new Promise((res) => { st.res = res; });
  st.timers.push(setTimeout(() => { st.veil.style.opacity = '1'; }, tSwap));
  st.timers.push(setTimeout(() => {
    visionRestore(st);
    fly = null; camera.position.set(...V.down.p); controls.target.set(...V.down.t); controls.update();
    flyToPos(v3(st.end.p), v3(st.end.t), Math.max(600, ms - tSwap - veilMs));   // down to the rough Mount
    st.veil.style.opacity = '0';
  }, tSwap + veilMs));
  st.timers.push(setTimeout(() => visionEnd(st, false), ms + 30));
  return p;
}
function visionRestore(st) {
  if (st.restored) return;
  st.restored = true;
  try { if (st.restore) st.restore(); else { stages.buildMode(); stages.update(0); } } catch (e) { console.warn('[vision] restore', e); }
  if (curTime === 'golden') setTime(st.prev === 'golden' ? 'dawn' : st.prev);
}
function visionEnd(st, skipped) {
  if (vis !== st) return;
  vis = null; st.timers.forEach(clearTimeout); visionRestore(st);
  st.veil.style.opacity = '0';
  fly = null; camera.position.set(...st.end.p); controls.target.set(...st.end.t); controls.update();   // (skipped, or a slow last frame: the camera IS at the end when it resolves)
  st.res({ skipped });
}
function skipVision() { if (vis) visionEnd(vis, true); return true; }
Object.assign(window.__T, { vision: (o) => runVision(o), visionSkip: skipVision });
Object.defineProperty(window.__T, 'visionOn', { get: () => !!vis, configurable: true });
// ── end world7 ──

boot().catch((e) => { console.error(e); const t = $('lt'); if (t) t.textContent = 'שגיאה בטעינה: ' + e.message; });
