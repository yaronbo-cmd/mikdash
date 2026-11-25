/* ── build 135 ── h135/look.js — what the things of stage 12 look like (spec docs/specs/shlav-12-he.md v7, "המראה"): warm copper (the
 * kiyor and its spigots, finished in the workshop: Exodus 30:18; נחושת המחשה) against pale wood (the machine), the stone stations with
 * their engraved hands brighter than the feet (so a phone tells them apart), night earth and clear water. Low-poly and big.
 *   mats12(X) · kiyorGeo(T, h, r0, r1) · spigotMesh(X) · slabMesh(X, S12, st, lv) · wheelMesh(X, r, spokes) · streamMesh(X)
 */
import { BOOK } from '../world/grid.js';
import { mats10 } from '../h133/world.js';

const S12 = BOOK.s12;
export function mats12(X) {
  const P0 = X.props, T = X.THREE, M10 = mats10(X);
  if (P0.M.y12copper) return P0.M;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true, ...o });
  P0.M.y12copper = std('#C27A45', { roughness: 0.32, metalness: 0.75, flatShading: false });
  P0.M.y12copperIn = std('#8E5531', { roughness: 0.45, metalness: 0.6, side: T.BackSide, flatShading: false });
  P0.M.y12dent = std('#5E3A22', { roughness: 0.5, metalness: 0.5 });
  P0.M.y12brass = std('#B08A4A', { roughness: 0.35, metalness: 0.8, flatShading: false });
  P0.M.y12socket = std('#2A1A10', { roughness: 0.8 });
  P0.M.y12wood = M10.y10wood; P0.M.y12woodD = M10.y10woodD; P0.M.y12white = M10.y10white;
  P0.M.y12woodL = std('#E3CDA6');
  P0.M.y12stone = std('#CFC4AE', { roughness: 0.92 });
  P0.M.y12stoneD = std('#A89C86');
  P0.M.y12hands = std('#FFF4D6', { roughness: 0.6, emissive: '#3A2E14', emissiveIntensity: 0.25 });
  P0.M.y12feet = std('#8A7D66');
  P0.M.y12handsLit = new T.MeshBasicMaterial({ color: '#FFE9A0' });
  P0.M.y12scratch = std('#E9D8B8', { roughness: 0.5 });
  P0.M.y12pitWall = std('#B9AC94', { roughness: 0.95 });
  P0.M.y12pitFloor = std('#8F8470', { roughness: 0.95 });
  P0.M.y12earth = std('#7B5E40', { roughness: 1 });
  P0.M.y12stoneHard = std('#9E968A', { roughness: 0.8 });
  P0.M.y12whiteStone = std('#F4F0E6', { roughness: 0.7 });
  P0.M.y12stream = new T.MeshStandardMaterial({ color: '#BFE3F0', roughness: 0.08, metalness: 0.0, transparent: true, opacity: 0.78, emissive: '#2A5C70', emissiveIntensity: 0.35, depthWrite: false });
  P0.M.y12waterLine = new T.MeshBasicMaterial({ color: '#E7D8B4' });
  P0.M.y12ring = new T.MeshBasicMaterial({ color: '#F0C674' });
  P0.M.y12ringMoon = new T.MeshBasicMaterial({ color: '#D8E4F0' });
  P0.M.y12glow = M10.y10glow; P0.M.y12gold = M10.y10gold; P0.M.y12rope = M10.y10rope;
  P0.M.y12x = new T.MeshBasicMaterial({ color: '#7A4A22' });
  P0.M.y12splash = new T.MeshBasicMaterial({ color: '#E8F6FF', transparent: true, opacity: 0.8, depthWrite: false });
  P0.M.y12mud = new T.MeshBasicMaterial({ color: '#6B4A2A', transparent: true, opacity: 0.6, depthWrite: false });
  P0.M.y12torch = new T.MeshBasicMaterial({ color: '#FFB347' });
  P0.M.y12mask = new T.MeshBasicMaterial({ colorWrite: false, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -6 });
  return P0.M;
}
/** the kiyor: a copper bowl, its foot narrower than its rim (local: bottom at y 0, rim at h) — outer wall, inner wall, the bottom, a lip */
export function kiyorGeo(T, h = S12.kiyor.h, r0 = S12.kiyor.r0, r1 = S12.kiyor.r1) {
  const pts = [];
  const N = 10; for (let i = 0; i <= N; i++) { const k = i / N; pts.push(new T.Vector2(r0 + (r1 - r0) * Math.pow(k, 1.4), k * h)); }
  return new T.LatheGeometry(pts, 40);
}
/** a spigot (דד): a short copper spout with its wooden plug's knob on top; local: its mouth along +x, its root at the origin */
export function spigotMesh(X) {
  const T = X.THREE, M = mats12(X), g = new T.Group();
  const body = new T.Mesh(new T.CylinderGeometry(0.07, 0.1, 0.34, 12), M.y12copper); body.rotation.z = -Math.PI / 2; body.position.x = 0.17; g.add(body);
  const lip = new T.Mesh(new T.TorusGeometry(0.075, 0.018, 6, 14), M.y12copper); lip.rotation.y = Math.PI / 2; lip.position.x = 0.34; g.add(lip);
  const plug = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.12, 8), M.y12woodD); plug.position.set(0.12, 0.1, 0); g.add(plug); g.userData.plug = plug;
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; } });
  return g;
}
/** the big wooden wheel (the nut): rim, hub and spokes; local: lying flat, centre at the origin */
export function wheelMesh(X, r, spokes = 8) {
  const T = X.THREE, M = mats12(X), g = new T.Group();
  const rim = new T.Mesh(new T.TorusGeometry(r, 0.16, 8, 48), M.y12woodL); rim.rotation.x = Math.PI / 2; g.add(rim);
  const hub = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 0.5, 16), M.y12wood); g.add(hub);
  for (let i = 0; i < spokes; i++) { const a = (i / spokes) * Math.PI * 2, s = new T.Mesh(new T.BoxGeometry(r - 0.5, 0.16, 0.18), i === 0 ? M.y12woodD : M.y12wood); s.position.set(Math.cos(a) * (r / 2 + 0.25), 0, Math.sin(a) * (r / 2 + 0.25)); s.rotation.y = -a; g.add(s); }
  // (a dark peg on the rim: the eye sees it turn)
  const peg = new T.Mesh(new T.CylinderGeometry(0.12, 0.12, 0.4, 8), M.y12woodD); peg.position.set(r, 0.2, 0); g.add(peg);
  g.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return g;
}
/** a station: the low stone step (its height by level), the slab on it, two engraved hands (bright) forward and two feet (dark) behind
 *  them — local: x right, z forward (toward the kiyor), y up from the floor */
