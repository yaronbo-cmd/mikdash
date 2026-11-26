/* ── build 137 ── h137/look.js — what the things of stage 14 look like (spec docs/specs/shlav-14-he.md v3, "המראה"): white stone in
 * section, dim light in the cells, the light strips of the openings passed; warm wood, black charcoal and curled chips in the yard;
 * the red bole, the leaf, the gold that goes from matte to deep and mirrors. The hands: right gold, left sky blue (as in stage 13).
 * Standalone (no other stage's look): the lab's prototypes draw with it too.
 *   mats14(X) · box(X, mat, x0, y0, z0, x1, y1, z1, parent) · kohenWalker(X) · signTex(X, key) · HANDS */
export const HANDS = Object.freeze({ R: '#E9B949', L: '#6FC6E8' });
export function mats14(X) {
  const P0 = X.props, T = X.THREE;
  if (P0.M.y14stone) return P0.M;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: true, ...o });
  P0.M.y14stone = std('#EDE6D6', { roughness: 0.85 });
  P0.M.y14stoneB = std('#E2D9C5', { roughness: 0.88 });
  P0.M.y14stoneD = std('#C9BEA6');
  P0.M.y14cut = std('#D8CDB4');                                   // (the section's cut faces: a shade darker than the walls)
  P0.M.y14glass = new T.MeshStandardMaterial({ color: '#E8E0CE', roughness: 0.9, transparent: true, opacity: 0.25, depthWrite: false });   // (the cells' outer wall at 25%: spec)
  P0.M.y14floor = std('#D9CFB8');
  P0.M.y14dark = new T.MeshBasicMaterial({ color: '#2A2016' });
  P0.M.y14strip = new T.MeshBasicMaterial({ color: '#FFF0B8', transparent: true, opacity: 0.85, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide });
  P0.M.y14next = new T.MeshBasicMaterial({ color: '#FFE27A', transparent: true, opacity: 0.6, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide });
  P0.M.y14ray = new T.MeshBasicMaterial({ color: '#FFE7A8', transparent: true, opacity: 0.35, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide });
  P0.M.y14cedar = std('#9A5B34', { roughness: 0.8 });
  P0.M.y14wood = std('#B9824E', { roughness: 0.85 });
  P0.M.y14woodL = std('#D9AE78', { roughness: 0.7 });
  P0.M.y14woodD = std('#7A4E2C', { roughness: 0.85 });
  P0.M.y14plank = std('#E0B886', { roughness: 0.75, flatShading: false });
  P0.M.y14charcoal = new T.MeshBasicMaterial({ color: '#1E1A16', transparent: true, opacity: 1, depthWrite: false });
  P0.M.y14chip = std('#F0CF9C', { roughness: 0.6, side: T.DoubleSide });
  P0.M.y14bole = std('#B8563A', { roughness: 0.95 });             // (the bole: red clay on the gesso — המחשה)
  P0.M.y14gesso = std('#F3EEE2', { roughness: 0.95 });
  P0.M.y14wet = new T.MeshStandardMaterial({ color: '#C96A4C', roughness: 0.15, metalness: 0.1, transparent: true, opacity: 0.85 });
  P0.M.y14leaf = new T.MeshStandardMaterial({ color: '#D9B04A', roughness: 0.55, metalness: 0.6, side: T.DoubleSide });
  P0.M.y14goldMatte = new T.MeshStandardMaterial({ color: '#C9A04A', roughness: 0.6, metalness: 0.65 });
  P0.M.y14gold = new T.MeshStandardMaterial({ color: '#F2C95A', roughness: 0.12, metalness: 1.0, emissive: '#3A2604', emissiveIntensity: 0.25 });
  P0.M.y14goldLit = new T.MeshStandardMaterial({ color: '#FFE08A', roughness: 0.08, metalness: 1.0, emissive: '#FFB52A', emissiveIntensity: 0.5 });
  P0.M.y14agate = std('#C8B8A8', { roughness: 0.3 });
  P0.M.y14mask = std('#8A5A32', { roughness: 0.8 });
  P0.M.y14robe = std('#F7F4EC', { roughness: 0.8 });
  P0.M.y14skin = std('#C99A72', { roughness: 0.8 });
  P0.M.y14belt = std('#7A2E5A', { roughness: 0.8 });
  P0.M.y14handR = new T.MeshStandardMaterial({ color: HANDS.R, emissive: HANDS.R, emissiveIntensity: 0.55, roughness: 0.4 });
  P0.M.y14handL = new T.MeshStandardMaterial({ color: HANDS.L, emissive: HANDS.L, emissiveIntensity: 0.55, roughness: 0.4 });
  P0.M.y14ringR = new T.MeshBasicMaterial({ color: HANDS.R, transparent: true, opacity: 0.9, depthWrite: false, depthTest: false });
  P0.M.y14ringL = new T.MeshBasicMaterial({ color: HANDS.L, transparent: true, opacity: 0.85, depthWrite: false, depthTest: false });
  P0.M.y14break = std('#8E8470');
  P0.M.y14scar = std('#6E4A2A');
  P0.M.y14spike = std('#3A3630', { metalness: 0.3, roughness: 0.6 });
  P0.M.y14bird = std('#3A3A3A');
  P0.M.y14lamp = new T.MeshBasicMaterial({ color: '#FFD27A' });
  return P0.M;
}
export function box(X, mat, x0, y0, z0, x1, y1, z1, parent) {
  const m = new X.THREE.Mesh(X.props.geo.box, mat); m.scale.set(Math.max(1e-3, Math.abs(x1 - x0)), Math.max(1e-3, Math.abs(y1 - y0)), Math.max(1e-3, Math.abs(z1 - z0))); m.position.set((x0 + x1) / 2, (y0 + y1) / 2, (z0 + z1) / 2);
  m.castShadow = true; m.receiveShadow = true; (parent || X.props.root).add(m); return m;
}
/** the kohen who walks (work 1): white robe, sash, head and cap, two legs that swing, two arms with the bracelets; height 2.4 (his feet at
 *  the group's origin, he faces +x: the group's rotation.y = −yaw). userData.walk(phase, speed) swings the legs and arms. */
