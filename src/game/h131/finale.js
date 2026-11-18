/* ── build 131 ── h131/finale.js — part 4 of stage 08, "הסיום" (spec docs/specs/shlav-08-he.md, part 4: one work). THE
 * FRAME-AND-FINALE LANE'S FILE.
 * After the pour has set (all three sections and the crews' rest: BOOK.s08.yesod whole), the work in four beats:
 *   down   the frame men take the frame's boards down (it was the mould; its work is done)
 *   pull   the timbers out: two thumbs hold a timber's end at the south-east corner and pull (spec: "שני אגודלים אוחזים בקצה הקורה
 *          ומושכים"); by mouse one drag, and a crew man holds the other side. The south timber first, along its length east: the east
 *          one is held at the corner by it until it is out, then it comes south. A timber gives way late, with a deep sound of heavy
 *          wood and the screen's shake; the crew carries it to the pile. The strip along the south and the east stays empty, no yesod
 *          (רמב"ם בית הבחירה ב, י; the timbers as a body of wood: ב, טז; their length המחשה). The camera lifts a little by itself first
 *   white  the left hand wipes a cloth soaked in lime over the yesod (במפה, ולא בכף ברזל: מידות ג, ד; whitening during the building
 *          המחשה): the lime is where the cloth went (the material is the gauge); the patches of the pour stay a little grey
 *   water  the kohen tilts the jar onto the yesod: the water runs to the south-west corner and goes down the two holes (מידות ג, ב),
 *          heard going down; then the camera rises over the court: one white step, square, the empty strip along its south and east
 * No iron and no sound of iron anywhere: wood, stone, cloth, water. The rules: frame-model.js (FIN, finFresh, wipe, cover, pullable,
 * waterPath, finResult). Every place: BOOK.s08 (wood, reeds, yesod, stakes, work.lime / jar / water / logs, stand.south, cam.end).
 *   FINALE_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { LINES, QUICK } from './model.js';
import { FIN, finLoad, finSave, wipe, cover, whiteAll, pullable, waterPath, finResult, cellsOf, STAKE, SIDES } from './frame-model.js';
import { fmats, beamMesh, setBeam, frameHold, siteTidy } from './frame3d.js';
import { box } from './world.js';
import { inPatch } from './pourlv.js';
import { createVoices } from '../h129/sound129.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { createGang, createBeat, onPlane, clamp, ease, lerp } from '../h109/kit.js';
import { LOOK_RING_K } from '../world/look.js';

const S8 = BOOK.s08, W8 = S8.work, F = S8.floor, Y1 = S8.top, WD = S8.wood, MID = S8.mid;
/** the act's shots ([eye], [aim]; המחשה) and numbers: the grip's reach round a timber's end (px), how far the crew carries a timber
 *  out (amot), the cloth's lag (1/s), the jar's tilt per px, the water's spread */
export const NK = Object.freeze({
  DOWN: W8.cam.down, PULL: { S: W8.cam.pullS, E: W8.cam.pullE },
  WHITE: W8.cam.white, WOFF: W8.cam.whiteOff,
  WATER: W8.cam.water, RISE: W8.cam.rise,
  GRIP: 110, GRIPM: 60, OUT: 34, CLOTH: 6, TILT: 110, ON: 0.3,
  // (b131 look round) the lens; the pullers on the ropes (how many, the first one's distance from the timber's end, the gap between
  // them, amot); how far the pull's shot follows the timber out (amot)
  FOV: 52, PULLN: 3, ROPE0: 2.4, ROPEG: 1.7, FOLLOW: 4, SLIDE: 2.2,
});
/** the act's words (what to do: at most five words) */
export const NLINES = Object.freeze({
  down: 'הצוות מוריד את המסגרת',
  pull: 'שני אגודלים: שלפו את הקורה',
  pullM: 'גררו: שלפו את הקורה',
  two: 'בשני אגודלים יחד',
  held: 'הקורה הדרומית מחזיקה אותה',
  empty: 'כאן אין יסוד: הרצועה נשארת ריקה',
  white: 'העבירו את המפה על היסוד',
  cloth: 'מלבינים במפה, ולא בכף ברזל (מידות ג, ד)',
  crew: 'הצוות מלבין את השאר',
  water: 'הטו את הכד',
});
const TIMBER = Object.freeze({
  S: Object.freeze({ box: WD.S, dir: [1, 0] }),     // (along its length, east: out past the corner once the frame is down)
  E: Object.freeze({ box: WD.E, dir: [0, 1] }),     // (along its length, south: once the south timber is out of the corner)
});
const GRIP_AT = [WD.joint[0], WD.joint[1]];
const BUZZ = Object.freeze('40 30 75'.split(' ').map(Number));   // (a timber giving way: the device's buzz, ms)

