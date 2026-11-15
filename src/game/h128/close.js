/* ── build 128 ── h128/close.js — the closing of the gate (brief §8), the stage's last work: the player stands inside the Azarah behind
 * the two open bronze leaves; twenty men, ten to a leaf, shoulder to the bronze. Each thumb drives one leaf: a short push up the screen
 * is a heave (full force while the men are set and leaning, a third while they are still stepping: their feet slip), a pull down and
 * held is the brake (they dig in their heels). The leaf is slow to start and slow to stop; the men's cycle runs faster as the leaf
 * turns faster, so he pushes in the leaf's own rhythm as one pushes a swing. The north hinge is stiffer. Both must meet within 2° of
 * each other and slower than ω_soft ("יחד!"); faster bounces back 12°; twice that dents the bronze (−40). The model: leafStep.
 *   CLOSE = { icon, title, walkLine, stand, prepare, make(m, X) → act }
 */
import { LEAF, leafFresh, leafStep, leafPts, inWindow, LINES, QUICK, LOSS, qOf, starsOf } from './model.js';
import { SH6, leafHung, own, setBusy, clamp, VIS } from './world.js';
import { createVoices } from './sound128.js';
import { fingers, MOUSE } from '../h113/acts.js';
import { BOOK } from '../world/grid.js';

const S6 = BOOK.s06, GT = S6.gate, CAM = S6.cam, CL = S6.close;
const sc = (X, x, y, z) => { const r = X.scr(x, y, z); return [Math.round(r.x), Math.round(r.y), r.on !== false]; };
const KS = ['S', 'N'];   // (the model's leaves: 0 the south, 1 the north)

