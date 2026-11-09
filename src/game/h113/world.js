/* ── build 113 ── h113/world.js — the things of stage 04 in the old world, shared by its acts: the seven openings the courts' wall kept
 * from stage 02 (opened again: stages.siteOpen + wallHoles), the kohen's three north gates as the save has them (the timber formwork
 * of stage 02, the sill with its sockets, the dressed jambs, the lintel on its sledge or on the jambs, the cedar leaves on their pins,
 * the rings, the bar and the pin lock, the gold once the goldsmiths came), the crews' three south gates rising with him, the carpenters'
 * yard between the first two gatehouses, the two treadwheel derricks, the crews at real work, the goal chip "שערים 0/6".
 * Built, not boxes where it shows (rule 9): the leaves are their planks and battens, the pins bronze, the lock a box with its pins.
 */
import { H113, GATES, SOUTH, YARD, socketAt, inherit, lockOf, PISH } from './model.js';
import { createBeat, createGang, clamp } from '../h109/kit.js';

export const SH4 = { final: 0, X: null, B: null, crew: null, gates: {}, south: {}, keys: {}, skey: '', yard: null, dk: [], labels: [], chip: null, busy: 0, camD: 0, amb: [], ambKey: '', holeT: 0 };
const TAU = Math.PI * 2;

/* ───────── materials ───────── */
export function mats(X) {
  const P = X.props, T = X.THREE;
  if (P.M.cedar) return P.M;
  P.M.cedar = new T.MeshStandardMaterial({ color: '#A8743E', roughness: 0.8, flatShading: true });
  P.M.cedarL = new T.MeshStandardMaterial({ color: '#BE8A50', roughness: 0.8, flatShading: true });
  P.M.cedarD = new T.MeshStandardMaterial({ color: '#7C5230', roughness: 0.85, flatShading: true });
  P.M.bronze = new T.MeshStandardMaterial({ color: '#B07A3A', roughness: 0.35, metalness: 0.7 });
  P.M.goldL = new T.MeshStandardMaterial({ color: '#E8B84A', roughness: 0.28, metalness: 0.85, emissive: '#3A2604', emissiveIntensity: 0.25 });
  P.M.iron = new T.MeshStandardMaterial({ color: '#4C4A48', roughness: 0.55, metalness: 0.6 });
  P.M.lead = new T.MeshStandardMaterial({ color: '#8E9298', roughness: 0.5, metalness: 0.5 });
  P.M.flint = new T.MeshStandardMaterial({ color: '#3E3A36', roughness: 0.3, flatShading: true });
  P.M.socket = new T.MeshBasicMaterial({ color: 0x2A2016 });
  P.M.chalk = P.M.chalk || new T.MeshBasicMaterial({ color: 0xFFF6DA, transparent: true, opacity: 0.95, depthWrite: false });
  P.M.redc = P.M.redc || new T.MeshBasicMaterial({ color: 0xD8432E, transparent: true, opacity: 0.95, depthWrite: false });
  P.M.coal = new T.MeshBasicMaterial({ color: 0x1A1612, transparent: true, opacity: 0.9, depthWrite: false });
  P.M.shadowB = new T.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.32, depthWrite: false });
  P.M.cut = new T.MeshBasicMaterial({ color: 0x2A1C10, transparent: true, opacity: 0.55, depthWrite: false, side: T.DoubleSide });
  P.M.ash = P.M.ash || (X.stages.ashlar && X.stages.ashlar.material) || P.M.stone;
  // (the stages' ashlar material is white: its colour is per instance; here the stone's own, the Herodian limestone of the walls)
  P.M.ash4 = new T.MeshStandardMaterial({ color: '#D8C9A6', roughness: 0.88, flatShading: true });
  P.M.ash4D = new T.MeshStandardMaterial({ color: '#C7B48E', roughness: 0.9, flatShading: true });
  P.M.dress = new T.MeshStandardMaterial({ color: '#E2D5B6', roughness: 0.75, flatShading: true });
  return P.M;
}
/** a box from x0..x1, y0..y1, z0..z1 (amot, world) */
export function box(X, mat, x0, y0, z0, x1, y1, z1, parent) {
  const m = new X.THREE.Mesh(X.props.geo.box, mat); m.scale.set(Math.abs(x1 - x0), Math.abs(y1 - y0), Math.abs(z1 - z0)); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = true; m.receiveShadow = true; (parent || X.props.root).add(m); return m;
}

/* ───────── a gate's frame: where its parts stand ───────── */
/** the frame of gate G (one of GATES or SOUTH): its centre, its outer face, the inward sign, the pivots' line, the sill's top */
export function frameOf(G) {
  const zf = G.zf, s = G.s, zi = zf + s * H113.DEPTH;
  return { c: G.c, zf, s, zi, zp: zf + s * (H113.DEPTH / 2 + 0.25), sill: H113.SILL, x0: G.c - H113.OPEN_W / 2, x1: G.c + H113.OPEN_W / 2,
    zmin: Math.min(zf, zi), zmax: Math.max(zf, zi), out: (k) => zf - s * k, in: (k) => zf + s * k };
}
/** a pivot's x on the sill for side ±1 (the socket's nominal place, plus its error toward the middle) */
export const pivotX = (G, side, ex = 0) => G.c + side * (H113.OPEN_W / 2 - H113.TEFACH) - side * ex;
/** the yaw that opens a leaf of side ±1 by φ (rad) inward: the free edge swings to the inside */
export const leafYaw = (side, s, phi) => side * s * phi;

