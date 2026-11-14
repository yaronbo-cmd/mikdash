/* ── build 128 ── h128/wicket.js — station 4, "הפשפשים" (brief §7): the two wickets of the gate house's west face, seen close from
 * inside the Azarah. Each wicket has two ring handles: the left turns the upper bolt (into the lintel), the right the lower (into the
 * sill); the two bolts are geared by teeth and move only together: the left thumb turns its ring with the clock, the right thumb its
 * ring against it (circular drags round each ring on the screen). Past tol the teeth do not mesh: the leading ring goes no further, it
 * shakes, a squeal sounds; forced 0.8 s a tooth bends (−20, and that bolt squeals for good). wicketN: the plate is off (the gear is
 * seen), tol 14°; wicketS: the plate on, tol 10°, the lower bolt dry (stuck at 40%: rock both rings back 15° and forward three times);
 * wickets: both wickets, one per thumb (a mason follows each one's second ring), north two turns, south three, locked in the same
 * moment. The lock's mechanism is illustration (said on the opening line). The model: boltStep, pairStep.
 *   BOLT = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { BOLT_LV, boltFresh, boltStep, boltPts, pairFresh, pairStep, pairPts, travelOf, LINES, QUICK, LOSS, qOf, starsOf } from './model.js';
import { SH6, wicketMesh, own, setBusy, clamp, TAU } from './world.js';
import { createVoices } from './sound128.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { gripR } from '../h109/grips.js';
import { BOOK } from '../world/grid.js';

const S6 = BOOK.s06, WK = S6.wicket, CAM = S6.cam;
const sc = (X, v) => { const r = X.scr(v.x, v.y, v.z); return [Math.round(r.x), Math.round(r.y), r.on !== false]; };
const DEG = 180 / Math.PI;
const sideOf = (m) => (m.id === 'wicketS' ? 'S' : 'N');

export const BOLT = {
  icon: '🔩', title: 'הפשפשים',
  walkLine: (m) => (m && m.id === 'wickets' ? 'שני הפשפשים יחד' : m && m.id === 'wicketS' ? 'הפשפש הדרומי' : 'הפשפש הצפוני'),
  stand(m) {
    const s = m && m.id === 'wickets' ? WK.standBoth : WK['stand' + sideOf(m || {})];
    return { x: s[0], z: s[1], face: [WK.N[0], s[1]] };
  },
  prepare() {},
  make(m, X) {
    const T = X.THREE, st = X.M.st, V = createVoices(X.sfx), pair = m.id === 'wickets';
    const sides = pair ? ['N', 'S'] : [sideOf(m)];
    for (const k of sides) own('w' + k, 1);
    setBusy(X, 1); X.kohen(false);   // (his stand is between the camera and the wicket)
    const A = { phase: 'intro', t: 0, ev: [], fing: {}, acc: {}, sq: 0, tickA: 0, alone: 0 };
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 14) A.ev.shift(); };
    // the wickets as they stand: open (the crews opened them again for the joint test), the plate on the south one, a bent tooth kept
    const W = {}; for (const k of sides) W[k] = wicketMesh(X, k, { plate: k === 'S' || (pair && true), tooth: st.bolts[k].tooth, locked: false });
    const mason = [];
    if (pair) for (const k of sides) { const w = SH6.crew.add(WK[k][0] - 0.7, WK[k][1] + (k === 'N' ? -1.9 : 1.9), { role: 'hold', crew: 2, fx: WK[k][0], fz: WK[k][1] }); if (w) mason.push(w); }   // (beside his wicket, on its outer side: never in front of it)
    const s = pair ? pairFresh({ mouse: MOUSE }) : boltFresh(m.id);
    const L = BOLT_LV[m.id];
    // the screen centres the circular drags go round: a single wicket's two rings; in the pair each wicket's left ring
    const v3 = new T.Vector3();
    const ringScr = (k, side) => sc(X, W[k].userData.ringAt(side, v3));
    const centres = () => (pair ? { N: ringScr('N', 'L'), S: ringScr('S', 'L') } : { L: ringScr(sides[0], 'L'), R: ringScr(sides[0], 'R') });
    const FG = fingers(X, {
      down(f) {
        if (A.phase !== 'turn') return;
        const C = centres(), keys = Object.keys(C), taken = Object.values(A.fing);
        let best = null, bd = 1e9; for (const k of keys) { if (taken.includes(k)) continue; const d = Math.hypot(f.x - C[k][0], f.y - C[k][1]); if (d < bd) { bd = d; best = k; } }
        if (!best) return; A.fing[f.id] = best; f.ring = best; f.ang = Math.atan2(f.y - C[best][1], f.x - C[best][0]);
      },
      move(f) {
        if (!f.ring) return; const c = centres()[f.ring]; if (!c) return;
        const a = Math.atan2(f.y - c[1], f.x - c[0]); let da = a - f.ang; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
        if (Math.hypot(f.x - c[0], f.y - c[1]) < 14) return;
        f.ang = a; A.acc[f.ring] = (A.acc[f.ring] || 0) + da * DEG;   // (+ with the clock on the screen)
      },
      up(f) { if (f.ring) delete A.fing[f.id]; },
    });
    const at0 = () => { const k = sides[0]; return { x: WK[k][0] - 0.6, y: WK[k][2] + WK.h * 0.6, z: WK[k][1] }; };
    function single(dt) {
      // left ring with the clock (+), right ring against it (− on the screen is +)
      const da = A.acc.L || 0, db = -(A.acc.R || 0); A.acc = {};
      boltStep(s, { da, db }, dt);
      const k = sides[0], U = W[k].userData, lead = s.blk ? (s.a > s.b ? 'L' : 'R') : null;
      U.set(s.a, s.b, travelOf(s));
      for (const side of ['L', 'R']) { const r = side === 'L' ? U.ringL : U.ringR; r.position.z = (side === 'L' ? -0.55 : 0.55) + (lead === side ? Math.sin(A.t * 70) * 0.03 : 0); }
      const bent = s.tooth[0] || s.tooth[1] || (st.bolts[k].tooth || []).some(Boolean);
      V.squeal(s.blk ? 1 : bent && (da || db) ? 0.35 : 0);
      const m10 = (Math.min(s.a, s.b) / 30) | 0; if (m10 !== A.tickA) { A.tickA = m10; V.tick(); }
      for (const e of s.ev) {
        ev(e.e);
        if (e.e === 'squeal') { try { if (X.haptic) X.haptic(10); } catch (er) { /* */ } }
        if (e.e === 'tooth') { X.play('crack'); X.shake(0.15, 0.25); X.loss(LOSS['bolt.tooth'][1], at0(), LOSS['bolt.tooth'][0]); }
        if (e.e === 'stick') { V.knock(0.7); X.line('הבריח התחתון יבש ונתקע: סובבו את שתי הטבעות 15° אחורה ושוב קדימה, שלוש פעמים', 5200); }
        if (e.e === 'rock') { V.grind(0.6); setTimeout(() => V.grind(0), 120); if (e.n < 3) X.line(`נדנוד ${e.n} מתוך 3`, 1600); }
        if (e.e === 'free') { V.mallet(false); X.line('הבריח השתחרר', 1800); }
        if (e.e === 'locked') locked();
      }
    }
    function both(dt) {
      const dN = A.acc.N || 0, dS = A.acc.S || 0; A.acc = {};
      pairStep(s, { dN, dS }, dt);
      for (const k of ['N', 'S']) { const i = k === 'N' ? 0 : 1, w = s.w[i]; W[k].userData.set(w, w, w / s.END[i]); }
      const m30 = ((s.w[0] + s.w[1]) / 30) | 0; if (m30 !== A.tickA) { A.tickA = m30; V.tick(); }
      for (const e of s.ev) {
        ev(e.e + (e.k != null ? ':' + e.k : ''));
        if (e.e === 'knock') V.knock(e.k ? 1.4 : 1.7);
        if (e.e === 'alone') X.line('רק פשפש אחד ננעל: סובבו אותו רבע סיבוב אחורה, והביאו את שניהם יחד', 4200);
        if (e.e === 'open') V.clack();
        if (e.e === 'together') { V.knock(2.2); setTimeout(() => V.gong(110, false), 60); locked(); }
      }
    }
    function locked() {
      A.phase = 'locked'; V.squeal(0);
      if (!pair) st.bolts[sides[0]].tooth = s.tooth.slice();
      X.save();
      const at = pair ? { x: WK.N[0] - 0.6, y: WK.N[2] + WK.h * 0.6, z: 0 } : at0();
      if (pair) { X.shot(CAM.wickets[0], CAM.wickets[1], 0.6); X.perfect(QUICK.locked, at); }
      else { V.knock(2); if (!s.dmg) X.quick(at, QUICK.locked, W[sides[0]].userData.up); }
      setTimeout(() => end1(), pair ? 2600 : 1500);
    }
    function end1() {
      if (A.phase === 'done') return; A.phase = 'done';
      const pts = pair ? pairPts(s) : boltPts(s), q = qOf(pts);
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags: pair ? { tries: s.tries, together: s.together } : { 'bolt.tooth': s.dmg, blkMax: +s.blkMax.toFixed(2) }, at: pair ? null : at0() });
    }
    return {
      close: true,
      begin() {
        FG.attach();
        const c = CAM[m.id]; X.shot(c[0], c[1], 1.3);
        const how = pair ? 'שני הפשפשים יחד: כל אגודל מסובב פשפש אחד, עם כיוון השעון · הצפוני שני סיבובים, הדרומי שלושה · שניהם צריכים להינעל באותו רגע'
          : m.id === 'wicketS' ? 'הלוח סגור: רק הצליל והרעד אומרים מתי השיניים אינן משלבות'
            : MOUSE ? 'טבעת אחת בכל פעם, בצעדים קטנים: השמאלית עם כיוון השעון, הימנית נגדו · הבנאי מחזיק את השנייה'
              : 'סובבו את הטבעת השמאלית עם כיוון השעון באגודל שמאל, ואת הימנית נגדו באגודל ימין · יחד: השיניים משלבות';
        if (m.id === 'wicketN') { X.line(LINES.wickets + ' · מנגנון הבריחים: המחשה', 4200); setTimeout(() => { if (A.phase === 'turn') X.line(how, 5200); }, 4300); }
        else X.line(how, 5200);
        setTimeout(() => { if (A.phase === 'intro') { A.phase = 'turn'; const k = sides[0]; X.hand({ x: WK[k][0] - 0.6, y: WK[k][2] + WK.h * 0.52, z: WK[k][1] - (pair ? 0 : 0.55) }, 30, 30); } }, 1300);
      },
      update(dt) {
        A.t += dt;
        try { V.frame(); if (A.phase === 'turn') { if (Object.keys(A.fing).length) X.hand(null); if (pair) both(dt); else single(dt); } }
        catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h128] wicket', e && e.message); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.fing = {}; },
      // (rule 66: on the right a touch is the act's only near a ring; elsewhere the right thumb lifts the camera)
      wants(p) { if (!p) return true; if (A.phase !== 'turn') return false; const C = centres(), r = Math.max(130, gripR() * 1.5); return Object.values(C).some((c) => Math.hypot(p.x - c[0], p.y - c[1]) < r); },
      holds() { return Object.keys(A.fing).length > 0; },
      end() {
        FG.detach(); V.stop(); X.hand(null);
        for (const k of sides) { X.props.remove(W[k]); own('w' + k, 0); }
        for (const w of mason) SH6.crew.remove(w);
        setBusy(X, 0);
      },
      at() { const k = pair ? 'N' : sides[0]; return new T.Vector3(WK[k][0], WK[k][2] + WK.h / 2, pair ? 0 : WK[k][1]); },
      dbg() {
        const C = centres(), o = { t: +A.t.toFixed(2), phase: A.phase, id: m.id, pair, mouse: MOUSE, ev: A.ev.slice(-8), nf: FG.n, c: C };
        if (pair) Object.assign(o, { w: s.w.map((v) => +v.toFixed(1)), END: s.END, lock: s.lock, tries: s.tries, together: s.together, first: s.first, win: s.mouse ? L.TOG_MOUSE : L.TOG, last: L.LAST, back: L.BACK, pts: pairPts(s) });
        else Object.assign(o, { a: +s.a.toFixed(2), b: +s.b.toFixed(2), END: s.END, tol: s.tol, blk: s.blk, blkT: +s.blkT.toFixed(2), blkMax: +s.blkMax.toFixed(2), tooth: s.tooth, dmg: s.dmg, dry: s.dry, dryAt: L.DRY_AT ? L.DRY_AT * s.END : null, rock: L.ROCK || null, travel: +travelOf(s).toFixed(3), pts: boltPts(s) });
        return o;
      },
    };
  },
};
void clamp;
