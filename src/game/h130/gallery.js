/* ── build 130 ── h130/gallery.js — station 1, "הגזוזטרא: חידת העמודים" (spec station 1, brief §3). Three works, gal1 (north), gal2
 * (south), gal3 (east, the last column raised on the ropes):
 *   the opening (gal1, once, no loss): the court smooth and empty, "איפה יעמוד כל קהל?"; the left hand draws the line that parts the
 *     court into inside and outside; a simply drawn crowd comes in through the gate and mixes there; a tap turns it over: the same; the
 *     kohen lifts his head to the wall: "ואם נעלה קומה?". On screen "(המחשה)". The crowd leaves when the showing ends.
 *   the puzzle: the columns wait on sledges by the kohen; the left hand drags one to a place on the marked line (it comes late, like a
 *     heavy thing; a drop near the line slides to the nearest place a column may stand: not at the end walls, not in the gate's passage,
 *     not by a ladder's foot, not on another column). Over every gap the beam that will lie there shows at once, coloured by its kind:
 *     straight, sagging, cracking (with a sound). The right hand lifts the camera to see the whole run; play goes on lifted.
 *   the live test: a tap on the torch bearer. The crew stands the columns and lays the beams where he chose (a beam over 14 amot cracks:
 *     gal.beam −20, a rough prop stays under it); then the camera stands in each spectator's place by the wall in turn while the bearer
 *     walks his stops: a column that hides the torch blinks, and he may drag it and test again, with no loss (a tap with nothing changed
 *     goes on). Then the camera sits in the last seat above: a sagging beam sinks its seat row and the railing cuts the torch.
 *   level 3's peak: the crew stands the south column, the north one is raised on the ropes (raise.js: build 120's act as it was).
 * What stays: the gallery as he built it (st.gal[side]), drawn by world.js from the save for the rest of the game.
 * The model: model.js (spans, placeOk, blockedAt, testBelow, testAbove, galCheck, galPts). Every place: BOOK.s05.gal.
 */
import { LEVELS, LINES, QUICK, LOSS, spans, colXZ, blockedAt, placeOk, testBelow, testAbove, galCheck, galPts, colPts, qOf, starsOf, solve, GAL, COL_H } from './model.js';
import { SH130, GEO, Y, mats, box, galDraw, galClear, own, label, tag, frameOf, railOf, sinkAt } from './world.js';
import { raiseAct } from './raise.js';
import { MOUSE, onY, heroAt } from '../h113/acts.js';
import { gripR, pickGrip } from '../h109/grips.js';
import { clamp, lerp, ease } from '../h109/kit.js';
import { BOOK } from '../world/grid.js';

const S5 = BOOK.s05, GB = S5.gal, CAM = S5.cam;
const SIDE_HE = { N: 'בצפון', S: 'בדרום', E: 'במזרח' };
// (sizes, not places: a spectator's eye and the torch's flame over the floor, how near the line a drop counts, the drag's lag)
const SEE = Object.freeze({ AIM_D: 8, DOWN: 9, FOV: 40, CLEAR: 3 });   // (FOV: the view from below's lens; CLEAR: amot from his eye to the nearest column — build 130 closing)   // (the spectator's aim: amot ahead, degrees down — build 130 part 3)
const EYE = 3.0, TORCH_H = 4.0, SNAP = 5, LAG = 0.35, HPX = 150, STEP = 4, FOV = 55;   // (FOV: the act's lens, degrees: the world camera's is long)   // (STEP: places in quarters of an amah)   // (HPX: the hint hand's gesture at most, px)
const WHY = { end: 'צמוד מדי לקיר', gate: 'מעבר השער נשאר פנוי', ladder: 'לא מול רגל הסולם', near: 'צמוד מדי לעמוד אחר' };
export const GLINES = Object.freeze({
  puzzle: 'גררו עמוד מהמזחלת אל הקו המסומן · כשמרוצים: הקישו על נושא האבוקה',
  puzzle3: 'עמוד לכל קטע · מעבר השער נשאר פנוי · כשמרוצים: הקישו על נושא האבוקה',
  draw: 'גררו ביד שמאל על הרצפה: קו שמחלק את החצר לפנים ולחוץ',
  mix: 'בשער ובמעברים שני הקהלים מתערבבים, ומי שמאחור לא רואה',
  flip: 'הקישו כדי להפוך',
  same: 'מי שהיה בפנים עובר החוצה. אותה תוצאה',
  none: 'קודם גררו עמוד אל הקו המסומן',
  crackWarn: 'קורה ארוכה מ־14 אמה תיסדק · הקישו שוב על נושא האבוקה כדי לבדוק בכל זאת',
  crew: 'הצוות מעמיד את העמודים ומניח את הקורות',
  prop: 'הקורה נסדקה: הצוות שם תמיכה גסה מתחת לה',
  below: 'המבחן מלמטה: בעיני הצופה ליד הקיר',
  gone: 'האבוקה נעלמה מאחורי עמוד',
  again: 'עמוד הסתיר את האבוקה · גררו אותו והקישו שוב על נושא האבוקה (בלי עונש) · הקשה בלי שינוי: ממשיכים',
  above: 'המבחן מלמטה עבר · עכשיו מהמושב האחרון למעלה',
  above2: 'המבחן מלמעלה: מהמושב האחרון בגזוזטרא',
  cut: 'הקורה שקעה, שורת המושבים ירדה, והמעקה חותך את האבוקה',
  raise: 'הצוות העמיד את העמוד הדרומי · את העמוד הצפוני מרימים בחבלים',
});

/** the act's stand: the kohen by the sledges, facing the run */
function standOf(m) {
  const L = LEVELS[m.lv], side = L.side, s = GB.stand[side], R = L.run, [fx, fz] = colXZ(R, R.axis === 'x' ? s[0] : s[1]);
  return { x: s[0], z: s[1], face: [fx, fz] };
}

