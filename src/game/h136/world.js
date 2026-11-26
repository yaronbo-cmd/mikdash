/* ── build 136 ── h136/world.js — the things of stage 13 "האולם" in the one world, drawn from the save (spec docs/specs/shlav-13-he.md
 * v4: "הסדר והחריגים", "ביצוע חוזר", "טבלת ההפסד", "המראה"). Every place from BOOK.s13. The old game's Ulam model is the stage's own
 * (stages.stageOwn('ulam'): hidden for good); this draws the Ulam as he builds it:
 *   · the twelve steps up to it; the hall's floor (y 22); the wings north and south of the hall; the front wall (x −81 … −76) in courses
 *     that stand out and sink in turn ("אפיק שפה ועייל שפה", Bava Batra 4a — the dawn's waves), with the opening (z ±10, y 22 … 62);
 *   · the walls RISE by themselves (no crews, the rule of 25.11): at the stage's start to 62 and on to 70; after works 1 and 2 to the
 *     ceiling (95) and the roof (112) — SH13.H follows st.walls with dust; over the opening the wall rises course by course with the lintels;
 *   · the Heichal's east wall (x −98 … −92, z ±35) with its door open (no doors yet: stage 14) and the four windows under the ceiling;
 *   · the five lintels on their courses (his, as he landed them: st.beams; the machine's where he has not yet), the red lime marks;
 *   · the cedar poles in their sockets (st.poles: each as he locked it, its lean), the cracks in the plaster that stay;
 *   · the golden pair of chains (once roofed) and the four crowns over the windows (lit: the ones he has seen); crushed links marked;
 *   · the crane on the steps' top; the champion's seal.
 * An act holds what moves: SH13.hang (the lintel on the hook), SH13.pole (the pole on its trolley) and SH13.lean (the sections), SH13.climb.
 *   SH13 · own(k, on) · initWorld · frameWorld · restWorld · finalWorld · floorAt13 · bandsWave(t, k)
 */
import { BOOK } from '../world/grid.js';
import { box } from '../h131/world.js';
import { mats13, beamMat, linkGeo, crownMesh } from './look.js';

const S13 = BOOK.s13, F = S13.floor, FL = S13.hallFloor, FR = S13.front, HW = S13.heichalWall, MA = S13.maltra, KS = S13.kelonsa, CH = S13.chains;
export const SH13 = { X: null, g: null, dyn: null, key: '', own: {}, M: null, refs: null, H: 22, HT: 70, hang: null, pole: null, lean: null, climb: null, scaf: null, bands: null, wave: 0 };
export function own(k, on) { if (on) SH13.own[k] = 1; else delete SH13.own[k]; SH13.key = ''; }
const clear = (G) => { for (let i = G.children.length - 1; i >= 0; i--) { const o = G.children[i]; G.remove(o); o.traverse((c) => { if (c.geometry && c.geometry !== SH13.X.props.geo.box && !c.geometry.userData.keep) c.geometry.dispose(); }); } };
/** the walls' height wanted: 70 until works 1–2 are done, then the roof */
export const wallsTarget = (M) => (M && M.roofed && M.roofed() ? FR.roof : S13.rise.then);
/** the beams standing: his (st.beams) and the machine's where he has none yet (once roofed, or the levels he has not played) */
export function beamsStanding(M) {
  const st = M.st, out = {};
  for (const [i, b] of Object.entries(st.beams || {})) out[i] = { ...b, his: 1 };
  const all = M.roofed() || M.finished();
  if (all) for (let i = 0; i < 5; i++) if (!out[i]) out[i] = { yaw: 0, dz: 0, machine: 1 };
  return out;
}
export function polesStanding(M) {
  const st = M.st, out = {};
  for (const [z, p] of Object.entries(st.poles || {})) out[z] = { ...p, his: 1 };
  if (M.roofed() || M.finished()) for (const z of KS.zs) if (!out[z]) out[z] = { d: 0, machine: 1 };
  return out;
}