/* ───────── a leaf: its planks, battens, pins, rings; the pivot at the group's origin, the body toward the middle along +x ───────── */
/**
 * o: { side (±1: where its pivot is), s (inward), planks [w...], gold, rings (n), pish (a wicket: its hole and small door), plain (no
 * planks drawn: one board), body: the width, ghost }. Local: x from the pivot toward the middle (mirrored for side +1), y up from the sill,
 * z: + is the back (the inside)
 */
export function makeLeaf(X, o = {}) {
  const T = X.THREE, M = mats(X), g = new T.Group(), side = o.side || -1, s = o.s || 1;
  const inner = new T.Group(); g.add(inner);
  // (mirrored for the right leaf: its body runs to −x; the back still to the inside)
  inner.scale.set(side < 0 ? 1 : -1, 1, s);
  const W = (o.width || H113.OPEN_W / 2 - H113.TEFACH) + 0.2, y0 = H113.PIN_B - 0.12, H = H113.LEAF_H, t = H113.LEAF_T;
  const wood = o.gold ? M.goldL : M.cedar, woodL = o.gold ? M.goldL : M.cedarL, woodD = o.gold ? M.goldL : M.cedarD;
  const parts = { planks: [], battens: [], rings: [], pinB: null, pinT: null, door: null, hole: null };
  // the pivot post (עמוד הציר): a thick cedar post at the pivot
  parts.post = box(X, woodD, -0.22, y0, -t * 0.62, 0.22, y0 + H, t * 0.62, inner);
  const ws = o.planks && o.planks.length ? o.planks : [W - 0.22];
  const sum = ws.reduce((a, w) => a + w, 0), k = (W - 0.22) / sum;
  let x = 0.22;
  ws.forEach((w, i) => {
    const pw = w * k, hole = o.pish && i === 0;
    if (hole) {
      // the wicket's plank: the hole (one amah wide) cut low, at the pivot side (spec 3, level 3)
      const hx0 = x + Math.min(PISH.x0, pw - PISH.w - 0.05), hx1 = hx0 + PISH.w, hy1 = y0 + PISH.x0 + PISH.h;
      parts.planks.push(box(X, i % 2 ? wood : woodL, x, y0, -t / 2, hx0, y0 + H, t / 2, inner));
      parts.planks.push(box(X, i % 2 ? wood : woodL, hx1, y0, -t / 2, x + pw, y0 + H, t / 2, inner));
      parts.planks.push(box(X, i % 2 ? wood : woodL, hx0, y0, -t / 2, hx1, y0 + PISH.x0, t / 2, inner));
      parts.planks.push(box(X, i % 2 ? wood : woodL, hx0, hy1, -t / 2, hx1, y0 + H, t / 2, inner));
      parts.hole = { x0: hx0, x1: hx1, y0: y0 + PISH.x0, y1: hy1 };
      if (o.pishDoor !== false) {
        const d = new T.Group(); d.position.set(hx0 + 0.04, y0 + PISH.x0, 0); inner.add(d);
        box(X, M.cedarD, 0, 0.02, -t * 0.3, PISH.w * 0.5 - 0.06, PISH.h - 0.02, t * 0.3, d); box(X, M.cedar, PISH.w * 0.5 - 0.04, 0.02, -t * 0.3, PISH.w - 0.1, PISH.h - 0.02, t * 0.3, d);
        parts.door = d;
      }
    } else parts.planks.push(box(X, i % 2 ? wood : woodL, x, y0, -t / 2, x + pw - 0.015, y0 + H, t / 2, inner));
    x += pw;
  });
  // the battens on its back (the inside) and the pegs' heads
  if (o.battens !== false) for (const by of [0.18, 0.55, 0.88]) { const b = box(X, woodD, 0.25, y0 + H * by - 0.3, t / 2, W - 0.1, y0 + H * by + 0.3, t / 2 + 0.22, inner); parts.battens.push(b); }
  // the pins (bronze): the lower 0.16 under it, the upper 0.4 over it
  const pin = (yA, yB, r) => { const m = new T.Mesh(new T.CylinderGeometry(r, r, Math.abs(yB - yA), 10), M.bronze); m.position.set(0, (yA + yB) / 2, 0); m.castShadow = true; inner.add(m); return m; };
  parts.pinB = pin(y0 - H113.PIN_B, y0, 0.09); parts.pinT = pin(y0 + H, y0 + H + H113.PIN, 0.09);
  // the rings (iron) on its back at the bar's height, toward its free edge
  const nR = o.rings || 0, barY = 7.2;
  for (let i = 0; i < nR; i++) {
    const r = new T.Mesh(new T.TorusGeometry(0.28, 0.06, 6, 14), M.iron); r.position.set(W - 0.7 - i * 1.6, barY, t / 2 + 0.36); inner.add(r); parts.rings.push(r);
  }
  g.userData = { parts, inner, side, s, W, y0, H };
  X.props.root.add(g);
  return g;
}
export function goldLeaf(X, g, on) {
  const M = mats(X), P = g.userData.parts;
  for (const m of [...P.planks, ...P.battens, P.post]) if (m && m.material !== M.lead) m.material = on ? M.goldL : (m.material === M.goldL ? M.cedar : m.material);
}

