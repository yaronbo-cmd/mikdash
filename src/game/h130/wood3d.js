/* ── build 130 ── h130/wood3d.js — the wood chamber's things (brief §4, §7): the two trestles the logs are checked on, the clean pile and
 * the rejects (with the split wormy logs, wood.worm) drawn from the save, in this stage and every later one; and the act's own log: a
 * cylinder whose skin is a canvas drawn from the model's log (its bark, the strips peeled, the holes where no bark covers them, the
 * marks of the taps, the chalk line, the end faces), so what the player sees is the model's state and nothing else.
 *   WD · woodSave(st) · woodWorld(X) · woodFrame(dt, X) · woodRest(X) · logPiece(X, log, s0, s1, skin) · logSkin(X, S, o) · splitHalves(X, e)
 *   restLog(X, e, k, at, o) · trestle(X, x, z, w, parent) · pileSpot(side, n) · logY(r)
 * Every place is the book's (BOOK.s05.wood); the offsets here are sizes and the pile's own stacking.
 */
import { BOOK } from '../world/grid.js';
import { LOGS } from './model.js';

const S5 = BOOK.s05, W5 = S5.wood, F = S5.court.floor;
/** the sizes (illustration): the trestle's height under the log, its beam's span; the piles' stacking */
export const WD = Object.freeze({ TH: 1.05, SPAN: 1.3, TW: 1.1, GAP: 0.06, ROW: 5, NEXT: 6.6, DIR: Object.freeze([-0.3, -0.95]) });
/** the checking log's axis on the trestles: across the act's view, which looks along DIR (toward the chamber's north-west corner: the
 *  kohen's stand then lies left of the log and no nearer the camera, the clean pile to the right) → { dir, U (the log's axis), N (its
 *  horizontal normal), yaw (the group's turn that lays its local x along U) } */
export const AX = (() => { const L = Math.hypot(WD.DIR[0], WD.DIR[1]), d = [WD.DIR[0] / L, WD.DIR[1] / L], U = [-d[1], d[0]]; return Object.freeze({ dir: d, U, N: [-U[1], U[0]], yaw: Math.atan2(-U[1], U[0]) }); })();
/** the log's centre height when it lies on the trestles */
export const logY = (r) => F + WD.TH + r;
const SH = { root: null, key: '', X: null };

/** the wood's part of the save: { clean: [e], out: [e], split: [e], w: the work in hand }; e = { lv, i, s0, s1, cut } */
export function woodSave(st) {
  const w = st.wood || (st.wood = {});
  for (const k of ['clean', 'out', 'split']) if (!Array.isArray(w[k])) w[k] = [];
  return w;
}

/* ───────── materials ───────── */
function mats(X) {
  const P = X.props, T = X.THREE;
  if (P.M.w5bark) return P.M;
  const std = (c, o = {}) => new T.MeshStandardMaterial({ color: c, roughness: 0.9, flatShading: false, ...o });
  P.M.w5bark = std('#6E5034');
  P.M.w5barkD = std('#55402C');
  P.M.w5trestle = std('#8A6640', { flatShading: true });
  P.M.w5face = std('#D8B77E');
  P.M.w5worm = std('#3A2614');
  P.M.w5green = new T.MeshBasicMaterial({ color: 0x4FC46A, transparent: true, opacity: 0.8, depthWrite: false });
  P.M.w5chalk = new T.MeshBasicMaterial({ color: 0xF4EEDC });
  return P.M;
}
const bx = (X, mat, cx, cy, cz, sx, sy, sz, parent, ry = 0, rz = 0) => {
  const m = new X.THREE.Mesh(X.props.geo.box, mat); m.scale.set(sx, sy, sz); m.position.set(cx, cy, cz); m.rotation.y = ry; m.rotation.z = rz;
  m.castShadow = true; m.receiveShadow = true; parent.add(m); return m;
};
/** a trestle (a sawhorse): its beam across the log's line (along z) at the trestles' height, two splayed legs each side */
export function trestle(X, x, z, w = WD.TW, parent, yaw = 0) {
  const M = mats(X), g = new X.THREE.Group(); g.position.set(x, 0, z); g.rotation.y = yaw;
  bx(X, M.w5trestle, 0, F + WD.TH - 0.07, 0, 0.16, 0.14, w, g);
  for (const e of [-1, 1]) for (const k of [-1, 1]) bx(X, M.w5trestle, k * 0.18, F + (WD.TH - 0.1) / 2, e * (w / 2 - 0.12), 0.09, WD.TH - 0.08, 0.09, g, 0, -k * 0.32);
  parent.add(g); return g;
}

