/* ── build 71 ── crew71.js — THE CREWS AS REAL PEOPLE (the owner, 2.11, on the wall's crews: "נשארנו עם הדמויות האלה או שזה ישתנה בגרסאות
 * הבאות?"): the crews near the camera are drawn as the kohen is (hero35: the rigged, animated glTF — assets/kohen.glb, the CC0 KayKit
 * "Adventurers" body), each in his own tunic colour with his crew's head cloth and belt; the far ones stay actors.js's instanced figures (a
 * level of detail: one draw call for a hundred far figures, a real body for the few near). A real figure follows its actor every frame —
 * crews.js still decides where each man is, what he does and when his blow lands: his place, his facing, his size; his clip from what he
 * is doing (walking → Walking_A at his pace; a mason's or digger's stroke → 2H_Melee_Attack_Chop, its blow on crews.js's blow (the
 * stroke's phase u, the blow at 0.66 — the build-65 beat stays the act's); sitting → Sit_Floor_Idle; the cheer → Cheer; else Idle); his
 * tool in his right hand. The actor itself is not drawn while its real figure stands for it (actors.js a.lod71).
 *   const C = createCrew71({ scene, camera, crews, stages })   (stages.js's own site workers too — the wall's masons on its scaffold: workers71()) → C.update(dt) · C.state() · C.ready (Promise) · C.setEnabled(v)
 * Pure: pick71, clip71, strikeT71, tunic71, scale71. ?h71=0: the instanced figures only. Never a Divine Name. ── /build 71 ── */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone as skClone } from 'three/addons/utils/SkeletonUtils.js';
import KOHEN_URL from '../assets/kohen.glb';

export const CREW71 = Object.freeze({
  n: 10, near: 95, keep: 110, behind: -6,   // (at most n real figures; a new one within near amot; kept until past keep; not when this far behind the camera)
  model: 1.6, modelH: 3.96, actorH: 2.95, workerH: 3.55,   // (stages.js's site worker: his head's top at 3.6)
    // (hero35's scale and the height it gives; an actors.js figure's height at s 1 — its head's top, 3.08 less the cloth)
  strikeHit: 0.66, walkAt: 0.18, walkRate: 0.42,   // (crews.js's blow in the stroke; walking from this wk; the clip's rate per amah/s)
  tunics: Object.freeze(['#D6C8A8', '#B49B76', '#9C8466', '#E2D6BE']),   // (crews.js's TUNIC, four of them: one texture each)
  robeMin: 200,   // (the kohen's texture: a pixel whose r, g and b are all over this is the robe's linen)
});

/** the real figures for this frame: cands [{ id, x, y, z }], the camera { x, y, z, fx, fz } (its forward on the ground, unit), cur (a Set of
 *  the ids standing now) → the ids to stand (a Set): those standing kept while within keep; then the nearest new within near, not behind */
export function pick71(cands, cam, cur, c = CREW71) {
  const out = new Set(), d2 = (p) => (p.x - cam.x) ** 2 + (p.y - cam.y) ** 2 + (p.z - cam.z) ** 2;
  const ahead = (p) => (p.x - cam.x) * (cam.fx || 0) + (p.z - cam.z) * (cam.fz || 0) > c.behind;
  for (const p of cands) if (cur && cur.has(p.id) && d2(p) <= c.keep * c.keep && ahead(p)) out.add(p.id);
  const rest = cands.filter((p) => !out.has(p.id) && d2(p) <= c.near * c.near && ahead(p)).sort((a, b) => d2(a) - d2(b));
  for (const p of rest) { if (out.size >= c.n) break; out.add(p.id); }
  return out;
}

/** his clip from what crews.js has him doing: w { role, st, cheer, u71 }, a { wk, kn, speed, path } → { name, rate, sync } (sync: the
 *  stroke's phase u, the clip's time to be set from it) */
export function clip71(w, a, c = CREW71) {
  if (w.cheer > 0) return { name: 'Cheer', rate: 1 };
  if (a.kn > 0.5) return { name: 'Sit_Floor_Idle', rate: 1 };
  if (a.wk > c.walkAt && a.path) return { name: 'Walking_A', rate: Math.max(0.6, Math.min(1.6, (a.speed || 2.6) * c.walkRate)) };
  if ((w.role === 'mason' || w.role === 'digger') && Number.isFinite(w.u71)) return { name: '2H_Melee_Attack_Chop', rate: 0, sync: w.u71 };
  if (w.role === 'lever') return { name: 'Interact', rate: 1 };
  return { name: 'Idle', rate: 1 };
}

