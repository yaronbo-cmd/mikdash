/* ── build 131 ── h131/pour.js — part 3 of stage 08, "היציקה" (the main work; spec docs/specs/shlav-08-he.md part 3: three works, pour1–3).
 * On the approved sample's simulation (sim.js as it is) and its look (pour3d.js), at the level's section on the court (pourlv.js):
 *   prep (pour1 only)  the crew lay the two timbers; he fixes their joint in the south-east corner and drives the two reeds in the
 *                      south-west one (a tap on each: the place is marked) — "קודם מכינים את מה שיישאר ריק"
 *   stones             the crew bring the pit's stones; each tap drops the next one in: it falls and settles (a thud, a small shake);
 *                      the ones he raised himself are a little warmer in colour
 *   pour               the left thumb moves the spout along the near board (across) and tilts it (up: more); the right thumb lifts the
 *                      camera. The mix runs to the low place, cools and sets; a passage that closes before the place behind it filled
 *                      leaves a pocket of air (the ochre ring, the bubbles, the pale pulse). Cauldrons come from the fire until the
 *                      section is done: no clock, no fail — cold mix just stops where it is.
 *   knock              the knocker's three taps: full (a deep sound, the gleam, "מלא!") or hollow (−20: the crew take the section apart,
 *                      he pours it again where it was; the patch stays a little different, for good)
 *   level 3            over the south timber: the mix runs out onto the floor (−20, its stain stays); onto a reed: it clogs (−40: the crew
 *                      set a new one and the corner's mix comes out, to be poured again)
 * Mouse: the same drag with the left button (one hand); the right button is the camera's.
 *   POUR_ACT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOOK } from '../world/grid.js';
import { LINES, QUICK, LOSS, grade, qOf, starsOf } from './model.js';
import { LEVELS, newSim, frameOf, toWorld, toLocal, cellsOf, landing, clearAround, packWork, unpackWork, SIM_T as T, NX, N, cellX, cellZ, X0, DX } from './pourlv.js';
import { createPourView, POUR3D, SPILL_SEEN } from './pour3d.js';
import { createGang, createBeat } from '../h109/kit.js';

const S8 = BOOK.s08;
const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
const STEP = 1 / 60;
/** the pour's words (rule 64: short; the spec's own where it has them) */
export const POUR_LINES = Object.freeze({
  w1: 'היציקה: מקטע בצפון', w2: 'היציקה: מקטע באמצע', w3: 'היציקה: הקרן הדרומית מערבית, עם הקנים',
  prep: 'מכינים את המקום הריק', joint: 'קבעו את מפגש הקורות', reeds: 'תקעו את שני הקנים', reed2: 'עוד קנה',
  stones: 'הפילו את האבנים פנימה', pour: 'הזיזו והטו את המרזב', mouse: 'גררו: הזיזו והטו את המרזב',
  l1: 'החומר זורם למקום הנמוך ומתקשה', l2: 'מעברים צרים: הסדר קובע אם יישאר חלל', l3: 'צמוד לקורה בלי לגלוש, וסביב הקנים בלי לסתום',
  knock: 'המקיש בודק בפטיש עץ', full: 'צליל מלא!', hollow: 'צליל חלול: יש בפנים כיס אוויר', apart: 'הצוות מפרק את המקטע. יוצקים שוב',
  spill: 'גלש מעל הקורה!', reed: 'הקנה נסתם! מחליפים קנה', cauldron: 'קדרה חמה חדשה', three: 'שלושה מקטעים בלי חלל',
});
const MOUSE = (() => { try { return !!(globalThis.matchMedia && matchMedia('(hover: hover) and (pointer: fine)').matches) || !!globalThis.__BOT_MOUSE; } catch (e) { return false; } })();
const GRIP_MIN = 48, HAND_UP = -60, BUZZ_FULL = [8, 4, 16].map((v) => v * 10);   // (the touch's least radius, px; the hint's gesture up, px; the full section's buzz, ms)
const SPILL_MARK = SPILL_SEEN;   // (b131 look round 2: the spec's table — mix over the timber that leaves a stain on the floor is −20; the stain shows from here, so the loss does: no stain without a loss, no loss without a stain)   // (amah³ over the timber before it is a stain that stays: a drop at the edge is not)

