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
import { SLAB, QUICK, LOSS, LINES, slabFresh, slabStep, nightPts, qOf, starsOf } from './model.js';
import { SH7, mats7, box, own, setBusy, vaultWhole } from './world.js';
import { createVoices } from './sound129.js';
import { card, cite, holdLens } from './ui7.js';
import { fingers, MOUSE, onY } from '../h113/acts.js';
import { gripR } from '../h109/grips.js';
import { BOOK } from '../world/grid.js';

const S7 = BOOK.s07, N7 = S7.night, CAM = S7.cam, F16 = S7.floors.azara, HS = N7.slabSize;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const sm = (u) => { const v = clamp(u, 0, 1); return v * v * (3 - 2 * v); };
const FIRE_I = 26;    // (the fire's light: the hall warm, the slab six amot off it readable, nothing burnt white)
const GRIP_MIN = 64;
// (the flames' flicker: a fixed table, rule 56)
const FL = Array.from({ length: 32 }, (_, i) => { const v = Math.sin(i * 12.9898 + 4.1) * 43758.5453; return v - Math.floor(v); });
const flick = (t, i) => { const f = t * 9 + i * 5.3, a = Math.floor(f), u = f - a; return FL[a % 32] * (1 - u) + FL[(a + 1) % 32] * u; };
const LOCKS = () => N7.gates.map((id) => { const e = BOOK.s04.entries.find((q) => q.id === id), L = N7.locks[id]; return e && L ? { id, label: e.label, ...L } : null; }).filter(Boolean);

/** the night's look: the world's clock at the dark night, the fire on the hearth (its logs, its flames, its embers, its light); apply(k)
 *  on, off() */
export function nightRig(X) {
  const T = X.THREE, M = mats7(X), g = new T.Group(); g.name = 'h129-night'; let on = false, t = 0;
  const h = N7.hearth;
  const logM = M.h7log || (M.h7log = new T.MeshStandardMaterial({ color: '#2E2016', roughness: 1, flatShading: true }));
  // the logs laid crosswise, two layers of three
  for (let L = 0; L < 2; L++) for (let i = -1; i <= 1; i++) {
    const l = new T.Mesh(new T.CylinderGeometry(0.12, 0.14, 1.5, 7), logM); l.rotation.z = Math.PI / 2; if (L) l.rotation.y = Math.PI / 2;
    l.position.set(h[0] + (L ? i * 0.36 : 0), F16 + 0.14 + L * 0.24, h[1] + (L ? 0 : i * 0.36)); l.castShadow = true; g.add(l);
  }
  const ring = new T.Mesh(new T.TorusGeometry(1, 0.18, 6, 16), M.h7holy); ring.rotation.x = Math.PI / 2; ring.position.set(h[0], F16 + 0.1, h[1]); g.add(ring);
  // the embers under the logs
  const emberM = new T.MeshBasicMaterial({ color: 0xC2410C }), emberH = new T.MeshBasicMaterial({ color: 0xFF7A26 });
  const bed = new T.Mesh(new T.CircleGeometry(0.75, 14), emberM); bed.rotation.x = -Math.PI / 2; bed.position.set(h[0], F16 + 0.02, h[1]); g.add(bed);
  const embers = []; for (let i = 0; i < 9; i++) { const a = i * 2.39, r = 0.25 + 0.4 * FL[i]; const e = new T.Mesh(X.props.geo.box, emberH); e.scale.setScalar(0.07 + 0.05 * FL[i + 9]); e.position.set(h[0] + Math.cos(a) * r, F16 + 0.05, h[1] + Math.sin(a) * r); g.add(e); embers.push(e); }
  // the flames: orange outer cones, yellow inner ones (no light added on light: nothing burns white on the screen)
  const outM = new T.MeshBasicMaterial({ color: 0xF26A1B, transparent: true, opacity: 0.78, depthWrite: false }), inM = new T.MeshBasicMaterial({ color: 0xFFB43C, transparent: true, opacity: 0.85, depthWrite: false });
  const flames = [];
  for (let i = 0; i < 7; i++) {
    const inner = i >= 4, f = new T.Mesh(new T.ConeGeometry(inner ? 0.15 : 0.27, inner ? 0.75 : 1.25, 7), inner ? inM : outM), a = i * 1.7, r = inner ? 0.12 : 0.3;
    f.position.set(h[0] + Math.cos(a) * r, F16 + 0.45 + (inner ? 0.35 : 0.6) * 0.5, h[1] + Math.sin(a) * r); f.userData.y0 = f.position.y; f.userData.h = inner ? 0.75 : 1.25; f.renderOrder = inner ? 6 : 5; g.add(f); flames.push(f);
  }
  const light = new T.PointLight(0xFF9A4A, 0, N7.fireLight.dist, N7.fireLight.decay); light.position.set(h[0], F16 + 2.6, h[1]); g.add(light);
  let fire = 0;
  const R = {
    lit: (v) => { fire = v ? 1 : 0; light.intensity = v ? FIRE_I : 0; for (const f of flames) f.visible = !!v; for (const e of embers) e.visible = !!v; bed.visible = !!v; },
    apply(k = 1) {
      if (!on) { on = true; X.props.root.add(g); try { const E = X.pack && X.pack.time; if (E && E.setTime) E.setTime('night'); } catch (e) { /* */ } }
      if (k && fire === 0 && R.autoLit !== false) R.lit(1);
    },
    frame(dt) {
      t += dt; const k = fire ? 1 : 0;
      light.intensity = k * FIRE_I * (0.88 + 0.24 * flick(t, 0));
      flames.forEach((f, i) => { const s = 0.75 + 0.5 * flick(t, i + 1); f.scale.set(1, s, 1); f.position.y = f.userData.y0 + (f.userData.h * (s - 1)) / 2; f.rotation.y = i + 0.4 * flick(t * 0.5, i + 3); });
      embers.forEach((e, i) => { e.material = flick(t * 0.7, i + 7) > 0.55 ? emberH : emberM; });
    },
    off() { if (!on) return; on = false; X.props.remove(g); try { const E = X.pack && X.pack.time; if (E && E.restoreTime) E.restoreTime(); } catch (e) { /* */ } },
  };
  R.lit(0);
  return R;
}

