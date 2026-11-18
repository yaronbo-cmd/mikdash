/* ── build 132 ── h132/fill3d.js — work 2's own things in the world (THE LEAD'S FILE): what fill.js draws and moves. Every material and
 * geometry is made once in the props' tables (painted when the view is made, kept by props.remove); nothing heavy runs per frame: the
 * fill's surface is rebuilt only while its heights move (a short ease after each load), the battens and gauges only when they change.
 *   fmats(X) · surfH(h, x, z) · standY(X, x, z, h) · fillTop(X, root) → { set(h), mesh } · zoneMarks(X, root) → { set(h), lit(zone) }
 *   gaugeSet(X, root) → { set(g, lv, bulged) } · layerLines(X, root) → { set(n), flash(n) , step(dt) } · rampMesh(X, root)
 *   sledMesh(X, kind, root) · stoneHeap(X, root) → { set(zone, on, bright, h) } · oxPair(X) → { set(x, z, yaw, walk), update(dt), clear() }
 *   FILL3D (the lane's hooks: while the act plays it owns the ramp and the block's top — world.js leaves them to it)
 * Units: amot; one unit of the fill's height = one amah (five layers fill the form's five amot, from the yesod's top up). (המחשה: all of it.)
 */
import { BOOK } from '../world/grid.js';
import { mats, addLane } from './world.js';
import { box } from '../h131/world.js';
import { FILL, ZONES, band } from './fill-model.js';
import { createAnimals } from '../../animals.js';

const S9 = BOOK.s09, B = S9.block, Y0 = S9.base, Y1 = S9.top, MID = S9.mid, ZC = S9.zone, R = S9.ramp;
/** the drawing's numbers: the surface's grid (cells a side), the battens' size, the gauge's housing and tongue (amot), a unit's tongue
 *  travel, the sled's size, the loads' sizes (המחשה) */
export const FD = Object.freeze({
  GRID: 24, BAT: [0.32, 0.14], GH: [2.6, 0.7, 0.9], TONGUE: [0.42, 0.34], PER_UNIT: 1.1, SLED: [2.4, 0.45, 3.4],
  LOAD: Object.freeze({ big: [1.25, 1.5], small: [0.8, 0.9], tub: [1.15, 0.75] }),
});

/* ───────── materials and shared geometry (the props' tables: painted when the view is made, never disposed by props.remove) ───────── */
export function fmats(X) {
  const PM = X.props.M, T = X.THREE; mats(X);
  if (PM.y9fWicker) return PM;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true, ...o });
  PM.y9fWicker = std('#C8A266', { roughness: 0.95 });                         // a basket of woven reeds
  PM.y9fStone = std('#CFC6B4', { roughness: 0.92 });                          // round field stones
  PM.y9fDry = std('#EEE7D6', { roughness: 0.98, emissive: '#2A2620' });       // dry bright stones: a weak pocket, seen
  PM.y9fTub = std('#6E4A2A', { roughness: 0.8 });                             // the tub's staves
  PM.y9fWet = std('#8E8574', { roughness: 0.28, metalness: 0.05 });           // the mix, glossy
  PM.y9fTop = new T.MeshStandardMaterial({ color: '#9E927E', roughness: 0.78, flatShading: false });   // the fill's surface (smooth)
  PM.y9fGreen = new T.MeshBasicMaterial({ color: '#56D364', transparent: true, opacity: 0.45, depthWrite: false });
  PM.y9fNotch = [std('#4CAF50', { emissive: '#1B5E20' }), std('#F2B233', { emissive: '#6B4A00' }), std('#D9483B', { emissive: '#5A120C' })];
  PM.y9fTip = [new T.MeshBasicMaterial({ color: '#7CE07F' }), new T.MeshBasicMaterial({ color: '#FFC43D' }), new T.MeshBasicMaterial({ color: '#FF4A3A' })];
  PM.y9fLine = std('#5A4630');
  PM.y9fFlash = new T.MeshBasicMaterial({ color: '#FFE7A0', transparent: true, opacity: 0, depthWrite: false });
  PM.y9fYoke = std('#7A5634', { roughness: 0.85 });
  const G = X.props.geo;
  G.y9fCyl = G.y9fCyl || new T.CylinderGeometry(1, 0.86, 1, 12, 1, true);
  G.y9fDisc = G.y9fDisc || new T.CircleGeometry(1, 12);
  G.y9fPeb = G.y9fPeb || new T.DodecahedronGeometry(1, 0);
  return PM;
}

