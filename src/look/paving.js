/* ── look A ── src/look/paving.js — the paving slabs (docs/specs/look/A-things-in-hand.md §A2): chamfered slabs of the stone system in
 * 4 tone families (a smooth-worn top, rough-pecked sides), the broken slab's real crack, the earth bed under a quarter being laid (darker than the slabs, so the joints read), and
 * the light dust in a finished quarter's joints (it reads as one floor).
 *   paveSlab(THREE, w, d, o) → Group (userData.body: the slab) · o.cracked, o.seed, o.seam (the crack's material), o.y (top height 0.34)
 *   paveQuarter(THREE, tiles, o) → Mesh: tiles [[cx, cz, w, d]] (world), o.y (the slabs' middle), o.box ([x0, z0, size]) for the dust
 *   paveBed(THREE, x0, z0, size, y) → the earth bed under a quarter being laid
 * JOINT: the gap between neighbouring slabs (amot). ── /look A ── */
import { slabGeo, slabOf, slabMat, slabTint, crackGeo } from './stone.js';
import { lookClone } from './shader.js';

export const JOINT = 0.06;
const H = 0.34;
let nS = 0;
export function paveSlab(THREE, w, d, o = {}) {
  const seed = o.seed ?? (++nS) * 2.71 + 0.3, g = new THREE.Group();
  const m = new THREE.Mesh(slabGeo(THREE, w, H, d), slabOf(THREE, seed)); m.castShadow = true; m.receiveShadow = true; g.add(m); g.userData.body = m;
  if (o.cracked) {
    // the break: a jagged dark line right across the top, a hair over it (seen from the play camera)
    const len = Math.hypot(w, d) * 0.92, c = new THREE.Mesh(crackGeo(THREE, len, seed), o.seam || new THREE.MeshBasicMaterial({ color: 0x2A1D12 }));
    c.rotation.y = -Math.atan2(d, w) * 0.85; c.position.y = H / 2 + 0.006; c.renderOrder = 2; g.add(c);
  }
  return g;
}
/** a laid quarter as one mesh: each slab its own tone (vertex colours), the joints' light dust under them */
export function paveQuarter(THREE, tiles, o = {}) {
  const geos = []; const col = new THREE.Color();
  tiles.forEach(([cx, cz, w, d], i) => {
    const g = slabGeo(THREE, w, H, d); g.translate(cx, o.y || 0, cz);
    col.set(slabTint((o.seed || 1) * 31 + i * 7.3));
    const n = g.attributes.position.count, c = new Float32Array(n * 3); for (let k = 0; k < n; k++) { c[k * 3] = col.r; c[k * 3 + 1] = col.g; c[k * 3 + 2] = col.b; }
    g.setAttribute('color', new THREE.BufferAttribute(c, 3)); geos.push(g);
  });
  let n = 0; for (const g of geos) n += g.attributes.position.count;
  const A = { position: new Float32Array(n * 3), normal: new Float32Array(n * 3), color: new Float32Array(n * 3), uv: new Float32Array(n * 2) }; let k = 0;
  for (const g of geos) { for (const key of Object.keys(A)) A[key].set(g.attributes[key].array, k * g.attributes[key].itemSize); k += g.attributes.position.count; g.dispose(); }
  const geo = new THREE.BufferGeometry(); for (const key of Object.keys(A)) geo.setAttribute(key, new THREE.BufferAttribute(A[key], key === 'uv' ? 2 : 3));
  geo.computeBoundingSphere();
  const mat = quarterMat(THREE), m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true;
  if (o.box) {
    const [x0, z0, S] = o.box, dust = new THREE.Mesh(new THREE.PlaneGeometry(S, S).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#D6CCB8', roughness: 1 }));
    dust.position.set(x0 + S / 2, (o.y || 0) + H / 2 - 0.05, z0 + S / 2); dust.receiveShadow = true; m.add(dust);
    m.userData.dust = dust;
  }
  return m;
}
const QM = new WeakMap();
function quarterMat(THREE) {
  let m = QM.get(THREE); if (m) return m;
  m = lookClone(slabMat(THREE), '#ffffff'); m.vertexColors = true; m.userData.lookBase = true; QM.set(THREE, m); return m;
}
/** the bed under a quarter while it is laid: earth, darker than the slabs, so the joints read */
export function paveBed(THREE, x0, z0, S, y) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(S + 0.2, S + 0.2).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#8C7A62', roughness: 1 }));
  m.position.set(x0 + S / 2, y, z0 + S / 2); m.receiveShadow = true; return m;
}