/* ───────── the log's skin: a canvas drawn from the model (u along the log, v round it) ───────── */
const CW = 512, CH = 256;
const seeded = (id) => { let s = 0; for (const c of String(id)) s = (s * 31 + c.charCodeAt(0)) % 2147483647; s = s || 7; return () => { s = (s * 16807) % 2147483647; return s / 2147483647; }; };
const n360 = (a) => ((a % 360) + 360) % 360;
/** the angle bands [a0, a1] (degrees, may wrap) as canvas rows */
const rows = (a0, a1) => { const A = n360(a0), B = n360(a1); return A <= B ? [[A, B]] : [[A, 360], [0, B]]; };
/**
 * the skin of a log in the act's hands S (model.logFresh): o = { taps: [{ s, ang, hollow }], chalk: s | null }. Returns { tex, draw() }.
 * Drawn again after each change (peel, tap, chalk); the grain is a fixed function of the log's id (rule 56).
 */
export function logSkin(X, S, o = {}) {
  const T = X.THREE, cv = document.createElement('canvas'); cv.width = CW; cv.height = CH;
  const g = cv.getContext('2d'), log = S.log, L = log.L;
  const sx = (s) => (s / L) * CW, ay = (a) => (n360(a) / 360) * CH;
  const tex = new T.CanvasTexture(cv); try { tex.colorSpace = T.SRGBColorSpace; } catch (e) { /* */ }
  tex.anisotropy = 4;
  function draw() {
    const R = seeded(log.id);
    // the outer skin: weathered wood with a thin bark, its grain along the log
    g.fillStyle = '#8C6A46'; g.fillRect(0, 0, CW, CH);
    for (let k = 0; k < 90; k++) { const y = R() * CH, x = R() * CW, w = 40 + R() * 160; g.fillStyle = R() < 0.5 ? 'rgba(60,40,22,0.35)' : 'rgba(170,135,95,0.3)'; g.fillRect(x, y, w, 1 + R() * 2.5); }
    // (knots: long, soft and brown along the grain — never a dark round dot, which is the worm's)
    for (let k = 0; k < 18; k++) { const x = R() * CW, y = R() * CH; g.fillStyle = 'rgba(105,74,44,0.55)'; g.beginPath(); g.ellipse(x, y, 10 + R() * 12, 2 + R() * 2, 0, 0, Math.PI * 2); g.fill(); }
    // the thick bark plates (level 2: what hides the worm)
    for (const b of log.bark) for (const [a0, a1] of rows(b.a0, b.a1)) {
      const x0 = sx(b.s0), x1 = sx(b.s1), y0 = ay(a0), y1 = a1 === 360 ? CH : ay(a1);
      g.fillStyle = '#4A3420'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      for (let k = 0; k < 40; k++) { g.fillStyle = R() < 0.5 ? 'rgba(25,16,8,0.6)' : 'rgba(110,80,50,0.45)'; g.fillRect(x0 + R() * (x1 - x0), y0 + R() * (y1 - y0), 2 + R() * 18, 1 + R() * 2); }
    }
    // the strips peeled: fresh pale wood
    for (const p of S.peeled) for (const [a0, a1] of rows(p.a0, p.a1)) {
      const x0 = sx(Math.max(0, p.s0)), x1 = sx(Math.min(L, p.s1)), y0 = ay(a0), y1 = a1 === 360 ? CH : ay(a1);
      g.fillStyle = '#E2C58E'; g.fillRect(x0, y0, x1 - x0, y1 - y0);
      g.strokeStyle = 'rgba(120,80,40,0.6)'; g.lineWidth = 1.5; g.strokeRect(x0, y0, x1 - x0, y1 - y0);
    }
    // the worm's holes where no bark covers them, each with its ring of pale wood dust (the eye finds them by the dust)
    const covered = (h) => log.bark.some((b) => h.s >= b.s0 && h.s <= b.s1 && rows(b.a0, b.a1).some(([a, c]) => n360(h.ang) >= a && n360(h.ang) <= c)) && !S.peeled.some((p) => h.s >= p.s0 && h.s <= p.s1 && rows(p.a0, p.a1).some(([a, c]) => n360(h.ang) >= a && n360(h.ang) <= c));
    for (const h of log.holes) {
      if (covered(h)) continue;
      const x = sx(h.s), y = ay(h.ang);
      g.fillStyle = 'rgba(246,230,186,0.92)'; g.beginPath(); g.ellipse(x, y, 20, 14, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#0E0803'; g.beginPath(); g.ellipse(x, y, 7, 6, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#0E0803'; g.beginPath(); g.ellipse(x + 12, y - 5, 3.5, 3, 0, 0, Math.PI * 2); g.fill();
    }
    // the taps: a pale smudge of dust where it rang hollow, a small dent where it was deep
    for (const t of o.taps || []) {
      const x = sx(t.s), y = ay(t.ang);
      if (t.hollow) { g.fillStyle = 'rgba(245,232,200,0.75)'; g.beginPath(); g.ellipse(x, y, 11, 16, 0, 0, Math.PI * 2); g.fill(); g.fillStyle = 'rgba(245,232,200,0.5)'; g.fillRect(x - 2, y, 4, 28); }
      else { g.fillStyle = 'rgba(40,26,12,0.55)'; g.beginPath(); g.ellipse(x, y, 4, 6, 0, 0, Math.PI * 2); g.fill(); }
    }
    // the chalk line (level 3): all round the log at s
    if (o.chalk != null) { g.fillStyle = '#FAF6EA'; g.fillRect(sx(o.chalk) - 3, 0, 6, CH); }
    tex.needsUpdate = true;
  }
  draw();
  return { tex, draw, canvas: cv };
}

/**
 * a piece of a log, s0 … s1 of its length, along the group's local x (centred on the piece), radius r; its skin `skin` (or the plain
 * bark); its two end faces (a cut face pale with rings — the worm's dark tunnel where the hollow reaches it). → THREE.Group { mesh }
 */
export function logPiece(X, log, s0, s1, skin = null) {
  const T = X.THREE, M = mats(X), r = log.r, L = log.L, n = 28, m = 8, len = s1 - s0;
  const pos = [], uv = [], idx = [];
  for (let j = 0; j <= m; j++) for (let i = 0; i <= n; i++) {
    const s = s0 + (len * j) / m, th = (i / n) * Math.PI * 2;
    // (the bark's lumps: a fixed wobble of the radius round the log)
    const rr = r * (1 + 0.025 * Math.sin(th * 5 + s * 3) + 0.015 * Math.sin(th * 11));
    pos.push(s - (s0 + s1) / 2, rr * Math.cos(th), rr * Math.sin(th)); uv.push(s / L, i / n);
  }
  for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) { const a = j * (n + 1) + i, b = a + n + 1; idx.push(a, a + 1, b, a + 1, b + 1, b); }
  const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
  const mat = skin ? new T.MeshStandardMaterial({ map: skin.tex, roughness: 0.9 }) : M.w5bark;
  const g = new T.Group(), side = new T.Mesh(geo, mat); side.castShadow = true; side.receiveShadow = true; g.add(side);
  const H = log.hollow;
  for (const [e, s] of [[-1, s0], [1, s1]]) {
    const f = new T.Mesh(new T.CircleGeometry(r * 0.97, 20), M.w5face); f.rotation.y = e * Math.PI / 2; f.position.x = e * len / 2; g.add(f);
    for (const k of [0.35, 0.65]) { const rg = new T.Mesh(new T.RingGeometry(r * k, r * k + 0.012, 24), M.w5barkD); rg.rotation.y = e * Math.PI / 2; rg.position.x = e * (len / 2 + 0.002); g.add(rg); }
    if (H && s >= H.s0 - 1e-6 && s <= H.s1 + 1e-6) { const w = new T.Mesh(new T.CircleGeometry(r * 0.42, 14), M.w5worm); w.rotation.y = e * Math.PI / 2; w.position.x = e * (len / 2 + 0.004); g.add(w); }
  }
  g.userData = { side, len, r, s0, s1 };
  return g;
}
/** a split wormy log: its two halves lying open, the worm's dark tunnel along them (wood.worm's mark, kept in the world) */
export function splitHalves(X, e) {
  const T = X.THREE, M = mats(X), log = LOGS[e.lv][e.i], len = (e.s1 != null ? e.s1 : log.L) - (e.s0 || 0), r = log.r, g = new T.Group();
  for (const k of [-1, 1]) {
    const half = new T.Group(); half.position.z = k * (r + 0.08); half.rotation.x = k * Math.PI / 2; g.add(half);
    const shell = new T.Mesh(new T.CylinderGeometry(r, r, len, 16, 1, false, 0, Math.PI), M.w5bark); shell.rotation.z = Math.PI / 2; shell.castShadow = true; half.add(shell);
    const face = bx(X, M.w5face, 0, 0, 0, len, 0.02, r * 2, half); face.castShadow = false;
    const tun = bx(X, M.w5worm, 0, 0.012, 0, len * 0.8, 0.02, r * 0.5, half); tun.castShadow = false;
  }
  return g;
}
/** where the n-th log of a pile lies (side 'clean' or 'out'): rows of ROW along z, each row one up and half a log in; [x, y over the
 *  floor, z] round the pile's book place; the rejects lie a little askew */
