/* ── build 129 ── h129/night.js — the stage's tenth work, "הלילה בבית המוקד" (brief §7; Middot 1:8–9): night falls on the finished
 * Beit HaMoked. The fire is lit (the torch dragged to the wood: dark logs laid crosswise, flames that flicker by a fixed table, embers);
 * the elders of the father's house sleep on the stone ledges, the young kohanim on the floor each on his garment, the kohen kneels by
 * the slab. The time of locking: the camera comes close to the marble slab, an amah square (the Mishnah's), lifted by its ring (two
 * thumbs on its two sides; a mouse alone), slowly — no gauge is drawn: when it is high enough a short stay swings up under it with a
 * click; let go before that and it falls back with a bang (an elder lifts his head). The keys are taken from the chain under it; the
 * gates of the Azarah are locked one after another, each seen from inside the court in the moonlight, a torch at it: its leaves swing
 * shut, its bar slides home, one sound; the Levite lies down outside. A fade brings the camera back to the slab: the keys back, the slab
 * lowered to its place — too fast and its chain rattles and dust puffs at the pit's edge, the stone's grinding pitch rising with its
 * speed; touching down faster than SOFT a corner cracks (night.slab); his cloak spread on it, he sleeps.
 * The night's look (nightRig: the world's dark and the fire's light) serves the pack's finale too.
 * The model: model.js (slabFresh, slabStep, nightPts, SLAB). Places: BOOK.s07.night (its locks read from stage 04's gate entries).
 */
import { SLAB, TILT, QUICK, LOSS, LINES, slabFresh, slabStep, slabTilt, nightPts, qOf, starsOf } from './model.js';
import { SH7, mats7, box, own, setBusy, vaultWhole, slabDamage, walkHide } from './world.js';
import { createVoices } from './sound129.js';
import { card, cite, holdLens } from './ui7.js';
import { fingers, MOUSE, onY } from '../h113/acts.js';
import { gripR } from '../h109/grips.js';
import { BOOK } from '../world/grid.js';
import { makeLeaf, mats as mats4 } from '../h113/world.js';
import { H113 } from '../h113/model.js';

const S7 = BOOK.s07, N7 = S7.night, CAM = S7.cam, F16 = S7.floors.azara, HS = N7.slabSize;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sm = (u) => { const v = clamp(u, 0, 1); return v * v * (3 - 2 * v); };
const FIRE_I = 26;    // (the fire's light: the hall warm, the slab six amot off it readable, nothing burnt white)
const GRIP_MIN = 64;
// (the flames' flicker: a fixed table, rule 56)
const FL = Array.from({ length: 32 }, (_, i) => { const v = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return v - Math.floor(v); });
const flick = (t, i) => { const f = t * 9 + i * 5.3, a = Math.floor(f), u = f - a; return FL[a % 32] * (1 - u) + FL[(a + 1) % 32] * u; };
const LOCKS = () => N7.gates.map((id) => { const e = BOOK.s04.entries.find((q) => q.id === id), L = N7.locks[id]; return e && L ? { id, label: e.label, ...L } : null; }).filter(Boolean);

/** the night's look: the world's clock at the dark night, the fire on the hearth — a מדורה of long logs (3–4 amot) laid crosswise in
 *  three layers, embers glowing between them, many flames of different heights flickering by the fixed table, its ring of hearth
 *  stones; its light. The world's own small hearth (temple.js set 'lishka:hearth') steps aside while it burns. apply(k) on, off() */
