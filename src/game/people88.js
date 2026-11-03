/* ── build 88 ── people88.js — THE PEOPLE OF THE WORLD, DRESSED (the owner, 3.11: "הדמויות, העגלה ומתקן הורדה נראות רחוק מאוד ממצב יפה …
 * בוא נבנה עולם טוב יותר. יפה יותר. מעניין יותר"): a grown man's body in real proportions (assets/man88.glb — Quaternius's CC0 "Universal Base
 * Characters", tools/people88-glb.mjs) moving with the Universal Animation Library (assets/anim88.glb: walk, the formal walk of a procession,
 * push, kneel and work, pick up, talk …), dressed here, at load, in the clothes of the time instead of a game outfit:
 *   · a kohen — the כתונת of white linen, sleeves to the wrist and long to the feet (Exodus 28:39–40; the sleeve to the wrist: Yoma 72b — המחשה),
 *     the אבנט wound about the waist (blue, purple and scarlet on linen: Yoma 12b, Rambam Kelei HaMikdash 8:1 — המחשה), the מגבעת on the head,
 *     barefoot (the service is barefoot: Zevachim 24a — המחשה);
 *   · a worker — a knee-length tunic of undyed or dyed wool, a belt, a head cloth, a beard (המחשה).
 * The garments are made from the body itself: every triangle the cloth covers is copied, pushed out along its normal and keeps the body's
 * skin weights, so the cloth moves exactly with the body; the skirt is a lathe from the waist down, skinned to the hips and thighs.
 *   const P = createPeople88({ scene }) → P.ready (Promise<bool>) · P.make({ white, tunic, cloth, beard, clip, scale, height }) → fig
 *   { root, B, play(name, rate), bend(k), update(dt), at(name) } · P.clear() · P.loaded
 * Old clip names (the KayKit body's) are mapped: Idle, Walking_A, Walking_B, Running_A, PickUp, Interact, Use_Item, Cheer, 2H_Melee_Attack_Chop …
 * Never a Divine Name. ── /build 88 ── */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { clone as skClone } from 'three/addons/utils/SkeletonUtils.js';

export const PEOPLE88 = Object.freeze({
  height: 1.0,                              // (the model's own height is ~1.8 m; make() scales to opt.height when given)
  linen: '#F3EEE2', sash: ['#2C4C9A', '#6A2E8C', '#B42A3C', '#EFE9DA'],
  wool: Object.freeze(['#9C8462', '#7E6A4E', '#A88F6C', '#6C5A44', '#8E7356', '#5E6B4E', '#7A4E3A']),
  cloth: Object.freeze(['#D9CBB0', '#B89A70', '#8A6A48', '#E6DCC8', '#6F5B44']),
  beard: Object.freeze(['#5A4330', '#6B4E36', '#4A3828', '#7A5A3E', '#8E8478']),
  push: 0.016, smooth: 6,                   // (the cloth stands off the skin, metres; smoothing passes take the body's muscles out of it)
  clip: Object.freeze({ Idle: 'Idle_Loop', Walking_A: 'Walk_Loop', Walking_B: 'Walk_Formal_Loop', Running_A: 'Jog_Fwd_Loop', PickUp: 'PickUp_Table', Interact: 'Interact', Use_Item: 'Fixing_Kneeling', Cheer: 'Spell_Simple_Enter', Spellcast_Raise: 'Spell_Simple_Enter', Throw: 'Interact', '2H_Melee_Attack_Chop': 'Sword_Attack', '1H_Melee_Attack_Chop': 'Sword_Attack', Sit_Floor_Idle: 'Sitting_Idle_Loop', Sit_Floor_Down: 'Crouch_Idle_Loop', Sit_Floor_StandUp: 'Crouch_Idle_Loop', Unarmed_Idle: 'Idle_Loop', Lie_Idle: 'Sitting_Idle_Loop', Hit_A: 'Idle_Loop', Jump_Full_Short: 'Idle_Loop', 'T-Pose': 'Idle_Loop' }),
  bend: Object.freeze({ spine_01: 0.42, spine_02: 0.3, spine_03: 0.22, Head: 0.2 }),
  bones: Object.freeze({ head: 'Head', spine: 'spine_01', chest: 'spine_03', neck: 'neck_01', 'handslot.l': 'hand_l', handslotl: 'hand_l', 'hand.r': 'hand_r', 'hand.l': 'hand_l', handr: 'hand_r', handl: 'hand_l', hips: 'pelvis', upperarml: 'upperarm_l', upperarmr: 'upperarm_r', lowerarml: 'lowerarm_l', lowerarmr: 'lowerarm_r', upperlegl: 'thigh_l', upperlegr: 'thigh_r', lowerlegl: 'calf_l', lowerlegr: 'calf_r', footl: 'foot_l', footr: 'foot_r', toesl: 'ball_l', toesr: 'ball_r' }),   // (the KayKit body's names, for code written for it)
});
export const clipName88 = (n) => PEOPLE88.clip[n] || n;

