/* ── build 136 ── h136/look.js — what the things of stage 13 look like (spec docs/specs/shlav-13-he.md v4, "המראה"): white stone against
 * painted wood (the lintels "מצוירות ומכוירות", Bartenura: simple bands of colour, low-poly), cedar poles, gold chains and crowns, the
 * sky-blue and gold of the two hands. Low-poly and big.
 *   mats13(X) · beamMat(X, i) (each lintel its own colours) · kohenClimber(X) (the kohen on the chains: his body, arms to his hands)
 *   · linkGeo(T) · crownMesh(X, lit) · ropeMesh(X)
 */
import { mats10 } from '../h133/world.js';

const BEAM_COLS = [['#A8452E', '#D9A441', '#2F5E7A'], ['#2F6B4F', '#D9A441', '#9C3B2A'], ['#7A3E7A', '#E2C06A', '#2F5E7A'], ['#A8452E', '#3C7A8C', '#E8D7A8'], ['#2F5E7A', '#D9A441', '#A8452E']];
export const HANDS = Object.freeze({ R: '#E9B949', L: '#6FC6E8' });   // (the bracelets: right gold, left sky blue — spec "סימון הידיים")
export function mats13(X) {
  const P0 = X.props, T = X.THREE, M10 = mats10(X);
  if (P0.M.y13stone) return P0.M;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true, ...o });
  P0.M.y13stone = std('#EDE6D6', { roughness: 0.85 });
  P0.M.y13stoneB = std('#E2D9C5', { roughness: 0.88 });
  P0.M.y13stoneD = std('#C9BEA6');
  P0.M.y13plaster = std('#F2ECDF', { roughness: 0.95 });
  P0.M.y13crack = new T.MeshBasicMaterial({ color: '#3A3026' });
  P0.M.y13hole = new T.MeshBasicMaterial({ color: '#2A2016' });
  P0.M.y13cedar = std('#9A5B34', { roughness: 0.8 });
  P0.M.y13cedarL = std('#B9754A', { roughness: 0.8 });
  P0.M.y13wood = M10.y10wood; P0.M.y13woodD = M10.y10woodD; P0.M.y13rope = M10.y10rope;
  P0.M.y13ropeT = std('#F1E2BE', { roughness: 0.7, emissive: '#5A4A20', emissiveIntensity: 0.25 });
  P0.M.y13ropeGlow = new T.MeshBasicMaterial({ color: '#FFF0B8' });
  P0.M.y13gold = std('#E6B94A', { roughness: 0.32, metalness: 0.55, flatShading: false, emissive: '#4A3006', emissiveIntensity: 0.35 });
  P0.M.y13goldDark = std('#6E5626', { roughness: 0.6, metalness: 0.3 });
  P0.M.y13goldLit = new T.MeshStandardMaterial({ color: '#FFD96A', roughness: 0.25, metalness: 0.5, emissive: '#FFB52A', emissiveIntensity: 0.9 });
  P0.M.y13lime = std('#C8362A', { roughness: 0.9 });   // (the red lime marks on the course: real site marks, rule 9)
  P0.M.y13ghost = new T.MeshBasicMaterial({ color: '#8EE07A', transparent: true, opacity: 0.28, depthWrite: false });
  P0.M.y13strip = new T.MeshBasicMaterial({ color: '#FFF6D2', transparent: true, opacity: 0.9, depthWrite: false, side: T.DoubleSide });
  P0.M.y13glow = M10.y10glow;
  P0.M.y13ray = new T.MeshBasicMaterial({ color: '#FFE7A8', transparent: true, opacity: 0.35, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide });
  P0.M.y13window = new T.MeshBasicMaterial({ color: '#BFD8EA' });
  P0.M.y13robe = std('#F7F4EC', { roughness: 0.8 });
  P0.M.y13skin = std('#C99A72', { roughness: 0.8 });
  P0.M.y13belt = std('#7A2E5A', { roughness: 0.8 });
  P0.M.y13handR = new T.MeshStandardMaterial({ color: HANDS.R, emissive: HANDS.R, emissiveIntensity: 0.55, roughness: 0.4 });
  P0.M.y13handL = new T.MeshStandardMaterial({ color: HANDS.L, emissive: HANDS.L, emissiveIntensity: 0.55, roughness: 0.4 });
  P0.M.y13ringR = new T.MeshBasicMaterial({ color: HANDS.R, transparent: true, opacity: 0.9, depthWrite: false, depthTest: false });
  P0.M.y13ringL = new T.MeshBasicMaterial({ color: HANDS.L, transparent: true, opacity: 0.9, depthWrite: false, depthTest: false });
  P0.M.y13ringGold = new T.MeshBasicMaterial({ color: '#FFD24A', transparent: true, opacity: 0.95, depthWrite: false, depthTest: false });
  P0.M.y13flag = std('#C8362A', { side: T.DoubleSide });
  P0.M.y13scratch = std('#E9D8B8', { roughness: 0.6 });
  P0.M.y13break = std('#8E8470');
  return P0.M;
}
const BM = {};
/** a lintel's painted material: three bands of colour along it, a dark edge line (a canvas texture, made once each) */
export function beamMat(X, i) {
  if (BM[i]) return BM[i];
  const T = X.THREE, c = BEAM_COLS[i % BEAM_COLS.length];
  let tex = null;
  try {
    const cv = document.createElement('canvas'); cv.width = 128; cv.height = 32; const g = cv.getContext('2d');
    g.fillStyle = '#B98A58'; g.fillRect(0, 0, 128, 32);
    for (let k = 0; k < 8; k++) { g.fillStyle = c[k % 3]; g.fillRect(k * 16 + 2, 6, 12, 20); }
    g.fillStyle = '#3A2414'; g.fillRect(0, 0, 128, 3); g.fillRect(0, 29, 128, 3);
    g.fillStyle = c[1]; for (let k = 0; k < 8; k++) { g.beginPath(); g.arc(k * 16 + 8, 16, 3, 0, Math.PI * 2); g.fill(); }
    tex = new T.CanvasTexture(cv); tex.wrapS = T.RepeatWrapping; tex.repeat.set(3, 1);
    if (T.SRGBColorSpace) tex.colorSpace = T.SRGBColorSpace;
  } catch (e) { tex = null; }
  BM[i] = new T.MeshStandardMaterial({ color: tex ? '#FFFFFF' : c[0], map: tex, roughness: 0.8, flatShading: true });
  return BM[i];
}
let LG = null;
/** a chain link (alternating: the instance turns every other by 90°) */
export function linkGeo(T) { if (!LG) { LG = new T.TorusGeometry(0.1, 0.032, 5, 10); LG.scale(1, 1.45, 1); } return LG; }
/** a crown (עטרה): a gold ring standing on the wall with points on top */
export function crownMesh(X) {
  const T = X.THREE, M = mats13(X), g = new T.Group();
  const band = new T.Mesh(new T.CylinderGeometry(1.0, 1.1, 0.9, 16, 1, true), M.y13goldDark); band.position.y = 0.45; g.add(band);
  for (let k = 0; k < 8; k++) { const a = (k / 8) * Math.PI * 2, p = new T.Mesh(new T.ConeGeometry(0.16, 0.6, 5), M.y13goldDark); p.position.set(Math.cos(a) * 1.0, 1.15, Math.sin(a) * 1.0); g.add(p); }
  const gem = new T.Mesh(new T.OctahedronGeometry(0.22), M.y13goldDark); gem.position.set(1.05, 0.45, 0); g.add(gem);
  g.userData.parts = [band, gem, ...g.children.filter((o) => o !== band && o !== gem)];
  g.userData.lit = (on) => { for (const o of g.userData.parts) o.material = on ? M.y13goldLit : M.y13goldDark; };
  return g;
}
/** the kohen on the chains: white robe, a coloured sash, head, two arms from the shoulders to his hands (with the bracelets); local:
 *  his hands' heights are set by pose(hR, hL) relative to the group's origin (the shoulders' height = the lower hand − 0.3) */
