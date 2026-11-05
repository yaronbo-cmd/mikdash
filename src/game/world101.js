/* ── build 101 ── world101.js — THE WORLD'S FOUNDATION (the owner, 4.11 23:55 and 5.11 00:01, after playing 98–100: "דמות כפולה שהולכת
 * בהבהוב… המדרגות עומדות באוויר… כל 5 שניות עולה דמות ונבלעת לתוך האדמה… נראה שהעולם בגרסאות הראשונות היה יותר אמין ויפה"; he chose
 * "בסיס לעולם קודם" at 01:18). What was found: the world's crews are actors.js's instanced figures, and only the ten nearest the camera
 * were drawn as real people (crew71.js) — a man swapped between the two as the camera moved (the doubled, blinking figure); the life layer's
 * plasterers and sweepers came and went through the floor; and with the sun low nothing had a shadow under it, so whatever stood on the
 * floor seemed to hang over it. Build 15 (the owner's reference) had a soft dark patch under every man.
 *   CREW101: crew71's tune for the building stages (every man near the work a real figure, kept as the camera turns; crowd.js's people too)
 *   LIGHT101: the working light — a warm morning sun, higher than the dusk's (short shadows that meet their feet), not noon's flat white
 *   blob101(r, k): a soft round contact shadow (a flat disc, its own canvas gradient), r amot across its radius, k its darkness
 *   jar101({ h, clay, handles }): a clay jar turned on the wheel (a lathe of a real store jar's profile: a ring foot, the shoulder, a neck
 *     ring, a rolled rim; two handles), standing on its foot at y 0, h amot high, its contact shadow under it
 *   pile101({ n, len, w, stone, wood }): building stones as the crews leave them — dressed blocks laid on two timber skids (not a box), each a
 *     touch askew, the top course shorter; its contact shadow
 *   table101({ wood }) a scribe's low table (a board on two trestles) · stool101({ wood })
 * Never a Divine Name. ── /build 101 ── */
import * as THREE from 'three';

export const CREW101 = Object.freeze({ n: 36, near: 150, keep: 175, behind: -1e9, clear: 2, crowd: 1 });

/** the working light, as main.js's TIMES and GRADE take it (an hour or two after sunrise, the sun in the south-east, warm) */
export const LIGHT101 = Object.freeze({
  time: Object.freeze({ el: 34, az: 125, sun: '#FFD9A6', sunI: 3.0, hs: '#D9D3C6', hg: '#C9A878', hI: 0.6, envI: 0.45, top: '#5683C0', hor: '#F0DCC0', bot: '#D2BE9A', fog: '#EADBC4', exp: 0.84, smoke: '#E6DFD5', fire: 90, bloom: 0.18, bloomT: 1.9, night: false }),
  grade: Object.freeze({ fogN: 600, fogF: 8000, sat: 1.12, gain: Object.freeze([1.06, 1.0, 0.9]), lift: Object.freeze([0.012, 0.006, 0.0]), vig: 0.16 }),
});

