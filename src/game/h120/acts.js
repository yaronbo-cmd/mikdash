/* ── build 120 ── h120/acts.js — the acts of stage 05 "עזרת הנשים והגזוזטרא" (spec docs/specs/shlav-05-he.md, brief §4–§8). The
 * same registry as stages 01–04:
 *   ACTS[k] = { icon, title, walkLine(m, X), stand(m, X) → { x, z, face }, prepare(m, X), make(m, X) → act }
 *   act = { begin(), update(dt), down(p), move(p), up(p), end(res), at(), dbg(), wants(p), cancel() } — it calls X.end once.
 * This file: station 1, the column (COL): the pull rope, the brake rope round the post, the plumb lines and the wedges; the dynamics
 * are the model's colStep. The other stations are marked below as not built yet (PHASE 2/3/4): started, each ends at once with what
 * the crews would have left (M.done's defaults), with no stars and no points.
 */
import { H120, Y, LV, BAYS, colFresh, colStep, leanAfter, colPts, wedge, windAt, pullShare, qOf, starsOf } from './model.js';
import { SH5, mats, colMesh, colFrame, colBuild, shearLegs, own, keep, label, box, initWorld, frameWorld, viewCone, coneOwn, coneKeep } from './world.js';
import { fingers, MOUSE, onY, heroAt } from '../h113/acts.js';
import { SAW } from './acts2.js';
import { clamp, lerp, ease } from '../h109/kit.js';