/* ───────── the fill's surface: five heights (units) → a height anywhere on the block's floor ───────── */
const CX = [ZC.NW[0], ZC.NE[0]], CZ = [ZC.NE[1], ZC.SE[1]];
const sm = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
/** the height (units over the yesod's top) at (x, z): the corners bilinear between their zones' middles, the middle zone over its square
 *  fading out in a band of 2.5 amot round it */
export function surfH(h, x, z) {
  const u = sm((x - CX[0]) / (CX[1] - CX[0])), v = sm((z - CZ[0]) / (CZ[1] - CZ[0]));
  const n = h.NW + (h.NE - h.NW) * u, s = h.SW + (h.SE - h.SW) * u, q = n + (s - n) * v;
  const dx = Math.abs(x - MID[0]) - FILL.C_HALF, dz = Math.abs(z - MID[1]) - FILL.C_HALF, d = Math.max(dx, dz);
  const w = d <= 0 ? 1 : 1 - sm(d / 2.5);
  return q + (h.C - q) * w;
}
/** where a man stands (x, z): on the fill inside the form, on the ramp's slope over its footprint, else the world's ground */
export function standY(X, x, z, h) {
  if (h && x > B[0] + 0.2 && x < B[2] - 0.2 && z > B[1] + 0.2 && z < B[3] - 0.2) return Y0 + surfH(h, x, z);
  if (Math.abs(x - R.foot[0]) <= R.w / 2 + 0.3 && z > R.foot[1] && z < R.head[1]) return R.footY + ((z - R.foot[1]) / (R.head[1] - R.foot[1])) * (R.headY - R.footY) + 0.3;
  try { return X.ground(x, z); } catch (e) { return S9.floor; }
}

/** the fill's top: a grid over the block's floor, its heights set from the five zones (only when they change) */
export function fillTop(X, root) {
  const T = X.THREE, PM = fmats(X), n = FD.GRID, W = B[2] - B[0], D = B[3] - B[1];
  const g = new T.PlaneGeometry(W, D, n, n); g.rotateX(-Math.PI / 2); g.translate((B[0] + B[2]) / 2, 0, (B[1] + B[3]) / 2);
  const mesh = new T.Mesh(g, PM.y9fTop); mesh.receiveShadow = true; mesh.name = 'h132-fill-top'; root.add(mesh);
  const P = g.attributes.position;
  // (the floor under it, so a bare corner reads as the yesod's top and not a hole)
  const set = (h) => {
    for (let i = 0; i < P.count; i++) { const x = P.getX(i), z = P.getZ(i); P.setY(i, Y0 + 0.04 + Math.max(0, surfH(h, x, z))); }
    P.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere();
  };
  return { mesh, set };
}

