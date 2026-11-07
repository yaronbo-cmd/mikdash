/* ── build 84 ── fig84.js — REAL FIGURES FOR AN ACT (the owner, 3.11, on stage 03's procession: "עוד פעם הגלילים"): the kohen's rigged
 * body (assets/kohen.glb — the CC0 KayKit "Adventurers" body, as hero35.js and crew71.js) for the people an act itself places — the
 * procession of priests at the thirteen bows, the master builder who paces the gap, the hoist's crew. Each figure: its own clone, mixer
 * and clip; a priest in white linen with the cap and sash (Exodus 28:40 — המחשה), a worker in a dyed tunic with a head cloth and a belt;
 * bend(k) bows the back over the clip (the spine, chest and head turned forward, put back before the mixer's next frame).
 *   const F = createFigs84({ scene }) → F.ready (Promise<bool>) · F.make({ white, tunic, cloth, tool }) → fig { root, play(name, rate),
 *   bend(k), update(dt), at(name) } · F.loaded · F.clear()
 * Never a Divine Name. ── /build 84 ── */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone as skClone } from 'three/addons/utils/SkeletonUtils.js';
const KOHEN_URL = null;   // ── build 88 ── (the KayKit body is no longer in the page — people88 draws every man; ?p88=0 or a url: the shapes alone)
import { createPeople88 } from './people88.js';   // ── build 88 ──

export const FIG84 = Object.freeze({ scale: 1.6, h88: 3.96 /* ── build 88 ── (the KayKit body at scale 1.6: people88's figures as tall) */, robeMin: 200, bend: Object.freeze({ spine: 0.62, chest: 0.42, head: 0.25 }) });

let G = null;   // (one load per page)
const qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), qC = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), FW = new THREE.Vector3(), AX = new THREE.Vector3();
function load() {
  if (G) return G;
  G = new Promise((res) => {
    const L = new GLTFLoader(); try { L.setMeshoptDecoder(MeshoptDecoder); } catch (e) { /* */ }
    if (!KOHEN_URL) { res(null); return; } L.load(KOHEN_URL, (g) => res(g), undefined, () => res(null));
  });
  return G;
}

