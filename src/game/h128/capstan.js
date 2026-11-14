/* ── build 128 ── h128/capstan.js — station 2, "הכננת" (brief §5): the south leaf on the sledge, hauled up the timber ramp to the sill
 * by the capstan inside the Azarah. The left thumb goes round the capstan (a circular drag about the drum on the screen: only the
 * hauling way turns it), the men walk round with the bars; the sledge follows late and heavy; the rope is the gauge (its sag, its hum,
 * its strands). The right thumb taps the wedge man at the sledge when its tail is over a notch and it is nearly still: the wedge drops.
 * The crew tires while they haul and three times faster while they hold a loaded rope with no wedge; on a wedge they rest. At the top
 * the crew stands the door up and hangs it (the big moment), then, short and skippable, the north leaf and the two wickets come up.
 * The dynamics are the model's capStep; everything about the ramp and the capstan is illustration (said in the opening line).
 *   CAPSTAN = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { CAP, NOTCH_D, LINES, QUICK, LOSS, H128, capFresh, capStep, capPts, bandOf, qOf, starsOf, tailX, rampAt } from './model.js';
import { VIS, SH6, mats6, box, rampBuild, sledgeMesh, capstanMesh, leafSlab, own, setBusy, rampY, sledgeAt, clamp, lerp, ease, TAU } from './world.js';
import { createVoices } from './sound128.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { gripR } from '../h109/grips.js';
import { BOOK } from '../world/grid.js';

const S6 = BOOK.s06, RMP = S6.ramp, CPS = S6.capstan, GT = S6.gate, CAM = S6.cam;
const sc = (X, x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y), r.on !== false]; };
const BAR_R = 3.9;   // (the men walk round at the bars' ends)

export const CAPSTAN = {
  icon: '⚙', title: 'הכננת',
  walkLine: () => LINES.capWalk,
  stand() { return { x: CPS[0] - 5, z: CPS[1] + 4, face: [CPS[0], CPS[1]] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, PR = X.props, M = mats6(X), st = X.M.st, V = createVoices(X.sfx);
    own('ramp', 1); own('sledge', 1); own('capstan', 1); setBusy(X, 1);
    const all = [], men = [];
    const A = { phase: 'intro', s: capFresh(), t: 0, rot: 0, turn: 0, acc: 0, fing: null, fAng: 0, fDir: 0, tapQ: 0, events: [], quick: 0, wedgeM: null, splice: 0, breathT: 0, hangT: 0, skip: 0, downs: [] };
    A.s.timber = (st.cap.timber || []).slice();
    const ev = (e) => { A.events.push(e); if (A.events.length > 14) A.events.shift(); };
    // the act's own ramp (a broken timber shows at once), sledge, capstan
    let ramp = rampBuild(X, A.s.timber); all.push(ramp);
    const sled = sledgeMesh(X, true); all.push(sled);
    const cap = capstanMesh(X); all.push(cap);
    const rope1 = PR.rope(10, 0.07), rope2 = PR.rope(26, 0.07);
    const ropeMat = new T.MeshStandardMaterial({ color: '#C9A46A', roughness: 0.95 }); rope1.mesh.material = ropeMat; rope2.mesh.material = ropeMat;
    const knot = new T.Mesh(new T.SphereGeometry(0.16, 8, 6), M.h6rough); knot.visible = false; PR.root.add(knot); all.push(knot);
    // the wedges dropped (a dark block behind the tail at each notch rested on)
    const wedges = [];
    const wedgeAt = (i) => { const x = RMP.notch[i] + 0.35, y = rampY(x) + 0.42; const w = box(X, M.h6rough, x - 0.2, y - 0.14, -1.4, x + 0.2, y + 0.18, 1.4); all.push(w); wedges.push(w); return w; };
    // the four men at the bars, the wedge man beside the sledge
    for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + 0.3, w = SH6.crew.add(CPS[0] + Math.cos(a) * BAR_R, CPS[1] + Math.sin(a) * BAR_R, { role: 'push', crew: 1 + (k % 2) }); if (w) { w.k0 = k; men.push(w); } }
    const wm = SH6.crew.add(tailX(0) + 1.5, RMP.w / 2 + 1.1, { role: 'hold', item: 'mallet', crew: 3 }); if (wm) men.push(wm); A.wedgeM = wm;
    X.kohen(false);
    const ropeAt = new T.Vector3(), roll = new T.Vector3(GT.x[1] + 0.3, GT.sill + 0.65, 0);

    /* ── the screen: the drum, the wedge man ── */
    const drumC = () => sc(X, CPS[0], CPS[2] + 1.6, CPS[1]);
    const drumR = () => { const c = drumC(), e = sc(X, CPS[0] + BAR_R, CPS[2] + 1.6, CPS[1]), e2 = sc(X, CPS[0], CPS[2] + 1.6, CPS[1] + BAR_R); return Math.max(60, Math.hypot(e[0] - c[0], e[1] - c[1]), Math.hypot(e2[0] - c[0], e2[1] - c[1])); };
    const wedgeScr = () => (wm ? sc(X, wm.a.x, wm.a.y + 1.1, wm.a.z) : null);
    const nearDrum = (p) => { const c = drumC(); return Math.hypot(p.x - c[0], p.y - c[1]) < drumR() * 1.35; };
    const nearWedge = (p) => { const q = wedgeScr(); return !!q && Math.hypot(p.x - q[0], p.y - q[1]) < Math.max(44, gripR()); };

    /* ── the fingers: round the drum (only the hauling way: clockwise on the screen), a tap on the wedge man ── */
    const FG = fingers(X, {
      down(f) {
        if (A.phase !== 'haul') return; A.downs.push([Math.round(f.x), Math.round(f.y)]); if (A.downs.length > 6) A.downs.shift();
        if (nearWedge(f)) { f.what = 'wedge'; return; }   // (a press on the wedge man is his; if it goes round, it becomes the drum's)
        if (!A.fing) { const c = drumC(); A.fing = f; f.what = 'drum'; A.fAng = Math.atan2(f.y - c[1], f.x - c[0]); }
      },
      move(f) {
        if (f.what === 'wedge' && f.moved > 16 && !A.fing) { const c0 = drumC(); A.fing = f; f.what = 'drum'; A.fAng = Math.atan2(f.y - c0[1], f.x - c0[0]); return; }
        if (f !== A.fing) return; const c = drumC(), a = Math.atan2(f.y - c[1], f.x - c[0]); let da = a - A.fAng; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
        if (Math.hypot(f.x - c[0], f.y - c[1]) > 18) { A.acc += da; A.fAng = a; }
      },
      up(f) {
        if (f === A.fing) { A.fing = null; return; }
        if (f.what === 'wedge' && f.moved < 16) { A.tapQ = 1; ev('tap'); }
      },
    });

    function place(dt) {
      const s = A.s, P = sled.userData.pose(s.d);
      // the capstan turns with the rope hauled; its men walk round with the bars, bent by their fatigue
      A.rot += (s.u / CAP.TURN) * TAU * dt; cap.userData.rot.rotation.y = -A.rot;
      for (const w of men) {
        if (w === wm) continue;
        const a = -A.rot + w.k0 * Math.PI / 2 + 0.3, x = CPS[0] + Math.cos(a) * BAR_R, z = CPS[1] + Math.sin(a) * BAR_R, a2 = a - 0.25;
        const v = Math.abs(s.u / CAP.TURN) * TAU * BAR_R;
        if (v > 0.05) { w.a.path = [[CPS[0] + Math.cos(a2) * BAR_R, CPS[1] + Math.sin(a2) * BAR_R]]; w.a.pi = 0; w.a.speed = v * (1 - 0.35 * s.F); w.a.walkT0 = undefined; }
        else { w.a.path = null; w.a.x = lerp(w.a.x, x, 0.2); w.a.z = lerp(w.a.z, z, 0.2); w.fx = CPS[0] + Math.cos(a2) * BAR_R; w.fz = CPS[1] + Math.sin(a2) * BAR_R; }
        w.lean = 0.15 + 0.45 * s.F;
      }
      // the wedge man keeps beside the sledge's tail
      if (wm) { const tx = P.t + 1.2, z0 = RMP.w / 2 + 1.1;   // (on the camera's side of the sledge: he is seen)
        if (Math.hypot(wm.a.x - tx, wm.a.z - z0) > 0.4) { wm.a.path = [[tx, z0]]; wm.a.pi = 0; wm.a.speed = Math.max(1.5, Math.abs(s.v) * 1.3 + 0.8); wm.a.walkT0 = undefined; } wm.fx = P.t; wm.fz = 0; }
      // the rope: from the drum to the roller on the sill, then down to the sledge's head; its sag the tension's (slack sags), its colour the wear
      cap.userData.ropeAt(ropeAt);
      const head = { x: P.h - 0.2, y: P.yh + 0.5, z: 0 }, ten = s.ten, sag = clamp(0.9 * (H128.BAND.quiet - ten) / H128.BAND.quiet, 0.02, 0.9), buzz = bandOf(ten) === 'sings' || bandOf(ten) === 'frays' ? Math.sin(A.t * 60) * 0.03 : 0;
      rope1.set({ x: ropeAt.x, y: ropeAt.y, z: ropeAt.z }, { x: roll.x, y: roll.y, z: roll.z }, sag * 0.3 + buzz);
      if (P.h > roll.x + 0.5) rope2.set({ x: roll.x, y: roll.y, z: roll.z }, head, sag + buzz); else rope2.set({ x: roll.x, y: roll.y, z: 0 }, { x: roll.x - 0.01, y: roll.y, z: 0 }, 0);
      ropeMat.color.setRGB(lerp(0.79, 0.93, s.wear), lerp(0.64, 0.86, s.wear), lerp(0.42, 0.7, s.wear));
      knot.visible = A.splice > 0; if (knot.visible) knot.position.set(lerp(roll.x, head.x, 0.35), lerp(roll.y, head.y, 0.35) - sag * 0.6, 0);
    }
    const atS = () => { const P = sledgeAt(A.s.d); return { x: P.mx, y: P.my + 1, z: 0 }; };
    function step(dt) {
      const s = A.s;
      // the finger's turn rate (turns a second, the hauling way only), eased over a short window
      const tr = Math.max(0, A.acc) / TAU / Math.max(dt, 1e-3); A.acc = 0;
      A.turn += (tr - A.turn) * (1 - Math.exp(-dt / 0.12));
      if (!A.fing) A.turn *= Math.exp(-dt / 0.08);
      capStep(s, { turn: A.turn, tap: A.tapQ }, dt); A.tapQ = 0;
      for (const e of s.ev) {
        ev(e.e);
        if (e.e === 'wedge') { wedgeAt(e.notch); V.knock(1); X.play('tap'); const at = { x: RMP.notch[e.notch], y: rampY(RMP.notch[e.notch]) + 0.6, z: 0 }; X.quick(at, QUICK.wedge); X.sparks(at.x, at.y, at.z, 10); if (wm) { wm.a.bowT = 0.6; setTimeout(() => { if (wm.a) wm.a.bowT = 0; }, 400); } }
        if (e.e === 'clack') V.clack();
        if (e.e === 'quiet') { const nx = RMP.notch[e.notch]; X.quick({ x: nx, y: rampY(nx) + 1.2, z: 0 }, QUICK.quiet, rope2.mesh); }
        if (e.e === 'part') {
          V.creak(); X.play('crack'); X.shake(0.3, 0.4); A.splice = 1;
          X.loss(LOSS['cap.timber'][1], atS(), LOSS['cap.timber'][0]);
          setTimeout(() => { try { PR.remove(ramp); const i = all.indexOf(ramp); ramp = rampBuild(X, s.timber); if (i >= 0) all[i] = ramp; else all.push(ramp); } catch (er) { /* */ } }, 900);
          X.line('חוט נקרע: המזחלת החליקה לאחור · הצוות שוזר את החבל', 3600);
        }
        if (e.e === 'letdown') { X.line('הצוות עייף: מורידים את המזחלת לאט אל הטריז האחרון', 3200); V.breath(); }
        if (e.e === 'back') { X.dust(atS().x, atS().y - 0.8, 0, 6, 2); }
        if (e.e === 'top') { finishHaul(); return; }
      }
      // the rope's voice and the crew's breath
      V.hum(A.s.mode === 'haul' && s.wedge === -1 ? 1 : 0.2, s.ten); V.frame();
      if (A.turn > 0.05 && ((A.rot / (TAU / 12)) | 0) !== A.pawl) { A.pawl = (A.rot / (TAU / 12)) | 0; V.pawl(); }
      A.breathT -= dt; if (s.F > 0.6 && A.breathT <= 0) { A.breathT = 2.4 - s.F; V.breath(); }
      if (bandOf(s.ten) === 'frays' && s.wedge === -1 && ((A.t * 4) | 0) !== A.fr) { A.fr = (A.t * 4) | 0; const P = sledgeAt(s.d); X.dust(lerp(roll.x, P.h, 0.4), lerp(roll.y, P.yh, 0.4), 0, 2, 0.5); }
      // the second line, once: the wedge
      if (!A.hint2 && s.d > NOTCH_D[0] - 2.5) { A.hint2 = 1; X.line('כשהזנב מעל שקע והמזחלת כמעט עומדת: הקישו על האיש עם הטריז', 4200); }
    }

    /* ── the top: the crew stands the door up and hangs it on its hinge (the big moment), then the north leaf and the wickets ── */
    function finishHaul() {
      A.phase = 'hang'; A.hangT = 0; V.hum(0); X.hand(null);
      st.cap = { timber: A.s.timber.slice(), rests: A.s.rests.slice(), done: 0 }; X.save();
      X.line('הדלת עברה את הסף: הצוות מעמיד אותה ותולה אותה על הצירים', 3600);
      X.shot(CAM.hang[0], CAM.hang[1], 2.2);
      // the leaf off the sledge: a free slab carried from its lying pose to the south hinge (closed), then opened against the side
      const lf = sled.userData.leaf; if (lf) { lf.updateMatrixWorld(true); const m4 = lf.matrixWorld.clone(); sled.remove(lf); PR.root.add(lf); lf.matrix.copy(m4); lf.matrix.decompose(lf.position, lf.quaternion, lf.scale); A.lf = lf; A.lf0 = { p: lf.position.clone(), q: lf.quaternion.clone() }; }
      const h = GT.hinge.S, q1 = new T.Quaternion().setFromEuler(new T.Euler(0, Math.PI, 0));
      A.lf1 = { p: new T.Vector3(h[0], GT.sill, h[1]), q: q1 };
    }
    function hangFrame(dt) {
      A.hangT += dt; const t = A.hangT, lf = A.lf;
      if (lf && t < 4) { const u = ease(clamp((t - 0.6) / 3.2, 0, 1)); lf.position.lerpVectors(A.lf0.p, A.lf1.p, u); lf.position.y += Math.sin(u * Math.PI) * 2.5; lf.quaternion.slerpQuaternions(A.lf0.q, A.lf1.q, u); if (u > 0.3) sled.visible = false; }
      if (t >= 4 && !A.hung) { A.hung = 1; V.gong(98, false); X.shake(0.25, 0.3); X.sparks(GT.hinge.S[0], GT.sill + 10, GT.hinge.S[1] - 2.5, 30); X.line('הכנף הדרומית תלויה על צירה', 2600); }
      if (lf && t >= 5.2 && t < 6.8) { const u = ease((t - 5.2) / 1.6), q = new T.Quaternion().setFromEuler(new T.Euler(0, Math.PI + u * (Math.PI / 2) * VIS, 0)); lf.quaternion.copy(q); }
      if (t >= 6.8 && A.phase === 'hang') { A.phase = 'bring'; A.bT = 0; bringStart(); }
    }
    function bringStart() {
      X.line('הצוותות מעלים באותה דרך את הכנף הצפונית ואת שני הפשפשים · הקישו לדלג', 0);
      X.shot(CAM.capLift[0], CAM.capLift[1], 1.6);
      const n = leafSlab(X, false, false); n.rotation.z = -Math.PI / 2; PR.root.add(n); all.push(n); A.nl = n;
    }
    function bringFrame(dt) {
      A.bT += dt; const u = clamp(A.bT / 6, 0, 1), d = (NOTCH_D[NOTCH_D.length - 1]) * ease(u), P = sledgeAt(d);
      if (A.nl) { A.nl.position.set(P.h, P.yh + 0.7, -GT.leafW / 2); A.nl.rotation.z = -Math.PI / 2 - P.pitch; }
      if (A.bT >= 7 || A.skip) end1();
    }
    function end1() {
      if (A.phase === 'done') return; A.phase = 'done';
      const s = A.s, pts = capPts(s), q = qOf(pts);
      st.cap = { timber: s.timber.slice(), rests: s.rests.slice(), done: 1 }; X.save();
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags: { 'cap.timber': s.runs, backs: s.backs, frayed: s.frayed }, at: { x: GT.hinge.S[0], y: GT.sill + 6, z: GT.hinge.S[1] } });
    }

    return {
      close: true,
      begin() {
        FG.attach(); X.shot(CAM.capstan[0], CAM.capstan[1], 1.4); place(0);
        X.line('הכננת והכבש: המחשה · סובבו את הכננת באגודל שמאל, עם כיוון השעון', 4200);
        setTimeout(() => { if (A.phase === 'intro') { A.phase = 'haul'; const c = drumC(); void c; X.hand({ x: CPS[0] + 2, y: CPS[2] + 1.6, z: CPS[1] + 2 }, 40, 30); } }, 1500);
      },
      update(dt) {
        A.t += dt;
        try {
          if (A.phase === 'haul') step(dt);
          if (A.phase === 'hang') hangFrame(dt);
          if (A.phase === 'bring') bringFrame(dt);
          if (A.phase !== 'hang' && A.phase !== 'bring' && A.phase !== 'done') place(dt);
          if (A.phase === 'haul' && A.fing && A.turn > 0.1) X.hand(null);
        } catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h128] capstan', e && e.message); } }
      },
      down(p) { if (A.phase === 'bring') { A.skip = 1; return; } FG.down(p); },
      move(p) { FG.move(p); },
      up(p) { FG.up(p); },
      cancel() { A.fing = null; },
      // (rule 66: a right-half touch is the act's only on the wedge man or round the drum; anything else on the right lifts the camera)
      wants(p) { if (A.phase === 'bring') return true; if (A.phase !== 'haul') return false; if (!p) return true; return nearWedge(p) || nearDrum(p); },
      holds() { return false; },
      end() {
        FG.detach(); V.stop();
        for (const o of all) PR.remove(o); rope1.dispose(); rope2.dispose();
        for (const w of men) SH6.crew.remove(w);
        own('ramp', 0); own('sledge', 0); own('capstan', 0); setBusy(X, 0); X.hand(null);
      },
      at() { const P = sledgeAt(A.s.d); return new T.Vector3(P.mx, P.my, 0); },
      dbg() {
        const s = A.s, nx = NOTCH_D.findIndex((nd) => nd > s.d + 0.3);
        return { t: +A.t.toFixed(2), phase: A.phase, hangT: +A.hangT.toFixed(2), bT: +(A.bT || 0).toFixed(2), d: +s.d.toFixed(3), v: +s.v.toFixed(3), u: +s.u.toFixed(3), turn: +A.turn.toFixed(3), ten: +s.ten.toFixed(3), band: bandOf(s.ten), wear: +s.wear.toFixed(3), F: +s.F.toFixed(3),
          wedge: s.wedge, lastWedge: s.lastWedge, rests: s.rests.slice(), mode: s.mode, runs: s.runs, backs: s.backs, frayed: s.frayed, dmg: s.dmg, timber: s.timber.slice(), grace: +s.grace.toFixed(2),
          notchD: NOTCH_D, next: nx, toNext: nx >= 0 ? +(NOTCH_D[nx] - s.d).toFixed(3) : null, end: NOTCH_D[NOTCH_D.length - 1], drum: drumC(), drumR: Math.round(drumR()), wedgeMan: wedgeScr(), grip: Math.round(Math.max(44, gripR())), mouse: MOUSE, ev: A.events.slice(-8), downs: A.downs, nf: FG.n, pts: capPts(s), rough: +rampAt(s.d).rough.toFixed(2), roughAhead: +Math.max(...[0, 1, 2, 3, 4].map((k) => rampAt(s.d + k).rough)).toFixed(2), slope: +rampAt(s.d).slope.toFixed(2) };
      },
    };
  },
};