/* ───────── the zones: wooden battens on the fill (the middle's square and the four lines out to the walls), the green under a sled ───────── */
export function zoneMarks(X, root) {
  const T = X.THREE, PM = fmats(X), H0 = FILL.C_HALF, [mx, mz] = MID, segs = [];
  const runs = [
    [[mx - H0, mz - H0], [mx + H0, mz - H0]], [[mx + H0, mz - H0], [mx + H0, mz + H0]], [[mx + H0, mz + H0], [mx - H0, mz + H0]], [[mx - H0, mz + H0], [mx - H0, mz - H0]],
    [[mx, B[1]], [mx, mz - H0]], [[mx, mz + H0], [mx, B[3]]], [[B[0], mz], [mx - H0, mz]], [[mx + H0, mz], [B[2], mz]],
  ];
  for (const [a, b] of runs) for (let k = 0; k < 3; k++) {
    const p = [a[0] + ((b[0] - a[0]) * (k + 0.5)) / 3, a[1] + ((b[1] - a[1]) * (k + 0.5)) / 3], L = Math.hypot(b[0] - a[0], b[1] - a[1]) / 3;
    const m = new T.Mesh(X.props.geo.box, PM.y9woodD); m.scale.set(a[0] === b[0] ? FD.BAT[0] : L, FD.BAT[1], a[0] === b[0] ? L : FD.BAT[0]); m.castShadow = false; m.receiveShadow = true; root.add(m); segs.push({ m, p });
  }
  // the green: the zone's own shape (the corners L-shaped round the middle's square), a little over the surface
  const greens = {};
  const shape = (pts) => { const s = new T.Shape(); pts.forEach(([x, z], i) => (i ? s.lineTo(x, -z) : s.moveTo(x, -z))); const g = new T.ShapeGeometry(s); g.rotateX(-Math.PI / 2); return g; };
  const q = { NE: [mx, B[1], B[2], mz], NW: [B[0], B[1], mx, mz], SE: [mx, mz, B[2], B[3]], SW: [B[0], mz, mx, B[3]] };
  for (const k of ['NE', 'NW', 'SE', 'SW']) {
    const [x0, z0, x1, z1] = q[k], cx = k.includes('E') ? mx + H0 : mx - H0, cz = k.includes('N') ? mz - H0 : mz + H0;
    const ix = k.includes('E') ? x0 : x1, iz = k.includes('N') ? z1 : z0, ox = k.includes('E') ? x1 : x0, oz = k.includes('N') ? z0 : z1;
    greens[k] = new T.Mesh(shape([[ox, oz], [ix, oz], [ix, cz], [cx, cz], [cx, iz], [ox, iz]]), PM.y9fGreen);
  }
  greens.C = new T.Mesh(shape([[mx - H0, mz - H0], [mx + H0, mz - H0], [mx + H0, mz + H0], [mx - H0, mz + H0]]), PM.y9fGreen);
  for (const k of ZONES) { greens[k].visible = false; greens[k].renderOrder = 5; root.add(greens[k]); }
  let H = null;
  return {
    set(h) { H = h; for (const s of segs) s.m.position.set(s.p[0], Y0 + 0.1 + Math.max(0, surfH(h, s.p[0], s.p[1])), s.p[1]); },
    lit(zone) { for (const k of ZONES) { greens[k].visible = k === zone; if (k === zone && H) greens[k].position.y = Y0 + 0.25 + Math.max(...ZONES.map((z) => H[z])); } },
  };
}