export function slabMesh(X, st, lv) {
  const T = X.THREE, M = mats12(X), g = new T.Group(), SL = S12.slab, h = st.h[lv] || 0, t = 0.14;
  if (h > 0.01) { const s = new T.Mesh(X.props.geo.box, M.y12stoneD); s.scale.set(SL.w + 0.2, h, SL.d + 0.2); s.position.y = h / 2; s.receiveShadow = true; g.add(s); }
  const slab = new T.Mesh(X.props.geo.box, M.y12stone); slab.scale.set(SL.w, t, SL.d); slab.position.y = h + t / 2; slab.receiveShadow = true; slab.castShadow = true; g.add(slab);
  const H = SL.hands, hr = lv === 1 ? H.rL1 : H.r, Ft = SL.feet, y = h + t + 0.004;
  const hands = [];
  for (const sd of [-1, 1]) {
    const hm = new T.Mesh(new T.CircleGeometry(hr, 20), M.y12hands); hm.rotation.x = -Math.PI / 2; hm.position.set(sd * H.side, y + 0.002, H.fwd); g.add(hm); hands.push(hm);
    // (the fingers: four short strokes at the hand's front)
    for (let k = 0; k < 4; k++) { const f = new T.Mesh(X.props.geo.box, M.y12hands); f.scale.set(0.035, 0.01, hr * 0.7); f.position.set(sd * H.side + (k - 1.5) * hr * 0.32, y + 0.004, H.fwd + hr * 1.05); g.add(f); }
    const fm = new T.Mesh(X.props.geo.box, M.y12feet); fm.scale.set(Ft.w, 0.01, Ft.l); fm.position.set(sd * Ft.side, y, Ft.fwd); g.add(fm);
  }
  g.userData = { hands, top: h + t };
  g.position.set(st.x, S12.floor, st.z);
  // (its forward is the station's yaw: local +z → the world's (sin yaw, cos yaw))
  g.rotation.y = st.yaw;
  return g;
}
/** a stream: a tube along a quadratic curve (the arc's mouth, its control, the landing); rebuilt when its aim changes */
export function streamMesh(X) {
  const T = X.THREE, M = mats12(X), m = new T.Mesh(new T.BufferGeometry(), M.y12stream); m.renderOrder = 6; m.frustumCulled = false; m.visible = false;
  let key = '';
  m.userData.set = (p0, p1, p2, r = 0.045) => {
    const k = [p0, p1, p2].map((p) => p.map((v) => v.toFixed(3)).join(',')).join(';') + r;
    if (k === key) return; key = k;
    const c = new T.QuadraticBezierCurve3(new T.Vector3(...p0), new T.Vector3(...p1), new T.Vector3(...p2));
    const g = new T.TubeGeometry(c, 20, r, 6, false); m.geometry.dispose(); m.geometry = g;
  };
  return m;
}
