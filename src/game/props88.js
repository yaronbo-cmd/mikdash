/* ── build 88 ── props88.js — THE WOODEN THINGS OF THE WORLD, IN REAL WOOD (the owner, 3.11: "הדמויות, העגלה ומתקן הורדה נראות רחוק מאוד ממצב
 * יפה"): the hand cart from Quaternius's CC0 "Medieval Village MegaKit" (assets/wagon88.glb, tools/props88.mjs — its own painted wood), and
 * the kit's wood for our own timbers (assets/wood88a.jpg light side grain, wood88b.jpg dark; the grain along v).
 *   wagon88({ k }) → a Group that fills when the model is in (its shafts toward −z, its bed's middle at the origin) ·
 *   wood88(kind 'a' | 'b', tint) → a MeshStandardMaterial · grain88(geometry, len) → the box's long faces repeat the wood along its length
 * (its y). Never a Divine Name. ── /build 88 ── */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
let A = null; const assets = () => (A = A || import('./props88assets.js').catch(() => null));   // (the files: only in the page)

export const PROPS88 = Object.freeze({ grainLen: 1.6 /* (one length of the wood strip per this many units of timber) */ });

let W = null;
function loadWagon() {
  if (W) return W;
  W = assets().then((a) => new Promise((res) => { if (!a) { res(null); return; } const L = new GLTFLoader(); try { L.setMeshoptDecoder(MeshoptDecoder); } catch (e) { /* */ } L.load(a.WAGON_URL, (g) => res(g.scene), undefined, () => res(null)); }));
  return W;
}
/** the hand cart (the kit's model: 1.95 wide on x, 1.53 high, its shafts toward −z; its bed's box from about z −1.4 to +0.87): scaled k,
 *  its wheels on the ground, its bed's middle at the group's origin */
export const WAGON88 = Object.freeze({ bodyZ: -0.27, bedY: 0.76 });
export function wagon88(o = {}) {
  const g = new THREE.Group(); g.name = 'wagon88'; const k = o.k || 1;
  loadWagon().then((src) => {
    if (!src) return;
    const m = src.clone(true); m.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = true; } });
    m.scale.multiplyScalar(k); m.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(m), c = b.getCenter(new THREE.Vector3());
    m.position.set(-c.x, -b.min.y, -WAGON88.bodyZ * k); g.add(m); g.userData.loaded = true;
  });
  return g;
}

const MATS = {};
/** the kit's wood (its map arrives with the files; until then the tint alone) */
export function wood88(kind = 'a', tint = '#ffffff') {
  const key = kind + tint; if (MATS[key]) return MATS[key];
  const m = new THREE.MeshStandardMaterial({ color: kind === 'b' ? '#6E4E30' : '#9A7048', roughness: 0.9, metalness: 0 }); m.userData.wood88 = kind;
  if (typeof document !== 'undefined') assets().then((a) => { if (!a) return; new THREE.TextureLoader().load(kind === 'b' ? a.WOOD_B : a.WOOD_A, (t) => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; m.map = t; m.color.set(tint); m.needsUpdate = true; }); });
  return (MATS[key] = m);
}
/** a BoxGeometry whose long axis is y: its four long faces take the grain along their length, repeated per PROPS88.grainLen */
export function grain88(geo, len) {
  const uv = geo.getAttribute('uv'); if (!uv) return geo; const rep = Math.max(0.25, len / PROPS88.grainLen);
  // (BoxGeometry's faces in order: +x, −x, +y, −y, +z, −z; four vertices each with no segments — the ±y faces are the ends)
  for (let f = 0; f < 6; f++) { if (f === 2 || f === 3) continue; for (let i = 0; i < 4; i++) { const j = f * 4 + i; uv.setY(j, uv.getY(j) * rep); } }
  uv.needsUpdate = true; return geo;
}
