/* ── fable32 (build 15) ── hero35.js — THE KOHEN, a real character: a rigged, animated glTF (assets/kohen.glb — the CC0 KayKit
 * "Adventurers" Mage by Kay Lousberg, pruned and recoloured by tools/kohen-glb.mjs: white linen robe, a sash of תכלת, barefoot, the
 * hat and cape gone; 20 of its 76 animations kept). It FOLLOWS the world's own hero (stages.js hero: x, y, z, yaw, vis) every frame and
 * stands in for its box-figure (hidden while this one is loaded): Idle when he stands, Walking_A / Running_A by his pace, and the acts'
 * clips on request (play('2H_Melee_Attack_Chop') for the axe, 'PickUp', 'Interact', 'Spellcast_Raise' for the raised hands, 'Cheer'…).
 * Our own props ride its bones: the cap (מצנפת) on the head, the sash's stripes on the chest, the axe in the right hand slot, the basket on
 * the back — so the kit never has to draw him again. Sources: the robe and cap — Exodus 28:40, 39:27–28 (המחשה); barefoot — Berakhot 9:5.
 *   const K = createHero35({ THREE, scene, S, url, scale }) → K.update(dt) · K.play(name, { once, speed, fade }) · K.stop() ·
 *   K.bone(name) (a THREE.Object3D) · K.handR() / K.handL() / K.head() (world positions) · K.ready (Promise) · K.destroy() · K.state()
 * Never a Divine Name. ── /fable32 ── */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import KOHEN_URL from '../../../assets/kohen.glb';

export const HERO35 = Object.freeze({ scale: 1.6, yawOff: 0, walkAt: 1.2, runAt: 16, fade: 0.18, walkClip: 'Walking_A', runClip: 'Running_A', idleClip: 'Idle', walkRate: 0.9, runRate: 1.0,
  cap: { r: 0.5, h: 0.42, y: 0.98, hex: '#F7F3E8' }, sash: { y: 0.12, r: 0.46, h: 0.34 }, stripes: ['#F1ECE0', '#2A4A9C', '#6B2E8F', '#B1263A'] });