export function nightRig(X) {
  const T = X.THREE, M = mats7(X), g = new T.Group(); g.name = 'h129-night'; let on = false, t = 0;
  const h = N7.hearth, F = N7.fire, at = (x, y, z) => [h[0] + x, F16 + y, h[1] + z];
  const logM = M.h7log || (M.h7log = new T.MeshStandardMaterial({ color: '#3A2A1C', roughness: 1, flatShading: true }));
  const charM = M.h7char || (M.h7char = new T.MeshStandardMaterial({ color: '#1E1712', roughness: 1, flatShading: true }));
  const hsM = M.h7hearth || (M.h7hearth = new T.MeshStandardMaterial({ color: '#8A7E70', roughness: 1, flatShading: true }));
  // the hearth's ring of rough stones (rounded, never cubes) and its bed of ash
  const stoneG = new T.IcosahedronGeometry(1, 1);
  for (let i = 0; i < F.ringN; i++) { const a = (i / F.ringN) * Math.PI * 2 + FL[i] * 0.2, q = new T.Mesh(stoneG, hsM); q.scale.set(0.3 + 0.08 * FL[i + 3], 0.18 + 0.06 * FL[i + 7], 0.26 + 0.07 * FL[i + 11]); q.rotation.y = a + FL[i + 5]; q.position.set(...at(Math.cos(a) * F.ringR, 0.12, Math.sin(a) * F.ringR)); q.castShadow = true; q.receiveShadow = true; g.add(q); }
  const ash = new T.Mesh(new T.CircleGeometry(F.ringR - 0.2, 24), new T.MeshStandardMaterial({ color: '#2A2420', roughness: 1 })); ash.rotation.x = -Math.PI / 2; ash.position.set(...at(0, 0.012, 0)); g.add(ash);
  // the logs: three layers crosswise (along x, along z, along x), each a long round log with its charred ends
  const logs = [];
  F.layers.forEach((L, li) => L.forEach((off, i) => {
    const k = li * 3 + i, len = F.len[0] + (F.len[1] - F.len[0]) * FL[k + 13], r = F.r * (0.85 + 0.3 * FL[k + 2]), lg = new T.Group();
    const body = new T.Mesh(new T.CylinderGeometry(r, r * 1.06, len, 9), logM); body.rotation.z = Math.PI / 2; body.castShadow = true; lg.add(body);
    for (const e of [-1, 1]) { const c = new T.Mesh(new T.CircleGeometry(r * 0.98, 9), charM); c.rotation.y = (e * Math.PI) / 2; c.position.x = (e * len) / 2 + e * 0.002; lg.add(c); }
    const y = F.r + li * 2 * F.r * 0.9, along = li % 2 ? Math.PI / 2 : 0;
    lg.rotation.y = along + (FL[k + 21] - 0.5) * 0.14; lg.position.set(...(li % 2 ? at(off, y, 0) : at(0, y, off))); g.add(lg); logs.push(lg);
  }));
  // the embers: a glowing bed under the logs and coals between the layers (three shades, swapped by the table)
  const emberMs = [0x7A1E06, 0xC2410C, 0xFF8A2A].map((c) => new T.MeshBasicMaterial({ color: c }));
  const bed = new T.Mesh(new T.CircleGeometry(F.ringR - 0.7, 20), emberMs[0]); bed.rotation.x = -Math.PI / 2; bed.position.set(...at(0, 0.02, 0)); g.add(bed);
  const coalG = new T.SphereGeometry(1, 7, 5), embers = [];
  for (let i = 0; i < F.embers; i++) { const a = i * 2.39996, r = (F.ringR - 0.8) * Math.sqrt((i + 0.5) / F.embers), lay = i % 3, e = new T.Mesh(coalG, emberMs[1 + (i % 2)]); e.scale.set(0.09 + 0.07 * FL[i % 32], 0.05 + 0.03 * FL[(i + 9) % 32], 0.08 + 0.06 * FL[(i + 4) % 32]); e.position.set(...at(Math.cos(a) * r, 0.04 + lay * 2 * F.r * 0.9, Math.sin(a) * r)); g.add(e); embers.push(e); }
  // the flames: many, each its own height and width and pace (a teardrop turned on a lathe: no cones, no boxes); orange round, yellow inside
  const tear = new T.LatheGeometry([[0, 0], [0.55, 0.06], [0.82, 0.2], [0.78, 0.36], [0.55, 0.58], [0.3, 0.8], [0.1, 0.95], [0, 1]].map(([x, y]) => new T.Vector2(x, y)), 10);
  const fM = [0xD9480F, 0xF26A1B, 0xFFB43C].map((c, i) => new T.MeshBasicMaterial({ color: c, transparent: true, opacity: [0.7, 0.8, 0.88][i], depthWrite: false }));
  const flames = [];
  for (let i = 0; i < F.flames; i++) {
    const a = i * 2.39996 + 0.7, r = F.flameR * Math.sqrt((i + 0.5) / F.flames), mid = 1 - r / F.flameR, kind = i % 4 === 0 ? 2 : i % 3 === 0 ? 0 : 1;
    const H = (F.flameH[0] + (F.flameH[1] - F.flameH[0]) * FL[(i * 7) % 32]) * (0.55 + 0.6 * mid) * (kind === 2 ? 0.6 : 1), W = (0.16 + 0.16 * FL[(i * 5 + 3) % 32]) * (kind === 2 ? 0.7 : 1);
    const f = new T.Mesh(tear, fM[kind]); f.scale.set(W, H, W); f.position.set(...at(Math.cos(a) * r, 0.3 + 0.5 * FL[(i + 17) % 32] + (kind === 2 ? 0.15 : 0), Math.sin(a) * r)); f.renderOrder = 5 + kind;
    f.userData = { H, W, pace: 0.7 + 0.8 * FL[(i * 3 + 1) % 32], k: i }; g.add(f); flames.push(f);
  }
  const light = new T.PointLight(0xFF9A4A, 0, N7.fireLight.dist, N7.fireLight.decay); light.position.set(...at(0, 2.6, 0)); g.add(light);
  const glow = new T.PointLight(0xFFA050, 0, N7.fireLight.dist + 12, 1.1); glow.position.set(...at(0, 9, 0)); g.add(glow);   // (round 3: the finale's first picture, the barrel warm over the fire)
  const moon = new T.Group(); { const hm = new T.HemisphereLight(0x8AA4E8, 0x141A2A, 0.9), md = new T.DirectionalLight(0x9DB6FF, 0.9); md.position.set(...N7.moon.at); md.target.position.set(...N7.moon.aim); moon.add(hm, md, md.target); }
  let fire = 0, dim = 1;
  const R = {
    lit: (v) => { fire = v ? 1 : 0; light.intensity = v ? FIRE_I * dim : 0; for (const f of flames) f.visible = !!v; for (const e of embers) e.visible = !!v; bed.material = v ? emberMs[1] : emberMs[0]; },
    /** the fire's light only (0 … 1): while the gates are locked far off, the court's own night stays the moon's */
    dim: (k) => { dim = clamp(+k, 0, 1); },
    /** the moon over the courts (the finale's pictures outside the hall: the water in the troughs, the Gazit's bench) */
    glow: (k) => { glow.intensity = FIRE_I * 0.8 * clamp(+k || 0, 0, 1); },
    moon: (v) => { if (v && !moon.parent) g.add(moon); if (!v && moon.parent) g.remove(moon); },
    apply(k = 1) {
      if (!on) { on = true; X.props.root.add(g); try { X.stages.subSet('lishka:hearth', false); } catch (e) { /* */ } try { const E = X.pack && X.pack.time; if (E && E.setTime) E.setTime('night'); } catch (e) { /* */ } }
      if (k && fire === 0 && R.autoLit !== false) R.lit(1);
    },
    frame(dt) {
      t += dt; const k = fire ? 1 : 0;
      light.intensity = k * dim * FIRE_I * (0.88 + 0.24 * flick(t, 0));
      for (const f of flames) { const u = f.userData, s = 0.65 + 0.7 * flick(t * u.pace, u.k + 1), w = 0.85 + 0.3 * flick(t * u.pace * 0.7, u.k + 9); f.scale.set(u.W * w, u.H * s, u.W * w); f.rotation.y = u.k + 0.6 * flick(t * 0.4, u.k + 3); }
      embers.forEach((e, i) => { e.material = emberMs[flick(t * 0.6, i % 32) > 0.62 ? 2 : flick(t * 0.6, i % 32) > 0.3 ? 1 : 0]; });
    },
    off() { if (!on) return; on = false; X.props.remove(g); try { X.stages.subSet('lishka:hearth', true); } catch (e) { /* */ } try { const E = X.pack && X.pack.time; if (E && E.restoreTime) E.restoreTime(); } catch (e) { /* */ } },
  };
  void logs; R.lit(0);
  return R;
}

/** (round 3) a garment over a sleeper, as one draped sheet: from the feet (z 0, its hem hanging a little past them) to the chest (z L),
 *  its cross-section a flat low dome (a superellipse) whose sides reach the floor, wide at the shoulders and narrower to the feet, the
 *  feet's bump near the end, a fold or two along it. sd: on a side (±1, facing local ±x) → taller and narrower, the hip high and the
 *  drawn-up knees pushing it forward */
function drapeGeo(T, L, s, sd, kn) {
  const NU = 20, NZ = 26, pos = [], idx = [], P = 3.4;
  for (let iz = 0; iz <= NZ; iz++) {
    const t = iz / NZ, z = -0.2 * s + t * (L + 0.2 * s), q = Math.max(0, Math.min(1, z / L)), hem = Math.min(1, (z + 0.2 * s) / (0.3 * s));
    let w, h, ox = 0;
    if (!sd) {   // (on his back: chest and belly the highest, thighs lower, the shins low, the feet's bump at the end)
      w = (1.25 + 0.6 * Math.pow(q, 0.7)) * s;   // (round 3b: high enough over the figure everywhere — the rig's robe is about 0.7 high lying — and flat on top, its sides falling to the floor)
      h = (0.74 + 0.06 * q + 0.12 * Math.exp(-(((q - 0.07) / 0.06) ** 2)) + 0.03 * Math.sin(q * 23)) * s;
    } else {     // (on his side: the hip high, the drawn-up knees pushing it forward)
      const knee = Math.exp(-(((q - 0.4) / 0.14) ** 2)) * (0.2 + kn * 0.35);
      w = (1.05 + 0.3 * q + knee * 0.55) * s; h = (0.95 + 0.2 * Math.exp(-(((q - 0.62) / 0.2) ** 2)) + 0.05 * q + 0.03 * Math.sin(q * 17)) * s; ox = sd * knee * 0.45 * s;
    }
    h *= 0.2 + 0.8 * hem;   // (the hem past the feet comes down to the floor)
    for (let iu = 0; iu <= NU; iu++) {
      const u = -1.3 + (2.6 * iu) / NU, au = Math.abs(u), fold = 1 + 0.07 * Math.sin(u * 6.3 + q * 9) * (1 - au * 0.5);
      const y = au >= 1 ? Math.max(0, 0.06 * (1.3 - au)) * s : h * fold * Math.pow(1 - Math.pow(au, P), 1 / P);
      pos.push(ox + (u * w) / 2 * (au > 1 ? 1.0 : 1), y + 0.012, z);
    }
  }
  for (let iz = 0; iz < NZ; iz++) for (let iu = 0; iu < NU; iu++) { const a = iz * (NU + 1) + iu, b = a + NU + 1; idx.push(a, b, a + 1, a + 1, b, b + 1); }
  const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
}
/** a man of the game's own figures laid down to sleep (h129: the rig laid on its back or its side, a.lie), his garment over him from the
 *  feet to the chest, on a garment of his own spread on the floor when asked. o: { mid: [x, z], y, head: [hx, hz] (unit: toward his head),
 *  side (0 on his back, ±1 on a side), variant, young, col2 (hair, beard: an elder's white), scale, cover (colour), under } */