/* ───────── the treadwheel derrick (two at the lintel; one holds a leaf): a wheel at the foot, a tall mast, a jib to the load ───────── */
export function makeDerrick(X, o = {}) {
  const T = X.THREE, P = X.props, M = mats(X), g = new T.Group(); g.name = 'h113-derrick';
  const beam = (a, b, r = 0.2, mat = P.M.wood) => { const v = new T.Vector3().subVectors(b, a), L = v.length(); const m = new T.Mesh(new T.CylinderGeometry(r, r * 1.1, L, 6), mat); m.position.copy(a).addScaledVector(v, 0.5); m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), v.normalize()); m.castShadow = true; return m; };
  const wheel = new T.Group(), R = 3.2, Wd = 1.8;
  for (const s2 of [-1, 1]) { const rim = new T.Mesh(new T.TorusGeometry(R, 0.12, 6, 36), P.M.wood); rim.rotation.y = Math.PI / 2; rim.position.x = (s2 * Wd) / 2; wheel.add(rim); for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; wheel.add(beam(new T.Vector3((s2 * Wd) / 2, 0, 0), new T.Vector3((s2 * Wd) / 2, Math.sin(a) * R, Math.cos(a) * R), 0.07, P.M.woodD)); } }
  for (let k = 0; k < 22; k++) { const a = (k / 22) * TAU; const t = new T.Mesh(new T.BoxGeometry(Wd, 0.1, 0.34), P.M.woodD); t.position.set(0, Math.sin(a) * R, Math.cos(a) * R); t.rotation.x = -a; wheel.add(t); }
  wheel.add(beam(new T.Vector3(-Wd / 2 - 0.5, 0, 0), new T.Vector3(Wd / 2 + 0.5, 0, 0), 0.15, P.M.woodD));
  wheel.position.set(0, R + 0.2, 0); g.add(wheel);
  for (const s2 of [-1, 1]) { g.add(beam(new T.Vector3(s2 * 1.5, 0, -1.7), new T.Vector3(s2 * 1.2, R + 0.2, 0))); g.add(beam(new T.Vector3(s2 * 1.5, 0, 1.7), new T.Vector3(s2 * 1.2, R + 0.2, 0))); }
  const mastH = o.h || 33;
  // the mast (two poles leaning together, stayed) beside the wheel
  const mx = 2.6;
  g.add(beam(new T.Vector3(mx - 0.8, 0, -0.9), new T.Vector3(mx, mastH, 0), 0.26)); g.add(beam(new T.Vector3(mx + 0.8, 0, 0.9), new T.Vector3(mx, mastH, 0), 0.26));
  for (let k = 1; k <= 6; k++) { const y = (mastH * k) / 7; g.add(beam(new T.Vector3(mx - 0.8 * (1 - y / mastH), y, -0.9 * (1 - y / mastH)), new T.Vector3(mx + 0.8 * (1 - y / mastH), y, 0.9 * (1 - y / mastH)), 0.08)); }
  const jib = new T.Group(); jib.position.set(mx, mastH - 2.5, 0); g.add(jib);
  const arm = beam(new T.Vector3(0, 0, 0), new T.Vector3(0, 3, 1), 0.2); jib.add(arm);
  X.props.root.add(g);
  const D = { g, wheel, jib, arm, mastH, mx, rope: P.rope(12, 0.06), tip: new T.Vector3(), base: { x: 0, z: 0, yaw: 0 }, beam };
  D.place = (x, z, yaw = 0) => { g.position.set(x, X.ground(x, z), z); g.rotation.y = yaw; D.base = { x, z, yaw }; g.visible = true; };
  /** the jib's tip over a world point (x, z), at height y (world) */
  D.aim = (x, y, z) => {
    g.updateMatrixWorld(true);
    const p = jib.getWorldPosition(new T.Vector3()); const dx = x - p.x, dz = z - p.z, dy = y - p.y;
    const L = Math.hypot(dx, dy, dz) || 1; const local = new T.Vector3(dx, dy, dz).applyQuaternion(g.quaternion.clone().invert());
    jib.remove(D.arm); D.arm.geometry.dispose(); D.arm = beam(new T.Vector3(0, 0, 0), local, 0.2); jib.add(D.arm);
    D.tip.set(x, y, z); void L;
  };
  D.ropeTo = (a) => { D.rope.show(true); D.rope.set({ x: D.tip.x, y: D.tip.y, z: D.tip.z }, a, 0); };
  D.spin = (d) => { wheel.rotation.x += d; };
  D.hide = () => { g.visible = false; D.rope.show(false); for (const w of D.men || []) SH4.crew.remove(w); D.men = []; };
  D.men = [];
  /** two treaders in the wheel (spec 2: "בכל גלגל שני פועלים דורכים") */
  D.crewIn = (crew = 1) => {
    for (const w of D.men) SH4.crew.remove(w); D.men = [];
    const c = Math.cos(D.base.yaw), sN = Math.sin(D.base.yaw);
    for (const k of [-0.45, 0.45]) { const lx = k, wx = D.base.x + lx * c, wz = D.base.z - lx * sN; const w = SH4.crew.add(wx, wz, { role: 'push', fx: wx + sN, fz: wz + c, crew }); if (w) { w.a.y = X.ground(wx, wz) + 0.35; D.men.push(w); } }
  };
  D.rope.show(false); g.visible = false;
  return D;
}

