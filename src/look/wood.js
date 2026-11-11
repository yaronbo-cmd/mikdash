/* ── look A ── src/look/wood.js — wood, rope, iron and cloth (docs/specs/look/A-things-in-hand.md §A4): the grain along each member's
 * longest axis (box mapping by scale), knots and darker growth lines, the end grain lighter with rings; the rope's twisted strands; iron
 * dark grey with a little bright wear; cloth with its weave and soft folds (colours unchanged). The same program as the stones.
 *
 *   woodMat(THREE, tone) — tone 'new' (oak-ish) | 'old' (weathered) | 'fresh' (a cut wedge) · ropeMat(THREE, color) · ironMat(THREE)
 *   clothMat(THREE, color) · woodDetail(THREE) ── /look A ── */
import { KIND, lookMat } from './shader.js';

function rnd(seed) { let t = seed >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; }
const C = new WeakMap();
const cache = (THREE) => { let c = C.get(THREE); if (!c) { c = {}; C.set(THREE, c); } return c; };
/** the grain (grey, the grain along x): tex.js texWood's wavy lines, with darker growth lines and knots — 256², one tile 2.2 × 0.55 amot */
export function woodDetail(THREE) {
  const c0 = cache(THREE); if (c0.det) return c0.det;
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d', { willReadFrequently: true }), r = rnd(6101);
  x.fillStyle = 'rgb(140,140,140)'; x.fillRect(0, 0, S, S);
  const knots = []; for (let i = 0; i < 3; i++) knots.push([r() * S, r() * S, 4 + r() * 6]);
  for (let i = 0; i < 60; i++) {
    const y = r() * S, a = r() * 6, f = 1 + Math.floor(r() * 2), l = r() < 0.3 ? 70 + r() * 30 : 105 + r() * 40, w = r() < 0.3 ? 1.6 + r() * 1.6 : 0.6 + r() * 1.2;
    for (const oy of [-S, 0, S]) {
      x.strokeStyle = `rgba(${l},${l},${l},0.5)`; x.lineWidth = w; x.beginPath();
      for (let X = 0; X <= S; X += 4) { let Y = y + oy + Math.sin((X / S) * Math.PI * 2 * f + a) * 3;
        for (const [kx, ky, kr] of knots) { const dx = X - kx, dy = Y - ky, d = Math.hypot(dx, dy); if (d < kr * 4) Y += (dy >= 0 ? 1 : -1) * (kr * 4 - d) * 0.35; }
        X ? x.lineTo(X, Y) : x.moveTo(X, Y); }
      x.stroke();
    }
  }
  for (const [kx, ky, kr] of knots) for (const ox of [-S, 0, S]) { const g = x.createRadialGradient(kx + ox, ky, 0, kx + ox, ky, kr); g.addColorStop(0, 'rgba(40,40,40,0.9)'); g.addColorStop(0.6, 'rgba(70,70,70,0.6)'); g.addColorStop(1, 'rgba(90,90,90,0)'); x.fillStyle = g; x.beginPath(); x.ellipse(kx + ox, ky, kr * 1.4, kr, 0, 0, 6.3); x.fill(); }
  const img = x.getImageData(0, 0, S, S), d = img.data; for (let i = 0; i < d.length; i += 4) { const g = (r() - 0.5) * 16; d[i] += g; d[i + 1] += g; d[i + 2] += g; }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 4;
  return (c0.det = t);
}
const WOOD = { new: '#93683F', old: '#6E5236', fresh: '#C9A274' };
export function woodMat(THREE, tone = 'new') { const c = cache(THREE), k = 'w' + tone; return c[k] || (c[k] = lookMat(THREE, KIND.wood, { color: WOOD[tone] || tone, tex: woodDetail(THREE), rough: 0.82 })); }
export function ropeMat(THREE, color = '#C9B27C') { const c = cache(THREE), k = 'r' + color; return c[k] || (c[k] = lookMat(THREE, KIND.rope, { color, rough: 0.92 })); }
export function ironMat(THREE) { const c = cache(THREE); return c.iron || (c.iron = lookMat(THREE, KIND.iron, { color: '#4A4846', rough: 0.5, metal: 0.6 })); }
export function clothMat(THREE, color = '#B8322A') { const c = cache(THREE), k = 'c' + color; return c[k] || (c[k] = lookMat(THREE, KIND.cloth, { color, rough: 0.85, side: THREE.DoubleSide })); }