export function kohenWalker(X) {
  const T = X.THREE, M = mats14(X), g = new T.Group(); g.name = 'h137-walker';
  const body = new T.Mesh(new T.CylinderGeometry(0.3, 0.45, 1.35, 10), M.y14robe); body.position.y = 1.15; g.add(body);
  const sash = new T.Mesh(new T.CylinderGeometry(0.36, 0.38, 0.18, 10), M.y14belt); sash.position.y = 1.2; g.add(sash);
  const head = new T.Mesh(new T.SphereGeometry(0.25, 12, 10), M.y14skin); head.position.y = 2.06; g.add(head);
  const cap = new T.Mesh(new T.CylinderGeometry(0.24, 0.26, 0.22, 10), M.y14robe); cap.position.y = 2.3; g.add(cap);
  const nose = new T.Mesh(new T.ConeGeometry(0.06, 0.16, 6), M.y14skin); nose.rotation.z = -Math.PI / 2; nose.position.set(0.26, 2.06, 0); g.add(nose);   // (which way he faces)
  const leg = (s) => { const p = new T.Group(); p.position.set(0, 0.55, s * 0.15); const m = new T.Mesh(new T.CylinderGeometry(0.09, 0.08, 0.55, 6), M.y14skin); m.position.y = -0.27; p.add(m); g.add(p); return p; };
  const arm = (s, mat) => { const p = new T.Group(); p.position.set(0, 1.72, s * 0.36); const m = new T.Mesh(new T.CylinderGeometry(0.08, 0.07, 0.7, 6), M.y14robe); m.position.y = -0.35; p.add(m); const br = new T.Mesh(new T.TorusGeometry(0.09, 0.035, 6, 12), mat); br.rotation.x = Math.PI / 2; br.position.y = -0.62; p.add(br); g.add(p); return p; };
  const lL = leg(-1), lR = leg(1), aR = arm(1, M.y14handR), aL = arm(-1, M.y14handL);
  for (const o of [body, head]) o.castShadow = true;
  g.userData.walk = (ph, sp) => { const a = Math.sin(ph) * 0.55 * Math.min(1, sp); lL.rotation.z = a; lR.rotation.z = -a; aR.rotation.z = a * 0.7; aL.rotation.z = -a * 0.7; };
  g.userData.arms = { R: aR, L: aL };
  return g;
}
const TEX = {};
/** a little wooden sign's face (the junction's five openings, a symbol without words: spec) */
export function signTex(X, key) {
  if (TEX[key]) return TEX[key];
  const T = X.THREE; let tex = null;
  try {
    const cv = document.createElement('canvas'); cv.width = 64; cv.height = 64; const g = cv.getContext('2d');
    g.fillStyle = '#9A6A3E'; g.fillRect(0, 0, 64, 64); g.strokeStyle = '#5A3A1E'; g.lineWidth = 4; g.strokeRect(2, 2, 60, 60);
    g.strokeStyle = '#FFF4D8'; g.fillStyle = '#FFF4D8'; g.lineWidth = 5; g.lineCap = 'round';
    const L = (pts) => { g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke(); };
    if (key === 'cell') { g.strokeRect(16, 18, 32, 28); }                                        // a cell: a square
    else if (key === 'up') { g.strokeRect(16, 30, 32, 20); L([[32, 26], [32, 10]]); L([[24, 17], [32, 9], [40, 17]]); }   // the cell above: a square and an arrow up
    else if (key === 'mesibah') { L([[12, 50], [24, 50], [24, 40], [36, 40], [36, 30], [48, 30], [48, 18]]); }   // the mesibah: steps
    else if (key === 'pishpash') { g.strokeRect(22, 22, 20, 28); g.beginPath(); g.arc(37, 36, 2.5, 0, 7); g.fill(); }   // the small door
    else if (key === 'heichal') { L([[14, 50], [14, 26], [32, 12], [50, 26], [50, 50]]); L([[26, 50], [26, 34], [38, 34], [38, 50]]); }   // the house
    tex = new T.CanvasTexture(cv); if (T.SRGBColorSpace) tex.colorSpace = T.SRGBColorSpace;
  } catch (e) { tex = null; }
  TEX[key] = new T.MeshBasicMaterial({ color: tex ? '#FFFFFF' : '#9A6A3E', map: tex, side: T.DoubleSide });
  return TEX[key];
}