/* ───────── the kohen's gates as the save has them ───────── */
function gateClear(lv) { const R = SH4.gates[lv]; if (!R) return; for (const o of R.all) SH4.X.props.remove(o); SH4.gates[lv] = null; }
function gateKey(lv, st) { return JSON.stringify([st.form[lv] || 0, st.sock[lv] || 0, st.lintel[lv] || 0, st.leaf[lv] || 0, st.hang[lv] || 0, st.lock[lv] || 0, st.gold[lv] || 0, SH4.final]); }
/** the formwork of stage 02 in an opening (the kohen's timber frame): two posts, a head, braces */
function formwork(X, G, all) {
  const F = frameOf(G), M = mats(X), z0 = F.zf + F.s * 0.6, z1 = F.zf + F.s * 1.6;
  for (const x of [F.x0 + 0.3, F.x1 - 0.3, G.c]) all.push(box(X, M.cedarD, x - 0.3, 6, Math.min(z0, z1), x + 0.3, 25.6, Math.max(z0, z1)));
  all.push(box(X, M.cedarD, F.x0 + 0.1, 25.4, Math.min(z0, z1), F.x1 - 0.1, 26, Math.max(z0, z1)));
  for (const y of [11, 16, 21]) all.push(box(X, M.cedar, F.x0 + 0.1, y - 0.2, Math.min(z0, z1), F.x1 - 0.1, y + 0.2, Math.max(z0, z1)));
}
/** the sill (the threshold stone) and its sockets as drilled; the lintel's sockets on its underside (drawn when it lies) */
export function sillMesh(X, G, all, sockets = []) {
  const F = frameOf(G), M = mats(X);
  const m = box(X, M.ash4, F.x0 - 0.15, 5.7, F.zmin, F.x1 + 0.15, F.sill, F.zmax); all.push(m);
  for (const k of sockets) {
    const T = X.THREE, d = new T.Mesh(new T.CircleGeometry(k.r || 0.1, 14), mats(X).socket); d.rotation.x = -Math.PI / 2;
    d.position.set(k.x, F.sill + 0.012, k.z != null ? k.z : F.zp); X.props.root.add(d); all.push(d);
    if (k.lead) { const l = new T.Mesh(new T.CircleGeometry((k.r || 0.1) * 0.9, 14), M.lead); l.rotation.x = -Math.PI / 2; l.position.set(k.x, F.sill + 0.016, k.z != null ? k.z : F.zp); X.props.root.add(l); all.push(l); }
  }
  return m;
}
export function jambs(X, G, all) {
  const F = frameOf(G), M = mats(X);
  // each pier laid in courses of dressed ashlars (drafted margins, a flat boss: the stages' own stone), headers and stretchers alternating
  const T = X.THREE, geo = (X.stages.ashlar && X.stages.ashlar.geometry) || X.props.geo.box, CH = 2.5, n = Math.round((H113.TOP - 6) / CH);
  for (const sd of [-1, 1]) {
    const xa = G.c + sd * H113.OPEN_W / 2, xb = xa + sd * H113.JAMB_W, x0 = Math.min(xa, xb), x1 = Math.max(xa, xb);
    for (let k = 0; k < n; k++) {
      const y0 = 6 + k * CH, split = k % 2 ? [[F.zmin, F.zmax]] : [[F.zmin, (F.zmin + F.zmax) / 2], [(F.zmin + F.zmax) / 2, F.zmax]];
      for (const [z0, z1] of split) {
        const m = new T.Mesh(geo, k === 0 ? M.ash4D : (k + (sd > 0 ? 1 : 0)) % 3 ? M.ash4 : M.dress);
        m.scale.set(x1 - x0 - 0.04, CH - 0.04, z1 - z0 - 0.04); m.position.set((x0 + x1) / 2, y0 + CH / 2, (z0 + z1) / 2);
        m.castShadow = true; m.receiveShadow = true; X.props.root.add(m); all.push(m);
      }
    }
  }
}
/** the lintel: in place on the jambs (y0 26), or lying on its sledge in front (y0 its bed), or a given pose (an act's) */
export function lintelMesh(X, G, all, o = {}) {
  const T = X.THREE, M = mats(X), g = new T.Group(), L = H113.LINTEL_L, H = H113.LINTEL_H, D = H113.DEPTH;
  const body = new T.Mesh(X.stages.ashlar && X.stages.ashlar.geometry || X.props.geo.box, M.ash4); body.scale.set(L, H, D); body.position.y = H / 2; body.castShadow = true; body.receiveShadow = true; g.add(body);
  // its drafted face (a band) on the outer side
  const band = new T.Mesh(X.props.geo.box, M.dress); band.scale.set(L - 0.6, H - 0.6, 0.06); band.position.set(0, H / 2, -D / 2 - 0.02); g.add(band);
  g.userData = { body, socks: [] };
  X.props.root.add(g); if (all) all.push(g);
  return g;
}
/** the sledge under the lintel (in front of the opening, on the Chel) */
function sledge(X, x, z, all, L = 15) { const M = mats(X); all.push(box(X, M.cedarD, x - L / 2, 6, z - 1.8, x + L / 2, 6.35, z - 1.4)); all.push(box(X, M.cedarD, x - L / 2, 6, z + 1.4, x + L / 2, 6.35, z + 1.8)); for (const dx of [-5, 0, 5]) all.push(box(X, M.cedar, x + dx - 0.3, 6.35, z - 1.9, x + dx + 0.3, 6.7, z + 1.9)); }
export const LINTEL_BED = (G) => ({ x: G.c, z: frameOf(G).out(3.6), y: 6.7 });