/** a sleeper: a body under a cloak, a head, the feet — lying along +x of its group (head at +x), on his garment when asked */
function sleeper(X, x, y, z, a, col, parent, o = {}) {
  const T = X.THREE, M = mats7(X), g = new T.Group();
  const cl = new T.MeshStandardMaterial({ color: col, roughness: 1, flatShading: true });
  if (o.garment) { const gm = new T.Mesh(X.props.geo.box, M.h7cloak); gm.scale.set(2.25, 0.04, 1.0); gm.position.set(0, 0.02, 0); gm.receiveShadow = true; g.add(gm); }
  const by = o.garment ? 0.04 : 0;
  const body = new T.Mesh(new T.CylinderGeometry(0.3, 0.26, 1.55, 9), cl); body.rotation.z = Math.PI / 2; body.scale.set(1, 1, 0.75); body.position.set(-0.12, by + 0.24, 0); body.castShadow = true; g.add(body);
  const feet = new T.Mesh(new T.SphereGeometry(0.2, 8, 6), cl); feet.scale.set(1.2, 0.9, 1.1); feet.position.set(-0.92, by + 0.2, 0); g.add(feet);
  const head = new T.Mesh(new T.SphereGeometry(0.2, 10, 8), new T.MeshStandardMaterial({ color: '#B98E6A', roughness: 0.9 })); head.position.set(0.86, by + 0.24, 0); g.add(head);
  const cap = new T.Mesh(new T.SphereGeometry(0.215, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), M.h7cloak); cap.position.copy(head.position); cap.rotation.z = Math.PI / 2; g.add(cap);
  g.position.set(x, y, z); g.rotation.y = -a; parent.add(g); g.userData.head = [head, cap];
  return g;
}

