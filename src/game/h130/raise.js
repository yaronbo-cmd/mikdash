/* ── build 130 ── h130/raise.js — level 3's peak (spec "השיא: הרמת העמוד", brief §3): the last column of the east run is raised on the
 * ropes exactly as in builds 120 and 124 — build 120's COL act (h120/acts.js) taken as it is at its level 3 (the pull rope through the
 * block on the wood chamber's wall, four pullers, the brake rope round the kohen's post, the plumb lines and the wedges), with build
 * 124's rule 66 behaviour (wants: only a touch on the rope, the post, a plinth side or a bob; holds: both fingers on the rope and the
 * post). What changed in the move: the column's frame is given (his place on the run, not a fixed bay), the world is h130's
 * (world.js: colMesh, shearLegs, label, the gang), it ends by calling back the gallery act (onEnd) instead of X.end, the camera lifts
 * a little by itself before the two-hand moment (X.lookLift), and only a fall costs points (the loss table: gal.column −40, the halves
 * stay at brokeAt); a chipped foot or a cracked shaft stay on the column and cost stars.
 *   raiseAct(X, { fr, id, onEnd }) → { begin, update, down, move, up, cancel, wants, holds, end, at, dbg }
 *   fr: { x, z, along, across } (the foot; the way it lies on its cradle; the court's side)
 */
import { RAISE_LV, CRADLE, BAL, COL_H, FINGER, colFresh, colStep, leanAfter, colPts, wedge, LOSS, QUICK } from './model.js';
import { SH130, GEO, Y, mats, colMesh, shearLegs, label, box } from './world.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { clamp, lerp, ease } from '../h109/kit.js';
import { BOOK } from '../world/grid.js';

const S5 = BOOK.s05, F = FINGER, D2R = Math.PI / 180, L = RAISE_LV, BURST = 30;   // (BURST: the fall's dust, grains)
const sc = (X, v) => { const r = X.scr(v.x, v.y, v.z); return [Math.round(r.x), Math.round(r.y)]; };
// (the rig: the brake post, the block on the wood chamber's south wall, the four pullers one behind the other on the rope's line from
//  the block; back: the rope's way off them — rig.3 of the book, build 127's)
const RIG = { ...S5.rig[3], back: [-0.45, 0.89] };
/** where the kohen stands at the post (stands.col3) */
export const raiseStand = () => { const s = S5.stands.col3; return { x: s[0], z: s[1], face: [s[2], s[3]] }; };

