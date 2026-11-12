/* ── build 120 ── h120/acts4.js — station 4 of stage 05, "מקווה לשכת המצורעים" (brief §7): the rain water standing in a rock hollow
 * is brought along a channel cut in the chamber's paving to the rock-cut basin. A tap on the floor: the kohen pours a little from his
 * jug and the thread shows the fall. A finger dragged from the hollow: the kohen marks it in charcoal and two quarrymen cut it behind
 * him; a finger held on the channel deepens it (the fifth finger cracks the slab). The trough and the jars are dragged aside. The clay
 * plug pulled up: the water runs (the model's flow), stops where the fall is wrong (a puddle, "כאן המים נעצרו", a mend), runs through a
 * vessel (pasul: the bucket crew empties the basin, a shower refills the hollow), falls into the basin and rises along the rod. Level 3:
 * the bronze ring on the rod marks the overflow outlet, and the overflow channel leads the surplus out of the door, past the lime pit.
 * The water's look and sound: h120/water120.js, h120/sound120.js.
 *   MIKVEH = { icon, title, walkLine, stand, prepare, make(m, X) → act }   (the registry of acts.js)
 */
import { H120, MIK, CHAMBER, floorH, flow, pourPath, reaches, starts, deepenAt, resample, respace, outletOf, waterGoal, vesselsOf, refChannel, greedy, inVesselAt, inPitAt, mikPts, qOf, starsOf } from './model.js';
import { SH5, mats, box, label, own, viewCone, coneKeep, coneOwn, kohenFig, vesselMesh, chamberRedraw } from './world.js';
import { floorY, grooveMesh, ribbon, wetTrail, fall, puddle, pool, rain, along, now as wNow } from './water120.js';
import { createWaterVoices } from './sound120.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { clamp, lerp, ease } from '../h109/kit.js';

const F = H120.FINGER, FL = H120.FLOOR, D2R = Math.PI / 180;
const sc = (X, v) => { const r = X.scr(v.x, v.y, v.z); return [Math.round(r.x), Math.round(r.y)]; };
const V3 = (X, x, y, z) => new X.THREE.Vector3(x, y, z);
const d2 = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const DOOR = [26, CHAMBER.doorZ + 0.3];
const LVH = { 1: { hand: 1, name: 'המורד' }, 2: { hand: 0, name: 'בלי כלי' }, 3: { hand: 0, name: 'קומת אדם והעודף' } };
/** cumulative distances along resampled points */
function cumOf(P) { const c = [0]; for (let i = 1; i < P.length; i++) c.push(c[i - 1] + Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1])); return c; }
function ptAt(P, C, d) { if (!P.length) return [0, 0]; if (d <= 0) return P[0].slice(0, 2); for (let i = 1; i < P.length; i++) if (C[i] >= d) { const u = (d - C[i - 1]) / Math.max(1e-6, C[i] - C[i - 1]); return [lerp(P[i - 1][0], P[i][0], u), lerp(P[i - 1][1], P[i][1], u)]; } return P[P.length - 1].slice(0, 2); }