/* ───────── the front wall's courses (instanced): every band its two or three pieces; the waves are their colours ───────── */
const BAND = 1.5;
function bandsBuild(X, Mt, D) {
  const T = X.THREE, segs = [];
  let k = 0;
  for (let y = F; y < FR.roof - 1e-6; y += BAND, k++) {
    const y0 = y, y1 = Math.min(FR.roof, y + BAND), out = k % 2 ? 0.14 : 0, x0 = FR.x0, x1 = FR.face + out;
    const mid = (y0 + y1) / 2;
    if (mid < FL) segs.push([x0, y0, FR.z0, x1, y1, FR.z1, k]);
    else if (mid < S13.opening.y1) { segs.push([x0, y0, FR.z0, x1, y1, -10, k]); segs.push([x0, y0, 10, x1, y1, FR.z1, k]); }
    else if (mid < MA.topCourse.y1 + 0.5) { segs.push([x0, y0, FR.z0, x1, y1, -16, k]); segs.push([x0, y0, 16, x1, y1, FR.z1, k]); }
    else segs.push([x0, y0, FR.z0, x1, y1, FR.z1, k]);
  }
  const im = new T.InstancedMesh(X.props.geo.box, Mt.y13stone, segs.length); im.name = 'h136-front'; im.castShadow = true; im.receiveShadow = true; im.frustumCulled = false;
  const c = new T.Color();
  segs.forEach((s, i) => { c.set(s[6] % 2 ? '#F1EADB' : '#E3DBC9'); im.setColorAt(i, c); });
  if (im.instanceColor) im.instanceColor.needsUpdate = true;
  D.add(im);
  SH13.bands = { im, segs, H: -1 };
  bandsAt(SH13.H, true);
}
const MTX = { m: null, q: null, p: null, s: null };
function bandsAt(H, force) {
  const B = SH13.bands; if (!B) return; if (!force && Math.abs(B.H - H) < 0.02) return; B.H = H;
  const T = SH13.X.THREE; if (!MTX.m) { MTX.m = new T.Matrix4(); MTX.q = new T.Quaternion(); MTX.p = new T.Vector3(); MTX.s = new T.Vector3(); }
  B.segs.forEach((s, i) => {
    const top = Math.min(s[4], H), h = top - s[1];
    if (h <= 0.001) { MTX.s.set(1e-4, 1e-4, 1e-4); MTX.p.set(s[0], s[1], s[2]); }
    else { MTX.s.set(s[3] - s[0], h, s[5] - s[2]); MTX.p.set((s[0] + s[3]) / 2, s[1] + h / 2, (s[2] + s[5]) / 2); }
    MTX.m.compose(MTX.p, MTX.q, MTX.s); B.im.setMatrixAt(i, MTX.m);
  });
  B.im.instanceMatrix.needsUpdate = true;
}
/** the dawn's waves: each course's light by its band and the sun's slow move (k 0 … 1: how strong) */
export function bandsWave(t, k) {
  const B = SH13.bands; if (!B || !B.im.instanceColor) return;
  const T = SH13.X.THREE, c = new T.Color(), base = new T.Color('#E8DFCC'), hi = new T.Color('#FFE2B0'), lo = new T.Color('#8F8574');
  B.segs.forEach((s, i) => {
    const out = s[6] % 2, ph = s[6] * 0.55 - t * 0.9 + ((s[2] + s[5]) / 2) * 0.03, w = Math.sin(ph);
    const lit = out ? 0.5 + 0.5 * w : 0.5 - 0.5 * w;   // (the standing-out course takes the low sun when the sunk one is in its shade, and the wave walks)
    c.copy(base).lerp(lit > 0.5 ? hi : lo, Math.abs(lit - 0.5) * 2 * k); B.im.setColorAt(i, c);
  });
  B.im.instanceColor.needsUpdate = true;
}
export function bandsPlain() { const B = SH13.bands; if (!B || !B.im.instanceColor) return; const T = SH13.X.THREE, c = new T.Color(); B.segs.forEach((s, i) => { c.set(s[6] % 2 ? '#F1EADB' : '#E3DBC9'); B.im.setColorAt(i, c); }); B.im.instanceColor.needsUpdate = true; }

