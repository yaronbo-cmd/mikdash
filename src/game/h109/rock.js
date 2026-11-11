/* ── build 114 ── h109/rock.js — a big rock of the Mount that really splits along its crack (ירון 9.11: "תעשה שקווי הבקיעה יהיו
 * תואמים את הסלע ושהבקיעה תיעשה בהתאם לקו"; "הכתם בכלל מחוץ לסלע"; "הסלע נבקע בכלל במקום שונה לחלוטין מהכתם").
 * While the rock is read it stands in for the world's boulder (stages.boulderHide): one mesh, bedded a fifth into the hill, of the
 * boulders' own rock colour. Its crack is a plane through it: the line on its face is where that plane meets the surface (found by
 * rays at this very mesh, so it is always ON the rock), and the split cuts the mesh by that plane into two halves with a fresh-cut face
 * between them, which part like a book along it and stay on the hill until the crews drag them off for the paving.
 *
 *   const R = makeRock(THREE, { x, z, gy, r, sy, yaw, seed, mat })   R.group (in the scene by the caller) · R.whole
 *   R.plane(psi, tilt) → { n, u, w, psi, tilt } (a vertical-ish plane through the rock containing the direction at azimuth psi)
 *   R.crackPts(P, th0, th1, n) → [Vector3] along the face (bottom → top), each a hair off the surface; R.hitAt(azimuth, h) → point+normal
 *   R.halves(P) → shows the two halves (the whole hidden) · R.part(k) 0..1 → how far apart · R.dispose()
 */
import { freshMat } from '../../look/rock.js';   // ── look A ── ── /look A ──

const rnd = (seed) => { let t = (seed * 2654435761) >>> 0; return () => { t = (t + 0x6D2B79F5) >>> 0; let r = Math.imul(t ^ (t >>> 15), 1 | t); r ^= r + Math.imul(r ^ (r >>> 7), 61 | r); return ((r ^ (r >>> 14)) >>> 0) / 4294967296; }; };

