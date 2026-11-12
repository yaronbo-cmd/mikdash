/* ── build 120 ── h120/acts2.js — station 2 of stage 05, "הקו והמסור" (brief §5): the measure between the two tops with the taut cord,
 * the reading (written at level 1, a tally sherd at levels 2–3), the flight to the yard, the mark on the beam (level 1: the carpenter's
 * check), the red line snapped from a powdered string, and the two-man saw with its four moments (the start, the clear wood, the knot,
 * the prop) so that no nine strokes are alike. The rules are the model's (measOf, lineOf, sawStep, sawPts, cutLength); this file draws
 * them and reads the fingers. One pointer does everything (the mouse as a finger): the end, then the tail; a tap; the string; the strokes.
 *   SAW = { icon, title, walkLine, stand, prepare, make(m, X) → act }   (the registry of acts.js)
 */
import { H120, Y, LV, BAYS, BEAM_OF, COLS, measOf, lineOf, sawFresh, sawStep, sawPts, SAW_K, cutLength, qOf, starsOf } from './model.js';
import { SH5, YARD, mats, box, label, own, viewCone, coneOwn, coneKeep, colFrame, kohenFig, handsTo } from './world.js';
import { h120Ladder } from '../../temple.js';
import { fingers, MOUSE, heroAt, onY } from '../h113/acts.js';
import { clamp, lerp } from '../h109/kit.js';

const F = H120.FINGER, TEF = H120.TEFACH, D2R = Math.PI / 180;
/** the rhythm's window (s): his stroke begun this close to the carpenter's end is 'in rhythm' (the mouse's own, see the report) */
const RHY = 0.12;
const sc = (X, v) => { const r = X.scr(v.x, v.y, v.z); return [Math.round(r.x), Math.round(r.y)]; };
const V3 = (X, x, y, z) => new X.THREE.Vector3(x, y, z);
/** the yard's numbers for his beam: the squared end, its axis (+x), the trestles' top, its middle line */
const YB = Object.freeze({ x0: YARD.his.x0, z: YARD.his.z, bot: H120.FLOOR + 1.6, top: H120.FLOOR + 1.6 + H120.BEAM_H, hw: H120.BEAM_W / 2 });

/** "11 אמות, טפח ו־2 אצבעות": a length read off the knots and the rod (amot, tefachim, fingers) */
export function measText(m) {
  const tf = Math.round(m * 24), a = Math.floor(tf / 24), t = Math.floor((tf - a * 24) / 4), f = tf - a * 24 - t * 4;
  const A = `${a} אמות`, T = t === 0 ? '' : t === 1 ? 'טפח' : `${t} טפחים`, Fi = f === 0 ? '' : f === 1 ? 'אצבע אחת' : `${f} אצבעות`;
  if (!T && !Fi) return A + ' בדיוק';
  if (T && Fi) return `${A}, ${T} ו־${Fi}`;
  return `${A} ו־${T || Fi}`;
}
/** the tally a kohen scratches on a sherd: long strokes for the tefachim, dots for the fingers (no writing) */
export function tallyOf(m) { const tf = Math.round(m * 24), a = Math.floor(tf / 24), t = Math.floor((tf - a * 24) / 4), f = tf - a * 24 - t * 4; return { knot: a, t, f, marks: '|'.repeat(t) + (t && f ? ' ' : '') + '•'.repeat(f) }; }

/** his bay: the beam, his column (the far end of the cord) and the neighbour's top or the wall's corbel (the cord's zero) */
function bayOf(m, X) {
  const beamId = m.free ? m.unit : BAYS[m.lv].beam, B = BEAM_OF[beamId];
  const hisId = m.free ? (B.b && COLS[B.b] ? B.b : B.a) : BAYS[m.lv].col;
  const P1 = B.a === hisId ? B.pa : B.pb, P0 = B.a === hisId ? B.pb : B.pa;
  const L = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), dir = [(P1[0] - P0[0]) / L, (P1[1] - P0[1]) / L];
  const lv = m.free ? 3 : X ? X.level() : m.lv;
  return { beamId, B, hisId, nbId: B.a === hisId ? B.b : B.a, P0, P1, dir, across: colFrame(hisId).across, lv, L: LV[lv], nominal: B.len, stock: B.len + 1 };
}

let sherdOn = false;
function sherdCss() {
  if (sherdOn) return; sherdOn = true;
  const el = document.createElement('style');
  el.textContent = '.h120-lab.h120-sherd{background:#B8784C;color:#2A1608;border-color:#7A4A2A;border-radius:42% 58% 46% 62%;font:900 22px/1 monospace;letter-spacing:4px;padding:7px 16px;direction:ltr}';
  document.head.appendChild(el);
}