export const MIKVEH = {
  icon: '💧', title: 'מקווה לשכת המצורעים',
  walkLine: () => 'הלשכה בלי תקרה, והגשם יורד לתוכה: מביאים את המים אל המקווה',
  stand(m) { const h = MIK.hollows[m.lv || 1]; return { x: h[0] + 1.8, z: h[1] + 1.4, face: [h[0], h[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, PR = X.props, M = mats(X), st = X.M.st, cam = X.camera;
    const lvP = m.lv || 1, lv = X.level(), H = LVH[lvP], hol = MIK.hollows[lvP];
    SH5.busy = 1; SH5.mikLv = lvP; own('__mik', 1);
    const all = [], crew = [], labs = [];
    const voices = createWaterVoices(X.sfx);
    const h0 = +(st.mik.water || 0);
    const A = { phase: 'intro', busy: true, t: 0, h: h0, h0, goal: lvP < 3 ? Math.max(h0, MIK.goal[lvP]) : null, plugOut: 0, cutTo: 0, stops: 0, mends: 0, dmg: 0, cracks: 0, pasul: 0, lime: 0, exact: 0, out: 0,
      fd: 0, ofd: 0, res: null, ores: null, stood: 0, ostood: 0, tings: 0, quick: {}, pours: [], events: [], downs: [], held: null, mended: 0, fillT: 0, done: 0, outlet: st.mik.outlet, drawK: null };
    const guard = (fn) => (f) => { try { fn(f); } catch (e) { console.error('[h120m]', e && e.message, (e && e.stack || '').split('\n').slice(0, 4).join(' / ')); } };
    const FG = fingers(X, { down: guard(fDown), move: guard(fMove), up: guard(fUp) });
    const lab = label(X), lab2 = label(X); labs.push(lab, lab2);
    const ev = (e) => { A.events.push(e); if (A.events.length > 16) A.events.shift(); };

    /* ── the channels of this work (from the save: a reload draws them as cut), the vessels as moved ── */
    const moved = JSON.parse(JSON.stringify(st.mik.moved || {}));
    const chOf = (kind) => st.mik.ch.find((c) => c.lv === lvP && c.kind === kind) || null;
    let chIn = chOf('in'), chOv = lvP === 3 ? chOf('over') : null;
    const save = () => { st.mik.moved = moved; st.mik.ch = st.mik.ch.filter((c) => !(c.lv === lvP && (c.kind === 'in' || c.kind === 'over'))).concat([chIn, chOv].filter(Boolean)); try { X.save(); } catch (e) { /* */ } };
    // the world's chamber draws everything but this work's own (live) things: the act draws those
    chamberRedraw(X);
    const BW = () => SH5.ch && SH5.ch.basin && SH5.ch.basin.bw;

    /* ── the camera: high over the way (hollow → basin, and at level 3 the outlet → the door), 57° down from the south; the rod's close
     *    shot from over the steps ── */
    const frameDist = (w, h) => { const vf = ((cam && cam.fov) || 40) * D2R, asp = (cam && cam.aspect) || innerWidth / innerHeight, hf = 2 * Math.atan(Math.tan(vf / 2) * asp); return Math.max((w / 2) / Math.tan(hf / 2), (h / 2) / Math.tan(vf / 2)); };
    const look = (aim, from, dist, el) => { const l = Math.hypot(from[0], from[1]) || 1, c = Math.cos(el * D2R), s = Math.sin(el * D2R); return { p: [aim[0] + (from[0] / l) * dist * c, aim[1] + dist * s, aim[2] + (from[1] / l) * dist * c], t: aim }; };
    const EL = 57, AZ = [0.22, 1];
    function frameOf(pts) {
      let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const p of pts) { x0 = Math.min(x0, p[0]); x1 = Math.max(x1, p[0]); z0 = Math.min(z0, p[1]); z1 = Math.max(z1, p[1]); }
      const w = x1 - x0 + 5, d = z1 - z0 + 4.5, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      // (the HUD's row over the top of the frame: the frame a little taller, its aim a little north so the far end clears the row)
      const hh = d * Math.sin(EL * D2R) + 3.6 * Math.cos(EL * D2R), dist = frameDist(w, hh * 1.5);
      return look([cx, floorY(cx, cz), cz - hh * 0.2], AZ, dist, EL);
    }
    const wayIn = () => [hol, MIK.inlet, [MIK.stair, MIK.z1], ...(chIn ? along(chIn.pts, 1) : []), ...(lvP === 2 ? vesselsOf(moved).map((v) => v.at) : []), ...(refChannel(lvP, 'in').pts)];
    const wayOv = () => [MIK.outlet, [MIK.x0, MIK.z1], DOOR, [MIK.pit.x0, MIK.pit.z0], [MIK.pit.x1, MIK.pit.z1], ...(chOv ? along(chOv.pts, 1) : [])];
    const S_IN = () => frameOf(wayIn());
    const S_OV = () => frameOf(wayOv());
    const S_ALL = () => frameOf(wayIn().concat(lvP === 3 ? wayOv() : []));
    const rodMid = () => clamp(A.h + 0.4, 0.9, 2.6);
    const S_ROD = () => look([MIK.rod[0] + 0.35, MIK.bottom + rodMid(), MIK.rod[1]], [1, -0.12], frameDist(3.4, 4.0), 52);   // (from over the steps' top, 52° down: the steps' slope is under 37°, the whole rod seen)
    const shot = (S, d = 0.9) => { A.shotK = S; X.shot(S.p, S.t, d); };
    // (while the water runs: a high shot about twenty amot wide riding with its front, eased: the ribbon, its streaks and its lip read,
    //  a man no taller than a fifth of the frame)
    const S_FRONT = (q) => look([q[0], floorY(q[0], q[1]), q[1] - 1.6], AZ, frameDist(20, 15), 56);
    const follow = (q) => { const S = S_FRONT(q); if (X.track) X.track(S.p, S.t, 1.6, 0.9); else X.shot(S.p, S.t, 0); };
    const cone = (S, r) => [S.p, S.t, r];

    /* ── the figures: the kohen (white, his turban; his jug), two quarrymen with chisel and mallet; on their own floor ── */
    const onFloor = (w) => { if (w) { w.a.ground = floorY; w.a.y = floorY(w.a.x, w.a.z); } return w; };
    const kf = onFloor(kohenFig(hol[0] + 1.9, hol[1] + 0.6)); if (kf) { crew.push(kf); kf.fx = null; }
    const qm = [0, 1].map((k) => { const w = onFloor(SH5.crew.add(hol[0] - 1.6 - k * 1.1, hol[1] - 1.2, { role: 'hold', item: k ? 'mallet' : 'chisel', crew: 3, tunic: k ? '#B9A27C' : '#A88E66' })); if (w) { crew.push(w); w.fx = null; } return w; });
    viewCone(X, [cone(S_ALL(), 4), cone(S_ROD(), 1.5)], { keep: [[CHAMBER.x0 - 2, CHAMBER.z0 - 2, CHAMBER.x1 + 2, CHAMBER.z1 + 2]], skip: crew });
    /** a figure goes toward (x, z) at most v amot a second, facing where it goes, then (fx, fz) */
    function stepTo(w, x, z, dt, v = 4, fx, fz) {
      if (!w) return true; const a = w.a, dx = x - a.x, dz = z - a.z, L = Math.hypot(dx, dz), s = Math.min(L, v * dt);
      if (L > 1e-3) { a.x += (dx / L) * s; a.z += (dz / L) * s; if (L > 0.15) a.yaw = Math.atan2(dx, dz); }
      if (L < 0.15 && fx != null) a.yaw = Math.atan2(fx - a.x, fz - a.z);
      return L < 0.1;
    }
    /** the side of a line away from the camera (a man there never covers it) */
    function farSide(P, i, off) {
      const a = P[Math.max(0, i - 1)], b = P[Math.min(P.length - 1, i + 1)]; let tx = b[0] - a[0], tz = b[1] - a[1]; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      let nx = -tz, nz = tx; const away = -(nx * AZ[0] + nz * AZ[1]) / Math.hypot(AZ[0], AZ[1]); if (away < 0) { nx = -nx; nz = -nz; }
      return [P[i][0] + nx * off, P[i][1] + nz * off];
    }
    const pose = (w, r, bow, item) => { if (!w) return; const a = w.a; a.arm[0] = a.armT[0] = r; a.arm[2] = a.armT[2] = r; a.arm[1] = a.armT[1] = -0.2; a.arm[3] = a.armT[3] = -0.2; a.bow = a.bowT = bow; if (item !== undefined) { try { X.actors().setItem(a, item); } catch (e) { /* */ } } };

    /* ── the live things: the hollow's pool and its plug, the vessels, the grooves, the charcoal line, the water ── */
    const live = new T.Group(); PR.root.add(live); all.push(live);
    const hp = pool(X, hol[0], hol[1]); live.add(hp.mesh); hp.set(1);
    const plugM = new T.Mesh(new T.CylinderGeometry(0.17, 0.2, 0.42, 10), M.h5plug); plugM.castShadow = true; live.add(plugM);
    // (the plug in the channel's mouth at the hollow's rim, a little to the side away from the camera)
    const plugHome = () => { const P = chIn ? along(chIn.pts, 0.1) : null; if (P && P.length > 2) { const C = cumOf(P); let i = 0; while (i < P.length - 1 && C[i] < 1.15) i++; return farSide(P, i, 0.32); } return [hol[0] + 1.2, hol[1]]; };
    let plugUp = 0;
    function plugDraw() { const q = plugHome(), y = floorY(q[0], q[1]); plugM.position.set(q[0] + plugUp * 0.5, y + 0.2 + plugUp * 0.7, q[1] + plugUp * 0.3); plugM.rotation.z = plugUp * 0.9; }
    let vesM = {};
    function vesselsDraw() { for (const k in vesM) for (const o of vesM[k]) PR.remove(o); vesM = {}; for (const v of vesselsOf(moved)) vesM[v.id] = vesselMesh(X, v, live); }
    vesselsDraw();
    let grooveIn = null, grooveOv = null, charcoal = null;
    function groovesDraw() {
      for (const g of [grooveIn, grooveOv]) if (g) { live.remove(g); g.geometry.dispose(); }
      grooveIn = chIn && A.cutK !== 'in' ? grooveMesh(X, chIn.pts) : (chIn ? grooveMesh(X, cutPart(chIn.pts)) : null); if (grooveIn) live.add(grooveIn);
      grooveOv = chOv && A.cutK !== 'over' ? grooveMesh(X, chOv.pts) : (chOv ? grooveMesh(X, cutPart(chOv.pts)) : null); if (grooveOv) live.add(grooveOv);
    }
    // (the part the quarrymen have cut so far, while they follow the charcoal line)
    function cutPart(pts) { const P = along(pts, 0.25), C = cumOf(P), out = []; for (let i = 0; i < P.length; i++) { if (C[i] > A.cutTo) break; out.push(P[i]); } return out.length > 1 ? out : P.slice(0, 2); }
    function charcoalDraw(pts) {
      if (charcoal) { live.remove(charcoal); charcoal.geometry.dispose(); charcoal = null; }
      if (!pts || pts.length < 2) return;
      const P = resample(pts.map((p) => [p[0], p[1], 1]), 0.25), pos = [];
      for (let i = 1; i < P.length; i++) pos.push(P[i - 1][0], floorY(P[i - 1][0], P[i - 1][1]) + 0.012, P[i - 1][1], P[i][0], floorY(P[i][0], P[i][1]) + 0.012, P[i][1]);
      const g = new T.BufferGeometry(); g.setAttribute('position', new T.Float32BufferAttribute(pos, 3));
      charcoal = new T.LineSegments(g, new T.LineBasicMaterial({ color: 0x1A1612, transparent: true, opacity: 0.9, depthWrite: false })); charcoal.renderOrder = 3; live.add(charcoal);
    }
    groovesDraw(); plugDraw();
    // the water: the ribbon and the wet stone along the inflow (and the overflow), the fall, the puddle, the spill, the gold at the front
    let rib = null, wet = null, orib = null, owet = null, spillR = null, spillW = null, Pin = [], Cin = [], Pov = [], Cov = [];
    function waterBuild() {
      for (const o of [rib, wet, orib, owet]) if (o) { live.remove(o.mesh); o.mesh.geometry.dispose(); }
      rib = wet = orib = owet = null;
      if (chIn) { Pin = resample(chIn.pts, 0.25); Cin = cumOf(Pin); rib = ribbon(X, chIn.pts); wet = wetTrail(X, chIn.pts, { dry: 60 }); if (rib) { live.add(rib.mesh); live.add(wet.mesh); } }
      if (chOv) { Pov = resample(chOv.pts, 0.25); Cov = cumOf(Pov); orib = ribbon(X, chOv.pts); owet = wetTrail(X, chOv.pts, { dry: 60 }); if (orib) { live.add(orib.mesh); live.add(owet.mesh); } }
      waterSet();
    }
    function waterSet() {
      if (rib) { rib.set(A.plugOut || A.drain ? A.fd : 0, A.drain ? A.drainAt : -1, A.plugOut ? 1 : 0.6); wet.set(Math.max(A.fd, A.wetIn || 0), A.plugOut ? -1 : (A.leftIn || -1)); }
      if (orib) { orib.set(A.ofd, -1, 1); owet.set(Math.max(A.ofd, A.wetOv || 0), -1); }
    }
    const fl = fall(X); live.add(fl.g); fl.set(0, MIK.bottom + A.h);
    let pud = null;
    const gold = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const g = c.getContext('2d'), r = g.createRadialGradient(32, 32, 0, 32, 32, 32); r.addColorStop(0, 'rgba(255,240,170,1)'); r.addColorStop(0.35, 'rgba(255,214,90,0.7)'); r.addColorStop(1, 'rgba(255,200,60,0)'); g.fillStyle = r; g.fillRect(0, 0, 64, 64); const s = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(c), transparent: true, depthWrite: false, blending: T.AdditiveBlending })); s.renderOrder = 9; s.visible = false; return s; })();
    live.add(gold); let goldK = 0;
    const rn = rain(X, hol[0], hol[1], 5); live.add(rn.mesh); rn.set(0);
    waterBuild();
    // level 3's ring on the rod (the bronze marker the outlet will be cut at)
    let ring = null; if (lvP === 3) { ring = new T.Mesh(new T.TorusGeometry(0.12, 0.035, 6, 16), M.h5bronze); ring.rotation.x = Math.PI / 2; live.add(ring); }
    const ringH = () => (A.outlet != null ? A.outlet : A.ringH != null ? A.ringH : 2.2);
    function ringDraw() { if (ring) ring.position.set(MIK.rod[0], MIK.bottom + ringH(), MIK.rod[1]); }
    A.ringH = A.outlet != null ? A.outlet : 2.2; ringDraw();
    BW() && BW().set(A.h);

    /* ── the screen: a floor point under a finger (the ray onto the relief), the grips ── */
    function floorAt(x, y) {
      const rc = X.rayAt(x, y), ray = rc && (rc.ray || rc); if (!ray || !ray.origin) return null; let yy = FL, p = null;
      for (let k = 0; k < 4; k++) { const t = (yy - ray.origin.y) / (ray.direction.y || -1e-6); if (t <= 0) return null; p = [ray.origin.x + ray.direction.x * t, ray.origin.z + ray.direction.z * t]; yy = floorY(p[0], p[1]); }
      return p;
    }
    const sp = (x, z, dy = 0) => sc(X, { x, y: floorY(x, z) + dy, z });
    const R = (f, q) => Math.hypot(f.x - q[0], f.y - q[1]);
    const grip = () => Math.max(46, Math.min(innerWidth, innerHeight) * 0.07);
    function nearCh(ch, p, r = 0.55) { if (!ch) return -1; let bi = -1, bd = r; ch.pts.forEach((q, i) => { const d = d2(q, p); if (d < bd) { bd = d; bi = i; } }); return bi; }
    const plugScr = () => sc(X, plugM.position);
    const ringScr = () => (ring ? sc(X, ring.position) : null);
    const vesScr = (v) => sp(v.at[0], v.at[1], v.kind === 'trough' ? 0.3 : 0.8);
    function pick(f) {
      const L = [];
      if (A.phase === 'rod' && ring) L.push(['ring', R(f, ringScr()) * 0.8]);
      if (!A.plugOut && (A.phase === 'draw') && chIn) L.push(['plug', R(f, plugScr())]);
      if (['draw', 'stop', 'run'].includes(A.phase)) for (const v of vesselsOf(moved)) L.push(['v:' + v.id, R(f, vesScr(v)) * (v.kind === 'trough' ? 0.85 : 1)]);
      L.sort((a, b) => a[1] - b[1]);
      return L[0] && L[0][1] < grip() ? L[0][0] : null;
    }

    /* ── the fingers ── */
    function fDown(f) {
      if (A.busy) return;
      const g = pick(f), p = floorAt(f.x, f.y); f.p0 = p; f.t0s = A.t;
      A.downs.push([g || (p ? 'floor' : null), Math.round(f.x), Math.round(f.y), A.phase]); if (A.downs.length > 8) A.downs.shift();
      if (g === 'ring') { f.what = 'ring'; f.h0 = ringH(); const s0 = ringScr(), up = sc(X, { x: MIK.rod[0], y: MIK.bottom + ringH() + 1, z: MIK.rod[1] }); f.pxA = Math.max(20, s0[1] - up[1]); return; }   // (an amah's pixels taken once, as the finger lands)
      // (the nearest grip wins: the plug beside the channel's mouth, or the channel's point under the finger)
      if (g === 'plug') { const i = p ? nearCh(chIn, p) : -1; if (i < 0 || R(f, plugScr()) <= R(f, sp(chIn.pts[i][0], chIn.pts[i][1]))) { f.what = 'plug'; return; } }
      if (g && g.startsWith('v:')) { f.what = 'vessel'; f.vid = g.slice(2); return; }
      if (!p || !['draw', 'stop', 'run', 'over-stop'].includes(A.phase)) return;
      // from the hollow: a new inflow; at level 3 from the outlet (once marked): the overflow; on a channel: a hold deepens it, a drag
      // redraws it from there; anywhere else a tap is a test pour
      if (d2(p, hol) < 1.7) { f.what = 'draw'; f.kind = 'in'; f.pts = [[hol[0], hol[1], 1]]; return; }
      if (lvP === 3 && A.outlet != null && d2(p, MIK.outlet) < 1.3) { f.what = 'draw'; f.kind = 'over'; f.pts = [[MIK.outlet[0], MIK.outlet[1], 1]]; return; }
      for (const [kind, ch] of [['in', chIn], ['over', chOv]]) { const i = nearCh(ch, p); if (i >= 0) { f.what = 'ch'; f.kind = kind; f.i = i; return; } }
      f.what = 'floor';
    }
    function fMove(f) {
      if (f.what === 'ring') { A.ringH = clamp(f.h0 - (f.y - f.y0) / (f.pxA || 60), 1.0, 3.6); ringDraw(); lab.set(fmtH(A.ringH), { x: MIK.rod[0] - 0.4, y: MIK.bottom + A.ringH + 0.15, z: MIK.rod[1] }, Math.abs(A.ringH - MIK.deep) <= F); return; }
      if (f.what === 'vessel') { const p = floorAt(f.x, f.y); if (p) { const v = vesselsOf(moved).find((q) => q.id === f.vid); const x = clamp(p[0], CHAMBER.x0 + 1.5, CHAMBER.x1 - 1.5), z = clamp(p[1], CHAMBER.z0 + 1.2, CHAMBER.z1 - 1.2); if (!(x > MIK.x0 - 1.6 && x < MIK.stair + 1.6 && z > MIK.z0 - 1.4 && z < MIK.z1 + 1.4)) { moved[v.id] = [+x.toFixed(2), +z.toFixed(2)]; for (const o of vesM[v.id] || []) { o.position.x = x; o.position.z = z; o.position.y = floorY(x, z); } } } return; }
      if (f.what === 'ch' && f.moved > 14 && A.t - f.t0s < 0.45 && !f.deep) {
        // a drag from a point of the channel: a branch from there replaces what was after it
        const ch = f.kind === 'in' ? chIn : chOv; f.what = 'draw'; f.pts = ch.pts.slice(0, f.i + 1).map((q) => q.slice()); f.keep = f.i + 1;
      }
      if (f.what === 'draw') { const p = floorAt(f.x, f.y); if (!p) return; const last = f.pts[f.pts.length - 1]; if (d2(p, last) >= 0.45 && inside(p)) { f.pts.push([+p[0].toFixed(3), +p[1].toFixed(3), 1]); charcoalDraw(f.pts); } f.cur = p; }
    }
    function fUp(f) {
      if (f.what === 'ring') { lab.set('', null); return ringSet(); }
      if (f.what === 'plug') { if (f.y0 - f.y > 30 || (MOUSE && f.y0 - f.y > 24)) openPlug(); else X.line('משכו את הפקק למעלה', 1800); return; }
      if (f.what === 'vessel') { ev('moved ' + f.vid); save(); if (A.plugOut) mend('vessel'); recompute(); return; }
      if (f.what === 'draw') return drawDone(f);
      if (f.deep) { A.held = null; lab2.set('', null); if (!A.cutK) idleMen(); return; }
      if ((f.what === 'floor' || f.what === 'ch') && f.moved < 14 && A.t - f.t0s < 0.45 && f.p0) testPour(f.p0);
    }
    const inside = (p) => p[0] > CHAMBER.x0 + 0.4 && p[0] < CHAMBER.x1 - 0.4 && p[1] > CHAMBER.z0 + 0.4 && p[1] < (Math.abs(p[0] - DOOR[0]) < 3.6 ? CHAMBER.z1 + 0.5 : CHAMBER.z1 - 0.4) && !(p[0] > MIK.x0 - 0.1 && p[0] < MIK.stair + 0.1 && p[1] > MIK.z0 + 0.15 && p[1] < MIK.z1 - 0.15);
    const fmtH = (h) => { const a = Math.floor(h + 1e-6), r = Math.round((h - a) * 24); return r === 0 ? `${a} אמות` : r === 24 ? `${a + 1} אמות` : `${a} אמות ו־${r} אצבעות`; };

    /* ── drawing: the charcoal line, then the cut following it ── */
    function drawDone(f) {
      const kind = f.kind; let pts = f.pts;
      charcoalDraw(null);
      if (pts.length < 2) { if (f.keep == null) testPour(pts[0]); return; }
      // the end at the basin's inlet notch (in) or out of the door (over), when the finger ended near it
      const e = pts[pts.length - 1];
      if (kind === 'in' && d2(e, MIK.inlet) < 1.6) { if (d2(e, MIK.inlet) > 0.05) pts.push([MIK.inlet[0], MIK.inlet[1], 1]); }
      if (kind === 'over' && Math.abs(e[1] - CHAMBER.doorZ) < 2.2 && e[0] > CHAMBER.door[0] - 1 && e[0] < CHAMBER.door[1] + 1) pts.push([clamp(e[0], CHAMBER.door[0] + 0.6, CHAMBER.door[1] - 0.6), CHAMBER.doorZ + 0.3, 1]);
      // every half amah (the points a hold deepens)
      const keep = f.keep || 1, head = pts.slice(0, keep), tail = respace(pts.slice(keep - 1).map((q) => [q[0], q[1], q[2] || 1]), 0.5).slice(1).map((q) => [+q[0].toFixed(3), +q[1].toFixed(3), +(q[2] || 1).toFixed(2)]);
      pts = head.concat(tail);
      const ch = { lv: lvP, kind, pts };
      if (kind === 'in') chIn = ch; else chOv = ch;
      X.hand(null);
      if (A.plugOut || A.stood) mend('draw');
      save(); ev('drawn ' + kind + ' ' + pts.length);
      // the quarrymen cut it from where it was already cut (a branch: from its point)
      const P = along(pts, 0.25), C = cumOf(P); A.cutK = kind; A.cutTo = f.keep ? C[Math.min(C.length - 1, (f.keep - 1) * 2)] || 0 : 0; A.cutLen = C[C.length - 1];
      groovesDraw(); waterBuild(); plugDraw(); recompute();
      if (lv === 1 && kind === 'in' && !reaches(ch)) X.line('החריץ צריך להגיע עד הפתח שבשפת המקווה', 2600);
    }
    function cutFrame(dt) {
      if (!A.cutK) return;
      const ch = A.cutK === 'in' ? chIn : chOv; if (!ch) { A.cutK = null; return; }
      const P = along(ch.pts, 0.25), C = cumOf(P);
      A.cutTo = Math.min(A.cutLen, A.cutTo + dt * 3.2);
      // the two men at the cut's end, on the line's far side, one a little behind the other, their chisels going
      qm.forEach((w, k) => { if (!w) return; const d = Math.max(0, A.cutTo - k * 0.9), i = Math.min(P.length - 1, Math.round(d / 0.25)), q = farSide(P, i, 0.75); stepTo(w, q[0], q[1], dt, 5, P[i][0], P[i][1]); w.role = 'hammer'; });
      if ((A.t * 3) % 1 < dt * 3) { const q = ptAt(P, C, A.cutTo); X.dust(q[0], floorY(q[0], q[1]) + 0.1, q[1], 2, 0.6); X.play('chisel'); }
      if ((A.t * 6) % 1 < dt * 6) groovesDraw();
      if (A.cutTo >= A.cutLen - 1e-6) { A.cutK = null; groovesDraw(); qm.forEach((w) => { if (w) w.role = 'hold'; }); idleMen(); }
    }
    function idleMen() { const sd = hol[0] - 3.6 < CHAMBER.x0 + 0.8 ? 1 : -1; qm.forEach((w, k) => { if (!w) return; const q = [hol[0] + sd * (2.3 + k * 1.0), hol[1] + 0.2 - k * 0.5];   // (beside the hollow, off the way south)
      w.role = 'hold'; w.a.x = q[0]; w.a.z = q[1]; w.a.yaw = Math.atan2(hol[0] - q[0], hol[1] - q[1]); pose(w, 0.1, 0); }); }

    /* ── a hold deepens the channel: a finger of depth a second, the quarryman there; the fifth finger cracks the slab ── */
    function deepFrame(dt) {
      for (const f of FG.L.values()) {
        if (f.what !== 'ch' || f.moved > 14) continue;
        if (!f.deep && A.t - f.t0s >= 0.32) { f.deep = 1; ev('deepen ' + f.kind + ' ' + f.i); if (A.plugOut || A.stood) mend('deepen'); }
        if (!f.deep) continue;
        const ch = f.kind === 'in' ? chIn : chOv, q = ch.pts[f.i]; A.held = { kind: f.kind, i: f.i };
        const w = qm[0]; if (w) { const P = ch.pts, s = farSide(P, f.i, 0.75); stepTo(w, s[0], s[1], dt, 5, q[0], q[1]); w.role = 'hammer'; }
        const { cracked } = deepenAt(ch.pts, q[0], q[1], dt, 0.3);   // (the held point only: the channel's points are half an amah apart)
        if ((A.t * 4) % 1 < dt * 4) { X.dust(q[0], floorY(q[0], q[1]) + 0.1, q[1], 3, 0.7); X.play('chisel'); }
        lab2.set(fmtD(q[2]), { x: q[0], y: floorY(q[0], q[1]) + 1.0, z: q[1] }, q[2] >= 3.9);
        if (cracked.length) { crack(ch, q, cracked); f.what = null; f.deep = 0; lab2.set('', null); return; }
        if ((A.t * 2) % 1 < dt * 2) { groovesDraw(); recompute(true); }
      }
    }
    const fmtD = (d) => { const n = Math.floor(d + 1e-6); return n >= 4 ? 'טפח' : n === 1 ? 'אצבע' : `${n} אצבעות`; };
    async function crack(ch, q, idx) {
      A.busy = true; A.dmg++; A.cracks++; ev('crack'); lab2.set('', null);
      X.play('crack'); X.shake && X.shake(0.15, 0.25);
      X.loss(20, V3(X, q[0], floorY(q[0], q[1]) + 1, q[1]), 'הלוח נסדק', 0);
      X.line('אצבע חמישית: הלוח נסדק. הבנאים מחליפים אותו', 3000);
      for (let i = 0; i < ch.pts.length; i++) if (d2(ch.pts[i], q) <= 0.6) ch.pts[i][2] = 1;
      // the slab: a dark crack across it, two masons lift it and lay a fresh one, the channel cut again across it at one finger
      const sx = Math.floor((q[0] - 0) / 2.5) * 2.5, sz = q[1] - 1, y = floorY(q[0], q[1]);
      const crackM = box(X, M.h5dark, q[0] - 1.0, y + 0.006, q[1] - 0.02, q[0] + 1.0, y + 0.012, q[1] + 0.02); crackM.rotation.y = 0.6; live.add(crackM);
      const ms = [-1, 1].map((k) => onFloor(SH5.crew.add(q[0] + k * 1.6, q[1] - 1.2, { role: 'lever', fx: q[0], fz: q[1], crew: 2 }))); for (const w of ms) if (w) { crew.push(w); coneOwn(w); }
      await X.wait(1.4); live.remove(crackM);
      const slab = box(X, M.h5lime, q[0] - 1.25, y - 0.05, q[1] - 1.0, q[0] + 1.25, y + 0.003, q[1] + 1.0); live.add(slab); void sx; void sz;
      X.play('stamp'); X.dust(q[0], y + 0.2, q[1], 8, 1.5);
      await X.wait(0.9); for (const w of ms) { SH5.crew.remove(w); const i = crew.indexOf(w); if (i >= 0) crew.splice(i, 1); }
      groovesDraw(); save(); recompute(); A.busy = false;
    }

    /* ── the test pour: the kohen walks there with his jug and pours; a thread runs down the steepest fall and dries in seconds ── */
    function testPour(p) {
      if (!p || !inside(p)) return;
      A.pourTo = p; ev('pour ' + p.map((v) => v.toFixed(1)));
    }
    function pourFrame(dt) {
      if (A.pourTo && kf && !A.drawingK) {
        const p = A.pourTo, s = [p[0] + 0.55, p[1] - 0.45];
        if (stepTo(kf, s[0], s[1], dt, 5.5, p[0], p[1])) {
          A.pourTo = null; pose(kf, 1.0, 0.35, 'jar');
          const path = pourPath(p[0], p[1], 4.5, 0.2); if (path.length < 2) path.push([p[0] + 0.15, p[1]]);
          const P = path.map((q) => [q[0], q[1], 1]), r = ribbon(X, P, { thin: 1, w: 0.14, speed: 2.4 }), w = wetTrail(X, P, { dry: 6, w: 0.3 });
          if (r) { live.add(w.mesh); live.add(r.mesh); A.pours.push({ r, w, t: 0, L: r.len, at: p }); X.play('pour'); }
          if (A.pours.length > 3) { const o = A.pours.shift(); live.remove(o.r.mesh); live.remove(o.w.mesh); }
        }
      }
      for (const o of A.pours) {
        o.t += dt; const fr = Math.min(o.L, o.t * 2.6), tail = o.t > 1.3 ? (o.t - 1.3) * 3 : -1;
        o.r.set(fr, tail, 0.6); o.w.set(fr, tail >= o.L ? o.left || (o.left = wNow()) : -1);
        if (o.t > 1.4 && kf && kf.a.item === 'jar' && !A.pourTo) pose(kf, 0.1, 0, null);
      }
    }

    /* ── the run: the flow along the inflow (and level 3's overflow) ── */
    function recompute(quiet) {
      A.res = chIn && reaches(chIn) ? flow(chIn, { moved }) : null;
      A.ores = chOv ? flow(chOv, { moved }) : null;
      if (!quiet && (A.phase === 'stop' || A.phase === 'run')) { const r = A.res; if (r && (r.ok || stopD(r, Cin) > A.fd + 0.05)) { A.phase = 'run'; A.stood = 0; lab.set('', null); ev('runs on'); } }
      if (!quiet && A.phase === 'over-stop') { const r = A.ores; if (r && (r.ok || stopD(r, Cov) > A.ofd + 0.05)) { A.phase = 'over'; A.ostood = 0; lab.set('', null); } }
    }
    const stopD = (r, C) => (r.ok ? C[C.length - 1] : C[Math.max(0, r.stop)] || 0);
    function mend(why) { if (A.mendT === A.t) return; A.mendT = A.t; A.mends++; ev('mend ' + why); }
    /** the first sample where the inflow runs through a vessel (or −1) */
    function vesselIdx(P) { const V = vesselsOf(moved); for (let i = 0; i < P.length; i++) for (const v of V) if (inVesselAt(P[i][0], P[i][1], v)) return [i, v]; return [-1, null]; }
    function openPlug() {
      if (A.plugOut || A.busy) return;
      if (lvP === 3 && A.outlet == null) { X.line('קודם הטבעת על המוט', 1800); return; }
      if (!chIn || !starts(chIn) || !reaches(chIn)) { X.line('החריץ עוד לא מגיע מהגומה אל המקווה', 2400); return; }
      if (A.cutK) { X.line('החוצבים עוד חורצים', 1600); return; }
      A.plugOut = 1; A.phase = 'run'; A.fd = 0; A.tings = 0; A.stood = 0; A.firstRun = A.firstRun || 0; A.runStops = 0; ev('plug out');
      recompute(true); X.play('wood'); X.hand(null);
      X.line(lvP === 3 ? 'המים זורמים אל המקווה' : 'המים זורמים', 1800);
    }
    function runFrame(dt) {
      const r = A.res; if (!r || !rib) return;
      const total = Cin[Cin.length - 1] || 0, to = stopD(r, Cin);
      // the front: about two amot a second, a little slower where it climbs to a stand
      if (A.fd < to) {
        A.fd = Math.min(to, A.fd + dt * 2.3);
        const k = Math.floor(A.fd / 2); if (k > A.tings) { A.tings = k; voices.ting(k); goldK = 1; if (!A.quick.flows) { A.quick.flows = 1; const q = ptAt(Pin, Cin, A.fd); X.quick(V3(X, q[0], floorY(q[0], q[1]) + 0.6, q[1]), 'זורם!', null); } }
        // (through a vessel: it is seen as it passes)
        const [vi, v] = vesselIdx(Pin); if (vi >= 0 && A.fd >= Cin[vi] && !A.vPass) { A.vPass = v.id; ev('vessel ' + v.id); lab2.set('המים עוברים דרך כלי', { x: v.at[0], y: floorY(v.at[0], v.at[1]) + 1.6, z: v.at[1] }, false); X.play('splash'); }
      }
      const q = ptAt(Pin, Cin, A.fd); gold.position.set(q[0], floorY(q[0], q[1]) + 0.12, q[1]);
      if (!FG.n) follow(q);
      voices.trickle(A.stood ? 0.25 : 0.85);
      if (!r.ok && A.fd >= to - 1e-6 && !A.stood) {
        // it stands: a puddle, the marker, drops
        A.stood = 1; A.stops++; A.phase = 'stop'; ev('stop at ' + r.stop); voices.drops();
        const a = r.at || q, P = Pin, i = Math.max(1, r.stop), dir = [P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]];
        if (pud) live.remove(pud.mesh); pud = puddle(X, a[0], a[1], dir[0], dir[1]); live.add(pud.mesh); A.pudR = 0;
        lab.set('כאן המים נעצרו', { x: a[0], y: floorY(a[0], a[1]) + 0.9, z: a[1] }, false);
        setTimeout(() => { if (A.phase === 'stop') shot(S_IN(), 1.0); }, 1800);
        X.line(lv === 1 ? 'המים נעצרו: החזיקו אצבע על החריץ שלפני הסימן להעמיק אותו, או גררו אותו מחדש משם' : 'המים נעצרו: העמיקו, או גררו מחדש מהנקודה הזאת', 3600);
      }
      if (r.ok && A.fd >= total - 1e-6) { A.phase = 'fill'; A.fillT = 0; ev('falls in'); if (!A.stops && !A.dmg) { A.quick.perfect = 1; X.quick(V3(X, MIK.inlet[0], FL + 0.6, MIK.inlet[1]), 'מושלם!', null); } shot(S_ROD(), 1.2); X.line(lvP === 1 ? 'המים יורדים למקווה. עוקבים אחרי המוט' : 'המים יורדים למקווה', 2400); }
    }
    function fillFrame(dt) {
      A.fillT += dt;
      const goal = lvP < 3 ? A.goal : Math.min(A.outlet, MIK.deep + MIK.rim + 0.06);
      const rate = Math.max(0.12, (goal - A.h0) / 7);
      A.h = Math.min(goal, A.h + rate * dt);
      if (BW()) { BW().set(A.h); BW().drop(MIK.inlet[0], MIK.z0 + 0.25, 1); }
      fl.set(1, MIK.bottom + A.h); voices.pour(1, A.h / 3.3); voices.trickle(0.8);
      hp.set(clamp(1 - 0.7 * (A.h - A.h0) / Math.max(0.2, goal - A.h0), 0.3, 1));
      if ((A.fillT % 2.5) < dt) shot(S_ROD(), 1.6);
      if (A.vPass && A.fillT > 2.2) return pasul();
      if (A.h >= goal - 1e-4) {
        if (lvP < 3) return finish();
        // level 3: at the outlet the surplus leaves by the overflow; over the rim (an outlet marked too high) it goes over by itself
        if (outletOf(A.outlet) === 'over' || !chOv || !starts(chOv)) return spill();
        A.phase = 'over'; A.ofd = 0; ev('overflow'); X.line('המים הגיעו לפתח הגלישה: העודף יוצא', 2200);
      }
    }
    function overFrame(dt) {
      const r = A.ores; if (!r || !orib) return spill();
      fl.set(0.6, MIK.bottom + A.h); voices.pour(0.6, A.h / 3.3);
      const total = Cov[Cov.length - 1] || 0, to = stopD(r, Cov);
      if (A.ofd < to) { A.ofd = Math.min(to, A.ofd + dt * 2.3); const k = Math.floor(A.ofd / 2) + 100; if (k > (A.otings || 100)) { A.otings = k; voices.ting(k - 100 + A.tings); goldK = 1; } }
      const q = ptAt(Pov, Cov, A.ofd); gold.position.set(q[0], floorY(q[0], q[1]) + 0.12, q[1]); if (!FG.n) follow(q);
      // into the lime pit on the way: spoiled
      if (r.pit) { for (let i = 0; i < Pov.length; i++) if (inPitAt(Pov[i][0], Pov[i][1])) { if (A.ofd >= Cov[i]) return limeSpoiled(Pov[i]); break; } }
      if (!r.ok && A.ofd >= to - 1e-6 && !A.ostood) {
        A.ostood = 1; A.stops++; A.phase = 'over-stop'; voices.drops(); const a = r.at || q;
        if (pud) live.remove(pud.mesh); pud = puddle(X, a[0], a[1], 1, 0); live.add(pud.mesh); A.pudR = 0;
        lab.set('כאן המים נעצרו', { x: a[0], y: floorY(a[0], a[1]) + 0.9, z: a[1] }, false); setTimeout(() => { if (A.phase === 'over-stop') shot(S_OV(), 1.0); }, 1800); X.line('המים נעצרו בחריץ הגלישה: העמיקו, או גררו מחדש', 3000);
      }
      if (r.ok && A.ofd >= total - 1e-6) { A.out = 1; ev('out the door'); X.line('העודף יוצא מפתח הלשכה', 2200); finish(); }
    }
    /** the surplus over the rim or out of an outlet with no channel: down the steepest fall, into the lime pit */
    function spill() {
      A.phase = 'spill'; A.busy = true; ev('spill');
      const from = [MIK.outlet[0], MIK.z1 + 0.35], path = pourPath(from[0], from[1], 16, 0.2), P = path.map((q) => [q[0], q[1], 1]);
      spillR = ribbon(X, P, { w: 0.22 }); spillW = wetTrail(X, P, { dry: 60, w: 0.5 }); if (spillR) { live.add(spillW.mesh); live.add(spillR.mesh); }
      shot(S_OV(), 1.0); X.line(outletOf(A.outlet) === 'over' ? 'הפתח גבוה משפת המקווה: המים גולשים מעל השפה' : 'אין חריץ גלישה: המים גולשים על הרצפה', 2600);
      const L = spillR ? spillR.len : 0; let d = 0;
      (async () => {
        while (d < L) { await X.wait(1 / 30); d = Math.min(L, d + 2.4 / 30); spillR.set(d, -1, 1); spillW.set(d, -1); const q = path[Math.min(path.length - 1, Math.round(d / 0.2))]; gold.position.set(q[0], floorY(q[0], q[1]) + 0.12, q[1]); if (inPitAt(q[0], q[1])) break; }
        const e = path[path.length - 1];
        if (path.some((q) => inPitAt(q[0], q[1]))) limeSpoiled(e); else { pud = puddle(X, e[0], e[1]); live.add(pud.mesh); A.pudR = 0; finish(); }
      })();
    }
    async function limeSpoiled(at) {
      if (A.lime) return; A.lime = 1; A.dmg++; A.busy = true; A.phase = 'lime'; ev('lime');
      st.mik.limeSpoiled = 1;
      const y = floorY(at[0], at[1]);
      voices.hiss(); X.loss(20, V3(X, at[0], y + 1.0, at[1]), 'הסיד התקלקל', 0);
      X.line('המים הגיעו אל בור הסיד: הסיד רותח ומתקלקל', 3000);
      for (let i = 0; i < 10; i++) { X.dust(MIK.pit.x0 + 0.5 + (i % 4), y + 0.2, MIK.pit.z0 + 0.6 + (i % 3) * 1.2, 3, 1.6); await X.wait(0.18); }
      finish();
    }
    /** pasul: the plug back in, the bucket crew empties the basin to where it stood, a shower refills the hollow; the work starts again */
    async function pasul() {
      A.phase = 'pasul'; A.busy = true; A.dmg++; A.pasul++; ev('pasul');
      const v = vesselsOf(moved).find((q) => q.id === A.vPass);
      X.loss(20, V3(X, MIK.inlet[0], FL + 1, MIK.inlet[1]), 'המקווה פסול', 0);
      X.line('המים עברו דרך כלי: המקווה פסול. מרוקנים אותו בדליים', 3200);
      A.plugOut = 0; plugUp = 0; plugDraw(); fl.set(0, MIK.bottom + A.h); voices.pour(0, A.h / 3.3);
      A.drain = 1; A.drainAt = 0; A.leftIn = wNow();
      // two men with jars at the rim, dipping and pouring out behind them; the level drops on the rod a jar at a time
      const bk = [[MIK.x0 - 0.9, MIK.z0 + 0.8], [MIK.x0 - 0.9, MIK.z1 - 0.8]].map((p) => onFloor(SH5.crew.add(p[0], p[1], { role: 'hold', item: 'jar', fx: MIK.x0 + 1, fz: (MIK.z0 + MIK.z1) / 2, crew: 1 })));
      for (const w of bk) if (w) { crew.push(w); coneOwn(w); }
      shot(S_ROD(), 1.0);
      const from = A.h, to = A.h0, n = 8;
      for (let i = 1; i <= n; i++) {
        for (const [k, w] of bk.entries()) if (w) pose(w, (i + k) % 2 ? 0.6 : 1.7, (i + k) % 2 ? 0.75 : 0.1);
        X.play('splash'); await X.wait(0.55);
        A.h = lerp(from, to, i / n); if (BW()) { BW().set(A.h); BW().drop(MIK.x0 + 0.4, (MIK.z0 + MIK.z1) / 2, 0.6); }
        A.drainAt = Math.min(Cin[Cin.length - 1] || 0, (i / n) * (Cin[Cin.length - 1] || 0) * 1.05);
        if (i === 4) shot(S_ROD(), 1.0);
      }
      for (const w of bk) { SH5.crew.remove(w); const i = crew.indexOf(w); if (i >= 0) crew.splice(i, 1); }
      A.drain = 0; A.fd = 0; A.vPass = null; lab2.set('', null);
      // the shower: rain into the roofless chamber; the hollow fills again
      shot(S_IN(), 1.2); X.line('גשם יורד לתוך הלשכה: הגומה מתמלאת שוב', 2800);
      rn.set(1); voices.rain(1); for (let i = 0; i <= 40; i++) { await X.wait(0.08); hp.set(lerp(0.3, 1, i / 40)); }
      rn.set(0); voices.rain(0);
      A.phase = 'draw'; A.busy = false; A.stood = 0; recompute(true);
      X.line(lvP === 2 ? 'הזיזו את הכלי מהדרך, או גררו את החריץ מסביב לו' : 'גררו את החריץ שלא יעבור דרך כלי', 3200);
    }

    /* ── level 3's ring: the outlet cut where it is let go (within a finger of three amot: מהודר) ── */
    function ringSet() {
      const h = Math.round(A.ringH * 24) / 24; A.outlet = h; st.mik.outlet = h; ringDraw(); save(); ev('outlet ' + h.toFixed(3) + ' ' + outletOf(h));
      if (outletOf(h) === 'exact') { A.exact = 1; A.quick.exact = 1; X.quick(V3(X, MIK.rod[0], MIK.bottom + h + 0.3, MIK.rod[1]), 'שלוש אמות בדיוק!', ring); }
      chamberRedraw(X); BW() && BW().set(A.h);
      X.play('chisel'); X.dust(MIK.outlet[0], FL + 0.2, MIK.z1 + 0.1, 6, 1);
      A.phase = 'draw';
      setTimeout(() => { shot(S_ALL(), 1.1); X.line('גררו מהגומה אל המקווה, ואחר כך מפתח הגלישה אל פתח הלשכה', 3400); }, 700);
    }

    /* ── the end: the save, the grade ── */
    let finished = 0;
    function finish() {
      if (finished) return; finished = 1; A.phase = 'end'; A.busy = true;
      voices.pour(0, A.h / 3.3); fl.set(0, MIK.bottom + A.h); A.leftIn = wNow(); A.drain = 1; A.drainAt = A.fd * 0.2;
      const lvRec = st.mik[lvP] || (st.mik[lvP] = {});
      Object.assign(lvRec, { done: 1, fixes: A.mends, stops: A.stops, dmg: A.dmg, exact: A.exact, out: A.out, pasul: A.pasul, cracks: A.cracks, lime: A.lime });
      st.mik.water = +Math.max(st.mik.water || 0, A.h).toFixed(4);
      save();
      const pts = mikPts({ lv: lvP, stops: A.stops, dmg: A.dmg, exact: !!A.exact, out: !!A.out }), q = qOf(pts); A.pts = pts;
      if (lvP === 1 && !A.lime) X.line('אמה על אמה ברום שלש אמות. ושיערו חכמים מי מקוה ארבעים סאה (עירובין ד, ב)', 4200);
      else if (lvP === 3 && !A.exact && !A.lime) X.line(A.outlet < MIK.deep ? 'המים עומדים מתחת לשלוש אמות: ארבעים סאה יש כאן. כשר, לא מהודר' : 'כשר, לא מהודר', 3200);
      shot(S_ROD(), 1.4);
      setTimeout(() => { A.done = 1; X.end({ stars: starsOf(q), q, at: V3(X, MIK.rod[0], MIK.bottom + A.h, MIK.rod[1]), perfect: pts >= 40, lost: false }); }, 3200);
    }

    /* ── the frame ── */
    function frame(dt) {
      A.t += dt; voices.frame();
      if (!A.busy && ['draw', 'stop', 'run', 'over-stop'].includes(A.phase)) deepFrame(dt);
      if (A.phase === 'end' && A.drain) A.drainAt = Math.min(A.fd, A.drainAt + dt * 2.3);
      cutFrame(dt); pourFrame(dt);
      // the kohen: beside the finger while it draws (the line's far side), his charcoal down
      const fd = [...FG.L.values()].find((f) => f.what === 'draw');
      A.drawingK = !!fd;
      if (fd && kf && fd.pts.length) { const P = fd.pts, i = P.length - 1, q = P.length > 1 ? farSide(P, i, 0.8) : [P[0][0] + 0.8, P[0][1] - 0.6]; stepTo(kf, q[0], q[1], dt, 6.5, P[i][0], P[i][1]); pose(kf, 0.55, 0.7, null); }
      else if (kf && !A.pourTo && !A.pours.some((o) => o.t < 1.4) && kf.a.bow > 0.5) pose(kf, 0.1, 0, null);
      if (A.plugOut && plugUp < 1) { plugUp = Math.min(1, plugUp + dt * 2.2); plugDraw(); }
      if (A.phase === 'run' || A.phase === 'stop') runFrame(dt);
      else if (A.phase === 'fill') fillFrame(dt);
      else if (A.phase === 'over' || A.phase === 'over-stop') overFrame(dt);
      if (A.phase === 'draw' || A.phase === 'rod') voices.trickle(0);
      if (pud) { const want = A.phase === 'stop' || A.phase === 'over-stop' ? 0.62 : 0; A.pudR = lerp(A.pudR || 0, want, 1 - Math.exp(-dt * 1.2)); pud.set(A.pudR); if (A.pudR < 0.02 && !want) { live.remove(pud.mesh); pud = null; } }
      goldK = Math.max(0, goldK - dt * 1.6); gold.visible = (A.phase === 'run' || A.phase === 'over' || A.phase === 'spill'); const gs = 0.7 + goldK * 0.9; gold.scale.set(gs, gs, 1); gold.material.opacity = 0.35 + goldK * 0.65;
      waterSet(); fl.frame(); rn.frame();
      if (BW() && A.phase !== 'fill') BW().drop(MIK.inlet[0], MIK.z0 + 0.25, Math.max(0, (BW().mat.uniforms.uDrop.value.z || 0) - dt));
      for (const L of labs) L.frame();
    }

    return {
      close: true,
      begin() {
        X.kohen(false); coneKeep(X); FG.attach();
        try { A.ta = [document.documentElement.style.touchAction, document.body.style.touchAction]; document.documentElement.style.touchAction = 'none'; document.body.style.touchAction = 'none'; } catch (e) { /* */ }
        shot(lvP === 3 && A.outlet == null ? S_ROD() : S_ALL(), 1.2);
        X.line('והמצרע טבל בלשכת המצרעים (נגעים יד, ח)', 3400);
        setTimeout(() => {
          if (A.phase !== 'intro') return;
          A.busy = false;
          if (lvP === 3 && A.outlet == null) { A.phase = 'rod'; X.line('גררו את הטבעת על המוט: שם ייחצב פתח הגלישה', 0); X.hand(ring ? ring.position : null, 0, 10); return; }
          A.phase = 'draw'; if (lvP === 3) { A.exact = outletOf(A.outlet) === 'exact' ? 1 : 0; }
          if (lvP === 2) X.line('מים שעברו דרך כלי פוסלים את המקווה (מקוואות ד, א)', 3600);
          setTimeout(() => {
            if (A.phase !== 'draw') return;
            X.line(lvP === 1 ? 'גררו אצבע מהגומה אל המקווה. הקשה על הרצפה: הכהן שופך מעט מים' : lvP === 2 ? 'גררו מהגומה אל המקווה; הכלים נגררים הצידה' : 'גררו מהגומה אל המקווה, ואחר כך מפתח הגלישה אל פתח הלשכה', 0);
            if (H.hand) X.hand(V3(X, hol[0], floorY(hol[0], hol[1]) + 0.2, hol[1]), 0, 12);
          }, lvP === 2 ? 3700 : 200);
        }, 3000);
      },
      update(dt) { try { frame(dt); } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h120m] frame', e && e.message, (e && e.stack || '').split('\n').slice(0, 4).join(' / ')); } } },
      down(p) { FG.down(p); },
      move(p) { FG.move(p); },
      up(p) { FG.up(p); },
      cancel() { for (const f of FG.L.values()) { f.what = null; f.deep = 0; } charcoalDraw(null); },
      wants() { return !A.busy; },
      holds() { return [...FG.L.values()].some((f) => f.what === 'draw' || f.what === 'vessel' || f.what === 'ring' || f.deep); },
      end() {
        FG.detach(); voices.stop();
        try { if (A.ta) { document.documentElement.style.touchAction = A.ta[0]; document.body.style.touchAction = A.ta[1]; } } catch (e) { /* */ }
        for (const o of all) PR.remove(o);
        for (const w of crew) SH5.crew.remove(w); for (const l of labs) l.remove();
        X.hand(null); viewCone(X, null); SH5.busy = 0; SH5.mikLv = 0; own('__mik', 0); SH5.ambKey = ''; SH5.chKey = '';
        try { delete window.__H120M; } catch (e) { /* */ }
      },
      at() { return V3(X, (hol[0] + MIK.inlet[0]) / 2, FL + 1, (hol[1] + MIK.inlet[1]) / 2); },
      dbg() {
        // (the bot's eyes: world points on the screen; the depths the current channel still needs where the water would stand)
        window.__H120M = { scr: (x, z) => sp(x, z), floorAt };
        const need = (ch) => { if (!ch) return []; const c = { lv: lvP, kind: ch.kind, pts: ch.pts.map((p) => p.slice()) }; greedy(c); const out = []; c.pts.forEach((p, i) => { if (p[2] > ch.pts[i][2] + 0.04) out.push({ i, at: sp(p[0], p[1]), need: +p[2].toFixed(2), cur: +ch.pts[i][2].toFixed(2), x: +p[0].toFixed(2), z: +p[1].toFixed(2) }); }); return out; };
        const ref = (kind) => { const c = refChannel(lvP, kind); return c ? c.pts.map((p) => [...sp(p[0], p[1]), +p[2].toFixed(2)]) : null; };
        const r = A.res, o = A.ores;
        return { t: +A.t.toFixed(2), lvP, lv, phase: A.phase, busy: A.busy, mouse: MOUSE, plugOut: A.plugOut, cut: A.cutK ? +A.cutTo.toFixed(1) : null,
          plug: plugScr(), hollow: sp(hol[0], hol[1]), inlet: sp(MIK.inlet[0], MIK.inlet[1]), outletS: sp(MIK.outlet[0], MIK.outlet[1]), door: sp(DOOR[0], DOOR[1] + 0.3),
          ring: ring ? { at: ringScr(), up: (() => { const a = ringScr(), b = sc(X, { x: MIK.rod[0], y: MIK.bottom + ringH() + 1, z: MIK.rod[1] }); return a[1] - b[1]; })(), h: +ringH().toFixed(3), outlet: A.outlet } : null,
          refIn: ref('in'), refOver: lvP === 3 ? ref('over') : null,
          chIn: chIn ? chIn.pts.length : 0, chOv: chOv ? chOv.pts.length : 0, reaches: chIn ? reaches(chIn) : false, starts: chIn ? starts(chIn) : false,
          needIn: need(chIn), needOv: need(chOv),
          vessels: vesselsOf(moved).map((v) => ({ id: v.id, at: vesScr(v), w: [+v.at[0].toFixed(2), +v.at[1].toFixed(2)] })),
          res: r ? { ok: r.ok, stop: r.stop, vessel: r.vessel, at: r.at ? sp(r.at[0], r.at[1]) : null } : null, ores: o ? { ok: o.ok, stop: o.stop, pit: o.pit, at: o.at ? sp(o.at[0], o.at[1]) : null } : null,
          fd: +A.fd.toFixed(2), ofd: +A.ofd.toFixed(2), total: +(Cin[Cin.length - 1] || 0).toFixed(2), h: +A.h.toFixed(3), h0: A.h0, goal: A.goal, outlet: A.outlet,
          stops: A.stops, mends: A.mends, dmg: A.dmg, cracks: A.cracks, pasul: A.pasul, lime: A.lime, exact: A.exact, out: A.out, pts: A.pts || null, quick: A.quick, events: A.events.slice(-10), downs: A.downs, nf: FG.n, held: A.held,
          voices: voices.state, pours: A.pours.length, kohen: kf ? [+kf.a.x.toFixed(1), +kf.a.z.toFixed(1), +(kf.a.visT || 0).toFixed(1), sc(X, V3(X, kf.a.x, kf.a.y + 3.4, kf.a.z))] : null, grip: Math.round(grip()) };
      },
    };
  },
};
void ease; void floorH;
