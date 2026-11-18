/* ── build 131 ── h131/frame3d.js — the frame-and-finale lane's own things in the world (THE FRAME-AND-FINALE LANE'S FILE). world.js
 * calls these hooks; owns() is true: this file draws the frame (the core leaves its plain frame out).
 *   · the frame on the witness's stakes once its first work is done (or the crews built the stage), until the finale takes it down:
 *     four boards of 32 an amah high round the altar's edge (רש"י זבחים נד ע"א), their thickness outside it; a board cracked by a
 *     diagonal pushed in by force ('frame.crack', its n the side) stands replaced in another shade, for good (rule 55)
 *   · while a frame work runs, the act draws its own moving frame (SHF.act): the world's is left out; while the finale has taken the
 *     frame down (its work past the first step, or done), none
 *   FRAME3D = { init(X, M), sync(X, M) (every 0.5 s), frame(dt, X, M), rest(X, M), owns() }
 *   SHF · fmats(X) · beamMesh(X, mat, parent) · setBeam(mesh, a, b, c, y0, y1) · ringMesh(X, mat, r, parent) · pegMesh(X, parent)
 */
import { BOOK } from '../world/grid.js';
import { crackSide, SIDES, STAKE } from './frame-model.js';
import { LOOK_RING_K } from '../world/look.js';

const S8 = BOOK.s08, F = S8.floor, T8 = S8.frame.T;
export const SHF = { X: null, g: null, key: '', act: false, finale: false };

// (its own materials beside the core's in the props' table — world.js mats() — never importing world.js: it imports this file)
export function fmats(X) {
  const M = X.props.M, T = X.THREE;
  if (M.y8woodR) return M;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.86, flatShading: true, ...o });
  if (!M.y8wood) M.y8wood = std('#9A6E42', { roughness: 0.85 });
  if (!M.y8woodD) M.y8woodD = std('#6E4A2A', { roughness: 0.88 });
  M.y8frame = std('#A57848');                 // the frame's boards (fresh-cut, a little paler than the timbers)
  M.y8woodR = std('#DCC9A4');                 // a cracked board replaced: another shade, for good
  M.y8crack = new T.MeshBasicMaterial({ color: 0x2A1A0C });
  M.y8green = new T.MeshBasicMaterial({ color: 0x4FC46A, transparent: true, opacity: 0.85, depthWrite: false });
  M.y8amber = new T.MeshBasicMaterial({ color: 0xF0B040, transparent: true, opacity: 0.9, depthWrite: false });
  M.y8red = new T.MeshBasicMaterial({ color: 0xE04A30, transparent: true, opacity: 0.9, depthWrite: false });
  M.y8peg = std('#5A3C22');
  M.y8lime = std('#F4F1E8', { roughness: 0.95 });
  M.y8cloth = std('#E9E2D0', { roughness: 1, side: T.DoubleSide });
  M.y8clay = std('#A8643A', { roughness: 0.8 });
  M.y8water = new T.MeshStandardMaterial({ color: '#8FB8D8', roughness: 0.08, metalness: 0.1, transparent: true, opacity: 0.62, depthWrite: false });
  return M;
}
/** a board: a box mesh laid by setBeam */
export function beamMesh(X, mat, parent) { const m = new X.THREE.Mesh(X.props.geo.box, mat); m.castShadow = true; m.receiveShadow = true; (parent || X.props.root).add(m); return m; }
/** a board from corner a to corner b ([x, z]), its thickness on the side away from c (the frame's middle), y0 … y1 */
export function setBeam(m, a, b, c, y0 = F, y1 = S8.frame.y1, t = T8) {
  const dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz) || 1e-3, ux = dx / L, uz = dz / L;
  let nx = -uz, nz = ux; const mx = (a[0] + b[0]) / 2, mz = (a[1] + b[1]) / 2;
  if (c && (c[0] - mx) * nx + (c[1] - mz) * nz > 0) { nx = -nx; nz = -nz; }
  m.scale.set(L + t * 2, y1 - y0, t); m.position.set(mx + nx * t / 2, (y0 + y1) / 2, mz + nz * t / 2); m.rotation.set(0, Math.atan2(-dz, dx), 0);
  return m;
}
/** a flat ring on the floor (a stake's green target, a corner's mark) */
export function ringMesh(X, mat, r = 0.9, parent) { const T = X.THREE, m = new T.Mesh(new T.RingGeometry(r * 0.72, r, 28), mat); m.rotation.x = -Math.PI / 2; m.renderOrder = 6; (parent || X.props.root).add(m); return m; }
/** a peg driven at a corner (המחשה): a short square post with a cut head */
export function pegMesh(X, parent) {
  const T = X.THREE, M = fmats(X), g = new T.Group();
  const post = new T.Mesh(X.props.geo.box, M.y8peg); post.scale.set(0.34, 1.7, 0.34); post.position.y = 0.85; post.castShadow = true; g.add(post);
  const head = new T.Mesh(X.props.geo.box, M.y8woodD || M.y8peg); head.scale.set(0.46, 0.18, 0.46); head.position.y = 1.75; g.add(head);
  (parent || X.props.root).add(g); return g;
}