/** the clip's time for the stroke's phase u: crews.js's blow (u = hit) on the clip's own blow (hitT s into it, dur long) */
export function strikeT71(u, hitT, dur, c = CREW71) { const k = (((u - c.strikeHit) % 1) + 1) % 1; return ((hitT + k * dur) % dur + dur) % dur; }

/** the nearest of the four tunics to his own colour (hex) → its index */
export function tunic71(hex, c = CREW71) {
  const v = (h) => { const n = parseInt(String(h || '#D6C8A8').replace('#', ''), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  const q = v(hex); let bi = 0, bd = Infinity; c.tunics.forEach((t, i) => { const p = v(t), d = (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2; if (d < bd) { bd = d; bi = i; } }); return bi;
}

/** the model's scale for an actor of size s: his height as the instanced figure's */
export function scale71(s, c = CREW71) { return (c.model * (c.actorH * (s || 1))) / c.modelH; }

export function createCrew71(o = {}) {
  const scene = o.scene, camera = o.camera, crews = o.crews, stages = o.stages || null;
  const st = { on: o.enabled !== false, loaded: false, err: null, gltf: null, mats: [], hitT: 0.5, dur: 1, figs: [], by: new Map(), n: 0 };
  const root = new THREE.Group(); root.name = 'crew71'; if (scene) scene.add(root);
  const loader = new GLTFLoader(); try { loader.setMeshoptDecoder(MeshoptDecoder); } catch (e) { /* */ }
  const ready = new Promise((res) => {
    loader.load(o.url || KOHEN_URL, (g) => { try { st.gltf = g; prep(g); st.loaded = true; } catch (e) { st.err = String(e && e.message); } res(st.loaded); }, undefined, (e) => { st.err = String(e && (e.message || e)); res(false); });
  });
  /** the four tunics: the kohen's texture with its linen dyed (the skin, the hair and the eyes kept) */
  function prep(g) {
    let tex = null; g.scene.traverse((n) => { if (!tex && n.isMesh && n.material && n.material.map) tex = n.material.map; });
    const img = tex && tex.image;
    st.mats = CREW71.tunics.map((hex) => {
      let map = tex;
      try {
        if (img && typeof document !== 'undefined') {
          const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height; const x = cv.getContext('2d'); x.drawImage(img, 0, 0);
          const d = x.getImageData(0, 0, cv.width, cv.height), p = d.data, hn = parseInt(hex.slice(1), 16), R = (hn >> 16) & 255, G = (hn >> 8) & 255, B = hn & 255;   // (the texture's own sRGB values)
          for (let i = 0; i < p.length; i += 4) if (p[i] > CREW71.robeMin && p[i + 1] > CREW71.robeMin && p[i + 2] > CREW71.robeMin) { const k = (p[i] + p[i + 1] + p[i + 2]) / 765; p[i] = R * k; p[i + 1] = G * k; p[i + 2] = B * k; }
          x.putImageData(d, 0, 0); map = new THREE.CanvasTexture(cv); map.flipY = tex.flipY; map.colorSpace = tex.colorSpace; map.magFilter = tex.magFilter; map.minFilter = tex.minFilter; map.needsUpdate = true;
        }
      } catch (e) { map = tex; }
      return new THREE.MeshStandardMaterial({ map, roughness: 0.9, metalness: 0, side: THREE.DoubleSide });
    });
    // the clip's blow: where the right hand is lowest in the chop
    const clip = g.animations.find((a) => a.name === '2H_Melee_Attack_Chop');
    if (clip) {
      st.dur = clip.duration;
      try {
        const m = skClone(g.scene), mx = new THREE.AnimationMixer(m), act = mx.clipAction(clip); act.play(); let hand = null; m.traverse((n) => { if (n.name === 'handslotr' || n.name === 'handslot.r') hand = n; });   // (GLTFLoader drops the dot in a bone's name)
        let lo = Infinity; const v = new THREE.Vector3();
        for (let i = 0; i <= 40; i++) { const t = (clip.duration * i) / 40; mx.setTime(t); m.updateMatrixWorld(true); if (hand) { hand.getWorldPosition(v); if (v.y < lo) { lo = v.y; st.hitT = t; } } }
      } catch (e) { st.hitT = clip.duration * 0.45; }
    }
  }
  const TOOL = {};
  function tool(kind) {
    if (TOOL[kind]) return TOOL[kind].clone();
    const wood = new THREE.MeshStandardMaterial({ color: '#7A5634', roughness: 0.9 }), iron = new THREE.MeshStandardMaterial({ color: '#5A5A60', roughness: 0.6, metalness: 0.3 });
    const g = new THREE.Group(), h = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, kind === 'staff' ? 1.6 : 0.85, 6), wood); h.position.y = kind === 'staff' ? 0.2 : 0.3; g.add(h);
    if (kind === 'pick') { const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.07, 0.62), iron); p.position.y = 0.7; g.add(p); }
    else if (kind === 'hammer' || kind === 'mallet') { const p = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.34), kind === 'mallet' ? wood : iron); p.position.y = 0.7; g.add(p); }
    TOOL[kind] = g; return g.clone();
  }
  /** one real figure: the body (a skinned clone), its mixer, the head cloth and the belt in his crew's colour, a tool in the right hand */
  function make() {
    const g = st.gltf, m = skClone(g.scene); const B = {}; m.traverse((n) => { if (n.name) B[n.name] = n; if (n.isMesh) { n.castShadow = true; n.frustumCulled = false; } });
    const f = { m, B, mixer: new THREE.AnimationMixer(m), cur: null, curName: '', id: null, ti: -1, tool: undefined, toolM: null, cloth: null, belt: null };
    if (B.head) { const c = new THREE.Mesh(new THREE.SphereGeometry(0.52, 14, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), new THREE.MeshStandardMaterial({ color: '#2F6DB5', roughness: 0.95 })); c.position.y = 0.62; c.scale.y = 0.8; c.userData.prop71 = 1; B.head.add(c); f.cloth = c; }   // (the head cloth: a cap of cloth, his crew's colour — illustration)
    const sp = B.spine || B.chest; if (sp) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.13, 18, 1, true), new THREE.MeshStandardMaterial({ color: '#2F6DB5', roughness: 0.9, side: THREE.DoubleSide })); b.position.y = 0.12; b.userData.prop71 = 1; sp.add(b); f.belt = b; }
    root.add(m); m.visible = false; return f;
  }
  function play(f, c) {
    const clip = st.gltf.animations.find((a) => a.name === c.name) || st.gltf.animations.find((a) => a.name === 'Idle'); if (!clip) return;
    if (f.curName !== c.name) { const a = f.mixer.clipAction(clip); a.reset(); a.setLoop(THREE.LoopRepeat, Infinity); a.enabled = true; a.setEffectiveWeight(1); if (f.cur && f.cur !== a) a.crossFadeFrom(f.cur, 0.2, true); a.play(); f.cur = a; f.curName = c.name; }
    if (c.sync != null) { f.cur.setEffectiveTimeScale(0); f.cur.time = strikeT71(c.sync, st.hitT, st.dur); } else f.cur.setEffectiveTimeScale(c.rate || 1);
  }
  const fwd = new THREE.Vector3(), C2 = new THREE.Color();
  /** every man who may get a real figure, from both sources: crews.js's people (actors) and stages.js's site workers → { id, x, y, z, yaw, s, tunic, cloth, white, tool, clip, set(v) } */
  function gather() {
    const out = [];
    if (crews && crews.enabled !== false) for (const w of crews._people || []) {
      const a = w.a; if (!a || w.gone || w.role === 'off' || a.vis < 0.5 || !a.alive || (a.K && a.K.m && !a.K.m.visible)) continue;
      out.push({ id: a, x: a.x, y: a.y, z: a.z, yaw: a.yaw || 0, h: CREW71.actorH * (a.s || 1.1), tunic: w.tunic || '#E2D6BE', cloth: a.col2, white: a.variant === 'kohen', tool: w.tool, clip: () => clip71(w, a), set: (v) => { a.lod71 = v; } });
    }
    const S = stages && stages.workers71 ? stages.workers71() : null;
    if (S && S.on) for (let i = 0; i < S.n; i++) {
      const w = S.W[i]; if (!w || !w.st || !Number.isFinite(w.x71)) continue;
      const r = w.role, tool = (r === 'mason' || r === 'dig') && !w.field71 ? (r === 'dig' ? 'pick' : 'hammer') : null;
      out.push({ id: w, x: w.x71, y: w.y71, z: w.z71, yaw: w.yaw || 0, h: CREW71.workerH, tunic: '#' + S.pal[i % S.pal.length].getHexString(), cloth: CLOTH_W, white: false, tool,
        clip: () => (w.u71 != null && !w.field71 ? { name: '2H_Melee_Attack_Chop', rate: 0, sync: w.u71 } : w.moving71 ? { name: 'Walking_A', rate: 1.1 } : r === 'winch' || r.startsWith('mk') || w.field71 ? { name: 'Interact', rate: 1 } : { name: 'Idle', rate: 1 }),
        set: (v) => { w.lod71 = v; } });
    }
    return out;
  }
  const CLOTH_W = new THREE.Color('#E4DAC4');
  function update(dt) {
    if (!st.loaded) return;
    const cands = st.on && camera ? gather() : [];
    let want = new Set();
    if (cands.length) { camera.getWorldDirection(fwd); const L = Math.hypot(fwd.x, fwd.z) || 1; want = pick71(cands, { x: camera.position.x, y: camera.position.y, z: camera.position.z, fx: fwd.x / L, fz: fwd.z / L }, new Set(st.by.keys())); }
    const byId = new Map(cands.map((c) => [c.id, c]));
    for (const [id, f] of st.by) if (!want.has(id)) { if (f.set) f.set(false); f.id = null; f.set = null; f.m.visible = false; st.by.delete(id); }
    for (const id of want) {
      const c = byId.get(id); if (!c) continue;
      let f = st.by.get(id);
      if (!f) { f = st.figs.find((q) => !q.id) || null; if (!f) { if (st.figs.length >= CREW71.n) continue; f = make(); st.figs.push(f); } f.id = id; f.set = c.set; st.by.set(id, f); c.set(true); f.curName = ''; }
      const ti = c.white ? -2 : tunic71(c.tunic);
      if (f.ti !== ti) { f.ti = ti; const mat = ti >= 0 ? st.mats[ti] : null; f.m.traverse((n) => { if (n.isMesh && !n.userData.prop71) { if (!n.userData.m0) n.userData.m0 = n.material; n.material = mat || n.userData.m0; } }); }
      if (f.cloth) { f.cloth.material.color.copy(c.cloth || C2.set('#2F6DB5')); f.cloth.visible = !c.white; }
      if (f.belt) f.belt.material.color.copy(c.white ? C2.set('#E8DCC0') : c.cloth || C2.set('#2F6DB5'));
      const tk = c.tool === 'pick' || c.tool === 'hammer' || c.tool === 'mallet' || c.tool === 'staff' ? c.tool : null;
      if (f.tool !== tk) { f.tool = tk; if (f.toolM) { if (f.toolM.parent) f.toolM.parent.remove(f.toolM); f.toolM = null; } const hb = f.B.handslotr || f.B['handslot.r']; if (tk && hb) { f.toolM = tool(tk); f.toolM.traverse((n) => { n.userData.prop71 = 1; }); hb.add(f.toolM); } }
      f.m.visible = true; f.m.position.set(c.x, c.y, c.z); f.m.rotation.y = c.yaw; f.m.scale.setScalar((CREW71.model * c.h) / CREW71.modelH);
      play(f, c.clip());
      f.mixer.update(dt);
    }
    st.n = st.by.size;
  }
  function setEnabled(v) { st.on = !!v; if (!st.on) for (const [id, f] of st.by) { if (f.set) f.set(false); f.id = null; f.m.visible = false; st.by.delete(id); } }
  return { update, ready, setEnabled, root, state: () => ({ on: st.on, loaded: st.loaded, err: st.err, n: st.n, figs: st.figs.length, hitT: +st.hitT.toFixed(3), dur: +st.dur.toFixed(3), clips: [...st.by.values()].map((f) => f.curName) }) };
}