/** the night's own figures (h129 round 3): kept here so that a second make, or one that never reached its end, cannot leave a figure
 *  of the last night standing in the hall (a kneeling kohen left beside the sleeping one) */
const NIGHTA = { set: new Set(), makes: 0 };
const nightOwn = (a) => { if (a) NIGHTA.set.add(a); return a; };
function nightClear(AC) { if (AC) for (const a of NIGHTA.set) { try { AC.remove(a); } catch (e) { /* */ } } NIGHTA.set.clear(); }
function sleeperA(X, AC, MT, parent, o) {
  const T = X.THREE, s = o.scale || 1, [hx, hz] = o.head, half = 1.75 * s, fx = o.mid[0] - hx * half, fz = o.mid[1] - hz * half, yU = o.under ? 0.05 : 0, sd = o.side || 0;
  const yaw = !sd ? Math.atan2(-hx, -hz) : sd > 0 ? Math.atan2(hz, -hx) : Math.atan2(-hz, hx), lie = !sd ? [-Math.PI / 2, 0] : [0, (sd * Math.PI) / 2];
  const a = AC ? nightOwn(AC.add(o.variant || 'kohen', fx, fz, { y: o.y + yU + (sd ? 0.42 : 0.34) * s, yaw, scale: s, young: !!o.young, col2: o.col2, fadeIn: false })) : null;
  if (a) { a.vis = a.visT = 1; a.gang = 1; a.lie = lie; a.lieAt = [o.mid[0], o.mid[1]]; a.yaw = yaw; a.arm = sd ? [0.5, 0.1, 0.25, 0.05] : [0.12, 0.62, 0.08, 0.1]; a.armT = a.arm.slice(); if (sd) { a.kn = a.knT = o.knees || 0; } }
  const along = Math.atan2(hx, hz), parts = [];
  if (o.under) { const u = new T.Mesh(X.props.geo.box, MT.h7cloak); u.scale.set(1.5 * s, 0.05, 4.1 * s); u.position.set(o.mid[0], o.y + 0.025, o.mid[1]); u.rotation.y = along; u.receiveShadow = true; parent.add(u); parts.push(u); }
  if (o.cover) {   // (round 3: a garment laid over him from the chest down, flat and low, wide at the shoulders, narrower to the feet, the feet's bump at its end)
    const L = 2.5 * s, c = new T.Mesh(drapeGeo(T, L, s, sd, o.knees || 0), o.cover); c.rotation.y = along; c.position.set(fx - hx * 0.14 * s, o.y + yU, fz - hz * 0.14 * s); c.castShadow = true; c.receiveShadow = true; parent.add(c); parts.push(c);
  }
  return { a, parts, head: [o.mid[0] + hx * half * 0.8, o.mid[1] + hz * half * 0.8] };
}

/** (round 3) the finale is done with the night's sleepers: take them away */
export function nightRelease(X) {
  const K = SH7.nightKeep; if (!K) return; SH7.nightKeep = null;
  const AC = X.actors ? X.actors() : null;
  if (AC) for (const a of K.actors) { try { AC.remove(a); } catch (e) { /* */ } NIGHTA.set.delete(a); }
  try { X.props.remove(K.g); } catch (e) { /* */ }
}
/** stage 04's gold, for the night: the goldsmiths' leaf metal with less metalness (by torch and moon it reads as gold, not as black) */
function nightGold(X) { const M4 = mats4(X); return M4.goldN || (M4.goldN = Object.assign(M4.goldL.clone(), { metalness: 0.35, roughness: 0.45 })); }
/** a gateway's two leaves, stage 04's own (h113 makeLeaf: planks, battens on the back, the pins), built to the gateway's width w and
 *  height h, in a group whose x runs along the face and whose −z is the court (the leaves' backs); userData.set(k) swings them (0 open
 *  into the court, 1 shut), userData.bolt(b) slides the cedar bolt in its bronze brackets (0 drawn back on the left leaf, 1 across the
 *  joint into the right leaf's brackets) */
function leavesPair(X, w, h, gold) {
  const T = X.THREE, M4 = mats4(X), fr = new T.Group(), hs = h / (H113.LEAF_H + 0.5), t = H113.LEAF_T, W = w / 2, yB = 7.2, zB = -(t / 2 + 0.36), Lb = Math.min(4, w * 0.45);
  const lv = [-1, 1].map((side) => {
    const g = makeLeaf(X, { side, s: -1, gold: true, rings: 0, width: W - 0.2 });
    fr.add(g); g.position.set(side * W, 0, 0); g.scale.set(1, hs, 1);
    g.traverse((m) => { if (m.isMesh && m.material === M4.goldL) m.material = gold; });
    return g;
  });
  // the bronze brackets: two on each leaf's back by the joint (a staple standing off the back, the bolt through it)
  const brk = (g, x) => { for (const dy of [-0.32, 0.32]) box(X, M4.bronze, x - 0.12, yB + dy - 0.05, zB - 0.22, x + 0.12, yB + dy + 0.05, -t / 2, g); box(X, M4.bronze, x - 0.12, yB - 0.37, zB - 0.27, x + 0.12, yB + 0.37, zB - 0.17, g); };
  brk(lv[0], W - 0.35 - Lb * 0.8); brk(lv[0], W - 0.55); brk(lv[1], -W + Lb * 0.25); brk(lv[1], -W + Lb * 0.45);
  const bolt = box(X, M4.cedarD, -Lb / 2, yB - 0.2, zB - 0.16, Lb / 2, yB + 0.2, zB + 0.16, lv[0]);
  fr.userData.set = (k) => lv.forEach((g, i) => { const side = i ? 1 : -1; g.rotation.y = -side * 1.35 * (1 - clamp(k, 0, 1)); });
  fr.userData.bolt = (b) => { bolt.position.x = W - 0.35 - Lb / 2 + (Lb * 0.55 + 0.35) * clamp(b, 0, 1); };
  fr.userData.set(0); fr.userData.bolt(0);
  return fr;
}