export function pileSpot(side, n, r = 0.4) {
  const at = side === 'clean' ? W5.clean : W5.out;
  const cap = (WD.ROW * (WD.ROW + 1)) / 2, pyr = Math.floor(n / cap);
  let row = 0, k = n % cap, w = WD.ROW; while (k >= w && w > 1) { k -= w; row++; w--; }
  // (the rows run from the book place back toward the north wall, away from the chamber's view: a growing pile never fills the screen)
  const d = 2 * r + WD.GAP, z = at[1] - (k + (WD.ROW - w) / 2) * d, y = r + row * d * 0.86;
  // (a full pyramid: the next one beside it — the clean pile's toward the east wall, the rejects' toward the room's middle)
  return { x: at[0] + (side === 'out' ? ((n * 7) % 5 - 2) * 0.12 : pyr * WD.NEXT), y, z: z + (side === 'out' ? pyr * WD.NEXT : 0), yaw: side === 'out' ? ((n * 3) % 5 - 2) * 0.06 : 0, row };
}
/** a log of the save (e) lying at a pile place: its piece and its plain bark */
export function restLog(X, e, at, parent) {
  const log = LOGS[e.lv] && LOGS[e.lv][e.i]; if (!log) return null;
  const s0 = e.s0 || 0, s1 = e.s1 != null ? e.s1 : log.L, g = logPiece(X, log, s0, s1, null);
  g.position.set(at.x, F + at.y, at.z); g.rotation.y = at.yaw || 0; g.rotation.x = ((e.i * 47 + e.lv * 13) % 360) * Math.PI / 180;
  parent.add(g); return g;
}