// ── build 88 ── the act's people are people88's now: real proportions, dressed in the clothes of the time (?p88=0: the KayKit body as before)
export const P88_ON = (() => { try { return !(typeof location !== 'undefined' && /[?&]p88=0\b/.test(location.search)); } catch (e) { return true; } })();
export function createFigs84(o = {}) {
  if (P88_ON) {
    const P = createPeople88(o);
    return { ready: P.ready, root: P.root, clear: P.clear, figs: P.figs, get loaded() { return P.loaded; },
      make: (opt = {}) => P.make({ ...opt, height: FIG84.h88 * ((opt.scale || FIG84.scale) / FIG84.scale) }) };
  }
  return createFigs84Old(o);
}
// ── /build 88 ──
function createFigs84Old(o = {}) {
  const scene = o.scene, root = new THREE.Group(); root.name = 'fig84'; if (scene) scene.add(root);
  const st = { g: null, loaded: false, figs: [], dyed: {} };
  const ready = load().then((g) => { st.g = g; st.loaded = !!g; return st.loaded; });
  function dyed(hex) {
    if (st.dyed[hex]) return st.dyed[hex];
    let tex = null; st.g.scene.traverse((n) => { if (!tex && n.isMesh && n.material && n.material.map) tex = n.material.map; });
    let map = tex; const img = tex && tex.image;
    try {
      if (img && typeof document !== 'undefined') {
        const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const x = cv.getContext('2d'); x.drawImage(img, 0, 0);
        const d = x.getImageData(0, 0, cv.width, cv.height), p = d.data, hn = parseInt(hex.slice(1), 16), R = (hn >> 16) & 255, Gc = (hn >> 8) & 255, B = hn & 255;
        for (let i = 0; i < p.length; i += 4) if (p[i] > FIG84.robeMin && p[i + 1] > FIG84.robeMin && p[i + 2] > FIG84.robeMin) { const k = (p[i] + p[i + 1] + p[i + 2]) / 765; p[i] = R * k; p[i + 1] = Gc * k; p[i + 2] = B * k; }
        x.putImageData(d, 0, 0); map = new THREE.CanvasTexture(cv); map.flipY = tex.flipY; map.colorSpace = tex.colorSpace; map.needsUpdate = true;
      }
    } catch (e) { map = tex; }
    return (st.dyed[hex] = new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0, side: THREE.DoubleSide }));
  }
  function make(opt = {}) {
    if (!st.loaded) return null;
    const m = skClone(st.g.scene), B = {}; m.traverse((n) => { if (n.name) B[n.name] = n; if (n.isMesh) { n.castShadow = true; n.frustumCulled = false; } });
    m.scale.setScalar(opt.scale || FIG84.scale);
    if (!opt.white && opt.tunic) { const M = dyed(opt.tunic); m.traverse((n) => { if (n.isMesh && !n.userData.prop84) n.material = M; }); }
    const head = B.head, sp = B.spine || B.chest;
    if (head) {
      const cap = opt.white
        ? new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.42, 16), new THREE.MeshStandardMaterial({ color: '#F7F3E8', roughness: 0.9 }))
        : new THREE.Mesh(new THREE.SphereGeometry(0.52, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: opt.cloth || '#8A5A34', roughness: 0.95 }));
      cap.position.y = opt.white ? 0.98 : 0.62; if (!opt.white) cap.scale.y = 0.8; cap.userData.prop84 = 1; head.add(cap);
    }
    if (sp) {
      const cols = opt.white ? ['#F1ECE0', '#2A4A9C', '#6B2E8F', '#B1263A'] : [opt.cloth || '#8A5A34'];
      cols.forEach((c, i) => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.45, 0.34 / cols.length, 18, 1, true), new THREE.MeshStandardMaterial({ color: c, roughness: 0.85, side: THREE.DoubleSide })); r.position.y = 0.12 - 0.17 + (i + 0.5) * (0.34 / cols.length); r.userData.prop84 = 1; sp.add(r); });
    }
    const f = { root: m, B, mixer: new THREE.AnimationMixer(m), cur: null, name: '', k: 0, sv: null };
    f.play = (name, rate = 1) => {
      const clip = st.g.animations.find((a) => a.name === name) || st.g.animations.find((a) => a.name === 'Idle'); if (!clip) return;
      if (f.name !== name) { const a = f.mixer.clipAction(clip); a.reset(); a.setLoop(THREE.LoopRepeat, Infinity); a.enabled = true; a.setEffectiveWeight(1); if (f.cur && f.cur !== a) a.crossFadeFrom(f.cur, 0.2, true); a.play(); f.cur = a; f.name = name; }
      if (f.cur) f.cur.setEffectiveTimeScale(rate);
    };
    f.bend = (k) => { f.k = Math.max(0, Math.min(1, +k || 0)); };
    f.update = (dt) => {
      if (f.sv) { for (const [b, q] of f.sv) b.quaternion.copy(q); f.sv = null; }
      f.mixer.update(dt);
      if (f.k > 0.001) {
        f.sv = [];
        m.updateMatrixWorld(true); m.getWorldQuaternion(qC); FW.set(0, 0, 1).applyQuaternion(qC); FW.y = 0; FW.normalize(); AX.crossVectors(UP, FW);   // (forward about the figure's own side axis, in the world)
        for (const [n, a] of Object.entries(FIG84.bend)) { const b = B[n]; if (!b || !b.parent) continue; f.sv.push([b, b.quaternion.clone()]); b.parent.getWorldQuaternion(qB); b.getWorldQuaternion(qC); qA.setFromAxisAngle(AX, a * f.k); b.quaternion.copy(qB.invert().multiply(qA).multiply(qC)); b.updateMatrixWorld(true); }
      }
    };
    f.at = (n) => { const b = B[n]; if (!b) return null; const v = new THREE.Vector3(); b.getWorldPosition(v); return v; };
    f.play(opt.clip || 'Idle', 1); root.add(m); st.figs.push(f);
    return f;
  }
  function clear() { for (const f of st.figs) { if (f.root.parent) f.root.parent.remove(f.root); } st.figs = []; }
  return { ready, make, clear, root, get loaded() { return st.loaded; }, figs: () => st.figs };
}
