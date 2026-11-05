/* ── build 101 ── world101.js — THE WORLD'S FOUNDATION (the owner, 4.11 23:55 and 5.11 00:01, after playing 98–100: "דמות כפולה שהולכת
 * בהבהוב… המדרגות עומדות באוויר… כל 5 שניות עולה דמות ונבלעת לתוך האדמה… נראה שהעולם בגרסאות הראשונות היה יותר אמין ויפה"; he chose
 * "בסיס לעולם קודם" at 01:18). What was found: the world's crews are actors.js's instanced figures, and only the ten nearest the camera
 * were drawn as real people (crew71.js) — a man swapped between the two as the camera moved (the doubled, blinking figure); the life layer's
 * plasterers and sweepers came and went through the floor; and with the sun low nothing had a shadow under it, so whatever stood on the
 * floor seemed to hang over it. Build 15 (the owner's reference) had a soft dark patch under every man.
 *   CREW101: crew71's tune for the building stages (every man near the work a real figure, kept as the camera turns)
 *   LIGHT101: the working light — a warm morning sun, higher than the dusk's (short shadows that meet their feet), not noon's flat white
 *   blob101(r, k): a soft round contact shadow (a flat disc, its own canvas gradient), r amot across its radius, k its darkness
 * Never a Divine Name. ── /build 101 ── */
import * as THREE from 'three';

export const CREW101 = Object.freeze({ n: 36, near: 150, keep: 175, behind: -1e9, clear: 2 });

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