/* ───────── the gauges: on each wall's top, at its middle, a housing with three notches and a tongue that slides out ───────── */
const OUT = { N: [0, -1], S: [0, 1], E: [1, 0], W: [-1, 0] };
export function gaugeSet(X, root) {
  const T = X.THREE, PM = fmats(X), [L, Hh, Dd] = FD.GH, G = {};
  for (const k of ['N', 'S', 'E', 'W']) {
    const g = new T.Group(); g.name = 'h132-gauge-' + k; const [gx, gz] = S9.gauge[k], n = OUT[k];
    g.position.set(gx, S9.gaugeY, gz); g.rotation.y = Math.atan2(n[0], n[1]); root.add(g);   // (its own +z points out from the block)
    const hs = new T.Mesh(X.props.geo.box, PM.y9woodD); hs.scale.set(L, Hh, Dd); hs.position.set(0, Hh / 2, 0); hs.castShadow = true; g.add(hs);
    // three notches along the tongue's way out: good to 1, warn to 2, danger past it
    PM.y9fNotch.forEach((mt, i) => { const m = new T.Mesh(X.props.geo.box, mt); m.scale.set(L * 0.92, 0.12, 0.22); m.position.set(0, Hh + 0.07, Dd / 2 + (i + 1) * FD.PER_UNIT - 0.11); g.add(m); });
    const rail = new T.Mesh(X.props.geo.box, PM.y9woodD); rail.scale.set(0.22, 0.1, 3.2 * FD.PER_UNIT); rail.position.set(L / 2 + 0.2, Hh * 0.55, Dd / 2 + 1.6 * FD.PER_UNIT); g.add(rail);
    const tg = new T.Mesh(X.props.geo.box, PM.y9tongue); tg.scale.set(FD.TONGUE[0], FD.TONGUE[1], 1); tg.castShadow = true; g.add(tg);
    const tip = new T.Mesh(X.props.geo.box, PM.y9fTip[0]); tip.scale.set(FD.TONGUE[0] * 1.25, FD.TONGUE[1] * 1.25, 0.4); g.add(tip);
    G[k] = { g, tg, tip, v: null };
  }
  return {
    set(gv, lv, bulged = {}) {
      for (const k of ['N', 'S', 'E', 'W']) {
        const q = G[k], v = Math.max(0, Math.min(3.2, gv[k])), key = v.toFixed(3) + '|' + lv + '|' + (bulged[k] ? 1 : 0); if (q.v === key) continue; q.v = key;
        const len = 0.3 + v * FD.PER_UNIT, b = band(gv[k], lv), i = b === 'good' ? 0 : b === 'warn' ? 1 : 2;
        q.tg.scale.z = len + Dd; q.tg.position.set(0, Hh + 0.3, (len + Dd) / 2 - Dd / 2);
        q.tip.material = PM.y9fTip[i]; q.tip.position.set(0, Hh + 0.3, len + 0.2);
      }
    },
    G,
  };
}

/* ───────── the layers: a line on the walls' inner faces at each layer closed; the flash that climbs them ───────── */
export function layerLines(X, root) {
  const T = X.THREE, PM = fmats(X), lines = [], e = 0.03;
  const ring = (mat, y, h) => { const g = new T.Group(); for (const [x0, z0, x1, z1] of [[B[0], B[1], B[2], B[1] + e], [B[0], B[3] - e, B[2], B[3]], [B[0], B[1], B[0] + e, B[3]], [B[2] - e, B[1], B[2], B[3]]]) { const m = new T.Mesh(X.props.geo.box, mat); m.scale.set(x1 - x0, h, z1 - z0); m.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); m.castShadow = false; g.add(m); } g.position.y = y; root.add(g); return g; };
  for (let i = 1; i <= FILL.LAYERS; i++) { const r = ring(PM.y9fLine, Y0 + i, 0.07); r.visible = false; lines.push(r); }
  const fl = ring(PM.y9fFlash, Y0, 0.5); fl.visible = false; const F = { t: -1, to: 0 };
  return {
    set(n) { lines.forEach((r, i) => { r.visible = i < n; }); },
    flash(n) { F.t = 0; F.to = n; fl.visible = true; },
    step(dt) { if (F.t < 0) return; F.t += dt; const u = Math.min(1, F.t / 0.7); fl.position.y = Y0 + 0.2 + (F.to - 0.2) * u; PM.y9fFlash.opacity = 0.85 * (1 - Math.max(0, (F.t - 0.5) / 0.4)); if (F.t > 0.9) { F.t = -1; fl.visible = false; } },
  };
}