let G = null;
function load() {
  if (G) return G;
  G = new Promise((res) => {
    const L = new GLTFLoader(); try { L.setMeshoptDecoder(MeshoptDecoder); } catch (e) { /* */ }
    const one = (u) => new Promise((ok) => L.load(u, ok, undefined, () => ok(null)));
    import('./people88assets.js').then((F) => Promise.all([one(F.MAN_URL), one(F.ANIM_URL)])).then(([m, a]) => res(m && a ? { scene: m.scene, animations: a.animations } : null)).catch(() => res(null));
  });
  return G;
}

// ── the tailor (pure on geometry: exported for the tests) ──
const CUT = Object.freeze({
  shirt: /^(spine_0[123]|pelvis|clavicle_[lr]|upperarm_[lr])$/,
  sleeve: /^(lowerarm_[lr])$/,
  leg: /^(thigh_[lr]|calf_[lr])$/,
});
/** which part a vertex is: the bone that holds most of it. names[i] = the bone name of joint index i. */
export function partOf88(names, si, sw, i) {
  let best = -1, bw = -1; for (let k = 0; k < 4; k++) { const w = sw[i * 4 + k]; if (w > bw) { bw = w; best = si[i * 4 + k]; } }
  const n = names[best] || ''; return CUT.shirt.test(n) ? 'shirt' : CUT.sleeve.test(n) ? 'sleeve' : CUT.leg.test(n) ? 'leg' : n === 'Head' || n === 'neck_01' ? 'head' : 'other';
}
/** copy the triangles of the body the cloth covers, pushed out along the normal; same skin weights. keep(part, v) → bool */
export function tailor88(geo, names, keep, push = PEOPLE88.push, smooth = PEOPLE88.smooth) {
  const P = geo.getAttribute('position'), N = geo.getAttribute('normal'), SI = geo.getAttribute('skinIndex'), SW = geo.getAttribute('skinWeight'), UV = geo.getAttribute('uv');
  const idx = geo.index ? geo.index.array : null, tri = idx ? idx.length / 3 : P.count / 3;
  const si = new Float32Array(SI.count * 4), sw = new Float32Array(SW.count * 4);
  for (let i = 0; i < SI.count; i++) for (let k = 0; k < 4; k++) { si[i * 4 + k] = SI.getComponent(i, k); sw[i * 4 + k] = SW.getComponent(i, k); }
  const take = new Uint8Array(P.count), part = new Array(P.count), v = new THREE.Vector3();
  for (let i = 0; i < P.count; i++) { part[i] = partOf88(names, si, sw, i); v.fromBufferAttribute(P, i); take[i] = keep(part[i], v, i) ? 1 : 0; }
  const map = new Int32Array(P.count).fill(-1), pos = [], nor = [], ski = [], skw = [], uv = [], out = [];
  const at = (i) => {
    if (map[i] >= 0) return map[i];
    const n = new THREE.Vector3().fromBufferAttribute(N, i).normalize(); v.fromBufferAttribute(P, i).addScaledVector(n, push);
    pos.push(v.x, v.y, v.z); nor.push(n.x, n.y, n.z); for (let k = 0; k < 4; k++) { ski.push(si[i * 4 + k]); skw.push(sw[i * 4 + k]); }
    if (UV) uv.push(UV.getX(i), UV.getY(i)); return (map[i] = pos.length / 3 - 1);
  };
  for (let t = 0; t < tri; t++) {
    const a = idx ? idx[t * 3] : t * 3, b = idx ? idx[t * 3 + 1] : t * 3 + 1, c = idx ? idx[t * 3 + 2] : t * 3 + 2;
    if (take[a] + take[b] + take[c] >= 2) out.push(at(a), at(b), at(c));
  }
  // (cloth hangs, it does not cling: a few Laplacian passes over the copy, its seams welded by position)
  if (smooth > 0 && pos.length) {
    const n = pos.length / 3, key = new Map(), id = new Int32Array(n);
    for (let i = 0; i < n; i++) { const k = Math.round(pos[i * 3] * 2000) + ',' + Math.round(pos[i * 3 + 1] * 2000) + ',' + Math.round(pos[i * 3 + 2] * 2000); if (!key.has(k)) key.set(k, key.size); id[i] = key.get(k); }
    const m = key.size, nb = Array.from({ length: m }, () => new Set()), P2 = new Float64Array(m * 3), cnt = new Uint16Array(m);
    for (let t = 0; t < out.length; t += 3) for (let e = 0; e < 3; e++) { const a = id[out[t + e]], b = id[out[t + (e + 1) % 3]]; if (a !== b) { nb[a].add(b); nb[b].add(a); } }
    for (let i = 0; i < n; i++) { const j = id[i]; if (!cnt[j]) { P2[j * 3] = pos[i * 3]; P2[j * 3 + 1] = pos[i * 3 + 1]; P2[j * 3 + 2] = pos[i * 3 + 2]; } cnt[j]++; }
    const edge = new Uint8Array(m); for (let j = 0; j < m; j++) if (nb[j].size < 4) edge[j] = 1;
    for (let it = 0; it < smooth; it++) { const Q = Float64Array.from(P2); for (let j = 0; j < m; j++) { if (edge[j] || !nb[j].size) continue; let x = 0, y = 0, z = 0; for (const q of nb[j]) { x += P2[q * 3]; y += P2[q * 3 + 1]; z += P2[q * 3 + 2]; } const k = nb[j].size; Q[j * 3] = P2[j * 3] * 0.5 + (x / k) * 0.5; Q[j * 3 + 1] = P2[j * 3 + 1] * 0.5 + (y / k) * 0.5; Q[j * 3 + 2] = P2[j * 3 + 2] * 0.5 + (z / k) * 0.5; } P2.set(Q); }
    // (never into the body: whatever the smoothing pulled in under the skin's own offset goes back out along the normal)
    for (let i = 0; i < n; i++) { const j = id[i], dx = P2[j * 3] - pos[i * 3], dy = P2[j * 3 + 1] - pos[i * 3 + 1], dz = P2[j * 3 + 2] - pos[i * 3 + 2], nx = nor[i * 3], ny = nor[i * 3 + 1], nz = nor[i * 3 + 2], dn = dx * nx + dy * ny + dz * nz, add = dn < 0 ? -dn : 0;
      pos[i * 3] += dx + nx * add; pos[i * 3 + 1] += dy + ny * add; pos[i * 3 + 2] += dz + nz * add; }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
  g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(ski, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skw, 4));
  if (uv.length) g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(out); if (smooth > 0) g.computeVertexNormals(); return g;
}
/** the skirt: a lathe from y0 (waist) to y1 (hem) round centre c; weights: the waist on the spine/pelvis, below on the thigh of its side. */
export function skirt88(c, y0, y1, r0, r1, j, H = 12, R = 28) {
  const pos = [], si = [], sw = [], idx = [];
  for (let h = 0; h <= H; h++) {
    const t = h / H, y = y0 + (y1 - y0) * t, rad = r0 + (r1 - r0) * t;
    for (let k = 0; k <= R; k++) {
      const a = (k / R) * Math.PI * 2, sx = Math.sin(a), cz = Math.cos(a);
      pos.push(c.x + sx * rad * 1.12, y, c.z + cz * rad * 0.9 + 0.01);
      const wS = Math.max(0, 1 - t * 5), tl = Math.max(0, Math.min(1, (t - 0.1) / 0.55)), wP = (1 - tl) * (1 - wS), side = 0.5 + 0.5 * Math.max(-1, Math.min(1, sx * 1.5));
      const w = [wS, wP, tl * side, tl * (1 - side)], s = w[0] + w[1] + w[2] + w[3];
      si.push(j.spine, j.pelvis, j.thighL, j.thighR); sw.push(w[0] / s, w[1] / s, w[2] / s, w[3] / s);
    }
  }
  for (let h = 0; h < H; h++) for (let k = 0; k < R; k++) { const a = h * (R + 1) + k, b = a + R + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(si, 4)); g.setAttribute('skinWeight', new THREE.Float32BufferAttribute(sw, 4));
  g.setIndex(idx); g.computeVertexNormals(); return g;
}