let TEX = null;
function tex() {
  if (TEX) return TEX;
  try {
    if (typeof document === 'undefined') return null;
    const cv = document.createElement('canvas'); cv.width = cv.height = 64; const c = cv.getContext('2d');
    const g = c.createRadialGradient(32, 32, 2, 32, 32, 31); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(0.45, 'rgba(0,0,0,0.75)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(0, 0, 64, 64); TEX = new THREE.CanvasTexture(cv);
  } catch (e) { TEX = null; }
  return TEX;
}
const MATS = new Map();
/** a contact shadow: a flat soft disc to lie at a thing's foot (its parent's y 0), r amot, k 0…1 dark */
export function blob101(r = 0.6, k = 0.45) {
  const key = Math.round(k * 100); let m = MATS.get(key);
  if (!m) { m = new THREE.MeshBasicMaterial({ color: '#000000', map: tex(), transparent: true, opacity: k, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2 }); MATS.set(key, m); }
  const d = new THREE.Mesh(new THREE.CircleGeometry(r, 20), m); d.rotation.x = -Math.PI / 2; d.position.y = 0.03; d.renderOrder = 1; d.name = 'blob101'; d.userData.blob101 = 1;
  d.castShadow = false; d.receiveShadow = false; d.raycast = () => {};
  return d;
}

/* ── the loose things of the work, modeled (the owner: "השמן נראה קטוע ומודבק"; the step stones read as a crate) ── */
const rnd101 = (seed) => { let x = seed | 0 || 1; return () => { x = (x * 16807) % 2147483647; return (x - 1) / 2147483646; }; };
const CLAY = new Map();
function clayMat(hex) { let m = CLAY.get(hex); if (!m) { m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.82, metalness: 0 }); CLAY.set(hex, m); } return m; }
/** a store jar: its profile (radius, height) in units of its height */
export const JAR101 = Object.freeze({
  profile: Object.freeze([[0, 0], [0.13, 0], [0.15, 0.025], [0.13, 0.05], [0.22, 0.14], [0.31, 0.32], [0.33, 0.46], [0.3, 0.6], [0.2, 0.72], [0.12, 0.79], [0.1, 0.84], [0.115, 0.86], [0.1, 0.88], [0.1, 0.94], [0.135, 0.97], [0.14, 1], [0.11, 1], [0.09, 0.95]]),
});
export function jar101(o = {}) {
  const h = o.h || 1.6, g = new THREE.Group(); g.name = 'jar101';
  const m = clayMat(o.clay || '#A9683F'), pts = JAR101.profile.map(([r, y]) => new THREE.Vector2(r * h, y * h));
  const body = new THREE.Mesh(new THREE.LatheGeometry(pts, 28), m); body.castShadow = true; body.receiveShadow = true; g.add(body);
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.315 * h, 0.006 * h, 6, 40), clayMat('#7E4A2B')); band.rotation.x = Math.PI / 2; band.position.y = 0.5 * h; g.add(band);   // (a painted band on the shoulder)
  if (o.handles !== false) for (const sx of [-1, 1]) {
    const hd = new THREE.Mesh(new THREE.TorusGeometry(0.075 * h, 0.018 * h, 8, 14, Math.PI * 1.1), m); hd.position.set(sx * 0.215 * h, 0.66 * h, 0); hd.rotation.set(0, sx > 0 ? 0 : Math.PI, -0.35 * sx); hd.castShadow = true; g.add(hd);
  }
  g.add(blob101(0.36 * h, 0.5));
  return g;
}
/** building stones on two skids: n stones (len × w × w), in courses of up to three */
export function pile101(o = {}) {
  const n = o.n || 9, len = o.len || 2.1, w = o.w || 0.48, g = new THREE.Group(); g.name = 'pile101'; const R = rnd101(o.seed || 7);
  const wood = o.wood || new THREE.MeshStandardMaterial({ color: '#8C6A45', roughness: 0.9 }), stone = o.stone || new THREE.MeshStandardMaterial({ color: '#D3C3A0', roughness: 0.9 });
  const per = 3, rows = Math.ceil(n / per), sk = 0.16, gap = 0.08, width = per * w + (per - 1) * gap;
  for (const z of [-len * 0.3, len * 0.3]) { const b = new THREE.Mesh(new THREE.BoxGeometry(width + 0.5, sk, 0.2), wood); b.position.set(width / 2 - w / 2, sk / 2, z); b.castShadow = true; b.receiveShadow = true; g.add(b); }
  let q = 0;
  for (let r = 0; r < rows && q < n; r++) {
    const inRow = Math.min(per - (r > 0 && n - q < per ? per - (n - q) : 0), n - q), off = ((per - inRow) * (w + gap)) / 2;
    for (let i = 0; i < inRow; i++, q++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(w * (0.97 + R() * 0.05), w * (0.95 + R() * 0.06), len * (0.96 + R() * 0.06)), stone);
      s.position.set(off + i * (w + gap) + (R() - 0.5) * 0.05, sk + w / 2 + r * (w + 0.01), (R() - 0.5) * 0.18); s.rotation.y = (R() - 0.5) * 0.06; s.castShadow = true; s.receiveShadow = true; g.add(s);
    }
  }
  const sh = blob101(1, 0.42); sh.scale.set((width + 0.9) / 2, len / 2 + 0.35, 1); sh.position.x = width / 2 - w / 2; g.add(sh);
  return g;
}
/** a scribe's low table: a board on two trestles, its top at y top */
export function table101(o = {}) {
  const top = o.top || 1.05, wd = o.w || 1.8, dp = o.d || 0.8, g = new THREE.Group(); g.name = 'table101';
  const wood = o.wood || new THREE.MeshStandardMaterial({ color: '#8C6A45', roughness: 0.9 });
  const b = new THREE.Mesh(new THREE.BoxGeometry(wd, 0.07, dp), wood); b.position.y = top - 0.035; b.castShadow = true; b.receiveShadow = true; g.add(b);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.07, top - 0.07, 0.07), wood); l.position.set(sx * (wd / 2 - 0.15), (top - 0.07) / 2, sz * (dp / 2 - 0.12)); l.rotation.z = sx * 0.06; l.castShadow = true; g.add(l); }
  const sc = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.5, 10).rotateZ(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#E8DCC0', roughness: 0.95 })); sc.position.set(-0.2, top + 0.05, 0.05); g.add(sc);
  const ink = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.1, 10), clayMat('#5B3A26')); ink.position.set(0.45, top + 0.05, -0.15); g.add(ink);
  const sh = blob101(1, 0.35); sh.scale.set(wd / 2 + 0.2, dp / 2 + 0.25, 1); g.add(sh);
  return g;
}
export function stool101(o = {}) {
  const h = o.h || 0.7, g = new THREE.Group(); g.name = 'stool101'; const wood = o.wood || new THREE.MeshStandardMaterial({ color: '#7A5634', roughness: 0.9 });
  const s = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.07, 0.45), wood); s.position.y = h; s.castShadow = true; g.add(s);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const l = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.06), wood); l.position.set(sx * 0.24, h / 2, sz * 0.17); g.add(l); }
  g.add(blob101(0.4, 0.35));
  return g;
}
