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
import { GAIT35, gaitFor } from './gait35.js';   // ── recovered (16–26c) ── the gait, its own module now

export const HERO35 = Object.freeze({ scale: 1.6, yawOff: 0, ...GAIT35 /* ── recovered (16–26c) ── (was walkAt 1.2, runAt 16, the clips, walkRate 0.9, runRate 1) */, fade: 0.18,
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
        try { dustMat(model); } catch (e) { /* ── recovered (build 20) ── the dust's material: without it, the plain robe */ }
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
    const a = st.mixer.clipAction(clip); a.reset(); a.enabled = true; a.setEffectiveTimeScale(opt.speed != null ? opt.speed : 1); a.setEffectiveWeight(1);   // ── recovered (16–26c) ── (speed != null: 0 holds the frame)
    if (opt.once) { a.setLoop(THREE.LoopOnce, 1); a.clampWhenFinished = true; } else a.setLoop(THREE.LoopRepeat, Infinity);
    if (opt.at > 0) a.time = Math.min(clip.duration, opt.at);   // ── recovered (16–26c) ── (opt.at: start the clip that far in)
    if (st.cur && st.cur !== a) { a.crossFadeFrom(st.cur, opt.fade != null ? opt.fade : HERO35.fade, true); }
    a.play(); st.cur = a; st.curName = name;
    if (opt.once) { st.acting = { name, until: st.t + Math.max(0, clip.duration - (opt.at || 0)) / (opt.speed || 1) }; } else st.acting = opt.act ? { name, until: Infinity } : null;   // ── recovered (16–26c) ── (opt.act: a looping act holds until stop/free)
    return true;
  }
  function update(dt) {
    st.n++; st.t += dt;
    if (!st.loaded) return;
    try { if (S && S.heroXYZ) S.heroXYZ(hp); } catch (e) { /* */ }
    st.ly = (st.ly || 0) + ((st.lift || 0) - (st.ly || 0)) * Math.min(1, dt * 8);   // ── recovered (16–26c) ── (lift(h): raised h, eased)
    root.position.set(hp.x, hp.y + st.ly, hp.z); root.rotation.y = hp.yaw || 0;
    root.visible = hp.vis !== false;
    // (the box-figure under it: off while this one stands)
    try { const m = S && S.hero && S.hero.mesh; if (m && m.visible) { m.visible = false; st.hidOld = true; } } catch (e) { /* */ }
    // his pace → the clip (an act's one-shot clip plays out first)
    if (Number.isFinite(st.px) && dt > 0) { const d = Math.hypot(hp.x - st.px, hp.z - st.pz) / dt; st.sp = d > 60 ? st.sp : st.sp + (d - st.sp) * Math.min(1, dt * 8); }
    st.px = hp.x; st.pz = hp.z;
    if (st.acting && st.t >= st.acting.until) st.acting = null;
    if (!st.acting) { const want = gaitFor(st.sp, st.curName); st.gait = want; if (want.clip !== st.curName) play(want.clip, { speed: want.rate }); else if (st.cur && want.clip !== HERO35.idleClip) st.cur.setEffectiveTimeScale(want.rate); }   // ── recovered (16–26c) ── (gait35: the rate follows his pace)
    poseUndo(); reachUndo(); st.mixer.update(st.t < st.stopUntil ? 0 : dt);   // ── recovered (16–26c) ── (the IK's bones back first; hitStop holds the frame)
    const arm = globalThis.__ARM19 && st.bones.upperarmr;   // ── recovered (build 19) ── (__ARM19: a test of the right arm)
    if (arm) arm.rotation.x -= 0.6 + 0.6 * Math.sin(st.t * 13);
    poseApply(dt); reachApply(dt);
  }
  // ── recovered (build 20) ── pose20: he kneels at the laver — the hips drop, the spine, chest and head bend forward, the feet stay where
  // they stood (a little wider), the hands go down before them (two-bone IK on legs and arms); w eases in over `in` s and blends with
  // the clip. Each frame the bones it moved are saved, and put back before the mixer's next frame.
  const crouch = { w: 0, want: 0, in: 0.35, drop: 0.1, spine: 0.75, chest: 0.55, head: -0.35, knee: 0.25, wide: 0.12, up: 0.08, fw: 0.18, sv: null };
  const POSE_BONES = ['hips', 'spine', 'chest', 'head', 'upperarml', 'lowerarml', 'upperarmr', 'lowerarmr', 'upperlegl', 'lowerlegl', 'footl', 'upperlegr', 'lowerlegr', 'footr'];
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), vC = new THREE.Vector3(), vD = new THREE.Vector3(), vE = new THREE.Vector3();
  const qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), qC = new THREE.Quaternion(), mA = new THREE.Matrix4(), UP = new THREE.Vector3(0, 1, 0);
  function poseUndo() { const sv = crouch.sv; if (sv) { for (const [b, q, p] of sv) { b.quaternion.copy(q); b.position.copy(p); } crouch.sv = null; } }
  /** turn bone b by the world rotation q */
  function turnWorld(b, q) { b.parent.getWorldQuaternion(qB); b.getWorldQuaternion(qC); b.quaternion.copy(qB.invert().multiply(q).multiply(qC)); b.updateMatrixWorld(true); }
  /** turn bone b so that the world point `from` swings toward `to` */
  function aimBone(b, from, to) { b.getWorldPosition(vD); vE.copy(from).sub(vD).normalize(); vA.copy(to).sub(vD).normalize(); if (vE.lengthSq() < 1e-9 || vA.lengthSq() < 1e-9) return; qA.setFromUnitVectors(vE, vA); turnWorld(b, qA); }
  /** two-bone IK: a (upper) – b (lower) – c (its end) reaching `target`, the middle joint bent toward `pole` */
  function ik2(a, b, c, target, pole) {
    const pa = a.getWorldPosition(new THREE.Vector3()), pb = b.getWorldPosition(new THREE.Vector3()), pc = c.getWorldPosition(new THREE.Vector3());
    const l1 = pa.distanceTo(pb), l2 = pb.distanceTo(pc), dir = target.clone().sub(pa), d = Math.max(Math.abs(l1 - l2) + 0.001, Math.min(l1 + l2 - 0.001, dir.length()));
    dir.normalize();
    const side = pole.clone().sub(pa);
    side.addScaledVector(dir, -side.dot(dir)); if (side.lengthSq() < 1e-8) return;
    side.normalize();
    const cos = Math.max(-1, Math.min(1, (l1 * l1 + d * d - l2 * l2) / (2 * l1 * d))), knee = pa.clone().addScaledVector(dir, l1 * cos).addScaledVector(side, l1 * Math.sqrt(1 - cos * cos));
    aimBone(a, pb, knee); c.getWorldPosition(pc); aimBone(b, pc, target);
  }
  function poseApply(dt) {
    const step = (dt > 0 ? dt : 0) / crouch.in;
    crouch.w = crouch.want > crouch.w ? Math.min(crouch.want, crouch.w + step) : Math.max(crouch.want, crouch.w - step);
    const k = crouch.w * crouch.w * (3 - 2 * crouch.w), B = st.bones;
    if (!(k > 0.001) || !st.model || !B.hips || !B.footl || !B.handl) return;
    crouch.sv = POSE_BONES.filter((n) => B[n]).map((n) => [B[n], B[n].quaternion.clone(), B[n].position.clone()]);
    st.model.updateMatrixWorld(true);
    const yaw = hp.yaw || 0, fwd = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw)), right = new THREE.Vector3(-Math.cos(yaw), 0, Math.sin(yaw)), axis = new THREE.Vector3().crossVectors(UP, fwd);
    const feet = { l: B.footl.getWorldPosition(new THREE.Vector3()).addScaledVector(right, -crouch.wide), r: B.footr.getWorldPosition(new THREE.Vector3()).addScaledVector(right, crouch.wide) };
    const footQ = { l: B.footl.getWorldQuaternion(new THREE.Quaternion()), r: B.footr.getWorldQuaternion(new THREE.Quaternion()) };
    { const h = B.hips, par = h.parent; mA.copy(par.matrixWorld).invert(); h.getWorldPosition(vB); vC.copy(vB).addScaledVector(UP, -crouch.drop).applyMatrix4(mA); vB.applyMatrix4(mA); h.position.add(vC.sub(vB)); h.updateMatrixWorld(true); }
    for (const [n, a] of [['spine', crouch.spine], ['chest', crouch.chest], ['head', crouch.head]]) if (B[n]) turnWorld(B[n], qA.setFromAxisAngle(axis, a));
    for (const s of ['l', 'r']) {
      const sg = s === 'l' ? -1 : 1, up = B['upperleg' + s], lo = B['lowerleg' + s], ft = B['foot' + s];
      if (!up || !lo || !ft) continue;
      ik2(up, lo, ft, feet[s], up.getWorldPosition(new THREE.Vector3()).addScaledVector(fwd, 1).addScaledVector(right, crouch.knee * sg));
      ft.parent.getWorldQuaternion(qB); ft.quaternion.copy(qB.invert().multiply(footQ[s])); ft.updateMatrixWorld(true);
    }
    for (const s of ['l', 'r']) {
      const sg = s === 'l' ? -1 : 1, up = B['upperarm' + s], lo = B['lowerarm' + s], hd = B['hand' + s];
      if (!up || !lo || !hd) continue;
      const to = feet[s].clone().addScaledVector(UP, crouch.up).addScaledVector(fwd, crouch.fw);
      ik2(up, lo, hd, to, up.getWorldPosition(new THREE.Vector3()).addScaledVector(right, 0.7 * sg).addScaledVector(fwd, -0.3).addScaledVector(UP, 0.4));
    }
    if (k < 0.999) for (const [b, q, p] of crouch.sv) { const now = b.quaternion.clone(); b.quaternion.copy(q).slerp(now, k); b.position.lerp(p, 1 - k); }
    st.model.updateMatrixWorld(true);
  }
  // ── recovered (build 21) ── hold21: the right hand reaches to a world point (a tool's handle) — arm IK eased in and out over 0.25 s;
  // `last` keeps the point while the hand lets go
  const reach = { p: null, last: null, w: 0, sv: null };
  function reachUndo() { if (reach.sv) { for (const [b, q] of reach.sv) b.quaternion.copy(q); reach.sv = null; } }
  function reachApply(dt) {
    reach.w = Math.max(0, Math.min(1, reach.w + (reach.p ? 1 : -1) * (dt > 0 ? dt : 0) / 0.25));
    const p = reach.p || reach.last, B = st.bones, up = B.upperarmr, lo = B.lowerarmr, hd = B.handr;
    if (!(reach.w > 0.001) || !p || !up || !lo || !hd || !st.model) return;
    reach.sv = [up, lo, hd].map((b) => [b, b.quaternion.clone()]); st.model.updateMatrixWorld(true);
    const yaw = hp.yaw || 0;
    ik2(up, lo, hd, vA.set(p.x, p.y, p.z).clone(), up.getWorldPosition(new THREE.Vector3()).add(vB.set(-Math.cos(yaw) * 0.6, -0.8, Math.sin(yaw) * 0.6)));
    if (reach.w < 0.999) for (const [b, q] of reach.sv) { const now = b.quaternion.clone(); b.quaternion.copy(q).slerp(now, reach.w); }
    st.model.updateMatrixWorld(true);
  }
  // ── recovered (build 20) ── dust20: dust on his hands and feet (uD 0…1) and a glint of water on them (uG; uT its shimmer) — the robe's
  // material cloned once ('mage_dust20'), its skinned vertices weighted to the hands, feet, toes and hand slots
  const DUST = { uD: { value: 0 }, uG: { value: 0 }, uT: { value: 0 } };
  function dustMat(model) {
    let mat = null;
    model.traverse((n) => {
      if (!n.isSkinnedMesh || !n.material) return;
      const idx = (...names) => new THREE.Vector4(...names.map((x) => n.skeleton.bones.findIndex((b) => b.name === x)));
      if (!mat) {
        mat = n.material.clone();
        mat.customProgramCacheKey = () => 'dust20';
        mat.onBeforeCompile = (sh) => {
          Object.assign(sh.uniforms, DUST, { uJ: { value: idx('handl', 'handr', 'footl', 'footr') }, uK: { value: idx('toesl', 'toesr', 'handslotl', 'handslotr') } });
          sh.vertexShader = sh.vertexShader.replace('#include <skinning_pars_vertex>', `$&
uniform vec4 uJ,uK;varying float vD;varying vec3 vP;`).replace('#include <skinning_vertex>', `$&
vD=0.;for(int i=0;i<4;i++){float j=skinIndex[i];if(any(lessThan(abs(uJ-j),vec4(.5)))||any(lessThan(abs(uK-j),vec4(.5))))vD+=skinWeight[i];}vP=position;`);
          sh.fragmentShader = sh.fragmentShader.replace('#include <common>', `$&
uniform float uD,uG,uT;varying float vD;varying vec3 vP;float h2(vec3 p){return fract(sin(dot(floor(p*40.),vec3(12.99,78.23,37.72)))*43758.5);}`).replace('#include <map_fragment>', `$&
diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.5,.42,.31)*(.65+.5*h2(vP)),clamp(vD,0.,1.)*uD*.82);`).replace('#include <emissivemap_fragment>', `$&
totalEmissiveRadiance+=vec3(.62,.95,1)*clamp(vD,0.,1.)*uG*(.25+.75*pow(.5+.5*sin(uT*5.+h2(vP*.5+.13)*40.),6.));`);
        };
        mat.name = 'mage_dust20';
      }
      n.material = mat;
    });
  }
  const v = new THREE.Vector3();
  const worldOf = (b) => { if (!b) return null; b.getWorldPosition(v); return { x: v.x, y: v.y, z: v.z }; };
  const api = {
    ready, root, update, play, stop: () => { if (st.cur) { st.cur.stop(); st.cur = null; st.curName = ''; } st.acting = null; },
    free: () => { st.acting = null; }, hitStop: (s) => { st.stopUntil = st.t + Math.max(0, s || 0); },   // ── recovered (16–26c) ── (free: the act's clip may give way; hitStop(s): the frame held s seconds)
    bone: (n) => st.bones[n] || null, at: (n) => worldOf(st.bones[n]), handR: () => worldOf(st.bones['handslot.r'] || st.bones['hand.r']), handL: () => worldOf(st.bones['handslot.l'] || st.bones['hand.l']), head: () => worldOf(st.bones.head),
    // ── recovered (builds 20–21) ── pose20(on) → its weight · dust20(dust, glint) · p20 · hold21(point | null) → its weight · lift(h)
    pose20: (on) => { crouch.want = on ? 1 : 0; return crouch.w; },
    dust20: (dust, glint) => { DUST.uD.value = Math.max(0, Math.min(1, +dust || 0)); DUST.uG.value = Math.max(0, Math.min(1.5, +glint || 0)); DUST.uT.value = st.t; },
    get p20() { return { w: crouch.w, want: crouch.want, dust: DUST.uD.value, glint: DUST.uG.value }; },
    hold21: (p) => { reach.p = p && Number.isFinite(p.x) ? { x: p.x, y: p.y, z: p.z } : null; if (reach.p) reach.last = reach.p; return reach.w; },
    lift: (h) => { st.lift = +h || 0; },
    get loaded() { return st.loaded; }, get err() { return st.err; },
    state: () => ({ loaded: st.loaded, err: st.err, clip: st.curName, acting: st.acting ? st.acting.name : null, sp: +st.sp.toFixed(1), rate: st.cur ? +st.cur.getEffectiveTimeScale().toFixed(2) : 0, slip: st.gait ? st.gait.slip : 0 /* ── recovered (16–26c) ── */, n: st.n, clips: Object.keys(st.clips).length, vis: root.visible, pos: [+root.position.x.toFixed(1), +root.position.y.toFixed(1), +root.position.z.toFixed(1)] }),
    destroy() { try { if (scene) scene.remove(root); } catch (e) { /* */ } try { const m = S && S.hero && S.hero.mesh; if (m && st.hidOld) m.visible = !!hp.vis; } catch (e) { /* */ } st.loaded = false; },
  };
  try { globalThis.__HERO35 = api; } catch (e) { /* */ }
  return api;
}