/** a gate's leaves as hung: their pose (open angle φ, 0 closed), their errors (low, lean) */
export function hungLeaf(X, G, side, o = {}) {
  const F = frameOf(G), g = makeLeaf(X, { side, s: F.s, planks: o.planks, gold: o.gold, rings: o.rings, pish: o.pish });
  const low = (o.low || 0) * H113.FINGER;
  g.position.set(pivotX(G, side, o.ex || 0), F.sill + 0.035 - low, F.zp);
  g.rotation.y = leafYaw(side, F.s, o.phi != null ? o.phi : 1.35);
  if (o.lean) g.userData.inner.rotation.z = -side * o.lean * H113.FINGER / H113.LEAF_H;
  return g;
}
/** the bar across the closed leaves (in its rings) and the lock box on the right leaf (spec 5) */
export function barMesh(X, G, all, o = {}) {
  const F = frameOf(G), M = mats(X), T = X.THREE, g = new T.Group();
  const z = F.zp + F.s * (H113.LEAF_T / 2 + 0.36), y = F.sill + 0.035 + 7.2 - H113.PIN_B + 0.12 - 0.12;
  const bar = new T.Mesh(X.props.geo.box, M.cedarD); bar.scale.set(H113.BAR_L, 0.36, 0.3); bar.castShadow = true; g.add(bar);
  g.position.set((o.x != null ? o.x : G.c), y, z); X.props.root.add(g); if (all) all.push(g);
  g.userData = { bar, y, z };
  return g;
}
export function lockBox(X, G, all) {
  const F = frameOf(G), M = mats(X), z = F.zp + F.s * (H113.LEAF_T / 2 + 0.36), y = F.sill + 0.035 + 7.2 - H113.PIN_B;
  const g = new X.THREE.Group(); g.position.set(G.c + 1.6, y, z); X.props.root.add(g); if (all) all.push(g);
  box(X, M.cedar, -0.9, 0.2, -0.3 * F.s, 0.9, 1.5, 0.32 * F.s, g);
  g.userData = { y, z };
  return g;
}

export function gateBuild(X, lv, skip = {}) {
  gateClear(lv);
  const st = X.M.st, G = GATES[lv], F = frameOf(G), all = [], out = { all, leaves: [], lintel: null, sill: null, bar: null };
  if (SH4.final && G.house) { SH4.gates[lv] = out; SH4.keys[lv] = gateKey(lv, st); return out; }   // (the site's own gatehouse and doors)
  if (!st.form[lv] && !skip.form) { formwork(X, G, all); }
  // the sill and its sockets as drilled
  const S = st.sock[lv], socks = [];
  if (S && S.list) for (const k of S.list) {
    if (k.id === 'L' || k.id === 'R' || k.id === 'M') { const side = k.id === 'R' || k.id === 'M' ? 1 : -1; socks.push({ x: pivotX(G, side, k.ex || 0), z: F.zp + F.s * (k.shift || 0), lead: k.deep }); }
  }
  if (lv === 1 && S && S.done) { /* the crews' lintel sockets: on its underside */ }
  if (!skip.sill) out.sill = sillMesh(X, G, all, skip.socks ? [] : socks);
  jambs(X, G, all);
  // the soffit behind the lintel inside the gatehouse (the site's holes reach the lintel's top)
  const Ld = st.lintel[lv] && st.lintel[lv].done;
  if (G.house && Ld) all.push(box(X, mats(X).ash4, F.x0, H113.TOP, F.zi, F.x1, H113.TOP + H113.LINTEL_H, -64));
  if (!skip.lintel) {
    const g = lintelMesh(X, G, all);
    if (Ld) { g.position.set(G.c, H113.TOP, (F.zf + F.zi) / 2); g.rotation.z = (st.lintel[lv].tilt || 0) * Math.PI / 180 * 0.15; }
    else { const b = LINTEL_BED(G); sledge(X, b.x, b.z, all); g.position.set(b.x, b.y, b.z); }
    out.lintel = g;
  }
  // the leaves: leaning at the opening (made, not hung), hung (open), closed and barred (locked); gold after the goldsmiths
  const Lf = st.leaf[lv], Hg = st.hang[lv], Lk = st.lock[lv], gold = !!st.gold[lv], I = inherit(st, lv), rings = lv === 1 ? 1 : 2;
  const mine = { side: -1, planks: Lf && Lf.planks, gold, rings, pish: lv === 3, low: I.low, lean: I.lean };
  if (Hg && Hg.done && !skip.leaves) {
    const phi = Lk && Lk.done ? 0 : 1.35;
    out.leaves.push(hungLeaf(X, G, -1, { ...mine, phi }));
    out.leaves.push(hungLeaf(X, G, 1, { gold, rings, phi }));
    if (Lk && Lk.done) { out.bar = barMesh(X, G, all); lockBox(X, G, all); }
  } else if (Lf && Lf.done && !skip.leaves) {
    // the kohen's leaf leaning by the opening on the derrick's rope; at level 2–3 the crews' leaf already on its pins
    out.leaves.push(leanLeaf(X, G, mine));
    if (lv >= 2) out.leaves.push(hungLeaf(X, G, 1, { gold: false, rings, phi: 1.35 }));
  }
  for (const l of out.leaves) all.push(l);
  SH4.gates[lv] = out; SH4.keys[lv] = gateKey(lv, st);
  return out;
}
/** the leaf standing on the sill near its pivot, leaning back on the rope, before it is hung (spec 4: "הכנף עומדת על קצה הפתח") */
export function leanLeaf(X, G, o = {}) {
  const F = frameOf(G), g = makeLeaf(X, { side: -1, s: F.s, planks: o.planks, gold: false, rings: o.rings, pish: o.pish });
  g.position.set(pivotX(G, -1) + 0.6, F.sill + 0.02, F.zp + F.s * 1.2); g.rotation.y = leafYaw(-1, F.s, 0.25);
  return g;
}

