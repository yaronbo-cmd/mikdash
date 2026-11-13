/* ── build 120 ── h120/acts3.js — station 3 of stage 05, "מסע הקורה" (brief §6): his beam (its real cut length) on two shoulders,
 * the kohen in front and a worker behind, from the yard to his bay across half the court: the front leads where the finger is and the
 * rear trails like a cart's trailer; a finger on the rear man leads the rear (the three-move turn); two fingers lead both ends. The
 * ways and their obstacles are fixed tables (routes.js). The camera is high and oblique, eased toward the beam only while no finger is
 * down. At the bay: the handing over in the green marking, the hoist on two ropes, and the truth at the columns (fitOf): a knock, a
 * trim (three strokes on a thin slice at a trestle at the foot of the bay), a shim that stays, or a lost beam and the crews' new one.
 * Then his bay is closed and the crews lay the joists from the corbels onto it.
 *   CARRY = { icon, title, walkLine, stand, prepare, make(m, X) → act }   (the registry of acts.js)
 */
import { H120, Y, LV, BAYS, BEAM_OF, COLS, RUNS, carryStep, beamHits, fitOf, carryPts, qOf, starsOf, joistsOf } from './model.js';
import { CARRY_PLACES, carryObs, carryStart, markOf, inMark, carryWay, moverAt, laneShape, laneState, LANE_X, LANE_CROSS, YARD, SCAFF } from './routes.js';
import { SH5, mats, box, label, own, viewCone, coneOwn, coneKeep, colFrame, trestle, scafShow, kohenFig, handsTo, shimMesh } from './world.js';
import { h120Ladder } from '../../temple.js';
import { fingers, MOUSE, onY } from '../h113/acts.js';
import { clamp, lerp, ease } from '../h109/kit.js';

const F = H120.FINGER, D2R = Math.PI / 180, FL = H120.FLOOR, HB = H120.BEAM_H, HW = H120.BEAM_W / 2;
const sc = (X, v) => { const r = X.scr(v.x, v.y, v.z); return [Math.round(r.x), Math.round(r.y)]; };
const V3 = (X, x, y, z) => new X.THREE.Vector3(x, y, z);
const cp = (s) => ({ f: s.f.slice(), r: s.r.slice(), L: s.L });
const segD = (px, pz, a, b) => { const dx = b[0] - a[0], dz = b[1] - a[1], L2 = dx * dx + dz * dz || 1, t = clamp(((px - a[0]) * dx + (pz - a[1]) * dz) / L2, 0, 1); return Math.hypot(px - a[0] - t * dx, pz - a[1] - t * dz); };
const HARD = new Set(['hard']);

/** his bay at place lv: the beam, its two supports' points, his column, the wall side */
function bayOf(lvP) {
  const beamId = BAYS[lvP].beam, B = BEAM_OF[beamId], his = BAYS[lvP].col, fr = colFrame(his);
  const P1 = B.a === his ? B.pa : B.pb, P0 = B.a === his ? B.pb : B.pa, L = Math.hypot(P1[0] - P0[0], P1[1] - P0[1]), dir = [(P1[0] - P0[0]) / L, (P1[1] - P0[1]) / L];
  const run = RUNS.find((R) => R.axis === B.axis && (R.axis === 'x' ? Math.abs(R.line - B.pa[1]) < 0.1 : Math.abs(R.line - B.pa[0]) < 0.1 && Math.sign(R.a0 + R.a1) === Math.sign(B.pa[1] + B.pb[1])));
  return { beamId, B, his, P0, P1, dir, across: fr.across, run };
}