export const CLOSE = {
  icon: '🚪', title: 'סגירת השער',
  walkLine: () => 'עשרים איש לשתי הכנפיים',
  stand() { return { x: CL.stand[0], z: CL.stand[1], face: [GT.x[1], 0] }; },
  prepare() {},
  make(m, X) {
    const T = X.THREE, st = X.M.st, V = createVoices(X.sfx);
    own('leaves', 1); setBusy(X, 1); X.kohen(false);   // (his place is among the men: the camera looks over them)
    const s = leafFresh(), dent0 = (st.close && st.close.dent) || [0, 0];
    const leaf = { S: leafHung(X, 'S', { phi: 90, dent: dent0[0] }), N: leafHung(X, 'N', { phi: 90, dent: dent0[1], salt: true }) };
    const A = { phase: 'intro', t: 0, ev: [], fing: {}, fv: {}, hv: [0, 0], br: [0, 0], slipLine: 0, winWas: [0, 0], endT: 0 };
    const lift = (u) => { try { if (X.lookLift && !MOUSE) X.lookLift(u); } catch (e) { /* */ } };   // (brief §0.6: both thumbs on the work: the camera a little lifted by the act itself)
    const ev = (e) => { A.ev.push(e); if (A.ev.length > 14) A.ev.shift(); };
    // the twenty men: per leaf two rows of five behind its free half, re-placed each frame as the leaf turns
    const men = { S: [], N: [] };
    for (const k of KS) for (let r = 0; r < 2; r++) for (let j = 0; j < 5; j++) { const w = SH6.crew.add(GT.x[0] + 2, 0, { role: 'push', crew: 1 + ((r + j) % 3) }); if (w) { w.r = r; w.j = j; men[k].push(w); } }
    const ptOf = (k, u, off, phi) => {
      const ps = (phi * VIS * Math.PI) / 180, h = GT.hinge[k], sz = k === 'N' ? 1 : -1;
      const x = h[0] - u * Math.sin(ps), z = h[1] + sz * u * Math.cos(ps), nx = -Math.cos(ps), nz = -sz * Math.sin(ps);
      return [clamp(x + nx * off, GT.x[0] + 0.6, h[0] - 0.4), clamp(z + nz * off, -GT.half + 0.35, GT.half - 0.35), x, z];
    };
    function place(dt) {
      for (const k of KS) {
        const i = KS.indexOf(k), phi = s.f[i]; leaf[k].userData.set(phi * VIS);
        const lean = inWindow(s.ph[i]) ? 1 : 0, step = s.ph[i] > LEAF.WIN[1] ? (s.ph[i] - LEAF.WIN[1]) / (1 - LEAF.WIN[1]) : 0;
        for (const w of men[k]) {
          const u = 2.2 + w.j * 0.66, off = 0.55 + w.r * 0.7 + (lean ? -0.08 : 0.12 * (1 - step)), [x, z, lx, lz] = ptOf(k, u, off, phi);
          w.a.path = null; w.a.x += (x - w.a.x) * Math.min(1, dt * 8); w.a.z += (z - w.a.z) * Math.min(1, dt * 8); w.fx = lx; w.fz = lz;
          w.lean = lean ? 0.55 : 0.15;
        }
      }
    }
    const leafScr = (k) => { const i = KS.indexOf(k), [, , x, z] = ptOf(k, 3.4, 0, s.f[i]); return sc(X, x, GT.sill + 3.5, z); };
    const leftKey = () => { const a = sc(X, GT.hinge.S[0] - 2, GT.sill + 4, GT.hinge.S[1]), b = sc(X, GT.hinge.N[0] - 2, GT.sill + 4, GT.hinge.N[1]); return a[0] < b[0] ? 'S' : 'N'; };
    const FG = fingers(X, {
      down(f) {
        if (A.phase !== 'push') return;
        const lk = leftKey(), want = f.x < innerWidth / 2 ? lk : (lk === 'S' ? 'N' : 'S');
        const taken = Object.values(A.fing); const k = taken.includes(want) ? (want === 'S' ? 'N' : 'S') : want;
        if (taken.includes(k)) return;
        A.fing[f.id] = k; f.leaf = k; f.t0 = A.t; f.heaved = 0; A.fv[f.id] = 0;
      },
      move(f) {
        if (!f.leaf) return; const i = KS.indexOf(f.leaf), dy = f.y - f.y0;
        if (Math.abs(dy) >= 12 && Math.abs(dy) > Math.abs(f.x - f.x0)) A.fv[f.id] = 1;   // (up or down: the men's work; sideways, two fingers closing, is the pinch's)
        if (!f.heaved && dy <= -28 && A.t - f.t0 <= 0.7) { f.heaved = 1; A.hv[i] = 1; }
        A.br[i] = dy >= 22 && !f.heaved ? 1 : 0;
      },
      up(f) { if (!f.leaf) return; A.br[KS.indexOf(f.leaf)] = 0; delete A.fing[f.id]; delete A.fv[f.id]; },
    });
    const atMid = () => ({ x: GT.hinge.S[0] - 0.4, y: GT.sill + 10, z: 0 });
    function frame(dt) {
      const hv = A.hv.slice(); A.hv = [0, 0];
      leafStep(s, { heave: hv.map(Boolean), brake: A.br.map(Boolean) }, dt);
      for (let i = 0; i < 2; i++) { const w = inWindow(s.ph[i]); if (w && !A.winWas[i]) V.tick(); A.winWas[i] = w; }
      V.grind(A.br.some(Boolean) && (Math.abs(s.w[0]) + Math.abs(s.w[1])) > 0.3 ? 0.4 : 0);
      for (const e of s.ev) {
        const k = e.k != null ? KS[e.k] : null; ev(e.e + (k ? ':' + k : ''));
        if (e.e === 'heave') V.knock(0.45);
        if (e.e === 'slip') { const w = men[k][2]; if (w) X.dust(w.a.x, GT.sill + 0.1, w.a.z, 5, 1); if (!A.slipLine) { A.slipLine = 1; X.line('הרגליים החליקו: דחפו כשהאנשים נשענים אל הנחושת, לא כשהם צועדים', 3800); } }
        if (e.e === 'bounce') { V.gong(73, true); X.shake(0.12, 0.2); X.line('הכנף הגיעה מהר מדי וחזרה לאחור: בסוף, עצרו מעט (משיכה למטה)', 3800); }
        if (e.e === 'dent') { V.gong(73, true); X.play('crack'); X.shake(0.3, 0.4); X.loss(LOSS['close.dent'][1], atMid(), LOSS['close.dent'][0]); }
        if (e.e === 'wait') X.line('הכנף מחכה לחברתה, סמוך לסף', 2400);
        if (e.e === 'together' || e.e === 'meet') met(e.e === 'together');
      }
    }
    function met(together) {
      A.phase = 'met'; V.grind(0); lift(0); for (const k of KS) leaf[k].userData.set(0);
      st.close = { dent: s.dent.slice() }; X.save();
      V.gong(55, false); setTimeout(() => V.knock(2.6), 500);
      if (together && !s.dmg) { X.perfect(QUICK.together, atMid()); }
      else X.sparks(atMid().x, atMid().y, 0, 14);
      X.shot(CAM.close[0], CAM.close[1], 0.5);
      setTimeout(() => end1(), 2600);
    }
    function end1() {
      if (A.phase === 'done') return; A.phase = 'done';
      const pts = leafPts(s), q = qOf(pts);
      X.end({ stars: starsOf(q), q, pts, perfect: pts >= 40, flags: { 'close.dent': s.dmg, bounces: s.bounces, waited: s.waited, slips: s.slips.slice() }, at: atMid() });
    }
    return {
      close: true,
      begin() {
        FG.attach(); X.shot(CAM.close[0], CAM.close[1], 1.4); place(1);
        X.line(LINES.twenty, 5200);
        setTimeout(() => { if (A.phase === 'push') X.line(MOUSE ? 'כנף אחת בכל פעם: גרירה קצרה למעלה דוחפת, משיכה למטה בולמת · דחפו כשהאנשים נשענים' : 'אגודל לכל כנף: גרירה קצרה למעלה דוחפת, משיכה למטה ומחזיקים בולמת · דחפו כשהאנשים נשענים, בקצב של הכנף', 6000); }, 5300);
        setTimeout(() => { if (A.phase === 'intro') { A.phase = 'push'; lift(0.22); const q = { x: GT.hinge.S[0] - 3, y: GT.sill + 3, z: 2.5 }; X.hand(q, 0, -40); } }, 1500);
      },
      update(dt) {
        A.t += dt;
        try { V.frame(); if (A.phase === 'push') { if (Object.keys(A.fing).length) X.hand(null); frame(dt); } if (A.phase !== 'done') place(dt); }
        catch (e) { if (!A.errT || A.t - A.errT > 5) { A.errT = A.t; console.error('[h128] close', e && e.message); } }
      },
      down(p) { FG.down(p); }, move(p) { FG.move(p); }, up(p) { FG.up(p); },
      cancel() { A.fing = {}; A.fv = {}; A.br = [0, 0]; },
      // (rule 66: the right thumb drives the right leaf; it lifts the camera only from the screen's top band, away from the work)
      wants(p) { if (!p) return true; return A.phase === 'push' && p.y > innerHeight * 0.22; },
      holds() { return Object.values(A.fv).some(Boolean); },   // (a thumb that has pushed or braked holds its leaf: two fingers that only slide toward each other are a pinch)
      end() {
        lift(0); FG.detach(); V.stop(); X.hand(null);
        for (const k of KS) { X.props.remove(leaf[k]); for (const w of men[k]) SH6.crew.remove(w); }
        own('leaves', 0); setBusy(X, 0);
      },
      at() { return new T.Vector3(GT.hinge.S[0] - 2, GT.sill + 8, 0); },
      dbg() {
        return { t: +A.t.toFixed(2), phase: A.phase, f: s.f.map((v) => +v.toFixed(2)), w: s.w.map((v) => +v.toFixed(2)), ph: s.ph.map((v) => +v.toFixed(3)), inWin: s.ph.map(inWindow), win: LEAF.WIN, soft: LEAF.SOFT, dentV: LEAF.DENT, meet: LEAF.MEET,
          heaves: s.heaves, slips: s.slips, bounces: s.bounces, dent: s.dent, dmg: s.dmg, wait: s.wait, br: A.br.slice(), leaf: { S: leafScr('S'), N: leafScr('N') }, left: leftKey(), keys: KS, mouse: MOUSE, ev: A.ev.slice(-8), nf: FG.n, pts: leafPts(s) };
      },
    };
  },
};