/* ───────── the carpenters' yard: three sawhorses, the cedar boards leaning on the wall, a basket of pegs ───────── */
export function sawhorse(X, x, z, all, top = YARD.top) {
  const M = mats(X), g = new X.THREE.Group(); g.position.set(x, 6, z); X.props.root.add(g); all.push(g);
  box(X, M.cedarD, -0.25, top - 6 - 0.35, -3.4, 0.25, top - 6, 3.4, g);
  for (const sz of [-2.8, 2.8]) for (const sx of [-0.55, 0.55]) { const l = box(X, M.cedarD, -0.09, 0, -0.09, 0.09, top - 6 - 0.2, 0.09, g); l.position.set(sx, (top - 6 - 0.2) / 2, sz); l.rotation.z = -sx * 0.35; }
  return g;
}
function yardBuild(X) {
  if (SH4.yard) for (const o of SH4.yard.all) X.props.remove(o);
  const all = []; SH4.yard = { all };
  if (SH4.final) return;
  for (const x of [YARD.x0 + 3, (YARD.x0 + YARD.x1) / 2, YARD.x1 - 3]) sawhorse(X, x, YARD.z, all);
  // (the rack's boards when no act holds it: cedar leaning on the wall, waiting)
  if (!(SH4.busy && SH4.X.mission && SH4.X.mission.k === 'leaf')) {
    const M = mats(X); let x = YARD.rack[0];
    for (const w of [2, 1.5, 3, 1, 2.5, 2]) { const b = box(X, w % 1 ? M.cedarL : M.cedar, x, 6, YARD.wall - 0.9, x + w - 0.08, 6 + 19.6, YARD.wall - 0.55); b.rotation.x = -0.06; all.push(b); x += w + 0.25; if (x > YARD.rack[1]) break; }
  }
}

/* ───────── the crews' south gates (spec: "שלושת שערי הדרום עולים בידי הצוותים") ───────── */
/** a south gate's state while mission n is open: 0 the opening, 1 the frame and lintel, 2 the leaves hung, 3 locked and gilded */
export function southStage(i, M) {
  const st = M.st, lv = i + 1;
  if (st.lock[lv] && st.lock[lv].done) return 3;
  if (st.hang[lv] && st.hang[lv].done) return 2;
  if (st.lintel[lv] && st.lintel[lv].done) return 1;
  return 0;
}
function southBuild(X, i, k) {
  const R = SH4.south[i]; if (R) for (const o of R.all) X.props.remove(o);
  const G = SOUTH[i], all = [];
  if (!SH4.final && k >= 1) {
    sillMesh(X, G, all, []); jambs(X, G, all);
    const F = frameOf(G), g = lintelMesh(X, G, all); g.position.set(G.c, H113.TOP, (F.zf + F.zi) / 2); g.rotation.y = Math.PI;
    if (k >= 2) for (const side of [-1, 1]) all.push(hungLeaf(X, G, side, { gold: k >= 3, rings: 2, phi: k >= 3 ? 0 : 1.3 }));
  }
  SH4.south[i] = { all, k };
}

/* ───────── the openings: the courts' wall opened again; the crews' gatehouses keep the kohen's frames clear ───────── */
export function holeRects() {
  const w = [], g = [];
  for (const lv of [1, 2, 3]) { const G = GATES[lv]; w.push([G.c - 5, -73.6, G.c + 5, -67.4]); }
  for (const G of SOUTH) w.push([G.c - 5, 67.4, G.c + 5, 73.6]);
  for (const lv of [1, 2]) { const G = GATES[lv]; g.push([G.c - 5, -79, G.c + 5, -63]); g.push([G.c - 7.2, -79.2, G.c + 7.2, -75.3]); }
  for (const G of SOUTH) g.push([G.c - 5, 63, G.c + 5, 79]);
  return { wall: w, gates: g };
}
let opened = false;
function holesSync(X) {
  if (SH4.final) return;
  const H = holeRects();
  try { if (!opened && X.stages.siteOpen) opened = X.stages.siteOpen('wall', true); } catch (e) { /* */ }
  try { if (X.stages.wallHoles) X.stages.wallHoles(H.wall); } catch (e) { /* */ }
  try { if (X.stages.siteHoles) X.stages.siteHoles('gates', H.gates, 5.9, H113.TOP + H113.LINTEL_H + 0.1); } catch (e) { /* */ }
}
/** the floor in the gates' passages while they are open (the gatehouses rise round them; stages.floorHook) */
export function passFloor(x, z) {
  if (SH4.final) return null;
  for (const lv of [1, 2, 3]) { const G = GATES[lv]; if (x > G.c - 5 && x < G.c + 5 && z > G.zf - 0.2 && z < -67.5) return 6; }
  for (const G of SOUTH) if (x > G.c - 5 && x < G.c + 5 && z > 67.5 && z < 78.2) return 6;
  return null;
}