export function makeRock(T, o) {
  const { x, z, gy, r } = o, sy = o.sy || 0.85, yaw = o.yaw || 0, R = rnd((o.seed | 0) + 11);
  const ph = [R() * 6.28, R() * 6.28, R() * 6.28, R() * 6.28, R() * 6.28, R() * 6.28];
  // the shape: a sphere pushed in and out by a few smooth waves (the same at every shared corner: no gaps), its bottom flattened,
  // bedded a fifth of its height into the ground
  const g0 = new T.IcosahedronGeometry(1, 4), P = g0.attributes.position, v = new T.Vector3();
  // ── h117 ── (ירון 10.11 "פשוט נראה לא איכותי") more facets, and the rock's own layers: bands of a slightly different tone, by height
  const COL = new Float32Array(P.count * 3);
  for (let i = 0; i < P.count; i++) {
    v.fromBufferAttribute(P, i);
    const k = 1 + 0.11 * Math.sin(3.1 * v.x + ph[0]) * Math.sin(2.3 * v.y + ph[1]) + 0.07 * Math.sin(4.7 * v.z + ph[2]) * Math.cos(3.9 * v.x + ph[3]) + 0.05 * Math.sin(6.1 * v.y + ph[4] + 2.0 * v.z) + 0.04 * Math.sin(7.3 * v.x + ph[5]);
    v.multiplyScalar(k); v.y = Math.max(v.y, -0.62);
    v.set(v.x * r, v.y * r * sy, v.z * r * 0.94);
    // (turned by the rock's yaw)
    const c = Math.cos(yaw), s = Math.sin(yaw), X = v.x * c + v.z * s, Z = -v.x * s + v.z * c; v.x = X; v.z = Z;
    P.setXYZ(i, v.x, v.y, v.z);
    { const hh = v.y / (r * sy), band = Math.sin(hh * 9.5 + 0.9 * Math.sin(v.x * 1.7 / r + ph[5]) + ph[2]), fl = 0.5 + 0.5 * Math.sin(v.x * 5.3 / r + v.z * 4.1 / r + ph[4]) * Math.sin(v.y * 6.7 / r + ph[1]);
      const f = 0.86 + 0.07 * band + 0.06 * fl - 0.08 * Math.max(0, -hh - 0.25);   // (darker by the ground: soil and shade)
      COL[i * 3] = f * 1.01; COL[i * 3 + 1] = f; COL[i * 3 + 2] = f * 0.97; }
  }
  g0.setAttribute('color', new T.BufferAttribute(COL, 3));
  g0.computeVertexNormals();
  const cy = gy - r * sy * 0.2;   // the centre: a fifth of the height in the hill
  const group = new T.Group(); group.position.set(x, cy, z); group.name = 'h109-bigrock';
  const mat0 = o.mat || new T.MeshStandardMaterial({ color: '#BDB197', roughness: 0.96, flatShading: true });
  const mat = mat0.vertexColors ? mat0 : (mat0.userData.vc || (mat0.userData.vc = Object.assign(mat0.clone(), { vertexColors: true })));   // ── /h117 ──
  const whole = new T.Mesh(g0, mat); whole.castShadow = true; whole.receiveShadow = true; group.add(whole);
  const C = new T.Vector3(x, cy, z);
  const ray = new T.Raycaster();
  const tmpO = new T.Vector3(), tmpD = new T.Vector3();
  /** the surface where a ray from far out along dir (world, unit) toward the centre (+ off) meets the rock: { p, n } | null */
  function hitDir(dir, off) {
    group.updateMatrixWorld(true);
    tmpO.copy(C).add(off || tmpD.set(0, 0, 0)).addScaledVector(dir, r * 3);
    const d = dir.clone().negate(); ray.set(tmpO, d); ray.far = r * 4;
    const h = ray.intersectObject(whole, false)[0]; if (!h) return null;
    const n = h.face ? h.face.normal.clone().transformDirection(whole.matrixWorld) : dir.clone();
    return { p: h.point.clone(), n };
  }
  function plane(psi, tilt = 0) {
    const n0 = new T.Vector3(-Math.sin(psi), 0, Math.cos(psi)), up = new T.Vector3(0, 1, 0);
    const n = n0.clone().multiplyScalar(Math.cos(tilt)).addScaledVector(up, Math.sin(tilt)).normalize();
    const u = new T.Vector3(Math.cos(psi), 0, Math.sin(psi));   // (n·u = 0)
    const w = new T.Vector3().crossVectors(n, u).normalize(); if (w.y < 0) w.negate();
    return { n, u, w, psi, tilt };
  }
  /** the crack's line on the face toward u: rays in the plane from θ0 (by the ground) to θ1 (over the top), bottom → top */
  function crackPts(Pl, th0 = -0.25, th1 = 1.35, n = 16) {
    const out = [];
    for (let i = 0; i <= n; i++) {
      const th = th0 + ((th1 - th0) * i) / n, dir = Pl.u.clone().multiplyScalar(Math.cos(th)).addScaledVector(Pl.w, Math.sin(th)).normalize();
      const h = hitDir(dir); if (!h || h.p.y < gy - 0.05) continue;
      out.push(h.p.addScaledVector(h.n, 0.05));
    }
    return out;
  }
  /** the face at azimuth a, height h over the ground: { p, n } | null */
  function hitAt(a, h) { const dir = new T.Vector3(Math.cos(a), 0, Math.sin(a)); return hitDir(dir, tmpD.set(0, gy + h - cy, 0)); }

  /* ── the two halves: the mesh's corners on the far side of the plane moved onto it, and the cut face filled ── */
  let H = null;
  function halves(Pl) {
    if (H) return H;
    const n = Pl.n;
    const mk = (side) => {
      const g = g0.clone(), Q = g.attributes.position;
      for (let i = 0; i < Q.count; i++) { v.fromBufferAttribute(Q, i); const d = v.dot(n); if (d * side < 0) v.addScaledVector(n, -d); Q.setXYZ(i, v.x, v.y, v.z); }
      g.computeVertexNormals();
      const m = new T.Mesh(g, mat); m.castShadow = true; m.receiveShadow = true; return m;
    };
    // the cut: the section's outline (rays in the plane all round), a fan of fresh-cut rock
    const ring = []; for (let i = 0; i < 40; i++) { const th = (i / 40) * Math.PI * 2, dir = Pl.u.clone().multiplyScalar(Math.cos(th)).addScaledVector(Pl.w, Math.sin(th)); const h = hitDir(dir); if (h) ring.push(h.p.sub(C)); }
    const cutMat = freshMat(T, mat.userData.lookTex || null, { side: T.DoubleSide });   // ── look A ── the fresh break: near-white cream, clean ── /look A ──
    const capG = (side) => { const pos = []; for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; pos.push(0, 0, 0, a.x, a.y, a.z, b.x, b.y, b.z); } const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.computeVertexNormals(); const m = new T.Mesh(g, cutMat); m.position.addScaledVector(n, side * 0.01); return m; };
    const A = new T.Group(), B = new T.Group();
    A.add(mk(-1)); A.add(capG(-1)); B.add(mk(1)); B.add(capG(1));
    group.add(A); group.add(B); whole.visible = false;
    H = { A, B, n: n.clone(), u: Pl.u.clone(), k: 0 };
    return H;
  }
  /** how far apart, 0..1: a hand's width at the creak, the full parting at 1 (each half tips out on its bottom edge) */
  function part(k) {
    if (!H) return; H.k = k;
    const d = r * 0.05 * Math.min(1, k * 4) + r * 0.09 * Math.max(0, k - 0.25) / 0.75, tip = 0.1 * Math.max(0, k - 0.25) / 0.75;
    H.A.position.copy(H.n).multiplyScalar(-d); H.B.position.copy(H.n).multiplyScalar(d);
    H.A.setRotationFromAxisAngle(H.u, tip); H.B.setRotationFromAxisAngle(H.u, -tip);
  }
  function dispose() { if (group.parent) group.parent.remove(group); group.traverse((c) => { if (c.geometry) c.geometry.dispose(); if (c.material && c.material !== mat && !c.material.userData.lookBase && c.material.dispose) c.material.dispose(); }); }
  return { group, whole, C, r, sy, gy, plane, crackPts, hitAt, hitDir, halves, part, dispose, get split() { return H; } };
}