// a woven cloth texture (canvas), tinted per colour
const TEX = {};
function clothTex(hex, kind) {
  const key = hex + kind; if (TEX[key]) return TEX[key];
  if (typeof document === 'undefined') return null;
  const S = 128, cv = document.createElement('canvas'); cv.width = cv.height = S; const x = cv.getContext('2d');
  const c = new THREE.Color(hex), d = x.createImageData(S, S), p = d.data; let s = 0x9e3779b9 ^ hex.length;
  const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
  for (let yy = 0; yy < S; yy++) for (let xx = 0; xx < S; xx++) {
    const w = kind === 'linen' ? 0.035 : kind === 'hair' ? 0.22 : 0.07, weave = kind === 'hair' ? Math.sin(xx * 2.1 + Math.sin(yy * 0.3) * 2) * w * 0.6 : ((xx + (yy & 1)) % 2 ? 1 : -1) * w * 0.5 + (Math.sin(yy * 0.9) * 0.5 + Math.sin(xx * 0.7) * 0.5) * w * 0.4;
    const slub = rnd() < 0.02 ? -w : 0, k = 1 + weave + slub + (rnd() - 0.5) * w * 0.6, i = (yy * S + xx) * 4;
    p[i] = Math.min(255, c.r * 255 * k); p[i + 1] = Math.min(255, c.g * 255 * k); p[i + 2] = Math.min(255, c.b * 255 * k); p[i + 3] = 255;
  }
  x.putImageData(d, 0, 0); const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); t.colorSpace = THREE.SRGBColorSpace;
  return (TEX[key] = t);
}
const MATS = {};
function clothMat(hex, kind) {
  const key = hex + kind; if (MATS[key]) return MATS[key];
  const map = clothTex(hex, kind);
  return (MATS[key] = new THREE.MeshStandardMaterial({ color: map ? '#ffffff' : hex, map, roughness: kind === 'linen' ? 0.88 : 0.97, metalness: 0, side: THREE.DoubleSide }));
}
const pick = (arr, n) => arr[((n % arr.length) + arr.length) % arr.length];