/* ───────── the crews at real work round the stage (rules 4–5: no one stands without work) ───────── */
function ambKey(st) { return JSON.stringify([st.lock, st.hang, st.lintel, st.leaf, st.gold, SH4.final, SH4.busy ? (SH4.X.mission && SH4.X.mission.k) : 0]); }
function ambient(X) {
  for (const w of SH4.amb) SH4.crew.remove(w); SH4.amb = [];
  if (SH4.final) return;
  const st = X.M.st, add = (x, z, o) => { const w = SH4.crew.add(x, z, o); if (w) SH4.amb.push(w); return w; };
  const busyYard = SH4.busy && X.mission && X.mission.k === 'leaf';
  // the carpenters' yard: two sawyers at the far sawhorse, one drilling pegs (spec: "הצוות מנסר ומקדח כל הזמן")
  if (!busyYard) { add(YARD.x0 + 4, YARD.z - 2.6, { role: 'pull', item: 'saw', fx: YARD.x0 + 4, fz: YARD.z, crew: 2 }); add(YARD.x0 + 9, YARD.z - 2.6, { role: 'hammer', item: 'mallet', fx: YARD.x0 + 9, fz: YARD.z, crew: 2 }); }
  // the south crews: masons at the rising frame, carpenters at the leaves, goldsmiths on the finished one
  SOUTH.forEach((G, i) => {
    const k = southStage(i, X.M), F = frameOf(G);
    if (k === 0) { add(G.c - 6.5, F.out(2.2), { role: 'hammer', item: 'chisel', fx: G.c - 6, fz: F.zf, crew: 1 }); add(G.c + 6.5, F.out(2.2), { role: 'pick', fx: G.c + 6, fz: F.zf, crew: 1 }); }
    else if (k === 1) { add(G.c - 3, F.out(2), { role: 'lever', fx: G.c, fz: F.zf, crew: 0 }); add(G.c + 3, F.out(2), { role: 'hammer', item: 'mallet', fx: G.c + 4, fz: F.zf, crew: 0 }); }
    else if (k === 2) { add(G.c - 2, F.out(1.8), { role: 'hammer', item: 'mallet', fx: G.c - 2, fz: F.zf, crew: 2 }); }
    else { const w = add(G.c + 2.5, F.out(2), { role: 'hold', item: 'staff', fx: G.c, fz: F.zf + F.s, crew: 3 }); void w; }
  });
  // a Levite at each of the kohen's gates once locked (spec: "לוי אחד ניצב ליד כל שער גמור"); the goldsmiths at the gilding
  for (const lv of [1, 2, 3]) {
    const G = GATES[lv], F = frameOf(G);
    if (st.lock[lv] && st.lock[lv].done && !(SH4.busy && X.mission && X.mission.lv === lv)) {
      add(G.c + 7.8, F.out(1.6), { role: 'hold', item: 'staff', fx: G.c, fz: F.zf, crew: 3, tunic: '#E8E0CC' });
      if (!st.gold[lv]) add(G.c - 2.2, F.in(3.6), { role: 'hammer', item: 'mallet', fx: G.c - 2.2, fz: F.zf, crew: 3, tunic: '#C9A64A' });
    }
  }
}

/* ───────── the act's labels (DOM chips that follow a world point), the goal chip ───────── */
export function label(X) {
  css();
  const el = document.createElement('div'); el.className = 'h109-ui h113-lab'; document.body.appendChild(el);
  const L = { el, at: null, set(text, at, hot) { el.textContent = text; L.at = at; el.style.display = text ? '' : 'none'; el.classList.toggle('hot', !!hot); }, frame() { if (!L.at) return; const q = X.scr(L.at.x, L.at.y, L.at.z); el.style.left = q.x + 'px'; el.style.top = q.y + 'px'; el.style.opacity = q.on ? '1' : '0'; }, remove() { el.remove(); const i = SH4.labels.indexOf(L); if (i >= 0) SH4.labels.splice(i, 1); } };
  SH4.labels.push(L); return L;
}
let cssOn = false;
function css() {
  if (cssOn) return; cssOn = true;
  const st = document.createElement('style');
  st.textContent = `.h113-lab{transform:translate(-50%,-50%);font:900 16px/1 Heebo,system-ui;color:#3A2608;background:rgba(255,246,222,.94);border:2px solid #C8A04A;border-radius:12px;padding:3px 8px;white-space:nowrap;box-shadow:0 2px 6px rgba(0,0,0,.25);direction:rtl}
.h113-lab.hot{background:#FFE7A0;border-color:#E09A2A}
.h113-goal{display:flex;align-items:center;gap:6px;padding:4px 12px 4px 10px;border-radius:18px;background:rgba(255,248,228,.92);color:#5A3A0A;font:900 16px/1 Heebo,system-ui;box-shadow:0 2px 6px rgba(0,0,0,.18);pointer-events:none;direction:rtl;white-space:nowrap}
.h113-goal small{font:700 11px/1 Heebo,system-ui;color:#8A6A3A}
.h113-cut{position:fixed;z-index:58;pointer-events:none;border:3px solid #C8A04A;border-radius:14px;background:rgba(40,26,12,.9);box-shadow:0 4px 14px rgba(0,0,0,.4);direction:ltr}
.h113-cut canvas{display:block;border-radius:11px}
.h113-cut b{position:absolute;top:-24px;right:6px;font:900 14px/1 Heebo,system-ui;color:#FFF6DA;text-shadow:0 1px 3px #000;direction:rtl}`;
  document.head.appendChild(st);
}
function goalChip(X) {
  css();
  if (!SH4.chip) { SH4.chip = document.createElement('div'); SH4.chip.className = 'h113-goal'; SH4.chip.innerHTML = '<span>🚪</span><b>0/6</b><small>שערים</small>'; }
  const top = document.querySelector('.gm-top'); if (!top) return;
  const after = top.querySelector('.h109-chip') || top.querySelector('.gm-sc'); const host = (after && after.parentNode) || top;
  if (SH4.chip.parentNode !== host) { if (after && after.nextSibling) host.insertBefore(SH4.chip, after.nextSibling); else host.appendChild(SH4.chip); }
  const n = X.M ? X.M.gatesDone() : 0, b = SH4.chip.querySelector('b'), t = `${n}/6`; if (b.textContent !== t) b.textContent = t;
}
export function disposeChip() { try { if (SH4.chip) SH4.chip.remove(); } catch (e) { /* */ } }