const F = H120.FINGER, BAL = H120.BAL, D2R = Math.PI / 180;
const sc = (X, v) => { const r = X.scr(v.x, v.y, v.z); return [Math.round(r.x), Math.round(r.y)]; };
const dist2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/* ───────── station 1: the column (brief §4) ───────── */
// the rig of each bay: the brake post (the kohen's), and for level 3 the block on the wood chamber's south wall the pull rope turns in
const RIG = {
  1: { post: [81.5, 58.8] },
  2: { post: [47.6, -58.4] },
  3: { post: [132.6, -3.5], block: [131.2, 9.5, -27.35], pull: [[129.8, -25.4], [129.1, -24.1], [128.5, -22.7], [127.8, -21.4]], back: [-0.45, 0.89] },   // (one behind the other on the rope's line from the block, 1.5 apart, slanting off the wall so the camera sees each)
};
/** where his work stands: the bay's column (or a free one), its rig, the level's numbers */
function bayOf(m, X) {
  const id = m.free ? m.unit : BAYS[m.lv].col, fr = colFrame(id), lv = m.free ? 3 : X ? X.level() : m.lv;
  const L = m.free ? { ...LV[3], pulley: 0 } : LV[lv];
  const R = (!m.free && RIG[m.lv]) || {};
  const post = R.post || [fr.x + fr.along[0] * 13.5 + fr.across[0] * 3.7, fr.z + fr.along[1] * 13.5 + fr.across[1] * 3.7];
  // (the pullers one behind the other along the rope's line beyond the shear legs, 1.5 amot apart: never a clump, never in the legs)
  const pullers = L.pulley && R.pull ? R.pull : [0, 1, 2, 3].map((k) => { const d = 3.8 + k * 1.6, w = k % 2 ? 0.55 : 0.1; return [fr.x - fr.along[0] * d + fr.across[0] * w, fr.z - fr.along[1] * d + fr.across[1] * w]; });
  return { id, fr, lv, L, post, block: L.pulley ? R.block : null, pullers, back: L.pulley && R.back ? R.back : [-fr.along[0], -fr.along[1]] };
}
export const COL = {
  icon: '🏛', title: 'הקמת העמוד',
  walkLine: () => 'העמוד שוכב ליד הכותל: מקימים אותו',
  stand(m, X) { const b = bayOf(m, X), fr = b.fr; return { x: b.post[0] + fr.along[0] * 1.1 + fr.across[0] * 0.9, z: b.post[1] + fr.along[1] * 1.1 + fr.across[1] * 0.9, face: [b.post[0], b.post[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, PR = X.props, M = mats(X), st = X.M.st;
    const B = bayOf(m, X), { id, fr, lv, L, post } = B;
    SH5.busy = 1; own(id, true);
    { const R = SH5.cols[id]; if (R) { for (const o of R.all) PR.remove(o); SH5.cols[id] = null; } }
    const rig = [];
    const A = { phase: 'intro', s: colFresh(), C: null, vth: H120.CRADLE, drop: null, fall: null, broke: (st.col[id] && st.col[id].broke) | 0, wedges: 0, lean: [0, 0], lockT: 0,
      rope: null, payTot: 0, pullF: null, postF: null, guyF: null, pay: 0, sharpV: 0, sharpOn: false, heave: 0, haul: 0, haulT: 0, quick: {}, macro: 0, settleT: 0, plumbs: null, accepted: false,
      crew: [], guy: [], labs: [], downs: [], creakT: 0, warnT: 0, lineT: 0, events: [], t: 0, busy: true, tapAt: null, bols: 0, soft: 0, plumbOk: 0 };
    const FG = fingers(X, { down: fDown, move: fMove, up: fUp });
    const foot = () => A.C ? A.C.foot : { x: fr.x, z: fr.z };
    // the column on its cradle with the green mark on the plinth (rule 59: the exact place, seen before the first touch)
    function makeCol(o = {}) { if (A.C) PR.remove(A.C.g); A.C = colMesh(X, id, { th: H120.CRADLE, cradle: 1, mark: 1, ...o }); return A.C; }
    makeCol();
    // the shear legs (חמור) over the foot, the head's lashing; the post with three turns of the brake rope
    const head = shearLegs(X, fr, rig, 12, 1.5);
    const postM = new T.Mesh(new T.CylinderGeometry(0.24, 0.28, 1.9, 10), M.h5cedarD); postM.position.set(post[0], H120.FLOOR + 0.95 - 0.35, post[1]); postM.castShadow = true; PR.root.add(postM); rig.push(postM);
    const turns = new T.Group(); for (let k = 0; k < 3; k++) { const r = new T.Mesh(new T.TorusGeometry(0.29, 0.045, 5, 14), M.h5rope); r.rotation.x = Math.PI / 2; r.position.y = 0.95 + k * 0.13; turns.add(r); } turns.position.set(post[0], H120.FLOOR, post[1]); PR.root.add(turns); rig.push(turns);
    const postTop = { x: post[0], y: H120.FLOOR + 1.2, z: post[1] };
    // level 3: the block on the wood chamber's wall the pull rope turns in
    let blockP = null; if (B.block) { blockP = new T.Vector3(...B.block); const bk = new T.Mesh(new T.SphereGeometry(0.28, 8, 6), M.h5cedarD); bk.position.copy(blockP); PR.root.add(bk); rig.push(bk); rig.push(box(X, M.h5bronze, blockP.x - 0.05, blockP.y, blockP.z - 0.12, blockP.x + 0.05, blockP.y + 0.55, blockP.z)); }
    // the ropes: the pull rope (top → the shear head → [the block] → the pullers), the brake rope (top → the post → his hands), the guy (level 2)
    const ropeA = PR.rope(14, 0.055), ropeB = PR.rope(16, 0.055), ropeB2 = B.block ? PR.rope(10, 0.055) : null, brake = PR.rope(16, 0.05), tail = PR.rope(6, 0.045);
    const ropeTaut = M.h5rope, ropePale = new T.MeshStandardMaterial({ color: '#EADFC6', roughness: 0.95 }), ropeDark = new T.MeshStandardMaterial({ color: '#7A5A30', roughness: 0.9 });
    for (const r of [ropeA, ropeB, ropeB2]) if (r && L.colour) r.mesh.material = ropeDark;
    let guy = null, guy2 = null; if (L.wind) { guy = PR.rope(14, 0.045); guy2 = PR.rope(4, 0.045); }
    const links = [1, 2, 3].map(() => PR.rope(4, 0.05));   // (the pull rope runs on through every puller's two hands)
    // the four pullers (rope in hand, they lean and step back as the rope comes), the guy crew of two (level 2)
    const PUL = B.pullers.map((p, k) => { const w = SH5.crew.add(p[0], p[1], { role: 'pull', item: 'rope', fx: blockP ? blockP.x : head.x, fz: blockP ? blockP.z : head.z, crew: 1, off: k * 0.23 }); if (w) A.crew.push(w); return { w, x0: p[0], z0: p[1] }; });
    const guyAt = [fr.x - fr.across[0] * 4.2 + fr.along[0] * 4.5, fr.z - fr.across[1] * 4.2 + fr.along[1] * 4.5];
    const gd = (() => { const dx = guyAt[0] - fr.x, dz = guyAt[1] - fr.z, l = Math.hypot(dx, dz); return [dx / l, dz / l]; })();   // (the guy's way out from the foot: the second man behind the first on it)
    if (L.wind) for (const k of [0, 1]) { const w = SH5.crew.add(guyAt[0] + gd[0] * k * 1.5, guyAt[1] + gd[1] * k * 1.5, { role: 'pull', item: 'rope', fx: fr.x, fz: fr.z, crew: 2, off: k * 0.4 }); if (w) { A.crew.push(w); A.guy.push(w); } }
    // the cloth strip on the shear head (level 2's wind is seen)
    let cloth = null; if (L.wind) { cloth = new T.Mesh(new T.PlaneGeometry(1.4, 0.22, 6, 1), new T.MeshStandardMaterial({ color: '#B8402E', side: T.DoubleSide, roughness: 0.9 })); cloth.position.copy(head).add(new T.Vector3(0, 0.1, 0)); PR.root.add(cloth); rig.push(cloth); }
    // level 1: a pale arc on the floor where the top passes the balance (the brake's place)
    if (L.arc) { const u0 = Math.cos((BAL + L.brakeTol) * D2R) * H120.COL_H, u1 = Math.cos((BAL - L.brakeTol) * D2R) * H120.COL_H, cx = fr.x + fr.along[0] * (u0 + u1) / 2, cz = fr.z + fr.along[1] * (u0 + u1) / 2;
      const arc = new T.Mesh(new T.PlaneGeometry(1, 1), new T.MeshBasicMaterial({ color: 0xFFF4C8, transparent: true, opacity: 0.55, depthWrite: false })); arc.rotation.x = -Math.PI / 2; arc.scale.set(Math.abs(fr.along[0]) * (u1 - u0) + Math.abs(fr.across[0]) * 1.6 || 1.6, Math.abs(fr.along[1]) * (u1 - u0) + Math.abs(fr.across[1]) * 1.6 || 1.6, 1);
      arc.position.set(cx, H120.FLOOR + 0.02, cz); arc.renderOrder = 3; PR.root.add(arc); rig.push(arc); }
    const lab = label(X), lab2 = label(X); A.labs.push(lab, lab2);

    /* the camera: from the side, square to the plane the column swings in (the whole arc, the legs, both crews, the post) */
    const ax = (u, a, y) => [fr.x + fr.along[0] * u + fr.across[0] * a, y, fr.z + fr.along[1] * u + fr.across[1] * a];
    const wide = (d = 0.9) => X.shot(ax(1.8, 55, 13), ax(1.8, 0, 9.4), d);   // (the world camera's lens is long: 55 amot off for the whole rig)
    const macro = () => X.shot(ax(2.2, 11, 8.6), ax(0.3, 0, 7.0), 0.6);
    const plumbShot = () => X.shot(ax(10, 14, 10.5), ax(0.3, 0, 7.6), 1.0);
    // F1: the view cone of every shot of this act is cleared of the world's figures and props (and kept clear while it plays)
    const own0 = [[Math.min(fr.x, post[0], ...B.pullers.map((p) => p[0])) - 6, Math.min(fr.z, post[1], ...B.pullers.map((p) => p[1])) - 6, Math.max(fr.x, post[0], ...B.pullers.map((p) => p[0])) + 6, Math.max(fr.z, post[1], ...B.pullers.map((p) => p[1])) + 6]];
    viewCone(X, [[ax(1.8, 55, 13), ax(1.8, 0, 9.4), 9], [ax(2.2, 11, 8.6), ax(0.3, 0, 7.0), 2], [ax(10, 14, 10.5), ax(0.3, 0, 7.6), 3]], { keep: own0, skip: A.crew });
    wide(1.1);
    // the kohen at the post, the brake rope in his hands (rule 62: his hands work the whole rise)
    const kAt = { x: post[0] + fr.along[0] * 1.1 + fr.across[0] * 0.9, z: post[1] + fr.along[1] * 1.1 + fr.across[1] * 0.9 };
    heroAt(X, kAt.x, kAt.z, post[0], post[1]);
    // F3: his two hands on the brake rope's tail as it comes off the post: free (reaching, upright), pressed (hauled in, leaning back),
    // paying out (his hands go and come with the turns)
    const handFb = { x: kAt.x + (post[0] - kAt.x) * 0.32, y: H120.FLOOR + 1.25, z: kAt.z + (post[1] - kAt.z) * 0.32 };
    let handP = null, payPh = 0;
    function holdRope(dt) {
      let reach = 0.75, lean = 0;
      if (A.postF) { const paying = A.payV > 0.4; payPh += dt * (paying ? 7 : 0); reach = paying ? 0.35 + 0.25 * Math.sin(payPh) : 0.12; lean = paying ? 0.55 : 0.95; }
      A.pose = A.postF ? (A.payV > 0.4 ? 'pay' : 'press') : 'free';
      try { handP = X.hero.rope ? X.hero.rope(postTop, reach, lean) : null; } catch (e) { handP = null; }
    }
    const handK = () => (handP && Number.isFinite(handP.x) && Math.hypot(handP.x - kAt.x, handP.z - kAt.z) < 3 ? handP : handFb);
    const handW = (w, out) => { const H = X.actors && X.actors(); const v = out || new T.Vector3(); try { if (H && H.handWorld) return H.handWorld(w.a, 1, v); } catch (e) { /* */ } return v.set(w.a.x, w.a.y + 1.25, w.a.z); };
    const tmp = new T.Vector3(), tmp2 = new T.Vector3();
    const L0 = A.C.at(1).distanceTo(head);

    /* the grips on the screen: the pull rope's lower leg (its point and the way it is pulled), the post, the guy crew */
    const reachPx = () => Math.max(150, Math.min(innerWidth, innerHeight) * 0.3);
    function gripRope() {
      const from = blockP || head, h0 = PUL[0] && PUL[0].w ? handW(PUL[0].w, tmp2) : tmp2.set(B.pullers[0][0], H120.FLOOR + 1.25, B.pullers[0][1]);
      const g = new T.Vector3().lerpVectors(from, h0, 0.62), a = sc(X, g), b = sc(X, h0), d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(d[0], d[1]) || 1;
      return { at: a, dir: [d[0] / l, d[1] / l] };
    }
    const postScr = () => sc(X, postTop);
    const guyScr = () => (A.guy.length ? sc(X, { x: guyAt[0], y: H120.FLOOR + 1.3, z: guyAt[1] }) : null);
    const R = (p, q) => Math.hypot(p.x - q[0], p.y - q[1]);
    function nearest(p) {
      const L2 = [];
      if (A.phase === 'rise') {
        const g = gripRope(); L2.push(['rope', R(p, g.at)]); L2.push(['post', R(p, postScr())]);
        const gs = guyScr(); if (gs) L2.push(['guy', R(p, gs)]);
      } else if (A.phase === 'plumb' && A.plumbs) {
        for (const [k, q] of Object.entries(sidesScr())) L2.push(['side' + k, R(p, q)]);
        for (let i = 0; i < 2; i++) L2.push(['bob', R(p, sc(X, A.plumbs.bobs[i]))]);
      }
      L2.sort((a, b) => a[1] - b[1]); return L2[0] && L2[0][1] < 90 ? L2[0][0] : null;
    }

    /* the fingers */
    function fDown(f) {
      if (A.busy) return;
      const k = nearest(f); f.what = k; f.t0 = performance.now(); A.downs.push([k, Math.round(f.x), Math.round(f.y), A.phase, postScr()]); if (A.downs.length > 8) A.downs.shift();
      if (k === 'rope') { const g = gripRope(); f.g = g; f.p = 0; A.pullF = f; f.hist = [[f.t0, 0]]; }
      else if (k === 'post') { f.c = postScr(); f.ang = Math.atan2(f.y - f.c[1], f.x - f.c[0]); A.postF = f; A.lockT = 0; onPress(); }
      else if (k === 'guy') { if (A.t - A.haulT > 0.5) { A.haul = 1; A.haulT = A.t; X.play('rope'); } }
    }
    function fMove(f) {
      if (f === A.pullF) {
        const d = (f.x - f.x0) * f.g.dir[0] + (f.y - f.y0) * f.g.dir[1], p = clamp(d / reachPx(), 0, 1);
        // the finger's speed along the rope (level 3: above the threshold the rope creaks)
        const now = performance.now(); f.hist.push([now, d]); while (f.hist.length > 2 && now - f.hist[0][0] > 120) f.hist.shift();
        const v = f.hist.length > 1 ? (d - f.hist[0][1]) / Math.max(0.016, (now - f.hist[0][0]) / 1000) : 0;
        A.sharpV = v; f.p = p;
      } else if (f === A.postF) {
        // (round the post where it was pressed: the macro's camera may move on)
        const c = f.c, a = Math.atan2(f.y - c[1], f.x - c[0]); let da = a - f.ang; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
        if (Math.hypot(f.x - c[0], f.y - c[1]) > 14) { A.pay += (Math.abs(da) / (2 * Math.PI)) * 6; A.payTot += (Math.abs(da) / (2 * Math.PI)) * 6; f.ang = a; }
      }
    }
    function fUp(f) {
      if (f === A.pullF) { A.pullF = null; A.sharpOn = false; A.sharpV = 0; if (f.moved < 10 && performance.now() - f.t0 < 300) { A.heave = 1; X.play('rope'); } }
      else if (f === A.postF) { A.postF = null; }
      else if (A.phase === 'plumb' && !A.busy && f.what) {
        if (f.what === 'bob') accept();
        else if (f.what.startsWith('side')) drive(f.what.slice(4));
      }
    }
    function onPress() {
      // the brake pressed at the balance (rule 64): "בלימה בול!"
      const th = A.s.th;
      if (!A.quick.brake && Math.abs(th - BAL) <= L.brakeTol && A.s.phase === 'rise') { A.quick.brake = 1; A.bols++; X.quick({ x: post[0], y: H120.FLOOR + 1.6, z: post[1] }, 'בלימה בול!', turns); }
      X.play('creak');
    }

    /* step 3: the plumb lines (one each way, from brackets at the top) and the finger scales at the foot (drawn ×5: המחשה) */
    const VS = 5;
    function plumbsMake() {
      const top = A.C.at(1, new T.Vector3()), all = [], bobs = [], lines = [], marks = [];
      for (const [i, dir] of [[0, fr.along], [1, fr.across]]) {
        const tip = new T.Vector3(top.x + dir[0] * 0.95, top.y - 0.15, top.z + dir[1] * 0.95);
        all.push(box(X, M.h5cedarD, Math.min(top.x, tip.x) - 0.04, tip.y - 0.04, Math.min(top.z, tip.z) - 0.04, Math.max(top.x, tip.x) + 0.04, tip.y + 0.04, Math.max(top.z, tip.z) + 0.04));
        const lean = i === 0 ? A.lean[0] : A.lean[1];
        const mark = { x: foot().x + dir[0] * 0.95, z: foot().z + dir[1] * 0.95 }, bob = new T.Vector3(mark.x + dir[0] * lean * F * VS, Y.PLINTH_TOP + 0.4, mark.z + dir[1] * lean * F * VS);
        const ln = PR.rope(4, 0.012); ln.set({ x: bob.x, y: tip.y, z: bob.z }, { x: bob.x, y: bob.y + 0.12, z: bob.z }, 0); lines.push(ln);
        const bm = new T.Mesh(new T.ConeGeometry(0.1, 0.24, 8), M.h5lead); bm.rotation.x = Math.PI; bm.position.copy(bob); PR.root.add(bm); all.push(bm); bobs.push(bob);
        // the scale: a cedar slat on the plinth with a tick per finger (×5) and the green middle
        const slat = box(X, M.h5cedarL, mark.x - Math.abs(dir[0]) * 0.5 - Math.abs(dir[1]) * 0.07, Y.PLINTH_TOP, mark.z - Math.abs(dir[1]) * 0.5 - Math.abs(dir[0]) * 0.07, mark.x + Math.abs(dir[0]) * 0.5 + Math.abs(dir[1]) * 0.07, Y.PLINTH_TOP + 0.03, mark.z + Math.abs(dir[1]) * 0.5 + Math.abs(dir[0]) * 0.07); all.push(slat);
        for (let k = -2; k <= 2; k++) { const x = mark.x + dir[0] * k * F * VS, z = mark.z + dir[1] * k * F * VS, g = k === 0; all.push(box(X, g ? M.h5green : M.h5dark, x - (dir[1] ? 0.09 : 0.012), Y.PLINTH_TOP + 0.03, z - (dir[0] ? 0.09 : 0.012), x + (dir[1] ? 0.09 : 0.012), Y.PLINTH_TOP + 0.045, z + (dir[0] ? 0.09 : 0.012))); }
        marks.push(mark);
      }
      return { all, bobs, lines, marks, swing: 1.2 };
    }
    function plumbsClear() { if (!A.plumbs) return; for (const o of A.plumbs.all) PR.remove(o); for (const l of A.plumbs.lines) l.dispose(); A.plumbs = null; }
    const SIDE = { pa: [1, 0], na: [-1, 0], pc: [0, 1], nc: [0, -1] };
    function sidesScr() { const o = {}, f0 = foot(); for (const [k, [a, c]] of Object.entries(SIDE)) o[k] = sc(X, { x: f0.x + (fr.along[0] * a + fr.across[0] * c) * 0.82, y: Y.PLINTH_TOP - 0.15, z: f0.z + (fr.along[1] * a + fr.across[1] * c) * 0.82 }); return o; }
    function readPlumbs() {
      const fmt = (v) => { const r = Math.abs(Math.round(v * 2) / 2); return r === 0 ? 'האנך באמצע' : r === 0.5 ? 'אנך: חצי אצבע' : r === 1 ? 'אנך: אצבע אחת' : `אנך: ${r} אצבעות`; };
      lab.set(fmt(A.lean[0]), { x: A.plumbs.bobs[0].x, y: A.plumbs.bobs[0].y + 1.0, z: A.plumbs.bobs[0].z }, Math.abs(A.lean[0]) <= L.lean);
      lab2.set(fmt(A.lean[1]), { x: A.plumbs.bobs[1].x, y: A.plumbs.bobs[1].y + 1.0, z: A.plumbs.bobs[1].z }, Math.abs(A.lean[1]) <= L.lean);
    }
    let wedgeMen = [];
    async function drive(k) {
      if (A.busy) return; A.busy = true;
      const [a, c] = SIDE[k], f0 = foot(), px = f0.x + (fr.along[0] * a + fr.across[0] * c) * 1.6, pz = f0.z + (fr.along[1] * a + fr.across[1] * c) * 1.6;
      let w = wedgeMen[0]; if (!w) { w = SH5.crew.add(px, pz, { role: 'hammer', item: 'mallet', fx: f0.x, fz: f0.z, crew: 2 }); if (w) { wedgeMen.push(w); A.crew.push(w); coneOwn(w); } } else { w.a.x = px; w.a.z = pz; SH5.crew.face(w, f0.x, f0.z); w.fx = f0.x; w.fz = f0.z; }
      await X.wait(0.45); X.play('stamp'); X.dust(f0.x + (fr.along[0] * a + fr.across[0] * c) * 0.7, Y.PLINTH_TOP, f0.z + (fr.along[1] * a + fr.across[1] * c) * 0.7, 4, 1.2);
      const cst = { lean: A.lean.slice(), wedges: A.wedges }; wedge(cst, [a, c]); A.lean = cst.lean; A.wedges = cst.wedges;
      A.C.pose(90, A.lean); rebuildCol();
      plumbsClear(); A.plumbs = plumbsMake(); readPlumbs();
      A.busy = false;
    }
    function rebuildCol() { const g = { th: 90, lean: A.lean, off: A.s.off, wedges: A.wedges, chip: A.s.chip, crack: A.s.crack, mark: 0 }; PR.remove(A.C.g); A.C = colMesh(X, id, g); }
    function accept() {
      if (A.busy || A.accepted) return; A.accepted = true; A.busy = true;
      X.line('כך טוב'); X.play('good');
      const c = { done: 1, by: 'k', off: A.s.off.map((v) => +v.toFixed(2)), lean: A.lean.map((v) => +v.toFixed(2)), wedges: A.wedges, chip: A.s.chip ? 1 : 0, crack: A.s.crack ? 1 : 0, broke: A.broke };
      st.col[id] = c; X.save();
      const pts = colPts(c, lv), q = qOf(pts);
      setTimeout(() => X.end({ stars: starsOf(q), q, at: A.C.at(0.5), perfect: pts >= 40 && !A.broke, lost: A.broke > 0 }), 700);
    }

    /* the losses in the world */
    async function fallOver() {
      A.phase = 'fall'; A.busy = true; X.line('');
      // it rocks over the far edge, passes 97° and falls; it breaks in two
      let th = 90, w = A.s.land || 20; X.play('creak');
      while (th < 180 - H120.CRADLE - 2) { await X.wait(1 / 60); w += 40 * Math.sin(Math.max(0.05, (th - 90) * D2R)) / 60 + 0.4; th = Math.min(180 - H120.CRADLE, th + w / 60); A.C.pose(th); }
      const at = A.C.at(0.5); X.play('shatter'); X.shake(0.4, 0.6); X.dust(at.x, H120.FLOOR + 0.5, at.z, 30, 6); X.dust(foot().x, H120.FLOOR + 0.5, foot().z, 16, 4);
      A.broke++;
      X.loss(40, at, 'העמוד נפל ונשבר', 1, 'stone');
      // the two halves, lying where it fell
      PR.remove(A.C.g); A.C = null;
      const half = [], dir = [-fr.along[0], -fr.along[1]];
      for (const [u0, u1, k] of [[0.3, 5.0, 0.12], [5.25, 10.0, -0.1]]) { const m = new T.Mesh(new T.CylinderGeometry(0.53, 0.58, u1 - u0, 16), M.h5marble); m.rotation.set(dir[1] ? Math.PI / 2 : 0, k, dir[0] ? Math.PI / 2 : 0); m.position.set(fr.x + dir[0] * (u0 + u1) / 2 + fr.across[0] * k * 3, H120.FLOOR + 0.55, fr.z + dir[1] * (u0 + u1) / 2 + fr.across[1] * k * 3); m.castShadow = true; PR.root.add(m); half.push(m); }
      const plinthOnly = colMesh(X, id, { th: H120.CRADLE }); plinthOnly.piv.visible = false; half.push(plinthOnly.g);
      X.line('העמוד נפל ונשבר. מביאים עמוד חדש מהמחצבה', 0);
      await X.wait(2.6);
      // the halves are dragged off to the stone pile (they stay there: world.js draws them from st.col[id].broke)
      st.col[id] = { ...(st.col[id] || {}), broke: A.broke }; X.save();
      for (let i = 1; i <= 20; i++) { await X.wait(0.04); for (const h of half.slice(0, 2)) { h.position.x -= fr.across[0] * 0.25; h.position.z -= fr.across[1] * 0.25; h.scale.setScalar(1 - i * 0.03); } }
      for (const h of half) PR.remove(h);
      // the new column comes on a sledge, the crews lay it on the cradle
      const sl = new T.Group(); box(X, M.h5cedarD, -0.9, 0, -5.4, 0.9, 0.3, 5.4, sl); const nc = new T.Mesh(new T.CylinderGeometry(0.5, 0.6, 10, 16), M.h5marble); nc.rotation.x = Math.PI / 2; nc.position.y = 0.9; sl.add(nc);
      sl.rotation.y = Math.atan2(fr.along[0], fr.along[1]); PR.root.add(sl);
      const from = ax(5, 16, 0), to = ax(5, 2.5, 0);
      for (let i = 0; i <= 50; i++) { const u = ease(i / 50); sl.position.set(lerp(from[0], to[0], u), H120.FLOOR, lerp(from[2], to[2], u)); await X.wait(0.05); }
      PR.remove(sl);
      makeCol(); A.s = colFresh(); A.vth = H120.CRADLE; A.quick = {}; A.phase = 'rise'; A.busy = false; A.macro = 0;
      wide(0.8);
      X.line('עמוד חדש על העריסה. מושכים שוב', 2600);
    }
    async function tearDrop(from, cracked) {
      A.phase = 'drop'; A.busy = true;
      X.play('crack'); ropeB.show(false); if (ropeB2) ropeB2.show(false);
      for (let th = from; th > H120.CRADLE; th -= 1.6) { A.C.pose(th); await X.wait(1 / 60); }
      A.C.pose(H120.CRADLE); X.play('thud'); X.shake(0.25, 0.35); X.dust(fr.x + fr.along[0] * 6, H120.FLOOR + 0.4, fr.z + fr.along[1] * 6, 14, 4);
      if (cracked) { X.loss(20, A.C.at(0.6), 'העמוד נסדק לאורכו', 0); makeCol({ crack: 1 }); }
      X.line(cracked ? 'גדיל נקרע והעמוד נפל לעריסה: נסדק. מושכים לאט' : 'גדיל נקרע והעמוד חזר לעריסה. מושכים לאט', 3200);
      await X.wait(1.2); ropeB.show(true); if (ropeB2) ropeB2.show(true);
      A.vth = H120.CRADLE; A.phase = 'rise'; A.busy = false;
    }
    async function landed(ev) {
      A.phase = 'settle'; A.busy = true;
      const f0 = foot(); X.play('thud'); X.shake(0.18, 0.3); X.dust(f0.x, Y.PLINTH_TOP + 0.1, f0.z, 22, 3.2);
      if (ev === 'chip') { X.loss(20, { x: f0.x, y: Y.PLINTH_TOP + 0.4, z: f0.z }, 'שפת הרגל נשברה', 0); X.line('נחת מהר מדי: שפת הרגל נשברה', 3000); }
      else if (A.s.land <= L.land / 2) { A.soft = 1; X.quick({ x: f0.x, y: Y.PLINTH_TOP + 0.6, z: f0.z }, 'נחיתה רכה!', A.C.shaft); }
      A.lean = leanAfter(A.s);
      rebuildCol();
      await X.wait(0.9);
      // step 3: the plumbs; the kohen steps out (rule 62: his hands are not on it now), the crew's wedge man waits
      X.kohen(false);
      A.plumbs = plumbsMake(); plumbShot(); A.phase = 'plumb'; A.settleT = 0;
      for (const r of [ropeA, ropeB, ropeB2, brake, tail, guy, guy2, ...links]) if (r) r.show(false); try { if (X.hero.rope) X.hero.rope(null); } catch (e) { /* */ }
      await X.wait(1.3);
      readPlumbs();
      if (Math.hypot(A.lean[0], A.lean[1]) <= L.lean && A.wedges === 0) { A.plumbOk = 1; X.quick(A.plumbs.bobs[0], 'אנך!', null); }
      X.line(lv === 1 ? 'הקישו על צד הבסיס לתקוע טריז · הקישו על המשקולת: כך טוב' : 'טריז בצד הבסיס · המשקולת: כך טוב');
      if (lv === 1) { const big = Math.abs(A.lean[0]) >= Math.abs(A.lean[1]) ? (A.lean[0] > 0.5 ? 'pa' : A.lean[0] < -0.5 ? 'na' : null) : (A.lean[1] > 0.5 ? 'pc' : A.lean[1] < -0.5 ? 'nc' : null); const s = big ? SIDE[big] : null; X.hand(s ? { x: f0.x + (fr.along[0] * s[0] + fr.across[0] * s[1]) * 0.8, y: Y.PLINTH_TOP, z: f0.z + (fr.along[1] * s[0] + fr.across[1] * s[1]) * 0.8 } : A.plumbs.bobs[0], 0, 12); }
      A.busy = false;
    }

    /* the ropes drawn each frame */
    function ropes(dt) {
      const top = A.C ? A.C.at(0.97, tmp) : null; if (!top) return;
      const th = A.vth, slack = th > BAL + 4 || A.phase !== 'rise';
      const sagA = slack ? 0.7 : 0.02 + (L.wind ? Math.sin(A.t * 9) * 0.06 * Math.abs(windAt(A.t)) : 0);
      ropeA.set({ x: top.x, y: top.y, z: top.z }, { x: head.x, y: head.y, z: head.z }, sagA);
      const h0 = PUL[0] && PUL[0].w ? handW(PUL[0].w, tmp2) : tmp2.set(B.pullers[0][0], H120.FLOOR + 1.25, B.pullers[0][1]);
      for (let k = 1; k < PUL.length; k++) { const a = PUL[k - 1].w ? handW(PUL[k - 1].w, new T.Vector3()) : null, b = PUL[k].w ? handW(PUL[k].w, new T.Vector3()) : null; if (a && b) links[k - 1].set({ x: a.x, y: a.y, z: a.z }, { x: b.x, y: b.y, z: b.z }, slack ? 0.25 : 0.06); }
      if (blockP) { ropeB.set({ x: head.x, y: head.y, z: head.z }, { x: blockP.x, y: blockP.y, z: blockP.z }, slack ? 0.4 : 0.02); ropeB2.set({ x: blockP.x, y: blockP.y, z: blockP.z }, { x: h0.x, y: h0.y, z: h0.z }, slack ? 0.8 : 0.05); }
      else ropeB.set({ x: head.x, y: head.y, z: head.z }, { x: h0.x, y: h0.y, z: h0.z }, slack ? 1.0 : 0.05);
      // level 1–2: past the balance the pull rope goes pale (slack)
      if (L.colour) { const mt = A.s.slack || th > BAL + 0.5 ? ropePale : ropeDark; for (const r of [ropeA, ropeB, ropeB2]) if (r && r.mesh.material !== mt) r.mesh.material = mt; }
      const taut = A.s.lock != null && th >= A.s.lock - 0.4 && th > BAL - 6;
      brake.set({ x: top.x, y: top.y, z: top.z }, { x: postTop.x, y: postTop.y, z: postTop.z }, taut ? 0.03 : 0.25 + 0.4 * (1 - th / 90));
      const hk = handK(); tail.set({ x: postTop.x, y: postTop.y - 0.1, z: postTop.z }, hk, taut ? 0.02 : 0.15);
      if (guy) { const g0 = A.guy[0] ? handW(A.guy[0], tmp2) : tmp2.set(guyAt[0], 7.3, guyAt[1]); const taut = A.s.guyHold ? 0.02 : 0.1 + 0.12 * Math.abs(Math.sin(A.t * 7)); guy.set({ x: top.x, y: top.y - 0.3, z: top.z }, { x: g0.x, y: g0.y, z: g0.z }, taut); if (A.guy[1]) { const g1 = handW(A.guy[1], new T.Vector3()); guy2.set({ x: g0.x, y: g0.y, z: g0.z }, { x: g1.x, y: g1.y, z: g1.z }, 0.06); } }
      // the pullers step back as the rope comes in
      const took = clamp((L0 - (A.C ? A.C.at(1, tmp2).distanceTo(head) : L0)) * 0.35, 0, 3), bx = B.back[0], bz = B.back[1];
      for (const P of PUL) if (P.w) { P.w.a.x = P.x0 + bx * took; P.w.a.z = P.z0 + bz * took; }
      if (cloth) { const g = Math.abs(windAt(A.t)); cloth.rotation.y = Math.atan2(-fr.across[0], -fr.across[1]) + Math.sin(A.t * 11) * 0.3 * g; cloth.scale.x = 0.6 + 0.4 * Math.min(1, g); }
    }

    let lastDust = 0;
    return {
      close: true,
      begin() {
        X.kohen(true); coneKeep(X);
        // (two fingers on the rope and the post are the work's own: the page never takes them for a pinch-zoom, whatever lies under them)
        try { A.ta = [document.documentElement.style.touchAction, document.body.style.touchAction]; document.documentElement.style.touchAction = 'none'; document.body.style.touchAction = 'none'; } catch (e) { /* */ }
        X.line('על עמודי הסטווים בהר הבית: וכל אחד מהם היה אבן אחת, שיש לבן (יוסף בן מתתיהו, מלחמת היהודים ה, ה, ב)', 4200);
        FG.attach();
        setTimeout(() => {
          if (A.phase !== 'intro') return; A.phase = 'rise'; A.busy = false;
          X.line(lv === 1 ? 'משכו את החבל למטה' : lv === 2 ? 'רוח מזרחית: הקישו על אנשי החבל הצדדי' : 'החבל עובר בגלגלת: מושכים לאט');
          const g = gripRope(); X.hand(null); void g;
        }, 1800);
      },
      update(dt) {
        A.t += dt;
        if (A.phase === 'rise') {
          const s = A.s, pf = A.pullF;
          let sharp = false;
          if (L.pulley && pf) { const thr = 1.6 * Math.min(innerWidth, innerHeight); if (A.sharpV > thr && !A.sharpOn) { A.sharpOn = true; sharp = true; } else if (A.sharpV < thr * 0.4) A.sharpOn = false; }
          const inp = { held: !!pf, pT: pf ? pf.p : 0, heave: A.heave, press: !!A.postF, pay: A.postF ? A.pay : 0, sharp, wind: L.wind ? windAt(A.t) : 0, haul: A.haul };
          A.payV = A.postF ? inp.pay / Math.max(1e-3, dt) : 0; A.heave = 0; A.haul = 0; A.pay = 0;
          const ev = colStep(s, inp, dt, L);
          A.vth = s.th;
          if (A.C) {
            A.C.pose(s.th);
            // (level 2: the wind's sway, fingers at the top, tilts it toward the court about the gallery's axis)
            if (L.wind && s.sway) { const ang = (s.sway * F) / H120.COL_H, sg = Math.sign(-fr.along[1] * fr.across[0] + fr.along[0] * fr.across[1]) || 1; A.C.piv.quaternion.premultiply(new T.Quaternion().setFromAxisAngle(new T.Vector3(fr.along[0], 0, fr.along[1]), ang * sg)); }
          }
          if (A.C && A.C.cradle && s.th > H120.CRADLE + 3) A.C.cradle.visible = false;
          for (const e of ev) {
            A.events.push(e); if (A.events.length > 30) A.events.shift();
            if (e === 'creak' && A.t - A.creakT > 1.6) { A.creakT = A.t; X.play('creak'); X.line('החבל האחורי תפוס: שחררו את היתד', 2000); }
            if (e === 'warn') { X.play('creak'); X.line('לאט! החבל חורק', 2400); }
            if (e === 'jerk') X.dust(foot().x, Y.PLINTH_TOP, foot().z, 3, 0.8);
            if (e === 'tear') { tearDrop(s.tearFrom || 40, !!s.crack && !A.cracked); if (s.crack) A.cracked = 1; return; }
            if (e === 'land' || e === 'chip') { landed(e); return; }
            if (e === 'fall') { fallOver(); return; }
            if (e === 'cross' && lv === 1) X.line('עבר את נקודת האיזון: היתד!', 1600);
          }
          // level 1's second line, from 60°: the post (and once pressed, how to let it down)
          if (lv === 1 && !A.hint2 && s.th >= 60) { A.hint2 = 1; X.line('כשהעמוד מתחיל ליפול לבד: אצבע על היתד'); }
          if (lv === 1 && A.hint2 === 1 && A.postF && s.th >= BAL - 6) { A.hint2 = 2; X.line('סיבוב סביב היתד מוריד אותו לאט', 2600); }
          // the macro for the last ten degrees, then back
          if (!A.macro && s.th >= 80 && A.postF) { A.macro = 1; macro(); }
          if (L.wind && Math.abs(windAt(A.t)) > 0.8 && A.t - lastDust > 0.25) { lastDust = A.t; const k = (A.t * 7) % 1; X.dust(fr.x + fr.along[0] * (k * 12 - 4) - fr.across[0] * 2, H120.FLOOR + 0.6, fr.z + fr.along[1] * (k * 12 - 4) - fr.across[1] * 2, 2, 2.4); }
        }
        if (A.phase === 'rise' || A.phase === 'intro' || A.phase === 'drop') holdRope(dt);
        if (A.C) ropes(dt);
      },
      down(p) { FG.down(p); },
      move(p) { FG.move(p); },
      up(p) { FG.up(p); },
      cancel() { if (A.pullF) A.pullF = null; if (A.postF) A.postF = null; },
      wants(p) { return !!nearest(p); },
      holds() { return !!(A.pullF || A.postF); },
      end() {
        FG.detach();
        try { if (A.ta) { document.documentElement.style.touchAction = A.ta[0]; document.body.style.touchAction = A.ta[1]; } } catch (e) { /* */ }
        for (const o of rig) PR.remove(o); for (const r of [ropeA, ropeB, ropeB2, brake, tail, guy, guy2, ...links]) if (r) r.dispose();
        try { if (X.hero.rope) X.hero.rope(null); } catch (e) { /* */ }
        plumbsClear(); for (const w of A.crew) SH5.crew.remove(w); A.crew = []; for (const l of A.labs) l.remove();
        if (A.C) PR.remove(A.C.g);
        viewCone(X, null); SH5.busy = 0; X.hand(null); own(id, false); colBuild(X, id);
      },
      at() { return A.C ? A.C.at(0.6) : { x: fr.x, y: 10, z: fr.z }; },
      dbg() {
        const s = A.s, g = A.phase === 'rise' ? gripRope() : null;
        return { t: +A.t.toFixed(2), haulT: +A.haulT.toFixed(2), lv, id, phase: A.phase, busy: A.busy, th: +s.th.toFixed(2), w: +s.w.toFixed(2), p: +s.p.toFixed(2), pT: +s.pT.toFixed(2), lock: s.lock == null ? null : +s.lock.toFixed(2), held: s.held, crossed: s.crossed, slack: s.slack,
          land: +s.land.toFixed(2), off: s.off.map((v) => +v.toFixed(2)), lean: A.lean, sway: +(+s.sway || 0).toFixed(2), wedges: A.wedges, chip: s.chip, crack: s.crack, broke: A.broke, tears: s.tears, sharp: s.sharp,
          BAL, tol: L.brakeTol, land0: L.land, leanTol: L.lean, footTol: L.foot, pulley: L.pulley, wind: L.wind, bols: A.bols, soft: A.soft, plumbOk: A.plumbOk,
          rope: g ? g.at : null, ropeTo: g ? [Math.round(g.at[0] + g.dir[0] * reachPx()), Math.round(g.at[1] + g.dir[1] * reachPx())] : null, reach: Math.round(reachPx()), sharpPx: Math.round(1.6 * Math.min(innerWidth, innerHeight)),
          post: postScr(), guy: guyScr(), sides: A.phase === 'plumb' ? sidesScr() : null, bobs: A.plumbs ? A.plumbs.bobs.map((b) => sc(X, b)) : null, mouse: MOUSE, ev: A.events.slice(-6), downs: A.downs, nf: FG.n, pay: +A.payTot.toFixed(2), pose: A.pose || 'free', guyHold: s.guyHold | 0, gust: L.wind ? +windAt(A.t).toFixed(2) : 0, gustIn: L.wind ? (() => { for (let k = 0; k < 80; k++) if (Math.abs(windAt(A.t + k * 0.1)) > 0.3) return +(k * 0.1).toFixed(1); return 8; })() : 99, hand: handP ? sc(X, handP) : null };
      },
    };
  },
};

/* ───────── PHASE 2/3/4: not built yet — the crews do these works (each ends at once with M.done's defaults: no stars, no points) ───────── */
function crewsDo(icon, title, walk) {
  return {
    icon, title, walkLine: () => walk,
    stand(m) { const c = BAYS[m.lv] ? BAYS[m.lv] : BAYS[1], b = colFrame(c.col); return { x: b.x + b.across[0] * 6, z: b.z + b.across[1] * 6, face: [b.x, b.z] }; },
    prepare() {},
    make(m, X) {
      let done = false, t = 0; const sp = this.stand(m), at = { x: sp.face[0], y: 10, z: sp.face[1] };
      return {
        begin() { X.line('את העבודה הזאת עושים הצוותים בינתיים', 2000); },
        update(dt) { t += dt; if (!done && t > 1.2) { done = true; X.end({ stars: 0, q: 0, at }); } },
        at() { return at; },
        dbg() { return { phase: 'crews', stub: true }; },
      };
    },
  };
}
export const CARRY = crewsDo('🪵', 'מסע הקורה', 'הקורה מוכנה: נושאים אותה אל המפתח');               // PHASE 3: not built yet
export const MIKVEH = crewsDo('💧', 'מקווה לשכת המצורעים', 'הלשכה בלי תקרה, והגשם יורד לתוכה: מביאים את המים אל המקווה');   // PHASE 3: not built yet
export const PLANKS = crewsDo('🪵', 'סידור הלוחות', 'הלוחות על הקורות');                         // PHASE 4: not built yet

export { SAW };
export const ACTS = {
  col: COL, saw: SAW, carry: CARRY, mikveh: MIKVEH, planks: PLANKS,
  __init: initWorld,
  __sh: () => SH5,
  __frame(dt, X) { frameWorld(dt, X); },
};
export { onY };