/* ───────── the fixed parts ───────── */
function steps(X, Mt, D) {
  const xr = S13.steps.xr;
  for (let n = 1; n <= xr.length; n++) box(X, n % 2 ? Mt.y13stone : Mt.y13stoneB, FR.face, F, S13.steps.z0, xr[n - 1], F + 0.5 * n, S13.steps.z1, D).name = 'h136-step';
  // the landing before the front, at the hall's floor
  box(X, Mt.y13stoneB, FR.face, F, S13.steps.z0, xr[xr.length - 1], FL, S13.steps.z1, D);
}
function hallFloor(X, Mt, D) {
  const H = S13.hall;
  box(X, Mt.y13stoneB, H.x0, F, H.z0, H.x1, FL, H.z1, D).name = 'h136-hallfloor';
  box(X, Mt.y13stoneB, FR.x0, F, -10, FR.face, FL, 10, D);   // (the opening's sill)
}
function wings(X, Mt, D, H) {
  for (const w of [S13.sideWalls.n, S13.sideWalls.s]) box(X, Mt.y13stoneB, w[0], F, w[1], w[2], H, w[3], D).name = 'h136-wing';
}
function heichalWall(X, Mt, D, H) {
  const HD = S13.heichalDoor, x0 = HW.x0, x1 = HW.x1;
  box(X, Mt.y13stoneB, x0, F, HW.z0, x1, H, HD.z0, D); box(X, Mt.y13stoneB, x0, F, HD.z1, x1, H, HW.z1, D);
  if (H > HD.y1) box(X, Mt.y13stoneB, x0, HD.y1, HD.z0, x1, H, HD.z1, D);
  box(X, Mt.y13stoneB, x0, F, HD.z0, x1, HD.y0, HD.z1, D);
  // (the door open, no doors yet: the house beyond is dark)
  const T = X.THREE, dk = new T.Mesh(new T.PlaneGeometry(HD.z1 - HD.z0, HD.y1 - HD.y0), Mt.y13hole); dk.rotation.y = Math.PI / 2; dk.position.set(x0 + 0.2, (HD.y0 + HD.y1) / 2, 0); D.add(dk);
  // the windows (y 80 … 85) and the pockets for the poles (y 66) on its face
  if (H > 85) for (const w of S13.windows) { const m = new T.Mesh(new T.PlaneGeometry(w.w, w.y1 - w.y0), Mt.y13window); m.rotation.y = Math.PI / 2; m.position.set(x1 + 0.02, (w.y0 + w.y1) / 2, w.z); m.name = 'h136-window'; D.add(m); }
  if (H > KS.y + 1) for (const z of KS.zs) { const m = new T.Mesh(new T.CircleGeometry(KS.pocket.dia / 2, 14), Mt.y13hole); m.rotation.y = Math.PI / 2; m.position.set(x1 + 0.02, KS.y, z); m.name = 'h136-pocket'; D.add(m); }
}
function overOpening(X, Mt, D, top) {
  // the wall behind the lintels, over the opening, up to the last course laid (x −81 … −76, z ±16)
  if (top > S13.opening.y1 + 0.01) box(X, Mt.y13stone, FR.x0, S13.opening.y1, -16, FR.face, top, 16, D).name = 'h136-over';
}
/** the lintels standing and their courses; the scratches and the broken edges where they happened */
function lintels(X, Mt, D, M) {
  const B = beamsStanding(M), st = M.st, R = { beams: {} };
  let top = S13.opening.y1;
  for (let i = 0; i < 5; i++) {
    const be = MA.beams[i], c = MA.courses[i];
    if (!B[i] || SH13.own['beam' + i]) {
      if (SH13.own['beam' + i]) top = Math.max(top, c.y1);
      // the course under it is laid (his work comes onto it)
      if (i === 0 || B[i - 1]) box(X, Mt.y13stoneD, FR.face, c.y0, -c.half, FR.face + 0.7, c.y1, c.half, D).name = 'h136-course';
      if (!SH13.own['beam' + i]) break; else continue;
    }
    box(X, Mt.y13stoneD, FR.face, c.y0, -c.half, FR.face + 0.7, c.y1, c.half, D).name = 'h136-course';
    const T = X.THREE, m = new T.Mesh(X.props.geo.box, beamMat(X, i)); m.scale.set(0.7, be.h, be.len); m.rotation.y = -(B[i].yaw || 0);
    m.position.set(FR.face + 0.35, be.y + be.h / 2, B[i].dz || 0); m.castShadow = true; m.name = 'h136-beam'; D.add(m); R.beams[i] = m;
    top = Math.max(top, be.y + be.h);
    for (const x of st.flaws || []) if (x.f === 'maltra.scratch' && x.at === i) box(X, Mt.y13scratch, FR.face + 0.69, be.y + 0.3, (B[i].dz || 0) + be.len * 0.3, FR.face + 0.72, be.y + 0.8, (B[i].dz || 0) + be.len * 0.3 + 1.2, D).rotation.x = 0.4;
    for (const x of st.flaws || []) if (x.f === 'maltra.break' && x.at === i) box(X, Mt.y13break, FR.face + 0.4, c.y1 - 0.25, c.half - 0.9, FR.face + 0.72, c.y1 + 0.01, c.half, D);
  }
  const all5 = Object.keys(B).length >= 5 && !Object.keys(SH13.own).some((k) => k.startsWith('beam'));
  if (all5) { box(X, Mt.y13stoneD, FR.face, MA.topCourse.y0, -MA.topCourse.half, FR.face + 0.7, MA.topCourse.y1, MA.topCourse.half, D); top = Math.max(top, M.roofed() ? FR.roof : MA.topCourse.y1); }
  R.top = top;
  return R;
}
function poles(X, Mt, D, M, H) {
  if (H < KS.y + 1) return;
  const P = polesStanding(M), T = X.THREE, R = {};
  for (const z of KS.zs) {
    // the seat on the front's inner face (it moves east with the lean)
    const ln = SH13.lean ? SH13.lean.dAt(z) : (P[z] && P[z].d) || 0;
    const s = new T.Mesh(new T.CircleGeometry(KS.seat.dia / 2, 14), Mt.y13hole); s.rotation.y = -Math.PI / 2; s.position.set(FR.x0 - 0.02 + ln, KS.y, z); s.name = 'h136-seat'; D.add(s);
    if (!P[z] || SH13.own['pole' + z]) continue;
    const p = new T.Mesh(new T.CylinderGeometry(KS.r, KS.r * 1.06, KS.len, 12), Mt.y13cedar); p.rotation.z = Math.PI / 2; p.position.set((KS.lock.w + KS.lock.e) / 2 + (P[z].d || 0) / 2, KS.y, z); p.castShadow = true; p.name = 'h136-pole'; D.add(p); R[z] = p;
  }
  // the cracks: in the corners and between the lean's sections (st.flaws kelonsa.crack, and the act's live lean)
  const cracks = (M.st.flaws || []).filter((x) => x.f === 'kelonsa.crack');
  for (const c of cracks) { const zc = [-30, 0, 30][c.at] != null ? (c.at === 0 ? -29.6 : c.at === 1 ? 0.4 : 29.6) : 0; box(X, Mt.y13crack, FR.x0 - 0.03, KS.y - 6, zc - 0.06, FR.x0 + 0.01, KS.y + 5, zc + 0.06, D).name = 'h136-crack'; }
  for (const x of M.st.flaws || []) if (x.f === 'kelonsa.rim') { const m = new T.Mesh(new T.RingGeometry(KS.pocket.dia / 2, KS.pocket.dia / 2 + 0.18, 14, 1, 0, 2), Mt.y13scratch); m.rotation.y = Math.PI / 2; m.position.set(HW.x1 + 0.03, KS.y, +x.at || 0); D.add(m); }
  return R;
}
function chainsAndCrowns(X, Mt, D, M, H) {
  if (H < CH.top) return null;
  const T = X.THREE, R = { chains: [], crowns: {} };
  const n = Math.round((CH.top - CH.bottom) / CH.link);
  for (const z of CH.z) {
    const piv = new T.Group(); piv.position.set(CH.x, CH.top, z); D.add(piv);
    const im = new T.InstancedMesh(linkGeo(T), Mt.y13gold, n); im.frustumCulled = false; const m = new T.Matrix4(), q = new T.Quaternion(), e = new T.Euler();
    for (let k = 0; k < n; k++) { e.set(0, k % 2 ? Math.PI / 2 : 0, 0); q.setFromEuler(e); m.compose(new T.Vector3(0, -k * CH.link - CH.link / 2, 0), q, new T.Vector3(1, 1, 1)); im.setMatrixAt(k, m); }
    piv.add(im);
    const anchor = new T.Mesh(X.props.geo.box, Mt.y13gold); anchor.scale.set(0.9, 0.3, 0.9); anchor.position.y = -0.15; piv.add(anchor);
    R.chains.push(piv);
  }
  for (const x of M.st.flaws || []) if (x.f === 'sharsheret.link') { const m = new T.Mesh(new T.SphereGeometry(0.12, 6, 5), Mt.y13break); m.position.set(CH.x, +x.at, CH.z[0]); D.add(m); }
  for (const c of S13.crowns) { const g = crownMesh(X); g.position.set(c.x + 1.1, c.y0, c.z); g.scale.setScalar(0.9); D.add(g); g.userData.lit((M.st.crowns || []).includes(c.k)); R.crowns[c.k] = g; }
  return R;
}
function roof(X, Mt, D, H) {
  if (H < CH.top) return;
  const T = X.THREE, c = box(X, Mt.y13stoneB, S13.hall.x0, CH.top, S13.hall.z0, S13.hall.x1, CH.top + 1, S13.hall.z1, D); c.castShadow = false; c.name = 'h136-ceiling';
  if (H >= FR.roof - 0.1) { const r = box(X, Mt.y13stoneB, HW.x0, CH.top + 1, FR.z0, FR.x0, FR.roof, FR.z1, D); r.castShadow = false; r.name = 'h136-roof'; void T; }
}
function crane(X, Mt, D) {
  const C = MA.crane, y0 = F + 0.5 * S13.steps.xr.length, top = 78, T = X.THREE, g = new T.Group(); g.name = 'h136-crane';
  const leg = (dz) => { const m = new T.Mesh(X.props.geo.box, Mt.y13wood); m.scale.set(0.6, top - y0, 0.6); m.position.set(C.x, (y0 + top) / 2, dz); m.castShadow = true; g.add(m); };
  leg(-1.6); leg(1.6);
  const cross = new T.Mesh(X.props.geo.box, Mt.y13woodD); cross.scale.set(0.6, 0.6, 4); cross.position.set(C.x, top, 0); g.add(cross);
  const boom = new T.Mesh(X.props.geo.box, Mt.y13wood); boom.scale.set(C.x - C.armTo + 1, 0.55, 0.55); boom.position.set((C.x + C.armTo) / 2, top + 0.6, 0); boom.castShadow = true; g.add(boom);
  const pul = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 0.3, 12), Mt.y13woodD); pul.rotation.x = Math.PI / 2; pul.position.set(C.armTo + 0.2, top + 0.2, 0); g.add(pul);
  for (const dz of [-2.2, 2.2]) { const b = new T.Mesh(X.props.geo.box, Mt.y13wood); b.scale.set(3, 0.4, 0.4); b.position.set(C.x + 1, y0 + 0.2, dz); g.add(b); }
  D.add(g);
  return { top, x: C.armTo + 0.2 };
}
function champion(X, Mt, D, on) {
  if (!on) return; const T = X.THREE, [x, z] = S13.champion;
  const s = new T.Mesh(new T.CylinderGeometry(0.9, 1.0, 0.25, 20), Mt.y13gold); s.position.set(x, F + 0.12, z); s.name = 'h136-champion'; D.add(s);
}