export const NIGHT = {
  icon: '🔑', title: 'הלילה בבית המוקד',
  walkLine: () => 'בית המוקד: זמן הנעילה',
  stand() { const s = N7.hearth; return { x: s[0] + 3, z: s[1] + 2, face: [N7.slab[0], N7.slab[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, st = Mo.st, V = createVoices(X.sfx), MT = mats7(X), AC = X.actors ? X.actors() : null;
    nightRelease(X); nightClear(AC);
    const A = { phase: 'intro', t: 0, ev: [], fing: new Map(), base: 0, lockI: -1, tw: [], rattleT: 0, stay: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    own('slab', 1); setBusy(X, 1); X.kohen(false); vaultWhole(X);
    const cam0 = X.camera, fov0 = cam0.fov, lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
    const rig = SH7.rig || nightRig(X); SH7.rig = rig; rig.autoLit = false; rig.apply(1); rig.lit(0);
    const root = new T.Group(); root.name = 'h129-night-act'; X.props.root.add(root);
    const sleepG = new T.Group(); sleepG.name = 'h129-night-sleepers'; X.props.root.add(sleepG);   // (round 3: the sleepers stay for the finale's first picture)
    const tween = (dur, fn, done) => { A.tw.push({ t: 0, dur, fn, done }); };
    const sl = N7.slab, sx = sl[0], sz = sl[1];
    // ── the sleepers, the game's own figures laid down (true size: a man 3½–4 amot beside the amah slab): the elders of the father's
    //    house, white-bearded, on the stone ledges — the two by the Azarah's door on their sides (the ledge shorter than a man: his knees
    //    drawn up), the two in the hall's arms on their backs — each under his garment; the young kohanim on the floor, each on his
    //    garment, their feet to the fire. None by the door to the Chel (the gate he locks) and none on the slab's way
    const coverM = ['#8A7F98', '#9A8668', '#7A8C96', '#A08466'].map((c) => new T.MeshStandardMaterial({ color: c, roughness: 1, side: T.DoubleSide }));   // (round 3: wool, soft-shaded)
    const youngM = new T.MeshStandardMaterial({ color: '#D9CDB2', roughness: 1, side: T.DoubleSide });
    const sleepers = [], elders = [];
    N7.ledges.forEach((b, i) => {
      if (!N7.elderOn.includes(i)) return;
      const lx = b[2] - b[0], lz = b[3] - b[1], alongX = lx >= lz, cx = (b[0] + b[2]) / 2, cz = (b[1] + b[3]) / 2, hd = alongX ? [cx < sx ? 1 : -1, 0] : [0, 1], side = Math.max(lx, lz) < 3.6;
      const sg = hd[1] * (sx - cx) - hd[0] * (sz - cz) > 0 ? 1 : -1;   // (on his side facing into the hall: side +1 faces (hz, −hx), −1 the other way)
      const e = sleeperA(X, AC, MT, sleepG, { mid: [cx, cz], y: N7.ledgeY, head: hd, side: side ? sg : 0, knees: side ? 0.55 : 0, scale: side ? 0.94 : 1, young: false, col2: '#EDEDE8', cover: coverM[i % 4] });
      elders.push(e); sleepers.push(e);
    });
    const H0 = N7.hearth;
    N7.youngAt.forEach(([ang, r0], i) => { const c = Math.cos(ang * Math.PI), sn = Math.sin(ang * Math.PI), half = 1.75 * 0.96; sleepers.push(sleeperA(X, AC, MT, sleepG, { mid: [H0[0] + c * (r0 + half), H0[1] + sn * (r0 + half)], y: F16, head: [c, sn], side: i % 3 === 1 ? (i % 2 ? 1 : -1) : 0, knees: i % 3 === 1 ? 0.6 : 0.25, scale: 0.96, young: true, col2: ['#2E2218', '#4A3424', '#1E1A16'][i % 3], cover: youngM, under: true })); });
    // ── the kohen kneels by the slab, beyond it from the camera, facing it: the game's kohen figure (upright on his heels, bent a little
    //    toward the ring, his hands forward); the figures gate measures him at his kneeling height. After the lowering he lies on it
    let kohen = null;
    const KN = [sx + N7.kneel[0], sz + N7.kneel[1]];
    if (AC) { kohen = nightOwn(AC.add('kohen', KN[0], KN[1], { y: F16, yaw: Math.atan2(sx - KN[0], sz - KN[1]), scale: 1, young: false, col2: '#3A2A1E', fadeIn: false })); NIGHTA.makes++; kohen.vis = kohen.visT = 1; kohen.gang = 1; kohen.gateH = 2.7; AC.pose(kohen, 'sit'); kohen.bowT = 0.42; kohen.armT = [1.15, -0.18, 1.15, -0.18]; }
    const kohenShow = (v) => { if (kohen) { kohen.vis = kohen.visT = v ? 1 : 0; } };
    // ── the slab: lifted flat by its ring (the pit, the chain and the keys under it seen through the gap), the stay hinged at the pit's
    //    east edge; the ring's two sides the two grips, a thin gold ring round each
    const slab = new T.Group(); slab.position.set(sx, F16, sz); root.add(slab);
    box(X, MT.h7dark, sx - HS / 2 + 0.06, F16 + 0.004, sz - HS / 2 + 0.06, sx + HS / 2 - 0.06, F16 + 0.008, sz + HS / 2 - 0.06, root);   // (the hall's floor is whole under it: the pit is drawn as its dark mouth, the chain and keys in it)
    for (const [a, b, c, d] of [[-1, -1, 1, -0.94], [-1, 0.94, 1, 1], [-1, -0.94, -0.94, 0.94], [0.94, -0.94, 1, 0.94]]) box(X, MT.h7holy, sx + (a * HS) / 2, F16 + 0.004, sz + (b * HS) / 2, sx + (c * HS) / 2, F16 + 0.03, sz + (d * HS) / 2, root);
    const plate = new T.Group(); slab.add(plate);
    const marble = new T.Mesh(X.props.geo.box, new T.MeshStandardMaterial({ color: '#EEE8DE', roughness: 0.6 })); marble.scale.set(HS, 0.12, HS); marble.position.set(0, 0.06, 0); marble.castShadow = true; plate.add(marble);
    const RR = 0.26, ringM = new T.Mesh(new T.TorusGeometry(RR, 0.035, 6, 24), MT.h7bronze); ringM.rotation.x = Math.PI / 2; ringM.position.set(0, 0.15, 0); plate.add(ringM);
    for (const sg of [-1, 1]) box(X, MT.h7bronze, sg * RR - 0.05, 0.12, -0.05, sg * RR + 0.05, 0.17, 0.05, plate);   // (the ring's two staples)
    const haloM = new T.MeshBasicMaterial({ color: 0xFFD86A, transparent: true, opacity: 0.9, depthWrite: false }), haloF = new T.MeshBasicMaterial({ color: 0xFFE6A0, transparent: true, opacity: 0.3, depthWrite: false });
    const halos = [-1, 1].map((sg) => { const h = new T.Group(); h.position.set(sg * RR, 0.17, 0); h.rotation.x = -Math.PI / 2; h.add(new T.Mesh(new T.TorusGeometry(0.13, 0.008, 4, 32), haloF)); const arc = new T.Mesh(new T.TorusGeometry(0.13, 0.016, 4, 24, 1.9), haloM); h.add(arc); h.userData.arc = arc; plate.add(h); return h; });
    // the chain from a staple in the pit's north wall, the keys on it
    const chain = new T.Group(); root.add(chain);
    for (let i = 0; i < 6; i++) { const l = new T.Mesh(new T.TorusGeometry(0.035, 0.01, 4, 8), MT.h7iron); l.position.set(sx + 0.12, F16 + 0.02, sz - HS / 2 + 0.12 + i * 0.055); l.rotation.x = i % 2 ? 0 : Math.PI / 2; chain.add(l); }
    const KEY0 = [sx + 0.12, F16 + 0.04, sz - HS / 2 + 0.45], keys = new T.Group(); keys.position.set(...KEY0); keys.rotation.x = -Math.PI / 2; root.add(keys);
    for (let i = 0; i < 3; i++) { const kk = new T.Group(); const shaft = new T.Mesh(X.props.geo.box, MT.h7bronze); shaft.scale.set(0.03, 0.22, 0.03); kk.add(shaft); const bow = new T.Mesh(new T.TorusGeometry(0.04, 0.012, 4, 10), MT.h7bronze); bow.position.y = 0.13; kk.add(bow); const bit = new T.Mesh(X.props.geo.box, MT.h7bronze); bit.scale.set(0.06, 0.03, 0.03); bit.position.set(0.03, -0.1, 0); kk.add(bit); kk.position.set((i - 1) * 0.07, 0, 0); kk.rotation.z = (i - 1) * 0.25; keys.add(kk); }
    // the stay: a short timber hinged at the pit's east edge, lying on the floor until the slab is high enough, then up under it
    const stay = new T.Group(); stay.position.set(sx + HS / 2 - 0.12, F16 + 0.03, sz + 0.05); root.add(stay);
    { const b = new T.Mesh(X.props.geo.box, MT.h7timberD); b.scale.set(0.09, 0.84, 0.09); b.position.set(0, 0.42, 0); b.castShadow = true; stay.add(b); }
    const staySet = (u) => { stay.rotation.z = -(Math.PI / 2) * (1 - u); };   // (u 0 lying east along the floor … 1 standing)
    staySet(0);
    const torch = new T.Group(); { const s = new T.Mesh(new T.CylinderGeometry(0.05, 0.06, 1.1, 6), MT.h7timberD); s.rotation.z = Math.PI / 2; torch.add(s); const tip = new T.Mesh(new T.ConeGeometry(0.13, 0.35, 7), new T.MeshBasicMaterial({ color: 0xFF9A3A })); tip.rotation.z = -Math.PI / 2; tip.position.x = 0.7; torch.add(tip); }
    const th0 = [N7.hearth[0] + 3.2, F16 + 0.6, N7.hearth[1] - 1.6]; torch.position.set(...th0); root.add(torch);
    const LP = [sx + 1.0, sz + 1.5];   // (his lamp on the floor beside him, by the slab: the ring, the pit and the keys read at night)
    const lamp = new T.PointLight(0xFFD9A0, 0, 9, 1.6); lamp.position.set(LP[0], F16 + 2.2, LP[1]); root.add(lamp);
    const lampM = new T.Mesh(new T.SphereGeometry(0.08, 8, 6), new T.MeshBasicMaterial({ color: 0xFFC060 })); lampM.position.set(LP[0], F16 + 0.14, LP[1]); root.add(lampM);
    { const bowl = new T.Mesh(new T.CylinderGeometry(0.12, 0.08, 0.08, 10), MT.h7stone); bowl.position.set(LP[0], F16 + 0.04, LP[1]); root.add(bowl); }
    // (his garment, spread over the slab when it is down: he sleeps on it)
    const cloak = new T.Mesh(X.props.geo.box, MT.h7cloak); cloak.scale.set(4.0, 0.05, 1.5); cloak.position.set(sx, F16 + 0.145, sz); cloak.visible = false; root.add(cloak);
    // ── the gates' own pieces while they are locked: the gateway's dark passage, its two leaves — stage 04's own leaves (h113 makeLeaf:
    //    the cedar planks, battens, pins and rings, gold-plated as the goldsmiths left them) — opening into the court, the bolt of cedar
    //    sliding in its bronze brackets across the joint, the torch beside the gateway
    const gate = new T.Group(); gate.visible = false; root.add(gate);
    const G1 = { pass: box(X, MT.h7dark, -0.5, 0, -0.04, 0.5, 1, 0.04, gate), frame: null, lit: new T.PointLight(0xFFB060, 0, 26, 1.5), fl: null, key: '' };
    gate.add(G1.lit); G1.fl = new T.Mesh(new T.ConeGeometry(0.22, 0.6, 7), new T.MeshBasicMaterial({ color: 0xFFA040 })); gate.add(G1.fl);
    const brk = box(X, MT.h7timberD, -0.06, -0.5, -0.06, 0.06, 0.5, 0.06, gate);
    const gold = nightGold(X);
    /** the gate L's pieces placed in the world (u along the face, n into the court): its leaves built to its size */
    function gatePlace(L) {
      const [ax, ay, az] = L.at, n = L.n, u = [-n[1], n[0]], w = L.w, h = L.h, P = (a, y, b) => [ax + u[0] * a + n[0] * b, ay + y, az + u[1] * a + n[1] * b], yaw = Math.atan2(u[1], u[0]);
      const pass = P(0, h / 2, 0.06); G1.pass.position.set(...pass); G1.pass.scale.set(w, h, 0.1); G1.pass.rotation.y = -yaw;
      const key = w + 'x' + h;
      if (G1.key !== key) { if (G1.frame) { gate.remove(G1.frame); } G1.frame = leavesPair(X, w, h, gold); gate.add(G1.frame); G1.key = key; }
      G1.frame.position.set(...P(0, 0, 0.5)); G1.frame.rotation.y = Math.atan2(-u[1], u[0]);   // (in the court just before the gateway's face: the wall never swallows the closed leaves)
      const tp = P(w / 2 + 1.4, Math.min(S7.night.gateCam.torch, h * 0.7), 0.5); brk.position.set(tp[0], tp[1] - 0.5, tp[2]); G1.fl.position.set(tp[0], tp[1] + 0.3, tp[2]); G1.lit.position.set(tp[0] + n[0] * 3, tp[1] + 1.2, tp[2] + n[1] * 3);
      G1.n = n; G1.u = u;
    }
    /** the leaves at k (0 open into the court, 1 shut); the bolt at b (0 drawn back in its leaf's brackets, 1 across the joint) */
    const leavesSet = (k) => G1.frame && G1.frame.userData.set(k);
    const boltSet = (b) => G1.frame && G1.frame.userData.bolt(b);
    // ── the moon while the gates are locked: a cool light over the court, strong enough to read walls and gates
    const moon = new T.Group(); const hemi = new T.HemisphereLight(0x8AA4E8, 0x141A2A, 1.0), mdir = new T.DirectionalLight(0x9DB6FF, 0.95); mdir.position.set(...N7.moon.at); mdir.target.position.set(...N7.moon.aim); moon.add(hemi, mdir, mdir.target);
    const moonOn = (v) => { if (v) X.props.root.add(moon); else X.props.root.remove(moon); };
    // ── the Levite outside the hall's door to the Chel: the game's Levite figure lying across the threshold on his garment, his small
    //    lamp by his head; behind him the door's two leaves shut (stage 04's leaves, as at the gates)
    const leviG = new T.Group(); leviG.visible = false; root.add(leviG);
    const LV = N7.levi, LD = N7.leviDoor;
    let levi = null;
    { const fr = leavesPair(X, LD.w, LD.h, gold); fr.userData.set(1); fr.userData.bolt(1); fr.position.set(LV[0], LV[2], N7.door.chel[1] - LD.out); fr.rotation.y = Math.PI; leviG.add(fr);
      const lp = [LV[0] + 2.3, LV[1] - 0.4]; const lm = new T.Mesh(new T.SphereGeometry(0.09, 8, 6), new T.MeshBasicMaterial({ color: 0xFFC060 })); lm.position.set(lp[0], LV[2] + 0.16, lp[1]); leviG.add(lm);
      const lb = new T.Mesh(new T.CylinderGeometry(0.14, 0.09, 0.09, 10), MT.h7stone); lb.position.set(lp[0], LV[2] + 0.05, lp[1]); leviG.add(lb);
      const ll = new T.PointLight(0xFFC070, 2.5, 8, 1.6); ll.position.set(lp[0], LV[2] + 1.2, lp[1] - 1.8); leviG.add(ll); }
    const leviOn = (v) => {
      if (v && !levi && AC) { const L = sleeperA(X, AC, MT, leviG, { variant: 'levite', mid: [LV[0], LV[1] - 1.3], y: LV[2], head: [1, 0], side: 0, young: false, col2: '#3A2A1E', cover: coverM[1], under: true }); levi = L.a; }
      if (!v && levi && AC) { try { AC.remove(levi); } catch (e) { /* */ } levi = null; }
    };
    // ── a fade, for the cuts (never a flight through walls)
    const fadeEl = document.createElement('div'); fadeEl.className = 'h109-ui'; fadeEl.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:55;transition:opacity .35s'; document.body.appendChild(fadeEl);
    const fade = async (eye, aim, fov) => { fadeEl.style.opacity = '1'; await X.wait(0.4); X.shot(eye, aim, 0.01); if (fov) lens(fov); await X.wait(0.15); fadeEl.style.opacity = '0'; await X.wait(0.3); };
    // ── the slab's model
    const S = slabFresh();
    // (R4: the slab leans after the hands — the side lifted ahead rises, the other stays low; on its seat it lies flat)
    const setSlab = () => { plate.position.y = S.h * 1.0; plate.rotation.z = -(S.tilt || 0) * 0.55 * clamp(S.h / 0.12, 0, 1); };   // (lifted flat: h 1 = an amah)
    const gripAt = (sg) => { const v = new T.Vector3(sg * RR, 0.16, 0); plate.localToWorld(v); return v; };
    const scr = (v) => { const r = X.scr(v.x, v.y, v.z); return { x: r.x, y: r.y }; };
    const unit = () => 0.3 * innerHeight;   // (the slab's whole lift: this far up on the screen)
    const lift = (u) => { try { if (X.lookLift && !MOUSE) X.lookLift(u); } catch (e) { /* */ } };   // (brief F5: both thumbs on the ring — a small lift by the act, under the vault)
    const need = () => (MOUSE ? 1 : 2);
    const target = () => { if (A.fing.size < need()) return null; let v = Infinity; for (const f of A.fing.values()) v = Math.min(v, A.base + (f.y0 - f.y) / unit()); return v; };
    // (R4: the tilt the hands ask for — two thumbs: the ring's two sides' own lifts; a mouse: its drift sideways and its pull ahead)
    const tiltNow = () => {
      if (A.fing.size < need()) return 0;
      const fs = [...A.fing.values()], tg = target();
      if (MOUSE || fs.length < 2) { const f = fs[0]; return slabTilt({ two: false, dx: (f.x - f.x0) / unit(), target: tg, h: S.h }); }
      const t = (f) => A.base + (f.y0 - f.y) / unit(), a = fs.find((f) => f.side === 0) || fs[0], b = fs.find((f) => f !== a) || fs[1];
      return slabTilt({ two: true, tL: t(a), tR: t(b) });
    };
    const rebase = () => { for (const f of A.fing.values()) { f.y0 = f.y; f.x0 = f.x; } A.base = S.h; };
    const camSlab = (d = 1) => { X.shot(CAM.nightSlab[0], CAM.nightSlab[1], d); lens(CAM.nightSlabFov); A.fov = CAM.nightSlabFov; };
    // (the right thumb's look in the hall: up under the vault, never out through its walls; at the gates the court's own look)
    SH7.lookFn = (base, u, yaw) => {
      if (A.phase === 'lock' || A.phase === 'levi') return null;
      const e = Math.pow(sm((+u || 0) / 0.75), 1.7), P1 = [sx, F16 + 8.5, sz - 5.0], T1 = [sx, F16 + 0.4, sz + 1.5], fv = Number.isFinite(base.fov) ? base.fov : 50, yw = clamp(+yaw || 0, -0.8, 0.8);
      const p = base.p.map((v, i) => v + (P1[i] - v) * e), t = base.t.map((v, i) => v + (T1[i] - v) * e);
      if (Math.abs(yw) > 1e-3) { const dx = p[0] - t[0], dz = p[2] - t[2], c = Math.cos(yw), s = Math.sin(yw); p[0] = t[0] + dx * c - dz * s; p[2] = t[2] + dx * s + dz * c; }
      const H = S7.vault.M.hall; p[0] = clamp(p[0], H[0] + 1, H[2] - 1); p[2] = clamp(p[2], H[1] + 1, H[3] - 1);
      return { p, t, fov: fv + (Math.max(fv, 64) - fv) * e };
    };
    // ── the steps
    const LINE_LIFT = MOUSE ? 'הגיע זמן הנעילה: אחזו בטבעת והגביהו לאט, עד שהסמוכה נכנסת תחתיה' : 'הגיע זמן הנעילה: שני אגודלים על שני צדי הטבעת, הגביהו לאט, עד שהסמוכה נכנסת תחתיה';
    async function lightFire() { A.phase = 'fire'; X.shot(CAM.nightHall[0], CAM.nightHall[1], 1.4); X.line('הלילה בבית המוקד · הדליקו את המדורה: גררו את הלפיד אל העצים', 6000); X.hand({ x: th0[0], y: th0[1], z: th0[2] }, -gripR() / 2, 0); }
    async function fireLit() {
      A.phase = 'sleep'; rig.lit(1); V.fire(0.6); X.quick({ x: N7.hearth[0], y: F16 + 1.4, z: N7.hearth[1] }, 'דולקת!', null); torch.visible = false; ev('fire');
      X.line('זקני בית אב ישנים על רובדי האבן, ופרחי הכהונה איש כסתו בארץ', 3600);
      await X.wait(3.0);
      camSlab(1.4); lamp.intensity = 3; await X.wait(1.5);
      A.phase = 'lift'; lift(0.22);
      X.line(LINES.night + ' · ' + LINE_LIFT, 6500);
      const r = gripAt(-1); X.hand({ x: r.x, y: r.y, z: r.z }, 0, -gripR() / 3);
    }
    async function lockGates() {
      A.phase = 'keys'; lift(0); halos.forEach((h) => { h.visible = false; });
      // (the stay swings up under it with a click; the kohen takes the keys from the chain)
      tween(0.35, (u) => staySet(sm(u)), () => { V.knock(2.2); X.quick(gripAt(0), QUICK.holds, plate); });
      await X.wait(0.9);
      tween(0.6, (u) => { keys.position.y = KEY0[1] + 0.9 * sm(u); keys.position.z = KEY0[2] + 1.6 * sm(u); }, () => { keys.visible = false; });
      V.lock(0); X.quick({ x: sx, y: F16 + 1.2, z: sz + 0.6 }, 'המפתחות!', null);
      X.line('נטל את המפתחות מן השלשלת · נעל הכהן מבפנים', 2600); await X.wait(1.6);
      // (he goes to lock: away from the slab; each gate seen from inside the court by the moon and its own torch alone — the hall's fire
      //  does not reach there, and at the hall's own door it is let down too, so every gate's night is the same)
      A.phase = 'lock'; kohenShow(false); moonOn(true); rig.dim(0); gate.visible = true;
      const Ls = LOCKS(), GC = N7.gateCam, tn = Math.tan((GC.fov * Math.PI) / 360);
      for (let i = 0; i < Ls.length; i++) {
        // (the whole gateway in the frame, its top not cut: back from its inner face so far that its height and a margin fill the lens)
        const L = Ls[i], GE = (N7.gateEye || {})[L.id], back = GE ? GE.back : (L.h * GC.fill) / (2 * tn), yc = L.at[1] + L.h * GC.mid, eye = [L.at[0] + L.n[0] * back, yc + (GE ? GE.up : GC.up), L.at[2] + L.n[1] * back], aim = [L.at[0], yc, L.at[2]];   // (F3: a gate's own eye — BOOK.s07.night.gateEye)
        gatePlace(L); leavesSet(0); boltSet(0); G1.lit.intensity = GC.lamp * Math.min(1, L.w / 10); A.lockS = 'open';
        A.lockI = i; A.fov = GC.fov; await fade(eye, aim, GC.fov); X.line('נועל: ' + L.label, 1800);
        await X.wait(0.4);
        A.lockS = 'swing'; await new Promise((res) => tween(1.2, (u) => leavesSet(sm(u)), res));
        V.knock(0.8);
        A.lockS = 'bolt'; await new Promise((res) => tween(0.45, (u) => boltSet(sm(u)), res));
        // (the closed leaves flash gold once, gone within 0.4 s of the act's clock; the word on the screen, no glow in the world)
        V.lock(i); A.flashT = 0.4; const q = scr({ x: L.at[0] + L.n[0] * 1.5, y: L.at[1] + L.h * 0.6, z: L.at[2] + L.n[1] * 1.5 }); X.quick({ sx: q.x, sy: q.y }, 'ננעל!', null);
        await X.wait(0.5); A.lockS = 'shut'; await X.wait(0.9);
      }
      gate.visible = false; G1.lit.intensity = 0; A.lockS = '';
      A.phase = 'levi'; A.fov = CAM.nightFov; leviG.visible = true; leviOn(true); await fade(CAM.nightLevi[0], CAM.nightLevi[1], CAM.nightFov);
      X.line('ובן לוי ישן לו מבחוץ', 3000);
      await X.wait(2.8);
      moonOn(false); rig.dim(1); keys.visible = true; keys.position.set(...KEY0); kohenShow(true);
      await fade(CAM.nightSlab[0], CAM.nightSlab[1], CAM.nightSlabFov); leviG.visible = false; leviOn(false); A.fov = CAM.nightSlabFov;
      A.phase = 'lower'; lift(0.22); halos.forEach((h) => { h.visible = true; });
      X.line('המפתחות חזרו לשלשלת · הורידו את הטבלה לאט: שלשלת שמקשקשת ואבק שעף — מהר מדי', 6000);
      const r = gripAt(-1); X.hand({ x: r.x, y: r.y, z: r.z }, 0, gripR() / 3);
    }
    async function finish(soft) {
      A.phase = 'done'; lift(0); X.hand(null); halos.forEach((h) => { h.visible = false; }); walkHide(true);   // (round 3: no walk hint from here to the stage's summary)
      if (soft) X.quick({ x: sx, y: F16 + 0.5, z: sz }, 'במקומה!', marble);
      st.night = { bangs: S.bangs, dmg: S.dmg }; X.save();
      await X.wait(1.0);
      // (he spreads his garment over the slab and lies down on it to sleep: the same figure, laid on his back across it)
      X.shot(CAM.nightSleep[0], CAM.nightSleep[1], 1.2); lens(CAM.nightFov); A.fov = CAM.nightFov;
      await X.wait(1.3);
      A.sleepS = 'cloak'; cloak.visible = true; V.cloak(); lamp.intensity = 6; X.line('נתן כסותו עליה', 1800);
      await X.wait(1.4);
      if (AC) for (const q of [...NIGHTA.set]) if (q === kohen || q.poseName === 'sit') { try { AC.remove(q); } catch (e) { /* */ } NIGHTA.set.delete(q); }
      kohen = null;
      const me = sleeperA(X, AC, MT, sleepG, { mid: [sx, sz], y: F16 + 0.17, head: [-1, 0], side: 0, young: false, col2: '#3A2A1E', cover: coverM[0] });
      kohen = me.a; A.sleepS = 'asleep'; X.line('ישן לו', 2600);
      await X.wait(2.6);
      await card(X, `<b style="font:900 20px Heebo,system-ui">טבלת השיש</b>${cite(LINES.middot19)}`, 9000);
      const pts = nightPts(S), q = qOf(pts);
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags: { bangs: S.bangs, 'night.slab': S.dmg ? 1 : 0 }, at: { x: sx, y: F16 + 0.5, z: sz }, film: { kohen: false } });   // (closing round: he sleeps on the slab — the walking kohen is not in the hall's picture after it; the picture is the pack's pull view)
    }
    let bangT = 0;
    function stepSlab(dt) {
      if (A.phase === 'lower' && A.stay > 0 && A.fing.size >= need()) { A.stay = 0; tween(0.3, (u) => staySet(1 - sm(u))); }   // (his thumbs on it: the stay folds away)
      const h0 = S.h; slabStep(S, target(), dt, tiltNow()); setSlab();
      if (A.phase === 'lift' && S.h > 0.05 && S.h < SLAB.OPEN) { /* (rising: the pit, its chain and keys come into sight under it) */ }
      for (const e of S.ev) {
        ev(e.e);
        if (e.e === 'bang') { V.thud(); X.shake(0.12, 0.2); bangT = 1.6; X.dust(sx, F16 + 0.1, sz, 6, 0.6); rebase(); X.line(A.tipped ? 'הטבלה נטתה ונפלה בקול · זקן הרים את ראשו · הרימו את שני הצדדים יחד, בשווה' : 'הטבלה נפלה חזרה בקול · זקן הרים את ראשו · הגביהו שוב, עד שהסמוכה נכנסת תחתיה', 3600); A.tipped = 0; }
        // (R4: leaning, it knocks on its frame — more often as it leans; just before it would fall it creaks; past that it tips)
        if (e.e === 'knock') { V.knock(1.5 + e.k * 3); const sg = S.tilt > 0 ? 1 : -1; X.dust(sx + sg * HS * 0.5, F16 + 0.05, sz, 2, 0.25); }
        if (e.e === 'tiltCreak') { V.groan(); X.line('הטבלה נוטה וחורקת: השוו את שני הצדדים', 2200); }
        if (e.e === 'tip') A.tipped = 1;
        if (e.e === 'keys') { A.stay = 1; A.fing.clear(); lockGates(); }
        if (e.e === 'loss') { const p = Mo.mark('night.slab', m.id, [sx, sz]); slabDamage(X, plate, 0, 0, 0.12, HS / 2, null); slabDamage(X, root, sx, sz, null, HS / 2, F16); V.crack(); X.loss(p, { x: sx, y: F16 + 0.4, z: sz }, LOSS['night.slab'][0]); }
        if (e.e === 'down') finish(e.soft);
      }
      if (bangT > 0) { bangT -= dt; for (const e of elders) if (e.a) e.a.lieHp = bangT > 0 ? 0.7 : 0; }   // (an elder lifts his head at the bang)
      // (the stone grinds in its seat, its pitch rising with the speed; lowered faster than soft its chain rattles and dust puffs at the
      //  pit's edge — the warning, before the corner cracks)
      const v = Math.abs(S.h - h0) / Math.max(dt, 1e-3);
      if (A.phase === 'lift' || A.phase === 'lower') V.creak(clamp(v * 1.6, 0, 1));
      if (A.phase === 'lower' && v > SLAB.SOFT * 0.85 && S.h > 0.02) {
        A.rattleT -= dt; chain.rotation.z = Math.sin(A.t * 40) * 0.08;
        if (A.rattleT <= 0) { A.rattleT = 0.16; V.quill(); V.bump(); for (const sg of [-1, 1]) X.dust(sx + sg * HS * 0.55, F16 + 0.05, sz + HS * 0.3 * sg, 3, 0.35); ev('rattle'); }
      } else chain.rotation.z *= 0.8;
      halos.forEach((h, i) => { h.userData.arc.rotation.z = A.t * 1.4 + i * Math.PI; });
    }
    // ── the fingers: on the ring's two sides (a mouse: either side)
    const gripsPx = () => [-1, 1].map((sg) => scr(gripAt(sg)));
    const gripHit = () => Math.max(GRIP_MIN, gripR() * 0.9);
    const nearGrip = (p) => { const G = gripsPx(); let best = -1, bd = 1e9; G.forEach((q, i) => { const d = Math.hypot(p.x - q.x, p.y - q.y); if (d < bd) { bd = d; best = i; } }); return bd < gripHit() ? best : -1; };
    const nearTorch = (p) => { const s = scr(torch.position); return Math.hypot(p.x - s.x, p.y - s.y) < Math.max(GRIP_MIN, gripR()); };
    const FG = fingers(X, {
      down(f) {
        if (A.phase === 'fire' && nearTorch(f)) { f.torch = 1; X.hand(null); return; }
        if ((A.phase === 'lift' || A.phase === 'lower') && A.fing.size < 2 && nearGrip(f) >= 0) { f.side = nearGrip(f); if (A.fing.size) rebase(); else A.base = S.h; A.fing.set(f.id, f); X.hand(null); }
      },
      move(f) { if (f.torch) { const q = onY(X, f, F16 + 0.6); if (q) { torch.position.set(q.x, F16 + 0.6, q.z); if (Math.hypot(q.x - N7.hearth[0], q.z - N7.hearth[1]) < 1.3) { f.torch = 0; fireLit(); } } } },
      up(f) { if (f.torch) { f.torch = 0; torch.position.set(...th0); return; } if (A.fing.has(f.id)) { A.fing.delete(f.id); if (A.fing.size) rebase(); } },
    });
    return {
      close: true,
      begin() { FG.attach(); lens(CAM.nightFov); A.fov = CAM.nightFov; X.shot(CAM.nightHall[0], CAM.nightHall[1], 1.6); setSlab(); setTimeout(lightFire, 1600); },
      update(dt) {
        A.t += dt; holdLens(X, A.fov || CAM.nightFov);
        try {
          V.frame(); rig.frame(dt);
          for (const tw of A.tw.slice()) { tw.t += dt; const u = clamp(tw.t / tw.dur, 0, 1); tw.fn(u); if (u >= 1) { A.tw.splice(A.tw.indexOf(tw), 1); if (tw.done) tw.done(); } }
          if (A.phase !== 'intro' && A.phase !== 'fire') V.fire(A.phase === 'lock' || A.phase === 'levi' ? 0.1 : 0.5);
          if (G1.fl && gate.visible) G1.fl.scale.y = 0.8 + 0.4 * flick(A.t, 2);
          if (A.flashT > 0) { A.flashT = Math.max(0, A.flashT - dt); const k = A.flashT / 0.4; gold.emissiveIntensity = 0.25 + 1.1 * k * k; }   // (the leaves' gold flash: 0.4 s)
          if (A.phase === 'lift' || A.phase === 'lower') stepSlab(dt);
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h129] night', e && e.message); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.fing.clear(); },
      wants(p) { if (!p) return true; if (A.phase === 'fire') return nearTorch(p); if (A.phase === 'lift' || A.phase === 'lower') return nearGrip(p) >= 0; return false; },
      holds() { return A.fing.size > 0; },
      end() {
        lift(0); FG.detach(); V.stop(); X.hand(null); fadeEl.remove(); lens(fov0); moonOn(false); if (SH7.lookFn) SH7.lookFn = null;
        // (round 3: a night that reached its end leaves its sleepers, the kohen on his garment on the slab among them, to the finale's
        //  first picture — the pack's finale lets them go (nightRelease); any other end takes them now)
        const keep = A.phase === 'done';
        if (keep) { try { sleepG.attach(cloak); } catch (e) { /* */ } SH7.nightKeep = { g: sleepG, actors: [kohen, ...sleepers.map((q) => q.a)].filter(Boolean) }; }
        if (AC) for (const a of [kohen, levi, ...sleepers.map((q) => q.a)]) { if (a && !(keep && a !== levi)) { try { AC.remove(a); } catch (e) { /* */ } } }
        if (!keep) { X.props.remove(sleepG); walkHide(false); }
        X.props.remove(root);
        own('slab', 0); setBusy(X, 0);
        // (the night stays for the pack's finale, which turns it off)
      },
      at() { return new T.Vector3(sx, F16 + 0.5, sz); },
      dbg() {
        const G = gripsPx(), tq = scr(torch.position), hq = scr({ x: N7.hearth[0], y: F16 + 0.6, z: N7.hearth[1] }), c0 = scr({ x: sx - HS / 2, y: F16 + 0.12, z: sz }), c1 = scr({ x: sx + HS / 2, y: F16 + 0.12, z: sz });
        return { id: m.id, phase: A.phase, mouse: MOUSE, ev: A.ev.slice(-10), nf: FG.n, n: A.fing.size, need: need(), h: +S.h.toFixed(3), v: +S.v.toFixed(3), sphase: S.phase, bangs: S.bangs, dmg: S.dmg, tilt: +(S.tilt || 0).toFixed(3), tilts: S.tilts | 0, drop: S.drop | 0,
          grips: G.map((q) => [Math.round(q.x), Math.round(q.y)]), ring: [Math.round((G[0].x + G[1].x) / 2), Math.round((G[0].y + G[1].y) / 2)], gripHit: Math.round(gripHit()), slabPx: Math.round(Math.hypot(c1.x - c0.x, c1.y - c0.y)),
          torch: [Math.round(tq.x), Math.round(tq.y)], hearth: [Math.round(hq.x), Math.round(hq.y)], unit: Math.round(unit()), open: SLAB.OPEN, soft: SLAB.SOFT, lockI: A.lockI, nLocks: LOCKS().length, lockS: A.lockS || '', gbox: G1.frame && gate.visible ? (() => { const bx = new T.Box3().setFromObject(G1.frame); return [bx.min.toArray().map((v) => +v.toFixed(2)), bx.max.toArray().map((v) => +v.toFixed(2))]; })() : null, frameAt: G1.frame ? G1.frame.position.toArray().map((v) => +v.toFixed(2)) : null, frameRy: G1.frame ? +G1.frame.rotation.y.toFixed(2) : null, flash: +(A.flashT || 0).toFixed(2), sleepS: A.sleepS || '', kohen: kohen ? { vis: kohen.vis, off: !!kohen.gateOff, lie: !!kohen.lie, near: AC && AC.list ? (Array.isArray(AC.list) ? AC.list : AC.list()).filter((q) => Math.hypot(q.x - sx, q.z - sz) < 4).map((q) => q.poseName + (q.lie ? 'L' : '') + (q.gateOff ? 'o' : '') + (q === kohen ? '*' : '') + (q.alive ? '' : 'x') + (q.gang ? 'g' : '') + (NIGHTA.set.has(q) ? 'n' : '')).join(' ') + ' m' + NIGHTA.makes : '' } : null, sleepers: sleepers.map((q) => (q.a ? (q.a.gateOff ? 'off' : 'on') : '-')).join('') };
      },
    };
  },
};