/* ───────── the world's part: the trestles and the piles from the save, in this stage and every later one ───────── */
function keyOf(W) { return [W.clean.length, W.out.length, W.split.length, (W.clean[W.clean.length - 1] || {}).i, (W.out[W.out.length - 1] || {}).i].join('|'); }
function build(X) {
  const st = X.M && X.M.st; if (!st) return;
  const W = woodSave(st), key = keyOf(W);
  if (SH.root && SH.key === key) return;
  if (SH.root) X.props.remove(SH.root);
  const T = X.THREE, g = new T.Group(); g.name = 'h130-wood'; X.props.root.add(g); SH.root = g; SH.key = key;
  const t = W5.trestles;
  for (const e of [-1, 1]) trestle(X, t[0] + AX.U[0] * e * WD.SPAN, t[1] + AX.U[1] * e * WD.SPAN, WD.TW, g, AX.yaw);
  const R = (e) => (LOGS[e.lv] && LOGS[e.lv][e.i] ? LOGS[e.lv][e.i].r : 0.4);
  const rmax = (L) => L.reduce((a, e) => Math.max(a, R(e)), 0.36);
  W.clean.forEach((e, n) => restLog(X, e, pileSpot('clean', n, rmax(W.clean)), g));
  W.out.forEach((e, n) => restLog(X, e, pileSpot('out', n, rmax(W.out)), g));
  // the split wormy logs lie open beside the rejects, toward the chamber's middle
  W.split.forEach((e, n) => { const h = splitHalves(X, e); h.position.set(W5.out[0] + 2.4 + n * 0.3, F + 0.12, W5.out[1] + 2.2 + n * 1.3); h.rotation.y = 0.2; g.add(h); });
}
/** the world hook: the wood's things drawn now (call from the stage's initWorld, and after a reload) */
export function woodWorld(X) { SH.X = X; SH.key = ''; build(X); }
let wT = 0;
/** the world hook's frame: drawn again when the save's piles changed (a decision, a split) */
export function woodFrame(dt, X) { wT -= dt; if (wT > 0) return; wT = 0.4; try { build(X); } catch (e) { console.warn('[h130] wood world', e && e.message); } }
/** the stage done, the page reloaded: the trestles and the piles as he left them */
export function woodRest(X) { woodWorld(X); }