export const POUR_ACT = {
  icon: '🔥',
  title: 'היציקה',
  walkLine: (m) => POUR_LINES['w' + ((m && m.lv) || 1)] || POUR_LINES.w1,
  stand(m) { const s = m && m.lv === 3 ? S8.stand.south : S8.stand.pour; return { x: s[0], z: s[1], face: [s[0], s[1] + (s[2] === 'S' ? 4 : -4)] }; },
  prepare() {},
  make(m, X) {
    const lv = (m && m.lv) || 1, L = LEVELS[lv], Mo = X.M, st = Mo.st, THREE = X.THREE, C = cellsOf(lv);
    const kept = (() => { const w = Mo.workOf('pour'); return w && w.lv === lv ? w : null; })();
    const sim = newSim(lv);
    const base = lv === 2 ? S8.top - S8.floor : 0;
    // a side of the segment that lies on the frame or on a set section is that one's board (not drawn twice)
    const fr = frameOf(lv), A = S8.altar, b = S8.sections[lv], on = (v, w) => Math.abs(v - w) < 0.01;
    const sideAt = (lx, lz) => { const [x, , z] = toWorld(lv, lx, 0, lz); return { x, z }; };
    const edge = { far: sideAt(0, -4), near: sideAt(0, 4), left: sideAt(-6, 0), right: sideAt(6, 0) };
    const setSec = (k) => Mo.isDone('pour' + k) ? S8.sections[k] : null;
    const onSet = (p) => [1, 2].some((k) => { const s = setSec(k); return s && p.x >= s[0] - 0.01 && p.x <= s[2] + 0.01 && p.z >= s[1] - 0.01 && p.z <= s[3] + 0.01; });
    const skip = {}; for (const [k, p] of Object.entries(edge)) skip[k] = on(p.z, A[1]) || on(p.z, A[3]) || on(p.x, A[0]) || on(p.x, A[2]) || onSet(p);
    void b; void fr;
    const V = createPourView(X, lv, sim, { base, skipSides: skip });
    const A8 = {
      phase: 'intro', t: 0, phaseT: 0, ev: [], seals: [], knockX: 0, taps: 0, swingT: 0, result: '', regions: null,
      stonesIn: 0, reached: L.targets.map(() => false), dmg: 0, losses: [], patches: 0, spilled: 0, spillQ: 0, spillMarked: 0, stainX: null,
      reedClog: (L.reeds || []).map(() => 0), reedFix: null, setting: false, acc: 0, saveT: 0, frames: [], grab: null, cauldronSeen: 1,
      prep: lv === 1 && !st.pour.prep ? { step: 'joint', reeds: [0, 0] } : null, tw: [], ended: false, hint: 0, cleanFirst: true,
    };
    const ev = (e) => { A8.ev.push(e); if (A8.ev.length > 16) A8.ev.shift(); };
    const later = (secs, fn) => A8.tw.push({ t: 0, dur: secs, fn: null, done: fn });
    const tween = (secs, fn, done) => A8.tw.push({ t: 0, dur: secs, fn, done });
    const wpt = (lx, ly, lz) => { const [x, y, z] = toWorld(lv, lx, ly + (lz > 4.3 ? base : 0), lz); return { x, y, z }; };
    const scr = (p) => X.scr(p.x, p.y, p.z);
    const gripPx = () => Math.max(GRIP_MIN, 0.13 * innerHeight);

    /* ── the camera: the sample's, over the near board (pitch 50°, 21.5 amot; farther on a narrow screen), in the section's frame ── */
    // (b131 look round: the approved sample's view whole — its lens of 31°, its distance at pitch 50° (21.5 + 15/45 × 3.5), its aim; the aim a
    //  little toward the near board, so the cauldron's crew stand above the instruction line, large at the near edge)
    const FOV = 31, AIM_Z = 1.9;
    function camOf() {
      const aspect = innerWidth / Math.max(1, innerHeight), p = 50 * Math.PI / 180; let dist = 21.5 + (50 - 35) / 45 * 3.5; if (aspect < 1.75) dist *= Math.pow(1.75 / aspect, 0.85); dist *= 1.08;   // (a little farther than the sample: the hearth at its left and the stones' heap at its right whole in the frame)
      const e = toWorld(lv, 0, 0.15 + Math.sin(p) * dist, AIM_Z + Math.cos(p) * dist), t = toWorld(lv, 0, 0.15, AIM_Z);
      return { p: e, t };
    }
    const cam0 = X.camera, fov0 = cam0 ? cam0.fov : 50;
    const lens = (f) => { try { if (cam0 && Math.abs(cam0.fov - f) > 0.01) { cam0.fov = f; cam0.updateProjectionMatrix(); } } catch (e) { /* */ } };
    const lensKeep = () => { try { const Lk = X.lookNow ? X.lookNow() : null; if (Lk && (Lk.u > 0.01 || Math.abs(Lk.yaw) > 0.03 || Lk.ov)) return; lens(FOV); } catch (e) { /* */ } };
    const home = (d = 1.0) => { const c = camOf(); X.shot(c.p, c.t, d); };

    /* ── the crew of the work's hands (b131 look round: what the finger does, men do) — the prep's four and the stones' two pairs ── */
    const B8 = createBeat(X), gang = createGang(X), filmMen = new Set();
    const W2 = (lx, lz) => { const [x, , z] = toWorld(lv, lx, 0, lz); return { x, z }; };
    const HEAP = (S8.pourAt && S8.pourAt.heap) || [9.2, 2.4];

    /* ── prep (pour1): the timbers come in; the joint and the two reeds ── */
    const prepG = new THREE.Group(); prepG.name = 'h131-pour-prep'; X.props.root.add(prepG);
    const wood = new THREE.MeshStandardMaterial({ color: 0x8a6036, roughness: 0.85, flatShading: true }), reedM = new THREE.MeshStandardMaterial({ color: 0xb7a76a, roughness: 0.7 });
    const ghostM = new THREE.MeshBasicMaterial({ color: 0xfff2b0, transparent: true, opacity: 0.55, depthWrite: false });
    let timbers = null, peg = null, reedMs = [], ghosts = [];
    function prepBuild() {
      timbers = new THREE.Group(); prepG.add(timbers);
      for (const k of ['E', 'S']) { const w = S8.wood[k], m = new THREE.Mesh(new THREE.BoxGeometry(w[2] - w[0], S8.top - S8.floor, w[3] - w[1]), wood); m.position.set((w[0] + w[2]) / 2, (S8.floor + S8.top) / 2, (w[1] + w[3]) / 2); m.castShadow = true; m.receiveShadow = true; m.userData.k = k; timbers.add(m); }
      const J = S8.wood.joint; peg = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.2, 0.9, 8), wood); peg.position.set(J[0], S8.top + 0.6, J[1]); peg.castShadow = true; prepG.add(peg);
      S8.reeds.forEach(([x, z]) => { const r = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.7, 10, 1, true), reedM); r.position.set(x, S8.floor + 2.6, z); r.visible = false; r.castShadow = true; prepG.add(r); reedMs.push(r); const g = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.05, 16), ghostM); g.position.set(x, S8.floor + 0.04, z); prepG.add(g); ghosts.push(g); });
      // the crew bring the timbers in from outside the frame (a slide), then the witness's place is shown
      // (b131 look round: two men walk each timber in, bent over it, both hands on it; they stay by it, holding it)
      const JW = S8.wood.joint;
      for (const m of timbers.children) {
        const dz = m.userData.k === 'S' ? 1.0 : 0, dx = m.userData.k === 'E' ? 1.0 : 0,   /* (the figure rule: from 2.5 out its men walked in cut by the frame's edge) */ x0 = m.position.x, z0 = m.position.z; m.position.x += dx; m.position.z += dz;
        const men = (m.userData.k === 'E' ? [[JW[0] + 1.3, JW[1] - 4.5], [JW[0] + 1.3, JW[1] - 10.5]] : [[JW[0] - 4.5, JW[1] + 1.4], [JW[0] - 10.5, JW[1] + 1.4]])
          .map(([x, z], c) => { const w = gang.add(x + dx, z + dz, { role: 'push', crew: c, fx: x - (dx ? 3 : 0), fz: z - (dz ? 3 : 0), lean: -0.1 }); if (w) { w.stride = 1; w.rate = 2.2; w.x0 = x; w.z0 = z; } return w; }).filter(Boolean);
        prepMen.push(...men);
        tween(1.6, (u) => { const e = u * u * (3 - 2 * u); m.position.x = x0 + dx * (1 - e); m.position.z = z0 + dz * (1 - e); for (const w of men) { w.a.x = w.x0 + dx * (1 - e); w.a.z = w.z0 + dz * (1 - e); } },
          () => { V.sfx.thud(); X.shake(0.1, 0.18); X.dust(x0, S8.top, z0, 6, 2); for (const w of men) { w.stride = 0; gang.setRole(w, 'brace'); } });
      }
      // the man with the mallet at the joint, the man with the reeds by their places (he plants them where the finger says)
      maul = gang.add(JW[0] + 1.6, JW[1] + 1.5, { role: 'hold', item: 'mallet', crew: 2, fx: JW[0], fz: JW[1] });
      const R0 = S8.reeds[0], R1 = S8.reeds[1];
      reedMan = gang.add((R0[0] + R1[0]) / 2 + 1.2, R0[1] + 1.7, { role: 'hold', item: 'staff', crew: 3, fx: (R0[0] + R1[0]) / 2, fz: R0[1] });
      if (maul) prepMen.push(maul); if (reedMan) prepMen.push(reedMan);
    }
    const prepMen = []; let maul = null, reedMan = null;
    function prepCrewOff() { for (const w of prepMen) gang.remove(w); prepMen.length = 0; maul = reedMan = null; }
    /** the shot that opens the prep: the corner from the north-east, the timbers and their men coming in (low, oblique) */
    function prepWide() { const J = jointAt(); X.shot([J.x + 10, J.y + 9, J.z - 17], [J.x - 3, S8.floor + 1.2, J.z + 0.5], 0.01); }
    const jointAt = () => ({ x: S8.wood.joint[0], y: S8.top + 0.6, z: S8.wood.joint[1] });
    const reedAt = (j) => ({ x: S8.reeds[j][0], y: S8.floor + 0.8, z: S8.reeds[j][1] });
    function prepShot() {
      if (!A8.prep) return;
      // (the figure rule, the run of 18.11: in the close shots of the joint and the reeds the timbers' men were cut by the frame — their
      //  work done, they are out for these steps; the mallet's man and the reeds' man stay)
      for (let i = prepMen.length - 1; i >= 0; i--) { const w = prepMen[i]; if (w !== maul && w !== reedMan) { gang.remove(w); prepMen.splice(i, 1); } }
      if (A8.prep.step === 'joint') { const J = jointAt(); X.shot([J.x + 6.5, J.y + 8, J.z - 12], [J.x - 0.5, S8.floor + 1.3, J.z + 0.8], 1.2); X.line(POUR_LINES.joint, 0); later(1.3, () => X.hand(jointAt(), 0, 14)); }
      else { const R0 = reedAt(0), R1 = reedAt(1), mx = (R0.x + R1.x) / 2, mz = (R0.z + R1.z) / 2; X.shot([mx + 6, S8.floor + 8.5, mz - 11], [mx + 0.3, S8.floor + 1.3, mz + 0.9], 1.2); X.line(POUR_LINES.reeds, 0); const j = A8.prep.reeds[0] ? 1 : 0; later(1.3, () => X.hand(reedAt(j), 0, 14)); }
    }
    function prepTap(p) {
      const P = A8.prep; if (!P || A8.busy) return;
      const near = (q) => { const s = scr(q); return s && s.on !== false && Math.hypot(s.x - p.x, s.y - p.y) < gripPx(); };
      if (P.step === 'joint') {
        if (!near(jointAt())) return;
        A8.busy = 1; X.hand(null); const y0 = peg.position.y;
        if (maul) { gang.setRole(maul, 'hammer'); maul.k = 1; maul.lastU = 0; later(1.1, () => { if (maul) gang.setRole(maul, 'hold'); }); }
        tween(0.35, (u) => { peg.position.y = y0 - 0.55 * u; }, () => { V.sfx.thud(); X.shake(0.14, 0.25); X.dust(peg.position.x, S8.top, peg.position.z, 8, 2); X.quick({ x: jointAt().x - 1.2, y: S8.top + 3.2, z: jointAt().z - 1.4 }, QUICK.corner, peg); ev('joint'); P.step = 'reeds'; A8.busy = 0; later(0.6, prepShot); });
        return;
      }
      const j = [0, 1].find((k) => !P.reeds[k] && near(reedAt(k))); if (j == null) return;
      A8.busy = 1; X.hand(null); const r = reedMs[j]; r.visible = true; ghosts[j].visible = false;
      if (reedMan) { const a = reedMan.a, x0 = a.x, z0 = a.z, tx = S8.reeds[j][0] + 0.2, tz = S8.reeds[j][1] + 1.25; gang.setRole(reedMan, 'kneel'); tween(0.3, (u) => { a.x = x0 + (tx - x0) * u; a.z = z0 + (tz - z0) * u; }, null); later(1.0, () => { if (reedMan) gang.setRole(reedMan, 'hold'); }); }
      tween(0.4, (u) => { r.position.y = S8.floor + 2.6 - 1.75 * u * u; }, () => {
        V.sfx.thud(); X.shake(0.08, 0.15); X.quick({ x: reedAt(j).x - 0.6, y: S8.floor + 3.6, z: reedAt(j).z - 1.6 }, QUICK.corner, r); P.reeds[j] = 1; ev('reed' + j); A8.busy = 0;
        if (P.reeds[0] && P.reeds[1]) { st.pour.prep = 1; X.save(); X.line(LINES.holes, 2600); later(1.8, () => { A8.prep = null; prepG.visible = false; prepCrewOff(); stonesStart(); }); }
        else { X.line(POUR_LINES.reed2, 0); later(0.4, () => X.hand(reedAt(P.reeds[0] ? 1 : 0), 0, 14)); }
      });
    }

    /* ── the stones: two pairs of porters carry each one in from the heap and set it down (b131 look round: by their hands, not from the air) ── */
    const PORT = { pairs: [], jobs: [] };
    // (b131 look round 3: the heap the next two, the porters waiting behind it on the far side, two rows clear of the biggest stone —
    //  standing beside it at the frame's edge they stood in it)
    const PILE = [[0, 1.0], [0.5, -1.9]];
    // (look round 3, the run: on the heap's far side they stood out of the picture — the first pair waits at the heap's two ends along the
    //  board, in the frame; the second comes in from beyond the right edge when it is its turn)
    // (the figure rule, the run of 18.11: the second pair waiting beyond the right edge was cut and hidden at every step — one pair carries,
    //  taken again on its walk back, so a tap is never kept waiting on a second pair)
    const HOME = [[[HEAP[0] - 0.9, HEAP[1] + 3.9], [HEAP[0] + 0.5, HEAP[1] + 3.7]]];   // (a step to the right put the right man out of the frame in pour2)
    const toW = (lx, lz) => W2(lx, lz), HW = W2(HEAP[0], HEAP[1]);
    function heapLay() {
      let k = 0;
      V.stones.forEach((S, i) => {
        if (i < A8.stonesIn) { S.carry = false; return; }
        // (b131 look round 2: a compact heap of the next five in the frame — the rest wait out of the picture and come up as these go)
        S.carry = true; const q = PILE[k]; S.m.visible = !!q; if (q) S.m.position.set(HEAP[0] + q[0], 0, HEAP[1] + q[1]); k++;
      });
    }
    /** the pile once a stone left it: the waiting ones not in anyone's hands, laid on the heap's places again */
    function heapLay2() { let k = 0; V.stones.forEach((S, i) => { if (i < A8.stonesIn || !S.carry) return; const q = PILE[k]; S.m.visible = !!q; if (q) S.m.position.set(HEAP[0] + q[0], 0, HEAP[1] + q[1]); k++; }); }
    function portersMake() {
      if (PORT.pairs.length) return;
      for (let k = 0; k < HOME.length; k++) {
        const men = HOME[k].map(([lx, lz], j) => { const W = toW(lx, lz); const w = gang.add(W.x, W.z, { role: 'hold', crew: k, fx: HW.x, fz: HW.z }); if (w) w.home = [lx, lz]; return w; }).filter(Boolean);
        PORT.pairs.push({ men, job: null });
      }
    }
    function portersOff() { for (const p of PORT.pairs) for (const w of p.men) gang.remove(w); PORT.pairs.length = 0; PORT.jobs.length = 0; }
    const sm = (u) => { u = clamp(u, 0, 1); return u * u * (3 - 2 * u); };
    function placeMan(w, lx, lz, fx, fz) { const W = toW(lx, lz), F = toW(fx, fz); w.a.x = W.x; w.a.z = W.z; w.a.yaw = Math.atan2(F.x - W.x, F.z - W.z); w.fx = F.x; w.fz = F.z; }
    /** every frame: each pair's carry (to the stone, lift, carry, set down) or its walk back to the heap */
    function portersFrame(dt) {
      for (const P of PORT.pairs) {
        const J2 = P.job; if (!J2) continue; J2.t += dt;
        const S = V.stones[J2.i], m2 = S && S.m;
        if (J2.kind === 'back') {
          const u = sm(J2.t / J2.T);
          P.men.forEach((w, j) => { const [hx, hz] = w.home; placeMan(w, J2.p0[j][0] + (hx - J2.p0[j][0]) * u, J2.p0[j][1] + (hz - J2.p0[j][1]) * u, HEAP[0], HEAP[1]); w.stride = u < 1 ? 1 : 0; });
          if (J2.t >= J2.T) { P.job = null; P.men.forEach((w) => { w.stride = 0; gang.setRole(w, 'hold'); }); }
          continue;
        }
        const [ax, az] = J2.from, [bx, bz] = J2.to, T0 = J2.T0 || 0.35, T1 = T0 + 0.2, T2 = T1 + J2.T, T3 = T2 + 0.25;
        const v = J2.t < T1 ? 0 : sm((J2.t - T1) / J2.T), cx = ax + (bx - ax) * v, cz = az + (bz - az) * v;
        const y = J2.t < T0 ? 0 : J2.t < T1 ? 0.55 * sm((J2.t - T0) / (T1 - T0)) : J2.t < T2 ? 0.55 + 0.05 * Math.sin(J2.t * 9) : 0.55 * (1 - sm((J2.t - T2) / (T3 - T2)));
        if (m2) m2.position.set(cx, y, cz);
        const g = J2.g, u0 = sm(J2.t / T0);
        P.men.forEach((w, j) => {
          const sg = j ? 1 : -1, px = cx + J2.n[0] * g * sg, pz = cz + J2.n[1] * g * sg;
          placeMan(w, J2.p0[j][0] + (px - J2.p0[j][0]) * u0, J2.p0[j][1] + (pz - J2.p0[j][1]) * u0, cx, cz);
          w.stride = J2.t < T0 || (J2.t > T1 && J2.t < T2) ? 1 : 0;
        });
        if (J2.t >= T3) {
          if (m2) m2.position.set(S.s.x, 0, S.s.z); S.carry = false; S.fall = -1;
          const s = sim.shapes[J2.i], at = wpt(s.x, 0.6, s.z);
          V.sfx.thud(); X.shake(0.06 + 0.04 * s.h, 0.12 + 0.06 * s.h); X.dust(at.x, S8.floor + 0.2, at.z, 6, 1.5);
          if (s.tint) X.quick(wpt(s.x, 0.7, s.z + 0.3), 'מהבור שלך!', m2); /* (look round 3: on the stone set down, low — high over the far row it landed on the goal pill) */ ev('set' + J2.i);
          A8.busy = 0; keepWork();
          P.job = { kind: 'back', t: 0, T: 1.0, p0: P.men.map((w) => w.pos.slice()) };
          P.men.forEach((w) => { gang.setRole(w, 'hold'); w.rate = 2.4; });
          if (A8.stonesIn >= V.stones.length) later(0.5, pourStart);
          else if (A8.stonesIn === 1) later(0.4, () => { if (A8.phase === 'stones' && !A8.busy) X.hand(nextStoneAt(), 0, 18); });
        }
        P.men.forEach((w, j) => { w.pos = w.pos || [0, 0]; const L2 = toLocal(lv, w.a.x, w.a.z); w.pos[0] = L2[0]; w.pos[1] = L2[1]; void j; });
      }
    }
    const nextStoneAt = () => { const S = V.stones[A8.stonesIn]; return S ? wpt(S.m.position.x, 0.8, S.m.position.z) : wpt(HEAP[0], 0.8, HEAP[1]); };
    function stonesStart() {
      A8.phase = 'stones'; A8.phaseT = 0; home(0.01); X.line(POUR_LINES.stones, 0);   // (b131 look round 2: a cut to the whole section, its heap and its porters — a flight's first frame was bare floor)
      if (A8.stonesIn >= V.stones.length) { pourStart(); return; }
      heapLay(); portersMake();
      later(1.2, () => { if (A8.phase === 'stones') X.hand(nextStoneAt(), 0, 18); });
    }
    function dropNext() {
      if (A8.phase !== 'stones' || A8.busy) return;
      const i = A8.stonesIn; if (i >= V.stones.length) return;
      const P = PORT.pairs.find((q) => !q.job || q.job.kind === 'back');
      const S = V.stones[i];
      if (!P || !P.men.length || !S || !S.carry) { A8.busy = 1; X.hand(null); A8.stonesIn++; if (S) S.carry = false; V.dropStone(i); ev('stone' + i); later(0.46, () => { A8.busy = 0; keepWork(); if (A8.stonesIn >= V.stones.length) later(0.5, pourStart); }); return; }
      A8.busy = 1; X.hand(null); A8.stonesIn++; ev('stone' + i);
      later(0.5, () => { if (A8.phase === 'stones') heapLay2(); });
      const from = [S.m.position.x, S.m.position.z], to = [S.s.x, S.s.z], dx = to[0] - from[0], dz = to[1] - from[1], d = Math.hypot(dx, dz) || 1;
      const p0 = P.men.map((w) => { const L2 = toLocal(lv, w.a.x, w.a.z); return [L2[0], L2[1]]; });
      P.men.forEach((w) => { gang.setRole(w, 'push'); w.lean = -0.25; w.rate = 2.6; });
      const reach = Math.max(...p0.map((q) => Math.hypot(q[0] - from[0], q[1] - from[1])));
      // (the figure rule, the run of 18.11: flanking the stone across its path, the near man of the pair walked between the eye and the
      //  work — the pair flanks it left and right as the shot sees it, never in front of it)
      let nx = -dz / d, nz = dx / d;
      try { const q0 = scr(wpt(from[0], 0.6, from[1])), qx = scr(wpt(from[0] + 1, 0.6, from[1])), qz = scr(wpt(from[0], 0.6, from[1] + 1)), ax = qz.y - q0.y, az = -(qx.y - q0.y), al = Math.hypot(ax, az); if (al > 1e-3) { nx = ax / al; nz = az / al; } } catch (e) { /* (the path's normal) */ }
      P.job = { kind: 'carry', i, t: 0, T0: clamp(reach / 6, 0.35, 1.1), T: clamp(d / 8, 0.8, 1.5), from, to, n: [nx, nz], g: Math.max(S.s.rx, S.s.rz) + 0.5, p0 };
      V.sfx.thud();
    }

    /* ── the pour ── */
    function pourStart() {
      A8.phase = 'pour'; A8.phaseT = 0; home(1.0); portersOff(); for (const S of V.stones) if (S.carry) { S.carry = false; S.m.position.set(S.s.x, 0, S.s.z); }
      X.line(POUR_LINES['l' + lv], 3200); later(3.3, () => { if (A8.phase === 'pour') X.line(MOUSE ? POUR_LINES.mouse : POUR_LINES.pour, 0); });
      V.sfx.start();
      if (!A8.hint) { A8.hint = 1; later(0.8, () => { if (A8.phase === 'pour' && !A8.grab) { const q = wpt(0, 1.2, 4.4); X.hand(q, 0, HAND_UP); } }); }
      keepWork();
    }
    function checkTargets() {
      L.targets.forEach((tg, j) => {
        if (A8.reached[j]) return;
        const i0 = Math.max(0, Math.floor((tg.x - tg.r - X0) / DX)), i1 = Math.min(NX - 1, Math.floor((tg.x + tg.r - X0) / DX)), k0 = Math.max(0, Math.floor((tg.z - tg.r + 4) / DX)), k1 = Math.min(39, Math.floor((tg.z + tg.r + 4) / DX));
        let hit = false; for (let k = k0; k <= k1 && !hit; k++) for (let i = i0; i <= i1; i++) { const c = k * NX + i; if (sim.floor[c] && sim.vol[c] + sim.solid[c] > 0.1) { hit = true; break; } }
        if (!hit) return;
        A8.reached[j] = true; const y = V.surfaceAt(tg.x, tg.z) + 0.3;
        V.ring(tg.x, y, tg.z, 0.9, 0); V.sfx.reach(j); X.quick(wpt(tg.x, 0.6, tg.z + 1.2), tg.word || QUICK.reached);   /* (look round 3: low and a little nearer — a far corner's word stood on the goal pill) */ ev('reach:' + tg.name);
      });
    }
    function onSeal(e) {
      for (const s of A8.seals) if (s.on && Math.hypot(s.x - e.x, s.z - e.z) < 1.3) { s.t = Math.min(s.t, 3); return; }
      let slot = A8.seals.find((s) => !s.on); if (!slot) { if (A8.seals.length < 6) { slot = {}; A8.seals.push(slot); } else slot = A8.seals[0]; }
      Object.assign(slot, { on: true, x: e.x, z: e.z, t: 0 });
      V.sealFx(e); X.shake(0.16, 0.2); try { if (X.haptic) X.haptic(25); } catch (er) { /* */ }
      ev('seal'); keepWork();
    }
    /** what spills or clogs this step (level 3) */
    function edges(dt) {
      if (!L.timber || A8.reedFix) { A8.spillQ = 0; return; }
      const sp = sim.spout, ca = sim.cauldron;
      const where = sp.tilt >= 0.04 && !ca.swapping && !sim.exhausted && !sim.hold ? landing({ spout: { ...sp, q: 1 } }, lv, C) : null;
      if (where === 'timber') {
        // the stream lands on the timber: it runs over it, out of the section onto the floor
        let q = T.QMAX * Math.pow(sp.tilt, T.TILT_POW) * dt; if (q > ca.amount) q = ca.amount;
        ca.amount -= q; ca.poured += q; ca.total += q; A8.spilled += q; A8.spillQ = q / dt; A8.stainX = A8.stainX == null ? sp.lx : A8.stainX + (sp.lx - A8.stainX) * 0.02;
        if (A8.spilled > SPILL_MARK && !A8.spillMarked) {
          A8.spillMarked = 1; const at = wpt(A8.stainX, 0, 4 + 0.36 + 0.9);
          loss('pour.spill', { x: at.x, z: at.z, r: 1.2 }, at); V.word(A8.stainX, 0.8, 5, POUR_LINES.spill, false); V.sfx.splat(); X.shake(0.12, 0.2);
        }
      } else A8.spillQ = 0;
      if (where && where.startsWith('reed:')) {
        const j = +where.slice(5); if (A8.reedClog[j]) return;
        A8.reedClog[j] = 1; V.setReed(j, true); const [rx, rz] = L.reeds[j], at = wpt(rx, 1.8, rz);
        loss('pour.reed', { x: at.x, z: at.z, r: 0.6 }, at); V.word(rx, 2, rz, POUR_LINES.reed, false); V.sfx.knockHollow(); X.shake(0.18, 0.3);
        sim.hold = true; A8.reedFix = { j, t: 0 }; X.line(POUR_LINES.reed, 2600); ev('reed:' + j);
      }
    }
    function reedFixFrame(dt) {
      const F2 = A8.reedFix; if (!F2) return; F2.t += dt;
      if (F2.t > 2.6) { const [rx, rz] = L.reeds[F2.j]; clearAround(sim, rx, rz, 1.3); V.setReed(F2.j, false); A8.reedClog[F2.j] = 0; A8.reedFix = null; sim.hold = false; V.sfx.thud(); X.shake(0.08, 0.12); keepWork(); }
    }
    function loss(flag, atM, at) {
      A8.dmg++; A8.cleanFirst = false; A8.losses.push(flag);
      // (the mark's place as the finale reads it, [x, z]; the region's radius in its n, in tenths of an amah)
      const n = Mo.mark(flag, m.id, [+atM.x.toFixed(2), +atM.z.toFixed(2)], Math.round((atM.r || 1) * 10)); X.loss(n, at, LOSS[flag] ? LOSS[flag][0] : '');
      X.save(); ev('loss:' + flag);
    }
    function startKnock() {
      A8.phase = 'knock'; A8.phaseT = 0; A8.taps = 0; A8.swingT = 0; A8.grab = null; X.hand(null);
      sim.freezeAll(); V.FX.settle = 0;
      A8.regions = sim.markPlugsForHollows(); A8.result = A8.regions.length ? 'hollow' : 'full';
      let kx = 3.2; if (A8.regions.length) { let best = A8.regions[0]; for (const r of A8.regions) if (r.cells > best.cells) best = r; kx = best.plug ? best.plug.x : best.x; }
      A8.knockX = clamp(kx, -5, 5); X.line(POUR_LINES.knock, 0); ev('knock:' + A8.result); keepWork();
    }
    function onTap() {
      A8.taps++; const full = A8.result === 'full';
      if (full) V.sfx.knockFull(); else V.sfx.knockHollow();
      X.shake(0.12, 0.22); try { if (X.haptic) X.haptic(35); } catch (e) { /* */ }
      if (A8.taps < 3) return;
      if (full) {
        A8.phase = 'full'; A8.phaseT = 0; V.sfx.chime(); X.shake(0.45, 0.6); try { if (X.haptic) X.haptic(BUZZ_FULL); } catch (e) { /* */ }
        V.word(0, 0, 0, QUICK.full, true); V.burst(150); X.line(POUR_LINES.full, 2400); ev('full');
        X.quick(wpt(A8.knockX, 1, 2), QUICK.sound);
      } else {
        A8.phase = 'hollow'; A8.phaseT = 0; A8.regions = sim.markPlugsForHollows(); X.line(POUR_LINES.hollow, 2600);
        let best = A8.regions[0]; for (const r of A8.regions) if (r.cells > best.cells) best = r;
        const at = wpt(best.x, 0.9, best.z), r = Math.sqrt(best.cells * DX * DX / Math.PI);
        loss('pour.hollow', { x: at.x, z: at.z, r: +r.toFixed(2) }, at);
        for (const g of A8.regions) { const px = g.plug ? g.plug.x : g.x, pz = g.plug ? g.plug.z : g.z; V.ring(px, V.surfaceAt(px, pz) + 0.1, pz, 1.1, 1); V.ring(px, V.surfaceAt(px, pz) + 0.1, pz, 2.2, 1); }
      }
    }
    function finishTeardown() {
      V.finishTeardown(); sim.clearMix(); A8.patches++; A8.seals.forEach((s) => { s.on = false; }); sim.sealEvents.length = 0;
      A8.reached = L.targets.map(() => false);
      V.sfx.thud(); X.shake(0.1, 0.15); X.line(POUR_LINES.apart, 2400); ev('repour');
      pourStart();
    }
    /** the section done: the gleam runs over it, then the work ends (the points: one grading, 10 / 20 / 40) */
    async function finish() {
      if (A8.ended) return; A8.ended = true;
      const clean = !A8.dmg && sim.cauldron.used <= 2 && A8.patches === 0, pts = grade(A8.dmg, clean), q = qOf(pts);
      st.pour.sections[lv] = { patches: A8.patches, spilled: +A8.spilled.toFixed(2), reeds: A8.losses.filter((f) => f === 'pour.reed').length, used: sim.cauldron.used, clean: clean ? 1 : 0 };
      Mo.keep('pour', null); X.save();
      const three = lv === 3 && [1, 2, 3].every((k) => st.pour.sections[k] && st.pour.sections[k].clean);
      if (three) { try { await X.perfectScreen(POUR_LINES.three); } catch (e) { /* */ } }
      const at = wpt(0, 1.2, 0);
      // (b131 look round 2: the after-film is not an empty section — the cauldron's two and the knocker stand at its near board, low and
      //  oblique from the near side, the set section before them; they leave when the film ends)
      const men = [[-1.7, 5.3, 0], [1.4, 5.5, 1], [3.9, 5.0, 2]].map(([lx, lz, c]) => { const W = W2(lx, lz), F = W2(lx * 0.5, 0); return gang.add(W.x, W.z, { role: 'hold', crew: c, item: c === 2 ? 'mallet' : null, fx: F.x, fz: F.z }); }).filter(Boolean);
      for (const w of men) filmMen.add(w);
      const FE = toWorld(lv, 7.5, 6.2, 16.5), FT = toWorld(lv, 0.5, 0.8, 1.2);
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40 && !three, at, flags: { patches: A8.patches, spilled: +A8.spilled.toFixed(2), losses: A8.losses.slice(), used: sim.cauldron.used, seals: A8.seals.length },
        film: { eye: FE, aim: FT, secs: 2.0, kohen: false, own: () => men.map((w) => w.a), after: () => { for (const w of men) { filmMen.delete(w); gang.remove(w); } } } });
    }
    /** the pour in the save: what stands in the segment (set), the stones in, the losses so far (a reload resumes it) */
    function keepWork() {
      Mo.keep('pour', packWork(sim, { lv, stonesIn: A8.stonesIn, dmg: A8.dmg, losses: A8.losses.slice(), patches: A8.patches, spilled: +A8.spilled.toFixed(3), spillMarked: A8.spillMarked, stainX: A8.stainX, reached: A8.reached.slice() }));
      X.save(); A8.saveT = 0;
    }

    /* ── the frame ── */
    function simFrame(dt) {
      const pourPhase = A8.phase === 'pour', runs = pourPhase || A8.phase === 'knock';
      sim.hold = !pourPhase || !!A8.reedFix;
      A8.acc += dt; let steps = 0;
      const t0 = performance.now();
      while (runs && A8.acc >= STEP && steps < 6) {
        const g = A8.grab, tilt = pourPhase && g ? g.tilt : 0, tt = g ? g.t : sim.spout.t;
        sim.step(STEP, tt, tilt); A8.acc -= STEP; steps++;
        if (pourPhase) edges(STEP);
      }
      if (steps === 6 || !runs) A8.acc = 0;
      A8.simMs = performance.now() - t0;
      if (sim.newCauldron) { sim.newCauldron = false; V.sfx.thud(); X.shake(0.1, 0.14); A8.cauldronSeen++; X.line(POUR_LINES.cauldron, 1600); keepWork(); }
      if (sim.cauldron.swapping > 0 && !A8.wasSwapping) V.sfx.down(); A8.wasSwapping = sim.cauldron.swapping > 0;
      while (sim.sealEvents.length) { const e = sim.sealEvents.shift(); if (pourPhase) onSeal(e); }
      if (A8.frames.length % 30 === 0) for (const s of A8.seals) if (s.on && sim.hollowCells === 0) s.on = false;
      if (pourPhase) {
        if (++A8.tick % 8 === 0) checkTargets();
        const settled = sim.stillTime > 1.0;
        const done = (sim.isFull() && sim.noPourTime > 1.5) || settled && (sim.noPourTime > 4 && sim.hollowCells > 0 || sim.exhausted) || (sim.exhausted && sim.noPourTime > 6);
        sim.setting = done || (sim.setting && sim.spout.q <= 0 && !A8.grab);
        if (sim.setting && A8.tick % 6 === 0 && sim.hotLiquid() === 0) { sim.setting = false; startKnock(); }
        A8.saveT += dt; if (A8.saveT > 4) keepWork();
      }
    }
    A8.tick = 0;
    function update(dt) {
      A8.t += dt; A8.phaseT += dt;
      const f0 = performance.now();
      for (const tw of A8.tw.slice()) { tw.t += dt; const u = clamp(tw.t / tw.dur, 0, 1); if (tw.fn) tw.fn(u); if (u >= 1) { const i = A8.tw.indexOf(tw); if (i >= 0) A8.tw.splice(i, 1); if (tw.done) tw.done(); } }
      simFrame(dt); reedFixFrame(dt);
      try { B8.step(dt); portersFrame(dt); gang.update(dt, B8); lensKeep(); } catch (e) { /* */ }
      if (A8.phase === 'knock') { const S = { phase: 'knock' }; void S; if (A8.knockerThere) { A8.swingT += dt; const tt = A8.swingT - 0.35; if (tt > 0) { const n = Math.floor(tt / 0.62); if (n > A8.taps && A8.taps < 3) onTap(); } } }
      else if (A8.phase === 'hollow') { V.fluidU.uHL.value = A8.phaseT < 2.2 ? 1 : Math.max(0, 1 - (A8.phaseT - 2.2) * 3); if (A8.phaseT > 2.5) { V.fluidU.uHL.value = 0; A8.phase = 'teardown'; A8.phaseT = 0; V.startTeardown(); } }
      else if (A8.phase === 'teardown') { if (A8.phaseT > V.TD_END) finishTeardown(); }
      else if (A8.phase === 'full') { V.fluidU.uGleamPos.value = -9 + A8.phaseT * 9; V.fluidU.uGleam.value = A8.phaseT < 2.4 ? 1.2 : Math.max(0, 1.2 - (A8.phaseT - 2.4)); if (A8.phaseT > 3.2) { A8.phase = 'done'; finish(); } }
      const S = { phase: A8.phase === 'done' ? 'full' : A8.phase, phaseT: A8.phaseT, seals: A8.seals, knockX: A8.knockX, swingT: A8.swingT, stonesIn: A8.phase === 'prep' || A8.phase === 'intro' ? 0 : null, spillQ: A8.spillQ, spilled: A8.spilled, stainX: A8.stainX, crewOn: A8.phase !== 'prep' };
      if (A8.phase === 'stones') S.stonesIn = A8.stonesIn;
      S.reached = A8.reached; if (L.timber && A8.phase === 'pour') S.aimBad = !!landing({ spout: { ...sim.spout, q: 1 } }, lv, C);
      V.frame(dt, S); A8.knockerThere = S.knockerThere;
      // (the probes' frame time: the act's own work each frame — the simulation and the look — and the frame's interval)
      const ms = performance.now() - f0; A8.frames.push(ms); if (A8.frames.length > 240) A8.frames.shift();
    }

    /* ── the fingers: the left thumb on the spout (anywhere: a drag from where it lands); a tap drops a stone or does the prep ── */
    const act = {
      close: true, hintOnce: true,
      begin() {
        POUR3D.act = lv; lens(FOV);
        X.kohen(false);   // (he is not in this work's picture: the crew tilt the cauldron, the knocker tests; the spec's table of figures)
        if (kept) {
          unpackWork(sim, kept); A8.stonesIn = Math.min(V.stones.length, kept.stonesIn | 0); A8.dmg = kept.dmg | 0; A8.losses = (kept.losses || []).slice(); A8.patches = kept.patches | 0;
          A8.spilled = +kept.spilled || 0; A8.spillMarked = kept.spillMarked | 0; A8.stainX = kept.stainX == null ? null : +kept.stainX; if (Array.isArray(kept.reached)) A8.reached = kept.reached.slice(0, L.targets.length);
          A8.prep = null; A8.hint = 1; A8.cleanFirst = !A8.dmg; ev('kept:' + A8.stonesIn);
          if (A8.stonesIn < V.stones.length) stonesStart(); else pourStart();
          return;
        }
        home(0.01);
        if (A8.prep) { A8.phase = 'prep'; prepBuild(); prepWide(); X.line(POUR_LINES.prep, 2200); later(2.4, prepShot); return; }
        prepG.visible = false; heapLay(); portersMake();   // (b131 look round 2: the opening shows the heap, its porters and the cauldron's crew at once)
        X.line(LINES.rambam216, 2600); later(2.2, stonesStart);
      },
      update(dt) { try { update(dt); } catch (e) { if (!A8.errT || A8.t - A8.errT > 5) { A8.errT = A8.t; console.error('[h131] pour', e && e.message, e && e.stack && e.stack.split('\n')[1]); } } },
      down(p) {
        if (A8.phase === 'prep') { prepTap(p); return; }
        if (A8.phase === 'stones') { dropNext(); return; }
        if (A8.phase === 'pour' && !A8.reedFix) { X.hand(null); A8.grab = { id: p.id, sx: p.x, sy: p.y, t0: sim.spout.t, tilt0: 0, t: sim.spout.t, tilt: 0 }; ev('grab'); }
      },
      move(p) {
        const g = A8.grab; if (!g || A8.phase !== 'pour') return;
        g.t = clamp(g.t0 + (p.x - g.sx) / (0.42 * innerWidth), 0, 1);
        g.tilt = clamp(g.tilt0 + (g.sy - p.y) / (0.3 * innerHeight), 0, 1);
      },
      up() { if (A8.grab) { A8.grab = null; ev('let'); } },
      cancel() { A8.grab = null; },
      /** rule 66: the right thumb is the camera's; only a tap on the prep's own mark is the act's at once (a still tap reaches it anyway) */
      wants(p) {
        if (!p) return true;
        if (A8.phase === 'prep' && A8.prep) { const q = A8.prep.step === 'joint' ? [jointAt()] : [0, 1].filter((k) => !A8.prep.reeds[k]).map(reedAt); return q.some((w) => { const s = scr(w); return s && Math.hypot(s.x - p.x, s.y - p.y) < gripPx(); }); }
        return false;
      },
      holds() { return !!A8.grab; },
      at() { return new THREE.Vector3(...toWorld(lv, 0, 1, 0)); },
      end() {
        POUR3D.act = 0; X.hand(null); X.kohen(true); lens(fov0);
        try { for (const w of gang.list.slice()) if (!filmMen.has(w)) gang.remove(w); } catch (e) { /* */ }   // (the after-film's men stay for it)
        if (!A8.ended && A8.phase !== 'done') { try { keepWork(); } catch (e) { /* */ } }
        try { V.dispose(); } catch (e) { /* */ }
        try { X.props.root.remove(prepG); } catch (e) { /* */ }
      },
      dbg() {
        const ca = sim.cauldron, sp = sim.spout, fr2 = A8.frames.slice().sort((a, b2) => a - b2);
        const o = { id: m.id, lv, phase: A8.phase, busy: A8.busy ? 1 : 0, port: PORT.pairs.map((p) => p.men.map((w) => [+w.a.x.toFixed(2), +w.a.z.toFixed(2)])), heap: V.stones.filter((s) => s.carry && s.m.visible).map((s) => [+s.m.position.x.toFixed(2), +s.m.position.z.toFixed(2), +(s.r || s.rx || 0).toFixed(2)]), mouse: MOUSE, t: +A8.t.toFixed(2), ev: A8.ev.slice(-10), stonesIn: A8.stonesIn, nStones: V.stones.length,
          filled: +sim.filledFraction.toFixed(3), hollowCells: sim.hollowCells, missing: sim.missingCells, cauldron: { amount: +(ca.amount / ca.cap).toFixed(3), heat: +ca.heat.toFixed(3), used: ca.used, swapping: ca.swapping > 0 },
          spout: { t: +sp.t.toFixed(3), tilt: +sp.tilt.toFixed(3), q: +sp.q.toFixed(3) }, grab: A8.grab ? { sx: Math.round(A8.grab.sx), sy: Math.round(A8.grab.sy), t0: +A8.grab.t0.toFixed(3), t: +A8.grab.t.toFixed(3), tilt: +A8.grab.tilt.toFixed(3) } : null,
          reached: A8.reached.slice(), seals: A8.seals.filter((s) => s.on).length, result: A8.result, taps: A8.taps, dmg: A8.dmg, losses: A8.losses.slice(), patches: A8.patches, spilled: +A8.spilled.toFixed(3), reedClog: A8.reedClog.slice(), reedFix: !!A8.reedFix,
          noPour: +sim.noPourTime.toFixed(1), still: +sim.stillTime.toFixed(1), setting: sim.setting, exhausted: sim.exhausted,
          frameMs: fr2.length ? { n: fr2.length, p50: +fr2[Math.floor(fr2.length / 2)].toFixed(2), p95: +fr2[Math.floor(fr2.length * 0.95)].toFixed(2), max: +fr2[fr2.length - 1].toFixed(2) } : null, simMs: +(A8.simMs || 0).toFixed(2) };
        // what a watching player sees (the bot's eyes, as the sample's testView): the column with the most open floor still low, the passages
        if (A8.phase === 'pour') o.view = viewOf();
        if (A8.phase === 'stones') o.drop = scr(wpt(0, 1, 0));
        if (A8.phase === 'prep' && A8.prep) { o.prep = A8.prep.step; o.joint = scr(jointAt()); o.reeds = [0, 1].map((k) => (A8.prep.reeds[k] ? null : scr(reedAt(k)))); }
        o.spoutAt = scr(wpt(sp.lx || 0, 1.1, 3.7));
        return o;
      },
    };
    /** the bot's eyes: the low column it can still reach (the sample's restColumn), and the level's passages */
    function viewOf() {
      let best = -1, bx = 0;
      for (let i = 2; i < NX - 2; i++) {
        const x = cellX(i); if (L.reeds && x < L.reeds[1][0] + 0.9) continue;   // (a careful player keeps the stream off the reeds' corner)
        let n = 0; for (let k = 0; k < 40; k++) { const c = k * NX + i; if (sim.floor[c] && sim.reach[c] && sim.ground[c] + sim.solid[c] + sim.vol[c] < T.FULL_LEVEL) n++; }
        if (n > best) { best = n; bx = x; }
      }
      let cornerLow = 0; if (L.reeds) for (let i = 0; i < NX; i++) { const x = cellX(i); if (x > L.reeds[1][0] + 0.9) break; for (let k = 28; k < 34; k++) { const c = k * NX + i; if (sim.floor[c] && sim.ground[c] + sim.solid[c] + sim.vol[c] < T.FULL_LEVEL) cornerLow++; } }
      return { lowX: +bx.toFixed(2), lowN: best, cornerLow };
    }
    void N; void cellZ; void toLocal;
    return act;
  },
};