export function createPeople88(o = {}) {
  const scene = o.scene, root = new THREE.Group(); root.name = 'people88'; if (scene) scene.add(root);
  const st = { g: null, loaded: false, figs: [], n: 0, cut: null };
  const ready = load().then((g) => { st.g = g; st.loaded = !!g; return st.loaded; });
  const qA = new THREE.Quaternion(), qB = new THREE.Quaternion(), qC = new THREE.Quaternion(), UP = new THREE.Vector3(0, 1, 0), FW = new THREE.Vector3(), AX = new THREE.Vector3();

  function make(opt = {}) {
    if (!st.loaded) return null;
    const seed = opt.seed != null ? opt.seed : st.n++;
    const m = skClone(st.g.scene), B = {}; let body = null;
    m.traverse((n) => { if (n.name) B[n.name] = n; if (n.isMesh) { n.castShadow = true; n.frustumCulled = false; if (n.isSkinnedMesh && /superhero/i.test(n.name)) body = n; } });
    for (const [a, b] of Object.entries(PEOPLE88.bones)) if (!B[a] && B[b]) B[a] = B[b];
    m.updateMatrixWorld(true);
    if (body) {
      const sk = body.skeleton, names = sk.bones.map((b) => b.name), J = (n) => names.indexOf(n);
      const white = !!opt.white, color = white ? PEOPLE88.linen : opt.tunic || pick(PEOPLE88.wool, seed), kind = white ? 'linen' : 'wool';
      // (the shirt: the torso and the upper arms; the kohen's sleeves run to the wrist, a worker's to the elbow)
      const g = body.geometry;
      const shirt = tailor88(g, names, (part) => part === 'shirt' || (white && part === 'sleeve'));
      const sm = new THREE.SkinnedMesh(shirt, clothMat(color, kind)); sm.name = 'shirt88'; sm.castShadow = true; sm.frustumCulled = false;
      body.parent.add(sm); sm.position.copy(body.position); sm.quaternion.copy(body.quaternion); sm.scale.copy(body.scale); sm.updateMatrixWorld(true); sm.bind(sk, body.bindMatrix);
      // (the skirt, in the body's bind space: to the feet for a kohen, to the knee for a worker)
      const bp = (n) => new THREE.Vector3().setFromMatrixPosition(new THREE.Matrix4().copy(sk.boneInverses[J(n)]).invert());   // (a joint where the body was bound)
      const pel = bp('pelvis'), y0 = bp('spine_02').y * 0.5 + pel.y * 0.5, foot = bp('foot_l'), knee = bp('calf_l');
      const y1 = white ? foot.y + 0.05 : knee.y - 0.04, hipR = Math.abs(bp('thigh_l').x - bp('thigh_r').x) * 0.5 + 0.1;
      const sg = skirt88(pel, y0, y1, hipR, white ? hipR + 0.05 : hipR + 0.035, { spine: J('spine_01'), pelvis: J('pelvis'), thighL: J('thigh_l'), thighR: J('thigh_r') });
      sg.applyMatrix4(body.bindMatrixInverse); sg.computeVertexNormals();
      const sk2 = new THREE.SkinnedMesh(sg, clothMat(color, kind)); sk2.name = 'skirt88'; sk2.castShadow = true; sk2.frustumCulled = false;
      body.parent.add(sk2); sk2.position.copy(body.position); sk2.quaternion.copy(body.quaternion); sk2.scale.copy(body.scale); sk2.updateMatrixWorld(true); sk2.bind(sk, body.bindMatrix);
      // (the sash, the cap or the head cloth, and the beard: on the bones, placed in the rest pose)
      const head = B.Head, sp = B.spine_01;
      const hb = new THREE.Box3(); { const P = g.getAttribute('position'), SI = g.getAttribute('skinIndex'), SW = g.getAttribute('skinWeight'), hj = J('Head'), v = new THREE.Vector3();
        for (let i = 0; i < P.count; i++) { let w = 0; for (let k = 0; k < 4; k++) if (SI.getComponent(i, k) === hj) w += SW.getComponent(i, k); if (w > 0.8) { body.getVertexPosition(i, v).applyMatrix4(body.matrixWorld); hb.expandByPoint(v); } } }
      const hc = hb.getCenter(new THREE.Vector3()), hs = hb.getSize(new THREE.Vector3()); if (typeof window !== "undefined" && window.__P88DBG) console.log("p88 head", JSON.stringify(hc), JSON.stringify(hs), !!head, J("Head"));
      if (sp) {
        const cols = white ? PEOPLE88.sash : [opt.cloth || pick(PEOPLE88.cloth, seed + 2)];
        const pw = B.pelvis.getWorldPosition(new THREE.Vector3()), yb = y0 + (pw.y - pel.y) + 0.02;
        cols.forEach((c, i) => {
          const r = new THREE.Mesh(new THREE.CylinderGeometry(hipR * 1.13, hipR * 1.15, 0.075 / cols.length * (white ? 1.6 : 1), 24, 1, true), clothMat(c, 'wool'));
          r.scale.z = 0.82; if (!white) r.userData.cloth88 = 1; r.position.set(pw.x, yb + 0.07 - (i + 0.5) * 0.075 / cols.length * (white ? 1.6 : 1), pw.z + 0.012); r.userData.prop88 = 1; m.add(r); sp.attach(r);
        });
        if (white) { const end = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.36, 0.012), clothMat(PEOPLE88.sash[0], 'wool')); end.position.set(pw.x + hipR * 0.6, yb - 0.15, pw.z + hipR * 0.95); end.userData.prop88 = 1; m.add(end); sp.attach(end); }
      }
      if (head && hs.y > 0) {
        const top = hc.y + hs.y * 0.5;
        let cap;
        if (white) {   // (the מגבעת: linen wound round the head — a crown of folds over a rounded top; המחשה)
          cap = new THREE.Group(); const lm = clothMat(PEOPLE88.linen, 'linen'), rx = hs.x * 0.58;
          const dome = new THREE.Mesh(new THREE.SphereGeometry(rx, 22, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), lm); dome.scale.set(1, 0.8, 1.12); dome.position.y = hs.y * 0.12; cap.add(dome);
          for (let i = 0; i < 3; i++) { const w = new THREE.Mesh(new THREE.TorusGeometry(rx * (1.0 - i * 0.05), hs.y * 0.075, 8, 26), lm); w.rotation.x = Math.PI / 2; w.rotation.z = i * 0.7; w.scale.set(1, 1.12, 1); w.position.y = hs.y * (0.02 + i * 0.08); w.rotation.y = (i - 1) * 0.06; cap.add(w); }
          cap.position.set(hc.x, top - hs.y * 0.4, hc.z - hs.z * 0.05);
        }
        else { cap = new THREE.Mesh(new THREE.SphereGeometry(hs.x * 0.58, 20, 10, 0, Math.PI * 2, 0, Math.PI * 0.5), clothMat(opt.cloth || pick(PEOPLE88.cloth, seed + 1), 'wool')); cap.scale.set(1.04, 0.9, 1.14); cap.position.set(hc.x, top - hs.y * 0.36, hc.z - hs.z * 0.06);
          cap.userData.cloth88 = 1; const flap = new THREE.Mesh(new THREE.CylinderGeometry(hs.x * 0.55, hs.x * 0.7, hs.y * 0.75, 16, 1, true, Math.PI * 0.62, Math.PI * 0.76), cap.material); flap.position.set(0, -hs.y * 0.36, -hs.z * 0.02); flap.scale.set(1, 1, 1.05); flap.userData.cloth88 = 1; cap.add(flap); }
        cap.userData.prop88 = 1; m.add(cap); head.attach(cap);
        if (opt.beard !== false) {   // (the beard: the jaw, the chin and the lip cut from the face itself, a little off it — it follows every turn of the head)
          const wv = new THREE.Vector3(), yTop = hc.y - hs.y * 0.3, yBot = hc.y - hs.y * 1.0, zMin = hc.z - hs.z * 0.05;
          const bg = tailor88(g, names, (part, v, i) => { if (part !== 'head') return false; body.getVertexPosition(i, wv).applyMatrix4(body.matrixWorld); return wv.y < yTop && wv.y > yBot && wv.z > zMin && Math.abs(wv.x - hc.x) < hs.x * 0.5; }, 0.007, 1);
          const bd = new THREE.SkinnedMesh(bg, clothMat(opt.beardColor || pick(PEOPLE88.beard, seed), 'hair')); bd.name = 'beard88'; bd.frustumCulled = false;
          body.parent.add(bd); bd.position.copy(body.position); bd.quaternion.copy(body.quaternion); bd.scale.copy(body.scale); bd.updateMatrixWorld(true); bd.bind(sk, body.bindMatrix);
        }
      }
    }
    // (a slot in the right hand for a tool: its +Y the handle, through the fist and forward — placed in the rest pose; KayKit-sized tools fit at 0.73)
    let slot = null;
    if (B.hand_r) { slot = new THREE.Object3D(); slot.name = 'slot88'; const hp = B.hand_r.getWorldPosition(new THREE.Vector3()); slot.position.set(hp.x - 0.07, hp.y - 0.02, hp.z + 0.01); slot.rotation.set(Math.PI / 2, 0, 0); slot.scale.setScalar(0.73); m.add(slot); B.hand_r.attach(slot); B.handslotr = slot; B['handslot.r'] = slot; }
    const H0 = 1.8, k = opt.height ? opt.height / H0 : (opt.scale || 1);
    m.scale.setScalar(k);
    const f = { root: m, B, mixer: new THREE.AnimationMixer(m), cur: null, name: '', k: 0, sv: null, white: !!opt.white, H0, slot };
    /** a worker's tunic and head cloth in other colours (a kohen's linen stays) */
    f.dress = (tunic, cloth) => { if (f.white) return; m.traverse((n) => { if (n.name === 'shirt88' || n.name === 'skirt88') { if (tunic) n.material = clothMat(tunic, 'wool'); } else if (n.userData.cloth88 && cloth) n.material = clothMat(cloth, 'wool'); }); };
    f.play = (name, rate = 1) => {
      const want = clipName88(name), clip = st.g.animations.find((a) => a.name === want) || st.g.animations.find((a) => a.name === 'Idle_Loop'); if (!clip) return;
      if (f.name !== want) { const a = f.mixer.clipAction(clip); a.reset(); a.setLoop(THREE.LoopRepeat, Infinity); a.enabled = true; a.setEffectiveWeight(1); if (f.cur && f.cur !== a) a.crossFadeFrom(f.cur, 0.25, true); a.play(); f.cur = a; f.name = want; }
      if (f.cur) f.cur.setEffectiveTimeScale(rate);
    };
    f.bend = (kk) => { f.k = Math.max(0, Math.min(1, +kk || 0)); };
    f.update = (dt) => {
      if (f.sv) { for (const [b, q] of f.sv) b.quaternion.copy(q); f.sv = null; }
      f.mixer.update(dt);
      if (f.k > 0.001) {
        f.sv = []; m.updateMatrixWorld(true); m.getWorldQuaternion(qC); FW.set(0, 0, 1).applyQuaternion(qC); FW.y = 0; FW.normalize(); AX.crossVectors(UP, FW);
        for (const [n, a] of Object.entries(PEOPLE88.bend)) { const b = B[n]; if (!b || !b.parent) continue; f.sv.push([b, b.quaternion.clone()]); b.parent.getWorldQuaternion(qB); b.getWorldQuaternion(qC); qA.setFromAxisAngle(AX, a * f.k); b.quaternion.copy(qB.invert().multiply(qA).multiply(qC)); }
      }
    };
    f.at = (n) => { const b = B[n] || B[PEOPLE88.bones[n]]; if (!b) return null; const v = new THREE.Vector3(); b.getWorldPosition(v); return v; };
    f.play(opt.clip || 'Idle', 1); root.add(m); st.figs.push(f);
    return f;
  }
  function clear() { for (const f of st.figs) { if (f.root.parent) f.root.parent.remove(f.root); } st.figs = []; }
  return { ready, make, clear, root, get loaded() { return st.loaded; }, figs: () => st.figs, clips: () => (st.g ? st.g.animations : []) };
}