export function createHero35(o = {}) {
  const scene = o.scene, S = o.S || null, url = o.url || KOHEN_URL;
  const root = new THREE.Group(); root.name = 'kohen35'; root.visible = false;
  const st = { loaded: false, err: null, mixer: null, clips: {}, cur: null, curName: '', locomotion: 'Idle', px: NaN, pz: NaN, sp: 0, acting: null, t: 0, n: 0, bones: {}, model: null, hidOld: false };
  const hp = { x: 0, y: 16, z: 0, yaw: 0, vis: true };
  if (scene) scene.add(root);
  const loader = new GLTFLoader(); try { loader.setMeshoptDecoder(MeshoptDecoder); } catch (e) { /* */ }
  const ready = new Promise((res) => {
    loader.load(url, (g) => {
      try {
        const model = g.scene; model.scale.setScalar(o.scale || HERO35.scale); model.rotation.y = HERO35.yawOff;
        model.traverse((n) => { if (n.isMesh) { n.castShadow = true; n.receiveShadow = false; n.frustumCulled = false; if (n.material) { n.material.roughness = 0.85; n.material.metalness = 0; } } if (n.isBone || n.type === 'Bone' || n.name) st.bones[n.name] = n; });
        root.add(model); st.model = model;
        st.mixer = new THREE.AnimationMixer(model);
        for (const c of g.animations) st.clips[c.name] = c;
        props();
        st.loaded = true; root.visible = true;
        play(HERO35.idleClip);
      } catch (e) { st.err = String(e && e.message); }
      res(st.loaded);
    }, undefined, (e) => { st.err = String(e && (e.message || e)); res(false); });
  });
  /** our props on its bones: the cap, the sash's stripes (the sash's ground is in the texture) */
  function props() {
    const head = st.bones.head, chest = st.bones.spine || st.bones.chest;   // (the sash on the spine bone: the waist, not the chest)
    if (head) { const cap = new THREE.Mesh(new THREE.CylinderGeometry(HERO35.cap.r * 0.92, HERO35.cap.r, HERO35.cap.h, 18), new THREE.MeshStandardMaterial({ color: HERO35.cap.hex, roughness: 0.9 })); cap.position.set(0, HERO35.cap.y, 0); cap.name = 'cap35'; head.add(cap);
      const band = new THREE.Mesh(new THREE.TorusGeometry(HERO35.cap.r * 0.98, 0.05, 8, 24), new THREE.MeshStandardMaterial({ color: '#E8DCC0', roughness: 0.9 })); band.rotation.x = Math.PI / 2; band.position.y = HERO35.cap.y - HERO35.cap.h * 0.45; head.add(band); }
    if (chest) { const n = HERO35.stripes.length; for (let i = 0; i < n; i++) { const ring = new THREE.Mesh(new THREE.CylinderGeometry(HERO35.sash.r, HERO35.sash.r, HERO35.sash.h / n, 20, 1, true), new THREE.MeshStandardMaterial({ color: HERO35.stripes[i], roughness: 0.85, side: THREE.DoubleSide })); ring.position.y = HERO35.sash.y - HERO35.sash.h / 2 + (i + 0.5) * HERO35.sash.h / n; ring.name = 'sash35'; chest.add(ring); } }
  }
  function play(name, opt = {}) {
    if (!st.mixer) return false;
    const clip = st.clips[name] || st.clips[HERO35.idleClip]; if (!clip) return false;
    if (st.curName === name && !opt.restart) return true;
    const a = st.mixer.clipAction(clip); a.reset(); a.enabled = true; a.setEffectiveTimeScale(opt.speed || 1); a.setEffectiveWeight(1);
    if (opt.once) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; } else a.setLoop(THREE.LoopRepeat, Infinity);
    if (st.cur && st.cur !== a) { a.crossFadeFrom(st.cur, opt.fade != null ? opt.fade : HERO35.fade, true); }
    a.play(); st.cur = a; st.curName = name;
    if (opt.once) { st.acting = { name, until: st.t + clip.duration / (opt.speed || 1) }; } else st.acting = null;
    return true;
  }
  function update(dt) {
    st.n++; st.t += dt;
    if (!st.loaded) return;
    try { if (S && S.heroXYZ) S.heroXYZ(hp); } catch (e) { /* */ }
    root.position.set(hp.x, hp.y, hp.z); root.rotation.y = hp.yaw || 0;
    root.visible = hp.vis !== false;
    // (the box-figure under it: off while this one stands)
    try { const m = S && S.hero && S.hero.mesh; if (m && m.visible) { m.visible = false; st.hidOld = true; } } catch (e) { /* */ }
    // his pace → the clip (an act's one-shot clip plays out first)
    if (Number.isFinite(st.px) && dt > 0) { const d = Math.hypot(hp.x - st.px, hp.z - st.pz) / dt; st.sp = d > 60 ? st.sp : st.sp + (d - st.sp) * Math.min(1, dt * 8); }
    st.px = hp.x; st.pz = hp.z;
    if (st.acting && st.t >= st.acting.until) st.acting = null;
    if (!st.acting) { const want = st.sp >= HERO35.runAt ? HERO35.runClip : st.sp >= HERO35.walkAt ? HERO35.walkClip : HERO35.idleClip; if (want !== st.curName) play(want, { speed: want === HERO35.runClip ? HERO35.runRate : want === HERO35.walkClip ? HERO35.walkRate : 1 }); }
    st.mixer.update(dt);
  }
  const v = new THREE.Vector3();
  const worldOf = (b) => { if (!b) return null; b.getWorldPosition(v); return { x: v.x, y: v.y, z: v.z }; };
  const api = {
    ready, root, update, play, stop: () => { if (st.cur) { st.cur.stop(); st.cur = null; st.curName = ''; } st.acting = null; },
    bone: (n) => st.bones[n] || null, at: (n) => worldOf(st.bones[n]), handR: () => worldOf(st.bones['handslot.r'] || st.bones['hand.r']), handL: () => worldOf(st.bones['handslot.l'] || st.bones['hand.l']), head: () => worldOf(st.bones.head),
    get loaded() { return st.loaded; }, get err() { return st.err; },
    state: () => ({ loaded: st.loaded, err: st.err, clip: st.curName, acting: st.acting ? st.acting.name : null, sp: +st.sp.toFixed(1), n: st.n, clips: Object.keys(st.clips).length, vis: root.visible, pos: [+root.position.x.toFixed(1), +root.position.y.toFixed(1), +root.position.z.toFixed(1)] }),
    destroy() { try { if (scene) scene.remove(root); } catch (e) { /* */ } try { const m = S && S.hero && S.hero.mesh; if (m && st.hidOld) m.visible = !!hp.vis; } catch (e) { /* */ } st.loaded = false; },
  };
  try { globalThis.__HERO35 = api; } catch (e) { /* */ }
  return api;
}