export const SAW = {
  icon: '🪚', title: 'הקו והמסור',
  walkLine: () => 'מודדים בין שני העמודים, ומנסרים קורה',
  stand(m, X) { const b = bayOf(m, X); return { x: b.P1[0] + b.across[0] * 3.6, z: b.P1[1] + b.across[1] * 3.6, face: [b.P1[0], b.P1[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, PR = X.props, M = mats(X), st = X.M.st, cam = X.camera;
    const Bay = bayOf(m, X), { beamId, P0, P1, dir, across, lv, L } = Bay;
    const need = X.M.need(beamId), CT = Y.COL_TOP + 0.07;
    SH5.busy = 1; own('__yard', 1);
    const all = [], crew = [], labs = [];
    const A = { phase: 'intro', busy: true, t: 0, u: need - 1.6, T: 0, slips: 0, tries: 0, meas: null, read: null, mark: null, checked: 0, line: null, h: 0, s: null,
      quick: {}, events: [], downs: [], saw: 0, sawV: 0, sawW: 0, cut: null, moment: '', propOn: 0, propAsk: 0, offY: 0, sagA: 0, macro: 0, endF: null, tailF: null, lineF: null, sawF: null, tearAt: null, lost: 0, done: 0 };
    const FG = fingers(X, { down: fDown, move: fMove, up: fUp });
    const lab = label(X), lab2 = label(X); labs.push(lab, lab2); sherdCss();

    /* ── the camera's frames: distances from the lens so a width (amot) fills the frame ── */
    const frameDist = (w, h) => { const vf = ((cam && cam.fov) || 40) * D2R, asp = (cam && cam.aspect) || innerWidth / innerHeight, hf = 2 * Math.atan(Math.tan(vf / 2) * asp); return Math.max((w / 2) / Math.tan(hf / 2), (h / 2) / Math.tan(vf / 2)); };
    const look = (aim, from, dist, el) => { const l = Math.hypot(from[0], from[1]) || 1, c = Math.cos(el * D2R), s = Math.sin(el * D2R); return { p: [aim[0] + (from[0] / l) * dist * c, aim[1] + dist * s, aim[2] + (from[1] / l) * dist * c], t: aim }; };
    const M1 = [P0[0] + dir[0] * need, P0[1] + dir[1] * need];
    const midB = [P0[0] + dir[0] * need / 2, CT - 0.4, P0[1] + dir[1] * need / 2];
    // (the bay from the court a little over the tops: both tops, both ladders and the two men whole; the ease-in near the mark from the
    //  side of the bay, his hand and the cord's end on the scratch, his body out past the column)
    const S_BAY = look([midB[0], CT - 0.9, midB[2]], across, frameDist(need + 6.5, 9.5), 11);
    const S_MAC = look([M1[0] - dir[0] * 0.9, CT - 0.15, M1[1] - dir[1] * 0.9], [across[0] * 0.95 - dir[0] * 0.3, across[1] * 0.95 - dir[1] * 0.3], frameDist(3.4, 2.4), 22);
    // (the mark and the line: from over the beam's end, the rod running up the screen, the kohen on one side and the carpenter on the other)
    // (the yard from high on his side, 56° down: the rod or the cut at the centre, both men whole and small, the carpenter under the HUD)
    const S_YARD = () => { const K = A.read ? Math.floor(A.read) : 11; return look([A.phase === 'line' && A.mark != null ? xm() : YB.x0 + K + 0.5, YB.top, YB.z - 0.55], [0.75, 1], frameDist(9, 9), 56); };
    const xm = () => YB.x0 + (A.mark != null ? A.mark : need);
    const S_SAW = () => look([xm(), YB.top, YB.z - 0.55], [0.75, 1], frameDist(9, 9), 56);
    const S_END = () => look([xm() + (A.s ? A.s.drift * F : 0), YB.top - 0.3, YB.z + 0.3], [1, 0.12], frameDist(2.4, 1.8), 26);
    const shot = (S, d = 0.8) => X.shot(S.p, S.t, d);
    const cone = (S, r) => [S.p, S.t, r];

    /* ── step 1, at the bay: two ladders, the scratches on the two tops, the cord with its knots, the helper at the zero ── */
    const ladder = (x, z, fx, fz, top) => { for (const g of h120Ladder(x, z, fx, fz, H120.FLOOR, top)) { const o = new T.Mesh(g, M.h5cedarD); o.castShadow = true; PR.root.add(o); all.push(o); } };
    const LADH = Y.COL_TOP - 1.25 - H120.FLOOR, LEAN = 0.28;
    // (his ladder against his column from outside the bay, the helper's on the wall's side: neither man is between the cord and the camera)
    const footK = [P1[0] + dir[0] * (0.55 + (LADH + 0.9) * LEAN), P1[1] + dir[1] * (0.55 + (LADH + 0.9) * LEAN)];
    const footH = [P0[0] - across[0] * (0.55 + (LADH + 0.9) * LEAN) + dir[0] * 0.2, P0[1] - across[1] * (0.55 + (LADH + 0.9) * LEAN) + dir[1] * 0.2];
    ladder(footK[0], footK[1], P1[0], P1[1], H120.FLOOR + LADH); ladder(footH[0], footH[1], P0[0], P0[1], H120.FLOOR + LADH);
    const scratch = (p, mat) => { const w = 0.62; all.push(box(X, mat, p[0] - Math.abs(dir[1]) * w - Math.abs(dir[0]) * 0.012, CT - 0.07, p[1] - Math.abs(dir[0]) * w - Math.abs(dir[1]) * 0.012, p[0] + Math.abs(dir[1]) * w + Math.abs(dir[0]) * 0.012, CT - 0.05, p[1] + Math.abs(dir[0]) * w + Math.abs(dir[1]) * 0.012)); };
    scratch(P0, M.h5dark); scratch(M1, M.h5dark);
    // (level 3's zero is on the corbel in the wood chamber's wall: a block under the cord's zero)
    if (!Bay.nbId) all.push(box(X, M.h5limeD, P0[0] - 0.45, Y.COL_TOP - 0.7, P0[1] - 0.45, P0[0] + 0.45, Y.COL_TOP - 0.02, P0[1] + 0.45));
    const cord = PR.rope(40, 0.022), tail = PR.rope(8, 0.022);
    const cordMat = cord.mesh.material.clone(), cordC0 = cordMat.color.clone(), cordC1 = new T.Color('#F3E7B4'); cord.mesh.material = cordMat; tail.mesh.material = cordMat;
    const knotG = new T.SphereGeometry(0.055, 6, 5), knots = [];
    for (let k = 1; k <= 12; k++) { const o = new T.Mesh(knotG, M.h5cedarD); PR.root.add(o); all.push(o); knots.push(o); }
    const helper = SH5.crew.add(footH[0] + (P0[0] - footH[0]) * 0.55, footH[1] + (P0[1] - footH[1]) * 0.55, { role: 'hold', fx: P0[0], fz: P0[1], crew: 2 });
    if (helper) { helper.a.y = helper.a.fixedY = CT - 1.75; crew.push(helper); }
    const holdArms = (w, r = 1.15, lean = -0.05) => { if (!w) return; const a = w.a; a.arm[0] = a.armT[0] = r; a.arm[2] = a.armT[2] = r; a.arm[1] = a.armT[1] = -0.25; a.arm[3] = a.armT[3] = -0.25; a.bow = a.bowT = lean; };
    // the kohen on his ladder at his column (rule 62: his hands hold the cord's end): life-size among the crew, in white with his turban
    const kOn = [footK[0] + (P1[0] - footK[0]) * 0.66, footK[1] + (P1[1] - footK[1]) * 0.66];
    const kf = kohenFig(kOn[0], kOn[1]); if (kf) crew.push(kf);
    const KY = CT - 1.75;
    function kohenBay() { if (!kf) return; const a = kf.a; a.visT = 1; a.x = kOn[0]; a.z = kOn[1]; a.y = a.fixedY = KY; a.yaw = Math.atan2(P1[0] - a.x, P1[1] - a.z); }
    function kfAt(x, z, fx, fz) { if (!kf) return; const a = kf.a; a.visT = 1; a.x = x; a.z = z; a.y = H120.FLOOR; a.fixedY = undefined; a.bow = a.bowT = 0; a.yaw = Math.atan2(fx - x, fz - z); }
    const cordPt = (u, out) => { const sag = A.phase === 'end' || A.phase === 'intro' ? 0.25 : clamp((1 - A.T) * 0.42, 0, 0.42), k = u / Math.max(0.5, A.u); const y = CT - sag * 4 * k * (1 - k) + (A.phase === 'tension' ? Math.sin(A.t * 23 + u) * 0.02 * clamp(1 - A.T, 0, 1) + Math.sin(A.t * 47 + u * 3) * 0.012 * clamp((A.T - 1.0) * 12, 0, 1) * Math.sin(Math.PI * k) : 0); return (out || new T.Vector3()).set(P0[0] + dir[0] * u, y, P0[1] + dir[1] * u); };
    const endW = () => cordPt(A.u);
    const tailW = () => { const e = endW(); return new T.Vector3(e.x + dir[0] * 0.38 + across[0] * 0.25, e.y - 0.55 - 0.65 * clamp(A.T, 0, 1.15), e.z + dir[1] * 0.38 + across[1] * 0.25); };
    function drawCord() {
      if (!cord.mesh.visible) return;
      const e = endW(), sag = A.phase === 'end' || A.phase === 'intro' ? 0.25 : clamp((1 - A.T) * 0.42, 0, 0.42);
      cord.set({ x: P0[0], y: CT, z: P0[1] }, { x: e.x, y: e.y, z: e.z }, sag);
      const tw = tailW(); tail.set({ x: e.x, y: e.y, z: e.z }, { x: tw.x, y: tw.y, z: tw.z }, 0.05);
      knots.forEach((o, i) => { const u = i + 1; o.visible = u <= A.u + 1e-6; if (o.visible) cordPt(u, o.position); });
      if (helper) holdArms(helper, 1.2 + 0.25 * clamp(A.T - 0.95, 0, 0.2) * 5, -0.05 - 0.25 * clamp(A.T - 0.9, 0, 0.2) * 5);
      if (kf && (A.phase === 'end' || A.phase === 'tension' || A.phase === 'read' || A.phase === 'intro')) { handsTo(X, kf, A.phase === 'tension' ? tw : e, { spread: -0.16, rMax: 2.5 }); kf.a.bow = kf.a.bowT = A.phase === 'tension' ? -0.05 - 0.25 * clamp(A.T, 0, 1) : 0.12; }
      // (level 1: the cord itself says taut — a little paler and brighter while it is straight, before it slips)
      if (cordMat) { const k = lv === 1 && A.phase === 'tension' ? clamp((A.T - 0.78) / 0.07, 0, 1) * clamp((1.07 - A.T) / 0.03, 0, 1) : 0; cordMat.color.copy(cordC0).lerp(cordC1, k); }
    }
    // the rod (one amah, six tefach notches, four finger ticks each) laid from the last knot; on the beam at the yard, the same
    function rodMesh(x0, y0, z0, ax, n = [0, 0, 1]) {
      const g = new T.Group(), L0 = 1;
      box(X, M.h5cedarL, 0, 0, -0.05, L0, 0.035, 0.05, g);
      for (let i = 0; i <= 24; i++) { const big = i % 4 === 0, x = i / 24; box(X, M.h5dark, x - 0.004, 0.035, -0.05, x + 0.004, 0.04, big ? 0.05 : -0.015, g); }
      g.position.set(x0, y0, z0); g.rotation.y = Math.atan2(-ax[1], ax[0]); void n; PR.root.add(g); all.push(g); return g;
    }

    /* ── step 2 and 3, at the yard: the beam on its trestles (cut into the main piece and the offcut at the mark), the knots, the rod ── */
    let beamM = null, offG = null, offM = null, kerf = null, sawG = null, blade = null, knotM = [], redL = [], markM = null, splinter = null, prop = null, propWedge = null, yRod = null, string = null;
    const zc = YB.z, near = zc + 1.75, far = zc - 1.75;
    const yKnots = [];
    function yardBeam() {
      for (const o of [beamM, offG, kerf, ...yKnots, ...knotM]) if (o) PR.remove(o);
      yKnots.length = 0; knotM = [];
      const xmk = xm(), x1 = YB.x0 + Bay.stock;
      beamM = box(X, M.h5cedar, YB.x0, YB.bot, zc - YB.hw, xmk, YB.top, zc + YB.hw); all.push(beamM);
      offG = new T.Group(); offG.position.set(xmk, YB.bot, zc); PR.root.add(offG); all.push(offG);
      offM = box(X, M.h5cedar, 0, 0, -YB.hw, x1 - xmk, H120.BEAM_H, YB.hw, offG);
      kerf = box(X, M.h5dark, xmk - 0.012, YB.top, zc - YB.hw - 0.005, xmk + 0.012, YB.top, zc + YB.hw + 0.005); kerf.visible = false; all.push(kerf);
      // the squared end (a darker end grain) and the knot at levels 2–3 (seen on the near face and in the end grain)
      all.push(box(X, M.h5cedarD, YB.x0 - 0.01, YB.bot, zc - YB.hw, YB.x0 + 0.005, YB.top, zc + YB.hw));
      if (L.knot) {
        const ky = YB.top - H120.BEAM_H * (SAW_K.KNOT[0] + SAW_K.KNOT[1]) / 2, kmat = new T.MeshStandardMaterial({ color: '#4A2E16', roughness: 0.7 });
        for (const [z, s] of [[zc + YB.hw + 0.004, 1], [zc - YB.hw - 0.004, 0.8]]) { const k = new T.Mesh(new T.CircleGeometry(0.13 * s, 14), kmat); k.scale.set(1.6, 0.85, 1); k.position.set(xmk + 0.16, ky, z); if (z < zc) k.rotation.y = Math.PI; PR.root.add(k); all.push(k); knotM.push(k); }
        // (and the grain swirling round it on the top face, where the line runs)
        const kt = new T.Mesh(new T.RingGeometry(0.05, 0.085, 14), kmat); kt.rotation.x = -Math.PI / 2; kt.scale.set(1.8, 1, 1); kt.position.set(xmk + 0.16, YB.top + 0.004, zc + 0.12); PR.root.add(kt); all.push(kt); knotM.push(kt);
      }
    }
    function yardCord() {
      for (let k = 1; k <= 12; k++) { if (YB.x0 + k > YB.x0 + Bay.stock) break; const o = new T.Mesh(knotG, k === Math.floor(A.read || 11) ? M.h5bronze : M.h5cedarD); o.position.set(YB.x0 + k, YB.top + 0.05, zc - 0.18); PR.root.add(o); all.push(o); yKnots.push(o); }
      const c = PR.rope(30, 0.018); c.set({ x: YB.x0, y: YB.top + 0.03, z: zc - 0.18 }, { x: YB.x0 + Math.min(Bay.stock, 12), y: YB.top + 0.03, z: zc - 0.18 }, 0); A.yc = c;
      const K = Math.floor(A.read || 11); yRod = rodMesh(YB.x0 + K, YB.top + 0.004, zc + 0.05, [1, 0]);
    }

    /* ── the grips: the cord's end, its tail, the beam along the rod, the string's middle, the handle, the prop ── */
    const R2 = (p, q) => Math.hypot(p.x - q[0], p.y - q[1]);
    const reachT = () => clamp(0.3 * Math.min(innerWidth, innerHeight), 130, 260);
    const reachL = () => clamp(0.24 * Math.min(innerWidth, innerHeight), 110, 220);
    const strokePx = () => clamp(0.28 * Math.min(innerWidth, innerHeight), 120, 260);
    const handleW = (sgn = 1) => new T.Vector3(A.cut != null ? A.cut : xm(), YB.top + 0.545 - (A.s ? A.s.depth * H120.BEAM_H : 0), zc + sgn * 1.3 + A.saw);
    function sawAxis() { const a = sc(X, handleW(-1)), b = sc(X, handleW(1)), d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(d[0], d[1]) || 1; return { at: b, dir: [d[0] / l, d[1] / l] }; }
    const propSpot = () => new T.Vector3(xm() + 0.55, H120.FLOOR + 0.5, zc + 1.0);
    function nearest(p) {
      const Ls = [];
      if (A.phase === 'end') Ls.push(['end', R2(p, sc(X, endW()))]);
      else if (A.phase === 'tension') { Ls.push(['tail', R2(p, sc(X, tailW()))]); Ls.push(['end', R2(p, sc(X, endW())) + 30]); }
      else if (A.phase === 'mark') { const q = onY(X, p, YB.top); if (q && Math.abs(q.z - zc) < YB.hw + 0.5 && q.x > YB.x0 + 9 && q.x < YB.x0 + Bay.stock + 0.2) return 'beam'; }
      else if (A.phase === 'line') Ls.push(['string', R2(p, sc(X, V3(X, xm(), YB.top + 0.05, zc)))]);
      else if (A.phase === 'saw') {
        if (A.s && A.s.sag && !A.s.prop) Ls.push(['prop', R2(p, sc(X, propSpot()))]);
        return Ls.length && Ls[0][1] < 70 ? 'prop' : 'saw';   // (anywhere else on the work: his handle)
      }
      Ls.sort((a, b) => a[1] - b[1]); return Ls[0] && Ls[0][1] < 95 ? Ls[0][0] : null;
    }
    /** the finger on the vertical plane of the beam's line (the bay) */
    function onPlane(p) {
      const r = X.rayAt(p.x, p.y).ray, o = r.origin, d = r.direction, nx = across[0], nz = across[1], den = d.x * nx + d.z * nz; if (Math.abs(den) < 1e-5) return null;
      const t = ((P0[0] - o.x) * nx + (P0[1] - o.z) * nz) / den; if (t < 0) return null; return { x: o.x + d.x * t, y: o.y + d.y * t, z: o.z + d.z * t };
    }

    /* ── the fingers ── */
    function fDown(f) {
      if (A.busy) return;
      const k = nearest(f); f.what = k; f.t0 = performance.now(); f.px = f.x; f.py = f.y; f.hist = [[f.t0, 0, 0]];
      A.downs.push([k, Math.round(f.x), Math.round(f.y), A.phase]); if (A.downs.length > 8) A.downs.shift();
      if (k === 'end') { A.endF = f; if (A.phase === 'tension') { A.phase = 'end'; A.T = 0; X.meter(null); } }
      else if (k === 'tail') { A.tailF = f; f.T0 = A.T; A.tries++; X.play('rope'); }
      else if (k === 'string') { A.lineF = f; }
      else if (k === 'saw') { A.sawF = f; f.ax = sawAxis(); }
      else if (k === 'prop') { propDo(); }
      else if (k === 'beam') markDown(f);
    }
    function fMove(f) {
      if (f === A.endF) {
        const a = onPlane({ x: f.px, y: f.py }), b = onPlane(f); f.px = f.x; f.py = f.y; if (!a || !b) return;
        A.u = clamp(A.u + ((b.x - a.x) * dir[0] + (b.z - a.z) * dir[1]), need - 4, need + 0.8);
      } else if (f === A.tailF) {
        A.T = clamp(f.T0 + (f.y - f.y0) / reachT(), 0, 1.15);
        if (A.T > 1.08) slip();
      } else if (f.what === 'beam' && A.phase === 'mark' && !A.busy) { markMove(f);
      } else if (f === A.lineF) {
        A.h = clamp((f.y0 - f.y) / reachL(), 0, 1.2);
      } else if (f === A.sawF) {
        const now = performance.now(), d = (f.x - f.x0) * f.ax.dir[0] + (f.y - f.y0) * f.ax.dir[1], w = -(f.x - f.x0) * f.ax.dir[1] + (f.y - f.y0) * f.ax.dir[0];
        f.hist.push([now, d, w]); while (f.hist.length > 2 && now - f.hist[0][0] > 90) f.hist.shift();
        const h0 = f.hist[0], dt = Math.max(0.016, (now - h0[0]) / 1000);
        A.sawV = (d - h0[1]) / dt / strokePx(); A.sawW = (w - h0[2]) / dt / strokePx();
      }
    }
    function fUp(f) {
      if (f === A.endF) { A.endF = null; endPlaced(); }
      else if (f === A.tailF) { A.tailF = null; pinch(); }
      else if (f === A.lineF) { A.lineF = null; snapLine(); }
      else if (f === A.sawF) { A.sawF = null; A.sawV = 0; A.sawW = 0; }
      else if (f.what === 'beam' && A.phase === 'mark' && !A.busy) scoreMark(f);
    }

    /* ── step 1: the end on the mark, the tension, the pinch, the reading ── */
    function endPlaced() {
      const off = A.u - need;
      if (Math.abs(off) <= 1.0 && !A.macro) { A.macro = 1; shot(S_MAC, 0.7); }
      else if (Math.abs(off) > 1.6 && A.macro) { A.macro = 0; shot(S_BAY, 0.7); }
      if (Math.abs(off) <= TEF + 1e-9) {
        A.phase = 'tension'; A.T = 0;
        X.line(lv === 1 ? 'משכו את קצה החבל למטה עד שהחבל ישר, ולא יותר' : 'מתחו את החבל', 0);
      } else X.line(lv === 1 ? 'גררו את קצה החבל אל השריטה שעל העמוד' : 'הקצה אל השריטה', 0);
    }
    async function slip() {
      A.tailF = null; A.T = 0; A.slips++; A.busy = true; X.meter(null);
      X.play('rope'); X.line('חזק מדי: הקצה של העוזר החליק מהסימן. שוב', 2400);
      if (helper) holdArms(helper, 0.6, 0.3);
      if (kf) { kf.a.bow = kf.a.bowT = 0.35; }
      await X.wait(1.0); A.busy = false;
    }
    async function pinch() {
      if (A.phase !== 'tension') return;
      if (A.T < 0.3) { A.T = 0; return; }   // (barely pulled: the cord falls back, nothing is read)
      A.busy = true; A.phase = 'read'; X.meter(null);
      const Te = Math.min(1, A.T), off = A.u - need;
      A.meas = measOf(need, Te, off); A.read = Math.round(A.meas * 24) / 24;
      X.play('measure');
      if (A.T >= 0.85 && A.T <= 1.05 && A.tries === 1 && !A.slips && Math.abs(off) <= F + 1e-9) { A.quick.taut = 1; X.quick(endW(), 'מתוח!', null); }
      // the rod laid from the last knot to the pinch
      const K = Math.floor(A.read), p = cordPt(K);
      rodMesh(p.x, CT - 0.035, p.z, dir);
      await X.wait(0.7);
      const tl = tallyOf(A.read);
      if (lv === 1) lab.set(measText(A.read), { x: M1[0] - dir[0] * 0.5, y: CT + 0.55, z: M1[1] - dir[1] * 0.5 }, true);
      else { lab.el.classList.add('h120-sherd'); lab.set(tl.marks || '·', { x: M1[0] - dir[0] * 0.5, y: CT + 0.55, z: M1[1] - dir[1] * 0.5 }, false); }
      X.line(lv === 1 ? 'כתוב: ' + measText(A.read) : 'נשרט על החרס: פסים לטפחים, נקודות לאצבעות', 0);
      await X.wait(lv === 1 ? 2.2 : 2.0);
      toYard();
    }

    /* ── the way to the yard: one eased flight; the kohen is set there ── */
    async function toYard() {
      A.phase = 'fly'; A.busy = true;
      for (const o of [cord, tail]) o.show(false); for (const o of knots) o.visible = false;
      if (helper) helper.a.visT = 0;
      yardBeam(); yardCord();
      viewCone(X, [cone(S_YARD(), -3), cone(S_SAW(), -3), cone(S_END(), 0.6)], { keep: [yardRect], skip: crew });
      const S = S_YARD(); X.shot(S.p, S.t, 1.15);
      kfAt(YB.x0 + Math.floor(A.read) + 0.5, near + 0.35, YB.x0 + Math.floor(A.read) + 0.5, zc); if (kf) { kf.a.arm[0] = kf.a.armT[0] = kf.a.arm[2] = kf.a.armT[2] = 0.5; }
      if (carp) { carp.a.visT = 1; carp.a.x = YB.x0 + Math.floor(A.read) + 0.5; carp.a.z = far - 0.35; SH5.crew.face(carp, carp.a.x, zc); }
      if (lv === 1) lab.set(measText(A.read), { x: YB.x0 + Math.floor(A.read) + 0.5, y: YB.top + 0.75, z: zc - 0.45 }, true);
      else lab.set(tallyOf(A.read).marks || '·', { x: YB.x0 + Math.floor(A.read) - 0.35, y: YB.top + 0.6, z: zc + 0.2 }, false);
      await X.wait(1.2);
      A.phase = 'mark'; A.busy = false;
      X.line(lv === 1 ? 'הקישו על הקורה, לאורך המוט, במקום שמדדתם' : 'סמנו על הקורה', 0);
    }
    /* ── step 2: the mark (continuous: no snap); level 1's carpenter stops a mark a tefach off once ── */
    // (the finger lays a mark where it touches and slides it at a third of its own speed along the rod: a finger on a wide view is
    //  still a finger's precision; the lift scores it)
    let markP = null;
    function markShow(x) { if (!markP) { markP = box(X, new T.MeshBasicMaterial({ color: 0x2A1608, transparent: true, opacity: 0.55, depthWrite: false }), -0.008, 0, -YB.hw, 0.008, 0.008, YB.hw); all.push(markP); } markP.visible = x != null; if (x != null) markP.position.set(x, YB.top + 0.002, zc); }
    function markDown(f) { const q = onY(X, f, YB.top); if (!q) return; f.mx = q.x; f.qx = q.x; markShow(f.mx); if (kf) handsTo(X, kf, V3(X, f.mx, YB.top + 0.05, zc + 0.25), { home: [f.mx - 0.2, near + 0.35], leash: 0.9 }); }
    function markMove(f) { const q = onY(X, f, YB.top); if (!q || f.mx == null) return; f.mx = clamp(f.mx + (q.x - f.qx) / 3, YB.x0 + 9, YB.x0 + Bay.stock); f.qx = q.x; markShow(f.mx); }
    async function scoreMark(f) {
      if (f.mx == null) return;
      const q = { x: f.mx }; markShow(null);
      const mk = q.x - YB.x0;
      A.busy = true;
      const at = V3(X, q.x, YB.top + 0.02, zc);
      if (kf) { kf.a.bow = kf.a.bowT = 0.45; for (let i = 0; i < 6; i++) handsTo(X, kf, at, { home: [q.x - 0.2, near + 0.35], leash: 0.9 }); }
      await X.wait(0.25); X.play('chisel');
      if (markM) PR.remove(markM); markM = box(X, M.h5dark, q.x - 0.008, YB.top, zc - YB.hw, q.x + 0.008, YB.top + 0.006, zc + YB.hw); all.push(markM);
      await X.wait(0.3);
      if (kf) { kf.a.bow = kf.a.bowT = 0.05; }
      if (lv === 1 && !A.checked && Math.abs(mk - A.read) > TEF + 1e-9) {
        A.checked = 1; X.play('tap'); X.line('רגע. מדדנו אחרת. הסימן לא שם', 3200);
        if (carp) SH5.crew.setRole(carp, 'point');
        await X.wait(1.4); PR.remove(markM); markM = null; if (carp) SH5.crew.setRole(carp, 'hold');
        A.busy = false; return;
      }
      A.mark = +mk.toFixed(4);
      yardBeam();   // (the beam is now two pieces at the mark: the main beam and the offcut beyond it)
      markM = box(X, M.h5dark, xm() - 0.008, YB.top, zc - YB.hw, xm() + 0.008, YB.top + 0.006, zc + YB.hw); all.push(markM);
      // the red line: the powdered string held across the beam on the mark by the two of them
      A.phase = 'line'; A.h = 0;
      string = PR.rope(10, 0.012); string.mesh.material = new T.MeshBasicMaterial({ color: 0xB0302A }); all.push({ dispose: () => string.dispose() });
      if (carp) { carp.a.x = xm() - 0.1; carp.a.z = far - 0.15; SH5.crew.face(carp, xm(), zc); }
      kfAt(xm() - 0.45, near + 0.1, xm(), zc); shot(S_YARD(), 0.6);
      X.line(lv === 1 ? 'הרימו את החוט באמצעו ושחררו' : 'הקו האדום', 0);
      A.busy = false;
    }
    function stringPts() { const x = xm(), y = YB.top + 0.03; return [{ x, y, z: zc - YB.hw - 0.35 }, { x, y, z: zc + YB.hw + 0.35 }]; }
    function drawString() {
      if (!string) return;
      const [a, b] = stringPts(), lift = A.phase === 'line' ? A.h * 0.42 : 0;
      string.set(a, b, -lift);
      if (A.phase === 'line') { handsTo(X, kf, V3(X, b.x, b.y, b.z), { home: [xm() - 0.45, near + 0.1], leash: 0.4 }); handsTo(X, carp, V3(X, a.x, a.y, a.z), { home: [xm() - 0.1, far - 0.15], leash: 0.5 }); }
      if (A.phase === 'line' && lv === 1 && !A.busy) X.meter(V3(X, xm(), YB.top + 0.9, zc), clamp(A.h / 1.1, 0, 1));
    }
    async function snapLine() {
      if (A.phase !== 'line' || A.h < 0.08) { A.h = 0; return; }
      A.busy = true; X.meter(null);
      A.line = lineOf(A.h); X.play('brush', { force: 1.4 });
      const x = xm(), w = A.line === 'smear' ? F : 0.012, mt = new T.MeshBasicMaterial({ color: A.line === 'faint' ? 0xD9A39A : 0xB0302A, transparent: true, opacity: A.line === 'faint' ? 0.45 : A.line === 'smear' ? 0.75 : 0.95, depthWrite: false });
      redL.push(box(X, mt, x - w / 2, YB.top + 0.004, zc - YB.hw, x + w / 2, YB.top + 0.01, zc + YB.hw));
      redL.push(box(X, mt, x - w / 2, YB.bot + 0.02, zc + YB.hw + 0.003, x + w / 2, YB.top, zc + YB.hw + 0.008));
      redL.push(box(X, mt, x - w / 2, YB.bot + 0.02, zc - YB.hw - 0.008, x + w / 2, YB.top, zc - YB.hw - 0.003));
      all.push(...redL);
      X.dust(x, YB.top + 0.2, zc, 5, 0.6);
      if (A.line === 'sharp') { A.quick.line = 1; X.quick(V3(X, x, YB.top + 0.1, zc + YB.hw), 'קו חד!', null); }
      X.line(A.line === 'sharp' ? 'קו חד' : A.line === 'faint' ? 'קו חיוור: קשה לראות אותו בניסור' : 'הקו מרוח, ברוחב אצבע', 2200);
      await X.wait(1.0);
      if (string) { string.show(false); }
      sawStart();
    }

    /* ── step 3: the two-man saw ── */
    let carp = null, propMan = null;
    carp = SH5.crew.add(YB.x0 + 11.2, far + 0.4, { role: 'hold', fx: YB.x0 + 11.2, fz: zc, crew: 2 }); if (carp) { carp.a.visT = 0; crew.push(carp); }
    let dustP = null;
    function sawBuild() {
      sawG = new T.Group(); PR.root.add(sawG); all.push(sawG);
      // the two-man saw: a long dark iron blade, its lower edge toothed along the whole length, a wooden grip upright at each end
      const iron = new T.MeshStandardMaterial({ color: '#3E4046', metalness: 0.35, roughness: 0.42 });
      const sh = new T.Shape(), HL = 1.25, TP = 0.075, TD = 0.045;
      sh.moveTo(-HL, 0.22); sh.quadraticCurveTo(0, 0.17, HL, 0.22); sh.lineTo(HL, -0.22);
      for (let u = HL; u > -HL + 1e-6; u -= TP) { sh.lineTo(u - TP / 2, -0.22 - TD); sh.lineTo(Math.max(-HL, u - TP), -0.22); }
      sh.lineTo(-HL, 0.22);
      const gb = new T.ExtrudeGeometry(sh, { depth: 0.014, bevelEnabled: false }); gb.translate(0, 0, -0.007); gb.rotateY(-Math.PI / 2);
      blade = new T.Mesh(gb, iron); blade.castShadow = true; sawG.add(blade);
      // (a bright line along the teeth's points: the filed edge catches the light)
      box(X, new T.MeshStandardMaterial({ color: '#B4B6BC', metalness: 0.5, roughness: 0.3 }), -0.009, -0.22 - TD, -HL, 0.009, -0.22 - TD + 0.012, HL, sawG);
      box(X, new T.MeshStandardMaterial({ color: '#7C7E86', metalness: 0.5, roughness: 0.3 }), -0.009, 0.19, -HL, 0.009, 0.225, HL, sawG);   // (the back's polished edge)
      for (const sg of [-1, 1]) {
        const h = new T.Mesh(new T.CylinderGeometry(0.055, 0.06, 0.62, 10), M.h5cedar); h.position.set(0, 0.28, sg * (HL + 0.05)); h.castShadow = true; sawG.add(h);
        box(X, iron, -0.03, 0.08, sg * (HL + 0.05) - 0.07, 0.03, 0.2, sg * (HL + 0.05) + 0.07, sawG);   // (the iron strap that holds the grip)
      }
      // the sawdust: a pale heap growing on the floor under the kerf on both sides of the beam
      dustP = new T.Group(); dustP.position.set(xm(), H120.FLOOR, zc); PR.root.add(dustP); all.push(dustP);
      const dm = new T.MeshStandardMaterial({ color: '#E2C79A', roughness: 1, flatShading: true });
      for (const sz of [-1, 1]) { const c = new T.Mesh(new T.ConeGeometry(0.32, 0.12, 9), dm); c.position.set(0, 0.06, sz * (YB.hw + 0.12)); c.scale.set(1.4, 1, 1); dustP.add(c); }
      dustP.scale.set(0.3, 0.2, 0.3);
    }
    function sawStart() {
      A.phase = 'saw'; A.busy = false; A.s = sawFresh(lv); A.cut = xm(); A.saw = 0.35;
      sawBuild(); kerf.visible = true;
      shot(S_SAW(), 0.9);
      kfAt(xm() - 0.6, zc + 2.1, xm(), zc);
      if (carp) { carp.a.visT = 1; carp.a.x = xm() - 0.1; carp.a.z = zc - 2.2; SH5.crew.face(carp, xm(), zc); SH5.crew.setRole(carp, 'hold'); }
      X.line(lv === 1 ? 'משכו את הידית אליכם, ושחררו כשהנגר מושך. התחלה: קצרות ואיטיות' : 'מנסרים: התחלה קצרה ואיטית', 0);
      A.moment = 'start'; lab2.set('התחלה', V3(X, xm(), YB.top + 0.75, zc), false);
    }
    async function propDo() {
      if (!A.s || !A.s.sag || A.s.prop || A.propOn) return;
      A.propOn = 1; X.play('tap');
      const sp = propSpot();
      propMan = SH5.crew.add(sp.x + 0.45, far + 0.35, { role: 'hammer', item: 'mallet', fx: sp.x, fz: zc, crew: 2 });   // (behind the beam: never between the camera and the cut)
      if (propMan) { crew.push(propMan); coneOwn(propMan); }
      if (prop) { prop.position.set(sp.x, H120.FLOOR + 0.12, zc + 0.05); prop.rotation.set(0, 0, 0); all.push(box(X, M.h5limeD, sp.x - 0.28, H120.FLOOR, zc - 0.23, sp.x + 0.28, H120.FLOOR + 0.12, zc + 0.33)); }
      propWedge = box(X, M.h5cedarL, sp.x - 0.18, YB.bot - 0.1, zc - 0.12, sp.x + 0.18, YB.bot - 0.005, zc + 0.12); all.push(propWedge);
      X.play('wedge'); await X.wait(0.45); X.play('wedge');
      A.s.prop = 1; A.sagA = Math.min(A.sagA, 0.01); X.hand(null);
      if (propMan) SH5.crew.setRole(propMan, 'hold');
      X.line('הסמך תחת הקצה: שתי משיכות אחרונות', 1800);
      A.moment = 'finish'; lab2.set('הסוף', V3(X, xm(), YB.top + 0.75, zc), false);
    }
    function sawFrame(dt) {
      const s = A.s; if (!s || s.done) return;
      const f = A.sawF, inp = { v: f ? A.sawV : 0, w: f ? A.sawW : 0, down: !!f, prop: 0, win: RHY };
      const was = s.inStroke, wasT = s.turn, ct0 = s.ct;
      const ev = sawStep(s, inp, dt, L);
      if (!was && s.inStroke) { (A.lags = A.lags || []).push(+(s.t - s.cEnd).toFixed(3)); if (A.lags.length > 16) A.lags.shift(); }
      else if (f && wasT === 'carp' && inp.v > SAW_K.V_ON) (A.early = A.early || []).push(+(ct0 - s.carpDur).toFixed(3));
      // the saw's place on its axis: his stroke draws it toward him, the carpenter's back
      if (s.turn === 'his' && s.inStroke) A.saw = clamp(A.saw + A.sawV * dt * 1.15, -0.55, 0.55);
      else if (s.turn === 'carp') A.saw = lerp(A.sawEnd != null ? A.sawEnd : 0.55, -0.5, clamp(s.ct / s.carpDur, 0, 1));
      A.cut = xm() + s.drift * F;
      for (const e of ev) {
        A.events.push(e); if (A.events.length > 30) A.events.shift();
        if (e === 'stroke') { const len = clamp(s.len, 0, 1.2); X.play('sawA', { len }); X.dust(A.cut, YB.top - s.depth * H120.BEAM_H, zc + YB.hw + 0.05, Math.round(2 + 6 * len), 0.5 + len); A.sawEnd = A.saw; }
        if (e === 'carp') { setTimeout(() => X.play('sawB'), 60); X.dust(A.cut, YB.top - s.depth * H120.BEAM_H, zc - YB.hw - 0.05, 3, 0.6); }
        if (e === 'skip') { X.play('squeal'); X.line('המסור קפץ מהקו: בהתחלה משיכות קצרות ואיטיות', 2200); }
        if (e === 'jump') { X.play('knot'); X.line('קשר בעץ: קצרות ואיטיות, אחרת המסור קופץ', 2200); }
        if (e === 'bind') { X.play('squeal'); A.bindT = 0.5; if (lv === 1) X.line('הנגר מושך עכשיו: חכו לו', 1800); }
        if (e === 'rhythm') X.quick(handleW(1), 'בקצב!', null);
        if (e === 'tempo') X.line('הנגר מאיץ: קצב מהיר', 1800);
        if (e === 'sag') { X.play('creak'); A.propAsk = 1; X.line(lv === 1 ? 'הקצה נשען למטה: הקישו על הסמך שמתחתיו' : 'הקצה שוקע: הסמך', 0); A.moment = 'prop'; lab2.set('הסמך', V3(X, xm(), YB.top + 0.75, zc), true); if (lv === 1) X.hand(propSpot(), 0, 12); }
        if (e === 'finish') { carpFinish(); return; }
        if (e === 'through') { through(); return; }
      }
      // the moment's word over the kerf (the start, the clear wood, the knot): seen, and heard (the knot grinds)
      if (!s.sag) {
        const inKnot = L.knot && s.depth >= SAW_K.KNOT[0] - 0.02 && s.depth <= SAW_K.KNOT[1];
        const mo = s.n < 2 ? 'start' : inKnot ? 'knot' : 'clear';
        if (mo !== A.moment) {
          A.moment = mo; lab2.set(mo === 'start' ? 'התחלה' : mo === 'knot' ? 'קשר' : 'עץ נקי', V3(X, xm(), YB.top + 0.75, zc), mo === 'knot');
          if (mo === 'clear') X.line(lv === 1 ? 'עכשיו משיכות ארוכות' : '', lv === 1 ? 2000 : 1);
          if (mo === 'knot') { X.play('knot'); X.line('קשר: קצרות ואיטיות', 2000); }
        }
      }
    }
    async function through() {
      A.busy = true; X.hand(null); lab2.set('', null);
      const s = A.s;
      if (s.torn) {
        // without the prop the last fibres tear: a big splinter off the end, a finger shorter
        X.play('crack'); X.shake(0.2, 0.3);
        splinter = box(X, M.h5cedarL, A.cut - 0.05, YB.bot, zc - 0.05, A.cut + 0.45, YB.bot + 0.06, zc + 0.15); splinter.rotation.z = -0.35; all.push(splinter);
        X.loss(20, V3(X, A.cut, YB.top, zc), 'הסיבים נקרעו', 0, 'cedar');
      } else X.play('wood');
      // the offcut drops (on the prop: let down; without it: it falls) with a thud onto the floor, then to the offcut heap (it stays there)
      const y0 = offG.position.y;
      for (let i = 1; i <= 16; i++) { await X.wait(1 / 30); offG.position.y = lerp(y0, H120.FLOOR + 0.02, (i / 16) * (i / 16)); offG.rotation.z = -(s.torn ? 0.5 : 0.08) * (i / 16); }
      X.play('thud'); X.dust(offG.position.x + 0.5, H120.FLOOR + 0.2, zc, 10, 1.6);
      if (sawG) sawG.visible = false; if (carp) SH5.crew.setRole(carp, 'hold');
      await X.wait(0.5);
      const p0 = offG.position.clone(), p1 = V3(X, YARD.offcut[0] - 0.5, H120.FLOOR, YARD.offcut[1]);
      for (let i = 1; i <= 20; i++) { await X.wait(1 / 30); offG.position.lerpVectors(p0, p1, i / 20); }
      finish();
    }
    async function carpFinish() {
      A.busy = true; X.line('ארבע עשרה משיכות: הנגר גומר את החיתוך', 2400);
      const s = A.s; for (let i = 0; i < 20 && s.depth < 1; i++) { s.depth = Math.min(1, s.depth + 0.06); A.saw = Math.sin(i * 1.3) * 0.5; X.play(i % 2 ? 'sawB' : 'sawA', { len: 0.6 }); await X.wait(0.28); }
      through();
    }
    async function finish() {
      const s = A.s, b = { done: 1, by: 'k', need: +need.toFixed(4), meas: +A.meas.toFixed(4), read: A.read, mark: A.mark, drift: +s.drift.toFixed(3), skew: +s.skew.toFixed(3), line: A.line || 'faint', torn: s.torn ? 1 : 0, binds: s.binds, over: s.over ? 1 : 0, strokes: s.n };
      b.cut = +cutLength(b).toFixed(4);
      st.beam[beamId] = { ...(st.beam[beamId] || {}), ...b }; X.save();
      const pts = sawPts(b, lv), q = qOf(pts);
      if (pts >= 40) {
        // the macro: half the red line left on the edge along the whole end
        shot(S_END(), 0.7); await X.wait(0.8);
        X.line('חתכתם את הקו באמצע', 2600); X.quick(V3(X, A.cut, YB.top - 0.1, zc + YB.hw), 'על הקו!', beamM);
        await X.wait(1.4);
      } else await X.wait(0.6);
      A.done = 1;
      X.end({ stars: starsOf(q), q, at: V3(X, xm(), YB.top, zc), perfect: pts >= 40 && !s.torn && !A.slips && !A.checked, lost: false });
    }

    /* ── the camera, the cone, the kohen ── */
    // (the cone of the shots at the bay now; at the yard, the yard's: crews.js keeps six rects of ground, so one place at a time)
    const yardRect = [YB.x0 - 3, zc - 4, YB.x0 + Bay.stock + 3, zc + 4];
    viewCone(X, [cone(S_BAY, 2.5), cone(S_MAC, 1.2)], { keep: [[Math.min(P0[0], P1[0]) - 5, Math.min(P0[1], P1[1]) - 5, Math.max(P0[0], P1[0]) + 5, Math.max(P0[1], P1[1]) + 5]], skip: crew });
    shot(S_BAY, 1.0);
    // the prop waiting by the trestle (tapped in the last third)
    prop = new T.Group(); box(X, M.h5cedarD, -0.1, 0, -0.1, 0.1, YB.bot - H120.FLOOR - 0.1, 0.1, prop);
    { const sp = propSpot(); prop.position.set(sp.x + 1.1, H120.FLOOR + 0.1, zc - 1.7); prop.rotation.set(0, 0.4, Math.PI / 2); } PR.root.add(prop); all.push(prop);

    return {
      close: true,
      begin() {
        X.kohen(false); coneKeep(X); kohenBay(); FG.attach();
        try { A.ta = [document.documentElement.style.touchAction, document.body.style.touchAction]; document.documentElement.style.touchAction = 'none'; document.body.style.touchAction = 'none'; } catch (e) { /* */ }
        X.line(Bay.nbId ? 'מודדים בין ראשי העמודים: העוזר מחזיק את ראש החבל על השריטה' : 'מודדים מהזיז שבקיר אל ראש העמוד', 2600);
        setTimeout(() => { if (A.phase !== 'intro') return; A.phase = 'end'; A.busy = false; X.line(lv === 1 ? 'גררו את קצה החבל אל השריטה שעל העמוד' : 'הקצה אל השריטה', 0); if (lv === 1) X.hand(endW(), 0, 12); }, 1500);
      },
      update(dt) {
        A.t += dt;
        if (A.phase === 'end' && A.endF) X.hand(null);
        if (A.phase === 'end' || A.phase === 'tension' || A.phase === 'read' || A.phase === 'intro') drawCord();
        if (A.phase === 'line') drawString();
        if (A.phase === 'saw') sawFrame(dt);
        if (A.s && sawG) {
          const s = A.s, d = s.depth * H120.BEAM_H;
          sawG.position.set(A.cut, YB.top + 0.265 - d, zc + A.saw); sawG.rotation.y = Math.atan((s.skew * F) / (2 * YB.hw));
          A.bindT = Math.max(0, (A.bindT || 0) - dt); sawG.rotation.x = A.bindT > 0 ? Math.sin(A.t * 60) * 0.04 : 0; blade.scale.y = A.bindT > 0 ? 1.15 : 1;
          kerf.scale.y = Math.max(1e-3, d); kerf.position.set(A.cut, YB.top - d / 2, zc);
          // (the last third: the offcut leans down at the kerf unless the prop holds it)
          if (s.sag && !s.prop) A.sagA = Math.min(0.05, A.sagA + dt * 0.02);
          if (offG && !A.busy) { offG.rotation.z = -A.sagA; offG.position.x = A.cut; }
          // his hands on the near handle (the stroke draws him back), the carpenter's arms with the far one
          // both men's hands on the grips: the kohen draws toward himself (he leans back), the carpenter back toward himself
          if (!A.busy || A.phase === 'saw') {
            if (kf) { handsTo(X, kf, handleW(1), { home: [xm() - 0.6, zc + 2.1], leash: 0.6, spread: -0.12 }); kf.a.bow = kf.a.bowT = clamp(0.25 - A.saw * 0.35, -0.1, 0.5); }
            if (carp) { handsTo(X, carp, handleW(-1), { home: [xm() - 0.1, zc - 2.2], leash: 0.75, spread: -0.12 }); carp.a.bow = carp.a.bowT = clamp(0.25 + A.saw * 0.35, -0.1, 0.5); }
          }
          if (dustP) { const k = clamp(s.depth, 0, 1); dustP.scale.set(0.3 + k * 1.2, 0.2 + k * 1.0, 0.3 + k * 1.2); dustP.position.x = A.cut; }
        }
      },
      down(p) { FG.down(p); },
      move(p) { FG.move(p); },
      up(p) { FG.up(p); },
      cancel() { A.endF = A.tailF = A.lineF = A.sawF = null; A.sawV = 0; },
      wants(p) { return !!nearest(p); },
      holds() { return !!(A.endF || A.tailF || A.lineF || A.sawF); },
      end() {
        FG.detach();
        try { if (A.ta) { document.documentElement.style.touchAction = A.ta[0]; document.body.style.touchAction = A.ta[1]; } } catch (e) { /* */ }
          for (const o of all) { if (o && o.dispose && !o.isObject3D) o.dispose(); else if (o) PR.remove(o); }
        for (const r of [cord, tail, A.yc]) if (r) r.dispose();
        for (const w of crew) SH5.crew.remove(w); for (const l of labs) l.remove();
        X.meter(null); X.hand(null);
        viewCone(X, null); SH5.busy = 0; own('__yard', 0);
      },
      at() { return A.phase === 'saw' || A.phase === 'mark' || A.phase === 'line' ? V3(X, xm(), YB.top, zc) : V3(X, M1[0], CT, M1[1]); },
      dbg() {
        const s = A.s, ax = A.phase === 'saw' ? sawAxis() : null;
        const yx = (x) => sc(X, V3(X, x, YB.top + 0.01, zc));
        return { t: +A.t.toFixed(2), lv, id: beamId, phase: A.phase, busy: A.busy, mouse: MOUSE, need: +need.toFixed(4), u: +A.u.toFixed(4), off: +((A.u - need) / F).toFixed(2), T: +A.T.toFixed(3), slips: A.slips, tries: A.tries, macro: A.macro,
          end: A.phase === 'end' || A.phase === 'tension' ? sc(X, endW()) : null, markAt: A.phase === 'end' || A.phase === 'tension' ? sc(X, V3(X, M1[0], CT, M1[1])) : null,
          tail: A.phase === 'tension' ? sc(X, tailW()) : null, reachT: Math.round(reachT()),
          meas: A.meas != null ? +A.meas.toFixed(4) : null, read: A.read, mark: A.mark, checked: A.checked,
          // (the beam along the rod at the yard: the screen point of a mark at x amot from the squared end)
          tapMeas: A.phase === 'mark' ? yx(YB.x0 + A.read) : null, tapNominal: A.phase === 'mark' ? yx(YB.x0 + Bay.nominal) : null, tapShort: A.phase === 'mark' ? yx(YB.x0 + A.read - 1.5 * TEF) : null, tapLong: A.phase === 'mark' ? yx(YB.x0 + A.read + 4 * F) : null,
          string: A.phase === 'line' ? sc(X, V3(X, xm(), YB.top + 0.05, zc)) : null, reachL: Math.round(reachL()), h: +A.h.toFixed(3), line: A.line,
          handle: ax ? ax.at : null, axis: ax ? ax.dir.map((v) => +v.toFixed(3)) : null, strokePx: Math.round(strokePx()),
          turn: s ? s.turn : null, ct: s ? +s.ct.toFixed(3) : 0, carpDur: s ? s.carpDur : 0, depth: s ? +s.depth.toFixed(3) : 0, n: s ? s.n : 0, cn: s ? s.cn : 0, inStroke: s ? s.inStroke : 0,
          drift: s ? +s.drift.toFixed(2) : 0, skew: s ? +s.skew.toFixed(2) : 0, binds: s ? s.binds : 0, rhythm: s ? s.rhythm : 0, sag: s ? s.sag : 0, prop: s ? s.prop : 0, torn: s ? s.torn : 0, over: s ? s.over || 0 : 0,
          knot: L.knot ? SAW_K.KNOT : null, moment: A.moment, propAt: s && s.sag && !s.prop && !A.propOn ? sc(X, propSpot()) : null, cutLen: st.beam[beamId] && st.beam[beamId].by === 'k' ? st.beam[beamId].cut : null,
          ev: A.events.slice(-8), downs: A.downs, nf: FG.n, lags: A.lags || [], early: (A.early || []).slice(-6),
          // (the frame's audit: each figure's feet and head on the screen, and the work's point)
          figs: [['kohen', kf], ['helper', helper], ['carp', carp], ['prop', propMan]].filter(([, w]) => w && w.a && w.a.visT > 0.5).map(([k, w]) => [k, sc(X, V3(X, w.a.x, w.a.y, w.a.z)), sc(X, V3(X, w.a.x, w.a.y + 3.3 * w.a.s + 0.15, w.a.z))]),
          work: A.phase === 'saw' || A.phase === 'line' ? sc(X, V3(X, xm(), YB.top, zc)) : A.phase === 'mark' ? sc(X, V3(X, YB.x0 + Math.floor(A.read || 11) + 0.5, YB.top, zc)) : sc(X, V3(X, M1[0], CT, M1[1])), H: innerHeight, W: innerWidth };
      },
    };
  },
};