export const GALLERY = {
  icon: '🏛', title: 'הגזוזטרא',
  walkLine: (m) => `הגזוזטרא ${SIDE_HE[LEVELS[m.lv].side]}: חידת העמודים`,
  stand: (m) => standOf(m),
  prepare() {},
  make(m, X) {
    const T = X.THREE, PR = X.props, MT = mats(X), Mo = X.M, st = Mo.st, lv = m.lv, L = LEVELS[lv], side = L.side, R = L.run;
    const f0 = frameOf(side, R.a0), court = f0.court, runDir = f0.runDir, yaw = Math.atan2(court[0], court[1]);
    const N = L.stock + L.spare, CG = CAM.gal[side], SP = standOf(m);
    const A = { phase: 'intro', t: 0, busy: true, ev: [], ptr: null, dmg: 0, broke: 0, cracks: 0, charged: new Set(), tested: '', warned: '', hiddenOk: 0, tries: 0,
      sub: null, raised: null, raisedRec: null, raiseRes: null, preview: null, ghostKey: '', firstOk: 0, lost: 0, cut: 0, blink: [], spect: [], crowd: null, draw: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 16) A.ev.shift(); };
    own(side, true); galClear(X, side);
    const all = [];
    const keyOf = (cols) => cols.slice().sort((a, b) => a - b).map((v) => v.toFixed(2)).join(',');
    const along = (x, z) => (R.axis === 'x' ? x : z), across = (x, z) => (R.axis === 'x' ? z : x);
    const footAt = (a) => { const [x, z] = colXZ(R, a); return { x, z }; };

    /* the marked line on the court's floor (chalk), each segment of the run */
    for (const [s0, s1] of R.cut ? [[R.a0, R.cut[0]], [R.cut[1], R.a1]] : [[R.a0, R.a1]]) {
      const w = 0.09, [x0, z0] = colXZ(R, s0), [x1, z1] = colXZ(R, s1);
      all.push(box(X, MT.n5chalk, Math.min(x0, x1) - (R.axis === 'x' ? 0 : w), GEO.FLOOR + 0.005, Math.min(z0, z1) - (R.axis === 'x' ? w : 0), Math.max(x0, x1) + (R.axis === 'x' ? 0 : w), GEO.FLOOR + 0.02, Math.max(z0, z1) + (R.axis === 'x' ? w : 0)));
    }
    // (the ladders' crossings and the gate's passage: a dark tick across the line, so the places no column may take are seen)
    for (const a of R.ladders) { const [x, z] = colXZ(R, a), h = GAL.LADDER; all.push(box(X, MT.n5dark, R.axis === 'x' ? x - h : x - 0.6, GEO.FLOOR + 0.006, R.axis === 'x' ? z - 0.6 : z - h, R.axis === 'x' ? x + h : x + 0.6, GEO.FLOOR + 0.022, R.axis === 'x' ? z + 0.6 : z + h)); }

    /* the columns on their sledges: a group at the foot, the sledge under it, the shaft on a pivot (lying toward the court) */
    function lying(rec) {
      const g = new T.Group(), piv = new T.Group(), ax = new T.Group(); g.add(piv); piv.add(ax);
      box(X, MT.n5cedarD, -0.9, 0, -0.6, 0.9, 0.3, COL_H + 0.4, g);
      piv.position.y = 0.3 + GEO.R0; ax.rotation.x = Math.PI / 2;
      const sg = new T.CylinderGeometry(GEO.R1, GEO.R0, COL_H - 0.3, 18); sg.translate(0, (COL_H - 0.3) / 2, 0);
      const shaft = new T.Mesh(sg, MT.n5marble); shaft.castShadow = true; ax.add(shaft);
      box(X, MT.n5marble, -0.62, COL_H - 0.3, -0.62, 0.62, COL_H, 0.62, ax);
      g.rotation.y = yaw; g.position.set(rec.pos.x, GEO.FLOOR, rec.pos.z); PR.root.add(g); all.push(g);
      rec.g = g; rec.piv = piv; rec.shaft = shaft;
    }
    const C = GB.sleds[side].slice(0, N).map((p, i) => { const r = { i, a: null, sled: { x: p[0], z: p[1] }, pos: { x: p[0], z: p[1] }, tgt: { x: p[0], z: p[1] }, drag: false }; lying(r); return r; });
    const placed = () => C.filter((r) => r.a != null);
    const colsNow = () => placed().map((r) => r.a);
    // the green ring where a dragged column will stand
    const ring = new T.Mesh(new T.RingGeometry(GEO.R0 + 0.05, GEO.R0 + 0.35, 28), MT.n5green); ring.rotation.x = -Math.PI / 2; ring.renderOrder = 3; ring.visible = false; PR.root.add(ring); all.push(ring);

    /* the torch bearer: waits by the kohen until he is tapped; his flame (a glow over his hand) */
    const bw = GB.bearer[side];
    const bearer = SH130.crew ? SH130.crew.add(bw[0], bw[1], { role: 'hold', item: 'torch', crew: 3, tunic: '#E8E0CC', fx: SP.face[0], fz: SP.face[1] }) : null;
    const flame = (() => {
      const cv = document.createElement('canvas'), Z = 64, h = Z / 2; cv.width = cv.height = Z; const g = cv.getContext('2d'), gr = g.createRadialGradient(h, h, 0, h, h, h);
      gr.addColorStop(0, 'rgba(255,250,210,1)'); gr.addColorStop(0.3, 'rgba(255,190,70,.95)'); gr.addColorStop(1, 'rgba(255,120,20,0)'); g.fillStyle = gr; g.fillRect(0, 0, Z, Z);
      const sp = new T.Sprite(new T.SpriteMaterial({ map: new T.CanvasTexture(cv), transparent: true, depthWrite: false, blending: T.AdditiveBlending })); sp.scale.set(1.6, 2.0, 1); PR.root.add(sp); all.push(sp); return sp;
    })();
    const handV = new T.Vector3();
    function flameAt() {
      if (!bearer) return null; const H = X.actors && X.actors();
      try { if (H && H.handWorld) { H.handWorld(bearer.a, 1, handV); if (Number.isFinite(handV.x)) return { x: handV.x, y: Math.max(handV.y + 0.9, GEO.FLOOR + TORCH_H - 0.2), z: handV.z }; } } catch (e) { /* */ }
      return { x: bearer.a.x, y: GEO.FLOOR + TORCH_H, z: bearer.a.z };
    }
    const bearerAt = (x, z, fx, fz) => { if (!bearer) return; bearer.a.x = x; bearer.a.z = z; SH130.crew.face(bearer, fx, fz); bearer.fx = fx; bearer.fz = fz; };
    const torchP = (ti) => { const t = L.torch[ti]; return [t[0], GEO.FLOOR + TORCH_H, t[1]]; };

    /* the camera: the act's own wider lens while the puzzle and the test play (held while his look is at rest), the world's back after */
    const cam0 = X.camera, fov0 = cam0.fov; let lensOn = false;
    const lens = (f) => { try { if (Math.abs(cam0.fov - f) > 0.01) { cam0.fov = f; cam0.updateProjectionMatrix(); } } catch (e) { /* */ } };
    let lensF = FOV;   // (the act's lens now: FOV, or the view from below's longer one)
    const holdLens = () => { if (!lensOn) return; const Lk = X.lookNow ? X.lookNow() : null; if (Lk && (Lk.u > 0.01 || Math.abs(Lk.yaw) > 0.03 || Lk.ov)) return; lens(lensF); };
    const lensSet = (v) => { lensOn = !!v; if (v) lens(lensF); else lens(fov0); };
    const home = (d = 1.0) => X.shot(CG[0], CG[1], d);
    const srcTag = tag('h130-src'), illTag = tag('h130-ill'); srcTag.set(''); illTag.set('');
    let srcT = 0; const src = (t, s = 6) => { srcTag.set(t); srcT = t ? s : 0; };

    /* the plan drawn over the line: faint columns at his places and the beams that will lie over every gap, coloured by kind */
    function ghost(force) {
      const cols = colsNow().concat(A.preview != null ? [A.preview] : []), k = keyOf(cols);
      if (!force && k === A.ghostKey) return; A.ghostKey = k;
      if (A.phase === 'puzzle') galDraw(X, side, { cols }, { ghost: true, deck: false });
    }

    /* the grips: each column (its lying shaft, or the standing ghost at its place), the torch bearer */
    function grips() {
      const R0 = gripR(), out = [];
      for (const r of C) {
        if (r.a != null && !r.drag && r.g && !r.g.visible) { const f = footAt(r.a), a = X.scr(f.x, Y.PLINTH_TOP + 0.5, f.z), b = X.scr(f.x, Y.COL_TOP - 0.5, f.z); out.push({ k: 'c' + r.i, seg: [a, b], R: R0 * 0.7, on: a.on !== false || b.on !== false }); continue; }
        const p = r.g.position, a = X.scr(p.x + court[0] * 0.5, GEO.FLOOR + 0.9, p.z + court[1] * 0.5), b = X.scr(p.x + court[0] * (COL_H - 0.5), GEO.FLOOR + 0.9, p.z + court[1] * (COL_H - 0.5));
        out.push({ k: 'c' + r.i, seg: [a, b], R: R0 * 0.7, on: a.on !== false || b.on !== false });
      }
      if (bearer) { const q = X.scr(bearer.a.x, GEO.FLOOR + 2.2, bearer.a.z); out.push({ k: 'bearer', at: q, R: R0, on: q.on !== false }); }
      return out;
    }
    const gripAt = (p) => pickGrip(p, grips());

    /* the drag */
    function down(p) {
      if (A.sub) { A.sub.down(p); return; }
      const P = { id: p.id, x0: p.x, y0: p.y, x: p.x, y: p.y, t0: performance.now(), moved: 0, what: null };
      A.ptr = P;
      if (A.phase === 'open-draw') { P.what = 'draw'; return; }
      if (A.phase === 'open-flip') { P.what = 'flip'; return; }
      if (A.phase !== 'puzzle' || A.busy) return;
      const k = gripAt(p); P.what = k;
      if (k && k[0] === 'c') {
        const r = C[+k.slice(1)], q = onY(X, p, GEO.FLOOR);
        if (r.a != null) { const f = footAt(r.a); r.pos = { x: f.x, z: f.z }; r.g.position.set(f.x, GEO.FLOOR, f.z); r.g.visible = true; }
        P.rec = r; P.prevA = r.a; r.a = null; r.drag = true; P.off = q ? { x: q.x - r.pos.x, z: q.z - r.pos.z } : { x: 0, z: 0 };
        X.hand(null); X.play('scrape'); ev('grab ' + r.i); ghost(true);
      }
    }
    function move(p) {
      if (A.sub) { A.sub.move(p); return; }
      const P = A.ptr; if (!P || P.id !== p.id) return;
      const dx = p.x - P.x, dy = p.y - P.y; P.moved = Math.max(P.moved, Math.hypot(p.x - P.x0, p.y - P.y0)); P.x = p.x; P.y = p.y;
      if (P.what === 'draw') { A.draw = Math.min(1, A.draw + Math.hypot(dx, dy) / (Math.min(innerWidth, innerHeight) * 1.6)); return; }
      if (!P.rec) return;
      const q = onY(X, p, GEO.FLOOR); if (!q) return;
      const r = P.rec, ac = across(q.x, q.z), al = clamp(Math.round(along(q.x, q.z) * STEP) / STEP, R.a0, R.a1);   // (a place on the quarter amah: the masons' marks)
      if (Math.abs(ac - R.line) < SNAP) {
        const a = placeOk(R, al, colsNow());
        A.preview = a; if (a != null) { const f = footAt(a); r.tgt = { x: f.x, z: f.z }; ring.position.set(f.x, GEO.FLOOR + 0.03, f.z); ring.visible = true; }
        A.why = a != null && Math.abs(a - al) > 0.05 ? blockedAt(R, al, colsNow()) : null;
      } else { A.preview = null; A.why = null; ring.visible = false; r.tgt = { x: q.x - P.off.x, z: q.z - P.off.z }; }
      ghost();
    }
    function up(p) {
      if (A.sub) { A.sub.up(p); return; }
      const P = A.ptr; if (!P || P.id !== p.id) return; A.ptr = null;
      if (P.what === 'flip' && P.moved < 14) { A.flipTap = 1; return; }
      if (P.what === 'bearer' && P.moved < 18 && A.phase === 'puzzle' && !A.busy) { test(); return; }
      if (!P.rec) return;
      const r = P.rec; r.drag = false; ring.visible = false;
      if (A.preview != null) {
        r.a = A.preview; const f = footAt(r.a); r.tgt = { x: f.x, z: f.z };
        if (A.why) X.line(WHY[A.why] || '', 1600);
        feel(r);
      } else { r.a = null; r.tgt = { ...r.sled }; X.play('thud'); }
      A.preview = null; A.why = null; ghost(true); ev('drop ' + r.i + ' ' + (r.a == null ? '-' : r.a.toFixed(2)));
    }
    /** the beams beside a column just placed: straight is "במקום!", a sag creaks, a crack (one he could close) sounds */
    function feel(r) {
      const G = spans(R, colsNow()), near = G.filter((g) => Math.abs(g.a0 - r.a) < 1e-6 || Math.abs(g.a1 - r.a) < 1e-6);
      const bad = near.find((g) => g.kind === 'crack' && g.len <= 2 * GAL.SAG), sag = near.find((g) => g.kind === 'sag');
      const f = footAt(r.a);
      if (bad) { X.play('crack'); X.shake(0.08, 0.15); ev('crack-ghost'); }
      else if (sag) { X.play('creak'); ev('sag-ghost'); }
      else { X.play('stamp'); X.quick({ x: f.x, y: Y.COL_TOP * 0.6 + GEO.FLOOR * 0.4, z: f.z }, QUICK.place, null); ev('place'); }
    }

    /* the live test */
    // (an act ended from outside — the director's test hook, a reload — stops its test where it is: nothing runs on into the next work)
    const wait = async (s) => { await X.wait(s); if (A.ended) throw new Error('h130 ended'); };
    function spectators(on) {
      for (const w of A.spect) SH130.crew.remove(w); A.spect = [];
      if (!on || !SH130.crew) return;
      L.watch.forEach((w, i) => { const t = L.torch[0], s = SH130.crew.add(w[0], w[1], { variant: 'pilgrim', role: 'hold', fx: t[0], fz: t[1], crew: i }); if (s) A.spect.push(s); });
    }
    function blinkCols(idx, on) {
      const rec = SH130.gal[side]; if (!rec) return;
      for (const Cm of rec.cols) {
        const hit = on && idx.includes(Cm.i);
        if (hit && !Cm.shaft.userData.m0) { Cm.shaft.userData.m0 = Cm.shaft.material; Cm.shaft.material = new T.MeshStandardMaterial({ color: '#E8B0A0', emissive: '#C02010', emissiveIntensity: 0.9, roughness: 0.5 }); A.blink.push(Cm); }
        if (!hit && Cm.shaft.userData.m0) { const m0 = Cm.shaft.userData.m0; Cm.shaft.material.dispose(); Cm.shaft.material = m0; delete Cm.shaft.userData.m0; }
      }
      if (!on) A.blink = [];
    }
    async function blinkFor(idx, secs) { for (let k = 0; k < Math.round(secs / 0.15); k++) { blinkCols(idx, k % 2 === 0); await wait(0.15); } blinkCols([], false); }
    /** the crew stands his columns (the lying shaft rises on its foot, a man at it) and lays the beams; cracks cost and leave a prop */
    async function standAll(skip = null) {
      const L2 = placed().filter((r) => r !== skip), men = [];
      for (const r of L2) { const f = footAt(r.a); r.pos = { ...f }; r.tgt = { ...f }; r.g.position.set(f.x, GEO.FLOOR, f.z); r.g.visible = true; const w = SH130.crew ? SH130.crew.add(f.x + court[0] * 3 + runDir[0] * 1.3, f.z + court[1] * 3 + runDir[1] * 1.3, { role: 'push', fx: f.x, fz: f.z, crew: 1 }) : null; if (w) men.push(w); }
      galClear(X, side);
      for (let k = 1; k <= 24; k++) { const u = ease(k / 24); for (const r of L2) { r.piv.rotation.x = -u * Math.PI / 2; r.piv.position.y = lerp(0.3 + GEO.R0, Y.PLINTH_TOP - GEO.FLOOR, u); } await wait(1 / 30); }
      X.play('thud'); for (const r of L2) { r.g.visible = false; r.piv.rotation.x = 0; r.piv.position.y = 0.3 + GEO.R0; }
      for (const w of men) SH130.crew.remove(w);
    }
    function layoutNow(withProps = true) {
      const cols = colsNow(), G = spans(R, cols);
      return { cols, props: withProps ? G.filter((g) => g.kind === 'crack').map((g) => +((g.a0 + g.a1) / 2).toFixed(2)) : [], raised: A.raised, raisedAt: A.raised && A.raisedRec && A.raisedRec.a != null ? A.raisedRec.a : null };
    }
    async function cracksNow() {
      const G = spans(R, colsNow());
      for (const g of G.filter((q) => q.kind === 'crack')) {
        const key = g.a0.toFixed(2) + '|' + g.a1.toFixed(2); if (A.charged.has(key)) continue; A.charged.add(key);
        const mid = (g.a0 + g.a1) / 2, f = footAt(mid);
        X.play('crack'); X.shake(0.25, 0.35); X.dust(f.x, Y.COL_TOP, f.z, 18, 3);
        X.loss(20, { x: f.x, y: Y.COL_TOP, z: f.z }, LOSS['gal.beam'][0], 0); A.dmg++; A.cracks++;
        try { Mo.mark('gal.beam', m.id, [+f.x.toFixed(2), +f.z.toFixed(2)]); X.save(); } catch (e) { /* */ }
        X.line(GLINES.prop, 2600); await wait(1.2);
      }
    }
    function test() { return runTest().catch((e) => { if (!A.ended) console.warn('[h130] test', e && e.message); }); }
    async function runTest() {
      const cols = colsNow();
      if (!cols.length) { X.line(GLINES.none, 2400); return; }
      const k = keyOf(cols), G = spans(R, cols);
      if (G.some((g) => g.kind === 'crack') && A.warned !== k) { A.warned = k; X.play('creak'); X.line(GLINES.crackWarn, 4200); ev('warn'); return; }
      A.busy = true; A.phase = 'test'; A.tries++; X.hand(null); ring.visible = false; ev('test ' + k);
      const again = A.tested === k; A.tested = k;
      // the crew stands them and lays the beams (level 3: the south column; the north one is raised on the ropes, once)
      X.line(GLINES.crew, 0); home(0.6);
      const rz = L.raise && !A.raised ? raiseRec() : null;
      await standAll(rz);
      if (rz) { galDraw(X, side, layoutNow(false), { deck: false, beams: false, standing: colsNow().map((a) => a !== rz.a) }); await doRaise(rz); }
      galDraw(X, side, layoutNow(false), { deck: true });
      await cracksNow();
      galDraw(X, side, layoutNow(true), { deck: true });
      await wait(0.6);
      // from below, in every spectator's eyes (unless he tapped again with nothing changed: then on, the torch lost where it was)
      const below = testBelow(cols, lv);
      if (!(again && A.lostAt === k)) {
        X.kohen(false); spectators(true); X.line(GLINES.below, 0);
        let order = L.torch.map((_, i) => i);
        { const t = L.torch[order[0]]; bearerAt(t[0], t[1], L.watch[0][0], L.watch[0][1]); }
        for (let wi = 0; wi < L.watch.length; wi++) {
          const w = L.watch[wi], eye = clearEye([w[0], GEO.FLOOR + EYE, w[1]], cols);
          lensF = SEE.FOV; lens(lensF);
          A.spect.forEach((s, i) => { s.a.vis = s.a.visT = i === wi ? 0 : 1; });
          for (let j = 0; j < order.length; j++) {
            const ti = order[j], t = L.torch[ti];
            if (j > 0) { const d = Math.hypot(bearer.a.x - t[0], bearer.a.z - t[1]); X.shot(eye, eyeAim(eye, torchP(ti)), d / 14); await Promise.race([SH130.crew.walkTo(bearer, t[0], t[1], 14), wait(d / 14 + 1)]); }
            else { X.shot(eye, eyeAim(eye, torchP(ti)), j === 0 && wi === 0 ? 0.01 : 0.6); await wait(0.7); }
            SH130.crew.face(bearer, w[0], w[1]);
            const hid = below.lost.filter((q) => q.w === wi && q.t === ti).map((q) => q.col);
            A.view = { wi, ti, hid }; ev(`see w${wi} t${ti} ${hid.length ? 'lost ' + hid.join(',') : 'ok'}`);
            if (hid.length) { X.play('creak'); X.line(GLINES.gone, 1800); await blinkFor(hid, 1.8); } else await wait(0.9);
          }
          order = order.slice().reverse();
        }
        A.view = null; lensF = FOV; lens(lensF);
        if (!below.ok) {
          A.lostAt = k; A.lost = 1;
          spectators(false); X.kohen(true); bearerAt(bw[0], bw[1], SP.face[0], SP.face[1]);
          A.phase = 'puzzle'; galClear(X, side); for (const r of placed()) { const f = footAt(r.a); r.g.position.set(f.x, GEO.FLOOR, f.z); r.pos = { ...f }; r.tgt = { ...f }; r.g.visible = false; }
          ghost(true); home(0.9); X.line(GLINES.again, 0); A.busy = false; return;
        }
        X.quick({ x: L.torch[0][0], y: GEO.FLOOR + TORCH_H + 1, z: L.torch[0][1] }, QUICK.perfectTest, null);
        X.line(GLINES.above, 2400); await wait(1.2);
      } else { X.line(GLINES.above2, 2400); A.hiddenOk = 1; }
      // from above: the last seat (or the seat over a sunk beam), the torch at its first stop
      spectators(false);
      { const t = L.torch[0]; bearerAt(t[0], t[1], R.axis === 'x' ? t[0] : R.line, R.axis === 'x' ? R.line : t[1]); }
      const ab = testAbove(cols, lv), row = ab.rows.find((q) => q.cut), seat = GB.seat[side];
      const aS = row ? (row.a0 + row.a1) / 2 : along(seat[0], seat[1]), cS = across(seat[0], seat[1]), sink = sinkAt(spans(R, cols), aS);
      const rl = railOf(side), tp = torchP(0), tc = across(tp[0], tp[2]), u = (rl.re - cS) / (tc - cS), eye0 = (rl.top - tp[1] * u) / (1 - u) + GAL.CLEAR;
      const ex = R.axis === 'x' ? aS : cS, ez = R.axis === 'x' ? cS : aS;
      // (the seats in front of his eye are left out of this one view — they filled its lower half — so the railing, the torch and the men
      // below are the picture; the railing is what judges)
      seatsShow(false);
      X.shot([ex, eye0 - sink, ez], tp, 1.4); await wait(1.6);
      A.cut = ab.cut ? 1 : 0; ev('above ' + (ab.cut ? 'cut ' + row.sink : 'clear'));
      if (ab.cut) { X.play('creak'); X.line(GLINES.cut, 3200); await wait(3.0); }
      else { X.quick({ x: tp[0], y: tp[1] + 1, z: tp[2] }, QUICK.clear, null); await wait(1.8); }
      seatsShow(true);
      finish();
    }
    /** ── build 130 part 3 ── the spectator's aim: toward the torch but a little down (SEE.DOWN degrees, SEE.AIM_D amot ahead). The torch's flame is over his eye;
     *  a camera that looks up past the world controls' polar limit (main.js maxPolarAngle 1.46) was lifted by them before each frame —
     *  to the gallery's own height, its deck and railing then filling the view (the "brown frame" of the test from below) */
    /** ── build 130 closing ── his eye off the columns he built: one within SEE.CLEAR amot of it filled a third of the frame (1600×900);
     *  he steps back from it (the test itself is the book's, from his seat: only the camera moves) */
    function clearEye(eye, cols) {
      const e = eye.slice();
      for (let it = 0; it < 3; it++) {
        for (const a of cols) {
          const [cx, cz] = colXZ(R, a), dx = e[0] - cx, dz = e[2] - cz, d = Math.hypot(dx, dz);
          if (d >= SEE.CLEAR) continue;
          // (along the run, never toward the wall or into the court: the distance across stays, the distance along grows)
          const ax = R.axis === 'x', along = ax ? dx : dz, across = ax ? dz : dx, need = Math.sqrt(Math.max(0, SEE.CLEAR * SEE.CLEAR - across * across)) + 0.01;
          const sgn = along >= 0 ? 1 : -1, v = (ax ? cx : cz) + sgn * need;
          if (ax) e[0] = v; else e[2] = v;
        }
      }
      return e;
    }
    function eyeAim(eye, tp) {
      const dx = tp[0] - eye[0], dz = tp[2] - eye[2], L = Math.hypot(dx, dz) || 1, k = Math.min(L, SEE.AIM_D);
      return [eye[0] + (dx / L) * k, eye[1] - k * Math.tan((SEE.DOWN * Math.PI) / 180), eye[2] + (dz / L) * k];
    }
    function seatsShow(v) { try { const r = SH130.gal[side]; if (r && r.seats) r.seats.visible = !!v; } catch (e) { /* */ } }

    /* level 3: the north segment's column on the ropes (raise.js) */
    function raiseRec() {
      const P = placed().filter((r) => R.cut && r.a < R.cut[0]).sort((a, b) => a.a - b.a);
      return P.length ? P[P.length - 1] : null;
    }
    function doRaise(rz) {
      return new Promise((res) => {
        A.phase = 'raise'; X.line(GLINES.raise, 2600); lensSet(false);
        const f = footAt(rz.a), fr = { x: f.x, z: f.z, along: [runDir[0], runDir[1]], across: [court[0], court[1]] };
        const sub = raiseAct(X, { fr, id: m.id, onEnd: (r) => { A.raiseRes = r; A.raised = r.c; A.raisedRec = rz; A.broke = r.c.broke | 0; A.dmg += A.broke; try { sub.end(); } catch (e) { /* */ } A.sub = null; X.kohen(true); heroAt(X, SP.x, SP.z, SP.face[0], SP.face[1]); A.phase = 'test'; lensSet(true); home(0.8); res(); } });
        A.sub = sub; A.busy = false; sub.begin();
      });
    }

    /* the end: the gallery as he built it into the save; the points; X.end */
    function finish() {
      const lay = layoutNow(true), chk = galCheck(lay.cols, lv);
      st.gal[side] = { cols: lay.cols.slice().sort((a, b) => a - b), props: lay.props, raised: lay.raised, raisedAt: lay.raisedAt };
      X.save();
      let pts = galPts(chk, A.broke);
      if (A.raiseRes) pts = Math.min(pts, A.raiseRes.pts);
      const q = qOf(pts), perfect = pts >= 40 && !A.dmg && !A.cut;
      ev('end ' + pts);
      const f = footAt((R.a0 + R.a1) / 2);
      X.kohen(true); X.line('');
      // (the director's pull-back keeps the camera's bearing: from the seat it looked at the court with the wall behind, and 46 amot
      // back from the gallery was the wall's stone filling the frame; from the stand it rises over the court toward the gallery)
      home(0.5);
      setTimeout(() => X.end({ stars: starsOf(q), q, pts, perfect, lost: A.dmg > 0, at: { x: f.x, y: Y.GFLOOR, z: f.z }, flags: { 'gal.beam': A.cracks, 'gal.column': A.broke, sags: chk.sags, hidden: chk.hidden.length, n: chk.n, mehudar: chk.mehudar ? 1 : 0, tries: A.tries } }), 600);
    }

    /* the opening (gal1, once): the drawn line, the crowd in and turned over, "ואם נעלה קומה?" */
    function crowdMake() {
      const [[rx0, rz0], , [rx1, rz1]] = GB.ring, ct = S5.court, gate = GB.gate, inner = [], outer = [];
      for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) inner.push([rx0 + ((rx1 - rx0) * (i + 0.5)) / 6, rz0 + ((rz1 - rz0) * (j + 0.5)) / 4]);
      for (const sg of [-1, 1]) for (let i = 0; i < 12; i++) { const zr = sg < 0 ? rz0 : rz1, zc = sg < 0 ? ct.z0 : ct.z1; outer.push([rx0 + 8 + ((rx1 - rx0 - 16) * (i + 0.5)) / 12, zr + (zc - zr) * (i % 2 ? 0.42 : 0.62)]); }
      const geoB = new T.CylinderGeometry(0.55, 0.75, 2.8, 8), geoH = new T.SphereGeometry(0.5, 10, 8);
      const mA = [new T.MeshStandardMaterial({ color: '#7A3E5E', roughness: 0.9 }), new T.MeshStandardMaterial({ color: '#4E5E8A', roughness: 0.9 })];
      const mB = [new T.MeshStandardMaterial({ color: '#D8C8A0', roughness: 0.9 }), new T.MeshStandardMaterial({ color: '#8A6A44', roughness: 0.9 })];
      const skin = new T.MeshStandardMaterial({ color: '#C89A72', roughness: 0.9 });
      const F = [];
      for (let k = 0; k < 48; k++) {
        const grp = k % 2, i = k >> 1, g = new T.Group(), b = new T.Mesh(geoB, (grp ? mB : mA)[i % 2]); b.position.y = 1.4; g.add(b);
        const h = new T.Mesh(geoH, grp ? skin : mA[(i + 1) % 2]); h.position.y = 3.2; g.add(h);
        g.position.set(gate[0] + 10, GEO.FLOOR, gate[1] + ((i % 5) - 2) * 1.4); g.visible = false; PR.root.add(g);
        F.push({ g, grp, i, from: null, to: null, t0: 0, dur: 1, via: null });
      }
      return { F, inner, outer, gate, mats: [...mA, ...mB, skin], geos: [geoB, geoH], all: F.map((f) => f.g) };
    }
    function crowdGo(CR, toInnerFor, delay = 0.16, viaGate = true) {
      const t = A.t;
      for (const f of CR.F) {
        const inn = toInnerFor(f.grp), P = inn ? CR.inner : CR.outer, p = P[f.i % P.length];
        const from = [f.g.position.x, f.g.position.z], via = viaGate ? [CR.gate[0] - 4, CR.gate[1] + ((f.i % 5) - 2) * 1.6] : null;
        const len = (via ? Math.hypot(via[0] - from[0], via[1] - from[1]) + Math.hypot(p[0] - via[0], p[1] - via[1]) : Math.hypot(p[0] - from[0], p[1] - from[1]));
        Object.assign(f, { from, via, to: p, t0: t + f.i * delay, dur: len / 16 }); f.g.visible = true;
      }
      return Math.max(...CR.F.map((f) => f.t0 + f.dur)) - t;
    }
    function crowdStep(CR) {
      for (const f of CR.F) {
        if (!f.to) continue; const u = clamp((A.t - f.t0) / f.dur, 0, 1); if (u <= 0) continue;
        let x, z;
        if (f.via) { const l1 = Math.hypot(f.via[0] - f.from[0], f.via[1] - f.from[1]), l2 = Math.hypot(f.to[0] - f.via[0], f.to[1] - f.via[1]), s = u * (l1 + l2); if (s < l1) { const k = s / (l1 || 1); x = lerp(f.from[0], f.via[0], k); z = lerp(f.from[1], f.via[1], k); } else { const k = (s - l1) / (l2 || 1); x = lerp(f.via[0], f.to[0], k); z = lerp(f.via[1], f.to[1], k); } }
        else { x = lerp(f.from[0], f.to[0], u); z = lerp(f.from[1], f.to[1], u); }
        f.g.position.x = x; f.g.position.z = z; f.g.position.y = GEO.FLOOR + (u < 1 ? Math.abs(Math.sin(A.t * 9 + f.i)) * 0.15 : 0);
      }
    }
    function crowdDrop(CR) { if (!CR) return; for (const g of CR.all) PR.remove(g); for (const q of CR.mats) q.dispose(); for (const q of CR.geos) q.dispose(); }
    // the drawn line on the floor: dashes round the ring, shown as the left hand draws
    function ringDashes() {
      const P = GB.ring, segs = [], D = [];
      for (let i = 0; i < P.length; i++) { const a = P[i], b = P[(i + 1) % P.length]; segs.push([a, b, Math.hypot(b[0] - a[0], b[1] - a[1])]); }
      const tot = segs.reduce((s, q) => s + q[2], 0), n = 96;
      for (let k = 0; k < n; k++) {
        let d = (tot * k) / n, s = 0; while (d > segs[s][2]) { d -= segs[s][2]; s++; }
        const [a, b, l] = segs[s], x = lerp(a[0], b[0], d / l), z = lerp(a[1], b[1], d / l), hx = Math.abs(b[0] - a[0]) > 0.1 ? 1.2 : 0.25, hz = Math.abs(b[0] - a[0]) > 0.1 ? 0.25 : 1.2;
        const q = box(X, MT.n5chalk, x - hx, GEO.FLOOR + 0.01, z - hz, x + hx, GEO.FLOOR + 0.04, z + hz); q.visible = false; D.push(q); all.push(q);
      }
      return D;
    }
    async function opening() {
      A.phase = 'open-draw'; A.busy = false;
      const OC = CAM.open1, dash = ringDashes();
      X.kohen(true); X.shot(OC[0], OC[1], 1.2);
      illTag.set(LINES.ill); X.line(LINES.where, 0);
      await wait(1.4);
      X.line(LINES.where + ' · ' + GLINES.draw, 0);
      { const p = GB.ring[0], q = GB.ring[1]; const a = X.scr(p[0], GEO.FLOOR, p[1]), b = X.scr(q[0], GEO.FLOOR, q[1]); X.hand({ x: p[0], y: GEO.FLOOR, z: p[1] }, Math.round(clamp(b.x - a.x, -HPX, HPX)), Math.round(clamp(b.y - a.y, -HPX, HPX))); }
      while (A.draw < 1) { const n = Math.round(A.draw * dash.length); dash.forEach((d, i) => { d.visible = i < n; }); await wait(0.05); if (A.ended) return; }
      dash.forEach((d) => { d.visible = true; }); X.hand(null); X.play('good');
      // the crowd comes in through the gate: the women inside the line, the men outside it; at the gate they mix
      A.phase = 'open-crowd'; A.busy = true;
      const CR = crowdMake(); A.crowd = CR;
      src(LINES.sukkah51a, 8);
      const d1 = crowdGo(CR, (grp) => grp === 0);
      await wait(Math.min(d1 * 0.5, 5)); X.line(GLINES.mix, 0); await wait(Math.max(1.5, d1 * 0.5 + 0.5));
      A.phase = 'open-flip'; A.busy = false; A.flipTap = 0; X.line(GLINES.flip, 0);
      X.hand({ x: (GB.ring[0][0] + GB.ring[1][0]) / 2, y: GEO.FLOOR, z: 0 }, 0, 0);
      while (!A.flipTap) { await wait(0.1); if (A.ended) return; }
      X.hand(null); A.phase = 'open-crowd'; A.busy = true;
      const d2 = crowdGo(CR, (grp) => grp === 1, 0.08, false);
      await wait(Math.min(d2, 6)); X.line(GLINES.same, 2600); await wait(2.4);
      // the kohen lifts his head to the wall
      const UP = CAM.galUp;
      X.shot(UP[0], UP[1], 1.6); X.line(LINES.up, 0); src(LINES.sukkah51b, 6);
      for (const f of CR.F) { f.from = [f.g.position.x, f.g.position.z]; f.via = null; f.to = [GB.gate[0] + 10, GB.gate[1] + ((f.i % 5) - 2) * 1.4]; f.t0 = A.t + f.i * 0.03; f.dur = Math.hypot(f.to[0] - f.from[0], f.to[1] - f.from[1]) / 22; }
      await wait(4.2);
      crowdDrop(CR); A.crowd = null; dash.forEach((d) => { d.visible = false; });
      illTag.set(''); st.open1 = 1; X.save();
    }

    async function begin2() {
      if (lv === 1 && !st.open1) { try { await opening(); } catch (e) { console.warn('[h130] opening', e && e.message); } if (A.ended) return; }
      A.phase = 'puzzle'; A.busy = false;
      lensSet(true); home(1.0); src(LINES.middot25, 7);
      X.line(lv === 3 ? GLINES.puzzle3 : GLINES.puzzle, 0);
      ghost(true);
      await wait(1.2);
      const r = C[0], p = r.g.position, a = X.scr(p.x + court[0] * 5, GEO.FLOOR + 0.9, p.z + court[1] * 5), [lx, lz] = colXZ(R, r.sled.x * Math.abs(runDir[0]) + r.sled.z * Math.abs(runDir[1])), b = X.scr(lx, GEO.FLOOR, lz);
      if (A.phase === 'puzzle' && !placed().length) X.hand({ x: p.x + court[0] * 5, y: GEO.FLOOR + 0.9, z: p.z + court[1] * 5 }, Math.round(clamp(b.x - a.x, -HPX, HPX)), Math.round(clamp(b.y - a.y, -HPX, HPX)));
    }

    let sol = null, hideSpot;
    return {
      close: true,
      begin() {
        X.kohen(true);
        try { A.ta = [document.documentElement.style.touchAction, document.body.style.touchAction]; document.documentElement.style.touchAction = 'none'; document.body.style.touchAction = 'none'; } catch (e) { /* */ }
        home(0.01);
        begin2();
      },
      update(dt) {
        A.t += dt;
        if (srcT > 0) { srcT -= dt; if (srcT <= 0) srcTag.set(''); }
        holdLens();
        if (A.sub) A.sub.update(dt);
        if (A.crowd) crowdStep(A.crowd);
        const k = 1 - Math.exp(-dt / LAG);
        for (const r of C) {
          if (!r.g || A.phase === 'test' || A.phase === 'raise') continue;
          r.pos.x += (r.tgt.x - r.pos.x) * k; r.pos.z += (r.tgt.z - r.pos.z) * k; r.g.position.set(r.pos.x, GEO.FLOOR, r.pos.z);
          if (r.a != null && !r.drag) { const there = Math.hypot(r.tgt.x - r.pos.x, r.tgt.z - r.pos.z) < 0.25; r.g.visible = !there; }
          else r.g.visible = true;
        }
        const fp = flameAt(); if (fp) { flame.position.set(fp.x, fp.y, fp.z); flame.scale.set(1.4 + Math.sin(A.t * 13) * 0.12, 1.9 + Math.sin(A.t * 11) * 0.15, 1); }
      },
      down, move, up,
      cancel() {
        if (A.sub) { A.sub.cancel(); return; }
        const P = A.ptr; A.ptr = null; if (!P || !P.rec) return;
        const r = P.rec; r.drag = false; r.a = P.prevA; const f = r.a != null ? footAt(r.a) : r.sled; r.tgt = { x: f.x, z: f.z }; A.preview = null; ring.visible = false; ghost(true);
      },
      wants(p) {
        if (A.sub) return A.sub.wants(p);
        if (A.phase !== 'puzzle' || A.busy) return false;
        return !!gripAt(p);
      },
      holds() { return A.sub ? A.sub.holds() : false; },
      end() {
        A.ended = true;
        try { if (A.ta) { document.documentElement.style.touchAction = A.ta[0]; document.body.style.touchAction = A.ta[1]; } } catch (e) { /* */ }
        if (A.sub) { try { A.sub.end(); } catch (e) { /* */ } A.sub = null; }
        crowdDrop(A.crowd); A.crowd = null;
        blinkCols([], false); spectators(false);
        if (bearer) SH130.crew.remove(bearer);
        for (const o of all) PR.remove(o);
        srcTag.remove(); illTag.remove(); lensSet(false);
        X.hand(null); X.kohen(true);
        own(side, false);
      },
      at() { const f = footAt((R.a0 + R.a1) / 2); return { x: f.x, y: Y.COL_TOP, z: f.z }; },
      dbg() {
        if (A.sub) return { ...A.sub.dbg(), id: m.id, lv: 3, sub: 'raise', t: +A.t.toFixed(2), ev: A.ev.slice(-8) };
        const s2 = (x, y, z) => { const q = X.scr(x, y, z); return [Math.round(q.x), Math.round(q.y)]; };
        const cp = X.camera.position, o = { cam: [cp.x, cp.y, cp.z].map((v) => +v.toFixed(1)), fov: +X.camera.fov.toFixed(1), id: m.id, lv, side, phase: A.phase, busy: A.busy, t: +A.t.toFixed(2), ev: A.ev.slice(-10), mouse: MOUSE, dmg: A.dmg, cracks: A.cracks, broke: A.broke, tries: A.tries, lost: A.lost, cut: A.cut, draw: +A.draw.toFixed(2), view: A.view || null,
          cols: C.map((r) => { const p = r.g.position, vis = r.g.visible; const g = vis ? s2(p.x + court[0] * 5, GEO.FLOOR + 0.9, p.z + court[1] * 5) : (() => { const f = footAt(r.a); return s2(f.x, (Y.PLINTH_TOP + Y.COL_TOP) / 2, f.z); })(); return { i: r.i, a: r.a == null ? null : +r.a.toFixed(2), grip: g, drag: r.drag }; }),
          bearer: bearer ? s2(bearer.a.x, GEO.FLOOR + 2.2, bearer.a.z) : null, layout: colsNow().map((v) => +v.toFixed(2)) };
        if (A.phase === 'open-draw') { const p = GB.ring[0], q = GB.ring[2]; o.drawFrom = s2(p[0], GEO.FLOOR, p[1]); o.drawTo = s2(q[0], GEO.FLOOR, q[1]); }
        if (A.phase === 'puzzle' && (globalThis.__BOT || globalThis.__H130_SOL)) {
          // (the bot's: a layout that keeps every rule, from the model's solver — the act never solves for the player)
          if (!sol) { try { const b = solve(lv, L.n, 0.25).best; sol = b ? b.cols : []; } catch (e) { sol = []; } }
          o.sol = sol.map((a) => { const f = footAt(a); return { a, scr: s2(f.x, GEO.FLOOR, f.z) }; });
          // (the bot's 'hide': a place on a spectator's line nearest one of the solver's places, no beam cracking)
          if (hideSpot === undefined) {
            hideSpot = null;
            sol.forEach((a0, j) => L.watch.forEach((w) => L.torch.forEach((t) => {
              const u = R.axis === 'x' ? (R.line - w[1]) / (t[1] - w[1]) : (R.line - w[0]) / (t[0] - w[0]); if (!(u > 0 && u < 1)) return;
              const c = R.axis === 'x' ? w[0] + (t[0] - w[0]) * u : w[1] + (t[1] - w[1]) * u, cs = sol.map((v, i) => (i === j ? c : v)), ch = galCheck(cs, lv);
              if (!ch.legal || ch.cracks) return; const d = Math.abs(c - a0); if (!hideSpot || d < hideSpot.d) hideSpot = { j, a: +c.toFixed(3), d };
            })));
          }
          if (hideSpot) { const f = footAt(hideSpot.a); o.hide = { j: hideSpot.j, a: hideSpot.a, scr: s2(f.x, GEO.FLOOR, f.z) }; }
        }
        return o;
      },
    };
  },
};