export const FINALE_ACT = {
  icon: '💧',
  title: 'הסיום',
  walkLine: () => 'הסיום: שולפים, מלבינים ושופכים מים',
  stand() { const s = S8.stand.south; return { x: s[0], z: s[1], face: [s[0], s[1] - 4] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, Mo = X.M, V = createVoices(X.sfx), Mt = fmats(X);
    const root = new T.Group(); root.name = 'h131-finale-act'; X.props.root.add(root);
    const Fs = finLoad(Mo.workOf('finale')), resumed = !!Mo.workOf('finale');
    const A = { t: 0, ev: [], fl: null, busy: 0, step: Fs.step, pull: null, tw: [], one: 0, saidTwo: 0, hintK: '', lastCov: 0, done: 0, tilt: 0, front: 0, drain: 0, pourT: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    const keep = () => { Fs.step = A.step; Mo.keep('finale', finSave(Fs)); X.save(); };
    const cam0 = X.camera, fov0 = cam0.fov;
    const lens = (f) => { try { cam0.fov = f; cam0.updateProjectionMatrix(); } catch (e) { /* */ } };
    const shot = (S, d = 1.2) => { A.pose = [S[0].slice(), S[1].slice()]; X.shot(S[0].slice(), S[1].slice(), d); };
    // ── b131 (the owner's figure rule): a man is in the picture only when the step needs him, whole, working with his tool in hand;
    // never cut by the frame's edge, never between the eye and the work — otherwise he is out for the step. The act places its men by
    // the figures gate's own test (h128/figgate.js: his standing box, 3.9 amot by 1.1, at the act's shot and at the look's u 0.3
    // lens; the work's focus at()), held a little in from the edge, against the shot the act has set (A.pose) and, once the camera is
    // there, the camera itself (a follow shot's lag)
    const GC = new T.PerspectiveCamera(), GV = new T.Vector3(), GE = 0.94, GF = 0.17;
    const GU = (f) => (2 * Math.atan((1 + LOOK_RING_K.NEAR * Math.min(1, 0.3 / LOOK_RING_K.KEEP_U0)) * Math.tan((f * Math.PI) / 360)) * 180) / Math.PI;
    function gTest(x, y, z, s) {
      // (whole on the screen at this lens, and not over the work's focus nearer the eye than it)
      let x0 = 9, x1 = -9, y0 = 9, y1 = -9;
      for (const dy of [0, 3.9 * s]) for (const dx of [-0.55, 0.55]) for (const dz of [-0.55, 0.55]) {
        GV.set(x + dx * s, y + dy, z + dz * s).applyMatrix4(GC.matrixWorldInverse); if (GV.z > -0.05) return false;
        GV.applyMatrix4(GC.projectionMatrix); if (Math.abs(GV.x) > GE || Math.abs(GV.y) > GE) return false;
        x0 = Math.min(x0, GV.x); x1 = Math.max(x1, GV.x); y0 = Math.min(y0, GV.y); y1 = Math.max(y1, GV.y);
      }
      const d = Math.hypot(x - GC.position.x, y + 1.95 * s - GC.position.y, z - GC.position.z);
      GV.set(MID[0], Y1, MID[1]); const fd = GV.distanceTo(GC.position); GV.applyMatrix4(GC.matrixWorldInverse);
      if (GV.z < -0.05) { GV.applyMatrix4(GC.projectionMatrix); if (d < fd - 1 && x0 < GV.x + GF && x1 > GV.x - GF && y0 < GV.y + GF && y1 > GV.y - GF) return false; }
      return true;
    }
    function whole(x, y, z, s = 1) {
      const P = A.pose; if (!P) return true;
      const asp = cam0.aspect || 1.6, f0 = cam0.fov || NK.FOV;
      for (const f of [f0, GU(f0)]) { GC.position.set(P[0][0], P[0][1], P[0][2]); GC.up.set(0, 1, 0); GC.lookAt(P[1][0], P[1][1], P[1][2]); GC.fov = f; GC.aspect = asp; GC.updateProjectionMatrix(); GC.updateMatrixWorld(true); if (!gTest(x, y, z, s)) return false; }
      // (the camera itself, once it has come to the shot: a follow shot chases its aim)
      const c = cam0.position; if (Math.hypot(c.x - P[0][0], c.y - P[0][1], c.z - P[0][2]) < 4) { cam0.updateMatrixWorld(true); GC.position.copy(c); GC.quaternion.copy(cam0.quaternion); GC.fov = f0; GC.aspect = asp; GC.updateProjectionMatrix(); GC.updateMatrixWorld(true); if (!gTest(x, y, z, s)) return false; }
      return true;
    }
    /** the nearest place to (x, z) within r amot where a man stands whole in the shot (null: none) */
    function fitNear(x, z, y, r) {
      if (whole(x, y, z)) return [x, z];
      for (let rr = 0.5; rr <= r; rr += 0.5) { let best = null, bd = 1e9; for (let k = 0; k < 16; k++) { const an = (k * Math.PI) / 8, qx = x + Math.cos(an) * rr, qz = z + Math.sin(an) * rr; if (whole(qx, y, qz)) { const dd = Math.hypot(qx - x, qz - z); if (dd < bd) { bd = dd; best = [qx, qz]; } } } if (best) return best; }
      return null;
    }
    /** a man the step no longer has whole in its picture is out for the step (his rope with him) */
    function takeOut(w, why) { const i = crew.indexOf(w); if (i >= 0) crew.splice(i, 1); if (w.rope != null && ropes[w.rope]) ropes[w.rope].visible = false; gang.remove(w); A.outN = (A.outN || 0) + 1; ev('out:' + why); }
    function guard() {
      for (const w of crew.slice()) {
        if (!w.a || !w.a.alive || (w.cloth && A.step === 'white')) continue;   // (the man with the cloth is placed by whiteStep)
        const y = w.a.fixedY != null ? w.a.fixedY : F, s = (w.a.s || 1.1) / 1.1;
        let ok = whole(w.a.x, y, w.a.z, s);
        if (ok && w.rope != null && tim[w.tk]) { const p = puller(w.tk, w.rope, visS(tim[w.tk])); ok = whole(p[0], y, p[1], s); }
        if (!ok) takeOut(w, A.step);
      }
    }
    // (an ease from far cuts: eased from the walk's or an earlier work's place, the camera crossed the court's walls)
    const cutOr = (p, d) => { const c = cam0.position; return Math.hypot(c.x - p[0], c.y - p[1], c.z - p[2]) > 60 ? 0 : d; };
    /** the cloth's shot: close and low behind the man wiping, over the part of the yesod still grey nearest the cloth (taken when the
     *  hand is lifted, so the place under a still finger never runs) */
    function clothShot(d) {
      let bx = CL.x, bz = CL.z, bd = 1e9;
      for (let c = 0; c < CELLS.length; c++) if (CELLS[c] && !Fs.mask[c]) { const x = FIN.X0 + (c % FIN.NX) + 0.5, z = FIN.Z0 + Math.floor(c / FIN.NX) + 0.5, dd = Math.hypot(x - CL.x, z - CL.z); if (dd < bd) { bd = dd; bx = x; bz = z; } }
      // (the grey cell itself in the picture's middle: held in from the edge, the bottom rows fell under the instruction line for good)
      const ax = clamp(bx, FIN.X0 + 2, FIN.X0 + FIN.NX - 2), az = clamp(bz, FIN.Z0 + 2, FIN.Z0 + FIN.NZ - 2), O = NK.WOFF;
      const eye = [ax + O[0], Y1 + O[1], az + O[2]]; A.pose = [eye, [ax, Y1, az]]; X.shot(eye, [ax, Y1, az], cutOr(eye, d)); A.cshot = [ax, az];
      clothMan(true);   // (the man with the cloth set at once where the new picture has him whole, while the camera moves)
    }
    /** is there grey left near where the cloth's shot looks (else it moves on: also when a hand lifted off the yesod's edge) */
    /** the grey a finger can wipe in this picture: on the screen, clear of the top bar and of the instruction line — row by row
     *  (j: [screen points]); one test for the shot (move on when it is empty) and for the hint and the probes' player */
    function wipeable() {
      const W = innerWidth, H = innerHeight, rows = new Map();
      for (let c = 0; c < CELLS.length; c++) {
        if (!CELLS[c] || Fs.mask[c]) continue; const i = c % FIN.NX, j = Math.floor(c / FIN.NX);
        const q = X.scr(FIN.X0 + i + 0.5, Y1, FIN.Z0 + j + 0.5);
        if (q.on !== false && q.x > 40 && q.x < W - 40 && q.y > 120 && q.y < H - 100) { if (!rows.has(j)) rows.set(j, []); rows.get(j).push([Math.round(q.x), Math.round(q.y)]); }
      }
      return rows;
    }
    const greyNear = () => wipeable().size > 0;
    // ── b131 look round 2 (F7): the rows of the court's rings north of the altar — black marks behind every finale picture — hidden
    // while the finale runs (small low meshes in the book's box, not the act's own or a figure's); back when it ends
    const ringHid = [];
    function ringsShow(on) {
      if (on) { for (const o of ringHid) o.visible = true; ringHid.length = 0; return; }
      let top = X.props.root; while (top.parent) top = top.parent;
      const bs = new T.Sphere(), Z = W8.cam.rings;
      top.traverse((o) => {
        if (!o.isMesh || !o.visible || o.isInstancedMesh || !o.geometry || ringHid.includes(o)) return;
        for (let q = o; q; q = q.parent) if (q === X.props.root || /^actor/.test(q.name || '')) return;
        if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere(); if (!o.geometry.boundingSphere) return;
        bs.copy(o.geometry.boundingSphere).applyMatrix4(o.matrixWorld); const c = bs.center;
        if (bs.radius < 1.4 && c.x > Z[0] && c.x < Z[2] && c.z > Z[1] && c.z < Z[3] && c.y < F + 1.2 && c.y > F - 0.6) { o.visible = false; ringHid.push(o); }
      });
    }
    const visS = (Tm) => (Tm.free ? Tm.s : Tm.s * NK.SLIDE);
    /** the pull's shot follows the timber out (from the side, behind its pullers) */
    function pullCam(k) {
      const C = NK.PULL[k], D = TIMBER[k], s = Math.min(NK.FOLLOW, visS(tim[k])) * 0.6, o = [D.dir[0] * s, 0, D.dir[1] * s];
      const e = C[0].map((v, i) => v + o[i]), t = C[1].map((v, i) => v + o[i]); A.pose = [e, t]; X.track(e, t);
    }
    const B = createBeat(X), gang = createGang(X);
    // ── the world's own timbers (world.js, or the pour lane's) hidden while this act draws its own, which come out
    const hid = [];
    function hideWorld() {
      const near = (m, b) => { const p = m.getWorldPosition(new T.Vector3()); return Math.abs(p.x - (b[0] + b[2]) / 2) < 0.3 && Math.abs(p.z - (b[1] + b[3]) / 2) < 0.3 && p.y > F - 0.1 && p.y < Y1 + 0.2; };
      X.props.root.traverse((o) => {
        if (!o.isMesh || !o.visible || o === root || hid.includes(o)) return;
        for (let q = o; q; q = q.parent) if (q === root) return;
        const s = o.scale; if (!(s.x > 0.5 && s.z > 0.5)) return;
        if ((near(o, WD.S) && Math.abs(s.x - (WD.S[2] - WD.S[0])) < 1.2) || (near(o, WD.E) && Math.abs(s.z - (WD.E[3] - WD.E[1])) < 1.2)) { o.visible = false; hid.push(o); }
      });
    }
    // ── the frame's boards (only while the crew takes them down), the timbers, the lime trough, the cloth, the jar, the white, the water
    const boards = Object.entries(SIDES).map(([s, [a, b]]) => { const mb = beamMesh(X, Mt.y8frame, root); setBeam(mb, STAKE[a], STAKE[b], MID); return { s, mb, a: STAKE[a], b: STAKE[b] }; });
    const cracked = new Set(Mo.marksOf('frame.crack').map((q) => ['N', 'E', 'S', 'W'][(q.n | 0) % 4]));
    for (const b of boards) if (cracked.has(b.s)) b.mb.material = Mt.y8woodR;
    const tim = {};
    for (const [k, D] of Object.entries(TIMBER)) { const b = D.box, g = new T.Group(); root.add(g); box(X, Mt.y8woodD, b[0], F, b[1], b[2], Y1, b[3], g); tim[k] = { g, s: 0, sT: 0, free: 0, gone: 0 }; }
    const trough = new T.Group(); root.add(trough);
    { const [x, z] = W8.lime; box(X, Mt.y8wood, x - 1.1, F, z - 0.55, x + 1.1, F + 0.5, z + 0.55, trough); box(X, Mt.y8lime, x - 0.95, F + 0.5, z - 0.4, x + 0.95, F + 0.52, z + 0.4, trough); }
    const cloth = new T.Mesh(new T.BoxGeometry(1.3, 0.12, 0.9, 3, 1, 2), Mt.y8cloth); cloth.castShadow = true; root.add(cloth);
    { const p = cloth.geometry.attributes.position; for (let i = 0; i < p.count; i++) p.setY(i, p.getY(i) + Math.sin(p.getX(i) * 5) * 0.04); p.needsUpdate = true; cloth.geometry.computeVertexNormals(); }
    cloth.position.set(W8.lime[0], F + 0.6, W8.lime[1]);
    const CL = { x: W8.lime[0], z: W8.lime[1], tx: W8.lime[0], tz: W8.lime[1] };
    // the jar (a modelled clay jar: a lathe), on the floor by the strip until the kohen lifts it
    const jar = new T.Group(); root.add(jar);
    { const pts = [[0, 0], [0.32, 0.02], [0.46, 0.35], [0.5, 0.7], [0.42, 1.05], [0.2, 1.25], [0.17, 1.45], [0.24, 1.52]].map(([r, y]) => new T.Vector2(r, y));
      const body = new T.Mesh(new T.LatheGeometry(pts, 14), Mt.y8clay); body.castShadow = true; jar.add(body);
      for (const s of [-1, 1]) { const h = new T.Mesh(new T.TorusGeometry(0.17, 0.045, 5, 10, Math.PI), Mt.y8clay); h.position.set(s * 0.33, 1.15, 0); h.rotation.z = s * -Math.PI / 2; jar.add(h); } }
    jar.position.set(W8.jar[0], F, W8.jar[1]);
    // the white on the yesod: a canvas over the poured place, a cell an amah (the patches a little grey)
    const CPX = 8, cv = document.createElement('canvas'); cv.width = FIN.NX * CPX; cv.height = FIN.NZ * CPX;
    const cx = cv.getContext('2d'), tex = new T.CanvasTexture(cv); try { tex.colorSpace = T.SRGBColorSpace; } catch (e) { /* */ }
    const whiteM = new T.MeshStandardMaterial({ map: tex, transparent: true, roughness: 0.95, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 });
    const white = new T.Mesh(new T.PlaneGeometry(FIN.NX, FIN.NZ), whiteM); white.rotation.x = -Math.PI / 2; white.position.set(FIN.X0 + FIN.NX / 2, Y1 + 0.025, FIN.Z0 + FIN.NZ / 2); white.renderOrder = 4; root.add(white);
    const CELLS = cellsOf(), patch = new Set();
    // (the pour's patch: the same ragged outline the world draws after the finale, pourlv.js inPatch; a cell whose middle is in it)
    for (const q of Mo.marksOf('pour.hollow')) if (Array.isArray(q.at)) { const i0 = Math.floor(q.at[0] - FIN.X0), j0 = Math.floor(q.at[1] - FIN.Z0); for (let j = j0 - 3; j <= j0 + 3; j++) for (let i = i0 - 3; i <= i0 + 3; i++) if (i >= 0 && i < FIN.NX && j >= 0 && j < FIN.NZ && inPatch(FIN.X0 + i + 0.5, FIN.Z0 + j + 0.5, q.at[0], q.at[1], q.n)) patch.add(j * FIN.NX + i); }
    const shade = (c) => { const h = ((c * 2654435761) >>> 0) % 17; return patch.has(c) ? `rgb(${222 + h % 6},${214 + h % 5},${196 + h % 7})` : `rgb(${246 + h % 9},${244 + h % 8},${236 + h % 9})`; };
    function paint(all) {
      if (all) cx.clearRect(0, 0, cv.width, cv.height);
      for (let c = 0; c < CELLS.length; c++) if (CELLS[c] && Fs.mask[c] && (all || !A.painted[c])) { A.painted[c] = 1; const i = c % FIN.NX, j = Math.floor(c / FIN.NX); cx.fillStyle = shade(c); cx.fillRect(i * CPX, j * CPX, CPX, CPX); }
      tex.needsUpdate = true;
    }
    A.painted = new Uint8Array(CELLS.length);
    // the water on the yesod: a canvas of its own, the way it runs (waterPath)
    const wv = document.createElement('canvas'); wv.width = cv.width; wv.height = cv.height; const wx = wv.getContext('2d'), wtex = new T.CanvasTexture(wv);
    const waterM = new T.MeshStandardMaterial({ map: wtex, transparent: true, roughness: 0.05, metalness: 0.15, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 });
    const water = new T.Mesh(new T.PlaneGeometry(FIN.NX, FIN.NZ), waterM); water.rotation.x = -Math.PI / 2; water.position.set(white.position.x, Y1 + 0.04, white.position.z); water.renderOrder = 5; root.add(water);
    const WP = waterPath(), segL = WP.slice(1).map((p, i) => Math.hypot(p[0] - WP[i][0], p[1] - WP[i][1])), WL = segL.reduce((a, b) => a + b, 0);
    const toC = (x, z) => [(x - FIN.X0) * CPX, (z - FIN.Z0) * CPX];
    function drawWater() {
      wx.clearRect(0, 0, wv.width, wv.height);
      if (A.front <= 0 && !A.drain) { wtex.needsUpdate = true; return; }
      const fade = A.drain ? Math.max(0, 1 - A.drain) : 1;
      wx.lineCap = 'round'; wx.lineJoin = 'round';
      for (const [w, a] of [[3.2, 0.35], [2.0, 0.55], [1.1, 0.8]]) {
        wx.strokeStyle = `rgba(150,190,220,${a * fade})`; wx.lineWidth = w * CPX; wx.beginPath();
        let left = A.front; const p0 = toC(...WP[0]); wx.moveTo(p0[0], p0[1]);
        for (let i = 1; i < WP.length && left > 0; i++) { const u = Math.min(1, left / segL[i - 1]); const q = [lerp(WP[i - 1][0], WP[i][0], u), lerp(WP[i - 1][1], WP[i][1], u)]; const c = toC(q[0], q[1]); wx.lineTo(c[0], c[1]); left -= segL[i - 1]; }
        wx.stroke();
      }
      // the pool where it is poured, and the swirl round the two holes as it goes down
      const p0 = toC(...WP[0]); wx.fillStyle = `rgba(150,190,220,${0.5 * fade})`; wx.beginPath(); wx.arc(p0[0], p0[1], 2.4 * CPX * Math.min(1, Fs.water * 3), 0, 7); wx.fill();
      if (A.front >= WL) for (const r of S8.reeds) { const c = toC(r[0], r[1] - 0.3); for (let k = 0; k < 3; k++) { const rr = ((A.t * 1.5 + k / 3) % 1) * 1.1 * CPX; wx.strokeStyle = `rgba(90,130,170,${0.7 * fade * (1 - rr / (1.1 * CPX))})`; wx.lineWidth = 1.5; wx.beginPath(); wx.arc(c[0], c[1], rr, 0, 7); wx.stroke(); } wx.fillStyle = `rgba(40,60,80,${0.8})`; wx.beginPath(); wx.arc(c[0], c[1], 0.22 * CPX, 0, 7); wx.fill(); }
      wtex.needsUpdate = true;
    }
    // the stream from the jar's mouth to the yesod
    // (b131 look round 2: a stream to be seen — thick, light, a little lit)
    const streamM = new T.MeshStandardMaterial({ color: '#9CCBEA', emissive: '#2E5A78', emissiveIntensity: 0.35, roughness: 0.1, transparent: true, opacity: 0.92 });
    const stream = new T.Mesh(new T.CylinderGeometry(0.2, 0.32, 1, 10, 1, true), streamM); stream.visible = false; root.add(stream);
    // ── the figures: the frame men (down), the pullers at the timber's end and the man at its other side (mouse), the man with the
    // cloth, the kohen with the jar
    const crew = [];
    function show(step) {
      gang.clear(); crew.length = 0;
      try { X.kohen(step === 'down' || step === 'water' || step === 'rise'); } catch (e) { /* */ }
      if (step === 'down') { try { const s = S8.stand.south; X.hero.setPos(s[0], s[1], Math.PI); } catch (e) { /* (the kohen at the opening's left, watching the frame come down) */ } }
      // (two lever men a board, 9 amot either side of its middle — or nearer it, where the shot has him whole; none where it has not)
      if (step === 'down') { A.pose = [NK.DOWN[0].slice(), NK.DOWN[1].slice()]; for (const bd of boards) { const mx = (bd.a[0] + bd.b[0]) / 2, mz = (bd.a[1] + bd.b[1]) / 2, dx = mx - MID[0], dz = mz - MID[1], L = Math.hypot(dx, dz); for (const e of [-1, 1]) { const ux = (bd.b[0] - bd.a[0]) / 32, uz = (bd.b[1] - bd.a[1]) / 32; for (let g = 9; g >= 3; g -= 1) { const x = mx + ux * e * g + (dx / L) * 1.4, z = mz + uz * e * g + (dz / L) * 1.4; if (!whole(x, F, z)) continue; const w = gang.add(x, z, { role: 'lever', fx: mx + ux * e * g, fz: mz + uz * e * g, crew: crew.length }); if (w) { w.a.vis = 1; crew.push(w); } break; } } } }
      if (step === 'pull') {
        // (rule 2: the crew pulls the timber on ropes from its end, in a line along its length, leaning back as the hands pull)
        const k = pullable(Fs, 'S') ? 'S' : 'E', D = TIMBER[k], b = D.box, end = k === 'S' ? [b[2], (b[1] + b[3]) / 2] : [(b[0] + b[2]) / 2, b[3]];
        A.pose = [NK.PULL[k][0].slice(), NK.PULL[k][1].slice()];
        for (let e = 0; e < NK.PULLN; e++) { const p = puller(k, e, 0); if (!whole(p[0], F, p[1])) continue; const w = gang.add(p[0], p[1], { role: 'hold', fx: end[0], fz: end[1], crew: e }); if (w) { w.a.vis = 1; w.rope = e; w.tk = k; crew.push(w); } }
        if (MOUSE) { const f0 = k === 'S' ? [b[0] - 1.6, (b[1] + b[3]) / 2 + 1.2] : [(b[0] + b[2]) / 2 + 1.4, b[1] + 1.6], far = fitNear(f0[0], f0[1], F, 2.5); if (far) { const w = gang.add(far[0], far[1], { role: 'brace', fx: k === 'S' ? b[0] : (b[0] + b[2]) / 2, fz: k === 'S' ? (b[1] + b[3]) / 2 : b[1], crew: 2 }); if (w) { w.a.vis = 1; w.far = 1; crew.push(w); } } }
      }
      if (step === 'white') { const w = gang.add(CL.x + 0.5, CL.z - 1.3, { role: 'kneel', fx: CL.x, fz: CL.z, crew: 1 }); if (w) { w.a.vis = 1; w.cloth = 1; w.a.fixedY = Y1; crew.push(w); } }
      // (the kohen behind the jar he lifts, at the picture's right; the water's run to the corner's two holes is the subject)
      if (step === 'water') { try { const kx = W8.jar[0] + 0.2, kz = W8.jar[1] + 1.2; X.hero.setPos(kx, kz, Math.atan2(W8.jar[0] - kx, W8.jar[1] - 0.3 - kz)); } catch (e) { /* */ } }
      ropes.forEach((r, i) => { r.visible = step === 'pull' && crew.some((w) => w.rope === i); });
    }
    /** a puller's place: on the timber's line beyond its end (the end as it comes out by s), a little to either side by turns */
    function puller(k, e, s) {
      const D = TIMBER[k], b = D.box, end = k === 'S' ? [b[2], (b[1] + b[3]) / 2] : [(b[0] + b[2]) / 2, b[3]], d = NK.ROPE0 + e * NK.ROPEG + s, o = e % 2 ? 0.45 : -0.45;
      return [end[0] + D.dir[0] * d + D.dir[1] * o, end[1] + D.dir[1] * d + D.dir[0] * o, end[0] + D.dir[0] * s, end[1] + D.dir[1] * s];
    }
    // the ropes: from each puller's hands to the timber's end
    const ropeM = new T.MeshStandardMaterial({ color: '#7A5A32', roughness: 0.95 });
    const ropes = []; for (let i = 0; i < NK.PULLN; i++) { const r = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 1, 6), ropeM); r.visible = false; root.add(r); ropes.push(r); }
    const UPV = new T.Vector3(0, 1, 0), RV = new T.Vector3(), RA = new T.Vector3(), RB = new T.Vector3();
    function ropeStep(dt) {
      for (const w of crew) {
        if (w.rope == null || !w.a) continue; const r = ropes[w.rope], Tm = tim[w.tk]; if (!r || !Tm) continue;
        const p = puller(w.tk, w.rope, visS(Tm)), kk = 1 - Math.exp(-dt * 6);
        const was = Math.hypot(p[0] - w.a.x, p[1] - w.a.z); w.a.x += (p[0] - w.a.x) * kk; w.a.z += (p[1] - w.a.z) * kk; w.fx = p[2]; w.fz = p[3];
        w.stride = was > 0.08 ? 1 : 0;
        RA.set(w.a.x, F + 1.25, w.a.z); RB.set(p[2], Y1 - 0.45, p[3]);
        RV.copy(RB).sub(RA); const L = RV.length(); r.position.copy(RA).add(RB).multiplyScalar(0.5); r.scale.set(1, L, 1); r.quaternion.setFromUnitVectors(UPV, RV.normalize()); r.visible = !Tm.gone;
      }
    }
    // the reed holes at the south-west corner (seen dark where the water goes down)
    const holeM = new T.MeshBasicMaterial({ color: '#1E2328' });
    const holes = S8.reeds.map((q) => { const h = new T.Mesh(new T.CircleGeometry(0.26, 14), holeM); h.rotation.x = -Math.PI / 2; h.position.set(q[0], Y1 + 0.05, q[1] - 0.3); h.renderOrder = 6; h.visible = false; root.add(h); return h; });
    // ── the steps
    async function down() {
      A.busy = 1; show('down'); X.line(NLINES.down, 2600); shot(NK.DOWN, cutOr(NK.DOWN[0], 1.1));
      await X.wait(0.9);
      V.knock(0.8); X.dust(MID[0], F + 0.5, MID[1] - 16, 8, 3);
      A.tw.push({ t: 0, d: 1.6, f: (u) => { for (const bd of boards) { const o = ease(u); bd.mb.position.y = F + 0.5 + o * 1.3; bd.mb.visible = u < 0.98; } } });
      await X.wait(1.8);
      for (const bd of boards) bd.mb.visible = false;
      frameHold('finale', true);
      A.step = 'pull'; keep(); A.busy = 0; startPull();
    }
    function startPull() {
      show('pull'); const S0 = NK.PULL[pullable(Fs, 'S') ? 'S' : 'E']; shot(S0, cutOr(S0[0], 1.0));
      X.line(MOUSE ? NLINES.pullM : NLINES.pull, 4200); hintNext(true);
    }
    function startWhite() {
      try { if (X.lookLift) X.lookLift(0); } catch (e) { /* */ }
      show('white'); clothShot(1.3);
      // (the man kneels on the yesod with the cloth in his hands, at the grey nearest the lime: whole in the picture, not cut at its foot)
      if (A.cshot && !A.wiped) { CL.x = CL.tx = A.cshot[0]; CL.z = CL.tz = A.cshot[1]; A.wiped = 1; }
      clothMan(true); X.line(NLINES.cloth, 5200); X.wait(5.4).then(() => { if (A.step === 'white' && cover(Fs) < 0.1) X.line(NLINES.white, 4000); }); hintNext(true);
    }
    function startWater() { show('water'); for (const h of holes) h.visible = true; shot(NK.WATER, cutOr(NK.WATER[0], 1.3)); X.line(NLINES.water, 4000); hintNext(true); }
    // ── the pull: grip, pull, give way, the crew carries it out
    const pxAmah = (k) => { const D = TIMBER[k], a = X.scr(GRIP_AT[0], Y1, GRIP_AT[1]), b = X.scr(GRIP_AT[0] + D.dir[0] * 4, Y1, GRIP_AT[1] + D.dir[1] * 4); const vx = (b.x - a.x) / 4, vy = (b.y - a.y) / 4, L = Math.hypot(vx, vy) || 1; return { ux: vx / L, uy: vy / L, ppa: L }; };
    function pullKey(dx, dy) {
      // the drag's way decides which timber the hands pull: along the south one (east) or along the east one (south)
      const s = pxAmah('S'), e = pxAmah('E'), as = dx * s.ux + dy * s.uy, ae = dx * e.ux + dy * e.uy;
      return as >= ae ? 'S' : 'E';
    }
    function pullStep(dt) {
      const P = A.pull, fs = [...FG.L.values()].filter((f) => f.w && f.w.k === 'grip');
      const two = MOUSE || fs.length >= 2 || (fs.length && fs[0].type === 'mouse');
      if (P && fs.length) {
        const dx = fs.reduce((a, f) => a + f.x - f.x0, 0) / fs.length, dy = fs.reduce((a, f) => a + f.y - f.y0, 0) / fs.length;
        if (!P.k && Math.hypot(dx, dy) > 14) P.k = pullKey(dx, dy);
        if (P.k) {
          const g = pxAmah(P.k), along = Math.max(0, (dx * g.ux + dy * g.uy) / g.ppa), Tm = tim[P.k];
          if (!pullable(Fs, P.k)) { if (!P.said) { P.said = 1; X.line(NLINES.held, 3000); V.groan(); ev('held:' + P.k); } Tm.sT = Math.min(0.08, along * 0.02); V.creak(0.5); }
          else if (!two) { Tm.sT = Math.min(0.06, along * 0.02); V.creak(0.4); A.one += dt; if (A.one > 0.5 && !A.saidTwo) { A.saidTwo = 1; X.line(NLINES.two, 3000); ev('one'); } }
          else if (!Tm.free) { Tm.sT = Math.min(FIN.FREE, along * FIN.PULLK); V.creak(Math.min(1, Tm.sT / FIN.FREE)); if (along * FIN.PULLK >= FIN.FREE) giveWay(P.k); }
          else Tm.sT = Math.max(Tm.sT, FIN.FREE + (along - FIN.FREE / FIN.PULLK));
        }
      }
      for (const [k, Tm] of Object.entries(tim)) {
        if (Tm.gone) continue;
        if (!fs.length && !Tm.free) Tm.sT = 0;
        Tm.s += (Tm.sT - Tm.s) * (1 - Math.exp(-dt * (Tm.free ? 3 : 2.2)));
        // (b131 look round 2: before it gives way the timber is seen sliding — drawn at twice the model's give, its pullers with it)
        const D = TIMBER[k], vs = visS(Tm); Tm.g.position.set(D.dir[0] * vs, 0, D.dir[1] * vs);
        if (!Tm.free && Tm.s > 0.01) Tm.g.position.x += Math.sin(A.t * 45) * 0.02 * Math.min(1, Tm.s * 10);
      }
      // the pullers lean back while the hands pull
      for (const w of crew) if (!w.far) { const want = fs.length || A.busy ? 'pull' : 'hold'; if (w.role !== want) gang.setRole(w, want, { fx: w.fx, fz: w.fz }); }
      ropeStep(dt);
      for (const k of ['S', 'E']) if (!tim[k].gone && tim[k].s > 0.05) { pullCam(k); break; }
    }
    async function giveWay(k) {
      const Tm = tim[k]; Tm.s = Tm.sT = Tm.s * NK.SLIDE; Tm.free = 1; Fs.n++;
      V.thud(); V.groan(); X.shake(0.28, 0.42); try { if (X.haptic) X.haptic(BUZZ); } catch (e) { /* */ }
      const at = { x: GRIP_AT[0], y: Y1 + 0.5, z: GRIP_AT[1] }; X.dust(at.x, F + 0.6, at.z, 14, 3);
      X.quick(at, 'יוצאת!', Tm.g.children[0]); ev('free:' + k);
      // the crew takes it the rest of the way, then to the pile
      await X.wait(0.9);
      A.busy = 1;
      const s0 = Tm.s;
      await new Promise((res) => A.tw.push({ t: 0, d: 2.4, f: (u) => { Tm.sT = Tm.s = lerp(s0, NK.OUT, ease(u)); const D = TIMBER[k]; Tm.g.position.set(D.dir[0] * Tm.s, 0, D.dir[1] * Tm.s); for (const w of crew) if (!w.far && w.role !== 'pull') gang.setRole(w, 'pull', { rate: 1.4 }); }, res }));
      V.knock(1.2); Tm.gone = 1;
      await new Promise((res) => { const p0 = Tm.g.position.clone(), b = TIMBER[k].box, c0 = [(b[0] + b[2]) / 2 + p0.x, (b[1] + b[3]) / 2 + p0.z], to = k === 'E' ? [W8.logs[0] + 8, W8.logs[1] - 17] : [W8.logs[0], W8.logs[1]]; A.tw.push({ t: 0, d: 1.3, f: (u) => { const e = ease(u); Tm.g.position.set(p0.x + (to[0] - c0[0]) * e, Math.sin(u * Math.PI) * 0.8, p0.z + (to[1] - c0[1]) * e); }, res }); });
      Tm.g.visible = false;   // (the crew carries it off to the pile, out of the picture)
      Fs.out[k] = 1; keep(); A.busy = 0; A.pull = null;
      if (Fs.out.S && Fs.out.E) {
        X.line(NLINES.empty, 4200); X.quick({ x: -24, y: Y1, z: 10 }, 'ריקה!', null);
        await X.wait(2.6);
        A.step = 'white'; keep(); startWhite();
      } else startPull();
    }
    // ── the fingers
    function gripHit(f) { const g = X.scr(GRIP_AT[0], Y1, GRIP_AT[1]); return Math.hypot(f.x - g.x, f.y - g.y) < (MOUSE ? NK.GRIPM : NK.GRIP); }
    function jarHit(f) { const j = X.scr(jar.position.x, jar.position.y + 0.8, jar.position.z); return Math.hypot(f.x - j.x, f.y - j.y) < (MOUSE ? 50 : 80); }
    function onYesod(f) { const p = onPlane(X, f.x, f.y, Y1); if (!p) return null; return p.x > FIN.X0 - 2 && p.x < FIN.X0 + FIN.NX + 2 && p.z > FIN.Z0 - 2 && p.z < FIN.Z0 + FIN.NZ + 2 ? p : null; }
    function pick(f) {
      if (A.busy || A.done) return null;
      if (A.step === 'pull' && gripHit(f)) return { k: 'grip' };
      if (A.step === 'white' && onYesod(f)) return { k: 'cloth' };
      if (A.step === 'water' && jarHit(f)) return { k: 'jar' };
      return null;
    }
    const FG = fingers(X, {
      down(f) {
        const k = pick(f); if (!k) { try { if (X.lookHome && FG.n <= 1) X.lookHome(); } catch (e) { /* */ } return; }
        f.w = k; X.hand(null);
        if (k.k === 'grip') { if (!A.pull) A.pull = { k: null }; ev('grip:' + FG.n); }
        if (k.k === 'cloth') { const p = onYesod(f); CL.tx = p.x; CL.tz = p.z; if (A.fl == null) { CL.x = p.x; CL.z = p.z; } A.fl = f.id; V.cloak(); }
        if (k.k === 'jar') { A.fl = f.id; }
      },
      move(f) {
        const w = f.w; if (!w) return;
        if (w.k === 'cloth' && A.fl === f.id) { const p = onPlane(X, f.x, f.y, Y1); if (p) { CL.tx = clamp(p.x, FIN.X0 + 0.4, FIN.X0 + FIN.NX - 0.4); CL.tz = clamp(p.z, FIN.Z0 + 0.4, FIN.Z0 + FIN.NZ - 0.4); } }
        if (w.k === 'jar' && A.fl === f.id) A.tiltT = clamp((f.y0 - f.y) / NK.TILT, 0, 1);
      },
      up(f) {
        const w = f.w; if (!w) return;
        if (w.k === 'cloth' && A.fl === f.id) { A.fl = null; V.scrape(0); keep(); if (!A.whiteDone) clothShot(0.9); }
        if (w.k === 'jar' && A.fl === f.id) { A.fl = null; A.tiltT = 0; keep(); }
        if (w.k === 'grip' && ![...FG.L.values()].some((q) => q.w && q.w.k === 'grip')) { if (A.pull && !A.busy) A.pull = null; V.creak(0); A.one = 0; }
      },
    });
    A.tiltT = 0;
    // ── the cloth: it follows the hand late; the kneeling man moves with it; the cells it reaches turn white
    function whiteStep(dt) {
      const k = 1 - Math.exp(-dt * NK.CLOTH), px = CL.x, pz = CL.z;
      if (A.fl != null) { CL.x += (CL.tx - CL.x) * k; CL.z += (CL.tz - CL.z) * k; }
      // (the cloth stays where the man last wiped; before the first wipe it lies on the lime trough)
      if (A.fl != null) A.wiped = 1;
      if (A.wiped) cloth.position.set(CL.x, Y1 + 0.08, CL.z); else cloth.position.set(W8.lime[0], F + 0.6, W8.lime[1]);
      const v = Math.hypot(CL.x - px, CL.z - pz) / Math.max(1e-3, dt);
      if (A.fl != null) {
        V.scrape(Math.min(0.7, v / 10));
        const n = wipe(Fs, CL.x, CL.z); if (n) { paint(false); }
        const c = cover(Fs);
        if (Math.floor(c * 4) > Math.floor(A.lastCov * 4) && c < FIN.WHITE) { X.quick({ x: CL.x, y: Y1 + 0.5, z: CL.z }, Math.round(c * 100) + '%', null); }
        A.lastCov = c;
        if (c >= FIN.WHITE && !A.whiteDone) whiteDone();
      }
      clothMan(false, dt);
    }
    /** the man with the cloth kneels by it: at the cloth's place, or the nearest place the picture has him whole (within 4 amot); he
     *  never walks through a place where it has not (he is set there at once), and is out for the step where there is none */
    function clothMan(now, dt = 0) {
      const w = crew.find((q) => q.cloth); if (!w || !w.a || !w.a.alive) return;
      const tx0 = A.wiped ? CL.x + 0.5 : W8.lime[0] + 0.5, tz0 = A.wiped ? CL.z - 1.3 : W8.lime[1] - 1.3;
      const to = fitNear(tx0, tz0, Y1, 4); if (!to) { takeOut(w, 'cloth'); return; }
      const [tx, tz] = to, d = Math.hypot(w.a.x - tx, w.a.z - tz);
      if (now) { w.a.x = tx; w.a.z = tz; }
      else if (d > 0.05) { const kk = 1 - Math.exp(-dt * 3), nx = w.a.x + (tx - w.a.x) * kk, nz = w.a.z + (tz - w.a.z) * kk; if (whole(nx, Y1, nz)) { w.a.x = nx; w.a.z = nz; } else { w.a.x = tx; w.a.z = tz; } }
      w.a.yaw = Math.atan2(CL.x - w.a.x, CL.z - w.a.z);
    }
    async function whiteDone() {
      A.whiteDone = 1; A.busy = 1; A.fl = null; V.scrape(0);
      X.line(NLINES.crew, 2600); shot(NK.WHITE, 1.1);
      // the crew wipes the last of it, in rows from the north
      const left = []; for (let c = 0; c < CELLS.length; c++) if (CELLS[c] && !Fs.mask[c]) left.push(c);
      // (rule 5: the crew man is seen doing it — the cloth's place, which he follows, goes along each row as it whitens)
      for (let i = 0; i < left.length; i += Math.max(1, Math.ceil(left.length / 12))) {
        let sx = 0, sz = 0, n = 0; for (let j = i; j < Math.min(left.length, i + Math.ceil(left.length / 12)); j++) { Fs.mask[left[j]] = 1; sx += FIN.X0 + (left[j] % FIN.NX) + 0.5; sz += FIN.Z0 + Math.floor(left[j] / FIN.NX) + 0.5; n++; }
        if (n) { CL.x = CL.tx = sx / n; CL.z = CL.tz = sz / n; }
        clothMan(true); paint(false); V.cloak(); await X.wait(0.35);
      }
      whiteAll(Fs); paint(false);
      X.quick({ x: MID[0], y: Y1 + 1, z: MID[1] }, QUICK.white, white); X.shake(0.12, 0.2); try { if (X.haptic) X.haptic(20); } catch (e) { /* */ }
      cloth.position.set(W8.lime[0], F + 0.6, W8.lime[1]);
      A.step = 'water'; keep(); await X.wait(1.6); A.busy = 0; startWater();
    }
    // ── the water: the jar tilted, the water poured runs on the white to the corner and goes down the holes
    function waterStep(dt) {
      A.tilt += (A.tiltT - A.tilt) * (1 - Math.exp(-dt * 4));
      const up = A.step === 'water' || A.step === 'rise';
      const hx = W8.jar[0], hz = W8.jar[1] - 0.2, lifted = up && A.step === 'water' ? 1 : 0;
      jar.position.set(hx, F + (lifted ? 1.5 : 0) + 0.0, hz - (lifted ? 0.3 : 0));
      jar.rotation.set(-A.tilt * 1.9, 0, 0);
      const flow = A.step === 'water' ? clamp((A.tilt - NK.ON) / (1 - NK.ON), 0, 1) : 0;
      if (flow > 0) {
        Fs.water = Math.min(1, Fs.water + (flow * dt) / FIN.WATER);
        const mouth = new T.Vector3(0, 1.5, 0).applyEuler(jar.rotation).add(jar.position), to = new T.Vector3(WP[0][0], Y1, WP[0][1]);
        stream.visible = true; stream.position.copy(mouth).add(to).multiplyScalar(0.5); const d = to.clone().sub(mouth); stream.scale.set(1, d.length(), 1); stream.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d.normalize());
        A.pourT -= dt; if (A.pourT <= 0) { A.pourT = 0.7; X.play('pour', { vol: 0.5 }); }
        if (!A.splashed) { A.splashed = 1; X.play('splash'); ev('splash'); }
      } else stream.visible = false;
      const want = Fs.water * WL * 1.15;
      A.front = Math.max(A.front, Math.min(WL, A.front + (want - A.front) * (1 - Math.exp(-dt * 1.6))));
      if (A.step === 'water' && Fs.water >= 1 && A.front >= WL - 0.05 && !A.down) goesDown();
      if (A.drain) A.drain = Math.min(1, A.drain + dt / 2.6);
      if (A.front > 0 || A.drain) drawWater();
    }
    async function goesDown() {
      A.down = 1; A.busy = 1; A.tiltT = 0; A.fl = null; stream.visible = false; ev('down');
      const r = S8.reeds; X.quick({ x: (r[0][0] + r[1][0]) / 2, y: Y1 + 0.4, z: r[0][1] }, QUICK.water, null);
      X.play('pour', { vol: 0.8 }); X.line(LINES.holes, 4800);
      await X.wait(0.6); X.play('splash');
      A.drain = 0.01;
      await X.wait(2.8);
      A.step = 'rise'; keep(); rise();
    }
    async function rise() {
      A.busy = 1; try { if (X.lookLift) X.lookLift(0); } catch (e) { /* */ }
      try { X.kohen(true); } catch (e) { /* */ }
      // (b131 look round 2: the last picture — the kohen on the east side and the crew along the empty south strip and by the east one,
      //  facing the white yesod, readable beside it; the kohen never between the rising look and the altar's middle)
      try { const [kx, kz] = W8.cam.riseKohen; X.hero.setPos(kx, kz, Math.atan2(MID[0] - kx, MID[1] - kz)); } catch (e) { /* */ }
      water.visible = false; stream.visible = false; gang.clear(); crew.length = 0;
      W8.cam.riseMen.forEach(([x, z], i) => { const w = gang.add(x, z, { role: 'hold', fx: MID[0], fz: MID[1], crew: i }); if (w) { w.a.vis = 1; crew.push(w); } });
      // (b131 look round: the camera truly rises — over the whole white yesod from the south-east, its empty south and east strips
      //  nearest: the shape plain, the yesod on the north and the west only)
      const E = NK.RISE;
      A.pose = [E[0].slice(), E[1].slice()]; X.shot(E[0].slice(), E[1].slice(), 3.6); X.line(LINES.iron, 6000);
      await X.wait(4.4);
      const R = finResult(); A.done = 1;
      X.end({ stars: R.stars, q: R.q, pts: R.pts, perfect: R.perfect, flags: { out: 2 }, at: { x: MID[0], y: Y1, z: MID[1] }, film: { eye: E[0].slice(), aim: E[1].slice(), secs: 2.2, own: () => crew.map((w) => w.a), after: () => { try { gang.clear(); } catch (e) { /* */ } } } });
    }
    // ── the hint hand
    function hintNext(force) {
      let k = '', at = null, dx = 0, dy = 0;
      if (A.step === 'pull') { const key = pullable(Fs, 'S') ? 'S' : 'E', g = pxAmah(key); k = 'pull' + key; at = { x: GRIP_AT[0], y: Y1, z: GRIP_AT[1] }; dx = g.ux * 70; dy = g.uy * 70; }
      else if (A.step === 'white') { k = 'white'; at = { x: MID[0] - 8, y: Y1, z: MID[1] }; dx = 90; dy = 0; }
      else if (A.step === 'water') { k = 'water'; at = { x: jar.position.x, y: F + 1.2, z: jar.position.z }; dx = 0; dy = -60; }
      if (!force && k === A.hintK) return; A.hintK = k; X.hand(at, dx, dy);
    }
    return {
      close: true,
      begin() {
        FG.attach(); lens(NK.FOV); siteTidy(X, true); try { ringsShow(false); } catch (e) { /* */ }
        hideWorld();
        if (Fs.step !== 'down') { frameHold('finale', true); for (const bd of boards) bd.mb.visible = false; }
        for (const k of ['S', 'E']) if (Fs.out[k]) { tim[k].gone = 1; tim[k].g.visible = false; }
        paint(true);
        ev(resumed ? 'resume:' + Fs.step : 'begin');
        if (A.step === 'down') down();
        else if (A.step === 'pull') startPull();
        else if (A.step === 'white') startWhite();
        else if (A.step === 'water') startWater();
        else { A.step = 'rise'; whiteAll(Fs); paint(false); show('water'); for (const h of holes) h.visible = true; rise(); }
        keep();
      },
      update(dt) {
        A.t += dt;
        try {
          V.frame(); B.step(dt); gang.update(dt, B);
          for (const tw of A.tw.slice()) { tw.t += dt; const u = Math.min(1, tw.t / tw.d); tw.f(u); if (u >= 1) { A.tw.splice(A.tw.indexOf(tw), 1); if (tw.res) tw.res(); } }
          if (A.t % 0.5 < dt) hideWorld();
          if (A.step === 'pull') pullStep(dt);
          if (A.step === 'white') { whiteStep(dt); if (A.fl == null && !A.busy && !A.whiteDone && A.t - (A.cshotT || 0) > 1.2) { A.cshotT = A.t; if (!greyNear()) clothShot(0.9); } }
          waterStep(dt);
          A.gT = (A.gT || 0) - dt; if (A.gT <= 0) { A.gT = 0.1; guard(); }
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h131] finale', e && e.message); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.fl = null; A.tiltT = 0; A.pull = null; V.scrape(0); V.creak(0); },
      wants(p) { if (!p) return true; return !!pick(p); },
      holds() { return A.fl != null || [...FG.L.values()].some((f) => f.w); },
      end() {
        FG.detach(); V.stop(); X.hand(null); lens(fov0);
        if (!A.done) gang.clear();   // (the rise's crew stays for the film, which clears it)
        X.props.remove(root); siteTidy(X, false); try { ringsShow(true); } catch (e) { /* */ }
        if (!Mo.isDone('finale') && !A.done) for (const o of hid) o.visible = true;
        frameHold('finale', false);
        try { if (X.lookLift) X.lookLift(0); } catch (e) { /* */ }
      },
      at() { return new T.Vector3(MID[0], Y1, MID[1]); },
      dbg() {
        const s2 = (x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y)]; };
        const o = { figOut: A.outN || 0, rings: ringHid.length, id: m.id, step: A.step, busy: A.busy, done: A.done, mouse: MOUSE, ev: A.ev.slice(-10), out: { ...Fs.out }, cover: +cover(Fs).toFixed(3), water: +Fs.water.toFixed(3), front: +(A.front / WL).toFixed(2), tilt: +A.tilt.toFixed(2), nf: FG.n, hid: hid.length };
        o.grip = s2(GRIP_AT[0], Y1, GRIP_AT[1]);
        for (const k of ['S', 'E']) { const g = pxAmah(k); o['dir' + k] = [+g.ux.toFixed(2), +g.uy.toFixed(2), +g.ppa.toFixed(1)]; o['s' + k] = +tim[k].s.toFixed(2); }
        o.jar = s2(jar.position.x, jar.position.y + 0.8, jar.position.z);
        // (the yesod's rows for a player's cloth: every 4 amot, from the west end to the east)
        o.rows = []; for (let z = FIN.Z0 + 1.5; z < FIN.Z0 + FIN.NZ; z += 4) o.rows.push([s2(FIN.X0 + 1.5, Y1, z), s2(FIN.X0 + FIN.NX - 2, Y1, z)]);
        // (the grey still in the picture, row by row, as a serpentine of screen points: a player's next wipe)
        // (b131: every row the shot's own test counts — the path had only every second row, and grey left on the others stalled the
        //  work: the shot saw grey to wipe, the path had none)
        { o.wipe = []; let flip = 0; const rows = wipeable();
          for (const j of [...rows.keys()].sort((a, b) => a - b)) { const row = rows.get(j).sort((a, b) => a[0] - b[0]); const r = [row[0], row[row.length - 1]]; if (r[0] === r[1] || Math.abs(r[0][0] - r[1][0]) < 20) r[1] = [r[0][0] + 24, r[0][1]]; if (flip) r.reverse(); o.wipe.push(...r); flip ^= 1; }
          o.greyIn = rows.size; o.greyAll = CELLS.reduce((n, v, c) => n + (v && !Fs.mask[c] ? 1 : 0), 0); }
        o.crewPx = crew.filter((w) => w.a && w.a.alive).map((w) => { const a = X.scr(w.a.x, F, w.a.z), b = X.scr(w.a.x, F + 3.9, w.a.z); return Math.round(Math.abs(a.y - b.y)); });
        const cp = cam0.position; o.cam = [cp.x, cp.y, cp.z].map((v) => +v.toFixed(1));
        return o;
      },
    };
  },
};