export const CARRY = {
  icon: '🪵', title: 'מסע הקורה',
  walkLine: () => 'הקורה מוכנה: נושאים אותה אל המפתח',
  stand() { return { x: YARD.his.x0 - 1.5, z: YARD.his.z + 2.4, face: [YARD.his.x0 + 3, YARD.his.z] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, PR = X.props, M = mats(X), st = X.M.st, cam = X.camera;
    const lvP = m.lv || 3, lv = X.level(), L = LV[lv], P = CARRY_PLACES[lvP], Bay = bayOf(lvP), { beamId, B } = Bay;
    const need = X.M.need(beamId), b0 = st.beam[beamId] || {}, cut = +(b0.cut || need);
    SH5.busy = 1; own('__yard', 1);
    const all = [], crew = [], labs = [];
    const s = carryStart(lvP, cut), mk = markOf(lvP, cut);
    const A = { phase: 'intro', busy: true, t: 0, bumps: 0, dmg: 0, tries: 0, still: 0, moved: 0, contact: new Set(), clearT: {}, lead: null, F1: null, F2: null, sinceBump: 0, clean: [], passed: new Set(),
      scafDown: new Set(), scafHit: new Set(), jarsBroken: new Set(), workerAt: P.worker ? P.worker.slice() : null, workerJumped: 0, limed: { front: 0, rear: 0 }, lastHits: [], events: [], downs: [],
      SHY: 1.55, camAim: null, camLive: 0, warnT: 0, angWarn: 0, fit: null, trim: null, quick: {}, moverT: [0, 0], blockT: 0, slide: 0, done: 0 };
    // (jars broken in an earlier play lie as sherds where they stood: no jar there now)
    P.jars.forEach(([x, z], i) => { if ((st.sherds || []).some((q) => Math.hypot(q[0] - x, q[1] - z) < 0.3)) A.jarsBroken.add(i); });
    const FG = fingers(X, { down: fDown, move: fMove, up: fUp });
    const lab = label(X); labs.push(lab);

    /* ── the beam, the two bearers (the kohen in white linen), the marking, the jars, the worker in the way, the carriers ── */
    const beamG = new T.Group(); PR.root.add(beamG); all.push(beamG);
    const beamM = box(X, M.h5cedar, -cut / 2, -HB / 2, -HW, cut / 2, HB / 2, HW, beamG);
    box(X, M.h5cedarD, -cut / 2 - 0.005, -HB / 2, -HW, -cut / 2 + 0.01, HB / 2, HW, beamG); box(X, M.h5cedarD, cut / 2 - 0.01, -HB / 2, -HW, cut / 2 + 0.005, HB / 2, HW, beamG);
    const kohen = SH5.crew.add(s.f[0], s.f[1] + 0.6, { role: 'hold', crew: 2, variant: 'kohen', tunic: '#FFFFFF', col2: '#2E1E12' }), worker = SH5.crew.add(s.r[0], s.r[1] + 0.6, { role: 'hold', crew: 2 });
    for (const w of [kohen, worker]) if (w) { w.fx = null; crew.push(w); }
    // (the yard's sawyers keep 1.2 amot and more from the bearers: one who stands too near steps back along the saw beam for the act)
    SH5.sawKeep = [kohen, worker];
    const gm = new T.MeshBasicMaterial({ color: 0x4FC46A, transparent: true, opacity: 0.22, depthWrite: false });
    { const [x0, z0, x1, z1] = mk.rect, fill = box(X, gm, x0, FL + 0.01, z0, x1, FL + 0.02, z1); fill.renderOrder = 2; all.push(fill);
      for (const r of [[x0, z0, x1, z0 + 0.12], [x0, z1 - 0.12, x1, z1], [x0, z0, x0 + 0.12, z1], [x1 - 0.12, z0, x1, z1]]) { const e = box(X, M.h5green, r[0], FL + 0.012, r[1], r[2], FL + 0.025, r[3]); e.renderOrder = 3; all.push(e); } }
    const jarG = new T.LatheGeometry([[0.001, 0], [0.3, 0.04], [0.46, 0.42], [0.48, 0.8], [0.34, 1.15], [0.17, 1.32], [0.2, 1.45], [0.001, 1.45]].map(([a, c]) => new T.Vector2(a, c)), 12);
    const jars = P.jars.map(([x, z], i) => { if (A.jarsBroken.has(i)) return null; const j = new T.Mesh(jarG, M.h5clay); j.position.set(x, FL, z); j.castShadow = true; PR.root.add(j); all.push(j); return j; });
    let inWay = null;
    if (P.worker) { inWay = SH5.crew.add(P.worker[0], P.worker[1], { role: 'hammer', item: 'chisel', fx: P.worker[0] + 0.6, fz: P.worker[1] + 0.3, crew: 1 }); if (inWay) { crew.push(inWay); all.push(box(X, M.h5limeD, P.worker[0] + 0.35, FL, P.worker[1] - 0.05, P.worker[0] + 1.0, FL + 0.45, P.worker[1] + 0.6)); } }
    const movers = (P.movers ? [0, 1] : []).map((k) => { const q = moverAt(lvP, k, 0), w = SH5.crew.add(q.x, q.z, { role: 'hold', item: 'stone', crew: 3 }); if (w) { w.fx = null; crew.push(w); } return w; });
    // (the rear's sweep in the next 0.8 s at level 1: a soft dark shadow on the floor)
    const shadowM = new T.MeshBasicMaterial({ color: 0x1A140C, transparent: true, opacity: 0.16, depthWrite: false }), shadowG = new T.CircleGeometry(0.5, 14);
    const shadows = L.shadow ? Array.from({ length: 8 }, () => { const o = new T.Mesh(shadowG, shadowM); o.rotation.x = -Math.PI / 2; o.renderOrder = 2; o.visible = false; PR.root.add(o); all.push(o); return o; }) : [];
    // (a bearer who stepped into the lime: white to the knee for the rest of the way)
    const limeLeg = { front: null, rear: null };

    /* ── the obstacles now: the fixed tables, the lane's sledge and cart where they are, the carriers ── */
    let obsS = null;
    const obsStatic = () => (obsS = carryObs(lvP, { stands: (id) => X.M.stands(id), jarsBroken: A.jarsBroken, scafDown: A.scafDown, scafHard: A.scafHit, workerAt: A.workerAt }));
    obsStatic();
    function obsNow() {
      const o = obsS.slice(), Ln = SH5.lane && SH5.lane.now;
      if (Ln) for (const k of ['sledge', 'cart']) { const q = Ln[k]; if (q && !q.off) laneShape(k, q.s, q.dir).forEach((c, i) => o.push({ kind: 'hard', id: k + i, c: c.c, r: c.r })); }
      movers.forEach((w, k) => { if (w) o.push({ kind: 'mover', id: 'mover' + k, c: [w.a.x, w.a.z], r: 0.4 }); });
      return o;
    }
    // the lane's sledge and cart halt while their next step would meet the beam (no deadlock: the beam may always back off)
    SH5.laneYield = () => lvP === 3 && A.phase === 'carry' && Math.min(Math.hypot(s.f[0] - LANE_CROSS.at[0], s.f[1] - LANE_CROSS.at[1]), Math.hypot(s.r[0] - LANE_CROSS.at[0], s.r[1] - LANE_CROSS.at[1])) < LANE_CROSS.r;
    SH5.laneHold = (which, sN, dir) => A.phase !== 'end' && laneShape(which, sN, dir).some((c) => segD(c.c[0], c.c[1], s.f, s.r) < c.r + H120.BEAM_W / 2 + 0.25);

    /* ── the camera: high and oblique, the way running up the screen; eased toward the beam only while no finger is down ── */
    const frameDist = (w, h) => { const vf = ((cam && cam.fov) || 40) * D2R, asp = (cam && cam.aspect) || innerWidth / innerHeight, hf = 2 * Math.atan(Math.tan(vf / 2) * asp); return Math.max((w / 2) / Math.tan(hf / 2), (h / 2) / Math.tan(vf / 2)); };
    const look = (aim, from, dist, el) => { const l = Math.hypot(from[0], from[1]) || 1, c = Math.cos(el * D2R), sn = Math.sin(el * D2R); return { p: [aim[0] + (from[0] / l) * dist * c, aim[1] + dist * sn, aim[2] + (from[1] / l) * dist * c], t: aim }; };
    const UP = P.up, EL = 56, DIST = () => frameDist(36, 22);
    const travel = (ax, az) => look([ax, FL + 1, az], [-UP[0], -UP[1]], DIST(), EL);
    // (the aim leans toward the kohen's end, wherever it heads, and a little up the way: what is ahead of him is in frame)
    const camTarget = () => { const mx = (s.f[0] + s.r[0]) / 2, mz = (s.f[1] + s.r[1]) / 2; return [mx + (s.f[0] - mx) * 0.75 + UP[0] * 2, mz + (s.f[1] - mz) * 0.75 + UP[1] * 2]; };
    // the bay's shots: from the court side, square to the beam's line (the hoist), and the pull-back
    const midB = [(Bay.P0[0] + Bay.P1[0]) / 2, (Bay.P0[1] + Bay.P1[1]) / 2], acr = Bay.across;   // (across: from the column line toward the court)
    // (level 3 looks from the south-west, along the east wing: the wood chamber's wall and its builders' scaffolds stay behind the work)
    const sk = lvP === 3 ? 1.0 : 0.25;
    const S_BAY = () => look([midB[0] + acr[0] * 1.5, FL + 7.4, midB[1] + acr[1] * 1.5], [acr[0] + Bay.dir[0] * sk, acr[1] + Bay.dir[1] * sk], frameDist(cut + 6, 16), 14);
    const S_BACK = () => look([midB[0] + acr[0] * 2, FL + 7, midB[1] + acr[1] * 2], [acr[0] + Bay.dir[0] * (sk + 0.25), acr[1] + Bay.dir[1] * (sk + 0.25)], frameDist(cut * 3.2, 22), 30);
    const hisP = COLS[Bay.his];
    const trimAt = () => [Bay.P1[0] + acr[0] * 3.2 - Bay.dir[0] * 0.6, Bay.P1[1] + acr[1] * 3.2 - Bay.dir[1] * 0.6];   // (his end over the trestle at the foot of the bay)
    const S_TRIM = () => { const [x, z] = trimAt(); return look([x - Bay.dir[0] * 0.2, FL + 1.6, z - Bay.dir[1] * 0.2], [Bay.dir[0] * 0.9 + acr[0] * 0.45, Bay.dir[1] * 0.9 + acr[1] * 0.45], frameDist(9.4, 6.0), 42); };   // (from past his end: the slice between the two men, neither in front of it)
    const S_YARD = () => look([YARD.short[0] + 2, FL + 1.5, YARD.short[1] + 4], [0.35, 1], frameDist(18, 9), 26);

    /* ── the way's ground kept clear of the stage's crews (crews.js keeps six rects): the start, the way in five pieces ── */
    const wayPts = [s.f, ...carryWay(lvP, cut).map((w) => [w[1], w[2]])];
    const keepR = []; { const n = wayPts.length, k = 5; for (let g = 0; g < k; g++) { const a = Math.floor((g * (n - 1)) / k), c = Math.ceil(((g + 1) * (n - 1)) / k), Q = wayPts.slice(a, c + 1); keepR.push([Math.min(...Q.map((p) => p[0])) - 7, Math.min(...Q.map((p) => p[1])) - 7, Math.max(...Q.map((p) => p[0])) + 7, Math.max(...Q.map((p) => p[1])) + 7]); } }
    const t0 = travel(...camTarget());
    // F1: the act's view cone (the high travel camera clears only what stands right under its lens; the bay's shots, at the hoist)
    viewCone(X, [[t0.p, t0.t, 4]], { keep: keepR, skip: crew, depth: 18, live: false });
    A.camAim = camTarget();

    /* ── the fingers: the first anywhere leads the front (not on the rear man); on the rear man leads the rear; two lead both ── */
    const grip = () => clamp(0.07 * Math.min(innerWidth, innerHeight), 44, 70);
    const endScr = (p) => sc(X, V3(X, p[0], FL + A.SHY, p[1]));
    // (build 124) a screen point's distance from the segment a–b (px), and a finger on the beam's own grips (an end within reach)
    const segPx = (p, a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy, u = L2 > 1 ? clamp(((p.x - a[0]) * dx + (p.y - a[1]) * dy) / L2, 0, 1) : 0; return Math.hypot(p.x - a[0] - dx * u, p.y - a[1] - dy * u); };
    const near2 = (f) => { const a = endScr(s.f), b = endScr(s.r); return Math.min(Math.hypot(f.x0 - a[0], f.y0 - a[1]), Math.hypot(f.x0 - b[0], f.y0 - b[1])) < grip() * 1.5; };
    const groundOf = (f) => { const q = onY(X, f, FL + A.SHY); return q ? [q.x, q.z] : null; };
    function fDown(f) {
      f.t0 = performance.now();
      A.downs.push([A.phase, Math.round(f.x), Math.round(f.y)]); if (A.downs.length > 8) A.downs.shift();
      if (A.phase === 'trim') { trimDown(f); return; }
      if (A.phase !== 'carry' || A.busy) return;
      const rs = endScr(s.r), fs = endScr(s.f), dr = Math.hypot(f.x - rs[0], f.y - rs[1]), df = Math.hypot(f.x - fs[0], f.y - fs[1]);
      f.what = dr < grip() && dr <= df ? 'rear' : 'front';
      // (a second finger: the two ends each to its own finger)
      if (A.F1 && A.F1 !== f) { A.F2 = f; if (A.F1.what === f.what) f.what = f.what === 'rear' ? 'front' : 'rear'; }
      else A.F1 = f;
      f.to = f.what === 'rear' ? s.r.slice() : groundOf(f);
      X.hand(null);
    }
    function fMove(f) {
      if (A.phase === 'trim') { trimMove(f); return; }
      if (f !== A.F1 && f !== A.F2) return;
      const g = groundOf(f); if (!g) return;
      if (f.what === 'rear') { if (f.moved > 6) f.to = g; } else f.to = g;
    }
    function fUp(f) {
      if (A.phase === 'trim') { trimUp(f); return; }
      if (f === A.F1) { A.F1 = A.F2; A.F2 = null; } else if (f === A.F2) A.F2 = null;
    }
    function input() {
      const a = A.F1, c = A.F2;
      if (a && c && a.to && c.to) { const fr = a.what === 'front' ? a : c, re = fr === a ? c : a; return { lead: 'both', to: fr.to, to2: re.to }; }
      if (a && a.to) return { lead: a.what, to: a.to };
      return null;
    }

    /* ── the step: the model moves the beam; what it would touch decides ── */
    function feetOf(q) { const dx = q.r[0] - q.f[0], dz = q.r[1] - q.f[1], d = Math.hypot(dx, dz) || 1; return [[q.f[0] + (dx / d) * 0.45, q.f[1] + (dz / d) * 0.45], [q.r[0] - (dx / d) * 0.45, q.r[1] - (dz / d) * 0.45]]; }
    function step(dt) {
      const inp = input(); if (!inp) { A.lead = null; return 0; }
      A.lead = inp.lead;
      const obs = obsNow(), tryMove = (ip) => { const q = cp(s); carryStep(q, ip, dt); return { q, h: beamHits(q, obs, feetOf(q)) }; };
      let R = tryMove(inp);
      const hard = R.h.filter((h) => HARD.has(h.kind)), blocked = hard.filter((h) => !A.contact.has(h.id));
      // (a hard thing: the beam stops and slides off along it — the lead's step along x or z alone, if that one is free)
      if (hard.length) {
        const lp = inp.lead === 'rear' ? s.r : s.f, to = inp.to;
        let best = null;
        for (const ax of [0, 1]) { const t2 = ax ? [lp[0], to[1]] : [to[0], lp[1]]; if (Math.hypot(t2[0] - lp[0], t2[1] - lp[1]) < 0.05) continue; const R2 = tryMove({ ...inp, to: t2 }); if (!R2.h.some((h) => HARD.has(h.kind))) { best = R2; break; } }
        for (const h of blocked) bump(h);
        if (!best) { for (const h of R.h) if (HARD.has(h.kind)) A.contact.add(h.id); return 0; }
        R = best; A.slide++;
      }
      // (a carrier in the way steps back along his lane: the beam always has the way, so nothing is ever stuck)
      for (const h of R.h) if (h.kind === 'mover') { const k = +h.id.slice(5); A.moverT[k] -= 0.5; warn('זהירות!'); }
      // what it touches and is not stopped by: a scaffold's leg, a jar, the worker in the way, the lime pit (feet only)
      for (const h of R.h) {
        if (h.kind === 'scaffold') scaffoldDown(+h.id.slice(2));
        else if (h.kind === 'jar') jarBreak(+h.id.slice(3));
        else if (h.kind === 'worker') workerJump();
        else if (h.kind === 'lime') limeStep(h.who);
      }
      const moved = Math.hypot(R.q.f[0] - s.f[0], R.q.f[1] - s.f[1]) + Math.hypot(R.q.r[0] - s.r[0], R.q.r[1] - s.r[1]);
      s.f[0] = R.q.f[0]; s.f[1] = R.q.f[1]; s.r[0] = R.q.r[0]; s.r[1] = R.q.r[1];
      // (a contact ends once the beam is clear of it)
      // (a contact ends once the beam has stayed clear of it, with a hand's breadth to spare, for 0.8 s: one touch is one bump)
      const wide = { f: s.f, r: s.r, L: s.L }, near = new Set(beamHits(wide, obs.map((o) => (o.c ? { ...o, r: o.r + 0.3 } : o.x0 != null ? { ...o, x0: o.x0 - 0.3, z0: o.z0 - 0.3, x1: o.x1 + 0.3, z1: o.z1 + 0.3 } : o))).filter((h) => HARD.has(h.kind)).map((h) => h.id));
      for (const id of [...A.contact]) { if (near.has(id)) A.clearT[id] = 0; else if ((A.clearT[id] = (A.clearT[id] || 0) + dt) > 0.8) { A.contact.delete(id); delete A.clearT[id]; } }
      return moved;
    }
    function bump(h) {
      if (A.contact.has(h.id)) return;
      A.contact.add(h.id); A.bumps++; A.sinceBump = 1;
      A.events.push('bump:' + h.id); if (A.events.length > 20) A.events.shift();
      const m = [(s.f[0] + s.r[0]) / 2, (s.f[1] + s.r[1]) / 2];
      X.play('thud'); X.dust(m[0], FL + A.SHY, m[1], 6, 1.2); X.shake(0.12, 0.2);
      X.line(A.bumps === 1 && lv === 1 ? 'בום! הקורה נתקעה. סובבו אותה, או הובילו את האיש שמאחור' : 'בום!', 1800);
    }
    function warn(t) { if (A.warnT > 0) return; A.warnT = 2.5; X.line(t, 1400); X.play('tap'); }
    async function scaffoldDown(si) {
      if (A.scafDown.has(si) || A.scafHit.has(si)) return;
      A.scafDown.add(si); obsStatic(); A.dmg++;
      const [x0, z0, x1, z1] = SCAFF[si], cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, legs = [[x0, z0], [x1, z0], [x0, z1], [x1, z1]];
      A.events.push('scaffold' + si);
      scafShow(si, false);
      // the fallen poles and planks on the floor, the dust; its crew rebuilds it in view within the act
      const fall = [];
      for (let i = 0; i < 4; i++) { const p = box(X, M.h5cedarD, cx - 5 + i * 0.4, FL, cz - 0.1 + i * 0.35, cx + 5 + i * 0.3, FL + 0.18, cz + 0.08 + i * 0.35); p.rotation.y = 0.2 * (i - 1.5); fall.push(p); all.push(p); }
      X.play('crack'); X.dust(cx, FL + 2, cz, 18, 4); X.shake(0.25, 0.35);
      X.loss(20, V3(X, cx, FL + 3, cz), 'הפיגום נפל', 0, 'cedar');
      X.line('הפיגום נפל: הבנאים מקימים אותו מחדש', 2600);
      const men = [0, 1].map((k) => SH5.crew.add(cx - 1.5 + k * 3, cz + 2.2, { role: 'hammer', item: 'mallet', fx: cx, fz: cz, crew: 1 })).filter(Boolean); for (const w of men) { crew.push(w); coneOwn(w); }
      await X.wait(7);
      for (const p of fall) PR.remove(p);
      // (up again once the beam is clear of its legs; the act charges a scaffold once)
      for (let i = 0; i < 40 && legs.some(([x, z]) => segD(x, z, s.f, s.r) < 0.7); i++) await X.wait(0.5);
      scafShow(si, true); A.scafHit.add(si); A.scafDown.delete(si); obsStatic(); X.play('wedge');
      for (const w of men) SH5.crew.remove(w);
    }
    function jarBreak(i) {
      if (A.jarsBroken.has(i)) return;
      A.jarsBroken.add(i); obsStatic(); A.dmg++;
      const [x, z] = P.jars[i]; if (jars[i]) { PR.remove(jars[i]); jars[i] = null; }
      // the sherds stay on the floor (the save keeps them: the world draws them from now on)
      (st.sherds = st.sherds || []).push([x, z, i + lvP * 3]); X.save();
      for (let k = 0; k < 6; k++) { const a = k * 1.7 + i + lvP * 3, r = 0.25 + (k % 3) * 0.22, q = box(X, M.h5clay, x + Math.cos(a) * r - 0.13, FL, z + Math.sin(a) * r - 0.09, x + Math.cos(a) * r + 0.13, FL + 0.05, z + Math.sin(a) * r + 0.09); q.rotation.y = a; all.push(q); }
      X.play('crack'); X.dust(x, FL + 0.6, z, 10, 1.2);
      X.loss(20, V3(X, x, FL + 1.2, z), 'כד נשבר', 0, 'clay');
      X.line('כד נשבר: החרסים נשארים על הרצפה', 2400);
      A.events.push('jar' + i);
    }
    function workerJump() {
      if (A.workerJumped || !inWay) return;
      A.workerJumped = 1;
      // he jumps aside, away from the beam, and shouts
      const [x, z] = A.workerAt, dx = s.f[0] - s.r[0], dz = s.f[1] - s.r[1], d = Math.hypot(dx, dz) || 1, nx = -dz / d, nz = dx / d;
      const side = ((x - s.r[0]) * nx + (z - s.r[1]) * nz) >= 0 ? 1 : -1, tx = x + nx * side * 2.2, tz = z + nz * side * 2.2;
      SH5.crew.setRole(inWay, 'point'); SH5.crew.walkTo(inWay, tx, tz, 7);
      A.workerAt = [tx, tz]; obsStatic();
      X.line('זהירות!', 1500); X.play('tap'); A.events.push('worker');
    }
    function limeStep(who) {
      if (A.limed[who]) return;
      A.limed[who] = 1; A.events.push('lime:' + who);
      const w = who === 'front' ? kohen : worker; if (!w) return;
      X.dust(w.a.x, FL + 0.3, w.a.z, 8, 0.8); X.play('tap');
      X.line(who === 'front' ? 'הכהן דרך בסיד: מנער את הרגל וממשיך' : 'העובד דרך בסיד: מנער את הרגל וממשיך', 2000);
      const g = new T.Group(); box(X, M.h5white, -0.2, 0, -0.1, -0.04, 0.5, 0.1, g); box(X, M.h5white, 0.04, 0, -0.1, 0.2, 0.5, 0.1, g); PR.root.add(g); all.push(g); limeLeg[who] = g;
      w.shake = 0.8;
    }

    /* ── the bearers under the ends, the beam on their shoulders, walking ── */
    const pos = { front: null, rear: null };
    function bearers(dt) {
      const dx = s.r[0] - s.f[0], dz = s.r[1] - s.f[1], d = Math.hypot(dx, dz) || 1, ux = dx / d, uz = dz / d;
      const yawF = Math.atan2(-ux, -uz);   // (both face the front end)
      for (const [w, who, p, k] of [[kohen, 'front', s.f, 0.45], [worker, 'rear', s.r, -0.45]]) {
        if (!w) continue;
        const a = w.a;
        // (the beam on his right shoulder: he walks a little to its left)
        const yw = a.path ? a.yaw : yawF, rx = -Math.cos(yw), rz = Math.sin(yw);
        const tx = p[0] + ux * k - rx * 0.22, tz = p[1] + uz * k - rz * 0.22, pv = pos[who];
        const v = pv ? Math.hypot(tx - pv[0], tz - pv[1]) / Math.max(1e-3, dt) : 0;
        a.x = tx; a.z = tz; a.y = FL;
        if (v > 0.15) { const mx = tx - pv[0], mz = tz - pv[1], ml = Math.hypot(mx, mz) || 1; a.path = [[tx + (mx / ml) * 0.5, tz + (mz / ml) * 0.5]]; a.pi = 0; a.speed = v; a.walkT0 = undefined; a.res = null; }
        else { a.path = null; a.yaw = yawF; }
        a.arm[0] = a.armT[0] = 0; a.arm[1] = a.armT[1] = 0.05; a.arm[2] = a.armT[2] = 2.55; a.arm[3] = a.armT[3] = -0.42;
        if (w.shake > 0) { w.shake -= dt; a.tilt = Math.sin(A.t * 40) * 0.15 * w.shake; }
        pos[who] = [tx, tz];
        if (limeLeg[who]) { limeLeg[who].position.set(tx, FL, tz); limeLeg[who].rotation.y = a.yaw; }
      }
      // (the shoulder's height from the actor's own raised hand, once it is drawn)
      try { const H = X.actors && X.actors(); if (H && H.handWorld && kohen && worker) { const v = new T.Vector3(); H.handWorld(kohen.a, -1, v); const y1 = v.y; H.handWorld(worker.a, -1, v); const y = (y1 + v.y) / 2 - FL - 0.08; if (Number.isFinite(y) && y > 1.1 && y < 2.4) A.SHY = lerp(A.SHY, y, 0.2); } } catch (e) { /* */ }
    }
    function drawBeam(y0) {
      const mx = (s.f[0] + s.r[0]) / 2, mz = (s.f[1] + s.r[1]) / 2;
      beamG.position.set(mx, y0 != null ? y0 : FL + A.SHY + HB / 2, mz); beamG.rotation.set(0, -Math.atan2(s.r[1] - s.f[1], s.r[0] - s.f[0]), 0);
    }
    function drawShadow() {
      if (!shadows.length) return;
      const inp = input(); for (const o of shadows) o.visible = false; if (!inp || A.phase !== 'carry') return;
      const q = cp(s); for (let i = 0; i < 8; i++) { for (let k = 0; k < 6; k++) carryStep(q, inp, 1 / 60); const o = shadows[i]; o.position.set(q.r[0], FL + 0.03, q.r[1]); o.visible = true; o.scale.setScalar(0.7 + i * 0.06); }
    }
    function moversFrame(dt) {
      movers.forEach((w, k) => {
        if (!w) return;
        const q0 = moverAt(lvP, k, A.moverT[k]), q1 = moverAt(lvP, k, A.moverT[k] + dt);
        // (a carrier halts while his next step would meet the beam)
        const held = A.phase === 'carry' && segD(q1.x, q1.z, s.f, s.r) < 0.45 + HW + 0.15;
        if (!held) A.moverT[k] += dt;
        const q = held ? q0 : q1, a = w.a;
        a.x = q.x; a.z = q.z; a.yaw = q.yaw;
        if (!held && q.dir) { a.path = [[q.x + Math.sin(q.yaw) * 0.5, q.z + Math.cos(q.yaw) * 0.5]]; a.pi = 0; a.speed = 1.3; a.walkT0 = undefined; a.res = null; } else a.path = null;
        const it = q.loaded ? 'stone' : null; if (w.itemNow !== it) { w.itemNow = it; try { X.actors().setItem(a, it); } catch (e) { /* */ } }
        w.held = held;
      });
    }

    /* ── checkpoints, the handing over ── */
    function checks() {
      for (const c of P.checks) {
        if (A.passed.has(c.id)) continue;
        const r = c.rect, inR = (p) => p[0] >= r[0] && p[0] <= r[2] && p[1] >= r[1] && p[1] <= r[3], mid = [(s.f[0] + s.r[0]) / 2, (s.f[1] + s.r[1]) / 2];
        const ok = c.by === 'mid' ? inR(mid) : c.by === 'front' ? inR(s.f) || inR(s.r) : inR(s.f) && inR(s.r);
        if (!ok) continue;
        A.passed.add(c.id);
        if (!A.sinceBump && !A.dmg) { A.clean.push(c.id); X.quick(V3(X, mid[0], FL + A.SHY + 0.6, mid[1]), 'מעבר נקי!', beamM); }
        A.sinceBump = 0;
      }
    }
    function handFrame(dt, moved) {
      const r = inMark(s, mk, L.angle); A.inMark = r;
      if (moved > 1e-4 || input()) { A.still = 0; A.angWarn = 0; return; }
      if (!r.ends) return;
      A.still += dt;
      if (A.still < 0.6) return;
      if (r.ok) { handOver(); return; }
      if (!A.angWarn) { A.angWarn = 1; A.tries++; X.play('tap'); X.line(`עקומה: עוד ${Math.ceil(r.ang - L.angle)} מעלות. ${lv === 1 ? 'אצבע על האיש שמאחור, וישרו אותה' : 'ישרו אותה'}`, 2600); }
    }
    async function handOver() {
      A.phase = 'hand'; A.busy = true; A.tries++; for (const o of shadows) o.visible = false; lab.set('', null);
      if (A.tries === 1) { A.quick.bol = 1; X.quick(V3(X, (s.f[0] + s.r[0]) / 2, FL + A.SHY + 0.6, (s.f[1] + s.r[1]) / 2), 'בול!', beamM); }
      X.play('wood'); X.line('הקורה בסימון: מניחים אותה', 1600);
      // they set it down on the floor in the marking, and step out of the frame (rule 62)
      const y0 = FL + A.SHY + HB / 2;
      for (let i = 1; i <= 15; i++) { await X.wait(1 / 30); drawBeam(lerp(y0, FL + HB / 2 + 0.02, ease(i / 15))); }
      X.play('thud');
      for (const [w, k] of [[kohen, 1], [worker, -1]]) if (w) { w.a.path = null; const a = w.a; a.arm[2] = a.armT[2] = 0.2; a.arm[0] = a.armT[0] = 0.2; SH5.crew.walkTo(w, a.x + acr[0] * 9 + Bay.dir[0] * 3 * k, a.z + acr[1] * 9 + Bay.dir[1] * 3 * k, 2.6); }
      await X.wait(0.6);
      hoist(false);
    }

    /* ── the hoist: two ropes over the supports' tops, two men pulling on the wall's side; then the truth (fitOf) ── */
    const ropes = [];
    let guide = null, pul = [];
    function guideUp() {
      if (guide) return;
      const LADH = Y.COL_TOP - 1.25 - FL, k = 0.55 + (LADH + 0.9) * 0.28, foot = [Bay.P1[0] - acr[0] * k, Bay.P1[1] - acr[1] * k];
      for (const g of h120Ladder(foot[0], foot[1], Bay.P1[0], Bay.P1[1], FL, FL + LADH)) { const o = new T.Mesh(g, M.h5cedarD); o.castShadow = true; PR.root.add(o); all.push(o); }
      const on = [foot[0] + (Bay.P1[0] - foot[0]) * 0.66, foot[1] + (Bay.P1[1] - foot[1]) * 0.66];
      guide = SH5.crew.add(on[0], on[1], { role: 'hold', crew: 1 }); if (guide) { guide.a.y = guide.a.fixedY = Y.COL_TOP - 1.75; guide.a.yaw = Math.atan2(Bay.P1[0] - on[0], Bay.P1[1] - on[1]); crew.push(guide); coneOwn(guide); }
    }
    async function hoist(again) {
      A.phase = 'hoist'; A.busy = true;
      viewCone(X, [[S_BAY().p, S_BAY().t, 4], [S_BACK().p, S_BACK().t, 5]], { keep: [[Math.min(Bay.P0[0], Bay.P1[0], mk.rect[0]) - 6, Math.min(Bay.P0[1], Bay.P1[1], mk.rect[1]) - 6, Math.max(Bay.P0[0], Bay.P1[0], mk.rect[2]) + 6, Math.max(Bay.P0[1], Bay.P1[1], mk.rect[3]) + 6]], skip: crew });
      X.shot(S_BAY().p, S_BAY().t, again ? 0.8 : 1.4);
      for (const w of [kohen, worker]) if (w) w.a.visT = 0;
      if (!again) X.line('קושרים שני חבלים, ומרימים', 2200);
      // the beam's start: lying in the marking (s), its seat: on the supports (P0 → P1); the two pullers in the strip behind the line
      const fx = s.f, rx = s.r, nearP1 = Math.hypot(fx[0] - Bay.P1[0], fx[1] - Bay.P1[1]) < Math.hypot(rx[0] - Bay.P1[0], rx[1] - Bay.P1[1]);
      const e1 = nearP1 ? fx : rx, e0 = nearP1 ? rx : fx;   // (e1: the end that goes onto his column)
      const top = Y.COL_TOP + 0.05, ptop = (p) => V3(X, p[0], top + 0.55, p[1]);
      guideUp();
      for (const w of pul) SH5.crew.remove(w);
      pul = [Bay.P0, Bay.P1].map((p) => { const w = SH5.crew.add(p[0] - acr[0] * 3.2, p[1] - acr[1] * 3.2, { role: 'pull', item: 'rope', fx: p[0], fz: p[1], crew: 1 }); if (w) { crew.push(w); coneOwn(w); } return w; });
      for (let i = 0; i < 4; i++) { const r = PR.rope(12, 0.045); ropes.push(r); all.push({ dispose: () => r.dispose() }); }
      const c = cutNow(), dirB = Bay.dir, mid0 = [(e0[0] + e1[0]) / 2, (e0[1] + e1[1]) / 2], mid1 = [(Bay.P0[0] + Bay.P1[0]) / 2 + dirB[0] * (c - Bay.B.len) / 2, (Bay.P0[1] + Bay.P1[1]) / 2 + dirB[1] * (c - Bay.B.len) / 2];
      const yaw0 = -Math.atan2(e1[1] - e0[1], e1[0] - e0[0]); let yaw1 = -Math.atan2(Bay.P1[1] - Bay.P0[1], Bay.P1[0] - Bay.P0[0]); while (yaw1 - yaw0 > Math.PI) yaw1 -= 2 * Math.PI; while (yaw1 - yaw0 < -Math.PI) yaw1 += 2 * Math.PI;
      const seatY = Y.COL_TOP + HB / 2, liftY = seatY + 0.5;
      const D = 4.0, N = Math.round(D * 30);
      X.play('rope');
      for (let i = 1; i <= N; i++) {
        await X.wait(1 / 30);
        const u = i / N, up = ease(clamp(u / 0.75, 0, 1)), side = ease(clamp((u - 0.7) / 0.3, 0, 1));
        const x = lerp(mid0[0], mid1[0], side), z = lerp(mid0[1], mid1[1], side), y = lerp(FL + HB / 2 + 0.02, liftY, up);
        beamG.position.set(x, y, z); beamG.rotation.set(0, lerp(yaw0, yaw1, side), 0);
        const ends = [-1, 1].map((sg) => V3(X, sg * c / 2 * (1 / Math.max(1e-3, beamG.scale.x)) * beamG.scale.x, HB / 2, 0).applyEuler(beamG.rotation).add(beamG.position));
        [Bay.P0, Bay.P1].forEach((p, k) => { const E = ends[k] || ends[0], tp = ptop(p), w = pul[k]; ropes[k * 2].set({ x: E.x, y: E.y, z: E.z }, { x: tp.x, y: tp.y, z: tp.z }, 0.05); const h = w ? { x: w.a.x, y: FL + 1.3, z: w.a.z } : { x: tp.x, y: FL + 1.3, z: tp.z }; ropes[k * 2 + 1].set({ x: tp.x, y: tp.y, z: tp.z }, h, 0.05); if (w) { w.a.x -= acr[0] * 0.012; w.a.z -= acr[1] * 0.012; } });
        if (i % 20 === 0) X.play('rope');
        if (guide) handsTo(X, guide, ends[1] || ends[0], { spread: -0.2, rMax: 2.6 });
      }
      for (const r of ropes) r.show(false);
      // (the pullers ease off and coil their ropes; the guide keeps his hands on the end until it sits)
      for (const w of pul) if (w) SH5.crew.setRole(w, 'hold');
      seat();
    }
    function beamSeat(dy = 0, tilt = 0) { const x = (Bay.P0[0] + Bay.P1[0]) / 2, z = (Bay.P0[1] + Bay.P1[1]) / 2; beamG.position.set(x + Bay.dir[0] * (cutNow() - Bay.B.len) / 2, Y.COL_TOP + HB / 2 + dy, z + Bay.dir[1] * (cutNow() - Bay.B.len) / 2); beamG.rotation.set(0, -Math.atan2(Bay.dir[1], Bay.dir[0]), 0); beamG.rotateZ(tilt); }
    let cutCur = cut; const cutNow = () => cutCur;
    async function seat() {
      A.phase = 'seat';
      const fit = A.fit || (A.fit = fitOf(need, cut, lv)); A.fitFirst = A.fitFirst || fit;
      const at = V3(X, hisP.x, Y.COL_TOP + 0.4, hisP.z);
      if (fit === 'knock' || A.again) {
        for (let i = 1; i <= 10; i++) { await X.wait(1 / 30); beamSeat(0.5 * (1 - ease(i / 10))); }
        X.play('knock'); X.dust(at.x, at.y, at.z, 8, 0.8);
        if (fit === 'knock') { A.quick.knock = 1; X.quick(at, 'נכנסה בנקישה!', beamM); X.line('מדדתם את מה שיש. הקורה נכנסה בדיוק', 2800); }
        await X.wait(1.2); return closeBay();
      }
      if (fit === 'trim') {
        // too long: it stops on the column's edge and does not seat
        for (let i = 1; i <= 10; i++) { await X.wait(1 / 30); beamSeat(0.5 - 0.35 * ease(i / 10), 0); }
        X.play('thud'); X.line('ארוכה מדי: מנסרים פרוסה דקה', 2800); await X.wait(1.6);
        for (const w of pul) SH5.crew.remove(w); pul = [];
        return trimStart();
      }
      if (fit === 'shim') {
        for (let i = 1; i <= 10; i++) { await X.wait(1 / 30); beamSeat(0.5 * (1 - ease(i / 10)) - 0.06); }
        X.play('thud'); X.line('קצרה, עד טפח: כשר. הכפיס נשאר', 3000);
        // the close shot: the beam's end on his column from the court, a little inside the bay; the shim of fresh cedar driven home
        const S_SHIM = look([Bay.P1[0] - Bay.dir[0] * 0.35, Y.COL_TOP + 0.25, Bay.P1[1] - Bay.dir[1] * 0.35], [acr[0] * 0.9 - Bay.dir[0] * 0.45, acr[1] * 0.9 - Bay.dir[1] * 0.45], frameDist(4.2, 3.0), 16);
        X.shot(S_SHIM.p, S_SHIM.t, 0.9); await X.wait(1.0);
        const gap = Math.max(0, need - cutNow()), sm = shimMesh(X, all, Bay.P1, Bay.dir, gap, 0);
        if (guide) { SH5.crew.setRole(guide, 'hammer', { item: 'mallet' }); guide.fx = Bay.P1[0]; guide.fz = Bay.P1[1]; }
        for (let k = 1; k <= 3; k++) { await X.wait(0.55); X.play('wedge'); X.dust(Bay.P1[0], Y.COL_TOP + HB, Bay.P1[1], 3, 0.5); sm.position.y = (1 - k / 3) * 0.35; }
        beamSeat(0); A.quick.shim = 1; X.quick(V3(X, Bay.P1[0], Y.COL_TOP + HB + 0.3, Bay.P1[1]), 'הכפיס בפנים', null);
        await X.wait(1.4);
        if (guide) SH5.crew.setRole(guide, 'hold', { item: null });
        A.shim = 1; return closeBay();
      }
      // lost: short by more than a tefach: it cannot bear. Lowered, carried to the heap of short beams; the sawyers cut a new one
      for (let i = 1; i <= 10; i++) { await X.wait(1 / 30); beamSeat(0.5 * (1 - ease(i / 10)), -0.04 * ease(i / 10)); }
      X.play('creak'); X.line('קצרה ביותר מטפח: הקורה אבודה', 3000); await X.wait(1.4);
      X.loss(20, at, 'הקורה אבודה', 1, 'cedar'); A.lost = 1;
      for (const w of pul) SH5.crew.remove(w); pul = [];
      for (let i = 1; i <= 30; i++) { await X.wait(1 / 30); beamG.position.y = lerp(Y.COL_TOP + HB / 2, FL + HB / 2, ease(i / 30)); }
      beamG.visible = false;
      // the yard: the beam on the heap of short beams (it stays there), the two sawyers cut a new one to the true span
      st.beam[beamId] = { ...(st.beam[beamId] || {}), lost: 1 }; X.save(); SH5.ambKey = '';   // (the world's yard draws the heap anew)
      X.shot(S_YARD().p, S_YARD().t, 1.2); lab.set('קורה חדשה, באורך האמת', V3(X, YARD.saw.x0 + 6, FL + 3, YARD.saw.z), true);
      X.line('הנסרים חותכים קורה חדשה, באורך האמת', 3600);
      await X.wait(4.4); lab.set('', null);
      cutCur = need; beamG.scale.x = need / cut; beamG.visible = true;
      // (the new beam lies in the marking; it is hoisted and seats)
      const c0 = mk.c, ax = mk.axis === 'x' ? [1, 0] : [0, 1]; s.f = [c0[0] - ax[0] * need / 2, c0[1] - ax[1] * need / 2]; s.r = [c0[0] + ax[0] * need / 2, c0[1] + ax[1] * need / 2];
      drawBeam(FL + HB / 2 + 0.02); A.again = 1;
      return hoist(true);
    }

    /* ── the trim: the beam down on two trestles at the foot of the bay, his end over the trestle; three strokes on a thin slice ── */
    let trimG = null, sliceG = null, sawG = null, carp = null;
    async function trimStart() {
      A.phase = 'trimSet'; A.busy = true;
      const [tx, tz] = trimAt(), d = Bay.dir, sl = Math.max(F, cut - need), x0 = tx - d[0] * cut, z0 = tz - d[1] * cut;
      trimG = []; trimG.push(trestle(X, tx - d[0] * (sl + 0.6), tz - d[1] * (sl + 0.6), all, Math.abs(d[0]) > 0.5), trestle(X, x0 + d[0] * 1.5, z0 + d[1] * 1.5, all, Math.abs(d[0]) > 0.5));
      // (the beam lowered onto them, his end a little past the near trestle)
      const top = FL + 1.6, mx = (tx + x0) / 2, mz = (tz + z0) / 2;
      for (let i = 1; i <= 24; i++) { await X.wait(1 / 30); const u = ease(i / 24); beamG.position.set(lerp(beamG.position.x, mx, u), lerp(beamG.position.y, top + HB / 2, u), lerp(beamG.position.z, mz, u)); }
      beamG.position.set(mx, top + HB / 2, mz); beamG.rotation.set(0, -Math.atan2(d[1], d[0]), 0);
      // the thin slice: the last (cut − need) of his end, drawn apart so it can fall
      const cx = tx - d[0] * sl / 2, cz = tz - d[1] * sl / 2;
      sliceG = new T.Group(); sliceG.position.set(cx, top + HB / 2, cz); sliceG.rotation.y = -Math.atan2(d[1], d[0]); PR.root.add(sliceG); all.push(sliceG);
      box(X, M.h5cedarL, -sl / 2, -HB / 2, -HW - 0.002, sl / 2, HB / 2, HW + 0.002, sliceG);
      const kerfX = tx - d[0] * sl;
      A.trim = { n: 0, turn: 'his', ct: 0, binds: 0, wander: 0, depth: 0, kx: kerfX, kz: tz - d[1] * sl, sl, saw: 0.4, F: null, armed: true, ref: 0, tStroke: 0 };
      // the saw across the beam at the kerf; the kohen on the near side (his hands work), the carpenter on the far
      sawG = new T.Group(); PR.root.add(sawG); all.push(sawG);
      box(X, M.h5lead, -0.006, -0.14, -1.1, 0.006, 0.14, 1.1, sawG);
      for (const sg of [-1, 1]) box(X, M.h5cedarD, -0.03, 0, sg * 1.15 - 0.04, 0.03, 0.28, sg * 1.15 + 0.04, sawG);
      sawG.rotation.y = -Math.atan2(d[1], d[0]);
      const nx = acr[0], nz = acr[1];   // (the near side: toward the court, where the camera is)
      if (kohen) { const a = kohen.a; a.visT = 1; a.path = null; a.x = A.trim.kx + nx * 1.6; a.z = A.trim.kz + nz * 1.6; a.yaw = Math.atan2(-nx, -nz); }
      carp = SH5.crew.add(A.trim.kx - nx * 1.6, A.trim.kz - nz * 1.6, { role: 'hold', fx: A.trim.kx, fz: A.trim.kz, crew: 2 }); if (carp) { crew.push(carp); coneOwn(carp); }
      viewCone(X, [[S_TRIM().p, S_TRIM().t, 1.5]], { keep: [[tx - 8, tz - 8, tx + 8, tz + 8]], skip: crew });
      X.shot(S_TRIM().p, S_TRIM().t, 1.0); await X.wait(1.0);
      A.phase = 'trim'; A.busy = false;
      X.line(lv === 1 ? 'שלוש משיכות על פרוסה דקה: משכו את הידית אליכם, כשהנגר גמר את שלו' : 'שלוש משיכות על פרוסה דקה', 0);
    }
    const strokePx = () => clamp(0.28 * Math.min(innerWidth, innerHeight), 120, 260);
    const handleW = (sg) => { const t = A.trim; return V3(X, t.kx + acr[0] * sg * 1.15 + acr[0] * t.saw * 0.6, FL + 1.6 + HB + 0.12 - t.depth * HB, t.kz + acr[1] * sg * 1.15 + acr[1] * t.saw * 0.6); };
    function trimAxis() { const a = sc(X, handleW(-1)), c = sc(X, handleW(1)), dd = [c[0] - a[0], c[1] - a[1]], l = Math.hypot(dd[0], dd[1]) || 1; return { at: c, dir: [dd[0] / l, dd[1] / l] }; }
    function trimDown(f) { if (A.busy || !A.trim) return; A.trim.F = f; f.ax = trimAxis(); f.ref = 0; f.tr = performance.now(); A.trim.armed = true; }
    function trimMove(f) {
      const t = A.trim; if (!t || f !== t.F || A.busy) return;
      const d = ((f.x - f.x0) * f.ax.dir[0] + (f.y - f.y0) * f.ax.dir[1]) / strokePx(), now = performance.now();
      t.saw = clamp(0.4 - (d - f.ref) * 0.9, -0.5, 0.5);
      if (t.armed && d - f.ref >= 0.45) {
        t.armed = false;
        if (t.turn !== 'his') { t.binds++; X.play('squeal'); X.line(lv === 1 ? 'הנגר מושך עכשיו: חכו לו' : 'נתקע', 1600); return; }
        const fast = (now - f.tr) < 260;
        if (fast) { t.wander++; X.line(t.wander * 2 > 1 ? 'פרוסה דקה נודדת: לאט' : '', 1600); }
        t.n++; t.depth = t.n / 3; t.turn = 'carp'; t.ct = 0; X.play('sawA', { len: 0.8 }); X.dust(t.kx, FL + 1.6 + HB * (1 - t.depth), t.kz, 4, 0.6);
        if (t.n >= 3) trimDone();
      } else if (!t.armed && d < f.ref + 0.45 - 0.3) { t.armed = true; f.ref = d; f.tr = now; }
      if (t.armed && d < f.ref) { f.ref = d; f.tr = now; }
    }
    function trimUp(f) { const t = A.trim; if (t && f === t.F) { t.F = null; t.armed = true; } }
    async function trimDone() {
      A.busy = true; const t = A.trim;
      X.play('wood');
      for (let i = 1; i <= 14; i++) { await X.wait(1 / 30); sliceG.position.y = lerp(FL + 1.6 + HB / 2, FL + 0.08, (i / 14) * (i / 14)); sliceG.rotation.z = 0.5 * i / 14; }
      X.play('thud'); X.dust(sliceG.position.x, FL + 0.2, sliceG.position.z, 6, 0.8);
      if (!t.binds && !t.wander) { A.quick.slice = 1; X.quick(V3(X, t.kx, FL + 2.3, t.kz), 'פרוסה דקה!', beamM); }
      // (the slice to the offcut heap: it stays there; the beam is now the true span)
      st.beam[beamId] = { ...(st.beam[beamId] || {}), trimmed: +(t.sl).toFixed(4) }; X.save();
      cutCur = need; beamG.scale.x = need / cut; sawG.visible = false;
      { const d = Bay.dir; beamG.position.x = t.kx - d[0] * need / 2; beamG.position.z = t.kz - d[1] * need / 2; }
      if (carp) { SH5.crew.remove(carp); carp = null; }
      await X.wait(1.0); sliceG.visible = false;
      for (const g of trimG || []) if (g) g.visible = false;   // (the trestles go back with the slice to the yard)
      if (kohen) kohen.a.visT = 0;
      // hoisted again from the trestles: it seats
      const d = Bay.dir; s.f = [beamG.position.x - d[0] * need / 2, beamG.position.z - d[1] * need / 2]; s.r = [beamG.position.x + d[0] * need / 2, beamG.position.z + d[1] * need / 2];
      A.again = 1; hoist(true);
    }
    function trimFrame(dt) {
      const t = A.trim; if (!t || !sawG) return;
      if (t.turn === 'carp') { t.ct += dt; t.saw = lerp(-0.45, 0.4, clamp(t.ct / 0.55, 0, 1)); if (t.ct >= 0.55) { t.turn = 'his'; X.play('sawB'); } }
      sawG.position.set(t.kx + acr[0] * t.saw * 0.6, FL + 1.6 + HB + 0.1 - t.depth * HB, t.kz + acr[1] * t.saw * 0.6);
      try { if (kohen) { const a = kohen.a; a.arm[0] = a.armT[0] = 1.1 + t.saw * 0.5; a.arm[2] = a.armT[2] = 1.1 + t.saw * 0.5; a.arm[1] = a.armT[1] = -0.25; a.arm[3] = a.armT[3] = -0.25; a.bow = a.bowT = t.turn === 'his' && t.F ? 0.3 : 0.05; } } catch (e) { /* */ }
      if (carp) { const a = carp.a; a.arm[0] = a.armT[0] = 1.1 - t.saw * 0.5; a.arm[2] = a.armT[2] = 1.1 - t.saw * 0.5; }
    }

    /* ── his bay closed: the joists from the corbels onto his beam, laid one by one; the pull-back; the save; the end ── */
    async function closeBay() {
      A.phase = 'close'; A.busy = true;
      const R = Bay.run, J = R ? joistsOf(R).filter((a) => { const lo = Math.min(B.pa[R.axis === 'x' ? 0 : 1], B.pb[R.axis === 'x' ? 0 : 1]), hi = Math.max(B.pa[R.axis === 'x' ? 0 : 1], B.pb[R.axis === 'x' ? 0 : 1]); return a >= lo && a <= hi; }) : [];
      const fit = A.fit, lost = !!A.lost;
      // the save first (a reload from here keeps it): the beam seated, its fit, its shim, the carry's record
      const b = st.beam[beamId] = { ...(st.beam[beamId] || {}), seated: 1, fit: lost ? 'lost' : fit, shim: A.shim ? 1 : (st.beam[beamId] || {}).shim || 0 };
      if (lost) { b.lost = 1; b.cut2 = +need.toFixed(4); }
      st.carry[lvP] = { done: 1, bumps: A.bumps, clean: A.clean.slice(), dmg: A.dmg, tries: A.tries };
      X.save();
      X.shot(S_BACK().p, S_BACK().t, 1.6);
      for (const w of pul) SH5.crew.remove(w); pul = [];
      if (guide) { SH5.crew.remove(guide); guide = null; }
      SH5.joistAt = beamId; SH5.ambKey = '';
      X.line('המפתח נסגר: הבנאים כבר מניחים את הקורות הקצרות מהזיזים אליה', 3200);
      if (R) {
        const s0 = -R.dir, out = R.line - s0 * (HW + 0.25), jw = H120.JOIST_W / 2;
        // two men up on the gallery's level, one over the corbels and one on the seated beam, haul each joist up on two ropes from the
        // floor under its place and lay it from the corbel to the beam
        const wallS = R.wall - s0 * 0.7, beamS = R.line, lay = [];
        const man = (w, y) => { const m = SH5.crew.add(R.axis === 'x' ? J[0] : w, R.axis === 'x' ? w : J[0], { role: 'pull', crew: 2 }); if (m) { m.a.y = m.a.fixedY = y; crew.push(m); coneOwn(m); } return m; };
        const mw = man(wallS, Y.BEAM_TOP), mb = man(beamS, Y.BEAM_TOP);
        const rp = [PR.rope(10, 0.03), PR.rope(10, 0.03)]; for (const r of rp) all.push({ dispose: () => r.dispose() });
        for (const a of J) {
          const q = R.axis === 'x' ? [a - jw, Y.BEAM_TOP, Math.min(R.wall, out), a + jw, Y.JOIST_TOP, Math.max(R.wall, out)] : [Math.min(R.wall, out), Y.BEAM_TOP, a - jw, Math.max(R.wall, out), Y.JOIST_TOP, a + jw];
          const j = box(X, M.h5cedarD, q[0], q[1], q[2], q[3], q[4], q[5]); all.push(j); lay.push(j);
          const y1 = j.position.y, y0 = FL + 0.2;
          for (const m of [mw, mb]) if (m) { const p = R.axis === 'x' ? [a + 0.9, m === mw ? wallS : beamS] : [m === mw ? wallS : beamS, a + 0.9]; m.a.x = p[0]; m.a.z = p[1]; m.a.yaw = Math.atan2((R.axis === 'x' ? a : p[0]) - p[0], (R.axis === 'x' ? p[1] : a) - p[1]); }
          for (let i = 1; i <= 14; i++) {
            await X.wait(1 / 30); const u = ease(i / 14); j.position.y = lerp(y0, y1 + 0.25, u); j.rotation.set(0, 0, 0);
            const ends = R.axis === 'x' ? [[a, Math.min(R.wall, out) + 0.3], [a, Math.max(R.wall, out) - 0.3]] : [[Math.min(R.wall, out) + 0.3, a], [Math.max(R.wall, out) - 0.3, a]];
            [mw, mb].forEach((m, k) => { if (!m) return; const e = ends[Math.abs((R.axis === 'x' ? ends[0][1] : ends[0][0]) - (m === mw ? wallS : beamS)) < Math.abs((R.axis === 'x' ? ends[1][1] : ends[1][0]) - (m === mw ? wallS : beamS)) ? 0 : 1]; const h = V3(X, m.a.x, Y.BEAM_TOP + 1.9, m.a.z); rp[k].show(true); rp[k].set({ x: e[0], y: j.position.y, z: e[1] }, h, 0.02); m.a.bow = m.a.bowT = -0.2; });
          }
          for (const r of rp) r.show(false);
          j.position.y = y1; X.play('tap');
          for (const m of [mw, mb]) if (m) { m.a.bow = m.a.bowT = 0.5; }
          await X.wait(0.12);
        }
      }
      await X.wait(1.6);
      const pts = carryPts({ bumps: A.bumps, dmg: A.dmg, tries: A.tries, fit: lost ? 'lost' : fit }), q = qOf(pts);
      A.pts = pts; A.done = 1;
      X.end({ stars: starsOf(q), q, at: V3(X, midB[0], Y.COL_TOP, midB[1]), perfect: pts >= 40, lost });
    }

    /* ── the intro: the two men under his beam on the trestles; they lift it and step off ── */
    drawBeam(FL + 1.6 + HB / 2);
    bearers(1 / 60);
    X.shot(t0.p, t0.t, 1.2);

    return {
      close: true,
      begin() {
        X.kohen(false); coneKeep(X); FG.attach();
        try { A.ta = [document.documentElement.style.touchAction, document.body.style.touchAction]; document.documentElement.style.touchAction = 'none'; document.body.style.touchAction = 'none'; } catch (e) { /* */ }
        X.line(lv === 1 ? 'הכהן מלפנים ופועל מאחור. גררו לאן שהכהן ילך: מי שמאחור נגרר אחריו' : 'נושאים את הקורה אל המפתח', 3200);
        (async () => {
          await X.wait(0.4); X.play('wood');
          const y0 = FL + 1.6 + HB / 2;
          for (let i = 1; i <= 24; i++) { await X.wait(1 / 30); drawBeam(lerp(y0, FL + A.SHY + HB / 2, ease(i / 24))); }
          A.phase = 'carry'; A.busy = false; A.camLive = 1;
          if (lv === 1) { const w = carryWay(lvP, cut)[0]; X.hand(V3(X, w[1], FL + A.SHY, w[2]), 0, 12); }
          X.line(lv === 1 ? 'אצבע לפני הכהן: הוא הולך אליה. אצבע על הפועל שמאחור: הוא מוביל אחורה' : 'גררו לפני הכהן; על הפועל: הוא מוביל', 0);
          // (the mark of the bay seen from the start: a word over it)
          lab.set('המפתח', V3(X, mk.c[0], FL + 1.2, mk.c[1]), false);
        })();
      },
      update(dt) {
        A.t += dt; A.warnT = Math.max(0, A.warnT - dt);
        moversFrame(dt);
        if (A.phase === 'carry') {
          const moved = step(dt); A.moved += moved;
          bearers(dt); drawBeam(); drawShadow(); checks(); handFrame(dt, moved);
          // the camera: frozen under a finger; otherwise it eases toward the beam (the ground under a held finger never slides)
          if (A.camLive && A.camLive++ > 40) {
            if (!A.F1) { const tg = camTarget(), k = 1 - Math.exp(-dt * 1.3); A.camAim = [lerp(A.camAim[0], tg[0], k), lerp(A.camAim[1], tg[1], k)]; const S = travel(...A.camAim); X.shot(S.p, S.t, 0); }
          }
        } else if (A.phase === 'intro') bearers(dt);
        if (A.phase === 'trim') trimFrame(dt);
      },
      down(p) { FG.down(p); },
      move(p) { FG.move(p); },
      up(p) { FG.up(p); },
      cancel() { A.F1 = A.F2 = null; if (A.trim) A.trim.F = null; },
      // (build 124: the right thumb is free — the act takes only a touch near the kohen and the beam on the screen, or the trim's handle;
      //  the left half is always its own: the director asks only of the right half)
      wants(p) {
        if (A.busy || (A.phase !== 'carry' && A.phase !== 'trim')) return false;
        if (!p) return true;
        const R = 0.32 * innerHeight;
        if (A.phase === 'trim') { if (!A.trim) return false; const a = sc(X, handleW(-1)), c = sc(X, handleW(1)); return segPx(p, a, c) < R; }
        return segPx(p, endScr(s.f), endScr(s.r)) < R;
      },
      holds() { return [...FG.L.values()].filter((f) => near2(f)).length >= 2; },   // (build 124: both fingers on the beam's ends — else two fingers are a pinch)
      end() {
        FG.detach(); SH5.laneHold = null; SH5.laneYield = null;
        try { if (A.ta) { document.documentElement.style.touchAction = A.ta[0]; document.body.style.touchAction = A.ta[1]; } } catch (e) { /* */ }
        for (const o of all) { if (o && o.dispose && !o.isObject3D) o.dispose(); else if (o) PR.remove(o); }
        for (const w of crew) SH5.crew.remove(w); for (const l of labs) l.remove();
        for (const si of A.scafDown) scafShow(si, true);
        X.hand(null); viewCone(X, null); SH5.busy = 0; own('__yard', 0); SH5.ambKey = ''; SH5.sawKeep = null;
        try { delete window.__H120C; } catch (e) { /* */ }
      },
      at() { return V3(X, (s.f[0] + s.r[0]) / 2, FL + 2, (s.f[1] + s.r[1]) / 2); },
      dbg() {
        const r = inMark(s, mk, L.angle), Ln = SH5.lane && SH5.lane.now, t = A.trim;
        // (the bot's eyes: a world point at the shoulders' height on the screen; a target clamped to the screen, toward it from an end)
        window.__H120C = {
          scr: (x, z) => endScr([x, z]),
          aim: (m, x, z) => {
            const p = m === 'r' ? s.r : s.f, ok = (q) => q[0] > 70 && q[0] < innerWidth - 70 && q[1] > 150 && q[1] < innerHeight - 100;
            let lo = 0, hi = 1, to = [x, z]; if (!ok(endScr(to))) { for (let i = 0; i < 18; i++) { const u = (lo + hi) / 2, q = [p[0] + (x - p[0]) * u, p[1] + (z - p[1]) * u]; if (ok(endScr(q))) lo = u; else hi = u; } to = [p[0] + (x - p[0]) * lo, p[1] + (z - p[1]) * lo]; }
            return { pt: endScr(to), to };
          },
        };
        return { t: +A.t.toFixed(2), lv, lvP, id: beamId, phase: A.phase, busy: A.busy, mouse: MOUSE, cut: +cut.toFixed(4), need: +need.toFixed(4), fitNow: fitOf(need, cut, lv),
          f: s.f.map((v) => +v.toFixed(3)), r: s.r.map((v) => +v.toFixed(3)), toD: (() => { const ip = input(); if (!ip) return null; const p = ip.lead === 'rear' ? s.r : s.f; return +Math.hypot(p[0] - ip.to[0], p[1] - ip.to[1]).toFixed(3); })(), camOK: !A.camAim || Math.hypot(A.camAim[0] - camTarget()[0], A.camAim[1] - camTarget()[1]) < 0.25, fScr: endScr(s.f), rScr: endScr(s.r), grip: Math.round(grip()), lead: A.lead, nf: FG.n, SHY: +A.SHY.toFixed(2),
          way: carryWay(lvP, cut), mark: mk.rect.map((v) => +v.toFixed(2)), inMark: r, angle: L.angle, still: +A.still.toFixed(2), tries: A.tries,
          bumps: A.bumps, dmg: A.dmg, contact: [...A.contact], passed: [...A.passed], clean: A.clean, scafDown: [...A.scafDown], jarsBroken: [...A.jarsBroken], worker: A.workerJumped, limed: A.limed, slide: A.slide,
          // (how long the lane stays clear of the sledge and the cart where the east way crosses it, s 20 … 45: a careful player's wait)
          laneClear: (() => { const Ln = SH5.lane && SH5.lane.now; if (!Ln) return true; return ['sledge', 'cart'].every((w) => { const q = Ln[w]; return !q || q.off || q.s <= LANE_X[0] || q.s >= LANE_X[1]; }); })(), laneYield: !!(SH5.laneYield && SH5.laneYield()),
          lane: Ln ? { sledge: { s: +Ln.sledge.s.toFixed(1), dir: Ln.sledge.dir, off: Ln.sledge.off || 0, hold: SH5.lane.holdS }, cart: { s: +Ln.cart.s.toFixed(1), dir: Ln.cart.dir, off: Ln.cart.off || 0, hold: SH5.lane.holdC } } : null,
          movers: movers.map((w) => (w ? [+w.a.x.toFixed(1), +w.a.z.toFixed(1), w.held ? 1 : 0] : null)),
          fit: A.fit, lost: A.lost || 0, shim: A.shim || 0, pts: A.pts || null,
          trim: t ? { n: t.n, turn: t.turn, binds: t.binds, wander: t.wander, handle: sc(X, handleW(1)), axis: trimAxis().dir.map((v) => +v.toFixed(3)), strokePx: Math.round(strokePx()) } : null,
          events: A.events.slice(-10), downs: A.downs, quick: A.quick, cam: A.camAim ? A.camAim.map((v) => +v.toFixed(1)) : null };
      },
    };
  },
};
void ease;