export const NIGHT = {
  icon: '🔑', title: 'הלילה בבית המוקד',
  walkLine: () => 'בית המוקד: זמן הנעילה',
  stand() { const s = N7.hearth; return { x: s[0] + 3, z: s[1] + 2, face: [N7.slab[0], N7.slab[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, st = Mo.st, V = createVoices(X.sfx), MT = mats7(X), AC = X.actors ? X.actors() : null;
    const A = { phase: 'intro', t: 0, ev: [], fing: new Map(), base: 0, lockI: -1, tw: [], rattleT: 0, stay: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    own('slab', 1); setBusy(X, 1); X.kohen(false); vaultWhole(X);
    const cam0 = X.camera, fov0 = cam0.fov, lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
    const rig = SH7.rig || nightRig(X); SH7.rig = rig; rig.autoLit = false; rig.apply(1); rig.lit(0);
    const root = new T.Group(); root.name = 'h129-night-act'; X.props.root.add(root);
    const tween = (dur, fn, done) => { A.tw.push({ t: 0, dur, fn, done }); };
    const sl = N7.slab, sx = sl[0], sz = sl[1];
    // ── the sleepers: elders on the ledges (the two by the north wall drawn toward the slab's side, inside the slab's frame), the young
    //    kohanim on the floor on their garments — two beyond the slab, four round the fire; none on the slab's way
    const elders = N7.ledges.map((b, i) => { const lx = b[2] - b[0], lz = b[3] - b[1], along = lx >= lz ? 0 : Math.PI / 2, cx = (b[0] + b[2]) / 2, cz = (b[1] + b[3]) / 2, pull = i < 2 ? Math.sign(sx - cx) * Math.max(0, (lx - 2.25) / 2) : 0; return sleeper(X, cx + pull, N7.ledgeY, cz, along + (cx < sx ? Math.PI : 0), ['#5E5A70', '#6A5E4E', '#4E5E6A'][i % 3], root); });
    const young = [];
    for (const sg of [-1, 1]) young.push(sleeper(X, sx + sg * 1.9, F16, sz - 2.9, Math.PI / 2, '#E2DAC6', root, { garment: true }));
    for (let i = 0; i < 4; i++) { const a = Math.PI * (0.2 + (i / 3) * 0.6), r = 4.6; young.push(sleeper(X, N7.hearth[0] + Math.cos(a) * r * 1.35, F16, N7.hearth[1] + Math.sin(a) * r, a + Math.PI / 2, '#E2DAC6', root, { garment: true })); }
    // ── the kohen kneels beyond the slab (the camera's far side), facing it (his hands at its ring's height); his lamp on the floor by him
    let kohen = null, kneel = null;   // (the act's kneeling kohen is drawn below; after the lowering he lies on the slab)
    // (drawn here, not one of the world's figures: a kneeling man in white, his sash and turban, his hands forward toward the ring)
    { const kx = sx, kz = sz - 1.4, g = new T.Group(), white = new T.MeshStandardMaterial({ color: '#F1ECE0', roughness: 0.9, flatShading: true }), skin = new T.MeshStandardMaterial({ color: '#B98E6A', roughness: 0.9 });
      const part = (geo, mat, x, y, z, rz = 0, sc = null) => { const q = new T.Mesh(geo, mat); q.position.set(x, y, z); q.rotation.z = rz; if (sc) q.scale.set(...sc); q.castShadow = true; g.add(q); return q; };
      part(X.props.geo.box, white, -0.12, 0.13, 0, 0, [0.62, 0.26, 0.5]);                                  // (shins and feet under him)
      part(new T.CylinderGeometry(0.17, 0.24, 0.62, 12), white, -0.12, 0.56, 0, -0.08);                        // (the body, leaning in)
      part(new T.CylinderGeometry(0.235, 0.235, 0.07, 12), new T.MeshStandardMaterial({ color: '#8A3A4A', roughness: 0.8 }), -0.13, 0.42, 0, -0.08);         // (the sash)
      part(new T.SphereGeometry(0.13, 10, 8), skin, 0.0, 0.98, 0);                                            // (the head)
      part(new T.SphereGeometry(0.15, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), white, 0.0, 1.0, 0, 0, [1, 1.1, 1]);   // (the turban)
      for (const sz2 of [-0.17, 0.17]) part(new T.CylinderGeometry(0.05, 0.045, 0.5, 6), white, 0.1, 0.62, sz2, -1.25);   // (the arms, toward the ring)
      g.position.set(kx, F16, kz); g.rotation.y = -Math.PI / 2; g.scale.setScalar(1.2); root.add(g); kneel = g; }   // (beyond the slab, facing the camera: never between it and the ring)
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
    const lamp = new T.PointLight(0xFFD9A0, 0, 9, 1.6); lamp.position.set(sx + 0.9, F16 + 2.2, sz - 1.6); root.add(lamp);   // (his lamp by the slab: the ring, the pit and the keys read at night)
    const lampM = new T.Mesh(new T.SphereGeometry(0.08, 8, 6), new T.MeshBasicMaterial({ color: 0xFFC060 })); lampM.position.set(sx + 0.9, F16 + 0.12, sz - 1.6); root.add(lampM); box(X, MT.h7stone, sx + 0.8, F16, sz - 1.7, sx + 1.0, F16 + 0.06, sz - 1.5, root);
    const cloak = new T.Mesh(X.props.geo.box, MT.h7cloak); cloak.scale.set(HS * 1.15, 0.05, HS * 1.15); cloak.position.set(sx, F16 + 0.15, sz); cloak.visible = false; root.add(cloak);
    // ── the gates' own pieces while they are locked: the gateway's dark passage, two leaves (open into the court), the bar, a torch
    const gate = new T.Group(); gate.visible = false; root.add(gate);
    const leafM = MT.h7leaf || (MT.h7leaf = new T.MeshStandardMaterial({ color: '#C99A3C', roughness: 0.6, metalness: 0.15, emissive: '#2A1C08', flatShading: true }));   // (bronze-clad leaves: little metalness, so the torch reads on them at night)
    const G1 = { pass: box(X, MT.h7dark, -0.5, 0, -0.04, 0.5, 1, 0.04, gate), hinge: [new T.Group(), new T.Group()], leaf: [], bar: box(X, MT.h7iron, -0.5, -0.15, -0.15, 0.5, 0.15, 0.15, gate), lit: new T.PointLight(0xFFB060, 0, 26, 1.5), fl: null };
    for (const hg of G1.hinge) { gate.add(hg); const pv = new T.Group(); hg.add(pv); const lf = new T.Mesh(X.props.geo.box, leafM); lf.castShadow = true; pv.add(lf); G1.leaf.push(lf); }   // (hinge: the gate's yaw; its pivot: the leaf's swing)
    gate.add(G1.lit); G1.fl = new T.Mesh(new T.ConeGeometry(0.22, 0.6, 7), new T.MeshBasicMaterial({ color: 0xFFA040 })); gate.add(G1.fl);
    const brk = box(X, MT.h7timberD, -0.06, -0.5, -0.06, 0.06, 0.5, 0.06, gate);
    /** the gate L's pieces placed in the world: the frame (u along the face, n into the court) */
    function gatePlace(L) {
      const [ax, ay, az] = L.at, n = L.n, u = [-n[1], n[0]], w = L.w, h = L.h, P = (a, y, b) => [ax + u[0] * a + n[0] * b, ay + y, az + u[1] * a + n[1] * b], yaw = Math.atan2(u[1], u[0]);
      const pass = P(0, h / 2, 0.02); G1.pass.position.set(...pass); G1.pass.scale.set(w, h, 0.1); G1.pass.rotation.y = -yaw;
      G1.hinge.forEach((hg, i) => { const sg = i ? 1 : -1, p = P(sg * w / 2, 0, 0.18); hg.position.set(...p); hg.rotation.y = -yaw; hg.userData.sg = sg; const lf = G1.leaf[i]; lf.scale.set(w / 2 - 0.05, h - 0.1, 0.22); lf.position.set(-sg * (w / 4), h / 2, 0); });
      G1.bar.scale.set(w + 1.2, 1, 1); G1.bar.rotation.y = -yaw; G1.barP = (k) => P((w + 3) * (1 - k), h * 0.45, 0.45);
      const tp = P(w / 2 + 1.4, S7.night.gateCam.torch, 0.5); brk.position.set(tp[0], tp[1] - 0.5, tp[2]); G1.fl.position.set(tp[0], tp[1] + 0.3, tp[2]); G1.lit.position.set(tp[0] + n[0] * 1.5, tp[1] + 0.8, tp[2] + n[1] * 1.5);
      G1.n = n; G1.u = u;
    }
    /** the leaves at k (0 open into the court, 1 shut) */
    const leavesSet = (k) => G1.hinge.forEach((hg) => { const sg = hg.userData.sg; hg.children[0].rotation.y = sg * (Math.PI / 2) * (1 - k) * 0.95; });
    // ── the moon while the gates are locked: a cool light over the court, strong enough to read walls and gates
    const moon = new T.Group(); const hemi = new T.HemisphereLight(0x8AA4E8, 0x141A2A, 1.0), mdir = new T.DirectionalLight(0x9DB6FF, 0.95); mdir.position.set(...N7.moon.at); mdir.target.position.set(...N7.moon.aim); moon.add(hemi, mdir, mdir.target);
    const moonOn = (v) => { if (v) X.props.root.add(moon); else X.props.root.remove(moon); };
    // ── the Levite outside: he stands at the hall's north door, then lies down across it
    const leviP = new T.Group(); leviP.position.set(N7.levi[0] - 1.1, N7.levi[2], N7.levi[1]); root.add(leviP); leviP.visible = false;
    sleeper(X, 1.1, 0, 0, 0, '#DCCDAE', leviP, { garment: true });
    // ── a fade, for the cuts (never a flight through walls)
    const fadeEl = document.createElement('div'); fadeEl.className = 'h109-ui'; fadeEl.style.cssText = 'position:fixed;inset:0;background:#000;opacity:0;pointer-events:none;z-index:55;transition:opacity .35s'; document.body.appendChild(fadeEl);
    const fade = async (eye, aim, fov) => { fadeEl.style.opacity = '1'; await X.wait(0.4); X.shot(eye, aim, 0.01); if (fov) lens(fov); await X.wait(0.15); fadeEl.style.opacity = '0'; await X.wait(0.3); };
    // ── the slab's model
    const S = slabFresh();
    const setSlab = () => { plate.position.y = S.h * 1.0; };   // (lifted flat: h 1 = an amah)
    const gripAt = (sg) => { const v = new T.Vector3(sg * RR, 0.16, 0); plate.localToWorld(v); return v; };
    const scr = (v) => { const r = X.scr(v.x, v.y, v.z); return { x: r.x, y: r.y }; };
    const unit = () => 0.3 * innerHeight;   // (the slab's whole lift: this far up on the screen)
    const lift = (u) => { try { if (X.lookLift && !MOUSE) X.lookLift(u); } catch (e) { /* */ } };   // (brief F5: both thumbs on the ring — a small lift by the act, under the vault)
    const need = () => (MOUSE ? 1 : 2);
    const target = () => { if (A.fing.size < need()) return null; let v = Infinity; for (const f of A.fing.values()) v = Math.min(v, A.base + (f.y0 - f.y) / unit()); return v; };
    const camSlab = (d = 1) => { X.shot(CAM.nightSlab[0], CAM.nightSlab[1], d); lens(CAM.nightSlabFov); A.fov = CAM.nightSlabFov; };
    // (the right thumb's look in the hall: up under the vault, never out through its walls; at the gates the court's own look)
    SH7.lookFn = (base, u, yaw) => {
      if (A.phase === 'lock' || A.phase === 'levi') return null;
      const e = Math.pow(sm((+u || 0) / 0.75), 1.7), P1 = [sx, F16 + 8.5, sz + 6.5], T1 = [sx, F16 + 0.4, sz - 1.5], fv = Number.isFinite(base.fov) ? base.fov : 50, yw = clamp(+yaw || 0, -0.8, 0.8);
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
      tween(0.6, (u) => { keys.position.y = KEY0[1] + 0.9 * sm(u); keys.position.z = KEY0[2] - 1.0 * sm(u); }, () => { keys.visible = false; });
      V.lock(0); X.quick({ x: sx, y: F16 + 1.2, z: sz - 0.8 }, 'המפתחות!', null);
      X.line('נטל את המפתחות מן השלשלת · נעל הכהן מבפנים', 2600); await X.wait(1.6);
      A.phase = 'lock'; moonOn(true); gate.visible = true;
      const Ls = LOCKS(), GC = N7.gateCam;
      for (let i = 0; i < Ls.length; i++) {
        const L = Ls[i], eye = [L.at[0] + L.n[0] * GC.back, L.at[1] + GC.up, L.at[2] + L.n[1] * GC.back], aim = [L.at[0], L.at[1] + Math.min(L.h * 0.42, 8), L.at[2]];
        gatePlace(L); leavesSet(0); G1.bar.position.set(...G1.barP(0)); G1.lit.intensity = 28;
        A.lockI = i; await fade(eye, aim, CAM.nightFov); X.line('נועל: ' + L.label, 1800);
        await X.wait(0.4);
        await new Promise((res) => tween(1.2, (u) => leavesSet(sm(u)), res));
        V.knock(0.8);
        await new Promise((res) => tween(0.45, (u) => G1.bar.position.set(...G1.barP(sm(u))), res));
        V.lock(i); X.quick({ x: L.at[0] + L.n[0] * 1.5, y: L.at[1] + Math.min(L.h * 0.55, 6), z: L.at[2] + L.n[1] * 1.5 }, 'ננעל!', null); await X.wait(0.9);
      }
      gate.visible = false; G1.lit.intensity = 0;
      A.phase = 'levi'; await fade(CAM.nightLevi[0], CAM.nightLevi[1], CAM.nightFov); leviP.visible = true; leviP.rotation.z = Math.PI / 2;
      X.line('ובן לוי ישן לו מבחוץ', 2600);
      await new Promise((res) => tween(1.2, (u) => { leviP.rotation.z = (Math.PI / 2) * (1 - sm(u)); }, res));
      await X.wait(1.4);
      moonOn(false); keys.visible = true; keys.position.set(...KEY0);
      await fade(CAM.nightSlab[0], CAM.nightSlab[1], CAM.nightSlabFov);
      A.phase = 'lower'; lift(0.22); halos.forEach((h) => { h.visible = true; });
      X.line('המפתחות חזרו לשלשלת · הורידו את הטבלה לאט: שלשלת שמקשקשת ואבק שעף — מהר מדי', 6000);
      const r = gripAt(-1); X.hand({ x: r.x, y: r.y, z: r.z }, 0, gripR() / 3);
    }
    async function finish(soft) {
      A.phase = 'done'; lift(0); X.hand(null); halos.forEach((h) => { h.visible = false; });
      cloak.visible = true; V.cloak();
      if (soft) X.quick({ x: sx, y: F16 + 0.5, z: sz }, 'במקומה!', cloak);
      st.night = { bangs: S.bangs, dmg: S.dmg }; X.save();
      await X.wait(1.0);
      // (he spreads his garment over it and sleeps there)
      if (kohen) { try { AC.remove(kohen); } catch (e) { /* */ } kohen = null; }
      if (kneel) kneel.visible = false;
      sleeper(X, sx, F16 + 0.12, sz, Math.PI / 2, '#EFE9DC', root);
      X.shot(CAM.nightHall[0], CAM.nightHall[1], 1.6); lens(CAM.nightFov); X.line('נתן כסותו עליה, ישן לו', 2600);
      await X.wait(2.4);
      await card(X, `<b style="font:900 20px Heebo,system-ui">טבלת השיש</b>${cite(LINES.middot19)}`, 9000);
      const pts = nightPts(S), q = qOf(pts);
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags: { bangs: S.bangs, 'night.slab': S.dmg ? 1 : 0 }, at: { x: sx, y: F16 + 0.5, z: sz } });
    }
    let bangT = 0;
    function stepSlab(dt) {
      if (A.phase === 'lower' && A.stay > 0 && A.fing.size >= need()) { A.stay = 0; tween(0.3, (u) => staySet(1 - sm(u))); }   // (his thumbs on it: the stay folds away)
      const h0 = S.h; slabStep(S, target(), dt); setSlab();
      if (A.phase === 'lift' && S.h > 0.05 && S.h < SLAB.OPEN) { /* (rising: the pit, its chain and keys come into sight under it) */ }
      for (const e of S.ev) {
        ev(e.e);
        if (e.e === 'bang') { V.thud(); X.shake(0.12, 0.2); bangT = 1.6; X.dust(sx, F16 + 0.1, sz, 6, 0.6); X.line('הטבלה נפלה חזרה בקול · זקן הרים את ראשו · הגביהו שוב, עד שהסמוכה נכנסת תחתיה', 3600); }
        if (e.e === 'keys') { A.stay = 1; A.fing.clear(); lockGates(); }
        if (e.e === 'loss') { const p = Mo.mark('night.slab', m.id, [sx, sz]); const c = box(X, MT.h7crack, sx + HS / 2 - 0.4, F16 + 0.125, sz + HS / 2 - 0.3, sx + HS / 2 - 0.02, F16 + 0.14, sz + HS / 2 - 0.27, root); c.rotation.y = 0.6; V.crack(); X.loss(p, { x: sx, y: F16 + 0.4, z: sz }, LOSS['night.slab'][0]); }
        if (e.e === 'down') finish(e.soft);
      }
      if (bangT > 0) { bangT -= dt; const hd = elders[0].userData.head; for (const q of hd) q.position.y = 0.24 + (bangT > 0 ? 0.25 : 0); }
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
        if ((A.phase === 'lift' || A.phase === 'lower') && A.fing.size < 2 && nearGrip(f) >= 0) { if (!A.fing.size) A.base = S.h; A.fing.set(f.id, f); X.hand(null); }
      },
      move(f) { if (f.torch) { const q = onY(X, f, F16 + 0.6); if (q) { torch.position.set(q.x, F16 + 0.6, q.z); if (Math.hypot(q.x - N7.hearth[0], q.z - N7.hearth[1]) < 1.3) { f.torch = 0; fireLit(); } } } },
      up(f) { if (f.torch) { f.torch = 0; torch.position.set(...th0); return; } if (A.fing.has(f.id)) { A.fing.delete(f.id); if (A.fing.size) A.base = S.h; } },
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
          if (A.phase === 'lift' || A.phase === 'lower') stepSlab(dt);
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h129] night', e && e.message); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.fing.clear(); },
      wants(p) { if (!p) return true; if (A.phase === 'fire') return nearTorch(p); if (A.phase === 'lift' || A.phase === 'lower') return nearGrip(p) >= 0; return false; },
      holds() { return A.fing.size > 0; },
      end() {
        lift(0); FG.detach(); V.stop(); X.hand(null); fadeEl.remove(); lens(fov0); moonOn(false); if (SH7.lookFn) SH7.lookFn = null;
        if (kohen) { try { AC.remove(kohen); } catch (e) { /* */ } }
        X.props.remove(root); void young;
        own('slab', 0); setBusy(X, 0);
        // (the night stays for the pack's finale, which turns it off)
      },
      at() { return new T.Vector3(sx, F16 + 0.5, sz); },
      dbg() {
        const G = gripsPx(), tq = scr(torch.position), hq = scr({ x: N7.hearth[0], y: F16 + 0.6, z: N7.hearth[1] }), c0 = scr({ x: sx - HS / 2, y: F16 + 0.12, z: sz }), c1 = scr({ x: sx + HS / 2, y: F16 + 0.12, z: sz });
        return { id: m.id, phase: A.phase, mouse: MOUSE, ev: A.ev.slice(-10), nf: FG.n, n: A.fing.size, need: need(), h: +S.h.toFixed(3), v: +S.v.toFixed(3), sphase: S.phase, bangs: S.bangs, dmg: S.dmg,
          grips: G.map((q) => [Math.round(q.x), Math.round(q.y)]), ring: [Math.round((G[0].x + G[1].x) / 2), Math.round((G[0].y + G[1].y) / 2)], gripHit: Math.round(gripHit()), slabPx: Math.round(Math.hypot(c1.x - c0.x, c1.y - c0.y)),
          torch: [Math.round(tq.x), Math.round(tq.y)], hearth: [Math.round(hq.x), Math.round(hq.y)], unit: Math.round(unit()), open: SLAB.OPEN, soft: SLAB.SOFT, lockI: A.lockI, nLocks: LOCKS().length };
      },
    };
  },
};