/* ───────── the frame in the world, from the save ───────── */
const has = (M, id) => !!M && M.isDone(id);
function finaleTook(M) { if (!M) return false; if (has(M, 'finale')) return true; const w = M.workOf('finale'); return !!(w && w.step && w.step !== 'down'); }
function build(X, M) {
  const g = SHF.g; if (!g) return;
  const st = M && M.st, cracks = (M ? M.marksOf('frame.crack') : []).map((m) => crackSide(m.n));
  const show = !!st && (has(M, 'frame1') || st.crews) && !SHF.act && !SHF.finale && !finaleTook(M);
  const key = [show, cracks.join('')].join('|'); if (key === SHF.key) return; SHF.key = key;
  while (g.children.length) g.remove(g.children[0]);
  if (!show) return;
  const Mt = fmats(X), c = S8.mid;
  for (const [s, [ka, kb]] of Object.entries(SIDES)) setBeam(beamMesh(X, cracks.includes(s) ? Mt.y8woodR : Mt.y8frame, g), STAKE[ka], STAKE[kb], c);
}
export const FRAME3D = {
  owns: () => true,
  init(X, M) { fmats(X); SHF.X = X; if (!SHF.g) { const g = new X.THREE.Group(); g.name = 'h131-frame'; X.props.root.add(g); SHF.g = g; } SHF.key = ''; build(X, M); },
  sync(X, M) { if (!SHF.g) FRAME3D.init(X, M); else build(X, M); },
  rest(X, M) { FRAME3D.init(X, M); },
  frame() {},
};
/** the act's hold on the world's frame: on while a frame work draws its own, or the finale has taken it down */
export function frameHold(k, on) { SHF[k] = !!on; SHF.key = ''; if (SHF.X) build(SHF.X, SHF.X.M); }
/** ── b131 look round ── (rule 7: nothing but the work's own things in a work's frames) while a frame work or the finale runs, the
 *  site's pile of the pit's stones and the cold hearth stand out of the picture (world.js's 'h131-site'); back when it ends */
/** ── b131 (the owner's figure rule) the figures gate's own test (h128/figgate.js) for a man the act is about to place: his standing
 *  box (3.9 by 1.1 amot) whole in the shot [eye, aim] at its lens and at the look's u 0.3 lens, held a little in from the edge, and not
 *  over the work's focus nearer the eye. whole(pose, fov, aspect, x, y, z, focus) → 'whole' | 'off' (wholly out of the picture) | 'cut' */
export function figTest(T) {
  const C = new T.PerspectiveCamera(), V = new T.Vector3(), R = 0.17; let E = 0.94;
  const wide = (f) => (2 * Math.atan((1 + LOOK_RING_K.NEAR * Math.min(1, 0.3 / LOOK_RING_K.KEEP_U0)) * Math.tan((f * Math.PI) / 360)) * 180) / Math.PI;
  function one(x, y, z, foc) {
    let x0 = 9, x1 = -9, y0 = 9, y1 = -9, out = 0, n = 0;
    for (const dy of [0, 3.9]) for (const dx of [-0.55, 0.55]) for (const dz of [-0.55, 0.55]) {
      V.set(x + dx, y + dy, z + dz).applyMatrix4(C.matrixWorldInverse); if (V.z > -0.05) { out++; continue; }
      V.applyMatrix4(C.projectionMatrix); n++; if (Math.abs(V.x) > E || Math.abs(V.y) > E) out++;
      x0 = Math.min(x0, V.x); x1 = Math.max(x1, V.x); y0 = Math.min(y0, V.y); y1 = Math.max(y1, V.y);
    }
    // (wholly out of the picture: nothing of him on the screen at all — judged at the frame's own edge, not the held-in one)
    if (!n || x1 < -1 || x0 > 1 || y1 < -1 || y0 > 1) return 'off';
    if (out) return 'cut';
    if (foc) { const d = Math.hypot(x - C.position.x, y + 1.95 - C.position.y, z - C.position.z); V.set(foc[0], foc[1], foc[2]); const fd = V.distanceTo(C.position); V.applyMatrix4(C.matrixWorldInverse);
      if (V.z < -0.05) { V.applyMatrix4(C.projectionMatrix); if (d < fd - 1 && x0 < V.x + R && x1 > V.x - R && y0 < V.y + R && y1 > V.y - R) return 'cut'; } }
    return 'whole';
  }
  // (edge: how far in from the frame's edge a man must stand, as a share of the half frame — less leaves room for him to move)
  return (P, fov, asp, x, y, z, foc, edge = 0.94) => {
    E = edge; let r = 'off', all = 'off';
    for (const f of [fov, wide(fov)]) { C.position.set(P[0][0], P[0][1], P[0][2]); C.up.set(0, 1, 0); C.lookAt(P[1][0], P[1][1], P[1][2]); C.fov = f; C.aspect = asp; C.updateProjectionMatrix(); C.updateMatrixWorld(true); r = one(x, y, z, foc); if (r === 'cut') return 'cut'; if (r === 'whole') all = 'whole'; }
    return all;
  };
}
/** (the probes' eyes) when the figures gate names a man, what the act had in hand then: globalThis.__H131_FIGDBG (at most 6) */
export function figDbg(id, more) {
  try { const G = globalThis.__FIG; const r = G && G.report ? G.report() : null; if (!r || !r.length) return; const L = (globalThis.__H131_FIGDBG = globalThis.__H131_FIGDBG || []); if (L.length >= 6) return;
    const k = JSON.stringify(r); if (L.some((q) => q.k === k)) return; L.push({ id, k, ...more() }); } catch (e) { /* */ }
}
export function siteTidy(X, on) {
  let site = null; try { site = X.props.root.getObjectByName('h131-site'); } catch (e) { site = null; } if (!site) return 0;
  const fire = S8.fire; let n = 0;
  for (const o of site.children) {
    const out = o.name === 'h131-pile' || (fire && Math.hypot(o.position.x - fire[0], o.position.z - fire[1]) < 2.2);
    if (!out) continue;
    if (on) { if (o.visible) { o.visible = false; o.userData.tidy131 = 1; } n++; }
    else if (o.userData.tidy131) { o.visible = true; delete o.userData.tidy131; }
  }
  return n;
}