export function raiseAct(X, o) {
  const T = X.THREE, PR = X.props, M = mats(X), fr = o.fr, post = RIG.post;
  const rig = [];
  const A = { phase: 'intro', s: colFresh(), C: null, vth: CRADLE, broke: 0, wedges: 0, lean: [0, 0], lockT: 0,
    payTot: 0, pullF: null, postF: null, pay: 0, sharpV: 0, sharpOn: false, heave: 0, quick: {}, macro: 0, plumbs: null, accepted: false,
    crew: [], labs: [], downs: [], creakT: 0, events: [], t: 0, busy: true, bols: 0, soft: 0, plumbOk: 0, hint2: 0, payV: 0 };
  const FG = fingers(X, { down: fDown, move: fMove, up: fUp });
  const foot = () => (A.C ? A.C.foot : { x: fr.x, z: fr.z });
  function makeCol(g = {}) { if (A.C) PR.remove(A.C.g); A.C = colMesh(X, fr, { th: CRADLE, cradle: 1, mark: 1, ...g }); return A.C; }
  makeCol();
  const head = shearLegs(X, fr, rig, 12, 1.5);
  const postM = new T.Mesh(new T.CylinderGeometry(0.24, 0.28, 1.9, 10), M.n5cedarD); postM.position.set(post[0], GEO.FLOOR + 0.95 - 0.35, post[1]); postM.castShadow = true; PR.root.add(postM); rig.push(postM);
  const turns = new T.Group(); for (let k = 0; k < 3; k++) { const r = new T.Mesh(new T.TorusGeometry(0.29, 0.045, 5, 14), M.n5rope); r.rotation.x = Math.PI / 2; r.position.y = 0.95 + k * 0.13; turns.add(r); } turns.position.set(post[0], GEO.FLOOR, post[1]); PR.root.add(turns); rig.push(turns);
  const postTop = { x: post[0], y: GEO.FLOOR + 1.2, z: post[1] };
  const blockP = new T.Vector3(...RIG.block); { const bk = new T.Mesh(new T.SphereGeometry(0.28, 8, 6), M.n5cedarD); bk.position.copy(blockP); PR.root.add(bk); rig.push(bk); rig.push(box(X, M.n5bronze, blockP.x - 0.05, blockP.y, blockP.z - 0.12, blockP.x + 0.05, blockP.y + 0.55, blockP.z)); }
  const ropeA = PR.rope(14, 0.055), ropeB = PR.rope(16, 0.055), ropeB2 = PR.rope(10, 0.055), brake = PR.rope(16, 0.05), tail = PR.rope(6, 0.045);
  const links = [1, 2, 3].map(() => PR.rope(4, 0.05));
  const PUL = RIG.pull.map((p, k) => { const w = SH130.crew ? SH130.crew.add(p[0], p[1], { role: 'pull', item: 'rope', fx: blockP.x, fz: blockP.z, crew: 1, off: k * 0.23 }) : null; if (w) A.crew.push(w); return { w, x0: p[0], z0: p[1] }; });
  const lab = label(X), lab2 = label(X); A.labs.push(lab, lab2);

  /* the camera: from the side, square to the plane the column swings in */
  const ax = (u, a, y) => [fr.x + fr.along[0] * u + fr.across[0] * a, y, fr.z + fr.along[1] * u + fr.across[1] * a];
  const CR = S5.cam.raise, sh = (k, d) => X.shot(ax(...CR[k][0]), ax(...CR[k][1]), d);
  const wide = (d = 0.9) => sh('wide', d);
  const macro = () => sh('macro', 0.6);
  const plumbShot = () => sh('plumb', 1.0);
  const kAt = raiseStand();
  const handFb = { x: kAt.x + (post[0] - kAt.x) * 0.32, y: GEO.FLOOR + 1.25, z: kAt.z + (post[1] - kAt.z) * 0.32 };
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

  /* the grips: the pull rope's lower leg, the post; then the plinth's sides and the bobs */
  const reachPx = () => Math.max(150, Math.min(innerWidth, innerHeight) * 0.3);
  function gripRope() {
    const h0 = PUL[0] && PUL[0].w ? handW(PUL[0].w, tmp2) : tmp2.set(RIG.pull[0][0], GEO.FLOOR + 1.25, RIG.pull[0][1]);
    const g = new T.Vector3().lerpVectors(blockP, h0, 0.62), a = sc(X, g), b = sc(X, h0), d = [b[0] - a[0], b[1] - a[1]], l = Math.hypot(d[0], d[1]) || 1;
    return { at: a, dir: [d[0] / l, d[1] / l] };
  }
  const postScr = () => sc(X, postTop);
  const R = (p, q) => Math.hypot(p.x - q[0], p.y - q[1]);
  function nearest(p) {
    const L2 = [];
    if (A.phase === 'rise') { const g = gripRope(); L2.push(['rope', R(p, g.at)]); L2.push(['post', R(p, postScr())]); }
    else if (A.phase === 'plumb' && A.plumbs) {
      for (const [k, q] of Object.entries(sidesScr())) L2.push(['side' + k, R(p, q)]);
      for (let i = 0; i < 2; i++) L2.push(['bob', R(p, sc(X, A.plumbs.bobs[i]))]);
    }
    L2.sort((a, b) => a[1] - b[1]); return L2[0] && L2[0][1] < 90 ? L2[0][0] : null;
  }

  /* the fingers */
  function fDown(f) {
    if (A.busy) return;
    const k = nearest(f); f.what = k; f.t0 = performance.now(); A.downs.push([k, Math.round(f.x), Math.round(f.y), A.phase]); if (A.downs.length > 8) A.downs.shift();
    if (k === 'rope') { f.g = gripRope(); f.p = 0; A.pullF = f; f.hist = [[f.t0, 0]]; }
    else if (k === 'post') { f.c = postScr(); f.ang = Math.atan2(f.y - f.c[1], f.x - f.c[0]); A.postF = f; onPress(); }
  }
  function fMove(f) {
    if (f === A.pullF) {
      const d = (f.x - f.x0) * f.g.dir[0] + (f.y - f.y0) * f.g.dir[1], p = clamp(d / reachPx(), 0, 1);
      const now = performance.now(); f.hist.push([now, d]); while (f.hist.length > 2 && now - f.hist[0][0] > 120) f.hist.shift();
      A.sharpV = f.hist.length > 1 ? (d - f.hist[0][1]) / Math.max(0.016, (now - f.hist[0][0]) / 1000) : 0; f.p = p;
    } else if (f === A.postF) {
      const c = f.c, a = Math.atan2(f.y - c[1], f.x - c[0]); let da = a - f.ang; while (da > Math.PI) da -= 2 * Math.PI; while (da < -Math.PI) da += 2 * Math.PI;
      if (Math.hypot(f.x - c[0], f.y - c[1]) > 14) { A.pay += (Math.abs(da) / (2 * Math.PI)) * 6; A.payTot += (Math.abs(da) / (2 * Math.PI)) * 6; f.ang = a; }
    }
  }
  function fUp(f) {
    if (f === A.pullF) { A.pullF = null; A.sharpOn = false; A.sharpV = 0; if (f.moved < 10 && performance.now() - f.t0 < 300) { A.heave = 1; X.play('rope'); } }
    else if (f === A.postF) { A.postF = null; }
    else if (A.phase === 'plumb' && !A.busy && f.what) { if (f.what === 'bob') accept(); else if (f.what.startsWith('side')) drive(f.what.slice(4)); }
  }
  function onPress() {
    if (!A.quick.brake && Math.abs(A.s.th - BAL) <= L.brakeTol && A.s.phase === 'rise') { A.quick.brake = 1; A.bols++; X.quick({ x: post[0], y: GEO.FLOOR + 1.6, z: post[1] }, QUICK.brake, turns); }
    X.play('creak');
  }

  /* the plumb lines and the finger scales at the foot (drawn ×5: המחשה) */
  const VS = 5;
  function plumbsMake() {
    const top = A.C.at(1, new T.Vector3()), all = [], bobs = [], lines = [];
    for (const [i, dir] of [[0, fr.along], [1, fr.across]]) {
      const tip = new T.Vector3(top.x + dir[0] * 0.95, top.y - 0.15, top.z + dir[1] * 0.95);
      all.push(box(X, M.n5cedarD, Math.min(top.x, tip.x) - 0.04, tip.y - 0.04, Math.min(top.z, tip.z) - 0.04, Math.max(top.x, tip.x) + 0.04, tip.y + 0.04, Math.max(top.z, tip.z) + 0.04));
      const lean = A.lean[i], mark = { x: foot().x + dir[0] * 0.95, z: foot().z + dir[1] * 0.95 }, bob = new T.Vector3(mark.x + dir[0] * lean * F * VS, Y.PLINTH_TOP + 0.4, mark.z + dir[1] * lean * F * VS);
      const ln = PR.rope(4, 0.012); ln.set({ x: bob.x, y: tip.y, z: bob.z }, { x: bob.x, y: bob.y + 0.12, z: bob.z }, 0); lines.push(ln);
      const bm = new T.Mesh(new T.ConeGeometry(0.1, 0.24, 8), M.n5lead); bm.rotation.x = Math.PI; bm.position.copy(bob); PR.root.add(bm); all.push(bm); bobs.push(bob);
      all.push(box(X, M.n5cedarL, mark.x - Math.abs(dir[0]) * 0.5 - Math.abs(dir[1]) * 0.07, Y.PLINTH_TOP, mark.z - Math.abs(dir[1]) * 0.5 - Math.abs(dir[0]) * 0.07, mark.x + Math.abs(dir[0]) * 0.5 + Math.abs(dir[1]) * 0.07, Y.PLINTH_TOP + 0.03, mark.z + Math.abs(dir[1]) * 0.5 + Math.abs(dir[0]) * 0.07));
      for (let k = -2; k <= 2; k++) { const x = mark.x + dir[0] * k * F * VS, z = mark.z + dir[1] * k * F * VS; all.push(box(X, k === 0 ? M.n5green : M.n5dark, x - (dir[1] ? 0.09 : 0.012), Y.PLINTH_TOP + 0.03, z - (dir[0] ? 0.09 : 0.012), x + (dir[1] ? 0.09 : 0.012), Y.PLINTH_TOP + 0.045, z + (dir[0] ? 0.09 : 0.012))); }
    }
    return { all, bobs, lines };
  }
  function plumbsClear() { if (!A.plumbs) return; for (const q of A.plumbs.all) PR.remove(q); for (const l of A.plumbs.lines) l.dispose(); A.plumbs = null; }
  const SIDE = { pa: [1, 0], na: [-1, 0], pc: [0, 1], nc: [0, -1] };
  function sidesScr() { const out = {}, f0 = foot(); for (const [k, [a, c]] of Object.entries(SIDE)) out[k] = sc(X, { x: f0.x + (fr.along[0] * a + fr.across[0] * c) * 0.82, y: Y.PLINTH_TOP - 0.15, z: f0.z + (fr.along[1] * a + fr.across[1] * c) * 0.82 }); return out; }
  function readPlumbs() {
    const fmt = (v) => { const r = Math.abs(Math.round(v * 2) / 2); return r === 0 ? 'האנך באמצע' : r === 0.5 ? 'אנך: חצי אצבע' : r === 1 ? 'אנך: אצבע אחת' : `אנך: ${r} אצבעות`; };
    lab.set(fmt(A.lean[0]), { x: A.plumbs.bobs[0].x, y: A.plumbs.bobs[0].y + 1.0, z: A.plumbs.bobs[0].z }, Math.abs(A.lean[0]) <= L.lean);
    lab2.set(fmt(A.lean[1]), { x: A.plumbs.bobs[1].x, y: A.plumbs.bobs[1].y + 1.0, z: A.plumbs.bobs[1].z }, Math.abs(A.lean[1]) <= L.lean);
  }
  let wedgeMan = null;
  async function drive(k) {
    if (A.busy) return; A.busy = true;
    const [a, c] = SIDE[k], f0 = foot(), px = f0.x + (fr.along[0] * a + fr.across[0] * c) * 1.6, pz = f0.z + (fr.along[1] * a + fr.across[1] * c) * 1.6;
    if (!wedgeMan && SH130.crew) { wedgeMan = SH130.crew.add(px, pz, { role: 'hammer', item: 'mallet', fx: f0.x, fz: f0.z, crew: 2 }); if (wedgeMan) A.crew.push(wedgeMan); }
    else if (wedgeMan) { wedgeMan.a.x = px; wedgeMan.a.z = pz; SH130.crew.face(wedgeMan, f0.x, f0.z); wedgeMan.fx = f0.x; wedgeMan.fz = f0.z; }
    await X.wait(0.45); X.play('stamp'); X.dust(f0.x + (fr.along[0] * a + fr.across[0] * c) * 0.7, Y.PLINTH_TOP, f0.z + (fr.along[1] * a + fr.across[1] * c) * 0.7, 4, 1.2);
    const cst = { lean: A.lean.slice(), wedges: A.wedges }; wedge(cst, [a, c]); A.lean = cst.lean; A.wedges = cst.wedges;
    rebuildCol(); plumbsClear(); A.plumbs = plumbsMake(); readPlumbs();
    A.busy = false;
  }
  function rebuildCol() { PR.remove(A.C.g); A.C = colMesh(X, fr, { th: 90, lean: A.lean, off: A.s.off, wedges: A.wedges, chip: A.s.chip, crack: A.s.crack }); }
  function accept() {
    if (A.busy || A.accepted) return; A.accepted = true; A.busy = true;
    X.line('כך טוב'); X.play('good');
    const c = { off: A.s.off.map((v) => +v.toFixed(2)), lean: A.lean.map((v) => +v.toFixed(2)), wedges: A.wedges, chip: A.s.chip ? 1 : 0, crack: A.s.crack ? 1 : 0, broke: A.broke };
    setTimeout(() => { try { o.onEnd({ c, pts: colPts(c), bols: A.bols, soft: A.soft, plumbOk: A.plumbOk }); } catch (e) { console.warn('[h130] raise end', e && e.message); } }, 700);
  }

  /* the losses in the world: only the fall costs (gal.column −40, the halves by the gate) */
  async function fallOver() {
    A.phase = 'fall'; A.busy = true; X.line('');
    let th = 90, w = A.s.land || 20; X.play('creak');
    while (th < 180 - CRADLE - 2) { await X.wait(1 / 60); w += 40 * Math.sin(Math.max(0.05, (th - 90) * D2R)) / 60 + 0.4; th = Math.min(180 - CRADLE, th + w / 60); A.C.pose(th); }
    const at = A.C.at(0.5); X.play('shatter'); X.shake(0.4, 0.6); X.dust(at.x, GEO.FLOOR + 0.5, at.z, BURST, 6); X.dust(foot().x, GEO.FLOOR + 0.5, foot().z, 16, 4);
    A.broke++;
    X.loss(40, at, LOSS['gal.column'][0], 1, 'stone');
    try { X.M.mark('gal.column', o.id, [+S5.brokeAt[0], +S5.brokeAt[1]], A.broke); X.save(); } catch (e) { /* */ }
    PR.remove(A.C.g); A.C = null;
    const half = [], dir = [-fr.along[0], -fr.along[1]];
    for (const [u0, u1, k] of [[0.3, 5.0, 0.12], [5.25, 10.0, -0.1]]) { const m = new T.Mesh(new T.CylinderGeometry(0.53, 0.58, u1 - u0, 16), M.n5marble); m.rotation.set(dir[1] ? Math.PI / 2 : 0, k, dir[0] ? Math.PI / 2 : 0); m.position.set(fr.x + dir[0] * (u0 + u1) / 2 + fr.across[0] * k * 3, GEO.FLOOR + 0.55, fr.z + dir[1] * (u0 + u1) / 2 + fr.across[1] * k * 3); m.castShadow = true; PR.root.add(m); half.push(m); }
    X.line('העמוד נפל ונשבר. מביאים עמוד חדש מהמחצבה', 0);
    await X.wait(2.6);
    // the halves are dragged off to the stone pile by the gate (world.js draws them there from the marks)
    for (let i = 1; i <= 20; i++) { await X.wait(0.04); for (const h of half) { h.position.x -= fr.across[0] * 0.25; h.position.z -= fr.across[1] * 0.25; h.scale.setScalar(1 - i * 0.03); } }
    for (const h of half) PR.remove(h);
    // the new column comes on a sledge, the crews lay it on the cradle
    const sl = new T.Group(); box(X, M.n5cedarD, -0.9, 0, -5.4, 0.9, 0.3, 5.4, sl); const nc = new T.Mesh(new T.CylinderGeometry(0.5, 0.6, COL_H, 16), M.n5marble); nc.rotation.x = Math.PI / 2; nc.position.y = 0.9; sl.add(nc);
    sl.rotation.y = Math.atan2(fr.along[0], fr.along[1]); PR.root.add(sl);
    const from = ax(5, 16, 0), to = ax(5, 2.5, 0);
    for (let i = 0; i <= 50; i++) { const u = ease(i / 50); sl.position.set(lerp(from[0], to[0], u), GEO.FLOOR, lerp(from[2], to[2], u)); await X.wait(0.05); }
    PR.remove(sl);
    makeCol(); A.s = colFresh(); A.vth = CRADLE; A.quick = {}; A.phase = 'rise'; A.busy = false; A.macro = 0;
    wide(0.8);
    X.line('עמוד חדש על העריסה. מושכים שוב', 2600);
  }
  async function tearDrop(from, cracked) {
    A.phase = 'drop'; A.busy = true;
    X.play('crack'); ropeB.show(false); ropeB2.show(false);
    for (let th = from; th > CRADLE; th -= 1.6) { A.C.pose(th); await X.wait(1 / 60); }
    A.C.pose(CRADLE); X.play('thud'); X.shake(0.25, 0.35); X.dust(fr.x + fr.along[0] * 6, GEO.FLOOR + 0.4, fr.z + fr.along[1] * 6, 14, 4);
    if (cracked) makeCol({ crack: 1 });
    X.line(cracked ? 'גדיל נקרע והעמוד נפל לעריסה: נסדק. מושכים לאט' : 'גדיל נקרע והעמוד חזר לעריסה. מושכים לאט', 3200);
    await X.wait(1.2); ropeB.show(true); ropeB2.show(true);
    A.vth = CRADLE; A.phase = 'rise'; A.busy = false;
  }
  async function landed(ev) {
    A.phase = 'settle'; A.busy = true;
    const f0 = foot(); X.play('thud'); X.shake(0.18, 0.3); X.dust(f0.x, Y.PLINTH_TOP + 0.1, f0.z, 22, 3.2);
    if (ev === 'chip') X.line('נחת מהר מדי: שפת הרגל נשברה', 3000);
    else if (A.s.land <= L.land / 2) { A.soft = 1; X.quick({ x: f0.x, y: Y.PLINTH_TOP + 0.6, z: f0.z }, QUICK.soft, A.C.shaft); }
    A.lean = leanAfter(A.s);
    rebuildCol();
    try { X.lookLift(0); } catch (e) { /* */ }
    await X.wait(0.9);
    X.kohen(false);
    A.plumbs = plumbsMake(); plumbShot(); A.phase = 'plumb';
    for (const r of [ropeA, ropeB, ropeB2, brake, tail, ...links]) r.show(false); try { if (X.hero.rope) X.hero.rope(null); } catch (e) { /* */ }
    await X.wait(1.3);
    readPlumbs();
    if (Math.hypot(A.lean[0], A.lean[1]) <= L.lean && A.wedges === 0) { A.plumbOk = 1; X.quick(A.plumbs.bobs[0], QUICK.plumb, null); }
    X.line('הקישו על צד הבסיס לתקוע טריז · הקישו על המשקולת: כך טוב');
    const big = Math.abs(A.lean[0]) >= Math.abs(A.lean[1]) ? (A.lean[0] > 0.5 ? 'pa' : A.lean[0] < -0.5 ? 'na' : null) : (A.lean[1] > 0.5 ? 'pc' : A.lean[1] < -0.5 ? 'nc' : null), s = big ? SIDE[big] : null;
    X.hand(s ? { x: f0.x + (fr.along[0] * s[0] + fr.across[0] * s[1]) * 0.8, y: Y.PLINTH_TOP, z: f0.z + (fr.along[1] * s[0] + fr.across[1] * s[1]) * 0.8 } : A.plumbs.bobs[0], 0, 12);
    A.busy = false;
  }

  /* the ropes drawn each frame */
  function ropes() {
    const top = A.C ? A.C.at(0.97, tmp) : null; if (!top) return;
    const th = A.vth, slack = th > BAL + 4 || A.phase !== 'rise';
    ropeA.set({ x: top.x, y: top.y, z: top.z }, { x: head.x, y: head.y, z: head.z }, slack ? 0.7 : 0.02);
    const h0 = PUL[0] && PUL[0].w ? handW(PUL[0].w, tmp2) : tmp2.set(RIG.pull[0][0], GEO.FLOOR + 1.25, RIG.pull[0][1]);
    for (let k = 1; k < PUL.length; k++) { const a = PUL[k - 1].w ? handW(PUL[k - 1].w, new T.Vector3()) : null, b = PUL[k].w ? handW(PUL[k].w, new T.Vector3()) : null; if (a && b) links[k - 1].set({ x: a.x, y: a.y, z: a.z }, { x: b.x, y: b.y, z: b.z }, slack ? 0.25 : 0.06); }
    ropeB.set({ x: head.x, y: head.y, z: head.z }, { x: blockP.x, y: blockP.y, z: blockP.z }, slack ? 0.4 : 0.02); ropeB2.set({ x: blockP.x, y: blockP.y, z: blockP.z }, { x: h0.x, y: h0.y, z: h0.z }, slack ? 0.8 : 0.05);
    const taut = A.s.lock != null && th >= A.s.lock - 0.4 && th > BAL - 6;
    brake.set({ x: top.x, y: top.y, z: top.z }, { x: postTop.x, y: postTop.y, z: postTop.z }, taut ? 0.03 : 0.25 + 0.4 * (1 - th / 90));
    tail.set({ x: postTop.x, y: postTop.y - 0.1, z: postTop.z }, handK(), taut ? 0.02 : 0.15);
    const took = clamp((L0 - (A.C ? A.C.at(1, tmp2).distanceTo(head) : L0)) * 0.35, 0, 3);
    for (const P of PUL) if (P.w) { P.w.a.x = P.x0 + RIG.back[0] * took; P.w.a.z = P.z0 + RIG.back[1] * took; }
  }

  return {
    begin() {
      X.kohen(true);
      try { X.hero.setPos(kAt.x, kAt.z, Math.atan2(post[0] - kAt.x, post[1] - kAt.z)); } catch (e) { /* */ }
      FG.attach();
      wide(1.1);
      // (the two-hand moment ahead: the camera lifts a little by itself first — brief §0.1)
      try { X.lookLift(0.18); } catch (e) { /* */ }
      X.line('את העמוד האחרון מרימים בחבלים', 2400);
      setTimeout(() => { if (A.phase !== 'intro') return; A.phase = 'rise'; A.busy = false; X.line('משכו את החבל למטה · החבל עובר בגלגלת: מושכים לאט'); }, 2200);
    },
    update(dt) {
      A.t += dt;
      if (A.phase === 'rise') {
        const s = A.s, pf = A.pullF;
        let sharp = false;
        if (pf) { const thr = 1.6 * Math.min(innerWidth, innerHeight); if (A.sharpV > thr && !A.sharpOn) { A.sharpOn = true; sharp = true; } else if (A.sharpV < thr * 0.4) A.sharpOn = false; }
        const inp = { held: !!pf, pT: pf ? pf.p : 0, heave: A.heave, press: !!A.postF, pay: A.postF ? A.pay : 0, sharp, wind: 0, haul: 0 };
        A.payV = A.postF ? inp.pay / Math.max(1e-3, dt) : 0; A.heave = 0; A.pay = 0;
        const ev = colStep(s, inp, dt, L);
        A.vth = s.th;
        if (A.C) A.C.pose(s.th);
        if (A.C && A.C.cradle && s.th > CRADLE + 3) A.C.cradle.visible = false;
        for (const e of ev) {
          A.events.push(e); if (A.events.length > 30) A.events.shift();
          if (e === 'creak' && A.t - A.creakT > 1.6) { A.creakT = A.t; X.play('creak'); X.line('החבל האחורי תפוס: שחררו את היתד', 2000); }
          if (e === 'warn') { X.play('creak'); X.line('לאט! החבל חורק', 2400); }
          if (e === 'jerk') X.dust(foot().x, Y.PLINTH_TOP, foot().z, 3, 0.8);
          if (e === 'tear') { tearDrop(s.tearFrom || 40, !!s.crack && !A.cracked); if (s.crack) A.cracked = 1; return; }
          if (e === 'land' || e === 'chip') { landed(e); return; }
          if (e === 'fall') { fallOver(); return; }
          if (e === 'cross') X.line('עבר את נקודת האיזון: היתד!', 1600);
        }
        if (!A.hint2 && s.th >= 60) { A.hint2 = 1; X.line('כשהעמוד מתחיל ליפול לבד: אצבע על היתד'); }
        if (A.hint2 === 1 && A.postF && s.th >= BAL - 6) { A.hint2 = 2; X.line('סיבוב סביב היתד מוריד אותו לאט', 2600); }
        if (!A.macro && s.th >= 80 && A.postF) { A.macro = 1; macro(); }
      }
      if (A.phase === 'rise' || A.phase === 'intro' || A.phase === 'drop') holdRope(dt);
      if (A.C) ropes();
    },
    down(p) { FG.down(p); },
    move(p) { FG.move(p); },
    up(p) { FG.up(p); },
    cancel() { A.pullF = null; A.postF = null; },
    wants(p) { return !!nearest(p); },
    holds() { return !!(A.pullF && A.postF); },
    /** the act's leftovers out of the world (the standing column is the gallery's to draw) */
    end() {
      FG.detach();
      for (const q of rig) PR.remove(q); for (const r of [ropeA, ropeB, ropeB2, brake, tail, ...links]) r.dispose();
      try { if (X.hero.rope) X.hero.rope(null); } catch (e) { /* */ }
      plumbsClear(); for (const w of A.crew) SH130.crew.remove(w); A.crew = []; for (const l of A.labs) l.remove();
      if (A.C) PR.remove(A.C.g); A.C = null;
      X.hand(null); try { X.lookLift(0); } catch (e) { /* */ }
    },
    at() { return A.C ? A.C.at(0.6) : { x: fr.x, y: 10, z: fr.z }; },
    dbg() {
      const s = A.s, g = A.phase === 'rise' ? gripRope() : null;
      return { phase: A.phase, busy: A.busy, th: +s.th.toFixed(2), w: +s.w.toFixed(2), p: +s.p.toFixed(2), pT: +s.pT.toFixed(2), lock: s.lock == null ? null : +s.lock.toFixed(2), crossed: s.crossed, slack: s.slack,
        land: +s.land.toFixed(2), off: s.off.map((v) => +v.toFixed(2)), lean: A.lean, wedges: A.wedges, chip: s.chip, crack: s.crack, broke: A.broke, tears: s.tears, BAL, tol: L.brakeTol, land0: L.land, leanTol: L.lean, pulley: 1,
        rope: g ? g.at : null, ropeTo: g ? [Math.round(g.at[0] + g.dir[0] * reachPx()), Math.round(g.at[1] + g.dir[1] * reachPx())] : null, reach: Math.round(reachPx()), sharpPx: Math.round(1.6 * Math.min(innerWidth, innerHeight)),
        post: postScr(), sides: A.phase === 'plumb' ? sidesScr() : null, bobs: A.plumbs ? A.plumbs.bobs.map((b) => sc(X, b)) : null, mouse: MOUSE, ev: A.events.slice(-6), downs: A.downs, nf: FG.n, pay: +A.payTot.toFixed(2), pose: A.pose || 'free', bols: A.bols, soft: A.soft, plumbOk: A.plumbOk };
    },
  };
}