/* ───────── the camera: an act's shots come in close (OrbitControls' 35 amot give way while it holds the site) ───────── */
export function keep(X, rects) {
  try { if (X.view && X.view.closeCam) X.view.closeCam(!!(rects && rects.length), 'h113-act'); } catch (e) { /* */ }
  try { if (X.stages.keepOut) X.stages.keepOut(rects || []); } catch (e) { /* */ }
  try { if (X.stages.craneOff) X.stages.craneOff(!!(rects && rects.length)); } catch (e) { /* */ }
}
/** the box round a gate's work: its front on the Chel and its passage (the crews keep out: rule 19) */
export function gateKeep(G, far = 14) { const F = frameOf(G); return [G.c - 14, Math.min(F.out(far), F.in(12)), G.c + 14, Math.max(F.out(far), F.in(12))]; }

/* ───────── the world as the save has it ───────── */
export function initWorld(X) {
  css(); mats(X);
  SH4.X = X; SH4.B = createBeat(X); SH4.crew = createGang(X);
  SH4.dk = [makeDerrick(X), makeDerrick(X)];
  opened = false;
  if (X.M.finished()) SH4.final = 1;
  for (const lv of [1, 2, 3]) gateBuild(X, lv);
  southSync(X);
  yardBuild(X);
  holesSync(X);
  try { if (X.stages.floorHook) X.stages.floorHook(passFloor); } catch (e) { /* */ }
  ambient(X);
}
function southSync(X) { SOUTH.forEach((G, i) => { const k = southStage(i, X.M); if (!SH4.south[i] || SH4.south[i].k !== k || SH4.final) southBuild(X, i, k); }); }
/** the stage done: the gatehouses' own doors (the site's) take over; Beit HaMoked's gate stays, closed and gilded, until its house */
export function finalWorld(X) {
  if (!SH4.X) return;
  SH4.final = 1;
  for (const lv of [1, 2, 3]) { X.M.st.gold[lv] = 1; gateBuild(X, lv); }
  SOUTH.forEach((G, i) => southBuild(X, i, 3));
  yardBuild(X);
  for (const D of SH4.dk) D.hide();
  ambient(X);
  try { X.stages.siteHoles('gates', [], -1, 1e4); } catch (e) { /* */ }
  try { X.stages.wallHoles([]); } catch (e) { /* */ }
  try { if (X.stages.siteOpen) X.stages.siteOpen('wall', false); } catch (e) { /* */ }
  opened = false;
}
function ensureWorld(X) {
  const st = X.M && X.M.st; if (!st) return;
  const cur = X.mission, acting = !!SH4.busy;
  for (const lv of [1, 2, 3]) { if (acting && cur && cur.lv === lv) continue; if (SH4.keys[lv] !== gateKey(lv, st)) gateBuild(X, lv); }
  southSync(X);
  const k = ambKey(st); if (k !== SH4.ambKey) { SH4.ambKey = k; ambient(X); yardBuild(X); }
  // Beit HaMoked's own house (the chambers' stage) built: its gate is the site's now
  if (SH4.final && SH4.gates[3] && SH4.gates[3].all.length) { const I = X.stages.siteInfo && X.stages.siteInfo('lishka'); if (I && I.status === 'done') gateClear(3); }
}
let jT = 0, beams = null;
/** the sites' light columns (stages.js "pins over available sites": an additive open cylinder per available site, its halo): a
 *  far-view sign; in an act's close shot the camera can stand inside one (gold arcs across the frame), so they wait while he works */
function beamsShow(X, on) {
  if (!beams) { beams = []; for (const o of X.scene.children) { if ((o.isInstancedMesh && o.renderOrder === 4 && o.geometry && o.geometry.type === 'CylinderGeometry') || (o.isPoints && o.renderOrder === 5)) beams.push(o); } }
  for (const o of beams) if (o.visible !== on) o.visible = on;
}
// (the kohen's gold foot ring, five amot wide: in an act's close shot a gold arc across the frame; it waits while he works, as the beams)
let ring = null, ringHid = false;
function ringShow(X, on) {
  if (!ring) for (const o of X.scene.children) if (o.isMesh && o.renderOrder === 2 && o.material && o.material.map && o.material.type === 'MeshBasicMaterial' && o.geometry && o.geometry.type === 'PlaneGeometry') { ring = o; break; }
  if (!ring) return;
  if (!on && ring.visible) { ring.visible = false; ringHid = true; } else if (on && ringHid) { ring.visible = true; ringHid = false; }
}
export function frameWorld(dt, X) {
  if (!SH4.B) return;
  try { beamsShow(X, !SH4.busy); ringShow(X, !SH4.busy); } catch (e) { /* */ }
  SH4.B.step(dt); if (SH4.crew) SH4.crew.update(dt, SH4.B);
  jT -= dt; if (jT <= 0) { jT = 0.5; holesSync(X); ensureWorld(X); goalChip(X); }
  for (const L of SH4.labels) L.frame();
}
export { clamp, socketAt, lockOf };