export function kohenClimber(X) {
  const T = X.THREE, M = mats13(X), g = new T.Group(); g.name = 'h136-climber';
  const body = new T.Mesh(new T.CylinderGeometry(0.34, 0.5, 2.2, 10), M.y13robe); body.position.y = -1.3; g.add(body);
  const sash = new T.Mesh(new T.CylinderGeometry(0.4, 0.42, 0.2, 10), M.y13belt); sash.position.y = -1.0; g.add(sash);
  const head = new T.Mesh(new T.SphereGeometry(0.27, 12, 10), M.y13skin); head.position.y = 0.32; g.add(head);
  const cap = new T.Mesh(new T.CylinderGeometry(0.26, 0.28, 0.22, 10), M.y13robe); cap.position.y = 0.55; g.add(cap);
  const legs = []; for (const s of [-1, 1]) { const l = new T.Mesh(new T.CylinderGeometry(0.1, 0.09, 1.0, 6), M.y13skin); l.position.set(0, -2.8, s * 0.16); g.add(l); legs.push(l); }
  const arm = (mat) => { const a = new T.Group(), m = new T.Mesh(new T.CylinderGeometry(0.09, 0.08, 1, 6), M.y13robe); m.position.y = 0.5; a.add(m); const br = new T.Mesh(new T.TorusGeometry(0.11, 0.045, 6, 12), mat); br.rotation.x = Math.PI / 2; br.position.y = 0.92; a.add(br); const hd = new T.Mesh(new T.SphereGeometry(0.1, 8, 6), M.y13skin); hd.position.y = 1.02; a.add(hd); a.userData = { m, br, hd }; g.add(a); return a; };
  const aR = arm(M.y13handR), aL = arm(M.y13handL);
  for (const o of [body, head]) o.castShadow = true;
  // pose: the shoulders at (0, 0, ±0.3); each arm reaches its hand at (0, hy, hz) relative
  g.userData.pose = (hR, zR, hL, zL) => {
    for (const [a, hy, hz, sz] of [[aR, hR, zR, -0.28], [aL, hL, zL, 0.28]]) {
      a.position.set(0, -0.05, sz); const dy = hy + 0.05, dz = hz - sz, L = Math.max(0.3, Math.hypot(dy, dz));
      a.rotation.set(Math.atan2(dz, dy), 0, 0); a.userData.m.scale.y = L; a.userData.m.position.y = L / 2; a.userData.br.position.y = L - 0.08; a.userData.hd.position.y = L;
    }
  };
  g.userData.arms = { R: aR, L: aL };
  return g;
}
/** a rope as a tube along a sagging curve (rebuilt only when it changes) */
export function ropeMesh(X, mat) {
  const T = X.THREE, m = new T.Mesh(new T.BufferGeometry(), mat); m.frustumCulled = false;
  let key = '';
  m.userData.set = (a, b, sag, r = 0.07) => {
    const k = [a, b].map((p) => p.map((v) => v.toFixed(2)).join(',')).join(';') + sag.toFixed(2) + r;
    if (k === key) return; key = k;
    const mid = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 - sag, (a[2] + b[2]) / 2];
    const c = new T.QuadraticBezierCurve3(new T.Vector3(...a), new T.Vector3(...mid), new T.Vector3(...b));
    const g = new T.TubeGeometry(c, 18, r, 5, false); m.geometry.dispose(); m.geometry = g;
  };
  return m;
}