/* ───────── the ramp (packed earth, from the north up to the wall's top), the sleds and their loads ───────── */
export const rampAng = () => Math.atan2(R.headY - R.footY, R.head[1] - R.foot[1]);
/** a point on the ramp's slope at z (its middle line) */
export const rampY = (z) => R.footY + ((z - R.foot[1]) / (R.head[1] - R.foot[1])) * (R.headY - R.footY);
export function rampMesh(X, root) {
  const T = X.THREE, PM = fmats(X), dz = R.head[1] - R.foot[1], dy = R.headY - R.footY, len = Math.hypot(dz, dy);
  const rp = new T.Mesh(X.props.geo.box, PM.y9earth); rp.scale.set(R.w, 0.6, len); rp.position.set(R.foot[0], (R.footY + R.headY) / 2 - 0.3, (R.foot[1] + R.head[1]) / 2); rp.rotation.x = -rampAng(); rp.castShadow = rp.receiveShadow = true; rp.name = 'h132-ramp'; root.add(rp);
  // the side planks that hold the earth (wood)
  for (const s of [-1, 1]) { const p = new T.Mesh(X.props.geo.box, PM.y9woodD); p.scale.set(0.2, 0.8, len); p.position.set(R.foot[0] + s * (R.w / 2 + 0.1), (R.footY + R.headY) / 2, (R.foot[1] + R.head[1]) / 2); p.rotation.x = -rampAng(); root.add(p); }
  return rp;
}
/** a sled with its load: { g (the sled), load (the load's group, tipped by the unloaders), kind } */
export function sledMesh(X, kind, root) {
  const T = X.THREE, PM = fmats(X), g = new T.Group(), [w, hh, l] = FD.SLED; g.name = 'h132-sled-' + kind;
  for (const s of [-1, 1]) { const r = new T.Mesh(X.props.geo.box, PM.y9woodD); r.scale.set(0.22, 0.22, l); r.position.set(s * (w / 2 - 0.15), 0.11, 0); r.castShadow = true; g.add(r);
    const tip = new T.Mesh(X.props.geo.box, PM.y9woodD); tip.scale.set(0.22, 0.22, 0.6); tip.position.set(s * (w / 2 - 0.15), 0.25, l / 2 + 0.2); tip.rotation.x = -0.5; g.add(tip); }
  for (let i = 0; i < 4; i++) { const sl = new T.Mesh(X.props.geo.box, PM.y9wood); sl.scale.set(w, 0.1, 0.62); sl.position.set(0, hh - 0.05, -l / 2 + 0.45 + i * 0.83); sl.castShadow = true; sl.receiveShadow = true; g.add(sl); }
  const load = new T.Group(); load.position.y = hh; g.add(load);
  const [r, h] = FD.LOAD[kind];
  if (kind === 'tub') {
    const st = new T.Mesh(X.props.geo.y9fCyl, PM.y9fTub); st.scale.set(r, h, r); st.position.y = h / 2; st.castShadow = true; load.add(st);
    const bt = new T.Mesh(X.props.geo.y9fDisc, PM.y9fTub); bt.rotation.x = -Math.PI / 2; bt.scale.setScalar(r * 0.86); bt.position.y = 0.02; load.add(bt);
    const wet = new T.Mesh(X.props.geo.y9fDisc, PM.y9fWet); wet.rotation.x = -Math.PI / 2; wet.scale.setScalar(r * 0.96); wet.position.y = h * 0.86; load.add(wet);
    for (const yy of [0.2, 0.75]) { const hp = new T.Mesh(new T.TorusGeometry(r * (0.9 + 0.1 * yy), 0.05, 4, 14), PM.y9woodD); hp.rotation.x = Math.PI / 2; hp.position.y = h * yy; load.add(hp); }
  } else {
    const bk = new T.Mesh(X.props.geo.y9fCyl, PM.y9fWicker); bk.scale.set(r, h, r); bk.position.y = h / 2; bk.castShadow = true; load.add(bk);
    const bt = new T.Mesh(X.props.geo.y9fDisc, PM.y9fWicker); bt.rotation.x = -Math.PI / 2; bt.scale.setScalar(r * 0.86); bt.position.y = 0.02; load.add(bt);
    // the round stones heaped over its rim
    const n = kind === 'big' ? 9 : 5;
    for (let i = 0; i < n; i++) { const a = i * 2.39, rr = i ? r * 0.55 * Math.sqrt(i / n) : 0, s = (kind === 'big' ? 0.42 : 0.3) * (0.8 + 0.4 * ((i * 37) % 7) / 7); const p = new T.Mesh(X.props.geo.y9fPeb, PM.y9fStone); p.scale.set(s, s * 0.8, s); p.position.set(Math.cos(a) * rr, h * 0.95 + s * 0.5 - rr * 0.25, Math.sin(a) * rr); p.rotation.set(i, i * 2, 0); p.castShadow = true; load.add(p); }
  }
  root.add(g);
  return { g, load, kind };
}
/** the stones last set on each zone (no mix since): a heap that shows dry and bright when it is a weak pocket */
export function stoneHeap(X, root) {
  const T = X.THREE, PM = fmats(X), H = {};
  for (const k of ZONES) {
    const g = new T.Group(); g.visible = false; root.add(g); const L = [];
    for (let i = 0; i < 7; i++) { const a = i * 2.39 + k.length, rr = 0.5 + 1.6 * Math.sqrt(i / 7), s = 0.38 + 0.12 * ((i * 13) % 5) / 5; const p = new T.Mesh(X.props.geo.y9fPeb, PM.y9fStone); p.scale.set(s, s * 0.75, s); p.position.set(Math.cos(a) * rr, s * 0.35, Math.sin(a) * rr); p.rotation.set(i, i * 1.3, 0); p.castShadow = true; g.add(p); L.push(p); }
    H[k] = { g, L };
  }
  return {
    set(zone, on, bright, y) { const q = H[zone]; q.g.visible = !!on; if (!on) return; q.g.position.set(ZC[zone][0], y, ZC[zone][1]); for (const p of q.L) p.material = bright ? PM.y9fDry : PM.y9fStone; },
  };
}