function sync(X, M) {
  if (!SH13.g || !M) return;
  const st = M.st, own = SH13.own;
  const Hk = Math.round(SH13.H * 2) / 2;
  const key = JSON.stringify([st.done, st.beams, st.poles, st.crowns, st.crews, st.flaws.length, Object.keys(own), st.champion, st.walls, Hk >= CH.top, Hk >= FR.roof - 0.1, Hk > 85, Hk > KS.y + 1, M.roofed()]);
  if (key === SH13.key) { bandsAt(SH13.H); return; }
  SH13.key = key;
  const D = SH13.g, Mt = mats13(X); clear(D); SH13.bands = null;
  steps(X, Mt, D); hallFloor(X, Mt, D);
  bandsBuild(X, Mt, D);
  const H = SH13.H;
  wings(X, Mt, D, H); heichalWall(X, Mt, D, H);
  const L = lintels(X, Mt, D, M);
  overOpening(X, Mt, D, Math.min(H, L.top));
  const P = poles(X, Mt, D, M, H);
  const C = chainsAndCrowns(X, Mt, D, M, H);
  roof(X, Mt, D, H);
  const cr = own.crane ? null : crane(X, Mt, D);
  champion(X, Mt, D, !!st.champion);
  SH13.refs = { L, P, C, crane: cr };
}
/* ───────── the floor: the steps, the hall, the scaffold an act puts up ───────── */
const PREV = { f: null, busy: false };
export function floorAt13(x, z) {
  const sc = SH13.scaf; if (sc && x >= sc[0] && x <= sc[2] && z >= sc[1] && z <= sc[3]) return sc[4];
  if (x > -76.2 && x < -54.5 && Math.abs(z) < 50) { let n = 0; for (const xr of S13.steps.xr) if (x <= xr) n++; if (n) return F + 0.5 * n; }
  if (x >= S13.hall.x0 && x <= -76.2 && ((Math.abs(z) < 30 && x <= S13.hall.x1) || Math.abs(z) < 10)) return FL;
  if (!PREV.f || PREV.busy) return null;
  PREV.busy = true; try { return PREV.f(x, z); } finally { PREV.busy = false; }
}
function floorSet(X) {
  const S0 = X.stages; if (!S0 || !S0.floorHook) return;
  try { const cur = S0.floorHookOf ? S0.floorHookOf() : null; if (cur && cur !== floorAt13) PREV.f = cur; } catch (e) { /* */ }
  S0.floorHook(floorAt13);
}
function modelHide(X) { try { if (X.stages.stageOwn) X.stages.stageOwn('ulam', true); } catch (e) { /* */ } }
function build(X) { const T = X.THREE, g = new T.Group(); g.name = 'h136-site'; X.props.root.add(g); SH13.g = g; const d = new T.Group(); d.name = 'h136-dyn'; X.props.root.add(d); SH13.dyn = d; }
export function initWorld(X) {
  mats13(X); SH13.X = X; SH13.M = X.M;
  try { window.__H136_SH = SH13; } catch (e) { /* (the probes' eyes) */ }
  modelHide(X); floorSet(X);
  if (!SH13.g) build(X);
  // (a page that comes back: the walls stand at their height; the first opening raises them: pack.js)
  if (X.M && X.M.st && (X.M.st.intro || X.M.st.crews)) SH13.H = wallsTarget(X.M);
  SH13.HT = wallsTarget(X.M);
  SH13.key = ''; sync(X, X.M);
}
let jT = 0, dT = 0;
export function frameWorld(dt, X, loop) {
  if (!SH13.X) return; SH13.M = X.M;
  const now = performance.now(); if (loop && now - (SH13.lastF || 0) < 80) return; if (!loop) SH13.lastF = now;
  jT -= dt; if (jT <= 0) { jT = 0.4; modelHide(X); floorSet(X); SH13.HT = SH13.hold ? SH13.HT : wallsTarget(X.M); sync(X, X.M); }
  // the walls rise by themselves (dust and the stones' sound at the top course)
  if (SH13.H < SH13.HT - 1e-3 && !SH13.freeze) {
    SH13.H = Math.min(SH13.HT, SH13.H + (SH13.fast || 6) * dt);
    dT -= dt; if (dT <= 0) { dT = 0.5; try { X.dust(FR.face + 1, SH13.H, -30 + Math.random() * 0 + ((now / 500) % 6) * 10, 3, 3); } catch (e) { /* */ } }
    bandsAt(SH13.H);
  } else if (SH13.H > SH13.HT + 1e-3) { SH13.H = SH13.HT; bandsAt(SH13.H, true); }
  // the chains swing with him (the act sets SH13.sway: amot at the hands)
  const C = SH13.refs && SH13.refs.C;
  if (C) { const s = SH13.sway || 0, L = Math.max(4, CH.top - (SH13.handsY || 40)); for (const p of C.chains) p.rotation.x = -Math.atan2(s, L); }
}
export function restWorld(X, M) { mats13(X); SH13.X = X; SH13.M = M; modelHide(X); floorSet(X); if (!SH13.g) build(X); SH13.H = wallsTarget(M); SH13.HT = SH13.H; SH13.key = ''; sync(X, M); try { if (!SH13.tick) { SH13.tick = true; const go = () => { try { frameWorld(1 / 60, SH13.X, true); } catch (e) { /* */ } if (SH13.restLoop) requestAnimationFrame(go); }; SH13.restLoop = true; requestAnimationFrame(go); } } catch (e) { /* */ } }
export function finalWorld(X) { if (!SH13.X) return; SH13.key = ''; sync(X, X.M); }
export { sync };