/* ───────── the oxen: two bulls under one wooden yoke (animals.js), on the road from the east to the ramp's foot ───────── */
export function oxPair(X, root) {
  const T = X.THREE, PM = fmats(X); let A = null; const ox = [];
  try { A = createAnimals({ scene: X.scene, camera: X.camera, ground: (x, z) => { try { return X.ground(x, z); } catch (e) { return S9.floor; } } }); for (let j = 0; j < 2; j++) { const o = A.add('bull', S9.oxen.to[0], S9.oxen.to[1], { yaw: -Math.PI / 2, calm: true }); if (o) ox.push(o); } } catch (e) { console.warn('[h132] oxen', e && e.message); }
  const yoke = new T.Mesh(X.props.geo.box, PM.y9fYoke); yoke.scale.set(0.3, 0.25, 3.4); yoke.castShadow = true; root.add(yoke);
  const P = { x: S9.oxen.to[0], z: S9.oxen.to[1], yaw: -Math.PI / 2, walk: 0 };
  return {
    ox, yoke, P,
    /** the pair's middle (x, z), the way it faces (yaw: animals' sense, −π/2 west), walking or still */
    set(x, z, yaw, walk) { P.x = x; P.z = z; P.yaw = yaw; P.walk = walk; },
    update(dt) {
      const fx = Math.sin(P.yaw), fz = Math.cos(P.yaw), sx = fz, sz = -fx;
      ox.forEach((o, j) => { const s = j ? 1 : -1, x = P.x + sx * s * 1.1, z = P.z + sz * s * 1.1; o.x = x; o.z = z; o.yaw = P.yaw; o.path = P.walk ? [[x + fx * 8, z + fz * 8]] : null; o.pi = 0; o.speed = 2.2; o.walkT0 = undefined; o.res = null; });
      try { if (A) A.update(dt); } catch (e) { /* */ }
      ox.forEach((o, j) => { const s = j ? 1 : -1; o.x = P.x + sx * s * 1.1; o.z = P.z + sz * s * 1.1; });
      let gy = S9.floor; try { gy = X.ground(P.x, P.z); } catch (e) { /* */ }
      yoke.position.set(P.x + fx * 1.6, gy + 2.15, P.z + fz * 1.6); yoke.rotation.y = P.yaw;
    },
    clear() { try { for (const o of ox) A.remove(o); if (A) A.update(0); } catch (e) { /* */ } ox.length = 0; try { if (yoke.parent) yoke.parent.remove(yoke); } catch (e) { /* */ } },
  };
}

/* ───────── the lane's hooks: while the fill's act plays, the ramp and the block's top are its own ───────── */
const OWN = { on: false };
export const fillHold = (v) => { OWN.on = !!v; };
export const FILL3D = addLane({ owns: (what) => OWN.on && (what === 'ramp' || what === 'block') });
void box;
